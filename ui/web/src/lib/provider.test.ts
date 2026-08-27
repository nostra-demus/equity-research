import assert from 'node:assert/strict'
import { automaticResumeMatches, CODEX_EXECUTION_PROFILE, CODEX_SOL_ONLY_EXECUTION_PROFILE, executionProfileLabel, freezeProviderLaunch, launchProviderReceiptMatches, manualResumeConfirmation, normalizeProvidersRead, optionalNestedLaunchResponseMatches, providerBlockedReason, providerCatalogFallback, providerCatalogForError, providerCatalogUnknown, providerIsBlocked, providerLaunchBlockedReason, providerNeedsCheck, providerUsagePercentText, providerUsageUnavailableText, readRunProfileKey, readRunProvider, resumeExecutionDisposition, RUN_PROFILE_STORAGE_PREFIX, RUN_PROVIDER_STORAGE_KEY, saveRunProfileKey, saveRunProvider, selectedProviderProfile, trackedLaunchResponseMatches } from './provider'

const CLAUDE_PROFILE = { key: 'claude:opus:default', parentModel: 'opus', parentReasoning: 'default' }
const CLAUDE_SONNET_PROFILE = { key: 'claude:sonnet:default', parentModel: 'sonnet', parentReasoning: 'default' }
const profileOptions = {
  claude: [
    { key: CLAUDE_PROFILE.key, label: 'Opus', description: 'Highest quality', model: 'opus', reasoningLevel: 'default', executionProfile: CLAUDE_PROFILE },
    { key: CLAUDE_SONNET_PROFILE.key, label: 'Sonnet', description: 'Balanced', model: 'sonnet', reasoningLevel: 'default', executionProfile: CLAUDE_SONNET_PROFILE },
  ],
  codex: [
    { key: CODEX_EXECUTION_PROFILE.key, label: 'Sol + Terra', description: 'Balanced', model: 'gpt-5.6-sol', reasoningLevel: 'max', executionProfile: CODEX_EXECUTION_PROFILE },
    { key: CODEX_SOL_ONLY_EXECUTION_PROFILE.key, label: 'Sol only', description: 'Highest quality', model: 'gpt-5.6-sol', reasoningLevel: 'max', executionProfile: CODEX_SOL_ONLY_EXECUTION_PROFILE },
  ],
}
const providerRow = (provider: 'claude' | 'codex', availability: 'available' | 'unavailable' | 'unknown', overrides: Record<string, unknown> = {}) => ({
  provider,
  enabled: true,
  available: availability === 'available',
  checked: true,
  availability,
  profile: provider === 'claude' ? CLAUDE_PROFILE : CODEX_EXECUTION_PROFILE,
  defaultProfileKey: provider === 'claude' ? CLAUDE_PROFILE.key : CODEX_EXECUTION_PROFILE.key,
  profiles: profileOptions[provider],
  ...overrides,
})

const values = new Map<string, string>()
const storage = {
  getItem: (key: string) => values.get(key) ?? null,
  setItem: (key: string, value: string) => { values.set(key, value) },
}

assert.equal(readRunProvider(storage), 'claude', 'existing users default to Claude')
saveRunProvider('codex', storage)
assert.equal(values.get(RUN_PROVIDER_STORAGE_KEY), 'codex')
assert.equal(readRunProvider(storage), 'codex', 'the provider choice is sticky')
values.set(RUN_PROVIDER_STORAGE_KEY, 'invalid')
assert.equal(readRunProvider(storage), 'claude', 'malformed preferences fail safely to Claude')
assert.equal(readRunProfileKey('claude', storage), CLAUDE_PROFILE.key, 'Claude defaults to highest-quality Opus')
assert.equal(readRunProfileKey('codex', storage), CODEX_EXECUTION_PROFILE.key, 'Codex defaults to its reviewed balanced profile')
saveRunProfileKey('claude', CLAUDE_SONNET_PROFILE.key, storage)
saveRunProfileKey('codex', CODEX_SOL_ONLY_EXECUTION_PROFILE.key, storage)
assert.equal(values.get(`${RUN_PROFILE_STORAGE_PREFIX}claude`), CLAUDE_SONNET_PROFILE.key)
assert.equal(readRunProfileKey('claude', storage), CLAUDE_SONNET_PROFILE.key, 'Claude model choice is sticky')
assert.equal(readRunProfileKey('codex', storage), CODEX_SOL_ONLY_EXECUTION_PROFILE.key, 'Codex model choice is sticky')

assert.equal(executionProfileLabel({
  provider: 'codex', enabled: true, available: true, checked: true,
  profile: { key: 'quality', parentModel: 'gpt-5.6-sol', parentReasoning: 'max', specialistModel: 'gpt-5.6-terra', specialistReasoning: 'xhigh' },
}), 'gpt-5.6-sol max · gpt-5.6-terra xhigh')

assert.equal(providerUsagePercentText(undefined), null, 'missing telemetry is unavailable, not 0%')
assert.equal(providerUsagePercentText(Number.NaN), null, 'malformed telemetry is unavailable')
assert.equal(providerUsagePercentText(0), '0%', 'a recorded zero remains a real zero')
assert.equal(providerUsagePercentText(0.743), '74%')
assert.equal(providerUsageUnavailableText({ checked: true, utilization: undefined }), 'Usage unavailable')
assert.equal(providerUsageUnavailableText({ checked: true, utilization: 0 }), null, 'a recorded zero is not unavailable')

const catalog = normalizeProvidersRead({ providers: [
  providerRow('claude', 'available'),
  providerRow('codex', 'available', { usage: { checked: true, ok: false, status: 'rejected' } }),
] })
assert.ok(catalog)
assert.equal(catalog.catalogState, 'valid')
assert.equal(providerIsBlocked(catalog.codex), false, 'rate-limited but runtime-available stays selectable')
assert.equal(catalog.claude.profiles?.length, 2)
assert.equal(catalog.codex.profiles?.length, 2)
assert.equal(selectedProviderProfile(catalog.claude, CLAUDE_SONNET_PROFILE.key)?.label, 'Sonnet')
assert.equal(selectedProviderProfile(catalog.claude, 'claude:removed-model:default'), null,
  'an explicit unknown model never silently substitutes the default')
assert.equal(executionProfileLabel(catalog.codex, CODEX_SOL_ONLY_EXECUTION_PROFILE.key), 'Sol only')

const authMissing = normalizeProvidersRead({ providers: [
  providerRow('claude', 'available'),
  providerRow('codex', 'unavailable', { reason: 'ChatGPT login required' }),
] })!
assert.equal(providerIsBlocked(authMissing.codex), true)
assert.equal(providerBlockedReason(authMissing.codex), 'ChatGPT login required')
assert.equal(providerIsBlocked({ provider: 'codex', enabled: false, available: false, checked: false }), false, 'unchecked is not prematurely disabled')
const unknown = { provider: 'codex' as const, enabled: true, available: false, checked: true, status: 'unknown' }
assert.equal(providerIsBlocked(unknown), false, 'unknown is retryable rather than permanently disabled')
assert.equal(providerNeedsCheck(unknown), true)
assert.match(providerLaunchBlockedReason(unknown, 'valid') || '', /unknown/, 'unknown still cannot launch')

assert.equal(normalizeProvidersRead({ claude: {}, codex: {} }), null, 'old record-shaped response is not trusted')
assert.equal(normalizeProvidersRead({ providers: [{ provider: 'claude', availability: 'available' }] }), null, 'partial provider arrays are not trusted')
assert.equal(normalizeProvidersRead({ providers: [
  { ...providerRow('claude', 'available'), checked: undefined }, providerRow('codex', 'available'),
] }), null, 'implicit checked status is not a current contract')
assert.equal(normalizeProvidersRead({ providers: [
  providerRow('claude', 'available'),
  providerRow('codex', 'available', { profile: { ...CODEX_EXECUTION_PROFILE, specialistReasoning: 'high' } }),
] }), null, 'Codex catalogue must prove the exact Sol/max + Terra/xhigh profile')
assert.equal(normalizeProvidersRead({ providers: [
  providerRow('claude', 'available', { profiles: undefined }),
  providerRow('codex', 'available'),
] }), null, 'an older server without a model catalogue cannot overwrite or launch a saved model')
assert.equal(normalizeProvidersRead({ providers: [
  providerRow('claude', 'available', { profiles: [{ ...profileOptions.claude[0], label: '' }, profileOptions.claude[1]] }),
  providerRow('codex', 'available'),
] }), null, 'malformed selectable profiles fail the whole catalogue closed')
assert.equal(normalizeProvidersRead({ providers: [
  providerRow('claude', 'available', { defaultProfileKey: CLAUDE_SONNET_PROFILE.key }),
  providerRow('codex', 'available'),
] }), null, 'the default profile key must describe the authoritative default execution profile')
const fallback = providerCatalogFallback('old server')
assert.equal(fallback.catalogState, 'fallback')
assert.equal(providerIsBlocked(fallback.claude), false, 'legacy Claude remains available')
assert.equal(providerIsBlocked(fallback.codex), true, 'Codex fails closed when the contract is absent')
assert.match(providerLaunchBlockedReason(fallback.claude, fallback.catalogState) || '', /cannot verify model selection/i,
  'a new client never launches an unverified legacy default after model choice exists')
assert.match(providerLaunchBlockedReason({ provider: 'codex', enabled: true, available: false, checked: false }, 'unknown') || '', /not been verified/, 'persisted Codex cannot launch during catalogue discovery')
assert.equal(providerLaunchBlockedReason(catalog.codex, catalog.catalogState), null, 'a proved current Codex contract can launch even when usage is rate-limited')
assert.equal(providerCatalogForError({ status: 404 }).catalogState, 'fallback', 'only exact 404 proves the legacy endpoint')
for (const error of [{ status: 500 }, { status: '404' }, new Error('timeout'), null]) {
  const uncertain = providerCatalogForError(error)
  assert.equal(uncertain.catalogState, 'unknown')
  assert.match(providerLaunchBlockedReason(uncertain.claude, uncertain.catalogState) || '', /unknown/)
  assert.match(providerLaunchBlockedReason(uncertain.codex, uncertain.catalogState) || '', /verified|unknown/)
}
assert.equal(providerCatalogUnknown().claude.available, false, 'malformed/transient catalogues block Claude too')

const codexSelection = freezeProviderLaunch(catalog.codex, 'valid')!
assert.equal(freezeProviderLaunch(catalog.codex, 'valid', 'codex|removed-profile'), null,
  'a stale explicit profile fails closed instead of launching the default')
const codexReceipt = { provider: 'codex', profileKey: codexSelection.expectedProfileKey, model: codexSelection.model, reasoningLevel: codexSelection.reasoningLevel, executionProfile: codexSelection.executionProfile }
assert.equal(launchProviderReceiptMatches({ preflight: codexReceipt }, codexSelection, 'valid'), true)
assert.equal(launchProviderReceiptMatches({ provider: 'claude', preflight: codexReceipt }, codexSelection, 'valid'), false, 'contradictory echoes fail')
assert.equal(launchProviderReceiptMatches({ preflight: { ...codexReceipt, model: 'rolled-model' } }, codexSelection, 'valid'), false, 'model drift fails closed')
assert.equal(launchProviderReceiptMatches({ preflight: { ...codexReceipt, executionProfile: { ...codexSelection.executionProfile, specialistReasoning: 'high' } } }, codexSelection, 'valid'), false, 'nested profile drift fails closed')
assert.equal(launchProviderReceiptMatches({ ...codexReceipt, preflight: { ...codexReceipt, executionProfile: { ...codexSelection.executionProfile, specialistModel: 'other' } } }, codexSelection, 'valid'), false, 'one exact receipt cannot mask a contradictory nested profile')
assert.equal(launchProviderReceiptMatches({ ...codexReceipt, launch: { preflight: { ...codexReceipt, profileKey: 'rolled-profile' } } }, codexSelection, 'valid'), false, 'contradictory deeply nested CAS fields fail closed')
assert.equal(launchProviderReceiptMatches({ preflight: {} }, codexSelection, 'valid'), false, 'a current launch cannot omit its full execution receipt')
assert.equal(freezeProviderLaunch(fallback.claude, 'fallback'), null,
  'an old server cannot silently choose Claude Sonnet for a new client that defaults to Opus')
assert.equal(launchProviderReceiptMatches({}, codexSelection, 'valid', false), true, 'a no-launch idempotent response needs no receipt')
assert.equal(trackedLaunchResponseMatches({ alreadyPromoted: true }, codexSelection, 'valid', true), true)
assert.equal(trackedLaunchResponseMatches({ alreadyPromoted: true, provider: 'claude' }, codexSelection, 'valid', true), false,
  'an idempotent no-run response may omit a receipt but cannot contradict the selected provider')
assert.equal(trackedLaunchResponseMatches({ alreadyPromoted: false }, codexSelection, 'valid', false), false, 'explicit false still requires a run id')
assert.equal(trackedLaunchResponseMatches({ runId: 'run-1', preflight: codexReceipt }, codexSelection, 'valid', false), true)
assert.equal(trackedLaunchResponseMatches({ runId: '', preflight: codexReceipt }, codexSelection, 'valid', false), false)
assert.equal(optionalNestedLaunchResponseMatches({ analyzing: false }, codexSelection, 'valid', false), true, 'a proved note-only send needs no run receipt')
assert.equal(optionalNestedLaunchResponseMatches({ analyzing: true }, codexSelection, 'valid', true), false, 'analyzing true requires a launch')
assert.equal(optionalNestedLaunchResponseMatches({ analyzing: false, launch: { runId: 'run-2', preflight: codexReceipt } }, codexSelection, 'valid', false), true,
  'any optional launch is validated even when the outer operation is otherwise note-only')
assert.equal(optionalNestedLaunchResponseMatches({ analyzing: true, provider: 'claude', launch: { runId: 'run-2', preflight: codexReceipt } }, codexSelection, 'valid', true), false,
  'a contradictory outer echo invalidates an exact nested event launch')

const exactCodexRecord = { provider: 'codex' as const, executionProfile: CODEX_EXECUTION_PROFILE }
assert.equal(manualResumeConfirmation([exactCodexRecord], codexSelection), null)
const solOnlySelection = freezeProviderLaunch(catalog.codex, 'valid', CODEX_SOL_ONLY_EXECUTION_PROFILE.key)!
assert.deepEqual(solOnlySelection, {
  provider: 'codex',
  expectedProfileKey: CODEX_SOL_ONLY_EXECUTION_PROFILE.key,
  model: 'gpt-5.6-sol',
  reasoningLevel: 'max',
  executionProfile: CODEX_SOL_ONLY_EXECUTION_PROFILE,
}, 'Sol-only selection freezes the exact parent and specialist profile')
const claudeSelection = freezeProviderLaunch(catalog.claude, 'valid')!
const sonnetSelection = freezeProviderLaunch(catalog.claude, 'valid', CLAUDE_SONNET_PROFILE.key)!
assert.deepEqual(sonnetSelection, {
  provider: 'claude',
  expectedProfileKey: CLAUDE_SONNET_PROFILE.key,
  model: 'sonnet',
  reasoningLevel: 'default',
  executionProfile: CLAUDE_SONNET_PROFILE,
}, 'Claude Sonnet selection freezes independently from the Opus default')
assert.match(manualResumeConfirmation([{ provider: 'claude', executionProfile: CLAUDE_PROFILE }], codexSelection) || '', /Mixed \(Claude → Codex\)/)
assert.match(manualResumeConfirmation([{ provider: 'codex' }], codexSelection) || '', /original exact provider\/profile is unknown/)
assert.match(manualResumeConfirmation([{ provider: 'claude', executionProfile: { key: 'claude:sonnet:default', parentModel: 'sonnet', parentReasoning: 'default' } }], claudeSelection) || '', /profile changed|now configured/i)
assert.equal(resumeExecutionDisposition([
  exactCodexRecord,
  { provider: 'codex', executionProfile: { ...CODEX_EXECUTION_PROFILE, specialistReasoning: 'high' } },
], codexSelection).disposition, 'unknown', 'a malformed saved profile is not treated as exact')
assert.equal(resumeExecutionDisposition([
  exactCodexRecord,
  { provider: 'claude', executionProfile: CLAUDE_PROFILE },
], codexSelection).disposition, 'conflict', 'board/disk provider disagreement is explicit')
assert.equal(automaticResumeMatches([exactCodexRecord, exactCodexRecord], codexSelection), true)
assert.equal(automaticResumeMatches([exactCodexRecord, { provider: 'codex' }], codexSelection), false, 'automatic resume holds on any missing profile authority')
assert.equal(automaticResumeMatches([{ provider: 'claude', executionProfile: CLAUDE_PROFILE }], claudeSelection), true)

console.log('provider.test.ts: persistence/default/profile passed')
