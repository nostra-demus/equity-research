// The themes discovery LLM pass — the ONE place the news ingester can spend Claude money (everything
// else is free Groq + deterministic). It takes the freshly-clustered themes (already formed
// deterministically) and only NAMES + VALIDATES them: a good narrative name, a one-line plain-English
// description, refined keyword anchors, and a yes/no "is this a real investable theme". The clustering
// stays deterministic, so turning this off (no key / model 'off' / budget hit) degrades gracefully to
// the deterministic baseline. Budget-guarded by a daily call cap; never throws.

import fs from 'node:fs'
import path from 'node:path'
import { companyKeys, themeNarrativeTokens } from '../text-match'
import { cleanTicker } from '../symbology'
import { Budget, clearCooldown, conservativeChatTokenBound, isCoolingDown, type BudgetReservation } from '../triage/budget'
import type { LlmNamer } from './engine'
import type { Theme } from './types'
import { themeStoryKey } from './story-key'
import { selectNarrativeCore } from './core'
import { isDisplayableThemeChallenge, isSupportingThemeEvidence } from './evidence'

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

/** Worst-case billable tokens for one Groq theme-namer attempt (the caller sends at most eight themes). */
export function themeNamerTokenBound(created: Theme[], generic?: Set<string>): number {
  return conservativeChatTokenBound(SYSTEM, buildUserMessage(created.slice(0, NARRATIVE_BATCH), generic), 3000)
}

async function callClaude(cfg: NamerCfg, user: string, fetchFn: typeof fetch): Promise<string | null> {
  const res = await fetchFn(`${cfg.themesClaudeBaseUrl}/v1/messages`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': cfg.themesClaudeApiKey || '', 'anthropic-version': '2023-06-01' },
    signal: AbortSignal.timeout(30_000), // never let a hung connection stall the themes cycle
    body: JSON.stringify({ model: cfg.themesClaudeModel || 'claude-haiku-4-5', max_tokens: 3000, system: SYSTEM, messages: [{ role: 'user', content: user }] }),
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
    body: JSON.stringify({ model: cfg.groqModel, temperature: 0.2, max_tokens: 3000, response_format: { type: 'json_object' }, messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content: user }] }),
  })
  if (!res.ok) throw new Error(`groq HTTP ${res.status}`)
  const data: any = await res.json()
  const text = data?.choices?.[0]?.message?.content
  return { text: typeof text === 'string' ? text : null, tokens: Number(data?.usage?.total_tokens) || 0 }
}

/** Apply LLM proposals to the created themes in place. Model prose is never trusted as provenance: IDs,
 * anchors, companies, tickers and expression proof are joined back to the raw cluster before persistence. */
function applyProposals(created: Theme[], proposals: any[], generation: 'claude' | 'groq', now: Date, generic?: Set<string>): void {
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
    const supportedRows = [...classifications]
      .filter(([, stance]) => stance === 'supports')
      .map(([eventId]) => memberById.get(eventId)!)
      .filter(isSupportingThemeEvidence)
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
    const coreIds = new Set(core.members.map((member) => member.event_id))
    if (!coreIds.has(whyNowEventId)) return

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
        .filter((eventId: unknown): eventId is string => typeof eventId === 'string' && coreIds.has(eventId))
        .filter((eventId: string) => companyKeys(memberById.get(eventId)?.companies).has(nameKey))
        .slice(0, 4)
      if (!evidenceIds.length) continue
      seenExpressions.add(nameKey)
      expressions.push({ name_key: nameKey, side: value.side, role: value.role, mechanism, evidence_event_ids: [...new Set(evidenceIds)] })
      if (expressions.length >= 6) break
    }

    const byNewest = (a: string, b: string) => Date.parse(memberById.get(b)?.found_at || '') - Date.parse(memberById.get(a)?.found_at || '')
    const supportIds = [...new Set([whyNowEventId, ...core.members.map((member) => member.event_id)])]
      .filter((eventId) => classifications.get(eventId) === 'supports')
    const challengeIds = [...classifications]
      .filter(([, stance]) => stance === 'challenges')
      .map(([eventId]) => eventId)
      .sort(byNewest)
    const contextEventIds = [...classifications]
      .filter(([, stance]) => stance === 'context')
      .map(([eventId]) => eventId)
      .slice(-400)
    const evidence: NonNullable<Theme['narrative']>['evidence'] = [
      ...supportIds.map((eventId) => ({ event_id: eventId, stance: 'supports' as const })),
      ...challengeIds.map((eventId) => ({ event_id: eventId, stance: 'challenges' as const })),
    ]
    delete t.needs_rename // explicitly validated and re-grounded by this same complete proposal
    delete t.needs_validation
    const classifiedPromptIds = new Set(
      [...proposedSupport, ...proposedChallenges, ...proposedContext].filter((eventId) => promptedIds.has(eventId)),
    )
    const remainingPending = (t.pending_narrative_event_ids || []).filter((eventId) => !classifiedPromptIds.has(eventId))
    if (remainingPending.length) {
      t.pending_narrative_event_ids = remainingPending
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
        const story = themeStoryKey(member)
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
    t.rev++
  })
}

/** Build the LlmNamer used by the discovery pass, or undefined to stay fully deterministic. */
export function makeThemeNamer(cfg: NamerCfg, fetchFn: typeof fetch, stateDir: string, log: (m: string) => void = () => {}): LlmNamer | undefined {
  const model = cfg.themesDiscoverModel || 'claude-haiku'
  const useClaude = model.startsWith('claude') && !!cfg.themesClaudeApiKey
  const useGroq = (model === 'groq' || (!useClaude && model.startsWith('claude'))) && !!cfg.groqApiKey
  if (model === 'off' || (!useClaude && !useGroq)) return undefined

  return async (created: Theme[], now: Date, generic?: Set<string>): Promise<void> => {
    if (!created.length) return
    const batch = created.slice(0, NARRATIVE_BATCH)
    const user = buildUserMessage(batch, generic)
    const perAttemptTokens = themeNamerTokenBound(batch, generic)
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
        applyProposals(batch, parseThemesJson(text), useClaude ? 'claude' : 'groq', now, generic)
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
