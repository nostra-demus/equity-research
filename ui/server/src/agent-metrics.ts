import path from 'node:path'
import { execa } from 'execa'
import { REPO_ROOT } from './config'
import type { RunState } from './registry'

// Per-agent cost + runtime, written to <RUN_ROOT>/agent_metrics.json when a run finalizes — so every run
// leaves a per-agent record the audit can aggregate across runs (the gap the screener-module audit found:
// no way to tell whether a sub-agent earns its spend, because spend was never recorded per agent).
//
// The accurate engine is scripts/run_cost_report.py: it reads the per-Task transcripts the harness already
// writes (`<session>/subagents/*.jsonl`) and dedups usage by requestId — REAL per-agent tokens × published
// rate, plus per-agent runtime — then writes the structured report to --json. We invoke it per run at
// finalize, keyed by the run's captured session id. This replaced an in-server proration of the run total
// by wall-clock share: the transcripts carry true per-Task usage, so the split no longer has to be guessed
// (the old estimate under-counted vs the deduped per-call usage the report reads).
//
// Best-effort by construction: telemetry must never break a run's finalization, so the spawn is
// fire-and-forget and every failure (no python3, transcripts not yet flushed, a non-zero report) is
// swallowed. A run with no captured session id gets no metrics file — we do not fabricate one.

const COST_REPORT = path.join(REPO_ROOT, 'scripts', 'run_cost_report.py')

// Per-run filename, not a fixed 'agent_metrics.json': several launch kinds reuse a run root (agent reruns
// target an existing run folder; sweep/handoff write under screener/inbox|ledger), so a fixed name would let
// a later run silently overwrite an earlier run's metrics. Keying on sessionId (unique per run) makes a
// reused folder accumulate one record per run instead of last-write-wins.
export function agentMetricsFilename(sessionId: string): string {
  return `agent_metrics.${sessionId}.json`
}

// Pure: the argv passed to python for a run's cost report. Exported so the wiring is unit-testable without
// spawning python or a paid engine run.
export function agentMetricsArgs(sessionId: string, runRoot: string): string[] {
  return [
    COST_REPORT,
    '--session', sessionId,
    '--repo-root', REPO_ROOT,
    // path.resolve (not path.join): runRoot is repo-relative by contract (registry.ts), but the rest of the
    // launcher defensively handles an absolute runRoot too (see launcher.ts's `path.isAbsolute(runRoot)`
    // sites). resolve matches that — a relative runRoot resolves against REPO_ROOT exactly as before, and an
    // absolute one is used as-is instead of being silently nested under REPO_ROOT (which would write the
    // metrics to a bogus path). Keeps this file consistent with its siblings.
    '--json', path.resolve(REPO_ROOT, runRoot, agentMetricsFilename(sessionId)),
  ]
}

// Run after the detached provider group is extinct and before the supervisor freezes terminal bytes. Never
// throws. Returning the exact filename lets the caller include it in the SAME immutable publication instead
// of starting a fire-and-forget Git writer after subject/admission claims have been released.
export async function writeAgentMetrics(run: RunState): Promise<string | null> {
  if (!run.runRoot || !run.sessionId) return null // no session transcript to attribute → no metrics file (we don't fake one)
  const filename = agentMetricsFilename(run.sessionId)
  try {
    const result = await execa('python3', agentMetricsArgs(run.sessionId, run.runRoot), {
      cwd: REPO_ROOT,
      timeout: 120_000,
      reject: false, // a non-zero report (e.g. transcripts not found) is not a run failure
    })
    return result.exitCode === 0 ? filename : null
  } catch { return null }
}
