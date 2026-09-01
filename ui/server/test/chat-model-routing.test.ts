import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { CHAT } from '../src/config'
import {
  CHAT_MODEL_SPECS,
  publicChatModelCatalogue,
  resolveAllowedChatModel,
  resolveChatModel,
  resolveChatRequestModel,
} from '../src/chat-models'
import { buildCodexChatArgs, classifyCodexChatLine, codexChatFeatureDisables, runChatTurn } from '../src/chat-llm'

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
assert.deepEqual(resolveAllowedChatModel('claude-sonnet-4-6-20260801', ['claude-sonnet-4-6-20260801']), {
  id: 'claude-sonnet-4-6-20260801', provider: 'claude', model: 'claude-sonnet-4-6-20260801',
}, 'a configured concrete Claude model id preserves the existing env-tunable escape hatch')
assert.equal(
  resolveAllowedChatModel('Claude-Sonnet-4-6-20260801', ['claude-sonnet-4-6-20260801'])?.id,
  'claude-sonnet-4-6-20260801',
  'mixed-case operator/client input resolves against the normalized concrete Claude allow-list',
)
assert.equal(resolveAllowedChatModel('SONNET', ['Sonnet'])?.id, 'sonnet',
  'direct callers cannot reintroduce case-sensitive allow-list mismatches')
assert.equal(resolveAllowedChatModel('codex:unreviewed-gpt', ['codex:unreviewed-gpt']), null)
assert.equal(resolveChatRequestModel('codex:gpt-5.6-sol', ['sonnet'], 'sonnet'), null,
  'an explicitly excluded model is rejected rather than silently becoming the default')
assert.equal(resolveChatRequestModel(undefined, ['sonnet'], 'sonnet')?.id, 'sonnet',
  'an omitted choice still receives the configured default')
assert.equal(resolveChatRequestModel(undefined, ['opus'], 'sonnet')?.id, 'opus',
  'an omitted choice uses the published allowed fallback when the configured default is excluded')
assert.deepEqual(publicChatModelCatalogue(['sonnet', 'haiku'], 'opus'), {
  models: ['sonnet', 'haiku'], defaultModel: 'sonnet',
}, 'the browser receives only reviewed models admitted by this host')
assert.deepEqual(publicChatModelCatalogue(['claude-sonnet-4-6-20260801'], 'claude-sonnet-4-6-20260801'), {
  models: ['claude-sonnet-4-6-20260801'], defaultModel: 'claude-sonnet-4-6-20260801',
}, 'a host-pinned concrete Claude model remains selectable instead of emptying the picker')
assert.deepEqual(publicChatModelCatalogue(['Sonnet', 'Claude-Sonnet-4-6-20260801'], 'SONNET'), {
  models: ['sonnet', 'claude-sonnet-4-6-20260801'], defaultModel: 'sonnet',
}, 'the published catalogue normalizes mixed-case direct configuration at the admission boundary')
assert.deepEqual(publicChatModelCatalogue(['unreviewed:model'], 'unreviewed:model'), { models: [], defaultModel: null },
  'the public response cannot invalidate the complete picker contract with an unreviewed id')

const sol = resolveChatModel('codex:gpt-5.6-sol')!
const root = '/tmp/nostra-chat-contract'
const system = 'Closed book. Use only the supplied context.'
const featureOutput = [
  'apps stable true',
  'browser_use stable true',
  'computer_use stable true',
  'image_generation stable true',
  'multi_agent stable true',
  'shell_tool stable true',
  'unified_exec stable true',
  'view_image stable true',
  'enable_request_compression stable true',
  'future_tool under development true',
  'preview_tool beta-preview true',
  'retired_tool removed true',
].join('\n')
const disabledFeatures = codexChatFeatureDisables(featureOutput)
assert.deepEqual(disabledFeatures, [
  'apps', 'browser_use', 'computer_use', 'future_tool', 'image_generation',
  'multi_agent', 'preview_tool', 'shell_tool', 'unified_exec', 'view_image',
])
const args = buildCodexChatArgs(sol, root, system, { disabledFeatures })
const configs = args.flatMap((arg, index) => args[index - 1] === '--config' ? [arg] : [])
for (const required of [
  'model_provider="openai"',
  'model_reasoning_effort="max"',
  'approval_policy="never"',
  'history.persistence="none"',
  'web_search="disabled"',
  'tools.web_search=false',
  'shell_environment_policy.inherit="none"',
]) assert.ok(configs.includes(required), `Codex chat must pin ${required}`)
const disabledArgs = args.flatMap((arg, index) => args[index - 1] === '--disable' ? [arg] : [])
assert.deepEqual(disabledArgs, disabledFeatures, 'every enabled model-callable feature is disabled through supported CLI flags')
assert.ok(!configs.some((value) => value.startsWith('agents.')), 'Ask never writes version-sensitive agent-role config')
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

const parserArgs = buildCodexChatArgs(sol, root, system, { parser: true, disabledFeatures })
assert.ok(parserArgs.includes('model_reasoning_effort="low"'), 'the small what-if parser stays on light reasoning')
const terra = resolveChatModel('codex:gpt-5.6-terra')!
assert.ok(buildCodexChatArgs(terra, root, system).includes('model_reasoning_effort="medium"'))
assert.ok(buildCodexChatArgs(terra, root, system, { parser: true }).includes('model_reasoning_effort="medium"'),
  'the parser uses the lightest configured effort that Terra supports rather than forcing low')

assert.deepEqual(classifyCodexChatLine({ type: 'thread.started', thread_id: 't1' }, sol.model), [{ kind: 'ready', model: sol.model }])
assert.deepEqual(classifyCodexChatLine({ type: 'item.started', item: { type: 'reasoning' } }, sol.model), [{ kind: 'thinking-start' }])
assert.deepEqual(classifyCodexChatLine({ type: 'item.completed', item: { type: 'reasoning', text: 'Checking the cited figures.' } }, sol.model), [{ kind: 'thinking', text: 'Checking the cited figures.' }])
assert.deepEqual(classifyCodexChatLine({ type: 'item.completed', item: { type: 'agent_message', text: 'The cited answer.' } }, sol.model), [
  { kind: 'answer-start' }, { kind: 'token', text: 'The cited answer.' },
])
assert.deepEqual(classifyCodexChatLine({ type: 'turn.completed' }, sol.model), [{ kind: 'result', costUsd: 0 }])
assert.match((classifyCodexChatLine({ type: 'turn.failed', error: { message: '401 authentication required' } }, sol.model)[0] as any).error, /codex session isn't signed in/i)
assert.deepEqual(classifyCodexChatLine({ type: 'error', message: 'Reconnecting... 2/5' }, sol.model), [], 'retry progress never poisons a later successful completion')

const allowedIndex = CHAT.allowedModels.indexOf(sol.id)
assert.notEqual(allowedIndex, -1)
CHAT.allowedModels.splice(allowedIndex, 1)
try {
  const denied = await runChatTurn({
    system,
    user: 'This must stop before spawning Codex.',
    model: sol.id,
    signal: new AbortController().signal,
    onToken: () => assert.fail('a model excluded by the configured allow-list must never stream'),
  })
  assert.match(denied.error || '', /not supported or allowed/i)
} finally {
  CHAT.allowedModels.splice(allowedIndex, 0, sol.id)
}

const here = path.dirname(fileURLToPath(import.meta.url))
const webCatalogue = fs.readFileSync(path.join(here, '../../web/src/lib/chatModels.ts'), 'utf8')
const webIds = [...webCatalogue.matchAll(/\{ id: '([^']+)', provider:/g)].map((match) => match[1])
assert.deepEqual(webIds, ids, 'server routing and every web picker use the same model ids')
const serverSource = fs.readFileSync(path.join(here, '../src/server.ts'), 'utf8')
assert.doesNotMatch(serverSource, /runNewsChatFallback|shouldUseNewsChatFallback|backup-provider/,
  'no Ask surface silently substitutes a backup provider after the user selects a model')
assert.match(serverSource, /Promise\.all\(\[newsPromise, callsPromise\]\)/,
  'independent Ask evidence shelves load together instead of serially delaying the selected model')
assert.match(serverSource, /chat-status', stage: 'sources'/,
  'research Ask exposes honest source-loading progress before the selected model starts')

console.log('chat-model-routing: provider routing, closed-book Codex launch, events, and web parity passed')
