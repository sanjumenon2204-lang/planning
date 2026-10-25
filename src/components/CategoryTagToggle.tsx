"use client";

import { useTransition } from "react";
import { updateCategoryTag } from "@/lib/actions";
import { CategoryType } from "@/lib/types";

export function CategoryTagToggle({
  categoryId,
  type,
}: {
  categoryId: string;
  type: CategoryType;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => updateCategoryTag(categoryId, type === "need" ? "want" : "need"))}
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition disabled:opacity-50 ${
        type === "need"
          ? "bg-sky-100 text-sky-800 hover:bg-sky-200"
          : "bg-violet-100 text-violet-800 hover:bg-violet-200"
      }`}
      title="Click to switch between Need / Want"
    >
      {type === "need" ? "Need" : "Want"}
    </button>
  );
}
