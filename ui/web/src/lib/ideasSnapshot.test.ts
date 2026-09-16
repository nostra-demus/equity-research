import assert from 'node:assert/strict'
import { ideasSnapshotPage } from './ideasSnapshot'
import { isDiscoveryPage } from '../../../shared/ideas-workspace'
import type { ScreenerBoard } from './types'
import { discoveryIdea } from '../../../server/src/news/ideas/ideas-identity'
import { projectDiscovery } from '../../../shared/discovery-projection'
import type { FilingAction, DiscoveryCard } from '../../../shared/ideas-workspace'

const now = new Date().toISOString()
const board = { ideas: [{ idea_id: 'IDEA-static', ticker: 'STATIC', exchange: 'NYSE', direction: 'long',
  updated_at: now, decay_at: new Date(Date.now() + 86_400_000).toISOString(), status: 'live', thesis_type: 'company_specific',
  source_event_ids: ['EVT-static'], source_headlines: ['Saved report'], trade_score: 50 }], ideas_archive: { rows: [] } } as unknown as ScreenerBoard
const page = await ideasSnapshotPage(board, 'long', 'HK,IN', 'all', '0')
assert.equal(page.rows.length, 1)
assert.equal(page.rows[0].payload.promotion_available, false)
assert.ok(isDiscoveryPage(page))
assert.equal((await ideasSnapshotPage(board, 'events', 'HK,IN', 'all', '0')).rows.length, 0)
assert.match(page.notices[0], /Read-only/)
assert.equal(isDiscoveryPage({ ...page, notices: undefined }), false)
assert.equal(isDiscoveryPage({ ...page, rows: [{ ...page.rows[0], payload: {} }] }), false)
for (const invalid of [{ reason: {} }, { pair_with: {} }, { prior_coverage: { has_run: true, latest_decision: {} } }, { source_themes: [null] }]) {
  assert.equal(isDiscoveryPage({ ...page, rows: [{ ...page.rows[0], payload: { ...page.rows[0].payload, ...invalid } }] }), false)
}
assert.equal(isDiscoveryPage({ ...page, schema_version: 'future' }), false)
const live = discoveryIdea(board.ideas![0])
const archived = { ...live, archive_reason: 'manual' as const, archived_at: now, action_revision: 'saved' }
const action: FilingAction = { schema_version: 'idea-filing/v1', operation_id: 'saved', action: 'archive', at: now, card: archived }
const saved = { schema_version: 'ideas-workspace-snapshot/v1', cards: projectDiscovery([live], [action]), generated_at: now }
assert.equal((await ideasSnapshotPage(board, 'long', '', 'all', '0', saved)).total, 0)
assert.equal((await ideasSnapshotPage(board, 'archives', '', 'all', '0', saved)).rows[0].archive_reason, 'manual')
const savedEvent: DiscoveryCard = { ...archived, key: `event-${'1'.repeat(24)}`, kind: 'event', sides: [], aliases: ['family:event'], payload: {},
  event: { title: 'A reported event', latest_change: 'A new development', implications: [], summary_status: 'reports_only', regions: ['IN'], topics: ['oil'], independent_stories: 1,
    reports: [{ event_id: 'EVT-saved', family: 'saved', headline: 'A report', publisher: 'Publisher', url: 'https://example.test/report', at: now, time_basis: 'source', stance: 'reported' }] } }
saved.cards.push(savedEvent)
assert.equal((await ideasSnapshotPage(board, 'archives', 'IN,HK', 'event', '0', saved)).total, 1, 'archived events survive source pruning and market exclusions')
const restored = { ...action, action: 'restore' as const, operation_id: 'restore', card: { ...archived, action_revision: 'restore' } }
const expired = { ...live, payload: { ...live.payload, decay_at: '2000-01-01T00:00:00Z' } }
saved.cards = projectDiscovery([expired], [action, restored])
assert.equal((await ideasSnapshotPage(board, 'long', '', 'all', '0', saved)).total, 0, 'restored expired evidence stays expired in static mode')
await assert.rejects(() => ideasSnapshotPage(board, 'long', '', 'all', '0', { ...saved, cards: [{}] }), /could not be read/)
console.log('Static Ideas retain company snapshots; malformed pages fail before rendering')
