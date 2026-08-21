import fs from 'node:fs'
import path from 'node:path'
import fg from 'fast-glob'
import matter from 'gray-matter'
import { REPO_ROOT } from '../config'
import {
  CODEX_COMPATIBILITY_PREAMBLE,
  CODEX_PROJECT_DOC_HEADROOM_BYTES,
  CODEX_PROJECT_DOC_MAX_BYTES,
  CODEX_TOOL_MAP,
  codexAgentExecutionProfile,
  type CanonicalClaudeTool,
} from './codex-contract'

const SEGMENT_RE = /^[a-z0-9][a-z0-9-]*$/
export const CANONICAL_COMMAND_FRONTMATTER_KEYS = new Set(['description', 'argument-hint', 'allowed-tools'])
export const CANONICAL_AGENT_FRONTMATTER_KEYS = new Set([
  'name', 'description', 'tools', 'model', 'layer', 'fail_fast', 'depends_on', 'data_readiness',
  'emits_signal_evidence', 'signal_families',
])

export interface CanonicalCommand {
  namespace: string
  command: string
  arguments: string
  sourcePath: string
  description: string
  argumentHint: string
  allowedTools: CanonicalClaudeTool[]
  content: string
  prompt: string
}

export interface CanonicalAgentSpec {
  name: string
  sourcePath: string
  tools: CanonicalClaudeTool[]
  model?: string
}

export interface CodexInstructionDocument {
  sourcePath: string
  relativePath: string
  bytes: number
}

function contractError(code: string, message: string): never {
  const error: any = new Error(message)
  error.statusCode = 500
  error.code = code
  throw error
}

function assertKnownKeys(data: Record<string, unknown>, allowed: Set<string>, sourcePath: string): void {
  const unknown = Object.keys(data).filter((key) => !allowed.has(key))
  if (unknown.length) contractError('CANONICAL_FRONTMATTER_UNKNOWN', `${sourcePath}: unknown frontmatter key(s): ${unknown.join(', ')}`)
}

export function parseCanonicalTools(value: unknown, sourcePath: string): CanonicalClaudeTool[] {
  const raw = Array.isArray(value) ? value.map(String) : String(value || '').split(',')
  const tools = raw.map((tool) => tool.trim()).filter(Boolean)
  const unknown = tools.filter((tool) => !(tool in CODEX_TOOL_MAP))
  if (unknown.length) contractError('CODEX_TOOL_UNMAPPED', `${sourcePath}: no Codex compatibility mapping for: ${unknown.join(', ')}`)
  return [...new Set(tools)] as CanonicalClaudeTool[]
}

function parseCanonicalMatter(raw: string, sourcePath: string): matter.GrayMatterFile<string> {
  try { return matter(raw) } catch (error: any) {
    contractError('CANONICAL_FRONTMATTER_MALFORMED', `${sourcePath}: malformed YAML frontmatter: ${String(error?.message || error)}`)
  }
}

export function parseClaudeCommandInvocation(invocation: string): { namespace: string; command: string; arguments: string } {
  const match = invocation.match(/^\/([a-z0-9][a-z0-9-]*):([a-z0-9][a-z0-9-]*)(?:\s+([\s\S]*))?$/)
  if (!match) contractError('CANONICAL_COMMAND_INVALID', `Invalid canonical command invocation: ${JSON.stringify(invocation)}`)
  return { namespace: match[1], command: match[2], arguments: match[3] || '' }
}

export function expandClaudeArguments(content: string, args: string): string {
  return content
    .replace(/\$\{ARGUMENTS:-([^}]*)\}/g, (_match, fallback: string) => args || fallback)
    .replace(/\$\{ARGUMENTS\}|\$ARGUMENTS/g, args)
}

function commandPath(repoRoot: string, namespace: string, command: string): string {
  if (!SEGMENT_RE.test(namespace) || !SEGMENT_RE.test(command)) {
    contractError('CANONICAL_COMMAND_INVALID', `Unsafe canonical command name '${namespace}:${command}'.`)
  }
  const commandsRoot = path.resolve(repoRoot, '.claude', 'commands')
  const candidate = path.resolve(commandsRoot, namespace, `${command}.md`)
  if (!candidate.startsWith(`${commandsRoot}${path.sep}`)) {
    contractError('CANONICAL_COMMAND_INVALID', `Canonical command escaped .claude/commands: ${namespace}:${command}`)
  }
  return candidate
}

function assertCanonicalRealpath(candidate: string, canonicalRoot: string, label: string): string {
  let realRoot: string
  let realCandidate: string
  try {
    realRoot = fs.realpathSync(canonicalRoot)
    realCandidate = fs.realpathSync(candidate)
  } catch {
    contractError('CANONICAL_SOURCE_MISSING', `${label} does not exist or cannot be resolved: ${candidate}`)
  }
  if (realCandidate !== realRoot && !realCandidate.startsWith(`${realRoot}${path.sep}`)) {
    contractError('CANONICAL_SOURCE_ESCAPE', `${label} resolved outside its canonical prompt tree: ${candidate}`)
  }
  return realCandidate
}

export function loadCanonicalCommand(invocation: string, repoRoot: string = REPO_ROOT): CanonicalCommand {
  const parsedInvocation = parseClaudeCommandInvocation(invocation)
  const sourcePath = commandPath(repoRoot, parsedInvocation.namespace, parsedInvocation.command)
  if (!fs.existsSync(sourcePath)) {
    contractError('CANONICAL_COMMAND_MISSING', `Canonical command not found: ${path.relative(repoRoot, sourcePath)}`)
  }
  const resolvedSourcePath = assertCanonicalRealpath(
    sourcePath,
    path.resolve(repoRoot, '.claude', 'commands'),
    'Canonical command',
  )
  const raw = fs.readFileSync(resolvedSourcePath, 'utf8')
  const parsed = parseCanonicalMatter(raw, path.relative(repoRoot, resolvedSourcePath))
  const data = (parsed.data || {}) as Record<string, unknown>
  assertKnownKeys(data, CANONICAL_COMMAND_FRONTMATTER_KEYS, path.relative(repoRoot, resolvedSourcePath))
  for (const required of CANONICAL_COMMAND_FRONTMATTER_KEYS) {
    if (!(required in data)) contractError('CANONICAL_FRONTMATTER_MISSING', `${path.relative(repoRoot, resolvedSourcePath)}: missing '${required}'.`)
  }
  const allowedTools = parseCanonicalTools(data['allowed-tools'], path.relative(repoRoot, resolvedSourcePath))
  if (!allowedTools.length) contractError('CANONICAL_TOOLS_EMPTY', `${path.relative(repoRoot, resolvedSourcePath)}: 'allowed-tools' must not be empty.`)
  const content = expandClaudeArguments(parsed.content, parsedInvocation.arguments)
  const relativeSource = path.relative(repoRoot, resolvedSourcePath).split(path.sep).join('/')
  const prompt = [
    CODEX_COMPATIBILITY_PREAMBLE,
    '',
    `CANONICAL COMMAND SOURCE: ${relativeSource}`,
    `DECLARED TOOLS: ${allowedTools.join(', ')}`,
    'BEGIN CANONICAL COMMAND (expanded verbatim)',
    content,
    'END CANONICAL COMMAND',
  ].join('\n')
  return {
    ...parsedInvocation,
    sourcePath: resolvedSourcePath,
    description: String(data.description),
    argumentHint: String(data['argument-hint']),
    allowedTools,
    content,
    prompt,
  }
}

export function discoverCanonicalAgents(repoRoot: string = REPO_ROOT): CanonicalAgentSpec[] {
  const agentsRoot = path.resolve(repoRoot, '.claude', 'agents')
  const files = fg.sync('**/*.md', {
    cwd: agentsRoot,
    absolute: true,
    onlyFiles: true,
    followSymbolicLinks: false,
  }).sort()
  const agents: CanonicalAgentSpec[] = []
  for (const candidate of files) {
    const sourcePath = assertCanonicalRealpath(candidate, agentsRoot, 'Canonical agent')
    const relative = path.relative(repoRoot, sourcePath)
    const basename = path.basename(sourcePath)
    const raw = fs.readFileSync(sourcePath, 'utf8')
    if (basename === 'SWARM.md') continue // discovered swarm manifest, not an executable agent prompt
    // The only non-agent Markdown admitted under the canonical agent tree is explicit documentation.
    // Every other discovered file is executable prompt-program surface and must prove complete frontmatter.
    if (!raw.startsWith('---')) {
      if (/^(?:README|MODULE_RULES)\.md$/.test(basename)) continue
      contractError('CANONICAL_FRONTMATTER_MISSING', `${relative}: canonical agent file is missing YAML frontmatter.`)
    }
    const parsed = parseCanonicalMatter(raw, relative)
    const data = (parsed.data || {}) as Record<string, unknown>
    assertKnownKeys(data, CANONICAL_AGENT_FRONTMATTER_KEYS, relative)
    for (const required of ['name', 'description', 'tools']) {
      if (!(required in data)) contractError('CANONICAL_FRONTMATTER_MISSING', `${relative}: missing '${required}'.`)
    }
    const name = typeof data.name === 'string' ? data.name.trim() : ''
    if (!SEGMENT_RE.test(name)) contractError('CANONICAL_AGENT_NAME_INVALID', `${relative}: unsafe or empty canonical agent name '${String(data.name ?? '')}'.`)
    if (typeof data.description !== 'string' || !data.description.trim()) {
      contractError('CANONICAL_FRONTMATTER_INVALID', `${relative}: canonical agent description must be a non-empty string.`)
    }
    const tools = parseCanonicalTools(data.tools, relative)
    if (!tools.length) contractError('CANONICAL_TOOLS_EMPTY', `${relative}: canonical agent tools must not be empty.`)
    agents.push({
      name,
      sourcePath,
      tools,
      ...(data.model ? { model: String(data.model).trim() } : {}),
    })
  }
  const counts = new Map<string, number>()
  for (const agent of agents) counts.set(agent.name, (counts.get(agent.name) || 0) + 1)
  const duplicates = [...counts].filter(([, count]) => count !== 1).map(([name]) => name)
  if (duplicates.length) contractError('CANONICAL_AGENT_DUPLICATE', `Duplicate canonical agent name(s): ${duplicates.join(', ')}`)
  return agents
}

export function loadCanonicalAgent(name: string, repoRoot: string = REPO_ROOT): CanonicalAgentSpec {
  const matches = discoverCanonicalAgents(repoRoot).filter((agent) => agent.name === name)
  if (matches.length !== 1) {
    contractError('CANONICAL_AGENT_MISSING', `Expected exactly one canonical agent named '${name}', found ${matches.length}.`)
  }
  return matches[0]
}

/**
 * Mirror Codex project-instruction discovery: from the repository root to the launch cwd, load at most
 * one file per directory, preferring AGENTS.override.md over AGENTS.md. Realpath containment makes the
 * resulting byte budget a guard for the exact in-repository instruction chain, not a symlink escape.
 */
export function discoverCodexInstructionChain(
  cwd: string = REPO_ROOT,
  repoRoot: string = REPO_ROOT,
): CodexInstructionDocument[] {
  let realRoot: string
  let realCwd: string
  try {
    realRoot = fs.realpathSync(repoRoot)
    realCwd = fs.realpathSync(cwd)
  } catch {
    contractError('CODEX_INSTRUCTION_ROOT_MISSING', 'Codex instruction root or launch cwd cannot be resolved.')
  }
  if (realCwd !== realRoot && !realCwd.startsWith(`${realRoot}${path.sep}`)) {
    contractError('CODEX_INSTRUCTION_CWD_ESCAPE', `Codex launch cwd is outside the repository: ${cwd}`)
  }

  const relativeCwd = path.relative(realRoot, realCwd)
  const segments = relativeCwd ? relativeCwd.split(path.sep) : []
  const directories = [realRoot]
  for (let index = 1; index <= segments.length; index += 1) {
    directories.push(path.join(realRoot, ...segments.slice(0, index)))
  }

  const documents: CodexInstructionDocument[] = []
  for (const directory of directories) {
    const sourcePath = ['AGENTS.override.md', 'AGENTS.md']
      .map((name) => path.join(directory, name))
      .find((candidate) => fs.existsSync(candidate))
    if (!sourcePath) continue
    const resolved = assertCanonicalRealpath(sourcePath, realRoot, 'Codex instruction document')
    documents.push({
      sourcePath: resolved,
      relativePath: path.relative(realRoot, resolved).split(path.sep).join('/'),
      bytes: fs.statSync(resolved).size,
    })
  }
  return documents
}

/** Runtime fail-closed validation for the zero-touch canonical prompt program. */
export function validateCodexPromptProgram(repoRoot: string = REPO_ROOT): {
  commands: number
  agents: number
  literalTaskTargets: number
  instructionBytes: number
} {
  const instructionChain = discoverCodexInstructionChain(repoRoot, repoRoot)
  if (!instructionChain.length) {
    contractError('CODEX_INSTRUCTION_CHAIN_EMPTY', 'Codex discovered no project instruction documents.')
  }
  const instructionBytes = instructionChain.reduce((total, document) => total + document.bytes, 0)
  if (instructionBytes + CODEX_PROJECT_DOC_HEADROOM_BYTES > CODEX_PROJECT_DOC_MAX_BYTES) {
    contractError(
      'CODEX_INSTRUCTION_BUDGET_EXCEEDED',
      `Codex instruction chain is ${instructionBytes} bytes; ${CODEX_PROJECT_DOC_HEADROOM_BYTES} bytes of required `
      + `headroom would exceed project_doc_max_bytes=${CODEX_PROJECT_DOC_MAX_BYTES}.`,
    )
  }
  const commandFiles = fg.sync('**/*.md', {
    cwd: path.resolve(repoRoot, '.claude', 'commands'),
    absolute: true,
    onlyFiles: true,
    followSymbolicLinks: false,
  }).sort()
  for (const file of commandFiles) {
    const relative = path.relative(path.resolve(repoRoot, '.claude', 'commands'), file).split(path.sep).join('/')
    const match = relative.match(/^([a-z0-9][a-z0-9-]*)\/([a-z0-9][a-z0-9-]*)\.md$/)
    if (!match) contractError('CANONICAL_COMMAND_INVALID', `${relative}: canonical command path must be namespace/name.md`)
    loadCanonicalCommand(`/${match[1]}:${match[2]} __CODEX_RUNTIME_VALIDATION__`, repoRoot)
  }

  const agents = discoverCanonicalAgents(repoRoot)
  for (const agent of agents) codexAgentExecutionProfile(agent)

  const promptFiles = fg.sync(['.claude/commands/**/*.md', '.claude/agents/**/*.md', 'frameworks/**/*.md'], {
    cwd: repoRoot,
    absolute: true,
    onlyFiles: true,
    followSymbolicLinks: false,
  })
  const literalTaskTargets = new Set<string>()
  const literalTarget = /subagent_type\s*(?::|=|`\s*=)\s*["'`]([a-z][a-z0-9-]+)["'`]/g
  for (const file of promptFiles) {
    const raw = fs.readFileSync(file, 'utf8')
    for (const match of raw.matchAll(literalTarget)) literalTaskTargets.add(match[1])
  }
  for (const target of literalTaskTargets) loadCanonicalAgent(target, repoRoot)
  return { commands: commandFiles.length, agents: agents.length, literalTaskTargets: literalTaskTargets.size, instructionBytes }
}
