/* Feature flags. The saved-account layer stays OFF until:
   - the DPIA is signed,
   - the Supabase Care Journey project env vars are set, and
   - the website SSO / shared-account wiring is in place.
   Set NEXT_PUBLIC_CJ_SAVE=1 to turn it on. Default: off (stateless). */
export const SAVE_ENABLED = process.env.NEXT_PUBLIC_CJ_SAVE === '1';

// Bump when the consent wording materially changes, so we can tell which
// version of the consent a stored record was captured under.
export const CONSENT_VERSION = '2026-06-09';
