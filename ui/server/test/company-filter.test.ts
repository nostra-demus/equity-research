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
    item({ ts: `${dayAgo(0)}T10:05:00Z`, headline: 'Amazon a', companies: [{ name: 'Amazon', ticker: 'AMZN', listing_country: 'US' }] }),
    item({ ts: `${dayAgo(0)}T10:04:00Z`, headline: 'Amazon b', companies: [{ name: 'Amazon', ticker: 'AMZN', listing_country: 'US' }] }),
    item({ ts: `${dayAgo(0)}T10:03:00Z`, headline: 'Amazon c', companies: [{ name: 'Amazon.com', ticker: 'AMZN', listing_country: 'US' }] }),
    // "Acme" is ambiguous — tagged under two different tickers, so a name-only "Acme" must NOT fold into either
    item({ ts: `${dayAgo(0)}T10:02:00Z`, headline: 'Acme x', companies: [{ name: 'Acme', ticker: 'ACM1', listing_country: 'US' }] }),
    item({ ts: `${dayAgo(0)}T10:01:00Z`, headline: 'Acme y', companies: [{ name: 'Acme', ticker: 'ACM2', listing_country: 'US' }] }),
    item({ ts: `${dayAgo(0)}T10:00:00Z`, headline: 'Acme z', companies: [{ name: 'Acme', ticker: null, listing_country: 'US' }] }),
  ])
  const facets = computeFacets(repo, {}, { now })
  const amzn = facets.companies.find((c) => c.ticker === 'AMZN')
  assert.equal(amzn?.name, 'Amazon', 'the most-used spelling (2× "Amazon" vs 1× "Amazon.com") wins')
  assert.equal(amzn?.count, 3)
  assert.deepEqual(amzn?.aliases, ['Amazon.com'], 'the less-used spelling is carried as an alias, not dropped')
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
    item({ ts: `${dayAgo(0)}T10:01:00Z`, headline: 'Amazon adds staff', companies: [{ name: 'Amazon', ticker: 'AMZN', listing_country: 'US' }] }), // a rarer, shorter tagged spelling
  ])
  const facets = computeFacets(repo, {}, { now })
  const amzn = facets.companies.find((c) => c.ticker === 'AMZN')
  assert.equal(amzn?.name, 'Amazon.com Inc.', 'the more-common long form is still the primary display name')
  assert.ok(amzn?.aliases.includes('Amazon'), 'the rarer short form is carried as an alias, ready to feed a pick')
})

// ---- 18. CROSS-EXCHANGE TICKER COLLISION: two unrelated issuers sharing ticker letters on different
// exchanges must NOT contaminate each other's alias list (Codex review, PR #319 — CAT: Caterpillar/NYSE vs
// Catapult Group International/ASX; ALK: Alaska Air vs Alkane Resources are the archive's real examples).
check('two different issuers sharing a ticker on different exchanges do not alias each other', () => {
  const repo = tmp()
  writeDay(repo, dayAgo(0), [
    item({ ts: `${dayAgo(0)}T10:03:00Z`, headline: 'Caterpillar lifts guidance', companies: [{ name: 'Caterpillar', ticker: 'CAT', listing_country: 'US' }] }),
    item({ ts: `${dayAgo(0)}T10:02:00Z`, headline: 'Caterpillar ships more excavators', companies: [{ name: 'Caterpillar', ticker: 'CAT', listing_country: 'US' }] }),
    item({ ts: `${dayAgo(0)}T10:01:00Z`, headline: 'Catapult Group International signs a deal', companies: [{ name: 'Catapult Group International', ticker: 'CAT', listing_country: 'AU' }] }),
  ])
  const facets = computeFacets(repo, {}, { now })
  const cat = facets.companies.find((c) => c.ticker === 'CAT')
  assert.equal(cat?.name, 'Caterpillar', 'the more-mentioned US issuer is still the primary display name')
  assert.ok(!cat?.aliases.includes('Catapult Group International'), 'the unrelated AU issuer must NOT be offered as an alias of Caterpillar')

  // end-to-end: picking "Caterpillar" (even if some future facet payload wrongly carried the AU name as an
  // alias) must not resolve an ASX-only headline — this is the actual harm the finding described
  const asxOnly = item({ ts: `${dayAgo(0)}T10:00:00Z`, headline: 'Catapult wins a new client contract', companies: [] })
  assert.equal(matchesFeedFilters(asxOnly, { company: { ticker: 'CAT', name: 'Caterpillar', aliases: cat?.aliases } }), false, 'an unrelated ASX company headline must not match a Caterpillar pick')
})

check('an alternate spelling with NO listing_country evidence is still a valid alias (unknown never conflicts)', () => {
  const repo = tmp()
  writeDay(repo, dayAgo(0), [
    item({ ts: `${dayAgo(0)}T10:02:00Z`, headline: 'Amazon.com Inc. lifts guidance', companies: [{ name: 'Amazon.com Inc.', ticker: 'AMZN', listing_country: 'US' }] }),
    item({ ts: `${dayAgo(0)}T10:01:00Z`, headline: 'Amazon.com Inc. opens a hub', companies: [{ name: 'Amazon.com Inc.', ticker: 'AMZN', listing_country: 'US' }] }),
    // the same ticker, a shorter spelling, but the extractor didn't resolve a listing_country this time
    item({ ts: `${dayAgo(0)}T10:00:00Z`, headline: 'Amazon adds staff', companies: [{ name: 'Amazon', ticker: 'AMZN', listing_country: null }] }),
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

console.log(`\ncompany-filter.test.ts: ${passed} passed`)
