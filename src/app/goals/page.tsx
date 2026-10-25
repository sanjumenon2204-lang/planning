export const dynamic = "force-dynamic";

import { isSupabaseConfigured, getGoals, getSavingsPot } from "@/lib/data";
import { formatCurrency, goalProgress } from "@/lib/calc";
import { SetupNotice } from "@/components/SetupNotice";
import { ProgressBar } from "@/components/ProgressBar";
import { createGoal, deleteGoal, updateGoalProgress } from "@/lib/actions";

export default async function GoalsPage() {
  if (!isSupabaseConfigured) return <SetupNotice />;

  const [goals, pot] = await Promise.all([getGoals(), getSavingsPot()]);
  const shortTerm = goals.filter((g) => g.term === "short");
  const longTerm = goals.filter((g) => g.term === "long");

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-amber-900">Goals</h1>
      <p className="mt-1 text-sm text-slate-500">
        Savings Pot right now: <strong>{formatCurrency(Number(pot.balance))}</strong>. Top up a
        goal&apos;s progress whenever you decide to set money aside for it.
      </p>

      <GoalSection title="Short-term" goals={shortTerm} />
      <GoalSection title="Long-term" goals={longTerm} longTerm />

      <section className="mt-10 rounded-xl border border-dashed border-slate-300 p-5">
        <h2 className="font-medium text-slate-700">Add a goal</h2>
        <form action={createGoal} className="mt-3 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs text-slate-500">Name</label>
              <input
                name="name"
                required
                className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm"
                placeholder="e.g. Emergency fund"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500">Term</label>
              <select name="term" className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm">
                <option value="short">Short-term</option>
                <option value="long">Long-term</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500">Target amount (AED)</label>
              <input
                name="targetAmount"
                type="number"
                min={0}
                step="any"
                required
                className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500">Target date (optional)</label>
              <input
                name="targetDate"
                type="date"
                className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm"
              />
            </div>
          </div>

          <details className="rounded-md bg-slate-50 p-3 text-sm">
            <summary className="cursor-pointer font-medium text-slate-600">
              Ikigai reflection (optional, for long-term goals worth sitting with)
            </summary>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <input
                name="ikigaiLove"
                placeholder="What you love"
                className="rounded-md border border-slate-200 px-2 py-1.5 text-sm"
              />
              <input
                name="ikigaiGoodAt"
                placeholder="What you're good at"
                className="rounded-md border border-slate-200 px-2 py-1.5 text-sm"
              />
              <input
                name="ikigaiWorldNeeds"
                placeholder="What the world needs"
                className="rounded-md border border-slate-200 px-2 py-1.5 text-sm"
              />
              <input
                name="ikigaiPaidFor"
                placeholder="What people will pay for"
                className="rounded-md border border-slate-200 px-2 py-1.5 text-sm"
              />
            </div>
          </details>

          <button
            type="submit"
            className="rounded-md border border-amber-300 bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-800 hover:bg-amber-100"
          >
            Add goal
          </button>
        </form>
      </section>
    </div>
  );
}

function GoalSection({
  title,
  goals,
  longTerm,
}: {
  title: string;
  goals: Awaited<ReturnType<typeof getGoals>>;
  longTerm?: boolean;
}) {
  return (
    <section className="mt-6">
      <h2 className="mb-3 text-sm font-medium text-slate-600">{title}</h2>
      {goals.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-sm text-slate-400">
          No {title.toLowerCase()} goals yet.
        </p>
      ) : (
        <div className="space-y-3">
          {goals.map((g) => {
            const ratio = goalProgress(Number(g.current_amount), Number(g.target_amount));
            return (
              <div key={g.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-700">
                    {g.achieved ? "🎉 " : ""}
                    {g.name}
                  </span>
                  <form action={deleteGoal.bind(null, g.id)}>
                    <button type="submit" className="text-xs text-slate-400 hover:text-rose-600">
                      ✕
                    </button>
                  </form>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {formatCurrency(Number(g.current_amount))} of {formatCurrency(Number(g.target_amount))}
                  {g.target_date && ` · by ${new Date(g.target_date).toLocaleDateString()}`}
                </p>
                <div className="mt-2">
                  <ProgressBar ratio={ratio} />
                </div>
                {longTerm && (g.ikigai_love || g.ikigai_good_at || g.ikigai_world_needs || g.ikigai_paid_for) && (
                  <div className="mt-3 grid grid-cols-2 gap-1 text-[11px] text-slate-400 sm:grid-cols-4">
                    {g.ikigai_love && <span>❤ {g.ikigai_love}</span>}
                    {g.ikigai_good_at && <span>✦ {g.ikigai_good_at}</span>}
                    {g.ikigai_world_needs && <span>🌍 {g.ikigai_world_needs}</span>}
                    {g.ikigai_paid_for && <span>💰 {g.ikigai_paid_for}</span>}
                  </div>
                )}
                <form
                  action={async (formData: FormData) => {
                    "use server";
                    const amount = Number(formData.get("currentAmount")) || 0;
                    await updateGoalProgress(g.id, amount);
                  }}
                  className="mt-3 flex items-center gap-2"
                >
                  <input
                    name="currentAmount"
                    type="number"
                    min={0}
                    step="any"
                    defaultValue={Number(g.current_amount)}
                    className="w-32 rounded-md border border-slate-200 px-2 py-1 text-sm"
                  />
                  <button
                    type="submit"
                    className="rounded-md bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200"
                  >
                    Update progress
                  </button>
                </form>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
