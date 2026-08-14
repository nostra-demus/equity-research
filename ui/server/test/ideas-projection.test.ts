import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { projectLiveIdeas } from '../src/news/ideas/ideas-projection'
import { countIdeaSnapshots } from '../src/news/ideas/ideas-health'
import { ideaId, pruneExpiredIdeas, readIdeaArchiveStore, readIdeaSnapshotStore, recoverBoardIdeaOccurrence, writeIdea, type ImportedIdeaArchive } from '../src/news/ideas/ideas-store'
import { canonicalJsonText } from '../src/canonical-json'
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
  const staleId = ideaId('STALE', 'long')
  const prunedId = ideaId('PRUNED', 'short')
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
    trade_score: 99, trade_readiness: 'check_now', trade_score_basis: 'evidence_gate_v1',
    source_event_ids: [liveBase.source_event_ids[0], liveExpressionEventId],
    source_headlines: [liveBase.source_headlines[0], liveExpressionHeadline],
    source_themes: [liveTheme],
  })))
  fs.writeFileSync(path.join(dir, `${oldId}.json`), JSON.stringify(validIdeaSnapshot('OLD', 'long', {
    decay_at: '2026-08-03T06:30:00Z',
    status: 'promoted', promoted_signal_id: 'SIG-old', trade_score: 99,
  })))
  fs.writeFileSync(path.join(dir, `${staleId}.json`), JSON.stringify(validIdeaSnapshot('STALE', 'long', {
    decay_at: '2026-08-03T06:30:00Z',
  })))
  fs.writeFileSync(path.join(dir, `${prunedId}.json`), JSON.stringify(validIdeaSnapshot('PRUNED', 'short', {
    decay_at: '2026-08-03T05:30:00Z',
  })))
  const recoveredPrior = {
    ...validIdeaSnapshot('LIVE', 'long', {
      reason: 'An older recovered thesis for the same stable ticker and side',
      idea_version_started_at: '2026-08-03T04:30:00Z', updated_at: '2026-08-03T04:45:00Z',
      decay_at: '2026-08-03T08:30:00Z',
    }),
    stale: false,
  }
  const recovery: ImportedIdeaArchive = {
    schema_version: 'idea-board-recovery/v1', recovered_at: '2026-08-03T06:45:00Z',
    recovery_reason: 'latest_board_current',
    provenance: {
      source_path: 'screener/board/index.json', source_commit: 'a'.repeat(40),
      board_generated_at: '2026-08-03T06:45:00Z',
      source_row_sha256: createHash('sha256').update(canonicalJsonText(recoveredPrior)).digest('hex'),
    },
    board_row: recoveredPrior,
  }
  assert.equal(recoverBoardIdeaOccurrence(root, recovery), 'created')
  assert.equal(pruneExpiredIdeas(root, now, 60 * 60_000), 1, 'only the lead beyond the extra TTL is archived and pruned')
  const historyManifestPath = path.join(root, 'screener', 'ledger', 'ideas_archive', 'board-history-recovery-manifest.json')
  const historyOccurrence = (suffix: string, direction: 'long' | 'short' | 'pair', decision = 'skipped', reason = 'no_committed_expiry_evidence') => ({
    idea_id: `IDEA-${suffix.repeat(12).slice(0, 12)}`,
    idea_version: `IDEAV-${suffix.repeat(16).slice(0, 16)}`,
    idea_version_started_at: '2026-08-01T00:00:00Z',
    direction, decision, reason,
  })
  fs.writeFileSync(historyManifestPath, JSON.stringify({
    schema_version: 'idea-board-recovery-manifest/v1',
    source_path: 'screener/board/index.json',
    occurrences: [
      historyOccurrence('a', 'long'), historyOccurrence('b', 'short'), historyOccurrence('c', 'pair'),
      historyOccurrence('d', 'long', 'imported', 'historical_board_expired'),
    ],
  }))
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

  assert.deepEqual(projected.ideas.map((x: any) => x.ticker), ['LIVE', 'STALE', 'OLD'])
  assert.equal(projected.ideas.filter((x: any) => x.idea_id === liveId).length, 1,
    'a newer canonical occurrence shadows recovered-current history for the stable id')
  assert.equal(projected.ideas_archive.rows.some((x: any) => x.reason === recoveredPrior.reason), false,
    'an unexpired superseded recovery is hidden, not dishonestly labelled expired')
  assert.equal((projected.ideas[0] as any).stale, false)
  assert.equal((projected.ideas[1] as any).stale, true, 'decay is recomputed at API read time')
  assert.equal((projected.ideas[0] as any).feedback, null, 'latest clear vote wins')
  assert.equal((projected.ideas[2] as any).feedback, 'down')
  assert.equal((projected.ideas[0] as any).origin_type, 'mixed')
  assert.equal((projected.ideas[0] as any).trade_score, 44, 'legacy V1 scores are not comparable with the stricter V2 ranking ceiling')
  assert.equal((projected.ideas[0] as any).trade_readiness, 'watch_only', 'a cached V1 check_now can never survive a rolling deploy')
  assert.ok((projected.ideas[0] as any).missing_checks.includes('live price, liquidity, and consensus'))
  assert.deepEqual((projected.ideas[0] as any).source_themes, [liveTheme])
  assert.equal((projected.ideas[2] as any).origin_type, 'wire', 'current wire snapshots keep their explicit lineage')
  assert.deepEqual((projected.ideas[2] as any).source_themes, [])
  assert.deepEqual(projected.ideas_archive.rows.map((x: any) => [x.ticker, x.archive_reason]), [
    ['STALE', 'expired'], ['PRUNED', 'expired_pruned'],
  ])
  assert.deepEqual(projected.ideas_archive.side_counts, {
    long: { total_count: 1, shown_count: 1, hidden_count: 0 },
    short: { total_count: 1, shown_count: 1, hidden_count: 0 },
  })
  assert.deepEqual(projected.ideas_archive.unconfirmed_counts, { long: 2, short: 2 },
    'unconfirmed history counts skipped long/short rows and counts a pair in both tabs')
  assert.equal(projected.ideas_archive.health.status, 'ok')
  assert.deepEqual(projected.scorecard, {
    surfaced_total: 5, // four visible retained occurrences plus one known superseded recovery occurrence
    live_count: 1,
    promoted_total: 1,
    machine_confirmed: 1,
    machine_passed: 0,
    machine_pending: 0,
    resolved: 1,
    up_votes: 0,
    down_votes: 1,
  })
  assert.deepEqual(countIdeaSnapshots(root, now), { live_count: 1, stale_count: 2 }, 'health and cards use the same validity/expiry rule')
  const store = readIdeaSnapshotStore(root)
  assert.equal(store.status, 'degraded')
  assert.equal(store.invalid_count, 2, 'filename mismatch and malformed RFC3339 are persisted-store failures')
  assert.equal(store.corrupt_count, 1)

  fs.writeFileSync(historyManifestPath, '{')
  assert.equal('unconfirmed_counts' in projectLiveIdeas(root, {}, now).ideas_archive, false,
    'a malformed recovery manifest is unknown, never a false zero count')

  console.log('ideas projection: strict snapshots, dynamic expiry, feedback, and grades passed')
} finally {
  fs.rmSync(root, { recursive: true, force: true })
}

const pendingWithdrawalRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ideas-pending-withdrawal-'))
try {
  const now = Date.parse('2026-08-03T07:00:00Z')
  const recoveredRow = { ...validIdeaSnapshot('PENDING', 'long', {
    decay_at: '2026-08-03T08:30:00Z',
  }), stale: false }
  const recovery: ImportedIdeaArchive = {
    schema_version: 'idea-board-recovery/v1', recovered_at: '2026-08-03T06:45:00Z',
    recovery_reason: 'latest_board_current',
    provenance: {
      source_path: 'screener/board/index.json', source_commit: 'c'.repeat(40),
      board_generated_at: '2026-08-03T06:45:00Z',
      source_row_sha256: createHash('sha256').update(canonicalJsonText(recoveredRow)).digest('hex'),
    },
    board_row: recoveredRow,
  }
  assert.equal(recoverBoardIdeaOccurrence(pendingWithdrawalRoot, recovery), 'created')
  const archiveDir = path.join(pendingWithdrawalRoot, 'screener', 'ledger', 'ideas_archive')
  const importedName = fs.readdirSync(archiveDir).find((name) => name.endsWith('--imported.json'))!
  const withdrawnName = importedName.replace(/--imported\.json$/, '--withdrawn.json')
  const withdrawnPath = path.join(archiveDir, withdrawnName)
  fs.writeFileSync(withdrawnPath, JSON.stringify({
    schema_version: 'idea-archive-suppression/v1',
    idea_id: recoveredRow.idea_id, idea_version: recoveredRow.idea_version,
    idea_version_started_at: recoveredRow.idea_version_started_at,
    direction: recoveredRow.direction, pair_with: recoveredRow.pair_with,
    suppressed_at: '2026-08-03T06:50:00Z', suppression_reason: 'withdrawn_unadmitted',
  }))
  const retentionPath = path.join(archiveDir, 'retention.json')
  const retention = JSON.parse(fs.readFileSync(retentionPath, 'utf8'))
  fs.writeFileSync(retentionPath, JSON.stringify({ ...retention, pending_evictions: [withdrawnName] }))

  const store = readIdeaArchiveStore(pendingWithdrawalRoot)
  assert.equal(store.status, 'degraded', 'a pending withdrawal makes retention invalid instead of hiding the barrier')
  assert.equal(store.suppression_count, 1)
  assert.equal(store.imports.length, 0, 'the exact recovery import remains suppressed')
  const projected = projectLiveIdeas(pendingWithdrawalRoot, {}, now)
  assert.equal(projected.ideas.some((row: any) => row.idea_id === recoveredRow.idea_id), false,
    'a pending tombstone can never resurrect recovery-current inventory')
  assert.equal(fs.existsSync(withdrawnPath), true)

  const other = validIdeaSnapshot('OTHER', 'short', { decay_at: '2026-08-03T06:00:00Z' })
  writeIdea(pendingWithdrawalRoot, other)
  assert.throws(() => pruneExpiredIdeas(pendingWithdrawalRoot, now, 0),
    'invalid retention blocks writers instead of startup-unlinking the withdrawal')
  assert.equal(fs.existsSync(withdrawnPath), true, 'the terminal barrier remains durable for manual repair')
} finally {
  fs.rmSync(pendingWithdrawalRoot, { recursive: true, force: true })
}
