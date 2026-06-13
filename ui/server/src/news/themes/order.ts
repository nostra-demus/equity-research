// First / second / third-order placement for a theme's companies — a deterministic reuse of the
// gauntlet beneficiary-map's 4×25 impact rubric (.claude/agents/screener/thesis-structure/
// 03_beneficiary-map.md): directness / magnitude / speed / reversibility (0–25 each) → composite →
// the SAME primary(≥75)/secondary(60–74)/parked(<60) tiers, renamed order 1/2/3 (direct → ripple).
//
// MVP derives the four sub-scores from signals already on the member items (issuer_linkage,
// mention_count, member triage_score, the dominant event type). It cannot reliably tell beneficiary
// from harmed on a headline alone, so `side` defaults to 'mixed' — the periodic Claude discovery pass
// refines side + adds the RIPPLE names a headline-only read can't see (the true 2nd/3rd order).

import type { Impact, ImpactSide, OrderTier } from './types'

export interface OrderSignals {
  mention_count: number // how many of the theme's members name this company (centrality)
  avg_score: number // 0–100, mean member triage_score for items naming it (materiality)
  dominant_linkage: 'primary' | 'secondary' | 'sector' | 'macro' | ''
  dominant_event_type: string // '' when none
}

const FAST_EVENTS = new Set(['mna', 'guidance_change', 'debt_credit', 'capital_actions', 'litigation_enforcement'])
const MID_EVENTS = new Set(['earnings_revenue_margin', 'regulatory', 'management', 'product', 'commercial', 'cybersecurity'])
const PERMANENT_EVENTS = new Set(['mna', 'debt_credit', 'litigation_enforcement', 'management', 'regulatory'])
const MEDIUM_REV_EVENTS = new Set(['capital_actions', 'guidance_change', 'product', 'cybersecurity', 'earnings_revenue_margin'])

const clamp25 = (n: number) => Math.max(0, Math.min(25, Math.round(n)))

export function orderTierFor(composite: number): OrderTier {
  if (composite >= 75) return 1
  if (composite >= 60) return 2
  return 3
}

/** Score one company's impact within a theme and place it in an order tier. */
export function companyImpact(s: OrderSignals): { impact: Impact; order: OrderTier; side: ImpactSide } {
  // directness — how directly the theme's news points at this company
  const linkageBase = s.dominant_linkage === 'primary' ? 22 : s.dominant_linkage === 'secondary' ? 14 : s.dominant_linkage === 'sector' ? 8 : s.dominant_linkage === 'macro' ? 5 : 12
  const directness = clamp25(linkageBase + Math.min(3, Math.max(0, s.mention_count - 1)))

  // magnitude — materiality of the news naming it
  const magnitude = clamp25((Math.max(0, Math.min(100, s.avg_score)) / 100) * 25)

  // speed — how fast the dominant event plays out
  const ev = s.dominant_event_type
  const speed = clamp25(FAST_EVENTS.has(ev) ? 22 : MID_EVENTS.has(ev) ? 15 : ev ? 8 : 12)

  // reversibility — structurally permanent effects score high (harder to fade)
  const reversibility = clamp25(PERMANENT_EVENTS.has(ev) ? 22 : MEDIUM_REV_EVENTS.has(ev) ? 16 : ev ? 10 : 12)

  const composite = directness + magnitude + speed + reversibility
  return {
    impact: { directness, magnitude, speed, reversibility, composite },
    order: orderTierFor(composite),
    side: 'mixed', // refined by the Claude discovery pass (beneficiary vs harmed)
  }
}
