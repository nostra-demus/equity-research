// Page-junk detection (news/page-junk.ts) — the guarantee that a consent popup / terms interstitial /
// cookie banner / paywall stub can never be presented as THE STORY. The fixtures below include the
// VERBATIM text of the reported defect: the ASX announcements page's terms dialog + market-data
// attributions (with the unrendered "{{verificationEmail}}" placeholder) that the reader showed as the
// article body of a TON default-notice filing.
// Run: npx tsx test/page-junk.test.ts
import assert from 'node:assert/strict'
import { classifyParagraphs, isBoilerplateParagraph } from '../src/news/page-junk'
import { extractArticleText, extractReadable } from '../src/news/enrich'

let passed = 0
async function check(name: string, fn: () => void | Promise<void>) {
  try { await fn(); passed++; console.log(`  ok  ${name}`) }
  catch (e: any) { console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`); process.exitCode = 1 }
}

// the EXACT text the reader leaked as THE STORY (from the incident screenshots)
const ASX_LEAK =
  'An email containing a verification link has been sent to {{verificationEmail}}. All company announcements ' +
  'are also available to view via brokers and news agencies. The access to and use of information made available ' +
  'on the ASX website, including Market Announcements, is subject to the terms of use . Market data is provided ' +
  'and copyrighted by LSEG Data & Analytics and Morningstar. Click for restrictions . Index data is provided ' +
  '© S&P Dow Jones Indices LLC. All rights reserved.'
const ASX_TERMS =
  'Announcements submitted by listed entities to ASX and made available on or through this site are the sole ' +
  'responsibility of the person or entity that has submitted the announcement for publication. To the extent ' +
  'permitted by law, ASX expressly disclaims any responsibility or legal liability to anyone whatsoever for ' +
  'failing to detect or prevent the release of an announcement that is inaccurate, incomplete, misleading, ' +
  'defamatory or otherwise defective.'
const ASX_PERSONAL =
  'Market Announcements are freely available for investors’ private and personal use only, and cannot be used ' +
  'for any commercial purpose without the express written authority of ASX Limited or a related company.'
const ASX_AGREE =
  'By clicking “agree and proceed” below, you acknowledge that you have read this notice and the Terms of Use ' +
  'and agree to be bound by them.'
const COOKIES =
  'We use cookies to help ensure that our website and services are able to function properly. These cookies are ' +
  'necessary and so are set automatically. Where you have consented, we also use some cookies to make your visit more personal.'

const PROSE_1 =
  'Triton Minerals said completion of the sale of its Mozambique graphite assets did not occur on 1 July 2026 ' +
  'because the buyer failed to take the steps required of it under the share sale and purchase agreement.'
const PROSE_2 =
  'The company has issued a notice requiring the buyer to remedy the failure and complete the transaction by ' +
  'Thursday 9 July 2026, and says it is considering its rights and remedies under the agreement and at law.'

await check('every paragraph of the leaked ASX interstitial is recognised as boilerplate', () => {
  for (const p of [ASX_LEAK, ASX_TERMS, ASX_PERSONAL, ASX_AGREE, COOKIES]) {
    assert.equal(isBoilerplateParagraph(p), true, `should be chrome: ${p.slice(0, 60)}…`)
  }
})

await check('real announcement prose is NOT boilerplate — including sentences that mention agreements', () => {
  for (const p of [PROSE_1, PROSE_2]) assert.equal(isBoilerplateParagraph(p), false, `should be prose: ${p.slice(0, 60)}…`)
})

await check('an article REPORTING on terms-of-use / cookies survives (two-signal guard)', () => {
  const report = 'The lawsuit alleges the platform’s terms of use unfairly restricted sellers, and regulators say the cookie practices in question misled millions of European users about tracking.'
  assert.equal(isBoilerplateParagraph(report), false)
})

await check('the ASX interstitial page classifies as interstitial (nothing readable remains)', () => {
  const r = classifyParagraphs([ASX_LEAK, ASX_TERMS, ASX_PERSONAL, ASX_AGREE, COOKIES])
  assert.equal(r.verdict, 'interstitial')
  assert.equal(r.kept.length, 0)
})

await check('a real article with one cookie banner classifies ok and keeps its prose', () => {
  const r = classifyParagraphs([COOKIES, PROSE_1, PROSE_2, PROSE_1 + ' Additional detail follows in the notice.', PROSE_2 + ' Shareholders will be kept updated.'])
  assert.equal(r.verdict, 'ok')
  assert.ok(r.kept.length >= 4)
  assert.ok(!r.kept.includes(COOKIES))
})

await check('a paywall stub classifies as paywall', () => {
  const r = classifyParagraphs([
    'Subscribe now to continue reading this article and unlock full access to all our journalism today.',
    'Already a subscriber? Sign in to your account to continue where you left off with this story.',
  ])
  assert.equal(r.verdict, 'paywall')
})

await check('an unrendered template placeholder alone marks a paragraph as chrome', () => {
  assert.equal(isBoilerplateParagraph('Your report will be sent to {{userEmail}} once the export completes successfully today.'), true)
})

const para = (s: string) => `<p>${s}</p>`
await check('extractArticleText: the interstitial page yields verdict=interstitial and NO text', () => {
  const html = `<html><body>${[ASX_LEAK, ASX_TERMS, ASX_PERSONAL, ASX_AGREE, COOKIES].map(para).join('')}</body></html>`
  const r = extractArticleText(html)
  assert.equal(r.verdict, 'interstitial')
  assert.equal(r.text, '')
})

await check('extractReadable: chrome paragraphs are dropped from a real article, prose kept (back-compat shape)', () => {
  const html = `<html><body>${[COOKIES, PROSE_1, PROSE_2].map(para).join('')}</body></html>`
  const t = extractReadable(html)
  assert.ok(t.includes('Mozambique graphite'), 'prose kept')
  assert.ok(!/we use cookies/i.test(t), 'cookie banner dropped')
})

console.log(`\npage-junk: ${passed} checks passed${process.exitCode ? ' (WITH FAILURES)' : ''}`)
