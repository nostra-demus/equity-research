process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createTheme } from '../src/news/themes/discover'
import { themePlayerReadCandidates } from '../src/news/enrich-heal'
import { admitThemeToIdeas } from '../src/news/themes/idea-admission'
import { rebuildThemePlayers } from '../src/news/themes/players'
import { stepThemes } from '../src/news/themes/engine'
import { buildSummary, buildThemeDetail } from '../src/news/themes/store'
import { normName } from '../src/news/text-match'
import type { SupplyChainBoard } from '../src/supply-chain'
import type { Theme, ThemePlayer } from '../src/news/themes/types'
import { attachValidNarrative } from './themes-fixtures'

const NOW = new Date('2026-08-25T06:00:00Z')
const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')
const emptyBoard = (): SupplyChainBoard => ({ leads: [], anchors: [], health: {}, schema_version: 'supply-chain-board/v1', generated_at: NOW.toISOString(), score_basis: 'chain_evidence_v1' } as SupplyChainBoard)

function theme(): Theme {
  const value = createTheme([
    { event_id: 'evt-why', headline: 'Grid connection delays constrain AI data center capacity', found_at: '2026-08-25T05:00:00Z', companies: [], triage_score: 90, source_tier: 'news', source_name: 'Wire One', url: 'https://example.test/why' },
    { event_id: 'evt-player', headline: 'Vertiv wins cooling orders for constrained AI data center capacity', found_at: '2026-08-25T04:00:00Z', companies: [{ name: 'Vertiv Holdings', ticker: 'VRT', listing_country: 'US' }], triage_score: 88, source_tier: 'company', source_name: 'Vertiv release', url: 'https://example.test/player' },
  ], NOW, 'claude')
  value.theme_id = 'THM-players1'
  value.name = 'AI data-center capacity constraints'
  value.description = 'Power and cooling constraints are limiting AI data-center capacity.'
  attachValidNarrative(value, {
    why_now_event_id: 'evt-why',
    expressions: [{
      name_key: normName('Vertiv Holdings'), side: 'beneficiary', role: 'direct',
      mechanism: 'Cooling orders transmit constrained data-center capacity into Vertiv revenue.',
      evidence_event_ids: ['evt-player'],
    }],
  })
  value.player_contract_version = 1
  return value
}

function admission(players: ThemePlayer[], overrides: Partial<Parameters<typeof admitThemeToIdeas>[0]> = {}) {
  return admitThemeToIdeas({
    narrative_complete: true, support_count: 2, coherent: true, unresolved_challenge: false,
    pending_revalidation: false, why_now_event_id: 'evt-why', why_now_exact: true, why_now_current: true,
    players, theme_rev: 7, package_rev: 7, ...overrides,
  })
}

function prefixedTheme(prefix: string): Theme {
  const value = structuredClone(theme())
  value.theme_id = `THM-${prefix.padEnd(8, '0').slice(0, 8)}`
  const ids = new Map(value.members.map((member) => [member.event_id, `${prefix}-${member.event_id}`]))
  for (const member of value.members) member.event_id = ids.get(member.event_id)!
  value.narrative!.why_now_event_id = ids.get(value.narrative!.why_now_event_id)!
  for (const row of value.narrative!.evidence) row.event_id = ids.get(row.event_id)!
  for (const expression of value.narrative!.expressions) {
    expression.evidence_event_ids = expression.evidence_event_ids.map((eventId) => ids.get(eventId)!)
  }
  return value
}

let passed = 0
async function check(name: string, fn: () => void | Promise<void>) {
  try { await fn(); passed++; console.log(`  ok  ${name}`) }
  catch (error: any) { console.error(`FAIL  ${name}\n      ${error?.stack || error}`); process.exitCode = 1 }
}

await check('a first-order expression without an exact naming event is rejected', async () => {
  const value = theme()
  value.narrative!.expressions[0].evidence_event_ids = ['evt-why']
  const players = await rebuildThemePlayers(value, REPO_ROOT, fs.mkdtempSync(path.join(os.tmpdir(), 'theme-player-')), async () => ({ ticker: 'VRT', exchange: 'NYSE', companyName: 'Vertiv', source: 'yahoo_symbol_directory' }), emptyBoard())
  assert.deepEqual(players, [])
})

await check('a verified direct player with separate exact proof creates the same Ideas-ready package', async () => {
  const value = theme()
  const players = await rebuildThemePlayers(value, REPO_ROOT, fs.mkdtempSync(path.join(os.tmpdir(), 'theme-player-')), async () => ({ ticker: 'VRT', exchange: 'NYSE', companyName: 'Vertiv Holdings', source: 'yahoo_symbol_directory' }), emptyBoard())
  assert.equal(players.length, 1)
  assert.equal(players[0].listing_status, 'verified_public')
  assert.equal(players[0].idea_eligible, true)
  assert.equal(admission(players).admitted, true)
  value.players = players
  value.rev = 7
  const summary = buildSummary(value, NOW)
  assert.equal(summary.idea_ready, true)
  assert.deepEqual(summary.qualified_expressions.map((row) => row.ticker), ['VRT'])
})

await check('an unverified ticker stays visible as No verified listing and cannot seed Ideas', async () => {
  const players = await rebuildThemePlayers(theme(), REPO_ROOT, fs.mkdtempSync(path.join(os.tmpdir(), 'theme-player-')), async () => null, emptyBoard())
  assert.equal(players.length, 1)
  assert.equal(players[0].listing_status, 'no_verified_listing')
  assert.equal(players[0].ticker, null)
  assert.equal(admission(players).admitted, false)
})

await check('model-only inferred names and second-order rows without a sourced relationship are rejected', async () => {
  const value = theme()
  value.narrative!.expressions = []
  const stateDir = fs.mkdtempSync(path.join(os.tmpdir(), 'theme-player-'))
  fs.writeFileSync(path.join(stateDir, 'news-enrich-cache.json'), JSON.stringify({
    'evt-player': {
      event_id: 'evt-player', ok: true, complete: true, fetched_at: NOW.toISOString(), prior_coverage: [], related: [],
      beneficiaries: [
        { name: 'Imagined Winner', named_in_article: false, ticker: 'FAKE', mechanism: 'Model guess', order: 'second', relationship: 'supplier' },
        { name: 'Named But Unproven Link', named_in_article: true, ticker: 'LINK', mechanism: 'Unstated link', order: 'second', relationship: null },
      ], exposed: [],
    },
  }))
  const players = await rebuildThemePlayers(value, REPO_ROOT, stateDir, async () => ({ ticker: 'LINK', exchange: 'NYSE', companyName: 'Named But Unproven Link', source: 'yahoo_symbol_directory' }), emptyBoard())
  assert.deepEqual(players, [])
})

await check('article-named second-order relationship proof is eligible, but export-only proof is visible and ineligible', async () => {
  const value = theme()
  const stateDir = fs.mkdtempSync(path.join(os.tmpdir(), 'theme-player-'))
  fs.writeFileSync(path.join(stateDir, 'news-enrich-cache.json'), JSON.stringify({
    'evt-player': {
      event_id: 'evt-player', ok: true, complete: true, fetched_at: NOW.toISOString(), prior_coverage: [], related: [],
      beneficiaries: [{ name: 'Cooling Supplier', named_in_article: true, ticker: 'COOL', mechanism: 'The article states it supplies the cooling equipment.', order: 'second', relationship: 'supplier' }], exposed: [],
    },
  }))
  const board = emptyBoard()
  board.leads = [{ lead_id: 'lead-1', anchor_ticker: 'VRT', order: 2, name: 'Export Customer', symbol: 'EXPT', role: 'customer', mechanism: 'The export identifies it as a customer.', source_ref: 'Capital IQ row 8', source_file: '/data/relationships.json' } as any]
  const players = await rebuildThemePlayers(value, REPO_ROOT, stateDir, async (ticker, name) => ({ ticker, exchange: 'NYSE', companyName: name, source: 'yahoo_symbol_directory' }), board)
  const article = players.find((row) => row.name === 'Cooling Supplier')!
  const exported = players.find((row) => row.name === 'Export Customer')!
  assert.equal(article.idea_eligible, true)
  assert.equal(exported.idea_eligible, false)
  assert.equal(exported.evidence[0].source_ref, 'Capital IQ row 8')
  assert.equal(exported.evidence[0].source_file, '/data/relationships.json')
})

await check('the same why-now/player-proof event, challenges, pending evidence and revision drift all block admission', () => {
  const player: ThemePlayer = {
    name: 'Vertiv', ticker: 'VRT', listing_status: 'verified_public', order: 1, side: 'beneficiary',
    relationship: 'direct_subject', mechanism: 'Cooling orders lift revenue.', mechanism_basis: 'source_statement', idea_eligible: true,
    evidence: [{ kind: 'news', event_id: 'evt-why', headline: 'Exact', publisher: 'Wire', url: 'https://example.test/why', published_at: NOW.toISOString(), source_ref: null, source_file: null }],
  }
  assert.equal(admission([player]).admitted, false)
  player.evidence[0].event_id = 'evt-player'
  assert.equal(admission([player], { unresolved_challenge: true }).admitted, false)
  assert.equal(admission([player], { pending_revalidation: true }).admitted, false)
  assert.equal(admission([player], { package_rev: 6 }).admitted, false)
  player.side = 'unclear'
  assert.equal(admission([player]).admitted, false, 'an unclear direction cannot be converted into a long idea')
})

await check('background player reads reuse complete cache rows and enforce four per cycle and two per theme', () => {
  const themes = [prefixedTheme('readone'), prefixedTheme('readtwo'), prefixedTheme('readtre')]
  const completeId = themes[0].narrative!.why_now_event_id
  const cache = {
    [completeId]: {
      event_id: completeId, ok: true, complete: true, fetched_at: NOW.toISOString(),
      prior_coverage: [], related: [], gist: ['Cached body read'],
    },
  }
  const candidates = themePlayerReadCandidates(themes, cache, 4, 2)
  assert.equal(candidates.length, 4)
  assert.ok(!candidates.includes(completeId), 'a valid cached read spends no provider slot')
  for (const value of themes) {
    assert.ok(candidates.filter((eventId) => eventId.startsWith(value.theme_id.slice(4, 11))).length <= 2)
  }
})

await check('background player candidate ordering is stable with malformed or tied source clocks', () => {
  const value = prefixedTheme('stable01')
  const extras = ['stable-extra-b', 'stable-extra-a'].map((eventId) => ({
    ...value.members[0], event_id: eventId, dedup_group: `STORY-${eventId}`,
    headline: `Grid delays constrain ${eventId} AI data center capacity`, found_at: 'not-a-date',
    url: `https://example.test/${eventId}`,
  }))
  value.members.push(...extras)
  value.narrative!.evidence.push(...extras.map((member) => ({ event_id: member.event_id, stance: 'supports' as const })))
  const cache = Object.fromEntries([value.narrative!.why_now_event_id, ...value.narrative!.expressions[0].evidence_event_ids].map((eventId) => [eventId, {
    event_id: eventId, ok: true, complete: true, fetched_at: NOW.toISOString(), prior_coverage: [], related: [], gist: ['Cached body read'],
  }]))
  const forward = themePlayerReadCandidates([value], cache, 4, 4)
  value.members.reverse()
  const reversed = themePlayerReadCandidates([value], cache, 4, 4)
  assert.deepEqual(reversed, forward)
  assert.deepEqual(forward, ['stable-extra-a', 'stable-extra-b'])
})

await check('legacy player contracts drain through normal revalidation two themes at a time', async () => {
  const themes = [prefixedTheme('legacy01'), prefixedTheme('legacy02'), prefixedTheme('legacy03')]
  for (const value of themes) delete value.player_contract_version
  await stepThemes({
    themes, pool: [], items: [], runDiscovery: false, now: NOW,
    playerEvidenceFingerprints: new Map(themes.map((value) => [value.theme_id, `fp-${value.theme_id}`])),
  })
  assert.equal(themes.filter((value) => value.needs_player_revalidation).length, 2)
  assert.equal(themes.filter((value) => !value.needs_player_revalidation).length, 1)
})

await check('new cached player evidence queues the current contract for normal revalidation', async () => {
  const value = prefixedTheme('changed1')
  value.player_evidence_fingerprint = 'old-fingerprint'
  await stepThemes({
    themes: [value], pool: [], items: [], runDiscovery: false, now: NOW,
    playerEvidenceFingerprints: new Map([[value.theme_id, 'new-fingerprint']]),
  })
  assert.equal(value.needs_player_revalidation, true)
})

await check('a sliced detail never borrows evidence or players from outside its exact member projection', async () => {
  const value = theme()
  value.players = await rebuildThemePlayers(value, REPO_ROOT, fs.mkdtempSync(path.join(os.tmpdir(), 'theme-player-')), async () => ({ ticker: 'VRT', exchange: 'NYSE', companyName: 'Vertiv Holdings', source: 'yahoo_symbol_directory' }), emptyBoard())
  const whyNowMember = value.members.find((member) => member.event_id === 'evt-why')!
  const sameSliceSupport = {
    ...whyNowMember,
    event_id: 'evt-why-slice',
    dedup_group: 'STORY-why-slice',
    headline: 'Utility grid delays constrain additional AI data center capacity',
    found_at: '2026-08-25T03:00:00Z',
    url: 'https://example.test/why-slice',
  }
  value.members.push(sameSliceSupport)
  value.narrative!.evidence.push({ event_id: sameSliceSupport.event_id, stance: 'supports' })
  const detail = buildThemeDetail(fs.mkdtempSync(path.join(os.tmpdir(), 'theme-detail-')), value, { members: [whyNowMember, sameSliceSupport], now: NOW })
  const reverseDetail = buildThemeDetail(fs.mkdtempSync(path.join(os.tmpdir(), 'theme-detail-')), value, { members: [sameSliceSupport, whyNowMember], now: NOW })
  assert.deepEqual(new Set(detail.evidence_news.map((row) => row.event_id)), new Set(['evt-why', 'evt-why-slice']))
  assert.deepEqual(reverseDetail.evidence_news, detail.evidence_news, 'detail news order is independent of projected input order')
  assert.deepEqual(detail.players.first_order, [])
  assert.deepEqual(detail.players.second_order, [])
})

await check('a player whose exact proof is no longer active support cannot remain idea-eligible', async () => {
  const value = theme()
  value.players = await rebuildThemePlayers(value, REPO_ROOT, fs.mkdtempSync(path.join(os.tmpdir(), 'theme-player-')), async () => ({ ticker: 'VRT', exchange: 'NYSE', companyName: 'Vertiv Holdings', source: 'yahoo_symbol_directory' }), emptyBoard())
  const whyNowMember = value.members.find((member) => member.event_id === 'evt-why')!
  const replacementSupport = {
    ...whyNowMember,
    event_id: 'evt-replacement-support',
    dedup_group: 'STORY-replacement-support',
    headline: 'Utility grid delays constrain additional AI data center capacity',
    found_at: '2026-08-25T03:00:00Z',
    url: 'https://example.test/replacement-support',
  }
  value.members.push(replacementSupport)
  value.narrative!.evidence = value.narrative!.evidence
    .filter((row) => row.event_id !== 'evt-player')
    .concat({ event_id: replacementSupport.event_id, stance: 'supports' })
  value.narrative!.context_event_ids.push('evt-player')
  const summary = buildSummary(value, NOW)
  assert.equal(summary.player_counts.first_order, 0)
  assert.equal(summary.idea_ready, false)
})

console.log(`\nthemes-player-contract: ${passed} checks passed`)
