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
    }, dedup_status: 'new', inboxed: false, ...fields,
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
  })
  const nameB = row('EVT-name-b', {
    headline: 'Acme contract is confirmed by a second outlet', domain: 'ft.com', url: 'https://ft.com/name-b',
    source_name: 'Financial Times', companies: [{ name: 'Acme Corp', ticker: null, listing_country: 'US' }],
    event_types: ['commercial'],
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
    url: sharedUrl, domain: 'one.example',
  })
  const second = row('EVT-same-url-b', {
    companies: [{ name: 'Acme Corp', ticker: null, listing_country: 'US' }], event_types: ['commercial'],
    url: sharedUrl, domain: 'two.example',
  })
  assert.equal(selectRescueCandidates([first, second], NOW).candidates.length, 0,
    'different domain labels on the same URL are not independent reports')
}

{
  const first = row('EVT-publisher-a', {
    companies: [{ name: 'Acme Corp', ticker: null, listing_country: 'US' }],
    event_types: ['commercial'], domain: 'livemint.com', source_name: 'Mint',
  })
  const second = row('EVT-publisher-b', {
    companies: [{ name: 'Acme Corp', ticker: null, listing_country: 'US' }],
    event_types: ['commercial'], domain: 'www.livemint.com', source_name: 'Mint',
    url: 'https://www.livemint.com/acme-copy',
  })
  assert.equal(selectRescueCandidates([first, second], NOW).candidates.length, 0,
    'two host spellings from one publisher are not independent corroboration')
}

{
  const tickerCopy = row('EVT-ticker-copy', { event_types: ['commercial'] })
  const nameCopy = row('EVT-name-copy', {
    companies: [{ name: 'Acme Corporation', ticker: null, listing_country: 'US' }],
    event_types: ['commercial'], domain: 'ft.com', url: 'https://ft.com/acme-copy', source_name: 'Financial Times',
    triage_score: 39,
  })
  const result = selectRescueCandidates([tickerCopy, nameCopy], NOW)
  assert.equal(result.candidates.length, 1, 'tickered and name-only copies of one company/event form one cluster')
  assert.equal(result.candidates[0].event_id, nameCopy.event_id, 'the best story remains the representative')
  assert.equal(result.candidates[0].pool, 'ticker', 'the cluster still uses its saved clean ticker for identity')
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
