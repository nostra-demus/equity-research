import type { NewsChatEvidence, NewsChatReceipt } from './types'

const words = (value: string) => new Set(value.toLowerCase().match(/[\p{L}\p{N}]+/gu) || [])

/** Choose the cited row that most clearly states the user's subject in its visible headline. */
export function selectNewsChatHandoffEvidence(
  evidence: NewsChatEvidence[],
  receipt: NewsChatReceipt | undefined,
): NewsChatEvidence | undefined {
  if (!evidence.length) return undefined
  // The handoff note describes the strict top candidate only. Preferring evidence from every candidate
  // could seed Gate 0 with candidate B while the note and score still describe candidate A.
  const candidateRefs = new Set(receipt?.tradeCandidates?.[0]?.evidenceRefs || [])
  const queryTerms = receipt?.queryTerms || []
  return [...evidence].sort((a, b) => {
    const score = (row: NewsChatEvidence) => {
      const headline = words(row.item.headline_en || row.item.headline || '')
      const headlineHits = queryTerms.filter((term) => headline.has(term.toLowerCase())).length
      const exactReasons = (row.whyMatched || []).filter((reason) => reason.startsWith('exact:')).length
      return (candidateRefs.has(row.ref) ? 1_000 : 0) + headlineHits * 30 + exactReasons + (row.historical ? -10 : 0)
    }
    return score(b) - score(a) || a.ref.localeCompare(b.ref)
  })[0]
}
