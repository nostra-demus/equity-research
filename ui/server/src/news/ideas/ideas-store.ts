// Persistence + free (no-LLM) enrichment for the PM skim. The ledger is the source of truth the board
// projects; nothing here spends a token. Idea identity is a hash of ticker+direction so a re-surfacing of
// the same directional call UPDATES in place (and accumulates corroborating source events) instead of
// piling up duplicates — the shelf-life (`decay_at`) then ages a call off the board for free at build
// time, by pure date compare, with no paid pass.

import fs from 'node:fs'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { eventIdFor } from '../normalize'
import type { IdeaDirection, IdeaInputRow, PricedIn, RawIdea, ThesisType } from './surface-ideas'

// The persisted idea: the LLM's raw read plus the free-derived fields (resolved source ids, freshness,
// prior coverage) and the lifecycle stamps. A strict superset of the candidates.schema.json subset the
// paid gauntlet later fills, so a promoted run maps onto — never fights — this shape.
export interface SurfacedIdea {
  idea_id: string // IDEA-<sha256-12 of ticker|direction>
  ticker: string
  company: string | null
  exchange: string | null
  direction: IdeaDirection
  pair_with: string | null
  reason: string
  why_now: string
  conviction: number // 0-100 pre-edge PROXY
  conviction_basis: 'pre_edge_proxy' // hard label — never the locked edge score (§7)
  priced_in: PricedIn
  thesis_type: ThesisType
  source_event_ids: string[] // EVT-* — the join key back to the wire (canonical eventIdFor over the original headline)
  source_headlines: string[] // for the card, newest first (display — may be the English translation)
  source_headline: string | null // the primary source's ORIGINAL-language headline — the promote intake uses THIS so its SIG_ID byte-matches the wire launch
  source_url: string | null // the primary (highest-materiality) source's URL — so a promotion's SIG_ID byte-matches the wire event
  source_name: string | null // the primary source's publisher — Gate 0 checks it against the allowlist on promotion
  materiality_max: number // top triage_score among the source events (ranking blend input)
  newest_source_at: string // ISO — the freshest contributing event, drives freshness + decay
  prior_coverage: PriorCoverage | null
  surfaced_at: string // ISO — first time this idea appeared (preserved across updates)
  updated_at: string // ISO — this pass
  decay_at: string // ISO — surfaced/refreshed + shelf-life; board marks it stale past this
  status: 'live' | 'promoted'
  promoted_signal_id: string | null
}

export interface PriorCoverage {
  has_run: boolean // a finished analyses/<TICKER>_* run exists
  latest_run: string | null // repo-relative path of the newest run folder
  latest_decision: string | null // that run's decision, when readable
  data_pool_present: boolean // data/<TICKER>/ exists (real filings already gathered)
}

function ideasDir(repoRoot: string): string { return path.join(repoRoot, 'screener', 'ledger', 'ideas') }
function ideasLog(repoRoot: string): string { return path.join(repoRoot, 'screener', 'ledger', 'ideas.ndjson') }

/** Stable idea identity: same ticker + same direction = the same directional call, refreshed in place. */
export function ideaId(ticker: string, direction: IdeaDirection): string {
  return 'IDEA-' + createHash('sha256').update(`${ticker.toUpperCase()}|${direction}`).digest('hex').slice(0, 12)
}

/**
 * Read the freshest curated sweep (the top-N the auto-ingester writes every cycle) into skim input rows,
 * sorted by materiality, capped at `topN`. Drops nothing but consumed/dismissed rows and the low tail:
 * a surfacing candidate must have cleared the wire's own pick/watch bar (triage_score present). Never
 * throws — a missing sweep yields [].
 */
export function readTopSweepRows(repoRoot: string, topN: number): IdeaInputRow[] {
  const inboxDir = path.join(repoRoot, 'screener', 'inbox')
  let file: string | null = null
  try {
    const files = fs.readdirSync(inboxDir).filter((f) => f.endsWith('_sweep.json')).sort().reverse()
    file = files.length ? path.join(inboxDir, files[0]) : null
  } catch { return [] }
  if (!file) return []
  let doc: any
  try { doc = JSON.parse(fs.readFileSync(file, 'utf8')) } catch { return [] }
  const rows: any[] = Array.isArray(doc?.rows) ? doc.rows : []
  return rows
    .filter((r) => r && r.url && !r.consumed && !r.dismissed && typeof r.triage_score === 'number')
    .sort((a, b) => (b.triage_score ?? -1) - (a.triage_score ?? -1))
    .slice(0, Math.max(1, topN))
    .map((r): IdeaInputRow => ({
      // event_id isn't stored on the inbox row; re-derive it with the CANONICAL recipe (eventIdFor over the
      // ORIGINAL headline, lower-cased + whitespace-collapsed) so the idea's source ids match the
      // firehose/enrich/ledger join key exactly — a bespoke hash over the translation would never line up.
      event_id: eventIdFor(r.headline || '', r.url || ''),
      headline: r.headline_en || r.headline || '', // display + the model prompt (English when available)
      headline_orig: r.headline || '', // the original — anchors a promotion's SIG_ID to the wire launch
      url: r.url || '',
      source_name: r.source_name || '',
      region: r.region || '',
      materiality: Number(r.triage_score) || 0,
      label: r.event_materiality_label || '',
      event_types: Array.isArray(r.event_types) ? r.event_types : [],
      issuer_linkage: r.issuer_linkage || '',
      companies: Array.isArray(r.companies) ? r.companies : [],
      found_at: r.found_at || doc?.updated_at || '',
    }))
}

/** A change key over the top-N so the pass only re-spends when the input set actually shifts. */
export function topNHash(rows: IdeaInputRow[]): string {
  return createHash('sha256').update(rows.map((r) => r.event_id).sort().join(',')).digest('hex').slice(0, 16)
}

/** Read every persisted idea snapshot (for in-place merge + board projection). Never throws. */
export function readIdeaSnapshots(repoRoot: string): SurfacedIdea[] {
  const dir = ideasDir(repoRoot)
  let names: string[]
  try { names = fs.readdirSync(dir).filter((f) => f.endsWith('.json')) } catch { return [] }
  const out: SurfacedIdea[] = []
  for (const n of names) {
    try {
      const o = JSON.parse(fs.readFileSync(path.join(dir, n), 'utf8'))
      if (o && typeof o.idea_id === 'string') out.push(o as SurfacedIdea)
    } catch { /* skip a corrupt snapshot */ }
  }
  return out
}

/** Read one idea snapshot by id (for the promote endpoint). Returns null when absent/corrupt. */
export function readIdeaById(repoRoot: string, ideaId: string): SurfacedIdea | null {
  try {
    const o = JSON.parse(fs.readFileSync(path.join(ideasDir(repoRoot), `${ideaId}.json`), 'utf8'))
    return o && typeof o.idea_id === 'string' ? (o as SurfacedIdea) : null
  } catch { return null }
}

/** Write one idea snapshot (overwrite, atomic tmp+rename) AND append the append-only history log. */
export function writeIdea(repoRoot: string, idea: SurfacedIdea): void {
  const dir = ideasDir(repoRoot)
  fs.mkdirSync(dir, { recursive: true })
  const fp = path.join(dir, `${idea.idea_id}.json`)
  const tmp = `${fp}.tmp.${process.pid}`
  try {
    fs.writeFileSync(tmp, JSON.stringify(idea, null, 2) + '\n')
    fs.renameSync(tmp, fp)
  } finally {
    if (fs.existsSync(tmp)) fs.unlinkSync(tmp)
  }
  try { fs.appendFileSync(ideasLog(repoRoot), JSON.stringify({ ts: idea.updated_at, ...idea }) + '\n') } catch { /* a lost history line is not fatal */ }
}

/**
 * Delete snapshots whose decay is well past (older than `hardTtlMs` beyond decay_at) so the ledger can't
 * grow without bound. A still-fresh or recently-decayed idea is kept (the board shows decayed ones dimmed
 * for a while); a PROMOTED idea is always kept (it links to a real run). Returns how many were removed.
 */
export function pruneExpiredIdeas(repoRoot: string, nowMs: number, hardTtlMs: number): number {
  let removed = 0
  for (const idea of readIdeaSnapshots(repoRoot)) {
    if (idea.status === 'promoted') continue
    const decay = Date.parse(idea.decay_at)
    if (Number.isFinite(decay) && nowMs - decay > hardTtlMs) {
      try { fs.rmSync(path.join(ideasDir(repoRoot), `${idea.idea_id}.json`), { force: true }); removed++ } catch { /* best effort */ }
    }
  }
  return removed
}

/**
 * Free prior-coverage read (no LLM): has the engine already looked at this ticker? Two cheap filesystem
 * checks — a finished analyses/<TICKER>_* run (with its decision) and a data/<TICKER>/ pool. Lets the card
 * say "fresh — never rated" vs "already rated · <decision>", which kills half the "did we look at this?"
 * friction. Never throws.
 */
export function priorCoverage(repoRoot: string, ticker: string): PriorCoverage {
  const t = ticker.toUpperCase()
  const out: PriorCoverage = { has_run: false, latest_run: null, latest_decision: null, data_pool_present: false }
  try { out.data_pool_present = fs.existsSync(path.join(repoRoot, 'data', t)) && fs.statSync(path.join(repoRoot, 'data', t)).isDirectory() } catch { /* absent */ }
  try {
    const runs = fs.readdirSync(path.join(repoRoot, 'analyses'))
      .filter((f) => f === t || f.startsWith(`${t}_`))
      .sort()
      .reverse()
    if (runs.length) {
      out.has_run = true
      out.latest_run = path.posix.join('analyses', runs[0])
      const dr = readDecision(path.join(repoRoot, 'analyses', runs[0], 'decision_record.json'))
      out.latest_decision = dr
    }
  } catch { /* no analyses dir */ }
  return out
}

function readDecision(fp: string): string | null {
  try {
    const o = JSON.parse(fs.readFileSync(fp, 'utf8'))
    const d = o?.decision ?? o?.verdict ?? o?.rating ?? o?.recommendation
    return typeof d === 'string' ? d.slice(0, 60) : null
  } catch { return null }
}

// ---- pass state (change-detection + interval throttle) --------------------------------------------
export interface IdeaPassState { hash: string; ran_at_ms: number }

export function readPassState(stateDir: string): IdeaPassState | null {
  try {
    const o = JSON.parse(fs.readFileSync(path.join(stateDir, 'ideas-pass.json'), 'utf8'))
    if (o && typeof o.hash === 'string' && typeof o.ran_at_ms === 'number') return o as IdeaPassState
  } catch { /* fresh */ }
  return null
}

export function writePassState(stateDir: string, state: IdeaPassState): void {
  try {
    fs.mkdirSync(stateDir, { recursive: true })
    fs.writeFileSync(path.join(stateDir, 'ideas-pass.json'), JSON.stringify(state))
  } catch { /* a missed write only risks one redundant pass next tick */ }
}
