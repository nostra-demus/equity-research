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
import { ANALYSES_DIR, DATA_DIR, REPO_ROOT } from './config'
import { chainedResumePreflight, estimate } from './launcher'
import { runManifest } from './outputs'
import { buildSwarmGraph, findRunRootForSubject, terminalModuleName } from './roster'
import { isValidTicker, resolveInsideAnalyses, resolveInsideRuns } from './sandbox'
import { RESEARCH_SWARM_ID, runRootForSubject, swarmById } from './swarms'
import type { LaunchPreflight } from './types'

/** How a module stands relative to a thesis that still needs to be produced. */
export type ModuleState =
  | 'done' // a non-empty 99 synthesis exists and predates no newer data — reuse it, do not pay again
  | 'stale' // a synthesis exists, but the data pool has gained a file since that run — re-run it
  | 'partial' // some specialist outputs exist, but no synthesis — the module never finished
  | 'missing' // the module has never run for this subject

export interface ModulePlanEntry {
  module: string
  state: ModuleState
  /** repo-relative folder holding the newest outputs for this module (absent when `missing`) */
  sourceRunRoot?: string
  /** the run vintage — the `<DATE>` of `sourceRunRoot` (absent for a non-dated swarm root) */
  sourceDate?: string
  /** true when the newest outputs already live in the target run root (nothing to carry) */
  inTargetRoot: boolean
  doneAgents: number
  totalAgents: number
  /** plain-English reason this module is `stale` — shown verbatim in the cockpit */
  staleReason?: string
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
  /** modules that must be copied into the target root before the run (subset of `reuse`) */
  carry: { module: string; from: string; date: string | null }[]
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
  try {
    return fs.readdirSync(moduleDirAbs).filter((f) => /^[0-9]{2}_.*\.md$/.test(f) && !/^99_/.test(f)).length
  } catch {
    return 0
  }
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
export function dataPoolNewest(ticker: string, dataDir: string = DATA_DIR): { files: number; newestDate: string | null } {
  const root = path.join(dataDir, ticker)
  let files = 0
  let newestMs = 0
  const walk = (dir: string, depth: number): void => {
    if (depth > 6) return
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
        const ms = fs.statSync(p).mtimeMs
        if (ms > newestMs) newestMs = ms
      } catch {
        /* vanished mid-scan */
      }
    }
  }
  walk(root, 0)
  return { files, newestDate: newestMs > 0 ? todayDate(new Date(newestMs)) : null }
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
export function thesisPlan(subject: string, swarmId: string = RESEARCH_SWARM_ID, reuseOverride?: string[]): ThesisPlan {
  const swarm = swarmById(swarmId)
  const graph = buildSwarmGraph(swarmId)
  const isResearch = swarmId === RESEARCH_SWARM_ID

  // Where a completion writes. Research: today's dated folder — the one BOTH full-run paths seed their
  // skip-set from. Any other swarm: its single stable per-subject folder.
  const targetRunRoot = isResearch
    ? `analyses/${subject}_${todayDate()}`
    : (swarm && runRootForSubject(swarm, subject)) || `analyses/${subject}`

  const targetAbs = path.join(REPO_ROOT, targetRunRoot)
  const pool = dataPoolNewest(subject)
  const dated = isResearch ? datedRunFoldersFor(subject) : []

  const modules: ModulePlanEntry[] = []
  const mustReuse: string[] = []
  for (const m of graph.modules) {
    const totalAgents = m.agentCount
    // Candidate folders holding this module, newest vintage first. For a non-dated swarm there is exactly
    // one root, so this collapses to "is it in the run folder".
    const candidates = isResearch
      ? foldersWithModule(dated, m.name)
      : (() => {
          const root = findRunRootForSubject(swarmId, subject)
          if (!root) return []
          const rel = path.relative(REPO_ROOT, root)
          return fs.existsSync(path.join(root, m.name)) ? [{ runRoot: rel, date: '' }] : []
        })()

    const finished = candidates.find((c) => hasSynthesis(path.join(REPO_ROOT, c.runRoot, m.name)))
    if (finished) {
      const inTargetRoot = finished.runRoot === targetRunRoot
      // A module carried into the target root keeps the vintage of the run it came FROM, not today's.
      const carried = inTargetRoot ? carriedVintage(path.join(REPO_ROOT, finished.runRoot, m.name)) : null
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
        inTargetRoot,
        doneAgents: countAgentOutputs(path.join(REPO_ROOT, finished.runRoot, m.name)),
        totalAgents,
        staleReason,
      })
      continue
    }

    // No synthesis anywhere. Partial iff the target root (or, for research, the newest folder that has the
    // module at all) holds at least one specialist output — a module that started and broke.
    const partialAt = candidates.find((c) => countAgentOutputs(path.join(REPO_ROOT, c.runRoot, m.name)) > 0)
    if (partialAt) {
      modules.push({
        module: m.name,
        state: 'partial',
        sourceRunRoot: partialAt.runRoot,
        sourceDate: partialAt.date || undefined,
        inTargetRoot: partialAt.runRoot === targetRunRoot,
        doneAgents: countAgentOutputs(path.join(REPO_ROOT, partialAt.runRoot, m.name)),
        totalAgents,
      })
      continue
    }
    modules.push({ module: m.name, state: 'missing', inTargetRoot: false, doneAgents: 0, totalAgents })
  }

  // A module can be reused iff a finished synthesis for it exists on disk — `done` or `stale`. Staleness
  // steers the DEFAULT (a stale module is re-run) without removing the user's ability to keep it knowingly.
  const byName = new Map(modules.map((m) => [m.module, m]))
  const reusable = modules.filter((m) => m.state === 'done' || m.state === 'stale').map((m) => m.module)
  const reusableSet = new Set(reusable)
  const chosen = reuseOverride
    ? reuseOverride.filter((m) => reusableSet.has(m))
    : modules.filter((m) => m.state === 'done').map((m) => m.module)
  // `mustReuse` is not negotiable — the launcher skips those modules regardless. Fold them in so `run` is
  // exactly what will run, and the price on the button is exactly what the launcher will charge.
  const reuseSet = new Set([...chosen, ...mustReuse])
  const reuse = modules.filter((m) => reuseSet.has(m.module)).map((m) => m.module) // graph order, deduped
  const run = modules.filter((m) => !reuseSet.has(m.module)).map((m) => m.module)

  // Only a research swarm can carry (dated folders). A reused module already in the target root needs no copy.
  const canCarry = isResearch
  const carry = canCarry
    ? reuse
        .map((name) => byName.get(name))
        .filter((m): m is ModulePlanEntry => Boolean(m && !m.inTargetRoot && m.sourceRunRoot))
        .map((m) => ({ module: m.module, from: m.sourceRunRoot!, date: m.sourceDate ?? null }))
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
    subject,
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
    preflight: chainedResumePreflight(subject, run, swarmId),
    fullPreflight: estimate('full', subject, undefined, undefined, isResearch ? undefined : swarmId),
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

/** The provenance stamp. A carried module's numbers were read against an OLDER data pool, so the thesis
 *  must be able to say so (CLAUDE.md §5 — vintage travels with the number). Deliberately named so it
 *  matches none of the engine's output patterns (`NN_*.md`, `99_*-synthesis.md`, `*_memo.md`,
 *  `*_dossier.md`), so it is never mistaken for a specialist report — while still being swept into the
 *  module dossier's lossless `*.md` concatenation, which is exactly where an auditor should find it. */
function carryNote(module: string, fromRunRoot: string, fromDate: string | null, intoRunRoot: string, replacedPartial: boolean): string {
  const vintage = fromDate ? ` (run dated ${fromDate})` : ''
  // A machine-readable line first: `thesisPlan` reads it back to recover this module's TRUE vintage, so a
  // carried module never launders its age into today's folder name (§11).
  const provenance = fromDate ? `<!-- carried-from: ${fromRunRoot} | run-date: ${fromDate} -->\n\n` : ''
  const replaced = replacedPartial
    ? '\n- Replaced: an unfinished copy of this module left in this run folder by an interrupted run. That partial work was superseded by the complete module below; nothing finished was discarded.\n'
    : ''
  return `${provenance}# Carried forward — ${module}

> This module was **not re-run** for this run. Its outputs were copied verbatim from a previous run of the
> same subject, because a completed \`99_*-synthesis.md\` already existed and the data pool has gained no
> newer file since that run.

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
  // Validate BEFORE any mkdir: the target root is built from `subject`, so a traversal in it must never
  // reach the filesystem. `isValidTicker` (not the bare TICKER_RE, which admits "..") is the repo's gate.
  if (!isValidTicker(subject)) throw new Error('bad subject')

  // Act on the caller's plan when it has one. The route validates `reuse` against a plan it already read; if
  // we re-read disk here, a module finishing in that window makes us carry work the route never approved (or
  // skip work it did). One snapshot decides both — no time-of-check/time-of-use gap.
  //
  // `precomputed` must have been built with THIS `modules` set as its reuse override, so that a knowingly-kept
  // stale module is carriable. Anything not backed by a finished synthesis on disk was already dropped by
  // `thesisPlan` — a caller can never smuggle in a module that does not exist.
  const plan = precomputed ?? thesisPlan(subject, swarmId, modules)
  if (!plan.canCarry) return { carried: [], skipped: [...modules] }

  const carriable = new Map(plan.carry.map((c) => [c.module, c]))
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
    const dstAbs = path.join(targetAbs, module)

    // A FINISHED module in the target root is left exactly as-is (that's `mustReuse`, never in `carry`).
    // But a PARTIAL folder — the leftover of an interrupted run, which is the very case this feature exists
    // for — must NOT block the carry. Skipping it here silently broke the plan's central promise: the panel
    // priced the module as reused and painted its orbs green, while the launcher's skip-test (a non-empty
    // 99 synthesis in the run root) failed and re-ran it at full cost.
    const replacedPartial = fs.existsSync(dstAbs)

    const srcAbs = path.join(REPO_ROOT, c.from, module)
    // Stage OUTSIDE the run root, then rename in. Two reasons a `.carry-*` dir must never sit inside the run
    // root: `runManifest` enumerates every subdirectory as a module (a crash mid-copy would mint a phantom
    // module orb, and `/research:full` would dispatch a paid memo-writer against it), and `commit-run.sh`
    // stages the run root wholesale. The unique suffix keeps two concurrent requests off each other's tree.
    const tmpAbs = path.join(ANALYSES_DIR, `.carry-${subject}-${module}-${process.pid}-${carrySeq++}`)
    try {
      fs.rmSync(tmpAbs, { recursive: true, force: true })
      copyDir(srcAbs, tmpAbs)
      fs.writeFileSync(path.join(tmpAbs, CARRY_MARKER), carryNote(module, c.from, c.date, plan.targetRunRoot, replacedPartial), 'utf8')
      // Swap into place. The complete module supersedes any unfinished copy; the SOURCE folder is untouched,
      // so nothing finished is ever destroyed — only unfinished work in TODAY's root is replaced.
      if (replacedPartial) fs.rmSync(dstAbs, { recursive: true, force: true })
      fs.renameSync(tmpAbs, dstAbs)
    } finally {
      // A throw anywhere above (ENOSPC, EXDEV, a mid-copy kill) must not leave the staging tree behind.
      fs.rmSync(tmpAbs, { recursive: true, force: true })
    }
    carried.push({ module, from: c.from })
  }
  return { carried, skipped }
}
