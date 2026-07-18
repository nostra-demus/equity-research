// The geo- and commodity-sliced themes indexes (server.ts slicedThemesIndex → build*ThemesIndex) read
// the SAME untrusted ledger rows as the deep-dive. A corrupt row whose `companies` / `related_themes`
// parsed as a non-array truthy value (`{}`, `true`) must not 500 the filtered /api/news/themes view.
// (codex review finding on PR #280.) These helpers now guard with Array.isArray, like store.ts top().
// Run: npx tsx test/themes-index-malformed.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import { buildGeoThemesIndex } from '../src/news/themes/geo-index'
import { buildCommodityThemesIndex } from '../src/news/themes/commodity-index'
import type { Theme } from '../src/news/themes/types'

let passed = 0
function check(name: string, fn: () => void) {
  try { fn(); passed++; console.log(`  ok  ${name}`) }
  catch (e: any) { console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`); process.exitCode = 1 }
}

const NOW = () => new Date('2026-06-14T00:00:00Z')

// A theme that MATCHES the slice (a valid member with a country + commodity tag) but carries CORRUPT,
// non-array `companies` / `related_themes` — so the slice reaches the company/related-theme projection
// that would throw on `.slice` / `.filter` of a non-array.
const corruptTheme = () => ({
  theme_id: 'THM-corrupt', name: 'x', slug: 'x', description: '', keywords: [], company_keys: [], event_type_affinity: [],
  members: [{ event_id: 'e1', headline: 'Gold demand in the UAE', headline_en: null, found_at: '2026-06-13T10:00:00Z',
    score: 60, tier: 'news', country: 'AE', commodities: ['gold'], companies: [] }],
  member_count_total: 1,
  companies: {} as any,        // corrupt: non-array truthy
  related_themes: true as any, // corrupt: non-array truthy
  sectors: [],
  scores: { freshness: 0, magnitude: 0, breadth: 0, persistence: 0, composite: 0 },
  tier: 'hot', fresh_flow: 0, flow_series: [], flow_daily: [], status: 'live', merged_into: null,
  first_seen: '2026-06-13T10:00:00Z', last_flow: '2026-06-13T10:00:00Z', generation: 'deterministic', rev: 1,
}) as unknown as Theme

check('buildGeoThemesIndex: a matching theme with non-array companies/related_themes does not throw', () => {
  let idx: ReturnType<typeof buildGeoThemesIndex> | undefined
  assert.doesNotThrow(() => { idx = buildGeoThemesIndex([corruptTheme()], { country: 'AE' }, NOW) },
    'the geo slice must degrade, not 500, on a corrupt non-array field')
  // the theme matched the geo (its member is AE) and was projected with empty company/related tiers
  assert.equal(idx!.themes.length, 1, 'the matching theme is still surfaced')
  assert.deepEqual(idx!.themes[0].top_companies, [], 'corrupt companies → empty tier, not a crash')
  assert.deepEqual(idx!.themes[0].related_themes, [], 'corrupt related_themes → empty, not a crash')
})

check('buildCommodityThemesIndex: a matching theme with non-array companies/related_themes does not throw', () => {
  let idx: ReturnType<typeof buildCommodityThemesIndex> | undefined
  assert.doesNotThrow(() => { idx = buildCommodityThemesIndex([corruptTheme()], { commodity: 'gold' }, NOW) },
    'the commodity slice must degrade, not 500, on a corrupt non-array field')
  assert.equal(idx!.themes.length, 1, 'the matching theme is still surfaced')
  assert.deepEqual(idx!.themes[0].top_companies, [], 'corrupt companies → empty tier, not a crash')
  assert.deepEqual(idx!.themes[0].related_themes, [], 'corrupt related_themes → empty, not a crash')
})

console.log(`\nthemes-index-malformed: ${passed} checks passed`)
