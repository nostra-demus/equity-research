// Story-level de-dup (news/dedup.ts): the wire collapses near-duplicate STORIES into one row but keeps
// genuinely different events about the same company separate. Pure function, no network, no LLM.
// Run: npx tsx test/dedup.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import { assignDedupGroups, DEFAULT_DEDUP_CONFIG, type DedupItemView } from '../src/news/dedup'

let passed = 0
function check(name: string, fn: () => void) {
  try {
    fn()
    passed++
    console.log(`  ok  ${name}`)
  } catch (e: any) {
    console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`)
    process.exitCode = 1
  }
}

const BASE = Date.parse('2026-06-13T12:00:00Z')
const at = (minAgo: number) => new Date(BASE - minAgo * 60_000).toISOString().replace(/\.\d{3}Z$/, 'Z')
const co = (name: string) => ({ name, ticker: null, listing_country: null })

const groupsOf = (items: DedupItemView[]) => assignDedupGroups(items)
const same = (g: Map<string, string>, a: string, b: string) => g.get(a) === g.get(b)

check('reworded same-event, same source → ONE group', () => {
  const items: DedupItemView[] = [
    { event_id: 'A', headline: 'Bank of Canada cuts interest rate by 25 basis points', ts: at(20), companies: [], source_name: 'Bank of Canada' },
    { event_id: 'B', headline: 'Bank of Canada cuts its key interest rate 25 bps', ts: at(10), companies: [], source_name: 'Bank of Canada' },
  ]
  const g = groupsOf(items)
  assert.ok(same(g, 'A', 'B'), 'the two reworded rate items collapse to one story')
  // group id = earliest member's event_id (A is older)
  assert.equal(g.get('A'), 'A')
  assert.equal(g.get('B'), 'A')
})

check('verbatim repost across two sources, no company → ONE group', () => {
  const items: DedupItemView[] = [
    { event_id: 'A', headline: 'Federal Reserve signals two rate cuts in 2026', ts: at(30), companies: [], source_name: 'Reuters' },
    { event_id: 'B', headline: 'Federal Reserve signals two rate cuts in 2026', ts: at(15), companies: [], source_name: 'Yahoo Finance' },
  ]
  const g = groupsOf(items)
  assert.ok(same(g, 'A', 'B'), 'an identical headline from another source is the same story')
})

check('one takeover, three sources → ONE group (3 distinct sources)', () => {
  const items: DedupItemView[] = [
    { event_id: 'R', headline: 'Globex to acquire Acme Corp for $5 billion', ts: at(40), companies: [co('Globex'), co('Acme Corp')], source_name: 'Reuters' },
    { event_id: 'F', headline: 'Globex to acquire Acme Corp in cash deal', ts: at(25), companies: [co('Globex'), co('Acme Corp')], source_name: 'FT' },
    { event_id: 'C', headline: 'Globex to acquire Acme Corp, sources say', ts: at(12), companies: [co('Acme Corp'), co('Globex')], source_name: 'CNBC' },
  ]
  const g = groupsOf(items)
  assert.ok(same(g, 'R', 'F') && same(g, 'F', 'C'), 'all three reports collapse to one takeover story')
  assert.equal(new Set([g.get('R'), g.get('F'), g.get('C')]).size, 1)
})

check('same company, DIFFERENT events → TWO groups (tight: not merged)', () => {
  const items: DedupItemView[] = [
    { event_id: 'E', headline: 'Apple reports record quarterly earnings, beats estimates', ts: at(30), companies: [co('Apple')], source_name: 'Reuters' },
    { event_id: 'L', headline: 'Apple faces antitrust lawsuit over App Store', ts: at(20), companies: [co('Apple')], source_name: 'Bloomberg' },
  ]
  const g = groupsOf(items)
  assert.ok(!same(g, 'E', 'L'), 'earnings and a lawsuit are different stories even though both name Apple')
})

check('shared company alone (low token overlap) does NOT merge', () => {
  const items: DedupItemView[] = [
    { event_id: 'X', headline: 'Tesla opens new gigafactory in Mexico', ts: at(30), companies: [co('Tesla')], source_name: 'Reuters' },
    { event_id: 'Y', headline: 'Tesla recalls 12,000 vehicles over brake software', ts: at(20), companies: [co('Tesla')], source_name: 'Reuters' },
  ]
  const g = groupsOf(items)
  assert.ok(!same(g, 'X', 'Y'), 'same company + same source but unrelated events stay separate')
})

check('outside the time window → NOT merged even if identical', () => {
  const items: DedupItemView[] = [
    { event_id: 'OLD', headline: 'Federal Reserve signals two rate cuts in 2026', ts: at(60 * 80), companies: [], source_name: 'Reuters' }, // 80h ago
    { event_id: 'NEW', headline: 'Federal Reserve signals two rate cuts in 2026', ts: at(10), companies: [], source_name: 'Reuters' },
  ]
  const g = groupsOf(items)
  assert.ok(!same(g, 'OLD', 'NEW'), 'an identical headline 80h apart is a separate (re-occurring) story')
})

check('unrelated items each form their own group', () => {
  const items: DedupItemView[] = [
    { event_id: 'A', headline: 'Reliance Industries posts higher refining margins', ts: at(30), companies: [co('Reliance Industries')], source_name: 'ET' },
    { event_id: 'B', headline: 'Nvidia unveils next-generation data-center GPU', ts: at(20), companies: [co('Nvidia')], source_name: 'The Verge' },
    { event_id: 'C', headline: 'Crude oil slips on demand worries', ts: at(10), companies: [], source_name: 'Reuters' },
  ]
  const g = groupsOf(items)
  assert.equal(new Set([g.get('A'), g.get('B'), g.get('C')]).size, 3, 'three unrelated items → three groups')
})

check('empty input → empty map; single item → itself', () => {
  assert.equal(assignDedupGroups([]).size, 0)
  const g = assignDedupGroups([{ event_id: 'solo', headline: 'A one-off headline', ts: at(5), companies: [], source_name: 'X' }])
  assert.equal(g.get('solo'), 'solo')
})

check('a malformed item never throws (fail-soft)', () => {
  // missing/odd fields must degrade, not crash — assignDedupGroups is wrapped fail-soft
  const items = [
    { event_id: 'A', headline: '', ts: 'not-a-date', companies: null, source_name: null },
    { event_id: 'B', headline: 'Some headline', ts: at(5) },
  ] as unknown as DedupItemView[]
  const g = assignDedupGroups(items)
  assert.ok(g.get('A') === 'A' || g.get('A') === 'B') // grouped somehow, but never threw
  assert.ok(g.has('B'))
})

console.log(`\n${passed} checks passed`)
