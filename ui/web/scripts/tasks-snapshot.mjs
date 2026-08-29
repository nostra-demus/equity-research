// Public, read-only Tasks projection for the static cockpit.
//
// Task text and initials are shared planning state, like the Watchlist already included in the snapshot.
// Authenticated actor names/emails are not: replace those fields before the JSON reaches Pages, and fail
// closed on malformed cards so one hand-edited file cannot break the whole static board.
import fs from 'node:fs'
import path from 'node:path'

const TASK_ID_RE = /^TASK-[0-9]{8}-[a-f0-9]{8}$/
const WATCH_ID_RE = /^WL-[0-9]{8}-[a-f0-9]{8}$/
const SCOPES = new Set(['ticker', 'company_event', 'world_event'])
const STAGES = new Set(['idea_generation', 'ticker_identified', 'deep_dive', 'final_decision'])
const DECISIONS = new Set(['deploy', 'reject', 'watch'])
const ASSIGNEES = new Set(['AB', 'NV', 'CK'])
const PEOPLE = [
  { id: 'AB', name: 'Ayush Banka' },
  { id: 'NV', name: 'Noel Vaz' },
  { id: 'CK', name: 'Chiraag Kapil' },
]
const ticker = (value) => value === null || (typeof value === 'string' && value.length <= 15
  && /^[A-Z0-9][A-Z0-9.\-&]*$/.test(value) && !/^\d{7,}$/.test(value.replace(/[.\-]/g, '')))
const tickerLabel = (value) => value === undefined || value === null || (typeof value === 'string'
  && value.length > 0 && value.length <= 240 && value.trim() === value)

const timestamp = (value) => typeof value === 'string' && value.length <= 40 && Number.isFinite(Date.parse(value))
const basename = (value) => typeof value === 'string' && value.length > 0 && value.length <= 500
  && path.basename(value) === value && value !== '.' && value !== '..'
const attachment = (value) => value && typeof value === 'object' && !Array.isArray(value)
  && basename(value.attachment_id) && basename(value.filename)
  && typeof value.bytes === 'number' && Number.isFinite(value.bytes) && value.bytes >= 0
  && timestamp(value.added_at) && typeof value.added_by === 'string'
const historyRow = (value) => value && typeof value === 'object' && !Array.isArray(value)
  && timestamp(value.at) && typeof value.by === 'string' && typeof value.action === 'string' && typeof value.detail === 'string'

function validTask(task) {
  return task && typeof task === 'object' && !Array.isArray(task) && task.schema_version === 'task-card/v1'
    && TASK_ID_RE.test(task.task_id) && SCOPES.has(task.scope) && STAGES.has(task.stage)
    && (task.decision === null || DECISIONS.has(task.decision))
    && (task.stage === 'final_decision' || task.decision === null)
    && ASSIGNEES.has(task.assignee) && ticker(task.ticker) && tickerLabel(task.ticker_label)
    && typeof task.subject === 'string' && task.subject.length <= 240
    && typeof task.title === 'string' && task.title.length <= 4000
    && Array.isArray(task.attachments) && task.attachments.length <= 5 && task.attachments.every(attachment)
    && (task.watchlist_entry_id === null || WATCH_ID_RE.test(task.watchlist_entry_id))
    && typeof task.watchlist_created === 'boolean'
    && Array.isArray(task.history) && task.history.length <= 50 && task.history.every(historyRow)
    && timestamp(task.created_at) && typeof task.created_by === 'string' && timestamp(task.updated_at)
}

export function buildTasksSnapshot(repoRoot, asOf = new Date().toISOString()) {
  const tasks = []
  const unreadable = []
  const dir = path.join(repoRoot, 'watchlist', 'tasks')
  let names = []
  try { names = fs.readdirSync(dir).filter((name) => name.endsWith('.json')).sort() } catch { /* empty board */ }
  for (const name of names) {
    try {
      const task = JSON.parse(fs.readFileSync(path.join(dir, name), 'utf8'))
      if (!validTask(task)) { unreadable.push(name); continue }
      tasks.push({
        ...task,
        ticker_label: task.ticker_label ?? null,
        attachments: task.attachments.map((item) => ({ ...item, added_by: 'redacted' })),
        history: task.history.map((item) => ({ ...item, by: 'redacted' })),
        created_by: 'redacted',
      })
    } catch { unreadable.push(name) }
  }
  tasks.sort((a, b) => String(b.updated_at).localeCompare(String(a.updated_at)))
  return { tasks, people: PEOPLE, unreadable, attachments_enabled: false, as_of: asOf }
}
