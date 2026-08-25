// On-demand THEME BRIEF — the few-sentence, plain-English explainer shown when a human opens a theme's
// deep-dive. It answers "what is this theme actually about, and what's happening?" in 3–5 sentences, so
// the reader understands the cluster completely before digging into the member stories. The brief is
// built from the theme's OWN member headlines + named companies (no external fetch), by one free Groq
// pass that shares the firehose's daily budget + per-minute limiter (so it never collectively busts the
// free tier or races the live scanner), cached by a content signature in STATE_DIR, and degrading
// gracefully to a deterministic synthesis when the model is unavailable or the call fails. Mirrors the
// on-demand article read (news/triage/article-read.ts): on-demand, budget-shared, cached, never throws,
// always returns something useful. A per-click brief is deliberately FREE-providers-only — never a
// Claude-metered seam — matching that sibling; the only LLM here is the shared free Groq.

import fs from 'node:fs'
import path from 'node:path'
import { createHash } from 'node:crypto'
import {
  classifyProviderCaughtFailure,
  classifyProviderHttpFailure,
  clearProviderQuarantine,
  honorProviderRetryAfter,
  providerRequestIdentity,
  quarantineProviderFailure,
  readProviderQuarantine,
  type ProviderFailureClassification,
} from '../provider-failure'
import { Budget, armCooldown, clearCooldown, conservativeChatTokenBound, credibleTokenUsage, getSharedLimiter, isCoolingDown, rateInfoForLimiter, type RateInfo } from '../triage/budget'
import { parseRate } from '../triage/groq'
import type { Theme, ThemeCompany, ThemeMember } from './types'
import { selectNarrativeCore } from './core'

export interface ThemeBrief {
  theme_id: string
  brief: string // 2–5 plain-English sentences
  generation: 'groq' | 'deterministic'
  generated_at: string // ISO
  note?: string // present only when degraded (deterministic fallback), explaining why
}

// what we persist per theme — the brief plus the content signature it was built from
type CachedBrief = ThemeBrief & { sig: string }

export interface BriefConfig {
  themeBriefModel?: string // 'groq' | 'off' (default 'groq')
  groqApiKey?: string
  groqBaseUrl?: string
  groqModel?: string
  // the firehose's shared free-tier accounting (so the brief shares budgets + the per-minute window)
  groqRpm?: number
  groqTpm?: number
  groqDailyReqCap?: number
  groqDailyTokenCap?: number
  llmCooldownMs?: number
  llmCooldownMaxMs?: number
  groqKeyEnvVar?: string
}

const CACHE_FILE = 'themes-brief-cache.json'
const CACHE_MAX = 400 // bound the cache file (newest kept) — same discipline as the enrich cache
const LLM_TIMEOUT_MS = 13_000 // user-facing: one short attempt, then fall back (never spin the shimmer)
const LIMITER_WAIT_MS = 2000 // how long we'll wait for a per-minute slot before degrading to deterministic
const UPGRADE_COOLDOWN_MS = 10 * 60_000 // a deterministic brief re-tries the LLM at most this often
const FORCE_COOLDOWN_MS = 30_000 // a ?force=1 regen is ignored if a brief was built this recently (anti-spam)
const EST_TOKENS = 1200 // a brief's rough input(headlines)+output cost — for budget + limiter sizing
const BRIEF_HOLD_ID = 'theme-brief:groq'

const iso = (d = new Date()) => d.toISOString().replace(/\.\d{3}Z$/, 'Z')
const cachePath = (stateDir: string) => path.join(stateDir, CACHE_FILE)

function loadCache(stateDir: string): Record<string, CachedBrief> {
  try {
    const o = JSON.parse(fs.readFileSync(cachePath(stateDir), 'utf8'))
    return o && typeof o === 'object' ? o : {}
  } catch {
    return {}
  }
}
/** Persist ONE theme's brief. Re-reads the on-disk cache first and sets only this key, so two briefs
 *  built concurrently for different themes don't lose each other's update (mirrors the enrich cache's
 *  commit discipline). Atomic tmp+rename; bounded to CACHE_MAX (newest kept). Best-effort. */
function saveBrief(stateDir: string, themeId: string, entry: CachedBrief): void {
  try {
    const cache = loadCache(stateDir)
    cache[themeId] = entry
    const entries = Object.entries(cache)
      .sort((a, b) => String(b[1].generated_at).localeCompare(String(a[1].generated_at)))
      .slice(0, CACHE_MAX)
    fs.mkdirSync(stateDir, { recursive: true })
    const tmp = `${cachePath(stateDir)}.tmp.${process.pid}`
    fs.writeFileSync(tmp, JSON.stringify(Object.fromEntries(entries)))
    fs.renameSync(tmp, cachePath(stateDir))
  } catch {
    // best-effort — a missed write only costs a re-generation next open
  }
}

// ---- which member stories represent the theme ----

const realName = (s?: string | null): boolean => !!s && !/^(null|undefined|n\/a)$/i.test(s.trim())
const asStr = (v: unknown): string => (typeof v === 'string' ? v : '')
// null-safe AND type-safe: a member with neither headline nor headline_en (malformed/legacy data), OR a
// non-string in either field (out-of-contract data), yields '' rather than throwing — signatureHeadlines
// maps this over EVERY member and runs inside briefSig BEFORE buildThemeBrief's own guards, so it must
// never throw (the never-throws contract). Coerce both fields through asStr before calling .trim().
const headlineOf = (m: ThemeMember) => (asStr(m.headline_en).trim() ? asStr(m.headline_en) : asStr(m.headline)).trim()
const narrativeCompanies = (theme: Theme): ThemeCompany[] => {
  const companies = Array.isArray(theme.companies) ? theme.companies : []
  if (!theme.narrative) return companies
  const allowed = new Set(theme.narrative.expressions.map((expression) => expression.name_key))
  return companies.filter((company) => allowed.has(company.name_key))
}

/** The handful of member stories that best characterise the theme — the union of its highest-scored and
 *  its most-recent items, deduped. Both lenses matter: score captures prominence, recency captures a
 *  fresh development that hasn't accrued a score yet. Used to build the PROMPT (we want the freshest news
 *  in front of the model). The cache SIGNATURE deliberately uses a more stable basis — see briefSig. */
export function representativeMembers(theme: Theme, n = 12): ThemeMember[] {
  const all = Array.isArray(theme.members) ? theme.members : []
  const core = selectNarrativeCore(all, theme.narrative?.anchor_terms || [])
  const approvedIds = new Set((theme.narrative?.evidence || []).map((row) => row.event_id))
  const ms = theme.narrative
    ? all.filter((member) => approvedIds.has(member.event_id))
    // Contractless rows are no longer public Themes, but this legacy helper remains total for old cache
    // entries and diagnostics. When no dense pair exists, show the bounded raw set instead of returning an
    // empty paragraph; validated narratives never take this path and therefore cannot leak off-core rows.
    : (core.members.length ? core.members : all)
  const byScore = [...ms].sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 8)
  const byRecency = [...ms].sort((a, b) => (a.found_at < b.found_at ? 1 : -1)).slice(0, 6)
  const seen = new Set<string>()
  const out: ThemeMember[] = []
  for (const m of [...byScore, ...byRecency]) {
    // skip on the EFFECTIVE headline (headlineOf, which prefers a translated headline_en), not the raw
    // `headline` field — otherwise a foreign-language member kept only as headline_en (a legitimate case)
    // is dropped from the prompt and the deterministic read, while signatureHeadlines still counts it.
    if (seen.has(m.event_id) || !headlineOf(m)) continue
    seen.add(m.event_id)
    out.push(m)
  }
  return out.slice(0, n)
}

/** The theme's most prominent (highest-scored) headlines — the stable basis for the cache signature. */
function signatureHeadlines(theme: Theme, n = 10): string[] {
  return representativeMembers(theme, n).sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, n).map(headlineOf)
}

/** A content signature that changes only when the SUBSTANCE of the theme changes — its name, its named
 *  companies, or its most prominent (highest-scored) headlines. It deliberately ignores pure recency, so
 *  steady background flow that doesn't change the top stories keeps the same signature (served from cache,
 *  not re-generated); a genuinely big new story scores high enough to enter the top set and busts it. */
function briefSig(theme: Theme): string {
  const heads = signatureHeadlines(theme).sort()
  const cos = narrativeCompanies(theme).map((c) => c.name).filter(realName).slice(0, 6).sort()
  const narrative = theme.narrative ? {
    thesis: theme.narrative.thesis,
    why_now: theme.narrative.why_now,
    why_now_event_id: theme.narrative.why_now_event_id,
    mechanism_steps: theme.narrative.mechanism_steps,
    horizon: theme.narrative.horizon,
    falsifier: theme.narrative.falsifier,
    evidence: theme.narrative.evidence,
    expressions: theme.narrative.expressions,
    validated_at: theme.narrative.validated_at,
    pending_event_ids: theme.needs_narrative_update ? theme.pending_narrative_event_ids || [] : [],
    update_overflow: theme.narrative_update_overflow === true,
  } : null
  return createHash('sha256').update(JSON.stringify({ n: theme.name, h: heads, c: cos, narrative })).digest('hex').slice(0, 16)
}

// ---- deterministic fallback (always available, $0, no network) ----

const humanizeType = (t: string) => t.replace(/[_-]+/g, ' ').trim()
const trimHead = (h: string, max = 120) => (h.length > max ? h.slice(0, max - 1).trimEnd() + '…' : h)
function listWords(xs: string[]): string {
  const a = xs.filter(Boolean)
  if (a.length <= 1) return a[0] || ''
  if (a.length === 2) return `${a[0]} and ${a[1]}`
  return `${a.slice(0, -1).join(', ')}, and ${a[a.length - 1]}`
}
/** A momentum read tied to the theme's OWN numbers, not a bare adjective (§21: no adjective without the
 *  number behind it). Uses the fresh-flow count where the engine has one. */
function momentumPhrase(theme: Theme): string {
  const f = theme.fresh_flow || 0
  const recent = f > 0 ? ` (+${f} new recently)` : ''
  switch (theme.tier) {
    case 'hot':
      return `flow is picking up${recent}`
    case 'active':
      return `flow is steady${recent}`
    case 'cooling':
      return 'flow is cooling off'
    default:
      return 'flow has gone quiet'
  }
}

/** A readable, evidence-grounded brief built purely from the theme's own fields. Not as insightful as the
 *  LLM read, but never wrong and never empty — the safety net the route can always fall back to. Pure /
 *  total: tolerant of a malformed (undefined members/companies) theme so it can never throw. */
export function deterministicBrief(theme: Theme): string {
  if (theme.narrative && theme.needs_narrative_update) {
    if (theme.narrative_update_overflow) {
      return `Provisional — at least one unclassified matching evidence row fell outside the bounded audit record. The theme remains quarantined until its evidence is rebuilt. The last validated thesis was: ${theme.narrative.thesis}`
    }
    const pending = theme.pending_narrative_event_ids?.length || 1
    return `Provisional — ${pending} new matching evidence row${pending === 1 ? '' : 's'} still need support, challenge or context classification. The last validated thesis was: ${theme.narrative.thesis}`
  }
  if (theme.narrative && !theme.needs_rename) {
    return `${theme.narrative.thesis} What changed: ${theme.narrative.why_now} The proposed economic chain is ${theme.narrative.mechanism_steps.join(' → ')}. What would break it: ${theme.narrative.falsifier}`
  }
  const members = representativeMembers(theme)
  const cos = narrativeCompanies(theme).map((c) => c.name).filter(realName).slice(0, 4)
  const topHead = members[0] ? headlineOf(members[0]) : ''
  const n = theme.member_count_total || (theme.members?.length ?? 0)
  const affinity = (theme.event_type_affinity || []).slice(0, 3).map(humanizeType).filter(Boolean)
  const distinctCos = new Set(narrativeCompanies(theme).map((c) => c.name_key)).size

  const parts: string[] = []
  parts.push(cos.length ? `A run of ${n} related stories centred on ${listWords(cos)}.` : `A cluster of ${n} related stories.`)
  if (topHead) parts.push(`Most prominent: “${trimHead(topHead)}”.`)
  if (affinity.length) parts.push(`The recurring thread is ${listWords(affinity)}${distinctCos > cos.length ? `, across ${distinctCos} companies in all` : ''}.`)
  else if (distinctCos > cos.length) parts.push(`${distinctCos} companies are caught up in it.`)
  parts.push(`Right now, ${momentumPhrase(theme)}.`)
  return parts.join(' ')
}

// ---- the LLM pass (free Groq only, on the shared budget + limiter) ----

const SYSTEM =
  'You are a sharp buy-side analyst. You are given ONE market theme: a cluster of recent, related news headlines plus the companies named across them. ' +
  'Write a SHORT brief — 3 to 5 plain-English sentences a smart non-specialist can follow — that lets the reader understand the theme: ' +
  'what is actually happening (the through-line connecting these stories) and who the main players are. ' +
  'State ONLY facts that appear in the headlines below; invent nothing. Do NOT add numbers, dates, prices, catalysts, or causal links that are not in the headlines. ' +
  'You MAY note why it matters and what to watch ONLY where the headlines themselves support it — e.g. if a headline names a pending event (a vote, a filing date, a trial readout) you may point to it; otherwise do not speculate about the future. ' +
  'If the through-line is unclear or the headlines look like an accidental mix, say so plainly rather than guessing. ' +
  'Be concrete and specific to THESE headlines; do not pad, do not hedge with filler. ' +
  'Banned hype words: robust, strong, well-positioned, well-placed, attractive, cheap, expensive, best-in-class, game-changer, synergies, tailwind, headwind, on track. ' +
  'Return ONLY JSON: {"brief":"<the 3-5 sentence brief>"}. No prose outside the JSON.'

function buildUserMessage(theme: Theme): string {
  const members = representativeMembers(theme)
  const byOrder = (o: number) =>
    narrativeCompanies(theme)
      .filter((c: ThemeCompany) => c.order === o && realName(c.name))
      .slice(0, 8)
      .map((c) => c.name)
      .join(', ') || '—'
  const heads = members.map((m) => `- ${trimHead(headlineOf(m), 180)}`).join('\n')
  return (
    `Theme: "${theme.name}"\n` +
    `Momentum: ${theme.tier} (freshness ${theme.scores?.freshness ?? 0}/100, staying power ${theme.scores?.persistence ?? 0}/100)\n` +
    `Companies named — direct: ${byOrder(1)}; ripple: ${byOrder(2)}; read-across: ${byOrder(3)}\n\n` +
    `Recent headlines in this theme:\n${heads}\n\n` +
    `Write the brief.`
  )
}

/** Worst-case billable tokens for one Groq theme-brief attempt. */
export function themeBriefTokenBound(theme: Theme): number {
  return conservativeChatTokenBound(SYSTEM, buildUserMessage(theme), 500)
}

/** Pull {"brief":"..."} out of an LLM text response, tolerant of surrounding prose. */
function parseBriefJson(text: string): string | null {
  try {
    const start = text.indexOf('{')
    const end = text.lastIndexOf('}')
    if (start < 0 || end <= start) return null
    const o = JSON.parse(text.slice(start, end + 1))
    return typeof o?.brief === 'string' ? o.brief.trim() : null
  } catch {
    return null
  }
}

class GroqBriefHttpError extends Error {
  constructor(readonly status: number, readonly rate: RateInfo, readonly failure: ProviderFailureClassification) {
    super(`Groq theme brief HTTP ${status}`)
    this.name = 'GroqBriefHttpError'
  }
}

async function callGroq(cfg: BriefConfig, user: string, fetchFn: typeof fetch): Promise<{ text: string; tokens: number; rate: RateInfo }> {
  const res = await fetchFn(`${cfg.groqBaseUrl}/chat/completions`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${cfg.groqApiKey}` },
    signal: AbortSignal.timeout(LLM_TIMEOUT_MS),
    body: JSON.stringify({
      model: cfg.groqModel,
      temperature: 0.3,
      max_tokens: 500,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM },
        { role: 'user', content: user },
      ],
    }),
  })
  const rate = parseRate(res)
  if (!res.ok) {
    // Read only for in-memory model/endpoint evidence. Raw provider text is never returned or persisted.
    const rawBody = typeof res.text === 'function' ? await res.text().catch(() => '') : ''
    const failure = honorProviderRetryAfter(
      classifyProviderHttpFailure(res.status, rawBody),
      rate.retryAfterMs,
    )
    throw new GroqBriefHttpError(res.status, rate, failure)
  }
  const data: any = await res.json()
  const text = data?.choices?.[0]?.message?.content
  return { text: typeof text === 'string' ? text : '', tokens: credibleTokenUsage(data?.usage?.total_tokens, 0), rate }
}

/** One brief from Groq, on the SHARED free-tier budget + per-minute limiter (so the brief never
 *  collectively busts the day's Groq quota or races the live scanner's per-minute window). Returns the
 *  validated brief text, or null if the budget/limiter is unavailable, the call fails, or the reply is
 *  too short. Never throws. Provider failures arm the shared cooldown; this non-essential read never
 *  exhausts the shared daily ledger, especially not on a transient per-minute 429. */
async function tryGroqBrief(theme: Theme, cfg: BriefConfig, stateDir: string, fetchFn: typeof fetch): Promise<string | null> {
  const now = Date.now()
  const identity = providerRequestIdentity({
    providerId: 'groq', baseUrl: cfg.groqBaseUrl || '', model: cfg.groqModel || '', apiKey: cfg.groqApiKey,
    keyEnvVar: cfg.groqKeyEnvVar || 'GROQ_API_KEY', transport: 'openai', workload: 'theme-brief',
    contractVersion: 'theme-brief-json-v1',
    request: { temperature: 0.3, maxTokens: 500, responseFormat: 'json_object' },
  })
  if (readProviderQuarantine(stateDir, identity)) return null
  if (isCoolingDown(stateDir, 'groq', now) || isCoolingDown(stateDir, BRIEF_HOLD_ID, now)) return null
  const budget = Budget.load(stateDir, cfg.groqDailyReqCap ?? 13_000, cfg.groqDailyTokenCap ?? 500_000, now, 'groq-budget.json')
  const perAttemptTokens = themeBriefTokenBound(theme)
  if (!budget.canSpend(perAttemptTokens)) return null
  const limiter = getSharedLimiter(cfg.groqRpm ?? 28, cfg.groqTpm ?? 6000)
  const got = await limiter.acquire(EST_TOKENS, undefined, undefined, LIMITER_WAIT_MS)
  if (!got) return null // per-minute window busy — degrade rather than make the user wait
  if (readProviderQuarantine(stateDir, identity)) return null
  if (isCoolingDown(stateDir, 'groq', Date.now()) || isCoolingDown(stateDir, BRIEF_HOLD_ID, Date.now())) return null
  const reservation = budget.tryReserve(perAttemptTokens)
  if (!reservation) return null
  let providerReachable = false
  let briefHealthy = false
  let attemptStartedAt = 0
  let exhaustDay = false
  let terminalFailure: ProviderFailureClassification | null = null
  let failureHold: { id: string; baseMs: number; maxMs: number; reason: string } | null = null
  const classifyHttpFailure = (failure: ProviderFailureClassification, rate: RateInfo) => {
    const status = failure.httpStatus || 0
    exhaustDay = status === 429 && rate.rpdRemaining === 0
    if (exhaustDay) return
    if (failure.scope === 'workload') providerReachable = true
    if (failure.action === 'quarantine') {
      terminalFailure = failure
      quarantineProviderFailure(stateDir, identity, failure, Date.now())
      return
    }
    const retryMs = rate.retryAfterMs != null && Number.isFinite(rate.retryAfterMs)
      ? Math.max(0, Math.floor(rate.retryAfterMs))
      : null
    if (retryMs === 0) {
      if (failure.scope === 'workload') providerReachable = true
      return
    }
    if (failure.scope === 'workload') {
      providerReachable = true
      failureHold = retryMs != null
        ? { id: BRIEF_HOLD_ID, baseMs: retryMs, maxMs: retryMs, reason: 'theme-brief-request' }
        : { id: BRIEF_HOLD_ID, baseMs: cfg.llmCooldownMs ?? 300_000, maxMs: cfg.llmCooldownMaxMs ?? 3_600_000, reason: 'theme-brief-request' }
    } else if (retryMs != null) {
      failureHold = { id: 'groq', baseMs: retryMs, maxMs: retryMs, reason: status === 429 ? 'rate-limit' : status >= 500 ? 'availability' : 'provider-access' }
    } else if (status === 429) {
      failureHold = { id: 'groq', baseMs: 60_000, maxMs: 60_000, reason: 'rate-limit' }
    } else {
      failureHold = {
        id: 'groq',
        baseMs: cfg.llmCooldownMs ?? 300_000,
        maxMs: cfg.llmCooldownMaxMs ?? 3_600_000,
        reason: status >= 500 ? 'availability' : 'provider-access',
      }
    }
  }
  try {
    attemptStartedAt = Date.now()
    const result = await callGroq(cfg, buildUserMessage(theme), fetchFn)
    providerReachable = true
    budget.reconcile(reservation, 1, result.tokens || perAttemptTokens)
    const brief = parseBriefJson(result.text)
    if (!brief || brief.length < 40) {
      limiter.learn(rateInfoForLimiter(result.rate, false))
      failureHold = {
        id: BRIEF_HOLD_ID,
        baseMs: cfg.llmCooldownMs ?? 300_000,
        maxMs: cfg.llmCooldownMaxMs ?? 3_600_000,
        reason: 'theme-brief-contract',
      }
      return null
    }
    limiter.learn(result.rate)
    briefHealthy = true
    return brief.slice(0, 900)
  } catch (e: any) {
    budget.reconcile(reservation, 1, perAttemptTokens)
    if (e instanceof GroqBriefHttpError) {
      limiter.learn(rateInfoForLimiter(e.rate, e.failure.providerWide))
      classifyHttpFailure(e.failure, e.rate)
    } else {
      const failure = classifyProviderCaughtFailure(e)
      const timedOut = failure.code === 'timeout'
      if (failure.action === 'quarantine') {
        terminalFailure = failure
        quarantineProviderFailure(stateDir, identity, failure, Date.now())
        failureHold = null
      } else if (timedOut || e instanceof SyntaxError) {
        providerReachable = e instanceof SyntaxError
        failureHold = {
          id: BRIEF_HOLD_ID,
          baseMs: cfg.llmCooldownMs ?? 300_000,
          maxMs: cfg.llmCooldownMaxMs ?? 3_600_000,
          reason: timedOut ? 'theme-brief-timeout' : 'theme-brief-contract',
        }
      } else {
        failureHold = {
          id: 'groq',
          baseMs: cfg.llmCooldownMs ?? 300_000,
          maxMs: cfg.llmCooldownMaxMs ?? 3_600_000,
          reason: 'availability',
        }
      }
    }
    return null
  } finally {
    if (briefHealthy) {
      clearProviderQuarantine(stateDir, identity, attemptStartedAt)
      clearCooldown(stateDir, 'groq', attemptStartedAt)
      clearCooldown(stateDir, BRIEF_HOLD_ID, attemptStartedAt)
    } else {
      // A syntactically reachable response proves the provider itself is back even when this workload's
      // request/contract is bad. Clear stale shared outage state, then isolate the retry to this prompt.
      if (providerReachable && failureHold?.id !== 'groq') clearCooldown(stateDir, 'groq', attemptStartedAt)
      if (exhaustDay) budget.exhaust()
      else if (!terminalFailure && failureHold) armCooldown(stateDir, Date.now(), failureHold.baseMs, failureHold.id, failureHold.maxMs, failureHold.reason)
    }
  }
}

// ---- the public entry point ----

/**
 * Build (or serve from cache) the deep-dive brief for one theme. Never throws; always returns a usable
 * ThemeBrief. The flow:
 *   1. Compute the content signature; serve a cached brief instantly if it still matches (a forced regen
 *      is honoured unless a brief was built within FORCE_COOLDOWN_MS — anti-spam).
 *   2. A cached DETERMINISTIC brief is re-tried against the LLM (so it upgrades once Groq is reachable),
 *      but only after a cooldown, so a persistently unavailable provider isn't hammered on every open.
 *   3. Try Groq on the shared budget + limiter; on success cache + return it.
 *   4. On any failure / no key / model 'off' / budget exhausted, synthesise the deterministic brief and
 *      cache it (it can upgrade to the LLM read on a later open).
 */
export async function buildThemeBrief(
  theme: Theme,
  cfg: BriefConfig,
  stateDir: string,
  fetchFn: typeof fetch = fetch,
  opts: { force?: boolean } = {},
): Promise<ThemeBrief> {
  const sig = briefSig(theme)
  const llmEnabled = (cfg.themeBriefModel || 'groq') !== 'off' && !!cfg.groqApiKey

  const cache = loadCache(stateDir)
  const hit = cache[theme.theme_id]
  const rawAge = hit ? Date.now() - Date.parse(hit.generated_at || '') : Infinity
  // a corrupt/empty timestamp parses to NaN — treat it as old (regeneratable) rather than letting NaN
  // comparisons (all false) pin a bad entry in the cache forever
  const hitAgeMs = Number.isFinite(rawAge) ? rawAge : Infinity
  // a forced regen that lands within FORCE_COOLDOWN_MS of the last build is ignored (served from cache),
  // so a rapid ?force=1 loop can't repeatedly bypass the signature cache and hammer Groq
  const force = !!opts.force && hitAgeMs > FORCE_COOLDOWN_MS

  // A validated narrative is already the adjudicated synthesis. Running a second headline-only model can
  // erase challenge labels or contradict the dossier, so this legacy endpoint becomes a deterministic
  // projection of the same contract (and costs no provider budget).
  if (theme.narrative && theme.needs_narrative_update) {
    const out: ThemeBrief = {
      theme_id: theme.theme_id,
      brief: deterministicBrief(theme),
      generation: 'deterministic',
      generated_at: iso(),
      note: 'Provisional: new matching evidence is awaiting narrative classification.',
    }
    saveBrief(stateDir, theme.theme_id, { ...out, sig })
    return out
  }

  if (theme.narrative && !theme.needs_rename) {
    if (!force && hit && hit.sig === sig) {
      const { sig: _omit, ...brief } = hit
      return brief
    }
    const out: ThemeBrief = {
      theme_id: theme.theme_id,
      brief: deterministicBrief(theme),
      generation: 'deterministic',
      generated_at: iso(),
      note: 'Projected from the validated theme narrative.',
    }
    saveBrief(stateDir, theme.theme_id, { ...out, sig })
    return out
  }

  if (!force && hit && hit.sig === sig) {
    const upgradable = hit.generation === 'deterministic' && llmEnabled && hitAgeMs > UPGRADE_COOLDOWN_MS
    if (!upgradable) {
      const { sig: _omit, ...brief } = hit
      return brief
    }
    // else fall through to attempt an LLM upgrade of the cached deterministic brief
  }

  if (llmEnabled) {
    const brief = await tryGroqBrief(theme, cfg, stateDir, fetchFn)
    if (brief) {
      const out: ThemeBrief = { theme_id: theme.theme_id, brief, generation: 'groq', generated_at: iso() }
      saveBrief(stateDir, theme.theme_id, { ...out, sig })
      return out
    }
  }

  const out: ThemeBrief = {
    theme_id: theme.theme_id,
    brief: deterministicBrief(theme),
    generation: 'deterministic',
    generated_at: iso(),
    note: llmEnabled ? 'Summarised from the headlines — the live model wasn’t reachable just now.' : 'Summarised from the headlines.',
  }
  saveBrief(stateDir, theme.theme_id, { ...out, sig })
  return out
}
