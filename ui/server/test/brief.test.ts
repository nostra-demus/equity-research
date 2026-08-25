// On-demand theme BRIEF (news/themes/brief.ts): the few-sentence plain-English explainer shown when a
// human opens a theme. Tests the deterministic fallback, representative-member selection, the on-disk
// cache (content-signature keyed, served without recompute), the Groq path via a stubbed fetch (on the
// shared budget+limiter), the force-regen cooldown, the never-throws contract on malformed data, and the
// graceful degradation to deterministic when the model fails. No real network. Run: npx tsx test/brief.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { buildThemeBrief, deterministicBrief, representativeMembers, themeBriefTokenBound, type BriefConfig } from '../src/news/themes/brief'
import { Budget, readCooldownUntil, resetBudgetMemory, resetCooldownMemory, resetSharedLimiters } from '../src/news/triage/budget'
import type { Theme, ThemeCompany, ThemeMember } from '../src/news/themes/types'

let passed = 0
async function check(name: string, fn: () => void | Promise<void>): Promise<void> {
  try {
    await fn()
    passed++
    console.log(`  ok  ${name}`)
  } catch (e: any) {
    console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`)
    process.exitCode = 1
  }
}

const NOW = new Date('2026-06-28T12:00:00Z')
const hoursAgo = (h: number) => new Date(NOW.getTime() - h * 3_600_000).toISOString().replace(/\.\d{3}Z$/, 'Z')

function member(id: string, headline: string, opts: Partial<ThemeMember> = {}): ThemeMember {
  return { event_id: id, headline, found_at: opts.found_at || hoursAgo(0), score: opts.score ?? 70, tier: opts.tier || 'news', headline_en: opts.headline_en, companies: opts.companies, event_types: opts.event_types }
}
function company(name: string, order: 1 | 2 | 3 = 1): ThemeCompany {
  return { name, ticker: null, listing_country: null, name_key: name.toLowerCase().replace(/[^a-z0-9]/g, ''), order, side: 'beneficiary', impact: { directness: 20, magnitude: 20, speed: 20, reversibility: 20, composite: 80 }, mention_count: 3, last_seen: hoursAgo(0) }
}
function theme(over: Partial<Theme> = {}): Theme {
  return {
    theme_id: 'THM-abcd1234',
    name: 'GLP-1 weight-loss drugs',
    slug: 'glp-1-weight-loss-drugs',
    description: 'Recurring news around GLP-1 weight-loss drugs.',
    keywords: ['glp-1', 'obesity', 'weight-loss'],
    company_keys: ['novonordisk', 'ellililly'],
    event_type_affinity: ['clinical_trial', 'regulatory'],
    members: [
      member('e1', 'Eli Lilly GLP-1 obesity weight loss pill hits primary endpoint in phase 3 trial', { score: 92, found_at: hoursAgo(3) }),
      member('e2', 'Novo Nordisk raises GLP-1 obesity weight loss drug output as demand outstrips supply', { score: 81, found_at: hoursAgo(8) }),
      member('e3', 'FDA clears new GLP-1 obesity weight loss drug label for cardiovascular risk reduction', { score: 75, found_at: hoursAgo(1) }),
    ],
    member_count_total: 14,
    companies: [company('Eli Lilly', 1), company('Novo Nordisk', 1), company('Hims & Hers', 2)],
    sectors: [],
    scores: { freshness: 80, magnitude: 70, breadth: 60, persistence: 65, composite: 78 },
    tier: 'hot',
    fresh_flow: 4,
    flow_series: [1, 2, 0, 3],
    related_themes: [],
    status: 'live',
    merged_into: null,
    first_seen: hoursAgo(96),
    last_flow: hoursAgo(1),
    generation: 'groq',
    rev: 3,
    ...over,
  }
}

// a config whose shared Groq budget+limiter is wide open, so the limiter's request-spacing never blocks a
// test (the limiter is a process-wide singleton created on its first use; permissive caps keep it free)
const GROQ_CFG: BriefConfig = { themeBriefModel: 'groq', groqApiKey: 'k', groqBaseUrl: 'https://groq.test/v1', groqModel: 'm', groqRpm: 1e6, groqTpm: 1e9, groqDailyReqCap: 1e9, groqDailyTokenCap: 1e9 }

// a Response-shaped stub for the Groq POST the brief module makes
function fakeFetch(content: string, ok = true, status = 200): typeof fetch {
  return (async () => ({ ok, status, json: async () => ({ choices: [{ message: { content } }] }) })) as unknown as typeof fetch
}
// succeeds on the first call, throws thereafter — lets us prove the cache/cooldown avoided a 2nd network hit
function onceThenThrow(content: string): typeof fetch {
  let n = 0
  return (async () => {
    if (n++ > 0) throw new Error('second call should not happen')
    return { ok: true, status: 200, json: async () => ({ choices: [{ message: { content } }] }) }
  }) as unknown as typeof fetch
}
const throwingFetch: typeof fetch = (async () => { throw new Error('network down') }) as unknown as typeof fetch
const tmpState = () => fs.mkdtempSync(path.join(os.tmpdir(), 'brief-'))

// ---- deterministic fallback ----
await check('deterministicBrief: multi-sentence, names the lead company, quotes the top headline, quantifies momentum', () => {
  const b = deterministicBrief(theme())
  assert.ok(b.length > 60, 'should be a real paragraph')
  assert.ok((b.match(/\./g) || []).length >= 2, 'at least two sentences')
  assert.ok(b.includes('Eli Lilly'), 'names a lead company')
  assert.ok(b.includes('obesity weight loss pill'), 'anchors on the top-scored headline')
  assert.ok(/flow is picking up \(\+4 new recently\)/.test(b), 'momentum carries the fresh-flow number, not a bare adjective')
})

await check('deterministicBrief: degrades cleanly (no throw) with undefined members and companies', () => {
  const t = theme({ companies: undefined as any, members: undefined as any, member_count_total: 0 })
  const b = deterministicBrief(t)
  assert.ok(b.length > 0 && !/undefined|NaN/.test(b), 'no leaked placeholders, no throw')
})

// ---- representative members ----
await check('representativeMembers: dedups, prefers headline_en, bounds the set', () => {
  const many = Array.from({ length: 20 }, (_, i) => member(`m${i}`, `headline ${i}`, { score: i }))
  many.push(member('mx', '株式分割', { headline_en: 'Stock split announced', score: 99 }))
  const rep = representativeMembers(theme({ members: many }), 12)
  assert.ok(rep.length <= 12, 'bounded')
  assert.equal(new Set(rep.map((m) => m.event_id)).size, rep.length, 'no duplicate ids')
  assert.ok(rep.some((m) => m.event_id === 'mx'), 'the top-scored item is represented')
})

// regression: a member kept ONLY as a translated headline_en (raw `headline` empty) must still represent
// the theme. Earlier the dedup loop skipped on `!m.headline` and dropped it, while signatureHeadlines
// (which uses headlineOf) still counted it — an inconsistency. Fix: skip on headlineOf(m), which prefers
// headline_en. (A foreign-language member older than the feed window is kept only as headline_en.)
await check('representativeMembers: keeps a member that has only a translated headline_en (empty raw headline)', () => {
  const ms = [member('t1', '', { headline_en: 'Translated-only headline', score: 88 }), member('t2', 'Plain English headline', { score: 40 })]
  assert.ok(representativeMembers(theme({ members: ms }), 12).some((m) => m.event_id === 't1'), 'translated-only member is represented, not dropped on an empty raw headline')
  assert.ok(/Translated-only headline/.test(deterministicBrief(theme({ members: ms }))), 'its translated headline surfaces in the deterministic brief')
})

// ---- never-throws contract on malformed data ----
await check('buildThemeBrief: never throws on a malformed theme (undefined members)', async () => {
  const dir = tmpState()
  const out = await buildThemeBrief(theme({ members: undefined as any, member_count_total: 0 }), { themeBriefModel: 'off' }, dir, throwingFetch)
  assert.equal(out.generation, 'deterministic')
  assert.ok(out.brief.length > 0)
})

await check('buildThemeBrief: never throws on a member with a missing headline (signature path)', async () => {
  const dir = tmpState()
  // a member whose headline/headline_en are both empty would throw in headlineOf if unguarded — and
  // signatureHeadlines maps it over EVERY member, ahead of any try/catch
  const bad = [{ event_id: 'b1', headline: undefined as any, found_at: hoursAgo(0), score: 99, tier: 'news' } as ThemeMember, member('b2', 'A real headline here', { score: 50 })]
  const out = await buildThemeBrief(theme({ members: bad }), { themeBriefModel: 'off' }, dir, throwingFetch)
  assert.equal(out.generation, 'deterministic')
  assert.ok(out.brief.length > 0)
})

// regression: a NON-STRING headline (out-of-contract data) is truthy, so it slipped past the old `|| ''`
// guard and threw in .trim() — inside briefSig, BEFORE buildThemeBrief's own try/catch — breaking the
// never-throws contract. headlineOf must coerce both fields via String() first.
await check('buildThemeBrief: never throws on a member with a NON-STRING headline (out-of-contract data)', async () => {
  const dir = tmpState()
  const bad = [{ event_id: 'n1', headline: 12345 as any, found_at: hoursAgo(0), score: 99, tier: 'news' } as ThemeMember, member('n2', 'A real headline', { score: 50 })]
  const out = await buildThemeBrief(theme({ members: bad }), { themeBriefModel: 'off' }, dir, throwingFetch)
  assert.equal(out.generation, 'deterministic')
  assert.ok(out.brief.length > 0)
})

// ---- model off → deterministic, cached + served without recompute ----
await check('buildThemeBrief: model "off" returns deterministic, then serves the SAME from cache', async () => {
  const dir = tmpState()
  const cfg: BriefConfig = { themeBriefModel: 'off' }
  const first = await buildThemeBrief(theme(), cfg, dir, throwingFetch)
  assert.equal(first.generation, 'deterministic')
  assert.ok(first.brief.includes('Eli Lilly'))
  assert.ok(fs.existsSync(path.join(dir, 'themes-brief-cache.json')), 'cache file written')
  const second = await buildThemeBrief(theme(), cfg, dir, throwingFetch)
  assert.equal(second.brief, first.brief, 'served from cache verbatim')
  assert.equal(second.generated_at, first.generated_at, 'not regenerated')
})

await check('buildThemeBrief rejects a missing endpoint or model before provider accounting', async () => {
  for (const missing of ['base', 'model'] as const) {
    resetBudgetMemory(); resetCooldownMemory(); resetSharedLimiters()
    const dir = tmpState()
    let calls = 0
    const cfg: BriefConfig = {
      ...GROQ_CFG,
      ...(missing === 'base' ? { groqBaseUrl: undefined } : { groqModel: undefined }),
    }
    const out = await buildThemeBrief(
      theme({ theme_id: `THM-missing-${missing}` }), cfg, dir,
      (async () => { calls++; throw new Error('must not fetch') }) as typeof fetch,
    )
    assert.equal(out.generation, 'deterministic')
    assert.equal(calls, 0)
    assert.equal(fs.existsSync(path.join(dir, 'groq-budget.json')), false)
  }
})

// ---- a changed TOP-SCORED headline busts the signature; steady low-score flow does not ----
await check('buildThemeBrief: a new top-scored headline changes the signature → fresh brief', async () => {
  const dir = tmpState()
  const cfg: BriefConfig = { themeBriefModel: 'off' }
  const a = await buildThemeBrief(theme(), cfg, dir, throwingFetch)
  const moved = theme({ members: [member('e9', 'Pfizer abandons its oral GLP-1 obesity weight loss pill after liver-safety signal', { score: 95, found_at: hoursAgo(0) }), ...theme().members] })
  const b = await buildThemeBrief(moved, cfg, dir, throwingFetch)
  assert.notEqual(b.brief, a.brief, 'a substantive (top-scored) change re-synthesises')
  assert.ok(b.brief.includes('Pfizer'), 'reflects the new lead story')
})

await check('validated narratives project one canonical dossier without a second headline-model synthesis', async () => {
  const dir = tmpState()
  const input = theme()
  input.narrative = {
    version: 1,
    thesis: 'GLP-1 obesity supply is expanding as manufacturers add weight-loss drug capacity.',
    why_now: 'Novo Nordisk raised output after demand exceeded supply.',
    why_now_event_id: 'e2',
    mechanism_steps: ['Manufacturers add capacity.', 'More supply changes available treatment volumes and producer revenue.'],
    horizon: 'months',
    falsifier: 'The thesis fails if disclosed output falls or demand no longer exceeds supply.',
    anchor_terms: ['obesity', 'weight'],
    evidence: [{ event_id: 'e1', stance: 'supports' }, { event_id: 'e2', stance: 'supports' }],
    expressions: [],
    validated_at: NOW.toISOString(),
  }
  let fetches = 0
  const shouldNotFetch = (async () => { fetches++; throw new Error('canonical narrative must not be resynthesised') }) as unknown as typeof fetch
  const first = await buildThemeBrief(input, GROQ_CFG, dir, shouldNotFetch)
  assert.equal(fetches, 0)
  assert.equal(first.generation, 'deterministic')
  assert.match(first.brief, /GLP-1 obesity supply is expanding/)
  assert.match(first.brief, /What changed: Novo Nordisk raised output/)
  assert.match(first.brief, /What would break it:/)

  input.narrative = { ...input.narrative, why_now: 'The FDA widened the obesity-drug label.', why_now_event_id: 'e3' }
  const revised = await buildThemeBrief(input, GROQ_CFG, dir, shouldNotFetch)
  assert.notEqual(revised.brief, first.brief, 'a narrative revision changes the canonical cached projection')
  assert.equal(fetches, 0)
})

// ---- Groq path via a stubbed fetch (on the shared budget + limiter) ----
await check('buildThemeBrief: a successful model read returns generation "groq"', async () => {
  const dir = tmpState()
  const modelText = JSON.stringify({ brief: 'Two drugmakers are racing to expand obesity treatment as trials read out and the FDA widens the label. Eli Lilly and Novo Nordisk lead; supply is the live constraint. The next phase-3 readout is the thing to watch.' })
  const out = await buildThemeBrief(theme(), GROQ_CFG, dir, fakeFetch(modelText))
  assert.equal(out.generation, 'groq')
  assert.ok(out.brief.startsWith('Two drugmakers'))
  assert.equal(out.note, undefined, 'a real model read carries no degraded note')
})

await check('buildThemeBrief keeps its safe bound for negative, zero, or malformed token telemetry', async () => {
  for (const { label, totalTokens } of [
    { label: 'negative', totalTokens: -17 },
    { label: 'zero', totalTokens: 0 },
    { label: 'non-finite', totalTokens: Number.POSITIVE_INFINITY },
    { label: 'malformed', totalTokens: '17' },
  ]) {
    resetBudgetMemory(); resetCooldownMemory(); resetSharedLimiters()
    const dir = tmpState()
    try {
      const input = theme({ theme_id: `THM-invalid-usage-${label}` })
      const bound = themeBriefTokenBound(input)
      const modelText = JSON.stringify({
        brief: `This model brief is long enough to prove the ${label} telemetry case completed as one real provider request.`,
      })
      let calls = 0
      const fetchFn = (async () => {
        calls++
        return {
          ok: true, status: 200,
          json: async () => ({
            choices: [{ message: { content: modelText } }], usage: { total_tokens: totalTokens },
          }),
        }
      }) as unknown as typeof fetch

      const out = await buildThemeBrief(input, GROQ_CFG, dir, fetchFn)
      const ledger = JSON.parse(fs.readFileSync(path.join(dir, 'groq-budget.json'), 'utf8'))
      assert.equal(calls, 1, `${label}: exactly one provider request was sent`)
      assert.equal(out.generation, 'groq')
      assert.equal(ledger.requests, 1)
      assert.equal(ledger.tokens, bound, `${label}: unusable telemetry cannot refund the conservative reservation`)
      assert.equal(Object.keys(ledger.reservations || {}).length, 0, `${label}: the completed safe charge is finalized`)
    } finally {
      fs.rmSync(dir, { recursive: true, force: true })
    }
  }
  resetBudgetMemory(); resetCooldownMemory(); resetSharedLimiters()
})

await check('buildThemeBrief reserves the full prompt/output bound near the shared token cap', async () => {
  resetBudgetMemory()
  resetSharedLimiters()
  const dir = tmpState()
  const input = theme({ theme_id: 'THM-nearcap' })
  const bound = themeBriefTokenBound(input)
  const oldEstimate = 1_200
  const actualTokens = oldEstimate + 150
  const tokenCap = 100 + bound
  const seed = Budget.load(dir, 10, tokenCap, Date.now(), 'groq-budget.json')
  seed.record(0, 100)
  seed.save()
  const cfg = { ...GROQ_CFG, groqDailyReqCap: 10, groqDailyTokenCap: tokenCap, groqRpm: 0, groqTpm: 0 }
  const text = JSON.stringify({ brief: 'A sufficiently long model brief proves that one authorized near-cap request completed successfully.' })
  let fetches = 0
  const fetchFn = (async () => {
    fetches++
    await new Promise<void>((resolve) => setTimeout(resolve, 20))
    return { ok: true, status: 200, json: async () => ({ choices: [{ message: { content: text } }], usage: { total_tokens: actualTokens } }) }
  }) as unknown as typeof fetch
  const results = await Promise.all([
    buildThemeBrief(input, cfg, dir, fetchFn, { force: true }),
    buildThemeBrief(input, cfg, dir, fetchFn, { force: true }),
  ])
  assert.equal(fetches, 1, 'the competing brief cannot borrow token room reserved by the first')
  assert.equal(results.filter((row) => row.generation === 'groq').length, 1)
  const saved = JSON.parse(fs.readFileSync(path.join(dir, 'groq-budget.json'), 'utf8'))
  assert.equal(saved.tokens, 100 + actualTokens)
  assert.ok(actualTokens > oldEstimate)
  assert.ok(saved.tokens <= tokenCap)
})

// ---- forced regen within the cooldown serves the cache (no second network hit) ----
await check('buildThemeBrief: force=1 within the cooldown serves the cached brief (no re-fetch)', async () => {
  const dir = tmpState()
  const modelText = JSON.stringify({ brief: 'A fresh model brief about the theme that is comfortably over the forty character floor for acceptance.' })
  const first = await buildThemeBrief(theme(), GROQ_CFG, dir, onceThenThrow(modelText))
  assert.equal(first.generation, 'groq')
  // a second fetch would THROW (onceThenThrow); if the cooldown holds, no fetch happens and we serve cache
  const forced = await buildThemeBrief(theme(), GROQ_CFG, dir, onceThenThrow(modelText), { force: true })
  assert.equal(forced.generation, 'groq')
  assert.equal(forced.brief, first.brief, 'cached brief served, model not re-hit')
})

// ---- model failure degrades to deterministic with a note ----
await check('buildThemeBrief: model HTTP error degrades to deterministic + a note', async () => {
  const dir = tmpState()
  const cfg = { ...GROQ_CFG, groqDailyReqCap: 10, groqDailyTokenCap: 10_000, llmCooldownMs: 60_000, llmCooldownMaxMs: 60_000 }
  let calls = 0
  const limited = (async () => { calls++; return new Response('{}', { status: 429 }) }) as typeof fetch
  const out = await buildThemeBrief(theme(), cfg, dir, limited)
  assert.equal(out.generation, 'deterministic')
  assert.ok(out.note && /model/.test(out.note), 'explains the degrade')
  const budget = JSON.parse(fs.readFileSync(path.join(dir, 'groq-budget.json'), 'utf8'))
  assert.equal(budget.requests, 1, 'a 429 counts one request but never exhausts the shared 10-request day')
  assert.equal(budget.tokens, themeBriefTokenBound(theme()), 'missing 429 usage is charged at the strict per-attempt bound')
  await buildThemeBrief(theme({ theme_id: 'THM-cooldown2', name: 'Second theme' }), cfg, dir, limited)
  assert.equal(calls, 1, 'the next brief respects the shared Groq cooldown instead of probing again')
})

await check('buildThemeBrief quarantines a retired model with zero repeat calls and reopens on model change', async () => {
  resetBudgetMemory(); resetCooldownMemory(); resetSharedLimiters()
  const dir = tmpState()
  let calls = 0
  const retired = (async () => {
    calls++
    return new Response(JSON.stringify({ error: { code: 'model_not_found', message: 'configured model is retired' } }), { status: 404 })
  }) as typeof fetch
  const first = await buildThemeBrief(theme({ theme_id: 'THM-retired-1' }), GROQ_CFG, dir, retired)
  assert.equal(first.generation, 'deterministic')
  assert.equal(readCooldownUntil(dir, 'groq'), 0)
  assert.equal(readCooldownUntil(dir, 'theme-brief:groq'), 0)
  assert.equal(fs.existsSync(path.join(dir, 'provider-groq-quarantine.json')), true)

  await buildThemeBrief(theme({ theme_id: 'THM-retired-2', name: 'Second retired theme' }), GROQ_CFG, dir, retired)
  assert.equal(calls, 1, 'the matching retired model is rejected before budget, limiter, or fetch')

  const repaired = await buildThemeBrief(
    theme({ theme_id: 'THM-repaired-model', name: 'Repaired theme' }),
    { ...GROQ_CFG, groqModel: 'replacement-model' }, dir,
    fakeFetch(JSON.stringify({ brief: 'The replacement model produced a complete theme brief that safely clears the acceptance length.' })),
  )
  assert.equal(repaired.generation, 'groq', 'changing the model changes the fingerprint and reopens the route')
})

await check('buildThemeBrief: request errors use an exact workload-only Retry-After and are not re-probed', async () => {
  resetBudgetMemory(); resetCooldownMemory(); resetSharedLimiters()
  const dir = tmpState()
  const cfg = { ...GROQ_CFG, llmCooldownMs: 60_000, llmCooldownMaxMs: 60_000 }
  let calls = 0
  const started = Date.now()
  const requestError = (async () => {
    calls++
    return new Response(JSON.stringify({ secret: 'must-not-surface' }), { status: 400, headers: { 'retry-after': '7' } })
  }) as typeof fetch
  await buildThemeBrief(theme({ theme_id: 'THM-brief-request' }), cfg, dir, requestError)
  const scopedUntil = readCooldownUntil(dir, 'theme-brief:groq')
  assert.ok(scopedUntil >= started + 7_000 && scopedUntil <= Date.now() + 7_100, 'the workload hold follows the provider clock without exponential widening')
  assert.equal(readCooldownUntil(dir, 'groq'), 0, 'a reachable request-shape failure does not sideline Groq for other work')
  await buildThemeBrief(theme({ theme_id: 'THM-brief-request-2', name: 'A different theme' }), cfg, dir, requestError)
  assert.equal(calls, 1, 'the scoped marker prevents another brief probe while it is live')
})

await check('buildThemeBrief: a 503 Retry-After is exact and shared across Groq workloads', async () => {
  resetBudgetMemory(); resetCooldownMemory(); resetSharedLimiters()
  const dir = tmpState()
  let calls = 0
  const started = Date.now()
  const outage = (async () => {
    calls++
    return new Response(JSON.stringify({ secret: 'must-not-surface' }), { status: 503, headers: { 'retry-after': '9' } })
  }) as typeof fetch
  await buildThemeBrief(theme({ theme_id: 'THM-brief-outage' }), GROQ_CFG, dir, outage)
  const sharedUntil = readCooldownUntil(dir, 'groq')
  assert.ok(sharedUntil >= started + 9_000 && sharedUntil <= Date.now() + 9_100, 'the shared outage hold follows Retry-After exactly')
  assert.equal(readCooldownUntil(dir, 'theme-brief:groq'), 0)
  await buildThemeBrief(theme({ theme_id: 'THM-brief-outage-2', name: 'Another outage theme' }), GROQ_CFG, dir, outage)
  assert.equal(calls, 1, 'the shared outage is not repeatedly probed')
})

await check('buildThemeBrief: malformed provider JSON is isolated to the brief workload', async () => {
  resetBudgetMemory(); resetCooldownMemory(); resetSharedLimiters()
  const dir = tmpState()
  let calls = 0
  const malformed = (async () => {
    calls++
    return { ok: true, status: 200, headers: new Headers(), json: async () => { throw new SyntaxError('sensitive raw body') } }
  }) as unknown as typeof fetch
  await buildThemeBrief(theme({ theme_id: 'THM-brief-malformed' }), { ...GROQ_CFG, llmCooldownMs: 20_000, llmCooldownMaxMs: 20_000 }, dir, malformed)
  assert.equal(readCooldownUntil(dir, 'groq'), 0)
  assert.ok(readCooldownUntil(dir, 'theme-brief:groq') > Date.now())
  await buildThemeBrief(theme({ theme_id: 'THM-brief-malformed-2', name: 'Malformed second theme' }), GROQ_CFG, dir, malformed)
  assert.equal(calls, 1)
})

// ---- a too-short model reply is rejected (no empty/garbage briefs) ----
await check('buildThemeBrief: a too-short model reply falls back to deterministic', async () => {
  resetBudgetMemory(); resetCooldownMemory(); resetSharedLimiters()
  const dir = tmpState()
  const out = await buildThemeBrief(theme(), GROQ_CFG, dir, fakeFetch(JSON.stringify({ brief: 'too short' })))
  assert.equal(out.generation, 'deterministic')
  assert.ok(readCooldownUntil(dir, 'theme-brief:groq') > Date.now(), 'a short contract is held only on the brief workload')
  assert.equal(readCooldownUntil(dir, 'groq'), 0)
})

console.log(`\nbrief.test: ${passed} checks passed`)
