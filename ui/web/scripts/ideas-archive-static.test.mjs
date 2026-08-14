import assert from 'node:assert/strict'
import { emptyIdeasArchive, normalizeStaticBoardArchive, validIdeasArchive } from './ideas-archive-static.mjs'

const archive = emptyIdeasArchive('ok')
const row = {
  idea_id: 'IDEA-123456789abc', idea_version: 'IDEAV-1234567890abcdef',
  idea_version_started_at: '2026-08-01T00:00:00Z', ticker: 'TEST', direction: 'long', pair_with: null,
  decay_at: '2026-08-02T00:00:00Z', status: 'expired', promoted_signal_id: null, stale: true,
  archived_at: '2026-08-03T00:00:00Z', archive_reason: 'historical_board_expired', audit_only: true,
  recovery_only: true, promotion_available: false,
}
archive.rows = [row]
archive.total_count = archive.shown_count = 1
archive.side_counts.long = { total_count: 1, shown_count: 1, hidden_count: 0 }
assert.equal(validIdeasArchive(archive), true)
assert.equal(normalizeStaticBoardArchive({ ideas_archive: archive }).ideas_archive, archive)

const duplicate = { ...archive, rows: [row, { ...row }], total_count: 2, shown_count: 2,
  side_counts: { ...archive.side_counts, long: { total_count: 2, shown_count: 2, hidden_count: 0 } } }
assert.equal(validIdeasArchive(duplicate), false)
assert.deepEqual(normalizeStaticBoardArchive({ ideas_archive: duplicate }).ideas_archive,
  emptyIdeasArchive('unreadable', 'static_archive_payload_invalid'))
assert.deepEqual(normalizeStaticBoardArchive({}).ideas_archive, emptyIdeasArchive('missing'))

const badCounts = { ...archive, hidden_count: 1 }
assert.equal(validIdeasArchive(badCounts), false)
console.log('ideas-archive-static: ALL OK')
