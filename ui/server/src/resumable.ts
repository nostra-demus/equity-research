// Disk-truth detector for the MANUAL "Resume run" affordance (Activity log + orb view).
//
// This is deliberately BROADER than the resume supervisor's `.interrupted`-marker scan
// (resume-supervisor.ts). The supervisor auto-relaunches on its own, so it is conservative — it only
// touches runs that dropped a `.interrupted` marker (full/chained research runs broken by a plan-limit
// hit / dropped connection / kill) and never `incomplete` (a clean budget truncation, deliberately
// left un-marked so an auto-loop can't re-hit the same cap). A HUMAN clicking Resume is a deliberate
// act with a fresh budget, so it should be offered for every kind of interruption — including a solo
// `module` run that never gets a marker (the cancelled-EMAR-business-model case) and an `incomplete`
// full run (resume just finishes the master with a fresh budget).
//
// So resumability here is a MANIFEST fact, not a marker fact: a run folder whose final deliverable is
// missing, whose subject is not currently live, and which was not deliberately aborted. The detector is
// swarm-generic (CLAUDE.md §26): it walks every discovered swarm's run folders and reads completion via
// the shared `runManifest`. The screener is the one swarm with bespoke terminal-routing semantics, so it
// reuses `listResumableSignals` (the same call the supervisor and the screener board already use).

import fs from 'node:fs'
import path from 'node:path'
import { ANALYSES_DIR, REPO_ROOT } from './config'
import { readRunMarker, runManifest } from './outputs'
import { IN_FLIGHT_STATUSES, listRuns } from './registry'
import { buildSwarmGraph } from './roster'
import { resolveInsideAnalyses, resolveInsideRuns } from './sandbox'
import { listResumableSignals } from './screener'
import { listSwarms, RESEARCH_SWARM_ID, runRootForSubject } from './swarms'
import type { RunKind, SwarmManifest } from './types'
import type { ProviderExecutionProfile, RunProvider } from './providers/types'
import { hasProvenLegacyClaudeLineage, readLastProviderSelection } from './execution-provenance'
import { autoResumeDue } from './resume-policy'

// One resumable unit the cockpit can re-launch. A row in the Activity log (or an orb-view subject) is
// "resumable" when it matches one of these by (runRoot, kind, module). `unit` says what the counts mean.
export interface ResumableRunInfo {
  swarm: string
  subject: string // ticker (research) / SIG id (screener) / commodity name — the launch subject
  runRoot: string // repo-relative run folder
  kind: RunKind // 'full' | 'module' | 'signal' — the launch kind that continues this unit
  module?: string // present for a module-level resume
  doneCount: number
  totalCount: number
  unit: 'module' | 'agent' // whether the counts are modules-done (full/signal) or agents-done (module)
  label?: string // human label (e.g. the signal headline) when the raw subject id isn't the best name
  reason?: string
  resetsAt?: number
  autoResumeDue?: boolean
  provider?: RunProvider
  executionProfile?: ProviderExecutionProfile
}

function recordedExecution(runRoot: string): { provider?: RunProvider; executionProfile?: ProviderExecutionProfile } {
  const selected = readLastProviderSelection(runRoot)
  if (!selected) return hasProvenLegacyClaudeLineage(runRoot) ? { provider: 'claude' } : {}
  return {
    provider: selected.provider,
    executionProfile: selected.executionProfile,
  }
}

const DATE_SUFFIX = /_(\d{4}-\d{2}-\d{2})$/

interface RunFolder {
  entry: string
  subject: string
  runRoot: string
  date?: string
}

// Research folders are dated, but a saved run does not become worthless at midnight. Keep only the
// newest folder for each subject: if it is unfinished the user can complete it; if it is finished it
// supersedes older abandoned attempts and prevents a stale forest of Resume buttons. The launch path
// still performs the real freshness check, but Continue remains bound to this exact saved root.
//
// Validate directory shape before choosing the newest candidate. Otherwise a newer dangling symlink or
// plain file could hide the last real run and turn a recoverable partial into a false "nothing to resume".
function runFolders(swarm: SwarmManifest, entries: readonly string[]): RunFolder[] {
  const isResearch = swarm.id === RESEARCH_SWARM_ID
  const candidates: RunFolder[] = []
  for (const entry of entries) {
    const abs = path.join(REPO_ROOT, swarm.runsRoot, entry)
    try {
      const stat = fs.lstatSync(abs)
      if (!stat.isDirectory() || stat.isSymbolicLink()) continue
    } catch { continue }

    if (!isResearch) {
      candidates.push({
        entry,
        subject: entry,
        runRoot: runRootForSubject(swarm, entry) ?? `${swarm.runsRoot}/${entry}`,
      })
      continue
    }

    const match = DATE_SUFFIX.exec(entry)
    if (!match) continue
    const subject = entry.slice(0, match.index)
    if (!subject) continue
    candidates.push({ entry, subject, date: match[1], runRoot: `${swarm.runsRoot}/${entry}` })
  }

  if (!isResearch) return candidates
  const newest = new Map<string, RunFolder>()
  for (const candidate of candidates) {
    const current = newest.get(candidate.subject)
    if (!current || (candidate.date ?? '') > (current.date ?? '')) newest.set(candidate.subject, candidate)
  }
  return [...newest.values()].sort((a, b) => a.subject.localeCompare(b.subject))
}

// Subjects with a run currently in flight (holding a subject claim), OR a run that is still finalizing.
// Both are excluded — a live run is not interrupted, and resuming it would race admission.
//
// The `endedAt === undefined` half closes a real cancel→resume race: on Cancel, cancel() sets status out
// of IN_FLIGHT *synchronously* but only SIGTERMs the child; the process may keep writing/committing until
// the SIGKILL fallback and its close handler run (which is what sets endedAt). Now that a deliberately
// cancelled (.aborted) run is offered for manual resume, offering it BEFORE the old child has exited would
// let a second engine admit into the SAME analyses/<TICKER>_<DATE> folder while the first is still
// writing — the interleaved/lost-writes hazard the force-stop path guards against. So a cancelled run
// becomes resumable only once its child has actually exited (endedAt set).
function liveSubjectSet(): Set<string> {
  return new Set(
    listRuns()
      .filter((r) => IN_FLIGHT_STATUSES.has(r.status) || r.endedAt === undefined)
      .map((r) => r.subjectId),
  )
}

// The base name (without extension) of an agent output within a module folder, from its agentKey
// (`<module>/<NN>_<slug>`). Used to tell agent outputs (kept as "done") from the 99 synthesis.
function baseOf(agentKey: string): string {
  const i = agentKey.indexOf('/')
  return i >= 0 ? agentKey.slice(i + 1) : agentKey
}

// Collect resumable units from ONE non-screener swarm's run folders. Research folders are date-stamped
// (`<TICKER>_<DATE>`) and the newest folder per subject is eligible even after midnight; constellation
// swarms (e.g. commodity) keep one stable folder per subject, so every folder is eligible.
function collectSwarmResumable(swarm: SwarmManifest, live: Set<string>, out: ResumableRunInfo[]): void {
  const isResearch = swarm.id === RESEARCH_SWARM_ID
  const resolve = isResearch ? resolveInsideAnalyses : resolveInsideRuns
  const runsRootAbs = path.join(REPO_ROOT, swarm.runsRoot)
  let entries: string[] = []
  try { entries = fs.readdirSync(runsRootAbs) } catch { return }

  const graph = buildSwarmGraph(swarm.id)
  const moduleNames = graph.modules.map((m) => m.name)
  const agentCountOf = new Map(graph.modules.map((m) => [m.name, m.agentCount]))

  for (const folder of runFolders(swarm, entries)) {
    const { subject, runRoot } = folder
    if (!subject || live.has(subject)) continue // never launched name, or currently running
    // NOTE: a `.aborted` marker (a deliberate Cancel) is NOT excluded here. Cancel = pause: it stops the
    // run and leaves the finished modules on disk, and clicking Resume is the user's explicit choice to
    // continue — so a cancelled-but-unfinished run must still offer Resume (that's how pause→resume works,
    // and what this file's header intends). The AUTO resume supervisor stays conservative — it has its own
    // `.interrupted`-only scan (resume-supervisor.ts) that never touches `.aborted`, so nothing auto-
    // resurrects a deliberate stop; only this manual affordance offers it. launchFullChained clears the
    // `.aborted` marker when the user does resume.

    let manifest: ReturnType<typeof runManifest>
    try { manifest = runManifest(runRoot, resolve) } catch { continue }

    const synthesisOf = (mod: string) => Boolean(manifest.moduleReports[mod]?.synthesis)
    // Complete = the run reached its terminal deliverable. Research ends on final_thesis.md — key on that
    // (NOT the last module's synthesis, or an all-modules-done-but-master-pending run would look finished
    // and never offer resume). A constellation swarm (commodity) ends on decision_record.json.
    const interrupted = readRunMarker(runRoot, '.interrupted')
    // A stable constellation root may retain last month's decision while this month's refresh is paused.
    // Any current-epoch interruption marker therefore outranks old terminal-file presence.
    const complete = (isResearch ? manifest.finalThesis : manifest.decisionRecord) && !interrupted
    if (complete) continue // finished — nothing to resume

    // Full-level entry (matches a `full` row, and a chained module/agent row that must resume the whole
    // pipeline). Counts are modules-done / total modules.
    const doneModules = moduleNames.filter(synthesisOf).length
    const execution = recordedExecution(runRoot)
    const reason = typeof interrupted?.reason === 'string' ? interrupted.reason : undefined
    const resetsAt = typeof interrupted?.resetsAt === 'number' ? interrupted.resetsAt : undefined
    out.push({
      swarm: swarm.id, subject, runRoot, kind: 'full', doneCount: doneModules,
      totalCount: moduleNames.length, unit: 'module', reason, resetsAt,
      autoResumeDue: Boolean(interrupted) && autoResumeDue(reason, resetsAt), ...execution,
    })

    // Module-level entries — one per module folder that has partial work (≥1 agent output) but no
    // synthesis yet. This is the granularity that makes the cancelled-solo-module case resumable.
    for (const mod of moduleNames) {
      const files = manifest.modules[mod]
      if (!files || files.length === 0) continue // never started — the full entry already covers it
      if (synthesisOf(mod)) continue // this module finished
      const doneAgents = files.filter((f) => !baseOf(f.agentKey).startsWith('99_')).length
      out.push({ swarm: swarm.id, subject, runRoot, kind: 'module', module: mod, doneCount: doneAgents, totalCount: agentCountOf.get(mod) ?? doneAgents, unit: 'agent', ...execution })
    }
  }
}

// The full set of runs the cockpit can resume right now, across every swarm. Recomputed from disk on
// each call — the in-memory registry is wiped on restart, so the run folders are the only surviving truth.
export function listResumableRuns(): ResumableRunInfo[] {
  const live = liveSubjectSet()
  const out: ResumableRunInfo[] = []
  for (const swarm of listSwarms()) {
    if (swarm.id === 'screener') {
      // The screener owns bespoke terminal-routing / `.target` semantics — reuse its disk scan verbatim.
      for (const s of listResumableSignals(live)) {
        const runRoot = runRootForSubject(swarm, s.sigId)
        if (!runRoot) continue
        out.push({ swarm: swarm.id, subject: s.sigId, runRoot, kind: 'signal', doneCount: s.doneCount, totalCount: s.totalCount, unit: 'module', label: s.headline, reason: s.reason, resetsAt: s.resetsAt, autoResumeDue: s.autoResumeDue, ...recordedExecution(runRoot) })
      }
      continue
    }
    collectSwarmResumable(swarm, live, out)
  }
  return out
}
