export const dynamic = "force-dynamic";

import {
  isSupabaseConfigured,
  getOrCreateMonth,
  getCategories,
  getCategoryPlans,
  getExpenses,
  getProfiles,
} from "@/lib/data";
import { buildCategoriesWithPlan, formatPeriodLabel } from "@/lib/calc";
import { SetupNotice } from "@/components/SetupNotice";
import { ExpenseForm } from "@/components/ExpenseForm";
import { ExpenseList } from "@/components/ExpenseList";

export default async function ExpensesPage() {
  if (!isSupabaseConfigured) return <SetupNotice />;

  const month = await getOrCreateMonth();
  const [categories, plans, expenses, profiles] = await Promise.all([
    getCategories(),
    getCategoryPlans(month.id),
    getExpenses(month.id),
    getProfiles(),
  ]);
  const categoriesWithPlan = buildCategoriesWithPlan(categories, plans, expenses);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-amber-900">
        Daily expenses — {formatPeriodLabel(month.period)}
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Kakeibo: write it down by hand, as it happens. Either of you can log or edit any entry.
      </p>

      <div className="mt-6">
        <ExpenseForm monthId={month.id} categoriesWithPlan={categoriesWithPlan} />
      </div>

      <h2 className="mt-8 mb-3 text-sm font-medium text-slate-600">This month&apos;s entries</h2>
      <ExpenseList expenses={expenses} categories={categories} profiles={profiles} />
    </div>
  );
}
