import assert from 'node:assert/strict'

const values = new Map<string, string>()
const previousWindow = (globalThis as any).window
const previousDocument = (globalThis as any).document
const previousStorage = (globalThis as any).localStorage

;(globalThis as any).window = {
  __ENGINE_LIVE__: true,
  WebGLRenderingContext: undefined,
  addEventListener: () => {},
  matchMedia: () => ({ matches: true }),
}
;(globalThis as any).document = {
  hidden: false,
  addEventListener: () => {},
  createElement: () => ({ getContext: () => null }),
}
;(globalThis as any).localStorage = {
  getItem: (key: string) => values.get(key) ?? null,
  setItem: (key: string, value: string) => { values.set(key, value) },
}

const { api } = await import('./api')
const { CODEX_EXECUTION_PROFILE, emptyProviders, providerCatalogFallback, RUN_PROVIDER_STORAGE_KEY } = await import('./provider')
const { useStore } = await import('./store')

const originalProviders = api.providers
const originalProviderCheck = api.providerCheck
const originalEstimate = api.estimate
const originalCancelSubject = api.cancelSubject
const originalPromoteIdea = api.promoteIdea
const originalRefreshActiveRuns = useStore.getState().refreshActiveRuns
const originalScRefreshBoard = useStore.getState().scRefreshBoard

try {
  values.set(RUN_PROVIDER_STORAGE_KEY, 'codex')
  let estimateCalls = 0
  api.estimate = async () => { estimateCalls++; throw new Error('must not estimate') }
  useStore.setState({
    staticMode: false,
    health: 'online',
    runProvider: 'codex',
    providers: emptyProviders(),
    selectedTicker: 'AAA',
    activeSwarm: 'research',
    selectToken: 1,
    activeRuns: {},
    launchPending: null,
  })
  await useStore.getState().requestFull()
  assert.equal(estimateCalls, 0, 'persisted Codex cannot race a launch ahead of provider discovery')

  api.providers = async () => providerCatalogFallback('old server')
  await useStore.getState().refreshProviders()
  assert.equal(useStore.getState().runProvider, 'claude', 'old-server fallback resets the live choice')
  assert.equal(values.get(RUN_PROVIDER_STORAGE_KEY), 'claude', 'old-server fallback resets persisted Codex')
  assert.equal(useStore.getState().providers.codex.available, false)

  const bothAvailable = {
    claude: { provider: 'claude' as const, enabled: true, available: true, checked: true, status: 'available', profile: { key: 'claude:opus:default', parentModel: 'opus', parentReasoning: 'default' } },
    codex: { provider: 'codex' as const, enabled: true, available: true, checked: true, status: 'available', profile: CODEX_EXECUTION_PROFILE },
    catalogState: 'valid' as const,
  }
  estimateCalls = 0
  useStore.setState({
    staticMode: false,
    health: 'updating',
    runProvider: 'claude',
    providers: bothAvailable,
    selectedTicker: 'AAA',
    activeSwarm: 'research',
    selectToken: 1,
    activeRuns: {},
    launchPending: null,
  })
  await useStore.getState().requestFull()
  assert.equal(estimateCalls, 0, 'a reviewed deployment blocks launch planning before any spend boundary')
  let promoteCalls = 0
  api.promoteIdea = async () => { promoteCalls++; throw new Error('must not promote') }
  await assert.rejects(
    () => useStore.getState().scPromoteIdea({ idea_id: 'IDEA-1' } as any),
    /update in progress/i,
  )
  assert.equal(promoteCalls, 0, 'a reviewed deployment blocks direct signal promotion before the paid boundary')
  let cancelCalls = 0
  api.cancelSubject = async () => { cancelCalls++; return { ok: true, cancelled: ['run-1'] } }
  useStore.setState({ refreshActiveRuns: async () => {}, scRefreshBoard: async () => {} })
  await useStore.getState().cancelSignalRun('SIG-1')
  assert.equal(cancelCalls, 1, 'a reviewed deployment keeps cancellation available while new admission is closed')

  values.set(RUN_PROVIDER_STORAGE_KEY, 'codex')
  useStore.setState({ runProvider: 'codex', providers: bothAvailable })
  api.providers = async () => { throw Object.assign(new Error('gateway'), { status: 503 }) }
  await useStore.getState().refreshProviders()
  assert.equal(useStore.getState().providers.catalogState, 'unknown', 'a transient catalogue failure is not legacy fallback')
  assert.equal(useStore.getState().providers.claude.available, false, 'transient catalogue failure blocks Claude too')
  assert.equal(useStore.getState().providers.codex.available, false)
  assert.equal(useStore.getState().runProvider, 'codex', 'uncertain current server does not silently relabel the choice')
  assert.equal(values.get(RUN_PROVIDER_STORAGE_KEY), 'codex')

  useStore.setState({ runProvider: 'codex', providers: bothAvailable })
  api.providerCheck = async () => { throw new Error('transient') }
  await useStore.getState().refreshProviders('codex')
  const afterTargetedFailure = useStore.getState()
  assert.equal(afterTargetedFailure.providers.codex.available, false)
  assert.equal(afterTargetedFailure.providers.codex.reason, 'Availability check failed')
  assert.equal(afterTargetedFailure.providers.claude.available, true, 'targeted failure leaves Claude untouched')
  assert.equal(afterTargetedFailure.runProvider, 'codex', 'targeted failure blocks rather than silently switching provider')

  afterTargetedFailure.setRunProvider('claude')
  assert.equal(useStore.getState().runProvider, 'claude')
  useStore.getState().setRunProvider('codex')
  assert.equal(useStore.getState().runProvider, 'claude', 'a checked unavailable choice cannot be selected')

  estimateCalls = 0
  useStore.setState({
    staticMode: false,
    health: 'online',
    runProvider: 'codex',
    selectedTicker: 'AAA',
    activeSwarm: 'research',
    selectToken: 1,
    activeRuns: {},
    providers: afterTargetedFailure.providers,
    launchPending: null,
  })
  await useStore.getState().requestFull()
  assert.equal(estimateCalls, 0, 'known-unavailable provider is blocked before estimate or launch')

  let resolveOld!: (value: any) => void
  let resolveNew!: (value: any) => void
  const oldCheck = new Promise<any>((resolve) => { resolveOld = resolve })
  const newCheck = new Promise<any>((resolve) => { resolveNew = resolve })
  let checkNo = 0
  api.providerCheck = async () => (++checkNo === 1 ? oldCheck : newCheck)
  useStore.setState({ providers: bothAvailable, providersChecking: false })
  const first = useStore.getState().refreshProviders('codex')
  const second = useStore.getState().refreshProviders('codex')
  assert.equal(useStore.getState().providersChecking, true)
  resolveNew({ provider: 'codex', enabled: true, available: false, checked: true, reason: 'ChatGPT login required' })
  await second
  assert.equal(useStore.getState().providersChecking, true, 'an older check still in flight keeps the shared spinner honest')
  resolveOld({ provider: 'codex', enabled: true, available: true, checked: true })
  await first
  assert.equal(useStore.getState().providers.codex.available, false, 'a late old response cannot overwrite the newest provider check')
  assert.equal(useStore.getState().providers.codex.reason, 'ChatGPT login required')
  assert.equal(useStore.getState().providersChecking, false)

  console.log('provider store: fallback reset, targeted isolation, launch block, and status generations passed')
} finally {
  api.providers = originalProviders
  api.providerCheck = originalProviderCheck
  api.estimate = originalEstimate
  api.cancelSubject = originalCancelSubject
  api.promoteIdea = originalPromoteIdea
  useStore.setState({ refreshActiveRuns: originalRefreshActiveRuns, scRefreshBoard: originalScRefreshBoard })
  ;(globalThis as any).window = previousWindow
  ;(globalThis as any).document = previousDocument
  ;(globalThis as any).localStorage = previousStorage
}
