-- ============================================================
-- Care Journey - saved-journey layer
-- Migration 001: care_journey_saves
--
-- Built to the Data & Compliance requirements (Compliance_Response_CareJourney.md):
--   * NO cared-for-person identifiers are ever stored (no name, DOB, address, NHS no).
--     This table holds only the carer's own account id and their opaque journey state.
--   * Explicit opt-in to save: a row exists ONLY when the carer actively chooses to save.
--   * Explicit consent (Art 6(1)(a) + Art 9(2)(a)): consent_save + timestamp + version.
--     The condition (special-category) is stored ONLY with separate granular consent.
--   * Data minimisation: opaque trigger id, step-completion map, optional outward postcode.
--   * Encryption: Supabase/Postgres encrypts at rest (AES-256). The whole row is treated
--     as special category. Strict RLS limits access to the owning user only.
--   * Retention: purge after 12 months of inactivity; delete on request / account closure.
--   * Residency: deploy to the Care Journey Supabase project (EU, eu-west-1). Confirm with
--     Compliance whether this is the dedicated CJ project or the shared TCA project.
-- ============================================================

create extension if not exists "pgcrypto";

create table if not exists public.care_journey_saves (
  -- identity: the carer's own authenticated account. No third-party identity is stored.
  user_id            uuid primary key references auth.users(id) on delete cascade,

  -- explicit consent (the save opt-in itself; Art 6(1)(a) + Art 9(2)(a))
  consent_save       boolean      not null default false,
  consent_save_at    timestamptz,
  consent_version    text,

  -- separate, granular consent to store the chosen health condition (special category)
  consent_condition  boolean      not null default false,

  -- minimised journey state
  trigger_id         text         not null,            -- opaque id e.g. 't2', never a clinical label
  step_state         jsonb        not null default '{}'::jsonb,  -- { "<action_id>": true }
  condition_id       text,                              -- nullable; set ONLY when consent_condition = true
  outward_postcode   text,                              -- nullable; OUTWARD code only e.g. 'SE1', never the full postcode

  created_at         timestamptz  not null default now(),
  updated_at         timestamptz  not null default now(),
  last_active_at     timestamptz  not null default now(),  -- drives the 12-month retention clock

  -- guard rails enforced at the database, not just the app
  constraint condition_requires_consent
    check (condition_id is null or consent_condition = true),
  constraint outward_postcode_is_short
    check (outward_postcode is null or char_length(outward_postcode) <= 4)
);

comment on table public.care_journey_saves is
  'Care Journey saved playbook. Special category. No cared-for-person identifiers. Owner-only via RLS.';

-- ---------- Row Level Security: owner only ----------
alter table public.care_journey_saves enable row level security;
alter table public.care_journey_saves force row level security;

drop policy if exists cj_select_own on public.care_journey_saves;
create policy cj_select_own on public.care_journey_saves
  for select using (auth.uid() = user_id);

drop policy if exists cj_insert_own on public.care_journey_saves;
create policy cj_insert_own on public.care_journey_saves
  for insert with check (auth.uid() = user_id and consent_save = true);

drop policy if exists cj_update_own on public.care_journey_saves;
create policy cj_update_own on public.care_journey_saves
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists cj_delete_own on public.care_journey_saves;
create policy cj_delete_own on public.care_journey_saves
  for delete using (auth.uid() = user_id);

-- keep updated_at honest
create or replace function public.cj_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  new.last_active_at := now();
  return new;
end;
$$;

drop trigger if exists cj_touch on public.care_journey_saves;
create trigger cj_touch before update on public.care_journey_saves
  for each row execute function public.cj_touch_updated_at();

-- ---------- Retention: purge after 12 months of inactivity ----------
-- Runs as a scheduled job. Deletes inactive saved journeys (special-category minimisation).
create or replace function public.cj_purge_inactive()
returns integer language plpgsql security definer as $$
declare
  removed integer;
begin
  delete from public.care_journey_saves
   where last_active_at < now() - interval '12 months';
  get diagnostics removed = row_count;
  return removed;
end;
$$;

comment on function public.cj_purge_inactive is
  'Deletes Care Journey saves inactive for 12 months. Schedule daily via pg_cron.';

-- Schedule daily at 03:15 UTC (requires the pg_cron extension; enable in Supabase dashboard).
-- select cron.schedule('cj_purge_inactive', '15 3 * * *', $$select public.cj_purge_inactive();$$);

-- ---------- Erasure by email (cross-project fan-out target) ----------
-- The website hub triggers erasure by email across tool projects. This deletes the
-- Care Journey save for a given email. SECURITY DEFINER so it can resolve the auth user.
create or replace function public.cj_erase_by_email(p_email text)
returns integer language plpgsql security definer as $$
declare
  uid uuid;
  removed integer := 0;
begin
  select id into uid from auth.users where lower(email) = lower(p_email);
  if uid is not null then
    delete from public.care_journey_saves where user_id = uid;
    get diagnostics removed = row_count;
  end if;
  return removed;
end;
$$;

comment on function public.cj_erase_by_email is
  'Right-to-erasure helper: deletes the Care Journey save for an email. Called by the hub fan-out.';
revoke all on function public.cj_erase_by_email(text) from public, anon, authenticated;
