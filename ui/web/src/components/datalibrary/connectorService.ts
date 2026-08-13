import type { RunnerStatus } from '../../lib/types'

export type ConnectorServiceDisplay = {
  state: 'starting' | 'checking' | 'online' | 'paused_drive' | 'disabled_admin' | 'blocked_unsafe' | 'foreign_writer'
  label: string
  note: string
  tone: 'good' | 'checking' | 'incident'
  icon: string
  autoRetryArmed: boolean
  host: string | null
  lastProgressAt: string | null
  intervalMin: number | null
}

const SERVICE_LABELS = {
  starting: 'Starting',
  checking: 'Checking',
  online: 'Online',
  paused_drive: 'Paused — Drive',
  disabled_admin: 'Disabled — admin',
  blocked_unsafe: 'Blocked — unsafe scheduler',
  foreign_writer: 'Foreign writer',
} as const
const FETCHER_KEYS = new Set([
  'contractVersion', 'state', 'note', 'autoRetryArmed', 'intervalMin', 'host', 'lastStartedAt',
  'lastProgressAt', 'lastCompletedAt', 'nextExpectedAt', 'processedRows', 'failedRows', 'skippedManifests',
])
const CONTROL_RE = /[\u0000-\u001f\u007f]/
const SAFE_HOST_RE = /^[^\u0000-\u0020\u007f]{1,255}$/
const DISPLAY_TIME_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
const displayTimestamp = (value: unknown): value is string | null =>
  value === null || (typeof value === 'string' && DISPLAY_TIME_RE.test(value)
    && Number.isFinite(Date.parse(value)) && new Date(Date.parse(value)).toISOString() === value)
const nonNegativeInt = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value >= 0
function exactFetcher(value: unknown): value is NonNullable<RunnerStatus['fetcher']> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const row = value as Record<string, unknown>
  const keys = Object.keys(row)
  const shape = keys.length === FETCHER_KEYS.size && keys.every((key) => FETCHER_KEYS.has(key))
    && row.contractVersion === 2 && Object.hasOwn(SERVICE_LABELS, String(row.state))
    && typeof row.note === 'string' && row.note.length > 0 && row.note.length <= 512
    && row.note.trim() === row.note && !CONTROL_RE.test(row.note)
    && typeof row.autoRetryArmed === 'boolean'
    && typeof row.intervalMin === 'number' && Number.isFinite(row.intervalMin) && row.intervalMin > 0
    && (row.host === null || (typeof row.host === 'string' && SAFE_HOST_RE.test(row.host)))
    && displayTimestamp(row.lastStartedAt) && displayTimestamp(row.lastProgressAt)
    && displayTimestamp(row.lastCompletedAt) && displayTimestamp(row.nextExpectedAt)
    && nonNegativeInt(row.processedRows) && nonNegativeInt(row.failedRows)
    && nonNegativeInt(row.skippedManifests) && row.failedRows <= row.processedRows
  if (!shape) return false
  if (row.state === 'online') {
    return row.autoRetryArmed === true && row.host !== null && row.lastStartedAt !== null
      && row.lastProgressAt !== null && row.lastCompletedAt !== null && row.nextExpectedAt !== null
      && (row.processedRows as number) > 0
  }
  if (row.state === 'checking') {
    return row.autoRetryArmed === true && row.host !== null && row.lastStartedAt !== null
      && row.lastProgressAt !== null && row.lastCompletedAt === null
  }
  return true
}

/** Exact-match only: an old or future server payload can explain nothing and can never paint the strip green. */
export function connectorServiceDisplay(fetcher: RunnerStatus['fetcher'] | undefined): ConnectorServiceDisplay {
  const exact = exactFetcher(fetcher)
  const state = exact ? fetcher.state : 'starting'
  return {
    state,
    label: SERVICE_LABELS[state],
    note: exact ? fetcher.note : 'Waiting for verified Mac Pro service status.',
    tone: state === 'online' ? 'good' : state === 'checking' ? 'checking' : 'incident',
    icon: state === 'online' ? '✓' : state === 'checking' ? '↻' : '!',
    autoRetryArmed: exact && fetcher.autoRetryArmed === true,
    host: exact ? fetcher.host : null,
    lastProgressAt: exact ? fetcher.lastProgressAt : null,
    intervalMin: exact && Number.isFinite(fetcher.intervalMin) ? fetcher.intervalMin : null,
  }
}
