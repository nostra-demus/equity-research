// Is the market feed alive? — judged from the files the ENGINE can actually read.
//
// The benchmark feed is written by a timer on the doer machine (scripts/ops/market-feed-local.sh), and
// every way it can fail is quiet: the timer may not be installed, the wrapper skips when the Drive
// projection or the writer identity does not resolve, the fetch itself can fail, and a laptop asleep at
// 07:10 gets one catch-up. None of that reaches a screen. The engine's own symptom — an empty benchmark
// line and `feedPresent: false` — sat in one chart's caption for weeks and nobody read it.
//
// THIS MODULE JUDGES THE FILE, NOT THE TIMER. A run ledger can say the fetch succeeded and still be
// useless, because the one failure nothing else can see is the fetcher writing into one projection while
// the engine reads another. What the engine can read is the only thing worth calling healthy. The
// refresher's own last outcome is read beside it (the breadcrumb the wrapper writes) to say WHY, never
// to decide whether the data is there.
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { readCloses } from './market-feed'

/** Where the refresher leaves its last word — beside `connector-supervisor.json`, the same ops directory
 *  this engine already reads a scheduled job's status from, and the one place that survives the Drive
 *  projection being unavailable (which is one of the things it has to be able to report). */
export const REFRESH_STATUS_PATH = path.join(os.homedir(), '.nostra-ops', 'market-feed.json')

/** Trading days a series may be behind before it is failing. A close read on Tuesday morning is Monday's;
 *  a long weekend and a public holiday put three trading days between the newest close and today without
 *  anything being wrong. Counted in trading days rather than calendar ones so the rule does not change
 *  meaning over a weekend. */
export const STALE_TRADING_DAYS = 3

export type MarketFeedState = 'healthy' | 'stale' | 'missing'

export interface MarketFeedSeries {
  symbol: string
  /** The newest close the engine can read, and its date — the as-of is the data's, never a file's mtime. */
  lastClose: string | null
  tradingDaysBehind: number | null
  state: MarketFeedState
}

/** What the refresher said it did, last time it ran (scripts/ops/market-feed-local.sh writes it). */
export interface MarketFeedRefresh {
  at: string
  /** `ok` | `failed` | `skipped` — the wrapper's own vocabulary, carried through rather than re-judged. */
  outcome: string
  detail: string
}

export interface MarketFeedHealth {
  series: MarketFeedSeries[]
  /** The worst state across the series asked about — what a status line should show. */
  state: MarketFeedState
  refresh: MarketFeedRefresh | null
  /** Said in plain words, so a status surface does not have to compose one. */
  detail: string
}

/** Trading days strictly between two ISO dates, counting Mon-Fri only. Exchange holidays are not known
 *  here, so a holiday reads as a trading day — the threshold allows for that rather than pretending. */
export function tradingDaysBetween(from: string, to: string): number | null {
  const a = Date.parse(`${from}T00:00:00Z`)
  const b = Date.parse(`${to}T00:00:00Z`)
  if (!Number.isFinite(a) || !Number.isFinite(b) || b < a) return null
  let days = 0
  for (let t = a + 86_400_000; t <= b; t += 86_400_000) {
    const day = new Date(t).getUTCDay()
    if (day !== 0 && day !== 6) days += 1
  }
  return days
}

/** The refresher's last word. Absent is normal — nothing has run yet, which is itself worth saying.
 *  Reads with `fs.promises` rather than `readFileSync`: this is called from `/api/health`, an async
 *  request handler on a hot path (the browser polls it every ~20s), and a sync read blocks the whole
 *  event loop — including every OTHER in-flight request — for however long the disk takes to answer. */
export async function readRefresh(statusPath: string = REFRESH_STATUS_PATH): Promise<MarketFeedRefresh | null> {
  try {
    const raw = JSON.parse(await fs.promises.readFile(statusPath, 'utf8'))
    const at = typeof raw?.at === 'string' ? raw.at : null
    if (!at || !Number.isFinite(Date.parse(at))) return null
    return {
      at,
      outcome: typeof raw?.outcome === 'string' ? raw.outcome : 'unknown',
      detail: typeof raw?.detail === 'string' ? raw.detail : '',
    }
  } catch { return null } // absent or unreadable — the files themselves are the verdict
}

const WORST: Record<MarketFeedState, number> = { healthy: 0, stale: 1, missing: 2 }

/** Trading days a burst of concurrent /api/health polls may share one parse of the feed. `readCloses`
 *  walks every CSV under every provider on every call, and `fetch_market_feed.py` never prunes old
 *  daily snapshot files — so an unbounded, unparsed feed reread on every poll from every open browser
 *  tab is the one thing this health check must not itself become. Only the real, unwrapped reader is
 *  memoized: every unit test below injects its own `deps.closes`, so tests stay isolated from this
 *  cache and from each other, and production data is never more than this TTL stale to the health
 *  check (the underlying series is still re-read in full by anything that needs it, e.g. the actual
 *  benchmark-return computation — this cache exists only for the /api/health hot path).
 *
 *  It MUST exceed the health poll cadence, or it expires before every poll and memoizes nothing: the
 *  cockpit polls /api/health every HEALTH_OK_MS (20s, ui/web/src/lib/store.ts), so a 15s TTL let every
 *  heartbeat reparse the whole feed anyway. 60s keeps at least two normal-cadence polls (and any burst of
 *  concurrent tabs between them) on one parse; the feed itself only changes a few times a day, so being
 *  up to a minute stale to the health check is immaterial. */
export const CLOSES_CACHE_TTL_MS = 60_000

export function memoizeCloses(
  reader: (symbol: string) => { date: string; close: number }[],
  ttlMs: number = CLOSES_CACHE_TTL_MS,
  now: () => number = Date.now,
): (symbol: string) => { date: string; close: number }[] {
  const cache = new Map<string, { at: number; rows: { date: string; close: number }[] }>()
  return (symbol: string) => {
    const t = now()
    const hit = cache.get(symbol)
    if (hit && t - hit.at < ttlMs) return hit.rows
    const rows = reader(symbol)
    cache.set(symbol, { at: t, rows })
    return rows
  }
}

const cachedReadCloses = memoizeCloses(readCloses)

/**
 * The state of each series the engine depends on, and one sentence about it.
 *
 * `today` is passed in so the rule is testable and so a caller can ask the question as of a run's own
 * date rather than the wall clock.
 */
export async function marketFeedHealth(symbols: string[], today: string, deps: {
  closes?: (symbol: string) => { date: string; close: number }[]
  refresh?: () => MarketFeedRefresh | null | Promise<MarketFeedRefresh | null>
} = {}): Promise<MarketFeedHealth> {
  const closesOf = deps.closes ?? cachedReadCloses
  const series: MarketFeedSeries[] = symbols.map((symbol) => {
    const rows = closesOf(symbol)
    // A future-dated (or otherwise-invalid) row is excluded, never trusted as the newest close —
    // frameworks/MARKET_FEED.md requires future observations to be excluded from every calculation.
    // Rows are sorted oldest-first (market-feed.ts), so the newest row ON OR BEFORE today is the last
    // one that survives this filter, not simply the last row in the array.
    const validRows = rows.filter((r) => r.date <= today)
    const last = validRows.length ? validRows[validRows.length - 1]!.date : null
    if (!last) return { symbol, lastClose: null, tradingDaysBehind: null, state: 'missing' }
    const behind = tradingDaysBetween(last, today)
    return {
      symbol, lastClose: last, tradingDaysBehind: behind,
      state: behind !== null && behind > STALE_TRADING_DAYS ? 'stale' : 'healthy',
    }
  })
  const state = series.reduce<MarketFeedState>((worst, s) => (WORST[s.state] > WORST[worst] ? s.state : worst), 'healthy')
  const refresh = await (deps.refresh ?? (() => readRefresh()))()
  const missing = series.filter((s) => s.state === 'missing').map((s) => s.symbol)
  const stale = series.filter((s) => s.state === 'stale')
  // The refresher's own last word is the WHY, and only when there is something to explain. A healthy feed
  // needs no story; a broken one is useless without the reason the last run gave.
  const why = refresh
    ? ` The last refresh ${refresh.outcome === 'ok' ? 'succeeded' : refresh.outcome} on ${refresh.at.slice(0, 10)}${refresh.detail ? `: ${refresh.detail}` : ''}.`
    : ' No refresh has reported itself yet — the timer may not be installed on this machine.'
  const detail = state === 'healthy'
    ? `Every series is current: ${series.map((s) => `${s.symbol} to ${s.lastClose}`).join(', ')}.`
    : `${missing.length ? `No price history at all for ${missing.join(', ')}.` : ''}`
      + `${stale.length ? `${missing.length ? ' ' : ''}${stale.map((s) => `${s.symbol} stops at ${s.lastClose}, ${s.tradingDaysBehind} trading days back`).join('; ')}.` : ''}`
      + why
  return { series, state, refresh, detail }
}
