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
- **Encryption** - Supabase/Postgres at-rest AES-256; the row is treated as special category; strict RLS. **Decision (28 Jun 2026, Phil):** baseline only for v1 - at-rest + RLS + minimised non-clinical fields. Application-level encryption of `condition_id` is NOT in v1; it is a backlog item. Compliance confirmed the baseline is sufficient.
- **RLS** - `enable` + `force` row level security; select/insert/update/delete all gated to `auth.uid() = user_id`.
- **Retention** - `cj_purge_inactive()` deletes rows inactive for 12 months; schedule daily via pg_cron.
- **Erasure** - `deleteJourney()` for self-service; `cj_erase_by_email()` for the website hub fan-out; `on delete cascade` from `auth.users`.
- **Portability / access** - `exportJourney()` for self-service (downloads the row as JSON); `cj_export_by_email()` (migration 002) for the website hub SAR fan-out, read-only and service-role only. Tested green - see `supabase/tests/erasure_fanout.test.mjs` and `Shared Documents/CareJourney_Erasure_Test_Evidence_for_Compliance.md`.
- **Residency** - **Decision (28 Jun 2026):** dedicated `carejourney-prod` project in a separate Supabase account, EU (Ireland, eu-west-1). Not the shared TCA project.

## Data flows that touch third parties
- **Supabase** (EU) - stores the saved row; processor.
- **postcodes.io** - the full postcode is sent at routing time to find the council; not stored by us. Add to the DPIA data-flow list.

## Open items for Phil / Compliance before enabling
1. ~~Confirm the Supabase project.~~ **RESOLVED (28 Jun):** dedicated `carejourney-prod`, separate account, EU eu-west-1. Still TO DO: provision it and set the env vars (Phil-gated).
2. Confirm 12-month retention (currently coded) or set a different period.
3. ~~Confirm whether app-level encryption of `condition_id` is required.~~ **RESOLVED (28 Jun):** baseline only for v1 (at-rest + RLS + minimised fields); app-level encryption is backlog.
4. Wire sign-in to the website SSO / shared account (currently a standalone magic link). Depends on the website unified-account switch-on.
5. Confirm the consent wording with Copy Review; bump `CONSENT_VERSION` if it changes.
6. **CRITICAL:** extend the website hub erasure / SAR fan-out to also call `cj_erase_by_email` and `cj_export_by_email` on `carejourney-prod`, then re-run the erasure test against the live project. Flag must not flip until this passes. See the evidence doc in Shared Documents.
