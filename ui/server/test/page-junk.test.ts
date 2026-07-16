// Page-junk detection (news/page-junk.ts) — the guarantee that a consent popup / terms interstitial /
// cookie banner / paywall stub can never be presented as THE STORY. The fixtures below include the
// VERBATIM text of the reported defect: the ASX announcements page's terms dialog + market-data
// attributions (with the unrendered "{{verificationEmail}}" placeholder) that the reader showed as the
// article body of a TON default-notice filing.
// Run: npx tsx test/page-junk.test.ts
import assert from 'node:assert/strict'
import { classifyParagraphs, isBoilerplateParagraph } from '../src/news/page-junk'
import { extractArticleText, extractJsonLdArticle, extractPublished, extractReadable } from '../src/news/enrich'

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

// ---- subscription-offer popups + the structured-data lane -----------------------------------------
// The reported defect class: a subscribe modal ("Get unlimited access for just $1.99 your first month")
// covers an article whose body IS loaded in the served page. The modal copy must never count as prose,
// and the loaded body must still be readable — via the schema.org JSON-LD articleBody the popup can't touch.

const OFFER_MODAL =
  'Get unlimited access for just $1.99 your first month. Unlock the global benchmark for business news and stay ahead of the market.'
const OFFER_PRICE =
  'Just $0.50 per week for your first year. Cancel anytime — billed annually after the introductory period ends.'
const OFFER_METER =
  'You have reached your free article limit for this month. Already have an account? Sign in to keep reading the story.'
const NEWSLETTER =
  'Want more? Sign up for our morning newsletter to get the biggest stories delivered to your inbox every day before the opening bell.'
const ADBLOCK =
  'It looks like you are using an ad blocker. Please turn off your ad blocker to continue enjoying our award-winning coverage.'

const TEASER =
  'The United Arab Emirates is stepping up efforts to help term buyers of its crude avoid shipping through the Strait of Hormuz, according to people familiar with the matter.'
const LD_P1 =
  'Abu Dhabi National Oil Co. is offering term customers crude loading from the port of Fujairah on the Gulf of Oman, allowing tankers to load without entering the Strait of Hormuz, people with knowledge of the matter said.'
const LD_P2 =
  'The producer has adjusted its official selling prices to make barrels delivered outside the strait more attractive, the people said, asking not to be identified because the information is private.'
const LD_P3 =
  'Shipping costs and insurance premiums for voyages through the chokepoint have climbed since attacks on tankers intensified this month, pushing refiners in Asia to seek alternatives.'
const LD_BODY = [LD_P1, LD_P2, LD_P3].join('\n\n')
const ldScript = (obj: unknown) => `<script type="application/ld+json">${JSON.stringify(obj)}</script>`

await check('subscription-offer / newsletter / adblock modal copy is recognised as boilerplate', () => {
  for (const p of [OFFER_MODAL, OFFER_PRICE, OFFER_METER, NEWSLETTER, ADBLOCK]) {
    assert.equal(isBoilerplateParagraph(p), true, `should be chrome: ${p.slice(0, 60)}…`)
  }
})

await check('an article REPORTING a subscription price survives (price + CTA two-signal guard)', () => {
  const pricing =
    'Netflix raised the price of its standard plan to $15.49 a month in the United States, its second increase in two years, and said it expects the change to lift revenue from the first quarter.'
  assert.equal(isBoilerplateParagraph(pricing), false)
})

await check('financial prose sharing offer vocabulary survives: clinical trials, onboarding, perks, ARPU, metered-strategy coverage', () => {
  const prose = [
    // "start a trial" (clinical) — never "start a FREE trial"
    'The company said it will start a trial of the drug in 240 patients during the first quarter, with initial data expected about a year after enrollment begins.',
    // "already have an account" (fintech onboarding) — the wall form carries the question mark
    'Customers who already have an account with the brokerage can link it to the new app and begin trading within a day, the company said in its launch announcement.',
    // "get unlimited access" (subscription-perk prose) — no price, no CTA
    'Prime members get unlimited access to the streaming library at no extra cost, a perk the company says drives renewals.',
    // per-period price next to "free trial" in EARNINGS prose — the CTA set is imperative-only
    'Disney said average revenue per user fell to $7.28 a month in the first quarter as free trial conversions slowed.',
    // metered-paywall STRATEGY coverage — third person, never "you … your"
    'Readers who reached their free article limit were shown a discounted offer, the publisher said during the earnings call.',
    // "$X for the first quarter" is guidance, not an offer
    'Netflix forecast earnings of $5.58 for the first quarter after a limited-time promotion lifted signups in Asia.',
  ]
  for (const p of prose) assert.equal(isBoilerplateParagraph(p), false, `should be prose: ${p.slice(0, 60)}…`)
})

await check('an offer-modal stub over a bare teaser classifies as paywall', () => {
  const r = classifyParagraphs([OFFER_MODAL, OFFER_METER, TEASER])
  assert.equal(r.verdict, 'paywall')
})

await check('a pricing paragraph alone never flips a thin page to paywall (two-signal is chrome, not a wall)', () => {
  const r = classifyParagraphs([OFFER_PRICE, TEASER])
  assert.notEqual(r.verdict, 'paywall')
})

await check('extractJsonLdArticle: plain NewsArticle block → body paragraphs + datePublished', () => {
  const html = `<html><head>${ldScript({ '@context': 'https://schema.org', '@type': 'NewsArticle', headline: 'x', datePublished: '2026-07-13T09:02:00+04:00', articleBody: LD_BODY })}</head><body></body></html>`
  const r = extractJsonLdArticle(html)
  assert.ok(r)
  assert.equal(r!.paras.length, 3)
  assert.equal(r!.published, '2026-07-13T09:02:00+04:00')
})

await check('extractJsonLdArticle: @graph container + @type array + a malformed sibling block all tolerated', () => {
  const html =
    '<script type="application/ld+json">{not json</script>' +
    ldScript({ '@context': 'https://schema.org', '@graph': [
      { '@type': 'Organization', name: 'Publisher' },
      { '@type': ['ReportageNewsArticle', 'https://schema.org/NewsArticle'], articleBody: LD_BODY, datePublished: '2026-07-13' },
    ] })
  const r = extractJsonLdArticle(html)
  assert.ok(r && r.paras.length === 3 && r.published === '2026-07-13')
})

await check('a popup-buried page reads its loaded body from JSON-LD (verdict ok, modal copy absent)', () => {
  const html = `<html><head>${ldScript({ '@type': 'NewsArticle', articleBody: LD_BODY })}</head><body><p>${TEASER}</p><p>${OFFER_MODAL}</p></body></html>`
  const r = extractArticleText(html)
  assert.equal(r.verdict, 'ok')
  assert.ok(r.text.includes('Fujairah'), 'the loaded body is read')
  assert.ok(!/unlimited access/i.test(r.text), 'the modal copy never leaks')
})

await check('a teaser-only page upgrades to the substantially fuller JSON-LD body (popup-diluted case)', () => {
  const html = `<html><head>${ldScript({ '@type': 'NewsArticle', articleBody: LD_BODY })}</head><body><p>${TEASER}</p></body></html>`
  const r = extractArticleText(html)
  assert.equal(r.verdict, 'ok')
  assert.ok(r.text.includes('official selling prices'), 'the fuller structured body wins')
})

await check('the rendered body wins when the JSON-LD holds only a short description', () => {
  const paras = [LD_P1, LD_P2, LD_P3, TEASER, PROSE_1, PROSE_2].map(para).join('')
  const html = `<html><head>${ldScript({ '@type': 'NewsArticle', articleBody: TEASER })}</head><body>${paras}</body></html>`
  const r = extractArticleText(html)
  assert.equal(r.verdict, 'ok')
  assert.ok(r.text.includes('Mozambique graphite'), 'rendered paragraphs kept')
})

await check('a junk JSON-LD body can never rescue a paywall page (both lanes junk-tested)', () => {
  const html = `<html><head>${ldScript({ '@type': 'NewsArticle', articleBody: [ASX_TERMS, ASX_AGREE, COOKIES].join('\n\n') })}</head><body><p>${OFFER_MODAL}</p><p>${OFFER_METER}</p><p>${TEASER}</p></body></html>`
  const r = extractArticleText(html)
  assert.equal(r.verdict, 'paywall')
})

await check('a TRUNCATED teaser-length JSON-LD body can never flip a hard-paywall page to ok (honest degradation holds)', () => {
  // a hard paywall commonly ships the SAME teaser in articleBody that it renders — rescuing on it
  // would silence the paywall verdict and skip the alternate-outlet / corroboration ladder
  const html = `<html><head>${ldScript({ '@type': 'NewsArticle', articleBody: TEASER })}</head><body><p>${TEASER}</p><p>${OFFER_MODAL}</p><p>${OFFER_METER}</p></body></html>`
  const r = extractArticleText(html)
  assert.equal(r.verdict, 'paywall')
})

await check('a JS shell (no rendered paragraphs at all) is rescued by the JSON-LD body', () => {
  const html = `<html><head>${ldScript({ '@type': 'NewsArticle', articleBody: LD_BODY })}</head><body><script>window.__APP__={}</script><div id="root"></div></body></html>`
  const r = extractArticleText(html)
  assert.equal(r.verdict, 'ok')
  assert.ok(r.text.includes('Fujairah'))
})

await check('type="application/ld+json; charset=utf-8" and single-quoted/unquoted variants all parse', () => {
  const payload = JSON.stringify({ '@type': 'NewsArticle', articleBody: LD_BODY })
  for (const tag of [
    `<script type="application/ld+json; charset=utf-8">${payload}</script>`,
    `<script type='application/ld+json' data-page="1">${payload}</script>`,
    `<script async type=application/ld+json>${payload}</script>`,
  ]) {
    const r = extractJsonLdArticle(`<html><head>${tag}</head><body></body></html>`)
    assert.ok(r && r.paras.length === 3, `should parse: ${tag.slice(0, 60)}…`)
  }
})

await check('<dialog> and <template> markup is never collected as article paragraphs', () => {
  const dialogProse =
    'Choose the plan that works for you and join millions of readers who trust our coverage every single day.'
  const templateProse =
    'This special invitation is shown to a selected group of readers participating in our beta programme today.'
  const html = `<html><body><dialog open><p>${dialogProse}</p></dialog><template id="subscribe-modal"><p>${templateProse}</p></template><p>${PROSE_1}</p><p>${PROSE_2}</p></body></html>`
  const t = extractReadable(html)
  assert.ok(t.includes('Mozambique graphite'), 'real prose kept')
  assert.ok(!t.includes('join millions'), 'dialog content stripped')
  assert.ok(!t.includes('beta programme'), 'template content stripped')
})

await check('a NESTED <dialog> leaks nothing — the outer element tail is stripped with it', () => {
  const tail =
    'Members of the loyalty programme also receive early access to selected reports and events across the region.'
  const html = `<html><body><dialog><p>Pick the subscription plan that suits how you like to read the news every day.</p><dialog><p>Confirm your choice to continue with the selected reading plan right away today.</p></dialog><p>${tail}</p></dialog><p>${PROSE_1}</p><p>${PROSE_2}</p></body></html>`
  const t = extractReadable(html)
  assert.ok(t.includes('Mozambique graphite'), 'real prose kept')
  assert.ok(!t.includes('loyalty programme'), 'the outer dialog tail is stripped, not leaked')
})

await check('extractPublished falls back to the JSON-LD datePublished when the page has no meta date', () => {
  const html = `<html><head>${ldScript({ '@type': 'NewsArticle', articleBody: LD_BODY, datePublished: '2026-07-13T09:02:00Z' })}</head><body><p>${TEASER}</p></body></html>`
  assert.equal(extractPublished(html), '2026-07-13T09:02:00Z')
})

await check('a datePublished-only Article node (no articleBody) still feeds extractPublished', () => {
  const html = `<html><head>${ldScript({ '@type': 'NewsArticle', headline: 'x', datePublished: '2026-07-10' })}</head><body><p>${TEASER}</p></body></html>`
  assert.equal(extractPublished(html), '2026-07-10')
  assert.equal(extractArticleText(html).verdict, 'ok') // and the empty-body node never disturbs the rendered lane
})

console.log(`\npage-junk: ${passed} checks passed${process.exitCode ? ' (WITH FAILURES)' : ''}`)
