// Standalone topology orchestration: a failed ingest must not suppress exact-horizon settlement.
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import { runStandalonePasses } from '../src/news/ingest-once'

let ideas = 0
let outcomes = 0
const failed = await runStandalonePasses({
  ingest: async () => { throw new Error('source exploded') },
  ideas: async () => { ideas++; return 'lead' },
  outcomes: async () => { outcomes++; return 'settled' },
})
assert.equal(failed.summary, null)
assert.equal(failed.ideaPass, 'lead')
assert.match(String(failed.error), /source exploded/)
assert.equal(failed.ingestError instanceof Error, true)
assert.equal(failed.ideaError, null)
assert.equal(ideas, 1, 'lead skim owns its freshness gate and still runs after a transient ingest failure')
assert.equal(outcomes, 1, 'outcomes still settle after ingest failure')
assert.equal(failed.qualifiedOutcomes, 'settled')

const order: string[] = []
const healthy = await runStandalonePasses({
  ingest: async () => { order.push('ingest'); return { ok: true } },
  ideas: async () => { order.push('ideas'); return { ran: true } },
  outcomes: async () => { order.push('outcomes'); return { resolved: 1 } },
})
assert.deepEqual(order, ['ingest', 'ideas', 'outcomes'])
assert.equal(healthy.error, null)
assert.deepEqual(healthy.summary, { ok: true })

console.log('\n1 ingest-once orchestration test file passed')
