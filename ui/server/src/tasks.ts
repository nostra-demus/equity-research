// Shared research work board.
//
// Task records live beside the watchlist under watchlist/tasks/: both are human planning state, both are
// one-file-per-card so edits on different cards merge cleanly, and both use the existing serialized data
// publisher. A task that ends in Watch links to a normal watchlist entry; it does not create a second list.
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { REPO_ROOT } from './config'
import { cleanTicker } from './news/symbology'
import {
  WATCHLIST_MAX_ROWS,
  WATCHLIST_ENTRIES_DIR,
  isWatchId,
  makeListing,
  newEntryId,
  pickEntryForListing,
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
  /** A normalized exchange symbol. Only this field may drive Watchlist/research integration. */
  ticker: string | null
  /** Free-form planning text entered in the ticker box when it is not an exchange symbol. */
  ticker_label: string | null
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

const safeStoredName = (value: unknown, max = 500): value is string => typeof value === 'string'
  && value.length > 0 && value.length <= max && path.basename(value) === value && value !== '.' && value !== '..'
const isoTimestamp = (value: unknown): value is string => typeof value === 'string'
  && value.length <= 40 && Number.isFinite(Date.parse(value))
const historyShape = (value: unknown): value is TaskCard['history'][number] => {
  const row = value as TaskCard['history'][number]
  return !!row && typeof row === 'object' && !Array.isArray(row) && isoTimestamp(row.at)
    && typeof row.by === 'string' && row.by.length <= 160
    && typeof row.action === 'string' && row.action.length > 0 && row.action.length <= 80
    && typeof row.detail === 'string' && row.detail.length <= 1000
}
const attachmentShape = (value: unknown): value is WatchAttachment => {
  const attachment = value as WatchAttachment
  return !!attachment && typeof attachment === 'object' && !Array.isArray(attachment)
    && safeStoredName(attachment.attachment_id) && safeStoredName(attachment.filename)
    && typeof attachment.bytes === 'number' && Number.isFinite(attachment.bytes) && attachment.bytes >= 0
    && isoTimestamp(attachment.added_at) && typeof attachment.added_by === 'string' && attachment.added_by.length <= 160
}

export const isTaskId = (value: unknown): value is string => typeof value === 'string' && TASK_ID_RE.test(value)

export function newTaskId(now: Date = new Date()): string {
  const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
  return `TASK-${date}-${crypto.randomBytes(4).toString('hex')}`
}

/**
 * Task intake is intentionally broader than market symbology. Preserve anything that is not a usable
 * exchange symbol as a planning label; it must never block the card or leak into Watchlist identity.
 */
export function taskTickerIdentity(value: unknown): { ticker: string | null; ticker_label: string | null } {
  const raw = String(value ?? '').trim()
  if (!raw) return { ticker: null, ticker_label: null }
  const ticker = cleanTicker(raw)
  return ticker ? { ticker, ticker_label: null } : { ticker: null, ticker_label: raw }
}

export function taskTickerInput(task: Pick<TaskCard, 'ticker' | 'ticker_label'>): string {
  return task.ticker_label || task.ticker || ''
}

function taskShape(value: unknown): value is TaskCard {
  const task = value as TaskCard
  return !!task && typeof task === 'object' && !Array.isArray(task)
    && task.schema_version === 'task-card/v1' && isTaskId(task.task_id)
    && SCOPES.has(task.scope) && STAGES.has(task.stage)
    && (task.decision === null || DECISIONS.has(task.decision))
    && (task.stage === 'final_decision' || task.decision === null)
    && ASSIGNEES.has(task.assignee)
    && (task.ticker === null || (typeof task.ticker === 'string' && task.ticker.length > 0 && task.ticker.length <= 24
      && cleanTicker(task.ticker) === task.ticker))
    && (task.ticker_label === undefined || task.ticker_label === null
      || (typeof task.ticker_label === 'string' && task.ticker_label.length > 0 && task.ticker_label.length <= 240
        && task.ticker_label.trim() === task.ticker_label))
    && typeof task.subject === 'string' && task.subject.length <= 240
    && typeof task.title === 'string' && task.title.length <= 4000
    && Array.isArray(task.attachments) && task.attachments.length <= TASK_MAX_ATTACHMENTS && task.attachments.every(attachmentShape)
    && (task.watchlist_entry_id === null || isWatchId(task.watchlist_entry_id))
    && typeof task.watchlist_created === 'boolean'
    && Array.isArray(task.history) && task.history.length <= 50 && task.history.every(historyShape)
    && isoTimestamp(task.created_at) && typeof task.created_by === 'string' && task.created_by.length <= 160
    && isoTimestamp(task.updated_at)
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
      if (taskShape(value)) {
        // Cards written before ticker_label existed remain valid and receive the API's complete shape.
        if (value.ticker_label === undefined) value.ticker_label = null
        tasks.push(value)
      }
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
  changedEntries: WatchEntry[]
  problem?: string
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
  // A Watch decision without a usable symbol remains a valid planning card. It simply has no Watchlist
  // side effect until a real symbol is added later.
  const shouldWatch = task.stage === 'final_decision' && task.decision === 'watch' && !!task.ticker
  const changedEntries: WatchEntry[] = []
  const persist = (entry: WatchEntry) => {
    writeEntry(entry, entriesDir)
    if (!changedEntries.some((candidate) => candidate.entry_id === entry.entry_id)) changedEntries.push(entry)
  }

  if (!shouldWatch) {
    if (!linked || linked.task_id !== task.task_id) return { entry: linked, changed: false, changedEntries }
    const at = new Date().toISOString()
    if (task.watchlist_created && !linked.archive) {
      linked.archive = { at, by: actor, reason: `Task outcome changed to ${task.decision ?? task.stage}`, muted_fingerprint: null, mute_scope: 'listing' }
      linked.history = [...linked.history, { at, by: actor, action: 'archived', detail: 'task outcome changed' }].slice(-50)
    }
    linked.task_id = null
    linked.updated_at = at
    linked.history = [...linked.history, { at, by: actor, action: 'unlinked-task', detail: task.task_id }].slice(-50)
    persist(linked)
    return { entry: linked, changed: true, changedEntries }
  }

  const ticker = task.ticker!
  const otherOwner = entries.find((candidate) => candidate.listing?.ticker === ticker
    && candidate.task_id && candidate.task_id !== task.task_id)
  if (otherOwner) return {
    entry: linked, changed: false, changedEntries,
    problem: `${ticker} already has a Final Decision · Watch task. Keep one owner for the Watchlist row.`,
  }

  // A saved link is authoritative only while it still names the same ticker. Editing AMZN -> TSLA must
  // never repaint the AMZN Watchlist row as if it represented the new task.
  let entry = linked?.listing.ticker === ticker ? linked : null
  if (!entry && engineCandidate?.listing.ticker === ticker) {
    entry = pickEntryForListing(entries, engineCandidate.listing.listing_key)
  }
  if (!entry) {
    // With no exact engine listing, one archived same-ticker row is still the best identity we have.
    // Restore it instead of minting a currency-less duplicate that strands its notes and triggers.
    // More than one listing is ambiguous regardless of archive state; never guess the venue/currency.
    const sameTicker = entries.filter((candidate) => candidate.listing?.ticker === ticker)
    if (sameTicker.length > 1) return {
      entry: linked, changed: false, changedEntries,
      problem: `${ticker} has more than one listing. Use the exact listing in Watchlist first, then retry.`,
    }
    entry = sameTicker[0] ?? null
  }
  if (entry?.task_id && entry.task_id !== task.task_id) return {
    entry: linked, changed: false, changedEntries,
    problem: `${ticker} is already linked to another task.`,
  }
  if (!entry && entries.length >= WATCHLIST_MAX_ROWS) return {
    entry: linked, changed: false, changedEntries, problem: 'The Watchlist is full.',
  }

  const at = new Date().toISOString()
  // Retargeting detaches the old relationship first, but only after the new target has passed every
  // ambiguity and ownership check above. This prevents a failed edit from partially unlinking the card.
  if (linked && linked.entry_id !== entry?.entry_id && linked.task_id === task.task_id) {
    if (task.watchlist_created && !linked.archive) {
      linked.archive = { at, by: actor, reason: `Task ticker changed to ${ticker}`, muted_fingerprint: null, mute_scope: 'listing' }
      linked.history = [...linked.history, { at, by: actor, action: 'archived', detail: 'task ticker changed' }].slice(-50)
    }
    linked.task_id = null
    linked.updated_at = at
    linked.history = [...linked.history, { at, by: actor, action: 'unlinked-task', detail: task.task_id }].slice(-50)
    persist(linked)
  }
  if (linked && linked.entry_id !== entry?.entry_id) task.watchlist_created = false

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
    const relationshipChanged = entry.task_id !== task.task_id || !!entry.archive || task.watchlist_entry_id !== entry.entry_id
    const assignmentChanged = entry.assignee !== task.assignee
    const priorAssignee = entry.assignee
    entry.assignee = task.assignee
    entry.task_id = task.task_id
    entry.archive = null
    entry.updated_at = at
    if (relationshipChanged) entry.history = [...entry.history, { at, by: actor, action: 'linked-task', detail: task.task_id }].slice(-50)
    if (assignmentChanged) entry.history = [...entry.history, {
      at, by: actor, action: 'assigned', detail: `${priorAssignee ?? 'unassigned'} → ${task.assignee} · from Tasks`,
    }].slice(-50)
    if (!relationshipChanged && !assignmentChanged) {
      task.watchlist_entry_id = entry.entry_id
      return { entry, changed: changedEntries.length > 0, changedEntries }
    }
  }
  persist(entry)
  task.watchlist_entry_id = entry.entry_id
  return { entry, changed: true, changedEntries }
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
