export const dynamic = "force-dynamic";

import Link from "next/link";
import {
  isSupabaseConfigured,
  getMonths,
  getCategories,
  getCategoryPlans,
  getExpenses,
  getSavingsTransfers,
} from "@/lib/data";
import { buildCategoriesWithPlan, formatCurrency, formatPeriodLabel, totalPlanned, totalSpent } from "@/lib/calc";
import { SetupNotice } from "@/components/SetupNotice";

export default async function HistoryPage() {
  if (!isSupabaseConfigured) return <SetupNotice />;

  const [months, categories, transfers] = await Promise.all([
    getMonths(),
    getCategories(),
    getSavingsTransfers(),
  ]);

  const rows = await Promise.all(
    months.map(async (month) => {
      const [plans, expenses] = await Promise.all([getCategoryPlans(month.id), getExpenses(month.id)]);
      const categoriesWithPlan = buildCategoriesWithPlan(categories, plans, expenses);
      const planned = totalPlanned(categoriesWithPlan);
      const spent = totalSpent(categoriesWithPlan);
      const transfer = transfers.find((t) => t.month_id === month.id);
      return { month, planned, spent, entryCount: expenses.length, transferAmount: transfer ? Number(transfer.amount) : null };
    })
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-amber-900">Past Months</h1>
      <p className="mt-1 text-sm text-slate-500">
        Every month you&apos;ve planned or logged anything for — nothing here is ever deleted
        automatically.
      </p>

      {rows.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
          No months yet.
        </p>
      ) : (
        <div className="mt-6 divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
          {rows.map(({ month, planned, spent, entryCount, transferAmount }) => (
            <Link
              key={month.id}
              href={`/history/${month.id}`}
              className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-amber-50"
            >
              <div>
                <p className="font-medium text-slate-700">{formatPeriodLabel(month.period)}</p>
                <p className="text-xs text-slate-400">
                  {entryCount} {entryCount === 1 ? "entry" : "entries"} ·{" "}
                  {month.closed ? "closed" : "in progress"}
                </p>
              </div>
              <div className="text-right text-sm">
                <p className="text-slate-600">
                  {formatCurrency(spent)} spent of {formatCurrency(planned)}
                </p>
                {transferAmount !== null && (
                  <p className={transferAmount >= 0 ? "text-emerald-600" : "text-rose-600"}>
                    {transferAmount >= 0 ? "+" : ""}
                    {formatCurrency(transferAmount)} to Savings Pot
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
