// Where the fund book lives, and the properties that keep it honest: statements are the source of
// truth, the book is always rebuilt from them, a re-upload is a no-op, and an unreadable file never
// reaches the store. Hermetic — points STATE_DIR at a throwaway directory, so nothing touches the real
// .state/ and no real statement is involved.
// Run: npx tsx test/portfolio-store.test.ts
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'fundbook-state-'))
process.env.ENGINE_STATE_DIR = TMP

const here = path.dirname(fileURLToPath(import.meta.url))
const xml = fs.readFileSync(path.join(here, 'fixtures', 'flex-sample.xml'), 'utf8')

// STATE_DIR is resolved at module load, so the import must follow the env assignment.
const store = await import('../src/portfolio-store')

let passed = 0
const fails: string[] = []
function check(name: string, fn: () => void) {
  try { fn(); passed++; console.log(`  ok   ${name}`) }
  catch (e: any) { fails.push(name); console.log(`  FAIL ${name}\n       ${e?.message || e}`) }
}

check('an empty store reports no book rather than an error', () => {
  const read = store.readPortfolio()
  assert.equal(read.statements.length, 0)
  assert.equal(read.book, null)
  assert.equal(read.error, null)
})

check('a saved statement is listed with the facts the operator needs', () => {
  const { status, statement } = store.saveStatement(xml, 'fund_book.xml')
  assert.equal(status, 'saved')
  assert.equal(statement.filename, 'fund_book.xml')
  assert.equal(statement.accountId, 'U0000000')
  assert.equal(statement.fromDate, '2026-01-01')
  assert.equal(statement.toDate, '2026-01-04')
  assert.equal(statement.trades, 11)
  assert.equal(store.listStatements().length, 1)
})

check('the book is REBUILT from the stored statement, not stored as a derived blob', () => {
  const { book } = store.readPortfolio()
  assert.ok(book, 'a stored statement must produce a book')
  assert.equal(book!.reconciliation.ok, true, 'the rebuilt book must reconcile')
  assert.equal(book!.positions.length, 4)
  // Nothing derived is on disk — only the statement and its metadata.
  const files = fs.readdirSync(path.join(TMP, 'portfolio', 'statements')).sort()
  assert.deepEqual(files.map((f) => f.replace(/^[0-9a-f]{16}/, 'ID')), ['ID.json', 'ID.xml'])
})

check('re-uploading the same file changes nothing', () => {
  const again = store.saveStatement(xml, 'fund_book_copy.xml')
  assert.equal(again.status, 'duplicate', 'identical content must not be stored twice')
  assert.equal(store.listStatements().length, 1)
})

check('a file that is not a Flex export never reaches the store', () => {
  assert.throws(() => store.saveStatement('<html><body>not a statement</body></html>', 'wrong.html'), /FlexQueryResponse/)
  assert.throws(() => store.saveStatement(xml.slice(0, xml.indexOf('</Trades>')), 'truncated.xml'), /truncated/)
  assert.equal(store.listStatements().length, 1, 'a rejected upload must leave the store untouched')
})

check('the rebuild is cached, and the cache is invalidated by a write', () => {
  const first = store.readPortfolio().book
  assert.equal(store.readPortfolio().book, first, 'an unchanged store returns the same built book')
  const id = store.listStatements()[0]!.id
  assert.equal(store.deleteStatement(id), true)
  assert.equal(store.readPortfolio().book, null, 'the cache must not survive a delete')
  assert.equal(store.listStatements().length, 0)
})

check('a statement id is never a caller-supplied path', () => {
  assert.equal(store.deleteStatement('../../etc/passwd'), false)
  assert.equal(store.deleteStatement('not-a-hash'), false)
})

check('two accounts are surfaced as an error, with the statements still listed', () => {
  store.saveStatement(xml, 'a.xml')
  store.saveStatement(xml.replace(/accountId="U0000000"/g, 'accountId="U1111111"'), 'b.xml')
  const read = store.readPortfolio()
  assert.equal(read.statements.length, 2)
  assert.equal(read.book, null)
  assert.match(read.error ?? '', /span 2 accounts/)
})

check('one unreadable statement refuses the whole book rather than building a partial one', () => {
  // The dangerous case: several statements listed, one of them corrupt on disk. Building from the rest
  // returns a book that looks complete and reconciles green while silently missing whole months of
  // trades and NAV — and the screen still lists the file that was quietly dropped.
  for (const s of store.listStatements()) store.deleteStatement(s.id)
  store.saveStatement(xml, 'good.xml')
  store.saveStatement(xml.replace('</FlexQueryResponse>', '<SecuritiesInfo/></FlexQueryResponse>'), 'second.xml')
  const statements = store.listStatements()
  assert.equal(statements.length, 2)
  const victim = statements[1]!
  // Corrupt it exactly as a truncated download or a bad copy would.
  fs.writeFileSync(path.join(TMP, 'portfolio', 'statements', `${victim.id}.xml`), '<FlexQueryResponse><Trades>')
  const read = store.readPortfolio()
  assert.equal(read.statements.length, 2, 'both stay listed so the operator can remove the bad one')
  assert.equal(read.book, null, 'no partial book')
  assert.match(read.error ?? '', new RegExp(victim.filename), 'the failing file is named')
  assert.ok(!(read.error ?? '').includes(TMP), 'the error must not leak state paths')
  for (const s of store.listStatements()) store.deleteStatement(s.id)
})

check('a sidecar from an older build gains its section counts on the next read', () => {
  // The store predates section counts, so every statement already on disk carries a sidecar without
  // them. Listing must not fail on those, and must not leave the operator staring at "no sections
  // recorded" forever when the file itself can answer the question.
  for (const s of store.listStatements()) store.deleteStatement(s.id)
  const { statement } = store.saveStatement(xml, 'older.xml')
  const meta = path.join(TMP, 'portfolio', 'statements', `${statement.id}.json`)
  const older = JSON.parse(fs.readFileSync(meta, 'utf8'))
  delete older.sections
  delete older.unmodelled
  fs.writeFileSync(meta, JSON.stringify(older, null, 2))

  const listed = store.listStatements()[0]!
  assert.equal(listed.sections.Trades, 11, 're-derived from the statement itself')
  assert.ok(Array.isArray(listed.unmodelled))
  // Written back, so the work happens once rather than on every read.
  assert.equal(JSON.parse(fs.readFileSync(meta, 'utf8')).sections.Trades, 11)
  for (const s of store.listStatements()) store.deleteStatement(s.id)
})

check('a sidecar whose statement has become unreadable still lists, with empty counts', () => {
  // This row is the only way to REMOVE the bad file — refusing to list it would strand the operator.
  const { statement } = store.saveStatement(xml, 'doomed.xml')
  const meta = path.join(TMP, 'portfolio', 'statements', `${statement.id}.json`)
  const older = JSON.parse(fs.readFileSync(meta, 'utf8'))
  delete older.sections
  delete older.unmodelled
  fs.writeFileSync(meta, JSON.stringify(older, null, 2))
  fs.writeFileSync(path.join(TMP, 'portfolio', 'statements', `${statement.id}.xml`), '<FlexQueryResponse><Trades>')

  const listed = store.listStatements()
  assert.equal(listed.length, 1)
  assert.deepEqual(listed[0]!.sections, {})
  assert.deepEqual(listed[0]!.unmodelled, [])
  for (const s of store.listStatements()) store.deleteStatement(s.id)
})

check('a hand-logged fill is answered by the statement that covers its date, end to end', () => {
  // The whole point of the feature, exercised through the store rather than the pure functions: log a
  // fill inside the fixture's window and one after it, then check what the read payload says.
  for (const s of store.listStatements()) store.deleteStatement(s.id)
  const inWindow = { symbol: 'ACME', side: 'buy', quantity: 5, price: 12.5, currency: 'USD', tradeDate: '2026-01-03' }
  const after = { symbol: 'ACME', side: 'buy', quantity: 7, price: 13, currency: 'USD', tradeDate: '2026-01-20' }
  store.logManualTrade(inWindow)
  store.logManualTrade(after)

  // With no statement at all, nothing can be superseded — both are live and both move the position.
  let read = store.readPortfolio()
  assert.equal(read.book, null)
  assert.equal(read.manual.live, 2)
  assert.equal(read.manual.effects[0]!.delta, 12)

  store.saveStatement(xml, 'jan.xml') // covers 2026-01-01 → 2026-01-04
  read = store.readPortfolio()
  assert.ok(read.book, 'the book still builds — manual entries never enter it')
  assert.equal(read.book!.reconciliation.ok, true, 'and they never touch the reconciliation checks')
  assert.equal(read.manual.live, 1)
  assert.equal(read.manual.superseded, 1)
  assert.equal(read.manual.trades.find((t) => t.tradeDate === '2026-01-03')!.supersededBy!.filename, 'jan.xml')
  assert.equal(read.manual.effects[0]!.delta, 7, 'only the live entry still moves the position')

  // Nothing was thrown away: both are still on disk until the operator clears them.
  assert.equal(read.manual.trades.length, 2)
  assert.equal(store.clearSupersededManual(), 1)
  read = store.readPortfolio()
  assert.equal(read.manual.trades.length, 1)
  assert.equal(read.manual.trades[0]!.tradeDate, '2026-01-20')

  assert.equal(store.removeManualTrade(read.manual.trades[0]!.id), true)
  assert.equal(store.readPortfolio().manual.trades.length, 0)
  for (const s of store.listStatements()) store.deleteStatement(s.id)
})

check('a rejected entry is never stored, and says why', () => {
  assert.throws(
    () => store.logManualTrade({ symbol: 'ACME', side: 'buy', quantity: -1, price: 10, currency: 'USD', tradeDate: '2026-01-03' }),
    /quantity/,
  )
  assert.equal(store.readPortfolio().manual.trades.length, 0)
})

check('a statement is never left both invisible and permanently "already imported"', () => {
  // listStatements reads the .json; the duplicate check reads the .xml. Writing the XML first opened a
  // window where a crash between the two left a statement the list cannot show and the duplicate check
  // will never accept again — unimportable AND undeletable. The sidecar goes down first, so the failure
  // inverts: the row is listed, reported unreadable, removable, and a re-upload repairs it.
  for (const s of store.listStatements()) store.deleteStatement(s.id)
  const { statement } = store.saveStatement(xml, 'ordering.xml')
  const dir = path.join(TMP, 'portfolio', 'statements')
  // Simulate the crash by removing whichever file the interrupted write would not have reached.
  fs.rmSync(path.join(dir, `${statement.id}.xml`), { force: true })

  const listed = store.listStatements()
  assert.equal(listed.length, 1, 'the operator can still SEE it')
  const read = store.readPortfolio()
  assert.equal(read.book, null)
  assert.match(read.error ?? '', /ordering\.xml/, 'and is told which file is the problem')
  assert.equal(store.saveStatement(xml, 'again.xml').status, 'saved', 're-uploading repairs it rather than being refused')
  for (const s of store.listStatements()) store.deleteStatement(s.id)
})

check('a fill dated today in the operator\u2019s own timezone is accepted', () => {
  // The guard compared a LOCAL calendar day from the form against a UTC "today". East of UTC the local
  // day starts hours earlier, so this morning's real fill was rejected as being in the future.
  const now = new Date()
  const localToday = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  assert.doesNotThrow(() => store.logManualTrade({
    symbol: 'ACME', side: 'buy', quantity: 1, price: 10, currency: 'USD', tradeDate: localToday,
  }), `a fill dated ${localToday} is today wherever the operator is`)
  for (const t of store.readPortfolio().manual.trades) store.removeManualTrade(t.id)
})

try { fs.rmSync(TMP, { recursive: true, force: true }) } catch { /* best effort */ }
console.log(`\n${passed} passed, ${fails.length} failed`)
if (fails.length) { console.error('FAILED: ' + fails.join(', ')); process.exit(1) }
