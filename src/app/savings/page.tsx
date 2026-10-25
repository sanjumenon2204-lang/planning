export const dynamic = "force-dynamic";

import { isSupabaseConfigured, getSavingsPot, getSavingsTransfers, getMonths } from "@/lib/data";
import { formatCurrency, formatPeriodLabel } from "@/lib/calc";
import { SetupNotice } from "@/components/SetupNotice";

export default async function SavingsPage() {
  if (!isSupabaseConfigured) return <SetupNotice />;

  const [pot, transfers, months] = await Promise.all([
    getSavingsPot(),
    getSavingsTransfers(),
    getMonths(),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-amber-900">Savings Pot</h1>
      <p className="mt-1 text-sm text-slate-500">
        Every month-end close moves the leftover balance here — this is the household&apos;s running
        savings, separate from day-to-day spending.
      </p>

      <div className="mt-6 rounded-xl bg-emerald-50 p-6 text-center text-emerald-900">
        <p className="text-xs uppercase tracking-wide opacity-70">Current balance</p>
        <p className="mt-1 text-4xl font-bold">{formatCurrency(Number(pot.balance))}</p>
      </div>

      <h2 className="mt-8 mb-3 text-sm font-medium text-slate-600">Transfer history</h2>
      {transfers.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-sm text-slate-400">
          No month has been closed yet — head to Month-End when you&apos;re ready.
        </p>
      ) : (
        <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
          {transfers.map((t) => {
            const month = months.find((m) => m.id === t.month_id);
            return (
              <div key={t.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="text-slate-600">
                  {month ? formatPeriodLabel(month.period) : "Unknown month"}
                </span>
                <span
                  className={`font-semibold ${Number(t.amount) >= 0 ? "text-emerald-600" : "text-rose-600"}`}
                >
                  {Number(t.amount) >= 0 ? "+" : ""}
                  {formatCurrency(Number(t.amount))}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
