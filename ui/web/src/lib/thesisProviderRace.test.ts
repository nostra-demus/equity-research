import assert from 'node:assert/strict'

const previousWindow = (globalThis as any).window
const previousDocument = (globalThis as any).document
const previousStorage = (globalThis as any).localStorage

;(globalThis as any).window = { __ENGINE_LIVE__: true, WebGLRenderingContext: undefined, addEventListener: () => {}, matchMedia: () => ({ matches: true }) }
;(globalThis as any).document = { hidden: false, addEventListener: () => {}, createElement: () => ({ getContext: () => null }) }
;(globalThis as any).localStorage = { getItem: () => null, setItem: () => {} }

const { api } = await import('./api')
const { useStore } = await import('./store')
const originalThesisPlan = api.thesisPlan
const profile = (provider: 'claude' | 'codex') => provider === 'claude'
  ? { key: 'claude:opus:default', parentModel: 'opus', parentReasoning: 'default' }
  : { key: 'codex|gpt-5.6-sol:max|gpt-5.6-terra:xhigh', parentModel: 'gpt-5.6-sol', parentReasoning: 'max', specialistModel: 'gpt-5.6-terra', specialistReasoning: 'xhigh' }
const option = (provider: 'claude' | 'codex') => {
  const executionProfile = profile(provider)
  return {
    key: executionProfile.key,
    label: provider === 'claude' ? 'Opus' : 'Sol + Terra',
    description: provider === 'claude' ? 'Highest quality' : 'Balanced',
    model: executionProfile.parentModel,
    reasoningLevel: executionProfile.parentReasoning,
    executionProfile,
  }
}

const deferred = <T>() => {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((done) => { resolve = done })
  return { promise, resolve }
}
const plan = (provider: 'claude' | 'codex') => {
  const executionProfile = profile(provider)
  const receipt = { provider, profileKey: executionProfile.key, model: executionProfile.parentModel, reasoningLevel: executionProfile.parentReasoning, executionProfile }
  return ({
  swarm: 'research', subject: 'AAA', targetRunRoot: 'analyses/AAA_2026-08-21', complete: false,
  finalReportPath: null, modules: [], reusable: [], mustReuse: [], reuse: [], run: [], carry: [],
  master: { state: 'ready', blockedBy: [] }, dataPool: { files: 1, newestDate: '2026-08-21' },
  preflight: receipt, fullPreflight: receipt, canCarry: true,
  }) as any
}

try {
  const claude = deferred<any>()
  const codex = deferred<any>()
  api.thesisPlan = async (_ticker, selection) => selection.provider === 'claude' ? claude.promise : codex.promise
  useStore.setState({
    staticMode: false, health: 'online', selectedTicker: 'AAA', selectToken: 77,
    activeSwarm: 'research', constellationSwarm: 'research', runProvider: 'claude',
    runProfileKeys: { claude: profile('claude').key, codex: profile('codex').key },
    thesisPlanOpen: false, thesisPlan: null, intake: null,
    providers: {
      claude: { provider: 'claude', enabled: true, available: true, checked: true, status: 'available', profile: profile('claude'), defaultProfileKey: profile('claude').key, profiles: [option('claude')] },
      codex: { provider: 'codex', enabled: true, available: true, checked: true, status: 'available', profile: profile('codex'), defaultProfileKey: profile('codex').key, profiles: [option('codex')] },
      catalogState: 'valid',
    },
  })

  const first = useStore.getState().openThesisPlan()
  useStore.getState().setRunProvider('codex')
  const second = useStore.getState().openThesisPlan()
  codex.resolve(plan('codex'))
  await second
  assert.equal(useStore.getState().thesisPlan?.preflight.provider, 'codex')
  claude.resolve(plan('claude'))
  await first
  assert.equal(useStore.getState().thesisPlan?.preflight.provider, 'codex', 'a late price for the old provider cannot overwrite the selected provider plan')

  api.thesisPlan = async () => plan('claude')
  useStore.setState({ thesisPlan: null, thesisPlanError: null, runProvider: 'codex' })
  await useStore.getState().openThesisPlan()
  assert.equal(useStore.getState().thesisPlan, null, 'a mismatched estimate receipt is never rendered as the selected provider price')
  assert.match(useStore.getState().thesisPlanError || '', /did not confirm/i)

  console.log('thesis provider pricing: provider generation and receipt guards passed')
} finally {
  api.thesisPlan = originalThesisPlan
  ;(globalThis as any).window = previousWindow
  ;(globalThis as any).document = previousDocument
  ;(globalThis as any).localStorage = previousStorage
}
