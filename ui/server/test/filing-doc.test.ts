// Filing-document resolution + fetch (news/filing-doc.ts) — the layer that turns an exchange event's
// viewer/interstitial URL into the REAL disclosure text. Proves the URL derivation (ASX documentKey →
// the research-gateway PDF; direct .pdf links pass through), the SSRF posture (allowlist, redirect
// re-validation, byte caps), and the honest degrade notes.
// Run: npx tsx test/filing-doc.test.ts
import assert from 'node:assert/strict'
import { fetchFilingDocText, isSafeDocUrl, resolveFilingDocUrl } from '../src/news/filing-doc'

let passed = 0
async function check(name: string, fn: () => void | Promise<void>) {
  try { await fn(); passed++; console.log(`  ok  ${name}`) }
  catch (e: any) { console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`); process.exitCode = 1 }
}

const ASX_PAGE = 'https://www.asx.com.au/markets/trade-our-cash-market/announcements.TON?key=2924-03106938-6A1332187'
const ASX_DOC = 'https://cdn-api.markitdigital.com/apiman-gateway/ASX/asx-research/1.0/file/2924-03106938-6A1332187'

/** A minimal PDF whose text is the given lines (joined by T* newlines). Parens must not appear in lines. */
function tinyPdf(lines: string[]): Buffer {
  const content = `BT /F1 12 Tf ${lines.map((l) => `(${l}) Tj T*`).join(' ')} ET`
  return Buffer.from(
    `%PDF-1.4\n1 0 obj <</Type/Catalog/Pages 2 0 R>> endobj\n` +
    `4 0 obj <</Length ${content.length}>>\nstream\n${content}\nendstream\nendobj\n` +
    `trailer\n<</Size 9/Root 1 0 R>>\n%%EOF\n`,
    'latin1',
  )
}
const ANNOUNCEMENT =
  'Triton Minerals said completion of the sale of its Mozambique graphite assets did not occur on 1 July 2026 ' +
  'because the buyer failed to take the required steps, and it has issued a default notice requiring completion by Thursday 9 July 2026.'

await check('resolveFilingDocUrl: the ASX viewer page resolves to the research-gateway document', () => {
  assert.deepEqual(resolveFilingDocUrl(ASX_PAGE), { docUrl: ASX_DOC, kind: 'asx' })
})
await check('resolveFilingDocUrl: an ASX URL whose key is a headline (no documentKey) resolves to nothing', () => {
  assert.equal(resolveFilingDocUrl('https://www.asx.com.au/markets/trade-our-cash-market/announcements.TON?key=Completion%20delay'), null)
})
await check('resolveFilingDocUrl: a crafted key cannot smuggle a path/query into the doc URL', () => {
  assert.equal(resolveFilingDocUrl('https://www.asx.com.au/markets/trade-our-cash-market/announcements.TON?key=..%2F..%2Fadmin'), null)
  assert.equal(resolveFilingDocUrl('https://www.asx.com.au/markets/trade-our-cash-market/announcements.TON?key=2924-1-A%3Fx%3D1'), null)
})
await check('resolveFilingDocUrl: a direct .pdf on an approved domain passes through; off-list does not', () => {
  const hkex = 'https://www1.hkexnews.hk/listedco/listconews/sehk/2026/0702/file.pdf'
  assert.deepEqual(resolveFilingDocUrl(hkex), { docUrl: hkex, kind: 'pdf' })
  assert.equal(resolveFilingDocUrl('https://evil.example.com/file.pdf'), null)
  assert.equal(resolveFilingDocUrl('https://www.fool.com/investing/2026/07/02/article/'), null)
})

await check('isSafeDocUrl: doc CDN + approved domains pass; IPs, localhost, ports, userinfo, off-list fail', () => {
  assert.equal(isSafeDocUrl(ASX_DOC), true)
  assert.equal(isSafeDocUrl('https://www1.hkexnews.hk/some/file.pdf'), true)
  assert.equal(isSafeDocUrl('https://127.0.0.1/x.pdf'), false)
  assert.equal(isSafeDocUrl('https://localhost/x.pdf'), false)
  assert.equal(isSafeDocUrl('https://cdn-api.markitdigital.com:8443/x'), false)
  assert.equal(isSafeDocUrl('https://user:pw@cdn-api.markitdigital.com/x'), false)
  assert.equal(isSafeDocUrl('https://evil.example.com/x.pdf'), false)
})

await check('fetchFilingDocText: reads a PDF and strips the page furniture (watermark, page numbers)', async () => {
  const pdf = tinyPdf(['For personal use only', 'Page 1 of 2', ANNOUNCEMENT])
  const fetchFn = (async () => new Response(pdf, { status: 200, headers: { 'content-type': 'application/pdf' } })) as typeof fetch
  const r = await fetchFilingDocText(ASX_DOC, { fetchFn })
  assert.equal(r.ok, true)
  assert.ok(r.text!.includes('default notice'), 'announcement text present')
  assert.ok(!/for personal use only/i.test(r.text!), 'watermark stripped')
  assert.ok(!/^Page 1/m.test(r.text!), 'page number stripped')
})

await check('fetchFilingDocText: a redirect is re-validated — an off-allowlist hop is refused', async () => {
  const fetchFn = (async (input: any) => {
    const url = String(input?.url || input)
    if (url.includes('markitdigital')) return new Response(null, { status: 302, headers: { location: 'https://evil.example.com/x.pdf' } })
    return new Response('nope', { status: 200 })
  }) as typeof fetch
  const r = await fetchFilingDocText(ASX_DOC, { fetchFn })
  assert.equal(r.ok, false)
  assert.match(r.note!, /approved host/)
})

await check('fetchFilingDocText: non-PDF bytes, HTTP errors, and oversized documents degrade with notes', async () => {
  const html = (async () => new Response('<html>an html page</html>', { status: 200, headers: { 'content-type': 'text/html' } })) as typeof fetch
  assert.match((await fetchFilingDocText(ASX_DOC, { fetchFn: html })).note!, /not a PDF/)
  const err = (async () => new Response('x', { status: 503 })) as typeof fetch
  assert.match((await fetchFilingDocText(ASX_DOC, { fetchFn: err })).note!, /HTTP 503/)
  const big = (async () => new Response('x', { status: 200, headers: { 'content-length': '99999999' } })) as typeof fetch
  assert.match((await fetchFilingDocText(ASX_DOC, { fetchFn: big })).note!, /too large/)
})

await check('fetchFilingDocText: a scanned/empty PDF degrades honestly (no fake text)', async () => {
  const pdf = tinyPdf(['x'])
  const fetchFn = (async () => new Response(pdf, { status: 200, headers: { 'content-type': 'application/pdf' } })) as typeof fetch
  const r = await fetchFilingDocText(ASX_DOC, { fetchFn })
  assert.equal(r.ok, false)
  assert.match(r.note!, /no extractable text|too thin/)
})

console.log(`\nfiling-doc: ${passed} checks passed${process.exitCode ? ' (WITH FAILURES)' : ''}`)
