"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { PREMIUM_PRICE, PREMIUM_PERIOD } from "@/lib/prices";

const FREE_FEATURES = [
  "5 AI Insights per day",
  "1 custom model",
  "Basic backtesting",
  "All sports props",
];

const PREMIUM_FEATURES = [
  "Unlimited AI Insights",
  "Up to 10 custom models",
  "Full backtesting",
  "Priority support",
];

export default function PlanPage() {
  const router = useRouter();
  const { user, profile } = useAuth();

  const isFree = !profile?.is_premium;
  const isPremium = !!profile?.is_premium;

  function handleUpgrade() {
    if (!user) {
      window.location.href = "/login?redirect=/plan";
      return;
    }
    router.push("/profile?tab=plan");
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-16">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-zinc-100">Plans</h1>
        <p className="mt-2 text-zinc-500">One plan. Full access.</p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        <Card className={isFree ? "ring-1 ring-emerald-500/30" : ""}>
          <CardHeader className="relative">
            {isFree && (
              <span className="absolute right-4 top-4 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                Current plan
              </span>
            )}
            <CardTitle>Free</CardTitle>
            <p className="text-3xl font-bold text-zinc-100">$0</p>
            <p className="text-sm text-zinc-500">Forever</p>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {FREE_FEATURES.map((f) => (
              <p key={f}>{f}</p>
            ))}
            {isFree ? (
              <Button variant="outline" className="mt-4 w-full" disabled>
                Current plan
              </Button>
            ) : null}
          </CardContent>
        </Card>

        <Card className={`border-emerald-500/50 ${isPremium ? "ring-1 ring-emerald-500/30" : ""}`}>
          <CardHeader className="relative">
            {isPremium && (
              <span className="absolute right-4 top-4 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                Current plan
              </span>
            )}
            <CardTitle>Premium</CardTitle>
            <p className="text-3xl font-bold text-emerald-400">{PREMIUM_PRICE}</p>
            <p className="text-sm text-zinc-500">{PREMIUM_PERIOD}</p>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {PREMIUM_FEATURES.map((f) => (
              <p key={f}>{f}</p>
            ))}
            {isPremium ? (
              <Button variant="outline" className="mt-4 w-full" disabled>
                Current plan
              </Button>
            ) : user ? (
              <Button className="mt-4 w-full" onClick={handleUpgrade}>
                Upgrade to Premium
              </Button>
            ) : (
              <Link href="/login?redirect=/plan">
                <Button className="mt-4 w-full">Sign in to upgrade</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
