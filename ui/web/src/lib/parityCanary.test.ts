import assert from 'node:assert/strict'
import { CODEX_EXECUTION_PROFILE } from './provider'
import { CODEX_PARITY_CANARY_SELECTION, providerParityCanaryPrefill, providerParityCanaryResponseMatches, providerParityCanarySubject } from './parityCanary'

const runRoot = 'analyses/provider-parity/2026-08-23/codex/AMZN_2026-08-23'
const freezeReceipt = 'analyses/provider-parity/2026-08-23/freeze/AMZN_2026-08-23.json'
assert.equal(providerParityCanarySubject(runRoot), 'AMZN')
assert.equal(providerParityCanarySubject('analyses/provider-parity/codex/not-a-bound-root'), null)
assert.deepEqual(providerParityCanaryPrefill(`?parityCanary=codex&runRoot=${encodeURIComponent(runRoot)}&freezeReceipt=${encodeURIComponent(freezeReceipt)}`), { runRoot, freezeReceipt })
assert.equal(providerParityCanaryPrefill(`?parityCanary=claude&runRoot=${encodeURIComponent(runRoot)}&freezeReceipt=${encodeURIComponent(freezeReceipt)}`), null)

const receipt = {
  provider: 'codex',
  profileKey: CODEX_EXECUTION_PROFILE.key,
  model: CODEX_EXECUTION_PROFILE.parentModel,
  reasoningLevel: CODEX_EXECUTION_PROFILE.parentReasoning,
  executionProfile: CODEX_EXECUTION_PROFILE,
}
const response = { runId: 'run-1', preflight: { kind: 'full', ticker: 'AMZN', ...receipt } }
assert.equal(providerParityCanaryResponseMatches(response, 'AMZN'), true)
assert.equal(providerParityCanaryResponseMatches({ ...response, runId: '' }, 'AMZN'), false)
assert.equal(providerParityCanaryResponseMatches({ ...response, provider: 'claude' }, 'AMZN'), false, 'outer contradictions cannot be laundered by the preflight')
assert.equal(providerParityCanaryResponseMatches({ ...response, preflight: { ...response.preflight, model: 'rolled-model' } }, 'AMZN'), false)
assert.equal(providerParityCanaryResponseMatches({ ...response, preflight: { ...response.preflight, ticker: 'MSFT' } }, 'AMZN'), false)
assert.equal(CODEX_PARITY_CANARY_SELECTION.expectedProfileKey, 'codex|gpt-5.6-sol:max|gpt-5.6-terra:xhigh')

console.log('parityCanary.test.ts: deep-link and exact launch receipt guards passed')
