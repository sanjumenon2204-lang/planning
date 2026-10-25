export const dynamic = "force-dynamic";

import { isSupabaseConfigured, getOrCreateMonth, getCategories, getCategoryPlans } from "@/lib/data";
import { buildCategoriesWithPlan, formatPeriodLabel, totalPlanned } from "@/lib/calc";
import { SetupNotice } from "@/components/SetupNotice";
import { saveBudget, addCategory } from "@/lib/actions";
import { CategoryTagToggle } from "@/components/CategoryTagToggle";
import { SubmitButton } from "@/components/SubmitButton";
import { CategoryWithPlan } from "@/lib/types";

function CategoryRow({ category }: { category: CategoryWithPlan }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <span className="flex-1 text-sm font-medium text-slate-700">{category.name}</span>
      <CategoryTagToggle categoryId={category.id} type={category.type} />
      <div className="flex items-center gap-1">
        <span className="text-sm text-slate-400">AED</span>
        <input
          type="number"
          name={`plan_${category.id}`}
          defaultValue={category.planned_amount || ""}
          min={0}
          step="any"
          placeholder="0"
          className="w-28 rounded-md border border-slate-200 px-2 py-1 text-sm focus:border-amber-400 focus:outline-none"
        />
      </div>
    </div>
  );
}

export default async function BudgetPage() {
  if (!isSupabaseConfigured) return <SetupNotice />;

  const month = await getOrCreateMonth();
  const [categories, plans] = await Promise.all([getCategories(), getCategoryPlans(month.id)]);
  const categoriesWithPlan = buildCategoriesWithPlan(categories, plans, []);
  const needs = categoriesWithPlan.filter((c) => c.type === "need");
  const wants = categoriesWithPlan.filter((c) => c.type === "want");
  const planned = totalPlanned(categoriesWithPlan);
  const leftToPlan = Number(month.salary) - planned;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-amber-900">
        Plan for {formatPeriodLabel(month.period)}
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        The Envelope System: decide where the money goes before it&apos;s spent.
      </p>

      <form action={saveBudget.bind(null, month.id)} className="mt-6 space-y-8">
        <section className="rounded-xl border border-amber-200 bg-white p-5">
          <label className="block text-sm font-medium text-slate-700">This month&apos;s salary</label>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-slate-400">AED</span>
            <input
              type="number"
              name="salary"
              defaultValue={month.salary || ""}
              min={0}
              step="any"
              className="w-48 rounded-md border border-slate-200 px-3 py-2 text-lg focus:border-amber-400 focus:outline-none"
            />
          </div>
        </section>

        <section className="rounded-xl border border-sky-200 bg-white p-5">
          <h2 className="font-medium text-sky-900">Needs</h2>
          <div className="mt-2 divide-y divide-slate-100">
            {needs.map((c) => (
              <CategoryRow key={c.id} category={c} />
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-violet-200 bg-white p-5">
          <h2 className="font-medium text-violet-900">Wants</h2>
          <div className="mt-2 divide-y divide-slate-100">
            {wants.map((c) => (
              <CategoryRow key={c.id} category={c} />
            ))}
          </div>
        </section>

        <div className="flex items-center justify-between rounded-xl bg-amber-50 p-4">
          <span className="text-sm text-amber-900">
            Planned so far: <strong>{planned.toFixed(0)} AED</strong> ·{" "}
            {leftToPlan >= 0
              ? `${leftToPlan.toFixed(0)} AED left to plan`
              : `${Math.abs(leftToPlan).toFixed(0)} AED over your salary — worth a look`}
          </span>
          <SubmitButton
            pendingLabel="Saving…"
            className="rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
          >
            Save plan
          </SubmitButton>
        </div>
      </form>

      <section className="mt-10 rounded-xl border border-dashed border-slate-300 p-5">
        <h2 className="font-medium text-slate-700">Add a new category</h2>
        <form action={addCategory.bind(null, month.id)} className="mt-3 flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs text-slate-500">Name</label>
            <input
              name="name"
              required
              className="rounded-md border border-slate-200 px-2 py-1 text-sm"
              placeholder="e.g. Pet Care"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500">Type</label>
            <select name="type" className="rounded-md border border-slate-200 px-2 py-1 text-sm">
              <option value="need">Need</option>
              <option value="want">Want</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-500">Planned amount</label>
            <input
              name="plannedAmount"
              type="number"
              min={0}
              step="any"
              className="w-28 rounded-md border border-slate-200 px-2 py-1 text-sm"
              placeholder="0"
            />
          </div>
          <SubmitButton
            pendingLabel="Adding…"
            className="rounded-md border border-amber-300 bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-800 hover:bg-amber-100"
          >
            Add category
          </SubmitButton>
        </form>
      </section>
    </div>
  );
}
