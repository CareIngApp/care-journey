# Care Journey — Project Instructions (CLAUDE.md)

## What this is

Care Journey is the orientation layer of The Caring App ecosystem (thecaring.app): a free, plain-English guide for someone who has suddenly become responsible for a loved one. It triages by trigger moment, optional condition tag, and a few circumstance questions, then returns a sequenced "Today / This month / Later" playbook drawn from a fixed, fact-checked content library. It routes to the correct local council and carer centre by postcode, hands funding questions to CFG, and offers a human helpline at every stage.

It is signposting and orientation only. It is NOT medical advice, NOT a funding calculator (funding deep-links to CFG), NOT a regulated service, and NOT the care-coordination app.

## Status (28 June 2026)

This repo is already built, not a fresh start. Do not rebuild it.
- Stateless v1 navigator: BUILT (state machine, 22-card content library, 12 trigger playbooks, condition tags, triage re-ranking, postcode routing, CFG handoff, helplines, crisis path).
- Saved-account layer: BUILT but held OFF behind the flag `NEXT_PUBLIC_CJ_SAVE` (default 0). The DPIA is SIGNED (28 June). The remaining work is to wire the save layer to a dedicated database, extend deletion to it, align the design, and switch it on.

## House rules

- British English. No em dashes.
- Tech stack: Next.js (this repo), Supabase backend. Design system: DM Sans, teal primary #2DA8B5 light / #34C99B dark.
- Decisions route via Phil (solo founder, controller). Do not assume decision authority. If something is ambiguous or material, stop and ask Phil rather than guessing.
- Tone for all carer-facing copy: warm, calm, plain. Every action card cites a current, named UK source. Persistent "guidance, not advice" framing. Crisis and end-of-life journeys lead with 999/111/Samaritans, never a process checklist.
- Copy changes route to the Copy Review. Visual changes follow the design system and the approved prototype.

## Canonical reference documents (in Google Drive, not this repo)

- Build spec: "CARE JOURNEY - v1 Build Spec and Content Plan.docx" (Build Agent 1 folder). The authoritative spec: state machine, 22-card library, 12 trigger playbooks, triage logic, condition tags, minimal saved-data model.
- Approved scope: "CARE JOURNEY SPEC - v1 Focus and Scope.docx" (Roadmap Agent folder), signed off 8 June.
- Design (canonical): "Care Journey - v1 UI Prototype (Design, spec-aligned).html" (Build Agent 1 folder). Match this for look and feel. NOTE: the older Design System file `project/src/pages/journey.jsx` (8 condition categories, "Week 1-4") is SUPERSEDED. Do not build to it.
- DPIA (SIGNED): "DPIA_CareJourney.md" (Data & Compliance Agent 10 folder).
- This workstream's handoff: "Handoff_CareJourney_SaveLayer_GoLive.md" (Shared Documents).

## Code map

- `pages/index.jsx` — the single-flow app (state machine: FRONT, TRIGGER, CONDITION, TRIAGE, BUILDING, PLAYBOOK, CRISIS).
- `lib/content` — the canonical action set, triggers, condition groups, triage, helplines.
- `lib/engine` — playbook build + card counting.
- `lib/local` — postcode resolution (postcodes.io) and outward-code helper.
- `lib/save` — the saved-account layer (feature-flagged): `saveEnabled`, `loadJourney`, `saveJourney`, `onAuthChange`.
- `components/` — Icon, Sheets (action / CFG / local / helplines / save).
- `supabase/` — migrations and policies for the save layer.

## Compliance guardrails for the save layer (from the signed DPIA)

These are non-negotiable design constraints:
- No cared-for-person identifiers collected or stored (no name, DOB, address, NHS number). The saved record reflects the carer's own situation.
- Saving is explicit opt-in; the tool works statelessly by default.
- Lawful basis: Article 6(1)(a) consent + Article 9(2)(a) explicit consent for the saved special-category layer. Withdrawable.
- Minimised stored fields only: email (account key), consent flag + timestamp, step-completion state, playbook reference, outward postcode only (or not persisted). No clinical labels on stored records.
- Encryption: baseline (28 June decision) = at-rest encryption + strict row-level security (reads limited to the user's own JWT email). App-level encryption of `condition_id` is NOT required for v1 (backlog item).
- Retention: purge after 12 months of Care Journey inactivity; delete on request and on account closure.
- Journey 10 (disabled child) is IN v1 on the same no-identifiers basis. The child is never a user. Do not add any child identifier or child-facing flow; doing so would require re-running the DPIA first.
- Cross-product: the hub may show status only ("in progress"), never the health content. No profiling or marketing.

## The build sequence (do these in order)

1. Ship the stateless v1 first. It can go live independently of the save layer and is the priority for getting a usable product in front of carers.
2. Wire the save layer to the dedicated Supabase project `carejourney-prod` (separate account, region EU / AWS Ireland eu-west-1). Set the project URL and keys as server-only env vars (never `NEXT_PUBLIC_` for the service-role key, never commit them). Run the migrations. Enable row-level security on every table, reads limited to the user's own JWT email.
3. CRITICAL GATE: extend the erasure / SAR fan-out (delete-by-email and export-by-email) to reach `carejourney-prod`, and TEST it end to end. The flag must not flip until a deletion request provably wipes Care Journey data. Provide the test evidence to the Data & Compliance Agent (10) for the go-live confirmation.
4. Encryption: implement the baseline only (at-rest + RLS + minimised fields). No application-level encryption in v1.
5. Confirm the stored fields match the minimised set above; design-alignment pass against the v1 UI prototype.
6. Only after the erasure test passes and Compliance confirms: set `NEXT_PUBLIC_CJ_SAVE=1`, wire SSO (depends on the website unified-account switch-on), deploy.

Keep production secret-setting and the final switch-on as Phil-gated actions.
