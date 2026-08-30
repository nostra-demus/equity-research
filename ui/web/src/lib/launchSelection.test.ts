import assert from 'node:assert/strict'
import type { AgentNode, DataNeedsRead, IntakePlan, LaunchPreflight, SwarmGraph, SwarmMeta } from './types'

const previousWindow = (globalThis as any).window
const previousDocument = (globalThis as any).document
const previousEventSource = (globalThis as any).EventSource

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
const { useStore } = await import('./store')
const CLAUDE_PROFILE = { key: 'claude:opus:default', parentModel: 'opus', parentReasoning: 'default' }
const CLAUDE_SELECTION = {
  provider: 'claude' as const,
  expectedProfileKey: CLAUDE_PROFILE.key,
  model: CLAUDE_PROFILE.parentModel,
  reasoningLevel: CLAUDE_PROFILE.parentReasoning,
  executionProfile: CLAUDE_PROFILE,
}
const CODEX_PROFILE = { key: 'codex|gpt-5.6-sol:max|gpt-5.6-terra:xhigh', parentModel: 'gpt-5.6-sol', parentReasoning: 'max', specialistModel: 'gpt-5.6-terra', specialistReasoning: 'xhigh' }
const CODEX_SOL_ONLY_PROFILE = { key: 'codex|gpt-5.6-sol:max|gpt-5.6-sol:max', parentModel: 'gpt-5.6-sol', parentReasoning: 'max', specialistModel: 'gpt-5.6-sol', specialistReasoning: 'max' }
const CODEX_SELECTION = { provider: 'codex' as const, expectedProfileKey: CODEX_PROFILE.key, model: CODEX_PROFILE.parentModel, reasoningLevel: CODEX_PROFILE.parentReasoning, executionProfile: CODEX_PROFILE }
const providerCatalog = () => ({
  claude: {
    provider: 'claude' as const, enabled: true, available: true, checked: true, status: 'available',
    profile: CLAUDE_PROFILE, defaultProfileKey: CLAUDE_PROFILE.key,
    profiles: [{ key: CLAUDE_PROFILE.key, label: 'Opus', description: 'Highest quality', model: 'opus', reasoningLevel: 'default', executionProfile: CLAUDE_PROFILE }],
  },
  codex: {
    provider: 'codex' as const, enabled: true, available: true, checked: true, status: 'available',
    profile: CODEX_PROFILE, defaultProfileKey: CODEX_PROFILE.key,
    profiles: [
      { key: CODEX_PROFILE.key, label: 'Sol + Terra', description: 'Balanced', model: 'gpt-5.6-sol', reasoningLevel: 'max', executionProfile: CODEX_PROFILE },
      { key: CODEX_SOL_ONLY_PROFILE.key, label: 'Sol only', description: 'Highest quality', model: 'gpt-5.6-sol', reasoningLevel: 'max', executionProfile: CODEX_SOL_ONLY_PROFILE },
    ],
  },
  catalogState: 'valid' as const,
})

const original = {
  estimate: api.estimate,
  thesisPlan: api.thesisPlan,
  launch: api.launch,
  launchExact: api.launchExact,
  intake: api.intake,
  analyzeIntake: api.analyzeIntake,
  runIntakePlan: api.runIntakePlan,
  activeRuns: api.activeRuns,
  runSnapshot: api.runSnapshot,
  swarm: api.swarm,
  swarmSubjects: api.swarmSubjects,
}

const research: SwarmMeta = { id: 'research', label: 'Research', color: '#c0851d', unit: 'ticker', order: 1, layout: 'constellation' }
const commodity: SwarmMeta = { id: 'commodity', label: 'Commodities', color: '#8d7df2', unit: 'subject', order: 2, layout: 'constellation' }
const orb: AgentNode = {
  key: 'demand/source-reader', module: 'demand', nn: '10', name: 'source-reader', slug: 'source-reader',
  layer: 1, failFast: false, description: '', tools: [], requiredUpstream: [], soloRunnable: true, isSynthesis: false,
}
const graph: SwarmGraph = {
  modules: [{ name: 'demand', order: 1, dependsOn: [], layers: { '1': [orb] }, agentCount: 1 }],
  masterSynthesizer: { name: 'synthesizer', description: '' },
  totals: { modules: 1, agents: 1, specialists: 1, synthesis: 0 },
}
const preflight = (
  kind: 'full' | 'rerun',
  ticker: string,
  swarm?: string,
  exact?: Pick<DataNeedsRead, 'run_root' | 'decision_fingerprint'>,
  planOrigin?: { planPath: string; planSha256: string; sourceDecisionFingerprint: string },
): LaunchPreflight => ({
  kind, ticker, ...(swarm && swarm !== 'research' ? { swarm } : {}),
  provider: 'claude', profileKey: CLAUDE_PROFILE.key, model: CLAUDE_PROFILE.parentModel,
  reasoningLevel: CLAUDE_PROFILE.parentReasoning, executionProfile: CLAUDE_PROFILE,
  ...(kind === 'rerun' ? { module: orb.module, agent: orb.name } : {}),
  ...(kind === 'rerun' && exact ? { exactDecisionBinding: {
    contractVersion: 'exact-decision-launch/1',
    runRoot: exact.run_root,
    decisionFingerprint: exact.decision_fingerprint,
    ...(planOrigin ? { intakePlan: { contractVersion: 'exact-intake-orb/1', ...planOrigin } } : {}),
  } } : {}),
  agentCount: 2, estCostUsdRange: [1, 2], estMinutesRange: [1, 2], willCommitToMain: true,
  estCommits: 1, requiresTypedConfirm: kind === 'full', creditPreflight: { ok: true, checked: true },
})
const exactGold: DataNeedsRead = {
  contract_version: 'data-needs-read/2', subject: 'GOLD', swarm: 'commodity', run_root: 'commodity/runs/GOLD',
  decision_fingerprint: `sha256:${'a'.repeat(64)}`, decided_at: '2026-08-13T10:00:00.000Z', needs: [], widened: [],
}
const exactAAA: DataNeedsRead = {
  contract_version: 'data-needs-read/2', subject: 'AAA', swarm: 'research', run_root: 'analyses/AAA_2026-08-13',
  decision_fingerprint: `sha256:${'b'.repeat(64)}`, decided_at: '2026-08-13T09:00:00.000Z', needs: [], widened: [],
}
const deferred = <T>() => {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((done) => { resolve = done })
  return { promise, resolve }
}

try {
  useStore.setState({
    staticMode: false, health: 'online', swarms: [research, commodity], activeSwarm: 'research',
    constellationSwarm: 'research', selectedTicker: 'AAA', selectToken: 101, warp: null,
    graph, nodesByKey: new Map([[orb.key, orb]]), activeRuns: {}, launchConfirm: null, launchPending: null,
    runRoot: exactAAA.run_root, dataNeeds: null, providers: providerCatalog(), runProvider: 'claude',
    runProfileKeys: { claude: CLAUDE_PROFILE.key, codex: CODEX_PROFILE.key },
  })

  const fullEstimate = deferred<LaunchPreflight>()
  api.estimate = async () => fullEstimate.promise
  const staleFull = useStore.getState().requestFull()
  assert.deepEqual(useStore.getState().launchPending?.selection, { subject: 'AAA', swarm: 'research', selectToken: 101, ...CLAUDE_SELECTION })
  useStore.setState({ selectedTicker: 'BBB', selectToken: 102, launchConfirm: null, launchPending: null })
  fullEstimate.resolve(preflight('full', 'AAA'))
  await staleFull
  assert.equal(useStore.getState().launchConfirm, null, 'a full estimate cannot cross a selection change')

  const olderPrice = deferred<LaunchPreflight>()
  const newerPrice = deferred<LaunchPreflight>()
  let priceCall = 0
  api.estimate = async () => (++priceCall === 1 ? olderPrice.promise : newerPrice.promise)
  useStore.setState({ selectedTicker: 'AAA', activeSwarm: 'research', constellationSwarm: 'research', selectToken: 1021, warp: null, launchConfirm: null, launchPending: null })
  const olderRequest = useStore.getState().requestFull()
  const newerRequest = useStore.getState().requestFull()
  newerPrice.resolve({ ...preflight('full', 'AAA'), agentCount: 22 })
  await newerRequest
  olderPrice.resolve({ ...preflight('full', 'AAA'), agentCount: 11 })
  await olderRequest
  const latestConfirm = useStore.getState().launchConfirm
  assert.equal(latestConfirm?.kind === 'full' ? latestConfirm.preflight.agentCount : undefined, 22, 'last launch-plan request wins when estimates resolve out of order')

  api.estimate = async () => preflight('full', 'AAA')
  useStore.setState({ selectedTicker: 'AAA', activeSwarm: 'research', selectToken: 103, warp: null, launchConfirm: null, runRoot: exactAAA.run_root, dataNeeds: null })
  await useStore.getState().requestFull()
  assert.deepEqual(useStore.getState().launchConfirm?.selection, { subject: 'AAA', swarm: 'research', selectToken: 103, ...CLAUDE_SELECTION })
  assert.equal(useStore.getState().launchConfirm?.kind, 'full', 'a missing exact-call fingerprint must not disable a new full run')

  let launchCalls = 0
  api.launch = async () => { launchCalls++; throw new Error('must not launch') }
  useStore.setState({ selectedTicker: 'BBB', selectToken: 104 })
  await useStore.getState().confirmFull()
  assert.equal(launchCalls, 0, 'a stale full confirmation cannot submit a paid POST')
  assert.equal(useStore.getState().launchConfirm, null)

  const rerunEstimate = deferred<LaunchPreflight>()
  api.estimate = async () => rerunEstimate.promise
  let competingModulePlans = 0
  api.thesisPlan = async () => {
    competingModulePlans++
    throw new Error('a module plan must not start during a rerun estimate')
  }
  useStore.setState({
    selectedTicker: 'AAA', activeSwarm: 'research', constellationSwarm: 'research', selectToken: 105,
    warp: null, graph, nodesByKey: new Map([[orb.key, orb]]), runRoot: exactAAA.run_root, dataNeeds: exactAAA,
    launchConfirm: null, launchPending: null,
  })
  const staleRerun = useStore.getState().launchRerun({ module: orb.module, name: orb.name, key: orb.key })
  assert.deepEqual(useStore.getState().launchPending?.selection, {
    subject: 'AAA', swarm: 'research', selectToken: 105, ...CLAUDE_SELECTION,
    runRoot: exactAAA.run_root, decisionFingerprint: exactAAA.decision_fingerprint,
  })
  const rerunPending = useStore.getState().launchPending
  await useStore.getState().launchModule(orb.module)
  assert.equal(competingModulePlans, 0, 'a module heading cannot plan while a same-ticker rerun is being priced')
  assert.equal(useStore.getState().launchPending, rerunPending, 'the blocked module click preserves the rerun spinner')
  const newerRerunPending = { key: 'newer:after-rerun', label: 'Newer operation…', ticker: 'OTHER' }
  useStore.setState({ warp: { from: 'research', to: 'commodity', phase: 'collapse' }, launchConfirm: null, launchPending: newerRerunPending })
  rerunEstimate.resolve(preflight('rerun', 'AAA', undefined, exactAAA))
  await staleRerun
  assert.equal(useStore.getState().launchConfirm, null, 'an estimate resolving during swarm navigation stays closed')
  assert.equal(useStore.getState().launchPending, newerRerunPending, 'the completed rerun estimate cannot clear a newer pending operation')

  let unsafeEstimateCalls = 0
  let unsafeLaunchCalls = 0
  api.estimate = async () => { unsafeEstimateCalls++; return preflight('rerun', 'AAA') }
  api.launchExact = async () => { unsafeLaunchCalls++; throw new Error('must not launch') }
  useStore.setState({
    selectedTicker: 'AAA', activeSwarm: 'research', constellationSwarm: 'research', selectToken: 1051,
    warp: null, graph, nodesByKey: new Map([[orb.key, orb]]), runRoot: exactAAA.run_root, dataNeeds: null,
    launchConfirm: null, launchPending: null,
  })
  await useStore.getState().launchRerun({ module: orb.module, name: orb.name, key: orb.key })
  assert.equal(unsafeEstimateCalls, 0, 'a completed run without its exact decision fingerprint is refused before estimate')
  assert.equal(unsafeLaunchCalls, 0, 'an unbound re-run never reaches the paid POST')
  assert.equal(useStore.getState().launchConfirm, null)
  useStore.setState({
    launchConfirm: {
      kind: 'rerun', selection: { subject: 'AAA', swarm: 'research', selectToken: 1051, ...CLAUDE_SELECTION },
      preflight: preflight('rerun', 'AAA'),
      cascade: [{ key: orb.key, module: orb.module, name: orb.name, layer: orb.layer, isSynthesis: false, kind: 'agent' }],
      node: { module: orb.module, name: orb.name, key: orb.key },
    },
  })
  await useStore.getState().confirmRerun()
  assert.equal(unsafeLaunchCalls, 0, 'even a stale/crafted confirmation cannot POST an unbound re-run')

  let legacyEstimateArgs: any[] | null = null
  api.estimate = async (...args: any[]) => {
    legacyEstimateArgs = args
    return preflight('rerun', 'AAA') // old server: valid-looking estimate, but no exact-call receipt
  }
  useStore.setState({
    selectedTicker: 'AAA', activeSwarm: 'research', constellationSwarm: 'research', selectToken: 1052,
    warp: null, graph, nodesByKey: new Map([[orb.key, orb]]), runRoot: exactAAA.run_root, dataNeeds: exactAAA,
    launchConfirm: null, launchPending: null,
  })
  await useStore.getState().launchRerun({ module: orb.module, name: orb.name, key: orb.key })
  assert.deepEqual(legacyEstimateArgs?.[6], {
    runRoot: exactAAA.run_root,
    decisionFingerprint: exactAAA.decision_fingerprint,
  }, 'the estimate request carries the exact selected-call identity')
  assert.equal(useStore.getState().launchConfirm, null,
    'an old server estimate without the versioned exact-call receipt cannot open confirmation')
  assert.equal(unsafeLaunchCalls, 0, 'an unmarked old-server estimate never reaches paid POST')

  // An intake-row rerun carries its exact plan identity through estimate, confirmation, and paid POST.
  // A capability receipt that echoes only the decision (old/current server skew) cannot open it.
  const planOrigin = {
    planPath: `${exactAAA.run_root}/intake/2026-08-13_intake_plan.json`,
    planSha256: `sha256:${'c'.repeat(64)}`,
    sourceDecisionFingerprint: exactAAA.decision_fingerprint,
  }
  let planEstimateArgs: any[] | null = null
  api.estimate = async (...args: any[]) => {
    planEstimateArgs = args
    return preflight('rerun', 'AAA', undefined, exactAAA, planOrigin)
  }
  useStore.setState({
    selectedTicker: 'AAA', activeSwarm: 'research', constellationSwarm: 'research', selectToken: 1053,
    warp: null, graph, nodesByKey: new Map([[orb.key, orb]]), runRoot: exactAAA.run_root, dataNeeds: exactAAA,
    launchConfirm: null, launchPending: null,
  })
  await useStore.getState().launchRerun({ module: orb.module, name: orb.name, key: orb.key }, planOrigin)
  assert.deepEqual(planEstimateArgs?.[6], {
    runRoot: exactAAA.run_root, decisionFingerprint: exactAAA.decision_fingerprint, ...planOrigin,
  })
  assert.deepEqual(useStore.getState().launchConfirm?.selection.planOrigin, planOrigin)
  let planSubmitted: any = null
  api.launchExact = async (body: any) => { planSubmitted = body; throw new Error('fixture capture') }
  await useStore.getState().confirmRerun()
  assert.equal(planSubmitted?.planPath, planOrigin.planPath)
  assert.equal(planSubmitted?.planSha256, planOrigin.planSha256)
  assert.equal(planSubmitted?.sourceDecisionFingerprint, planOrigin.sourceDecisionFingerprint)

  api.estimate = async () => preflight('rerun', 'AAA', undefined, exactAAA)
  useStore.setState({ launchConfirm: null, launchPending: null })
  await useStore.getState().launchRerun({ module: orb.module, name: orb.name, key: orb.key }, planOrigin)
  assert.equal(useStore.getState().launchConfirm, null,
    'a plan-origin estimate without the exact plan capability cannot open confirmation')

  api.estimate = async () => preflight('rerun', 'GOLD', 'commodity', exactGold)
  useStore.setState({
    selectedTicker: 'GOLD', activeSwarm: 'commodity', constellationSwarm: 'commodity', selectToken: 106,
    warp: null, graph, nodesByKey: new Map([[orb.key, orb]]), runRoot: exactGold.run_root,
    dataNeeds: exactGold, launchConfirm: null, launchPending: null,
  })
  await useStore.getState().launchRerun({ module: orb.module, name: orb.name, key: orb.key })
  assert.deepEqual(useStore.getState().launchConfirm?.selection, {
    subject: 'GOLD', swarm: 'commodity', selectToken: 106, ...CLAUDE_SELECTION,
    runRoot: exactGold.run_root, decisionFingerprint: exactGold.decision_fingerprint,
  })
  let submitted: any = null
  api.launchExact = async (body: any) => { submitted = body; throw new Error('fixture stop after request capture') }
  await useStore.getState().confirmRerun()
  assert.equal(submitted?.ticker, 'GOLD')
  assert.equal(submitted?.swarm, 'commodity')
  assert.equal(submitted?.module, orb.module)
  assert.equal(submitted?.agent, orb.name)
  assert.equal(submitted?.runRoot, exactGold.run_root)
  assert.equal(submitted?.decisionFingerprint, exactGold.decision_fingerprint)

  // The final confirmation boundary independently requires the capability receipt. A stale/crafted modal
  // from an older bundle must not spend even when its local runRoot/fingerprint happen to be current.
  submitted = null
  useStore.setState({
    launchConfirm: {
      kind: 'rerun',
      selection: { subject: 'GOLD', swarm: 'commodity', selectToken: 106, ...CLAUDE_SELECTION,
        runRoot: exactGold.run_root, decisionFingerprint: exactGold.decision_fingerprint },
      preflight: preflight('rerun', 'GOLD', 'commodity'),
      cascade: [{ key: orb.key, module: orb.module, name: orb.name, layer: orb.layer, isSynthesis: false, kind: 'agent' }],
      node: { module: orb.module, name: orb.name, key: orb.key },
    },
  })
  await useStore.getState().confirmRerun()
  assert.equal(submitted, null, 'a confirmation with no server capability receipt fails closed before POST')

  let scopedArgs: any[] | null = null
  api.runIntakePlan = async (...args: any[]) => { scopedArgs = args; throw new Error('fixture stop after request capture') }
  useStore.setState({
    selectedTicker: 'AAA', activeSwarm: 'research', constellationSwarm: 'research', selectToken: 1061,
    runRoot: exactAAA.run_root, dataNeeds: null, scopedRerunPending: false,
  })
  await useStore.getState().runScopedRerun()
  assert.equal(scopedArgs, null, 'a scoped re-run without the exact fingerprint never posts')
  useStore.setState({
    dataNeeds: exactAAA,
    intake: {
      schema_version: '1.0', swarm: 'research', subject: 'AAA', ticker: 'AAA', run_root: exactAAA.run_root,
      decision_fingerprint: exactAAA.decision_fingerprint,
      plan_path: `${exactAAA.run_root}/intake/2026-08-13_intake_plan.json`,
      plan_sha256: `sha256:${'c'.repeat(64)}`, actionable: true,
      scan_date: '2026-08-13', new_docs: [],
      rerun_plan: { materiality_gate: 60, entry_orbs: [], commands: [{
        command: '/research:rerun demand source-reader AAA', module: orb.module, agent: orb.name,
        cascade_modules: [orb.module], triggered_by: ['fixture.pdf'],
      }], note_only: [] },
      verdict: 'scoped_rerun', summary: 'Fixture', analyzed_at: '2026-08-13T10:01:00.000Z', widened: [],
    },
    scopedRerunPending: false,
  })
  api.estimate = async () => preflight('rerun', 'AAA')
  await useStore.getState().runScopedRerun()
  assert.equal(scopedArgs, null, 'a scoped re-run fails closed when an old server omits the exact-call receipt')
  useStore.setState({ health: 'updating', scopedRerunPending: false })
  assert.equal(await useStore.getState().prepareScopedRerun(), false, 'a reviewed deployment blocks scoped planning')
  await useStore.getState().runScopedRerun()
  assert.equal(scopedArgs, null, 'a reviewed deployment blocks the scoped POST')
  useStore.setState({ health: 'online', scopedRerunPending: false })
  const scopedPlanOrigin = {
    planPath: `${exactAAA.run_root}/intake/2026-08-13_intake_plan.json`,
    planSha256: `sha256:${'c'.repeat(64)}`,
    sourceDecisionFingerprint: exactAAA.decision_fingerprint,
  }
  api.estimate = async () => preflight('rerun', 'AAA', undefined, exactAAA, scopedPlanOrigin)
  await useStore.getState().runScopedRerun()
  assert.ok(scopedArgs)
  const scopedCall = scopedArgs as unknown as any[]
  assert.deepEqual(scopedCall.slice(0, 5), ['AAA', 'research', exactAAA.run_root, exactAAA.decision_fingerprint, scopedPlanOrigin])
  assert.deepEqual(scopedCall[5], { subject: 'AAA', swarm: 'research', selectToken: 1061, ...CLAUDE_SELECTION, runRoot: exactAAA.run_root, decisionFingerprint: exactAAA.decision_fingerprint })

  // A subject label is only unique inside its swarm. A research GOLD run must remain visible in global
  // Activity, but it cannot block, reconnect to, or paint the commodity GOLD cockpit.
  let snapshotCalls = 0
  api.activeRuns = async () => ({ active: [{ runId: 'research-gold', kind: 'full', ticker: 'GOLD', status: 'running', swarmId: 'research' }] })
  api.runSnapshot = async () => { snapshotCalls++; throw new Error('must not reconnect across swarms') }
  useStore.setState({
    activeSwarm: 'commodity', constellationSwarm: 'commodity', selectedTicker: 'GOLD', selectToken: 1062,
    activeRuns: {
      'research-gold': { runId: 'research-gold', kind: 'full', ticker: 'GOLD', status: 'running', swarmId: 'research' },
    },
    nodeRuntime: {}, activeRunsByTicker: new Set(), globalActive: [],
  })
  assert.equal(useStore.getState().anyRunForTicker('GOLD'), false, 'same label in research cannot block commodity')
  assert.deepEqual(useStore.getState().activeRunsForTicker('GOLD'), [])
  useStore.getState()._handleEvent({
    type: 'agent-started', runId: 'research-gold', agentKey: orb.key, name: orb.name,
    module: orb.module, layer: orb.layer, ts: Date.now(),
  })
  assert.equal(useStore.getState().nodeRuntime[orb.key], undefined, 'another swarm event cannot paint this graph')
  await useStore.getState().refreshActiveRuns()
  await Promise.resolve()
  assert.equal(snapshotCalls, 0, 'live-follow reconnect is scoped by swarm and subject')
  assert.equal(useStore.getState().activeRunsByTicker.has('GOLD'), false, 'picker dots are scoped to the active swarm')
  assert.equal(useStore.getState().globalActive.length, 1, 'global Activity remains complete')

  api.activeRuns = async () => ({ active: [] })
  api.runSnapshot = async () => { throw Object.assign(new Error('missing after restart'), { status: 404 }) }
  useStore.setState({
    activeSwarm: 'research', constellationSwarm: 'research', selectedTicker: 'NU', selectToken: 10621,
    activeRuns: {
      'stale-after-restart': { runId: 'stale-after-restart', kind: 'full', ticker: 'NU', status: 'running', swarmId: 'research' },
    },
    activeRunsByTicker: new Set(['NU']), globalActive: [],
  })
  await useStore.getState().refreshActiveRuns()
  await new Promise((resolve) => setTimeout(resolve, 0))
  assert.equal(useStore.getState().activeRuns['stale-after-restart'], undefined,
    'an authoritative missing snapshot clears a locally-running card after an engine restart')
  assert.equal(useStore.getState().activeRunsByTicker.has('NU'), false,
    'the running subject indicator follows the empty active-run list')

  // Screener orb keys repeat for every signal. A late/background SSE frame is owned by the run's frozen
  // subject, never by whichever signal happens to be selected when it arrives.
  useStore.setState({
    activeSwarm: 'screener', constellationSwarm: 'screener', selectedTicker: null, scSelectedSignal: 'SIG-B',
    scRuntime: {}, runStream: [],
    activeRuns: { 'signal-a-run': { runId: 'signal-a-run', kind: 'signal', ticker: 'SIG-A', status: 'running', swarmId: 'screener' } },
  })
  useStore.getState()._handleScreenerEvent({
    type: 'agent-started', runId: 'signal-a-run', agentKey: orb.key, name: orb.name,
    module: orb.module, layer: orb.layer, ts: Date.now(),
  })
  assert.equal(useStore.getState().scRuntime[orb.key], undefined, 'background signal SSE cannot paint the selected signal')
  useStore.setState({
    // Even if a later mutable snapshot is wrong, the first learned subject remains immutable.
    activeRuns: { 'signal-a-run': { runId: 'signal-a-run', kind: 'signal', ticker: 'SIG-B', status: 'running', swarmId: 'screener' } },
  })
  useStore.getState()._handleScreenerEvent({
    type: 'agent-started', runId: 'signal-a-run', agentKey: orb.key, name: orb.name,
    module: orb.module, layer: orb.layer, ts: Date.now(),
  })
  assert.equal(useStore.getState().scRuntime[orb.key], undefined, 'a run subject cannot drift after its first SSE ownership binding')

  api.activeRuns = async () => ({ active: [{ runId: 'commodity-epoch', kind: 'module', ticker: 'GOLD', status: 'running', swarmId: 'commodity', chainId: 'chain-7', executionEpoch: 'epoch-7' }] })
  api.runSnapshot = async () => ({
    runId: 'commodity-epoch', kind: 'module', ticker: 'GOLD', module: 'demand', status: 'running', swarmId: 'commodity',
    agents: [], expected: [], chainId: 'chain-7', executionEpoch: 'epoch-7', provider: 'claude',
    executionProfile: { key: 'claude:opus:default', parentModel: 'opus', parentReasoning: 'default' },
    profileKey: 'claude:opus:default', model: 'opus', reasoningLevel: 'default',
  })
  useStore.setState({ activeRuns: {}, activeSwarm: 'commodity', constellationSwarm: 'commodity', selectedTicker: 'GOLD', selectToken: 1062 })
  await useStore.getState().refreshActiveRuns()
  await new Promise((resolve) => setTimeout(resolve, 0))
  assert.equal(useStore.getState().activeRuns['commodity-epoch']?.chainId, 'chain-7')
  assert.equal(useStore.getState().activeRuns['commodity-epoch']?.executionEpoch, 'epoch-7', 'snapshot reconnect preserves execution-scoped grouping identity')

  useStore.setState({
    selectedTicker: 'GOLD', activeSwarm: 'commodity', constellationSwarm: 'commodity', selectToken: 1063,
    runRoot: exactGold.run_root, dataNeeds: exactGold, activeRuns: {}, globalActive: [],
  })
  const intakePlan: IntakePlan = {
    schema_version: '1.0', swarm: 'commodity', subject: 'GOLD', ticker: 'GOLD', run_root: exactGold.run_root,
    decision_fingerprint: exactGold.decision_fingerprint, scan_date: '2026-08-13', new_docs: [],
    rerun_plan: { materiality_gate: 60, entry_orbs: [], commands: [], note_only: [] },
    verdict: 'note_only', summary: 'Nothing new', analyzed_at: '2026-08-13T10:01:00.000Z', widened: [],
  }
  let intakeArgs: any[] | null = null
  api.intake = async (...args: any[]) => { intakeArgs = args; return intakePlan }
  await useStore.getState().refreshIntake()
  assert.deepEqual(intakeArgs, ['GOLD', 'commodity', exactGold.run_root, exactGold.decision_fingerprint])
  assert.equal(useStore.getState().intake, intakePlan)

  let analyzeArgs: any[] | null = null
  api.analyzeIntake = async (...args: any[]) => { analyzeArgs = args; throw new Error('fixture stop before polling') }
  await useStore.getState().analyzeIntake()
  assert.deepEqual(analyzeArgs, ['GOLD', 'commodity', CLAUDE_SELECTION, exactGold.run_root, exactGold.decision_fingerprint])

  api.launch = async () => ({ runId: 'wrong-provider-run', preflight: preflight('full', 'AAA') })
  useStore.setState({
    activeSwarm: 'research', constellationSwarm: 'research', selectedTicker: 'AAA', selectToken: 1061,
    graph, nodesByKey: new Map([[orb.key, orb]]), warp: null, activeRuns: {}, runProvider: 'codex',
    providers: {
      claude: { provider: 'claude', enabled: true, available: true, checked: true, status: 'available', profile: { key: 'claude:opus:default', parentModel: 'opus', parentReasoning: 'default' } },
      codex: { provider: 'codex', enabled: true, available: true, checked: true, profile: CODEX_PROFILE },
      catalogState: 'valid',
    },
    launchConfirm: {
      kind: 'full', selection: { subject: 'AAA', swarm: 'research', selectToken: 1061, ...CODEX_SELECTION },
      preflight: { ...preflight('full', 'AAA'), provider: 'codex', profileKey: CODEX_SELECTION.expectedProfileKey, model: CODEX_SELECTION.model, reasoningLevel: CODEX_SELECTION.reasoningLevel, executionProfile: CODEX_SELECTION.executionProfile },
    },
  })
  await useStore.getState().confirmFull()
  assert.equal(useStore.getState().activeRuns['wrong-provider-run'], undefined, 'a mismatched provider receipt never paints the run as Codex')
  assert.match(useStore.getState().toast?.msg || '', /receipt did not match/i)

  const codexPreflight = { ...preflight('full', 'AAA'), provider: 'codex' as const, profileKey: CODEX_SELECTION.expectedProfileKey, model: CODEX_SELECTION.model, reasoningLevel: CODEX_SELECTION.reasoningLevel, executionProfile: CODEX_SELECTION.executionProfile }

  // Claude and Codex share one accepted-launch contract: same full-run acknowledgement payload, same
  // immediate Activity visibility, and the exact frozen provider/profile stamped on the live run.
  const claudeProfile = CLAUDE_PROFILE
  const providerMatrix = [
    {
      provider: 'claude' as const,
      selection: { provider: 'claude' as const, expectedProfileKey: claudeProfile.key, model: claudeProfile.parentModel, reasoningLevel: claudeProfile.parentReasoning, executionProfile: claudeProfile },
      preflight: { ...preflight('full', 'AAA'), provider: 'claude' as const, profileKey: claudeProfile.key, model: claudeProfile.parentModel, reasoningLevel: claudeProfile.parentReasoning, executionProfile: claudeProfile },
    },
    { provider: 'codex' as const, selection: CODEX_SELECTION, preflight: codexPreflight },
  ]
  for (const row of providerMatrix) {
    let submitted: any = null
    const runId = `provider-parity-${row.provider}`
    api.launch = async (body: any) => {
      submitted = body
      return {
        runId,
        provider: row.provider,
        profileKey: row.selection.expectedProfileKey,
        model: row.selection.model,
        reasoningLevel: row.selection.reasoningLevel,
        executionProfile: row.selection.executionProfile,
        preflight: row.preflight,
      } as any
    }
    useStore.setState({
      staticMode: false, health: 'online', activeSwarm: 'research', constellationSwarm: 'research',
      selectedTicker: 'AAA', selectToken: 1061, warp: null, graph, nodesByKey: new Map([[orb.key, orb]]),
      nodeRuntime: {}, activeRuns: {}, activityOpen: false, runProvider: row.provider,
      providers: {
        claude: { provider: 'claude', enabled: true, available: true, checked: true, status: 'available', profile: claudeProfile },
        codex: { provider: 'codex', enabled: true, available: true, checked: true, status: 'available', profile: CODEX_PROFILE },
        catalogState: 'valid',
      },
      launchConfirm: { kind: 'full', selection: { subject: 'AAA', swarm: 'research', selectToken: 1061, ...row.selection }, preflight: row.preflight },
      launchPending: null,
    })
    await useStore.getState().confirmFull()
    assert.equal(submitted?.ticker, 'AAA')
    assert.equal(submitted?.confirmTicker, 'AAA', `${row.provider} full run carries the same typed-subject acknowledgement`)
    assert.equal(submitted?.selection.provider, row.provider)
    assert.equal(useStore.getState().activeRuns[runId]?.provider, row.provider)
    assert.equal(useStore.getState().activityOpen, true, `${row.provider} admitted run opens Activity immediately`)
  }

  // Changing the model inside a confirmation is a new spend decision: discard the old capability,
  // re-price the exact selected profile, and never let the original balanced receipt survive.
  const codexProfiles = [
    { key: CODEX_PROFILE.key, label: 'Sol + Terra', description: 'Balanced', model: 'gpt-5.6-sol', reasoningLevel: 'max', executionProfile: CODEX_PROFILE },
    { key: CODEX_SOL_ONLY_PROFILE.key, label: 'Sol only', description: 'Highest quality', model: 'gpt-5.6-sol', reasoningLevel: 'max', executionProfile: CODEX_SOL_ONLY_PROFILE },
  ]
  const solOnlySelection = {
    provider: 'codex' as const,
    expectedProfileKey: CODEX_SOL_ONLY_PROFILE.key,
    model: CODEX_SOL_ONLY_PROFILE.parentModel,
    reasoningLevel: CODEX_SOL_ONLY_PROFILE.parentReasoning,
    executionProfile: CODEX_SOL_ONLY_PROFILE,
  }
  const solOnlyPreflight = {
    ...codexPreflight,
    profileKey: solOnlySelection.expectedProfileKey,
    model: solOnlySelection.model,
    reasoningLevel: solOnlySelection.reasoningLevel,
    executionProfile: solOnlySelection.executionProfile,
  }
  let repricedSelection: any = null
  api.estimate = async (_kind, _ticker, selection) => {
    repricedSelection = selection
    return solOnlyPreflight
  }
  useStore.setState({
    staticMode: false, health: 'online', activeSwarm: 'research', constellationSwarm: 'research',
    selectedTicker: 'AAA', selectToken: 1063, warp: null, graph, nodesByKey: new Map([[orb.key, orb]]),
    activeRuns: {}, activityOpen: false, runProvider: 'codex',
    runProfileKeys: { claude: claudeProfile.key, codex: CODEX_PROFILE.key },
    providers: {
      claude: {
        provider: 'claude', enabled: true, available: true, checked: true, status: 'available', profile: claudeProfile,
        defaultProfileKey: claudeProfile.key,
        profiles: [{ key: claudeProfile.key, label: 'Opus', description: 'Highest quality', model: 'opus', reasoningLevel: 'default', executionProfile: claudeProfile }],
      },
      codex: {
        provider: 'codex', enabled: true, available: true, checked: true, status: 'available', profile: CODEX_PROFILE,
        defaultProfileKey: CODEX_PROFILE.key, profiles: codexProfiles,
      },
      catalogState: 'valid',
    },
    launchConfirm: {
      kind: 'full', selection: { subject: 'AAA', swarm: 'research', selectToken: 1063, ...CODEX_SELECTION },
      preflight: codexPreflight,
    },
    launchPending: null,
  })
  await useStore.getState().changeLaunchProfile(CODEX_SOL_ONLY_PROFILE.key)
  assert.deepEqual(repricedSelection, {
    subject: 'AAA', swarm: 'research', selectToken: 1063, ...solOnlySelection,
  }, 'the fresh estimate receives only the newly selected immutable profile')
  assert.equal(useStore.getState().runProfileKeys.codex, CODEX_SOL_ONLY_PROFILE.key, 'the browser remembers the new Codex model profile')
  const repricedConfirmation = useStore.getState().launchConfirm
  assert.equal(repricedConfirmation?.selection.expectedProfileKey, CODEX_SOL_ONLY_PROFILE.key)
  assert.equal(repricedConfirmation?.kind === 'full' ? repricedConfirmation.preflight.profileKey : undefined, CODEX_SOL_ONLY_PROFILE.key)

  // A malformed or provider-specific estimate cannot silently remove the full-run confirmation step.
  api.estimate = async () => ({ ...codexPreflight, requiresTypedConfirm: false })
  useStore.setState({
    selectedTicker: 'AAA', activeSwarm: 'research', constellationSwarm: 'research', selectToken: 1062,
    activeRuns: {}, runProvider: 'codex', launchConfirm: null, launchPending: null,
  })
  await useStore.getState().requestFull()
  assert.equal(useStore.getState().launchConfirm, null, 'a full estimate that weakens acknowledgement fails closed')
  assert.match(useStore.getState().toast?.msg || '', /couldn.t verify/i)

  api.launch = async () => ({
    runId: 'contradictory-top-level', provider: 'claude', profileKey: CODEX_SELECTION.expectedProfileKey,
    model: CODEX_SELECTION.model, reasoningLevel: CODEX_SELECTION.reasoningLevel,
    executionProfile: CODEX_SELECTION.executionProfile, preflight: codexPreflight,
  } as any)
  useStore.setState({
    launchConfirm: { kind: 'full', selection: { subject: 'AAA', swarm: 'research', selectToken: 1061, ...CODEX_SELECTION }, preflight: codexPreflight },
    launchPending: null, activeRuns: {},
  })
  await useStore.getState().confirmFull()
  assert.equal(useStore.getState().activeRuns['contradictory-top-level'], undefined,
    'an exact nested receipt cannot launder a contradictory top-level response')

  api.launch = async () => ({ runId: '', provider: 'codex', profileKey: CODEX_SELECTION.expectedProfileKey,
    model: CODEX_SELECTION.model, reasoningLevel: CODEX_SELECTION.reasoningLevel,
    executionProfile: CODEX_SELECTION.executionProfile, preflight: codexPreflight } as any)
  useStore.setState({
    launchConfirm: { kind: 'full', selection: { subject: 'AAA', swarm: 'research', selectToken: 1061, ...CODEX_SELECTION }, preflight: codexPreflight },
    launchPending: null, activeRuns: {},
  })
  await useStore.getState().confirmFull()
  assert.equal(Object.keys(useStore.getState().activeRuns).length, 0, 'an empty run id never adopts a paid launch')

  const delayedAgent = deferred<any>()
  api.launch = async () => delayedAgent.promise
  api.activeRuns = async () => ({ active: [] })
  useStore.setState({
    activeSwarm: 'research', constellationSwarm: 'research', selectedTicker: 'AAA', selectToken: 1064,
    graph, nodesByKey: new Map([[orb.key, orb]]), nodeRuntime: {}, activeRuns: {}, runProvider: 'claude',
    providers: providerCatalog(), launchPending: null,
  })
  const agentLaunch = useStore.getState().launchAgent(orb)
  useStore.setState({ activeSwarm: 'commodity', constellationSwarm: 'commodity', selectedTicker: 'GOLD', nodeRuntime: {} })
  delayedAgent.resolve({
    runId: 'frozen-agent-run', provider: 'claude', profileKey: CLAUDE_PROFILE.key,
    model: CLAUDE_PROFILE.parentModel, reasoningLevel: CLAUDE_PROFILE.parentReasoning,
    executionProfile: CLAUDE_PROFILE,
  })
  await agentLaunch
  assert.equal(useStore.getState().activeRuns['frozen-agent-run']?.ticker, 'AAA', 'post-await registration keeps the frozen subject')
  assert.equal(useStore.getState().activeRuns['frozen-agent-run']?.swarmId, 'research', 'post-await registration keeps the frozen swarm')
  assert.equal(useStore.getState().activeRuns['frozen-agent-run']?.provider, 'claude', 'post-await registration keeps the frozen provider receipt')
  assert.equal(useStore.getState().nodeRuntime[orb.key], undefined, 'a background launch cannot queue orbs on the newly selected graph')

  // Navigation clears both the modal and selection-bound estimate feedback synchronously, before any
  // graph/network read can complete.
  useStore.setState({
    activeSwarm: 'research', constellationSwarm: 'research', selectedTicker: 'AAA', selectToken: 107,
    swarms: [research, commodity], warp: null,
    launchConfirm: { kind: 'full', selection: { subject: 'AAA', swarm: 'research', selectToken: 107, ...CLAUDE_SELECTION }, preflight: preflight('full', 'AAA') },
    launchPending: { key: 'full:request', label: 'Preparing…', ticker: 'AAA', selection: { subject: 'AAA', swarm: 'research', selectToken: 107, ...CLAUDE_SELECTION } },
  })
  api.swarmSubjects = async () => ({ subjects: [], summaries: [] })
  useStore.getState().switchSwarm('commodity')
  assert.equal(useStore.getState().launchConfirm, null)
  assert.equal(useStore.getState().launchPending, null)

  const never = new Promise<SwarmGraph>(() => {})
  api.swarm = async () => never
  useStore.setState({
    activeSwarm: 'research', constellationSwarm: 'research', selectedTicker: 'AAA', selectToken: 108, warp: null,
    launchConfirm: { kind: 'full', selection: { subject: 'AAA', swarm: 'research', selectToken: 108, ...CLAUDE_SELECTION }, preflight: preflight('full', 'AAA') },
    launchPending: { key: 'full:request', label: 'Preparing…', ticker: 'AAA', selection: { subject: 'AAA', swarm: 'research', selectToken: 108, ...CLAUDE_SELECTION } },
  })
  void useStore.getState().selectTicker('BBB')
  assert.equal(useStore.getState().launchConfirm, null)
  assert.equal(useStore.getState().launchPending, null)

  console.log('launch selection: exact estimate/confirm identity guards passed')
} finally {
  api.estimate = original.estimate
  api.thesisPlan = original.thesisPlan
  api.launch = original.launch
  api.launchExact = original.launchExact
  api.intake = original.intake
  api.analyzeIntake = original.analyzeIntake
  api.runIntakePlan = original.runIntakePlan
  api.activeRuns = original.activeRuns
  api.runSnapshot = original.runSnapshot
  api.swarm = original.swarm
  api.swarmSubjects = original.swarmSubjects
  ;(globalThis as any).window = previousWindow
  ;(globalThis as any).document = previousDocument
  ;(globalThis as any).EventSource = previousEventSource
}
