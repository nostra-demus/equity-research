// THE STORY floor (news/story-floor.ts): the reader must NEVER show an empty/error-only story. For a
// filing the headline IS the disclosure (restate the subject + note the attachment); for an unreadable
// article restate the lede/headline. Accurate (no fabricated facts), never empty. Pure, no network.
// Run: npx tsx test/story-floor.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import { storyFloor, isFilingEvent } from '../src/news/story-floor'

let passed = 0
function check(name: string, fn: () => void) {
  try {
    fn()
    passed++
    console.log(`  ok  ${name}`)
  } catch (e: any) {
    console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`)
    process.exitCode = 1
  }
}

const FILING = { input_nature: 'exchange_announcement', source_tier: 'primary_filing', source_name: 'BSE / NSE Exchange Filing', domain: 'www.bseindia.com' }

check('the exact reported case: GANESH HOUSING filing → a real story, never the raw error', () => {
  const r = storyFloor({
    ...FILING,
    headline: 'GANESH HOUSING LIMITED: Publication of Newspaper Advertisements - Special Window for transfer and dematerialisation of physical equity shares',
    url: 'https://www.bseindia.com/xml-data/corpfiling/AttachLive/abc123.pdf',
  })
  assert.equal(r.kind, 'filing')
  assert.ok(r.summary.includes('GANESH HOUSING LIMITED'), 'names the company')
  assert.ok(/Publication of Newspaper Advertisements/.test(r.summary), 'carries the disclosure subject')
  assert.ok(/PDF attachment/.test(r.summary), 'tells the reader the doc is a PDF attachment')
  assert.ok(!/not an HTML|source blocked|HTTP \d/.test(r.summary), 'never surfaces a raw fetch error')
  assert.ok(r.summary.length > 30)
})

check('repeated company + "has informed the Exchange about" is stripped to the subject', () => {
  const r = storyFloor({ ...FILING, headline: 'Patanjali Foods Limited: Patanjali Foods Limited has informed the Exchange about Outcome of Board Meeting', url: 'x.pdf' })
  assert.ok(/Subject — Outcome of Board Meeting/.test(r.summary), `subject not cleaned: ${r.summary}`)
  assert.ok(!/has informed the Exchange/i.test(r.summary), 'the connective boilerplate is removed')
})

check('"has submitted to BSE a copy of" is stripped', () => {
  const r = storyFloor({ ...FILING, headline: 'India Motor Parts & Accessories Ltd: India Motor Parts & Accessories Ltd has submitted to BSE a copy of Newspaper Advertisement' })
  assert.ok(/Subject — Newspaper Advertisement/i.test(r.summary), r.summary)
})

check('a meaningful "Disclosure under Reg .." subject is KEPT, not stripped', () => {
  const r = storyFloor({ ...FILING, headline: 'Adishakti Loha and Ispat Ltd: Disclosure under Reg 31(2) of SEBI SAST reg 2011' })
  assert.ok(/Disclosure under Reg 31\(2\)/.test(r.summary), r.summary)
})

check('a bare scrip-code stub gets a clean company-only story (no bogus subject)', () => {
  const r = storyFloor({ ...FILING, headline: 'Zee Media Corporation Ltd (532794)', companies: [{ name: 'Zee Media Corporation Ltd' }] })
  assert.ok(/Exchange disclosure by Zee Media Corporation/.test(r.summary), r.summary)
  assert.ok(!/\(532794\)/.test(r.summary.replace(/^.*disclosure by [^.]*/i, '')), 'the bare code is not presented as a subject')
  assert.ok(r.summary.length > 20)
})

check('isFilingEvent fires on each independent signal', () => {
  assert.ok(isFilingEvent({ input_nature: 'regulatory_filing' }))
  assert.ok(isFilingEvent({ source_tier: 'primary_filing' }))
  assert.ok(isFilingEvent({ domain: 'api.bseindia.com' }))
  assert.ok(isFilingEvent({ domain: 'www.nseindia.com' }))
  assert.ok(isFilingEvent({ source_name: 'BSE / NSE Exchange Filing' }))
  assert.ok(isFilingEvent({ headline: 'Foo Ltd: Outcome of Board Meeting' }))
  assert.ok(isFilingEvent({ headline: 'Bar Ltd has informed the Exchange about a postal ballot' }))
  assert.ok(!isFilingEvent({ headline: 'Apple beats earnings, raises guidance', source_name: 'Reuters', domain: 'reuters.com' }), 'a normal news item is NOT a filing')
})

check('a normal article with a feed lede leads with the lede', () => {
  const r = storyFloor({ headline: 'Acme posts record quarter', source_name: 'Reuters', domain: 'reuters.com', snippet: 'Acme Corp reported quarterly revenue of $4.2 billion, up 18% year over year, beating analyst expectations on strong cloud demand.' })
  assert.equal(r.kind, 'article')
  assert.ok(/4\.2 billion/.test(r.summary), 'uses the feed lede')
})

check('an unreadable article with no lede restates the headline (never blank, never an error)', () => {
  const r = storyFloor({ headline: 'SpaceX shares close 19% higher after tender offer', source_name: 'Bloomberg', domain: 'bloomberg.com' })
  assert.equal(r.kind, 'article')
  assert.ok(/from the headline:/i.test(r.summary), r.summary)
  assert.ok(/SpaceX shares close 19% higher/.test(r.summary))
  assert.ok(!/not an HTML|source blocked/.test(r.summary))
})

check('attachment hint adapts to the link type', () => {
  assert.ok(/PDF attachment/.test(storyFloor({ ...FILING, headline: 'Foo Ltd: General Updates', url: 'https://x.com/a.pdf' }).summary))
  assert.ok(/Open the source/.test(storyFloor({ ...FILING, headline: 'Foo Ltd: General Updates', url: 'https://www.bseindia.com/corporates/ann.html#123' }).summary))
})

check('NEVER empty and NEVER fabricated — fuzz over odd inputs', () => {
  const odd: any[] = [
    { headline: '' },
    { headline: null, companies: null, url: null },
    { ...FILING, headline: ':' },
    { ...FILING, headline: 'Ltd:' },
    { ...FILING, headline: '(123456)' },
    { headline: 'A', source_name: 'X' },
    { ...FILING, headline: 'X'.repeat(480) },
    { headline: '<a href="x">Some &amp; markup headline that is long enough</a>', source_name: 'Reuters' },
  ]
  for (const i of odd) {
    const r = storyFloor(i)
    assert.ok(typeof r.summary === 'string' && r.summary.trim().length > 0, `empty summary for ${JSON.stringify(i).slice(0,60)}`)
    assert.ok(!/undefined|null|\[object/.test(r.summary), `leaked a JS artifact: ${r.summary}`)
    assert.ok(r.summary.length <= 600)
  }
})

console.log(`\n${passed} checks passed`)
