import assert from 'node:assert/strict'
import { moduleCompletionOutcome } from './moduleOutcome'

const nodes = [
  { key: 'balance-sheet-survival/00_solvency-data-triage', nn: '00', failFast: true, isSynthesis: false },
  { key: 'balance-sheet-survival/01_debt', nn: '01', failFast: false, isSynthesis: false },
  { key: 'balance-sheet-survival/99_balance-sheet-survival-synthesis', nn: '99', failFast: false, isSynthesis: true },
]

assert.deepEqual(moduleCompletionOutcome(nodes, {
  [nodes[0].key]: { status: 'done', verdict: 'Insufficient data.', terminalValidated: true },
}), { complete: true, kind: 'fail-fast', verdict: 'Insufficient' }, 'an explicit insufficient 00 gate is a settled module outcome')

assert.equal(moduleCompletionOutcome(nodes, {
  [nodes[0].key]: { status: 'done', verdict: 'Insufficient data' },
}).complete, false, 'an unvalidated saved file cannot pretend the module settled')

assert.equal(moduleCompletionOutcome(nodes, {
  [nodes[0].key]: { status: 'done', verdict: 'Sufficient' },
}).complete, false, 'a fail-fast file without the canonical insufficient verdict cannot pretend the module settled')

assert.equal(moduleCompletionOutcome(nodes, {
  [nodes[0].key]: { status: 'done', verdict: null },
}).complete, false, 'a verdict-free gate cannot silently become a terminal outcome')

assert.deepEqual(moduleCompletionOutcome(nodes, {
  [nodes[0].key]: { status: 'done', verdict: 'Insufficient data', terminalValidated: true },
  [nodes[2].key]: { status: 'done', verdict: 'Sufficient' },
}), { complete: true, kind: 'synthesis', verdict: 'Sufficient' }, 'a synthesis remains the primary completed outcome')

console.log('moduleOutcome.test.ts: module terminal display truth passed')
