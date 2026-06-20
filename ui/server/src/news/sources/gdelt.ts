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
  timeoutMs?: number // per-request hard timeout (a hung GDELT socket must never block the cycle)
  // Multi-cycle penalty backoff. When set (production passes both), a 429 puts GDELT to sleep for
  // backoffCyclesOn429 whole cycles — i.e. we stop poking it entirely for ~that long — so its IP
  // penalty-box can actually DECAY (a compliant 1-poke-per-5-min still kept it alive). Absent in unit
  // tests (they pass neither), so the module-level backoff state is never set or read there.
  cycleMs?: number // length of one ingest cycle (pollIntervalMin × 60_000)
  backoffCyclesOn429?: number // cycles to skip GDELT after a 429
}

export interface GdeltDeps {
  fetchFn?: typeof fetch
  sleep?: (ms: number) => Promise<void>
  log?: (msg: string) => void
}

const realSleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

// Module-level GDELT penalty backoff (persists across cycles via the long-lived scheduler). Only
// touched when the cycle config (cycleMs + backoffCyclesOn429) is supplied — production-only.
let gdeltSkipUntilMs = 0
/** Test hook: clear the cross-cycle GDELT backoff so cases don't leak into each other. */
export function resetGdeltBackoff(): void { gdeltSkipUntilMs = 0 }

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
  const backoffEnabled = !!(opts.cycleMs && opts.backoffCyclesOn429)

  // If GDELT 429'd us recently, stay completely off it until the backoff window elapses — poking a
  // penalty-boxed IP (even once/cycle) can keep the penalty alive; only true quiet lets it decay.
  if (backoffEnabled && Date.now() < gdeltSkipUntilMs) {
    log(`gdelt: penalty backoff — skipping (~${Math.ceil((gdeltSkipUntilMs - Date.now()) / 60_000)} min left)`)
    return []
  }

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
        // HARD timeout: this was the ONE fetch in the pipeline with no abort signal — a hung GDELT
        // socket (no response, no FIN) blocked the whole cycle forever, wedging the ingester. Never again.
        const res = await fetchFn(url, { headers: { 'user-agent': 'screener-news-ingester/1' }, signal: AbortSignal.timeout(opts.timeoutMs ?? 20_000) })
        if (res.status === 429) {
          if (backoffEnabled) gdeltSkipUntilMs = Date.now() + opts.cycleMs! * opts.backoffCyclesOn429!
          log(`gdelt chunk ${qi}: 429${backoffEnabled ? ` — backing off GDELT for ${opts.backoffCyclesOn429} cycles` : ' — backing off for this cycle'}`)
          return [...byUrl.values()]
        }
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

export interface GdeltDocOptions {
  baseUrl: string
  timeoutMs?: number // per-request hard timeout (the on-demand reader must never hang on a stuck socket)
  maxRecords?: number // GDELT caps at 250; corroboration needs only a handful of outlets
  lookbackMin?: number // how far back to look for the same event (default ~14 days)
}

/**
 * ONE free-text DOC query — the corroboration probe. Where fetchGdelt sweeps our approved DOMAINS for the
 * firehose, this asks GDELT "who ELSE is reporting THIS event?" by keyword, so a publisher that blocked our
 * direct read can be pieced together from the secondary wire (the server-side version of a human checking
 * other outlets). It SHARES the module-level penalty backoff with the firehose so an on-demand probe can
 * never reignite the ingester's IP penalty: if GDELT recently 429'd we skip entirely, and a fresh 429 here
 * backs the shared IP off for a few minutes too. One shot, no retry, hard timeout. Never throws — any
 * failure (429, non-200, non-JSON, network) returns [] and the caller degrades to the story floor.
 */
export async function fetchGdeltDoc(query: string, opts: GdeltDocOptions, deps: GdeltDeps = {}): Promise<RawArticle[]> {
  const fetchFn = deps.fetchFn || fetch
  const log = deps.log || (() => {})
  const q = String(query || '').trim()
  if (!q) return []
  if (Date.now() < gdeltSkipUntilMs) { log('gdelt-doc: penalty backoff — skipping corroboration'); return [] }
  const p = new URLSearchParams({
    query: q,
    mode: 'ArtList',
    format: 'json',
    maxrecords: String(Math.min(250, opts.maxRecords ?? 25)),
    timespan: `${Math.max(1, Math.round(opts.lookbackMin ?? 20_160))}min`,
    sort: 'datedesc',
  })
  const url = `${opts.baseUrl}?${p.toString()}`
  try {
    const res = await fetchFn(url, { headers: { 'user-agent': 'screener-news-ingester/1' }, signal: AbortSignal.timeout(opts.timeoutMs ?? 6000) })
    if (res.status === 429) {
      // protect the shared IP for the firehose AT LEAST as strongly as the firehose protects itself: match
      // its ~20-min recovery (4 cycles of true quiet — a shorter window would let the ingester walk straight
      // back into a still-penalised IP). Math.max so an on-demand probe can never SHORTEN a longer live backoff.
      gdeltSkipUntilMs = Math.max(gdeltSkipUntilMs, Date.now() + 20 * 60_000)
      log('gdelt-doc: 429 — backing the shared GDELT IP off for ~20 min')
      return []
    }
    if (!res.ok) { log(`gdelt-doc: HTTP ${res.status}`); return [] }
    const text = await res.text()
    let data: any
    try { data = JSON.parse(text) } catch { log('gdelt-doc: non-JSON body'); return [] }
    const out: RawArticle[] = []
    const seen = new Set<string>()
    for (const a of data?.articles || []) {
      const u = String(a?.url || '').trim()
      if (!u || seen.has(u)) continue
      seen.add(u)
      out.push({
        title: String(a?.title || '').trim(),
        url: u,
        domain: String(a?.domain || '').trim(),
        seendate: String(a?.seendate || '').trim(),
        language: a?.language ? String(a.language) : undefined,
        sourcecountry: a?.sourcecountry ? String(a.sourcecountry) : undefined,
      })
    }
    return out
  } catch (e: any) {
    log(`gdelt-doc: ${e?.message || 'fetch error'}`)
    return []
  }
}
