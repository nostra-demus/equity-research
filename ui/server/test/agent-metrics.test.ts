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
const { agentMetricsArgs, writeAgentMetrics, shouldWriteAgentMetrics } = await import('../src/agent-metrics')
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

check('argv: passes session id, repo root, and the run-scoped --json path to run_cost_report.py', () => {
  const argv = agentMetricsArgs('sess-abc-123', 'screener/runs/SIG-x')
  assert.ok(argv[0].endsWith(path.join('scripts', 'run_cost_report.py')), 'first arg is the cost-report script')
  assert.deepEqual(argv.slice(1, 5), ['--session', 'sess-abc-123', '--repo-root', REPO_ROOT])
  const j = argv.indexOf('--json')
  assert.ok(j > 0, '--json present')
  assert.equal(argv[j + 1], path.resolve(REPO_ROOT, 'screener/runs/SIG-x', 'agent_metrics.json')) // written INTO the run folder
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
  // path.resolve → abs/agent_metrics.json; the old path.join would give REPO_ROOT + abs (nested) — the bug.
  assert.equal(jsonPath, path.join(abs, 'agent_metrics.json'))
})

// writeAgentMetrics is fire-and-forget; the guard must short-circuit (never spawn) when there's nothing to
// attribute — a run with no captured session id, or no run folder — so telemetry can never fail a run.
check('write guard: a run with no sessionId short-circuits (no throw, nothing spawned)', () => {
  writeAgentMetrics({ runRoot: 'screener/runs/SIG-x', sessionId: undefined } as unknown as RunState)
})
check('write guard: a run with no runRoot short-circuits (no throw, nothing spawned)', () => {
  writeAgentMetrics({ runRoot: null, sessionId: 'sess-abc' } as unknown as RunState)
})

// Finding 4 (Codex): the metrics filename is fixed per run root, so only kinds that mint their OWN run folder
// may write it. `full`/`signal` do; `module`/`agent`/`rerun`/`screener-agent` reuse a folder and
// `sweep`/`handoff` share one (screener/inbox, screener/ledger) — writing there would clobber or mis-attribute
// another run's metrics, so the guard must skip them.
const guardBase = { runRoot: 'analyses/FOO_2026-07-14', sessionId: 'sess-1' }
check('kind guard: full and signal runs earn a metrics file', () => {
  assert.equal(shouldWriteAgentMetrics({ ...guardBase, kind: 'full' } as RunState), true)
  assert.equal(shouldWriteAgentMetrics({ ...guardBase, kind: 'signal' } as RunState), true)
})
check('kind guard: reused/shared-root kinds are skipped (no clobber / mis-attribution)', () => {
  for (const kind of ['module', 'agent', 'rerun', 'screener-agent', 'sweep', 'handoff'] as const) {
    assert.equal(shouldWriteAgentMetrics({ ...guardBase, kind } as RunState), false, `${kind} must be skipped`)
  }
})
check('kind guard: a missing session or runRoot is skipped even for full/signal', () => {
  assert.equal(shouldWriteAgentMetrics({ runRoot: 'analyses/FOO', sessionId: undefined, kind: 'full' } as unknown as RunState), false)
  assert.equal(shouldWriteAgentMetrics({ runRoot: null, sessionId: 'sess-1', kind: 'signal' } as unknown as RunState), false)
})

console.log(`\n${passed} checks passed`)
