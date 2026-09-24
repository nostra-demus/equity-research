export const RESEARCH_AUDIT_ATTEMPT_MARKERS = new Set(['.evidence_repair_attempted.json', '.audit_reconciliation_attempted.json'])

// Runtime mirror of scripts/research_audit_outcome.py. Called only after the full
// audit identities, schemas and input digests have passed manifest validation.
const START = '<!-- research-review:start -->'
const END = '<!-- research-review:end -->'
const WARNING_HEADER = '> ⚠️ **PROVISIONAL — the automated finish-gate found an integrity issue; this thesis was committed UNVERIFIED.**'

export function researchAuditFields(decision: Record<string, any>, audits: Record<string, any>): Record<string, any> | null {
  const pm = audits.pre_mortem, eg = audits.expectations_gap
  if (typeof decision.decision !== 'string' || !decision.decision.trim()) return null
  const confidence = decision.confidence_score
  if (typeof confidence !== 'number' || !Number.isFinite(confidence) || confidence < 0 || confidence > 100
    || Math.abs(pm.original_confidence - confidence) > 0.05 || pm.recommended_confidence > confidence) return null
  const baskets: Record<string, string> = { 'Strong Buy': 'Selected', Buy: 'Selected', 'Starter Position Only': 'Selected',
    Watchlist: 'Watchlist', Avoid: 'Rejected', 'Short Candidate': 'Short', 'Pair Trade / Hedge Required': 'Pair Trade',
    'Insufficient Data — Refuse To Rate': 'Insufficient Data' }
  const ranks: Record<string, number> = { Avoid: 0, 'Insufficient Data — Refuse To Rate': -1, Watchlist: 1, 'Starter Position Only': 2, Buy: 3, 'Strong Buy': 4 }
  let effective = decision.decision
  if (!Object.hasOwn(baskets, effective)) return null
  if (!pm.survives && ['Selected', 'Short', 'Pair Trade'].includes(baskets[effective])) effective = 'Watchlist'
  const cap = pm.recommended_rating_cap.trim().replace(/^cap at /i, '')
  if (cap && !Object.hasOwn(ranks, cap)) return null
  for (const restriction of [cap, decision.post_mortem_decision]) {
    if (Object.hasOwn(ranks, restriction)) {
      if (!Object.hasOwn(ranks, effective) && ranks[restriction] > 1) return null
      if (ranks[restriction] < (ranks[effective] ?? 4)) effective = restriction
    }
  }
  const basket = effective === 'Pair Trade / Hedge Required' && decision.decision === effective && decision.basket === 'Watchlist' ? 'Watchlist' : baskets[effective]
  return {
    pre_mortem_verdict: pm.verdict,
    confidence_haircut: pm.confidence_haircut,
    post_review_confidence_score: pm.recommended_confidence,
    post_mortem_decision: effective,
    post_mortem_basket: basket,
    post_review_edge_score: eg.edge_score,
    post_review_variant_perception_quality: eg.variant_perception_quality,
    post_review_is_exploitable: eg.is_exploitable,
  }
}

export function researchReviewBlock(decision: Record<string, any>, audits: Record<string, any>): string | null {
  const fields = researchAuditFields(decision, audits)
  if (!fields) return null
  const verification = audits.verification
  const score = (value: number) => (Math.round(value * 100) / 100).toFixed(2).replace(/0+$/, '').replace(/\.$/, '')
  return [
    START,
    '> **Final audit outcome**',
    `> Evidence check: **${verification.verdict}**.`,
    `> Decision after review: **${fields.post_mortem_decision}**. Confidence after review: **${score(fields.post_review_confidence_score)}/100** (original ${score(decision.confidence_score)}/100).`,
    `> Independent edge check: **${fields.post_review_variant_perception_quality}**, ${score(fields.post_review_edge_score)}/100; exploitable: **${fields.post_review_is_exploitable ? 'yes' : 'no'}**.`,
    '> These final review results take precedence over the original synthesis scores and decision quoted below.',
    END,
  ].join('\n')
}

export function researchAuditsReconciled(decision: Record<string, any>, thesis: string, audits: Record<string, any>): boolean {
  const fields = researchAuditFields(decision, audits)
  const block = researchReviewBlock(decision, audits)
  if (!fields || !block || Object.entries(fields).some(([key, value]) => decision[key] !== value)) return false
  if (thesis.split(START).length !== 2 || thesis.split(END).length !== 2 || !thesis.slice(0, 6000).includes(block)) return false
  const adverse = !['Clean', 'Minor issues'].includes(audits.verification.verdict)
  if (adverse && decision.integrity_gate?.status !== 'provisional') return false
  if (adverse || decision.integrity_gate?.status === 'provisional') {
    const tail = thesis.slice(WARNING_HEADER.length)
    const warning = /^\n(?:>[^\n]*\n)+\n/.exec(tail)?.[0]
    if (!thesis.startsWith(WARNING_HEADER) || !warning?.includes('Resolve the flagged items')) return false
  }
  return true
}
