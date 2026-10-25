import { supabase, HOUSEHOLD_ID, isSupabaseConfigured } from "./supabase";
import {
  Category,
  CategoryPlan,
  Expense,
  Goal,
  Month,
  Profile,
  SavingsPot,
  SavingsTransfer,
} from "./types";
import { currentPeriod } from "./calc";

function requireClient() {
  if (!supabase) {
    throw new Error(
      "Supabase isn't configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local (see .env.example)."
    );
  }
  return supabase;
}

export { isSupabaseConfigured };

export async function getProfiles(): Promise<Profile[]> {
  const db = requireClient();
  const { data, error } = await db
    .from("profiles")
    .select("*")
    .eq("household_id", HOUSEHOLD_ID)
    .order("label");
  if (error) throw error;
  return data ?? [];
}

export async function getCategories(): Promise<Category[]> {
  const db = requireClient();
  const { data, error } = await db
    .from("categories")
    .select("*")
    .eq("household_id", HOUSEHOLD_ID)
    .eq("archived", false)
    .order("sort_order");
  if (error) throw error;
  return data ?? [];
}

export async function getMonths(): Promise<Month[]> {
  const db = requireClient();
  const { data, error } = await db
    .from("months")
    .select("*")
    .eq("household_id", HOUSEHOLD_ID)
    .order("period", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

/** Returns the month row for a period, creating it (with plans copied from the
 * most recent prior month, if any) when it doesn't exist yet. */
export async function getOrCreateMonth(period: string = currentPeriod()): Promise<Month> {
  const db = requireClient();
  const { data: existing, error: findError } = await db
    .from("months")
    .select("*")
    .eq("household_id", HOUSEHOLD_ID)
    .eq("period", period)
    .maybeSingle();
  if (findError) throw findError;
  if (existing) return existing;

  const { data: created, error: createError } = await db
    .from("months")
    .insert({ household_id: HOUSEHOLD_ID, period, salary: 0 })
    .select("*")
    .single();
  if (createError) throw createError;

  // Copy last month's plan as a starting point (recurring categories like Rent/EMI/Wifi).
  const { data: priorMonth } = await db
    .from("months")
    .select("*")
    .eq("household_id", HOUSEHOLD_ID)
    .neq("id", created.id)
    .order("period", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (priorMonth) {
    const { data: priorPlans } = await db
      .from("category_plans")
      .select("*")
      .eq("month_id", priorMonth.id);
    if (priorPlans && priorPlans.length > 0) {
      await db.from("category_plans").insert(
        priorPlans.map((p) => ({
          month_id: created.id,
          category_id: p.category_id,
          planned_amount: p.planned_amount,
        }))
      );
    }
  }

  return created;
}

export async function getCategoryPlans(monthId: string): Promise<CategoryPlan[]> {
  const db = requireClient();
  const { data, error } = await db.from("category_plans").select("*").eq("month_id", monthId);
  if (error) throw error;
  return data ?? [];
}

export async function getExpenses(monthId: string): Promise<Expense[]> {
  const db = requireClient();
  const { data, error } = await db
    .from("expenses")
    .select("*")
    .eq("month_id", monthId)
    .order("spent_on", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getSavingsPot(): Promise<SavingsPot> {
  const db = requireClient();
  const { data, error } = await db
    .from("savings_pot")
    .select("*")
    .eq("household_id", HOUSEHOLD_ID)
    .single();
  if (error) throw error;
  return data;
}

export async function getSavingsTransfers(): Promise<SavingsTransfer[]> {
  const db = requireClient();
  const { data, error } = await db
    .from("savings_transfers")
    .select("*")
    .eq("household_id", HOUSEHOLD_ID)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getGoals(): Promise<Goal[]> {
  const db = requireClient();
  const { data, error } = await db
    .from("goals")
    .select("*")
    .eq("household_id", HOUSEHOLD_ID)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}
