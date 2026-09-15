// Watchlist messages (src/watch/inbox.ts) and their email (src/watch/email.ts). One message per name inside
// 30 minutes, the most important thing first; a read message never grows behind your back; delete hides
// but keeps the record; and only urgent items are ever emailed — the first at once, anything more for the
// same name as one follow-up after 30 minutes.
// Run: npx tsx test/watch-inbox.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { WatchInbox, type WatchMessageItem } from '../src/watch/inbox'
import { deliverWatchEmail, renderWatchEmail, selectEmailBatch } from '../src/watch/email'

let passed = 0
async function check(name: string, fn: () => void | Promise<void>): Promise<void> {
  try {
    await fn()
    passed++
    console.log('  ok ', name)
  } catch (e) {
    console.error('  FAIL', name)
    console.error('   ', e)
    process.exitCode = 1
  }
}

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'watch-inbox-'))
let n = 0
const freshInbox = () => new WatchInbox(path.join(root, `box-${n++}`))
const item = (id: string, type: WatchMessageItem['type'], urgent: boolean, title = id): WatchMessageItem =>
  ({ id, type, urgent, title, detail: `${title} detail`, quote: null, source: null, at: '' })
const AMZN = { listing_key: 'AMZN|USD', ticker: 'AMZN', company_name: 'Amazon.com' }
const NHY = { listing_key: 'NHY|NOK', ticker: 'NHY', company_name: 'Norsk Hydro' }
const t0 = new Date('2026-09-15T14:00:00Z')
const plus = (min: number) => new Date(t0.getTime() + min * 60_000)
const ON = { enabled: true, paused: false }

async function main() {
  await check('one message per name within 30 minutes, the most important item first', () => {
    const box = freshInbox()
    const a = box.addForName(AMZN, 'getting_close', [item('close', 'getting_close', false, 'Getting close')], ON, t0)!
    assert.equal(a.urgent, false)
    assert.equal(a.email.state, 'not_urgent')
    const b = box.addForName(AMZN, 'buy_price_reached', [item('buy', 'buy_price_reached', true, 'Reached its buy price')], ON, plus(10))!
    assert.equal(b.id, a.id)
    assert.equal(b.items.length, 2)
    assert.equal(b.title, 'Reached its buy price')
    assert.equal(b.status, 'buy_price_reached')
    assert.equal(b.urgent, true)
    assert.equal(b.email.state, 'pending')
    assert.equal(box.list().length, 1)
  })

  await check('a read message is never grown; after 30 minutes a new one starts', () => {
    const box = freshInbox()
    const a = box.addForName(AMZN, 'check_now', [item('a', 'big_drop', false)], ON, t0)!
    box.markRead(a.id, true, 'CK', plus(1))
    const b = box.addForName(AMZN, 'check_now', [item('b', 'results_out', false)], ON, plus(2))!
    assert.notEqual(b.id, a.id)
    const c = box.addForName(AMZN, 'check_now', [item('c', 'research_old', false)], ON, plus(40))!
    assert.notEqual(c.id, b.id)
    assert.equal(box.unreadCount(), 2)
  })

  await check('email state follows the fixed rules: not urgent, paused, or not set up', () => {
    const box = freshInbox()
    assert.equal(box.addForName(AMZN, 'check_now', [item('x', 'results_out', false)], ON, t0)!.email.state, 'not_urgent')
    assert.equal(box.addForName(NHY, 'check_now', [item('y', 'look_again_reached', true)], { enabled: true, paused: true }, t0)!.email.state, 'paused')
    const box2 = freshInbox()
    assert.equal(box2.addForName(AMZN, 'buy_price_reached', [item('z', 'buy_price_reached', true)], { enabled: false, paused: false }, t0)!.email.state, 'off')
  })

  await check('read before it was emailed: skipped. Deleted: hidden but kept. Feedback: counted', () => {
    const box = freshInbox()
    const a = box.addForName(AMZN, 'buy_price_reached', [item('buy', 'buy_price_reached', true)], ON, t0)!
    box.markRead(a.id, true, 'AB', plus(1))
    assert.equal(box.get(a.id)!.email.state, 'skipped')
    box.feedback(a.id, 'no', 'the drop was the whole sector', 'AB', plus(2))
    box.remove(a.id, 'AB', plus(3))
    assert.equal(box.list().length, 0)
    assert.equal(box.all().length, 1)
    assert.deepEqual(box.tally(), [{ type: 'buy_price_reached', yes: 0, no: 1 }])
  })

  await check('messages survive a restart', () => {
    const dir = path.join(root, 'restart')
    const box = new WatchInbox(dir)
    box.addForName(AMZN, 'check_now', [item('a', 'results_out', false)], ON, t0)
    assert.equal(new WatchInbox(dir).list().length, 1)
  })

  await check('the first urgent email goes at once; more for the same name wait 30 minutes as one follow-up', () => {
    const box = freshInbox()
    const a = box.addForName(AMZN, 'buy_price_reached', [item('buy', 'buy_price_reached', true)], ON, t0)!
    const first = selectEmailBatch(box.pendingEmail(), box.all(), t0)
    assert.equal(first.length, 1)
    box.markEmailed(first, true, 'Emailed to 1 address.', t0)
    assert.equal(box.get(a.id)!.email.state, 'sent')
    box.addForName(AMZN, 'warning', [item('bad', 'bad_case_broken', true)], ON, plus(5))
    assert.equal(selectEmailBatch(box.pendingEmail(), box.all(), plus(10)).length, 0, 'held')
    const follow = selectEmailBatch(box.pendingEmail(), box.all(), plus(31))
    assert.equal(follow.length, 1)
    assert.deepEqual(follow[0].items.map((i) => i.id), ['bad'], 'only what was not already sent')
  })

  await check('two names crossing at once share one email', () => {
    const box = freshInbox()
    box.addForName(AMZN, 'buy_price_reached', [item('a', 'buy_price_reached', true, 'Reached its buy price')], ON, t0)
    box.addForName(NHY, 'check_now', [item('b', 'look_again_reached', true, 'Reached its review price')], ON, t0)
    const batch = selectEmailBatch(box.pendingEmail(), box.all(), t0)
    assert.equal(batch.length, 2)
    const { subject } = renderWatchEmail(batch, 'https://cockpit.example')
    assert.match(subject, /2 names need you/)
  })

  await check('the test email is about no one name, so its label stands alone', () => {
    // Found by sending it end to end: without a ticker the header read " · Test email".
    const box = freshInbox()
    const m = box.addGeneral('system', 'Test email', [item('t', 'email_test', false, 'This is a test')], t0)
    const { subject, html } = renderWatchEmail([{ message: m, items: m.items }], 'https://cockpit.example')
    assert.equal(subject, 'Watchlist: This is a test')
    assert.ok(html.includes('>Test email</span>'), 'the label is shown')
    assert.ok(!html.includes('· Test email'), 'no separator before a ticker that is not there')
  })

  await check('the email escapes what it quotes', () => {
    const box = freshInbox()
    box.addForName(AMZN, 'buy_price_reached', [{ ...item('a', 'buy_price_reached', true, '<script>x</script>'), quote: 'a "quote" & <b>' }], ON, t0)
    const { subject, html } = renderWatchEmail(selectEmailBatch(box.pendingEmail(), box.all(), t0), 'https://cockpit.example')
    assert.match(subject, /^AMZN: /)
    assert.ok(!html.includes('<script>'))
    assert.ok(html.includes('&lt;script&gt;'))
  })

  await check('an address that missed an alert is tried again with it — and only it; no address is stored or shown', async () => {
    const box = freshInbox()
    box.addForName(AMZN, 'buy_price_reached', [item('a', 'buy_price_reached', true)], ON, t0)
    const batch = selectEmailBatch(box.pendingEmail(), box.all(), t0)
    const cfg = { enabled: true, recipients: ['one@example.com', 'two@example.com'], appUrl: 'https://cockpit.example', reason: null }
    const r = await deliverWatchEmail(batch, cfg, async (p) => (p.email.startsWith('one') ? { ok: true, status: 200, detail: '' } : { ok: false, status: 500, detail: 'HTTP 500' }))
    assert.equal(r.ok, false, 'not every address has it, so it is not sent')
    assert.match(r.detail, /1 of 2/)
    assert.ok(!r.detail.includes('@'))
    box.markEmailed(batch, r.ok, r.detail, t0, r.delivered)
    const id = batch[0].message.id
    assert.equal(box.get(id)!.email.state, 'failed')
    assert.ok(!JSON.stringify(box.get(id)).includes('@'), 'the record keeps no address')
    const retry = selectEmailBatch(box.pendingEmail(), box.all(), plus(5))
    assert.equal(retry.length, 1, 'tried again')
    const to: string[] = []
    const r2 = await deliverWatchEmail(retry, cfg, async (p) => { to.push(p.email); return { ok: true, status: 200, detail: '' } })
    assert.deepEqual(to, ['two@example.com'], 'only the address that missed it')
    box.markEmailed(retry, r2.ok, r2.detail, plus(5), r2.delivered)
    assert.equal(box.get(id)!.email.state, 'sent')
    const off = await deliverWatchEmail(batch, { ...cfg, enabled: false, reason: 'No address is set for watchlist email.' })
    assert.equal(off.ok, false)
  })

  await check('pausing a name stops what was already waiting to go', () => {
    const box = freshInbox()
    const m = box.addForName(AMZN, 'buy_price_reached', [item('a', 'buy_price_reached', true)], ON, t0)!
    assert.equal(m.email.state, 'pending')
    assert.equal(box.pauseEmail('AMZN|USD', plus(1)), 1)
    assert.equal(box.get(m.id)!.email.state, 'paused')
    assert.equal(box.pendingEmail().length, 0)
  })

  console.log(`\n${passed} passed${process.exitCode ? ' — FAILURES above' : ''}`)
}

void main()
