import type { ResolvedProviderProfile } from './types'

export const CODEX_PROJECT_DOC_MAX_BYTES = 131_072
export const CODEX_PROJECT_DOC_HEADROOM_BYTES = 32_768

export const CODEX_TOOL_MAP = {
  Read: 'Read files with the native filesystem/shell tools.',
  Write: 'Write exact requested artifacts with apply_patch or a safe filesystem write.',
  Glob: 'Discover files with rg --files or an equivalent filesystem search.',
  Grep: 'Search file contents with rg or an equivalent filesystem search.',
  Bash: 'Run shell commands in the workspace-write sandbox.',
  WebSearch: 'Use the native live web-search tool.',
  WebFetch: 'Open and read the requested web source with the native web tool.',
  Task: 'Spawn, repeatedly wait for, and join Codex subagents through the convention-selected canonical-agent loader.',
} as const

export type CanonicalClaudeTool = keyof typeof CODEX_TOOL_MAP

export interface CodexModelContract {
  profileKey: 'sol-max' | 'terra-xhigh'
  model: 'gpt-5.6-sol' | 'gpt-5.6-terra'
  reasoningLevel: 'max' | 'xhigh'
  label: string
  aliases: readonly string[]
}

export const CODEX_MODEL_CONTRACTS: readonly CodexModelContract[] = [
  {
    profileKey: 'sol-max',
    model: 'gpt-5.6-sol',
    reasoningLevel: 'max',
    label: 'GPT-5.6 Sol · Max',
    aliases: ['sol', 'sol-max', 'gpt-5.6-sol'],
  },
  {
    profileKey: 'terra-xhigh',
    model: 'gpt-5.6-terra',
    reasoningLevel: 'xhigh',
    label: 'GPT-5.6 Terra · Extra high',
    aliases: ['terra', 'terra-xhigh', 'gpt-5.6-terra'],
  },
] as const

export const CODEX_PARENT_CONTRACT = CODEX_MODEL_CONTRACTS[0]
export const CODEX_SPECIALIST_CONTRACT = CODEX_MODEL_CONTRACTS[1]
export const CODEX_EXECUTION_PROFILE_KEY = 'codex|gpt-5.6-sol:max|gpt-5.6-terra:xhigh'
export const CODEX_SOL_ONLY_PROFILE_KEY = 'codex|gpt-5.6-sol:max|gpt-5.6-sol:max'
export const CODEX_SPECIALIST_LOADER = 'claude-specialist-loader'
export const CODEX_SOL_SPECIALIST_LOADER = 'claude-sol-specialist-loader'
export const CODEX_ADJUDICATOR_LOADER = 'claude-adjudicator-loader'

export const CODEX_EXECUTION_PROFILES = [
  {
    key: CODEX_EXECUTION_PROFILE_KEY,
    label: 'Sol + Terra',
    description: 'Balanced · Sol adjudication with Terra specialists',
    aliases: ['balanced', 'quality', CODEX_EXECUTION_PROFILE_KEY],
    parent: CODEX_PARENT_CONTRACT,
    specialist: CODEX_SPECIALIST_CONTRACT,
  },
  {
    key: CODEX_SOL_ONLY_PROFILE_KEY,
    label: 'Sol only',
    description: 'Highest quality · Sol at max reasoning for every stage',
    aliases: ['sol-only', 'max-quality', CODEX_SOL_ONLY_PROFILE_KEY],
    parent: CODEX_PARENT_CONTRACT,
    specialist: CODEX_PARENT_CONTRACT,
  },
] as const

const CANONICAL_AGENT_NAME_RE = /^[a-z0-9][a-z0-9-]*$/
const CODEX_NATIVE_TASK_PREFIX = 'nostra_'

/**
 * Codex's public JSONL stream can expose a native child only as a SubAgentActivity row. Bind that
 * otherwise prompt-free row to the canonical orb through a reversible task name, never a fuzzy suffix.
 * Canonical names already exclude underscores, so hyphen -> underscore is one-to-one and zero-touch.
 */
export function codexNativeTaskName(canonicalName: string): string {
  if (!CANONICAL_AGENT_NAME_RE.test(canonicalName)) {
    throw new Error(`Unsafe canonical Codex subagent name '${canonicalName}'.`)
  }
  return `${CODEX_NATIVE_TASK_PREFIX}${canonicalName.replaceAll('-', '_')}`
}

export function canonicalAgentNameFromCodexNativePath(agentPath: unknown): string | null {
  if (typeof agentPath !== 'string' || !agentPath.trim()) return null
  const basename = agentPath.replaceAll('\\', '/').split('/').filter(Boolean).at(-1) || ''
  if (!basename.startsWith(CODEX_NATIVE_TASK_PREFIX)) return null
  const encoded = basename.slice(CODEX_NATIVE_TASK_PREFIX.length)
  if (!/^[a-z0-9]+(?:_[a-z0-9]+)*$/.test(encoded)) return null
  const canonicalName = encoded.replaceAll('_', '-')
  return CANONICAL_AGENT_NAME_RE.test(canonicalName) ? canonicalName : null
}

/** Models named by the canonical Claude prompt-program, not by a cockpit provider picker. */
export const CLAUDE_AGENT_MODEL_MAP = {
  opus: { model: 'gpt-5.6-sol', reasoningLevel: 'max' },
} as const

function badProfile(message: string): never {
  const error: any = new Error(message)
  error.statusCode = 400
  error.code = 'CODEX_PROFILE_INVALID'
  throw error
}

export function resolveCodexProfile(request: { model?: string; reasoningLevel?: string; profileKey?: string }): ResolvedProviderProfile {
  const requestedModel = String(request.model || '').trim().toLowerCase()
  const requestedKey = String(request.profileKey || '').trim().toLowerCase()
  const selectedByKey = requestedKey
    ? CODEX_EXECUTION_PROFILES.find((profile) => profile.key === requestedKey || profile.aliases.includes(requestedKey as never))
    : undefined
  if (requestedKey && !selectedByKey) {
    badProfile(`Unsupported Codex execution profile '${request.profileKey}'.`)
  }
  const parentAliases = [...CODEX_PARENT_CONTRACT.aliases, CODEX_EXECUTION_PROFILE_KEY, 'quality']
  const selectedByAlias = !selectedByKey && requestedModel
    ? CODEX_EXECUTION_PROFILES.find((profile) => profile.aliases.includes(requestedModel as never))
    : undefined
  const selected = selectedByKey || selectedByAlias || CODEX_EXECUTION_PROFILES[0]
  if (selectedByKey && requestedModel && requestedModel !== selected.parent.model) {
    badProfile('Codex model and execution-profile key disagree.')
  }
  if (requestedModel && !parentAliases.includes(requestedModel) && !selectedByAlias) {
    badProfile(
      `Unsupported Codex parent model '${request.model}'. Cockpit adjudication is pinned to `
      + `${CODEX_PARENT_CONTRACT.model}; ${CODEX_SPECIALIST_CONTRACT.model} is assigned to specialists automatically.`,
    )
  }
  if (request.reasoningLevel && request.reasoningLevel !== selected.parent.reasoningLevel) {
    badProfile(
      `${selected.parent.model} is pinned to reasoning '${selected.parent.reasoningLevel}' for cockpit research; `
      + `received '${request.reasoningLevel}'.`,
    )
  }
  return {
    provider: 'codex',
    profileKey: selected.key,
    model: selected.parent.model,
    reasoningLevel: selected.parent.reasoningLevel,
    executionProfile: {
      key: selected.key,
      parentModel: selected.parent.model,
      parentReasoning: selected.parent.reasoningLevel,
      specialistModel: selected.specialist.model,
      specialistReasoning: selected.specialist.reasoningLevel,
    },
  }
}

export function mapCanonicalAgentModel(model: unknown): { model: string; reasoningLevel: string } | null {
  if (model === undefined || model === null || model === '') return null
  return CLAUDE_AGENT_MODEL_MAP[String(model).trim().toLowerCase() as keyof typeof CLAUDE_AGENT_MODEL_MAP] ?? null
}

export function codexAgentExecutionProfile(
  agent: { name: string; sourcePath: string; model?: string },
  executionProfile: ResolvedProviderProfile = resolveCodexProfile({}),
): {
  model: string
  reasoningLevel: string
  role: 'specialist' | 'adjudicator'
} {
  const basename = agent.sourcePath.replaceAll('\\', '/').split('/').at(-1) || ''
  const mappedModel = mapCanonicalAgentModel(agent.model)
  if (agent.model && !mappedModel) {
    const error: any = new Error(
      `${agent.sourcePath}: canonical model alias '${agent.model}' has no Codex compatibility mapping.`,
    )
    error.code = 'CODEX_AGENT_MODEL_UNMAPPED'
    throw error
  }
  // Canonical model declarations are authoritative. In particular, an opus memo remains Sol/max; the
  // memo-only Terra convention applies only when the canonical agent does not explicitly choose a tier.
  if (mappedModel) return { ...CODEX_PARENT_CONTRACT, role: 'adjudicator' }
  const memoOnly = agent.name === 'memo-writer'
    || agent.name === 'module-memo-writer'
    || /(?:^|[-_])memo-writer(?:\.md)?$/i.test(basename)
  if (memoOnly) {
    return {
      model: executionProfile.executionProfile.specialistModel!,
      reasoningLevel: executionProfile.executionProfile.specialistReasoning!,
      role: 'specialist',
    }
  }
  const adjudicator = agent.name === 'synthesizer' || /^99_/.test(basename)
  return adjudicator
    ? { model: executionProfile.executionProfile.parentModel!, reasoningLevel: executionProfile.executionProfile.parentReasoning!, role: 'adjudicator' }
    : { model: executionProfile.executionProfile.specialistModel!, reasoningLevel: executionProfile.executionProfile.specialistReasoning!, role: 'specialist' }
}

export function codexAgentLoaderName(
  agent: { name: string; sourcePath: string; model?: string },
  executionProfile: ResolvedProviderProfile = resolveCodexProfile({}),
): string {
  const role = codexAgentExecutionProfile(agent, executionProfile)
  if (role.role === 'adjudicator') return CODEX_ADJUDICATOR_LOADER
  return role.model === CODEX_PARENT_CONTRACT.model && role.reasoningLevel === CODEX_PARENT_CONTRACT.reasoningLevel
    ? CODEX_SOL_SPECIALIST_LOADER
    : CODEX_SPECIALIST_LOADER
}

const CODEX_COMPATIBILITY_PREAMBLE_TEMPLATE = `
CODEX / CLAUDE PROMPT-PROGRAM COMPATIBILITY CONTRACT

The canonical research program is the expanded .claude command body below. Follow it in full. Do not
look for or invoke a Codex slash command with the same name: Claude project slash commands are not Codex
commands. The server has already expanded every $ARGUMENTS and \${ARGUMENTS} placeholder exactly once.

Translate the canonical tool vocabulary without changing behavior:
${Object.entries(CODEX_TOOL_MAP).map(([tool, rule]) => `- ${tool}: ${rule}`).join('\n')}

Task compatibility is dynamic and path-based. When the program requests Task(subagent_type = NAME):
1. Find exactly one markdown file under .claude/agents/** whose YAML frontmatter name equals NAME.
2. Fail closed on zero matches or duplicate matches. Never substitute a similarly named agent.
3. Resolve the execution tier by convention, never by module name. Canonical model declarations take
   precedence: model: opus always uses gpt-5.6-sol at max, including memo roles. When no model is declared,
   memo-only roles (memo-writer and module-memo-writer), specialists, and triage use __SPECIALIST_MODEL__ at __SPECIALIST_REASONING__.
   Every 99_*.md synthesis and the root synthesizer/terminal adjudicator use gpt-5.6-sol at max.
4. Choose the project-scoped generic loader by the same convention: use __SPECIALIST_LOADER__ for
   every specialist, triage, or memo-only role; use claude-adjudicator-loader for every 99_*.md synthesis,
   the root synthesizer, and terminal adjudication. Spawn that loader with the exact model and reasoning
   tier above. In its message, provide the resolved
   canonical markdown path plus the Task message verbatim. Start that loader message with the exact line
   NOSTRA_SUBAGENT_TYPE: NAME so the cockpit can attribute the native subagent event to its canonical orb.
   Set the native spawn's task_name to exactly nostra_NAME with every hyphen in NAME replaced by one
   underscore (example: data-triage -> nostra_data_triage). Do not add a module, layer, ordinal, or any
   other prefix/suffix. This reversible name is required because some Codex JSONL versions expose only
   SubAgentActivity.agent_path, not the spawn prompt, while the child is live.
   The loader must read the WHOLE canonical file
   before acting. If that custom loader is unavailable, spawn the built-in default agent with the same
   path-and-message instruction AND explicitly set the same model and reasoning tier. Never copy the
   canonical agent body into the spawn message.
5. Preserve the command's requested parallelism, wait/join behavior, output path, verification, fail-fast,
   and no-git/commit contract exactly. A Task result is not complete until its required artifact is on disk.

SUBAGENT COMPLETION BARRIER — MANDATORY:
- Keep an explicit ledger of every native subagent you spawn in the current layer. A successful spawn call
  means only that the child was admitted; it does not mean the Task finished.
- Join every ledger entry to a terminal state. The native agent wait operation can return after only one
  child finishes or after a timeout, so call the collaboration wait/list operation again until every spawned
  child is terminal. Never use the unrelated exec-cell wait tool, a shell placeholder, or an assistant message
  as a substitute for the native collaboration wait operation.
- After each child reports completion, verify its exact required artifact exists, is non-placeholder, and passes
  the canonical post-write validation. A completed child with a missing or invalid artifact is a failed Task.
- Do not start a dependent layer or synthesis until the current layer has zero live/unresolved children and all
  required artifacts for that layer have passed validation. Preserve fail_fast exactly when a child fails.
- Before requesting publication or emitting any final assistant response, perform the barrier once more across
  the whole command: zero live/unresolved children, every required artifact present and valid, and every required
  synthesis/terminal record present. If a wait times out, wait again. If collaboration status is unavailable,
  fail explicitly and leave the run resumable; never say that work is "still in flight" and then end the turn.

Canonical agent frontmatter model alias opus means gpt-5.6-sol at max reasoning without a role exception.
An absent model follows the path-based role policy above.
No other Claude model alias may be guessed.

The source hierarchy, caps, schemas, file paths, commits, and research output contracts are provider-neutral.
Do not simplify, summarize, shorten, or reinterpret the canonical prompt-program for Codex.
`.trim()

export function codexCompatibilityPreamble(
  executionProfile: ResolvedProviderProfile = resolveCodexProfile({}),
): string {
  return CODEX_COMPATIBILITY_PREAMBLE_TEMPLATE
    .replaceAll('__SPECIALIST_MODEL__', executionProfile.executionProfile.specialistModel!)
    .replaceAll('__SPECIALIST_REASONING__', executionProfile.executionProfile.specialistReasoning!)
    .replaceAll('__SPECIALIST_LOADER__', executionProfile.executionProfile.specialistModel === CODEX_PARENT_CONTRACT.model
      ? CODEX_SOL_SPECIALIST_LOADER : CODEX_SPECIALIST_LOADER)
}

export const CODEX_COMPATIBILITY_PREAMBLE = codexCompatibilityPreamble()
