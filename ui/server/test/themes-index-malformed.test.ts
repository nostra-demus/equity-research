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
import { attachValidNarrative } from './themes-fixtures'

let passed = 0
function check(name: string, fn: () => void) {
  try { fn(); passed++; console.log(`  ok  ${name}`) }
  catch (e: any) { console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`); process.exitCode = 1 }
}

const NOW = () => new Date('2026-06-14T00:00:00Z')

// A theme that MATCHES the slice (a valid member with a country + commodity tag) but carries CORRUPT,
// non-array `companies` / `related_themes` — so the slice reaches the company/related-theme projection
// that would throw on `.slice` / `.filter` of a non-array.
const corruptTheme = () => {
  const result = ({
  theme_id: 'THM-corrupt', name: 'Gold Demand Capacity', slug: 'gold-demand-capacity', description: 'Gold demand is driving recurring capacity changes.', keywords: [], company_keys: [], event_type_affinity: [],
  members: [
    { event_id: 'e1', headline: 'Gold demand capacity rises in the UAE', headline_en: null, found_at: '2026-06-13T10:00:00Z',
      score: 60, tier: 'news', country: 'AE', commodities: ['gold'], companies: [] },
    { event_id: 'e2', headline: 'Gold demand capacity expands in the UAE', headline_en: null, found_at: '2026-06-13T09:00:00Z',
      score: 60, tier: 'news', country: 'AE', commodities: ['gold'], companies: [] },
  ],
  member_count_total: 2,
  companies: {} as any,        // corrupt: non-array truthy
  related_themes: true as any, // corrupt: non-array truthy
  sectors: [],
  scores: { freshness: 0, magnitude: 0, breadth: 0, persistence: 0, composite: 0 },
  tier: 'hot', fresh_flow: 0, flow_series: [], flow_daily: [], status: 'live', merged_into: null,
  first_seen: '2026-06-13T10:00:00Z', last_flow: '2026-06-13T10:00:00Z', generation: 'deterministic', rev: 1,
  }) as unknown as Theme
  return attachValidNarrative(result)
}

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

// PR #437 added a formation_queue/compiler_health pass that both indexes run over EVERY theme (not just
// slice matches) via their own `projectMembers = (theme) => arr(theme.members).filter(...)` closure — a
// second, independent read of the theme's own top-level `members` field, guarded by each file's local
// `arr` helper exactly like the main slice loop above. A corrupt `members` (non-array truthy, e.g. a
// mis-parsed ledger row) must degrade the same way, not throw — and this must stay true even if that
// helper is ever inlined or refactored, since neither the main loop nor formation_queue would otherwise
// catch it (a plain `theme.members || []` fallback passes an array-safe check but still throws on `{}`).
const corruptMembersTheme = () => {
  const result = ({
    theme_id: 'THM-corrupt-members', name: 'Gold Demand Capacity', slug: 'gold-demand-capacity-2',
    description: 'Gold demand is driving recurring capacity changes.', keywords: [], company_keys: [], event_type_affinity: [],
    members: {} as any, // corrupt: non-array truthy, reaches both the main loop's arr(t.members) and projectMembers' arr(theme.members)
    member_count_total: 0,
    companies: [], related_themes: [], sectors: [],
    scores: { freshness: 0, magnitude: 0, breadth: 0, persistence: 0, composite: 0 },
    tier: 'hot', fresh_flow: 0, flow_series: [], flow_daily: [], status: 'live', merged_into: null,
    first_seen: '2026-06-13T10:00:00Z', last_flow: '2026-06-13T10:00:00Z', generation: 'deterministic', rev: 1,
  }) as unknown as Theme
  return result
}

check('buildGeoThemesIndex: a theme with a corrupt non-array members field does not throw and yields no compiler debt', () => {
  let idx: ReturnType<typeof buildGeoThemesIndex> | undefined
  assert.doesNotThrow(() => { idx = buildGeoThemesIndex([corruptMembersTheme(), corruptTheme()], { country: 'AE' }, NOW) },
    'a corrupt members field must not 500 the geo slice or its formation_queue/compiler_health pass')
  assert.equal(idx!.themes.length, 1, 'only the theme with real, matching members is surfaced')
  assert.equal(idx!.compiler_health.queue.total, 0, 'the corrupt-members theme contributes zero debt, not a crash')
})

check('buildCommodityThemesIndex: a theme with a corrupt non-array members field does not throw and yields no compiler debt', () => {
  let idx: ReturnType<typeof buildCommodityThemesIndex> | undefined
  assert.doesNotThrow(() => { idx = buildCommodityThemesIndex([corruptMembersTheme(), corruptTheme()], { commodity: 'gold' }, NOW) },
    'a corrupt members field must not 500 the commodity slice or its formation_queue/compiler_health pass')
  assert.equal(idx!.themes.length, 1, 'only the theme with real, matching members is surfaced')
  assert.equal(idx!.compiler_health.queue.total, 0, 'the corrupt-members theme contributes zero debt, not a crash')
})

console.log(`\nthemes-index-malformed: ${passed} checks passed`)
