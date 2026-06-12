import fs from 'node:fs'
import path from 'node:path'
import { MAX_CONCURRENT_RUNS, REPO_ROOT } from './config'
import { inFlightRunsForSubject, listRuns } from './registry'
import { buildSwarmGraph, depsCompleteForModule, moduleAncestors, transitiveDownstreamModules } from './roster'
import type { AdmissionDecision, RunKind } from './types'

// Everything admitRun needs, computed by the launcher BEFORE createRun so the decision and the
// register step stay in one synchronous block (no await between them => atomic under Node's loop).
export interface AdmissionRequest {
  ticker: string // the SUBJECT id: research ticker, or a swarm unit id (e.g. SIG-…) — the concurrency key
  kind: RunKind
  swarmId?: string // defaults to 'research'; module-DAG rules are scoped per swarm
  coveredModules: string[] // modules this run writes into
  writeTargetsAbs: string[] // absolute paths this run writes
  readDepsAbs: string[] // absolute requiredUpstream read paths (agent runs); [] otherwise
}

// Exclusive = the run writes shared run-root artifacts / the whole run folder. A screener `signal`
// run owns its entire SIG folder the same way a research `full` owns its dated folder. `sweep` and
// `handoff` are exclusive on their SUBJECT ('sweep' / `<thesis>::<ticker>`): each rewrites shared
// screener stores (today's inbox + the board / the handoff ledger + the data seed), so two of the
// same subject must be rejected, never interleaved — a duplicate sweep can silently drop the other
// run's inbox rows, a duplicate handoff double-fires the paid CLI. Different handoff subjects still
// run concurrently.
const isExclusive = (k: RunKind) => k === 'full' || k === 'rerun' || k === 'signal' || k === 'sweep' || k === 'handoff'
const rel = (p: string) => path.relative(REPO_ROOT, p)

// Dependency-aware admission. Returns {ok:true} or a discriminated rejection. Pure + synchronous
// (fs.existsSync / in-memory reads only). Rules are evaluated D1 -> D4b -> D5 so a specific conflict
// is reported before the generic global cap. Keyed by SUBJECT (ticker / signal id): different
// subjects always run concurrently; module-scope rules (D2b/D3/D4) compare runs of the SAME swarm
// only — module names are swarm-local.
export function admitRun(req: AdmissionRequest): AdmissionDecision {
  const { ticker, kind, coveredModules, writeTargetsAbs, readDepsAbs } = req
  const swarmId = req.swarmId || 'research'
  const inflight = inFlightRunsForSubject(ticker)
  const graph = buildSwarmGraph(swarmId)

  // D1 — exclusivity for shared run-root writers (full/rerun write final_thesis/memo/dossier and
  // full commits the whole-folder pathspec). Applied independent of the requested kind.
  if (isExclusive(kind) && inflight.length > 0) {
    const b = inflight[0]
    return { ok: false, code: 'exclusivity', httpStatus: 409, blockingRunId: b.runId, blockingKind: b.kind }
  }
  const exclusiveBlocker = inflight.find((e) => isExclusive(e.kind))
  if (exclusiveBlocker) {
    return { ok: false, code: 'exclusivity', httpStatus: 409, blockingRunId: exclusiveBlocker.runId, blockingKind: exclusiveBlocker.kind }
  }

  // D2 — disjoint absolute writes.
  const targets = new Set(writeTargetsAbs)
  for (const e of inflight) {
    const overlap = e.writeTargetsAbs.filter((p) => targets.has(p))
    if (overlap.length) {
      return { ok: false, code: 'target_conflict', httpStatus: 409, conflictRunId: e.runId, conflictTargets: overlap.map(rel) }
    }
  }

  // D2b — module-scope writer conflict (catches the root-timing race D2 misses): a `module` run
  // covering M conflicts with ANY in-flight run covering M; a solo `agent` in M conflicts with an
  // in-flight `module` run covering M. (full/rerun handled by D1; agent-vs-agent left to D2 + D4b.)
  if (kind === 'module' || kind === 'agent' || kind === 'screener-agent') {
    for (const e of inflight) {
      if ((e.swarmId || 'research') !== swarmId) continue // module names are swarm-local
      const eIsModuleScopeWriter = e.kind === 'module' || isExclusive(e.kind)
      const relevant = kind === 'module' ? true : eIsModuleScopeWriter
      if (!relevant) continue
      const shared = coveredModules.find((m) => e.coveredModules.includes(m))
      if (shared) {
        return {
          ok: false,
          code: 'dependency_conflict',
          httpStatus: 409,
          conflictRunId: e.runId,
          reason: 'module-scope-writer',
          detail: { requestedModule: shared, conflictModule: shared },
        }
      }
    }
  }

  // D3 — no upstream/downstream overlap in the dependsOn DAG (bidirectional race-killer).
  if (kind === 'module' || kind === 'agent' || kind === 'screener-agent') {
    const ancestors = new Set<string>()
    const descendants = new Set<string>()
    for (const m of coveredModules) {
      for (const a of moduleAncestors(graph, m)) ancestors.add(a)
      for (const d of transitiveDownstreamModules(graph, m)) descendants.add(d)
    }
    for (const e of inflight) {
      if ((e.swarmId || 'research') !== swarmId) continue // DAG relations are swarm-local
      for (const em of e.coveredModules) {
        if (ancestors.has(em) || descendants.has(em)) {
          return {
            ok: false,
            code: 'dependency_conflict',
            httpStatus: 409,
            conflictRunId: e.runId,
            reason: 'module-ancestry',
            detail: { conflictModule: em, relation: ancestors.has(em) ? 'ancestor' : 'descendant' },
          }
        }
      }
    }
  }

  // D4 — cross-module deps complete on disk (the exact folder the command will pick). Checks only
  // module.dependsOn. This intentionally tightens cockpit behavior vs standalone-command fallback.
  if (kind === 'module' || kind === 'agent' || kind === 'screener-agent') {
    const missing = new Set<string>()
    for (const m of coveredModules) {
      for (const dep of depsCompleteForModule(ticker, m, swarmId).missing) missing.add(dep)
    }
    if (missing.size) {
      return { ok: false, code: 'upstream_incomplete', httpStatus: 400, missing: [...missing] }
    }
  }

  // D4b — required-upstream stability (solo agent runs): intra-module reads must EXIST on disk AND
  // not be in any in-flight run's write set (an agent reading a file another agent is rewriting).
  if ((kind === 'agent' || kind === 'screener-agent') && readDepsAbs.length) {
    const missingFiles = readDepsAbs.filter((p) => !fs.existsSync(p))
    if (missingFiles.length) {
      return { ok: false, code: 'upstream_incomplete', httpStatus: 400, missing: missingFiles.map(rel) }
    }
    for (const e of inflight) {
      const clash = readDepsAbs.filter((p) => e.writeTargetsAbs.includes(p))
      if (clash.length) {
        return {
          ok: false,
          code: 'dependency_conflict',
          httpStatus: 409,
          conflictRunId: e.runId,
          reason: 'upstream-file-in-flight',
          detail: { conflictFiles: clash.map(rel) },
        }
      }
    }
  }

  // D5 — global concurrency cap across ALL tickers (cost / rate-limit backstop). Checked last so a
  // specific, actionable conflict is reported before the generic cap.
  const liveCount = listRuns().filter((r) => r.status === 'starting' || r.status === 'running').length
  if (liveCount >= MAX_CONCURRENT_RUNS) {
    return { ok: false, code: 'capacity', httpStatus: 429, activeCount: liveCount, cap: MAX_CONCURRENT_RUNS }
  }

  return { ok: true }
}
