# Our Household Budget

A private, two-person monthly budgeting app — for my wife and me, as a pilot. Salary in,
planned budget per category (Needs/Wants), daily hand-logged expenses, a month-end close that
moves whatever's left into a running Savings Pot, and short/long-term goals.

See [`CLAUDE.md`](./CLAUDE.md) for the full product philosophy (it's inspired by Kakeibo,
Kaizen, Mottainai, Dan Sha Ri, the Envelope System, and Ikigai).

## Setup

1. Create a free [Supabase](https://supabase.com) project.
2. In the Supabase SQL editor, run [`supabase/migrations/0001_init.sql`](./supabase/migrations/0001_init.sql).
   This creates the schema and seeds one household with two profiles (Husband / Wife) and the
   default categories.
3. Copy `.env.example` to `.env.local` and fill in your project's URL and anon key (Supabase
   dashboard → Project Settings → API).
4. Install dependencies and run the dev server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Use the "Logging as" switcher in the top
nav to say who's entering an expense — there's no password in the pilot, it's just the two of you.

## Deploying to Vercel

1. Push this repo to GitHub (or your git host of choice).
2. Import the repo in [Vercel](https://vercel.com/new).
3. Add the two env vars from `.env.local` (`NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`) in the Vercel project's Environment Variables settings.
4. Deploy. Both of you can then use the same URL from your own phones/laptops.

## Structure

- `src/lib/data.ts` — reads from Supabase (categories, months, expenses, goals, savings).
- `src/lib/actions.ts` — server actions for every mutation (saving the budget, logging an
  expense, closing a month, managing goals).
- `src/lib/calc.ts` — the domain math (envelope status, month balance, goal progress). See
  `.claude/skills/monthly-budget/SKILL.md` for the rules this must keep.
- `src/app/*` — one route per step of the flow: `/budget`, `/expenses`, `/month-end`, `/goals`,
  `/savings`, and the `/` dashboard.
