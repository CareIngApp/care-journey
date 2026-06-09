import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Icon from '../components/Icon';
import { ActionSheet, CfgSheet, LocalSheet, HelplinesSheet, SaveSheet } from '../components/Sheets';
import {
  TRIGGERS, TRIGGER_BY_ID, CONDITION_GROUPS, TRIAGE, HELPLINES,
} from '../lib/content';
import { buildPlaybook, countCards } from '../lib/engine';
import { resolveLocal, outwardCode } from '../lib/local';
import { saveEnabled, loadJourney, onAuthChange, saveJourney } from '../lib/save';

const STEPS = { FRONT: 'front', TRIGGER: 'trigger', CONDITION: 'condition', TRIAGE: 'triage', BUILDING: 'building', PLAYBOOK: 'playbook', CRISIS: 'crisis' };

export default function CareJourney() {
  const [step, setStep] = useState(STEPS.FRONT);
  const [triggerId, setTriggerId] = useState(null);
  const [conditions, setConditions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [tIndex, setTIndex] = useState(0);
  const [local, setLocal] = useState(null);
  const [done, setDone] = useState({});
  const [sheet, setSheet] = useState(null); // {type, card?}
  const [saveState, setSaveState] = useState({ saved: false, consent: null });
  const [resumable, setResumable] = useState(null); // a saved row offered on the front door

  const playbook = useMemo(
    () => (triggerId ? buildPlaybook(triggerId, conditions, answers) : null),
    [triggerId, conditions, answers]
  );
  const total = playbook ? countCards(playbook) : 0;
  const doneCount = Object.values(done).filter(Boolean).length;

  // Resume: if the saved layer is on and the carer has a saved journey, offer it.
  useEffect(() => {
    if (!saveEnabled()) return;
    let active = true;
    const check = async () => { const row = await loadJourney(); if (active) setResumable(row || null); };
    check();
    const off = onAuthChange(() => check());
    return () => { active = false; off(); };
  }, []);

  function resume(row) {
    setTriggerId(row.trigger_id);
    setConditions(row.condition_id ? [row.condition_id] : []);
    setAnswers({});
    setDone(row.step_state || {});
    setSaveState({ saved: true, consent: { save: true, condition: row.consent_condition } });
    setResumable(null);
    setStep(STEPS.PLAYBOOK);
  }

  // Persist step changes only when the carer has already opted in to save.
  function persist(stepState) {
    if (!saveState.saved || !saveState.consent) return;
    saveJourney({
      triggerId,
      stepState,
      conditionId: conditions[0] || null,
      outwardPostcode: answers.postcode ? outwardCode(answers.postcode) : null,
    }, saveState.consent);
  }
  function toggleDone(uid) {
    setDone((d) => { const next = { ...d, [uid]: !d[uid] }; persist(next); return next; });
  }

  function reset() {
    setTriggerId(null); setConditions([]); setAnswers({}); setTIndex(0);
    setLocal(null); setDone({}); setSheet(null); setStep(STEPS.FRONT);
  }
  function pickTrigger(t) {
    setTriggerId(t.id);
    setStep(t.crisis ? STEPS.CRISIS : STEPS.CONDITION);
  }
  function openCard(card) {
    if (card.flags.includes('cfg')) setSheet({ type: 'cfg' });
    else if (card.flags.includes('local')) setSheet({ type: 'local' });
    else setSheet({ type: 'action', card });
  }
  function advance() {
    if (tIndex < TRIAGE.length - 1) setTIndex(tIndex + 1);
    else setStep(STEPS.BUILDING);
  }

  return (
    <div className="cj-shell">
      <Head>
        <title>Care Journey · The Caring App</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="description" content="A free, plain-English guide for anyone suddenly responsible for a loved one. Work out what to do now, this month and later." />
      </Head>

      <header className="cj-topbar">
        <a className="cj-brand" href="#" onClick={(e) => { e.preventDefault(); reset(); }}>
          <Icon name="compass" size={22} /> Care Journey
        </a>
        {step !== STEPS.CRISIS && (
          <button className="btn btn-ghost" style={{ minHeight: 40, padding: '8px 14px' }}
            onClick={() => { setTriggerId('t11'); setStep(STEPS.CRISIS); }}>
            <Icon name="lifebuoy" size={18} /> Need help now?
          </button>
        )}
      </header>

      <main className={'cj-main' + (step !== STEPS.PLAYBOOK ? ' cj-narrow' : '')}>
        {step === STEPS.FRONT && <FrontDoor onStart={() => setStep(STEPS.TRIGGER)} onTalk={() => setSheet({ type: 'help' })} resumable={resumable} onResume={resume} />}

        {step === STEPS.TRIGGER && <Triggers onPick={pickTrigger} onBack={() => setStep(STEPS.FRONT)} />}

        {step === STEPS.CONDITION && (
          <Condition
            value={conditions} onChange={setConditions}
            onBack={() => setStep(STEPS.TRIGGER)}
            onNext={() => { setTIndex(0); setStep(STEPS.TRIAGE); }}
          />
        )}

        {step === STEPS.TRIAGE && (
          <Triage
            index={tIndex} answers={answers}
            onBack={() => (tIndex === 0 ? setStep(STEPS.CONDITION) : setTIndex(tIndex - 1))}
            onAnswer={async (qid, val) => {
              setAnswers((a) => ({ ...a, [qid]: val }));
              if (qid === 'postcode' && val) setLocal(await resolveLocal(val));
              advance();
            }}
            onSkip={advance}
          />
        )}

        {step === STEPS.BUILDING && <Building onDone={() => setStep(STEPS.PLAYBOOK)} />}

        {step === STEPS.PLAYBOOK && playbook && (
          <Playbook
            triggerId={triggerId} playbook={playbook} done={done} total={total} doneCount={doneCount}
            onToggle={toggleDone}
            onOpen={openCard} onRestart={reset} onTalk={() => setSheet({ type: 'help' })}
            canSave={saveEnabled()} isSaved={saveState.saved} onSave={() => setSheet({ type: 'save' })}
          />
        )}

        {step === STEPS.CRISIS && (
          <Crisis onBack={() => setStep(triggerId === 't11' ? STEPS.FRONT : STEPS.PLAYBOOK)} />
        )}
      </main>

      {sheet && sheet.type === 'action' && <ActionSheet card={sheet.card} onClose={() => setSheet(null)} />}
      {sheet && sheet.type === 'cfg' && <CfgSheet onClose={() => setSheet(null)} />}
      {sheet && sheet.type === 'local' && <LocalSheet local={local} onClose={() => setSheet(null)} />}
      {sheet && sheet.type === 'help' && <HelplinesSheet onClose={() => setSheet(null)} />}
      {sheet && sheet.type === 'save' && (
        <SaveSheet
          ctx={{ triggerId, conditions, done, postcode: answers.postcode, alreadySaved: saveState.saved, savedConsent: saveState.consent }}
          onClose={() => setSheet(null)}
          onSaved={(consent) => setSaveState({ saved: !!consent, consent: consent || null })}
        />
      )}
    </div>
  );
}

/* ---------------- Screens ---------------- */

function FrontDoor({ onStart, onTalk, resumable, onResume }) {
  return (
    <section>
      <p className="cj-eyebrow">The Caring App · free guide</p>
      <h1 className="cj-hero">Something has changed, and you are not sure where to start.</h1>
      <p className="cj-lede">That is exactly what this is for. In a couple of minutes, Care Journey helps you work out what matters now, this month and later, and connects you to the right trusted help.</p>
      {resumable && (
        <div className="card" style={{ marginBottom: 20, borderColor: 'var(--primary-300)' }}>
          <p style={{ margin: '0 0 10px', fontWeight: 600 }}>Welcome back. You have a saved journey.</p>
          <button className="btn btn-primary" onClick={() => onResume(resumable)}>Pick up where you left off <Icon name="arrow" size={18} /></button>
        </div>
      )}
      <div className="card" style={{ marginBottom: 24 }}>
        <p style={{ margin: '0 0 8px', fontWeight: 600 }}>You are probably a carer if you help someone with things like:</p>
        <p className="muted" style={{ margin: 0 }}>shopping, cooking or housework · medication or appointments · money or paperwork · getting washed or dressed · simply keeping an eye on them. Even if you live apart, and even if you would never call yourself a carer.</p>
      </div>
      <button className="btn btn-primary btn-block" onClick={onStart}>Show me where to start <Icon name="arrow" size={18} /></button>
      <div className="skip" style={{ textAlign: 'center' }}>
        <button className="btn-quiet" onClick={onTalk}>Or talk to someone now</button>
      </div>
    </section>
  );
}

function Triggers({ onPick, onBack }) {
  return (
    <section>
      <button className="back" onClick={onBack}><Icon name="back" size={18} /> Back</button>
      <h1 className="cj-q" style={{ marginTop: 8 }}>What has happened?</h1>
      <p className="cj-lede">Pick whatever is closest. You can change it later, and nothing here is set in stone.</p>
      <div className="tile-stack">
        {TRIGGERS.map((t) => (
          <button className="tile" key={t.id} onClick={() => onPick(t)}>
            <span className="tile-ic"><Icon name={t.icon} size={20} /></span>
            <span className="tile-body">
              <span className="tile-title">{t.short}</span>
              <span className="tile-sub">{t.title}</span>
            </span>
            <Icon name="arrow" size={18} />
          </button>
        ))}
      </div>
    </section>
  );
}

function Condition({ value, onChange, onBack, onNext }) {
  const toggle = (id) => onChange(value.includes(id) ? value.filter((x) => x !== id) : [...value, id]);
  return (
    <section>
      <button className="back" onClick={onBack}><Icon name="back" size={18} /> Back</button>
      <h1 className="cj-q" style={{ marginTop: 8 }}>What is the main health issue?</h1>
      <p className="cj-lede">This is optional. It just lets us point you to the right specialist charity. You do not need a formal diagnosis to choose.</p>
      {CONDITION_GROUPS.map((g) => (
        <div key={g.group} style={{ marginBottom: 18 }}>
          <p className="cj-eyebrow" style={{ marginBottom: 8 }}>{g.group}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {g.tags.map((t) => (
              <button key={t.id} className={'btn ' + (value.includes(t.id) ? 'btn-primary' : 'btn-ghost')}
                style={{ minHeight: 42, padding: '8px 16px' }}
                aria-pressed={value.includes(t.id)} onClick={() => toggle(t.id)}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      ))}
      <div className="btn-row">
        <button className="btn btn-primary" onClick={onNext}>Continue <Icon name="arrow" size={18} /></button>
        <button className="btn-quiet" onClick={onNext}>Skip this</button>
      </div>
    </section>
  );
}

function Triage({ index, answers, onAnswer, onSkip, onBack }) {
  const q = TRIAGE[index];
  const [pc, setPc] = useState(answers.postcode || '');
  return (
    <section>
      <button className="back" onClick={onBack}><Icon name="back" size={18} /> Back</button>
      <div className="dots" style={{ margin: '12px 0 20px' }}>
        {TRIAGE.map((_, i) => <span key={i} className={'dot' + (i <= index ? ' on' : '')} />)}
      </div>
      <h1 className="cj-q">{q.q}</h1>
      <p className="cj-lede" style={{ marginBottom: 20 }}>{q.help}</p>

      {q.type === 'postcode' ? (
        <div>
          <input className="input" inputMode="text" autoComplete="postal-code"
            placeholder={q.placeholder} value={pc} onChange={(e) => setPc(e.target.value)} aria-label="Postcode" />
          <div className="btn-row">
            <button className="btn btn-primary" onClick={() => onAnswer('postcode', pc.trim())} disabled={!pc.trim()}>
              Find local help <Icon name="arrow" size={18} />
            </button>
            <button className="btn-quiet" onClick={onSkip}>Skip, I will add this later</button>
          </div>
        </div>
      ) : (
        <div className="tile-stack">
          {q.options.map((o) => (
            <button key={o.id} className={'tile' + (answers[q.id] === o.id ? ' is-selected' : '')} onClick={() => onAnswer(q.id, o.id)}>
              <span className="tile-body"><span className="tile-title">{o.label}</span></span>
              <Icon name="arrow" size={18} />
            </button>
          ))}
          {q.optional && <div className="skip"><button className="btn-quiet" onClick={onSkip}>Skip this question</button></div>}
        </div>
      )}
    </section>
  );
}

function Building({ onDone }) {
  useEffect(() => { const id = setTimeout(onDone, 900); return () => clearTimeout(id); }, [onDone]);
  return (
    <section style={{ textAlign: 'center', paddingTop: 64 }}>
      <div className="tile-ic" style={{ width: 56, height: 56, margin: '0 auto 16px' }}><Icon name="compass" size={28} /></div>
      <h1 className="cj-q">Putting your plan together</h1>
      <p className="cj-lede">Ordering the steps so the most important things come first.</p>
    </section>
  );
}

function Playbook({ triggerId, playbook, done, total, doneCount, onToggle, onOpen, onRestart, onTalk, canSave, isSaved, onSave }) {
  const trig = TRIGGER_BY_ID[triggerId];
  const pct = total ? Math.round((doneCount / total) * 100) : 0;
  return (
    <section>
      <p className="cj-eyebrow">Your Care Journey</p>
      <h1 className="cj-q">{trig.short}</h1>
      <p className="cj-lede" style={{ marginBottom: 8 }}>{trig.lead}</p>
      <div className="progress">
        <div className="progress-track"><div className="progress-fill" style={{ width: pct + '%' }} /></div>
        <span className="progress-num">{doneCount} of {total} done</span>
      </div>

      {playbook.map((phase) => phase.cards.length > 0 && (
        <div className="phase" key={phase.id}>
          <div className="phase-head"><h2>{phase.label}</h2><p>{phase.sub}</p></div>
          <div className="tile-stack">
            {phase.cards.map((card) => (
              <article className={'action action-pri-' + card.priority + (done[card.uid] ? ' is-done' : '')} key={card.uid}>
                <button className={'action-check' + (done[card.uid] ? ' on' : '')}
                  onClick={() => onToggle(card.uid)}
                  aria-pressed={!!done[card.uid]} aria-label={done[card.uid] ? 'Mark not done' : 'Mark done'}>
                  {done[card.uid] && <Icon name="check" size={16} />}
                </button>
                <div className="action-body">
                  <h3 className="action-title">{card.title}</h3>
                  <p className="action-what">{card.what}</p>
                  <div className="action-meta">
                    <button className="action-link" onClick={() => onOpen(card)}>
                      <Icon name="info" size={14} /> What this means
                    </button>
                    {card.flags.includes('cfg') && <span className="badge badge-amber">Funding</span>}
                    {card.flags.includes('local') && <span className="badge">Local</span>}
                    {card.flags.includes('nobody') && <span className="badge badge-grey">Few people know this</span>}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      ))}

      <div className="btn-row">
        {canSave && (
          <button className="btn btn-primary" onClick={onSave}>
            <Icon name="check" size={18} /> {isSaved ? 'Saved · manage' : 'Save my progress'}
          </button>
        )}
        <button className="btn btn-ghost" onClick={onTalk}><Icon name="phone" size={18} /> Talk to someone</button>
        <button className="btn-quiet" onClick={onRestart}>Start again</button>
      </div>

      <p className="disclaimer">
        Care Journey gives orientation and signposting, not clinical, legal or financial advice. Every step links to a named, trusted UK source that we check and date. England guidance for now.{' '}
        {canSave
          ? 'You can save your progress to your account. We never store the name or details of the person you care for.'
          : 'Your progress is not saved yet, saving to your account is coming soon.'}
      </p>
    </section>
  );
}

function Crisis({ onBack }) {
  const rows = [
    { ...HELPLINES.emergency, tag: 'If life is at risk, or you cannot keep them safe' },
    { ...HELPLINES.nhs111, tag: 'Urgent help and advice when it is not an emergency' },
    { ...HELPLINES.samaritans, tag: 'If you or they are struggling to cope, day or night' },
  ];
  return (
    <section>
      <button className="back" onClick={onBack}><Icon name="back" size={18} /> Back</button>
      <h1 className="cj-q" style={{ marginTop: 8 }}>Let us get you the right help, right now</h1>
      <p className="cj-lede">If this is an emergency, do not wait for anything on this site. Use one of these first.</p>
      <div className="crisis">
        {rows.map((r) => (
          <div className="crisis-line" key={r.number}>
            <div>
              <div className="crisis-num">{r.name} · {r.number}</div>
              <div className="muted" style={{ fontSize: 14 }}>{r.tag}</div>
            </div>
            <a className="btn btn-danger" style={{ minHeight: 42 }} href={`tel:${r.number.replace(/\s/g, '')}`}>
              <Icon name="phone" size={16} /> Call
            </a>
          </div>
        ))}
      </div>
      <p className="cj-help" style={{ marginTop: 16 }}>When things are calmer, come back and we will help you work out the next steps.</p>
    </section>
  );
}
