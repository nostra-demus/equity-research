import fs from 'node:fs'
import path from 'node:path'
import { ANALYSES_DIR, REPO_ROOT } from './config'
import { resolveInsideAnalyses, resolveInsidePrompts } from './sandbox'
import { extractVerdict } from './verdict'

export function readMarkdown(relPath: string): { path: string; markdown: string } {
  const real = resolveInsideAnalyses(relPath)
  const markdown = fs.readFileSync(real, 'utf8')
  return { path: relPath, markdown }
}

// Read a prompt (agent definition / module rules / constitution) from the read-only doctrine surface.
export function readPrompt(relPath: string): { path: string; markdown: string } {
  const real = resolveInsidePrompts(relPath)
  const markdown = fs.readFileSync(real, 'utf8')
  return { path: relPath, markdown }
}

export function resolveRunRoot(opts: { runRoot?: string; ticker?: string; date?: string }): string | null {
  if (opts.runRoot) return opts.runRoot.replace(/^\/+/, '')
  if (opts.ticker && opts.date) return `analyses/${opts.ticker}_${opts.date}`
  if (opts.ticker) {
    try {
      const dirs = fs.readdirSync(ANALYSES_DIR).filter((n) => n.startsWith(opts.ticker + '_')).sort().reverse()
      return dirs.length ? `analyses/${dirs[0]}` : null
    } catch {
      return null
    }
  }
  return null
}

export function readDecision(runRoot: string): any {
  const p = resolveInsideAnalyses(`${runRoot}/decision_record.json`)
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
    let decision: string | null = null
    let confidence: number | null = null
    let decisionDate: string | null = null
    try {
      const dr = readDecision(runRoot)
      decision = dr.decision ?? null
      confidence = typeof dr.confidence_score === 'number' ? dr.confidence_score : null
      decisionDate = dr.decision_date ?? null
    } catch {}
    return {
      runRoot,
      date: d.slice(ticker.length + 1),
      decision,
      confidence,
      decisionDate,
      hasFinalThesis: fs.existsSync(path.join(REPO_ROOT, runRoot, 'final_thesis.md')),
    }
  })
}

export function runManifest(runRoot: string) {
  const abs = resolveInsideAnalyses(runRoot)
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
  return {
    runRoot,
    modules,
    moduleReports,
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
    let d: any
    try {
      d = readDecision(runRoot)
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
    calls.push({
      ticker: d?.ticker ?? name.replace(/_\d{4}-\d{2}-\d{2}$/, ''),
      company: d?.company_name ?? null,
      decision_date: d?.decision_date ?? null,
      decision: d?.decision ?? null,
      basket: d?.basket ?? null,
      confidence: typeof d?.confidence_score === 'number' ? d.confidence_score : null,
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
    })
  }
  // newest call first
  calls.sort((a, b) => (String(a.decision_date) < String(b.decision_date) ? 1 : String(a.decision_date) > String(b.decision_date) ? -1 : 0))
  return { calls, dashboard: newestDashboard() }
}
