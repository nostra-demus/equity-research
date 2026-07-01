// Screener card feedback ledger: save/read/undo round-trips on the append-only NDJSON ledger, the
// FEEDBACK_TYPES enum guard, and graceful behaviour with no ledger file yet (a fresh screener install).
// Run: npx tsx test/screener-feedback.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { z } from 'zod'
import { REPO_ROOT } from '../src/config'
import { FEEDBACK_TYPES, readAllFeedback, submitFeedback, summarizeFeedback, undoFeedback } from '../src/screener-feedback'

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

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'fbtest-'))
const LEDGER_PATH = (root: string) => path.join(root, 'screener', 'ledger', 'screener_feedback.ndjson')

check('feedback saves successfully — one valid ledger line with the right fields', () => {
  const root = tmp()
  const record = submitFeedback(
    { event_id: 'EVT-abc123abc123', feedback_type: 'irrelevant', feedback_reason: 'not about a real company', current_score: 42, event_title: 'Some headline', source: 'Reuters', company_name: 'Acme Corp', company_ticker: 'ACME', sector_theme: 'profits & sales', score_breakdown: { materiality: 40, source_tier: 5 } },
    'tester@x',
    root,
  )
  assert.match(record.feedback_id, /^FDB-\d{8}-[a-f0-9]{8}$/)
  assert.equal(record.event_id, 'EVT-abc123abc123')
  assert.equal(record.feedback_type, 'irrelevant')
  assert.equal(record.feedback_reason, 'not about a real company')
  assert.equal(record.user_id, 'tester@x')
  assert.ok(record.submitted_at)
  const lines = fs.readFileSync(LEDGER_PATH(root), 'utf8').trim().split('\n')
  assert.equal(lines.length, 1)
  const onDisk = JSON.parse(lines[0])
  assert.equal(onDisk.feedback_id, record.feedback_id)
  assert.equal(onDisk.company_ticker, 'ACME')
})

check('missing reason still works — writes with empty string, no throw', () => {
  const root = tmp()
  const record = submitFeedback({ event_id: 'EVT-000000000000', feedback_type: 'score_too_high' }, 'tester@x', root)
  assert.equal(record.feedback_reason, '')
  assert.equal(readAllFeedback(root).length, 1)
})

check('invalid feedback type is rejected by the shared enum schema', () => {
  const schema = z.enum(FEEDBACK_TYPES)
  assert.equal(schema.safeParse('not_a_real_type').success, false)
  assert.equal(schema.safeParse('irrelevant').success, true)
})

// regression: the client sends `score_breakdown: null` whenever an item has no rank_factors (most
// theme-view / archive items). The route's Zod field must accept null, not just undefined/object —
// caught by manual browser verification (a real POST 400'd with "Expected object, received null").
check('score_breakdown schema field accepts null, undefined, and an object (mirrors server.ts FeedbackBody)', () => {
  const schema = z.record(z.any()).nullable().optional()
  assert.equal(schema.safeParse(null).success, true)
  assert.equal(schema.safeParse(undefined).success, true)
  assert.equal(schema.safeParse({ materiality: 40 }).success, true)
})

check('user_id unavailable (identify() local fallback) never blocks the write', () => {
  const root = tmp()
  const record = submitFeedback({ event_id: 'EVT-111111111111', feedback_type: 'other' }, 'local', root)
  assert.equal(record.user_id, 'local')
  assert.equal(readAllFeedback(root).length, 1)
})

check('existing screener still loads with no feedback records — [] on a missing ledger file', () => {
  const root = tmp() // screener/ledger/screener_feedback.ndjson never created
  assert.deepEqual(readAllFeedback(root), [])
  const summary = summarizeFeedback([])
  assert.equal(summary.total, 0)
  assert.equal(summary.active_total, 0)
  assert.equal(summary.top_reasons.length, 0)
  for (const t of FEEDBACK_TYPES) assert.equal(summary.by_type[t], 0)
})

check('undo tombstones rather than rewriting — original stays, summary excludes it', () => {
  const root = tmp()
  const record = submitFeedback({ event_id: 'EVT-222222222222', feedback_type: 'score_too_low', feedback_reason: 'looks underrated' }, 'tester@x', root)
  const undone = undoFeedback(record.feedback_id, 'tester@x', root)
  assert.ok(undone)
  assert.equal(undone!.kind, 'feedback_undo')
  assert.equal(undone!.undoes, record.feedback_id)
  const all = readAllFeedback(root)
  assert.equal(all.length, 2) // original + tombstone, never mutated in place
  const original = all.find((r) => r.feedback_id === record.feedback_id)
  assert.equal(original?.feedback_type, 'score_too_low') // untouched
  const summary = summarizeFeedback(all)
  assert.equal(summary.active_total, 0)
  assert.equal(summary.by_type.score_too_low, 0)
  assert.equal(undoFeedback('FDB-20260101-deadbeef', 'x', root), null) // unknown id -> null, no write
})

check('idempotency: submitting the same feedback_id twice yields one line', () => {
  const root = tmp()
  const a = submitFeedback({ event_id: 'EVT-333333333333', feedback_type: 'duplicate_stale' }, 'tester@x', root)
  // simulate a client retry re-appending the exact same record (append-ndjson.sh dedups by id)
  const raw = fs.readFileSync(LEDGER_PATH(root), 'utf8').trim().split('\n')[0]
  execFileSync('bash', [path.join(REPO_ROOT, 'scripts', 'append-ndjson.sh'), LEDGER_PATH(root), raw, 'feedback_id', a.feedback_id], { cwd: root, stdio: 'ignore' })
  const lines = fs.readFileSync(LEDGER_PATH(root), 'utf8').trim().split('\n')
  assert.equal(lines.length, 1)
})

console.log(`\n${passed} checks passed`)
