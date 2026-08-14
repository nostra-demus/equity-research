import fs from 'node:fs'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { ANALYSES_DIR, REPO_ROOT } from './config'
import { resolveInsideAnalyses, resolveInsidePrompts } from './sandbox'
import { extractVerdict } from './verdict'
import { applyErrata, CORRECTIONS_SCHEMA, resolveDisplayFields, supersededTarget } from './ledger-corrections'
import { diffDecisionRecords } from './run-diff'
import type { AutomaticIntakeEvent } from './auto-intake-status'
import { decisionFingerprintForSharedIntake, listSharedIntakeEvents, type SharedIntakeOwner } from './intake-events'
import { REVIEW_WINDOW_RE, validAuthoritativeReviewMemo, validateExactReviewArtifact } from './review-artifact'
import { publishedTreeAuthority, type PublishedTreeAuthority } from './git-publication'

// `resolve` defaults to the analyses/ sandbox (research). The chat reader passes resolveInsideRuns so it
// can ground on any swarm's run folder; every other caller keeps the analyses-only default unchanged.
export function readMarkdown(relPath: string, resolve: (p: string) => string = resolveInsideAnalyses): { path: string; markdown: string } {
  const real = resolve(relPath)
  const markdown = fs.readFileSync(real, 'utf8')
  return { path: relPath, markdown }
}

// Calls links are a deliberately tiny published surface. Do not widen this to arbitrary run output:
// those files remain live-worktree artifacts owned by readMarkdown(). These are exactly the immutable
// files listAllCalls can advertise to a fresh/static host.
const PUBLISHED_CALLS_ARTIFACT_RE = /^(?:analyses\/[A-Z0-9.\-]{1,40}_\d{4}-\d{2}-\d{2}\/final_thesis\.md|analyses\/[A-Z0-9.\-]{1,40}_\d{4}-\d{2}-\d{2}\/reviews\/\d{4}-\d{2}-\d{2}_(?:30d|90d|180d|365d|24m|36m|ad-hoc|post-mortem)_(?:decision_review(?:_v\d+)?\.json|memo_delta(?:_v\d+)?\.md)|analyses\/[A-Z0-9.\-]{1,40}_\d{4}-\d{2}-\d{2}\/intake\/\d{4}-\d{2}-\d{2}_intake_plan(?:_v\d+)?\.json|analyses\/tracking\/\d{4}-\d{2}-\d{2}_calls_tracker(?:_v\d+)?\.md)$/

export function isPublishedCallsArtifactPath(value: unknown): value is string {
  return typeof value === 'string' && PUBLISHED_CALLS_ARTIFACT_RE.test(value)
}

/** Read an artifact advertised by Calls from the exact published Git snapshot, never mutable disk. */
export function readPublishedCallsMarkdown(relPath: string): { path: string; markdown: string } {
  if (!isPublishedCallsArtifactPath(relPath)) {
    throw Object.assign(new Error('invalid published Calls artifact path'), {
      code: 'INVALID_CALLS_ARTIFACT_PATH', statusCode: 400,
    })
  }
  const authority = publishedTreeAuthority('analyses')
  if (!authority.paths.has(relPath)) {
    throw Object.assign(new Error('published Calls artifact not found'), { code: 'ENOENT', statusCode: 404 })
  }
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

// ---- durable run-root markers (research runs) ----
// Small on-disk flags written into a research run folder so a run's lifecycle survives the engine being
// killed/restarted (the in-memory run registry is wiped on restart — disk is the only surviving truth,
// the same philosophy as the screener's .aborted/.target markers). Used by the resume supervisor:
//   .interrupted — this run was broken by a plan-limit hit / a dropped connection / an external kill
//                  (NOT a clean budget-truncation, which is the honest `incomplete` outcome). Carries
//                  the rate-limit resetsAt so a paused run knows when it may continue, even across a
//                  reboot. Cleared when the run completes or is deliberately cancelled.
//   .aborted     — the user deliberately stopped this run; never auto-resume it.
// Containment: the marker path is rebuilt under ANALYSES_DIR and rejected if it escapes (a request-derived
// runRoot can never steer a write outside analyses/). Every write/read is best-effort and never throws
// into the run lifecycle.
function analysesMarkerPath(runRoot: string, name: string): string | null {
  if (!/^\.[a-z_]+$/.test(name)) return null // fixed marker names only
  const abs = path.isAbsolute(runRoot) ? runRoot : path.join(REPO_ROOT, runRoot)
  const realRoot = path.resolve(abs)
  if (realRoot !== ANALYSES_DIR && !realRoot.startsWith(ANALYSES_DIR + path.sep)) return null
  return path.join(realRoot, name)
}

export function writeRunMarker(runRoot: string | null, name: string, body: Record<string, unknown> = {}): void {
  if (!runRoot) return
  const p = analysesMarkerPath(runRoot, name)
  if (!p) return
  try {
    fs.mkdirSync(path.dirname(p), { recursive: true })
    fs.writeFileSync(p, JSON.stringify({ ...body, at: new Date().toISOString() }) + '\n')
  } catch { /* best-effort marker */ }
}

export function clearRunMarker(runRoot: string | null, name: string): void {
  if (!runRoot) return
  const p = analysesMarkerPath(runRoot, name)
  if (!p) return
  try { fs.rmSync(p, { force: true }) } catch { /* best-effort */ }
}

export function readRunMarker(runRoot: string, name: string): Record<string, any> | null {
  const p = analysesMarkerPath(runRoot, name)
  if (!p) return null
  try { return JSON.parse(fs.readFileSync(p, 'utf8')) } catch { return null }
}

export function hasRunMarker(runRoot: string, name: string): boolean {
  const p = analysesMarkerPath(runRoot, name)
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
function todayISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// strict zero-padded YYYY-MM-DD — only then is lexical comparison valid (mirrors review_due.py isdate()).
export function isISODate(s: unknown): s is string {
  return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s)
}

export interface ReviewFile {
  file: string // repo-relative path under analyses/
  basename: string
  review_window: string
  review_date: string
  review_price: number | null
  absolute_return_pct: number | null
  thesis_status: string | null
  forecasts_confirmed: number
  forecasts_falsified: number
  // §8 memo_delta block (DECISION_LEDGER): the human-readable "what changed since the memo" tier.
  memo_delta_file: string | null
  stage_one_comment: string | null
  memo_delta_summary: string | null
  thesis_delta_verdict: string | null
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
  subdir = '',
  publishedPaths?: ReadonlySet<string>,
): string | null {
  if (typeof value !== 'string' || !value || value.includes('\\') || path.isAbsolute(value)) return null
  const prefix = `${runRoot}/${subdir ? `${subdir.replace(/\/$/, '')}/` : ''}`
  if (!value.startsWith(prefix) || value.split('/').some((part) => !part || part === '.' || part === '..')) return null
  if (publishedPaths) return publishedPaths.has(value) ? value : null
  try { resolveInsideAnalyses(value); return value } catch { return null }
}

function listReviewFiles(runRoot: string, decision: any, authority: PublishedTreeAuthority): ReviewFile[] {
  const publishedPaths = authority.paths
  const prefix = `${runRoot}/reviews/`
  const names = [...publishedPaths]
    .filter((repoPath) => repoPath.startsWith(prefix))
    .map((repoPath) => repoPath.slice(prefix.length))
    .filter((name) => !name.includes('/') && /_decision_review.*\.json$/.test(name))
    .sort()
  const out: ReviewFile[] = []
  for (const n of names) {
    const reviewBytes = authority.readRequired(`${runRoot}/reviews/${n}`)
    let j: any
    try {
      j = JSON.parse(reviewBytes.toString('utf8'))
    } catch {
      continue // malformed published JSON is not a completed review
    }
    const window = typeof j?.review_window === 'string' ? j.review_window : ''
    const valid = validateExactReviewArtifact(j, {
      runRoot,
      ticker: String(decision?.ticker || ''),
      window,
      decisionDate: String(decision?.decision_date || ''),
      jsonBasename: n,
      memoValid: (memoName) => {
        const rel = `${runRoot}/reviews/${memoName}`
        if (!safeRunArtifact(rel, runRoot, 'reviews', publishedPaths)) return false
        return validAuthoritativeReviewMemo(authority.readRequired(rel), {
          ticker: String(decision?.ticker || ''),
          reviewDate: String(j?.review_date || ''),
          window,
        })
      },
    })
    if (!valid || !REVIEW_WINDOW_RE.test(window)) continue
    j = valid.raw
    const fc = countForecastResults(j?.forecast_results)
    const md = j?.memo_delta && typeof j.memo_delta === 'object' ? j.memo_delta : null
    out.push({
      file: `${runRoot}/reviews/${n}`,
      basename: n,
      review_window: typeof j?.review_window === 'string' ? j.review_window : '',
      review_date: typeof j?.review_date === 'string' ? j.review_date : '',
      review_price: typeof j?.review_price === 'number' ? j.review_price : null,
      absolute_return_pct: typeof j?.absolute_return_pct === 'number' ? j.absolute_return_pct : null,
      thesis_status: typeof j?.thesis_status === 'string' && j.thesis_status ? j.thesis_status : null,
      forecasts_confirmed: fc.confirmed,
      forecasts_falsified: fc.falsified,
      memo_delta_file: safeRunArtifact(md?.memo_delta_file, runRoot, 'reviews', publishedPaths),
      stage_one_comment: typeof md?.stage_one_comment === 'string' && md.stage_one_comment ? md.stage_one_comment : null,
      memo_delta_summary: typeof md?.summary === 'string' && md.summary.trim() ? md.summary.trim() : null,
      thesis_delta_verdict: typeof md?.thesis_delta_verdict === 'string' && md.thesis_delta_verdict.trim()
        ? md.thesis_delta_verdict.trim().toLowerCase()
        : null,
    })
  }
  return out
}

// deterministic winner among reviews: latest review_date, tie-break lexically-newest basename.
function pickWinner(files: ReviewFile[]): ReviewFile | null {
  if (!files.length) return null
  return [...files].sort((a, b) =>
    a.review_date < b.review_date ? 1 : a.review_date > b.review_date ? -1 : a.basename < b.basename ? 1 : -1,
  )[0]
}

interface TimelineEntry {
  window: string
  due_date: string | null
  status: 'done' | 'due' | 'overdue' | 'upcoming'
  review_date?: string
  review_price?: number | null
  absolute_return_pct?: number | null
  thesis_status?: string | null
  forecasts_confirmed?: number
  forecasts_falsified?: number
  review_file?: string
  review_count?: number
  memo_delta_file?: string // present only when the review filed a §8 memo delta
  stage_one_comment?: string
  memo_delta_summary?: string
  thesis_delta_verdict?: string
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
        thesis_status: win.thesis_status,
        forecasts_confirmed: win.forecasts_confirmed,
        forecasts_falsified: win.forecasts_falsified,
        review_file: win.file,
        review_count: matches.length,
        ...(win.memo_delta_file ? { memo_delta_file: win.memo_delta_file } : {}),
        ...(win.stage_one_comment ? { stage_one_comment: win.stage_one_comment } : {}),
        ...(win.memo_delta_summary ? { memo_delta_summary: win.memo_delta_summary } : {}),
        ...(win.thesis_delta_verdict ? { thesis_delta_verdict: win.thesis_delta_verdict } : {}),
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
      thesis_status: r.thesis_status,
      forecasts_confirmed: r.forecasts_confirmed,
      forecasts_falsified: r.forecasts_falsified,
      review_file: r.file,
      ...(r.memo_delta_file ? { memo_delta_file: r.memo_delta_file } : {}),
      ...(r.stage_one_comment ? { stage_one_comment: r.stage_one_comment } : {}),
      ...(r.memo_delta_summary ? { memo_delta_summary: r.memo_delta_summary } : {}),
      ...(r.thesis_delta_verdict ? { thesis_delta_verdict: r.thesis_delta_verdict } : {}),
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

const callsAuthorityUnavailable = (cause?: unknown): Error & { code: string; cause?: unknown } => Object.assign(
  new Error('shared Calls history cannot be read safely'),
  { code: 'CALLS_AUTHORITY_UNAVAILABLE', ...(cause === undefined ? {} : { cause }) },
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

/** Integrity is part of the displayed call, so it must use the same published snapshot as the decision.
 * Reading the local thesis/report here made a dirty doer and a fresh/static host disagree even after call
 * enumeration moved to Git. */
function publishedIntegrityStatus(runRoot: string, authority: PublishedTreeAuthority) {
  const publishedPaths = authority.paths
  const thesis = authority.readRequired(`${runRoot}/final_thesis.md`)
  const banner = thesis.toString('utf8').slice(0, 2000).includes(PROVISIONAL_MARK)
  const prefix = `${runRoot}/`
  const reports = [...publishedPaths]
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
        score = typeof raw.integrity_score === 'number' ? raw.integrity_score : null
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
  kind: 'call' | 'review' | 'data_check'
  headline: string
  detail: string | null
  tone: CallUpdateTone
  run_root: string
  source_path: string | null
}

export interface CallUpdateInput {
  call: any
  record: any
  reviews: ReviewFile[]
}

function updateId(...parts: Array<string | null | undefined>): string {
  return createHash('sha256').update(parts.map((p) => p || '').join('\u0000')).digest('hex').slice(0, 24)
}

function reviewHeadline(ticker: string, verdict: string | null): { headline: string; tone: CallUpdateTone } {
  switch (verdict) {
    case 'strengthened':
      return { headline: `${ticker}: the call looks stronger`, tone: 'better' }
    case 'weakened':
      return { headline: `${ticker}: the call looks weaker`, tone: 'worse' }
    case 'broken':
      return { headline: `${ticker}: the call no longer holds`, tone: 'worse' }
    case 'confirmed':
      return { headline: `${ticker}: the call is holding up`, tone: 'better' }
    case 'too_early':
      return { headline: `${ticker}: no clear change yet`, tone: 'same' }
    default:
      return { headline: `${ticker}: automatic check finished`, tone: 'info' }
  }
}

function shortReviewDetail(review: ReviewFile): string | null {
  const raw = (review.memo_delta_summary || review.stage_one_comment || '').replace(/\s+/g, ' ').trim()
  const firstSentence = raw.match(/^.*?[.!?](?:\s|$)/)?.[0]?.trim() || raw
  const why = firstSentence.length > 240 ? `${firstSentence.slice(0, 237).trimEnd()}…` : firstSentence
  const outcomes: string[] = []
  if (typeof review.absolute_return_pct === 'number') {
    outcomes.push(`Price since the call: ${review.absolute_return_pct >= 0 ? '+' : ''}${review.absolute_return_pct.toFixed(1)}%`)
  }
  if (review.forecasts_confirmed || review.forecasts_falsified) {
    outcomes.push(`${review.forecasts_confirmed} forecast${review.forecasts_confirmed === 1 ? '' : 's'} right · ${review.forecasts_falsified} wrong`)
  }
  return [why || null, outcomes.length ? `${outcomes.join(' · ')}.` : null].filter(Boolean).join(' ') || null
}

function callDiffTone(diff: ReturnType<typeof diffDecisionRecords>): CallUpdateTone {
  // The decision is the action the user takes. It outranks a supporting metric that happened to move the
  // other way (for example Watchlist -> Avoid while expected return rose). A notification must never pair
  // a downgrade headline with a green dot, or an upgrade with a red one.
  const decision = diff.anchors.find((a) => a.field === 'decision' && a.moved)
  if (decision) {
    const rank = (value: unknown): number | null => {
      const key = String(value || '').trim().toLowerCase()
      const ranks: Record<string, number> = {
        avoid: 1,
        watchlist: 2,
        'starter position only': 3,
        buy: 4,
        'strong buy': 5,
      }
      return Object.prototype.hasOwnProperty.call(ranks, key) ? ranks[key] : null
    }
    const before = rank(decision.prev)
    const after = rank(decision.cur)
    if (before !== null && after !== null && before !== after) return after > before ? 'better' : 'worse'
    // Short / hedge / insufficient-data calls are intentionally not forced onto the long-rating ladder.
    return 'info'
  }
  // When the call held, run-diff's headline names its first changed headline number. Color that same fact;
  // a lower-priority metric moving the other way must not contradict the sentence the user is reading.
  const headlineMove = diff.anchors.find((anchor) => anchor.field !== 'decision' && anchor.moved)
  if (headlineMove?.tone === 'worse') return 'worse'
  if (headlineMove?.tone === 'better') return 'better'
  return diff.verdict === 'identical' || diff.verdict === 'call_held' ? 'same' : 'info'
}

/**
 * Build one plain-English notification stream from the same corrected decision/review rows shown in Calls.
 * This is intentionally pure and exported: static projection and tests can reuse it instead of inventing a
 * second interpretation of what changed.
 */
export function buildCallUpdates(rows: CallUpdateInput[], intakeEvents: AutomaticIntakeEvent[] = []): CallUpdate[] {
  const updates: CallUpdate[] = []
  const byTicker = new Map<string, CallUpdateInput[]>()
  for (const row of rows) {
    const ticker = String(row.call?.ticker || '').trim()
    if (!ticker) continue
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
      if (!previous) {
        updates.push({
          id: updateId('call', call.run_root),
          ticker,
          company: call.company ?? null,
          at: call.decision_date ?? null,
          kind: 'call',
          headline: `${ticker}: ${call.decision || 'new'} call recorded`,
          detail: typeof call.expected_return_pct === 'number'
            ? `Expected return at the time: ${call.expected_return_pct > 0 ? '+' : ''}${call.expected_return_pct.toFixed(1)}%.`
            : null,
          tone: 'info',
          run_root: call.run_root,
          source_path: call.final_thesis_path || null,
        })
      } else {
        const diff = diffDecisionRecords(previous.record, row.record)
        const sentence = diff.headline ? diff.headline.charAt(0).toLowerCase() + diff.headline.slice(1) : 'the call was updated.'
        updates.push({
          id: updateId('call-change', previous.call.run_root, call.run_root),
          ticker,
          company: call.company ?? null,
          at: call.decision_date ?? null,
          kind: 'call',
          headline: `${ticker}: ${sentence}`,
          detail: diff.subline || diff.tailSummary || null,
          tone: callDiffTone(diff),
          run_root: call.run_root,
          source_path: call.final_thesis_path || null,
        })
      }

      for (const review of row.reviews) {
        const display = reviewHeadline(ticker, review.thesis_delta_verdict || review.thesis_status)
        updates.push({
          id: updateId('review', review.file),
          ticker,
          company: call.company ?? null,
          at: review.review_date || null,
          kind: 'review',
          headline: display.headline,
          detail: shortReviewDetail(review),
          tone: display.tone,
          run_root: call.run_root,
          source_path: review.memo_delta_file || review.file,
        })
      }
      previous = row
    }
  }
  const callsByRun = new Map(rows.map((row) => [String(row.call?.run_root || ''), row.call]))
  const seenIntakeEvents = new Set<string>()
  for (const event of intakeEvents) {
    if (seenIntakeEvents.has(event.id)) continue
    seenIntakeEvents.add(event.id)
    const call = callsByRun.get(event.run_root)
    // Only surface an event beside the exact live, unsuperseded call returned in this same projection.
    // Orphaned/corrected-away event history remains durable but cannot point the UI at a removed call.
    if (!call || call.ticker !== event.ticker) continue
    updates.push({
      id: event.id,
      ticker: event.ticker,
      company: call.company ?? null,
      at: event.at,
      kind: 'data_check',
      headline: event.headline,
      detail: event.detail,
      tone: event.verdict === 'note_only' ? 'same' : 'info',
      run_root: event.run_root,
      source_path: event.plan_path,
    })
  }
  return updates.sort((a, b) => {
    const ad = a.at || ''
    const bd = b.at || ''
    return ad < bd ? 1 : ad > bd ? -1 : a.id.localeCompare(b.id)
  })
}

// One row per run-folder decision_record — a cross-ticker ledger of every call the engine made,
// each with its since-the-call timeline. Generic: scans all run folders, no module/ticker hardcoded.
export function listAllCalls() {
  // Enumeration and content come from one immutable shared tree. A local directory is neither required
  // (fresh/static hosts may not materialize old runs) nor authoritative (a doer may have dirty/unpushed
  // additions). The authority pins one commit before it enumerates or reads, so a concurrent ref update
  // cannot mix two versions. An unavailable ref/tree/blob never collapses into an empty Calls ledger or a
  // wave of falsely-due reviews.
  const authority = publishedTreeAuthority('analyses')
  const publishedPaths = authority.paths
  const runRoots = [...publishedPaths]
    .map((repoPath) => /^(analyses\/[A-Z0-9.\-]{1,40}_\d{4}-\d{2}-\d{2})\/decision_record\.json$/.exec(repoPath)?.[1] || null)
    .filter((runRoot): runRoot is string => !!runRoot && publishedPaths.has(`${runRoot}/final_thesis.md`))
    .sort()
  const today = todayISO()
  const calls: any[] = []
  const updateRows: CallUpdateInput[] = []
  const sharedIntakeOwners: SharedIntakeOwner[] = []
  for (const runRoot of runRoots) {
    const name = runRoot.slice('analyses/'.length)
    // Skip a corrected-away duplicate (frameworks/DECISION_LEDGER.md §4a): a run superseded by an
    // append-only corrections.json is not a live call. Corrections and decision bytes come from this same
    // pinned commit; a listed-but-unreadable/malformed correction fails closed instead of resurrecting it.
    const corrections = publishedCorrections(runRoot, authority)
    if (supersededTarget(corrections)) continue
    const d = applyErrata(requiredPublishedJsonObject(authority, `${runRoot}/decision_record.json`), corrections)
    const reviews = listReviewFiles(runRoot, d, authority)
    const timeline = buildTimeline(d?.review_schedule || {}, reviews, today)
    const latest = pickWinner(reviews) // latest review across ALL windows incl. ad-hoc
    const entry = typeof d?.entry_price === 'number' ? d.entry_price : null
    const exp = typeof d?.expected_return_pct === 'number' ? d.expected_return_pct : null
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
    const call = {
      ticker: d?.ticker ?? name.replace(/_\d{4}-\d{2}-\d{2}$/, ''),
      company: d?.company_name ?? null,
      decision_date: d?.decision_date ?? null,
      decision: disp.decision,
      basket: disp.basket,
      decision_is_post_mortem_capped: disp.decisionIsPostMortemCapped,
      confidence: disp.confidence,
      confidence_is_post_review: disp.confidenceIsPostReview,
      integrity_status: integrity.status,
      integrity_verdict: integrity.verdict,
      integrity_banner: integrity.banner,
      time_horizon: d?.time_horizon ?? null,
      entry_price: entry,
      currency: d?.currency ?? null,
      expected_return_pct: exp,
      implied_target: entry != null && exp != null ? Math.round(entry * (1 + exp / 100) * 100) / 100 : null,
      downside_risk_pct: typeof d?.downside_risk_pct === 'number' ? d.downside_risk_pct : null,
      kill_criteria_count: Array.isArray(d?.kill_criteria) ? d.kill_criteria.length : 0,
      forecasts: fc,
      run_root: runRoot,
      final_thesis_path: safeRunArtifact(d?.final_thesis_path, runRoot, '', publishedPaths) || `${runRoot}/final_thesis.md`,
      latest_thesis_status: latest?.thesis_status ?? null,
      latest_review_summary: latest?.memo_delta_summary ?? null,
      latest_review_verdict: latest?.thesis_delta_verdict ?? null,
      latest_review_date: latest?.review_date || null,
      next_checkpoint: pending ? { window: pending.window, due_date: pending.due_date, status: pending.status } : null,
      review_count: reviews.length,
      timeline,
    }
    calls.push(call)
    updateRows.push({ call, record: d, reviews })
    const decisionFingerprint = decisionFingerprintForSharedIntake(runRoot, d)
    if (decisionFingerprint && typeof call.ticker === 'string') {
      sharedIntakeOwners.push({ ticker: call.ticker, runRoot, decisionFingerprint })
    }
  }
  // newest call first
  calls.sort((a, b) => (String(a.decision_date) < String(b.decision_date) ? 1 : String(a.decision_date) > String(b.decision_date) ? -1 : 0))
  // Notification history must come from published Git authority so the doer, static build and failover
  // all show the same rows. Process-local outcomes are runtime recovery receipts only; merging them here
  // made transient scoped plans and pre-correction fingerprints appear on one machine forever.
  const intakeEvents = listSharedIntakeEvents(sharedIntakeOwners, authority)
  return { calls, dashboard: newestDashboard(publishedPaths), updates: buildCallUpdates(updateRows, intakeEvents).slice(0, 100) }
}
