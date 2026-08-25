import { CODEX_EXECUTION_PROFILE, launchProviderReceiptMatches, type FrozenProviderLaunch } from './provider'

export const CODEX_PARITY_CANARY_SELECTION: FrozenProviderLaunch = {
  provider: 'codex',
  expectedProfileKey: CODEX_EXECUTION_PROFILE.key,
  model: CODEX_EXECUTION_PROFILE.parentModel,
  reasoningLevel: CODEX_EXECUTION_PROFILE.parentReasoning,
  executionProfile: CODEX_EXECUTION_PROFILE,
}

export interface ProviderParityCanaryPrefill {
  runRoot: string
  freezeReceipt: string
}

const PROVIDER_PARITY_CANARY_ATTEMPT_SUFFIX = String.raw`(?:__attempt-[a-f0-9]{8,32})?`

export const PROVIDER_PARITY_CANARY_RUN_ROOT_RE = new RegExp(
  String.raw`^analyses/provider-parity/\d{4}-\d{2}-\d{2}/(?:claude|codex)/[A-Z0-9.\-]{1,12}_\d{4}-\d{2}-\d{2}${PROVIDER_PARITY_CANARY_ATTEMPT_SUFFIX}$`,
)
const PROVIDER_PARITY_CANARY_BASENAME_RE = new RegExp(
  String.raw`^([A-Z0-9.\-]{1,12})_(\d{4}-\d{2}-\d{2})${PROVIDER_PARITY_CANARY_ATTEMPT_SUFFIX}$`,
)

export function providerParityCanaryRunRootIsValid(runRoot: string): boolean {
  return PROVIDER_PARITY_CANARY_RUN_ROOT_RE.test(runRoot.trim())
}

/** Deep links may prefill the two non-secret repository paths, but never submit a launch. */
export function providerParityCanaryPrefill(search: string): ProviderParityCanaryPrefill | null {
  const params = new URLSearchParams(search)
  if (params.get('parityCanary') !== 'codex') return null
  const runRoot = (params.get('runRoot') || '').trim()
  const freezeReceipt = (params.get('freezeReceipt') || '').trim()
  return runRoot && freezeReceipt ? { runRoot, freezeReceipt } : null
}

export function providerParityCanarySubject(runRoot: string): string | null {
  const basename = runRoot.trim().replace(/\/+$/, '').split('/').pop() || ''
  const match = PROVIDER_PARITY_CANARY_BASENAME_RE.exec(basename)
  return match?.[1] || null
}

/** A paid launch must return one exact, contradiction-free Codex receipt and a non-empty run id. */
export function providerParityCanaryResponseMatches(value: unknown, subject: string): boolean {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const row = value as Record<string, unknown>
  const preflight = row.preflight
  if (!preflight || typeof preflight !== 'object' || Array.isArray(preflight)) return false
  const receipt = preflight as Record<string, unknown>
  return typeof row.runId === 'string' && row.runId.trim().length > 0
    && receipt.kind === 'full'
    && receipt.ticker === subject
    && launchProviderReceiptMatches(row, CODEX_PARITY_CANARY_SELECTION, 'valid')
}
