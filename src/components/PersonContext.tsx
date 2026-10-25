"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Profile } from "@/lib/types";

interface PersonContextValue {
  profiles: Profile[];
  personId: string | null;
  personLabel: string | null;
  setPersonId: (id: string) => void;
}

const PersonContext = createContext<PersonContextValue | null>(null);

const STORAGE_KEY = "mp-person-id";

export function PersonProvider({
  profiles,
  children,
}: {
  profiles: Profile[];
  children: React.ReactNode;
}) {
  const [personId, setPersonIdState] = useState<string | null>(null);

  useEffect(() => {
    // Reading localStorage must happen after mount to avoid a server/client
    // hydration mismatch, so this one-time sync can't move out of an effect.
    const stored = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    /* eslint-disable react-hooks/set-state-in-effect */
    if (stored && profiles.some((p) => p.id === stored)) {
      setPersonIdState(stored);
    } else if (profiles.length > 0) {
      setPersonIdState(profiles[0].id);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function setPersonId(id: string) {
    setPersonIdState(id);
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
      // ignore — localStorage can be unavailable (private mode, etc.)
    }
  }

  const personLabel = profiles.find((p) => p.id === personId)?.label ?? null;

  return (
    <PersonContext.Provider value={{ profiles, personId, personLabel, setPersonId }}>
      {children}
    </PersonContext.Provider>
  );
}

export function usePerson() {
  const ctx = useContext(PersonContext);
  if (!ctx) throw new Error("usePerson must be used within a PersonProvider");
  return ctx;
}
