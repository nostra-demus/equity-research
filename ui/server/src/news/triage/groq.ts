// The cheap brain. One Groq chat-completion scores a BATCH of article titles against an approximation
// of the gauntlet's materiality rubric (signal-gate/MODULE_RULES.md). Batching + JSON mode keep it
// fast and token-cheap; the score it returns is an explicit PRE-score that decides inbox membership
// and ranking only — the authoritative materiality score still comes from the Claude gauntlet when a
// human promotes the row. GDELT gives titles (no body), so triage is title-only by design.

import { isRegion } from '../geo'
import type { Band, CompanyGuess, NewsItem, SizeBucket, Triage } from '../types'
import type { RateInfo } from './budget'

/** Parse Groq's reset/retry duration strings to ms: "7.66s", "1m30s", "2m59.56s", "120ms", or bare seconds. */
export function durToMs(s: string | null | undefined): number | undefined {
  if (!s) return undefined
  const str = String(s).trim()
  if (/^\d+(\.\d+)?$/.test(str)) return Math.round(parseFloat(str) * 1000) // bare seconds (retry-after)
  const parts = str.match(/\d+(?:\.\d+)?(?:ms|s|m|h)/g)
  if (!parts) return undefined
  let ms = 0
  for (const p of parts) {
    const v = parseFloat(p)
    if (p.endsWith('ms')) ms += v
    else if (p.endsWith('h')) ms += v * 3_600_000
    else if (p.endsWith('m')) ms += v * 60_000
    else ms += v * 1000
  }
  return Math.round(ms)
}

/** Read Groq's x-ratelimit-* + retry-after headers off a response. Per Groq's docs: limit/remaining-
 *  tokens are PER-MINUTE; remaining-requests is the DAILY request budget. */
export function parseRate(res: { headers?: { get(k: string): string | null } }): RateInfo {
  const h = (k: string) => res?.headers?.get?.(k) ?? null
  const num = (k: string) => { const v = Number(h(k)); return Number.isFinite(v) ? v : undefined }
  return {
    tpmLimit: num('x-ratelimit-limit-tokens'),
    tpmRemaining: num('x-ratelimit-remaining-tokens'),
    tpmResetMs: durToMs(h('x-ratelimit-reset-tokens')),
    rpdRemaining: num('x-ratelimit-remaining-requests'),
    retryAfterMs: durToMs(h('retry-after')),
  }
}

// The fixed event-type vocabulary the gauntlet uses (signal_payload.schema.json). We pass it to the
// model so its tags line up with what downstream expects.
const EVENT_TYPES = [
  'earnings_revenue_margin', 'guidance_change', 'mna', 'capital_actions', 'debt_credit',
  'litigation_enforcement', 'regulatory', 'management', 'product', 'commercial', 'operations',
  'cybersecurity', 'macro_sector', 'rumor',
]

export const SYSTEM = `You are a buy-side news triage filter. For each headline decide whether it could change an investment decision, and how much.

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
headline_en: if the headline is NOT written in English, a faithful, concise English translation of it — keep company names, tickers and numbers exactly as written, translate only, add no commentary. If the headline IS already English, use null.
headline_lang: when headline_en is non-null, the source language of the original headline, named in English (e.g. "Finnish", "German", "Japanese", "Korean"). If the headline is already English, use null. Be honest: only name a non-English language when the headline genuinely is in it.
event_region: the market the event is ABOUT — where the affected, tradable parties are listed or operate, NOT where the news outlet is based. A South China Morning Post story about Bangladesh and Malaysia is "OTHER", not "CN". One of: "US" | "IN" | "JP" | "GB" | "CN" | "KR" | "GLOBAL" (a worldwide / multi-region event with no single market) | "OTHER" (a real market outside those listed). Use null when the headline gives no location and names no company you can place.

Return ONLY JSON: {"items":[{"i":<index>,"relevance":"material|relevant_non_material|irrelevant","materiality_pre_score":<int>,"event_types":[...],"issuer_linkage":"primary|secondary|sector|macro","why":"...","companies":[{"name":"...","ticker":null,"listing_country":null}],"size_bucket":"unknown","headline_en":null,"headline_lang":null,"event_region":null}]}. Include every index exactly once.`

export interface TriageOptions {
  model: string
  baseUrl: string
  apiKey: string
  maxTokens?: number
  // OpenAI-compatible extras for OpenRouter (ignored by Groq, which never sets them):
  models?: string[] // OpenRouter fallback chain — auto-routes to the first available free model
  headers?: Record<string, string> // extra request headers (e.g. OpenRouter HTTP-Referer / X-Title)
  extraBody?: Record<string, unknown> // extra request-body fields (e.g. OpenRouter reasoning: {effort:'low'})
  // Reliability guards. timeoutMs aborts a single HTTP call that hangs (a stalled provider / dead socket)
  // — without it a hung fetch blocks forever. maxAttempts caps the in-call retry: leave at the default 2
  // for the background ingester (retry the same provider), set to 1 for the user-facing article read
  // (don't retry — fall through to the NEXT provider instead, which is faster and more resilient).
  timeoutMs?: number
  maxAttempts?: number
}

export interface TriageResult {
  byIndex: Map<number, Triage>
  requests: number
  tokens: number
  ok: boolean
  note?: string
  rate?: RateInfo // live rate-limit state from the response headers (drives the adaptive pacer)
}

/** Token estimate for the budget pre-check + per-minute pacer reservation (input titles + structured
 *  output + the ~484-token SYSTEM prompt, fixed per batch). Calibrated to LIVE usage: 12-item batches
 *  measured ~1,554 total tokens (Groq usage headers, Jun 2026), so ~500 fixed + ~90/item lands just
 *  above actual with a safety margin. The OLD 450 + n*190 (=2,730 for 12) over-reserved 76%, so the
 *  6,000-TPM limiter packed only ~2 batches/min when ~3-4 fit — throttling Groq below its real rate.
 *  The adaptive pacer also learns the live ceiling from response headers (budget.ts learn()), which is
 *  the real 429 backstop, so a tight-but-honest estimate is safe and converts directly to throughput. */
export function estimateTokens(itemCount: number): number {
  return 500 + itemCount * 95
}

export function scoreToBand(score: number, pickThreshold: number, watchThreshold: number): Band {
  if (score >= pickThreshold) return 'pick'
  if (score >= watchThreshold) return 'watch'
  return 'drop'
}

export function buildUserMessage(items: NewsItem[]): string {
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
  // raw model text only; whether to KEEP it (non-Latin original, actually rendered to English) is
  // decided downstream by news/lang.ts pickTranslation, which has both the original and this candidate.
  const headline_en = typeof raw?.headline_en === 'string' && raw.headline_en.trim() ? raw.headline_en.trim().slice(0, 200) : null
  // the source language the model named (for the reader's "original · <language>" affordance). Whether the
  // translation is KEPT at all is still decided downstream by news/lang.ts pickTranslation.
  const headline_lang = typeof raw?.headline_lang === 'string' && raw.headline_lang.trim() ? raw.headline_lang.trim().slice(0, 32) : null
  // the market the event is about; a valid Region code or null (unsure). Uppercased first so a lowercase
  // model reply ("other") still validates. news/geo.ts resolveEventRegion decides whether to use it over
  // the domain region at the merge site (runCycle.ts).
  const erRaw = typeof raw?.event_region === 'string' ? raw.event_region.trim().toUpperCase() : raw?.event_region
  const event_region = isRegion(erRaw) ? erRaw : null
  return {
    relevance: rel,
    materiality_pre_score: score,
    event_types: types,
    issuer_linkage: link,
    why: typeof raw?.why === 'string' ? raw.why.trim().slice(0, 280) : '',
    companies,
    size_bucket: size,
    headline_en,
    headline_lang,
    event_region,
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
  const maxAttempts = opts.maxAttempts ?? 2
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await fetchFn(`${opts.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${opts.apiKey}`, ...(opts.headers || {}) },
        signal: AbortSignal.timeout(opts.timeoutMs ?? 30_000), // never let a hung connection block the cycle
        body: JSON.stringify({
          model: opts.model,
          ...(opts.models?.length ? { models: opts.models } : {}), // OpenRouter fallback chain (Groq omits)
          temperature: 0.1,
          max_tokens: opts.maxTokens ?? 2000,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: SYSTEM },
            { role: 'user', content: buildUserMessage(items) },
          ],
          ...(opts.extraBody || {}), // OpenRouter reasoning effort etc. (Groq omits)
        }),
      })
      requests++
      const rate = parseRate(res)
      if (!res.ok) {
        const body = await res.text().catch(() => '')
        lastNote = `groq HTTP ${res.status}${body ? ': ' + body.slice(0, 120) : ''}`
        const transient = res.status === 429 || res.status >= 500
        if (transient && attempt < maxAttempts) {
          await sleep(rate.retryAfterMs || 1500 * attempt)
          continue
        }
        return { byIndex, requests, tokens, ok: false, note: lastNote, rate }
      }
      const data: any = await res.json()
      const used = Number(data?.usage?.total_tokens) || estimateTokens(items.length)
      tokens += used
      // a max_tokens truncation is deterministic — report it loudly instead of half-parsing
      if (data?.choices?.[0]?.finish_reason === 'length') {
        return { byIndex, requests, tokens, ok: false, note: 'groq: output truncated at max_tokens — lower NEWS_TRIAGE_BATCH or raise NEWS_TRIAGE_MAX_TOKENS', rate }
      }
      const content = data?.choices?.[0]?.message?.content
      if (typeof content !== 'string') return { byIndex, requests, tokens, ok: false, note: 'groq: empty content', rate }
      let parsed: any
      try { parsed = JSON.parse(content) } catch { return { byIndex, requests, tokens, ok: false, note: 'groq: non-JSON content', rate } }
      const arr: any[] = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.items) ? parsed.items : []
      for (const row of arr) {
        const i = Number(row?.i)
        if (Number.isInteger(i) && i >= 0 && i < items.length && !byIndex.has(i)) byIndex.set(i, coerceTriage(row))
      }
      return { byIndex, requests, tokens, ok: true, rate }
    } catch (e: any) {
      requests++
      lastNote = e?.name === 'TimeoutError' ? 'groq: request timed out' : e?.message || 'groq fetch error'
      if (attempt < maxAttempts) await sleep(1500 * attempt)
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
export type PartyOrder = 'first' | 'second'
export interface ArticleCompany { name: string; ticker: string | null; role: CompanyRole; listing_country: string | null; exchange: string | null }
// A gainer / exposed party — upgraded from a bare name+blurb to a real transmission read: HOW the event
// reaches its economics (mechanism), roughly how big (magnitude), when it bites (horizon), and whether it's
// directly hit (first-order) or a downstream/substitute (second-order). `mechanism` supersedes the old
// `basis`; coerceParty still reads `basis` so a 12h-old cached brief degrades cleanly, never crashes.
export interface ArticleParty {
  name: string
  named_in_article: boolean
  ticker?: string | null // when the model is confident — makes the row clickable to that name's wire
  listing?: string | null // exchange/country anchor ("NSE: RELIANCE", "United States") — the investability cue
  mechanism: string // the transmission: HOW the event hits this party's revenue / margin / cash flow / cost of capital
  magnitude?: string | null // rough size ONLY where the body supports it ("~12% of revenue", "₹1,800cr"), else null
  horizon?: string | null // when it bites ("this quarter", "12-18m"), else null
  order?: PartyOrder | null // first = directly hit/named; second = downstream/supplier/substitute
}
// Does this event move earnings / guidance / valuation / the thesis / risk / a portfolio decision — the
// structured, quantified sibling of GIST (which just states what happened). Every enum defaults safely
// via coerceNewsImpact so model drift degrades to "unknown/low/no numbers", never a crash or a fabrication.
export type ImpactDirection = 'positive' | 'negative' | 'mixed' | 'neutral' | 'unknown'
export type ImpactMagnitude = 'low' | 'medium' | 'high' | 'critical'
export type AffectedMetric =
  | 'revenue' | 'ebitda' | 'pat_net_income' | 'eps' | 'cash_flow' | 'debt' | 'capex'
  | 'commodity_price' | 'valuation_multiple' | 'regulatory_risk' | 'thesis_quality'
export interface NewsImpact {
  impact_direction: ImpactDirection
  impact_magnitude: ImpactMagnitude
  affected_metric: AffectedMetric[] // multi-select — a profit warning often hits revenue+PAT+EPS at once
  quantified_impact_available: boolean
  extracted_numbers: string[] // verbatim figures pulled from the body — same "must appear in the body" rule as gist
  quick_dirty_calculation: string // "" when not computable; coerceNewsImpact FORCES "" whenever quantified_impact_available is false
  why_it_matters: string // ties the metric change to earnings/guidance/valuation/thesis/risk/a portfolio decision
  analyst_takeaway: string // the one-line takeaway
  confidence: number // 0-100, clamped; 0 when there's no real basis for a verdict
}
export interface ArticleBrief {
  gist: string[] // 2-4 plain bullets, the crux
  market_angle?: string // the single market-moving thread + transmission to asset prices (the "so what")
  companies: ArticleCompany[] // investable firms only, each with its role
  beneficiaries: ArticleParty[] // who gains (named firm or an inferred tradable group, flagged)
  exposed: ArticleParty[] // who's at risk
  whats_priced?: string // the obvious read the market likely already holds (§7 consensus)
  the_edge?: string // a non-obvious angle the body genuinely supports that consensus may miss — empty if none
  watch_item?: string // the single next data point / number that confirms or kills the read
  theme: string // corrected single event-type
  news_impact: NewsImpact // does this move earnings/guidance/valuation/thesis/risk/a portfolio decision — direction, size, numbers, confidence
}

export const ARTICLE_SYSTEM = `You are a buy-side analyst reading ONE news article for a portfolio manager. You are given the article's BODY TEXT (not just the headline). Produce a sharp, decision-ready brief that thinks in TRANSMISSION: event -> what changes in the real economy or a business -> which LISTED, TRADABLE asset moves, in what direction, by roughly how much, over what horizon. Second-level thinking, never a plain summary.

Return ONLY this JSON (use [] or "" or null whenever the body does not support a field — NEVER invent to fill it):
{"gist":["...","..."],"market_angle":"...","companies":[{"name":"...","ticker":null,"listing_country":null,"exchange":null,"role":"subject|acquirer|target|forecaster|mentioned"}],"beneficiaries":[{"name":"...","named_in_article":true,"ticker":null,"listing":null,"mechanism":"...","magnitude":null,"horizon":null,"order":"first|second"}],"exposed":[{"name":"...","named_in_article":true,"ticker":null,"listing":null,"mechanism":"...","magnitude":null,"horizon":null,"order":"first|second"}],"whats_priced":"...","the_edge":"...","watch_item":"...","theme":"<tag>","news_impact":{"impact_direction":"positive|negative|mixed|neutral|unknown","impact_magnitude":"low|medium|high|critical","affected_metric":["revenue|ebitda|pat_net_income|eps|cash_flow|debt|capex|commodity_price|valuation_multiple|regulatory_risk|thesis_quality"],"quantified_impact_available":false,"extracted_numbers":["..."],"quick_dirty_calculation":"...","why_it_matters":"...","analyst_takeaway":"...","confidence":0}}

GIST — 2 to 4 short bullets carrying the REAL crux: the number, threshold, call, or change that is the point. Lead with the punchline, not the setup (e.g. "sees 50-75bp of rate hikes and 5% FY27 CPI", not the CPI sub-components). Plain English, short sentences. Every number you state must appear in the body. No hype words (robust, strong, well-positioned, attractive, best-in-class). If the story is contested or two-sided, state BOTH sides. If the body is boilerplate, a cookie/ad notice, an "about us" page, or a login wall with no story, return gist [] and set theme to your best guess.
For results, separate reported from adjusted and name any one-off behind a beat/miss (tax credit, disposal gain, customer advance) — lead with the underlying number, not the flattered one; margin moves in basis points.
DIGEST RULE: if the article bundles several unrelated items (a wire round-up, a "morning briefing"), lock onto the SINGLE most market-moving thread and brief only that. Ignore the trivia (sport, lifestyle, human-interest) — never let it drive a beneficiary or an exposed party.

MARKET_ANGLE — one or two sentences: the "so what" for a market. Trace the transmission from the event to asset prices. For a macro / policy / commodity / geopolitics story this is the MOST important field (e.g. "A wider Middle-East war risks a crude supply shock: oil producers and tanker owners gain, while oil-importing economies, airlines and paint/tyre makers are squeezed on input costs."). Leave "" only if the story genuinely cannot move any tradable asset.

COMPANIES — INVESTABLE FIRMS ONLY. A firm issues equity or debt. NEVER list: a country, nationality, region, state, city or sports team (India, China, Haryana, "Iran's national team"); a person; a market index or rate (S&P 500, Nifty, Euribor); a government body, regulator, central bank or agency (Fed, ECB, RBI, SEBI, SEC, DOJ, European Commission, OPEC, Ministry of X); a generic placeholder ("major tyre maker", "startups"). Give each firm a role: subject (the firm the story is about) | acquirer/target (M&A) | forecaster (a bank/analyst MAKING a call — NOT a party that gains) | mentioned.
For each firm also give listing_country (the FULL English name of the country of its primary stock listing, e.g. "Brazil", "United States", "India", "Japan", "South Korea") and exchange (the primary exchange where it trades, with its ticker if you are confident, e.g. "B3: PETR3", "NYSE: PBR", "NSE: RELIANCE", "LSE", "Tokyo (TSE)"; a well-known dual listing/ADR may be added, e.g. "B3 (NYSE ADR: PBR)"). These come from your own knowledge of the company, not the article. Use null whenever you are not confident — NEVER guess a listing, ticker or exchange you are unsure of.

BENEFICIARIES / EXPOSED — who GAINS and who is AT RISK, framed as an INVESTMENT with the transmission spelled out:
- INVESTABILITY GATE: every entry must be something a fund can actually hold — a named listed firm, or a tradable sector / group / asset ("oil & gas producers", "Indian private banks", "gold", "US Treasuries"). NEVER list (in EITHER column) a sports team, an individual, a country's citizens, a government, a central bank, a regulator or agency, a market index, or a rate — these are causes or context, not positions. The central bank/regulator is the CAUSE; translate it into the tradable sectors it moves. If only non-tradable parties are affected, return [].
- DIRECTION DISCIPLINE: a beneficiary's economics IMPROVE; an exposed party's economics WORSEN. A fine, penalty, tax, cost increase, ban, recall, or lost revenue is EXPOSURE — it is NEVER a gain. Check the sign before you place a party in a column. When a rule, tax, tariff, or penalty applies to a WHOLE sector, there is no beneficiary — put the sector under exposed and leave beneficiaries []. Only name a rival as a beneficiary when the action is firm-specific AND share genuinely shifts to that named rival. Never invent a winner just to fill the column.
- mechanism: ONE clause stating HOW the event reaches that party's revenue / margin / cash flow / cost of capital — a real causal chain, not a label ("higher crude lifts upstream realisations", not "oil").
- magnitude: a rough size ONLY if the body supports it ("~12% of revenue", "₹1,800cr"), else null. horizon: when it bites ("this quarter", "12-18m"), else null. order: "first" if directly hit/named, "second" if a downstream / supplier / substitute / competitor effect.
- named_in_article=true for a firm the body names; false for an inferred sector/group (still put it in listing as a market where relevant). If the body supports neither side, return []. NEVER invent a named party the body doesn't support (do not guess "Capital One" off a generic consumer-credit piece). A forecaster (ICICI, JPMorgan, Pimco, Goldman) is never a beneficiary.

WHATS_PRICED — one sentence: the obvious read the market has likely already taken (consensus). "" if you can't tell.
THE_EDGE — one sentence: a non-obvious angle the body genuinely supports that consensus may be under-weighting (a second-order beneficiary, an over-reaction, a mis-attributed cause, a wrongly-grouped name). Leave "" rather than force one — most stories have no real edge, and a fabricated edge is worse than none.
WATCH_ITEM — the single next data point or number that would confirm or kill the read ("Q2 volume guidance on the 28th", "Brent holding above $90", "the covenant test at year-end"). "" if none is clear.

THEME — choose exactly one, by what the story IS: earnings_revenue_margin | guidance_change | mna | capital_actions | debt_credit | litigation_enforcement | regulatory | management | product | commercial | operations | cybersecurity | macro_sector | policy | rumor.
Rules: guidance_change ONLY means a company changing its OWN forecast — a central-bank rate path, inflation/GDP print, war/geopolitics, oil move, country capex or trade-bloc story is macro_sector. An IPO/SPAC/listing/buyback/dividend/raise is capital_actions, NOT mna ("Acquisition" in a shell's name does not make an 8-K an M&A event). A government/regulator/court action that sets rules (sanctions, tariffs, antitrust, trade pacts, scheme approvals) is regulatory or policy. Use rumor only when the article itself cites unnamed sources.

NEWS_IMPACT — does this move earnings, guidance, valuation, the thesis, risk, or a portfolio decision, in which direction, how big, with what numbers, and how confident are you.
impact_direction / impact_magnitude: calibrate against the SUBJECT company's own fundamentals, not the news cycle's excitement. A routine or procedural item — a board-meeting notice, an earnings-date announcement, a routine regulatory filing, a scheduled dividend — is impact_magnitude "low" and impact_direction "neutral" or "unknown": there is no real economic change to size. A profit warning, a guidance cut, a large M&A deal, or a major capex commitment is "high" or "critical", with direction set by whether the SUBJECT's economics improve or worsen. Do not inflate magnitude just because the story is widely covered.
affected_metric — multi-select from EXACTLY this list: revenue, ebitda, pat_net_income, eps, cash_flow, debt, capex, commodity_price, valuation_multiple, regulatory_risk, thesis_quality. Return [] when the story is pure market color or opinion with no real linkage to any of these.
quantified_impact_available / extracted_numbers — set quantified_impact_available true and populate extracted_numbers ONLY when the body states actual figures tied to a metric (a stated loss range, a capex number, a guidance cut in %, a debt-raise amount, a revenue miss in currency or %). Every number in extracted_numbers must appear in the body, verbatim or near-verbatim — the same rule as GIST. NEVER invent a number to fill this field. If the body has no real figures, quantified_impact_available is false and extracted_numbers is [].
quick_dirty_calculation — a short back-of-envelope calculation, ONLY when the body supplies enough context to compute one (e.g. a stated range against a stated prior guidance or estimate). NEVER assume a share count, market cap, or valuation multiple that is not stated in the body. If the numbers exist but there isn't enough in the body to size a per-share or valuation effect (no share count, no market cap, no current multiple), leave this "" — do not guess, and do not write a disclaimer sentence here; an empty string is the correct answer and the reader shows that honestly.
why_it_matters — one sentence: ties the metric change to earnings, guidance, valuation, the thesis, risk, or a portfolio decision. No hype words (robust, strong fundamentals, well positioned, attractive opportunity, best-in-class).
analyst_takeaway — one sentence: the single most decision-useful line a portfolio manager should read first. No hype words.
confidence — integer 0 to 100. 0 when you have no real basis for a verdict (e.g. the body is too thin or off-topic). NEVER fabricate an implied confidence.`

const ROLES: CompanyRole[] = ['subject', 'acquirer', 'target', 'forecaster', 'mentioned']
const str = (v: unknown, max = 200): string => (typeof v === 'string' ? v.trim().slice(0, max) : '')

function coerceParty(raw: any): ArticleParty | null {
  const name = str(raw?.name, 120)
  if (!name) return null
  const ticker = typeof raw?.ticker === 'string' && TICKER_RE.test(raw.ticker.trim()) ? raw.ticker.trim().toUpperCase() : null
  const order: PartyOrder | null = raw?.order === 'second' ? 'second' : raw?.order === 'first' ? 'first' : null
  return {
    name,
    named_in_article: raw?.named_in_article !== false,
    ticker,
    listing: str(raw?.listing, 48) || null,
    // `mechanism` is the new field; fall back to the legacy `basis` so a brief produced before this change
    // (still in cache, or a stale fixture) keeps its blurb instead of going blank.
    mechanism: str(raw?.mechanism ?? raw?.basis, 200),
    magnitude: str(raw?.magnitude, 48) || null,
    horizon: str(raw?.horizon, 48) || null,
    order,
  }
}

const IMPACT_DIRECTIONS: ImpactDirection[] = ['positive', 'negative', 'mixed', 'neutral', 'unknown']
const IMPACT_MAGNITUDES: ImpactMagnitude[] = ['low', 'medium', 'high', 'critical']
const AFFECTED_METRICS: AffectedMetric[] = [
  'revenue', 'ebitda', 'pat_net_income', 'eps', 'cash_flow', 'debt', 'capex',
  'commodity_price', 'valuation_multiple', 'regulatory_risk', 'thesis_quality',
]

/** Coerce the model's news_impact into a safe NewsImpact. Every field defaults safely — a missing/malformed
 *  block degrades to "unknown/low/no numbers/zero confidence", never a crash, never a fabricated verdict.
 *  `quick_dirty_calculation` is FORCED to "" whenever quantified_impact_available is false — defense in depth
 *  so a model slip can't ship a calculation with no numbers behind it. Exported for tests. */
export function coerceNewsImpact(raw: any): NewsImpact {
  const impact_direction: ImpactDirection = IMPACT_DIRECTIONS.includes(raw?.impact_direction) ? raw.impact_direction : 'unknown'
  const impact_magnitude: ImpactMagnitude = IMPACT_MAGNITUDES.includes(raw?.impact_magnitude) ? raw.impact_magnitude : 'low'
  const affected_metric: AffectedMetric[] = (Array.isArray(raw?.affected_metric) ? raw.affected_metric : [])
    .filter((m: any): m is AffectedMetric => AFFECTED_METRICS.includes(m))
    .slice(0, AFFECTED_METRICS.length)
  const quantified_impact_available = raw?.quantified_impact_available === true
  const extracted_numbers = (Array.isArray(raw?.extracted_numbers) ? raw.extracted_numbers : [])
    .map((n: any) => str(n, 80))
    .filter(Boolean)
    .slice(0, 8)
  const confidenceNum = Number(raw?.confidence)
  const confidence = Number.isFinite(confidenceNum) ? Math.max(0, Math.min(100, Math.round(confidenceNum))) : 0
  return {
    impact_direction,
    impact_magnitude,
    affected_metric,
    quantified_impact_available,
    extracted_numbers,
    // forced "" when not quantified — a defense-in-depth backstop beyond the prompt instruction, so a
    // model slip can never ship a calculation the extracted numbers don't actually support.
    quick_dirty_calculation: quantified_impact_available ? str(raw?.quick_dirty_calculation, 280) : '',
    why_it_matters: str(raw?.why_it_matters, 240),
    analyst_takeaway: str(raw?.analyst_takeaway, 240),
    confidence,
  }
}

/** Coerce the model's JSON into a safe ArticleBrief. Every field defaults safely, so model drift degrades
 *  to an empty/typed value — never a crash, never a half-parsed brief. Exported for tests. */
export function coerceArticleBrief(raw: any): ArticleBrief {
  const gist = (Array.isArray(raw?.gist) ? raw.gist : []).map((g: any) => str(g, 280)).filter(Boolean).slice(0, 4)
  const companies: ArticleCompany[] = (Array.isArray(raw?.companies) ? raw.companies : [])
    .map((c: any): ArticleCompany | null => {
      const name = str(c?.name, 120)
      if (!name) return null
      const ticker = typeof c?.ticker === 'string' && TICKER_RE.test(c.ticker.trim()) ? c.ticker.trim().toUpperCase() : null
      const role: CompanyRole = ROLES.includes(c?.role) ? c.role : 'mentioned'
      const listing_country = str(c?.listing_country, 48) || null
      const exchange = str(c?.exchange, 48) || null
      return { name, ticker, role, listing_country, exchange }
    })
    .filter((c: ArticleCompany | null): c is ArticleCompany => c !== null)
    .slice(0, 8)
  const beneficiaries = (Array.isArray(raw?.beneficiaries) ? raw.beneficiaries : []).map(coerceParty).filter(Boolean).slice(0, 6) as ArticleParty[]
  const exposed = (Array.isArray(raw?.exposed) ? raw.exposed : []).map(coerceParty).filter(Boolean).slice(0, 6) as ArticleParty[]
  const theme = typeof raw?.theme === 'string' ? raw.theme.trim().toLowerCase().replace(/[^a-z_]/g, '') : ''
  return {
    gist,
    market_angle: str(raw?.market_angle, 320),
    companies,
    beneficiaries,
    exposed,
    whats_priced: str(raw?.whats_priced, 320),
    the_edge: str(raw?.the_edge, 320),
    watch_item: str(raw?.watch_item, 240),
    theme,
    news_impact: coerceNewsImpact(raw?.news_impact),
  }
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
): Promise<{ brief: ArticleBrief | null; tokens: number; note?: string; rate?: RateInfo }> {
  if (!opts.apiKey) return { brief: null, tokens: 0, note: 'no GROQ_API_KEY' }
  const text = String(body || '').slice(0, 6000)
  if (text.replace(/\s+/g, ' ').trim().length < 80) return { brief: null, tokens: 0, note: 'body too thin to read' }
  const user = `HEADLINE: ${headline}\n\nARTICLE BODY:\n${text}`
  let tokens = 0
  let lastNote = 'groq fetch error'
  const maxAttempts = opts.maxAttempts ?? 2
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await fetchFn(`${opts.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${opts.apiKey}`, ...(opts.headers || {}) },
        signal: AbortSignal.timeout(opts.timeoutMs ?? 30_000), // a hung provider must never block the reader
        body: JSON.stringify({
          model: opts.model,
          ...(opts.models?.length ? { models: opts.models } : {}), // OpenRouter fallback chain (Groq omits)
          temperature: 0.1,
          // the richer transmission brief (market angle, edge, per-party mechanism/magnitude/horizon, plus
          // news_impact's ~9 fields) needs headroom — floor at 3500 so a worst-case rich brief (up to 8 firms
          // + 12 parties × several fields + the impact block) can't truncate (finish_reason 'length' drops the
          // WHOLE brief, not just the tail), while a provider that asks for more keeps its larger budget. Sized
          // to the EST_TOKENS reservation (article-read.ts).
          max_tokens: Math.max(opts.maxTokens ?? 3000, 3500),
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: ARTICLE_SYSTEM },
            { role: 'user', content: user },
          ],
          ...(opts.extraBody || {}), // OpenRouter reasoning effort etc. (Groq omits)
        }),
      })
      const rate = parseRate(res)
      if (!res.ok) {
        const t = await res.text().catch(() => '')
        lastNote = `groq HTTP ${res.status}${t ? ': ' + t.slice(0, 120) : ''}`
        if ((res.status === 429 || res.status >= 500) && attempt < maxAttempts) { await sleep(rate.retryAfterMs || 1200 * attempt); continue }
        return { brief: null, tokens, note: lastNote, rate }
      }
      const data: any = await res.json()
      tokens += Number(data?.usage?.total_tokens) || 0
      if (data?.choices?.[0]?.finish_reason === 'length') return { brief: null, tokens, note: 'groq: output truncated', rate }
      const content = data?.choices?.[0]?.message?.content
      if (typeof content !== 'string') return { brief: null, tokens, note: 'groq: empty content', rate }
      let parsed: any
      try { parsed = JSON.parse(content) } catch { return { brief: null, tokens, note: 'groq: non-JSON content', rate } }
      return { brief: coerceArticleBrief(parsed), tokens, rate }
    } catch (e: any) {
      lastNote = e?.name === 'TimeoutError' ? 'groq: request timed out' : e?.message || 'groq fetch error'
      if (attempt < maxAttempts) await sleep(1200 * attempt)
    }
  }
  return { brief: null, tokens, note: lastNote }
}
