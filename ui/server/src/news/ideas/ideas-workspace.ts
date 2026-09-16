import { isDiscoveryCard } from '../../../../shared/ideas-workspace'
import { directoryTickerIdentityKey } from '../symbology'
// Research selection over existing canonical news, themes, lead snapshots and relationship exports.
// Human filing decisions use a separate append-only ledger: a refresh cannot undo an archive, and
// archive snapshots are never subject to the automatic expired-lead eviction policy.
import fs from 'node:fs'
import path from 'node:path'
import { createHash } from 'node:crypto'
import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import type { DiscoveryCard, DiscoveryPage, EventReport, IdeaLane } from '../../../../shared/ideas-workspace'
import { discoveryListing } from '../../../../shared/listing-market'
export { discoveryListing } from '../../../../shared/listing-market'
import { readFeed } from '../feed'
import type { FeedItem } from '../types'
import { loadThemesLedger } from '../themes/store'
import type { Theme } from '../themes/types'
import { themeStoryFamilyKey } from '../themes/story-key'
import { projectLiveIdeas } from './ideas-projection'
import { buildSupplyChainBoard } from '../../supply-chain'
import { acquireRetainedFlockSync, releaseRetainedFlock } from '../../singleton-lock'

const hash = (s: string) => createHash('sha256').update(s).digest('hex').slice(0, 24)
const iso = (s: unknown) => typeof s === 'string' && Number.isFinite(Date.parse(s)) ? new Date(s).toISOString() : ''
const strings = (v: unknown): string[] => Array.isArray(v) ? v.filter((s): s is string => typeof s === 'string') : []
const url = (s: unknown) => typeof s === 'string' && /^https?:\/\//i.test(s) ? s : ''
const ledgerPath = (root: string) => path.join(root, 'screener/ledger/idea-workspace-actions.ndjson')
const broadScopes = new Set(['sector', 'macro', 'commodity', 'policy', 'geopolitical', 'regulatory'])


function shell(kind: DiscoveryCard['kind'], aliases: string[], payload: Record<string, unknown>, at: string, priority: number): DiscoveryCard {
  const unique = [...new Set(aliases)].sort()
  return { key: `${kind}-${hash(unique[0])}`, kind, aliases: unique, sides: [], listings: { long: null, short: null },
    updated_at: at, priority, payload, expired: false, archived_at: null, archive_reason: null, action_revision: null }
}

/** Use source families / a validated narrative identity, never ticker+direction alone. */
export function discoveryIdea(row: Record<string, any>, families = new Map<string, string>()): DiscoveryCard {
  const market = discoveryListing(row.ticker, row.exchange)
  const instrument = `${directoryTickerIdentityKey(String(row.ticker || '').replace(/^[^:]+:/, ''), market)}|${market || 'unknown'}|${row.direction}|${row.pair_with || ''}`
  const sources = strings(row.source_event_ids).map((id) => `source:${families.get(id) || id}`)
  const themes = Array.isArray(row.source_themes) ? row.source_themes.flatMap((t: any) => typeof t?.theme_id === 'string' ? [`theme:${t.theme_id}`] : []) : []
  const aliases = [...themes, ...sources].map((id) => `${instrument}|${id}`)
  if (!aliases.length) aliases.push(`${instrument}|version:${row.idea_version || hash(String(row.reason))}|${row.idea_version_started_at || row.surfaced_at}`)
  const card = shell('idea', aliases, row, iso(row.updated_at) || iso(row.newest_source_at), Number(row.trade_score) || 0)
  card.sides = row.direction === 'pair' ? ['long', 'short'] : row.direction === 'short' ? ['short'] : ['long']
  card.listings.long = discoveryListing(row.ticker, row.exchange)
  card.listings.short = row.direction === 'pair' ? discoveryListing(row.pair_with) : card.listings.long
  card.expired = row.status === 'expired' || (row.status !== 'promoted' && (row.stale === true || !iso(row.decay_at) || Date.parse(row.decay_at) <= Date.now()))
  if (card.expired) { card.archive_reason = 'expired'; card.archived_at = iso(row.archived_at) || iso(row.decay_at) || card.updated_at }
  return card
}

export function buildDiscoveryEvents(themes: Theme[], feed: FeedItem[], nowMs = Date.now()): DiscoveryCard[] {
  const cards: DiscoveryCard[] = []
  const assigned = new Set<string>()
  const cutoff = nowMs - 7 * 86_400_000
  for (const theme of themes) {
    if (theme.status !== 'live') continue
    let reports: EventReport[] = theme.members.flatMap((m): EventReport[] => {
      if (!url(m.url) || !iso(m.found_at)) return []
      const stance = theme.narrative?.evidence.find((e) => e.event_id === m.event_id)?.stance || 'reported'
      return [{ event_id: m.event_id, family: themeStoryFamilyKey(m), headline: m.headline_en || m.headline,
        at: iso(m.found_at), publisher: m.source_name || 'Source', url: url(m.url), time_basis: 'source', stance }]
    }).sort((a, b) => b.at.localeCompare(a.at))
    const memberFamilies = new Set(reports.map((r) => r.family))
    const knownReports = new Set(reports.map((r) => r.event_id))
    const updates = feed.filter((item) => memberFamilies.has(themeStoryFamilyKey(item)) && !knownReports.has(item.event_id) && url(item.url) && iso(item.found_at || item.ts))
    reports = [...reports, ...updates.map((item): EventReport => ({ event_id: item.event_id, family: themeStoryFamilyKey(item),
      headline: item.headline_en || item.headline, at: iso(item.found_at || item.ts), publisher: item.source_name, url: url(item.url), time_basis: item.found_at ? 'source' : 'observed', stance: 'reported' }))]
      .sort((a, b) => b.at.localeCompare(a.at))
    if (!reports.length || Date.parse(reports[0].at) < cutoff) continue
    // Narrative source validation is useful even when no listed stock expresses it. Unvalidated lexical
    // bags stay individual reports below rather than becoming a fabricated developing story.
    const narrative = theme.narrative
    if (!narrative || theme.needs_validation || theme.needs_rename || theme.narrative_update_overflow) continue
    const usableSummary = updates.length === 0 && !theme.needs_narrative_update && narrative.evidence.every((e) => reports.some((r) => r.event_id === e.event_id))
    const aliases = [`theme:${theme.theme_id}`, ...reports.map((r) => `family:${r.family}`)]
    const card = shell('event', aliases, {}, reports[0].at, Math.max(...theme.members.map((m) => m.score)))
    card.event = { title: usableSummary ? theme.name : reports[0].headline, latest_change: reports[0].headline,
      implications: usableSummary ? narrative.mechanism_steps : [], summary_status: usableSummary ? 'available' : 'reports_only',
      regions: [...new Set(theme.members.flatMap((m) => m.country ? [m.country] : []))],
      topics: [...new Set(theme.members.flatMap((m) => m.commodities || []))], reports,
      independent_stories: new Set(reports.map((r) => r.family)).size }
    cards.push(card)
    reports.forEach((r) => assigned.add(r.family))
  }
  const groups = new Map<string, FeedItem[]>()
  for (const item of feed) {
    const family = themeStoryFamilyKey(item)
    if (assigned.has(family) || !url(item.url) || Date.parse(iso(item.found_at || item.ts)) < cutoff) continue
    const broad = broadScopes.has(item.scope || '') || broadScopes.has(item.event_scope || '')
    if (!broad || item.band === 'drop') continue
    groups.set(family, [...(groups.get(family) || []), item])
  }
  for (const [family, items] of groups) {
    const reports = items.map((item): EventReport => ({ event_id: item.event_id, family, headline: item.headline_en || item.headline,
      at: iso(item.found_at || item.ts), publisher: item.source_name, url: url(item.url), time_basis: item.found_at ? 'source' : 'observed', stance: 'reported' }))
      .filter((r) => r.at).sort((a, b) => b.at.localeCompare(a.at))
    if (!reports.length) continue
    const card = shell('event', [`family:${family}`], {}, reports[0].at, Math.max(...items.map((i) => i.triage_score)))
    card.event = { title: reports[0].headline, latest_change: reports[0].headline, implications: [], summary_status: 'reports_only',
      regions: [...new Set(items.flatMap((i) => i.country ? [i.country] : []))],
      topics: [...new Set(items.flatMap((i) => [...(i.commodities || []), i.scope || ''].filter(Boolean)))],
      reports, independent_stories: 1 }
    cards.push(card)
  }
  return cards.sort((a, b) => b.priority - a.priority || b.updated_at.localeCompare(a.updated_at) || a.key.localeCompare(b.key))
}

export function readDiscoveryCatalog(root: string, archiveDir = ''): { cards: DiscoveryCard[]; notices: string[] } {
  let index: any = {}
  try { index = JSON.parse(fs.readFileSync(path.join(root, 'screener/board/index.json'), 'utf8')) } catch { /* canonical stores below remain authoritative */ }
  const projection = projectLiveIdeas(root, index)
  const themes = loadThemesLedger(root)
  const feed = readFeed(root, 7, { archiveDir, maxItems: 6000, preservePersistedDedupGroups: true })
  const families = new Map(feed.items.map((i) => [i.event_id, themeStoryFamilyKey(i)]))
  for (const t of themes.themes) for (const m of t.members) families.set(m.event_id, themeStoryFamilyKey(m))
  const cards = [...projection.ideas, ...projection.ideas_archive.rows].map((r) => discoveryIdea(r, families))
  const chain = buildSupplyChainBoard(root)
  for (const lead of chain.leads) {
    const card = shell('chain', [`chain:${lead.anchor_ticker}|${lead.listing || lead.name}|${lead.role}|${lead.path.map((p) => p.listing || p.name).join('>')}`],
      lead as unknown as Record<string, unknown>, iso(lead.anchor_decision_date), lead.lead_score)
    card.listings = { long: discoveryListing(lead.symbol || lead.listing, lead.exchange), short: null }
    cards.push(card)
  }
  cards.push(...buildDiscoveryEvents(themes.themes, feed.items))
  const notices: string[] = []
  if (projection.ideas_archive.health.status === 'degraded' || projection.ideas_archive.health.status === 'unreadable') notices.push('Some saved idea history could not be read.')
  if (projection.ideas_archive.retention.evicted_count) notices.push(`${projection.ideas_archive.retention.evicted_count} older automatically expired records are no longer stored. Manually archived cards are retained.`)
  if (chain.health.status === 'degraded') notices.push(chain.health.reason)
  if (!feed.items.length && !themes.themes.length) notices.push('No event reports are available from the saved news and story records yet.')
  return { cards, notices }
}

interface FilingAction {
  schema_version: 'idea-filing/v1'
  operation_id: string
  request_key?: string
  action: 'archive' | 'restore' | 'update'
  at: string
  card: DiscoveryCard
}

export function readFilingActions(root: string): FilingAction[] {
  let text: string
  try { text = fs.readFileSync(ledgerPath(root), 'utf8') } catch (e: any) { if (e.code === 'ENOENT') return []; throw e }
  return text.split('\n').filter(Boolean).map((line) => {
    const row = JSON.parse(line) as FilingAction
    if (row.schema_version !== 'idea-filing/v1' || !['archive', 'restore', 'update'].includes(row.action)
      || !iso(row.at) || !row.operation_id || !isDiscoveryCard(row.card)) throw new Error('Saved archive history is unreadable; filing actions are paused.')
    return row
  })
}

/** Fold manual decisions and snapshots, retaining the latest story even after source-store pruning. */
export function projectDiscovery(cards: DiscoveryCard[], actions: FilingAction[], nowMs = Date.now()): DiscoveryCard[] {
  const pinned = new Map<string, DiscoveryCard>()
  for (const action of actions) pinned.set(action.card.key, action.card)
  const candidates = [...pinned.values(), ...cards].map((card) => structuredClone(card))
  // A theme may unite several previously filed stories. Coalesce the whole connected component,
  // rather than updating the first matching card and leaving another copy active.
  const parents = candidates.map((_, i) => i)
  const find = (i: number): number => { while (parents[i] !== i) { parents[i] = parents[parents[i]]; i = parents[i] }; return i }
  const owners = new Map<string, number>()
  candidates.forEach((card, i) => {
    for (const alias of [...card.aliases, `card:${card.key}`]) {
      const key = `${card.kind}|${alias}`
      const prior = owners.get(key)
      if (prior !== undefined) parents[find(i)] = find(prior)
      else owners.set(key, i)
    }
  })
  // A source-bound unknown listing can acquire a venue without becoming a new story. Only bridge
  // when exactly one confirmed market exists; an unresolved symbol must never unite two listings.
  const transitions = new Map<string, { unknown: number[]; known: Map<string, number[]> }>()
  candidates.forEach((card, i) => {
    if (card.kind !== 'idea') return
    for (const alias of card.aliases) {
      const parts = alias.split('|')
      if (parts.length !== 5 || !/^(source|theme):/.test(parts[4])) continue
      const key = [parts[0], ...parts.slice(2)].join('|')
      const entry = transitions.get(key) || { unknown: [], known: new Map<string, number[]>() }
      const market = card.listings.long
      if (!market) entry.unknown.push(i)
      else entry.known.set(market, [...(entry.known.get(market) || []), i])
      transitions.set(key, entry)
    }
  })
  const bridges = new Map<number, Map<string, number>>()
  for (const { unknown, known } of transitions.values()) {
    for (const i of unknown) {
      const matches = bridges.get(find(i)) || new Map<string, number>()
      for (const [market, indices] of known) matches.set(market, indices[0])
      bridges.set(find(i), matches)
    }
  }
  for (const [i, matches] of bridges) {
    if (matches.size === 1) parents[find(i)] = find([...matches.values()][0])
  }
  const groups = new Map<number, DiscoveryCard[]>()
  candidates.forEach((card, i) => { const root = find(i); groups.set(root, [...(groups.get(root) || []), card]) })
  const merged: DiscoveryCard[] = []
  for (const group of groups.values()) {
    const aliases = [...new Set(group.flatMap((c) => [...c.aliases, `card:${c.key}`]))].sort()
    const keys = new Set(group.map((c) => c.key))
    const decisions = actions.filter((a) => keys.has(a.card.key) && a.action !== 'update')
    const decision = decisions[decisions.length - 1]
    // Newer source snapshots supersede earlier copies; at an equal clock prefer the current store.
    const card = group.reduce((a, b) => b.updated_at >= a.updated_at ? b : a)
    card.aliases = aliases
    if (decision) {
      card.key = decision.card.key
      card.action_revision = decision.card.action_revision
      card.archive_reason = decision.action === 'archive' ? 'manual' : null
      card.archived_at = decision.action === 'archive' ? decision.at : null
    }
    if (card.event) {
      const reports = [...new Map(group.flatMap((c) => c.event?.reports || []).map((r) => [r.event_id, r])).values()]
        .sort((a, b) => b.at.localeCompare(a.at))
      card.event = { ...card.event, reports, independent_stories: new Set(reports.map((r) => r.family)).size }
    }
    if (card.kind === 'idea') {
      const p = card.payload
      card.expired = p.status === 'expired' || (p.status !== 'promoted' && (!iso(p.decay_at) || Date.parse(String(p.decay_at)) <= nowMs))
      if (card.expired && card.archive_reason !== 'manual') {
        card.archive_reason = 'expired'
        card.archived_at = iso(p.decay_at) || card.updated_at
      }
      const live = cards.some((c) => !c.expired && c.kind === 'idea' && c.payload.idea_id === p.idea_id
        && c.payload.idea_version === p.idea_version && c.payload.idea_version_started_at === p.idea_version_started_at)
      if (!live || card.expired) card.payload = { ...p, promotion_available: false, recovery_only: true }
    }
    merged.push(card)
  }
  return merged
}

function appendAction(root: string, action: FilingAction): void {
  const fp = ledgerPath(root)
  const fd = fs.openSync(fp, 'a', 0o600)
  try { fs.writeSync(fd, `${JSON.stringify(action)}\n`); fs.fsyncSync(fd) } finally { fs.closeSync(fd) }
  if (process.platform !== 'win32') {
    const dir = fs.openSync(path.dirname(fp), 'r')
    try { fs.fsyncSync(dir) } finally { fs.closeSync(dir) }
  }
}

function locked<T>(root: string, fn: () => T): T {
  fs.mkdirSync(path.dirname(ledgerPath(root)), { recursive: true })
  const fd = acquireRetainedFlockSync(`${ledgerPath(root)}.lock`, { waitMs: 2000, pollMs: 10, busyMessage: 'Idea archive is busy. Please retry.' })
  try { return fn() } finally { releaseRetainedFlock(fd) }
}

export function fileDiscoveryCard(root: string, cards: DiscoveryCard[], request: { key: string; action: 'archive' | 'restore'; operation_id: string; expected_revision: string | null }): DiscoveryCard {
  return locked(root, () => {
    const actions = readFilingActions(root)
    const prior = actions.find((a) => a.operation_id === request.operation_id)
    if (prior) {
      if ((prior.request_key || prior.card.key) !== request.key || prior.action !== request.action) throw Object.assign(new Error('Filing request ID was already used.'), { statusCode: 409 })
      return prior.card
    }
    const current = projectDiscovery(cards, actions).find((c) => c.key === request.key || c.aliases.includes(`card:${request.key}`))
    if (!current) throw Object.assign(new Error('This card changed. Refresh the board and try again.'), { statusCode: 404 })
    if (current.action_revision !== request.expected_revision) throw Object.assign(new Error('This card was changed in another window. Refresh and retry.'), { statusCode: 409 })
    if (request.action === 'restore' && current.archive_reason !== 'manual') throw Object.assign(new Error('Only manually archived cards can be restored.'), { statusCode: 409 })
    const at = new Date().toISOString()
    const card = { ...current, action_revision: request.operation_id,
      archived_at: request.action === 'archive' ? at : current.expired ? iso(current.payload.decay_at) || at : null,
      archive_reason: request.action === 'archive' ? 'manual' as const : current.expired ? 'expired' as const : null }
    appendAction(root, { schema_version: 'idea-filing/v1', operation_id: request.operation_id, request_key: request.key, action: request.action, at, card })
    return card
  })
}

/** Called by the existing scan lifecycle, not by GET: pin new evidence before rolling stores evict it. */
export function refreshFiledDiscovery(root: string, source: DiscoveryCard[] | (() => DiscoveryCard[])): number {
  if (!fs.existsSync(ledgerPath(root))) return 0
  return locked(root, () => {
    const actions = readFilingActions(root)
    const before = [...new Map(actions.map((action) => [action.card.key, action.card])).values()]
    const after = projectDiscovery(typeof source === 'function' ? source() : source, actions)
    let written = 0
    for (const next of after) {
      const prior = before.find((c) => c.key === next.key)
      if (!prior || JSON.stringify(next) === JSON.stringify(prior)) continue
      appendAction(root, { schema_version: 'idea-filing/v1', operation_id: `update-${hash(JSON.stringify(next))}`, action: 'update', at: new Date().toISOString(), card: next })
      written++
    }
    return written
  })
}

export function discoveryPage(cards: DiscoveryCard[], lane: IdeaLane, hiddenMarkets: string[], kind: string, cursor: number, notices: string[] = []): DiscoveryPage {
  const laneRows = cards.filter((c) => lane === 'archives' ? c.archive_reason !== null && (kind === 'all' || c.kind === kind)
    : c.archive_reason === null && (lane === 'events' ? c.kind === 'event' : lane === 'chain' ? c.kind === 'chain' : c.kind === 'idea' && c.sides.includes(lane)))
  const rows = laneRows.filter((c) => {
    if (c.kind === 'event') return true
    const markets = lane === 'short' ? [c.listings.short] : lane === 'long' || c.kind === 'chain' ? [c.listings.long]
      : c.sides.map((side) => c.listings[side])
    return markets.some((market) => !market || !hiddenMarkets.includes(market))
  }).sort((a, b) => lane === 'archives' ? String(b.archived_at).localeCompare(String(a.archived_at)) || a.key.localeCompare(b.key)
    : lane === 'events' ? b.priority - a.priority || b.updated_at.localeCompare(a.updated_at) || a.key.localeCompare(b.key)
      : b.updated_at.localeCompare(a.updated_at) || a.key.localeCompare(b.key))
  return { schema_version: 'ideas-workspace/v1', rows: rows.slice(cursor, cursor + 30), total: rows.length, hidden: laneRows.length - rows.length,
    next_cursor: cursor + 30 < rows.length ? String(cursor + 30) : null, notices, projected_at: new Date().toISOString() }
}

export function registerIdeasWorkspace(app: FastifyInstance, root: string, archiveDir = '', onMutation: () => void = () => {}): void {
  let cached: { until: number; value: ReturnType<typeof readDiscoveryCatalog> } | null = null
  const catalog = () => {
    if (!cached || cached.until <= Date.now()) cached = { until: Date.now() + 30_000, value: readDiscoveryCatalog(root, archiveDir) }
    return cached.value
  }
  const query = z.object({ lane: z.enum(['long', 'events', 'short', 'chain', 'archives']).default('events'),
    hide: z.string().default('HK,IN'), kind: z.enum(['all', 'idea', 'event', 'chain']).default('all'),
    refresh: z.enum(['0', '1']).default('0'), cursor: z.coerce.number().int().min(0).max(1_000_000).default(0) })
  const mutation = z.object({ key: z.string().regex(/^(idea|event|chain)-[a-f0-9]{24}$/), action: z.enum(['archive', 'restore']),
    operation_id: z.string().uuid(), expected_revision: z.string().max(100).nullable() }).strict()
  app.get('/api/screener/idea-workspace', { config: { rateLimit: { max: 120, timeWindow: '1 minute' } } }, async (req, reply) => {
    const parsed = query.safeParse(req.query)
    if (!parsed.success) return reply.code(400).send({ error: 'Invalid Ideas filters.' })
    if (parsed.data.refresh === '1') cached = null
    const { cards, notices } = catalog()
    const { lane, hide, kind, cursor } = parsed.data
    return discoveryPage(projectDiscovery(cards, readFilingActions(root)), lane, hide.split(',').filter((m) => m === 'HK' || m === 'IN'), kind, cursor, notices)
  })
  app.post('/api/screener/idea-workspace/actions', { config: { rateLimit: { max: 120, timeWindow: '1 minute' } } }, async (req, reply) => {
    const parsed = mutation.safeParse(req.body)
    if (!parsed.success) return reply.code(400).send({ error: 'Invalid filing action.' })
    const { cards } = catalog()
    onMutation()
    const card = fileDiscoveryCard(root, cards, parsed.data)
    return { card }
  })
}
