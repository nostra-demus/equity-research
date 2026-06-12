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
import { markInboxConsumed, setDismissed } from '../src/news/inbox-actions'
import { moveThesis } from '../src/screener-actions'

let passed = 0
function check(name: string, fn: () => void) {
  try {
    fn()
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

check('inbox: dismiss → restore round-trip stamps and clears human state; file stays valid JSON', () => {
  const root = mkRepo()
  const dismissed = setDismissed(root, 'INB-20260612-001', true, 'tester@x')
  assert.equal(dismissed?.dismissed, true)
  assert.equal(dismissed?.dismissed_by, 'tester@x')
  assert.ok(dismissed?.dismissed_at)
  const doc = JSON.parse(fs.readFileSync(path.join(root, 'screener/inbox/2026-06-12_sweep.json'), 'utf8'))
  assert.equal(doc.rows[0].dismissed, true)
  assert.ok(doc.updated_at)
  const restored = setDismissed(root, 'INB-20260612-001', false, 'tester@x')
  assert.equal(restored?.dismissed, undefined)
  assert.equal(restored?.dismissed_at, undefined)
  assert.equal(setDismissed(root, 'INB-19990101-999', true, 'x'), null) // unknown id → null, no write
})

check('inbox: markInboxConsumed sets consumed + launched_signal_id (idempotent)', () => {
  const root = mkRepo()
  const row = markInboxConsumed(root, 'INB-20260612-002', 'SIG-20260612-abcd1234')
  assert.equal(row?.consumed, true)
  assert.equal(row?.launched_signal_id, 'SIG-20260612-abcd1234')
  const again = markInboxConsumed(root, 'INB-20260612-002', 'SIG-20260612-abcd1234')
  assert.equal(again?.consumed, true)
})

check('thesis move: override appended (engine status captured); engine thesis file untouched; unknown id → null', () => {
  const root = mkRepo()
  const rec = moveThesis('THS-SIG-20260612-test-v1', 'provisional', 'I think the edge is real', 'tester@x', root)
  assert.ok(rec)
  assert.equal(rec!.from_status, 'watchlist_no_edge')
  assert.equal(rec!.to_status, 'provisional')
  const lines = fs.readFileSync(path.join(root, 'screener/ledger/overrides.ndjson'), 'utf8').trim().split('\n')
  assert.equal(lines.length, 1)
  // 'watchlist' maps to watchlist_manual; 'engine' clears (to_status null)
  const w = moveThesis('THS-SIG-20260612-test-v1', 'watchlist', '', 'tester@x', root)
  assert.equal(w!.to_status, 'watchlist_manual')
  const clear = moveThesis('THS-SIG-20260612-test-v1', 'engine', '', 'tester@x', root)
  assert.equal(clear!.to_status, null)
  // engine-owned thesis JSON was never edited
  const thesis = JSON.parse(fs.readFileSync(path.join(root, 'screener/ledger/theses/THS-SIG-20260612-test-v1.json'), 'utf8'))
  assert.equal(thesis.meta.status, 'watchlist_no_edge')
  assert.equal(moveThesis('THS-MISSING-v1', 'provisional', '', 'x', root), null)
})

check('python board builder: effective_status + override + staleness applied; engine status untouched', () => {
  const root = mkRepo()
  // stage the real script into the skeleton (it roots itself from __file__)
  fs.mkdirSync(path.join(root, 'scripts'), { recursive: true })
  fs.copyFileSync(path.join(REPO_ROOT, 'scripts', 'update_board_index.py'), path.join(root, 'scripts', 'update_board_index.py'))
  moveThesis('THS-SIG-20260612-test-v1', 'full_machine', 'promote it', 'tester@x', root)
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
