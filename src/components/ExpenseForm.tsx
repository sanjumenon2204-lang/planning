"use client";

import { useMemo, useState } from "react";
import { usePerson } from "./PersonContext";
import { logExpense } from "@/lib/actions";
import { envelopeStatus, formatCurrency } from "@/lib/calc";
import { CategoryWithPlan } from "@/lib/types";

export function ExpenseForm({
  monthId,
  categoriesWithPlan,
}: {
  monthId: string;
  categoriesWithPlan: CategoryWithPlan[];
}) {
  const { personId } = usePerson();
  const [categoryId, setCategoryId] = useState(categoriesWithPlan[0]?.id ?? "");
  const [amount, setAmount] = useState("");

  const selected = categoriesWithPlan.find((c) => c.id === categoryId);
  const projectedSpent = (selected?.spent ?? 0) + (Number(amount) || 0);
  const status = selected ? envelopeStatus(selected.planned_amount, projectedSpent) : "ok";

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  return (
    <form
      action={logExpense.bind(null, monthId)}
      className="space-y-3 rounded-xl border border-amber-200 bg-white p-5"
    >
      <input type="hidden" name="loggedBy" value={personId ?? ""} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="col-span-2">
          <label className="block text-xs text-slate-500">Category</label>
          <select
            name="categoryId"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm"
          >
            {categoriesWithPlan.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.type === "need" ? "Need" : "Want"})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-slate-500">Amount (AED)</label>
          <input
            name="amount"
            type="number"
            min={0}
            step="any"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-500">Date</label>
          <input
            name="spentOn"
            type="date"
            defaultValue={today}
            className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm"
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-xs text-slate-500">Note (optional)</label>
          <input
            name="note"
            className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm"
            placeholder="What was it for?"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-500">
            Reused / avoided waste? <span className="text-slate-400">(Mottainai)</span>
          </label>
          <input
            name="mottainaiNote"
            className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm"
            placeholder="e.g. used leftovers instead of ordering in"
          />
        </div>
      </div>

      {status === "over" && (
        <p className="rounded-md bg-rose-50 px-3 py-2 text-xs text-rose-700">
          This would put <strong>{selected?.name}</strong> a little over its plan
          ({formatCurrency(selected?.planned_amount ?? 0)}). No pressure — just worth a quick
          pause before you confirm.
        </p>
      )}
      {status === "near" && (
        <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700">
          <strong>{selected?.name}</strong> is getting close to its planned amount.
        </p>
      )}

      <button
        type="submit"
        className="rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
      >
        Log expense
      </button>
    </form>
  );
}
