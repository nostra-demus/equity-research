process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { readIdeasHealth } from '../src/news/ideas/ideas-health'
import { ideaId, readIdeaById, writeIdea } from '../src/news/ideas/ideas-store'
import { runIdeaPass, type IdeaPassConfig } from '../src/news/ideas/run-idea-pass'
import { validIdeaSnapshot } from './ideas-fixture'

const NOW = Date.parse('2026-08-03T12:00:00Z')
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'idea-pass-integrity-'))
const stateDir = path.join(root, '.state')
const inbox = path.join(root, 'screener', 'inbox')
fs.mkdirSync(inbox, { recursive: true })
fs.writeFileSync(path.join(inbox, '2026-08-03_sweep.json'), JSON.stringify({
  updated_at: '2026-08-03T11:30:00Z',
  rows: [
    { headline: 'Acme wins a material contract', url: 'https://exchange.test/acme', source_name: 'Exchange', found_at: '2026-08-03T10:00:00Z', triage_score: 91 },
    { headline: 'Peer demand rises into results', url: 'https://exchange.test/peer', source_name: 'Exchange', found_at: '2026-08-03T09:00:00Z', triage_score: 84 },
  ],
}))

const config: IdeaPassConfig = {
  topN: 12, shelfLifeHrs: 36, inputMaxAgeHrs: 36, minIntervalSec: 900, refreshSec: 3600,
  groqApiKey: 'test-key', groqBaseUrl: 'https://provider.test/v1', groqModel: 'test-model', groqMaxTokens: 500,
  groqDailyReqCap: 100, groqDailyTokenCap: 1_000_000, groqDailyTokenTarget: 1_000_000,
  groqPaceFloorFrac: 1, groqRpm: 0, groqTpm: 1_000_000,
  llmCooldownMs: 1_000, llmCooldownMaxMs: 10_000, limiterWaitMs: 0,
}

const id = ideaId('ACME', 'long')
let lifecycleEditInjected = false
const fetchFn = (async (input: Parameters<typeof fetch>[0]) => {
  const url = String(input)
  if (url.includes('query1.finance.yahoo.com')) {
    if (!lifecycleEditInjected) {
      lifecycleEditInjected = true
      // Simulate a user promotion while the pass is awaiting its independent listing lookup. The final
      // provider write must re-read this revision and preserve the promotion.
      writeIdea(root, validIdeaSnapshot('ACME', 'long', {
        status: 'promoted', promoted_signal_id: 'SIG-current',
        surfaced_at: '2026-08-03T09:30:00Z', idea_version_started_at: '2026-08-03T09:30:00Z',
        updated_at: '2026-08-03T11:45:00Z',
      }))
    }
    return new Response(JSON.stringify({ quotes: [{ quoteType: 'EQUITY', symbol: 'ACME', longname: 'Acme Corp', exchDisp: 'NYSE' }] }), { status: 200 })
  }
  return new Response(JSON.stringify({
    choices: [{ finish_reason: 'stop', message: { content: JSON.stringify({ ideas: [{
      src: [0, 1], ticker: 'ACME', company: 'Acme Corp', exchange: 'NYSE', direction: 'long',
      reason: 'Contract and demand can lift estimates', why_now: 'Results are inside the next month',
      conviction: 70, priced_in: 'room', thesis_type: 'company_specific',
    }] }) } }],
    usage: { total_tokens: 100 },
  }), { status: 200, headers: { 'content-type': 'application/json' } })
}) as typeof fetch

try {
  const result = await runIdeaPass({
    repoRoot: root, stateDir, config, refreshBoard: async () => {}, now: () => NOW,
    fetchFn, sleep: async () => {}, persistHealth: true,
  })
  assert.equal(result.ran, true)
  assert.equal(result.produced, 1)
  const persisted = readIdeaById(root, id)
  assert.equal(persisted?.status, 'promoted', 'the post-await re-read preserves a newer lifecycle update')
  assert.equal(persisted?.promoted_signal_id, 'SIG-current')
  assert.equal(persisted?.decay_at, '2026-08-04T22:00:00Z', 'expiry is source-time + shelf, not provider-time + shelf')
  const health = readIdeasHealth(stateDir, root, true, NOW)
  assert.equal(health.outcome, 'success_with_ideas')
  assert.equal(health.produced_count, 1)
  assert.equal(health.live_count, 1)
  assert.equal(health.snapshot_store.valid_count, 1)
} finally {
  fs.rmSync(root, { recursive: true, force: true })
}

// A provider can return a structurally valid model row that later fails the stricter persisted snapshot
// contract because its source payload is corrupt. That is a failed pass, never an honest empty result.
const brokenRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'idea-pass-persistence-'))
const brokenState = path.join(brokenRoot, '.state')
const brokenInbox = path.join(brokenRoot, 'screener', 'inbox')
fs.mkdirSync(brokenInbox, { recursive: true })
fs.writeFileSync(path.join(brokenInbox, '2026-08-03_sweep.json'), JSON.stringify({
  updated_at: '2026-08-03T11:30:00Z',
  rows: [
    // The operational reader accepts a numeric score, while the persisted lead contract correctly caps
    // materiality at 100. This forces the post-provider persistence boundary without malformed model JSON.
    { headline: 'Broken wins a material contract', url: 'https://exchange.test/broken', source_name: 'Exchange', found_at: '2026-08-03T10:00:00Z', triage_score: 101 },
    { headline: 'Peer demand rises into results', url: 'https://exchange.test/peer', source_name: 'Exchange', found_at: '2026-08-03T09:00:00Z', triage_score: 84 },
  ],
}))
const brokenFetch = (async (input: Parameters<typeof fetch>[0]) => {
  if (String(input).includes('query1.finance.yahoo.com')) {
    return new Response(JSON.stringify({ quotes: [{ quoteType: 'EQUITY', symbol: 'BROKEN', longname: 'Broken Corp', exchDisp: 'NYSE' }] }), { status: 200 })
  }
  return new Response(JSON.stringify({
    choices: [{ finish_reason: 'stop', message: { content: JSON.stringify({ ideas: [{
      src: [0], ticker: 'BROKEN', company: 'Broken Corp', exchange: 'NYSE', direction: 'long',
      reason: 'The contract can lift revenue', why_now: 'The award was filed today',
      conviction: 65, priced_in: 'room', thesis_type: 'company_specific',
    }] }) } }],
    usage: { total_tokens: 100 },
  }), { status: 200, headers: { 'content-type': 'application/json' } })
}) as typeof fetch
try {
  const result = await runIdeaPass({
    repoRoot: brokenRoot, stateDir: brokenState, config, refreshBoard: async () => {}, now: () => NOW,
    fetchFn: brokenFetch, sleep: async () => {}, persistHealth: true,
  })
  assert.equal(result.ran, true)
  assert.equal(result.produced, 0)
  assert.equal(result.reason_code, 'snapshot_store_error')
  const health = readIdeasHealth(brokenState, brokenRoot, true, NOW)
  assert.equal(health.status, 'error')
  assert.equal(health.outcome, 'failed', 'returned-but-unpersistable leads never become success_empty')
  assert.equal(health.reason_code, 'snapshot_store_error')
  assert.equal(health.last_success_at, null, 'a failed persistence boundary does not stamp a new success')
  assert.match(health.reason || '', /none became a projectable snapshot/)
} finally {
  fs.rmSync(brokenRoot, { recursive: true, force: true })
}

console.log('\n2 idea-pass integrity checks passed')
