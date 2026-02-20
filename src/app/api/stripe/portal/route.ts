import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

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
    const sessions = await stripe.checkout.sessions.list({ limit: 100 }).catch(() => ({ data: [] }));
    const match = sessions.data.find((s) => s.metadata?.user_id === user.id && s.customer);
    if (match) {
      customerId = typeof match.customer === "string" ? match.customer : match.customer?.id ?? null;
      if (customerId) {
        await supabase.from("stripe_customers").upsert(
          { user_id: user.id, stripe_customer_id: customerId },
          { onConflict: "user_id" }
        );
      }
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
  }

  if (!customerId) {
    return NextResponse.json(
      { error: "No billing account found" },
      { status: 400 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const returnUrl = body.return_url ?? "/plan";

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${req.nextUrl.origin}${returnUrl.startsWith("/") ? returnUrl : `/${returnUrl}`}`,
  });

  return NextResponse.json({ url: session.url });
}
