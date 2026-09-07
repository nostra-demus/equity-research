import assert from 'node:assert/strict'

const previousWindow = (globalThis as any).window
const previousDocument = (globalThis as any).document
;(globalThis as any).window = {
  __ENGINE_LIVE__: true, WebGLRenderingContext: undefined, addEventListener: () => {},
  matchMedia: () => ({ matches: true }),
}
;(globalThis as any).document = {
  hidden: false, addEventListener: () => {}, createElement: () => ({ getContext: () => null }),
}

const { useStore } = await import('./store')
const { CODEX_EXECUTION_PROFILE } = await import('./provider')
const initial = useStore.getState()

try {
  for (const swarm of ['research', 'screener'] as const) {
    for (const provider of ['claude', 'codex'] as const) {
      const runId = `identity-publications-${swarm}-${provider}`
      const ticker = swarm === 'research' ? 'AAA' : `SIG-IDENTITY-${provider}`
      const profile = provider === 'codex' ? CODEX_EXECUTION_PROFILE
        : { key: 'claude:opus:default', parentModel: 'opus', parentReasoning: 'default' }
      const identity = {
        runId, ticker, swarmId: swarm, kind: 'module' as const, status: 'running' as const,
        provider, executionProfile: profile, profileKey: profile.key,
        model: profile.parentModel, reasoningLevel: profile.parentReasoning,
      }
      const activeRuns = { [runId]: identity }
      useStore.setState({
        selectedTicker: ticker, activeSwarm: swarm, scSelectedSignal: ticker,
        activeRuns, nodeRuntime: {}, scRuntime: {}, runStream: [],
      })
      let publications = 0
      let identityPublications = 0
      const unsubscribe = useStore.subscribe((next, prior) => {
        publications++
        if (next.activeRuns !== prior.activeRuns) identityPublications++
      })
      try {
        const handle = swarm === 'research' ? useStore.getState()._handleEvent : useStore.getState()._handleScreenerEvent
        const event = { runId, agentKey: 'module/orb', name: 'Orb', module: 'module', layer: 1, ts: 1000 }
        handle({ type: 'agent-started', ...event })
        handle({
          type: 'agent-done', ...event, ts: 2000, verdict: 'Saved', outputPath: 'module/orb.md', bytes: 1,
          provider, executionProfile: JSON.parse(JSON.stringify(profile)),
          profileKey: profile.key, model: profile.parentModel, reasoningLevel: profile.parentReasoning,
        })
        assert.equal(publications, 2, 'each orb event publishes its projection once, without a redundant identity update')
        assert.equal(identityPublications, 0, 'unchanged identity must not notify active-run subscribers')
        assert.equal(useStore.getState().activeRuns, activeRuns)
        assert.equal(useStore.getState().runStream[0].status, 'done')
        const runtime = swarm === 'research' ? useStore.getState().nodeRuntime : useStore.getState().scRuntime
        assert.equal(runtime[event.agentKey].endedAt, 2000)

        handle({ type: 'agent-started', ...event, agentKey: 'module/later', chainId: 'late-chain', executionEpoch: 'late-epoch' })
        assert.equal(identityPublications, 1, 'new protected identity is published before the orb projection')
        assert.equal(publications, 4)
        assert.equal(useStore.getState().activeRuns[runId].chainId, 'late-chain')
        assert.equal(useStore.getState().activeRuns[runId].executionEpoch, 'late-epoch')

        const beforeRejected = useStore.getState()
        for (const contradiction of [
          { ticker: 'FOREIGN' }, { swarmId: swarm === 'research' ? 'screener' : 'research' },
          { chainId: 'foreign-chain' }, { executionEpoch: 'foreign-epoch' },
          { provider: provider === 'claude' ? 'codex' : 'claude' }, { model: 'foreign-model' },
        ]) {
          handle({ type: 'agent-started', ...event, ...contradiction } as any)
          assert.equal(useStore.getState(), beforeRejected, 'contradictory identity rejects the entire event before publication')
        }
        assert.equal(publications, 4)
      } finally { unsubscribe() }
    }
  }
  console.log('run identity store: unchanged events publish once; late identity enriches; contradictions never publish')
} finally {
  useStore.setState(initial)
  ;(globalThis as any).window = previousWindow
  ;(globalThis as any).document = previousDocument
}
