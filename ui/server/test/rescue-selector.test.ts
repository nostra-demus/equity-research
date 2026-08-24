import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { cleanTicker } from '../src/news/symbology'
import { classifyInitialRescueDecision, selectRescueCandidates } from '../src/news/rescue/selector'
import type { FeedItem } from '../src/news/types'

const NOW = Date.parse('2026-08-22T12:00:00Z')

function row(id: string, fields: Partial<FeedItem> = {}): FeedItem {
  return {
    kind: 'item', ts: '2026-08-22T11:00:00Z', found_at: '2026-08-22T11:00:00Z', event_id: id,
    headline: 'Acme reports an ordinary update', url: `https://reuters.com/${id}`, domain: 'reuters.com',
    source_name: 'Reuters', via: 'gdelt', region: 'US', input_nature: 'news_headline', triage_score: 30,
    band: 'drop', triage_reason: '', relevance: 'relevant_non_material', event_types: [], issuer_linkage: 'primary',
    companies: [{ name: 'Acme Corp', ticker: 'ACME', listing_country: 'US' }], size_bucket: 'unknown',
    source_tier: 'news', rank_factors: {
      materiality: 30, source_tier: 0, scope: 0, event: 0, size: 0, recency: 0,
      materiality_label_floor: 0, quantified: 0, boost_weight: 1, scope_id: 'single_name',
      source_tier_id: 'news', event_id: null, size_bucket: 'unknown',
    }, dedup_status: 'new', dedup_group: id, inboxed: false, ...fields,
  }
}

{
  const datedOnly = row('EVT-date', { headline: 'Acme update dated August 22, 2026', triage_score: 35 })
  assert.equal(selectRescueCandidates([datedOnly], NOW).candidates.length, 0, 'a date and score 25–39 do not admit an item')
  assert.deepEqual(classifyInitialRescueDecision(datedOnly).reason_codes, ['no_strong_company_event'])
}

{
  const invalidScore = row('EVT-invalid-score', { triage_score: Number.NaN })
  assert.deepEqual(classifyInitialRescueDecision(invalidScore).reason_codes, ['score_outside_second_look'])
  assert.equal(selectRescueCandidates([invalidScore], NOW).candidates.length, 0,
    'a non-finite score cannot enter the second-look pool')
}

{
  const routine = row('EVT-form4', {
    headline: '4 - ACME CORP (0001234567) (Issuer)', input_nature: 'regulatory_filing', source_tier: 'primary_filing',
    event_types: ['insider_transaction'],
  })
  const social = row('EVT-social', { via: 'reddit', input_nature: 'social_discussion', source_tier: 'social', event_types: ['commercial'] })
  const result = selectRescueCandidates([routine, social], NOW)
  assert.equal(result.candidates.length, 0)
  assert.equal(result.reconciled.routine_filing, 1)
  assert.equal(result.reconciled.social, 1)
}

{
  const indiaRoutine = row('EVT-board-intimation', {
    headline: 'Acme Ltd - Board Meeting Intimation for quarterly results',
    source_tier: 'primary_filing', event_types: ['earnings_revenue_margin'],
  })
  assert.equal(selectRescueCandidates([indiaRoutine], NOW).reconciled.routine_filing, 1,
    'the shared filing gate excludes routine non-US paperwork')
}

{
  const translatedRoutine = row('EVT-translated-routine', {
    headline: '公司公告', headline_en: 'Acme Ltd - Board Meeting Intimation for quarterly results',
    source_tier: 'primary_filing', event_types: ['earnings_revenue_margin'],
  })
  assert.equal(selectRescueCandidates([translatedRoutine], NOW).reconciled.routine_filing, 1,
    'routine-filing gates use the saved English translation when the source headline is non-English')
  const translatedDate = row('EVT-translated-date', {
    headline: '公司签署合同', headline_en: 'Acme signs a contract on August 22, 2026', event_types: ['commercial'],
  })
  assert.equal(selectRescueCandidates([translatedDate], NOW).candidates[0].rank_inputs.specific_date, true,
    'date priority uses the readable translated headline too')
}

{
  const multiCompany = row('EVT-roundup', {
    headline: 'Acme and Beta announce commercial updates', event_types: ['commercial'],
    companies: [
      { name: 'Acme Corp', ticker: 'ACME', listing_country: 'US' },
      { name: 'Beta Corp', ticker: 'BETA', listing_country: 'US' },
    ],
  })
  assert.equal(selectRescueCandidates([multiCompany], NOW).candidates.length, 0,
    'a multi-company event cannot be assigned to the first saved ticker')
}

{
  assert.equal(cleanTicker('500325'), '500325', 'six-digit BSE codes remain valid')
  assert.equal(cleanTicker('0005'), '0005', 'numeric HK codes remain valid')
  assert.equal(cleanTicker('0001234567'), null, 'CIK-like long numbers are rejected')
}

{
  const native = row('EVT-nhy-native', {
    companies: [{ name: 'Norsk Hydro ASA', ticker: 'NHY', listing_country: 'NO' }],
    event_types: ['commercial'], dedup_group: 'STORY-nhy-contract',
  })
  const yahoo = row('EVT-nhy-yahoo', {
    companies: [{ name: 'Norsk Hydro ASA', ticker: 'NHY.OL', listing_country: 'NO' }],
    event_types: ['commercial'], dedup_group: 'STORY-nhy-contract',
    domain: 'ft.com', source_name: 'Financial Times', url: 'https://ft.com/nhy-contract',
  })
  const result = selectRescueCandidates([native, yahoo], NOW)
  assert.equal(result.candidates.length, 1,
    'country-proven native and Yahoo ticker spellings corroborate one local listing')
  assert.equal(result.candidates[0].identity_key, 'ticker:NHY|company:norsk hydro|country:NO')
  assert.equal(result.candidates[0].rank_inputs.independent_reports, 2)

  const mixedMetadata = row('EVT-nhy-alias-metadata', {
    companies: [
      { name: 'Norsk Hydro ASA', ticker: 'NHY', listing_country: null },
      { name: 'Norsk Hydro ASA', ticker: 'NHY.OL', listing_country: 'NO' },
    ],
    event_types: ['commercial'], dedup_group: 'STORY-nhy-alias-metadata',
  })
  const candidate = selectRescueCandidates([mixedMetadata], NOW).candidates[0]
  assert.equal(candidate.ticker, 'NHY', 'the shorter native spelling remains the directory query')
  assert.equal(candidate.listing_country, 'NO', 'a compatible alias preserves its known listing country')
}

{
  const weak = row('EVT-weak', { event_types: ['commercial'], triage_score: 39, source_tier: 'news' })
  const critical = row('EVT-critical', {
    headline: 'Acme warns of default risk', event_types: ['default_distress'], triage_score: 20,
    source_tier: 'primary_filing', input_nature: 'exchange_announcement',
  })
  const first = selectRescueCandidates([weak, critical], NOW).candidates.map((candidate) => candidate.event_id)
  const second = selectRescueCandidates([critical, weak], NOW).candidates.map((candidate) => candidate.event_id)
  assert.deepEqual(first, second, 'input order cannot change the priority result')
  assert.equal(first[0], 'EVT-critical', 'survival/accounting risk outranks a routine operating event')
}

{
  const nameA = row('EVT-name-a', {
    headline: 'Private-symbol Acme announces a commercial contract', domain: 'reuters.com', url: 'https://reuters.com/name-a',
    companies: [{ name: 'Acme Corporation', ticker: null, listing_country: 'US' }], event_types: ['commercial'],
    dedup_group: 'STORY-acme-contract',
  })
  const nameB = row('EVT-name-b', {
    headline: 'Acme contract is confirmed by a second outlet', domain: 'ft.com', url: 'https://ft.com/name-b',
    source_name: 'Financial Times', companies: [{ name: 'Acme Corp', ticker: null, listing_country: 'US' }],
    event_types: ['commercial'], dedup_group: 'STORY-acme-contract',
  })
  const candidate = selectRescueCandidates([nameA, nameB], NOW).candidates[0]
  assert.equal(candidate.pool, 'name')
  assert.equal(candidate.rank_inputs.strong_signal_count, 2, 'name-only admission needs event + independent corroboration')
  assert.equal(candidate.supporting_event_ids.length, 1)
}

{
  const recent = row('EVT-window-recent', { event_types: ['commercial'] })
  const older = row('EVT-window-older', {
    found_at: '2026-08-21T10:59:00Z', ts: '2026-08-21T10:59:00Z', event_types: ['commercial'],
    url: 'https://ft.com/window-older', domain: 'ft.com', source_name: 'Financial Times',
  })
  assert.equal(selectRescueCandidates([recent, older], NOW).candidates.length, 2,
    'stories more than 24 hours apart are separate review clusters')
}

{
  const duplicate = row('EVT-only-duplicate', { event_types: ['commercial'], dedup_status: 'possible_duplicate' })
  const result = selectRescueCandidates([duplicate], NOW)
  assert.equal(result.candidates.length, 0, 'a persisted duplicate can support a cluster but cannot be its representative')
  assert.equal(result.reconciled.duplicate, 1)
}

{
  const blocked = row('EVT-manually-blocked', { event_types: ['commercial'] })
  const result = selectRescueCandidates([blocked], NOW, 36, new Set([blocked.event_id]))
  assert.equal(result.candidates.length, 0)
  assert.equal(result.reconciled.manually_blocked, 1, 'a prior human dismissal/use blocks the second look')
}

{
  const sharedUrl = 'https://wire.example/shared-copy'
  const first = row('EVT-same-url-a', {
    companies: [{ name: 'Acme Corp', ticker: null, listing_country: 'US' }], event_types: ['commercial'],
    url: sharedUrl, domain: 'one.example', dedup_group: 'STORY-shared-url',
  })
  const second = row('EVT-same-url-b', {
    companies: [{ name: 'Acme Corp', ticker: null, listing_country: 'US' }], event_types: ['commercial'],
    url: sharedUrl, domain: 'two.example', dedup_group: 'STORY-shared-url',
  })
  assert.equal(selectRescueCandidates([first, second], NOW).candidates.length, 0,
    'different domain labels on the same URL are not independent reports')
}

{
  const first = row('EVT-publisher-a', {
    companies: [{ name: 'Acme Corp', ticker: null, listing_country: 'US' }],
    event_types: ['commercial'], domain: 'livemint.com', source_name: 'Mint', dedup_group: 'STORY-mint-copy',
  })
  const second = row('EVT-publisher-b', {
    companies: [{ name: 'Acme Corp', ticker: null, listing_country: 'US' }],
    event_types: ['commercial'], domain: 'www.livemint.com', source_name: 'Mint',
    url: 'https://www.livemint.com/acme-copy', dedup_group: 'STORY-mint-copy',
  })
  assert.equal(selectRescueCandidates([first, second], NOW).candidates.length, 0,
    'two host spellings from one publisher are not independent corroboration')
}

{
  const first = row('EVT-free-label-a', {
    companies: [{ name: 'Acme Corp', ticker: null, listing_country: 'US' }],
    event_types: ['commercial'], domain: 'example.com', source_name: 'First Wire',
    url: 'https://example.com/acme-one', dedup_group: 'STORY-free-label-copy',
  })
  const second = row('EVT-free-label-b', {
    companies: [{ name: 'Acme Corp', ticker: null, listing_country: 'US' }],
    event_types: ['commercial'], domain: 'example.com', source_name: 'Second Wire',
    url: 'https://example.com/acme-two', dedup_group: 'STORY-free-label-copy',
  })
  assert.equal(selectRescueCandidates([first, second], NOW).candidates.length, 0,
    'different free-form labels on one domain are never independent reports')
}

{
  const first = row('EVT-ft-domain-a', {
    companies: [{ name: 'Acme Corp', ticker: null, listing_country: 'US' }],
    event_types: ['commercial'], domain: 'ft.com', source_name: 'Financial Times',
    url: 'https://ft.com/acme-one', dedup_group: 'STORY-ft-domain-copy',
  })
  const second = row('EVT-ft-domain-b', {
    companies: [{ name: 'Acme Corp', ticker: null, listing_country: 'US' }],
    event_types: ['commercial'], domain: 'markets.ft.com', source_name: 'FT Markets',
    url: 'https://markets.ft.com/acme-two', dedup_group: 'STORY-ft-domain-copy',
  })
  assert.equal(selectRescueCandidates([first, second], NOW).candidates.length, 0,
    'approved subdomains owned by one publisher are never independent reports')
}

{
  const tickerCopy = row('EVT-ticker-copy', { event_types: ['commercial'], dedup_group: 'STORY-ticker-name-copy' })
  const nameCopy = row('EVT-name-copy', {
    companies: [{ name: 'Acme Corporation', ticker: null, listing_country: 'US' }],
    event_types: ['commercial'], domain: 'ft.com', url: 'https://ft.com/acme-copy', source_name: 'Financial Times',
    triage_score: 39, dedup_group: 'STORY-ticker-name-copy',
  })
  const result = selectRescueCandidates([tickerCopy, nameCopy], NOW)
  assert.equal(result.candidates.length, 1, 'tickered and name-only copies of one company/event form one cluster')
  assert.equal(result.candidates[0].event_id, nameCopy.event_id, 'the best story remains the representative')
  assert.equal(result.candidates[0].pool, 'ticker', 'the cluster still uses its saved clean ticker for identity')
}

{
  const firstContract = row('EVT-contract-one', {
    headline: 'Acme wins a contract with Northwind', event_types: ['commercial'],
    dedup_group: 'STORY-contract-northwind',
  })
  const secondContract = row('EVT-contract-two', {
    headline: 'Acme signs a separate contract with Contoso', event_types: ['commercial'],
    domain: 'ft.com', source_name: 'Financial Times', url: 'https://ft.com/acme-contoso',
    dedup_group: 'STORY-contract-contoso',
  })
  const result = selectRescueCandidates([firstContract, secondContract], NOW)
  assert.equal(result.candidates.length, 2,
    'two same-day events in one broad event family never corroborate or collapse into one review')
  assert.ok(result.candidates.every((candidate) => candidate.rank_inputs.independent_reports === 1))
}

{
  const usIssuer = row('EVT-same-name-us', {
    event_types: ['commercial'],
    companies: [{ name: 'Global Industries Inc', ticker: 'GLBI', listing_country: 'US' }],
  })
  const indiaIssuer = row('EVT-same-name-in', {
    event_types: ['commercial'], domain: 'moneycontrol.com', source_name: 'Moneycontrol',
    url: 'https://moneycontrol.com/global-industries',
    companies: [{ name: 'Global Industries Inc', ticker: 'GLOBALIND', listing_country: 'IN' }],
  })
  const result = selectRescueCandidates([usIssuer, indiaIssuer], NOW)
  assert.equal(result.candidates.length, 2,
    'same-name issuers with different saved listing identities never corroborate or collapse into one candidate')
  assert.deepEqual(new Set(result.candidates.map((candidate) => candidate.identity_key)).size, 2)
}

{
  const unknown = row('EVT-country-unknown', {
    event_types: ['commercial'], dedup_group: 'STORY-country-enrichment',
    companies: [{ name: 'Global Industries Inc', ticker: 'GLBI', listing_country: null }],
  })
  const known = row('EVT-country-known', {
    event_types: ['commercial'], dedup_group: 'STORY-country-enrichment',
    domain: 'ft.com', source_name: 'Financial Times', url: 'https://ft.com/global-industries-country',
    companies: [{ name: 'Global Industries Inc', ticker: 'GLBI', listing_country: 'US' }],
  })
  const unknownKey = selectRescueCandidates([unknown], NOW).candidates[0].identity_key
  const knownKey = selectRescueCandidates([known], NOW).candidates[0].identity_key
  const enriched = selectRescueCandidates([unknown, known], NOW)
  assert.notEqual(unknownKey, knownKey,
    'adding a known country changes the verification identity so an unresolved lookup may be retried')
  assert.equal(enriched.candidates.length, 1, 'unknown country joins the one matching exact-ticker identity')
  assert.equal(enriched.candidates[0].listing_country, 'US', 'the known country is retained for directory verification')

  const conflicting = row('EVT-country-conflict', {
    event_types: ['commercial'], dedup_group: 'STORY-country-enrichment',
    domain: 'moneycontrol.com', source_name: 'Moneycontrol', url: 'https://moneycontrol.com/global-industries-country',
    companies: [{ name: 'Global Industries Inc', ticker: 'GLBI', listing_country: 'IN' }],
  })
  const split = selectRescueCandidates([known, conflicting], NOW)
  assert.equal(split.candidates.length, 2, 'the same ticker stays separate when two known countries conflict')
  assert.equal(new Set(split.candidates.map((candidate) => candidate.identity_key)).size, 2)
}

{
  const ambiguousNameOnly = row('EVT-name-country-conflict', {
    event_types: ['commercial'],
    companies: [
      { name: 'Global Industries Inc', ticker: null, listing_country: 'US' },
      { name: 'Global Industries Corporation', ticker: null, listing_country: 'IN' },
    ],
  })
  const result = selectRescueCandidates([ambiguousNameOnly], NOW)
  assert.equal(result.candidates.length, 0,
    'same-core tickerless companies with conflicting known countries are not assigned by input order')
  assert.equal(result.reconciled.no_identity, 1)
}

{
  const companies = [
    { name: 'Global Industries Inc', ticker: 'GLBI', listing_country: 'US' },
    { name: 'Global Industries Corporation', ticker: 'GLBI', listing_country: 'GB' },
  ]
  const forward = row('EVT-ticker-country-conflict-a', { event_types: ['commercial'], companies })
  const reversed = row('EVT-ticker-country-conflict-b', { event_types: ['commercial'], companies: [...companies].reverse() })
  for (const item of [forward, reversed]) {
    const result = selectRescueCandidates([item], NOW)
    assert.equal(result.candidates.length, 0,
      'conflicting countries on one bare ticker stay ambiguous regardless of saved alias order')
    assert.equal(result.reconciled.no_identity, 1)
  }
}

// Historical replay gate. These committed files are the real partial-day samples used to size the rule.
// The selector must stay in the approved 150–250 daily band and every row must reconcile exactly once.
const repoRoot = path.resolve(import.meta.dirname, '../../..')
const replayCounts: number[] = []
for (const day of ['2026-07-22', '2026-07-23', '2026-07-24']) {
  const file = path.join(repoRoot, 'screener', 'inbox', `${day}_firehose.ndjson`)
  const rows = fs.readFileSync(file, 'utf8').split('\n').flatMap((line) => {
    try { const value = JSON.parse(line); return value?.kind === 'item' ? [value as FeedItem] : [] } catch { return [] }
  })
  const replay = selectRescueCandidates(rows, Date.parse(`${day}T23:59:59Z`), 36)
  replayCounts.push(replay.candidates.length)
  const reconciled = replay.reconciled
  assert.equal(
    reconciled.inboxed + reconciled.outside_score + reconciled.social + reconciled.routine_filing
      + reconciled.duplicate + reconciled.manually_blocked + reconciled.no_identity + reconciled.no_signal + reconciled.candidates,
    reconciled.total,
    `${day} fully reconciles`,
  )
}
const sorted = [...replayCounts].sort((a, b) => a - b)
assert.ok(sorted[1] >= 150 && sorted[1] <= 250, `median ${sorted[1]} stays in the 150–250 gate`)
assert.ok(Math.max(...replayCounts) <= 400, 'historical p95 proxy stays below 400')

console.log(`rescue selector checks passed; replay candidates ${replayCounts.join(', ')}`)
