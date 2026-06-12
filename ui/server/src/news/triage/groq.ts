// The cheap brain. One Groq chat-completion scores a BATCH of article titles against an approximation
// of the gauntlet's materiality rubric (signal-gate/MODULE_RULES.md). Batching + JSON mode keep it
// fast and token-cheap; the score it returns is an explicit PRE-score that decides inbox membership
// and ranking only — the authoritative materiality score still comes from the Claude gauntlet when a
// human promotes the row. GDELT gives titles (no body), so triage is title-only by design.

import type { NewsItem, Triage, Band } from '../types'

// The fixed event-type vocabulary the gauntlet uses (signal_payload.schema.json). We pass it to the
// model so its tags line up with what downstream expects.
const EVENT_TYPES = [
  'earnings_revenue_margin', 'guidance_change', 'mna', 'capital_actions', 'debt_credit',
  'litigation_enforcement', 'regulatory', 'management', 'product', 'commercial', 'operations',
  'cybersecurity', 'macro_sector', 'rumor',
]

const SYSTEM = `You are a buy-side news triage filter. For each headline decide whether it could change an investment decision, and how much.

An item is MATERIAL only if it plausibly can: move revenue / margins / cash flow / capital structure; alter regulatory, legal or operational risk; affect management credibility; shift supply / demand; or move analyst expectations. Routine recaps, opinion, and price chatter are NOT material.

Score materiality_pre_score 0-100:
- 70-90: a clear company- or economy-moving event (rate decision, big M&A, guidance cut, default, enforcement action, supply shock) from an official or primary source.
- 45-69: real but smaller, indirect, sector-level, or not yet confirmed.
- 0-44: not material (recap, opinion, lifestyle, sport, generic market color).
Be skeptical: most headlines are 0-44. Reserve 70+ for genuinely decision-changing news.

event_types: choose from ${EVENT_TYPES.join(', ')}.
issuer_linkage: primary (names one company), secondary (a supplier/customer/peer), sector (an industry), macro (economy-wide).
why: ONE plain sentence, with a number where the headline gives one. No hype words.

Return ONLY JSON: {"items":[{"i":<index>,"relevance":"material|relevant_non_material|irrelevant","materiality_pre_score":<int>,"event_types":[...],"issuer_linkage":"primary|secondary|sector|macro","why":"..."}]}. Include every index exactly once.`

export interface TriageOptions {
  model: string
  baseUrl: string
  apiKey: string
  maxTokens?: number
}

export interface TriageResult {
  byIndex: Map<number, Triage>
  requests: number
  tokens: number
  ok: boolean
  note?: string
}

/** Rough token estimate for the budget pre-check (input titles + structured output + overhead). */
export function estimateTokens(itemCount: number): number {
  return 450 + itemCount * 130
}

export function scoreToBand(score: number, pickThreshold: number, watchThreshold: number): Band {
  if (score >= pickThreshold) return 'pick'
  if (score >= watchThreshold) return 'watch'
  return 'drop'
}

function buildUserMessage(items: NewsItem[]): string {
  const lines = items.map((it, i) => `${i}. [${it.source_name} · ${it.region}] ${it.headline}`)
  return `Score these ${items.length} headlines:\n${lines.join('\n')}`
}

function coerceTriage(raw: any): Triage {
  const rel = ['material', 'relevant_non_material', 'irrelevant'].includes(raw?.relevance) ? raw.relevance : 'relevant_non_material'
  const link = ['primary', 'secondary', 'sector', 'macro'].includes(raw?.issuer_linkage) ? raw.issuer_linkage : 'sector'
  let score = Number(raw?.materiality_pre_score)
  if (!Number.isFinite(score)) score = 0
  score = Math.max(0, Math.min(100, Math.round(score)))
  const types = Array.isArray(raw?.event_types) ? raw.event_types.filter((t: any) => EVENT_TYPES.includes(t)) : []
  return {
    relevance: rel,
    materiality_pre_score: score,
    event_types: types,
    issuer_linkage: link,
    why: typeof raw?.why === 'string' ? raw.why.trim().slice(0, 280) : '',
  }
}

/**
 * Triage one batch with a single Groq call. Never throws — a transport or parse failure returns
 * ok:false with an empty map so the cycle can carry on (those items simply aren't scored this round).
 */
export async function triageBatch(items: NewsItem[], opts: TriageOptions, fetchFn: typeof fetch = fetch): Promise<TriageResult> {
  const byIndex = new Map<number, Triage>()
  if (!items.length) return { byIndex, requests: 0, tokens: 0, ok: true }
  if (!opts.apiKey) return { byIndex, requests: 0, tokens: 0, ok: false, note: 'no GROQ_API_KEY' }

  try {
    const res = await fetchFn(`${opts.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${opts.apiKey}` },
      body: JSON.stringify({
        model: opts.model,
        temperature: 0.1,
        max_tokens: opts.maxTokens ?? 1400,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM },
          { role: 'user', content: buildUserMessage(items) },
        ],
      }),
    })
    const tokens = 0
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      return { byIndex, requests: 1, tokens, ok: false, note: `groq HTTP ${res.status}${body ? ': ' + body.slice(0, 120) : ''}` }
    }
    const data: any = await res.json()
    const used = Number(data?.usage?.total_tokens) || estimateTokens(items.length)
    const content = data?.choices?.[0]?.message?.content
    if (typeof content !== 'string') return { byIndex, requests: 1, tokens: used, ok: false, note: 'groq: empty content' }
    let parsed: any
    try { parsed = JSON.parse(content) } catch { return { byIndex, requests: 1, tokens: used, ok: false, note: 'groq: non-JSON content' } }
    const arr: any[] = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.items) ? parsed.items : []
    for (const row of arr) {
      const i = Number(row?.i)
      if (Number.isInteger(i) && i >= 0 && i < items.length && !byIndex.has(i)) byIndex.set(i, coerceTriage(row))
    }
    return { byIndex, requests: 1, tokens: used, ok: true }
  } catch (e: any) {
    return { byIndex, requests: 1, tokens: 0, ok: false, note: e?.message || 'groq fetch error' }
  }
}
