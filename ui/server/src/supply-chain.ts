// The chain lane of the Ideas board — research leads read out of the supply-chain graph.
//
// A Capital IQ Suppliers / Customers export names, with a source filing per row, exactly who sells into
// a company and who buys from it. `relationship_graph.py` turns that into a graph in every run's
// committed `relationships.json` artifacts (with `_pool_extracts/relationships.json` as a legacy fallback).
// This module reads those graphs across every standing research run
// and projects the outside counterparties as a third, honestly-labelled lane beside news leads and
// qualified ideas.
//
// WHAT THIS LANE IS, EXACTLY. It is a lead generator with a real evidence chain, not an idea:
//   - it never invents a ticker; a counterparty is investable only if the export named its listing;
//   - it never emits a direction for the counterparty. The export proves a relationship exists; it says
//     nothing about how big that relationship is, so "long the supplier because we like the customer" is
//     a claim the evidence cannot carry (CLAUDE.md §3, §7). What it emits instead is the anchor's own
//     standing verdict, which WAY the link transmits (same direction / inverse / not at all), and the
//     exact evidence still missing before the link could become a position;
//   - it never dresses a financing relationship as an operating one, and never lets a wholly-owned sales
//     subsidiary appear as a second-order name.
//
// It costs nothing to run: no provider call, no writes, no ledger. Like `buildQualifiedIdeasBoard`, it is
// recomputed from artifacts on every board GET, so a fresh export or a new run shows up immediately and a
// deleted one disappears rather than lingering in a generated cache.

import fs from 'node:fs'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { isSupersededRun } from './ledger-corrections'
import { normName } from './news/text-match'

export const SUPPLY_CHAIN_BOARD_SCHEMA = 'supply-chain-board/v1'
export const SUPPLY_CHAIN_SCORE_BASIS = 'chain_evidence_v1' as const
export const RELATIONSHIP_GRAPH_SCHEMA = 'relationship-graph/v1'

/** No standing verdict on the anchor means we do not know which way its own thesis points, so the chain
 *  behind it cannot rank alongside one where we do. */
const NO_ANCHOR_VERDICT_CAP = 60
/** A counterparty the engine has already gathered filings on is cheaper to act on — a small, stated nudge. */
const PRIOR_COVERAGE_BONUS = 6
/** Beyond this the lane stops walking outward: evidence quality falls faster than the list grows. */
const MAX_ORDER = 3
/** Mirrors `_SCORE_ORDER` in relationship_graph.py — the "directness" points a link earns for how many
 *  hops it took to reach the counterparty. A third-order lead's `cp.link_strength` was computed inside
 *  the MIDDLE company's own graph, where that counterparty is a direct (order-2) link; `buildLead` has to
 *  re-derive directness for the order it is actually reporting here, or a two-hop lead keeps the
 *  directness points of a direct one and can outrank a genuinely direct counterparty. */
const SCORE_ORDER: Record<number, number> = { 2: 24, 3: 10 }
const SCORE_ORDER_DEFAULT = 6

export type SupplyChainReadiness =
  | 'research_now' // listed, operating link, and the anchor has a standing verdict
  | 'needs_anchor' // listed and operating, but the anchor has not been decided yet
  | 'not_directional' // a financing or other link — it does not move with the anchor's volumes
  | 'not_investable' // the export named no listing for it
  | 'related_party' // shares the anchor group's name; may not be an outside party at all

export type SupplyChainTransmission = 'same_direction' | 'inverse' | 'none'

export interface SupplyChainPathStep {
  name: string
  listing: string | null
  role: string | null // how this step relates to the PREVIOUS one; null on the anchor itself
}

export interface SupplyChainLead {
  lead_id: string
  anchor_ticker: string
  anchor_name: string | null
  anchor_listing: string | null
  anchor_run_root: string
  anchor_decision: string | null
  anchor_decision_date: string | null
  name: string
  listing: string | null
  exchange: string | null
  symbol: string | null
  country: string | null
  industry: string | null
  description: string | null
  order: number
  path: SupplyChainPathStep[]
  role: string
  role_kind: 'operating' | 'financing' | 'other'
  transmission: SupplyChainTransmission
  mechanism: string
  disclosed_by: 'counterparty' | 'anchor_group' | null
  source_ref: string | null
  source_file: string | null
  link_strength: number
  link_strength_components: Record<string, number>
  lead_score: number
  lead_score_basis: typeof SUPPLY_CHAIN_SCORE_BASIS
  lead_score_cap: number | null
  lead_score_cap_reason: string | null
  readiness: SupplyChainReadiness
  evidence_gaps: string[]
  prior_coverage: SupplyChainCoverage | null
}

export interface SupplyChainCoverage {
  subject: string // the engine's own folder name for it
  has_run: boolean
  latest_run: string | null
  latest_decision: string | null
  data_pool_present: boolean
}

export interface SupplyChainAnchorMap {
  ticker: string
  name: string | null
  listing: string | null
  run_root: string
  decision: string | null
  decision_date: string | null
  sheets: number
  scope_notes: string[]
  relationship_rows: number
  intragroup_rows: number
  intragroup_row_share_pct: number | null
  third_party_entities: number
  listed_third_parties: number
  listed_suppliers: number
  listed_customers: number
  exchanges: string[]
  industry_clusters: Array<{
    industry: string
    counterparty_count: number
    third_party_count: number
    listed_count: number
    counterparties: string[]
  }>
  warnings: string[]
}

export interface SupplyChainBoard {
  schema_version: typeof SUPPLY_CHAIN_BOARD_SCHEMA
  generated_at: string
  score_basis: typeof SUPPLY_CHAIN_SCORE_BASIS
  health: {
    status: 'healthy' | 'pre_data' | 'degraded'
    outcome: 'no_exports' | 'leads' | 'none_investable' | 'storage_error' | 'invalid_artifacts'
    reason: string
    run_count: number // standing runs inspected
    graph_count: number // runs that carried a relationship graph
    invalid_count: number // graphs that could not be read
    input_warning_count: number // relationship inputs found but not parsed
    pool_export_count: number // supplier/customer files currently present in standing data pools
    sheet_count: number
    anchors_without_export: string[]
    lead_count: number
    research_now_count: number
    third_order_count: number
  }
  anchors: SupplyChainAnchorMap[]
  leads: SupplyChainLead[]
}

// ---- artifact shapes (validated leniently at the edge, then trusted) -------------------------------
// Only the fields this lane reads are required. An artifact that fails the shape check is COUNTED as
// invalid and skipped, never partially believed — a half-read graph would produce leads whose evidence
// chain cannot be reconstructed.

interface GraphCounterparty {
  node_id: string
  name: string
  affiliation: 'third_party' | 'likely_group'
  listing: string | null
  exchange: string | null
  symbol: string | null
  country: string | null
  industry: string | null
  description: string | null
  order: number
  role: string
  role_kind: 'operating' | 'financing' | 'other'
  anchor_side_entity: string
  disclosed_by: 'counterparty' | 'anchor_group' | null
  source_ref: string | null
  source_file: string | null
  mechanism: string
  link_strength: number
  link_strength_components: Record<string, number>
  link_strength_cap: number | null
  link_strength_cap_reason: string | null
  evidence_gaps: string[]
}

interface RelationshipGraph {
  schema_version: string
  ticker: string
  anchor: { name: string | null; listing: string | null; node_id: string | null }
  sources: Array<{ sheet: string; orientation: string; rows: number; scope_notes: string[] }>
  scope_notes: string[]
  counterparties: GraphCounterparty[]
  industry_clusters: SupplyChainAnchorMap['industry_clusters']
  concentration: Record<string, unknown>
  warnings: string[]
}

const ROLE_KINDS = new Set(['operating', 'financing', 'other'])
const AFFILIATIONS = new Set(['third_party', 'likely_group'])

function str(v: unknown): string | null { return typeof v === 'string' && v.trim() ? v.trim() : null }
function num(v: unknown, fallback = 0): number { return Number.isFinite(Number(v)) ? Number(v) : fallback }
function strArray(v: unknown): string[] { return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [] }

function isCounterparty(v: any): v is GraphCounterparty {
  return !!v && typeof v.node_id === 'string' && v.node_id
    && typeof v.name === 'string' && v.name
    && AFFILIATIONS.has(v.affiliation)
    && ROLE_KINDS.has(v.role_kind)
    && typeof v.role === 'string' && v.role
    && typeof v.mechanism === 'string' && v.mechanism
    && Number.isFinite(Number(v.link_strength))
    && typeof v.anchor_side_entity === 'string'
}

function parseGraph(text: string): RelationshipGraph | null {
  let doc: any
  try { doc = JSON.parse(text) } catch { return null }
  if (!doc || typeof doc !== 'object' || Array.isArray(doc)) return null
  if (doc.schema_version !== RELATIONSHIP_GRAPH_SCHEMA) return null
  if (!doc.anchor || typeof doc.anchor !== 'object' || Array.isArray(doc.anchor)) return null
  if (!Array.isArray(doc.counterparties) || !Array.isArray(doc.sources)) return null
  return {
    schema_version: doc.schema_version,
    ticker: String(doc.ticker || ''),
    anchor: {
      name: str(doc.anchor.name), listing: str(doc.anchor.listing), node_id: str(doc.anchor.node_id),
    },
    sources: doc.sources.filter((s: any) => s && typeof s === 'object').map((s: any) => ({
      sheet: String(s.sheet || ''), orientation: String(s.orientation || ''),
      rows: num(s.rows), scope_notes: strArray(s.scope_notes),
    })),
    scope_notes: strArray(doc.scope_notes),
    counterparties: doc.counterparties.filter(isCounterparty),
    industry_clusters: Array.isArray(doc.industry_clusters)
      ? doc.industry_clusters.filter((c: any) => c && typeof c.industry === 'string').map((c: any) => ({
        industry: c.industry,
        counterparty_count: num(c.counterparty_count),
        third_party_count: num(c.third_party_count),
        listed_count: num(c.listed_count),
        counterparties: strArray(c.counterparties),
      }))
      : [],
    concentration: doc.concentration && typeof doc.concentration === 'object' ? doc.concentration : {},
    warnings: strArray(doc.warnings),
  }
}

// ---- discovery ------------------------------------------------------------------------------------

interface DiscoveredGraph {
  ticker: string
  runRoot: string
  graph: RelationshipGraph
  decision: string | null
  decisionDate: string | null
}

function readDecision(runAbs: string): { decision: string | null; date: string | null } {
  try {
    const o = JSON.parse(fs.readFileSync(path.join(runAbs, 'decision_record.json'), 'utf8'))
    if (!o || typeof o !== 'object' || Array.isArray(o)) return { decision: null, date: null }
    const d = o.decision ?? o.verdict ?? o.rating ?? o.recommendation
    return {
      decision: typeof d === 'string' && d.trim() ? d.trim().slice(0, 60) : null,
      date: typeof o.decision_date === 'string' ? o.decision_date : null,
    }
  } catch { return { decision: null, date: null } }
}

/**
 * The STANDING graph per ticker: the newest dated run that carries a readable relationship graph,
 * preferring one that also decided. A newer partial re-run must not shadow the dossier that actually has
 * a verdict behind it — the same standing-run rule the rest of the display layer follows.
 */
function discover(repoRoot: string): {
  graphs: DiscoveredGraph[]
  runCount: number
  invalidCount: number
  inputWarningCount: number
  poolExportCount: number
  anchorsWithoutExport: string[]
  error: string | null
} {
  const analyses = path.resolve(repoRoot, 'analyses')
  let runNames: string[]
  try {
    runNames = fs.readdirSync(analyses).filter((x) => /_\d{4}-\d{2}-\d{2}$/.test(x)).sort()
  } catch (e: any) {
    if (e?.code === 'ENOENT') return { graphs: [], runCount: 0, invalidCount: 0, inputWarningCount: 0, poolExportCount: 0, anchorsWithoutExport: [], error: null }
    return {
      graphs: [], runCount: 0, invalidCount: 0, inputWarningCount: 0, poolExportCount: 0, anchorsWithoutExport: [],
      error: `The analyses store cannot be read: ${String(e?.message || e).slice(0, 240)}`,
    }
  }

  // best[ticker] = the winning run so far. A decided run always beats an undecided one; among equals the
  // later dated folder wins (runNames is sorted ascending, so a later pass overwrites).
  const best = new Map<string, DiscoveredGraph>()
  const unresolvedWarnings = new Map<string, number>()
  const seenTickers = new Set<string>()
  let invalidCount = 0
  let runCount = 0

  for (const runName of runNames) {
    const runAbs = path.resolve(analyses, runName)
    if (!runAbs.startsWith(analyses + path.sep)) continue
    const runRoot = path.posix.join('analyses', runName)
    if (isSupersededRun(runRoot)) continue
    const ticker = runName.slice(0, -11).toUpperCase()
    if (!/^[-A-Z0-9.]{1,24}$/.test(ticker)) continue
    seenTickers.add(ticker)
    runCount++

    // New runs commit the graph at their root. Keep the ignored cache as a read-only compatibility
    // fallback for older runs produced before the persistence boundary was fixed.
    const durable = path.join(runAbs, 'relationships.json')
    const legacyCache = path.join(runAbs, '_pool_extracts', 'relationships.json')
    const file = fs.existsSync(durable) ? durable : legacyCache
    let text: string
    try { text = fs.readFileSync(file, 'utf8') } catch { continue }
    const graph = parseGraph(text)
    if (!graph) { invalidCount++; continue }
    // An empty graph is a real, informative answer ("this pool has no supplier/customer export") but it
    // must not win the standing slot away from an older run that DOES carry one.
    if (!graph.sources.length) {
      unresolvedWarnings.set(ticker, graph.warnings.length)
      continue
    }

    const { decision, date } = readDecision(runAbs)
    const candidate: DiscoveredGraph = { ticker, runRoot, graph, decision, decisionDate: date }
    const prior = best.get(ticker)
    if (!prior || (!prior.decision && decision) || (Boolean(prior.decision) === Boolean(decision))) {
      best.set(ticker, candidate)
    }
  }

  const anchorsWithoutExport = [...seenTickers].filter((t) => !best.has(t)).sort()
  // Health follows the same standing graph the board shows. Old parse warnings must not permanently
  // degrade a ticker after a later usable export succeeds; a ticker with no usable graph still carries
  // the newest empty graph's warnings so an unreadable export is never mistaken for a missing upload.
  const inputWarningCount = [...best.values()].reduce((n, item) => n + item.graph.warnings.length, 0)
    + anchorsWithoutExport.reduce((n, ticker) => n + (unresolvedWarnings.get(ticker) || 0), 0)
  const poolExportCount = countPoolRelationshipExports(repoRoot, seenTickers)
  return {
    graphs: [...best.values()].sort((a, b) => a.ticker.localeCompare(b.ticker)),
    runCount, invalidCount, inputWarningCount, poolExportCount, anchorsWithoutExport, error: null,
  }
}

function countPoolRelationshipExports(repoRoot: string, tickers: ReadonlySet<string>): number {
  const dataRoot = path.resolve(repoRoot, 'data')
  let poolDirs: fs.Dirent[]
  try { poolDirs = fs.readdirSync(dataRoot, { withFileTypes: true }) } catch { return 0 }
  let count = 0
  for (const entry of poolDirs) {
    if (!entry.isDirectory() || entry.name.startsWith('.')) continue
    const normalized = entry.name.toUpperCase()
    const ticker = [...tickers].find((candidate) => normalized === candidate || normalized.startsWith(`${candidate} (`))
    if (!ticker) continue
    const stack = [path.join(dataRoot, entry.name)]
    while (stack.length) {
      const dir = stack.pop()!
      let children: fs.Dirent[]
      try { children = fs.readdirSync(dir, { withFileTypes: true }) } catch { continue }
      for (const child of children) {
        if (child.name.startsWith('.')) continue
        const abs = path.join(dir, child.name)
        if (child.isDirectory()) {
          if (!child.name.endsWith('_pool_extracts')) stack.push(abs)
        } else if (child.isFile() && /(?:supplier|customer|relationship)/i.test(child.name)
          && /\.(?:xls|xlsx|xlsm|rtf)$/i.test(child.name)) {
          count++
        }
      }
    }
  }
  return count
}

// ---- prior coverage -------------------------------------------------------------------------------

/**
 * Has the engine already looked at this counterparty? Two cheap filesystem checks against the pool and
 * the analyses tree, matched conservatively: an exact symbol folder, or a folder whose name normalises to
 * the counterparty's. A near-miss resolves to null — claiming coverage of the wrong company is worse than
 * admitting we have not looked.
 */
function coverageIndex(repoRoot: string): Map<string, string> {
  const index = new Map<string, string>()
  const add = (key: string, subject: string) => { if (key && !index.has(key)) index.set(key, subject) }
  let pools: string[] = []
  try { pools = fs.readdirSync(path.resolve(repoRoot, 'data')) } catch { /* no pool */ }
  for (const name of pools) {
    if (name.startsWith('.')) continue
    add(name.toUpperCase(), name)
    add(normName(name), name)
  }
  let runs: string[] = []
  try { runs = fs.readdirSync(path.resolve(repoRoot, 'analyses')) } catch { /* none */ }
  for (const runName of runs) {
    if (!/_\d{4}-\d{2}-\d{2}$/.test(runName)) continue
    const ticker = runName.slice(0, -11)
    add(ticker.toUpperCase(), ticker)
    add(normName(ticker), ticker)
  }
  return index
}

function coverageFor(repoRoot: string, index: Map<string, string>, symbol: string | null, name: string): SupplyChainCoverage | null {
  const subject = (symbol && index.get(symbol.toUpperCase())) || index.get(normName(name)) || null
  if (!subject) return null
  const out: SupplyChainCoverage = {
    subject, has_run: false, latest_run: null, latest_decision: null, data_pool_present: false,
  }
  try {
    const pool = path.resolve(repoRoot, 'data', subject)
    out.data_pool_present = fs.existsSync(pool) && fs.statSync(pool).isDirectory()
  } catch { /* absent */ }
  try {
    const runs = fs.readdirSync(path.resolve(repoRoot, 'analyses'))
      .filter((f) => f.startsWith(`${subject}_`) && /_\d{4}-\d{2}-\d{2}$/.test(f)
        && !isSupersededRun(path.posix.join('analyses', f)))
      .sort().reverse()
    if (runs.length) {
      out.has_run = true
      out.latest_run = path.posix.join('analyses', runs[0])
      out.latest_decision = readDecision(path.resolve(repoRoot, 'analyses', runs[0])).decision
    }
  } catch { /* no analyses */ }
  return out
}

// ---- lead construction ----------------------------------------------------------------------------

function leadId(anchorTicker: string, nodeId: string): string {
  return 'SCL-' + createHash('sha256').update(`${anchorTicker}|${nodeId}`).digest('hex').slice(0, 12)
}

/**
 * Which way the link carries the anchor's fortunes. A supplier, a customer, and a distributor all sit on
 * the same side of the anchor's volumes — more units built and sold is more business for each of them —
 * so the honest label is `same_direction`, NOT a buy or a sell on the counterparty. Whether that is worth
 * anything depends on how big the relationship is, which the export does not say.
 */
function transmissionFor(roleKind: GraphCounterparty['role_kind']): SupplyChainTransmission {
  return roleKind === 'operating' ? 'same_direction' : 'none'
}

function readinessFor(cp: GraphCounterparty, anchorDecision: string | null): SupplyChainReadiness {
  if (cp.affiliation === 'likely_group') return 'related_party'
  if (!cp.listing) return 'not_investable'
  if (cp.role_kind !== 'operating') return 'not_directional'
  if (!anchorDecision) return 'needs_anchor'
  return 'research_now'
}

/** The anchor context a lead is stated against — always the company whose board row this is, even when
 *  the counterparty was reached through another analysed company's export. */
interface AnchorContext {
  ticker: string
  name: string | null
  listing: string | null
  runRoot: string
  decision: string | null
  decisionDate: string | null
}

function anchorContextOf(src: DiscoveredGraph): AnchorContext {
  return {
    ticker: src.ticker,
    name: src.graph.anchor.name,
    listing: src.graph.anchor.listing,
    runRoot: src.runRoot,
    decision: src.decision,
    decisionDate: src.decisionDate,
  }
}

function buildLead(
  src: AnchorContext,
  cp: GraphCounterparty,
  order: number,
  pathSteps: SupplyChainPathStep[],
  coverage: SupplyChainCoverage | null,
  extraGaps: string[] = [],
): SupplyChainLead {
  const readiness = readinessFor(cp, src.decision)
  const bonus = coverage && (coverage.has_run || coverage.data_pool_present) ? PRIOR_COVERAGE_BONUS : 0
  // `cp.link_strength` (and its `directness` component) were computed against `cp.order` — the number of
  // hops inside the graph that actually produced this counterparty row. A third-order lead reuses a
  // counterparty pulled from the MIDDLE company's own graph, where it is a direct (order-2) link; if the
  // order this lead is being reported at (`order`) is deeper than that, the extra hop has to cost
  // directness points here, or a two-hop lead keeps the score of a direct one. Recompute the component
  // and re-sum, mirroring `_SCORE_ORDER` / the `raw = min(100, sum(components.values()))` step in
  // relationship_graph.py, rather than passing `cp.link_strength` straight through.
  let strength = cp.link_strength
  let components = cp.link_strength_components
  const cpOrder = num(cp.order, 2)
  if (order > cpOrder) {
    const oldDirectness = cp.link_strength_components.directness ?? (SCORE_ORDER[cpOrder] ?? SCORE_ORDER_DEFAULT)
    const newDirectness = SCORE_ORDER[order] ?? SCORE_ORDER_DEFAULT
    if (newDirectness < oldDirectness) {
      components = { ...cp.link_strength_components, directness: newDirectness }
      const recomputed = Object.values(components).reduce((sum, v) => sum + v, 0)
      strength = Math.min(100, recomputed)
    }
  }
  // One cap, one reason. `link_strength` already carries the graph's own caps (unlisted / financing /
  // possibly-related); the only thing this layer knows that the graph did not is whether the anchor has
  // actually been decided.
  const cap = readiness === 'needs_anchor' ? NO_ANCHOR_VERDICT_CAP : cp.link_strength_cap
  const capReason = readiness === 'needs_anchor'
    ? `${src.ticker} has no standing research verdict yet, so which way this link points is unknown`
    : cp.link_strength_cap_reason
  const score = Math.max(0, Math.min(cap ?? 100, Math.round(strength) + bonus))
  const gaps = [...cp.evidence_gaps, ...extraGaps]
  if (readiness === 'needs_anchor') {
    gaps.push(`no standing research verdict on ${src.name || src.ticker} — the chain has no direction until the anchor has one`)
  }
  return {
    lead_id: leadId(src.ticker, cp.node_id),
    anchor_ticker: src.ticker,
    anchor_name: src.name,
    anchor_listing: src.listing,
    anchor_run_root: src.runRoot,
    anchor_decision: src.decision,
    anchor_decision_date: src.decisionDate,
    name: cp.name,
    listing: cp.listing,
    exchange: cp.exchange,
    symbol: cp.symbol,
    country: cp.country,
    industry: cp.industry,
    description: cp.description,
    order,
    path: pathSteps,
    role: cp.role,
    role_kind: cp.role_kind,
    transmission: transmissionFor(cp.role_kind),
    mechanism: cp.mechanism,
    disclosed_by: cp.disclosed_by,
    source_ref: cp.source_ref,
    source_file: cp.source_file,
    link_strength: Math.round(strength),
    link_strength_components: components || {},
    lead_score: score,
    lead_score_basis: SUPPLY_CHAIN_SCORE_BASIS,
    lead_score_cap: cap ?? null,
    lead_score_cap_reason: capReason ?? null,
    readiness,
    evidence_gaps: gaps,
    prior_coverage: coverage,
  }
}

/** Identity keys a counterparty can be matched to another pool's anchor by: its listing, then its name. */
function matchKeys(listing: string | null, name: string): string[] {
  const keys: string[] = []
  if (listing) keys.push(`listing:${listing.toUpperCase()}`)
  const n = normName(name)
  if (n) keys.push(`name:${n}`)
  return keys
}

// ---- board ----------------------------------------------------------------------------------------

export function buildSupplyChainBoard(repoRoot: string, opts: { nowMs?: number } = {}): SupplyChainBoard {
  const nowMs = opts.nowMs ?? Date.now()
  const found = discover(repoRoot)
  const index = coverageIndex(repoRoot)
  const covCache = new Map<string, SupplyChainCoverage | null>()
  const coverage = (symbol: string | null, name: string): SupplyChainCoverage | null => {
    const key = `${symbol || ''}|${name}`
    if (!covCache.has(key)) covCache.set(key, coverageFor(repoRoot, index, symbol, name))
    return covCache.get(key) ?? null
  }

  // An index of every anchor we hold a graph for, so a counterparty that is itself an analysed company
  // can be walked THROUGH to reach its own counterparties. This is where a genuine third-order chain
  // comes from: it exists only when the middle company's own relationship export is in the pool, and
  // never as an assumption about who a supplier's suppliers might be.
  const anchorByKey = new Map<string, DiscoveredGraph>()
  for (const g of found.graphs) {
    for (const key of matchKeys(g.graph.anchor.listing, g.graph.anchor.name || g.ticker)) {
      if (!anchorByKey.has(key)) anchorByKey.set(key, g)
    }
    if (!anchorByKey.has(`ticker:${g.ticker}`)) anchorByKey.set(`ticker:${g.ticker}`, g)
  }

  const leads: SupplyChainLead[] = []
  const seen = new Set<string>()
  const anchors: SupplyChainAnchorMap[] = []

  for (const src of found.graphs) {
    const anchorStep: SupplyChainPathStep = {
      name: src.graph.anchor.name || src.ticker, listing: src.graph.anchor.listing, role: null,
    }
    const c = src.graph.concentration as Record<string, any>
    anchors.push({
      ticker: src.ticker,
      name: src.graph.anchor.name,
      listing: src.graph.anchor.listing,
      run_root: src.runRoot,
      decision: src.decision,
      decision_date: src.decisionDate,
      sheets: src.graph.sources.length,
      scope_notes: src.graph.scope_notes,
      relationship_rows: num(c.relationship_rows),
      intragroup_rows: num(c.intragroup_rows),
      intragroup_row_share_pct: Number.isFinite(Number(c.intragroup_row_share_pct)) ? Number(c.intragroup_row_share_pct) : null,
      third_party_entities: num(c.third_party_entities),
      listed_third_parties: num(c.listed_third_parties),
      listed_suppliers: num(c.listed_suppliers),
      listed_customers: num(c.listed_customers),
      exchanges: strArray(c.exchanges),
      industry_clusters: src.graph.industry_clusters,
      warnings: src.graph.warnings,
    })

    // --- second order: the anchor's own disclosed counterparties -----------------------------------
    const ctx = anchorContextOf(src)
    for (const cp of src.graph.counterparties) {
      const key = `${src.ticker}|${cp.node_id}`
      if (seen.has(key)) continue
      seen.add(key)
      // The path reads outward from the anchor. The middle step is the group entity the relationship is
      // actually with, and it earns a place only when that is a subsidiary rather than the listed parent
      // — otherwise it would just repeat the anchor. Naming it matters: "supplier to GE Appliances" is a
      // different fact from "supplier to Haier Smart Home", and the export distinguishes them.
      const steps: SupplyChainPathStep[] = [anchorStep]
      if (cp.anchor_side_entity && normName(cp.anchor_side_entity) !== normName(anchorStep.name)) {
        steps.push({ name: cp.anchor_side_entity, listing: null, role: 'group entity' })
      }
      steps.push({ name: cp.name, listing: cp.listing, role: cp.role })
      leads.push(buildLead(ctx, cp, 2, steps, coverage(cp.symbol, cp.name)))
    }
  }

  // --- third order: a counterparty that is itself an analysed company, walked one hop further -------
  // Only through an OPERATING link on both hops, and only through a genuine outside party: a chain that
  // passes through a financing relationship or a possibly-related entity is not carrying the anchor's
  // economics, so extending it would manufacture a connection the evidence does not support.
  for (const src of found.graphs) {
    const anchorStep: SupplyChainPathStep = {
      name: src.graph.anchor.name || src.ticker, listing: src.graph.anchor.listing, role: null,
    }
    for (const middle of src.graph.counterparties) {
      if (middle.affiliation !== 'third_party' || middle.role_kind !== 'operating') continue
      const via = matchKeys(middle.listing, middle.name).map((k) => anchorByKey.get(k)).find(Boolean)
      if (!via || via.ticker === src.ticker) continue
      const middleStep: SupplyChainPathStep = { name: middle.name, listing: middle.listing, role: middle.role }
      for (const cp of via.graph.counterparties) {
        if (cp.affiliation !== 'third_party' || cp.role_kind !== 'operating') continue
        const key = `${src.ticker}|${cp.node_id}`
        if (seen.has(key)) continue // already a direct counterparty of this anchor — the shorter chain wins
        seen.add(key)
        const outer: SupplyChainPathStep = { name: cp.name, listing: cp.listing, role: cp.role }
        leads.push(buildLead(
          anchorContextOf(src), // the lead is stated against THIS anchor, not the company it was routed through
          cp,
          MAX_ORDER,
          [anchorStep, middleStep, outer],
          coverage(cp.symbol, cp.name),
          [`this is two steps out — it reaches ${src.graph.anchor.name || src.ticker} only through ${middle.name}, so anything ${middle.name} absorbs on the way never arrives`],
        ))
      }
    }
  }

  leads.sort((a, b) =>
    b.lead_score - a.lead_score
    || a.order - b.order
    || a.anchor_ticker.localeCompare(b.anchor_ticker)
    || a.name.localeCompare(b.name),
  )

  const researchNow = leads.filter((l) => l.readiness === 'research_now').length
  const thirdOrder = leads.filter((l) => l.order >= 3).length
  const sheetCount = found.graphs.reduce((n, g) => n + g.graph.sources.length, 0)

  let status: SupplyChainBoard['health']['status'] = 'pre_data'
  let outcome: SupplyChainBoard['health']['outcome'] = 'no_exports'
  let reason = 'No Capital IQ supplier or customer export has been read into a research run yet. Drop one into the company’s data pool and the chain appears on the next run.'
  if (found.error) {
    status = 'degraded'; outcome = 'storage_error'; reason = found.error
  } else if (!found.graphs.length && found.invalidCount > 0) {
    status = 'degraded'; outcome = 'invalid_artifacts'
    reason = `${found.invalidCount} relationship graph${found.invalidCount === 1 ? '' : 's'} could not be read; no chain can be projected from them.`
  } else if (!found.graphs.length && found.inputWarningCount > 0) {
    status = 'degraded'; outcome = 'invalid_artifacts'
    reason = `${found.inputWarningCount} supplier/customer input warning${found.inputWarningCount === 1 ? '' : 's'} prevented a relationship sheet from being parsed. The exports were found, but the chain is not readable yet.`
  } else if (!found.graphs.length && found.poolExportCount > 0) {
    status = 'degraded'; outcome = 'invalid_artifacts'
    reason = `${found.poolExportCount} Capital IQ supplier/customer export${found.poolExportCount === 1 ? ' is' : 's are'} present in the data pools, but no durable relationship graph was published by a research run. Run fresh research after the extractor dependencies are installed.`
  } else if (leads.length) {
    status = found.invalidCount > 0 || found.inputWarningCount > 0 ? 'degraded' : 'healthy'
    outcome = researchNow ? 'leads' : 'none_investable'
    reason = researchNow
      ? `${researchNow} outside counterpart${researchNow === 1 ? 'y is' : 'ies are'} listed, trade with the company on an operating basis, and sit behind a company the engine has already decided on.`
      : `${leads.length} disclosed counterpart${leads.length === 1 ? 'y' : 'ies'} mapped, but none is both listed and operating behind a decided company — nothing here clears the bar to research yet.`
  } else if (found.graphs.length) {
    status = found.invalidCount > 0 || found.inputWarningCount > 0 ? 'degraded' : 'healthy'; outcome = 'none_investable'
    reason = found.invalidCount > 0
      ? `The exports read so far name no outside counterparty, but ${found.invalidCount} relationship graph${found.invalidCount === 1 ? '' : 's'} could not be read — the chain is not proven complete.`
      : 'The supplier and customer exports read so far name no outside counterparty at all — every disclosed relationship is inside the company’s own group.'
  }

  return {
    schema_version: SUPPLY_CHAIN_BOARD_SCHEMA,
    generated_at: new Date(nowMs).toISOString(),
    score_basis: SUPPLY_CHAIN_SCORE_BASIS,
    health: {
      status, outcome, reason,
      run_count: found.runCount,
      graph_count: found.graphs.length,
      invalid_count: found.invalidCount,
      input_warning_count: found.inputWarningCount,
      pool_export_count: found.poolExportCount,
      sheet_count: sheetCount,
      anchors_without_export: found.anchorsWithoutExport,
      lead_count: leads.length,
      research_now_count: researchNow,
      third_order_count: thirdOrder,
    },
    anchors,
    leads,
  }
}
