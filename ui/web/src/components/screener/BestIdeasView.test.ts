import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import type { BoardIdea, QualifiedIdeaEvaluation, QualifiedIdeasBoard } from '../../lib/types'
import { IdeasTabs, ideaThemeAttribution, ideasEmptyMessage, ideasForSide, qualifiedIdeaReturnTag, qualifiedIdeasForSide, qualifiedIdeasWarning } from './BestIdeasView'

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

assert.equal(ideasEmptyMessage('long', true, false, { status: 'healthy' }), 'No LONG ideas.')
assert.equal(ideasEmptyMessage('short', true, false, { status: 'running' }), 'Checking for ideas…')
assert.equal(ideasEmptyMessage('long', true, false, { status: 'degraded' }), 'Ideas unavailable.')
assert.equal(ideasEmptyMessage('short', false, false, { status: 'healthy' }), 'Ideas unavailable.')
assert.equal(ideasEmptyMessage('short', true, true, { status: 'degraded' }), 'No SHORT ideas.')

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
