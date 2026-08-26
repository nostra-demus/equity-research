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

function isIsoDate(s: string): boolean { return /^\d{4}-\d{2}-\d{2}$/.test(s) }

/** Every daily close the feed holds for one symbol, oldest first, de-duplicated by date.
 *  Symbol matching is case-insensitive: a feed may write SPY, spy or ^GSPC casing. */
export function readCloses(symbol: string): Close[] {
  const want = symbol.trim().toUpperCase()
  if (!want) return []
  let providers: string[] = []
  try {
    providers = fs.readdirSync(MARKET_FEED_DIR, { withFileTypes: true })
      .filter((e) => e.isDirectory() && !e.name.startsWith('.'))
      .map((e) => e.name)
  } catch { return [] } // no feed at all — the normal state before one is dropped in

  const byDate = new Map<string, number>()
  for (const provider of providers) {
    const dir = path.join(MARKET_FEED_DIR, provider)
    let files: string[] = []
    try { files = fs.readdirSync(dir).filter((n) => n.toLowerCase().endsWith('.csv')) } catch { continue }
    for (const file of files) {
      let text = ''
      try { text = fs.readFileSync(path.join(dir, file), 'utf8') } catch { continue }
      const lines = text.split(/\r?\n/)
      if (lines.length < 2) continue
      const header = lines[0]!.split(',').map((h) => h.trim().toLowerCase())
      const iDate = header.indexOf('date')
      const iSymbol = header.indexOf('symbol')
      const iClose = header.indexOf('close')
      if (iDate < 0 || iSymbol < 0 || iClose < 0) continue // not the documented shape — skip the file
      for (let i = 1; i < lines.length; i++) {
        const row = lines[i]!.split(',')
        if (row.length <= Math.max(iDate, iSymbol, iClose)) continue
        if ((row[iSymbol] ?? '').trim().toUpperCase() !== want) continue
        const date = (row[iDate] ?? '').trim()
        const close = Number((row[iClose] ?? '').trim())
        if (!isIsoDate(date) || !Number.isFinite(close)) continue
        byDate.set(date, close)
      }
    }
  }
  return [...byDate.entries()].map(([date, close]) => ({ date, close })).sort((a, b) => a.date.localeCompare(b.date))
}

/** Whether any feed folder exists at all — lets the UI distinguish "no feed configured" from
 *  "a feed exists but does not carry this symbol", which are different problems with different fixes. */
export function feedPresent(): boolean {
  try {
    return fs.readdirSync(MARKET_FEED_DIR, { withFileTypes: true }).some((e) => e.isDirectory() && !e.name.startsWith('.'))
  } catch { return false }
}
