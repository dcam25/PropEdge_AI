import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const debug = new URL(req.url).searchParams.get("debug") === "1";

  let balance: number | null = null;
  let subscription: { currentPeriodEnd: string | null; status: string } | null = null;
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
        const sessions = await stripe.checkout.sessions.list({ limit: 100 });
        const match = sessions.data.find(
          (s) => s.metadata?.user_id === user.id && s.customer
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

  const { error: delErr } = await supabase
    .from("invoices")
    .delete()
    .eq("user_id", user.id)
    .like("stripe_invoice_id", "balance_%");
  if (delErr) console.error("Delete balance_ invoices:", delErr);

  let { data: invoices } = await supabase
    .from("invoices")
    .select("stripe_invoice_id, amount_cents, currency, status, description, invoice_date")
    .eq("user_id", user.id)
    .order("invoice_date", { ascending: false })
    .limit(24);

  // Backfill balance credits: if webhook missed crediting balance_credit sessions, credit them now.
  if (customerId && process.env.STRIPE_SECRET_KEY) {
    try {
      const { data: sessions } = await stripe.checkout.sessions.list({
        customer: customerId,
        limit: 50,
      });
      const balanceCreditSessions = sessions.filter(
        (s) => s.status === "complete" && s.metadata?.type === "balance_credit" && (s.amount_total ?? 0) > 0
      );
      if (balanceCreditSessions.length > 0) {
        const { data: balanceTxns } = await stripe.customers.listBalanceTransactions(customerId, { limit: 100 });
        const creditedSessionIds = new Set(
          balanceTxns.flatMap((t) => (t.metadata?.checkout_session_id ? [t.metadata.checkout_session_id] : []))
        );
        const nowSec = Math.floor(Date.now() / 1000);
        for (const sess of balanceCreditSessions) {
          // Skip sessions created in the last 90 seconds — webhook may not have run yet.
          if (sess.created && nowSec - sess.created < 90) continue;
          if (sess.id && !creditedSessionIds.has(sess.id)) {
            const amountCents = parseInt(sess.metadata?.amount_cents ?? "0", 10) || (sess.amount_total ?? 0);
            if (amountCents > 0) {
              try {
                await stripe.customers.createBalanceTransaction(customerId, {
                  amount: -amountCents,
                  currency: "usd",
                  description: "Account credit (backfill)",
                  metadata: { checkout_session_id: sess.id },
                });
                creditedSessionIds.add(sess.id);
              } catch (e) {
                console.error("Balance credit backfill error:", e);
              }
            }
          }
        }
      }
    } catch {
      // ignore backfill errors
    }
  }

  const adminSupabase = createAdminClient();
  const upsertInvoiceToDb = async (inv: Stripe.Invoice) => {
    const amountPaid = inv.amount_paid ?? 0;
    const refunded = inv.post_payment_credit_notes_amount ?? 0;
    if (refunded >= amountPaid) {
      await adminSupabase.from("invoices").delete().eq("stripe_invoice_id", inv.id).eq("user_id", user.id);
      return;
    }
    const description = inv.lines?.data?.[0]?.description ?? "PropEdge Premium";
    const { error } = await adminSupabase.from("invoices").upsert(
      {
        stripe_invoice_id: inv.id,
        user_id: user.id,
        amount_cents: amountPaid - refunded,
        currency: (inv.currency ?? "usd").toLowerCase(),
        status: inv.status ?? "paid",
        description,
        invoice_date: inv.created ? new Date(inv.created * 1000).toISOString() : null,
      },
      { onConflict: "stripe_invoice_id" }
    );
    if (error) console.error("Invoice upsert error:", error);
  };

  if (customerId && process.env.STRIPE_SECRET_KEY) {
    try {
      const upsertInvoice = upsertInvoiceToDb;

      let invoiceIds = new Set<string>();
      const stripeInvoicesList = await stripe.invoices.list({
        customer: customerId,
        limit: 100,
        status: "paid",
      });
      for (const inv of stripeInvoicesList.data) {
        await upsertInvoice(inv);
        invoiceIds.add(inv.id);
      }

      // Fallback: list by subscription when customer list returns empty (e.g. deleted customer)
      if (stripeInvoicesList.data.length === 0) {
        const { data: subs } = await stripe.subscriptions.list({
          customer: customerId,
          limit: 10,
        });
        for (const sub of subs ?? []) {
          const { data: subInvoices } = await stripe.invoices.list({
            subscription: sub.id,
            limit: 100,
            status: "paid",
          });
          for (const inv of subInvoices ?? []) {
            if (!invoiceIds.has(inv.id)) {
              await upsertInvoice(inv);
              invoiceIds.add(inv.id);
            }
          }
        }
      }

      // Fallback: find subscription from checkout sessions when customerId may be wrong
      if (invoiceIds.size === 0) {
        const { data: sessions } = await stripe.checkout.sessions.list({
          limit: 100,
        });
        for (const s of sessions ?? []) {
          if (s.metadata?.user_id !== user.id || !s.subscription) continue;
          const subId = typeof s.subscription === "string" ? s.subscription : s.subscription?.id;
          if (!subId) continue;
          const { data: subInvoices } = await stripe.invoices.list({
            subscription: subId,
            limit: 100,
            status: "paid",
          });
          for (const inv of subInvoices ?? []) {
            if (!invoiceIds.has(inv.id)) {
              await upsertInvoice(inv);
              invoiceIds.add(inv.id);
            }
          }
        }
      }

      const { data: refetched } = await supabase
        .from("invoices")
        .select("stripe_invoice_id, amount_cents, currency, status, description, invoice_date")
        .eq("user_id", user.id)
        .order("invoice_date", { ascending: false })
        .limit(24);
      invoices = refetched;
    } catch (e) {
      console.error("Invoice sync error:", e);
    }
  }

  // When we have no customerId or no invoices yet, try checkout sessions and subscription search
  if ((!customerId || (invoices ?? []).length === 0) && process.env.STRIPE_SECRET_KEY) {
    try {
      const subIdsToTry: string[] = [];

      // 1. Find subscription from checkout sessions
      const { data: sessions } = await stripe.checkout.sessions.list({ limit: 100 });
      for (const s of sessions ?? []) {
        if (s.metadata?.user_id === user.id && s.subscription && s.status === "complete") {
          const subId = typeof s.subscription === "string" ? s.subscription : s.subscription?.id;
          if (subId) subIdsToTry.push(subId);
        }
      }

      // 2. Search subscriptions by metadata.user_id (finds sub even without session)
      try {
        const { data: searchSubs } = await stripe.subscriptions.search({
          query: `metadata['user_id']:'${user.id}'`,
          limit: 10,
        });
        for (const sub of searchSubs ?? []) {
          if (sub.id && !subIdsToTry.includes(sub.id)) subIdsToTry.push(sub.id);
        }
      } catch {
        // search may not be available in all Stripe versions
      }

      // 3. List all subscriptions and filter by metadata (fallback when search returns 0)
      if (subIdsToTry.length === 0) {
        const { data: allSubs } = await stripe.subscriptions.list({
          limit: 100,
          status: "all",
        });
        for (const sub of allSubs ?? []) {
          if (sub.metadata?.user_id === user.id && sub.id && !subIdsToTry.includes(sub.id)) {
            subIdsToTry.push(sub.id);
          }
        }
      }

      for (const subId of subIdsToTry) {
        const { data: subInvoices } = await stripe.invoices.list({
          subscription: subId,
          limit: 100,
          status: "paid",
        });
        for (const inv of subInvoices ?? []) {
          await upsertInvoiceToDb(inv);
        }
      }

      if (subIdsToTry.length > 0) {
        const { data: refetched } = await supabase
          .from("invoices")
          .select("stripe_invoice_id, amount_cents, currency, status, description, invoice_date")
          .eq("user_id", user.id)
          .order("invoice_date", { ascending: false })
          .limit(24);
        invoices = refetched;
      }
    } catch (e) {
      console.error("Invoice sync from sessions error:", e);
    }
  }

  // If customer exists in Stripe but was deleted, preserve balance from it, then create new for future ops.
  let balanceFromDeleted: number | null = null;
  if (customerId && process.env.STRIPE_SECRET_KEY) {
    try {
      const customer = await stripe.customers.retrieve(customerId);
      if (customer && "deleted" in customer && customer.deleted) {
        balanceFromDeleted =
          (customer as unknown as { balance?: number }).balance ?? 0;
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
      try {
        const newCustomer = await stripe.customers.create({
          email: user.email ?? undefined,
          metadata: { supabase_user_id: user.id },
        });
        await supabase.from("stripe_customers").upsert(
          { user_id: user.id, stripe_customer_id: newCustomer.id },
          { onConflict: "user_id" }
        );
        customerId = newCustomer.id;
      } catch {
        customerId = null;
      }
    }
  }

  if (customerId && process.env.STRIPE_SECRET_KEY) {
    try {
      const customer = await stripe.customers.retrieve(customerId);
      if (customer && !("deleted" in customer)) {
        balance = customer.balance ?? 0;
      }
      if (balanceFromDeleted !== null) {
        balance = balanceFromDeleted;
      }

      const { data: subs } = await stripe.subscriptions.list({
        customer: customerId,
        status: "active",
        limit: 1,
      });
      const sub = subs[0];
      subscription = sub
        ? {
            currentPeriodEnd: sub.current_period_end
              ? new Date(sub.current_period_end * 1000).toISOString().split("T")[0]
              : null,
            status: sub.status ?? "active",
          }
        : null;
      const now = Math.floor(Date.now() / 1000);
      const hasActivePremium =
        sub &&
        sub.current_period_end != null &&
        sub.current_period_end > now &&
        (sub.items?.data?.[0]?.price?.unit_amount ?? 0) >= 1999;
      // Only update is_premium when we have subscription info. Don't overwrite to false when
      // there's no subscription — user may have purchased Premium via balance (no subscription).
      if (sub !== undefined) {
        await supabase
          .from("profiles")
          .update({
            is_premium: !!hasActivePremium,
            subscription_amount_cents: hasActivePremium ? sub!.items?.data?.[0]?.price?.unit_amount ?? null : null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);
      }
    } catch {
      // ignore
    }
  }

  // Build transactions from Stripe balance transactions (credit/debit history)
  const transactions: { id: string; date: string; dateTime: string; amount: number; currency: string; type: "credit" | "debit"; description: string }[] = [];
  if (customerId && process.env.STRIPE_SECRET_KEY) {
    try {
      const { data: balanceTxns } = await stripe.customers.listBalanceTransactions(customerId, { limit: 50 });
      for (const t of balanceTxns ?? []) {
        const amountCents = t.amount;
        const amountDollars = Math.abs(amountCents) / 100;
        const type: "credit" | "debit" = amountCents < 0 ? "credit" : "debit";
        const dateTime = t.created ? new Date(t.created * 1000).toISOString() : "";
        const dateStr = dateTime ? dateTime.split("T")[0] : "";
        transactions.push({
          id: t.id,
          date: dateStr,
          dateTime,
          amount: amountDollars,
          currency: (t.currency ?? "usd").toUpperCase(),
          type,
          description: t.description ?? (type === "credit" ? "Account credit" : "Charge"),
        });
      }
      transactions.sort((a, b) => (b.dateTime || b.date).localeCompare(a.dateTime || a.date));
    } catch {
      // ignore
    }
  }

  const res: { transactions: typeof transactions; balance: number | null; subscription: typeof subscription; debug?: object } = {
    transactions,
    balance,
    subscription,
  };
  if (debug && process.env.STRIPE_SECRET_KEY) {
    const debugInfo: Record<string, unknown> = {
      customerId,
      userId: user.id,
      transactionCount: transactions.length,
      stripeConfigured: true,
    };
    try {
      if (customerId) {
        const directInvoices = await stripe.invoices.list({
          customer: customerId,
          limit: 10,
        });
        debugInfo.stripeInvoicesByCustomer = directInvoices.data.length;

        const { data: subs } = await stripe.subscriptions.list({
          customer: customerId,
          limit: 10,
        });
        debugInfo.subscriptionCount = subs?.length ?? 0;
        debugInfo.subscriptionIds = subs?.map((s) => s.id) ?? [];
      }

      const { data: sessions } = await stripe.checkout.sessions.list({ limit: 100 });
      const matchingSessions = sessions?.filter((s) => s.metadata?.user_id === user.id) ?? [];
      debugInfo.matchingSessions = matchingSessions.length;
      debugInfo.sessionsWithSub = matchingSessions.filter((s) => s.subscription).length;

      try {
        const searchResult = await stripe.subscriptions.search({
          query: `metadata['user_id']:'${user.id}'`,
          limit: 5,
        });
        debugInfo.subscriptionSearchCount = searchResult.data?.length ?? 0;
      } catch (e) {
        debugInfo.subscriptionSearchError = e instanceof Error ? e.message : String(e);
      }
    } catch (e) {
      debugInfo.stripeError = e instanceof Error ? e.message : String(e);
    }
    res.debug = debugInfo;
  }
  return NextResponse.json(res);
}
