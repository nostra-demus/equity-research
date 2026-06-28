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
import { Budget, getSharedLimiter } from '../triage/budget'
import type { Theme, ThemeCompany, ThemeMember } from './types'

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
}

const CACHE_FILE = 'themes-brief-cache.json'
const CACHE_MAX = 400 // bound the cache file (newest kept) — same discipline as the enrich cache
const LLM_TIMEOUT_MS = 13_000 // user-facing: one short attempt, then fall back (never spin the shimmer)
const LIMITER_WAIT_MS = 2000 // how long we'll wait for a per-minute slot before degrading to deterministic
const UPGRADE_COOLDOWN_MS = 10 * 60_000 // a deterministic brief re-tries the LLM at most this often
const FORCE_COOLDOWN_MS = 30_000 // a ?force=1 regen is ignored if a brief was built this recently (anti-spam)
const EST_TOKENS = 1200 // a brief's rough input(headlines)+output cost — for budget + limiter sizing

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

/** The handful of member stories that best characterise the theme — the union of its highest-scored and
 *  its most-recent items, deduped. Both lenses matter: score captures prominence, recency captures a
 *  fresh development that hasn't accrued a score yet. Used to build the PROMPT (we want the freshest news
 *  in front of the model). The cache SIGNATURE deliberately uses a more stable basis — see briefSig. */
export function representativeMembers(theme: Theme, n = 12): ThemeMember[] {
  const ms = theme.members || []
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
  return [...(theme.members || [])].sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, n).map(headlineOf)
}

/** A content signature that changes only when the SUBSTANCE of the theme changes — its name, its named
 *  companies, or its most prominent (highest-scored) headlines. It deliberately ignores pure recency, so
 *  steady background flow that doesn't change the top stories keeps the same signature (served from cache,
 *  not re-generated); a genuinely big new story scores high enough to enter the top set and busts it. */
function briefSig(theme: Theme): string {
  const heads = signatureHeadlines(theme).sort()
  const cos = (theme.companies || []).map((c) => c.name).filter(realName).slice(0, 6).sort()
  return createHash('sha256').update(JSON.stringify({ n: theme.name, h: heads, c: cos })).digest('hex').slice(0, 16)
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
  const members = representativeMembers(theme)
  const cos = (theme.companies || []).map((c) => c.name).filter(realName).slice(0, 4)
  const topHead = members[0] ? headlineOf(members[0]) : ''
  const n = theme.member_count_total || (theme.members?.length ?? 0)
  const affinity = (theme.event_type_affinity || []).slice(0, 3).map(humanizeType).filter(Boolean)
  const distinctCos = new Set((theme.companies || []).map((c) => c.name_key)).size

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
    (theme.companies || [])
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

async function callGroq(cfg: BriefConfig, user: string, fetchFn: typeof fetch): Promise<string> {
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
  if (!res.ok) throw new Error(`groq HTTP ${res.status}`)
  const data: any = await res.json()
  const text = data?.choices?.[0]?.message?.content
  return typeof text === 'string' ? text : ''
}

/** One brief from Groq, on the SHARED free-tier budget + per-minute limiter (so the brief never
 *  collectively busts the day's Groq quota or races the live scanner's per-minute window). Returns the
 *  validated brief text, or null if the budget/limiter is unavailable, the call fails, or the reply is
 *  too short. Never throws. A 4xx/429 exhausts today's budget so subsequent briefs skip Groq until reset
 *  (exactly like the ingester + the on-demand article read). */
async function tryGroqBrief(theme: Theme, cfg: BriefConfig, stateDir: string, fetchFn: typeof fetch): Promise<string | null> {
  const budget = Budget.load(stateDir, cfg.groqDailyReqCap ?? 13_000, cfg.groqDailyTokenCap ?? 500_000, Date.now(), 'groq-budget.json')
  if (!budget.canSpend(EST_TOKENS)) return null
  const limiter = getSharedLimiter(cfg.groqRpm ?? 28, cfg.groqTpm ?? 6000)
  const got = await limiter.acquire(EST_TOKENS, undefined, undefined, LIMITER_WAIT_MS)
  if (!got) return null // per-minute window busy — degrade rather than make the user wait
  try {
    const text = await callGroq(cfg, buildUserMessage(theme), fetchFn)
    budget.record(1, EST_TOKENS)
    budget.save()
    const brief = parseBriefJson(text)
    return brief && brief.length >= 40 ? brief.slice(0, 900) : null
  } catch (e: any) {
    budget.record(1, EST_TOKENS)
    if (/HTTP (4\d\d|429)/.test(String(e?.message || ''))) budget.exhaust()
    budget.save()
    return null
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
