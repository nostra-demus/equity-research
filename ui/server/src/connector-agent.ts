// Shared connector-agent surface. Automatic connector build and repair agents are deliberately unavailable:
// this runtime has no OS/VM-enforced egress sandbox, and a bypassPermissions process cannot be contained by
// prompt instructions or a DNS preflight. Keep the pure progress-display helpers and the minimal child env
// used by read-only `gh pr view` repair verification; callers receive one deterministic assessed result.

import { CODE_PR_TOKEN, connectorAgentIsolationReady } from './config'
import { buildChildEnv } from './feedback-dispatch'

export interface WorktreeAgentResult {
  outcome: 'pr_open' | 'assessed' | 'source_gone'
  pr_url?: string
  note?: string
  connector_id?: string
}

/** One thing the coding agent just did — the live "what is happening right now" line the cockpit renders. */
export interface AgentStep {
  tool: string // the tool it called (Edit, Bash, Read, …), or 'say' for a line of its own prose
  target: string // the file / command / subject of that call, already shortened for display
}

// The human-readable subject of one coding-agent tool call. Deliberately narrow: it must never echo a whole
// command or file body into the cockpit, only enough to recognise the step.
export function stepTarget(tool: string, input: any): string {
  const short = (s: any, n = 90) => String(s ?? '').replace(/\s+/g, ' ').trim().slice(0, n)
  try {
    if (typeof input?.file_path === 'string') return short(input.file_path.split('/').slice(-3).join('/'))
    if (tool === 'Bash' && typeof input?.command === 'string') return short(input.command, 110)
    if (tool === 'WebFetch' && typeof input?.url === 'string') {
      try { return new URL(input.url).hostname } catch { return short(input.url) }
    }
    if (typeof input?.pattern === 'string') return short(input.pattern)
    if (typeof input?.description === 'string') return short(input.description)
  } catch { /* fall through to the bare tool name */ }
  return ''
}

/** Classify one stream-json line from the coding agent into display steps. Pure over its input. */
export function classifyAgentLine(o: any): AgentStep[] {
  if (!o || typeof o !== 'object' || o.type !== 'assistant' || o.error) return []
  const content = o.message?.content
  if (!Array.isArray(content)) return []
  const steps: AgentStep[] = []
  for (const b of content) {
    if (b?.type === 'tool_use' && typeof b.name === 'string') steps.push({ tool: b.name, target: stepTarget(b.name, b.input) })
    else if (b?.type === 'text' && typeof b.text === 'string' && b.text.trim()) {
      steps.push({ tool: 'say', target: b.text.replace(/\s+/g, ' ').trim().slice(0, 180) })
    }
  }
  return steps
}

export function connectorChildEnv(): NodeJS.ProcessEnv {
  return buildChildEnv(process.env, CODE_PR_TOKEN)
}

/**
 * Deterministic unavailable result for both build and repair callers. The options shape stays stable so a
 * future, separately reviewed isolated-runner adapter can replace this implementation without rewiring the
 * pipeline and repair lifecycle.
 */
export async function runWorktreeAgent(opts: {
  branch: string
  worktree: string // absolute worktree path (unique per task)
  prompt: string
  outcomeFile: string
  logName: string
  maxTurns: number
  budgetUsd: number
  log?: (m: string) => void
  onStep?: (s: AgentStep) => void // live progress: every tool call / line of prose, as it happens
}): Promise<WorktreeAgentResult> {
  void opts
  // Keep the action-boundary assertion in the result path so a future implementation cannot silently make
  // this callable merely by changing an outer UI/config gate.
  const isolation = connectorAgentIsolationReady()
  return {
    outcome: 'assessed',
    note: isolation
      ? 'Automatic connector coding is unavailable: no isolated-runner adapter is installed.'
      : 'Automatic connector coding agents are disabled until a network-enforced isolated runner is available; use the manual branch and pull-request workflow.',
  }
}
