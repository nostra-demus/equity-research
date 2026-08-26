// What the engine's own research says about what the fund actually owns.
//
// This is the join between two things that were deliberately kept apart: the book (what IS held, fed by
// the broker) and the research (what the engine SAID, in analyses/<TICKER>_<DATE>/decision_record.json).
// It is read-only in both directions — a verdict never changes a position, and a position never changes
// a verdict — so the calibration loop stays honest.
//
// WHAT IT IS FOR IS DISAGREEMENT. A holding that matches its Buy is not news. The two rows worth the
// screen space are the position held against an Avoid, and the large position with no research at all;
// both are invisible while the book and the dossiers live on separate screens.
//
// MATCHING IS EXACT OR EXPLICIT, NEVER FUZZY. Attributing one company's research to another is worse
// than showing nothing: it is a wrong verdict presented with the engine's authority. So an identical
// ticker matches automatically, and anything else needs the operator to say so once. Near-misses are
// SUGGESTED and never applied — the real book holds NHYDY while the engine covers NHY, which is the
// same company through an ADR, and a rule loose enough to catch that would also match BG to BGC.

import fs from 'node:fs'
import path from 'node:path'
import { ANALYSES_DIR } from './config'
import { summarizeRuns } from './data-status'
import { isValidTicker } from './sandbox'

/** How a holding reached its dossier. `exact` needs no confirmation; `linked` was confirmed once. */
export type ThesisMatch = 'exact' | 'linked'

/** The book's position against the engine's verdict. Direction matters: a Short Candidate verdict
 *  CONTRADICTS a long position and AGREES with a short one. */
export type ThesisStance = 'supported' | 'watch' | 'against' | 'unrated' | 'hedge' | 'none'

export interface ThesisRow {
  symbol: string
  currency: string | null
  /** The statement's own weight, never derived here. Null on a derivative, which carries exposure. */
  weightPct: number | null
  /** Negative for a short — the stance depends on which way the book is positioned. */
  quantity: number | null
  ticker: string | null
  matchedBy: ThesisMatch | null
  decision: string | null
  confidence: number | null
  decisionDate: string | null
  /** Days since the decision. A verdict without its age is not a verdict, it is a slogan. */
  ageDays: number | null
  runRoot: string | null
  runCount: number
  hasNewerPartial: boolean
  stance: ThesisStance
  /** Covered tickers this holding MIGHT be. Offered, never applied — see the matching note above. */
  suggestions: string[]
}

export interface PortfolioThesisRead {
  rows: ThesisRow[]
  /** Every ticker with a standing dossier, so the operator can link a holding to one. */
  covered: string[]
  /** Share of equity weight that has a dossier behind it, and the share that does not. */
  coveredWeightPct: number | null
  /** Positions held against their verdict — the number worth acting on. */
  againstCount: number
  /** Positions with no dossier at all. */
  uncoveredCount: number
}

const LINKS_FILE = 'thesis-links.json'
/** Bounded like every other private-lane file: a book with hundreds of manual links has a matching
 *  problem, not a linking problem. */
export const MAX_LINKS = 200

// ---------- the link store ----------

function linksPath(dir: string): string { return path.join(dir, LINKS_FILE) }

/** symbol (upper) -> ticker (upper). A file that cannot be read is an empty set of links, never an
 *  error: these are a decoration on the book, and losing them must not cost the book. */
export function readLinks(dir: string): Map<string, string> {
  const out = new Map<string, string>()
  let raw: unknown
  try { raw = JSON.parse(fs.readFileSync(linksPath(dir), 'utf8')) } catch { return out }
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return out
  for (const [symbol, ticker] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof ticker !== 'string' || !isValidTicker(ticker)) continue
    const key = symbol.trim().toUpperCase()
    if (!key) continue
    out.set(key, ticker.trim().toUpperCase())
  }
  return out
}

function writeLinks(dir: string, links: Map<string, string>): void {
  fs.mkdirSync(dir, { recursive: true })
  const obj: Record<string, string> = {}
  for (const [k, v] of [...links.entries()].sort((a, b) => a[0].localeCompare(b[0]))) obj[k] = v
  // Through a temp file: a crash mid-write would otherwise leave a truncated object and every link gone.
  const tmp = `${linksPath(dir)}.tmp`
  fs.writeFileSync(tmp, JSON.stringify(obj, null, 2) + '\n')
  fs.renameSync(tmp, linksPath(dir))
}

/** Link a holding to a ticker, or pass `null` to unlink. Validated here so every caller obeys one rule:
 *  the ticker must be one the engine actually has a dossier for — a link to nothing would show as
 *  "no research" while looking, to the operator, like a link that was made. */
export function setLink(dir: string, symbol: string, ticker: string | null, analysesDir: string = ANALYSES_DIR): void {
  const key = String(symbol ?? '').trim().toUpperCase()
  if (!key) throw new Error('a holding symbol is required')
  const links = readLinks(dir)
  if (ticker === null) {
    links.delete(key)
    writeLinks(dir, links)
    return
  }
  const want = String(ticker).trim().toUpperCase()
  if (!isValidTicker(want)) throw new Error('that is not a valid ticker')
  if (!coveredTickers(analysesDir).includes(want)) {
    throw new Error(`the engine has no dossier for ${want} — run the research first, then link to it`)
  }
  if (!links.has(key) && links.size >= MAX_LINKS) throw new Error(`no room for more links (${MAX_LINKS})`)
  links.set(key, want)
  writeLinks(dir, links)
}

// ---------- the join ----------

/** Every ticker with at least one run folder. `analyses/` also holds the engine's own working folders
 *  (`eval`, `tracking`, `portfolio`, `performance`), which are not tickers and are excluded by the same
 *  validity rule the company picker uses — no second list to keep in step. */
export function coveredTickers(analysesDir: string = ANALYSES_DIR): string[] {
  let names: string[] = []
  try { names = fs.readdirSync(analysesDir) } catch { return [] }
  const out = new Set<string>()
  for (const n of names) {
    if (n.startsWith('.')) continue
    const ticker = n.includes('_') ? n.slice(0, n.indexOf('_')) : n
    if (!isValidTicker(ticker)) continue
    // A DECISION, not merely a run folder. summarizeRuns falls back to the newest partial run when no
    // complete one exists, so `latestRun` is non-null for a ticker that has only ever been half-run —
    // and offering that in the link picker produces a link that reads as "no research" once made.
    if (!summarizeRuns(ticker, analysesDir).latestRun?.decision) continue
    out.add(ticker)
  }
  return [...out].sort()
}

/** Covered tickers that could plausibly be this holding under another listing. One must be a prefix of
 *  the other and they must differ by at most three characters — which catches NHY/NHYDY and the usual
 *  ADR suffixes. It is a SUGGESTION: it also catches BG/BGC, which are different companies, and that is
 *  exactly why nothing here is ever applied without the operator saying so. */
export function suggestTickers(symbol: string, covered: string[]): string[] {
  const s = symbol.trim().toUpperCase()
  if (!s) return []
  return covered.filter((t) => {
    if (t === s) return false
    const [short, long] = t.length < s.length ? [t, s] : [s, t]
    return long.startsWith(short) && long.length - short.length <= 3
  })
}

const SUPPORTS_LONG = new Set(['STRONG BUY', 'BUY', 'STARTER POSITION ONLY'])
const AGAINST_LONG = new Set(['AVOID', 'SHORT CANDIDATE'])

/** Where the book sits relative to the verdict. Long and short are read differently on purpose: a Short
 *  Candidate is a contradiction to own and an endorsement to be short of. */
export function stanceOf(decision: string | null, quantity: number | null): ThesisStance {
  if (!decision) return 'none'
  const d = decision.trim().toUpperCase()
  if (d.startsWith('INSUFFICIENT DATA')) return 'unrated'
  if (d.startsWith('PAIR TRADE') || d.includes('HEDGE REQUIRED')) return 'hedge'
  if (d === 'WATCHLIST') return 'watch'
  // A flat or unknown quantity cannot contradict anything — report the verdict, take no position on it.
  const isShort = quantity !== null && quantity < 0
  if (SUPPORTS_LONG.has(d)) return isShort ? 'against' : 'supported'
  if (AGAINST_LONG.has(d)) return isShort ? 'supported' : 'against'
  return 'none'
}

function daysBetween(from: string | null, todayISO: string): number | null {
  if (!from || !/^\d{4}-\d{2}-\d{2}$/.test(from)) return null
  const a = Date.parse(`${from}T00:00:00Z`)
  const b = Date.parse(`${todayISO}T00:00:00Z`)
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null
  return Math.round((b - a) / 86_400_000)
}

export interface HeldForThesis {
  symbol: string | null
  currency: string | null
  quantity: number | null
  percentOfNAV: number | null
  isDerivative: boolean
}

/** Join the held positions to the engine's standing decision for each. `today` is passed in rather than
 *  read from the clock so the age is testable. */
export function thesisRead(
  held: HeldForThesis[],
  links: Map<string, string>,
  today: string,
  analysesDir: string = ANALYSES_DIR,
): PortfolioThesisRead {
  const covered = coveredTickers(analysesDir)
  const coveredSet = new Set(covered)
  const rows: ThesisRow[] = []

  for (const p of held) {
    const symbol = (p.symbol ?? '').trim().toUpperCase()
    if (!symbol) continue
    // An explicit link wins over an identical ticker: the operator has said which company this is, and
    // a coincidence of symbols must not override them.
    const linked = links.get(symbol)
    const ticker = linked && coveredSet.has(linked) ? linked : coveredSet.has(symbol) ? symbol : null
    const matchedBy: ThesisMatch | null = ticker === null ? null : linked === ticker ? 'linked' : 'exact'
    const runs = ticker ? summarizeRuns(ticker, analysesDir) : { latestRun: null, runCount: 0, hasNewerPartial: false }
    const latest = runs.latestRun
    rows.push({
      symbol,
      currency: p.currency,
      weightPct: p.isDerivative ? null : p.percentOfNAV,
      quantity: p.quantity,
      ticker,
      matchedBy,
      decision: latest?.decision ?? null,
      confidence: latest?.confidence ?? null,
      decisionDate: latest?.decisionDate ?? null,
      ageDays: daysBetween(latest?.decisionDate ?? null, today),
      runRoot: latest?.runRoot ?? null,
      runCount: runs.runCount,
      hasNewerPartial: runs.hasNewerPartial,
      stance: stanceOf(latest?.decision ?? null, p.quantity),
      suggestions: ticker === null ? suggestTickers(symbol, covered) : [],
    })
  }

  // Coverage BY WEIGHT, not by count. Four researched 1% positions and one unresearched 60% position is
  // 80% covered by count and 40% by weight, and only the second number describes the risk.
  let weighted = 0
  let total = 0
  for (const r of rows) {
    if (r.weightPct === null) continue // a derivative carries exposure, not a share of NAV
    total += r.weightPct
    if (r.decision !== null) weighted += r.weightPct
  }

  return {
    rows: rows.sort((a, b) => (b.weightPct ?? -1) - (a.weightPct ?? -1)),
    covered,
    coveredWeightPct: total > 0 ? (weighted / total) * 100 : null,
    againstCount: rows.filter((r) => r.stance === 'against').length,
    uncoveredCount: rows.filter((r) => r.decision === null).length,
  }
}
