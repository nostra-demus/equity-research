// The forever-living resume supervisor's disk-truth detector + gates.
//
// listResumableResearchRuns must surface EXACTLY the research full runs that broke and should be
// continued, and NOTHING else:
//   • INCLUDE a run with a `.interrupted` marker, unfinished, not aborted, recent.
//   • EXCLUDE a deliberately-cancelled run (`.aborted`)            — a stop is not an interruption.
//   • EXCLUDE a finished run (final_thesis.md + decision_record.json) — nothing to resume.
//   • EXCLUDE a partial run with NO `.interrupted` (a clean budget truncation = the honest `incomplete`)
//                                                                   — auto-resuming would re-hit the cap.
//   • EXCLUDE a currently-live run                                  — it isn't interrupted.
//   • EXCLUDE a stale (multi-day-old) break                         — left for the human; can't loop.
// And the two pure gates: shouldHoldForCredit (never relaunch into a hard limit / while spending overage)
// and isResumeDue (a plan-limit pause waits for its own resetsAt; every other break is due now).
//
// Run: npx tsx test/research-resume.test.ts
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

// ANALYSES_DIR (= REPO_ROOT/analyses) is resolved from ENGINE_REPO_ROOT at config module-eval, so set it
// BEFORE importing the supervisor. STATE_DIR too (the module reads it, though the pure helpers don't).
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'rs-resume-'))
process.env.ENGINE_REPO_ROOT = root
process.env.ENGINE_STATE_DIR = path.join(root, '.state')

const analysesDir = path.join(root, 'analyses')
fs.mkdirSync(analysesDir, { recursive: true })

const now = Date.now()
const FUTURE = Math.floor((now + 3 * 3600 * 1000) / 1000) // unix seconds, +3h
const PAST = Math.floor((now - 3600 * 1000) / 1000) // unix seconds, -1h

// Build a research run folder. A module is "done" iff its 99 synthesis is non-empty. Markers/deliverables
// reproduce each disk shape the detector must tell apart.
function mkRun(dir: string, opts: { interrupted?: Record<string, unknown>; aborted?: boolean; final?: boolean; doneModule?: string; ageMs?: number } = {}): string {
  const abs = path.join(analysesDir, dir)
  fs.mkdirSync(abs, { recursive: true })
  if (opts.doneModule) {
    const mdir = path.join(abs, opts.doneModule)
    fs.mkdirSync(mdir, { recursive: true })
    fs.writeFileSync(path.join(mdir, `99_${opts.doneModule}-synthesis.md`), `# ${opts.doneModule} synthesis\n\nVerdict: …\n`)
  }
  if (opts.interrupted) fs.writeFileSync(path.join(abs, '.interrupted'), JSON.stringify({ ...opts.interrupted, at: new Date().toISOString() }) + '\n')
  if (opts.aborted) fs.writeFileSync(path.join(abs, '.aborted'), JSON.stringify({ reason: 'cancelled', at: new Date().toISOString() }) + '\n')
  if (opts.final) {
    fs.writeFileSync(path.join(abs, 'final_thesis.md'), '# Thesis\n')
    fs.writeFileSync(path.join(abs, 'decision_record.json'), JSON.stringify({ decision: 'Watchlist' }) + '\n')
  }
  if (opts.ageMs) { const t = (now - opts.ageMs) / 1000; fs.utimesSync(abs, t, t) }
  return abs
}

mkRun('INTR_2026-06-24', { interrupted: { reason: 'terminated_SIGKILL' }, doneModule: 'business-model' })
mkRun('OOC_2026-06-24', { interrupted: { reason: 'out_of_credits', resetsAt: FUTURE }, doneModule: 'business-model' })
mkRun('ABRT_2026-06-24', { interrupted: { reason: 'nonzero_exit' }, aborted: true })
mkRun('DONE_2026-06-24', { interrupted: { reason: 'out_of_credits', resetsAt: PAST }, final: true })
mkRun('NOMK_2026-06-24', { doneModule: 'business-model' }) // partial but unmarked = a clean budget `incomplete`
mkRun('LIVE_2026-06-24', { interrupted: { reason: 'nonzero_exit' }, doneModule: 'business-model' })
mkRun('STAL_2026-06-24', { interrupted: { reason: 'nonzero_exit' }, ageMs: 3 * 24 * 3600 * 1000 }) // 3 days old
mkRun('tracking', {}) // not a "<TICKER>_<DATE>" run folder at all

const { listResumableResearchRuns, shouldHoldForCredit, isResumeDue } = await import('../src/resume-supervisor')

let passed = 0
function check(name: string, fn: () => void) {
  try { fn(); passed++; console.log(`  ok  ${name}`) }
  catch (e: any) { console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`); process.exitCode = 1 }
}

const tickersFor = (live: Set<string>) => new Set(listResumableResearchRuns(live, now).map((r) => r.subject))

check('an interrupted, unfinished, recent run IS resumable', () => {
  assert.ok(tickersFor(new Set()).has('INTR'), 'INTR should be resumable')
})

check('an out_of_credits run IS resumable and carries its resetsAt + reason', () => {
  const ooc = listResumableResearchRuns(new Set(), now).find((r) => r.subject === 'OOC')
  assert.ok(ooc, 'OOC should be resumable')
  assert.equal(ooc!.reason, 'out_of_credits')
  assert.equal(ooc!.resetsAt, FUTURE)
})

check('a deliberately-cancelled run (.aborted) is NOT resumable', () => {
  assert.ok(!tickersFor(new Set()).has('ABRT'), 'ABRT was stopped on purpose')
})

check('a finished run (final thesis + decision record) is NOT resumable', () => {
  assert.ok(!tickersFor(new Set()).has('DONE'), 'DONE already completed')
})

check('a partial run with NO .interrupted marker (a clean budget `incomplete`) is NOT resumable', () => {
  assert.ok(!tickersFor(new Set()).has('NOMK'), 'NOMK is an honest incomplete, not an interruption')
})

check('a currently-live run is NOT resumable', () => {
  assert.ok(!tickersFor(new Set(['LIVE'])).has('LIVE'), 'LIVE is still running')
})

check('a stale (3-day-old) break is NOT resumable', () => {
  assert.ok(!tickersFor(new Set()).has('STAL'), 'STAL is too old — left for the human')
})

check('exactly the two genuine interruptions are surfaced (LIVE excluded as in-flight)', () => {
  assert.deepEqual([...tickersFor(new Set(['LIVE']))].sort(), ['INTR', 'OOC'])
})

// --- shouldHoldForCredit ---
check('credit gate: a healthy plan does NOT hold', () => {
  assert.equal(shouldHoldForCredit({ ok: true, checked: true }, now), false)
})
check('credit gate: a rejected window with a FUTURE reset holds (wait for reset)', () => {
  assert.equal(shouldHoldForCredit({ ok: false, checked: true, resetsAt: FUTURE }, now), true)
})
check('credit gate: a rejected window whose reset already PASSED does not hold', () => {
  assert.equal(shouldHoldForCredit({ ok: false, checked: true, resetsAt: PAST }, now), false)
})
check('credit gate: ALWAYS holds while overage is being spent (no paid billing)', () => {
  assert.equal(shouldHoldForCredit({ ok: true, checked: true, isUsingOverage: true }, now), true)
})
check('credit gate: holds on a per-window overage flag too', () => {
  assert.equal(shouldHoldForCredit({ ok: true, checked: true, windows: { seven_day: { isUsingOverage: true } } }, now), true)
})

// --- isResumeDue ---
check('resume gate: an out_of_credits pause with a FUTURE reset is NOT due yet', () => {
  assert.equal(isResumeDue({ kind: 'full', subject: 'OOC', reason: 'out_of_credits', resetsAt: FUTURE }, now, 60_000), false)
})
check('resume gate: an out_of_credits pause whose reset PASSED is due', () => {
  assert.equal(isResumeDue({ kind: 'full', subject: 'OOC', reason: 'out_of_credits', resetsAt: PAST }, now, 60_000), true)
})
check('resume gate: a connection/kill break is due immediately', () => {
  assert.equal(isResumeDue({ kind: 'full', subject: 'INTR', reason: 'terminated_SIGKILL' }, now, 60_000), true)
})

// best-effort teardown
try { fs.rmSync(root, { recursive: true, force: true }) } catch { /* ignore */ }

console.log(`\n${passed} checks passed`)
