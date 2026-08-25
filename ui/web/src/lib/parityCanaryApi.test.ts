import assert from 'node:assert/strict'
import { CODEX_EXECUTION_PROFILE } from './provider'
import { providerParityCanaryRunRootIsValid, providerParityCanarySubject } from './parityCanary'

;(globalThis as any).window = { __ENGINE_LIVE__: true }
const { api } = await import('./api')
const originalFetch = globalThis.fetch

try {
  const retryRoot = 'analyses/provider-parity/2026-08-25/codex/AMZN_2026-08-25__attempt-a3182d01'
  assert.equal(providerParityCanaryRunRootIsValid(retryRoot), true)
  assert.equal(providerParityCanarySubject(retryRoot), 'AMZN')
  assert.equal(providerParityCanaryRunRootIsValid(`${retryRoot}__attempt-2`), false)
  assert.equal(providerParityCanarySubject(`${retryRoot}__attempt-2`), null)

  const requests: Array<{ url: string; method: string; body: any }> = []
  globalThis.fetch = (async (input, init) => {
    const request = {
      url: String(input),
      method: init?.method || 'GET',
      body: init?.body ? JSON.parse(String(init.body)) : null,
    }
    requests.push(request)
    const payload = request.url.startsWith('/api/internal/provider-parity/canary-status?') ? {
      runRoot: 'analyses/provider-parity/2026-08-23/codex/AMZN_2026-08-23', runId: 'run-canary',
      status: 'error', startedAt: 1, endedAt: 2, provider: 'codex', profileKey: CODEX_EXECUTION_PROFILE.key,
      message: 'terminal failure', failureNote: '# Run failed', interruption: null, artifacts: {},
    } : {
      runId: 'run-canary',
      preflight: {
        kind: 'full', ticker: 'AMZN', provider: 'codex', profileKey: CODEX_EXECUTION_PROFILE.key,
        model: CODEX_EXECUTION_PROFILE.parentModel, reasoningLevel: CODEX_EXECUTION_PROFILE.parentReasoning,
        executionProfile: CODEX_EXECUTION_PROFILE,
      },
    }
    return new Response(JSON.stringify(payload), { status: 200, headers: { 'content-type': 'application/json' } })
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
  const status = await api.providerParityCanaryStatus(body.runRoot)
  assert.equal(status.status, 'error')
  assert.deepEqual(requests, [
    { url: '/api/internal/provider-parity/canary', method: 'POST', body },
    { url: `/api/internal/provider-parity/canary-status?runRoot=${encodeURIComponent(body.runRoot)}`, method: 'GET', body: null },
  ])
  console.log('parityCanaryApi.test.ts: authenticated same-origin launch + status contracts passed')
} finally {
  globalThis.fetch = originalFetch
}
