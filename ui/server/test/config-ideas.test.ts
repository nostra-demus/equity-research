process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const SERVER_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const code = "import('./src/config.ts').then((m) => process.stdout.write(String(m.NEWS.ideasEnabled)))"
function read(value: string | undefined): string {
  const env = { ...process.env }
  if (value === undefined) delete env.IDEAS_ENABLED
  else env.IDEAS_ENABLED = value
  const r = spawnSync(process.execPath, ['--import', 'tsx', '--input-type=module', '-e', code], { cwd: SERVER_DIR, env, encoding: 'utf8' })
  assert.equal(r.status, 0, r.stderr)
  return r.stdout
}

assert.equal(read(undefined), 'true', 'Ideas runs by default; the old opt-in default silently disabled production')
assert.equal(read('0'), 'false', 'IDEAS_ENABLED=0 remains the explicit kill switch')
assert.equal(read('1'), 'true')

const ageCode = "import('./src/config.ts').then((m) => process.stdout.write(String(m.NEWS.ideasInputMaxAgeHrs)))"
const ageEnv = { ...process.env, IDEAS_INPUT_MAX_AGE_HRS: '18' }
const age = spawnSync(process.execPath, ['--import', 'tsx', '--input-type=module', '-e', ageCode], { cwd: SERVER_DIR, env: ageEnv, encoding: 'utf8' })
assert.equal(age.status, 0, age.stderr)
assert.equal(age.stdout, '18', 'the source-age ceiling is independently configurable')

const providerCode = "import('./src/config.ts').then((m) => process.stdout.write(JSON.stringify({enabled:m.NEWS.enabled,configured:m.NEWS.providerConfigured,ideaConfigured:m.NEWS.ideaProviderConfigured,overflow:m.NEWS.overflowProviders.map((p)=>p.id)})))"
const openRouterCode = "import('./src/config.ts').then((m) => { const p=m.NEWS.overflowProviders.find((x)=>x.id==='openrouter'); process.stdout.write(JSON.stringify(p&&{model:p.model,models:p.models})) })"
const providerEnvKeys = [
  'GROQ_API_KEY', 'CEREBRAS_API_KEY', 'MISTRAL_API_KEY', 'OPENROUTER_API_KEY', 'NVIDIA_API_KEY',
  'GEMINI_API_KEY', 'NEWS_LOCAL_ENABLED', 'NEWS_LOCAL_PRIMARY', 'NEWS_INGEST_ENABLED', 'NEWS_GEMINI_ENABLED',
  'NEWS_CEREBRAS_ENABLED', 'NEWS_MISTRAL_ENABLED', 'NEWS_OPENROUTER_ENABLED', 'NEWS_NVIDIA_ENABLED',
  'NEWS_ANTHROPIC_FALLBACK_ENABLED', 'NEWS_ANTHROPIC_FALLBACK_MODE', 'NEWS_ANTHROPIC_FALLBACK_API_KEY',
]
function isolatedProviderEnv(patch: Record<string, string> = {}): NodeJS.ProcessEnv {
  const env = { ...process.env, NOSTRA_ENGINE_CONFIG_DIR: path.join(os.tmpdir(), `missing-nostra-config-${process.pid}`) }
  for (const key of providerEnvKeys) delete env[key]
  Object.assign(env, patch)
  return env
}
function readProviderConfig(patch: Record<string, string> = {}): { enabled: boolean; configured: boolean; ideaConfigured: boolean; overflow: string[] } {
  const env = isolatedProviderEnv(patch)
  const r = spawnSync(process.execPath, ['--import', 'tsx', '--input-type=module', '-e', providerCode], { cwd: SERVER_DIR, env, encoding: 'utf8' })
  assert.equal(r.status, 0, r.stderr)
  return JSON.parse(r.stdout)
}

function readOpenRouterConfig(patch: Record<string, string> = {}): { model: string; models: string[] } {
  const env = isolatedProviderEnv({ OPENROUTER_API_KEY: 'test-openrouter', ...patch })
  delete env.NEWS_OPENROUTER_MODELS
  if (patch.NEWS_OPENROUTER_MODELS !== undefined) env.NEWS_OPENROUTER_MODELS = patch.NEWS_OPENROUTER_MODELS
  const r = spawnSync(process.execPath, ['--import', 'tsx', '--input-type=module', '-e', openRouterCode], { cwd: SERVER_DIR, env, encoding: 'utf8' })
  assert.equal(r.status, 0, r.stderr)
  return JSON.parse(r.stdout)
}

assert.deepEqual(
  readProviderConfig(),
  { enabled: true, configured: true, ideaConfigured: false, overflow: [] },
  'the default Haiku subscription activates triage even when no free-provider key is configured',
)
assert.deepEqual(
  readProviderConfig({ NEWS_ANTHROPIC_FALLBACK_ENABLED: '0' }),
  { enabled: false, configured: false, ideaConfigured: false, overflow: [] },
  'a genuinely providerless process stays idle when Haiku is explicitly disabled',
)
assert.deepEqual(
  readProviderConfig({ NEWS_ANTHROPIC_FALLBACK_MODE: 'api' }),
  { enabled: false, configured: false, ideaConfigured: false, overflow: [] },
  'Anthropic API mode does not activate triage without its explicit API key',
)
assert.deepEqual(
  readProviderConfig({ NEWS_ANTHROPIC_FALLBACK_MODE: 'api', NEWS_ANTHROPIC_FALLBACK_API_KEY: 'test-anthropic' }),
  { enabled: true, configured: true, ideaConfigured: false, overflow: [] },
  'Anthropic API mode activates triage when its explicit API key is configured',
)
assert.deepEqual(
  readProviderConfig({ MISTRAL_API_KEY: 'test-mistral' }),
  { enabled: true, configured: true, ideaConfigured: true, overflow: ['mistral'] },
  'an existing fallback provider activates the scheduler without a Groq key',
)
assert.deepEqual(
  readProviderConfig({ GEMINI_API_KEY: 'test-gemini' }),
  { enabled: true, configured: true, ideaConfigured: true, overflow: [] },
  'native Gemini alone activates both news triage and the native Gemini Ideas adapter',
)
assert.equal(
  readProviderConfig({ MISTRAL_API_KEY: 'test-mistral', NEWS_INGEST_ENABLED: '0' }).enabled,
  false,
  'the explicit scheduler kill switch remains authoritative',
)

assert.deepEqual(
  readOpenRouterConfig(),
  { model: 'openrouter/free', models: ['openrouter/free'] },
  'OpenRouter defaults to the retirement-resistant official free router, not dated free-model slugs',
)
assert.deepEqual(
  readOpenRouterConfig({ NEWS_OPENROUTER_MODELS: 'vendor/primary:free, vendor/fallback:free' }),
  { model: 'vendor/primary:free', models: ['vendor/primary:free', 'vendor/fallback:free'] },
  'an explicit ordered OpenRouter model chain remains supported',
)

// A Groq-less deployment must not treat the absent Groq ledger as fresh capacity. Once its only configured
// fallback is spent, the frequent backlog drain stays idle instead of churning the same no-progress batch.
const drainState = fs.mkdtempSync(path.join(os.tmpdir(), 'groqless-drain-'))
const today = new Date().toISOString().slice(0, 10)
fs.writeFileSync(path.join(drainState, 'mistral-budget.json'), JSON.stringify({ date: today, requests: 1, tokens: 0 }))
const drainCode = "import('./src/news/scheduler.ts').then((m) => process.stdout.write(String(m.budgetHasHeadroom(Date.now()))))"
const drain = spawnSync(process.execPath, ['--import', 'tsx', '--input-type=module', '-e', drainCode], {
  cwd: SERVER_DIR,
  env: isolatedProviderEnv({ MISTRAL_API_KEY: 'test-mistral', NEWS_MISTRAL_DAILY_REQ_CAP: '1', ENGINE_STATE_DIR: drainState }),
  encoding: 'utf8',
})
assert.equal(drain.status, 0, drain.stderr)
assert.equal(drain.stdout, 'false', 'an absent Groq key contributes no phantom drain headroom')
fs.rmSync(drainState, { recursive: true, force: true })

// A workload-scoped Anthropic API failure is intentionally narrower than a shared provider outage, but it
// still blocks the only operation this drain would perform: Anthropic triage. The scheduler must see that
// marker too or it launches a no-progress drain every minute while runCycle immediately skips the held tier.
const anthropicDrainState = fs.mkdtempSync(path.join(os.tmpdir(), 'anthropic-workload-drain-'))
const anthropicDrainCode = `Promise.all([
  import('./src/news/scheduler.ts'), import('./src/news/triage/budget.ts')
]).then(([scheduler, budget]) => {
  const now = Date.now()
  budget.armCooldown(process.env.ENGINE_STATE_DIR, now, 1500000, 'triage:anthropic-triage', 1500000, 'triage-request')
  process.stdout.write(String(scheduler.anthropicHasHeadroom(now)))
})`
const anthropicDrain = spawnSync(process.execPath, ['--import', 'tsx', '--input-type=module', '-e', anthropicDrainCode], {
  cwd: SERVER_DIR,
  env: isolatedProviderEnv({
    ENGINE_STATE_DIR: anthropicDrainState,
    NEWS_ANTHROPIC_FALLBACK_ENABLED: '1',
    NEWS_ANTHROPIC_FALLBACK_MODE: 'api',
    NEWS_ANTHROPIC_FALLBACK_API_KEY: 'test-anthropic',
  }),
  encoding: 'utf8',
})
assert.equal(anthropicDrain.status, 0, anthropicDrain.stderr)
assert.equal(anthropicDrain.stdout, 'false', 'an active triage-only Anthropic hold suppresses a no-progress backlog drain')
fs.rmSync(anthropicDrainState, { recursive: true, force: true })

// Title ingestion and the lead skim are independent feature gates. A standalone pass owns the provider
// lease and may safely process a fresh persisted sweep even when NEWS_INGEST_ENABLED=0; the scheduler must
// not turn that into the old `ingester_disabled` no-op.
const ideasOnlyRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ideas-only-disabled-ingester-'))
const ideasOnlyState = path.join(ideasOnlyRoot, '.state')
const writeFreshSweep = (root: string, prefix: string) => {
  const stamp = new Date().toISOString(); const day = stamp.slice(0, 10)
  const inbox = path.join(root, 'screener', 'inbox')
  fs.mkdirSync(inbox, { recursive: true })
  fs.writeFileSync(path.join(inbox, `${day}_sweep.json`), JSON.stringify({ updated_at: stamp, rows: [0, 1].map((i) => ({
    headline: `Company ${i} files a material update`, url: `https://example.test/${prefix}-${i}`,
    source_name: 'Exchange', found_at: stamp, triage_score: 90 - i,
    companies: [{ name: `Company ${i}`, ticker: `IO${i}`, listing_country: 'US' }],
  })) }))
}
writeFreshSweep(ideasOnlyRoot, 'ideas-only')
const ideasOnly = spawnSync(process.execPath, ['--import', 'tsx', 'src/news/ingest-once.ts'], {
  cwd: SERVER_DIR,
  env: isolatedProviderEnv({
    ENGINE_REPO_ROOT: ideasOnlyRoot, ENGINE_STATE_DIR: ideasOnlyState,
    NEWS_INGEST_ENABLED: '0', IDEAS_ENABLED: '1', THEMES_ENABLED: '0',
    GROQ_API_KEY: 'test-key', GROQ_BASE_URL: 'http://127.0.0.1:1',
    NEWS_ANTHROPIC_FALLBACK_ENABLED: '0',
  }),
  encoding: 'utf8', timeout: 15_000,
})
assert.equal(ideasOnly.status, 0, ideasOnly.stderr)
const ideasOnlyJson = ideasOnly.stdout.split(/\r?\n/).find((line) => line.trim().startsWith('{'))
assert.ok(ideasOnlyJson, ideasOnly.stdout)
const ideasOnlyResult = JSON.parse(ideasOnlyJson!)
assert.equal(ideasOnlyResult.skipped, 'news_disabled')
assert.notEqual(ideasOnlyResult.idea_pass?.reason_code, 'ingester_disabled', 'the standalone owner reaches provider routing')
assert.equal(fs.existsSync(path.join(ideasOnlyState, 'news-ingester.lock')), true, 'the standalone Ideas-only pass uses the provider lease')
fs.rmSync(ideasOnlyRoot, { recursive: true, force: true })

// The always-on server follows the same contract. It must retain the provider lease and run its first
// Ideas tick even though title fetching is off, rather than writing a permanent ingester_disabled state.
const serverIdeasRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ideas-only-server-'))
const serverIdeasState = path.join(serverIdeasRoot, '.state')
writeFreshSweep(serverIdeasRoot, 'ideas-only-server')
const serverIdeasCode = `Promise.all([
  import('./src/news/scheduler.ts'), import('./src/news/ideas/ideas-health.ts')
]).then(async ([scheduler, health]) => {
  scheduler.startNewsIngester()
  await new Promise((resolve) => setTimeout(resolve, 5600))
  const record = health.readIdeasHealth(process.env.ENGINE_STATE_DIR, process.env.ENGINE_REPO_ROOT, true, Date.now())
  const allowed = scheduler.newsProviderSpendingAllowed()
  scheduler.stopNewsIngester()
  process.stdout.write('SERVER_IDEAS=' + JSON.stringify({ reason: record.reason_code, attempted: Boolean(record.last_attempt_at), allowed }) + '\\n')
})`
const serverIdeas = spawnSync(process.execPath, ['--import', 'tsx', '--input-type=module', '-e', serverIdeasCode], {
  cwd: SERVER_DIR,
  env: isolatedProviderEnv({
    ENGINE_REPO_ROOT: serverIdeasRoot, ENGINE_STATE_DIR: serverIdeasState,
    NEWS_INGEST_ENABLED: '0', IDEAS_ENABLED: '1', THEMES_ENABLED: '0',
    GROQ_API_KEY: 'test-key', GROQ_BASE_URL: 'http://127.0.0.1:1',
    NEWS_ANTHROPIC_FALLBACK_ENABLED: '0',
  }),
  encoding: 'utf8', timeout: 12_000,
})
assert.equal(serverIdeas.status, 0, serverIdeas.stderr)
const serverIdeasLine = serverIdeas.stdout.split(/\r?\n/).find((line) => line.startsWith('SERVER_IDEAS='))
assert.ok(serverIdeasLine, serverIdeas.stdout)
const serverIdeasResult = JSON.parse(serverIdeasLine!.slice('SERVER_IDEAS='.length))
assert.equal(serverIdeasResult.attempted, true, 'the server Ideas-only timer reaches a provider attempt')
assert.equal(serverIdeasResult.allowed, true, 'the server recognizes the Ideas-only lease as its one provider-spending owner')
assert.notEqual(serverIdeasResult.reason, 'ingester_disabled')
assert.equal(fs.existsSync(path.join(serverIdeasState, 'news-ingester.lock')), true, 'the server Ideas-only timer retains the shared lease')
fs.rmSync(serverIdeasRoot, { recursive: true, force: true })
console.log('\n1 config-ideas test file passed')
