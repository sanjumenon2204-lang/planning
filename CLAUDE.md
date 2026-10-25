# Monthly Home Expense Planner

## What this is
A private household budgeting app for me and my wife. Just the two of us, for now — a pilot.
Not a SaaS product, not for other households (yet). If it works well for us, we'll think about
opening it up later, but don't build for that future today.

## The flow
1. **Salary** — enter the month's salary (a plain editable number).
2. **Budget** — allocate the salary across fixed categories: Rent, Electricity, Water, Wifi,
   Grocery, EMI, Leisure, Travel, Food Outside, Exploring, Parental Support. Each category is
   tagged **Need** or **Want** (pre-tagged with sensible defaults, editable):
   - Needs by default: Rent, Electricity, Water, Wifi, Grocery, EMI, Parental Support
   - Wants by default: Leisure, Travel, Food Outside, Exploring
3. **Daily expenses** — both of us log expenses as they happen, by hand. Either person can add,
   edit, or delete any entry — there's no ownership lock, this is a shared household, not separate
   accounts. Each entry records who logged it, just for visibility.
4. **Month-end** — close the month: show planned vs. actually spent vs. balance, per category and
   overall. Whatever's left over automatically moves into the **Savings Pot** — a running balance
   tracked inside the app (not a real bank integration — we move the real money ourselves).
5. **Goals** — short-term and long-term goals, each with a target amount, a target date, and a
   progress bar fed by the Savings Pot (or topped up manually).

## The philosophy — this shapes product decisions, not just copy
These aren't decoration. When in doubt about a feature, default to the choice that honors these:

- **Kakeibo** — write every expense down by hand. This is why daily logging stays manual and
  front-and-center in the pilot. Don't add bank auto-import; the friction is the point.
- **Arigato Money** — a positive relationship with money. UI copy is encouraging, never
  shaming. Overspending gets a warm nudge, not a red "you failed" message.
- **Kaizen** — 1% better every day. Show month-over-month trends so small improvement is visible.
- **Mottainai** — don't waste what you already have. Expense entries have an optional note for
  "reused something instead of buying new" — worth celebrating, not required.
- **Dan Sha Ri** — less clutter, think before you spend. When a category goes over its planned
  amount, pause with a gentle prompt before confirming the entry — not a hard block.
- **Envelope System** — plan the money before you spend it. Each category's planned amount is
  its envelope; spending against it is tracked and visualized.
- **Ikigai** — for long-term goals, offer (optional, not mandatory) reflection prompts: what we
  love, what we're good at, what the world needs, what people will pay for. This is about
  intentional goals, not just numbers.

## Tech stack
- **Next.js** (App Router) — frontend + API routes.
- **Supabase** (Postgres) — shared data store so both of us see the same household data live.
- **Tailwind CSS** — styling.
- **Vercel** — hosting/deployment.

## People, not accounts
No real authentication in the pilot. A simple "who's logging this — Husband / Wife" switcher is
enough for two trusted people sharing one household. Build it so swapping in real auth later
(e.g. Supabase Auth) is a clean upgrade, not a rewrite — but don't build the auth system now.

## Scope discipline for this pilot
Keep it lean. Specifically avoid, unless asked:
- Bank API integrations or auto-categorization
- Multi-household / multi-tenant support
- Real authentication, roles, or permissions
- A native mobile app (responsive web is enough)
- Any kind of ad/monetization logic

## Data model (summary)
`households` → `profiles` (Husband/Wife labels) → `months` (salary per month) → `categories`
(name, planned_amount, type: needs/wants) → `expenses` (date, category_id, amount, note,
logged_by, month_id) → `savings_pot` (running total + transfer history) → `goals` (name,
term: short/long, target_amount, current_amount, target_date).

## Tone for anything user-facing
Warm, calm, encouraging. This is a household tool for two people trying to build good habits
together — never corporate, never guilt-tripping, never "you overspent, bad job." Think:
a supportive partner, not an auditor.
