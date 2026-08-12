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
import {
  buildIdeaUserMessage, coerceIdea, estimateIdeaTokens, IDEA_SYSTEM, surfaceIdeasBatch,
  type IdeaInputRow, type IdeaThemeExpression, type RawIdea,
} from '../src/news/ideas/surface-ideas'
import {
  finalizeIdeaPromotion, ideaDecayAt, ideaId, ideaSnapshotRevision, ideaVersion, pruneExpiredIdeas,
  isSurfacedIdeaSnapshot, readIdeaById, readIdeaSnapshotStore, readTopSweep, readTopSweepRows, releaseIdeaPromotion,
  reserveIdeaPromotion, retireUnadmittedThemeIdeas, topNEffectHash, topNHash, updateIdeaSnapshot, writeIdea, writeIdeaIfRevision,
} from '../src/news/ideas/ideas-store'
import {
  directionBoundToVerifiedListing, ideaLineageForRows, themeProofForIdea, tradeEvidenceForIdeaRows,
  verifiedListingsIdentifySameIssuer,
} from '../src/news/ideas/run-idea-pass'
import { scoreTradeCluster } from '../src/news/trade-score'
import { eventIdFor } from '../src/news/normalize'
import { mergeInbox } from '../src/news/write-inbox'
import { createTheme } from '../src/news/themes/discover'
import { appendThemeMutations, buildThemesIndex } from '../src/news/themes/store'
import type { ThemeItemView } from '../src/news/themes/types'
import { validIdeaSnapshot } from './ideas-fixture'
import { attachValidNarrative } from './themes-fixtures'

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
  { event_id: 'EVT-2', dedup_group: 'STORY-B', headline: 'B expands refinery', headline_orig: 'B expands refinery', url: 'http://b', source_name: 'BusinessLine', source_tier: 'official_data', region: 'IN', materiality: 88, materiality_pre_score: 71, label: 'high', event_types: ['capex'], issuer_linkage: 'primary', companies: [{ name: 'B', ticker: 'BBB', listing_country: 'IN' }], scheduled_events: ['results on 2026-08-13'], event_direction: 'positive', found_at: '2026-07-12T11:00:00Z' },
]
const qualifiedExpression = (
  evidenceEventIds: string[],
  patch: Partial<{
    name: string
    name_key: string
    ticker: string
    listing_country: string | null
    side: 'beneficiary' | 'harmed'
    role: 'direct' | 'bottleneck' | 'enabler' | 'harmed' | 'hedge'
    mechanism: string
  }> = {},
) => ({
  name: 'Acme', name_key: 'acme', ticker: 'ACME', listing_country: 'US' as string | null,
  side: 'beneficiary' as const, role: 'direct' as const,
  mechanism: 'The event directly changes Acme revenue or costs.', evidence_event_ids: evidenceEventIds, ...patch,
})
const actionableTheme = (
  theme_id: string,
  rev: number,
  evidence: { event_id: string; found_at: string; stance: 'supports' | 'challenges' }[],
  qualified_expressions: ReturnType<typeof qualifiedExpression>[],
  patch: Record<string, unknown> = {},
) => ({
  theme_id,
  rev,
  description: 'A current causal change is affecting the named listed-company exposure.',
  activity: 'reinforced',
  assessment: { status: 'actionable', activity: 'reinforced' },
  narrative: {
    thesis: 'The cited change can alter revenue, costs or capacity for the evidence-bound expression.',
    why_now: 'The designated current source shows that the causal change is active now.',
    why_now_event_id: evidence.find((row) => row.stance === 'supports')?.event_id,
  },
  evidence,
  qualified_expressions,
  ...patch,
})

const exactThemeExpression = (
  themeId: string,
  themeRev: number,
  proofEventId: string,
  patch: Partial<IdeaThemeExpression> = {},
): IdeaThemeExpression => ({
  theme_id: themeId,
  theme_rev: themeRev,
  name: 'Acme',
  name_key: 'acme',
  ticker: 'ACME',
  listing_country: 'US',
  side: 'beneficiary',
  role: 'direct',
  mechanism: 'The structural evidence directly binds the listed issuer to the causal change.',
  evidence_event_ids: [proofEventId],
  ...patch,
})

/** Mirror the production Theme seed exactly: one fresh trigger and one distinct issuer proof. */
const exactThemePackageRows = (
  themeId: string,
  themeRev: number,
  whyRow: IdeaInputRow,
  proofRow: IdeaInputRow,
  expressions: IdeaThemeExpression[] = [exactThemeExpression(themeId, themeRev, proofRow.event_id)],
): [IdeaInputRow, IdeaInputRow] => {
  const whyNowEventId = whyRow.event_id
  const context = {
    theme_id: themeId,
    theme_rev: themeRev,
    thesis: 'The cited causal change alters revenue, costs or capacity for the evidence-bound expression.',
    context: 'A fresh trigger is paired with separate structural issuer proof.',
    why_now_event_id: whyNowEventId,
  }
  return [
    {
      ...whyRow,
      origin_type: 'theme',
      source_themes: [{
        theme_id: themeId,
        theme_rev: themeRev,
        evidence_event_ids: [whyNowEventId],
        why_now_event_id: whyNowEventId,
      }],
      theme_expressions: [],
      theme_contexts: [{ ...context, role: 'WHY_NOW' }],
    },
    {
      ...proofRow,
      origin_type: 'theme',
      source_themes: [{
        theme_id: themeId,
        theme_rev: themeRev,
        evidence_event_ids: [whyNowEventId, proofRow.event_id],
        why_now_event_id: whyNowEventId,
      }],
      theme_expressions: expressions,
      theme_contexts: [{ ...context, role: 'EXPRESSION_PROOF' }],
    },
  ]
}

// ---- coerceIdea ----
check('coerceIdea drops an idea with no valid source index', () => {
  assert.equal(coerceIdea({ src: [5], ticker: 'AAA' }, 2), null) // 5 out of range
  assert.equal(coerceIdea({ src: [], ticker: 'AAA' }, 2), null)
})
check('coerceIdea drops an idea with no valid ticker (no source = no claim)', () => {
  assert.equal(coerceIdea({ src: [0], ticker: '' }, 2), null)
  assert.equal(coerceIdea({ src: [0], ticker: 'this is not a ticker' }, 2), null)
})
check('coerceIdea clamps conviction and defaults only priced-in uncertainty safely', () => {
  const i = coerceIdea({ src: [0, 0, 9], ticker: 'stng', reason: 'Rates lift cash earnings', why_now: 'Results are due this month', conviction: 250, direction: 'long', priced_in: 'maybe', thesis_type: 'company_specific' }, 2)
  assert.ok(i)
  assert.equal(i!.conviction, 100)
  assert.equal(i!.ticker, 'STNG')            // uppercased
  assert.deepEqual(i!.src, [0])              // deduped, out-of-range 9 dropped
  assert.equal(i!.direction, 'long')
  assert.equal(i!.priced_in, 'unknown')
  assert.equal(i!.thesis_type, 'company_specific')
})
check('coerceIdea fails closed when side or thesis type is missing or invalid', () => {
  const evidence = { src: [0], ticker: 'AAA', reason: 'Demand lifts revenue', why_now: 'Results are due this month' }
  assert.equal(coerceIdea({ ...evidence, thesis_type: 'company_specific' }, 2), null)
  assert.equal(coerceIdea({ ...evidence, direction: 'sideways', thesis_type: 'company_specific' }, 2), null)
  assert.equal(coerceIdea({ ...evidence, direction: 'long' }, 2), null)
  assert.equal(coerceIdea({ ...evidence, direction: 'long', thesis_type: 'nonsense' }, 2), null)
})
check('coerceIdea keeps pair_with only for a pair', () => {
  const evidence = { src: [0], ticker: 'AAA', reason: 'Demand shifts market share', why_now: 'Results are due this month', thesis_type: 'company_specific' }
  assert.equal(coerceIdea({ ...evidence, direction: 'long', pair_with: 'BBB' }, 2)!.pair_with, null)
  assert.equal(coerceIdea({ ...evidence, direction: 'pair', pair_with: 'bbb' }, 2)!.pair_with, 'BBB')
  assert.equal(coerceIdea({ ...evidence, direction: 'pair', pair_with: 'AAA' }, 2), null)
  assert.equal(coerceIdea({ ...evidence, ticker: 'BRK-B', direction: 'pair', pair_with: 'BRK.B' }, 2), null, 'normalized spellings of the exact listing cannot form both legs')
  assert.equal(coerceIdea({ ...evidence, ticker: 'ACME', direction: 'pair', pair_with: 'ACME.NS' }, 2)?.pair_with, 'ACME.NS', 'a shared symbol base across venues is not issuer identity before listing verification')
})
check('verified pair identity rejects exact listings and directory-proven aliases, not unrelated same-base issuers', () => {
  const primary = { ticker: 'ACME', exchange: 'NYSE', companyName: 'Acme Holdings Inc', source: 'yahoo_symbol_directory' as const }
  assert.equal(verifiedListingsIdentifySameIssuer(primary, { ...primary, ticker: 'ACME' }), true)
  assert.equal(verifiedListingsIdentifySameIssuer(primary, {
    ticker: 'ACME.NS', exchange: 'NSE', companyName: 'Acme Holdings Limited', source: 'yahoo_symbol_directory',
  }), true, 'independently returned matching issuer names prove a cross-list alias')
  assert.equal(verifiedListingsIdentifySameIssuer(primary, {
    ticker: 'ACME.NS', exchange: 'NSE', companyName: 'Acme Motors Limited', source: 'yahoo_symbol_directory',
  }), false, 'the same symbol base on another venue does not prove the same issuer')
})
check('event direction binds only to one exact verified primary issuer', () => {
  const listing = { ticker: 'AAA', exchange: 'NYSE', companyName: 'Alpha Corp', source: 'yahoo_symbol_directory' as const }
  const direct: IdeaInputRow = {
    ...ROWS[0], issuer_linkage: 'primary', companies: [{ name: 'Alpha Corporation', ticker: 'AAA', listing_country: 'US' }],
    event_direction: 'negative', origin_type: 'wire', source_themes: [],
  }
  assert.equal(directionBoundToVerifiedListing([direct], listing), 'short')
  assert.equal(directionBoundToVerifiedListing([{ ...direct, companies: [
    { name: 'Alpha Corporation', ticker: null, listing_country: 'US' },
  ] }], listing), 'short', 'an exact sole primary company still binds when title-only triage honestly omitted its ticker')
  assert.equal(directionBoundToVerifiedListing([{ ...direct, companies: [
    { name: 'Amazon', ticker: 'AMZN', listing_country: 'US' },
  ] }], { ...listing, ticker: 'AMZN', companyName: 'Amazon.com Inc' }), 'short', 'an exact verified ticker binds despite a different valid display-name spelling')
  assert.equal(directionBoundToVerifiedListing([{ ...direct, companies: [
    { name: 'Alpha Corporation', ticker: 'BBB', listing_country: 'US' },
  ] }], listing), 'unknown', 'a conflicting non-null ticker keeps the event sign ambiguous')
  assert.equal(directionBoundToVerifiedListing([{ ...direct, companies: [
    { name: 'Alpha Limited', ticker: null, listing_country: 'US' },
  ] }], { ...listing, companyName: 'Alpha Corp' }), 'short', 'legal-form variants bind to the verified issuer')
  assert.equal(directionBoundToVerifiedListing([{ ...direct, companies: [
    { name: 'Man Holdings', ticker: null, listing_country: 'GB' },
  ] }], { ...listing, ticker: 'EMG.L', companyName: 'Man Group plc', exchange: 'LSE' }), 'unknown', 'identity-bearing Holdings and Group names must not collapse into one issuer')
  assert.equal(directionBoundToVerifiedListing([{ ...direct, issuer_linkage: 'secondary' }], listing), 'unknown', 'secondary beneficiary/harmed mappings keep the event sign informational')
  assert.equal(directionBoundToVerifiedListing([{ ...direct, companies: [
    ...direct.companies, { name: 'Beta Corp', ticker: 'BBB', listing_country: 'US' },
  ] }], listing), 'unknown', 'a multi-company event sign is not uniquely bound to the selected instrument')
})
check('coerceIdea accepts the canonical global ticker contract for both legs', () => {
  const evidence = { src: [0], reason: 'Demand shifts market share', why_now: 'Results are due this month', direction: 'long', thesis_type: 'company_specific' }
  assert.equal(coerceIdea({ ...evidence, ticker: 'm&m.ns' }, 2)!.ticker, 'M&M.NS')
  assert.equal(coerceIdea({ ...evidence, ticker: 'ABCDEFGHIJKLMNO' }, 2)!.ticker, 'ABCDEFGHIJKLMNO')
  assert.equal(coerceIdea({ ...evidence, ticker: 'ACME', direction: 'pair', pair_with: 'm&m.ns' }, 2)!.pair_with, 'M&M.NS')
})
check('coerceIdea negative/NaN conviction floors at 0', () => {
  const evidence = { src: [0], ticker: 'AAA', reason: 'Demand lifts revenue', why_now: 'Results are due this month', direction: 'long', thesis_type: 'company_specific' }
  assert.equal(coerceIdea({ ...evidence, conviction: -5 }, 2)!.conviction, 0)
  assert.equal(coerceIdea({ ...evidence, conviction: 'x' }, 2)!.conviction, 0)
})
check('coerceIdea rejects missing mechanism/timing evidence and an incomplete pair', () => {
  const classification = { direction: 'long', thesis_type: 'company_specific' }
  assert.equal(coerceIdea({ ...classification, src: [0], ticker: 'AAA', why_now: 'Results are due this month' }, 2), null)
  assert.equal(coerceIdea({ ...classification, src: [0], ticker: 'AAA', reason: 'Demand lifts revenue' }, 2), null)
  assert.equal(coerceIdea({ ...classification, src: [0], ticker: 'AAA', direction: 'pair', reason: 'Demand shifts share', why_now: 'Results are due this month' }, 2), null)
})

// ---- surfaceIdeasBatch (fetch-stubbed; never throws, honors the reliability contract) ----
check('surfaceIdeasBatch parses ideas and drops the invalid ones', async () => {
  const r = await surfaceIdeasBatch(ROWS, OPTS, stubFetch({ ideas: [
    { src: [0], ticker: 'STNG', direction: 'long', reason: 'Freight disruption lifts tanker rates', why_now: 'The strait closure is live now', conviction: 61, thesis_type: 'macro_conditional' },
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
  const sourceHeadline = 'Acme files a material capacity update'
  const sourceUrl = 'https://exchange.test/acme-capacity'
  const whyEvent = eventIdFor(sourceHeadline, sourceUrl)
  const proofEvent = eventIdFor('Acme filing proves the listed issuer exposure', 'https://filings.test/acme-proof')
  const base = {
    ticker: 'BBB', direction: 'long' as const, pairWith: null, thesisType: 'company_specific' as const,
    reason: 'Refinery adds output', whyNow: 'Results on 2026-08-06', sourceEventIds: [whyEvent],
    primarySourceEventId: whyEvent, sourceHeadline, sourceUrl, sourceName: 'Exchange',
    originType: 'wire' as const, sourceThemes: [],
  }
  assert.equal(ideaVersion(base), ideaVersion({ ...base, ticker: 'bbb' }))
  assert.notEqual(ideaVersion(base), ideaVersion({ ...base, sourceEventIds: [proofEvent] }))

  const themed = {
    ...base,
    sourceEventIds: [whyEvent, proofEvent],
    originType: 'theme' as const,
    sourceThemes: [{ theme_id: 'THM-a1b2c3d4', theme_rev: 2, evidence_event_ids: [whyEvent, proofEvent], why_now_event_id: whyEvent }],
  }
  assert.notEqual(
    ideaVersion(themed),
    ideaVersion({ ...themed, sourceThemes: [{ ...themed.sourceThemes[0], theme_rev: 3 }] }),
    'a new Theme revision is a new exact thesis snapshot',
  )
  assert.notEqual(
    ideaVersion(themed),
    ideaVersion({ ...themed, sourceThemes: [{ ...themed.sourceThemes[0], evidence_event_ids: [whyEvent] }] }),
    'changing only the evidence mapped to a Theme is a new exact thesis snapshot',
  )
  assert.notEqual(
    ideaVersion({ ...themed, sourceThemes: [{ ...themed.sourceThemes[0], why_now_event_id: whyEvent }] }),
    ideaVersion({ ...themed, sourceThemes: [{ ...themed.sourceThemes[0], why_now_event_id: proofEvent }] }),
    'changing only the exact why-now edge is a new thesis snapshot',
  )
  const pair = { ...base, ticker: 'AMD', direction: 'pair' as const, pairWith: 'INTC' }
  assert.notEqual(ideaVersion(pair), ideaVersion({ ...pair, pairWith: 'NVDA' }), 'AMD paired with INTC is a different immutable call from AMD paired with NVDA')
  assert.equal(ideaVersion({ ...pair, pairWith: 'BRK-B' }), ideaVersion({ ...pair, pairWith: 'BRK.B' }), 'the pair leg uses normalized ticker spelling')
  assert.equal(ideaVersion({
    ticker: 'AMD', direction: 'pair', pairWith: 'INTC', thesisType: 'company_specific',
    reason: '  Demand   lifts earnings ', whyNow: 'Results are due this month', sourceEventIds: [whyEvent, proofEvent],
    primarySourceEventId: whyEvent, sourceHeadline, sourceUrl, sourceName: 'Exchange',
    originType: 'wire', sourceThemes: [],
  }), 'IDEAV-f7194ed98c4f8fc9', 'TypeScript and the static Python verifier share one canonical pair-version vector')
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
  const mappedWhy = mappedBase.source_event_ids[0]
  const mappedProof = eventIdFor('Mapped structural proof', 'https://exchange.test/mapped-proof')
  const mappedTheme = {
    ...sourceTheme,
    evidence_event_ids: [mappedWhy, mappedProof],
    why_now_event_id: mappedWhy,
  }
  const mapped = validIdeaSnapshot('MAPPED', 'long', {
    source_event_ids: [mappedWhy, mappedProof],
    origin_type: 'theme',
    source_themes: [mappedTheme],
  })
  assert.equal(isSurfacedIdeaSnapshot(mapped), true, 'mapped Theme evidence binds distinct why-now and structural proof events')
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
  const modern = validIdeaSnapshot('AMD', 'pair', { pair_with: 'INTC' })
  const legacy = { ...modern } as any
  delete legacy.origin_type
  delete legacy.source_themes
  delete legacy.primary_source_event_id
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
  const themeId = 'THM-a1b2c3d4'
  const themeRev = 2
  const [whyRow, proofRow] = exactThemePackageRows(themeId, themeRev, ROWS[0], ROWS[1])
  const themeWithEvidence = {
    theme_id: themeId,
    theme_rev: themeRev,
    evidence_event_ids: [ROWS[0].event_id, ROWS[1].event_id],
    why_now_event_id: ROWS[0].event_id,
  }
  assert.deepEqual(ideaLineageForRows([{ ...ROWS[0], origin_type: 'wire', source_themes: [] }]), { origin_type: 'wire', source_themes: [] })
  assert.deepEqual(ideaLineageForRows([whyRow, proofRow]), { origin_type: 'theme', source_themes: [themeWithEvidence] })
  assert.deepEqual(ideaLineageForRows([
    { ...ROWS[0], origin_type: 'wire', source_themes: [] }, whyRow, proofRow,
  ]), { origin_type: 'mixed', source_themes: [themeWithEvidence] })
})
check('Theme provider output must bind exact qualified issuer, listing, side, and pair leg', () => {
  const themeId = 'THM-a1b2c3d4'
  const themeRev = 3
  const whyRow = { ...ROWS[0], event_id: 'EVT-0123456789ab' }
  const proofRow = { ...ROWS[1], event_id: 'EVT-abcdef012345' }
  const primaryExpression = exactThemeExpression(themeId, themeRev, proofRow.event_id, {
    name: 'Berkshire Hathaway', name_key: 'berkshirehathaway', ticker: 'BRK.B',
  })
  const themeRows = exactThemePackageRows(themeId, themeRev, whyRow, proofRow, [primaryExpression])
  const raw: RawIdea = {
    src: [0, 1], ticker: 'BRK-B', company: 'Berkshire Hathaway', exchange: 'NYSE', direction: 'long', pair_with: null,
    reason: 'Insurance pricing can lift earnings', why_now: 'Results are due this month', conviction: 60,
    priced_in: 'unknown', thesis_type: 'company_specific',
  }
  assert.deepEqual(
    [...themeProofForIdea(raw, themeRows)!.evidenceByTheme.get('THM-a1b2c3d4@3')!],
    [whyRow.event_id, proofRow.event_id],
    'share-class separator aliases are equivalent only with both exact evidence roles',
  )
  assert.equal(themeProofForIdea({ ...raw, ticker: 'BRK.B.NS' }, themeRows), null, 'exchange/base aliases are not silently widened')
  assert.equal(themeProofForIdea({ ...raw, company: 'Berkshire Energy' }, themeRows), null)
  assert.equal(themeProofForIdea({ ...raw, direction: 'short' }, themeRows), null, 'beneficiary proof cannot support a short')

  const harmedExpression = exactThemeExpression(themeId, themeRev, proofRow.event_id, {
    name: 'JPMorgan Chase', name_key: 'jpmorganchase', ticker: 'JPM', side: 'harmed', role: 'harmed',
  })
  const pairRows = exactThemePackageRows(themeId, themeRev, whyRow, proofRow, [primaryExpression, harmedExpression])
  const pair = { ...raw, direction: 'pair' as const, pair_with: 'JPM' }
  assert.equal(themeProofForIdea(pair, pairRows)?.pairCompanyName, 'JPMorgan Chase')
  assert.equal(themeProofForIdea({ ...pair, pair_with: 'BAC' }, pairRows), null)
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
  assert.notEqual(
    topNEffectHash([{ ...effectV2, source_themes: [{ ...effectV2.source_themes![0], why_now_event_id: 'EVT-fedcba987654' }] }]),
    topNEffectHash([{ ...effectV2, source_themes: [{ ...effectV2.source_themes![0], why_now_event_id: 'EVT-0123456789ab' }] }]),
    'changing which exact support is the why-now edge reruns persistence even when visible headlines are unchanged',
  )
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
  assert.match(msg, /raw_impact=71/)
  assert.match(msg, /source_tier=official_data/)
  assert.match(msg, /server_direction=positive/)
  assert.match(msg, /scheduled_events=results on 2026-08-13/)
  assert.match(IDEA_SYSTEM, /separate raw economic-impact score/)
  assert.match(IDEA_SYSTEM, /source tier/)
  assert.match(IDEA_SYSTEM, /server-read event direction/)
  assert.match(IDEA_SYSTEM, /event-level effect and is informational/)
  assert.match(IDEA_SYSTEM, /scheduled events/)
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
check('readTopSweep keeps a still-current previous-day candidate after the daily file rolls over', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ideas-sweep-rollover-'))
  const inbox = path.join(dir, 'screener', 'inbox')
  fs.mkdirSync(inbox, { recursive: true })
  fs.writeFileSync(path.join(inbox, '2026-08-03_sweep.json'), JSON.stringify({
    updated_at: '2026-08-03T23:59:00Z',
    rows: [{ headline: 'Previous-day leader', url: 'https://news.test/previous', triage_score: 96, found_at: '2026-08-03T23:50:00Z' }],
  }))
  fs.writeFileSync(path.join(inbox, '2026-08-04_sweep.json'), JSON.stringify({
    updated_at: '2026-08-04T00:06:00Z',
    rows: [{ headline: 'New-day candidate', url: 'https://news.test/current', triage_score: 88, found_at: '2026-08-04T00:04:00Z' }],
  }))

  const got = readTopSweep(dir, 5, {
    nowMs: Date.parse('2026-08-04T00:10:00Z'), maxAgeMs: 2 * 3_600_000,
  })
  assert.equal(got.status, 'ok')
  assert.equal(got.sweep_updated_at, '2026-08-04T00:06:00Z')
  assert.deepEqual(got.rows.map((row) => row.headline), ['Previous-day leader', 'New-day candidate'])
  assert.equal(got.rows[0].found_at, '2026-08-03T23:50:00Z', 'freshness stays anchored to source time, not the newer partition')
  fs.rmSync(dir, { recursive: true, force: true })
})
check('readTopSweep collapses one story repeated across current sweep partitions before topN', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ideas-sweep-cross-file-dedup-'))
  const inbox = path.join(dir, 'screener', 'inbox')
  fs.mkdirSync(inbox, { recursive: true })
  fs.writeFileSync(path.join(inbox, '2026-08-03_sweep.json'), JSON.stringify({
    updated_at: '2026-08-03T23:59:00Z',
    rows: [
      { headline: 'Older publisher copy', url: 'https://copy.test/story', dedup_group: 'STORY-shared', triage_score: 97, source_tier: 'news', found_at: '2026-08-03T23:48:00Z' },
      { headline: 'Distinct prior-day story', url: 'https://news.test/distinct', triage_score: 91, found_at: '2026-08-03T23:49:00Z' },
    ],
  }))
  fs.writeFileSync(path.join(inbox, '2026-08-04_sweep.json'), JSON.stringify({
    updated_at: '2026-08-04T00:06:00Z',
    rows: [
      { headline: 'New primary filing', url: 'https://primary.test/story', dedup_group: 'STORY-shared', triage_score: 93, source_tier: 'primary_filing', found_at: '2026-08-04T00:04:00Z' },
      { headline: 'Distinct current-day story', url: 'https://news.test/current', triage_score: 89, found_at: '2026-08-04T00:05:00Z' },
    ],
  }))

  const got = readTopSweep(dir, 3, {
    nowMs: Date.parse('2026-08-04T00:10:00Z'), maxAgeMs: 2 * 3_600_000,
  })
  assert.deepEqual(
    got.rows.map((row) => row.headline),
    ['New primary filing', 'Distinct prior-day story', 'Distinct current-day story'],
    'the §4 source hierarchy chooses the filing before score and the publisher copy consumes no top-N slot',
  )
  assert.equal(got.rows.filter((row) => row.dedup_group === 'STORY-shared').length, 1)
  fs.rmSync(dir, { recursive: true, force: true })
})
check('readTopSweep ranks invalid source times behind valid evidence with a stable dedupe order', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ideas-sweep-invalid-time-order-'))
  const inbox = path.join(dir, 'screener', 'inbox')
  fs.mkdirSync(inbox, { recursive: true })
  const candidates = [
    { headline: 'Same story alpha', url: 'https://news.test/time-alpha' },
    { headline: 'Same story beta', url: 'https://news.test/time-beta' },
  ].map((row) => ({ ...row, eventId: eventIdFor(row.headline, row.url) }))
    .sort((a, b) => a.eventId.localeCompare(b.eventId))
  const [invalidTime, validTime] = candidates
  fs.writeFileSync(path.join(inbox, '2026-08-03_sweep.json'), JSON.stringify({
    updated_at: '2026-08-03T12:00:00Z',
    rows: [
      { ...invalidTime, dedup_group: 'STORY-time-order', triage_score: 90, source_tier: 'news', found_at: 'not-a-time' },
      { ...validTime, dedup_group: 'STORY-time-order', triage_score: 90, source_tier: 'news', found_at: '2026-08-03T11:00:00Z' },
    ],
  }))

  const got = readTopSweep(dir, 5)
  assert.equal(got.rows.length, 1)
  assert.equal(got.rows[0].event_id, validTime.eventId, 'a malformed time cannot win via event-id fallback')
  fs.rmSync(dir, { recursive: true, force: true })
})
check('readTopSweep preserves correction and reversal lanes inside one publisher-copy family', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ideas-sweep-revision-lanes-'))
  const inbox = path.join(dir, 'screener', 'inbox')
  fs.mkdirSync(inbox, { recursive: true })
  fs.writeFileSync(path.join(inbox, '2026-08-03_sweep.json'), JSON.stringify({
    updated_at: '2026-08-03T23:59:00Z',
    rows: [{ headline: 'Company wins regulator approval', url: 'https://filing.test/original', dedup_group: 'STORY-revised', triage_score: 97, source_tier: 'primary_filing', found_at: '2026-08-03T23:48:00Z' }],
  }))
  fs.writeFileSync(path.join(inbox, '2026-08-04_sweep.json'), JSON.stringify({
    updated_at: '2026-08-04T00:06:00Z',
    rows: [
      { headline: 'Correction: approval remains conditional', url: 'https://news.test/correction', dedup_group: 'STORY-revised', triage_score: 88, source_tier: 'news', found_at: '2026-08-04T00:03:00Z' },
      { headline: 'Regulator withdraws approval', url: 'https://news.test/reversal', dedup_group: 'STORY-revised', triage_score: 90, source_tier: 'news', found_at: '2026-08-04T00:04:00Z' },
    ],
  }))
  const got = readTopSweep(dir, 5, {
    nowMs: Date.parse('2026-08-04T00:10:00Z'), maxAgeMs: 2 * 3_600_000,
  })
  assert.deepEqual(
    new Set(got.rows.map((row) => row.headline)),
    new Set(['Company wins regulator approval', 'Correction: approval remains conditional', 'Regulator withdraws approval']),
    'the original source hierarchy winner cannot hide a later falsifying correction or reversal',
  )
  fs.rmSync(dir, { recursive: true, force: true })
})
check('readTopSweep never admits rows through stale or malformed historical partition clocks', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ideas-sweep-untrusted-clock-'))
  const inbox = path.join(dir, 'screener', 'inbox')
  fs.mkdirSync(inbox, { recursive: true })
  fs.writeFileSync(path.join(inbox, '2026-08-02_sweep.json'), JSON.stringify({
    updated_at: '2026-08-02T20:00:00Z',
    rows: [{ headline: 'Stale partition row', url: 'https://news.test/stale-partition', triage_score: 100, found_at: '2026-08-04T00:05:00Z' }],
  }))
  fs.writeFileSync(path.join(inbox, '2026-08-03_sweep.json'), JSON.stringify({
    updated_at: 'not-a-time',
    rows: [{ headline: 'Malformed partition row', url: 'https://news.test/bad-partition', triage_score: 99, found_at: '2026-08-04T00:05:00Z' }],
  }))
  fs.writeFileSync(path.join(inbox, '2026-08-04_sweep.json'), JSON.stringify({
    updated_at: '2026-08-04T00:06:00Z',
    rows: [{ headline: 'Trusted row', url: 'https://news.test/trusted', triage_score: 80, found_at: '2026-08-04T00:05:00Z' }],
  }))

  const got = readTopSweep(dir, 5, {
    nowMs: Date.parse('2026-08-04T00:10:00Z'), maxAgeMs: 2 * 3_600_000,
  })
  assert.equal(got.status, 'degraded')
  assert.equal(got.invalid_time_count, 1)
  assert.deepEqual(got.rows.map((row) => row.headline), ['Trusted row'])
  fs.rmSync(dir, { recursive: true, force: true })
})
check('readTopSweep exposes a lost recent partition even when the newest partition is empty', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ideas-sweep-degraded-empty-'))
  const inbox = path.join(dir, 'screener', 'inbox')
  fs.mkdirSync(inbox, { recursive: true })
  fs.writeFileSync(path.join(inbox, '2026-08-03_sweep.json'), JSON.stringify({ updated_at: 'not-a-time', rows: [] }))
  fs.writeFileSync(path.join(inbox, '2026-08-04_sweep.json'), JSON.stringify({ updated_at: '2026-08-04T00:06:00Z', rows: [] }))
  const got = readTopSweep(dir, 5, {
    nowMs: Date.parse('2026-08-04T00:10:00Z'), maxAgeMs: 2 * 3_600_000,
  })
  assert.equal(got.status, 'degraded')
  assert.equal(got.invalid_time_count, 1)
  assert.deepEqual(got.rows, [])
  fs.rmSync(dir, { recursive: true, force: true })
})
check('readTopSweep bounds historical partition reads to the freshness window', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ideas-sweep-bounded-history-'))
  const inbox = path.join(dir, 'screener', 'inbox')
  fs.mkdirSync(inbox, { recursive: true })
  for (let day = 1; day <= 20; day++) {
    const dd = String(day).padStart(2, '0')
    fs.writeFileSync(path.join(inbox, `2026-07-${dd}_sweep.json`), JSON.stringify({
      updated_at: `2026-07-${dd}T12:00:00Z`, rows: [],
    }))
  }
  fs.writeFileSync(path.join(inbox, '2026-07-01_sweep.json'), '{')
  fs.writeFileSync(path.join(inbox, '2026-07-20_sweep.json'), JSON.stringify({
    updated_at: '2026-07-20T12:00:00Z',
    rows: [{ headline: 'Current bounded row', url: 'https://news.test/current-bounded', triage_score: 80, found_at: '2026-07-20T11:59:00Z' }],
  }))

  const got = readTopSweep(dir, 5, {
    nowMs: Date.parse('2026-07-20T12:05:00Z'), maxAgeMs: 2 * 3_600_000,
  })
  assert.equal(got.status, 'ok')
  assert.deepEqual(got.rows.map((row) => row.headline), ['Current bounded row'])
  assert.equal(got.invalid_time_count, 0, 'far archival debris is outside the bounded partition scan')
  fs.rmSync(dir, { recursive: true, force: true })
})
check('readTopSweep ignores a sparse archival corrupt file whose date cannot overlap freshness', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ideas-sweep-sparse-archive-'))
  const inbox = path.join(dir, 'screener', 'inbox')
  fs.mkdirSync(inbox, { recursive: true })
  fs.writeFileSync(path.join(inbox, '2026-01-01_sweep.json'), '{')
  fs.writeFileSync(path.join(inbox, '2026-08-04_sweep.json'), JSON.stringify({
    updated_at: '2026-08-04T00:06:00Z',
    rows: [{ headline: 'Current sparse row', url: 'https://news.test/current-sparse', triage_score: 80, found_at: '2026-08-04T00:05:00Z' }],
  }))
  const got = readTopSweep(dir, 5, {
    nowMs: Date.parse('2026-08-04T00:10:00Z'), maxAgeMs: 2 * 3_600_000,
  })
  assert.equal(got.status, 'ok')
  assert.equal(got.invalid_time_count, 0)
  assert.deepEqual(got.rows.map((row) => row.headline), ['Current sparse row'])
  fs.rmSync(dir, { recursive: true, force: true })
})
check('prior-partition human decisions remain blocking just outside the candidate freshness floor', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ideas-sweep-durable-human-state-'))
  const inbox = path.join(dir, 'screener', 'inbox')
  fs.mkdirSync(inbox, { recursive: true })
  fs.writeFileSync(path.join(inbox, '2026-08-03_sweep.json'), JSON.stringify({
    updated_at: '2026-08-03T22:09:59Z',
    rows: [
      { headline: 'Consumed source', url: 'https://primary.test/consumed', dedup_group: 'STORY-consumed-floor', triage_score: 98, found_at: '2026-08-03T22:00:00Z', consumed: true },
      { headline: 'Dismissed source', url: 'https://primary.test/dismissed', dedup_group: 'STORY-dismissed-floor', triage_score: 97, found_at: '2026-08-03T22:00:00Z', dismissed: true },
    ],
  }))
  fs.writeFileSync(path.join(inbox, '2026-08-04_sweep.json'), JSON.stringify({
    updated_at: '2026-08-04T00:06:00Z',
    rows: [
      { headline: 'Current copy of consumed story', url: 'https://copy.test/consumed', dedup_group: 'STORY-consumed-floor', triage_score: 100, found_at: '2026-08-04T00:04:00Z' },
      { headline: 'Current copy of dismissed story', url: 'https://copy.test/dismissed', dedup_group: 'STORY-dismissed-floor', triage_score: 99, found_at: '2026-08-04T00:04:00Z' },
      { headline: 'Unblocked current story', url: 'https://news.test/unblocked', triage_score: 90, found_at: '2026-08-04T00:05:00Z' },
    ],
  }))

  const got = readTopSweep(dir, 5, {
    nowMs: Date.parse('2026-08-04T00:10:00Z'), maxAgeMs: 2 * 3_600_000,
  })
  assert.deepEqual(got.rows.map((row) => row.headline), ['Unblocked current story'])
  fs.rmSync(dir, { recursive: true, force: true })
})
check('a post-midnight freshness floor still reads the immediately preceding human-state partition', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ideas-sweep-midnight-human-state-'))
  const inbox = path.join(dir, 'screener', 'inbox')
  fs.mkdirSync(inbox, { recursive: true })
  fs.writeFileSync(path.join(inbox, '2026-08-03_sweep.json'), JSON.stringify({
    updated_at: '2026-08-03T23:59:30Z',
    rows: [{
      headline: 'Dismissed just before midnight', url: 'https://primary.test/midnight-dismissed',
      dedup_group: 'STORY-midnight-dismissed', triage_score: 98,
      found_at: '2026-08-03T23:59:00Z', dismissed: true,
    }],
  }))
  fs.writeFileSync(path.join(inbox, '2026-08-04_sweep.json'), JSON.stringify({
    updated_at: '2026-08-04T06:04:30Z',
    rows: [
      {
        headline: 'Current copy of midnight dismissal', url: 'https://copy.test/midnight-dismissed',
        dedup_group: 'STORY-midnight-dismissed', triage_score: 100, found_at: '2026-08-04T06:04:00Z',
      },
      { headline: 'Unblocked morning story', url: 'https://news.test/morning', triage_score: 90, found_at: '2026-08-04T06:04:00Z' },
    ],
  }))

  const got = readTopSweep(dir, 5, {
    nowMs: Date.parse('2026-08-04T06:05:00Z'), maxAgeMs: 6 * 3_600_000,
  })
  assert.deepEqual(got.rows.map((row) => row.headline), ['Unblocked morning story'])
  fs.rmSync(dir, { recursive: true, force: true })
})
check('a corrupt human-state-only partition pauses candidates so an unknown dismissal cannot resurrect', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ideas-sweep-corrupt-human-only-'))
  const inbox = path.join(dir, 'screener', 'inbox')
  fs.mkdirSync(inbox, { recursive: true })
  // At 06:05 with a six-hour input window, 2026-08-03 is read only for a possible just-before-midnight
  // human decision. Corruption means we cannot prove that either current story was not dismissed there.
  fs.writeFileSync(path.join(inbox, '2026-08-03_sweep.json'), '{')
  fs.writeFileSync(path.join(inbox, '2026-08-04_sweep.json'), JSON.stringify({
    updated_at: '2026-08-04T06:04:30Z',
    rows: [
      { headline: 'Healthy current leader', url: 'https://news.test/healthy-current', triage_score: 91, found_at: '2026-08-04T06:04:00Z' },
      { headline: 'Healthy current comparison', url: 'https://news.test/healthy-comparison', triage_score: 88, found_at: '2026-08-04T06:03:00Z' },
    ],
  }))

  const got = readTopSweep(dir, 5, {
    nowMs: Date.parse('2026-08-04T06:05:00Z'), maxAgeMs: 6 * 3_600_000,
  })
  assert.equal(got.status, 'degraded')
  assert.deepEqual(got.rows, [], 'unknown veto state withholds every candidate instead of resurrecting one')
  assert.equal(got.invalid_time_count, 1, 'the missing human-state partition is disclosed')
  fs.rmSync(dir, { recursive: true, force: true })
})
check('an unidentified human-action row pauses candidates, while a malformed non-human row does not', () => {
  const makeRoot = (humanRow: Record<string, unknown>) => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ideas-sweep-corrupt-human-row-'))
    const inbox = path.join(dir, 'screener', 'inbox')
    fs.mkdirSync(inbox, { recursive: true })
    fs.writeFileSync(path.join(inbox, '2026-08-03_sweep.json'), JSON.stringify({
      updated_at: '2026-08-03T23:59:30Z', rows: [humanRow],
    }))
    fs.writeFileSync(path.join(inbox, '2026-08-04_sweep.json'), JSON.stringify({
      updated_at: '2026-08-04T06:04:30Z',
      rows: [
        { headline: 'Healthy current leader', url: 'https://news.test/healthy-current', triage_score: 91, found_at: '2026-08-04T06:04:00Z' },
        { headline: 'Healthy current comparison', url: 'https://news.test/healthy-comparison', triage_score: 88, found_at: '2026-08-04T06:03:00Z' },
      ],
    }))
    return dir
  }
  const freshness = { nowMs: Date.parse('2026-08-04T06:05:00Z'), maxAgeMs: 6 * 3_600_000 }

  const corruptHuman = makeRoot({ dismissed: true, headline: 'Unknown prior dismissal' })
  const paused = readTopSweep(corruptHuman, 5, freshness)
  assert.equal(paused.status, 'degraded')
  assert.deepEqual(paused.rows, [], 'a dismissal with no event id or canonical headline+URL cannot be skipped')
  assert.equal(paused.invalid_time_count, 1, 'the corrupt human row is disclosed as one integrity defect')
  fs.rmSync(corruptHuman, { recursive: true, force: true })

  const corruptNonHuman = makeRoot({ headline: 'Malformed archival candidate', triage_score: 'bad' })
  const healthy = readTopSweep(corruptNonHuman, 5, freshness)
  assert.equal(healthy.status, 'ok', 'a malformed row with no human action does not manufacture an unknown veto')
  assert.deepEqual(healthy.rows.map((row) => row.headline), ['Healthy current leader', 'Healthy current comparison'])
  fs.rmSync(corruptNonHuman, { recursive: true, force: true })
})
check('mergeInbox -> readTopSweep -> trade score uses only real source-dated catalyst evidence', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ideas-source-catalyst-'))
  const nowMs = Date.parse('2026-08-02T12:00:00Z')
  const triaged = (url: string, headline: string, score: number): any => ({
    event_id: eventIdFor(headline, url), headline, url, domain: 'reuters.com', source_name: 'Reuters',
    region: 'US', input_nature: 'news_headline', found_at: '2026-08-02T10:00:00Z', dedup_status: 'new',
    triage_score: score, triage_reason: 'material source headline', relevance: 'material',
    materiality_pre_score: 72, event_types: ['earnings_revenue_margin'], issuer_linkage: 'primary',
    companies: [{ name: 'Amazon', ticker: 'AMZN', listing_country: 'US' }], size_bucket: 'mega', band: 'pick',
    event_materiality_label: 'high', event_direction: 'positive', event_scope: 'company_specific',
  })
  mergeInbox(dir, '2026-08-02', [
    triaged('https://news.test/future', 'Amazon to report earnings on 2026-08-06', 94),
    triaged('https://news.test/future-quarter-day', 'Amazon earnings date for Q2 2026 on 2026-08-06', 94),
    triaged('https://news.test/future-quarter-day-undated-neighbor', 'Amazon earnings date for Q2 2026 on 2026-08-06, AGM announced', 94),
    triaged('https://news.test/category', 'Amazon to report earnings after the close', 93),
    triaged('https://news.test/malformed', 'Amazon to report earnings on 2026-02-30', 92),
    triaged('https://news.test/negated', 'Amazon says no earnings date within 30 days', 91),
    triaged('https://news.test/cancelled', 'Amazon to report earnings on 2026-09-09 cancelled', 90),
    triaged('https://news.test/relative', 'Amazon to report earnings tomorrow', 89),
    triaged('https://news.test/absent', 'Amazon launches a new shopping feature', 88),
    triaged('https://news.test/postponed', 'Amazon AGM on 2026-09-09 has since been postponed', 87),
    triaged('https://news.test/rescheduled', 'Amazon reschedules AGM previously set for 2026-09-09', 86),
    triaged('https://news.test/moved', 'Amazon moved the AGM from 2026-09-09 to 2026-10-10', 85),
    triaged('https://news.test/deferred', 'Amazon defers AGM scheduled for 2026-09-09', 84),
    triaged('https://news.test/denied', 'Amazon denied the AGM would be held on 2026-09-09', 83),
    triaged('https://news.test/revised', 'Amazon AGM date revised from 2026-09-09 to 2026-10-10', 82),
    triaged('https://news.test/might', 'Amazon might hold AGM on 2026-09-09', 81),
    triaged('https://news.test/tentative', 'Amazon tentative AGM on 2026-09-09', 80),
    triaged('https://news.test/cancelled-next-sentence', 'Amazon AGM on 2026-09-09. The event was cancelled', 79),
  ], { maxRows: 20, now: () => new Date(nowMs) })
  const sweep = readTopSweep(dir, 20, { nowMs, maxAgeMs: 36 * 3_600_000 })
  assert.equal(sweep.status, 'ok')
  const byHeadline = new Map(sweep.rows.map((row) => [row.headline, row]))
  const scored = (headline: string) => scoreTradeCluster(
    tradeEvidenceForIdeaRows([byHeadline.get(headline)!]),
    {
      nowMs, ticker: 'AMZN', exchange: 'NASDAQ', tickerVerified: true,
      listingLiquidityVerified: true, pricedIn: 'room',
    },
  )

  const future = scored('Amazon to report earnings on 2026-08-06')
  assert.equal(future.breakdown.timing, 15)
  assert.ok(!future.missingChecks.includes('dated catalyst'))
  const preciseFuture = scored('Amazon earnings date for Q2 2026 on 2026-08-06')
  assert.equal(preciseFuture.breakdown.timing, 15)
  assert.ok(!preciseFuture.missingChecks.includes('dated catalyst'))
  const preciseFutureWithNeighbor = scored('Amazon earnings date for Q2 2026 on 2026-08-06, AGM announced')
  assert.equal(preciseFutureWithNeighbor.breakdown.timing, 15)
  assert.ok(!preciseFutureWithNeighbor.missingChecks.includes('dated catalyst'))
  for (const headline of [
    'Amazon to report earnings after the close',
    'Amazon to report earnings on 2026-02-30',
    'Amazon says no earnings date within 30 days',
    'Amazon to report earnings on 2026-09-09 cancelled',
    'Amazon to report earnings tomorrow',
    'Amazon launches a new shopping feature',
    'Amazon AGM on 2026-09-09 has since been postponed',
    'Amazon reschedules AGM previously set for 2026-09-09',
    'Amazon moved the AGM from 2026-09-09 to 2026-10-10',
    'Amazon defers AGM scheduled for 2026-09-09',
    'Amazon denied the AGM would be held on 2026-09-09',
    'Amazon AGM date revised from 2026-09-09 to 2026-10-10',
    'Amazon might hold AGM on 2026-09-09',
    'Amazon tentative AGM on 2026-09-09',
    'Amazon AGM on 2026-09-09. The event was cancelled',
  ]) {
    const result = scored(headline)
    assert.equal(result.breakdown.timing, 10, `${headline}: fresh news alone gets recency timing, not catalyst timing`)
    assert.ok(result.missingChecks.includes('dated catalyst'), `${headline}: no source-bound dated catalyst`)
  }
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
    { theme_id: 'THM-11111111', rev: 1, assessment: { status: 'forming' }, evidence: [{ event_id: wire[6].event_id, found_at: at, stance: 'supports' }] },
    { theme_id: 'THM-22222222', rev: 1, assessment: { status: 'context' }, evidence: [{ event_id: wire[7].event_id, found_at: at, stance: 'supports' }] },
    actionableTheme('THM-a1b2c3d4', 4, [
      { event_id: wire[8].event_id, headline: 'must not be mapped', found_at: at, stance: 'supports' },
      { event_id: publisherCopy.event_id, found_at: at, stance: 'supports' },
      { event_id: themeCopyOfTopWire.event_id, found_at: at, stance: 'supports' },
    ] as any, [qualifiedExpression([wire[8].event_id, publisherCopy.event_id, themeCopyOfTopWire.event_id])]),
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
    evidence_event_ids: [wire[8].event_id],
    why_now_event_id: wire[8].event_id,
  }], 'each prompt row carries only its exact input edge; persistence joins the complete package later')
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
check('Theme-to-Ideas bridge excludes the whole theme when a retained challenge exists', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ideas-theme-proof-binding-'))
  const inbox = path.join(dir, 'screener', 'inbox')
  const board = path.join(dir, 'screener', 'board')
  fs.mkdirSync(inbox, { recursive: true })
  fs.mkdirSync(board, { recursive: true })
  const at = '2026-08-03T10:00:00Z'
  const feedItem = (headline: string, url: string, score: number) => ({
    kind: 'item', ts: at, found_at: at, event_id: eventIdFor(headline, url), headline, url,
    domain: 'news.test', source_name: 'Publisher', via: 'rss', region: 'US', input_nature: 'news_headline',
    triage_score: score, band: 'watch', triage_reason: 'material', relevance: 'material',
    event_types: ['operational'], issuer_linkage: 'primary', companies: [], size_bucket: 'large',
    dedup_status: 'new', inboxed: true,
  })
  const boundSupport = feedItem('Bound supporting evidence', 'https://news.test/bound-support', 92)
  const unboundSupport = feedItem('Unbound supporting evidence', 'https://news.test/unbound-support', 91)
  const challenge = feedItem('Evidence challenging the theme', 'https://news.test/challenge', 90)
  fs.writeFileSync(
    path.join(inbox, '2026-08-03_firehose.ndjson'),
    [boundSupport, unboundSupport, challenge].map((row) => JSON.stringify(row)).join('\n') + '\n',
  )
  fs.writeFileSync(path.join(inbox, '2026-08-03_sweep.json'), JSON.stringify({
    updated_at: '2026-08-03T11:55:00Z',
    rows: [1, 2, 3, 4].map((n) => ({
      headline: `Proof-binding wire ${n}`, url: `https://wire.test/proof-binding-${n}`,
      source_name: 'Wire', triage_score: 100 - n, found_at: at,
    })),
  }))
  fs.writeFileSync(path.join(board, 'themes_index.json'), JSON.stringify({
    generated_at: '2026-08-03T11:59:00Z',
    themes: [actionableTheme('THM-a1b2c3d4', 7, [
        { event_id: challenge.event_id, found_at: at, stance: 'challenges' },
        { event_id: boundSupport.event_id, found_at: at, stance: 'supports' },
        { event_id: unboundSupport.event_id, found_at: at, stance: 'supports' },
      ], [qualifiedExpression([boundSupport.event_id])], {
        activity: 'quiet', assessment: { status: 'actionable', activity: 'quiet' },
      })],
  }))

  const got = readTopSweep(dir, 6, {
    nowMs: Date.parse('2026-08-03T12:00:00Z'), maxAgeMs: 36 * 3_600_000,
  })
  assert.ok(got.rows.every((row) => row.origin_type === 'wire'), 'one retained explicit challenge excludes the entire theme even when its activity label is quiet')
  fs.rmSync(dir, { recursive: true, force: true })
})
check('a retained unconfirmed challenge stays visible and blocks Ideas', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ideas-theme-ledger-challenge-'))
  const inbox = path.join(dir, 'screener', 'inbox')
  const board = path.join(dir, 'screener', 'board')
  fs.mkdirSync(inbox, { recursive: true })
  fs.mkdirSync(board, { recursive: true })
  const now = new Date('2026-08-03T12:00:00Z')
  const company = { name: 'Acme Corp', ticker: 'ACME', listing_country: 'US' }
  const support = [
    ['Acme transformer backlog expands grid capacity', 'https://filings.test/acme-capacity'],
    ['Acme transformer backlog tightens grid capacity', 'https://regulator.test/grid-capacity'],
  ].map(([headline, url], index) => ({
    event_id: eventIdFor(headline, url), headline, found_at: `2026-08-03T${10 + index}:00:00Z`,
    triage_score: 90 - index, source_tier: index ? 'official_data' : 'company', source_name: index ? 'Grid Regulator' : 'Acme filing',
    url, companies: [company], event_types: ['capex'], issuer_linkage: 'primary', country: 'US', region: 'US',
  }))
  const challengeHeadline = 'Unconfirmed report says Acme transformer backlog is easing'
  const challengeUrl = 'https://rumor.test/acme-backlog'
  const challenge = {
    event_id: eventIdFor(challengeHeadline, challengeUrl), headline: challengeHeadline,
    found_at: '2026-07-01T09:00:00Z', triage_score: 50, source_tier: 'unconfirmed', source_name: 'Rumor wire', url: challengeUrl,
    companies: [company], event_types: ['operational'], issuer_linkage: 'primary', country: 'US', region: 'US',
  }
  const theme = attachValidNarrative(
    createTheme([...support, challenge] as ThemeItemView[], now, 'claude'),
    {
      support_event_ids: support.map((row) => row.event_id),
      challenge_event_ids: [challenge.event_id],
      why_now_event_id: support[1].event_id,
      validated_at: '2026-08-03T11:30:00Z',
    },
  )
  theme.name = 'Transformer Backlog Extends Grid Buildout'
  theme.description = 'A persistent transformer backlog constrains grid capacity and shifts economics to qualified suppliers.'
  const publicTheme = buildThemesIndex([theme], () => now).themes[0]
  assert.equal(publicTheme.assessment.status, 'actionable')
  assert.ok(publicTheme.evidence.some((row) => row.event_id === challenge.event_id && row.stance === 'challenges'), 'adverse evidence is never hidden merely because its source is weak')
  appendThemeMutations(dir, [theme], () => new Date('2026-08-03T11:58:00Z'))
  fs.writeFileSync(path.join(board, 'themes_index.json'), JSON.stringify({ generated_at: '2026-08-03T11:59:00Z', themes: [] }))
  fs.writeFileSync(path.join(inbox, '2026-08-03_sweep.json'), JSON.stringify({
    updated_at: '2026-08-03T11:55:00Z', rows: [1, 2, 3, 4].map((n) => ({
      headline: `Challenge-control wire ${n}`, url: `https://wire.test/challenge-control-${n}`,
      source_name: 'Wire', triage_score: 100 - n, found_at: '2026-08-03T11:00:00Z',
    })),
  }))

  const got = readTopSweep(dir, 6, { nowMs: now.getTime(), maxAgeMs: 36 * 3_600_000 })
  assert.ok(got.rows.every((row) => row.origin_type === 'wire'), 'canonical retained challenge wins over a clean-looking excerpt')
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
    themes: [actionableTheme(
      'THM-a1b2c3d4', 1,
      themes.map((item) => ({ event_id: item.event_id, found_at: at, stance: 'supports' })),
      [qualifiedExpression(themes.map((item) => item.event_id))],
    )],
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
  assert.equal(twoWire.rows.length, 2)
  assert.equal(twoWire.rows.filter((row) => row.origin_type === 'theme' || row.origin_type === 'mixed').length, 0)
  assert.equal(Math.floor(twoWire.rows.length / 3), 0, 'an indivisible two-row Theme package cannot bootstrap a sparse wire')

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
  const proofHeadline = 'Bounded Theme issuer exposure proof'
  const proofUrl = 'https://filings.test/bounded-theme-proof'
  const proofEventId = eventIdFor(proofHeadline, proofUrl)
  const feedItem = (eventId: string, headline: string, url: string, sourceName: string) => ({
    kind: 'item', ts: at, found_at: at, event_id: eventId, headline, url,
    domain: new URL(url).hostname, source_name: sourceName, via: 'rss', region: 'US', input_nature: 'news_headline',
    triage_score: 90, band: 'watch', triage_reason: 'material', relevance: 'material', event_types: ['operational'],
    issuer_linkage: 'primary', companies: [], size_bucket: 'large', dedup_status: 'new', inboxed: true,
  })
  fs.writeFileSync(
    path.join(inbox, '2026-08-03_firehose.ndjson'),
    [feedItem(liveEventId, liveHeadline, liveUrl, 'News'), feedItem(proofEventId, proofHeadline, proofUrl, 'Exchange filing')]
      .map((row) => JSON.stringify(row)).join('\n') + '\n',
  )
  fs.writeFileSync(path.join(inbox, '2026-08-03_sweep.json'), JSON.stringify({
    updated_at: '2026-08-03T11:55:00Z', rows: [1, 2, 3, 4].map((n) => ({
      headline: `Bound wire ${n}`, url: `https://wire.test/bound-${n}`, triage_score: 100 - n, found_at: at,
    })),
  }))
  const missingThemes = Array.from({ length: 64 }, (_, index) => {
    const eventId = eventIdFor(`Missing bounded evidence ${index}`, `https://missing.test/${index}`)
    return actionableTheme(
      `THM-${index.toString(16).padStart(8, '0')}`, 1,
      [{ event_id: eventId, found_at: at, stance: 'supports' }],
      [qualifiedExpression([eventId])],
    )
  })
  const liveTheme = actionableTheme(
    'THM-ffffffff', 1,
    [
      { event_id: liveEventId, found_at: at, stance: 'supports' },
      { event_id: proofEventId, found_at: at, stance: 'supports' },
    ],
    [qualifiedExpression([proofEventId])],
  )
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
  const proofHeadline = 'Theme source-time issuer proof'
  const proofUrl = 'https://filings.test/theme-time-proof'
  const proofEventId = eventIdFor(proofHeadline, proofUrl)
  const feedPath = path.join(inbox, '2026-08-03_firehose.ndjson')
  const feedItem = (rowEventId: string, headline: string, url: string, foundAt?: string) => ({
    kind: 'item', ts: '2026-08-03T11:59:00Z', ...(foundAt ? { found_at: foundAt } : {}),
    event_id: rowEventId, headline, url, domain: new URL(url).hostname, source_name: 'Publisher',
    via: 'rss', region: 'US', input_nature: 'news_headline', triage_score: 90, band: 'watch',
    triage_reason: 'material', relevance: 'material', event_types: ['operational'], issuer_linkage: 'primary',
    companies: [], size_bucket: 'large', dedup_status: 'new', inboxed: true,
  })
  const writeFeed = (foundAt?: string) => fs.writeFileSync(
    feedPath,
    [feedItem(eventId, themeHeadline, themeUrl, foundAt), feedItem(proofEventId, proofHeadline, proofUrl, foundAt)]
      .map((row) => JSON.stringify(row)).join('\n') + '\n',
  )
  fs.writeFileSync(path.join(inbox, '2026-08-03_sweep.json'), JSON.stringify({
    updated_at: '2026-08-03T11:45:00Z',
    rows: [
      { headline: 'Wire A', url: 'https://wire.test/a', triage_score: 99, found_at: '2026-08-03T10:00:00Z' },
      { headline: 'Wire B', url: 'https://wire.test/b', triage_score: 98, found_at: '2026-08-03T10:00:00Z' },
      { headline: 'Wire C', url: 'https://wire.test/c', triage_score: 97, found_at: '2026-08-03T10:00:00Z' },
      { headline: 'Wire D', url: 'https://wire.test/d', triage_score: 96, found_at: '2026-08-03T10:00:00Z' },
    ],
  }))
  const writeIndex = (generatedAt: string | undefined, evidenceAt: string) => fs.writeFileSync(
    path.join(board, 'themes_index.json'),
    JSON.stringify({
      ...(generatedAt ? { generated_at: generatedAt } : {}),
      themes: [actionableTheme(
        'THM-a1b2c3d4', 3,
        [
          { event_id: eventId, found_at: evidenceAt, stance: 'supports' },
          { event_id: proofEventId, found_at: evidenceAt, stance: 'supports' },
        ],
        [qualifiedExpression([proofEventId])],
      )],
    }),
  )
  const read = () => readTopSweep(dir, 6, { nowMs: Date.parse('2026-08-03T12:00:00Z'), maxAgeMs: 36 * 3_600_000 })

  writeFeed('2026-08-01T00:00:00Z')
  writeIndex('2026-08-03T11:59:00Z', '2026-08-01T00:00:00Z')
  assert.equal(read().rows.some((row) => row.event_id === eventId), false, 'fresh triage ts cannot revive old source evidence')

  const sourceAt = '2026-08-03T10:30:00Z'
  writeFeed()
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
check('ledger content is reprojected without forging a newer last-successful Themes stage clock', () => {
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
  const theme = attachValidNarrative(
    createTheme(themeViews, new Date('2026-08-03T11:30:00Z'), 'claude'),
    {
      validated_at: '2026-08-03T11:30:00Z',
      // The default expression binds the first member; why-now must be a separate event so the
      // reprojected Theme remains an exact two-row causal package.
      why_now_event_id: themeViews[1].event_id,
    },
  )
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

  const staleStage = readTopSweep(dir, 6, {
    nowMs: projectionNow.getTime(), maxAgeMs: 36 * 3_600_000,
  })
  assert.ok(staleStage.rows.every((row) => row.origin_type === 'wire'), 'a canonical re-projection cannot restamp a 30-minute-old failed Themes stage')
  fs.writeFileSync(path.join(board, 'themes_index.json'), JSON.stringify({ generated_at: '2026-08-03T11:59:00Z', themes: [] }))
  const current = readTopSweep(dir, 6, {
    nowMs: projectionNow.getTime(), maxAgeMs: 36 * 3_600_000,
  })
  assert.ok(current.rows.some((row) => row.origin_type === 'theme' && row.theme_expressions?.[0]?.ticker === 'NVDA'), 'fresh stage clock may use the canonical ledger projection')
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
    themes: [actionableTheme('THM-a1b2c3d4', 2, [
        { event_id: dismissed.event_id, found_at: at, stance: 'supports' },
        { event_id: dismissedCopy.event_id, found_at: at, stance: 'supports' },
        { event_id: consumed.event_id, found_at: at, stance: 'supports' },
      ], [qualifiedExpression([dismissed.event_id, dismissedCopy.event_id, consumed.event_id])])],
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
    themes: [actionableTheme('THM-a1b2c3d4', 4, [
        { event_id: dismissed.event_id, found_at: sourceAt, stance: 'supports' },
        { event_id: consumedCopy.event_id, found_at: sourceAt, stance: 'supports' },
      ], [qualifiedExpression([dismissed.event_id, consumedCopy.event_id])])],
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
  const proofHeadline = 'Exchange filing binds the canonical Theme to Acme'
  const proofUrl = 'https://filings.test/canonical-theme-proof'
  const proof = {
    ...copy,
    event_id: eventIdFor(proofHeadline, proofUrl),
    headline: proofHeadline,
    url: proofUrl,
    domain: 'filings.test',
    source_name: 'Exchange filing',
    dedup_group: 'STORY-canonical-theme-proof',
  }
  const otherWire = [2, 3, 4, 5].map((n) => ({
    headline: `Independent wire ${n}`, url: `https://wire.test/independent-${n}`, source_name: 'Wire',
    triage_score: 100 - n, found_at: at,
  }))
  const sweepPath = path.join(inbox, '2026-08-03_sweep.json')
  fs.writeFileSync(sweepPath, JSON.stringify({
    updated_at: '2026-08-03T11:58:00Z', rows: [anchor, ...otherWire],
  }))
  fs.writeFileSync(
    path.join(inbox, '2026-08-03_firehose.ndjson'),
    [copy, proof].map((row) => JSON.stringify(row)).join('\n') + '\n',
  )
  fs.writeFileSync(path.join(board, 'themes_index.json'), JSON.stringify({
    generated_at: '2026-08-03T11:59:00Z', themes: [actionableTheme(
      'THM-a1b2c3d4', 3,
      [
        { event_id: copy.event_id, found_at: at, stance: 'supports' },
        { event_id: proof.event_id, found_at: at, stance: 'supports' },
      ],
      [qualifiedExpression([proof.event_id])],
    )],
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
check('withdrawn Theme admission retires every unpromoted Theme-derived snapshot without current wire proof', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ideas-theme-retire-'))
  const themeId = 'THM-a1b2c3d4'
  const themeRev = 4
  const whyHeadline = 'Retire trigger remains active'
  const whyUrl = 'https://exchange.test/retire-trigger'
  const whyEventId = eventIdFor(whyHeadline, whyUrl)
  const proofHeadline = 'Retire filing proves the listed exposure'
  const proofUrl = 'https://filings.test/retire-proof'
  const proofEventId = eventIdFor(proofHeadline, proofUrl)
  const sourceTheme = {
    theme_id: themeId,
    theme_rev: themeRev,
    evidence_event_ids: [whyEventId, proofEventId],
    why_now_event_id: whyEventId,
  }
  const themeSnapshot = (ticker: string, originType: 'theme' | 'mixed', patch: Record<string, unknown> = {}) => validIdeaSnapshot(ticker, 'long', {
    source_event_ids: [whyEventId, proofEventId],
    primary_source_event_id: whyEventId,
    source_headlines: [whyHeadline, proofHeadline],
    source_headline: whyHeadline,
    source_url: whyUrl,
    source_name: 'Exchange',
    origin_type: originType,
    source_themes: [sourceTheme],
    ...patch,
  })
  writeIdea(dir, themeSnapshot('RETIRE', 'theme'))
  writeIdea(dir, themeSnapshot('MIXED', 'mixed'))
  writeIdea(dir, themeSnapshot('PROMOTED', 'theme', {
    status: 'promoted', promoted_signal_id: 'SIG-retained',
  }))
  const whyRow: IdeaInputRow = {
    ...ROWS[0], event_id: whyEventId, headline: whyHeadline, headline_orig: whyHeadline,
    url: whyUrl, source_name: 'Exchange',
  }
  const proofRow: IdeaInputRow = {
    ...ROWS[1], event_id: proofEventId, headline: proofHeadline, headline_orig: proofHeadline,
    url: proofUrl, source_name: 'Exchange filing',
  }
  const admitted = exactThemePackageRows(themeId, themeRev, whyRow, proofRow, [
    exactThemeExpression(themeId, themeRev, proofEventId, {
      name: 'Retire', name_key: 'retire', ticker: 'RETIRE',
    }),
  ])
  assert.equal(retireUnadmittedThemeIdeas(dir, admitted), 0)
  assert.ok(readIdeaById(dir, ideaId('RETIRE', 'long')))
  assert.equal(retireUnadmittedThemeIdeas(dir, []), 2)
  assert.equal(readIdeaById(dir, ideaId('RETIRE', 'long')), null)
  assert.equal(readIdeaById(dir, ideaId('MIXED', 'long')), null, 'a historical mixed label is not independent current wire proof')
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
        primarySourceEventId: current.primary_source_event_id!, sourceHeadline: current.source_headline!,
        sourceUrl: current.source_url!, sourceName: current.source_name!, originType: current.origin_type!,
        sourceThemes: current.source_themes!,
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
