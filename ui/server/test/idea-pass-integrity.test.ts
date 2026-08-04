process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { readIdeasHealth } from '../src/news/ideas/ideas-health'
import { ideaId, ideaVersion, readIdeaById, writeIdea } from '../src/news/ideas/ideas-store'
import { runIdeaPass, type IdeaPassConfig } from '../src/news/ideas/run-idea-pass'
import { eventIdFor } from '../src/news/normalize'
import { invalidateSymbolCache } from '../src/news/symbology'
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
  assert.equal(result.ran, true, JSON.stringify(result))
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

// Theme lineage is derived after the provider chooses `src`: an actionable theme row elsewhere in the
// same one-call batch cannot leak into the saved idea.
const lineageRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'idea-pass-lineage-'))
const lineageState = path.join(lineageRoot, '.state')
const lineageInbox = path.join(lineageRoot, 'screener', 'inbox')
const lineageBoard = path.join(lineageRoot, 'screener', 'board')
fs.mkdirSync(lineageInbox, { recursive: true })
fs.mkdirSync(lineageBoard, { recursive: true })
const wireHeadline = 'Link Corp wins a material contract'
const wireUrl = 'https://exchange.test/link'
const unusedHeadline = 'Unused theme catalyst reaches the market'
const usedHeadline = 'Used theme catalyst lifts Link demand'
const feedRow = (headline: string, url: string, score: number) => ({
  kind: 'item', ts: '2026-08-03T10:00:00Z', found_at: '2026-08-03T10:00:00Z', event_id: eventIdFor(headline, url), headline, url,
  domain: 'news.test', source_name: 'News', via: 'rss', region: 'US', input_nature: 'news_headline',
  triage_score: score, band: 'watch', triage_reason: 'material', relevance: 'material',
  event_types: ['operational'], issuer_linkage: 'primary', companies: [], size_bucket: 'large',
  dedup_status: 'new', inboxed: true,
})
const unusedFeed = feedRow(unusedHeadline, 'https://news.test/unused', 88)
const usedFeedBase = feedRow(usedHeadline, 'https://news.test/used', 70)
const usedFeed = { ...usedFeedBase, dedup_group: usedFeedBase.event_id }
const usedCopy = {
  ...feedRow('Second publisher confirms Link demand catalyst', 'https://wire.test/used-copy', 69),
  dedup_group: usedFeed.event_id,
}
fs.writeFileSync(path.join(lineageInbox, '2026-08-03_sweep.json'), JSON.stringify({
  updated_at: '2026-08-03T11:30:00Z', rows: [
    { headline: wireHeadline, url: wireUrl, source_name: 'Exchange', found_at: '2026-08-03T10:30:00Z', triage_score: 91 },
    { headline: 'Peer demand rises into results', url: 'https://exchange.test/peer', source_name: 'Exchange', found_at: '2026-08-03T09:00:00Z', triage_score: 84 },
    { headline: 'Peer adds new capacity', url: 'https://exchange.test/peer-capacity', source_name: 'Exchange', found_at: '2026-08-03T09:00:00Z', triage_score: 83 },
    { headline: 'Supplier reports higher orders', url: 'https://exchange.test/supplier', source_name: 'Exchange', found_at: '2026-08-03T09:00:00Z', triage_score: 82 },
  ],
}))
fs.writeFileSync(path.join(lineageInbox, '2026-08-03_firehose.ndjson'), `${JSON.stringify(unusedFeed)}\n${JSON.stringify(usedFeed)}\n${JSON.stringify(usedCopy)}\n`)
fs.writeFileSync(path.join(lineageBoard, 'themes_index.json'), JSON.stringify({ generated_at: '2026-08-03T11:55:00Z', themes: [
  {
    theme_id: 'THM-aaaaaaaa', rev: 2, assessment: { status: 'actionable' },
    evidence: [{ event_id: unusedFeed.event_id, found_at: unusedFeed.found_at }],
    qualified_expressions: [{
      name: 'Unused Co', name_key: 'unused', ticker: 'UNUSED', listing_country: 'US', side: 'beneficiary',
      evidence_event_ids: [unusedFeed.event_id],
    }],
  },
  {
    theme_id: 'THM-bbbbbbbb', rev: 5, assessment: { status: 'actionable' },
    evidence: [{ event_id: usedFeed.event_id, found_at: usedFeed.found_at }],
    qualified_expressions: [{
      name: 'Link Corp', name_key: 'link', ticker: 'LINK', listing_country: 'US', side: 'beneficiary',
      evidence_event_ids: [usedFeed.event_id],
    }],
  },
  {
    theme_id: 'THM-cccccccc', rev: 3, assessment: { status: 'actionable' },
    evidence: [{ event_id: usedCopy.event_id, found_at: usedCopy.found_at }],
    qualified_expressions: [{
      name: 'Link Corp', name_key: 'link', ticker: 'LINK', listing_country: 'US', side: 'beneficiary',
      evidence_event_ids: [usedCopy.event_id],
    }],
  },
] }))
let lineageProviderCalls = 0
const lineageFetch = (async (input: Parameters<typeof fetch>[0]) => {
  if (String(input).includes('query1.finance.yahoo.com')) {
    return new Response(JSON.stringify({ quotes: [{ quoteType: 'EQUITY', symbol: 'LINK', longname: 'Link Corp', exchDisp: 'NYSE' }] }), { status: 200 })
  }
  lineageProviderCalls++
  return new Response(JSON.stringify({
    choices: [{ finish_reason: 'stop', message: { content: JSON.stringify({ ideas: [
      {
        // Final input order is wire(91), unused theme(88), three wire rows (84/83/82), used theme(70).
        // This first duplicate invents LINK from an UNUSED-only Theme row and must fail closed without
        // blocking the later correctly bound duplicate for the same ticker/direction.
        src: [1], ticker: 'LINK', company: 'Link Corp', exchange: 'NYSE', direction: 'long',
        reason: 'The catalyst can lift revenue', why_now: 'The catalyst was reported today',
        conviction: 68, priced_in: 'room', thesis_type: 'company_specific',
      },
      {
        src: [0, 5], ticker: 'LINK', company: 'Link Corp', exchange: 'NYSE', direction: 'long',
        reason: 'The contract and demand catalyst can lift revenue', why_now: 'Both catalysts were reported today',
        conviction: 68, priced_in: 'room', thesis_type: 'company_specific',
      },
    ] }) } }], usage: { total_tokens: 100 },
  }), { status: 200, headers: { 'content-type': 'application/json' } })
}) as typeof fetch
try {
  const result = await runIdeaPass({
    repoRoot: lineageRoot, stateDir: lineageState, config, refreshBoard: async () => {}, now: () => NOW,
    fetchFn: lineageFetch, sleep: async () => {}, persistHealth: true,
  })
  assert.equal(result.produced, 1)
  assert.equal(lineageProviderCalls, 1, 'wire and theme rows share the existing single skim call')
  const persisted = readIdeaById(lineageRoot, ideaId('LINK', 'long'))
  assert.equal(persisted?.origin_type, 'mixed')
  assert.deepEqual(persisted?.source_themes, [
    { theme_id: 'THM-bbbbbbbb', theme_rev: 5, evidence_event_ids: [usedFeed.event_id] },
    { theme_id: 'THM-cccccccc', theme_rev: 3, evidence_event_ids: [usedCopy.event_id] },
  ], 'discarded publisher copies retain their exact row↔theme edge while unused src indices supply no lineage')
  assert.deepEqual(persisted?.source_event_ids, [eventIdFor(wireHeadline, wireUrl), usedFeed.event_id, usedCopy.event_id])
  assert.notEqual(persisted?.idea_version, ideaVersion({
    ticker: 'LINK', direction: 'long', pairWith: null, thesisType: 'company_specific',
    reason: 'The contract and demand catalyst can lift revenue', whyNow: 'Both catalysts were reported today',
    sourceEventIds: persisted?.source_event_ids || [], originType: 'mixed',
    sourceThemes: persisted?.source_themes?.map((theme) => theme.theme_id === 'THM-bbbbbbbb'
      ? { ...theme, theme_rev: theme.theme_rev + 1 }
      : theme) || [],
  }), 'changing only a theme revision changes the immutable idea version')

  const firstVersion = persisted?.idea_version
  const refreshedIndex = JSON.parse(fs.readFileSync(path.join(lineageBoard, 'themes_index.json'), 'utf8'))
  refreshedIndex.generated_at = '2026-08-03T12:15:00Z'
  refreshedIndex.themes[1].rev = 6
  refreshedIndex.themes[2].rev = 4
  fs.writeFileSync(path.join(lineageBoard, 'themes_index.json'), JSON.stringify(refreshedIndex))
  const effectRerun = await runIdeaPass({
    repoRoot: lineageRoot, stateDir: lineageState, config, refreshBoard: async () => {},
    now: () => NOW + 16 * 60_000, fetchFn: lineageFetch, sleep: async () => {}, persistHealth: true,
  })
  assert.equal(effectRerun.ran, true, 'a lineage-only effect change reruns before the unchanged-prompt heartbeat')
  assert.equal(lineageProviderCalls, 2)
  const refreshed = readIdeaById(lineageRoot, ideaId('LINK', 'long'))
  assert.deepEqual(refreshed?.source_themes.map(({ theme_id, theme_rev }) => ({ theme_id, theme_rev })), [
    { theme_id: 'THM-bbbbbbbb', theme_rev: 6 },
    { theme_id: 'THM-cccccccc', theme_rev: 4 },
  ])
  assert.notEqual(refreshed?.idea_version, firstVersion)
} finally {
  fs.rmSync(lineageRoot, { recursive: true, force: true })
}

// A provider can return a structurally valid model row that later fails the stricter persisted snapshot
// contract because its source payload is corrupt. That is a failed pass, never an honest empty result.
const brokenRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'idea-pass-persistence-'))
const brokenState = path.join(brokenRoot, '.state')
const brokenInbox = path.join(brokenRoot, 'screener', 'inbox')
const BROKEN_NOW = NOW + 18 * 60_000
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
    repoRoot: brokenRoot, stateDir: brokenState, config, refreshBoard: async () => {}, now: () => BROKEN_NOW,
    fetchFn: brokenFetch, sleep: async () => {}, persistHealth: true,
  })
  assert.equal(result.ran, true, JSON.stringify(result))
  assert.equal(result.produced, 0)
  assert.equal(result.reason_code, 'snapshot_store_error')
  const health = readIdeasHealth(brokenState, brokenRoot, true, BROKEN_NOW)
  assert.equal(health.status, 'error')
  assert.equal(health.outcome, 'failed', 'returned-but-unpersistable leads never become success_empty')
  assert.equal(health.reason_code, 'snapshot_store_error')
  assert.equal(health.last_success_at, null, 'a failed persistence boundary does not stamp a new success')
  assert.match(health.reason || '', /none became a projectable snapshot/)
} finally {
  fs.rmSync(brokenRoot, { recursive: true, force: true })
}

// A pair is persisted only after two independent exact-symbol directory checks. An unlisted first
// second-leg candidate must not reserve the stable primary+direction id and block a later valid pair.
const pairRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'idea-pass-pair-listing-'))
const pairState = path.join(pairRoot, '.state')
const pairInbox = path.join(pairRoot, 'screener', 'inbox')
const PAIR_NOW = NOW + 20 * 60_000
fs.mkdirSync(pairInbox, { recursive: true })
fs.writeFileSync(path.join(pairInbox, '2026-08-03_sweep.json'), JSON.stringify({
  updated_at: '2026-08-03T12:15:00Z', rows: [
    { headline: 'Pair Primary wins a major order', url: 'https://exchange.test/pair-primary', source_name: 'Exchange', found_at: '2026-08-03T12:00:00Z', triage_score: 91 },
    { headline: 'Market share shifts after the award', url: 'https://exchange.test/pair-context', source_name: 'Exchange', found_at: '2026-08-03T11:55:00Z', triage_score: 84 },
  ],
}))
invalidateSymbolCache()
const directoryQueries: string[] = []
const pairFetch = (async (input: Parameters<typeof fetch>[0]) => {
  const url = String(input)
  if (url.includes('query1.finance.yahoo.com')) {
    const q = new URL(url).searchParams.get('q') || ''
    directoryQueries.push(q)
    const quote = q === 'PAIRPRIM'
      ? { quoteType: 'EQUITY', symbol: 'PAIRPRIM', longname: 'Pair Primary Corp', exchDisp: 'NYSE' }
      : q === 'GOODLEG'
        // Wire-only has no server-authoritative pair company name. Exact ticker+venue is the safe path;
        // this intentionally unrelated directory name proves no provider-authored name was trusted.
        ? { quoteType: 'EQUITY', symbol: 'GOODLEG', longname: 'Directory Returned Name Plc', exchDisp: 'NASDAQ' }
        : null
    return new Response(JSON.stringify({ quotes: quote ? [quote] : [] }), { status: 200 })
  }
  return new Response(JSON.stringify({
    choices: [{ finish_reason: 'stop', message: { content: JSON.stringify({ ideas: [
      {
        src: [0, 1], ticker: 'BADPRIMARY', company: 'Bad Primary Corp', exchange: 'NYSE', direction: 'pair', pair_with: 'GOODLEG',
        reason: 'The order shifts revenue toward the winner', why_now: 'The award was filed today',
        conviction: 66, priced_in: 'room', thesis_type: 'company_specific',
      },
      {
        src: [0, 1], ticker: 'PAIRPRIM', company: 'Pair Primary Corp', exchange: 'NYSE', direction: 'pair', pair_with: 'BADLEG',
        reason: 'The order shifts revenue toward the winner', why_now: 'The award was filed today',
        conviction: 66, priced_in: 'room', thesis_type: 'company_specific',
      },
      {
        src: [0, 1], ticker: 'PAIRPRIM', company: 'Pair Primary Corp', exchange: 'NYSE', direction: 'pair', pair_with: 'GOODLEG',
        reason: 'The order shifts revenue toward the winner', why_now: 'The award was filed today',
        conviction: 66, priced_in: 'room', thesis_type: 'company_specific',
      },
    ] }) } }], usage: { total_tokens: 100 },
  }), { status: 200, headers: { 'content-type': 'application/json' } })
}) as typeof fetch
try {
  const result = await runIdeaPass({
    repoRoot: pairRoot, stateDir: pairState, config, refreshBoard: async () => {}, now: () => PAIR_NOW,
    fetchFn: pairFetch, sleep: async () => {}, persistHealth: true,
  })
  assert.equal(result.produced, 1)
  assert.ok(directoryQueries.includes('BADPRIMARY'), 'an unlisted primary invalidates the whole pair')
  assert.equal(readIdeaById(pairRoot, ideaId('BADPRIMARY', 'pair')), null)
  assert.ok(directoryQueries.includes('BADLEG'), 'the unlisted second leg was independently checked')
  assert.ok(directoryQueries.includes('GOODLEG'), 'rejection did not block the later valid pair')
  const persisted = readIdeaById(pairRoot, ideaId('PAIRPRIM', 'pair'))
  assert.equal(persisted?.pair_with, 'GOODLEG')
  assert.equal(persisted?.listing_verified, true, 'the primary leg also had to verify')
  assert.notEqual(persisted?.idea_version, ideaVersion({
    ticker: 'PAIRPRIM', direction: 'pair', pairWith: 'BADLEG', thesisType: 'company_specific',
    reason: persisted?.reason || '', whyNow: persisted?.why_now || '',
    sourceEventIds: persisted?.source_event_ids || [], originType: 'wire', sourceThemes: [],
  }), 'the saved version binds the independently verified second leg')
} finally {
  fs.rmSync(pairRoot, { recursive: true, force: true })
  invalidateSymbolCache()
}

console.log('\n4 idea-pass integrity checks passed')
