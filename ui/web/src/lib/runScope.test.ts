import assert from 'node:assert/strict'
import { runLabel, runsForScope } from './runScope'

assert.equal(runLabel({ kind: 'full', continuation: true }), 'Completing old run')
assert.equal(runLabel({ kind: 'full' }), 'Full run')

const newestFirst = runsForScope({
  old: { ticker: 'NU', status: 'done', startedAt: 100 },
  current: { ticker: 'NU', status: 'running', startedAt: 300 },
  middle: { ticker: 'NU', status: 'done', startedAt: 200 },
  other: { ticker: 'KAR', status: 'running', startedAt: 400 },
}, 'research', 'NU')
assert.deepEqual(newestFirst.map((run) => run.startedAt), [300, 200, 100])

console.log('runScope.test.ts: continuation label and newest-first Activity order passed')
