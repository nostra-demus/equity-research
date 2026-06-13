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

// ============================================================================
// Article-BODY read — the on-demand enrichment pass. The cheap triage above is title-only; this reads
// the fetched article body (one Groq call per opened event, cached) and returns a decision-ready brief:
// the real crux, firms-only companies with their role, who gains / who's exposed (named vs inferred
// group), and a corrected theme. Designed from a 50-article audit of the failure modes.
// ============================================================================

export type CompanyRole = 'subject' | 'acquirer' | 'target' | 'forecaster' | 'mentioned'
export interface ArticleCompany { name: string; ticker: string | null; role: CompanyRole }
export interface ArticleParty { name: string; named_in_article: boolean; basis: string }
export interface ArticleBrief {
  gist: string[] // 2-4 plain bullets, the crux
  companies: ArticleCompany[] // investable firms only, each with its role
  beneficiaries: ArticleParty[] // who gains (named firm or an inferred group, flagged)
  exposed: ArticleParty[] // who's at risk
  theme: string // corrected single event-type
}

const ARTICLE_SYSTEM = `You are a buy-side analyst's reading assistant. You are given the BODY TEXT of one news article (not just its headline). Extract a compact, decision-ready brief.

Return ONLY this JSON:
{"gist":["...","..."],"companies":[{"name":"...","ticker":null,"role":"subject|acquirer|target|forecaster|mentioned"}],"beneficiaries":[{"name":"...","named_in_article":true,"basis":"..."}],"exposed":[{"name":"...","named_in_article":true,"basis":"..."}],"theme":"<tag>"}

GIST — 2 to 4 short bullets carrying the REAL crux a portfolio manager needs: the number, threshold, call, or change that is the point of the story. Lead with the punchline, not the setup (e.g. "sees 50-75bp of rate hikes and 5% FY27 CPI", not the CPI sub-components). Plain English, short sentences. Every number you state must be in the body. No hype words (robust, strong, well-positioned, attractive, best-in-class). If the body is boilerplate, a cookie/ad notice, an "about us" page, or a login wall with no story, return gist [] and set theme to your best guess.
If a story is contested or two-sided, the gist must state BOTH sides (do not echo a one-sided headline).

COMPANIES — INVESTABLE FIRMS ONLY. A company issues equity or debt. NEVER list: a country, nationality, region, state or city (India, China, Thailand, Haryana); a market index or rate (S&P 500, Nifty, Euribor); a government body, regulator, central bank or agency (Fed, ECB, RBI, SEBI, ESMA, SEC, DOJ, European Commission, OPEC, Ministry of X); a generic placeholder ("major tyre maker", "startups"). Give each firm a role: subject (the firm the story is about) | acquirer/target (M&A) | forecaster (a bank/analyst MAKING a call — NOT a party that gains) | mentioned.

BENEFICIARIES / EXPOSED — who GAINS and who's AT RISK. If the article NAMES specific firms, list them with named_in_article=true and a one-clause basis. If it points only to a sector/group, give the group with named_in_article=false. If it supports neither, return []. NEVER invent a named beneficiary the body doesn't support (do not guess "Capital One" off a generic consumer-credit piece). A forecaster (ICICI, JPMorgan, Pimco, Goldman) is never a beneficiary.

THEME — choose exactly one, by what the story IS: earnings_revenue_margin | guidance_change | mna | capital_actions | debt_credit | litigation_enforcement | regulatory | management | product | commercial | operations | cybersecurity | macro_sector | policy | rumor.
Rules: guidance_change ONLY means a company changing its OWN forecast — a central-bank rate path, inflation/GDP print, war/geopolitics, oil move, country capex or trade-bloc story is macro_sector. An IPO/SPAC/listing/buyback/dividend/raise is capital_actions, NOT mna ("Acquisition" in a shell's name does not make an 8-K an M&A event). A government/regulator/court action that sets rules (sanctions, tariffs, antitrust, trade pacts, scheme approvals) is regulatory or policy. Use rumor only when the article itself cites unnamed sources.`

const ROLES: CompanyRole[] = ['subject', 'acquirer', 'target', 'forecaster', 'mentioned']
const str = (v: unknown, max = 200): string => (typeof v === 'string' ? v.trim().slice(0, max) : '')

function coerceParty(raw: any): ArticleParty | null {
  const name = str(raw?.name, 120)
  if (!name) return null
  return { name, named_in_article: raw?.named_in_article !== false, basis: str(raw?.basis, 160) }
}

/** Coerce the model's JSON into a safe ArticleBrief. Exported for tests. */
export function coerceArticleBrief(raw: any): ArticleBrief {
  const gist = (Array.isArray(raw?.gist) ? raw.gist : []).map((g: any) => str(g, 280)).filter(Boolean).slice(0, 4)
  const companies: ArticleCompany[] = (Array.isArray(raw?.companies) ? raw.companies : [])
    .map((c: any): ArticleCompany | null => {
      const name = str(c?.name, 120)
      if (!name) return null
      const ticker = typeof c?.ticker === 'string' && TICKER_RE.test(c.ticker.trim()) ? c.ticker.trim().toUpperCase() : null
      const role: CompanyRole = ROLES.includes(c?.role) ? c.role : 'mentioned'
      return { name, ticker, role }
    })
    .filter((c: ArticleCompany | null): c is ArticleCompany => c !== null)
    .slice(0, 8)
  const beneficiaries = (Array.isArray(raw?.beneficiaries) ? raw.beneficiaries : []).map(coerceParty).filter(Boolean).slice(0, 6) as ArticleParty[]
  const exposed = (Array.isArray(raw?.exposed) ? raw.exposed : []).map(coerceParty).filter(Boolean).slice(0, 6) as ArticleParty[]
  const theme = typeof raw?.theme === 'string' ? raw.theme.trim().toLowerCase().replace(/[^a-z_]/g, '') : ''
  return { gist, companies, beneficiaries, exposed, theme }
}

/**
 * One Groq call over an article body → an ArticleBrief. Never throws. Returns brief=null on no-key,
 * transient failure (one retry), truncation, or non-JSON — the caller then degrades to the regex summary.
 */
export async function analyzeArticle(
  body: string,
  headline: string,
  opts: TriageOptions,
  fetchFn: typeof fetch = fetch,
  sleep: (ms: number) => Promise<void> = (ms) => new Promise((r) => setTimeout(r, ms)),
): Promise<{ brief: ArticleBrief | null; tokens: number; note?: string }> {
  if (!opts.apiKey) return { brief: null, tokens: 0, note: 'no GROQ_API_KEY' }
  const text = String(body || '').slice(0, 6000)
  if (text.replace(/\s+/g, ' ').trim().length < 80) return { brief: null, tokens: 0, note: 'body too thin to read' }
  const user = `HEADLINE: ${headline}\n\nARTICLE BODY:\n${text}`
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
          max_tokens: opts.maxTokens ?? 900,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: ARTICLE_SYSTEM },
            { role: 'user', content: user },
          ],
        }),
      })
      if (!res.ok) {
        const t = await res.text().catch(() => '')
        lastNote = `groq HTTP ${res.status}${t ? ': ' + t.slice(0, 120) : ''}`
        if ((res.status === 429 || res.status >= 500) && attempt < 2) { await sleep(1200 * attempt); continue }
        return { brief: null, tokens, note: lastNote }
      }
      const data: any = await res.json()
      tokens += Number(data?.usage?.total_tokens) || 0
      if (data?.choices?.[0]?.finish_reason === 'length') return { brief: null, tokens, note: 'groq: output truncated' }
      const content = data?.choices?.[0]?.message?.content
      if (typeof content !== 'string') return { brief: null, tokens, note: 'groq: empty content' }
      let parsed: any
      try { parsed = JSON.parse(content) } catch { return { brief: null, tokens, note: 'groq: non-JSON content' } }
      return { brief: coerceArticleBrief(parsed), tokens }
    } catch (e: any) {
      lastNote = e?.message || 'groq fetch error'
      if (attempt < 2) await sleep(1200 * attempt)
    }
  }
  return { brief: null, tokens, note: lastNote }
}
