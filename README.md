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

---

## React Modules & Libraries

### Core React
- **react** (19.2) – UI library, hooks (`useState`, `useEffect`, `useMemo`, `useContext`, `createContext`)
- **react-dom** (19.2) – DOM rendering

### Forms
- **react-hook-form** (7.x) – Form state, validation, and submission for login/signup. Reduces re-renders and provides built-in validation.

### UI Components (Radix UI)
- **@radix-ui/react-dialog** – Accessible modal dialogs (prop detail, AI insight)
- **@radix-ui/react-tabs** – Sport filter tabs on dashboard
- **@radix-ui/react-slot** – Polymorphic `asChild` prop for Button
- **@radix-ui/react-dropdown-menu** – Dropdown menus (available)
- **@radix-ui/react-select** – Select inputs (available)
- **@radix-ui/react-toast** – Toast notifications (available)

### Utilities
- **class-variance-authority (cva)** – Variant-based styling for Button (default, outline, ghost, etc.)
- **clsx** – Conditional class names
- **tailwind-merge** – Merge Tailwind classes without conflicts
- **lucide-react** – Icons (Zap, Copy, Trash2, X, etc.)

### Next.js
- **next** (16.1) – App Router, `Link`, `useRouter`, API routes, server components
- **next/font** – Geist Sans & Geist Mono

---

## Integrated Platforms

### Supabase
- **Auth** – Email/password signup and login
- **PostgreSQL** – `profiles`, `user_models`, `stripe_customers`
- **Row Level Security (RLS)** – Per-user data access
- **Realtime** – Available for future live updates

**Packages:** `@supabase/supabase-js`, `@supabase/ssr` (for Next.js server/client auth)

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
├── context/                     # AuthProvider
├── data/                        # Mock props
├── lib/                         # Supabase clients, model scoring, utils
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

## Features

- Dashboard with props table (NBA, NFL, MLB, NHL, WNBA, LoL, CS2, Valorant)
- Prop detail modal with AI insight
- Pick builder with copy-for-PrizePicks export
- Model builder with 7 weighted factors and backtesting
- Auth (Supabase), Stripe subscription, free vs premium limits

## Docs

See [docs/README.md](docs/README.md) for schema, model scoring, and API integration.
