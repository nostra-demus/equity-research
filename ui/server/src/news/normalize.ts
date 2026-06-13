// Normalize raw firehose articles into on-list, deduped NewsItems ready for triage.
//   - source firewall: drop anything whose domain isn't on the approved list (approved-domains.ts);
//   - identity: compute the SAME event_id the gauntlet uses (EVT-<sha256-12 of normalized headline |
//     url>), so our dedup and the ledger's dedup agree exactly;
//   - dedup: mark possible_duplicate when the event is already in the events ledger; skip entirely
//     when it's in our seen-cache (already scored in a prior cycle — saves a Groq call).

import { createHash } from 'node:crypto'
import fs from 'node:fs'
import { cleanText, looksLikeHeadline } from './clean'
import { lookupSource } from './sources/approved-domains'
import type { SeenCache } from './seen-cache'
import type { NewsItem, RawArticle } from './types'

/** EVT-<first 12 hex of sha256(lowercased+whitespace-collapsed headline | url)>. Matches Gate-0's recipe. */
export function eventIdFor(headline: string, url: string): string {
  const norm = `${headline.toLowerCase().replace(/\s+/g, ' ').trim()}|${url || ''}`
  return 'EVT-' + createHash('sha256').update(norm).digest('hex').slice(0, 12)
}

/** GDELT's compact 20260612T093000Z → ISO 2026-06-12T09:30:00Z. Already-ISO or junk falls back to now. */
export function parseSeendate(s: string, now = () => new Date()): string {
  const m = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z?$/.exec((s || '').trim())
  if (m) return `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}Z`
  const d = new Date(s)
  if (!Number.isNaN(d.getTime())) return d.toISOString().replace(/\.\d{3}Z$/, 'Z')
  return now().toISOString().replace(/\.\d{3}Z$/, 'Z')
}

/** Read the events ledger and return the set of event_ids already processed (for possible_duplicate marking). */
export function loadLedgerEventIds(ledgerPath: string): Set<string> {
  const ids = new Set<string>()
  try {
    for (const ln of fs.readFileSync(ledgerPath, 'utf8').split('\n')) {
      const t = ln.trim()
      if (!t) continue
      try {
        const o = JSON.parse(t)
        if (o && typeof o.event_id === 'string') ids.add(o.event_id)
      } catch {
        // a corrupt ledger line never breaks ingestion
      }
    }
  } catch {
    // no ledger yet → nothing is a duplicate
  }
  return ids
}

export interface NormalizeDeps {
  ledgerEventIds: Set<string>
  seen: SeenCache
  now?: () => Date
}

/**
 * Filter to approved sources, dedup, and shape into NewsItems. Returns only items NOT already in the
 * seen-cache (those have been scored before). Within one call, the first occurrence of an event_id wins.
 */
export function normalizeAndFilter(raws: RawArticle[], deps: NormalizeDeps): NewsItem[] {
  const now = deps.now || (() => new Date())
  const out: NewsItem[] = []
  const seenThisRun = new Set<string>()
  for (const a of raws) {
    // strip HTML/markup + entities up front so the STORED headline is clean AND the event_id is hashed
    // from the same clean text the gauntlet's Gate-0 will see (one consistent identity everywhere)
    const title = cleanText(a.title)
    const url = (a.url || '').trim()
    if (!looksLikeHeadline(title) || !url) continue // floor: real prose, not empty markup debris
    const meta = lookupSource(a.domain)
    if (!meta) continue // off-list firewall
    const event_id = eventIdFor(title, url)
    if (seenThisRun.has(event_id)) continue
    seenThisRun.add(event_id)
    if (deps.seen.has(event_id)) continue // already scored in a prior cycle — skip the Groq cost
    out.push({
      event_id,
      headline: title.slice(0, 500),
      url,
      domain: a.domain,
      source_name: meta.source_name,
      region: meta.region,
      input_nature: meta.input_nature,
      found_at: parseSeendate(a.seendate, now),
      dedup_status: deps.ledgerEventIds.has(event_id) ? 'possible_duplicate' : 'new',
      via: a.via || 'gdelt',
    })
  }
  return out
}
