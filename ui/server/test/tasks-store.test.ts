import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {
  isTaskId, newTaskId, readTasks, syncTaskWatchlist, syncWatchAssigneeToTask, writeTask,
  type TaskCard,
} from '../src/tasks'
import { makeListing, newEntryId, readEntries, writeEntry, type EngineWatchRow, type WatchEntry } from '../src/watchlist'

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tasks-store-'))
const tasksDir = path.join(root, 'tasks')
const entriesDir = path.join(root, 'entries')
let passed = 0
function check(name: string, fn: () => void): void {
  try { fn(); passed++; console.log('  ok ', name) } catch (error) { console.error('  FAIL', name); console.error(error); process.exitCode = 1 }
}

const card = (over: Partial<TaskCard> = {}): TaskCard => ({
  schema_version: 'task-card/v1', task_id: newTaskId(new Date('2026-08-26T12:00:00Z')),
  scope: 'ticker', ticker: 'AMZN', subject: 'AWS growth', title: 'Rebuild the segment model',
  stage: 'deep_dive', decision: null, assignee: 'CK', attachments: [], watchlist_entry_id: null,
  watchlist_created: false, history: [], created_at: '2026-08-26T12:00:00.000Z', created_by: 'test',
  updated_at: '2026-08-26T12:00:00.000Z', ...over,
})

const watch = (over: Partial<WatchEntry> = {}): WatchEntry => ({
  schema_version: 'watchlist-entry/v1', entry_id: newEntryId(new Date('2026-08-26T12:00:00Z')), origin: 'manual',
  listing: makeListing({ ticker: 'AMZN', currency: 'USD' }), engine_ref: null, why: 'independent reason',
  conviction: null, review_date: null, tags: [], triggers: [], attachments: [], assignee: null, task_id: null,
  archive: null, history: [], created_at: '2026-08-20T12:00:00.000Z', created_by: 'test',
  updated_at: '2026-08-20T12:00:00.000Z', ...over,
})

check('ids and atomic card round-trip', () => {
  const task = card()
  assert.equal(isTaskId(task.task_id), true)
  writeTask(task, tasksDir)
  assert.deepEqual(readTasks(tasksDir), { tasks: [task], unreadable: [] })
})

check('one unreadable card does not empty the board', () => {
  fs.writeFileSync(path.join(tasksDir, 'broken.json'), '{')
  const read = readTasks(tasksDir)
  assert.equal(read.tasks.length, 1)
  assert.deepEqual(read.unreadable, ['broken.json'])
})

check('Watch mints one linked watchlist row and carries the owner', () => {
  const task = card({ stage: 'final_decision', decision: 'watch', assignee: 'AB' })
  const result = syncTaskWatchlist(task, 'tester', entriesDir)
  assert.equal(result.changed, true)
  assert.equal(task.watchlist_created, true)
  assert.ok(task.watchlist_entry_id)
  const entry = readEntries(entriesDir).entries[0]
  assert.equal(entry.task_id, task.task_id)
  assert.equal(entry.assignee, 'AB')
  assert.equal(entry.why, task.title)
})

check('Watch reuses the engine listing instead of creating a default-currency duplicate', () => {
  fs.rmSync(entriesDir, { recursive: true, force: true })
  const task = card({ ticker: 'NHY', stage: 'final_decision', decision: 'watch', assignee: 'AB' })
  const engine: EngineWatchRow = {
    listing: makeListing({ ticker: 'NHY', currency: 'NOK', exchange: 'Oslo Børs', companyName: 'Norsk Hydro ASA' }),
    run_root: 'analyses/NHY_2026-07-19', decision: 'Watchlist', decision_date: '2026-07-19',
    size_in_trigger: null, next_review: '2026-08-18', next_review_text: null, entry_price: null,
    final_thesis_path: 'analyses/NHY_2026-07-19/final_thesis.md', fingerprint: 'engine-fingerprint',
  }

  syncTaskWatchlist(task, 'tester', entriesDir, engine)
  const entry = readEntries(entriesDir).entries[0]
  assert.equal(entry.listing.listing_key, 'NHY|NOK')
  assert.equal(entry.origin, 'engine')
  assert.equal(entry.engine_ref?.run_root, engine.run_root)
  assert.equal(task.watchlist_entry_id, entry.entry_id)
})

check('Watch reuses an independent row and never overwrites its reason', () => {
  fs.rmSync(entriesDir, { recursive: true, force: true })
  const existing = watch()
  writeEntry(existing, entriesDir)
  const task = card({ stage: 'final_decision', decision: 'watch', assignee: 'NV' })
  syncTaskWatchlist(task, 'tester', entriesDir)
  const entry = readEntries(entriesDir).entries[0]
  assert.equal(task.watchlist_entry_id, existing.entry_id)
  assert.equal(task.watchlist_created, false)
  assert.equal(entry.why, 'independent reason')
  assert.equal(entry.assignee, 'NV')
})

check('assignment changed in Watchlist flows back to the linked task', () => {
  fs.rmSync(tasksDir, { recursive: true, force: true })
  const task = card({ stage: 'final_decision', decision: 'watch', assignee: 'NV' })
  writeTask(task, tasksDir)
  const entry = watch({ task_id: task.task_id, assignee: 'CK' })
  const changed = syncWatchAssigneeToTask(entry, 'tester', tasksDir)
  assert.equal(changed?.assignee, 'CK')
  assert.equal(readTasks(tasksDir).tasks[0].assignee, 'CK')
})

check('leaving Watch archives only a task-created row', () => {
  fs.rmSync(entriesDir, { recursive: true, force: true })
  const task = card({ stage: 'final_decision', decision: 'watch' })
  syncTaskWatchlist(task, 'tester', entriesDir)
  task.decision = 'deploy'
  syncTaskWatchlist(task, 'tester', entriesDir)
  assert.ok(readEntries(entriesDir).entries[0].archive)

  fs.rmSync(entriesDir, { recursive: true, force: true })
  const independent = watch()
  writeEntry(independent, entriesDir)
  const reused = card({ stage: 'final_decision', decision: 'watch' })
  syncTaskWatchlist(reused, 'tester', entriesDir)
  reused.decision = 'reject'
  syncTaskWatchlist(reused, 'tester', entriesDir)
  const after = readEntries(entriesDir).entries[0]
  assert.equal(after.archive, null)
  assert.equal(after.task_id, null)
})

fs.rmSync(root, { recursive: true, force: true })
console.log(`\ntasks-store.test.ts: ${passed} passed`)
