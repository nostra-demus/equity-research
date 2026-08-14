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
import { resetSharedLimiters } from '../src/news/triage/budget'
import { validIdeaSnapshot } from './ideas-fixture'

function isYahooSymbolDirectoryUrl(input: Parameters<typeof fetch>[0]): boolean {
  try { return new URL(String(input)).hostname === 'query1.finance.yahoo.com' } catch { return false }
}

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
  if (isYahooSymbolDirectoryUrl(input)) {
    if (!lifecycleEditInjected) {
      lifecycleEditInjected = true
      // Simulate a user promotion while the pass is awaiting its independent listing lookup. The final
      // provider write must re-read this revision and preserve the promotion.
      const sourceEventIds = [
        eventIdFor('Acme wins a material contract', 'https://exchange.test/acme'),
        eventIdFor('Peer demand rises into results', 'https://exchange.test/peer'),
      ]
      const reason = 'Contract and demand can lift estimates'
      const whyNow = 'Results are inside the next month'
      writeIdea(root, validIdeaSnapshot('ACME', 'long', {
        idea_version: ideaVersion({
          ticker: 'ACME', direction: 'long', pairWith: null, thesisType: 'company_specific', reason, whyNow,
          sourceEventIds, primarySourceEventId: sourceEventIds[0], sourceHeadline: 'Acme wins a material contract',
          sourceUrl: 'https://exchange.test/acme', sourceName: 'Exchange', originType: 'wire', sourceThemes: [],
        }),
        reason, why_now: whyNow, source_event_ids: sourceEventIds, primary_source_event_id: sourceEventIds[0],
        source_headlines: ['Acme wins a material contract', 'Peer demand rises into results'],
        source_headline: 'Acme wins a material contract', source_url: 'https://exchange.test/acme', source_name: 'Exchange',
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
const unusedProofHeadline = 'Unused Co filing proves its exposure to the catalyst'
const usedHeadline = 'Used theme catalyst lifts Link demand'
const feedRow = (headline: string, url: string, score: number) => ({
  kind: 'item', ts: '2026-08-03T10:00:00Z', found_at: '2026-08-03T10:00:00Z', event_id: eventIdFor(headline, url), headline, url,
  domain: 'news.test', source_name: 'News', via: 'rss', region: 'US', input_nature: 'news_headline',
  triage_score: score, band: 'watch', triage_reason: 'material', relevance: 'material',
  event_types: ['operational'], issuer_linkage: 'primary', companies: [], size_bucket: 'large',
  dedup_status: 'new', inboxed: true,
})
const unusedFeed = feedRow(unusedHeadline, 'https://news.test/unused', 88)
const unusedProof = feedRow(unusedProofHeadline, 'https://filings.test/unused-proof', 87)
const usedFeedBase = feedRow(usedHeadline, 'https://news.test/used', 70)
const usedFeed = { ...usedFeedBase, dedup_group: usedFeedBase.event_id }
const usedCopy = {
  ...feedRow('Second publisher confirms Link demand catalyst', 'https://wire.test/used-copy', 69),
  dedup_group: usedFeed.event_id,
}
fs.writeFileSync(path.join(lineageInbox, '2026-08-03_sweep.json'), JSON.stringify({
  updated_at: '2026-08-03T11:30:00Z', rows: [
    { headline: wireHeadline, url: wireUrl, source_name: 'Exchange', found_at: '2026-08-03T10:30:00Z', triage_score: 91 },
    ...[86, 85, 84, 83, 82, 81, 80].map((score) => ({
      headline: `Independent wire ${score}`, url: `https://exchange.test/wire-${score}`, source_name: 'Exchange',
      found_at: '2026-08-03T09:00:00Z', triage_score: score,
    })),
  ],
}))
fs.writeFileSync(path.join(lineageInbox, '2026-08-03_firehose.ndjson'), `${JSON.stringify(unusedFeed)}\n${JSON.stringify(unusedProof)}\n${JSON.stringify(usedFeed)}\n${JSON.stringify(usedCopy)}\n`)
fs.writeFileSync(path.join(lineageBoard, 'themes_index.json'), JSON.stringify({ generated_at: '2026-08-03T11:55:00Z', themes: [
  {
    theme_id: 'THM-aaaaaaaa', rev: 2, activity: 'reinforced', assessment: { status: 'actionable', activity: 'reinforced' },
    description: 'The catalyst changes demand for directly exposed issuers.',
    narrative: {
      thesis: 'The fresh catalyst can lift revenue for issuers with proven direct exposure.',
      why_now: 'The catalyst reached the market today.', why_now_event_id: unusedFeed.event_id,
    },
    evidence: [
      { event_id: unusedFeed.event_id, found_at: unusedFeed.found_at, stance: 'supports' },
      { event_id: unusedProof.event_id, found_at: unusedProof.found_at, stance: 'supports' },
    ],
    qualified_expressions: [{
      name: 'Unused Co', name_key: 'unused', ticker: 'UNUSED', listing_country: 'US', side: 'beneficiary',
      role: 'direct', mechanism: 'The catalyst directly changes Unused Co revenue.',
      evidence_event_ids: [unusedProof.event_id],
    }],
  },
  {
    theme_id: 'THM-bbbbbbbb', rev: 5, activity: 'reinforced', assessment: { status: 'actionable', activity: 'reinforced' },
    description: 'Link has filing-backed exposure to the live demand catalyst.',
    narrative: {
      thesis: 'The fresh demand catalyst can lift Link revenue through its proven direct exposure.',
      why_now: 'The demand catalyst was confirmed today.', why_now_event_id: usedFeed.event_id,
    },
    evidence: [
      { event_id: usedFeed.event_id, found_at: usedFeed.found_at, stance: 'supports' },
      { event_id: usedCopy.event_id, found_at: usedCopy.found_at, stance: 'supports' },
    ],
    qualified_expressions: [{
      name: 'Link Corp', name_key: 'link', ticker: 'LINK', listing_country: 'US', side: 'beneficiary',
      role: 'direct', mechanism: 'The demand catalyst directly lifts Link Corp revenue.',
      evidence_event_ids: [usedCopy.event_id],
    }],
  },
] }))
let lineageProviderCalls = 0
const lineageFetch = (async (input: Parameters<typeof fetch>[0]) => {
  if (isYahooSymbolDirectoryUrl(input)) {
    return new Response(JSON.stringify({ quotes: [{ quoteType: 'EQUITY', symbol: 'LINK', longname: 'Link Corp', exchDisp: 'NYSE' }] }), { status: 200 })
  }
  lineageProviderCalls++
  return new Response(JSON.stringify({
    choices: [{ finish_reason: 'stop', message: { content: JSON.stringify({ ideas: [
      {
        // Final input order is wire(91), unused WHY_NOW(88), unused EXPRESSION_PROOF(87), seven wire rows,
        // used WHY_NOW(70), used EXPRESSION_PROOF(69). The exact selected package alone supplies lineage;
        // provider envelopes now fail closed on duplicate ticker+direction rows before this stage.
        src: [0, 10, 11], ticker: 'LINK', company: 'Link Corp', exchange: 'NYSE', direction: 'long',
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
    { theme_id: 'THM-bbbbbbbb', theme_rev: 5, evidence_event_ids: [usedFeed.event_id, usedCopy.event_id], why_now_event_id: usedFeed.event_id },
  ], 'the selected exact two-row package retains its id@revision and unused package supplies no lineage')
  assert.deepEqual(persisted?.source_event_ids, [eventIdFor(wireHeadline, wireUrl), usedFeed.event_id, usedCopy.event_id])
  assert.notEqual(persisted?.idea_version, ideaVersion({
    ticker: 'LINK', direction: 'long', pairWith: null, thesisType: 'company_specific',
    reason: 'The contract and demand catalyst can lift revenue', whyNow: 'Both catalysts were reported today',
    sourceEventIds: persisted?.source_event_ids || [], originType: 'mixed',
    primarySourceEventId: persisted?.primary_source_event_id || '', sourceHeadline: persisted?.source_headline || '',
    sourceUrl: persisted?.source_url || '', sourceName: persisted?.source_name || '',
    sourceThemes: persisted?.source_themes?.map((theme) => theme.theme_id === 'THM-bbbbbbbb'
      ? { ...theme, theme_rev: theme.theme_rev + 1 }
      : theme) || [],
  }), 'changing only a theme revision changes the immutable idea version')

  const firstVersion = persisted?.idea_version
  const refreshedIndex = JSON.parse(fs.readFileSync(path.join(lineageBoard, 'themes_index.json'), 'utf8'))
  refreshedIndex.generated_at = '2026-08-03T12:15:00Z'
  refreshedIndex.themes[1].rev = 6
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
  ])
  assert.notEqual(refreshed?.idea_version, firstVersion)
} finally {
  fs.rmSync(lineageRoot, { recursive: true, force: true })
}

// A useful Theme package is causal, not row-local: today's why-now update may name no listed company,
// while the exact first-order expression was established weeks earlier. The provider must select BOTH;
// choosing either row alone fails the post-model proof contract without blocking the valid third attempt.
const packageRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'idea-pass-13d-package-'))
const packageState = path.join(packageRoot, '.state')
const packageInbox = path.join(packageRoot, 'screener', 'inbox')
const packageBoard = path.join(packageRoot, 'screener', 'board')
fs.mkdirSync(packageInbox, { recursive: true })
fs.mkdirSync(packageBoard, { recursive: true })
const whyHeadline = 'Grid regulator confirms transformer backlog is still extending'
const whyUrl = 'https://regulator.test/grid-backlog-update'
const whyEvent = eventIdFor(whyHeadline, whyUrl)
const expressionHeadline = 'Acme discloses transformer capacity tied to the grid bottleneck'
const expressionUrl = 'https://filings.test/acme-transformer-capacity'
const expressionEvent = eventIdFor(expressionHeadline, expressionUrl)
const freshWhy = {
  kind: 'item', ts: '2026-08-03T11:30:00Z', found_at: '2026-08-03T11:30:00Z', event_id: whyEvent,
  headline: whyHeadline, url: whyUrl, domain: 'regulator.test', source_name: 'Grid Regulator', via: 'rss',
  region: 'US', input_nature: 'news_headline', triage_score: 95, band: 'pick', triage_reason: 'material',
  relevance: 'material', event_types: ['policy'], issuer_linkage: 'macro', companies: [], size_bucket: 'large',
  dedup_status: 'new', inboxed: true,
}
const structuralExpression = {
  kind: 'item', ts: '2026-07-10T09:00:00Z', found_at: '2026-07-10T09:00:00Z', event_id: expressionEvent,
  headline: expressionHeadline, url: expressionUrl, domain: 'filings.test', source_name: 'Acme 8-K', via: 'rss',
  region: 'US', input_nature: 'filing', triage_score: 94, band: 'pick', triage_reason: 'material',
  relevance: 'material', event_types: ['capex'], issuer_linkage: 'primary',
  companies: [{ name: 'Acme Corp', ticker: 'ACME', listing_country: 'US' }], size_bucket: 'large',
  dedup_status: 'new', inboxed: true,
}
fs.writeFileSync(path.join(packageInbox, '2026-08-03_firehose.ndjson'), `${JSON.stringify(freshWhy)}\n`)
fs.writeFileSync(path.join(packageInbox, '2026-07-10_firehose.ndjson'), `${JSON.stringify(structuralExpression)}\n`)
fs.writeFileSync(path.join(packageInbox, '2026-08-03_sweep.json'), JSON.stringify({
  updated_at: '2026-08-03T11:55:00Z', rows: [1, 2, 3, 4].map((n) => ({
    headline: `Independent wire ${n}`, url: `https://exchange.test/independent-${n}`, source_name: 'Exchange',
    found_at: '2026-08-03T11:00:00Z', triage_score: 100 - n,
  })),
}))
fs.writeFileSync(path.join(packageBoard, 'themes_index.json'), JSON.stringify({
  generated_at: '2026-08-03T11:59:00Z',
  themes: [{
    theme_id: 'THM-13da13da', rev: 8, activity: 'reinforced',
    assessment: { status: 'actionable', activity: 'reinforced' },
    description: 'A live transformer backlog meets Acme filing-backed capacity exposure.',
    narrative: {
      thesis: 'The live grid backlog can extend pricing for Acme transformer capacity.',
      why_now: 'The regulator confirmed today that the backlog is still extending.',
      why_now_event_id: whyEvent,
    },
    evidence: [
      { event_id: whyEvent, found_at: freshWhy.found_at, stance: 'supports' },
      { event_id: expressionEvent, found_at: structuralExpression.found_at, stance: 'supports' },
    ],
    qualified_expressions: [{
      name: 'Acme Corp', name_key: 'acme', ticker: 'ACME', listing_country: 'US', side: 'beneficiary',
      role: 'bottleneck', mechanism: 'Acme sells the constrained transformer capacity named in the structural filing.',
      evidence_event_ids: [expressionEvent],
    }],
  }],
}))
invalidateSymbolCache()
resetSharedLimiters()
let packagePrompt = ''
const packageFetch = (async (input: Parameters<typeof fetch>[0], init?: RequestInit) => {
  if (isYahooSymbolDirectoryUrl(input)) {
    return new Response(JSON.stringify({ quotes: [{ quoteType: 'EQUITY', symbol: 'ACME', longname: 'Acme Corp', exchDisp: 'NYSE' }] }), { status: 200 })
  }
  const request = JSON.parse(String(init?.body || '{}'))
  packagePrompt = String(request.messages?.find((message: { role?: string }) => message.role === 'user')?.content || '')
  return new Response(JSON.stringify({
    choices: [{ finish_reason: 'stop', message: { content: JSON.stringify({ ideas: [
      {
        src: [4, 5], ticker: 'ACME', company: 'Acme Corp', exchange: 'NYSE', direction: 'long',
        reason: 'The live backlog can extend pricing for Acme transformer capacity', why_now: 'The regulator confirmed the backlog today',
        conviction: 68, priced_in: 'room', thesis_type: 'company_specific',
      },
    ] }) } }], usage: { total_tokens: 100 },
  }), { status: 200, headers: { 'content-type': 'application/json' } })
}) as typeof fetch
try {
  const result = await runIdeaPass({
    repoRoot: packageRoot, stateDir: packageState,
    config: { ...config, groqBaseUrl: 'https://package-provider.test/v1' },
    refreshBoard: async () => {}, now: () => NOW,
    fetchFn: packageFetch, sleep: async () => {}, persistHealth: true,
  })
  assert.equal(result.produced, 1, `the complete two-row package clears: ${JSON.stringify(result)}`)
  const persisted = readIdeaById(packageRoot, ideaId('ACME', 'long'))
  assert.deepEqual(persisted?.source_event_ids, [whyEvent, expressionEvent])
  assert.deepEqual(persisted?.source_themes, [{
    theme_id: 'THM-13da13da', theme_rev: 8,
    evidence_event_ids: [whyEvent, expressionEvent], why_now_event_id: whyEvent,
  }])
  assert.match(packagePrompt, new RegExp(`THM-13da13da@8; role=WHY_NOW; why_now_event=${whyEvent}`))
  assert.match(packagePrompt, new RegExp(`THM-13da13da@8; role=EXPRESSION_PROOF; why_now_event=${whyEvent}`))
  assert.match(packagePrompt, /thesis="The live grid backlog can extend pricing for Acme transformer capacity\."/)
  assert.match(packagePrompt, /context="A live transformer backlog meets Acme filing-backed capacity exposure\."/)
  assert.equal(persisted?.primary_source_event_id, whyEvent, 'launch binds the designated why-now event id')
  assert.equal(persisted?.source_headline, whyHeadline, 'the original why-now headline survives the bridge')
  assert.equal(persisted?.source_url, whyUrl, 'the designated why-now source URL survives the bridge')
  assert.equal(persisted?.source_name, 'Grid Regulator', 'the exact publisher survives the bridge')
  assert.equal(persisted?.newest_source_at, freshWhy.found_at, 'old structural proof cannot replace the fresh why-now clock')
} finally {
  fs.rmSync(packageRoot, { recursive: true, force: true })
  invalidateSymbolCache()
  resetSharedLimiters()
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
  if (isYahooSymbolDirectoryUrl(input)) {
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

// Event direction is a row-level impact label, not the sign of every related security. A negative event
// must still persist a verified long secondary beneficiary, while a long that reverses a uniquely bound
// negative primary-issuer row remains rejected.
const directionRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'idea-pass-direction-binding-'))
const directionState = path.join(directionRoot, '.state')
const directionInbox = path.join(directionRoot, 'screener', 'inbox')
const DIRECTION_NOW = NOW + 19 * 60_000
fs.mkdirSync(directionInbox, { recursive: true })
fs.writeFileSync(path.join(directionInbox, '2026-08-03_sweep.json'), JSON.stringify({
  updated_at: '2026-08-03T12:10:00Z', rows: [
    {
      headline: 'Harmed Corp loses its only supply licence', url: 'https://regulator.test/harmed-licence',
      source_name: 'Regulator', found_at: '2026-08-03T12:05:00Z', triage_score: 94,
      issuer_linkage: 'primary', event_direction: 'negative',
      companies: [{ name: 'Harmed Corp', ticker: null, listing_country: 'US' }],
    },
    {
      headline: 'Licence loss shifts orders to the named secondary supplier', url: 'https://regulator.test/beneficiary-orders',
      source_name: 'Regulator', found_at: '2026-08-03T12:04:00Z', triage_score: 93,
      issuer_linkage: 'secondary', event_direction: 'negative', companies: [
        { name: 'Harmed Corp', ticker: 'HARMED', listing_country: 'US' },
        { name: 'Benefit Corp', ticker: 'BENEFIT', listing_country: 'US' },
      ],
    },
    {
      headline: 'Norsk Hydro loses a material power contract', url: 'https://exchange.test/norsk-hydro-contract',
      source_name: 'Exchange', found_at: '2026-08-03T12:03:00Z', triage_score: 92,
      issuer_linkage: 'primary', event_direction: 'negative',
      companies: [{ name: 'Norsk Hydro ASA', ticker: 'NHY', listing_country: 'NO' }],
    },
  ],
}))
invalidateSymbolCache()
const directionFetch = (async (input: Parameters<typeof fetch>[0]) => {
  const url = String(input)
  if (isYahooSymbolDirectoryUrl(input)) {
    const q = new URL(url).searchParams.get('q') || ''
    const quote = q === 'HARMED'
      ? { quoteType: 'EQUITY', symbol: 'HARMED', longname: 'Harmed Corp', exchDisp: 'NYSE' }
      : q === 'BENEFIT'
        ? { quoteType: 'EQUITY', symbol: 'BENEFIT', longname: 'Benefit Corp', exchDisp: 'NASDAQ' }
        : q === 'NHY.OL'
          ? { quoteType: 'EQUITY', symbol: 'NHY.OL', longname: 'Norsk Hydro ASA', exchDisp: 'Oslo' }
        : null
    return new Response(JSON.stringify({ quotes: quote ? [quote] : [] }), { status: 200 })
  }
  return new Response(JSON.stringify({
    choices: [{ finish_reason: 'stop', message: { content: JSON.stringify({ ideas: [
      {
        src: [0], ticker: 'HARMED', company: 'Harmed Corp', exchange: 'NYSE', direction: 'long',
        reason: 'The licence loss can lift revenue', why_now: 'The regulator filed the decision today',
        conviction: 64, priced_in: 'room', thesis_type: 'company_specific',
      },
      {
        src: [1], ticker: 'BENEFIT', company: 'Benefit Corp', exchange: 'NASDAQ', direction: 'long',
        reason: 'Orders can shift to the named secondary supplier after its rival lost the licence',
        why_now: 'The regulator filed the licence decision today',
        conviction: 67, priced_in: 'room', thesis_type: 'company_specific',
      },
      {
        src: [2], ticker: 'NHY.OL', company: 'Norsk Hydro ASA', exchange: 'Oslo', direction: 'long',
        reason: 'The contract loss can lift revenue', why_now: 'The exchange disclosed the loss today',
        conviction: 66, priced_in: 'room', thesis_type: 'company_specific',
      },
      {
        src: [2], ticker: 'NHY.OL', company: 'Norsk Hydro ASA', exchange: 'Oslo', direction: 'short',
        reason: 'The contract loss can reduce revenue', why_now: 'The exchange disclosed the loss today',
        conviction: 66, priced_in: 'room', thesis_type: 'company_specific',
      },
    ] }) } }], usage: { total_tokens: 100 },
  }), { status: 200, headers: { 'content-type': 'application/json' } })
}) as typeof fetch
try {
  const result = await runIdeaPass({
    repoRoot: directionRoot, stateDir: directionState, config, refreshBoard: async () => {}, now: () => DIRECTION_NOW,
    fetchFn: directionFetch, sleep: async () => {}, persistHealth: true,
  })
  assert.equal(result.produced, 2, JSON.stringify(result))
  assert.equal(readIdeaById(directionRoot, ideaId('HARMED', 'long')), null, 'an exact negative primary company still rejects a naked long when title triage omitted its ticker')
  const beneficiary = readIdeaById(directionRoot, ideaId('BENEFIT', 'long'))
  assert.equal(beneficiary?.ticker, 'BENEFIT', 'a negative event can persist its verified secondary beneficiary as a long')
  assert.equal(beneficiary?.direction, 'long')
  assert.deepEqual(beneficiary?.source_event_ids, [eventIdFor('Licence loss shifts orders to the named secondary supplier', 'https://regulator.test/beneficiary-orders')])
  assert.equal(readIdeaById(directionRoot, ideaId('NHY.OL', 'long')), null, 'a negative issuer event cannot reverse direction just because triage used its unsuffixed base symbol')
  const suffixedShort = readIdeaById(directionRoot, ideaId('NHY.OL', 'short'))
  assert.equal(suffixedShort?.ticker, 'NHY.OL')
  assert.equal(suffixedShort?.direction, 'short', 'the same safely bound evidence admits its aligned direction')
} finally {
  fs.rmSync(directionRoot, { recursive: true, force: true })
  invalidateSymbolCache()
}

// A pair is persisted only after two independent exact-symbol directory checks. An unlisted first
// second-leg candidate or directory-proven self-pair must not reserve the stable primary+direction id.
// Same-base symbols on different venues remain valid when the directory identifies unrelated issuers.
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
  if (isYahooSymbolDirectoryUrl(input)) {
    const q = new URL(url).searchParams.get('q') || ''
    directoryQueries.push(q)
    const quote = q === 'PAIRPRIM'
      ? { quoteType: 'EQUITY', symbol: 'PAIRPRIM', longname: 'Pair Primary Corp', exchDisp: 'NYSE' }
      : q === 'BADPAIR'
        ? { quoteType: 'EQUITY', symbol: 'BADPAIR', longname: 'Bad Pair Corp', exchDisp: 'NYSE' }
        : q === 'GOODLEG'
        // Wire-only has no server-authoritative pair company name. Exact ticker+venue is the safe path;
        // this intentionally unrelated directory name proves no provider-authored name was trusted.
        ? { quoteType: 'EQUITY', symbol: 'GOODLEG', longname: 'Directory Returned Name Plc', exchDisp: 'NASDAQ' }
        : q === 'ALIAS'
          ? { quoteType: 'EQUITY', symbol: 'ALIAS', longname: 'Alias Holdings Inc', exchDisp: 'NYSE' }
          : q === 'ALIAS.NS'
            ? { quoteType: 'EQUITY', symbol: 'ALIAS.NS', longname: 'Alias Holdings Limited', exchDisp: 'NSE' }
            : q === 'SHARED'
              ? { quoteType: 'EQUITY', symbol: 'SHARED', longname: 'Shared Systems Inc', exchDisp: 'NYSE' }
              : q === 'SHARED.NS'
                ? { quoteType: 'EQUITY', symbol: 'SHARED.NS', longname: 'Shared Motors Limited', exchDisp: 'NSE' }
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
        src: [0, 1], ticker: 'BADPAIR', company: 'Bad Pair Corp', exchange: 'NYSE', direction: 'pair', pair_with: 'BADLEG',
        reason: 'The order shifts revenue toward the winner', why_now: 'The award was filed today',
        conviction: 66, priced_in: 'room', thesis_type: 'company_specific',
      },
      {
        src: [0, 1], ticker: 'ALIAS', company: 'Alias Holdings Inc', exchange: 'NYSE', direction: 'pair', pair_with: 'ALIAS.NS',
        reason: 'The order shifts revenue toward the winner', why_now: 'The award was filed today',
        conviction: 66, priced_in: 'room', thesis_type: 'company_specific',
      },
      {
        src: [0, 1], ticker: 'SHARED', company: 'Shared Systems Inc', exchange: 'NYSE', direction: 'pair', pair_with: 'SHARED.NS',
        reason: 'The order shifts revenue toward one unrelated same-symbol company', why_now: 'The award was filed today',
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
  assert.equal(result.produced, 2)
  assert.ok(directoryQueries.includes('BADPRIMARY'), 'an unlisted primary invalidates the whole pair')
  assert.equal(readIdeaById(pairRoot, ideaId('BADPRIMARY', 'pair')), null)
  assert.ok(directoryQueries.includes('BADLEG'), 'the unlisted second leg was independently checked')
  assert.equal(readIdeaById(pairRoot, ideaId('BADPAIR', 'pair')), null)
  assert.ok(directoryQueries.includes('GOODLEG'), 'rejection did not block the later valid pair')
  assert.equal(readIdeaById(pairRoot, ideaId('ALIAS', 'pair')), null, 'matching directory issuer identities reject a verified cross-listing self-pair')
  const sameBaseDistinctIssuer = readIdeaById(pairRoot, ideaId('SHARED', 'pair'))
  assert.equal(sameBaseDistinctIssuer?.pair_with, 'SHARED.NS', 'same-base symbols across venues persist when verified company identities differ')
  const persisted = readIdeaById(pairRoot, ideaId('PAIRPRIM', 'pair'))
  assert.equal(persisted?.pair_with, 'GOODLEG')
  assert.equal(persisted?.listing_verified, true, 'the primary leg also had to verify')
  assert.notEqual(persisted?.idea_version, ideaVersion({
    ticker: 'PAIRPRIM', direction: 'pair', pairWith: 'BADLEG', thesisType: 'company_specific',
    reason: persisted?.reason || '', whyNow: persisted?.why_now || '',
    sourceEventIds: persisted?.source_event_ids || [], originType: 'wire', sourceThemes: [],
    primarySourceEventId: persisted?.primary_source_event_id || '', sourceHeadline: persisted?.source_headline || '',
    sourceUrl: persisted?.source_url || '', sourceName: persisted?.source_name || '',
  }), 'the saved version binds the independently verified second leg')
} finally {
  fs.rmSync(pairRoot, { recursive: true, force: true })
  invalidateSymbolCache()
}

// A human/source mutation during the awaited directory lookup invalidates the whole provider package.
// No row from the old top-N may be persisted after an event is dismissed/withdrawn in that window.
const raceRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'idea-pass-source-race-'))
resetSharedLimiters()
const raceState = path.join(raceRoot, '.state')
const raceInbox = path.join(raceRoot, 'screener', 'inbox')
fs.mkdirSync(raceInbox, { recursive: true })
const raceSweepPath = path.join(raceInbox, '2026-08-03_sweep.json')
const raceRows = [
  { headline: 'Race Co wins a material contract', url: 'https://exchange.test/race', source_name: 'Exchange', found_at: '2026-08-03T10:00:00Z', triage_score: 91 },
  { headline: 'Race peer demand rises', url: 'https://exchange.test/race-peer', source_name: 'Exchange', found_at: '2026-08-03T09:00:00Z', triage_score: 84 },
]
fs.writeFileSync(raceSweepPath, JSON.stringify({ updated_at: '2026-08-03T11:30:00Z', rows: raceRows }))
let raceMutated = false
const raceFetch = (async (input: Parameters<typeof fetch>[0]) => {
  if (isYahooSymbolDirectoryUrl(input)) {
    if (!raceMutated) {
      raceMutated = true
      fs.writeFileSync(raceSweepPath, JSON.stringify({
        updated_at: '2026-08-03T11:31:00Z', rows: raceRows.slice(1),
      }))
    }
    return new Response(JSON.stringify({ quotes: [{ quoteType: 'EQUITY', symbol: 'RACE', longname: 'Race Co', exchDisp: 'NYSE' }] }), { status: 200 })
  }
  return new Response(JSON.stringify({
    choices: [{ finish_reason: 'stop', message: { content: JSON.stringify({ ideas: [{
      src: [0, 1], ticker: 'RACE', company: 'Race Co', exchange: 'NYSE', direction: 'long',
      reason: 'The contract can lift estimates', why_now: 'The exchange disclosed it today',
      conviction: 70, priced_in: 'room', thesis_type: 'company_specific',
    }] }) } }], usage: { total_tokens: 100 },
  }), { status: 200, headers: { 'content-type': 'application/json' } })
}) as typeof fetch
try {
  const result = await runIdeaPass({
    repoRoot: raceRoot, stateDir: raceState, config, refreshBoard: async () => {}, now: () => NOW,
    fetchFn: raceFetch, sleep: async () => {}, persistHealth: true,
  })
  assert.equal(result.reason_code, 'inputs_changed')
  assert.equal(result.produced, 0)
  assert.equal(readIdeaById(raceRoot, ideaId('RACE', 'long')), null, 'stale provider output never reaches the canonical store')
  assert.equal(readIdeasHealth(raceState, raceRoot, true, NOW).reason_code, 'inputs_changed')
} finally {
  fs.rmSync(raceRoot, { recursive: true, force: true })
  invalidateSymbolCache()
}

console.log('\n7 idea-pass integrity checks passed')
