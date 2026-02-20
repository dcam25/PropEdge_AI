import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ReadmePage() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-950">
      <header className="border-b border-zinc-800">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <Link href="/" className="font-bold text-emerald-400">
            PropEdge AI
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/about" className="text-sm text-zinc-400 hover:text-zinc-100">
              About
            </Link>
            <Link href="/plan" className="text-sm text-zinc-400 hover:text-zinc-100">
              Plan
            </Link>
            <Link href="/login" className="text-sm text-zinc-400 hover:text-zinc-100">
              Sign in
            </Link>
            <Link href="/signup">
              <Button size="sm">Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-4xl flex-1 px-4 py-16">
        <h1 className="text-3xl font-bold text-zinc-100">README</h1>
        <p className="mt-2 text-zinc-500">PropEdge AI - Ultra-MVP</p>

        <Card className="mt-8 border-zinc-800 bg-zinc-900/50">
          <CardHeader>
            <CardTitle className="text-zinc-100">Tech Stack</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-zinc-400">
            <p><strong>Framework:</strong> Next.js 16 (App Router)</p>
            <p><strong>Runtime:</strong> React 19</p>
            <p><strong>Language:</strong> TypeScript 5</p>
            <p><strong>Styling:</strong> Tailwind CSS v4</p>
            <p><strong>Auth & Database:</strong> Supabase</p>
            <p><strong>Payments:</strong> Stripe</p>
            <p><strong>AI:</strong> OpenAI-compatible API</p>
            <p><strong>Deploy:</strong> Vercel</p>
          </CardContent>
        </Card>

        <Card className="mt-6 border-zinc-800 bg-zinc-900/50">
          <CardHeader>
            <CardTitle className="text-zinc-100">Quick Start</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 font-mono text-sm text-zinc-400">
            <p>npm install</p>
            <p>cp .env.example .env.local</p>
            <p># Fill in Supabase, Stripe, AI keys</p>
            <p>npm run dev</p>
          </CardContent>
        </Card>

        <Card className="mt-6 border-zinc-800 bg-zinc-900/50">
          <CardHeader>
            <CardTitle className="text-zinc-100">Packages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-zinc-400">
            <p><strong>Core:</strong> next, react, react-dom, typescript</p>
            <p><strong>Forms:</strong> react-hook-form, @hookform/resolvers, zod</p>
            <p><strong>UI:</strong> @radix-ui/*, cva, clsx, tailwind-merge, lucide-react, flowbite-react, framer-motion, sonner</p>
            <p><strong>Supabase:</strong> @supabase/supabase-js, @supabase/ssr</p>
            <p><strong>Stripe:</strong> stripe</p>
            <p><strong>Other:</strong> zustand, recharts, react-modal-hook</p>
          </CardContent>
        </Card>

        <Card className="mt-6 border-zinc-800 bg-zinc-900/50">
          <CardHeader>
            <CardTitle className="text-zinc-100">Supabase & Stripe</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-zinc-400">
            <p><strong>Supabase:</strong> Auth (email/password), PostgreSQL (profiles, user_models, stripe_customers), RLS</p>
            <p><strong>Stripe:</strong> Checkout (subscription), Customer Portal, webhooks, balance & transactions</p>
          </CardContent>
        </Card>

        <Card className="mt-6 border-zinc-800 bg-zinc-900/50">
          <CardHeader>
            <CardTitle className="text-zinc-100">Vercel Deploy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-zinc-400">
            <p>1. Connect GitHub repo to Vercel</p>
            <p>2. Add env vars: Supabase, Stripe, AI keys</p>
            <p>3. Set Stripe webhook to /api/stripe/webhook</p>
            <p>4. Add /auth/callback to Supabase redirect URLs</p>
          </CardContent>
        </Card>

        <Card className="mt-6 border-zinc-800 bg-zinc-900/50">
          <CardHeader>
            <CardTitle className="text-zinc-100">Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-zinc-400">
            <p>• Dashboard with props table (NBA, NFL, MLB, NHL, WNBA, LoL, CS2, Valorant)</p>
            <p>• Prop detail modal with AI insight</p>
            <p>• Pick builder with copy-for-PrizePicks export</p>
            <p>• Model builder with 7 weighted factors and backtesting</p>
            <p>• Auth (Supabase), Stripe subscription, free vs premium limits</p>
            <p>• Balance & transactions (Stripe customer balance)</p>
          </CardContent>
        </Card>

        <div className="mt-12 flex gap-4">
          <Link href="/about">
            <Button variant="outline">About</Button>
          </Link>
          <Link href="/">
            <Button>Home</Button>
          </Link>
        </div>
      </main>

      <footer className="mt-auto border-t border-zinc-800 py-6 text-center text-xs text-zinc-500">
        <p>
          <Link href="/about" className="underline">About</Link> ·{" "}
          <Link href="/readme" className="underline">README</Link> ·{" "}
          <Link href="/terms" className="underline">Terms</Link> ·{" "}
          <Link href="/privacy" className="underline">Privacy</Link>
        </p>
      </footer>
    </div>
  );
}
