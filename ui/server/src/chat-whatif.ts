// Server-side what-if modeling for the cockpit "Ask" chat.
//
// A quantified modeling question — "how does margin change if the aluminium price rises $45/mt?", "what's
// EBITDA if aluminium is at $3,000?", "what price gets the margin to 16%?" — is answered DETERMINISTICALLY,
// with no arithmetic done by the language model. The parser is a strict CLASSIFIER; all the math lives in
// scripts/sensitivity_math.py (the same engine the guard checks).
//
//   detectWhatIf   — a cheap, strict gate: is this a quantified what-if at all?
//   classifyWhatIf — pure: map the question to ONE of
//                      forward  ("aluminium +$45/mt")        → delta on the recorded coefficient
//                      level    ("aluminium at $3,000")      → target_level (engine does level − base)
//                      reverse  ("what price gets margin 16%")→ target_margin/target (engine inverts the coeff)
//                      multi    ("aluminium +$45 and FX −0.5")→ one plan per variable (computed separately)
//                      unsupported ("if freight …")          → an honest refusal listing what IS modelable
//                    or null (not modelable → the turn answers normally).
//   computeScenario— shell out to sensitivity_math.py --scenario (JSON in / JSON out).
//
// The result streams as a chat-computed card AND is injected as an authoritative COMPUTED SCENARIO block, so
// the model only narrates. The whole compute path is regex + Python — no model in it. Conservative by design:
// anything that isn't a clean, single-variable, sized ask is REFUSED, never guessed (a wrong-but-authoritative
// number would be worse than a refusal). CLAUDE.md §15/§20/§26.
import { execa } from 'execa'
import fs from 'node:fs'
import path from 'node:path'
import { REPO_ROOT } from './config'
import { resolveInsideRuns } from './sandbox'

const SENSITIVITY_ENGINE = path.join(REPO_ROOT, 'scripts', 'sensitivity_math.py')
const SIDECAR_REL = 'earnings/sensitivity_summary.json'

// ---- sidecar (the recorded coefficients) ------------------------------------------------------------
export interface SensitivityRow {
  variable: string
  label?: string | null
  unit?: string | null
  base_value?: number | null
  coefficient?: number | null
  confidence?: string | null
  basis?: string | null
  valid_range?: { low?: number; high?: number } | null
  non_linearity?: string | null
  source?: string | null
}
export interface SensitivitySidecar {
  base_metric?: string
  base_value?: number
  base_period?: string | null
  revenue_base?: number | null
  sensitivities?: SensitivityRow[]
  [k: string]: unknown
}

export function loadSidecar(runRoot: string): { path: string; sidecar: SensitivitySidecar } | null {
  const rel = `${runRoot}/${SIDECAR_REL}`
  let abs: string
  try { abs = resolveInsideRuns(rel) } catch { return null }
  let raw: string
  try { raw = fs.readFileSync(abs, 'utf8') } catch { return null }
  try {
    const sidecar = JSON.parse(raw) as SensitivitySidecar
    if (!sidecar || !Array.isArray(sidecar.sensitivities) || sidecar.sensitivities.length === 0) return null
    return { path: rel, sidecar }
  } catch { return null }
}

function recordedList(sidecar: SensitivitySidecar) {
  return (sidecar.sensitivities || []).filter((r) => r?.variable).map((r) => ({ variable: r.variable, label: r.label, unit: r.unit }))
}

// ---- 1. detection ------------------------------------------------------------------------------------
const COND_CUE = /\b(what\s+if|if|were\s+to|assuming|suppose|imagine|scenario|hypothetical)\b/i
const CHANGE_CUE = /\b(rise|rises|rising|rose|risen|fall|falls|falling|fell|fallen|increase|increases|increasing|decrease|decreases|decreasing|drop|drops|dropped|jump|jumps|gain|gains|climb|climbs|decline|declines|move|moves|moved|weaken|weakens|strengthen|strengthens|higher|lower|up|down|hits?|reach(?:es)?|at)\b/i
const SOLVE_CUE = /\b(what|which|how\s+much|how\s+high|how\s+far|how\s+low|how\s+big)\b/i
const SIGNED_NUM = /[+\-−]\s*\d/
const ANY_NUM = /\d/

export function detectWhatIf(question: string): boolean {
  const q = question || ''
  if (!ANY_NUM.test(q)) return false
  return COND_CUE.test(q) || CHANGE_CUE.test(q) || SIGNED_NUM.test(q) || SOLVE_CUE.test(q)
}

// ---- 2. variable matching (generic; stem-aware so plural/singular match) -----------------------------
const STOP = new Set(['price', 'rate', 'index', 'exchange', 'external', 'the', 'and', 'of', 'to', 'per'])
const CURRENCY_ALIAS: Record<string, string[]> = {
  usd: ['dollar', 'dollars'], nok: ['krone', 'kroner'], eur: ['euro', 'euros'],
  gbp: ['pound', 'pounds', 'sterling'], inr: ['rupee', 'rupees'], jpy: ['yen'], cny: ['yuan', 'renminbi'],
}
const stem = (w: string): string => (w.length > 4 && w.endsWith('s') ? w.slice(0, -1) : w)

export function variableKeywords(row: SensitivityRow): string[] {
  const src = `${row.label || ''} ${row.variable || ''}`.toLowerCase()
  const toks = src.split(/[^a-z0-9]+/).filter((t) => t.length >= 3 && !STOP.has(t))
  const out = new Set<string>(toks)
  for (const t of toks) {
    if (t === 'aluminium') out.add('aluminum')
    if (t === 'aluminum') out.add('aluminium')
    for (const a of CURRENCY_ALIAS[t] || []) out.add(a)
  }
  return [...out]
}

function questionStems(q: string): Set<string> {
  return new Set((q || '').toLowerCase().split(/[^a-z0-9]+/).filter(Boolean).map(stem))
}

/** Score how strongly the question names one recorded variable (0 = not mentioned). Full label present is
 *  strongest; otherwise stem-matched keywords. */
function scoreRow(row: SensitivityRow, qlc: string, stems: Set<string>): number {
  const label = (row.label || '').toLowerCase().trim()
  let score = 0
  if (label && label.length >= 4 && qlc.includes(label)) score += 100 + label.length
  for (const kw of variableKeywords(row)) if (stems.has(stem(kw))) score += 10 + kw.length
  return score
}

export function matchVariable(question: string, sidecar: SensitivitySidecar): SensitivityRow | null {
  const qlc = ` ${(question || '').toLowerCase()} `
  const stems = questionStems(question)
  let best: { row: SensitivityRow; score: number } | null = null
  for (const row of sidecar.sensitivities || []) {
    if (!row?.variable) continue
    const score = scoreRow(row, qlc, stems)
    if (score > 0 && (!best || score > best.score)) best = { row, score }
  }
  return best ? best.row : null
}

/** All recorded variables the question names (distinct, most-specific first) — used to detect a joint ask. */
export function matchAllVariables(question: string, sidecar: SensitivitySidecar): SensitivityRow[] {
  const qlc = ` ${(question || '').toLowerCase()} `
  const stems = questionStems(question)
  return (sidecar.sensitivities || [])
    .filter((r) => r?.variable)
    .map((r) => ({ r, s: scoreRow(r, qlc, stems) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .map((x) => x.r)
}

// ---- 3. move / level / reverse extraction (pure regex) -----------------------------------------------
const NEG_CUE = /\b(fall|falls|falling|fell|fallen|drop|drops|dropped|decrease|decreases|decreasing|decline|declines|lower|down|weaken|weakens|cut|cuts|loses|lose|minus)\b/i
const MAG = /(?:by\s+)?([+\-−]?)\s*(?:usd|us\$|\$|nok|kr|₹|€|£|rs\.?)?\s*(\d+(?:[.,]\d+)?)\s*(%|percent|pct|pp|bps?|usd\/mt|\/mt|mt|kmt|usd|nok)?/i
// a LEVEL marker ("at / hits / reaches / to") immediately before a number → an absolute level, not a move
const LEVEL_AT = /\b(?:at|hits?|reach(?:es|ing)?|to)\s+(?:USD|US\$|\$|NOK|kr|₹|€|£)?\s*([\d,]+(?:\.\d+)?)\s*(?:usd\/mt|\/mt|mt|kmt|usd|nok)?\b/i

export type DeltaParse = { delta: number; percent: boolean } | { error: string } | null

/** A signed move in the variable's own unit. A "%" is sized off the row's recorded base_value. Returns null
 *  when no magnitude is present, or the phrasing is an ambiguous absolute level ("from X to Y"). */
export function parseDelta(question: string, row: SensitivityRow): DeltaParse {
  const q = question || ''
  if (/\bfrom\s+[+\-−]?[\d.,]+\s+to\s+[+\-−]?[\d.,]+/i.test(q)) return null // absolute range, not a delta
  const m = MAG.exec(q)
  if (!m) return null
  const num = parseFloat(m[2].replace(',', '.'))
  if (!Number.isFinite(num)) return null
  const unit = (m[3] || '').toLowerCase()
  const percent = unit === '%' || unit === 'percent' || unit === 'pct'
  let sign = 1
  if (m[1] === '-' || m[1] === '−') sign = -1
  else if (m[1] === '+') sign = 1
  else if (NEG_CUE.test(q)) sign = -1
  if (percent) {
    const base = typeof row.base_value === 'number' ? row.base_value : null
    if (base == null) return { error: `a percentage move needs a base value for ${row.variable}, which isn't recorded` }
    return { delta: sign * base * (num / 100), percent: true }
  }
  return { delta: sign * num, percent: false }
}

/** An absolute target LEVEL for the variable ("at $3,000", "hits 3500", "rises to 3484"), or null. Never a %. */
export function parseLevel(question: string): number | null {
  const q = question || ''
  if (/\d\s*%/.test(q.replace(/\s/g, ' '))) { /* a % nearby is a move/target, not a level */ }
  const m = LEVEL_AT.exec(q)
  if (!m) return null
  const n = parseFloat(m[1].replace(/,/g, ''))
  return Number.isFinite(n) ? n : null
}

export type ReverseTarget = { targetMargin: number } | { target: number } | null

/** A target on the OUTPUT for a reverse solve: a margin ("margin to 16%", "16% margin") or an absolute base-
 *  metric value ("EBITDA to 33000"). Null when there is no output target. */
export function parseReverseTarget(question: string, sidecar: SensitivitySidecar): ReverseTarget {
  const q = question || ''
  const mm = /margin[^%\d]{0,16}?(\d+(?:\.\d+)?)\s*%/i.exec(q) || /(\d+(?:\.\d+)?)\s*%[^%]{0,16}?margin/i.exec(q)
  if (mm) return { targetMargin: parseFloat(mm[1]) }
  // absolute base-metric target, e.g. "EBITDA to 33000" (plain number in the base metric's own scale)
  const metricWord = /ebitda|ebit|profit|earnings|eps|fcf/i
  if (metricWord.test(q)) {
    const t = /\b(?:to|of|reach(?:es)?|hits?|equals?)\s+(?:USD|US\$|\$|NOK|kr|₹|€|£)?\s*([\d,]+(?:\.\d+)?)\b/i.exec(q)
    if (t) { const n = parseFloat(t[1].replace(/,/g, '')); if (Number.isFinite(n)) return { target: n } }
  }
  return null
}

// ---- 4. classification -------------------------------------------------------------------------------
export type Plan =
  | { kind: 'forward'; variable: string; delta: number; row: SensitivityRow }
  | { kind: 'level'; variable: string; targetLevel: number; row: SensitivityRow }
  | { kind: 'reverse'; variable: string; targetMargin?: number; target?: number; row: SensitivityRow }
export type WhatIfPlan =
  | Plan
  | { kind: 'multi'; plans: Plan[] }
  | { kind: 'unsupported'; recorded: { variable: string; label?: string | null; unit?: string | null }[]; reason: 'unrecorded' | 'multi' | 'no_revenue_base' | 'ambiguous' }
  | null

/** Classify ONE single-variable clause against a known row: reverse → level → forward, else null. */
function classifyClause(question: string, sidecar: SensitivitySidecar, row: SensitivityRow): Plan | { unsupportedReason: 'no_revenue_base' } | null {
  const rev = parseReverseTarget(question, sidecar)
  if (rev && SOLVE_CUE.test(question)) {
    if ('targetMargin' in rev && !(typeof sidecar.revenue_base === 'number' && sidecar.revenue_base > 0)) return { unsupportedReason: 'no_revenue_base' }
    return { kind: 'reverse', variable: row.variable, ...rev, row }
  }
  const level = parseLevel(question)
  if (level != null) return { kind: 'level', variable: row.variable, targetLevel: level, row }
  const d = parseDelta(question, row)
  if (d == null || 'error' in d) return null
  return { kind: 'forward', variable: row.variable, delta: d.delta, row }
}

/** Split a joint question into per-variable clauses and plan each. Returns one plan per DISTINCT variable. */
function splitAndPlan(question: string, sidecar: SensitivitySidecar): Plan[] {
  const clauses = (question || '').split(/\s+and\s+|\s+plus\s+|\s*[,;&]\s*/i).map((c) => c.trim()).filter(Boolean)
  const seen = new Set<string>()
  const plans: Plan[] = []
  for (const clause of clauses) {
    const row = matchVariable(clause, sidecar)
    if (!row || seen.has(row.variable)) continue
    const p = classifyClause(clause, sidecar, row)
    if (p && 'kind' in p) { plans.push(p); seen.add(row.variable) }
  }
  return plans
}

export function classifyWhatIf(question: string, sidecar: SensitivitySidecar): WhatIfPlan {
  if (!detectWhatIf(question)) return null
  const all = matchAllVariables(question, sidecar)

  // joint ask: 2+ distinct variables named → compute each leg separately (they don't simply add)
  if (all.length >= 2) {
    const plans = splitAndPlan(question, sidecar)
    if (plans.length >= 2) return { kind: 'multi', plans }
    // named 2+ variables but couldn't cleanly split them into sized moves → refuse, don't guess
    return { kind: 'unsupported', recorded: recordedList(sidecar), reason: 'ambiguous' }
  }

  const row = all[0] || matchVariable(question, sidecar)
  if (!row) {
    // a what-if that names nothing recorded — refuse only when there's a real magnitude or a solve ask,
    // so a vague question doesn't trigger the refusal card
    if (MAG.test(question) || SOLVE_CUE.test(question)) return { kind: 'unsupported', recorded: recordedList(sidecar), reason: 'unrecorded' }
    return null
  }
  const p = classifyClause(question, sidecar, row)
  if (p == null) return null
  if ('unsupportedReason' in p) return { kind: 'unsupported', recorded: recordedList(sidecar), reason: p.unsupportedReason }
  return p
}

// ---- 5. compute: shell out to the deterministic engine -----------------------------------------------
export interface ComputedScenario {
  variable: string
  label?: string | null
  unit?: string | null
  delta: number
  coefficient: number
  impactMetric?: string | null
  impact: number
  baseValue?: number | null
  newValue?: number | null
  baseMarginPct?: number | null
  newMarginPct?: number | null
  marginChangeBps?: number | null
  withinDisclosedRange?: boolean | null
  rangeNote?: string | null
  confidence?: string | null
  basis?: string | null
  source?: string | null
  nonLinearity?: string | null
  // mode + resolved inputs (from resolve_scenario): 'delta' | 'level' | 'reverse'
  mode?: 'delta' | 'level' | 'reverse' | null
  resolvedDelta?: number | null
  targetLevel?: number | null
  variableBase?: number | null
  solvedVariableLevel?: number | null
  targetValue?: number | null
  targetMarginPct?: number | null
  neededImpact?: number | null
  // set on the first card of a multi-variable answer
  note?: string | null
}

function shapeScenario(r: any): ComputedScenario | null {
  if (!r || typeof r !== 'object' || 'error' in r || typeof r.impact !== 'number') return null
  return {
    variable: r.variable, label: r.label ?? null, unit: r.unit ?? null,
    delta: r.delta, coefficient: r.coefficient,
    impactMetric: r.impact_metric ?? null, impact: r.impact,
    baseValue: r.base_value ?? null, newValue: r.new_value ?? null,
    baseMarginPct: r.base_margin_pct ?? null, newMarginPct: r.new_margin_pct ?? null, marginChangeBps: r.margin_change_bps ?? null,
    withinDisclosedRange: r.within_disclosed_range ?? null, rangeNote: r.range_note ?? null,
    confidence: r.confidence ?? null, basis: r.basis ?? null, source: r.source ?? null, nonLinearity: r.non_linearity ?? null,
    mode: r.mode ?? null, resolvedDelta: r.resolved_delta ?? null,
    targetLevel: r.target_level ?? null, variableBase: r.variable_base ?? null,
    solvedVariableLevel: r.solved_variable_level ?? null, targetValue: r.target_value ?? null,
    targetMarginPct: r.target_margin_pct ?? null, neededImpact: r.needed_impact ?? null,
  }
}

// the request intent passed to the engine (exactly one of these is set)
export type ScenarioRequest = { delta: number } | { targetLevel: number } | { target: number } | { targetMargin: number }

/** Run the deterministic engine for one intent. Returns null on any failure — a failed call degrades to a
 *  normal answer, never a fabricated number or a 500. */
export async function computeScenario(sidecar: SensitivitySidecar, variable: string, req: ScenarioRequest): Promise<ComputedScenario | null> {
  const payload: any = { sidecar, variable }
  if ('delta' in req) payload.delta = req.delta
  else if ('targetLevel' in req) payload.target_level = req.targetLevel
  else if ('target' in req) payload.target = req.target
  else if ('targetMargin' in req) payload.target_margin = req.targetMargin
  let out
  try {
    out = await execa('python3', [SENSITIVITY_ENGINE, '--scenario'], { cwd: REPO_ROOT, input: JSON.stringify(payload), timeout: 15_000, reject: false })
  } catch { return null }
  if (!out || out.exitCode !== 0 || !out.stdout) return null
  try { return shapeScenario(JSON.parse(out.stdout)) } catch { return null }
}

/** Compute one Plan (forward/level/reverse) → a ComputedScenario, or null. */
export async function computePlan(sidecar: SensitivitySidecar, plan: Plan): Promise<ComputedScenario | null> {
  if (plan.kind === 'forward') return computeScenario(sidecar, plan.variable, { delta: plan.delta })
  if (plan.kind === 'level') return computeScenario(sidecar, plan.variable, { targetLevel: plan.targetLevel })
  if (plan.targetMargin != null) return computeScenario(sidecar, plan.variable, { targetMargin: plan.targetMargin })
  if (plan.target != null) return computeScenario(sidecar, plan.variable, { target: plan.target })
  return null
}

// ---- 6. the payload streamed to the panel + the prompt block -----------------------------------------
export type ComputedPayload =
  | { kind: 'scenario'; asked: string; scenario: ComputedScenario }
  | { kind: 'unsupported'; asked: string; recorded: { variable: string; label?: string | null; unit?: string | null }[]; reason: string }

const fmt = (n: number | null | undefined, d = 0) => (typeof n === 'number' ? n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }) : '—')

/** The authoritative context block injected into the closed-book prompt. The model narrates THIS; the
 *  numbers are the engine's, verbatim. */
export function computedContextBlock(payload: ComputedPayload): string {
  if (payload.kind === 'unsupported') {
    const list = payload.recorded.map((r) => `${r.label || r.variable}${r.unit ? ` (${r.unit})` : ''}`).join(', ')
    const why = payload.reason === 'multi' || payload.reason === 'ambiguous'
      ? 'The engine models ONE variable at a time; the user asked about more than one at once.'
      : payload.reason === 'no_revenue_base'
        ? 'The engine cannot solve for a margin target here — this run recorded no revenue base.'
        : 'The variable the user asked about is not one the sensitivity orb recorded for this company.'
    return [
      `COMPUTED SCENARIO — the engine could NOT model this what-if. ${why}`,
      `Tell the user plainly, and that the engine CAN model: ${list || '(none recorded)'}.`,
      'Do not estimate the unmodelled value yourself — offer the recorded variables (one at a time) instead.',
    ].join('\n')
  }
  const s = payload.scenario
  const lines: string[] = []
  lines.push('COMPUTED SCENARIO (authoritative — produced by the engine\'s deterministic calculator scripts/sensitivity_math.py, NOT by you):')
  if (s.note) lines.push(`(${s.note})`)
  if (s.mode === 'reverse') {
    const tgt = s.targetMarginPct != null ? `operating margin ${s.targetMarginPct}%` : `${s.impactMetric || 'the base metric'} ${fmt(s.targetValue)}`
    lines.push(`- The user asked what move REACHES a target (${tgt}). The engine inverted the recorded coefficient:`)
    lines.push(`- Required move: ${s.label || s.variable} ${s.resolvedDelta != null && s.resolvedDelta >= 0 ? '+' : ''}${s.resolvedDelta}${s.unit ? ` ${s.unit}` : ''}${s.solvedVariableLevel != null ? ` → a level of ${fmt(s.solvedVariableLevel)}${s.unit ? ` ${s.unit}` : ''}` : ''}`)
    lines.push(`- That implies ${s.impactMetric || 'the base metric'}: ${fmt(s.baseValue)} → ${fmt(s.newValue)} (${s.impact >= 0 ? '+' : ''}${fmt(s.impact)})`)
  } else {
    if (s.mode === 'level' && s.targetLevel != null) lines.push(`- The user gave a target LEVEL (${s.label || s.variable} at ${fmt(s.targetLevel)}${s.unit ? ` ${s.unit}` : ''}); from the recorded base of ${fmt(s.variableBase)}, that is a move of ${s.resolvedDelta != null && s.resolvedDelta >= 0 ? '+' : ''}${s.resolvedDelta}${s.unit ? ` ${s.unit}` : ''}.`)
    else lines.push(`- Variable moved: ${s.label || s.variable} ${s.delta >= 0 ? '+' : ''}${s.delta}${s.unit ? ` ${s.unit}` : ''}`)
    lines.push(`- ${s.impactMetric || 'base metric'}: ${fmt(s.baseValue)} → ${fmt(s.newValue)} (change ${s.impact >= 0 ? '+' : ''}${fmt(s.impact)})`)
    if (s.marginChangeBps != null) lines.push(`- Operating margin: ${s.baseMarginPct}% → ${s.newMarginPct}% (${s.marginChangeBps >= 0 ? '+' : ''}${s.marginChangeBps} bps)`)
  }
  lines.push(`- Coefficient: ${s.coefficient} per unit; confidence: ${s.confidence || 'n/a'}; source: ${s.source || 'n/a'}`)
  if (s.withinDisclosedRange === false) lines.push(`- CAUTION: ${s.rangeNote || 'the move is beyond the orb\'s disclosed range — a rough extrapolation'}.`)
  if (s.nonLinearity) lines.push(`- Non-linearity to mention: ${s.nonLinearity}`)
  lines.push('Narrate THIS result in plain English. Use these numbers verbatim; do NOT recompute or change them. Cite the source shown, and carry the confidence and any caution/non-linearity note into your answer.')
  return lines.join('\n')
}
