import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { CHAT_MODELS, CHAT_MODEL_STORAGE_KEY, chatModelLabel, readChatModel, saveChatModel } from './chatModels'

assert.equal(CHAT_MODELS.filter((choice) => choice.provider === 'claude').length, 3)
assert.deepEqual(CHAT_MODELS.filter((choice) => choice.provider === 'codex').map((choice) => choice.label), [
  'GPT-5.6 Sol', 'GPT-5.6 Terra', 'GPT-5.6 Luna',
])
assert.equal(chatModelLabel('codex:gpt-5.6-sol'), 'GPT-5.6 Sol')
assert.equal(chatModelLabel('retired-model'), 'retired-model', 'saved unknown ids stay visible rather than being mislabeled')

const values = new Map<string, string>()
const storage = {
  getItem: (key: string) => values.get(key) ?? null,
  setItem: (key: string, value: string) => { values.set(key, value) },
}
assert.equal(readChatModel(storage), 'sonnet')
saveChatModel('codex:gpt-5.6-terra', storage)
assert.equal(values.get(CHAT_MODEL_STORAGE_KEY), 'codex:gpt-5.6-terra')
assert.equal(readChatModel(storage), 'codex:gpt-5.6-terra', 'the Ask choice survives reloads and is shared by desktop/mobile')
saveChatModel('arbitrary:model', storage)
assert.equal(values.get(CHAT_MODEL_STORAGE_KEY), 'codex:gpt-5.6-terra', 'unknown model ids never become a saved request')
values.set(CHAT_MODEL_STORAGE_KEY, 'retired:model')
assert.equal(readChatModel(storage), 'sonnet', 'a stale local preference fails safely to the live default')

const src = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const desktop = fs.readFileSync(path.join(src, 'components/ChatPanel.tsx'), 'utf8')
const news = fs.readFileSync(path.join(src, 'components/screener/NewsChatPanel.tsx'), 'utf8')
const mobile = fs.readFileSync(path.join(src, 'mobile/sheets/PrefsSheet.tsx'), 'utf8')
const store = fs.readFileSync(path.join(src, 'lib/store.ts'), 'utf8')
assert.match(desktop, /<ChatModelMenu/, 'research/signal/commodity Ask uses the shared picker')
assert.match(news, /<ChatModelMenu/, 'the separate saved-news Ask drawer uses the shared picker')
assert.match(mobile, /CHAT_MODELS\.map/, 'mobile preferences expose the same complete catalogue')
assert.ok((store.match(/model: get\(\)\.chatModel/g) || []).length >= 2, 'research and news requests both send the selected model')
assert.match(store, /chatModel: c\.model \|\| get\(\)\.chatModel,[\s\S]*newsChatWindow:/, 'saved news History restores its exact model before the next turn')

console.log('chatModels: catalogue, persistence, every Ask surface, request routing, and History restore passed')
