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

/** Parse the exact evidence locator instead of accepting a URL-shaped prefix. `https://` and similar
 * hostless strings pass a regex but cannot take a PM back to the cited source. Preserve the supplied URL
 * text for display/audit after proving it is an absolute HTTP(S) locator with a non-empty hostname. */
export function exactThemeEvidenceUrl(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim()) return null
  const raw = value.trim()
  try {
    const parsed = new URL(raw)
    if ((parsed.protocol !== 'http:' && parsed.protocol !== 'https:') || !parsed.hostname.trim()) return null
    return raw
  } catch {
    return null
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
  return source && Boolean(exactThemeEvidenceUrl(member.url))
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
