import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { buildTasksSnapshot } from './tasks-snapshot.mjs'

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tasks-snapshot-'))
const dir = path.join(root, 'watchlist', 'tasks')
fs.mkdirSync(dir, { recursive: true })
const task = {
  schema_version: 'task-card/v1', task_id: 'TASK-20260826-1234abcd', scope: 'ticker', ticker: 'AMZN',
  subject: 'AWS growth', title: 'Rebuild the segment model', stage: 'final_decision', decision: 'watch',
  assignee: 'AB', attachments: [{ attachment_id: 'file-1.md', filename: 'notes.md', bytes: 12,
    added_at: '2026-08-26T12:00:00.000Z', added_by: 'person@example.com' }],
  watchlist_entry_id: 'WL-20260826-1234abcd', watchlist_created: true,
  history: [{ at: '2026-08-26T12:00:00.000Z', by: 'person@example.com', action: 'created', detail: '' }],
  created_at: '2026-08-26T12:00:00.000Z', created_by: 'person@example.com', updated_at: '2026-08-26T12:00:00.000Z',
}
fs.writeFileSync(path.join(dir, `${task.task_id}.json`), JSON.stringify(task))
fs.writeFileSync(path.join(dir, 'broken.json'), '{')

const read = buildTasksSnapshot(root, '2026-08-26T13:00:00.000Z')
assert.equal(read.tasks.length, 1)
assert.equal(read.tasks[0].assignee, 'AB')
assert.equal(read.tasks[0].created_by, 'redacted')
assert.equal(read.tasks[0].history[0].by, 'redacted')
assert.equal(read.tasks[0].attachments[0].added_by, 'redacted')
assert.deepEqual(read.unreadable, ['broken.json'])
assert.equal(read.attachments_enabled, false)
assert.deepEqual(buildTasksSnapshot(path.join(root, 'missing')).tasks, [])

fs.rmSync(root, { recursive: true, force: true })
console.log('tasks snapshot: shared cards included, actor identity redacted, malformed rows isolated')
