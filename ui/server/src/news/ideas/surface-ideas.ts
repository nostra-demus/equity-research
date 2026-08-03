// The PM skim — tier 1.5 of the screener, sitting between the ranked wire and the paid gauntlet.
//
// The wire's triage_score answers "how loud is this?" (materiality). It does NOT answer "is there one
// specific, liquid stock to TRADE here, long or short, and is it worth acting on?" — the two are
// different questions, which is why a human still scrolls hundreds of scored rows by hand. This module
// asks the second question of ONLY the already-top-ranked rows, in ONE cheap batched free-LLM call, and
// surfaces the handful that clear the bar as concrete ideas (ticker · side · one plain reason · a dated
// why-now · an honest pre-edge read). Most rows produce NO idea — saying "nothing clears the bar" is the
// correct, doctrine-mandated answer (CLAUDE.md §24, the Rejector), not a failure.
//
// This is a SURFACE skim, never a verdict. Its `conviction` is a pre-edge PROXY on the 0-100 scale, not
// the locked 0.40/0.30/0.30 edge score the paid gauntlet computes — it is stamped `pre_edge_proxy` so it
// can never masquerade as edge (§7). It carries no price target (that is the paid news-impact tier). The
// output schema is a subset of frameworks/screener/candidates.schema.json so a later paid run maps onto
// it rather than fighting it. Batching + JSON mode keep it token-cheap; it reads titles + the metadata the
// wire already computed (materiality/label/types/companies), so the model spends its tokens on the
// event->idea leap, not on re-deriving materiality.

import { conservativeChatTokenBound, type RateInfo } from '../triage/budget'
import { EVENT_TYPES } from '../triage/groq'

// §14 thesis-type classification — the surface skim must name when a "stock idea" is really a macro /
// commodity / policy bet wearing a ticker, so it is never shown as a clean single-name pick.
export const THESIS_TYPES = [
  'company_specific', 'sector_cycle', 'macro_conditional', 'policy_conditional',
  'commodity_conditional', 'fx_rates', 'liquidity_positioning', 'governance_turnaround',
  'balance_sheet_survival', 'pair_trade',
] as const
export type ThesisType = (typeof THESIS_TYPES)[number]

export type IdeaDirection = 'long' | 'short' | 'pair'
export type PricedIn = 'priced' | 'room' | 'unknown'

// One row of the top-N the skim reads: exactly the fields the wire already scored (InboxRow subset), so
// the model gets the materiality read for free and spends its budget on the trade idea.
export interface IdeaInputRow {
  event_id: string
  headline: string // display + the model prompt (the English translation when the original is non-English)
  headline_orig: string // the ORIGINAL-language headline — carried so a promotion's SIG_ID byte-matches the wire launch (which uses the original), never the translation
  url: string // the source URL — carried (not sent to the model) so a promotion byte-matches the wire event's SIG_ID
  source_name: string
  region: string
  materiality: number // triage_score (composite priority) — the wire's own read
  materiality_pre_score?: number // raw title-read economic materiality; never substitute the composite
  label: string // event_materiality_label (low/medium/high/critical)
  event_types: string[]
  issuer_linkage: string
  companies: { name: string; ticker: string | null; listing_country: string | null }[]
  found_at: string // ISO — the freshest source timestamp, drives freshness/decay downstream
  source_tier?: import('../scope').SourceTierId
  scheduled_events?: string[]
  event_direction?: import('../types').EventDirection
  dedup_group?: string // one underlying story across publisher copies
}

// A surfaced idea, as the LLM returns it (raw, per-batch). Indices in `src` point back into the input rows
// so the orchestrator can resolve event_ids / headlines / timestamps deterministically (never trust the
// model to echo an id). Every field coerces to a safe default — model drift degrades to a dropped idea,
// never a crash.
export interface RawIdea {
  src: number[] // input-row indices this idea clusters (>=1)
  ticker: string
  company: string | null
  exchange: string | null // the model's guess; UNVERIFIED (no dated listing check at surface tier)
  direction: IdeaDirection
  pair_with: string | null // the other leg's ticker when direction === 'pair'
  reason: string // one plain-English line (§21), no fluff
  why_now: string // §17 — carries a date/window, or says the timing is unproven
  conviction: number // 0-100 PRE-EDGE proxy (NOT the locked edge score)
  priced_in: PricedIn
  thesis_type: ThesisType
}

export interface SurfaceIdeasResult {
  ideas: RawIdea[]
  requests: number
  tokens: number
  ok: boolean
  note?: string
  rate?: RateInfo
  /** Structured failure policy for callers that share provider health with other workloads. Contract or
   * request-shape failures are idea-scoped; only availability failures may cool the provider globally. */
  failureKind?: 'availability' | 'request' | 'contract'
  httpStatus?: number
}

// Input-token estimate for the budget pre-check + per-minute reservation. Each row carries more context
// than a bare triage title (materiality, label, types, companies), so ~130/row over the fixed prompt,
// plus the idea output. Kept above actual so the budget never under-reserves. (triage is 500 + n*95.)
export function estimateIdeaTokens(rowCount: number): number {
  return 900 + rowCount * 130
}

export const IDEA_SYSTEM = `You are the sharpest portfolio manager on a buy-side desk, skimming a ranked news wire the way a human PM does in the morning: reading fast, ignoring most of it, and pulling out the ONE or TWO items where there is a specific, tradable stock idea worth acting on RIGHT NOW — long or short.

You are given the desk's already-ranked top items, each with the wire's own materiality read (0-100), a severity label, event types, and any companies it guessed. Your ONLY job is the leap the wire cannot make: from an event to a concrete position — which exact listed stock to play, which way, why, and how sure you are.

THE BAR IS HIGH. Most items yield NO idea. Return an idea ONLY when ALL of these hold:
- there is a SPECIFIC, LISTED, liquid stock (or a clean pair) that expresses the event — not "the sector", not a private company, not an index;
- you can name the ticker with real confidence (never invent or guess a ticker — if you are unsure of the exact symbol, do not surface the idea);
- the event plausibly moves that company's revenue, margins, cash flow, capital structure, or its multiple, in a direction you can state;
- there is a reason it matters NOW (a fresh catalyst, a dated event, a live dislocation) — not a slow, someday story.
If an item is big news but has no clean, liquid single-name expression (a war, a macro print, a policy shift with no pure play), DO NOT force a ticker onto it. Returning FEWER, better ideas — or an empty list — is the correct, valued answer. Never manufacture an idea to fill the list. A dishonest or low-conviction pick is worse than none.

CLUSTER: if several items are the same underlying idea (same mechanism, same names), merge them into ONE idea and list all their indices in "src" — a story told by three sources is one idea, stronger for the corroboration, not three.

SHORT and PAIR are first-class: when the event HARMS a listed company, that is a short; when it clearly helps one named company at a named rival's expense, that is a pair (long the winner, short the loser). Check the sign before you place the side.

For each idea return:
- src: the input indices this idea draws on (one or more integers).
- ticker: the exact listed symbol, uppercase. Never invent one.
- company: the company's common name.
- exchange: the primary exchange with the ticker if you are confident (e.g. "NYSE", "NASDAQ", "NSE", "BSE", "LSE", "TSE"), else null. This is your own knowledge, unverified — use null when unsure.
- direction: "long" | "short" | "pair".
- pair_with: for a "pair", the OTHER leg's ticker (the one you would short if this is the long leg); else null.
- reason: ONE plain-English sentence a smart non-specialist understands, stating the mechanism — how the event reaches this company's economics. No jargon without its meaning, and NONE of these fluff words: robust, strong, well-positioned, attractive, best-in-class, compelling, poised, cheap, expensive. Keep the exact number where the headline gives one.
- why_now: ONE sentence on why this is live NOW — the dated catalyst or dislocation (give the date/window). If the timing is not actually proven, say so plainly ("timing unproven — thesis is directional").
- conviction: an integer 0-100, your PRE-EDGE read of how good this idea is right now, from what is cheap to see at a skim: how clean and liquid the expression is, how direct and large the impact, and how live the catalyst. This is NOT a deep edge score. Be calibrated and skeptical: reserve 70+ for a genuinely clean, liquid, single-name idea with a clear near-term catalyst; most real ideas sit 40-65; below 40 do not surface it.
- priced_in: your quick guess at whether the market has already moved on this — "priced" (likely already in the price), "room" (plausibly not yet fully reflected), or "unknown".
- thesis_type: classify honestly, one of: ${THESIS_TYPES.join(', ')}. Use company_specific ONLY when the idea genuinely rests on that one company; if the real driver is a commodity, a macro variable, a policy, or FX, say so (commodity_conditional / macro_conditional / policy_conditional / fx_rates) — this flags a market bet wearing a ticker.

Event-type vocabulary (for your reference, matching the desk's tags): ${EVENT_TYPES.join(', ')}.

Return ONLY JSON: {"ideas":[{"src":[<int>],"ticker":"...","company":"...","exchange":null,"direction":"long|short|pair","pair_with":null,"reason":"...","why_now":"...","conviction":<int>,"priced_in":"priced|room|unknown","thesis_type":"company_specific"}]}. Return {"ideas":[]} when nothing on the wire clears the bar. Never include more than 6 ideas; if you have more, keep only the best.`

export function buildIdeaUserMessage(rows: IdeaInputRow[]): string {
  const lines = rows.map((r, i) => {
    const comp = (r.companies || [])
      .map((c) => (c.ticker ? `${c.name} (${c.ticker})` : c.name))
      .slice(0, 3)
      .join(', ')
    const tags = (r.event_types || []).slice(0, 4).join('/')
    const bits = [
      `materiality=${Math.round(r.materiality)}`,
      r.label ? `severity=${r.label}` : '',
      tags ? `types=${tags}` : '',
      r.issuer_linkage ? `linkage=${r.issuer_linkage}` : '',
      comp ? `names=${comp}` : '',
    ].filter(Boolean).join(' · ')
    return `${i}. [${r.source_name} · ${r.region}] ${r.headline}\n   (${bits})`
  })
  return `Skim these ${rows.length} top-ranked wire items and surface only the best 1-2 tradable stock ideas (or none):\n${lines.join('\n')}`
}

const DIRECTIONS: IdeaDirection[] = ['long', 'short', 'pair']
const PRICED: PricedIn[] = ['priced', 'room', 'unknown']
const TICKER_RE = /^[A-Z0-9.\-]{1,12}$/i
const str = (v: unknown, max: number): string => (typeof v === 'string' ? v.trim().slice(0, max) : '')

// Coerce one raw idea against the input rows it must reference. Returns null (dropped) when it fails the
// hard gates a surface idea must clear: at least one valid source index and a real ticker. Every other
// field defaults safely.
export function coerceIdea(raw: any, rowCount: number): RawIdea | null {
  const src = (Array.isArray(raw?.src) ? raw.src : [])
    .map((n: any) => Number(n))
    .filter((n: number) => Number.isInteger(n) && n >= 0 && n < rowCount)
  const uniqSrc = [...new Set<number>(src)]
  if (!uniqSrc.length) return null // an idea with no traceable source event is not surfaceable

  const ticker = typeof raw?.ticker === 'string' && TICKER_RE.test(raw.ticker.trim()) ? raw.ticker.trim().toUpperCase() : ''
  if (!ticker) return null // never surface an idea we can't name a ticker for (§5, no source = no claim)

  const direction: IdeaDirection = DIRECTIONS.includes(raw?.direction) ? raw.direction : 'long'
  const priced_in: PricedIn = PRICED.includes(raw?.priced_in) ? raw.priced_in : 'unknown'
  const thesis_type: ThesisType = (THESIS_TYPES as readonly string[]).includes(raw?.thesis_type) ? raw.thesis_type : 'company_specific'
  let conviction = Number(raw?.conviction)
  if (!Number.isFinite(conviction)) conviction = 0
  conviction = Math.max(0, Math.min(100, Math.round(conviction)))
  const pairTicker = typeof raw?.pair_with === 'string' && TICKER_RE.test(raw.pair_with.trim()) ? raw.pair_with.trim().toUpperCase() : null
  const reason = str(raw?.reason, 280)
  const whyNow = str(raw?.why_now, 240)
  // These are required evidence fields in the persisted contract, not cosmetic defaults. Letting a blank
  // mechanism/timing sentence through creates an invalid snapshot downstream and can turn malformed model
  // output into a false success_empty health state. Likewise, a pair without its second leg is not a pair.
  if (!reason || !whyNow || (direction === 'pair' && !pairTicker)) return null

  return {
    src: uniqSrc,
    ticker,
    company: str(raw?.company, 120) || null,
    exchange: str(raw?.exchange, 24) || null,
    direction,
    pair_with: direction === 'pair' ? pairTicker : null,
    reason,
    why_now: whyNow,
    conviction,
    priced_in,
    thesis_type,
  }
}

/**
 * One free-LLM call over the ranked top-N -> candidate ideas. Never throws. Mirrors triageBatch's
 * reliability contract exactly: JSON mode, one retry on a transient 429/5xx, a max_tokens truncation is
 * reported (not half-parsed), and on ok:false the caller must treat the batch as UNPRODUCED (surface no
 * new ideas this pass) — never as "zero ideas confirmed". Provider-agnostic OpenAI-compatible shape, so
 * the same call serves Groq and any overflow provider.
 */
export async function surfaceIdeasBatch(
  rows: IdeaInputRow[],
  opts: { model: string; baseUrl: string; apiKey: string; maxTokens?: number; models?: string[]; headers?: Record<string, string>; extraBody?: Record<string, unknown>; timeoutMs?: number; maxAttempts?: number; signal?: AbortSignal },
  fetchFn: typeof fetch = fetch,
  sleep: (ms: number) => Promise<void> = (ms) => new Promise((r) => setTimeout(r, ms)),
): Promise<SurfaceIdeasResult> {
  if (!rows.length) return { ideas: [], requests: 0, tokens: 0, ok: true }
  if (!opts.apiKey) return { ideas: [], requests: 0, tokens: 0, ok: false, note: 'no api key', failureKind: 'request' }

  // parseRate lives in groq.ts; import lazily-free by re-reading headers here to avoid a cross-module cycle
  const readRate = (res: { headers?: { get(k: string): string | null } }): RateInfo => {
    const h = (k: string) => res?.headers?.get?.(k) ?? null
    const num = (k: string) => { const v = Number(h(k)); return Number.isFinite(v) ? v : undefined }
    const durMs = (s: string | null): number | undefined => {
      if (!s) return undefined
      const t = String(s).trim()
      if (/^\d+(\.\d+)?$/.test(t)) return Math.round(parseFloat(t) * 1000)
      const parts = t.match(/\d+(?:\.\d+)?(?:ms|s|m|h)/g)
      if (!parts) return undefined
      let ms = 0
      for (const p of parts) { const v = parseFloat(p); ms += p.endsWith('ms') ? v : p.endsWith('h') ? v * 3_600_000 : p.endsWith('m') ? v * 60_000 : v * 1000 }
      return Math.round(ms)
    }
    return { tpmLimit: num('x-ratelimit-limit-tokens'), tpmRemaining: num('x-ratelimit-remaining-tokens'), tpmResetMs: durMs(h('x-ratelimit-reset-tokens')), rpdRemaining: num('x-ratelimit-remaining-requests'), retryAfterMs: durMs(h('retry-after')) }
  }

  let requests = 0
  let tokens = 0
  let lastNote = 'idea fetch error'
  const maxAttempts = opts.maxAttempts ?? 2
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      requests++ // one count per fetch invocation, including network/response-decoding failures below
      const requestSignal = AbortSignal.timeout(opts.timeoutMs ?? 30_000)
      const res = await fetchFn(`${opts.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${opts.apiKey}`, ...(opts.headers || {}) },
        signal: opts.signal ? AbortSignal.any([opts.signal, requestSignal]) : requestSignal,
        body: JSON.stringify({
          model: opts.model,
          ...(opts.models?.length ? { models: opts.models } : {}),
          temperature: 0.2,
          max_tokens: opts.maxTokens ?? 2500,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: IDEA_SYSTEM },
            { role: 'user', content: buildIdeaUserMessage(rows) },
          ],
          ...(opts.extraBody || {}),
        }),
      })
      const rate = readRate(res)
      if (!res.ok) {
        const body = await res.text().catch(() => '')
        lastNote = `idea HTTP ${res.status}${body ? ': ' + body.slice(0, 120) : ''}`
        if ((res.status === 429 || res.status >= 500) && attempt < maxAttempts) { await sleep(rate.retryAfterMs || 1500 * attempt); continue }
        return {
          ideas: [], requests, tokens, ok: false, note: lastNote, rate, httpStatus: res.status,
          failureKind: res.status === 429 || res.status >= 500 ? 'availability' : 'request',
        }
      }
      let data: any
      try {
        data = await res.json()
      } catch (e: any) {
        // A syntactically malformed HTTP-200 envelope is a response-contract failure, not proof that the
        // provider is unavailable. Keep it idea-scoped so this nonessential skim cannot cool core triage.
        // A stream/read failure is transport availability and stays on the retry path below.
        if (e?.name === 'SyntaxError') {
          return { ideas: [], requests, tokens, ok: false, note: 'idea: malformed provider response JSON', rate, failureKind: 'contract' }
        }
        throw e
      }
      tokens += Number(data?.usage?.total_tokens)
        || conservativeChatTokenBound(IDEA_SYSTEM, buildIdeaUserMessage(rows), opts.maxTokens ?? 2500)
      if (data?.choices?.[0]?.finish_reason === 'length') {
        return { ideas: [], requests, tokens, ok: false, note: 'idea: output truncated at max_tokens', rate, failureKind: 'contract' }
      }
      const content = data?.choices?.[0]?.message?.content
      if (typeof content !== 'string') return { ideas: [], requests, tokens, ok: false, note: 'idea: empty content', rate, failureKind: 'contract' }
      let parsed: any
      try { parsed = JSON.parse(content) } catch { return { ideas: [], requests, tokens, ok: false, note: 'idea: non-JSON content', rate, failureKind: 'contract' } }
      // An honest empty result has one exact shape: {"ideas":[]}. Treating a missing/wrong `ideas`
      // field as [] makes provider schema drift indistinguishable from "nothing clears the bar" — the
      // same false-green empty state this health contract exists to prevent.
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed) || !Array.isArray(parsed.ideas)) {
        return { ideas: [], requests, tokens, ok: false, note: 'idea: invalid response schema (expected top-level ideas array)', rate, failureKind: 'contract' }
      }
      const arr: any[] = parsed.ideas
      const ideas = arr.map((r) => coerceIdea(r, rows.length)).filter((x): x is RawIdea => x !== null).slice(0, 6)
      // A non-empty model answer whose every row fails the source/ticker gates is broken output, not a
      // successful rejection. Partial drift remains usable when at least one row survives; a literal []
      // remains the only success_empty result.
      if (arr.length > 0 && ideas.length === 0) {
        return { ideas: [], requests, tokens, ok: false, note: 'idea: response contained no valid idea rows', rate, failureKind: 'contract' }
      }
      return { ideas, requests, tokens, ok: true, rate }
    } catch (e: any) {
      lastNote = e?.name === 'TimeoutError' ? 'idea: request timed out' : e?.message || 'idea fetch error'
      if (attempt < maxAttempts) await sleep(1500 * attempt)
    }
  }
  return { ideas: [], requests, tokens, ok: false, note: lastNote, failureKind: 'availability' }
}
