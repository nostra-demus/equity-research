import { createHash } from 'node:crypto'
import { directoryTickerIdentityKey } from '../symbology'
import type { DiscoveryCard } from '../../../../shared/ideas-workspace'
import { discoveryListing } from '../../../../shared/listing-market'
const hash = (s: string) => createHash('sha256').update(s).digest('hex').slice(0, 24)
const iso = (s: unknown) => typeof s === 'string' && Number.isFinite(Date.parse(s)) ? new Date(s).toISOString() : ''
const strings = (v: unknown): string[] => Array.isArray(v) ? v.filter((s): s is string => typeof s === 'string') : []

export function shell(kind: DiscoveryCard['kind'], aliases: string[], payload: Record<string, unknown>, at: string, priority: number): DiscoveryCard {
  const unique = [...new Set(aliases)].sort()
  return { key: `${kind}-${hash(unique[0])}`, kind, aliases: unique, sides: [], listings: { long: null, short: null },
    updated_at: at, priority, payload, expired: false, archived_at: null, archive_reason: null, action_revision: null }
}

/** Use source families / a validated narrative identity, never ticker+direction alone. */
export function discoveryIdea(row: Record<string, any>, families = new Map<string, string>()): DiscoveryCard {
  const market = discoveryListing(row.ticker, row.exchange)
  const instrument = `${directoryTickerIdentityKey(String(row.ticker || '').replace(/^[^:]+:/, ''), market)}|${market || 'unknown'}|${row.direction}|${row.pair_with || ''}`
  const sources = strings(row.source_event_ids).flatMap((id) => [`source:${id}`, `source:${families.get(id) || id}`])
  const themes = Array.isArray(row.source_themes) ? row.source_themes.flatMap((t: any) => typeof t?.theme_id === 'string' ? [`theme:${t.theme_id}`] : []) : []
  const aliases = [...themes, ...sources].map((id) => `${instrument}|${id}`)
  if (!aliases.length) aliases.push(`${instrument}|version:${row.idea_version || hash(String(row.reason))}|${row.idea_version_started_at || row.surfaced_at}`)
  const card = shell('idea', aliases, row, iso(row.updated_at) || iso(row.newest_source_at), Number(row.trade_score) || 0)
  card.sides = row.direction === 'pair' ? ['long', 'short'] : row.direction === 'short' ? ['short'] : ['long']
  card.listings.long = discoveryListing(row.ticker, row.exchange)
  card.listings.short = row.direction === 'pair' ? discoveryListing(row.pair_with) : card.listings.long
  card.expired = row.status === 'expired' || (row.status !== 'promoted' && (row.stale === true || !iso(row.decay_at) || Date.parse(row.decay_at) <= Date.now()))
  if (card.expired) { card.archive_reason = 'expired'; card.archived_at = iso(row.archived_at) || iso(row.decay_at) || card.updated_at }
  return card
}

