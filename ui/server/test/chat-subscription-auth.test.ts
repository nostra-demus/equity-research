import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const parent = fileURLToPath(new URL('../../../.cache/finviz-model-tests/', import.meta.url))
await fs.mkdir(parent, { recursive: true })
const dir = await fs.mkdtemp(path.join(parent, 'subscription-'))
const auth = path.join(dir, 'auth.json'), marker = path.join(dir, 'inference-started')
const executable = path.join(dir, 'fake-codex.cjs')
process.env.CODEX_HOME = dir
process.env.CODEX_BIN = executable
process.env.NOSTRA_ENGINE_CONFIG_DIR = dir
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
await fs.writeFile(executable, `#!${process.execPath}
const fs = require('node:fs'), path = require('node:path');
if (process.argv[2] === 'login') {
 const mode = JSON.parse(fs.readFileSync(path.join(process.env.CODEX_HOME, 'auth.json'), 'utf8')).auth_mode;
 console.log(mode === 'chatgpt' ? 'Logged in using ChatGPT' : 'Logged in using an API key');
} else if (process.argv[2] === 'features') {
 console.log('shell_tool stable true');
} else {
 fs.writeFileSync(${JSON.stringify(marker)}, 'started');
 console.log(JSON.stringify({type: 'item.completed', item: {type: 'agent_message', text: 'Evidence-bound answer'}}));
 console.log(JSON.stringify({type: 'turn.completed'}));
}
`, { mode: 0o755 })
try {
 const { runChatTurn } = await import('../src/chat-llm')
 const turn = () => runChatTurn({ system: 'closed book', user: 'fixture', model: 'codex:gpt-5.6-sol', signal: new AbortController().signal, onToken: () => {} })
 await fs.writeFile(auth, JSON.stringify({ auth_mode: 'apikey', OPENAI_API_KEY: 'fixture-never-spend' }), { mode: 0o600 })
 const denied = await turn()
 assert.match(denied.error || '', /signed in/)
 await assert.rejects(fs.stat(marker), { code: 'ENOENT' }, 'API-key login must fail before the inference subprocess')
 await fs.writeFile(auth, JSON.stringify({ auth_mode: 'chatgpt' }), { mode: 0o600 })
 const allowed = await turn()
 assert.equal(allowed.error, undefined)
 assert.equal(await fs.readFile(marker, 'utf8'), 'started')
} finally { await fs.rm(dir, { recursive: true, force: true }) }
console.log('chat-subscription-auth: API-key auth is rejected before inference; ChatGPT snapshot accepted')
