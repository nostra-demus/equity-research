import assert from 'node:assert/strict'
import { assessmentNeedsRefresh, ideaIsStaleNow, qualificationDetailCounts, qualifiedIdeaFreshnessNow, summarizeIdeasSurface } from './ideasView'
import type { QualifiedIdeaEvaluation, QualifiedIdeasPolicy, ScreenerBoard } from './types'

const board = (patch: Partial<ScreenerBoard>): ScreenerBoard => patch as ScreenerBoard
const policy = { quoteMaxAgeDays: 7, liquidityMaxAgeDays: 14 } as QualifiedIdeasPolicy
const relativeIso = (days: number) => new Date(Date.now() + days * 86_400_000).toISOString()
const qualifiedEvaluation = (patch: Record<string, string> = {}): QualifiedIdeaEvaluation => ({
  candidate: {
    quote: { as_of: patch.quote || relativeIso(-1), stale: false },
    liquidity: { as_of: patch.liquidity || relativeIso(-1), },
    market_risk: { as_of: patch.risk || relativeIso(-1) },
    catalyst: {
      status_as_of: patch.catalystStatus || relativeIso(-1),
      window_start: patch.catalystStart || relativeIso(30),
      window_end: patch.catalystEnd || relativeIso(31),
    },
    falsifier: { deadline: patch.falsifier || relativeIso(60) },
    horizon: { end: patch.horizonEnd || relativeIso(180) },
  },
} as unknown as QualifiedIdeaEvaluation)

assert.deepEqual(summarizeIdeasSurface(null), {
  available: false,
  qualifiedCount: 0,
  liveLeadCount: 0,
  headerLabel: 'qualification unavailable',
})

const emptyLeadOnly = summarizeIdeasSurface(board({ ideas: [] }))
assert.equal(emptyLeadOnly.available, true)
assert.equal(emptyLeadOnly.liveLeadCount, 0)
assert.equal(emptyLeadOnly.headerLabel, 'qualification unavailable')

const preData = summarizeIdeasSurface(board({
  qualified_ideas: {
    schema_version: 'qualified-ideas-board/v1',
    health: { outcome: 'no_artifacts', qualified_count: 0 },
  } as ScreenerBoard['qualified_ideas'],
}))
assert.equal(preData.available, true)
assert.equal(preData.headerLabel, 'no assessments yet')

const rejected = summarizeIdeasSurface(board({
  qualified_ideas: {
    schema_version: 'qualified-ideas-board/v1',
    health: { outcome: 'none_clear', qualified_count: 0 },
  } as ScreenerBoard['qualified_ideas'],
}))
assert.equal(rejected.headerLabel, 'none qualified')

const qualified = summarizeIdeasSurface(board({
  ideas: [{ stale: false, decay_at: '2099-01-01T00:00:00Z' }, { stale: true, decay_at: '2020-01-01T00:00:00Z' }] as ScreenerBoard['ideas'],
  qualified_ideas: {
    schema_version: 'qualified-ideas-board/v1',
    health: { outcome: 'qualified', qualified_count: 2 },
    policy,
    qualified: [qualifiedEvaluation(), qualifiedEvaluation()],
  } as ScreenerBoard['qualified_ideas'],
}))
assert.equal(qualified.liveLeadCount, 1)
assert.equal(qualified.qualifiedCount, 2)
assert.equal(qualified.headerLabel, '2 qualified')

const qualifiedV2 = summarizeIdeasSurface(board({
  qualified_ideas: {
    schema_version: 'qualified-ideas-board/v2',
    health: { outcome: 'none_clear', qualified_count: 0 },
  } as ScreenerBoard['qualified_ideas'],
}))
assert.equal(qualifiedV2.available, true)
assert.equal(qualifiedV2.headerLabel, 'none qualified')

const publishingV2 = summarizeIdeasSurface(board({
  qualified_ideas: {
    schema_version: 'qualified-ideas-board/v2',
    health: { outcome: 'publishing', publishing_count: 1, qualified_count: 0 },
  } as ScreenerBoard['qualified_ideas'],
}))
assert.equal(publishingV2.headerLabel, 'research publishing')

assert.equal(ideaIsStaleNow({ stale: false, decay_at: '2026-08-03T10:00:00Z' } as NonNullable<ScreenerBoard['ideas']>[number], Date.parse('2026-08-03T11:00:00Z')), true)
assert.equal(ideaIsStaleNow({ stale: false, decay_at: '2026-08-03T12:00:00Z' } as NonNullable<ScreenerBoard['ideas']>[number], Date.parse('2026-08-03T11:00:00Z')), false)

const currentIdea = qualifiedEvaluation({
  quote: '2026-08-01T00:00:00Z', liquidity: '2026-08-01T00:00:00Z', risk: '2026-08-01T00:00:00Z',
  catalystStatus: '2026-08-01T00:00:00Z', catalystStart: '2026-08-10T00:00:00Z', catalystEnd: '2026-08-11T00:00:00Z',
  falsifier: '2026-09-01T00:00:00Z', horizonEnd: '2026-12-01T00:00:00Z',
})
assert.deepEqual(qualifiedIdeaFreshnessNow(currentIdea, policy, Date.parse('2026-08-03T00:00:00Z')), { refreshRequired: false, reasons: [] })
const openCatalystWindow = qualifiedEvaluation({
  quote: '2026-08-01T00:00:00Z', liquidity: '2026-08-01T00:00:00Z', risk: '2026-08-01T00:00:00Z',
  catalystStatus: '2026-08-02T23:00:00Z', catalystStart: '2026-08-02T00:00:00Z', catalystEnd: '2026-08-04T00:00:00Z',
  falsifier: '2026-09-01T00:00:00Z', horizonEnd: '2026-12-01T00:00:00Z',
})
assert.deepEqual(qualifiedIdeaFreshnessNow(openCatalystWindow, policy, Date.parse('2026-08-03T00:00:00Z')), { refreshRequired: false, reasons: [] })
const expiredIdea = qualifiedEvaluation({
  quote: '2026-07-01T00:00:00Z', liquidity: '2026-07-01T00:00:00Z', risk: '2026-07-01T00:00:00Z',
  catalystStatus: '2026-07-01T00:00:00Z', catalystStart: '2026-08-02T00:00:00Z', catalystEnd: '2026-08-02T12:00:00Z',
  falsifier: '2026-08-02T00:00:00Z', horizonEnd: '2026-12-01T00:00:00Z',
})
const expired = qualifiedIdeaFreshnessNow(expiredIdea, policy, Date.parse('2026-08-03T00:00:00Z'))
assert.equal(expired.refreshRequired, true)
assert.deepEqual(expired.reasons, [
  'quote evidence expired', 'liquidity evidence expired', 'ordinary-move evidence expired',
  'catalyst status is no longer current', 'catalyst is no longer proven scheduled and unresolved', 'falsifier deadline passed',
])

const mixedBoard = {
  needs_research: [
    { issues: [{ code: 'stale_quote', disposition: 'research', message: 'quote expired' }] },
    { issues: [{ code: 'missing_source', disposition: 'research', message: 'source missing' }] },
  ],
  does_not_clear: [{ issues: [] }],
  not_assessable: [{ gaps: ['No current price'] }],
} as unknown as NonNullable<ScreenerBoard['qualified_ideas']>
assert.equal(assessmentNeedsRefresh(mixedBoard.needs_research[0]), true)
assert.equal(assessmentNeedsRefresh(mixedBoard.needs_research[1]), false)
assert.deepEqual(qualificationDetailCounts(mixedBoard), {
  needsEvidence: 2,
  refreshNeeded: 1,
  rejected: 1,
  notAssessable: 1,
  total: 4,
})

console.log('ideasView: truth-state summaries passed')
