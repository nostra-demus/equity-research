import fs from 'node:fs'
import { createHash, randomUUID } from 'node:crypto'
import path from 'node:path'
import { ANALYSES_DIR, REPO_ROOT } from './config'
import { resolveInsideAnalyses, resolveInsidePrompts } from './sandbox'
import { extractVerdict } from './verdict'
import {
  applyErrata, CORRECTIONS_SCHEMA, resolveDisplayFields, supersededTarget,
  validSupersessionPublication,
} from './ledger-corrections'
import { diffDecisionRecords } from './run-diff'
import { publishedGitCommit, publishedTreeAuthority, type PublishedTreeAuthority } from './published-git'
import { listSwarms } from './swarms'
import { buildCallsScorecard, type ActionNowLabel } from './call-learning'

// Output markdown is always an engine-authored repo-relative artifact. The strict segment allowlist makes
// the public request boundary explicit; filesystem enumeration and canonical containment below prevent the
// request value itself from becoming a path while rejecting aliases and symlink escapes.
const SAFE_OUTPUT_MARKDOWN_RE = /^(?:[A-Za-z0-9][A-Za-z0-9._-]*\/)+[A-Za-z0-9][A-Za-z0-9._-]*\.md$/

function missingOutputPath(): Error {
  return Object.assign(new Error('Output markdown not found'), { code: 'ENOENT' })
}

/**
 * Resolve an existing regular file without ever feeding request-derived text to a filesystem path sink.
 * Each requested segment is only compared with names returned by readdir; the selected entry name is the
 * value joined into the next path. Rejecting links at every step also closes aliases and swap-through-link
 * attacks before the final canonical containment check.
 */
function resolveEnumeratedFile(root: string, requestedRelativePath: string): string {
  const baseReal = fs.realpathSync(root)
  const requestedSegments = requestedRelativePath.split('/')
  let current = baseReal
  for (let index = 0; index < requestedSegments.length; index += 1) {
    const requestedName = requestedSegments[index]
    const entry = fs.readdirSync(current, { withFileTypes: true })
      .find((candidate) => candidate.name === requestedName)
    if (!entry || entry.isSymbolicLink()) throw missingOutputPath()
    const terminal = index === requestedSegments.length - 1
    if ((terminal && !entry.isFile()) || (!terminal && !entry.isDirectory())) throw missingOutputPath()
    current = path.join(current, entry.name)
  }
  const real = fs.realpathSync(current)
  if (!real.startsWith(`${baseReal}${path.sep}`)) throw new Error('Path escapes the output sandbox')
  return real
}

export function readMarkdown(relPath: string): { path: string; markdown: string } {
  if (!SAFE_OUTPUT_MARKDOWN_RE.test(relPath)) throw new Error('Invalid output markdown path')
  const prefix = 'analyses/'
  if (!relPath.startsWith(prefix)) throw new Error('Path escapes the analyses sandbox')
  const real = resolveEnumeratedFile(ANALYSES_DIR, relPath.slice(prefix.length))
  const markdown = fs.readFileSync(real, 'utf8')
  return { path: relPath, markdown }
}

/** Read markdown confined to any discovered swarm run tree. */
export function readRunsMarkdown(relPath: string): { path: string; markdown: string } {
  if (!SAFE_OUTPUT_MARKDOWN_RE.test(relPath)) throw new Error('Invalid output markdown path')
  const roots = [
    { prefix: 'analyses/', root: ANALYSES_DIR },
    ...listSwarms().map((swarm) => ({
      prefix: `${swarm.runsRoot.replace(/\/+$/, '')}/`,
      root: path.join(REPO_ROOT, swarm.runsRoot),
    })),
  ].sort((left, right) => right.prefix.length - left.prefix.length)
  const selected = roots.find(({ prefix }) => relPath.startsWith(prefix))
  if (!selected) throw new Error('Path escapes the runs sandbox')
  const real = resolveEnumeratedFile(selected.root, relPath.slice(selected.prefix.length))
  const markdown = fs.readFileSync(real, 'utf8')
  return { path: relPath, markdown }
}

// Calls advertises only these published artifacts. General run output remains owned by the scoped readers;
// this narrow reader exists so a dirty doer and a fresh/static host open the same bytes the Calls row used.
const PUBLISHED_CALLS_ARTIFACT_RE = /^(?:analyses\/[A-Z0-9.\-]{1,40}_\d{4}-\d{2}-\d{2}\/final_thesis\.md|analyses\/[A-Z0-9.\-]{1,40}_\d{4}-\d{2}-\d{2}\/reviews\/\d{4}-\d{2}-\d{2}_[A-Za-z0-9-]{1,20}_(?:decision_review(?:_v\d+)?\.json|memo_delta(?:_v\d+)?\.md)|analyses\/tracking\/\d{4}-\d{2}-\d{2}_calls_tracker(?:_v\d+)?\.md)$/
const PUBLISHED_DECISION_REVIEW_BASENAME_RE = /^\d{4}-\d{2}-\d{2}_[A-Za-z0-9-]{1,20}_decision_review(?:_v\d+)?\.json$/

export function isPublishedCallsArtifactPath(value: unknown): value is string {
  return typeof value === 'string' && PUBLISHED_CALLS_ARTIFACT_RE.test(value)
}

/** Read a Calls click-through from the exact published Git snapshot, never mutable disk. */
export async function readPublishedCallsMarkdown(relPath: string): Promise<{ path: string; markdown: string }> {
  if (!isPublishedCallsArtifactPath(relPath)) {
    throw Object.assign(new Error('invalid published Calls artifact path'), {
      code: 'INVALID_CALLS_ARTIFACT_PATH', statusCode: 400,
    })
  }
  const authority = await publishedTreeAuthority('analyses')
  if (!authority.paths.has(relPath)) {
    throw Object.assign(new Error('published Calls artifact not found'), { code: 'ENOENT', statusCode: 404 })
  }
  await authority.loadRequired([relPath])
  return { path: relPath, markdown: authority.readRequired(relPath).toString('utf8') }
}

// Read a prompt (agent definition / module rules / constitution) from the read-only doctrine surface.
export function readPrompt(relPath: string): { path: string; markdown: string } {
  const real = resolveInsidePrompts(relPath)
  const markdown = fs.readFileSync(real, 'utf8')
  return { path: relPath, markdown }
}

// The STANDING run folder for a ticker: the newest run that carries a finished decision record, else the
// newest folder. A later module-only re-run writes a fresh dated folder with NO decision record; because
// folders sort newest-first it would otherwise shadow the completed dossier and the cockpit would open an
// empty run. Falls back to the newest folder only when no run has decided yet (a brand-new in-progress run
// still resolves). Existence-checks only — cheap enough for the per-request display/chat path.
export function standingRunDir(ticker: string): string | null {
  let dirs: string[] = []
  try {
    dirs = fs.readdirSync(ANALYSES_DIR).filter((n) => n.startsWith(ticker + '_')).sort().reverse()
  } catch {
    return null
  }
  if (!dirs.length) return null
  for (const d of dirs) {
    try {
      // "complete" means the decision record PARSES INTO AN OBJECT — a missing, half-written, or non-object
      // (array / primitive, e.g. a hand-edited file) record shouldn't win the standing pick. This matches the
      // object guard in summarizeRuns (data-status.ts), so the pill and the open path always agree.
      const dr = JSON.parse(fs.readFileSync(path.join(ANALYSES_DIR, d, 'decision_record.json'), 'utf8'))
      if (dr && typeof dr === 'object' && !Array.isArray(dr)) return d
    } catch { /* missing or malformed — keep scanning older runs */ }
  }
  return dirs[0]
}

// `preferComplete` (the display + chat paths) resolves a bare ticker to its STANDING run — the newest run
// that actually decided — instead of the literal newest folder, so a partial re-run cannot shadow the
// dossier. The launcher deliberately leaves it OFF: `resolveAgentRunRoot` and `rerun` target the newest
// folder (where a fresh module run writes / what a rerun continues), which must stay newest-wins.
export function resolveRunRoot(opts: { runRoot?: string; ticker?: string; date?: string; preferComplete?: boolean }): string | null {
  if (opts.runRoot) return opts.runRoot.replace(/^\/+/, '')
  if (opts.ticker && opts.date) return `analyses/${opts.ticker}_${opts.date}`
  if (opts.ticker) {
    if (opts.preferComplete) {
      const d = standingRunDir(opts.ticker)
      return d ? `analyses/${d}` : null
    }
    try {
      const dirs = fs.readdirSync(ANALYSES_DIR).filter((n) => n.startsWith(opts.ticker + '_')).sort().reverse()
      return dirs.length ? `analyses/${dirs[0]}` : null
    } catch {
      return null
    }
  }
  return null
}

// ---- durable run-root markers ----
// Small on-disk flags written into a discovered swarm run folder so a run's lifecycle survives the engine being
// killed/restarted (the in-memory run registry is wiped on restart — disk is the only surviving truth,
// the same philosophy as the screener's .aborted/.target markers). Used by the resume supervisor:
//   .interrupted — this run was broken by a plan-limit hit / a dropped connection / an external kill
//                  (NOT a clean budget-truncation, which is the honest `incomplete` outcome). Carries
//                  the rate-limit resetsAt so a paused run knows when it may continue, even across a
//                  reboot. Cleared when the run completes or is deliberately cancelled.
//   .aborted     — the user deliberately stopped this run; never auto-resume it.
// Containment: the marker path is rebuilt under one discovered manifest's runsRoot and rejected if it
// escapes. Every write/read is best-effort and never throws
// into the run lifecycle.
function runMarkerPath(runRoot: string, name: string): string | null {
  if (!/^\.[a-z_]+$/.test(name)) return null // fixed marker names only
  const abs = path.isAbsolute(runRoot) ? runRoot : path.join(REPO_ROOT, runRoot)
  const realRoot = path.resolve(abs)
  const allowed = listSwarms().some((swarm) => {
    const root = path.resolve(REPO_ROOT, swarm.runsRoot)
    return realRoot !== root && realRoot.startsWith(`${root}${path.sep}`)
  })
  if (!allowed) return null
  return path.join(realRoot, name)
}

/**
 * Atomically replace one supervisor-owned file below an existing, real run root without following a
 * provider-created symlink. The provider may write sibling outputs concurrently; it can never redirect
 * this write into Git/code/state through a target or ancestor link.
 */
export function writeSupervisorRunFile(
  runRoot: string,
  relative: string,
  contents: string | Buffer,
  mode = 0o600,
): string {
  if (!relative || path.isAbsolute(relative) || relative.includes('\\')
      || path.posix.normalize(relative) !== relative || relative.split('/').includes('..')) {
    throw new Error('unsafe supervisor run-file path')
  }
  const root = path.resolve(REPO_ROOT, runRoot)
  const allowed = listSwarms().some((swarm) => {
    const runsRoot = path.resolve(REPO_ROOT, swarm.runsRoot)
    return root !== runsRoot && root.startsWith(`${runsRoot}${path.sep}`)
  })
  if (!allowed) throw new Error('supervisor run-file root is outside discovered run stores')
  const rootInfo = fs.lstatSync(root)
  if (!rootInfo.isDirectory() || rootInfo.isSymbolicLink() || fs.realpathSync(root) !== root) {
    throw new Error('supervisor run-file root is not a real directory')
  }
  const target = path.resolve(root, relative)
  if (!target.startsWith(`${root}${path.sep}`)) throw new Error('supervisor run-file escaped its root')
  const parent = path.dirname(target)
  const parentRelative = path.relative(root, parent)
  let cursor = root
  for (const segment of parentRelative ? parentRelative.split(path.sep) : []) {
    cursor = path.join(cursor, segment)
    const info = fs.lstatSync(cursor)
    if (!info.isDirectory() || info.isSymbolicLink() || fs.realpathSync(cursor) !== cursor) {
      throw new Error('supervisor run-file has a symlink/non-directory ancestor')
    }
  }
  try {
    const existing = fs.lstatSync(target)
    if (!existing.isFile() || existing.isSymbolicLink() || fs.realpathSync(target) !== target) {
      throw new Error('supervisor run-file target is not a regular file')
    }
  } catch (error: any) {
    if (error?.code !== 'ENOENT') throw error
  }
  const temporary = path.join(parent, `.nostra-supervisor-${randomUUID()}.tmp`)
  const descriptor = fs.openSync(
    temporary,
    fs.constants.O_WRONLY | fs.constants.O_CREAT | fs.constants.O_EXCL | (fs.constants.O_NOFOLLOW ?? 0),
    mode,
  )
  try {
    fs.writeFileSync(descriptor, contents)
    fs.fsyncSync(descriptor)
  } finally {
    fs.closeSync(descriptor)
  }
  try {
    fs.renameSync(temporary, target)
    const directory = fs.openSync(parent, fs.constants.O_RDONLY)
    try { fs.fsyncSync(directory) } finally { fs.closeSync(directory) }
  } catch (error) {
    try { fs.unlinkSync(temporary) } catch { /* absent */ }
    throw error
  }
  return target
}

export function writeRunMarker(runRoot: string | null, name: string, body: Record<string, unknown> = {}): void {
  if (!runRoot) return
  const p = runMarkerPath(runRoot, name)
  if (!p) return
  try {
    writeSupervisorRunFile(runRoot, name, JSON.stringify({ ...body, at: new Date().toISOString() }) + '\n')
  } catch { /* best-effort marker */ }
}

export function clearRunMarker(runRoot: string | null, name: string): void {
  if (!runRoot) return
  const p = runMarkerPath(runRoot, name)
  if (!p) return
  try { fs.rmSync(p, { force: true }) } catch { /* best-effort */ }
}

export function readRunMarker(runRoot: string, name: string): Record<string, any> | null {
  const p = runMarkerPath(runRoot, name)
  if (!p) return null
  try { return JSON.parse(fs.readFileSync(p, 'utf8')) } catch { return null }
}

export function hasRunMarker(runRoot: string, name: string): boolean {
  const p = runMarkerPath(runRoot, name)
  if (!p) return false
  try { return fs.existsSync(p) } catch { return false }
}

export function readDecision(runRoot: string, resolve: (p: string) => string = resolveInsideAnalyses): any {
  const p = resolve(`${runRoot}/decision_record.json`)
  return JSON.parse(fs.readFileSync(p, 'utf8'))
}

export function listRunsForTicker(ticker: string) {
  let dirs: string[] = []
  try {
    dirs = fs.readdirSync(ANALYSES_DIR).filter((n) => n.startsWith(ticker + '_')).sort().reverse()
  } catch {
    return []
  }
  return dirs.map((d) => {
    const runRoot = `analyses/${d}`
    const runAbs = path.join(REPO_ROOT, runRoot)
    let decision: string | null = null
    let confidence: number | null = null
    let decisionDate: string | null = null
    try {
      const dr = readDecision(runRoot)
      decision = dr.decision ?? null
      confidence = typeof dr.confidence_score === 'number' ? dr.confidence_score : null
      decisionDate = dr.decision_date ?? null
    } catch {}
    // Module folders present in this run. Labels a run in the history view as a full pipeline vs a
    // single-module re-run. A real module folder carries the engine's numbered agent outputs (`NN_*.md`,
    // incl. its `99_*-synthesis.md`); run-support folders do NOT — `reviews/` holds `*.json` + `*_memo_delta.md`
    // and `_pool_extracts/` holds `*.txt`. Deriving membership from that output pattern (not "every subdir")
    // keeps it zero-touch as modules change (§26) and stops support dirs being reported/counted as modules.
    let modules: string[] = []
    try {
      modules = fs.readdirSync(runAbs, { withFileTypes: true })
        .filter((e) => e.isDirectory() && !e.name.startsWith('.'))
        .filter((e) => {
          try { return fs.readdirSync(path.join(runAbs, e.name)).some((f) => /^\d\d_.*\.md$/.test(f)) } catch { return false }
        })
        .map((e) => e.name).sort()
    } catch {}
    return {
      runRoot,
      date: d.slice(ticker.length + 1),
      decision,
      confidence,
      decisionDate,
      modules,
      // decision_record.json present = a finished run (the completeness signal the standing-run pick uses);
      // audit_dossier.md = the full plain-English dossier is available to open.
      hasDecisionRecord: fs.existsSync(path.join(runAbs, 'decision_record.json')),
      hasDossier: fs.existsSync(path.join(runAbs, 'audit_dossier.md')),
      hasFinalThesis: fs.existsSync(path.join(runAbs, 'final_thesis.md')),
    }
  })
}

// `terminalModule` (a constellation swarm's DAG sink, from roster.terminalModuleName) marks which
// module's synthesis is the run's FINAL deliverable when the run root has no final_thesis.md.
// Research callers omit it: their booleans/paths are unchanged, and the additive `finalReport`
// key simply mirrors final_thesis.md ({path, module: null}) or is null.
export function runManifest(runRoot: string, resolve: (p: string) => string = resolveInsideAnalyses, terminalModule?: string | null) {
  const abs = resolve(runRoot)
  const modules: Record<string, { agentKey: string; name: string; verdict: string | null }[]> = {}
  // per-module three tiers (run-root-relative paths), mirroring the run-level memo/thesis/dossier.
  // derived generically from filename patterns — no module name is ever hardcoded (CLAUDE.md §26).
  const moduleReports: Record<string, { synthesis?: string; memo?: string; dossier?: string }> = {}
  for (const entry of fs.readdirSync(abs)) {
    const sub = path.join(abs, entry)
    let isDir = false
    try {
      isDir = fs.statSync(sub).isDirectory()
    } catch {}
    if (!isDir) continue
    const all = fs.readdirSync(sub)
    const files = all.filter((f) => /^[0-9]{2}_.*\.md$/.test(f)).sort()
    modules[entry] = files.map((f) => {
      const base = f.replace(/\.md$/, '')
      let verdict: string | null = null
      try {
        verdict = extractVerdict(fs.readFileSync(path.join(sub, f), 'utf8'))
      } catch {}
      return { agentKey: `${entry}/${base}`, name: base.slice(3), verdict }
    })
    const synthesis = all.find((f) => /^99_.*-synthesis\.md$/.test(f))
    const memo = all.find((f) => /_memo\.md$/.test(f))
    const dossier = all.find((f) => /_dossier\.md$/.test(f))
    if (synthesis || memo || dossier) {
      moduleReports[entry] = {
        ...(synthesis ? { synthesis: `${runRoot}/${entry}/${synthesis}` } : {}),
        ...(memo ? { memo: `${runRoot}/${entry}/${memo}` } : {}),
        ...(dossier ? { dossier: `${runRoot}/${entry}/${dossier}` } : {}),
      }
    }
  }
  const has = (f: string) => fs.existsSync(path.join(abs, f))
  // The run's final deliverable, generically: research ends on final_thesis.md at the run root; a
  // constellation swarm ends on its terminal module's synthesis (the dossier). Null until written.
  const terminalSynthesis = terminalModule ? moduleReports[terminalModule]?.synthesis : undefined
  const finalReport = has('final_thesis.md')
    ? { path: `${runRoot}/final_thesis.md`, module: null as string | null }
    : terminalSynthesis
      ? { path: terminalSynthesis, module: terminalModule as string }
      : null
  return {
    runRoot,
    modules,
    moduleReports,
    finalReport,
    memo: has('memo.md'),
    finalThesis: has('final_thesis.md'),
    fullDossier: has('audit_dossier.md'),
    decisionRecord: has('decision_record.json'),
    verification: has('verification_report.json') || has('verification_report_v3.json') || has('verification_report_v2.json'),
    preMortem: has('pre_mortem.json'),
    expectationsGap: has('expectations_gap.json'),
  }
}

// ---- calls tracker (read-only ledger view over decision_record.json + reviews/*.json) ----
// The cockpit Calls Tracker and /research:track read this same shape. The due/overdue rule is the
// EXACT port of .claude/hooks/review_due.py (local date, lexical ISO compare, review-file glob
// `*_<window>_decision_review*.json`) — keep them byte-identical so the hook, command, and UI agree.

// local YYYY-MM-DD, matching review_due.py's datetime.date.today() (local, NOT UTC).
export function todayISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// strict zero-padded YYYY-MM-DD — only then is lexical comparison valid (mirrors review_due.py isdate()).
export function isISODate(s: unknown): s is string {
  return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s)
}

// ---- needs-attention (AS forecast-overdue / AW kill-criteria-overdue) ----
// The EXACT port of scripts/eval.py's isdate() + _as_due_date() + eval_as_forecast_overdue() +
// eval_aw_kill_criteria_overdue() — same convention as the review_due.py port above: keep them
// byte-identical so the eval harness's retrospective advisories and the live cockpit never disagree.
// eval.py only reports these in `retrospective_advisories` when someone runs `/research:eval` by
// hand (PR #435); this port is what makes the SAME two checks visible live, in GET /api/calls and
// /research:track, without waiting for a manual eval run.

// a real calendar date, not merely regex-shaped (mirrors python's datetime.date.fromisoformat, which
// rejects e.g. '2026-02-30' — new Date() would silently roll that over to March and must not be used).
export function isValidCalendarISODate(s: unknown): s is string {
  if (!isISODate(s)) return false
  const y = Number(s.slice(0, 4))
  const mo = Number(s.slice(5, 7))
  const da = Number(s.slice(8, 10))
  if (mo < 1 || mo > 12) return false
  const leap = y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0)
  const daysInMonth = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  return da >= 1 && da <= daysInMonth[mo - 1]
}

const MONTH_NUM: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
}

// the date a window CLOSES, read out of free text (the ledger's own convention, e.g. 'Q2 2026 earnings
// July 31, 2026' / 'FY2026 results release (~March 2027)') — ISO date, 'Month DD, YYYY', or bare
// 'Month YYYY' (closes on the 28th, the only day every month has). Returns null when undateable.
export function dueDateFromFreeText(text: string): string | null {
  let m = /(\d{4})-(\d{2})-(\d{2})/.exec(text)
  if (m && isValidCalendarISODate(m[0])) return m[0]
  m = /([A-Za-z]{3,9})\s+(\d{1,2}),\s*(\d{4})/.exec(text)
  if (m) {
    const mon = MONTH_NUM[m[1].slice(0, 3).toLowerCase()]
    if (mon) {
      const cand = `${m[3]}-${String(mon).padStart(2, '0')}-${String(Number(m[2])).padStart(2, '0')}`
      if (isValidCalendarISODate(cand)) return cand
    }
  }
  m = /([A-Za-z]{3,9})\s+(\d{4})/.exec(text)
  if (m) {
    const mon = MONTH_NUM[m[1].slice(0, 3).toLowerCase()]
    if (mon) return `${m[2]}-${String(mon).padStart(2, '0')}-28`
  }
  return null
}

// forecast_ledger prefers a structured due field; falls back to free-text time_window (mirrors
// _as_due_date's field-then-freetext order exactly).
function forecastDueDate(entry: any): string | null {
  for (const k of ['resolves_on', 'due_date', 'resolve_by']) {
    if (isValidCalendarISODate(entry?.[k])) return entry[k]
  }
  return dueDateFromFreeText(String(entry?.time_window ?? ''))
}

const AS_RESOLVED = new Set(['confirmed', 'falsified', 'expired', 'resolved', 'closed', 'superseded', 'void', 'withdrawn'])

interface OverdueItem {
  due_date: string
  description: string
}

// check AS — CLAUDE.md §19: "a forecast that cannot be checked later is not a forecast."
function forecastsOverdue(forecastLedger: unknown, today: string): OverdueItem[] {
  if (!Array.isArray(forecastLedger) || !isISODate(today)) return []
  const out: OverdueItem[] = []
  forecastLedger.forEach((e: any, i: number) => {
    if (!e || typeof e !== 'object') return
    const status = String(e.status ?? e.outcome ?? '').trim().toLowerCase()
    if (AS_RESOLVED.has(status)) return // already settled
    const due = forecastDueDate(e)
    if (!due || due >= today) return // undateable, or not yet due
    const pred = String(e.prediction ?? '').slice(0, 110)
    out.push({ due_date: due, description: `forecast_ledger[${i}] came due ${due} and is still unresolved (status ${status || 'unset'}): ${pred}` })
  })
  return out
}

function killCriterionMonitorText(entry: any): string {
  if (entry && typeof entry === 'object') {
    for (const f of ['monitor', 'monitor_via']) {
      const v = entry[f]
      if (typeof v === 'string' && v.trim()) return v.trim()
    }
  }
  return ''
}

function killCriterionText(entry: any): string {
  if (typeof entry === 'string') return entry.trim()
  if (entry && typeof entry === 'object') {
    for (const f of ['criterion', 'condition', 'trigger', 'what_invalidates', 'kill_criterion', 'description', 'text']) {
      const v = entry[f]
      if (typeof v === 'string' && v.trim()) return v.trim()
    }
  }
  return ''
}

// check AW — CLAUDE.md §8: disconfirming evidence is "a required test the thesis must survive," not a
// closing caveat. Reuses forecast_ledger's own date-extraction against kill_criteria's free-text
// `monitor` field (kill_criteria carries no structured due-date field of its own).
function killCriteriaOverdue(killCriteria: unknown, today: string): OverdueItem[] {
  if (!Array.isArray(killCriteria) || !isISODate(today)) return []
  const out: OverdueItem[] = []
  killCriteria.forEach((e: any, i: number) => {
    const mon = killCriterionMonitorText(e)
    if (!mon) return // no monitor text (e.g. a legacy plain-string entry) — undateable, never flagged
    const due = dueDateFromFreeText(mon)
    if (!due || due >= today) return
    const crit = killCriterionText(e).slice(0, 110) || '<empty criterion>'
    out.push({ due_date: due, description: `kill_criteria[${i}] monitor event (${due}) has passed and was never checked: ${crit}` })
  })
  return out
}

export interface ReviewFile {
  file: string // repo-relative path under analyses/
  basename: string
  review_window: string
  review_date: string
  review_price: number | null
  absolute_return_pct: number | null
  benchmark_relative_return_pct: number | null
  thesis_status: string | null
  decision_quality: string | null
  forecasts_confirmed: number
  forecasts_falsified: number
  // §8 memo_delta block (DECISION_LEDGER): the human-readable "what changed since the memo" tier.
  memo_delta_file: string | null
  stage_one_comment: string | null
  memo_delta_summary: string | null
  thesis_delta_verdict: string | null
  action_now: { label: ActionNowLabel; reason: string; recorded: true } | null
  confidence_update: { before: number | null; after: number | null; change_reason: string | null } | null
  next_check: { date: string | null; label: string | null; trigger: string | null } | null
  learning: {
    why_right_or_wrong: string | null
    error_source: string | null
    rule_for_future: string | null
    future_research_check: string | null
  } | null
  lessons: string[]
  error_taxonomy: string[]
  watch_items: string[]
}

function finiteNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function confidenceScore(value: unknown): number | null {
  const score = finiteNumber(value)
  return score !== null && score >= 0 && score <= 100 ? score : null
}

const ACTION_NOW_LABELS = new Set<ActionNowLabel>(['Hold', 'Add', 'Exit', 'Stay away', 'Keep watching'])
const cleanString = (value: unknown): string | null => typeof value === 'string' && value.trim() ? value.trim() : null
const cleanStringArray = (value: unknown): string[] => Array.isArray(value)
  ? value.map(cleanString).filter((row): row is string => !!row).slice(0, 30)
  : []

export function structuredReviewFields(j: any, md: any): Pick<ReviewFile, 'action_now' | 'confidence_update' | 'next_check' | 'learning' | 'lessons' | 'error_taxonomy' | 'watch_items'> {
  const action = j?.action_now && typeof j.action_now === 'object' ? j.action_now : null
  const actionLabel = cleanString(action?.label)
  const actionReason = cleanString(action?.reason)
  const confidence = j?.confidence_update && typeof j.confidence_update === 'object' ? j.confidence_update : null
  const next = j?.next_check && typeof j.next_check === 'object' ? j.next_check : null
  const learning = j?.learning && typeof j.learning === 'object' ? j.learning : null
  return {
    action_now: actionLabel && actionReason && ACTION_NOW_LABELS.has(actionLabel as ActionNowLabel)
      ? { label: actionLabel as ActionNowLabel, reason: actionReason, recorded: true }
      : null,
    confidence_update: confidence ? {
      before: confidenceScore(confidence.before), after: confidenceScore(confidence.after),
      change_reason: cleanString(confidence.change_reason),
    } : null,
    next_check: next ? {
      date: isValidCalendarISODate(next.date) ? next.date : null,
      label: cleanString(next.label), trigger: cleanString(next.trigger),
    } : null,
    learning: learning ? {
      why_right_or_wrong: cleanString(learning.why_right_or_wrong),
      error_source: cleanString(learning.error_source),
      rule_for_future: cleanString(learning.rule_for_future),
      future_research_check: cleanString(learning.future_research_check),
    } : null,
    lessons: cleanStringArray(j?.lessons),
    error_taxonomy: cleanStringArray(j?.error_taxonomy),
    watch_items: cleanStringArray(md?.watch_items),
  }
}

// normalize forecast_results[].status (lowercase, unknown-safe) and count the resolved ones.
function countForecastResults(results: unknown): { confirmed: number; falsified: number } {
  let confirmed = 0
  let falsified = 0
  if (Array.isArray(results)) {
    for (const r of results) {
      const s = String((r as any)?.status ?? '').toLowerCase()
      if (s === 'confirmed') confirmed++
      else if (s === 'falsified') falsified++
    }
  }
  return { confirmed, falsified }
}

export function safeRunArtifact(
  value: unknown,
  runRoot: string,
  publishedPaths: ReadonlySet<string>,
  subdir = '',
): string | null {
  if (typeof value !== 'string' || !value || value.includes('\\') || path.isAbsolute(value)) return null
  const prefix = `${runRoot}/${subdir ? `${subdir.replace(/\/$/, '')}/` : ''}`
  if (!value.startsWith(prefix) || value.split('/').some((part) => !part || part === '.' || part === '..')) return null
  return publishedPaths.has(value) && isPublishedCallsArtifactPath(value) ? value : null
}

function listReviewFiles(runRoot: string, authority: PublishedTreeAuthority): ReviewFile[] {
  const prefix = `${runRoot}/reviews/`
  const names = [...authority.paths]
    .filter((repoPath) => repoPath.startsWith(prefix))
    .map((repoPath) => repoPath.slice(prefix.length))
    .filter((name) => PUBLISHED_DECISION_REVIEW_BASENAME_RE.test(name))
    .sort()
  const out: ReviewFile[] = []
  for (const n of names) {
    let j: any
    try {
      j = JSON.parse(authority.readRequired(`${runRoot}/reviews/${n}`).toString('utf8'))
    } catch (error: any) {
      if (error?.code === 'CALLS_AUTHORITY_UNAVAILABLE') throw error
      continue // malformed published JSON is not a completed review
    }
    const fc = countForecastResults(j?.forecast_results)
    const md = j?.memo_delta && typeof j.memo_delta === 'object' ? j.memo_delta : null
    const structured = structuredReviewFields(j, md)
    out.push({
      file: `${runRoot}/reviews/${n}`,
      basename: n,
      review_window: typeof j?.review_window === 'string' ? j.review_window : '',
      review_date: typeof j?.review_date === 'string' ? j.review_date : '',
      review_price: finiteNumber(j?.review_price),
      absolute_return_pct: finiteNumber(j?.absolute_return_pct),
      benchmark_relative_return_pct: finiteNumber(j?.benchmark_relative_return_pct),
      thesis_status: typeof j?.thesis_status === 'string' && j.thesis_status ? j.thesis_status : null,
      decision_quality: typeof j?.decision_quality === 'string' && j.decision_quality ? j.decision_quality : null,
      forecasts_confirmed: fc.confirmed,
      forecasts_falsified: fc.falsified,
      memo_delta_file: safeRunArtifact(md?.memo_delta_file, runRoot, authority.paths, 'reviews'),
      stage_one_comment: typeof md?.stage_one_comment === 'string' && md.stage_one_comment ? md.stage_one_comment : null,
      memo_delta_summary: typeof md?.summary === 'string' && md.summary.trim() ? md.summary.trim() : null,
      thesis_delta_verdict: typeof md?.thesis_delta_verdict === 'string' && md.thesis_delta_verdict.trim()
        ? md.thesis_delta_verdict.trim().toLowerCase()
        : null,
      ...structured,
    })
  }
  return out
}

function reviewFileVersion(file: ReviewFile): number {
  const match = /_v(\d+)\.json$/i.exec(file.basename)
  return match ? Number(match[1]) : 1
}

// Deterministic standing winner: latest review date, then highest numeric append-only correction.
function pickWinner(files: ReviewFile[]): ReviewFile | null {
  if (!files.length) return null
  return [...files].sort((a, b) => {
    if (a.review_date !== b.review_date) return a.review_date < b.review_date ? 1 : -1
    const av = reviewFileVersion(a)
    const bv = reviewFileVersion(b)
    if (av !== bv) return bv - av
    return b.basename.localeCompare(a.basename)
  })[0]
}

function standingReviewFiles(files: ReviewFile[]): ReviewFile[] {
  const byCheckpoint = new Map<string, ReviewFile>()
  for (const file of files) {
    const key = `${file.review_date.trim().toLowerCase()}|${file.review_window.trim().toLowerCase()}`
    const winner = pickWinner(byCheckpoint.has(key) ? [byCheckpoint.get(key)!, file] : [file])
    if (winner) byCheckpoint.set(key, winner)
  }
  return [...byCheckpoint.values()]
}

interface TimelineEntry {
  window: string
  due_date: string | null
  status: 'done' | 'due' | 'overdue' | 'upcoming'
  review_date?: string
  review_price?: number | null
  absolute_return_pct?: number | null
  benchmark_relative_return_pct?: number | null
  thesis_status?: string | null
  decision_quality?: string | null
  forecasts_confirmed?: number
  forecasts_falsified?: number
  review_file?: string
  review_count?: number
  memo_delta_file?: string // present only when the review filed a §8 memo delta
  stage_one_comment?: string
  memo_delta_summary?: string
  thesis_delta_verdict?: string
  action_now?: ReviewFile['action_now']
  confidence_update?: ReviewFile['confidence_update']
  next_check?: ReviewFile['next_check']
  learning?: ReviewFile['learning']
  lessons?: string[]
  error_taxonomy?: string[]
  watch_items?: string[]
}

function reviewLearningFields(review: ReviewFile) {
  return {
    ...(review.action_now ? { action_now: review.action_now } : {}),
    ...(review.confidence_update ? { confidence_update: review.confidence_update } : {}),
    ...(review.next_check ? { next_check: review.next_check } : {}),
    ...(review.learning ? { learning: review.learning } : {}),
    ...(review.lessons.length ? { lessons: review.lessons } : {}),
    ...(review.error_taxonomy.length ? { error_taxonomy: review.error_taxonomy } : {}),
    ...(review.watch_items.length ? { watch_items: review.watch_items } : {}),
  }
}

function buildTimeline(schedule: Record<string, any>, reviews: ReviewFile[], today: string): TimelineEntry[] {
  const out: TimelineEntry[] = []
  const scheduleKeys = Object.keys(schedule || {})
  // scheduled checkpoints (30d/90d/180d/365d/…): matched to a review by FILENAME window token,
  // exactly like review_due.py's `*_<window>_decision_review*.json` glob.
  for (const window of scheduleKeys) {
    const dt = schedule[window]
    if (!isISODate(dt)) continue
    const matches = reviews.filter((r) => r.basename.includes(`_${window}_decision_review`))
    const win = pickWinner(matches)
    if (win) {
      out.push({
        window,
        due_date: dt,
        status: 'done',
        review_date: win.review_date,
        review_price: win.review_price,
        absolute_return_pct: win.absolute_return_pct,
        benchmark_relative_return_pct: win.benchmark_relative_return_pct,
        thesis_status: win.thesis_status,
        decision_quality: win.decision_quality,
        forecasts_confirmed: win.forecasts_confirmed,
        forecasts_falsified: win.forecasts_falsified,
        review_file: win.file,
        review_count: matches.length,
        ...(win.memo_delta_file ? { memo_delta_file: win.memo_delta_file } : {}),
        ...(win.stage_one_comment ? { stage_one_comment: win.stage_one_comment } : {}),
        ...(win.memo_delta_summary ? { memo_delta_summary: win.memo_delta_summary } : {}),
        ...(win.thesis_delta_verdict ? { thesis_delta_verdict: win.thesis_delta_verdict } : {}),
        ...reviewLearningFields(win),
      })
    } else {
      out.push({ window, due_date: dt, status: dt < today ? 'overdue' : dt === today ? 'due' : 'upcoming' })
    }
  }
  // ad-hoc / non-scheduled reviews (each a distinct point in time as the call ages) as their own done entries
  for (const r of reviews) {
    const belongsToScheduled = scheduleKeys.some((w) => r.basename.includes(`_${w}_decision_review`))
    if (belongsToScheduled) continue
    out.push({
      window: r.review_window || 'ad-hoc',
      due_date: r.review_date || null,
      status: 'done',
      review_date: r.review_date,
      review_price: r.review_price,
      absolute_return_pct: r.absolute_return_pct,
      benchmark_relative_return_pct: r.benchmark_relative_return_pct,
      thesis_status: r.thesis_status,
      decision_quality: r.decision_quality,
      forecasts_confirmed: r.forecasts_confirmed,
      forecasts_falsified: r.forecasts_falsified,
      review_file: r.file,
      ...(r.memo_delta_file ? { memo_delta_file: r.memo_delta_file } : {}),
      ...(r.stage_one_comment ? { stage_one_comment: r.stage_one_comment } : {}),
      ...(r.memo_delta_summary ? { memo_delta_summary: r.memo_delta_summary } : {}),
      ...(r.thesis_delta_verdict ? { thesis_delta_verdict: r.thesis_delta_verdict } : {}),
      ...reviewLearningFields(r),
    })
  }
  // order by effective date (scheduled due_date or ad-hoc review_date); undated last
  out.sort((a, b) => {
    const da = a.due_date || '9999-99-99'
    const db = b.due_date || '9999-99-99'
    return da < db ? -1 : da > db ? 1 : 0
  })
  return out
}

function newestDashboard(publishedPaths: ReadonlySet<string>): string | null {
  const prefix = 'analyses/tracking/'
  const mds = [...publishedPaths]
    .filter((repoPath) => repoPath.startsWith(prefix))
    .map((repoPath) => repoPath.slice(prefix.length))
    .filter((name) => !name.includes('/') && /_calls_tracker(?:_v\d+)?\.md$/.test(name))
    .sort()
  return mds.length ? `${prefix}${mds[mds.length - 1]}` : null
}

const callsAuthorityUnavailable = (cause?: unknown): Error & { code: string; statusCode: number; cause?: unknown } => Object.assign(
  new Error('shared Calls history cannot be read safely'),
  { code: 'CALLS_AUTHORITY_UNAVAILABLE', statusCode: 503, ...(cause === undefined ? {} : { cause }) },
)

function requiredPublishedJsonObject(authority: PublishedTreeAuthority, repoPath: string): Record<string, any> {
  let value: unknown
  try {
    value = JSON.parse(authority.readRequired(repoPath).toString('utf8'))
  } catch (error: any) {
    if (error?.code === 'CALLS_AUTHORITY_UNAVAILABLE') throw error
    throw callsAuthorityUnavailable(error)
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw callsAuthorityUnavailable()
  return value as Record<string, any>
}

function publishedCorrections(runRoot: string, authority: PublishedTreeAuthority): Record<string, any> {
  const repoPath = `${runRoot}/corrections.json`
  if (!authority.paths.has(repoPath)) return {}
  const corrections = requiredPublishedJsonObject(authority, repoPath)
  // A listed but malformed sidecar cannot mean “no correction”: that could resurrect a superseded call.
  if (corrections.schema !== CORRECTIONS_SCHEMA) throw callsAuthorityUnavailable()
  return corrections
}

const PROVISIONAL_MARK = 'PROVISIONAL — the automated finish-gate'
const CLEAN_INTEGRITY_VERDICTS = new Set(['Clean', 'Minor issues'])
const VERIFY_REPORT_RE = /^verification_report(?:_v(\d+))?\.json$/

export function publishedIntegrityStatus(runRoot: string, authority: PublishedTreeAuthority) {
  const thesis = authority.readRequired(`${runRoot}/final_thesis.md`)
  const banner = thesis.toString('utf8').slice(0, 2000).includes(PROVISIONAL_MARK)
  const prefix = `${runRoot}/`
  const reports = [...authority.paths]
    .filter((repoPath) => repoPath.startsWith(prefix))
    .map((repoPath) => repoPath.slice(prefix.length))
    .map((name) => ({ name, match: VERIFY_REPORT_RE.exec(name) }))
    .filter((row): row is { name: string; match: RegExpExecArray } => !!row.match)
    .sort((a, b) => Number(a.match[1] || 1) - Number(b.match[1] || 1))

  let verdict: string | null = null
  let score: number | null = null
  let reportFile: string | null = null
  if (reports.length) {
    reportFile = reports[reports.length - 1].name
    try {
      const raw = JSON.parse(authority.readRequired(`${runRoot}/${reportFile}`).toString('utf8'))
      if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
        verdict = typeof raw.verdict === 'string' && raw.verdict ? raw.verdict : null
        score = finiteNumber(raw.integrity_score)
      }
    } catch (error: any) {
      if (error?.code === 'CALLS_AUTHORITY_UNAVAILABLE') throw error
      verdict = null
    }
  }
  const normalizedVerdict = verdict?.trim() || null
  const status = banner
    ? 'provisional'
    : reports.length
      ? normalizedVerdict !== null && CLEAN_INTEGRITY_VERDICTS.has(normalizedVerdict) ? 'verified' : 'provisional'
      : 'unaudited'
  return { status, verdict, integrity_score: score, banner, report_file: reportFile }
}

export type CallUpdateTone = 'better' | 'worse' | 'same' | 'info'

export interface CallUpdate {
  id: string
  ticker: string
  company: string | null
  at: string | null
  kind: 'call' | 'review'
  headline: string
  detail: string | null
  tone: CallUpdateTone
  run_root: string
  source_path: string | null
}

interface CallUpdateCall {
  ticker: string
  run_root: string
  company?: string | null
  decision_date?: string | null
  decision?: string | null
  expected_return_pct?: number | null
  final_thesis_path?: string | null
}

export interface CallUpdateInput {
  call: CallUpdateCall
  record: any
  reviews: ReviewFile[]
}

function updateId(...parts: Array<string | null | undefined>): string {
  return createHash('sha256').update(parts.map((part) => part || '').join('\u0000')).digest('hex').slice(0, 24)
}

function reviewHeadline(ticker: string, verdict: string | null): { headline: string; tone: CallUpdateTone } {
  switch (verdict) {
    case 'strengthened': return { headline: `${ticker}: the call looks stronger`, tone: 'better' }
    case 'weakened': return { headline: `${ticker}: the call looks weaker`, tone: 'worse' }
    case 'broken': return { headline: `${ticker}: the call no longer holds`, tone: 'worse' }
    case 'confirmed': return { headline: `${ticker}: the call is holding up`, tone: 'better' }
    case 'too_early': return { headline: `${ticker}: no clear change yet`, tone: 'same' }
    default: return { headline: `${ticker}: review finished`, tone: 'info' }
  }
}

function shortReviewDetail(review: ReviewFile): string | null {
  const raw = (review.memo_delta_summary || review.stage_one_comment || '').replace(/\s+/g, ' ').trim()
  const firstSentence = raw.match(/^.*?[.!?](?:\s|$)/)?.[0]?.trim() || raw
  const why = firstSentence.length > 240 ? `${firstSentence.slice(0, 237).trimEnd()}…` : firstSentence
  const outcomes: string[] = []
  const absoluteReturn = finiteNumber(review.absolute_return_pct)
  if (absoluteReturn !== null) {
    outcomes.push(`Price since the call: ${absoluteReturn >= 0 ? '+' : ''}${absoluteReturn.toFixed(1)}%`)
  }
  if (review.forecasts_confirmed || review.forecasts_falsified) {
    outcomes.push(`${review.forecasts_confirmed} forecast${review.forecasts_confirmed === 1 ? '' : 's'} right · ${review.forecasts_falsified} wrong`)
  }
  return [why || null, outcomes.length ? `${outcomes.join(' · ')}.` : null].filter(Boolean).join(' ') || null
}

function callDiffTone(diff: ReturnType<typeof diffDecisionRecords>): CallUpdateTone {
  const decision = diff.anchors.find((anchor) => anchor.field === 'decision' && anchor.moved)
  if (decision) {
    const rank = (value: unknown): number | null => {
      const key = String(value || '').trim().toLowerCase()
      const ranks: Record<string, number> = {
        avoid: 1, watchlist: 2, 'starter position only': 3, buy: 4, 'strong buy': 5,
      }
      return Object.prototype.hasOwnProperty.call(ranks, key) ? ranks[key] : null
    }
    const before = rank(decision.prev)
    const after = rank(decision.cur)
    if (before !== null && after !== null && before !== after) return after > before ? 'better' : 'worse'
    return 'info'
  }
  const headlineMove = diff.anchors.find((anchor) => anchor.field !== 'decision' && anchor.moved)
  if (headlineMove?.tone === 'worse') return 'worse'
  if (headlineMove?.tone === 'better') return 'better'
  return diff.verdict === 'identical' || diff.verdict === 'call_held' ? 'same' : 'info'
}

/** Build one stable, plain-English update stream from the same corrected rows Calls displays. */
export function buildCallUpdates(rows: CallUpdateInput[]): CallUpdate[] {
  const updates: CallUpdate[] = []
  const byTicker = new Map<string, CallUpdateInput[]>()
  for (const row of rows) {
    const ticker = String(row.call?.ticker || '').trim()
    if (!ticker || typeof row.call?.run_root !== 'string' || !row.call.run_root || !Array.isArray(row.reviews)) continue
    const existing = byTicker.get(ticker) || []
    existing.push(row)
    byTicker.set(ticker, existing)
  }

  for (const [ticker, tickerRows] of byTicker) {
    tickerRows.sort((a, b) => {
      const ad = String(a.call?.decision_date || '')
      const bd = String(b.call?.decision_date || '')
      return ad < bd ? -1 : ad > bd ? 1 : String(a.call?.run_root).localeCompare(String(b.call?.run_root))
    })
    let previous: CallUpdateInput | null = null
    for (const row of tickerRows) {
      const call = row.call
      const expectedReturn = finiteNumber(call.expected_return_pct)
      if (!previous) {
        updates.push({
          id: updateId('call', call.run_root), ticker, company: call.company ?? null,
          at: call.decision_date ?? null, kind: 'call',
          headline: `${ticker}: ${call.decision || 'new'} call recorded`,
          detail: expectedReturn !== null
            ? `Expected return at the time: ${expectedReturn > 0 ? '+' : ''}${expectedReturn.toFixed(1)}%.`
            : null,
          tone: 'info', run_root: call.run_root, source_path: call.final_thesis_path || null,
        })
      } else {
        const diff = diffDecisionRecords(previous.record, row.record)
        const sentence = diff.headline
          ? diff.headline.charAt(0).toLowerCase() + diff.headline.slice(1)
          : 'the call was updated.'
        updates.push({
          id: updateId('call-change', previous.call.run_root, call.run_root), ticker,
          company: call.company ?? null, at: call.decision_date ?? null, kind: 'call',
          headline: `${ticker}: ${sentence}`, detail: diff.subline || diff.tailSummary || null,
          tone: callDiffTone(diff), run_root: call.run_root, source_path: call.final_thesis_path || null,
        })
      }

      for (const review of standingReviewFiles(row.reviews)) {
        const display = reviewHeadline(ticker, review.thesis_delta_verdict || review.thesis_status)
        updates.push({
          id: updateId('review', review.file), ticker, company: call.company ?? null,
          at: review.review_date || null, kind: 'review', headline: display.headline,
          detail: shortReviewDetail(review), tone: display.tone, run_root: call.run_root,
          source_path: review.memo_delta_file || review.file,
        })
      }
      previous = row
    }
  }
  return updates.sort((a, b) => {
    const ad = a.at || ''
    const bd = b.at || ''
    return ad < bd ? 1 : ad > bd ? -1 : a.id.localeCompare(b.id)
  })
}

// One row per run-folder decision_record — a cross-ticker ledger of every call the engine made,
// each with its since-the-call timeline. Generic: scans all run folders, no module/ticker hardcoded.
async function projectAllCalls(authority: PublishedTreeAuthority) {
  const publishedPaths = authority.paths
  const runRoots = [...publishedPaths]
    .map((repoPath) => /^(analyses\/[A-Z0-9.\-]{1,40}_\d{4}-\d{2}-\d{2})\/decision_record\.json$/.exec(repoPath)?.[1] || null)
    .filter((runRoot): runRoot is string => !!runRoot && publishedPaths.has(`${runRoot}/final_thesis.md`))
    .sort()

  // Prime every blob this projection may read in one Git batch. readRequired() then becomes an in-memory
  // lookup, rather than blocking Fastify once per call/review on every cockpit poll.
  const runRootSet = new Set(runRoots)
  const projectionPaths = [...publishedPaths].filter((repoPath) => {
    const match = /^(analyses\/[A-Z0-9.\-]{1,40}_\d{4}-\d{2}-\d{2})\/(.+)$/.exec(repoPath)
    if (!match || !runRootSet.has(match[1])) return false
    const tail = match[2]
    return tail === 'decision_record.json' || tail === 'final_thesis.md' || tail === 'corrections.json'
      || VERIFY_REPORT_RE.test(tail) || /^reviews\/[A-Za-z0-9._-]+\.json$/.test(tail)
  })
  await authority.loadRequired(projectionPaths)

  // Supersession is authority, not decoration. Load only the few terminal artifacts named by
  // sidecars, through the same immutable Git snapshot; malformed/missing targets remain standing.
  const correctionsByRoot = new Map(runRoots.map((runRoot) => [runRoot, publishedCorrections(runRoot, authority)]))
  const supersessionArtifactPaths = new Set<string>()
  for (const corrections of correctionsByRoot.values()) {
    const target = supersededTarget(corrections)
    if (!target || !runRootSet.has(target)) continue
    for (const name of ['decision_record.json', 'final_thesis.md', 'memo.md', 'audit_dossier.md', 'corrections.json']) {
      const repoPath = `${target}/${name}`
      if (publishedPaths.has(repoPath)) supersessionArtifactPaths.add(repoPath)
    }
  }
  await authority.loadRequired(supersessionArtifactPaths)

  const today = todayISO()
  const calls: any[] = []
  const historyCalls: any[] = []
  const updateRows: CallUpdateInput[] = []
  for (const runRoot of runRoots) {
    const name = runRoot.slice('analyses/'.length)
    // Skip a corrected-away duplicate (frameworks/DECISION_LEDGER.md §4a): a run superseded by an
    // append-only corrections.json is not a live call — this is what de-double-counts EMAAR here and
    // in the cockpit Calls view, matching scripts/ledger_records.py's standing set.
    const corrections = correctionsByRoot.get(runRoot) || {}
    const requestedSupersession = supersededTarget(corrections)
    const rawDecision = requiredPublishedJsonObject(authority, `${runRoot}/decision_record.json`)
    let supersededBy: string | null = null
    if (requestedSupersession && runRootSet.has(requestedSupersession)) {
      const targetCorrections = correctionsByRoot.get(requestedSupersession) || {}
      const terminalArtifactSizes = Object.fromEntries(
        ['final_thesis.md', 'memo.md', 'audit_dossier.md'].map((name) => {
          const repoPath = `${requestedSupersession}/${name}`
          return [name, publishedPaths.has(repoPath) ? authority.readRequired(repoPath).length : null]
        }),
      )
      const rawTarget = requiredPublishedJsonObject(authority, `${requestedSupersession}/decision_record.json`)
      if (validSupersessionPublication(rawDecision, rawTarget, requestedSupersession,
        targetCorrections, terminalArtifactSizes)) supersededBy = requestedSupersession
    }
    const d = applyErrata(rawDecision, corrections)
    const reviews = listReviewFiles(runRoot, authority)
    const timeline = buildTimeline(d?.review_schedule || {}, reviews, today)
    const latest = pickWinner(reviews) // latest review across ALL windows incl. ad-hoc
    const entry = finiteNumber(d?.entry_price)
    const exp = finiteNumber(d?.expected_return_pct)
    const fc = { open: 0, confirmed: 0, falsified: 0, expired: 0, other: 0 }
    if (Array.isArray(d?.forecast_ledger)) {
      for (const f of d.forecast_ledger) {
        const s = String((f as any)?.status ?? 'open').toLowerCase()
        if (Object.prototype.hasOwnProperty.call(fc, s)) (fc as any)[s]++
        else fc.other++
      }
    }
    const pending =
      timeline.find((t) => t.status === 'overdue') ||
      timeline.find((t) => t.status === 'due') ||
      timeline.find((t) => t.status === 'upcoming') ||
      null
    // Truth-integrity status (DECISION_LEDGER.md §18a) + the post-mortem rating-cap / post-review
    // confidence preference (fix F28b / F28) that /research:track already applies — the live cockpit
    // was the one ledger consumer still showing the synthesizer's original, unflagged, uncapped call.
    const integrity = publishedIntegrityStatus(runRoot, authority)
    const disp = resolveDisplayFields(d)
    // Execution/backtests use the confidence that existed when the call was published. The in-path
    // pre-mortem haircut happened before publication and therefore wins; later outcome-review confidence
    // lives only in the timeline and cannot resize history with hindsight.
    const frozenConfidence = confidenceScore(d?.post_review_confidence_score)
      ?? confidenceScore(d?.confidence_score) ?? confidenceScore(d?.confidence)
    // checks AS / AW (scripts/eval.py) ported live — see the block above `isISODate`.
    const forecastsDue = forecastsOverdue(d?.forecast_ledger, today)
    const killCriteriaDue = killCriteriaOverdue(d?.kill_criteria, today)
    const call = {
      ticker: d?.ticker ?? name.replace(/_\d{4}-\d{2}-\d{2}$/, ''),
      company: d?.company_name ?? null,
      decision_date: d?.decision_date ?? null,
      decision: disp.decision,
      basket: disp.basket,
      decision_is_post_mortem_capped: disp.decisionIsPostMortemCapped,
      confidence: disp.confidence,
      confidence_is_post_review: disp.confidenceIsPostReview,
      // The decision-time state is immutable. Outcome reviews may explain or supersede the action now,
      // but they can never rewrite these fields after seeing the result.
      frozen_call: {
        locked: true,
        decision: disp.decision,
        basket: disp.basket,
        confidence: frozenConfidence,
        decision_date: d?.decision_date ?? null,
        entry_price: entry,
        currency: d?.currency ?? null,
        source_path: `${runRoot}/decision_record.json`,
      },
      integrity_status: integrity.status,
      integrity_verdict: integrity.verdict,
      integrity_banner: integrity.banner,
      time_horizon: d?.time_horizon ?? null,
      entry_price: entry,
      currency: d?.currency ?? null,
      exchange: typeof d?.exchange === 'string' && d.exchange ? d.exchange : null,
      expected_return_pct: exp,
      implied_target: entry != null && exp != null ? Math.round(entry * (1 + exp / 100) * 100) / 100 : null,
      downside_risk_pct: finiteNumber(d?.downside_risk_pct),
      kill_criteria_count: Array.isArray(d?.kill_criteria) ? d.kill_criteria.length : 0,
      forecasts: fc,
      run_root: runRoot,
      final_thesis_path: safeRunArtifact(d?.final_thesis_path, runRoot, publishedPaths) || `${runRoot}/final_thesis.md`,
      latest_thesis_status: latest?.thesis_status ?? null,
      latest_review_summary: latest?.memo_delta_summary ?? null,
      latest_review_verdict: latest?.thesis_delta_verdict ?? null,
      latest_review_date: latest?.review_date || null,
      latest_action_now: latest?.action_now ?? null,
      latest_confidence_update: latest?.confidence_update ?? null,
      next_checkpoint: pending ? { window: pending.window, due_date: pending.due_date, status: pending.status } : null,
      review_count: reviews.length,
      timeline,
      // AS_forecast_overdue / AW_kill_criteria_overdue, live — same two checks eval.py otherwise only
      // reports when someone runs `/research:eval` by hand.
      needs_attention: { forecasts_overdue: forecastsDue, kill_criteria_overdue: killCriteriaDue },
      superseded: Boolean(supersededBy),
      superseded_by: supersededBy,
    }
    historyCalls.push(call)
    if (supersededBy) continue
    calls.push(call)
    updateRows.push({ call, record: d, reviews })
  }
  // newest call first
  calls.sort((a, b) => {
    const ad = String(a.decision_date)
    const bd = String(b.decision_date)
    return ad < bd ? 1 : ad > bd ? -1 : String(a.run_root).localeCompare(String(b.run_root))
  })
  // ranked "needs attention now" list across ALL calls: most-overdue (earliest due_date) first, then
  // ticker as a stable tiebreak. This is what makes AS/AW actionable without running the eval harness.
  const needsAttention = calls
    .flatMap((c) => [
      ...c.needs_attention.forecasts_overdue.map((it: OverdueItem) => ({ type: 'forecast' as const, ...it })),
      ...c.needs_attention.kill_criteria_overdue.map((it: OverdueItem) => ({ type: 'kill_criteria' as const, ...it })),
    ].map((it) => ({
      ticker: c.ticker,
      company: c.company,
      run_root: c.run_root,
      final_thesis_path: c.final_thesis_path,
      ...it,
    })))
    .sort((a, b) => (a.due_date < b.due_date ? -1 : a.due_date > b.due_date ? 1 : a.ticker < b.ticker ? -1 : a.ticker > b.ticker ? 1 : 0))
  return {
    calls,
    history_calls: historyCalls,
    scorecard: buildCallsScorecard(calls),
    dashboard: newestDashboard(publishedPaths),
    needs_attention: needsAttention,
    updates: buildCallUpdates(updateRows).slice(0, 100),
    authority_commit: authority.commit,
  }
}

type PublishedCallsProjection = Awaited<ReturnType<typeof projectAllCalls>>
let publishedCallsCache: { commit: string; value: PublishedCallsProjection } | null = null
let publishedCallsInflight: { commit: string; value: Promise<PublishedCallsProjection> } | null = null

/** Share one immutable projection across rapid dashboard/watchlist reads; the ref resolver's short TTL
 * bounds staleness while avoiding a synchronous Git subprocess for every browser poll. Passing an
 * authority is the uncached test/diagnostic seam. */
export async function listAllCalls(authority?: PublishedTreeAuthority): Promise<PublishedCallsProjection> {
  if (authority) return projectAllCalls(authority)
  const commit = await publishedGitCommit(REPO_ROOT)
  if (publishedCallsCache?.commit === commit) return publishedCallsCache.value
  if (publishedCallsInflight?.commit === commit) return publishedCallsInflight.value
  const value = (async () => projectAllCalls(await publishedTreeAuthority('analyses', REPO_ROOT, commit)))()
  publishedCallsInflight = { commit, value }
  try {
    const projected = await value
    publishedCallsCache = { commit, value: projected }
    return projected
  } finally {
    if (publishedCallsInflight?.value === value) publishedCallsInflight = null
  }
}
