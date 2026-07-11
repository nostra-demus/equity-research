// Per-commodity tagging for the news wire — the canonical-subject layer UNDER the coarse
// `scope: 'commodity'` bucket (scope.ts). Where scope.ts answers "is this a commodity story at all",
// this module answers "WHICH tracked commodity is it about" — stamping `GOLD` / `CRUDE-OIL` / … onto
// feed items so a swarm whose manifest declares `wire.subject_field: commodity` can group and filter
// its wire by subject. Pure, deterministic, zero LLM cost, and derived — so the whole firehose
// backlog classifies identically to a fresh item via feed.ts hydrate(), no re-triage, no backfill.
//
// The alias table below is the domain lexicon (like scope.ts COMMODITY_TERMS or the GICS keyword
// tables). Its KEYS mirror the `## <NAME>` subject headings of the commodity swarm's declared
// `subjects_source` (frameworks/commodity/COMMODITY_PROFILES.md). Sync is enforced two ways:
//  - at runtime, emitted tags are INTERSECTED with the live subject headings (resolved through the
//    swarm manifest whose `wire.subject_field` is 'commodity' — CLAUDE.md §26: manifest-driven, no
//    swarm id hardcoded here), so a heading removed from the profiles stops being emitted with no
//    code change;
//  - test/commodities-tag.test.ts asserts BIDIRECTIONAL coverage (every heading has an alias entry,
//    every alias entry has a heading), so adding a 13th commodity fails until this table grows.
//
// Precision over recall, on purpose: only the canonical subjects are ever emitted (silver, lithium,
// steel headlines get NO tag — they still carry the coarse `scope: 'commodity'`), and the aliases
// avoid over-broad words (no bare "oil", so "palm oil"/"soyoil" never tag CRUDE-OIL; no bare "gas";
// no bare "cane"). Matching reuses scope.ts findTerm — the same word-boundary rule that keeps
// "Goldman" from tagging GOLD.

import fs from 'node:fs'
import path from 'node:path'
import { REPO_ROOT } from '../config'
import { listSwarms } from '../swarms'
import { findTerm } from './scope'

/** Canonical subject id — one of the commodity profiles' `## <NAME>` headings (e.g. 'GOLD'). */
export type CommodityId = string

// alias → canonical subject. Lowercased; word-ish boundaries handled by the matcher (findTerm).
export const COMMODITY_ALIASES: Record<CommodityId, string[]> = {
  GOLD: ['gold', 'bullion', 'xau'],
  SUGAR: ['sugar', 'raw sugar', 'white sugar', 'sugarcane', 'cane sugar', 'unica'],
  // deliberately NO bare 'oil' (palm oil / soyoil / olive oil) and NO bare 'barrel' (Cracker Barrel)
  'CRUDE-OIL': ['crude', 'brent', 'wti', 'opec', 'opec+', 'oil price', 'oil prices', 'oil output', 'oil supply', 'oil demand', 'oil futures', 'oil market', 'per barrel', 'a barrel', 'gasoline', 'petrol', 'diesel', 'jet fuel'],
  // deliberately NO bare 'gas' (tear gas, gaslight) — gasoline belongs to CRUDE-OIL (a refined product)
  'NATURAL-GAS': ['natural gas', 'natgas', 'lng', 'henry hub', 'gas prices', 'gas storage', 'gas futures'],
  COPPER: ['copper'],
  ALUMINIUM: ['aluminium', 'aluminum', 'alumina', 'bauxite'],
  WHEAT: ['wheat'],
  CORN: ['corn', 'maize'],
  // deliberately NO bare 'soy' (soy sauce)
  SOYBEANS: ['soybean', 'soybeans', 'soymeal', 'soy meal', 'soyoil', 'soy oil'],
  COFFEE: ['coffee', 'arabica', 'robusta'],
  COCOA: ['cocoa'],
  COTTON: ['cotton'],
}

const MAX_TAGS = 4 // a market-wrap can name several; beyond a handful it's a roundup, not a subject story

// ---- canonical-subject resolution (lazy, cached) ------------------------------------------------
// The live subject headings come from the manifest of whichever swarm declares
// `wire.subject_field: commodity` (§26 — self-declared, never a hardcoded swarm id). When no such
// manifest exists yet (older tree, tests) the alias table itself is the vocabulary — fail-open to
// the table, fail-closed to the profiles once a wire declares them.

const HEADING_RE = /^##\s+([A-Z0-9][A-Z0-9.\-]{0,14})\s*$/gm // same shape roster.ts swarmSubjects uses

let cachedCanonical: Set<CommodityId> | null = null

function readSubjectHeadings(): Set<CommodityId> | null {
  try {
    const swarm = listSwarms().find((s) => s.wire?.subjectField === 'commodity' && s.subjectsSource)
    if (!swarm?.subjectsSource) return null
    const txt = fs.readFileSync(path.join(REPO_ROOT, swarm.subjectsSource), 'utf8')
    const out = new Set<CommodityId>()
    for (const m of txt.matchAll(HEADING_RE)) out.add(m[1])
    return out.size ? out : null
  } catch {
    return null
  }
}

/** The canonical subjects the tagger may emit: alias-table keys ∩ live profile headings (when a
 *  wire-declaring manifest resolves them), else the alias-table keys. Cached for the process life —
 *  the profiles file is CODE-stream (changes arrive with a deploy restart). */
export function canonicalCommodities(): Set<CommodityId> {
  if (cachedCanonical) return cachedCanonical
  const headings = readSubjectHeadings()
  const keys = Object.keys(COMMODITY_ALIASES)
  cachedCanonical = new Set(headings ? keys.filter((k) => headings.has(k)) : keys)
  return cachedCanonical
}

/** Test hook: drop the cached canonical set (and let listSwarms re-resolve on next call). */
export function _resetCommoditiesForTest(): void {
  cachedCanonical = null
}

// ---- the tagger ----------------------------------------------------------------------------------

export interface CommodityInput {
  headline?: string | null
  headline_en?: string | null // English translation — scanned in preference, same rule as deriveScope
}

/** ALL canonical subjects the headline names, in first-occurrence order (earliest mention first,
 *  ties broken by table order), capped at MAX_TAGS. `undefined` when none match — the field is then
 *  simply absent on the item, so deploy-skew clients fail closed on `undefined`, never on `[]`. */
export function deriveCommodities(it: CommodityInput): CommodityId[] | undefined {
  const src = (it.headline_en && it.headline_en.trim()) || it.headline
  if (!src) return undefined
  const hay = ' ' + String(src).toLowerCase() + ' '
  const canonical = canonicalCommodities()
  const hits: { id: CommodityId; at: number }[] = []
  for (const [id, aliases] of Object.entries(COMMODITY_ALIASES)) {
    if (!canonical.has(id)) continue
    let best = -1
    for (const a of aliases) {
      const i = findTerm(hay, a)
      if (i >= 0 && (best < 0 || i < best)) best = i
    }
    if (best >= 0) hits.push({ id, at: best })
  }
  if (!hits.length) return undefined
  hits.sort((a, b) => a.at - b.at) // stable sort → table order breaks ties
  return hits.slice(0, MAX_TAGS).map((h) => h.id)
}

/** The PRIMARY subject — the first (earliest-mentioned) canonical match, or undefined. */
export function deriveCommodity(it: CommodityInput): CommodityId | undefined {
  return deriveCommodities(it)?.[0]
}

/** The item's commodities with the lazy-derive fallback — the one accessor filter/facet code uses, so
 *  a synthetic item (debug/explain) or a not-yet-hydrated line still filters correctly. */
export function commoditiesOf(it: CommodityInput & { commodities?: string[] }): CommodityId[] {
  return it.commodities ?? deriveCommodities(it) ?? []
}
