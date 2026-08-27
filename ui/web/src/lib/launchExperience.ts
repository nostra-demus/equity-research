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
