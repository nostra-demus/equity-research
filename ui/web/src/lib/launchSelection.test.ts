import assert from 'node:assert/strict'
import type { AgentNode, DataNeedsRead, IntakePlan, LaunchPreflight, SwarmGraph, SwarmMeta } from './types'

const previousWindow = (globalThis as any).window
const previousDocument = (globalThis as any).document

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

const { api } = await import('./api')
const { useStore } = await import('./store')

const original = {
  estimate: api.estimate,
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
    runRoot: exactAAA.run_root, dataNeeds: null,
  })

  const fullEstimate = deferred<LaunchPreflight>()
  api.estimate = async () => fullEstimate.promise
  const staleFull = useStore.getState().requestFull()
  assert.deepEqual(useStore.getState().launchPending?.selection, { subject: 'AAA', swarm: 'research', selectToken: 101 })
  useStore.setState({ selectedTicker: 'BBB', selectToken: 102, launchConfirm: null, launchPending: null })
  fullEstimate.resolve(preflight('full', 'AAA'))
  await staleFull
  assert.equal(useStore.getState().launchConfirm, null, 'a full estimate cannot cross a selection change')

  api.estimate = async () => preflight('full', 'AAA')
  useStore.setState({ selectedTicker: 'AAA', activeSwarm: 'research', selectToken: 103, warp: null, launchConfirm: null, runRoot: exactAAA.run_root, dataNeeds: null })
  await useStore.getState().requestFull()
  assert.deepEqual(useStore.getState().launchConfirm?.selection, { subject: 'AAA', swarm: 'research', selectToken: 103 })
  assert.equal(useStore.getState().launchConfirm?.kind, 'full', 'a missing exact-call fingerprint must not disable a new full run')

  let launchCalls = 0
  api.launch = async () => { launchCalls++; throw new Error('must not launch') }
  useStore.setState({ selectedTicker: 'BBB', selectToken: 104 })
  await useStore.getState().confirmFull()
  assert.equal(launchCalls, 0, 'a stale full confirmation cannot submit a paid POST')
  assert.equal(useStore.getState().launchConfirm, null)

  const rerunEstimate = deferred<LaunchPreflight>()
  api.estimate = async () => rerunEstimate.promise
  useStore.setState({
    selectedTicker: 'AAA', activeSwarm: 'research', constellationSwarm: 'research', selectToken: 105,
    warp: null, graph, nodesByKey: new Map([[orb.key, orb]]), runRoot: exactAAA.run_root, dataNeeds: exactAAA,
    launchConfirm: null, launchPending: null,
  })
  const staleRerun = useStore.getState().launchRerun({ module: orb.module, name: orb.name, key: orb.key })
  assert.deepEqual(useStore.getState().launchPending?.selection, {
    subject: 'AAA', swarm: 'research', selectToken: 105,
    runRoot: exactAAA.run_root, decisionFingerprint: exactAAA.decision_fingerprint,
  })
  useStore.setState({ warp: { from: 'research', to: 'commodity', phase: 'collapse' }, launchConfirm: null, launchPending: null })
  rerunEstimate.resolve(preflight('rerun', 'AAA', undefined, exactAAA))
  await staleRerun
  assert.equal(useStore.getState().launchConfirm, null, 'an estimate resolving during swarm navigation stays closed')

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
      kind: 'rerun', selection: { subject: 'AAA', swarm: 'research', selectToken: 1051 },
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
  assert.deepEqual(legacyEstimateArgs?.[5], {
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
  assert.deepEqual(planEstimateArgs?.[5], {
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
    subject: 'GOLD', swarm: 'commodity', selectToken: 106,
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
      selection: { subject: 'GOLD', swarm: 'commodity', selectToken: 106,
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
  const scopedPlanOrigin = {
    planPath: `${exactAAA.run_root}/intake/2026-08-13_intake_plan.json`,
    planSha256: `sha256:${'c'.repeat(64)}`,
    sourceDecisionFingerprint: exactAAA.decision_fingerprint,
  }
  api.estimate = async () => preflight('rerun', 'AAA', undefined, exactAAA, scopedPlanOrigin)
  await useStore.getState().runScopedRerun()
  assert.deepEqual(scopedArgs, ['AAA', 'research', exactAAA.run_root, exactAAA.decision_fingerprint, scopedPlanOrigin])

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
  assert.deepEqual(analyzeArgs, ['GOLD', 'commodity', exactGold.run_root, exactGold.decision_fingerprint])

  // Navigation clears both the modal and selection-bound estimate feedback synchronously, before any
  // graph/network read can complete.
  useStore.setState({
    activeSwarm: 'research', constellationSwarm: 'research', selectedTicker: 'AAA', selectToken: 107,
    swarms: [research, commodity], warp: null,
    launchConfirm: { kind: 'full', selection: { subject: 'AAA', swarm: 'research', selectToken: 107 }, preflight: preflight('full', 'AAA') },
    launchPending: { key: 'full:request', label: 'Preparing…', ticker: 'AAA', selection: { subject: 'AAA', swarm: 'research', selectToken: 107 } },
  })
  api.swarmSubjects = async () => ({ subjects: [], summaries: [] })
  useStore.getState().switchSwarm('commodity')
  assert.equal(useStore.getState().launchConfirm, null)
  assert.equal(useStore.getState().launchPending, null)

  const never = new Promise<SwarmGraph>(() => {})
  api.swarm = async () => never
  useStore.setState({
    activeSwarm: 'research', constellationSwarm: 'research', selectedTicker: 'AAA', selectToken: 108, warp: null,
    launchConfirm: { kind: 'full', selection: { subject: 'AAA', swarm: 'research', selectToken: 108 }, preflight: preflight('full', 'AAA') },
    launchPending: { key: 'full:request', label: 'Preparing…', ticker: 'AAA', selection: { subject: 'AAA', swarm: 'research', selectToken: 108 } },
  })
  void useStore.getState().selectTicker('BBB')
  assert.equal(useStore.getState().launchConfirm, null)
  assert.equal(useStore.getState().launchPending, null)

  console.log('launch selection: exact estimate/confirm identity guards passed')
} finally {
  api.estimate = original.estimate
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
}
