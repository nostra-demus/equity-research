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

try {
  let runLaunches = 0
  let runSelection: any = null
  api.launch = (async (body: any) => {
    runLaunches++
    runSelection = body.selection
    throw new Error('fixture stop after request capture')
  }) as typeof api.launch

  useStore.setState({
    staticMode: false, health: 'online', activeSwarm: 'research', runProvider: 'claude', providers,
    runProfileKeys: { claude: opusProfile.key, codex: CODEX_EXECUTION_PROFILE.key },
    resumeConfirm: null, launchPending: null,
  })
  const partialRun = {
    swarm: 'research', subject: 'KAR', runRoot: 'analyses/KAR_partial', kind: 'full' as const,
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

  useStore.getState().changeResumeProfile(sonnetProfile.key)
  dialog = useStore.getState().resumeConfirm
  assert.equal(dialog?.selection.expectedProfileKey, sonnetProfile.key)
  assert.equal(resumeExecutionDisposition(dialog!.records, dialog!.selection).disposition, 'exact')
  await useStore.getState().confirmResume()
  assert.equal(runLaunches, 1)
  assert.equal(runSelection.expectedProfileKey, sonnetProfile.key, 'confirm submits the exact model shown in the chooser')

  useStore.setState({ resumeConfirm: null, launchPending: null, runProvider: 'claude', runProfileKeys: { claude: opusProfile.key, codex: CODEX_EXECUTION_PROFILE.key } })
  await useStore.getState().resumeRun(partialRun)
  await useStore.getState().changeResumeProvider('codex')
  dialog = useStore.getState().resumeConfirm
  assert.equal(dialog?.selection.provider, 'codex')
  assert.equal(resumeExecutionDisposition(dialog!.records, dialog!.selection).disposition, 'provider-change')
  useStore.getState().cancelResume()
  assert.equal(useStore.getState().resumeConfirm, null)
  assert.equal(runLaunches, 1, 'cancel never submits a request')

  // A disabled command-bar provider cannot dead-end Resume: the dialog seeds the other verified provider.
  useStore.setState({
    runProvider: 'codex', resumeConfirm: null,
    providers: { ...providers, codex: { ...providers.codex, enabled: false, available: false, status: 'unavailable', reason: 'disabled' } },
  })
  await useStore.getState().resumeRun({ ...partialRun, provider: 'codex', executionProfile: CODEX_EXECUTION_PROFILE })
  assert.equal(useStore.getState().resumeConfirm?.selection.provider, 'claude')
  useStore.getState().cancelResume()

  let signalLaunches = 0
  let signalSelection: any = null
  api.launchSignal = (async (selection: any) => {
    signalLaunches++
    signalSelection = selection
    throw new Error('fixture stop after request capture')
  }) as typeof api.launchSignal
  useStore.setState({
    activeSwarm: 'screener', runProvider: 'codex', providers,
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
  ;(globalThis as any).window = previousWindow
  ;(globalThis as any).document = previousDocument
  ;(globalThis as any).localStorage = previousStorage
}
