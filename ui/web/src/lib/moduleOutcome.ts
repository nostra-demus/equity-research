import type { AgentNode, NodeRuntime } from './types'

export type ModuleCompletionOutcome =
  | { complete: false; kind: null; verdict: null }
  | { complete: true; kind: 'synthesis'; verdict: string | null }
  | { complete: true; kind: 'fail-fast'; verdict: 'Insufficient' }

const isInsufficient = (verdict: string | null | undefined): boolean => {
  const normalized = verdict?.trim().toLowerCase().replace(/[.!]+$/, '')
  return normalized === 'insufficient' || normalized === 'insufficient data'
}

/** Mirror the launcher's terminal-module rule for display only.
 *
 * A synthesis report is the normal completed outcome. A discovered 00 fail-fast gate is also a valid
 * terminal outcome, but only when its saved verdict explicitly says the module was insufficient. This
 * keeps the cockpit aligned with disk truth without painting unrun downstream orbs as completed.
 */
export function moduleCompletionOutcome(
  nodes: Pick<AgentNode, 'key' | 'nn' | 'failFast' | 'isSynthesis'>[],
  runtime: Record<string, Pick<NodeRuntime, 'status' | 'verdict' | 'terminalValidated'> | undefined>,
): ModuleCompletionOutcome {
  const synthesis = nodes.find((node) => node.isSynthesis)
  if (synthesis && runtime[synthesis.key]?.status === 'done') {
    return { complete: true, kind: 'synthesis', verdict: runtime[synthesis.key]?.verdict ?? null }
  }

  const failFast = nodes.find((node) => node.failFast && node.nn === '00' && !node.isSynthesis)
  if (failFast && runtime[failFast.key]?.status === 'done' && runtime[failFast.key]?.terminalValidated
      && isInsufficient(runtime[failFast.key]?.verdict)) {
    return { complete: true, kind: 'fail-fast', verdict: 'Insufficient' }
  }

  return { complete: false, kind: null, verdict: null }
}
