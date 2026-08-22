import assert from 'node:assert/strict'
import { api } from './api'
import { moduleRunAffordance, moduleRunConfirmation, moduleRunInputModules } from './moduleRun'
import { providerCatalogFallback } from './provider'
import { useStore } from './store'
import type { AgentNode, LaunchPreflight, NodeStatus, ThesisPlan } from './types'

const orb = (nn: string, synthesis = false): AgentNode => ({
  key: `management-governance/${nn}_${synthesis ? 'management-governance-synthesis' : `check-${nn}`}`,
  module: 'management-governance',
  nn,
  name: synthesis ? 'management-governance-synthesis' : `check-${nn}`,
  slug: synthesis ? 'management-governance-synthesis' : `check-${nn}`,
  layer: synthesis ? 99 : 1,
  failFast: false,
  description: '',
  tools: [],
  requiredUpstream: [],
  soloRunnable: true,
  isSynthesis: synthesis,
})

const nodes = [
  ...Array.from({ length: 13 }, (_, i) => orb(String(i).padStart(2, '0'))),
  orb('99', true),
]
const statuses = new Map<string, NodeStatus>(nodes.map((node, i) => [node.key, i < 7 || node.isSynthesis ? 'done' : 'ready']))
const affordance = moduleRunAffordance(nodes, (key) => statuses.get(key) ?? 'dormant')
assert.equal(affordance.complete, false, 'an old done synthesis cannot hide empty current-roster specialists')
assert.equal(affordance.unfinishedSpecialists, 6)
assert.equal(affordance.label, '▸ finish 6 empty + related + summary')
assert.match(affordance.title, /may rerun saved checks that depend on them/i)
const declaredInputs = moduleRunInputModules([
  { name: 'business-model', dependsOn: [] },
  { name: 'earnings', dependsOn: ['business-model'] },
  { name: 'balance-sheet-survival', dependsOn: ['business-model', 'earnings'] },
  { name: 'management-governance', dependsOn: ['business-model', 'earnings'], readsFrom: ['balance-sheet-survival'] },
], 'management-governance')
assert.deepEqual(declaredInputs, ['business-model', 'earnings', 'balance-sheet-survival'],
  'confirmation inputs include transitive required ancestors and the target module’s direct optional reads')
const confirmationCopy = moduleRunConfirmation(
  'management-governance',
  affordance.unfinishedSpecialists,
  declaredInputs,
)
assert.equal(confirmationCopy.title, 'Run Management Governance?')
assert.equal(confirmationCopy.emptyValue, '6 visible now')
assert.equal(confirmationCopy.savedInputsValue,
  'Business Model, Earnings, and Balance Sheet Survival — reused if available; may not include newest source data')
assert.match(confirmationCopy.relatedValue, /empty orb/i)
assert.match(confirmationCopy.summaryValue, /always refreshed/i)
assert.equal(confirmationCopy.actionLabel, 'Run Governance')

for (const node of nodes) statuses.set(node.key, 'done')
const completeAffordance = moduleRunAffordance(nodes, (key) => statuses.get(key)!)
assert.equal(completeAffordance.label, '✓ done')
assert.match(completeAffordance.title, /click to check/i, 'a painted-done module can still need its older synthesis refreshed')

for (const node of nodes) statuses.set(node.key, node.isSynthesis ? 'ready' : 'done')
assert.equal(moduleRunAffordance(nodes, (key) => statuses.get(key)!).label, '▸ refresh summary')

for (const node of nodes) statuses.set(node.key, 'ready')
assert.equal(moduleRunAffordance(nodes, (key) => statuses.get(key)!).label, '▸ run module')

for (const [i, node] of nodes.entries()) statuses.set(node.key, i < 7 || node.isSynthesis ? 'done' : 'ready')
const standingRuntime = Object.fromEntries(
  nodes.filter((node, i) => i < 7 || node.isSynthesis).map((node) => [node.key, { status: 'done' as const }]),
)

const original = {
  thesisPlan: api.thesisPlan,
  runThesisPlanModule: api.runThesisPlanModule,
  publishThesisPlanModule: api.publishThesisPlanModule,
  launch: api.launch,
  estimate: api.estimate,
  cancelSubject: api.cancelSubject,
  setToast: useStore.getState().setToast,
  eventSource: globalThis.EventSource,
}

const plan: ThesisPlan = {
  moduleResumeVersion: 2,
  exactModuleScope: {
    module: 'management-governance',
    savedInputs: ['business-model', 'earnings', 'balance-sheet-survival'],
  },
  swarm: 'research',
  subject: 'INDIAMART',
  targetRunRoot: 'analyses/INDIAMART_2026-08-21',
  complete: false,
  finalReportPath: null,
  modules: [{
    module: 'management-governance',
    state: 'partial',
    sourceRunRoot: 'analyses/INDIAMART_2026-08-14',
    sourceDate: '2026-08-14',
    inTargetRoot: false,
    doneAgents: 6,
    totalAgents: 14,
    blockedBy: [],
    runnable: true,
    willRunAgents: 8,
    doneOrbKeys: nodes.filter((node, i) => !node.isSynthesis && i < 6).map((node) => node.key),
    synthesisNeedsRefresh: true,
  }],
  reusable: ['business-model', 'earnings'],
  mustReuse: [],
  reuse: ['business-model', 'earnings'],
  run: ['management-governance'],
  carry: [],
  master: { state: 'blocked', blockedBy: ['management-governance'] },
  dataPool: { files: 85, newestDate: '2026-08-14', newestMs: 1_776_000_000_000 },
  preflight: {} as ThesisPlan['preflight'],
  fullPreflight: {} as ThesisPlan['fullPreflight'],
  canCarry: true,
}

try {
  class FakeEventSource {
    onerror: ((event: Event) => void) | null = null
    addEventListener() {}
    close() {}
  }
  Object.defineProperty(globalThis, 'EventSource', { configurable: true, writable: true, value: FakeEventSource })
  let resolvePlan!: (plan: ThesisPlan) => void
  let resolveResume!: (value: any) => void
  let markResumeStarted!: () => void
  const resumeStarted = new Promise<void>((resolve) => { markResumeStarted = resolve })
  let planCalls = 0
  let resumeCalls = 0
  let publicationCalls = 0
  let publicationArgs: unknown[] | null = null
  let agentLaunchCalls = 0
  let estimateCalls = 0
  let resumeArgs: unknown[] | null = null
  api.thesisPlan = async () => {
    planCalls++
    return await new Promise<ThesisPlan>((resolve) => { resolvePlan = resolve })
  }
  api.runThesisPlanModule = async (...args) => {
    resumeCalls++
    resumeArgs = args
    markResumeStarted()
    return await new Promise<any>((resolve) => { resolveResume = resolve })
  }
  api.publishThesisPlanModule = async (...args) => {
    publicationCalls++
    publicationArgs = args
    return { published: true }
  }
  api.launch = async () => {
    agentLaunchCalls++
    throw new Error('module heading must not use the blunt /api/launch path')
  }
  api.estimate = async () => {
    estimateCalls++
    throw new Error('a competing full/rerun estimate must not start')
  }

  const toast = (value: any) => useStore.setState({ toast: value })
  useStore.setState({
    staticMode: false,
    health: 'online',
    activeSwarm: 'research',
    constellationSwarm: 'research',
    selectedTicker: 'INDIAMART',
    runProvider: 'claude',
    providers: providerCatalogFallback(),
    graph: {
      modules: [
        { name: 'management-governance', order: 3, dependsOn: ['business-model', 'earnings'], readsFrom: ['balance-sheet-survival'], exactResume: true, layers: {}, agentCount: nodes.length },
        { name: 'business-model', order: 0, dependsOn: [], exactResume: false, layers: {}, agentCount: 0 },
        { name: 'earnings', order: 1, dependsOn: ['business-model'], exactResume: false, layers: {}, agentCount: 0 },
        { name: 'balance-sheet-survival', order: 2, dependsOn: ['business-model', 'earnings'], exactResume: false, layers: {}, agentCount: 0 },
      ],
      masterSynthesizer: { name: 'synthesizer', description: '' },
      totals: { modules: 4, agents: nodes.length, specialists: nodes.length - 1, synthesis: 1 },
    },
    nodesByKey: new Map(nodes.map((node) => [node.key, node])),
    nodeRuntime: { ...standingRuntime },
    activeRuns: {},
    globalActive: [],
    launchConfirm: null,
    launchPending: null,
    thesisPlan: null,
    toast: null,
    setToast: toast,
  })

  await useStore.getState().launchModule('management-governance')
  const firstConfirmation = useStore.getState().launchConfirm
  assert.equal(firstConfirmation?.kind, 'module', 'one heading click opens the module confirmation synchronously')
  assert.equal(firstConfirmation?.kind === 'module' ? firstConfirmation.module : null, 'management-governance')
  assert.equal(firstConfirmation?.kind === 'module' ? firstConfirmation.unfinishedSpecialists : null, 6)
  assert.deepEqual(firstConfirmation?.kind === 'module' ? firstConfirmation.inputModules : null,
    ['business-model', 'earnings', 'balance-sheet-survival'],
    'confirmation captures required and optional graph-declared inputs without hardcoded module names')
  assert.equal(useStore.getState().launchPending, null, 'opening confirmation does not start a plan request')
  assert.deepEqual(
    { planCalls, resumeCalls, publicationCalls, agentLaunchCalls, estimateCalls },
    { planCalls: 0, resumeCalls: 0, publicationCalls: 0, agentLaunchCalls: 0, estimateCalls: 0 },
    'the first heading click performs no GET, POST, estimate, publication, or run',
  )
  useStore.getState().cancelLaunch()
  assert.equal(useStore.getState().launchConfirm, null)
  assert.equal(planCalls, 0, 'Cancel closes the confirmation without reading the plan')

  await useStore.getState().launchModule('management-governance')
  const launch = useStore.getState().confirmModule()
  const modulePlanningPending = useStore.getState().launchPending
  assert.equal(modulePlanningPending?.key, 'module:management-governance', 'Run Governance gives immediate feedback while disk truth loads')
  await useStore.getState().launchAgent(nodes[7])
  assert.equal(agentLaunchCalls, 0, 'an agent click cannot overwrite a module plan pending for the same ticker')
  assert.equal(useStore.getState().launchPending, modulePlanningPending, 'the blocked agent click preserves the module spinner by identity')
  await useStore.getState().requestFull()
  await useStore.getState().launchRerun(nodes[7])
  assert.equal(estimateCalls, 0, 'Run full and Re-run cannot price competing work while the module heading is planning')
  assert.equal(useStore.getState().launchPending, modulePlanningPending, 'full/rerun clicks cannot replace the module spinner')
  await useStore.getState().launchModule('management-governance')
  assert.equal(planCalls, 1, 'a double-click while the plan is loading cannot submit a second request')
  await useStore.getState().launchModule('valuation')
  assert.equal(planCalls, 1, 'another module heading cannot start a competing plan for the same ticker')
  resolvePlan(plan)
  await resumeStarted
  await useStore.getState().launchModule('valuation')
  assert.equal(planCalls, 1, 'another module heading cannot plan while the first module POST is pending')
  assert.equal(resumeCalls, 1, 'another module heading cannot issue a competing POST')
  assert.notEqual(useStore.getState().toast?.action?.label, 'Stop & run again', 'a blocked second click cannot offer to cancel the legitimate winner')
  resolveResume({
    runId: 'run_module_resume_test',
    preflight: {} as any,
    module: 'management-governance',
    willRun: 8,
    doneOrbKeys: nodes.filter((node, i) => !node.isSynthesis && i < 6).map((node) => node.key),
    carried: [{ module: 'business-model', from: 'analyses/INDIAMART_2026-08-14' }],
    resumed: true,
    ranClean: false,
  })
  await launch

  assert.equal(planCalls, 1, 'the heading reads a fresh server plan before spending')
  assert.deepEqual(resumeArgs, [
    'INDIAMART',
    'management-governance',
    ['business-model', 'earnings'],
    'research',
    8,
    nodes.filter((node, i) => !node.isSynthesis && i < 6).map((node) => node.key),
    'analyses/INDIAMART_2026-08-21',
    85,
    1_776_000_000_000,
    { subject: 'INDIAMART', swarm: 'research', selectToken: 0, provider: 'claude', legacyClaudeFallback: true },
  ])
  assert.match(useStore.getState().toast?.msg ?? '', /6 empty orbs \+ 1 related saved check \+ a fresh summary/)
  assert.equal(useStore.getState().nodeRuntime[nodes[6].key]?.status, 'queued', 'the saved dependent check queues without being mislabeled as an originally empty orb')
  assert.equal(useStore.getState().launchPending, null)
  useStore.setState({ activeRuns: {}, globalActive: [], nodeRuntime: { ...standingRuntime } })

  const confirmGovernance = async () => {
    await useStore.getState().launchModule('management-governance')
    assert.equal(useStore.getState().launchConfirm?.kind, 'module')
    await useStore.getState().confirmModule()
  }

  // Historical partials can merge across folders: check-07 is painted empty in the standing run, but the
  // server found a valid saved output for it elsewhere; check-06 is painted done, but must rerun because it
  // depends on a newly filled check. Count only the intersection of painted-empty AND actually planned keys.
  const mergedDoneKeys = nodes
    .filter((node, i) => !node.isSynthesis && (i < 6 || i === 7))
    .map((node) => node.key)
  api.thesisPlan = async () => ({
    ...plan,
    modules: [{ ...plan.modules[0], doneAgents: 7, willRunAgents: 7, doneOrbKeys: mergedDoneKeys }],
  })
  api.runThesisPlanModule = async () => ({
    runId: 'run_historical_merge_test',
    preflight: {} as any,
    module: 'management-governance',
    willRun: 7,
    doneOrbKeys: mergedDoneKeys,
    carried: [],
    resumed: true,
    ranClean: false,
  })
  await confirmGovernance()
  assert.match(useStore.getState().toast?.msg ?? '', /5 empty orbs \+ 1 related saved check \+ a fresh summary/)
  assert.equal(useStore.getState().nodeRuntime[nodes[7].key]?.status, 'done', 'a historically merged saved orb is reused even when the standing graph painted it empty')
  assert.equal(useStore.getState().nodeRuntime[nodes[6].key]?.status, 'queued', 'a painted-done dependent remains part of the actual plan')
  useStore.setState({ activeRuns: {}, globalActive: [], nodeRuntime: { ...standingRuntime }, launchPending: null })

  // A saved upstream synthesis can remain usable for this explicitly disclosed Governance read even when a
  // newer partial attempt means it is NOT globally reusable as a completed full-thesis module. The browser
  // asks once for the module-scoped plan; only the server selects those inputs and the paid POST uses exactly
  // that returned scope.
  const savedInputPlan: ThesisPlan = {
    ...plan,
    reusable: [],
    reuse: ['business-model', 'earnings', 'balance-sheet-survival'],
    modules: [{ ...plan.modules[0], runnable: true, blockedBy: [] }],
  }
  const savedInputPlanReads: unknown[][] = []
  let savedInputPosts = 0
  let savedInputPostArgs: unknown[] | null = null
  api.thesisPlan = async (...args: any[]) => {
    savedInputPlanReads.push(args)
    return savedInputPlan
  }
  api.runThesisPlanModule = async (...args) => {
    savedInputPosts++
    savedInputPostArgs = args
    return {
      runId: 'run_saved_input_scope',
      preflight: {} as any,
      module: 'management-governance',
      willRun: savedInputPlan.modules[0].willRunAgents,
      doneOrbKeys: savedInputPlan.modules[0].doneOrbKeys,
      carried: [
        { module: 'business-model', from: 'analyses/INDIAMART_2026-08-14' },
        { module: 'earnings', from: 'analyses/INDIAMART_2026-08-14' },
      ],
      resumed: true,
      ranClean: false,
    }
  }
  await useStore.getState().launchModule('management-governance')
  assert.equal(useStore.getState().launchConfirm?.kind, 'module')
  assert.equal(savedInputPlanReads.length, 0, 'the saved-input action performs no GET before confirmation')
  assert.equal(savedInputPosts, 0, 'the saved-input action performs no POST before confirmation')
  await useStore.getState().confirmModule()
  assert.deepEqual(savedInputPlanReads, [
    ['INDIAMART', { subject: 'INDIAMART', swarm: 'research', selectToken: 0, provider: 'claude', legacyClaudeFallback: true }, 'research', undefined, 'management-governance'],
  ], 'confirmation reads exactly one server-owned module plan')
  assert.equal(savedInputPosts, 1, 'the runnable saved-input scope submits exactly one module POST')
  assert.deepEqual(savedInputPostArgs?.[2], savedInputPlan.reuse,
    'the module POST uses the server-selected saved-input set even though it is not globally reusable')

  // A rolling/older backend without the positive module-scope receipt cannot turn the confirmed click into a
  // blunt whole-module run. It fails closed before the paid POST.
  useStore.setState({ activeRuns: {}, globalActive: [], nodeRuntime: { ...standingRuntime }, launchPending: null })
  api.thesisPlan = async () => ({ ...savedInputPlan, exactModuleScope: undefined })
  await useStore.getState().launchModule('management-governance')
  await useStore.getState().confirmModule()
  assert.equal(savedInputPosts, 1, 'a missing exact-module receipt starts no additional paid run')
  assert.match(useStore.getState().toast?.msg ?? '', /engine is still updating/i)
  useStore.setState({ activeRuns: {}, globalActive: [], nodeRuntime: { ...standingRuntime }, launchPending: null })

  // The reciprocal race: while an agent POST is pending, a module click neither plans nor replaces the
  // agent spinner. Its eventual cleanup is identity-safe if a newer operation owns the global pending slot.
  let resolveAgent!: (value: any) => void
  let reciprocalPlanCalls = 0
  api.thesisPlan = async () => { reciprocalPlanCalls++; return plan }
  api.launch = async () => {
    agentLaunchCalls++
    return await new Promise<any>((resolve) => { resolveAgent = resolve })
  }
  const agentLaunch = useStore.getState().launchAgent(nodes[8])
  const agentPending = useStore.getState().launchPending
  assert.equal(agentPending?.key, `agent:${nodes[8].key}`)
  await useStore.getState().launchModule('management-governance')
  assert.equal(reciprocalPlanCalls, 0, 'a module click cannot plan while an agent launch owns the same-ticker pending slot')
  assert.equal(useStore.getState().launchPending, agentPending, 'the blocked module click preserves the agent spinner by identity')
  const newerPending = { key: 'newer:operation', label: 'Newer operation…', ticker: 'OTHER' }
  useStore.setState({ launchPending: newerPending })
  resolveAgent({ runId: 'run_agent_pending_test' })
  await agentLaunch
  assert.equal(useStore.getState().launchPending, newerPending, 'an older agent finally cannot clear a newer pending operation')
  useStore.setState({ activeRuns: {}, globalActive: [], nodeRuntime: { ...standingRuntime }, launchPending: null })

  let resolveFullEstimate!: (value: LaunchPreflight) => void
  api.estimate = async () => await new Promise<LaunchPreflight>((resolve) => { resolveFullEstimate = resolve })
  const fullRequest = useStore.getState().requestFull()
  const fullPending = useStore.getState().launchPending
  assert.equal(fullPending?.key, 'full:request')
  await useStore.getState().launchModule('management-governance')
  assert.equal(reciprocalPlanCalls, 0, 'a module heading cannot plan while Run full is being priced')
  assert.equal(useStore.getState().launchPending, fullPending, 'the blocked module click preserves the Run full spinner')
  const afterFullPending = { key: 'newer:after-full', label: 'Newer operation…', ticker: 'OTHER' }
  useStore.setState({ launchPending: afterFullPending })
  resolveFullEstimate({
    kind: 'full', ticker: 'INDIAMART', agentCount: nodes.length, estCostUsdRange: [1, 2],
    estMinutesRange: [1, 2], willCommitToMain: true, estCommits: 1, requiresTypedConfirm: true,
    creditPreflight: { ok: true, checked: true },
  })
  await fullRequest
  assert.equal(useStore.getState().launchConfirm?.kind, 'full')
  assert.equal(useStore.getState().launchPending, afterFullPending, 'the completed full estimate cannot clear a newer pending operation')
  useStore.setState({ launchConfirm: null, launchPending: null })

  // A force action is bound to the selection that produced it. Switching away invalidates the selectToken;
  // clicking the old toast must not cancel or launch anything for either company.
  let cancelCalls = 0
  let staleActionPlanCalls = 0
  api.cancelSubject = async () => { cancelCalls++; return {} as any }
  api.thesisPlan = async () => { staleActionPlanCalls++; return plan }
  useStore.setState({
    activeRuns: {
      busy: { runId: 'busy', ticker: 'INDIAMART', swarmId: 'research', kind: 'module', module: 'management-governance', status: 'running' },
    },
    nodeRuntime: { ...standingRuntime, [nodes[0].key]: { status: 'running', runId: 'busy' } },
  })
  await useStore.getState().launchModule('management-governance')
  const staleForceAction = useStore.getState().toast?.action
  assert.equal(staleForceAction?.label, 'Stop & run again')
  useStore.setState({ selectedTicker: 'OTHER', selectToken: useStore.getState().selectToken + 1 })
  useStore.setState({ selectedTicker: 'INDIAMART', selectToken: useStore.getState().selectToken + 1 })
  staleForceAction?.onClick()
  await Promise.resolve()
  assert.equal(cancelCalls, 0, 'a stale Stop & run again action cannot cancel the original ticker')
  assert.equal(staleActionPlanCalls, 0, 'a stale Stop & run again action cannot plan a run on the new ticker')
  assert.match(useStore.getState().toast?.msg ?? '', /selected call changed/i)
  useStore.setState({
    activeRuns: {},
    globalActive: [],
    nodeRuntime: { ...standingRuntime },
    launchPending: null,
  })

  // A subject-cancel timeout means the old engine may still be writing. The force path must stop before
  // asking for a plan or posting a replacement run; a 409 is not a successful "Stop & run again".
  let unconfirmedCancelCalls = 0
  let planAfterUnconfirmedCancel = 0
  api.cancelSubject = async () => {
    unconfirmedCancelCalls++
    throw Object.assign(new Error('Could not confirm that the old run stopped.'), { status: 409 })
  }
  api.thesisPlan = async () => { planAfterUnconfirmedCancel++; return plan }
  useStore.setState({
    activeRuns: {
      stillWriting: { runId: 'stillWriting', ticker: 'INDIAMART', swarmId: 'research', kind: 'module', module: 'management-governance', status: 'running' },
    },
    nodeRuntime: { ...standingRuntime, [nodes[0].key]: { status: 'running', runId: 'stillWriting' } },
  })
  await useStore.getState().launchModule('management-governance', true)
  assert.equal(unconfirmedCancelCalls, 1)
  assert.equal(planAfterUnconfirmedCancel, 0, 'an unconfirmed stop cannot plan or post a replacement writer')
  assert.match(useStore.getState().toast?.msg ?? '', /could not confirm that the old run stopped/i)
  assert.equal(useStore.getState().launchPending, null)
  useStore.setState({
    activeRuns: {},
    globalActive: [],
    nodeRuntime: { ...standingRuntime },
    launchPending: null,
  })

  // Smart heading resume is a self-declared module capability. Other research module commands do not yet
  // honor the immutable run-root environment, so their headings retain the established direct module launch.
  let nonExactPlanCalls = 0
  let nonExactLaunchBody: any = null
  api.thesisPlan = async () => { nonExactPlanCalls++; return plan }
  api.launch = async (body: any) => { nonExactLaunchBody = body; return { runId: 'legacy_business_model' } as any }
  await useStore.getState().launchModule('business-model')
  assert.equal(nonExactPlanCalls, 0, 'a module without exact_resume never enters the exact smart-resume route')
  assert.deepEqual(nonExactLaunchBody, {
    selection: { subject: 'INDIAMART', swarm: 'research', selectToken: 2, provider: 'claude', legacyClaudeFallback: true },
    kind: 'module', ticker: 'INDIAMART', module: 'business-model', force: undefined, swarm: undefined,
  })
  useStore.setState({ activeRuns: {}, globalActive: [], nodeRuntime: { ...standingRuntime }, launchPending: null })

  // Old graph payloads omitted exactResume entirely. Missing capability is deploy skew, not consent to
  // fall through to the costly whole-module endpoint.
  const currentGraph = useStore.getState().graph!
  useStore.setState({
    graph: {
      ...currentGraph,
      modules: currentGraph.modules.map((entry) => entry.name === 'management-governance'
        ? { ...entry, exactResume: undefined }
        : entry),
    },
  })
  nonExactLaunchBody = null
  await useStore.getState().launchModule('management-governance')
  assert.equal(nonExactLaunchBody, null, 'missing exact capability never falls through to a whole-module launch')
  assert.match(useStore.getState().toast?.msg ?? '', /engine is still updating/i)
  useStore.setState({ graph: currentGraph })

  resumeArgs = null
  api.thesisPlan = async () => ({
    ...plan,
    modules: [{ ...plan.modules[0], staleReason: 'new source document', willRunAgents: 14 }],
  })
  await confirmGovernance()
  assert.equal(resumeArgs, null, 'a heading click never silently widens a gap-fill into a clean whole-module run')
  assert.match(useStore.getState().toast?.msg ?? '', /cannot safely reuse its filled orbs/i)

  const publicationFingerprint = 'a'.repeat(64)
  api.thesisPlan = async () => ({
    ...plan,
    run: [],
    modules: [{
      ...plan.modules[0],
      state: 'done',
      runnable: false,
      willRunAgents: 0,
      publicationPending: {
        targetRunRoot: plan.targetRunRoot,
        fingerprint: publicationFingerprint,
      },
    }],
  })
  resumeCalls = 0
  await confirmGovernance()
  assert.equal(publicationCalls, 1, 'a completed local module retries publication from the heading')
  assert.equal(resumeCalls, 0, 'publication recovery never launches another paid analysis')
  assert.deepEqual(publicationArgs, [
    'INDIAMART',
    'management-governance',
    'research',
    plan.targetRunRoot,
    publicationFingerprint,
  ], 'publication retry stays bound to the reviewed module bytes and run root')
  assert.match(useStore.getState().toast?.msg ?? '', /No analysis was rerun/i)

  api.thesisPlan = async () => ({ ...plan, complete: true, finalReportPath: 'analyses/INDIAMART_2026-08-21/final_thesis.md' })
  await confirmGovernance()
  assert.equal(resumeArgs, null, 'a same-day sealed call is never mutated from the module heading')
  assert.match(useStore.getState().toast?.msg ?? '', /call is sealed/i)

  api.thesisPlan = async () => ({ ...plan, moduleResumeVersion: undefined })
  await confirmGovernance()
  assert.equal(resumeArgs, null, 'rolling deploy skew fails closed instead of using an old whole-module path')
  assert.match(useStore.getState().toast?.msg ?? '', /engine is still updating/i)
  console.log('module run: heading resumes empty orbs through the plan endpoint and refreshes the synthesis')
} finally {
  api.thesisPlan = original.thesisPlan
  api.runThesisPlanModule = original.runThesisPlanModule
  api.publishThesisPlanModule = original.publishThesisPlanModule
  api.launch = original.launch
  api.estimate = original.estimate
  api.cancelSubject = original.cancelSubject
  Object.defineProperty(globalThis, 'EventSource', { configurable: true, writable: true, value: original.eventSource })
  useStore.setState({ setToast: original.setToast, launchConfirm: null, launchPending: null })
}
