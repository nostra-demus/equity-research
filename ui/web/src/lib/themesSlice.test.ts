// The Themes index is a slice-specific cache. A geography or subject change must clear it synchronously
// so old rows can never wear a new filter label while the matching refresh is pending or has failed.
import assert from 'node:assert/strict'
import { api } from './api'
import { useStore } from './store'
import type { Theme, ThemeBrief, ThemeDetail, ThemesIndex, ThemeSurfaceAssessment } from './themes'

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

const seedCache = () => useStore.setState({
  themes: [cachedTheme],
  themesHistoryDays: 9,
  themesGeneratedAt: '2026-08-04T00:00:00Z',
  themesStatus: 'ready',
  themesLoading: true,
  selectedTheme: cachedTheme.theme_id,
  themesView: null,
})

seedCache()
useStore.setState({ themesGeo: { country: '', geoRegion: '', label: 'Everywhere' }, themesSubject: null })
useStore.getState().setThemesGeo({ country: 'IN', geoRegion: 'asia', label: 'India' })
assert.deepEqual(useStore.getState().themes, [], 'a new geography clears the prior index immediately')
assert.equal(useStore.getState().themesGeneratedAt, null)
assert.equal(useStore.getState().themesHistoryDays, 0)
assert.equal(useStore.getState().themesStatus, 'idle', 'a closed surface waits honestly for its next open')
assert.equal(useStore.getState().themesLoading, false)
assert.equal(useStore.getState().selectedTheme, null)

seedCache()
useStore.setState({ themesGeo: { country: 'IN', geoRegion: 'asia', label: 'India' } })
useStore.getState().setThemesGeo({ country: 'IN', geoRegion: 'asia', label: 'India (updated label)' })
assert.deepEqual(useStore.getState().themes, [cachedTheme], 'a label-only correction keeps the matching cached slice')
assert.equal(useStore.getState().themesGeneratedAt, '2026-08-04T00:00:00Z')

seedCache()
useStore.setState({ themesSubject: null })
useStore.getState().setThemesSubject('GOLD')
assert.deepEqual(useStore.getState().themes, [], 'a new subject clears the prior index immediately')
assert.equal(useStore.getState().themesGeneratedAt, null)
assert.equal(useStore.getState().themesStatus, 'idle')

const indexFor = (themes: Theme[], generatedAt: string): ThemesIndex => ({
  generated_at: generatedAt,
  themes,
  counts: { hot: 0, active: themes.length, cooling: 0, parked: 0, retired: 0, total: themes.length },
  history_days: 12,
})
const indexOf = (t: Theme, generatedAt: string): ThemesIndex => indexFor([t], generatedAt)
const newerTheme = { ...cachedTheme, theme_id: 'THM-NEW', name: 'New response', rev: 2 }
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
  pending[1].resolve(indexOf(newerTheme, '2026-08-04T00:02:00Z'))
  await newRequest
  pending[0].resolve(indexOf(cachedTheme, '2026-08-04T00:01:00Z'))
  await oldRequest
  assert.equal(useStore.getState().themes[0]?.theme_id, newerTheme.theme_id, 'a slower same-slice request cannot overwrite the newest response')
  assert.equal(useStore.getState().themesGeneratedAt, '2026-08-04T00:02:00Z')
  assert.equal(useStore.getState().selectedTheme, newerTheme.theme_id, 'a superseded response that omits the open theme cannot dismiss the newer selection')
  assert.equal(useStore.getState().themeDetail?.theme.theme_id, newerTheme.theme_id)

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
  const beforeLiveUpdate = { ...cachedTheme, theme_id: 'THM-SAME-REV-UPDATE', name: 'Before live assessment', rev: 8 }
  const liveUpdate = { ...beforeLiveUpdate, name: 'After live assessment', assessment: undefined }
  useStore.setState({
    themes: [beforeLiveUpdate], themesStatus: 'loading', themesGeneratedAt: null, themesView: 'map',
    activeSwarm: 'owner-a', wireSwarm: 'owner-a', swarms: [],
    themesGeo: { country: '', geoRegion: '', label: '' }, themesSubject: null,
  })
  const preUpdateLoad = useStore.getState().refreshThemes()
  useStore.getState()._handleNewsEvent({ type: 'theme-update', theme: liveUpdate })
  pending[0].resolve(indexOf(beforeLiveUpdate, '2026-08-04T00:03:40Z'))
  await Promise.resolve()
  await Promise.resolve()
  assert.equal(useStore.getState().themes[0]?.name, liveUpdate.name, 'a pre-SSE response never overwrites a same-revision live projection')
  assert.equal(pending.length, 2, 'an SSE upsert during load triggers one authoritative replacement request')
  pending[1].resolve(indexOf(liveUpdate, '2026-08-04T00:03:41Z'))
  await preUpdateLoad
  assert.equal(useStore.getState().themesStatus, 'ready')
  assert.equal(useStore.getState().themes[0]?.name, liveUpdate.name)

  pending = []
  useStore.setState({ themes: [], themesStatus: 'loading', themesGeneratedAt: null, themesView: 'map', activeSwarm: 'owner-a', wireSwarm: 'owner-a' })
  const priorOwner = useStore.getState().refreshThemes()
  useStore.getState()._enterWire('owner-b')
  pending[0].resolve(indexOf(cachedTheme, '2026-08-04T00:04:00Z'))
  await priorOwner
  assert.deepEqual(useStore.getState().themes, [], 'a response from the wire just left cannot populate its replacement')
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

const originalNewsTheme = api.newsTheme
const originalNewsThemeBrief = api.newsThemeBrief
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

const actionableAssessment = {
  status: 'actionable',
  reasons: ['Current supported evidence and a first-order ticker direction.'],
  blockers: [],
  metrics: {
    recent_6h_flow: 4, prior_6h_flow: 1, unique_evidence_count: 3, high_quality_evidence_count: 2,
    narrative_support_count: 3, narrative_coherence_pct: 80, recurring_narrative_token_count: 2,
    first_order_directional_ticker_count: 1,
  },
} satisfies ThemeSurfaceAssessment
const highCompositeContext = { ...cachedTheme, theme_id: 'THM-HIGH-CONTEXT', name: 'High composite context', composite: 99 }
const lowCompositeActionable = {
  ...newerTheme,
  theme_id: 'THM-LOW-ACTIONABLE',
  name: 'Low composite actionable',
  composite: 20,
  assessment: actionableAssessment,
  evidence: [{ event_id: 'EV-LOW-ACTIONABLE', headline: 'Low composite actionable proof', found_at: '2026-08-04T00:00:00Z', score: 82, source_tier: 'news' }],
  qualified_expressions: [{
    name: 'Low Actionable Co', name_key: 'low-actionable-co', ticker: 'LOW', listing_country: 'US', side: 'beneficiary', evidence_event_ids: ['EV-LOW-ACTIONABLE'],
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
