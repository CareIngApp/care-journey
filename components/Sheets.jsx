import { useEffect, useState } from 'react';
import Icon from './Icon';
import { CFG, HELPLINES } from '../lib/content';
import { saveEnabled, getUser, onAuthChange, sendMagicLink, signOut, saveJourney, deleteJourney, exportJourney } from '../lib/save';
import { outwardCode } from '../lib/local';

function Sheet({ title, onClose, children }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="sheet-scrim" onClick={onClose} role="dialog" aria-modal="true" aria-label={title}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <button className="btn btn-ghost sheet-close" onClick={onClose} aria-label="Close">
          <Icon name="x" size={18} />
        </button>
        <h3 className="cj-q" style={{ fontSize: 24 }}>{title}</h3>
        {children}
      </div>
    </div>
  );
}

function Tel({ hl }) {
  const h = HELPLINES[hl] || HELPLINES.carersUK;
  return (
    <a className="btn btn-ghost" href={`tel:${h.number.replace(/\s/g, '')}`}>
      <Icon name="phone" size={18} /> {h.name}: {h.number}
    </a>
  );
}

export function ActionSheet({ card, onClose }) {
  if (!card) return null;
  return (
    <Sheet title={card.title} onClose={onClose}>
      <div className="sheet-row"><div className="sheet-label">What</div><div>{card.what}</div></div>
      <div className="sheet-row"><div className="sheet-label">Why</div><div>{card.why}</div></div>
      <div className="sheet-row"><div className="sheet-label">Who</div><div>{card.who}</div></div>
      <div className="sheet-row">
        <div className="sheet-label">Source</div>
        <div>
          <a className="action-link" href={card.source.url} target="_blank" rel="noopener noreferrer">
            {card.source.name} <Icon name="external" size={14} />
          </a>
          <p className="cj-help">Checked {card.source.checked}. We review every link by {card.source.reviewBy}.</p>
        </div>
      </div>
      <div className="btn-row">
        <Tel hl={card.helplineRef} />
      </div>
      <p className="cj-help" style={{ marginTop: 16 }}>Care Journey is orientation and signposting, not advice.</p>
    </Sheet>
  );
}

export function CfgSheet({ onClose }) {
  return (
    <Sheet title="Money and benefits" onClose={onClose}>
      <p className="muted">{CFG.blurb}</p>
      <p className="muted">It checks things like Carer’s Allowance, Attendance Allowance, PIP, the means test and NHS Continuing Healthcare funding. We keep Care Journey simple and let the Care Funding Guide handle the money.</p>
      <div className="btn-row">
        <a className="btn btn-primary" href={CFG.url} target="_blank" rel="noopener noreferrer">
          Open the {CFG.name} <Icon name="external" size={16} />
        </a>
      </div>
      <p className="cj-help" style={{ marginTop: 16 }}>England funding for now. Support for Scotland, Wales and Northern Ireland is coming.</p>
    </Sheet>
  );
}

export function LocalSheet({ local, onClose }) {
  return (
    <Sheet title="Your local services" onClose={onClose}>
      <p className="muted">{local ? local.note : 'Add a postcode to find your council and a nearby carer centre.'}</p>
      {local && local.devolved && (
        <p className="badge badge-amber" style={{ marginBottom: 12 }}>
          Outside England, some rules differ. The links still help you find local services.
        </p>
      )}
      <div className="tile-stack">
        <a className="tile" href={(local && local.councilUrl) || 'https://www.gov.uk/find-local-council'} target="_blank" rel="noopener noreferrer">
          <span className="tile-ic"><Icon name="home" size={18} /></span>
          <span className="tile-body">
            <span className="tile-title">{local && local.council ? `${local.council} adult social care` : 'Find your local council'}</span>
            <span className="tile-sub">GOV.UK find-your-council, then their adult social care team</span>
          </span>
          <Icon name="external" size={16} />
        </a>
        <a className="tile" href={(local && local.carerCentreUrl) || 'https://carers.org/network-partners/network-partners-search'} target="_blank" rel="noopener noreferrer">
          <span className="tile-ic"><Icon name="pin" size={18} /></span>
          <span className="tile-body">
            <span className="tile-title">Find a nearby carer centre</span>
            <span className="tile-sub">Carers Trust network of local services</span>
          </span>
          <Icon name="external" size={16} />
        </a>
      </div>
    </Sheet>
  );
}

export function HelplinesSheet({ onClose }) {
  const list = ['carersUK', 'ageUK', 'carersTrust', 'citizens', 'marieCurie', 'samaritans'];
  return (
    <Sheet title="Talk to someone" onClose={onClose}>
      <p className="muted">Free, confidential helplines. You do not have to have it all worked out before you call.</p>
      <div className="tile-stack">
        {list.map((k) => {
          const h = HELPLINES[k];
          return (
            <a className="tile" key={k} href={`tel:${h.number.replace(/\s/g, '')}`}>
              <span className="tile-ic"><Icon name="phone" size={18} /></span>
              <span className="tile-body">
                <span className="tile-title">{h.name}</span>
                <span className="tile-sub">{h.number} · {h.hours}</span>
              </span>
            </a>
          );
        })}
      </div>
    </Sheet>
  );
}

export function SaveSheet({ ctx, onClose, onSaved }) {
  const enabled = saveEnabled();
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [savedOk, setSavedOk] = useState(false);
  const [error, setError] = useState(null);
  const [consentSave, setConsentSave] = useState(ctx.savedConsent ? ctx.savedConsent.save : false);
  const [consentCondition, setConsentCondition] = useState(ctx.savedConsent ? ctx.savedConsent.condition : false);

  const hasCondition = ctx.conditions && ctx.conditions.length > 0;

  useEffect(() => {
    let active = true;
    if (enabled) getUser().then((u) => { if (active) setUser(u); });
    const off = onAuthChange((u) => setUser(u));
    return () => { active = false; off(); };
  }, [enabled]);

  async function handleLink(e) {
    e.preventDefault();
    setBusy(true); setError(null);
    const r = await sendMagicLink(email);
    setBusy(false);
    if (r.ok) setSent(true); else setError('We could not send the link. Please check the address and try again.');
  }

  async function handleSave() {
    setBusy(true); setError(null);
    const payload = {
      triggerId: ctx.triggerId,
      stepState: ctx.done || {},
      conditionId: hasCondition ? ctx.conditions[0] : null,
      outwardPostcode: ctx.postcode ? outwardCode(ctx.postcode) : null,
    };
    const consent = { save: consentSave, condition: consentCondition };
    const r = await saveJourney(payload, consent);
    setBusy(false);
    if (r.ok) { setSavedOk(true); if (onSaved) onSaved(consent); }
    else setError('We could not save just now. Please try again.');
  }

  async function handleDelete() {
    setBusy(true); setError(null);
    const r = await deleteJourney();
    setBusy(false);
    if (r.ok) { setSavedOk(false); if (onSaved) onSaved(null); onClose(); }
    else setError('We could not delete that just now. Please try again.');
  }

  async function handleExport() {
    const json = await exportJourney();
    if (!json) return;
    const blob = new Blob([json], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'my-care-journey.json';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  // --- Not built yet (flag off) ---
  if (!enabled) {
    return (
      <Sheet title="Saving your progress" onClose={onClose}>
        <p className="muted">Saving your journey to your account is coming soon. For now, Care Journey keeps nothing: when you close the page, you start fresh.</p>
        <p className="cj-help">When saving arrives, it will be your choice, your progress will be stored against your own account, and we will never store the name or details of the person you care for.</p>
      </Sheet>
    );
  }

  // --- Signed out: magic-link sign-in ---
  if (!user) {
    return (
      <Sheet title="Save to your account" onClose={onClose}>
        {sent ? (
          <p className="muted">Check your email. We have sent a secure link to sign in and save your progress. You can close this and come back.</p>
        ) : (
          <form onSubmit={handleLink}>
            <p className="muted">Enter your email and we will send a secure link, no password needed. Your progress saves against this account.</p>
            <input className="input" type="email" inputMode="email" autoComplete="email" required
              placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} aria-label="Email address" />
            <div className="btn-row">
              <button className="btn btn-primary" type="submit" disabled={busy || !email.trim()}>Email me a link</button>
              <button className="btn-quiet" type="button" onClick={onClose}>Not now</button>
            </div>
            {error && <p className="cj-help" style={{ color: 'var(--priority-high)' }}>{error}</p>}
          </form>
        )}
        <p className="cj-help" style={{ marginTop: 16 }}>We never store the name or any details of the person you care for. England guidance. You can delete your saved journey at any time.</p>
      </Sheet>
    );
  }

  // --- Signed in: explicit consent + save ---
  return (
    <Sheet title="Save to your account" onClose={onClose}>
      {savedOk ? (
        <p className="muted">Saved. Your progress will be here when you come back. You stay in control: you can update or delete it any time.</p>
      ) : (
        <>
          <p className="muted">Signed in as {user.email}. Saving is your choice, and we only store what is needed to bring your plan back.</p>

          <label className="tile" style={{ cursor: 'pointer', alignItems: 'center' }}>
            <input type="checkbox" checked={consentSave} onChange={(e) => setConsentSave(e.target.checked)} style={{ width: 20, height: 20 }} />
            <span className="tile-body">
              <span className="tile-title">Save my progress to my account</span>
              <span className="tile-sub">We store which steps you have done and which playbook to show. No details about the person you care for.</span>
            </span>
          </label>

          {hasCondition && (
            <label className="tile" style={{ cursor: 'pointer', alignItems: 'center', marginTop: 12 }}>
              <input type="checkbox" checked={consentCondition} onChange={(e) => setConsentCondition(e.target.checked)} style={{ width: 20, height: 20 }} />
              <span className="tile-body">
                <span className="tile-title">Also remember the health condition I chose</span>
                <span className="tile-sub">This is health information, so we ask separately. Leave it unticked and we will not store the condition.</span>
              </span>
            </label>
          )}

          <div className="btn-row">
            <button className="btn btn-primary" onClick={handleSave} disabled={busy || !consentSave}>Save my progress</button>
            <button className="btn-quiet" onClick={onClose}>Cancel</button>
          </div>
          {error && <p className="cj-help" style={{ color: 'var(--priority-high)' }}>{error}</p>}
        </>
      )}

      {(savedOk || ctx.alreadySaved) && (
        <div className="btn-row">
          <button className="btn btn-ghost" onClick={handleExport}>Download a copy</button>
          <button className="btn btn-ghost btn-danger" onClick={handleDelete} disabled={busy}>Delete my saved journey</button>
        </div>
      )}

      <p className="cj-help" style={{ marginTop: 16 }}>
        Stored against your account only, kept while your account is active, and deleted after 12 months of not using Care Journey, or whenever you ask.{' '}
        <button className="btn-quiet" style={{ padding: 0, minHeight: 0 }} onClick={() => signOut()}>Sign out</button>
      </p>
    </Sheet>
  );
}
