import type { MemoryCockpit, MemoryCounts, MemoryItem, MemoryRead, MemoryRuntimeRead } from './types'

export type MemoryTab = 'all' | MemoryCockpit

export interface MemoryFilters {
  query: string
  cockpit: MemoryTab
  kind: string
}

export interface MemoryDisplayGroup {
  /** The exact visible-card identity. It stays stable when another source records the same memory. */
  key: string
  /** The first record in the caller's order supplies the card and detail copy. */
  item: MemoryItem
  /** Every canonical record remains available for source proof. */
  records: MemoryItem[]
}

const COCKPITS = new Set<MemoryCockpit>(['research', 'screener', 'commodity'])
const STATUS_STATES = new Set(['healthy', 'degraded', 'unavailable'])
const COUNT_KEYS: (keyof MemoryCounts)[] = [
  'total', 'research', 'screener', 'commodity', 'decisions', 'reviews', 'corrections',
]
const MAX_ITEMS = 1_000
export const MEMORY_FRESHNESS_CHECK_MESSAGE = 'Showing the last verified memory view while freshness is checked.'
export const MEMORY_FRESHNESS_POLL_MS = 5_000
// Fourteen checks cover the server's two sequential 30s command ceilings with a small handoff margin.
export const MEMORY_FRESHNESS_MAX_POLLS = 14

const object = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value)
const text = (value: unknown): value is string => typeof value === 'string'
const boundedText = (value: unknown, max: number, allowEmpty = false): value is string =>
  text(value) && value.length <= max && (allowEmpty || value.length > 0) && !/[\u0000-\u001f\u007f]/.test(value)
const finiteCount = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= 0
const iso = (value: unknown): value is string => text(value) && Number.isFinite(Date.parse(value))

function validCounts(value: unknown): value is MemoryCounts {
  return object(value) && COUNT_KEYS.every((key) => finiteCount(value[key]))
}

function stringList(value: unknown): value is string[] {
  return Array.isArray(value) && value.length <= MAX_ITEMS
    && value.every((entry) => boundedText(entry, 180))
}

function validItem(value: unknown): value is MemoryItem {
  if (!object(value) || !boundedText(value.event_id, 180) || !/^[A-Za-z0-9][A-Za-z0-9._:-]*$/.test(value.event_id)
      || !boundedText(value.event_type, 100) || !COCKPITS.has(value.cockpit as MemoryCockpit)
      || !boundedText(value.kind, 100) || !iso(value.happened_at) || !iso(value.valid_from)
      || !boundedText(value.subject, 96, true) || !boundedText(value.title, 180)
      || (value.status !== null && !boundedText(value.status, 80))
      || (value.confidence !== null && (typeof value.confidence !== 'number'
        || !Number.isFinite(value.confidence) || value.confidence < 0 || value.confidence > 100))
      || !boundedText(value.summary, 420, true) || typeof value.current !== 'boolean') return false
  if (!object(value.source) || !boundedText(value.source.path, 512)
      || !boundedText(value.source.locator, 160) || !text(value.source.sha256) || !/^[a-f0-9]{64}$/.test(value.source.sha256)
      || (value.source.git_commit !== null && (!text(value.source.git_commit) || !/^[a-f0-9]{7,64}$/.test(value.source.git_commit)))) return false
  if (!object(value.lineage) || !stringList(value.lineage.derived_from)
      || !stringList(value.lineage.supersedes) || !stringList(value.lineage.replaced_by)
      || !stringList(value.lineage.corrected_by)) return false
  return object(value.proof) && value.proof.source_verified === true
    && finiteCount(value.proof.evidence_ref_count)
}

/**
 * Treat the server response as untrusted input. A newer browser can briefly meet an older engine during
 * deploy, so every new field is positively matched before the Memory surface is allowed to call it live.
 */
export function parseMemoryRead(value: unknown): MemoryRead | null {
  if (!object(value) || value.contract_version !== 'memory-ui/1'
      || typeof value.available !== 'boolean' || value.read_only !== true
      || (value.generated_at !== null && !iso(value.generated_at))
      || !validCounts(value.counts) || !Array.isArray(value.items) || value.items.length > MAX_ITEMS
      || !value.items.every(validItem)
      || !object(value.status) || !STATUS_STATES.has(String(value.status.state))
      || !text(value.status.message) || !finiteCount(value.status.event_count)
      || !finiteCount(value.status.source_count) || !finiteCount(value.status.diagnostics_count)
      || value.status.production_readiness !== 'unmeasured') return null

  // An unavailable read is an explicit state, not an authoritative empty corpus. Conversely, an available
  // read must positively say healthy/degraded. These checks keep deploy skew from looking like "zero memory".
  if (value.available !== (value.status.state !== 'unavailable')) return null
  if (value.available !== (value.generated_at !== null)) return null
  const counts = value.counts as unknown as MemoryCounts
  const ids = new Set(value.items.map((item) => item.event_id))
  if (ids.size !== value.items.length || value.status.event_count !== value.items.length
      || counts.total !== value.items.length) return null
  const cockpitCounts = { research: 0, screener: 0, commodity: 0 }
  value.items.forEach((item) => { cockpitCounts[item.cockpit] += 1 })
  if (![...COCKPITS].every((cockpit) => counts[cockpit] === cockpitCounts[cockpit])) return null
  if (!value.available && (value.items.length !== 0 || COUNT_KEYS.some((key) => counts[key] !== 0)
      || value.status.source_count !== 0 || value.status.diagnostics_count !== 0)) return null
  return value as unknown as MemoryRead
}

export function unavailableMemoryRead(message = 'Live memory is unavailable in this read-only view.'): MemoryRead {
  return {
    contract_version: 'memory-ui/1',
    available: false,
    read_only: true,
    generated_at: null,
    status: {
      state: 'unavailable', message, event_count: 0, source_count: 0,
      diagnostics_count: 0, production_readiness: 'unmeasured',
    },
    counts: { total: 0, research: 0, screener: 0, commodity: 0, decisions: 0, reviews: 0, corrections: 0 },
    items: [],
  }
}

const RUNTIME_COUNT_KEYS: Array<keyof MemoryRuntimeRead['counts']> = [
  'runs', 'task_episodes', 'lessons', 'playbooks', 'candidates', 'executions', 'promotions',
  'quarantines', 'packets', 'used_items', 'rejected_items', 'contradicted_items', 'deviations',
]

/** Runtime metadata is untrusted too; reject deploy skew instead of rendering guessed fields. */
export function parseMemoryRuntimeRead(value: unknown): MemoryRuntimeRead | null {
  if (!object(value)) return null
  const counts = object(value.counts) ? value.counts : null
  if (value.contract_version !== 'memory-runtime-ui/1' || value.read_only !== true
      || typeof value.available !== 'boolean' || !iso(value.generated_at)
      || !['healthy', 'degraded', 'unavailable', 'disabled'].includes(String(value.state))
      || !['off', 'shadow', 'enforced'].includes(String(value.mode))
      || !['off', 'shadow', 'enforced'].includes(String(value.effective_mode))
      || !counts || !RUNTIME_COUNT_KEYS.every((key) => finiteCount(counts[key]))
      || !object(value.readiness) || !['met', 'failed', 'unmeasured'].includes(String(value.readiness.status))
      || (value.readiness.evaluated_at !== null && !iso(value.readiness.evaluated_at))
      || (value.readiness.report_sha256 !== null && (!text(value.readiness.report_sha256)
        || !/^sha256:[a-f0-9]{64}$/.test(value.readiness.report_sha256)))
      || !object(value.controls) || !finiteCount(value.controls.revision)
      || typeof value.controls.global_disabled !== 'boolean'
      || typeof value.controls.candidate_intake_disabled !== 'boolean'
      || !Array.isArray(value.controls.disabled_layers)
      || value.controls.disabled_layers.some((item) => !['episodic', 'semantic', 'procedural'].includes(String(item)))
      || !Array.isArray(value.controls.disabled_playbooks) || value.controls.disabled_playbooks.length > 512
      || !Array.isArray(value.controls.pinned_playbooks) || value.controls.pinned_playbooks.length > 512
      || !Array.isArray(value.slos) || value.slos.length > 128
      || !value.slos.every((item) => object(item) && boundedText(item.name, 191)
        && boundedText(item.status, 64) && boundedText(item.target, 256))
      || !Array.isArray(value.alerts) || value.alerts.length > 128
      || !value.alerts.every((item) => object(item) && boundedText(item.code, 191)
        && ['info', 'warning', 'critical'].includes(String(item.severity)) && boundedText(item.message, 512))
      || !Array.isArray(value.services) || value.services.length > 32
      || !value.services.every((item) => object(item) && boundedText(item.role, 191)
        && (item.identity === null || boundedText(item.identity, 191)) && typeof item.configured === 'boolean')) return null
  return value as unknown as MemoryRuntimeRead
}

/** Only the server's explicit stale-while-revalidate state asks the open reader to check again. */
export function memoryFreshnessCheckPending(read: MemoryRead | null): boolean {
  return !!read?.available
    && read.status.state === 'degraded'
    && read.status.message === MEMORY_FRESHNESS_CHECK_MESSAGE
}

/** A fixed cap prevents an open panel from polling forever if a background rebuild never settles. */
export function memoryFreshnessPollDelay(read: MemoryRead | null, completedPolls: number): number | null {
  return memoryFreshnessCheckPending(read) && completedPolls < MEMORY_FRESHNESS_MAX_POLLS
    ? MEMORY_FRESHNESS_POLL_MS
    : null
}

export function memoryKinds(items: MemoryItem[]): string[] {
  return [...new Set(items.map((item) => item.kind).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b))
}

export function filterMemoryItems(items: MemoryItem[], filters: MemoryFilters): MemoryItem[] {
  const words = filters.query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean)
  return items.filter((item) => {
    if (filters.cockpit !== 'all' && item.cockpit !== filters.cockpit) return false
    if (filters.kind && item.kind !== filters.kind) return false
    if (!words.length) return true
    const haystack = [item.subject, item.title, item.summary, item.status, item.kind, item.cockpit]
      .filter(Boolean).join(' ').toLocaleLowerCase()
    return words.every((word) => haystack.includes(word))
  }).sort((a, b) => Date.parse(b.happened_at) - Date.parse(a.happened_at)
    || a.event_id.localeCompare(b.event_id))
}

/**
 * Collapse only cards that would otherwise say exactly the same thing. Source identity is deliberately
 * not part of the key: all canonical rows are retained in `records` and exposed in Technical proof.
 */
export function groupMemoryItems(items: MemoryItem[]): MemoryDisplayGroup[] {
  const groups = new Map<string, MemoryDisplayGroup>()
  items.forEach((item) => {
    const key = JSON.stringify([
      item.cockpit,
      item.kind,
      memoryDate(item.happened_at),
      memoryDate(item.valid_from),
      item.subject,
      item.title,
      item.summary,
      item.status,
      memoryConfidence(item.confidence),
      item.current,
      item.lineage.corrected_by.length > 0,
      memoryChange(item),
      item.lineage.derived_from.length,
    ])
    const existing = groups.get(key)
    if (existing) existing.records.push(item)
    else groups.set(key, { key, item, records: [item] })
  })
  return [...groups.values()]
}

export function memoryChange(item: MemoryItem): string {
  const changes: string[] = []
  if (item.lineage.replaced_by.length) {
    const n = item.lineage.replaced_by.length
    changes.push(`A later memory replaced this (${n} ${n === 1 ? 'update' : 'updates'} recorded).`)
  }
  if (item.lineage.corrected_by.length) {
    const n = item.lineage.corrected_by.length
    changes.push(`${n === 1 ? 'A later correction applies' : `${n} later corrections apply`} to this memory.`)
  }
  if (changes.length) return changes.join(' ')
  if (item.lineage.supersedes.length) {
    const n = item.lineage.supersedes.length
    return `This updates ${n} earlier ${n === 1 ? 'memory' : 'memories'}.`
  }
  return item.current ? 'No later correction or replacement is recorded.' : 'This is historical, not the current version.'
}

export function memoryDate(value: string): string {
  const day = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  const ms = day ? Date.UTC(Number(day[1]), Number(day[2]) - 1, Number(day[3])) : Date.parse(value)
  if (!Number.isFinite(ms)) return 'date unavailable'
  // A date-only valid-time is a calendar day, not midnight in the viewer's timezone. Pin those values to
  // UTC so a user west of Greenwich never sees the previous day. Timestamped system-time stays local.
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', ...(day ? { timeZone: 'UTC' } : {}),
  }).format(ms)
}

export function memoryConfidence(value: number | null): string | null {
  if (value === null || !Number.isFinite(value)) return null
  return `${Math.round(value)}% confidence`
}
