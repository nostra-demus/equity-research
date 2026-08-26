// Closed-book chat context for the Screener news wire.
//
// The model never receives the whole archive. This reader scans every saved daily firehose file,
// builds small facts about the chosen window, keeps the best matching stories, and adds older matches
// only when they help test whether something is really new. Every story keeps its event id and URL so
// the answer can cite it and the cockpit can open the exact item.

import fs from 'node:fs'
import path from 'node:path'
import { loadRetrievalConcepts } from '../retrieval/concepts'
import { buildHybridQuery, HybridCollector, matchHybridDocument, normalizeRetrievalText, retrievalTokens, type HybridDocument, type HybridMatch, type HybridQuery } from '../retrieval/hybrid'
import type { SemanticSearchResult } from '../retrieval/semantic'
import type { RerankResult } from '../retrieval/rerank'
import { cleanText } from './clean'
import { NewsRelationshipGraph, relationshipLine } from './relationship-graph'
import { deriveScope, deriveSourceTier } from './scope'
import type { SourcesReport } from './source-health'
import { createThemesIndexReader } from './themes/api-index'
import { scoreTradeCluster, type TradeScoreBreakdown } from './trade-score'
import type { FeedItem } from './types'
import { appendNewsChatFinalQuestion } from './chat-provider'
import { decisionMemoryBlock, type CallMemoryItem } from '../call-learning'
import { listFirehoseFilesInDir } from './firehose-files'

const canonicalThemeReaders = new Map<string, ReturnType<typeof createThemesIndexReader>>()
function readCanonicalThemes(repoRoot: string) {
  const key = path.resolve(repoRoot)
  let read = canonicalThemeReaders.get(key)
  if (!read) {
    read = createThemesIndexReader(repoRoot)
    canonicalThemeReaders.set(key, read)
  }
  return read()
}

export type NewsChatWindow = '24h' | '7d' | 'history'

export interface NewsChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface NewsChatEvidence {
  ref: string
  item: FeedItem
  historical: boolean
  whyMatched?: string[]
}

export interface NewsChatReceipt {
  window: NewsChatWindow
  label: string
  itemsSearched: number
  itemsMatched: number
  sourceCount: number
  evidenceCount: number
  historicalEvidenceCount: number
  coverageStart: string | null
  coverageEnd: string | null
  queryTerms: string[]
  queryTermHits: Record<string, number>
  retrievalTermHits: Record<string, number>
  expandedTerms: Record<string, string[]>
  retrievalMode: 'hybrid' | 'hybrid_neural'
  retrievalChannels: string[]
  semantic: { status: SemanticSearchResult['status']; model: string | null; indexedItems: number; hitsUsed: number; note?: string } | null
  rerank: { status: RerankResult['status']; model: string | null; note?: string } | null
  relationships: { seed: string; related: string; kind: string; relation: string; mentions: number; evidenceEventIds: string[] }[]
  tradeCandidates: NewsTradeCandidate[]
  dataStores: string[]
  coverageWarnings: string[]
  sourceHealth: SourcesReport['counts'] | null
}

export interface NewsTradeCandidate {
  ticker: string
  company: string
  score: number
  readiness: 'check_now' | 'needs_data' | 'watch_only'
  direction: 'long' | 'short' | 'mixed' | 'unknown'
  breakdown: TradeScoreBreakdown
  missingChecks: string[]
  evidenceRefs: string[]
}

export interface NewsChatContext {
  present: boolean
  context: string
  evidence: NewsChatEvidence[]
  receipt: NewsChatReceipt
  missingHint?: string
}

interface RankedItem {
  item: FeedItem
  score: number
  match?: HybridMatch
  extraReasons?: string[]
}

interface SavedEnrichment {
  event_id?: string
  summary?: string
  summary_en?: string | null
  gist?: string[]
  market_angle?: string
  companies?: { name?: string; ticker?: string | null; listing_status?: string | null; exchange?: string | null }[]
  beneficiaries?: { name?: string; named_in_article?: boolean; ticker?: string | null; listing?: string | null; listing_status?: string | null; exchange?: string | null; listing_verified?: boolean; mechanism?: string; basis?: string; order?: 'first' | 'second' | null }[]
  exposed?: { name?: string; named_in_article?: boolean; ticker?: string | null; listing?: string | null; listing_status?: string | null; exchange?: string | null; listing_verified?: boolean; mechanism?: string; basis?: string; order?: 'first' | 'second' | null }[]
  whats_priced?: string
  the_edge?: string
  watch_item?: string
  theme?: string
  news_impact?: {
    impact_magnitude?: 'low' | 'medium' | 'high' | 'critical'
    affected_metric?: string[]
    extracted_numbers?: string[]
    quick_dirty_calculation?: string
    why_it_matters?: string
    analyst_takeaway?: string
  }
}

const WINDOW_MS: Record<Exclude<NewsChatWindow, 'history'>, number> = {
  '24h': 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
}

// Common question words plus broad trading words. Removing these leaves the real subject: a company,
// commodity, policy, sector, product, or named event. An empty term list means "scan the whole window".
const STOP = new Set(
  [
    'a', 'about', 'after', 'again', 'all', 'also', 'am', 'an', 'and', 'any', 'are', 'as', 'at', 'be',
    'answer', 'because', 'been', 'before', 'beneficiaries', 'beneficiary', 'best', 'between', 'but', 'by', 'can', 'candidate', 'changed', 'chat',
    'companies', 'company', 'compared', 'could', 'create', 'data', 'day', 'days', 'did', 'do', 'does', 'evidence', 'exact', 'exactly', 'explain', 'fact', 'facts', 'find', 'for', 'from', 'getting', 'give', 'has',
    'have', 'history', 'hour', 'hours', 'how', 'i', 'idea', 'ideas', 'if', 'in', 'into', 'is', 'it',
    'harmed', 'inference', 'item', 'items', 'last', 'long', 'loser', 'losers', 'looks', 'may', 'me', 'most', 'my', 'new', 'news', 'next', 'no', 'not', 'of', 'on', 'one', 'only', 'or', 'order', 'our',
    'over', 'please', 'read', 'run', 'said', 'say', 'says', 'saved', 'screen', 'screening', 'second', 'second-order', 'sector', 'sectors', 'separate', 'seven', 'short', 'should', 'show', 'signal', 'simply', 'since', 'some', 'stronger', 'that', 'the', 'their',
    'tell', 'them', 'theme', 'themes', 'there', 'these', 'they', 'thing', 'this', 'those', 'to', 'today', 'trade', 'tradable', 'trading',
    'up', 'us', 'want', 'week', 'weeks', 'what', 'when', 'where', 'which', 'who', 'why', 'will', 'winner', 'winners', 'with',
    'use', 'using', 'would', 'you', 'your',
  ],
)

// These words describe the number or answer the user wants. They are not the subject. When a question
// also names a company, product, commodity, policy, or theme, at least one of those subject words must
// appear. This prevents "Amazon Bedrock growth rate" from returning every unrelated growth-rate story.
const METRIC_TERMS = new Set([
  'annual', 'capex', 'capital', 'change', 'changes', 'demand', 'earnings', 'ebitda', 'eps', 'expenditure', 'expenditures', 'expense', 'expenses', 'forecast', 'forecasts',
  'growth', 'guidance', 'margin', 'margins', 'outlook', 'price', 'prices', 'profit', 'profits', 'qoq',
  'quarter', 'quarterly', 'rate', 'rates', 'revenue', 'revenues', 'sales', 'share', 'shares', 'stock',
  'spend', 'spending', 'trend', 'trends', 'year', 'years', 'yoy',
])

// A capital letter at the start of a sentence does not make an instruction a proper name. Keep this
// narrower than STOP: these words are useful retrieval terms elsewhere, but must not become required
// company anchors merely because the user began with "Summarize ..." or "What's ...".
const LEADING_NON_SUBJECT_WORDS = new Set([
  'analyse', 'analyze', 'assess', 'describe', 'discuss', 'evaluate', 'overview', 'recap', 'review',
  'summarise', 'summarize', 'update',
])

function tokens(s: string): string[] {
  return retrievalTokens(s)
}

export function newsQueryTerms(question: string): string[] {
  return buildHybridQuery(question, { stopWords: STOP, metricTerms: METRIC_TERMS }).terms
}

function explicitNamedAnchors(question: string, terms: string[]): string[] {
  const allowed = new Set(terms)
  const out: string[] = []
  const rawWords = question.match(/[\p{L}\p{N}][\p{L}\p{N}.&'-]*/gu) || []
  for (const raw of rawWords) {
    if (!(raw === raw.toUpperCase() && /\p{L}/u.test(raw)) && !/^\p{Lu}/u.test(raw)) continue
    for (const token of retrievalTokens(raw)) {
      const contractionLead = token.includes("'") && STOP.has(token.split("'", 1)[0])
      // These are grammar/instruction words regardless of how much politeness or phrasing precedes them.
      // Excluding them only from the explicit-name gate keeps them usable for lexical ranking without ever
      // turning "Please quickly Summarize Nvidia" into a two-company query.
      if (LEADING_NON_SUBJECT_WORDS.has(token) || contractionLead) continue
      if (allowed.has(token) && !STOP.has(token) && !METRIC_TERMS.has(token) && !out.includes(token)) out.push(token)
    }
  }
  return out
}

/** Proper-name anchors with explicit casing; lowercase names are resolved from semantic index entities. */
export function newsSemanticNamedAnchors(question: string): string[] {
  const base = buildHybridQuery(question, { stopWords: STOP, metricTerms: METRIC_TERMS })
  return explicitNamedAnchors(question, base.terms)
}

function buildNewsQuery(question: string, concepts: ReturnType<typeof loadRetrievalConcepts>) {
  const base = buildHybridQuery(question, { stopWords: STOP, metricTerms: METRIC_TERMS, concepts })
  const named = explicitNamedAnchors(question, base.terms)
  const forcedAnchors = named.length ? named : base.anchors
  // Two explicit named parts (Amazon + Bedrock) must both be present. One named issuer (Nvidia, RBI)
  // remains the required anchor while descriptive words improve ranking instead of opening the gate.
  const minAnchorMatches = named.length > 1 ? Math.min(2, named.length)
    : named.length === 1 ? 1
      : forcedAnchors.length <= 2 ? forcedAnchors.length
        : 2
  return buildHybridQuery(question, { stopWords: STOP, metricTerms: METRIC_TERMS, concepts, forcedAnchors, minAnchorMatches })
}

function listDailyFiles(repoRoot: string, archiveDir: string): { date: string; index: number; file: string; store: string }[] {
  const byShard = new Map<string, { date: string; index: number; file: string; store: string }>()
  const add = (dir: string, prefer: boolean, store: string) => {
    if (!dir) return
    let files: ReturnType<typeof listFirehoseFilesInDir> = []
    try { files = listFirehoseFilesInDir(dir) } catch { return }
    for (const row of files) {
      const key = `${row.date}:${row.index}`
      if (prefer || !byShard.has(key)) byShard.set(key, { date: row.date, index: row.index, file: row.file, store })
    }
  }
  // The repo data pool is a valid saved archive even when the optional Drive path is not in the process
  // environment. A configured Drive mirror wins over it; the live local wire wins for the same day.
  add(path.join(repoRoot, 'data', 'NEWS-ARCHIVE'), false, 'saved archive')
  add(archiveDir, true, 'saved archive')
  add(path.join(repoRoot, 'screener', 'inbox'), true, 'live wire')
  return [...byShard.values()].sort((a, b) => b.date.localeCompare(a.date) || b.index - a.index)
}

let enrichmentCache: { file: string; mtimeMs: number; rows: Map<string, SavedEnrichment> } | null = null
function normalizeEnrichment(value: SavedEnrichment): SavedEnrichment {
  const impact = value.news_impact && typeof value.news_impact === 'object' ? value.news_impact : undefined
  const impactMagnitude = impact && ['low', 'medium', 'high', 'critical'].includes(String(impact.impact_magnitude))
    ? impact.impact_magnitude
    : undefined
  return {
    ...value,
    gist: Array.isArray(value.gist) ? value.gist.filter((x): x is string => typeof x === 'string') : [],
    companies: Array.isArray(value.companies) ? value.companies.filter((x) => x && typeof x === 'object') : [],
    beneficiaries: Array.isArray(value.beneficiaries) ? value.beneficiaries.filter((x) => x && typeof x === 'object') : [],
    exposed: Array.isArray(value.exposed) ? value.exposed.filter((x) => x && typeof x === 'object') : [],
    ...(impact ? { news_impact: {
      ...impact,
      impact_magnitude: impactMagnitude,
      affected_metric: Array.isArray(impact.affected_metric) ? impact.affected_metric.filter((x): x is string => typeof x === 'string') : [],
      extracted_numbers: Array.isArray(impact.extracted_numbers) ? impact.extracted_numbers.filter((x): x is string => typeof x === 'string') : [],
    } } : {}),
  }
}

function readEnrichmentCache(file: string): Map<string, SavedEnrichment> {
  const out = new Map<string, SavedEnrichment>()
  const candidates = [file, file.replace(/news-enrich-cache\.json$/, 'news-enrich-cache.bak.json')]
  for (const candidate of candidates) {
    if (!candidate) continue
    try {
      const stat = fs.statSync(candidate)
      if (enrichmentCache?.file === candidate && enrichmentCache.mtimeMs === stat.mtimeMs) return enrichmentCache.rows
      const raw = JSON.parse(fs.readFileSync(candidate, 'utf8'))
      if (!raw || Array.isArray(raw) || typeof raw !== 'object') continue
      for (const [key, value] of Object.entries(raw)) {
        if (value && typeof value === 'object') out.set(key, normalizeEnrichment(value as SavedEnrichment))
      }
      enrichmentCache = { file: candidate, mtimeMs: stat.mtimeMs, rows: out }
      return out
    } catch {
      // Try the last-known-good backup.
    }
  }
  return out
}

function hydrate(raw: any): FeedItem | null {
  if (!raw || raw.kind !== 'item' || !raw.event_id || !raw.headline || !raw.ts) return null
  const headline = cleanText(String(raw.headline)) || String(raw.headline)
  const item = { ...raw, headline } as FeedItem
  item.event_types = Array.isArray(raw.event_types) ? raw.event_types : []
  item.companies = Array.isArray(raw.companies) ? raw.companies : []
  item.scope ||= deriveScope(item)
  item.source_tier ||= deriveSourceTier(item)
  return item
}

// Firehose rows are streamed on demand. The old process-lifetime `dailyLineCache` retained every line of
// every day ever queried (hundreds of MB on a real archive) and populated it with readFileSync on the HTTP
// request path. Streaming keeps memory bounded to one 64 KiB chunk plus one capped line, and `for await`
// gives the event loop back to SSE/health requests between chunks.
const MAX_FIREHOSE_LINE_CHARS = 1_000_000
function abortError(): DOMException { return new DOMException('Aborted', 'AbortError') }
function throwIfAborted(signal?: AbortSignal): void { if (signal?.aborted) throw abortError() }

async function readItems(file: string, visit: (item: FeedItem) => void, opts: {
  prefilter?: (line: string) => boolean
  minTs?: number
  maxTsExclusive?: number
  signal?: AbortSignal
} = {}): Promise<number> {
  throwIfAborted(opts.signal)
  let searched = 0
  const consume = (line: string) => {
    if (!line.includes('"kind"') || !line.includes('"item"')) return
    if (opts.minTs !== undefined || opts.maxTsExclusive !== undefined) {
      const stamp = /"ts"\s*:\s*"([^"]+)"/.exec(line)?.[1]
      const at = stamp ? Date.parse(stamp) : NaN
      if (!Number.isFinite(at)) return
      if (opts.minTs !== undefined && at < opts.minTs) return
      if (opts.maxTsExclusive !== undefined && at >= opts.maxTsExclusive) return
    }
    searched++
    if (opts.prefilter && !opts.prefilter(line)) return
    try {
      const item = hydrate(JSON.parse(line))
      if (item) visit(item)
    } catch {
      // One broken line must never break the archive search.
    }
  }

  let stream: fs.ReadStream
  try { stream = fs.createReadStream(file, { encoding: 'utf8', highWaterMark: 64 * 1024 }) } catch { return 0 }
  const stop = () => stream.destroy(abortError())
  opts.signal?.addEventListener('abort', stop, { once: true })
  let pending = ''
  let discardingOversizeLine = false
  try {
    for await (const raw of stream) {
      throwIfAborted(opts.signal)
      const chunk = String(raw)
      let start = 0
      for (let nl = chunk.indexOf('\n'); nl >= 0; nl = chunk.indexOf('\n', start)) {
        throwIfAborted(opts.signal)
        const part = chunk.slice(start, nl)
        if (!discardingOversizeLine) {
          if (pending.length + part.length <= MAX_FIREHOSE_LINE_CHARS) consume(pending + part)
          // else: a corrupt/pathological row is dropped instead of becoming an unbounded buffer.
        }
        pending = ''
        discardingOversizeLine = false
        start = nl + 1
      }
      const tail = chunk.slice(start)
      if (!discardingOversizeLine) {
        if (pending.length + tail.length <= MAX_FIREHOSE_LINE_CHARS) pending += tail
        else { pending = ''; discardingOversizeLine = true }
      }
    }
    if (!discardingOversizeLine && pending) consume(pending)
  } catch (error) {
    if (opts.signal?.aborted) throw abortError()
    // A file can disappear while the archive mirror rotates. Treat that day as unavailable.
  } finally {
    opts.signal?.removeEventListener('abort', stop)
    stream.destroy()
  }
  return searched
}

function eventIdInLine(line: string): string | null {
  return /"event_id"\s*:\s*"([^"]+)"/.exec(line)?.[1] || null
}

function candidateEnrichmentIds(query: HybridQuery, rows: Map<string, SavedEnrichment>, max = 512): Set<string> {
  const ids = new Set<string>()
  for (const [id, row] of rows) {
    const match = matchHybridDocument(query, { id, value: id, fields: [{ name: 'saved_article', text: enrichmentText(row), fuzzy: true }] })
    if (match.qualifies) ids.add(id)
    if (ids.size >= max) break
  }
  return ids
}

function boundedLineDistance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    const next = [i]
    let rowMin = i
    for (let j = 1; j <= b.length; j++) {
      const n = Math.min(next[j - 1] + 1, prev[j] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
      next.push(n)
      if (n < rowMin) rowMin = n
    }
    if (rowMin > max) return max + 1
    prev = next
  }
  return prev[b.length]
}

function lineMayContainFuzzyAnchor(text: string, anchor: string): boolean {
  if (anchor.length < 5 || /[0-9]/.test(anchor)) return false
  const max = anchor.length >= 9 ? 2 : 1
  // Iterate tokens instead of materialising `retrievalTokens(line)`: a corrupt row is capped at 1 MB, but
  // typo rescue may scan a large archive and must retain only the current token, not an array per row.
  for (const match of text.matchAll(/[\p{L}\p{N}][\p{L}\p{N}.+&'-]*/gu)) {
    const compound = normalizeRetrievalText(match[0]).replace(/^[.'+-]+|[.'+-]+$/g, '')
    const tokens = compound.includes('-') || compound.includes("'")
      ? [compound, ...compound.split(/[-']/)]
      : [compound]
    for (const token of tokens) {
      if (token.length < 5 || token[0] !== anchor[0] || Math.abs(token.length - anchor.length) > max) continue
      if (boundedLineDistance(anchor, token, max) <= max) return true
    }
  }
  return false
}

function fastLineFilter(query: HybridQuery, extraIds: Set<string>): (line: string) => boolean {
  const plans = query.plans.filter((plan) => plan.anchor)
  const probes = plans.map((plan) => [plan.term, ...plan.variants.map((v) => v.text)].map(normalizeRetrievalText))
  return (line: string) => {
    const id = eventIdInLine(line)
    if (id && extraIds.has(id)) return true
    const text = line.toLowerCase()
    // Exact anchors remain the cheap common path. A query with one required named subject gets the same
    // tightly bounded typo rescue as the full hybrid matcher; otherwise a misspelling such as Nvdia would
    // be discarded before the matcher could see a Nvidia headline. Multi-anchor queries still need one
    // exact anchor at admission, and the full matcher enforces every configured anchor rule after parsing.
    if (probes.some((variants) => variants.some((probe) => probe && text.includes(probe)))) return true
    return plans.length === 1 && lineMayContainFuzzyAnchor(text, plans[0].term)
  }
}

function literalLineFilter(terms: string[]): (line: string) => boolean {
  const probes = [...new Set(terms.map((x) => normalizeRetrievalText(x)).filter((x) => x.length >= 2))].slice(0, 24)
  return (line: string) => {
    const text = line.toLowerCase()
    return probes.some((probe) => text.includes(probe))
  }
}

class TopItems {
  private rows: RankedItem[] = []
  constructor(private readonly max: number) {}

  private worse(a: RankedItem, b: RankedItem): boolean {
    return a.score < b.score
      || (a.score === b.score && String(a.item.ts).localeCompare(String(b.item.ts)) < 0)
      || (a.score === b.score && a.item.ts === b.item.ts && a.item.event_id.localeCompare(b.item.event_id) > 0)
  }

  private up(index: number): void {
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2)
      if (!this.worse(this.rows[index], this.rows[parent])) break
      ;[this.rows[index], this.rows[parent]] = [this.rows[parent], this.rows[index]]
      index = parent
    }
  }

  private down(index: number): void {
    for (;;) {
      const left = index * 2 + 1
      if (left >= this.rows.length) return
      const right = left + 1
      let worst = left
      if (right < this.rows.length && this.worse(this.rows[right], this.rows[left])) worst = right
      if (!this.worse(this.rows[worst], this.rows[index])) return
      ;[this.rows[index], this.rows[worst]] = [this.rows[worst], this.rows[index]]
      index = worst
    }
  }

  add(row: RankedItem): void {
    if (this.rows.length < this.max) {
      this.rows.push(row)
      this.up(this.rows.length - 1)
      return
    }
    if (this.rows.length && this.worse(this.rows[0], row)) {
      this.rows[0] = row
      this.down(0)
    }
  }

  values(): RankedItem[] {
    return this.rows.slice().sort((a, b) => b.score - a.score || String(b.item.ts).localeCompare(String(a.item.ts)) || a.item.event_id.localeCompare(b.item.event_id))
  }
}

function enrichmentText(row: SavedEnrichment | undefined): string {
  if (!row) return ''
  const impact = row.news_impact
  return [
    row.summary_en || row.summary,
    ...(row.gist || []),
    row.market_angle,
    row.whats_priced,
    row.the_edge,
    row.watch_item,
    row.theme,
    ...(row.companies || []).flatMap((c) => [c.name, c.ticker || '']),
    ...(row.beneficiaries || []).flatMap((p) => [p.name, p.ticker || '', p.mechanism || p.basis || '']),
    ...(row.exposed || []).flatMap((p) => [p.name, p.ticker || '', p.mechanism || p.basis || '']),
    ...(impact?.affected_metric || []),
    ...(impact?.extracted_numbers || []),
    impact?.quick_dirty_calculation,
    impact?.why_it_matters,
    impact?.analyst_takeaway,
  ].filter(Boolean).join(' ')
}

function itemQuality(item: FeedItem, nowMs: number, historical: boolean): number {
  const ageHours = Math.max(0, (nowMs - Date.parse(item.ts)) / 3_600_000)
  const freshness = historical ? 0 : Math.max(0, 18 - Math.log2(ageHours + 1) * 3)
  const source = item.source_tier === 'primary_filing' ? 12 : item.source_tier === 'official_data' ? 8 : item.source_tier === 'company' ? 4 : item.source_tier === 'social' ? -10 : 0
  const caution = item.caution ? -18 : 0
  return Number(item.triage_score || 0) + freshness + source + caution
}

function retrievalDocument(item: FeedItem, enrichment: SavedEnrichment | undefined, nowMs: number, historical: boolean): HybridDocument<FeedItem> {
  return {
    id: item.event_id,
    groupId: item.dedup_group || item.event_id,
    value: item,
    quality: itemQuality(item, nowMs, historical),
    fields: [
      { name: 'headline', text: [item.headline_en || '', item.headline], weight: 7, fuzzy: true },
      { name: 'company', text: (item.companies || []).flatMap((c) => [c.name, c.ticker || '']), weight: 8, fuzzy: true },
      { name: 'snippet', text: item.snippet, weight: 3 },
      { name: 'saved_article', text: enrichmentText(enrichment), weight: 3 },
      { name: 'tags', text: [item.scope || '', ...(item.event_types || [])], weight: 1.5 },
      { name: 'source', text: [item.source_name, item.domain, item.region], weight: 0.5 },
    ],
  }
}

function uniqueTop(rows: RankedItem[], limit: number): RankedItem[] {
  const seen = new Set<string>()
  const out: RankedItem[] = []
  for (const row of rows) {
    const key = row.item.dedup_group || row.item.event_id
    if (seen.has(key)) continue
    seen.add(key)
    out.push(row)
    if (out.length >= limit) break
  }
  return out
}

function fuseRows(primary: RankedItem[], secondary: RankedItem[], limit: number): RankedItem[] {
  const rows = new Map<string, RankedItem & { fused: number; bestPrimary: number }>()
  const add = (list: RankedItem[], weight: number, primaryLane: boolean) => {
    for (let i = 0; i < list.length; i++) {
      const row = list[i]
      const prev = rows.get(row.item.event_id)
      const fused = (prev?.fused || 0) + weight / (60 + i + 1)
      rows.set(row.item.event_id, {
        ...(prev || row),
        ...row,
        extraReasons: [...new Set([...(prev?.extraReasons || []), ...(row.extraReasons || [])])],
        fused,
        bestPrimary: primaryLane ? Math.min(prev?.bestPrimary ?? Number.POSITIVE_INFINITY, i) : (prev?.bestPrimary ?? Number.POSITIVE_INFINITY),
      })
    }
  }
  add(primary, 1.4, true)
  add(secondary, 1, false)
  return [...rows.values()]
    .sort((a, b) => (b.match?.anchorMatches || 0) - (a.match?.anchorMatches || 0) || b.fused - a.fused || a.bestPrimary - b.bestPrimary || String(b.item.ts).localeCompare(String(a.item.ts)))
    .slice(0, limit)
}

function bump(map: Map<string, number>, key: string | undefined | null): void {
  const k = String(key || '').trim()
  if (k) map.set(k, (map.get(k) || 0) + 1)
}

function bumpBounded(map: Map<string, number>, key: string | undefined | null, max = 512): void {
  const k = String(key || '').trim()
  if (!k) return
  if (map.has(k)) map.set(k, (map.get(k) || 0) + 1)
  else if (map.size < max) map.set(k, 1)
}

function topCounts(map: Map<string, number>, n = 10): [string, number][] {
  return [...map.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, n)
}

function seedTerms(items: FeedItem[], query: string[]): string[] {
  const counts = new Map<string, number>()
  for (const item of items.slice(0, 25)) {
    for (const e of item.event_types || []) bump(counts, e.toLowerCase())
    for (const c of item.companies || []) {
      for (const t of tokens(c.ticker || c.name)) if (!STOP.has(t)) bump(counts, t)
    }
    for (const t of tokens(item.headline_en || item.headline)) if (!STOP.has(t) && t.length >= 4) bump(counts, t)
  }
  const derived = topCounts(counts, 18).map(([k]) => k)
  return [...new Set([...query, ...derived])].slice(0, 24)
}

function short(s: string | undefined | null, max: number): string {
  const v = cleanText(String(s || ''))
  return v.length <= max ? v : `${v.slice(0, max - 1).trim()}…`
}

function evidenceLine(ref: string, item: FeedItem, enrichment?: SavedEnrichment, whyMatched: string[] = []): string {
  const companies = (item.companies || []).map((c) => c.ticker || c.name).filter(Boolean).join(', ') || 'none named'
  const themes = (item.event_types || []).join(', ') || 'none'
  return [
    `[${ref}] ${item.ts} | ${item.source_name} | ${short(item.headline_en || item.headline, 380)}`,
    `event=${item.event_id} | tier=${item.source_tier || 'unknown'} | scope=${item.scope || 'unknown'} | score=${item.triage_score} | companies=${companies} | tags=${themes}`,
    whyMatched.length ? `retrieval: ${whyMatched.join(', ')}` : '',
    item.triage_reason ? `scanner note: ${short(item.triage_reason, 220)}` : '',
    item.snippet ? `source snippet: ${short(item.snippet, 360)}` : '',
    enrichment?.summary || enrichment?.summary_en ? `saved article read: ${short(enrichment.summary_en || enrichment.summary, 520)}` : '',
    enrichment?.gist?.length ? `saved article points: ${enrichment.gist.slice(0, 4).map((x) => short(x, 220)).join(' | ')}` : '',
    enrichment?.market_angle ? `saved market angle: ${short(enrichment.market_angle, 320)}` : '',
    enrichment?.news_impact?.extracted_numbers?.length ? `saved figures: ${enrichment.news_impact.extracted_numbers.slice(0, 8).map((x) => short(x, 80)).join(' | ')}` : '',
    enrichment?.news_impact?.why_it_matters ? `saved impact: ${short(enrichment.news_impact.why_it_matters, 320)}` : '',
    item.url ? `url: ${item.url}` : '',
  ].filter(Boolean).join('\n')
}

function windowLabel(window: NewsChatWindow): string {
  return window === '24h' ? 'last 24 hours' : window === '7d' ? 'last 7 days' : 'all saved history'
}

function sourceCoverage(report: SourcesReport | undefined): { counts: SourcesReport['counts'] | null; warnings: string[] } {
  if (!report) return { counts: null, warnings: [] }
  const warnings: string[] = []
  if (report.counts.failing) {
    const names = report.sources.filter((s) => s.health === 'failing').slice(0, 5).map((s) => s.name)
    warnings.push(`${report.counts.failing} source connection(s) are failing${names.length ? `: ${names.join(', ')}` : ''}. Results may be incomplete.`)
  }
  if (report.counts.idle) warnings.push(`${report.counts.idle} configured source(s) have not produced a verified fetch yet.`)
  if (report.coverage?.critical_gaps?.length) warnings.push(`No working peer covers: ${report.coverage.critical_gaps.slice(0, 5).join(', ')}.`)
  return { counts: report.counts, warnings }
}

function rankTradeCandidates(evidence: NewsChatEvidence[], nowMs: number, enrichments: Map<string, SavedEnrichment>): NewsTradeCandidate[] {
  const groups = new Map<string, { company: string; items: (FeedItem & { impact_magnitude?: 'low' | 'medium' | 'high' | 'critical' | null })[]; refs: string[] }>()
  for (const ev of evidence.filter((e) => !e.historical)) {
    for (const company of ev.item.companies || []) {
      const ticker = String(company.ticker || '').trim().toUpperCase()
      if (!ticker || !/^[A-Z0-9][A-Z0-9.:-]{0,14}$/.test(ticker)) continue
      const group = groups.get(ticker) || { company: company.name || ticker, items: [], refs: [] }
      // materiality_pre_score and dedup_group already travel on the persisted FeedItem. The body reader's
      // economic-impact label is separate from that composite rank, so attach it explicitly when present.
      const impactMagnitude = enrichments.get(ev.item.event_id)?.news_impact?.impact_magnitude
      group.items.push({ ...ev.item, ...(impactMagnitude ? { impact_magnitude: impactMagnitude } : {}) })
      group.refs.push(ev.ref)
      groups.set(ticker, group)
    }
  }
  return [...groups.entries()].map(([ticker, group]) => {
    // FeedItem.companies is explicitly a title-model guess (types.ts), not a verified security master or
    // live quote. Keep it as the candidate label, but do not clear ticker/listing/liquidity caps here.
    const scored = scoreTradeCluster(group.items, { nowMs, ticker, tickerVerified: false, listingLiquidityVerified: false })
    return {
      ticker,
      company: group.company,
      score: scored.score,
      readiness: scored.readiness,
      direction: scored.direction,
      breakdown: scored.breakdown,
      missingChecks: scored.missingChecks,
      evidenceRefs: [...new Set(group.refs)].slice(0, 8),
    }
  }).sort((a, b) => b.score - a.score || b.evidenceRefs.length - a.evidenceRefs.length || a.ticker.localeCompare(b.ticker)).slice(0, 5)
}

export async function assembleNewsChatContext(opts: {
  repoRoot: string
  archiveDir?: string
  enrichCacheFile?: string
  window: NewsChatWindow
  question: string
  sourceReport?: SourcesReport
  semanticResult?: SemanticSearchResult
  now?: () => Date
  signal?: AbortSignal
}): Promise<NewsChatContext> {
  throwIfAborted(opts.signal)
  const now = opts.now?.() || new Date()
  const nowMs = now.getTime()
  const files = listDailyFiles(opts.repoRoot, opts.archiveDir || '')
  const concepts = loadRetrievalConcepts(opts.repoRoot)
  const query = buildNewsQuery(opts.question, concepts)
  const queryTerms = query.terms
  const enrichments = readEnrichmentCache(opts.enrichCacheFile || path.join(opts.repoRoot, 'ui', 'server', '.state', 'news-enrich-cache.json'))
  const currentBroad = new TopItems(220)
  const current = queryTerms.length ? new HybridCollector<FeedItem>(query, 1_200) : null
  const semanticRanks = new Map((opts.semanticResult?.hits || []).map((hit) => [hit.eventId, hit]))
  const fastIds = candidateEnrichmentIds(query, enrichments)
  for (const id of semanticRanks.keys()) if (fastIds.size < 768) fastIds.add(id)
  const directPrefilter = queryTerms.length ? fastLineFilter(query, fastIds) : undefined
  const semanticRows = new TopItems(240)
  const relationshipGraph = new NewsRelationshipGraph(query)
  const currentGraphRows = new TopItems(600)
  const olderGraphRows = new TopItems(300)
  const sources = new Set<string>()
  const companyCounts = new Map<string, number>()
  const eventCounts = new Map<string, number>()
  const tierCounts = new Map<string, number>()
  const termCounts = new Map<string, number>()
  const retrievalTermCounts = new Map<string, number>()
  let itemsSearched = 0
  let itemsMatched = 0
  let coverageStart: string | null = files.length ? files[files.length - 1].date : null
  let coverageEnd: string | null = files.length ? files[0].date : null

  const cutoffMs = opts.window === 'history' ? -Infinity : nowMs - WINDOW_MS[opts.window]
  const cutoffDate = opts.window === 'history' ? '' : new Date(cutoffMs).toISOString().slice(0, 10)
  const currentFiles = opts.window === 'history' ? files : files.filter((f) => f.date >= cutoffDate)
  const visitCurrent = (item: FeedItem) => {
    const at = Date.parse(item.ts)
    if (!Number.isFinite(at)) return
    const enrichment = enrichments.get(item.event_id)
    const document = retrievalDocument(item, enrichment, nowMs, false)
    const semantic = semanticRanks.get(item.event_id)
    if (semantic) semanticRows.add({ item, score: (document.quality || 0) + semantic.score * 100, extraReasons: [`semantic:${semantic.score.toFixed(3)}`] })
    const match = current?.add(document)
    if (match && !match.qualifies) return
    currentGraphRows.add({ item, score: (document.quality || 0) + (match?.exactScore || 0) + (match?.recallScore || 0) })
    itemsMatched++
    if (sources.size < 512) sources.add(item.source_name || item.domain || 'unknown')
    for (const c of item.companies || []) bumpBounded(companyCounts, c.ticker || c.name)
    for (const e of item.event_types || []) bumpBounded(eventCounts, e)
    bumpBounded(tierCounts, item.source_tier || 'unknown')
    for (const term of match?.exactTerms || []) bumpBounded(termCounts, term)
    for (const term of match?.matchedTerms || []) bumpBounded(retrievalTermCounts, term)
    if (!current) currentBroad.add({ item, score: document.quality || 0 })
  }
  for (const f of currentFiles) itemsSearched += await readItems(f.file, visitCurrent, {
    prefilter: directPrefilter,
    signal: opts.signal,
    ...(opts.window === 'history' ? {} : { minTs: cutoffMs }),
  })
  throwIfAborted(opts.signal)

  const lexicalRanked: RankedItem[] = queryTerms.length
    ? current!.results(220).map((hit) => ({ item: hit.document.value, score: hit.score, match: hit.match }))
    : currentBroad.values()
  const currentRanked = opts.semanticResult?.status === 'active' ? fuseRows(lexicalRanked, semanticRows.values(), 220) : lexicalRanked
  let currentTopRows = uniqueTop(currentRanked, 55)
  const historyTerms = seedTerms(currentTopRows.map((row) => row.item), queryTerms)
  const historyQuery = buildHybridQuery(historyTerms.join(' '), { terms: historyTerms, forcedAnchors: query.anchors, minAnchorMatches: query.minAnchorMatches, concepts, maxTerms: 24 })
  const older = new HybridCollector<FeedItem>(historyQuery, 800)
  if (opts.window !== 'history' && historyTerms.length) {
    const visitOlder = (item: FeedItem) => {
      const at = Date.parse(item.ts)
      if (!Number.isFinite(at) || at >= cutoffMs) return
      const enrichment = enrichments.get(item.event_id)
      const document = retrievalDocument(item, enrichment, nowMs, true)
      const match = older.add(document)
      if (match.qualifies) olderGraphRows.add({ item, score: (document.quality || 0) + match.exactScore + match.recallScore })
    }
    // Include the boundary date and use the timestamp gate so the part of that file before the cutoff
    // is not lost. The fast named-subject probe makes the full-history novelty check cheap.
    const historyFiles = files.filter((f) => f.date <= cutoffDate)
    for (const f of historyFiles) await readItems(f.file, visitOlder, { prefilter: directPrefilter, maxTsExclusive: cutoffMs, signal: opts.signal })
  }
  throwIfAborted(opts.signal)
  for (const row of uniqueTop(currentGraphRows.values(), 500)) relationshipGraph.add(row.item, enrichments.get(row.item.event_id))
  for (const row of uniqueTop(olderGraphRows.values(), 250)) relationshipGraph.add(row.item, enrichments.get(row.item.event_id))
  let historicalTopRows = uniqueTop(older.results(100).map((hit) => ({ item: hit.document.value, score: hit.score, match: hit.match })), 20)
  // A second bounded pass fetches evidence connected through a concrete company/commodity. Broad
  // taxonomy nodes never enter this pass (relationship-graph.ts), so it cannot turn "commercial" into
  // a link between unrelated stories.
  const seedRelationships = relationshipGraph.relationships()
  const relatedTerms = seedRelationships
    .filter((r) => r.relation !== 'co_mentioned' && (r.kind === 'company' || r.kind === 'commodity'))
    .flatMap((r) => [r.related, ...r.aliases])
    .filter((term) => !query.anchors.includes(normalizeRetrievalText(term)))
  if (queryTerms.length && relatedTerms.length) {
    const connectionFilter = literalLineFilter(relatedTerms)
    const connectionRows = new TopItems(600)
    const addConnection = (item: FeedItem) => {
      connectionRows.add({ item, score: itemQuality(item, nowMs, Date.parse(item.ts) < cutoffMs) })
    }
    for (const f of files) await readItems(f.file, addConnection, { prefilter: connectionFilter, signal: opts.signal })
    for (const row of uniqueTop(connectionRows.values(), 500)) relationshipGraph.add(row.item, enrichments.get(row.item.event_id))
  }
  throwIfAborted(opts.signal)
  const relationships = relationshipGraph.relationships()
  const existingIds = new Set([...currentTopRows, ...historicalTopRows].map((r) => r.item.event_id))
  for (const candidate of relationshipGraph.candidates(existingIds, 12)) {
    const historical = opts.window !== 'history' && Date.parse(candidate.item.ts) < cutoffMs
    const row: RankedItem = { item: candidate.item, score: candidate.score, extraReasons: [candidate.reason] }
    if (historical) historicalTopRows.push(row)
    else currentTopRows.push(row)
    existingIds.add(candidate.item.event_id)
  }
  currentTopRows = uniqueTop(currentTopRows, 60)
  historicalTopRows = uniqueTop(historicalTopRows, 24)

  const evidence: NewsChatEvidence[] = [
    ...currentTopRows.map((row, i) => ({ ref: `N${i + 1}`, item: row.item, historical: false, whyMatched: [...(row.match?.reasons || []), ...(row.extraReasons || [])] })),
    ...historicalTopRows.map((row, i) => ({ ref: `H${i + 1}`, item: row.item, historical: true, whyMatched: [...(row.match?.reasons || []), ...(row.extraReasons || [])] })),
  ]
  const refByEvent = new Map(evidence.map((e) => [e.item.event_id, e.ref]))
  const tradeCandidates = rankTradeCandidates(evidence, nowMs, enrichments)

  const themes = readCanonicalThemes(opts.repoRoot).themes
    .flatMap((t) => {
      if (!t.narrative || t.narrative.version !== 1 || t.assessment?.status === 'context') return []
      const expressions = Array.isArray(t.qualified_expressions) ? t.qualified_expressions : []
      const evidence = Array.isArray(t.evidence) ? t.evidence : []
      const flowSeries = Array.isArray(t.flow_series) ? t.flow_series : []
      const flowDaily = Array.isArray(t.flow_daily) ? t.flow_daily : []
      const flow = opts.window === '24h'
        ? flowSeries.slice(-24).reduce((a, b) => a + b, 0)
        : opts.window === '7d'
          ? flowDaily.slice(-7).reduce((a, b) => a + b, 0)
          : t.member_count
      const match = matchHybridDocument(query, {
        id: t.theme_id,
        value: t,
        fields: [
          { name: 'theme', text: [t.name, t.narrative.thesis, t.narrative.why_now, ...t.narrative.mechanism_steps], weight: 4, fuzzy: true },
          { name: 'expressions', text: expressions.flatMap((expression) => [expression.name, expression.ticker, expression.role, expression.mechanism]), weight: 5, fuzzy: true },
          { name: 'evidence', text: evidence.map((row) => row.headline), weight: 3, fuzzy: true },
        ],
      })
      return [{ ...t, windowFlow: flow, queryMatch: match.matchedTerms.length, queryAnchorMatch: match.anchorMatches, queryQualifies: match.qualifies }]
    })
    .filter((t) => !queryTerms.length || t.queryQualifies)
    .sort((a, b) => b.queryAnchorMatch - a.queryAnchorMatch || b.queryMatch - a.queryMatch || b.windowFlow - a.windowFlow || b.composite - a.composite)
    .slice(0, 10)

  const dataStores = [...new Set(files.map((f) => f.store))]
  if (enrichments.size) dataStores.push('saved article reads')
  dataStores.push('theme index')
  const queryTermHits = Object.fromEntries(queryTerms.map((term) => [term, termCounts.get(term) || 0]))
  const retrievalTermHits = Object.fromEntries(queryTerms.map((term) => [term, retrievalTermCounts.get(term) || 0]))
  const coverage = sourceCoverage(opts.sourceReport)

  const receipt: NewsChatReceipt = {
    window: opts.window,
    label: windowLabel(opts.window),
    itemsSearched,
    itemsMatched,
    sourceCount: sources.size,
    evidenceCount: currentTopRows.length,
    historicalEvidenceCount: historicalTopRows.length,
    coverageStart,
    coverageEnd,
    queryTerms,
    queryTermHits,
    retrievalTermHits,
    expandedTerms: query.expandedTerms,
    retrievalMode: opts.semanticResult?.status === 'active' ? 'hybrid_neural' : 'hybrid',
    retrievalChannels: [
      'exact text', 'finance concepts', 'word forms', 'typo rescue', 'BM25 relevance', 'source quality', 'RRF fusion', 'cited event graph',
      ...(opts.semanticResult?.status === 'active' ? ['neural embeddings'] : []),
    ],
    semantic: opts.semanticResult ? { status: opts.semanticResult.status, model: opts.semanticResult.model, indexedItems: opts.semanticResult.indexedItems, hitsUsed: evidence.filter((e) => e.whyMatched?.some((r) => r.startsWith('semantic:'))).length, ...(opts.semanticResult.note ? { note: opts.semanticResult.note } : {}) } : null,
    rerank: null,
    relationships: relationships.map((r) => ({ seed: r.seed, related: r.related, kind: r.kind, relation: r.relation, mentions: r.mentions, evidenceEventIds: r.evidence.map((e) => e.item.event_id) })),
    tradeCandidates,
    dataStores,
    coverageWarnings: coverage.warnings,
    sourceHealth: coverage.counts,
  }

  if (!files.length || !itemsSearched) {
    return {
      present: false,
      context: '',
      evidence: [],
      receipt,
      missingHint: files.length ? `No saved news was found in the ${windowLabel(opts.window)}.` : 'No saved news archive was found yet.',
    }
  }

  const themeLines = themes.length
    ? themes.map((t) => {
        const expressions = Array.isArray(t.qualified_expressions) ? t.qualified_expressions : []
        const support = (t.evidence || []).filter((row) => row.stance === 'supports').length
        const challenges = (t.evidence || []).filter((row) => row.stance === 'challenges').length
        return `- ${t.name}: thesis=${t.narrative!.thesis}; why_now=${t.narrative!.why_now}; status=${t.assessment.status}; evidence_confidence=${t.conviction}; activity=${t.activity}; core_flow=${t.windowFlow}; support=${support}; challenges=${challenges}; evidence-bound expressions=${expressions.map((expression) => `${expression.ticker} [${expression.role}, ${expression.side}]: ${expression.mechanism}`).join(' | ') || 'none proven'}`
      }).join('\n')
    : '- No matching saved theme.'
  const currentLines = currentTopRows.length ? currentTopRows.map((row, i) => evidenceLine(`N${i + 1}`, row.item, enrichments.get(row.item.event_id), [...(row.match?.reasons || []), ...(row.extraReasons || [])])).join('\n\n') : 'No story matched the question in the chosen window.'
  const historyLines = historicalTopRows.length ? historicalTopRows.map((row, i) => evidenceLine(`H${i + 1}`, row.item, enrichments.get(row.item.event_id), [...(row.match?.reasons || []), ...(row.extraReasons || [])])).join('\n\n') : 'No useful older match was found.'
  const connectionLines = relationships.length ? relationships.map((r) => relationshipLine(r, refByEvent)).join('\n') : '- No cited relationship was found for the named subject.'
  const tradeLines = tradeCandidates.length ? tradeCandidates.map((c, i) => `- #${i + 1} ${c.ticker} (${c.company}): readiness=${c.score}/100, side=${c.direction}, state=${c.readiness}, evidence=${c.evidenceRefs.map((r) => `[${r}]`).join(' ')}, still needs=${c.missingChecks.join('; ') || 'none'}.`).join('\n') : '- No listed ticker has enough cited evidence to rank.'

  const context = [
    `WINDOW: ${windowLabel(opts.window)}`,
    `SEARCH RECEIPT: searched ${itemsSearched} saved items from ${sources.size} sources; ${itemsMatched} matched the question; archive coverage ${coverageStart || 'unknown'} to ${coverageEnd || 'unknown'}.`,
    `RETRIEVAL: hybrid (${receipt.retrievalChannels.join(', ')}).`,
    `NEURAL SEARCH: ${receipt.semantic ? `${receipt.semantic.status}; model=${receipt.semantic.model || 'none'}; indexed=${receipt.semantic.indexedItems}; used=${receipt.semantic.hitsUsed}` : 'not requested'}.`,
    `DATA STORES: ${dataStores.join(', ')}.`,
    `QUERY TERMS: ${queryTerms.join(', ') || 'none — broad scan'}`,
    `DIRECT QUERY TERM HITS IN MATCHED ITEMS: ${queryTerms.map((term) => `${term}=${queryTermHits[term]}`).join(', ') || 'broad scan'}`,
    `RETRIEVED TERM HITS INCLUDING SAFE EXPANSION: ${queryTerms.map((term) => `${term}=${retrievalTermHits[term]}`).join(', ') || 'broad scan'}`,
    `SAFE QUERY EXPANSIONS: ${Object.entries(query.expandedTerms).map(([term, values]) => `${term}→${values.join('/')}`).join(', ') || 'none'}`,
    `SOURCE COVERAGE WARNINGS: ${coverage.warnings.join(' ') || 'none reported'}`,
    `TOP COMPANY MENTIONS: ${topCounts(companyCounts).map(([k, v]) => `${k}=${v}`).join(', ') || 'none'}`,
    `TOP EVENT TAGS: ${topCounts(eventCounts).map(([k, v]) => `${k}=${v}`).join(', ') || 'none'}`,
    `SOURCE-TIER MIX: ${topCounts(tierCounts).map(([k, v]) => `${k}=${v}`).join(', ') || 'none'}`,
    '',
    'CITED CONNECTIONS — co-mention is not causation; saved beneficiary/exposure labels are model output, not filed fact:',
    connectionLines,
    '',
    'STRICT TRADE-CANDIDATE RANKING — a check queue, not a return forecast:',
    tradeLines,
    '',
    'LIVING THEMES IN THIS WINDOW:',
    themeLines,
    '',
    'CURRENT EVIDENCE:',
    currentLines,
    '',
    'OLDER EVIDENCE — use only to test novelty or show a prior example:',
    historyLines,
  ].join('\n')

  return { present: true, context, evidence, receipt }
}

export function applyNewsRerank(assembled: NewsChatContext, result: RerankResult): NewsChatContext {
  assembled.receipt.rerank = { status: result.status, model: result.model, ...(result.note ? { note: result.note } : {}) }
  if (result.status !== 'active' || !result.order.length) return assembled
  const known = new Map(assembled.evidence.map((e) => [e.ref, e]))
  const ordered = result.order.filter((ref) => known.has(ref)).slice(0, 20)
  if (!ordered.length) return assembled
  assembled.context = [
    `NEURAL SECOND-STAGE ORDER: ${ordered.map((ref) => `[${ref}]${result.scores[ref] === undefined ? '' : `=${Math.round(result.scores[ref])}`}`).join(', ')}. This only reorders cited candidates; it does not create facts.`,
    assembled.context,
  ].join('\n')
  return assembled
}

export function buildNewsChatPrompts(args: {
  assembled: NewsChatContext
  messages: NewsChatMessage[]
  calls?: CallMemoryItem[]
}): { system: string; user: string } {
  const last = args.messages[args.messages.length - 1]
  const prior = args.messages.slice(0, -1)
  const system = [
    'You are the news desk inside an institutional stock screener.',
    'Use only the NEWS CONTEXT and optional DECISION MEMORY below. You cannot browse. Do not use outside facts.',
    '',
    'Rules:',
    '1. Use very simple words and short sentences. Lead with the answer.',
    '2. No source means no claim. Cite every news claim with its exact marker, such as [N3] or [H2].',
    '3. [N] means evidence in the chosen time window. [H] means older evidence. Never present an [H] item as current.',
    '4. A repeated story is not fresh proof. Prefer different sources and primary filings. Treat social posts as weak leads only.',
    '5. Separate fact from inference. Write "Inference:" when you explain a possible business effect that the source did not state.',
    '6. Do not invent a price move, valuation, market expectation, earnings effect, ticker, date, or probability.',
    '7. If price, liquidity, consensus, or a dated catalyst is missing, say "Not tradable yet" and name the missing check.',
    '8. When the user asks for ideas, show at most three. For each: direction, company or instrument if named in the evidence, why now, time window, trigger, biggest risk, and kill condition.',
    '9. It is fine to say no idea clears the bar. Do not force a trade.',
    '10. End an idea answer with one short line: "Next step: Run Signal Check" or "Next step: keep watching."',
    '11. Read DIRECT QUERY TERM HITS. If an important named product, company, or topic has zero hits in direct text, say so. Safe query expansions may find useful related wording, but they do not prove the exact named term appeared.',
    '12. A subject mention and a number elsewhere are not proof of a requested metric. If no cited evidence line directly links the subject to the number, say the exact figure is missing.',
    '13. Read SOURCE COVERAGE WARNINGS. If a source is failing, never claim the search is complete. State the gap in one short sentence.',
    '14. A CITED CONNECTION marked co-mentioned is a search path, not proof that one thing caused another. Say "connection" or "read-across", not "caused", unless the cited source states the mechanism.',
    '15. STRICT TRADE-CANDIDATE RANKING is a queue for Signal Check. It is not expected return. Keep every listed missing check and never call a candidate tradable until those checks are done.',
    '16. Neural search and reranking may change which saved items are read first. They never turn similarity into a fact; every answer still needs the cited source text.',
    ...(args.calls?.length ? [
      '17. DECISION MEMORY is the immutable original call plus append-only reviews. Begin with one short paragraph labelled "Memory check:". Repeat the original rating exactly, state what happened, name the prior mistake or success, and say which assumption this answer rechecks. If two [M] rows share a ticker, distinguish the current unreviewed call from the older reviewed lesson. Never call Watchlist, Avoid, or Stay away an entry call. Never rewrite the frozen original after seeing the outcome. Cite original fields from ORIGINAL SOURCE and outcome fields from REVIEW SOURCE, with the matching [M] marker. New event facts still require [N]/[H] news citations.',
    ] : []),
  ].join('\n')
  const transcript = prior.length
    ? `CONVERSATION SO FAR:\n${prior.map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n\n')}\n\n`
    : ''
  const userPrefix = [
    'NEWS CONTEXT',
    '============',
    args.assembled.context,
    ...(args.calls?.length ? [
      '',
      '============',
      'DECISION MEMORY',
      '===============',
      decisionMemoryBlock(args.calls),
    ] : []),
    '',
    '============',
    transcript,
    'Answer only from the context. Keep the language very simple.',
  ].join('\n')
  const user = appendNewsChatFinalQuestion(userPrefix, last?.content || '')
  return { system, user }
}
