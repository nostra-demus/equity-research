// The pick-a-company filter (the ticker autofill): matchesFeedFilters' company clause, the parser, the
// archive-search reach for a buried match, the company facet (dedup + junk-exclusion) that feeds the
// autofill, and the explain trace. The clause is deliberately BOTH ticker (exact) AND name (substring):
// a picked suggestion carries both, so it catches items the name alone would miss (a differently-worded
// tag, or a ticker-only tag) and vice-versa — "all the data about that company, without fail". This mirrors
// the browser twin at ui/web/src/components/screener/companyFilter.test.ts. Run: npx tsx test/company-filter.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { searchFeed } from '../src/news/feed'
import { matchesFeedFilters, explainFeedFilterMatch, hasAnyFilter, parseFeedFilterQuery } from '../src/news/feed-filter'
import { computeFacets } from '../src/news/facets'
import type { FeedItem } from '../src/news/types'

let passed = 0
function check(name: string, fn: () => void) {
  try { fn(); passed++; console.log(`  ok  ${name}`) }
  catch (e: any) { console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`); process.exitCode = 1 }
}

const NOW = new Date('2026-06-28T12:00:00Z')
const now = () => NOW
const dayAgo = (d: number) => new Date(NOW.getTime() - d * 86_400_000).toISOString().slice(0, 10)
const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'cofilter-'))

let seq = 0
function item(p: Partial<FeedItem> & { ts: string }): FeedItem {
  seq++
  return {
    kind: 'item', event_id: `EVT-${String(seq).padStart(6, '0')}`, headline: 'A generic corporate update',
    url: `https://ex.com/${seq}`, domain: 'ex.com', source_name: 'Example Wire', via: 'rss', region: 'US',
    input_nature: 'news_headline', triage_score: 50, band: 'watch', triage_reason: '', relevance: 'material',
    event_types: ['product'], issuer_linkage: 'primary', companies: [], size_bucket: 'unknown',
    dedup_status: 'new', inboxed: true, ...p,
  } as FeedItem
}
function writeDay(repo: string, date: string, items: FeedItem[]) {
  const dir = path.join(repo, 'screener', 'inbox')
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, `${date}_firehose.ndjson`), items.map((it) => JSON.stringify(it)).join('\n') + '\n')
}

// ---- 1. exact ticker match (the precise path) ----
check('matchesFeedFilters matches an item tagged with the exact ticker', () => {
  const it = item({ ts: `${dayAgo(0)}T10:00:00Z`, headline: 'Retailer lifts guidance', companies: [{ name: 'Amazon.com Inc', ticker: 'AMZN', listing_country: 'US' }] })
  assert.equal(matchesFeedFilters(it, { company: { ticker: 'AMZN', name: 'Amazon.com Inc' } }), true)
  assert.equal(matchesFeedFilters(it, { company: { ticker: 'amzn' } }), true, 'ticker match is case-insensitive')
  assert.equal(matchesFeedFilters(it, { company: { ticker: 'MSFT' } }), false, 'a different ticker must not match')
})

// ---- 2. name substring over the headline (catches an item the ticker missed) ----
check('matchesFeedFilters matches by name substring in the headline even with no tag', () => {
  const it = item({ ts: `${dayAgo(0)}T10:00:00Z`, headline: 'Amazon opens a new fulfilment centre', companies: [] })
  assert.equal(matchesFeedFilters(it, { company: { ticker: 'AMZN', name: 'Amazon' } }), true, 'name in headline qualifies even though nothing is tagged')
  assert.equal(matchesFeedFilters(it, { company: { ticker: 'AMZN', name: '' } }), false, 'ticker-only: an untagged headline is NOT an exact-ticker hit')
})

// ---- 3. name-only pick (ticker null) — matched by name, never by a ticker it doesn't have ----
check('a name-only company pick matches by name and a ticker-only pick does not falsely match it', () => {
  const it = item({ ts: `${dayAgo(0)}T10:00:00Z`, headline: 'Some Startup raises a round', companies: [{ name: 'Some Startup', ticker: null, listing_country: 'US' }] })
  assert.equal(matchesFeedFilters(it, { company: { ticker: null, name: 'Some Startup' } }), true)
  assert.equal(matchesFeedFilters(it, { company: { ticker: 'SOME', name: '' } }), false, 'no ticker tagged → exact-ticker filter must not match')
})

// ---- 4. the reliability point: ticker catches a tag whose NAME the headline never spells out ----
check('matchesFeedFilters matches by ticker when the headline never names the company', () => {
  const it = item({ ts: `${dayAgo(0)}T10:00:00Z`, headline: 'The online retailer beats on cloud growth', companies: [{ name: 'Amazon', ticker: 'AMZN', listing_country: 'US' }] })
  // name "Amazon" is not in the headline, but the tag carries the ticker → the ticker clause still catches it
  assert.equal(matchesFeedFilters(it, { company: { ticker: 'AMZN', name: 'Amazon' } }), true)
})

// ---- 5. AND-combination with the free-text clause ----
check('matchesFeedFilters ANDs the company clause with a text search', () => {
  const it = item({ ts: `${dayAgo(0)}T10:00:00Z`, headline: 'Amazon lifts guidance to 8%', companies: [{ name: 'Amazon', ticker: 'AMZN', listing_country: 'US' }] })
  assert.equal(matchesFeedFilters(it, { company: { ticker: 'AMZN', name: 'Amazon' }, text: '8%' }), true)
  assert.equal(matchesFeedFilters(it, { company: { ticker: 'AMZN', name: 'Amazon' }, text: 'buyback' }), false, 'text clause still gates when company matches')
  assert.equal(matchesFeedFilters(it, { company: { ticker: 'MSFT', name: 'Microsoft' }, text: '8%' }), false, 'company clause still gates when text matches')
})

// ---- 6. hasAnyFilter recognises a company filter (so the cockpit flips to archive search) ----
check('hasAnyFilter is true for a ticker or name, false for an empty company object', () => {
  assert.equal(hasAnyFilter({ company: { ticker: 'AMZN' } }), true)
  assert.equal(hasAnyFilter({ company: { name: 'Amazon' } }), true)
  assert.equal(hasAnyFilter({ company: {} }), false, 'an empty company must not trip archive mode')
  assert.equal(hasAnyFilter({}), false)
})

// ---- 7. parseFeedFilterQuery reads the query params (ticker upcased, name verbatim) ----
check('parseFeedFilterQuery maps companyTicker/companyName and upcases the ticker', () => {
  const q = parseFeedFilterQuery({ companyTicker: 'amzn', companyName: 'Amazon.com Inc' })
  assert.deepEqual(q.company, { ticker: 'AMZN', name: 'Amazon.com Inc' })
  assert.equal(parseFeedFilterQuery({ companyName: 'Amazon' }).company?.ticker, undefined, 'name-only pick has no ticker')
  assert.equal(parseFeedFilterQuery({}).company, undefined, 'no company params → undefined')
})

// THE REPORTED GAP (Codex review, PR #319): a raw HTTP request sending ONLY `companyAliases` (no ticker,
// no name — a shape ArchiveQuery/CompanyPick can produce) used to be parsed away to `undefined` here, before
// companyClauseSet ever saw it, so /api/news/search silently returned the unfiltered archive.
check('parseFeedFilterQuery retains an alias-only query (?companyAliases=Amazon, no ticker/name)', () => {
  const q = parseFeedFilterQuery({ companyAliases: 'Amazon' })
  assert.deepEqual(q.company, { aliases: ['Amazon'] }, 'aliases alone must survive parsing, not collapse to undefined')
  assert.equal(hasAnyFilter(q), true, 'the parsed alias-only query must activate archive-search mode')
  const q2 = parseFeedFilterQuery({ companyAliases: 'Amazon|Amazon.com' })
  assert.deepEqual(q2.company?.aliases, ['Amazon', 'Amazon.com'], "'|'-joined aliases split correctly")
})

check('parseFeedFilterQuery maps companyListingCountry, upcased', () => {
  const q = parseFeedFilterQuery({ companyTicker: 'CAT', companyName: 'Caterpillar', companyListingCountry: 'us' })
  assert.equal(q.company?.listingCountry, 'US')
  assert.equal(parseFeedFilterQuery({ companyTicker: 'CAT' }).company?.listingCountry, undefined, 'omitted when not sent')
})

// ---- 8. archive search finds a company match buried days deep (the "without fail" reach) ----
check('searchFeed finds an AMZN-tagged item buried behind a full page of fillers', () => {
  const repo = tmp()
  for (let d = 0; d <= 6; d++) {
    writeDay(repo, dayAgo(d), Array.from({ length: 15 }, () => item({ ts: `${dayAgo(d)}T10:00:00Z`, headline: 'Retailer posts quarterly sales' })))
  }
  const target = item({ ts: `${dayAgo(7)}T09:00:00Z`, headline: 'The retailer beats on cloud', companies: [{ name: 'Amazon', ticker: 'AMZN', listing_country: 'US' }] })
  writeDay(repo, dayAgo(7), [target])

  const snap = searchFeed(repo, { now, predicate: (it) => matchesFeedFilters(it, { company: { ticker: 'AMZN', name: 'Amazon' } }), limit: 60 })
  assert.equal(snap.items.length, 1, 'the AMZN-tagged item is found deep in history via the ticker')
  assert.equal(snap.items[0].event_id, target.event_id)
  assert.equal(snap.exhausted, true)
})

// ---- 9. the company FACET that feeds the autofill: dedup by ticker + junk exclusion ----
check('computeFacets returns a deduped company facet with counts, folding name-only into the tickered sibling', () => {
  const repo = tmp()
  writeDay(repo, dayAgo(0), [
    item({ ts: `${dayAgo(0)}T10:03:00Z`, headline: 'Amazon lifts guidance', companies: [{ name: 'Amazon', ticker: 'AMZN', listing_country: 'US' }] }),
    item({ ts: `${dayAgo(0)}T10:02:00Z`, headline: 'Amazon.com opens a hub', companies: [{ name: 'Amazon.com', ticker: 'AMZN', listing_country: 'US' }] }),
    item({ ts: `${dayAgo(0)}T10:01:00Z`, headline: 'Amazon adds staff', companies: [{ name: 'Amazon', ticker: null, listing_country: 'US' }] }), // name-only → folds into AMZN (learned name→ticker)
    item({ ts: `${dayAgo(0)}T10:00:00Z`, headline: 'India tightens import rules', companies: [{ name: 'India', ticker: null, listing_country: 'IN' }] }), // a country guess — must be scrubbed
  ])
  const facets = computeFacets(repo, {}, { now })
  const amzn = facets.companies.find((c) => c.ticker === 'AMZN')
  assert.ok(amzn, 'AMZN appears exactly once in the company facet')
  assert.equal(amzn!.count, 3, 'all three Amazon rows (incl. the name-only guess) fold into one AMZN entry')
  assert.equal(facets.companies.filter((c) => c.ticker === 'AMZN').length, 1, 'no duplicate AMZN rows')
  assert.ok(!facets.companies.some((c) => /india/i.test(c.name)), 'a country guess ("India") is never offered as a company')
})

// ---- 10. explainFeedFilterMatch names the path that matched (ticker vs name) ----
check('explainFeedFilterMatch reports the company clause path', () => {
  const byTicker = item({ ts: `${dayAgo(0)}T10:00:00Z`, headline: 'The retailer beats', companies: [{ name: 'Amazon', ticker: 'AMZN', listing_country: 'US' }] })
  const exT = explainFeedFilterMatch(byTicker, { company: { ticker: 'AMZN', name: 'Amazon' } })
  assert.equal(exT.matched, true)
  const cT = exT.checks.find((c) => c.clause === 'company')
  assert.ok(cT?.passed)
  assert.match(cT!.detail, /exact ticker AMZN/i)

  const miss = item({ ts: `${dayAgo(0)}T10:00:00Z`, headline: 'Retailer posts sales', companies: [] })
  const exM = explainFeedFilterMatch(miss, { company: { ticker: 'AMZN', name: 'Amazon' } })
  const cM = exM.checks.find((c) => c.clause === 'company')
  assert.equal(cM?.passed, false)
  assert.match(cM!.detail, /no company matched/i)
})

// ---- 11. ticker match is EXACT, never a substring (a ===→includes regression would mix companies) ----
check('a ticker filter matches ONLY the exact ticker, never a super/substring of it', () => {
  const brkA = item({ ts: `${dayAgo(0)}T10:00:00Z`, headline: 'Berkshire class A moves', companies: [{ name: 'Berkshire Hathaway', ticker: 'BRK.A', listing_country: 'US' }] })
  assert.equal(matchesFeedFilters(brkA, { company: { ticker: 'BRK' } }), false, '"BRK" must not match a "BRK.A" tag')
  assert.equal(matchesFeedFilters(brkA, { company: { ticker: 'BRK.A' } }), true)
  const amzn = item({ ts: `${dayAgo(0)}T10:00:00Z`, headline: 'Retailer update', companies: [{ name: 'Amazon', ticker: 'AMZN', listing_country: 'US' }] })
  assert.equal(matchesFeedFilters(amzn, { company: { ticker: 'AMZNX' } }), false, 'a longer ticker must not match')
})

// ---- 12. name match is WHOLE-WORD (a common-word name must not drag in unrelated items) ----
check('the name clause matches a whole word, not a substring buried in a longer word', () => {
  const hit = item({ ts: `${dayAgo(0)}T10:00:00Z`, headline: 'Meta beats on ad revenue', companies: [] })
  const miss = item({ ts: `${dayAgo(0)}T10:00:00Z`, headline: 'New metadata rules for websites', companies: [] })
  assert.equal(matchesFeedFilters(hit, { company: { ticker: 'META', name: 'Meta' } }), true, '"Meta" as a word matches')
  assert.equal(matchesFeedFilters(miss, { company: { ticker: 'META', name: 'Meta' } }), false, '"metadata" must NOT match the name "Meta"')
  // possessive / punctuation-adjacent still counts as a boundary
  const poss = item({ ts: `${dayAgo(0)}T10:00:00Z`, headline: "Amazon's cloud unit grows", companies: [] })
  assert.equal(matchesFeedFilters(poss, { company: { ticker: 'AMZN', name: 'Amazon' } }), true)
})

// ---- 13. the name clause scans the ENGLISH TRANSLATION too (lockstep with the web twin) ----
check('matchesFeedFilters matches the name against a foreign headline’s English translation', () => {
  const foreign = item({ ts: `${dayAgo(0)}T10:00:00Z`, headline: 'アマゾン、通期見通しを上方修正', headline_en: 'Amazon raises full-year outlook', companies: [] })
  assert.equal(matchesFeedFilters(foreign, { company: { ticker: 'AMZN', name: 'Amazon' } }), true)
})

// ---- 14. computeFacets under an ACTIVE company filter: total + other-facet counts restrict to it ----
check('computeFacets with a company filter restricts total + other facets to that company', () => {
  const repo = tmp()
  writeDay(repo, dayAgo(0), [
    item({ ts: `${dayAgo(0)}T10:02:00Z`, headline: 'Amazon lifts guidance', country: 'US', companies: [{ name: 'Amazon', ticker: 'AMZN', listing_country: 'US' }] }),
    item({ ts: `${dayAgo(0)}T10:01:00Z`, headline: 'Amazon opens a hub', country: 'US', companies: [{ name: 'Amazon', ticker: 'AMZN', listing_country: 'US' }] }),
    item({ ts: `${dayAgo(0)}T10:00:00Z`, headline: 'Microsoft ships an update', country: 'US', companies: [{ name: 'Microsoft', ticker: 'MSFT', listing_country: 'US' }] }),
  ])
  const facets = computeFacets(repo, { company: { ticker: 'AMZN', name: 'Amazon' } }, { now })
  assert.equal(facets.total, 2, 'total counts only the AMZN rows')
  // the country facet (a dimension OTHER than company) is restricted to the AMZN rows: US = 2, not 3
  const us = facets.countries.find((c) => c.key === 'US')
  assert.equal(us?.count, 2, 'other-facet counts respect the active company filter')
})

// ---- 15. facet dedup: the display name is the most-used spelling, and an ambiguous name is NOT folded ----
check('the company facet picks the most-used display name and leaves an ambiguous name un-folded', () => {
  const repo = tmp()
  writeDay(repo, dayAgo(0), [
    item({ ts: `${dayAgo(0)}T10:06:00Z`, headline: 'Amazon a', companies: [{ name: 'Amazon', ticker: 'AMZN', listing_country: 'US' }] }),
    item({ ts: `${dayAgo(0)}T10:05:00Z`, headline: 'Amazon b', companies: [{ name: 'Amazon', ticker: 'AMZN', listing_country: 'US' }] }),
    item({ ts: `${dayAgo(0)}T10:04:30Z`, headline: 'Amazon d', companies: [{ name: 'Amazon', ticker: 'AMZN', listing_country: 'US' }] }),
    item({ ts: `${dayAgo(0)}T10:04:00Z`, headline: 'Amazon c', companies: [{ name: 'Amazon.com', ticker: 'AMZN', listing_country: 'US' }] }),
    // a SECOND "Amazon.com" mention — an alias needs 2+ corroborating archive-wide mentions to qualify
    // (below), so a single occurrence alone would no longer be enough
    item({ ts: `${dayAgo(0)}T10:03:30Z`, headline: 'Amazon.com e', companies: [{ name: 'Amazon.com', ticker: 'AMZN', listing_country: 'US' }] }),
    // "Acme" is ambiguous — tagged under two different tickers, so a name-only "Acme" must NOT fold into either
    item({ ts: `${dayAgo(0)}T10:02:00Z`, headline: 'Acme x', companies: [{ name: 'Acme', ticker: 'ACM1', listing_country: 'US' }] }),
    item({ ts: `${dayAgo(0)}T10:01:00Z`, headline: 'Acme y', companies: [{ name: 'Acme', ticker: 'ACM2', listing_country: 'US' }] }),
    item({ ts: `${dayAgo(0)}T10:00:00Z`, headline: 'Acme z', companies: [{ name: 'Acme', ticker: null, listing_country: 'US' }] }),
  ])
  const facets = computeFacets(repo, {}, { now })
  const amzn = facets.companies.find((c) => c.ticker === 'AMZN')
  assert.equal(amzn?.name, 'Amazon', 'the most-used spelling (3× "Amazon" vs 2× "Amazon.com") wins')
  assert.equal(amzn?.count, 5)
  assert.deepEqual(amzn?.aliases, ['Amazon.com'], 'the less-used but corroborated (2×) spelling is carried as an alias, not dropped')
  // the ambiguous name-only "Acme" row is NOT credited to ACM1 or ACM2 (each keeps its own tagged count of 1)
  assert.equal(facets.companies.find((c) => c.ticker === 'ACM1')?.count, 1)
  assert.equal(facets.companies.find((c) => c.ticker === 'ACM2')?.count, 1)
  const acmeNameOnly = facets.companies.find((c) => c.ticker === null && /acme/i.test(c.name))
  assert.equal(acmeNameOnly?.count, 1, 'the ambiguous name-only mention stands on its own, un-folded')
})

// ---- 16. THE REPORTED GAP: a picked LONG-form name misses an UNTAGGED item using the SHORT form — the
// alias set (built from every spelling the archive has tagged for that ticker) closes it (Codex review, #317).
check('a picked long-form name alone misses a short-form untagged headline; its aliases recover it', () => {
  const it = item({ ts: `${dayAgo(0)}T10:00:00Z`, headline: 'Amazon raises full-year outlook', companies: [] }) // untagged, short form only
  // without the alias, the picked "Amazon.com Inc." is not a substring of the headline at all
  assert.equal(matchesFeedFilters(it, { company: { ticker: 'AMZN', name: 'Amazon.com Inc.' } }), false, 'the long form alone does not reach a short-form untagged headline')
  // carrying the archive-observed short form as an alias recovers the match
  assert.equal(matchesFeedFilters(it, { company: { ticker: 'AMZN', name: 'Amazon.com Inc.', aliases: ['Amazon'] } }), true, 'an alias recovers the untagged short-form headline')
})

// ---- 17. end-to-end: the company FACET actually carries the alias a caller needs for #16 ----
check('computeFacets carries the archive-observed short form as an alias on the AMZN facet', () => {
  const repo = tmp()
  writeDay(repo, dayAgo(0), [
    item({ ts: `${dayAgo(0)}T10:03:00Z`, headline: 'Amazon.com Inc. lifts guidance', companies: [{ name: 'Amazon.com Inc.', ticker: 'AMZN', listing_country: 'US' }] }),
    item({ ts: `${dayAgo(0)}T10:02:00Z`, headline: 'Amazon.com Inc. opens a hub', companies: [{ name: 'Amazon.com Inc.', ticker: 'AMZN', listing_country: 'US' }] }),
    // the rarer, shorter tagged spelling — TWICE, so it clears the 2-mention alias corroboration floor
    item({ ts: `${dayAgo(0)}T10:01:00Z`, headline: 'Amazon adds staff', companies: [{ name: 'Amazon', ticker: 'AMZN', listing_country: 'US' }] }),
    item({ ts: `${dayAgo(0)}T10:00:30Z`, headline: 'Amazon opens a second hub', companies: [{ name: 'Amazon', ticker: 'AMZN', listing_country: 'US' }] }),
  ])
  const facets = computeFacets(repo, {}, { now })
  const amzn = facets.companies.find((c) => c.ticker === 'AMZN')
  assert.equal(amzn?.name, 'Amazon.com Inc.', 'the more-common long form is still the primary display name')
  assert.ok(amzn?.aliases.includes('Amazon'), 'the rarer but corroborated short form is carried as an alias, ready to feed a pick')
})

// ---- 18. CROSS-EXCHANGE TICKER COLLISION: two unrelated issuers sharing ticker letters on different
// exchanges must NOT contaminate each other's alias list (Codex review, PR #319 — CAT: Caterpillar/NYSE vs
// Catapult Group International/ASX; ALK: Alaska Air vs Alkane Resources are the archive's real examples).
check('two different issuers sharing a ticker on different exchanges get SEPARATE facets, never alias or ticker-match each other', () => {
  const repo = tmp()
  writeDay(repo, dayAgo(0), [
    item({ ts: `${dayAgo(0)}T10:03:00Z`, headline: 'Caterpillar lifts guidance', companies: [{ name: 'Caterpillar', ticker: 'CAT', listing_country: 'US' }] }),
    item({ ts: `${dayAgo(0)}T10:02:00Z`, headline: 'Caterpillar ships more excavators', companies: [{ name: 'Caterpillar', ticker: 'CAT', listing_country: 'US' }] }),
    item({ ts: `${dayAgo(0)}T10:01:00Z`, headline: 'Catapult Group International signs a deal', companies: [{ name: 'Catapult Group International', ticker: 'CAT', listing_country: 'AU' }] }),
  ])
  const facets = computeFacets(repo, {}, { now })
  const catRows = facets.companies.filter((c) => c.ticker === 'CAT')
  assert.equal(catRows.length, 2, 'two proven-distinct issuers sharing "CAT" become two facet rows, not one merged/ambiguous one')
  const caterpillar = catRows.find((c) => c.name === 'Caterpillar')
  const catapult = catRows.find((c) => c.name === 'Catapult Group International')
  assert.equal(caterpillar?.count, 2)
  assert.equal(caterpillar?.listingCountry, 'US')
  assert.equal(catapult?.count, 1)
  assert.equal(catapult?.listingCountry, 'AU')
  assert.ok(!caterpillar?.aliases.includes('Catapult Group International'), 'the unrelated AU issuer must NOT be offered as an alias of Caterpillar')

  // THE ACTUAL HARM: an item TAGGED with ticker CAT for the AU issuer must not match a pick for the US
  // issuer via the bare-ticker path, even though the ticker string itself is identical
  const catapultTagged = item({ ts: `${dayAgo(0)}T10:00:00Z`, headline: 'Catapult wins a new client contract', companies: [{ name: 'Catapult Group International', ticker: 'CAT', listing_country: 'AU' }] })
  assert.equal(matchesFeedFilters(catapultTagged, { company: { ticker: 'CAT', name: 'Caterpillar', aliases: caterpillar?.aliases, listingCountry: caterpillar?.listingCountry } }), false, 'a CAT-tagged AU item must not match a US Caterpillar pick via the bare ticker')
  // ...but it DOES match a pick for the correct (AU) issuer
  assert.equal(matchesFeedFilters(catapultTagged, { company: { ticker: 'CAT', name: 'Catapult Group International', listingCountry: catapult?.listingCountry } }), true, 'the AU issuer pick still matches its own tagged item')
  // and an UNTAGGED item (no listing evidence at all) still matches via the ticker — the fix costs no
  // recall on missing data, it only excludes a PROVEN conflict
  const untaggedCat = item({ ts: `${dayAgo(0)}T09:00:00Z`, headline: 'A generic corporate update', companies: [{ name: 'Caterpillar', ticker: 'CAT', listing_country: null }] })
  assert.equal(matchesFeedFilters(untaggedCat, { company: { ticker: 'CAT', name: 'Caterpillar', listingCountry: caterpillar?.listingCountry } }), true, 'an item with unknown listing_country still matches — unknown is never a conflict')
})

check('aliases are learned from the WHOLE archive, not just rows surviving an unrelated active filter', () => {
  const repo = tmp()
  writeDay(repo, dayAgo(0), [
    item({ ts: `${dayAgo(0)}T10:02:00Z`, country: 'US', headline: 'Amazon.com Inc. lifts guidance', companies: [{ name: 'Amazon.com Inc.', ticker: 'AMZN', listing_country: 'US' }] }),
    item({ ts: `${dayAgo(0)}T10:01:00Z`, country: 'US', headline: 'Amazon.com Inc. opens a hub', companies: [{ name: 'Amazon.com Inc.', ticker: 'AMZN', listing_country: 'US' }] }),
    // the ONLY two places the short form "Amazon" is tagged (2×, clearing the alias corroboration floor),
    // both sitting under a DIFFERENT country filter dimension than the two long-form rows above
    item({ ts: `${dayAgo(0)}T10:00:30Z`, country: 'IN', headline: 'Amazon India adds staff', companies: [{ name: 'Amazon', ticker: 'AMZN', listing_country: 'US' }] }),
    item({ ts: `${dayAgo(0)}T10:00:00Z`, country: 'IN', headline: 'Amazon India opens a hub', companies: [{ name: 'Amazon', ticker: 'AMZN', listing_country: 'US' }] }),
  ])
  // narrow to country=US BEFORE picking a company — the "Amazon" row (country=IN) is excluded from the
  // filtered companyRows subset, but must still contribute its spelling to the alias set (Codex review, #319)
  const facets = computeFacets(repo, { country: 'US' }, { now })
  const amzn = facets.companies.find((c) => c.ticker === 'AMZN')
  assert.equal(amzn?.count, 2, 'the exposed COUNT still respects the active country filter (2, not 3)')
  assert.ok(amzn?.aliases.includes('Amazon'), 'the alias itself is NOT scoped to the active filter — it is learned from the whole archive')
})

check('a ticker recorded as an alternate NAME is not offered as a loose free-text alias', () => {
  const repo = tmp()
  writeDay(repo, dayAgo(0), [
    item({ ts: `${dayAgo(0)}T10:02:00Z`, headline: 'Catapult Group International signs a client', companies: [{ name: 'Catapult Group International', ticker: 'CAT', listing_country: 'AU' }] }),
    // the archive recorded the bare ticker itself as an alternate "name" for the same issuer TWICE — enough
    // to clear the alias corroboration floor, isolating that it's specifically the ticker-symbol exclusion
    // (not the corroboration count) that keeps it out of the alias list
    item({ ts: `${dayAgo(0)}T10:01:00Z`, headline: 'CAT wins a contract renewal', companies: [{ name: 'CAT', ticker: 'CAT', listing_country: 'AU' }] }),
    item({ ts: `${dayAgo(0)}T10:00:30Z`, headline: 'CAT lands a new deal', companies: [{ name: 'CAT', ticker: 'CAT', listing_country: 'AU' }] }),
  ])
  const facets = computeFacets(repo, {}, { now })
  const catapult = facets.companies.find((c) => c.ticker === 'CAT' && c.name === 'Catapult Group International')
  assert.ok(!catapult?.aliases.includes('CAT'), 'the ticker symbol itself must not be offered as a loose name alias')
  // the actual harm this prevents: an unrelated headline using "cat" as an ordinary word must not false-match
  const unrelated = item({ ts: `${dayAgo(0)}T10:00:00Z`, headline: 'Family loses cat during house fire', companies: [] })
  assert.equal(matchesFeedFilters(unrelated, { company: { ticker: 'CAT', name: 'Catapult Group International', aliases: catapult?.aliases } }), false, 'a common word matching the ticker symbol must not false-match via the alias path')
})

check('an alternate spelling with NO listing_country evidence is still a valid alias (unknown never conflicts)', () => {
  const repo = tmp()
  writeDay(repo, dayAgo(0), [
    item({ ts: `${dayAgo(0)}T10:02:00Z`, headline: 'Amazon.com Inc. lifts guidance', companies: [{ name: 'Amazon.com Inc.', ticker: 'AMZN', listing_country: 'US' }] }),
    item({ ts: `${dayAgo(0)}T10:01:00Z`, headline: 'Amazon.com Inc. opens a hub', companies: [{ name: 'Amazon.com Inc.', ticker: 'AMZN', listing_country: 'US' }] }),
    // the same ticker, a shorter spelling (2×, clearing the corroboration floor), but the extractor didn't
    // resolve a listing_country either time
    item({ ts: `${dayAgo(0)}T10:00:30Z`, headline: 'Amazon adds staff', companies: [{ name: 'Amazon', ticker: 'AMZN', listing_country: null }] }),
    item({ ts: `${dayAgo(0)}T10:00:00Z`, headline: 'Amazon opens a hub', companies: [{ name: 'Amazon', ticker: 'AMZN', listing_country: null }] }),
  ])
  const facets = computeFacets(repo, {}, { now })
  const amzn = facets.companies.find((c) => c.ticker === 'AMZN')
  assert.ok(amzn?.aliases.includes('Amazon'), 'an unknown (null) listing_country never proves a conflict, so the alias still qualifies')
})

// ---- 19. ALIAS-ONLY QUERY: a caller sending companyAliases with no ticker/name must still activate the
// company clause, not silently no-op to "everything matches" (Codex review, PR #319) ----
check('a company filter with ONLY aliases (no ticker, no name) still activates and filters correctly', () => {
  const hit = item({ ts: `${dayAgo(0)}T10:00:00Z`, headline: 'Amazon raises full-year outlook', companies: [] })
  const miss = item({ ts: `${dayAgo(0)}T10:00:00Z`, headline: 'Microsoft ships an update', companies: [] })
  assert.equal(hasAnyFilter({ company: { aliases: ['Amazon'] } }), true, 'an alias-only company object must trip archive mode')
  assert.equal(matchesFeedFilters(hit, { company: { aliases: ['Amazon'] } }), true, 'the alias alone matches the headline it names')
  assert.equal(matchesFeedFilters(miss, { company: { aliases: ['Amazon'] } }), false, 'an alias-only filter must still EXCLUDE non-matching items, not pass everything')
  const exp = explainFeedFilterMatch(hit, { company: { aliases: ['Amazon'] } })
  assert.equal(exp.checks.find((c) => c.clause === 'company')?.passed, true, 'the explain trace records the alias-only clause too')
})

// ---- the primary NAME could itself be the bare ticker SYMBOL. The archive sometimes tags the ticker AS the
// company name MORE often than any real spelling, so buildCompanyFacet used to pick name === the ticker
// ("CAT"). The alias list already drops a ticker-equal spelling, but the primary name escaped that guard, so
// the pick free-text matched an ordinary short word ("cat" for CAT). buildCompanyFacet now prefers a real
// (non-symbol) spelling as the primary name, case-SENSITIVELY (so it drops the symbol form "CAT" yet keeps a
// real mixed-case name like "Meta" that merely shares the ticker letters) (Codex re-review, PR #319). ----
check('computeFacets: a MAJORITY bare-ticker name is NOT chosen as the primary name, so the pick does not false-match ordinary words', () => {
  const repo = tmp()
  writeDay(repo, dayAgo(0), [
    item({ ts: `${dayAgo(0)}T10:03:00Z`, headline: 'CAT wins a contract', companies: [{ name: 'CAT', ticker: 'CAT', listing_country: 'AU' }] }),
    item({ ts: `${dayAgo(0)}T10:02:00Z`, headline: 'CAT renews a deal', companies: [{ name: 'CAT', ticker: 'CAT', listing_country: 'AU' }] }),
    item({ ts: `${dayAgo(0)}T10:01:00Z`, headline: 'CAT lands a client', companies: [{ name: 'CAT', ticker: 'CAT', listing_country: 'AU' }] }),
    item({ ts: `${dayAgo(0)}T10:00:00Z`, headline: 'Catapult Group International signs a deal', companies: [{ name: 'Catapult Group International', ticker: 'CAT', listing_country: 'AU' }] }),
  ])
  const facets = computeFacets(repo, {}, { now })
  const cat = facets.companies.find((c) => c.ticker === 'CAT')
  assert.ok(cat, 'the CAT facet exists')
  assert.equal(cat!.name, 'Catapult Group International', 'the bare ticker "CAT" (the majority tag) must NOT be the display/free-text name — the real spelling is chosen instead')
  assert.ok(!cat!.aliases.includes('CAT'), 'the bare ticker symbol is not offered as a free-text alias either')
  // the actual harm: a pick built from this facet must not free-text match "cat" the ordinary word
  const petStory = item({ ts: `${dayAgo(0)}T09:00:00Z`, headline: 'Family loses cat during a house fire', companies: [] })
  assert.equal(matchesFeedFilters(petStory, { company: { ticker: cat!.ticker, name: cat!.name, aliases: cat!.aliases, listingCountry: cat!.listingCountry } }), false, 'a pick from a majority-bare-ticker archive must not false-match the ordinary word "cat"')
  // and it still matches its own tagged items (exact ticker) and an untagged real-name mention
  const tagged = item({ ts: `${dayAgo(0)}T08:00:00Z`, headline: 'A generic update', companies: [{ name: 'CAT', ticker: 'CAT', listing_country: 'AU' }] })
  assert.equal(matchesFeedFilters(tagged, { company: { ticker: cat!.ticker, name: cat!.name, aliases: cat!.aliases, listingCountry: cat!.listingCountry } }), true, 'exact-ticker still matches a CAT-tagged item — no recall lost')
})

check('computeFacets: an all-caps name that is the ONLY spelling (its ticker) is still kept, so a real short-symbol company keeps free-text recall (no over-correction)', () => {
  const repo = tmp()
  writeDay(repo, dayAgo(0), [
    item({ ts: `${dayAgo(0)}T10:03:00Z`, headline: 'IBM lifts its outlook', companies: [{ name: 'IBM', ticker: 'IBM', listing_country: 'US' }] }),
    item({ ts: `${dayAgo(0)}T10:02:00Z`, headline: 'IBM ships a new mainframe', companies: [{ name: 'IBM', ticker: 'IBM', listing_country: 'US' }] }),
  ])
  const facets = computeFacets(repo, {}, { now })
  const ibm = facets.companies.find((c) => c.ticker === 'IBM')
  assert.ok(ibm, 'the IBM facet exists')
  assert.equal(ibm!.name, 'IBM', 'when the only spelling IS the ticker, it is kept as the display name (fallback) — the exact-ticker clause still carries matching')
  // an untagged headline that merely NAMES IBM still matches — dropping "ibm" would lose real recall and it is
  // not a common English word, so keeping it costs nothing (the fix targets symbol names, not all all-caps names)
  const untagged = item({ ts: `${dayAgo(0)}T09:00:00Z`, headline: 'IBM raises guidance', companies: [] })
  assert.equal(matchesFeedFilters(untagged, { company: { ticker: ibm!.ticker, name: ibm!.name, aliases: ibm!.aliases, listingCountry: ibm!.listingCountry } }), true, 'an untagged real-name mention still matches — recall preserved for a legitimate short symbol name')
})

// ---- the ticker-symbol alias exclusion must be CASE-SENSITIVE: "Meta" (mixed case) is a real, legitimate
// company short name that happens to share letters with ticker "META" — it must NOT be excluded the way the
// literal, all-caps "CAT"-as-ticker case is (Codex review, PR #319: the alias filter still upcased before
// comparing, silently dropping a real name whenever it happened to match a ticker case-insensitively) ----
check('a mixed-case name that merely shares LETTERS with the ticker is kept as an alias (case-sensitive exclusion)', () => {
  const repo = tmp()
  writeDay(repo, dayAgo(0), [
    item({ ts: `${dayAgo(0)}T10:03:00Z`, headline: 'Meta Platforms lifts guidance', companies: [{ name: 'Meta Platforms', ticker: 'META', listing_country: 'US' }] }),
    item({ ts: `${dayAgo(0)}T10:02:00Z`, headline: 'Meta Platforms ships an update', companies: [{ name: 'Meta Platforms', ticker: 'META', listing_country: 'US' }] }),
    item({ ts: `${dayAgo(0)}T10:01:00Z`, headline: 'Meta unveils a new headset', companies: [{ name: 'Meta', ticker: 'META', listing_country: 'US' }] }),
    item({ ts: `${dayAgo(0)}T10:00:00Z`, headline: 'Meta hires a new exec', companies: [{ name: 'Meta', ticker: 'META', listing_country: 'US' }] }),
  ])
  const facets = computeFacets(repo, {}, { now })
  const meta = facets.companies.find((c) => c.ticker === 'META')
  assert.equal(meta?.name, 'Meta Platforms', 'the more-common long form is still the primary display name')
  assert.ok(meta?.aliases.includes('Meta'), 'a real mixed-case short name is NOT excluded just because it upcases to the ticker string')
  // the actual recall this protects: an untagged headline saying only "Meta" must still match
  const untagged = item({ ts: `${dayAgo(0)}T09:00:00Z`, headline: 'Meta raises its outlook', companies: [] })
  assert.equal(matchesFeedFilters(untagged, { company: { ticker: 'META', name: 'Meta Platforms', aliases: meta?.aliases } }), true, 'the untagged "Meta" headline must still be found via the alias')
})

// ---- ALIAS CORROBORATION: a spelling seen only ONCE archive-wide is too weak evidence to trust as a
// free-text alias — it is far more likely a one-off extraction slip than a genuine alternate name. Verified
// against LIVE archive data: ticker "506295" is tagged once each to two UNRELATED Indian companies (Indo
// Count Industries, Shekhawati Industries, both country IN — so the listing-country split from the earlier
// fix does NOT separate them), and "HLT" is tagged once each to Halliburton and Hilton (both country US).
// Corroboration (2+ mentions) does not fully solve identity resolution — it cannot, since a real rename-style
// alias like Alphabet→Google ALSO has zero lexical overlap with its primary name, so no lexical rule can
// tell the two patterns apart — but it does stop a SINGLE stray mis-tag from ever reaching the alias list,
// which is exactly the reported failure mode (Codex review, PR #319) ----
check('a spelling seen only ONCE archive-wide does not qualify as a free-text alias (corroboration floor)', () => {
  const repo = tmp()
  writeDay(repo, dayAgo(0), [
    item({ ts: `${dayAgo(0)}T10:03:00Z`, country: 'IN', headline: 'Indo Count Industries wins an export order', companies: [{ name: 'Indo Count Industries Limited', ticker: '506295', listing_country: 'IN' }] }),
    // an UNRELATED company, tagged ONCE with the SAME (ticker, country) pair — a real extraction ambiguity
    item({ ts: `${dayAgo(0)}T10:02:00Z`, country: 'IN', headline: 'Shekhawati Industries announces a new plant', companies: [{ name: 'Shekhawati Industries Limited', ticker: '506295', listing_country: 'IN' }] }),
  ])
  const facets = computeFacets(repo, {}, { now })
  const rows = facets.companies.filter((c) => c.ticker === '506295')
  assert.equal(rows.length, 1, 'same ticker + same country still merge into one facet row (listing-country alone cannot separate them)')
  assert.ok(!rows[0].aliases.includes('Shekhawati Industries Limited'), 'a single, uncorroborated mention of an unrelated name must not become an alias of the other')
  assert.ok(!rows[0].aliases.includes('Indo Count Industries Limited'), 'symmetric: whichever name lost the primary-name tie-break also stays out of the alias list at count 1')
  // the actual harm this prevents: an untagged headline naming the OTHER company must not match this pick
  const shekhawatiHeadline = item({ ts: `${dayAgo(0)}T10:00:00Z`, headline: 'Shekhawati Industries Limited reports results', companies: [] })
  assert.equal(matchesFeedFilters(shekhawatiHeadline, { company: { ticker: rows[0].ticker, name: rows[0].name, aliases: rows[0].aliases, listingCountry: rows[0].listingCountry } }), false, 'an unrelated company headline must not match via a one-off alias')
})

// ---- THE NHYDY CASE: a pick made by a foreign listing still catches the archive's tags ----
check('a pick of the US ADR (NHYDY + tickerAliases) matches items tagged with the Oslo symbol NHY', () => {
  const tagged = item({ ts: `${dayAgo(0)}T10:00:00Z`, headline: 'Hydro reports quarterly results', companies: [{ name: 'Norsk Hydro', ticker: 'NHY', listing_country: 'NO' }] })
  const pick = { ticker: 'NHYDY', name: 'Norsk Hydro ASA', tickerAliases: ['NHY.OL', 'NHYKF'] }
  assert.equal(matchesFeedFilters(tagged, { company: pick }), true, 'the NHY.OL alias base-matches the bare NHY tag')
  // and the untagged headline path via the CORE name (the pick name carries the ASA legal suffix)
  const untagged = item({ ts: `${dayAgo(0)}T10:00:00Z`, headline: 'Norsk Hydro to curtail aluminium output', companies: [] })
  assert.equal(matchesFeedFilters(untagged, { company: pick }), true, 'core name "norsk hydro" hits the headline')
  const other = item({ ts: `${dayAgo(0)}T10:00:00Z`, headline: 'Alcoa lifts guidance', companies: [{ name: 'Alcoa', ticker: 'AA', listing_country: 'US' }] })
  assert.equal(matchesFeedFilters(other, { company: pick }), false)
})

// ---- a tickerAlias hit still respects the listing-country conflict guard ----
check('a tickerAlias match is still excluded by a proven-different listing country', () => {
  const catapult = item({ ts: `${dayAgo(0)}T10:00:00Z`, headline: 'Catapult wins a contract', companies: [{ name: 'Catapult Group International', ticker: 'CAT', listing_country: 'AU' }] })
  assert.equal(matchesFeedFilters(catapult, { company: { ticker: 'CAT.X', name: 'Caterpillar', tickerAliases: ['CAT'], listingCountry: 'US' } }), false)
})

// ---- junk tag tickers can never be matched INTO (a NULL/CIK pick is scrubbed out of the pick set) ----
check('a pick polluted with junk spellings scrubs them and still matches only real symbols', () => {
  const manGroup = item({ ts: `${dayAgo(0)}T10:00:00Z`, headline: 'Man Group posts inflows', companies: [{ name: 'Man Group PLC', ticker: null, listing_country: 'GB' }] })
  // "NULL" in the tickerAliases is scrubbed; the match comes from the name clause, not a fake NULL≡NULL hit
  assert.equal(matchesFeedFilters(manGroup, { company: { ticker: 'EMG.L', name: 'Man Group PLC', tickerAliases: ['NULL'] } }), true)
  const nullTagged = item({ ts: `${dayAgo(0)}T10:00:00Z`, headline: 'Quarterly update from a fund manager', companies: [{ name: 'Some Fund', ticker: 'NULL', listing_country: 'GB' }] })
  assert.equal(matchesFeedFilters(nullTagged, { company: { ticker: 'NULL', name: '' } }), false, 'a junk-only pick has an empty ticker set and an empty name → no match, never a NULL≡NULL bridge')
})

// ---- parseFeedFilterQuery reads companyTickerAliases (csv, upcased) ----
check('parseFeedFilterQuery maps companyTickerAliases and upcases each', () => {
  const q = parseFeedFilterQuery({ companyTicker: 'nhydy', companyName: 'Norsk Hydro ASA', companyTickerAliases: 'nhy.ol, nhykf' })
  assert.deepEqual(q.company, { ticker: 'NHYDY', name: 'Norsk Hydro ASA', tickerAliases: ['NHY.OL', 'NHYKF'] })
  assert.equal(hasAnyFilter({ company: { tickerAliases: ['NHY.OL'] } }), true, 'ticker aliases alone still activate the clause')
})

// ---- the facet scrubs junk tickers and folds spelling variants into ONE entry (the dirty-dropdown bug) ----
check('computeFacets never surfaces NULL/CIK tickers and folds ALL-CAPS/name-only variants into the tickered entry', () => {
  const repo = tmp()
  writeDay(repo, dayAgo(0), [
    item({ ts: `${dayAgo(0)}T10:05:00Z`, headline: 'Citi a', companies: [{ name: 'Citigroup', ticker: 'C', listing_country: 'US' }] }),
    item({ ts: `${dayAgo(0)}T10:04:00Z`, headline: 'Citi b', companies: [{ name: 'CITIGROUP INC', ticker: null, listing_country: 'US' }] }), // filing-style ALL-CAPS, name-only
    item({ ts: `${dayAgo(0)}T10:03:00Z`, headline: 'Citi c', companies: [{ name: 'Citigroup Inc.', ticker: 'C', listing_country: 'US' }] }),
    item({ ts: `${dayAgo(0)}T10:02:00Z`, headline: 'Man d', companies: [{ name: 'Man Group PLC', ticker: 'NULL', listing_country: 'GB' }] }), // junk ticker
    item({ ts: `${dayAgo(0)}T10:01:00Z`, headline: 'CGMH e', companies: [{ name: 'Citigroup Global Markets Holdings Inc', ticker: '0000200245', listing_country: 'US' }] }), // CIK as ticker
  ])
  const facets = computeFacets(repo, {}, { now })
  assert.ok(!facets.companies.some((c) => c.ticker === 'NULL' || c.ticker === '0000200245'), 'junk tickers never surface')
  const citi = facets.companies.find((c) => c.ticker === 'C')
  assert.equal(citi?.count, 3, 'ALL-CAPS + name-only + "Inc." variants fold into the one C entry (core-name fold)')
  assert.notEqual(citi?.name, 'CITIGROUP INC', 'an ALL-CAPS filing spelling never wins display while a mixed-case one exists')
  assert.ok(citi && citi.name !== citi.name.toUpperCase(), 'the displayed spelling is mixed-case')
  const man = facets.companies.find((c) => /man group/i.test(c.name))
  assert.equal(man?.ticker, null, 'the junk NULL ticker degrades to an honest name-only entry')
  const cgmh = facets.companies.find((c) => /global markets holdings/i.test(c.name))
  assert.ok(cgmh && cgmh.ticker === null, 'the CIK-tagged entity keeps its own name-only entry (a different legal entity than Citigroup Inc)')
})

// ---- searchFeed end-to-end with an aliased pick: the buried Oslo-tagged item is found ----
check('searchFeed finds an NHY-tagged item via an NHYDY pick carrying the Oslo tickerAlias', () => {
  const repo = tmp()
  for (let d = 0; d <= 4; d++) writeDay(repo, dayAgo(d), Array.from({ length: 12 }, () => item({ ts: `${dayAgo(d)}T10:00:00Z`, headline: 'Retailer posts quarterly sales' })))
  const target = item({ ts: `${dayAgo(5)}T09:00:00Z`, headline: 'Hydro flags smelter curtailment', companies: [{ name: 'Norsk Hydro', ticker: 'NHY', listing_country: 'NO' }] })
  writeDay(repo, dayAgo(5), [target])
  const snap = searchFeed(repo, { now, predicate: (it) => matchesFeedFilters(it, { company: { ticker: 'NHYDY', name: 'Norsk Hydro ASA', tickerAliases: ['NHY.OL'] } }), limit: 60 })
  assert.equal(snap.items.length, 1)
  assert.equal(snap.items[0].event_id, target.event_id)
})

// ---- explain names the alias path ----
check('explainFeedFilterMatch reports a ticker-alias hit distinctly from an exact hit', () => {
  const tagged = item({ ts: `${dayAgo(0)}T10:00:00Z`, headline: 'Hydro reports', companies: [{ name: 'Norsk Hydro', ticker: 'NHY', listing_country: 'NO' }] })
  const ex = explainFeedFilterMatch(tagged, { company: { ticker: 'NHYDY', name: 'Norsk Hydro ASA', tickerAliases: ['NHY.OL'] } })
  assert.equal(ex.matched, true)
  const c = ex.checks.find((x) => x.clause === 'company')
  assert.match(c!.detail, /ticker alias NHY/i, 'the alias path is named, not passed off as an exact hit')
})

// ---- the keyword read as a ticker (twin of the browser's companyFilter.test.ts) ----
// The scanner tags most Amazon stories {name:"Amazon", ticker:null}, so a literal keyword "amzn" reached
// only the minority of items whose tag carried the symbol (44 of the archive's 198 Amazon items) while
// "amazon" reached all of them. `textAs` carries the cockpit's ticker→company reading of the keyword, and
// each entry is matched with the SAME clause a picked company uses.
const AMZN_AS = [{ ticker: 'AMZN', name: 'Amazon', aliases: ['Amazon.com, Inc.'], listingCountry: 'US' }]

check('a ticker keyword read as its company reaches items the literal keyword cannot', () => {
  const untagged = item({ ts: NOW.toISOString(), headline: 'Amazon opens a new fulfilment centre', companies: [] })
  assert.equal(matchesFeedFilters(untagged, { text: 'amzn' }), false, 'the literal keyword alone cannot see it')
  assert.equal(matchesFeedFilters(untagged, { text: 'amzn', textAs: AMZN_AS }), true, 'read as the company, it matches')
  assert.equal(matchesFeedFilters(untagged, { text: 'amazon' }), true, 'the name keyword always worked')
})

check('the reading is additive and does not sweep in another company', () => {
  const tagged = item({ ts: NOW.toISOString(), headline: 'The online retailer beats on cloud growth', companies: [{ name: 'Amazon', ticker: 'AMZN' }] })
  const other = item({ ts: NOW.toISOString(), headline: 'Microsoft raises its dividend', companies: [{ name: 'Microsoft', ticker: 'MSFT' }] })
  assert.equal(matchesFeedFilters(tagged, { text: 'amzn', textAs: AMZN_AS }), true)
  assert.equal(matchesFeedFilters(other, { text: 'amzn', textAs: AMZN_AS }), false)
})

check('textAs is inert without text, and never widens another clause', () => {
  const msft = item({ ts: NOW.toISOString(), headline: 'Microsoft raises its dividend', companies: [{ name: 'Microsoft', ticker: 'MSFT' }] })
  assert.equal(hasAnyFilter({ textAs: AMZN_AS }), false, 'a reading is not a filter of its own')
  assert.equal(matchesFeedFilters(msft, { textAs: AMZN_AS }), true, 'no text → the reading is ignored entirely')
  assert.equal(matchesFeedFilters(msft, { company: { ticker: 'MSFT' }, text: 'amzn', textAs: AMZN_AS }), false, 'a picked company still ANDs')
})

// An item TAGGED with the symbol already carries it in its company blob, so the LITERAL clause covers that
// case unaided — and so does any prose containing the symbol's letters ("cat" inside "cattery"). What a
// reading genuinely adds is the NAME branch: reach over the far more numerous items the scanner never
// resolved a symbol for. That branch is the company-name matcher, so it stays whole-word and
// legal-suffix-tolerant rather than becoming a second substring pass. Twin of the browser's test.
check('a reading reaches UNTAGGED mentions by name and alias, and stays whole-word', () => {
  const alias = item({ ts: NOW.toISOString(), headline: 'Amazon.com, Inc. prices a bond', companies: [] })
  const plural = item({ ts: NOW.toISOString(), headline: 'The amazons of the ancient world, revisited', companies: [] })
  assert.equal(matchesFeedFilters(alias, { text: 'amzn', textAs: AMZN_AS }), true, 'an observed alias spelling counts')
  assert.equal(matchesFeedFilters(plural, { text: 'amzn', textAs: AMZN_AS }), false, 'whole-word: "amazons" is not Amazon')
})

check('the textAs param round-trips through the query parser, and malformed input degrades to literal', () => {
  const q = parseFeedFilterQuery({ text: 'amzn', textAs: JSON.stringify(AMZN_AS) })
  assert.deepEqual(q.textAs, AMZN_AS)
  assert.equal(parseFeedFilterQuery({ text: 'amzn', textAs: '{oops' }).textAs, undefined, 'unparseable → no reading')
  assert.equal(parseFeedFilterQuery({ text: 'amzn', textAs: '"x"' }).textAs, undefined, 'not an array → no reading')
  assert.equal(parseFeedFilterQuery({ text: 'amzn', textAs: '[{}]' }).textAs, undefined, 'an empty company is dropped')
  assert.equal(parseFeedFilterQuery({ text: 'amzn' }).textAs, undefined)
  // hard-bounded on every axis, so an untrusted caller cannot make this expensive
  const many = parseFeedFilterQuery({ text: 'x', textAs: JSON.stringify(Array.from({ length: 40 }, (_, i) => ({ ticker: `T${i}`, name: `N${i}`, aliases: Array.from({ length: 40 }, (_, j) => `a${j}`) }))) })
  assert.equal(many.textAs!.length, 4, 'entries capped')
  assert.equal(many.textAs![0].aliases!.length, 8, 'aliases capped')
  const longName = parseFeedFilterQuery({ text: 'x', textAs: JSON.stringify([{ name: 'z'.repeat(500) }]) })
  assert.equal(longName.textAs![0].name!.length, 120, 'string length capped')
})

check('the explain trace says the keyword was read as a company, rather than claiming a literal hit', () => {
  const untagged = item({ ts: NOW.toISOString(), headline: 'Amazon opens a new fulfilment centre', companies: [] })
  const hit = explainFeedFilterMatch(untagged, { text: 'amzn', textAs: AMZN_AS })
  assert.equal(hit.matched, true)
  assert.match(hit.checks.find((c) => c.clause === 'text')!.detail, /read as the company Amazon/i)
  const miss = explainFeedFilterMatch(item({ ts: NOW.toISOString(), headline: 'Microsoft raises its dividend', companies: [] }), { text: 'amzn', textAs: AMZN_AS })
  assert.equal(miss.matched, false)
  assert.match(miss.checks.find((c) => c.clause === 'text')!.detail, /not about Amazon/i, 'the miss names what the symbol was read as')
})

// An alias-only reading (no ticker, no name) is a valid query shape — companyClauseSet honours a non-empty
// alias list (see feed-filter.ts, the `aliases ALONE` note), so it reaches the explain trace's hit branch.
// The trace must NAME what it read the keyword as, never render the literal string "undefined": the sibling
// miss branch already falls back with `|| '?'`, and the hit branch must do the same (fall back to the alias).
check('the explain trace never prints "the company undefined" for an alias-only reading', () => {
  const named = item({ ts: NOW.toISOString(), headline: 'Foobar Corp prices a bond', companies: [] })
  const r = explainFeedFilterMatch(named, { text: 'zzz', textAs: [{ aliases: ['Foobar Corp'] }] })
  const c = r.checks.find((c) => c.clause === 'text')
  assert.equal(r.matched, true, 'the alias reading still matches the item')
  assert.doesNotMatch(c!.detail, /the company undefined/i, 'an alias-only reading must not print "undefined"')
  assert.match(c!.detail, /read as the company Foobar Corp/i, 'it falls back to the alias spelling')
})

console.log(`\ncompany-filter.test.ts: ${passed} passed`)
