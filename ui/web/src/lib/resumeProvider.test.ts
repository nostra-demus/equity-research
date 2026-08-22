import assert from 'node:assert/strict'

const previousWindow = (globalThis as any).window
const previousDocument = (globalThis as any).document
const previousStorage = (globalThis as any).localStorage
const confirmations: string[] = []

;(globalThis as any).window = {
  __ENGINE_LIVE__: true,
  WebGLRenderingContext: undefined,
  addEventListener: () => {},
  matchMedia: () => ({ matches: true }),
  confirm: (message: string) => { confirmations.push(message); return false },
}
;(globalThis as any).document = { hidden: false, addEventListener: () => {}, createElement: () => ({ getContext: () => null }) }
;(globalThis as any).localStorage = { getItem: () => null, setItem: () => {} }

const { api } = await import('./api')
const { CODEX_EXECUTION_PROFILE } = await import('./provider')
const { useStore } = await import('./store')

const claudeProfile = { key: 'claude:opus:default', parentModel: 'opus', parentReasoning: 'default' }
const providers = {
  claude: { provider: 'claude' as const, enabled: true, available: true, checked: true, status: 'available', profile: claudeProfile },
  codex: { provider: 'codex' as const, enabled: true, available: true, checked: true, status: 'available', profile: CODEX_EXECUTION_PROFILE },
  catalogState: 'valid' as const,
}
const originalLaunchSignal = api.launchSignal

try {
  let launches = 0
  api.launchSignal = async () => { launches++; throw new Error('fixture stop') }
  useStore.setState({
    staticMode: false, health: 'online', activeSwarm: 'screener', runProvider: 'codex', providers,
    scBoard: {
      generated_at: null, inbox: [], signals: [], theses: [], handoffs: [], counts: {},
      resumable: [{ sigId: 'SIG-CONFLICT', headline: 'conflict', doneCount: 1, totalCount: 2, provider: 'codex', executionProfile: CODEX_EXECUTION_PROFILE }],
    },
    resumableRuns: [{
      swarm: 'screener', subject: 'SIG-CONFLICT', runRoot: 'screener/runs/SIG-CONFLICT', kind: 'signal',
      doneCount: 1, totalCount: 2, unit: 'module', provider: 'claude', executionProfile: claudeProfile,
    }],
  })
  await useStore.getState().continueSignal('SIG-CONFLICT')
  assert.equal(launches, 0)
  assert.match(confirmations.pop() || '', /records.*disagree|mixed or partially observed/i,
    'manual signal resume explicitly confirms board-vs-disk provider/profile conflict')

  useStore.setState({
    scBoard: {
      generated_at: null, inbox: [], signals: [], theses: [], handoffs: [], counts: {},
      resumable: [{ sigId: 'SIG-UNKNOWN', headline: 'unknown', doneCount: 1, totalCount: 2, provider: 'codex' }],
    },
    resumableRuns: [{
      swarm: 'screener', subject: 'SIG-UNKNOWN', runRoot: 'screener/runs/SIG-UNKNOWN', kind: 'signal',
      doneCount: 1, totalCount: 2, unit: 'module', provider: 'codex', executionProfile: CODEX_EXECUTION_PROFILE,
    }],
  })
  await useStore.getState().continueSignal('SIG-UNKNOWN')
  assert.equal(launches, 0)
  assert.match(confirmations.pop() || '', /original exact provider\/profile is unknown/i,
    'manual signal resume explicitly confirms a missing board profile')

  console.log('resumeProvider.test.ts: manual exact-profile conflict and unknown confirmations passed')
} finally {
  api.launchSignal = originalLaunchSignal
  ;(globalThis as any).window = previousWindow
  ;(globalThis as any).document = previousDocument
  ;(globalThis as any).localStorage = previousStorage
}
