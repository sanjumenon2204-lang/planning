---
name: monthly-budget
description: Use when working on this household budgeting app — adding/editing budget categories, changing month-end close logic, savings pot transfers, or goal progress calculations. Covers where the core domain logic lives and the rules it must keep.
---

# Monthly Budget App — domain logic guide

Read `CLAUDE.md` at the project root first for the product philosophy. This skill is about
*where things live* and *what must stay true* when editing the core logic.

## Categories (Needs vs Wants)
- Default category list and their default Need/Want tag live in the categories seed/config
  (`lib/categories.ts` or the `categories` table default rows — check both, the table is the
  source of truth once a household has customized it).
- Default tags: Rent, Electricity, Water, Wifi, Grocery, EMI, Parental Support → **Need**.
  Leisure, Travel, Food Outside, Exploring → **Want**.
- The tag is editable per household. Never hardcode the Need/Want split in UI components —
  always read it from the category record, so an edited tag is respected everywhere (dashboard
  split charts, month-end summary, etc.).
- Adding a new category: insert into `categories` for the household with a `planned_amount` and
  a `type` (needs/wants). Don't assume a fixed enum of category names anywhere in business logic
  — the list must stay extensible.

## Envelope warning (not a hard block)
- When logging an expense, compare the category's running spent total (sum of `expenses` for
  that category + month) against its `planned_amount`.
- If spent > planned: show a warm, non-blocking warning ("heads up, this category's a little
  over its plan") — never prevent the save. This is a deliberate product rule (Dan Sha Ri /
  Arigato Money tone) — don't change it to a hard block without the user explicitly asking.

## Month-end close logic
Formula, per category and in total:
```
balance = planned_amount - sum(expenses for that category in that month)
total_balance = sum(salary) - sum(all expenses in that month)
```
On month-end close:
1. Compute `total_balance` for the month.
2. Append a transfer record to `savings_pot` history with `{ month_id, amount: total_balance, date }`.
3. Update the running `savings_pot` total by adding `total_balance` (it can be negative — a
   negative month still must be recorded transparently, not hidden).
4. Mark the month as closed so expenses can't silently be added to a closed month without a
   visible "editing a closed month" indicator.

## Goals ↔ Savings Pot
- A goal's `current_amount` is either manually topped up, or can be linked to pull from the
  Savings Pot total — when displaying progress, always read the live Savings Pot balance rather
  than caching a stale copy, since multiple goals may reference the same pot.
- Progress bar = `current_amount / target_amount`, capped visually at 100% but allow the
  underlying number to exceed it (goal overachieved is worth celebrating, not clipping silently).

## Tone reminder
Any user-facing copy you write (warnings, empty states, confirmations) should read like a
supportive partner, not an auditor — see the "Tone" section of `CLAUDE.md`. Avoid words like
"failed," "overspent" in isolation without context, or red/alarm styling for routine variance.

## Scope discipline
Don't add authentication, multi-household support, or bank integrations while working in this
skill's area unless the user explicitly asks — see `CLAUDE.md` → Scope discipline.
