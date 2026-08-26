// Geography-sliced themes index (news/themes/geo-index.ts): a country/continent filter re-ranks + re-sizes
// the SAME themes by that geography's news flow, and drops themes with no flow there. Also covers the
// member-country resolution (stored key, or lazily from a headline/company for legacy members) and that
// assignThemes now persists the country onto each member. In-memory, no network, no LLM.
// Run: npx tsx test/themes-geo.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import { buildGeoThemesIndex, memberCountry, memberMatchesGeo, hasThemeGeo } from '../src/news/themes/geo-index'
import { assignThemes } from '../src/news/themes/assign'
import type { Theme, ThemeItemView, ThemeMember } from '../src/news/themes/types'
import { attachValidNarrative } from './themes-fixtures'

let passed = 0
function check(name: string, fn: () => void): void {
  try { fn(); passed++; console.log(`  ok  ${name}`) }
  catch (e: any) { console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`); process.exitCode = 1 }
}

const NOW = new Date('2026-07-01T12:00:00Z')
const now = () => NOW
const hoursAgo = (h: number) => new Date(NOW.getTime() - h * 3_600_000).toISOString().replace(/\.\d{3}Z$/, 'Z')

function member(id: string, opts: Partial<ThemeMember> = {}): ThemeMember {
  return {
    event_id: id,
    dedup_group: opts.dedup_group,
    headline: opts.headline || `AI data center capacity update ${id}`,
    headline_en: opts.headline_en,
    found_at: opts.found_at || hoursAgo(1),
    score: opts.score ?? 70,
    tier: opts.tier || 'news',
    companies: opts.companies || [],
    event_types: opts.event_types || [],
    issuer_linkage: opts.issuer_linkage ?? 'primary',
    country: opts.country,
    region: opts.region,
  }
}

function theme(id: string, name: string, members: ThemeMember[], opts: Partial<Theme> = {}): Theme {
  const last = members.reduce((mx, m) => (m.found_at > mx ? m.found_at : mx), '')
  const result: Theme = {
    theme_id: id, name, slug: name.toLowerCase().replace(/\s+/g, '-'), description: `${name} — what it is`,
    keywords: opts.keywords || [], company_keys: opts.company_keys || [], event_type_affinity: opts.event_type_affinity || [],
    members, member_count_total: members.length,
    companies: opts.companies || [], sectors: [],
    scores: { freshness: 0, magnitude: 0, breadth: 0, persistence: 0, composite: 50 },
    tier: 'active', fresh_flow: 0, flow_series: [], flow_daily: [], related_themes: [],
    status: opts.status || 'live', merged_into: null, first_seen: opts.first_seen || hoursAgo(48),
    last_flow: last, generation: 'deterministic', rev: 1,
  }
  if (members.length >= 2) attachValidNarrative(result)
  return result
}

const us = theme('THM-usaa1111', 'US thing', [member('u1', { country: 'US' }), member('u2', { country: 'US' })])
const hk = theme('THM-hkaa2222', 'HK thing', [member('h1', { country: 'HK' }), member('h2', { country: 'HK' }), member('h3', { country: 'HK' })])
const inn = theme('THM-inaa3333', 'India thing', [member('i1', { country: 'IN' }), member('i2', { country: 'IN' })])
const mixed = theme('THM-mxaa4444', 'Mixed', [
  member('mh1', { country: 'HK' }), member('mh2', { country: 'HK' }),
  member('mi1', { country: 'IN' }), member('mi2', { country: 'IN' }),
  member('mu1', { country: 'US' }), member('mu2', { country: 'US' }),
])

// ---- country slice ----
check('country slice: keeps only themes with members in that country, dropping the rest', () => {
  const idx = buildGeoThemesIndex([us, hk], { country: 'HK' }, now)
  assert.equal(idx.themes.length, 1)
  assert.equal(idx.themes[0].theme_id, 'THM-hkaa2222')
})

check('country slice: member_count is the geo member count, not the theme total', () => {
  const idx = buildGeoThemesIndex([mixed], { country: 'HK' }, now)
  assert.equal(idx.themes.length, 1)
  assert.equal(idx.themes[0].member_count, 2) // only the two HK members of the six
})

check('country slice dedupes story families before company placement and qualification', () => {
  const acme = { name: 'Acme HK', ticker: 'ACME', listing_country: 'HK' }
  const duplicated = theme('THM-duphk111', 'HK duplicate proof', [
    member('d1', { dedup_group: 'story-a', country: 'HK', companies: [acme] }),
    member('d1-copy', { dedup_group: 'story-a', country: 'HK', companies: [acme] }),
    member('d2', { dedup_group: 'story-b', country: 'HK', companies: [acme] }),
  ])
  const summary = buildGeoThemesIndex([duplicated], { country: 'HK' }, now).themes[0]
  assert.equal(summary.member_count, 2)
  assert.equal(summary.top_companies[0]?.mention_count, 2, 'a publisher copy cannot inflate sliced company centrality')
})

check('country slice cannot resurrect support invalidated by a challenge outside that geography', () => {
  const acme = { name: 'Acme HK', ticker: 'ACME', listing_country: 'HK' }
  const challenged = theme('THM-statehk1', 'HK state-bound proof', [
    member('hk-old-support', { dedup_group: 'state-family', country: 'HK', companies: [acme], found_at: hoursAgo(4) }),
    member('hk-peer-support', { dedup_group: 'state-peer', country: 'HK', companies: [acme], found_at: hoursAgo(3) }),
    member('us-current-challenge', { dedup_group: 'state-family', country: 'US', companies: [acme], found_at: hoursAgo(1), headline: 'Acme cancels AI data center capacity expansion' }),
  ])
  attachValidNarrative(challenged, {
    support_event_ids: ['hk-old-support', 'hk-peer-support'],
    challenge_event_ids: ['us-current-challenge'],
    why_now_event_id: 'hk-old-support',
  })
  assert.equal(buildGeoThemesIndex([challenged], { country: 'HK' }, now).themes.length, 0, 'global active family state removes obsolete HK support')
})

check('country slice cannot borrow a later global restoration from the same family', () => {
  const acme = { name: 'Acme HK', ticker: 'ACME', listing_country: 'HK' }
  const restoredElsewhere = theme('THM-resthk1', 'HK state-bound restoration', [
    member('hk-rest-old', { dedup_group: 'rest-state-family', country: 'HK', companies: [acme], found_at: hoursAgo(5) }),
    member('hk-rest-peer', { dedup_group: 'rest-state-peer', country: 'HK', companies: [acme], found_at: hoursAgo(4) }),
    member('us-rest-challenge', { dedup_group: 'rest-state-family', country: 'US', companies: [acme], found_at: hoursAgo(3), headline: 'Acme cancels AI data center capacity expansion' }),
    member('us-rest-support', { dedup_group: 'rest-state-family', country: 'US', companies: [acme], found_at: hoursAgo(1), headline: 'Acme reinstates AI data center capacity expansion' }),
  ])
  attachValidNarrative(restoredElsewhere, { support_event_ids: ['hk-rest-old', 'hk-rest-peer'] })
  restoredElsewhere.narrative!.evidence.push(
    { event_id: 'us-rest-challenge', stance: 'challenges' },
    { event_id: 'us-rest-support', stance: 'supports' },
  )
  restoredElsewhere.narrative!.why_now_event_id = 'us-rest-support'
  restoredElsewhere.narrative!.expressions[0].evidence_event_ids = ['us-rest-support']
  assert.equal(buildGeoThemesIndex([restoredElsewhere], { country: 'HK' }, now).themes.length, 0,
    'the exact active US restoration is not HK proof merely because its family has an old HK row')
})

check('country slice: a lowercase query param still matches (server upstreams uppercase, be defensive)', () => {
  const idx = buildGeoThemesIndex([hk], { country: 'hk' }, now)
  assert.equal(idx.themes.length, 1)
})

// ---- continent rollup (same map the archive filter uses) ----
check('continent slice: Asia includes HK + IN, excludes US', () => {
  const idx = buildGeoThemesIndex([us, hk, inn], { geoRegion: 'Asia' }, now)
  assert.deepEqual(idx.themes.map((t) => t.theme_id).sort(), ['THM-hkaa2222', 'THM-inaa3333'])
})

check('continent slice: North America includes US, excludes HK/IN', () => {
  const idx = buildGeoThemesIndex([us, hk, inn], { geoRegion: 'North America' }, now)
  assert.deepEqual(idx.themes.map((t) => t.theme_id), ['THM-usaa1111'])
})

// ---- legacy members (no stored country) resolve lazily, same as the archive ----
check('legacy member: country resolved from a place named in the headline (gazetteer)', () => {
  const legacy = theme('THM-lgaa5555', 'Legacy HK', [
    member('l1', { headline: 'Hong Kong exchange listing demand rises' }),
    member('l2', { headline: 'Hong Kong exchange listing demand expands' }),
  ])
  const idx = buildGeoThemesIndex([legacy], { country: 'HK' }, now)
  assert.equal(idx.themes.length, 1)
})

check('legacy member: country resolved from a primary single-company listing_country', () => {
  const company = { name: 'Foo Ltd', ticker: 'FOO', listing_country: 'HK' } as any
  const legacy = theme('THM-lgaa6666', 'Legacy co', [
    member('lc1', { headline: 'Network capacity investment rises', issuer_linkage: 'primary', companies: [company] }),
    member('lc2', { headline: 'Network capacity investment expands', issuer_linkage: 'primary', companies: [company] }),
  ])
  const idx = buildGeoThemesIndex([legacy], { country: 'HK' }, now)
  assert.equal(idx.themes.length, 1)
})

// ---- ranking ----
check('ranking: the bigger, fresher geo theme sorts first', () => {
  const big = theme('THM-bgaa7777', 'Big HK', [
    member('b1', { country: 'HK', found_at: hoursAgo(0), score: 90, tier: 'primary_filing' }),
    member('b2', { country: 'HK', found_at: hoursAgo(0), score: 90, tier: 'primary_filing' }),
    member('b3', { country: 'HK', found_at: hoursAgo(0), score: 90, tier: 'primary_filing' }),
  ], { companies: [{ name: 'A', ticker: 'A', listing_country: 'HK', order: 1, side: 'beneficiary' } as any, { name: 'B', ticker: 'B', listing_country: 'HK', order: 1, side: 'beneficiary' } as any] })
  const small = theme('THM-smaa8888', 'Small HK', [
    member('s1', { country: 'HK', found_at: hoursAgo(40), score: 40, tier: 'news' }),
    member('s2', { country: 'HK', found_at: hoursAgo(41), score: 40, tier: 'news' }),
  ])
  const idx = buildGeoThemesIndex([small, big], { country: 'HK' }, now)
  assert.equal(idx.themes[0].theme_id, 'THM-bgaa7777')
  assert.ok(idx.themes[0].composite >= idx.themes[1].composite)
})

check('Where scopes what the evidence is about and preserves a cross-border listed expression', () => {
  const nvidia = { name: 'Nvidia', ticker: 'NVDA', listing_country: 'US' } as any
  const t = theme('THM-coaa9999', 'India AI capacity', [
    member('c1', { country: 'IN', companies: [nvidia], headline: 'India AI data center capacity requires Nvidia accelerators' }),
    member('c2', { country: 'IN', companies: [nvidia], headline: 'India AI data center capacity expands Nvidia accelerator demand' }),
  ], { companies: [{ ...nvidia, order: 1, side: 'beneficiary' } as any] })
  const proof = t.members.find((member) => member.event_id === t.narrative!.expressions[0].evidence_event_ids[0])!
  t.player_contract_version = 1
  t.players = [{
    name: 'Nvidia', ticker: 'NVDA', listing_status: 'verified_public', order: 1, side: 'beneficiary',
    relationship: 'direct_subject', mechanism: t.narrative!.expressions[0].mechanism,
    mechanism_basis: 'engine_inference', idea_eligible: true,
    evidence: [{ kind: 'news', event_id: proof.event_id, headline: proof.headline, publisher: proof.source_name!, url: proof.url!, published_at: proof.found_at, source_ref: null, source_file: null }],
  }]
  const summary = buildGeoThemesIndex([t], { country: 'IN' }, now).themes[0]
  assert.equal(summary.assessment.status, 'actionable')
  assert.deepEqual(summary.top_companies.map((c) => c.ticker), ['NVDA'])
  assert.deepEqual(summary.qualified_expressions.map((expression) => expression.ticker), ['NVDA'])
})

check('non-live themes are never included', () => {
  const retired = theme('THM-rtaa0000', 'Retired HK', [member('r1', { country: 'HK' })], { status: 'retired' })
  const idx = buildGeoThemesIndex([retired], { country: 'HK' }, now)
  assert.equal(idx.themes.length, 0)
})

// ---- unit helpers ----
check('memberCountry: stored key, headline place, single-company listing, else null', () => {
  assert.equal(memberCountry(member('x', { country: 'HK' })), 'HK')
  assert.equal(memberCountry(member('x', { headline: 'Singapore listing surge continues' })), 'SG')
  assert.equal(memberCountry(member('x', { headline: 'earnings', issuer_linkage: 'primary', companies: [{ name: 'X', ticker: 'X', listing_country: 'JP' } as any] })), 'JP')
  assert.equal(memberCountry(member('x')), null)
})

check('memberCountry: legacy member with only a domain region reproduces the archive floor (region → country)', () => {
  // an item whose ONLY geography signal is its source region (no stored country, no place, no company) must
  // resolve the SAME as the archive (resolveCountry step c) — else the geo Themes slice under-counts vs Events.
  assert.equal(memberCountry(member('x', { region: 'IN', country: undefined, issuer_linkage: 'sector', companies: [] })), 'IN')
  assert.equal(memberCountry(member('x', { region: 'US', country: undefined, issuer_linkage: 'sector', companies: [] })), 'US')
  // GLOBAL / OTHER carry no representative country → still null (honest, not a forced bucket)
  assert.equal(memberCountry(member('x', { region: 'GLOBAL', country: undefined, issuer_linkage: 'sector', companies: [] })), null)
})

check('geo slice: a region-floor-only member is INCLUDED (matches the archive Events list)', () => {
  const t = theme('THM-flaa1313', 'Floor only', [
    member('f1', { region: 'IN', country: undefined, issuer_linkage: 'sector', companies: [], headline: 'BSE market capacity investment rises' }),
    member('f2', { region: 'IN', country: undefined, issuer_linkage: 'sector', companies: [], headline: 'BSE market capacity investment expands' }),
  ])
  assert.equal(buildGeoThemesIndex([t], { country: 'IN' }, now).themes.length, 1)
  assert.equal(buildGeoThemesIndex([t], { geoRegion: 'Asia' }, now).themes.length, 1)
})

check('assignThemes persists the domain region floor onto the new member', () => {
  const live = theme('THM-rgaa1414', 'Reg floor', [
    member('rf1', { headline: 'Refinery petrochemical output rises', region: 'IN' }),
    member('rf2', { headline: 'Refinery petrochemical output expands', region: 'IN' }),
  ], { keywords: ['reliance', 'refinery', 'petrochemical'], event_type_affinity: ['operational'] })
  const it: ThemeItemView = { event_id: 'e2', headline: 'Reliance refinery petrochemical output', found_at: hoursAgo(1), companies: [], event_types: ['operational'], issuer_linkage: 'sector', triage_score: 75, source_tier: 'news', region: 'IN', country: null }
  assignThemes([it], [live], undefined, NOW)
  const landed = live.members.find((row) => row.event_id === 'e2')!
  assert.equal(live.members.length, 3)
  assert.equal(landed.region, 'IN')
  assert.equal(memberCountry(landed), 'IN') // floor reproduces the country
})

check('memberMatchesGeo: country exact, continent rollup', () => {
  assert.equal(memberMatchesGeo(member('x', { country: 'HK' }), { country: 'HK' }), true)
  assert.equal(memberMatchesGeo(member('x', { country: 'US' }), { country: 'HK' }), false)
  assert.equal(memberMatchesGeo(member('x', { country: 'HK' }), { geoRegion: 'Asia' }), true)
  assert.equal(memberMatchesGeo(member('x', { country: 'US' }), { geoRegion: 'Asia' }), false)
})

check('hasThemeGeo', () => {
  assert.equal(hasThemeGeo(null), false)
  assert.equal(hasThemeGeo({}), false)
  assert.equal(hasThemeGeo({ country: 'HK' }), true)
  assert.equal(hasThemeGeo({ geoRegion: 'Asia' }), true)
})

// ---- the persistence assignThemes now writes ----
check('assignThemes persists the item country onto the new member', () => {
  const live = theme('THM-asaa1212', 'Semiconductors', [
    member('as1', { headline: 'Semiconductor datacenter expansion rises', country: 'US' }),
    member('as2', { headline: 'Semiconductor datacenter expansion broadens', country: 'US' }),
  ], { keywords: ['nvidia', 'semiconductor', 'datacenter'], event_type_affinity: ['product'] })
  const it: ThemeItemView = { event_id: 'e1', headline: 'Nvidia semiconductor datacenter expansion announced', found_at: hoursAgo(1), companies: [], event_types: ['product'], issuer_linkage: 'primary', triage_score: 80, source_tier: 'news', country: 'US' }
  const res = assignThemes([it], [live], undefined, NOW)
  assert.ok(res.touched.has('THM-asaa1212'))
  assert.equal(live.members.length, 3)
  assert.equal(live.members.find((row) => row.event_id === 'e1')?.country, 'US')
})

console.log(`\nthemes-geo: ${passed} checks passed`)
