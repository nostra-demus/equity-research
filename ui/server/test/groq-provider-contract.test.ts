// Locks the production Groq defaults and the standalone-service example together. A model migration is
// incomplete if config.ts moves while the Themes fallback or launchd template keeps an old active pin.
// Historical prose may still name a retired model, so this scans only executable defaults / plist values.
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const serverRoot = path.resolve(here, '..')
const repoRoot = path.resolve(serverRoot, '../..')
const currentModel = 'openai/gpt-oss-20b'
const retiredModel = 'llama-3.1-8b-instant'

const isolatedConfigDir = fs.mkdtempSync(path.join(os.tmpdir(), 'groq-provider-contract-'))
try {
  const env = { ...process.env, NOSTRA_ENGINE_CONFIG_DIR: isolatedConfigDir }
  for (const key of [
    'GROQ_MODEL',
    'NEWS_GROQ_DAILY_REQ_CAP',
    'NEWS_GROQ_DAILY_TOKEN_CAP',
    'NEWS_GROQ_DAILY_TOKEN_TARGET',
    'NEWS_GROQ_RPM',
    'NEWS_GROQ_TPM',
  ]) delete env[key]

  const probe = spawnSync(process.execPath, [
    '--import', 'tsx', '--input-type=module', '-e',
    "import('./src/config.ts').then(({NEWS}) => process.stdout.write(JSON.stringify({ model: NEWS.groqModel, reqCap: NEWS.groqDailyReqCap, tokenCap: NEWS.groqDailyTokenCap, tokenTarget: NEWS.groqDailyTokenTarget, rpm: NEWS.groqRpm, tpm: NEWS.groqTpm })))",
  ], { cwd: serverRoot, env, encoding: 'utf8' })
  if (probe.error) throw probe.error
  assert.equal(probe.status, 0, probe.stderr)
  assert.deepEqual(JSON.parse(probe.stdout), {
    model: currentModel,
    reqCap: 950,
    tokenCap: 200_000,
    tokenTarget: 200_000,
    rpm: 28,
    tpm: 6_000,
  })
} finally {
  fs.rmSync(isolatedConfigDir, { recursive: true, force: true })
}

const configSource = fs.readFileSync(path.join(serverRoot, 'src/config.ts'), 'utf8')
const themesSource = fs.readFileSync(path.join(serverRoot, 'src/news/themes/llm.ts'), 'utf8')
const launchdTemplate = fs.readFileSync(path.join(repoRoot, 'scripts/ops/com.nostradamus.news-ingester.plist'), 'utf8')
const activeRetiredDefault = new RegExp(String.raw`(?:\|\||\?\?)\s*['"]${retiredModel.replaceAll('.', '\\.')}['"]`)

assert.doesNotMatch(configSource, activeRetiredDefault, 'the primary runtime must not default to the retired model')
assert.doesNotMatch(themesSource, activeRetiredDefault, 'the Themes fallback must not default to the retired model')
assert.match(themesSource, new RegExp(String.raw`groqModel\s*\|\|\s*['"]${currentModel}['"]`))
assert.match(themesSource, /dailyReqCap:\s*cfg\.groqDailyReqCap\s*\?\?\s*950/)
assert.match(themesSource, /dailyTokenCap:\s*cfg\.groqDailyTokenCap\s*\?\?\s*200_000/)
assert.match(
  themesSource,
  /paceCap:\s*cfg\.groqDailyTokenTarget\s*\?\?\s*cfg\.groqDailyTokenCap\s*\?\?\s*200_000/,
)
assert.match(launchdTemplate, new RegExp(String.raw`<key>GROQ_MODEL</key><string>${currentModel}</string>`))
assert.doesNotMatch(
  launchdTemplate,
  new RegExp(String.raw`<key>GROQ_MODEL</key><string>${retiredModel.replaceAll('.', '\\.')}<\/string>`),
  'the installable launchd template must not reintroduce the retired model override',
)

console.log('groq-provider-contract.test.ts: production defaults and launchd pin agree')
