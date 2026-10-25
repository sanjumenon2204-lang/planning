import { envelopeStatus, formatCurrency } from "@/lib/calc";

const STYLES = {
  ok: { bar: "bg-emerald-500", chip: "bg-emerald-100 text-emerald-800" },
  near: { bar: "bg-amber-400", chip: "bg-amber-100 text-amber-800" },
  over: { bar: "bg-rose-400", chip: "bg-rose-100 text-rose-800" },
};

const MESSAGES = {
  ok: "On track",
  near: "Getting close",
  over: "A little over — worth a gentle look",
};

export function EnvelopeBar({ planned, spent }: { planned: number; spent: number }) {
  const status = envelopeStatus(planned, spent);
  const pct = planned > 0 ? Math.min((spent / planned) * 100, 100) : spent > 0 ? 100 : 0;
  const style = STYLES[status];

  return (
    <div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${style.bar} transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-1 flex items-center justify-between text-xs">
        <span className="text-slate-500">
          {formatCurrency(spent)} of {formatCurrency(planned)}
        </span>
        <span className={`rounded-full px-2 py-0.5 font-medium ${style.chip}`}>
          {MESSAGES[status]}
        </span>
      </div>
    </div>
  );
}
