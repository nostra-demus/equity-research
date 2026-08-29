import assert from 'node:assert/strict'
import test from 'node:test'
import type { TaskCard, TasksRead } from '../../lib/types'
import { mergeTaskUpdatePatches, optimisticTask, overlayOptimisticTasks, replaceTask, retryableTaskUpdateError, taskLabel, taskMatchesPatch, taskTickerInput } from './taskOptimistic'

const card = (overrides: Partial<TaskCard> = {}): TaskCard => ({
  schema_version: 'task-card/v1', task_id: 'TASK-20260827-1234abcd', scope: 'ticker', ticker: 'MIDEA', ticker_label: null,
  subject: 'European Heat', title: 'Need to run a full scanner on right data', stage: 'ticker_identified',
  decision: null, assignee: 'CK', attachments: [], watchlist_entry_id: null, watchlist_created: false,
  history: [], created_at: '2026-08-27T00:00:00.000Z', created_by: 'CK', updated_at: '2026-08-27T00:00:00.000Z',
  ...overrides,
})

const read = (tasks: TaskCard[]): TasksRead => ({
  tasks, people: [], unreadable: [], attachments_enabled: true, as_of: '2026-08-27T00:00:00.000Z',
})

test('a stage move is visible immediately and leaving Final Decision clears its outcome', () => {
  assert.equal(optimisticTask(card(), { stage: 'deep_dive' }).stage, 'deep_dive')
  const movedBack = optimisticTask(card({ stage: 'final_decision', decision: 'watch' }), { stage: 'deep_dive' })
  assert.equal(movedBack.stage, 'deep_dive')
  assert.equal(movedBack.decision, null)
})

test('rapid changes build on the card already shown to the user', () => {
  const moved = optimisticTask(card(), { stage: 'deep_dive' })
  const reassigned = optimisticTask(moved, { assignee: 'AB' })
  assert.equal(reassigned.stage, 'deep_dive')
  assert.equal(reassigned.assignee, 'AB')
  assert.deepEqual(mergeTaskUpdatePatches({ assignee: 'AB' }, { stage: 'deep_dive', decision: null }), {
    assignee: 'AB', stage: 'deep_dive', decision: null,
  })
})

test('retry patches never include untouched fields owned by another client', () => {
  const patch = mergeTaskUpdatePatches({ assignee: 'AB' }, { stage: 'deep_dive' })
  assert.deepEqual(patch, { assignee: 'AB', stage: 'deep_dive' })
  assert.equal(taskMatchesPatch(card({ assignee: 'AB', stage: 'deep_dive', title: 'Changed elsewhere' }), patch), true)
  assert.equal(taskMatchesPatch(card({ assignee: 'CK', stage: 'deep_dive' }), patch), false)
})

test('server null and an empty ticker input reconcile as the same value', () => {
  assert.equal(taskMatchesPatch(card({ ticker: null, ticker_label: null }), { ticker: '' }), true)
})

test('free-form ticker labels survive reconciliation and label an otherwise empty card', () => {
  const task = card({ ticker: null, ticker_label: 'NU HOLDINGS LTD.', subject: '', title: '' })
  assert.equal(taskTickerInput(task), 'NU HOLDINGS LTD.')
  assert.equal(taskLabel(task), 'NU HOLDINGS LTD.')
  assert.equal(taskMatchesPatch(task, { ticker: 'NU HOLDINGS LTD.' }), true)
  assert.equal(taskLabel(card({ ticker: null, ticker_label: null, subject: '', title: '' })), 'Untitled task')
})

test('optimistic ticker identity mirrors the server while a save is in flight', () => {
  const valid = optimisticTask(card(), { ticker: 'nu' })
  assert.deepEqual({ ticker: valid.ticker, ticker_label: valid.ticker_label }, { ticker: 'NU', ticker_label: null })
  const freeform = optimisticTask(card(), { ticker: 'NU HOLDINGS LTD.' })
  assert.deepEqual(
    { ticker: freeform.ticker, ticker_label: freeform.ticker_label },
    { ticker: null, ticker_label: 'NU HOLDINGS LTD.' },
  )
})

test('only temporary task failures are carried into a later queued edit', () => {
  assert.equal(retryableTaskUpdateError(Object.assign(new Error('invalid body'), { status: 400 })), false)
  assert.equal(retryableTaskUpdateError(Object.assign(new Error('watch conflict'), { status: 409 })), false)
  assert.equal(retryableTaskUpdateError(Object.assign(new Error('Tasks and Watchlist are being updated. Try again in a moment.'), { status: 409 })), true)
  assert.equal(retryableTaskUpdateError(Object.assign(new Error('server unavailable'), { status: 503 })), true)
  assert.equal(retryableTaskUpdateError(new Error('network disconnected')), true)
})

test('an unrelated refresh cannot replace a task whose save is still pending', () => {
  const stale = card()
  const pending = optimisticTask(stale, { stage: 'deep_dive' })
  const refreshed = overlayOptimisticTasks(read([stale]), new Map([[stale.task_id, pending]]))
  assert.equal(refreshed.tasks[0]?.stage, 'deep_dive')
})

test('the authoritative response replaces only the saved task', () => {
  const other = card({ task_id: 'TASK-20260827-deadbeef', subject: 'Other' })
  const saved = card({ stage: 'deep_dive', updated_at: '2026-08-27T00:00:05.000Z' })
  const next = replaceTask(read([card(), other]), saved)
  assert.equal(next?.tasks[0], saved)
  assert.equal(next?.tasks[1], other)
})
