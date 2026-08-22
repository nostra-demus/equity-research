import assert from 'node:assert/strict'
import type { LaunchableRunKind, LaunchPreflight, RunKind } from './types'
import type { FrozenProviderLaunch } from './provider'

// Compile-time proof: a newly added client RunKind cannot be absent from LaunchPreflight.kind.
type MissingPreflightKind = Exclude<RunKind, LaunchPreflight['kind']>
const preflightCoversEveryRunKind: MissingPreflightKind extends never ? true : false = true
assert.equal(preflightCoversEveryRunKind, true)

;(globalThis as any).window = { __ENGINE_LIVE__: true }
const { api } = await import('./api')
const originalFetch = globalThis.fetch

try {
  const selection: FrozenProviderLaunch = { provider: 'codex', expectedProfileKey: 'codex|gpt-5.6-sol:max|gpt-5.6-terra:xhigh', model: 'gpt-5.6-sol', reasoningLevel: 'max', executionProfile: { key: 'codex|gpt-5.6-sol:max|gpt-5.6-terra:xhigh', parentModel: 'gpt-5.6-sol', parentReasoning: 'max', specialistModel: 'gpt-5.6-terra', specialistReasoning: 'xhigh' } }
  const requests: { url: string; method: string; body: any }[] = []
  globalThis.fetch = (async (input, init) => {
    const url = new URL(String(input), 'https://fixture.test')
    const method = init?.method || 'GET'
    const body = init?.body ? JSON.parse(String(init.body)) : null
    requests.push({ url: url.toString(), method, body })
    const kind = (method === 'GET' ? url.searchParams.get('kind') : body?.kind) as RunKind
    const preflight: LaunchPreflight = {
      kind,
      ticker: 'ZZZ',
      agentCount: 0,
      estCostUsdRange: [0, 0],
      estMinutesRange: [0, 0],
      willCommitToMain: true,
      estCommits: 1,
      requiresTypedConfirm: false,
      creditPreflight: { ok: true, checked: true },
      provider: 'codex',
      profileKey: selection.expectedProfileKey,
      model: selection.model,
      reasoningLevel: selection.reasoningLevel,
      executionProfile: selection.executionProfile,
    }
    return new Response(JSON.stringify(method === 'GET' ? preflight : { runId: `run-${kind}`, preflight }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    })
  }) as typeof fetch

  const formerlyOmittedKinds = ['review', 'track', 'doc-intake'] as const satisfies readonly LaunchableRunKind[]
  for (const kind of formerlyOmittedKinds) {
    const estimate = await api.estimate(kind, 'ZZZ', selection)
    assert.equal(estimate.kind, kind)
    const launched = await api.launch({ selection, kind, ticker: 'ZZZ' })
    assert.equal(launched.preflight.kind, kind)
  }
  assert.deepEqual(requests.map(({ method, url, body }) => ({
    method,
    kind: method === 'GET' ? new URL(url).searchParams.get('kind') : body.kind,
    provider: method === 'GET' ? new URL(url).searchParams.get('provider') : body.provider,
  })), [
    { method: 'GET', kind: 'review', provider: 'codex' },
    { method: 'POST', kind: 'review', provider: 'codex' },
    { method: 'GET', kind: 'track', provider: 'codex' },
    { method: 'POST', kind: 'track', provider: 'codex' },
    { method: 'GET', kind: 'doc-intake', provider: 'codex' },
    { method: 'POST', kind: 'doc-intake', provider: 'codex' },
  ])
  console.log('launchKinds.test.ts: LaunchPreflight and API cover every client RunKind')
} finally {
  globalThis.fetch = originalFetch
}
