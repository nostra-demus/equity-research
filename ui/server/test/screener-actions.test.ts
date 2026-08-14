// Human board actions: inbox dismiss/restore/consumed round-trips on the sweep file (atomic,
// preserved by merges), thesis-move overrides (append-only ledger), and the python board builder
// applying them as effective_status WITHOUT touching the engine's own status.
// Run: npx tsx test/screener-actions.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { REPO_ROOT } from '../src/config'
import { markInboxConsumed, readInboxHumanActions, setDismissed } from '../src/news/inbox-actions'
import { mergeInbox } from '../src/news/write-inbox'
import { moveThesis } from '../src/screener-actions'

let passed = 0
async function check(name: string, fn: () => void | Promise<void>) {
  try {
    await fn()
    passed++
    console.log(`  ok  ${name}`)
  } catch (e: any) {
    console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`)
    process.exitCode = 1
  }
}

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'scract-'))

function mkRepo(): string {
  const root = tmp()
  fs.mkdirSync(path.join(root, 'screener', 'inbox'), { recursive: true })
  fs.mkdirSync(path.join(root, 'screener', 'ledger', 'theses'), { recursive: true })
  fs.mkdirSync(path.join(root, 'screener', 'board'), { recursive: true })
  fs.writeFileSync(
    path.join(root, 'screener', 'inbox', '2026-06-12_sweep.json'),
    JSON.stringify({
      date: '2026-06-12',
      rows: [
        { inbox_id: 'INB-20260612-001', headline: 'A first headline long enough', url: 'https://reuters.com/1', source_name: 'Reuters', input_nature: 'news_headline', found_at: '2026-06-12T09:00:00Z', prelim_note: '', dedup_status: 'new', consumed: false, launched_signal_id: null, triage_score: 80 },
        { inbox_id: 'INB-20260612-002', headline: 'A second headline long enough', url: 'https://reuters.com/2', source_name: 'Reuters', input_nature: 'news_headline', found_at: '2026-06-12T09:01:00Z', prelim_note: '', dedup_status: 'new', consumed: false, launched_signal_id: null, triage_score: 60 },
      ],
    }, null, 2),
  )
  fs.writeFileSync(
    path.join(root, 'screener', 'ledger', 'theses', 'THS-SIG-20260612-test-v1.json'),
    JSON.stringify({ meta: { thesis_id: 'THS-SIG-20260612-test-v1', signal_id: 'SIG-20260612-test', status: 'watchlist_no_edge', locked: true }, headline: 'Test thesis headline' }, null, 2),
  )
  return root
}

await check('inbox: dismiss → restore round-trip stamps and clears human state; file stays valid JSON', () => {
  const root = mkRepo()
  const dismissed = setDismissed(root, 'INB-20260612-001', true, 'tester@x')
  assert.equal(dismissed?.dismissed, true)
  assert.equal(dismissed?.dismissed_by, 'tester@x')
  assert.ok(dismissed?.dismissed_at)
  const doc = JSON.parse(fs.readFileSync(path.join(root, 'screener/inbox/2026-06-12_sweep.json'), 'utf8'))
  assert.equal(doc.rows[0].dismissed, true)
  assert.ok(doc.updated_at)
  assert.deepEqual(readInboxHumanActions(root).rows.map((row) => row.action), ['dismissed'])
  const restored = setDismissed(root, 'INB-20260612-001', false, 'tester@x')
  assert.equal(restored?.dismissed, undefined)
  assert.equal(restored?.dismissed_at, undefined)
  assert.deepEqual(readInboxHumanActions(root).rows, [], 'restore closes the durable dismissal record')
  assert.equal(setDismissed(root, 'INB-19990101-999', true, 'x'), null) // unknown id → null, no write
})

await check('inbox: ledger/projection divergence is repaired after sweep write failures without duplicate actions', () => {
  const root = mkRepo()
  const sweep = path.join(root, 'screener/inbox/2026-06-12_sweep.json')
  const ledger = path.join(root, 'screener/ledger/inbox-human-actions.ndjson')
  const failNextSweepWrite = (fn: () => void): void => {
    const renameSync = fs.renameSync
    let failed = false
    fs.renameSync = ((oldPath, newPath) => {
      if (!failed && String(newPath) === sweep) {
        failed = true
        throw new Error('injected sweep write failure')
      }
      return renameSync(oldPath, newPath)
    }) as typeof fs.renameSync
    try {
      assert.throws(fn, /injected sweep write failure/)
      assert.equal(failed, true, 'the injected failure reached the sweep rename after the ledger append')
    } finally {
      fs.renameSync = renameSync
    }
  }
  const ledgerRows = (): any[] => fs.readFileSync(ledger, 'utf8').trim().split('\n').map((line) => JSON.parse(line))
  const projectedRow = (): any => JSON.parse(fs.readFileSync(sweep, 'utf8')).rows
    .find((row: any) => row.inbox_id === 'INB-20260612-001')

  // The append is durable but the projection remains in its prior state. A later restore must consult
  // the observation-keyed ledger instead of returning early just because the sweep already looks clear.
  failNextSweepWrite(() => { setDismissed(root, 'INB-20260612-001', true, 'tester@x') })
  assert.equal(projectedRow().dismissed, undefined)
  assert.deepEqual(readInboxHumanActions(root).rows.map((row) => row.action), ['dismissed'])
  mergeInbox(root, '2026-06-12', [{
    event_id: 'EVT-ledger-cap-pressure', headline: 'New higher-scoring event under cap pressure',
    url: 'https://reuters.com/cap-pressure', domain: 'reuters.com', source_name: 'Reuters',
    region: 'GLOBAL', input_nature: 'news_headline', found_at: '2026-06-12T10:00:00Z',
    dedup_status: 'new', triage_score: 99, triage_reason: 'material event', relevance: 'material',
    materiality_pre_score: 99, event_types: ['mna'], issuer_linkage: 'primary', companies: [],
    size_bucket: 'large', band: 'pick', event_materiality_label: 'critical',
    event_direction: 'unknown', event_scope: 'single_name',
  } as any], { maxRows: 1, now: () => new Date('2026-06-12T10:01:00Z') })
  assert.equal(projectedRow().dismissed, true, 'merge repairs ledger-backed dismissal before cap selection')
  assert.ok(JSON.parse(fs.readFileSync(sweep, 'utf8')).rows.some((row: any) => row.inbox_id === 'INB-20260612-001'),
    'cap pressure cannot evict a durable human veto whose prior projection write failed')
  const restored = setDismissed(root, 'INB-20260612-001', false, 'tester@x')
  const restoreLedger = ledgerRows()
  assert.deepEqual(restoreLedger.map((row) => row.action), ['dismissed', 'restored'])
  assert.equal(new Set(restoreLedger.map((row) => row.observation_id)).size, 1)
  assert.deepEqual(readInboxHumanActions(root).rows, [], 'the restore closes the durable dismissal')
  assert.equal(restored?.human_action_id, restoreLedger[1].action_id)
  assert.equal(projectedRow().human_action_id, restoreLedger[1].action_id)

  // Same-action retries repair either projection direction from the already-durable transition. They
  // must not append a second dismissal/restore merely because the sweep rename failed.
  failNextSweepWrite(() => { setDismissed(root, 'INB-20260612-001', true, 'tester@x') })
  const dismissalLedger = ledgerRows()
  const retriedDismissal = setDismissed(root, 'INB-20260612-001', true, 'tester@x')
  assert.equal(ledgerRows().length, dismissalLedger.length)
  assert.equal(retriedDismissal?.dismissed, true)
  assert.equal(projectedRow().human_action_id, dismissalLedger.at(-1).action_id)

  failNextSweepWrite(() => { setDismissed(root, 'INB-20260612-001', false, 'tester@x') })
  const restoredLedger = ledgerRows()
  const retriedRestore = setDismissed(root, 'INB-20260612-001', false, 'tester@x')
  assert.equal(ledgerRows().length, restoredLedger.length)
  assert.equal(retriedRestore?.dismissed, undefined)
  assert.equal(projectedRow().human_action_id, restoredLedger.at(-1).action_id)
})

await check('inbox: markInboxConsumed sets consumed + launched_signal_id (idempotent)', () => {
  const root = mkRepo()
  const row = markInboxConsumed(root, 'INB-20260612-002', 'SIG-20260612-abcd1234')
  assert.equal(row?.consumed, true)
  assert.equal(row?.launched_signal_id, 'SIG-20260612-abcd1234')
  assert.ok(row?.consumed_at)
  const consumedAt = row?.consumed_at
  const again = markInboxConsumed(root, 'INB-20260612-002', 'SIG-20260612-abcd1234')
  assert.equal(again?.consumed, true)
  assert.equal(again?.consumed_at, consumedAt, 'an idempotent repeat preserves the original action clock')
  assert.deepEqual(readInboxHumanActions(root).rows.map((record) => record.action), ['consumed'])
})

await check('inbox action ledger folds reused inbox slots by immutable observation', () => {
  const root = mkRepo()
  const file = path.join(root, 'screener/inbox/2026-06-12_sweep.json')
  setDismissed(root, 'INB-20260612-001', true, 'tester@x')
  markInboxConsumed(root, 'INB-20260612-002', 'SIG-old-observation')

  // Simulate a restore/import that reuses the date+sequence slots for unrelated source observations.
  // Actions on the replacement rows must neither restore nor overwrite the old vetoes.
  const replacement = JSON.parse(fs.readFileSync(file, 'utf8'))
  replacement.rows[0] = {
    ...replacement.rows[0], headline: 'Replacement dismissal observation', url: 'https://reuters.com/replacement-dismiss',
    found_at: '2026-06-12T10:00:00Z', consumed: false, launched_signal_id: null,
  }
  delete replacement.rows[0].dismissed
  delete replacement.rows[0].dismissed_at
  delete replacement.rows[0].dismissed_by
  delete replacement.rows[0].human_action_id
  replacement.rows[1] = {
    ...replacement.rows[1], headline: 'Replacement consumed observation', url: 'https://reuters.com/replacement-consume',
    found_at: '2026-06-12T10:01:00Z', consumed: false, launched_signal_id: null,
  }
  delete replacement.rows[1].consumed_at
  delete replacement.rows[1].human_action_id
  fs.writeFileSync(file, JSON.stringify(replacement, null, 2))

  setDismissed(root, 'INB-20260612-001', true, 'tester@x')
  setDismissed(root, 'INB-20260612-001', false, 'tester@x')
  markInboxConsumed(root, 'INB-20260612-002', 'SIG-new-observation')

  const actions = readInboxHumanActions(root)
  assert.equal(actions.complete, true)
  assert.deepEqual(actions.rows.map((row) => [row.action, row.headline]).sort(), [
    ['consumed', 'A second headline long enough'],
    ['consumed', 'Replacement consumed observation'],
    ['dismissed', 'A first headline long enough'],
  ].sort(), 'restore closes only the replacement dismissal and both consumed observations survive')
  assert.equal(new Set(actions.rows.map((row) => row.observation_id)).size, 3)
})

await check('inbox action ledger derives legacy observation identity and rejects conflicting lineage', () => {
  const root = mkRepo()
  setDismissed(root, 'INB-20260612-001', true, 'tester@x')
  const ledger = path.join(root, 'screener/ledger/inbox-human-actions.ndjson')
  const legacy = JSON.parse(fs.readFileSync(ledger, 'utf8').trim())
  delete legacy.observation_id
  fs.writeFileSync(ledger, `${JSON.stringify(legacy)}\n`)
  const recovered = readInboxHumanActions(root)
  assert.equal(recovered.complete, true)
  assert.ok(recovered.rows[0]?.observation_id, 'pre-lineage records derive identity from required source bytes')

  fs.writeFileSync(ledger, `${JSON.stringify({ ...legacy, observation_id: 'EVT-conflicting-lineage' })}\n`)
  assert.deepEqual(readInboxHumanActions(root), { rows: [], complete: false },
    'an explicit identity that conflicts with source bytes fails closed')
  const retried = setDismissed(root, 'INB-20260612-001', true, 'tester@x')
  const lines = fs.readFileSync(ledger, 'utf8').trim().split('\n')
  assert.equal(lines.length, 2, 'a malformed ledger cannot prove that a matching projection is a no-op')
  assert.equal(retried?.human_action_id, JSON.parse(lines[1]).action_id)
  assert.equal(readInboxHumanActions(root).complete, false, 'the appended witness does not hide earlier corruption')
})

await check('thesis move: override appended (engine status captured); engine thesis file untouched; unknown id → null', async () => {
  const root = mkRepo()
  const rec = await moveThesis('THS-SIG-20260612-test-v1', 'provisional', 'I think the edge is real', 'tester@x', root)
  assert.ok(rec)
  assert.equal(rec!.from_status, 'watchlist_no_edge')
  assert.equal(rec!.to_status, 'provisional')
  const lines = fs.readFileSync(path.join(root, 'screener/ledger/overrides.ndjson'), 'utf8').trim().split('\n')
  assert.equal(lines.length, 1)
  // 'watchlist' maps to watchlist_manual; 'engine' clears (to_status null)
  const w = await moveThesis('THS-SIG-20260612-test-v1', 'watchlist', '', 'tester@x', root)
  assert.equal(w!.to_status, 'watchlist_manual')
  const clear = await moveThesis('THS-SIG-20260612-test-v1', 'engine', '', 'tester@x', root)
  assert.equal(clear!.to_status, null)
  // engine-owned thesis JSON was never edited
  const thesis = JSON.parse(fs.readFileSync(path.join(root, 'screener/ledger/theses/THS-SIG-20260612-test-v1.json'), 'utf8'))
  assert.equal(thesis.meta.status, 'watchlist_no_edge')
  assert.equal(await moveThesis('THS-MISSING-v1', 'provisional', '', 'x', root), null)
})

await check('python board builder: effective_status + override + staleness applied; engine status untouched', async () => {
  const root = mkRepo()
  // stage the real script into the skeleton (it roots itself from __file__)
  fs.mkdirSync(path.join(root, 'scripts'), { recursive: true })
  fs.copyFileSync(path.join(REPO_ROOT, 'scripts', 'update_board_index.py'), path.join(root, 'scripts', 'update_board_index.py'))
  fs.copyFileSync(path.join(REPO_ROOT, 'scripts', 'canonical_json.py'), path.join(root, 'scripts', 'canonical_json.py'))
  await moveThesis('THS-SIG-20260612-test-v1', 'full_machine', 'promote it', 'tester@x', root)
  execFileSync('python3', [path.join(root, 'scripts', 'update_board_index.py')], { cwd: root, stdio: 'ignore' })
  const board = JSON.parse(fs.readFileSync(path.join(root, 'screener/board/index.json'), 'utf8'))
  const t = board.theses.find((x: any) => x.thesis_id === 'THS-SIG-20260612-test-v1')
  assert.equal(t.status, 'watchlist_no_edge') // the engine's verdict, untouched and visible
  assert.equal(t.effective_status, 'full_machine') // where the human put it
  assert.equal(t.override.moved_by, 'tester@x')
  assert.equal(t.override_stale, false) // engine status unchanged since the move
  assert.equal(board.counts.full_machine, 1) // funnel counts run on effective status
  assert.equal(board.counts.watchlist, 0)
  // dismissed rows leave the unconsumed count
  setDismissed(root, 'INB-20260612-001', true, 'tester@x')
  execFileSync('python3', [path.join(root, 'scripts', 'update_board_index.py')], { cwd: root, stdio: 'ignore' })
  const board2 = JSON.parse(fs.readFileSync(path.join(root, 'screener/board/index.json'), 'utf8'))
  assert.equal(board2.counts.inbox_unconsumed, 1)
  // staleness: the engine re-runs and changes its mind AFTER the move
  const tf = path.join(root, 'screener/ledger/theses/THS-SIG-20260612-test-v1.json')
  const doc = JSON.parse(fs.readFileSync(tf, 'utf8'))
  doc.meta.status = 'provisional'
  fs.writeFileSync(tf, JSON.stringify(doc, null, 2))
  execFileSync('python3', [path.join(root, 'scripts', 'update_board_index.py')], { cwd: root, stdio: 'ignore' })
  const board3 = JSON.parse(fs.readFileSync(path.join(root, 'screener/board/index.json'), 'utf8'))
  const t3 = board3.theses.find((x: any) => x.thesis_id === 'THS-SIG-20260612-test-v1')
  assert.equal(t3.override_stale, true) // surfaced, never silently resolved
  assert.equal(t3.effective_status, 'full_machine') // the human move still holds
})

console.log(`\n${passed} checks passed`)
