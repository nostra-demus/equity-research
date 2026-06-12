// The cheap brain. One Groq chat-completion scores a BATCH of article titles against an approximation
// of the gauntlet's materiality rubric (signal-gate/MODULE_RULES.md). Batching + JSON mode keep it
// fast and token-cheap; the score it returns is an explicit PRE-score that decides inbox membership
// and ranking only — the authoritative materiality score still comes from the Claude gauntlet when a
// human promotes the row. GDELT gives titles (no body), so triage is title-only by design.

import type { Band, CompanyGuess, NewsItem, SizeBucket, Triage } from '../types'

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
companies: up to 3 companies the headline is mainly about, each {"name":"...","ticker":"..."|null,"listing_country":"XX"|null}. These are GUESSES from the headline alone — use null whenever unsure; use [] for macro/sector items that name no company. Never invent a ticker.
size_bucket: rough size of the MAIN company: "mega" (>$200B market value) | "large" ($10-200B) | "mid" ($2-10B) | "small" (<$2B) | "unknown". Use "unknown" when no company is named or you are unsure.

Return ONLY JSON: {"items":[{"i":<index>,"relevance":"material|relevant_non_material|irrelevant","materiality_pre_score":<int>,"event_types":[...],"issuer_linkage":"primary|secondary|sector|macro","why":"...","companies":[{"name":"...","ticker":null,"listing_country":null}],"size_bucket":"unknown"}]}. Include every index exactly once.`

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

/** Rough token estimate for the budget pre-check (input titles + structured output + overhead).
 *  Per-item cost rose with the companies/size_bucket fields. */
export function estimateTokens(itemCount: number): number {
  return 450 + itemCount * 190
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

const SIZE_BUCKETS: SizeBucket[] = ['mega', 'large', 'mid', 'small', 'unknown']
const TICKER_RE = /^[A-Z0-9.\-]{1,12}$/i

// Every field coerces to a safe default, so model drift degrades to "unknown" — never a crash,
// never a dropped batch. Exported for the test suite.
export function coerceTriage(raw: any): Triage {
  const rel = ['material', 'relevant_non_material', 'irrelevant'].includes(raw?.relevance) ? raw.relevance : 'relevant_non_material'
  const link = ['primary', 'secondary', 'sector', 'macro'].includes(raw?.issuer_linkage) ? raw.issuer_linkage : 'sector'
  let score = Number(raw?.materiality_pre_score)
  if (!Number.isFinite(score)) score = 0
  score = Math.max(0, Math.min(100, Math.round(score)))
  const types = Array.isArray(raw?.event_types) ? raw.event_types.filter((t: any) => EVENT_TYPES.includes(t)) : []
  const companies: CompanyGuess[] = (Array.isArray(raw?.companies) ? raw.companies : [])
    .slice(0, 3)
    .map((c: any): CompanyGuess | null => {
      const name = typeof c?.name === 'string' ? c.name.trim().slice(0, 120) : ''
      if (!name) return null
      const ticker = typeof c?.ticker === 'string' && TICKER_RE.test(c.ticker.trim()) ? c.ticker.trim().toUpperCase() : null
      const country = typeof c?.listing_country === 'string' && /^[A-Za-z]{2}$/.test(c.listing_country.trim()) ? c.listing_country.trim().toUpperCase() : null
      return { name, ticker, listing_country: country }
    })
    .filter((c: CompanyGuess | null): c is CompanyGuess => c !== null)
  const size: SizeBucket = SIZE_BUCKETS.includes(raw?.size_bucket) ? raw.size_bucket : 'unknown'
  return {
    relevance: rel,
    materiality_pre_score: score,
    event_types: types,
    issuer_linkage: link,
    why: typeof raw?.why === 'string' ? raw.why.trim().slice(0, 280) : '',
    companies,
    size_bucket: size,
  }
}

/**
 * Triage one batch. Never throws. Transient failures (429/5xx/network) get ONE retry with backoff;
 * an output truncated at max_tokens is reported as such (finish_reason 'length') and NOT retried —
 * it's deterministic, the fix is a smaller batch or a bigger token budget. On ok:false the caller
 * must treat the batch as UNSCORED (defer it), never as scored-zero.
 */
export async function triageBatch(
  items: NewsItem[],
  opts: TriageOptions,
  fetchFn: typeof fetch = fetch,
  sleep: (ms: number) => Promise<void> = (ms) => new Promise((r) => setTimeout(r, ms)),
): Promise<TriageResult> {
  const byIndex = new Map<number, Triage>()
  if (!items.length) return { byIndex, requests: 0, tokens: 0, ok: true }
  if (!opts.apiKey) return { byIndex, requests: 0, tokens: 0, ok: false, note: 'no GROQ_API_KEY' }

  let requests = 0
  let tokens = 0
  let lastNote = 'groq fetch error'
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const res = await fetchFn(`${opts.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${opts.apiKey}` },
        body: JSON.stringify({
          model: opts.model,
          temperature: 0.1,
          max_tokens: opts.maxTokens ?? 2000,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: SYSTEM },
            { role: 'user', content: buildUserMessage(items) },
          ],
        }),
      })
      requests++
      if (!res.ok) {
        const body = await res.text().catch(() => '')
        lastNote = `groq HTTP ${res.status}${body ? ': ' + body.slice(0, 120) : ''}`
        const transient = res.status === 429 || res.status >= 500
        if (transient && attempt < 2) {
          await sleep(1500 * attempt)
          continue
        }
        return { byIndex, requests, tokens, ok: false, note: lastNote }
      }
      const data: any = await res.json()
      const used = Number(data?.usage?.total_tokens) || estimateTokens(items.length)
      tokens += used
      // a max_tokens truncation is deterministic — report it loudly instead of half-parsing
      if (data?.choices?.[0]?.finish_reason === 'length') {
        return { byIndex, requests, tokens, ok: false, note: 'groq: output truncated at max_tokens — lower NEWS_TRIAGE_BATCH or raise NEWS_TRIAGE_MAX_TOKENS' }
      }
      const content = data?.choices?.[0]?.message?.content
      if (typeof content !== 'string') return { byIndex, requests, tokens, ok: false, note: 'groq: empty content' }
      let parsed: any
      try { parsed = JSON.parse(content) } catch { return { byIndex, requests, tokens, ok: false, note: 'groq: non-JSON content' } }
      const arr: any[] = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.items) ? parsed.items : []
      for (const row of arr) {
        const i = Number(row?.i)
        if (Number.isInteger(i) && i >= 0 && i < items.length && !byIndex.has(i)) byIndex.set(i, coerceTriage(row))
      }
      return { byIndex, requests, tokens, ok: true }
    } catch (e: any) {
      requests++
      lastNote = e?.message || 'groq fetch error'
      if (attempt < 2) await sleep(1500 * attempt)
    }
  }
  return { byIndex, requests, tokens, ok: false, note: lastNote }
}
