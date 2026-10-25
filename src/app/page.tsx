export const dynamic = "force-dynamic";

import {
  isSupabaseConfigured,
  getOrCreateMonth,
  getCategories,
  getCategoryPlans,
  getExpenses,
  getSavingsPot,
  getSavingsTransfers,
  getMonths,
  getGoals,
} from "@/lib/data";
import {
  buildCategoriesWithPlan,
  formatCurrency,
  formatPeriodLabel,
  monthBalance,
  needsVsWants,
  totalPlanned,
  totalSpent,
  goalProgress,
} from "@/lib/calc";
import { SetupNotice } from "@/components/SetupNotice";
import { EnvelopeBar } from "@/components/EnvelopeBar";
import { ProgressBar } from "@/components/ProgressBar";
import Link from "next/link";

export default async function DashboardPage() {
  if (!isSupabaseConfigured) return <SetupNotice />;

  const month = await getOrCreateMonth();
  const [categories, plans, expenses, pot, transfers, months, goals] = await Promise.all([
    getCategories(),
    getCategoryPlans(month.id),
    getExpenses(month.id),
    getSavingsPot(),
    getSavingsTransfers(),
    getMonths(),
    getGoals(),
  ]);

  const categoriesWithPlan = buildCategoriesWithPlan(categories, plans, expenses);
  const planned = totalPlanned(categoriesWithPlan);
  const spent = totalSpent(categoriesWithPlan);
  const balanceSoFar = monthBalance(Number(month.salary), spent);
  const split = needsVsWants(categoriesWithPlan);

  // Kaizen: last 3 closed months' transfers, oldest to newest, for a tiny trend view.
  const recentTransfers = [...transfers]
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
    .slice(-3);
  const maxAbs = Math.max(1, ...recentTransfers.map((t) => Math.abs(Number(t.amount))));

  const topGoals = goals.filter((g) => !g.achieved).slice(0, 2);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-amber-900">{formatPeriodLabel(month.period)}</h1>
      <p className="mt-1 text-sm text-slate-500">Arigato Money — a calm look at where things stand.</p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Salary" value={formatCurrency(Number(month.salary))} />
        <Stat label="Planned" value={formatCurrency(planned)} />
        <Stat label="Spent so far" value={formatCurrency(spent)} />
        <Stat
          label={balanceSoFar >= 0 ? "On pace to save" : "Over, so far"}
          value={formatCurrency(Math.abs(balanceSoFar))}
          tone={balanceSoFar >= 0 ? "good" : "warn"}
        />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-3 text-sm font-medium text-slate-600">Needs vs. Wants</h2>
          <div className="space-y-3">
            <div>
              <p className="mb-1 text-xs text-sky-800">Needs</p>
              <EnvelopeBar planned={split.needs.planned} spent={split.needs.spent} />
            </div>
            <div>
              <p className="mb-1 text-xs text-violet-800">Wants</p>
              <EnvelopeBar planned={split.wants.planned} spent={split.wants.spent} />
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-3 text-sm font-medium text-slate-600">Savings Pot</h2>
          <p className="text-3xl font-bold text-emerald-700">{formatCurrency(Number(pot.balance))}</p>
          <p className="mt-1 text-xs text-slate-400">Grows each time you close a month.</p>
          {recentTransfers.length > 0 && (
            <div className="mt-4 flex items-end gap-2">
              {recentTransfers.map((t) => {
                const h = Math.max(6, (Math.abs(Number(t.amount)) / maxAbs) * 40);
                return (
                  <div key={t.id} className="flex flex-col items-center gap-1">
                    <div
                      className={`w-6 rounded-t ${Number(t.amount) >= 0 ? "bg-emerald-400" : "bg-rose-400"}`}
                      style={{ height: `${h}px` }}
                      title={formatCurrency(Number(t.amount))}
                    />
                  </div>
                );
              })}
              <span className="ml-2 text-[11px] text-slate-400">last {recentTransfers.length} months</span>
            </div>
          )}
        </section>
      </div>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium text-slate-600">Categories at a glance</h2>
          <Link href="/expenses" className="text-xs font-medium text-amber-700 hover:underline">
            Log an expense →
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {categoriesWithPlan.map((c) => (
            <div key={c.id}>
              <p className="mb-1 text-xs text-slate-500">{c.name}</p>
              <EnvelopeBar planned={c.planned_amount} spent={c.spent} />
            </div>
          ))}
        </div>
      </section>

      {topGoals.length > 0 && (
        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-medium text-slate-600">Goals</h2>
            <Link href="/goals" className="text-xs font-medium text-amber-700 hover:underline">
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {topGoals.map((g) => (
              <div key={g.id}>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{g.name}</span>
                  <span>
                    {formatCurrency(Number(g.current_amount))} / {formatCurrency(Number(g.target_amount))}
                  </span>
                </div>
                <div className="mt-1">
                  <ProgressBar ratio={goalProgress(Number(g.current_amount), Number(g.target_amount))} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {months.length <= 1 && (
        <p className="mt-8 text-center text-xs text-slate-400">
          New here? Start on the{" "}
          <Link href="/budget" className="font-medium text-amber-700 hover:underline">
            Budget
          </Link>{" "}
          page to plan this month&apos;s salary and categories.
        </p>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "good" | "warn";
}) {
  const toneClass =
    tone === "good" ? "text-emerald-700" : tone === "warn" ? "text-rose-700" : "text-slate-700";
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
      <p className="text-xs text-slate-400">{label}</p>
      <p className={`mt-1 text-lg font-semibold ${toneClass}`}>{value}</p>
    </div>
  );
}
