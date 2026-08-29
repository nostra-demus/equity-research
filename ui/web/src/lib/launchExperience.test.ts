import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import {
  PROVIDER_TRANSPARENT_UX_CONTRACT_VERSION,
  preflightConfirmationMatches,
  requiresTypedSubjectConfirmation,
  typedSubjectConfirmationMatches,
} from './launchExperience'
import { isTechnicalReadinessFailure } from '../components/ReadinessWarnings'
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
assert.equal(isTechnicalReadinessFailure([
  { code: 'check_failed', severity: 'blocker', message: 'technical failure' },
]), true, 'a technical checker failure gets the non-overridable recovery UI')
assert.equal(isTechnicalReadinessFailure([
  { code: 'zero_files', severity: 'blocker', message: 'no files' },
]), false, 'a genuine data blocker keeps the ordinary typed-override UI')

const launchConfirm = readFileSync(fileURLToPath(new URL('../components/LaunchConfirm.tsx', import.meta.url)), 'utf8')
assert.doesNotMatch(launchConfirm, /needsTyped\s*=\s*p\.requiresTypedConfirm/,
  'the confirmation UI must not delegate acknowledgement policy to a provider preflight')
assert.match(launchConfirm, /const subject = lc\.selection\.subject/,
  'confirmation must render and compare the frozen launch subject')

const thesisPanel = readFileSync(fileURLToPath(new URL('../components/ThesisPlanPanel.tsx', import.meta.url)), 'utf8')
assert.doesNotMatch(thesisPanel, /provider === 'claude' && <div className="tpp__saving">/,
  'the full-run typed-confirmation explanation must be visible under every provider')

const storeSource = readFileSync(fileURLToPath(new URL('./store.ts', import.meta.url)), 'utf8')
const resumeConfirm = readFileSync(fileURLToPath(new URL('../components/ResumeConfirm.tsx', import.meta.url)), 'utf8')
const commandBar = readFileSync(fileURLToPath(new URL('../components/CommandBar.tsx', import.meta.url)), 'utf8')
const appSource = readFileSync(fileURLToPath(new URL('../App.tsx', import.meta.url)), 'utf8')
assert.match(appSource, /<ResumeConfirm\s*\/>/, 'the universal manual-resume chooser must stay mounted')
assert.match(resumeConfirm, /Continue with/, 'Resume must expose provider choice at the final action boundary')
assert.match(resumeConfirm, /ProviderProfileSelector/, 'Resume must expose the server-reviewed model catalogue')
assert.match(commandBar, /Complete old run/, 'the selected company must expose saved completion beside Run full')
assert.doesNotMatch(commandBar, />\s*Launch release canary…\s*</,
  'operator release calibration must not appear in the normal research-user provider menu')
assert.match(resumeConfirm, /Complete remaining work/,
  'the saved-work action must explain the user outcome instead of exposing internal resume jargon')
assert.doesNotMatch(storeSource, /window\.confirm\(/,
  'manual resume must never fall back to a native yes/no prompt that forces the global profile')
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
