// Pure first-look Themes briefing contract: deploy-skew handling, honest status hierarchy, deterministic
// top-five selection, ticker hygiene, directional company splits, and the six-hour "why now" delta.
// Run: npx tsx src/lib/themes.briefing.test.ts
import assert from 'node:assert/strict'
import React, { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { computeMapLayout, MapTooltip, themeMapEmptyCopy, ThemeNarrativeDossier, ThemesView } from '../components/screener/ThemesView'
import { useStore } from './store'
import {
  groupThemesForBriefing,
  groupThemeEvidence,
  qualifiedThemeExpressions,
  shouldHideThemeIntake,
  shouldResetThemeWindow,
  splitQualifiedThemeExpressions,
  themeFlowDelta,
  themeForMapHover,
  themeBriefingEvidence,
  themeMapMode,
  themeSliceDisplay,
  themeStageIsStale,
  themeSurfaceStatus,
  themeWindowForView,
  themesForPmSurface,
  validatedThemeNarrative,
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
  highQuality = 3,
  unique = 4,
  recent = 5,
  prior = 2,
): ThemeSurfaceAssessment => {
  const narrativeSupport = status === 'context' ? 0 : 3
  const qualityCount = Math.max(highQuality, narrativeSupport)
  const uniqueCount = Math.max(unique, qualityCount)
  return {
    status,
    activity: status === 'actionable' ? 'reinforced' : status === 'forming' ? 'new' : 'quiet',
    conviction: status === 'actionable' ? 'high' : 'watch',
    reasons: status === 'actionable' ? ['Distinct evidence and a ticker-linked expression.'] : [],
    blockers: status === 'forming' ? ['Needs another required proof check.'] : [],
    metrics: {
      recent_6h_flow: status === 'context' ? 0 : Math.min(recent, narrativeSupport),
      prior_6h_flow: status === 'context' ? 0 : Math.min(prior, narrativeSupport),
      unique_evidence_count: uniqueCount,
      high_quality_evidence_count: qualityCount,
      narrative_support_count: narrativeSupport,
      narrative_coherence_pct: 80,
      recurring_narrative_token_count: 2,
      first_order_directional_ticker_count: 1,
      recent_24h_support_count: status === 'context' ? 0 : 3,
      recent_24h_challenge_count: 0,
      off_core_evidence_count: Math.max(0, uniqueCount - narrativeSupport),
    },
  }
}

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
  ...(a ? {
    activity: a.activity,
    conviction: a.conviction,
    off_core_member_count: a.metrics.off_core_evidence_count,
    narrative: a.status === 'context' ? null : {
      version: 1,
      thesis: `${name} changes industry economics through a specific, testable mechanism.`,
      why_now: `${name} received a new evidence update today.`,
      why_now_event_id: `EV-${name}`,
      mechanism_steps: ['A new constraint changes supply.', 'Affected companies change spending.', 'The named exposure reaches earnings.'],
      horizon: 'months',
      falsifier: `${name} demand falls below the stated threshold by quarter-end.`,
      validated_at: '2026-08-04T00:00:00Z',
    },
  } : {}),
  ...(a && a.status !== 'context' ? {
    evidence: [
      { event_id: `EV-${name}`, headline: `${name} why-now source`, found_at: '2026-08-04T00:00:00Z', score: 82, source_tier: 'news', source_name: 'Evidence Wire', url: `https://example.test/evidence/${encodeURIComponent(name)}`, stance: 'supports' as const },
      { event_id: `EV-${name}-2`, headline: `${name} independent corroboration`, found_at: '2026-08-03T23:00:00Z', score: 78, source_tier: 'company', source_name: 'Issuer Disclosure', url: `https://example.test/evidence/${encodeURIComponent(name)}/2`, stance: 'supports' as const },
      { event_id: `EV-${name}-3`, headline: `${name} second corroboration`, found_at: '2026-08-03T22:00:00Z', score: 76, source_tier: 'news', source_name: 'Second Evidence Wire', url: `https://example.test/evidence/${encodeURIComponent(name)}/3`, stance: 'supports' as const },
    ],
  } : {}),
  ...(a?.status === 'actionable' ? {
    qualified_expressions: [{
      name: 'Proven Co', name_key: 'proven-co', ticker: 'PROOF', listing_country: 'US', side: 'beneficiary', role: 'direct', mechanism: 'The stated demand change reaches Proven Co revenue directly.', evidence_event_ids: [`EV-${name}`],
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
assert.deepEqual(groupThemesForBriefing([partial]).counts, { worthChecking: 0, forming: 0 })
assert.equal(groupThemesForBriefing([partial]).excludedContextCount, 1)

const missingNarrative = theme('missing-narrative', assessment('actionable'))
missingNarrative.narrative = undefined
assert.equal(themeSurfaceStatus(missingNarrative), 'context', 'an actionable assessment cannot outlive its narrative contract during deploy skew')
assert.equal(validatedThemeNarrative(missingNarrative), null)

const malformedNarrative = theme('malformed-narrative', assessment('actionable'))
malformedNarrative.narrative = { ...malformedNarrative.narrative!, mechanism_steps: ['A real step.', ''] }
assert.equal(themeSurfaceStatus(malformedNarrative), 'context', 'a partly malformed mechanism chain fails closed as a whole')

const unversionedNarrative = theme('unversioned-narrative', assessment('actionable'))
delete unversionedNarrative.narrative!.version
assert.equal(themeSurfaceStatus(unversionedNarrative), 'context', 'a narrative without the explicit v1 contract fails closed')

const oneStepNarrative = theme('one-step-narrative', assessment('actionable'))
oneStepNarrative.narrative = { ...oneStepNarrative.narrative!, mechanism_steps: ['A single assertion is not a causal chain.'] }
assert.equal(themeSurfaceStatus(oneStepNarrative), 'context', 'a mechanism needs at least two causal steps')

const missingBoundExpression = theme('missing-bound-expression', assessment('actionable'))
missingBoundExpression.qualified_expressions = undefined
assert.equal(themeSurfaceStatus(missingBoundExpression), 'context', 'an actionable claim without an evidence-bound expression fails closed during deploy skew')

const mismatchedProof = theme('mismatched-proof', assessment('actionable'))
mismatchedProof.qualified_expressions![0].evidence_event_ids = ['EV-NOT-IN-SUMMARY']
assert.equal(themeSurfaceStatus(mismatchedProof), 'context', 'an expression whose proof id is absent from summary evidence cannot clear the first look')

const missingSourceLink = theme('missing-source-link', assessment('actionable'))
delete missingSourceLink.evidence![0].url
assert.equal(themeBriefingEvidence(missingSourceLink).some((row) => row.event_id === missingSourceLink.narrative!.why_now_event_id), false, 'a proof row without its exact source link is not called validated evidence')
assert.equal(themeSurfaceStatus(missingSourceLink), 'context', 'an unauditable why-now row fails the PM thesis closed')

const missingSourceName = theme('missing-source-name', assessment('actionable'))
delete missingSourceName.evidence![0].source_name
assert.equal(themeBriefingEvidence(missingSourceName).some((row) => row.event_id === missingSourceName.narrative!.why_now_event_id), false, 'a bare URL without its named publisher is not exact provenance')
assert.equal(themeSurfaceStatus(missingSourceName), 'context', 'a why-now row without publisher identity fails the PM thesis closed')

const conflictingProvenance = theme('conflicting-provenance', assessment('actionable'))
conflictingProvenance.evidence!.push({ ...conflictingProvenance.evidence![0], url: 'https://different-publisher.test/same-event-id' })
assert.equal(themeBriefingEvidence(conflictingProvenance).some((row) => row.event_id === conflictingProvenance.narrative!.why_now_event_id), false, 'one event id with two exact source URLs fails closed instead of trusting input order')
assert.equal(themeSurfaceStatus(conflictingProvenance), 'context', 'conflicting exact provenance cannot support an actionable thesis')

const oneVisibleSupport = theme('one-visible-support', assessment('actionable'))
oneVisibleSupport.evidence = oneVisibleSupport.evidence!.slice(0, 1)
assert.equal(themeSurfaceStatus(oneVisibleSupport), 'context', 'a cached high-confidence claim with only one auditable support row fails closed')

const impossibleSupportMetrics = theme('impossible-support-metrics', assessment('actionable'))
impossibleSupportMetrics.assessment!.metrics.high_quality_evidence_count = 2
assert.equal(themeSurfaceStatus(impossibleSupportMetrics), 'context', 'narrative support cannot exceed the high-quality evidence pool')

const formingWithHighConviction = theme('forming-high', assessment('forming'))
formingWithHighConviction.conviction = 'high'
formingWithHighConviction.assessment!.conviction = 'high'
assert.equal(themeSurfaceStatus(formingWithHighConviction), 'context', 'forming plus High confidence is an impossible server state and fails closed')

const actionableOnWatch = theme('actionable-watch', assessment('actionable'))
actionableOnWatch.conviction = 'watch'
actionableOnWatch.assessment!.conviction = 'watch'
assert.equal(themeSurfaceStatus(actionableOnWatch), 'context', 'actionable plus Watch confidence is an impossible server state and fails closed')

const quietWithRecentSupport = theme('quiet-with-flow', assessment('forming'))
quietWithRecentSupport.activity = 'quiet'
quietWithRecentSupport.assessment!.activity = 'quiet'
assert.equal(themeSurfaceStatus(quietWithRecentSupport), 'context', 'quiet activity cannot claim recent thesis-changing support')

const themes = [
  theme('context', assessment('context', 9, 20)),
  theme('forming', assessment('forming', 8, 18)),
  ...Array.from({ length: 7 }, (_, i) => theme(`actionable-${i}`, assessment('actionable', i + 3, i + 4))),
]
const grouped = groupThemesForBriefing(themes)
assert.deepEqual(grouped.counts, { worthChecking: 7, forming: 1 })
assert.equal(grouped.excludedContextCount, 1)
assert.equal(grouped.worthChecking.length, 5, 'only five full thesis dossiers occupy first look')
assert.equal(grouped.hiddenWorthChecking, 2)
assert.deepEqual(grouped.additionalWorthChecking.map((t) => t.name), ['actionable-1', 'actionable-0'], 'every actionable thesis after the first five remains in a compact reachable lane')
assert.equal(grouped.worthChecking[0].name, 'actionable-6', 'higher evidence quality ranks first inside the same status')
assert.deepEqual(grouped.forming.map((t) => t.name), ['forming'])
assert.deepEqual(themesForPmSurface(themes).map((t) => t.name).includes('context'), false, 'raw Context is excluded from every PM-facing projection')

const hotNoise = theme('hot-noise', assessment('actionable'))
hotNoise.tier = 'hot'
hotNoise.composite = 100
hotNoise.narrative = undefined
const coolNarrative = theme('cool-actionable-narrative', assessment('actionable'))
coolNarrative.tier = 'cooling'
coolNarrative.composite = 10
assert.equal(groupThemesForBriefing([hotNoise, coolNarrative]).worthChecking[0]?.name, coolNarrative.name, 'a complete actionable narrative ranks ahead of hotter malformed noise')
assert.deepEqual(themesForPmSurface([hotNoise, coolNarrative]).map((t) => t.name), [coolNarrative.name], 'hot Context noise never reaches the map input')

const challenged = theme('challenged-now', assessment('actionable', 2, 4, 7, 0))
challenged.activity = 'challenged'
challenged.assessment!.activity = 'challenged'
challenged.conviction = 'medium'
challenged.assessment!.conviction = 'medium'
challenged.assessment!.metrics.recent_24h_challenge_count = 1
challenged.assessment!.metrics.off_core_evidence_count = 0
challenged.off_core_member_count = 0
challenged.evidence!.push({ event_id: 'EV-challenged-now-counter', headline: 'Fresh counterevidence', found_at: '2026-08-04T00:01:00Z', score: 80, source_tier: 'news', source_name: 'Counter Wire', url: 'https://example.test/challenged-now-counter', stance: 'challenges' })
const reinforced = theme('reinforced', assessment('actionable', 9, 12, 12, 11))
reinforced.conviction = 'medium'
reinforced.assessment!.conviction = 'medium'
assert.equal(
  groupThemesForBriefing([reinforced, challenged]).worthChecking[0].name,
  'challenged-now',
  'within the same conviction band, thesis-changing challenge activity is surfaced before accumulated evidence volume',
)

assert.equal(validThemeTicker('NULL'), false)
assert.equal(validThemeTicker('undefined'), false)
assert.equal(validThemeTicker('0000000000'), false)
assert.equal(validThemeTicker('0005'), true, 'four-digit all-numeric exchange tickers remain valid')
assert.equal(validThemeTicker('BRK.B'), true)
assert.equal(validThemeTicker('not a ticker'), false)

const directional = theme('directional', assessment('actionable'))
directional.conviction = 'medium'
directional.assessment!.conviction = 'medium'
directional.score_components = { freshness: 11, magnitude: 22, breadth: 33, persistence: 44, composite: 27 }
directional.top_companies = [
  { name: 'Unproved display company', ticker: 'DECOY', order: 1, side: 'beneficiary' },
]
directional.evidence = [
  { event_id: 'EV-GAIN', headline: 'Gain proof', found_at: '2026-08-04T00:00:00Z', score: 85, source_tier: 'news', source_name: 'Primary Publisher', url: 'https://example.test/gain', stance: 'supports' },
  { event_id: 'EV-HURT', headline: 'Hurt exposure proof', found_at: '2026-08-04T00:01:00Z', score: 83, source_tier: 'news', source_name: 'Second Publisher', url: 'https://example.test/hurt', stance: 'supports' },
  { event_id: 'EV-CHALLENGE', headline: 'Fresh evidence challenges the thesis', found_at: '2026-08-04T00:02:00Z', score: 81, source_tier: 'news', source_name: 'Challenge Publisher', url: 'https://example.test/challenge', stance: 'challenges' },
]
directional.narrative!.why_now_event_id = 'EV-GAIN'
directional.qualified_expressions = [
  { name: 'Gain Co', name_key: 'gain-co', ticker: 'gain', listing_country: 'US', side: 'beneficiary', role: 'direct', mechanism: 'Demand reaches Gain Co revenue directly.', evidence_event_ids: ['EV-GAIN', 'EV-GAIN'] },
  { name: 'Hurt Co', name_key: 'hurt-co', ticker: 'HURT', listing_country: 'US', side: 'harmed', role: 'harmed', mechanism: 'The same constraint raises Hurt Co costs.', evidence_event_ids: ['EV-HURT'] },
  { name: 'Missing proof', name_key: 'missing-proof', ticker: 'MISS', listing_country: 'US', side: 'beneficiary', role: 'enabler', mechanism: 'Missing proof cannot validate this mechanism.', evidence_event_ids: ['EV-ABSENT'] },
  { name: 'Partially invalid proof', name_key: 'partial-proof', ticker: 'PART', listing_country: 'US', side: 'beneficiary', role: 'bottleneck', mechanism: 'Only part of this proof exists.', evidence_event_ids: ['EV-GAIN', 'EV-ABSENT'] },
  { name: 'Challenge-only mapping', name_key: 'challenge-only', ticker: 'CHAL', listing_country: 'US', side: 'harmed', role: 'hedge', mechanism: 'Counterevidence cannot prove a qualified expression by itself.', evidence_event_ids: ['EV-CHALLENGE'] },
  { name: 'Conflicted Co', name_key: 'conflicted-co', ticker: 'CONFLICT', listing_country: 'US', side: 'beneficiary', role: 'direct', mechanism: 'Conflicted mechanism.', evidence_event_ids: ['EV-GAIN'] },
  { name: 'Conflicted Co', name_key: 'conflicted-co', ticker: 'CONFLICT', listing_country: 'US', side: 'harmed', role: 'harmed', mechanism: 'Conflicted mechanism.', evidence_event_ids: ['EV-HURT'] },
]
const split = splitQualifiedThemeExpressions(directional)
assert.deepEqual(split.beneficiaries.map((c) => c.ticker), ['GAIN'])
assert.deepEqual(split.harmed.map((c) => c.ticker), ['HURT'])
assert.deepEqual(qualifiedThemeExpressions(directional).map((c) => c.evidence_event_ids), [['EV-GAIN'], ['EV-HURT']], 'every proof id must exist in exact summary evidence; valid duplicates are de-duplicated')
assert.equal(split.beneficiaries.some((c) => c.ticker === 'DECOY'), false, 'a display-only top company can never become a first-look direction')
assert.equal(split.beneficiaries.some((c) => c.ticker === 'PART'), false, 'a partly invalid proof list is rejected whole instead of salvaged')
assert.equal(split.harmed.some((c) => c.ticker === 'CHAL'), false, 'challenging evidence stays visible but cannot be relabelled as expression proof')
assert.equal([...split.beneficiaries, ...split.harmed].some((c) => c.ticker === 'CONFLICT'), false, 'conflicting directions for one identity fail closed instead of taking input order')
assert.deepEqual(groupThemeEvidence(directional).challenges.map((row) => row.headline), ['Fresh evidence challenges the thesis'])
const dossierHtml = renderToStaticMarkup(createElement(ThemeNarrativeDossier, { t: directional, rank: 1 }))
assert.match(dossierHtml, /How to play \/ exposed names/)
assert.match(dossierHtml, /Demand reaches Gain Co revenue directly/)
assert.match(dossierHtml, /Challenges/)
assert.match(dossierHtml, /Fresh evidence challenges the thesis/, 'challenging evidence remains explicitly visible in the dossier')
assert.match(dossierHtml, /Engine synthesis \/ inference/, 'model-written causal analysis is visibly labelled as interpretation')
assert.match(dossierHtml, /Why-now source evidence/, 'the change claim cites its supporting source row without calling the inference proven')
assert.doesNotMatch(dossierHtml, /Exact proof/)
assert.match(dossierHtml, /wire materiality · not confidence/, 'the feed score cannot be mistaken for evidence confidence')
assert.match(dossierHtml, /supporting evidence item/, 'the six-hour delta names the support-only metric honestly')
assert.match(dossierHtml, /Primary Publisher/, 'every rendered proof row names its publisher')
assert.match(dossierHtml, /https:\/\/example\.test\/gain/, 'the exact publisher source is a reachable link')
assert.doesNotMatch(dossierHtml, /DECOY/, 'the rendered first look never expands from display-only top_companies')

const historicalTooltipHtml = renderToStaticMarkup(createElement(MapTooltip, {
  theme: directional,
  count: 2,
  countScopeLabel: 'the last hour',
  stale: false,
}))
assert.match(historicalTooltipHtml, /2 items in the last hour/, 'a historical hover labels the count from the selected window')
assert.doesNotMatch(historicalTooltipHtml, /5 items/, 'a historical hover never substitutes the lifetime member count')

const accelerating = theme('accelerating', assessment('actionable', 8, 8, 3, 3))
Object.assign(accelerating.assessment!.metrics, { recent_6h_flow: 8, prior_6h_flow: 3, narrative_support_count: 8, high_quality_evidence_count: 8, unique_evidence_count: 8, off_core_evidence_count: 0 })
const slowing = theme('slowing', assessment('forming', 4, 4, 1, 3))
Object.assign(slowing.assessment!.metrics, { recent_6h_flow: 1, prior_6h_flow: 4, narrative_support_count: 4, high_quality_evidence_count: 4, unique_evidence_count: 4, off_core_evidence_count: 0 })
const flat = theme('flat', assessment('actionable', 3, 3, 2, 2))
Object.assign(flat.assessment!.metrics, { recent_6h_flow: 2, prior_6h_flow: 2, narrative_support_count: 3, high_quality_evidence_count: 3, unique_evidence_count: 3, off_core_evidence_count: 0 })
assert.equal(themeFlowDelta(accelerating), 5)
assert.equal(themeFlowDelta(slowing), -3)
assert.equal(themeFlowDelta(flat), 0)

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
assert.match(themeMapEmptyCopy('hot', null), /Hot heat tier/, 'an empty heat-filtered explorer names the active filter instead of claiming every validated theme disappeared')
assert.match(themeMapEmptyCopy('active', { id: '1h', label: '1H', full: 'the last hour', hours: 1 }), /Clear the heat filter or try another window/, 'combined heat and time filters name both escape routes')
assert.equal(themeForMapHover([old], old.theme_id), old)
assert.equal(themeForMapHover([], old.theme_id), null, 'an SSE removal can clear the hovered theme without creating an undefined tooltip')
assert.equal(themeForMapHover([old], null), null)
assert.equal(shouldHideThemeIntake(false, false, false), false, 'the global live map may use the loaded wire mix')
assert.equal(shouldHideThemeIntake(true, false, false), true, 'a scoped map hides global intake')
assert.equal(shouldHideThemeIntake(false, true, false), true, 'a historical window hides current intake when no exact rollup exists')
assert.equal(shouldHideThemeIntake(false, true, true), false, 'an exact historical rollup may render its own lanes')

const crowdedMapThemes = Array.from({ length: 22 }, (_, index) => theme(`map-overflow-${index}`, assessment('actionable')))
const crowdedLayout = computeMapLayout(crowdedMapThemes, 1100, 360)
assert.equal(crowdedLayout.totalThemes, crowdedMapThemes.length)
assert.ok(crowdedLayout.omittedThemes.length > 0, 'a crowded spatial graph reports every theme it could not place')
assert.equal(crowdedLayout.nodes.length + crowdedLayout.omittedThemes.length, crowdedMapThemes.length, 'shown and overflow themes form one complete reachable set')

const evidenceTheme = theme('three-evidence-rows', assessment('actionable'))
evidenceTheme.evidence = ['first', 'second', 'ticker expression', 'fourth'].map((headline, i) => ({
  event_id: `EV-${i}`,
  headline,
  found_at: `2026-08-04T0${i}:00:00Z`,
  score: 90 - i,
  source_tier: 'news',
  source_name: `Publisher ${i}`,
  url: `https://example.test/proof/${i}`,
  stance: i === 3 ? 'challenges' as const : 'supports' as const,
}))
evidenceTheme.narrative!.why_now_event_id = 'EV-0'
assert.deepEqual(
  themeBriefingEvidence(evidenceTheme).map((e) => e.headline),
  ['first', 'second', 'ticker expression', 'fourth'],
  'the briefing keeps every exact stance-labelled row returned by the thesis summary',
)

const sevenDays = { id: '7d', label: '7D', full: 'the last 7 days', hours: 24 * 7 }
assert.equal(shouldResetThemeWindow('loading', 'map', sevenDays, 0), false, 'a new slice loading with cleared history preserves the selected lookback')
assert.equal(shouldResetThemeWindow('error', 'map', sevenDays, 0), false, 'a failed replacement does not silently change the user selection')
assert.equal(shouldResetThemeWindow('ready', 'map', sevenDays, 0), true, 'only a ready index may prove the slice lacks coverage')
assert.equal(shouldResetThemeWindow('ready', 'map', sevenDays, 1), false)
assert.equal(themeStageIsStale('2026-08-04T00:00:00Z', Date.parse('2026-08-04T00:09:59Z')), false)
assert.equal(themeStageIsStale('2026-08-04T00:00:00Z', Date.parse('2026-08-04T00:10:01Z')), true, 'a read-time projection cannot extend the ten-minute successful-stage freshness window')

const now = Date.now()
useStore.setState({
  themes,
  themesView: 'board',
  themesStatus: 'ready',
  themesGeneratedAt: new Date(now).toISOString(),
  themesProjectedAt: new Date(now).toISOString(),
  themesHistoryDays: 12,
  themesWindow: null,
  themesGeo: { country: '', geoRegion: '', label: '' },
  themesSubject: null,
  selectedTheme: null,
  staticMode: true,
})
const completeBoardHtml = renderThemesFromCurrentStore()
assert.match(completeBoardHtml, /Additional actionable investment theses/)
assert.match(completeBoardHtml, /actionable-0/, 'an actionable thesis outside the five full dossiers remains reachable from the briefing')

useStore.setState({
  themesStatus: 'ready',
  themesGeneratedAt: new Date(now - 11 * 60_000).toISOString(),
  themesProjectedAt: new Date(now).toISOString(),
})
const agedStageHtml = renderThemesFromCurrentStore()
assert.match(agedStageHtml, /saved screen/)
assert.match(agedStageHtml, /newer score projection/, 'a fresh projection does not relabel an old successful stage as live')
assert.doesNotMatch(agedStageHtml, /themes__tldot--live/)

// A failed refresh may retain the last good index for audit, but every first-look label must visibly
// switch out of present tense. In particular, cached rows cannot keep the live dot, Current-only copy,
// or Worth-checking label that would make the outage look like a current qualification.
useStore.setState({
  themes: [directional, hotNoise],
  themesView: 'board',
  themesStatus: 'error',
  themesGeneratedAt: '2026-08-04T00:00:00Z',
  themesProjectedAt: '2026-08-04T00:10:00Z',
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
assert.match(staleBoardHtml, /Last actionable theses/)
assert.match(staleBoardHtml, /Last index · Reinforced/)
assert.match(staleBoardHtml, /Fresh evidence challenges the thesis/)
assert.match(staleBoardHtml, /not current/)
assert.doesNotMatch(staleBoardHtml, /hot-noise/, 'raw Context stays absent from rendered PM briefing, not merely collapsed')
assert.doesNotMatch(staleBoardHtml, />Context</)
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
assert.match(staleDetailHtml, /Refresh failed\./, 'a transport failure is named as a refresh failure')
assert.match(staleDetailHtml, /retained for audit, not current/)
assert.match(staleDetailHtml, /saved snapshot/)
assert.match(staleDetailHtml, /Evidence in the last loaded thesis detail/)
assert.match(staleDetailHtml, /What would break it/)
assert.match(staleDetailHtml, /tabindex="0"/, 'the hourly flow chart is keyboard focusable')
assert.match(staleDetailHtml, /use Left or Right Arrow, Home, and End/, 'the chart carries a textual summary and keyboard instructions')
assert.match(staleDetailHtml, /freshness 11 · breadth 33 · staying power 44/, 'deep-dive heat components come from the canonical summary projection')
assert.doesNotMatch(staleDetailHtml, /freshness 80/, 'legacy detail scores cannot overwrite the canonical public projection')
assert.doesNotMatch(staleDetailHtml, /\+2 fresh/)
assert.doesNotMatch(staleDetailHtml, /The news in this theme/)

useStore.setState({
  themesStatus: 'ready',
  themesGeneratedAt: new Date(now - 11 * 60_000).toISOString(),
  themesProjectedAt: new Date(now).toISOString(),
})
const agedDetailHtml = renderThemesFromCurrentStore()
assert.match(agedDetailHtml, /older than 10 minutes/, 'an aged successful stage explains age rather than inventing a transport failure')
assert.doesNotMatch(agedDetailHtml, /Refresh failed\./)

useStore.setState({ selectedTheme: null, themeDetail: null, themes: [], themesStatus: 'loading', themesGeneratedAt: null, themesProjectedAt: null })
const loadingHtml = renderThemesFromCurrentStore()
assert.match(loadingHtml, /aria-busy="true"/)
assert.match(loadingHtml, /role="status" aria-live="polite"/, 'the first load is announced without stealing focus')

useStore.setState({ themesStatus: 'error' })
const coldErrorHtml = renderThemesFromCurrentStore()
assert.match(coldErrorHtml, /role="alert" aria-live="assertive"/)
assert.match(coldErrorHtml, />Retry Themes</, 'a cold Themes failure has an in-place recovery action')
assert.doesNotMatch(coldErrorHtml, /Current-only briefing/)
assert.doesNotMatch(coldErrorHtml, /themes__tldot--live/)

useStore.setState({ themesStatus: 'ready', themesGeneratedAt: new Date(now - 11 * 60_000).toISOString() })
const agedEmptyHtml = renderThemesFromCurrentStore()
assert.match(agedEmptyHtml, /stage is no longer current/, 'an old empty stage is presented as an old observation, not today\'s answer')
assert.doesNotMatch(agedEmptyHtml, /Current-only briefing/)
assert.doesNotMatch(agedEmptyHtml, /themes__tldot--live/)

console.log('themes briefing: qualification hierarchy and evidence helpers passed')
