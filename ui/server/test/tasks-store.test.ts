import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {
  isTaskId, newTaskId, readTasks, syncTaskWatchlist, syncWatchAssigneeToTask, taskTickerIdentity, writeTask,
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
  scope: 'ticker', ticker: 'AMZN', ticker_label: null, subject: 'AWS growth', title: 'Rebuild the segment model',
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

check('free-form ticker labels and empty task fields remain valid planning cards', () => {
  const identity = taskTickerIdentity('NU HOLDINGS LTD.')
  assert.deepEqual(identity, { ticker: null, ticker_label: 'NU HOLDINGS LTD.' })
  assert.deepEqual(taskTickerIdentity('nu'), { ticker: 'NU', ticker_label: null })
  const freeformDir = path.join(root, 'freeform')
  const task = card({ ...identity, subject: '', title: '', stage: 'deep_dive' })
  writeTask(task, freeformDir)
  assert.deepEqual(readTasks(freeformDir), { tasks: [task], unreadable: [] })
})

check('legacy cards without ticker_label are normalized on read', () => {
  const legacyDir = path.join(root, 'legacy')
  const task = card()
  const legacy = { ...task } as Partial<TaskCard>
  delete legacy.ticker_label
  fs.mkdirSync(legacyDir, { recursive: true })
  fs.writeFileSync(path.join(legacyDir, `${task.task_id}.json`), JSON.stringify(legacy))
  assert.equal(readTasks(legacyDir).tasks[0]?.ticker_label, null)
})

check('one unreadable card does not empty the board', () => {
  fs.writeFileSync(path.join(tasksDir, 'broken.json'), '{')
  const read = readTasks(tasksDir)
  assert.equal(read.tasks.length, 1)
  assert.deepEqual(read.unreadable, ['broken.json'])
})

check('malformed nested attachment metadata is quarantined', () => {
  const strictDir = path.join(root, 'strict')
  const task = card({ attachments: [{
    attachment_id: '../escape', filename: 'note.md', bytes: 4, added_at: 'not-a-date', added_by: 'test',
  }] })
  fs.mkdirSync(strictDir, { recursive: true })
  fs.writeFileSync(path.join(strictDir, `${task.task_id}.json`), JSON.stringify(task))
  assert.deepEqual(readTasks(strictDir), { tasks: [], unreadable: [`${task.task_id}.json`] })
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

check('Watch restores one archived row instead of creating a duplicate', () => {
  fs.rmSync(entriesDir, { recursive: true, force: true })
  const existing = watch({
    archive: { at: '2026-08-25T12:00:00.000Z', by: 'tester', reason: 'paused', muted_fingerprint: null, mute_scope: 'listing' },
    why: 'keep these notes',
  })
  writeEntry(existing, entriesDir)
  const task = card({ stage: 'final_decision', decision: 'watch', assignee: 'AB' })
  const result = syncTaskWatchlist(task, 'tester', entriesDir)
  assert.equal(result.problem, undefined)
  const entries = readEntries(entriesDir).entries
  assert.equal(entries.length, 1)
  assert.equal(entries[0].entry_id, existing.entry_id)
  assert.equal(entries[0].archive, null)
  assert.equal(entries[0].why, 'keep these notes')
  assert.equal(entries[0].task_id, task.task_id)
})

check('changing ticker detaches and archives the old task-created row before linking the new one', () => {
  fs.rmSync(entriesDir, { recursive: true, force: true })
  const task = card({ stage: 'final_decision', decision: 'watch' })
  syncTaskWatchlist(task, 'tester', entriesDir)
  const oldId = task.watchlist_entry_id
  task.ticker = 'TSLA'
  const result = syncTaskWatchlist(task, 'tester', entriesDir)
  assert.equal(result.problem, undefined)
  assert.equal(result.changedEntries.length, 2)
  const entries = readEntries(entriesDir).entries
  const old = entries.find((entry) => entry.entry_id === oldId)
  const next = entries.find((entry) => entry.listing.ticker === 'TSLA')
  assert.ok(old?.archive)
  assert.equal(old?.task_id, null)
  assert.equal(next?.task_id, task.task_id)
  assert.equal(task.watchlist_entry_id, next?.entry_id)
})

check('a second Watch task cannot steal one ticker owner', () => {
  fs.rmSync(entriesDir, { recursive: true, force: true })
  const first = card({ stage: 'final_decision', decision: 'watch' })
  syncTaskWatchlist(first, 'tester', entriesDir)
  const second = card({ stage: 'final_decision', decision: 'watch', subject: 'another event' })
  const result = syncTaskWatchlist(second, 'tester', entriesDir)
  assert.match(result.problem ?? '', /already has a Final Decision/)
  assert.equal(second.watchlist_entry_id, null)
  assert.equal(readEntries(entriesDir).entries[0].task_id, first.task_id)
})

check('an ambiguous same-ticker listing is refused instead of guessed', () => {
  fs.rmSync(entriesDir, { recursive: true, force: true })
  writeEntry(watch({ entry_id: newEntryId(new Date('2026-08-26T12:01:00Z')), listing: makeListing({ ticker: 'NHY', currency: 'NOK' }) }), entriesDir)
  writeEntry(watch({ entry_id: newEntryId(new Date('2026-08-26T12:02:00Z')), listing: makeListing({ ticker: 'NHY', currency: 'USD' }) }), entriesDir)
  const task = card({ ticker: 'NHY', stage: 'final_decision', decision: 'watch' })
  const result = syncTaskWatchlist(task, 'tester', entriesDir)
  assert.match(result.problem ?? '', /more than one listing/)
  assert.equal(task.watchlist_entry_id, null)
})

check('tickerless Watch remains a task and does not create a false Watchlist security', () => {
  fs.rmSync(entriesDir, { recursive: true, force: true })
  const task = card({ scope: 'world_event', ticker: null, ticker_label: null, stage: 'final_decision', decision: 'watch' })
  const result = syncTaskWatchlist(task, 'tester', entriesDir)
  assert.equal(result.problem, undefined)
  assert.equal(result.changed, false)
  assert.equal(readEntries(entriesDir).entries.length, 0)
})

check('an unchanged link does not append duplicate provenance', () => {
  fs.rmSync(entriesDir, { recursive: true, force: true })
  const task = card({ stage: 'final_decision', decision: 'watch' })
  syncTaskWatchlist(task, 'tester', entriesDir)
  const before = readEntries(entriesDir).entries[0].history.length
  const result = syncTaskWatchlist(task, 'tester', entriesDir)
  assert.equal(result.changed, false)
  assert.equal(readEntries(entriesDir).entries[0].history.length, before)
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
  assert.equal(readEntries(entriesDir).entries[0].task_id, null)

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
