/* ============================================================
   Care Journey - postcode to local-service routing (spec B7)
   Layer 1: postcode -> local authority via postcodes.io (free, UK, no key).
   Layer 2: authority -> adult social care page. v1 uses GOV.UK find-your-
   council seeded by the council name, plus Carers Trust directory, rather
   than a maintained per-council URL map. Never a dead end.
   Privacy: full postcode is used transiently for the lookup only; we persist
   at most the outward code (see save layer, gated by Compliance).
   ============================================================ */
import { SOURCES } from './content';

const POSTCODE_RE = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;

export function outwardCode(postcode) {
  if (!postcode) return null;
  const p = postcode.trim().toUpperCase().replace(/\s+/g, ' ');
  const m = p.match(/^([A-Z]{1,2}\d[A-Z\d]?)\s*\d[A-Z]{2}$/);
  return m ? m[1] : p.split(' ')[0] || null;
}

const govCouncil = (q) =>
  'https://www.gov.uk/find-local-council' + (q ? '' : ''); // GOV.UK has no query param; we show the name and link.

// Returns a routing result object. Always resolves (fallbacks built in).
export async function resolveLocal(postcode) {
  const fallback = {
    ok: false,
    nation: 'unknown',
    council: null,
    councilUrl: SOURCES.govCouncil.url,
    carerCentreUrl: SOURCES.carersTrustFind.url,
    note: 'Enter a postcode to find the right local council, or use the national links below.',
  };

  if (!postcode || !POSTCODE_RE.test(postcode.trim())) {
    return { ...fallback, note: 'That postcode did not look complete. You can still use the national links below.' };
  }

  try {
    const res = await fetch('https://api.postcodes.io/postcodes/' + encodeURIComponent(postcode.trim()));
    if (!res.ok) return { ...fallback, note: 'We could not look that up just now. Use the national links below.' };
    const data = await res.json();
    const r = data && data.result;
    if (!r) return { ...fallback, note: 'We could not find that postcode. Use the national links below.' };

    const country = (r.country || '').toLowerCase();
    const council = r.admin_district || r.admin_county || r.parliamentary_constituency || null;
    const nation = country.includes('scotland') ? 'scotland'
      : country.includes('wales') ? 'wales'
      : country.includes('northern') ? 'ni'
      : 'england';

    return {
      ok: true,
      nation,
      council,
      councilUrl: govCouncil(council),
      carerCentreUrl: SOURCES.carersTrustFind.url,
      devolved: nation !== 'england',
      note: council
        ? `Your local council looks like ${council}. Use the links below to reach their adult social care team and a nearby carer centre.`
        : 'We found your area. Use the national links below to reach your council and a nearby carer centre.',
    };
  } catch (e) {
    return { ...fallback, note: 'We could not look that up just now. Use the national links below.' };
  }
}
