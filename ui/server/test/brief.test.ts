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
import { buildThemeBrief, deterministicBrief, representativeMembers, type BriefConfig } from '../src/news/themes/brief'
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
      member('e1', 'Eli Lilly obesity pill hits primary endpoint in phase 3 trial', { score: 92, found_at: hoursAgo(3) }),
      member('e2', 'Novo Nordisk raises Wegovy output as demand outstrips supply', { score: 81, found_at: hoursAgo(8) }),
      member('e3', 'FDA clears new GLP-1 label for cardiovascular risk reduction', { score: 75, found_at: hoursAgo(1) }),
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
  assert.ok(b.includes('obesity pill'), 'anchors on the top-scored headline')
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

// ---- a changed TOP-SCORED headline busts the signature; steady low-score flow does not ----
await check('buildThemeBrief: a new top-scored headline changes the signature → fresh brief', async () => {
  const dir = tmpState()
  const cfg: BriefConfig = { themeBriefModel: 'off' }
  const a = await buildThemeBrief(theme(), cfg, dir, throwingFetch)
  const moved = theme({ members: [member('e9', 'Pfizer abandons its oral GLP-1 after liver-safety signal', { score: 95, found_at: hoursAgo(0) }), ...theme().members] })
  const b = await buildThemeBrief(moved, cfg, dir, throwingFetch)
  assert.notEqual(b.brief, a.brief, 'a substantive (top-scored) change re-synthesises')
  assert.ok(b.brief.includes('Pfizer'), 'reflects the new lead story')
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
  const out = await buildThemeBrief(theme(), GROQ_CFG, dir, fakeFetch('', false, 429))
  assert.equal(out.generation, 'deterministic')
  assert.ok(out.note && /model/.test(out.note), 'explains the degrade')
})

// ---- a too-short model reply is rejected (no empty/garbage briefs) ----
await check('buildThemeBrief: a too-short model reply falls back to deterministic', async () => {
  const dir = tmpState()
  const out = await buildThemeBrief(theme(), GROQ_CFG, dir, fakeFetch(JSON.stringify({ brief: 'too short' })))
  assert.equal(out.generation, 'deterministic')
})

console.log(`\nbrief.test: ${passed} checks passed`)
