// Shared research work board.
//
// Task records live beside the watchlist under watchlist/tasks/: both are human planning state, both are
// one-file-per-card so edits on different cards merge cleanly, and both use the existing serialized data
// publisher. A task that ends in Watch links to a normal watchlist entry; it does not create a second list.
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { REPO_ROOT } from './config'
import {
  WATCHLIST_ENTRIES_DIR,
  makeListing,
  newEntryId,
  readEntries,
  writeEntry,
  type EngineWatchRow,
  type WatchAttachment,
  type WatchEntry,
} from './watchlist'

export const TASKS_DIR = path.join(REPO_ROOT, 'watchlist', 'tasks')
export const TASK_ID_RE = /^TASK-[0-9]{8}-[a-f0-9]{8}$/
export const TASK_MAX_ATTACHMENTS = 5

export const TASK_PEOPLE = [
  { id: 'AB', name: 'Ayush Banka' },
  { id: 'NV', name: 'Noel Vaz' },
  { id: 'CK', name: 'Chiraag Kapil' },
] as const

export type TaskAssignee = typeof TASK_PEOPLE[number]['id']
export type TaskStage = 'idea_generation' | 'ticker_identified' | 'deep_dive' | 'final_decision'
export type TaskDecision = 'deploy' | 'reject' | 'watch'
export type TaskScope = 'ticker' | 'company_event' | 'world_event'

export interface TaskCard {
  schema_version: 'task-card/v1'
  task_id: string
  scope: TaskScope
  ticker: string | null
  subject: string
  title: string
  stage: TaskStage
  decision: TaskDecision | null
  assignee: TaskAssignee
  attachments: WatchAttachment[]
  watchlist_entry_id: string | null
  /** Only a task-created watchlist row may be archived automatically when the outcome changes. */
  watchlist_created: boolean
  history: { at: string; by: string; action: string; detail: string }[]
  created_at: string
  created_by: string
  updated_at: string
}

const ASSIGNEES = new Set<string>(TASK_PEOPLE.map((p) => p.id))
const STAGES = new Set<TaskStage>(['idea_generation', 'ticker_identified', 'deep_dive', 'final_decision'])
const DECISIONS = new Set<TaskDecision>(['deploy', 'reject', 'watch'])
const SCOPES = new Set<TaskScope>(['ticker', 'company_event', 'world_event'])

export const isTaskId = (value: unknown): value is string => typeof value === 'string' && TASK_ID_RE.test(value)

export function newTaskId(now: Date = new Date()): string {
  const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
  return `TASK-${date}-${crypto.randomBytes(4).toString('hex')}`
}

function taskShape(value: unknown): value is TaskCard {
  const task = value as TaskCard
  return !!task && typeof task === 'object' && !Array.isArray(task)
    && task.schema_version === 'task-card/v1' && isTaskId(task.task_id)
    && SCOPES.has(task.scope) && STAGES.has(task.stage)
    && (task.decision === null || DECISIONS.has(task.decision))
    && ASSIGNEES.has(task.assignee)
    && typeof task.subject === 'string' && typeof task.title === 'string'
    && Array.isArray(task.attachments) && Array.isArray(task.history)
}

/** One broken JSON card degrades only itself. */
export function readTasks(dir: string = TASKS_DIR): { tasks: TaskCard[]; unreadable: string[] } {
  const tasks: TaskCard[] = []
  const unreadable: string[] = []
  let names: string[] = []
  try { names = fs.readdirSync(dir).filter((name) => name.endsWith('.json')).sort() } catch { return { tasks, unreadable } }
  for (const name of names) {
    try {
      const value = JSON.parse(fs.readFileSync(path.join(dir, name), 'utf8'))
      if (taskShape(value)) tasks.push(value)
      else unreadable.push(name)
    } catch { unreadable.push(name) }
  }
  tasks.sort((a, b) => String(b.updated_at).localeCompare(String(a.updated_at)))
  return { tasks, unreadable }
}

export function writeTask(task: TaskCard, dir: string = TASKS_DIR): void {
  fs.mkdirSync(dir, { recursive: true })
  const file = path.join(dir, `${task.task_id}.json`)
  const tmp = `${file}.tmp-${process.pid}-${crypto.randomBytes(4).toString('hex')}`
  try {
    fs.writeFileSync(tmp, `${JSON.stringify(task, null, 2)}\n`)
    fs.renameSync(tmp, file)
  } finally {
    try { fs.unlinkSync(tmp) } catch { /* renamed on success */ }
  }
}

export const taskPath = (taskId: string) => `watchlist/tasks/${taskId}.json`

export interface TaskWatchSync {
  entry: WatchEntry | null
  changed: boolean
}

/**
 * Make the Watch outcome and the watchlist one state transition. This mutates `task` with the durable
 * link. An existing watchlist row is reused and never auto-archived later; only a row minted for this
 * task is removed from the active list when the outcome changes.
 */
export function syncTaskWatchlist(
  task: TaskCard,
  actor: string,
  entriesDir: string = WATCHLIST_ENTRIES_DIR,
  engineCandidate: EngineWatchRow | null = null,
): TaskWatchSync {
  const { entries } = readEntries(entriesDir)
  const linked = task.watchlist_entry_id ? entries.find((entry) => entry.entry_id === task.watchlist_entry_id) ?? null : null
  const shouldWatch = task.stage === 'final_decision' && task.decision === 'watch' && !!task.ticker

  if (!shouldWatch) {
    if (!linked) return { entry: null, changed: false }
    if (task.watchlist_created && !linked.archive) {
      const at = new Date().toISOString()
      linked.archive = { at, by: actor, reason: `Task outcome changed to ${task.decision ?? task.stage}`, muted_fingerprint: null, mute_scope: 'listing' }
      linked.updated_at = at
      linked.history = [...linked.history, { at, by: actor, action: 'archived', detail: 'task outcome changed' }].slice(-50)
      writeEntry(linked, entriesDir)
      return { entry: linked, changed: true }
    }
    // An independently-created watchlist row stays on the list; only remove the task link.
    if (linked.task_id === task.task_id) {
      linked.task_id = null
      linked.updated_at = new Date().toISOString()
      writeEntry(linked, entriesDir)
      return { entry: linked, changed: true }
    }
    return { entry: linked, changed: false }
  }

  const ticker = task.ticker!
  let entry = linked
  if (!entry) {
    // A task names a ticker, not a currency. If the engine already projects that ticker into the
    // Watchlist, adopt its exact listing key so the task decorates that row instead of manufacturing a
    // second USD-by-default row alongside (for example) an existing NOK primary listing.
    if (engineCandidate?.listing.ticker === ticker) {
      entry = entries.find((candidate) => candidate.listing?.listing_key === engineCandidate.listing.listing_key && !candidate.archive) ?? null
    }
    // Prefer an already-active row for this ticker. If currency creates more than one listing, the newest
    // user-touched row is the least surprising target; no second ticker-only row is manufactured.
    if (!entry) {
      const sameTicker = entries.filter((candidate) => candidate.listing?.ticker === ticker && !candidate.archive)
      entry = sameTicker.sort((a, b) => String(b.updated_at).localeCompare(String(a.updated_at)))[0] ?? null
    }
  }
  const at = new Date().toISOString()
  if (!entry) {
    const engine = engineCandidate?.listing.ticker === ticker ? engineCandidate : null
    const listing = engine?.listing ?? makeListing({ ticker })
    entry = {
      schema_version: 'watchlist-entry/v1', entry_id: newEntryId(new Date()), origin: engine ? 'engine' : 'manual', listing,
      engine_ref: engine ? {
        run_root: engine.run_root, decision: engine.decision, decision_date: engine.decision_date, fingerprint: engine.fingerprint,
      } : null,
      why: task.title, conviction: null, review_date: engine?.next_review ?? null, tags: ['task'], triggers: [],
      attachments: [], assignee: task.assignee, task_id: task.task_id, archive: null,
      history: [{ at, by: actor, action: 'created', detail: 'from Tasks · Watch decision' }],
      created_at: at, created_by: actor, updated_at: at,
    }
    task.watchlist_created = true
  } else {
    entry.assignee = task.assignee
    entry.task_id = task.task_id
    entry.archive = null
    entry.updated_at = at
    entry.history = [...entry.history, { at, by: actor, action: 'linked-task', detail: task.task_id }].slice(-50)
  }
  writeEntry(entry, entriesDir)
  task.watchlist_entry_id = entry.entry_id
  return { entry, changed: true }
}

/** Assignment edits from Watchlist immediately update the linked Kanban card. */
export function syncWatchAssigneeToTask(
  entry: WatchEntry,
  actor: string,
  tasksDir: string = TASKS_DIR,
): TaskCard | null {
  if (!entry.task_id || !isTaskId(entry.task_id) || !entry.assignee || !ASSIGNEES.has(entry.assignee)) return null
  const task = readTasks(tasksDir).tasks.find((candidate) => candidate.task_id === entry.task_id)
  if (!task || task.assignee === entry.assignee) return task ?? null
  const at = new Date().toISOString()
  task.assignee = entry.assignee as TaskAssignee
  task.updated_at = at
  task.history = [...task.history, { at, by: actor, action: 'assigned', detail: `${entry.assignee} · from Watchlist` }].slice(-50)
  writeTask(task, tasksDir)
  return task
}
