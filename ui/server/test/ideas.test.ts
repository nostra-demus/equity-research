// The PM-skim idea pass (news/ideas): the free-LLM idea extraction must be coerce-safe (model drift
// degrades to a dropped idea, never a crash), the batched call must honor the same reliability contract as
// triage (never throw, defer on !ok, report truncation), and idea identity must be stable so a re-surfacing
// updates in place. Pure + fetch-stubbed — spends no tokens, launches nothing.
// Run: npx tsx test/ideas.test.ts
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { buildIdeaUserMessage, coerceIdea, estimateIdeaTokens, surfaceIdeasBatch, type IdeaInputRow, type RawIdea } from '../src/news/ideas/surface-ideas'
import {
  finalizeIdeaPromotion, ideaDecayAt, ideaId, ideaSnapshotRevision, ideaVersion, pruneExpiredIdeas,
  isSurfacedIdeaSnapshot, readIdeaById, readIdeaSnapshotStore, readTopSweep, readTopSweepRows, releaseIdeaPromotion,
  reserveIdeaPromotion, retireUnadmittedThemeIdeas, topNEffectHash, topNHash, updateIdeaSnapshot, writeIdea, writeIdeaIfRevision,
} from '../src/news/ideas/ideas-store'
import { ideaLineageForRows, themeProofForIdea, tradeEvidenceForIdeaRows } from '../src/news/ideas/run-idea-pass'
import { scoreTradeCluster } from '../src/news/trade-score'
import { eventIdFor } from '../src/news/normalize'
import { createTheme } from '../src/news/themes/discover'
import { appendThemeMutations } from '../src/news/themes/store'
import type { ThemeItemView } from '../src/news/themes/types'
import { validIdeaSnapshot } from './ideas-fixture'

let passed = 0
async function check(name: string, fn: () => void | Promise<void>) {
  try { await fn(); passed++; console.log(`  ok  ${name}`) } catch (e: any) { console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`); process.exitCode = 1 }
}

const noSleep = async () => {}
// A fetch stub returning one chat-completion body (or an HTTP error), with header.get support.
function stubFetch(body: any, opts: { ok?: boolean; status?: number; finish?: string } = {}): typeof fetch {
  return (async () => ({
    ok: opts.ok !== false,
    status: opts.status ?? 200,
    headers: { get: () => null },
    async text() { return typeof body === 'string' ? body : JSON.stringify(body) },
    async json() {
      return { choices: [{ finish_reason: opts.finish ?? 'stop', message: { content: typeof body === 'string' ? body : JSON.stringify(body) } }], usage: { total_tokens: 1234 } }
    },
  })) as unknown as typeof fetch
}
const OPTS = { model: 'm', baseUrl: 'http://x', apiKey: 'k' }
const ROWS: IdeaInputRow[] = [
  { event_id: 'EVT-1', headline: 'A closes strait', headline_orig: 'A closes strait', url: 'http://a', source_name: 'Reuters', region: 'GLOBAL', materiality: 100, label: 'critical', event_types: ['macro_sector'], issuer_linkage: 'macro', companies: [], found_at: '2026-07-12T12:00:00Z' },
  { event_id: 'EVT-2', dedup_group: 'STORY-B', headline: 'B expands refinery', headline_orig: 'B expands refinery', url: 'http://b', source_name: 'BusinessLine', region: 'IN', materiality: 88, materiality_pre_score: 71, label: 'high', event_types: ['capex'], issuer_linkage: 'primary', companies: [{ name: 'B', ticker: 'BBB', listing_country: 'IN' }], found_at: '2026-07-12T11:00:00Z' },
]
const qualifiedExpression = (
  evidenceEventIds: string[],
  patch: Partial<{ name: string; name_key: string; ticker: string; listing_country: string | null; side: 'beneficiary' | 'harmed' }> = {},
) => ({
  name: 'Acme', name_key: 'acme', ticker: 'ACME', listing_country: 'US' as string | null,
  side: 'beneficiary' as const, evidence_event_ids: evidenceEventIds, ...patch,
})

// ---- coerceIdea ----
check('coerceIdea drops an idea with no valid source index', () => {
  assert.equal(coerceIdea({ src: [5], ticker: 'AAA' }, 2), null) // 5 out of range
  assert.equal(coerceIdea({ src: [], ticker: 'AAA' }, 2), null)
})
check('coerceIdea drops an idea with no valid ticker (no source = no claim)', () => {
  assert.equal(coerceIdea({ src: [0], ticker: '' }, 2), null)
  assert.equal(coerceIdea({ src: [0], ticker: 'this is not a ticker' }, 2), null)
})
check('coerceIdea clamps conviction and defaults side/priced/type safely', () => {
  const i = coerceIdea({ src: [0, 0, 9], ticker: 'stng', reason: 'Rates lift cash earnings', why_now: 'Results are due this month', conviction: 250, direction: 'sideways', priced_in: 'maybe', thesis_type: 'nonsense' }, 2)
  assert.ok(i)
  assert.equal(i!.conviction, 100)
  assert.equal(i!.ticker, 'STNG')            // uppercased
  assert.deepEqual(i!.src, [0])              // deduped, out-of-range 9 dropped
  assert.equal(i!.direction, 'long')          // bad enum -> safe default
  assert.equal(i!.priced_in, 'unknown')
  assert.equal(i!.thesis_type, 'company_specific')
})
check('coerceIdea keeps pair_with only for a pair', () => {
  const evidence = { src: [0], ticker: 'AAA', reason: 'Demand shifts market share', why_now: 'Results are due this month' }
  assert.equal(coerceIdea({ ...evidence, direction: 'long', pair_with: 'BBB' }, 2)!.pair_with, null)
  assert.equal(coerceIdea({ ...evidence, direction: 'pair', pair_with: 'bbb' }, 2)!.pair_with, 'BBB')
})
check('coerceIdea accepts the canonical global ticker contract for both legs', () => {
  const evidence = { src: [0], reason: 'Demand shifts market share', why_now: 'Results are due this month' }
  assert.equal(coerceIdea({ ...evidence, ticker: 'm&m.ns' }, 2)!.ticker, 'M&M.NS')
  assert.equal(coerceIdea({ ...evidence, ticker: 'ABCDEFGHIJKLMNO' }, 2)!.ticker, 'ABCDEFGHIJKLMNO')
  assert.equal(coerceIdea({ ...evidence, ticker: 'ACME', direction: 'pair', pair_with: 'm&m.ns' }, 2)!.pair_with, 'M&M.NS')
})
check('coerceIdea negative/NaN conviction floors at 0', () => {
  const evidence = { src: [0], ticker: 'AAA', reason: 'Demand lifts revenue', why_now: 'Results are due this month' }
  assert.equal(coerceIdea({ ...evidence, conviction: -5 }, 2)!.conviction, 0)
  assert.equal(coerceIdea({ ...evidence, conviction: 'x' }, 2)!.conviction, 0)
})
check('coerceIdea rejects missing mechanism/timing evidence and an incomplete pair', () => {
  assert.equal(coerceIdea({ src: [0], ticker: 'AAA', why_now: 'Results are due this month' }, 2), null)
  assert.equal(coerceIdea({ src: [0], ticker: 'AAA', reason: 'Demand lifts revenue' }, 2), null)
  assert.equal(coerceIdea({ src: [0], ticker: 'AAA', direction: 'pair', reason: 'Demand shifts share', why_now: 'Results are due this month' }, 2), null)
})

// ---- surfaceIdeasBatch (fetch-stubbed; never throws, honors the reliability contract) ----
check('surfaceIdeasBatch parses ideas and drops the invalid ones', async () => {
  const r = await surfaceIdeasBatch(ROWS, OPTS, stubFetch({ ideas: [
    { src: [0], ticker: 'STNG', direction: 'long', reason: 'Freight disruption lifts tanker rates', why_now: 'The strait closure is live now', conviction: 61 },
    { src: [1], ticker: '', direction: 'long' },        // dropped: no ticker
    { ticker: 'ZZZ' },                                    // dropped: no src
  ] }), noSleep)
  assert.equal(r.ok, true)
  assert.equal(r.ideas.length, 1)
  assert.equal(r.ideas[0].ticker, 'STNG')
})
check('surfaceIdeasBatch forwards the canonical overflow provider transport fields', async () => {
  let seenUrl = ''
  let seenInit: RequestInit | undefined
  const controller = new AbortController()
  const fetchFn = (async (input: Parameters<typeof fetch>[0], init?: RequestInit) => {
    seenUrl = String(input)
    seenInit = init
    return new Response(JSON.stringify({
      choices: [{ finish_reason: 'stop', message: { content: JSON.stringify({ ideas: [] }) } }],
      usage: { total_tokens: 10 },
    }), { status: 200, headers: { 'content-type': 'application/json' } })
  }) as typeof fetch
  const r = await surfaceIdeasBatch(ROWS, {
    ...OPTS, baseUrl: 'https://overflow.test/v1', model: 'primary', models: ['primary', 'backup'],
    headers: { 'X-Provider': 'kept' }, extraBody: { reasoning_effort: 'low' }, maxAttempts: 1,
    timeoutMs: 5_000, signal: controller.signal,
  }, fetchFn, noSleep)
  assert.equal(r.ok, true)
  assert.equal(seenUrl, 'https://overflow.test/v1/chat/completions')
  assert.equal((seenInit?.headers as Record<string, string>)['X-Provider'], 'kept')
  assert.ok(seenInit?.signal)
  const body = JSON.parse(String(seenInit?.body))
  assert.equal(body.model, 'primary')
  assert.deepEqual(body.models, ['primary', 'backup'])
  assert.equal(body.reasoning_effort, 'low')
})
check('surfaceIdeasBatch: empty rows is a no-op ok (no spend)', async () => {
  const r = await surfaceIdeasBatch([], OPTS, stubFetch({ ideas: [] }), noSleep)
  assert.equal(r.ok, true); assert.equal(r.requests, 0); assert.equal(r.ideas.length, 0)
})
check('surfaceIdeasBatch: missing api key returns ok:false without a call', async () => {
  const r = await surfaceIdeasBatch(ROWS, { ...OPTS, apiKey: '' }, stubFetch({ ideas: [] }), noSleep)
  assert.equal(r.ok, false); assert.equal(r.requests, 0)
})
check('surfaceIdeasBatch: a max_tokens truncation is reported, not half-parsed', async () => {
  const r = await surfaceIdeasBatch(ROWS, OPTS, stubFetch({ ideas: [{ src: [0], ticker: 'AAA' }] }, { finish: 'length' }), noSleep)
  assert.equal(r.ok, false); assert.equal(r.failureKind, 'contract'); assert.equal(r.ideas.length, 0); assert.match(r.note || '', /truncated/)
})
check('surfaceIdeasBatch: a terminal HTTP error returns ok:false (deferred, not scored-zero)', async () => {
  const r = await surfaceIdeasBatch(ROWS, OPTS, stubFetch('bad', { ok: false, status: 400 }), noSleep, noSleep)
  assert.equal(r.ok, false); assert.equal(r.failureKind, 'request'); assert.equal(r.httpStatus, 400); assert.match(r.note || '', /HTTP 400/)
})
check('surfaceIdeasBatch: non-JSON content returns ok:false, never throws', async () => {
  const r = await surfaceIdeasBatch(ROWS, OPTS, stubFetch('not json at all'), noSleep)
  assert.equal(r.ok, false); assert.equal(r.failureKind, 'contract')
})
check('surfaceIdeasBatch: only a literal top-level ideas array can be an honest empty result', async () => {
  const missing = await surfaceIdeasBatch(ROWS, OPTS, stubFetch({ result: [] }), noSleep)
  assert.equal(missing.ok, false)
  assert.match(missing.note || '', /invalid response schema/)

  const wrongTopLevel = await surfaceIdeasBatch(ROWS, OPTS, stubFetch([]), noSleep)
  assert.equal(wrongTopLevel.ok, false)
  assert.match(wrongTopLevel.note || '', /invalid response schema/)

  const empty = await surfaceIdeasBatch(ROWS, OPTS, stubFetch({ ideas: [] }), noSleep)
  assert.equal(empty.ok, true)
  assert.equal(empty.ideas.length, 0)
})
check('surfaceIdeasBatch: a non-empty response with no valid rows fails closed', async () => {
  const r = await surfaceIdeasBatch(ROWS, OPTS, stubFetch({ ideas: [
    { src: [99], ticker: 'AAA' },
    { src: [0], ticker: '' },
  ] }), noSleep)
  assert.equal(r.ok, false)
  assert.equal(r.ideas.length, 0)
  assert.match(r.note || '', /no valid idea rows/)
})
check('surfaceIdeasBatch separates malformed HTTP-200 envelopes from provider availability', async () => {
  let jsonFetches = 0
  const malformedJson = (async () => {
    jsonFetches++
    return { ok: true, status: 200, headers: { get: () => null }, json: async () => { throw new SyntaxError('malformed response JSON') } }
  }) as unknown as typeof fetch
  const decoded = await surfaceIdeasBatch(ROWS, { ...OPTS, maxAttempts: 2 }, malformedJson, noSleep)
  assert.equal(jsonFetches, 1, 'a contract-broken envelope is not retried against the same provider')
  assert.equal(decoded.requests, 1)
  assert.equal(decoded.failureKind, 'contract', 'malformed success JSON must never cool shared triage')

  let bodyFetches = 0
  const unreadableBody = (async () => {
    bodyFetches++
    return { ok: false, status: 503, headers: { get: () => null }, text: async () => { throw new Error('body read failed') } }
  }) as unknown as typeof fetch
  const rejected = await surfaceIdeasBatch(ROWS, { ...OPTS, maxAttempts: 2 }, unreadableBody, noSleep)
  assert.equal(bodyFetches, 2)
  assert.equal(rejected.requests, 2, 'response.text failure is counted once per HTTP attempt')
})
check('surfaceIdeasBatch stops retries immediately when its parent operation is aborted', async () => {
  const controller = new AbortController()
  controller.abort(new DOMException('chain ended', 'AbortError'))
  let fetches = 0
  let sleeps = 0
  const r = await surfaceIdeasBatch(ROWS, { ...OPTS, maxAttempts: 2, signal: controller.signal }, (async (_input, init) => {
    fetches++
    throw init?.signal?.reason || new DOMException('aborted', 'AbortError')
  }) as typeof fetch, async () => { sleeps++ })
  assert.equal(r.ok, false)
  assert.equal(r.failureKind, 'availability')
  assert.equal(fetches, 1)
  assert.equal(sleeps, 0, 'a cancelled parent never pays retry backoff or starts a second request')
})

// ---- identity + helpers ----
check('ideaId is stable and differs by direction', () => {
  assert.equal(ideaId('STNG', 'long'), ideaId('stng', 'long'))      // case-insensitive
  assert.notEqual(ideaId('STNG', 'long'), ideaId('STNG', 'short'))  // direction is part of identity
  assert.match(ideaId('STNG', 'long'), /^IDEA-[a-f0-9]{12}$/)
})
check('ideaVersion binds the exact thesis and source snapshot', () => {
  const base = { ticker: 'BBB', direction: 'long' as const, pairWith: null, thesisType: 'company_specific' as const, reason: 'Refinery adds output', whyNow: 'Results on 2026-08-06', sourceEventIds: ['EVT-2'] }
  assert.equal(ideaVersion(base), ideaVersion({ ...base, ticker: 'bbb' }))
  assert.notEqual(ideaVersion(base), ideaVersion({ ...base, sourceEventIds: ['EVT-3'] }))

  const themed = {
    ...base,
    sourceEventIds: ['EVT-2', 'EVT-3'],
    originType: 'theme' as const,
    sourceThemes: [{ theme_id: 'THM-a1b2c3d4', theme_rev: 2, evidence_event_ids: ['EVT-2'] }],
  }
  assert.notEqual(
    ideaVersion(themed),
    ideaVersion({ ...themed, sourceThemes: [{ ...themed.sourceThemes[0], theme_rev: 3 }] }),
    'a new Theme revision is a new exact thesis snapshot',
  )
  assert.notEqual(
    ideaVersion(themed),
    ideaVersion({ ...themed, sourceThemes: [{ ...themed.sourceThemes[0], evidence_event_ids: ['EVT-3'] }] }),
    'changing only the evidence mapped to a Theme is a new exact thesis snapshot',
  )
  const pair = { ...base, ticker: 'AMD', direction: 'pair' as const, pairWith: 'INTC' }
  assert.notEqual(ideaVersion(pair), ideaVersion({ ...pair, pairWith: 'NVDA' }), 'AMD paired with INTC is a different immutable call from AMD paired with NVDA')
  assert.equal(ideaVersion({ ...pair, pairWith: 'BRK-B' }), ideaVersion({ ...pair, pairWith: 'BRK.B' }), 'the pair leg uses normalized ticker spelling')
  assert.equal(ideaVersion({
    ticker: 'AMD', direction: 'pair', pairWith: 'INTC', thesisType: 'company_specific',
    reason: '  Demand   shifts share ', whyNow: 'Results due now', sourceEventIds: ['EVT-0123456789ab'],
    originType: 'wire', sourceThemes: [],
  }), 'IDEAV-02ebcb0b4c9452ba', 'TypeScript and the static Python verifier share one canonical pair-version vector')
})
check('persisted snapshot validation binds the complete shape, identity, sources, scores, and lifecycle', () => {
  const valid = validIdeaSnapshot('BOUND')
  assert.equal(isSurfacedIdeaSnapshot(valid), true)
  assert.equal(isSurfacedIdeaSnapshot({ ...valid, trade_score: Number.NaN }), false)
  assert.equal(isSurfacedIdeaSnapshot({ ...valid, conviction: 101 }), false)
  assert.equal(isSurfacedIdeaSnapshot({ ...valid, source_event_ids: ['EVT-notcanonical'] }), false)
  assert.equal(isSurfacedIdeaSnapshot({ ...valid, idea_id: ideaId('OTHER', 'long') }), false)
  assert.equal(isSurfacedIdeaSnapshot({ ...valid, idea_version: 'IDEAV-0000000000000000' }), false)
  assert.equal(isSurfacedIdeaSnapshot({ ...valid, idea_version_started_at: '2026-08-03T07:00:00Z' }), false)
  const missing = { ...valid } as any
  delete missing.why_now
  assert.equal(isSurfacedIdeaSnapshot(missing), false)
  assert.equal(isSurfacedIdeaSnapshot(validIdeaSnapshot('M&M.NS')), true, 'NSE ampersand tickers survive persistence')
  assert.equal(isSurfacedIdeaSnapshot(validIdeaSnapshot('ABCDEFGHIJKLMNO')), true, '15-character global tickers survive persistence')
  assert.equal(isSurfacedIdeaSnapshot(validIdeaSnapshot('ACME', 'pair', { pair_with: 'M&M.NS' })), true, 'pair legs use the same global ticker contract')
})
check('snapshot validation accepts only field-absent legacy lineage and binds every new Theme edge', () => {
  const legacy = validIdeaSnapshot('LINEAGE')
  assert.equal(isSurfacedIdeaSnapshot(legacy), true)
  const sourceTheme = { theme_id: 'THM-a1b2c3d4', theme_rev: 7 }
  assert.equal(isSurfacedIdeaSnapshot(validIdeaSnapshot('LINEAGE', 'long', { origin_type: 'wire', source_themes: [] })), true)
  assert.equal(isSurfacedIdeaSnapshot(validIdeaSnapshot('LINEAGE', 'long', { origin_type: 'theme', source_themes: [sourceTheme] })), false)
  assert.equal(isSurfacedIdeaSnapshot(validIdeaSnapshot('LINEAGE', 'long', { origin_type: 'mixed', source_themes: [sourceTheme] })), false)
  assert.equal(isSurfacedIdeaSnapshot({ ...legacy, origin_type: 'theme' }), false, 'partial deploy lineage fails closed')
  assert.equal(isSurfacedIdeaSnapshot({ ...legacy, source_themes: [sourceTheme] }), false)
  assert.equal(isSurfacedIdeaSnapshot({ ...legacy, origin_type: 'wire', source_themes: [sourceTheme] }), false)
  assert.equal(isSurfacedIdeaSnapshot({ ...legacy, origin_type: 'theme', source_themes: [] }), false)
  assert.equal(isSurfacedIdeaSnapshot({ ...legacy, origin_type: 'theme', source_themes: [{ ...sourceTheme, theme_rev: 0 }] }), false)
  assert.equal(isSurfacedIdeaSnapshot({ ...legacy, origin_type: 'theme', source_themes: [sourceTheme, sourceTheme] }), false)

  const mappedBase = validIdeaSnapshot('MAPPED')
  const mappedTheme = { ...sourceTheme, evidence_event_ids: [mappedBase.source_event_ids[0]] }
  const mapped = validIdeaSnapshot('MAPPED', 'long', { origin_type: 'theme', source_themes: [mappedTheme] })
  assert.equal(isSurfacedIdeaSnapshot(mapped), true, 'mapped Theme evidence must resolve to an idea source event')
  assert.equal(isSurfacedIdeaSnapshot({ ...mapped, idea_version: legacy.idea_version }), false, 'a pre-lineage version cannot claim mapped new lineage')
  assert.equal(isSurfacedIdeaSnapshot(validIdeaSnapshot('MAPPED', 'long', {
    origin_type: 'theme', source_themes: [{ ...sourceTheme, evidence_event_ids: ['not-an-event'] }],
  })), false, 'malformed Theme evidence IDs fail closed')
  assert.equal(isSurfacedIdeaSnapshot(validIdeaSnapshot('MAPPED', 'long', {
    origin_type: 'theme', source_themes: [{ ...sourceTheme, evidence_event_ids: [] }],
  })), false, 'a mapped Theme with no evidence mapping fails closed')
  assert.equal(isSurfacedIdeaSnapshot(validIdeaSnapshot('MAPPED', 'long', {
    origin_type: 'theme', source_themes: [{
      ...sourceTheme,
      evidence_event_ids: [eventIdFor('Unrelated event', 'https://exchange.test/unrelated')],
    }],
  })), false, 'a Theme cannot cite an event absent from source_event_ids')
  assert.equal(isSurfacedIdeaSnapshot(validIdeaSnapshot('MAPPED', 'long', {
    origin_type: 'theme',
    source_themes: [mappedTheme, { theme_id: 'THM-b2c3d4e5', theme_rev: 1 }],
  })), false, 'a partially mapped Theme lineage cannot hide a missing evidence mapping')
})
check('only distinguishable pre-lineage snapshots may retain the old pair-unbound version', () => {
  const legacy = validIdeaSnapshot('AMD', 'pair', { pair_with: 'INTC' })
  const oldCanonical = [
    legacy.ticker.toUpperCase(), legacy.direction, legacy.thesis_type,
    legacy.reason.trim().toLowerCase().replace(/\s+/g, ' '),
    legacy.why_now.trim().toLowerCase().replace(/\s+/g, ' '),
    [...new Set(legacy.source_event_ids)].sort().join(','),
  ].join('|')
  const oldVersion = 'IDEAV-' + createHash('sha256').update(oldCanonical).digest('hex').slice(0, 16)
  assert.equal(isSurfacedIdeaSnapshot({ ...legacy, idea_version: oldVersion }), true)

  const lineaged = validIdeaSnapshot('AMD', 'pair', {
    pair_with: 'INTC', origin_type: 'wire', source_themes: [],
  })
  assert.equal(isSurfacedIdeaSnapshot({ ...lineaged, idea_version: oldVersion }), false, 'explicit new lineage cannot use the migration recipe')
  assert.equal(isSurfacedIdeaSnapshot({ ...lineaged, pair_with: 'NVDA' }), false, 'changing only the persisted pair leg invalidates the new version')
})
check('idea lineage is derived only from supplied raw source rows', () => {
  const theme = { theme_id: 'THM-a1b2c3d4', theme_rev: 2 }
  const themeWithEvidence = { ...theme, evidence_event_ids: [ROWS[1].event_id] }
  assert.deepEqual(ideaLineageForRows([{ ...ROWS[0], origin_type: 'wire', source_themes: [] }]), { origin_type: 'wire', source_themes: [] })
  assert.deepEqual(ideaLineageForRows([{ ...ROWS[1], origin_type: 'theme', source_themes: [theme] }]), { origin_type: 'theme', source_themes: [themeWithEvidence] })
  assert.deepEqual(ideaLineageForRows([
    { ...ROWS[0], origin_type: 'wire', source_themes: [] },
    { ...ROWS[1], origin_type: 'theme', source_themes: [theme] },
  ]), { origin_type: 'mixed', source_themes: [themeWithEvidence] })
})
check('Theme provider output must bind exact qualified issuer, listing, side, and pair leg', () => {
  const eventId = 'EVT-0123456789ab'
  const themeRow: IdeaInputRow = {
    ...ROWS[0], event_id: eventId, origin_type: 'theme',
    source_themes: [{ theme_id: 'THM-a1b2c3d4', theme_rev: 3, evidence_event_ids: [eventId] }],
    theme_expressions: [{
      theme_id: 'THM-a1b2c3d4', theme_rev: 3, name: 'Berkshire Hathaway',
      name_key: 'berkshirehathaway', ticker: 'BRK.B', listing_country: 'US', side: 'beneficiary',
      evidence_event_ids: [eventId],
    }],
  }
  const raw: RawIdea = {
    src: [0], ticker: 'BRK-B', company: 'Berkshire Hathaway', exchange: 'NYSE', direction: 'long', pair_with: null,
    reason: 'Insurance pricing can lift earnings', why_now: 'Results are due this month', conviction: 60,
    priced_in: 'unknown', thesis_type: 'company_specific',
  }
  assert.deepEqual([...themeProofForIdea(raw, [themeRow])!.evidenceByTheme.get('THM-a1b2c3d4@3')!], [eventId], 'share-class separator aliases are equivalent')
  assert.equal(themeProofForIdea({ ...raw, ticker: 'BRK.B.NS' }, [themeRow]), null, 'exchange/base aliases are not silently widened')
  assert.equal(themeProofForIdea({ ...raw, company: 'Berkshire Energy' }, [themeRow]), null)
  assert.equal(themeProofForIdea({ ...raw, direction: 'short' }, [themeRow]), null, 'beneficiary proof cannot support a short')

  const pairRow: IdeaInputRow = {
    ...themeRow,
    theme_expressions: [...themeRow.theme_expressions!, {
      theme_id: 'THM-a1b2c3d4', theme_rev: 3, name: 'JPMorgan Chase', name_key: 'jpmorganchase',
      ticker: 'JPM', listing_country: 'US', side: 'harmed', evidence_event_ids: [eventId],
    }],
  }
  const pair = { ...raw, direction: 'pair' as const, pair_with: 'JPM' }
  assert.equal(themeProofForIdea(pair, [pairRow])?.pairCompanyName, 'JPMorgan Chase')
  assert.equal(themeProofForIdea({ ...pair, pair_with: 'BAC' }, [pairRow]), null)
  assert.ok(themeProofForIdea({ ...raw, ticker: 'UNBOUND', company: 'Anything' }, [{ ...ROWS[0], origin_type: 'wire', source_themes: [] }]), 'wire-only behavior is unchanged')
})
check('auto-idea evidence carries raw impact and story dedup without substituting the composite severity label', () => {
  const evidence = tradeEvidenceForIdeaRows(ROWS)
  assert.equal(evidence[1].materiality_pre_score, 71)
  assert.equal(evidence[1].dedup_group, 'STORY-B')
  assert.equal(evidence[1].impact_magnitude, undefined, 'score-derived label is not body-read economic impact')
  const scored = scoreTradeCluster(evidence, { ticker: 'BBB', exchange: 'NSE', tickerVerified: true, listingVerified: true })
  assert.equal(scored.breakdown.impact, 18)
  assert.equal(scored.readiness, 'needs_data', 'independently verified listing advances past watch-only while liquidity remains explicit')
  assert.ok(scored.missingChecks.includes('live liquidity'))
})
check('topNHash tracks only the ordered model-visible prompt', () => {
  assert.notEqual(topNHash(ROWS), topNHash([...ROWS].reverse()), 'row order changes the numbered model prompt')
  assert.notEqual(topNHash(ROWS), topNHash([ROWS[0]]))
  assert.notEqual(
    topNHash(ROWS, 'system prompt version A'),
    topNHash(ROWS, 'system prompt version B'),
    'the cache key covers the model-visible system prompt as well as the user message',
  )
  assert.equal(
    topNHash([ROWS[0]]),
    topNHash([{ ...ROWS[0], origin_type: 'theme', source_themes: [{ theme_id: 'THM-a1b2c3d4', theme_rev: 99 }] }]),
    'theme persistence metadata is not sent to the model and cannot force a new call',
  )
  assert.notEqual(topNHash([ROWS[0]]), topNHash([{ ...ROWS[0], headline: 'Visible prompt changed' }]))

  const effectV1: IdeaInputRow = {
    ...ROWS[0], origin_type: 'theme',
    source_themes: [{ theme_id: 'THM-a1b2c3d4', theme_rev: 1, evidence_event_ids: ['EVT-0123456789ab'] }],
    theme_expressions: [{
      theme_id: 'THM-a1b2c3d4', theme_rev: 1, name: 'Acme', name_key: 'acme', ticker: 'ACME',
      listing_country: 'US', side: 'beneficiary', evidence_event_ids: ['EVT-0123456789ab'],
    }],
  }
  const effectV2: IdeaInputRow = {
    ...effectV1,
    source_themes: [{ ...effectV1.source_themes![0], theme_rev: 2 }],
    theme_expressions: [{ ...effectV1.theme_expressions![0], theme_rev: 2 }],
  }
  assert.equal(topNHash([effectV1]), topNHash([effectV2]), 'revision metadata does not change provider spend input')
  assert.notEqual(topNEffectHash([effectV1]), topNEffectHash([effectV2]), 'revision metadata does change persistence effects')
})
check('lead decay stays anchored to source time instead of resetting at provider time', () => {
  const now = Date.parse('2026-08-03T12:00:00Z')
  assert.equal(ideaDecayAt('2026-08-03T06:00:00Z', now, 36), '2026-08-04T18:00:00Z')
  assert.equal(ideaDecayAt('2026-08-03T12:03:00Z', now, 36), '2026-08-05T00:00:00Z', 'small future source skew cannot extend the shelf')
})
check('buildIdeaUserMessage carries the pre-computed materiality + names', () => {
  const msg = buildIdeaUserMessage(ROWS)
  assert.match(msg, /materiality=100/)
  assert.match(msg, /B \(BBB\)/)      // company name+ticker
  assert.match(msg, /severity=critical/)
})
check('estimateIdeaTokens grows with the row count', () => {
  assert.ok(estimateIdeaTokens(12) > estimateIdeaTokens(2))
})

// ---- readTopSweepRows (fs, temp repo) ----
check('readTopSweepRows reads the freshest sweep, sorts by materiality, drops consumed/dismissed', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ideas-'))
  const inbox = path.join(dir, 'screener', 'inbox')
  fs.mkdirSync(inbox, { recursive: true })
  fs.writeFileSync(path.join(inbox, '2026-07-10_sweep.json'), JSON.stringify({ rows: [{ headline: 'stale day', url: 'http://s', triage_score: 99 }] }))
  fs.writeFileSync(path.join(inbox, '2026-07-12_sweep.json'), JSON.stringify({ rows: [
    { headline: 'low', url: 'http://l', triage_score: 20, source_name: 'X' },
    { headline: 'top', url: 'http://t', triage_score: 95, materiality_pre_score: 72, dedup_group: 'STORY-top', source_name: 'X' },
    { headline: 'consumed', url: 'http://c', triage_score: 90, consumed: true },
    { headline: 'no score', url: 'http://n' },
  ] }))
  const rows = readTopSweepRows(dir, 5)
  assert.equal(rows.length, 2)              // consumed + no-score dropped; stale day's file ignored (newest only)
  assert.equal(rows[0].headline, 'top')     // sorted by materiality desc
  assert.equal(rows[1].headline, 'low')
  assert.equal(rows[0].event_id, eventIdFor('top', 'http://t')) // canonical id, matches the wire/ledger join key
  assert.equal(rows[0].materiality_pre_score, 72)
  assert.equal(rows[0].dedup_group, 'STORY-top')
  fs.rmSync(dir, { recursive: true, force: true })
})
check('readTopSweepRows keeps the ORIGINAL headline for the SIG byte-match on a non-English row', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ideas-'))
  const inbox = path.join(dir, 'screener', 'inbox')
  fs.mkdirSync(inbox, { recursive: true })
  fs.writeFileSync(path.join(inbox, '2026-07-12_sweep.json'), JSON.stringify({ rows: [
    { headline: 'ソフトバンクが半導体を売却', headline_en: 'SoftBank to sell chip business', url: 'http://jp', triage_score: 80, source_name: 'Nikkei' },
  ] }))
  const [row] = readTopSweepRows(dir, 5)
  assert.equal(row.headline, 'SoftBank to sell chip business')      // display + LLM use the translation
  assert.equal(row.headline_orig, 'ソフトバンクが半導体を売却')       // promote uses the ORIGINAL -> SIG byte-matches the wire launch
  assert.equal(row.event_id, eventIdFor('ソフトバンクが半導体を売却', 'http://jp')) // canonical id over the original
  fs.rmSync(dir, { recursive: true, force: true })
})
check('readTopSweep enforces both sweep and per-row freshness when an operational ceiling is supplied', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ideas-'))
  const inbox = path.join(dir, 'screener', 'inbox')
  fs.mkdirSync(inbox, { recursive: true })
  fs.writeFileSync(path.join(inbox, '2026-08-03_sweep.json'), JSON.stringify({
    updated_at: '2026-08-03T11:00:00Z',
    rows: [
      { headline: 'fresh', url: 'http://fresh', triage_score: 90, found_at: '2026-08-03T10:00:00Z' },
      { headline: 'old', url: 'http://old', triage_score: 95, found_at: '2026-08-01T10:00:00Z' },
      { headline: 'bad time', url: 'http://bad', triage_score: 80, found_at: 'yesterday' },
    ],
  }))
  const got = readTopSweep(dir, 5, { nowMs: Date.parse('2026-08-03T12:00:00Z'), maxAgeMs: 36 * 3_600_000 })
  assert.equal(got.status, 'ok')
  assert.deepEqual(got.rows.map((r) => r.headline), ['fresh'])
  assert.equal(got.stale_row_count, 1)
  assert.equal(got.invalid_time_count, 1)
  fs.rmSync(dir, { recursive: true, force: true })
})
check('readTopSweep reserves at most one-third for actionable theme evidence and dedupes publisher copies', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ideas-theme-link-'))
  const inbox = path.join(dir, 'screener', 'inbox')
  const board = path.join(dir, 'screener', 'board')
  fs.mkdirSync(inbox, { recursive: true })
  fs.mkdirSync(board, { recursive: true })
  const at = '2026-08-03T10:00:00Z'
  const make = (headline: string, url: string, score: number, source = 'Feed Publisher', dedup?: string) => ({
    kind: 'item', ts: at, found_at: at, event_id: eventIdFor(headline, url), headline, url, domain: 'news.test',
    source_name: source, via: 'rss', region: 'US', input_nature: 'news_headline', triage_score: score,
    band: 'watch', triage_reason: 'material', relevance: 'material', event_types: ['operational'],
    issuer_linkage: 'primary', companies: [], size_bucket: 'large', dedup_status: 'new', dedup_group: dedup,
    inboxed: true,
  })
  const wire = [
    make('Wire one', 'https://news.test/w1', 99, 'Feed Publisher', 'STORY-wire-one'), make('Wire two', 'https://news.test/w2', 98),
    make('Wire three', 'https://news.test/w3', 97), make('Wire four', 'https://news.test/w4', 96),
    make('Wire five', 'https://news.test/w5', 95), make('Wire six', 'https://news.test/w6', 94),
    make('Forming evidence', 'https://news.test/f', 93), make('Context evidence', 'https://news.test/c', 92),
    make('Actionable evidence', 'https://news.test/a', 91, 'Feed Publisher', 'STORY-action'),
  ]
  const publisherCopy = make('Actionable evidence', 'https://copy.test/a', 90, 'Copy Publisher', 'STORY-action')
  const themeCopyOfTopWire = make('Wire one: syndicated rewrite', 'https://copy.test/w1', 99, 'Copy Publisher', 'STORY-wire-one')
  fs.writeFileSync(path.join(inbox, '2026-08-03_sweep.json'), JSON.stringify({
    updated_at: '2026-08-03T11:00:00Z',
    rows: wire.map((item) => ({ ...item, found_at: item.ts })),
  }))
  fs.writeFileSync(path.join(inbox, '2026-08-03_firehose.ndjson'), [...wire.slice(6), publisherCopy, themeCopyOfTopWire].map((item) => JSON.stringify(item)).join('\n') + '\n')
  fs.writeFileSync(path.join(board, 'themes_index.json'), JSON.stringify({ generated_at: '2026-08-03T11:55:00Z', themes: [
    { theme_id: 'THM-11111111', rev: 1, assessment: { status: 'forming' }, evidence: [{ event_id: wire[6].event_id, found_at: at }] },
    { theme_id: 'THM-22222222', rev: 1, assessment: { status: 'context' }, evidence: [{ event_id: wire[7].event_id, found_at: at }] },
    { theme_id: 'THM-a1b2c3d4', rev: 4, assessment: { status: 'actionable' }, evidence: [
      { event_id: wire[8].event_id, headline: 'must not be mapped', found_at: at },
      { event_id: publisherCopy.event_id, found_at: at },
      { event_id: themeCopyOfTopWire.event_id, found_at: at },
    ], qualified_expressions: [qualifiedExpression([wire[8].event_id, publisherCopy.event_id, themeCopyOfTopWire.event_id])] },
  ] }))

  const got = readTopSweep(dir, 6, { nowMs: Date.parse('2026-08-03T12:00:00Z'), maxAgeMs: 36 * 3_600_000 })
  assert.equal(got.rows.length, 6, 'theme reserve never exceeds the configured total cap')
  assert.deepEqual(got.rows.map((row) => row.headline), ['Wire one: syndicated rewrite', 'Wire two', 'Wire three', 'Wire four', 'Wire five', 'Actionable evidence'])
  assert.equal(got.rows.some((row) => row.headline === 'Forming evidence' || row.headline === 'Context evidence'), false)
  const linked = got.rows.find((row) => row.headline === 'Actionable evidence')!
  assert.equal(linked.source_name, 'Feed Publisher', 'the resolved FeedItem, not theme-summary text, supplies facts')
  assert.equal(linked.url, 'https://news.test/a')
  assert.equal(linked.origin_type, 'theme', 'a row below the ordinary capped wire is theme-only even if it was present in the uncapped sweep')
  assert.deepEqual(linked.source_themes, [{
    theme_id: 'THM-a1b2c3d4',
    theme_rev: 4,
    evidence_event_ids: [wire[8].event_id, publisherCopy.event_id],
  }])
  assert.equal(got.rows.filter((row) => row.headline === 'Actionable evidence').length, 1, 'two publisher copies use only one of the two reserved slots')
  const mixed = got.rows.find((row) => row.headline === 'Wire one: syndicated rewrite')!
  assert.equal(mixed.origin_type, 'mixed', 'a persisted story-family match to the ordinary capped wire is mixed')
  assert.equal(got.rows.filter((row) => row.origin_type === 'theme' || row.origin_type === 'mixed').length, 2)

  const themesDisabled = readTopSweep(dir, 6, {
    nowMs: Date.parse('2026-08-03T12:00:00Z'), maxAgeMs: 36 * 3_600_000, themesEnabled: false,
  })
  assert.deepEqual(
    themesDisabled.rows.map((row) => row.headline),
    ['Wire one', 'Wire two', 'Wire three', 'Wire four', 'Wire five', 'Wire six'],
    'an explicitly disabled Themes stage suppresses cached theme rows even when its index is fresh',
  )
  assert.ok(themesDisabled.rows.every((row) => row.origin_type === 'wire'))

  fs.writeFileSync(path.join(board, 'themes_index.json'), JSON.stringify({ generated_at: '2026-08-03T11:55:00Z', themes: [{ theme_id: 'THM-a1b2c3d4', rev: 4 }] }))
  const legacy = readTopSweep(dir, 6, { nowMs: Date.parse('2026-08-03T12:00:00Z'), maxAgeMs: 36 * 3_600_000 })
  assert.deepEqual(legacy.rows.map((row) => row.headline), ['Wire one', 'Wire two', 'Wire three', 'Wire four', 'Wire five', 'Wire six'], 'old indexes contribute no reserve rows')
  fs.rmSync(dir, { recursive: true, force: true })
})
check('theme reserve cannot bootstrap sparse, stale, or corrupt wire input and stays one-third of actual rows', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ideas-theme-minority-'))
  const inbox = path.join(dir, 'screener', 'inbox')
  const board = path.join(dir, 'screener', 'board')
  fs.mkdirSync(inbox, { recursive: true })
  fs.mkdirSync(board, { recursive: true })
  const at = '2026-08-03T10:00:00Z'
  const feedItem = (headline: string, score: number) => ({
    kind: 'item', ts: '2026-08-03T11:45:00Z', found_at: at,
    event_id: eventIdFor(headline, `https://news.test/${encodeURIComponent(headline)}`), headline,
    url: `https://news.test/${encodeURIComponent(headline)}`, domain: 'news.test', source_name: 'Publisher',
    via: 'rss', region: 'US', input_nature: 'news_headline', triage_score: score, band: 'watch',
    triage_reason: 'material', relevance: 'material', event_types: ['operational'], issuer_linkage: 'primary',
    companies: [], size_bucket: 'large', dedup_status: 'new', inboxed: true,
  })
  const themes = [feedItem('Theme one', 91), feedItem('Theme two', 90), feedItem('Theme three', 89)]
  fs.writeFileSync(path.join(inbox, '2026-08-03_firehose.ndjson'), themes.map((item) => JSON.stringify(item)).join('\n') + '\n')
  fs.writeFileSync(path.join(board, 'themes_index.json'), JSON.stringify({
    generated_at: '2026-08-03T11:59:00Z',
    themes: [{
      theme_id: 'THM-a1b2c3d4', rev: 1, assessment: { status: 'actionable' },
      evidence: themes.map((item) => ({ event_id: item.event_id, found_at: at })),
      qualified_expressions: [qualifiedExpression(themes.map((item) => item.event_id))],
    }],
  }))
  const sweepPath = path.join(inbox, '2026-08-03_sweep.json')
  const wire = [1, 2, 3, 4].map((n) => ({
    headline: `Wire ${n}`, url: `https://wire.test/${n}`, source_name: 'Wire',
    triage_score: 100 - n, found_at: at,
  }))
  const read = () => readTopSweep(dir, 6, { nowMs: Date.parse('2026-08-03T12:00:00Z'), maxAgeMs: 36 * 3_600_000 })

  fs.writeFileSync(sweepPath, JSON.stringify({ updated_at: '2026-08-03T11:58:00Z', rows: wire }))
  const fourWire = read()
  assert.equal(fourWire.rows.length, 6)
  assert.equal(fourWire.rows.filter((row) => row.origin_type === 'theme' || row.origin_type === 'mixed').length, 2)
  assert.ok(2 <= Math.floor(fourWire.rows.length / 3))

  fs.writeFileSync(sweepPath, JSON.stringify({ updated_at: '2026-08-03T11:58:00Z', rows: wire.slice(0, 2) }))
  const twoWire = read()
  assert.equal(twoWire.rows.length, 3)
  assert.equal(twoWire.rows.filter((row) => row.origin_type === 'theme' || row.origin_type === 'mixed').length, 1)
  assert.ok(1 <= Math.floor(twoWire.rows.length / 3), 'minority uses actual final rows, not configured topN')

  fs.writeFileSync(sweepPath, JSON.stringify({ updated_at: '2026-08-03T11:58:00Z', rows: wire.slice(0, 1) }))
  const oneWire = read()
  assert.deepEqual(oneWire.rows.map((row) => row.headline), ['Wire 1'], 'one wire row cannot be padded past the provider minimum')

  fs.writeFileSync(sweepPath, JSON.stringify({ updated_at: '2026-08-01T00:00:00Z', rows: wire }))
  const stale = read()
  assert.equal(stale.status, 'stale')
  assert.deepEqual(stale.rows, [], 'fresh cached themes cannot bypass a stale sweep')

  fs.writeFileSync(sweepPath, '{')
  const corrupt = read()
  assert.equal(corrupt.status, 'corrupt')
  assert.deepEqual(corrupt.rows, [], 'fresh cached themes cannot bypass a corrupt sweep')
  fs.rmSync(dir, { recursive: true, force: true })
})
check('Theme-to-Ideas lookup caps the actionable revision scan', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ideas-theme-bounds-'))
  const inbox = path.join(dir, 'screener', 'inbox')
  const board = path.join(dir, 'screener', 'board')
  fs.mkdirSync(inbox, { recursive: true })
  fs.mkdirSync(board, { recursive: true })
  const at = '2026-08-03T10:00:00Z'
  const liveHeadline = 'Bounded Theme evidence'
  const liveUrl = 'https://news.test/bounded-theme'
  const liveEventId = eventIdFor(liveHeadline, liveUrl)
  fs.writeFileSync(path.join(inbox, '2026-08-03_firehose.ndjson'), JSON.stringify({
    kind: 'item', ts: at, found_at: at, event_id: liveEventId, headline: liveHeadline, url: liveUrl,
    domain: 'news.test', source_name: 'News', via: 'rss', region: 'US', input_nature: 'news_headline',
    triage_score: 90, band: 'watch', triage_reason: 'material', relevance: 'material', event_types: ['operational'],
    issuer_linkage: 'primary', companies: [], size_bucket: 'large', dedup_status: 'new', inboxed: true,
  }) + '\n')
  fs.writeFileSync(path.join(inbox, '2026-08-03_sweep.json'), JSON.stringify({
    updated_at: '2026-08-03T11:55:00Z', rows: [1, 2, 3, 4].map((n) => ({
      headline: `Bound wire ${n}`, url: `https://wire.test/bound-${n}`, triage_score: 100 - n, found_at: at,
    })),
  }))
  const missingThemes = Array.from({ length: 64 }, (_, index) => {
    const eventId = eventIdFor(`Missing bounded evidence ${index}`, `https://missing.test/${index}`)
    return {
      theme_id: `THM-${index.toString(16).padStart(8, '0')}`, rev: 1,
      assessment: { status: 'actionable' }, evidence: [{ event_id: eventId, found_at: at }],
      qualified_expressions: [qualifiedExpression([eventId])],
    }
  })
  const liveTheme = {
    theme_id: 'THM-ffffffff', rev: 1, assessment: { status: 'actionable' },
    evidence: [{ event_id: liveEventId, found_at: at }], qualified_expressions: [qualifiedExpression([liveEventId])],
  }
  const indexPath = path.join(board, 'themes_index.json')
  const read = () => readTopSweep(dir, 6, { nowMs: Date.parse('2026-08-03T12:00:00Z'), maxAgeMs: 36 * 3_600_000 })
  fs.writeFileSync(indexPath, JSON.stringify({ generated_at: '2026-08-03T11:59:00Z', themes: [...missingThemes, liveTheme] }))
  assert.equal(read().rows.some((row) => row.event_id === liveEventId), false, 'the 65th revision is never synchronously resolved')
  fs.writeFileSync(indexPath, JSON.stringify({ generated_at: '2026-08-03T11:59:00Z', themes: [liveTheme, ...missingThemes] }))
  assert.equal(read().rows.some((row) => row.event_id === liveEventId), true, 'an in-bound revision still resolves normally')
  fs.rmSync(dir, { recursive: true, force: true })
})
check('theme evidence uses source time and requires a freshly generated themes index', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ideas-theme-time-'))
  const inbox = path.join(dir, 'screener', 'inbox')
  const board = path.join(dir, 'screener', 'board')
  fs.mkdirSync(inbox, { recursive: true })
  fs.mkdirSync(board, { recursive: true })
  const themeHeadline = 'Theme source-time evidence'
  const themeUrl = 'https://news.test/theme-time'
  const eventId = eventIdFor(themeHeadline, themeUrl)
  const feedPath = path.join(inbox, '2026-08-03_firehose.ndjson')
  const feedItem = (foundAt?: string) => ({
    kind: 'item', ts: '2026-08-03T11:59:00Z', ...(foundAt ? { found_at: foundAt } : {}),
    event_id: eventId, headline: themeHeadline, url: themeUrl, domain: 'news.test', source_name: 'Publisher',
    via: 'rss', region: 'US', input_nature: 'news_headline', triage_score: 90, band: 'watch',
    triage_reason: 'material', relevance: 'material', event_types: ['operational'], issuer_linkage: 'primary',
    companies: [], size_bucket: 'large', dedup_status: 'new', inboxed: true,
  })
  fs.writeFileSync(path.join(inbox, '2026-08-03_sweep.json'), JSON.stringify({
    updated_at: '2026-08-03T11:45:00Z',
    rows: [
      { headline: 'Wire A', url: 'https://wire.test/a', triage_score: 99, found_at: '2026-08-03T10:00:00Z' },
      { headline: 'Wire B', url: 'https://wire.test/b', triage_score: 98, found_at: '2026-08-03T10:00:00Z' },
    ],
  }))
  const writeIndex = (generatedAt: string | undefined, evidenceAt: string) => fs.writeFileSync(
    path.join(board, 'themes_index.json'),
    JSON.stringify({
      ...(generatedAt ? { generated_at: generatedAt } : {}),
      themes: [{
        theme_id: 'THM-a1b2c3d4', rev: 3, assessment: { status: 'actionable' },
        evidence: [{ event_id: eventId, found_at: evidenceAt }],
        qualified_expressions: [qualifiedExpression([eventId])],
      }],
    }),
  )
  const read = () => readTopSweep(dir, 6, { nowMs: Date.parse('2026-08-03T12:00:00Z'), maxAgeMs: 36 * 3_600_000 })

  fs.writeFileSync(feedPath, JSON.stringify(feedItem('2026-08-01T00:00:00Z')) + '\n')
  writeIndex('2026-08-03T11:59:00Z', '2026-08-01T00:00:00Z')
  assert.equal(read().rows.some((row) => row.event_id === eventId), false, 'fresh triage ts cannot revive old source evidence')

  const sourceAt = '2026-08-03T10:30:00Z'
  fs.writeFileSync(feedPath, JSON.stringify(feedItem()) + '\n')
  writeIndex('2026-08-03T11:50:01Z', sourceAt)
  const fresh = read().rows.find((row) => row.event_id === eventId)
  assert.equal(fresh?.found_at, sourceAt, 'legacy feed rows use the theme evidence timestamp, never triage ts')

  writeIndex('2026-08-03T11:50:00Z', sourceAt)
  assert.equal(read().rows.some((row) => row.event_id === eventId), false, 'an index at the ten-minute ceiling is stale')
  writeIndex(undefined, sourceAt)
  assert.equal(read().rows.some((row) => row.event_id === eventId), false, 'an index with no generation time fails closed')
  const sweepPath = path.join(inbox, '2026-08-03_sweep.json')
  const newerSweep = JSON.parse(fs.readFileSync(sweepPath, 'utf8'))
  newerSweep.updated_at = '2026-08-03T11:59:00Z'
  fs.writeFileSync(sweepPath, JSON.stringify(newerSweep))
  writeIndex('2026-08-03T11:58:00Z', sourceAt)
  assert.equal(
    read().rows.some((row) => row.event_id === eventId), false,
    'a still-young last-good index cannot survive a newer sweep whose themes stage failed or was disabled',
  )
  fs.rmSync(dir, { recursive: true, force: true })
})
check('quiet Theme ledgers are reprojected at Ideas read time instead of expiring after ten minutes', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ideas-theme-ledger-read-'))
  const inbox = path.join(dir, 'screener', 'inbox')
  const board = path.join(dir, 'screener', 'board')
  fs.mkdirSync(inbox, { recursive: true })
  fs.mkdirSync(board, { recursive: true })
  const projectionNow = new Date('2026-08-03T12:00:00Z')
  const company = { name: 'Nvidia', ticker: 'NVDA', listing_country: 'US' }
  const themeViews: ThemeItemView[] = [1, 2, 3].map((hoursAgo) => {
    const headline = `Nvidia ${hoursAgo === 1 ? 'expands' : hoursAgo === 2 ? 'lifts' : 'accelerates'} AI data center chip capacity`
    const url = `https://news.test/quiet-theme-${hoursAgo}`
    return {
      event_id: eventIdFor(headline, url), dedup_group: `STORY-quiet-${hoursAgo}`, headline,
      found_at: new Date(projectionNow.getTime() - hoursAgo * 3_600_000).toISOString(),
      companies: [company], event_types: ['capex'], issuer_linkage: 'primary', triage_score: 90 - hoursAgo,
      source_tier: 'news', country: 'US', region: 'US',
    }
  })
  const theme = createTheme(themeViews, new Date('2026-08-03T11:30:00Z'), 'claude')
  theme.name = 'AI Data-Center Chip Capacity'
  theme.description = 'Nvidia is expanding chip capacity for AI data centers.'
  appendThemeMutations(dir, [theme], () => new Date('2026-08-03T11:30:00Z'))
  const feed = themeViews.map((row, index) => ({
    kind: 'item', ts: row.found_at, found_at: row.found_at, event_id: row.event_id,
    dedup_group: row.dedup_group, headline: row.headline, url: `https://news.test/quiet-theme-${index + 1}`,
    domain: 'news.test', source_name: 'News', via: 'rss', region: 'US', input_nature: 'news_headline',
    triage_score: row.triage_score, band: 'watch', triage_reason: 'material', relevance: 'material',
    event_types: row.event_types, issuer_linkage: row.issuer_linkage, companies: row.companies,
    size_bucket: 'large', dedup_status: 'new', inboxed: true,
  }))
  fs.writeFileSync(path.join(inbox, '2026-08-03_firehose.ndjson'), feed.map((row) => JSON.stringify(row)).join('\n') + '\n')
  fs.writeFileSync(path.join(inbox, '2026-08-03_sweep.json'), JSON.stringify({
    updated_at: '2026-08-03T11:55:00Z', rows: [1, 2, 3, 4].map((n) => ({
      headline: `Quiet-cycle wire ${n}`, url: `https://wire.test/quiet-${n}`, source_name: 'Wire',
      triage_score: 100 - n, found_at: '2026-08-03T11:00:00Z',
    })),
  }))
  fs.writeFileSync(path.join(board, 'themes_index.json'), JSON.stringify({ generated_at: '2026-08-03T11:30:00Z', themes: [] }))

  const current = readTopSweep(dir, 6, {
    nowMs: projectionNow.getTime(), maxAgeMs: 36 * 3_600_000,
  })
  assert.ok(current.rows.some((row) => row.origin_type === 'theme' && row.theme_expressions?.[0]?.ticker === 'NVDA'))
  const disabled = readTopSweep(dir, 6, {
    nowMs: projectionNow.getTime(), maxAgeMs: 36 * 3_600_000, themesEnabled: false,
  })
  assert.ok(disabled.rows.every((row) => row.origin_type === 'wire'))
  fs.rmSync(dir, { recursive: true, force: true })
})
check('consumed and dismissed events or story families cannot re-enter through Themes', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ideas-theme-blocked-'))
  const inbox = path.join(dir, 'screener', 'inbox')
  const board = path.join(dir, 'screener', 'board')
  fs.mkdirSync(inbox, { recursive: true })
  fs.mkdirSync(board, { recursive: true })
  const at = '2026-08-03T10:00:00Z'
  const item = (headline: string, url: string, group: string) => ({
    kind: 'item', ts: '2026-08-03T11:00:00Z', found_at: at, event_id: eventIdFor(headline, url),
    headline, url, domain: 'news.test', source_name: 'Publisher', via: 'rss', region: 'US',
    input_nature: 'news_headline', triage_score: 90, band: 'watch', triage_reason: 'material',
    relevance: 'material', event_types: ['operational'], issuer_linkage: 'primary', companies: [],
    size_bucket: 'large', dedup_status: 'new', dedup_group: group, inboxed: true,
  })
  const dismissed = item('Dismissed original', 'https://news.test/dismissed', 'STORY-dismissed')
  const dismissedCopy = item('Syndicated wording of dismissed story', 'https://copy.test/dismissed', 'STORY-dismissed')
  const consumed = item('Consumed original', 'https://news.test/consumed', 'STORY-consumed')
  fs.writeFileSync(path.join(inbox, '2026-08-03_firehose.ndjson'), [dismissed, dismissedCopy, consumed].map((row) => JSON.stringify(row)).join('\n') + '\n')
  fs.writeFileSync(path.join(inbox, '2026-08-03_sweep.json'), JSON.stringify({
    updated_at: '2026-08-03T11:58:00Z',
    rows: [
      { headline: 'Wire A', url: 'https://wire.test/a', triage_score: 99, found_at: at },
      { headline: 'Wire B', url: 'https://wire.test/b', triage_score: 98, found_at: at },
      { ...dismissed, consumed: false, dismissed: true },
      { ...consumed, consumed: true },
    ],
  }))
  fs.writeFileSync(path.join(board, 'themes_index.json'), JSON.stringify({
    generated_at: '2026-08-03T11:59:00Z',
    themes: [{
      theme_id: 'THM-a1b2c3d4', rev: 2, assessment: { status: 'actionable' }, evidence: [
        { event_id: dismissed.event_id, found_at: at },
        { event_id: dismissedCopy.event_id, found_at: at },
        { event_id: consumed.event_id, found_at: at },
      ], qualified_expressions: [qualifiedExpression([dismissed.event_id, dismissedCopy.event_id, consumed.event_id])],
    }],
  }))
  const got = readTopSweep(dir, 6, { nowMs: Date.parse('2026-08-03T12:00:00Z'), maxAgeMs: 36 * 3_600_000 })
  assert.deepEqual(got.rows.map((row) => row.headline), ['Wire A', 'Wire B'])
  fs.rmSync(dir, { recursive: true, force: true })
})
check('prior-day consumed and dismissed state blocks still-fresh Theme evidence after date rollover', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ideas-theme-prior-day-blocked-'))
  const inbox = path.join(dir, 'screener', 'inbox')
  const board = path.join(dir, 'screener', 'board')
  fs.mkdirSync(inbox, { recursive: true })
  fs.mkdirSync(board, { recursive: true })
  const sourceAt = '2026-08-03T23:50:00Z'
  const item = (headline: string, url: string, group: string) => ({
    kind: 'item', ts: '2026-08-04T00:04:00Z', found_at: sourceAt, event_id: eventIdFor(headline, url),
    headline, url, domain: 'news.test', source_name: 'Publisher', via: 'rss', region: 'US',
    input_nature: 'news_headline', triage_score: 90, band: 'watch', triage_reason: 'material',
    relevance: 'material', event_types: ['operational'], issuer_linkage: 'primary', companies: [],
    size_bucket: 'large', dedup_status: 'new', dedup_group: group, inboxed: true,
  })
  const dismissed = item('Prior-day dismissed story', 'https://news.test/prior-dismissed', 'STORY-prior-dismissed')
  const consumed = item('Prior-day consumed story', 'https://news.test/prior-consumed', 'STORY-prior-consumed')
  const consumedCopy = item('Syndicated copy of prior consumed story', 'https://copy.test/prior-consumed', 'STORY-prior-consumed')
  fs.writeFileSync(path.join(inbox, '2026-08-03_sweep.json'), JSON.stringify({
    updated_at: '2026-08-04T00:05:00Z',
    rows: [{ ...dismissed, dismissed: true }, { ...consumed, consumed: true }],
  }))
  const wire = [1, 2, 3, 4].map((n) => ({
    headline: `Current wire ${n}`, url: `https://wire.test/current-${n}`, source_name: 'Wire',
    triage_score: 100 - n, found_at: sourceAt,
  }))
  fs.writeFileSync(path.join(inbox, '2026-08-04_sweep.json'), JSON.stringify({
    updated_at: '2026-08-04T00:06:00Z', rows: [{ ...consumedCopy, triage_score: 101 }, ...wire],
  }))
  fs.writeFileSync(
    path.join(inbox, '2026-08-04_firehose.ndjson'),
    [dismissed, consumedCopy].map((row) => JSON.stringify(row)).join('\n') + '\n',
  )
  fs.writeFileSync(path.join(board, 'themes_index.json'), JSON.stringify({
    generated_at: '2026-08-04T00:09:00Z',
    themes: [{
      theme_id: 'THM-a1b2c3d4', rev: 4, assessment: { status: 'actionable' }, evidence: [
        { event_id: dismissed.event_id, found_at: sourceAt },
        { event_id: consumedCopy.event_id, found_at: sourceAt },
      ], qualified_expressions: [qualifiedExpression([dismissed.event_id, consumedCopy.event_id])],
    }],
  }))

  const got = readTopSweep(dir, 6, {
    nowMs: Date.parse('2026-08-04T00:10:00Z'), maxAgeMs: 36 * 3_600_000,
  })
  assert.deepEqual(
    got.rows.map((row) => row.headline),
    wire.map((row) => row.headline),
    'prior-day human state blocks both the ordinary current-wire alias and the Theme reserve before cap/dedupe',
  )
  fs.rmSync(dir, { recursive: true, force: true })
})
check('a canonical event id cross-matches a publisher copy dedup_group for mixed, dedupe, and blocking', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ideas-theme-canonical-alias-'))
  const inbox = path.join(dir, 'screener', 'inbox')
  const board = path.join(dir, 'screener', 'board')
  fs.mkdirSync(inbox, { recursive: true })
  fs.mkdirSync(board, { recursive: true })
  const at = '2026-08-03T10:00:00Z'
  const anchor = {
    headline: 'Canonical anchor without a persisted group', url: 'https://wire.test/canonical-anchor',
    source_name: 'Wire', triage_score: 99, found_at: at,
  }
  const anchorId = eventIdFor(anchor.headline, anchor.url)
  const copy = {
    kind: 'item', ts: '2026-08-03T11:30:00Z', found_at: at,
    event_id: eventIdFor('Publisher rewrite of canonical anchor', 'https://copy.test/canonical-anchor'),
    headline: 'Publisher rewrite of canonical anchor', url: 'https://copy.test/canonical-anchor',
    domain: 'copy.test', source_name: 'Copy Publisher', via: 'rss', region: 'US',
    input_nature: 'news_headline', triage_score: 90, band: 'watch', triage_reason: 'material',
    relevance: 'material', event_types: ['operational'], issuer_linkage: 'primary', companies: [],
    size_bucket: 'large', dedup_status: 'new', dedup_group: anchorId, inboxed: true,
  }
  const otherWire = [2, 3, 4].map((n) => ({
    headline: `Independent wire ${n}`, url: `https://wire.test/independent-${n}`, source_name: 'Wire',
    triage_score: 100 - n, found_at: at,
  }))
  const sweepPath = path.join(inbox, '2026-08-03_sweep.json')
  fs.writeFileSync(sweepPath, JSON.stringify({
    updated_at: '2026-08-03T11:58:00Z', rows: [anchor, ...otherWire],
  }))
  fs.writeFileSync(path.join(inbox, '2026-08-03_firehose.ndjson'), JSON.stringify(copy) + '\n')
  fs.writeFileSync(path.join(board, 'themes_index.json'), JSON.stringify({
    generated_at: '2026-08-03T11:59:00Z', themes: [{
      theme_id: 'THM-a1b2c3d4', rev: 3, assessment: { status: 'actionable' },
      evidence: [{ event_id: copy.event_id, found_at: at }],
      qualified_expressions: [qualifiedExpression([copy.event_id])],
    }],
  }))
  const read = () => readTopSweep(dir, 6, {
    nowMs: Date.parse('2026-08-03T12:00:00Z'), maxAgeMs: 36 * 3_600_000,
  })

  const mixed = read()
  const familyRows = mixed.rows.filter((row) => row.event_id === anchorId || row.dedup_group === anchorId)
  assert.equal(familyRows.length, 1, 'the canonical anchor and its grouped publisher copy occupy one story slot')
  assert.equal(familyRows[0].origin_type, 'mixed', 'the story independently cleared wire and Theme admission')

  fs.writeFileSync(sweepPath, JSON.stringify({
    updated_at: '2026-08-03T11:58:00Z', rows: [{ ...anchor, dismissed: true }, ...otherWire],
  }))
  const blocked = read()
  assert.equal(
    blocked.rows.some((row) => row.event_id === copy.event_id || row.dedup_group === anchorId),
    false,
    'blocking canonical event A also blocks a Theme copy whose dedup_group is A',
  )
  assert.deepEqual(blocked.rows.map((row) => row.headline), otherWire.map((row) => row.headline))
  fs.rmSync(dir, { recursive: true, force: true })
})
check('withdrawn Theme admission immediately retires only unpromoted theme-only snapshots', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ideas-theme-retire-'))
  const themeId = 'THM-a1b2c3d4'
  const themeOnly = validIdeaSnapshot('RETIRE')
  const edge = themeOnly.source_event_ids[0]
  writeIdea(dir, validIdeaSnapshot('RETIRE', 'long', {
    origin_type: 'theme', source_themes: [{ theme_id: themeId, theme_rev: 4, evidence_event_ids: [edge] }],
  }))
  writeIdea(dir, validIdeaSnapshot('MIXED', 'long', {
    source_event_ids: [edge],
    origin_type: 'mixed', source_themes: [{ theme_id: themeId, theme_rev: 4, evidence_event_ids: [edge] }],
  }))
  writeIdea(dir, validIdeaSnapshot('PROMOTED', 'long', {
    source_event_ids: [edge],
    origin_type: 'theme', source_themes: [{ theme_id: themeId, theme_rev: 4, evidence_event_ids: [edge] }],
    status: 'promoted', promoted_signal_id: 'SIG-retained',
  }))
  const admitted: IdeaInputRow[] = [{
    ...ROWS[0], event_id: edge, origin_type: 'theme',
    source_themes: [{ theme_id: themeId, theme_rev: 4, evidence_event_ids: [edge] }],
    theme_expressions: [{
      theme_id: themeId, theme_rev: 4, name: 'Retire', name_key: 'retire', ticker: 'RETIRE',
      listing_country: 'US', side: 'beneficiary', evidence_event_ids: [edge],
    }],
  }]
  assert.equal(retireUnadmittedThemeIdeas(dir, admitted), 0)
  assert.ok(readIdeaById(dir, ideaId('RETIRE', 'long')))
  assert.equal(retireUnadmittedThemeIdeas(dir, []), 1)
  assert.equal(readIdeaById(dir, ideaId('RETIRE', 'long')), null)
  assert.ok(readIdeaById(dir, ideaId('MIXED', 'long')), 'mixed retains its independent wire support')
  assert.equal(readIdeaById(dir, ideaId('PROMOTED', 'long'))?.status, 'promoted')
  fs.rmSync(dir, { recursive: true, force: true })
})

// ---- readIdeaById path-traversal barrier (security: the `:id` route param reaches a filesystem path) ----
// Expected behaviour pinned to the security contract, NOT to current code: readIdeaById must ONLY read a
// file named by a strict IDEA-<12 hex> token; any id containing a traversal segment (or any non-token
// shape) must return null and must NOT read a file outside the ideas dir. Red-on-old (pre-guard the
// traversal id read `screener/ledger/evil.json`), green-on-new.
check('readIdeaById reads a well-formed idea by its strict id', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ideas-'))
  const id = ideaId('BBB', 'long')
  writeIdea(dir, validIdeaSnapshot('BBB'))
  const got = readIdeaById(dir, id)
  assert.equal(got?.idea_id, id)
  fs.rmSync(dir, { recursive: true, force: true })
})
check('readIdeaById refuses a path-traversal id and never escapes the ideas dir', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ideas-'))
  // plant a valid-looking snapshot OUTSIDE the ideas dir, exactly where `../evil` would land
  const escape = path.join(dir, 'screener', 'ledger', 'evil.json')
  fs.mkdirSync(path.dirname(escape), { recursive: true })
  fs.writeFileSync(escape, JSON.stringify({ idea_id: 'ESCAPED', ticker: 'X' }))
  assert.equal(readIdeaById(dir, '../evil'), null)                 // traversal → refused (pre-fix returned the ESCAPED file)
  assert.equal(readIdeaById(dir, '../../../../etc/hosts'), null)   // absolute-ish traversal → refused
  assert.equal(readIdeaById(dir, 'IDEA-not12hex'), null)           // wrong shape → refused
  assert.equal(readIdeaById(dir, 'IDEA-AAAAAAAAAAAA'), null)       // uppercase hex not in the [a-f0-9] token → refused
  fs.rmSync(dir, { recursive: true, force: true })
})
check('snapshot diagnostics distinguish an empty store from corrupt files', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ideas-'))
  assert.equal(readIdeaSnapshotStore(dir).status, 'missing')
  const store = path.join(dir, 'screener', 'ledger', 'ideas')
  fs.mkdirSync(store, { recursive: true })
  fs.writeFileSync(path.join(store, 'bad.json'), '{')
  fs.writeFileSync(path.join(store, `${ideaId('BAD', 'long')}.json`), JSON.stringify({ idea_id: ideaId('BAD', 'long'), ticker: 'BAD' }))
  const got = readIdeaSnapshotStore(dir)
  assert.equal(got.status, 'degraded')
  assert.equal(got.corrupt_count, 1)
  assert.equal(got.invalid_count, 1)
  assert.equal(got.snapshots.length, 0)
  fs.rmSync(dir, { recursive: true, force: true })
})
check('snapshot CAS refuses to overwrite a newer lifecycle edit', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ideas-'))
  const id = ideaId('BBB', 'long')
  const original = validIdeaSnapshot('BBB', 'long', { updated_at: '2026-08-03T10:00:00Z' })
  writeIdea(dir, original)
  const expected = ideaSnapshotRevision(readIdeaById(dir, id))
  writeIdea(dir, { ...original, updated_at: '2026-08-03T10:01:00Z', status: 'promoted', promoted_signal_id: 'SIG-new' })
  assert.equal(writeIdeaIfRevision(dir, { ...original, updated_at: '2026-08-03T10:02:00Z' }, expected), false)
  assert.equal(readIdeaById(dir, id)?.status, 'promoted')
  assert.equal(readIdeaById(dir, id)?.promoted_signal_id, 'SIG-new')
  fs.rmSync(dir, { recursive: true, force: true })
})
check('promotion reservation prevents double spend and merges into the newest snapshot', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ideas-'))
  const id = ideaId('PROMO', 'long')
  const original = validIdeaSnapshot('PROMO', 'long', {
    reason: 'Old evidence supports the earnings catalyst', updated_at: '2026-08-03T10:00:00Z',
    decay_at: '2026-08-03T06:30:00Z',
  })
  writeIdea(dir, original)
  const reservation = reserveIdeaPromotion(dir, id, Date.parse('2026-08-03T10:01:00Z'))
  assert.ok(reservation)
  assert.equal(reserveIdeaPromotion(dir, id, Date.parse('2026-08-03T10:02:00Z')), null, 'a concurrent request cannot reserve the same paid launch')
  const refreshed = updateIdeaSnapshot(dir, id, (current) => {
    const reason = 'New evidence supports the earnings catalyst'
    const updatedAt = '2026-08-03T10:03:00Z'
    return {
      ...current,
      reason,
      idea_version: ideaVersion({
        ticker: current.ticker, direction: current.direction, pairWith: current.pair_with, thesisType: current.thesis_type,
        reason, whyNow: current.why_now, sourceEventIds: current.source_event_ids,
      }),
      idea_version_started_at: updatedAt,
      updated_at: updatedAt,
    }
  })
  assert.equal(refreshed?.reason, 'New evidence supports the earnings catalyst')
  assert.equal(pruneExpiredIdeas(dir, Date.parse('2026-08-10T00:00:00Z'), 0), 0, 'an in-flight paid launch cannot be pruned')
  finalizeIdeaPromotion(dir, id, reservation!.token, 'SIG-paid', '2026-08-03T10:04:00Z', original)
  const promoted = readIdeaById(dir, id)
  assert.equal(promoted?.reason, 'New evidence supports the earnings catalyst', 'finalization preserves provider fields refreshed during launch')
  assert.equal(promoted?.status, 'promoted')
  assert.equal(promoted?.promoted_signal_id, 'SIG-paid')
  fs.rmSync(dir, { recursive: true, force: true })
})
check('only a reservation owner can release a pending promotion', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ideas-'))
  const id = ideaId('RELEASE', 'long')
  const original = validIdeaSnapshot('RELEASE', 'long', { decay_at: '2026-08-03T06:30:00Z' })
  writeIdea(dir, original)
  const reservation = reserveIdeaPromotion(dir, id, Date.parse('2026-08-03T10:00:00Z'))!
  releaseIdeaPromotion(dir, id, 'wrong-token')
  assert.equal(reserveIdeaPromotion(dir, id, Date.parse('2026-08-03T10:01:00Z')), null)
  releaseIdeaPromotion(dir, id, reservation.token)
  assert.ok(reserveIdeaPromotion(dir, id, Date.parse('2026-08-03T10:02:00Z')))
  fs.rmSync(dir, { recursive: true, force: true })
})

// summary
setTimeout(() => console.log(`\n${passed} checks passed`), 50)
