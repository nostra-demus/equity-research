// A GlobeEventRef (ui/server/src/news/globe.ts's capped sample pointer) carries only 5 fields —
// event_id/headline/headline_en/ts/triage_score/source_name — not a full FeedItem (no url, companies,
// event_types, region, band, …). Opening it straight in EventDetail/scSelectEvent with those fields
// fabricated would render a broken reader and a doomed enrichment fetch (api.enrichEvent needs `url`).
// So: resolve the REAL FeedItem by event_id out of whatever the store already has loaded (the live 2-day
// wire, then the archive search results) — both pools are populated independently of the globe, so a
// sampled event is very often already sitting in one of them. Only when truly not found does this fall
// back to a degraded item built from the ref alone, with the missing fields left honestly empty (never
// invented) rather than skipping the click entirely.

import type { FeedItem } from '../../../lib/types'
import type { GlobeEventRef } from '../../../lib/api'

export function resolveSampleFeedItem(ref: GlobeEventRef, ...pools: FeedItem[][]): FeedItem {
  for (const pool of pools) {
    const hit = pool.find((it) => it.event_id === ref.event_id && it.ts === ref.ts)
    if (hit) return hit
  }
  // degraded fallback — only the fields the ref actually carries are real; the rest are honest empties
  return {
    kind: 'item',
    ts: ref.ts,
    event_id: ref.event_id,
    headline: ref.headline,
    headline_en: ref.headline_en,
    url: '',
    domain: '',
    source_name: ref.source_name,
    via: 'gdelt',
    region: '',
    country: null,
    input_nature: '',
    triage_score: ref.triage_score,
    band: ref.triage_score >= 70 ? 'pick' : ref.triage_score >= 40 ? 'watch' : 'drop',
    triage_reason: '',
    relevance: '',
    event_types: [],
    issuer_linkage: '',
    companies: [],
    size_bucket: 'unknown',
    dedup_status: '',
    inboxed: false,
  }
}
