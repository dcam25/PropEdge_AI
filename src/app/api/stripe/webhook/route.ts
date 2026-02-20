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
    if (session.metadata?.type === "balance_credit" && session.customer) {
      const customerId = typeof session.customer === "string" ? session.customer : session.customer.id;
      const userId = (session.metadata?.user_id as string) ?? (await getUserIdFromCustomer(customerId));

      if (userId) {
        await supabase.from("stripe_customers").upsert(
          { user_id: userId, stripe_customer_id: customerId },
          { onConflict: "user_id" }
        );
      }

      const amountCents = parseInt(session.metadata?.amount_cents ?? "0", 10) || (session.amount_total ?? 0);
      if (amountCents > 0) {
        let txnId: string | null = null;
        try {
          const txn = await stripe.customers.createBalanceTransaction(customerId, {
            amount: -amountCents,
            currency: "usd",
            description: "Account credit",
          });
          txnId = txn.id;
        } catch (e) {
          console.error("Failed to credit customer balance:", e);
        }
        if (userId) {
          const invoiceId = txnId ? `balance_${txnId}` : `balance_${session.id}`;
          await supabase.from("invoices").upsert(
            {
              stripe_invoice_id: invoiceId,
              user_id: userId,
              amount_cents: amountCents,
              currency: "usd",
              status: "paid",
              description: "Account credit",
              invoice_date: new Date().toISOString(),
            },
            { onConflict: "stripe_invoice_id" }
          );
        }
      }
    }
  }

  if (event.type === "invoice.paid") {
    const inv = event.data.object as Stripe.Invoice;
    const customerId = typeof inv.customer === "string" ? inv.customer : inv.customer?.id;
    if (!customerId) return NextResponse.json({ received: true });
    const userId = await getUserIdFromCustomer(customerId);
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
