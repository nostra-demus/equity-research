// Persistence for the themes layer — the same append-only-ledger + rebuilt-index discipline the rest
// of the screener uses. screener/ledger/themes.ndjson is the durable history (one line per theme
// mutation, last-line-per-theme_id wins on load — identical to events.ndjson); screener/board/
// themes_index.json is the compact live index the cockpit reads (the TS layer is its single writer, so
// there's no double-writer race with the python board builder). Never throws; append success is explicit so
// the orchestrator cannot publish an index/freshness state that has no durable ledger mutation behind it.

import fs from 'node:fs'
import path from 'node:path'
import { readFeed } from '../feed'
import { deriveSourceTier } from '../scope'
import { companyKeys, normName } from '../text-match'
import type { FeedItem } from '../types'
import type { Theme, ThemeSummary, ThemesIndex, ThemeMutation, ThemeTier, ThemeDetail, CompaniesByOrder, ThemeItemView, ThemeCompany, ThemeEvidence, ThemeMember, ThemeQualifiedExpression, ThemeNarrative, ThemeCompilerAttempt, ThemePlayer } from './types'
import { buildWhyIndex, buildCompanyWhy } from './why'
import { compareThemeSummaries, companiesForMembers, firstSeenForMembers, qualifyTheme, uniqueThemeMembers } from './qualification'
import { cleanTicker } from '../symbology'
import { DAILY_WINDOWS, ensureDaily, scoreTheme } from './score'
import { themeStoryFamilyKey } from './story-key'
import { buildThemeCompilerHealth, buildThemeFormationQueue, compilerDebtForThemes, normalizeThemeCompilerAttempt, normalizeThemeCompilerDebt, normalizeThemeFormationQueue } from './formation'
import { exactThemeEvidenceUrl } from './evidence'

const ledgerPath = (repoRoot: string) => path.join(repoRoot, 'screener', 'ledger', 'themes.ndjson')
const indexPath = (repoRoot: string) => path.join(repoRoot, 'screener', 'board', 'themes_index.json')
const THEME_ID_RE = /^THM-[a-z0-9]{8}$/

const object = (v: unknown): Record<string, any> | null => (v && typeof v === 'object' && !Array.isArray(v) ? v as Record<string, any> : null)
const strings = (v: unknown, cap: number): string[] => Array.isArray(v)
  ? [...new Set(v.filter((x): x is string => typeof x === 'string' && Boolean(x.trim())).map((x) => x.trim()))].slice(0, cap)
  : []
const finite = (v: unknown, fallback = 0): number => Number.isFinite(Number(v)) ? Number(v) : fallback
const bounded = (v: unknown, fallback = 0): number => Math.max(0, Math.min(100, finite(v, fallback)))
const iso = (v: unknown): string => {
  if (typeof v !== 'string') return ''
  const ms = Date.parse(v)
  return Number.isFinite(ms) ? new Date(ms).toISOString() : ''
}

function normalizeMember(v: unknown): ThemeMember | null {
  const m = object(v)
  if (!m || typeof m.event_id !== 'string' || !m.event_id.trim() || typeof m.headline !== 'string') return null
  const foundAt = iso(m.found_at)
  if (!foundAt) return null // no source clock = no evidence; never fall back to the mutation/audit clock
  const observedAt = iso(m.observed_at)
  const exactUrl = exactThemeEvidenceUrl(m.url)
  const companies = Array.isArray(m.companies)
    ? m.companies.flatMap((raw: unknown) => {
        const c = object(raw)
        if (!c || typeof c.name !== 'string' || !c.name.trim()) return []
        return [{
          name: c.name.trim(),
          ticker: typeof c.ticker === 'string' && c.ticker.trim() ? c.ticker.trim() : null,
          listing_country: typeof c.listing_country === 'string' && c.listing_country.trim() ? c.listing_country.trim().toUpperCase() : null,
        }]
      }).slice(0, 4)
    : []
  return {
    event_id: m.event_id.trim(),
    ...(typeof m.dedup_group === 'string' && m.dedup_group.trim() ? { dedup_group: m.dedup_group.trim() } : {}),
    headline: m.headline,
    ...(typeof m.headline_en === 'string' ? { headline_en: m.headline_en } : m.headline_en === null ? { headline_en: null } : {}),
    ...(m.source_is_english === true ? { source_is_english: true as const } : {}),
    found_at: foundAt,
    ...(observedAt ? { observed_at: observedAt } : {}),
    score: bounded(m.score),
    tier: typeof m.tier === 'string' && m.tier.trim() ? m.tier.trim() : 'unconfirmed',
    ...(typeof m.source_name === 'string' && m.source_name.trim() ? { source_name: m.source_name.trim().slice(0, 160) } : {}),
    ...(exactUrl ? { url: exactUrl.slice(0, 2000) } : {}),
    companies,
    event_types: strings(m.event_types, 6),
    ...(typeof m.issuer_linkage === 'string' && m.issuer_linkage.trim() ? { issuer_linkage: m.issuer_linkage.trim() } : {}),
    ...(m.country === null ? { country: null } : typeof m.country === 'string' && m.country.trim() ? { country: m.country.trim().toUpperCase() } : {}),
    ...(typeof m.region === 'string' && m.region.trim() ? { region: m.region.trim() } : {}),
    ...(Array.isArray(m.commodities) ? { commodities: strings(m.commodities, 8) } : {}),
  }
}

function normalizeNarrative(v: unknown, members: ThemeMember[]): ThemeNarrative | undefined {
  const raw = object(v)
  if (!raw || raw.version !== 1) return undefined
  const text = (value: unknown, cap: number): string => typeof value === 'string' ? value.trim().slice(0, cap) : ''
  const thesis = text(raw.thesis, 360)
  const whyNow = text(raw.why_now, 360)
  const whyNowEventId = text(raw.why_now_event_id, 160)
  const falsifier = text(raw.falsifier, 360)
  const horizon = ['days', 'weeks', 'months', 'years'].includes(raw.horizon) ? raw.horizon as ThemeNarrative['horizon'] : null
  const anchorTerms = strings(raw.anchor_terms, 2).map((value) => value.toLowerCase())
  const mechanismSteps = strings(raw.mechanism_steps, 4).map((value) => value.slice(0, 260))
  const validatedAt = iso(raw.validated_at)
  const memberIds = new Set(members.map((member) => member.event_id))
  if (!thesis || !whyNow || !falsifier || !horizon || !validatedAt || mechanismSteps.length < 2 || anchorTerms.length !== 2) return undefined
  if (!memberIds.has(whyNowEventId)) return undefined

  const evidenceCandidates = Array.isArray(raw.evidence) ? raw.evidence.flatMap((value: unknown) => {
    const row = object(value)
    const eventId = text(row?.event_id, 160)
    if (!memberIds.has(eventId) || (row?.stance !== 'supports' && row?.stance !== 'challenges')) return []
    return [{ event_id: eventId, stance: row.stance }]
  }) : []
  const classificationById = new Map<string, 'supports' | 'challenges'>()
  for (const row of evidenceCandidates) {
    const prior = classificationById.get(row.event_id)
    if (row.stance === 'challenges' || prior !== 'challenges') classificationById.set(row.event_id, row.stance)
  }
  // Keep the complete bounded classification ledger internally. The PM projection selects a five-row
  // excerpt later in qualifyTheme; truncating here makes support/coherence mathematically impossible for
  // any retained theme whose member ring is larger than the old cap.
  const evidence = [...classificationById].map(([event_id, stance]) => ({ event_id, stance }))
  const supports = new Set(evidence.filter((row) => row.stance === 'supports').map((row) => row.event_id))
  if (supports.size < 2 || !supports.has(whyNowEventId)) return undefined
  const classifiedEvidenceIds = new Set(evidence.map((row) => row.event_id))
  const contextEventIds = strings(raw.context_event_ids, 400)
    .filter((eventId) => memberIds.has(eventId) && !classifiedEvidenceIds.has(eventId))

  const roles = new Set(['direct', 'bottleneck', 'enabler', 'harmed', 'hedge'])
  const expressionCandidates: ThemeNarrative['expressions'] = Array.isArray(raw.expressions) ? raw.expressions.flatMap((value: unknown) => {
    const row = object(value)
    const nameKey = text(row?.name_key, 160)
    const mechanism = text(row?.mechanism, 300)
    const evidenceIds = strings(row?.evidence_event_ids, 4).filter((eventId) => supports.has(eventId))
    if (!nameKey || !mechanism || !evidenceIds.length || !roles.has(row?.role) || (row?.side !== 'beneficiary' && row?.side !== 'harmed')) return []
    if (row.role === 'harmed' && row.side !== 'harmed') return []
    return [{
      name_key: nameKey,
      side: row.side,
      role: row.role as ThemeNarrative['expressions'][number]['role'],
      mechanism,
      evidence_event_ids: evidenceIds,
    }]
  }).slice(0, 12) : []
  const expressionByName = new Map<string, ThemeNarrative['expressions'][number]>()
  const conflictingExpressionNames = new Set<string>()
  for (const expression of expressionCandidates) {
    const prior = expressionByName.get(expression.name_key)
    if (!prior) expressionByName.set(expression.name_key, expression)
    else if (prior.side !== expression.side || prior.role !== expression.role || prior.mechanism !== expression.mechanism) conflictingExpressionNames.add(expression.name_key)
    else prior.evidence_event_ids = [...new Set([...prior.evidence_event_ids, ...expression.evidence_event_ids])].slice(0, 4)
  }
  const expressions = [...expressionByName.values()].filter((expression) => !conflictingExpressionNames.has(expression.name_key)).slice(0, 6)
  return {
    version: 1,
    thesis,
    why_now: whyNow,
    why_now_event_id: whyNowEventId,
    mechanism_steps: mechanismSteps,
    horizon,
    falsifier,
    anchor_terms: anchorTerms as [string, string],
    evidence,
    context_event_ids: contextEventIds,
    expressions,
    validated_at: validatedAt,
  }
}

function normalizePlayers(v: unknown, members: ThemeMember[]): ThemePlayer[] {
  if (!Array.isArray(v)) return []
  const memberIds = new Set(members.map((member) => member.event_id))
  const relationships = new Set(['direct_subject', 'parent', 'supplier', 'customer', 'competitor', 'substitute', 'other'])
  return v.flatMap((value: unknown) => {
    const row = object(value)
    if (!row || typeof row.name !== 'string' || !row.name.trim() || ![1, 2].includes(row.order)
      || !['beneficiary', 'harmed', 'unclear'].includes(row.side)
      || !relationships.has(row.relationship)
      || typeof row.mechanism !== 'string' || !row.mechanism.trim()
      || !['source_statement', 'engine_inference'].includes(row.mechanism_basis)) return []
    const evidence = (Array.isArray(row.evidence) ? row.evidence : []).reduce<ThemePlayer['evidence']>((out, rawEvidence: unknown) => {
      const e = object(rawEvidence)
      if (!e || (e.kind !== 'news' && e.kind !== 'relationship_export')) return out
      if (e.kind === 'news') {
        const eventId = typeof e.event_id === 'string' && memberIds.has(e.event_id) ? e.event_id : ''
        const publishedAt = iso(e.published_at)
        const url = exactThemeEvidenceUrl(e.url)
        if (!eventId || !publishedAt || !url || typeof e.headline !== 'string' || !e.headline.trim()
          || typeof e.publisher !== 'string' || !e.publisher.trim()) return out
        out.push({
          kind: 'news' as const, event_id: eventId, headline: e.headline.trim().slice(0, 500),
          publisher: e.publisher.trim().slice(0, 160), url, published_at: publishedAt,
          source_ref: null, source_file: null,
        })
        return out
      }
      const sourceRef = typeof e.source_ref === 'string' && e.source_ref.trim() ? e.source_ref.trim().slice(0, 500) : null
      const sourceFile = typeof e.source_file === 'string' && e.source_file.trim() ? e.source_file.trim().slice(0, 1000) : null
      if (!sourceRef && !sourceFile) return out
      out.push({
        kind: 'relationship_export' as const, event_id: null, headline: null, publisher: null, url: null,
        published_at: null, source_ref: sourceRef, source_file: sourceFile,
      })
      return out
    }, [])
    if (!evidence.length) return []
    const ticker = row.listing_status === 'verified_public' ? cleanTicker(row.ticker) : null
    const exactNews = evidence.some((e) => e.kind === 'news')
    const articleSecondOrder = row.order === 2 && exactNews && row.relationship !== 'direct_subject' && row.relationship !== 'other'
    const ideaEligible = Boolean(row.idea_eligible && ticker && exactNews && row.side !== 'unclear'
      && (row.order === 1 || articleSecondOrder))
    return [{
      name: row.name.trim().slice(0, 160), ticker,
      listing_status: ticker ? 'verified_public' as const : 'no_verified_listing' as const,
      order: row.order as 1 | 2,
      side: row.side as ThemePlayer['side'],
      relationship: row.relationship as ThemePlayer['relationship'],
      mechanism: row.mechanism.trim().slice(0, 400),
      mechanism_basis: row.mechanism_basis as ThemePlayer['mechanism_basis'],
      evidence,
      idea_eligible: ideaEligible,
    }]
  }).slice(0, 30)
}

/** Normalize the untrusted append-only runtime boundary. A valid-JSON but partial newest mutation must not
 * replace a prior good row and crash every index read/cycle. Irrecoverable rows return null, so loadThemes
 * keeps the last valid mutation for that id; compatible missing optional fields get conservative defaults. */
function normalizeTheme(v: unknown): Theme | null {
  const raw = object(v)
  if (!raw || typeof raw.theme_id !== 'string' || !THEME_ID_RE.test(raw.theme_id)) return null
  if (!['live', 'merged', 'retired'].includes(raw.status)) return null
  if (typeof raw.name !== 'string' || !raw.name.trim() || typeof raw.slug !== 'string' || !raw.slug.trim() || typeof raw.description !== 'string' || !raw.description.trim()) return null
  if (!Array.isArray(raw.members)) return null
  const members = raw.members.map(normalizeMember).filter((m): m is ThemeMember => m !== null)
  // Every engine-created theme has evidence. Refuse an empty/corrupt replacement instead of converting a
  // prior good live theme into an immortal evidence-free shell (or accepting a tiny forged tombstone).
  if (!members.length) return null
  members.sort((a, b) => Date.parse(a.found_at) - Date.parse(b.found_at))

  const rawScores = object(raw.scores) || {}
  const scores = {
    freshness: bounded(rawScores.freshness),
    magnitude: bounded(rawScores.magnitude),
    breadth: bounded(rawScores.breadth),
    persistence: bounded(rawScores.persistence),
    composite: bounded(rawScores.composite),
  }
  const companies: ThemeCompany[] = Array.isArray(raw.companies)
    ? raw.companies.flatMap((value: unknown) => {
        const c = object(value)
        if (!c || typeof c.name !== 'string' || !c.name.trim()) return []
        const nameKey = typeof c.name_key === 'string' && c.name_key.trim()
          ? c.name_key.trim()
          : companyKeys([{ name: c.name, ticker: null, listing_country: null }]).values().next().value
        if (!nameKey) return []
        const impactRaw = object(c.impact) || {}
        const impact = {
          directness: Math.min(25, bounded(impactRaw.directness)),
          magnitude: Math.min(25, bounded(impactRaw.magnitude)),
          speed: Math.min(25, bounded(impactRaw.speed)),
          reversibility: Math.min(25, bounded(impactRaw.reversibility)),
          composite: bounded(impactRaw.composite),
        }
        const order = c.order === 1 || c.order === 2 || c.order === 3 ? c.order : 3
        const side = c.side === 'beneficiary' || c.side === 'harmed' || c.side === 'mixed' ? c.side : 'mixed'
        return [{
          name: c.name.trim(), name_key: String(nameKey),
          ticker: typeof c.ticker === 'string' && c.ticker.trim() ? c.ticker.trim() : null,
          listing_country: typeof c.listing_country === 'string' && c.listing_country.trim() ? c.listing_country.trim().toUpperCase() : null,
          order, side, impact,
          mention_count: Math.max(0, Math.floor(finite(c.mention_count))),
          last_seen: iso(c.last_seen),
        }]
      }).slice(0, 40)
    : []
  const related = Array.isArray(raw.related_themes)
    ? raw.related_themes.flatMap((value: unknown) => {
        const r = object(value)
        if (!r || typeof r.theme_id !== 'string' || !THEME_ID_RE.test(r.theme_id) || typeof r.name !== 'string') return []
        return [{
          theme_id: r.theme_id, name: r.name,
          shared_company_keys: Math.max(0, Math.floor(finite(r.shared_company_keys))),
          token_overlap: Math.max(0, Math.min(1, finite(r.token_overlap))),
          kind: r.kind === 'opposite' ? 'opposite' as const : 'related' as const,
        }]
      }).slice(0, 6)
    : []
  const memberFirst = members[0].found_at
  const memberLast = members[members.length - 1].found_at
  const firstSeen = iso(raw.first_seen) || memberFirst
  const validatorProvider = typeof raw.validator_provider === 'string' && raw.validator_provider.trim()
    ? raw.validator_provider.trim().slice(0, 120)
    : undefined
  const invalidLlmProvenance = raw.generation === 'llm' && !validatorProvider
  // A generic `llm` class without the exact provider route is not sufficient validation provenance.
  // Preserve the row for audit, but fail it back to deterministic so qualification cannot publish it.
  const generation = raw.generation === 'claude' || raw.generation === 'groq'
    ? raw.generation
    : raw.generation === 'llm' && validatorProvider
      ? 'llm'
      : 'deterministic'
  const tier = raw.tier === 'hot' || raw.tier === 'active' || raw.tier === 'cooling' || raw.tier === 'parked' ? raw.tier : 'parked'
  const flowSeries = Array.isArray(raw.flow_series) ? raw.flow_series.map((n: unknown) => Math.max(0, Math.floor(finite(n)))).slice(-48) : []
  const flowDaily = Array.isArray(raw.flow_daily) ? raw.flow_daily.map((n: unknown) => Math.max(0, Math.floor(finite(n)))).slice(-120) : undefined
  const narrative = normalizeNarrative(raw.narrative, members)
  const playerContractVersion = raw.player_contract_version === 1 && narrative ? 1 as const : undefined
  const players = playerContractVersion ? normalizePlayers(raw.players, members) : []
  // Before the versioned narrative contract, successful Claude/Groq naming produced model-labelled live
  // rows with no migration flags. Queue their complete retained audit for a fresh contract pass instead of
  // letting a rollout report an empty board and no compiler debt. Invalid generic-LLM provenance follows
  // the same fail-closed migration path after being normalized back to deterministic above.
  const legacyModelNamedMigration = raw.status === 'live' && !narrative
    && (generation === 'claude' || generation === 'groq' || generation === 'llm')
  const migrationNeedsRename = raw.status === 'live' && (invalidLlmProvenance || legacyModelNamedMigration)
  const classifiedNarrativeIds = new Set([
    ...(narrative?.evidence.map((row) => row.event_id) || []),
    ...(narrative?.context_event_ids || []),
  ])
  const pendingCap = Math.max(400, members.length)
  const rawNarrativeOverflow = raw.narrative_update_overflow === true
  const tracksNarrativeDebt = rawNarrativeOverflow
    || (raw.needs_narrative_update === true && Boolean(narrative))
    || (!narrative && generation === 'deterministic' && raw.needs_validation === true)
    || migrationNeedsRename
  const rawPendingNarrativeIds = strings(raw.pending_narrative_event_ids, pendingCap)
  const pendingNarrativeIds = tracksNarrativeDebt
    ? (rawPendingNarrativeIds.length
        ? rawPendingNarrativeIds
        : members.map((member) => member.event_id).filter((eventId) => !classifiedNarrativeIds.has(eventId)))
      .filter((eventId) => members.some((member) => member.event_id === eventId))
    : []
  const narrativeUpdateOverflow = Boolean(rawNarrativeOverflow
    || (raw.needs_narrative_update === true
      && (rawPendingNarrativeIds.some((eventId) => !members.some((member) => member.event_id === eventId))
        || (Boolean(narrative) && !rawPendingNarrativeIds.length && pendingNarrativeIds.length === 0))))
  return {
    theme_id: raw.theme_id,
    name: raw.name.trim(), slug: raw.slug.trim(), description: raw.description.trim(),
    keywords: strings(raw.keywords, 14),
    company_keys: strings(raw.company_keys, 16),
    event_type_affinity: strings(raw.event_type_affinity, 8),
    members,
    // The member ring can hold several state observations for one publisher-copy family. The lifetime
    // counter measures underlying story families, so reload must never floor it to raw observation rows.
    member_count_total: Math.max(
      new Set(members.map(themeStoryFamilyKey)).size,
      Math.floor(finite(raw.member_count_total, new Set(members.map(themeStoryFamilyKey)).size)),
    ),
    companies,
    sectors: [],
    scores,
    tier,
    fresh_flow: Math.max(0, Math.floor(finite(raw.fresh_flow))),
    flow_series: flowSeries,
    ...(flowDaily ? { flow_daily: flowDaily } : {}),
    ...(flowDaily && typeof raw.flow_daily_day === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(raw.flow_daily_day) ? { flow_daily_day: raw.flow_daily_day } : {}),
    related_themes: related,
    status: raw.status,
    merged_into: raw.status === 'merged' && typeof raw.merged_into === 'string' && THEME_ID_RE.test(raw.merged_into) ? raw.merged_into : null,
    // Once present, the lifecycle start is immutable. Member eviction, a correction admitted later, or a
    // malformed earlier source clock must not move an established theme's birth date in either direction.
    first_seen: firstSeen,
    last_flow: memberLast,
    generation,
    ...(generation === 'llm' && validatorProvider ? { validator_provider: validatorProvider } : {}),
    ...(narrative ? { narrative } : {}),
    ...(playerContractVersion ? { player_contract_version: playerContractVersion, players } : {}),
    ...(playerContractVersion && typeof raw.player_evidence_fingerprint === 'string' && raw.player_evidence_fingerprint.trim()
      ? { player_evidence_fingerprint: raw.player_evidence_fingerprint.trim().slice(0, 64) } : {}),
    rev: Math.max(0, Math.floor(finite(raw.rev))),
    ...(raw.needs_rename === true || migrationNeedsRename ? { needs_rename: true } : {}),
    ...(generation === 'deterministic' && raw.needs_validation === true ? { needs_validation: true } : {}),
    ...(narrativeUpdateOverflow || (Boolean(narrative) && raw.needs_narrative_update === true) ? { needs_narrative_update: true } : {}),
    ...(narrative && raw.needs_player_revalidation === true ? { needs_player_revalidation: true } : {}),
    ...(tracksNarrativeDebt ? { pending_narrative_event_ids: pendingNarrativeIds } : {}),
    ...(narrativeUpdateOverflow ? { narrative_update_overflow: true } : {}),
    ...(iso(raw.validation_queued_at) ? { validation_queued_at: iso(raw.validation_queued_at) } : {}),
    ...(iso(raw.validation_attempted_at) ? { validation_attempted_at: iso(raw.validation_attempted_at) } : {}),
  }
}

/** The themes ledger file path — exposed so callers can stat its mtime to cache derived reads (e.g. the
 *  on-the-fly geo-sliced index) instead of re-parsing the whole ledger on every request. */
export const themesLedgerPath = ledgerPath

export interface ThemesLedgerSnapshot {
  themes: Theme[]
  generatedAt: string
  compilerAttempt: ThemeCompilerAttempt | null
}

/** Read the themes ledger; last VALID row per theme_id wins. A batch is one logical transaction: if its
 * stage/compiler envelope or any Theme row is malformed, none of that batch is admitted. */
export function loadThemesLedger(repoRoot: string): ThemesLedgerSnapshot {
  const byId = new Map<string, Theme>()
  let generatedAt = ''
  let compilerAttempt: ThemeCompilerAttempt | null = null
  try {
    for (const ln of fs.readFileSync(ledgerPath(repoRoot), 'utf8').split('\n')) {
      const t = ln.trim()
      if (!t) continue
      try {
        const o = JSON.parse(t) as ThemeMutation
        if (o && o.kind === 'theme') {
          const theme = normalizeTheme(o.theme)
          if (theme) byId.set(theme.theme_id, theme)
        } else if (o && o.kind === 'theme_batch' && Array.isArray(o.themes)) {
          const stamp = iso(o.ts).replace(/\.\d{3}Z$/, 'Z')
          const attempt = o.compiler_attempt === undefined ? null : normalizeThemeCompilerAttempt(o.compiler_attempt)
          const normalized = o.themes.map(normalizeTheme)
          if (!stamp || (o.compiler_attempt !== undefined && !attempt) || normalized.some((theme) => theme === null)) continue
          for (const theme of normalized as Theme[]) byId.set(theme.theme_id, theme)
          generatedAt = stamp
          if (attempt) compilerAttempt = attempt
        } else if (o && o.kind === 'theme_stage') {
          const stamp = iso(o.ts).replace(/\.\d{3}Z$/, 'Z')
          const attempt = o.compiler_attempt === undefined ? null : normalizeThemeCompilerAttempt(o.compiler_attempt)
          if (!stamp || (o.compiler_attempt !== undefined && !attempt)) continue
          generatedAt = stamp
          if (attempt) compilerAttempt = attempt
        }
      } catch {
        // skip a corrupt line
      }
    }
  } catch {
    // no ledger yet → no themes
  }
  return { themes: [...byId.values()], generatedAt, compilerAttempt }
}

/** Compatibility projection for every existing caller that only needs current Theme rows. */
export function loadThemes(repoRoot: string): Theme[] {
  return loadThemesLedger(repoRoot).themes
}

/** Append one logical cycle record. False means nothing downstream may advance. Theme changes and the
 * compiler attempt share one JSON row; a capacity-only cycle uses a compact stage row. */
export function appendThemeMutations(
  repoRoot: string,
  themes: Theme[],
  now: () => Date = () => new Date(),
  compilerAttempt?: ThemeCompilerAttempt,
): boolean {
  const fp = ledgerPath(repoRoot)
  try {
    fs.mkdirSync(path.dirname(fp), { recursive: true })
    const ts = now().toISOString().replace(/\.\d{3}Z$/, 'Z')
    const mutation: ThemeMutation = themes.length
      ? { kind: 'theme_batch', ts, themes, ...(compilerAttempt ? { compiler_attempt: compilerAttempt } : {}) }
      : { kind: 'theme_stage', ts, ...(compilerAttempt ? { compiler_attempt: compilerAttempt } : {}) }
    fs.appendFileSync(fp, JSON.stringify(mutation) + '\n')
    return true
  } catch {
    return false
  }
}

/** Rewrite the ledger to its compact projection — one line per theme_id, exactly what `loadThemes`
 *  returns — once it grows past `thresholdBytes`. The ledger is append-only, so a theme that mutates N
 *  times leaves N-1 superseded lines that only cost load time and git-push bytes. In prod on 2026-06-19
 *  this file reached 32MB; because git pushes the whole blob, every screener data commit re-uploaded 32MB
 *  and GitHub timed the push out (HTTP 408), stranding the data lane and jamming the auto-deploy.
 *  Compaction is LOSSLESS for every consumer (all read through loadThemes → last-line-per-theme_id) and
 *  atomic (temp + rename). The TS layer is the ledger's single writer, so re-reading right after the
 *  cycle's append captures this cycle's mutations too. Rewritten lines carry a fresh `ts`; no reader uses
 *  the mutation `ts` (loadThemes ignores it), so that is harmless. Best-effort: a failure just leaves the
 *  larger ledger in place — still correct, only bigger.
 *
 *  Idempotence guard: only rewrite when there are genuinely superseded lines to collapse
 *  (physicalLines > distinct theme_ids). Without this, a ledger whose compact projection itself stays
 *  above `thresholdBytes` (enough live themes, each carrying up to a 400-member ring) would be rewritten
 *  every cycle with a fresh `ts` — a byte-different but semantically identical file that re-dirties the
 *  tracked ledger on every pass, bringing back the exact large-push / always-dirty pressure this removes.
 *  When the file is already one-line-per-id, this is a no-op.
 *
 *  No lock needed: loadThemes → build → writeFileSync(tmp) → renameSync run as one uninterrupted
 *  synchronous block (no `await`), and the TS layer is the ledger's only writer, so even an orphaned,
 *  overlapping themes pass (the 90s race in runCycle does not cancel the inner promise) cannot interleave
 *  an append between this snapshot and the rename. */
export function maybeCompactThemesLedger(
  repoRoot: string,
  now: () => Date = () => new Date(),
  thresholdBytes = 4 * 1024 * 1024,
): void {
  const fp = ledgerPath(repoRoot)
  try {
    if (fs.statSync(fp).size < thresholdBytes) return
    const rawLines = fs.readFileSync(fp, 'utf8').split('\n').filter((l) => l.trim())
    const seenThemeIds = new Set<string>()
    let stageRows = 0
    let needsCompaction = false
    for (const line of rawLines) {
      try {
        const row = JSON.parse(line) as ThemeMutation
        if (row.kind === 'theme') {
          const id = object(row.theme)?.theme_id
          if (typeof id !== 'string' || seenThemeIds.has(id)) needsCompaction = true
          else seenThemeIds.add(id)
        } else if (row.kind === 'theme_batch') {
          needsCompaction = true
        } else if (row.kind === 'theme_stage') {
          stageRows++
        } else {
          needsCompaction = true
        }
      } catch {
        needsCompaction = true
      }
    }
    // Capacity-only cycles are tiny. Retain at most one day of stage history before folding it, rather
    // than rewriting a multi-megabyte compact Theme ledger on every blocked provider check.
    if (stageRows > 288) needsCompaction = true
    if (!needsCompaction) return
    const snapshot = loadThemesLedger(repoRoot)
    const themes = snapshot.themes
    const ts = now().toISOString().replace(/\.\d{3}Z$/, 'Z')
    const rows: string[] = themes.map((theme) => JSON.stringify({ kind: 'theme', ts, theme } satisfies ThemeMutation))
    if (snapshot.generatedAt) {
      rows.push(JSON.stringify({
        kind: 'theme_stage', ts: snapshot.generatedAt,
        ...(snapshot.compilerAttempt ? { compiler_attempt: snapshot.compilerAttempt } : {}),
      } satisfies ThemeMutation))
    }
    const body = rows.length ? rows.join('\n') + '\n' : ''
    const tmp = `${fp}.compact.${process.pid}`
    fs.writeFileSync(tmp, body)
    fs.renameSync(tmp, fp)
  } catch {
    // best-effort — a failed compaction is harmless; the next over-threshold cycle retries
  }
}

// Array-safe: loadThemes() parses raw ledger lines with no schema normalisation, so a legacy/partial
// theme row can lack `companies` / `related_themes`, or carry a corrupt non-array truthy value there.
// Array.isArray() guards every top() call site (buildSummary, deep-dive) against BOTH — a missing array
// AND a non-array (`{}`, `true`, …) — so neither throws on `.slice`. (The declared T[] is the happy-path
// type; the runtime value is untrusted ledger data, hence the guard.)
const top = <T>(arr: T[] | undefined | null, n: number): T[] => (Array.isArray(arr) ? arr.slice(0, n) : [])

/** Cap the company projection without hiding the exact expression that cleared qualification. */
function topCompaniesWithExpression(companies: ThemeCompany[], expressionKey: string | null, n: number): ThemeCompany[] {
  const capped = top(companies, n)
  if (!expressionKey || capped.some((c) => c.name_key === expressionKey)) return capped
  const expression = companies.find((c) => c.name_key === expressionKey)
  if (!expression) return capped
  if (capped.length >= n && n > 0) capped[capped.length - 1] = expression
  else if (capped.length < n) capped.push(expression)
  return capped
}

const MAX_QUALIFIED_EXPRESSIONS = 4

/** Bind each actionable ticker to the exact narrative-supporting proof rows that named it. The compact
 * summary is the authority consumed by Ideas; display order and provider-authored company strings are
 * never allowed to manufacture another eligible expression. */
function qualifiedExpressions(
  theme: Theme,
  companies: ThemeCompany[],
  players: ThemePlayer[],
  evidence: ThemeEvidence[],
  actionable: boolean,
): ThemeQualifiedExpression[] {
  if (!actionable || !theme.narrative) return []
  const companyByKey = new Map(companies.map((company) => [company.name_key, company]))
  const visibleEvidence = new Set(evidence.filter((row) => row.stance === 'supports').map((row) => row.event_id))
  const out: ThemeQualifiedExpression[] = []
  for (const player of players) {
    if (!player.idea_eligible || player.listing_status !== 'verified_public' || player.side === 'unclear') continue
    const ticker = cleanTicker(player.ticker)
    if (!ticker || !player.mechanism?.trim()) continue
    const nameKey = normName(player.name)
    const company = companyByKey.get(nameKey)
    const proofIds = player.evidence.flatMap((row) => row.kind === 'news' && row.event_id && visibleEvidence.has(row.event_id) ? [row.event_id] : [])
    if (!proofIds.length) continue
    const role: ThemeQualifiedExpression['role'] = player.side === 'harmed'
      ? 'harmed'
      : player.relationship === 'direct_subject'
        ? 'direct'
        : player.relationship === 'competitor' || player.relationship === 'substitute'
          ? 'hedge'
          : 'enabler'
    out.push({
      name: player.name,
      name_key: nameKey,
      ticker,
      listing_country: company?.listing_country ?? null,
      side: player.side === 'harmed' ? 'harmed' : 'beneficiary',
      role,
      mechanism: player.mechanism,
      evidence_event_ids: [...new Set(proofIds)].slice(0, 3),
    })
    if (out.length >= MAX_QUALIFIED_EXPRESSIONS) break
  }
  return out
}

/** Compact projection: Theme → ThemeSummary (no member arrays) for the index + SSE bus. */
export function buildSummary(t: Theme, now: Date = new Date(), companyProjection?: ThemeCompany[], memberProjection?: ThemeMember[]): ThemeSummary {
  const members = Array.isArray(memberProjection) ? memberProjection : (Array.isArray(t.members) ? t.members : [])
  const scoped = Array.isArray(companyProjection)
  const uniqueMembers = uniqueThemeMembers(members)
  const allCompanies = Array.isArray(companyProjection) ? companyProjection : companiesForMembers(t, uniqueMembers)
  const firstPass = qualifyTheme(t, now, members, allCompanies, scoped)
  // Every public projection uses the same canonical core. Off-thesis rows cannot leak back through a
  // company count, detail panel or brief after qualification correctly excluded them.
  const coreMembers = [...firstPass.supporting_members, ...firstPass.challenging_members]
  const rebuiltCompanies = companiesForMembers(t, coreMembers)
  // A caller-supplied projection is an admission boundary, not merely a seed for the first pass. Geo and
  // commodity slices deliberately remove names outside their scope; rebuilding from core evidence must
  // not silently add those names back because a sliced story happened to mention them.
  const admittedCompanyKeys = Array.isArray(companyProjection)
    ? new Set(allCompanies.map((company) => company.name_key))
    : null
  const companies = admittedCompanyKeys
    ? rebuiltCompanies.filter((company) => admittedCompanyKeys.has(company.name_key))
    : rebuiltCompanies
  const qualified = qualifyTheme(t, now, members, companies, scoped)
  const players = qualified.players
  const coreFirstSeen = firstSeenForMembers(coreMembers, t.first_seen)
  // Heat and every time-window series are evidence projections too. Reusing the persisted all-member
  // score here let hundreds of explicitly excluded rows make a two-row thesis the largest/hottest node.
  const coreScored = scoreTheme({ members: coreMembers, companies, sectors: [], first_seen: coreFirstSeen }, now)
  const daily: { members: ThemeMember[]; flow_daily?: number[]; flow_daily_day?: string } = { members: coreMembers }
  ensureDaily(daily, now.getTime(), DAILY_WINDOWS)
  const visibleCompanies = topCompaniesWithExpression(companies, qualified.expression_company_key, 8)
  const expressions = qualifiedExpressions(
    t,
    companies,
    players,
    qualified.evidence,
    qualified.assessment.status === 'actionable',
  )
  return {
    theme_id: t.theme_id,
    name: t.name,
    description: t.description,
    tier: coreScored.tier,
    composite: coreScored.scores.composite,
    fresh_flow: coreScored.fresh_flow,
    flow_series: coreScored.flow_series,
    flow_daily: daily.flow_daily || [],
    heat_flow_daily: Array.isArray(t.flow_daily) ? [...t.flow_daily] : (daily.flow_daily || []),
    // First-look volume is the distinct underlying stories CURRENTLY available as proof. Lifetime
    // member_count_total includes duplicate publisher copies and rows evicted from the evidence ring, so
    // using it made old noisy themes look permanently huge even after their proof disappeared.
    member_count: coreMembers.length,
    first_seen: t.first_seen,
    score_components: { ...coreScored.scores },
    evidence: qualified.evidence,
    narrative: t.narrative && !t.needs_rename && qualified.assessment.status !== 'context'
      && qualified.evidence.some((row) => row.stance === 'supports' && row.event_id === t.narrative!.why_now_event_id) ? {
      version: t.narrative.version,
      thesis: t.narrative.thesis,
      why_now: t.narrative.why_now,
      why_now_event_id: t.narrative.why_now_event_id,
      mechanism_steps: [...t.narrative.mechanism_steps],
      horizon: t.narrative.horizon,
      falsifier: t.narrative.falsifier,
      context_event_ids: [...t.narrative.context_event_ids],
      validated_at: t.narrative.validated_at,
    } : null,
    activity: qualified.assessment.activity,
    conviction: qualified.assessment.conviction,
    off_core_member_count: qualified.off_core_members.length,
    qualified_expressions: expressions,
    idea_ready: qualified.idea_admission.admitted,
    idea_blockers: [...qualified.idea_admission.blockers],
    player_counts: {
      first_order: players.filter((player) => player.order === 1).length,
      second_order: players.filter((player) => player.order === 2).length,
      verified_public: players.filter((player) => player.listing_status === 'verified_public').length,
      idea_eligible: players.filter((player) => player.idea_eligible).length,
    },
    top_companies: visibleCompanies.map((c) => ({
      name: c.name,
      ticker: cleanTicker(c.ticker),
      listing_country: c.listing_country ?? null,
      order: c.order,
      side: c.side,
      mention_count: Number.isFinite(c.mention_count) ? c.mention_count : 0,
      impact_composite: Number.isFinite(c.impact?.composite) ? c.impact.composite : 0,
      last_seen: c.last_seen || '',
    })),
    assessment: qualified.assessment,
    related_themes: top(t.related_themes, 5).map((r) => ({ theme_id: r.theme_id, name: r.name, kind: r.kind })),
    last_flow: coreMembers.reduce((latest, member) => !latest || member.found_at > latest ? member.found_at : latest, ''),
    rev: t.rev,
  }
}

/** Build the live themes index. Admission class outranks heat: actionable → forming → context. */
export function buildThemesIndex(
  themes: Theme[],
  now: () => Date = () => new Date(),
  compilerAttempt?: ThemeCompilerAttempt | null,
): ThemesIndex {
  const live = themes.filter((t) => t.status === 'live')
  const nowD = now()
  // The PM-facing index is a thesis product, not a raw-cluster diagnostic. Contractless/rejected Context
  // rows stay in the ledger for migration and audit but can never occupy the Themes first look or map.
  const summaries = live
    .map((t) => buildSummary(t, nowD))
    .filter((summary) => summary.narrative && summary.assessment.status !== 'context')
    .sort(compareThemeSummaries)
  const counts = { hot: 0, active: 0, cooling: 0, parked: 0, retired: 0, total: 0 }
  counts.retired = themes.filter((theme) => theme.status === 'retired').length
  for (const summary of summaries) { counts.total++; counts[summary.tier as ThemeTier]++ }
  // how many days of real daily-flow history exist = the furthest-back non-zero daily bucket across
  // live themes. This is what the UI's window selector honestly reaches: a "last 7d" view is only fully
  // backed once history_days ≥ 7. Grows one real day per day; the firehose is high-volume, so every past
  // accrued day has flow in at least one theme, making this a truthful lower bound on coverage.
  let history_days = 0
  for (const summary of summaries) {
    const fd = summary.flow_daily || []
    const firstNonZero = fd.findIndex((v) => v > 0)
    if (firstNonZero >= 0) history_days = Math.max(history_days, fd.length - firstNonZero)
  }
  const formation_queue = buildThemeFormationQueue(live, nowD)
  const compiler_health = buildThemeCompilerHealth(formation_queue, nowD, compilerAttempt, compilerDebtForThemes(live))
  return {
    generated_at: nowD.toISOString().replace(/\.\d{3}Z$/, 'Z'),
    themes: summaries,
    formation_queue,
    compiler_health,
    counts,
    history_days,
  }
}

/** Atomically write the live themes index the cockpit reads. */
export function writeThemesIndex(
  repoRoot: string,
  themes: Theme[],
  now: () => Date = () => new Date(),
  compilerAttempt?: ThemeCompilerAttempt | null,
): void {
  const fp = indexPath(repoRoot)
  try {
    fs.mkdirSync(path.dirname(fp), { recursive: true })
    const tmp = `${fp}.tmp.${process.pid}`
    // The board snapshot is the durable compiler-health seam. A maintenance-only stage with no new
    // attempt must retain the last observed provider result while queue debt is recomputed from `themes`.
    const priorAttempt = compilerAttempt === undefined
      ? readThemesIndex(repoRoot).compiler_health.last_attempt
      : compilerAttempt
    // compact (not pretty) — the index is machine-read by the cockpit, and the per-theme flow_series[48] +
    // flow_daily[120] rings make indented JSON ~3× larger for zero benefit.
    fs.writeFileSync(tmp, JSON.stringify(buildThemesIndex(themes, now, priorAttempt)) + '\n')
    fs.renameSync(tmp, fp)
  } catch {
    // best-effort; the cockpit keeps the prior index
  }
}

/** Read the index the cockpit/API serves (never throws; empty when absent). */
export function readThemesIndex(repoRoot: string): ThemesIndex {
  try {
    const o = JSON.parse(fs.readFileSync(indexPath(repoRoot), 'utf8'))
    if (o && Array.isArray(o.themes)) {
      const validGeneratedAt = typeof o.generated_at === 'string' && Number.isFinite(Date.parse(o.generated_at))
      const generated = validGeneratedAt ? new Date(Date.parse(o.generated_at)) : new Date(0)
      const formation = validGeneratedAt
        ? normalizeThemeFormationQueue(o.formation_queue) || buildThemeFormationQueue([], generated)
        : buildThemeFormationQueue([], generated)
      const lastAttempt = validGeneratedAt ? normalizeThemeCompilerAttempt(o.compiler_health?.last_attempt) : null
      const compilerDebt = validGeneratedAt ? normalizeThemeCompilerDebt(o.compiler_health?.queue) : null
      return {
        history_days: 0,
        ...o,
        generated_at: validGeneratedAt ? o.generated_at : '',
        formation_queue: formation,
        compiler_health: buildThemeCompilerHealth(formation, generated, lastAttempt, compilerDebt || undefined),
      }
    }
  } catch {
    // none yet
  }
  const epoch = new Date(0)
  const formation_queue = buildThemeFormationQueue([], epoch)
  return {
    generated_at: '',
    themes: [],
    formation_queue,
    compiler_health: buildThemeCompilerHealth(formation_queue, epoch),
    counts: { hot: 0, active: 0, cooling: 0, parked: 0, retired: 0, total: 0 },
    history_days: 0,
  }
}

/** Recent MATERIAL firehose items as ThemeItemViews — the cold-start / comprehensiveness pool for a
 *  discovery pass, so themes form from the whole recent backlog, not just this cycle's handful. */
export function readRecentThemeItems(repoRoot: string, minScore: number, maxItems = 1000): ThemeItemView[] {
  const out: ThemeItemView[] = []
  try {
    // `readFeed` stops once it has `maxItems` matches. Put the complete Themes admission predicate at its
    // push site instead of filtering the newest 1,000 RAW wire rows afterwards: on a busy day the raw cap
    // was mostly drop-band noise, so only ~13% of the retained material wire ever reached discovery.
    // Discovery intentionally keeps ingest-time scores + canonical story families; it must not re-rank or
    // re-dedup this historical pool under today's display settings.
    const eligible = (it: FeedItem): boolean => it.band !== 'drop'
      && (it.triage_score || 0) >= minScore
      && typeof it.found_at === 'string'
      && Number.isFinite(Date.parse(it.found_at))
      && (it.source_tier || deriveSourceTier(it)) !== 'social'
    const feed = readFeed(repoRoot, 2, {
      applyActiveWeights: false,
      preservePersistedDedupGroups: true,
      maxItems: Math.max(1, Math.floor(maxItems)),
      predicate: eligible,
    })
    for (const it of feed.items as FeedItem[]) {
      if (!eligible(it)) continue // defensive mirror if readFeed's admission contract changes
      // Legacy firehose rows only have `ts` (when the engine triaged them). Treating that as source time
      // can make a backfilled old article look newly published and clear the six-hour qualification gate.
      // New rows persist the real source/discovery clock; older unknown-time rows fail closed here.
      if (typeof it.found_at !== 'string' || !Number.isFinite(Date.parse(it.found_at))) continue
      out.push({
        event_id: it.event_id, dedup_group: it.dedup_group, headline: it.headline, headline_en: it.headline_en, found_at: it.found_at,
        ...(it.observed_at ? { observed_at: it.observed_at } : {}),
        ...(it.source_is_english === true ? { source_is_english: true as const } : {}),
        companies: it.companies || [], event_types: it.event_types || [], issuer_linkage: it.issuer_linkage,
        triage_score: it.triage_score, materiality_pre_score: (it as any).materiality_pre_score,
        source_tier: it.source_tier || deriveSourceTier(it), source_name: it.source_name, url: it.url,
        scope: it.scope, region: it.region, country: it.country,
        commodities: it.commodities, // canonical commodity tag(s) — carried onto members for the commodity slice
      })
    }
  } catch {
    // none
  }
  // readFeed is newest-first for the wire UI. The persisted discovery pool contract is the opposite:
  // oldest→newest, so its bounded tail always contains the freshest eligible rows.
  // readFeed returns newest→oldest. Reverse first so stable equal-clock rows also become oldest→newest.
  out.reverse().sort((a, b) => Date.parse(a.found_at) - Date.parse(b.found_at))
  return out
}

/** Load one live theme's full record by id (for the deep-dive API). */
export function loadTheme(repoRoot: string, themeId: string): Theme | null {
  // Merged rows are tombstones just like retired rows. Returning one here lets a racing detail/brief GET
  // reopen a theme after the index and SSE removal already declared it gone.
  return loadThemes(repoRoot).find((t) => t.theme_id === themeId && t.status === 'live' && t.narrative && !t.needs_rename) || null
}

/** The deep-dive payload: resolve the theme's member event_ids → full FeedItems (newest/best first),
 *  and group its companies by order tier. Members not found in the recent feed fall back to a minimal
 *  row built from the stored member record, so the deep-dive is never empty for a live theme. */
export interface ThemeDetailProjection {
  members?: ThemeMember[]
  now?: Date
}

export function buildThemeDetail(repoRoot: string, theme: Theme, projection: ThemeDetailProjection = {}): ThemeDetail {
  let feedById = new Map<string, FeedItem>()
  try {
    const feed = readFeed(repoRoot, 2)
    feedById = new Map((feed.items as FeedItem[]).map((it) => [it.event_id, it]))
  } catch {
    // none — fall back to minimal member rows below
  }
  // The detail uses the same unique-story proof as the first-look summary. Otherwise opening a clean
  // briefing row could bring back ten syndicated copies and copy-inflated company placement from a
  // legacy ledger row.
  const allMembers = Array.isArray(theme.members) ? theme.members : []
  const rawMembers = Array.isArray(projection.members) ? projection.members : allMembers
  const scoped = Array.isArray(projection.members)
  const uniqueMembers = uniqueThemeMembers(rawMembers)
  const initialCompanies = companiesForMembers(theme, uniqueMembers)
  const qualified = qualifyTheme(theme, projection.now || new Date(), rawMembers, initialCompanies, scoped)
  // Detail, summary and brief share the exact same thesis evidence. The hundreds of excluded rows in a
  // polluted legacy bag are diagnostics only and never reappear as “news in this theme”.
  const proofMembers = [...qualified.supporting_members, ...qualified.challenging_members]
  const members: FeedItem[] = proofMembers
    .map((m) => {
      const f = feedById.get(m.event_id)
      if (f) return f
      // minimal fallback so a member older than the 2-day feed still shows
      const sourceUrl = typeof m.url === 'string' ? m.url : ''
      let sourceDomain = ''
      try { sourceDomain = sourceUrl ? new URL(sourceUrl).hostname : '' } catch { /* malformed legacy URL */ }
      return {
        kind: 'item', ts: m.found_at, event_id: m.event_id, headline: m.headline, headline_en: m.headline_en, url: sourceUrl, domain: sourceDomain,
        source_name: m.source_name || sourceDomain, via: 'gdelt', region: 'GLOBAL', input_nature: 'news_headline',
        triage_score: m.score, band: 'watch', triage_reason: '', relevance: 'relevant_non_material',
        event_types: m.event_types || [], issuer_linkage: (m.issuer_linkage as any) || 'sector',
        companies: m.companies || [], size_bucket: 'unknown', source_tier: m.tier as any,
        dedup_status: 'new', inboxed: true,
      } as FeedItem
    })
    .sort((a, b) => (b.triage_score || 0) - (a.triage_score || 0) || (a.ts < b.ts ? 1 : -1))

  // Attach the read-time "why" to each company: a plain-English reason for its order-tier placement plus
  // the member stories that named it (§3 evidence). Built off theme.members — the SAME source the company
  // list was aggregated from (rebuildThemeCompanies), so the name_key join lands exactly. Non-mutating: a
  // fresh copy per company so the in-memory theme (and any later ledger write) never carries the why.
  const expressionKeys = new Set((theme.narrative?.expressions || []).map((expression) => expression.name_key))
  const projectedCompanies = companiesForMembers(theme, proofMembers)
    .filter((company) => !theme.narrative || expressionKeys.has(company.name_key))
  const whyIndex = buildWhyIndex(proofMembers)
  const withWhy = (c: ThemeCompany): ThemeCompany => ({ ...c, why: buildCompanyWhy(c, c.name_key, whyIndex) })
  const byOrder: CompaniesByOrder = { first: [], second: [], third: [] }
  // Array.isArray (not `|| []`): a corrupt ledger row could parse `companies` as a non-array truthy value
  // (`{}`, `true`), and `for…of {}` throws "object is not iterable" — the same class the top() guard covers.
  for (const c of projectedCompanies) (c.order === 1 ? byOrder.first : c.order === 2 ? byOrder.second : byOrder.third).push(withWhy(c))

  // Default the array pass-throughs so a malformed theme degrades gracefully on the CLIENT too: the deep
  // dive dereferences `detail.related_themes.length` (and maps sectors/keywords), so a missing/non-array
  // field here would crash `ThemeDeepDive` even though the server got past buildSummary.
  const summary = buildSummary(theme, projection.now || new Date(), scoped ? initialCompanies : undefined, scoped ? rawMembers : undefined)
  const players = qualified.players
  const playerProofIds = new Set(players.flatMap((player) => player.evidence.flatMap((row) => row.event_id ? [row.event_id] : [])))
  const whyNowId = theme.narrative?.why_now_event_id
  const evidenceNews = [
    ...qualified.supporting_members.map((member) => ({ member, stance: 'supports' as const })),
    ...qualified.challenging_members.map((member) => ({ member, stance: 'challenges' as const })),
  ].sort((a, b) => {
    const aTime = Date.parse(a.member.found_at)
    const bTime = Date.parse(b.member.found_at)
    const byTime = (Number.isFinite(bTime) ? bTime : 0) - (Number.isFinite(aTime) ? aTime : 0)
    return byTime || a.member.event_id.localeCompare(b.member.event_id)
  }).map(({ member, stance }) => ({
    event_id: member.event_id,
    headline: (member.headline_en || member.headline || '').trim(),
    publisher: member.source_name?.trim() || null,
    url: exactThemeEvidenceUrl(member.url),
    published_at: member.found_at,
    stance,
    roles: [
      ...(member.event_id === whyNowId ? ['why_now' as const] : []),
      stance === 'supports' ? 'support' as const : 'challenge' as const,
      ...(playerProofIds.has(member.event_id) ? ['player_proof' as const] : []),
    ],
  }))
  return {
    theme: summary,
    // Keep the compatibility field, but derive it from the same core-only projection as the header.
    // Legacy all-member scores may contain hundreds of rows the thesis contract explicitly excluded.
    scores: summary.score_components,
    members,
    companies_by_order: byOrder,
    formation: {
      shared_narrative_anchors: theme.narrative?.anchor_terms || ['', ''],
      distinct_news_count: evidenceNews.length,
      publisher_count: new Set(evidenceNews.map((row) => row.publisher).filter(Boolean)).size,
      supporting_count: evidenceNews.filter((row) => row.stance === 'supports').length,
      challenging_count: evidenceNews.filter((row) => row.stance === 'challenges').length,
      excluded_off_theme_count: qualified.off_core_members.length,
      first_seen: firstSeenForMembers(proofMembers, theme.first_seen),
      validated_at: theme.narrative?.validated_at || '',
    },
    players: {
      first_order: players.filter((player) => player.order === 1),
      second_order: players.filter((player) => player.order === 2),
    },
    evidence_news: evidenceNews,
    sectors: Array.isArray(theme.sectors) ? theme.sectors : [],
    related_themes: Array.isArray(theme.related_themes) ? theme.related_themes : [],
    keywords: Array.isArray(theme.keywords) ? theme.keywords : [],
  }
}
