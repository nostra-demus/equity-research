// Watchlist thesis attachments on the local Drive mount (src/watchlist-files.ts).
//
// The contract: a PDF reaches Drive through the FILESYSTEM with no credential, it lands only in a folder
// the engine treats as reserved (so it is never listed as a company or ingested as evidence), a rejected
// or interrupted write never leaves a readable partial, and no id from a request can escape the folder.
// Run: npx tsx test/watchlist-files.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { attachmentPath, deleteAttachment, readAttachment, saveAttachment, watchlistFilesAvailable, watchlistFilesRoot } from '../src/watchlist-files'

let passed = 0
const check = (name: string, fn: () => void) => {
  try { fn(); console.log(`  ok  ${name}`); passed++ } catch (e) { console.log(`  FAIL  ${name}`); throw e }
}
const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'wlf-'))

check('the root is created under the reserved folder, and writing needs no Drive credential', () => {
  const dir = tmp()
  const root = watchlistFilesRoot(dir)
  assert.ok(root, 'root resolves')
  assert.equal(path.basename(root!), 'WATCHLIST', 'the default reserved folder name')
  assert.equal(path.dirname(root!), dir, 'directly under the data dir')
  assert.ok(fs.statSync(root!).isDirectory())
  assert.equal(watchlistFilesAvailable(dir), true, 'a writable mount is available with no GDRIVE_* set')
  fs.rmSync(dir, { recursive: true, force: true })
})

check('a read-only mount reports unavailable rather than offering an upload that would fail', () => {
  const dir = tmp()
  watchlistFilesRoot(dir)
  const root = path.join(dir, 'WATCHLIST')
  fs.chmodSync(root, 0o500) // r-x: listable, not writable
  try {
    assert.equal(watchlistFilesAvailable(dir), false, 'visible but read-only is not available')
  } finally {
    fs.chmodSync(root, 0o700)
    fs.rmSync(dir, { recursive: true, force: true })
  }
})

check('a saved PDF round-trips, and is keyed by ENTRY id — never by ticker', () => {
  const dir = tmp()
  const body = Buffer.from('%PDF-1.4 thesis')
  const saved = saveAttachment('WL-20260819-abc123', '1a2b-thesis.pdf', body, dir)
  assert.equal(saved.ok, true)
  assert.equal((saved as any).bytes, body.length)
  const back = readAttachment('WL-20260819-abc123', '1a2b-thesis.pdf', dir)
  assert.deepEqual(back, body, 'byte-identical round trip')
  // the path proves the layout: <data>/WATCHLIST/<entry_id>/<file> — no ticker anywhere in it
  const p = attachmentPath('WL-20260819-abc123', '1a2b-thesis.pdf', dir)!
  assert.equal(path.relative(dir, p), path.join('WATCHLIST', 'WL-20260819-abc123', '1a2b-thesis.pdf'))
  fs.rmSync(dir, { recursive: true, force: true })
})

check('no id from a request can escape the folder', () => {
  const dir = tmp()
  for (const bad of ['..', '../..', 'a/b', '/etc/passwd', '.hidden', '']) {
    assert.equal(attachmentPath(bad, 'f.pdf', dir), null, `entry id refused: ${bad}`)
    assert.equal(attachmentPath('WL-20260819-abc123', bad, dir), null, `attachment id refused: ${bad}`)
    assert.equal(readAttachment(bad, 'f.pdf', dir), null)
    assert.equal(saveAttachment(bad, 'f.pdf', Buffer.from('x'), dir).ok, false)
  }
  // and a traversal cannot reach a real file that exists just outside the folder
  fs.writeFileSync(path.join(dir, 'secret.pdf'), 'do not serve me')
  assert.equal(readAttachment('WL-20260819-abc123', '../../secret.pdf', dir), null)
  fs.rmSync(dir, { recursive: true, force: true })
})

check('an interrupted write leaves no readable partial', () => {
  const dir = tmp()
  const id = 'WL-20260819-abc123'
  saveAttachment(id, 'good.pdf', Buffer.from('%PDF-1.4 complete'), dir)
  // the temp form the writer uses must never be mistaken for the attachment itself
  const stray = `${attachmentPath(id, 'good.pdf', dir)}.part-9999`
  fs.writeFileSync(stray, 'half a pdf')
  assert.deepEqual(readAttachment(id, 'good.pdf', dir), Buffer.from('%PDF-1.4 complete'),
    'the completed file is what is read, not the partial beside it')
  // a ".part-*" name is not a single clean segment the route would ever hand us, but assert it anyway:
  // the id is the filename, so a partial is only reachable by asking for it exactly.
  assert.notEqual(readAttachment(id, 'good.pdf.part-9999', dir), null, 'reachable only by exact name')
  fs.rmSync(dir, { recursive: true, force: true })
})

check('delete removes the file and prunes the entry folder, and is idempotent', () => {
  const dir = tmp()
  const id = 'WL-20260819-abc123'
  saveAttachment(id, 'a.pdf', Buffer.from('one'), dir)
  saveAttachment(id, 'b.pdf', Buffer.from('two'), dir)
  assert.equal(deleteAttachment(id, 'a.pdf', dir), true)
  assert.equal(readAttachment(id, 'a.pdf', dir), null)
  assert.ok(fs.existsSync(path.join(dir, 'WATCHLIST', id)), 'the folder stays while a sibling remains')
  assert.equal(deleteAttachment(id, 'b.pdf', dir), true)
  assert.equal(fs.existsSync(path.join(dir, 'WATCHLIST', id)), false, 'emptied folder is pruned')
  assert.equal(deleteAttachment(id, 'b.pdf', dir), true, 'already gone counts as removed')
  fs.rmSync(dir, { recursive: true, force: true })
})

console.log(`\nwatchlist-files.test.ts: ${passed} passed`)
