/* Care Journey - erasure / SAR fan-out test
   ---------------------------------------------------------------------------
   Proves the two CJ-side targets the website hub fan-out calls on carejourney-prod:
     cj_erase_by_email(email)  -> deletes ONLY that carer's save, returns row count
     cj_export_by_email(email) -> returns ONLY that carer's save as JSON, no delete
   Both must be scoped to the resolved account and never touch another carer's row.

   Runs against PGlite (real Postgres engine, in-process) so it needs no live DB.
   Run:  npm i -D @electric-sql/pglite  &&  node supabase/tests/erasure_fanout.test.mjs
   This validates the SQL LOGIC. The live end-to-end run against carejourney-prod
   (real service-role key + the website hub caller) is still required before the
   NEXT_PUBLIC_CJ_SAVE flag flips - see Handoff_CareJourney_SaveLayer_GoLive.md.
   --------------------------------------------------------------------------- */
import { PGlite } from '@electric-sql/pglite';

const db = await PGlite.create();
let pass = 0, fail = 0;
const ok = (name, cond) => { (cond ? pass++ : fail++); console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}`); };

// Mimic the Supabase auth schema the functions depend on.
await db.exec(`
  create schema if not exists auth;
  create table auth.users (id uuid primary key default gen_random_uuid(), email text unique);
  create table public.care_journey_saves (
    user_id uuid primary key references auth.users(id) on delete cascade,
    consent_save boolean not null default false,
    consent_save_at timestamptz, consent_version text,
    consent_condition boolean not null default false,
    trigger_id text not null,
    step_state jsonb not null default '{}'::jsonb,
    condition_id text, outward_postcode text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    last_active_at timestamptz not null default now(),
    constraint condition_requires_consent check (condition_id is null or consent_condition = true),
    constraint outward_postcode_is_short check (outward_postcode is null or char_length(outward_postcode) <= 4)
  );
`);

// The shipped fan-out functions (verbatim from migrations 001 + 002).
await db.exec(`
  create or replace function public.cj_erase_by_email(p_email text)
  returns integer language plpgsql security definer as $$
  declare uid uuid; removed integer := 0;
  begin
    select id into uid from auth.users where lower(email) = lower(p_email);
    if uid is not null then
      delete from public.care_journey_saves where user_id = uid;
      get diagnostics removed = row_count;
    end if;
    return removed;
  end; $$;

  create or replace function public.cj_export_by_email(p_email text)
  returns jsonb language plpgsql security definer as $$
  declare uid uuid; result jsonb;
  begin
    select id into uid from auth.users where lower(email) = lower(p_email);
    if uid is null then return null; end if;
    select to_jsonb(s) into result from public.care_journey_saves s where s.user_id = uid;
    return result;
  end; $$;
`);

// Two carers, each with a saved journey.
await db.exec(`
  insert into auth.users (id, email) values
    ('11111111-1111-1111-1111-111111111111', 'Alice@Example.com'),
    ('22222222-2222-2222-2222-222222222222', 'bob@example.com');
  insert into public.care_journey_saves
    (user_id, consent_save, consent_save_at, consent_version, consent_condition, trigger_id, step_state, condition_id, outward_postcode)
  values
    ('11111111-1111-1111-1111-111111111111', true, now(), '2026-06-09', true,  't2', '{"a1":true}'::jsonb, 'c_stroke', 'SE1'),
    ('22222222-2222-2222-2222-222222222222', true, now(), '2026-06-09', false, 't5', '{"a3":true}'::jsonb, null,       'M1');
`);

const count = async () => (await db.query('select count(*)::int n from public.care_journey_saves')).rows[0].n;
ok('seed: two saves present', (await count()) === 2);

const exp = (await db.query(`select public.cj_export_by_email('alice@example.com') as j`)).rows[0].j;
ok('export: returns Alice row (case-insensitive email match)', exp && exp.trigger_id === 't2');
ok('export: includes her own condition_id for the SAR', exp && exp.condition_id === 'c_stroke');
ok('export: does NOT delete (count still 2)', (await count()) === 2);

const expNone = (await db.query(`select public.cj_export_by_email('nobody@example.com') as j`)).rows[0].j;
ok('export: unknown email returns null', expNone === null);

const removed = (await db.query(`select public.cj_erase_by_email('ALICE@EXAMPLE.COM') as n`)).rows[0].n;
ok('erase: reports 1 row removed', removed === 1);
ok('erase: Alice row gone', (await db.query(`select 1 from public.care_journey_saves where user_id='11111111-1111-1111-1111-111111111111'`)).rows.length === 0);
ok('erase: Bob row untouched (scoped to right account)', (await db.query(`select 1 from public.care_journey_saves where user_id='22222222-2222-2222-2222-222222222222'`)).rows.length === 1);
ok('erase: exactly one row remains', (await count()) === 1);

const removed2 = (await db.query(`select public.cj_erase_by_email('alice@example.com') as n`)).rows[0].n;
ok('erase: second erase idempotent (0 removed)', removed2 === 0);
const expAfter = (await db.query(`select public.cj_export_by_email('alice@example.com') as j`)).rows[0].j;
ok('export: after erase, Alice export is null (provably wiped)', expAfter === null);

await db.exec(`delete from auth.users where email = 'bob@example.com'`);
ok('cascade: deleting the auth user removes the save (on delete cascade)', (await count()) === 0);

console.log(`\n--- ${pass} passed, ${fail} failed ---`);
process.exit(fail ? 1 : 0);
