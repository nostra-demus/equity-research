// One canonical identity for an underlying wire story. `dedup_group` is itself the earliest member's
// event_id (news/dedup.ts), so it must share the SAME namespace as the fallback event_id. Prefixing the
// two differently makes a legacy canonical row and a newer publisher copy look independent.

export interface ThemeStoryIdentity {
  event_id?: unknown
  dedup_group?: unknown
  headline?: unknown
  headline_en?: unknown
  event_types?: unknown
}

const CORRECTION_RE = /\b(correct(?:s|ed|ion)?|clarif(?:y|ies|ied|ication)|revis(?:e|es|ed|ion)|restat(?:e|es|ed|ement))\b/i
const REVERSAL_RE = /\b(retract(?:s|ed|ion)?|withdraw(?:s|n|al)?|revers(?:e|es|ed|al)|den(?:y|ies|ied|ial)|refut(?:e|es|ed)|rescinds?|cancel(?:s|l?ed|lation|l?ing)?|postpon(?:e(?:s|d)?|ement|ing))\b/i

/** Corrections and reversals may share a wire dedup family with the original report, but suppressing them
 * as publisher copies would hide exactly the row that can falsify a thesis. Keep one canonical correction
 * and one canonical reversal lane per family; ordinary rewrites remain one observation. */
function revisionLane(item: ThemeStoryIdentity): '' | 'correction' | 'reversal' {
  const headline = String((typeof item.headline_en === 'string' && item.headline_en.trim()) || item.headline || '')
  const eventTypes = Array.isArray(item.event_types) ? item.event_types.map(String) : []
  if (REVERSAL_RE.test(headline)) return 'reversal'
  if (CORRECTION_RE.test(headline) || eventTypes.includes('accounting_restatement')) return 'correction'
  return ''
}

export function themeStoryKey(item: ThemeStoryIdentity): string {
  const group = typeof item?.dedup_group === 'string' ? item.dedup_group.trim() : ''
  const lane = revisionLane(item)
  if (group) return lane ? `${group}:${lane}` : group
  const event = typeof item?.event_id === 'string' ? item.event_id.trim() : ''
  if (event) return lane ? `${event}:${lane}` : event
  // Runtime ledger compatibility only: well-formed engine rows always carry event_id. Keeping a bounded
  // headline fallback prevents several malformed rows from collapsing into one empty-string family.
  const headline = String(item?.headline || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ')
  return headline ? `headline:${headline}` : ''
}
