// Server-side what-if modeling for the cockpit "Ask" chat.
//
// When a chat question is a quantified what-if — "how does operating margin change if the aluminium price
// rises $45/mt?" — this module answers it DETERMINISTICALLY, with no arithmetic done by the language model:
//
//   1. detectWhatIf   — a cheap, strict gate: is this a "if <thing> <moves> by <magnitude>" question at all?
//   2. loadSidecar    — read the run's earnings/sensitivity_summary.json (the orb's recorded coefficients),
//                       sandboxed to the run tree exactly like every other chat read.
//   3. parseWhatIf    — pure regex: match the question to ONE recorded variable + extract the signed delta,
//                       in that variable's own unit. No model. A miss falls through to a normal answer.
//   4. computeScenario— shell out to scripts/sensitivity_math.py --scenario (the SAME engine the guard
//                       checks) to scale the recorded per-unit coefficient linearly.
//
// The result is streamed to the panel as a chat-computed card AND injected into the closed-book context as
// an authoritative "COMPUTED SCENARIO" block, so the model only narrates a number the engine produced. The
// whole compute path is regex + Python; the model does zero arithmetic (CLAUDE.md §15/§20).
//
// Generic by construction (CLAUDE.md §26): every variable, label, unit and coefficient comes from the run's
// own sidecar. Nothing about NHY, aluminium, or any company is hardcoded — the matcher derives its keywords
// from each recorded sensitivity's own label/variable, so any run's sidecar works with no code change.
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

/** Read <runRoot>/earnings/sensitivity_summary.json, confined to the runs tree. null when absent/unreadable
 *  (most runs have none — that is N/A, never an error: the chat just answers normally). */
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

// ---- 1. detection: is this a quantified what-if at all? ----------------------------------------------
const COND_CUE = /\b(what\s+if|if|were\s+to|assuming|suppose|imagine|scenario|hypothetical)\b/i
const CHANGE_CUE = /\b(rise|rises|rising|rose|risen|fall|falls|falling|fell|fallen|increase|increases|increasing|decrease|decreases|decreasing|drop|drops|dropped|jump|jumps|gain|gains|climb|climbs|decline|declines|move|moves|moved|weaken|weakens|strengthen|strengthens|higher|lower|up|down)\b/i
const SIGNED_NUM = /[+\-−]\s*\d/
const ANY_NUM = /\d/

/** Strict gate — a real "if X changes by N" question, not any sentence with a number in it. Requires a
 *  magnitude AND (a conditional cue OR a change verb OR an explicit sign). Keeps false positives low so the
 *  card only appears when a what-if was genuinely asked. */
export function detectWhatIf(question: string): boolean {
  const q = question || ''
  if (!ANY_NUM.test(q)) return false
  return (COND_CUE.test(q) || CHANGE_CUE.test(q) || SIGNED_NUM.test(q))
}

// ---- 2. variable matching: derive keywords from each recorded sensitivity (generic) ------------------
const STOP = new Set(['price', 'rate', 'index', 'exchange', 'external', 'sales', 'volume', 'cost', 'per', 'the', 'and', 'of', 'to'])
// currency aliases are jurisdiction-generic (not company-specific): a 3-letter code the label carries maps
// to the everyday word a user is more likely to type.
const CURRENCY_ALIAS: Record<string, string[]> = {
  usd: ['dollar', 'dollars'], nok: ['krone', 'kroner'], eur: ['euro', 'euros'],
  gbp: ['pound', 'pounds', 'sterling'], inr: ['rupee', 'rupees'], jpy: ['yen'], cny: ['yuan', 'renminbi'],
}

/** The distinctive keywords for one recorded sensitivity, derived ONLY from its own label + variable key. */
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

function wordHit(q: string, token: string): boolean {
  // word-boundary match so 'usd' doesn't hit inside 'usduration' etc.; token is already lowercase/alnum
  return new RegExp(`(^|[^a-z0-9])${token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z0-9]|$)`, 'i').test(q)
}

/** Match the question to the single most-specific recorded variable, or null. Scores by how many of a
 *  variable's keywords appear (and their length), so "alumina" beats a weaker partial and the right row wins
 *  when two are plausible. */
export function matchVariable(question: string, sidecar: SensitivitySidecar): SensitivityRow | null {
  const q = ` ${(question || '').toLowerCase()} `
  let best: { row: SensitivityRow; score: number } | null = null
  for (const row of sidecar.sensitivities || []) {
    if (!row || !row.variable) continue
    const label = (row.label || '').toLowerCase().trim()
    let score = 0
    if (label && label.length >= 4 && q.includes(label)) score += 100 + label.length // full label present = strongest
    for (const kw of variableKeywords(row)) if (wordHit(q, kw)) score += 10 + kw.length
    if (score > 0 && (!best || score > best.score)) best = { row, score }
  }
  return best ? best.row : null
}

// ---- 3. delta extraction: signed magnitude in the variable's own unit (pure regex, no model) ---------
const NEG_CUE = /\b(fall|falls|falling|fell|fallen|drop|drops|dropped|decrease|decreases|decreasing|decline|declines|lower|down|weaken|weakens|cut|cuts|loses|lose|minus)\b/i
// a number with an optional leading sign/keyword and an optional %/unit suffix
const MAG = /(?:by\s+)?([+\-−]?)\s*(?:usd|us\$|\$|nok|kr|₹|€|£|rs\.?)?\s*(\d+(?:[.,]\d+)?)\s*(%|percent|pct|pp|bps?|usd\/mt|\/mt|mt|kmt|usd|nok)?/i

export type DeltaParse =
  | { delta: number; magnitude: number; percent: boolean }
  | { error: string }
  | null

/** Extract the signed delta (in the variable's own unit) the user asked for. A `%` move is converted to an
 *  absolute move using the row's recorded base_value; without a base_value a `%` can't be sized, so we skip
 *  (null) rather than guess. Returns null when no magnitude is present (→ no card, normal answer). */
export function parseDelta(question: string, row: SensitivityRow): DeltaParse {
  const q = question || ''
  // "from 3200 to 3000" is an absolute LEVEL change, not a per-unit delta — too ambiguous to size safely
  // (which number is the move?), so bail and let the model answer rather than compute a wrong delta.
  if (/\bfrom\s+[+\-−]?[\d.,]+\s+to\s+[+\-−]?[\d.,]+/i.test(q)) return null
  const m = MAG.exec(q)
  if (!m) return null
  const rawSign = m[1]
  const num = parseFloat(m[2].replace(',', '.'))
  if (!Number.isFinite(num)) return null
  const unit = (m[3] || '').toLowerCase()
  const percent = unit === '%' || unit === 'percent' || unit === 'pct'

  // direction: an explicit sign wins; else a falling verb anywhere in the sentence → negative; else positive
  let sign = 1
  if (rawSign === '-' || rawSign === '−') sign = -1
  else if (rawSign === '+') sign = 1
  else if (NEG_CUE.test(q)) sign = -1

  if (percent) {
    const base = typeof row.base_value === 'number' ? row.base_value : null
    if (base == null) return { error: `a percentage move needs a base value for ${row.variable}, which isn't recorded` }
    return { delta: sign * base * (num / 100), magnitude: num, percent: true }
  }
  return { delta: sign * num, magnitude: num, percent: false }
}

/** Combine: for a detected what-if, either the (variable, delta) to compute, or an 'unsupported' verdict
 *  listing what IS modelable (state C in the mock), or null (not a modelable what-if → normal answer). */
export type WhatIfParse =
  | { kind: 'compute'; variable: string; delta: number; row: SensitivityRow }
  | { kind: 'unsupported'; recorded: { variable: string; label?: string | null; unit?: string | null }[] }
  | null

export function parseWhatIf(question: string, sidecar: SensitivitySidecar): WhatIfParse {
  if (!detectWhatIf(question)) return null
  const row = matchVariable(question, sidecar)
  if (!row) {
    // it looks like a what-if but names nothing we recorded — only claim "can't model that" when a real
    // magnitude is present (so a vague question doesn't trigger the refusal card).
    const anyMag = MAG.test(question)
    if (!anyMag) return null
    return {
      kind: 'unsupported',
      recorded: (sidecar.sensitivities || []).filter((r) => r?.variable).map((r) => ({ variable: r.variable, label: r.label, unit: r.unit })),
    }
  }
  const d = parseDelta(question, row)
  if (d == null || 'error' in d) return null // couldn't size the move → let the model answer normally
  return { kind: 'compute', variable: row.variable, delta: d.delta, row }
}

// ---- 4. compute: shell out to the deterministic Python engine ----------------------------------------
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
}

// snake_case (engine JSON) → camelCase (client type). One mapping spot so the client never sees snake_case.
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
  }
}

/** Run the deterministic engine for one (variable, delta) against the sidecar. Returns null on any failure
 *  (no python3, engine error, an {error} result) — a failed model call must degrade to a normal answer,
 *  never a fabricated number or a 500. */
export async function computeScenario(sidecar: SensitivitySidecar, variable: string, delta: number): Promise<ComputedScenario | null> {
  let out
  try {
    out = await execa('python3', [SENSITIVITY_ENGINE, '--scenario'], {
      cwd: REPO_ROOT,
      input: JSON.stringify({ sidecar, variable, delta }),
      timeout: 15_000,
      reject: false,
    })
  } catch { return null }
  if (!out || out.exitCode !== 0 || !out.stdout) return null
  try { return shapeScenario(JSON.parse(out.stdout)) } catch { return null }
}

// ---- the payload streamed to the panel + the prompt block ---------------------------------------------
export type ComputedPayload =
  | { kind: 'scenario'; asked: string; scenario: ComputedScenario }
  | { kind: 'unsupported'; asked: string; recorded: { variable: string; label?: string | null; unit?: string | null }[] }

/** The authoritative context block injected into the closed-book prompt. The model narrates THIS; it does
 *  not recompute. Numbers are the engine's, verbatim. */
export function computedContextBlock(payload: ComputedPayload): string {
  if (payload.kind === 'unsupported') {
    const list = payload.recorded.map((r) => `${r.label || r.variable}${r.unit ? ` (${r.unit})` : ''}`).join(', ')
    return [
      'COMPUTED SCENARIO — the engine could NOT model this what-if: the variable the user asked about is not one',
      'the sensitivity orb recorded for this company. Tell the user plainly that this specific variable is not a',
      `recorded sensitivity, and that the engine CAN model: ${list || '(none recorded)'}. Do not estimate the`,
      'unrecorded variable yourself — offer the recorded ones instead.',
    ].join('\n')
  }
  const s = payload.scenario
  const fmt = (n: number | null | undefined, d = 0) => (typeof n === 'number' ? n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }) : '—')
  const lines = [
    'COMPUTED SCENARIO (authoritative — produced by the engine\'s deterministic calculator scripts/sensitivity_math.py,',
    'NOT by you). The user asked a what-if; the engine scaled the orb\'s recorded per-unit coefficient linearly:',
    `- Variable moved: ${s.label || s.variable} ${s.delta >= 0 ? '+' : ''}${s.delta}${s.unit ? ` ${s.unit}` : ''}`,
    `- ${s.impactMetric || 'base metric'}: ${fmt(s.baseValue)} → ${fmt(s.newValue)} (change ${s.impact >= 0 ? '+' : ''}${fmt(s.impact)})`,
  ]
  if (s.marginChangeBps != null) {
    lines.push(`- Operating margin: ${s.baseMarginPct}% → ${s.newMarginPct}% (${s.marginChangeBps >= 0 ? '+' : ''}${s.marginChangeBps} bps)`)
  }
  lines.push(`- Coefficient: ${s.coefficient} per unit; confidence: ${s.confidence || 'n/a'}; source: ${s.source || 'n/a'}`)
  if (s.withinDisclosedRange === false) lines.push(`- CAUTION: ${s.rangeNote || 'the move is beyond the orb\'s disclosed range — a rough extrapolation'}.`)
  if (s.nonLinearity) lines.push(`- Non-linearity to mention: ${s.nonLinearity}`)
  lines.push('Narrate THIS result in plain English. Use these numbers verbatim; do NOT recompute or change them. Cite the source shown, and carry the confidence and any caution/non-linearity note into your answer.')
  return lines.join('\n')
}
