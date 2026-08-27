import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import {
  PROVIDER_TRANSPARENT_UX_CONTRACT_VERSION,
  preflightConfirmationMatches,
  requiresTypedSubjectConfirmation,
  typedSubjectConfirmationMatches,
} from './launchExperience'
import type { RunKind } from './types'

assert.equal(PROVIDER_TRANSPARENT_UX_CONTRACT_VERSION, 'provider-transparent-ux/1')

const kinds: RunKind[] = [
  'full', 'module', 'agent', 'rerun', 'review', 'track', 'doc-intake', 'signal', 'sweep',
  'screener-agent', 'handoff', 'conviction', 'parity',
]
for (const kind of kinds) {
  assert.equal(requiresTypedSubjectConfirmation(kind), kind === 'full', `${kind} acknowledgement is run-kind policy`)
}
assert.equal(preflightConfirmationMatches('full', true), true)
assert.equal(preflightConfirmationMatches('full', false), false, 'an estimate cannot remove full-run acknowledgement')
assert.equal(preflightConfirmationMatches('rerun', false), true)
assert.equal(preflightConfirmationMatches('rerun', true), false, 'an estimate cannot invent a different rerun flow')
assert.equal(typedSubjectConfirmationMatches('  kar ', 'KAR'), true)
assert.equal(typedSubjectConfirmationMatches('META', 'KAR'), false)

const launchConfirm = readFileSync(fileURLToPath(new URL('../components/LaunchConfirm.tsx', import.meta.url)), 'utf8')
assert.doesNotMatch(launchConfirm, /needsTyped\s*=\s*p\.requiresTypedConfirm/,
  'the confirmation UI must not delegate acknowledgement policy to a provider preflight')
assert.match(launchConfirm, /const subject = lc\.selection\.subject/,
  'confirmation must render and compare the frozen launch subject')

const thesisPanel = readFileSync(fileURLToPath(new URL('../components/ThesisPlanPanel.tsx', import.meta.url)), 'utf8')
assert.doesNotMatch(thesisPanel, /provider === 'claude' && <div className="tpp__saving">/,
  'the full-run typed-confirmation explanation must be visible under every provider')

const storeSource = readFileSync(fileURLToPath(new URL('./store.ts', import.meta.url)), 'utf8')
const rediscoverySource = storeSource.slice(
  storeSource.indexOf('function reconcileProviderRediscovery'),
  storeSource.indexOf('// Auto-resume of interrupted screener runs'),
)
assert.ok(
  rediscoverySource.indexOf('providerRediscoveryAttempt++')
    > rediscoverySource.indexOf('state.staticMode || providerChecksInFlight > 0'),
  'offline/check-in-flight deferrals must not consume a provider rediscovery attempt',
)
assert.doesNotMatch(rediscoverySource, /\.unref\?\./,
  'browser provider rediscovery must use browser timers without Node-only timer methods')

console.log('provider-transparent UX: run-kind confirmation and frozen-subject guards passed')
