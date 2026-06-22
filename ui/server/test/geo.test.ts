// Event geography: the content-derived "where the event is" region (news/geo.ts) that overrides the
// publisher's domain region, the triage contract carrying event_region (groq.ts coerceTriage), and the
// end-to-end cycle persisting it on the wire — the SCMP/Bangladesh case lands OTHER, not CN. Pure +
// mocked fetch + isolated tmp repo — no key / network / install needed. Run: npx tsx test/geo.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { isRegion, listingCountryToRegion, resolveEventRegion } from '../src/news/geo'
import { coerceTriage } from '../src/news/triage/groq'
import { runIngestCycle } from '../src/news/runCycle'
import type { Triage } from '../src/news/types'

let passed = 0
async function check(name: string, fn: () => void | Promise<void>) {
  try {
    await fn()
    passed++
    console.log(`  ok  ${name}`)
  } catch (e: any) {
    console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`)
    process.exitCode = 1
  }
}
function res(body: any, status = 200, headers: Record<string, string> = {}): any {
  const h = new Map(Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v]))
  return { ok: status >= 200 && status < 300, status, headers: { get: (k: string) => h.get(k.toLowerCase()) ?? null }, text: async () => JSON.stringify(body), json: async () => body }
}
const noSleep = async () => {}
const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'geo-'))

// helper: a minimal Triage with the fields resolveEventRegion reads
const tri = (p: Partial<Triage>): Triage => ({
  relevance: 'material', materiality_pre_score: 70, event_types: [], issuer_linkage: 'macro', why: '',
  companies: [], size_bucket: 'unknown', event_region: null, ...p,
})

// ---- isRegion: only the eight enum codes (null = "unsure", not a Region) ----
await check('isRegion: enum codes true; null / unknown / lowercase false', () => {
  for (const r of ['US', 'IN', 'JP', 'GB', 'CN', 'KR', 'GLOBAL', 'OTHER']) assert.equal(isRegion(r), true, r)
  for (const r of [null, undefined, '', 'XX', 'us', 'china', 42]) assert.equal(isRegion(r as any), false, String(r))
})

// ---- listingCountryToRegion: first-class markets named; HK→CN; other real codes → OTHER; junk → null ----
await check('listingCountryToRegion: ISO → Region bucket', () => {
  assert.equal(listingCountryToRegion('us'), 'US')
  assert.equal(listingCountryToRegion('IN'), 'IN')
  assert.equal(listingCountryToRegion('jp'), 'JP')
  assert.equal(listingCountryToRegion('uk'), 'GB') // UK alias → GB
  assert.equal(listingCountryToRegion('gb'), 'GB')
  assert.equal(listingCountryToRegion('hk'), 'CN') // Hong Kong trades under CN in the source registry
  assert.equal(listingCountryToRegion('kr'), 'KR')
  assert.equal(listingCountryToRegion('br'), 'OTHER') // a real market, just not first-class → OTHER
  assert.equal(listingCountryToRegion('my'), 'OTHER') // Malaysia → OTHER
  for (const junk of ['', null, undefined, 'usa', 'x', '12']) assert.equal(listingCountryToRegion(junk as any), null, String(junk))
})

// ---- resolveEventRegion: event_region > primary-single-company listing > domain floor ----
await check('resolveEventRegion: explicit event_region wins over both company and domain', () => {
  assert.equal(resolveEventRegion(tri({ event_region: 'OTHER', issuer_linkage: 'primary', companies: [{ name: 'X', ticker: null, listing_country: 'US' }] }), 'CN'), 'OTHER')
})
await check('resolveEventRegion: primary single-company listing_country fills in when event_region is null', () => {
  assert.equal(resolveEventRegion(tri({ event_region: null, issuer_linkage: 'primary', companies: [{ name: 'Apple', ticker: 'AAPL', listing_country: 'US' }] }), 'IN'), 'US')
})
await check('resolveEventRegion: company fallback is skipped unless linkage is primary AND exactly one company', () => {
  // not primary → ignore the company, keep the domain region
  assert.equal(resolveEventRegion(tri({ issuer_linkage: 'sector', companies: [{ name: 'X', ticker: null, listing_country: 'US' }] }), 'IN'), 'IN')
  // two companies → ambiguous, keep the domain region
  assert.equal(resolveEventRegion(tri({ issuer_linkage: 'primary', companies: [{ name: 'A', ticker: null, listing_country: 'US' }, { name: 'B', ticker: null, listing_country: 'JP' }] }), 'IN'), 'IN')
})
await check('resolveEventRegion: no content signal → the domain region (the safe floor, no regression)', () => {
  assert.equal(resolveEventRegion(tri({ event_region: null, issuer_linkage: 'macro', companies: [] }), 'CN'), 'CN')
  assert.equal(resolveEventRegion(undefined, 'CN'), 'CN') // model omitted this index / batch failed
  assert.equal(resolveEventRegion(null, 'GLOBAL'), 'GLOBAL')
})

// ---- coerceTriage carries event_region, hard-coercing model drift to null ----
await check('coerceTriage: a valid event_region is kept (incl. lowercase); a bogus one → null', () => {
  assert.equal(coerceTriage({ relevance: 'material', materiality_pre_score: 70, event_region: 'OTHER' }).event_region, 'OTHER')
  assert.equal(coerceTriage({ relevance: 'material', materiality_pre_score: 70, event_region: 'other' }).event_region, 'OTHER') // lowercased then validated
  assert.equal(coerceTriage({ relevance: 'material', materiality_pre_score: 70, event_region: 'CN' }).event_region, 'CN')
  for (const bad of ['XX', 'Bangladesh', '', 42, null, undefined]) {
    assert.equal(coerceTriage({ relevance: 'material', materiality_pre_score: 70, event_region: bad }).event_region, null, String(bad))
  }
})

// ---- end to end: the reported bug. An SCMP (domain → CN) story ABOUT Bangladesh/Malaysia, whose triage
//      reads event_region OTHER, is stored on the wire as region OTHER with source_region CN (the audit). ----
await check('runIngestCycle: SCMP story about Bangladesh/Malaysia lands region OTHER, keeps source_region CN', async () => {
  const root = tmp()
  const state = tmp()
  const headline = 'Bangladesh urges Malaysia to ease labour hiring curbs amid exploitation concerns'
  const groqBody = {
    usage: { total_tokens: 200 },
    choices: [{ message: { content: JSON.stringify({ items: [
      { i: 0, relevance: 'material', materiality_pre_score: 72, event_types: ['regulatory'], issuer_linkage: 'macro', why: 'A bilateral labour-policy dispute.', companies: [], size_bucket: 'unknown', headline_en: null, event_region: 'OTHER' },
    ] }) } }],
  }
  const fetchFn = (async (url: string) => {
    const u = String(url)
    if (u.includes('groq')) return res(groqBody)
    // GDELT returns a mix of domains per query; SCMP (a CN-domiciled paper) carries a non-China story
    if (u.includes('gdelt')) return res({ articles: [
      { url: 'https://scmp.com/news/asia/x', title: headline, domain: 'scmp.com', seendate: '20260612T090000Z' },
    ] })
    return res({ articles: [] })
  }) as unknown as typeof fetch
  const cfg = { groqApiKey: 'k', gdeltBaseUrl: 'https://gdelt.test/doc', groqBaseUrl: 'https://groq.test', groqRpm: 6000, gdeltLookbackMin: 40, pickThreshold: 60, watchThreshold: 40 } as any
  const now = () => new Date('2026-06-12T09:30:00Z')

  const s = await runIngestCycle({ repoRoot: root, stateDir: state, config: cfg, fetchFn, sleep: noSleep, now })
  assert.equal(s.candidates, 1)

  const fh = fs.readFileSync(path.join(root, 'screener/inbox/2026-06-12_firehose.ndjson'), 'utf8')
  const item = fh.split('\n').map((l) => l.trim()).filter(Boolean).map((l) => JSON.parse(l)).find((o) => o.kind === 'item')
  assert.ok(item, 'a kind:item feed line was written')
  assert.equal(item.domain, 'scmp.com')
  assert.equal(item.source_name, 'South China Morning Post', 'the publisher is still identified')
  assert.equal(item.region, 'OTHER', 'region is the EVENT market (Bangladesh/Malaysia → OTHER), not the publisher (CN)')
  assert.equal(item.source_region, 'CN', 'the publisher region is kept as the override audit trail')
})

// ---- no-regression control: same SCMP domain, but triage gives NO geography signal → region stays CN ----
await check('runIngestCycle: with no event_region and no company, an SCMP story keeps its CN domain region (no source_region)', async () => {
  const root = tmp()
  const state = tmp()
  const groqBody = {
    usage: { total_tokens: 200 },
    choices: [{ message: { content: JSON.stringify({ items: [
      { i: 0, relevance: 'material', materiality_pre_score: 72, event_types: ['product'], issuer_linkage: 'sector', why: 'A China tech-sector note.', companies: [], size_bucket: 'unknown', headline_en: null, event_region: null },
    ] }) } }],
  }
  const fetchFn = (async (url: string) => {
    const u = String(url)
    if (u.includes('groq')) return res(groqBody)
    if (u.includes('gdelt')) return res({ articles: [
      { url: 'https://scmp.com/tech/y', title: 'Shenzhen chip makers ramp output amid local demand', domain: 'scmp.com', seendate: '20260612T090000Z' },
    ] })
    return res({ articles: [] })
  }) as unknown as typeof fetch
  const cfg = { groqApiKey: 'k', gdeltBaseUrl: 'https://gdelt.test/doc', groqBaseUrl: 'https://groq.test', groqRpm: 6000, gdeltLookbackMin: 40, pickThreshold: 60, watchThreshold: 40 } as any
  const now = () => new Date('2026-06-12T09:30:00Z')

  await runIngestCycle({ repoRoot: root, stateDir: state, config: cfg, fetchFn, sleep: noSleep, now })
  const fh = fs.readFileSync(path.join(root, 'screener/inbox/2026-06-12_firehose.ndjson'), 'utf8')
  const item = fh.split('\n').map((l) => l.trim()).filter(Boolean).map((l) => JSON.parse(l)).find((o) => o.kind === 'item')
  assert.ok(item, 'a kind:item feed line was written')
  assert.equal(item.region, 'CN', 'no content signal → the domain region is preserved')
  assert.equal(item.source_region, undefined, 'source_region is omitted when it matches the event region')
})

console.log(`\ngeo.test.ts: ${passed} passed`)
