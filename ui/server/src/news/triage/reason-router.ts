// Free-text reason router — turns a human's short "why this card is off" note (the feedback popover's
// note box) into ONE scope bucket, so the free-text verdict actually feeds the feedback→scoring loop
// instead of only being eyeballed in a top-reasons list.
//
// Deterministic-safe by construction (CLAUDE.md §12): the route is written ONCE to a new additive
// `feedback_route` ledger line (never mutating the frozen score_breakdown the tuner's backtest replays),
// and the tuner uses it ONLY to recover a record that has no scope_id — never to override one. So the
// gated math stays byte-reproducible.
//
// Two-tier, graceful: a zero-cost keyword route (deriveScope over the note text) is ALWAYS produced and
// is the answer when no LLM is reachable; a single cheap Groq call refines the edge cases the keyword
// table misses. The Groq path shares the same cooldown guardrail as triage/article-read (a provider
// outage arms an exponential backoff and we fall straight back to the keyword route), and the calls are
// tiny (~1 per note, human-paced) so they never meaningfully touch the shared token budget.

import { NEWS, STATE_DIR } from '../../config'
import { deriveScope, type ScopeId } from '../scope'
import { armCooldown, clearCooldown, isCoolingDown } from './budget'

export interface ReasonRoute {
  scope: ScopeId | null
  confidence: number // 0–1
  via: 'llm' | 'keyword' | 'none'
}

const SCOPES: ScopeId[] = ['single_name', 'multi_name', 'sector', 'macro', 'commodity', 'policy', 'geopolitical', 'generic_media', 'unknown']

const SYSTEM = `You map a buy-side user's SHORT free-text reason (why a news card was mis-scored or irrelevant) onto ONE scope bucket. Reply ONLY JSON: {"scope": <one of single_name|multi_name|sector|macro|commodity|policy|geopolitical|generic_media|unknown>, "confidence": 0..1}.
Guidance: a "this can't help me pick a stock / not investable / just noise" verdict with no sector, macro, or policy angle → "generic_media". A rate/inflation/GDP angle → "macro". A law/regulator/election/tariff angle → "policy". A war/conflict angle → "geopolitical". A single company being wrong or over-rated → "single_name". Never invent a bucket; use "unknown" if genuinely unclear.`

/** The always-available, zero-cost route: run the note text through the same scope lexicons the wire uses. */
function keywordRoute(text: string): ReasonRoute {
  const scope = deriveScope({ headline: text })
  return { scope, confidence: 0.5, via: 'keyword' }
}

/**
 * Route one free-text reason to a scope. Never throws — a bad/empty note returns `{scope:null,via:'none'}`,
 * and any LLM failure degrades to the deterministic keyword route. `fetchFn` is injectable for tests.
 */
export async function routeReason(text: string, fetchFn: typeof fetch = fetch): Promise<ReasonRoute> {
  const t = (text || '').trim()
  if (!t) return { scope: null, confidence: 0, via: 'none' }

  const kw = keywordRoute(t)
  const key = NEWS.groqApiKey
  if (!key || isCoolingDown(STATE_DIR, 'groq')) return kw

  try {
    const res = await fetchFn(`${NEWS.groqBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(12_000),
      body: JSON.stringify({
        model: NEWS.groqModel,
        temperature: 0,
        max_tokens: 80,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM },
          { role: 'user', content: t.slice(0, 400) },
        ],
      }),
    })
    if (!res.ok) {
      // only arm the shared cooldown on a genuine transient failure (never on a clean 4xx classify miss)
      if (res.status === 429 || res.status >= 500) armCooldown(STATE_DIR, Date.now(), NEWS.llmCooldownMs, 'groq')
      return kw
    }
    const data: any = await res.json()
    const content = data?.choices?.[0]?.message?.content
    const parsed = typeof content === 'string' ? JSON.parse(content) : null
    const scope: ScopeId = SCOPES.includes(parsed?.scope) ? (parsed.scope as ScopeId) : (kw.scope ?? 'unknown')
    const confidence = Math.max(0, Math.min(1, Number(parsed?.confidence) || 0.6))
    clearCooldown(STATE_DIR, 'groq')
    return { scope, confidence, via: 'llm' }
  } catch {
    // network error / timeout / non-JSON — the keyword route already read the note, so use it
    return kw
  }
}
