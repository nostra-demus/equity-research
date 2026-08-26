// The Themes index is a slice-specific cache. A geography or subject change must clear it synchronously
// so old rows can never wear a new filter label while the matching refresh is pending or has failed.
import assert from 'node:assert/strict'
import { api } from './api'
import { useStore } from './store'
import type { Theme, ThemeBrief, ThemeCompilerHealth, ThemeDetail, ThemeFormationQueue, ThemesIndex, ThemeSurfaceAssessment } from './themes'

const cachedTheme = {
  theme_id: 'THM-CACHED',
  name: 'Cached theme',
  description: 'Evidence from the prior slice',
  tier: 'active',
  composite: 50,
  fresh_flow: 1,
  flow_series: [1],
  member_count: 1,
  top_companies: [],
  related_themes: [],
  last_flow: '2026-08-04T00:00:00Z',
  rev: 1,
} satisfies Theme

const cachedFormationQueue = {
  total: 1, shown: 1, hidden: 0, awaiting_validation: 1, awaiting_revalidation: 0, blocked_incomplete_audit: 0, building_evidence: 0,
  candidates: [{
    theme_id: 'THM-a1b2c3d4', provisional_label: 'Pending pattern', investable: false, state: 'awaiting_validation', queued_at: '2026-08-04T00:00:00Z', attempted_at: null,
    distinct_evidence_count: 3, high_quality_evidence_count: 2,
    evidence: [
      { event_id: 'EV-PENDING', headline: 'Pending exact source', found_at: '2026-08-04T00:00:00Z', score: 80, source_tier: 'news', source_name: 'Evidence Wire', url: 'https://example.test/pending', stance: 'supports' },
      { event_id: 'EV-PENDING-2', headline: 'Second pending exact source', found_at: '2026-08-03T23:00:00Z', score: 78, source_tier: 'company', source_name: 'Issuer Wire', url: 'https://example.test/pending-2', stance: 'supports' },
    ],
    blockers: ['Needs compiler validation.'],
  }],
} satisfies ThemeFormationQueue
const cachedCompilerHealth = {
  state: 'blocked', observed_at: '2026-08-04T00:00:00Z', provider: 'claude-haiku', blocker: 'daily_cap', message: 'Daily cap reached.',
  queue: { total: 1, awaiting_validation: 1, awaiting_revalidation: 0, blocked_incomplete_audit: 0, oldest_queued_at: '2026-08-04T00:00:00Z' }, last_attempt: null,
} satisfies ThemeCompilerHealth

const seedCache = () => useStore.setState({
  themes: [cachedTheme],
  themeFormationQueue: cachedFormationQueue,
  themeCompilerHealth: cachedCompilerHealth,
  themesHistoryDays: 9,
  themesGeneratedAt: '2026-08-04T00:00:00Z',
  themesProjectedAt: '2026-08-04T00:00:30Z',
  themesStatus: 'ready',
  themesLoading: true,
  selectedTheme: cachedTheme.theme_id,
  themesView: null,
})

seedCache()
useStore.setState({ themesGeo: { country: '', geoRegion: '', label: 'Everywhere' }, themesSubject: null })
useStore.getState().setThemesGeo({ country: 'IN', geoRegion: 'asia', label: 'India' })
assert.deepEqual(useStore.getState().themes, [], 'a new geography clears the prior index immediately')
assert.equal(useStore.getState().themeFormationQueue, null, 'a new geography clears formation candidates from the prior slice')
assert.equal(useStore.getState().themeCompilerHealth, null, 'a new geography clears compiler health from the prior slice')
assert.equal(useStore.getState().themesGeneratedAt, null)
assert.equal(useStore.getState().themesProjectedAt, null)
assert.equal(useStore.getState().themesHistoryDays, 0)
assert.equal(useStore.getState().themesStatus, 'idle', 'a closed surface waits honestly for its next open')
assert.equal(useStore.getState().themesLoading, false)
assert.equal(useStore.getState().selectedTheme, null)

seedCache()
useStore.setState({ themesGeo: { country: 'IN', geoRegion: 'asia', label: 'India' } })
useStore.getState().setThemesGeo({ country: 'IN', geoRegion: 'asia', label: 'India (updated label)' })
assert.deepEqual(useStore.getState().themes, [cachedTheme], 'a label-only correction keeps the matching cached slice')
assert.equal(useStore.getState().themeFormationQueue?.candidates[0]?.theme_id, 'THM-a1b2c3d4', 'a label-only correction keeps the matching queue')
assert.equal(useStore.getState().themesGeneratedAt, '2026-08-04T00:00:00Z')
assert.equal(useStore.getState().themesProjectedAt, '2026-08-04T00:00:30Z')

seedCache()
useStore.setState({ themesSubject: null })
useStore.getState().setThemesSubject('GOLD')
assert.deepEqual(useStore.getState().themes, [], 'a new subject clears the prior index immediately')
assert.equal(useStore.getState().themeFormationQueue, null, 'a new subject clears the prior formation queue')
assert.equal(useStore.getState().themesGeneratedAt, null)
assert.equal(useStore.getState().themesStatus, 'idle')

const indexFor = (themes: Theme[], generatedAt: string): ThemesIndex => ({
  generated_at: generatedAt,
  projected_at: new Date(Date.parse(generatedAt) + 30_000).toISOString(),
  themes,
  counts: { hot: 0, active: themes.length, cooling: 0, parked: 0, retired: 0, total: themes.length },
  history_days: 12,
})
const indexOf = (t: Theme, generatedAt: string): ThemesIndex => indexFor([t], generatedAt)
const supportingEvidence = (eventId: string, slug: string): NonNullable<Theme['evidence']> => [
  { event_id: eventId, headline: `${slug} why-now source`, found_at: '2026-08-04T00:00:00Z', score: 82, source_tier: 'news', source_name: 'Evidence Wire', url: `https://example.test/${slug}`, stance: 'supports' },
  { event_id: `${eventId}-2`, headline: `${slug} issuer corroboration`, found_at: '2026-08-03T23:00:00Z', score: 80, source_tier: 'company', source_name: 'Issuer Disclosure', url: `https://example.test/${slug}/2`, stance: 'supports' },
  { event_id: `${eventId}-3`, headline: `${slug} independent corroboration`, found_at: '2026-08-03T22:00:00Z', score: 78, source_tier: 'news', source_name: 'Second Evidence Wire', url: `https://example.test/${slug}/3`, stance: 'supports' },
]
const actionableAssessment = {
  status: 'actionable',
  activity: 'reinforced',
  conviction: 'high',
  reasons: ['Current supported evidence and a first-order ticker direction.'],
  blockers: [],
  metrics: {
    recent_6h_flow: 3, prior_6h_flow: 1, unique_evidence_count: 3, high_quality_evidence_count: 3,
    narrative_support_count: 3, narrative_coherence_pct: 80, recurring_narrative_token_count: 2,
    first_order_directional_ticker_count: 1,
    recent_24h_support_count: 3, recent_24h_challenge_count: 0, off_core_evidence_count: 0,
  },
} satisfies ThemeSurfaceAssessment
const newerTheme = {
  ...cachedTheme,
  theme_id: 'THM-NEW',
  name: 'New response',
  rev: 2,
  activity: 'reinforced',
  conviction: 'high',
  narrative: {
    version: 1,
    thesis: 'A specific change reaches New Response Co earnings through a validated mechanism.',
    why_now: 'New supporting evidence landed today.',
    why_now_event_id: 'EV-NEW',
    mechanism_steps: ['The industry input changes.', 'New Response Co revenue responds.'],
    horizon: 'months',
    falsifier: 'The named input reverses by quarter-end.',
    validated_at: '2026-08-04T00:00:00Z',
  },
  assessment: actionableAssessment,
  evidence: supportingEvidence('EV-NEW', 'new-response'),
  qualified_expressions: [{
    name: 'New Response Co', name_key: 'new-response-co', ticker: 'NEW', listing_country: 'US', side: 'beneficiary', role: 'direct', mechanism: 'The industry input change reaches company revenue directly.', evidence_event_ids: ['EV-NEW'],
  }],
} satisfies Theme
const detailOf = (t: Theme): ThemeDetail => ({
  theme: t,
  scores: { freshness: 50, magnitude: 50, breadth: 50, persistence: 50, composite: 50 },
  members: [],
  companies_by_order: { first: [], second: [], third: [] },
  sectors: [],
  related_themes: [],
  keywords: [],
})
const briefOf = (t: Theme): ThemeBrief => ({
  theme_id: t.theme_id,
  brief: `${t.name} saved brief`,
  generation: 'deterministic',
  generated_at: '2026-08-04T00:00:00Z',
})

type Pending = { resolve: (index: ThemesIndex) => void; reject: (error: Error) => void }
const originalNewsThemes = api.newsThemes
try {
  let pending: Pending[] = []
  api.newsThemes = () => new Promise<ThemesIndex>((resolve, reject) => pending.push({ resolve, reject }))
  useStore.setState({
    activeSwarm: 'owner-a', wireSwarm: 'owner-a', swarms: [],
    themes: [newerTheme], themesStatus: 'loading', themesGeneratedAt: null,
    selectedTheme: newerTheme.theme_id, themeDetail: detailOf(newerTheme), themeBrief: briefOf(newerTheme),
    themesGeo: { country: '', geoRegion: '', label: '' }, themesSubject: null, themesView: 'map',
  })

  const oldRequest = useStore.getState().refreshThemes()
  const newRequest = useStore.getState().refreshThemes()
  pending[1].resolve({ ...indexOf(newerTheme, '2026-08-04T00:02:00Z'), formation_queue: cachedFormationQueue, compiler_health: cachedCompilerHealth })
  await newRequest
  pending[0].resolve(indexOf(cachedTheme, '2026-08-04T00:01:00Z'))
  await oldRequest
  assert.equal(useStore.getState().themes[0]?.theme_id, newerTheme.theme_id, 'a slower same-slice request cannot overwrite the newest response')
  assert.equal(useStore.getState().themesGeneratedAt, '2026-08-04T00:02:00Z')
  assert.equal(useStore.getState().themesProjectedAt, '2026-08-04T00:02:30.000Z', 'read-time projection is retained separately from the successful-stage clock')
  assert.equal(useStore.getState().selectedTheme, newerTheme.theme_id, 'a superseded response that omits the open theme cannot dismiss the newer selection')
  assert.equal(useStore.getState().themeDetail?.theme.theme_id, newerTheme.theme_id)
  assert.equal(useStore.getState().themeFormationQueue?.candidates[0]?.investable, false, 'the additive formation queue lands separately from validated themes')
  assert.equal(useStore.getState().themeCompilerHealth?.blocker, 'daily_cap', 'compiler capacity health remains visible to the Themes surface')

  pending = []
  useStore.setState({
    themes: [cachedTheme], themesStatus: 'ready', themesGeneratedAt: '2026-08-04T00:02:00Z',
    selectedTheme: cachedTheme.theme_id, themeDetail: detailOf(cachedTheme), themeDetailError: 'old error', themeBrief: briefOf(cachedTheme),
    themesLoading: true, themeBriefLoading: true,
  })
  const authoritativeRemoval = useStore.getState().refreshThemes()
  pending[0].resolve(indexOf(newerTheme, '2026-08-04T00:02:30Z'))
  await authoritativeRemoval
  assert.equal(useStore.getState().selectedTheme, null, 'an authoritative index closes a selected theme it no longer contains')
  assert.equal(useStore.getState().themeDetail, null)
  assert.equal(useStore.getState().themeDetailError, null)
  assert.equal(useStore.getState().themeBrief, null)
  assert.equal(useStore.getState().themesLoading, false)
  assert.equal(useStore.getState().themeBriefLoading, false)

  pending = []
  const oldFailure = useStore.getState().refreshThemes()
  const newSuccess = useStore.getState().refreshThemes()
  pending[1].resolve(indexOf(newerTheme, '2026-08-04T00:03:00Z'))
  await newSuccess
  pending[0].reject(new Error('older request failed'))
  await oldFailure
  assert.equal(useStore.getState().themesStatus, 'ready', 'an older failure cannot turn a newer success red')

  pending = []
  const removedDuringLoad = { ...cachedTheme, theme_id: 'THM-REMOVED-DURING-LOAD', name: 'Removed during load', rev: 4 }
  const survivesLoad = { ...newerTheme, theme_id: 'THM-SURVIVES-LOAD', name: 'Survives load', rev: 5 }
  useStore.setState({
    themes: [removedDuringLoad], themesStatus: 'loading', themesGeneratedAt: null, themesView: 'map',
    activeSwarm: 'owner-a', wireSwarm: 'owner-a', swarms: [],
    themesGeo: { country: '', geoRegion: '', label: '' }, themesSubject: null,
  })
  const globalLoad = useStore.getState().refreshThemes()
  useStore.getState()._handleNewsEvent({ type: 'theme-remove', removal: { theme_id: removedDuringLoad.theme_id, reason: 'retired', merged_into: null, rev: 4 } })
  assert.equal(pending.length, 1, 'a global removal does not start a redundant replacement request')
  pending[0].resolve(indexFor([removedDuringLoad, survivesLoad], '2026-08-04T00:03:30Z'))
  await globalLoad
  assert.equal(useStore.getState().themesStatus, 'ready', 'the sole global response still settles a load after a removal')
  assert.deepEqual(useStore.getState().themes.map((t) => t.theme_id), [survivesLoad.theme_id], 'the tombstone filters the removed row out of that response')

  pending = []
  const formationRemovedDuringLoad = {
    ...cachedFormationQueue,
    candidates: [{ ...cachedFormationQueue.candidates[0], theme_id: 'THM-deadbeef', provisional_label: 'Removed formation row' }],
  } satisfies ThemeFormationQueue
  const formationRemovalHealth = {
    ...cachedCompilerHealth,
    queue: { ...cachedCompilerHealth.queue, total: 1, awaiting_validation: 1 },
  } satisfies ThemeCompilerHealth
  useStore.setState({
    themes: [], themeFormationQueue: formationRemovedDuringLoad, themeCompilerHealth: formationRemovalHealth,
    themesStatus: 'loading', themesGeneratedAt: null, themesView: 'board', selectedTheme: null,
    activeSwarm: 'owner-a', wireSwarm: 'owner-a', swarms: [],
    themesGeo: { country: '', geoRegion: '', label: '' }, themesSubject: null,
  })
  const formationGlobalLoad = useStore.getState().refreshThemes()
  useStore.getState()._handleNewsEvent({ type: 'theme-remove', removal: { theme_id: 'THM-deadbeef', reason: 'retired', merged_into: null, rev: 4 } })
  assert.deepEqual(useStore.getState().themeFormationQueue?.candidates, [], 'SSE removes the disclosed formation row while a global index read is in flight')
  pending[0].resolve({
    ...indexFor([], '2026-08-04T00:03:35Z'),
    formation_queue: formationRemovedDuringLoad,
    compiler_health: formationRemovalHealth,
  })
  await formationGlobalLoad
  assert.deepEqual(useStore.getState().themeFormationQueue?.candidates, [], 'a pre-removal HTTP response cannot resurrect the tombstoned formation row')
  assert.equal(useStore.getState().themeFormationQueue?.total, 0)
  assert.equal(useStore.getState().themeCompilerHealth?.queue.total, 0)

  pending = []
  const beforeLiveUpdate = { ...cachedTheme, theme_id: 'THM-SAME-REV-UPDATE', name: 'Before live assessment', rev: 8 }
  const liveUpdate = { ...beforeLiveUpdate, name: 'After live assessment', assessment: undefined }
  useStore.setState({
    themes: [beforeLiveUpdate], themesStatus: 'loading', themesGeneratedAt: null, themesView: 'map',
    themeFormationQueue: cachedFormationQueue, themeCompilerHealth: cachedCompilerHealth,
    activeSwarm: 'owner-a', wireSwarm: 'owner-a', swarms: [],
    themesGeo: { country: '', geoRegion: '', label: '' }, themesSubject: null,
  })
  const preUpdateLoad = useStore.getState().refreshThemes()
  useStore.getState()._handleNewsEvent({ type: 'theme-update', theme: liveUpdate })
  assert.equal(useStore.getState().themeFormationQueue?.candidates[0]?.theme_id, 'THM-a1b2c3d4', 'an unrelated Context upsert does not erase disclosed compiler debt')
  pending[0].resolve(indexOf(beforeLiveUpdate, '2026-08-04T00:03:40Z'))
  await Promise.resolve()
  await Promise.resolve()
  assert.equal(useStore.getState().themes[0]?.name, liveUpdate.name, 'a pre-SSE response never overwrites a same-revision live projection')
  assert.equal(pending.length, 2, 'an SSE upsert during load triggers one authoritative replacement request')
  pending[1].resolve(indexOf(liveUpdate, '2026-08-04T00:03:41Z'))
  await preUpdateLoad
  assert.equal(useStore.getState().themesStatus, 'ready')
  assert.equal(useStore.getState().themes[0]?.name, liveUpdate.name)

  const promotedTheme = { ...newerTheme, theme_id: 'THM-a1b2c3d4', name: 'Validated pending pattern' }
  useStore.setState({
    themes: [], themesView: 'map', themesStatus: 'ready',
    themeFormationQueue: cachedFormationQueue, themeCompilerHealth: cachedCompilerHealth,
    themesGeo: { country: '', geoRegion: '', label: '' }, themesSubject: null,
  })
  useStore.getState()._handleNewsEvent({ type: 'theme-update', theme: promotedTheme })
  assert.equal(useStore.getState().themes[0]?.theme_id, promotedTheme.theme_id)
  assert.equal(useStore.getState().themeFormationQueue?.total, 0, 'a validated SSE promotion removes only its matching formation candidate')
  assert.deepEqual(useStore.getState().themeFormationQueue?.candidates, [])
  assert.equal(useStore.getState().themeCompilerHealth?.queue.total, 0)

  useStore.setState({
    themes: [], themesView: 'board', themesStatus: 'ready',
    themeFormationQueue: cachedFormationQueue, themeCompilerHealth: cachedCompilerHealth,
    themesGeo: { country: '', geoRegion: '', label: '' }, themesSubject: null,
  })
  useStore.getState()._handleNewsEvent({ type: 'theme-remove', removal: { theme_id: 'THM-a1b2c3d4', reason: 'retired', merged_into: null, rev: 2 } })
  assert.deepEqual(useStore.getState().themeFormationQueue?.candidates, [], 'an SSE retirement removes its matching non-investable formation row immediately')
  assert.equal(useStore.getState().themeFormationQueue?.total, 0)
  assert.equal(useStore.getState().themeCompilerHealth?.queue.total, 0, 'the exact removal reconciles aggregate compiler debt for that disclosed row')
  assert.equal(useStore.getState().themeCompilerHealth?.state, 'idle')

  pending = []
  useStore.setState({ themes: [], themeFormationQueue: cachedFormationQueue, themeCompilerHealth: cachedCompilerHealth, themesStatus: 'loading', themesGeneratedAt: null, themesView: 'map', activeSwarm: 'owner-a', wireSwarm: 'owner-a' })
  const priorOwner = useStore.getState().refreshThemes()
  useStore.getState()._enterWire('owner-b')
  pending[0].resolve(indexOf(cachedTheme, '2026-08-04T00:04:00Z'))
  await priorOwner
  assert.deepEqual(useStore.getState().themes, [], 'a response from the wire just left cannot populate its replacement')
  assert.equal(useStore.getState().themeFormationQueue, null, 'a wire-owner change clears the prior owner\'s formation queue')
  assert.equal(useStore.getState().themeCompilerHealth, null)
  assert.equal(useStore.getState().wireSwarm, 'owner-b')

  pending = []
  useStore.setState({ themesView: null, activeSwarm: 'owner-b', wireSwarm: 'owner-b', themesGeo: { country: '', geoRegion: '', label: '' }, themesSubject: null })
  const priorSlice = useStore.getState().refreshThemes()
  useStore.getState().setThemesGeo({ country: 'IN', geoRegion: 'asia', label: 'India' })
  pending[0].resolve(indexOf(cachedTheme, '2026-08-04T00:05:00Z'))
  await priorSlice
  assert.deepEqual(useStore.getState().themes, [], 'a filter change invalidates the old request before the debounced replacement starts')

  pending = []
  const scopedTheme = { ...newerTheme, theme_id: 'THM-GOLD-SCOPED', name: 'Gold-scoped row' }
  const globalPatch = { ...newerTheme, theme_id: 'THM-GLOBAL-PATCH', name: 'Global patch' }
  useStore.setState({
    themesView: 'map', themes: [scopedTheme], themesStatus: 'ready',
    activeSwarm: 'owner-b', wireSwarm: 'owner-b', swarms: [],
    themesGeo: { country: '', geoRegion: '', label: '' }, themesSubject: 'GOLD',
  })
  useStore.getState()._handleNewsEvent({ type: 'theme-update', theme: globalPatch })
  assert.deepEqual(useStore.getState().themes.map((t) => t.theme_id), [scopedTheme.theme_id], 'a subject slice never upserts a global SSE summary')
  await new Promise((resolve) => setTimeout(resolve, 1250))
  assert.equal(pending.length, 1, 'a subject-sliced SSE update refetches the full matching projection')
  pending[0].resolve(indexOf(scopedTheme, '2026-08-04T00:06:00Z'))
  await Promise.resolve()
  await Promise.resolve()

  pending = []
  useStore.setState({ themesView: 'map', themesSubject: null, themesGeo: { country: '', geoRegion: '', label: '' }, themesStatus: 'ready' })
  useStore.getState()._handleNewsEvent({ type: 'news-connected' })
  assert.equal(pending.length, 1, 'SSE reconnect reconciles an open Themes surface from the authoritative index')
  pending[0].resolve(indexOf(newerTheme, '2026-08-04T00:07:00Z'))
  await Promise.resolve()
  await Promise.resolve()

  pending = []
  useStore.setState({
    staticMode: true,
    themesView: null,
    themes: [cachedTheme],
    themesStatus: 'ready',
    selectedTheme: cachedTheme.theme_id,
    themeDetail: detailOf(cachedTheme),
    themeDetailError: 'cached detail error',
    themeBrief: briefOf(cachedTheme),
    themesLoading: true,
    themeBriefLoading: true,
    activeSwarm: 'owner-b', wireSwarm: 'owner-b', swarms: [],
    themesGeo: { country: '', geoRegion: '', label: '' }, themesSubject: null,
  })
  const reopenThemes = useStore.getState().openThemes('board')
  assert.equal(pending.length, 1)
  assert.equal(useStore.getState().selectedTheme, null, 'an explicit Themes-tab open returns to the first-look screen immediately')
  assert.equal(useStore.getState().themeDetail, null)
  assert.equal(useStore.getState().themeDetailError, null)
  assert.equal(useStore.getState().themeBrief, null)
  assert.equal(useStore.getState().themesLoading, false)
  assert.equal(useStore.getState().themeBriefLoading, false)
  pending[0].resolve(indexOf(cachedTheme, '2026-08-04T00:08:00Z'))
  await reopenThemes
  assert.equal(useStore.getState().selectedTheme, null, 'refresh completion does not resurrect the prior deep dive')
  useStore.setState({ staticMode: false })
} finally {
  api.newsThemes = originalNewsThemes
}

// Explicit recovery is busy immediately and coalesces repeated clicks, while background refreshes above
// keep their separate newest-request-wins generations.
try {
  let retryCalls = 0
  let resolveRetry!: (index: ThemesIndex) => void
  api.newsThemes = () => {
    retryCalls++
    return new Promise<ThemesIndex>((resolve) => { resolveRetry = resolve })
  }
  useStore.setState({
    themes: [], themesStatus: 'error', themesGeneratedAt: null, themesProjectedAt: null,
    themesView: 'board', activeSwarm: 'owner-b', wireSwarm: 'owner-b', swarms: [],
    themesGeo: { country: '', geoRegion: '', label: '' }, themesSubject: null,
  })
  const firstRetry = useStore.getState().retryThemes()
  const duplicateRetry = useStore.getState().retryThemes()
  assert.equal(useStore.getState().themesStatus, 'loading', 'retry enters a visible busy state before awaiting the network')
  assert.equal(retryCalls, 1, 'two recovery clicks share one in-flight Themes request')
  resolveRetry(indexOf(newerTheme, '2026-08-04T00:08:30Z'))
  await Promise.all([firstRetry, duplicateRetry])
  assert.equal(useStore.getState().themesStatus, 'ready')
} finally {
  api.newsThemes = originalNewsThemes
}

const originalNewsTheme = api.newsTheme
const originalNewsThemeBrief = api.newsThemeBrief
try {
  let detailArgs: Parameters<typeof api.newsTheme> | null = null
  api.newsTheme = async (...args) => {
    detailArgs = args
    return detailOf(newerTheme)
  }
  useStore.setState({
    swarms: [{
      id: 'commodities', label: 'Commodities', color: '#999', unit: 'commodity', order: 1, layout: 'constellation',
      wire: { eventScope: 'commodity', groupBy: 'subject', subjectField: 'commodity', defaultView: 'themes' },
    }],
    activeSwarm: 'commodities', wireSwarm: 'commodities', swarmSubjectList: ['GOLD'],
    themes: [newerTheme], themesStatus: 'ready', themesView: 'board', selectedTheme: null,
    themeDetail: null, themeDetailError: null, themesLoading: false,
    themesGeo: { country: 'IN', geoRegion: 'asia', label: 'India' }, themesSubject: 'GOLD',
  })
  await useStore.getState().selectTheme(newerTheme.theme_id)
  assert.deepEqual(detailArgs, [
    newerTheme.theme_id,
    { country: 'IN', geoRegion: 'asia' },
    { scope: 'commodity', commodity: 'GOLD' },
  ], 'theme detail receives the exact geography and subject projection that produced its list row')
  assert.equal(useStore.getState().themeDetail?.theme.theme_id, newerTheme.theme_id)
  await useStore.getState().selectTheme(null)
} finally {
  api.newsTheme = originalNewsTheme
}

try {
  api.newsTheme = async () => { throw new Error('detail endpoint unavailable') }
  api.newsThemeBrief = async () => { throw new Error('brief endpoint unavailable') }
  await useStore.getState().selectTheme('THM-DETAIL-FAIL')
  await new Promise((resolve) => setTimeout(resolve, 0))
  assert.equal(useStore.getState().themesLoading, false)
  assert.equal(useStore.getState().themeDetail, null)
  assert.equal(useStore.getState().themeDetailError, 'detail endpoint unavailable', 'a rejected detail GET becomes an explicit recoverable error state')
  await useStore.getState().selectTheme(null)
} finally {
  api.newsTheme = originalNewsTheme
  api.newsThemeBrief = originalNewsThemeBrief
}

try {
  type DetailPending = { resolve: (detail: ThemeDetail) => void; reject: (error: Error) => void }
  let pendingDetails: DetailPending[] = []
  api.newsTheme = () => new Promise<ThemeDetail>((resolve, reject) => pendingDetails.push({ resolve, reject }))
  useStore.setState({
    themes: [newerTheme], themesStatus: 'ready', themesView: 'board', selectedTheme: null,
    themeDetail: null, themeDetailError: null, themesLoading: false,
    themesGeo: { country: '', geoRegion: '', label: '' }, themesSubject: null,
    activeSwarm: 'owner-b', wireSwarm: 'owner-b', swarms: [],
  })
  const olderDetailRead = useStore.getState().selectTheme(newerTheme.theme_id)
  const newerDetailRead = useStore.getState().selectTheme(newerTheme.theme_id)
  pendingDetails[1].resolve(detailOf({ ...newerTheme, composite: 72 }))
  await newerDetailRead
  pendingDetails[0].resolve(detailOf({ ...newerTheme, composite: 71 }))
  await olderDetailRead
  assert.equal(useStore.getState().themeDetail?.theme.composite, 72, 'a slower same-id detail response cannot overwrite the newer retry')

  pendingDetails = []
  const changedSummary = { ...newerTheme, name: 'Updated response' }
  useStore.getState()._handleNewsEvent({ type: 'theme-update', theme: changedSummary })
  assert.equal(useStore.getState().themeDetail, null, 'a live contract change invalidates the open dossier synchronously')
  assert.equal(useStore.getState().themesLoading, true, 'the replacement dossier exposes its loading state')
  assert.equal(pendingDetails.length, 1, 'a changed open global theme starts one replacement detail read')
  pendingDetails[0].resolve(detailOf(changedSummary))
  await new Promise((resolve) => setTimeout(resolve, 0))
  assert.equal(useStore.getState().themeDetail?.theme.name, changedSummary.name, 'the open dossier lands only after it matches the current contract')
  await useStore.getState().selectTheme(null)
} finally {
  api.newsTheme = originalNewsTheme
}

const highCompositeContext = { ...cachedTheme, theme_id: 'THM-HIGH-CONTEXT', name: 'High composite context', composite: 99 }
const lowCompositeActionable = {
  ...newerTheme,
  theme_id: 'THM-LOW-ACTIONABLE',
  name: 'Low composite actionable',
  composite: 20,
  activity: 'reinforced',
  conviction: 'high',
  off_core_member_count: 0,
  narrative: {
    version: 1,
    thesis: 'A specific change reaches Low Actionable Co earnings through a validated mechanism.',
    why_now: 'New supporting evidence landed today.',
    why_now_event_id: 'EV-LOW-ACTIONABLE',
    mechanism_steps: ['The industry input changes.', 'Low Actionable Co revenue responds.'],
    horizon: 'months',
    falsifier: 'The named input reverses by quarter-end.',
    validated_at: '2026-08-04T00:00:00Z',
  },
  assessment: actionableAssessment,
  evidence: supportingEvidence('EV-LOW-ACTIONABLE', 'low-actionable'),
  qualified_expressions: [{
    name: 'Low Actionable Co', name_key: 'low-actionable-co', ticker: 'LOW', listing_country: 'US', side: 'beneficiary', role: 'direct', mechanism: 'The industry input change reaches company revenue directly.', evidence_event_ids: ['EV-LOW-ACTIONABLE'],
  }],
} satisfies Theme
useStore.setState({
  swarms: [], activeSwarm: 'owner-b', wireSwarm: 'owner-b', themesView: 'map',
  themesGeo: { country: '', geoRegion: '', label: '' }, themesSubject: null,
  themes: [highCompositeContext],
})
useStore.getState()._handleNewsEvent({ type: 'theme-update', theme: lowCompositeActionable })
assert.deepEqual(
  useStore.getState().themes.map((t) => t.theme_id),
  [lowCompositeActionable.theme_id, highCompositeContext.theme_id],
  'global SSE patches retain the server evidence-first order instead of sorting by composite alone',
)

// Explicit removals delete the row immediately and their revision tombstone blocks an older buffered
// theme-update frame from resurrecting the ghost.
useStore.setState({
  swarms: [], activeSwarm: 'owner-b', wireSwarm: 'owner-b', themesView: 'map',
  themesGeo: { country: '', geoRegion: '', label: '' }, themesSubject: null,
  themes: [cachedTheme, newerTheme], selectedTheme: cachedTheme.theme_id, themeDetail: null, themeBrief: null,
})
useStore.getState()._handleNewsEvent({ type: 'theme-remove', removal: { theme_id: cachedTheme.theme_id, reason: 'retired', merged_into: null, rev: 1 } })
assert.deepEqual(useStore.getState().themes.map((t) => t.theme_id), [newerTheme.theme_id])
assert.equal(useStore.getState().selectedTheme, null, 'a removed open theme cannot remain as a stale deep dive')
useStore.getState()._handleNewsEvent({ type: 'theme-update', theme: cachedTheme })
assert.deepEqual(useStore.getState().themes.map((t) => t.theme_id), [newerTheme.theme_id], 'an equal/older update cannot resurrect a removed theme')

console.log('themes slice cache: filters, request generations, owner guards, and removal events passed')
