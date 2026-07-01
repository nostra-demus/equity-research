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
import { runManifest, hasRunMarker } from './outputs'
import { IN_FLIGHT_STATUSES, listRuns } from './registry'
import { buildSwarmGraph } from './roster'
import { resolveInsideAnalyses, resolveInsideRuns } from './sandbox'
import { listResumableSignals } from './screener'
import { listSwarms, RESEARCH_SWARM_ID, runRootForSubject } from './swarms'
import type { RunKind, SwarmManifest } from './types'

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
}

function todayDate(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const DATE_SUFFIX = /_(\d{4}-\d{2}-\d{2})$/

// Subjects with a run currently in flight (holding a subject claim). Excluded — a live run is not
// interrupted, and resuming it would race admission.
function liveSubjectSet(): Set<string> {
  return new Set(listRuns().filter((r) => IN_FLIGHT_STATUSES.has(r.status)).map((r) => r.subjectId))
}

// The base name (without extension) of an agent output within a module folder, from its agentKey
// (`<module>/<NN>_<slug>`). Used to tell agent outputs (kept as "done") from the 99 synthesis.
function baseOf(agentKey: string): string {
  const i = agentKey.indexOf('/')
  return i >= 0 ? agentKey.slice(i + 1) : agentKey
}

// Collect resumable units from ONE non-screener swarm's run folders. Research folders are date-stamped
// (`<TICKER>_<DATE>`) and — per the same-day scope — only today's are eligible; constellation swarms
// (e.g. commodity) keep one stable folder per subject, so every folder is eligible.
function collectSwarmResumable(swarm: SwarmManifest, live: Set<string>, out: ResumableRunInfo[]): void {
  const isResearch = swarm.id === RESEARCH_SWARM_ID
  const resolve = isResearch ? resolveInsideAnalyses : resolveInsideRuns
  const runsRootAbs = path.join(REPO_ROOT, swarm.runsRoot)
  let entries: string[] = []
  try { entries = fs.readdirSync(runsRootAbs) } catch { return }

  const graph = buildSwarmGraph(swarm.id)
  const moduleNames = graph.modules.map((m) => m.name)
  const agentCountOf = new Map(graph.modules.map((m) => [m.name, m.agentCount]))

  for (const entry of entries) {
    let subject: string
    let runRoot: string
    if (isResearch) {
      const m = DATE_SUFFIX.exec(entry)
      if (!m) continue // not a "<TICKER>_<YYYY-MM-DD>" run folder
      if (m[1] !== todayDate()) continue // same-day scope: an older folder is out of scope
      subject = entry.slice(0, m.index)
      runRoot = `${swarm.runsRoot}/${entry}`
    } else {
      subject = entry // constellation swarm: the folder name IS the subject
      runRoot = runRootForSubject(swarm, subject) ?? `${swarm.runsRoot}/${entry}`
    }
    if (!subject || live.has(subject)) continue // never launched name, or currently running
    try { if (!fs.statSync(path.join(REPO_ROOT, runRoot)).isDirectory()) continue } catch { continue }
    if (hasRunMarker(runRoot, '.aborted')) continue // deliberately stopped (analyses-sandboxed; false for other swarms)

    let manifest: ReturnType<typeof runManifest>
    try { manifest = runManifest(runRoot, resolve) } catch { continue }

    const synthesisOf = (mod: string) => Boolean(manifest.moduleReports[mod]?.synthesis)
    // Complete = the run reached its terminal deliverable. Research ends on final_thesis.md — key on that
    // (NOT the last module's synthesis, or an all-modules-done-but-master-pending run would look finished
    // and never offer resume). A constellation swarm (commodity) ends on decision_record.json.
    const complete = isResearch ? manifest.finalThesis : manifest.decisionRecord
    if (complete) continue // finished — nothing to resume

    // Full-level entry (matches a `full` row, and a chained module/agent row that must resume the whole
    // pipeline). Counts are modules-done / total modules.
    const doneModules = moduleNames.filter(synthesisOf).length
    out.push({ swarm: swarm.id, subject, runRoot, kind: 'full', doneCount: doneModules, totalCount: moduleNames.length, unit: 'module' })

    // Module-level entries — one per module folder that has partial work (≥1 agent output) but no
    // synthesis yet. This is the granularity that makes the cancelled-solo-module case resumable.
    for (const mod of moduleNames) {
      const files = manifest.modules[mod]
      if (!files || files.length === 0) continue // never started — the full entry already covers it
      if (synthesisOf(mod)) continue // this module finished
      const doneAgents = files.filter((f) => !baseOf(f.agentKey).startsWith('99_')).length
      out.push({ swarm: swarm.id, subject, runRoot, kind: 'module', module: mod, doneCount: doneAgents, totalCount: agentCountOf.get(mod) ?? doneAgents, unit: 'agent' })
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
        out.push({ swarm: swarm.id, subject: s.sigId, runRoot, kind: 'signal', doneCount: s.doneCount, totalCount: s.totalCount, unit: 'module', label: s.headline })
      }
      continue
    }
    collectSwarmResumable(swarm, live, out)
  }
  return out
}
