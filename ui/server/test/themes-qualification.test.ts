// Evidence-gated Themes first look: heat is context, not admission. Run:
// npx tsx test/themes-qualification.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import { createTheme } from '../src/news/themes/discover'
import { buildCommodityThemesIndex } from '../src/news/themes/commodity-index'
import { buildGeoThemesIndex } from '../src/news/themes/geo-index'
import { deterministicBrief, representativeMembers } from '../src/news/themes/brief'
import { buildSummary, buildThemeDetail, buildThemesIndex } from '../src/news/themes/store'
import { attachValidNarrative } from './themes-fixtures'
import type { Theme, ThemeItemView } from '../src/news/themes/types'

const NOW = new Date('2026-08-04T06:00:00Z')
const now = () => NOW
const hoursAgo = (h: number) => new Date(NOW.getTime() - h * 3_600_000).toISOString().replace(/\.\d{3}Z$/, 'Z')
const co = (name: string, ticker: string | null, listing_country = 'US') => ({ name, ticker, listing_country })

function item(event_id: string, headline: string, opts: Partial<ThemeItemView> = {}): ThemeItemView {
  return {
    event_id,
    dedup_group: opts.dedup_group,
    headline,
    found_at: opts.found_at || hoursAgo(1),
    companies: opts.companies || [],
    event_types: opts.event_types || ['capex'],
    issuer_linkage: opts.issuer_linkage || 'primary',
    triage_score: opts.triage_score ?? 88,
    source_tier: opts.source_tier || 'news',
    source_name: opts.source_name,
    url: opts.url,
    country: opts.country,
    commodities: opts.commodities,
  }
}

function narrativeTheme(id: string, items: ThemeItemView[], name = 'AI Data-Center Capacity Buildout'): Theme {
  const t = createTheme(items, NOW, 'claude')
  t.theme_id = id
  t.name = name
  t.description = 'Chip, power and cooling suppliers are expanding capacity as AI data-center demand rises.'
  t.scores = { freshness: 80, magnitude: 80, breadth: 70, persistence: 65, composite: 75 }
  t.tier = 'hot'
  return attachValidNarrative(t)
}

let passed = 0
function check(name: string, fn: () => void) {
  try { fn(); passed++; console.log(`  ok  ${name}`) }
  catch (error: any) { console.error(`FAIL  ${name}\n      ${error?.stack || error}`); process.exitCode = 1 }
}

const actionable = narrativeTheme('THM-actionable', [
  item('a1', 'Nvidia expands AI data center chip capacity', { companies: [co('Nvidia', 'NVDA')], found_at: hoursAgo(1) }),
  item('a2', 'Vertiv expands AI data center cooling capacity', { companies: [co('Vertiv', 'VRT')], found_at: hoursAgo(2), source_tier: 'company' }),
  item('a3', 'Microsoft expands AI data center power capacity', { companies: [co('Microsoft', 'MSFT')], found_at: hoursAgo(4), source_tier: 'official_data' }),
])

check('coherent current proof plus a ticker-linked first-order direction is actionable', () => {
  const summary = buildSummary(actionable, NOW)
  assert.equal(summary.assessment.status, 'actionable')
  assert.equal(summary.assessment.blockers.length, 0)
  assert.equal(summary.assessment.metrics.recent_6h_flow, 3)
  assert.ok(summary.assessment.metrics.recurring_narrative_token_count >= 2)
  assert.equal(summary.assessment.metrics.narrative_coherence_pct, 100)
  assert.ok(summary.assessment.metrics.first_order_directional_ticker_count >= 1)
  assert.equal(summary.score_components.composite, summary.composite)
  assert.notDeepEqual(summary.score_components, actionable.scores, 'public heat is recomputed from the current thesis core, not a polluted legacy aggregate')
  assert.equal(summary.first_seen, actionable.first_seen, 'public age preserves the immutable theme lifecycle start')
  assert.ok(summary.top_companies.every((c) => 'listing_country' in c && 'mention_count' in c && 'impact_composite' in c && 'last_seen' in c))
})

check('a theme explicitly awaiting revalidation can never remain actionable', () => {
  const staleNarrative = { ...actionable, needs_rename: true }
  const summary = buildSummary(staleNarrative, NOW)
  assert.equal(summary.assessment.status, 'context')
  assert.ok(summary.assessment.blockers.some((b) => b.includes('fresh validator pass')))
})

check('the brief is explicitly provisional while narrative-update classification is pending', () => {
  const pending = { ...actionable, needs_narrative_update: true, pending_narrative_event_ids: ['a3'] }
  const brief = deterministicBrief(pending)
  assert.match(brief, /^Provisional —/)
  assert.equal(buildSummary(pending, NOW).assessment.status, 'forming')
})

check('coherence selects one shared anchor core instead of unioning disconnected sub-narratives', () => {
  const disconnected = narrativeTheme('THM-disconnected', [
    item('solar1', 'Alpha Energy expands solar panel capacity', { companies: [co('Alpha Energy', 'ALPH')] }),
    item('solar2', 'Beta Power expands solar panel capacity', { companies: [co('Beta Power', 'BETA')] }),
    item('cyber1', 'Gamma Security wins cyber breach response contract', { companies: [co('Gamma Security', 'GAMM')], event_types: ['commercial'] }),
    item('cyber2', 'Delta Systems wins cyber breach response contract', { companies: [co('Delta Systems', 'DELT')], event_types: ['commercial'] }),
  ], 'Corporate Investment Wave')
  const summary = buildSummary(disconnected, NOW)
  assert.notEqual(summary.assessment.status, 'actionable')
  assert.equal(summary.assessment.metrics.narrative_support_count, 2)
  assert.equal(summary.assessment.metrics.narrative_coherence_pct, 50)
})

check('evidence beyond the five-minute future-skew allowance is rejected from every gate', () => {
  const futureAt = new Date(NOW.getTime() + 6 * 60_000).toISOString()
  const future = narrativeTheme('THM-future-proof', [
    item('f1', 'Nvidia expands AI data center chip capacity', { companies: [co('Nvidia', 'NVDA')], found_at: futureAt }),
    item('f2', 'Vertiv expands AI data center cooling capacity', { companies: [co('Vertiv', 'VRT')], found_at: futureAt }),
  ])
  const summary = buildSummary(future, NOW)
  assert.notEqual(summary.assessment.status, 'actionable')
  assert.equal(summary.assessment.metrics.unique_evidence_count, 0)
  assert.equal(summary.assessment.metrics.recent_6h_flow, 0)
  assert.deepEqual(summary.evidence, [])
})

check('bare-company detection uses rebuilt proof companies when the persisted projection is stale', () => {
  const companyFeed = narrativeTheme('THM-bare-company', [
    item('bc1', 'Nvidia expands AI data center chip capacity', { companies: [co('Nvidia', 'NVDA')] }),
    item('bc2', 'Nvidia expands AI data center cooling capacity', { companies: [co('Nvidia', 'NVDA')] }),
    item('bc3', 'Nvidia expands AI data center power capacity', { companies: [co('Nvidia', 'NVDA')] }),
  ], 'Nvidia')
  companyFeed.companies = [] // legacy/stale persisted aggregate; buildSummary rebuilds the real projection
  const summary = buildSummary(companyFeed, NOW)
  assert.equal(summary.assessment.status, 'context')
  assert.deepEqual(summary.top_companies.map((c) => c.name), ['Nvidia'])
})

check('the expression company and its source stay visible after company/evidence caps', () => {
  const crowd = [
    'Alpha Systems', 'Beta Systems', 'Gamma Systems', 'Delta Systems', 'Epsilon Systems',
    'Zeta Systems', 'Eta Systems', 'Theta Systems', 'Iota Systems',
  ].map((name) => co(name, null))
  const pinned = narrativeTheme('THM-pinned-expression', [
    item('cap1', 'Consortium expands AI data center capacity in Arizona', { companies: crowd.slice(0, 3), found_at: hoursAgo(1) }),
    item('cap2', 'Consortium expands AI data center capacity in Texas', { companies: crowd.slice(3, 6), found_at: hoursAgo(2) }),
    item('cap3', 'Consortium expands AI data center capacity in Virginia', { companies: crowd.slice(6, 9), found_at: hoursAgo(3) }),
    item('cap4', 'Pinpoint Energy expands AI data center capacity in Ohio', { companies: [co('Pinpoint Energy', 'PINE')], found_at: hoursAgo(5) }),
  ])
  const summary = buildSummary(pinned, NOW)
  assert.equal(summary.assessment.status, 'actionable')
  assert.equal(summary.top_companies.length, 8)
  assert.ok(summary.top_companies.some((c) => c.ticker === 'PINE'), 'the only gate-clearing ticker survives the company cap')
  assert.equal(summary.evidence.length, 4)
  assert.ok(summary.evidence.some((e) => e.event_id === 'cap4'), 'the ticker candidate\'s proof survives the evidence cap')
})

check('a malformed member companies value degrades to no company proof instead of throwing', () => {
  const malformed = {
    ...actionable,
    members: actionable.members.map((member, i) => i === 0 ? { ...member, companies: { corrupt: true } as any } : { ...member }),
  }
  let summary: ReturnType<typeof buildSummary> | undefined
  assert.doesNotThrow(() => { summary = buildSummary(malformed, NOW) })
  assert.ok(summary)
  assert.equal(summary!.member_count, 3)
})

check('raw proof is distinct, verbatim, and bounded; bubble volume counts story families', () => {
  const withCopies = narrativeTheme('THM-proof', [
    item('p1', 'Nvidia expands AI data center chip capacity', { companies: [co('Nvidia', 'NVDA')], dedup_group: 'story-p1' }),
    item('p2', 'Vertiv expands AI data center cooling capacity', { companies: [co('Vertiv', 'VRT')], dedup_group: 'story-p2' }),
    item('p3', 'Microsoft expands AI data center power capacity', { companies: [co('Microsoft', 'MSFT')], dedup_group: 'story-p3' }),
    item('p4', 'Arista expands AI data center network capacity', { companies: [co('Arista Networks', 'ANET')], dedup_group: 'story-p4' }),
  ])
  // Simulate a legacy ledger where a second publisher copy and a lifetime counter both remain inflated.
  withCopies.members.push({ ...withCopies.members[0], event_id: 'publisher-copy', headline: 'Publisher rewrite', dedup_group: 'story-p1' })
  withCopies.member_count_total = 2_858
  const summary = buildSummary(withCopies, NOW)
  assert.equal(summary.member_count, 4, 'one bounded story family = one bubble unit; lifetime volume is not surfaced')
  assert.equal(summary.evidence.length, 4)
  for (const row of summary.evidence) {
    const raw = withCopies.members.find((m) => m.event_id === row.event_id)
    assert.ok(raw, `evidence ${row.event_id} must resolve to a raw member`)
    assert.equal(row.headline, (raw!.headline_en && raw!.headline_en.trim()) || raw!.headline)
    assert.deepEqual(Object.keys(row).sort(), ['event_id', 'found_at', 'headline', 'score', 'source_name', 'source_tier', 'stance', 'url'])
  }
})

check('every evidence row carries its exact publisher and URL when the source supplied them', () => {
  const cited = narrativeTheme('THM-cited-proof', [
    item('cite1', 'Nvidia expands AI data center chip capacity', { companies: [co('Nvidia', 'NVDA')], source_name: 'Company filing', url: 'https://example.test/nvidia-capacity' }),
    item('cite2', 'Vertiv expands AI data center cooling capacity', { companies: [co('Vertiv', 'VRT')], source_name: 'Exchange release', url: 'https://example.test/vertiv-capacity' }),
  ])
  const evidence = buildSummary(cited, NOW).evidence
  assert.deepEqual(evidence.map((row) => [row.source_name, row.url]), [
    ['Company filing', 'https://example.test/nvidia-capacity'],
    ['Exchange release', 'https://example.test/vertiv-capacity'],
  ])
})

check('actionable evidence excludes a high-quality off-narrative row before the Ideas bridge', () => {
  const withContaminant = narrativeTheme('THM-clean-bridge', [
    item('core1', 'Nvidia expands AI data center chip capacity', { companies: [co('Nvidia', 'NVDA')], found_at: hoursAgo(1) }),
    item('core2', 'Vertiv expands AI data center cooling capacity', { companies: [co('Vertiv', 'VRT')], found_at: hoursAgo(2) }),
    item('other', 'Merck wins approval for a new oncology medicine', { companies: [co('Merck', 'MRK')], found_at: hoursAgo(1), event_types: ['regulatory'] }),
  ])
  const summary = buildSummary(withContaminant, NOW)
  assert.equal(summary.assessment.status, 'actionable', 'two of three rows clear the 60% narrative-coherence bar')
  assert.deepEqual(summary.evidence.map((e) => e.event_id).sort(), ['core1', 'core2'])
})

check('high-volume routine boilerplate stays context even with maximum heat', () => {
  const rows = Array.from({ length: 30 }, (_, i) => item(
    `r${i}`,
    `Company ${i}: Board meeting intimation for quarterly results`,
    { companies: [co(`Company ${i}`, `C${i}`)], source_tier: 'primary_filing', dedup_group: `routine-${i}` },
  ))
  const noisy = createTheme(rows, NOW, 'deterministic')
  noisy.theme_id = 'THM-routine'
  noisy.scores = { freshness: 100, magnitude: 100, breadth: 100, persistence: 100, composite: 100 }
  noisy.tier = 'hot'
  noisy.member_count_total = 20_000
  const summary = buildSummary(noisy, NOW)
  assert.equal(summary.assessment.status, 'context')
  assert.equal(summary.assessment.metrics.unique_evidence_count, 0)
  assert.equal(summary.evidence.length, 0)
  assert.ok(summary.assessment.blockers.some((b) => b.includes('versioned, evidence-bound investment thesis')))
})

check('shareholder law-firm solicitations cannot manufacture actionable corroboration', () => {
  const solicitations = narrativeTheme('THM-solicitation', [
    item('l1', 'ACME investors have an opportunity to lead ACME securities fraud lawsuit', { companies: [co('ACME', 'ACME')], event_types: ['litigation_enforcement'] }),
    item('l2', 'Shareholder Alert: Rosen Law investigates claims on behalf of ACME investors', { companies: [co('ACME', 'ACME')], event_types: ['litigation_enforcement'] }),
    item('l3', 'Pomerantz law firm investigates potential claims on behalf of ACME shareholders', { companies: [co('ACME', 'ACME')], event_types: ['litigation_enforcement'] }),
  ], 'ACME Securities Litigation Wave')
  const summary = buildSummary(solicitations, NOW)
  assert.notEqual(summary.assessment.status, 'actionable')
  assert.equal(summary.assessment.metrics.unique_evidence_count, 0)
  assert.equal(summary.evidence.length, 0)
})

check('the public index excludes hot Context and keeps an actionable low-heat thesis', () => {
  const lowHeat = { ...actionable, scores: { ...actionable.scores, composite: 12 }, tier: 'parked' as const }
  const context = createTheme([
    item('c1', 'Alpha board meeting intimation', { companies: [co('Alpha', 'ALPHA')], source_tier: 'primary_filing' }),
    item('c2', 'Beta board meeting intimation', { companies: [co('Beta', 'BETA')], source_tier: 'primary_filing' }),
    item('c3', 'Gamma board meeting intimation', { companies: [co('Gamma', 'GAMMA')], source_tier: 'primary_filing' }),
  ], NOW)
  context.theme_id = 'THM-hot-context'
  context.scores.composite = 99
  context.tier = 'hot'
  const idx = buildThemesIndex([context, lowHeat], now)
  assert.deepEqual(idx.themes.map((t) => t.theme_id), ['THM-actionable'])
})

check('recent off-narrative contamination cannot inflate thesis-supporting activity', () => {
  const contaminated = narrativeTheme('THM-contaminated', [
    item('old1', 'Nvidia expands AI data center chip capacity', { companies: [co('Nvidia', 'NVDA')], found_at: hoursAgo(7) }),
    item('old2', 'Vertiv expands AI data center cooling capacity', { companies: [co('Vertiv', 'VRT')], found_at: hoursAgo(8) }),
    item('old3', 'Microsoft expands AI data center power capacity', { companies: [co('Microsoft', 'MSFT')], found_at: hoursAgo(9) }),
    item('new1', 'Nvidia changes its employee meal policy', { companies: [co('Nvidia', 'NVDA')], found_at: hoursAgo(1) }),
    item('new2', 'Vertiv schedules an investor conference', { companies: [co('Vertiv', 'VRT')], found_at: hoursAgo(2) }),
  ])
  const summary = buildSummary(contaminated, NOW)
  assert.equal(summary.assessment.metrics.recent_6h_flow, 0, 'only narrative-supporting evidence counts as recent flow')
  assert.equal(summary.assessment.metrics.prior_6h_flow, 3)
  assert.equal(summary.assessment.status, 'actionable', 'durable conviction does not expire at the six-hour boundary')
  assert.equal(summary.assessment.metrics.recent_24h_support_count, 3)
  assert.equal(summary.activity, 'new')
  assert.equal(summary.conviction, 'medium', 'visible contaminants cap conviction even though they cannot change activity')
  assert.equal(summary.off_core_member_count, 2)
})

check('within one admission lane, evidence depth outranks heat; six-hour acceleration is not conviction', () => {
  const accelerating = narrativeTheme('THM-accelerating', [
    item('ar1', 'ChipCo expands AI data center chip capacity', { companies: [co('ChipCo', null)], found_at: hoursAgo(1) }),
    item('ar2', 'CoolCo expands AI data center cooling capacity', { companies: [co('CoolCo', null)], found_at: hoursAgo(2) }),
  ])
  accelerating.scores.composite = 10
  const decelerating = narrativeTheme('THM-decelerating', [
    item('dr1', 'PowerCo expands AI data center power capacity', { companies: [co('PowerCo', null)], found_at: hoursAgo(5) }),
    item('dr2', 'GridCo expands AI data center grid capacity', { companies: [co('GridCo', null)], found_at: hoursAgo(7) }),
    item('dr3', 'CoolCo expands AI data center cooling capacity', { companies: [co('CoolCo', null)], found_at: hoursAgo(8) }),
  ])
  decelerating.scores.composite = 99
  const idx = buildThemesIndex([decelerating, accelerating], now)
  assert.equal(idx.themes[0].theme_id, 'THM-decelerating')
  assert.equal(idx.themes[0].assessment.status, 'forming')
  assert.equal(idx.themes[1].assessment.status, 'forming')
})

check('geo slice derives assessment, proof and company facts only from sliced members', () => {
  const mixed = narrativeTheme('THM-geo-slice', [
    item('us1', 'Nvidia expands AI data center chip capacity', { companies: [co('Nvidia', 'NVDA', 'US')], country: 'US' }),
    item('us2', 'Vertiv expands AI data center cooling capacity', { companies: [co('Vertiv', 'VRT', 'US')], country: 'US' }),
    item('us3', 'Microsoft expands AI data center power capacity', { companies: [co('Microsoft', 'MSFT', 'US')], country: 'US' }),
    item('hk1', 'HK Grid expands AI data center transmission capacity', { companies: [co('HK Grid', '1234.HK', 'HK')], country: 'HK', found_at: hoursAgo(4) }),
    item('hk2', 'HK Cooling expands AI data center cooling capacity', { companies: [co('HK Cooling', '2345.HK', 'HK')], country: 'HK', found_at: hoursAgo(5) }),
  ])
  const row = buildGeoThemesIndex([mixed], { country: 'HK' }, now).themes[0]
  assert.equal(row.member_count, 2)
  assert.equal(row.assessment.metrics.unique_evidence_count, 2)
  assert.deepEqual(row.evidence.map((e) => e.event_id).sort(), ['hk1', 'hk2'])
  assert.deepEqual(row.top_companies.map((c) => c.ticker).sort(), ['1234.HK', '2345.HK'])
  assert.equal(row.first_seen, mixed.first_seen, 'a slice cannot reset an established theme lifecycle')
})

check('an exact-provenance unconfirmed challenge stays visible and caps conviction, but cannot add support', () => {
  const challenged = narrativeTheme('THM-unconfirmed-challenge', [
    item('uc1', 'Nvidia expands AI data center chip capacity', { companies: [co('Nvidia', 'NVDA')], source_tier: 'primary_filing' }),
    item('uc2', 'Vertiv expands AI data center cooling capacity', { companies: [co('Vertiv', 'VRT')], source_tier: 'company' }),
    item('uc3', 'Supplier channel check denies AI data center capacity demand', {
      companies: [co('Supplier', null)], source_tier: 'unconfirmed', source_name: 'Named channel source', url: 'https://example.test/challenge',
    }),
  ])
  challenged.narrative!.evidence = [
    { event_id: 'uc1', stance: 'supports' },
    { event_id: 'uc2', stance: 'supports' },
    { event_id: 'uc3', stance: 'challenges' },
  ]
  const summary = buildSummary(challenged, NOW)
  assert.equal(summary.assessment.metrics.narrative_support_count, 2)
  assert.ok(summary.evidence.some((row) => row.event_id === 'uc3' && row.stance === 'challenges'))
  assert.notEqual(summary.conviction, 'high')
})

check('unconfirmed or anonymous rows never increase narrative support', () => {
  const weak = narrativeTheme('THM-weak-support', [
    item('ws1', 'Nvidia expands AI data center chip capacity', { companies: [co('Nvidia', 'NVDA')], source_tier: 'unconfirmed' }),
    item('ws2', 'Vertiv expands AI data center cooling capacity', { companies: [co('Vertiv', 'VRT')], source_tier: 'unconfirmed' }),
  ])
  assert.equal(buildSummary(weak, NOW).assessment.metrics.narrative_support_count, 0)
  weak.members[0].tier = 'news'
  weak.members[1].tier = 'news'
  delete weak.members[0].source_name; delete weak.members[0].url
  delete weak.members[1].source_name; delete weak.members[1].url
  assert.equal(buildSummary(weak, NOW).assessment.metrics.narrative_support_count, 0)
})

check('a support row needs both a named source and a valid HTTP(S) URL to contribute to actionability', () => {
  const assertRejected = (suffix: string, corrupt: (member: Theme['members'][number]) => void) => {
    const theme = narrativeTheme(`THM-provenance-${suffix}`, [
      item(`${suffix}-1`, 'Nvidia expands AI data center chip capacity', { companies: [co('Nvidia', 'NVDA')] }),
      item(`${suffix}-2`, 'Vertiv expands AI data center cooling capacity', { companies: [co('Vertiv', 'VRT')] }),
    ])
    assert.equal(buildSummary(theme, NOW).assessment.status, 'actionable', `${suffix}: control fixture must clear every gate`)
    corrupt(theme.members[0])
    const summary = buildSummary(theme, NOW)
    assert.equal(summary.assessment.metrics.unique_evidence_count, 1, `${suffix}: the unauditable row is not evidence`)
    assert.ok(summary.assessment.metrics.narrative_support_count < 2, `${suffix}: the unauditable row cannot complete a corroborated support core`)
    assert.notEqual(summary.assessment.status, 'actionable', `${suffix}: one auditable support row cannot seed an idea`)
    assert.ok(!summary.evidence.some((row) => row.event_id === `${suffix}-1`), `${suffix}: the unauditable row is not displayed as proof`)
  }

  assertRejected('missing-name', (member) => { delete member.source_name })
  assertRejected('missing-url', (member) => { delete member.url })
  assertRejected('invalid-url', (member) => { member.url = 'ftp://example.test/not-a-citation' })
  assertRejected('hostless-https-url', (member) => { member.url = 'https://' })
  assertRejected('hostless-http-url', (member) => { member.url = 'http://' })
})

check('commodity slice does not leak another commodity\'s proof or company aggregate', () => {
  const mixed = narrativeTheme('THM-commodity-slice', [
    item('g1', 'GoldCo expands gold mine output capacity', { companies: [co('GoldCo', 'GOLD')], commodities: ['GOLD'] }),
    item('g2', 'BullionCo expands gold mine export capacity', { companies: [co('BullionCo', 'BULL')], commodities: ['GOLD'] }),
    item('s1', 'SugarCo expands sugar mill output capacity', { companies: [co('SugarCo', 'SUGAR')], commodities: ['SUGAR'] }),
    item('s2', 'SweetCo expands sugar mill export capacity', { companies: [co('SweetCo', 'SWEET')], commodities: ['SUGAR'] }),
    item('s3', 'CaneCo expands sugar mill crushing capacity', { companies: [co('CaneCo', 'CANE')], commodities: ['SUGAR'] }),
  ], 'Commodity Capacity Expansion')
  const row = buildCommodityThemesIndex([mixed], { commodity: 'GOLD' }, now).themes[0]
  assert.equal(row.assessment.metrics.unique_evidence_count, 2)
  assert.deepEqual(row.evidence.map((e) => e.event_id).sort(), ['g1', 'g2'])
  assert.deepEqual(row.top_companies.map((c) => c.ticker).sort(), ['BULL', 'GOLD'])
  assert.equal(row.member_count, 2)
})

check('geo and commodity history/counts exclude classified context while retaining raw heat separately', () => {
  const old = hoursAgo(24 * 60)
  const scoped = narrativeTheme('THM-scoped-history', [
    item('sh1', 'GoldCo expands gold mine output capacity', { companies: [co('GoldCo', 'GOLD')], country: 'US', commodities: ['GOLD'] }),
    item('sh2', 'BullionCo expands gold mine export capacity', { companies: [co('BullionCo', 'BULL')], country: 'US', commodities: ['GOLD'] }),
    item('sh-context', 'Gold industry conference agenda published', { country: 'US', commodities: ['GOLD'], found_at: old }),
  ], 'Gold Mine Capacity Expansion')
  scoped.narrative!.context_event_ids.push('sh-context')
  const geo = buildGeoThemesIndex([scoped], { country: 'US' }, now)
  const commodity = buildCommodityThemesIndex([scoped], { commodity: 'GOLD' }, now)
  assert.equal(geo.history_days, 1)
  assert.equal(commodity.history_days, 1)
  assert.equal(geo.themes[0].member_count, 2)
  assert.equal(commodity.themes[0].member_count, 2)
  assert.ok(geo.themes[0].heat_flow_daily.reduce((sum, value) => sum + value, 0) > geo.themes[0].flow_daily.reduce((sum, value) => sum + value, 0))
  assert.ok(commodity.themes[0].heat_flow_daily.reduce((sum, value) => sum + value, 0) > commodity.themes[0].flow_daily.reduce((sum, value) => sum + value, 0))
})

check('older structural proof plus one fresh official update stays actionable and is reinforced without two rows in six hours', () => {
  const durable = narrativeTheme('THM-durable-13d', [
    item('structural-1', 'GridCo expands AI data center power capacity', { companies: [co('GridCo', 'GRID')], found_at: hoursAgo(24 * 30), source_tier: 'primary_filing' }),
    item('structural-2', 'CoolCo expands AI data center cooling capacity', { companies: [co('CoolCo', 'COOL')], found_at: hoursAgo(24 * 20), source_tier: 'company' }),
    item('official-now', 'Energy Department confirms AI data center power capacity program', { companies: [], found_at: hoursAgo(2), source_tier: 'official_data' }),
  ])
  durable.first_seen = hoursAgo(24 * 60)
  durable.narrative!.why_now = 'An official update confirms the same capacity constraint is still active.'
  durable.narrative!.why_now_event_id = 'official-now'
  const summary = buildSummary(durable, NOW)
  assert.equal(summary.assessment.status, 'actionable')
  assert.equal(summary.assessment.metrics.recent_6h_flow, 1)
  assert.equal(summary.activity, 'reinforced')
  assert.ok(summary.evidence.some((row) => row.event_id === 'official-now' && row.stance === 'supports'))
})

check('a quiet but fully evidenced thesis remains actionable and watchable', () => {
  const quiet = narrativeTheme('THM-quiet-durable', [
    item('quiet-1', 'GridCo expands AI data center power capacity', { companies: [co('GridCo', 'GRID')], found_at: hoursAgo(72), source_tier: 'primary_filing' }),
    item('quiet-2', 'CoolCo expands AI data center cooling capacity', { companies: [co('CoolCo', 'COOL')], found_at: hoursAgo(96), source_tier: 'company' }),
  ])
  quiet.first_seen = hoursAgo(24 * 90)
  const summary = buildSummary(quiet, NOW)
  assert.equal(summary.assessment.status, 'actionable')
  assert.equal(summary.activity, 'quiet')
  assert.ok(['high', 'medium'].includes(summary.conviction))
  assert.deepEqual(buildThemesIndex([quiet], now).themes.map((row) => row.theme_id), ['THM-quiet-durable'])
})

check('causal expressions require a mechanism and exact supporting IDs that name the company', () => {
  const invalid = narrativeTheme('THM-expression-contract', [
    item('expr-1', 'Nvidia expands AI data center chip capacity', { companies: [co('Nvidia', 'NVDA')] }),
    item('expr-2', 'Vertiv expands AI data center cooling capacity', { companies: [co('Vertiv', 'VRT')] }),
  ])
  invalid.narrative!.expressions = [
    { name_key: 'nvidia', side: 'beneficiary', role: 'direct', mechanism: '', evidence_event_ids: ['expr-1'] },
    { name_key: 'vertiv', side: 'beneficiary', role: 'bottleneck', mechanism: 'Cooling orders transmit capacity demand into revenue.', evidence_event_ids: ['expr-1'] },
  ]
  let summary = buildSummary(invalid, NOW)
  assert.equal(summary.assessment.status, 'forming')
  assert.deepEqual(summary.qualified_expressions, [])

  invalid.narrative!.expressions = [{
    name_key: 'vertiv', side: 'beneficiary', role: 'bottleneck',
    mechanism: 'Cooling orders transmit capacity demand into revenue.', evidence_event_ids: ['expr-2'],
  }]
  summary = buildSummary(invalid, NOW)
  assert.equal(summary.assessment.status, 'actionable')
  assert.deepEqual(summary.qualified_expressions.map((expression) => ({
    ticker: expression.ticker,
    mechanism: expression.mechanism,
    evidence_event_ids: expression.evidence_event_ids,
  })), [{
    ticker: 'VRT',
    mechanism: 'Cooling orders transmit capacity demand into revenue.',
    evidence_event_ids: ['expr-2'],
  }])
})

check('off-core rows and companies never leak into summary, detail or brief projections', () => {
  const contaminated = narrativeTheme('THM-off-core-boundary', [
    item('ai-1', 'Nvidia expands AI data center chip capacity', { companies: [co('Nvidia', 'NVDA')], found_at: hoursAgo(4) }),
    item('ai-2', 'Vertiv expands AI data center cooling capacity', { companies: [co('Vertiv', 'VRT')], found_at: hoursAgo(5) }),
    item('meta-law', 'Meta faces youth social media addiction lawsuit', { companies: [co('Meta Platforms', 'META')], found_at: hoursAgo(3), event_types: ['litigation_enforcement'] }),
    item('anthropic-hack', 'Anthropic says hackers abused Claude in cyber attacks', { companies: [co('Anthropic', null)], found_at: hoursAgo(3), event_types: ['cyber'] }),
  ])
  contaminated.narrative!.thesis = 'AI data-center capacity spending is increasing demand for chips and cooling equipment.'
  contaminated.narrative!.why_now = 'Vertiv reported another AI data-center cooling capacity expansion.'
  contaminated.narrative!.why_now_event_id = 'ai-2'

  const summary = buildSummary(contaminated, NOW)
  assert.deepEqual(summary.evidence.map((row) => row.event_id).sort(), ['ai-1', 'ai-2'])
  assert.deepEqual(summary.top_companies.map((company) => company.ticker).sort(), ['NVDA', 'VRT'])
  assert.equal(summary.off_core_member_count, 2)

  const detail = buildThemeDetail('/nonexistent-themes-fixture-repo', contaminated)
  assert.deepEqual(detail.members.map((member) => member.event_id).sort(), ['ai-1', 'ai-2'])
  const detailCompanies = Object.values(detail.companies_by_order).flat()
  assert.equal(detailCompanies.length, 1)
  assert.equal(detailCompanies[0].name_key, contaminated.narrative!.expressions[0].name_key)
  assert.ok(!detailCompanies.some((company) => company.ticker === 'META' || company.name === 'Anthropic'))
  assert.deepEqual(representativeMembers(contaminated).map((member) => member.event_id).sort(), ['ai-1', 'ai-2'])
  const brief = deterministicBrief(contaminated)
  assert.doesNotMatch(brief, /Meta|lawsuit|Anthropic|hack/i)
})

console.log(`\nthemes-qualification: ${passed} checks passed`)
