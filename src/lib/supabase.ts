import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

// Single shared client. Pilot has no auth, so the anon key with open RLS
// (or RLS disabled) for the pilot's one household is enough.
export const supabase = isSupabaseConfigured
  ? createClient(url!, anonKey!)
  : null;

export const HOUSEHOLD_ID = "00000000-0000-0000-0000-000000000001";
