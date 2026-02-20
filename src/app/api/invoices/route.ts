import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let balance: number | null = null;
  let customerId: string | null = null;

  const { data: sc } = await supabase
    .from("stripe_customers")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .single();
  customerId = sc?.stripe_customer_id ?? null;

  if (!customerId && process.env.STRIPE_SECRET_KEY) {
    try {
      if (user.email) {
        const customers = await stripe.customers.list({
          email: user.email,
          limit: 1,
        });
        if (customers.data[0]) {
          customerId = customers.data[0].id;
        }
      }
      if (!customerId) {
        const searchRes = await stripe.customers.search({
          query: `metadata['supabase_user_id']:'${user.id}'`,
          limit: 1,
        });
        if (searchRes.data[0]) {
          customerId = searchRes.data[0].id;
        }
      }
      if (!customerId) {
        const sessions = await stripe.checkout.sessions.list({ limit: 20 });
        const match = sessions.data.find(
          (s) => s.metadata?.user_id === user.id && s.metadata?.type === "balance_credit" && s.customer
        );
        if (match) {
          customerId = typeof match.customer === "string" ? match.customer : match.customer?.id ?? null;
        }
      }
      if (customerId) {
        await supabase.from("stripe_customers").upsert(
          { user_id: user.id, stripe_customer_id: customerId },
          { onConflict: "user_id" }
        );
      }
    } catch {
      // ignore
    }
  }

  let { data: invoices } = await supabase
    .from("invoices")
    .select("stripe_invoice_id, amount_cents, currency, status, description, invoice_date")
    .eq("user_id", user.id)
    .order("invoice_date", { ascending: false })
    .limit(24);

  if (customerId && process.env.STRIPE_SECRET_KEY) {
    try {
      const stripeInvoicesList = await stripe.invoices.list({
        customer: customerId,
        limit: 24,
        status: "paid",
      });
      for (const inv of stripeInvoicesList.data) {
        const description = inv.lines?.data?.[0]?.description ?? "PropEdge Premium";
        const { error } = await supabase.from("invoices").upsert(
          {
            stripe_invoice_id: inv.id,
            user_id: user.id,
            amount_cents: inv.amount_paid ?? 0,
            currency: (inv.currency ?? "usd").toLowerCase(),
            status: inv.status ?? "paid",
            description,
            invoice_date: inv.created ? new Date(inv.created * 1000).toISOString() : null,
          },
          { onConflict: "stripe_invoice_id" }
        );
        if (error) console.error("Invoice upsert error:", error);
      }

      const balanceTxnsRes = await stripe.customers.listBalanceTransactions(customerId, { limit: 24 });
      for (const txn of balanceTxnsRes.data ?? []) {
        if (txn.amount < 0) {
          const amountCents = Math.abs(txn.amount);
          const { error } = await supabase.from("invoices").upsert(
            {
              stripe_invoice_id: `balance_${txn.id}`,
              user_id: user.id,
              amount_cents: amountCents,
              currency: (txn.currency ?? "usd").toLowerCase(),
              status: "paid",
              description: txn.description ?? "Account credit",
              invoice_date: txn.created ? new Date(txn.created * 1000).toISOString() : null,
            },
            { onConflict: "stripe_invoice_id" }
          );
          if (error) console.error("Balance invoice upsert error:", error);
        }
      }
      const { data: refetched } = await supabase
        .from("invoices")
        .select("stripe_invoice_id, amount_cents, currency, status, description, invoice_date")
        .eq("user_id", user.id)
        .order("invoice_date", { ascending: false })
        .limit(24);
      invoices = refetched;
    } catch {
      // ignore backfill errors
    }
  }

  if (customerId && process.env.STRIPE_SECRET_KEY) {
    try {
      const customer = await stripe.customers.retrieve(customerId);
      if (customer && !("deleted" in customer)) {
        balance = customer.balance ?? 0;
      }
    } catch {
      // ignore
    }
  }

  const byKey = new Map<
    string,
    { id: string; date: string; dateTime: string; amount: number; currency: string; status: string; description: string }
  >();
  for (const inv of invoices ?? []) {
    const dateStr = inv.invoice_date ? inv.invoice_date.split("T")[0] : "";
    const dateTime = inv.invoice_date ?? "";
    const amount = inv.amount_cents / 100;
    const key = `${amount}-${dateStr}`;
    const preferThis = !inv.stripe_invoice_id.startsWith("balance_cs_");
    const current = byKey.get(key);
    if (!current || (preferThis && current.id.startsWith("balance_cs_"))) {
      byKey.set(key, {
        id: inv.stripe_invoice_id,
        date: dateStr,
        dateTime,
        amount,
        currency: (inv.currency ?? "usd").toUpperCase(),
        status: inv.status ?? "paid",
        description: inv.description ?? "PropEdge Premium",
      });
    }
  }
  const items = Array.from(byKey.values()).sort(
    (a, b) => (b.dateTime || b.date).localeCompare(a.dateTime || a.date)
  );

  return NextResponse.json({ invoices: items, balance });
}
