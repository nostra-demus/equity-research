import assert from 'node:assert/strict'
import { CODEX_EXECUTION_PROFILE } from './provider'

;(globalThis as any).window = { __ENGINE_LIVE__: true }
const { api } = await import('./api')
const originalFetch = globalThis.fetch

try {
  let request: { url: string; method: string; body: any } | null = null
  globalThis.fetch = (async (input, init) => {
    request = {
      url: String(input),
      method: init?.method || 'GET',
      body: init?.body ? JSON.parse(String(init.body)) : null,
    }
    return new Response(JSON.stringify({
      runId: 'run-canary',
      preflight: {
        kind: 'full', ticker: 'AMZN', provider: 'codex', profileKey: CODEX_EXECUTION_PROFILE.key,
        model: CODEX_EXECUTION_PROFILE.parentModel, reasoningLevel: CODEX_EXECUTION_PROFILE.parentReasoning,
        executionProfile: CODEX_EXECUTION_PROFILE,
      },
    }), { status: 200, headers: { 'content-type': 'application/json' } })
  }) as typeof fetch

  const body = {
    provider: 'codex' as const,
    model: CODEX_EXECUTION_PROFILE.parentModel,
    reasoningLevel: CODEX_EXECUTION_PROFILE.parentReasoning,
    expectedProfileKey: CODEX_EXECUTION_PROFILE.key,
    runRoot: 'analyses/provider-parity/2026-08-23/codex/AMZN_2026-08-23',
    freezeReceipt: 'analyses/provider-parity/2026-08-23/freeze/AMZN_2026-08-23.json',
  }
  const response = await api.providerParityCanary(body)
  assert.equal(response.runId, 'run-canary')
  assert.deepEqual(request, { url: '/api/internal/provider-parity/canary', method: 'POST', body })
  console.log('parityCanaryApi.test.ts: authenticated same-origin canary contract passed')
} finally {
  globalThis.fetch = originalFetch
}
