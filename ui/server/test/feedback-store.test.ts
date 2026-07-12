// feedback-store: append-only item + status-event ledger, fold, image name-safety + path containment.
// Run: npx tsx test/feedback-store.test.ts   (exit 0 = all pass). Uses a tempdir as STATE_DIR so it
// never touches the real .state; the append goes through scripts/append-ndjson.sh (REPO_ROOT).
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { Readable } from 'node:stream'
import {
  appendFeedbackEvent, foldFeedback, isFeedbackId, newFeedbackId, readAllFeedback,
  resolveFeedbackImage, safeImageName, saveFeedbackImage, writeFeedbackItem, itemDir,
} from '../src/feedback-store'

let passed = 0
function check(name: string, fn: () => void | Promise<void>): Promise<void> {
  return Promise.resolve()
    .then(fn)
    .then(() => { passed++; console.log(`  ok  ${name}`) })
    .catch((e) => { console.error(`FAIL  ${name}\n      ${e?.message || e}`); process.exitCode = 1 })
}

async function main() {
  const state = fs.mkdtempSync(path.join(os.tmpdir(), 'fbstore-'))

  await check('id shape + validator', () => {
    const id = newFeedbackId('2026-07-12T00:00:00Z')
    assert.match(id, /^FDB-20260712-[0-9a-f]{8}$/)
    assert.equal(isFeedbackId(id), true)
    assert.equal(isFeedbackId('FDB-bad'), false)
    assert.equal(isFeedbackId('../etc/passwd'), false)
  })

  let id1 = ''
  await check('writeFeedbackItem + readAll + fold shows status new', async () => {
    id1 = newFeedbackId()
    await writeFeedbackItem({ feedback_id: id1, text: '  the chart overflows  ', category: 'bug', images: ['1.png'], url: '/research' }, 'a@b.com', state)
    const view = foldFeedback(readAllFeedback(state))
    assert.equal(view.length, 1)
    assert.equal(view[0].feedback_id, id1)
    assert.equal(view[0].text, 'the chart overflows') // trimmed
    assert.equal(view[0].category, 'bug')
    assert.equal(view[0].status, 'new')
    assert.equal(view[0].user_id, 'a@b.com')
    assert.deepEqual(view[0].images, ['1.png'])
  })

  await check('unknown category falls back to other', async () => {
    const id = newFeedbackId()
    await writeFeedbackItem({ feedback_id: id, text: 'x', category: 'nonsense' as any, images: [], url: '' }, 'u', state)
    const v = foldFeedback(readAllFeedback(state)).find((r) => r.feedback_id === id)!
    assert.equal(v.category, 'other')
  })

  await check('status event folds onto the item (latest wins) + pr_url', async () => {
    await appendFeedbackEvent(id1, 'triaged', { user: 'a@b.com' }, state)
    await appendFeedbackEvent(id1, 'pr_open', { user: 'bot', prUrl: 'https://github.com/x/y/pull/9' }, state)
    const v = foldFeedback(readAllFeedback(state)).find((r) => r.feedback_id === id1)!
    assert.equal(v.status, 'pr_open')
    assert.equal(v.pr_url, 'https://github.com/x/y/pull/9')
  })

  await check('event on a nonexistent item returns null (no write)', async () => {
    const before = readAllFeedback(state).length
    const res = await appendFeedbackEvent('FDB-20260101-deadbeef', 'done', { user: 'u' }, state)
    assert.equal(res, null)
    assert.equal(readAllFeedback(state).length, before)
  })

  await check('safeImageName: image exts only, deterministic <seq>.<ext>', () => {
    assert.deepEqual(safeImageName('screenshot.PNG', 2), { ok: true, name: '2.png' })
    assert.deepEqual(safeImageName('../../evil.png', 1), { ok: true, name: '1.png' }) // never trusts client name
    assert.equal((safeImageName('doc.pdf', 1) as any).ok, false)
    assert.equal((safeImageName('noext', 1) as any).ok, false)
  })

  await check('saveFeedbackImage writes into the item folder', async () => {
    const res = await saveFeedbackImage(id1, 1, 'shot.png', Readable.from([Buffer.from('\x89PNG\r\n\x1a\n', 'binary')]), state)
    assert.equal((res as any).ok, true)
    assert.equal((res as any).name, '1.png')
    assert.ok(fs.existsSync(path.join(itemDir(id1, state), '1.png')))
  })

  await check('resolveFeedbackImage confines to the item folder', () => {
    const good = resolveFeedbackImage(id1, '1.png', state)
    assert.ok(good && good.endsWith(path.join(id1, '1.png')))
    assert.equal(resolveFeedbackImage(id1, '../../../etc/passwd', state), null) // ../ escape blocked
    assert.equal(resolveFeedbackImage(id1, 'notes.txt', state), null) // non-image blocked
    assert.equal(resolveFeedbackImage('FDB-bad', '1.png', state), null) // bad id blocked
  })

  fs.rmSync(state, { recursive: true, force: true })
  console.log(`\n${passed} checks passed${process.exitCode ? ' (with failures)' : ''}`)
}

main()
