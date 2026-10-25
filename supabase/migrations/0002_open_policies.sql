-- Pilot-scope RLS policies.
-- No real auth yet (see CLAUDE.md) — both of you share one open household via the
-- publishable/anon key, so every table gets full read/write for anon + authenticated.
-- When real auth is added later, these get replaced with household-scoped policies
-- instead of a rewrite.

do $$
declare
  t text;
begin
  for t in
    select unnest(array[
      'households', 'profiles', 'months', 'categories',
      'category_plans', 'expenses', 'savings_pot', 'savings_transfers', 'goals'
    ])
  loop
    execute format('alter table %I enable row level security;', t);
    execute format('drop policy if exists "pilot_open_access" on %I;', t);
    execute format(
      'create policy "pilot_open_access" on %I for all to anon, authenticated using (true) with check (true);',
      t
    );
  end loop;
end $$;
