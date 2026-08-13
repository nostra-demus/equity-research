// Data-needs reader — the SERVER-side authority over the `data_needs[]` a run's terminal synthesizer
// writes onto decision_record.json (frameworks/commodity/decision_record.schema.json; the "surface a data
// gap → build a durable connector → re-score" loop). It reads the latest run's decision_record for a
// subject and normalizes the array the same way readIntakePlan() treats a prompt-written plan — it does
// NOT trust the file:
//   1. VALIDATES every entry_module against the live roster (a hallucinated module name is dropped, noted
//      in `widened`) — so the cockpit can never light a module that isn't there (fail-closed, §26).
//   2. DROPS a structurally-invalid need (bad tier / cadence / need_id / missing series or source name)
//      rather than surface a malformed card — the same defensive posture the dock reads with (deploy-skew
//      fail-closed). `suggested_source.acquisition` alone is tolerant-labelled instead: an off-enum value
//      is display-only advisory metadata, and dropping the whole card for it silenced the very demand
//      signal this reader exists to surface (the ALUMINIUM run's two needs). The schema stays strict for
//      EMITTERS; the reader keeps the card with the closed sentinel 'unrecognized' + a widened note.
// It launches nothing and writes nothing. Returns null when there is no run or the record is unreadable,
// so the dock stays hidden rather than showing a fabricated need.
import fs from 'node:fs'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { REPO_ROOT } from './config'
import { builtBySatisfies, CADENCE_MS, healthyBuiltBySatisfies, listConnectors } from './connector-registry'
import { normalizeRecord } from './ledger-corrections'
import { resolveRunRoot } from './outputs'
import { latestNeedLookup, type NeedLookupView } from './pipeline-store'
import { agentNamesForModule, listModuleNames } from './roster'
import { resolveInsideAnalyses } from './sandbox'
import { RESEARCH_SWARM_ID, runRootForSubject, swarmById } from './swarms'
import { RUN_ROOT_RE } from './what-changed'
import { normalizeDataSubject } from './data-subject'

export interface DataNeedSource {
  name: string
  acquisition: string
  licensing?: string
  access?: 'public' | 'licensed' | 'restricted' | 'unknown'
  licensing_basis?: string
}
export interface DataNeedOrb {
  module: string
  agent: string
  why: string
  confidence: number
  // Frozen decisions retain the exact historical route even after the live roster is renamed.  This
  // projection is display-only: only `current` rows may feed a future rerun/build route.
  route_status?: 'current' | 'historical'
}
export interface DataNeedImpact {
  if_supportive: string
  if_adverse: string
}
export interface DataNeed {
  need_id: string
  series: string
  why_it_caps: string
  cap_lifted?: string
  priority?: number
  expected_impact?: DataNeedImpact
  entry_orbs?: DataNeedOrb[]
  filing_required: boolean
  entry_modules: string[]
  suggested_source: DataNeedSource
  tier: number
  cadence: string
  next_release?: string
  built_by?: string // the id of a .claude/connectors/<id> whose `satisfies` covers this need_id (loop closed)
  connector_exists?: string // code declares coverage, but may not be current/usable yet
  source_lookup?: NeedLookupView
}
export interface DataNeedsRead {
  contract_version: 'data-needs-read/2'
  subject: string
  swarm: string
  run_root: string
  decision_fingerprint: string
  decided_at: string // decision_record.json mtime, ISO — stamped by the reader, never trusted from the file
  needs: DataNeed[]
  widened: string[] // fail-closed audit trail (entry_modules dropped / needs dropped as malformed)
  data_needs_schema_version?: '2.0'
}

// The enums the decision_record schema pins — a connector-feedable tier is NEVER a filing (1-4); a scrape
// forces 9/10. Mirrored here so a malformed emit is dropped at read time, not surfaced.
const ACQUISITION = new Set(['official_api', 'free_key_api', 'paid_api', 'scrape', 'manual'])
const TIERS = new Set([5, 9, 10])
const CADENCE = new Set(Object.keys(CADENCE_MS))
const NEED_ID_RE = /^[a-z0-9][a-z0-9_-]*$/
const SOURCE_ACCESS = new Set(['public', 'licensed', 'restricted', 'unknown'])
const V2_NEED_KEYS = new Set([
  'need_id', 'priority', 'series', 'why_it_caps', 'expected_impact', 'filing_required', 'entry_orbs',
  'suggested_source', 'tier', 'cadence', 'next_release',
])
const V2_IMPACT_KEYS = new Set(['if_supportive', 'if_adverse'])
const V2_ORB_KEYS = new Set(['module', 'agent', 'why', 'confidence'])
const V2_SOURCE_KEYS = new Set(['name', 'acquisition', 'access', 'licensing_basis'])
const V2_REQUIRED_FROM = '2026-08-14'
// Exact TypeScript mirror of scripts/data_need_contract.py: v2 prose may name a publisher, never embed
// an endpoint/IP/hostname which bypasses the server-owned lookup and URL admission path.
const DATA_NEED_URL_RE = /(?:\b[a-z][a-z0-9+.-]{1,31}:\/\/\S+|\bwww\.\S+|\b(?:\d{1,3}\.){3}\d{1,3}(?::\d{2,5})?(?:\/[^\s]*)?|\b(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}(?::\d{2,5})?(?:\/[^\s]*)?)/i
const DECISION_LABEL_RE = String.raw`(?:Strong\s+Buy|Buy|Hold|Trim|Avoid|Starter\s+Position\s+Only|Watchlist|Short\s+Candidate|Pair\s+Trade(?:\s*\/\s*Hedge\s+Required)?|Insufficient\s+Data(?:\s*[—-]\s*Refuse\s+To\s+Rate)?|Research\s+More)`
const PROMISE_WORD_RE = String.raw`(?:guarantee(?:d|s|ing)?|assure(?:d|s|ing)?|ensure(?:d|s|ing)?|promis(?:e|es|ed|ing)|certainly)`
const INVESTMENT_CONFIDENCE_RE = String.raw`(?<!consumer\s)(?<!business\s)(?<!survey\s)confidence`
const INVESTMENT_MEASURE_RE = String.raw`(?:conviction|${INVESTMENT_CONFIDENCE_RE}|score)`
const INVESTMENT_RATING_RE = String.raw`(?<!credit\s)(?<!issuer\s)(?<!sovereign\s)(?<!bond\s)rating(?![-\s](?:data|history|agency|feed|series|update|updates|coverage|methodology)\b)`
const INVESTMENT_UPGRADE_RE = String.raw`(?<!api\s)(?<!feed\s)(?<!schema\s)(?<!system\s)(?<!service\s)(?<!software\s)(?<!connector\s)(?:upgrade|downgrade)(?!\s+(?:to|of|for)\s+(?:the\s+)?(?:api|feed|connector|dataset|schema|system|service|software)\b)`
const THESIS_OUTCOME_RE = String.raw`(?:thesis|investment\s+(?:case|thesis)|(?:bull|bear|base)\s+case)`
const RATING_THESIS_RE = String.raw`(?:${DECISION_LABEL_RE})\s+thesis`
const DATA_CONTEXT_RE = String.raw`(?:field|data|series|schema|value|values|column|columns|history|feed|coverage|completeness|delivery)`
const INVESTMENT_RETURN_OUTCOME_RE = String.raw`(?:(?:positive\s+)?returns?|upside|outperformance|alpha|rally|profits?|gains?|downside|price\s+target)(?![-\s]${DATA_CONTEXT_RE}\b)`
const OUTCOME_NOUN_RE = String.raw`(?:conviction|${INVESTMENT_CONFIDENCE_RE}|score|${INVESTMENT_RATING_RE}|decision|action|call|conclusion|${INVESTMENT_UPGRADE_RE}|${THESIS_OUTCOME_RE}|${INVESTMENT_RETURN_OUTCOME_RE}|${DECISION_LABEL_RE})`
const EVIDENCE_SUBJECT_RE = String.raw`(?:(?:(?:supportive|adverse|new|additional)\s+)?(?:data|evidence|source|observation|series|filing|release|print|result)|this)`
// Keep this corpus in semantic parity with scripts/data_need_contract.py. It rejects promises about the
// investment call while allowing ordinary domain statements such as “the OPEC production cap will
// increase” and “Certain evidence required for the rating is unavailable.”
const DATA_NEED_GUARANTEE_RE = new RegExp([
  String.raw`\b${PROMISE_WORD_RE}\b[^.;\n]{0,80}\b${OUTCOME_NOUN_RE}\b`,
  String.raw`\b${OUTCOME_NOUN_RE}\b[^.;\n]{0,80}\b${PROMISE_WORD_RE}\b`,
  String.raw`\b(?:conviction|confidence|rating|decision|action|${DECISION_LABEL_RE})\s+(?:is|becomes?|was\s+made)\s+certain\b`,
  String.raw`\bmakes?\s+(?:the\s+)?(?:conviction|confidence|rating|decision|action|call|conclusion|${THESIS_OUTCOME_RE}|${INVESTMENT_RETURN_OUTCOME_RE})\s+certain\b`,
  String.raw`\b${EVIDENCE_SUBJECT_RE}\b[^.;\n]{0,50}\b(?:raises?|increases?|improves?|lifts?|boosts?|strengthens?|enhances?|sharpens?|upgrades?|downgrades?)\s+(?:the\s+)?(?:${INVESTMENT_MEASURE_RE}|${INVESTMENT_RATING_RE})\b`,
  String.raw`\b${EVIDENCE_SUBJECT_RE}\b[^.;\n]{0,50}\b(?:makes?|renders?)\s+(?:the\s+)?(?:call|conclusion|decision|action|${THESIS_OUTCOME_RE})\s+certain\b`,
  String.raw`\b${EVIDENCE_SUBJECT_RE}\b[^.;\n]{0,50}\bmakes?\s+(?:us\s+)?(?:fully|completely|absolutely)\s+confident\b`,
  String.raw`\b${EVIDENCE_SUBJECT_RE}\b[^.;\n]{0,50}\b(?:removes?|eliminates?)\s+(?:all|any)\s+(?:investment\s+)?(?:uncertainty|doubt)\b`,
  String.raw`\b${EVIDENCE_SUBJECT_RE}\b[^.;\n]{0,50}\b(?:would\s+)?leaves?\s+no\s+doubt\b[^.;\n]{0,40}\b(?:call|conclusion|decision|action|rating|${THESIS_OUTCOME_RE})\b`,
  String.raw`\b${EVIDENCE_SUBJECT_RE}\b[^.;\n]{0,50}\bmeans?\s+(?:that\s+)?there\s+(?:is|will\s+be)\s+no\s+(?:downside|investment\s+risk|risk\s+of\s+loss)\b`,
  String.raw`\b(?:proves?|confirms?|validates?|establishes?)\s+(?:an?\s+|the\s+)?(?:${THESIS_OUTCOME_RE}|${RATING_THESIS_RE}|${DECISION_LABEL_RE})\b`,
  String.raw`\b(?:locks?\s+in|forces?|compels?)\s+(?:an?\s+|the\s+)?(?:${INVESTMENT_UPGRADE_RE}|${DECISION_LABEL_RE})\b`,
  String.raw`\b(?:automatically\s+)?makes?\s+(?:it|the\s+(?:decision|rating|action|call))\s+(?:an?\s+)?${DECISION_LABEL_RE}\b`,
  String.raw`\bmeans?\s+(?:that\s+)?(?:we|investors?|the\s+(?:system|decision|rating|action))\s+must\s+${DECISION_LABEL_RE}\b`,
  String.raw`\b${EVIDENCE_SUBJECT_RE}\b[^.;\n]{0,50}\b(?:gives?|provides?|creates?)\s+(?:complete|full|absolute)\s+(?:${INVESTMENT_CONFIDENCE_RE}|conviction|certainty)\b`,
  String.raw`\b${EVIDENCE_SUBJECT_RE}\b[^.;\n]{0,50}\b(?:implies?|provides?|gives?|creates?)\s+(?:an?\s+)?(?:1(?:\.0+)?|100(?:\.0+)?)\s+(?:${INVESTMENT_CONFIDENCE_RE}|conviction|certainty)\b`,
  String.raw`\b(?:will|would|should|shall|must|is\s+expected\s+to|promis(?:e|es|ed|ing)\s+to)\s+(?:automatically\s+)?(?:lift|raise|increase|boost|improve|add\s+to)\s+(?:the\s+)?${INVESTMENT_MEASURE_RE}\b`,
  String.raw`\b${INVESTMENT_MEASURE_RE}\s+(?:will|would|should|shall|must|is\s+expected\s+to)\s+(?:automatically\s+)?(?:rise|increase|improve|lift)\b`,
  String.raw`\b(?:will|would|should|shall|must|is\s+expected\s+to)\s+(?:automatically\s+)?(?:upgrade|downgrade|change|move|set)\s+(?:the\s+)?(?:rating|decision|action)\s+(?:from\s+${DECISION_LABEL_RE}\s+)?to\s+${DECISION_LABEL_RE}\b`,
  String.raw`\b(?:lift|raise|increase|boost|improve|add\s+to)\s+(?:the\s+)?(?:${INVESTMENT_MEASURE_RE}|rating)\s+(?:by|to|from)\s*[+\-]?\d+(?:\.\d+)?\s*(?:%|percent|points?|pts?|bps?|bp)?\b`,
  String.raw`\b(?:${INVESTMENT_MEASURE_RE}|rating)\s+(?:rises?|increases?|improves?|lifts?|moves?|goes?)\s+(?:from\s+[+\-]?\d+(?:\.\d+)?\s+(?:to\s+)?|(?:by|to)\s+)[+\-]?\d+(?:\.\d+)?\s*(?:%|percent|points?|pts?|bps?|bp)?\b`,
  String.raw`\b[+\-]?\d+(?:\.\d+)?[- ](?:point|pt|bp|percent(?:age)?[- ]point)s?\s+(?:${INVESTMENT_MEASURE_RE}|rating)\s+(?:lift|increase|boost|raise)\b`,
  String.raw`\b[+\-]?\d+(?:\.\d+)?\s*(?:%|\bpercent\b)[^.;\n]{0,30}\b(?:${INVESTMENT_CONFIDENCE_RE}|conviction|certainty|confident|certain)\b(?!\s+(?:interval|level|band|bounds?)\b)`,
  String.raw`\b(?:${INVESTMENT_CONFIDENCE_RE}|conviction|certainty|confident|certain)\b(?!\s+(?:interval|level|band|bounds?)\b)[^.;\n]{0,30}\b[+\-]?\d+(?:\.\d+)?\s*(?:%|\bpercent\b)`,
].join('|'), 'i')

function plainText(v: unknown): string {
  return typeof v === 'string' ? v.trim() : ''
}

function exactKeys(value: unknown, allowed: Set<string>): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
    && Object.keys(value).every((key) => allowed.has(key))
}

function calendarDate(value: unknown): value is string {
  if (typeof value !== 'string') return false
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return false
  const year = Number(match[1]); const month = Number(match[2]); const day = Number(match[3])
  return month >= 1 && month <= 12 && day >= 1 && day <= new Date(Date.UTC(year, month, 0)).getUTCDate()
}

function containsUrlLike(value: unknown): boolean {
  if (typeof value === 'string') return DATA_NEED_URL_RE.test(value)
  if (Array.isArray(value)) return value.some(containsUrlLike)
  return !!value && typeof value === 'object' && Object.values(value).some(containsUrlLike)
}

function v2NarrativeSafe(need: Record<string, any>): boolean {
  if (containsUrlLike(need)) return false
  const impact = need.expected_impact && typeof need.expected_impact === 'object' ? need.expected_impact : {}
  const narratives = [need.why_it_caps, impact.if_supportive, impact.if_adverse]
  if (Array.isArray(need.entry_orbs)) narratives.push(...need.entry_orbs.map((orb: any) => orb?.why))
  return narratives.every((value) => typeof value !== 'string' || !DATA_NEED_GUARANTEE_RE.test(value))
}

function relativeRunRoot(runRootAbs: string): string {
  // realpath both sides so macOS's /var -> /private/var alias cannot turn a contained temp-fixture root
  // into a misleading ../../ path. Production output stays the same canonical repo-relative path.
  const root = (() => { try { return fs.realpathSync(REPO_ROOT) } catch { return path.resolve(REPO_ROOT) } })()
  const run = (() => { try { return fs.realpathSync(runRootAbs) } catch { return path.resolve(runRootAbs) } })()
  return path.relative(root, run).split(path.sep).join('/')
}

function pathContained(child: string, parent: string): boolean {
  const rel = path.relative(parent, child)
  return rel === '' || (!path.isAbsolute(rel) && rel !== '..' && !rel.startsWith(`..${path.sep}`))
}

function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`
  if (value && typeof value === 'object') {
    return `{${Object.keys(value as Record<string, unknown>).sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalJson((value as Record<string, unknown>)[key])}`).join(',')}}`
  }
  return JSON.stringify(value)
}

function fingerprintDecision(runRoot: string, record: unknown): string {
  return `sha256:${createHash('sha256').update(`${runRoot}\n${canonicalJson(record)}`, 'utf8').digest('hex')}`
}

function regularDecisionFile(runRootAbs: string): { file: string; mtime: string; text: string } | null {
  const file = path.join(runRootAbs, 'decision_record.json')
  try {
    // Reject both a run-dir link and a decision-file link. A manifest or historical selector can name a
    // real directory only; neither may redirect this reader after its containment check.
    if (fs.lstatSync(runRootAbs).isSymbolicLink() || fs.lstatSync(file).isSymbolicLink()) return null
    if (!fs.statSync(runRootAbs).isDirectory() || !fs.statSync(file).isFile()) return null
    const realFile = fs.realpathSync(file)
    if (path.dirname(realFile) !== fs.realpathSync(runRootAbs) || path.basename(realFile) !== 'decision_record.json') return null
    return { file: realFile, mtime: fs.statSync(realFile).mtime.toISOString(), text: fs.readFileSync(realFile, 'utf8') }
  } catch {
    return null
  }
}

/** The rollout gate requires both immutable publication evidence and that publication's own cutoff date. */
function v2RequiredByPublication(swarmId: string, runRootAbs: string, raw: Record<string, any>): boolean {
  if (swarmId === RESEARCH_SWARM_ID) {
    const match = /_(\d{4}-\d{2}-\d{2})$/.exec(path.basename(runRootAbs))
    return !!match && match[1] >= V2_REQUIRED_FROM
  }
  // Commodity-style current projections are publication-backed only after the archive helper has assigned
  // a content id and written the matching immutable snapshot. The archive proves publication; its matching
  // decision_date applies the rollout cutoff. Neither a mutable date nor a legacy pre-cutoff archive alone
  // can require v2.
  const id = typeof raw.decision_id === 'string' ? raw.decision_id : ''
  if (!/^[A-Z]+-[A-Z0-9_-]+-\d{4}-\d{2}-\d{2}-[a-f0-9]{12}$/.test(id)) return false
  const archived = path.join(runRootAbs, 'decisions', id, 'decision_record.json')
  try {
    if (fs.lstatSync(archived).isSymbolicLink() || !fs.statSync(archived).isFile()) return false
    const parsed = JSON.parse(fs.readFileSync(archived, 'utf8'))
    return canonicalJson(parsed) === canonicalJson(raw)
      && typeof parsed.decision_date === 'string' && parsed.decision_date >= V2_REQUIRED_FROM
  } catch {
    return false
  }
}

/**
 * Resolve the exact run whose needs may be served. Research mirrors the decision banner: a missing
 * selector means the standing completed run, while an explicit historical selector must be one exact
 * analyses/<SUBJECT>_<DATE> folder. Other swarms keep their manifest-owned singleton run root; a caller
 * can echo that server-stamped root but cannot override it.
 */
export function resolveDataNeedsRunRoot(swarmId: string, subject: string, requestedRunRoot?: string): string | null {
  const normalizedSubject = normalizeDataSubject(swarmId, subject)
  if (!normalizedSubject) return null
  if (swarmId === RESEARCH_SWARM_ID) {
    if (requestedRunRoot !== undefined
        && (!RUN_ROOT_RE.test(requestedRunRoot) || !requestedRunRoot.startsWith(`analyses/${normalizedSubject}_`))) return null
    const runRoot = resolveRunRoot({
      runRoot: requestedRunRoot,
      ticker: normalizedSubject,
      preferComplete: true,
    })
    if (!runRoot || !RUN_ROOT_RE.test(runRoot) || !runRoot.startsWith(`analyses/${normalizedSubject}_`)) return null
    try {
      const resolved = resolveInsideAnalyses(runRoot)
      // A same-sandbox symlink named for this subject must not redirect the reader to another subject.
      const unresolved = path.resolve(REPO_ROOT, runRoot)
      if (fs.lstatSync(unresolved).isSymbolicLink() || resolved !== fs.realpathSync(unresolved)
          || path.basename(resolved) !== path.basename(runRoot) || !fs.statSync(resolved).isDirectory()) return null
      return resolved
    } catch {
      return null
    }
  }

  const swarm = swarmById(swarmId)
  if (!swarm) return null
  const expected = runRootForSubject(swarm, normalizedSubject)?.split(path.sep).join('/')
  if (!expected || path.isAbsolute(expected)) return null
  if (requestedRunRoot !== undefined && requestedRunRoot !== expected) return null
  const manifestRoot = path.resolve(REPO_ROOT, expected)
  const declaredRunsRoot = path.resolve(REPO_ROOT, swarm.runsRoot)
  if (!pathContained(manifestRoot, declaredRunsRoot) || !pathContained(declaredRunsRoot, path.resolve(REPO_ROOT))) return null
  try {
    if (fs.lstatSync(declaredRunsRoot).isSymbolicLink() || fs.lstatSync(manifestRoot).isSymbolicLink()
        || !fs.statSync(manifestRoot).isDirectory()) return null
    const realRoot = fs.realpathSync(manifestRoot)
    const realRuns = fs.realpathSync(declaredRunsRoot)
    const realRepo = fs.realpathSync(REPO_ROOT)
    if (!pathContained(realRuns, realRepo) || !pathContained(realRoot, realRuns)) return null
    return realRoot
  } catch {
    return null
  }
}

export function readDataNeeds(swarmId: string, subject: string, requestedRunRoot?: string): DataNeedsRead | null {
  const runRootAbs = resolveDataNeedsRunRoot(swarmId, subject, requestedRunRoot)
  if (!runRootAbs) return null
  const decisionFile = regularDecisionFile(runRootAbs)
  if (!decisionFile) return null

  let parsed: any
  try {
    parsed = JSON.parse(decisionFile.text)
  } catch {
    return null // no record / unreadable / malformed → dock hidden, never a fabricated need
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null
  const runRoot = relativeRunRoot(runRootAbs)
  // Research has an append-only correction projection. Read the same effective record as the other
  // research views; commodity/current swarm projections remain their exact archived bytes.
  const raw = swarmId === RESEARCH_SWARM_ID ? normalizeRecord(runRoot, parsed) : parsed
  const decisionFingerprint = fingerprintDecision(runRoot, raw)

  const modules = new Set(listModuleNames(swarmId))
  const explicitVersion = raw.data_needs_schema_version
  if (explicitVersion !== undefined && explicitVersion !== '2.0') return null
  if (explicitVersion === undefined && v2RequiredByPublication(swarmId, runRootAbs, raw)) {
    return {
      contract_version: 'data-needs-read/2',
      subject: subject.toUpperCase(),
      swarm: swarmId,
      run_root: runRoot,
      decision_fingerprint: decisionFingerprint,
      decided_at: decisionFile.mtime,
      needs: [],
      widened: [`data_needs_schema_version 2.0 is required for this post-${V2_REQUIRED_FROM} publication — no needs served`],
    }
  }
  const v2 = explicitVersion === '2.0'
  const exists = builtBySatisfies(listConnectors().filter((c) => c.subjects.includes(subject.toUpperCase())))
  const built = healthyBuiltBySatisfies(subject.toUpperCase())
  const widened: string[] = []
  const seen = new Set<string>()
  const arr: any[] = Array.isArray(raw.data_needs) ? raw.data_needs : []
  const needs: DataNeed[] = []
  const seenPriorities = new Set<number>()
  const agentsByModule = new Map([...modules].map((module) => [module, new Set(agentNamesForModule(module, swarmId))]))
  let invalidV2PriorityShape = false

  if (v2) {
    if (!Array.isArray(raw.data_needs)) widened.push('data_needs v2 is not an array — no needs served')
    if (arr.length > 5) widened.push('data_needs v2 exceeds five needs — no needs served')
    const priorities = arr.map((need) => need?.priority)
    const needIds = arr.map((need) => need?.need_id).filter((needId) => typeof needId === 'string')
    invalidV2PriorityShape = !Array.isArray(raw.data_needs) || arr.length > 5
      || priorities.some((priority) => !Number.isInteger(priority) || priority < 1 || priority > 5)
      || new Set(priorities).size !== priorities.length
      || priorities.some((priority, index) => priority !== index + 1)
      || needIds.length !== new Set(needIds).size
    if (invalidV2PriorityShape && Array.isArray(raw.data_needs) && arr.length <= 5) {
      widened.push('data_needs v2 priorities must be unique and contiguous from 1, and need ids must be unique — no needs served')
    }
  }

  for (const n of arr) {
    if (!n || typeof n !== 'object') continue
    const need_id = String(n.need_id ?? '')
    if (!NEED_ID_RE.test(need_id) || seen.has(need_id)) {
      widened.push(`dropped a data_need with a bad or duplicate need_id (${JSON.stringify(n.need_id)})`)
      continue
    }
    const src = n.suggested_source && typeof n.suggested_source === 'object' && !Array.isArray(n.suggested_source)
      ? n.suggested_source : {}
    let acquisition = String(src.acquisition ?? '')
    const tier = typeof n.tier === 'number' ? n.tier : NaN
    const cadence = String(n.cadence ?? '')
    // Fail closed on STRUCTURAL defects: a need whose tier/cadence violate the schema enums (they carry
    // the §4 ceiling and the connector-eligibility read) or that lacks a series/source name is dropped.
    if (!n.series || !TIERS.has(tier) || !CADENCE.has(cadence) || !String(src.name ?? '')) {
      widened.push(`${need_id}: dropped (source, tier ${tier}, or cadence outside the allowed set)`)
      continue
    }
    let priority: number | undefined
    let expected_impact: DataNeedImpact | undefined
    let entry_orbs: DataNeedOrb[] | undefined
    if (v2) {
      if (!exactKeys(n, V2_NEED_KEYS)) {
        widened.push(`${need_id}: dropped (unexpected v2 need field)`)
        continue
      }
      if (!v2NarrativeSafe(n)) {
        widened.push(`${need_id}: dropped (v2 contains a URL or promises a conviction, score, or rating lift)`)
        continue
      }
      priority = typeof n.priority === 'number' ? n.priority : undefined
      const impact: Record<string, unknown> = n.expected_impact && typeof n.expected_impact === 'object'
        && !Array.isArray(n.expected_impact) ? n.expected_impact as Record<string, unknown> : {}
      const supportive = plainText(impact.if_supportive)
      const adverse = plainText(impact.if_adverse)
      const access = plainText(src.access)
      const licensingBasis = plainText(src.licensing_basis)
      if (!Number.isInteger(priority) || priority! < 1 || priority! > 5 || seenPriorities.has(priority!)
          || !plainText(n.series) || !plainText(n.why_it_caps) || typeof n.filing_required !== 'boolean'
          || !exactKeys(impact, V2_IMPACT_KEYS) || !supportive || !adverse
          || !exactKeys(src, V2_SOURCE_KEYS) || !plainText(src.name) || !ACQUISITION.has(acquisition)
          || !SOURCE_ACCESS.has(access) || !licensingBasis
          || (Object.hasOwn(n, 'next_release')
            && (!calendarDate(n.next_release) || !calendarDate(raw.decision_date) || n.next_release < raw.decision_date))
          || !Array.isArray(n.entry_orbs) || n.entry_orbs.length === 0) {
        widened.push(`${need_id}: dropped (invalid v2 priority, impact, source hint, or entry_orbs)`)
        continue
      }
      seenPriorities.add(priority!)
      expected_impact = { if_supportive: supportive, if_adverse: adverse }
      entry_orbs = []
      const seenOrbs = new Set<string>()
      for (const rawOrb of n.entry_orbs) {
        const module = plainText(rawOrb?.module)
        const agent = plainText(rawOrb?.agent)
        const why = plainText(rawOrb?.why)
        const confidence = rawOrb?.confidence
        const orbKey = JSON.stringify([module, agent])
        if (!exactKeys(rawOrb, V2_ORB_KEYS) || !module || !agent || !why
            || typeof confidence !== 'number' || !Number.isFinite(confidence)
            || confidence < 0 || confidence > 1 || seenOrbs.has(orbKey)) {
          widened.push(`${need_id}: dropped invalid entry_orb '${module}/${agent}'`)
          continue
        }
        seenOrbs.add(orbKey)
        const current = modules.has(module) && agentsByModule.get(module)?.has(agent)
        if (!current) widened.push(`${need_id}: historical entry_orb '${module}/${agent}' is no longer rerunnable`)
        entry_orbs.push({ module, agent, why, confidence, route_status: current ? 'current' : 'historical' })
      }
      if (!entry_orbs.length) {
        widened.push(`${need_id}: dropped (no structurally valid entry_orbs remain)`)
        continue
      }
    }
    // Tolerant-labelled on acquisition alone: keep the card, serve the closed sentinel (never the raw
    // string — nothing unvetted leaks to the client), and audit the defect.
    if (!v2 && !ACQUISITION.has(acquisition)) {
      widened.push(`${need_id}: acquisition '${acquisition}' outside the schema enum — kept, labelled unrecognized`)
      acquisition = 'unrecognized'
    }
    // entry_modules validated against the live roster — a hallucinated module is dropped (never lit).
    const authoredModules = v2
      ? [...new Set(entry_orbs!.filter((orb) => orb.route_status === 'current').map((orb) => orb.module))]
      : (Array.isArray(n.entry_modules) ? n.entry_modules.map(String) : [])
    const entry_modules = authoredModules.filter((m: string) => {
      const ok = modules.has(m)
      if (!ok) widened.push(`${need_id}: dropped entry_module '${m}' (not in the ${swarmId} roster)`)
      return ok
    })
    seen.add(need_id)
    const need: DataNeed = {
      need_id,
      series: v2 ? plainText(n.series) : String(n.series),
      why_it_caps: v2 ? plainText(n.why_it_caps) : String(n.why_it_caps ?? ''),
      ...(v2 ? { priority, expected_impact, entry_orbs } : {
        cap_lifted: n.cap_lifted ? String(n.cap_lifted) : undefined,
      }),
      filing_required: n.filing_required === true,
      entry_modules,
      suggested_source: {
        name: v2 ? plainText(src.name) : String(src.name),
        acquisition,
        ...(v2 ? {
          access: src.access as DataNeedSource['access'],
          licensing_basis: plainText(src.licensing_basis),
        } : {
          licensing: src.licensing ? String(src.licensing) : undefined,
        }),
      },
      tier,
      cadence,
      next_release: n.next_release ? String(n.next_release) : undefined,
      built_by: built.get(need_id),
      connector_exists: exists.get(need_id),
      source_lookup: latestNeedLookup({
        swarm: swarmId, subject, run_root: runRoot, decision_fingerprint: decisionFingerprint,
        need_id, series: v2 ? plainText(n.series) : String(n.series), cadence,
      }),
    }
    needs.push(need)
  }

  if (v2) {
    if (invalidV2PriorityShape || needs.some((need, i) => need.priority !== i + 1)) {
      widened.push('data_needs v2 priorities are not contiguous — no needs served')
      needs.length = 0
    }
  }

  return {
    contract_version: 'data-needs-read/2',
    subject: subject.toUpperCase(),
    swarm: swarmId,
    run_root: runRoot,
    decision_fingerprint: decisionFingerprint,
    decided_at: decisionFile.mtime,
    needs,
    widened,
    ...(v2 ? { data_needs_schema_version: '2.0' as const } : {}),
  }
}
