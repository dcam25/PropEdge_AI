import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET() {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let customerId: string | null = null;
  const { data: cust } = await supabase
    .from("stripe_customers")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .single();

  customerId = cust?.stripe_customer_id ?? null;

  // Fallback: find Stripe customer by email or checkout sessions
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

  // If customer was deleted in Stripe, create new and update.
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
      customerId = null;
    }
  }

  if (!customerId) {
    return NextResponse.json({ subscription: null });
  }

  try {
    const { data: subs } = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    const sub = subs[0];
    if (!sub) return NextResponse.json({ subscription: null });

    return NextResponse.json({
      subscription: {
        currentPeriodEnd: sub.current_period_end
          ? new Date(sub.current_period_end * 1000).toISOString().split("T")[0]
          : null,
        status: sub.status,
      },
    });
  } catch (e) {
    console.error("Stripe subscription error:", e);
    return NextResponse.json({ error: "Failed to fetch subscription" }, { status: 500 });
  }
}
