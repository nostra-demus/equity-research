import fs from 'node:fs'
import path from 'node:path'
import { ACTIVITY_LOG_PATH, STATE_DIR } from './config'
import { RUN_KINDS, RUN_STATUSES, type RunKind, type RunStatus } from './types'
import type { ProviderExecutionProfile, RunProvider } from './providers/types'

// Perpetual, append-only audit log of who ran what, when, on which company. One JSON object per line
// (JSONL). Never rotated or truncated, so the full history is always recoverable. A run writes a
// `launched` line when it spawns and a `finished` line when it ends; the read API folds the two by
// runId into one row. Identity comes from Cloudflare Access (the engine sits behind it), falling back
// to "local" for direct/dev access.

export type ActivityEventType = 'launched' | 'finished'

// The run kinds the /api/activity `kind` filter accepts — EVERY RunKind that can land in the log. Kept here
// (not inline in the route) so it is unit-testable and cannot silently omit a newly-added kind: `doc-intake`
// was missing, so a ?kind=doc-intake filter was quietly dropped and returned an unfiltered list. Must list
// every value of the RunKind union (types.ts).
export const ACTIVITY_FILTER_KINDS: readonly RunKind[] = RUN_KINDS
export const ACTIVITY_FILTER_STATUSES: readonly RunStatus[] = RUN_STATUSES

export interface ActivityEvent {
  v: 1
  ts: number // epoch ms
  event: ActivityEventType
  runId: string
  user: string // authenticated email, or "local" (dev / direct)
  userVia: 'cf-access' | 'local'
  kind: RunKind // full | module | agent | rerun
  ticker: string
  swarm?: string // swarm id ('research' default, or a SWARM.md id like 'commodity') — lets Resume route the relaunch
  chained?: boolean // this run is a step of a chained full run — Resume continues the WHOLE pipeline, not just this step
  chainId?: string
  executionEpoch?: string
  runRoot?: string // repo-relative run folder (launched event) — lets the activity row open the run's reports
  module?: string
  agent?: string
  provider?: RunProvider // absent on legacy v1 rows; historical rows were all Claude
  executionProfile?: ProviderExecutionProfile
  profileKey?: string
  model?: string
  reasoningLevel?: string
  cliVersion?: string
  // finished-only
  status?: RunStatus
  costUsd?: number
  durationMs?: number
  numTurns?: number
  note?: string // e.g. why a run ended incomplete
  // The Claude Code session id — the SAME id that names the committed agent_metrics.<id>.json. Without
  // it there is NO key joining a run's committed artifact to the row that says why it stopped, which is
  // why diagnosing the 2026-08 module stalls needed a +/-12h time-window guess instead of a lookup.
  sessionId?: string
  // The CLI's own final verdict. The engine used to read cost/turns/duration off the `result` message
  // and DISCARD these — on a clean exit they were never recorded anywhere. They are the only fields
  // that separate "the orchestrator finished early on its own" from "a cap or API error stopped it".
  // Structural only: no free text, so nothing to redact and no way to leak a secret into the audit log.
  cliResult?: { subtype?: string; isError?: boolean; apiErrorStatus?: number }
}

// One run, folded from its launched (+ optional finished) events for the activity table.
export interface ActivityRow {
  runId: string
  user: string
  userVia: 'cf-access' | 'local'
  kind: RunKind
  ticker: string // the run's SUBJECT id: a ticker for research, a SIG-… id (or thesisId::TICKER) for swarm runs
  subjectLabel?: string // human-readable subject for the Company column — the company/headline a SIG-… run
  // concerns, or the target ticker of a handoff. Absent when the raw ticker is already the best label.
  swarm?: string // swarm id (from the launched event) — routes a Resume relaunch to the right swarm
  chained?: boolean // this run was a step of a chained full run — Resume continues the whole pipeline
  chainId?: string
  executionEpoch?: string
  runRoot?: string // repo-relative run folder (from the launched event) — drives the row's "open reports" menu
  module?: string
  agent?: string
  provider: RunProvider
  executionProfile?: ProviderExecutionProfile
  profileKey?: string
  model?: string
  reasoningLevel?: string
  cliVersion?: string
  launchedAt: number
  finishedAt?: number
  status: RunStatus // from the finished event; 'running' if none yet
  costUsd?: number
  durationMs?: number
  numTurns?: number
  note?: string
}

function append(ev: ActivityEvent) {
  if (process.env.ENGINE_ACTIVITY_LOG_DISABLED === '1') return // tests: keep the perpetual audit log free of fixture runs
  try {
    fs.mkdirSync(STATE_DIR, { recursive: true })
    fs.appendFileSync(ACTIVITY_LOG_PATH, JSON.stringify(ev) + '\n')
  } catch {
    // never let audit-logging break a run; a failed append is logged to stderr only
    // eslint-disable-next-line no-console
    console.error('[activity-log] append failed for run', ev.runId)
  }
}

export function logLaunch(e: Omit<ActivityEvent, 'v' | 'event' | 'ts'>) {
  append({ v: 1, event: 'launched', ts: Date.now(), ...e })
}

export function logFinish(e: Omit<ActivityEvent, 'v' | 'event' | 'ts'>) {
  append({ v: 1, event: 'finished', ts: Date.now(), ...e })
}

export interface ActivityQuery {
  from?: number // epoch ms (inclusive)
  to?: number // epoch ms (inclusive)
  ticker?: string
  /** Internal batch filter. The public route continues to expose the single-ticker query above. */
  tickers?: readonly string[]
  kind?: RunKind
  user?: string
  status?: RunStatus
  provider?: RunProvider
  q?: string // free-text across user/ticker/module/agent
  /** Rows returned (default 500). `null` is an internal no-truncation sentinel used only after a
   * narrowly scoped ticker filter; HTTP callers never receive this capability. */
  limit?: number | null
}

export interface ActivityResult {
  rows: ActivityRow[]
  total: number // rows matching the filter (before limit)
  allTime: number // total runs ever recorded
  /** Non-blank JSONL records that could not satisfy the v1 runtime contract. Additive API diagnostic;
   * callers that use the ledger as a publication clock must treat any non-zero value as incomplete. */
  invalid_event_count?: number
  users: string[] // distinct users (for the filter dropdown)
  tickers: string[] // distinct subject ids (the Company filter dropdown's values)
  tickerLabels: Record<string, string> // subject id -> human-readable label, for the rows/dropdown that have one
  earliest: number | null // ts of the first record ever (perpetual-history anchor)
}

// Translate a run's raw SUBJECT id into a human-readable label for the Company column. Research runs
// already carry a real ticker (returns undefined — the ticker is the label). Swarm runs carry an
// opaque subject id: a SIG-… signal id, resolved via `sigLabels` (the company/headline it concerns,
// built by the caller from the swarm's event ledger), or a `thesisId::TICKER` handoff id, whose
// company is the part after "::". Returns undefined when nothing better than the raw id is known.
export function resolveSubjectLabel(ticker: string, sigLabels?: Map<string, string>): string | undefined {
  if (typeof ticker !== 'string' || !ticker) return undefined
  const fromLedger = sigLabels?.get(ticker)
  if (fromLedger) return fromLedger
  const sep = ticker.indexOf('::')
  if (sep >= 0) return ticker.slice(sep + 2) || undefined
  return undefined
}

const ACTIVITY_EVENT_TYPES = new Set<ActivityEventType>(['launched', 'finished'])
const ACTIVITY_USER_VIA = new Set<ActivityEvent['userVia']>(['cf-access', 'local'])
const ACTIVITY_RUN_STATUSES = new Set<RunStatus>(RUN_STATUSES)

function validOptionalString(value: unknown): boolean {
  return value === undefined || typeof value === 'string'
}

function canonicalIdentity(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && value === value.trim()
}

function validExecutionProfile(value: unknown): value is ProviderExecutionProfile {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const profile = value as Record<string, unknown>
  const allowed = new Set(['key', 'parentModel', 'parentReasoning', 'specialistModel', 'specialistReasoning'])
  if (Object.keys(profile).some((key) => !allowed.has(key))) return false
  if (!canonicalIdentity(profile.key)) return false
  return [profile.parentModel, profile.parentReasoning, profile.specialistModel, profile.specialistReasoning]
    .every((field) => field === undefined || canonicalIdentity(field))
}

function activityRunIdentityMatches(event: Record<string, unknown>): boolean {
  if (event.runRoot === undefined) return true
  const runRoot = event.runRoot as string
  const researchRoot = /^analyses\/([-A-Z0-9.]+)_\d{4}-\d{2}-\d{2}$/.exec(runRoot)
  // The folder is the durable authority. An explicit foreign swarm cannot turn a research terminal row
  // invisible, and the ticker must name the same issuer as the dated analysis folder.
  if (researchRoot) {
    return researchRoot[1] === (event.ticker as string).toUpperCase() &&
      (event.swarm === undefined || event.swarm === 'research')
  }
  const publicationKind = event.kind === 'full' || event.kind === 'rerun' || event.chained === true
  // New research publication rows always use an analyses/<TICKER>_<DATE> root. Preserve old finish rows
  // with no swarm (their launch supplies the identity), including commodity runs, but reject an explicit
  // research publication whose folder contradicts that declaration.
  return !(publicationKind && event.swarm === 'research')
}

/** JSONL is an external persistence boundary. Validate every required field before folding so a
 * syntactically valid legacy/torn row can neither throw during label resolution nor manufacture a
 * publication clock. Optional fields are also type-checked because they flow into the public API. */
function isActivityEvent(value: unknown): value is ActivityEvent {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const event = value as Record<string, unknown>
  if (event.v !== 1 || !ACTIVITY_EVENT_TYPES.has(event.event as ActivityEventType)) return false
  if (typeof event.ts !== 'number' || !Number.isFinite(event.ts)) return false
  if (!canonicalIdentity(event.runId)) return false
  if (!canonicalIdentity(event.user)) return false
  if (!ACTIVITY_USER_VIA.has(event.userVia as ActivityEvent['userVia'])) return false
  if (!ACTIVITY_FILTER_KINDS.includes(event.kind as RunKind)) return false
  if (!canonicalIdentity(event.ticker)) return false
  if (event.status !== undefined && !ACTIVITY_RUN_STATUSES.has(event.status as RunStatus)) return false
  if (event.chained !== undefined && typeof event.chained !== 'boolean') return false
  if (![event.swarm, event.runRoot, event.module, event.agent, event.profileKey, event.model, event.reasoningLevel,
    event.cliVersion, event.note, event.chainId, event.executionEpoch].every(validOptionalString)) return false
  if (event.executionProfile !== undefined && !validExecutionProfile(event.executionProfile)) return false
  if (event.provider !== undefined && event.provider !== 'claude' && event.provider !== 'codex') return false
  if (event.swarm !== undefined && !canonicalIdentity(event.swarm)) return false
  if (event.runRoot !== undefined && !canonicalIdentity(event.runRoot)) return false
  if (!activityRunIdentityMatches(event)) return false
  if ([event.costUsd, event.durationMs, event.numTurns].some((number) =>
    number !== undefined && (typeof number !== 'number' || !Number.isFinite(number)))) return false
  return true
}

function readAllEvents(): { events: ActivityEvent[]; invalidEventCount: number } {
  let raw: string
  try {
    raw = fs.readFileSync(ACTIVITY_LOG_PATH, 'utf8')
  } catch {
    return { events: [], invalidEventCount: 0 } // no log yet
  }
  const out: ActivityEvent[] = []
  let invalidEventCount = 0
  for (const line of raw.split('\n')) {
    const t = line.trim()
    if (!t) continue
    try {
      const ev = JSON.parse(t)
      if (isActivityEvent(ev)) out.push(ev)
      else invalidEventCount++
    } catch {
      invalidEventCount++ // skip a corrupt/partial line rather than failing the whole read
    }
  }
  return { events: out, invalidEventCount }
}

// Fold events into one row per run (launched seeds it; finished overlays outcome).
function foldRows(events: ActivityEvent[]): ActivityRow[] {
  const byRun = new Map<string, ActivityRow>()
  for (const ev of events) {
    let row = byRun.get(ev.runId)
    if (!row) {
      row = {
        runId: ev.runId,
        user: ev.user,
        userVia: ev.userVia,
        kind: ev.kind,
        ticker: ev.ticker,
        swarm: ev.swarm,
        chained: ev.chained,
        chainId: ev.chainId,
        executionEpoch: ev.executionEpoch,
        runRoot: ev.runRoot,
        module: ev.module,
        agent: ev.agent,
        provider: ev.provider ?? 'claude',
        executionProfile: ev.executionProfile,
        profileKey: ev.profileKey,
        model: ev.model,
        reasoningLevel: ev.reasoningLevel,
        cliVersion: ev.cliVersion,
        launchedAt: ev.ts,
        status: 'running',
      }
      byRun.set(ev.runId, row)
    }
    if (ev.event === 'launched') {
      row.launchedAt = ev.ts
      // a launched event carries the authoritative identity/target
      row.user = ev.user
      row.userVia = ev.userVia
      row.kind = ev.kind
      row.ticker = ev.ticker
      row.swarm = ev.swarm
      row.chained = ev.chained
      row.chainId = ev.chainId
      row.executionEpoch = ev.executionEpoch
      row.runRoot = ev.runRoot
      row.module = ev.module
      row.agent = ev.agent
      row.provider = ev.provider ?? row.provider ?? 'claude'
      row.executionProfile = ev.executionProfile ?? row.executionProfile
      row.profileKey = ev.profileKey
      row.model = ev.model
      row.reasoningLevel = ev.reasoningLevel
      row.cliVersion = ev.cliVersion
    } else if (ev.event === 'finished') {
      row.finishedAt = ev.ts
      row.status = ev.status ?? 'done'
      if (ev.runRoot && !row.runRoot) row.runRoot = ev.runRoot // fallback only — launched stays authoritative
      if (ev.chainId && !row.chainId) row.chainId = ev.chainId
      if (ev.executionEpoch && !row.executionEpoch) row.executionEpoch = ev.executionEpoch
      if (ev.costUsd != null) row.costUsd = ev.costUsd
      if (ev.durationMs != null) row.durationMs = ev.durationMs
      if (ev.numTurns != null) row.numTurns = ev.numTurns
      if (ev.note) row.note = ev.note
    }
  }
  return [...byRun.values()]
}

// `sigLabels` maps a swarm subject id (a SIG-… signal id) to the company/headline it concerns. The
// caller (server) builds it from the swarm's event ledger and injects it here so this module stays
// free of any swarm-specific path or schema. With it, swarm runs show a readable Company name instead
// of the opaque subject id, and free-text search matches that name too.
export function readActivity(query: ActivityQuery = {}, sigLabels?: Map<string, string>): ActivityResult {
  const { events, invalidEventCount } = readAllEvents()
  const allRows = foldRows(events).sort((a, b) => b.launchedAt - a.launchedAt)
  for (const r of allRows) {
    const label = resolveSubjectLabel(r.ticker, sigLabels)
    if (label) r.subjectLabel = label
  }

  const users = [...new Set(allRows.map((r) => r.user))].sort()
  const tickers = [...new Set(allRows.map((r) => r.ticker))].sort()
  const tickerLabels: Record<string, string> = {}
  for (const t of tickers) {
    const label = resolveSubjectLabel(t, sigLabels)
    if (label) tickerLabels[t] = label
  }
  // This ledger is deliberately perpetual. Spreading every timestamp into Math.min eventually exceeds
  // the runtime's function-argument limit and can take down both /api/activity and the Ideas board while
  // it is checking publication progress. Fold in constant stack space instead.
  const earliest = events.reduce<number | null>(
    (minimum, event) => minimum === null || event.ts < minimum ? event.ts : minimum,
    null,
  )

  const q = query.q?.trim().toLowerCase()
  // An explicitly supplied empty batch means "match no tickers", not "drop the filter". That keeps
  // malformed/unkeyable analysis folders from accidentally turning the board's internal read into an
  // unbounded global result.
  const tickerBatch = query.tickers
    ? new Set(query.tickers.map((ticker) => ticker.trim().toUpperCase()).filter(Boolean))
    : null
  const matched = allRows.filter((r) => {
    if (query.from != null && r.launchedAt < query.from) return false
    if (query.to != null && r.launchedAt > query.to) return false
    if (query.ticker && r.ticker !== query.ticker) return false
    if (tickerBatch && !tickerBatch.has(r.ticker.toUpperCase())) return false
    if (query.kind && r.kind !== query.kind) return false
    if (query.user && r.user !== query.user) return false
    if (query.status && r.status !== query.status) return false
    if (query.provider && r.provider !== query.provider) return false
    if (q) {
      const hay = `${r.user} ${r.ticker} ${r.subjectLabel ?? ''} ${r.module ?? ''} ${r.agent ?? ''} ${r.kind} ${r.provider} ${r.model ?? ''} ${r.reasoningLevel ?? ''}`.toLowerCase()
      if (!hay.includes(q)) return false
    }
    return true
  })

  const limit = query.limit === null ? matched.length : Math.max(1, Math.min(5000, query.limit ?? 500))
  return {
    rows: matched.slice(0, limit),
    total: matched.length,
    allTime: allRows.length,
    invalid_event_count: invalidEventCount,
    users,
    tickers,
    tickerLabels,
    earliest,
  }
}

export interface ComparableRunEstimate {
  source: 'comparable_completed_runs' | 'unavailable'
  provider: RunProvider
  profileKey: string
  durationSampleSize: number
  costSampleSize: number
  minutesRange?: [number, number]
  costUsdRange?: [number, number]
}

const MIN_COMPARABLE_RUNS = 3

function observedRange(values: number[], transform: (value: number) => number): [number, number] | undefined {
  if (values.length < MIN_COMPARABLE_RUNS) return undefined
  const sorted = values.filter(Number.isFinite).sort((a, b) => a - b)
  if (sorted.length < MIN_COMPARABLE_RUNS) return undefined
  return [transform(sorted[0]), transform(sorted[sorted.length - 1])]
}

/** Historical estimates are evidence, not config. Match the exact provider/profile/scope and require at
 * least three clean completions. A thin or legacy ledger returns unavailable instead of a made-up band. */
export function estimateFromComparableRuns(input: {
  kind: RunKind
  provider: RunProvider
  profileKey: string
  swarm?: string
  module?: string
  agent?: string
}): ComparableRunEstimate {
  const swarm = input.swarm || 'research'
  const rows = readActivity({ kind: input.kind, provider: input.provider, limit: null }).rows.filter((row) =>
    row.status === 'done'
    && row.profileKey === input.profileKey
    && (row.swarm || 'research') === swarm
    && (input.module === undefined || row.module === input.module)
    && (input.agent === undefined || row.agent === input.agent))
  const durations = rows.map((row) => row.durationMs).filter((value): value is number => typeof value === 'number' && value > 0)
  const costs = input.provider === 'claude'
    ? rows.map((row) => row.costUsd).filter((value): value is number => typeof value === 'number' && value >= 0)
    : []
  const minutesRange = observedRange(durations, (value) => Math.max(1, Math.ceil(value / 60_000)))
  const costUsdRange = observedRange(costs, (value) => Math.round(value * 10) / 10)
  return {
    source: minutesRange || costUsdRange ? 'comparable_completed_runs' : 'unavailable',
    provider: input.provider,
    profileKey: input.profileKey,
    durationSampleSize: durations.length,
    costSampleSize: costs.length,
    ...(minutesRange ? { minutesRange } : {}),
    ...(costUsdRange ? { costUsdRange } : {}),
  }
}
