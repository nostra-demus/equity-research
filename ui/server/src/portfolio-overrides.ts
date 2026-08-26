// What the operator knows about a holding that the statement cannot say.
//
// The first of these is CASH EQUIVALENCE. A T-bill ETF is cash with a ticker: it is held to park money,
// not to express a view, and counting it as an investment makes the invested/cash split meaningless —
// a book that is 72% in SGOV reads as "99.7% invested" when it is really mostly waiting.
//
// THE BROKER CANNOT ANSWER THIS. In a real Flex export, SGOV (ISHARES 0-3 MONTH TREASURY B), CANE (a
// sugar fund) and GLDM (gold) all arrive as assetCategory="STK", subCategory="ETF". Nothing in the
// statement separates them. The only machine-readable difference is the description text, and matching
// on that is guessing — "TREASURY" would also catch an actively-managed long-duration bond fund, which
// is an investment with real duration risk, not cash.
//
// So it is declared once by the operator and stored here, in the same private, git-ignored lane as the
// statements themselves. Nothing is inferred, and nothing is defaulted on.

import fs from 'node:fs'
import path from 'node:path'

const FILE = 'overrides.json'
/** Bounded like every other file in this lane. A book with 200 declared cash equivalents is not a book. */
export const MAX_CASH_EQUIVALENTS = 200

export interface PortfolioOverrides {
  /** Symbols the operator has declared to be cash equivalents, upper-case. */
  cashEquivalents: string[]
}

function filePath(dir: string): string { return path.join(dir, FILE) }

/** A file that cannot be read is an empty set of overrides, never an error: these decorate the book,
 *  and losing them must not cost the book. */
export function readOverrides(dir: string): PortfolioOverrides {
  let raw: unknown
  try { raw = JSON.parse(fs.readFileSync(filePath(dir), 'utf8')) } catch { return { cashEquivalents: [] } }
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { cashEquivalents: [] }
  const list = (raw as { cashEquivalents?: unknown }).cashEquivalents
  if (!Array.isArray(list)) return { cashEquivalents: [] }
  const out = new Set<string>()
  for (const s of list) {
    if (typeof s !== 'string') continue
    const k = s.trim().toUpperCase()
    if (k) out.add(k)
  }
  return { cashEquivalents: [...out].sort() }
}

function write(dir: string, o: PortfolioOverrides): void {
  fs.mkdirSync(dir, { recursive: true })
  // Through a temp file: a crash mid-write would otherwise leave a truncated object and every
  // declaration gone, silently turning the book's cash back into "invested".
  const tmp = `${filePath(dir)}.tmp`
  fs.writeFileSync(tmp, JSON.stringify(o, null, 2) + '\n')
  fs.renameSync(tmp, filePath(dir))
}

/** Declare a holding a cash equivalent, or take the declaration back. */
export function setCashEquivalent(dir: string, symbol: string, isCash: boolean): void {
  const key = String(symbol ?? '').trim().toUpperCase()
  if (!key) throw new Error('a holding symbol is required')
  const o = readOverrides(dir)
  const set = new Set(o.cashEquivalents)
  if (isCash) {
    if (!set.has(key) && set.size >= MAX_CASH_EQUIVALENTS) {
      throw new Error(`no room for more cash equivalents (${MAX_CASH_EQUIVALENTS})`)
    }
    set.add(key)
  } else {
    set.delete(key)
  }
  write(dir, { cashEquivalents: [...set].sort() })
}

export function isCashEquivalent(o: PortfolioOverrides, symbol: string | null): boolean {
  return !!symbol && o.cashEquivalents.includes(symbol.trim().toUpperCase())
}
