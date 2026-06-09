import { useEffect } from 'react';
import Icon from './Icon';
import { CFG, HELPLINES } from '../lib/content';

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

function Tel({ ref: hl }) {
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
        <Tel ref={card.helplineRef} />
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
