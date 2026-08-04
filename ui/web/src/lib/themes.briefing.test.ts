// Pure first-look Themes briefing contract: deploy-skew handling, honest status hierarchy, deterministic
// top-five selection, ticker hygiene, directional company splits, and the six-hour "why now" delta.
// Run: npx tsx src/lib/themes.briefing.test.ts
import assert from 'node:assert/strict'
import React, { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { ThemeDirectionRead, ThemesView } from '../components/screener/ThemesView'
import { useStore } from './store'
import {
  groupThemesForBriefing,
  qualifiedThemeExpressions,
  shouldHideThemeIntake,
  shouldResetThemeWindow,
  splitQualifiedThemeExpressions,
  themeFlowDelta,
  themeForMapHover,
  themeBriefingEvidence,
  themeMapMode,
  themeSliceDisplay,
  themeSurfaceStatus,
  themeWindowForView,
  validThemeTicker,
  type Theme,
  type ThemeSurfaceAssessment,
} from './themes'

// React's server renderer asks external stores for their immutable hydration snapshot. These component
// regressions intentionally exercise a later store state, so make useSyncExternalStore read its current
// client snapshot for only this synchronous render, then restore React immediately.
const renderThemesFromCurrentStore = (): string => {
  const useSyncExternalStore = React.useSyncExternalStore
  ;(React as any).useSyncExternalStore = (_subscribe: unknown, getSnapshot: () => unknown) => getSnapshot()
  try {
    return renderToStaticMarkup(createElement(ThemesView))
  } finally {
    ;(React as any).useSyncExternalStore = useSyncExternalStore
  }
}

const assessment = (
  status: ThemeSurfaceAssessment['status'],
  highQuality = 2,
  unique = 4,
  recent = 5,
  prior = 2,
): ThemeSurfaceAssessment => ({
  status,
  reasons: status === 'actionable' ? ['Distinct evidence and a first-order ticker-linked expression.'] : [],
  blockers: status === 'forming' ? ['Needs a second distinct source.'] : [],
  metrics: {
    recent_6h_flow: recent,
    prior_6h_flow: prior,
    unique_evidence_count: unique,
    high_quality_evidence_count: highQuality,
    narrative_support_count: 3,
    narrative_coherence_pct: 80,
    recurring_narrative_token_count: 2,
    first_order_directional_ticker_count: 1,
  },
})

const theme = (name: string, a?: ThemeSurfaceAssessment): Theme => ({
  theme_id: `THM-${name}`,
  name,
  description: `${name} description`,
  tier: 'active',
  composite: 70,
  fresh_flow: 2,
  flow_series: [0, 1, 2],
  member_count: 5,
  top_companies: [],
  related_themes: [],
  last_flow: '2026-08-04T00:00:00Z',
  rev: 1,
  ...(a?.status === 'actionable' ? {
    evidence: [{ event_id: `EV-${name}`, headline: `${name} proof`, found_at: '2026-08-04T00:00:00Z', score: 82, source_tier: 'news' }],
    qualified_expressions: [{
      name: 'Proven Co', name_key: 'proven-co', ticker: 'PROOF', listing_country: 'US', side: 'beneficiary', evidence_event_ids: [`EV-${name}`],
    }],
  } : {}),
  ...(a ? { assessment: a } : {}),
})

// An older server has none of the new optional fields. It must fail closed into Context rather than
// being called "worth checking" from its legacy heat score.
const old = theme('old-server')
assert.equal(themeSurfaceStatus(old), 'context')
assert.equal(themeFlowDelta(old), null)

const partial = theme('partial-server')
partial.assessment = { status: 'actionable' } as ThemeSurfaceAssessment
assert.equal(themeSurfaceStatus(partial), 'context', 'an incomplete actionable claim fails closed instead of crashing the briefing')
assert.deepEqual(groupThemesForBriefing([partial]).counts, { worthChecking: 0, forming: 0, context: 1 })

const missingBoundExpression = theme('missing-bound-expression', assessment('actionable'))
missingBoundExpression.qualified_expressions = undefined
assert.equal(themeSurfaceStatus(missingBoundExpression), 'context', 'an actionable claim without an evidence-bound expression fails closed during deploy skew')

const mismatchedProof = theme('mismatched-proof', assessment('actionable'))
mismatchedProof.qualified_expressions![0].evidence_event_ids = ['EV-NOT-IN-SUMMARY']
assert.equal(themeSurfaceStatus(mismatchedProof), 'context', 'an expression whose proof id is absent from summary evidence cannot clear the first look')

const themes = [
  theme('context', assessment('context', 9, 20)),
  theme('forming', assessment('forming', 8, 18)),
  ...Array.from({ length: 7 }, (_, i) => theme(`actionable-${i}`, assessment('actionable', i, i + 2))),
]
const grouped = groupThemesForBriefing(themes)
assert.deepEqual(grouped.counts, { worthChecking: 7, forming: 1, context: 1 })
assert.equal(grouped.worthChecking.length, 5, 'only five full-width Worth checking rows occupy first look')
assert.equal(grouped.hiddenWorthChecking, 2)
assert.equal(grouped.worthChecking[0].name, 'actionable-6', 'higher evidence quality ranks first inside the same status')
assert.deepEqual(grouped.forming.map((t) => t.name), ['forming'])
assert.deepEqual(grouped.context.map((t) => t.name), ['context'])

const expanded = groupThemesForBriefing(themes, themes.length)
assert.equal(expanded.worthChecking.length, 7, 'an explicit in-place show-all request makes every qualified row reachable')
assert.equal(expanded.hiddenWorthChecking, 0)

const fast = theme('fast-acceleration', assessment('actionable', 1, 2, 7, 0))
const moreSupportedButFlat = theme('more-supported-but-flat', assessment('actionable', 9, 12, 12, 11))
assert.equal(
  groupThemesForBriefing([moreSupportedButFlat, fast], 5).worthChecking[0].name,
  'fast-acceleration',
  'the first lexicographic fact (recent minus prior flow) wins; facts are not blended into an opaque score',
)

assert.equal(validThemeTicker('NULL'), false)
assert.equal(validThemeTicker('undefined'), false)
assert.equal(validThemeTicker('0000000000'), false)
assert.equal(validThemeTicker('0005'), true, 'four-digit all-numeric exchange tickers remain valid')
assert.equal(validThemeTicker('BRK.B'), true)
assert.equal(validThemeTicker('not a ticker'), false)

const directional = theme('directional', assessment('actionable'))
directional.top_companies = [
  { name: 'Unproved display company', ticker: 'DECOY', order: 1, side: 'beneficiary' },
]
directional.evidence = [
  { event_id: 'EV-GAIN', headline: 'Gain proof', found_at: '2026-08-04T00:00:00Z', score: 85, source_tier: 'news' },
  { event_id: 'EV-HURT', headline: 'Hurt proof', found_at: '2026-08-04T00:01:00Z', score: 83, source_tier: 'news' },
]
directional.qualified_expressions = [
  { name: 'Gain Co', name_key: 'gain-co', ticker: 'gain', listing_country: 'US', side: 'beneficiary', evidence_event_ids: ['EV-GAIN', 'EV-GAIN'] },
  { name: 'Hurt Co', name_key: 'hurt-co', ticker: 'HURT', listing_country: 'US', side: 'harmed', evidence_event_ids: ['EV-HURT'] },
  { name: 'Missing proof', name_key: 'missing-proof', ticker: 'MISS', listing_country: 'US', side: 'beneficiary', evidence_event_ids: ['EV-ABSENT'] },
  { name: 'Partially invalid proof', name_key: 'partial-proof', ticker: 'PART', listing_country: 'US', side: 'beneficiary', evidence_event_ids: ['EV-GAIN', 'EV-ABSENT'] },
  { name: 'Conflicted Co', name_key: 'conflicted-co', ticker: 'CONFLICT', listing_country: 'US', side: 'beneficiary', evidence_event_ids: ['EV-GAIN'] },
  { name: 'Conflicted Co', name_key: 'conflicted-co', ticker: 'CONFLICT', listing_country: 'US', side: 'harmed', evidence_event_ids: ['EV-HURT'] },
]
const split = splitQualifiedThemeExpressions(directional)
assert.deepEqual(split.beneficiaries.map((c) => c.ticker), ['GAIN'])
assert.deepEqual(split.harmed.map((c) => c.ticker), ['HURT'])
assert.deepEqual(qualifiedThemeExpressions(directional).map((c) => c.evidence_event_ids), [['EV-GAIN'], ['EV-HURT']], 'every proof id must exist in exact summary evidence; valid duplicates are de-duplicated')
assert.equal(split.beneficiaries.some((c) => c.ticker === 'DECOY'), false, 'a display-only top company can never become a first-look direction')
assert.equal(split.beneficiaries.some((c) => c.ticker === 'PART'), false, 'a partly invalid proof list is rejected whole instead of salvaged')
assert.equal([...split.beneficiaries, ...split.harmed].some((c) => c.ticker === 'CONFLICT'), false, 'conflicting directions for one identity fail closed instead of taking input order')
const directionHtml = renderToStaticMarkup(createElement(ThemeDirectionRead, { directions: split }))
assert.match(directionHtml, />GAIN /)
assert.match(directionHtml, /1 proof/)
assert.doesNotMatch(directionHtml, /DECOY/, 'the rendered first-look direction never expands from top_companies')

assert.equal(themeFlowDelta(theme('accelerating', assessment('actionable', 2, 4, 8, 3))), 5)
assert.equal(themeFlowDelta(theme('slowing', assessment('forming', 1, 2, 1, 4))), -3)
assert.equal(themeFlowDelta(theme('flat', assessment('context', 0, 1, 2, 2))), 0)

assert.equal(themeWindowForView('map', 24 * 7), 24 * 7, 'historical windows belong to the Explore map')
assert.equal(themeWindowForView('board', 24 * 7), null, 'Briefing is always projected back to current evidence')
assert.equal(themeWindowForView(null, 24 * 7), null, 'a closed Themes surface cannot carry a historical briefing meaning')

assert.deepEqual(themeSliceDisplay('', null, null), { active: false, label: '' })
assert.deepEqual(themeSliceDisplay('India', 'GOLD', 'commodity'), { active: true, label: 'India · GOLD' })
assert.deepEqual(themeSliceDisplay('', null, 'commodity'), { active: true, label: 'commodity wire' }, 'a non-flow wire is scoped before one subject is selected')
assert.deepEqual(themeSliceDisplay('', 'CRUDE-OIL', 'commodity'), { active: true, label: 'CRUDE-OIL' }, 'a selected subject is more useful than the generic wire scope')

assert.equal(themeMapMode(619), 'compact', 'a narrow main pane uses the reachable ranked explorer')
assert.equal(themeMapMode(620), 'spatial')
assert.equal(themeMapMode(0), 'spatial', 'an unmeasured first frame does not guess at a pane mode')
assert.equal(themeForMapHover([old], old.theme_id), old)
assert.equal(themeForMapHover([], old.theme_id), null, 'an SSE removal can clear the hovered theme without creating an undefined tooltip')
assert.equal(themeForMapHover([old], null), null)
assert.equal(shouldHideThemeIntake(false, false, false), false, 'the global live map may use the loaded wire mix')
assert.equal(shouldHideThemeIntake(true, false, false), true, 'a scoped map hides global intake')
assert.equal(shouldHideThemeIntake(false, true, false), true, 'a historical window hides current intake when no exact rollup exists')
assert.equal(shouldHideThemeIntake(false, true, true), false, 'an exact historical rollup may render its own lanes')

const evidenceTheme = theme('three-evidence-rows', assessment('actionable'))
evidenceTheme.evidence = ['first', 'second', 'ticker expression', 'fourth'].map((headline, i) => ({
  event_id: `EV-${i}`,
  headline,
  found_at: `2026-08-04T0${i}:00:00Z`,
  score: 90 - i,
  source_tier: 'news',
}))
assert.deepEqual(
  themeBriefingEvidence(evidenceTheme).map((e) => e.headline),
  ['first', 'second', 'ticker expression'],
  'the briefing renders all three server-pinned rows so third-position expression proof is not hidden',
)

const sevenDays = { id: '7d', label: '7D', full: 'the last 7 days', hours: 24 * 7 }
assert.equal(shouldResetThemeWindow('loading', 'map', sevenDays, 0), false, 'a new slice loading with cleared history preserves the selected lookback')
assert.equal(shouldResetThemeWindow('error', 'map', sevenDays, 0), false, 'a failed replacement does not silently change the user selection')
assert.equal(shouldResetThemeWindow('ready', 'map', sevenDays, 0), true, 'only a ready index may prove the slice lacks coverage')
assert.equal(shouldResetThemeWindow('ready', 'map', sevenDays, 1), false)

// A failed refresh may retain the last good index for audit, but every first-look label must visibly
// switch out of present tense. In particular, cached rows cannot keep the live dot, Current-only copy,
// or Worth-checking label that would make the outage look like a current qualification.
useStore.setState({
  themes: [directional],
  themesView: 'board',
  themesStatus: 'error',
  themesGeneratedAt: '2026-08-04T00:00:00Z',
  themesHistoryDays: 12,
  themesWindow: null,
  themesGeo: { country: '', geoRegion: '', label: '' },
  themesSubject: null,
  selectedTheme: null,
  themeDetail: null,
  themeDetailError: null,
  themeBrief: null,
  themesLoading: false,
  themeBriefLoading: false,
  staticMode: true,
})
const staleBoardHtml = renderThemesFromCurrentStore()
assert.match(staleBoardHtml, /Last successful screen/)
assert.match(staleBoardHtml, /Last qualified/)
assert.match(staleBoardHtml, /Last qualified · stale/)
assert.match(staleBoardHtml, /not current/)
assert.doesNotMatch(staleBoardHtml, /Worth checking/)
assert.doesNotMatch(staleBoardHtml, /Current-only/)
assert.doesNotMatch(staleBoardHtml, /themes__tldot--live/)

// The index refresh continues while a detail is open. A cached detail therefore needs its own outage
// disclosure; hiding only the board-level banner would let the deepest surface imply current evidence.
useStore.setState({
  selectedTheme: directional.theme_id,
  themeDetail: {
    theme: directional,
    scores: { freshness: 80, magnitude: 70, breadth: 60, persistence: 50, composite: 65 },
    members: [],
    companies_by_order: { first: [], second: [], third: [] },
    sectors: [],
    related_themes: [],
    keywords: [],
  },
})
const staleDetailHtml = renderThemesFromCurrentStore()
assert.match(staleDetailHtml, /Last successful Themes snapshot/)
assert.match(staleDetailHtml, /retained for audit, not current/)
assert.match(staleDetailHtml, /saved snapshot/)
assert.match(staleDetailHtml, /News in the last loaded theme detail/)
assert.doesNotMatch(staleDetailHtml, /\+2 fresh/)
assert.doesNotMatch(staleDetailHtml, /The news in this theme/)

console.log('themes briefing: qualification hierarchy and evidence helpers passed')
