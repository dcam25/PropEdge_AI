import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook secret not set" }, { status: 500 });
  }

  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Invalid signature" },
      { status: 400 }
    );
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  async function getUserIdFromCustomer(customerId: string): Promise<string | null> {
    const { data } = await supabase
      .from("stripe_customers")
      .select("user_id")
      .eq("stripe_customer_id", customerId)
      .single();
    return data?.user_id ?? null;
  }

  async function getUserIdFromSubscription(sub: Stripe.Subscription): Promise<string | null> {
    let userId = sub.metadata?.user_id ?? null;
    if (!userId && sub.customer) {
      const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
      const { data } = await supabase
        .from("stripe_customers")
        .select("user_id")
        .eq("stripe_customer_id", customerId)
        .single();
      userId = data?.user_id ?? null;
    }
    return userId;
  }

  if (event.type === "customer.subscription.created" || event.type === "customer.subscription.updated") {
    const sub = event.data.object as Stripe.Subscription;
    const userId = await getUserIdFromSubscription(sub);
    if (userId && sub.status === "active") {
      let amountCents: number | null = null;
      const item = sub.items?.data?.[0];
      if (item?.price?.unit_amount) {
        amountCents = item.price.unit_amount;
      }
      await supabase
        .from("profiles")
        .update({
          is_premium: true,
          subscription_amount_cents: amountCents,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);
    }
  }

  if (event.type === "checkout.session.completed") {
    let session = event.data.object as Stripe.Checkout.Session;
    if (!session.metadata?.type && session.id) {
      try {
        session = await stripe.checkout.sessions.retrieve(session.id);
      } catch {
        // ignore
      }
    }
    const customerId = session.customer
      ? typeof session.customer === "string"
        ? session.customer
        : session.customer.id
      : null;
    const userId = (session.metadata?.user_id as string) ?? (customerId ? await getUserIdFromCustomer(customerId) : null);

    // Always upsert stripe_customers when we have customer + userId (subscription or balance_credit).
    // This fixes "stripe_customer not found" when checkout API's insert failed or webhook runs first.
    if (customerId && userId) {
      await supabase.from("stripe_customers").upsert(
        { user_id: userId, stripe_customer_id: customerId },
        { onConflict: "user_id" }
      );
    }

    if (session.metadata?.type === "balance_credit" && customerId) {
      const amountCents = parseInt(session.metadata?.amount_cents ?? "0", 10) || (session.amount_total ?? 0);
      if (amountCents > 0) {
        try {
          await stripe.customers.createBalanceTransaction(customerId, {
            amount: -amountCents,
            currency: "usd",
            description: "Account credit",
            metadata: { checkout_session_id: session.id },
          });
        } catch (e) {
          console.error("Failed to credit customer balance:", e);
        }
        // Do not insert into invoices - balance credits are not invoices.
        // Balance is shown from Stripe customer.balance in the profile.
      }
    }
  }

  if (event.type === "invoice.paid") {
    const inv = event.data.object as Stripe.Invoice;
    const customerId = typeof inv.customer === "string" ? inv.customer : inv.customer?.id;
    if (!customerId) return NextResponse.json({ received: true });
    let userId = await getUserIdFromCustomer(customerId);
    if (!userId) {
      try {
        const customer = await stripe.customers.retrieve(customerId);
        if (customer && !("deleted" in customer) && customer.metadata?.supabase_user_id) {
          userId = customer.metadata.supabase_user_id;
          await supabase.from("stripe_customers").upsert(
            { user_id: userId, stripe_customer_id: customerId },
            { onConflict: "user_id" }
          );
        }
      } catch {
        // ignore
      }
    }
    if (!userId && inv.subscription) {
      try {
        const subId = typeof inv.subscription === "string" ? inv.subscription : inv.subscription?.id;
        if (subId) {
          const sub = await stripe.subscriptions.retrieve(subId);
          const subUserId = sub.metadata?.user_id as string | undefined;
          if (subUserId) {
            userId = subUserId;
            await supabase.from("stripe_customers").upsert(
              { user_id: userId, stripe_customer_id: customerId },
              { onConflict: "user_id" }
            );
          }
        }
      } catch {
        // ignore
      }
    }
    if (!userId) return NextResponse.json({ received: true });
    const description = inv.lines?.data?.[0]?.description ?? "PropEdge Premium";
    await supabase.from("invoices").upsert(
      {
        stripe_invoice_id: inv.id,
        user_id: userId,
        amount_cents: inv.amount_paid ?? 0,
        currency: (inv.currency ?? "usd").toLowerCase(),
        status: inv.status ?? "paid",
        description,
        invoice_date: inv.created ? new Date(inv.created * 1000).toISOString() : null,
      },
      { onConflict: "stripe_invoice_id" }
    );
  }

  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;
    const userId = await getUserIdFromSubscription(sub);
    if (userId) {
      await supabase
        .from("profiles")
        .update({
          is_premium: false,
          subscription_amount_cents: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);
    }
  }

  return NextResponse.json({ received: true });
}
