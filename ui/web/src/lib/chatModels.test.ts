import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { CHAT_MODELS, CHAT_MODEL_STORAGE_KEY, chatModelChoices, chatModelLabel, chatModelsReadAfterFailure, normalizeChatModelsRead, readChatModel, saveChatModel } from './chatModels'

assert.equal(CHAT_MODELS.filter((choice) => choice.provider === 'claude').length, 3)
assert.deepEqual(CHAT_MODELS.filter((choice) => choice.provider === 'codex').map((choice) => choice.label), [
  'GPT-5.6 Sol', 'GPT-5.6 Terra', 'GPT-5.6 Luna',
])
assert.equal(chatModelLabel('codex:gpt-5.6-sol'), 'GPT-5.6 Sol')
assert.equal(chatModelLabel('retired-model'), 'retired-model', 'saved unknown ids stay visible rather than being mislabeled')
assert.deepEqual(normalizeChatModelsRead({ models: ['sonnet', 'codex:gpt-5.6-sol'], defaultModel: 'codex:gpt-5.6-sol' }), {
  models: ['sonnet', 'codex:gpt-5.6-sol'], defaultModel: 'codex:gpt-5.6-sol',
})
assert.equal(normalizeChatModelsRead({ models: ['unreviewed:model'], defaultModel: 'unreviewed:model' }), null,
  'the browser never trusts an unreviewed server model id')
assert.deepEqual(normalizeChatModelsRead({ models: ['unreviewed:model', 'sonnet'], defaultModel: 'unreviewed:model' }), {
  models: ['sonnet'], defaultModel: 'sonnet',
}, 'one malformed catalogue row is quarantined without hiding valid Ask models')
const pinnedClaude = 'claude-sonnet-4-6-20260801'
assert.deepEqual(normalizeChatModelsRead({ models: [pinnedClaude], defaultModel: pinnedClaude }), {
  models: [pinnedClaude], defaultModel: pinnedClaude,
})
assert.deepEqual(chatModelChoices([pinnedClaude]), [{
  id: pinnedClaude, provider: 'claude', label: pinnedClaude, sub: 'host-configured Claude model',
}], 'a host-pinned concrete Claude model becomes a usable picker row')
const futureCodex = 'codex:gpt-6-super'
assert.deepEqual(normalizeChatModelsRead({ models: [futureCodex], defaultModel: futureCodex }), {
  models: [futureCodex], defaultModel: futureCodex,
}, 'an older client accepts a bounded Codex id only after the server publishes it')
assert.deepEqual(chatModelChoices([futureCodex]), [{
  id: futureCodex, provider: 'codex', label: 'gpt-6-super', sub: 'host-configured Codex model',
}], 'a newly server-reviewed Codex id stays in the Codex picker group during deploy skew')
assert.equal(chatModelLabel(futureCodex), 'gpt-6-super')
const priorCatalogue = { models: [pinnedClaude], defaultModel: pinnedClaude }
assert.deepEqual(chatModelsReadAfterFailure(Object.assign(new Error('temporary failure'), { status: 503 }), priorCatalogue), priorCatalogue,
  'a transient catalogue failure preserves the last truthful host choice')
assert.equal(chatModelsReadAfterFailure(new Error('timeout'), null), null,
  'an unknown live catalogue never invents legacy models after a transport failure')
assert.deepEqual(chatModelsReadAfterFailure(Object.assign(new Error('old server'), { status: 404 }), priorCatalogue), {
  models: ['sonnet', 'opus', 'haiku'], defaultModel: 'sonnet',
}, 'only a confirmed old-server endpoint receives the legacy Claude catalogue')

const values = new Map<string, string>()
const storage = {
  getItem: (key: string) => values.get(key) ?? null,
  setItem: (key: string, value: string) => { values.set(key, value) },
}
assert.equal(readChatModel(storage), 'sonnet')
saveChatModel('codex:gpt-5.6-terra', storage)
assert.equal(values.get(CHAT_MODEL_STORAGE_KEY), 'codex:gpt-5.6-terra')
assert.equal(readChatModel(storage), 'codex:gpt-5.6-terra', 'the Ask choice survives reloads and is shared by desktop/mobile')
saveChatModel(futureCodex, storage)
assert.equal(readChatModel(storage), futureCodex, 'a newer server-published Codex choice survives an older client reload')
saveChatModel('arbitrary:model', storage)
assert.equal(values.get(CHAT_MODEL_STORAGE_KEY), futureCodex, 'unknown provider ids never become a saved request')
saveChatModel(pinnedClaude, storage)
assert.equal(readChatModel(storage), pinnedClaude, 'a host-pinned Claude choice persists across reloads')
values.set(CHAT_MODEL_STORAGE_KEY, 'retired:model')
assert.equal(readChatModel(storage), 'sonnet', 'a stale local preference fails safely to the live default')
assert.equal(readChatModel({ getItem: () => { throw new DOMException('blocked', 'SecurityError') } }), 'sonnet')
assert.doesNotThrow(() => saveChatModel('sonnet', { setItem: () => { throw new DOMException('blocked', 'SecurityError') } }))

const src = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const desktop = fs.readFileSync(path.join(src, 'components/ChatPanel.tsx'), 'utf8')
const news = fs.readFileSync(path.join(src, 'components/screener/NewsChatPanel.tsx'), 'utf8')
const menu = fs.readFileSync(path.join(src, 'components/chat/ChatModelMenu.tsx'), 'utf8')
const mobile = fs.readFileSync(path.join(src, 'mobile/sheets/PrefsSheet.tsx'), 'utf8')
const availability = fs.readFileSync(path.join(src, 'lib/useChatModels.ts'), 'utf8')
const store = fs.readFileSync(path.join(src, 'lib/store.ts'), 'utf8')
assert.match(desktop, /<ChatModelMenu/, 'research/signal/commodity Ask uses the shared picker')
assert.match(news, /<ChatModelMenu/, 'the separate saved-news Ask drawer uses the shared picker')
assert.match(menu, /useChatModelChoices/, 'desktop Ask filters its picker through the host allow-list')
assert.match(mobile, /useChatModelChoices/, 'mobile Ask filters its picker through the same host allow-list')
assert.match(availability, /api\.chatModels\(\)/, 'all pickers read admitted models from the server')
assert.match(availability, /useRef\(model\)/, 'model changes use the current selection without restarting discovery')
assert.match(availability, /selected · unavailable on this host/, 'a temporarily unavailable selected model stays visible for a manual choice')
assert.doesNotMatch(availability, /onSelectRef|saveChatModel/, 'catalogue refresh never switches or persists another model automatically')
assert.match(menu, /disabled=\{choice\.disabled\}/, 'desktop prevents retrying an unavailable selected model until the user picks another')
assert.match(mobile, /disabled=\{m\.disabled\}/, 'mobile applies the same manual-only unavailable state')
assert.match(availability, /setTimeout/, 'a temporary catalogue outage retries without replacing the saved model')
assert.ok((store.match(/model: get\(\)\.chatModel/g) || []).length >= 2, 'research and news requests both send the selected model')
assert.match(store, /chatModel: c\.model \|\| get\(\)\.chatModel,[\s\S]*newsChatWindow:/, 'saved news History restores its exact model before the next turn')

console.log('chatModels: catalogue, persistence, every Ask surface, request routing, and History restore passed')
