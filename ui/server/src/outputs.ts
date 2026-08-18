import fs from 'node:fs'
import path from 'node:path'
import { ANALYSES_DIR, REPO_ROOT } from './config'
import { resolveInsideAnalyses, resolveInsidePrompts } from './sandbox'
import { extractVerdict } from './verdict'
import { isSupersededRun, normalizeRecord, resolveIntegrityStatusForRun, resolveDisplayFields } from './ledger-corrections'

// `resolve` defaults to the analyses/ sandbox (research). The chat reader passes resolveInsideRuns so it
// can ground on any swarm's run folder; every other caller keeps the analyses-only default unchanged.
export function readMarkdown(relPath: string, resolve: (p: string) => string = resolveInsideAnalyses): { path: string; markdown: string } {
  const real = resolve(relPath)
  const markdown = fs.readFileSync(real, 'utf8')
  return { path: relPath, markdown }
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
function dueDateFromFreeText(text: string): string | null {
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

interface ReviewFile {
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

function listReviewFiles(runRoot: string): ReviewFile[] {
  let names: string[] = []
  try {
    const dir = resolveInsideAnalyses(`${runRoot}/reviews`)
    names = fs.readdirSync(dir).filter((f) => /_decision_review.*\.json$/.test(f))
  } catch {
    return []
  }
  const out: ReviewFile[] = []
  for (const n of names.sort()) {
    let j: any
    try {
      j = JSON.parse(fs.readFileSync(resolveInsideAnalyses(`${runRoot}/reviews/${n}`), 'utf8'))
    } catch {
      continue
    }
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
      memo_delta_file: typeof md?.memo_delta_file === 'string' && md.memo_delta_file ? md.memo_delta_file : null,
      stage_one_comment: typeof md?.stage_one_comment === 'string' && md.stage_one_comment ? md.stage_one_comment : null,
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

function newestDashboard(): string | null {
  try {
    const dir = resolveInsideAnalyses('tracking')
    const mds = fs.readdirSync(dir).filter((f) => /_calls_tracker\.md$/.test(f)).sort()
    return mds.length ? `tracking/${mds[mds.length - 1]}` : null
  } catch {
    return null
  }
}

// One row per run-folder decision_record — a cross-ticker ledger of every call the engine made,
// each with its since-the-call timeline. Generic: scans all run folders, no module/ticker hardcoded.
export function listAllCalls() {
  let entries: string[] = []
  try {
    entries = fs.readdirSync(ANALYSES_DIR)
  } catch {
    return { calls: [], dashboard: null }
  }
  const today = todayISO()
  const calls: any[] = []
  for (const name of entries) {
    if (!/_\d{4}-\d{2}-\d{2}$/.test(name)) continue // only <TICKER>_<YYYY-MM-DD> run folders
    const runRoot = `analyses/${name}`
    // Skip a corrected-away duplicate (frameworks/DECISION_LEDGER.md §4a): a run superseded by an
    // append-only corrections.json is not a live call — this is what de-double-counts EMAAR here and
    // in the cockpit Calls view, matching scripts/ledger_records.py's standing set.
    if (isSupersededRun(runRoot)) continue
    let d: any
    try {
      d = normalizeRecord(runRoot, readDecision(runRoot)) // apply append-only field errata on read
    } catch {
      continue
    }
    const reviews = listReviewFiles(runRoot)
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
    const integrity = resolveIntegrityStatusForRun(runRoot)
    const disp = resolveDisplayFields(d)
    // checks AS / AW (scripts/eval.py) ported live — see the block above `isISODate`.
    const forecastsDue = forecastsOverdue(d?.forecast_ledger, today)
    const killCriteriaDue = killCriteriaOverdue(d?.kill_criteria, today)
    calls.push({
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
      final_thesis_path: typeof d?.final_thesis_path === 'string' && d.final_thesis_path ? d.final_thesis_path : `${runRoot}/final_thesis.md`,
      latest_thesis_status: latest?.thesis_status ?? null,
      next_checkpoint: pending ? { window: pending.window, due_date: pending.due_date, status: pending.status } : null,
      review_count: reviews.length,
      timeline,
      // AS_forecast_overdue / AW_kill_criteria_overdue, live — same two checks eval.py otherwise only
      // reports when someone runs `/research:eval` by hand.
      needs_attention: { forecasts_overdue: forecastsDue, kill_criteria_overdue: killCriteriaDue },
    })
  }
  // newest call first
  calls.sort((a, b) => (String(a.decision_date) < String(b.decision_date) ? 1 : String(a.decision_date) > String(b.decision_date) ? -1 : 0))
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
  return { calls, dashboard: newestDashboard(), needs_attention: needsAttention }
}
