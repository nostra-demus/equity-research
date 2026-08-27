import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { CHAT } from '../src/config'
import { CHAT_MODEL_SPECS, resolveChatModel } from '../src/chat-models'
import { buildCodexChatArgs, classifyCodexChatLine } from '../src/chat-llm'

const ids = CHAT_MODEL_SPECS.map((choice) => choice.id)
assert.deepEqual(ids, [
  'sonnet', 'opus', 'haiku',
  'codex:gpt-5.6-sol', 'codex:gpt-5.6-terra', 'codex:gpt-5.6-luna',
])
assert.deepEqual(CHAT.allowedModels, ids, 'the server allow-list exposes every reviewed Ask model by default')
assert.equal(new Set(ids).size, ids.length, 'Ask model ids are unique')
assert.equal(resolveChatModel('CODEX:GPT-5.6-SOL')?.provider, 'codex')
assert.equal(resolveChatModel('sonnet')?.provider, 'claude')
assert.equal(resolveChatModel('gpt-5.6-sol'), null, 'a bare GPT id cannot bypass explicit provider routing')

const sol = resolveChatModel('codex:gpt-5.6-sol')!
const root = '/tmp/nostra-chat-contract'
const system = 'Closed book. Use only the supplied context.'
const args = buildCodexChatArgs(sol, root, system)
const configs = args.flatMap((arg, index) => args[index - 1] === '--config' ? [arg] : [])
for (const required of [
  'model_provider="openai"',
  'model_reasoning_effort="medium"',
  'approval_policy="never"',
  'history.persistence="none"',
  'agents.enabled=false',
  'features.apps=false',
  'features.shell_tool=false',
  'features.unified_exec=false',
  'features.skill_mcp_dependency_install=false',
  'web_search="disabled"',
  'tools.web_search=false',
  'shell_environment_policy.inherit="none"',
]) assert.ok(configs.includes(required), `Codex chat must pin ${required}`)
assert.equal(JSON.parse(configs.find((value) => value.startsWith('developer_instructions='))!.slice('developer_instructions='.length)), system)
assert.ok(args.includes('--strict-config'))
assert.ok(args.includes('--skip-git-repo-check'))
assert.ok(args.includes('--ephemeral'))
assert.ok(args.includes('--ignore-user-config'))
assert.ok(args.includes('--ignore-rules'))
assert.equal(args[args.indexOf('--sandbox') + 1], 'read-only')
assert.equal(args[args.indexOf('--cd') + 1], root)
assert.equal(args.at(-1), '-', 'the potentially large context stays on stdin')
assert.ok(!args.includes('--search'), 'closed-book Ask never enables Codex search')

const parserArgs = buildCodexChatArgs(sol, root, system, true)
assert.ok(parserArgs.includes('model_reasoning_effort="low"'), 'the small what-if parser stays on light reasoning')

assert.deepEqual(classifyCodexChatLine({ type: 'thread.started', thread_id: 't1' }, sol.model), [{ kind: 'ready', model: sol.model }])
assert.deepEqual(classifyCodexChatLine({ type: 'item.started', item: { type: 'reasoning' } }, sol.model), [{ kind: 'thinking-start' }])
assert.deepEqual(classifyCodexChatLine({ type: 'item.completed', item: { type: 'reasoning', text: 'Checking the cited figures.' } }, sol.model), [{ kind: 'thinking', text: 'Checking the cited figures.' }])
assert.deepEqual(classifyCodexChatLine({ type: 'item.completed', item: { type: 'agent_message', text: 'The cited answer.' } }, sol.model), [
  { kind: 'answer-start' }, { kind: 'token', text: 'The cited answer.' },
])
assert.deepEqual(classifyCodexChatLine({ type: 'turn.completed' }, sol.model), [{ kind: 'result', costUsd: 0 }])
assert.match((classifyCodexChatLine({ type: 'turn.failed', error: { message: '401 authentication required' } }, sol.model)[0] as any).error, /codex session isn't signed in/i)
assert.match((classifyCodexChatLine({ type: 'error', message: '429 weekly usage limit' }, sol.model)[0] as any).error, /usage limit/i)

const here = path.dirname(fileURLToPath(import.meta.url))
const webCatalogue = fs.readFileSync(path.join(here, '../../web/src/lib/chatModels.ts'), 'utf8')
const webIds = [...webCatalogue.matchAll(/\{ id: '([^']+)', provider:/g)].map((match) => match[1])
assert.deepEqual(webIds, ids, 'server routing and every web picker use the same model ids')

console.log('chat-model-routing: provider routing, closed-book Codex launch, events, and web parity passed')
