// The themes discovery LLM pass — the ONE place the news ingester can spend Claude money (everything
// else is free Groq + deterministic). It takes the freshly-clustered themes (already formed
// deterministically) and only NAMES + VALIDATES them: a good narrative name, a one-line plain-English
// description, refined keyword anchors, and a yes/no "is this a real investable theme". The clustering
// stays deterministic, so turning this off (no key / model 'off' / budget hit) degrades gracefully to
// the deterministic baseline. Budget-guarded by a daily call cap; never throws.

import fs from 'node:fs'
import path from 'node:path'
import { companyKeys } from '../text-match'
import { Budget, clearCooldown, conservativeChatTokenBound, isCoolingDown, type BudgetReservation } from '../triage/budget'
import type { LlmNamer } from './engine'
import type { Theme } from './types'

interface NamerCfg {
  themesDiscoverModel?: string // 'claude-haiku' | 'groq' | 'off'
  themesClaudeModel?: string
  themesClaudeApiKey?: string
  themesClaudeBaseUrl?: string
  themesClaudeDailyCap?: number
  groqApiKey?: string
  groqBaseUrl?: string
  groqModel?: string
  // the Groq daily caps — so the namer's Groq seam charges + gates against the ingester's exact budget file
  // (populated automatically: runCycle passes the full NEWS config).
  groqDailyReqCap?: number
  groqDailyTokenCap?: number
}

const SYSTEM =
  'You are a buy-side thematic analyst. You are given CLUSTERS of recent news headlines that were already grouped by topical overlap. ' +
  'For each cluster decide whether it is a coherent, investable market THEME — a multi-company narrative a portfolio manager would track and could play (e.g. "AI data-center buildout", "China stimulus rebound", "GLP-1 weight-loss drugs"). ' +
  'A single company\'s one-off news is NOT a theme. ' +
  'A cluster that is only routine regulatory paperwork — stake-disclosure filings (SAST/Reg 29), AGM/EGM notices or poll results, board-meeting outcomes, "results for the year/period ended" calendar notices, routine prospectus takedowns — is NOT a theme: return is_theme:false for it. ' +
  'The name and description must accurately describe the MAJORITY of the sample headlines — never a narrative the headlines do not support. If the items are unified only by a shared event type or a filing formality, return is_theme:false. ' +
  'Return ONLY JSON: {"themes":[{"i":<cluster index>,"is_theme":true|false,"name":"<short narrative name, ≤6 words>","slug":"<kebab-case>","description":"<one plain-English sentence a non-specialist understands>","keywords":["<lowercase anchor terms>"]}]}. Include every cluster index exactly once. No prose outside the JSON.'

const budgetPath = (stateDir: string) => path.join(stateDir, 'themes-llm-budget.json')

function canSpend(stateDir: string, cap: number, todayISO: string): boolean {
  if (cap <= 0) return false
  try {
    const b = JSON.parse(fs.readFileSync(budgetPath(stateDir), 'utf8'))
    if (b?.date === todayISO) return (Number(b.calls) || 0) < cap
  } catch {}
  return true
}
function recordSpend(stateDir: string, todayISO: string): void {
  try {
    let calls = 0
    try {
      const b = JSON.parse(fs.readFileSync(budgetPath(stateDir), 'utf8'))
      if (b?.date === todayISO) calls = Number(b.calls) || 0
    } catch {}
    fs.mkdirSync(stateDir, { recursive: true })
    fs.writeFileSync(budgetPath(stateDir), JSON.stringify({ date: todayISO, calls: calls + 1 }) + '\n')
  } catch {}
}

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60)

/** Defensive: pull the {"themes":[...]} object out of an LLM text response. */
function parseThemesJson(text: string): any[] {
  try {
    const start = text.indexOf('{')
    const end = text.lastIndexOf('}')
    if (start < 0 || end <= start) return []
    const o = JSON.parse(text.slice(start, end + 1))
    return Array.isArray(o?.themes) ? o.themes : []
  } catch {
    return []
  }
}

/** Sample member headlines STRATIFIED by company — one per distinct company first (newest first), then
 *  fill with the rest. The naive newest-8 slice showed the namer a homogeneous wire burst and invited a
 *  fabricated narrative ("Digital Media Growth" over a pile of results notices); a company-spread sample
 *  shows the cluster's real breadth. */
function sampleHeadlines(t: Theme, cap = 8): string[] {
  const seen = new Set<string>()
  const primary: string[] = []
  const rest: string[] = []
  for (let i = t.members.length - 1; i >= 0; i--) {
    const m = t.members[i]
    const k = companyKeys(m.companies).values().next().value as string | undefined
    if (k && !seen.has(k)) { seen.add(k); primary.push(m.headline) } else rest.push(m.headline)
  }
  return [...primary, ...rest].slice(0, cap)
}

function buildUserMessage(created: Theme[]): string {
  const blocks = created.map((t, i) => {
    const heads = sampleHeadlines(t).map((h) => `   - ${h}`).join('\n')
    const cos = t.companies.slice(0, 8).map((c) => c.name).join(', ') || '(none named)'
    return `Cluster ${i} (companies: ${cos}):\n${heads}`
  })
  return `Classify and name these ${created.length} clusters:\n\n${blocks.join('\n\n')}`
}

/** Worst-case billable tokens for one Groq theme-namer attempt (the caller sends at most eight themes). */
export function themeNamerTokenBound(created: Theme[]): number {
  return conservativeChatTokenBound(SYSTEM, buildUserMessage(created.slice(0, 8)), 1200)
}

async function callClaude(cfg: NamerCfg, user: string, fetchFn: typeof fetch): Promise<string | null> {
  const res = await fetchFn(`${cfg.themesClaudeBaseUrl}/v1/messages`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': cfg.themesClaudeApiKey || '', 'anthropic-version': '2023-06-01' },
    signal: AbortSignal.timeout(30_000), // never let a hung connection stall the themes cycle
    body: JSON.stringify({ model: cfg.themesClaudeModel || 'claude-haiku-4-5', max_tokens: 1200, system: SYSTEM, messages: [{ role: 'user', content: user }] }),
  })
  if (!res.ok) throw new Error(`claude HTTP ${res.status}`)
  const data: any = await res.json()
  const text = Array.isArray(data?.content) ? data.content.filter((c: any) => c?.type === 'text').map((c: any) => c.text).join('') : ''
  return typeof text === 'string' ? text : null
}

async function callGroq(cfg: NamerCfg, user: string, fetchFn: typeof fetch): Promise<{ text: string | null; tokens: number }> {
  const res = await fetchFn(`${cfg.groqBaseUrl}/chat/completions`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${cfg.groqApiKey}` },
    signal: AbortSignal.timeout(30_000), // never let a hung connection stall the themes cycle
    body: JSON.stringify({ model: cfg.groqModel, temperature: 0.2, max_tokens: 1200, response_format: { type: 'json_object' }, messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content: user }] }),
  })
  if (!res.ok) throw new Error(`groq HTTP ${res.status}`)
  const data: any = await res.json()
  const text = data?.choices?.[0]?.message?.content
  return { text: typeof text === 'string' ? text : null, tokens: Number(data?.usage?.total_tokens) || 0 }
}

/** Apply LLM proposals to the created themes in place (rename/validate). Coerced defensively. */
function applyProposals(created: Theme[], proposals: any[]): void {
  const byIndex = new Map<number, any>()
  for (const p of proposals) {
    const i = Number(p?.i)
    if (Number.isInteger(i) && i >= 0 && i < created.length && !byIndex.has(i)) byIndex.set(i, p)
  }
  created.forEach((t, i) => {
    const p = byIndex.get(i)
    if (!p) return // model omitted → keep deterministic name (a needs_rename flag stays for the next pass)
    delete t.needs_rename // processed — either renamed below or judged not-a-theme
    if (p.is_theme === false) {
      t.status = 'retired' // not a real theme — drop it
      return
    }
    const name = typeof p.name === 'string' ? p.name.trim().slice(0, 80) : ''
    if (name) {
      t.name = name
      t.slug = (typeof p.slug === 'string' && slugify(p.slug)) || slugify(name)
    }
    if (typeof p.description === 'string' && p.description.trim()) t.description = p.description.trim().slice(0, 240)
    if (Array.isArray(p.keywords)) {
      const kw = p.keywords.filter((k: any) => typeof k === 'string' && k.trim()).map((k: string) => k.toLowerCase().trim()).slice(0, 12)
      if (kw.length) t.keywords = [...new Set([...kw, ...t.keywords])].slice(0, 14)
    }
    t.generation = 'claude'
    t.rev++
  })
}

/** Build the LlmNamer used by the discovery pass, or undefined to stay fully deterministic. */
export function makeThemeNamer(cfg: NamerCfg, fetchFn: typeof fetch, stateDir: string, log: (m: string) => void = () => {}): LlmNamer | undefined {
  const model = cfg.themesDiscoverModel || 'claude-haiku'
  const useClaude = model.startsWith('claude') && !!cfg.themesClaudeApiKey
  const useGroq = (model === 'groq' || (!useClaude && model.startsWith('claude'))) && !!cfg.groqApiKey
  if (model === 'off' || (!useClaude && !useGroq)) return undefined

  return async (created: Theme[], now: Date): Promise<void> => {
    if (!created.length) return
    const batch = created.slice(0, 8) // cap clusters per call
    const user = buildUserMessage(batch)
    const perAttemptTokens = themeNamerTokenBound(batch)
    const todayISO = now.toISOString().slice(0, 10)
    const cap = useClaude ? (cfg.themesClaudeDailyCap ?? 60) : 1e9 // Groq shares its own caps below; Claude is the metered seam
    if (useClaude && !canSpend(stateDir, cap, todayISO)) {
      log('themes: claude daily cap reached — naming deterministically this pass')
      return
    }
    // GROQ seam: the namer READS the shared Groq cooldown + daily cap (so it never probes a Groq a recent
    // triage/read failure marked down, nor exceeds the daily cap) and CHARGES its calls to groq-budget.json
    // (closing the "uncounted Groq spend" desync). It deliberately does NOT *arm* the shared marker: unlike
    // triage/reads it is UNPACED (no shared RateLimiter) and hits the per-minute cap routinely, so its 429s
    // are the expected/benign case — arming on them would sideline a HEALTHY primary Groq. Arming is left to
    // the paced, high-volume seams (triage + the article reader), which are the reliable outage signal.
    let groqBudget: Budget | null = null
    if (useGroq) {
      if (isCoolingDown(stateDir, 'groq', now.getTime())) { log('themes: groq cooling down — naming deterministically this pass'); return }
      groqBudget = Budget.load(stateDir, cfg.groqDailyReqCap ?? 13_000, cfg.groqDailyTokenCap ?? 500_000, now.getTime())
      if (!groqBudget.canSpend(perAttemptTokens)) { log('themes: groq daily cap reached — naming deterministically this pass'); return }
    }
    // Naming runs AFTER the write, so it can afford to retry across a rate-limit window — the Groq
    // per-minute cap is usually exhausted by triage this cycle, but resets within ~60s. 3 attempts.
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
    for (let attempt = 1; attempt <= 3; attempt++) {
      let reservation: BudgetReservation | null = null
      try {
        let text: string | null
        if (useClaude) text = await callClaude(cfg, user, fetchFn)
        else {
          reservation = groqBudget!.tryReserve(perAttemptTokens)
          if (!reservation) { log('themes: groq daily cap reached — naming deterministically this pass'); return }
          const result = await callGroq(cfg, user, fetchFn)
          groqBudget!.reconcile(reservation, 1, result.tokens || perAttemptTokens)
          reservation = null
          text = result.text
        }
        if (useClaude) recordSpend(stateDir, todayISO)
        else clearCooldown(stateDir, 'groq') // Groq answered → count it, mark healthy
        if (!text) return
        applyProposals(batch, parseThemesJson(text))
        log(`themes: named ${batch.length} new theme${batch.length === 1 ? '' : 's'} via ${useClaude ? 'claude' : 'groq'}`)
        return
      } catch (e: any) {
        // Provider errors often omit usage even though the request consumed quota. Charge the conservative
        // per-attempt estimate; reconciling to zero would reopen token headroom for work already sent.
        if (reservation) groqBudget!.reconcile(reservation, 1, perAttemptTokens)
        const transient = /HTTP (429|5\d\d)/.test(String(e?.message || ''))
        if (attempt === 3 || !transient) {
          // NB: do NOT arm the shared cooldown here — a benign per-minute 429 (the expected case for this
          // unpaced seam) must not sideline the healthy primary Groq. Just fall back to deterministic names.
          log(`themes namer: ${e?.message || e} — keeping deterministic names`)
          return
        }
        await sleep(8000 * attempt) // 8s, 16s — let the Groq per-minute limit reset
      }
    }
  }
}
