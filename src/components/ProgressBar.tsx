export function ProgressBar({ ratio }: { ratio: number }) {
  const pct = Math.min(Math.max(ratio, 0), 1) * 100;
  const achieved = ratio >= 1;

  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
      <div
        className={`h-full rounded-full transition-all ${
          achieved ? "bg-emerald-500" : "bg-amber-500"
        }`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
