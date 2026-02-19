"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";

export default function PricingPage() {
  const [loading, setLoading] = useState(false);
  const { user, profile } = useAuth();

  async function handleSubscribe() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert(data.error ?? "Failed to start checkout");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <Link href="/" className="font-bold text-emerald-400">
            PropEdge AI
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm text-zinc-400 hover:text-zinc-100">
              Dashboard
            </Link>
            <Link href="/models" className="text-sm text-zinc-400 hover:text-zinc-100">
              My Models
            </Link>
            <Link href="/profile" className="text-sm text-zinc-400 hover:text-zinc-100">
              Profile
            </Link>
            {!user && (
              <Link href="/login">
                <Button size="sm">Sign in</Button>
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-16">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-zinc-100">Simple Pricing</h1>
          <p className="mt-2 text-zinc-500">One plan. Full access.</p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Free</CardTitle>
              <p className="text-3xl font-bold text-zinc-100">$0</p>
              <p className="text-sm text-zinc-500">Forever</p>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>5 AI Insights per day</p>
              <p>1 custom model</p>
              <p>Basic backtesting</p>
              <p>All sports props</p>
              <Link href="/signup">
                <Button variant="outline" className="mt-4 w-full">
                  Get Started
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-emerald-500/50">
            <CardHeader>
              <CardTitle>Premium</CardTitle>
              <p className="text-3xl font-bold text-emerald-400">$19.99</p>
              <p className="text-sm text-zinc-500">per month</p>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>Unlimited AI Insights</p>
              <p>Up to 10 custom models</p>
              <p>Full backtesting</p>
              <p>Priority support</p>
              {profile?.is_premium ? (
                <Button
                  className="mt-4 w-full"
                  variant="outline"
                  onClick={async () => {
                    setLoading(true);
                    const res = await fetch("/api/stripe/portal", { method: "POST" });
                    const data = await res.json();
                    if (data.url) window.location.href = data.url;
                    setLoading(false);
                  }}
                  disabled={loading}
                >
                  {loading ? "Redirecting..." : "Manage Subscription"}
                </Button>
              ) : (
                <Button
                  className="mt-4 w-full"
                  onClick={handleSubscribe}
                  disabled={loading || !user}
                >
                  {loading ? "Redirecting..." : user ? "Subscribe" : "Sign in to subscribe"}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
