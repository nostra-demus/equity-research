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
    headline: opts.headline || 'a headline with no place named',
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
  return {
    theme_id: id, name, slug: name.toLowerCase().replace(/\s+/g, '-'), description: `${name} — what it is`,
    keywords: opts.keywords || [], company_keys: opts.company_keys || [], event_type_affinity: opts.event_type_affinity || [],
    members, member_count_total: members.length,
    companies: opts.companies || [], sectors: [],
    scores: { freshness: 0, magnitude: 0, breadth: 0, persistence: 0, composite: 50 },
    tier: 'active', fresh_flow: 0, flow_series: [], flow_daily: [], related_themes: [],
    status: opts.status || 'live', merged_into: null, first_seen: opts.first_seen || hoursAgo(48),
    last_flow: last, generation: 'deterministic', rev: 1,
  }
}

const us = theme('THM-usaa1111', 'US thing', [member('u1', { country: 'US' }), member('u2', { country: 'US' })])
const hk = theme('THM-hkaa2222', 'HK thing', [member('h1', { country: 'HK' }), member('h2', { country: 'HK' }), member('h3', { country: 'HK' })])
const inn = theme('THM-inaa3333', 'India thing', [member('i1', { country: 'IN' })])
const mixed = theme('THM-mxaa4444', 'Mixed', [member('m1', { country: 'HK' }), member('m2', { country: 'IN' }), member('m3', { country: 'US' })])

// ---- country slice ----
check('country slice: keeps only themes with members in that country, dropping the rest', () => {
  const idx = buildGeoThemesIndex([us, hk], { country: 'HK' }, now)
  assert.equal(idx.themes.length, 1)
  assert.equal(idx.themes[0].theme_id, 'THM-hkaa2222')
})

check('country slice: member_count is the geo member count, not the theme total', () => {
  const idx = buildGeoThemesIndex([mixed], { country: 'HK' }, now)
  assert.equal(idx.themes.length, 1)
  assert.equal(idx.themes[0].member_count, 1) // only the one HK member of the 3
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
  const legacy = theme('THM-lgaa5555', 'Legacy HK', [member('l1', { headline: 'Hong Kong exchange sees record listings' })])
  const idx = buildGeoThemesIndex([legacy], { country: 'HK' }, now)
  assert.equal(idx.themes.length, 1)
})

check('legacy member: country resolved from a primary single-company listing_country', () => {
  const legacy = theme('THM-lgaa6666', 'Legacy co', [member('l2', { headline: 'quarterly earnings rise', issuer_linkage: 'primary', companies: [{ name: 'Foo Ltd', ticker: 'FOO', listing_country: 'HK' } as any] })])
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
  const small = theme('THM-smaa8888', 'Small HK', [member('s1', { country: 'HK', found_at: hoursAgo(40), score: 40, tier: 'news' })])
  const idx = buildGeoThemesIndex([small, big], { country: 'HK' }, now)
  assert.equal(idx.themes[0].theme_id, 'THM-bgaa7777')
  assert.ok(idx.themes[0].composite >= idx.themes[1].composite)
})

check('geo top_companies are only the geo-listed names', () => {
  const t = theme('THM-coaa9999', 'Co geo', [member('c1', { country: 'HK' })], {
    companies: [
      { name: 'HK Co', ticker: 'HKC', listing_country: 'HK', order: 1, side: 'beneficiary' } as any,
      { name: 'US Co', ticker: 'USC', listing_country: 'US', order: 1, side: 'beneficiary' } as any,
    ],
  })
  const idx = buildGeoThemesIndex([t], { country: 'HK' }, now)
  assert.deepEqual(idx.themes[0].top_companies.map((c) => c.ticker), ['HKC'])
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
  const t = theme('THM-flaa1313', 'Floor only', [member('f1', { region: 'IN', country: undefined, issuer_linkage: 'sector', companies: [], headline: 'BSE scrip update' })])
  assert.equal(buildGeoThemesIndex([t], { country: 'IN' }, now).themes.length, 1)
  assert.equal(buildGeoThemesIndex([t], { geoRegion: 'Asia' }, now).themes.length, 1)
})

check('assignThemes persists the domain region floor onto the new member', () => {
  const live = theme('THM-rgaa1414', 'Reg floor', [], { keywords: ['reliance', 'refinery', 'petrochemical'], event_type_affinity: ['operational'] })
  const it: ThemeItemView = { event_id: 'e2', headline: 'Reliance refinery petrochemical output', found_at: hoursAgo(1), companies: [], event_types: ['operational'], issuer_linkage: 'sector', triage_score: 75, source_tier: 'news', region: 'IN', country: null }
  assignThemes([it], [live], undefined, NOW)
  assert.equal(live.members.length, 1)
  assert.equal(live.members[0].region, 'IN')
  assert.equal(memberCountry(live.members[0]), 'IN') // floor reproduces the country
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
  const live = theme('THM-asaa1212', 'Semiconductors', [], { keywords: ['nvidia', 'semiconductor', 'datacenter'], event_type_affinity: ['product'] })
  const it: ThemeItemView = { event_id: 'e1', headline: 'Nvidia semiconductor datacenter expansion announced', found_at: hoursAgo(1), companies: [], event_types: ['product'], issuer_linkage: 'primary', triage_score: 80, source_tier: 'news', country: 'US' }
  const res = assignThemes([it], [live], undefined, NOW)
  assert.ok(res.touched.has('THM-asaa1212'))
  assert.equal(live.members.length, 1)
  assert.equal(live.members[0].country, 'US')
})

console.log(`\nthemes-geo: ${passed} checks passed`)
