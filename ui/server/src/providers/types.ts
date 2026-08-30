import type { LaunchKind } from '../config'
import type { CreditPreflight, RunStatus } from '../types'

/** Provider-neutral supervisor controls which must reach the tracked parent and every model-issued tool.
 * One canonical list prevents Claude/Codex parity from drifting when a new exact-resume control is added. */
export const PROVIDER_NEUTRAL_RUN_ENV = Object.freeze({
  deferModuleMemo: 'NOSTRA_DEFER_MODULE_MEMO',
  continuationRunRoot: 'NOSTRA_CONTINUATION_RUN_ROOT',
  exactModuleResume: 'NOSTRA_EXACT_MODULE_RESUME',
  exactModuleInputs: 'NOSTRA_EXACT_MODULE_INPUTS',
  exactModuleRunRoot: 'NOSTRA_EXACT_MODULE_RUN_ROOT',
  exactModuleName: 'NOSTRA_EXACT_MODULE_NAME',
  exactModuleWritableOrbs: 'NOSTRA_EXACT_MODULE_WRITABLE_ORBS',
  exactModuleSynthesisOrbs: 'NOSTRA_EXACT_MODULE_SYNTHESIS_ORBS',
  memoryMode: 'NOSTRA_MEMORY_MODE',
  parityCanaryContinuation: 'NOSTRA_PARITY_CANARY_CONTINUATION',
  frozenPoolDataPath: 'NOSTRA_FROZEN_POOL_DATA_PATH',
  frozenPoolOutDir: 'NOSTRA_FROZEN_POOL_OUT_DIR',
  frozenPoolBindingOutDir: 'NOSTRA_FROZEN_POOL_BINDING_OUT_DIR',
  frozenPoolGeneration: 'NOSTRA_FROZEN_POOL_GENERATION',
  frozenEvidenceRoot: 'NOSTRA_FROZEN_EVIDENCE_ROOT',
} as const)

export const PROVIDER_NEUTRAL_RUN_ENV_KEYS: readonly string[] = Object.freeze(
  Object.values(PROVIDER_NEUTRAL_RUN_ENV),
)

export type RunProvider = 'claude' | 'codex'

export interface ProviderSelectableProfile {
  key: string
  label: string
  description: string
  model: string
  reasoningLevel?: string
  executionProfile: ProviderExecutionProfile
}

/** Stable, non-secret metadata the cockpit can render before probing a provider. */
export interface ProviderProfile {
  provider: RunProvider
  label: string
  description: string
  defaultProfileKey: string
  profiles: ProviderSelectableProfile[]
  supportsUsage: boolean
}

export interface ProviderAvailability {
  available: boolean
  availability: 'available' | 'unavailable' | 'unknown'
  reason?: string
  cliVersion?: string
}

export interface ProviderExecutionProfile {
  key: string
  parentModel?: string
  parentReasoning?: string
  specialistModel?: string
  specialistReasoning?: string
}

/** The immutable provider selection stored on a RunState before admission or chaining. */
export interface ResolvedProviderProfile {
  provider: RunProvider
  profileKey: string
  model: string
  reasoningLevel?: string
  executionProfile: ProviderExecutionProfile
}

export interface ProviderLaunchContext {
  prompt: string
  kind: LaunchKind
  profile: ResolvedProviderProfile
  cwd: string
  /** Resolved shared data root a sandboxed provider may need to admit as an extra writable path. */
  additionalWritableDataRoot: string
  /** Supervisor/code/Git/archive paths which model-issued subprocesses must never mutate. */
  protectedWritePaths?: readonly string[]
  /** Exact run-owned output paths; every other repository/data path is read-only to the provider. */
  writablePaths?: readonly string[]
  /** Supervisor state/auth paths which model-issued tools must neither read nor mutate. */
  protectedReadPaths?: readonly string[]
  /** Exact supervisor-created, read-only capabilities outside repository/data/state namespaces. */
  readOnlyCapabilityPaths?: readonly string[]
  env: NodeJS.ProcessEnv
  guard: { maxTurns: number; budgetUsd: number }
  resumeSessionId?: string
  /**
   * A fresh provider process continuing the SAME admitted logical run after Codex returned cleanly before
   * the filesystem completion barrier. This is not a new launch or cross-provider resume: provider, profile,
   * run id, run root, and frozen inputs remain immutable. Claude never receives this field.
   */
  automaticContinuation?: {
    index: number
    completedOutputs: readonly string[]
    unresolvedOutputs: readonly string[]
  }
  /** Per-launch identity tying one fresh availability proof to its immediate spawn. */
  availabilityProofId?: string
  /** Exact per-run AF_UNIX supervisor publication capability; adapters may allow only this socket. */
  publicationSocketPath?: string
}

/** Complete process specification. The common launcher owns execa, cancellation, and stdio wiring. */
export interface ProviderLaunchSpec {
  command: string
  args: string[]
  /** Optional prompt/input delivered over stdin instead of exposed in argv. */
  input?: string
  cwd: string
  env: NodeJS.ProcessEnv
  cliVersion?: string
  /**
   * Last-moment provider-owned validation performed synchronously immediately before `execa`.
   * Use this for short-lived authentication leases and pinned-binary identity checks whose proof
   * must not have a mutation/expiry window between adapter construction and process creation.
   */
  beforeSpawn?: () => void
  /**
   * Release provider-owned ephemeral launch resources. The common launcher invokes this exactly once
   * on every path after a launch spec is built: pre-spawn abort, spawn failure, early stream failure,
   * or child close.
   */
  cleanup?: () => void
}

export interface ProviderCliResult {
  subtype?: string
  isError?: boolean
  apiErrorStatus?: number
}

/** Provider JSONL normalized before it reaches the common run-state/event machinery. */
export type ProviderStreamEvent =
  | { type: 'session'; sessionId: string }
  | { type: 'assistant-message'; message: string }
  | { type: 'tool-use'; tool: string; toolUseId?: string; input?: unknown }
  | { type: 'tool-progress'; tool: string; toolUseId?: string; input?: unknown }
  | { type: 'tool-result'; tool?: string; toolUseId?: string; input?: unknown; isError: boolean }
  | { type: 'usage'; usage: CreditPreflight }
  | {
      type: 'result'
      cliResult: ProviderCliResult
      costUsd?: number
      numTurns?: number
      durationMs?: number
      message?: string
    }

export interface ProviderExitContext {
  result: unknown
  stderr: string
  status: RunStatus
  cliResult?: ProviderCliResult
}

export type ProviderExitClassification =
  | { outcome: 'success' }
  | { outcome: 'terminated'; reason: string; message?: string }
  | { outcome: 'error'; reason: string; message?: string; outOfCredits?: boolean }

export interface ProviderAdapter {
  readonly profile: ProviderProfile
  resolveProfile(request: { model?: string; reasoningLevel?: string; profileKey?: string }): ResolvedProviderProfile
  /** `refresh:false` is a non-blocking status read; launch and explicit checks request a fresh proof. */
  getAvailability(options?: { refresh?: boolean; proofId?: string }): Promise<ProviderAvailability>
  buildLaunch(context: ProviderLaunchContext): Promise<ProviderLaunchSpec>
  parseStreamLine(line: string): ProviderStreamEvent[]
  classifyExit(context: ProviderExitContext): ProviderExitClassification
  /** null means the provider exposes no reliable plan-usage reading; never coerce it to zero. */
  checkUsage(): Promise<CreditPreflight | null>
  warmup?(): Promise<void>
}
