// Feed health — the ONE parse of #287's fetch ledger (`<DATA_DIR>/_connectors/run_ledger.ndjson`), which
// run_connectors.py appends one row to per connector × subject per sweep. Two very different questions read
// the same rows, so they read them through this one module (CLAUDE.md §2 — no parallel parse of the same
// truth):
//   • the repair watchdog (connector-runner.ts) asks "which feeds are broken enough to spend a repair on?"
//   • the Data Library (pipelines.ts → GET /api/pipelines) asks "is this feed live, or is it broken?"
//
// Pool freshness (is there a recent FILE) and fetch health (did the last FETCH succeed) are different facts
// and are kept separate: a feed can be fresh-but-broken (the file is inside its SLA, the source has since
// started 500ing) or stale-but-healthy (the source itself has published nothing new). pipelines.ts joins the
// two; this module never guesses at the file side.
//
// Never throws: an absent/unreadable ledger reads as "no rows", and every malformed line is skipped.

import fs from 'node:fs'
import path from 'node:path'
import { DATA_DIR } from './config'

// The decisions run_connectors.py writes. Anything else is carried through verbatim and treated as unknown.
export type FetchDecision =
  | 'refetched' // fetched now, successfully
  | 'fresh' // inside its SLA, no fetch needed
  | 'failed' // a fetch was attempted and failed (after its own in-sweep retries)
  | 'skipped_no_pool' // no data/<SUBJECT>/ on this host — nothing to write into
  | 'skipped_manual' // the manifest opted out of auto-fetch (hand-staged)
  | 'would_refetch' // --dry-run only: it WOULD have fetched

/**
 * The health of one connector × subject, as the fetch ledger last recorded it.
 *   ok         — the last sweep succeeded (refetched) or found it already inside its SLA (fresh)
 *   failing    — the last sweep failed, but not yet for `BROKEN_THRESHOLD` sweeps in a row (could be a blip)
 *   broken     — the last sweep failed and the failure has persisted; the source has likely changed/died
 *   no_pool    — the sweep ran but there is no pool folder for this subject on the fetching host
 *   manual     — auto-fetch is off for this feed by its own manifest; a human stages the file
 *   pending    — a dry-run sweep said it would refetch; no real attempt recorded yet
 *   never_run  — the runner has never swept this connector × subject at all
 */
export type FeedHealthState = 'ok' | 'failing' | 'broken' | 'no_pool' | 'manual' | 'pending' | 'never_run'

export interface FeedHealth {
  connector: string
  subject: string
  state: FeedHealthState
  decision: FetchDecision | string | null // the raw last decision, or null when never swept
  lastSweepAt: string | null // ISO — when that decision was recorded
  message: string // the last row's message (the fetch error text on a failure)
  failStreak: number // consecutive `failed` sweeps ending at the latest row (0 when the last one did not fail)
  attempts: number // attempts the last sweep made
}

// A feed counts as BROKEN only after this many consecutive failed sweeps. run_connectors.py already retries
// 0/60/300s WITHIN one sweep and the launchd cadence is 6-hourly, so three in a row is a sustained ~12–18h
// break rather than a transient blip. The repair watchdog spends real money on a repair, and the cockpit
// paints a red "broken" headline — both want the same, unforgiving-but-not-twitchy definition.
export const BROKEN_THRESHOLD = 3

export const feedKey = (connector: string, subject: string): string => `${connector}::${subject}`

function stateFor(decision: string, failStreak: number, threshold: number): FeedHealthState {
  switch (decision) {
    case 'refetched':
    case 'fresh':
      return 'ok'
    case 'failed':
      return failStreak >= threshold ? 'broken' : 'failing'
    case 'skipped_no_pool':
      return 'no_pool'
    case 'skipped_manual':
      return 'manual'
    case 'would_refetch':
      return 'pending'
    default:
      return 'pending'
  }
}

/**
 * PURE: fold the raw ledger text into one FeedHealth per connector × subject, keyed `<connector>::<subject>`.
 * Rows are in append (chronological) order, so the last row for a key wins and the failure streak is the
 * trailing run of consecutive `failed` decisions — ANY other decision (refetched / fresh / skipped_*) resets
 * it. Malformed lines are skipped; a row counts only when it carries string `connector` + `subject` and a
 * non-null `decision`.
 */
export function feedHealthFromLedger(ledgerText: string, threshold: number = BROKEN_THRESHOLD): Map<string, FeedHealth> {
  const out = new Map<string, FeedHealth>()
  for (const line of (ledgerText || '').split('\n')) {
    const t = line.trim()
    if (!t) continue
    let row: any
    try { row = JSON.parse(t) } catch { continue }
    if (!row || typeof row !== 'object' || Array.isArray(row)) continue
    if (typeof row.connector !== 'string' || typeof row.subject !== 'string' || row.decision == null) continue
    const decision = String(row.decision)
    const key = feedKey(row.connector, row.subject)
    const prior = out.get(key)
    const failStreak = decision === 'failed' ? (prior?.failStreak ?? 0) + 1 : 0
    const ts = Number(row.ts)
    const attempts = Number(row.attempts)
    out.set(key, {
      connector: row.connector,
      subject: row.subject,
      state: stateFor(decision, failStreak, threshold),
      decision,
      lastSweepAt: Number.isFinite(ts) && ts > 0 ? new Date(ts * 1000).toISOString().replace(/\.\d{3}Z$/, 'Z') : null,
      message: String(row.message || ''),
      failStreak,
      attempts: Number.isFinite(attempts) ? attempts : 0,
    })
  }
  return out
}

/** The health of every connector × subject the fetch ledger knows about. Empty map when it is unreadable. */
export function readFeedHealth(threshold: number = BROKEN_THRESHOLD): Map<string, FeedHealth> {
  let text = ''
  try { text = fs.readFileSync(path.join(DATA_DIR, '_connectors', 'run_ledger.ndjson'), 'utf8') } catch { return new Map() }
  return feedHealthFromLedger(text, threshold)
}

/** The health of ONE connector × subject, or the never_run default when the ledger has no row for it. */
export function feedHealthOf(
  health: Map<string, FeedHealth>, connector: string, subject: string,
): FeedHealth {
  return health.get(feedKey(connector, subject)) ?? {
    connector, subject, state: 'never_run', decision: null, lastSweepAt: null, message: '', failStreak: 0, attempts: 0,
  }
}
