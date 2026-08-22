import type { RunProvider } from './provider'
import type { ActivityRow, ResumableRunInfo, RunKind } from './types'

// Only report-producing pipeline steps form expandable run groups. Cross-cutting jobs can share durable
// folders without being part of the same execution and remain standalone rows.
const GROUPABLE_KINDS = new Set<RunKind>(['full', 'module', 'rerun', 'agent', 'signal', 'screener-agent'])

export interface ActivityRunGroup {
  /** Execution-scoped identity. Never a lifetime run-root when a current epoch is available. */
  key: string
  runRoot: string
  subjectId: string
  subjectLabel?: string
  swarm?: string
  children: ActivityRow[]
  startedAt: number
  lastAt: number
  isFull: boolean
  running: boolean
  status: string
  doneCount: number
  totalCount: number
  costUsd?: number
  durationMs?: number
  users: string[]
  provider: RunProvider | 'mixed' | 'unknown'
  profileKey: string | 'mixed' | 'unknown'
}

export type ActivityUnit = { kind: 'group'; group: ActivityRunGroup } | { kind: 'row'; row: ActivityRow }

const STATUS_SEVERITY: Record<string, number> = {
  starting: 6, running: 6, error: 5, incomplete: 4, cancelled: 3, done: 2,
}

function rollupStatus(children: ActivityRow[]): { status: string; running: boolean } {
  let worst = 'done'
  let running = false
  for (const child of children) {
    if (child.status === 'running' || child.status === 'starting') running = true
    if ((STATUS_SEVERITY[child.status] ?? 0) > (STATUS_SEVERITY[worst] ?? 0)) worst = child.status
  }
  return { status: running ? 'running' : worst, running }
}

/**
 * Prefer the backend's immutable execution epoch. Chained steps may expose only `chainId` during rolling
 * deploys, so it is the compatible alias. `runRoot` is deliberately only a legacy fallback: commodity
 * roots and resumed/retried folders can live forever, while provider/status/cost belong to one execution.
 */
export function activityExecutionKey(row: ActivityRow): string | null {
  const epoch = typeof row.executionEpoch === 'string' && row.executionEpoch.trim()
    ? row.executionEpoch.trim()
    : typeof row.chainId === 'string' && row.chainId.trim() ? row.chainId.trim() : null
  if (epoch) return `epoch:${epoch}`
  return row.runRoot ? `legacy-root:${row.runRoot}` : null
}

function makeGroup(key: string, membersNewestFirst: ActivityRow[]): ActivityRunGroup {
  const children = [...membersNewestFirst].sort((a, b) => a.launchedAt - b.launchedAt)
  const startedAt = children[0].launchedAt
  const lastAt = children[children.length - 1].launchedAt
  const { status, running } = rollupStatus(children)
  const now = Date.now()
  const intervals = children
    .map((child) => [
      child.launchedAt,
      child.finishedAt ?? (child.finishedAt == null && running ? now : child.launchedAt),
    ] as const)
    .filter(([start, finish]) => finish >= start)
    .sort((a, b) => a[0] - b[0])
  let durationMs = 0
  let currentStart: number | null = null
  let currentEnd = 0
  for (const [start, finish] of intervals) {
    if (currentStart === null) { currentStart = start; currentEnd = finish; continue }
    if (start <= currentEnd) { currentEnd = Math.max(currentEnd, finish); continue }
    durationMs += currentEnd - currentStart
    currentStart = start
    currentEnd = finish
  }
  if (currentStart !== null) durationMs += currentEnd - currentStart

  const costTotal = children.reduce((sum, child) => sum + (child.costUsd ?? 0), 0)
  const providers = new Set(children.map((child) => child.provider).filter((value): value is RunProvider => Boolean(value)))
  const hasUnattributedChild = children.some((child) => !child.provider)
  const profileKeys = new Set(children.map((child) => child.profileKey || child.executionProfile?.key).filter((value): value is string => Boolean(value)))
  const hasUnattributedProfile = children.some((child) => !(child.profileKey || child.executionProfile?.key))
  const roots = new Set(children.map((child) => child.runRoot).filter((value): value is string => Boolean(value)))
  const swarms = new Set(children.map((child) => child.swarm).filter((value): value is string => Boolean(value)))
  return {
    key,
    runRoot: roots.size === 1 && children.every((child) => !!child.runRoot) ? roots.values().next().value! : '',
    subjectId: children[0].ticker,
    subjectLabel: children.find((child) => child.subjectLabel)?.subjectLabel,
    swarm: swarms.size === 1 && children.every((child) => !!child.swarm) ? swarms.values().next().value! : undefined,
    children,
    startedAt,
    lastAt,
    isFull: children.some((child) => child.kind === 'full' || child.chained || child.module === 'master' || child.agent === 'synthesizer'),
    running,
    status,
    doneCount: children.filter((child) => child.status === 'done').length,
    totalCount: children.length,
    costUsd: children.some((child) => child.costUsd != null) ? costTotal : undefined,
    durationMs: Math.max(0, durationMs),
    users: [...new Set(children.map((child) => child.user))],
    // A single known provider plus an unattributed child is not a single-provider run. Keep it unknown
    // (partially observed) rather than laundering the missing child into the known sibling's attribution.
    provider: hasUnattributedChild ? 'unknown' : providers.size > 1 ? 'mixed' : (providers.values().next().value || 'unknown'),
    profileKey: hasUnattributedProfile ? 'unknown' : profileKeys.size > 1 ? 'mixed' : (profileKeys.values().next().value || 'unknown'),
  }
}

/**
 * A Resume affordance is a mutation of one exact retained folder. Legacy activity rows that do not carry
 * swarm + runRoot cannot be joined safely and therefore stay view-only. Chained children deliberately do
 * not alias to a full resume; the synthetic group parent carries the exact full identity instead.
 */
export function exactResumableForActivity(row: ActivityRow, entries: readonly ResumableRunInfo[]): ResumableRunInfo | undefined {
  if (!row.swarm || !row.runRoot || !['full', 'module', 'signal'].includes(row.kind)) return undefined
  if (row.kind === 'module' && !row.module) return undefined
  return entries.find((entry) => entry.kind === row.kind
    && entry.subject === row.ticker
    && entry.swarm === row.swarm
    && entry.runRoot === row.runRoot
    && (row.kind !== 'module' || entry.module === row.module))
}

/** Fold newest-first audit rows into execution-scoped render units. */
export function buildActivityUnits(rows: ActivityRow[], canGroup: boolean): { units: ActivityUnit[]; runCount: number } {
  const keyOf = (row: ActivityRow) => canGroup && !!row.runRoot && GROUPABLE_KINDS.has(row.kind)
    ? activityExecutionKey(row)
    : null
  const buckets = new Map<string, ActivityRow[]>()
  for (const row of rows) {
    const key = keyOf(row)
    if (!key) continue
    const bucket = buckets.get(key)
    if (bucket) bucket.push(row)
    else buckets.set(key, [row])
  }

  const emitted = new Set<string>()
  const units: ActivityUnit[] = []
  let runCount = 0
  for (const row of rows) {
    const key = keyOf(row)
    const bucket = key ? buckets.get(key) : undefined
    if (!key || !bucket || bucket.length < 2) {
      units.push({ kind: 'row', row })
      runCount++
      continue
    }
    if (emitted.has(key)) continue
    emitted.add(key)
    units.push({ kind: 'group', group: makeGroup(key, bucket) })
    runCount++
  }
  return { units, runCount }
}
