import Link from "next/link";
import { Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const GITHUB_URL = "https://github.com/dcam25/PropEdge_AI";
import { VideoFrameGallery } from "@/components/video-frame-gallery";
import { ImageCarousel } from "@/components/image-carousel";
import { ScrollNav } from "@/components/scroll-nav";

export default function ReadmePage() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-950">
      <header className="fixed top-0 left-0 right-0 z-40 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur">
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
          <h1 className="text-3xl font-bold text-zinc-100">README</h1>
          <p className="mt-2 text-zinc-500">PropEdge AI - Ultra-MVP · Tech stack, quick start, and deployment guide</p>

          <Card id="tech-stack" className="mt-8 scroll-mt-24 border-zinc-800 bg-zinc-900/50">
            <CardHeader className="px-8">
              <CardTitle className="text-zinc-100">Tech Stack</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-8 pb-8 pt-0 text-sm text-zinc-400">
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
            <CardHeader className="px-8">
              <CardTitle className="text-zinc-100">Packages</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-8 pb-8 pt-0 text-sm text-zinc-400">
              <p><strong>Core:</strong> next, react, react-dom, typescript</p>
              <p><strong>Forms:</strong> react-hook-form, @hookform/resolvers, zod</p>
              <p><strong>UI:</strong> @radix-ui/*, cva, clsx, tailwind-merge, lucide-react, flowbite-react, framer-motion, sonner</p>
              <p><strong>Supabase:</strong> @supabase/supabase-js, @supabase/ssr</p>
              <p><strong>Stripe:</strong> stripe</p>
              <p><strong>Other:</strong> zustand, recharts, react-modal-hook</p>
            </CardContent>
          </Card>

          <Card id="schema" className="mt-6 scroll-mt-24 border-zinc-800 bg-zinc-900/50">
            <CardHeader className="px-8">
              <CardTitle className="text-zinc-100">Database Schema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-8 pb-8 pt-0 text-sm text-zinc-400">
              <p className="text-zinc-500">
                See <code className="rounded bg-zinc-800 px-1">docs/README.md</code> for full schema and migrations.
              </p>
              <div className="overflow-hidden rounded-lg border border-zinc-800">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800 bg-zinc-900/80">
                      <th className="px-4 py-2.5 font-medium text-zinc-300">Table</th>
                      <th className="px-4 py-2.5 font-medium text-zinc-300">Columns</th>
                      <th className="px-4 py-2.5 font-medium text-zinc-300">RLS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    <tr>
                      <td className="px-4 py-2.5 font-mono text-zinc-300">profiles</td>
                      <td className="px-4 py-2.5 font-mono text-xs text-zinc-500">id, email, first_name, last_name, birthday, is_premium, ai_insights_used_today, ai_insights_date, created_at, updated_at</td>
                      <td className="px-4 py-2.5 text-xs text-zinc-500">SELECT, INSERT, UPDATE own</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-mono text-zinc-300">user_models</td>
                      <td className="px-4 py-2.5 font-mono text-xs text-zinc-500">id, user_id, name, description, factors (JSONB), performance_score, is_active, created_at, updated_at</td>
                      <td className="px-4 py-2.5 text-xs text-zinc-500">ALL own</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-mono text-zinc-300">stripe_customers</td>
                      <td className="px-4 py-2.5 font-mono text-xs text-zinc-500">user_id, stripe_customer_id</td>
                      <td className="px-4 py-2.5 text-xs text-zinc-500">SELECT own</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-mono text-zinc-300">invoices</td>
                      <td className="px-4 py-2.5 text-zinc-500">Synced from Stripe via webhook (invoice.paid)</td>
                      <td className="px-4 py-2.5 text-xs text-zinc-500">SELECT own</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-zinc-500">
                Migrations: <code className="rounded bg-zinc-800 px-1">001_initial_schema.sql</code> → <code className="rounded bg-zinc-800 px-1">002_profiles_name_birthday.sql</code> → <code className="rounded bg-zinc-800 px-1">003</code>–<code className="rounded bg-zinc-800 px-1">006</code>
              </p>
            </CardContent>
          </Card>

          <Card id="supabase-stripe" className="mt-6 scroll-mt-24 border-zinc-800 bg-zinc-900/50">
            <CardHeader className="px-8">
              <CardTitle className="text-zinc-100">Supabase & Stripe</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8 px-8 pb-8 pt-0 text-sm text-zinc-400">
              <div className="space-y-6">
                <h3 className="text-base font-semibold text-zinc-200">Supabase</h3>
                <div id="supabase-overview" className="scroll-mt-24">
                  <div className="overflow-hidden rounded-lg border border-zinc-800">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-zinc-800 bg-zinc-900/80">
                          <th className="px-4 py-2.5 font-medium text-zinc-300">Topic</th>
                          <th className="px-4 py-2.5 font-medium text-zinc-300">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800">
                        <tr id="supabase-project-overview" className="scroll-mt-24">
                          <td className="px-4 py-2.5 font-medium text-zinc-300">Project overview</td>
                          <td className="px-4 py-2.5 text-zinc-500">PropEdge uses Supabase for auth and PostgreSQL. See the video showcase below.</td>
                        </tr>
                        <tr id="supabase-auth-setup" className="scroll-mt-24">
                          <td className="px-4 py-2.5 font-medium text-zinc-300">Authentication setup</td>
                          <td className="px-4 py-2.5 text-zinc-500">Email/password signup and login. Email URL verification and OTP for confirmation.</td>
                        </tr>
                        <tr id="supabase-database-tables" className="scroll-mt-24">
                          <td className="px-4 py-2.5 font-medium text-zinc-300">Database tables</td>
                          <td className="px-4 py-2.5 text-zinc-500"><code className="rounded bg-zinc-800 px-1">profiles</code>, <code className="rounded bg-zinc-800 px-1">user_models</code>, <code className="rounded bg-zinc-800 px-1">stripe_customers</code>, <code className="rounded bg-zinc-800 px-1">invoices</code>. See <code className="rounded bg-zinc-800 px-1">docs/README.md</code> for schema.</td>
                        </tr>
                        <tr id="supabase-table-editor" className="scroll-mt-24">
                          <td className="px-4 py-2.5 font-medium text-zinc-300">Table editor</td>
                          <td className="px-4 py-2.5 text-zinc-500">Manage tables in Dashboard → Table Editor. Create and edit columns, indexes, constraints.</td>
                        </tr>
                        <tr id="supabase-rls" className="scroll-mt-24">
                          <td className="px-4 py-2.5 font-medium text-zinc-300">RLS policies</td>
                          <td className="px-4 py-2.5 text-zinc-500">Row Level Security enforces per-user data access on all tables.</td>
                        </tr>
                        <tr id="supabase-api-edge" className="scroll-mt-24">
                          <td className="px-4 py-2.5 font-medium text-zinc-300">API & Edge functions</td>
                          <td className="px-4 py-2.5 text-zinc-500">Auto-generated REST API and optional Edge Functions. PropEdge uses the JS client.</td>
                        </tr>
                        <tr id="supabase-stored-procedures" className="scroll-mt-24">
                          <td className="px-4 py-2.5 font-medium text-zinc-300">Stored procedures</td>
                          <td className="px-4 py-2.5 text-zinc-500">PostgreSQL functions via RPC. Use for complex queries or server-side logic.</td>
                        </tr>
                        <tr id="supabase-auth-users" className="scroll-mt-24">
                          <td className="px-4 py-2.5 font-medium text-zinc-300">Auth users</td>
                          <td className="px-4 py-2.5 text-zinc-500">User management in Dashboard → Authentication → Users. OTP and email verification.</td>
                        </tr>
                        <tr id="supabase-provider" className="scroll-mt-24">
                          <td className="px-4 py-2.5 font-medium text-zinc-300">Provider</td>
                          <td className="px-4 py-2.5 text-zinc-500">Auth providers in Dashboard → Authentication → Providers. Configure email, OAuth, sign-in methods.</td>
                        </tr>
                        <tr id="supabase-sql-editor" className="scroll-mt-24">
                          <td className="px-4 py-2.5 font-medium text-zinc-300">SQL editor</td>
                          <td className="px-4 py-2.5 text-zinc-500">Run SQL in Dashboard → SQL Editor. Migrations and ad-hoc queries.</td>
                        </tr>
                        <tr id="supabase-schema" className="scroll-mt-24">
                          <td className="px-4 py-2.5 font-medium text-zinc-300">Database schema</td>
                          <td className="px-4 py-2.5 text-zinc-500">Schema visualization. Tables, relationships, and RLS policies.</td>
                        </tr>
                        <tr id="supabase-realtime" className="scroll-mt-24">
                          <td className="px-4 py-2.5 font-medium text-zinc-300">Realtime</td>
                          <td className="px-4 py-2.5 text-zinc-500">Live subscriptions. Enable per-table in Database → Replication.</td>
                        </tr>
                        <tr id="supabase-project-settings" className="scroll-mt-24">
                          <td className="px-4 py-2.5 font-medium text-zinc-300">Project settings</td>
                          <td className="px-4 py-2.5 text-zinc-500">API keys, URL, and config in Dashboard → Project Settings.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div id="supabase-showcase" className="scroll-mt-24 pl-6">
                  <h4 className="font-medium text-zinc-300">Showcase</h4>
                  <p className="mt-2 text-zinc-500">Supabase project — frames from video:</p>
                  <VideoFrameGallery src="/Supabase_project.mp4" />
                  <div className="mt-4 overflow-hidden rounded-lg border border-zinc-800">
                    <video src="/Supabase_project.mp4" controls className="w-full" muted />
                    <p className="border-t border-zinc-800 px-2 py-1 text-xs text-zinc-500">Supabase project overview (full video)</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-base font-semibold text-zinc-200">Stripe</h3>
                <div id="stripe-webhook" className="scroll-mt-24 pl-6">
                  <h4 className="font-medium text-zinc-300">Webhook & Transaction</h4>
                  <ImageCarousel
                    images={[
                      { src: "/Stripe_WebHooks.png", alt: "Stripe Webhooks", label: "Stripe Webhooks" },
                      { src: "/Stripe_transaction.png", alt: "Stripe Transactions", label: "Stripe Transactions" },
                    ]}
                  />
                  <div className="mt-4 space-y-4 text-sm text-zinc-500">
                    <div>
                      <p className="font-medium text-zinc-400">Webhook</p>
                      <ul className="mt-1.5 list-inside list-disc space-y-1">
                        <li>Configure in Stripe Dashboard → Developers → Webhooks</li>
                        <li>
                          <strong>Webhook destination</strong> — Add endpoint URL; Stripe sends events to this destination. Use Event Destinations or classic Webhooks.
                          <div className="mt-3">
                            <ImageCarousel
                              images={[
                                { src: "/Stripe_webhook_destination.png", alt: "Stripe Webhook Destination", label: "Webhook destination" },
                                { src: "/Stripe_webhook_destination(2).png", alt: "Stripe Webhook Destination (2)", label: "Webhook destination (2)" },
                              ]}
                            />
                          </div>
                        </li>
                        <li>Endpoint: <code className="rounded bg-zinc-800 px-1">/api/stripe/webhook</code></li>
                        <li>
                          Subscribe to:
                          <pre className="mt-1 overflow-x-auto rounded border border-zinc-800 bg-zinc-950 px-3 py-2 font-mono text-xs text-zinc-400">
{`checkout.session.completed
customer.subscription.created
customer.subscription.updated
customer.subscription.deleted
invoice.paid`}
                          </pre>
                        </li>
                        <li>Set <code className="rounded bg-zinc-800 px-1">STRIPE_WEBHOOK_SECRET</code></li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium text-zinc-400">Transaction</p>
                      <ul className="mt-1.5 list-inside list-disc space-y-1">
                        <li>Balance and transaction history from Stripe customer balance</li>
                        <li>Add credit ($10+ min): <code className="rounded bg-zinc-800 px-1">/api/stripe/charge-balance</code></li>
                        <li>Purchase Premium with balance: <code className="rounded bg-zinc-800 px-1">/api/premium/purchase-with-balance</code></li>
                      </ul>
                    </div>
                  </div>
                  <div className="mt-4 border-l-4 border-amber-500/70 bg-amber-950/20 py-3 pl-4 pr-4">
                    <p className="font-medium text-amber-200/90">Note</p>
                    <p className="mt-1 text-sm text-zinc-400">
                      Use Stripe test mode for development. Test credit card:{" "}
                      <code className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-amber-200/90">4242 4242 4242 4242</code>
                      . Use any future expiry date, any CVC, and any ZIP.
                    </p>
                  </div>
                </div>
                <div id="stripe-webhook-source" className="scroll-mt-24 pl-6">
                  <h4 className="font-medium text-zinc-300">Webhook source</h4>
                  <p className="mt-2 text-xs text-zinc-500">
                    <a href="https://github1s.com/dcam25/PropEdge_AI/blob/main/src/app/api/stripe/webhook/route.ts" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">webhook/route.ts</a>
                  </p>
                </div>
                <div id="stripe-transaction-source" className="scroll-mt-24 pl-6">
                  <h4 className="font-medium text-zinc-300">Transaction source</h4>
                  <p className="mt-2 text-xs text-zinc-500">
                    <a href="https://github1s.com/dcam25/PropEdge_AI/blob/main/src/app/api/stripe/charge-balance/route.ts" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">charge-balance/route.ts</a>
                    {" · "}
                    <a href="https://github1s.com/dcam25/PropEdge_AI/blob/main/src/app/api/stripe/invoices/route.ts" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">invoices/route.ts</a>
                  </p>
                </div>
                <div id="stripe-backend" className="scroll-mt-24 pl-6">
                  <h4 className="font-medium text-zinc-300">Backend code</h4>
                  <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-zinc-500">
                    <li>Checkout: <code className="rounded bg-zinc-800 px-1">/api/stripe/checkout</code></li>
                    <li>Customer Portal: <code className="rounded bg-zinc-800 px-1">/api/stripe/portal</code></li>
                    <li>Webhook updates <code className="rounded bg-zinc-800 px-1">profiles.is_premium</code> and syncs <code className="rounded bg-zinc-800 px-1">invoice.paid</code> to Supabase</li>
                  </ul>
                  <div className="mt-2 flex flex-wrap gap-x-3 text-xs text-zinc-500">
                    <a href="https://github1s.com/dcam25/PropEdge_AI/blob/main/src/app/api/stripe/checkout/route.ts" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">checkout</a>
                    <a href="https://github1s.com/dcam25/PropEdge_AI/blob/main/src/app/api/stripe/portal/route.ts" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">portal</a>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card id="deploy" className="mt-6 scroll-mt-24 border-zinc-800 bg-zinc-900/50">
            <CardHeader className="px-8">
              <CardTitle className="text-zinc-100">Vercel Deploy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-8 pb-8 pt-0 text-sm text-zinc-400">
              <p>1. Connect GitHub repo to Vercel</p>
              <p>2. Add env vars: Supabase, Stripe, AI keys</p>
              <p>3. Set Stripe webhook to /api/stripe/webhook</p>
              <p>4. Add /auth/callback to Supabase redirect URLs</p>
            </CardContent>
          </Card>

          <Card id="features" className="mt-6 scroll-mt-24 border-zinc-800 bg-zinc-900/50">
            <CardHeader className="px-8">
              <CardTitle className="text-zinc-100">Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-8 pb-8 pt-0 text-sm text-zinc-400">
              <p>• Dashboard with props table (NBA, NFL, MLB, NHL, WNBA, LoL, CS2, Valorant)</p>
              <p>• Prop detail modal with AI insight (OpenAI/Grok/Claude)</p>
              <p>• Pick builder with copy-for-PrizePicks/Underdog export</p>
              <p>• Model builder with 7 weighted factors and backtesting</p>
              <p>• Auth: email/password, OTP, forgot password</p>
              <p>• Profile: edit name, birthday; change password; delete account</p>
              <p>• Plan: Free (1 model, 5 AI/day) vs Premium (10 models, unlimited AI)</p>
              <p>• Balance & transactions: add credit ($10+), purchase Premium with balance</p>
            </CardContent>
          </Card>

          <div className="mt-12 flex gap-4">
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

        <aside className="sticky top-14 hidden w-56 shrink-0 border-l border-zinc-800 py-8 pl-6 pr-4 lg:block">
          <ScrollNav variant="readme" />
        </aside>
      </div>

      <footer className="mt-auto border-t border-zinc-800 py-6 text-center text-xs text-zinc-500">
        <p>
          <Link href="/about" className="underline hover:text-zinc-300">About</Link> ·{" "}
          <Link href="/readme" className="underline hover:text-zinc-300">README</Link> ·{" "}
          <Link href="/terms" className="underline hover:text-zinc-300">Terms</Link> ·{" "}
          <Link href="/privacy" className="underline hover:text-zinc-300">Privacy</Link>
        </p>
      </footer>
    </div>
  );
}
