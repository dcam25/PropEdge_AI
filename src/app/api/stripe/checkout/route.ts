import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const PREMIUM_CURRENCY = "usd";
const MIN_CENTS = 1000; // $10 minimum
const DEFAULT_CENTS = 1999; // $19.99 default

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "Stripe not configured" },
      { status: 500 }
    );
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const url = new URL(req.url);
    const amountParam = url.searchParams.get("amount");
    let amountCents = DEFAULT_CENTS;
    if (amountParam) {
      const parsed = Math.round(parseFloat(amountParam) * 100);
      if (!Number.isNaN(parsed) && parsed >= MIN_CENTS) {
        amountCents = parsed;
      }
    }

    const { data: existing } = await supabase
      .from("stripe_customers")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single();

    let customerId = existing?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;
      await supabase.from("stripe_customers").insert({
        user_id: user.id,
        stripe_customer_id: customerId,
      });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [
        {
          price_data: {
            currency: PREMIUM_CURRENCY,
            product_data: {
              name: "PropEdge Premium",
              description: "Unlimited AI insights · Up to 10 models · Full backtesting",
            },
            unit_amount: amountCents,
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      success_url: `${req.nextUrl.origin}/profile?tab=plan&success=1`,
      cancel_url: `${req.nextUrl.origin}/plan`,
      metadata: { user_id: user.id },
      subscription_data: {
        metadata: { user_id: user.id },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("Stripe checkout error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Checkout failed" },
      { status: 500 }
    );
  }
}
