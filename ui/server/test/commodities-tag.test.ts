// Per-commodity tagging (news/commodities.ts) — the canonical-subject layer under scope 'commodity'.
// Covers the §26 sync guard (COMMODITY_ALIASES ↔ the live profile `## <NAME>` headings, BIDIRECTIONAL —
// a 13th commodity fails here until the alias table grows), the tagger's precision rules (word
// boundaries, no bare 'oil', first-occurrence order, the 4-tag cap, headline_en preference), and the
// feed.ts hydrate() derive-on-read that classifies the OLD firehose backlog with no backfill.
// Isolated tmp repo for the hydrate check, no network. Run: npx tsx test/commodities-tag.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { REPO_ROOT } from '../src/config'
import { listSwarms } from '../src/swarms'
import {
  COMMODITY_ALIASES,
  canonicalCommodities,
  commoditiesOf,
  deriveCommodities,
  deriveCommodity,
  _resetCommoditiesForTest,
} from '../src/news/commodities'
import { readFeed } from '../src/news/feed'
import type { FeedItem } from '../src/news/types'

let passed = 0
function check(name: string, fn: () => void) {
  try { fn(); passed++; console.log(`  ok  ${name}`) }
  catch (e: any) { console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`); process.exitCode = 1 }
}

const tmpdirs: string[] = []
const tmp = () => { const d = fs.mkdtempSync(path.join(os.tmpdir(), 'commtag-')); tmpdirs.push(d); return d }

// ---- 1. the §26 sync guard: alias table ↔ live profile headings, BIDIRECTIONAL ----
// The headings come from the manifest of whichever swarm declares wire.subject_field: 'commodity'
// (the same resolution commodities.ts itself uses — no swarm id or file path hardcoded here), so a
// moved profiles file follows its manifest. Same heading shape as commodities.ts / roster.ts.
const HEADING_RE = /^##\s+([A-Z0-9][A-Z0-9.\-]{0,14})\s*$/gm

check('every profile `## <NAME>` heading has a COMMODITY_ALIASES entry (a new commodity fails until the table grows)', () => {
  const swarm = listSwarms(true).find((s) => s.wire?.subjectField === 'commodity' && s.subjectsSource)
  assert.ok(swarm, 'no swarm manifest declares wire.subject_field: commodity + subjects_source')
  const txt = fs.readFileSync(path.join(REPO_ROOT, swarm!.subjectsSource!), 'utf8')
  const headings = [...txt.matchAll(HEADING_RE)].map((m) => m[1])
  assert.ok(headings.length >= 12, `expected at least the 12 founding subjects, got ${headings.length}`)
  for (const h of headings) {
    assert.ok(h in COMMODITY_ALIASES, `profile heading ${h} has no COMMODITY_ALIASES entry — grow the table in news/commodities.ts`)
    assert.ok(COMMODITY_ALIASES[h].length > 0, `COMMODITY_ALIASES.${h} is empty — the subject would be untaggable`)
  }
})

check('every COMMODITY_ALIASES key has a profile heading (no dead vocabulary the wire cannot emit)', () => {
  const swarm = listSwarms().find((s) => s.wire?.subjectField === 'commodity' && s.subjectsSource)!
  const txt = fs.readFileSync(path.join(REPO_ROOT, swarm.subjectsSource!), 'utf8')
  const headings = new Set([...txt.matchAll(HEADING_RE)].map((m) => m[1]))
  for (const k of Object.keys(COMMODITY_ALIASES)) {
    assert.ok(headings.has(k), `alias key ${k} has no \`## ${k}\` heading in ${swarm.subjectsSource}`)
  }
})

check('canonicalCommodities() resolves to the alias keys ∩ live headings (and the test reset hook works)', () => {
  _resetCommoditiesForTest()
  const canon = canonicalCommodities()
  assert.deepEqual([...canon].sort(), Object.keys(COMMODITY_ALIASES).sort(), 'with a synced table the intersection is the full key set')
})

// ---- 2. the tagger table cases ----

check("'Brent slips as OPEC+ weighs output' → ['CRUDE-OIL'] (alias, not the literal word)", () => {
  assert.deepEqual(deriveCommodities({ headline: 'Brent slips as OPEC+ weighs output' }), ['CRUDE-OIL'])
})

check("'Maize harvest disappoints' → ['CORN'] (maize alias)", () => {
  assert.deepEqual(deriveCommodities({ headline: 'Maize harvest disappoints' }), ['CORN'])
})

check("'Gold and copper rally on China data' → ['GOLD','COPPER'] in first-occurrence order", () => {
  assert.deepEqual(deriveCommodities({ headline: 'Gold and copper rally on China data' }), ['GOLD', 'COPPER'])
  // and the mirror ordering, to prove it is occurrence order, not table order
  assert.deepEqual(deriveCommodities({ headline: 'Copper and gold rally on China data' }), ['COPPER', 'GOLD'])
})

check("'Palm oil exports jump' → undefined (no bare 'oil' — palm oil never tags CRUDE-OIL)", () => {
  assert.equal(deriveCommodities({ headline: 'Palm oil exports jump' }), undefined)
})

check("'Goldman Sachs upgrades miners' → undefined (word boundary — no 'gold' inside Goldman)", () => {
  assert.equal(deriveCommodities({ headline: 'Goldman Sachs upgrades miners' }), undefined)
})

check("'Silver hits record' → undefined (silver is not a canonical subject — precision over recall)", () => {
  assert.equal(deriveCommodities({ headline: 'Silver hits record' }), undefined)
})

check('headline_en is scanned in preference to the original-language headline', () => {
  assert.deepEqual(deriveCommodities({ headline: 'الذهب يرتفع', headline_en: 'Gold rises' }), ['GOLD'])
  // a blank/whitespace translation falls back to the original headline
  assert.deepEqual(deriveCommodities({ headline: 'Gold rises', headline_en: '   ' }), ['GOLD'])
})

check('a headline naming 5+ canonical subjects caps at 4 tags (a roundup, not five subject stories)', () => {
  const tags = deriveCommodities({ headline: 'Gold, copper, wheat, corn and cotton all rally' })
  assert.deepEqual(tags, ['GOLD', 'COPPER', 'WHEAT', 'CORN'], 'first four by occurrence, COTTON capped away')
})

check('deriveCommodity is the primary (earliest-mentioned) tag, or undefined', () => {
  assert.equal(deriveCommodity({ headline: 'Copper and gold rally' }), 'COPPER')
  assert.equal(deriveCommodity({ headline: 'A generic corporate update' }), undefined)
})

check('commoditiesOf: stored tags win, else lazy-derive, else []', () => {
  assert.deepEqual(commoditiesOf({ headline: 'Copper climbs', commodities: ['GOLD'] }), ['GOLD'], 'stored tags are honored, never re-derived')
  assert.deepEqual(commoditiesOf({ headline: 'Wheat futures surge' }), ['WHEAT'], 'no stored field → derived from the headline')
  assert.deepEqual(commoditiesOf({ headline: 'A generic corporate update' }), [], 'no match → empty array, never undefined')
})

// ---- 3. hydrate derive-on-read: the OLD firehose backlog classifies like a fresh item, no backfill ----

const NOW = new Date('2026-07-11T09:00:00Z')
const now = () => NOW
const today = NOW.toISOString().slice(0, 10)

let seq = 0
function line(p: Record<string, unknown>): Record<string, unknown> {
  seq++
  return {
    kind: 'item', event_id: `EVT-${String(seq).padStart(6, '0')}`, url: `https://ex.com/${seq}`, domain: 'ex.com',
    source_name: 'Example Wire', via: 'rss', region: 'US', input_nature: 'news_headline', triage_score: 50,
    band: 'watch', triage_reason: '', relevance: 'material', event_types: ['macro_sector'], issuer_linkage: 'macro',
    companies: [], size_bucket: 'unknown', dedup_status: 'new', inboxed: true, ...p,
  }
}

check('readFeed hydrate: an OLD line (no commodity fields) derives commodities/commodity on read', () => {
  const repo = tmp()
  const dir = path.join(repo, 'screener', 'inbox')
  fs.mkdirSync(dir, { recursive: true })
  // OLD-style line: written before the commodity fields existed (also predates scope/country/event_scope)
  const old = line({ ts: `${today}T08:00:00Z`, headline: 'Copper climbs on supply fears' })
  // a fresh line with PRE-STAMPED tags that disagree with its headline — hydrate must NOT clobber them
  const stamped = line({ ts: `${today}T07:00:00Z`, headline: 'Copper climbs on supply fears in Chile', commodities: ['GOLD'], commodity: 'GOLD' })
  fs.writeFileSync(path.join(dir, `${today}_firehose.ndjson`), [old, stamped].map((o) => JSON.stringify(o)).join('\n') + '\n')

  const snap = readFeed(repo, 2, { now })
  assert.equal(snap.items.length, 2)
  const gotOld = snap.items.find((it) => it.event_id === old.event_id) as FeedItem
  assert.ok(gotOld, 'the old line is served')
  assert.deepEqual(gotOld.commodities, ['COPPER'], 'derive-on-read filled commodities for the pre-field line')
  assert.equal(gotOld.commodity, 'COPPER', 'the primary tag is stamped alongside')

  const gotStamped = snap.items.find((it) => it.event_id === stamped.event_id) as FeedItem
  assert.deepEqual(gotStamped.commodities, ['GOLD'], 'a pre-stamped commodities field is untouched (no re-derive clobber)')
  assert.equal(gotStamped.commodity, 'GOLD')
})

check('readFeed hydrate: an old NO-MATCH line stays untagged (absent, not []) after the read', () => {
  const repo = tmp()
  const dir = path.join(repo, 'screener', 'inbox')
  fs.mkdirSync(dir, { recursive: true })
  const plain = line({ ts: `${today}T08:00:00Z`, headline: 'Retailer posts quarterly sales' })
  fs.writeFileSync(path.join(dir, `${today}_firehose.ndjson`), JSON.stringify(plain) + '\n')
  const snap = readFeed(repo, 2, { now })
  assert.equal(snap.items.length, 1)
  assert.equal(snap.items[0].commodities, undefined, 'no canonical subject → the field stays absent (deploy-skew clients fail closed)')
  assert.equal(snap.items[0].commodity, undefined)
})

for (const d of tmpdirs) fs.rmSync(d, { recursive: true, force: true })
console.log(`\ncommodities-tag.test.ts: ${passed} passed`)
