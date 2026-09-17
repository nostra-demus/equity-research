// Reader for the shared market-price feed — the same lane `scripts/market_prices.py` consumes.
//
// The feed is a FILE DROP by design (frameworks/EXTERNAL_DATA.md §7): a fetcher, or the operator, writes
// CSVs and nothing in the engine makes a live call for prices. This module only reads them, so the
// benchmark comparison has a real source or honestly reports that it has none.
//
//   data/_market/<provider>/<anything>.csv     header: date,symbol,close[,volume]
//
// Deliberately tolerant: a missing folder, an unreadable file or a malformed row is skipped rather than
// thrown. An absent feed is a normal state — it means "no benchmark loaded", which the UI says out
// loud — and it must never take down the portfolio read that surrounds it.

import fs from 'node:fs'
import path from 'node:path'
import { DATA_DIR } from './config'

export const MARKET_FEED_DIR = path.join(DATA_DIR, '_market')

export interface Close { date: string; close: number }

/** A real calendar date, not merely the right SHAPE. The shape-only test accepted 2026-13-40, which
 *  Date.parse then turns into NaN — and a NaN span loses every `span > bestSpan` comparison, so provider
 *  selection could finish with nothing chosen and the caller dereferenced null. One malformed row in an
 *  operator-dropped CSV took down the whole portfolio read, which is exactly what this module's contract
 *  says must never happen. */
function isIsoDate(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false
  const d = new Date(`${s}T00:00:00Z`)
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s
}

/** Parse one feed CSV's text and return the requested symbol's date→close rows it carries. Shared by
 *  `readCloses` (every file) and `readNewestClose` (the single newest file), so the row-validity rules —
 *  the documented header shape, a real calendar date, a positive close — live in exactly one place. */
function parseFeedCsv(text: string, want: string): Map<string, number> {
  const byDate = new Map<string, number>()
  const lines = text.split(/\r?\n/)
  if (lines.length < 2) return byDate
  const header = lines[0]!.split(',').map((h) => h.trim().toLowerCase())
  const iDate = header.indexOf('date')
  const iSymbol = header.indexOf('symbol')
  const iClose = header.indexOf('close')
  if (iDate < 0 || iSymbol < 0 || iClose < 0) return byDate // not the documented shape — skip the file
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i]!.split(',')
    if (row.length <= Math.max(iDate, iSymbol, iClose)) continue
    if ((row[iSymbol] ?? '').trim().toUpperCase() !== want) continue
    const date = (row[iDate] ?? '').trim()
    const close = Number((row[iClose] ?? '').trim())
    // A zero or negative close is not a price. Left in, it makes the ratio returns downstream read
    // as a -100% move rather than as missing data.
    if (!isIsoDate(date) || !Number.isFinite(close) || close <= 0) continue
    byDate.set(date, close)
  }
  return byDate
}

/** Widest date span wins, and the provider name breaks a tie so the answer is stable across runs rather
 *  than depending on directory order. Shared by `readCloses` and `readNewestClose`: ONE PROVIDER ANSWERS,
 *  NEVER A BLEND. Two providers can both carry SPY on different bases — one adjusted for dividends and
 *  splits, one not — and merging them into a single date→close map produces a series that steps between
 *  the two whenever their dates interleave. Every return computed from it is then partly a switch of
 *  source, and which source wins on any given day is decided by the order the filesystem happened to
 *  list the folders. So the provider with the widest date span is used ALONE; the others are ignored
 *  rather than averaged or interleaved. */
function pickWidestSpan(perProvider: Map<string, Map<string, number>>): Map<string, number> | null {
  let chosen: Map<string, number> | null = null
  let bestSpan = -1
  for (const [, byDate] of [...perProvider.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    const dates = [...byDate.keys()].sort()
    const span = Date.parse(`${dates[dates.length - 1]!}T00:00:00Z`) - Date.parse(`${dates[0]!}T00:00:00Z`)
    if (Number.isFinite(span) && span > bestSpan) { bestSpan = span; chosen = byDate }
  }
  return chosen
}

function toSortedCloses(byDate: Map<string, number> | null): Close[] {
  if (!byDate) return []
  return [...byDate.entries()].map(([date, close]) => ({ date, close })).sort((a, b) => a.date.localeCompare(b.date))
}

function feedProviders(): string[] {
  try {
    return fs.readdirSync(MARKET_FEED_DIR, { withFileTypes: true })
      .filter((e) => e.isDirectory() && !e.name.startsWith('.'))
      .map((e) => e.name)
  } catch { return [] } // no feed at all — the normal state before one is dropped in
}

/** Every daily close the feed holds for one symbol, oldest first, de-duplicated by date.
 *  Symbol matching is case-insensitive: a feed may write SPY, spy or ^GSPC casing. Reads and merges
 *  EVERY file under every provider — the right answer for an actual benchmark-return computation, which
 *  needs the full window. A caller that only needs to know whether the feed is CURRENT (not its whole
 *  history) wants `readNewestClose` instead: this function's cost grows with every file ever written to
 *  the feed, which is unbounded (see `readNewestClose`'s doc). */
export function readCloses(symbol: string): Close[] {
  const want = symbol.trim().toUpperCase()
  if (!want) return []
  const providers = feedProviders()
  if (providers.length === 0) return []

  const perProvider = new Map<string, Map<string, number>>()
  for (const provider of providers.slice().sort()) {
    const dir = path.join(MARKET_FEED_DIR, provider)
    let files: string[] = []
    try { files = fs.readdirSync(dir).filter((n) => n.toLowerCase().endsWith('.csv')) } catch { continue }
    const byDate = new Map<string, number>()
    for (const file of files) {
      let text = ''
      try { text = fs.readFileSync(path.join(dir, file), 'utf8') } catch { continue }
      for (const [date, close] of parseFeedCsv(text, want)) byDate.set(date, close)
    }
    if (byDate.size > 0) perProvider.set(provider, byDate)
  }
  return toSortedCloses(pickWidestSpan(perProvider))
}

/** The same answer as `readCloses` — provider selection and row rules are identical — but bounded to
 *  reading ONE file per provider instead of every file ever written.
 *
 *  `scripts/fetch_market_feed.py` writes a brand-new whole-history CSV every trading day and never prunes
 *  old ones (frameworks/MARKET_FEED.md), so `_market/<provider>/` accumulates one file per day forever.
 *  `readCloses` merges every one of them, which is correct for computing a return over an arbitrary past
 *  window but unbounded for `/api/health`: in production this directory is a Google Drive projection, the
 *  cache in front of it is necessarily cold on every server restart, and `deploy.sh` uses `/api/health` as
 *  its release gate — so a full scan on a cold cache risks blocking the event loop, or the gate itself,
 *  right when a release is being judged (PR #706 review, "Keep full feed scans out of the deployment
 *  health gate"). Each day's file carries the same start date as every earlier one (the source, FRED,
 *  serves the whole series every call) and only appends more recent rows, so the newest file per provider
 *  already IS that provider's full span — reading only it gives the identical widest-span answer at a
 *  cost bounded by one file's size, not by how many days the feed has been running. "Newest" is judged by
 *  file MODIFICATION TIME, not by parsing a filename, so this makes no assumption about any one
 *  provider's naming convention. */
export function readNewestClose(symbol: string): Close[] {
  const want = symbol.trim().toUpperCase()
  if (!want) return []
  const providers = feedProviders()
  if (providers.length === 0) return []

  const perProvider = new Map<string, Map<string, number>>()
  for (const provider of providers.slice().sort()) {
    const dir = path.join(MARKET_FEED_DIR, provider)
    let files: string[] = []
    try { files = fs.readdirSync(dir).filter((n) => n.toLowerCase().endsWith('.csv')) } catch { continue }
    let newest: string | null = null
    let newestMtime = -Infinity
    for (const file of files) {
      let mtime = -Infinity
      try { mtime = fs.statSync(path.join(dir, file)).mtimeMs } catch { continue }
      if (mtime > newestMtime) { newestMtime = mtime; newest = file }
    }
    if (!newest) continue
    let text = ''
    try { text = fs.readFileSync(path.join(dir, newest), 'utf8') } catch { continue }
    const byDate = parseFeedCsv(text, want)
    if (byDate.size > 0) perProvider.set(provider, byDate)
  }
  return toSortedCloses(pickWidestSpan(perProvider))
}

/** Whether any feed folder exists at all — lets the UI distinguish "no feed configured" from
 *  "a feed exists but does not carry this symbol", which are different problems with different fixes. */
export function feedPresent(): boolean {
  return feedProviders().length > 0
}
