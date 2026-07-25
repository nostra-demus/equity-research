// A failed archive search must never be phrased as a result. Run: npx tsx src/lib/archiveError.test.ts
import assert from 'node:assert/strict'
import { archiveErrorNote, archiveErrorSentence } from './archiveError'

let passed = 0
function check(name: string, fn: () => void) {
  try { fn(); passed++; console.log(`  ok  ${name}`) }
  catch (e: any) { console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`); process.exitCode = 1 }
}

check('a timed-out request is named as a timeout, not as an empty archive', () => {
  const e = Object.assign(new Error('The operation was aborted due to timeout'), { name: 'TimeoutError' })
  assert.equal(archiveErrorNote(e), 'the engine took too long to answer, so nothing was searched')
  // AbortSignal.timeout is reported as AbortError by some browsers/older engines — same meaning to a reader.
  assert.equal(archiveErrorNote(Object.assign(new Error('aborted'), { name: 'AbortError' })), archiveErrorNote(e))
})

check('a broken engine and an unreachable one are told apart', () => {
  assert.equal(archiveErrorNote(Object.assign(new Error('500 /api/news/search'), { status: 500 })), 'the engine hit an error while searching')
  assert.equal(archiveErrorNote(Object.assign(new Error('503'), { status: 503 })), 'the engine hit an error while searching')
  assert.equal(archiveErrorNote(new TypeError('Failed to fetch')), 'the engine could not be reached')
  assert.equal(archiveErrorNote(null), 'the engine could not be reached') // never throws on a junk rejection
  assert.equal(archiveErrorNote(undefined), 'the engine could not be reached')
})

check('no wording implies the archive was actually read', () => {
  // The exact phrases the RESULT path owns. A failure that borrowed any of them would restore the original
  // defect: "genuinely nothing matches AMZN (Amazon)" shown because a request timed out.
  const banned = [/genuinely nothing/i, /nothing matches/i, /whole archive/i, /searched all history/i, /no (results|matches)/i]
  const notes = [
    archiveErrorNote(Object.assign(new Error('t'), { name: 'TimeoutError' })),
    archiveErrorNote(Object.assign(new Error('e'), { status: 500 })),
    archiveErrorNote(new TypeError('Failed to fetch')),
  ]
  for (const n of notes) for (const re of banned) assert.ok(!re.test(n), `"${n}" must not claim a completed search (${re})`)
})

check('the note reads correctly both after a dash and as its own sentence', () => {
  const note = archiveErrorNote(Object.assign(new Error('t'), { name: 'TimeoutError' }))
  assert.equal(note[0], note[0].toLowerCase(), 'a clause starts lowercase so "didn’t finish — <note>" reads right')
  assert.ok(!note.endsWith('.'), 'the caller supplies the stop')
  assert.equal(archiveErrorSentence(note), 'The engine took too long to answer, so nothing was searched.')
  assert.equal(archiveErrorSentence(''), '')
})

console.log(`\narchiveError.test.ts: ${passed} passed`)
