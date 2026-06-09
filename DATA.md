# Care Journey - saved-account data layer (compliance mapping)

Maps the saved layer to the Data & Compliance requirements in
`Compliance_Response_CareJourney.md`. Built behind a feature flag
(`NEXT_PUBLIC_CJ_SAVE`), off by default. Do not enable in production until the
DPIA is signed and the Supabase project + SSO wiring are in place.

## Design in one line
The carer can optionally save their own progress to their own account. Nothing
is stored about the person they care for. The whole thing is opt-in, minimised,
owner-locked by RLS, encrypted at rest, and time-limited.

## What is stored (and what is deliberately not)

| Field | Purpose | Notes |
|---|---|---|
| `user_id` | The carer's own account | FK to `auth.users`; the only identity stored. **No cared-for-person identity at all.** |
| `consent_save` (+ `consent_save_at`, `consent_version`) | Record the explicit opt-in | Art 6(1)(a) + Art 9(2)(a). DB rejects inserts without it. |
| `consent_condition` | Separate, granular consent to store the condition | Off unless the carer ticks it. |
| `trigger_id` | Rebuild the right playbook | Opaque (`t2`), never a clinical label. |
| `step_state` | Which steps are done | `{ action_id: true }`. The core of the saved experience. |
| `condition_id` | Re-tailor the condition card | **Special category.** Stored only when `consent_condition = true`; DB CHECK enforces this. |
| `outward_postcode` | Re-show local routing | Outward code only (e.g. `SE1`); DB CHECK limits length. Full postcode never stored. |
| `created_at` / `updated_at` / `last_active_at` | Housekeeping + retention | `last_active_at` drives the 12-month purge. |

**Never collected anywhere in the product:** the cared-for person's name, date of
birth, address, NHS number, or any free-text health detail.

## Requirement -> where it lives

- **No cared-for-person identifiers** - structural: there is nowhere to enter one; the table has no such column.
- **Explicit opt-in to save** - `saveJourney()` refuses without `consent.save`; the RLS insert policy requires `consent_save = true`; stateless until then.
- **Explicit consent for health data** - the condition is written only with separate `consent.condition`; DB CHECK `condition_requires_consent`.
- **Minimised fields** - the seven-ish columns above; opaque ids, outward postcode only.
- **Encryption** - Supabase/Postgres at-rest AES-256; the row is treated as special category; strict RLS. (Optional app-level column encryption can be added if Compliance wants belt-and-braces.)
- **RLS** - `enable` + `force` row level security; select/insert/update/delete all gated to `auth.uid() = user_id`.
- **Retention** - `cj_purge_inactive()` deletes rows inactive for 12 months; schedule daily via pg_cron.
- **Erasure** - `deleteJourney()` for self-service; `cj_erase_by_email()` for the website hub fan-out; `on delete cascade` from `auth.users`.
- **Portability** - `exportJourney()` downloads the row as JSON.
- **Residency** - Care Journey Supabase project, EU (eu-west-1). Confirm with Compliance whether this is a dedicated CJ project or the shared TCA project.

## Data flows that touch third parties
- **Supabase** (EU) - stores the saved row; processor.
- **postcodes.io** - the full postcode is sent at routing time to find the council; not stored by us. Add to the DPIA data-flow list.

## Open items for Phil / Compliance before enabling
1. Confirm the Supabase project (dedicated CJ vs shared TCA) and set the env vars.
2. Confirm 12-month retention (currently coded) or set a different period.
3. Confirm whether app-level encryption of `condition_id` is required on top of at-rest.
4. Wire sign-in to the website SSO / shared account (currently a standalone magic link).
5. Confirm the consent wording with Copy Review; bump `CONSENT_VERSION` if it changes.
