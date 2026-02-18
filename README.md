# PropEdge AI - Ultra-MVP

Sports props analytics web app: research player props, build custom models, get AI insights.

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
