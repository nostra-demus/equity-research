import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { projectLiveIdeas } from '../src/news/ideas/ideas-projection'
import { countIdeaSnapshots } from '../src/news/ideas/ideas-health'
import { ideaId, readIdeaSnapshotStore } from '../src/news/ideas/ideas-store'
import { eventIdFor } from '../src/news/normalize'
import { validIdeaSnapshot } from './ideas-fixture'

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ideas-projection-'))
const dir = path.join(root, 'screener', 'ledger', 'ideas')
fs.mkdirSync(dir, { recursive: true })

try {
  const now = Date.parse('2026-08-03T07:00:00Z')
  const liveId = ideaId('LIVE', 'long')
  const oldId = ideaId('OLD', 'long')
  const noExpiryId = ideaId('NOEXP', 'long')
  // Neither idea exists in the generated index: the live snapshot projection must still surface both.
  const liveBase = validIdeaSnapshot('LIVE')
  const liveExpressionHeadline = 'LIVE issuer filing proves the named expression'
  const liveExpressionUrl = 'https://exchange.test/live-expression'
  const liveExpressionEventId = eventIdFor(liveExpressionHeadline, liveExpressionUrl)
  const liveTheme = {
    theme_id: 'THM-a1b2c3d4', theme_rev: 6,
    evidence_event_ids: [liveBase.source_event_ids[0], liveExpressionEventId],
    why_now_event_id: liveBase.source_event_ids[0],
  }
  fs.writeFileSync(path.join(dir, `${liveId}.json`), JSON.stringify(validIdeaSnapshot('LIVE', 'long', {
    decay_at: '2026-08-03T08:00:00Z', origin_type: 'mixed',
    source_event_ids: [liveBase.source_event_ids[0], liveExpressionEventId],
    source_headlines: [liveBase.source_headlines[0], liveExpressionHeadline],
    source_themes: [liveTheme],
  })))
  fs.writeFileSync(path.join(dir, `${oldId}.json`), JSON.stringify(validIdeaSnapshot('OLD', 'long', {
    decay_at: '2026-08-03T06:30:00Z',
    status: 'promoted', promoted_signal_id: 'SIG-old', trade_score: 99,
  })))
  // Parseable but unsafe snapshots are excluded entirely and degrade store health.
  fs.writeFileSync(path.join(dir, 'bad-id.json'), JSON.stringify(validIdeaSnapshot('BAD')))
  fs.writeFileSync(path.join(dir, `${noExpiryId}.json`), JSON.stringify(validIdeaSnapshot('NOEXP', 'long', { decay_at: 'not-a-date' })))
  fs.writeFileSync(path.join(dir, 'corrupt.json'), '{')
  fs.writeFileSync(path.join(root, 'screener', 'ledger', 'ideas_feedback.ndjson'), [
    JSON.stringify({ idea_id: liveId, polarity: 'up' }),
    '{bad row',
    JSON.stringify({ idea_id: liveId, polarity: 'clear' }),
    JSON.stringify({ idea_id: oldId, polarity: 'down' }),
  ].join('\n'))

  const projected = projectLiveIdeas(root, {
    ideas: [{ idea_id: oldId, stale: false }], // stale cache says OLD is live and omits LIVE
    signals: [{ signal_id: 'SIG-old', status: 'provisional' }],
    theses: [],
  }, now)

  assert.deepEqual(projected.ideas.map((x: any) => x.ticker), ['LIVE', 'OLD'])
  assert.equal((projected.ideas[0] as any).stale, false)
  assert.equal((projected.ideas[1] as any).stale, true, 'decay is recomputed at API read time')
  assert.equal((projected.ideas[0] as any).feedback, null, 'latest clear vote wins')
  assert.equal((projected.ideas[1] as any).feedback, 'down')
  assert.equal((projected.ideas[0] as any).origin_type, 'mixed')
  assert.deepEqual((projected.ideas[0] as any).source_themes, [liveTheme])
  assert.equal((projected.ideas[1] as any).origin_type, 'wire', 'current wire snapshots keep their explicit lineage')
  assert.deepEqual((projected.ideas[1] as any).source_themes, [])
  assert.deepEqual(projected.scorecard, {
    surfaced_total: 2,
    live_count: 1,
    promoted_total: 1,
    machine_confirmed: 1,
    machine_passed: 0,
    machine_pending: 0,
    resolved: 1,
    up_votes: 0,
    down_votes: 1,
  })
  assert.deepEqual(countIdeaSnapshots(root, now), { live_count: 1, stale_count: 1 }, 'health and cards use the same validity/expiry rule')
  const store = readIdeaSnapshotStore(root)
  assert.equal(store.status, 'degraded')
  assert.equal(store.invalid_count, 2, 'filename mismatch and malformed RFC3339 are persisted-store failures')
  assert.equal(store.corrupt_count, 1)

  console.log('ideas projection: strict snapshots, dynamic expiry, feedback, and grades passed')
} finally {
  fs.rmSync(root, { recursive: true, force: true })
}
