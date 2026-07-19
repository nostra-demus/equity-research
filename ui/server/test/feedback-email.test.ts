// feedback-email: the resolution-email template (pure render + escaping), the injectable network send,
// and the notify orchestrator (recipient gating, ledger recording, fail-safe). Run:
//   npx tsx test/feedback-email.test.ts   (exit 0 = all pass)
// Env is set BEFORE the dynamic import so config.ts reads a token (feedbackEmailReady() == true) — a static
// import would evaluate config with whatever the real environment has. No real network: fetch is injected.
import assert from 'node:assert/strict'

process.env.MUNSHOT_EMAIL_TOKEN = 'test-token'
process.env.ENGINE_PUBLIC_APP_URL = 'https://app.example.com'
delete process.env.MUNSHOT_EMAIL_ENDPOINT // exercise the default endpoint
delete process.env.MUNSHOT_EMAIL_ENABLED

let passed = 0
function check(name: string, fn: () => void | Promise<void>): Promise<void> {
  return Promise.resolve()
    .then(fn)
    .then(() => { passed++; console.log(`  ok  ${name}`) })
    .catch((e) => { console.error(`FAIL  ${name}\n      ${e?.message || e}`); process.exitCode = 1 })
}

const baseItem = {
  feedback_id: 'FDB-20260719-abcdef01',
  kind: 'feedback' as const,
  text: 'The chart <b>overflows</b> & breaks on "mobile"',
  category: 'bug' as const,
  images: [] as string[],
  url: '/research#NHY',
  user_id: 'reporter@example.com',
  submitted_at: '2026-07-18T10:00:00Z',
}

async function main() {
  const {
    escapeHtml, looksLikeEmail, renderResolvedEmail, sendRawEmail, notifyFeedbackResolved,
  } = await import('../src/feedback-email')

  await check('escapeHtml escapes the five significant chars', () => {
    assert.equal(escapeHtml(`<a href="x">&'`), '&lt;a href=&quot;x&quot;&gt;&amp;&#39;')
    assert.equal(escapeHtml(''), '')
  })

  await check('looksLikeEmail accepts real addresses, rejects sentinels', () => {
    assert.equal(looksLikeEmail('a@b.com'), true)
    assert.equal(looksLikeEmail('First.Last@sub.example.co.uk'), true)
    assert.equal(looksLikeEmail('local'), false)
    assert.equal(looksLikeEmail(''), false)
    assert.equal(looksLikeEmail('nope'), false)
    assert.equal(looksLikeEmail('a@b'), false) // no TLD dot
    assert.equal(looksLikeEmail('a b@c.com'), false) // space
  })

  await check('render: subject uses the excerpt, falls back when empty', () => {
    const { subject } = renderResolvedEmail({ item: baseItem })
    assert.ok(subject.startsWith('Resolved: The chart'))
    const { subject: s2 } = renderResolvedEmail({ item: { ...baseItem, text: '' } })
    assert.equal(s2, 'Your bug report has been resolved')
  })

  await check('render: a full HTML doc with the resolved pill + category noun', () => {
    const { html } = renderResolvedEmail({ item: baseItem })
    assert.ok(html.startsWith('<!DOCTYPE html>'))
    assert.match(html, /Resolved/)
    assert.match(html, /bug report/)
    assert.match(html, /Open the cockpit/)
  })

  await check('render: untrusted feedback text is ESCAPED, never raw markup', () => {
    const { html } = renderResolvedEmail({ item: baseItem })
    assert.ok(html.includes('&lt;b&gt;overflows&lt;/b&gt;'), 'user tag must be escaped')
    assert.ok(!html.includes('<b>overflows</b>'), 'raw user tag must NOT appear in the email')
    assert.ok(html.includes('&amp; breaks on &quot;mobile&quot;'))
  })

  await check('render: multi-line feedback becomes <br>, still escaped', () => {
    const { html } = renderResolvedEmail({ item: { ...baseItem, text: 'line one\nline <two>' } })
    assert.ok(html.includes('line one<br>line &lt;two&gt;'))
  })

  await check('render: CTA deep-links to a safe relative filed-from path', () => {
    const { html } = renderResolvedEmail({ item: baseItem })
    assert.ok(html.includes('href="https://app.example.com/research#NHY"'))
  })

  await check('render: an unsafe filed-from url collapses to the app root', () => {
    const evil = renderResolvedEmail({ item: { ...baseItem, url: 'http://evil.com/x' } }).html
    assert.ok(!evil.includes('evil.com'), 'off-site url must not reach the CTA')
    assert.ok(evil.includes('href="https://app.example.com"'))
    const proto = renderResolvedEmail({ item: { ...baseItem, url: '//evil.com' } }).html
    assert.ok(!proto.includes('evil.com'))
  })

  await check('render: resolution note appears when present', () => {
    const { html } = renderResolvedEmail({ item: baseItem, note: 'Capped the flex container.' })
    assert.match(html, /What we did/)
    assert.ok(html.includes('Capped the flex container.'))
  })

  await check('render: a valid https PR link renders; a javascript: url does not', () => {
    const good = renderResolvedEmail({ item: baseItem, prUrl: 'https://github.com/x/y/pull/1' }).html
    assert.match(good, /View the change/)
    assert.ok(good.includes('https://github.com/x/y/pull/1'))
    const bad = renderResolvedEmail({ item: baseItem, prUrl: 'javascript:alert(1)' as any }).html
    assert.ok(!/View the change/.test(bad), 'non-https pr link must be dropped')
    assert.ok(!bad.includes('javascript:alert'))
  })

  // ---- sendRawEmail (injected fetch) ----
  await check('sendRawEmail: posts { email, subject, html } with a Bearer token to the default endpoint', async () => {
    let captured: any = null
    const okFetch = async (url: any, opts: any) => { captured = { url, opts }; return { ok: true, status: 200, text: async () => '{"success":true}' } }
    const r = await sendRawEmail({ email: 'a@b.com', subject: 'S', html: '<p>x</p>' }, { fetchFn: okFetch as any })
    assert.equal(r.ok, true)
    assert.equal(captured.url, 'https://devde.muns.io/email/send/raw')
    assert.equal(captured.opts.method, 'POST')
    assert.match(captured.opts.headers.authorization, /^Bearer test-token$/)
    const body = JSON.parse(captured.opts.body)
    assert.deepEqual(body, { email: 'a@b.com', subject: 'S', html: '<p>x</p>' })
    assert.ok(!('text' in body), 'must send html only, never both text and html')
  })

  await check('sendRawEmail: non-2xx → ok:false with a detail, no throw', async () => {
    const badFetch = async () => ({ ok: false, status: 500, text: async () => 'upstream boom' })
    const r = await sendRawEmail({ email: 'a@b.com', subject: 'S', html: '<p>x</p>' }, { fetchFn: badFetch as any })
    assert.equal(r.ok, false)
    assert.match(r.detail, /HTTP 500/)
    assert.match(r.detail, /upstream boom/)
  })

  await check('sendRawEmail: a network throw is caught, never propagates', async () => {
    const throwFetch = async () => { throw new Error('network down') }
    const r = await sendRawEmail({ email: 'a@b.com', subject: 'S', html: '<p>x</p>' }, { fetchFn: throwFetch as any })
    assert.equal(r.ok, false)
    assert.match(r.detail, /network down/)
  })

  // ---- notifyFeedbackResolved (injected fetch + append) ----
  await check('notify: no recipient (local) → not attempted, nothing recorded', async () => {
    const appended: any[] = []
    const append = async (tid: string, o: any) => { appended.push({ tid, ...o }); return {} as any }
    const okFetch = async () => ({ ok: true, status: 200, text: async () => '{}' })
    const r = await notifyFeedbackResolved({ ...baseItem, user_id: 'local' }, { user: 'admin@e.com' }, { fetchFn: okFetch as any, append: append as any })
    assert.equal(r.attempted, false)
    assert.equal(r.reason, 'no_recipient')
    assert.equal(appended.length, 0)
  })

  await check('notify: success → attempted, ok, records a successful notification', async () => {
    const appended: any[] = []
    const append = async (tid: string, o: any) => { appended.push({ tid, ...o }); return {} as any }
    const okFetch = async () => ({ ok: true, status: 200, text: async () => '{"success":true}' })
    const r = await notifyFeedbackResolved(baseItem, { user: 'admin@e.com', note: 'fixed' }, { fetchFn: okFetch as any, append: append as any, now: () => new Date('2026-07-19T12:00:00Z') })
    assert.equal(r.attempted, true)
    assert.equal(r.ok, true)
    assert.equal(r.reason, 'sent')
    assert.equal(r.recipient, 'reporter@example.com')
    assert.equal(appended.length, 1)
    assert.equal(appended[0].tid, baseItem.feedback_id)
    assert.equal(appended[0].ok, true)
    assert.equal(appended[0].recipient, 'reporter@example.com')
  })

  await check('notify: send failure → attempted, not ok, records a failed notification', async () => {
    const appended: any[] = []
    const append = async (tid: string, o: any) => { appended.push({ tid, ...o }); return {} as any }
    const badFetch = async () => ({ ok: false, status: 502, text: async () => 'bad gateway' })
    const r = await notifyFeedbackResolved(baseItem, { user: 'a' }, { fetchFn: badFetch as any, append: append as any })
    assert.equal(r.attempted, true)
    assert.equal(r.ok, false)
    assert.equal(r.reason, 'send_failed')
    assert.equal(appended.length, 1)
    assert.equal(appended[0].ok, false)
    assert.match(appended[0].detail, /HTTP 502/)
  })

  await check('notify: a ledger append error still resolves (never throws)', async () => {
    const okFetch = async () => ({ ok: true, status: 200, text: async () => '{}' })
    const append = async () => { throw new Error('disk full') }
    const r = await notifyFeedbackResolved(baseItem, { user: 'a' }, { fetchFn: okFetch as any, append: append as any })
    assert.equal(r.ok, true) // the email went out; the ledger hiccup is swallowed
  })

  console.log(`\n${passed} checks passed${process.exitCode ? ' (with failures)' : ''}`)
}

main()
