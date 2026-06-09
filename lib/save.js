/* Care Journey - saved-account data access.
   Every function is a safe no-op when the layer is disabled or unconfigured.
   Enforces the D&C rules in code as well as in the DB:
     - persist ONLY on explicit opt-in (consent.save)
     - store the condition ONLY with separate granular consent (consent.condition)
     - never collect or send cared-for-person identifiers
     - store the OUTWARD postcode only, never the full postcode. */
import { SAVE_ENABLED, CONSENT_VERSION } from './flags';
import { supabase, saveConfigured } from './supabaseClient';

const TABLE = 'care_journey_saves';

export function saveEnabled() {
  return SAVE_ENABLED && saveConfigured;
}

export async function getUser() {
  if (!saveEnabled()) return null;
  const { data } = await supabase.auth.getUser();
  return data ? data.user : null;
}

export function onAuthChange(cb) {
  if (!saveEnabled()) return () => {};
  const { data } = supabase.auth.onAuthStateChange((_event, session) => cb(session ? session.user : null));
  return () => data.subscription.unsubscribe();
}

// Magic-link sign-in. The "account" is the carer's email, shared across TCA tools.
export async function sendMagicLink(email, redirectTo) {
  if (!saveEnabled()) return { ok: false, reason: 'disabled' };
  const { error } = await supabase.auth.signInWithOtp({
    email: String(email).trim().toLowerCase(),
    options: { emailRedirectTo: redirectTo || (typeof window !== 'undefined' ? window.location.href : undefined) },
  });
  return error ? { ok: false, reason: error.message } : { ok: true };
}

export async function signOut() {
  if (!saveEnabled()) return;
  await supabase.auth.signOut();
}

// Returns the carer's saved journey, or null. RLS guarantees it is their own row.
export async function loadJourney() {
  if (!saveEnabled()) return null;
  const user = await getUser();
  if (!user) return null;
  const { data, error } = await supabase.from(TABLE).select('*').eq('user_id', user.id).maybeSingle();
  if (error) return null;
  return data || null;
}

/* Upsert the saved journey.
   payload: { triggerId, stepState, conditionId, outwardPostcode }
   consent: { save: boolean (required), condition: boolean }
   The condition is written ONLY when consent.condition is true; otherwise it is
   explicitly nulled so withdrawing consent removes the special-category value. */
export async function saveJourney(payload, consent) {
  if (!saveEnabled()) return { ok: false, reason: 'disabled' };
  if (!consent || consent.save !== true) return { ok: false, reason: 'no-consent' };
  const user = await getUser();
  if (!user) return { ok: false, reason: 'not-signed-in' };

  const row = {
    user_id: user.id,
    consent_save: true,
    consent_save_at: new Date().toISOString(),
    consent_version: CONSENT_VERSION,
    consent_condition: consent.condition === true,
    trigger_id: payload.triggerId,
    step_state: payload.stepState || {},
    condition_id: consent.condition === true ? (payload.conditionId || null) : null,
    outward_postcode: payload.outwardPostcode || null,
    last_active_at: new Date().toISOString(),
  };

  const { error } = await supabase.from(TABLE).upsert(row, { onConflict: 'user_id' });
  return error ? { ok: false, reason: error.message } : { ok: true };
}

// Right to erasure (the carer's own data). Deletes their saved journey.
export async function deleteJourney() {
  if (!saveEnabled()) return { ok: false, reason: 'disabled' };
  const user = await getUser();
  if (!user) return { ok: false, reason: 'not-signed-in' };
  const { error } = await supabase.from(TABLE).delete().eq('user_id', user.id);
  return error ? { ok: false, reason: error.message } : { ok: true };
}

// Right to data portability: a plain-JSON copy of the saved journey.
export async function exportJourney() {
  const row = await loadJourney();
  if (!row) return null;
  return JSON.stringify(row, null, 2);
}
