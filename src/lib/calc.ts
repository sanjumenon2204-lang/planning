import { Expense, CategoryPlan, CategoryWithPlan, Category } from "./types";

/** Sum of expense amounts for a given category within a set of expenses. */
export function spentForCategory(expenses: Expense[], categoryId: string): number {
  return expenses
    .filter((e) => e.category_id === categoryId)
    .reduce((sum, e) => sum + Number(e.amount), 0);
}

/** Joins categories + their plan for a month + their computed spend. */
export function buildCategoriesWithPlan(
  categories: Category[],
  plans: CategoryPlan[],
  expenses: Expense[]
): CategoryWithPlan[] {
  return categories
    .filter((c) => !c.archived)
    .map((c) => {
      const plan = plans.find((p) => p.category_id === c.id);
      return {
        ...c,
        planned_amount: plan ? Number(plan.planned_amount) : 0,
        spent: spentForCategory(expenses, c.id),
      };
    })
    .sort((a, b) => a.sort_order - b.sort_order);
}

/** Envelope status — warn, don't block. */
export function envelopeStatus(planned: number, spent: number): "ok" | "near" | "over" {
  if (planned <= 0) return spent > 0 ? "over" : "ok";
  const ratio = spent / planned;
  if (ratio > 1) return "over";
  if (ratio >= 0.85) return "near";
  return "ok";
}

export function totalPlanned(categoriesWithPlan: CategoryWithPlan[]): number {
  return categoriesWithPlan.reduce((sum, c) => sum + c.planned_amount, 0);
}

export function totalSpent(categoriesWithPlan: CategoryWithPlan[]): number {
  return categoriesWithPlan.reduce((sum, c) => sum + c.spent, 0);
}

export function needsVsWants(categoriesWithPlan: CategoryWithPlan[]) {
  const needs = categoriesWithPlan.filter((c) => c.type === "need");
  const wants = categoriesWithPlan.filter((c) => c.type === "want");
  return {
    needs: { planned: totalPlanned(needs), spent: totalSpent(needs) },
    wants: { planned: totalPlanned(wants), spent: totalSpent(wants) },
  };
}

/**
 * Month-end balance = salary - total actually spent.
 * This is the amount that transfers into the Savings Pot on close.
 * Can be negative — a negative month is recorded transparently, not hidden.
 */
export function monthBalance(salary: number, totalSpentAmount: number): number {
  return Number(salary) - totalSpentAmount;
}

export function goalProgress(currentAmount: number, targetAmount: number): number {
  if (targetAmount <= 0) return 0;
  return currentAmount / targetAmount;
}

export function formatCurrency(amount: number, currency = "AED"): string {
  return new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function currentPeriod(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
}

export function formatPeriodLabel(period: string): string {
  const d = new Date(period + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}
