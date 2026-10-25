"use client";

import { usePerson } from "./PersonContext";

export function PersonSwitcher() {
  const { profiles, personId, setPersonId } = usePerson();

  if (profiles.length === 0) return null;

  return (
    <div className="flex items-center gap-1 rounded-full bg-amber-100 p-1 text-sm">
      <span className="px-2 text-xs text-amber-700">Logging as</span>
      {profiles.map((p) => (
        <button
          key={p.id}
          type="button"
          onClick={() => setPersonId(p.id)}
          className={`rounded-full px-3 py-1 font-medium transition ${
            personId === p.id
              ? "bg-amber-600 text-white shadow"
              : "text-amber-800 hover:bg-amber-200"
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
