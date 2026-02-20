import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-950">
      <header className="border-b border-zinc-800">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <Link href="/" className="font-bold text-emerald-400">
            PropEdge AI
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/about" className="text-sm text-emerald-400">
              About
            </Link>
            <Link href="/readme" className="text-sm text-zinc-400 hover:text-zinc-100">
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
        <h1 className="text-3xl font-bold text-zinc-100">
          About PropEdge AI
        </h1>
        <p className="mt-4 text-lg text-zinc-400">
          PropEdge AI is a sports props analytics web app that helps you research multi-sport player props,
          build custom weighted models, and get AI-powered insights. Think of it as a lighter version of
          PickFinder + Rithmm—focused on speed to market and core features.
        </p>

        <nav className="mt-8 flex flex-wrap gap-3">
          <a href="#features" className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-1.5 text-sm text-zinc-400 hover:border-zinc-700 hover:text-zinc-100">
            Features
          </a>
          <a href="#supabase" className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-1.5 text-sm text-zinc-400 hover:border-zinc-700 hover:text-zinc-100">
            Supabase
          </a>
          <a href="#stripe" className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-1.5 text-sm text-zinc-400 hover:border-zinc-700 hover:text-zinc-100">
            Stripe
          </a>
          <a href="#packages" className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-1.5 text-sm text-zinc-400 hover:border-zinc-700 hover:text-zinc-100">
            Packages
          </a>
          <a href="#deploy" className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-1.5 text-sm text-zinc-400 hover:border-zinc-700 hover:text-zinc-100">
            Deploy
          </a>
        </nav>

        <div className="mt-12 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50">
          <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-zinc-800 to-zinc-900">
            <div className="absolute inset-0 z-0 flex items-center justify-center text-center text-zinc-500">
              <span className="max-w-xs text-sm">
                Add <code className="rounded bg-zinc-800 px-1">/public/about-hero.png</code> for a dashboard screenshot
              </span>
            </div>
            {/* <img
              src="/about-hero.png"
              alt="PropEdge AI Dashboard"
              className="relative z-10 h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            /> */}
          </div>
        </div>

        <section id="features" className="mt-16 scroll-mt-24">
          <h2 className="text-xl font-semibold text-zinc-100">What This App Does</h2>
          <ul className="mt-4 space-y-2 text-zinc-400">
            <li>• Dashboard with props table across NBA, NFL, MLB, NHL, WNBA, LoL, CS2, Valorant</li>
            <li>• Custom model builder with 7 weighted factors and backtesting</li>
            <li>• AI-powered insights for each prop (OpenAI, Grok, Claude compatible)</li>
            <li>• Pick builder with copy-for-PrizePicks/Underdog export</li>
            <li>• Free vs Premium plans with Stripe subscription</li>
          </ul>
        </section>

        <section id="supabase" className="mt-16 scroll-mt-24">
          <h2 className="text-xl font-semibold text-zinc-100">Supabase Integration</h2>
          <p className="mt-2 text-zinc-400">
            Supabase powers authentication and data storage for PropEdge AI.
          </p>
          <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
            <h3 className="font-medium text-zinc-200">Integration Progress</h3>
            <ul className="mt-2 space-y-1 text-sm text-zinc-500">
              <li className="flex items-center gap-2">
                <span className="text-emerald-500">✓</span> Auth (email/password, OTP verification)
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-500">✓</span> Profiles table (RLS)
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-500">✓</span> User models table (RLS)
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-500">✓</span> Stripe customers mapping
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-500">✓</span> Invoices table (optional, for subscription records)
              </li>
            </ul>
            <h3 className="mt-4 font-medium text-zinc-200">Auth</h3>
            <p className="mt-1 text-sm text-zinc-500">
              Email/password signup and login. OTP verification for email confirmation.
              Server client for API routes; browser client for user-triggered actions.
            </p>
            <h3 className="mt-3 font-medium text-zinc-200">Database</h3>
            <p className="mt-1 text-sm text-zinc-500">
              PostgreSQL tables: <code className="rounded bg-zinc-800 px-1">profiles</code>,{" "}
              <code className="rounded bg-zinc-800 px-1">user_models</code>,{" "}
              <code className="rounded bg-zinc-800 px-1">stripe_customers</code>,{" "}
              <code className="rounded bg-zinc-800 px-1">invoices</code>.
              Row Level Security (RLS) enforces per-user data access.
            </p>
            <h3 className="mt-3 font-medium text-zinc-200">Clients</h3>
            <p className="mt-1 text-sm text-zinc-500">
              Use <code className="rounded bg-zinc-800 px-1">@/lib/supabase/client</code> in the browser;
              use <code className="rounded bg-zinc-800 px-1">@/lib/supabase/server</code> in API routes and Server Components.
            </p>
          </div>
        </section>

        <section id="stripe" className="mt-16 scroll-mt-24">
          <h2 className="text-xl font-semibold text-zinc-100">Stripe Integration</h2>
          <p className="mt-2 text-zinc-400">
            Stripe handles subscriptions and billing for the Premium plan.
          </p>
          <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
            <h3 className="font-medium text-zinc-200">Integration Progress</h3>
            <ul className="mt-2 space-y-1 text-sm text-zinc-500">
              <li className="flex items-center gap-2">
                <span className="text-emerald-500">✓</span> Checkout (subscription flow)
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-500">✓</span> Customer Portal (manage/cancel)
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-500">✓</span> Webhooks (subscription, invoice.paid)
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-500">✓</span> Balance credit (charge $10+)
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-500">✓</span> Balance & transactions (Stripe customer balance)
              </li>
            </ul>
            <h3 className="mt-4 font-medium text-zinc-200">Checkout</h3>
            <p className="mt-1 text-sm text-zinc-500">
              Subscription flow via <code className="rounded bg-zinc-800 px-1">/api/stripe/checkout</code>.
              Premium plan at $19.99/month. Purchase from Profile → Plan tab.
            </p>
            <h3 className="mt-3 font-medium text-zinc-200">Customer Portal</h3>
            <p className="mt-1 text-sm text-zinc-500">
              Users manage or cancel subscriptions via Stripe&apos;s hosted portal
              (<code className="rounded bg-zinc-800 px-1">/api/stripe/portal</code>).
            </p>
            <h3 className="mt-3 font-medium text-zinc-200">Webhooks</h3>
            <p className="mt-1 text-sm text-zinc-500">
              Stripe sends events to <code className="rounded bg-zinc-800 px-1">/api/stripe/webhook</code>.
              The webhook updates <code className="rounded bg-zinc-800 px-1">profiles.is_premium</code> and
              syncs <code className="rounded bg-zinc-800 px-1">invoice.paid</code> to Supabase <code className="rounded bg-zinc-800 px-1">invoices</code>.
            </p>
            <h3 className="mt-3 font-medium text-zinc-200">Balance & Transactions</h3>
            <p className="mt-1 text-sm text-zinc-500">
              Balance and transaction history come from Stripe customer balance. Users add credit ($10+ min) via{" "}
              <code className="rounded bg-zinc-800 px-1">/api/stripe/charge-balance</code>. Premium can be purchased with balance via{" "}
              <code className="rounded bg-zinc-800 px-1">/api/premium/purchase-with-balance</code>.
            </p>
          </div>
        </section>

        <section id="packages" className="mt-16 scroll-mt-24">
          <h2 className="text-xl font-semibold text-zinc-100">Packages</h2>
          <p className="mt-2 text-zinc-400">
            Key dependencies: Next.js 16, React 19, TypeScript, Tailwind v4, Radix UI, react-hook-form, zod, Zustand, flowbite-react (Datepicker), framer-motion, recharts, sonner, Stripe, Supabase.
          </p>
          <p className="mt-2 text-sm text-zinc-500">
            See <Link href="/readme" className="text-emerald-400 hover:underline">README</Link> for the full package list.
          </p>
        </section>

        <section id="deploy" className="mt-16 scroll-mt-24">
          <h2 className="text-xl font-semibold text-zinc-100">Vercel Deploy</h2>
          <p className="mt-2 text-zinc-400">
            PropEdge AI is designed to deploy on Vercel. Connect your GitHub repo, add environment variables (Supabase, Stripe, AI keys), and configure the Stripe webhook URL to your Vercel domain.
          </p>
          <ul className="mt-2 space-y-1 text-sm text-zinc-500">
            <li>• Add <code className="rounded bg-zinc-800 px-1">/auth/callback</code> to Supabase redirect URLs</li>
            <li>• Set Stripe webhook to <code className="rounded bg-zinc-800 px-1">/api/stripe/webhook</code></li>
          </ul>
        </section>

        <div className="mt-16 flex flex-wrap gap-4">
          <Link href="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
          <Link href="/readme">
            <Button variant="outline">Readme</Button>
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
