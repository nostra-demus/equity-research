process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const code = "import('./src/config.ts').then((m) => process.stdout.write(String(m.NEWS.ideasEnabled)))"
function read(value: string | undefined): string {
  const env = { ...process.env }
  if (value === undefined) delete env.IDEAS_ENABLED
  else env.IDEAS_ENABLED = value
  const r = spawnSync(process.execPath, ['--import', 'tsx', '--input-type=module', '-e', code], { cwd: process.cwd(), env, encoding: 'utf8' })
  assert.equal(r.status, 0, r.stderr)
  return r.stdout
}

assert.equal(read(undefined), 'true', 'Ideas runs by default; the old opt-in default silently disabled production')
assert.equal(read('0'), 'false', 'IDEAS_ENABLED=0 remains the explicit kill switch')
assert.equal(read('1'), 'true')

const ageCode = "import('./src/config.ts').then((m) => process.stdout.write(String(m.NEWS.ideasInputMaxAgeHrs)))"
const ageEnv = { ...process.env, IDEAS_INPUT_MAX_AGE_HRS: '18' }
const age = spawnSync(process.execPath, ['--import', 'tsx', '--input-type=module', '-e', ageCode], { cwd: process.cwd(), env: ageEnv, encoding: 'utf8' })
assert.equal(age.status, 0, age.stderr)
assert.equal(age.stdout, '18', 'the source-age ceiling is independently configurable')

const providerCode = "import('./src/config.ts').then((m) => process.stdout.write(JSON.stringify({enabled:m.NEWS.enabled,configured:m.NEWS.providerConfigured,ideaConfigured:m.NEWS.ideaProviderConfigured,overflow:m.NEWS.overflowProviders.map((p)=>p.id)})))"
const providerEnvKeys = [
  'GROQ_API_KEY', 'CEREBRAS_API_KEY', 'MISTRAL_API_KEY', 'OPENROUTER_API_KEY', 'NVIDIA_API_KEY',
  'GEMINI_API_KEY', 'NEWS_LOCAL_ENABLED', 'NEWS_LOCAL_PRIMARY', 'NEWS_INGEST_ENABLED', 'NEWS_GEMINI_ENABLED',
  'NEWS_CEREBRAS_ENABLED', 'NEWS_MISTRAL_ENABLED', 'NEWS_OPENROUTER_ENABLED', 'NEWS_NVIDIA_ENABLED',
]
function isolatedProviderEnv(patch: Record<string, string> = {}): NodeJS.ProcessEnv {
  const env = { ...process.env, NOSTRA_ENGINE_CONFIG_DIR: path.join(os.tmpdir(), `missing-nostra-config-${process.pid}`) }
  for (const key of providerEnvKeys) delete env[key]
  Object.assign(env, patch)
  return env
}
function readProviderConfig(patch: Record<string, string> = {}): { enabled: boolean; configured: boolean; ideaConfigured: boolean; overflow: string[] } {
  const env = isolatedProviderEnv(patch)
  const r = spawnSync(process.execPath, ['--import', 'tsx', '--input-type=module', '-e', providerCode], { cwd: process.cwd(), env, encoding: 'utf8' })
  assert.equal(r.status, 0, r.stderr)
  return JSON.parse(r.stdout)
}

assert.deepEqual(readProviderConfig(), { enabled: false, configured: false, ideaConfigured: false, overflow: [] }, 'a providerless process stays idle')
assert.deepEqual(
  readProviderConfig({ MISTRAL_API_KEY: 'test-mistral' }),
  { enabled: true, configured: true, ideaConfigured: true, overflow: ['mistral'] },
  'an existing fallback provider activates the scheduler without a Groq key',
)
assert.deepEqual(
  readProviderConfig({ GEMINI_API_KEY: 'test-gemini' }),
  { enabled: true, configured: true, ideaConfigured: false, overflow: [] },
  'native Gemini can activate news triage but is never falsely advertised as callable by the OpenAI-compatible Ideas adapter',
)
assert.equal(
  readProviderConfig({ MISTRAL_API_KEY: 'test-mistral', NEWS_INGEST_ENABLED: '0' }).enabled,
  false,
  'the explicit scheduler kill switch remains authoritative',
)

// A Groq-less deployment must not treat the absent Groq ledger as fresh capacity. Once its only configured
// fallback is spent, the frequent backlog drain stays idle instead of churning the same no-progress batch.
const drainState = fs.mkdtempSync(path.join(os.tmpdir(), 'groqless-drain-'))
const today = new Date().toISOString().slice(0, 10)
fs.writeFileSync(path.join(drainState, 'mistral-budget.json'), JSON.stringify({ date: today, requests: 1, tokens: 0 }))
const drainCode = "import('./src/news/scheduler.ts').then((m) => process.stdout.write(String(m.budgetHasHeadroom(Date.now()))))"
const drain = spawnSync(process.execPath, ['--import', 'tsx', '--input-type=module', '-e', drainCode], {
  cwd: process.cwd(),
  env: isolatedProviderEnv({ MISTRAL_API_KEY: 'test-mistral', NEWS_MISTRAL_DAILY_REQ_CAP: '1', ENGINE_STATE_DIR: drainState }),
  encoding: 'utf8',
})
assert.equal(drain.status, 0, drain.stderr)
assert.equal(drain.stdout, 'false', 'an absent Groq key contributes no phantom drain headroom')
fs.rmSync(drainState, { recursive: true, force: true })
console.log('\n1 config-ideas test file passed')
