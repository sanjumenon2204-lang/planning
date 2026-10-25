import { Expense, Profile, Category } from "@/lib/types";
import { formatCurrency } from "@/lib/calc";
import { deleteExpense } from "@/lib/actions";

export function ExpenseList({
  expenses,
  categories,
  profiles,
}: {
  expenses: Expense[];
  categories: Category[];
  profiles: Profile[];
}) {
  if (expenses.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
        Nothing logged yet this month. Kakeibo starts with the first entry.
      </p>
    );
  }

  return (
    <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
      {expenses.map((e) => {
        const category = categories.find((c) => c.id === e.category_id);
        const person = profiles.find((p) => p.id === e.logged_by);
        return (
          <div key={e.id} className="flex items-center gap-3 px-4 py-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                {category?.name ?? "Unknown category"}
                <span className="text-xs font-normal text-slate-400">{e.spent_on}</span>
              </div>
              {(e.note || e.mottainai_note) && (
                <p className="text-xs text-slate-500">
                  {e.note}
                  {e.note && e.mottainai_note && " · "}
                  {e.mottainai_note && <span className="text-emerald-600">♻ {e.mottainai_note}</span>}
                </p>
              )}
              {person && <p className="text-xs text-slate-400">logged by {person.label}</p>}
            </div>
            <span className="font-semibold text-slate-700">{formatCurrency(Number(e.amount))}</span>
            <form action={deleteExpense.bind(null, e.id)}>
              <button type="submit" className="text-xs text-slate-400 hover:text-rose-600" title="Remove">
                ✕
              </button>
            </form>
          </div>
        );
      })}
    </div>
  );
}
