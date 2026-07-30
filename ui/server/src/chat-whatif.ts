// Server-side what-if modeling for the cockpit "Ask" chat — v3: an intelligent parser, a deterministic engine.
//
// A quantified modeling question — "how does margin change if the aluminium price rises $45/mt?", "what's
// EBITDA if aluminium IS 3,467/mt?", "what price gets the margin to 16%?" — is answered with numbers the
// ENGINE computed. v3 separates the two jobs the previous regex classifier conflated (and kept leaking on:
// stems, years-as-deltas, comma thousands, "USD/mt" token collisions, and finally "is 3,467" read as a
// +3,467 move):
//
//   INTERPRETATION (language) — a small constrained model call maps the question to strict JSON intents
//     {variable, mode, value}. It runs on the SAME model the panel's selector picked for the turn (one
//     selector, one model — no separate parser knob), but as a deliberately small call: thinking off and a
//     tight timeout (CHAT.parserTimeoutMs). The model SELECTS; it can never invent — a code validator
//     rejects any variable the orb didn't record and any value that does not literally appear in the
//     question.
//   COMPUTATION (arithmetic) — unchanged: scripts/sensitivity_math.py resolves level→delta, scales the
//     recorded coefficient, computes margins, flags the disclosed range. The language model never computes.
//
// Flow: detectWhatIf (cheap regex gate — non-what-if questions never pay for a parse) → buildParserPrompt →
// the injected ParserCall (server-side: the chat's own claude-CLI spawn; stubbed in tests so the suite stays
// deterministic) → parseModelOutput → validateIntents (pure, red-teamable) → computePlan per intent → the
// chat-computed card(s) + an authoritative COMPUTED SCENARIO block. The card echoes the interpretation
// ("Read as …"), so a misread is visible and correctable — never silent. Every failure path (bad JSON,
// timeout, CLI absent, invented value) degrades to a normal closed-book answer — never a number.
// CLAUDE.md §3/§15/§20/§26.
import { execa } from 'execa'
import fs from 'node:fs'
import path from 'node:path'
import { REPO_ROOT } from './config'
import { resolveInsideRuns } from './sandbox'

const SENSITIVITY_ENGINE = path.join(REPO_ROOT, 'scripts', 'sensitivity_math.py')
// The driver -> TARGET hop lives in the SAME python authority the integrity guard and the Playground client
// both mirror. The server never re-implements valuation arithmetic: a third mirror is a third thing to drift.
const VALUATION_ENGINE = path.join(REPO_ROOT, 'scripts', 'valuation_math.py')
const SIDECAR_REL = 'earnings/sensitivity_summary.json'

// ---- sidecar (the recorded coefficients) ------------------------------------------------------------
export interface SensitivityRow {
  variable: string
  label?: string | null
  unit?: string | null
  base_value?: number | null
  coefficient?: number | null
  impact_metric?: string | null
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

// sidecar JSON is external — a malformed `sensitivities` (a non-array truthy value) must not crash iteration.
const sensRows = (sidecar: SensitivitySidecar): SensitivityRow[] => (Array.isArray(sidecar.sensitivities) ? sidecar.sensitivities : [])

/** The variables a run CAN be asked about — drives the refusal card and the parser prompt. */
export function recordedList(sidecar: SensitivitySidecar) {
  return sensRows(sidecar).filter((r) => r?.variable).map((r) => ({ variable: r.variable, label: r.label, unit: r.unit }))
}

// ---- 1. detection (the free gate) --------------------------------------------------------------------
const COND_CUE = /\b(what\s+if|if|were\s+to|assuming|suppose|imagine|scenario|hypothetical)\b/i
const CHANGE_CUE = /\b(rise|rises|rising|rose|risen|fall|falls|falling|fell|fallen|increase|increases|increasing|decrease|decreases|decreasing|drop|drops|dropped|jump|jumps|gain|gains|climb|climbs|decline|declines|move|moves|moved|weaken|weakens|strengthen|strengthens|higher|lower|up|down|hits?|reach(?:es)?|at)\b/i
const SOLVE_CUE = /\b(what|which|how\s+much|how\s+high|how\s+far|how\s+low|how\s+big)\b/i
const SIGNED_NUM = /[+\-−]\s*\d/
const ANY_NUM = /\d/

/** Cheap, strict gate: is this plausibly a quantified what-if? Since v3 every detection pays a model parse,
 *  a bare question word ("What was EBITDA in FY2025?") is NOT enough — the solve path additionally needs a
 *  %/margin signal (the reverse-solve shape). False positives cost one small parse that returns no intents;
 *  false negatives cost a modelable question — so the gate stays permissive on conditional/change cues. */
export function detectWhatIf(question: string): boolean {
  const q = question || ''
  if (!ANY_NUM.test(q)) return false
  return COND_CUE.test(q) || CHANGE_CUE.test(q) || SIGNED_NUM.test(q) || (SOLVE_CUE.test(q) && /%|margin/i.test(q))
}

// ---- 2. the parser contract (model interprets; code verifies) -----------------------------------------
export type IntentMode = 'move' | 'level' | 'target_margin'
export interface ParsedIntent {
  variable: string
  mode: IntentMode
  value: number
  direction?: 'up' | 'down' | null
  percent?: boolean | null
}
export interface ParseResult {
  intents: ParsedIntent[]
  asksUnrecorded?: string | null
  periodNote?: boolean
}
/** The injected model call: (system, user) → the model's raw text, or null on any failure. The server wires
 *  this to the chat's own claude-CLI spawn on the TURN's selected model; tests inject a stub. */
export type ParserCall = (system: string, user: string) => Promise<string | null>

/** The parse prompt: the question + the orb's recorded variables, and a strict JSON-only contract. Pure, so
 *  the test suite can pin exactly what the parser model is told. */
export function buildParserPrompt(question: string, sidecar: SensitivitySidecar): { system: string; user: string } {
  const vars = sensRows(sidecar)
    .filter((r) => r?.variable)
    .map((r) => `- ${r.variable} — "${r.label || r.variable}"${r.unit ? ` (${r.unit})` : ''}${typeof r.base_value === 'number' ? `, current level ${r.base_value}` : ''}`)
    .join('\n')
  const system = [
    'You translate ONE research question into a strict JSON intent for a deterministic calculator.',
    'You NEVER calculate anything, and you NEVER invent a number: every "value" must be a number written in the question (commas/currency stripped).',
    'Output ONLY a single JSON object — no prose, no markdown fences, no explanation.',
  ].join('\n')
  const user = [
    'RECORDED SENSITIVITY VARIABLES (the only "variable" keys you may use):',
    vars || '(none recorded)',
    '',
    'QUESTION:',
    question,
    '',
    'Return exactly this JSON shape:',
    '{"intents":[{"variable":"<recorded key>","mode":"move"|"level"|"target_margin","value":<number from the question>,"direction":"up"|"down","percent":true|false}],"asks_unrecorded":<string or null>,"period_note":true|false}',
    '',
    'Rules:',
    '- mode "move": the variable CHANGES BY value ("rises $45", "falls by 0.5", "drops 5%" with percent:true).',
    '- mode "level": the variable IS AT value ("is 3,467/mt", "at $3,000", "hits 3500", "reaches 3,484").',
    '- mode "target_margin": the question asks what input reaches a MARGIN of value percent ("what price gets the margin to 16%").',
    '- value: the number exactly as written in the question with commas/currency stripped — never converted, scaled, or invented.',
    '- direction: "down" only for a downward move ("falls", "drops", "-0.5"); otherwise "up". Levels and margin targets ignore it.',
    '- percent: true only when the value is a percentage move OF THE VARIABLE ITSELF ("volume drops 10%").',
    '- One intent per distinct recorded variable the question moves. intents: [] when the question is not a modelable what-if.',
    '- asks_unrecorded: when the question IS a what-if but about something not in the recorded list, name that thing; else null.',
    '- period_note: true when the question asks about a future period/year this single-period scenario cannot forecast (e.g. "for 2026/27").',
  ].join('\n')
  return { system, user }
}

/** Parse the model's raw text into a ParseResult — tolerant of fences/prose around the JSON, strict on the
 *  shape inside it. Anything malformed → null (→ normal answer, no card). Pure. */
export function parseModelOutput(text: string | null | undefined): ParseResult | null {
  if (!text) return null
  const t = String(text).trim()
  const a = t.indexOf('{')
  const b = t.lastIndexOf('}')
  if (a < 0 || b <= a) return null
  let o: any
  try { o = JSON.parse(t.slice(a, b + 1)) } catch { return null }
  if (!o || typeof o !== 'object' || Array.isArray(o)) return null
  const intents: ParsedIntent[] = []
  for (const it of Array.isArray(o.intents) ? o.intents : []) {
    if (!it || typeof it !== 'object') continue
    if (it.mode !== 'move' && it.mode !== 'level' && it.mode !== 'target_margin') continue
    if (typeof it.variable !== 'string' || !it.variable.trim()) continue
    if (typeof it.value !== 'number' || !Number.isFinite(it.value)) continue
    intents.push({
      variable: it.variable.trim(),
      mode: it.mode,
      value: it.value,
      direction: it.direction === 'down' ? 'down' : it.direction === 'up' ? 'up' : null,
      percent: it.percent === true,
    })
  }
  return {
    intents,
    asksUnrecorded: typeof o.asks_unrecorded === 'string' && o.asks_unrecorded.trim() ? o.asks_unrecorded.trim() : null,
    periodNote: o.period_note === true,
  }
}

/** One parse: prompt → model → ParseResult. Null on ANY failure (timeout, CLI absent, garbage output). */
export async function parseWhatIf(question: string, sidecar: SensitivitySidecar, call: ParserCall): Promise<ParseResult | null> {
  const { system, user } = buildParserPrompt(question, sidecar)
  let text: string | null = null
  try { text = await call(system, user) } catch { return null }
  return parseModelOutput(text)
}

// ---- 3. validation (pure code — the anti-invention gate) ----------------------------------------------
/** TRUE when `value` was literally written in the question. Implemented by extracting every numeric TOKEN
 *  (digit-grouping commas stripped) and comparing NUMERICALLY — so "3.40" matches 3.4, "10.0" matches 10,
 *  ".5" matches 0.5, while 45 can never match inside "450" or "3.45" (those extract as the tokens 450 /
 *  3.45, which are numerically different). This is the structural guarantee that the parse model can only
 *  SELECT a number the user typed, never produce one. */
export function valueAppearsInQuestion(value: number, question: string): boolean {
  if (!Number.isFinite(value)) return false
  const q = (question || '').replace(/(\d),(?=\d)/g, '$1') // "3,467" → "3467"
  const target = Math.abs(value)
  for (const tok of q.match(/\d*\.?\d+/g) || []) {
    const n = parseFloat(tok)
    if (Number.isFinite(n) && n === target) return true
  }
  return false
}

// jurisdiction-generic currency aliases, so "the dollar" mentions a usd_* variable and "the krone" a *_nok one
const CURRENCY_ALIAS: Record<string, string[]> = {
  usd: ['dollar', 'dollars'], nok: ['krone', 'kroner'], eur: ['euro', 'euros'],
  gbp: ['pound', 'pounds', 'sterling'], inr: ['rupee', 'rupees'], jpy: ['yen'], cny: ['yuan', 'renminbi'],
}

/** TRUE when the question plausibly NAMES this row. A GATE, not a chooser — deliberately generous (any
 *  ≥3-char token of the variable key or label, singular/plural-stemmed, plus spelling/currency aliases),
 *  because a false negative would drop a correct parse, while a false positive merely defers to the model's
 *  own pick + the value gate. What it must stop: a parse that returns a recorded variable for a question
 *  about something else entirely ("what if freight falls 10%?" → lme_aluminium_price), which would stream
 *  an authoritative card for a variable the user never asked about. */
// physical unit suffixes for the currency-phrase stripper below (a currency-per-PHYSICAL-unit phrase is a
// price unit, not a mention of the currency row; a currency-per-CURRENCY pair IS the FX row's own name)
const PHYS_UNITS = 'mt|t|ton|tonne|tonnes|kg|lb|lbs|oz|bbl|mwh|mmbtu|share|shares|unit|units'
const CUR_UNIT_PHRASE = new RegExp(`(\\d[\\d,.]*\\s*)?(usd|nok|eur|gbp|inr|jpy|cny)\\s*\\/\\s*(${PHYS_UNITS})\\b`, 'g')

export function questionMentionsRow(question: string, row: SensitivityRow): boolean {
  const q = ` ${(question || '').toLowerCase()} `
  // Currency-CODE tokens match against a copy with amount-unit phrases removed ("3000 usd/mt", "usd/mt"),
  // so a commodity price quoted in USD cannot make the FX row look mentioned (its "usd" there is a unit,
  // not a subject). "usd/nok" survives the strip — that IS the FX pair being named. Aliases ("dollar")
  // and every non-currency token still match the full question.
  const qCur = ` ${q.replace(CUR_UNIT_PHRASE, ' ')} `
  const toks = `${row.variable || ''} ${row.label || ''}`.toLowerCase().split(/[^a-z0-9]+/).filter((t) => t.length >= 3)
  const cand = new Set<string>(toks)
  for (const t of toks) {
    if (t === 'aluminium') cand.add('aluminum')
    if (t === 'aluminum') cand.add('aluminium')
    // own-property + Array.isArray: a token like 'constructor' must not resolve to a prototype function
    const aliases = Object.prototype.hasOwnProperty.call(CURRENCY_ALIAS, t) ? CURRENCY_ALIAS[t] : null
    if (Array.isArray(aliases)) for (const a of aliases) cand.add(a)
  }
  for (const t of cand) {
    const s = t.length > 4 && t.endsWith('s') ? t.slice(0, -1) : t // "extrusions" also matches "extrusion"
    const hay = Object.prototype.hasOwnProperty.call(CURRENCY_ALIAS, t) ? qCur : q
    if (hay.includes(s)) return true
  }
  return false
}

export type UnsupportedReason = 'unrecorded' | 'no_revenue_base' | 'no_source' | 'metric_mismatch'
/** A validated, computable intent: the row it resolved to + the exact engine request. */
export interface Plan { variable: string; row: SensitivityRow; req: ScenarioRequest }

// bound how many cards one question can fan out to (a joint ask computes each leg separately)
const MAX_INTENTS = 4

/** Validate the parse against the question + sidecar. Drops (never repairs) anything suspect: an unrecorded
 *  variable key, a variable the question never names, a value not present in the question, a % move without
 *  a recorded base level, a duplicate variable. Sidecar-side integrity is enforced here too — an uncited
 *  coefficient cannot be modelled and cited (§3), and a coefficient on a different metric than the base
 *  cannot be applied to the base level. Returns the computable plans plus (when nothing is computable) the
 *  honest refusal reason, if any. */
export function validateIntents(pr: ParseResult, question: string, sidecar: SensitivitySidecar): { plans: Plan[]; refusal: UnsupportedReason | null; omitted: number } {
  const rows = new Map(sensRows(sidecar).filter((r) => r?.variable).map((r) => [r.variable.toLowerCase(), r] as const))
  const seen = new Set<string>()
  const plans: Plan[] = []
  let refusal: UnsupportedReason | null = null
  let omitted = 0
  // validate EVERY intent, cap only the VALID ones — a junk intent must not silently eat a slot, and a
  // valid ask beyond the cap is COUNTED so the answer can say so instead of presenting a subset as the
  // whole (Codex #335 P2 r3643707266)
  for (const it of pr.intents || []) {
    const row = rows.get(it.variable.toLowerCase())
    if (!row || seen.has(row.variable)) continue
    if (!questionMentionsRow(question, row)) continue         // the variable must be the one the user asked about
    if (!valueAppearsInQuestion(it.value, question)) continue // the anti-invention gate
    // mode sanity: a margin-target intent from a question that never talks about a margin/percentage is a
    // mis-read ("aluminium rises $45/mt" must not solve for an absurd 45% margin with full authority) —
    // drop it, never repair it (Codex #335 P2 r3643707271)
    if (it.mode !== 'move' && it.mode !== 'level' && !/margin|%|percent/i.test(question)) continue
    if (!(typeof row.source === 'string' && row.source.trim())) { refusal = refusal ?? 'no_source'; continue }
    if (row.impact_metric && sidecar.base_metric && row.impact_metric !== sidecar.base_metric) { refusal = refusal ?? 'metric_mismatch'; continue }
    let req: ScenarioRequest | null = null
    if (it.mode === 'move') {
      const sign = it.direction === 'down' || it.value < 0 ? -1 : 1
      if (it.percent) {
        if (typeof row.base_value !== 'number') continue // a % move needs the variable's recorded level to size
        req = { delta: sign * row.base_value * (Math.abs(it.value) / 100) }
      } else {
        req = { delta: sign * Math.abs(it.value) }
      }
    } else if (it.mode === 'level') {
      req = { targetLevel: Math.abs(it.value) }
    } else {
      if (!(typeof sidecar.revenue_base === 'number' && sidecar.revenue_base > 0)) { refusal = refusal ?? 'no_revenue_base'; continue }
      req = { targetMargin: Math.abs(it.value) }
    }
    if (plans.length >= MAX_INTENTS) { omitted++; continue }
    plans.push({ variable: row.variable, row, req })
    seen.add(row.variable)
  }
  if (!plans.length && !refusal && pr.asksUnrecorded) refusal = 'unrecorded'
  return { plans, refusal, omitted }
}

// ---- 4. compute: shell out to the deterministic engine -----------------------------------------------
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
  marginBasis?: string | null   // 'revenue_constant' → margin computed at unchanged revenue (no rev coefficient)
  metricNote?: string | null    // set when the coefficient is on a metric ≠ base metric (level/margin withheld)
  // set by the route, not the engine: TRUE when the question asked about a period this single-period
  // scenario cannot forecast (the parse's period_note flag). The warning is gated on THIS flag, not on
  // periodBase — a future-period question must carry the "not a forecast" disclaimer even when the
  // sidecar records no base_period (Codex #335 r3644942615).
  periodNote?: boolean | null
  // the sidecar's base period when known (decorates the note); may be null while periodNote is true
  periodBase?: string | null
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
    marginBasis: r.margin_basis ?? null, metricNote: r.metric_note ?? null,
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

/** Compute one validated Plan → a ComputedScenario, or null. */
export async function computePlan(sidecar: SensitivitySidecar, plan: Plan): Promise<ComputedScenario | null> {
  return computeScenario(sidecar, plan.variable, plan.req)
}

// the margin's honest name, derived from the base metric — an EBITDA base yields an EBITDA margin, never an
// "operating margin" (which uses EBIT). Revenue is held constant, so it is always the "…at unchanged revenue".
export function marginName(metric?: string | null): string {
  const m = String(metric || '').toLowerCase()
  if (m.includes('ebitda')) return 'EBITDA margin'
  if (m.includes('ebit') || m.includes('operating')) return 'operating margin'
  if (m.includes('net') && m.includes('income')) return 'net margin'
  return 'margin'
}

// ---- 5. the payload streamed to the panel + the prompt block -----------------------------------------
export type ComputedPayload =
  // `reprice` is the driver -> TARGET half. Optional: a run with no per-case valuation levers simply omits
  // the section rather than the chat claiming the target is out of context.
  | { kind: 'scenario'; asked: string; scenario: ComputedScenario; reprice?: RepricedValuation | null }
  | { kind: 'unsupported'; asked: string; recorded: { variable: string; label?: string | null; unit?: string | null }[]; reason: string }

const fmt = (n: number | null | undefined, d = 0) => (typeof n === 'number' ? n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }) : '—')

/** The authoritative context block injected into the closed-book prompt. The model narrates THIS; the
 *  numbers are the engine's, verbatim. */
/** One case in the driver -> target chain. A case that does not respond says why, and is never estimated. */
export interface RepricedCase {
  label: string
  probability: number | null
  responds: boolean
  why?: string | null
  level_before: number | null
  level_after: number | null
  return_before: number | null
  return_after: number | null
  multiple?: number | null
  multiple_basis?: string | null
}

/** The answer to "…and what would the target change be?" — the question the chat used to call not-in-context.
 *  Every number comes from scripts/valuation_math.py; `ok: false` carries a reason the block states plainly. */
export interface RepricedValuation {
  ok: boolean
  reason?: string | null
  detail?: string | null
  price?: number | null
  direction?: 'long' | 'short'
  metric_before?: number | null
  metric_after?: number | null
  cases?: RepricedCase[]
  responded?: number
  held?: string[]
  expected_return_pct_before?: number | null
  expected_return_pct_after?: number | null
  prob_weighted_target_before?: number | null
  prob_weighted_target_after?: number | null
  warnings?: string[]
}

/** Push a NEW base-metric value through each case's own recorded valuation levers.
 *
 *  This is the second half of a driver question. The sensitivity engine answers "the EBITDA change"; this
 *  answers "and therefore the target / the upside" — which the chat previously could not reach at all,
 *  because nothing linked the sensitivity sidecar to valuation_summary.json. Returns null when the run has
 *  no levers to push through (the caller then simply omits the section). */
export async function repriceFromMetric(args: {
  valuationSidecar: unknown
  decision: unknown
  newMetric: number
  baseMetric?: number | null
  direction?: 'long' | 'short'
}): Promise<RepricedValuation | null> {
  const payload = {
    sidecar: args.valuationSidecar, decision: args.decision ?? {},
    new_metric: args.newMetric, base_metric: args.baseMetric ?? null,
    direction: args.direction ?? 'long',
  }
  let out
  try {
    out = await execa('python3', [VALUATION_ENGINE, '--reprice'],
      { cwd: REPO_ROOT, input: JSON.stringify(payload), timeout: 15_000, reject: false })
  } catch { return null }
  if (!out || out.exitCode !== 0 || !out.stdout) return null
  try {
    const r = JSON.parse(out.stdout)
    if (r && typeof r === 'object' && !('error' in r)) return r as RepricedValuation
    return r && r.error ? { ok: false, reason: 'engine_error', detail: String(r.error) } : null
  } catch { return null }
}

/** The driver -> target section of the COMPUTED SCENARIO block. Written so the model can only narrate it:
 *  every level, return and the expected return are already computed, and a case that did NOT move carries
 *  its own reason so the model cannot invent one. */
export function repricedBlock(rv: RepricedValuation | null | undefined): string[] {
  if (!rv) return []
  if (!rv.ok) {
    const why = rv.reason === 'metric_mismatch'
      ? `the fair value cannot be re-derived from this driver: ${rv.detail}`
      : rv.reason === 'no_levers' || rv.reason === 'no_metric_cases'
        ? "this run's valuation records no per-case metric x multiple, so a driver move cannot be pushed through to a target"
        : rv.detail || 'the target could not be re-derived'
    return ['- TARGET / UPSIDE: not derivable — ' + why,
            '  Say that plainly. Do NOT estimate a price target or an upside yourself.']
  }
  const L: string[] = []
  const sign = (n: number | null | undefined) => (typeof n === 'number' && n >= 0 ? '+' : '')
  // PER-SHARE, so 2dp: fmt()'s 0dp default is right for a 28,889 EBITDA and wrong for a 107.70 fair value
  // (it would print "108", and an 84.96 entry price as "85").
  const ps = (n: number | null | undefined) => fmt(n, 2)
  L.push(`- TARGET / UPSIDE — each case re-priced through its OWN recorded multiple and bridge (${rv.direction === 'short' ? 'returns are position-signed for a SHORT: a falling price is a gain' : 'long-side returns'}):`)
  for (const c of rv.cases ?? []) {
    if (c.responds) {
      L.push(`  - ${c.label}: ${ps(c.level_before)} → ${ps(c.level_after)} at its ${c.multiple}x${c.multiple_basis ? ` ${c.multiple_basis}` : ''}`
        + (c.return_before != null && c.return_after != null ? ` (return ${sign(c.return_before)}${c.return_before}% → ${sign(c.return_after)}${c.return_after}%)` : ''))
    } else {
      L.push(`  - ${c.label}: HELD at ${ps(c.level_before)} — ${c.why}. This is not an omission: state it as a finding.`)
    }
  }
  if (rv.prob_weighted_target_before != null) {
    L.push(`  - probability-weighted target: ${ps(rv.prob_weighted_target_before)} → ${ps(rv.prob_weighted_target_after)}`)
  }
  if (rv.expected_return_pct_before != null) {
    L.push(`  - EXPECTED RETURN: ${sign(rv.expected_return_pct_before)}${rv.expected_return_pct_before}% → ${sign(rv.expected_return_pct_after)}${rv.expected_return_pct_after}%`
      + `  (probability-weighted across every case the thesis holds, at a price of ${ps(rv.price)})`)
  }
  for (const w of rv.warnings ?? []) L.push(`  - caveat: ${w}`)
  return L
}

export function computedContextBlock(payload: ComputedPayload): string {
  if (payload.kind === 'unsupported') {
    const list = payload.recorded.map((r) => `${r.label || r.variable}${r.unit ? ` (${r.unit})` : ''}`).join(', ')
    const why = payload.reason === 'multi' || payload.reason === 'ambiguous' // legacy reasons kept for deploy skew
      ? 'The engine models ONE variable at a time; the user asked about more than one at once.'
      : payload.reason === 'no_revenue_base'
        ? 'The engine cannot solve for a margin target here — this run recorded no revenue base.'
        : payload.reason === 'no_source'
          ? 'The matched sensitivity has no citation, so its number cannot be sourced (§3).'
          : payload.reason === 'metric_mismatch'
            ? 'The matched coefficient is on a different metric than the run\'s base metric, so it cannot be applied to the base level.'
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
  const mName = marginName(s.impactMetric)
  const marginTail = s.marginBasis === 'revenue_constant' ? ' (at unchanged revenue — there is no revenue coefficient, so this is NOT a fully-modelled margin)' : ''
  if (s.mode === 'reverse') {
    const tgt = s.targetMarginPct != null ? `${mName} ${s.targetMarginPct}%${marginTail}` : `${s.impactMetric || 'the base metric'} ${fmt(s.targetValue)}`
    lines.push(`- The user asked what move REACHES a target (${tgt}). The engine inverted the recorded coefficient:`)
    lines.push(`- Required move: ${s.label || s.variable} ${s.resolvedDelta != null && s.resolvedDelta >= 0 ? '+' : ''}${s.resolvedDelta}${s.unit ? ` ${s.unit}` : ''}${s.solvedVariableLevel != null ? ` → a level of ${fmt(s.solvedVariableLevel)}${s.unit ? ` ${s.unit}` : ''}` : ''}`)
    lines.push(`- That implies ${s.impactMetric || 'the base metric'}: ${fmt(s.baseValue)} → ${fmt(s.newValue)} (${s.impact >= 0 ? '+' : ''}${fmt(s.impact)})`)
  } else {
    if (s.mode === 'level' && s.targetLevel != null) lines.push(`- The user gave a target LEVEL (${s.label || s.variable} at ${fmt(s.targetLevel)}${s.unit ? ` ${s.unit}` : ''}); from the recorded base of ${fmt(s.variableBase)}, that is a move of ${s.resolvedDelta != null && s.resolvedDelta >= 0 ? '+' : ''}${s.resolvedDelta}${s.unit ? ` ${s.unit}` : ''}.`)
    else lines.push(`- Variable moved: ${s.label || s.variable} ${s.delta >= 0 ? '+' : ''}${s.delta}${s.unit ? ` ${s.unit}` : ''}`)
    lines.push(`- ${s.impactMetric || 'base metric'}: ${fmt(s.baseValue)} → ${fmt(s.newValue)} (change ${s.impact >= 0 ? '+' : ''}${fmt(s.impact)})`)
    if (s.marginChangeBps != null) lines.push(`- ${mName}: ${s.baseMarginPct}% → ${s.newMarginPct}% (${s.marginChangeBps >= 0 ? '+' : ''}${s.marginChangeBps} bps)${marginTail}`)
  }
  lines.push(`- Coefficient: ${s.coefficient} per unit; confidence: ${s.confidence || 'n/a'}; source: ${s.source || 'n/a'}`)
  if (s.basis === 'inferred') lines.push('- Basis: INFERRED (derived by the orb, not disclosed in filings) — say "Inference, not from filings" and lower confidence accordingly (§3).')
  if (s.withinDisclosedRange === false) lines.push(`- CAUTION: ${s.rangeNote || 'the move is beyond the orb\'s disclosed range — a rough extrapolation'}.`)
  if (s.nonLinearity) lines.push(`- Non-linearity to mention: ${s.nonLinearity}`)
  if (s.periodNote) lines.push(`- NOTE: the question asks about a period this scenario does not forecast — these numbers are a single-period scenario${s.periodBase ? ` on the ${s.periodBase} base` : ' on an unstated base period'}, not a multi-year forecast. Say so.`)
  for (const l of repricedBlock(payload.reprice)) lines.push(l)
  lines.push('Narrate THIS result in plain English. Use these numbers verbatim; do NOT recompute or change them. Cite the source shown, and carry the confidence, basis, and any caution/non-linearity note into your answer.')
  if (payload.reprice?.ok) {
    lines.push('The TARGET / UPSIDE lines above are part of this answer: when the user asks what the driver does to the price, the target, or the upside — now or in a later turn — those are the numbers. They are already probability-weighted across the thesis\'s own cases; never re-weight or re-derive them.')
  }
  return lines.join('\n')
}
