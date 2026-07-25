// The browser twin of ui/server/test/company-filter.test.ts — proves the client's matchesFilters company
// clause behaves IDENTICALLY to the server's matchesFeedFilters (the two must stay in lockstep), and that
// a company pick trips archive mode. The ticker autofill's value is a {ticker, name} pick; the clause
// matches an item tagged with that exact ticker OR named in its headline/company blob.
// Run: npx tsx src/components/screener/companyFilter.test.ts
import assert from 'node:assert/strict'
import { archiveFiltersActive, emptyFilters, filtersActive, keywordReadAsNote, matchesFilters, type Filterable, type FeedFilterState } from './FeedFilters'
import { mergeCompanyOptions, rankOption, resolveKeywordCompanies, resolveTypedCompany } from './CompanyFilter'
import { baseTicker, cleanTicker, companyNameMatches, coreCompanyName, groupListingCountry } from '../../lib/symbology'

let passed = 0
function check(name: string, fn: () => void) {
  try { fn(); passed++; console.log(`  ok  ${name}`) }
  catch (e: any) { console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`); process.exitCode = 1 }
}

const it = (over: Partial<Filterable> = {}): Filterable => ({ headline: 'A generic corporate update', companies: [], ...over })
const withCompany = (company: FeedFilterState['company']): FeedFilterState => ({ ...emptyFilters(), company })

// ---- exact ticker ----
check('matches an item tagged with the exact ticker (case-insensitive), not a different one', () => {
  const amzn = it({ headline: 'Retailer lifts guidance', companies: [{ name: 'Amazon.com Inc', ticker: 'AMZN' }] })
  assert.equal(matchesFilters(amzn, withCompany({ ticker: 'AMZN', name: 'Amazon.com Inc' })), true)
  assert.equal(matchesFilters(amzn, withCompany({ ticker: 'amzn', name: '' })), true)
  assert.equal(matchesFilters(amzn, withCompany({ ticker: 'MSFT', name: 'Microsoft' })), false)
})

// ---- name substring over the headline ----
check('matches by name substring in the headline even when nothing is tagged', () => {
  const untagged = it({ headline: 'Amazon opens a new fulfilment centre', companies: [] })
  assert.equal(matchesFilters(untagged, withCompany({ ticker: 'AMZN', name: 'Amazon' })), true)
  assert.equal(matchesFilters(untagged, withCompany({ ticker: 'AMZN', name: '' })), false, 'ticker-only cannot hit an untagged headline')
})

// ---- name-only pick (ticker null) ----
check('a name-only pick matches by name; a ticker-only pick does not falsely match it', () => {
  const startup = it({ headline: 'Some Startup raises a round', companies: [{ name: 'Some Startup', ticker: null }] })
  assert.equal(matchesFilters(startup, withCompany({ ticker: null, name: 'Some Startup' })), true)
  assert.equal(matchesFilters(startup, withCompany({ ticker: 'SOME', name: '' })), false)
})

// ---- reliability: ticker catches a tag the headline never names ----
check('matches by ticker when the headline never spells out the company name', () => {
  const tagged = it({ headline: 'The online retailer beats on cloud growth', companies: [{ name: 'Amazon', ticker: 'AMZN' }] })
  assert.equal(matchesFilters(tagged, withCompany({ ticker: 'AMZN', name: 'Amazon' })), true)
})

// ---- headline_en (translated) blob is searched too ----
check('matches the name against the English translation of a foreign headline', () => {
  const foreign = it({ headline: 'アマゾン、通期見通しを上方修正', headline_en: 'Amazon raises full-year outlook', companies: [] })
  assert.equal(matchesFilters(foreign, withCompany({ ticker: 'AMZN', name: 'Amazon' })), true)
})

// ---- AND with free text ----
check('the company clause ANDs with the free-text clause', () => {
  const amzn = it({ headline: 'Amazon lifts guidance to 8%', companies: [{ name: 'Amazon', ticker: 'AMZN' }] })
  assert.equal(matchesFilters(amzn, { ...emptyFilters(), company: { ticker: 'AMZN', name: 'Amazon' }, text: '8%' }), true)
  assert.equal(matchesFilters(amzn, { ...emptyFilters(), company: { ticker: 'AMZN', name: 'Amazon' }, text: 'buyback' }), false)
})

// ---- ticker match is EXACT, never a sub/superstring (lockstep with the server) ----
check('a ticker filter matches only the exact ticker, not a super/substring', () => {
  const brkA = it({ headline: 'Berkshire class A moves', companies: [{ name: 'Berkshire Hathaway', ticker: 'BRK.A' }] })
  assert.equal(matchesFilters(brkA, withCompany({ ticker: 'BRK', name: '' })), false)
  assert.equal(matchesFilters(brkA, withCompany({ ticker: 'BRK.A', name: '' })), true)
})

// ---- name match is WHOLE-WORD (lockstep with the server) ----
check('the name clause matches a whole word, not a buried substring', () => {
  const hit = it({ headline: 'Meta beats on ad revenue', companies: [] })
  const miss = it({ headline: 'New metadata rules for websites', companies: [] })
  assert.equal(matchesFilters(hit, withCompany({ ticker: 'META', name: 'Meta' })), true)
  assert.equal(matchesFilters(miss, withCompany({ ticker: 'META', name: 'Meta' })), false, '"metadata" must not match "Meta"')
})

// ---- THE FIXED BUG: a free-typed single-word NAME keeps its recall (not misread as a zero-match ticker) ----
check('resolveTypedCompany keeps the typed value as the NAME so a single-word company still matches', () => {
  // "Amazon" is symbol-shaped, but the name must be kept as the recall floor (ticker is only an EXTRA clause)
  assert.deepEqual(resolveTypedCompany('Amazon'), { ticker: 'AMAZON', name: 'Amazon' })
  const untagged = it({ headline: 'Amazon opens a new fulfilment centre', companies: [] })
  assert.equal(matchesFilters(untagged, withCompany(resolveTypedCompany('Amazon'))), true, 'a free-typed "Amazon" still finds untagged Amazon news')
  // a multi-word name is name-only (no ticker); empty is null
  assert.deepEqual(resolveTypedCompany('Reliance Industries'), { ticker: null, name: 'Reliance Industries' })
  assert.equal(resolveTypedCompany('   '), null)
})

// ---- rankOption ranks exact-ticker above prefix above substring, and scans ALIASES too ----
check('rankOption ranks exact ticker < ticker-prefix < name-prefix < contains < no-match', () => {
  const o = { ticker: 'AMZN', name: 'Amazon.com' }
  assert.equal(rankOption(o, 'amzn'), 0)
  assert.equal(rankOption(o, 'amz'), 1)
  assert.equal(rankOption(o, 'amazon'), 2)
  assert.equal(rankOption({ ticker: 'MSFT', name: 'Microsoft' }, 'soft'), 4)
  assert.equal(rankOption(o, 'zzz'), -1)
})
// ---- listingCountry disambiguates two issuers sharing a ticker on different exchanges (client lockstep
// with the server's listingConflicts fix, #319) ----
check('a picked listingCountry excludes a bare-ticker match from a proven-different issuer', () => {
  const catapultTagged = it({ headline: 'Catapult wins a new client contract', companies: [{ name: 'Catapult Group International', ticker: 'CAT', listing_country: 'AU' }] })
  assert.equal(matchesFilters(catapultTagged, withCompany({ ticker: 'CAT', name: 'Caterpillar', listingCountry: 'US' })), false, 'a CAT-tagged AU item must not match a US Caterpillar pick via the bare ticker')
  assert.equal(matchesFilters(catapultTagged, withCompany({ ticker: 'CAT', name: 'Catapult Group International', listingCountry: 'AU' })), true, 'the correct (AU) issuer pick still matches')
  const untaggedCountry = it({ headline: 'A generic corporate update', companies: [{ name: 'Caterpillar', ticker: 'CAT', listing_country: null }] })
  assert.equal(matchesFilters(untaggedCountry, withCompany({ ticker: 'CAT', name: 'Caterpillar', listingCountry: 'US' })), true, 'unknown listing_country on the item is never a conflict')
})

// ---- rankOption must ALSO search aliases, not just the primary name (Codex review, #319): a facet whose
// primary name is "Alphabet" but has an observed alias "Google" must surface when the user types "Google" ----
check('rankOption ranks a query matching only an ALIAS the same as matching the primary name', () => {
  // "Facebook" as an alias, ticker "META" — chosen so the alias prefix never coincidentally also prefixes
  // the ticker string itself, cleanly isolating the alias tiers from the ticker tiers.
  const meta = { ticker: 'META', name: 'Meta Platforms', count: 5, aliases: ['Facebook'] }
  assert.equal(rankOption(meta, 'facebook'), 2, 'an exact alias match ranks at the name-prefix tier')
  assert.equal(rankOption(meta, 'faceb'), 2, 'an alias PREFIX also ranks at the name-prefix tier')
  assert.equal(rankOption(meta, 'cebook'), 4, 'an alias substring ranks at the name-contains tier')
  assert.equal(rankOption({ ticker: 'META', name: 'Meta Platforms', count: 5 }, 'facebook'), -1, 'with no aliases carried, "facebook" still cannot match "Meta Platforms"')
})

// ---- THE REPORTED GAP: a picked LONG-form name alone misses an UNTAGGED short-form headline; its
// aliases (carried on the pick from the facet) recover it — client lockstep with the server fix (#317) ----
check('a picked long-form name alone misses a short-form untagged headline; its aliases recover it', () => {
  const shortForm = it({ headline: 'Amazon raises full-year outlook', companies: [] })
  assert.equal(matchesFilters(shortForm, withCompany({ ticker: 'AMZN', name: 'Amazon.com Inc.' })), false, 'the long form alone does not reach a short-form untagged headline')
  assert.equal(matchesFilters(shortForm, withCompany({ ticker: 'AMZN', name: 'Amazon.com Inc.', aliases: ['Amazon'] })), true, 'an alias recovers the untagged short-form headline')
})

// ---- ALIAS-ONLY QUERY: no ticker/name, only aliases — matchesFilters must still activate the company
// clause and filter correctly, not silently no-op to "everything matches" (client lockstep with the
// server's companyClauseSet fix, #319) ----
check('a company filter with ONLY aliases (no ticker, no name) still activates and filters correctly', () => {
  const hit = it({ headline: 'Amazon raises full-year outlook', companies: [] })
  const miss = it({ headline: 'Microsoft ships an update', companies: [] })
  const aliasOnly = withCompany({ ticker: null, name: '', aliases: ['Amazon'] })
  assert.equal(matchesFilters(hit, aliasOnly), true)
  assert.equal(matchesFilters(miss, aliasOnly), false, 'an alias-only filter must still exclude non-matching items, not pass everything')
})

// ---- a company pick trips archive mode + reads as active ----
check('a company pick makes filtersActive + archiveFiltersActive true', () => {
  const f = withCompany({ ticker: 'AMZN', name: 'Amazon' })
  assert.equal(filtersActive(f), true)
  assert.equal(archiveFiltersActive(f), true)
  assert.equal(filtersActive(emptyFilters()), false)
  assert.equal(archiveFiltersActive(emptyFilters()), false)
})

// ---- imports for the global-symbology twins (appended with the NHYDY/global-directory feature) ----

// ---- THE NHYDY LOCKSTEP TWINS: a cross-listing tickerAlias + the core-name matcher ----
check('an ADR pick with the Oslo tickerAlias matches an item tagged with the bare Oslo symbol', () => {
  const tagged = it({ headline: 'Hydro reports quarterly results', companies: [{ name: 'Norsk Hydro', ticker: 'NHY' }] })
  const pick = { ticker: 'NHYDY', name: 'Norsk Hydro ASA', tickerAliases: ['NHY.OL', 'NHYKF'] }
  assert.equal(matchesFilters(tagged, withCompany(pick)), true, 'the NHY.OL alias base-matches the bare NHY tag')
  const untagged = it({ headline: 'Norsk Hydro to curtail aluminium output', companies: [] })
  assert.equal(matchesFilters(untagged, withCompany(pick)), true, 'core name "norsk hydro" hits despite the ASA suffix on the pick')
  const other = it({ headline: 'Alcoa lifts guidance', companies: [{ name: 'Alcoa', ticker: 'AA' }] })
  assert.equal(matchesFilters(other, withCompany(pick)), false)
})

// ---- a tickerAlias hit still respects the listing-country conflict guard ----
check('a tickerAlias match is still excluded by a proven-different listing country', () => {
  const catapult = it({ headline: 'Catapult wins a contract', companies: [{ name: 'Catapult Group International', ticker: 'CAT', listing_country: 'AU' }] })
  assert.equal(matchesFilters(catapult, withCompany({ ticker: 'CAT.X', name: 'Caterpillar', tickerAliases: ['CAT'], listingCountry: 'US' })), false)
})

// ---- junk scrub twins (deploy-skew: an old server can still serve dirty facet tickers) ----
check('cleanTicker/baseTicker/coreCompanyName twins behave like the server', () => {
  assert.equal(cleanTicker('NULL'), null)
  assert.equal(cleanTicker('0000200245'), null)
  assert.equal(cleanTicker('500325'), '500325')
  assert.equal(baseTicker('NHY.OL'), 'NHY')
  assert.equal(baseTicker('BRK.A'), 'BRK.A')
  assert.equal(coreCompanyName('CITIGROUP INC'), 'citigroup')
  assert.equal(coreCompanyName('JPMORGAN CHASE & CO'), 'jpmorgan chase')
})

// ---- rankOption searches the TICKER aliases too — typing NHYDY ranks the enriched NHY entry first ----
check('rankOption matches through the tickerAlias set at the symbol tiers', () => {
  const enriched = { ticker: 'NHY', name: 'Norsk Hydro', count: 12, tickerAliases: ['NHYDY', 'NHY.OL'] }
  assert.equal(rankOption(enriched, 'nhydy'), 0, 'an exact ticker-alias hit ranks like an exact ticker hit')
  assert.equal(rankOption(enriched, 'nhyd'), 1, 'a ticker-alias prefix ranks like a ticker prefix')
})

// ---- mergeCompanyOptions: directory groups enrich (not duplicate) archive entries ----
check('a directory group for an archive company attaches its ticker aliases to that entry', () => {
  const merged = mergeCompanyOptions(
    [{ ticker: 'NHY', name: 'Norsk Hydro', count: 12, aliases: ['Hydro'], listingCountry: 'NO' }],
    [{ name: 'Norsk Hydro ASA', symbol: 'NHYDY', exchange: 'OTC Markets', aliases: ['NHYDY', 'NHY.OL', 'NHYKF'] }],
  )
  assert.equal(merged.length, 1, 'one row — the archive entry enriched, not a duplicate')
  assert.equal(merged[0].ticker, 'NHY')
  assert.equal(merged[0].count, 12, 'the archive mention count is kept')
  assert.deepEqual(merged[0].aliases, ['Hydro'], 'the archive NAME aliases are kept untouched')
  assert.equal(merged[0].listingCountry, 'NO', 'the listing country is kept')
  assert.deepEqual([...(merged[0].tickerAliases || [])].sort(), ['NHY.OL', 'NHYDY', 'NHYKF'])
})
check('an unknown company appends as a global-only row; junk facet tickers are scrubbed', () => {
  const merged = mergeCompanyOptions(
    [{ ticker: 'NULL', name: 'Man Group PLC', count: 95 }],
    [{ name: 'Rio Tinto PLC', symbol: 'RIO.L', exchange: 'LSE', aliases: ['RIO.L', 'RIO'] }],
  )
  const man = merged.find((o) => /man group/i.test(o.name))
  assert.equal(man?.ticker, null, 'the junk "NULL" facet ticker is scrubbed to a name-only entry')
  const rio = merged.find((o) => /rio tinto/i.test(o.name))
  assert.equal(rio?.ticker, 'RIO.L')
  assert.equal(rio?.exchange, 'LSE')
  assert.deepEqual(rio?.tickerAliases, ['RIO'], 'the primary symbol is not repeated in its own aliases')
})

// ---- mergeCompanyOptions: a shared exchange-stripped ticker base across DIFFERENT issuers must NOT merge
//      them (Codex P1 r3635672840). Expected behaviour pinned to the ticker-base fallback's own rule:
//      it fires only when the archive entry has no distinguishing company name of its own; two real,
//      differently-named issuers that happen to share a base (ASX CAT = Catapult, NYSE CAT = Caterpillar)
//      stay separate options so typing CAT can't offer/filter the wrong company.
check('a shared ticker base on two DIFFERENT issuers stays two options (CAT: Catapult vs Caterpillar)', () => {
  const merged = mergeCompanyOptions(
    [{ ticker: 'CAT', name: 'Catapult Group International Ltd', count: 3, listingCountry: 'AU' }],
    [{ name: 'Caterpillar Inc', symbol: 'CAT', exchange: 'NYSE', aliases: ['CAT'] }],
  )
  assert.equal(merged.length, 2, 'Caterpillar is a separate option, not absorbed into Catapult on the shared base')
  const catapult = merged.find((o) => /catapult/i.test(o.name))
  const caterpillar = merged.find((o) => /caterpillar/i.test(o.name))
  assert.ok(catapult && caterpillar, 'both distinct issuers remain present as their own rows')
  assert.deepEqual(catapult?.tickerAliases ?? [], [], 'the ASX Catapult row gains no alias from the NYSE Caterpillar group')
})
// A name-less/opaque archive entry that shares the base still gains the directory identity — the fallback's
// legitimate purpose (so the tightening above does not disable it).
check('a name-less archive entry sharing the base still merges with the directory group', () => {
  const merged = mergeCompanyOptions(
    [{ ticker: 'CAT', name: '', count: 1 }],
    [{ name: 'Caterpillar Inc', symbol: 'CAT', exchange: 'NYSE', aliases: ['CAT', 'CAT.DE'] }],
  )
  assert.equal(merged.length, 1, 'the opaque CAT entry is enriched by the directory group, not duplicated')
  assert.deepEqual([...(merged[0].tickerAliases || [])].sort(), ['CAT.DE'], 'gains the sibling listing; its own ticker is not repeated')
})
// ---- mergeCompanyOptions: tolerate a directory group missing its aliases field (Gemini medium
//      r3635665856 — deploy skew / an older server response). Must not crash on g.aliases.map. ----
check('mergeCompanyOptions does not crash on a directory group with no aliases field', () => {
  const merged = mergeCompanyOptions(
    [{ ticker: 'NHY', name: 'Norsk Hydro', count: 5, listingCountry: 'NO' }],
    [{ name: 'Some New Co', symbol: 'SNC', exchange: 'NYSE' } as any], // legacy/partial response: no aliases
  )
  assert.ok(Array.isArray(merged), 'returns a list rather than throwing on the missing array')
  const snc = merged.find((o) => o.ticker === 'SNC')
  assert.ok(snc, 'the group still surfaces as an option')
  assert.deepEqual(snc?.tickerAliases ?? [], [], 'no aliases → empty tickerAliases, not a TypeError')
})

// ==== PR #322 review findings — web twin lockstep with the server (see symbology-review-findings.test.ts,
//      company-filter.test.ts). Expected values pinned to each finding's design spec + public authorities. ====

// ---- F1 (r3636118350): a COMMON single-word core must not free-text match unrelated prose, while a
//      DISTINCTIVE single-word core (tesla/nvidia/netflix) and every multi-word core still match ----
check('F1: a common single-word core does not false-match free prose; a distinctive one still matches (twin)', () => {
  assert.equal(companyNameMatches('analysts lift their price target on the retailer', 'Target Corporation'), false, '"price target" must not match a Target Corporation pick')
  assert.equal(companyNameMatches('orange juice futures rally on a cold snap', 'Orange S.A.'), false, '"orange juice" must not match an Orange S.A. pick')
  assert.equal(companyNameMatches('tesla unveils a cheaper model', 'Tesla Inc'), true, 'a distinctive single-word core still matches')
  assert.equal(companyNameMatches('norsk hydro trims output', 'Norsk Hydro ASA'), true, 'a multi-word core is unaffected')
})
check('F1: at the filter level, a Target Corporation pick skips an unrelated "price target" headline but a Tesla pick catches its own', () => {
  const priceTarget = it({ headline: 'Analysts lift their price target on the retailer', companies: [] })
  assert.equal(matchesFilters(priceTarget, withCompany({ ticker: 'TGT', name: 'Target Corporation' })), false, 'a common-core pick must not drag in "price target" prose')
  const teslaNews = it({ headline: 'Tesla unveils a cheaper model', companies: [] })
  assert.equal(matchesFilters(teslaNews, withCompany({ ticker: 'TSLA', name: 'Tesla Inc' })), true, 'a distinctive-core pick still finds its untagged headline')
})

// ---- F2 (r3636118357): a directory-ONLY pick derives a listing country from its exchange so the existing
//      conflict guard can tell a US issuer apart from a foreign same-ticker one — but a genuine cross-listing
//      stays country-undefined so its alias recall is preserved. Authority: ISO 3166-1 alpha-2 + exchange
//      domiciles (NYSE = US, ASX = Australia); the guard contract is feed-filter listingConflicts (PR #319). ----
check('F2: a directory-only NYSE pick is placed in the US so a foreign same-ticker (ASX CAT) issuer is excluded', () => {
  // Caterpillar is directory-only (absent from the archive facet); the archive only has ASX CAT = Catapult
  const merged = mergeCompanyOptions([], [{ name: 'Caterpillar Inc', symbol: 'CAT', exchange: 'NYSE', aliases: ['CAT'] }])
  const cat = merged.find((o) => /caterpillar/i.test(o.name))!
  assert.equal(cat.listingCountry, 'US', 'a NYSE directory pick is placed in the US (ISO 3166-1)')
  const pick = { ticker: cat.ticker, name: cat.name, tickerAliases: cat.tickerAliases, listingCountry: cat.listingCountry ?? undefined }
  const catapultAU = it({ headline: 'Catapult wins a client', companies: [{ name: 'Catapult Group International', ticker: 'CAT', listing_country: 'AU' }] })
  assert.equal(matchesFilters(catapultAU, withCompany(pick)), false, 'a US Caterpillar directory pick must NOT match an AU CAT (Catapult) item via the bare ticker')
})
check('F2: a CROSS-LISTED directory pick (ADR + foreign home line) stays country-undefined so alias recall is preserved', () => {
  const merged = mergeCompanyOptions([], [{ name: 'Norsk Hydro ASA', symbol: 'NHYDY', exchange: 'OTC', aliases: ['NHYDY', 'NHY.OL', 'NHYKF'] }])
  const nhy = merged.find((o) => /norsk hydro/i.test(o.name))!
  assert.equal(nhy.listingCountry ?? undefined, undefined, 'a US ADR + Oslo home line spans two countries → no single definite country → guard stays off')
  const pick = { ticker: nhy.ticker, name: nhy.name, tickerAliases: nhy.tickerAliases, listingCountry: nhy.listingCountry ?? undefined }
  const nhyNO = it({ headline: 'Hydro reports quarterly results', companies: [{ name: 'Norsk Hydro', ticker: 'NHY', listing_country: 'NO' }] })
  assert.equal(matchesFilters(nhyNO, withCompany(pick)), true, 'the Oslo-tagged (NO) item still matches via the NHY.OL alias — cross-listing recall preserved')
})
check('F2: groupListingCountry — single-market → its country; cross-market → undefined; unknown exchange → undefined', () => {
  assert.equal(groupListingCountry('CAT', [], 'NYSE'), 'US', 'a suffix-less US symbol on NYSE resolves to US')
  assert.equal(groupListingCountry('RELIANCE.NS', [], 'NSE'), 'IN', 'an NSE suffix resolves to India')
  assert.equal(groupListingCountry('NHYDY', ['NHY.OL', 'NHYKF'], 'OTC'), undefined, 'US ADR + Oslo suffix disagree → undefined')
  assert.equal(groupListingCountry('NHY.OL', ['NHYDY', 'NHYKF'], 'Oslo'), undefined, 'Oslo primary + UNPLACEABLE US OTC aliases → undefined, not a definite NO (regardless of which market started the lookup)')
  assert.equal(groupListingCountry('CAT', [], 'SomeUnknownExch'), undefined, 'an unrecognised exchange never forces a (possibly wrong) country')
})

// ---- F3 (r3636118361): cleanTicker admits '&' (NSE symbols) but still rejects junk/CIK (twin) ----
check('F3: cleanTicker accepts NSE "&" symbols and still rejects NULL/CIK (twin)', () => {
  assert.equal(cleanTicker('M&M.NS'), 'M&M.NS')
  assert.equal(cleanTicker('L&T.NS'), 'L&T.NS')
  assert.equal(cleanTicker('NULL'), null)
  assert.equal(cleanTicker('0000200245'), null)
})

// ---- F4 (r3636118374): coreCompanyName normalises parentheticals + dotted initialisms (twin) ----
check('F4: dotted/undotted initialisms and parenthetical annotations reduce to one core (twin)', () => {
  assert.equal(coreCompanyName('J.P. Morgan Chase & Co.'), 'jp morgan chase')
  assert.equal(coreCompanyName('J.P. Morgan Chase & Co.'), coreCompanyName('JP Morgan Chase & Co.'))
  assert.equal(coreCompanyName('Acme Inc. (NYSE: ACME)'), 'acme')
  assert.equal(coreCompanyName('Acme Inc. (NYSE: ACME)'), coreCompanyName('Acme Inc.'))
  assert.equal(coreCompanyName('Man Group PLC'), 'man group', 'no regression: "group" is identity, not collapsed to "man"')
  assert.equal(coreCompanyName('Amazon.com, Inc.'), 'amazon.com', 'no regression: a word.word dot is kept')
})

// ---- a typed KEYWORD that is really a ticker (the "amzn finds nothing, amazon finds everything" defect) ----
// The scanner tags most Amazon stories {name:"Amazon", ticker:null}, so the literal keyword "amzn" reached
// only the minority of items whose tag carried the symbol (44 of the archive's 198 Amazon items) while
// "amazon" reached all of them. The archive company facet already knows AMZN ↔ Amazon, so the keyword box
// reads the symbol as that company — additively, on top of the literal substring.
const AMZN_FACET = [
  { ticker: 'AMZN', name: 'Amazon', count: 197, aliases: ['Amazon.com, Inc.'], listingCountry: 'US' },
  { ticker: 'MSFT', name: 'Microsoft', count: 88, aliases: [], listingCountry: 'US' },
]

check('a typed ticker keyword resolves to the company the archive tags under that symbol', () => {
  assert.deepEqual(resolveKeywordCompanies('amzn', AMZN_FACET), [
    { ticker: 'AMZN', name: 'Amazon', aliases: ['Amazon.com, Inc.'], listingCountry: 'US' },
  ])
  assert.deepEqual(resolveKeywordCompanies('AMZN', AMZN_FACET), resolveKeywordCompanies('amzn', AMZN_FACET), 'case-insensitive')
})

check('the reading is narrow: 1 char, a phrase, and an unknown symbol all resolve to nothing', () => {
  assert.deepEqual(resolveKeywordCompanies('a', AMZN_FACET), [], 'a single letter is a symbol somewhere — never read as a company')
  assert.deepEqual(resolveKeywordCompanies('data centre', AMZN_FACET), [], 'a phrase is not symbol-shaped')
  assert.deepEqual(resolveKeywordCompanies('zzzz', AMZN_FACET), [], 'a symbol the archive never tagged stays a literal word')
  assert.deepEqual(resolveKeywordCompanies('', AMZN_FACET), [])
})

check('an identity whose only name IS the bare symbol is not read as a company (the literal already has it)', () => {
  assert.deepEqual(resolveKeywordCompanies('cat', [{ ticker: 'CAT', name: 'CAT', count: 9, aliases: [], listingCountry: null }]), [])
})

check('a ticker keyword now reaches the same company news the NAME keyword reaches', () => {
  const textAs = resolveKeywordCompanies('amzn', AMZN_FACET)
  const untagged = it({ headline: 'Amazon opens a new fulfilment centre', companies: [{ name: 'Amazon', ticker: null }] })
  const byName = { ...emptyFilters(), text: 'amazon' }
  const byTicker = { ...emptyFilters(), text: 'amzn' }
  assert.equal(matchesFilters(untagged, byName), true, 'the name keyword always worked')
  assert.equal(matchesFilters(untagged, byTicker), false, 'the literal ticker keyword alone still cannot see it')
  assert.equal(matchesFilters(untagged, byTicker, textAs), true, 'read as the company, the ticker keyword now finds it')
})

check('the reading is ADDITIVE — a literal hit still matches, and an unrelated item still does not', () => {
  const textAs = resolveKeywordCompanies('amzn', AMZN_FACET)
  const tagged = it({ headline: 'The online retailer beats on cloud growth', companies: [{ name: 'Amazon', ticker: 'AMZN' }] })
  const other = it({ headline: 'Microsoft raises its dividend', companies: [{ name: 'Microsoft', ticker: 'MSFT' }] })
  assert.equal(matchesFilters(tagged, { ...emptyFilters(), text: 'amzn' }, textAs), true, 'the literal tag hit is untouched')
  assert.equal(matchesFilters(other, { ...emptyFilters(), text: 'amzn' }, textAs), false, 'a different company must not be swept in')
  assert.equal(matchesFilters(tagged, { ...emptyFilters(), text: 'amzn' }, []), true, 'no reading available → pre-existing behaviour')
})

check('a name alias the archive observed is reached, but the reading stays whole-word', () => {
  const textAs = resolveKeywordCompanies('amzn', AMZN_FACET)
  const longForm = it({ headline: 'Amazon.com, Inc. prices a bond', companies: [] })
  assert.equal(matchesFilters(longForm, { ...emptyFilters(), text: 'amzn' }, textAs), true, 'an observed alias spelling counts')
  // The reading matches the company by NAME, whole-word — it is not a second substring pass. "amazons"
  // contains "amazon" but is not the company, and the literal "amzn" is nowhere in this headline, so this
  // isolates the reading's own precision.
  const river = it({ headline: 'The amazons of the ancient world, revisited', companies: [] })
  assert.equal(matchesFilters(river, { ...emptyFilters(), text: 'amzn' }, textAs), false, 'whole-word: "amazons" is not Amazon')
})

check('the reading ANDs with the other filters, it does not bypass them', () => {
  const textAs = resolveKeywordCompanies('amzn', AMZN_FACET)
  const untagged = it({ headline: 'Amazon opens a new fulfilment centre', companies: [], size_bucket: 'mega' })
  assert.equal(matchesFilters(untagged, { ...emptyFilters(), text: 'amzn', size: 'mega' }, textAs), true)
  assert.equal(matchesFilters(untagged, { ...emptyFilters(), text: 'amzn', size: 'small' }, textAs), false)
})

check('the surface says plainly what it read the keyword as', () => {
  const textAs = resolveKeywordCompanies('amzn', AMZN_FACET)
  const note = keywordReadAsNote('amzn', textAs)
  assert.ok(note && note.includes('amzn') && note.includes('Amazon (AMZN)'), `expected an explanatory note, got ${note}`)
  assert.equal(keywordReadAsNote('amzn', []), null, 'nothing read → no note')
  assert.equal(keywordReadAsNote('', textAs), null)
})

console.log(`\ncompanyFilter.test.ts: ${passed} passed`)
