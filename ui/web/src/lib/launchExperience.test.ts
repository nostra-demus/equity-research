import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import {
  PROVIDER_TRANSPARENT_UX_CONTRACT_VERSION,
  launchFailureMessage,
  preflightConfirmationMatches,
  requiresTypedSubjectConfirmation,
  typedSubjectConfirmationMatches,
} from './launchExperience'
import { isTechnicalReadinessFailure } from '../components/ReadinessWarnings'
import { isPhysicallyEmptyReadiness, useStore } from './store'
import { api } from './api'
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
const reportBase = {
  ticker: 'KAR', kind: 'full', overall: 'blocked' as const, fileCount: 1, usableCount: 0,
  entities: [], ts: 1,
}
assert.equal(isPhysicallyEmptyReadiness({
  ...reportBase,
  physicalPool: { state: 'nonempty', fileCount: 1, nonEmptyFileCount: 1 },
  issues: [{ code: 'zero_usable_data', severity: 'blocker', message: 'parser could not use it' }],
}), false, 'a non-empty corrupt or unsupported file is not presented as an empty folder')
assert.equal(isPhysicallyEmptyReadiness({
  ...reportBase,
  physicalPool: { state: 'empty', fileCount: 1, nonEmptyFileCount: 0 },
  issues: [{ code: 'zero_usable_data', severity: 'blocker', message: 'all files are zero bytes' }],
}), true, 'a complete all-zero-byte proof is presented as empty')

const launchConfirm = readFileSync(fileURLToPath(new URL('../components/LaunchConfirm.tsx', import.meta.url)), 'utf8')
assert.doesNotMatch(launchConfirm, /needsTyped\s*=\s*p\.requiresTypedConfirm/,
  'the confirmation UI must not delegate acknowledgement policy to a provider preflight')
assert.match(launchConfirm, /const subject = lc\.selection\.subject/,
  'confirmation must render and compare the frozen launch subject')

const thesisPanel = readFileSync(fileURLToPath(new URL('../components/ThesisPlanPanel.tsx', import.meta.url)), 'utf8')
assert.doesNotMatch(thesisPanel, /provider === 'claude' && <div className="tpp__saving">/,
  'the full-run typed-confirmation explanation must be visible under every provider')
assert.match(thesisPanel, /sourceRunRoots\.includes\(entry\.runRoot\)/,
  'the old-run action must select only a root named by the plan being shown')
assert.match(thesisPanel, /\(entry\.swarm \|\| 'research'\) === 'research'/,
  'legacy resumable rows with an omitted swarm id remain selectable as research runs')
assert.match(thesisPanel, />\s*Complete old run\s*</,
  'a multi-root completion offers the exact saved-run action instead of a dead generic launch')
assert.match(thesisPanel, />\s*Run full\s*</,
  'a multi-root completion keeps typed Full as the separate alternative')

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

const privateDiagnostic = 'PRIVATE_DIAGNOSTIC_SENTINEL /private/account/config token=fixture-secret'
const evidenceFailure = `continuation_spawn_failed: frozen evidence generation is writable; ${privateDiagnostic}`
const evidenceMessage = 'The saved evidence must be read-only before this run can start. Your completed work is saved.'
assert.equal(launchFailureMessage('launch_failed', evidenceFailure), evidenceMessage)
assert.equal(launchFailureMessage('spawn_failed', evidenceFailure), evidenceMessage)
assert.equal(launchFailureMessage('out_of_credits', evidenceFailure), undefined,
  'the launch mapper does not replace quota-specific recovery')
assert.doesNotMatch(launchFailureMessage('launch_failed', privateDiagnostic)!, /PRIVATE_DIAGNOSTIC|fixture-secret|\/private\//)

// The same pre-spawn failure can be reported by a module or the first child of Continue. Both must show
// the safe cause rather than a machine code, regardless of which provider owns the saved run.
const before = useStore.getState()
const originalManifest = api.runManifest
let displayed = ''
try {
  api.runManifest = async () => { throw new Error('fixture: no manifest refresh needed') }
  for (const provider of ['claude', 'codex'] as const) {
    for (const chained of [false, true]) {
      for (const message of [evidenceFailure, privateDiagnostic]) {
        const runId = `${provider}-${chained ? 'chain' : 'module'}`
        displayed = ''
        useStore.setState({
          selectedTicker: 'NU', activeSwarm: 'research', constellationSwarm: 'research',
          selectToken: 404, nodeRuntime: { 'business-model/saved': { status: 'done' } },
          readinessGate: null, readinessGateQueue: [], readinessRecovery: {}, stoppingRuns: {},
          chainTickers: new Set(chained ? ['research\0NU'] : []),
          activeRuns: { [runId]: {
            runId, ticker: 'NU', swarmId: 'research', kind: 'module', module: 'management-governance',
            status: 'starting', provider, continuation: true,
          } },
          refreshActiveRuns: async () => {},
          setToast: (toast) => { displayed = toast?.msg || '' },
        })
        useStore.getState()._handleEvent({
          type: 'run-error', runId, status: 'error', reason: 'launch_failed', message, provider, ts: 1,
        })
        assert.equal(displayed, launchFailureMessage('launch_failed', message),
          `${provider}/${chained}: the actual event handler surfaces the safe launch diagnosis`)
        assert.doesNotMatch(displayed, /PRIVATE_DIAGNOSTIC|fixture-secret|\/private\//)
        assert.equal(useStore.getState().activeRuns[runId].status, 'error')
        assert.equal(useStore.getState().nodeRuntime['business-model/saved'].status, 'done')
        assert.equal(useStore.getState().chainTickers.size, 0, 'the failed chain is no longer shown as running')
      }
    }
  }
} finally {
  api.runManifest = originalManifest
  useStore.setState(before)
}

console.log('provider-transparent UX: confirmation, frozen-subject guards, and safe launch-failure diagnostics passed')
