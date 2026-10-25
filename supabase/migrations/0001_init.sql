-- Monthly Home Expense Planner — initial schema
-- Pilot scope: a single household shared by two profiles (Husband / Wife), no auth.

create extension if not exists "pgcrypto";

create table if not exists households (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Our Household',
  created_at timestamptz not null default now()
);

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  label text not null, -- 'Husband' | 'Wife'
  created_at timestamptz not null default now()
);

create table if not exists months (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  period date not null, -- first day of the month, e.g. 2026-10-01
  salary numeric(12, 2) not null default 0,
  closed boolean not null default false,
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (household_id, period)
);

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  name text not null,
  type text not null check (type in ('need', 'want')),
  sort_order int not null default 0,
  archived boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists category_plans (
  id uuid primary key default gen_random_uuid(),
  month_id uuid not null references months(id) on delete cascade,
  category_id uuid not null references categories(id) on delete cascade,
  planned_amount numeric(12, 2) not null default 0,
  unique (month_id, category_id)
);

create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  month_id uuid not null references months(id) on delete cascade,
  category_id uuid not null references categories(id) on delete restrict,
  logged_by uuid references profiles(id) on delete set null,
  amount numeric(12, 2) not null check (amount > 0),
  note text,
  mottainai_note text, -- optional: "reused/avoided buying new" note
  spent_on date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists savings_pot (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null unique references households(id) on delete cascade,
  balance numeric(12, 2) not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists savings_transfers (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  month_id uuid not null unique references months(id) on delete cascade,
  amount numeric(12, 2) not null, -- can be negative
  created_at timestamptz not null default now()
);

create table if not exists goals (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  name text not null,
  term text not null check (term in ('short', 'long')),
  target_amount numeric(12, 2) not null,
  current_amount numeric(12, 2) not null default 0,
  target_date date,
  ikigai_love text,
  ikigai_good_at text,
  ikigai_world_needs text,
  ikigai_paid_for text,
  achieved boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_expenses_month on expenses(month_id);
create index if not exists idx_expenses_category on expenses(category_id);
create index if not exists idx_category_plans_month on category_plans(month_id);

-- Seed: one household, two profiles, default categories (needs/wants per CLAUDE.md).
insert into households (id, name)
values ('00000000-0000-0000-0000-000000000001', 'Our Household')
on conflict (id) do nothing;

insert into profiles (household_id, label)
select '00000000-0000-0000-0000-000000000001', label
from (values ('Husband'), ('Wife')) as p(label)
where not exists (
  select 1 from profiles where household_id = '00000000-0000-0000-0000-000000000001'
);

insert into savings_pot (household_id, balance)
values ('00000000-0000-0000-0000-000000000001', 0)
on conflict (household_id) do nothing;

insert into categories (household_id, name, type, sort_order)
select '00000000-0000-0000-0000-000000000001', name, type, sort_order
from (values
  ('Rent', 'need', 1),
  ('Electricity', 'need', 2),
  ('Water', 'need', 3),
  ('Wifi', 'need', 4),
  ('Grocery', 'need', 5),
  ('EMI', 'need', 6),
  ('Parental Support', 'need', 7),
  ('Leisure', 'want', 8),
  ('Travel', 'want', 9),
  ('Food Outside', 'want', 10),
  ('Exploring', 'want', 11)
) as c(name, type, sort_order)
where not exists (
  select 1 from categories where household_id = '00000000-0000-0000-0000-000000000001'
);
