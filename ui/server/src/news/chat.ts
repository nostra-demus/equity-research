// Closed-book chat context for the Screener news wire.
//
// The model never receives the whole archive. This reader scans every saved daily firehose file,
// builds small facts about the chosen window, keeps the best matching stories, and adds older matches
// only when they help test whether something is really new. Every story keeps its event id and URL so
// the answer can cite it and the cockpit can open the exact item.

import fs from 'node:fs'
import path from 'node:path'
import { cleanText } from './clean'
import { deriveScope, deriveSourceTier } from './scope'
import { readThemesIndex } from './themes/store'
import type { FeedItem } from './types'

export type NewsChatWindow = '24h' | '7d' | 'history'

export interface NewsChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface NewsChatEvidence {
  ref: string
  item: FeedItem
  historical: boolean
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
}

const FILE_RE = /^(\d{4}-\d{2}-\d{2})_firehose\.ndjson$/
const WINDOW_MS: Record<Exclude<NewsChatWindow, 'history'>, number> = {
  '24h': 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
}

// Common question words plus broad trading words. Removing these leaves the real subject: a company,
// commodity, policy, sector, product, or named event. An empty term list means "scan the whole window".
const STOP = new Set(
  [
    'a', 'about', 'after', 'again', 'all', 'also', 'am', 'an', 'and', 'any', 'are', 'as', 'at', 'be',
    'because', 'been', 'before', 'beneficiaries', 'beneficiary', 'best', 'between', 'but', 'by', 'can', 'candidate', 'changed', 'chat',
    'companies', 'company', 'compared', 'could', 'create', 'day', 'days', 'did', 'do', 'does', 'exact', 'find', 'for', 'from', 'getting', 'give', 'has',
    'have', 'history', 'hour', 'hours', 'how', 'i', 'idea', 'ideas', 'if', 'in', 'into', 'is', 'it',
    'harmed', 'last', 'long', 'loser', 'losers', 'looks', 'may', 'me', 'most', 'my', 'new', 'news', 'next', 'not', 'of', 'on', 'one', 'or', 'order', 'our',
    'over', 'please', 'screen', 'second', 'second-order', 'sector', 'sectors', 'seven', 'short', 'show', 'signal', 'since', 'some', 'stronger', 'that', 'the', 'their',
    'them', 'theme', 'themes', 'there', 'these', 'they', 'thing', 'this', 'those', 'to', 'today', 'trade', 'tradable', 'trading',
    'up', 'us', 'want', 'week', 'weeks', 'what', 'when', 'where', 'which', 'who', 'why', 'will', 'winner', 'winners', 'with',
    'would', 'you', 'your',
  ],
)

function tokens(s: string): string[] {
  return (s.toLowerCase().match(/[a-z0-9][a-z0-9.+&-]{1,}/g) || [])
    .map((t) => t.replace(/^[+.-]+|[+.-]+$/g, ''))
    .filter((t) => t.length >= 2)
}

export function newsQueryTerms(question: string): string[] {
  const out: string[] = []
  for (const t of tokens(question)) {
    if (STOP.has(t) || /^[\d.+-]+$/.test(t) || out.includes(t)) continue
    out.push(t)
    if (out.length >= 12) break
  }
  return out
}

function listDailyFiles(repoRoot: string, archiveDir: string): { date: string; file: string }[] {
  const byDate = new Map<string, string>()
  const add = (dir: string, prefer: boolean) => {
    if (!dir) return
    let names: string[] = []
    try { names = fs.readdirSync(dir) } catch { return }
    for (const name of names) {
      const m = FILE_RE.exec(name)
      if (!m) continue
      if (prefer || !byDate.has(m[1])) byDate.set(m[1], path.join(dir, name))
    }
  }
  // The Drive mirror is the fallback; a local file with the same date is fresher and wins.
  add(archiveDir, false)
  add(path.join(repoRoot, 'screener', 'inbox'), true)
  return [...byDate.entries()].map(([date, file]) => ({ date, file })).sort((a, b) => b.date.localeCompare(a.date))
}

function hydrate(raw: any): FeedItem | null {
  if (!raw || raw.kind !== 'item' || !raw.event_id || !raw.headline || !raw.ts) return null
  const headline = cleanText(String(raw.headline)) || String(raw.headline)
  const item = { ...raw, headline } as FeedItem
  item.scope ||= deriveScope(item)
  item.source_tier ||= deriveSourceTier(item)
  return item
}

function readItems(file: string, visit: (item: FeedItem) => void): void {
  let text = ''
  try { text = fs.readFileSync(file, 'utf8') } catch { return }
  for (const line of text.split('\n')) {
    const t = line.trim()
    if (!t || !t.includes('"kind"')) continue
    try {
      const item = hydrate(JSON.parse(t))
      if (item) visit(item)
    } catch {
      // One broken line must never break the archive search.
    }
  }
}

class TopItems {
  private rows: RankedItem[] = []
  constructor(private readonly max: number) {}

  add(row: RankedItem): void {
    if (this.rows.length < this.max) {
      this.rows.push(row)
      return
    }
    let low = 0
    for (let i = 1; i < this.rows.length; i++) if (this.rows[i].score < this.rows[low].score) low = i
    if (row.score > this.rows[low].score) this.rows[low] = row
  }

  values(): RankedItem[] {
    return this.rows.slice().sort((a, b) => b.score - a.score || String(b.item.ts).localeCompare(String(a.item.ts)))
  }
}

function itemText(item: FeedItem): string {
  return [
    item.headline_en || item.headline,
    item.headline,
    item.source_name,
    item.region,
    item.scope,
    ...(item.event_types || []),
    ...(item.companies || []).flatMap((c) => [c.name, c.ticker || '']),
  ].join(' ').toLowerCase()
}

function matches(item: FeedItem, terms: string[]): number {
  if (!terms.length) return 0
  const text = itemText(item)
  let n = 0
  for (const term of terms) if (text.includes(term)) n++
  return n
}

function rank(item: FeedItem, termMatches: number, nowMs: number, historical: boolean): number {
  const ageHours = Math.max(0, (nowMs - Date.parse(item.ts)) / 3_600_000)
  const freshness = historical ? 0 : Math.max(0, 18 - Math.log2(ageHours + 1) * 3)
  const source = item.source_tier === 'primary_filing' ? 12 : item.source_tier === 'official_data' ? 8 : item.source_tier === 'company' ? 4 : item.source_tier === 'social' ? -10 : 0
  const caution = item.caution ? -18 : 0
  return Number(item.triage_score || 0) + termMatches * 36 + freshness + source + caution
}

function uniqueTop(rows: RankedItem[], limit: number): FeedItem[] {
  const seen = new Set<string>()
  const out: FeedItem[] = []
  for (const row of rows) {
    const key = row.item.dedup_group || row.item.event_id
    if (seen.has(key)) continue
    seen.add(key)
    out.push(row.item)
    if (out.length >= limit) break
  }
  return out
}

function bump(map: Map<string, number>, key: string | undefined | null): void {
  const k = String(key || '').trim()
  if (k) map.set(k, (map.get(k) || 0) + 1)
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

function evidenceLine(ref: string, item: FeedItem): string {
  const companies = (item.companies || []).map((c) => c.ticker || c.name).filter(Boolean).join(', ') || 'none named'
  const themes = (item.event_types || []).join(', ') || 'none'
  return [
    `[${ref}] ${item.ts} | ${item.source_name} | ${short(item.headline_en || item.headline, 380)}`,
    `event=${item.event_id} | tier=${item.source_tier || 'unknown'} | scope=${item.scope || 'unknown'} | score=${item.triage_score} | companies=${companies} | tags=${themes}`,
    item.triage_reason ? `scanner note: ${short(item.triage_reason, 220)}` : '',
    item.snippet ? `source snippet: ${short(item.snippet, 360)}` : '',
    item.url ? `url: ${item.url}` : '',
  ].filter(Boolean).join('\n')
}

function windowLabel(window: NewsChatWindow): string {
  return window === '24h' ? 'last 24 hours' : window === '7d' ? 'last 7 days' : 'all saved history'
}

export function assembleNewsChatContext(opts: {
  repoRoot: string
  archiveDir?: string
  window: NewsChatWindow
  question: string
  now?: () => Date
}): NewsChatContext {
  const now = opts.now?.() || new Date()
  const nowMs = now.getTime()
  const files = listDailyFiles(opts.repoRoot, opts.archiveDir || '')
  const queryTerms = newsQueryTerms(opts.question)
  const current = new TopItems(220)
  const older = new TopItems(100)
  const sources = new Set<string>()
  const companyCounts = new Map<string, number>()
  const eventCounts = new Map<string, number>()
  const tierCounts = new Map<string, number>()
  let itemsSearched = 0
  let itemsMatched = 0
  let coverageStart: string | null = files.length ? files[files.length - 1].date : null
  let coverageEnd: string | null = files.length ? files[0].date : null

  const cutoffMs = opts.window === 'history' ? -Infinity : nowMs - WINDOW_MS[opts.window]
  const cutoffDate = opts.window === 'history' ? '' : new Date(cutoffMs).toISOString().slice(0, 10)
  const currentFiles = opts.window === 'history' ? files : files.filter((f) => f.date >= cutoffDate)
  const olderFiles = opts.window === 'history' ? [] : files.filter((f) => f.date < cutoffDate)
  const boundaryOlder: FeedItem[] = []

  const visitCurrent = (item: FeedItem) => {
    const at = Date.parse(item.ts)
    if (!Number.isFinite(at)) return
    if (opts.window !== 'history' && at < cutoffMs) { boundaryOlder.push(item); return }
    itemsSearched++
    sources.add(item.source_name || item.domain || 'unknown')
    for (const c of item.companies || []) bump(companyCounts, c.ticker || c.name)
    for (const e of item.event_types || []) bump(eventCounts, e)
    bump(tierCounts, item.source_tier || 'unknown')
    const m = matches(item, queryTerms)
    if (queryTerms.length && !m) return
    itemsMatched++
    current.add({ item, score: rank(item, m, nowMs, false) })
  }
  for (const f of currentFiles) readItems(f.file, visitCurrent)

  const currentTop = uniqueTop(current.values(), 55)
  const historyTerms = seedTerms(currentTop, queryTerms)
  if (opts.window !== 'history' && historyTerms.length) {
    const visitOlder = (item: FeedItem) => {
      const at = Date.parse(item.ts)
      if (!Number.isFinite(at) || at >= cutoffMs) return
      const m = matches(item, historyTerms)
      if (!m) return
      older.add({ item, score: rank(item, m, nowMs, true) })
    }
    for (const item of boundaryOlder) visitOlder(item)
    for (const f of olderFiles) readItems(f.file, visitOlder)
  }
  const historicalTop = uniqueTop(older.values(), 20)

  const evidence: NewsChatEvidence[] = [
    ...currentTop.map((item, i) => ({ ref: `N${i + 1}`, item, historical: false })),
    ...historicalTop.map((item, i) => ({ ref: `H${i + 1}`, item, historical: true })),
  ]

  const themes = readThemesIndex(opts.repoRoot).themes
    .map((t) => {
      const flow = opts.window === '24h'
        ? (t.flow_series || []).slice(-24).reduce((a, b) => a + b, 0)
        : opts.window === '7d'
          ? (t.flow_daily || []).slice(-7).reduce((a, b) => a + b, 0)
          : t.member_count
      const text = `${t.name} ${t.description} ${t.top_companies.map((c) => `${c.name} ${c.ticker || ''}`).join(' ')}`.toLowerCase()
      const match = queryTerms.length ? queryTerms.filter((q) => text.includes(q)).length : 0
      return { ...t, windowFlow: flow, queryMatch: match }
    })
    .filter((t) => !queryTerms.length || t.queryMatch > 0)
    .sort((a, b) => b.queryMatch - a.queryMatch || b.windowFlow - a.windowFlow || b.composite - a.composite)
    .slice(0, 10)

  const receipt: NewsChatReceipt = {
    window: opts.window,
    label: windowLabel(opts.window),
    itemsSearched,
    itemsMatched,
    sourceCount: sources.size,
    evidenceCount: currentTop.length,
    historicalEvidenceCount: historicalTop.length,
    coverageStart,
    coverageEnd,
    queryTerms,
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
    ? themes.map((t) => `- ${t.name}: flow=${t.windowFlow}; state=${t.tier}; companies=${t.top_companies.map((c) => `${c.ticker || c.name} (${c.order === 1 ? 'direct' : c.order === 2 ? 'second-order' : 'third-order'}, ${c.side})`).join(', ') || 'none named'}`).join('\n')
    : '- No matching saved theme.'
  const currentLines = currentTop.length ? currentTop.map((item, i) => evidenceLine(`N${i + 1}`, item)).join('\n\n') : 'No story matched the question in the chosen window.'
  const historyLines = historicalTop.length ? historicalTop.map((item, i) => evidenceLine(`H${i + 1}`, item)).join('\n\n') : 'No useful older match was found.'

  const context = [
    `WINDOW: ${windowLabel(opts.window)}`,
    `SEARCH RECEIPT: searched ${itemsSearched} saved items from ${sources.size} sources; ${itemsMatched} matched the question; archive coverage ${coverageStart || 'unknown'} to ${coverageEnd || 'unknown'}.`,
    `QUERY TERMS: ${queryTerms.join(', ') || 'none — broad scan'}`,
    `TOP COMPANY MENTIONS: ${topCounts(companyCounts).map(([k, v]) => `${k}=${v}`).join(', ') || 'none'}`,
    `TOP EVENT TAGS: ${topCounts(eventCounts).map(([k, v]) => `${k}=${v}`).join(', ') || 'none'}`,
    `SOURCE-TIER MIX: ${topCounts(tierCounts).map(([k, v]) => `${k}=${v}`).join(', ') || 'none'}`,
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

export function buildNewsChatPrompts(args: {
  assembled: NewsChatContext
  messages: NewsChatMessage[]
}): { system: string; user: string } {
  const last = args.messages[args.messages.length - 1]
  const prior = args.messages.slice(0, -1)
  const system = [
    'You are the news desk inside an institutional stock screener.',
    'Use only the NEWS CONTEXT below. You cannot browse. Do not use facts from memory.',
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
  ].join('\n')
  const transcript = prior.length
    ? `CONVERSATION SO FAR:\n${prior.map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n\n')}\n\n`
    : ''
  const user = [
    'NEWS CONTEXT',
    '============',
    args.assembled.context,
    '',
    '============',
    transcript + 'QUESTION:',
    last?.content || '',
    '',
    'Answer only from the context. Keep the language very simple.',
  ].join('\n')
  return { system, user }
}
