// deriveWireConfig / subject-attribution truth table — plain tsx-assert (run: npx tsx src/lib/wire.test.ts),
// the same standalone style as themes.momentum.test.ts. Covers the fail-closed shapes the deploy-skew
// rule depends on: an old server's meta (no `wire`) yields NO wire config for a constellation swarm.

import assert from 'node:assert'
import { deriveWireConfig, itemOnWire, subjectOfItem, subjectsOfItem, WIRE_OTHER } from './wire'
import type { FeedItem, SwarmMeta } from './types'

const meta = (over: Partial<SwarmMeta>): SwarmMeta => ({ id: 'x', label: 'X', color: '#888', unit: 'u', order: 9, layout: 'constellation', ...over })
const item = (over: Partial<FeedItem>): FeedItem => ({
  kind: 'item', ts: '2026-07-11T00:00:00Z', event_id: 'EVT-abc', headline: 'h', url: '', domain: '', source_name: '',
  via: 'rss', region: 'GLOBAL', input_nature: 'news_article', triage_score: 50, band: 'watch', triage_reason: '',
  relevance: '', event_types: [], issuer_linkage: '', companies: [], size_bucket: 'unknown', dedup_status: 'new', inboxed: true,
  ...over,
} as FeedItem)

let passed = 0
const check = (name: string, fn: () => void) => { fn(); passed++ }

// ---- deriveWireConfig ----
check('flow layout → grandfathered default (no manifest needed)', () => {
  const cfg = deriveWireConfig(meta({ layout: 'flow' }), [])
  assert.ok(cfg && cfg.flow && cfg.groupBy === null && !cfg.pulse)
})
check('constellation + NO wire meta → null (old server fail-closed)', () => {
  assert.strictEqual(deriveWireConfig(meta({}), ['GOLD']), null)
})
check('undefined meta → null (first frame safe)', () => {
  assert.strictEqual(deriveWireConfig(undefined, []), null)
})
check('declared wire → manifest-driven config', () => {
  const cfg = deriveWireConfig(meta({ wire: { eventScope: 'commodity', groupBy: 'subject', subjectField: 'commodity', pulse: 'frameworks/x.json', defaultView: 'latest' } }), ['GOLD', 'SUGAR'])
  assert.ok(cfg && !cfg.flow)
  assert.strictEqual(cfg!.eventScope, 'commodity')
  assert.strictEqual(cfg!.groupBy, 'subject')
  assert.deepStrictEqual(cfg!.subjects, ['GOLD', 'SUGAR'])
  assert.ok(cfg!.pulse)
  assert.strictEqual(cfg!.defaultView, 'latest')
})
check('unknown defaultView falls back to latest; unknown groupBy → null', () => {
  const cfg = deriveWireConfig(meta({ wire: { eventScope: 'commodity', groupBy: 'weird', defaultView: 'nope' } }), [])
  assert.ok(cfg)
  assert.strictEqual(cfg!.groupBy, null)
  assert.strictEqual(cfg!.defaultView, 'latest')
})

// ---- subject attribution ----
const cfg = deriveWireConfig(meta({ wire: { eventScope: 'commodity', groupBy: 'subject', subjectField: 'commodity' } }), ['GOLD', 'CRUDE-OIL', 'SUGAR'])!
check('server-stamped commodities are authoritative (tracked-only)', () => {
  assert.deepStrictEqual(subjectsOfItem(item({ commodities: ['GOLD', 'COPPER'] } as any), cfg), ['GOLD']) // COPPER untracked in this cfg
})
check('stamped single field works without the plural', () => {
  assert.deepStrictEqual(subjectsOfItem(item({ commodity: 'SUGAR' } as any), cfg), ['SUGAR'])
})
check('old server (no stamp) → taxonomy fallback maps to canonical ids', () => {
  assert.deepStrictEqual(subjectsOfItem(item({ headline: 'Brent crude climbs to $92' }), cfg), ['CRUDE-OIL'])
})
check('untracked story → Other', () => {
  assert.strictEqual(subjectOfItem(item({ headline: 'Freight rates spike on the Baltic' }), cfg), WIRE_OTHER)
})
check('itemOnWire: tagged single_name story IS on the wire; unrelated macro is NOT', () => {
  assert.ok(itemOnWire(item({ scope: 'single_name', commodities: ['GOLD'] } as any), cfg))
  assert.ok(itemOnWire(item({ scope: 'commodity' } as any), cfg)) // in-scope but untagged → Other lane
  assert.ok(!itemOnWire(item({ scope: 'macro', headline: 'CPI cools' } as any), cfg))
})
check('flow wire carries everything', () => {
  const flow = deriveWireConfig(meta({ layout: 'flow' }), [])!
  assert.ok(itemOnWire(item({ scope: 'macro' } as any), flow))
})

console.log(`wire.test: ${passed} checks passed`)
