import assert from 'node:assert/strict'
import type { ScreenerBoard, SwarmGraph, SwarmMeta } from './types'

const previousWindow = (globalThis as any).window
const previousDocument = (globalThis as any).document
const previousEventSource = (globalThis as any).EventSource
const originalSetTimeout = globalThis.setTimeout
const originalClearTimeout = globalThis.clearTimeout
const originalFetch = globalThis.fetch

class FakeEventSource {
  static OPEN = 1
  readyState = FakeEventSource.OPEN
  constructor(_url: string) {}
  addEventListener(_event: string, _listener: (...args: any[]) => void): void {}
  close(): void { this.readyState = 2 }
}

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
;(globalThis as any).EventSource = FakeEventSource

const { api } = await import('./api')
const { flushBrowserPerformance } = await import('./performance')
const {
  BOOTSTRAP_RETRY_MS,
  bootstrapSwarmId,
  shouldPreserveSwarmDiscovery,
  shouldRetrySwarmDiscovery,
  useStore,
} = await import('./store')

const research: SwarmMeta = { id: 'research', label: 'Research', color: '#c0851d', unit: 'ticker', order: 1, layout: 'constellation' }
const screener: SwarmMeta = { id: 'screener', label: 'Screener', color: '#20d7e5', unit: 'signal', order: 2, layout: 'flow' }
const futureFlow: SwarmMeta = { id: 'future-flow', label: 'Future flow', color: '#8d7df2', unit: 'event', order: 3, layout: 'flow' }
const graph: SwarmGraph = {
  modules: [],
  masterSynthesizer: { name: 'Master', description: '' },
  totals: { modules: 0, agents: 0, specialists: 0, synthesis: 0 },
  swarm: { id: 'screener', label: 'Screener', color: '#20d7e5', unit: 'signal', order: 2, layout: 'flow' },
}
const board: ScreenerBoard = {
  generated_at: null,
  inbox: [],
  signals: [],
  theses: [],
  handoffs: [],
  ideas: [],
  counts: {},
  live: [],
  resumable: [],
}
const boardWithSignal = { ...board, signals: [{ signal_id: 'SIG-OWNERSHIP-RACE' }] } as ScreenerBoard

type RetryJob = { callback: () => void; cancelled: boolean; ran: boolean }
const retryJobs: RetryJob[] = []
;(globalThis as any).setTimeout = ((callback: (...args: any[]) => void, delay?: number, ...args: any[]) => {
  if (delay === BOOTSTRAP_RETRY_MS) {
    const job: RetryJob = { callback: () => callback(...args), cancelled: false, ran: false }
    retryJobs.push(job)
    return job
  }
  return originalSetTimeout(callback, delay, ...args)
}) as typeof setTimeout
;(globalThis as any).clearTimeout = ((timer: ReturnType<typeof setTimeout>) => {
  const job = timer as unknown as RetryJob
  if (retryJobs.includes(job)) job.cancelled = true
  else originalClearTimeout(timer)
}) as typeof clearTimeout

const nextRetry = (): RetryJob => {
  const job = retryJobs.find((candidate) => !candidate.cancelled && !candidate.ran)
  assert.ok(job, 'expected a pending bootstrap retry')
  job.ran = true
  job.callback()
  return job
}
const pendingRetryCount = (): number => retryJobs.filter((job) => !job.cancelled && !job.ran).length
const settle = async (): Promise<void> => {
  for (let i = 0; i < 6; i++) await Promise.resolve()
  await new Promise<void>((resolve) => originalSetTimeout(resolve, 0))
  for (let i = 0; i < 3; i++) await Promise.resolve()
}

const originalApi = {
  swarms: api.swarms,
  swarm: api.swarm,
  swarmGraph: api.swarmGraph,
  tickers: api.tickers,
  credit: api.credit,
  screenerBoard: api.screenerBoard,
  screenerRun: api.screenerRun,
  launchSignal: api.launchSignal,
}
const stateBefore = useStore.getState()
const originalActions = {
  startHealth: stateBefore.startHealth,
  refreshActiveRuns: stateBefore.refreshActiveRuns,
  checkCredit: stateBefore.checkCredit,
  scInit: stateBefore.scInit,
  scRefreshBoard: stateBefore.scRefreshBoard,
  scEnsureNewsStream: stateBefore.scEnsureNewsStream,
  openThemes: stateBefore.openThemes,
  maybeAutoResume: stateBefore._maybeAutoResume,
}

try {
  assert.equal(bootstrapSwarmId(false, [research, screener]), 'screener')
  assert.equal(bootstrapSwarmId(false, [research]), 'research')
  assert.equal(bootstrapSwarmId(true, [research, screener]), 'research')
  assert.equal(shouldRetrySwarmDiscovery(false, Object.assign(new Error('gateway'), { status: 503 })), true)
  assert.equal(shouldRetrySwarmDiscovery(false, Object.assign(new Error('bad gateway'), { status: 502 })), true)
  assert.equal(shouldRetrySwarmDiscovery(false, new Error('network error')), true)
  assert.equal(shouldRetrySwarmDiscovery(false, Object.assign(new Error('timeout'), { name: 'AbortError' })), true)
  assert.equal(shouldRetrySwarmDiscovery(false, Object.assign(new Error('sign in'), { status: 401 })), false)
  assert.equal(shouldRetrySwarmDiscovery(false, Object.assign(new Error('forbidden'), { status: 403 })), false)
  assert.equal(shouldRetrySwarmDiscovery(false, Object.assign(new Error('unsupported'), { status: 404 })), false)
  assert.equal(shouldRetrySwarmDiscovery(true, Object.assign(new Error('gateway'), { status: 503 })), false)
  assert.equal(shouldPreserveSwarmDiscovery(false, Object.assign(new Error('sign in'), { status: 401 })), true)
  assert.equal(shouldPreserveSwarmDiscovery(false, Object.assign(new Error('forbidden'), { status: 403 })), true)
  assert.equal(shouldPreserveSwarmDiscovery(false, Object.assign(new Error('unsupported'), { status: 404 })), false)

  let initCalls = 0
  useStore.setState({
    activeSwarm: 'screener',
    swarms: [],
    staticMode: false,
    startHealth: () => {},
    refreshActiveRuns: async () => {},
    checkCredit: async () => {},
    scInit: async () => { initCalls++ },
  })
  api.swarm = async () => graph
  api.tickers = async () => ({ tickers: [], emptyState: true, coverage: [] })
  api.credit = async () => ({ ok: true, checked: false })

  let discoveryCalls = 0
  api.swarms = async () => {
    discoveryCalls++
    if (discoveryCalls === 1) throw Object.assign(new Error('cold gateway'), { status: 503 })
    return [research, screener]
  }

  await useStore.getState().init()
  await settle()
  assert.equal(discoveryCalls, 1)
  assert.equal(useStore.getState().activeSwarm, 'screener', 'a transient discovery error must preserve the live-marker seed')
  assert.deepEqual(useStore.getState().swarms, [], 'a transient error must not invent a research-only list')
  assert.equal(pendingRetryCount(), 1)

  nextRetry()
  await settle()
  assert.equal(discoveryCalls, 2)
  assert.equal(useStore.getState().activeSwarm, 'screener')
  assert.deepEqual(useStore.getState().swarms, [research, screener])
  assert.equal(initCalls, 1, 'successful rediscovery must initialize the screener')

  for (const status of [401, 403]) {
    useStore.setState({ activeSwarm: 'screener', swarms: [research, screener], health: 'session-expired' })
    api.swarms = async () => { throw Object.assign(new Error('Access session expired'), { status }) }
    await useStore.getState().init()
    await settle()
    assert.equal(useStore.getState().activeSwarm, 'screener', `${status} must preserve the current swarm`)
    assert.deepEqual(useStore.getState().swarms, [research, screener], `${status} must preserve known swarm metadata`)
    assert.equal(pendingRetryCount(), 0, `${status} must not start a permanent three-second auth retry`)
  }

  let alreadyHealthyDiscoveryCalls = 0
  api.swarms = async () => {
    alreadyHealthyDiscoveryCalls++
    if (alreadyHealthyDiscoveryCalls === 1) throw Object.assign(new Error('Access session not ready'), { status: 401 })
    return [research, screener]
  }
  useStore.setState({ activeSwarm: 'screener', swarms: [], health: 'online' })
  await useStore.getState().init()
  await settle()
  assert.equal(alreadyHealthyDiscoveryCalls, 1)
  assert.deepEqual(useStore.getState().swarms, [])
  assert.equal(pendingRetryCount(), 0)
  const performanceBodies: any[] = []
  globalThis.fetch = async (input, init) => {
    if (String(input) === '/api/performance/samples') {
      performanceBodies.push(JSON.parse(String(init?.body || '{}')))
      return new Response('{}', { status: 202, headers: { 'content-type': 'application/json' } })
    }
    return new Response('{"ok":true}', { status: 200, headers: { 'content-type': 'application/json' } })
  }
  await useStore.getState()._tickHealth()
  await settle()
  await flushBrowserPerformance()
  assert.ok(performanceBodies.some((body) => body.samples?.some((sample: any) =>
    sample.name === 'browser.api_latency' && sample.operation === '/api/health')),
  'the recurring production health heartbeat contributes browser round-trip coverage')
  assert.equal(alreadyHealthyDiscoveryCalls, 2, 'a later healthy poll must heal discovery even when health was already online')
  assert.deepEqual(useStore.getState().swarms, [research, screener])

  globalThis.fetch = async () => new Response('{"ok":true,"deploymentPending":true}', { status: 200, headers: { 'content-type': 'application/json' } })
  await useStore.getState()._tickHealth()
  assert.equal(useStore.getState().health, 'updating', 'a reviewed deployment must not be presented as launch-ready')
  useStore.getState()._noteStreamLive()
  assert.equal(useStore.getState().health, 'updating', 'live SSE traffic must not clear the reviewed deployment barrier')
  globalThis.fetch = async () => { throw new Error('origin restarting') }
  await useStore.getState()._tickHealth()
  assert.equal(useStore.getState().health, 'updating', 'the deploy latch must survive the intentional origin restart gap')
  globalThis.fetch = async () => new Response('{}', { status: 401, headers: { 'content-type': 'application/json' } })
  await useStore.getState()._tickHealth()
  assert.equal(useStore.getState().health, 'session-expired')
  useStore.getState()._noteStreamLive()
  assert.equal(useStore.getState().health, 'session-expired', 'an old SSE socket must not hide an expired Access session')
  useStore.setState({ health: 'your-network' })
  useStore.getState()._noteStreamLive()
  assert.equal(useStore.getState().health, 'your-network', 'SSE traffic must not override the browser network diagnosis')
  globalThis.fetch = async () => new Response('{"ok":true,"deploymentPending":false}', { status: 200, headers: { 'content-type': 'application/json' } })
  await useStore.getState()._tickHealth()
  assert.equal(useStore.getState().health, 'online', 'the next healthy poll must re-open launch controls after deployment')

  const laggedDeployment = {
    schemaVersion: 1, status: 'pending', targetSha: 'a'.repeat(40), deployedSha: 'b'.repeat(40),
    authorizedCodeSha: null, pendingSince: Date.now() - 600_000, checkedAt: Date.now(), reason: 'ci_not_green',
  }
  globalThis.fetch = async () => new Response(JSON.stringify({
    ok: true, deploymentPending: false, deployment: laggedDeployment,
  }), { status: 200, headers: { 'content-type': 'application/json' } })
  await useStore.getState()._tickHealth()
  assert.equal(useStore.getState().health, 'online', 'release lag must not falsely close paid run admission')
  assert.equal(useStore.getState().deploymentLag?.reason, 'ci_not_green', 'release lag stays visible in the cockpit')
  globalThis.fetch = async () => new Response(JSON.stringify({
    ok: true, deploymentPending: false, deployment: {
      ...laggedDeployment, status: 'current', deployedSha: laggedDeployment.targetSha, pendingSince: null, reason: 'deployed',
    },
  }), { status: 200, headers: { 'content-type': 'application/json' } })
  await useStore.getState()._tickHealth()
  assert.equal(useStore.getState().deploymentLag, null, 'a current production receipt clears the lag banner')

  api.swarms = async () => { throw Object.assign(new Error('gateway before Access check'), { status: 503 }) }
  useStore.setState({ activeSwarm: 'screener', swarms: [], health: 'online' })
  await useStore.getState().init()
  await settle()
  assert.equal(pendingRetryCount(), 1)
  globalThis.fetch = async () => new Response('{}', { status: 401, headers: { 'content-type': 'application/json' } })
  await useStore.getState()._tickHealth()
  assert.equal(useStore.getState().health, 'session-expired')
  assert.equal(pendingRetryCount(), 0, 'the health loop must cancel a previously scheduled discovery retry once Access expires')

  let signedInDiscoveryCalls = 0
  api.swarms = async () => { signedInDiscoveryCalls++; return [research, screener] }
  useStore.setState({ activeSwarm: 'screener', swarms: [], health: 'session-expired' })
  useStore.getState()._noteStreamLive()
  await settle()
  assert.equal(signedInDiscoveryCalls, 1, 'the first live event after sign-in must heal auth-blocked discovery')
  assert.deepEqual(useStore.getState().swarms, [research, screener])
  assert.equal(pendingRetryCount(), 0)

  useStore.setState({ activeSwarm: 'screener', swarms: [] })
  api.swarms = async () => { throw Object.assign(new Error('unsupported'), { status: 404 }) }
  await useStore.getState().init()
  await settle()
  assert.equal(useStore.getState().activeSwarm, 'research', 'an explicit unsupported endpoint must fail closed')
  assert.deepEqual(useStore.getState().swarms, [research])
  assert.equal(pendingRetryCount(), 0)

  useStore.setState({ activeSwarm: 'screener', swarms: [] })
  api.swarms = async () => [research]
  await useStore.getState().init()
  await settle()
  assert.equal(useStore.getState().activeSwarm, 'research', 'a successful research-only list is authoritative')
  assert.deepEqual(useStore.getState().swarms, [research])

  let graphCalls = 0
  let newsCalls = 0
  let themesCalls = 0
  api.swarmGraph = async () => {
    graphCalls++
    if (graphCalls === 1) throw Object.assign(new Error('cold graph gateway'), { status: 503 })
    return graph
  }
  api.screenerBoard = async () => board
  useStore.setState({
    activeSwarm: 'screener',
    swarms: [research, screener],
    staticMode: false,
    scGraph: null,
    scNodesByKey: new Map(),
    scBoard: null,
    scBoardFetch: { status: 'idle', error: null, lastSuccessAt: null },
    scInit: originalActions.scInit,
    scRefreshBoard: originalActions.scRefreshBoard,
    scEnsureNewsStream: async () => { newsCalls++ },
    openThemes: async () => { themesCalls++ },
    _maybeAutoResume: async () => {},
  })

  const firstInit = useStore.getState().scInit()
  const concurrentInit = useStore.getState().scInit()
  const concurrentResults = await Promise.allSettled([firstInit, concurrentInit])
  await settle()
  assert.deepEqual(concurrentResults.map((result) => result.status), ['fulfilled', 'fulfilled'], 'every coalesced caller must observe the handled recovery promise')
  assert.equal(graphCalls, 1)
  assert.equal(useStore.getState().scGraph, null)
  assert.equal(useStore.getState().scBoard, null)
  assert.equal(pendingRetryCount(), 1, 'a transient cold graph failure must schedule a retry')

  nextRetry()
  await settle()
  assert.equal(graphCalls, 2)
  assert.equal(useStore.getState().scGraph, graph)
  assert.equal(useStore.getState().scBoard, board)
  assert.equal(useStore.getState().scBoardFetch.status, 'ready')
  assert.equal(newsCalls, 1, 'the successful retry must continue through wire initialization')
  assert.equal(themesCalls, 1, 'the successful retry must continue through the default board view')

  let boardCalls = 0
  newsCalls = 0
  themesCalls = 0
  api.screenerBoard = async () => {
    boardCalls++
    if (boardCalls === 1) throw Object.assign(new Error('cold board gateway'), { status: 503 })
    return board
  }
  useStore.setState({
    scBoard: null,
    scBoardFetch: { status: 'idle', error: null, lastSuccessAt: null },
  })

  await useStore.getState().scInit()
  await settle()
  assert.equal(boardCalls, 1)
  assert.equal(useStore.getState().scBoard, null)
  assert.equal(useStore.getState().scBoardFetch.status, 'error', 'the board still exposes its ordinary error state')
  assert.equal(pendingRetryCount(), 1, 'a cold bootstrap board failure must schedule full screener recovery')
  assert.equal(newsCalls, 0, 'wire initialization must wait for a usable bootstrap board')

  nextRetry()
  await settle()
  assert.equal(boardCalls, 2)
  assert.equal(useStore.getState().scBoard, board)
  assert.equal(useStore.getState().scBoardFetch.status, 'ready')
  assert.equal(newsCalls, 1)
  assert.equal(themesCalls, 1)

  let signalHydrationCalls = 0
  api.screenerBoard = async () => boardWithSignal
  api.screenerRun = async () => {
    signalHydrationCalls++
    if (signalHydrationCalls === 1) throw Object.assign(new Error('saved run gateway'), { status: 503 })
    return { runRoot: '/runs/SIG-OWNERSHIP-RACE', modules: { gate: [{ agentKey: 'gate/recovered' }] } } as any
  }
  useStore.setState({
    activeSwarm: 'screener',
    scGraph: graph,
    scBoard: null,
    scSelectedSignal: null,
    scRuntime: {},
    scRouted: {},
    scBoardFetch: { status: 'idle', error: null, lastSuccessAt: null },
  })
  await useStore.getState().scInit()
  assert.equal(signalHydrationCalls, 1)
  assert.equal(pendingRetryCount(), 1, 'a transient saved-signal read must keep the cold Screener in recovery')
  nextRetry()
  await settle()
  assert.equal(signalHydrationCalls, 2)
  assert.equal(useStore.getState().scRuntime['gate/recovered']?.status, 'done')
  assert.equal(pendingRetryCount(), 0)

  let resolveSupersededBoard!: (value: ScreenerBoard) => void
  let resolveWinningBoard!: (value: ScreenerBoard) => void
  let supersededBoardCalls = 0
  api.screenerBoard = () => {
    supersededBoardCalls++
    return new Promise<ScreenerBoard>((resolve) => {
      if (supersededBoardCalls === 1) resolveSupersededBoard = resolve
      else resolveWinningBoard = resolve
    })
  }
  useStore.setState({
    activeSwarm: 'screener',
    scGraph: graph,
    scBoard: null,
    scSelectedSignal: null,
    scRuntime: {},
    scRouted: {},
    scBoardFetch: { status: 'idle', error: null, lastSuccessAt: null },
  })
  const supersededInit = useStore.getState().scInit()
  const winningRefresh = useStore.getState().scRefreshBoard()
  assert.equal(supersededBoardCalls, 2)
  resolveSupersededBoard(board)
  await supersededInit
  assert.equal(useStore.getState().scBoard, null)
  assert.equal(pendingRetryCount(), 1, 'a superseded cold board read must not complete bootstrap without a board')
  resolveWinningBoard(board)
  await winningRefresh
  api.screenerBoard = async () => { supersededBoardCalls++; return board }
  nextRetry()
  await settle()
  assert.equal(supersededBoardCalls, 3)
  assert.equal(useStore.getState().scBoard, board)
  assert.equal(pendingRetryCount(), 0)

  let sessionGraphCalls = 0
  newsCalls = 0
  themesCalls = 0
  api.swarmGraph = async () => {
    sessionGraphCalls++
    if (sessionGraphCalls === 1) throw new Error('Access returned non-JSON')
    return graph
  }
  api.screenerBoard = async () => board
  useStore.setState({
    activeSwarm: 'screener',
    swarms: [research, screener],
    health: 'online',
    scGraph: null,
    scBoard: null,
    scBoardFetch: { status: 'idle', error: null, lastSuccessAt: null },
  })
  await useStore.getState().scInit()
  assert.equal(pendingRetryCount(), 1, 'a status-less bootstrap failure schedules transient recovery while the session is healthy')

  globalThis.fetch = async () => new Response('{}', { status: 401, headers: { 'content-type': 'application/json' } })
  await useStore.getState()._tickHealth()
  assert.equal(useStore.getState().health, 'session-expired')
  assert.equal(pendingRetryCount(), 0, 'session expiry must cancel the screener retry as well as discovery retry')

  globalThis.fetch = async () => new Response('{"ok":true}', { status: 200, headers: { 'content-type': 'application/json' } })
  await useStore.getState()._tickHealth()
  await settle()
  assert.equal(sessionGraphCalls, 2, 'a later healthy poll must restart missing screener initialization')
  assert.equal(useStore.getState().scGraph, graph)
  assert.equal(useStore.getState().scBoard, board)
  assert.equal(newsCalls, 1)
  assert.equal(themesCalls, 1)

  let releaseReconnectWire!: () => void
  let markReconnectWireStarted!: () => void
  const reconnectWireStarted = new Promise<void>((resolve) => { markReconnectWireStarted = resolve })
  const reconnectWireGate = new Promise<void>((resolve) => { releaseReconnectWire = resolve })
  let reconnectBoardCalls = 0
  api.screenerBoard = async () => { reconnectBoardCalls++; return board }
  useStore.setState({
    activeSwarm: 'screener',
    swarms: [research, screener],
    health: 'reconnecting',
    scGraph: graph,
    scBoard: board,
    scSelectedSignal: null,
    scRuntime: {},
    scBoardFetch: { status: 'ready', error: null, lastSuccessAt: Date.now() },
    scInit: originalActions.scInit,
    scEnsureNewsStream: async () => { markReconnectWireStarted(); await reconnectWireGate },
    openThemes: async () => {},
  })
  const reconnectInit = useStore.getState().scInit()
  await reconnectWireStarted
  assert.equal(reconnectBoardCalls, 1, 'the in-flight initialization reads the board once before wire setup')
  useStore.getState()._noteStreamLive()
  releaseReconnectWire()
  await reconnectInit
  await settle()
  assert.equal(reconnectBoardCalls, 2, 'a reconnect during coalesced initialization must drain one fresh board read')

  let futureNavigationInitCalls = 0
  let resolveForeignBoard!: (value: ScreenerBoard) => void
  let foreignBoardRefreshCalls = 0
  api.screenerBoard = () => {
    foreignBoardRefreshCalls++
    return new Promise<ScreenerBoard>((resolve) => { resolveForeignBoard = resolve })
  }
  useStore.setState({
    activeSwarm: 'screener',
    swarms: [research, screener, futureFlow],
    warp: null,
    wireSwarm: 'screener',
    scGraph: graph,
    scBoard: board,
    scSelectedSignal: 'STALE-SCREENER-SIGNAL',
    scRuntime: { stale: { status: 'done' } as any },
    scInit: async () => { futureNavigationInitCalls++ },
    scRefreshBoard: originalActions.scRefreshBoard,
  })
  const foreignBoardRefresh = useStore.getState().scRefreshBoard()
  assert.equal(foreignBoardRefreshCalls, 1)
  useStore.getState().switchSwarm('future-flow')
  assert.equal(useStore.getState().activeSwarm, 'future-flow')
  assert.equal(useStore.getState().wireSwarm, 'future-flow')
  assert.equal(futureNavigationInitCalls, 0, 'navigating to another flow swarm must not enter hardcoded screener initialization')
  assert.equal(useStore.getState().scGraph, null, 'another flow swarm must not render the screener graph cache')
  assert.equal(useStore.getState().scBoard, null, 'another flow swarm must not render the screener board cache')
  assert.equal(useStore.getState().scSelectedSignal, null, 'another flow swarm must not inherit the screener subject')
  useStore.getState()._handleNewsEvent({ type: 'news-cycle' })
  assert.equal(foreignBoardRefreshCalls, 1, 'a global news cycle must not refresh the screener board for another flow swarm')
  resolveForeignBoard(boardWithSignal)
  await foreignBoardRefresh
  assert.equal(useStore.getState().scBoard, null, 'an ordinary board response started on Screener must not commit after navigation')
  useStore.getState()._handleScreenerEvent({
    type: 'agent-started', runId: 'late-run', agentKey: 'late/agent', name: 'Late agent', module: 'late', layer: 1, ts: Date.now(),
  } as any)
  assert.deepEqual(useStore.getState().scRuntime, {}, 'a late Screener run frame must not repopulate another flow swarm')

  let resolveOwnedGraph!: (value: SwarmGraph) => void
  let ownedGraphCalls = 0
  let graphRaceBoardCalls = 0
  newsCalls = 0
  themesCalls = 0
  api.swarmGraph = () => {
    ownedGraphCalls++
    return new Promise<SwarmGraph>((resolve) => { resolveOwnedGraph = resolve })
  }
  api.screenerBoard = async () => { graphRaceBoardCalls++; return board }
  useStore.setState({
    activeSwarm: 'screener',
    swarms: [research, screener, futureFlow],
    warp: null,
    wireSwarm: 'screener',
    scGraph: null,
    scBoard: null,
    scBoardFetch: { status: 'idle', error: null, lastSuccessAt: null },
    scInit: originalActions.scInit,
    scRefreshBoard: originalActions.scRefreshBoard,
    scEnsureNewsStream: async () => { newsCalls++ },
    openThemes: async () => { themesCalls++ },
  })
  const ownedGraphInit = useStore.getState().scInit()
  assert.equal(ownedGraphCalls, 1)
  useStore.getState().switchSwarm('future-flow')
  resolveOwnedGraph(graph)
  await ownedGraphInit
  await settle()
  assert.equal(useStore.getState().activeSwarm, 'future-flow')
  assert.equal(useStore.getState().scGraph, null, 'an in-flight graph response must not commit after screener ownership changes')
  assert.equal(graphRaceBoardCalls, 0)
  assert.equal(newsCalls, 0)
  assert.equal(themesCalls, 0)

  let resolveOwnedBoard!: (value: ScreenerBoard) => void
  let ownedBoardCalls = 0
  newsCalls = 0
  themesCalls = 0
  api.screenerBoard = () => {
    ownedBoardCalls++
    return new Promise<ScreenerBoard>((resolve) => { resolveOwnedBoard = resolve })
  }
  useStore.setState({
    activeSwarm: 'screener',
    swarms: [research, screener, futureFlow],
    warp: null,
    wireSwarm: 'screener',
    scGraph: graph,
    scBoard: null,
    scBoardFetch: { status: 'idle', error: null, lastSuccessAt: null },
  })
  const ownedBoardInit = useStore.getState().scInit()
  assert.equal(ownedBoardCalls, 1)
  useStore.getState().switchSwarm('future-flow')
  resolveOwnedBoard(board)
  await ownedBoardInit
  await settle()
  assert.equal(useStore.getState().scBoard, null, 'an in-flight board response must not commit after screener ownership changes')
  assert.equal(newsCalls, 0, 'an invalidated bootstrap must not initialize the screener wire')
  assert.equal(themesCalls, 0, 'an invalidated bootstrap must not open screener themes')

  let resolveOwnedSignal!: (value: any) => void
  let markSignalRequested!: () => void
  const signalRequested = new Promise<void>((resolve) => { markSignalRequested = resolve })
  newsCalls = 0
  themesCalls = 0
  api.screenerBoard = async () => boardWithSignal
  api.screenerRun = () => {
    markSignalRequested()
    return new Promise<any>((resolve) => { resolveOwnedSignal = resolve })
  }
  useStore.setState({
    activeSwarm: 'screener',
    swarms: [research, screener, futureFlow],
    warp: null,
    wireSwarm: 'screener',
    scGraph: graph,
    scBoard: null,
    scSelectedSignal: null,
    scRuntime: {},
    scRouted: {},
    scBoardFetch: { status: 'idle', error: null, lastSuccessAt: null },
  })
  const ownedSignalInit = useStore.getState().scInit()
  await signalRequested
  useStore.getState().switchSwarm('future-flow')
  resolveOwnedSignal({
    runRoot: '/runs/SIG-OWNERSHIP-RACE',
    modules: { gate: [{ agentKey: 'gate/late-agent', verdict: 'late' }] },
    thesisRecord: { meta: { status: 'late-route' } },
  })
  await ownedSignalInit
  await settle()
  assert.deepEqual(useStore.getState().scRuntime, {}, 'an in-flight signal bootstrap must not commit runtime after ownership changes')
  assert.deepEqual(useStore.getState().scRouted, {})
  assert.equal(newsCalls, 0)
  assert.equal(themesCalls, 0)

  let returnedSignalCalls = 0
  api.swarmGraph = async () => graph
  api.screenerBoard = async () => boardWithSignal
  api.screenerRun = async () => {
    returnedSignalCalls++
    return {
      runRoot: '/runs/SIG-OWNERSHIP-RACE',
      modules: { gate: [{ agentKey: 'gate/current-agent', verdict: 'current' }] },
      thesisRecord: { meta: { status: 'current-route' } },
    } as any
  }
  useStore.setState({
    scInit: originalActions.scInit,
    scRefreshBoard: originalActions.scRefreshBoard,
    scEnsureNewsStream: async () => {},
    openThemes: async () => {},
  })
  useStore.getState().switchSwarm('screener')
  await settle()
  assert.equal(returnedSignalCalls, 1, 'returning after an invalidated signal load must hydrate the gauntlet again')
  assert.equal(useStore.getState().scSelectedSignal, 'SIG-OWNERSHIP-RACE')
  assert.equal(useStore.getState().scRuntime['gate/current-agent']?.status, 'done')

  let releaseManualSignal!: (value: any) => void
  api.screenerRun = () => new Promise<any>((resolve) => { releaseManualSignal = resolve })
  const manualSignalLoad = useStore.getState().scSelectSignal('SIG-MANUAL-RACE')
  useStore.getState().switchSwarm('research')
  releaseManualSignal({ runRoot: '/runs/SIG-MANUAL-RACE', modules: { gate: [{ agentKey: 'gate/stale-manual' }] } })
  await manualSignalLoad
  assert.equal(useStore.getState().scSelectedSignal, 'SIG-MANUAL-RACE')
  assert.deepEqual(useStore.getState().scRuntime, {}, 'an invalidated manual signal response must be discarded')

  let manualSignalRehydrateCalls = 0
  api.swarmGraph = async () => graph
  api.screenerBoard = async () => board
  api.screenerRun = async () => {
    manualSignalRehydrateCalls++
    return { runRoot: '/runs/SIG-MANUAL-RACE', modules: { gate: [{ agentKey: 'gate/current-manual' }] } } as any
  }
  useStore.getState().switchSwarm('screener')
  await settle()
  assert.equal(manualSignalRehydrateCalls, 1, 'returning after an invalidated manual selection must rehydrate it')
  assert.equal(useStore.getState().scRuntime['gate/current-manual']?.status, 'done')

  let releaseOlderSameSignal!: (value: any) => void
  let sameSignalCalls = 0
  api.screenerRun = () => {
    sameSignalCalls++
    if (sameSignalCalls === 1) return new Promise<any>((resolve) => { releaseOlderSameSignal = resolve })
    return Promise.resolve({
      runRoot: '/runs/SIG-SAME-GENERATION',
      modules: { gate: [{ agentKey: 'gate/newer-same-signal', verdict: 'newer' }] },
    })
  }
  const olderSameSignal = useStore.getState().scSelectSignal('SIG-SAME-GENERATION')
  const newerSameSignal = useStore.getState().scSelectSignal('SIG-SAME-GENERATION')
  await newerSameSignal
  releaseOlderSameSignal({
    runRoot: '/runs/SIG-SAME-GENERATION',
    modules: { gate: [{ agentKey: 'gate/older-same-signal', verdict: 'older' }] },
  })
  await olderSameSignal
  assert.equal(useStore.getState().scRuntime['gate/newer-same-signal']?.verdict, 'newer')
  assert.equal(useStore.getState().scRuntime['gate/older-same-signal'], undefined, 'an older same-signal response must not overwrite the newest runtime')

  let releaseOldHydration!: (value: any) => void
  let rejectNewHydration!: (reason: unknown) => void
  let hydrationRaceCalls = 0
  api.screenerRun = () => {
    hydrationRaceCalls++
    if (hydrationRaceCalls === 1) return new Promise<any>((resolve) => { releaseOldHydration = resolve })
    if (hydrationRaceCalls === 2) return new Promise<any>((_resolve, reject) => { rejectNewHydration = reject })
    return Promise.resolve({
      runRoot: '/runs/SIG-SAME-GENERATION',
      modules: { gate: [{ agentKey: 'gate/recovered-same-signal', verdict: 'recovered' }] },
    })
  }
  const oldHydration = useStore.getState().scSelectSignal('SIG-SAME-GENERATION')
  const newHydration = useStore.getState().scSelectSignal('SIG-SAME-GENERATION')
  releaseOldHydration({
    runRoot: '/runs/SIG-SAME-GENERATION',
    modules: { gate: [{ agentKey: 'gate/stale-success', verdict: 'stale' }] },
  })
  await oldHydration
  rejectNewHydration(Object.assign(new Error('newer hydration gateway'), { status: 503 }))
  await newHydration
  api.screenerBoard = async () => board
  useStore.setState({ scGraph: graph, scBoard: board, scBoardFetch: { status: 'ready', error: null, lastSuccessAt: Date.now() } })
  await useStore.getState().scInit()
  await settle()
  assert.equal(hydrationRaceCalls, 3, 'an older same-signal completion must not clear the newer failed hydration intent')
  assert.equal(useStore.getState().scRuntime['gate/recovered-same-signal']?.verdict, 'recovered')
  assert.equal(useStore.getState().scRuntime['gate/stale-success'], undefined)

  let leaveRetryGraphCalls = 0
  api.swarmGraph = async () => {
    leaveRetryGraphCalls++
    throw Object.assign(new Error('cold graph gateway'), { status: 503 })
  }
  useStore.setState({
    activeSwarm: 'screener',
    swarms: [research, screener, futureFlow],
    health: 'online',
    warp: null,
    wireSwarm: 'screener',
    scGraph: null,
    scBoard: null,
    scBoardFetch: { status: 'idle', error: null, lastSuccessAt: null },
  })
  await useStore.getState().scInit()
  assert.equal(pendingRetryCount(), 1)
  useStore.getState().switchSwarm('future-flow')
  assert.equal(leaveRetryGraphCalls, 1)
  assert.equal(pendingRetryCount(), 0, 'leaving screener must cancel its scheduled bootstrap retry')

  let releaseFirstResume!: () => void
  let markFirstResumeStarted!: () => void
  const firstResumeStarted = new Promise<void>((resolve) => { markFirstResumeStarted = resolve })
  const firstResumeGate = new Promise<void>((resolve) => { releaseFirstResume = resolve })
  const resumedSubjects: string[] = []
  const claudeExecutionProfile = { key: 'claude:opus:default', parentModel: 'opus', parentReasoning: 'default' }
  const codexExecutionProfile = { key: 'codex|gpt-5.6-sol:max|gpt-5.6-terra:xhigh', parentModel: 'gpt-5.6-sol', parentReasoning: 'max', specialistModel: 'gpt-5.6-terra', specialistReasoning: 'xhigh' }
  api.launchSignal = async (selection, input) => {
    resumedSubjects.push(input.sigId || '')
    if (resumedSubjects.length === 1) { markFirstResumeStarted(); await firstResumeGate }
    return { runId: `resume-${resumedSubjects.length}`, preflight: { provider: selection.provider, profileKey: selection.expectedProfileKey, model: selection.model, reasoningLevel: selection.reasoningLevel, executionProfile: selection.executionProfile } as any }
  }
  useStore.setState({
    activeSwarm: 'screener',
    swarms: [research, screener, futureFlow],
    health: 'online',
    staticMode: false,
    warp: null,
    _maybeAutoResume: originalActions.maybeAutoResume,
    scSelectedSignal: null,
    providers: {
      claude: {
        provider: 'claude', enabled: true, available: true, checked: true, status: 'available', profile: claudeExecutionProfile,
        defaultProfileKey: claudeExecutionProfile.key,
        profiles: [{ key: claudeExecutionProfile.key, label: 'Opus', description: 'Highest quality', model: 'opus', reasoningLevel: 'default', executionProfile: claudeExecutionProfile }],
      },
      codex: {
        provider: 'codex', enabled: true, available: true, checked: true, status: 'available', profile: codexExecutionProfile,
        defaultProfileKey: codexExecutionProfile.key,
        profiles: [{ key: codexExecutionProfile.key, label: 'Sol + Terra', description: 'Balanced', model: 'gpt-5.6-sol', reasoningLevel: 'max', executionProfile: codexExecutionProfile }],
      },
      catalogState: 'valid',
    },
    runProfileKeys: { claude: claudeExecutionProfile.key, codex: codexExecutionProfile.key },
    resumableRuns: [
      { swarm: 'screener', subject: 'SIG-RESUME-FIRST', runRoot: 'screener/runs/SIG-RESUME-FIRST', kind: 'signal', doneCount: 1, totalCount: 2, unit: 'module', provider: 'claude', executionProfile: claudeExecutionProfile },
      { swarm: 'screener', subject: 'SIG-RESUME-SECOND', runRoot: 'screener/runs/SIG-RESUME-SECOND', kind: 'signal', doneCount: 1, totalCount: 2, unit: 'module', provider: 'claude', executionProfile: claudeExecutionProfile },
    ],
  })
  const resumeBatch = useStore.getState()._maybeAutoResume([
    { sigId: 'SIG-RESUME-FIRST', headline: 'first', doneCount: 1, totalCount: 2, provider: 'claude', executionProfile: claudeExecutionProfile },
    { sigId: 'SIG-RESUME-SECOND', headline: 'second', doneCount: 1, totalCount: 2, provider: 'claude', executionProfile: claudeExecutionProfile },
  ])
  await firstResumeStarted
  useStore.getState().switchSwarm('future-flow')
  releaseFirstResume()
  await resumeBatch
  assert.deepEqual(resumedSubjects, ['SIG-RESUME-FIRST'], 'navigation during auto-resume must stop the remaining Screener launches')
  assert.notEqual(useStore.getState().toast?.msg.startsWith('Resuming'), true, 'a foreign swarm must not receive the Screener resume toast')

  useStore.setState({ activeSwarm: 'screener', health: 'online', staticMode: false, resumableRuns: [] })
  await useStore.getState()._maybeAutoResume([
    { sigId: 'SIG-RESUME-NO-PROVIDER', headline: 'legacy unknown', doneCount: 1, totalCount: 2 },
  ])
  assert.deepEqual(resumedSubjects, ['SIG-RESUME-FIRST'], 'automatic resume never guesses a provider for unattributed work')

  useStore.setState({
    resumableRuns: [{ swarm: 'screener', subject: 'SIG-RESUME-MISSING-PROFILE', runRoot: 'screener/runs/SIG-RESUME-MISSING-PROFILE', kind: 'signal', doneCount: 1, totalCount: 2, unit: 'module', provider: 'claude', executionProfile: claudeExecutionProfile }],
  })
  await useStore.getState()._maybeAutoResume([
    { sigId: 'SIG-RESUME-MISSING-PROFILE', headline: 'missing board profile', doneCount: 1, totalCount: 2, provider: 'claude' },
  ])
  assert.deepEqual(resumedSubjects, ['SIG-RESUME-FIRST'], 'automatic resume holds when either board/disk profile authority is missing')

  useStore.setState({
    resumableRuns: [{ swarm: 'screener', subject: 'SIG-RESUME-CONFLICT', runRoot: 'screener/runs/SIG-RESUME-CONFLICT', kind: 'signal', doneCount: 1, totalCount: 2, unit: 'module', provider: 'claude', executionProfile: claudeExecutionProfile }],
  })
  await useStore.getState()._maybeAutoResume([
    { sigId: 'SIG-RESUME-CONFLICT', headline: 'conflicting board provider', doneCount: 1, totalCount: 2, provider: 'codex', executionProfile: codexExecutionProfile },
  ])
  assert.deepEqual(resumedSubjects, ['SIG-RESUME-FIRST'], 'automatic resume holds on board-vs-disk provider/profile conflict')

  let foreignRecoveryInitCalls = 0
  useStore.setState({
    activeSwarm: 'future-flow',
    swarms: [research, screener, futureFlow],
    health: 'reconnecting',
    scInit: async () => { foreignRecoveryInitCalls++ },
  })
  useStore.getState()._noteStreamLive()
  await settle()
  assert.equal(foreignRecoveryInitCalls, 0, 'SSE recovery must not inject screener state into another flow swarm')

  console.log('bootstrap recovery: discovery and cold screener retries passed')
} finally {
  api.swarms = originalApi.swarms
  api.swarm = originalApi.swarm
  api.swarmGraph = originalApi.swarmGraph
  api.tickers = originalApi.tickers
  api.credit = originalApi.credit
  api.screenerBoard = originalApi.screenerBoard
  api.screenerRun = originalApi.screenerRun
  api.launchSignal = originalApi.launchSignal
  useStore.setState({
    startHealth: originalActions.startHealth,
    refreshActiveRuns: originalActions.refreshActiveRuns,
    checkCredit: originalActions.checkCredit,
    scInit: originalActions.scInit,
    scRefreshBoard: originalActions.scRefreshBoard,
    scEnsureNewsStream: originalActions.scEnsureNewsStream,
    openThemes: originalActions.openThemes,
    _maybeAutoResume: originalActions.maybeAutoResume,
  })
  ;(globalThis as any).setTimeout = originalSetTimeout
  ;(globalThis as any).clearTimeout = originalClearTimeout
  globalThis.fetch = originalFetch
  ;(globalThis as any).window = previousWindow
  ;(globalThis as any).document = previousDocument
  ;(globalThis as any).EventSource = previousEventSource
}
