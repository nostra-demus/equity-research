import { execFile } from 'node:child_process'
import { createHash, randomBytes } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { resolveDisplayFields } from './ledger-corrections'

export const MEMORY_CONTRACT = 'memory-ui/1' as const
export const MEMORY_QUERY_LIMIT = 1_000

const DEFAULT_TTL_MS = 60_000
const DEFAULT_MAX_STALE_MS = 10 * 60_000
// The browser allows 65s for this endpoint. Give a cold projection one bounded minute; the query
// itself is small and verified, while normal restarts serve the durable last-known-good view.
const DEFAULT_TIMEOUT_MS = 60_000
const DEFAULT_MAX_BUFFER = 32 * 1024 * 1024
const MAX_DIAGNOSTICS = 10_000
const MAX_LINEAGE_IDS = 1_000
const MAX_PATH_LENGTH = 512
const MAX_LOCATOR_LENGTH = 160
const MAX_ID_LENGTH = 180
const MAX_CACHE_FUTURE_SKEW_MS = 60_000
const MEMORY_CACHE_SCHEMA = 'memory-ui-cache/v1' as const

export type MemoryCockpit = 'research' | 'screener' | 'commodity'
export type MemoryStatusState = 'healthy' | 'degraded' | 'unavailable'

export interface MemoryCounts {
  total: number
  research: number
  screener: number
  commodity: number
  decisions: number
  reviews: number
  corrections: number
}

export interface MemoryItem {
  event_id: string
  event_type: string
  cockpit: MemoryCockpit
  kind: string
  happened_at: string
  valid_from: string
  subject: string
  title: string
  status: string | null
  /** An explicitly named source confidence expressed in percentage points (0..100), never a generic score. */
  confidence: number | null
  summary: string
  current: boolean
  source: {
    path: string
    locator: string
    sha256: string
    git_commit: string | null
  }
  lineage: {
    derived_from: string[]
    supersedes: string[]
    replaced_by: string[]
    corrected_by: string[]
  }
  proof: {
    source_verified: true
    evidence_ref_count: number
  }
}

export interface MemoryRead {
  contract_version: typeof MEMORY_CONTRACT
  available: boolean
  read_only: true
  generated_at: string | null
  status: {
    state: MemoryStatusState
    message: string
    event_count: number
    source_count: number
    diagnostics_count: number
    production_readiness: 'unmeasured'
  }
  counts: MemoryCounts
  items: MemoryItem[]
}

export interface MemoryExecOptions {
  cwd: string
  timeout: number
  maxBuffer: number
}

export type MemoryExec = (
  file: string,
  args: readonly string[],
  options: MemoryExecOptions,
) => Promise<{ stdout: string; stderr?: string }>

export interface MemoryReaderOptions {
  repoRoot: string
  stateDir: string
  exec?: MemoryExec
  now?: () => number
  ttlMs?: number
  maxStaleMs?: number
  timeoutMs?: number
  maxBuffer?: number
}

export interface MemoryReader {
  read: () => Promise<MemoryRead>
  /** Start or join a bounded refresh without making server startup depend on Memory availability. */
  warm: () => Promise<MemoryRead>
}

interface CanonicalEvent {
  event_id: string
  event_type: string
  system_time: string
  valid_time: { from: string; to: string | null }
  payload: {
    record_type: string
    record: Record<string, unknown>
    source_path: string
    source_locator: string
    source_sha256: string
    source_git_commit?: string
  }
  derived_from: string[]
  supersedes: string[]
  evidence_refs: string[]
  policy: {
    classification: 'internal'
    retention: 'permanent' | 'expires'
    retain_until: string | null
  }
}

interface ProjectReport {
  digest: string
  eventCount: number
  diagnostics: Array<{ severity: string }>
}

const ZERO_COUNTS: MemoryCounts = {
  total: 0,
  research: 0,
  screener: 0,
  commodity: 0,
  decisions: 0,
  reviews: 0,
  corrections: 0,
}

function unavailable(): MemoryRead {
  return {
    contract_version: MEMORY_CONTRACT,
    available: false,
    read_only: true,
    generated_at: null,
    status: {
      state: 'unavailable',
      message: 'Memory is temporarily unavailable.',
      event_count: 0,
      source_count: 0,
      diagnostics_count: 0,
      production_readiness: 'unmeasured',
    },
    counts: { ...ZERO_COUNTS },
    items: [],
  }
}

function capNumber(value: number | undefined, fallback: number, min: number, max: number): number {
  const candidate = value ?? fallback
  return Number.isFinite(candidate) ? Math.min(max, Math.max(min, Math.floor(candidate))) : fallback
}

function record(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function safeInteger(value: unknown, max = Number.MAX_SAFE_INTEGER): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 && value <= max
}

function exactText(value: unknown, max: number, allowEmpty = false): string {
  if (typeof value !== 'string' || value.length > max || (!allowEmpty && value.length === 0)
      || /[\u0000-\u001f\u007f]/.test(value)) throw new Error('invalid memory text')
  return value
}

function exactId(value: unknown): string {
  const id = exactText(value, MAX_ID_LENGTH)
  if (!/^[A-Za-z0-9][A-Za-z0-9._:-]*$/.test(id)) throw new Error('invalid memory identifier')
  return id
}

function exactIdList(value: unknown): string[] {
  if (!Array.isArray(value) || value.length > MAX_LINEAGE_IDS) throw new Error('invalid memory lineage')
  const ids = value.map(exactId)
  if (new Set(ids).size !== ids.length) throw new Error('duplicate memory lineage identifier')
  return ids
}

function exactIso(value: unknown): string {
  const text = exactText(value, 40)
  if (!Number.isFinite(Date.parse(text))) throw new Error('invalid memory date')
  return text
}

function isoMillis(value: string, endOfDay = false): number {
  const parsed = Date.parse(value)
  return endOfDay && /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? parsed + (24 * 60 * 60 * 1_000) - 1
    : parsed
}

function sourcePath(value: unknown): string {
  const candidate = exactText(value, MAX_PATH_LENGTH)
  if (candidate.startsWith('/') || candidate.includes('\\') || path.posix.normalize(candidate) !== candidate
      || candidate.split('/').some((part) => part === '..' || part === '.')) {
    throw new Error('invalid memory source path')
  }
  return candidate
}

function sourceLocator(value: unknown): string {
  return exactText(value, MAX_LOCATOR_LENGTH)
}

function hash(value: unknown): string {
  if (typeof value !== 'string' || !/^[a-f0-9]{64}$/.test(value)) throw new Error('invalid memory hash')
  return value
}

function commit(value: unknown): string | null {
  if (value === undefined || value === null) return null
  if (typeof value !== 'string' || !/^[a-f0-9]{7,64}$/.test(value)) throw new Error('invalid memory commit')
  return value
}

function parseJsonObject(stdout: string, maxOutput: number): Record<string, unknown> {
  if (typeof stdout !== 'string' || stdout.length === 0 || Buffer.byteLength(stdout, 'utf8') > maxOutput) {
    throw new Error('invalid memory command output')
  }
  const parsed: unknown = JSON.parse(stdout)
  if (!record(parsed)) throw new Error('memory command output is not an object')
  return parsed
}

function parseProject(stdout: string, maxOutput: number): ProjectReport {
  const report = parseJsonObject(stdout, maxOutput)
  if (report.schema !== 'memory-cli-report/v1' || report.command !== 'project' || report.ok !== true
      || !record(report.projection) || !Array.isArray(report.diagnostics)
      || report.diagnostics.length > MAX_DIAGNOSTICS) throw new Error('invalid memory project report')
  const digest = hash(report.projection.digest)
  // The Explorer deliberately queries a bounded recent working set. The canonical projection may
  // grow well beyond that response limit without making the read path unavailable.
  if (!safeInteger(report.projection.event_count)) throw new Error('invalid memory event count')
  const diagnostics = report.diagnostics.map((value) => {
    if (!record(value) || !['info', 'warning', 'error'].includes(String(value.severity))) {
      throw new Error('invalid memory diagnostic')
    }
    return { severity: String(value.severity) }
  })
  if (diagnostics.some((value) => value.severity === 'error')) throw new Error('memory project reported an error')
  return { digest, eventCount: report.projection.event_count, diagnostics }
}

function parseEvent(value: unknown): CanonicalEvent {
  if (!record(value) || !record(value.valid_time) || !record(value.payload) || !record(value.policy)) {
    throw new Error('invalid canonical memory event')
  }
  if (exactText(value.policy.classification, 30) !== 'internal') {
    throw new Error('memory event crossed its classification boundary')
  }
  const retention = exactText(value.policy.retention, 30)
  let retainUntil: string | null
  if (retention === 'permanent' && value.policy.retain_until === null) {
    retainUntil = null
  } else if (retention === 'expires') {
    retainUntil = exactIso(value.policy.retain_until)
  } else {
    throw new Error('memory event crossed its retention boundary')
  }
  const payload = value.payload
  if (!record(payload.record)) throw new Error('memory event has no supported record')
  const event: CanonicalEvent = {
    event_id: exactId(value.event_id),
    event_type: exactText(value.event_type, 100),
    system_time: exactIso(value.system_time),
    valid_time: {
      from: exactIso(value.valid_time.from),
      to: value.valid_time.to === null ? null : exactIso(value.valid_time.to),
    },
    payload: {
      record_type: exactText(payload.record_type, 100),
      record: payload.record,
      source_path: sourcePath(payload.source_path),
      source_locator: sourceLocator(payload.source_locator),
      source_sha256: hash(payload.source_sha256),
      source_git_commit: commit(payload.source_git_commit) ?? undefined,
    },
    derived_from: exactIdList(value.derived_from),
    supersedes: exactIdList(value.supersedes),
    evidence_refs: Array.isArray(value.evidence_refs) && value.evidence_refs.length <= MAX_LINEAGE_IDS
      ? value.evidence_refs.map((item) => exactText(item, 300))
      : (() => { throw new Error('invalid memory evidence references') })(),
    policy: {
      classification: 'internal',
      retention,
      retain_until: retainUntil,
    },
  }
  return event
}

function parseQuery(stdout: string, expectedCount: number, maxOutput: number): CanonicalEvent[] {
  const packet = parseJsonObject(stdout, maxOutput)
  if (!record(packet.query) || !record(packet.query.requested) || !record(packet.query.effective)) {
    throw new Error('invalid memory query policy')
  }
  const requested = packet.query.requested
  const effective = packet.query.effective
  const noSubjects = Array.isArray(requested.subject_ids) && requested.subject_ids.length === 0
  const noEventTypes = Array.isArray(requested.event_types) && requested.event_types.length === 0
  const internalOnly = Array.isArray(requested.classifications)
    && requested.classifications.length === 1 && requested.classifications[0] === 'internal'
  const effectiveClocks = ['as_of', 'valid_at_from', 'valid_at_to', 'policy_evaluated_at']
    .map((field) => exactIso(effective[field]))
  if (!noSubjects || !noEventTypes || !internalOnly || requested.as_of !== null
      || requested.valid_at !== null || requested.text !== null || requested.current_only !== false
      || requested.limit !== MEMORY_QUERY_LIMIT || new Set(effectiveClocks).size !== 1) {
    throw new Error('unexpected memory query policy')
  }
  if (packet.schema !== 'memory-query-result/v1' || packet.trusted_projection_digest_matched !== true
      || !safeInteger(packet.event_count, MEMORY_QUERY_LIMIT) || !Array.isArray(packet.events)
      || packet.events.length !== packet.event_count || packet.event_count > expectedCount
      || typeof packet.result_sha256 !== 'string' || !/^[a-f0-9]{64}$/.test(packet.result_sha256)) {
    throw new Error('invalid or incomplete memory query result')
  }
  const events = packet.events.map(parseEvent)
  const [asOf, validAtFrom, validAtTo, policyEvaluatedAt] = effectiveClocks.map((value) => isoMillis(value))
  for (const event of events) {
    const withinSystemTime = isoMillis(event.system_time) <= asOf
    const overlapsValidWindow = isoMillis(event.valid_time.from) <= validAtTo
      && (event.valid_time.to === null || isoMillis(event.valid_time.to, true) >= validAtFrom)
    const retained = event.policy.retention === 'permanent'
      || (event.policy.retain_until !== null && isoMillis(event.policy.retain_until) > policyEvaluatedAt)
    if (!withinSystemTime || !overlapsValidWindow || !retained) {
      throw new Error('memory event crossed its effective policy boundary')
    }
  }
  if (new Set(events.map((event) => event.event_id)).size !== events.length) {
    throw new Error('duplicate memory event')
  }
  return events
}

function displayText(value: unknown, max: number, fallback = ''): string {
  if (typeof value !== 'string') return fallback
  const clean = value.replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/\s+/g, ' ').trim()
  if (!clean) return fallback
  if (clean.length <= max) return clean
  const clipped = clean.slice(0, Math.max(1, max - 1)).trimEnd()
  return `${clipped}…`
}

function firstText(row: Record<string, unknown>, keys: string[], max: number, fallback = ''): string {
  for (const key of keys) {
    const value = displayText(row[key], max)
    if (value) return value
  }
  return fallback
}

function nested(row: Record<string, unknown>, key: string): Record<string, unknown> {
  return record(row[key]) ? row[key] : {}
}

function firstListText(value: unknown, max: number): string {
  if (!Array.isArray(value)) return ''
  for (const item of value) {
    if (typeof item === 'string') {
      const text = displayText(item, max)
      if (text) return text
    }
    if (record(item)) {
      const text = firstText(item, ['reason', 'lesson', 'description', 'result'], max)
      if (text) return text
    }
  }
  return ''
}

function confidencePercent(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 100
    ? Math.round(value * 100) / 100
    : null
}

function analysisSubject(source: string): string {
  const folder = source.split('/')[1] || ''
  const match = /^(.+?)_\d{4}-\d{2}-\d{2}$/.exec(folder)
  return displayText(match?.[1] || folder, 96, 'Research')
}

interface CuratedFields {
  cockpit: MemoryCockpit
  kind: string
  subject: string
  title: string
  status: string | null
  confidence: number | null
  summary: string
}

function curate(event: CanonicalEvent): CuratedFields | null {
  const row = event.payload.record
  const type = event.payload.record_type
  if (type === 'equity_decision_record') {
    const subject = firstText(row, ['ticker', 'company_name'], 96, analysisSubject(event.payload.source_path))
    const display = resolveDisplayFields(row)
    const status = displayText(display.decision || display.basket, 80) || null
    const originalStatus = firstText(row, ['decision', 'basket'], 80)
    return {
      cockpit: 'research', kind: 'Decision', subject,
      title: displayText(`${subject}: ${status || 'Research decision'}`, 180), status,
      confidence: confidencePercent(display.confidence),
      summary: display.decisionIsPostMortemCapped && originalStatus && status
        ? displayText(`The final red-team check changed this call from ${originalStatus} to ${status}.`, 420)
        : firstText(row, ['suggested_action', 'variant_perception_summary', 'what_market_may_be_missing', 'killer_risk'], 420, 'Research decision recorded.'),
    }
  }
  if (type === 'equity_decision_review') {
    const subject = firstText(row, ['ticker'], 96, analysisSubject(event.payload.source_path))
    const window = firstText(row, ['review_window'], 50)
    const status = firstText(row, ['thesis_status', 'decision_quality', 'original_decision'], 80) || null
    return {
      cockpit: 'research', kind: 'Review', subject,
      title: displayText(`${subject}: ${window ? `${window} review` : 'Decision review'}`, 180), status,
      confidence: null,
      summary: firstListText(row.lessons, 420) || firstText(row, ['decision_quality', 'thesis_status'], 420, 'Decision outcome reviewed.'),
    }
  }
  if (type === 'equity_decision_correction') {
    const subject = analysisSubject(event.payload.source_path)
    return {
      cockpit: 'research', kind: 'Correction', subject,
      title: `${subject}: Correction`, status: 'Corrected', confidence: null,
      summary: firstListText(row.errata, 420) || 'A correction was added without changing the original record.',
    }
  }
  if (type === 'commodity_decision_record') {
    const subject = firstText(row, ['commodity'], 96, 'Commodity')
    const display = resolveDisplayFields(row, { verdictField: 'action' })
    const status = displayText(display.decision, 80) || null
    const originalStatus = firstText(row, ['action'], 80)
    return {
      cockpit: 'commodity', kind: 'Decision', subject,
      title: displayText(`${subject}: ${status || 'Commodity decision'}`, 180), status,
      confidence: confidencePercent(display.confidence),
      summary: display.decisionIsPostMortemCapped && originalStatus && status
        ? displayText(`The final red-team check changed this call from ${originalStatus} to ${status}.`, 420)
        : firstText(row, ['thesis_summary', 'relative_view'], 420, 'Commodity decision recorded.'),
    }
  }
  if (type === 'commodity_signal_evidence') {
    const subject = firstText(row, ['commodity'], 96, 'Commodity')
    return {
      cockpit: 'commodity', kind: 'Signal', subject,
      title: displayText(`${subject}: Signal evidence`, 180), status: 'Recorded', confidence: null,
      summary: firstText(row, ['summary', 'thesis_summary', 'headline'], 420, 'Commodity signal evidence compiled.'),
    }
  }
  if (type === 'screener_event') {
    const subject = firstText(row, ['signal_id', 'event_id'], 96, 'Market signal')
    return {
      cockpit: 'screener', kind: 'Signal', subject,
      title: firstText(row, ['headline'], 180, 'Market signal'),
      status: firstText(row, ['status', 'action'], 80) || null,
      confidence: null,
      summary: firstText(row, ['status_reason'], 420, 'A market signal was assessed.'),
    }
  }
  if (type === 'screener_thesis') {
    const meta = nested(row, 'meta')
    const variant = nested(row, 'M0_6_3')
    const subject = firstText(meta, ['thesis_id', 'signal_id'], 96, 'Screener thesis')
    return {
      cockpit: 'screener', kind: 'Thesis', subject,
      title: firstText(row, ['headline'], 180, 'Screener thesis'),
      status: firstText(meta, ['status'], 80) || null,
      confidence: null,
      summary: firstText(meta, ['status_reason'], 420) || firstText(variant, ['variant_paragraph'], 420, 'Screener thesis recorded.'),
    }
  }
  if (type === 'screener_idea_history' || type === 'screener_idea_snapshot' || type === 'screener_idea_archive') {
    const idea = type === 'screener_idea_archive' ? nested(row, 'snapshot') : row
    const subject = firstText(idea, ['ticker', 'company', 'idea_id'], 96, 'Screener idea')
    const direction = firstText(idea, ['direction'], 30)
    const archived = type === 'screener_idea_archive'
    return {
      cockpit: 'screener', kind: archived ? 'Archived idea' : 'Idea', subject,
      title: displayText(`${firstText(idea, ['company', 'ticker'], 120, subject)}${direction ? `: ${direction} idea` : ': Idea'}`, 180),
      status: archived ? 'Archived' : firstText(idea, ['status', 'trade_readiness'], 80) || null,
      confidence: null,
      summary: firstText(idea, ['why_now', 'reason', 'source_headline'], 420, archived ? 'Idea archived.' : 'Screener idea recorded.'),
    }
  }
  if (type === 'screener_conviction_checkpoint') {
    const subject = firstText(row, ['thesis_id', 'checkpoint_id'], 96, 'Screener thesis')
    return {
      cockpit: 'screener', kind: 'Checkpoint', subject,
      title: firstText(row, ['metric_name', 'kind'], 180, 'Conviction checkpoint'),
      status: firstText(row, ['status'], 80) || null,
      confidence: null,
      summary: firstText(row, ['falsification_text'], 420, 'A thesis checkpoint was scheduled.'),
    }
  }
  if (type === 'screener_conviction_event' || type === 'screener_conviction_state') {
    const subject = firstText(row, ['thesis_id'], 96, 'Screener thesis')
    return {
      cockpit: 'screener', kind: 'Conviction', subject,
      title: displayText(`${subject}: Conviction update`, 180),
      status: firstText(row, ['to_state', 'state', 'kind'], 80) || null,
      confidence: null,
      summary: firstText(row, ['plain_note'], 420, 'Conviction state recorded.'),
    }
  }
  // A future canonical record has still crossed the projection's policy/integrity boundary, but this
  // UI must not guess which cockpit owns it or expose its raw payload. Hide only that display row and
  // report the omission as a generic degraded diagnostic; known memories remain useful.
  return null
}

function buildRead(events: CanonicalEvent[], project: ProjectReport, generatedAt: string): MemoryRead {
  const replacedBy = new Map<string, string[]>()
  const correctedBy = new Map<string, string[]>()
  const eventById = new Map(events.map((event) => [event.event_id, event]))
  let unresolvedCorrections = 0
  for (const event of events) {
    for (const target of event.supersedes) {
      const successors = replacedBy.get(target) || []
      successors.push(event.event_id)
      replacedBy.set(target, successors)
    }
    if (event.event_type === 'correction.recorded'
        && event.payload.record_type === 'equity_decision_correction') {
      const correctionDir = path.posix.dirname(event.payload.source_path)
      const targets = event.derived_from
        .map((id) => eventById.get(id))
        .filter((candidate): candidate is CanonicalEvent => !!candidate
          && candidate.payload.record_type === 'equity_decision_record'
          && path.posix.basename(candidate.payload.source_path) === 'decision_record.json'
          && path.posix.dirname(candidate.payload.source_path) === correctionDir)
      if (targets.length === 1) {
        const corrections = correctedBy.get(targets[0].event_id) || []
        corrections.push(event.event_id)
        correctedBy.set(targets[0].event_id, corrections)
      } else {
        // Corrections may cite a later replacement as provenance too. If the sibling decision
        // is not unique, hide the reverse link rather than accusing the wrong record.
        unresolvedCorrections++
      }
    }
  }
  const items: MemoryItem[] = []
  let skipped = 0
  for (const event of events) {
    const fields = curate(event)
    if (!fields) {
      skipped++
      continue
    }
    const successors = [...(replacedBy.get(event.event_id) || [])].sort()
    items.push({
      event_id: event.event_id,
      event_type: event.event_type,
      ...fields,
      happened_at: event.system_time,
      valid_from: event.valid_time.from,
      current: successors.length === 0,
      source: {
        path: event.payload.source_path,
        locator: event.payload.source_locator,
        sha256: event.payload.source_sha256,
        git_commit: event.payload.source_git_commit ?? null,
      },
      lineage: {
        derived_from: [...event.derived_from],
        supersedes: [...event.supersedes],
        replaced_by: successors,
        corrected_by: [...(correctedBy.get(event.event_id) || [])].sort(),
      },
      proof: { source_verified: true, evidence_ref_count: event.evidence_refs.length },
    })
  }
  const counts: MemoryCounts = {
    total: items.length,
    research: items.filter((item) => item.cockpit === 'research').length,
    screener: items.filter((item) => item.cockpit === 'screener').length,
    commodity: items.filter((item) => item.cockpit === 'commodity').length,
    decisions: items.filter((item) => item.event_type === 'decision.recorded').length,
    reviews: items.filter((item) => item.event_type === 'outcome.reviewed').length,
    corrections: items.filter((item) => item.event_type === 'correction.recorded').length,
  }
  const sourceCount = new Set(items.map((item) => item.source.path)).size
  const hasSourceWarning = project.diagnostics.some((item) => item.severity === 'warning')
  const degraded = hasSourceWarning || skipped > 0 || unresolvedCorrections > 0
  const message = skipped > 0 && unresolvedCorrections > 0
    ? 'Memory is ready; some unsupported records or unclear correction links are hidden.'
    : skipped > 0
      ? `Memory is ready; ${skipped} unsupported ${skipped === 1 ? 'record is' : 'records are'} hidden.`
      : unresolvedCorrections > 0
        ? 'Memory is ready; some correction links are hidden because their target is unclear.'
        : hasSourceWarning ? 'Memory is ready, with non-blocking source notes.' : 'Memory is ready.'
  return {
    contract_version: MEMORY_CONTRACT,
    available: true,
    read_only: true,
    generated_at: generatedAt,
    status: {
      state: degraded ? 'degraded' : 'healthy',
      message,
      event_count: items.length,
      source_count: sourceCount,
      diagnostics_count: project.diagnostics.length + skipped + unresolvedCorrections,
      production_readiness: 'unmeasured',
    },
    counts,
    items,
  }
}

function parseCachedItem(value: unknown): MemoryItem {
  if (!record(value) || !record(value.source) || !record(value.lineage) || !record(value.proof)) {
    throw new Error('invalid cached memory item')
  }
  const cockpit = exactText(value.cockpit, 20)
  if (!['research', 'screener', 'commodity'].includes(cockpit)) throw new Error('invalid cached memory cockpit')
  const confidence = value.confidence === null
    ? null
    : (typeof value.confidence === 'number' && Number.isFinite(value.confidence)
        && value.confidence >= 0 && value.confidence <= 100 ? value.confidence : (() => {
          throw new Error('invalid cached memory confidence')
        })())
  if (typeof value.current !== 'boolean' || value.proof.source_verified !== true
      || !safeInteger(value.proof.evidence_ref_count, MAX_LINEAGE_IDS)) {
    throw new Error('invalid cached memory proof')
  }
  return {
    event_id: exactId(value.event_id),
    event_type: exactText(value.event_type, 100),
    cockpit: cockpit as MemoryCockpit,
    kind: exactText(value.kind, 100),
    happened_at: exactIso(value.happened_at),
    valid_from: exactIso(value.valid_from),
    subject: exactText(value.subject, 96),
    title: exactText(value.title, 180),
    status: value.status === null ? null : exactText(value.status, 80),
    confidence,
    summary: exactText(value.summary, 420),
    current: value.current,
    source: {
      path: sourcePath(value.source.path),
      locator: sourceLocator(value.source.locator),
      sha256: hash(value.source.sha256),
      git_commit: commit(value.source.git_commit),
    },
    lineage: {
      derived_from: exactIdList(value.lineage.derived_from),
      supersedes: exactIdList(value.lineage.supersedes),
      replaced_by: exactIdList(value.lineage.replaced_by),
      corrected_by: exactIdList(value.lineage.corrected_by),
    },
    proof: {
      source_verified: true,
      evidence_ref_count: value.proof.evidence_ref_count,
    },
  }
}

function parseCachedRead(value: unknown): MemoryRead {
  if (!record(value) || value.contract_version !== MEMORY_CONTRACT || value.available !== true
      || value.read_only !== true || !record(value.status) || !record(value.counts)
      || !Array.isArray(value.items) || value.items.length > MEMORY_QUERY_LIMIT) {
    throw new Error('invalid cached memory read')
  }
  const state = exactText(value.status.state, 20)
  if (state !== 'healthy' && state !== 'degraded') throw new Error('invalid cached memory status')
  const generatedAt = exactIso(value.generated_at)
  const items = value.items.map(parseCachedItem)
  if (new Set(items.map((item) => item.event_id)).size !== items.length) {
    throw new Error('duplicate cached memory event')
  }
  const counts: MemoryCounts = {
    total: items.length,
    research: items.filter((item) => item.cockpit === 'research').length,
    screener: items.filter((item) => item.cockpit === 'screener').length,
    commodity: items.filter((item) => item.cockpit === 'commodity').length,
    decisions: items.filter((item) => item.event_type === 'decision.recorded').length,
    reviews: items.filter((item) => item.event_type === 'outcome.reviewed').length,
    corrections: items.filter((item) => item.event_type === 'correction.recorded').length,
  }
  for (const [key, expected] of Object.entries(counts)) {
    if (!safeInteger(value.counts[key], MEMORY_QUERY_LIMIT) || value.counts[key] !== expected) {
      throw new Error('cached memory counts do not reconcile')
    }
  }
  const sourceCount = new Set(items.map((item) => item.source.path)).size
  if (!safeInteger(value.status.event_count, MEMORY_QUERY_LIMIT) || value.status.event_count !== items.length
      || !safeInteger(value.status.source_count, MEMORY_QUERY_LIMIT) || value.status.source_count !== sourceCount
      || !safeInteger(value.status.diagnostics_count, MAX_DIAGNOSTICS + (2 * MEMORY_QUERY_LIMIT))
      || value.status.production_readiness !== 'unmeasured') {
    throw new Error('cached memory status does not reconcile')
  }
  return {
    contract_version: MEMORY_CONTRACT,
    available: true,
    read_only: true,
    generated_at: generatedAt,
    status: {
      state,
      message: exactText(value.status.message, 240),
      event_count: items.length,
      source_count: sourceCount,
      diagnostics_count: value.status.diagnostics_count,
      production_readiness: 'unmeasured',
    },
    counts,
    items,
  }
}

function sha256(value: string): string {
  return createHash('sha256').update(value, 'utf8').digest('hex')
}

function encodeCache(read: MemoryRead): string {
  const readJson = JSON.stringify(read)
  return JSON.stringify({
    schema: MEMORY_CACHE_SCHEMA,
    read_sha256: sha256(readJson),
    read,
  })
}

function decodeCache(serialized: string, maxBytes: number): MemoryRead {
  if (Buffer.byteLength(serialized, 'utf8') > maxBytes) throw new Error('memory cache is too large')
  const envelope: unknown = JSON.parse(serialized)
  if (!record(envelope) || envelope.schema !== MEMORY_CACHE_SCHEMA || !record(envelope.read)
      || hash(envelope.read_sha256) !== sha256(JSON.stringify(envelope.read))) {
    throw new Error('memory cache integrity check failed')
  }
  return parseCachedRead(envelope.read)
}

async function secureDirectory(directory: string): Promise<void> {
  await fs.promises.mkdir(directory, { recursive: true, mode: 0o700 })
  const stat = await fs.promises.lstat(directory)
  const uid = typeof process.getuid === 'function' ? process.getuid() : null
  if (!stat.isDirectory() || stat.isSymbolicLink() || (uid !== null && stat.uid !== uid)) {
    throw new Error('memory state directory is unsafe')
  }
  if ((stat.mode & 0o077) !== 0) await fs.promises.chmod(directory, 0o700)
}

async function readSecureFile(file: string, maxBytes: number): Promise<string> {
  const before = await fs.promises.lstat(file)
  const uid = typeof process.getuid === 'function' ? process.getuid() : null
  if (!before.isFile() || before.isSymbolicLink() || before.nlink !== 1 || before.size > maxBytes
      || (before.mode & 0o077) !== 0 || (uid !== null && before.uid !== uid)) {
    throw new Error('memory cache file is unsafe')
  }
  const noFollow = fs.constants.O_NOFOLLOW ?? 0
  const handle = await fs.promises.open(file, fs.constants.O_RDONLY | noFollow)
  try {
    const opened = await handle.stat()
    if (!opened.isFile() || opened.nlink !== 1 || opened.size !== before.size || opened.size > maxBytes
        || opened.dev !== before.dev || opened.ino !== before.ino
        || (opened.mode & 0o077) !== 0 || (uid !== null && opened.uid !== uid)) {
      throw new Error('memory cache file changed while opening')
    }
    return await handle.readFile({ encoding: 'utf8' })
  } finally {
    await handle.close()
  }
}

async function writeSecureFile(directory: string, file: string, content: string, maxBytes: number): Promise<void> {
  if (Buffer.byteLength(content, 'utf8') > maxBytes) throw new Error('memory cache is too large')
  await secureDirectory(directory)
  const temporary = path.join(directory, `.verified-read.${process.pid}.${randomBytes(12).toString('hex')}.tmp`)
  const noFollow = fs.constants.O_NOFOLLOW ?? 0
  let handle: fs.promises.FileHandle | null = null
  try {
    handle = await fs.promises.open(
      temporary,
      fs.constants.O_WRONLY | fs.constants.O_CREAT | fs.constants.O_EXCL | noFollow,
      0o600,
    )
    await handle.writeFile(content, { encoding: 'utf8' })
    await handle.sync()
    await handle.close()
    handle = null
    await fs.promises.rename(temporary, file)
    const directoryHandle = await fs.promises.open(directory, fs.constants.O_RDONLY)
    try { await directoryHandle.sync() } finally { await directoryHandle.close() }
  } finally {
    if (handle) await handle.close().catch(() => undefined)
    await fs.promises.unlink(temporary).catch(() => undefined)
  }
}

const defaultExec: MemoryExec = (file, args, options) => new Promise((resolve, reject) => {
  execFile(file, [...args], {
    cwd: options.cwd,
    encoding: 'utf8',
    timeout: options.timeout,
    maxBuffer: options.maxBuffer,
    windowsHide: true,
  }, (error, stdout, stderr) => {
    if (error) return reject(error)
    resolve({ stdout, stderr })
  })
})

/**
 * Build the shared, read-only Memory UI projection. The canonical repository sources stay authoritative;
 * this service owns the fixed internal policy, trusted digest and state paths and exposes curated fields only.
 */
export function createMemoryReader(options: MemoryReaderOptions): MemoryReader {
  const repoRoot = path.resolve(options.repoRoot)
  const stateDir = path.resolve(options.stateDir)
  const projectionDir = path.join(stateDir, 'memory-ui')
  const database = path.join(projectionDir, 'projection.sqlite')
  const verifiedReadCache = path.join(projectionDir, 'verified-read.json')
  const script = path.join(repoRoot, 'scripts', 'memory.py')
  const run = options.exec || defaultExec
  const now = options.now || Date.now
  const ttlMs = capNumber(options.ttlMs, DEFAULT_TTL_MS, 1_000, 5 * 60_000)
  const maxStaleMs = capNumber(options.maxStaleMs, DEFAULT_MAX_STALE_MS, 1_000, 60 * 60_000)
  const timeoutMs = capNumber(options.timeoutMs, DEFAULT_TIMEOUT_MS, 1_000, 60_000)
  const maxBuffer = capNumber(options.maxBuffer, DEFAULT_MAX_BUFFER, 1024 * 1024, 64 * 1024 * 1024)
  const execOptions = { cwd: repoRoot, timeout: timeoutMs, maxBuffer }
  const failureTtlMs = Math.min(ttlMs, 5_000)
  let cached: {
    freshUntil: number
    staleUntil: number
    retryAfter: number
    read: MemoryRead
  } | null = null
  let rebuilding: Promise<MemoryRead> | null = null
  let hydrated = false
  let hydrating: Promise<void> | null = null

  const hydrate = (): Promise<void> => {
    if (hydrated) return Promise.resolve()
    if (hydrating) return hydrating
    hydrating = (async () => {
      try {
        await secureDirectory(projectionDir)
        const read = decodeCache(await readSecureFile(verifiedReadCache, maxBuffer), maxBuffer)
        const generatedAt = Date.parse(read.generated_at!)
        const at = now()
        if (generatedAt > at + MAX_CACHE_FUTURE_SKEW_MS) throw new Error('memory cache is from the future')
        const freshUntil = generatedAt + ttlMs
        const staleUntil = freshUntil + maxStaleMs
        if (at < staleUntil) {
          cached = { read, freshUntil, staleUntil, retryAfter: freshUntil }
        }
      } catch {
        // Missing, expired, corrupt, overly permissive or tampered state is never trusted. A live
        // bounded rebuild remains the only cold-start fallback.
      } finally {
        hydrated = true
      }
    })().finally(() => { hydrating = null })
    return hydrating
  }

  const persist = async (read: MemoryRead): Promise<void> => {
    try {
      await writeSecureFile(projectionDir, verifiedReadCache, encodeCache(read), maxBuffer)
    } catch {
      // The current verified live read is still safe to serve. Persistence is availability hardening,
      // never an authority source and never a reason to hide a successful current projection.
    }
  }

  const rebuild = async (): Promise<MemoryRead> => {
    try {
      await secureDirectory(projectionDir)
      const projected = await run('python3', [script, 'project', '--root', repoRoot, '--database', database], execOptions)
      const project = parseProject(projected.stdout, maxBuffer)
      const queried = await run('python3', [
        script, 'query', '--database', database, '--expected-digest', project.digest,
        '--classification', 'internal', '--include-superseded', '--limit', String(MEMORY_QUERY_LIMIT),
      ], execOptions)
      const events = parseQuery(queried.stdout, project.eventCount, maxBuffer)
      return buildRead(events, project, new Date(now()).toISOString())
    } catch {
      return unavailable()
    }
  }

  const refresh = (): Promise<MemoryRead> => {
    if (rebuilding) return rebuilding
    rebuilding = rebuild().then(async (next) => {
      const completedAt = now()
      if (next.available) {
        const freshUntil = completedAt + ttlMs
        cached = {
          read: next,
          freshUntil,
          staleUntil: freshUntil + maxStaleMs,
          retryAfter: freshUntil,
        }
        await persist(next)
      } else if (cached?.read.available && completedAt < cached.staleUntil) {
        // A transient refresh failure must not discard a still-bounded, last-known-good projection.
        // Back off briefly before another background attempt; staleUntil remains fixed, so this can
        // never extend the verified view forever.
        cached.retryAfter = completedAt + failureTtlMs
      } else {
        cached = {
          read: next,
          freshUntil: completedAt + failureTtlMs,
          staleUntil: completedAt + failureTtlMs,
          retryAfter: completedAt + failureTtlMs,
        }
      }
      return next
    }).finally(() => { rebuilding = null })
    return rebuilding
  }

  const staleView = (read: MemoryRead): MemoryRead => ({
    ...read,
    status: {
      ...read.status,
      state: 'degraded',
      message: 'Showing the last verified memory view while freshness is checked.',
    },
  })

  return {
    async read(): Promise<MemoryRead> {
      await hydrate()
      const at = now()
      if (cached && at < cached.freshUntil) return rebuilding ? staleView(cached.read) : cached.read
      if (cached?.read.available && at < cached.staleUntil) {
        if (!rebuilding && at >= cached.retryAfter) void refresh()
        return staleView(cached.read)
      }
      // Cold start and an exhausted max-stale window both fail closed: the caller waits for one
      // bounded project+query attempt, sharing it with every concurrent request.
      return refresh()
    },
    async warm(): Promise<MemoryRead> {
      await hydrate()
      // A restart commonly means a new checkout. Revalidate even a fresh persisted view so deploys,
      // corrections and retirements are observed immediately; callers can still use that verified
      // view while this single background rebuild runs.
      return refresh()
    },
  }
}
