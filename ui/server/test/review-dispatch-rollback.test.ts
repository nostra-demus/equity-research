// review-dispatch: an ASYNC spawn failure must not permanently burn the daily budget.
//
// `child_process.spawn` does NOT throw synchronously for a launch failure (ENOENT from a missing /
// misconfigured CLAUDE_BIN) — it returns a child and later emits an 'error' event. recordFired() runs
// synchronously right after spawn(), so before the fix a failed launch left the review marked
// fired-today AND consumed a daily-cap slot, and the self-healing dispatcher would never retry it that
// day. The 'error' handler now calls rollbackFired() to revert both.
//
// Expected values are pinned to the module's own stated contract ("a failed launch must not burn the
// daily cap", review-dispatch.ts) and the gemini review finding on PR #279, NOT to current behaviour.
//
// Run: npx tsx test/review-dispatch-rollback.test.ts
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
// Point the persisted dispatch state at a throwaway sandbox and CLAUDE_BIN at a binary that cannot
// launch, so the real spawn emits an async 'error' (ENOENT). Set BEFORE importing the module (which
// reads both at import time via ./config).
const SANDBOX = fs.mkdtempSync(path.join(os.tmpdir(), 'review-dispatch-rb-'))
process.env.ENGINE_STATE_DIR = SANDBOX
process.env.CLAUDE_BIN = path.join(SANDBOX, 'no-such-claude-binary')

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function main() {
  const { spawnReview, readDispatchState } = await import('../src/review-dispatch')

  const KEY = 'analyses/TEST_2026-01-01|30d'

  // spawnReview returns true (the child object was created) and optimistically records the fire.
  const fired = spawnReview('analyses/TEST_2026-01-01', '30d')
  assert.equal(fired, true, 'spawnReview returns true — a child object is created even for a bad binary')

  // Synchronously (before the async 'error' lands) the state shows the optimistic record.
  const mid = readDispatchState()
  assert.equal(mid.fired, 1, 'fired bumped to 1 immediately after spawn (recordFired)')
  assert.ok(mid.keys.includes(KEY), 'key recorded as fired-today immediately after spawn')

  // Wait for the async ENOENT 'error' event to be delivered and handled.
  let after = readDispatchState()
  for (let i = 0; i < 40 && after.fired !== 0; i++) { await delay(25); after = readDispatchState() }

  // After the async error, the fix must have rolled the state back so the review can be retried.
  assert.equal(after.fired, 0, 'daily-cap slot rolled back to 0 after async spawn error (was permanently burned before the fix)')
  assert.ok(!after.keys.includes(KEY), 'fired-today key removed after async spawn error, so the next tick can re-fire the review')

  fs.rmSync(SANDBOX, { recursive: true, force: true })
  console.log('\n2 checks passed')
}

main().catch((e) => {
  try { fs.rmSync(SANDBOX, { recursive: true, force: true }) } catch { /* ignore */ }
  console.error('FAIL', e?.message || e)
  process.exitCode = 1
})
