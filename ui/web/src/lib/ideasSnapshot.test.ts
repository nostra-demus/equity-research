import assert from 'node:assert/strict'
import { ideasSnapshotPage } from './ideasSnapshot'
import { isDiscoveryPage } from '../../../shared/ideas-workspace'
import type { ScreenerBoard } from './types'

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
assert.equal(isDiscoveryPage({ ...page, schema_version: 'future' }), false)
console.log('Static Ideas retain company snapshots; malformed pages fail before rendering')
