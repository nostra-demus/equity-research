import type { TaskCard, TaskInput, TasksRead } from '../../lib/types'

export function taskTickerInput(task: Pick<TaskCard, 'ticker' | 'ticker_label'>): string {
  return task.ticker_label || task.ticker || ''
}

export function taskLabel(task: Pick<TaskCard, 'ticker' | 'ticker_label' | 'subject' | 'title'>): string {
  return task.subject.trim() || taskTickerInput(task) || task.title.trim() || 'Untitled task'
}

const TASK_TICKER_JUNK = new Set(['NULL', 'NONE', 'N/A', 'NA', 'N.A', 'UNKNOWN', 'TBD', 'PRIVATE', 'UNLISTED', 'OTC', 'IPO'])

function taskTickerIdentity(value: string | null | undefined): Pick<TaskCard, 'ticker' | 'ticker_label'> {
  const raw = String(value ?? '').trim()
  const normalized = raw.toUpperCase()
  const usable = normalized.length > 0 && normalized.length <= 15 && !TASK_TICKER_JUNK.has(normalized)
    && /^[A-Z0-9][A-Z0-9.\-&]*$/.test(normalized)
    && !/^\d{7,}$/.test(normalized.replace(/[.\-]/g, ''))
  return usable ? { ticker: normalized, ticker_label: null } : { ticker: null, ticker_label: raw || null }
}

/** Apply the same small-field rules as PATCH /api/tasks without waiting for its durable publication. */
export function optimisticTask(task: TaskCard, patch: Partial<TaskInput>): TaskCard {
  const stage = patch.stage ?? task.stage
  const decision = stage === 'final_decision'
    ? (patch.decision !== undefined ? patch.decision : task.decision)
    : null
  const identity = patch.ticker === undefined
    ? { ticker: task.ticker, ticker_label: task.ticker_label }
    : taskTickerIdentity(patch.ticker)
  return {
    ...task,
    scope: patch.scope ?? task.scope,
    ...identity,
    subject: patch.subject ?? task.subject,
    title: patch.title ?? task.title,
    stage,
    decision,
    assignee: patch.assignee ?? task.assignee,
  }
}

/** Combine only fields this browser changed; untouched fields stay owned by the latest server card. */
export function mergeTaskUpdatePatches(...patches: (Partial<TaskInput> | undefined)[]): Partial<TaskInput> {
  return Object.assign({}, ...patches.filter(Boolean))
}

/** Did the server apply every field in this browser's patch? Used after an unknown timeout outcome. */
export function taskMatchesPatch(task: TaskCard, patch: Partial<TaskInput>): boolean {
  return (patch.scope === undefined || task.scope === patch.scope)
    && (patch.ticker === undefined
      || taskTickerInput(task).trim().toUpperCase() === String(patch.ticker ?? '').trim().toUpperCase())
    && (patch.subject === undefined || task.subject === patch.subject)
    && (patch.title === undefined || task.title === patch.title)
    && (patch.stage === undefined || task.stage === patch.stage)
    && (patch.decision === undefined || task.decision === patch.decision)
    && (patch.assignee === undefined || task.assignee === patch.assignee)
}

/** Only failures that can plausibly succeed unchanged should be folded into the next queued edit. */
export function retryableTaskUpdateError(cause: any): boolean {
  const status = Number(cause?.status)
  if (!Number.isFinite(status)) return true
  if (status >= 500) return true
  return status === 409 && String(cause?.message ?? '').includes('Tasks and Watchlist are being updated')
}

export function replaceTask(read: TasksRead | null, task: TaskCard): TasksRead | null {
  if (!read) return read
  return { ...read, tasks: read.tasks.map((candidate) => candidate.task_id === task.task_id ? task : candidate) }
}

/** A background refresh must not repaint a card with stale server state while its save is still queued. */
export function overlayOptimisticTasks(read: TasksRead, optimistic: ReadonlyMap<string, TaskCard>): TasksRead {
  if (!optimistic.size) return read
  return {
    ...read,
    tasks: read.tasks.map((task) => optimistic.get(task.task_id) ?? task),
  }
}
