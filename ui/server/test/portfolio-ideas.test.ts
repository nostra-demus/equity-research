// Which idea a trade expressed — the operator's own declaration, never inferred. Hermetic: writes to
// a throwaway directory. Run: npx tsx test/portfolio-ideas.test.ts
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {
  assignClosures, assignPosition, createIdea, deleteIdea, ideaForClosure, ideaForPosition, ideaId,
  isResidual, MAX_IDEAS, migrateClosureIds, pruneClosedPositions, readIdeas, renameIdea,
  RESIDUAL_VALUE_BASE,
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

check('a leg that carries no label yet is not a disagreement', () => {
  // Statements arrive in pieces. A round trip labelled while the book held one broker id routinely
  // grows a second on the next import; reading THAT as a split would drop an already-labelled trade
  // out of its idea's realised total with nobody having touched it.
  const d = dir('partial')
  const sugar = createIdea(d, 'Sugar')
  assignClosures(d, ['401'], sugar.id)
  assert.equal(ideaForClosure(readIdeas(d), ['401', '402']), 'sugar')
})

check('a new name that slugs onto a renamed idea gets its own id', () => {
  // renameIdea deliberately leaves the id alone, so 'sugar' can end up labelled 'Aluminium'. Matching
  // a fresh "Sugar" on the slug would hand back the aluminium bet and file the trade under a view the
  // operator never named.
  const d = dir('reslug')
  const first = createIdea(d, 'Sugar')
  renameIdea(d, first.id, 'Aluminium')
  const second = createIdea(d, 'Sugar')
  assert.notEqual(second.id, first.id)
  assert.equal(second.label, 'Sugar')
  assert.equal(readIdeas(d).ideas.length, 2)
  // and the renamed one keeps every assignment that pointed at it
  assert.equal(readIdeas(d).ideas.find((i) => i.id === first.id)!.label, 'Aluminium')
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

check('a closed position does not lend its idea to the next one in the same ticker', () => {
  // The whole module is keyed on trade ids to stop this year's AMZN labelling next year's. A position
  // label keyed by symbol re-opened the same hole from the other side: sell out, buy back months later,
  // and the new position silently inherited the old bet.
  const d = dir('prune')
  const ai = createIdea(d, 'AI')
  assignPosition(d, 'AMZN', ai.id)
  assignPosition(d, 'GLDM', createIdea(d, 'Gold').id)
  // AMZN has been sold; GLDM is still held.
  // AMZN has been sold — the book carries closures proving it; GLDM is still held.
  const dropped = pruneClosedPositions(d, ['GLDM'], ['AMZN'])
  assert.equal(dropped, 1)
  const book = readIdeas(d)
  assert.equal(ideaForPosition(book, 'AMZN'), null, 'the closed one is gone')
  assert.equal(ideaForPosition(book, 'GLDM'), 'gold', 'the held one is untouched')
  assert.equal(book.ideas.length, 2, 'and the ideas themselves survive — only the label went')
})

check('selling the LAST holding still drops its label', () => {
  // Guarding on "no open positions" skipped the sold-everything case — the one where every label is
  // stale — so re-opening that ticker still inherited the old bet.
  const d = dir('prune-last')
  assignPosition(d, 'AMZN', createIdea(d, 'AI').id)
  assert.equal(pruneClosedPositions(d, [], ['AMZN']), 1)
  assert.equal(ideaForPosition(readIdeas(d), 'AMZN'), null)
})

check('a holding merely MISSING from the statements keeps its label', () => {
  // Remove the newest statement to repair it and the book rebuilds from an older snapshot. Every
  // holding opened after that snapshot is simply absent — which is not proof it closed. Pruning on
  // absence deleted those labels, and re-importing brought the positions back Unassigned.
  const d = dir('prune-absent')
  assignPosition(d, 'AMZN', createIdea(d, 'AI').id)
  // AMZN is neither open nor shown closing anywhere in this reduced book.
  assert.equal(pruneClosedPositions(d, ['GLDM'], ['GLDM']), 0)
  assert.equal(ideaForPosition(readIdeas(d), 'AMZN'), 'ai', 'the label survives an incomplete book')
})

check('no closures at all prunes nothing', () => {
  const d = dir('prune-nobook')
  assignPosition(d, 'AMZN', createIdea(d, 'AI').id)
  assert.equal(pruneClosedPositions(d, [], []), 0)
  assert.equal(ideaForPosition(readIdeas(d), 'AMZN'), 'ai')
})

check('a label follows a trade through a CHAIN of restatements', () => {
  // Restated twice (A -> B -> C). One order-dependent pass moved A's label onto B, which is itself
  // superseded, leaving the live C closure Unassigned.
  const d = dir('restate-chain')
  const sugar = createIdea(d, 'Sugar')
  assignClosures(d, ['A'], sugar.id)
  // deliberately the newest edge first
  assert.equal(migrateClosureIds(d, { B: 'C', A: 'B' }), 1)
  const book = readIdeas(d)
  assert.equal(ideaForClosure(book, ['C']), 'sugar', 'it lands on the live one')
  assert.equal(ideaForClosure(book, ['A']), null)
  assert.equal(ideaForClosure(book, ['B']), null, 'and not on the superseded middle')
})

check('a cyclic restatement map cannot hang the migration', () => {
  const d = dir('restate-cycle')
  const sugar = createIdea(d, 'Sugar')
  assignClosures(d, ['A'], sugar.id)
  assert.doesNotThrow(() => migrateClosureIds(d, { A: 'B', B: 'A' }))
})

check('a non-Latin idea name keeps its own identity', () => {
  // The engine reads non-English filings by design (CLAUDE.md 27). Stripping to [a-z0-9] made
  // 黄金 2026 and 白银 2026 both '2026', so naming the second handed back the first.
  const d = dir('unicode')
  const gold = createIdea(d, '黄金 2026')
  const silver = createIdea(d, '白银 2026')
  assert.notEqual(gold.id, silver.id)
  assert.notEqual(gold.id, '2026')
  assert.equal(readIdeas(d).ideas.length, 2)
  // and it is still idempotent on the same name
  assert.equal(createIdea(d, '黄金 2026').id, gold.id)
})

check('a label follows its trade through a restatement', () => {
  // A corporate action replaces the row: the new one carries origTradeID and the old is dropped, so a
  // label stored against the old id fell back to Unassigned on the next import.
  const d = dir('restate')
  const sugar = createIdea(d, 'Sugar')
  assignClosures(d, ['OLD1'], sugar.id)
  assert.equal(migrateClosureIds(d, { OLD1: 'NEW1' }), 1)
  const book = readIdeas(d)
  assert.equal(ideaForClosure(book, ['NEW1']), 'sugar', 'it moved to the replacement')
  assert.equal(ideaForClosure(book, ['OLD1']), null, 'and does not linger on the row that went')
})

check('a restatement never overwrites a label already on the replacement', () => {
  const d = dir('restate-keep')
  const a = createIdea(d, 'Sugar')
  const b = createIdea(d, 'Gold')
  assignClosures(d, ['OLD1'], a.id)
  assignClosures(d, ['NEW1'], b.id)   // the operator has already spoken about the new row
  migrateClosureIds(d, { OLD1: 'NEW1' })
  assert.equal(ideaForClosure(readIdeas(d), ['NEW1']), 'gold', 'the more recent word wins')
})

check('a rename cannot duplicate another idea name', () => {
  // Two ideas with one name are indistinguishable in every picker, and createIdea matches on the name —
  // so it would have to pick one arbitrarily and file a trade under a bet nobody meant.
  const d = dir('rename-clash')
  const gold = createIdea(d, 'Gold')
  createIdea(d, 'Sugar')
  assert.throws(() => renameIdea(d, gold.id, 'Sugar'), /already the name/)
  assert.throws(() => renameIdea(d, gold.id, 'sugar'), /already the name/, 'case does not dodge it')
  // Renaming to its OWN name, in a new case, is still allowed.
  assert.doesNotThrow(() => renameIdea(d, gold.id, 'GOLD'))
  assert.equal(readIdeas(d).ideas.find((i) => i.id === gold.id)!.label, 'GOLD')
})

check('the ledger is written owner-only', () => {
  // The statement store next door enforces 0700/0600 because this lane is the operator's own book; the
  // ledger names their theses, symbols and broker trade ids and is no less private.
  const d = dir('perm')
  createIdea(d, 'Sugar')
  const mode = fs.statSync(path.join(d, 'ideas.json')).mode & 0o777
  assert.equal(mode & 0o077, 0, `group/other bits set: ${mode.toString(8)}`)
  const dirMode = fs.statSync(d).mode & 0o777
  assert.equal(dirMode & 0o077, 0, `directory is group/other readable: ${dirMode.toString(8)}`)
})

check('an oversized ledger is refused, not parsed', () => {
  const d = dir('huge')
  fs.writeFileSync(path.join(d, 'ideas.json'), '{"ideas":[' + '{"id":"x","label":"y"},'.repeat(220_000) + '{"id":"z","label":"z"}]}')
  assert.deepEqual(readIdeas(d).ideas, [], 'refused on size before any parse')
})

try { fs.rmSync(TMP, { recursive: true, force: true }) } catch { /* best effort */ }
console.log(`\n${passed} passed, ${fails.length} failed`)
if (fails.length) { console.error('FAILED: ' + fails.join(', ')); process.exit(1) }
