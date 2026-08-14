process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'budget-diagnostics-'))
const state = path.join(root, '.state')
fs.mkdirSync(state, { recursive: true })
const today = new Date().toISOString().slice(0, 10)
fs.writeFileSync(path.join(state, 'groq-budget.json'), `{"date":"${today}","requests":1`)
fs.writeFileSync(path.join(state, 'cerebras-budget.json'), `{"date":"${today}","requests":1`)
fs.writeFileSync(path.join(state, 'anthropic-triage-budget.json'), JSON.stringify({ date: today, usd: 'bad', calls: 0 }))
fs.writeFileSync(path.join(state, 'news-deferred.json'), '[{"event_id":')

const code = `import('./src/news/scheduler.ts').then((scheduler) => {
  scheduler.startNewsIngester()
  const diagnostics = scheduler.getNewsDiagnostics()
  const result = {
    status: scheduler.getNewsStatus(),
    backlog: diagnostics.backlog,
    tiers: diagnostics.tiers.filter((tier) => tier.id === 'groq' || tier.id === 'cerebras' || tier.id === 'anthropic-triage'),
    unavailableTiers: diagnostics.defer.unavailableTiers,
    blockingTiers: diagnostics.defer.blockingTiers,
    groqHeadroom: scheduler.budgetHasHeadroom(Date.now()),
    usdHeadroom: scheduler.anthropicHasHeadroom(Date.now()),
  }
  scheduler.stopNewsIngester()
  process.stdout.write('RESULT=' + JSON.stringify(result) + '\\n')
})`

const env = {
  ...process.env,
  NOSTRA_ENGINE_CONFIG_DIR: path.join(root, 'missing-config'),
  ENGINE_REPO_ROOT: root,
  ENGINE_STATE_DIR: state,
  NEWS_INGEST_ENABLED: '1',
  IDEAS_ENABLED: '0',
  THEMES_ENABLED: '0',
  GROQ_API_KEY: 'test-groq',
  CEREBRAS_API_KEY: 'test-cerebras',
  NEWS_CEREBRAS_ENABLED: '1',
  NEWS_ANTHROPIC_FALLBACK_ENABLED: '1',
  NEWS_ANTHROPIC_FALLBACK_MODE: 'subscription',
}
for (const key of [
  'MISTRAL_API_KEY', 'OPENROUTER_API_KEY', 'NVIDIA_API_KEY', 'GEMINI_API_KEY',
  'NEWS_LOCAL_ENABLED', 'NEWS_MISTRAL_ENABLED', 'NEWS_OPENROUTER_ENABLED',
  'NEWS_NVIDIA_ENABLED', 'NEWS_GEMINI_ENABLED', 'NEWS_ANTHROPIC_FALLBACK_API_KEY',
]) delete env[key]

const run = spawnSync(process.execPath, ['--import', 'tsx', '--input-type=module', '-e', code], {
  cwd: process.cwd(), env, encoding: 'utf8', timeout: 15_000,
})
assert.equal(run.status, 0, run.stderr)
const line = run.stdout.split(/\r?\n/).find((entry) => entry.startsWith('RESULT='))
assert.ok(line, run.stdout)
const result = JSON.parse(line.slice('RESULT='.length))
for (const id of ['groq', 'cerebras', 'anthropic-triage']) {
  const tier = result.tiers.find((candidate: any) => candidate.id === id)
  assert.ok(tier, `${id} diagnostics row exists`)
  assert.equal(tier.health, 'unavailable', `${id} never reports Ready/healthy for damaged authority`)
  assert.equal(tier.ledgerUnavailable, true)
  assert.equal('requestsToday' in tier || 'usdToday' in tier, false, `${id} does not invent zero usage`)
  assert.ok(result.unavailableTiers.includes(id), `${id} is an explicit needs-attention blocker`)
  assert.ok(result.blockingTiers.includes(id), `${id} remains visible to rolling-deploy blocker consumers`)
}
assert.equal(result.groqHeadroom, false, 'a corrupt request/token ledger cannot drive a no-progress drain')
assert.equal(result.usdHeadroom, false, 'a corrupt USD ledger cannot drive a no-progress drain')
assert.equal(result.status.budget.ledgerUnavailable, true, 'the lightweight status surface does not turn corrupt Groq authority into zero usage')
assert.equal(result.status.overflow.find((tier: any) => tier.id === 'cerebras')?.ledgerUnavailable, true, 'the lightweight overflow surface marks damaged authority instead of displaying zero as real usage')
assert.equal(result.status.backlog.unavailable, true, 'the lightweight status marks an unreadable waiting list')
assert.equal(result.backlog.unavailable, true, 'detailed diagnostics do not relabel an unreadable waiting list as caught up')
assert.equal(result.backlog.count, 0, 'an unreadable waiting list does not invent a count')
assert.equal(result.backlog.nearLimit, false)
assert.equal(result.backlog.trend, null)

fs.rmSync(root, { recursive: true, force: true })
console.log('budget diagnostics checks passed')
