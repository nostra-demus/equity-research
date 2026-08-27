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

/** Send the complete state the user can see so a later queued save also retries any earlier quick edit. */
export function taskUpdateInput(task: TaskCard): TaskInput {
  return {
    scope: task.scope,
    ticker: task.ticker,
    subject: task.subject,
    title: task.title,
    stage: task.stage,
    decision: task.decision,
    assignee: task.assignee,
  }
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
