import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import React, { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { ThemeDetailContent, ThemesView, exactNewsCount, rankedValidatedThemes } from '../components/screener/ThemesView'
import { useStore } from './store'
import { type Theme, type ThemeDetail, type ThemeSurfaceAssessment } from './themes'

const renderThemesFromCurrentStore = (): string => {
  const useSyncExternalStore = React.useSyncExternalStore
  ;(React as any).useSyncExternalStore = (_subscribe: unknown, getSnapshot: () => unknown) => getSnapshot()
  try {
    return renderToStaticMarkup(createElement(ThemesView))
  } finally {
    ;(React as any).useSyncExternalStore = useSyncExternalStore
  }
}

const assessment: ThemeSurfaceAssessment = {
  status: 'actionable',
  activity: 'reinforced',
  conviction: 'medium',
  reasons: ['Two exact supporting events and one evidence-bound listed expression.'],
  blockers: [],
  metrics: {
    recent_6h_flow: 1,
    prior_6h_flow: 0,
    unique_evidence_count: 10,
    high_quality_evidence_count: 2,
    narrative_support_count: 2,
    narrative_coherence_pct: 82,
    recurring_narrative_token_count: 2,
    first_order_directional_ticker_count: 1,
    recent_24h_support_count: 1,
    recent_24h_challenge_count: 0,
    off_core_evidence_count: 8,
  },
}

function theme(id: string, ideaReady: boolean): Theme {
  return {
    theme_id: id,
    name: ideaReady ? 'Grid bottleneck' : 'Private launch demand',
    description: 'A validated theme fixture.',
    tier: 'active',
    composite: ideaReady ? 72 : 68,
    fresh_flow: 1,
    flow_series: [0, 1],
    member_count: 10,
    top_companies: [],
    related_themes: [],
    first_seen: '2026-08-25T09:00:00Z',
    last_flow: ideaReady ? '2026-08-25T12:10:00Z' : '2026-08-25T12:00:00Z',
    rev: 7,
    activity: 'reinforced',
    conviction: 'medium',
    off_core_member_count: 8,
    narrative: {
      version: 1,
      thesis: 'Grid-equipment demand is rising faster than available supply, changing delivery times and earnings exposure.',
      why_now: ideaReady ? 'A new utility order disclosed a two-year transformer backlog.' : 'A private launch provider disclosed a larger order book.',
      why_now_event_id: 'EV-WHY',
      mechanism_steps: ['Utility orders consume available transformer capacity.', 'Longer delivery times raise pricing power.', 'The effect reaches named manufacturers and their sourced suppliers.'],
      horizon: 'months',
      falsifier: 'Lead times fall below six months while order cancellations rise for two consecutive quarters.',
      validated_at: '2026-08-25T12:15:00Z',
    },
    evidence: [
      { event_id: 'EV-WHY', headline: 'Utility discloses transformer backlog', found_at: '2026-08-25T12:10:00Z', score: 86, source_tier: 'official_data', source_name: 'Utility filing', url: 'https://example.test/why-now', stance: 'supports' },
      { event_id: 'EV-PLAYER', headline: 'Acme named in capacity expansion', found_at: '2026-08-25T11:10:00Z', score: 82, source_tier: 'company', source_name: 'Acme release', url: 'https://example.test/player', stance: 'supports' },
    ],
    qualified_expressions: [{ name: 'Acme Grid', name_key: 'acme-grid', ticker: 'ACME', listing_country: 'US', side: 'beneficiary', role: 'direct', mechanism: 'The backlog raises demand for Acme Grid transformers.', evidence_event_ids: ['EV-PLAYER'] }],
    assessment,
    idea_ready: ideaReady,
    idea_blockers: ideaReady ? [] : ['No verified listed player has a separate player-proof event.'],
    player_counts: ideaReady
      ? { first_order: 1, second_order: 1, verified_public: 1, idea_eligible: 1 }
      : { first_order: 1, second_order: 0, verified_public: 0, idea_eligible: 0 },
  }
}

const ideaTheme = theme('THM-grid-ready', true)
const themeOnly = theme('THM-private-only', false)

assert.equal(exactNewsCount(ideaTheme), 10)
assert.deepEqual(rankedValidatedThemes([themeOnly, ideaTheme]).map((row) => row.theme_id), [ideaTheme.theme_id, themeOnly.theme_id])

useStore.setState({
  themes: [themeOnly, ideaTheme],
  themeFormationQueue: null,
  themeCompilerHealth: null,
  themesView: 'board',
  themesStatus: 'ready',
  themesGeneratedAt: new Date().toISOString(),
  themesProjectedAt: new Date().toISOString(),
  themesGeo: { country: '', geoRegion: '', label: '' },
  themesSubject: null,
  selectedTheme: null,
  themeDetail: null,
  staticMode: true,
})
const listHtml = renderThemesFromCurrentStore()
assert.match(listHtml, /aria-label="Ranked validated themes"/)
assert.match(listHtml, /Idea-ready/)
assert.match(listHtml, /Theme only/)
assert.match(listHtml, /Grid bottleneck/)
assert.match(listHtml, /A new utility order disclosed a two-year transformer backlog\./)
assert.match(listHtml, />1<\/b><small>First order/)
assert.match(listHtml, />1<\/b><small>Second order/)
assert.match(listHtml, />10<\/b><small>Exact news/)
assert.match(listHtml, /Latest evidence/)
assert.doesNotMatch(listHtml, /Explore map|Filter the explorer by heat|Explore time window|Developing news patterns/)
assert.doesNotMatch(listHtml, /raw news pattern/, 'raw compiler debt is absent while validated themes exist')
assert.match(listHtml, /<button type="button" class="theme-list__row"/, 'each row is keyboard reachable without a nested click target')

useStore.setState({
  themes: [],
  themesStatus: 'ready',
  themesGeneratedAt: new Date().toISOString(),
  themeFormationQueue: { total: 3, shown: 0, hidden: 3, awaiting_validation: 3, awaiting_revalidation: 0, blocked_incomplete_audit: 0, building_evidence: 0, candidates: [] },
  themeCompilerHealth: null,
})
const debtHtml = renderThemesFromCurrentStore()
assert.match(debtHtml, /No validated theme yet\./)
assert.match(debtHtml, /3 raw news patterns are still being checked/)
assert.match(debtHtml, /Raw patterns are not investment themes/)
assert.doesNotMatch(debtHtml, /role="list"|Grid equipment order pattern/, 'raw patterns are an empty-state fact, never another investment list')

const evidenceNews: NonNullable<ThemeDetail['evidence_news']> = Array.from({ length: 10 }, (_, index) => {
  const n = index + 1
  return {
    event_id: n === 9 ? 'EV-WHY' : n === 10 ? 'EV-PLAYER' : `EV-${n}`,
    headline: `Exact headline ${n}`,
    publisher: `Publisher ${n}`,
    url: n === 5 ? 'javascript:alert(1)' : `https://example.test/news/${n}`,
    published_at: `2026-08-25T${String(n).padStart(2, '0')}:00:00Z`,
    stance: n === 8 ? 'challenges' : 'supports',
    roles: n === 9 ? ['why_now', 'support'] : n === 10 ? ['support', 'player_proof'] : n === 8 ? ['challenge'] : ['support'],
  }
})

const detail: ThemeDetail = {
  theme: ideaTheme,
  scores: { freshness: 70, magnitude: 70, breadth: 70, persistence: 70, composite: 70 },
  members: [],
  companies_by_order: { first: [], second: [], third: [] },
  formation: {
    shared_narrative_anchors: ['transformer backlog', 'utility orders'],
    distinct_news_count: 10,
    publisher_count: 7,
    supporting_count: 9,
    challenging_count: 1,
    excluded_off_theme_count: 4,
    first_seen: '2026-08-25T09:00:00Z',
    validated_at: '2026-08-25T12:15:00Z',
  },
  players: {
    first_order: [{
      name: 'Acme Grid', ticker: 'ACME', listing_status: 'verified_public', order: 1, side: 'beneficiary', relationship: 'direct_subject',
      mechanism: 'The disclosed backlog raises demand for Acme Grid transformers.', mechanism_basis: 'source_statement', idea_eligible: true,
      evidence: [{ kind: 'news', event_id: 'EV-PLAYER', headline: 'Acme named in capacity expansion', publisher: 'Acme release', url: 'https://example.test/player', published_at: '2026-08-25T11:10:00Z', source_ref: null, source_file: null }],
    }],
    second_order: [{
      name: 'Copper Parts Ltd', ticker: null, listing_status: 'no_verified_listing', order: 2, side: 'unclear', relationship: 'supplier',
      mechanism: 'It supplies a sourced transformer component, but the earnings direction is not yet stated.', mechanism_basis: 'engine_inference', idea_eligible: false,
      evidence: [{ kind: 'relationship_export', event_id: null, headline: null, publisher: null, url: null, published_at: null, source_ref: 'relationships/acme-suppliers.json#copper-parts', source_file: 'relationships/acme-suppliers.json' }],
    }],
  },
  evidence_news: evidenceNews,
  sectors: [],
  related_themes: [],
  keywords: [],
}

const detailHtml = renderToStaticMarkup(createElement(ThemeDetailContent, {
  detail,
  sourceSlice: { active: true, label: 'India · GRID' },
  stale: true,
  refreshFailed: true,
  generatedAt: '2026-08-25T12:15:00Z',
  onBack: () => undefined,
}))

const sectionNames = ['The theme', 'How this theme formed', 'How the effect travels', 'First-order players', 'Second-order players', 'What would prove this wrong', 'Exact news']
let prior = -1
for (const [index, heading] of sectionNames.entries()) {
  assert.match(detailHtml, new RegExp(`data-theme-section="${index + 1}"`))
  const position = detailHtml.indexOf(heading)
  assert.ok(position > prior, `${heading} must appear after the prior section`)
  prior = position
}
assert.match(detailHtml, /Evidence scoped to India · GRID/)
assert.match(detailHtml, /come from the same slice as the list you opened/)
assert.match(detailHtml, /Saved evidence — not current/)
assert.match(detailHtml, /The latest Themes refresh failed/)
assert.match(detailHtml, /ACME/)
assert.match(detailHtml, /May gain/)
assert.match(detailHtml, /No verified listing/)
assert.match(detailHtml, /Direction unclear/)
assert.match(detailHtml, /Engine inference — relationship is sourced, mechanism is inferred/)
assert.match(detailHtml, /relationships\/acme-suppliers\.json#copper-parts/)
assert.match(detailHtml, /Visible evidence only — cannot seed Ideas/)
assert.match(detailHtml, /href="https:\/\/example\.test\/player"/)
assert.match(detailHtml, /href="https:\/\/example\.test\/news\/10"/)
assert.doesNotMatch(detailHtml, /href="javascript:/)
assert.match(detailHtml, /Exact headline 10/)
assert.match(detailHtml, /Exact headline 3/)
assert.doesNotMatch(detailHtml, /Exact headline 2/, 'only the newest eight exact-news rows render initially')
assert.match(detailHtml, /Show all 10/)
assert.match(detailHtml, /aria-expanded="false"/)
assert.match(detailHtml, /Challenges/)
assert.match(detailHtml, /Player proof/)
assert.doesNotMatch(detailHtml, /wire materiality|news heat|sparkline/i)

const legacyDetail: ThemeDetail = { ...detail, players: undefined, evidence_news: [], formation: undefined }
const legacyHtml = renderToStaticMarkup(createElement(ThemeDetailContent, {
  detail: legacyDetail,
  sourceSlice: { active: false, label: '' },
  stale: false,
  refreshFailed: false,
  generatedAt: '2026-08-25T12:15:00Z',
  onBack: () => undefined,
}))
assert.equal((legacyHtml.match(/Not proven from available evidence\./g) || []).length, 4, 'formation, two player sections, and exact news degrade honestly while legacy revalidation is pending')

useStore.setState({
  themes: [ideaTheme],
  themesStatus: 'error',
  themesGeneratedAt: '2026-08-25T00:00:00Z',
  themeFormationQueue: null,
  selectedTheme: null,
})
const staleListHtml = renderThemesFromCurrentStore()
assert.match(staleListHtml, /Saved Themes snapshot — not current/)
assert.match(staleListHtml, /The latest refresh failed/)
assert.match(staleListHtml, /Refresh Themes/)

const css = readFileSync(fileURLToPath(new URL('../styles/global.css', import.meta.url)), 'utf8')
assert.match(css, /@container wire-main \(max-width: 760px\)[\s\S]*\.theme-list__row/)
assert.match(css, /@container wire-main \(max-width: 430px\)[\s\S]*\.theme-section/)
assert.match(css, /\.theme-list__row:focus-visible/)
assert.match(css, /\.evidence-news__toggle:focus-visible/)

console.log('themes simple experience: one list, seven evidence-first sections, honest empty states, and responsive access passed')
