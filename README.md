# PropEdge AI - Ultra-MVP

Sports props analytics web app: research player props, build custom models, and get AI-powered insights.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 16 (App Router) |
| **Runtime** | React 19 |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS v4 |
| **Auth & Database** | Supabase |
| **Payments** | Stripe |
| **AI** | OpenAI-compatible API (OpenAI, Grok, Claude, etc.) |
| **Deploy** | Vercel |

---

## Packages Used

### Core
- **next** (16.1) – App Router, API routes, server components
- **react** (19.2), **react-dom** (19.2) – UI library
- **typescript** (5.x) – Type safety

### Forms & Validation
- **react-hook-form** (7.x) – Form state and submission
- **@hookform/resolvers** (5.x) – Zod resolver for react-hook-form
- **zod** (4.x) – Schema validation (signup, profile, password)

### UI (Radix UI)
- **@radix-ui/react-dialog** – Modal dialogs
- **@radix-ui/react-tabs** – Tabs
- **@radix-ui/react-slot** – Polymorphic `asChild`
- **@radix-ui/react-dropdown-menu** – Dropdown menus
- **@radix-ui/react-select** – Select inputs
- **@radix-ui/react-toast** – Toast notifications

### UI Utilities & Styling
- **class-variance-authority (cva)** – Variant-based component styling
- **clsx** – Conditional class names
- **tailwind-merge** – Merge Tailwind classes
- **lucide-react** – Icons
- **flowbite-react** – Datepicker (birthday)
- **framer-motion** – Animations
- **react-transition-group** – Transitions
- **sonner** – Toast notifications

### Modals & Charts
- **react-modal-hook** – Modal hooks
- **recharts** – Charts (dashboard)

### State & Data
- **zustand** – Auth store
- **@faker-js/faker** – Mock data
- **mocker-data-generator** – Mock data generation

### Supabase
- **@supabase/supabase-js** – Supabase client
- **@supabase/ssr** – Next.js server/client auth

### Stripe
- **stripe** – Payments, subscriptions, balance, webhooks

### Dev
- **patch-package** – Patch node_modules (flowbite-react)
- **eslint**, **eslint-config-next** – Linting
- **tailwindcss**, **@tailwindcss/postcss** – Tailwind v4

---

## Supabase
- **Auth** – Email/password signup and login
- **PostgreSQL** – `profiles`, `user_models`, `stripe_customers`
- **Row Level Security (RLS)** – Per-user data access
- **Realtime** – Available for future live updates

**Packages:** `@supabase/supabase-js`, `@supabase/ssr` (for Next.js server/client auth)

**Supabase clients** – Use the correct client for each context:

| Context | Import | Use for |
|---------|--------|---------|
| **Browser** (client components, hooks) | `createClient` from `@/lib/supabase/client` | User-triggered actions, auth state, RLS queries from the frontend |
| **Server** (API routes, Server Actions, Server Components) | `createClient` from `@/lib/supabase/server` | Auth-required API logic, webhooks, server-side data access |

The server client uses `cookies()` from `next/headers` and **cannot run in the browser**. For auth-required actions from the frontend, either call the browser client directly or invoke an API route / Server Action that uses the server client.

### Stripe
- **Checkout** – One-time subscription flow ($19.99/mo)
- **Customer Portal** – Manage/cancel subscriptions
- **Webhooks** – Sync subscription status to Supabase `profiles.is_premium`

**Package:** `stripe`

### AI (OpenAI-compatible)
- **Chat completions** – Prop insight generation via `/api/ai-insight`
- **Providers** – OpenAI, Grok, Claude, or any API using the OpenAI format

**Config:** `AI_API_KEY`, `AI_API_URL`, `AI_MODEL` in `.env`

---

## API Endpoints

| Endpoint | Method | Purpose | Used in |
|----------|--------|---------|---------|
| `/api/ai-insight` | POST | Generate AI insight for a prop | Dashboard → Prop detail modal |
| `/api/stripe/checkout` | POST | Create Stripe Checkout session | Pricing page → Subscribe button |
| `/api/stripe/portal` | POST | Redirect to Stripe Customer Portal | Pricing page → Manage Subscription |
| `/api/stripe/webhook` | POST | Receive Stripe subscription events | Stripe (external) |
| `/auth/callback` | GET | Handle Supabase auth redirect (OTP, magic link) | Supabase redirect URL |

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/login, signup     # Auth pages
│   ├── api/                     # AI insight, Stripe checkout/webhook/portal
│   ├── auth/callback/           # Supabase auth redirect handler
│   ├── dashboard/               # Props table + pick builder
│   ├── models/                  # Model builder
│   └── pricing/                 # Subscription plans
├── components/                  # UI + feature components
├── stores/                       # Zustand auth store
├── data/                        # Mock props
├── lib/                         # Supabase clients, validations (Zod schemas), model scoring, utils
└── types/                       # TypeScript types
```

---

## Quick Start

```bash
npm install
cp .env.example .env.local
# Fill in Supabase, Stripe, AI keys
npm run dev
```

## Setup

1. **Supabase:** Create project, run `supabase/migrations/001_initial_schema.sql` in SQL Editor.
2. **Stripe:** Create Product + Price ($19.99/mo), add webhook for subscription events.
3. **AI:** Set `AI_API_KEY` (OpenAI, Grok, or any OpenAI-compatible API).

---

## Vercel Deploy

1. **Connect repo** – Push to GitHub, then import the project in [Vercel](https://vercel.com).
2. **Environment variables** – Add all env vars from `.env` in Vercel Project Settings → Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
   - `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` (use Vercel’s URL for webhook)
   - `AI_API_KEY`, `AI_API_URL`, `AI_MODEL`
   - Optional: `ADMIN_SECRET` for admin APIs
3. **Stripe webhook** – In Stripe Dashboard, set the webhook URL to `https://your-app.vercel.app/api/stripe/webhook`.
4. **Supabase redirect** – In Supabase Auth → URL Configuration, add `https://your-app.vercel.app/auth/callback` as a redirect URL.

## Features

- Dashboard with props table (NBA, NFL, MLB, NHL, WNBA, LoL, CS2, Valorant)
- Prop detail modal with AI insight
- Pick builder with copy-for-PrizePicks export
- Model builder with 7 weighted factors and backtesting
- Auth (Supabase), Stripe subscription, free vs premium limits

## About Page & Hero Image

The `/about` page describes the app and focuses on **Supabase** and **Stripe** integration. To add a dashboard screenshot:

1. Save your image as `public/about-hero.png`
2. It will display on the About page; if missing, a placeholder is shown

## Docs

See [docs/README.md](docs/README.md) for schema, model scoring, and API integration.
