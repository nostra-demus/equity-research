import assert from 'node:assert/strict'

const previousWindow = (globalThis as any).window
const previousDocument = (globalThis as any).document
const previousStorage = (globalThis as any).localStorage
let nativeConfirms = 0

;(globalThis as any).window = {
  __ENGINE_LIVE__: true,
  WebGLRenderingContext: undefined,
  addEventListener: () => {},
  matchMedia: () => ({ matches: true }),
  confirm: () => { nativeConfirms++; return true },
}
;(globalThis as any).document = { hidden: false, addEventListener: () => {}, createElement: () => ({ getContext: () => null }) }
;(globalThis as any).localStorage = { getItem: () => null, setItem: () => {} }

const { api } = await import('./api')
const { CODEX_EXECUTION_PROFILE, manualResumeConfirmation, resumeExecutionDisposition } = await import('./provider')
const { useStore } = await import('./store')

const opusProfile = { key: 'claude:opus:default', parentModel: 'opus', parentReasoning: 'default' }
const sonnetProfile = { key: 'claude:sonnet:default', parentModel: 'sonnet', parentReasoning: 'default' }
const option = (provider: 'claude' | 'codex', executionProfile: typeof opusProfile | typeof CODEX_EXECUTION_PROFILE) => ({
  key: executionProfile.key,
  label: provider === 'claude' ? (executionProfile.parentModel === 'opus' ? 'Opus' : 'Sonnet') : 'Sol + Terra',
  description: provider === 'claude' ? 'Claude subscription model' : 'Codex subscription model',
  model: executionProfile.parentModel,
  reasoningLevel: executionProfile.parentReasoning,
  executionProfile,
})
const providers = {
  claude: {
    provider: 'claude' as const, enabled: true, available: true, checked: true, status: 'available',
    profile: opusProfile, defaultProfileKey: opusProfile.key,
    profiles: [option('claude', opusProfile), option('claude', sonnetProfile)],
  },
  codex: {
    provider: 'codex' as const, enabled: true, available: true, checked: true, status: 'available',
    profile: CODEX_EXECUTION_PROFILE, defaultProfileKey: CODEX_EXECUTION_PROFILE.key,
    profiles: [option('codex', CODEX_EXECUTION_PROFILE)],
  },
  catalogState: 'valid' as const,
}

const originalLaunch = api.launch
const originalLaunchSignal = api.launchSignal
const originalThesisPlan = api.thesisPlan
const originalRunThesisPlan = api.runThesisPlan
const originalRunThesisPlanModule = api.runThesisPlanModule
const originalPendingAdmissions = api.pendingAdmissions

try {
  let runLaunches = 0
  let runSelection: any = null
  let completionLaunches = 0
  let completionSourceRoot: string | undefined
  let plannedFingerprint = `sha256:${'a'.repeat(64)}`
  let planReads = 0
  let submittedReceipt: any = null
  let legacyMigration = false
  api.launch = (async (body: any) => {
    runLaunches++
    runSelection = body.selection
    throw new Error('fixture stop after request capture')
  }) as typeof api.launch
  api.thesisPlan = (async (_ticker: string, _selection: any, _swarm?: string, _reuse?: string[], module?: string, runRoot?: string) => {
    planReads++
    const targetRunRoot = legacyMigration ? 'analyses/KAR_2026-08-31' : runRoot!
    return {
    moduleResumeVersion: 2, swarm: 'research', subject: 'KAR', targetRunRoot, complete: false,
    continuationReceipt: {
      version: 2, action: legacyMigration ? 'complete' : 'continue', swarm: 'research', subject: 'KAR', sourceRunRoots: [runRoot!],
      targetRunRoot, provider: { id: 'claude', model: 'sonnet', reasoningLevel: 'default', profileKey: sonnetProfile.key },
      reusableOrbKeys: [], payableOrbKeys: ['master/synthesizer'],
      dataPool: { files: 1, newestMs: 0, sha256: `sha256:${'c'.repeat(64)}` },
      evidenceGenerationDigest: 'd'.repeat(64), reusableArtifacts: [],
      reusableArtifactsSha256: `sha256:${'e'.repeat(64)}`,
      verifiedLineageSha256: `sha256:${'f'.repeat(64)}`,
      sourceArtifactsSha256: `sha256:${'b'.repeat(64)}`,
      fingerprint: plannedFingerprint,
    },
    exactModuleScope: module ? { module, savedInputs: ['business-model'] } : undefined,
    finalReportPath: null, modules: module ? [{
      module, state: 'partial', sourceRunRoot: runRoot, sourceDate: '2026-08-27', inTargetRoot: true,
      doneAgents: 1, totalAgents: 2, blockedBy: [], runnable: true, willRunAgents: 1,
      doneOrbKeys: [`${module}/01_done`], synthesisNeedsRefresh: true,
    }] : [], reusable: ['business-model'], mustReuse: ['business-model'],
    reuse: ['business-model'], run: ['earnings'], carry: [], master: { state: 'blocked', blockedBy: ['earnings'] },
    dataPool: { files: 1, newestDate: null, newestMs: 0 }, preflight: {} as any, fullPreflight: {} as any,
    canCarry: true,
  }} ) as typeof api.thesisPlan
  api.runThesisPlan = (async (
    _ticker: string, _reuse: string[], _swarm: string, selection: any,
    _requestId: string, receipt: any, sourceRunRoot?: string,
  ) => {
    completionLaunches++
    runSelection = selection
    completionSourceRoot = sourceRunRoot
    submittedReceipt = receipt
    throw Object.assign(new Error('The reviewed continuation plan changed. Nothing was started.'), {
      body: { code: 'plan_changed' }, statusCode: 409,
    })
  }) as typeof api.runThesisPlan

  useStore.setState({
    staticMode: false, health: 'online', activeSwarm: 'research', runProvider: 'claude', providers,
    runProfileKeys: { claude: opusProfile.key, codex: CODEX_EXECUTION_PROFILE.key },
    resumeConfirm: null, launchPending: null,
  })
  const partialRun = {
    swarm: 'research', subject: 'KAR', runRoot: 'analyses/KAR_2026-08-27', kind: 'full' as const,
    doneCount: 4, totalCount: 7, unit: 'module' as const,
    provider: 'claude' as const, executionProfile: sonnetProfile,
  }

  await useStore.getState().resumeRun(partialRun)
  let dialog = useStore.getState().resumeConfirm
  assert.equal(runLaunches, 0, 'opening Resume never submits a request')
  assert.equal(dialog?.kind, 'run')
  assert.equal(dialog?.selection.expectedProfileKey, opusProfile.key, 'the chooser starts on the current reviewed profile')
  assert.equal(resumeExecutionDisposition(dialog!.records, dialog!.selection).disposition, 'profile-drift')
  assert.match(manualResumeConfirmation(dialog!.records, dialog!.selection) || '', /mixed-profile/i)

  await useStore.getState().changeResumeProfile(sonnetProfile.key)
  dialog = useStore.getState().resumeConfirm
  assert.equal(dialog?.selection.expectedProfileKey, sonnetProfile.key)
  assert.equal(resumeExecutionDisposition(dialog!.records, dialog!.selection).disposition, 'exact')
  const reviewedFullReceipt = dialog?.kind === 'run' ? dialog.reviewedPlan?.continuationReceipt : undefined
  const planReadsAtFullConsent = planReads
  plannedFingerprint = `sha256:${'9'.repeat(64)}` // saved artifact changed after the modal opened
  await useStore.getState().confirmResume()
  assert.equal(runLaunches, 0, 'research Continue never uses generic /api/launch')
  assert.equal(completionLaunches, 1)
  assert.equal(completionSourceRoot, partialRun.runRoot, 'the selected saved root reaches the plan-run POST')
  assert.equal(runSelection.expectedProfileKey, sonnetProfile.key, 'confirm submits the exact model shown in the chooser')
  assert.equal(planReads, planReadsAtFullConsent,
    'full Continue confirm never re-fetches and silently widens the payable plan shown in the modal')
  assert.equal(submittedReceipt, reviewedFullReceipt,
    'full Continue submits the exact reviewed receipt; server-side drift returns 409 before writes/spend')

  // A run created before frozen-generation receipts gets one safe migration plan: same selected source,
  // finished modules reused in a new protected root, and never a generic Full request.
  legacyMigration = true
  useStore.setState({ resumeConfirm: null, launchPending: null })
  await useStore.getState().resumeRun(partialRun)
  dialog = useStore.getState().resumeConfirm
  assert.equal(dialog?.kind, 'run')
  assert.equal(dialog?.kind === 'run' ? dialog.reviewedPlan?.continuationReceipt?.action : undefined, 'complete')
  await useStore.getState().confirmResume()
  assert.equal(runLaunches, 0, 'legacy migration never uses generic /api/launch')
  assert.equal(completionLaunches, 2)
  assert.equal(completionSourceRoot, partialRun.runRoot, 'legacy migration stays bound to the selected saved root')
  assert.equal(submittedReceipt?.action, 'complete')
  legacyMigration = false

  let moduleLaunches = 0
  let submittedModuleReceipt: any = null
  api.runThesisPlanModule = (async (
    _ticker: string, _module: string, _reuse: string[], _swarm: string, _willRun: number,
    _done: string[], _target: string, _files: number, _newest: number, _selection: any,
    _sourceRoot?: string, _requestId?: string, receipt?: any,
  ) => {
    moduleLaunches++
    submittedModuleReceipt = receipt
    throw Object.assign(new Error('The reviewed continuation plan changed. Nothing was started.'), {
      body: { code: 'plan_changed' }, statusCode: 409,
    })
  }) as typeof api.runThesisPlanModule
  plannedFingerprint = `sha256:${'6'.repeat(64)}`
  const partialModule = {
    ...partialRun, kind: 'module' as const, module: 'earnings', doneCount: 1, totalCount: 2,
    unit: 'agent' as const,
  }
  useStore.setState({ resumeConfirm: null, launchPending: null })
  await useStore.getState().resumeRun(partialModule)
  dialog = useStore.getState().resumeConfirm
  const reviewedModuleReceipt = dialog?.kind === 'run' ? dialog.reviewedPlan?.continuationReceipt : undefined
  const planReadsAtModuleConsent = planReads
  plannedFingerprint = `sha256:${'7'.repeat(64)}` // one saved module artifact changed after consent
  await useStore.getState().confirmResume()
  assert.equal(moduleLaunches, 1)
  assert.equal(planReads, planReadsAtModuleConsent,
    'module Continue confirm never re-fetches and silently widens its exact remaining-orb scope')
  assert.equal(submittedModuleReceipt, reviewedModuleReceipt,
    'module Continue submits the exact reviewed receipt; server-side drift returns 409 before writes/spend')

  useStore.setState({ resumeConfirm: null, launchPending: null, runProvider: 'claude', runProfileKeys: { claude: opusProfile.key, codex: CODEX_EXECUTION_PROFILE.key } })
  await useStore.getState().resumeRun(partialRun)
  await useStore.getState().changeResumeProvider('codex')
  dialog = useStore.getState().resumeConfirm
  assert.equal(dialog?.selection.provider, 'codex')
  assert.equal(resumeExecutionDisposition(dialog!.records, dialog!.selection).disposition, 'provider-change')
  useStore.getState().cancelResume()
  assert.equal(useStore.getState().resumeConfirm, null)
  assert.equal(runLaunches, 0, 'cancel never submits a generic request')
  assert.equal(completionLaunches, 2, 'cancel never submits a completion request')

  // A disabled command-bar provider cannot dead-end Resume: the dialog seeds the other verified provider.
  useStore.setState({
    runProvider: 'codex', resumeConfirm: null,
    providers: { ...providers, codex: { ...providers.codex, enabled: false, available: false, status: 'unavailable', reason: 'disabled' } },
  })
  await useStore.getState().resumeRun({ ...partialRun, provider: 'codex', executionProfile: CODEX_EXECUTION_PROFILE })
  assert.equal(useStore.getState().resumeConfirm?.selection.provider, 'claude')
  useStore.getState().cancelResume()

  // A reviewed update turns the exact Continue into one durable waiting admission. It does not create
  // a fake active run, lose the selected historical root, or fall through to generic Full.
  let queuedRequestId = ''
  api.runThesisPlan = (async (
    ticker: string, _reuse: string[], _swarm: string, selection: any,
    requestId: string, _receipt: any, sourceRunRoot?: string,
  ) => {
    queuedRequestId = requestId
    completionSourceRoot = sourceRunRoot
    return {
      queued: true, requestId, status: 'waiting_for_update', ticker, action: 'continue',
      sourceRunRoot, provider: selection.provider, expectedProfileKey: selection.expectedProfileKey,
    } as any
  }) as typeof api.runThesisPlan
  api.pendingAdmissions = (async () => ({ requests: [{
    requestId: queuedRequestId,
    user: 'local',
    userVia: 'local',
    ticker: 'KAR',
    action: 'continue',
    sourceRunRoot: partialRun.runRoot,
    provider: 'claude',
    model: 'opus',
    reasoningLevel: 'default',
    expectedProfileKey: opusProfile.key,
    status: 'waiting_for_update',
    createdAt: '2026-08-29T00:00:00.000Z',
    updatedAt: '2026-08-29T00:00:00.000Z',
  }] })) as typeof api.pendingAdmissions
  useStore.setState({
    health: 'updating', providers, runProvider: 'claude',
    runProfileKeys: { claude: opusProfile.key, codex: CODEX_EXECUTION_PROFILE.key },
    resumeConfirm: null, launchPending: null, pendingAdmissions: [], activeRuns: {}, activityOpen: false,
  })
  await useStore.getState().resumeRun(partialRun)
  await useStore.getState().confirmResume()
  assert.ok(queuedRequestId, 'the queued Continue carries one idempotency key')
  assert.equal(completionSourceRoot, partialRun.runRoot, 'queued Continue retains the exact saved root')
  assert.equal(runLaunches, 0, 'queued Continue never widens into generic Full')
  assert.deepEqual(Object.keys(useStore.getState().activeRuns), [], 'waiting admission is not presented as an active run')
  assert.equal(useStore.getState().pendingAdmissions[0]?.requestId, queuedRequestId)
  assert.equal(useStore.getState().pendingAdmissions[0]?.status, 'waiting_for_update')
  assert.equal(useStore.getState().activityOpen, true, 'Activity opens on the truthful waiting request')

  let signalLaunches = 0
  let signalSelection: any = null
  api.launchSignal = (async (selection: any) => {
    signalLaunches++
    signalSelection = selection
    throw new Error('fixture stop after request capture')
  }) as typeof api.launchSignal
  useStore.setState({
    health: 'online', activeSwarm: 'screener', runProvider: 'codex', providers,
    runProfileKeys: { claude: opusProfile.key, codex: CODEX_EXECUTION_PROFILE.key },
    resumeConfirm: null, launchPending: null, scSelectedSignal: 'SIG-CONFLICT',
    scRuntime: { finished: { status: 'done' } }, scNodesByKey: new Map(),
    scBoard: {
      generated_at: null, inbox: [], signals: [], theses: [], handoffs: [], counts: {},
      resumable: [{ sigId: 'SIG-CONFLICT', headline: 'conflict', doneCount: 1, totalCount: 2, provider: 'codex', executionProfile: CODEX_EXECUTION_PROFILE }],
    },
    resumableRuns: [{
      swarm: 'screener', subject: 'SIG-CONFLICT', runRoot: 'screener/runs/SIG-CONFLICT', kind: 'signal',
      doneCount: 1, totalCount: 2, unit: 'module', provider: 'claude', executionProfile: opusProfile,
    }],
  })
  await useStore.getState().continueSignal('SIG-CONFLICT')
  dialog = useStore.getState().resumeConfirm
  assert.equal(signalLaunches, 0)
  assert.equal(dialog?.kind, 'signal')
  assert.equal(resumeExecutionDisposition(dialog!.records, dialog!.selection).disposition, 'conflict')
  assert.match(manualResumeConfirmation(dialog!.records, dialog!.selection) || '', /records.*disagree|mixed or partially observed/i)
  await useStore.getState().confirmResume()
  assert.equal(signalLaunches, 1)
  assert.equal(signalSelection.provider, 'codex')

  assert.equal(nativeConfirms, 0, 'manual resumes use the in-product chooser, never a native yes/no prompt')
  console.log('resumeProvider.test.ts: universal resume chooser, exact selection, cancel, fallback, and conflict paths passed')
} finally {
  api.launch = originalLaunch
  api.launchSignal = originalLaunchSignal
  api.thesisPlan = originalThesisPlan
  api.runThesisPlan = originalRunThesisPlan
  api.runThesisPlanModule = originalRunThesisPlanModule
  api.pendingAdmissions = originalPendingAdmissions
  ;(globalThis as any).window = previousWindow
  ;(globalThis as any).document = previousDocument
  ;(globalThis as any).localStorage = previousStorage
}
