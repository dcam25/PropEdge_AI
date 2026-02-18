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
- `first_name`, `last_name`, `birthday` (optional)
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

Run migrations in order: `001_initial_schema.sql`, then `002_profiles_name_birthday.sql` (adds first_name, last_name, birthday to profiles).

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

## Email Confirmation & OTP

When Supabase has **Confirm email** enabled (Auth → Providers → Email):

**Magic Link (default):** User gets a link, clicks it, redirects to `/auth/callback`.

**Email OTP (6-digit code):** To enable, edit the Magic Link email template in Supabase Dashboard → Auth → Email Templates. Replace the template body to include `{{ .Token }}`:
```
<h2>One time login code</h2>
<p>Please enter this code: {{ .Token }}</p>
```
Then both signup and login can use the 6-digit code flow.

**Signup flow:** Email → OTP verify → Set password. Optional: skip OTP and use magic link. Profile fields (first name, last name, birthday) are collected at signup and stored in `profiles`.

**Login flow:** Users can sign in with password or choose "Sign in with email code instead" to receive a 6-digit OTP.

1. User receives email with code or link.
2. User enters code or clicks link → Supabase redirects to `/auth/callback?code=...`
3. The callback route exchanges the code for a session and redirects to `/dashboard`.
4. Add `http://localhost:3000/auth/callback` and `https://your-domain.com/auth/callback` to Supabase **Authentication → URL Configuration → Redirect URLs**.

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
