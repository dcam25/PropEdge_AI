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
            <Link href="/readme" className="text-sm text-emerald-400">
              Readme
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
        <p className="mt-2 text-lg text-zinc-500">PropEdge AI - Ultra-MVP · Tech stack, quick start, and deployment guide</p>

        <nav className="mt-8 flex flex-wrap gap-3">
          <a href="#tech-stack" className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-1.5 text-sm text-zinc-400 hover:border-zinc-700 hover:text-zinc-100">
            Tech Stack
          </a>
          <a href="#quick-start" className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-1.5 text-sm text-zinc-400 hover:border-zinc-700 hover:text-zinc-100">
            Quick Start
          </a>
          <a href="#packages" className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-1.5 text-sm text-zinc-400 hover:border-zinc-700 hover:text-zinc-100">
            Packages
          </a>
          <a href="#features" className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-1.5 text-sm text-zinc-400 hover:border-zinc-700 hover:text-zinc-100">
            Features
          </a>
          <a href="#deploy" className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-1.5 text-sm text-zinc-400 hover:border-zinc-700 hover:text-zinc-100">
            Deploy
          </a>
        </nav>

        <Card id="tech-stack" className="mt-8 scroll-mt-24 border-zinc-800 bg-zinc-900/50">
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

        <Card id="quick-start" className="mt-6 scroll-mt-24 border-zinc-800 bg-zinc-900/50">
          <CardHeader>
            <CardTitle className="text-zinc-100">Quick Start</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <pre className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-950 p-4 font-mono text-sm text-zinc-400">
{`npm install
cp .env.example .env.local
# Fill in Supabase, Stripe, AI keys
npm run dev`}
            </pre>
            <p className="text-sm text-zinc-500">Then open <code className="rounded bg-zinc-800 px-1">http://localhost:3000</code></p>
          </CardContent>
        </Card>

        <Card id="packages" className="mt-6 scroll-mt-24 border-zinc-800 bg-zinc-900/50">
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

        <Card id="deploy" className="mt-6 scroll-mt-24 border-zinc-800 bg-zinc-900/50">
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

        <Card id="features" className="mt-6 scroll-mt-24 border-zinc-800 bg-zinc-900/50">
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

        <div className="mt-12 flex flex-wrap gap-4">
          <Link href="/">
            <Button variant="outline">Home</Button>
          </Link>
          <Link href="/about">
            <Button variant="outline">About</Button>
          </Link>
          <Link href="/dashboard">
            <Button>View Dashboard</Button>
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
