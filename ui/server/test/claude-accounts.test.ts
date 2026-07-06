// Claude-account switch — pure-function unit tests against a temp config + state dir, so no key / network
// / install is needed. Run: npx tsx test/claude-accounts.test.ts
//
// The module (and its config/load-env deps) read the config dir at import, so we point the env at a temp
// dir and use a DYNAMIC import — static imports hoist above the env assignments, which would read the real
// ~/.config dir instead.
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-accts-'))
const CFG = path.join(TMP, 'config')
const ST = path.join(TMP, 'state')
fs.mkdirSync(CFG, { recursive: true })
fs.mkdirSync(ST, { recursive: true })
process.env.NOSTRA_ENGINE_CONFIG_DIR = CFG
process.env.ENGINE_STATE_DIR = ST
delete process.env.CLAUDE_CODE_OAUTH_TOKEN
delete process.env.ANTHROPIC_API_KEY

const acct = await import('../src/claude-accounts')
const REG = path.join(CFG, 'claude-accounts.json')

function writeRegistry(obj: unknown): void {
  fs.writeFileSync(REG, typeof obj === 'string' ? obj : JSON.stringify(obj))
  acct.__resetRegistryCacheForTests() // same path across tests → bust the mtime cache
}
function clearRegistry(): void {
  try { fs.unlinkSync(REG) } catch {}
  acct.__resetRegistryCacheForTests()
}

let passed = 0
async function check(name: string, fn: () => void | Promise<void>) {
  try {
    await fn()
    passed++
    console.log(`  ok  ${name}`)
  } catch (e: any) {
    console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`)
    process.exitCode = 1
  }
}

await check('no registry → empty list, host default, no token', () => {
  clearRegistry()
  acct.setActiveAccount(null)
  assert.deepEqual(acct.listClaudeAccounts(), [])
  assert.equal(acct.activeClaudeToken(), null)
  const st = acct.accountsState()
  assert.equal(st.activeId, null)
  assert.equal(st.accounts.length, 0)
  assert.match(st.configPath, /claude-accounts\.json$/)
})

await check('registry lists id+label only — tokens never leak', () => {
  writeRegistry({ accounts: [
    { id: 'ceekay', label: 'ceekay@muns.io', token: 'sk-ant-oat01-CEE' },
    { id: 'tech', label: 'tech@muns.io', token: 'sk-ant-oat01-TECH' },
  ] })
  const list = acct.listClaudeAccounts()
  assert.equal(list.length, 2)
  assert.deepEqual(list.map((a) => a.id), ['ceekay', 'tech'])
  for (const a of list) assert.ok(!('token' in a), 'list must not carry tokens')
  // accountsState is what the API returns to the browser — assert no token field anywhere in its JSON
  assert.ok(!/sk-ant-oat01/.test(JSON.stringify(acct.accountsState())), 'state must not carry tokens')
})

await check('default selection is host default (no token, env untouched)', () => {
  acct.setActiveAccount(null)
  assert.equal(acct.activeClaudeToken(), null)
  const env = { ANTHROPIC_API_KEY: 'api-key', FOO: 'bar' } as NodeJS.ProcessEnv
  acct.applyActiveClaudeAccount(env)
  assert.equal(env.CLAUDE_CODE_OAUTH_TOKEN, undefined, 'host default injects nothing')
  assert.equal(env.ANTHROPIC_API_KEY, 'api-key', 'host default leaves the api key alone')
  assert.equal(env.FOO, 'bar')
})

await check('switch to a named account injects its token + drops the api key', () => {
  const r = acct.setActiveAccount('tech')
  assert.equal(r.ok, true)
  assert.equal(r.activeId, 'tech')
  assert.equal(acct.activeClaudeToken(), 'sk-ant-oat01-TECH')
  const env = { ANTHROPIC_API_KEY: 'api-key', FOO: 'bar' } as NodeJS.ProcessEnv
  acct.applyActiveClaudeAccount(env)
  assert.equal(env.CLAUDE_CODE_OAUTH_TOKEN, 'sk-ant-oat01-TECH')
  assert.equal(env.ANTHROPIC_API_KEY, undefined, 'the chosen subscription token must win unambiguously')
  assert.equal(env.FOO, 'bar', 'unrelated env is preserved')
  const st = acct.accountsState()
  assert.equal(st.activeId, 'tech')
  assert.equal(st.activeLabel, 'tech@muns.io')
})

await check('switching persists across a re-read (survives restart)', () => {
  acct.setActiveAccount('ceekay')
  acct.__resetRegistryCacheForTests()
  assert.equal(acct.activeClaudeToken(), 'sk-ant-oat01-CEE')
  assert.equal(acct.accountsState().activeId, 'ceekay')
})

await check('unknown id is rejected and keeps the current selection', () => {
  acct.setActiveAccount('tech')
  const r = acct.setActiveAccount('does-not-exist')
  assert.equal(r.ok, false)
  assert.equal(r.error, 'unknown account')
  assert.equal(acct.activeClaudeToken(), 'sk-ant-oat01-TECH', 'a bad switch must not change the active account')
})

await check('a stale persisted id normalizes to host default', () => {
  // simulate an account removed from the registry after it was selected
  fs.writeFileSync(path.join(ST, 'claude-account.json'), JSON.stringify({ activeId: 'ceekay' }))
  writeRegistry({ accounts: [{ id: 'tech', label: 'tech@muns.io', token: 'sk-ant-oat01-TECH' }] })
  assert.equal(acct.activeClaudeToken(), null, 'unknown active id → host default token')
  assert.equal(acct.accountsState().activeId, null, 'unknown active id → normalized to host default')
})

await check('malformed / tokenless / duplicate rows are skipped', () => {
  writeRegistry({ accounts: [
    { id: 'good', label: 'Good', token: 'sk-ant-oat01-GOOD' },
    { id: 'notoken', label: 'No token' }, // dropped — no token
    { id: 'good', label: 'Dupe', token: 'sk-ant-oat01-DUP' }, // dropped — duplicate id
    { id: 'bad id!', label: 'Bad id', token: 'sk-ant-oat01-BAD' }, // dropped — invalid id
    { label: 'No id', token: 'sk-ant-oat01-NOID' }, // dropped — no id
  ] })
  const list = acct.listClaudeAccounts()
  assert.deepEqual(list.map((a) => a.id), ['good'])
})

await check('unparseable registry JSON → empty list (silent)', () => {
  writeRegistry('{ this is not json')
  assert.deepEqual(acct.listClaudeAccounts(), [])
  assert.equal(acct.activeClaudeToken(), null)
})

await check('hostDefaultAvailable reflects the host env', () => {
  clearRegistry()
  delete process.env.CLAUDE_CODE_OAUTH_TOKEN
  delete process.env.ANTHROPIC_API_KEY
  assert.equal(acct.accountsState().hostDefaultAvailable, false)
  process.env.CLAUDE_CODE_OAUTH_TOKEN = 'host-token'
  assert.equal(acct.accountsState().hostDefaultAvailable, true)
  delete process.env.CLAUDE_CODE_OAUTH_TOKEN
})

// cleanup
try { fs.rmSync(TMP, { recursive: true, force: true }) } catch {}
console.log(`\n${passed} checks passed`)
