"use server";

import { revalidatePath } from "next/cache";
import { supabase, HOUSEHOLD_ID } from "./supabase";
import { monthBalance } from "./calc";

function requireClient() {
  if (!supabase) {
    throw new Error(
      "Supabase isn't configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local."
    );
  }
  return supabase;
}

export async function setSalary(monthId: string, salary: number) {
  const db = requireClient();
  const { error } = await db.from("months").update({ salary }).eq("id", monthId);
  if (error) throw error;
  revalidatePath("/budget");
  revalidatePath("/");
}

export async function setCategoryPlan(monthId: string, categoryId: string, plannedAmount: number) {
  const db = requireClient();
  const { error } = await db
    .from("category_plans")
    .upsert(
      { month_id: monthId, category_id: categoryId, planned_amount: plannedAmount },
      { onConflict: "month_id,category_id" }
    );
  if (error) throw error;
  revalidatePath("/budget");
  revalidatePath("/");
}

/** Saves the whole budget screen in one submit: salary + every category's planned amount. */
export async function saveBudget(monthId: string, formData: FormData) {
  const db = requireClient();

  const salaryRaw = formData.get("salary");
  if (salaryRaw !== null) {
    const salary = Number(salaryRaw) || 0;
    const { error } = await db.from("months").update({ salary }).eq("id", monthId);
    if (error) throw error;
  }

  const planUpserts: { month_id: string; category_id: string; planned_amount: number }[] = [];
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("plan_")) {
      const categoryId = key.slice("plan_".length);
      planUpserts.push({
        month_id: monthId,
        category_id: categoryId,
        planned_amount: Number(value) || 0,
      });
    }
  }
  if (planUpserts.length > 0) {
    const { error } = await db
      .from("category_plans")
      .upsert(planUpserts, { onConflict: "month_id,category_id" });
    if (error) throw error;
  }

  revalidatePath("/budget");
  revalidatePath("/");
  revalidatePath("/expenses");
}

export async function addCategory(monthId: string, formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const type = formData.get("type") === "want" ? "want" : "need";
  const plannedAmount = Number(formData.get("plannedAmount")) || 0;
  if (!name) return;

  const db = requireClient();
  const { data: maxSort } = await db
    .from("categories")
    .select("sort_order")
    .eq("household_id", HOUSEHOLD_ID)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: category, error } = await db
    .from("categories")
    .insert({
      household_id: HOUSEHOLD_ID,
      name,
      type,
      sort_order: (maxSort?.sort_order ?? 0) + 1,
    })
    .select("*")
    .single();
  if (error) throw error;

  await db
    .from("category_plans")
    .insert({ month_id: monthId, category_id: category.id, planned_amount: plannedAmount });

  revalidatePath("/budget");
  revalidatePath("/expenses");
  revalidatePath("/");
}

export async function updateCategoryTag(categoryId: string, type: "need" | "want") {
  const db = requireClient();
  const { error } = await db.from("categories").update({ type }).eq("id", categoryId);
  if (error) throw error;
  revalidatePath("/budget");
  revalidatePath("/");
}

export async function addExpense(input: {
  monthId: string;
  categoryId: string;
  amount: number;
  note?: string;
  mottainaiNote?: string;
  spentOn: string;
  loggedBy?: string | null;
}) {
  const db = requireClient();
  const { error } = await db.from("expenses").insert({
    month_id: input.monthId,
    category_id: input.categoryId,
    amount: input.amount,
    note: input.note || null,
    mottainai_note: input.mottainaiNote || null,
    spent_on: input.spentOn,
    logged_by: input.loggedBy || null,
  });
  if (error) throw error;
  revalidatePath("/expenses");
  revalidatePath("/");
  revalidatePath("/month-end");
}

/** Form-friendly wrapper around addExpense for the Expenses page's log form. */
export async function logExpense(monthId: string, formData: FormData) {
  const categoryId = String(formData.get("categoryId") || "");
  const amount = Number(formData.get("amount")) || 0;
  const note = String(formData.get("note") || "");
  const mottainaiNote = String(formData.get("mottainaiNote") || "");
  const spentOn = String(formData.get("spentOn") || new Date().toISOString().slice(0, 10));
  const loggedBy = String(formData.get("loggedBy") || "");

  if (!categoryId || amount <= 0) return;

  await addExpense({
    monthId,
    categoryId,
    amount,
    note,
    mottainaiNote,
    spentOn,
    loggedBy: loggedBy || null,
  });
}

export async function deleteExpense(expenseId: string) {
  const db = requireClient();
  const { error } = await db.from("expenses").delete().eq("id", expenseId);
  if (error) throw error;
  revalidatePath("/expenses");
  revalidatePath("/");
  revalidatePath("/month-end");
}

/**
 * Closes a month: records the salary-minus-spend balance as a savings
 * transfer and folds it into the running pot. See
 * .claude/skills/monthly-budget/SKILL.md for the formula this must keep.
 */
export async function closeMonth(monthId: string, salary: number, totalSpent: number) {
  const db = requireClient();
  const balance = monthBalance(salary, totalSpent);

  const { error: transferError } = await db
    .from("savings_transfers")
    .insert({ household_id: HOUSEHOLD_ID, month_id: monthId, amount: balance });
  if (transferError) throw transferError;

  const { data: pot, error: potError } = await db
    .from("savings_pot")
    .select("*")
    .eq("household_id", HOUSEHOLD_ID)
    .single();
  if (potError) throw potError;

  const { error: updateError } = await db
    .from("savings_pot")
    .update({ balance: Number(pot.balance) + balance, updated_at: new Date().toISOString() })
    .eq("household_id", HOUSEHOLD_ID);
  if (updateError) throw updateError;

  const { error: closeError } = await db
    .from("months")
    .update({ closed: true, closed_at: new Date().toISOString() })
    .eq("id", monthId);
  if (closeError) throw closeError;

  revalidatePath("/month-end");
  revalidatePath("/savings");
  revalidatePath("/goals");
  revalidatePath("/");
}

export async function createGoal(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const term = formData.get("term") === "long" ? "long" : "short";
  const targetAmount = Number(formData.get("targetAmount")) || 0;
  const targetDate = String(formData.get("targetDate") || "");
  if (!name || targetAmount <= 0) return;

  const db = requireClient();
  const { error } = await db.from("goals").insert({
    household_id: HOUSEHOLD_ID,
    name,
    term,
    target_amount: targetAmount,
    target_date: targetDate || null,
    ikigai_love: String(formData.get("ikigaiLove") || "") || null,
    ikigai_good_at: String(formData.get("ikigaiGoodAt") || "") || null,
    ikigai_world_needs: String(formData.get("ikigaiWorldNeeds") || "") || null,
    ikigai_paid_for: String(formData.get("ikigaiPaidFor") || "") || null,
  });
  if (error) throw error;
  revalidatePath("/goals");
}

export async function updateGoalProgress(goalId: string, currentAmount: number) {
  const db = requireClient();
  const { data: goal, error: fetchError } = await db
    .from("goals")
    .select("target_amount")
    .eq("id", goalId)
    .single();
  if (fetchError) throw fetchError;

  const achieved = currentAmount >= Number(goal.target_amount);

  const { error } = await db
    .from("goals")
    .update({ current_amount: currentAmount, achieved })
    .eq("id", goalId);
  if (error) throw error;
  revalidatePath("/goals");
  revalidatePath("/");
}

export async function deleteGoal(goalId: string) {
  const db = requireClient();
  const { error } = await db.from("goals").delete().eq("id", goalId);
  if (error) throw error;
  revalidatePath("/goals");
}
