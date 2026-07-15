// agent-metrics: on run finalize the server invokes scripts/run_cost_report.py (accurate per-agent cost +
// runtime from the per-Task transcripts, deduped by requestId) and lets it write <RUN_ROOT>/agent_metrics.json.
// The pure argv wiring is verifiable without spawning python; the write guard is verifiable without a real run.
// Run: npx tsx test/agent-metrics.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
process.env.ENGINE_STATE_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'agentmetrics-'))
process.on('exit', () => { try { fs.rmSync(process.env.ENGINE_STATE_DIR!, { recursive: true, force: true }) } catch {} }) // don't leave the temp dir behind
const { agentMetricsArgs, agentMetricsFilename, writeAgentMetrics } = await import('../src/agent-metrics')
const { REPO_ROOT } = await import('../src/config')
import type { RunState } from '../src/registry'

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
async function checkAsync(name: string, fn: () => Promise<void>) {
  try {
    await fn()
    passed++
    console.log(`  ok  ${name}`)
  } catch (e: any) {
    console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`)
    process.exitCode = 1
  }
}
// A fake `python3` on PATH so writeAgentMetrics's onWritten callback is exercised without depending on the
// real run_cost_report.py or a paid engine session. Restores PATH itself.
async function withFakePython3(exitCode: number, fn: () => Promise<void>) {
  const binDir = fs.mkdtempSync(path.join(os.tmpdir(), 'agentmetrics-bin-'))
  fs.writeFileSync(path.join(binDir, 'python3'), `#!/bin/sh\nexit ${exitCode}\n`, { mode: 0o755 })
  const oldPath = process.env.PATH
  process.env.PATH = `${binDir}${path.delimiter}${oldPath}`
  try { await fn() } finally {
    process.env.PATH = oldPath
    fs.rmSync(binDir, { recursive: true, force: true })
  }
}

check('argv: passes session id, repo root, and the run-scoped --json path to run_cost_report.py', () => {
  const argv = agentMetricsArgs('sess-abc-123', 'screener/runs/SIG-x')
  assert.ok(argv[0].endsWith(path.join('scripts', 'run_cost_report.py')), 'first arg is the cost-report script')
  assert.deepEqual(argv.slice(1, 5), ['--session', 'sess-abc-123', '--repo-root', REPO_ROOT])
  const j = argv.indexOf('--json')
  assert.ok(j > 0, '--json present')
  // per-run filename (keyed on sessionId), not a fixed 'agent_metrics.json' — a reused run root (agent
  // reruns / sweep / handoff) must not let a later run overwrite an earlier run's metrics.
  assert.equal(argv[j + 1], path.resolve(REPO_ROOT, 'screener/runs/SIG-x', 'agent_metrics.sess-abc-123.json'))
})

check('filename: keyed on sessionId so reused run roots accumulate one record per run', () => {
  assert.equal(agentMetricsFilename('sess-abc-123'), 'agent_metrics.sess-abc-123.json')
  assert.notEqual(agentMetricsFilename('sess-1'), agentMetricsFilename('sess-2'))
})

check('argv: the session UUID is passed through verbatim (no mangling)', () => {
  const uuid = '3f2c81d0-0000-4a2b-9c3d-abcdef012345'
  const argv = agentMetricsArgs(uuid, 'analyses/FOO')
  assert.equal(argv[argv.indexOf('--session') + 1], uuid)
})

// runRoot is repo-relative by contract, but if an absolute one is ever passed the --json path must be that
// path itself — NOT silently nested under REPO_ROOT (path.join would produce REPO_ROOT + '/abs/run/...',
// writing the metrics to a bogus location). path.resolve is what the rest of the launcher already does.
check('argv: an absolute runRoot resolves to itself, not nested under REPO_ROOT', () => {
  const abs = path.resolve(os.tmpdir(), 'abs-run')
  const argv = agentMetricsArgs('sess-1', abs)
  const jsonPath = argv[argv.indexOf('--json') + 1]
  // path.resolve → abs/agent_metrics.<session>.json; the old path.join would give REPO_ROOT + abs (nested).
  assert.equal(jsonPath, path.join(abs, agentMetricsFilename('sess-1')))
})

// writeAgentMetrics is fire-and-forget; the guard must short-circuit (never spawn) when there's nothing to
// attribute — a run with no captured session id, or no run folder — so telemetry can never fail a run.
check('write guard: a run with no sessionId short-circuits (no throw, nothing spawned)', () => {
  writeAgentMetrics({ runRoot: 'screener/runs/SIG-x', sessionId: undefined } as unknown as RunState)
})
check('write guard: a run with no runRoot short-circuits (no throw, nothing spawned)', () => {
  writeAgentMetrics({ runRoot: null, sessionId: 'sess-abc' } as unknown as RunState)
})

// The persist gap this closes: writeAgentMetrics used to be pure fire-and-forget with no way for the caller
// to commit the file into the data stream (§28) — it landed after commit-run.sh had already pushed the run
// folder and was never pushed. onWritten is the hook the launcher uses to commit; it must fire ONLY on a
// zero-exit report, with the exact per-run filename that was passed to --json.
await checkAsync('onWritten: fires with the run-scoped filename after a zero-exit report', () =>
  withFakePython3(0, () => new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('onWritten never fired')), 5000)
    writeAgentMetrics({ runRoot: 'analyses/FOO', sessionId: 'sess-ok', ticker: 'FOO' } as unknown as RunState,
      (_run, filename) => {
        clearTimeout(timer)
        try {
          assert.equal(filename, agentMetricsFilename('sess-ok'))
          resolve()
        } catch (e) { reject(e) }
      })
  })))

await checkAsync('onWritten: does NOT fire when the report exits non-zero', () =>
  withFakePython3(1, () => new Promise<void>((resolve, reject) => {
    let fired = false
    writeAgentMetrics({ runRoot: 'analyses/FOO', sessionId: 'sess-fail', ticker: 'FOO' } as unknown as RunState,
      () => { fired = true })
    setTimeout(() => {
      if (fired) reject(new Error('onWritten fired despite a non-zero exit'))
      else resolve()
    }, 2000)
  })))

console.log(`\n${passed} checks passed`)
