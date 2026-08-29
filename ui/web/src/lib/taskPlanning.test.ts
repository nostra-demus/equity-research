import assert from 'node:assert/strict'
import test from 'node:test'
import { retryTaskPlanning, taskPlanningBusy } from './taskPlanning'

const busy = () => Object.assign(new Error('Tasks and Watchlist are being updated. Try again in a moment.'), { status: 409 })

test('planning lock errors retry without dropping the queued operation', async () => {
  let calls = 0
  const waits: number[] = []
  const result = await retryTaskPlanning(async () => {
    calls++
    if (calls < 3) throw busy()
    return 'saved'
  }, async (delay) => { waits.push(delay) }, [10, 20, 30])
  assert.equal(result, 'saved')
  assert.equal(calls, 3)
  assert.deepEqual(waits, [10, 20])
  assert.equal(taskPlanningBusy({ status: 409, body: { error: 'Tasks and Watchlist are being updated. Try again in a moment.' } }), true)
})

test('validation and semantic conflicts are never retried', async () => {
  assert.equal(taskPlanningBusy(Object.assign(new Error('watch conflict'), { status: 409 })), false)
  let calls = 0
  await assert.rejects(() => retryTaskPlanning(async () => {
    calls++
    throw Object.assign(new Error('invalid body'), { status: 400 })
  }, async () => undefined, [0, 0]))
  assert.equal(calls, 1)
})
