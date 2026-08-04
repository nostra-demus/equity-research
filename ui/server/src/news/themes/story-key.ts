// One canonical identity for an underlying wire story. `dedup_group` is itself the earliest member's
// event_id (news/dedup.ts), so it must share the SAME namespace as the fallback event_id. Prefixing the
// two differently makes a legacy canonical row and a newer publisher copy look independent.

export interface ThemeStoryIdentity {
  event_id?: unknown
  dedup_group?: unknown
  headline?: unknown
}

export function themeStoryKey(item: ThemeStoryIdentity): string {
  const group = typeof item?.dedup_group === 'string' ? item.dedup_group.trim() : ''
  if (group) return group
  const event = typeof item?.event_id === 'string' ? item.event_id.trim() : ''
  if (event) return event
  // Runtime ledger compatibility only: well-formed engine rows always carry event_id. Keeping a bounded
  // headline fallback prevents several malformed rows from collapsing into one empty-string family.
  const headline = String(item?.headline || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ')
  return headline ? `headline:${headline}` : ''
}
