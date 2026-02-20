import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const MIN_CENTS = 1000; // $10 minimum

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { amount?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const amountDollars = typeof body.amount === "number" ? body.amount : 10;
  const amountCents = Math.round(amountDollars * 100);

  if (amountCents < MIN_CENTS) {
    return NextResponse.json(
      { error: `Minimum charge is $${MIN_CENTS / 100}` },
      { status: 400 }
    );
  }

  let customerId: string | null = null;
  const { data } = await supabase
    .from("stripe_customers")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .single();

  customerId = data?.stripe_customer_id ?? null;

  if (!customerId && user.email) {
    try {
      const { data: customers } = await stripe.customers.list({
        email: user.email,
        limit: 1,
      });
      if (customers[0]) {
        customerId = customers[0].id;
        await supabase.from("stripe_customers").upsert(
          { user_id: user.id, stripe_customer_id: customerId },
          { onConflict: "user_id" }
        );
      }
    } catch {
      // ignore
    }
  }

  if (!customerId) {
    try {
      const { data: sessions } = await stripe.checkout.sessions.list({ limit: 100 });
      const match = sessions.find((s) => s.metadata?.user_id === user.id && s.customer);
      if (match) {
        customerId = typeof match.customer === "string" ? match.customer : match.customer?.id ?? null;
        if (customerId) {
          await supabase.from("stripe_customers").upsert(
            { user_id: user.id, stripe_customer_id: customerId },
            { onConflict: "user_id" }
          );
        }
      }
    } catch {
      // ignore
    }
  }

  // If customer was deleted in Stripe (transactions exist but no active customer), create new.
  if (customerId) {
    try {
      const customer = await stripe.customers.retrieve(customerId);
      if (customer && "deleted" in customer && customer.deleted) {
        const newCustomer = await stripe.customers.create({
          email: user.email ?? undefined,
          metadata: { supabase_user_id: user.id },
        });
        await supabase.from("stripe_customers").upsert(
          { user_id: user.id, stripe_customer_id: newCustomer.id },
          { onConflict: "user_id" }
        );
        customerId = newCustomer.id;
      }
    } catch {
      const newCustomer = await stripe.customers.create({
        email: user.email ?? undefined,
        metadata: { supabase_user_id: user.id },
      });
      customerId = newCustomer.id;
      await supabase.from("stripe_customers").upsert(
        { user_id: user.id, stripe_customer_id: customerId },
        { onConflict: "user_id" }
      );
    }
  }

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email ?? undefined,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;
    const { error } = await supabase.from("stripe_customers").upsert(
      { user_id: user.id, stripe_customer_id: customerId },
      { onConflict: "user_id" }
    );
    if (error) {
      console.error("Failed to save stripe_customers:", error);
    }
  }

  try {
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Account credit",
              description: `Add $${(amountCents / 100).toFixed(2)} to your account balance`,
            },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      success_url: `${req.nextUrl.origin}/profile?tab=balance&success=1`,
      cancel_url: `${req.nextUrl.origin}/profile?tab=balance`,
      metadata: {
        user_id: user.id,
        type: "balance_credit",
        amount_cents: String(amountCents),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("Stripe charge-balance error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Charge failed" },
      { status: 500 }
    );
  }
}
