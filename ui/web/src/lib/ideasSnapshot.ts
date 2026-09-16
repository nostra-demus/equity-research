import type { DiscoveryCard, DiscoveryPage, IdeaLane } from '../../../shared/ideas-workspace'
import { isDiscoveryCard } from '../../../shared/ideas-workspace'
import { discoveryListing } from '../../../shared/listing-market'
import type { ScreenerBoard } from './types'
import { discoveryPage, projectDiscovery } from '../../../shared/discovery-projection'

/** A static build retains its company history, but cannot claim to contain live events or save actions. */
export async function ideasSnapshotPage(board: ScreenerBoard, lane: IdeaLane, hide: string, kind: string, cursor: string, snapshot?: unknown): Promise<DiscoveryPage> {
  const hidden = hide.split(',')
  const now = Date.now()
  if (snapshot !== undefined) {
    const value = snapshot as { schema_version?: string; cards?: unknown; generated_at?: string }
    if (!value || value.schema_version !== 'ideas-workspace-snapshot/v1' || !Array.isArray(value.cards)
      || !value.cards.every(isDiscoveryCard) || !Number.isFinite(Date.parse(value.generated_at || ''))) throw new Error('The saved Ideas snapshot could not be read.')
    const cards = projectDiscovery(value.cards, [], now).map((card) => ({ ...card,
      payload: { ...card.payload, promotion_available: false, recovery_only: true } }))
    return discoveryPage(cards, lane, hidden, kind, Number(cursor) || 0,
      [`Read-only saved snapshot from ${value.generated_at}. Connect the engine for new developments and archive actions.`])
  }
  const source = [...(board.ideas || []), ...(board.ideas_archive?.rows || [])]
  const cards = await Promise.all(source.map(async (idea): Promise<DiscoveryCard> => {
    const identity = `${idea.idea_id}|${idea.idea_version}|${idea.idea_version_started_at}`
    const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(identity))
    const key = `idea-${Array.from(new Uint8Array(bytes)).map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 24)}`
    const expired = idea.status === 'expired' || (idea.status !== 'promoted' && (!Number.isFinite(Date.parse(idea.decay_at)) || Date.parse(idea.decay_at) <= now))
    const long = discoveryListing(idea.ticker, idea.exchange)
    return { key, kind: 'idea', aliases: [identity], sides: idea.direction === 'pair' ? ['long', 'short'] : [idea.direction],
      listings: { long, short: idea.direction === 'pair' ? discoveryListing(idea.pair_with) : long },
      updated_at: idea.updated_at, priority: idea.trade_score || 0,
      payload: { ...idea, promotion_available: false, recovery_only: true }, expired,
      archived_at: expired ? Number.isFinite(Date.parse(idea.decay_at)) ? idea.decay_at : new Date(now).toISOString() : null,
      archive_reason: expired ? 'expired' : null, action_revision: null }
  }))
  const unique = [...new Map(cards.filter(isDiscoveryCard).map((c) => [c.key, c])).values()]
  const eligible = unique.filter((c) => lane === 'archives' ? c.expired && (kind === 'all' || kind === 'idea')
    : (lane === 'long' || lane === 'short') && !c.expired && c.sides.includes(lane))
  const rows = eligible.filter((c) => (lane === 'archives' ? c.sides : [lane === 'short' ? 'short' as const : 'long' as const])
    .some((side) => !c.listings[side] || !hidden.includes(c.listings[side]!)))
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
  const offset = Number(cursor) || 0
  return { schema_version: 'ideas-workspace/v1', rows: rows.slice(offset, offset + 30), total: rows.length,
    hidden: eligible.length - rows.length, next_cursor: offset + 30 < rows.length ? String(offset + 30) : null,
    notices: ['Read-only saved snapshot. Live Events, Chain updates, and archive actions require a connected engine.'], projected_at: new Date(now).toISOString() }
}
