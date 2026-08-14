import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { getAutomaticIntakeStatus, listAutomaticIntakeOutcomes, markAutomaticIntakeChecking, markAutomaticIntakeDone, markAutomaticIntakeRetry, recordAutomaticIntakeOutcome, setAutomaticIntakeRuntime } from '../src/auto-intake-status'

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'auto-intake-status-'))
try {
  const at = Date.parse('2026-08-14T00:00:00Z')
  fs.writeFileSync(path.join(dir, 'automatic-intake-status.json'), JSON.stringify({
    version: 1, updated_at: '2026-08-13T00:00:00.000Z', last_checked_at: null, jobs: {},
  }))
  assert.equal(getAutomaticIntakeStatus({ enabled: true, stateDir: dir, now: at }).state, 'needs_attention',
    'an enabled flag without a retained reconciler cannot report green')
  assert.match(getAutomaticIntakeStatus({ enabled: true, stateDir: dir, now: at }).message, /not running on this machine/i)
  setAutomaticIntakeRuntime({ timerActive: true }, dir)
  assert.equal(getAutomaticIntakeStatus({ enabled: true, stateDir: dir, now: at }).state, 'watching',
    'pre-notification v1 status rolls forward with an empty event map')
  setAutomaticIntakeRuntime({ timerActive: true, problem: 'Saved Calls history cannot be read safely.' }, dir)
  assert.equal(getAutomaticIntakeStatus({ enabled: true, stateDir: dir, now: at }).state, 'needs_attention',
    'a retained timer cannot hide its own authority failure behind a green status')
  assert.match(getAutomaticIntakeStatus({ enabled: true, stateDir: dir, now: at }).message, /cannot be read safely/i)
  setAutomaticIntakeRuntime({ timerActive: true, problem: null }, dir)
  assert.equal(getAutomaticIntakeStatus({ enabled: true, stateDir: dir, now: at }).state, 'watching')
  markAutomaticIntakeChecking('TEST', dir, at)
  assert.equal(getAutomaticIntakeStatus({ enabled: true, stateDir: dir, now: at }).state, 'checking')
  markAutomaticIntakeRetry('TEST', at + 300_000, dir, at + 1)
  const retry = getAutomaticIntakeStatus({ enabled: true, stateDir: dir, now: at + 1 })
  assert.equal(retry.state, 'checking')
  assert.equal(retry.next_check_at, '2026-08-14T00:05:00.000Z')
  markAutomaticIntakeDone('TEST', dir, at + 2)
  assert.equal(getAutomaticIntakeStatus({ enabled: true, stateDir: dir, now: at + 2 }).state, 'watching')
  const outcome = {
    ticker: 'TEST',
    runRoot: 'analyses/TEST_2026-08-13',
    planPath: 'analyses/TEST_2026-08-13/intake/2026-08-14_intake_plan.json',
    planSha256: `sha256:${'a'.repeat(64)}`,
    decisionFingerprint: `sha256:${'b'.repeat(64)}`,
    verdict: 'note_only' as const,
    summary: 'The new filing repeats information already in the thesis.',
  }
  const first = recordAutomaticIntakeOutcome(outcome, dir, at + 3)
  const second = recordAutomaticIntakeOutcome(outcome, dir, at + 4)
  assert.equal(second, first, 'retry/restart identity is stable')
  const events = listAutomaticIntakeOutcomes(dir, at + 4)
  assert.equal(events.length, 1, 'retry cannot duplicate the notification')
  assert.equal(events[0].headline, 'Checked new data. The call did not change.')
  assert.equal(events[0].at, '2026-08-14T00:00:00.003Z', 'dedupe preserves the first successful time')
  assert.equal(recordAutomaticIntakeOutcome({ ...outcome, planPath: '../escape.json' }, dir, at + 5), null)
  assert.equal(fs.existsSync(path.join(dir, 'automatic-intake-status.initialized')), true)
  fs.unlinkSync(path.join(dir, 'automatic-intake-status.json'))
  assert.deepEqual(listAutomaticIntakeOutcomes(dir, at + 6), [], 'missing used history is never invented')
  assert.equal(getAutomaticIntakeStatus({ enabled: true, stateDir: dir, now: at + 6 }).state, 'needs_attention')
  assert.equal(fs.existsSync(path.join(dir, 'automatic-intake-status.json')), false,
    'a missing used ledger is preserved for operator recovery, not silently recreated')
  fs.writeFileSync(path.join(dir, 'automatic-intake-status.json'), '{bad')
  assert.equal(getAutomaticIntakeStatus({ enabled: true, stateDir: dir, now: at + 7 }).state, 'needs_attention')
  setAutomaticIntakeRuntime({ timerActive: false, passActive: true }, dir)
  assert.equal(getAutomaticIntakeStatus({ enabled: true, stateDir: dir, now: at + 7 }).state, 'needs_attention',
    'damaged durable status still wins even during an active reconciliation pass')
  console.log('automatic intake status is durable and truthful: ok')
} finally {
  fs.rmSync(dir, { recursive: true, force: true })
}
