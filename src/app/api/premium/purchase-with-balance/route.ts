import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const PREMIUM_AMOUNT_CENTS = 1999; // $19.99

export async function POST() {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data: sc } = await supabase
      .from("stripe_customers")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single();

    const customerId = sc?.stripe_customer_id;
    if (!customerId) {
      return NextResponse.json({ error: "No payment method on file. Add balance first." }, { status: 400 });
    }

    const customer = await stripe.customers.retrieve(customerId);
    if (customer.deleted) {
      return NextResponse.json({ error: "Customer not found" }, { status: 400 });
    }

    const balance = customer.balance ?? 0;
    if (balance > -PREMIUM_AMOUNT_CENTS) {
      return NextResponse.json(
        { error: `Insufficient balance. Need $${(PREMIUM_AMOUNT_CENTS / 100).toFixed(2)}. Add balance first.` },
        { status: 400 }
      );
    }

    const txn = await stripe.customers.createBalanceTransaction(customerId, {
      amount: PREMIUM_AMOUNT_CENTS,
      currency: "usd",
      description: "1 x PropEdge Premium",
    });

    const { error: invError } = await supabase.from("invoices").insert({
      stripe_invoice_id: `balance_${txn.id}`,
      user_id: user.id,
      amount_cents: PREMIUM_AMOUNT_CENTS,
      currency: "usd",
      status: "paid",
      description: "1 x PropEdge Premium",
      invoice_date: new Date().toISOString(),
    });

    if (invError) {
      console.error("Invoice insert error:", invError);
      return NextResponse.json({ error: "Failed to save invoice" }, { status: 500 });
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        is_premium: true,
        subscription_amount_cents: PREMIUM_AMOUNT_CENTS,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (profileError) {
      console.error("Profile update error:", profileError);
      return NextResponse.json({ error: "Failed to upgrade" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Purchase with balance error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Purchase failed" },
      { status: 500 }
    );
  }
}
