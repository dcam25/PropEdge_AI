import Link from "next/link";
import { Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollNav } from "@/components/scroll-nav";
import { ImageCarousel } from "@/components/image-carousel";

const GITHUB_URL = "https://github.com/dcam25/PropEdge_AI";

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-transparent">
      <header className="fixed top-0 left-0 right-0 z-40 border-b border-zinc-800/50 bg-gradient-to-b from-zinc-950/90 to-transparent backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-emerald-400">
            <img src="/favicon.ico" alt="" width={56} height={56} className="size-14 shrink-0 rounded object-contain aspect-square" aria-hidden />
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
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-zinc-100"
              aria-label="GitHub source"
            >
              <Github className="h-5 w-5" />
            </a>
          </nav>
        </div>
      </header>

      <div className="mx-auto flex w-[80%] max-w-6xl flex-1 pt-14">
        <main className="min-w-0 flex-1 px-6 py-16">
          <h1 className="text-3xl font-bold text-zinc-100">
            About PropEdge AI
          </h1>
          <p className="mt-4 text-lg text-zinc-400">
            PropEdge AI is a sports props analytics web app that helps you research multi-sport player props,
            build custom weighted models, and get AI-powered insights. Think of it as a lighter version of
            PickFinder + Rithmm—focused on speed to market and core features.
          </p>

          <div className="mt-8 overflow-hidden rounded-xl border border-zinc-800">
            <img
              src="/ad.png"
              alt="PropEdge AI"
              className="w-full object-cover"
              loading="eager"
            />
          </div>

          <section id="features" className="mt-16 scroll-mt-24 py-8">
            <h2 className="text-xl font-semibold text-zinc-100">What This App Does</h2>
            <ul className="mt-4 space-y-2 pl-8 text-zinc-400">
              <li>• Dashboard with props table across NBA, NFL, MLB, NHL, WNBA, LoL, CS2, Valorant</li>
              <li>• Custom model builder with 7 weighted factors and backtesting</li>
              <li>• AI-powered insights for each prop (OpenAI, Grok, Claude compatible)</li>
              <li>• Pick builder with copy-for-PrizePicks/Underdog export</li>
              <li>• Free vs Premium plans with Stripe subscription</li>
            </ul>
          </section>

          <section id="supabase" className="mt-16 scroll-mt-24 py-8">
            <h2 className="text-xl font-semibold text-zinc-100">Supabase Integration</h2>
            <p className="mt-2 pl-8 text-zinc-400">
              Supabase powers authentication and data storage for PropEdge AI.
            </p>
            <div className="mt-4 space-y-6 rounded-lg border border-zinc-800 bg-zinc-900/50 p-8">
              <div id="supabase-project-overview" className="scroll-mt-24">
                <h3 className="font-medium text-zinc-200">Project overview</h3>
                <p className="mt-1 text-sm text-zinc-500">
                  Auth and PostgreSQL for PropEdge AI.
                </p>
                <div className="mt-4 overflow-hidden rounded-xl border border-zinc-800">
                  <video
                    src="/Supabase_project.mp4"
                    controls
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full"
                  >
                    Your browser does not support the video tag.
                  </video>
                  <p className="border-t border-zinc-800 px-4 py-2 text-xs text-zinc-500">Supabase project overview</p>
                </div>
              </div>
              <div id="supabase-auth-setup" className="scroll-mt-24">
                <h3 className="font-medium text-zinc-200">Authentication setup</h3>
                <p className="mt-1 text-sm text-zinc-500">
                  Email/password signup and login. Email URL verification and OTP verification.
                  Server client for API routes; browser client for user-triggered actions.
                </p>
              </div>
              <div id="supabase-database-tables" className="scroll-mt-24">
                <h3 className="font-medium text-zinc-200">Database tables</h3>
                <p className="mt-1 text-sm text-zinc-500">
                  PostgreSQL tables: <code className="rounded bg-zinc-800 px-1">profiles</code>,{" "}
                  <code className="rounded bg-zinc-800 px-1">user_models</code>,{" "}
                  <code className="rounded bg-zinc-800 px-1">stripe_customers</code>,{" "}
                  <code className="rounded bg-zinc-800 px-1">invoices</code>.
                </p>
              </div>
              <div id="supabase-rls" className="scroll-mt-24">
                <h3 className="font-medium text-zinc-200">RLS policies</h3>
                <p className="mt-1 text-sm text-zinc-500">
                  Row Level Security enforces per-user data access on all tables.
                </p>
              </div>
              <div id="supabase-clients" className="scroll-mt-24">
                <h3 className="font-medium text-zinc-200">Clients</h3>
                <p className="mt-1 text-sm text-zinc-500">
                  Use <code className="rounded bg-zinc-800 px-1">@/lib/supabase/client</code> in the browser;
                  use <code className="rounded bg-zinc-800 px-1">@/lib/supabase/server</code> in API routes and Server Components.
                </p>
              </div>
            </div>
          </section>

          <section id="stripe" className="mt-16 scroll-mt-24 py-8">
            <h2 className="text-xl font-semibold text-zinc-100">Stripe Integration</h2>
            <p className="mt-2 pl-8 text-zinc-400">
              Stripe handles subscriptions and billing for the Premium plan.
            </p>
            <div className="mt-4 space-y-6 rounded-lg border border-zinc-800 bg-zinc-900/50 p-8">
              <div id="stripe-webhook" className="scroll-mt-24">
                <h3 className="font-medium text-zinc-200">Webhook & Transaction</h3>
                <div className="mt-3">
                  <ImageCarousel
                    images={[
                      { src: "/Stripe_WebHooks.png", alt: "Stripe Webhooks", label: "Webhooks" },
                      { src: "/Stripe_transaction.png", alt: "Stripe Transactions", label: "Transactions" },
                      { src: "/Stripe_webhook_destination.png", alt: "Stripe Webhook Destination", label: "Webhook destination" },
                      { src: "/Stripe_webhook_destination(2).png", alt: "Stripe Webhook Destination (2)", label: "Webhook destination (2)" },
                      { src: "/Stripe_webhook_checkout_session_completed.png", alt: "Stripe checkout.session.completed", label: "Event deliveries" },
                    ]}
                  />
                </div>
                <div className="mt-4 space-y-3 text-sm text-zinc-500">
                  <div>
                    <p className="font-medium text-zinc-400">Webhook</p>
                    <p className="mt-1">Stripe sends events to <code className="rounded bg-zinc-800 px-1">/api/stripe/webhook</code>. Updates <code className="rounded bg-zinc-800 px-1">profiles.is_premium</code> and syncs <code className="rounded bg-zinc-800 px-1">invoice.paid</code> to Supabase.</p>
                  </div>
                  <div>
                    <p className="font-medium text-zinc-400">Transaction</p>
                    <ul className="mt-1 list-inside list-disc space-y-0.5">
                      <li>Add credit ($10+ min): <code className="rounded bg-zinc-800 px-1">/api/stripe/charge-balance</code></li>
                      <li>Purchase Premium: <code className="rounded bg-zinc-800 px-1">/api/premium/purchase-with-balance</code></li>
                    </ul>
                  </div>
                </div>
                <div className="mt-3 border-l-4 border-amber-500/70 bg-amber-950/20 py-3 pl-4 pr-4">
                  <p className="font-medium text-amber-200/90">Note</p>
                  <p className="mt-1 text-sm text-zinc-400">
                    Use Stripe test mode for development. Test credit card:{" "}
                    <code className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-amber-200/90">4242 4242 4242 4242</code>
                    . Use any future expiry date, any CVC, and any ZIP.
                  </p>
                </div>
              </div>
              <div id="stripe-webhook-source" className="scroll-mt-24">
                <h3 className="font-medium text-zinc-200">Webhook source</h3>
                <p className="mt-1 text-sm text-zinc-500">
                  <a href="https://github1s.com/dcam25/PropEdge_AI/blob/main/src/app/api/stripe/webhook/route.ts" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">webhook/route.ts</a>
                </p>
              </div>
              <div id="stripe-transaction-source" className="scroll-mt-24">
                <h3 className="font-medium text-zinc-200">Transaction source</h3>
                <p className="mt-1 text-sm text-zinc-500">
                  <a href="https://github1s.com/dcam25/PropEdge_AI/blob/main/src/app/api/stripe/charge-balance/route.ts" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">charge-balance/route.ts</a>
                  {" · "}
                  <a href="https://github1s.com/dcam25/PropEdge_AI/blob/main/src/app/api/stripe/invoices/route.ts" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">invoices/route.ts</a>
                </p>
              </div>
              <div id="stripe-backend" className="scroll-mt-24">
                <h3 className="font-medium text-zinc-200">Backend code</h3>
                <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-zinc-500">
                  <li>Checkout: <code className="rounded bg-zinc-800 px-1">/api/stripe/checkout</code></li>
                  <li>Customer Portal: <code className="rounded bg-zinc-800 px-1">/api/stripe/portal</code></li>
                  <li>Premium $19.99/month from Profile → Plan tab</li>
                </ul>
              </div>
            </div>
          </section>

          <section id="packages" className="mt-16 scroll-mt-24 py-8">
            <h2 className="text-xl font-semibold text-zinc-100">Packages</h2>
            <p className="mt-2 pl-8 text-zinc-400">
              Key dependencies: Next.js 16, React 19, TypeScript, Tailwind v4, Radix UI, react-hook-form, zod, Zustand, flowbite-react (Datepicker), framer-motion, recharts, sonner, Stripe, Supabase.
            </p>
            <p className="mt-2 text-sm text-zinc-500">
              See <Link href="/readme" className="text-emerald-400 hover:underline">README</Link> for the full package list.
            </p>
          </section>

          <section id="deploy" className="mt-16 scroll-mt-24 py-6">
            <h2 className="text-xl font-semibold text-zinc-100">Vercel Deploy</h2>
            <p className="mt-2 text-zinc-400">
              PropEdge AI is designed to deploy on Vercel. Connect your GitHub repo, add environment variables (Supabase, Stripe, AI keys), and configure the Stripe webhook URL to your Vercel domain.
            </p>
            <div className="mt-4">
              <ImageCarousel
                images={[{ src: "/vercel_deployment.png", alt: "Vercel deployment", label: "Vercel deployment" }]}
              />
            </div>
            <ul className="mt-4 space-y-1 pl-8 text-sm text-zinc-500">
              <li>• Add <code className="rounded bg-zinc-800 px-1">/auth/callback</code> to Supabase redirect URLs</li>
              <li>• Set Stripe webhook to <code className="rounded bg-zinc-800 px-1">/api/stripe/webhook</code></li>
            </ul>
          </section>

          <div className="mt-16 flex gap-4">
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

        <aside className="sticky top-14 hidden w-56 shrink-0 border-l border-zinc-800 py-8 pl-6 pr-4 lg:block">
          <ScrollNav variant="about" />
        </aside>
      </div>

      <footer className="mt-auto border-t border-zinc-800 py-6 text-center text-xs text-zinc-500">
        <p>
          <Link href="/about" className="underline hover:text-zinc-300">About</Link>
          {" · "}
          <Link href="/readme" className="underline hover:text-zinc-300">README</Link>
          {" · "}
          <Link href="/terms" className="underline hover:text-zinc-300">Terms</Link>
          {" · "}
          <Link href="/privacy" className="underline hover:text-zinc-300">Privacy</Link>
        </p>
      </footer>
    </div>
  );
}
