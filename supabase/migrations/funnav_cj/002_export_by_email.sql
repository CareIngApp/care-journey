-- ============================================================
-- Care Journey - saved-journey layer
-- Migration 002: cj_export_by_email (SAR / right-to-access fan-out target)
--
-- Why this exists:
--   The website hub runs the data-subject fan-out across every tool project.
--   Migration 001 already added cj_erase_by_email() (right to erasure). A subject
--   access request (SAR / Art 15 + Art 20 portability) also has to reach this
--   project, so the hub can collect the carer's saved Care Journey row by email.
--   This is the export counterpart to cj_erase_by_email() and must be present
--   before the save flag flips, so erasure AND access both span carejourney-prod.
--
-- Behaviour:
--   * Resolves the carer by email (case-insensitive), like the erase function.
--   * Returns their saved row as JSONB, or null if there is no account / no save.
--   * READ-ONLY: never deletes. SECURITY DEFINER so it can resolve auth.users.
--   * Locked down: execute revoked from public/anon/authenticated; the hub calls
--     it with the service role only (same trust model as cj_erase_by_email).
-- ============================================================

create or replace function public.cj_export_by_email(p_email text)
returns jsonb language plpgsql security definer as $$
declare
  uid uuid;
  result jsonb;
begin
  select id into uid from auth.users where lower(email) = lower(p_email);
  if uid is null then
    return null;                       -- no such account
  end if;
  select to_jsonb(s) into result
    from public.care_journey_saves s
   where s.user_id = uid;
  return result;                       -- null if the account has no saved journey
end;
$$;

comment on function public.cj_export_by_email is
  'Right-to-access helper: returns the Care Journey save for an email as JSON (read-only). Called by the hub SAR fan-out.';

revoke all on function public.cj_export_by_email(text) from public, anon, authenticated;
