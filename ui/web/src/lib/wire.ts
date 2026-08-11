// The WIRE CONFIG — what makes the news-wire surface swarm-generic. One component tree
// (components/wire/* + the screener-named organs it composes) renders the wire for EVERY swarm that
// has one; the differences between swarms are declared here as capabilities, derived from the swarm's
// own manifest (`wire:` block in SWARM.md, surfaced by /api/swarms as SwarmMeta.wire).
//
// Rules of the contract (ui/web/DESIGN.md "wire component contract", enforced by
// ui/server/test/wire-purity.test.ts):
//  - wire components read this config via useWireConfig() (components/wire/WireContext.tsx);
//  - they branch on CAPABILITIES (flow / gauntlet / groupBy / eventScope / pulse), never on swarm ids;
//  - a new wire feature must be expressible as manifest config, or it lives in a swarm-specific
//    wrapper outside the shared tree.
//
// Deploy-skew: `meta.wire` is ABSENT on an old server, so deriveWireConfig returns null for a
// constellation swarm and the cockpit renders exactly the pre-wire stage — fail-closed by shape.

import type { FeedItem, SwarmMeta } from './types'
import { extractCommodities } from './taxonomy'

export interface WireConfig {
  /** provider identity — for keying caches/persistence ONLY, never for behavior branches */
  swarmId: string
  /** full-stage flow composition; swarm-specific actions still require an explicit capability */
  flow: boolean
  /** this wrapper owns the gauntlet/Ideas/paid sweep actions; layout alone never grants them */
  gauntlet: boolean
  /** server-side scope clause appended to feed/search/facets/themes queries (e.g. 'commodity') */
  eventScope?: string
  /** 'subject' => the rail replaces scope chips with the swarm's canonical subject chips */
  groupBy: 'subject' | null
  /** the FeedItem field carrying the canonical subject id (e.g. 'commodity' -> it.commodity) */
  subjectField?: string
  /** the swarm's canonical subjects (profile headings), from /api/swarm/subjects */
  subjects: string[]
  /** the per-subject pulse strip is available (/api/swarm/pulse) */
  pulse: boolean
  /** rail landing tab */
  defaultView: 'themes' | 'ranked' | 'latest'
}

/** The subject bucket for items no canonical subject claims. */
export const WIRE_OTHER = 'Other'

const VIEWS = ['themes', 'ranked', 'latest'] as const

/** Derive a swarm's wire config from its /api/swarms meta. Returns:
 *  - the grandfathered screener default for `layout: 'flow'` (its wire needs no manifest),
 *  - a manifest-driven config when the swarm positively declares `wire:`,
 *  - null otherwise (including every swarm on an old server) — no wire surface. */
export function deriveWireConfig(meta: SwarmMeta | undefined, subjects: string[] = []): WireConfig | null {
  if (!meta) return null
  if (meta.layout === 'flow') {
    return { swarmId: meta.id, flow: true, gauntlet: false, groupBy: null, subjects: [], pulse: false, defaultView: 'latest' }
  }
  const w = meta.wire
  if (!w) return null
  const view = VIEWS.includes(w.defaultView as any) ? (w.defaultView as WireConfig['defaultView']) : 'latest'
  return {
    swarmId: meta.id,
    flow: false,
    gauntlet: false,
    eventScope: w.eventScope || undefined,
    groupBy: w.groupBy === 'subject' ? 'subject' : null,
    subjectField: w.subjectField || undefined,
    subjects,
    pulse: !!w.pulse,
    defaultView: view,
  }
}

// ---- subject attribution -------------------------------------------------------------------------

// Fallback map: the client extractor's display names (lib/taxonomy.ts extractCommodities) → canonical
// subject ids, for items from an OLD server that lack the persisted `commodity` field. Only names that
// map onto a canonical subject appear; everything else falls to WIRE_OTHER. Mirrors the server tagger's
// precision posture (ui/server/src/news/commodities.ts) — silver/lithium/steel stay untracked.
const TAXONOMY_TO_SUBJECT: Record<string, string> = {
  Gold: 'GOLD',
  Sugar: 'SUGAR',
  Oil: 'CRUDE-OIL',
  'Natural gas': 'NATURAL-GAS',
  Copper: 'COPPER',
  Aluminium: 'ALUMINIUM',
  Wheat: 'WHEAT',
  Corn: 'CORN',
  Soybean: 'SOYBEANS',
  Coffee: 'COFFEE',
  Cocoa: 'COCOA',
  Cotton: 'COTTON',
}

// the plural of a subject field name ('commodity' -> 'commodities') — the server stamps BOTH the
// singular (primary) and the plural (all matches) onto the item
const pluralOf = (field: string): string => (field.endsWith('y') ? `${field.slice(0, -1)}ies` : `${field}s`)

/** Every canonical subject an item belongs to, for the active wire config. The server-stamped field
 *  (cfg.subjectField, e.g. it.commodity/commodities) is authoritative; the taxonomy extractor is the
 *  old-server fallback. Only subjects the config actually tracks are returned; [] = untracked (Other). */
export function subjectsOfItem(it: FeedItem, cfg: WireConfig): string[] {
  const tracked = new Set(cfg.subjects)
  const stamped = cfg.subjectField ? ((it as any)[pluralOf(cfg.subjectField)] ?? ((it as any)[cfg.subjectField] ? [(it as any)[cfg.subjectField]] : undefined)) : undefined
  if (Array.isArray(stamped)) return stamped.filter((s: string) => tracked.has(s))
  const extracted = extractCommodities(`${it.headline_en || it.headline}`)
  const mapped = extracted.map((name) => TAXONOMY_TO_SUBJECT[name]).filter((s): s is string => !!s && tracked.has(s))
  return [...new Set(mapped)]
}

/** The item's primary subject chip, or WIRE_OTHER. */
export function subjectOfItem(it: FeedItem, cfg: WireConfig): string {
  return subjectsOfItem(it, cfg)[0] ?? WIRE_OTHER
}

/** Does the item belong on this wire at all? A subject-grouped wire carries items that are tagged with
 *  a tracked subject OR fall in the declared scope bucket (so untagged commodity-wide stories still
 *  show under Other). A flow wire carries everything (today's screener behavior). */
export function itemOnWire(it: FeedItem, cfg: WireConfig): boolean {
  if (cfg.flow || !cfg.eventScope) return true
  if (subjectsOfItem(it, cfg).length > 0) return true
  return (it.scope || '') === cfg.eventScope
}

// ---- pulse (GET /api/swarm/pulse) ----------------------------------------------------------------

export interface WirePulsePrice { symbol: string; last: number; prev_close: number | null; change_pct: number | null; unit: string; as_of: string; source: string }
export interface WirePulseCot { market: string; managed_money_net: number; prev_net: number | null; change: number | null; report_date: string; source: string }
export interface WirePulseReport { name: string; cadence: string; next: string | null }
export interface WirePulseSubject {
  subject: string
  price?: WirePulsePrice
  cot?: WirePulseCot
  reports?: WirePulseReport[]
  verdict?: { action: string; at: string }
}
export interface WirePulseSnapshot { swarm: string; as_of: string; stale: boolean; subjects: Record<string, WirePulseSubject> }
