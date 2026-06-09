# Care Journey

The free orientation layer of The Caring App. A guided navigator that triages an early-stage UK carer's situation and returns a sequenced playbook of what to do today, this month and later, signposting trusted UK sources and pointing funding questions to the Care Funding Guide (CFG).

Next.js 14 (Pages Router). **Stateless-first v1**: the whole flow works signed-out. The save-to-account layer is deliberately not built yet (gated by the Compliance DPIA). Signposting and orientation only, not advice. England guidance for v1.

## Run it
```
npm install
npm run dev
```
Open http://localhost:3000/care-journey (note the `/care-journey` basePath).

## How it is built
```
pages/
  index.jsx        the state-machine shell: front -> trigger -> condition -> triage -> building -> playbook, plus crisis
  _document.jsx    DM Sans + Newsreader (hero only), per the TCA Design System
  _app.jsx
lib/
  content.js       single content source of truth: 22 canonical action cards, 12 trigger playbooks,
                   condition tags, triage questions, trusted sources + helplines (each with checked/review dates)
  engine.js        buildPlaybook(): resolves a trigger to phase-grouped cards, applies the triage
                   re-ranking rules (promotions, front-loading, capacity/condition language), never empties Today
  local.js         postcode -> local authority via postcodes.io (free, no key), with no-dead-end fallbacks
components/
  Icon.jsx         inline icon set
  Sheets.jsx       overlays: action detail, CFG signpost, local routing, helplines
styles/
  tokens.css       The Caring App Design System v2 tokens (ported verbatim)
  globals.css      component classes built on the tokens
```

## Design system
DM Sans for all UI, Newsreader for the hero heading only, per the approved TCA Design System. Teal is action, peach is decoration only, pill buttons, 20px cards, warm off-white canvas. Tokens live in `styles/tokens.css`.

## What is mocked / deferred (by design)
- **Save to account** — not built. Stateless only until the Compliance DPIA is signed and the data model confirmed.
- **CFG handoff** — a soft signpost to the Care Funding Guide front door (`/care-funding-guide`). No deep-link parameters and no health data ever cross the boundary (Phil's decision, 9 Jun 2026).
- **Local routing** — live via postcodes.io; the per-council adult-social-care URL map is the lightweight GOV.UK + Carers Trust route for v1.
- **AI guide layer** — NOT in v1 (backlog, v1.1+).

## Content QA
Every action card cites a named, trusted UK source with a `checked` and `reviewBy` date in `lib/content.js`. Sources last verified 8 Jun 2026, review by 8 Dec 2026. No funding figures are quoted and no care cost cap is signposted (the £86k cap was scrapped on 29 Jul 2024). Funding depth belongs to CFG.

## Deploy
Push to `main` on `CareIngApp/care-journey`; Vercel (project `care-journey`, team `CareIngApp`) auto-deploys. `basePath` is `/care-journey` (see `next.config.js`).
