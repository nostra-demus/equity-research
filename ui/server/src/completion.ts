// "Complete the thesis" — what is actually missing, and what can be REUSED instead of paid for again.
//
// The cockpit's core orb used to dead-end on a toast ("No final thesis yet"). That toast was true but
// useless, and it hid an expensive lie: a subject's finished modules can be spread across SEVERAL dated
// run folders (`analyses/<TICKER>_<DATE>/`), while the cockpit's manifest reads only the latest one and
// the master synthesizer reads only ONE folder. So a user staring at "no thesis" would click "Run full",
// land in a fresh `analyses/<TICKER>_<TODAY>` folder, and re-run every module from scratch — paying the
// full pipeline price for work already sitting on disk one folder over.
//
// This module makes the reuse explicit and priced:
//
//   1. `thesisPlan()` reads DISK TRUTH across every dated run folder (the same `latestModuleFolder`
//      resolution the dependency gate and the module commands' F30 upstream fallback already use), and
//      reports, per module: done / stale / partial / missing — plus the vintage (which dated run it came
//      from) and what the remaining work costs versus a naive full re-run.
//
//   2. `carryForwardModules()` copies the reused modules' outputs into TODAY's run root, each stamped with
//      a `CARRIED_FORWARD.md` provenance note recording the run it came from and that it was NOT re-run.
//
// Carrying into TODAY's root (never into a prior-dated folder) is what makes the rest of the engine work
// unchanged: `launchFullChained` already seeds its skip-set from `analyses/<TICKER>_<TODAY>`, and the
// monolithic `/research:full` step 8 already skips any module whose `99_*-synthesis.md` is non-empty in
// the run root. So after a carry-forward, BOTH full-run paths reuse the carried modules and run only the
// remainder + master, and `chainedResumePreflight` prices only that remainder. No launcher change needed.
// It also honours `synthesizer.md`'s standing rule — prior-run folders are never modified, only read.
//
// Staleness (CLAUDE.md §11 — a stale input must not masquerade as a fresh one): a carried module's
// evidence was read against the data pool as it stood on its run date. If `data/<TICKER>/` has gained a
// newer file since, the module predates the data it should have read (and `verify-evidence` would no
// longer find its citations in today's extract corpus). Such a module is reported `stale` and is NOT in
// the default reuse set — it is re-run unless the caller explicitly opts to keep it.
//
// Swarm-generic (CLAUDE.md §26): every module name comes from the discovered graph. Only the research
// swarm has dated run folders, so only it can carry forward; a constellation swarm keeps one stable
// folder per subject, where "reuse" is already the natural behaviour and the carry set is always empty.

import fs from 'node:fs'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { ANALYSES_DIR, DATA_DIR, REPO_ROOT } from './config'
import { canonicalJsonText } from './canonical-json'
import { chainedResumePreflight, estimate } from './launcher'
import { runManifest } from './outputs'
import { buildSwarmGraph, findRunRootForSubject, moduleAncestors, terminalModuleName, transitiveDownstreamModules } from './roster'
import { resolveInsideAnalyses, resolveInsideRuns, safeSubjectSegment } from './sandbox'
import { RESEARCH_SWARM_ID, runRootForSubject, swarmById } from './swarms'
import { SCOPED_STAGE_INTENT_FILE, SCOPED_STAGE_INTENT_VERSION, type LaunchPreflight } from './types'

/** How a module stands relative to a thesis that still needs to be produced. */
export type ModuleState =
  | 'done' // a non-empty 99 synthesis exists and predates no newer data — reuse it, do not pay again
  | 'stale' // a synthesis exists, but the data pool has gained a file since that run — re-run it
  | 'partial' // some specialist outputs exist, but no synthesis — the module never finished
  | 'missing' // the module has never run for this subject

export interface ModulePlanEntry {
  module: string
  state: ModuleState
  /** the run this module's evidence truly dates to — read from the carry stamp when the newest
   *  candidate is itself a carried-forward copy, so vintage is never laundered into a copy's date.
   *  Provenance/display only — NOT necessarily a folder that still exists (see `copyFromRunRoot`). */
  sourceRunRoot?: string
  /** the run vintage — the `<DATE>` of `sourceRunRoot` (absent for a non-dated swarm root) */
  sourceDate?: string
  /** the folder to physically COPY FROM — always the real, currently-existing candidate folder
   *  (`finished.runRoot`), never a historical stamp target that may since have been pruned. Carrying
   *  reads bytes from here but reports the vintage from `sourceDate`/`sourceRunRoot`. */
  copyFromRunRoot?: string
  /** true when the newest outputs already live in the target run root (nothing to carry) */
  inTargetRoot: boolean
  /** orbs on disk that the module pipeline will actually REUSE — counted with `validAgentOutputs`, not by
   *  filename, so an empty or header-less file (which Step 4A re-dispatches) is never counted as finished. */
  doneAgents: number
  totalAgents: number
  /** plain-English reason this module's evidence predates the data pool. Populated for `stale` (a finished
   *  module) AND for `partial` (its unfinished orbs) — in both cases it means "do not reuse this, run it". */
  staleReason?: string
  /** ancestors of this module that are themselves in `run` — this module cannot run until they have. Empty
   *  for a module whose whole `depends_on` closure is being reused. Never set for a reused module. */
  blockedBy: string[]
  /** this module can be launched on its own RIGHT NOW: it is in `run`, and nothing upstream of it is. */
  runnable: boolean
  /** orbs that would actually execute if this module ran now — `totalAgents` minus the orbs a resume would
   *  reuse. Equals `totalAgents` for a missing module and for a stale partial (whose orbs are discarded). */
  willRunAgents: number
}

export interface ThesisPlan {
  swarm: string
  subject: string
  /** the run root a completion would write into */
  targetRunRoot: string
  /** the run already produced its final deliverable — nothing to complete */
  complete: boolean
  finalReportPath: string | null
  modules: ModulePlanEntry[]
  /** every module a caller is ALLOWED to reuse — it has a finished synthesis somewhere on disk. Includes
   *  `stale` ones: staleness is a strong default, not a prohibition, and the user may knowingly keep one. */
  reusable: string[]
  /** modules the run CANNOT rebuild even if asked: their finished synthesis already sits in the target run
   *  root, and BOTH full-run paths skip any module whose `99_*-synthesis.md` is non-empty there. Offering a
   *  "re-run" toggle for these would be a lie — the launcher would skip them and their orbs would sit queued
   *  forever. They are always in `reuse`. To genuinely rebuild one, use the orb's Re-run (a rerun cascade). */
  mustReuse: string[]
  /** modules this plan REUSES (carried, never re-run). Defaults to the `done` set — stale is re-run — but
   *  a caller may override it with any subset of `reusable`. */
  reuse: string[]
  /** modules this plan actually runs — the exact complement of `reuse` */
  run: string[]
  /** modules that must be copied into the target root before the run (subset of `reuse`). `from`/`date`
   *  are the TRUE origin (provenance, written into the stamp); `copyFrom` is the folder actually read —
   *  they can differ when the newest candidate is itself an intermediate carried-forward copy. */
  carry: { module: string; from: string; date: string | null; copyFrom: string }[]
  master: { state: 'ready' | 'blocked' | 'done'; blockedBy: string[] }
  dataPool: { files: number; newestDate: string | null }
  /** cost/time of running ONLY the remaining work (what the Run button commits to) */
  preflight: LaunchPreflight
  /** cost/time of the naive full re-run the user would otherwise pay — the savings, made visible */
  fullPreflight: LaunchPreflight
  /** carry-forward is only meaningful where run folders are dated (research) */
  canCarry: boolean
}

const DATE_SUFFIX = /_(\d{4}-\d{2}-\d{2})$/
export function todayDate(now: Date = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

/** A module folder "finished" iff it holds a non-empty `99_*-synthesis.md` — the same test the resume
 *  seeding, the screener board, and `/research:full` step 8 all use. Never keyed on a module name. */
function hasSynthesis(moduleDirAbs: string): boolean {
  let entries: string[]
  try {
    entries = fs.readdirSync(moduleDirAbs)
  } catch {
    return false
  }
  return entries.some((f) => {
    if (!/^99_.*-synthesis\.md$/.test(f)) return false
    try {
      return fs.statSync(path.join(moduleDirAbs, f)).size > 0
    } catch {
      return false
    }
  })
}

function countAgentOutputs(moduleDirAbs: string): number {
  return validAgentOutputs(moduleDirAbs).length
}

/** The orb outputs a resume will genuinely REUSE, newest-name-first-sorted, as `NN_slug.md` basenames.
 *
 *  Keyed on the same test the module pipeline itself applies before deciding to skip an agent
 *  (`frameworks/MODULE_PIPELINE.md` Step 4A): the file must exist, be non-empty, and start with a
 *  top-level `#` header. A filename-only count is an OVER-count — an empty or truncated `03_*.md` reads as
 *  "finished" here while Step 4A re-dispatches it, so the panel would promise "8 orbs run" and 9 would run.
 *  That is precisely the class of lie this whole module exists to prevent, so the count and the pipeline's
 *  skip test have to be the same test.
 *
 *  The pipeline additionally rejects a file truncated mid-section or inside an unclosed code fence. We do
 *  not replicate that here: it is a judgment the dispatching model makes on the file's prose, and guessing
 *  at it would UNDER-count (promising to re-run an orb the pipeline then skips). Under-counting is the safe
 *  direction — the header check catches the mechanical failures (empty / preamble-first) that actually occur. */
function validAgentOutputs(moduleDirAbs: string): string[] {
  let entries: string[]
  try {
    entries = fs.readdirSync(moduleDirAbs)
  } catch {
    return []
  }
  return entries
    .filter((f) => /^[0-9]{2}_.*\.md$/.test(f) && !/^99_/.test(f))
    .filter((f) => {
      try {
        const body = fs.readFileSync(path.join(moduleDirAbs, f), 'utf8')
        return body.trimStart().startsWith('#')
      } catch {
        return false
      }
    })
    .sort()
}

/** The machine-readable provenance line inside a `CARRIED_FORWARD.md` stamp. */
const CARRY_PROVENANCE = /<!--\s*carried-from:\s*(\S+)\s*\|\s*run-date:\s*(\d{4}-\d{2}-\d{2})\s*-->/

/** A carried module physically lives in a folder named for TODAY, but its evidence was read against the data
 *  pool of its SOURCE run. If we took the vintage from the folder name, a module carried once would report
 *  today's date and could never be stale again — the exact "silently age a conclusion forward" failure the
 *  stamp exists to prevent (§11). So the stamp, not the folder name, is the vintage of record. */
function carriedVintage(moduleDirAbs: string): { from: string; date: string } | null {
  try {
    const m = CARRY_PROVENANCE.exec(fs.readFileSync(path.join(moduleDirAbs, CARRY_MARKER), 'utf8'))
    return m ? { from: m[1], date: m[2] } : null
  } catch {
    return null
  }
}

/** The twin of `CARRIED_FORWARD.md`, for a module that was RESUMED rather than reused whole: its finished
 *  orbs were copied in from an unfinished earlier run, and the rest ran here.
 *
 *  It is deliberately a DIFFERENT filename with a DIFFERENT provenance key (`resumed-from:`, never
 *  `carried-from:`). `carriedVintage` above is what dates a FINISHED module, and it must never match this
 *  marker: a module that was resumed and then genuinely completed today did run today, and reading a
 *  carry stamp would back-date the whole module to the run its one leftover orb came from.
 *
 *  Matches none of the engine's output patterns (`NN_*.md`, `99_*-synthesis.md`, `*_memo.md`,
 *  `*_dossier.md`), so it is never mistaken for a specialist report — while still being swept into the
 *  module and audit dossiers' lossless `*.md` concatenation, which is where an auditor should find it. */
const RESUME_MARKER = 'RESUMED_FROM.md'
const RESUME_PROVENANCE = /<!--\s*resumed-from:\s*(\S+)\s*\|\s*run-date:\s*(\d{4}-\d{2}-\d{2})\s*-->/

/** A resumed module's orbs physically live in a folder named for the run that COPIED them, so — exactly as
 *  with `carriedVintage` — the stamp, not the folder name, is the vintage of record. Without this, orbs
 *  resumed on Jul 10 from a Jul 4 run would report "Jul 10" and never face a staleness check against data
 *  that landed Jul 5–9 (CLAUDE.md §11). Read for `partial` entries only. */
function resumedVintage(moduleDirAbs: string): { from: string; date: string } | null {
  try {
    const m = RESUME_PROVENANCE.exec(fs.readFileSync(path.join(moduleDirAbs, RESUME_MARKER), 'utf8'))
    return m ? { from: m[1], date: m[2] } : null
  } catch {
    return null
  }
}

/** Every dated run folder for `ticker`, newest date first. Read ONCE per plan: `GET /api/thesis-plan` fires
 *  on every checkbox toggle, and a per-module `readdirSync(ANALYSES_DIR)` would re-scan a directory that grows
 *  one folder per subject per run — N blocking directory reads per click, on the same event loop that is
 *  pushing the run's SSE stream. */
function datedRunFoldersFor(ticker: string): { runRoot: string; date: string }[] {
  let entries: string[]
  try {
    entries = fs.readdirSync(ANALYSES_DIR)
  } catch {
    return []
  }
  const out: { runRoot: string; date: string }[] = []
  for (const entry of entries) {
    const m = DATE_SUFFIX.exec(entry)
    // `m.index` is the offset of the `_`, so "AMZNX_2026-01-01" yields "AMZNX" and never matches "AMZN".
    if (!m || entry.slice(0, m.index) !== ticker) continue
    out.push({ runRoot: `analyses/${entry}`, date: m[1] })
  }
  return out.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
}

/** The folders (newest first) that actually contain `module`. */
function foldersWithModule(folders: { runRoot: string; date: string }[], module: string): { runRoot: string; date: string }[] {
  return folders.filter((f) => {
    try {
      return fs.statSync(path.join(REPO_ROOT, f.runRoot, module)).isDirectory()
    } catch {
      return false
    }
  })
}

/** Newest file in the subject's data pool. `data/` is untracked (gitignored), so unlike `analyses/` its
 *  mtimes are never rewritten by a checkout or a rebase — they are the one durable freshness signal we
 *  have. Returns the local calendar date, which is what run folders are named by. */
export function dataPoolNewest(ticker: string, dataDir: string = DATA_DIR): { files: number; newestDate: string | null; newestMs: number } {
  // `ticker` reaches here from a query string. Reduce it to a proven single path segment before it touches
  // the filesystem — otherwise `dataPoolNewest('..')` walks the whole repo on a blocking stat.
  const root = path.join(dataDir, safeSubjectSegment(ticker))
  let files = 0
  let newestMtimeMs = 0 // mtime-only → drives `newestDate`, the staleness floor's calendar-day basis (unchanged)
  let newestMs = 0 // max(mtime, ctime) → the intake freshness witness (see below)
  const walk = (dir: string, depth: number): void => {
    // Over-approximate the reader's scope: the intake command's `find` and the extractor's iter_pool_files
    // walk the pool unbounded, so this freshness scan must too — else a document nested deeper than the cap
    // (e.g. external/<provider>/<sub>/…) lands unseen and a stale run/plan reads as fresh. The walk never
    // follows symlinks (a symlinked dir is not e.isDirectory()), so a generous cap is loop-safe.
    if (depth > 24) return
    let entries: fs.Dirent[]
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true })
    } catch {
      return
    }
    for (const e of entries) {
      if (e.name.startsWith('.')) continue
      const p = path.join(dir, e.name)
      if (e.isDirectory()) {
        walk(p, depth + 1)
        continue
      }
      if (!e.isFile()) continue
      files++
      try {
        const st = fs.statSync(p)
        if (st.mtimeMs > newestMtimeMs) newestMtimeMs = st.mtimeMs
        // newestMs = max(mtime, ctime): mtime is the document's own modification time, but data/ is a
        // Google-Drive mount and Drive — like `cp -p` / `rsync -t` / `unzip` — materialises a file with its
        // ORIGINAL (often older) mtime, so a doc dropped in late but authored earlier would look old. ctime
        // is the local inode-change time (link/create) which those tools do NOT preserve, so it reflects
        // true arrival. Only `newestMs` uses it (the intake witness, an over-approximation that never
        // under-reports arrival); `newestDate` stays mtime-only so the staleness floor keeps its calendar-
        // day meaning ("the pool gained a document DATED after this run").
        const arrivalMs = Math.max(st.mtimeMs, st.ctimeMs)
        if (arrivalMs > newestMs) newestMs = arrivalMs
      } catch {
        /* vanished mid-scan */
      }
    }
  }
  walk(root, 0)
  // `newestDate` is the calendar-day signal the staleness floor uses (same-day ambiguity tolerated),
  // mtime-only so it means "the pool gained a document DATED after this run". `newestMs` is the finer
  // arrival signal (max mtime/ctime) for callers that must prove a plan saw the whole pool — the intake
  // pool-currency check. Both are 0/null when the pool is empty.
  return { files, newestDate: newestMtimeMs > 0 ? todayDate(new Date(newestMtimeMs)) : null, newestMs }
}

/** A module is stale when the data pool gained a file on a LATER calendar day than the run that produced
 *  it. A same-day tie is NOT flagged: the run folder carries only a date, so we cannot tell whether the
 *  file landed before or after the module read the pool, and re-running on a coin-flip would burn money
 *  for nothing. Same-day ambiguity is disclosed in the returned reason, never silently resolved. */
function stalenessOf(sourceDate: string | undefined, newestDate: string | null): string | undefined {
  if (!sourceDate || !newestDate) return undefined
  if (newestDate <= sourceDate) return undefined
  return `ran ${sourceDate}; the data pool gained a file on ${newestDate} that this module never read`
}

/**
 * @param reuseOverride the caller's chosen reuse set. Omit for the safe default (reuse everything `done`,
 *   re-run everything `stale`). Any module not in `reusable` is ignored — a caller can never reuse work
 *   that does not exist, and the server's own disk read always has the last word.
 */
export function thesisPlan(
  subject: string,
  swarmId: string = RESEARCH_SWARM_ID,
  reuseOverride?: string[],
  targetRunRootOverride?: string,
): ThesisPlan {
  const swarm = swarmById(swarmId)
  const graph = buildSwarmGraph(swarmId)
  const isResearch = swarmId === RESEARCH_SWARM_ID

  // Every path below is built from `safe`, never from the raw `subject` string that arrived on a query
  // string. `safeSubjectSegment` proves it is one path segment with no separator and no traversal, so no
  // amount of `..`/`/` in the request can steer a readdir, a stat, or a write out of its intended tree.
  const safe = safeSubjectSegment(subject)

  // Where a completion writes. Research: today's dated folder — the one BOTH full-run paths seed their
  // skip-set from. Any other swarm: its single stable per-subject folder.
  let targetRunRoot: string
  if (targetRunRootOverride !== undefined) {
    const match = targetRunRootOverride.match(/^analyses\/([A-Z0-9.\-]{1,40})_(\d{4}-\d{2}-\d{2})$/)
    if (!isResearch || !match || match[1] !== safe) {
      throw new Error('target run root override is unsafe')
    }
    targetRunRoot = targetRunRootOverride
  } else {
    targetRunRoot = isResearch
      ? `analyses/${safe}_${todayDate()}`
      : (swarm && runRootForSubject(swarm, safe)) || `analyses/${safe}`
  }

  const targetAbs = path.join(REPO_ROOT, targetRunRoot)
  const pool = dataPoolNewest(safe)
  const dated = isResearch ? datedRunFoldersFor(safe) : []

  const modules: ModulePlanEntry[] = []
  const mustReuse: string[] = []
  for (const m of graph.modules) {
    const totalAgents = m.agentCount
    // Candidate folders holding this module, newest vintage first. For a non-dated swarm there is exactly
    // one root, so this collapses to "is it in the run folder".
    const candidates = isResearch
      ? foldersWithModule(dated, m.name)
      : (() => {
          const root = findRunRootForSubject(swarmId, safe)
          if (!root) return []
          const rel = path.relative(REPO_ROOT, root)
          return fs.existsSync(path.join(root, m.name)) ? [{ runRoot: rel, date: '' }] : []
        })()

    const finished = candidates.find((c) => hasSynthesis(path.join(REPO_ROOT, c.runRoot, m.name)))
    if (finished) {
      const inTargetRoot = finished.runRoot === targetRunRoot
      // A carried module's folder is named for whichever run COPIED it, not the run that produced its
      // evidence — and that is true whether it landed in TODAY's target root or in some OTHER prior dated
      // folder that itself carried it forward (a module carried into `_07-05`, then found again as the
      // newest candidate while planning `_07-08`). Reading the stamp only when `inTargetRoot` would let
      // that intermediate folder's date stand in for the true vintage, silently aging the module forward
      // and under-reporting staleness against data that landed between the ORIGINAL run and today.
      const carried = carriedVintage(path.join(REPO_ROOT, finished.runRoot, m.name))
      const sourceRunRoot = carried?.from ?? finished.runRoot
      const sourceDate = carried?.date ?? (finished.date || undefined)
      const staleReason = stalenessOf(sourceDate, pool.newestDate)
      // Its synthesis is already in the run root the launcher will seed its skip-set from, so this module is
      // reused whether the user wants it or not. Say so rather than offer a toggle that does nothing.
      if (inTargetRoot) mustReuse.push(m.name)
      modules.push({
        module: m.name,
        state: staleReason ? 'stale' : 'done',
        sourceRunRoot,
        sourceDate,
        // Always the folder `foldersWithModule`/`hasSynthesis` just proved has the complete files RIGHT
        // NOW — never the stamp's historical origin, which may have been pruned since.
        copyFromRunRoot: finished.runRoot,
        inTargetRoot,
        doneAgents: countAgentOutputs(path.join(REPO_ROOT, finished.runRoot, m.name)),
        totalAgents,
        staleReason,
        // A reused module never runs, and a rebuilt one runs whole. Both are settled by the reuse set, not
        // by orbs on disk — filled in by the second pass below once `run`/`reuse` are known.
        blockedBy: [],
        runnable: false,
        willRunAgents: totalAgents,
      })
      continue
    }

    // No synthesis anywhere. Partial iff the target root (or, for research, the newest folder that has the
    // module at all) holds at least one specialist output — a module that started and broke.
    const partialAt = candidates.find((c) => countAgentOutputs(path.join(REPO_ROOT, c.runRoot, m.name)) > 0)
    if (partialAt) {
      const partialAbs = path.join(REPO_ROOT, partialAt.runRoot, m.name)
      // Same vintage-of-record rule as the finished branch, via the resume stamp: orbs resumed into a
      // folder are dated by the run that PRODUCED them, never by the folder that copied them.
      const resumed = resumedVintage(partialAbs)
      const sourceRunRoot = resumed?.from ?? partialAt.runRoot
      const sourceDate = resumed?.date ?? (partialAt.date || undefined)
      // A partial's orbs are reusable evidence too, and the same §11 rule governs them: if the data pool has
      // gained a file since they ran, they never read it, and resuming would synthesize a module from orbs
      // read against two different data pools. So a stale partial is run CLEAN — every orb, from scratch.
      const staleReason = stalenessOf(sourceDate, pool.newestDate)
      const doneAgents = validAgentOutputs(partialAbs).length
      modules.push({
        module: m.name,
        state: 'partial',
        sourceRunRoot,
        sourceDate,
        copyFromRunRoot: partialAt.runRoot,
        inTargetRoot: partialAt.runRoot === targetRunRoot,
        doneAgents,
        totalAgents,
        staleReason,
        blockedBy: [],
        runnable: false,
        willRunAgents: staleReason ? totalAgents : Math.max(0, totalAgents - doneAgents),
      })
      continue
    }
    modules.push({ module: m.name, state: 'missing', inTargetRoot: false, doneAgents: 0, totalAgents, blockedBy: [], runnable: false, willRunAgents: totalAgents })
  }

  // A module can be reused iff a finished synthesis for it exists on disk — `done` or `stale`. Staleness
  // steers the DEFAULT (a stale module is re-run) without removing the user's ability to keep it knowingly.
  const byName = new Map(modules.map((m) => [m.module, m]))
  const reusable = modules.filter((m) => m.state === 'done' || m.state === 'stale').map((m) => m.module)
  const reusableSet = new Set(reusable)
  const chosen = reuseOverride
    ? reuseOverride.filter((m) => reusableSet.has(m))
    : modules.filter((m) => m.state === 'done').map((m) => m.module)

  // A module the caller chooses to REBUILD invalidates every module downstream of it (directly or
  // transitively via depends_on): earnings depends on business-model, valuation/catalyst read prior
  // module syntheses, and so on. Reusing a downstream module's carried conclusions would synthesize a
  // thesis mixing fresh upstream evidence with an old downstream read of the PREVIOUS upstream output.
  // Expand each rebuild through its descendants before finalizing what actually runs — `mustReuse` below
  // still wins over this (a module already finished in today's root can never be forced to rebuild;
  // that is a pre-existing, separately-surfaced limitation, not one this expansion can lift).
  const rebuilding = modules.filter((m) => reusableSet.has(m.module) && !chosen.includes(m.module)).map((m) => m.module)
  const forcedDownstream = new Set<string>()
  for (const name of rebuilding) {
    for (const d of transitiveDownstreamModules(graph, name)) forcedDownstream.add(d)
  }
  const chosenAfterCascade = chosen.filter((m) => !forcedDownstream.has(m))

  // `mustReuse` is not negotiable — the launcher skips those modules regardless. Fold them in so `run` is
  // exactly what will run, and the price on the button is exactly what the launcher will charge.
  const reuseSet = new Set([...chosenAfterCascade, ...mustReuse])
  const reuse = modules.filter((m) => reuseSet.has(m.module)).map((m) => m.module) // graph order, deduped
  const run = modules.filter((m) => !reuseSet.has(m.module)).map((m) => m.module)

  // Second pass, now that `run` is settled: which modules can be launched ON THEIR OWN from the panel.
  // A module is launchable iff it will run AND every module it depends on (directly or transitively) is
  // being REUSED, not itself waiting to run — because a research `module` launch reads its reused upstream
  // from the target run root, and an ancestor that has not run yet is not there. `blockedBy` names the
  // ancestors still in `run`; an empty list means the whole `depends_on` closure is reused and ready.
  const runSet = new Set(run)
  for (const m of modules) {
    m.blockedBy = [...moduleAncestors(graph, m.module)].filter((a) => runSet.has(a))
    m.runnable = runSet.has(m.module) && m.blockedBy.length === 0
  }

  // Only a research swarm can carry (dated folders). A reused module already in the target root needs no copy.
  const canCarry = isResearch
  const carry = canCarry
    ? reuse
        .map((name) => byName.get(name))
        .filter((m): m is ModulePlanEntry => Boolean(m && !m.inTargetRoot && m.copyFromRunRoot))
        // `from`/`date`: the TRUE origin — what the stamp should say this evidence's vintage really is.
        // `copyFrom`: the folder PROVEN (by `foldersWithModule`/`hasSynthesis` above) to physically hold
        // the files right now — which is what the copy step must actually read from. They can differ
        // when the newest candidate is itself an intermediate carried-forward copy whose true origin
        // folder has since been pruned; copying from the (possibly missing) origin would fail outright.
        .map((m) => ({ module: m.module, from: m.sourceRunRoot ?? m.copyFromRunRoot!, date: m.sourceDate ?? null, copyFrom: m.copyFromRunRoot! }))
    : []

  let complete = false
  let finalReportPath: string | null = null
  if (fs.existsSync(targetAbs)) {
    try {
      // Research ends on final_thesis.md inside analyses/. A constellation swarm's run root lives OUTSIDE
      // analyses/ (e.g. commodity/runs/GOLD) and ends on its terminal module's synthesis — so it needs both
      // the runs-tree resolver and its terminal module name, or a finished dossier reads as "not complete".
      const man = isResearch
        ? runManifest(targetRunRoot, resolveInsideAnalyses)
        : runManifest(targetRunRoot, resolveInsideRuns, terminalModuleName(swarmId))
      complete = Boolean(man.finalReport)
      finalReportPath = man.finalReport?.path ?? null
    } catch {
      /* unreadable target root — treat as incomplete */
    }
  }

  const master: ThesisPlan['master'] = complete
    ? { state: 'done', blockedBy: [] }
    : run.length > 0
      ? { state: 'blocked', blockedBy: run }
      : { state: 'ready', blockedBy: [] }

  return {
    swarm: swarmId,
    subject: safe,
    targetRunRoot,
    complete,
    finalReportPath,
    modules,
    reusable,
    mustReuse,
    reuse,
    run,
    carry,
    master,
    dataPool: pool,
    // Scaled by THIS swarm's agent counts. NOTE the money itself is not swarm-specific: `estimate('full')`
    // returns a single band calibrated on one research run, with no swarm branch. So for a non-research swarm
    // these are research-derived numbers scaled by orb count — which is why the panel does not show a price
    // for a swarm it cannot launch (canCarry === false). Do not present them as that swarm's cost.
    preflight: chainedResumePreflight(safe, run, swarmId),
    fullPreflight: estimate('full', safe, undefined, undefined, isResearch ? undefined : swarmId),
    canCarry,
  }
}

// ---- carry-forward -------------------------------------------------------------------------------

export interface CarryResult {
  carried: { module: string; from: string }[]
  /** already present in the target root — nothing copied */
  skipped: string[]
}

const CARRY_MARKER = 'CARRIED_FORWARD.md'

/** Monotonic within the process — the temp staging dir must be unique per request, or two concurrent POSTs for
 *  the same subject delete each other's in-flight copy (the rate limit does not serialize them). */
let carrySeq = 0

/** `dereference: true` copies what a symlink POINTS AT. A hand-rolled walk that handles only isFile/isDirectory
 *  silently DROPS symlinks, which would carry a module whose synthesis copied fine but whose cited evidence
 *  vanished — a module that then looks finished, gets skipped by the run, and fails verify-evidence. */
function copyDir(srcAbs: string, dstAbs: string): void {
  fs.cpSync(srcAbs, dstAbs, { recursive: true, dereference: true, force: true })
}

/**
 * Make a staged tree crash-durable before its launch-authority stamp is published. A directory fsync only
 * persists names; every regular file must be flushed first or a host loss can leave a stamped plan pointing
 * at a torn carried synthesis. Symlinks and special files are never valid staged research evidence.
 */
function fsyncStagedTree(abs: string): void {
  const stat = fs.lstatSync(abs)
  if (stat.isSymbolicLink()) throw new Error(`staged research tree contains a symlink: ${path.basename(abs)}`)
  if (stat.isFile()) {
    const fd = fs.openSync(abs, 'r')
    try { fs.fsyncSync(fd) } finally { fs.closeSync(fd) }
    return
  }
  if (!stat.isDirectory()) throw new Error(`staged research tree contains a special file: ${path.basename(abs)}`)
  for (const name of fs.readdirSync(abs).sort()) fsyncStagedTree(path.join(abs, name))
  const fd = fs.openSync(abs, 'r')
  try { fs.fsyncSync(fd) } finally { fs.closeSync(fd) }
}

function fsyncDirectory(abs: string): void {
  const fd = fs.openSync(abs, 'r')
  try { fs.fsyncSync(fd) } finally { fs.closeSync(fd) }
}

/** The provenance stamp. A carried module's numbers were read against an OLDER data pool, so the thesis
 *  must be able to say so (CLAUDE.md §5 — vintage travels with the number). Deliberately named so it
 *  matches none of the engine's output patterns (`NN_*.md`, `99_*-synthesis.md`, `*_memo.md`,
 *  `*_dossier.md`), so it is never mistaken for a specialist report — while still being swept into the
 *  module dossier's lossless `*.md` concatenation, which is exactly where an auditor should find it. */
function carryNote(module: string, fromRunRoot: string, fromDate: string | null, intoRunRoot: string, replacedPartial: boolean, staleReason?: string): string {
  const vintage = fromDate ? ` (run dated ${fromDate})` : ''
  // A machine-readable line first: `thesisPlan` reads it back to recover this module's TRUE vintage, so a
  // carried module never launders its age into today's folder name (§11).
  const provenance = fromDate ? `<!-- carried-from: ${fromRunRoot} | run-date: ${fromDate} -->\n\n` : ''
  const replaced = replacedPartial
    ? '\n- Replaced: an unfinished copy of this module left in this run folder by an interrupted run. That partial work was superseded by the complete module below; nothing finished was discarded.\n'
    : ''
  // A module can be carried while STALE only when the caller knowingly kept it (thesisPlan's reuseOverride).
  // The default claim below ("the data pool has gained no newer file") is true for the default reuse path —
  // it is FALSE for a knowing keep, and the master synthesizer is told to read this stamp as provenance
  // (§5/§11). Saying so honestly here, rather than reusing the "current" claim, is what stops a knowingly
  // stale module from being documented as if it were current.
  const currency = staleReason
    ? `it was **knowingly kept despite newer data**: ${staleReason}`
    : 'the data pool has gained no newer file since that run'
  const staleNotice = staleReason
    ? `\n> **Kept stale, on purpose.** This module was NOT re-run to read the newer data — the reuse selection explicitly kept it anyway. Its figures reflect the data pool as of its source run only.\n`
    : ''
  return `${provenance}# Carried forward — ${module}

> This module was **not re-run** for this run. Its outputs were copied verbatim from a previous run of the
> same subject, because a completed \`99_*-synthesis.md\` already existed and ${currency}.
${staleNotice}
- Source run: \`${fromRunRoot}\`${vintage}
- Copied into: \`${intoRunRoot}\`
- Re-run: **no** — every figure below carries the vintage of the source run, not of this run.${replaced}

**How to read this.** Every claim in this module was evidenced against the data pool as it stood on the
source run's date. Cite it with that vintage. If a filing has landed since, this module did not read it —
re-run the module rather than ageing its conclusions forward.
`
}

/** Copy the requested finished modules from their source run folders into the target run root, each with a
 *  provenance stamp. Idempotent and non-destructive: a module already present in the target root is left
 *  exactly as-is (never overwritten), and no prior-run folder is ever written to.
 *
 *  `modules` is the caller's REUSE set. Whatever is carried gets skipped by the subsequent full run;
 *  whatever is not carried gets run. That is the whole control surface — the carry set IS the reuse set. */
export function carryForwardModules(subject: string, modules: string[], swarmId: string = RESEARCH_SWARM_ID, precomputed?: ThesisPlan): CarryResult {
  // Reduce to a proven single path segment BEFORE any mkdir — the target root is built from it, so a
  // separator or a traversal component must never reach the filesystem. Throws on anything else.
  const safe = safeSubjectSegment(subject)

  // Act on the caller's plan when it has one. The route validates `reuse` against a plan it already read; if
  // we re-read disk here, a module finishing in that window makes us carry work the route never approved (or
  // skip work it did). One snapshot decides both — no time-of-check/time-of-use gap.
  //
  // `precomputed` must have been built with THIS `modules` set as its reuse override, so that a knowingly-kept
  // stale module is carriable. Anything not backed by a finished synthesis on disk was already dropped by
  // `thesisPlan` — a caller can never smuggle in a module that does not exist.
  const plan = precomputed ?? thesisPlan(safe, swarmId, modules)
  if (!plan.canCarry) return { carried: [], skipped: [...modules] }

  const carriable = new Map(plan.carry.map((c) => [c.module, c]))
  // Looked up per module below so the stamp can say WHY a stale module was carried anyway (a caller's
  // knowing keep), rather than reusing the "current" wording that only holds for the default reuse path.
  const planModuleByName = new Map(plan.modules.map((m) => [m.module, m]))
  const toCarry = modules.filter((m) => carriable.has(m))
  // Nothing to copy — never create today's run folder as a side effect of merely asking.
  if (toCarry.length === 0) return { carried: [], skipped: [...modules] }

  const targetAbs = path.join(REPO_ROOT, plan.targetRunRoot)
  fs.mkdirSync(targetAbs, { recursive: true })
  resolveInsideAnalyses(plan.targetRunRoot) // now that it exists, assert it really is inside analyses/

  const carried: { module: string; from: string }[] = []
  const skipped: string[] = []

  for (const module of modules) {
    const c = carriable.get(module)
    if (!c) {
      // Either already finished in the target root (mustReuse), or not a reusable module at all — nothing to
      // copy either way. `thesisPlan` already excluded both from `carry`.
      skipped.push(module)
      continue
    }
    // Build paths from the PLAN's own strings, never the caller's. `c.module` came from the discovered
    // agent graph and `c.from` from a directory listing, so neither is attacker-controlled — the caller's
    // `module` string is only ever used to look up this entry.
    const name = c.module
    const dstAbs = path.join(targetAbs, name)

    // A FINISHED module in the target root is left exactly as-is (that's `mustReuse`, never in `carry`).
    // But a PARTIAL folder — the leftover of an interrupted run, which is the very case this feature exists
    // for — must NOT block the carry. Skipping it here silently broke the plan's central promise: the panel
    // priced the module as reused and painted its orbs green, while the launcher's skip-test (a non-empty
    // 99 synthesis in the run root) failed and re-ran it at full cost.
    const replacedPartial = fs.existsSync(dstAbs)

    // Read bytes from `c.copyFrom` — the folder PROVEN to physically hold them right now — never from
    // `c.from`, which is the TRUE-origin provenance for the stamp and may point at a folder that has
    // since been pruned (the module then reads as "reusable" in the plan but a copy from `c.from` would
    // ENOENT here).
    const srcAbs = path.join(REPO_ROOT, c.copyFrom, name)
    // Stage OUTSIDE the run root, then rename in. Two reasons a `.carry-*` dir must never sit inside the run
    // root: `runManifest` enumerates every subdirectory as a module (a crash mid-copy would mint a phantom
    // module orb, and `/research:full` would dispatch a paid memo-writer against it), and `commit-run.sh`
    // stages the run root wholesale. The unique suffix keeps two concurrent requests off each other's tree.
    const tmpAbs = path.join(ANALYSES_DIR, `.carry-${safe}-${name}-${process.pid}-${carrySeq++}`)
    try {
      fs.rmSync(tmpAbs, { recursive: true, force: true })
      copyDir(srcAbs, tmpAbs)
      const staleReason = planModuleByName.get(name)?.staleReason
      fs.writeFileSync(path.join(tmpAbs, CARRY_MARKER), carryNote(name, c.from, c.date, plan.targetRunRoot, replacedPartial, staleReason), 'utf8')
      // Swap into place. The complete module supersedes any unfinished copy; the SOURCE folder is untouched,
      // so nothing finished is ever destroyed — only unfinished work in TODAY's root is replaced.
      if (replacedPartial) fs.rmSync(dstAbs, { recursive: true, force: true })
      fs.renameSync(tmpAbs, dstAbs)
    } finally {
      // A throw anywhere above (ENOSPC, EXDEV, a mid-copy kill) must not leave the staging tree behind.
      fs.rmSync(tmpAbs, { recursive: true, force: true })
    }
    carried.push({ module: name, from: c.from })
  }
  return { carried, skipped }
}

// ---- single-module resume ------------------------------------------------------------------------

export interface ModuleResumeResult {
  /** reused upstream modules physically copied into the target root so the command can read them */
  carriedAncestors: { module: string; from: string }[]
  /** the run the resumed orbs came from (null when the module ran clean — missing, or a stale partial) */
  resumedFrom: string | null
  /** orbs the resume reuses, as node keys `<module>/<NN>_<slug>` — empty when the module runs clean */
  doneOrbKeys: string[]
  /** orbs that will actually execute (the module's synthesis always among them) */
  willRunAgents: number
  /** true when a stale partial's leftover orbs were discarded so the module runs from scratch */
  discardedStaleOrbs: boolean
}

/** The provenance stamp for a RESUMED module — the twin of `carryNote`, written under `RESUME_MARKER`.
 *  Says plainly that only SOME orbs were carried and the rest ran here, and records the true origin of the
 *  carried orbs so their vintage travels with them (§5/§11). Contains no `Agent:` line (eval check H). */
function resumeNote(module: string, fromRunRoot: string, fromDate: string | null, intoRunRoot: string, reusedOrbs: number, ranOrbs: number): string {
  const vintage = fromDate ? ` (run dated ${fromDate})` : ''
  const provenance = fromDate ? `<!-- resumed-from: ${fromRunRoot} | run-date: ${fromDate} -->\n\n` : ''
  return `${provenance}# Resumed — ${module}

> This module was **resumed**, not run from scratch. ${reusedOrbs} finished specialist orb${reusedOrbs === 1 ? '' : 's'}
> ${reusedOrbs === 1 ? 'was' : 'were'} copied verbatim from an earlier, unfinished run of this same module; the remaining
> ${ranOrbs} orb${ranOrbs === 1 ? '' : 's'} (including this module's synthesis) ran for this run.

- Resumed from: \`${fromRunRoot}\`${vintage}
- Copied into: \`${intoRunRoot}\`
- The carried orbs keep the vintage of the run that produced them, not this run's date.

**How to read this.** The orbs carried in were evidenced against the data pool as it stood on the source
run's date. If a filing has landed since, this module should be run clean, not resumed — the cockpit does
exactly that, so a resumed module is only ever resumed when no newer data has landed since its orbs ran.
`
}

/**
 * Stage the target run root so ONE module can be launched on its own and resume from the orbs already on
 * disk. Does everything the launch needs EXCEPT calling `launch()` — so it is unit-testable without the CLI,
 * exactly like `carryForwardModules` (its finished-module twin). Three moves:
 *
 *   1. Carry every REUSED ancestor of `module` into the target root. A research `module` command reads its
 *      upstream from `<RUN_ROOT>/<dep>/` with no cross-folder fallback for some deps (valuation ← governance),
 *      so an ancestor reused from an older folder must be physically present, or the module runs degraded.
 *      Only ancestors are carried — never the whole reuse set — so launching valuation does not lock an
 *      unrelated reused module (balance-sheet-survival) into today's root (a `mustReuse` the user can't undo).
 *   2. If `module` is a resumable partial living in an OLDER folder, copy its finished orbs into the target
 *      root under a `RESUMED_FROM.md` stamp, so Step 4A skips them and only the remainder runs.
 *   3. If `module` is a STALE partial, discard any of its orbs sitting in today's root so it runs CLEAN —
 *      resuming stale orbs would synthesize a module from evidence read against two different data pools (§11).
 *
 * `plan` MUST have been built with the caller's reuse set as its override (the route does this), so the
 * ancestor set and the module's own state are read from one consistent snapshot. Caller must hold the
 * subject lock and have proven `module ∈ plan.run` with an empty `blockedBy` — this function trusts that.
 */
export function prepareModuleResume(subject: string, module: string, swarmId: string = RESEARCH_SWARM_ID, precomputed?: ThesisPlan): ModuleResumeResult {
  const safe = safeSubjectSegment(subject)
  const plan = precomputed ?? thesisPlan(safe, swarmId, undefined)
  const graph = buildSwarmGraph(swarmId)
  const entry = plan.modules.find((m) => m.module === module)
  if (!entry) throw new Error(`module ${module} is not in this swarm`)

  // (1) Carry the reused ancestors. `carryForwardModules` reads `plan.carry` (derived from `plan.reuse`), so
  // an ancestor already in the target root (`mustReuse`) or not reused is silently skipped — exactly right.
  const reuseSet = new Set(plan.reuse)
  const ancestors = [...moduleAncestors(graph, module)].filter((a) => reuseSet.has(a))
  const { carried: carriedAncestors } = ancestors.length ? carryForwardModules(safe, ancestors, swarmId, plan) : { carried: [] }

  const targetAbs = path.join(REPO_ROOT, plan.targetRunRoot)
  const dstAbs = path.join(targetAbs, module)

  // (3) Stale partial → run clean. Drop any orbs of this module already in today's root; do not carry.
  if (entry.state === 'partial' && entry.staleReason) {
    const discardedStaleOrbs = fs.existsSync(dstAbs)
    if (discardedStaleOrbs) fs.rmSync(dstAbs, { recursive: true, force: true })
    return { carriedAncestors, resumedFrom: null, doneOrbKeys: [], willRunAgents: entry.totalAgents, discardedStaleOrbs }
  }

  // (2) Resumable partial in an OLDER folder → copy its finished orbs into the target root under a resume
  // stamp. `!inTargetRoot` guarantees the target root holds no orbs for this module yet (else that folder
  // would be the newest candidate and `inTargetRoot` would be true).
  const doneKeysOf = (dir: string): string[] => validAgentOutputs(dir).map((f) => `${module}/${f.replace(/\.md$/, '')}`)
  if (entry.state === 'partial' && !entry.inTargetRoot && entry.copyFromRunRoot) {
    const srcAbs = path.join(REPO_ROOT, entry.copyFromRunRoot, module)
    const doneOrbKeys = doneKeysOf(srcAbs)
    const ranOrbs = Math.max(0, entry.totalAgents - doneOrbKeys.length)
    fs.mkdirSync(targetAbs, { recursive: true })
    resolveInsideAnalyses(plan.targetRunRoot)
    // Stage OUTSIDE the run root, then rename in — same reasons as `carryForwardModules`: `runManifest`
    // reads every subdirectory as a module, and `commit-run.sh` stages the run root wholesale.
    const tmpAbs = path.join(ANALYSES_DIR, `.resume-${safe}-${module}-${process.pid}-${carrySeq++}`)
    try {
      fs.rmSync(tmpAbs, { recursive: true, force: true })
      copyDir(srcAbs, tmpAbs)
      fs.writeFileSync(path.join(tmpAbs, RESUME_MARKER), resumeNote(module, entry.sourceRunRoot ?? entry.copyFromRunRoot, entry.sourceDate ?? null, plan.targetRunRoot, doneOrbKeys.length, ranOrbs), 'utf8')
      // A partial fragment could in principle sit in today's root already; the complete set of finished orbs
      // supersedes it. The source folder is untouched — nothing finished is ever destroyed.
      if (fs.existsSync(dstAbs)) fs.rmSync(dstAbs, { recursive: true, force: true })
      fs.renameSync(tmpAbs, dstAbs)
    } finally {
      fs.rmSync(tmpAbs, { recursive: true, force: true })
    }
    return { carriedAncestors, resumedFrom: entry.sourceRunRoot ?? entry.copyFromRunRoot, doneOrbKeys, willRunAgents: ranOrbs, discardedStaleOrbs: false }
  }

  // A resumable partial ALREADY in today's root (resumed here earlier, non-stale): its orbs are in place,
  // nothing to copy or clean. Report them as reused so the panel shows "N done" rather than a clean start.
  if (entry.state === 'partial' && entry.inTargetRoot) {
    const doneOrbKeys = doneKeysOf(dstAbs)
    return { carriedAncestors, resumedFrom: entry.sourceRunRoot ?? plan.targetRunRoot, doneOrbKeys, willRunAgents: Math.max(0, entry.totalAgents - doneOrbKeys.length), discardedStaleOrbs: false }
  }

  // Missing module → runs whole. Nothing to carry for the module itself.
  return { carriedAncestors, resumedFrom: null, doneOrbKeys: [], willRunAgents: entry.totalAgents, discardedStaleOrbs: false }
}

// ---- scoped batch rerun (executes an intake plan in ONE pass) --------------------------------------

export interface ScopedCarryResult {
  /** untouched modules carried whole (CARRIED_FORWARD provenance) */
  carried: { module: string; from: string }[]
  /** stale modules staged with HOLES so the full-run resume machinery re-runs exactly the gaps */
  scoped: { module: string; from: string | null; omittedOrbs: string[]; synthesisOnly: boolean; inPlace: boolean }[]
  /** modules the launched full run will (re)build — entry modules + their transitive downstream */
  staleModules: string[]
  /** entry orbs that failed roster validation and were dropped (fail-closed, INTAKE.md §4) */
  droppedEntries: { module: string; agent: string }[]
}

/** The provenance stamp for a SCOPED module — written under the same RESUMED_FROM.md filename the single-
 *  module resume uses, because structurally this IS a resume (finished orbs carried verbatim, the omitted
 *  ones re-run here) and the cockpit/roster already read that marker's provenance comment. No `Agent:`
 *  line (eval check H).
 *
 *  Deliberately PROSPECTIVE, not retrospective: this is written at STAGING time — before launch admission,
 *  the readiness gate, or a single agent has actually executed. Earlier wording asserted the omitted work
 *  "was re-run", which is false the instant admission fails or this module's agent aborts; the partial run
 *  would then keep an audit marker claiming evidence was refreshed that never was (Codex #358 r3673980767).
 *  So the prose only ever claims what is TRUE at write time — what was carried and what is scoped to run —
 *  and points the reader at the one thing that can't lie: whether `99_*-synthesis.md` actually exists. */
function scopedNote(module: string, fromRunRoot: string, fromDate: string | null, intoRunRoot: string, omittedOrbs: string[], synthesisOnly: boolean): string {
  const vintage = fromDate ? ` (run dated ${fromDate})` : ''
  const provenance = fromDate ? `<!-- resumed-from: ${fromRunRoot} | run-date: ${fromDate} -->\n\n` : ''
  const what = synthesisOnly
    ? 'only this module\'s synthesis (its upstream evidence changed — the specialists\' own inputs did not)'
    : `the orb${omittedOrbs.length === 1 ? '' : 's'} ${omittedOrbs.map((o) => `\`${o}\``).join(', ')} and this module's synthesis`
  return `${provenance}# Scoped re-run — ${module}

> New data invalidated part of this module, so it is **staged for a scoped rerun, not a rebuild from
> scratch**. The finished specialist orbs were carried verbatim from the run below; ${what}
> ${synthesisOnly ? 'is' : 'are'} scoped to re-run against the refreshed pool for THIS run.
>
> **This note is written at staging time, before the rerun executes.** It records what was carried and
> what is scoped to run — it is not a claim that the rerun has finished. If the launch never starts, or
> this module's agent aborts, the work above was never actually refreshed; this module's own
> \`99_*-synthesis.md\` (present or not) is the ground truth for whether it completed.

- Carried from: \`${fromRunRoot}\`${vintage}
- Copied into: \`${intoRunRoot}\`
- The carried orbs keep the vintage of the run that produced them, not this run's date.

**How to read this.** The intake plan that scoped these holes rides in THIS run root
(\`intake/*_intake_plan.json\`, copied verbatim from the run whose analysis produced it); it names the
documents that landed and the exact orbs they invalidate. This module is scoped to re-run exactly those
plus its synthesis, and every module downstream of it is scoped to re-run its synthesis. The rest of the
run is carried, priced and stamped.
`
}

/**
 * Stage the target run root so the EXISTING full-run machinery executes an intake plan's scoped rerun in
 * ONE pass — the batch twin of `prepareModuleResume`, built from the same three primitives:
 *
 *   - untouched modules → carried whole (`carryForwardModules`), so both full-run paths skip them;
 *   - an ENTRY module (an orb the new data invalidated) → carried with HOLES: the affected orb outputs and
 *     its `99_*` synthesis (+ memo/dossier, regenerated) are omitted, so MODULE_PIPELINE Step 4A re-runs
 *     exactly the missing orbs and then the synthesis;
 *   - a DOWNSTREAM module (transitively depends on an entry module) → carried with only its synthesis
 *     (+ memo/dossier) omitted: all orbs on disk → zero specialists dispatched, the `99` re-reads the
 *     refreshed upstream — precisely `/research:rerun`'s synthesis-only cascade, deduplicated across all
 *     entry orbs and finished by ONE master + finish-gate + commit.
 *
 * A stale module already FINISHED in the target root (`mustReuse` — both full-run paths skip on its `99`
 * presence, so no copy can force a re-run) is hole-punched IN PLACE: same deletion set, applied to today's
 * root directly. Prior-dated folders are never modified (synthesizer.md standing rule) — today's root is
 * the workspace.
 *
 * Validation is fail-closed like `readIntakePlan`: an entry orb naming an unknown module/agent is DROPPED
 * and reported, never guessed. Caller holds the subject lock and has proven the target root is not
 * complete; this function trusts that.
 */
export function carryForwardScoped(
  subject: string,
  entryOrbs: { module: string; agent: string }[],
  swarmId: string = RESEARCH_SWARM_ID,
  precomputed?: ThesisPlan,
  planFileAbs?: string | null,
): ScopedCarryResult {
  const safe = safeSubjectSegment(subject)
  const graph = buildSwarmGraph(swarmId)
  const byModule = new Map(graph.modules.map((m) => [m.name, m]))

  // resolve + validate the entry orbs against the discovered roster (fail-closed)
  const droppedEntries: { module: string; agent: string }[] = []
  const entryFilesByModule = new Map<string, Set<string>>() // module → orb output filenames to omit
  const synthesisEntry = new Set<string>() // modules whose ENTRY is the synthesis itself
  for (const e of entryOrbs || []) {
    const mod = byModule.get(e?.module)
    const agents = mod ? Object.values(mod.layers).flat() : []
    const hit = agents.find((a) => a.name === e?.agent || a.slug === e?.agent)
    if (!mod || !hit) { droppedEntries.push({ module: String(e?.module), agent: String(e?.agent) }); continue }
    if (hit.isSynthesis) { synthesisEntry.add(mod.name); continue } // synthesis-only entry: no specialist hole
    const set = entryFilesByModule.get(mod.name) ?? new Set<string>()
    set.add(`${hit.key.split('/')[1]}.md`)
    entryFilesByModule.set(mod.name, set)
  }
  const entryModules = new Set<string>([...entryFilesByModule.keys(), ...synthesisEntry])
  // Every entry invalid → nothing to scope. Return WITHOUT carrying anything: a bad plan must not create
  // today's run folder (or a full whole-run carry) as a side effect of merely asking (fail-closed).
  if (entryModules.size === 0) return { carried: [], scoped: [], staleModules: [], droppedEntries }

  // stale set = entry modules ∪ their transitive downstream (the deduplicated cascade)
  const stale = new Set<string>(entryModules)
  for (const m of entryModules) for (const d of transitiveDownstreamModules(graph, m)) stale.add(d)
  const staleModules = graph.modules.map((m) => m.name).filter((m) => stale.has(m)) // topo order

  // ONE plan snapshot decides everything (same discipline as carryForwardModules). Reuse override = every
  // reusable module: stale ones included, because we carry their FINISHED copy and then punch holes in it.
  const base = precomputed ?? thesisPlan(safe, swarmId, thesisPlan(safe, swarmId).reusable)
  const carriable = new Map(base.carry.map((c) => [c.module, c]))
  const mustReuse = new Set(base.mustReuse)

  // Validate and prepare the exact launch-authority stamp BEFORE the first carry/hole mutation. The stamp
  // still lands last, but a malformed/missing evidence cursor can no longer leave a half-staged target.
  let stagedPlan: { name: string; text: string; intentText: string } | null = null
  if (planFileAbs) {
    const lst = fs.lstatSync(planFileAbs)
    const realPlan = fs.realpathSync(planFileAbs)
    const realRepo = fs.realpathSync(REPO_ROOT)
    const realAnalyses = fs.realpathSync(ANALYSES_DIR)
    const lexicalIntake = path.dirname(planFileAbs)
    const lexicalRun = path.dirname(lexicalIntake)
    const intakeLst = fs.lstatSync(lexicalIntake)
    const runLst = fs.lstatSync(lexicalRun)
    const realIntake = fs.realpathSync(lexicalIntake)
    const realRun = fs.realpathSync(lexicalRun)
    const rel = path.relative(realRepo, realPlan)
    const repoPath = rel.split(path.sep).join('/')
    const name = path.basename(realPlan)
    if (!lst.isFile() || lst.isSymbolicLink() || rel.startsWith(`..${path.sep}`) || path.isAbsolute(rel)
        || !intakeLst.isDirectory() || intakeLst.isSymbolicLink()
        || !runLst.isDirectory() || runLst.isSymbolicLink()
        || path.dirname(realIntake) !== realRun || path.dirname(realRun) !== realAnalyses
        || !/_intake_plan(?:_v\d+)?\.json$/.test(name) || path.basename(planFileAbs) !== name) {
      throw new Error('scoped rerun plan path is unsafe')
    }
    const planRaw = JSON.parse(fs.readFileSync(realPlan, 'utf8'))
    if (!planRaw || typeof planRaw !== 'object' || Array.isArray(planRaw)
        || typeof planRaw.scanned_at !== 'string' || !Number.isFinite(Date.parse(planRaw.scanned_at))
        || planRaw.run_root !== path.relative(realRepo, realRun).split(path.sep).join('/')
        || planRaw.run_root !== `analyses/${safe}_${String(planRaw.run_root).slice(-10)}`
        || repoPath !== `${planRaw.run_root}/intake/${name}`
        || !/^sha256:[a-f0-9]{64}$/.test(planRaw.decision_fingerprint)) {
      throw new Error('scoped rerun evidence cursor is missing or invalid')
    }
    const authoredPlan = { ...planRaw }
    delete authoredPlan.staged_for_scoped_rerun
    const planSha256 = `sha256:${createHash('sha256').update(canonicalJsonText(authoredPlan), 'utf8').digest('hex')}`
    const intent = {
      schema_version: SCOPED_STAGE_INTENT_VERSION,
      swarm: swarmId,
      subject: safe,
      source_run_root: planRaw.run_root,
      target_run_root: base.targetRunRoot,
      plan_path: repoPath,
      plan_sha256: planSha256,
      source_decision_fingerprint: planRaw.decision_fingerprint,
    }
    planRaw.staged_for_scoped_rerun = true
    stagedPlan = {
      name,
      text: JSON.stringify(planRaw, null, 2) + '\n',
      intentText: JSON.stringify(intent, null, 2) + '\n',
    }
  }

  // The runnable plan stamp must remain LAST, but recovery also needs proof that bytes left before that
  // stamp belong to this exact server-approved transaction. Persist a separate non-launch intent before
  // the first copy/hole. A target without this witness is never reconstructed automatically.
  const scopedStageWillMutate = base.reuse.some((module) => !stale.has(module) && carriable.has(module))
    || staleModules.some((module) => mustReuse.has(module) || carriable.has(module))
  if (stagedPlan && scopedStageWillMutate) {
    const targetAbs = path.join(REPO_ROOT, base.targetRunRoot)
    fs.mkdirSync(targetAbs, { recursive: true })
    resolveInsideAnalyses(base.targetRunRoot)
    // Persist the target directory entry before the intent inside it can authorize reconstruction.
    fsyncDirectory(ANALYSES_DIR)
    const intentAbs = path.join(targetAbs, SCOPED_STAGE_INTENT_FILE)
    if (fs.existsSync(intentAbs)) {
      const intentLst = fs.lstatSync(intentAbs)
      if (!intentLst.isFile() || intentLst.isSymbolicLink()
          || fs.readFileSync(intentAbs, 'utf8') !== stagedPlan.intentText) {
        throw new Error('scoped rerun stage intent does not match this plan')
      }
    } else {
      // Temp lives beside analyses/, not inside the run. A SIGKILL after fsync but before rename may leave
      // the private temp behind, but it can never make the run manifest look nonempty/corrupt or block the
      // exact intent retry. Rename is still same-filesystem and atomic.
      const temp = path.join(ANALYSES_DIR, `.scoped-intent-${safe}-${process.pid}-${carrySeq++}.tmp`)
      let fd: number | null = null
      try {
        fd = fs.openSync(temp, 'wx', 0o600)
        fs.writeFileSync(fd, stagedPlan.intentText, 'utf8')
        fs.fsyncSync(fd)
      } finally {
        if (fd !== null) fs.closeSync(fd)
      }
      try { fs.renameSync(temp, intentAbs) }
      catch (error) { try { fs.rmSync(temp, { force: true }) } catch {}; throw error }
      fsyncDirectory(targetAbs)
    }
  }

  // 1) untouched modules → carried whole
  const keepWhole = base.reuse.filter((m) => !stale.has(m))
  const { carried } = keepWhole.length ? carryForwardModules(safe, keepWhole, swarmId, base) : { carried: [] as { module: string; from: string }[] }

  const targetAbs = path.join(REPO_ROOT, base.targetRunRoot)
  const scoped: ScopedCarryResult['scoped'] = []

  // the hole set for a stale module: entry orb files (if any) + its 99 synthesis + memo/dossier (both
  // regenerated — the dossier by the module pipeline's own Step 4.9B, the memo by the master step's batch)
  const holesFor = (module: string, dirAbs: string): string[] => {
    const files = fs.existsSync(dirAbs) ? fs.readdirSync(dirAbs) : []
    const orbHoles = entryFilesByModule.get(module) ?? new Set<string>()
    return files.filter((f) =>
      orbHoles.has(f) || /^99_.*\.md$/.test(f) || f === `${module}_memo.md` || f === `${module}_dossier.md`)
  }

  for (const module of staleModules) {
    const omittedOrbs = [...(entryFilesByModule.get(module) ?? [])].sort()
    const synthesisOnly = omittedOrbs.length === 0
    if (mustReuse.has(module)) {
      // finished in TODAY's root — both full-run paths skip on its 99 presence, so punch the holes in place
      const dstAbs = path.join(targetAbs, module)
      for (const f of holesFor(module, dstAbs)) fs.rmSync(path.join(dstAbs, f), { force: true })
      // one provenance story per folder: a whole-carry marker from an EARLIER completion carry must not
      // survive the hole-punch — thesisPlan's carriedVintage would keep dating the refreshed module by its
      // old source run, and the dossier would claim it was both carried verbatim AND rerun scoped
      // (Codex #358 r3672206131)
      fs.rmSync(path.join(dstAbs, CARRY_MARKER), { force: true })
      fs.writeFileSync(path.join(dstAbs, RESUME_MARKER), scopedNote(module, base.targetRunRoot, null, base.targetRunRoot, omittedOrbs, synthesisOnly), 'utf8')
      scoped.push({ module, from: base.targetRunRoot, omittedOrbs, synthesisOnly, inPlace: true })
      continue
    }
    const c = carriable.get(module)
    if (!c) continue // never finished anywhere → the full run builds it whole; nothing to stage
    const srcAbs = path.join(REPO_ROOT, c.copyFrom, module)
    const dstAbs = path.join(targetAbs, module)
    fs.mkdirSync(targetAbs, { recursive: true })
    resolveInsideAnalyses(base.targetRunRoot)
    // stage OUTSIDE the run root, then rename in — same reasons as carryForwardModules (phantom-module
    // manifest rows and wholesale commit staging)
    const tmpAbs = path.join(ANALYSES_DIR, `.scoped-${safe}-${module}-${process.pid}-${carrySeq++}`)
    const replacedPartial = fs.existsSync(dstAbs)
    try {
      fs.rmSync(tmpAbs, { recursive: true, force: true })
      copyDir(srcAbs, tmpAbs)
      for (const f of holesFor(module, tmpAbs)) fs.rmSync(path.join(tmpAbs, f), { force: true })
      // a whole-carry marker from the source copy must not survive into a scoped stage — one provenance
      // story per folder, and this one is "resumed with holes", not "carried verbatim"
      fs.rmSync(path.join(tmpAbs, CARRY_MARKER), { force: true })
      fs.writeFileSync(path.join(tmpAbs, RESUME_MARKER), scopedNote(module, c.from, c.date, base.targetRunRoot, omittedOrbs, synthesisOnly), 'utf8')
      if (replacedPartial) fs.rmSync(dstAbs, { recursive: true, force: true })
      fs.renameSync(tmpAbs, dstAbs)
    } finally {
      fs.rmSync(tmpAbs, { recursive: true, force: true })
    }
    scoped.push({ module, from: c.from, omittedOrbs, synthesisOnly, inPlace: false })
  }

  // Carry the plan itself into the target root: staging just made TODAY the ticker's latest dated root,
  // so without this a retry after a failed launch (or the audit trail after a finished one) would look for
  // the plan under the new root and find nothing — `readIntakePlan` searches only the latest root
  // (Codex #358 r3672400212). Almost-verbatim: the plan's own scanned_at/scan_date witnesses travel with it
  // unchanged, so the route's freshness gate keeps working against the copied file on a retry — but it is
  // stamped `staged_for_scoped_rerun: true` first, so `readIntakePlan` can tell "this copy exists because
  // its own commands were just staged against THIS root" apart from an original, not-yet-executed plan that
  // simply happens to sit in a finished run (the common, intended case: INTAKE.md's plan deliberately lives
  // under the older run it invalidates). Once this root's own final deliverables land, that stamp is what
  // lets the reader retire it — serving a plan whose work is already done would tell the cockpit
  // already-incorporated data still needs a rerun (Codex #358 r3673980745). This copied plan is also the
  // durable evidence cursor for documents that arrive WHILE the scoped run is working. It is therefore
  // launch authority, not provenance decoration: fail closed if it cannot be saved.
  if (stagedPlan && (carried.length || scoped.length)) {
    const intakeDir = path.join(targetAbs, 'intake')
    const destAbs = path.join(intakeDir, stagedPlan.name)
    // The plan is the runnable authority and therefore lands only after every carried byte, hole deletion,
    // provenance marker and directory rename is durable. If any flush fails the exact intent remains and
    // automation fails closed; it never launches against a stamped but torn tree.
    fsyncStagedTree(targetAbs)
    fs.mkdirSync(intakeDir, { recursive: true })
    fsyncDirectory(targetAbs)
    // Same crash rule as the intent: never strand an uncommitted temp inside the authoritative run tree.
    const temp = path.join(ANALYSES_DIR, `.scoped-plan-${safe}-${process.pid}-${carrySeq++}.tmp`)
    let fd: number | null = null
    try {
      fd = fs.openSync(temp, 'wx', 0o600)
      fs.writeFileSync(fd, stagedPlan.text, 'utf8')
      fs.fsyncSync(fd)
    } finally {
      if (fd !== null) fs.closeSync(fd)
    }
    try { fs.renameSync(temp, destAbs) }
    catch (error) { try { fs.rmSync(temp, { force: true }) } catch {}; throw error }
    fsyncDirectory(intakeDir)
    fsyncDirectory(targetAbs)
    // Once the launch-authority stamp exists the transaction witness is no longer needed. Removing it
    // prevents a later manual deletion of the plan from turning partially-written model output back into
    // restageable carry bytes.
    fs.rmSync(path.join(targetAbs, SCOPED_STAGE_INTENT_FILE))
    fsyncDirectory(targetAbs)
  }

  return { carried, scoped, staleModules, droppedEntries }
}
