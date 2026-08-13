import assert from 'node:assert/strict'
import { MANIFEST_SUBJECT_RE, normalizeDataSubject } from '../src/data-subject'

let passed = 0
function check(name: string, fn: () => void) {
  try { fn(); passed++; console.log(`  ok  ${name}`) }
  catch (error: any) { console.error(`FAIL  ${name}\n      ${error?.stack || error}`); process.exitCode = 1 }
}

const longSubject = 'PHYSICAL-MARKET-SIGNAL-20260813'

check('research keeps its strict exchange-symbol identity', () => {
  assert.equal(normalizeDataSubject('research', 'GOLD'), 'GOLD')
  assert.equal(normalizeDataSubject('research', longSubject), null)
})

check('a manifest-owned swarm accepts the same long subject surfaced by enumeration', () => {
  assert.ok(MANIFEST_SUBJECT_RE.test(longSubject))
  assert.equal(normalizeDataSubject('commodity', longSubject), longSubject)
})

check('generic subjects remain exact uppercase single path segments', () => {
  for (const bad of [
    '', 'lowercase', '../GOLD', 'GOLD/OTHER', 'GOLD\\OTHER', '.hidden', 'A\nB',
    `A${'B'.repeat(64)}`,
  ]) assert.equal(normalizeDataSubject('commodity', bad), null, bad)
  assert.equal(normalizeDataSubject('not-a-swarm', 'GOLD'), null)
})

console.log(`data-subject.test.ts: ${passed} passed`)
