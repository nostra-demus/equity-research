import path from 'node:path'
import { execa } from 'execa'
import { REPO_ROOT } from './config'
import type { RunState } from './registry'
import type { RunKind } from './types'

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
    '--json', path.resolve(REPO_ROOT, runRoot, 'agent_metrics.json'),
  ]
}

// Only kinds that mint their OWN run folder get a metrics file: `full` (analyses/<ticker>_<date>) and
// `signal` (screener/runs/<sig>). `module`/`agent`/`rerun`/`screener-agent` REUSE an existing run folder, and
// `sweep`/`handoff` share one (screener/inbox, screener/ledger); writing there would overwrite — or, for the
// shared committed roots, mis-attribute — another run's metrics. The full/signal run already recorded every
// sub-agent it spawned under one session, so skipping the reused-root kinds loses nothing but the collision.
const METRICS_RUN_KINDS = new Set<RunKind>(['full', 'signal'])

// A run earns a metrics file only if it has a session to attribute AND mints its OWN run folder. Exported so
// the guard is unit-testable without spawning python or a paid run.
export function shouldWriteAgentMetrics(run: Pick<RunState, 'runRoot' | 'sessionId' | 'kind'>): boolean {
  return Boolean(run.runRoot) && Boolean(run.sessionId) && METRICS_RUN_KINDS.has(run.kind)
}

// Fire-and-forget on run finalize. Never throws; never blocks finalization.
export function writeAgentMetrics(run: RunState): void {
  if (!shouldWriteAgentMetrics(run)) return // no session/runRoot, or a reused/shared run root → don't fake or clobber
  void execa('python3', agentMetricsArgs(run.sessionId!, run.runRoot!), {
    cwd: REPO_ROOT,
    timeout: 120_000,
    reject: false, // a non-zero report (e.g. transcripts not found) is not a run failure
  }).catch(() => { /* best-effort: a missing python3 / read error must never affect the run */ })
}
