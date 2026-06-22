// Headline translation: the deterministic language layer (news/lang.ts), the relaxed ingest floor that
// lets foreign-script headlines through, scope's language-awareness, the triage contract carrying
// headline_en, and the end-to-end cycle persisting an English translation on the wire + inbox. Pure +
// mocked fetch + isolated tmp repo — no key / network / install needed. Run: npx tsx test/lang.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { hasNonLatinScript, pickTranslation, headlineForScan } from '../src/news/lang'
import { cleanText, looksLikeHeadline } from '../src/news/clean'
import { deriveScope } from '../src/news/scope'
import { coerceTriage } from '../src/news/triage/groq'
import { runIngestCycle } from '../src/news/runCycle'

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
const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'lang-'))

// ---- hasNonLatinScript: the genuinely-unreadable scripts trip it; Latin (even accented) does not ----
await check('hasNonLatinScript: CJK / Hangul / Kana / Cyrillic / Arabic / Hebrew / Thai / Devanagari / Greek → true', () => {
  for (const t of [
    'LG에너지솔루션, 글로벌 특허 10만 건 돌파', // Korean (the reported case)
    'ソフトバンク、半導体投資を拡大', // Japanese
    '比亚迪第二季度交付量创纪录', // Chinese
    'Газпром сообщил о росте экспорта', // Russian
    'شركة أرامكو تعلن أرباحاً قياسية', // Arabic
    'בנק ישראל מותיר את הריבית', // Hebrew
    'ธนาคารแห่งประเทศไทยคงอัตราดอกเบี้ย', // Thai
    'रिलायंस का तिमाही मुनाफा बढ़ा', // Hindi/Devanagari
    'Η ΕΚΤ αυξάνει τα επιτόκια', // Greek
  ]) assert.equal(hasNonLatinScript(t), true, t)
})
await check('hasNonLatinScript: English + Latin-script European + accents → false', () => {
  for (const t of ['Apple beats on iPhone sales', "L'Oréal annonce une acquisition", 'Volkswagen senkt Prognose', 'Reliance Q1 net profit up 12%', 'Œuvre café résumé naïve']) {
    assert.equal(hasNonLatinScript(t), false, t)
  }
})

// ---- pickTranslation: only KEEP a real English rendering of a non-Latin original ----
await check('pickTranslation: non-Latin original + real English candidate → kept', () => {
  assert.equal(
    pickTranslation('LG에너지솔루션, 글로벌 특허 10만 건 돌파', 'LG Energy Solution surpasses 100,000 global patents'),
    'LG Energy Solution surpasses 100,000 global patents',
  )
})
await check('pickTranslation: English original → null (we never translate readable headlines)', () => {
  assert.equal(pickTranslation('Apple beats on iPhone sales', 'Apple beats on iPhone sales'), null)
  assert.equal(pickTranslation("L'Oréal annonce une acquisition", 'L Oreal announces an acquisition'), null)
})
await check('pickTranslation: model echo / half-translation / empty → null (falls back to original)', () => {
  assert.equal(pickTranslation('삼성전자 실적 발표', '삼성전자 실적 발표'), null) // echoed, still Korean
  assert.equal(pickTranslation('삼성전자 실적 발표', '삼성 실적 발표중 announcement'), null) // still carries Hangul
  assert.equal(pickTranslation('삼성전자 실적 발표', null), null)
  assert.equal(pickTranslation('삼성전자 실적 발표', '   '), null)
})
await check('pickTranslation: trims + caps the kept translation to 200 chars', () => {
  const long = 'A'.repeat(500)
  const got = pickTranslation('비야디 실적', `  ${long}  `)
  assert.equal(got!.length, 200)
})
await check('headlineForScan: prefers the English translation, else the original', () => {
  assert.equal(headlineForScan({ headline: '비야디 실적', headline_en: 'BYD earnings' }), 'BYD earnings')
  assert.equal(headlineForScan({ headline: 'Acme earnings', headline_en: null }), 'Acme earnings')
})

// ---- the ingest floor must let a PURE foreign-script headline through (it used to drop them) ----
await check('looksLikeHeadline: a pure Hangul / CJK headline (no ASCII) is real prose, not debris', () => {
  assert.equal(looksLikeHeadline('삼성전자 분기 실적 발표했다'), true)
  assert.equal(looksLikeHeadline('ソフトバンクが半導体投資を拡大する'), true)
  // the floor runs on CLEANED text — markup-only debris cleans to '' and is still rejected
  assert.equal(looksLikeHeadline(cleanText('<a href="x"></a>')), false)
  assert.equal(looksLikeHeadline('   '), false)
})

// ---- scope classification reads the English translation, so a foreign commodity story is bucketed ----
await check('deriveScope: a foreign-language oil story is classified via its English translation', () => {
  const withEn = deriveScope({ issuer_linkage: 'macro', companies: [], event_types: [], headline: '국제 유가 급등, 브렌트유 배럴당 90달러 돌파', headline_en: 'Crude oil prices surge, Brent tops $90 a barrel' })
  assert.equal(withEn, 'commodity')
  // without the translation the English-only lexicon can't see "oil/brent" → falls back to linkage (macro)
  const withoutEn = deriveScope({ issuer_linkage: 'macro', companies: [], event_types: [], headline: '국제 유가 급등, 브렌트유 배럴당 90달러 돌파' })
  assert.equal(withoutEn, 'macro')
})

// ---- the triage contract carries headline_en (raw); coercion keeps a string, defaults to null ----
await check('coerceTriage: headline_en kept when a string, null otherwise', () => {
  assert.equal(coerceTriage({ relevance: 'material', materiality_pre_score: 70, headline_en: 'LG Energy Solution tops 100,000 patents' }).headline_en, 'LG Energy Solution tops 100,000 patents')
  assert.equal(coerceTriage({ relevance: 'material', materiality_pre_score: 70 }).headline_en, null)
  assert.equal(coerceTriage({ relevance: 'material', materiality_pre_score: 70, headline_en: 42 as any }).headline_en, null)
})

// ---- end to end: a Korean wire headline lands on the firehose + inbox WITH its English translation ----
await check('runIngestCycle: a non-English headline is stored translated on the feed line + inbox row', async () => {
  const root = tmp()
  const state = tmp()
  const korean = 'LG에너지솔루션, 글로벌 특허 10만 건 돌파'
  const english = 'LG Energy Solution surpasses 100,000 global patents'
  const groqBody = {
    usage: { total_tokens: 200 },
    choices: [{ message: { content: JSON.stringify({ items: [
      { i: 0, relevance: 'material', materiality_pre_score: 80, event_types: ['product'], issuer_linkage: 'primary', why: 'A patent-portfolio milestone.', companies: [{ name: 'LG Energy Solution', ticker: null, listing_country: 'KR' }], size_bucket: 'large', headline_en: english },
    ] }) } }],
  }
  const fetchFn = (async (url: string) => {
    const u = String(url)
    if (u.includes('groq')) return res(groqBody)
    if (u.includes('reuters.com')) return res({ articles: [
      { url: 'https://reuters.com/lg', title: korean, domain: 'reuters.com', seendate: '20260612T090000Z', language: 'Korean' },
    ] })
    return res({ articles: [] })
  }) as unknown as typeof fetch
  const cfg = { groqApiKey: 'k', gdeltBaseUrl: 'https://gdelt.test/doc', groqBaseUrl: 'https://groq.test', groqRpm: 6000, gdeltLookbackMin: 40, pickThreshold: 60, watchThreshold: 40 } as any
  const now = () => new Date('2026-06-12T09:30:00Z')

  const s = await runIngestCycle({ repoRoot: root, stateDir: state, config: cfg, fetchFn, sleep: noSleep, now })
  assert.equal(s.candidates, 1)
  assert.equal(s.picked, 1)

  // firehose feed line keeps the ORIGINAL headline (identity) AND carries the English translation
  const fh = fs.readFileSync(path.join(root, 'screener/inbox/2026-06-12_firehose.ndjson'), 'utf8')
  const itemLine = fh.split('\n').map((l) => l.trim()).filter(Boolean).map((l) => JSON.parse(l)).find((o) => o.kind === 'item')
  assert.ok(itemLine, 'a kind:item feed line was written')
  assert.equal(itemLine.headline, korean, 'the original headline is preserved on the wire')
  assert.equal(itemLine.headline_en, english, 'the English translation is stamped on the wire')

  // inbox row carries it too
  const doc = JSON.parse(fs.readFileSync(path.join(root, 'screener/inbox/2026-06-12_sweep.json'), 'utf8'))
  assert.equal(doc.rows[0].headline, korean)
  assert.equal(doc.rows[0].headline_en, english)
})

// ---- an English headline never gets a needless translation field set ----
await check('runIngestCycle: an English headline stores headline_en = null (no needless echo)', async () => {
  const root = tmp()
  const state = tmp()
  const groqBody = {
    usage: { total_tokens: 200 },
    choices: [{ message: { content: JSON.stringify({ items: [
      // even if the model echoes the headline into headline_en, pickTranslation drops it for a Latin original
      { i: 0, relevance: 'material', materiality_pre_score: 80, event_types: ['product'], issuer_linkage: 'primary', why: 'x', headline_en: 'Apple unveils a new chip' },
    ] }) } }],
  }
  const fetchFn = (async (url: string) => {
    const u = String(url)
    if (u.includes('groq')) return res(groqBody)
    if (u.includes('reuters.com')) return res({ articles: [
      { url: 'https://reuters.com/a', title: 'Apple unveils a new chip', domain: 'reuters.com', seendate: '20260612T090000Z' },
    ] })
    return res({ articles: [] })
  }) as unknown as typeof fetch
  const cfg = { groqApiKey: 'k', gdeltBaseUrl: 'https://gdelt.test/doc', groqBaseUrl: 'https://groq.test', groqRpm: 6000, gdeltLookbackMin: 40, pickThreshold: 60, watchThreshold: 40 } as any
  const now = () => new Date('2026-06-12T09:30:00Z')
  await runIngestCycle({ repoRoot: root, stateDir: state, config: cfg, fetchFn, sleep: noSleep, now })
  const fh = fs.readFileSync(path.join(root, 'screener/inbox/2026-06-12_firehose.ndjson'), 'utf8')
  const itemLine = fh.split('\n').map((l) => l.trim()).filter(Boolean).map((l) => JSON.parse(l)).find((o) => o.kind === 'item')
  assert.equal(itemLine.headline_en, null, 'an English headline carries no translation')
})

console.log(`\n${passed} checks passed`)
