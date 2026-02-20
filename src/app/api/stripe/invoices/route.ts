import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

import type { InvoiceItem } from "@/types";

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
  const { data } = await supabase
    .from("stripe_customers")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .single();

  customerId = data?.stripe_customer_id ?? null;

  // Fallback: find Stripe customer by email if not in our DB (e.g. paid before we stored mapping)
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
    return NextResponse.json({ invoices: [], balance: null });
  }

  try {
    const [customer, { data: invoices }] = await Promise.all([
      stripe.customers.retrieve(customerId),
      stripe.invoices.list({
        customer: customerId,
        limit: 12,
        status: "paid",
      }),
    ]);

    const balance =
      customer && !("deleted" in customer) ? customer.balance ?? 0 : null;

    const items: InvoiceItem[] = invoices.map((inv): InvoiceItem => ({
      id: inv.id,
      date: inv.created ? new Date(inv.created * 1000).toISOString().split("T")[0] : "",
      amount: (inv.amount_paid ?? 0) / 100,
      currency: (inv.currency ?? "usd").toUpperCase(),
      status: inv.status ?? "paid",
      description: inv.lines?.data?.[0]?.description ?? "PropEdge Premium",
    }));

    return NextResponse.json({ invoices: items, balance });
  } catch (e) {
    console.error("Stripe invoices error:", e);
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 });
  }
}
