// Which idea a trade expressed — the operator's own declaration, never inferred. Hermetic: writes to
// a throwaway directory. Run: npx tsx test/portfolio-ideas.test.ts
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {
  assignClosures, assignPosition, createIdea, deleteIdea, ideaForClosure, ideaForPosition, ideaId,
  isResidual, MAX_IDEAS, readIdeas, renameIdea, RESIDUAL_VALUE_BASE,
} from '../src/portfolio-ideas'

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'fundbook-ideas-'))
let passed = 0
const fails: string[] = []
function check(name: string, fn: () => void) {
  try { fn(); passed++; console.log(`  ok   ${name}`) }
  catch (e: any) { fails.push(name); console.log(`  FAIL ${name}\n       ${e?.message || e}`) }
}
function dir(name: string): string {
  const d = path.join(TMP, name)
  fs.mkdirSync(d, { recursive: true })
  return d
}

check('nothing carries an idea until the operator says so', () => {
  // The engine knows CANE is a sugar fund — the SUGAR commodity profile names it as the portfolio-held
  // vehicle. It still does not assign it. A ticker is not an idea, and guessing here would relabel
  // history the operator never labelled.
  const d = dir('empty')
  const book = readIdeas(d)
  assert.deepEqual(book.ideas, [])
  assert.equal(ideaForPosition(book, 'CANE'), null)
  assert.equal(ideaForClosure(book, ['123']), null)
})

check('an unreadable file is an empty book, not an error', () => {
  const d = dir('corrupt')
  fs.writeFileSync(path.join(d, 'ideas.json'), '{ this is not json')
  assert.deepEqual(readIdeas(d).ideas, [])
  // And the operator can still work: the corrupt file is simply overwritten by the next declaration.
  createIdea(d, 'Sugar')
  assert.deepEqual(readIdeas(d).ideas.map((i) => i.label), ['Sugar'])
})

check('creating an idea is idempotent on its slug', () => {
  const d = dir('idem')
  const a = createIdea(d, 'Sugar')
  const b = createIdea(d, 'sugar')
  assert.equal(a.id, b.id)
  assert.equal(a.id, 'sugar')
  assert.equal(readIdeas(d).ideas.length, 1)
})

check('two sugar vehicles fold into one idea', () => {
  // The case the feature exists for: CANE +3,703.48 and SUGAl +3,004.97 in the real book are one bet
  // worth +6,708.45, split across two symbols that never appear together today.
  const d = dir('sugar')
  const sugar = createIdea(d, 'Sugar')
  assignPosition(d, 'CANE', sugar.id)
  assignPosition(d, 'SUGAl', sugar.id)
  const book = readIdeas(d)
  assert.equal(ideaForPosition(book, 'CANE'), 'sugar')
  // Symbols normalise, so the broker's exchange suffix does not become a second holding.
  assert.equal(ideaForPosition(book, 'SUGAL'), 'sugar')
  assert.equal(ideaForPosition(book, 'sugal'), 'sugar')
})

check('the same symbol in two eras keeps two ideas', () => {
  // THE reason assignments are keyed on the broker's trade ids and not on the symbol. AMZN traded this
  // year for one reason and next year for another is two ideas sharing a ticker; a symbol-keyed map
  // would sweep both under whichever label was written last.
  const d = dir('eras')
  const consumer = createIdea(d, 'Consumer recovery')
  const capex = createIdea(d, 'AI capex')
  assignClosures(d, ['11111'], consumer.id)   // this year's AMZN round trip
  assignClosures(d, ['99999'], capex.id)      // next year's
  const book = readIdeas(d)
  assert.equal(ideaForClosure(book, ['11111']), 'consumer-recovery')
  assert.equal(ideaForClosure(book, ['99999']), 'ai-capex')
})

check('a split sale is one row, however the broker cut it', () => {
  // SGOV 5 May -> 30 Jul came back from the broker as three orders. Assigning the ROW writes every id,
  // so the row still reads as assigned after a re-import re-folds it.
  const d = dir('split')
  const cash = createIdea(d, 'Parked cash')
  const written = assignClosures(d, ['201', '202', '203'], cash.id)
  assert.equal(written, 3)
  const book = readIdeas(d)
  assert.equal(ideaForClosure(book, ['201', '202', '203']), 'parked-cash')
  // and each leg on its own
  assert.equal(ideaForClosure(book, ['202']), 'parked-cash')
})

check('a row whose legs disagree reads as mixed, not as one of them', () => {
  const d = dir('mixed')
  const a = createIdea(d, 'Sugar')
  const b = createIdea(d, 'Gold')
  assignClosures(d, ['301'], a.id)
  assignClosures(d, ['302'], b.id)
  assert.equal(ideaForClosure(readIdeas(d), ['301', '302']), 'mixed')
})

check('a closure with no broker trade id is not assignable', () => {
  // It cannot be keyed stably, so it gets no key at all rather than a positional one that would point
  // at a different trade after the next import.
  const d = dir('nokey')
  createIdea(d, 'Sugar')
  assert.throws(() => assignClosures(d, [], 'sugar'), /broker trade id/)
  assert.throws(() => assignClosures(d, ['', '  '], 'sugar'), /broker trade id/)
  assert.equal(ideaForClosure(readIdeas(d), [null, '']), null)
})

check('an assignment cannot point at an idea that does not exist', () => {
  const d = dir('ghost')
  assert.throws(() => assignPosition(d, 'CANE', 'sugar'), /no such idea/)
  assert.throws(() => assignClosures(d, ['1'], 'sugar'), /no such idea/)
})

check('deleting an idea takes its assignments with it', () => {
  const d = dir('del')
  const sugar = createIdea(d, 'Sugar')
  assignPosition(d, 'CANE', sugar.id)
  assignClosures(d, ['401'], sugar.id)
  deleteIdea(d, sugar.id)
  const book = readIdeas(d)
  assert.deepEqual(book.ideas, [])
  assert.equal(ideaForPosition(book, 'CANE'), null)
  assert.equal(ideaForClosure(book, ['401']), null)
})

check('renaming keeps every assignment', () => {
  // The id is the anchor, the label is only what is shown. Re-slugging on rename would unassign the
  // whole book — the classic way a label edit quietly destroys data.
  const d = dir('rename')
  const sugar = createIdea(d, 'Sugar')
  assignPosition(d, 'CANE', sugar.id)
  renameIdea(d, sugar.id, 'Sugar — ICE #11')
  const book = readIdeas(d)
  assert.equal(book.ideas[0]!.id, 'sugar')
  assert.equal(book.ideas[0]!.label, 'Sugar — ICE #11')
  assert.equal(ideaForPosition(book, 'CANE'), 'sugar')
})

check('a dangling assignment is dropped on read', () => {
  const d = dir('dangle')
  fs.writeFileSync(path.join(d, 'ideas.json'), JSON.stringify({
    ideas: [{ id: 'sugar', label: 'Sugar' }],
    assignments: { positions: { CANE: 'sugar', GLDM: 'gone' }, closures: { 501: 'gone' } },
  }))
  const book = readIdeas(d)
  assert.equal(ideaForPosition(book, 'CANE'), 'sugar')
  assert.equal(ideaForPosition(book, 'GLDM'), null)
  assert.equal(ideaForClosure(book, ['501']), null)
})

check('clearing an assignment leaves the idea standing', () => {
  const d = dir('clear')
  const sugar = createIdea(d, 'Sugar')
  assignPosition(d, 'CANE', sugar.id)
  assignPosition(d, 'CANE', null)
  const book = readIdeas(d)
  assert.equal(ideaForPosition(book, 'CANE'), null)
  assert.equal(book.ideas.length, 1)
})

check('an idea needs a real name', () => {
  const d = dir('name')
  assert.throws(() => createIdea(d, '   '), /needs a name/)
  assert.throws(() => createIdea(d, '!!!'), /letter or number/)
  assert.equal(ideaId('Sugar — ICE #11'), 'sugar-ice-11')
})

check('the list is bounded', () => {
  const d = dir('cap')
  for (let i = 0; i < MAX_IDEAS; i++) createIdea(d, `Idea ${i}`)
  assert.throws(() => createIdea(d, 'One more'), /no room/)
  // Taking one back still works at the cap — otherwise the operator would be stuck.
  assert.doesNotThrow(() => deleteIdea(d, ideaId('Idea 0')))
  assert.equal(readIdeas(d).ideas.length, MAX_IDEAS - 1)
})

check('residual dust is excluded from weighting, unknown value is not', () => {
  // CANE's 1 share is $11.25 against a $1.03m book. Counting it renders Sugar at 0.0% of NAV forever,
  // which reads as "on and tiny" when the truth is "closed".
  assert.equal(isResidual(11.25), true)
  assert.equal(isResidual(-11.25), true)
  assert.equal(isResidual(RESIDUAL_VALUE_BASE), false)
  assert.equal(isResidual(51_625.35), false)   // V, the next smallest real position
  // A position the book could not value is NOT dust — unknown is not small, and treating it as dust
  // would drop a real holding out of the weighting on missing data.
  assert.equal(isResidual(null), false)
})

check('re-creating an existing idea returns THAT idea, whatever case was typed', () => {
  // The bug this pins: createIdea is idempotent on the SLUG, so typing "sugar" while "Sugar" exists
  // returns the stored "Sugar". A caller that then looked the id back up BY LABEL found nothing and
  // reported "that idea could not be created" for a call that had succeeded. The id must come from
  // the return value, and the return value must be the real idea.
  const d = dir('idempotent-case')
  const first = createIdea(d, 'Sugar')
  const again = createIdea(d, 'sugar')
  assert.equal(again.id, first.id)
  assert.equal(again.label, 'Sugar', 'the STORED label comes back, not the one just typed')
  assert.equal(readIdeas(d).ideas.length, 1, 'and no duplicate is made')
  // Whitespace and over-long labels are normalised too — both cases where a label match would miss.
  const padded = createIdea(d, '  Sugar  ')
  assert.equal(padded.id, first.id)
  const long = createIdea(d, 'x'.repeat(80))
  assert.equal(long.label.length, 60, 'truncated to the cap, so the returned label differs from input')
  assert.ok(readIdeas(d).ideas.some((i) => i.id === long.id))
})

try { fs.rmSync(TMP, { recursive: true, force: true }) } catch { /* best effort */ }
console.log(`\n${passed} passed, ${fails.length} failed`)
if (fails.length) { console.error('FAILED: ' + fails.join(', ')); process.exit(1) }
