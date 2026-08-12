import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import type { BoardIdea, QualifiedIdeaEvaluation, QualifiedIdeasBoard } from '../../lib/types'
import {
  IdeasTabs,
  QualifiedIdeaCard,
  ideaScorePresentation,
  ideaThemeAttribution,
  ideasEmptyMessage,
  ideasForSide,
  qualifiedIdeaCatalystWindowLabel,
  qualifiedIdeaHorizonLabel,
  qualifiedIdeaQuoteLabel,
  qualifiedIdeaReturnTag,
  qualifiedIdeaSourceRows,
  qualifiedIdeasForSide,
  qualifiedIdeasOutcomeNotice,
  qualifiedIdeasWarning,
  qualifiedOutcomeHealthWarning,
} from './BestIdeasView'

const tabsHtml = renderToStaticMarkup(createElement(IdeasTabs, { active: 'long', onSelect: () => {} }))
assert.equal(tabsHtml.match(/role="tab"/g)?.length, 2, 'the Ideas surface has exactly two tabs')
assert.match(tabsHtml, />LONG<\/button>/)
assert.match(tabsHtml, />SHORT<\/button>/)
assert.match(tabsHtml, /id="ideas-long-tab"[^>]*aria-selected="true"/)
assert.match(tabsHtml, /id="ideas-short-tab"[^>]*aria-selected="false"/)
assert.match(tabsHtml, /id="ideas-long-tab"[^>]*tabindex="0"/)
assert.match(tabsHtml, /id="ideas-short-tab"[^>]*tabindex="-1"/)

const nowMs = Date.parse('2026-08-12T12:00:00Z')
const idea = (ideaId: string, direction: BoardIdea['direction'], patch: Partial<BoardIdea> = {}) => ({
  idea_id: ideaId,
  direction,
  stale: false,
  decay_at: '2026-08-13T12:00:00Z',
  ...patch,
}) as BoardIdea
const mixedIdeas = [
  idea('long-live', 'long'),
  idea('short-live', 'short'),
  idea('pair-live', 'pair', { pair_with: 'PAIR-SHORT' }),
  idea('pair-missing-leg', 'pair', { pair_with: null }),
  idea('long-stale-flag', 'long', { stale: true }),
  idea('short-expired', 'short', { decay_at: '2026-08-11T12:00:00Z' }),
]

assert.deepEqual(ideasForSide(mixedIdeas, 'long', nowMs).map((row) => row.idea_id), ['long-live', 'pair-live'])
assert.deepEqual(ideasForSide(mixedIdeas, 'short', nowMs).map((row) => row.idea_id), ['short-live', 'pair-live'])

const qualified = (ideaId: string, direction: 'long' | 'short', expiry = '2026-09-01T12:00:00Z') => ({
  candidate: {
    idea_id: ideaId,
    instrument: { direction },
    quote: { stale: false, as_of: '2026-08-12T10:00:00Z' },
    liquidity: { as_of: '2026-08-12T10:00:00Z' },
    market_risk: { as_of: '2026-08-12T10:00:00Z' },
    catalyst: { status_as_of: '2026-08-12T10:00:00Z', window_start: '2026-08-20T12:00:00Z', window_end: expiry },
    falsifier: { deadline: expiry },
    horizon: { end: expiry },
  },
}) as unknown as QualifiedIdeaEvaluation
const qualifiedBoard = {
  policy: { quoteMaxAgeDays: 7, liquidityMaxAgeDays: 14 },
  qualified: [qualified('qualified-long', 'long'), qualified('qualified-short', 'short'), qualified('qualified-expired', 'long', '2026-08-11T12:00:00Z')],
} as QualifiedIdeasBoard
assert.deepEqual(qualifiedIdeasForSide(qualifiedBoard, 'long', nowMs).map((row) => row.candidate.idea_id), ['qualified-long'])
assert.deepEqual(qualifiedIdeasForSide(qualifiedBoard, 'short', nowMs).map((row) => row.candidate.idea_id), ['qualified-short'])

assert.deepEqual(qualifiedIdeaReturnTag({
  metrics: { expected_return_pct: 24.8 },
  ranking: { conservative_expected_return_pct: 8.7 },
} as QualifiedIdeaEvaluation), {
  label: 'policy-adjusted +8.7%',
  title: 'Raw scenario return +24.8%',
})
assert.deepEqual(qualifiedIdeaReturnTag({
  metrics: { expected_return_pct: 12.5 },
} as QualifiedIdeaEvaluation), {
  label: 'raw scenario return +12.5%',
  title: 'Policy adjustment unavailable on this older research record.',
})
assert.equal(qualifiedIdeaReturnTag({ metrics: null } as QualifiedIdeaEvaluation), null)

assert.deepEqual(qualifiedIdeasWarning({
  health: { status: 'degraded', incomplete_count: 2, reason: 'Admission artifacts missing.' },
} as QualifiedIdeasBoard), {
  label: '2 research runs not published',
  title: 'Admission artifacts missing.',
})
assert.deepEqual(qualifiedIdeasWarning({
  health: { status: 'degraded', reason: 'Storage read failed.' },
} as QualifiedIdeasBoard), {
  label: 'Research results incomplete',
  title: 'Storage read failed.',
})
assert.equal(qualifiedIdeasWarning({ health: { status: 'healthy' } } as QualifiedIdeasBoard), null)

assert.equal(ideasEmptyMessage('long', true, { status: 'healthy' }), 'No LONG ideas.')
assert.equal(ideasEmptyMessage('short', true, { status: 'running' }), 'Checking for ideas…')
assert.equal(ideasEmptyMessage('long', true, { status: 'degraded' }), 'Ideas unavailable.')
assert.equal(ideasEmptyMessage('short', false, { status: 'healthy' }), 'Ideas unavailable.')

assert.deepEqual(qualifiedIdeasOutcomeNotice({
  health: { status: 'healthy', outcome: 'none_clear', reason: 'All completed assessments failed at least one gate.' },
} as QualifiedIdeasBoard), {
  label: 'Full research: no idea clears the bar.',
  title: 'All completed assessments failed at least one gate.',
})
assert.equal(qualifiedIdeasOutcomeNotice({
  health: { status: 'healthy', outcome: 'qualified' },
} as QualifiedIdeasBoard), null)
assert.equal(qualifiedIdeasOutcomeNotice({
  health: { status: 'degraded', outcome: 'none_clear' },
} as QualifiedIdeasBoard), null)

assert.deepEqual(qualifiedOutcomeHealthWarning({
  outcome_health_state: 'expired',
  outcome_health: { reason: 'Last pass expired at noon.' },
} as QualifiedIdeasBoard), {
  label: 'Outcome checks are out of date.',
  title: 'Last pass expired at noon.',
})
assert.deepEqual(qualifiedOutcomeHealthWarning({
  outcome_health_state: 'unknown', outcome_health: null,
} as QualifiedIdeasBoard), {
  label: 'Outcome checks unavailable.',
  title: 'No trustworthy outcome-health check is available.',
})
assert.equal(qualifiedOutcomeHealthWarning({
  outcome_health_state: 'valid', outcome_health: null,
} as QualifiedIdeasBoard), null)

assert.equal(
  qualifiedIdeaHorizonLabel({ start: '2026-08-12T00:00:00Z', end: '2027-02-12T00:00:00Z' }),
  '6mo forecast · Aug 12, 2026 → Feb 12, 2027',
)
assert.equal(qualifiedIdeaHorizonLabel({ start: 'bad', end: '2027-02-12T00:00:00Z' }), null)
assert.equal(
  qualifiedIdeaQuoteLabel({ price: 123.4567, as_of: '2026-08-12T21:00:00Z' }, 'usd'),
  'frozen quote USD 123.4567 · as of Aug 12, 2026',
)
assert.equal(qualifiedIdeaQuoteLabel({ price: 0, as_of: '2026-08-12T21:00:00Z' }, 'USD'), null)
assert.equal(
  qualifiedIdeaCatalystWindowLabel({ window_start: '2026-10-20T00:00:00Z', window_end: '2026-10-28T23:59:00Z' }),
  'Oct 20, 2026 → Oct 28, 2026',
)
assert.equal(qualifiedIdeaCatalystWindowLabel({ window_start: 'bad', window_end: '2026-10-28T23:59:00Z' }), null)

assert.deepEqual(ideaScorePresentation({ trade_score_basis: 'pre_edge_proxy_legacy' }), {
  label: 'pre-edge proxy',
  title: 'A legacy surface estimate — not trade readiness and not the locked edge score from full research.',
})
assert.equal(ideaScorePresentation({ trade_score_basis: 'evidence_gate_v2' }).label, 'trade readiness')

const qualifiedCardIdea = {
  candidate: {
    run_root: 'analyses/XYZ_2026-08-12',
    instrument: { ticker: 'XYZ', company: 'Example Co', exchange: 'NYSE', currency: 'USD', direction: 'long' },
    horizon: { start: '2026-08-12T00:00:00Z', end: '2027-02-12T00:00:00Z' },
    quote: { price: 123.45, as_of: '2026-08-12T21:00:00Z', source: 'Primary exchange close' },
    research: {
      edge_proof: 'The market is missing a dated earnings inflection.',
      unresolved_red_flags: [
        { id: 'RF-1', severity: 'High', description: 'Debt covenant headroom is not proven.' },
        { id: 'RF-2', severity: 'Medium', description: 'Customer concentration remains elevated.' },
      ],
    },
    catalyst: {
      name: 'Q4 results',
      window_start: '2026-10-20T00:00:00Z',
      window_end: '2026-10-28T23:59:00Z',
      bullish_trigger: 'Revenue growth exceeds 12% and guidance rises.',
      bearish_trigger: 'Revenue growth falls below 5% or guidance is cut.',
      source: 'FY26 Q3 filing',
    },
    falsifier: {
      condition: 'Net retention falls below 100%.',
      deadline: '2027-01-31T23:59:00Z',
      source: 'FY26 forecast ledger',
    },
    scenarios: [
      { source: 'FY26 valuation summary' },
      { source: 'FY26 valuation summary' },
      { source: 'FY26 downside case' },
    ],
  },
  metrics: { expected_return_pct: 18.2, worst_case_loss_pct: 24.5, loss_probability_pct: 35, tail_loss_pct: 21.7 },
  ranking: { conservative_expected_return_pct: 7.1 },
} as unknown as QualifiedIdeaEvaluation

assert.deepEqual(qualifiedIdeaSourceRows(qualifiedCardIdea.candidate), [
  { label: 'Research decision', source: 'analyses/XYZ_2026-08-12' },
  { label: 'Quote', source: 'Primary exchange close' },
  { label: 'Catalyst', source: 'FY26 Q3 filing' },
  { label: 'Falsifier', source: 'FY26 forecast ledger' },
  { label: 'Scenarios', source: 'FY26 valuation summary · FY26 downside case' },
])
const qualifiedCardHtml = renderToStaticMarkup(createElement(QualifiedIdeaCard, { idea: qualifiedCardIdea }))
assert.match(qualifiedCardHtml, /policy-adjusted \+7\.1%/)
assert.match(qualifiedCardHtml, /frozen quote USD 123\.45 · as of Aug 12, 2026/)
assert.match(qualifiedCardHtml, /6mo forecast · Aug 12, 2026 → Feb 12, 2027/)
assert.match(qualifiedCardHtml, /Q4 results/)
assert.match(qualifiedCardHtml, /Oct 20, 2026 → Oct 28, 2026/)
assert.match(qualifiedCardHtml, /Catalyst triggers/)
assert.match(qualifiedCardHtml, /Revenue growth exceeds 12% and guidance rises\./)
assert.match(qualifiedCardHtml, /Revenue growth falls below 5% or guidance is cut\./)
assert.match(qualifiedCardHtml, /falsifier by Jan 31, 2027/)
assert.match(qualifiedCardHtml, /Net retention falls below 100%\./)
assert.match(qualifiedCardHtml, /worst case 24\.5% loss/)
assert.match(qualifiedCardHtml, /loss chance 35\.0%/)
assert.match(qualifiedCardHtml, /tail loss 21\.7%/)
assert.match(qualifiedCardHtml, /2 unresolved risks/)
assert.match(qualifiedCardHtml, /<strong>High<\/strong> — Debt covenant headroom is not proven\./)
assert.match(qualifiedCardHtml, /<strong>Medium<\/strong> — Customer concentration remains elevated\./)
assert.match(qualifiedCardHtml, /Evidence sources/)
assert.match(qualifiedCardHtml, /Primary exchange close/)
assert.match(qualifiedCardHtml, /FY26 Q3 filing/)
assert.match(qualifiedCardHtml, /FY26 forecast ledger/)
assert.match(qualifiedCardHtml, /FY26 valuation summary · FY26 downside case/)

const sourceThemes = [{ theme_id: 'THM-1', theme_rev: 3 }]
assert.deepEqual(
  ideaThemeAttribution({ origin_type: 'theme', source_themes: sourceThemes }),
  {
    label: 'found through Themes',
    title: 'This lead entered the skim through a theme that cleared the evidence gate',
  },
)
assert.deepEqual(
  ideaThemeAttribution({ origin_type: 'mixed', source_themes: sourceThemes }),
  {
    label: 'theme corroborated',
    title: 'This lead appeared on the wire and was corroborated by a theme that cleared the evidence gate',
  },
)
assert.equal(ideaThemeAttribution({ origin_type: 'wire', source_themes: sourceThemes }), null)
assert.equal(ideaThemeAttribution({ origin_type: 'theme', source_themes: [] }), null)

console.log('BestIdeasView tabs, side filtering, and theme-attribution tests passed')
