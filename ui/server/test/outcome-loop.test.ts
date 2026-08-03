// Outcome settlement lifecycle: independent of news failures, one interval per process, no overlapping
// settlement passes, and stop means no new pass starts. No market data, network, or server.
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import {
  startQualifiedIdeaOutcomeLoop,
  stopQualifiedIdeaOutcomeLoop,
} from '../src/news/scheduler'
import { qualifiedOutcomeHealthTtlMs } from '../src/qualified-idea-outcome-runner'

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

assert.equal(qualifiedOutcomeHealthTtlMs(5 * 60_000), 30 * 60_000)
assert.equal(
  qualifiedOutcomeHealthTtlMs(3 * 60 * 60_000),
  6 * 60 * 60_000,
  'outcome health cannot expire before a slow configured producer gets its next pass',
)

let calls = 0
let active = 0
let maxActive = 0
const run = async () => {
  calls++
  active++
  maxActive = Math.max(maxActive, active)
  await delay(35)
  active--
}

stopQualifiedIdeaOutcomeLoop()
assert.equal(startQualifiedIdeaOutcomeLoop(() => {}, { intervalMs: 10, run }), true)
assert.equal(startQualifiedIdeaOutcomeLoop(() => {}, { intervalMs: 10, run }), false, 'a repeated start must not create a second timer')
// Wait for the second pass by condition rather than assuming a lightly-loaded CI event loop.
for (let i = 0; i < 50 && calls < 2; i++) await delay(10)
stopQualifiedIdeaOutcomeLoop()
const callsAtStop = calls
await delay(50)
assert.equal(calls, callsAtStop, 'stop prevents every later interval pass')
assert.equal(maxActive, 1, 'a slow pass never overlaps the next timer tick')
assert.ok(calls >= 2, 'the immediate pass and at least one interval pass ran')

console.log('\n1 outcome-loop test file passed')
