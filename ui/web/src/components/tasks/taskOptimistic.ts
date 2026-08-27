import type { TaskCard, TaskInput, TasksRead } from '../../lib/types'

/** Apply the same small-field rules as PATCH /api/tasks without waiting for its durable publication. */
export function optimisticTask(task: TaskCard, patch: Partial<TaskInput>): TaskCard {
  const stage = patch.stage ?? task.stage
  const decision = stage === 'final_decision'
    ? (patch.decision !== undefined ? patch.decision : task.decision)
    : null
  return {
    ...task,
    scope: patch.scope ?? task.scope,
    ticker: patch.ticker === undefined ? task.ticker : patch.ticker,
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
    && (patch.ticker === undefined || task.ticker === patch.ticker)
    && (patch.subject === undefined || task.subject === patch.subject)
    && (patch.title === undefined || task.title === patch.title)
    && (patch.stage === undefined || task.stage === patch.stage)
    && (patch.decision === undefined || task.decision === patch.decision)
    && (patch.assignee === undefined || task.assignee === patch.assignee)
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
