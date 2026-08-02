// Query-focused, cited relationship graph over the saved news archive.
//
// This is not a knowledge graph that invents permanent facts. It records a narrower and auditable thing:
// a named subject was explicitly present in an article, and a structured company/topic/commodity was
// attached to that same saved event. Every edge keeps the exact event that created it. A saved article
// read may also label a beneficiary/exposure edge; those stay visibly labelled as saved-read output.

import { normalizeRetrievalText, retrievalTokens, type HybridQuery } from '../retrieval/hybrid'
import type { FeedItem } from './types'

export type RelationshipKind = 'company' | 'topic' | 'commodity' | 'event'
export type RelationshipType = 'co_mentioned' | 'saved_beneficiary' | 'saved_exposure'

export interface RelationshipEvidence {
  item: FeedItem
  relation: RelationshipType
}

export interface NewsRelationship {
  seed: string
  relatedId: string
  related: string
  aliases: string[]
  kind: RelationshipKind
  relation: RelationshipType
  mentions: number
  evidence: RelationshipEvidence[]
}

export interface GraphCandidate {
  item: FeedItem
  score: number
  reason: string
  relation: NewsRelationship
}

interface SavedReadLike {
  summary?: string
  summary_en?: string | null
  gist?: string[]
  companies?: { name?: string; ticker?: string | null }[]
  beneficiaries?: { name?: string; ticker?: string | null }[]
  exposed?: { name?: string; ticker?: string | null }[]
}

interface Entity {
  id: string
  label: string
  aliases: string[]
  kind: RelationshipKind
  relation: RelationshipType
}

interface EdgeState {
  relationship: NewsRelationship
  evidenceIds: Set<string>
}

interface RankedItem { item: FeedItem; score: number }

const METRIC = new Set([
  'annual', 'capex', 'change', 'demand', 'earnings', 'ebitda', 'eps', 'forecast', 'growth', 'guidance',
  'margin', 'outlook', 'price', 'profit', 'qoq', 'quarter', 'rate', 'revenue', 'sales', 'share', 'spend',
  'trend', 'year', 'yoy',
])

function key(value: string): string {
  return retrievalTokens(value).join(' ')
}

function entityId(kind: RelationshipKind, label: string): string {
  return `${kind}:${key(label)}`
}

function addEntity(map: Map<string, Entity>, entity: Entity): void {
  if (!key(entity.label)) return
  const prev = map.get(entity.id)
  if (!prev) { map.set(entity.id, entity); return }
  prev.aliases = [...new Set([...prev.aliases, ...entity.aliases].filter(Boolean))]
  // Explicit saved-read direction is more useful than plain co-mention, but it remains labelled.
  if (prev.relation === 'co_mentioned' && entity.relation !== 'co_mentioned') prev.relation = entity.relation
}

function itemEntities(item: FeedItem, saved?: SavedReadLike): Entity[] {
  const out = new Map<string, Entity>()
  for (const company of item.companies || []) {
    const label = String(company.name || company.ticker || '').trim()
    if (!label) continue
    addEntity(out, { id: entityId('company', company.ticker || label), label, aliases: [label, company.ticker || ''], kind: 'company', relation: 'co_mentioned' })
  }
  for (const company of saved?.companies || []) {
    const label = String(company.name || company.ticker || '').trim()
    if (!label) continue
    addEntity(out, { id: entityId('company', company.ticker || label), label, aliases: [label, company.ticker || ''], kind: 'company', relation: 'co_mentioned' })
  }
  for (const company of saved?.beneficiaries || []) {
    const label = String(company.name || company.ticker || '').trim()
    if (!label) continue
    addEntity(out, { id: entityId('company', company.ticker || label), label, aliases: [label, company.ticker || ''], kind: 'company', relation: 'saved_beneficiary' })
  }
  for (const company of saved?.exposed || []) {
    const label = String(company.name || company.ticker || '').trim()
    if (!label) continue
    addEntity(out, { id: entityId('company', company.ticker || label), label, aliases: [label, company.ticker || ''], kind: 'company', relation: 'saved_exposure' })
  }
  for (const topic of item.topics || []) addEntity(out, { id: entityId('topic', topic), label: topic, aliases: [topic], kind: 'topic', relation: 'co_mentioned' })
  for (const commodity of item.commodities || (item.commodity ? [item.commodity] : [])) addEntity(out, { id: entityId('commodity', commodity), label: commodity, aliases: [commodity], kind: 'commodity', relation: 'co_mentioned' })
  for (const event of item.event_types || []) addEntity(out, { id: entityId('event', event), label: event.replace(/_/g, ' '), aliases: [event, event.replace(/_/g, ' ')], kind: 'event', relation: 'co_mentioned' })
  return [...out.values()].slice(0, 14)
}

function directText(item: FeedItem, saved?: SavedReadLike): string {
  return [
    item.headline_en, item.headline, item.snippet,
    saved?.summary_en, saved?.summary, ...(saved?.gist || []),
  ].filter(Boolean).join(' ')
}

function containsTerm(textTokens: Set<string>, term: string): boolean {
  return retrievalTokens(term).every((token) => textTokens.has(token))
}

function sourceWeight(item: FeedItem): number {
  return item.source_tier === 'primary_filing' ? 18
    : item.source_tier === 'official_data' ? 14
      : item.source_tier === 'company' ? 9
        : item.source_tier === 'social' ? -15
          : 4
}

function keepTop(rows: RankedItem[], row: RankedItem, max = 12): void {
  const prior = rows.findIndex((r) => r.item.event_id === row.item.event_id)
  if (prior >= 0) {
    if (row.score > rows[prior].score) rows[prior] = row
  } else rows.push(row)
  rows.sort((a, b) => b.score - a.score || String(b.item.ts).localeCompare(String(a.item.ts)))
  if (rows.length > max) rows.length = max
}

export class NewsRelationshipGraph {
  private readonly seeds: string[]
  private readonly edges = new Map<string, EdgeState>()
  private readonly byEntity = new Map<string, RankedItem[]>()
  private readonly seedMentions = new Map<string, number>()

  constructor(query: HybridQuery) {
    this.seeds = (query.anchors.length ? query.anchors : query.terms)
      .filter((term) => !METRIC.has(term))
      .slice(0, 8)
  }

  add(item: FeedItem, saved?: SavedReadLike): void {
    if (!this.seeds.length) return
    const entities = itemEntities(item, saved)
    const quality = Number(item.triage_score || 0) + sourceWeight(item)
    for (const entity of entities) {
      if (!this.byEntity.has(entity.id)) this.byEntity.set(entity.id, [])
      keepTop(this.byEntity.get(entity.id)!, { item, score: quality })
    }

    const textTokens = new Set(retrievalTokens(directText(item, saved)))
    const directSeeds = this.seeds.filter((seed) => containsTerm(textTokens, seed))
    if (!directSeeds.length) return
    for (const seed of directSeeds) {
      this.seedMentions.set(seed, (this.seedMentions.get(seed) || 0) + 1)
      for (const entity of entities) {
        if (containsTerm(new Set(entity.aliases.flatMap(retrievalTokens)), seed)) continue
        const edgeKey = `${seed}|${entity.id}|${entity.relation}`
        let state = this.edges.get(edgeKey)
        if (!state) {
          state = {
            relationship: {
              seed,
              relatedId: entity.id,
              related: entity.label,
              aliases: entity.aliases,
              kind: entity.kind,
              relation: entity.relation,
              mentions: 0,
              evidence: [],
            },
            evidenceIds: new Set(),
          }
          this.edges.set(edgeKey, state)
        }
        state.relationship.mentions++
        if (!state.evidenceIds.has(item.event_id) && state.relationship.evidence.length < 6) {
          state.evidenceIds.add(item.event_id)
          state.relationship.evidence.push({ item, relation: entity.relation })
        }
      }
    }
  }

  relationships(limit = 18): NewsRelationship[] {
    return [...this.edges.values()].map((s) => s.relationship)
      .sort((a, b) => {
        const directional = (r: NewsRelationship) => r.relation === 'co_mentioned' ? 0 : 1
        const kind = (r: NewsRelationship) => r.kind === 'company' ? 4 : r.kind === 'commodity' ? 3 : r.kind === 'topic' ? 2 : 1
        // Rare, specific query terms (for example Bedrock in "Amazon Bedrock") must not be drowned
        // out by hundreds of generic Amazon/event edges. Concrete companies also beat taxonomy tags.
        return (this.seedMentions.get(a.seed) || 0) - (this.seedMentions.get(b.seed) || 0)
          || directional(b) - directional(a)
          || kind(b) - kind(a)
          || b.mentions - a.mentions
          || a.related.localeCompare(b.related)
      })
      .slice(0, limit)
  }

  candidates(existingIds: Set<string>, limit = 12): GraphCandidate[] {
    const out: GraphCandidate[] = []
    for (const relation of this.relationships(12)) {
      // Only concrete company/commodity nodes may expand retrieval. Broad taxonomy nodes such as
      // `commercial` or `AI` are useful context, but using them as bridges pulls in almost every story
      // in a sector and creates a false connection. The relationship can still be shown with its own
      // citation; it just cannot fetch extra evidence.
      if (relation.kind !== 'company' && relation.kind !== 'commodity') continue
      // A co-mention proves only that two names appeared in the same saved event. It is useful to show
      // with that citation, but it is not enough to pull every later story about the other company into
      // the answer (Bedrock + Microsoft once must not import unrelated Microsoft lawsuits). Expansion
      // needs the saved reader's explicit beneficiary/exposure label.
      if (relation.relation === 'co_mentioned') continue
      const rows = this.byEntity.get(relation.relatedId) || []
      for (const row of rows) {
        if (existingIds.has(row.item.event_id)) continue
        const score = row.score + 13 + Math.min(12, relation.mentions * 2)
        out.push({
          item: row.item,
          score,
          reason: `graph:${relation.seed}↔${relation.related} (${relation.relation.replace(/_/g, ' ')})`,
          relation,
        })
      }
    }
    const seen = new Set<string>()
    return out.sort((a, b) => b.score - a.score || String(b.item.ts).localeCompare(String(a.item.ts)))
      .filter((row) => seen.has(row.item.event_id) ? false : (seen.add(row.item.event_id), true))
      .slice(0, limit)
  }
}

export function relationshipLine(r: NewsRelationship, refs: Map<string, string>): string {
  const evidence = r.evidence.map((e) => refs.get(e.item.event_id)).filter(Boolean).map((ref) => `[${ref}]`).join(' ')
  const verb = r.relation === 'saved_beneficiary' ? 'saved read marks as a possible beneficiary'
    : r.relation === 'saved_exposure' ? 'saved read marks as exposed'
      : 'appears with'
  return `- ${r.seed} ${verb} ${r.related}; ${r.mentions} saved event(s)${evidence ? `; evidence ${evidence}` : ''}.`
}

export function relationSearchTerms(relations: NewsRelationship[]): string[] {
  return [...new Set(relations.flatMap((r) => [r.related, ...r.aliases]).flatMap(retrievalTokens).filter((t) => t.length >= 2))].slice(0, 32)
}

export function relationshipFingerprint(relations: NewsRelationship[]): string {
  return normalizeRetrievalText(relations.map((r) => `${r.seed}|${r.relatedId}|${r.relation}|${r.mentions}`).join(';'))
}
