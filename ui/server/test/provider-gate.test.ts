// Fail-closed rollout gate for the Codex subscription runtime.
// Run: npx tsx test/provider-gate.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import { assertProviderAvailable } from '../src/launcher'
import { isProviderEnabled } from '../src/providers/registry'

const previous = process.env.ENGINE_CODEX_ENABLED
try {
  assert.equal(isProviderEnabled('claude', {}), true, 'the established Claude provider stays enabled')
  for (const value of [undefined, '', '0', 'false', 'true']) {
    const env: NodeJS.ProcessEnv = {}
    if (value !== undefined) env.ENGINE_CODEX_ENABLED = value
    assert.equal(isProviderEnabled('codex', env), false, `Codex must fail closed for ${String(value)}`)
  }
  assert.equal(isProviderEnabled('codex', { ENGINE_CODEX_ENABLED: '1' }), true)
  assert.equal(isProviderEnabled('codex', { ENGINE_PROVIDER_PARITY_ENABLED: '1' }), false,
    'the parity flag never enables ordinary Codex runs')
  assert.equal(isProviderEnabled('codex', { ENGINE_PROVIDER_PARITY_ENABLED: '1' }, 'provider-parity'), true,
    'an operator-gated parity canary may run before global rollout')
  assert.equal(isProviderEnabled('codex', {}, 'provider-parity'), false,
    'the canary exception itself fails closed when its feature flag is absent')

  delete process.env.ENGINE_CODEX_ENABLED
  await assert.rejects(
    () => assertProviderAvailable('codex'),
    (error: any) => error?.statusCode === 503
      && error?.code === 'PROVIDER_DISABLED'
      && error?.body?.availability === 'unavailable'
      && /ENGINE_CODEX_ENABLED=1/.test(error?.message || ''),
  )
  console.log('provider rollout gate checks passed')
} finally {
  if (previous === undefined) delete process.env.ENGINE_CODEX_ENABLED
  else process.env.ENGINE_CODEX_ENABLED = previous
}
