import type { DiscoveryCard, DiscoveryPage, IdeaLane, FilingAction } from './ideas-workspace'
const iso = (s: unknown) => typeof s === 'string' && Number.isFinite(Date.parse(s)) ? new Date(s).toISOString() : ''

/** Fold manual decisions and snapshots, retaining the latest story even after source-store pruning. */
export function projectDiscovery(cards: DiscoveryCard[], actions: FilingAction[], nowMs = Date.now()): DiscoveryCard[] {
  const pinned = new Map<string, DiscoveryCard>()
  for (const action of actions) pinned.set(action.card.key, action.card)
  const candidates = [...pinned.values(), ...cards].map((card) => structuredClone(card))
  // A theme may unite several previously filed stories. Coalesce the whole connected component,
  // rather than updating the first matching card and leaving another copy active.
  const parents = candidates.map((_, i) => i)
  const find = (i: number): number => { while (parents[i] !== i) { parents[i] = parents[parents[i]]; i = parents[i] }; return i }
  const owners = new Map<string, number>()
  candidates.forEach((card, i) => {
    for (const alias of [...card.aliases, `card:${card.key}`]) {
      const key = `${card.kind}|${alias}`
      const prior = owners.get(key)
      if (prior !== undefined) parents[find(i)] = find(prior)
      else owners.set(key, i)
    }
  })
  // A source-bound unknown listing can acquire a venue without becoming a new story. Only bridge
  // when exactly one confirmed market exists; an unresolved symbol must never unite two listings.
  const transitions = new Map<string, { unknown: number[]; known: Map<string, number[]> }>()
  candidates.forEach((card, i) => {
    if (card.kind !== 'idea') return
    for (const alias of card.aliases) {
      const parts = alias.split('|')
      if (parts.length !== 5 || !/^(source|theme):/.test(parts[4])) continue
      const key = [parts[0], ...parts.slice(2)].join('|')
      const entry = transitions.get(key) || { unknown: [], known: new Map<string, number[]>() }
      const market = card.listings.long
      if (!market) entry.unknown.push(i)
      else entry.known.set(market, [...(entry.known.get(market) || []), i])
      transitions.set(key, entry)
    }
  })
  const bridges = new Map<number, Map<string, number>>()
  for (const { unknown, known } of transitions.values()) {
    for (const i of unknown) {
      const matches = bridges.get(find(i)) || new Map<string, number>()
      for (const [market, indices] of known) matches.set(market, indices[0])
      bridges.set(find(i), matches)
    }
  }
  for (const [i, matches] of bridges) {
    if (matches.size === 1) parents[find(i)] = find([...matches.values()][0])
  }
  const groups = new Map<number, DiscoveryCard[]>()
  candidates.forEach((card, i) => { const root = find(i); groups.set(root, [...(groups.get(root) || []), card]) })
  const merged: DiscoveryCard[] = []
  for (const group of groups.values()) {
    const aliases = [...new Set(group.flatMap((c) => [...c.aliases, `card:${c.key}`]))].sort()
    const keys = new Set(group.map((c) => c.key))
    const decisions = actions.filter((a) => keys.has(a.card.key) && a.action !== 'update')
    const decision = decisions[decisions.length - 1]
    // Newer source snapshots supersede earlier copies; at an equal clock prefer the current store.
    const card = group.reduce((a, b) => b.updated_at >= a.updated_at ? b : a)
    card.aliases = aliases
    if (decision) {
      card.key = decision.card.key
      card.action_revision = decision.card.action_revision
      card.archive_reason = decision.action === 'archive' ? 'manual' : null
      card.archived_at = decision.action === 'archive' ? decision.at : null
    }
    if (card.event) {
      const reports = [...new Map(group.flatMap((c) => c.event?.reports || []).map((r) => [r.event_id, r])).values()]
        .sort((a, b) => b.at.localeCompare(a.at))
      card.event = { ...card.event, reports, independent_stories: new Set(reports.map((r) => r.family)).size }
    }
    if (card.kind === 'idea') {
      const p = card.payload
      card.expired = p.status === 'expired' || (p.status !== 'promoted' && (!iso(p.decay_at) || Date.parse(String(p.decay_at)) <= nowMs))
      if (card.expired && card.archive_reason !== 'manual') {
        card.archive_reason = 'expired'
        card.archived_at = iso(p.decay_at) || card.updated_at
      }
      const live = cards.some((c) => !c.expired && c.kind === 'idea' && c.payload.idea_id === p.idea_id
        && c.payload.idea_version === p.idea_version && c.payload.idea_version_started_at === p.idea_version_started_at)
      if (!live || card.expired) card.payload = { ...p, promotion_available: false, recovery_only: true }
    }
    merged.push(card)
  }
  return merged
}


export function discoveryPage(cards: DiscoveryCard[], lane: IdeaLane, hiddenMarkets: string[], kind: string, cursor: number, notices: string[] = []): DiscoveryPage {
  const laneRows = cards.filter((c) => lane === 'archives' ? c.archive_reason !== null && (kind === 'all' || c.kind === kind)
    : c.archive_reason === null && (lane === 'events' ? c.kind === 'event' : lane === 'chain' ? c.kind === 'chain' : c.kind === 'idea' && c.sides.includes(lane)))
  const rows = laneRows.filter((c) => {
    if (c.kind === 'event') return true
    const markets = lane === 'short' ? [c.listings.short] : lane === 'long' || c.kind === 'chain' ? [c.listings.long]
      : c.sides.map((side) => c.listings[side])
    return markets.some((market) => !market || !hiddenMarkets.includes(market))
  }).sort((a, b) => lane === 'archives' ? String(b.archived_at).localeCompare(String(a.archived_at)) || a.key.localeCompare(b.key)
    : lane === 'events' ? b.priority - a.priority || b.updated_at.localeCompare(a.updated_at) || a.key.localeCompare(b.key)
      : b.updated_at.localeCompare(a.updated_at) || a.key.localeCompare(b.key))
  return { schema_version: 'ideas-workspace/v1', rows: rows.slice(cursor, cursor + 30), total: rows.length, hidden: laneRows.length - rows.length,
    next_cursor: cursor + 30 < rows.length ? String(cursor + 30) : null, notices, projected_at: new Date().toISOString() }
}

