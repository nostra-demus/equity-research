// node:test — pure alert formatting + a fetch-injected sender. Zero deps, zero network.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { humanDuration, alertText, buildRequest, sendAlert } from '../src/alert.mjs'

const HOST = 'app.nostra-demus.com'
const NOW = 1_700_000_000_000

test('humanDuration is coarse and safe', () => {
  assert.equal(humanDuration(0), '0s')
  assert.equal(humanDuration(-5), '0s')
  assert.equal(humanDuration(null), '0s')
  assert.equal(humanDuration(45_000), '45s')
  assert.equal(humanDuration(3 * 60_000), '3m')
  assert.equal(humanDuration(80 * 60_000), '80m') // minutes shown until the 90m cutoff
  assert.equal(humanDuration(60 * 60_000), '60m')
  assert.equal(humanDuration(90 * 60_000), '1h 30m') // then hours + minutes
  assert.equal(humanDuration(80 * 60_000 + 60 * 60_000), '2h 20m')
})

test('alertText renders each kind with the right level and host', () => {
  const down = alertText({ kind: 'down', downSince: NOW - 3 * 60_000, now: NOW }, HOST)
  assert.equal(down.level, 'error')
  assert.match(down.title, /DOWN/)
  assert.match(down.title, new RegExp(HOST))
  assert.match(down.message, /3m/)
  assert.match(down.message, /independent of your laptop/i) // the reassurance is the whole point

  assert.equal(alertText({ kind: 'recovery', downSince: NOW - 5 * 60_000, now: NOW }, HOST).level, 'info')
  assert.equal(alertText({ kind: 'reminder', downSince: NOW - 9 * 60_000, now: NOW }, HOST).level, 'error')
  assert.equal(alertText({ kind: 'auth', downSince: null, now: NOW }, HOST).level, 'warning')
})

test('buildRequest: json (default) needs a webhook url', () => {
  const text = alertText({ kind: 'down', downSince: NOW - 60_000, now: NOW }, HOST)
  assert.equal(buildRequest({}, text), null) // no url → not configured
  const req = buildRequest({ MONITOR_ALERT_WEBHOOK_URL: 'https://hook.example/x' }, text)
  assert.equal(req.url, 'https://hook.example/x')
  assert.equal(req.init.method, 'POST')
  const body = JSON.parse(req.init.body)
  assert.equal(body.level, 'error')
  assert.equal(typeof body.title, 'string')
})

test('buildRequest: slack + discord shapes', () => {
  const text = alertText({ kind: 'recovery', downSince: NOW - 60_000, now: NOW }, HOST)
  const slack = buildRequest({ MONITOR_ALERT_FORMAT: 'slack', MONITOR_ALERT_WEBHOOK_URL: 'https://slack/x' }, text)
  assert.ok(JSON.parse(slack.init.body).text.includes(HOST))
  const discord = buildRequest({ MONITOR_ALERT_FORMAT: 'discord', MONITOR_ALERT_WEBHOOK_URL: 'https://discord/x' }, text)
  assert.ok(JSON.parse(discord.init.body).content.includes(HOST))
})

test('buildRequest: ntfy sets Title + urgency header, body is the message', () => {
  const text = alertText({ kind: 'down', downSince: NOW - 60_000, now: NOW }, HOST)
  const req = buildRequest({ MONITOR_ALERT_FORMAT: 'ntfy', MONITOR_ALERT_WEBHOOK_URL: 'https://ntfy.sh/mytopic' }, text)
  assert.equal(req.url, 'https://ntfy.sh/mytopic')
  assert.equal(req.init.headers.Priority, 'urgent')
  assert.equal(req.init.body, text.message)
})

test('ntfy Title header is ByteString-safe (fetch throws on code points > 255)', () => {
  // The alert title carries an emoji (🔴, code point > 255). Putting it verbatim in an HTTP HEADER
  // makes Request construction throw — which sendAlert would swallow, so ntfy would silently never fire.
  const text = alertText({ kind: 'down', downSince: NOW - 60_000, now: NOW }, HOST)
  assert.ok(/[^\x00-\xFF]/.test(text.title), 'precondition: the title really does contain an emoji')
  const req = buildRequest({ MONITOR_ALERT_FORMAT: 'ntfy', MONITOR_ALERT_WEBHOOK_URL: 'https://ntfy.sh/mytopic' }, text)
  for (const v of Object.values(req.init.headers)) {
    for (const ch of String(v)) assert.ok(ch.codePointAt(0) <= 255, `header char "${ch}" (${ch.codePointAt(0)}) > 255`)
  }
  // The real proof: constructing the request the way fetch does must not throw.
  assert.doesNotThrow(() => new Request(req.url, req.init))
  assert.ok(req.init.headers.Title.length > 0) // still a meaningful title after stripping
})

test('buildRequest: telegram + pushover need their own credentials', () => {
  const text = alertText({ kind: 'down', downSince: NOW - 60_000, now: NOW }, HOST)
  assert.equal(buildRequest({ MONITOR_ALERT_FORMAT: 'telegram' }, text), null)
  const tg = buildRequest({ MONITOR_ALERT_FORMAT: 'telegram', MONITOR_TELEGRAM_TOKEN: 't', MONITOR_TELEGRAM_CHAT_ID: '42' }, text)
  assert.match(tg.url, /api\.telegram\.org\/bott\/sendMessage/)
  assert.equal(JSON.parse(tg.init.body).chat_id, '42')

  assert.equal(buildRequest({ MONITOR_ALERT_FORMAT: 'pushover' }, text), null)
  const po = buildRequest({ MONITOR_ALERT_FORMAT: 'pushover', MONITOR_PUSHOVER_TOKEN: 'k', MONITOR_PUSHOVER_USER: 'u' }, text)
  assert.match(po.url, /api\.pushover\.net/)
  assert.match(po.init.headers['content-type'], /x-www-form-urlencoded/)
  assert.ok(po.init.body.toString().includes('priority=1')) // error → high priority
})

test('sendAlert skips cleanly when nothing is configured', async () => {
  const text = alertText({ kind: 'down', downSince: NOW - 60_000, now: NOW }, HOST)
  const r = await sendAlert({}, text, async () => new Response('', { status: 200 }))
  assert.equal(r.ok, false)
  assert.equal(r.skipped, true)
})

test('sendAlert posts via the injected fetch and reports status', async () => {
  const text = alertText({ kind: 'down', downSince: NOW - 60_000, now: NOW }, HOST)
  let seenUrl = null
  const fakeFetch = async (url) => {
    seenUrl = url
    return new Response('ok', { status: 200 })
  }
  const r = await sendAlert({ MONITOR_ALERT_WEBHOOK_URL: 'https://hook.example/x' }, text, fakeFetch)
  assert.equal(seenUrl, 'https://hook.example/x')
  assert.equal(r.ok, true)
  assert.equal(r.status, 200)
})

test('sendAlert never throws — a fetch failure is captured', async () => {
  const text = alertText({ kind: 'down', downSince: NOW - 60_000, now: NOW }, HOST)
  const r = await sendAlert({ MONITOR_ALERT_WEBHOOK_URL: 'https://hook.example/x' }, text, async () => {
    throw new Error('network is down')
  })
  assert.equal(r.ok, false)
  assert.match(r.error, /network is down/)
})
