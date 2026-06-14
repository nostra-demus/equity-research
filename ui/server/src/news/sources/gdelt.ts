// GDELT DOC 2.0 adapter — the keyless news firehose. We ask GDELT only for our approved-source
// domains over a short look-back window, newest first. GDELT requires no API key and is only lightly
// rate-limited, which is exactly why it fits a "never hit a rate limit" 24/7 loop.
//
// Breadth vs precision: the QUERY uses GDELT's loose `domain:` operator (matches subdomains too —
// markets.ft.com), so we don't miss anything; the loose operator can also pull look-alikes
// (notactuallyft.com), so the RETURN path is filtered by approved-domains.lookupSource(), which
// matches only on a dot boundary. Broad fetch, safe filter.

import { approvedDomains } from './approved-domains'
import type { RawArticle } from '../types'

export interface GdeltOptions {
  lookbackMin: number
  baseUrl: string
  maxRecords?: number // GDELT caps at 250
  chunkSize?: number // domains OR-ed per query (keeps each query well under GDELT's length limit)
  chunkGapMs?: number // pause between queries — GDELT enforces "one request every 5 seconds"
}

export interface GdeltDeps {
  fetchFn?: typeof fetch
  sleep?: (ms: number) => Promise<void>
  log?: (msg: string) => void
}

const realSleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

/** Group domains into OR-queries so each GDELT call stays small and reliable. */
export function buildQueries(domains: string[], chunkSize = 6): string[] {
  const queries: string[] = []
  for (let i = 0; i < domains.length; i += chunkSize) {
    const group = domains.slice(i, i + chunkSize)
    queries.push('(' + group.map((d) => `domain:${d}`).join(' OR ') + ')')
  }
  return queries
}

function gdeltUrl(baseUrl: string, query: string, lookbackMin: number, maxRecords: number): string {
  const p = new URLSearchParams({
    query,
    mode: 'ArtList',
    format: 'json',
    maxrecords: String(Math.min(250, maxRecords)),
    timespan: `${Math.max(1, Math.round(lookbackMin))}min`,
    sort: 'datedesc',
  })
  return `${baseUrl}?${p.toString()}`
}

/**
 * Pull the last `lookbackMin` minutes of articles from approved-source domains. Resilient by design:
 * a failed or rate-limited chunk is logged and skipped, never thrown — one bad query must not kill
 * the cycle. Returns raw articles deduped by URL (GDELT overlaps across chunks/windows).
 */
export async function fetchGdelt(opts: GdeltOptions, deps: GdeltDeps = {}): Promise<RawArticle[]> {
  const fetchFn = deps.fetchFn || fetch
  const sleep = deps.sleep || realSleep
  const log = deps.log || (() => {})
  const maxRecords = opts.maxRecords ?? 250
  const queries = buildQueries(approvedDomains(), opts.chunkSize ?? 11)
  // GDELT enforces "one request every 5 seconds" (its own 429 text); space queries past that window.
  const chunkGapMs = opts.chunkGapMs ?? 6000

  const byUrl = new Map<string, RawArticle>()
  for (let qi = 0; qi < queries.length; qi++) {
    const url = gdeltUrl(opts.baseUrl, queries[qi], opts.lookbackMin, maxRecords)
    let attempt = 0
    // A 429 is GDELT rate-limiting / penalty-boxing this IP — it will NOT clear in a few seconds, and
    // hammering it with retries only keeps the penalty alive. So on a 429 we ABORT GDELT for the WHOLE
    // cycle (no retry, skip the remaining chunks) and let the penalty decay; the engine pokes GDELT at
    // most once per cycle, which its "1 req / 5s" rule tolerates. A 5xx / network blip is transient and
    // still gets up to 3 backed-off retries on that single chunk.
    for (;;) {
      try {
        const res = await fetchFn(url, { headers: { 'user-agent': 'screener-news-ingester/1' } })
        if (res.status === 429) { log(`gdelt chunk ${qi}: 429 — backing off GDELT for this cycle`); return [...byUrl.values()] }
        if (res.status >= 500) {
          if (++attempt >= 3) { log(`gdelt chunk ${qi}: ${res.status}, gave up`); break }
          await sleep(Math.max(chunkGapMs, 2000) * attempt)
          continue
        }
        if (!res.ok) { log(`gdelt chunk ${qi}: HTTP ${res.status}`); break }
        const text = await res.text()
        let data: any
        try { data = JSON.parse(text) } catch { log(`gdelt chunk ${qi}: non-JSON body`); break }
        for (const a of data?.articles || []) {
          const u = String(a?.url || '').trim()
          if (!u || byUrl.has(u)) continue
          byUrl.set(u, {
            title: String(a?.title || '').trim(),
            url: u,
            domain: String(a?.domain || '').trim(),
            seendate: String(a?.seendate || '').trim(),
            language: a?.language ? String(a.language) : undefined,
            sourcecountry: a?.sourcecountry ? String(a.sourcecountry) : undefined,
          })
        }
        break
      } catch (e: any) {
        if (++attempt >= 3) { log(`gdelt chunk ${qi}: ${e?.message || 'fetch error'}, gave up`); break }
        await sleep(2000 * attempt)
      }
    }
    // be gentle on GDELT's shared cluster between chunks — must clear its 5s-per-request window
    if (qi < queries.length - 1) await sleep(chunkGapMs)
  }
  return [...byUrl.values()]
}
