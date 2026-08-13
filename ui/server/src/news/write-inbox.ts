// The write stage: land triaged items into the SAME inbox contract /screener:sweep already fills, so
// the cockpit and the gauntlet pick them up with zero changes. Three jobs:
//   - mergeInbox: idempotent merge into screener/inbox/<DATE>_sweep.json (by URL + revision lane), PRESERVING any
//     human state (consumed / launched_signal_id), ranked by triage score and capped;
//   - appendFirehoseSummary: one compact line per cycle into <DATE>_firehose.ndjson (powers the
//     "seen / picked / dropped" board header without bloating the inbox with dropped items);
//   - refreshBoard: rebuild screener/board/index.json via the existing python script.

import fs from 'node:fs'
import path from 'node:path'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import type { CycleSummary, InboxRow, TriagedItem } from './types'
import { deriveScope, deriveSourceTier, SOURCE_TIERS, type SourceTierId } from './scope'
import { deriveScheduledEventEvidence } from './schedule'
import { eventIdFor } from './normalize'
import { sameThemeStoryObservation, themeStoryKey, themeStoryObservationKey } from './themes/story-key'

function inboxPath(repoRoot: string, date: string): string {
  return path.join(repoRoot, 'screener', 'inbox', `${date}_sweep.json`)
}
function firehosePath(repoRoot: string, date: string): string {
  return path.join(repoRoot, 'screener', 'inbox', `${date}_firehose.ndjson`)
}

function nextInboxSeq(rows: InboxRow[]): number {
  let max = 0
  for (const r of rows) {
    const m = /-(\d+)$/.exec(r.inbox_id || '')
    if (m) max = Math.max(max, Number(m[1]))
  }
  return max + 1
}

export interface MergeOptions {
  maxRows?: number // cap on UNCONSUMED rows (ranked by score); consumed rows are always kept
  now?: () => Date
}

const tierRank = (t?: string | null): number => (t ? SOURCE_TIERS[t as SourceTierId]?.rank ?? 0 : 0)
const MAX_OBSERVATIONS_PER_STORY = 6
const sourceTime = (row: Pick<InboxRow, 'found_at'>): number => {
  const parsed = Date.parse(row.found_at)
  return Number.isFinite(parsed) ? parsed : 0
}
const byQuality = (a: InboxRow, b: InboxRow): number =>
  tierRank(b.source_tier) - tierRank(a.source_tier)
  || (b.triage_score ?? -1) - (a.triage_score ?? -1)
  || sourceTime(b) - sourceTime(a)
  || a.inbox_id.localeCompare(b.inbox_id)
const byRecency = (a: InboxRow, b: InboxRow): number =>
  sourceTime(b) - sourceTime(a) || byQuality(a, b)

export type StoryObservationKind = 'ordinary' | 'other' | 'adverse' | 'restorative'
export type HumanVetoStoryState = 'positive' | 'adverse' | 'restorative' | 'unknown'

type StoryObservationView = {
  headline?: unknown
  headline_en?: unknown
  event_types?: unknown
}

// Keep this classifier deliberately smaller than story-key's broad preservation detector. Its only job
// is to reserve two slots inside the bounded family history: one for an adverse state, and one for a
// correction/restoration. Ambiguous words such as "changes" or the noun "proceeds" remain `other`, so a
// burst of harmless rewrites cannot evict either state from the audit trail.
const ADVERSE_STATE_RE = /\b(?:cancel(?:s|l?ed|lations?|l?ing)?|postpon(?:e(?:s|d)?|ements?|ing)|delay(?:s|ed|ing)?|defer(?:s|red|ring)?|deferrals?|suspend(?:s|ed|ing)?|suspensions?|scrap(?:s|ped|ping)?|call(?:s|ed|ing)?[\s-]+off|adjourn(?:s|ed|ing|ments?)?|withdraw(?:s|n|ing|als?)?|withdrew|retract(?:s|ed|ing|ions?)?|rescind(?:s|ed|ing)?|revok(?:e|es|ed|ing|ations?)|reject(?:s|ed|ing|ions?)?|invalidat(?:e|es|ed|ing|ions?)?|terminat(?:e|es|ed|ing|ions?)?|annul(?:s|led|ling|ments?)?)\b/i
const CORRECTION_STATE_RE = /\b(?:correct(?:s|ed|ing|ions?)?|clarif(?:y|ies|ied|ying|ications?)|revis(?:e|es|ed|ing|ions?)|restat(?:e|es|ed|ing|ements?)|inaccurate|untrue)\b/i
// Negation must bind directly to the adverse predicate. An arbitrary span made "did not explain why
// the regulator cancelled approval" look like a restoration even though cancellation still stood.
const NEGATED_ADVERSE_RE = /\b(?:not|never|no longer|won['’]?t|isn['’]?t|wasn['’]?t|weren['’]?t|hasn['’]?t|haven['’]?t|hadn['’]?t|wouldn['’]?t|cannot|can['’]?t)\s+(?:(?:be|been|being)\s+)?(?:cancel(?:s|l?ed|lations?|l?ing)?|postpon(?:e(?:s|d)?|ements?|ing)|delay(?:s|ed|ing)?|defer(?:s|red|ring)?|suspend(?:s|ed|ing)?|withdraw(?:s|n|ing|als?)?)\b/i
// Denial is a restoration only when grammar binds the denial to the adverse claim. A loose
// "denies ... cancelled" span made unrelated headlines such as "denies responsibility after the
// regulator cancelled approval" look like reversals.
const DENIES_ADVERSE_REPORT_RE = /\b(?:den(?:y|ies|ied|ying)|refut(?:e|es|ed|ing))\s+(?:reports?|claims?|allegations?|rumou?rs?)\s+(?:that\s+)?(?:the\s+|its\s+)?(?:approval|permit|licen[cs]e|authori[sz]ation|clearance|agm|meeting|event|deal|transaction|vote|guidance|dividend)\s+(?:(?:is|are|was|were|has been|have been|had been|will be)\s+)?(?:cancel(?:l?ed|lation)?|postpon(?:ed|ement)|delay(?:ed)?|defer(?:red|ral)|suspend(?:ed|sion))\b/i
const DENIES_ADVERSE_ACTION_RE = /\b(?:den(?:y|ies|ied|ying)|refut(?:e|es|ed|ing))\s+(?:it|the company|the issuer|the board|the regulator)\s+(?:(?:has|had)\s+)?(?:cancel(?:l?ed|ling)?|postpon(?:ed|ing)?|delay(?:ed|ing)?|defer(?:red|ring)?|suspend(?:ed|ing)?)\b/i
const DENIES_ADVERSE_STATUS_RE = /\b(?:den(?:y|ies|ied|ying)|refut(?:e|es|ed|ing))\s+(?:the\s+|its\s+)?(?:approval|permit|licen[cs]e|authori[sz]ation|clearance|agm|meeting|event|deal|transaction|vote|guidance|dividend)\s+(?:(?:is|are|was|were|has been|have been|had been|will be)\s+)?(?:cancel(?:l?ed|lation)?|postpon(?:ed|ement)|delay(?:ed)?|defer(?:red|ral)|suspend(?:ed|sion))\b/i
const UNDONE_ADVERSE_RE = /\b(?:cancel(?:s|l?ed|lations?|l?ing)?|postpon(?:e(?:s|d)?|ements?|ing)|delay(?:s|ed|ing)?|defer(?:s|red|ring)?|suspend(?:s|ed|ing)?)\b(?:\s+[\p{L}\p{N}'’-]+){0,4}\s+\b(?:is|are|was|were|has been|have been|claims? are|reports? are)\s+(?:withdrawn|rescinded|reversed|denied|false|incorrect|inaccurate|untrue)\b/iu
const EXPLICIT_UNDO_RE = /\b(?:revers(?:e|es|ed|ing)\s+(?:the\s+)?decision\s+to\s+cancel|cancel(?:s|l?ed|l?ing)?\s+(?:the\s+)?postponement|withdraw(?:s|n|ing)?\s+(?:the\s+)?(?:[\p{L}\p{N}'’-]+\s+){0,3}cancellation\s+notice)\b/iu
// Generic "proceed/resume" is not proof that the vetoed object changed state (an investigation can
// proceed while an approval remains cancelled). Only a directly named status object is restorative.
const RESUMPTION_RE = /\b(?:reinstat(?:e|es|ed|ing)|restor(?:e|es|ed|ing)|resum(?:e|es|ed|ing))\s+(?:the\s+)?(?:approval|permit|licen[cs]e|authori[sz]ation|clearance|agm|meeting|event|deal|transaction|vote|guidance|dividend|trading|production|service|talks?)\b|\b(?:approval|permit|licen[cs]e|authori[sz]ation|clearance|agm|meeting|event|deal|transaction|vote|guidance|dividend|trading|production|service|talks?)\s+(?:(?:is|are|was|were|has been|have been|will be)\s+)?(?:reinstated|restored|resumed)\b/i
// Bounded family history may retain an explicitly scheduled proceeding even though that wording is
// intentionally too broad to overturn a human veto. "As scheduled" supplies the missing status bind.
const SCHEDULED_PROCEED_RE = /\b(?:agm|egm|meeting|event|deal|transaction|vote|dividend|trading|production|service|talks?)\s+(?:(?:will|would|shall|is|are|was|were|has|have)\s+)?(?:still\s+)?(?:proceed|proceeds|proceeded|proceeding)\s+as\s+scheduled\b/i
const RESTORED_STATUS_RE = /\b(?:reinstat(?:e|es|ed|ing)|restor(?:e|es|ed|ing))\s+(?:the\s+)?(?:approval|permit|licen[cs]e|authori[sz]ation|clearance|agm|meeting|event|deal|transaction|vote|guidance|dividend)\b|\b(?:approval|permit|licen[cs]e|authori[sz]ation|clearance|agm|meeting|event|deal|transaction|vote|guidance|dividend)\s+(?:(?:is|are|was|were|has been|have been|will be)\s+)?(?:reinstated|restored)\b/i
const RESTORE_CONFIDENCE_RE = /\brestor(?:e|es|ed|ing)\s+(?:(?:investor|consumer|market|public)\s+)?confidence\b/i
const RESTORE_STATE_RE = /\brestor(?:e|es|ed|ing|ation)\b/i
const EXPLICIT_REPORT_REVISION_RE = /\b(?:retract(?:s|ed|ing)?|withdraw(?:s|n|ing)?|correct(?:s|ed|ing)?|clarif(?:y|ies|ied|ying))\b[^.;:]{0,60}\b(?:report|claim|statement|announcement|notice)\b|\b(?:report|claim|statement|announcement|notice)\b[^.;:]{0,60}\b(?:retract(?:s|ed|ing)?|withdraw(?:s|n|ing)?|correct(?:s|ed|ing)?|clarif(?:y|ies|ied|ying))\b/i
const NEGATIVE_APPROVAL_STATE_RE = /\b(?:do|does|did|has|have|had|will|would|can|could)\s+not\s+(?:receive|obtain|secure|get|win|gain)\s+(?:the\s+|an?\s+)?(?:approval|permit|licen[cs]e|authori[sz]ation|clearance)\b|\b(?:fail(?:s|ed|ing)?\s+to\s+)(?:receive|obtain|secure|get|win|gain)\s+(?:the\s+|an?\s+)?(?:approval|permit|licen[cs]e|authori[sz]ation|clearance)\b|\b(?:approval|permit|licen[cs]e|authori[sz]ation|clearance)\s+(?:(?:is|was|has been|had been|will be)\s+)?(?:not|never)\s+(?:granted|approved|received|obtained|secured|confirmed)\b|\b(?:received|obtained|secured|has|have|had)\s+no\s+(?:approval|permit|licen[cs]e|authori[sz]ation|clearance)\b/i
const POSITIVE_APPROVAL_STATE_RE = /\b(?:approves?|approved|grants?|granted|receives?|received|obtains?|obtained|secures?|secured|wins?|won)\s+(?:the\s+|an?\s+)?(?:approval|permit|licen[cs]e|authori[sz]ation|clearance)\b|\b(?:approval|permit|licen[cs]e|authori[sz]ation|clearance)\s+(?:(?:is|was|has been|had been)\s+)?(?:granted|approved|received|obtained|secured|confirmed|valid|active)\b/i
// A human dismissal may be bypassed only by an observed state change, never by a forecast or an
// unattributed/contested report. Keep this global across positive, adverse, and restorative lanes: a
// modal before "cancelled" is just as unproven as one before "approved". Do not include plain "says" or
// "reports" here because an identified company/regulator can make a factual statement, and the guarded
// denial grammar below deliberately accepts "denies reports that ...". Explicit uncertainty markers do
// close the exception.
const SPECULATIVE_STATE_RE = /\b(?:may|might|could|would|should|expects?|expected|plans?|planned|seeks?|seeking|aims?|hopes?|appears?|seems?|likely|potentially|possibly|tentative|conditional|pending|unconfirmed|unverified|reportedly|allegedly|purportedly|rumou?rs?|rumou?red|speculat(?:e[sd]?|ing|ion|ive)|according\s+to\s+(?:unnamed|unidentified|anonymous)\s+sources?)\b/i
const NON_AFFIRMATIVE_APPROVAL_RE = /\b(?:not|never|no|cannot|can['’]?t|won['’]?t|isn['’]?t|wasn['’]?t|hasn['’]?t|haven['’]?t|hadn['’]?t|without|failed?|fails?|yet\s+to|await(?:s|ed|ing)?|pending|conditional|unconfirmed|tentative|false|falsely|alleged|allegedly|purported|claimed?|disput(?:e|es|ed|ing)|den(?:y|ies|ied|ying)|refut(?:e|es|ed|ing)|rumou?rs?)\b/i

const HUMAN_VETO_CLAUSE_SPLIT_RE = /[.;:!?]+|\s+(?:after|while|although|but|whereas|despite|because|when|however|yet|nevertheless)\s+/i
// Negating a delay/suspension to a separate process is not a status assertion about an object merely
// mentioned inside that process: "did not suspend investigation into approval" says nothing about
// whether approval itself is active. This guard applies only to the strict human-veto parser.
const NEGATED_NON_STATUS_ACTION_RE = /\b(?:not|never|no longer|won['’]?t|isn['’]?t|wasn['’]?t|weren['’]?t|hasn['’]?t|haven['’]?t|hadn['’]?t|wouldn['’]?t|cannot|can['’]?t)\s+(?:(?:be|been|being)\s+)?(?:delay(?:s|ed|ing)?|postpon(?:e(?:s|d)?|ements?|ing)|defer(?:s|red|ring)?|suspend(?:s|ed|ing)?)\s+(?:(?:the|an?)\s+)?(?:review|hearing|investigation|inquiry|proceedings?|process|consideration|decision)\b/i

function classifyHumanVetoClause(headline: string): HumanVetoStoryState {
  if (SPECULATIVE_STATE_RE.test(headline) || NEGATED_NON_STATUS_ACTION_RE.test(headline)) return 'unknown'
  const restorative = NEGATED_ADVERSE_RE.test(headline)
    || DENIES_ADVERSE_REPORT_RE.test(headline)
    || DENIES_ADVERSE_ACTION_RE.test(headline)
    || DENIES_ADVERSE_STATUS_RE.test(headline)
    || UNDONE_ADVERSE_RE.test(headline)
    || EXPLICIT_UNDO_RE.test(headline)
    || RESTORED_STATUS_RE.test(headline)
  // Denials and direct negation contain an adverse word syntactically, so an atomic restorative match
  // wins inside one clause. Independent contradictory clauses are reconciled by the caller below.
  if (restorative) return 'restorative'
  if (ADVERSE_STATE_RE.test(headline) || NEGATIVE_APPROVAL_STATE_RE.test(headline)) return 'adverse'
  if (!NON_AFFIRMATIVE_APPROVAL_RE.test(headline)
    && !NEGATIVE_APPROVAL_STATE_RE.test(headline)
    && POSITIVE_APPROVAL_STATE_RE.test(headline)) return 'positive'
  return 'unknown'
}

const headlineFor = (row: StoryObservationView): string =>
  String((typeof row.headline_en === 'string' && row.headline_en.trim()) || row.headline || '').slice(0, 1_000)

/** Strict source-state parser used only for the guarded human-veto exception. Unknown grammar stays
 * closed. It intentionally does not treat a generic Correction:, denial, resume, or "did not" as a
 * transition; the wording must prove the status itself changed. */
export function classifyHumanVetoStoryState(row: StoryObservationView): HumanVetoStoryState {
  const headline = headlineFor(row)
  if (SPECULATIVE_STATE_RE.test(headline)) return 'unknown'
  const states = new Set(headline.split(HUMAN_VETO_CLAUSE_SPLIT_RE)
    .map(classifyHumanVetoClause)
    .filter((state): state is Exclude<HumanVetoStoryState, 'unknown'> => state !== 'unknown'))
  // A headline asserting both sides of a status is not evidence for either side. This also protects
  // callers that use the headline-wide classifier without the object binder below.
  return states.size === 1 ? [...states][0] : 'unknown'
}

const HUMAN_VETO_OBJECTS: Array<[string, RegExp]> = [
  ['approval', /\b(?:approval|permit|licen[cs]e|authori[sz]ation|clearance)\b/i],
  ['meeting', /\b(?:agm|egm|meeting|event)\b/i],
  ['deal', /\b(?:deal|transaction|merger|acquisition|bid|offer)\b/i],
  ['vote', /\b(?:vote|ballot|referendum)\b/i],
  ['guidance', /\bguidance\b/i],
  ['dividend', /\bdividend\b/i],
  ['trading', /\btrading\b/i],
  ['production', /\bproduction\b/i],
  ['service', /\bservice\b/i],
  ['talks', /\btalks?\b/i],
]
const ANAPHORIC_STATUS_RE = /\b(?:it|this|that|the\s+(?:decision|status)|cancellation|postponement|deferral|suspension|withdrawal|rejection|revocation|termination|annulment|restoration|reinstatement|resumption|reversal|rescission)\b/i
const ANAPHORIC_RESTORATIVE_RE = /\b(?:restoration|reinstatement|resumption|reversal|rescission)\b|\b(?:it|this|that|the\s+(?:decision|status))\s+(?:(?:is|was|remains?|has been|had been)\s+)?(?:restored|reinstated|resumed|valid|active)\b/i

/** Object-bound state evidence for a human-veto transition. Clauses are separated at contrast/causal
 * connectors so "restores dividend after approval was cancelled" cannot masquerade as restoration of
 * the approval. Conflicting states for one object are deliberately unknown. */
export function humanVetoStoryStates(row: StoryObservationView): Map<string, HumanVetoStoryState> {
  const headline = headlineFor(row)
  // A headline-level qualifier such as "Unconfirmed:" governs the asserted status even if punctuation
  // separates it from the predicate. Partial clause parsing must not wash that qualifier away.
  if (SPECULATIVE_STATE_RE.test(headline)) return new Map()
  const clauses = headline.split(HUMAN_VETO_CLAUSE_SPLIT_RE)
  const found = new Map<string, HumanVetoStoryState>()
  let antecedentObject: string | undefined
  for (const clause of clauses) {
    let state = classifyHumanVetoClause(clause)
    let objects = HUMAN_VETO_OBJECTS.filter(([, pattern]) => pattern.test(clause))
    // Status nouns and pronouns can carry the immediately preceding single object: "approval was not
    // cancelled; regulator confirms cancellation" is contradictory approval evidence, not a clean
    // restoration. Unknown antecedents remain closed rather than being guessed.
    if (!objects.length && antecedentObject && ANAPHORIC_STATUS_RE.test(clause)) {
      objects = [[antecedentObject, /(?:)/]]
      if (state === 'unknown' && ANAPHORIC_RESTORATIVE_RE.test(clause)) state = 'restorative'
    }
    if (state === 'unknown') continue
    // One clause-level predicate cannot safely be assigned across multiple financial objects. A future
    // dependency parser may bind each independently; deterministic admission remains fail-closed today.
    if (objects.length !== 1) continue
    for (const [object] of objects) {
      const prior = found.get(object)
      found.set(object, prior && prior !== state ? 'unknown' : state)
      antecedentObject = object
    }
  }
  return found
}

/** Shared bounded-history classifier for Inbox and Ideas. It uses the model-visible English translation
 * when one exists, but deliberately keeps a narrow restoration grammar: a noun such as "proceeds" or an
 * unrelated denial must never displace the actual row that reverses an adverse state. */
export function classifyStoryObservation(row: StoryObservationView): StoryObservationKind {
  const headline = headlineFor(row)
  const eventTypes = Array.isArray(row.event_types) ? row.event_types.map(String) : []
  const correction = eventTypes.includes('accounting_restatement') || CORRECTION_STATE_RE.test(headline)
  const restoration = NEGATED_ADVERSE_RE.test(headline)
    || DENIES_ADVERSE_REPORT_RE.test(headline)
    || DENIES_ADVERSE_ACTION_RE.test(headline)
    || DENIES_ADVERSE_STATUS_RE.test(headline)
    || UNDONE_ADVERSE_RE.test(headline)
    || EXPLICIT_UNDO_RE.test(headline)
    || RESUMPTION_RE.test(headline)
    || SCHEDULED_PROCEED_RE.test(headline)
    || (RESTORE_STATE_RE.test(headline) && !RESTORE_CONFIDENCE_RE.test(headline))
  // A "Correction:" prefix does not by itself reverse the state being reported. For example,
  // "Correction: approval was cancelled" is still adverse and must not walk around a human veto as
  // though it restored the approval. An actual negation/undo remains restorative; otherwise the
  // asserted adverse state wins before the generic correction lane.
  if (restoration) return 'restorative'
  if (ADVERSE_STATE_RE.test(headline)) return 'adverse'
  if (correction) return 'restorative'

  const probeFamily = '__inbox_observation_kind__'
  return themeStoryKey({ ...row, dedup_group: probeFamily }) === probeFamily ? 'ordinary' : 'other'
}

/** Narrow positive proof that a headline explicitly revises/undoes an earlier claim. This is stricter
 * than the bounded-history classifier: a generic later adverse verb is not enough to bypass a human
 * veto when the prior state was unrecognized. */
export function isExplicitStoryRevision(row: StoryObservationView): boolean {
  const headline = headlineFor(row)
  return NEGATED_ADVERSE_RE.test(headline)
    || DENIES_ADVERSE_REPORT_RE.test(headline)
    || DENIES_ADVERSE_ACTION_RE.test(headline)
    || DENIES_ADVERSE_STATUS_RE.test(headline)
    || UNDONE_ADVERSE_RE.test(headline)
    || EXPLICIT_UNDO_RE.test(headline)
    || EXPLICIT_REPORT_REVISION_RE.test(headline)
    || RESUMPTION_RE.test(headline)
    || (RESTORE_STATE_RE.test(headline) && !RESTORE_CONFIDENCE_RE.test(headline))
}

/** A publisher can correct or retract an article in place at the same URL. URL-only identity would
 * overwrite that falsifying observation with the old headline before revision-aware story collapse can
 * see it. Keep URL idempotence within each canonical ordinary/correction/reversal lane instead. */
function inboxUrlRevisionKey(row: { url: string; headline?: unknown; headline_en?: unknown; event_types?: unknown }): string {
  // Revision identity is exact-content based, not dependent on a finite English status vocabulary.
  // Thus "confirms expansion" and a later "abandons expansion" survive as two bounded observations even
  // when neither phrase happens to be in the preservation regex. An exact replay remains idempotent.
  const headline = String(row.headline || row.headline_en || '')
  const lane = themeStoryObservationKey({
    event_id: eventIdFor(headline, row.url),
    dedup_group: '__url_revision__',
    headline: row.headline,
    headline_en: row.headline_en,
    event_types: row.event_types,
  })
  return `${row.url}\u0000${lane}`
}

/**
 * Collapse publisher copies, retain a bounded family audit, and apply maxRows family-first. Every chosen
 * family contributes its best §4 source before a second observation is admitted, so the global cap cannot
 * undo the source pin or let one status-heavy family starve unrelated evidence.
 */
function selectInboxRows(rows: InboxRow[], maxRows: number): InboxRow[] {
  const byGroup = new Map<string, InboxRow[]>()
  for (const r of rows) {
    const g = r.dedup_group?.trim() || `__inbox__:${r.inbox_id}`
    const arr = byGroup.get(g)
    if (arr) arr.push(r)
    else byGroup.set(g, [r])
  }
  const selections = [...byGroup.entries()].map(([key, members]) => {
    const representatives: InboxRow[] = []
    for (const member of [...members].sort(byQuality)) {
      const identity = {
        ...member,
        event_id: eventIdFor(member.headline || String(member.headline_en || ''), member.url),
      }
      if (representatives.some((prior) => sameThemeStoryObservation(identity, {
        ...prior,
        event_id: eventIdFor(prior.headline || String(prior.headline_en || ''), prior.url),
      }))) continue
      representatives.push(member)
    }
    const strongest = representatives.slice().sort(byQuality)[0]
    const newest = representatives.slice().sort(byRecency)[0]
    const newestAdverse = representatives.filter((row) => classifyStoryObservation(row) === 'adverse').sort(byRecency)[0]
    const newestRestorative = representatives.filter((row) => classifyStoryObservation(row) === 'restorative').sort(byRecency)[0]
    const selected = new Map<string, InboxRow>()
    for (const pinned of [strongest, newestAdverse, newestRestorative, newest]) {
      if (pinned) selected.set(pinned.inbox_id, pinned)
    }
    for (const row of representatives.slice().sort(byRecency)) {
      if (selected.size >= MAX_OBSERVATIONS_PER_STORY) break
      selected.set(row.inbox_id, row)
    }
    const priority = members.slice().sort((a, b) => (b.triage_score ?? -1) - (a.triage_score ?? -1)
      || tierRank(b.source_tier) - tierRank(a.source_tier)
      || sourceTime(b) - sourceTime(a)
      || a.inbox_id.localeCompare(b.inbox_id))[0]
    return { key, priority, rows: [...selected.values()] }
  }).sort((a, b) => (b.priority.triage_score ?? -1) - (a.priority.triage_score ?? -1)
    || tierRank(b.priority.source_tier) - tierRank(a.priority.source_tier)
    || sourceTime(b.priority) - sourceTime(a.priority)
    || a.key.localeCompare(b.key))

  const cap = Math.max(0, Math.floor(maxRows))
  const chosen = selections.slice(0, cap)
  const kept: InboxRow[] = []
  for (let depth = 0; kept.length < cap; depth++) {
    let found = false
    for (const family of chosen) {
      const row = family.rows[depth]
      if (!row) continue
      kept.push(row)
      found = true
      if (kept.length >= cap) break
    }
    if (!found) break
  }
  return kept
}

/**
 * Merge pick/watch items into today's inbox file. Existing rows keep their consumed/launched state;
 * a re-seen URL in the same revision lane replaces the prior source observation and triage payload while
 * preserving only its inbox id and human lifecycle. A correction or reversal at that URL remains a
 * distinct observation. Returns the number of rows the inbox now holds.
 */
export function mergeInbox(repoRoot: string, date: string, items: TriagedItem[], opts: MergeOptions = {}): number {
  const maxRows = opts.maxRows && opts.maxRows > 0 ? Math.floor(opts.maxRows) : 40
  const now = opts.now || (() => new Date())
  // One clock for the whole atomic merge. It records when this exact revision first reached the local
  // inbox; unlike a publisher's `found_at`, it advances when an article is edited in place.
  const mergedAt = now().toISOString().replace(/\.\d{3}Z$/, 'Z')
  const fp = inboxPath(repoRoot, date)
  let existing: { rows?: InboxRow[] } = {}
  try { existing = JSON.parse(fs.readFileSync(fp, 'utf8')) } catch { existing = {} }
  const byUrlRevision = new Map<string, InboxRow>()
  for (const r of existing.rows || []) if (r && r.url) byUrlRevision.set(inboxUrlRevisionKey(r), r)

  const dateCompact = date.replace(/-/g, '')
  let seq = nextInboxSeq(existing.rows || [])

  for (const it of items) {
    const urlRevisionKey = inboxUrlRevisionKey(it)
    const prior = byUrlRevision.get(urlRevisionKey)
    const sourceFields = {
      headline: it.headline,
      headline_en: it.headline_en, // latest translated content, not the first copy seen at this URL
      headline_lang: it.headline_lang,
      url: it.url,
      source_name: it.source_name,
      input_nature: it.input_nature,
      found_at: it.found_at,
    }
    const triageFields = {
      triage_score: it.triage_score,
      triage_reason: it.triage_reason,
      region: it.region,
      relevance: it.relevance,
      materiality_pre_score: it.materiality_pre_score,
      event_types: it.event_types,
      issuer_linkage: it.issuer_linkage,
      companies: it.companies,
      size_bucket: it.size_bucket,
      scope: deriveScope(it),
      source_tier: deriveSourceTier(it),
      event_materiality_label: it.event_materiality_label,
      event_direction: it.event_direction,
      event_scope: it.event_scope,
      // Trade timing must come from the source row, never from the later model-authored `why_now`.
      // Category-only schedule tags are useful UI facets but are not dated catalyst evidence.
      scheduled_events: deriveScheduledEventEvidence({ headline: it.headline }),
      rank_factors: it.rank_factors, // composite-priority breakdown; triage_score IS the composite
      prelim_note: it.triage_reason, // keep the legacy field populated for any reader that uses it
      dedup_status: it.dedup_status,
      dedup_group: it.dedup_group, // story-cluster id — collapse duplicate stories below
    }
    if (prior) {
      // A publisher may rewrite the correction text in place. Retaining the old source fields would pair
      // a new score with stale evidence. Rebuild the owned row from the newest observation, carrying only
      // stable identity and explicit human state across the refresh.
      byUrlRevision.set(urlRevisionKey, {
        ...sourceFields,
        // Exact content is the same evidence observation, so neither its first source time nor local
        // first-seen clock may move on a re-fetch. Advancing either would launder freshness or make an old
        // revision look newer than a later human action. Distinct content gets a distinct lane below.
        ...(typeof prior.found_at === 'string' ? { found_at: prior.found_at } : {}),
        ...triageFields,
        inbox_id: prior.inbox_id,
        consumed: prior.consumed === true,
        launched_signal_id: prior.launched_signal_id ?? null,
        ...(typeof prior.observed_at === 'string'
          ? { observed_at: prior.observed_at }
          : {}),
        // Do not backfill language proof onto an already-stored legacy observation during an exact
        // refresh; that could newly authorize a post-veto exception for evidence whose language was
        // never established when the person acted.
        ...(prior.source_is_english === true ? { source_is_english: true as const } : {}),
        ...(typeof prior.consumed_at === 'string' ? { consumed_at: prior.consumed_at } : {}),
        ...(typeof prior.human_action_id === 'string' ? { human_action_id: prior.human_action_id } : {}),
        ...(typeof prior.dismissed === 'boolean' ? { dismissed: prior.dismissed } : {}),
        ...(typeof prior.dismissed_at === 'string' ? { dismissed_at: prior.dismissed_at } : {}),
        ...(typeof prior.dismissed_by === 'string' ? { dismissed_by: prior.dismissed_by } : {}),
      })
    } else {
      byUrlRevision.set(urlRevisionKey, {
        inbox_id: `INB-${dateCompact}-${String(seq++).padStart(3, '0')}`,
        ...sourceFields,
        observed_at: mergedAt,
        ...(it.source_is_english === true ? { source_is_english: true as const } : {}),
        consumed: false,
        launched_signal_id: null,
        ...triageFields,
      })
    }
  }

  // rank by score; always keep consumed AND dismissed rows (human state is history — never evicted,
  // never resurrected by a re-seen URL), cap only the live unconsumed tail
  const all = [...byUrlRevision.values()]
  all.sort((a, b) => (b.triage_score ?? -1) - (a.triage_score ?? -1))
  const humanState = all.filter((r) => r.consumed || r.dismissed || r.launched_signal_id)
  // collapse duplicate STORIES before the cap, so one story never eats several inbox slots and the cap
  // counts distinct stories (news/dedup.ts). Ungrouped rows and run-touched groups pass through intact.
  const live = selectInboxRows(all.filter((r) => !r.consumed && !r.dismissed && !r.launched_signal_id), maxRows)
  const rows = [...humanState, ...live].sort((a, b) => (b.triage_score ?? -1) - (a.triage_score ?? -1))

  // preserve whatever the existing document carried (a manual sweep's focus_hint, its source label,
  // any future fields) — this merge only owns `rows` and the freshness stamps
  const doc = {
    ...existing,
    date,
    updated_at: mergedAt,
    focus_hint: (existing as any).focus_hint ?? null,
    source: (existing as any).source || 'auto_ingester',
    rows,
  }
  fs.mkdirSync(path.dirname(fp), { recursive: true })
  // atomic tmp+rename: this file is the ground truth for human state (consumed/dismissed) and is
  // read by the CLI sweep and the python board builder — neither may ever see a half-written file
  const tmpFp = `${fp}.tmp.${process.pid}`
  try {
    fs.writeFileSync(tmpFp, JSON.stringify(doc, null, 2) + '\n')
    fs.renameSync(tmpFp, fp)
  } finally {
    if (fs.existsSync(tmpFp)) fs.unlinkSync(tmpFp)
  }
  return rows.length
}

export function appendFirehoseSummary(repoRoot: string, date: string, summary: CycleSummary): void {
  const fp = firehosePath(repoRoot, date)
  try {
    fs.mkdirSync(path.dirname(fp), { recursive: true })
    fs.appendFileSync(fp, JSON.stringify({ kind: 'cycle_summary', ...summary }) + '\n')
  } catch {
    // a missed firehose line only loses a board counter for the cycle — never fail ingestion for it
  }
}

const execFileAsync = promisify(execFile)

/**
 * Rebuild the board index using the existing python script. Best-effort by default (logs but never
 * throws) — every auto-poll / best-effort caller relies on that so a rebuild hiccup never breaks the
 * click it rode in on. Pass `throwOnFailure: true` for a caller that must know the rebuild actually
 * happened (e.g. the manual "rebuild from ledger" endpoint) — it rethrows instead of swallowing, so the
 * caller can surface a real failure instead of quietly returning the stale, pre-rebuild index.
 */
// async execFile (never execFileSync — a multi-second rebuild must not block the event loop; see
// readiness.ts). Concurrent rebuilds are safe: the python script writes per-PID tmp + rename, and
// each rebuild is deterministic from the stores, so last-rename-wins converges to the truth.
export async function refreshBoard(repoRoot: string, log: (m: string) => void = () => {}, opts: { throwOnFailure?: boolean } = {}): Promise<void> {
  try {
    await execFileAsync('python3', [path.join(repoRoot, 'scripts', 'update_board_index.py')], { cwd: repoRoot, timeout: 60_000, maxBuffer: 8_000_000 })
  } catch (e: any) {
    log(`board refresh failed: ${e?.message || e}`)
    if (opts.throwOnFailure) throw e
  }
}
