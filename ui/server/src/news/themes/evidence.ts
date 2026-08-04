// Shared evidence boundary for the Themes compiler and every read-time projection. A model-provided
// event_id is only a pointer: the row still has to resolve to a real member with a source clock and exact
// publisher/URL provenance. Keeping this in one module prevents compile-time admission and read-time
// qualification from quietly applying different standards.

import type { ThemeMember } from './types'

export const SUPPORTING_SOURCE_TIERS = new Set(['primary_filing', 'official_data', 'company', 'news'])

export const sourcePriority = (tier: unknown): number => {
  switch (String(tier || '').toLowerCase()) {
    case 'primary_filing': return 5
    case 'official_data': return 4
    case 'company': return 3
    case 'news': return 2
    case 'unconfirmed': return 1
    default: return 0
  }
}

/** Exact provenance means the event resolves to a dated, non-empty source row and carries the same
 * publisher + URL pair the PM surface and Ideas launcher require. A source label without a locator is not
 * auditable from the product, while a bare URL with no named provenance cannot satisfy the citation
 * contract. Keep this one boundary identical across qualification, presentation, and promotion. */
export function hasExactThemeProvenance(member: ThemeMember | null | undefined): member is ThemeMember {
  if (!member || typeof member.event_id !== 'string' || !member.event_id.trim()) return false
  if (typeof member.found_at !== 'string' || !Number.isFinite(Date.parse(member.found_at))) return false
  const headline = String((typeof member.headline_en === 'string' && member.headline_en.trim()) || member.headline || '').trim()
  if (!headline) return false
  const source = typeof member.source_name === 'string' && Boolean(member.source_name.trim())
  const url = typeof member.url === 'string' && /^https?:\/\//i.test(member.url.trim())
  return source && url
}

/** Only sourced filing/official/company/news rows can increase support or clear an expression gate. */
export function isSupportingThemeEvidence(member: ThemeMember | null | undefined): member is ThemeMember {
  return hasExactThemeProvenance(member) && SUPPORTING_SOURCE_TIERS.has(String(member.tier || '').toLowerCase())
}

/** A challenge is disconfirming information, not corroboration. Preserve and display even unconfirmed
 * rows so long as their exact source is known; they cap conviction but can never add support. */
export function isDisplayableThemeChallenge(member: ThemeMember | null | undefined): member is ThemeMember {
  return hasExactThemeProvenance(member) && String(member.tier || '').toLowerCase() !== 'social'
}
