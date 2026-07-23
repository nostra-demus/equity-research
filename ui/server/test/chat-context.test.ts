// chat-context: cross-swarm linked-dossier discovery (C-1). The PURE matcher (matchLinkedSubjects) is the
// core — given a run's own text + the other swarms' committed subjects, which does it reference? This pins
// the NHY→ALUMINIUM case (a research thesis mentioning "aluminium" links the ALUMINIUM commodity run),
// self-exclusion, whole-word/too-short safety, ranking, and the cap. Run: npx tsx test/chat-context.test.ts
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

// config reads env at import time; set harmless defaults BEFORE importing the module under test.
process.env.ENGINE_STATE_DIR = process.env.ENGINE_STATE_DIR || fs.mkdtempSync(path.join(os.tmpdir(), 'chatctx-'))
process.env.ENGINE_REPO_ROOT = process.env.ENGINE_REPO_ROOT || process.cwd()
const { matchLinkedSubjects } = await import('../src/chat-context')

let passed = 0
const check = (name: string, fn: () => void) => { fn(); passed++ }
const cands = { commodity: ['ALUMINIUM', 'COPPER', 'GOLD', 'WHEAT'] }

check('NHY thesis text links ALUMINIUM (case-insensitive, whole-word, counts mentions)', () => {
  const text = 'Norsk Hydro is a vertically integrated aluminium producer; the LME aluminium price dominates earnings.'
  const m = matchLinkedSubjects(text, 'NHY', cands)
  assert.equal(m.length, 1)
  assert.equal(m[0].subject, 'ALUMINIUM')
  assert.equal(m[0].mentions, 2)
})
check('the primary subject is never a self-link', () => {
  assert.equal(matchLinkedSubjects('gold gold gold', 'GOLD', cands).length, 0)
})
check('whole-word only — a substring does NOT match', () => {
  // "goldsmith" / "coppersmith" must not match GOLD / COPPER
  assert.equal(matchLinkedSubjects('the goldsmith sells coppersmith wares', 'X', cands).length, 0)
})
check('ranked by mention count, capped', () => {
  const text = 'copper copper copper wheat gold gold'
  const m = matchLinkedSubjects(text, 'X', { commodity: ['COPPER', 'WHEAT', 'GOLD'] }, 2)
  assert.deepEqual(m.map((x) => x.subject), ['COPPER', 'GOLD']) // copper 3, gold 2, wheat 1 → top 2
})
check('empty text or no candidates → no links', () => {
  assert.equal(matchLinkedSubjects('', 'NHY', cands).length, 0)
  assert.equal(matchLinkedSubjects('aluminium', 'NHY', {}).length, 0)
})
check('too-short subjects are skipped (whole-word false-match risk)', () => {
  assert.equal(matchLinkedSubjects('BG BG reported earnings', 'X', { research: ['BG'] }).length, 0)
})
check('a regex-special subject is matched literally, not as a pattern', () => {
  // a subject like "A.B" must be escaped so the "." is a literal dot, not "any char"
  const m = matchLinkedSubjects('the A.B index rose', 'X', { s: ['A.B'] })
  assert.equal(m.length, 1)
  assert.equal(matchLinkedSubjects('the AXB index rose', 'X', { s: ['A.B'] }).length, 0)
})

console.log(`chat-context.test.ts: ${passed} assertions passed`)
