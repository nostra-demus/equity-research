// The themes discovery LLM pass. It takes deterministically formed candidate clusters and only NAMES +
// VALIDATES them: a good narrative name, a one-line plain-English description, refined keyword anchors,
// and a yes/no "is this a real investable theme". The clustering stays deterministic. Validation routes
// through the configured Claude, local, Groq, and overflow provider chain under the same budgets,
// limiters, and cooldowns as the rest of news intake. A disabled or blocked compiler reports structured
// health instead of weakening the qualification bar. Never throws.

import fs from 'node:fs'
import path from 'node:path'
import { companyKeys, themeNarrativeTokens } from '../text-match'
import { cleanTicker } from '../symbology'
import {
  Budget, NON_BINDING_DAILY_TOKEN_CAP, armCooldown, clearCooldown, conservativeChatTokenBound,
  getNamedLimiter, getSharedLimiter, isCoolingDown, type PaceCfg,
} from '../triage/budget'
import { parseRate } from '../triage/groq'
import type { LlmNamer } from './engine'
import type { Theme, ThemeCompilerAttempt } from './types'
import type { OverflowProvider } from '../../config'
import { resolveThemeFamilyState, themeStoryFamilyKey } from './story-key'
import { selectNarrativeCore } from './core'
import { isDisplayableThemeChallenge, isSupportingThemeEvidence, sourcePriority } from './evidence'
import { uniqueThemeMembers } from './qualification'

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
  groqDailyTokenTarget?: number
  groqPaceFloorFrac?: number
  groqRpm?: number
  groqTpm?: number
  localProvider?: OverflowProvider | null
  overflowProviders?: OverflowProvider[]
  localCooldownMs?: number
  llmCooldownMs?: number
  llmCooldownMaxMs?: number
  themesLimiterWaitMs?: number
  themesProviderAttemptTimeoutMs?: number
  themesProviderChainTimeoutMs?: number
}

const SYSTEM =
  'You are a skeptical buy-side thematic analyst. You are given candidate clusters of dated headlines. Similar words are not a theme. ' +
  'For each cluster decide whether ONE falsifiable economic thesis explains the evidence and maps through a causal mechanism to a named security. ' +
  'A single company\'s one-off news is NOT a theme. ' +
  'A cluster that is only routine regulatory paperwork — stake-disclosure filings (SAST/Reg 29), AGM/EGM notices or poll results, board-meeting outcomes, "results for the year/period ended" calendar notices, routine prospectus takedowns — is NOT a theme: return is_theme:false for it. ' +
  'The name, description and thesis must accurately describe the SAME majority evidence core. If a bridge headline joins separate stories, select only one coherent core and omit the residue. ' +
  'Every evidence ID and company key must come from the input. Mark evidence supports or challenges. A company expression needs a plain economic mechanism and evidence that names it; co-mention alone is not enough. ' +
  'Choose exactly two lowercase single-token anchor_terms that express the stable narrative (not an issuer name or generic market word) and appear together in at least two supporting rows. On an update, keep the prior anchors exactly unless the input marks them CORPUS-GENERIC; then retain the same causal thesis but replace the pair with exact, dense, non-generic anchors. ' +
  'Every row marked PENDING must be classified exactly once: in evidence as supports/challenges, or in context_event_ids when it is related wording but does not change the thesis. ' +
  'An expression with role harmed must use side harmed; never emit a contradictory role and side. ' +
  'why_now must be one current fact and why_now_event_id must be one supporting ID. mechanism_steps must form driver → constraint/change → revenue/cost/capex/price implication. ' +
  'falsifier is an analyst-generated reversal test, not a sourced fact. If the causal chain cannot be stated without invention, return is_theme:false. ' +
  'Return ONLY JSON: {"themes":[{"i":0,"is_theme":true,"name":"short answer-first label","slug":"kebab-case","description":"one plain sentence","keywords":["lowercase anchors"],"narrative":{"thesis":"complete falsifiable economic claim","why_now":"current fact","why_now_event_id":"event id","anchor_terms":["stable","anchors"],"mechanism_steps":["driver","economic transmission","earnings or price implication"],"horizon":"days|weeks|months|years","falsifier":"what observable reversal would break it","evidence":[{"event_id":"event id","stance":"supports|challenges"}],"context_event_ids":["pending event id"],"expressions":[{"name_key":"provided company key","side":"beneficiary|harmed","role":"direct|bottleneck|enabler|harmed|hedge","mechanism":"how this security is economically exposed","evidence_event_ids":["event id"]}]}}]}. Include every cluster index exactly once. No prose outside JSON.'

const NARRATIVE_BATCH = 4 // richer contract than the old label-only pass; keep one reply below truncation

const budgetPath = (stateDir: string) => path.join(stateDir, 'themes-llm-budget.json')

interface ClaudeBudgetState {
  date: string
  calls: number
  exhausted?: boolean
  exhaustion_reason?: string
}

const TERMINAL_PROVIDER_STATUSES = new Set([400, 401, 402, 403, 404, 413])

function terminalReason(status: number): string | undefined {
  return TERMINAL_PROVIDER_STATUSES.has(status) ? `terminal_http_${status}` : undefined
}

function terminalStatus(reason: string | undefined): number | undefined {
  const match = /^terminal_http_(400|401|402|403|404|413)$/.exec(reason || '')
  return match ? Number(match[1]) : undefined
}

function terminalDayMessage(label: string, reason: string | undefined): string {
  const status = terminalStatus(reason)
  return status
    ? `${label} is unavailable for the rest of its provider day after HTTP ${status}.`
    : `${label} has no daily compiler capacity.`
}

function readClaudeBudget(stateDir: string, todayISO: string): ClaudeBudgetState {
  const fresh: ClaudeBudgetState = { date: todayISO, calls: 0 }
  try {
    const raw = JSON.parse(fs.readFileSync(budgetPath(stateDir), 'utf8'))
    if (raw?.date !== todayISO) return fresh
    const reason = typeof raw.exhaustion_reason === 'string' && terminalStatus(raw.exhaustion_reason)
      ? raw.exhaustion_reason
      : undefined
    return {
      date: todayISO,
      calls: Math.max(0, Number(raw.calls) || 0),
      ...(raw.exhausted === true ? { exhausted: true } : {}),
      ...(reason ? { exhaustion_reason: reason } : {}),
    }
  } catch {}
  return fresh
}

function saveClaudeBudget(stateDir: string, state: ClaudeBudgetState): void {
  try {
    fs.mkdirSync(stateDir, { recursive: true })
    fs.writeFileSync(budgetPath(stateDir), JSON.stringify(state) + '\n')
  } catch {}
}

function recordClaudeSpend(stateDir: string, todayISO: string): void {
  const state = readClaudeBudget(stateDir, todayISO)
  state.calls++
  saveClaudeBudget(stateDir, state)
}

function exhaustClaudeDay(stateDir: string, todayISO: string, reason: string): void {
  const state = readClaudeBudget(stateDir, todayISO)
  state.exhausted = true
  state.exhaustion_reason = terminalStatus(reason) ? reason : undefined
  saveClaudeBudget(stateDir, state)
}

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60)

/** Defensive: pull the {"themes":[...]} object out of an LLM text response. */
function parseThemesJson(text: string): { proposals: any[]; valid: boolean } {
  try {
    const start = text.indexOf('{')
    const end = text.lastIndexOf('}')
    if (start < 0 || end <= start) return { proposals: [], valid: false }
    const o = JSON.parse(text.slice(start, end + 1))
    return Array.isArray(o?.themes) ? { proposals: o.themes, valid: true } : { proposals: [], valid: false }
  } catch {
    return { proposals: [], valid: false }
  }
}

/** Sample member headlines STRATIFIED by company — one per distinct company first (newest first), then
 *  fill with the rest. The naive newest-8 slice showed the namer a homogeneous wire burst and invited a
 *  fabricated narrative ("Digital Media Growth" over a pile of results notices); a company-spread sample
 *  shows the cluster's real breadth. */
function sampleMembers(t: Theme, cap = 10): Theme['members'] {
  const memberById = new Map(t.members.map((member) => [member.event_id, member]))
  const out: Theme['members'] = []
  const added = new Set<string>()
  const add = (member?: Theme['members'][number]) => {
    if (!member || added.has(member.event_id) || out.length >= cap) return
    added.add(member.event_id); out.push(member)
  }

  // Drain a bounded FIFO, but reserve room for the prior core so the model can adjudicate updates against
  // the thesis rather than seeing ten new rows with no grounding evidence.
  const pendingIds = new Set(t.pending_narrative_event_ids || [])
  const selectedPendingIds = new Set((t.pending_narrative_event_ids || []).slice(0, Math.min(6, cap)))
  for (const eventId of selectedPendingIds) add(memberById.get(eventId))
  if (t.narrative) {
    add(memberById.get(t.narrative.why_now_event_id))
    for (const expression of t.narrative.expressions) for (const eventId of expression.evidence_event_ids) add(memberById.get(eventId))
    for (const evidence of t.narrative.evidence) add(memberById.get(evidence.event_id))
  }

  const seenCompanies = new Set<string>()
  const primary: Theme['members'] = []
  const rest: Theme['members'] = []
  for (let i = t.members.length - 1; i >= 0; i--) {
    const member = t.members[i]
    const key = companyKeys(member.companies).values().next().value as string | undefined
    if (key && !seenCompanies.has(key)) { seenCompanies.add(key); primary.push(member) } else rest.push(member)
  }
  for (const member of [...primary, ...rest]) {
    // Do not let the stratified filler jump ahead of the bounded pending FIFO. Otherwise a seventh new
    // row can slip into a nominal six-row adjudication batch merely because it names a new company.
    if (pendingIds.has(member.event_id) && !selectedPendingIds.has(member.event_id)) continue
    add(member)
  }
  return out
}

function buildUserMessage(created: Theme[], generic?: Set<string>): string {
  const blocks = created.map((t, i) => {
    const pending = new Set(t.pending_narrative_event_ids || [])
    const heads = sampleMembers(t).map((m) => `   - ${pending.has(m.event_id) ? '[PENDING — classify] ' : ''}[${m.event_id}] [${m.tier}] [${m.found_at}] ${m.headline}`).join('\n')
    const cos = t.companies.slice(0, 12).map((c) => `${c.name_key}|${c.ticker || 'NO_TICKER'}|${c.name}`).join(', ') || '(none named)'
    const priorAnchorsGeneric = Boolean(t.narrative?.anchor_terms?.some((anchor) => generic?.has(anchor)))
    const prior = t.narrative
      ? `\nPrior validated thesis (update this same thesis; classify new rows as support/challenge/context):\n` +
        `   Thesis: ${t.narrative.thesis}\n   Anchors: ${t.narrative.anchor_terms.join(' + ')}${priorAnchorsGeneric ? ' [CORPUS-GENERIC — replace both anchors, not the thesis]' : ''}\n` +
        `   Prior why-now: ${t.narrative.why_now}\n   Prior expressions: ${t.narrative.expressions.map((expression) => expression.name_key).join(', ') || 'none'}`
      : ''
    return `Cluster ${i}\nCompany keys | tickers | names: ${cos}${prior}\nEvidence rows:\n${heads}`
  })
  return `Classify and name these ${created.length} clusters:\n\n${blocks.join('\n\n')}`
}

/** Worst-case billable tokens for one bounded theme-namer attempt. Production sends one theme per request. */
export function themeNamerTokenBound(created: Theme[], generic?: Set<string>, maxOutputTokens = 3000): number {
  return conservativeChatTokenBound(SYSTEM, buildUserMessage(created.slice(0, NARRATIVE_BATCH), generic), maxOutputTokens)
}

/** AbortSignal is advisory for injected/local fetch adapters, so race the complete response read with our
 * own timer as well. A provider that ignores abort, or stalls after headers, can never hold the compiler
 * beyond its per-attempt/remaining-chain budget. */
async function withProviderTimeout<T>(timeoutMs: number, run: (signal: AbortSignal) => Promise<T>): Promise<T> {
  const controller = new AbortController()
  const boundedMs = Math.max(1, Math.floor(timeoutMs))
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race([
      run(controller.signal),
      new Promise<T>((_resolve, reject) => {
        timer = setTimeout(() => {
          controller.abort()
          reject(new Error('theme provider request timed out'))
        }, boundedMs)
      }),
    ])
  } finally {
    if (timer) clearTimeout(timer)
  }
}

function boundedAttemptTimeout(cfg: NamerCfg, deadline: number, providerTimeoutMs?: number): number {
  const attemptCap = Math.max(1, Math.floor(cfg.themesProviderAttemptTimeoutMs ?? 25_000))
  const providerCap = Number.isFinite(providerTimeoutMs) && Number(providerTimeoutMs) > 0
    ? Math.floor(Number(providerTimeoutMs))
    : attemptCap
  return Math.max(1, Math.min(attemptCap, providerCap, deadline - Date.now()))
}

interface ClaudeCallResult {
  text: string | null
  ok: boolean
  status: number
  note: string
}

async function callClaude(cfg: NamerCfg, user: string, fetchFn: typeof fetch, timeoutMs: number): Promise<ClaudeCallResult> {
  return withProviderTimeout(timeoutMs, async (signal) => {
    const res = await fetchFn(`${cfg.themesClaudeBaseUrl}/v1/messages`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': cfg.themesClaudeApiKey || '', 'anthropic-version': '2023-06-01' },
      signal,
      body: JSON.stringify({ model: cfg.themesClaudeModel || 'claude-haiku-4-5', max_tokens: 3000, system: SYSTEM, messages: [{ role: 'user', content: user }] }),
    })
    if (!res.ok) return { text: null, ok: false, status: res.status, note: `Claude HTTP ${res.status}` }
    try {
      const data: any = await res.json()
      const text = Array.isArray(data?.content) ? data.content.filter((c: any) => c?.type === 'text').map((c: any) => c.text).join('') : ''
      return typeof text === 'string' && text
        ? { text, ok: true, status: res.status, note: '' }
        : { text: null, ok: false, status: res.status, note: 'Claude returned empty theme content.' }
    } catch {
      return { text: null, ok: false, status: res.status, note: 'Claude returned invalid response JSON.' }
    }
  })
}

interface OpenAiThemeProvider {
  id: string
  label: string
  apiKey: string
  baseUrl: string
  model: string
  models?: string[]
  maxTokens: number
  rpm: number
  tpm: number
  dailyReqCap: number
  dailyTokenCap: number
  budgetFile: string
  dayTz?: string
  headers?: Record<string, string>
  extraBody?: Record<string, unknown>
  timeoutMs?: number
  pace?: PaceCfg
}

interface OpenAiCallResult {
  text: string | null
  tokens: number
  ok: boolean
  status: number
  note: string
  rate: ReturnType<typeof parseRate>
}

async function callOpenAi(provider: OpenAiThemeProvider, user: string, maxTokens: number, fetchFn: typeof fetch, timeoutMs: number): Promise<OpenAiCallResult> {
  return withProviderTimeout(timeoutMs, async (signal) => {
    const res = await fetchFn(`${provider.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${provider.apiKey}`, ...(provider.headers || {}) },
      signal,
      body: JSON.stringify({
        model: provider.model,
        ...(provider.models?.length ? { models: provider.models } : {}),
        temperature: 0.2,
        max_tokens: maxTokens,
        response_format: { type: 'json_object' },
        messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content: user }],
        ...(provider.extraBody || {}),
      }),
    })
    const rate = parseRate(res)
    if (!res.ok) {
      // Provider bodies can contain organization names, billing details, request ids, or echoed account
      // metadata. Compiler health is persisted and served to clients, so only the fixed public status class
      // may cross this boundary.
      return { text: null, tokens: 0, ok: false, status: res.status, note: `${provider.label} HTTP ${res.status}`, rate }
    }
    try {
      const data: any = await res.json()
      const text = data?.choices?.[0]?.message?.content
      if (data?.choices?.[0]?.finish_reason === 'length') {
        return { text: null, tokens: Number(data?.usage?.total_tokens) || 0, ok: false, status: res.status, note: `${provider.label}: output truncated`, rate }
      }
      return {
        text: typeof text === 'string' ? text : null,
        tokens: Number(data?.usage?.total_tokens) || 0,
        ok: typeof text === 'string',
        status: res.status,
        note: typeof text === 'string' ? '' : `${provider.label}: empty content`,
        rate,
      }
    } catch {
      return { text: null, tokens: 0, ok: false, status: res.status, note: `${provider.label}: invalid response JSON`, rate }
    }
  })
}

/** Apply LLM proposals to the created themes in place. Model prose is never trusted as provenance: IDs,
 * anchors, companies, tickers and expression proof are joined back to the raw cluster before persistence. */
function applyProposals(
  created: Theme[],
  proposals: any[],
  generation: 'claude' | 'groq' | 'llm',
  now: Date,
  generic?: Set<string>,
  validatorProvider?: string,
): void {
  const byIndex = new Map<number, any>()
  for (const p of proposals) {
    const i = Number(p?.i)
    if (Number.isInteger(i) && i >= 0 && i < created.length && !byIndex.has(i)) byIndex.set(i, p)
  }
  created.forEach((t, i) => {
    const p = byIndex.get(i)
    if (!p) return // model omitted → keep validation/rename flags so a later discovery pass retries
    if (p.is_theme === false) {
      // A bare negative verdict may reject a fresh cluster, but it is not sourced disconfirmation of an
      // already validated thesis. Keep the established contract and its queue intact; an update can retire
      // it only after the model returns an explicit, event-bound challenge that the normal compiler accepts.
      if (t.narrative) return
      delete t.needs_rename // explicitly judged not-a-theme
      delete t.needs_validation
      delete t.needs_narrative_update
      delete t.pending_narrative_event_ids
      delete t.validation_queued_at
      delete t.validation_attempted_at
      t.status = 'retired' // not a real theme — drop it
      t.rev++
      return
    }
    // Fail closed on a malformed/partial proposal. `generation` is the public qualification proof that
    // a model explicitly validated this cluster, so an omitted/string-valued verdict must never grant it.
    // Leave the deterministic cluster as Context and let a later discovery pass try again.
    if (p.is_theme !== true) return
    const name = typeof p.name === 'string' ? p.name.trim().slice(0, 80) : ''
    const description = typeof p.description === 'string' ? p.description.trim().slice(0, 240) : ''
    // `is_theme:true` without the required narrative copy is still a partial/malformed proposal. Clearing
    // the queue here upgrades generation but leaves the deterministic "x · y" / "Recurring news around"
    // label in permanent Context with no future retry (and can bless stale prose on an active legacy row).
    const rawNarrative = p.narrative && typeof p.narrative === 'object' && !Array.isArray(p.narrative) ? p.narrative : null
    const text = (value: unknown, cap: number): string => typeof value === 'string' ? value.trim().slice(0, cap) : ''
    const thesis = text(rawNarrative?.thesis, 360)
    const whyNow = text(rawNarrative?.why_now, 360)
    const whyNowEventId = text(rawNarrative?.why_now_event_id, 160)
    const rawAnchors: unknown[] = Array.isArray(rawNarrative?.anchor_terms) ? rawNarrative.anchor_terms as unknown[] : []
    const proposedAnchors: string[] = rawAnchors.length === 2 && rawAnchors.every((value): value is string => typeof value === 'string' && value.trim().length > 0)
      ? [...new Set<string>(rawAnchors.map((value) => value.toLowerCase().trim()))]
      : []
    const falsifier = text(rawNarrative?.falsifier, 360)
    const horizon = ['days', 'weeks', 'months', 'years'].includes(rawNarrative?.horizon) ? rawNarrative.horizon : null
    const mechanismSteps = Array.isArray(rawNarrative?.mechanism_steps)
      ? rawNarrative.mechanism_steps.filter((value: unknown) => typeof value === 'string' && value.trim()).map((value: string) => value.trim().slice(0, 260)).slice(0, 4)
      : []
    if (!name || !description || thesis.length < 30 || whyNow.length < 15 || falsifier.length < 15 || !horizon || mechanismSteps.length < 2 || proposedAnchors.length !== 2) return

    const memberById = new Map(t.members.map((member) => [member.event_id, member]))
    const rawEvidence = Array.isArray(rawNarrative?.evidence) ? rawNarrative.evidence : []
    const promptedIds = new Set(sampleMembers(t).map((member) => member.event_id))
    const proposedSupport = new Set<string>()
    const proposedChallenges = new Set<string>()
    for (const value of rawEvidence) {
      const eventId = text(value?.event_id, 160)
      if (!eventId || !memberById.has(eventId) || !promptedIds.has(eventId)) return
      if (value?.stance === 'supports') {
        // A conflict in one reply is resolved conservatively: challenge wins regardless of array order.
        if (!proposedChallenges.has(eventId)) proposedSupport.add(eventId)
      } else if (value?.stance === 'challenges') {
        proposedSupport.delete(eventId)
        proposedChallenges.add(eventId)
      }
      else return
    }
    const proposedContext = new Set<string>()
    for (const value of (Array.isArray(rawNarrative?.context_event_ids) ? rawNarrative.context_event_ids : [])) {
      const eventId = text(value, 160)
      if (!eventId || !memberById.has(eventId) || !promptedIds.has(eventId)) return
      // Evidence is the stronger classification in one reply; challenges have already won support
      // conflicts above. Repeated context IDs are harmless and collapse in the set.
      if (!proposedSupport.has(eventId) && !proposedChallenges.has(eventId)) proposedContext.add(eventId)
    }
    const promptedPendingIds = new Set(
      (t.pending_narrative_event_ids || []).filter((eventId) => promptedIds.has(eventId)),
    )
    const classifiedPendingIds = new Set([...proposedSupport, ...proposedChallenges, ...proposedContext])
    if ([...promptedPendingIds].some((eventId) => !classifiedPendingIds.has(eventId))) return
    // Build one latest-classification map. The prior snapshot is the baseline; every ID explicitly
    // classified in this reply overrides it. This makes a new challenge/context able to erase an older
    // support label instead of letting historical insertion order decide the thesis.
    type Classification = 'supports' | 'challenges' | 'context'
    const classifications = new Map<string, Classification>()
    for (const eventId of t.narrative?.context_event_ids || []) if (memberById.has(eventId)) classifications.set(eventId, 'context')
    for (const row of t.narrative?.evidence || []) {
      if (!memberById.has(row.event_id)) continue
      const prior = classifications.get(row.event_id)
      if (row.stance === 'challenges' || prior !== 'challenges') classifications.set(row.event_id, row.stance)
    }
    const latestClassifiedIds = new Set([...proposedSupport, ...proposedChallenges, ...proposedContext])
    for (const eventId of latestClassifiedIds) classifications.delete(eventId)
    for (const eventId of proposedContext) classifications.set(eventId, 'context')
    for (const eventId of proposedSupport) {
      const member = memberById.get(eventId)
      // Low-quality/anonymous rows can be reviewed as context, but cannot be persisted as support.
      classifications.set(eventId, isSupportingThemeEvidence(member) ? 'supports' : 'context')
    }
    for (const eventId of proposedChallenges) {
      const member = memberById.get(eventId)
      classifications.set(eventId, isDisplayableThemeChallenge(member) ? 'challenges' : 'context')
    }
    const activeFamilyState = resolveThemeFamilyState([...classifications].flatMap(([eventId, stance]) => {
      const member = memberById.get(eventId)
      if (!member) return []
      if (stance === 'supports' && !isSupportingThemeEvidence(member)) return []
      if (stance === 'challenges' && !isDisplayableThemeChallenge(member)) return []
      return [{ member, stance }]
    }), (member) => sourcePriority(member.tier))
    const activeSupportIds = new Set(activeFamilyState
      .filter((row) => row.stance === 'supports')
      .map((row) => String(row.member.event_id)))
    const supportedRows = uniqueThemeMembers(activeFamilyState
      .filter((row) => row.stance === 'supports')
      .map((row) => row.member)
      .filter(isSupportingThemeEvidence))
    const priorAnchorsAreGeneric = Boolean(t.narrative?.anchor_terms?.some((anchor) => generic?.has(anchor)))
    // An established causal identity cannot be silently redefined during a rename or update. A genuinely
    // different anchor pair must form a new deterministic cluster/theme; the sole exception is an explicit
    // re-ground because the old pair became corpus-generic.
    const priorAnchors = t.narrative && !priorAnchorsAreGeneric ? t.narrative.anchor_terms : null
    if (priorAnchors && proposedAnchors.some((anchor) => !priorAnchors.includes(anchor))) return
    if (generic && proposedAnchors.some((anchor) => generic.has(anchor))) return
    const core = selectNarrativeCore(supportedRows, proposedAnchors, generic)
    if (core.anchors.length !== 2 || core.members.length < 2) return
    if (core.anchors.some((anchor) => !proposedAnchors.includes(anchor))) return
    const coreFamilies = new Set(core.members.map(themeStoryFamilyKey))
    const whyNowMember = memberById.get(whyNowEventId)
    if (!whyNowMember || !activeSupportIds.has(whyNowEventId) || !coreFamilies.has(themeStoryFamilyKey(whyNowMember))) return

    const companyByKey = new Map(t.companies.map((company) => [company.name_key, company]))
    const roles = new Set(['direct', 'bottleneck', 'enabler', 'harmed', 'hedge'])
    const expressions: NonNullable<Theme['narrative']>['expressions'] = []
    const seenExpressions = new Set<string>()
    const rawExpressions = Array.isArray(rawNarrative?.expressions) ? rawNarrative.expressions : []
    const rawExpressionKeys = rawExpressions.map((value: any) => text(value?.name_key, 160)).filter(Boolean)
    if (new Set(rawExpressionKeys).size !== rawExpressionKeys.length) return
    for (const value of rawExpressions) {
      const nameKey = text(value?.name_key, 160)
      const company = companyByKey.get(nameKey)
      const mechanism = text(value?.mechanism, 300)
      if (!company || !cleanTicker(company.ticker) || !mechanism || seenExpressions.has(nameKey)) continue
      if (!roles.has(value?.role) || (value?.side !== 'beneficiary' && value?.side !== 'harmed')) continue
      if (value.role === 'harmed' && value.side !== 'harmed') return
      const evidenceIds: string[] = (Array.isArray(value?.evidence_event_ids) ? value.evidence_event_ids as unknown[] : [])
        .filter((eventId: unknown): eventId is string => typeof eventId === 'string'
          && activeSupportIds.has(eventId)
          && coreFamilies.has(themeStoryFamilyKey(memberById.get(eventId)!)))
        .filter((eventId: string) => companyKeys(memberById.get(eventId)?.companies).has(nameKey))
        .slice(0, 4)
      if (!evidenceIds.length) continue
      seenExpressions.add(nameKey)
      expressions.push({ name_key: nameKey, side: value.side, role: value.role, mechanism, evidence_event_ids: [...new Set(evidenceIds)] })
      if (expressions.length >= 6) break
    }

    const byNewest = (a: string, b: string) => Date.parse(memberById.get(b)?.found_at || '') - Date.parse(memberById.get(a)?.found_at || '')
    const supportIds = [...new Set([whyNowEventId, ...core.members.map((member) => member.event_id)])]
      .filter((eventId) => activeSupportIds.has(eventId))
    const historicalSupportIds = [...classifications]
      .filter(([eventId, stance]) => stance === 'supports' && isSupportingThemeEvidence(memberById.get(eventId)))
      .map(([eventId]) => eventId)
      .sort(byNewest)
    const challengeIds = [...classifications]
      .filter(([eventId, stance]) => stance === 'challenges' && isDisplayableThemeChallenge(memberById.get(eventId)))
      .map(([eventId]) => eventId)
      .sort(byNewest)
    const contextEventIds = [...classifications]
      .filter(([, stance]) => stance === 'context')
      .map(([eventId]) => eventId)
      .slice(-400)
    const evidence: NonNullable<Theme['narrative']>['evidence'] = [
      ...[...new Set([...supportIds, ...historicalSupportIds])].map((eventId) => ({ event_id: eventId, stance: 'supports' as const })),
      ...challengeIds.map((eventId) => ({ event_id: eventId, stance: 'challenges' as const })),
    ]
    delete t.needs_rename // explicitly validated and re-grounded by this same complete proposal
    delete t.needs_validation
    const classifiedPromptIds = new Set(
      [...proposedSupport, ...proposedChallenges, ...proposedContext].filter((eventId) => promptedIds.has(eventId)),
    )
    const remainingPending = (t.pending_narrative_event_ids || []).filter((eventId) => !classifiedPromptIds.has(eventId))
    if (remainingPending.length || t.narrative_update_overflow) {
      // A hard-cap overflow means at least one unclassified row is no longer present in this record. Even
      // a complete reply for every visible FIFO row cannot classify the missing observation, so retain the
      // fail-closed quarantine instead of treating an empty visible queue as approval.
      if (remainingPending.length) t.pending_narrative_event_ids = remainingPending
      else delete t.pending_narrative_event_ids
      t.needs_narrative_update = true
    } else {
      delete t.pending_narrative_event_ids
      delete t.needs_narrative_update
      delete t.validation_queued_at
      delete t.validation_attempted_at
    }
    t.name = name
    t.slug = (typeof p.slug === 'string' && slugify(p.slug)) || slugify(name)
    t.description = description
    if (Array.isArray(p.keywords)) {
      // Proposed anchors may guide future assignment, so they must be present in at least two distinct
      // underlying stories. A model-written but unsupported word is description prose, not a join key.
      const support = new Map<string, Set<string>>()
      for (const member of t.members) {
        const story = themeStoryFamilyKey(member)
        for (const token of themeNarrativeTokens(member.headline, member.companies, member.tier, generic)) {
          if (!support.has(token)) support.set(token, new Set())
          support.get(token)!.add(story)
        }
      }
      const kw = p.keywords
        .filter((k: any) => typeof k === 'string' && k.trim())
        .map((k: string) => k.toLowerCase().trim())
        .filter((k: string) => !generic?.has(k))
        .filter((k: string) => (support.get(k)?.size || 0) >= 2)
        .slice(0, 12)
      t.keywords = [...new Set([...core.anchors, ...kw])].slice(0, 14)
    } else {
      t.keywords = [...core.anchors]
    }
    t.narrative = {
      version: 1,
      thesis,
      why_now: whyNow,
      why_now_event_id: whyNowEventId,
      mechanism_steps: mechanismSteps,
      horizon,
      falsifier,
      anchor_terms: proposedAnchors as [string, string],
      evidence,
      context_event_ids: contextEventIds,
      expressions,
      validated_at: now.toISOString().replace(/\.\d{3}Z$/, 'Z'),
    }
    t.generation = generation
    if (generation === 'llm' && validatorProvider) t.validator_provider = validatorProvider
    else delete t.validator_provider
    t.rev++
  })
}

function openAiProviders(cfg: NamerCfg): OpenAiThemeProvider[] {
  const out: OpenAiThemeProvider[] = []
  const seen = new Set<string>()
  const add = (provider: OpenAiThemeProvider | null | undefined) => {
    if (!provider?.apiKey || seen.has(provider.id)) return
    seen.add(provider.id); out.push(provider)
  }
  const fromConfig = (p: OverflowProvider): OpenAiThemeProvider => ({
    id: p.id, label: p.label || p.id, apiKey: p.apiKey, baseUrl: p.baseUrl, model: p.model,
    models: p.models, maxTokens: p.maxTokens, rpm: p.rpm, tpm: p.tpm ?? 0,
    dailyReqCap: p.dailyReqCap, dailyTokenCap: p.dailyTokenCap ?? NON_BINDING_DAILY_TOKEN_CAP,
    budgetFile: p.budgetFile, dayTz: p.dayTz, headers: p.headers, extraBody: p.extraBody,
    timeoutMs: p.timeoutMs,
  })
  if (cfg.localProvider) add(fromConfig(cfg.localProvider))
  if (cfg.groqApiKey) add({
    id: 'groq', label: 'Groq', apiKey: cfg.groqApiKey, baseUrl: cfg.groqBaseUrl || 'https://api.groq.com/openai/v1',
    model: cfg.groqModel || 'llama-3.1-8b-instant', maxTokens: 3000, rpm: cfg.groqRpm ?? 0,
    tpm: cfg.groqTpm ?? 0, dailyReqCap: cfg.groqDailyReqCap ?? 13_000,
    dailyTokenCap: cfg.groqDailyTokenCap ?? 500_000, budgetFile: 'groq-budget.json',
    ...(cfg.groqDailyTokenTarget && cfg.groqPaceFloorFrac != null
      ? { pace: { targetTokens: cfg.groqDailyTokenTarget, floorFrac: cfg.groqPaceFloorFrac } }
      : {}),
  })
  for (const provider of cfg.overflowProviders || []) add(fromConfig(provider))
  return out
}

const MIN_THEME_OUTPUT_TOKENS = 1200

/** Pick an output ceiling that the provider's configured token/minute envelope can safely admit. The
 * former fixed 3,000-token completion made even one conservative Groq request exceed its 6k TPM guard. */
function providerOutputCap(provider: OpenAiThemeProvider, theme: Theme, generic?: Set<string>): number {
  let cap = Math.max(0, Math.min(3000, Math.floor(provider.maxTokens)))
  if (provider.tpm > 0) {
    const inputBound = themeNamerTokenBound([theme], generic, 0)
    cap = Math.min(cap, Math.floor(provider.tpm - inputBound))
  }
  return cap >= MIN_THEME_OUTPUT_TOKENS ? cap : 0
}

/** Build the bounded validator. It always returns a callable so a disabled/unconfigured compiler becomes
 * explicit health state instead of an empty index that falsely says no narrative formed. */
export function makeThemeNamer(cfg: NamerCfg, fetchFn: typeof fetch, stateDir: string, log: (m: string) => void = () => {}): LlmNamer {
  const model = cfg.themesDiscoverModel || 'claude-haiku'
  const useClaude = model !== 'off' && model.startsWith('claude') && !!cfg.themesClaudeApiKey
  const providers = model === 'off' ? [] : openAiProviders(cfg)

  return async (created: Theme[], now: Date, generic?: Set<string>): Promise<ThemeCompilerAttempt> => {
    const batch = created.slice(0, NARRATIVE_BATCH)
    const attemptedAt = now.toISOString().replace(/\.\d{3}Z$/, 'Z')
    const result: ThemeCompilerAttempt = {
      attempted_at: attemptedAt, state: 'skipped', provider: 'none', blocker: 'not_configured', message: '',
      requested_count: batch.length, attempted_count: 0, validated_count: 0, rejected_count: 0,
      malformed_count: 0, omitted_count: 0,
    }
    if (!batch.length) { result.message = 'No theme candidates were queued.'; return result }
    if (model === 'off' || (!useClaude && !providers.length)) {
      result.message = model === 'off' ? 'Theme compilation is disabled.' : 'No configured theme compiler provider is available.'
      return result
    }

    const deadline = Date.now() + Math.min(80_000, Math.max(1, cfg.themesProviderChainTimeoutMs ?? 80_000))
    type CompilerConstraint = {
      provider: string
      blocker: Exclude<ThemeCompilerAttempt['blocker'], null>
      message: string
    }
    const constraints: CompilerConstraint[] = []
    const constrain = (provider: string, blocker: CompilerConstraint['blocker'], message: string) => {
      // This is deliberately one assignment. Provider, blocker, and operator-facing explanation describe
      // the same final routing decision even when an earlier provider was actually sent a request.
      constraints.push({ provider, blocker, message })
    }
    const armProviderFailure = (provider: OpenAiThemeProvider, id: string) => {
      const local = provider.id === 'local'
      const base = local ? (cfg.localCooldownMs ?? 45_000) : (cfg.llmCooldownMs ?? 300_000)
      const max = local ? base : (cfg.llmCooldownMaxMs ?? 3_600_000)
      armCooldown(stateDir, now.getTime(), base, id, max)
    }

    const markSent = (theme: Theme, provider: string) => {
      result.attempted_count++
      result.provider = provider
      if (theme.validation_attempted_at !== attemptedAt) {
        theme.validation_attempted_at = attemptedAt
        if (!theme.validation_queued_at) theme.validation_queued_at = attemptedAt
        theme.rev++
      }
    }
    const classify = (theme: Theme, text: string, generation: 'claude' | 'groq' | 'llm', provider: string): 'validated' | 'rejected' | 'malformed' | 'omitted' => {
      const parsed = parseThemesJson(text)
      if (!parsed.valid) return 'malformed'
      const proposal = parsed.proposals.find((value) => Number(value?.i) === 0)
      if (!proposal) return 'omitted'
      const beforeRev = theme.rev
      const beforeStatus = theme.status
      applyProposals([theme], [proposal], generation, now, generic, generation === 'llm' ? provider : undefined)
      if (beforeStatus === 'live' && theme.status === 'retired') return 'rejected'
      return theme.rev > beforeRev ? 'validated' : 'malformed'
    }

    for (const theme of batch) {
      if (Date.now() >= deadline) {
        constrain('none', 'rate_limiter_busy', 'The theme compiler reached its bounded runtime window.')
        break
      }
      let terminal: 'validated' | 'rejected' | 'malformed' | 'omitted' | null = null

      if (useClaude) {
        const claudeId = 'claude'
        const todayISO = now.toISOString().slice(0, 10)
        const claudeBudget = readClaudeBudget(stateDir, todayISO)
        const claudeCap = cfg.themesClaudeDailyCap ?? 60
        if (isCoolingDown(stateDir, 'themes-claude', now.getTime())) {
          constrain(claudeId, 'cooldown', 'Claude is cooling down.')
        } else if (claudeCap <= 0 || claudeBudget.exhausted || claudeBudget.calls >= claudeCap) {
          constrain(claudeId, 'daily_cap', claudeBudget.exhausted
            ? terminalDayMessage('Claude', claudeBudget.exhaustion_reason)
            : 'Claude reached its theme-compilation daily cap.')
        } else {
          markSent(theme, claudeId)
          let response: ClaudeCallResult
          try {
            response = await callClaude(
              cfg,
              buildUserMessage([theme], generic),
              fetchFn,
              boundedAttemptTimeout(cfg, deadline),
            )
          } catch {
            response = { text: null, ok: false, status: 0, note: 'Claude request failed.' }
          }
          recordClaudeSpend(stateDir, todayISO)
          if (!response.ok || !response.text) {
            const dayReason = terminalReason(response.status)
            if (dayReason) exhaustClaudeDay(stateDir, todayISO, dayReason)
            if (response.status >= 200 && response.status < 300) {
              terminal = 'malformed'; result.malformed_count++
              constrain(claudeId, 'invalid_response', response.note || 'Claude returned an incomplete theme contract.')
              armCooldown(stateDir, now.getTime(), cfg.llmCooldownMs ?? 300_000, 'themes-claude', cfg.llmCooldownMaxMs ?? 3_600_000)
            } else {
              constrain(claudeId, 'provider_error', response.note || 'Claude request failed.')
              if (!dayReason) armCooldown(stateDir, now.getTime(), cfg.llmCooldownMs ?? 300_000, 'themes-claude', cfg.llmCooldownMaxMs ?? 3_600_000)
            }
          } else {
            terminal = classify(theme, response.text, 'claude', claudeId)
            if (terminal === 'validated' || terminal === 'rejected') clearCooldown(stateDir, 'themes-claude')
            else {
              if (terminal === 'omitted') result.omitted_count++
              else result.malformed_count++
              constrain(claudeId, 'invalid_response', 'Claude returned an incomplete theme contract.')
              armCooldown(stateDir, now.getTime(), cfg.llmCooldownMs ?? 300_000, 'themes-claude', cfg.llmCooldownMaxMs ?? 3_600_000)
            }
          }
        }
      }

      if (terminal !== 'validated' && terminal !== 'rejected') {
        for (const provider of providers) {
          if (Date.now() >= deadline) {
            constrain('none', 'rate_limiter_busy', 'The theme compiler reached its bounded runtime window.')
            break
          }
          if (isCoolingDown(stateDir, provider.id, now.getTime()) || isCoolingDown(stateDir, `themes:${provider.id}`, now.getTime())) {
            constrain(provider.id, 'cooldown', `${provider.label} is cooling down.`)
            continue
          }
          const maxTokens = providerOutputCap(provider, theme, generic)
          if (!maxTokens) {
            constrain(provider.id, 'rate_limiter_busy', `${provider.label} cannot safely admit one theme contract inside its configured token/minute envelope.`)
            continue
          }
          const perAttemptTokens = themeNamerTokenBound([theme], generic, maxTokens)
          const budget = Budget.load(stateDir, provider.dailyReqCap, provider.dailyTokenCap, now.getTime(), provider.budgetFile, provider.dayTz)
          if (!(provider.pace
            ? budget.pacedCanSpend(perAttemptTokens, provider.pace, now.getTime())
            : budget.canSpend(perAttemptTokens))) {
            constrain(provider.id, 'daily_cap', terminalDayMessage(provider.label, budget.exhaustionReason))
            continue
          }
          const limiter = provider.id === 'groq'
            ? getSharedLimiter(provider.rpm, provider.tpm)
            : getNamedLimiter(provider.id, provider.rpm, provider.tpm)
          const remaining = Math.max(1, deadline - Date.now())
          const got = await limiter.acquire(perAttemptTokens, undefined, Date.now, Math.min(cfg.themesLimiterWaitMs ?? 2500, remaining))
          if (!got) {
            constrain(provider.id, 'rate_limiter_busy', `${provider.label}'s shared limiter is busy.`)
            continue
          }
          if (Date.now() >= deadline) {
            constrain('none', 'rate_limiter_busy', 'The theme compiler reached its bounded runtime window.')
            break
          }
          const reservation = budget.tryReserve(perAttemptTokens, provider.pace, now.getTime())
          if (!reservation) {
            constrain(provider.id, 'daily_cap', terminalDayMessage(provider.label, budget.exhaustionReason))
            continue
          }

          markSent(theme, provider.id)
          let response: OpenAiCallResult = {
            text: null, tokens: 0, ok: false, status: 0, note: `${provider.label}: request failed`, rate: {},
          }
          try {
            response = await callOpenAi(
              provider,
              buildUserMessage([theme], generic),
              maxTokens,
              fetchFn,
              boundedAttemptTimeout(cfg, deadline, provider.timeoutMs),
            )
          } catch {}
          budget.reconcile(reservation, 1, response.tokens || perAttemptTokens)
          limiter.learn(response.rate, Date.now)
          if (!response.ok || !response.text) {
            const dayReason = terminalReason(response.status)
            if (dayReason) budget.exhaust(dayReason)
            if (response.status >= 200 && response.status < 300) {
              terminal = 'malformed'; result.malformed_count++
              constrain(provider.id, 'invalid_response', response.note || `${provider.label} returned an incomplete theme contract.`)
              armProviderFailure(provider, `themes:${provider.id}`)
            } else {
              constrain(provider.id, 'provider_error', response.note || `${provider.label}: provider error`)
              if (!dayReason) {
                const sharedFailure = response.status === 0 || response.status === 429 || response.status >= 500
                armProviderFailure(provider, sharedFailure ? provider.id : `themes:${provider.id}`)
              }
            }
            continue
          }
          terminal = classify(theme, response.text, provider.id === 'groq' ? 'groq' : 'llm', provider.id)
          if (terminal === 'validated' || terminal === 'rejected') {
            clearCooldown(stateDir, provider.id); clearCooldown(stateDir, `themes:${provider.id}`)
            break
          }
          if (terminal === 'omitted') result.omitted_count++
          else result.malformed_count++
          constrain(provider.id, 'invalid_response', `${provider.label} returned an incomplete theme contract.`)
          armProviderFailure(provider, `themes:${provider.id}`)
        }
      }

      if (terminal === 'validated') result.validated_count++
      else if (terminal === 'rejected') result.rejected_count++
    }

    const processed = result.validated_count + result.rejected_count
    const constraint = constraints[constraints.length - 1]
    if (processed === result.requested_count) {
      result.state = 'succeeded'; result.blocker = null
      result.message = `Theme compiler processed ${processed} of ${result.requested_count} queued candidate${result.requested_count === 1 ? '' : 's'} in bounded single-theme requests.`
    } else if (constraint) {
      // Partial progress is not proof that the remaining queue has capacity. Preserve the terminal
      // provider constraint so a successful first row cannot paint later daily-cap/cooldown debt green.
      result.state = constraint.blocker === 'provider_error' || constraint.blocker === 'invalid_response'
        ? 'failed'
        : constraint.blocker === 'not_configured' ? 'skipped' : 'blocked'
      result.provider = constraint.provider
      result.blocker = constraint.blocker
      result.message = processed > 0
        ? `Theme compiler processed ${processed} of ${result.requested_count}; ${constraint.message}`
        : constraint.message
    } else if (result.attempted_count > 0) {
      result.state = 'failed'
      result.blocker = result.malformed_count || result.omitted_count ? 'invalid_response' : 'provider_error'
      result.message = 'Configured providers did not return a valid theme contract.'
    } else {
      result.state = 'blocked'
      result.provider = 'none'
      result.blocker = 'not_configured'
      result.message = 'No configured theme compiler provider had capacity.'
    }
    log(`themes compiler: ${result.state} via ${result.provider}; ${result.validated_count} validated, ${result.rejected_count} rejected, ${result.requested_count - processed} queued`)
    return result
  }
}
