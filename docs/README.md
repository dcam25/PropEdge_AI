# PropEdge AI - Ultra-MVP Documentation

## Overview

PropEdge AI is a sports props analytics web app that lets users research multi-sport player props (PrizePicks/Underdog style) and apply custom weighted models to get an edge score on each prop.

## Tech Stack

- **Frontend:** Next.js 16, Tailwind CSS v4, Radix UI (shadcn-style components)
- **Backend:** Supabase (Auth, Postgres, RLS)
- **AI:** OpenAI-compatible API (Grok, Claude, GPT-4o-mini, etc.)
- **Payments:** Stripe (Checkout + Customer Portal)

## Project Structure

```
src/
├── app/
│   ├── (auth)/login, signup
│   ├── api/
│   │   ├── ai-insight/      # LLM insight generation
│   │   └── stripe/          # checkout, webhook, portal
│   ├── dashboard/           # Main props table + pick builder
│   ├── models/              # Model builder
│   └── pricing/
├── components/
├── context/                 # AuthProvider
├── data/                    # Mock props
├── lib/                     # Supabase, model scoring, utils
└── types/
```

## Database Schema

### `profiles`
- `id` (UUID, FK → auth.users)
- `email`
- `is_premium` (boolean)
- `ai_insights_used_today`, `ai_insights_date` (for free tier limit)
- `created_at`, `updated_at`

### `user_models`
- `id`, `user_id`, `name`, `description`
- `factors` (JSONB): `[{ id, name, weight }]`
- `performance_score`, `is_active`
- `created_at`, `updated_at`

### `stripe_customers`
- `user_id`, `stripe_customer_id`

Run `supabase/migrations/001_initial_schema.sql` in Supabase SQL Editor.

## Model Scoring

The Model Edge % is computed via a weighted formula:

```
edge = Σ (factor_score × factor_weight) / Σ factor_weight
```

Each factor (recent_form, matchup_difficulty, pace, etc.) returns a 0–100 score based on prop data. Weights are 0–100% and must sum to 100 for normalization.

**Factors:**
- `recent_form`: hit rate × 100
- `matchup_difficulty`: 50 + trend × 5
- `pace`, `usage_minutes`, `home_away`, `rest_days`, `sample_size`: derived from prop stats

See `src/lib/model-scoring.ts`.

## Real Props API Integration

To plug in a real odds/props API (e.g. OpticOdds):

1. **Data shape:** Map API response to `Prop` type in `src/types/index.ts`.
2. **Fetch:** Create `src/lib/props-api.ts` with `fetchProps(sport, date)`.
3. **Replace mock:** In `src/app/dashboard/page.tsx`, replace `MOCK_PROPS` with a server fetch or client-side `useEffect` calling your API.
4. **Caching:** Add React Query or SWR for caching; consider server-side fetch for SEO.

## Environment Variables

Copy `.env.example` to `.env.local` and fill in:

- Supabase URL and keys
- Stripe secret, webhook secret, price ID
- AI API key and optional URL/model override

## Stripe Setup

1. Create a Product + recurring Price ($19.99/mo) in Stripe Dashboard.
2. Set `STRIPE_PRICE_ID` to the price ID.
3. Add webhook endpoint: `https://your-domain.com/api/stripe/webhook`
4. Events: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`
5. Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET`.

## Deployment

- **Vercel:** Connect repo, add env vars, deploy.
- **Supabase:** Run migrations, enable Auth (email/password).
- **Stripe:** Use live keys and update webhook URL for production.

## Free vs Premium

| Feature        | Free | Premium |
|----------------|------|---------|
| AI Insights    | 5/day | Unlimited |
| Custom Models  | 1 | 10 |
| Backtesting    | Basic | Full |
