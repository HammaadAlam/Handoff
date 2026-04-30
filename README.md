# Handoff

React Native + Expo marketplace app with Supabase-backed data.

This guide is meant to be 1:1 reproducible for someone cloning this repo fresh.

## Prerequisites

- Node.js 20+ and npm
- Expo Go app (for physical device testing), or Android Studio / Xcode simulator
- A Supabase project (free tier is fine)

## 1) Clone and install

```bash
git clone <your-repo-url>
cd 4330-handoff
npm install
```

## 2) Configure environment

```bash
cp .env.example .env
```

Update `.env` with your Supabase values:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

If you also want to apply SQL from this repo with the script, set:

- `SUPABASE_DB_HOST`
- `SUPABASE_DB_PASSWORD` (quote it if it includes `#`)
- Optional: `SUPABASE_DB_PORT`, `SUPABASE_DB_USER`, `SUPABASE_DB_NAME`

## 3) Initialize database schema + seed data

Run:

```bash
npm run db:apply
```

What this now applies in order:

1. `supabase/schema.sql`
2. every `supabase/migrations/*.sql` file (sorted by filename)
3. `supabase/seed.sql`

This gives you the tables, RLS policies, and starter data expected by the app.

## 4) Start the app

```bash
npm run start
```

Then choose one:

- press `i` for iOS simulator
- press `a` for Android emulator
- scan the QR code in Expo Go on your phone

Direct launch commands:

```bash
npm run ios
npm run android
npm run web
```

## Supabase edge function (optional)

If you use AI listing suggestions:

1. Install Supabase CLI
2. Deploy function:

```bash
supabase functions deploy suggest-listing-from-image
```

3. Set secret:

```bash
npx supabase secrets set GEMINI_API_KEY=your_key_here
```

`supabase/config.toml` currently has `verify_jwt = false` for local/dev usage.

## Common issues

- **App runs but data is empty**
  - Confirm `.env` values are correct
  - Re-run `npm run db:apply`
- **`db:apply` fails auth/connection**
  - Verify `SUPABASE_DB_HOST` and `SUPABASE_DB_PASSWORD`
  - If password has `#`, keep it quoted in `.env`
- **Expo build cache weirdness**
  - Stop server and run `npx expo start -c`

## Useful scripts

- `npm run start` - start Expo
- `npm run ios` - open iOS target
- `npm run android` - open Android target
- `npm run web` - open web target
- `npm run db:apply` - apply schema + migrations + seed to Supabase
- `npm run db:emit-seed` - regenerate SQL seed from app catalog
- `npm run db:bundle` - generate bundled setup SQL

## Tech stack

- **Mobile app:** React Native + Expo
- **Language:** TypeScript
- **Navigation/UI:** React Navigation + gesture handler + safe-area context
- **Backend:** Supabase (Postgres, Auth, Edge Functions)
- **Optional local API:** Express (`server/`)
- **DB automation:** Node scripts using `postgres`

## Project structure

- `App.tsx` - app entry point (fonts, providers, navigation container)
- `src/screens` - screen-level UI (auth, tabs, create flow, transaction flow, events)
- `src/components` - reusable UI components
- `src/navigation` - stack/tab navigators and route types
- `src/context` - app-wide state providers (auth, marketplace)
- `src/services` - data access and Supabase integration logic
- `src/hooks` - reusable hooks
- `src/data` - mock/static app data and listing option catalogs
- `src/styles` - global theme, spacing, fonts
- `src/types` - shared domain types
- `src/utils` - helper utilities
- `supabase/schema.sql` - baseline schema
- `supabase/migrations` - incremental SQL migrations
- `supabase/seed.sql` - seed data
- `supabase/functions` - Supabase Edge Functions
- `scripts` - local automation scripts (db apply, seed emit, bundle)
