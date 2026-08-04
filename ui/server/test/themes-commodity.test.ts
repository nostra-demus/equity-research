// Commodity-sliced themes index (news/themes/commodity-index.ts): a canonical-subject filter re-ranks +
// re-sizes the SAME themes by that commodity's news flow and drops themes with none — the commodity
// twin of the geo slice (themes-geo.test.ts, whose construction style this mirrors). Also covers
// member-tag resolution (stored commodities honored, legacy members derived lazily with the SAME tagger
// the feed uses) and composition with the geo filter. In-memory, no network, no LLM.
// Run: npx tsx test/themes-commodity.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import { buildCommodityThemesIndex, memberCommodities, memberMatchesCommodity } from '../src/news/themes/commodity-index'
import type { Theme, ThemeMember } from '../src/news/themes/types'

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
    headline: opts.headline || 'a headline naming no commodity',
    headline_en: opts.headline_en,
    found_at: opts.found_at || hoursAgo(1),
    score: opts.score ?? 70,
    tier: opts.tier || 'news',
    companies: opts.companies || [],
    event_types: opts.event_types || [],
    issuer_linkage: opts.issuer_linkage ?? 'primary',
    country: opts.country,
    region: opts.region,
    commodities: opts.commodities,
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

// ---- member tag resolution ----
check('memberCommodities: stored tags are honored verbatim, never re-derived from the headline', () => {
  assert.deepEqual(memberCommodities(member('m1', { commodities: ['GOLD'], headline: 'Sugar prices surge in India' })), ['GOLD'])
  // an explicit [] is a stored answer ("no canonical subject"), not a missing field — no re-derive
  assert.deepEqual(memberCommodities(member('m2', { commodities: [], headline: 'Sugar prices surge in India' })), [])
})

check("memberCommodities: a legacy member (no field) derives ['SUGAR'] from its own headline", () => {
  assert.deepEqual(memberCommodities(member('m3', { headline: 'Sugar prices surge in India' })), ['SUGAR'])
  assert.deepEqual(memberCommodities(member('m4', { headline: 'a headline naming no commodity' })), [], 'no match → [] (counts toward no slice)')
})

check('memberMatchesCommodity: any-tag slice, one-subject slice, and the untagged member never matches', () => {
  const gold = member('g1', { commodities: ['GOLD'] })
  assert.equal(memberMatchesCommodity(gold, {}), true, 'no subject set → any tagged member counts')
  assert.equal(memberMatchesCommodity(gold, { commodity: 'GOLD' }), true)
  assert.equal(memberMatchesCommodity(gold, { commodity: 'SUGAR' }), false)
  assert.equal(memberMatchesCommodity(member('g2', { commodities: [] }), {}), false, 'an untagged member belongs to NO commodity slice')
})

check('memberMatchesCommodity composes with the geo filter (must match BOTH)', () => {
  const inGold = member('g3', { commodities: ['GOLD'], country: 'IN' })
  assert.equal(memberMatchesCommodity(inGold, { commodity: 'GOLD', geo: { country: 'IN' } }), true)
  assert.equal(memberMatchesCommodity(inGold, { commodity: 'GOLD', geo: { country: 'US' } }), false, 'tagged GOLD but the wrong geography → excluded')
})

// ---- the sliced index ----
const themeA = theme('THM-goldaa11', 'Gold rush', [
  member('a1', { commodities: ['GOLD'] }),
  member('a2', { commodities: ['GOLD'] }),
  member('a3', { commodities: ['GOLD'] }),
  member('a4', { headline: 'a headline naming no commodity' }),
  member('a5', { headline: 'another untagged member' }),
])
const themeB = theme('THM-nonebb22', 'No commodity here', [member('b1'), member('b2')])

check('buildCommodityThemesIndex: theme A carries member_count 3 (its GOLD members), theme B is dropped, counts.total is honest', () => {
  const idx = buildCommodityThemesIndex([themeA, themeB], {}, now)
  assert.equal(idx.themes.length, 1, 'the zero-flow theme is dropped, not shown at zero')
  assert.equal(idx.themes[0].theme_id, 'THM-goldaa11')
  assert.equal(idx.themes[0].member_count, 3, 'sliced member count — the 2 untagged members do not count')
  assert.equal(idx.counts.total, 1, 'counts reflect the sliced index, not the input list')
  assert.equal(idx.counts.hot + idx.counts.active + idx.counts.cooling + idx.counts.parked, 1, 'the included theme lands in exactly one tier')
})

check('commodity slice dedupes story families before company placement and qualification', () => {
  const miner = { name: 'Gold Miner', ticker: 'GOLD', listing_country: 'US' }
  const duplicated = theme('THM-dupgold1', 'Duplicate gold proof', [
    member('d1', { dedup_group: 'story-a', commodities: ['GOLD'], companies: [miner] }),
    member('d1-copy', { dedup_group: 'story-a', commodities: ['GOLD'], companies: [miner] }),
    member('d2', { dedup_group: 'story-b', commodities: ['GOLD'], companies: [miner] }),
  ])
  const summary = buildCommodityThemesIndex([duplicated], { commodity: 'GOLD' }, now).themes[0]
  assert.equal(summary.member_count, 2)
  assert.equal(summary.top_companies[0]?.mention_count, 2, 'a publisher copy cannot inflate sliced company centrality')
})

check("{commodity:'GOLD'} narrows versus the any-commodity slice", () => {
  const mixed = theme('THM-mixdcc33', 'Gold and sugar', [
    member('x1', { commodities: ['GOLD'] }),
    member('x2', { commodities: ['GOLD'] }),
    member('x3', { commodities: ['GOLD'] }),
    member('x4', { commodities: ['SUGAR'] }),
    member('x5', { commodities: ['SUGAR'] }),
  ])
  assert.equal(buildCommodityThemesIndex([mixed], {}, now).themes[0].member_count, 5, 'any tagged commodity counts with no subject set')
  assert.equal(buildCommodityThemesIndex([mixed], { commodity: 'GOLD' }, now).themes[0].member_count, 3)
  assert.equal(buildCommodityThemesIndex([mixed], { commodity: 'SUGAR' }, now).themes[0].member_count, 2)
  assert.equal(buildCommodityThemesIndex([mixed], { commodity: 'COCOA' }, now).themes.length, 0, 'a subject with no flow drops the theme')
})

check('geo composition: a GOLD member in IN is excluded by geo {country: US} even though it is tagged', () => {
  const inTheme = theme('THM-geoddd44', 'India gold', [member('g5', { commodities: ['GOLD'], country: 'IN' })])
  assert.equal(buildCommodityThemesIndex([inTheme], { commodity: 'GOLD', geo: { country: 'IN' } }, now).themes.length, 1)
  assert.equal(buildCommodityThemesIndex([inTheme], { commodity: 'GOLD', geo: { country: 'US' } }, now).themes.length, 0)
})

check('legacy members (no stored tags) slice via the derive path — the whole ledger works, no migration', () => {
  const legacy = theme('THM-lgcyee55', 'Legacy sugar', [member('l1', { headline: 'Sugar prices surge in India' })])
  const idx = buildCommodityThemesIndex([legacy], { commodity: 'SUGAR' }, now)
  assert.equal(idx.themes.length, 1)
  assert.equal(idx.themes[0].member_count, 1)
})

check('non-live themes are never included, even with commodity flow', () => {
  const retired = theme('THM-rtrdff66', 'Retired gold', [member('r1', { commodities: ['GOLD'] })], { status: 'retired' })
  assert.equal(buildCommodityThemesIndex([retired], {}, now).themes.length, 0)
})

check('the index is shape-identical to buildThemesIndex: generated_at / themes / counts / history_days', () => {
  const idx = buildCommodityThemesIndex([themeA, themeB], { commodity: 'GOLD' }, now)
  assert.match(idx.generated_at, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/, 'generated_at is the trimmed ISO stamp')
  assert.ok(Array.isArray(idx.themes))
  assert.deepEqual(Object.keys(idx.counts).sort(), ['active', 'cooling', 'hot', 'parked', 'retired', 'total'])
  assert.ok(idx.history_days >= 1, 'members an hour old give at least one day of real flow history')
  // the summary rows carry the full ThemeSummary contract the cockpit consumes with no special-casing
  const t = idx.themes[0]
  for (const k of ['theme_id', 'name', 'description', 'tier', 'composite', 'fresh_flow', 'flow_series', 'flow_daily', 'member_count', 'top_companies', 'related_themes', 'last_flow', 'rev'])
    assert.ok(k in t, `ThemeSummary field ${k} missing from the sliced row`)
  assert.equal(t.last_flow, hoursAgo(1), 'last_flow is the newest SLICED member, not the theme total')
})

console.log(`\nthemes-commodity.test.ts: ${passed} passed`)
