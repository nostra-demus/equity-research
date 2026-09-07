import type { RunKind } from './types'

// The provider is an execution adapter, never a product mode. Keep launch acknowledgement policy
// derived from the work being launched so Claude and Codex cannot acquire different cockpit flows.
export const PROVIDER_TRANSPARENT_UX_CONTRACT_VERSION = 'provider-transparent-ux/1'

export function requiresTypedSubjectConfirmation(kind: RunKind): boolean {
  return kind === 'full'
}

export function typedSubjectConfirmationMatches(typed: string, frozenSubject: string): boolean {
  return typed.trim().toUpperCase() === frozenSubject.trim().toUpperCase()
}

export function preflightConfirmationMatches(kind: 'full' | 'rerun', requiresTypedConfirm: boolean): boolean {
  return requiresTypedConfirm === requiresTypedSubjectConfirmation(kind)
}

/** Launch diagnostics can contain host paths or credentials. Translate known causes into fixed public
 * text; never turn an arbitrary process exception into toast copy. Shared by single runs and chains. */
export function launchFailureMessage(reason?: string, message?: string): string | undefined {
  if (reason !== 'launch_failed' && reason !== 'spawn_failed' && reason !== 'continuation_spawn_failed') return undefined
  if (/\bfrozen evidence generation is writable\b/i.test(message || '')) {
    return 'The saved evidence must be read-only before this run can start. Your completed work is saved.'
  }
  return 'The engine could not start this run. Your completed work is saved. Check Activity for recovery details.'
}
