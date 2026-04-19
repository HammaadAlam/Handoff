# Handoff

Handoff App for CSC 4330 Software Systems Development.

## Run the app

```bash
npm install
cp .env.example .env
# Optional: add Supabase URL + anon key (see below)
npx expo start
```

## Supabase (Postgres + optional auth)

1. Create a project at [supabase.com](https://supabase.com).
2. **Project Settings → API** → copy **Project URL** and **anon public** key into `.env` as `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
3. Create tables in **Table Editor**; enable **Row Level Security** and policies.
4. Use `getSupabase()` from `src/services/supabase.ts` in your screens.

## Project layout

- `src/context/MarketplaceContext.tsx` — favorites (in-memory demo)
- `src/services/supabase.ts` — Postgres client when configured
- `src/types/domain.ts` — shared domain types (listing, profile, etc.)
