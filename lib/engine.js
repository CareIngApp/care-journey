/* ============================================================
   Care Journey - playbook engine (deterministic, no scoring model)
   buildPlaybook(triggerId, conditionIds, triage) returns phase-grouped
   action cards, re-ranked and relabelled per the triage answers (spec B2).
   ============================================================ */
import { ACTIONS, PLAYBOOKS, PHASES, CONDITION_BY_ID, HELPLINES } from './content';

const PHASE_ORDER = { today: 0, month: 1, later: 2 };
// Cards that must never sink below "Later" (the "few people know this" set).
const FRONT_LOAD = new Set(['a_carers_assessment', 'a_lpa', 'a_chc', 'a_employer', 'a_confirm_carer']);

function asArray(v) { return Array.isArray(v) ? v : (v ? [v] : []); }

// Resolve one canonical card, applying condition tailoring + capacity/relationship language.
function resolveCard(actionId, phase, idx, conds, triage) {
  const base = ACTIONS[actionId];
  if (!base) return null;
  const card = {
    uid: actionId + '_' + idx,
    actionId, phase,
    ...base,
    helplineRef: base.helpline,
    helpline: HELPLINES[base.helpline] || HELPLINES.carersUK,
  };

  // Condition tailoring: swap the source + helpline on the condition card.
  if (base.flags.includes('condition') && conds.length) {
    const primary = conds[0];
    const labels = conds.map(c => c.label).join(' and ');
    const orgs = [...new Set(conds.map(c => c.org))].join(' and ');
    card.source = primary.source;
    card.helpline = HELPLINES[primary.helpline] || card.helpline;
    card.title = 'Work through the ' + labels + ' to-do list' + (conds.length > 1 ? 's' : '');
    card.who = orgs + (conds.length > 1 ? ' have' : ' has') + ' a newly-diagnosed guide written for ' +
      conds.map(c => c.label.toLowerCase()).join(' and ') + '.';
  }

  // Capacity language swap on the LPA card. We never assert incapacity.
  if (actionId === 'a_lpa' && triage && (triage.capacity === 'some' || triage.capacity === 'no' || triage.capacity === 'unsure')) {
    card.title = 'Check whether an LPA is still possible, or get advice on best interests';
    card.what = 'A Lasting Power of Attorney only works while the person still has mental capacity. If that is uncertain, get advice early. Where capacity has been lost, decisions follow the best-interests process, and the Court of Protection can appoint a deputy.';
    card.why = 'Acting early protects the person’s wishes. If an LPA is no longer possible, knowing the alternative route saves months of delay.';
  }

  return card;
}

// Promotions: move matching cards up to a target phase based on triage.
function promotion(actionId, triage) {
  if (!triage) return null;
  const hospital = triage.hospital, distance = triage.distance;
  if ((hospital === 'yes' || hospital === 'leaving') &&
      (actionId === 'a_discharge' || actionId === 'a_discharge_assess' || actionId === 'a_carers_assessment')) {
    return 'today';
  }
  if (distance === 'far' && (actionId === 'a_distance_plan' || actionId === 'a_plan_ahead')) {
    return 'today';
  }
  return null;
}

export function buildPlaybook(triggerId, conditionIds, triage) {
  const spec = PLAYBOOKS[triggerId] || PLAYBOOKS.t12;
  const conds = asArray(conditionIds).map(id => CONDITION_BY_ID[id]).filter(Boolean);

  // 1. Resolve cards with their default phase.
  let cards = spec.map(([aid, phase], i) => resolveCard(aid, phase, i, conds, triage)).filter(Boolean);

  // 2. Apply promotions (triage can move a card to an earlier phase, never later).
  cards = cards.map(c => {
    const target = promotion(c.actionId, triage);
    if (target && PHASE_ORDER[target] < PHASE_ORDER[c.phase]) return { ...c, phase: target, promoted: true };
    return c;
  });

  // 3. Front-load guard: a "few people know this" card never sits in Later if
  //    anything else is already earlier; nudge it up to This month at least.
  cards = cards.map(c => {
    if (FRONT_LOAD.has(c.actionId) && c.phase === 'later') return { ...c, phase: 'month' };
    return c;
  });

  // 4. Group by phase, preserving original order within a phase, priority first.
  const PRI = { high: 0, medium: 1, low: 2 };
  const grouped = PHASES.map(p => {
    const inPhase = cards
      .map((c, i) => ({ c, i }))
      .filter(x => x.c.phase === p.id)
      .sort((a, b) => (PRI[a.c.priority] - PRI[b.c.priority]) || (a.i - b.i))
      .map(x => x.c);
    return { ...p, cards: inPhase };
  });

  // 5. Never empty Today: if it is empty, lift the single highest-priority card.
  const today = grouped[0];
  if (today.cards.length === 0) {
    const all = grouped.flatMap(g => g.cards);
    const best = all.sort((a, b) => PRI[a.priority] - PRI[b.priority])[0];
    if (best) {
      for (const g of grouped) g.cards = g.cards.filter(c => c.uid !== best.uid);
      today.cards = [best];
    }
  }

  return grouped;
}

export function countCards(grouped) {
  return grouped.reduce((n, g) => n + g.cards.length, 0);
}
