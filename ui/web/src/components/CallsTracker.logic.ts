import type { CallSummary, CallsResult, CallUpdate } from '../lib/types'

export interface CallGroup {
  ticker: string
  latest: CallSummary
  history: CallSummary[]
  calls: CallSummary[]
}

type IndexedCall = { call: CallSummary; index: number }
type IndexedUpdate = { update: CallUpdate; index: number }

function timestamp(value?: string | null): number {
  if (!value) return Number.NEGATIVE_INFINITY
  const parsed = Date.parse(value)
  return Number.isFinite(parsed) ? parsed : Number.NEGATIVE_INFINITY
}

/**
 * Groups calls without deduplicating them. The array index is the final tie-breaker so two
 * same-day (or even byte-identical) ledger rows remain separate, in backend order.
 */
export function groupCallsByTicker(input: readonly CallSummary[]): CallGroup[] {
  const grouped = new Map<string, { firstIndex: number; rows: IndexedCall[] }>()
  input.forEach((call, index) => {
    const current = grouped.get(call.ticker)
    if (current) current.rows.push({ call, index })
    else grouped.set(call.ticker, { firstIndex: index, rows: [{ call, index }] })
  })

  return [...grouped.entries()]
    .map(([ticker, group]) => {
      const rows = [...group.rows].sort((a, b) => timestamp(b.call.decision_date) - timestamp(a.call.decision_date) || a.index - b.index)
      const calls = rows.map(({ call }) => call)
      return { ticker, latest: calls[0], history: calls.slice(1), calls, firstIndex: group.firstIndex }
    })
    .sort((a, b) => timestamp(b.latest.decision_date) - timestamp(a.latest.decision_date) || a.firstIndex - b.firstIndex)
    .map(({ firstIndex: _firstIndex, ...group }) => group)
}

/** Stable, newest-first ordering. Duplicate ids are deliberately retained. */
export function sortCallUpdates(input: readonly CallUpdate[]): CallUpdate[] {
  return input
    .map((update, index): IndexedUpdate => ({ update, index }))
    .sort((a, b) => timestamp(b.update.at) - timestamp(a.update.at) || a.index - b.index)
    .map(({ update }) => update)
}

export function splitCallUpdates(input: readonly CallUpdate[], recentLimit = 10): {
  ordered: CallUpdate[]
  recent: CallUpdate[]
  earlier: CallUpdate[]
} {
  const ordered = sortCallUpdates(input)
  const limit = Math.max(0, Math.floor(recentLimit))
  return { ordered, recent: ordered.slice(0, limit), earlier: ordered.slice(limit) }
}

/** Keep every real new artifact, including one whose day-only timestamp sorts behind an older update. */
export function unseenCallUpdates(input: readonly CallUpdate[], seenIds: ReadonlySet<string>): CallUpdate[] {
  return sortCallUpdates(input).filter((update) => !seenIds.has(update.id))
}

export interface CallUpdateToast {
  message: string
  tone: 'good' | 'bad' | 'info'
}

/** One honest alert for one update or a whole between-polls batch. */
export function callUpdateToast(input: readonly CallUpdate[]): CallUpdateToast | null {
  if (!input.length) return null
  if (input.length === 1) {
    const update = input[0]
    return {
      message: update.headline,
      tone: update.tone === 'worse' ? 'bad' : update.tone === 'better' ? 'good' : 'info',
    }
  }

  const tickers = [...new Set(input.map((update) => update.ticker).filter(Boolean))]
  const scope = tickers.length === 0
    ? ''
    : tickers.length <= 3
      ? ` for ${tickers.join(', ')}`
      : ` across ${tickers.length} companies`
  const hasBetter = input.some((update) => update.tone === 'better')
  const hasWorse = input.some((update) => update.tone === 'worse')
  return {
    message: `${input.length} automatic call updates${scope} are ready.`,
    // A mixed batch must not look wholly good or wholly bad.
    tone: hasBetter === hasWorse ? 'info' : hasWorse ? 'bad' : 'good',
  }
}

export function integrityLabel(status?: CallSummary['integrity_status'] | null): string {
  if (status === 'verified') return 'Passed'
  if (status === 'provisional') return 'Not ready'
  return 'Not checked'
}

export function plainStatus(value?: string | null): string {
  if (!value) return 'Awaiting first review'
  return value
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, (letter) => letter.toUpperCase())
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** Date-only ledger values stay date-only, rather than shifting a day in western time zones. */
export function callDateLabel(value?: string | null): string {
  if (!value) return 'Not dated'
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) {
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return value
    return `${parsed.getDate()} ${MONTHS[parsed.getMonth()]} ${parsed.getFullYear()}`
  }
  const month = Number(match[2])
  const day = Number(match[3])
  return month >= 1 && month <= 12 && day >= 1 && day <= 31 ? `${day} ${MONTHS[month - 1]} ${match[1]}` : value
}

export function momentLabel(value?: string | null): string {
  if (!value) return 'Not available yet'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(parsed)
}

export function updateToneLabel(tone: CallUpdate['tone']): string {
  if (tone === 'better') return 'Improved'
  if (tone === 'worse') return 'Worsened'
  if (tone === 'same') return 'No change'
  return 'Update'
}

/** The lead promise must never contradict a stopped or unhealthy automatic worker. */
export function automationPromise(automation?: CallsResult['automation']): string {
  if (!automation) return 'Automatic checks are getting ready'
  if (!automation.enabled) return 'Automatic checks are off'
  if (automation.state === 'needs_attention') return 'Automatic checks need attention'
  return 'You do not need to do anything'
}

export function updateArtifactLabel(kind: CallUpdate['kind']): string {
  if (kind === 'call') return 'Open thesis'
  if (kind === 'review') return 'Open review'
  return 'Open data check'
}

export function updateArtifactTitle(update: Pick<CallUpdate, 'kind' | 'ticker'>): string {
  if (update.kind === 'call') return `Investment Thesis — ${update.ticker}`
  if (update.kind === 'review') return `Review Update — ${update.ticker}`
  return `Data Check — ${update.ticker}`
}
