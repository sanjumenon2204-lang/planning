export const dynamic = "force-dynamic";

import {
  isSupabaseConfigured,
  getOrCreateMonth,
  getCategories,
  getCategoryPlans,
  getExpenses,
} from "@/lib/data";
import {
  buildCategoriesWithPlan,
  formatCurrency,
  formatPeriodLabel,
  monthBalance,
  needsVsWants,
  totalPlanned,
  totalSpent,
} from "@/lib/calc";
import { SetupNotice } from "@/components/SetupNotice";
import { EnvelopeBar } from "@/components/EnvelopeBar";
import { SubmitButton } from "@/components/SubmitButton";
import { closeMonth } from "@/lib/actions";

export default async function MonthEndPage() {
  if (!isSupabaseConfigured) return <SetupNotice />;

  const month = await getOrCreateMonth();
  const [categories, plans, expenses] = await Promise.all([
    getCategories(),
    getCategoryPlans(month.id),
    getExpenses(month.id),
  ]);
  const categoriesWithPlan = buildCategoriesWithPlan(categories, plans, expenses);
  const planned = totalPlanned(categoriesWithPlan);
  const spent = totalSpent(categoriesWithPlan);
  const balance = monthBalance(Number(month.salary), spent);
  const split = needsVsWants(categoriesWithPlan);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-amber-900">
        Month-end — {formatPeriodLabel(month.period)}
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Planned vs. actually spent. Whatever&apos;s left moves into the Savings Pot.
      </p>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
          <p className="text-xs text-slate-400">Salary</p>
          <p className="mt-1 text-lg font-semibold text-slate-700">
            {formatCurrency(Number(month.salary))}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
          <p className="text-xs text-slate-400">Planned</p>
          <p className="mt-1 text-lg font-semibold text-slate-700">{formatCurrency(planned)}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
          <p className="text-xs text-slate-400">Spent</p>
          <p className="mt-1 text-lg font-semibold text-slate-700">{formatCurrency(spent)}</p>
        </div>
      </div>

      <div
        className={`mt-4 rounded-xl p-5 text-center ${
          balance >= 0 ? "bg-emerald-50 text-emerald-900" : "bg-rose-50 text-rose-900"
        }`}
      >
        <p className="text-xs uppercase tracking-wide opacity-70">
          {balance >= 0 ? "Balance to Savings Pot" : "Over salary this month"}
        </p>
        <p className="mt-1 text-3xl font-bold">{formatCurrency(balance)}</p>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-sky-200 bg-white p-4">
          <p className="text-sm font-medium text-sky-900">Needs</p>
          <p className="mt-1 text-xs text-slate-500">
            {formatCurrency(split.needs.spent)} of {formatCurrency(split.needs.planned)}
          </p>
        </div>
        <div className="rounded-xl border border-violet-200 bg-white p-4">
          <p className="text-sm font-medium text-violet-900">Wants</p>
          <p className="mt-1 text-xs text-slate-500">
            {formatCurrency(split.wants.spent)} of {formatCurrency(split.wants.planned)}
          </p>
        </div>
      </div>

      <h2 className="mt-8 mb-3 text-sm font-medium text-slate-600">By category</h2>
      <div className="space-y-4">
        {categoriesWithPlan.map((c) => (
          <div key={c.id} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">{c.name}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                  c.type === "need" ? "bg-sky-100 text-sky-800" : "bg-violet-100 text-violet-800"
                }`}
              >
                {c.type === "need" ? "Need" : "Want"}
              </span>
            </div>
            <EnvelopeBar planned={c.planned_amount} spent={c.spent} />
          </div>
        ))}
      </div>

      <div className="mt-8">
        {month.closed ? (
          <div className="rounded-xl bg-slate-100 p-4 text-center text-sm text-slate-500">
            This month is closed. {formatCurrency(balance)} was transferred to the Savings Pot on{" "}
            {month.closed_at ? new Date(month.closed_at).toLocaleDateString() : ""}.
          </div>
        ) : (
          <form action={closeMonth.bind(null, month.id, Number(month.salary), spent)}>
            <SubmitButton
              pendingLabel="Closing…"
              className="w-full rounded-md bg-amber-600 px-4 py-3 text-sm font-medium text-white hover:bg-amber-700"
            >
              Close this month &amp; move {formatCurrency(balance)} to Savings Pot
            </SubmitButton>
          </form>
        )}
      </div>
    </div>
  );
}
