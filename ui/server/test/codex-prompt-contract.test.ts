process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'

import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fg from 'fast-glob'
import matter from 'gray-matter'
import {
  CANONICAL_COMMAND_FRONTMATTER_KEYS,
  discoverCodexInstructionChain,
  discoverCanonicalAgents,
  expandClaudeArguments,
  loadCanonicalAgent,
  loadCanonicalCommand,
} from '../src/providers/prompt-loader'
import {
  canonicalAgentNameFromCodexNativePath,
  CODEX_PROJECT_DOC_MAX_BYTES,
  CODEX_PROJECT_DOC_HEADROOM_BYTES,
  CODEX_TOOL_MAP,
  codexAgentExecutionProfile,
  codexAgentLoaderName,
  codexNativeTaskName,
  mapCanonicalAgentModel,
  resolveCodexProfile,
} from '../src/providers/codex-contract'

const here = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(here, '../../..')

const agentsDoc = fs.readFileSync(path.join(repoRoot, 'AGENTS.md'))
const claudeDoc = fs.readFileSync(path.join(repoRoot, 'CLAUDE.md'))
const contributingDoc = fs.readFileSync(path.join(repoRoot, 'CONTRIBUTING.md'), 'utf8')
const codeownersDoc = fs.readFileSync(path.join(repoRoot, '.github', 'CODEOWNERS'), 'utf8')
const deployScript = fs.readFileSync(path.join(repoRoot, 'scripts', 'ops', 'deploy.sh'), 'utf8')
const commitRunScript = fs.readFileSync(path.join(repoRoot, 'scripts', 'commit-run.sh'), 'utf8')
assert.equal(claudeDoc.byteLength, agentsDoc.byteLength)
assert.ok(agentsDoc.byteLength > 32_768, 'guard fixture no longer proves the Codex default 32 KiB limit is insufficient')
assert.ok(agentsDoc.byteLength <= CODEX_PROJECT_DOC_MAX_BYTES)
const instructionChain = discoverCodexInstructionChain(repoRoot, repoRoot)
assert.ok(instructionChain.length > 0, 'Codex instruction discovery found no project documents')
assert.ok(instructionChain.some((doc) => doc.relativePath === 'AGENTS.md'))
const instructionBytes = instructionChain.reduce((total, doc) => total + doc.bytes, 0)
assert.ok(
  instructionBytes + CODEX_PROJECT_DOC_HEADROOM_BYTES <= CODEX_PROJECT_DOC_MAX_BYTES,
  `Codex instruction chain is ${instructionBytes} bytes; the required ${CODEX_PROJECT_DOC_HEADROOM_BYTES}-byte `
  + `runtime headroom would exceed project_doc_max_bytes=${CODEX_PROJECT_DOC_MAX_BYTES}`,
)
const normalizeTwinName = (doc: Buffer) => doc.toString('utf8').replaceAll('AGENTS.md', 'DOCTRINE.md').replaceAll('CLAUDE.md', 'DOCTRINE.md')
assert.equal(
  normalizeTwinName(agentsDoc),
  normalizeTwinName(claudeDoc),
  'AGENTS.md and CLAUDE.md may differ only in their own filename references',
)
const doctrineText = agentsDoc.toString('utf8')
assert.match(doctrineText, /## 31\. Production Engineering Reliability/)
assert.match(doctrineText, /An interactive code task is "done" only at an open, green, reviewed PR/)
assert.match(doctrineText, /The owner's scheduled merge routine may merge that ready\s+PR only through the protected path/)
assert.match(doctrineText, /Manual\/bootstrap deployment, restart, configuration, run mutation, paid canaries, and second/)
assert.match(doctrineText, /The deployed filesystem and service topology is part of the launch contract\./)
assert.match(doctrineText, /The owner's separately configured scheduled merge routine is the sole standing merge actor\./)
assert.match(doctrineText, /Its normal terminal state is an open, green, reviewed PR\./)
assert.match(doctrineText, /PR ready for the scheduled merge routine; not merged or manually deployed/)
assert.match(doctrineText, /Production may be inspected read-only to diagnose a reported problem\./)
assert.doesNotMatch(doctrineText, /Autonomous merge authority|self-merge|self-merges|no human approval is required/i)
assert.match(contributingDoc, /## Permanent production-engineering standard \(Claude, Codex, humans\)/)
assert.match(contributingDoc, /## The engine's PR agent prepares the whole PR, then stops/)
assert.match(contributingDoc, /only the narrow scheduled merge routine may act on that ready state/)
assert.match(contributingDoc, /A merge deploys only after exact five-job push CI/)
assert.match(codeownersDoc, /^\* @ceekay-munshot$/m)
assert.match(deployScript, /ensure_deploy_authorization "\$REMOTE"/)
assert.match(deployScript, /record_deploy_audit "\$target" "\$AUTHORIZED_CODE_COMMIT"/)
assert.match(deployScript, /consume_deploy_authorization "\$REMOTE" "\$AUTHORIZED_CODE_COMMIT"/)
assert.doesNotMatch(commitRunScript, /git rebase -q origin\/main/)
assert.match(commitRunScript, /reconcile_without_checkout_update/)
assert.doesNotMatch(contributingDoc, /Autonomous merge authority|self-merge|self-merges/i)
const providerTransparentContract = fs.readFileSync(
  path.join(repoRoot, 'frameworks', 'PROVIDER_TRANSPARENT_COCKPIT.md'),
  'utf8',
)
assert.match(providerTransparentContract, /configured repo-root `data\/` projection/)
assert.match(providerTransparentContract, /before provider spawn or spend/)
for (const requiredContract of [
  'Start from the product invariant and trace the whole path',
  'Close the failure class, not one incident',
  'Prove the state machine, including failure and recovery',
  '"Done" is scoped to the authority granted',
  'Make each material lesson durable',
]) {
  assert.ok(
    contributingDoc.includes(requiredContract),
    `CONTRIBUTING.md lost the permanent engineering contract section: ${requiredContract}`,
  )
}
const doctrineTail = agentsDoc.toString('utf8').trimEnd().split(/\r?\n/).at(-1) || ''
assert.match(doctrineTail, /The twins must match\./, 'tail sentinel missing: Codex may have received a truncated doctrine')
assert.equal(expandClaudeArguments('plain=$ARGUMENTS braced=${ARGUMENTS} default=${ARGUMENTS:-all}', 'ABC'), 'plain=ABC braced=ABC default=ABC')
assert.equal(expandClaudeArguments('default=${ARGUMENTS:-all}', ''), 'default=all')

const commandFiles = fg.sync('.claude/commands/**/*.md', { cwd: repoRoot, absolute: true, onlyFiles: true }).sort()
assert.ok(commandFiles.length > 0)
for (const file of commandFiles) {
  const rel = path.relative(repoRoot, file).split(path.sep).join('/')
  const parsed = matter(fs.readFileSync(file, 'utf8'))
  assert.deepEqual(
    Object.keys(parsed.data).sort(),
    [...CANONICAL_COMMAND_FRONTMATTER_KEYS].sort(),
    `${rel}: command frontmatter vocabulary changed without a Codex contract decision`,
  )
  const [, namespace, command] = rel.match(/^\.claude\/commands\/([^/]+)\/([^/]+)\.md$/) || []
  assert.ok(namespace && command, `${rel}: canonical command path must be namespace/name.md`)
  const loaded = loadCanonicalCommand(`/${namespace}:${command} __CODEX_ARGS__`, repoRoot)
  assert.ok(loaded.allowedTools.length > 0)
  for (const tool of loaded.allowedTools) assert.ok(tool in CODEX_TOOL_MAP, `${rel}: ${tool} is unmapped`)
  assert.doesNotMatch(loaded.content, /\$\{?ARGUMENTS\}?/, `${rel}: $ARGUMENTS expansion was incomplete`)
}

const agents = discoverCanonicalAgents(repoRoot)
assert.ok(agents.length >= 100, 'canonical dynamic agent roster unexpectedly collapsed')
assert.equal(new Set(agents.map((agent) => agent.name)).size, agents.length, 'canonical agent names must be globally unique')
for (const agent of agents) {
  const nativeTaskName = codexNativeTaskName(agent.name)
  assert.equal(
    canonicalAgentNameFromCodexNativePath(`/root/${nativeTaskName}`),
    agent.name,
    `${agent.name}: native task-name mapping must remain reversible`,
  )
  assert.equal(loadCanonicalAgent(agent.name, repoRoot).sourcePath, agent.sourcePath)
  for (const tool of agent.tools) assert.ok(tool in CODEX_TOOL_MAP, `${agent.name}: ${tool} is unmapped`)
  if (agent.model) {
    assert.ok(mapCanonicalAgentModel(agent.model), `${agent.name}: canonical model alias '${agent.model}' has no Codex mapping`)
  }
  const role = codexAgentExecutionProfile(agent)
  const basename = path.basename(agent.sourcePath)
  const adjudicator = agent.name === 'synthesizer' || /^99_/.test(basename) || agent.model === 'opus'
  assert.deepEqual(
    { model: role.model, reasoningLevel: role.reasoningLevel, loader: codexAgentLoaderName(agent) },
    adjudicator
      ? { model: 'gpt-5.6-sol', reasoningLevel: 'max', loader: 'claude-adjudicator-loader' }
      : { model: 'gpt-5.6-terra', reasoningLevel: 'xhigh', loader: 'claude-specialist-loader' },
    `${agent.name}: convention-based Codex role mapping changed`,
  )
}
for (const memoName of ['memo-writer', 'module-memo-writer']) {
  const memo = loadCanonicalAgent(memoName, repoRoot)
  assert.equal(memo.model, 'opus', `${memoName}: fixture no longer proves canonical model precedence`)
  assert.deepEqual(codexAgentExecutionProfile(memo), {
    model: 'gpt-5.6-sol', reasoningLevel: 'max', role: 'adjudicator',
    profileKey: 'sol-max', label: 'GPT-5.6 Sol · Max', aliases: ['sol', 'sol-max', 'gpt-5.6-sol'],
  })
}
const solOnly = resolveCodexProfile({ profileKey: 'codex|gpt-5.6-sol:max|gpt-5.6-sol:max' })
const ordinarySpecialist = agents.find((agent) => !agent.model && agent.name !== 'synthesizer' && !/^99_/.test(path.basename(agent.sourcePath)))!
assert.deepEqual(codexAgentExecutionProfile(ordinarySpecialist, solOnly), {
  model: 'gpt-5.6-sol', reasoningLevel: 'max', role: 'specialist',
})
assert.equal(codexAgentLoaderName(ordinarySpecialist, solOnly), 'claude-sol-specialist-loader')
assert.deepEqual(codexAgentExecutionProfile({
  name: 'future-memo-writer', sourcePath: path.join(repoRoot, '.claude/agents/future-memo-writer.md'),
}, solOnly), {
  model: 'gpt-5.6-sol', reasoningLevel: 'max', role: 'specialist',
}, 'a future unpinned memo role must inherit the selected profile rather than silently falling back to Terra')
const solOnlyCommand = loadCanonicalCommand('/research:full TEST', repoRoot, solOnly)
assert.match(solOnlyCommand.prompt, /specialists, and triage use gpt-5\.6-sol at max/)
assert.match(solOnlyCommand.prompt, /use claude-sol-specialist-loader/)
assert.equal(codexAgentExecutionProfile({
  name: 'future-opus-role', sourcePath: path.join(repoRoot, '.claude/agents/future-opus-role.md'), model: 'opus',
}).role, 'adjudicator', 'generic opus aliases must remain Sol unless the role is unambiguously memo-only')
assert.throws(() => codexAgentExecutionProfile({
  name: 'memo-writer', sourcePath: path.join(repoRoot, '.claude/agents/memo-writer.md'), model: 'unknown-future-alias',
}), /has no Codex compatibility mapping/, 'memo role convention must not hide an unknown canonical model alias')

// Literal Task targets must resolve today. Dynamic targets stay zero-touch because the runtime resolves
// frontmatter name -> canonical path at execution time; this catches only hard-coded names that can rot.
const promptProgramFiles = fg.sync(['.claude/commands/**/*.md', '.claude/agents/**/*.md', 'frameworks/**/*.md'], {
  cwd: repoRoot, absolute: true, onlyFiles: true,
})
const literalTaskTargets = new Set<string>()
const literalTarget = /subagent_type\s*(?::|=|`\s*=)\s*["'`]([a-z][a-z0-9-]+)["'`]/g
for (const file of promptProgramFiles) {
  const raw = fs.readFileSync(file, 'utf8')
  for (const match of raw.matchAll(literalTarget)) literalTaskTargets.add(match[1])
}
assert.ok(literalTaskTargets.size > 0, 'expected literal Task targets in the canonical prompt-program')
for (const target of literalTaskTargets) assert.equal(loadCanonicalAgent(target, repoRoot).name, target)

const codexLoaderDir = path.join(repoRoot, '.codex', 'agents')
const loaderFiles = fg.sync('*.toml', { cwd: codexLoaderDir, absolute: true, onlyFiles: true }).sort()
const genericLoaders = {
  'claude-specialist-loader.toml': ['gpt-5.6-terra', 'xhigh'],
  'claude-sol-specialist-loader.toml': ['gpt-5.6-sol', 'max'],
  'claude-adjudicator-loader.toml': ['gpt-5.6-sol', 'max'],
} as const
for (const [loader, [model, reasoning]] of Object.entries(genericLoaders)) {
  const sourcePath = path.join(codexLoaderDir, loader)
  assert.ok(fs.existsSync(sourcePath), `${loader}: required generic compatibility loader is missing`)
  const raw = fs.readFileSync(sourcePath, 'utf8')
  assert.match(raw, new RegExp(`model = "${model.replaceAll('.', '\\.') }"`))
  assert.match(raw, new RegExp(`model_reasoning_effort = "${reasoning}"`))
}
assert.ok(!loaderFiles.some((file) => path.basename(file) === 'claude-agent-loader.toml'), 'ambiguous generic loader must not return')
for (const staleMemoLoader of ['memo-writer.toml', 'module-memo-writer.toml']) {
  assert.ok(
    !loaderFiles.some((file) => path.basename(file) === staleMemoLoader),
    `${staleMemoLoader}: named Terra loader would contradict canonical opus -> Sol/max precedence`,
  )
}
for (const file of loaderFiles) {
  const raw = fs.readFileSync(file, 'utf8')
  assert.ok(Buffer.byteLength(raw) < 2_048, `${path.basename(file)} must stay a thin loader, not a copied prompt`)
  assert.match(raw, /\.claude\/agents/, `${path.basename(file)} must point back to the canonical prompt tree`)
  assert.doesNotMatch(raw, /^sandbox_mode\s*=|^default_permissions\s*=/m,
    `${path.basename(file)} must inherit the parent's credential-deny permission profile`)
}

function availableCodexBinary(): string | null {
  const candidates = [
    process.env.CODEX_BIN,
    '/Applications/ChatGPT.app/Contents/Resources/codex',
    'codex',
  ].filter((candidate): candidate is string => Boolean(candidate))
  for (const candidate of [...new Set(candidates)]) {
    const probe = spawnSync(candidate, ['--version'], { encoding: 'utf8', timeout: 5_000 })
    if (!probe.error && probe.status === 0 && /^codex-cli\s+\S+/i.test(`${probe.stdout}\n${probe.stderr}`.trim())) return candidate
  }
  return null
}

const codexBinary = availableCodexBinary()
let promptInputGate = 'skipped (Codex CLI unavailable)'
if (codexBinary) {
  const probeMarker = 'NOSTRA_PROMPT_TAIL_PROBE'
  const promptInput = spawnSync(codexBinary, [
    '--cd', repoRoot,
    '--config', `project_doc_max_bytes=${CODEX_PROJECT_DOC_MAX_BYTES}`,
    'debug', 'prompt-input', probeMarker,
  ], { encoding: 'utf8', timeout: 20_000, maxBuffer: 2 * 1024 * 1024 })
  assert.equal(
    promptInput.status,
    0,
    `codex debug prompt-input failed: ${String(promptInput.error?.message || promptInput.stderr || promptInput.stdout).slice(0, 500)}`,
  )
  assert.doesNotMatch(
    String(promptInput.stderr || ''),
    /truncat|instruction.{0,40}budget|project[_ -]?doc.{0,40}(?:limit|exceed|large)|document.{0,40}(?:too large|exceed)/i,
    'Codex reported a project-instruction budget/truncation warning',
  )
  let renderedPrompt: unknown
  assert.doesNotThrow(() => { renderedPrompt = JSON.parse(String(promptInput.stdout || '')) }, 'prompt-input output must be strict JSON')
  const serializedPrompt = JSON.stringify(renderedPrompt)
  assert.match(serializedPrompt, /The twins must match\./, 'actual Codex model input omitted the AGENTS.md tail sentinel')
  assert.match(serializedPrompt, new RegExp(probeMarker), 'actual Codex model input omitted the probe prompt')
  promptInputGate = 'verified by codex debug prompt-input'
}

console.log(
  `codex-prompt-contract.test.ts: ${commandFiles.length} commands, ${agents.length} agents, `
  + `${literalTaskTargets.size} literal Task targets, ${instructionBytes}-byte instruction chain + headroom, ${promptInputGate}`,
)
