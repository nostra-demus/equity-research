// The PURE field-diff between two `decision_record.json` revisions. No fs, no git, no config — so the
// one piece of this feature that can state a confident falsehood ("nothing changed" over a newly added
// kill criterion) is testable with inline fixtures in milliseconds. `what-changed.ts` owns the I/O.
//
// WHY A THREE-TIER DIFF, AND NOT A LINE DIFF. The question this answers is "did the call change, did my
// confidence change" — a verdict with a direction, not a patch. A byte-diff of the real EMAAR pair says
// "22 insertions, 20 deletions": true, and an answer to nothing. But an anchors-ONLY diff says "nothing
// changed" while a new kill criterion sits in the tail — false, and a §3/§8 breach (kill criteria ARE the
// disconfirmation surface). Both lie. Tier 1 = the call, Tier 2 = the evidence, Tier 3 = the wording.
//
// SHAPE TOLERANCE IS THE FEATURE, NOT DEFENSIVE POLISH. Verified across all 6 committed records — every
// one of them at schema_version "1.0", so the version field does NOT pin the shape:
//   module_scores -> a DICT keyed by module name; values {score,verdict} in 5, a BARE INT in EMAAR_2026-07-03
//   red_flags     -> dicts {id,severity,description,…} in 5, plain strings in EMAAR_2026-07-10
//   kill_criteria -> strings in 5, dicts {condition,what_it_means,…} — with NO id — in TMCV
//   scenarios     -> absent in BG/HCG/TMCV; the probability key is `probability`, NOT `probability_pct`
//   thesis_type   -> a LIST everywhere, never a scalar
// Two parsed JSON objects are never reference-equal, so a Set/includes diff over dict-shaped entries
// reports EVERY entry as both added and removed — on the real EMAAR_2026-07-03 pair that renders
// "8 added / 8 removed" of "[object Object]" against byte-identical red flags. Sixteen fabricated
// changes where the truth is zero. Hence: normalize to (key, text), and never throw on an unknown shape.

export type Polarity = 'higher_better' | 'lower_better' | 'neutral' | 'categorical' | 'structural' | 'ambiguous'
export type Direction = 'up' | 'down' | 'flat' | 'changed'
export type Tone = 'better' | 'worse' | 'flat' | 'neutral'

export type ChangeVerdict =
  | 'identical' // every tier empty AND the canonical JSON is equal — the ONLY licence for a flat "nothing changed"
  | 'call_held' // every anchor flat; something below moved   <-- the EMAAR case
  | 'anchors_moved' // the call string held, but a headline number moved
  | 'call_changed' // the call itself changed

export interface AnchorDelta {
  field: string
  label: string // §21 plain English
  prev: string | number | null
  cur: string | number | null
  present: { prev: boolean; cur: boolean }
  moved: boolean
  direction: Direction
  polarity: Polarity
  tone: Tone // DERIVED FROM POLARITY, NEVER FROM THE SIGN
  note?: string // set for 'ambiguous' — why the direction is shown but not scored
}

export interface ListDelta {
  field: string
  label: string
  prevCount: number
  curCount: number
  added: string[]
  removed: string[]
  reworded: { key: string; prev: string; cur: string }[]
  moved: boolean
  note?: string // "this field is new in this version" / "…is gone in this version"
}

export interface ModuleDelta {
  module: string
  prevScore: number | null // null = the value carried no readable score. Never 0, never "unchanged".
  curScore: number | null
  scoreMoved: boolean
  scoreReadable: boolean // false -> rendered UNKNOWN, never flat
  verdictChanged: boolean // narrative; never an anchor
}

export interface ProseDelta {
  field: string
  label: string
}

export interface RecordDiff {
  verdict: ChangeVerdict
  headline: string // one sentence that cannot be false
  subline: string
  anchors: AnchorDelta[] // ALWAYS every present anchor, moved or not — an unchanged anchor is evidence
  anchorsMoved: boolean
  lists: ListDelta[] // only deltas with moved === true
  modules: ModuleDelta[]
  prose: ProseDelta[] // only changed; named, never rendered diff-style
  evidenceCount: number // Tier-2 fields that moved (the material tail)
  wordingCount: number // Tier-3 fields reworded — real, but not a number moving
  belowCount: number // evidenceCount + wordingCount. VERDICT-CRITICAL: 'identical' is only licensed when
  // this is 0 AND the canonical JSON matches, so a pure-prose rewrite can never render "nothing changed".
  // THE one user-facing count. Every surface renders this string verbatim — the chip, the panel and the
  // chat block each used to derive their own from a different field (belowCount / evidenceCount /
  // evidenceCount||wordingCount), so the same run could say "16 changes", "3" and "3" in three places at
  // once. A number the user can catch disagreeing with itself costs more trust than it buys.
  tailSummary: string
  hasInverted: boolean // any rendered anchor is lower_better|ambiguous -> §12 header marker required
}

// ---------------------------------------------------------------------------------------------------
// Normalizers — exported for the test and for reuse; do not inline them.
// ---------------------------------------------------------------------------------------------------

const isPlainObject = (x: unknown): x is Record<string, unknown> =>
  !!x && typeof x === 'object' && !Array.isArray(x)

/** Key-sorted JSON, so {a:1,b:2} and {b:2,a:1} are the same entry. The identity of last resort.
 *  `undefined` (a missing key) and `null` (an explicit null) are DIFFERENT states — §3 bars hiding
 *  missing data, so a field vanishing from the record must not canonicalize the same as it going null. */
export function canonicalJson(x: unknown): string {
  if (x === undefined) return 'undefined'
  return JSON.stringify(x, (_k, v) =>
    isPlainObject(v) ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, v[k]])) : v,
  ) ?? 'null'
}

// Identity, in order. EXACT declared-field match only — never edit distance, never similarity. Claiming
// a pairing the data does not declare is an unlabeled inference (§3) and a §20 bad-extraction waiting to
// happen. Verified: red_flags dicts carry `id`; TMCV kill_criteria dicts carry `condition` and NO id.
const ID_FIELDS = ['id', 'need_id', 'flag_id', 'condition'] as const

export function itemKey(x: unknown): string {
  if (typeof x === 'string') return 'txt:' + x.trim().replace(/\s+/g, ' ')
  if (isPlainObject(x)) {
    for (const f of ID_FIELDS) {
      const v = x[f]
      if (typeof v === 'string' && v.trim()) return `${f}:${v.trim()}`
    }
  }
  return 'json:' + canonicalJson(x)
}

// Every content key the corpus actually uses. `trigger` is TMCV's red-flag body; `what_it_means` and
// `prediction` are the same class. Missing one silently guts the entry (see the guard below).
const TEXT_FIELDS = ['description', 'condition', 'trigger', 'what_it_means', 'prediction', 'text', 'summary', 'need', 'title'] as const

export function itemText(x: unknown): string {
  if (typeof x === 'string') return x.trim()
  if (isPlainObject(x)) {
    let body: string | null = null
    for (const f of TEXT_FIELDS) {
      const v = x[f]
      if (typeof v === 'string' && v.trim()) { body = v.trim(); break }
    }
    // NO BODY => FALL THROUGH TO canonicalJson, ALWAYS. This is the load-bearing line. `severity` must
    // never on its own satisfy "we found something to show": when it did, an unmapped shape rendered as
    // the bare string "(High)" — every one of TMCV's nine red flags collapsed to the same four
    // characters, and an added Critical flag would have been reported to the reader, verbatim, as
    // "a red flag was added: (Critical)". Dropping the body of a §13 hard-cap field is the §20
    // bad-extraction this module exists to prevent. Showing raw JSON is ugly; showing a severity with no
    // finding attached is a lie. Prefer ugly.
    if (!body) return canonicalJson(x)
    const sev = x.severity
    if (typeof sev === 'string' && sev.trim()) return `${body} (${sev.trim()})`
    if (typeof sev === 'number') return `${body} (severity ${sev})`
    return body
  }
  return String(x)
}

/** {score,verdict} | a bare int | anything else. `readable:false` is reported as UNKNOWN, never as flat. */
export function moduleScore(v: unknown): { score: number | null; verdict: string | null; readable: boolean } {
  if (typeof v === 'number' && Number.isFinite(v)) return { score: v, verdict: null, readable: true }
  if (isPlainObject(v)) {
    const s = v.score
    const d = v.verdict
    const readable = typeof s === 'number' && Number.isFinite(s)
    return { score: readable ? (s as number) : null, verdict: typeof d === 'string' ? d : null, readable }
  }
  return { score: null, verdict: null, readable: false }
}

// ---------------------------------------------------------------------------------------------------
// Polarity + tone
// ---------------------------------------------------------------------------------------------------

function toneOf(p: Polarity, d: Direction): Tone {
  if (d === 'flat') return 'flat'
  // 'changed' means "we could not compute a direction" (one side absent, null, or non-numeric), so it can
  // never carry a scored tone. Without this, a re-run that FIRST ESTABLISHES a margin of safety renders
  // the arrival of 18.7% in red as a deterioration — and margin_of_safety_pct is genuinely absent in 5 of
  // the 6 committed records, so this is the common path, not an edge case. Same trap waiting for
  // `conviction`/`analysis_confidence` the day the first two-number-confidence record lands.
  if (d === 'changed') return 'neutral'
  switch (p) {
    case 'higher_better':
      return d === 'up' ? 'better' : 'worse'
    case 'lower_better':
      return d === 'up' ? 'worse' : 'better' // §12 INVERTED — higher means worse
    default:
      return 'neutral'
  }
}

// `downside_risk_pct` is stored under TWO incompatible conventions across the committed corpus:
//   magnitude     — AMZN +38.7, EMAAR_2026-07-10 +20.1        (higher = worse)
//   signed return — BG −31.1, HCG −31.9, EMAAR_07-03 −63.9, TMCV −81.0  (lower = worse)
// A fixed `lower_better` paints the direction BACKWARDS on 4 of the 6. It is still an inverted score in
// doctrine (§12), so we flag it as inverted AND resolve its polarity per-pair — refusing to score the
// direction when the sign flips between versions. That is the conservative default (§4) applied to a
// genuine ambiguity, never to the mere presence of a minus sign.
function downsidePolarity(prev: unknown, cur: unknown): { polarity: Polarity; note?: string } {
  if (typeof prev !== 'number' || typeof cur !== 'number') return { polarity: 'neutral' }
  if (prev <= 0 && cur <= 0) return { polarity: 'higher_better' }
  if (prev >= 0 && cur >= 0) return { polarity: 'lower_better' }
  return {
    polarity: 'ambiguous',
    note:
      'downside risk changed sign between versions — the two runs are using different sign conventions ' +
      'for this field, so the direction is shown but not scored good or bad.',
  }
}

// ---------------------------------------------------------------------------------------------------
// The anchor table — PRESENCE-DRIVEN, never a hardcoded render list. An anchor is emitted iff the field
// is present in EITHER revision. This is what keeps the view alive through a schema migration:
// DecisionBanner already renders `conviction` / `analysis_confidence`, and no committed record carries
// them yet — a fixed list would go blind the day the first two-number-confidence record lands.
// ---------------------------------------------------------------------------------------------------

interface AnchorSpec {
  field: string
  label: string
  polarity: Polarity
}

const ANCHOR_SPECS: AnchorSpec[] = [
  { field: 'confidence_score', label: 'confidence', polarity: 'higher_better' },
  { field: 'conviction', label: 'conviction', polarity: 'higher_better' },
  { field: 'analysis_confidence', label: 'understanding', polarity: 'higher_better' },
  { field: 'data_sufficiency_score', label: 'data sufficiency', polarity: 'higher_better' },
  { field: 'edge_score', label: 'edge', polarity: 'higher_better' },
  { field: 'expected_return_pct', label: 'expected return', polarity: 'higher_better' },
  { field: 'margin_of_safety_pct', label: 'margin of safety', polarity: 'higher_better' },
  { field: 'risk_reward', label: 'risk / reward', polarity: 'higher_better' },
  { field: 'downside_risk_pct', label: 'downside risk', polarity: 'lower_better' }, // resolved per-pair below
  { field: 'entry_price', label: 'entry price', polarity: 'neutral' }, // a price move is context, not good or bad
  { field: 'scenarios', label: 'scenarios', polarity: 'structural' },
  { field: 'thesis_type', label: 'thesis type', polarity: 'structural' }, // a LIST — deep-equal, never scalar
]

const LIST_SPECS: { field: string; label: string }[] = [
  { field: 'red_flags', label: 'red flags' },
  { field: 'kill_criteria', label: 'kill criteria' },
  { field: 'missing_data', label: 'missing data' },
  { field: 'upgrade_triggers', label: 'upgrade triggers' },
]

const PROSE_SPECS: { field: string; label: string }[] = [
  { field: 'rating_cap', label: 'rating cap' },
  { field: 'suggested_action', label: 'suggested action' },
  { field: 'variant_perception_summary', label: 'variant perception' },
  { field: 'what_everyone_knows', label: 'what everyone knows' },
  { field: 'what_is_priced_in', label: "what's priced in" },
  { field: 'what_market_may_be_missing', label: 'what the market may be missing' },
  { field: 'edge_proof', label: 'edge proof' },
  { field: 'killer_risk', label: 'killer risk' },
  { field: 'notes', label: 'notes' },
  { field: 'primary_valuation_method', label: 'valuation method' },
  { field: 'time_horizon', label: 'time horizon' },
]

const num = (x: unknown): number | null => (typeof x === 'number' && Number.isFinite(x) ? x : null)

function fmtAnchor(v: unknown, polarity: Polarity): string | number | null {
  if (v === undefined || v === null) return null
  if (polarity === 'structural') return Array.isArray(v) ? `${v.length} entries` : 'present'
  if (typeof v === 'number' || typeof v === 'string') return v
  return canonicalJson(v)
}

// A structural anchor is compared by deep-equality but DISPLAYED as a count, so a same-length change
// (thesis_type ['Company-specific'] -> ['Macro-conditional'], or a scenario whose probability moved)
// renders "1 entries → 1 entries" — a row flagged as moved whose two cells are identical, which reads as
// a rendering bug and teaches the reader to distrust the table. Say what actually happened instead.
function structuralCells(a: AnchorDelta): AnchorDelta {
  if (a.polarity !== 'structural' || !a.moved) return a
  if (a.prev !== null && a.cur !== null && a.prev === a.cur) return { ...a, cur: 'changed' }
  return a
}

function buildAnchor(spec: AnchorSpec, prevRec: Record<string, unknown>, curRec: Record<string, unknown>): AnchorDelta | null {
  const pRaw = prevRec[spec.field]
  const cRaw = curRec[spec.field]
  const present = { prev: pRaw !== undefined, cur: cRaw !== undefined }
  if (!present.prev && !present.cur) return null // absent in both -> no row (upgrade_triggers in 5 of 6)

  let polarity = spec.polarity
  let note: string | undefined
  if (spec.field === 'downside_risk_pct') {
    const r = downsidePolarity(pRaw, cRaw)
    polarity = r.polarity
    note = r.note
  }

  let moved: boolean
  let direction: Direction
  if (polarity === 'structural') {
    moved = canonicalJson(pRaw) !== canonicalJson(cRaw)
    direction = moved ? 'changed' : 'flat'
  } else {
    const p = num(pRaw)
    const c = num(cRaw)
    if (p !== null && c !== null) {
      moved = p !== c
      direction = !moved ? 'flat' : c > p ? 'up' : 'down'
    } else {
      moved = canonicalJson(pRaw) !== canonicalJson(cRaw)
      direction = moved ? 'changed' : 'flat'
    }
  }

  return {
    field: spec.field,
    label: spec.label,
    prev: fmtAnchor(pRaw, polarity),
    cur: fmtAnchor(cRaw, polarity),
    present,
    moved,
    direction,
    polarity,
    tone: toneOf(polarity, direction),
    ...(note ? { note } : {}),
  }
}

function buildList(spec: { field: string; label: string }, prevRec: Record<string, unknown>, curRec: Record<string, unknown>): ListDelta | null {
  const pRaw = prevRec[spec.field]
  const cRaw = curRec[spec.field]
  if (pRaw === undefined && cRaw === undefined) return null

  // DETECT on the item's FULL content (`sig`), DISPLAY the readable `text`. itemText deliberately shows
  // only the first text field, so using it to detect would hide any edit to a secondary field — e.g. a
  // TMCV kill criterion whose `what_it_means` was rewritten under the same `condition`, or a red flag
  // whose `severity` moved High -> Critical. A lossy display string must never decide whether something
  // changed: this view's whole job is to fail toward showing.
  const toMap = (x: unknown): Map<string, { text: string; sig: string }> => {
    const m = new Map<string, { text: string; sig: string }>()
    if (Array.isArray(x)) for (const it of x) m.set(itemKey(it), { text: itemText(it), sig: canonicalJson(it) })
    return m
  }
  const prevMap = toMap(pRaw)
  const curMap = toMap(cRaw)

  const added: string[] = []
  const removed: string[] = []
  const reworded: { key: string; prev: string; cur: string }[] = []
  for (const [k, v] of curMap) {
    const p = prevMap.get(k)
    if (!p) added.push(v.text)
    else if (p.sig !== v.sig) reworded.push({ key: k, prev: p.text, cur: v.text })
  }
  for (const [k, v] of prevMap) if (!curMap.has(k)) removed.push(v.text)

  const note =
    pRaw === undefined ? 'this field is new in this version' : cRaw === undefined ? 'this field is gone in this version' : undefined

  return {
    field: spec.field,
    label: spec.label,
    prevCount: prevMap.size,
    curCount: curMap.size,
    added,
    removed,
    reworded,
    moved: added.length + removed.length + reworded.length > 0,
    ...(note ? { note } : {}),
  }
}

function buildModules(prevRec: Record<string, unknown>, curRec: Record<string, unknown>): ModuleDelta[] {
  const p = isPlainObject(prevRec.module_scores) ? prevRec.module_scores : {}
  const c = isPlainObject(curRec.module_scores) ? curRec.module_scores : {}
  const names = [...new Set([...Object.keys(p), ...Object.keys(c)])].sort()
  const out: ModuleDelta[] = []
  for (const m of names) {
    const a = moduleScore(p[m])
    const b = moduleScore(c[m])
    const scoreReadable = a.readable && b.readable
    out.push({
      module: m,
      prevScore: a.score,
      curScore: b.score,
      scoreMoved: scoreReadable ? a.score !== b.score : false,
      scoreReadable,
      verdictChanged: a.verdict !== null && b.verdict !== null && a.verdict !== b.verdict,
    })
  }
  return out
}

// ---------------------------------------------------------------------------------------------------
// Copy. Modelled on ThesisPlanPanel.subtitle(): say what is actually true — it is exactly the sentence a
// naive template produces, and that is the point.
// ---------------------------------------------------------------------------------------------------

const pct = (v: string | number | null): string =>
  typeof v === 'number' ? `${v > 0 ? '+' : ''}${v}%` : v === null ? '—' : String(v)

function buildSubline(anchors: AnchorDelta[], callField: string): string {
  const parts: string[] = []
  const pick = (field: string, render: (a: AnchorDelta) => string) => {
    const a = anchors.find((x) => x.field === field)
    if (a) parts.push(render(a))
  }
  pick(callField, (a) => `${a.prev ?? '—'} → ${a.cur ?? '—'}`)
  pick('confidence_score', (a) => `confidence ${a.prev ?? '—'} → ${a.cur ?? '—'}`)
  pick('expected_return_pct', (a) => `expected return ${pct(a.prev)} → ${pct(a.cur)}`)
  return parts.join(' · ')
}

function buildHeadline(verdict: ChangeVerdict, anchors: AnchorDelta[], callField: string, prevDate: string): string {
  const call = anchors.find((a) => a.field === callField)
  switch (verdict) {
    case 'identical':
      return prevDate
        ? `Nothing changed. This version is identical to the one from ${prevDate}.`
        : 'Nothing changed. This version is identical to the previous one on record.'
    case 'call_held':
      return "The call didn't move."
    case 'anchors_moved': {
      const movers = anchors.filter((a) => a.moved && a.field !== callField)
      const first = movers[0]
      const held = call?.cur ?? 'the call'
      if (!first) return `Still ${held}.`
      const dir = first.direction === 'up' ? 'rose' : first.direction === 'down' ? 'fell' : 'changed'
      return `Still ${held} — but ${first.label} ${dir} (${first.prev ?? '—'} → ${first.cur ?? '—'}).`
    }
    case 'call_changed':
      // §18's allowed outputs are NOT ordinal — "Pair Trade / Hedge Required" and "Insufficient Data —
      // Refuse To Rate" sit on no ladder with Buy/Watchlist, and no ordered ladder exists in the code.
      // So: never "upgraded"/"downgraded"/"re-rated". State the move.
      return `The call changed: ${call?.prev ?? '—'} → ${call?.cur ?? '—'}.`
  }
}

// ---------------------------------------------------------------------------------------------------

/**
 * Diff two decision records. Never throws — an unknown shape reads as CHANGED (fail toward showing,
 * never toward hiding). `opts.verdictField` lets a swarm name its own call field (defaults to `decision`).
 */
export function diffDecisionRecords(prev: unknown, cur: unknown, opts?: { verdictField?: string | null }): RecordDiff {
  const prevRec = isPlainObject(prev) ? prev : {}
  const curRec = isPlainObject(cur) ? cur : {}
  const callField = opts?.verdictField || 'decision'

  const anchors: AnchorDelta[] = []
  const callSpec: AnchorSpec = { field: callField, label: 'the call', polarity: 'categorical' }
  const callAnchor = buildAnchor(callSpec, prevRec, curRec)
  if (callAnchor) anchors.push(structuralCells(callAnchor))
  for (const spec of ANCHOR_SPECS) {
    if (spec.field === callField) continue
    const a = buildAnchor(spec, prevRec, curRec)
    if (a) anchors.push(structuralCells(a))
  }

  const modules = buildModules(prevRec, curRec)
  const lists = LIST_SPECS.map((s) => buildList(s, prevRec, curRec)).filter((d): d is ListDelta => !!d && d.moved)

  const prose: ProseDelta[] = []
  for (const s of PROSE_SPECS) {
    const p = prevRec[s.field]
    const c = curRec[s.field]
    if (p === undefined && c === undefined) continue
    if (typeof p === 'string' || typeof c === 'string' ? p !== c : canonicalJson(p) !== canonicalJson(c)) {
      prose.push({ field: s.field, label: s.label })
    }
  }
  for (const m of modules) if (m.verdictChanged) prose.push({ field: `module_scores.${m.module}.verdict`, label: `${m.module} verdict` })

  const moduleScoreMoved = modules.some((m) => m.scoreMoved)
  const anchorsMoved = anchors.some((a) => a.moved) || moduleScoreMoved
  const identical = canonicalJson(prevRec) === canonicalJson(curRec)

  // Fields no tier tracks — forecast_ledger, basket, paper_treatment, data_needs, calibration_feedback,
  // review_due and anything a future schema adds — all really exist in the committed records. Report them
  // INDEPENDENTLY, not as a fallback: gating this on "nothing else moved" meant a re-run that nudged
  // confidence AND rewrote the entire forecast ledger reported only the confidence, and silently swore
  // the ledger was untouched. §3 (never hide missing data) is not conditional on the rest of the diff
  // being quiet. The check is a set-difference against everything we DID look at, so it stays honest as
  // the schema grows rather than needing a maintainer to remember this line.
  const seen = new Set<string>([
    callField, ...ANCHOR_SPECS.map((s) => s.field), ...LIST_SPECS.map((s) => s.field),
    ...PROSE_SPECS.map((s) => s.field), 'module_scores', 'sizing_hint',
  ])
  const untracked = [...new Set([...Object.keys(prevRec), ...Object.keys(curRec)])]
    .filter((k) => !seen.has(k))
    .filter((k) => canonicalJson(prevRec[k]) !== canonicalJson(curRec[k]))
  if (untracked.length) {
    prose.push({
      field: '_untracked',
      label: `${untracked.length} other field${untracked.length === 1 ? '' : 's'} (${untracked.slice(0, 4).join(', ')}${untracked.length > 4 ? ', …' : ''})`,
    })
  }

  const evidenceCount = lists.length
  const wordingCount = prose.length
  const belowCount = evidenceCount + wordingCount

  let verdict: ChangeVerdict
  if (identical) verdict = 'identical'
  else if (callAnchor?.moved) verdict = 'call_changed'
  else if (anchorsMoved) verdict = 'anchors_moved'
  else verdict = 'call_held'

  // One sentence, built once, rendered verbatim everywhere. Names BOTH tiers rather than a single count:
  // "3 changes" understates when 13 fields were also reworded, and "16 changes" buries the 3 that matter.
  const parts: string[] = []
  if (evidenceCount) parts.push(`${evidenceCount} change${evidenceCount === 1 ? '' : 's'} to the evidence`)
  if (wordingCount) parts.push(`${wordingCount} field${wordingCount === 1 ? '' : 's'} reworded`)
  const tailSummary = parts.length ? `${parts.join(' · ')} underneath.` : ''

  return {
    verdict,
    headline: buildHeadline(verdict, anchors, callField, ''),
    subline: verdict === 'identical' ? '' : buildSubline(anchors, callField),
    anchors,
    anchorsMoved,
    lists,
    modules,
    prose,
    evidenceCount,
    wordingCount,
    belowCount,
    tailSummary,
    hasInverted: anchors.some((a) => a.polarity === 'lower_better' || a.polarity === 'ambiguous'),
  }
}

/** Re-render the headline once the previous version's date is known (what-changed.ts owns the dates). */
export function headlineWithDate(diff: RecordDiff, callField: string, prevDate: string): string {
  return buildHeadline(diff.verdict, diff.anchors, callField, prevDate)
}
