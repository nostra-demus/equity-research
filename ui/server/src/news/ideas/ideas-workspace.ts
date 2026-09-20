import { isDiscoveryCard } from '../../../../shared/ideas-workspace'
import { isMainThread } from 'node:worker_threads'
import { runDiscoveryInWorker } from './ideas-worker'
import { projectDiscovery, discoveryPage } from '../../../../shared/discovery-projection'
export { projectDiscovery, discoveryPage } from '../../../../shared/discovery-projection'
import { discoveryIdea, shell } from './ideas-identity'
export { discoveryIdea } from './ideas-identity'
// Research selection over existing canonical news, themes, lead snapshots and relationship exports.
// Human filing decisions use a separate append-only ledger: a refresh cannot undo an archive, and
// archive snapshots are never subject to the automatic expired-lead eviction policy.
import fs from 'node:fs'
import path from 'node:path'
import { createHash } from 'node:crypto'
import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import type { DiscoveryCard, EventReport, FilingAction } from '../../../../shared/ideas-workspace'
import { discoveryListing } from '../../../../shared/listing-market'
export { discoveryListing } from '../../../../shared/listing-market'
import { readFeed } from '../feed'
import type { FeedItem } from '../types'
import { loadThemesLedger } from '../themes/store'
import type { Theme } from '../themes/types'
import { themeStoryFamilyKey } from '../themes/story-key'
import { projectLiveIdeas } from './ideas-projection'
import { repositoryMutationLockPath } from './ideas-store'
import { buildSupplyChainBoard } from '../../supply-chain'
import { acquireRetainedFlock, releaseRetainedFlock } from '../../singleton-lock'

const hash = (s: string) => createHash('sha256').update(s).digest('hex').slice(0, 24)
const iso = (s: unknown) => typeof s === 'string' && Number.isFinite(Date.parse(s)) ? new Date(s).toISOString() : ''
const url = (s: unknown) => typeof s === 'string' && /^https?:\/\//i.test(s) ? s : ''
const ledgerPath = (root: string) => path.join(root, 'screener/ledger/idea-workspace-actions.ndjson')
const broadScopes = new Set(['sector', 'macro', 'commodity', 'policy', 'geopolitical', 'regulatory'])



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
    const peakMemberScore = Math.max(0, ...theme.members.map((m) => m.score))
    const corroborationBonus = Math.min(10, (new Set(reports.map((r) => r.family)).size - 1) * 3)
    const actionableBonus = usableSummary ? 5 : 0
    const eventPriority = Math.min(100, peakMemberScore + corroborationBonus + actionableBonus)
    const aliases = [`theme:${theme.theme_id}`, ...reports.map((r) => `family:${r.family}`)]
    const card = shell('event', aliases, {}, reports[0].at, eventPriority)
    card.event = { title: usableSummary ? theme.name : reports[0].headline, latest_change: reports[0].headline,
      implications: usableSummary ? narrative.mechanism_steps : [], summary_status: usableSummary ? 'available' : 'reports_only',
      regions: [...new Set(theme.members.flatMap((m) => m.country ? [m.country] : []))],
      topics: [...new Set(theme.members.flatMap((m) => m.commodities || []))], reports,
      independent_stories: new Set(reports.map((r) => r.family)).size }
    cards.push(card)
    reports.forEach((r) => assigned.add(r.family))
  }
  // Inject cross-theme aliases so projectDiscovery's union-find merges cards for the same real-world
  // event. Only 'related' links (same directional thesis) are merged; 'opposite' links stay separate.
  const themeToCard = new Map<string, DiscoveryCard>()
  for (const card of cards) {
    for (const alias of card.aliases) {
      if (alias.startsWith('theme:')) themeToCard.set(alias.slice(6), card)
    }
  }
  for (const theme of themes) {
    if (theme.status !== 'live') continue
    const card = themeToCard.get(theme.theme_id)
    if (!card) continue
    for (const rel of theme.related_themes || []) {
      if (rel.kind !== 'related') continue
      const peer = themeToCard.get(rel.theme_id)
      if (!peer) continue
      // Deterministic shared alias: sort the two theme_ids so the alias is identical from both sides.
      const pair = [theme.theme_id, rel.theme_id].sort().join('+')
      const shared = `related:${pair}`
      if (!card.aliases.includes(shared)) card.aliases.push(shared)
      if (!peer.aliases.includes(shared)) peer.aliases.push(shared)
    }
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


export async function readFilingActions(root: string): Promise<FilingAction[]> {
  let text: string
  try { text = await fs.promises.readFile(ledgerPath(root), 'utf8') } catch (e: any) { if (e.code === 'ENOENT') return []; throw e }
  return text.split('\n').filter(Boolean).map((line) => {
    const row = JSON.parse(line) as FilingAction
    if (row.schema_version !== 'idea-filing/v1' || !['archive', 'restore', 'update'].includes(row.action)
      || !iso(row.at) || !row.operation_id || !isDiscoveryCard(row.card)) throw new Error('Saved archive history is unreadable; filing actions are paused.')
    return row
  })
}

async function appendActions(root: string, actions: FilingAction | FilingAction[]): Promise<void> {
  const arr = Array.isArray(actions) ? actions : [actions]
  if (!arr.length) return
  const fp = ledgerPath(root)
  const fd = await fs.promises.open(fp, 'a', 0o600)
  try {
    for (const action of arr) await fd.writeFile(`${JSON.stringify(action)}\n`)
    await fd.sync()
  } finally { await fd.close() }
  if (process.platform !== 'win32') {
    const dir = await fs.promises.open(path.dirname(fp), 'r')
    try { await dir.sync() } finally { await dir.close() }
  }
}

async function locked<T>(root: string, fn: () => Promise<T>, mode: 'exclusive' | 'shared' = 'exclusive'): Promise<T> {
  const repositoryLock = repositoryMutationLockPath(root)
  const repositoryFd = repositoryLock === null ? null : await acquireRetainedFlock(repositoryLock, {
    waitMs: 2000, pollMs: 10, mode, busyMessage: 'Repository update in progress. Please retry.',
  })
  try {
    await fs.promises.mkdir(path.dirname(ledgerPath(root)), { recursive: true })
    const fd = await acquireRetainedFlock(`${ledgerPath(root)}.lock`, { waitMs: 2000, pollMs: 10, mode, busyMessage: 'Idea archive is busy. Please retry.' })
    try { return await fn() } finally { releaseRetainedFlock(fd) }
  } finally { if (repositoryFd !== null) releaseRetainedFlock(repositoryFd) }
}

export async function fileDiscoveryCard(root: string, cards: DiscoveryCard[], request: { key: string; action: 'archive' | 'restore'; operation_id: string; expected_revision: string | null }): Promise<DiscoveryCard> {
  if (isMainThread) return runDiscoveryInWorker('fileDiscoveryCard', [root, cards, request])
  return locked(root, async () => {
    const actions = await readFilingActions(root)
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
    await appendActions(root, { schema_version: 'idea-filing/v1', operation_id: request.operation_id, request_key: request.key, action: request.action, at, card })
    return card
  })
}

/** Called by the existing scan lifecycle, not by GET: pin new evidence before rolling stores evict it. */
export async function refreshFiledDiscovery(root: string, source: DiscoveryCard[] | (() => DiscoveryCard[])): Promise<number> {
  if (!fs.existsSync(ledgerPath(root))) return 0
  if (isMainThread) return runDiscoveryInWorker('refreshFiledDiscovery', [root, typeof source === 'function' ? source() : source])
  return locked(root, async () => {
    const actions = await readFilingActions(root)
    const before = [...new Map(actions.map((action) => [action.card.key, action.card])).values()]
    const after = projectDiscovery(typeof source === 'function' ? source() : source, actions)
    const newActions: FilingAction[] = []
    for (const next of after) {
      const prior = before.find((c) => c.key === next.key)
      if (!prior || JSON.stringify(next) === JSON.stringify(prior)) continue
      newActions.push({ schema_version: 'idea-filing/v1', operation_id: `update-${hash(JSON.stringify(next))}`, action: 'update', at: new Date().toISOString(), card: next })
    }
    await appendActions(root, newActions)
    return newActions.length
  })
}


/** Catalog and filing decisions form one snapshot. Acquire the shared repository lease before either
 * read, on the worker's event loop so a synchronous writer cannot strand the reader's retained lease. */
export async function readDiscoverySnapshotSafely(root: string, archiveDir = ''): Promise<{
  catalog: ReturnType<typeof readDiscoveryCatalog>; actions: FilingAction[]; at: string
}> {
  if (isMainThread) return runDiscoveryInWorker('readDiscoverySnapshotSafely', [root, archiveDir])
  return locked(root, async () => ({ catalog: readDiscoveryCatalog(root, archiveDir),
    actions: await readFilingActions(root), at: new Date().toISOString() }), 'shared')
}

export function registerIdeasWorkspace(app: FastifyInstance, root: string, archiveDir = '', onMutation: () => void = () => {}): void {
  let cached: { until: number; value: ReturnType<typeof readDiscoveryCatalog> } | null = null
  let verified: { catalog: ReturnType<typeof readDiscoveryCatalog>; actions: FilingAction[]; at: string } | null = null
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
    const { lane, hide, kind, cursor } = parsed.data
    let snapshot: NonNullable<typeof verified>
    let busy = false
    try {
      snapshot = await readDiscoverySnapshotSafely(root, archiveDir)
      verified = snapshot
    } catch (error: any) {
      // Publication/deploy leases are temporary unavailability, not corruption. Only a previously
      // verified catalog AND filing ledger may be served; never invent an empty archive on a cold read.
      if (error?.code !== 'EBUSY') { verified = null; throw error }
      if (!verified) return reply.code(503).header('Retry-After', '2').send({ code: 'EBUSY',
        message: 'A saved-data update is in progress. Please retry shortly.' })
      snapshot = verified
      busy = true
    }
    const { cards, notices } = snapshot.catalog
    reply.header('Cache-Control', 'no-store')
    return discoveryPage(projectDiscovery(cards, snapshot.actions), lane, hide.split(',').filter((m) => m === 'HK' || m === 'IN'), kind, cursor,
      busy ? [...notices, `A saved-data update is in progress. Showing the last verified cards from ${snapshot.at}; this view refreshes automatically.`] : notices)
  })
  app.post('/api/screener/idea-workspace/actions', { config: { rateLimit: { max: 120, timeWindow: '1 minute' } } }, async (req, reply) => {
    const parsed = mutation.safeParse(req.body)
    if (!parsed.success) return reply.code(400).send({ error: 'Invalid filing action.' })
    const { cards } = catalog()
    onMutation()
    try {
      const card = await fileDiscoveryCard(root, cards, parsed.data)
      // A later busy read must not resurrect the pre-mutation filing state.
      verified = null
      return { card }
    } catch (error: any) {
      verified = null // a failed fsync may follow an append; discard all pre-attempt filing state
      if (error?.code !== 'EBUSY') throw error
      return reply.code(503).header('Retry-After', '2').send({ code: 'EBUSY',
        message: 'A saved-data update is in progress. Your archive change was not saved; please retry shortly.' })
    }
  })
}
