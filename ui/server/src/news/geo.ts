// Event geography — resolve WHERE a story is (the market its affected, tradable parties sit in), as
// distinct from where it was PUBLISHED. The region stamped at ingest (normalize.ts → approved-domains.ts)
// is the publisher's home market: a South China Morning Post piece is 'CN' even when it is about
// Bangladesh and Malaysia. That inverts what the Geography filter means ("where the event is"), so here
// we re-derive region from the CONTENT the cheap title-triage already read, falling back to the domain
// region whenever the content gives no confident signal — so this can only improve, never regress.
//
// Pure + dependency-free (like rank.ts / scope.ts) so it is trivially unit-testable.

import type { Region, Triage } from './types'

const REGIONS: ReadonlySet<string> = new Set(['US', 'IN', 'JP', 'GB', 'CN', 'KR', 'GLOBAL', 'OTHER'])

/** Type guard: a non-null value that is one of the eight Region codes. (null = "unsure" → not a Region.) */
export function isRegion(v: unknown): v is Region {
  return typeof v === 'string' && REGIONS.has(v)
}

// A company's 2-letter ISO listing country (as guessed by triage) → the Region bucket. Only the engine's
// first-class IBKR markets get a named region; Hong Kong trades under CN in the source registry, so HK→CN
// keeps that consistent. Any OTHER recognised 2-letter code → 'OTHER' (a real but not-first-class market —
// honest, and never the publisher's market). A blank / non-2-letter value → null, so the caller keeps the
// domain region instead of inventing a market.
const COUNTRY_TO_REGION: Record<string, Region> = {
  US: 'US', IN: 'IN', JP: 'JP', GB: 'GB', UK: 'GB', CN: 'CN', HK: 'CN', KR: 'KR',
}

export function listingCountryToRegion(cc: string | null | undefined): Region | null {
  const code = (cc || '').trim().toUpperCase()
  if (!/^[A-Z]{2}$/.test(code)) return null
  return COUNTRY_TO_REGION[code] || 'OTHER'
}

/**
 * The region a story is ABOUT, given its triage read and its publisher/domain region. In order:
 *   (a) the model's explicit `event_region`, when it returned a valid one;
 *   (b) the listing country of the single company a PRIMARY-linkage headline is about;
 *   (c) the source/domain region — today's value, the safe floor (so a missing read never regresses).
 * `t` may be undefined (model omitted this index / batch failed) → (c) applies. Never fabricates a
 * first-class market: an unknown content signal always degrades to the domain region.
 */
export function resolveEventRegion(t: Triage | null | undefined, sourceRegion: Region): Region {
  if (t && isRegion(t.event_region)) return t.event_region
  if (t && t.issuer_linkage === 'primary' && Array.isArray(t.companies) && t.companies.length === 1) {
    const r = listingCountryToRegion(t.companies[0]?.listing_country)
    if (r) return r
  }
  return sourceRegion
}
