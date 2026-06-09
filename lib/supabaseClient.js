/* Supabase client for the Care Journey saved-account layer.
   Returns null (and saveConfigured = false) when env vars are absent, so the
   whole app runs statelessly with no Supabase dependency until it is wired.
   Uses the Care Journey Supabase project (separate from CFG and the website),
   keyed by the carer's own account. EU residency (eu-west-1). */
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL_CJ;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_CJ;

export const saveConfigured = Boolean(url && anonKey);

// Single browser client. Persists the session so a returning carer stays signed in.
export const supabase = saveConfigured
  ? createClient(url, anonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null;
