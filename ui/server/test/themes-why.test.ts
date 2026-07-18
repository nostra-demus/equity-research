// The per-company "why is it here" explainer (news/themes/why.ts): the plain-English reason for a
// company's order-tier placement + the sourced evidence (the member stories that named it). Plus the
// buildThemeDetail wiring that attaches it without mutating the persisted theme. In-memory, no network.
// Run: npx tsx test/themes-why.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import { buildWhyIndex, reasonFor, buildCompanyWhy, type WhyMember, type WhyCompany } from '../src/news/themes/why'
import { buildThemeDetail } from '../src/news/themes/store'
import type { Theme, ThemeCompany, ThemeMember } from '../src/news/themes/types'

let passed = 0
function check(name: string, fn: () => void | Promise<void>): Promise<void> | void {
  const done = () => { passed++; console.log(`  ok  ${name}`) }
  const fail = (e: any) => { console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`); process.exitCode = 1 }
  try {
    const r = fn()
    if (r instanceof Promise) return r.then(done, fail)
    done()
  } catch (e) { fail(e) }
}

const co = (name: string, ticker: string | null = null) => ({ name, ticker, listing_country: null })
const member = (event_id: string, headline: string, companies: any[], score = 50, extra: Partial<WhyMember> = {}): WhyMember =>
  ({ event_id, headline, score, companies, ...extra })
const company = (over: Partial<WhyCompany> = {}): WhyCompany => ({ order: 1, side: 'mixed', mention_count: 1, impact: { directness: 22 }, ...over })

// ---- buildWhyIndex: the evidence join ----
await check('buildWhyIndex: joins a company to the member stories that named it', () => {
  const members = [
    member('e1', 'Shell may be hit by Strait of Hormuz disruption', [co('Shell', 'SHEL')], 80),
    member('e2', 'Micron shipments watch Gulf tensions', [co('Micron', 'MU')], 60),
    member('e3', 'Broad market selloff on Middle East risk', [co('SPX')], 30),
  ]
  const idx = buildWhyIndex(members)
  const shell = idx.get('shell') || []
  assert.equal(shell.length, 1)
  assert.equal(shell[0].event_id, 'e1')
  assert.equal(shell[0].score, 80)
  assert.match(shell[0].headline, /Shell/)
  assert.equal((idx.get('micron') || [])[0]?.event_id, 'e2')
})

await check('buildWhyIndex: sorts by materiality (score desc) and caps at 3', () => {
  const members = [
    member('a', 'Micron story A', [co('Micron', 'MU')], 40),
    member('b', 'Micron story B', [co('Micron', 'MU')], 90),
    member('c', 'Micron story C', [co('Micron', 'MU')], 70),
    member('d', 'Micron story D', [co('Micron', 'MU')], 20),
  ]
  const ev = buildWhyIndex(members).get('micron') || []
  assert.equal(ev.length, 3, 'capped at 3')
  assert.deepEqual(ev.map((e) => e.score), [90, 70, 40], 'sorted by score desc')
})

await check('buildWhyIndex: dedups repeated headlines (a wire burst) per company, keeping the HIGHEST score', () => {
  const members = [
    member('a', 'Micron beats on memory demand', [co('Micron', 'MU')], 60),
    member('b', 'micron  beats on memory demand', [co('Micron', 'MU')], 95), // same story, diff case/space, HIGHER score, LATER
    member('c', 'A different Micron headline', [co('Micron', 'MU')], 50),
  ]
  const ev = buildWhyIndex(members).get('micron') || []
  assert.equal(ev.length, 2, 'the repeated headline collapses to one')
  const beats = ev.find((e) => /beats/.test(e.headline))!
  assert.equal(beats.score, 95, 'keeps the strongest copy’s score, not the first-encountered (older) one')
  assert.equal(beats.event_id, 'b', 'and points at the strongest copy’s event')
})

await check('buildWhyIndex: prefers the English translation when present', () => {
  const members = [member('e', 'Titel auf Deutsch', [co('SAP', 'SAP')], 50, { headline_en: 'German-language headline' })]
  const ev = buildWhyIndex(members).get('sap') || []
  assert.equal(ev[0].headline, 'German-language headline')
})

await check('buildWhyIndex: a headline naming two firms is evidence for BOTH', () => {
  const members = [member('e', 'Micron and SK Hynix face memory glut', [co('Micron', 'MU'), co('SK Hynix', 'SKHY')], 55)]
  const idx = buildWhyIndex(members)
  assert.equal((idx.get('micron') || []).length, 1)
  assert.equal((idx.get('skhynix') || idx.get('sk hynix') || []).length, 1)
})

await check('buildWhyIndex: mirrors companyKeys — non-company names (denied countries/placeholders) are not indexed', () => {
  // 'iran' + 'the company' are both on the entities DENY list, so companyKeys drops them — the join must
  // too, so it never invents evidence for a name that could never be a ThemeCompany (same filter, §3).
  const members = [member('e', 'Iran strikes rattle the Gulf', [co('Iran'), co('the company')], 70)]
  const idx = buildWhyIndex(members)
  assert.equal(idx.size, 0, 'no real company named → nothing indexed')
})

// ---- reasonFor: the plain-English reason ----
await check('reasonFor: first-order reads as head-on, with a raw mention count (not "stories")', () => {
  const r = reasonFor(company({ order: 1, mention_count: 4, impact: { directness: 22 } }))
  assert.match(r, /Direct \(first-order\)/)
  assert.match(r, /named 4 times/)
  assert.match(r, /head-on/)
  // must NOT claim "stories" — mention_count counts items, and the evidence list is deduped to distinct
  // stories, so the two would contradict each other on the card (§3/§21)
  assert.doesNotMatch(r, /stories/)
})

await check("reasonFor: second-order reads as a step removed / indirect", () => {
  const r = reasonFor(company({ order: 2, mention_count: 2, impact: { directness: 14 } }))
  assert.match(r, /Ripple \(second-order\)/)
  assert.match(r, /a step removed/)
  assert.match(r, /indirectly/)
})

await check('reasonFor: third-order reads as a faint sector/bigger-picture link; named once is phrased', () => {
  const r = reasonFor(company({ order: 3, mention_count: 1, impact: { directness: 6 } }))
  assert.match(r, /Read-across \(third-order\)/)
  assert.match(r, /named once/)
  assert.match(r, /faint/)
})

await check('reasonFor: adds a direction clause only when side is confident (never for mixed)', () => {
  assert.match(reasonFor(company({ side: 'beneficiary' })), /likely gainer/)
  assert.match(reasonFor(company({ side: 'harmed' })), /likely to be hurt/)
  const mixed = reasonFor(company({ side: 'mixed' }))
  assert.doesNotMatch(mixed, /gainer|hurt/, 'a mixed read makes no direction claim (§3)')
})

// ---- buildCompanyWhy: reason + evidence together ----
await check('buildCompanyWhy: combines the reason with the indexed evidence', () => {
  const idx = buildWhyIndex([member('e1', 'Shell hit by Hormuz risk', [co('Shell', 'SHEL')], 80)])
  const why = buildCompanyWhy(company({ order: 1 }), 'shell', idx)
  assert.match(why.reason, /Direct \(first-order\)/)
  assert.equal(why.evidence.length, 1)
  assert.equal(why.evidence[0].event_id, 'e1')
})

await check('buildCompanyWhy: no evidence is fine — the reason still stands', () => {
  const why = buildCompanyWhy(company(), 'unknownco', new Map())
  assert.equal(why.evidence.length, 0)
  assert.ok(why.reason.length > 0)
})

// ---- buildThemeDetail wiring: attaches why WITHOUT mutating the theme ----
await check('buildThemeDetail: attaches a why to every company and does not mutate the theme', () => {
  const members: ThemeMember[] = [
    { event_id: 'e1', headline: 'Shell may be hit by Hormuz disruption', found_at: '2026-06-13T10:00:00Z', score: 80, tier: 'news', companies: [co('Shell', 'SHEL')] },
    { event_id: 'e2', headline: 'Micron shipments watch Gulf tensions', found_at: '2026-06-13T09:00:00Z', score: 60, tier: 'news', companies: [co('Micron', 'MU')] },
  ]
  const companies: ThemeCompany[] = [
    { name: 'Shell', ticker: 'SHEL', listing_country: null, name_key: 'shell', order: 1, side: 'mixed', impact: { directness: 22, magnitude: 20, speed: 22, reversibility: 18, composite: 82 }, mention_count: 1, last_seen: 'e1' as any },
    { name: 'Micron', ticker: 'MU', listing_country: null, name_key: 'micron', order: 2, side: 'mixed', impact: { directness: 14, magnitude: 15, speed: 22, reversibility: 16, composite: 67 }, mention_count: 1, last_seen: 'e2' as any },
  ]
  const theme = {
    theme_id: 'THM-test', name: 'Kuwait · iran', slug: 'kuwait-iran', description: 'x', keywords: [], company_keys: [], event_type_affinity: [],
    members, member_count_total: 2, companies, sectors: [],
    scores: { freshness: 90, magnitude: 50, breadth: 100, persistence: 33, composite: 86 } as any,
    tier: 'hot', fresh_flow: 1, flow_series: [1], related_themes: [], status: 'live', merged_into: null,
    first_seen: '2026-06-13T09:00:00Z', last_flow: '2026-06-13T10:00:00Z', generation: 'deterministic', rev: 1,
  } as unknown as Theme

  // a nonexistent repo → readFeed fails inside buildThemeDetail, which falls back to minimal member rows
  const detail = buildThemeDetail('/nonexistent-repo-xyz', theme)
  const shell = detail.companies_by_order.first.find((c) => c.name_key === 'shell')!
  const micron = detail.companies_by_order.second.find((c) => c.name_key === 'micron')!
  assert.ok(shell.why, 'shell has a why')
  assert.match(shell.why!.reason, /Direct \(first-order\)/)
  assert.equal(shell.why!.evidence[0]?.event_id, 'e1')
  assert.match(micron.why!.reason, /Ripple \(second-order\)/)
  assert.equal(micron.why!.evidence[0]?.event_id, 'e2')
  // the persisted theme.companies must stay clean (why is read-time only, never ledgered)
  assert.equal((theme.companies[0] as any).why, undefined, 'the source theme company was not mutated')
})

console.log(`\nthemes-why: ${passed} checks passed`)
