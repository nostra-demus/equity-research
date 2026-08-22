// Deterministic second-look selector for low-scoring wire rows. This module does no I/O: it only
// explains each first-pass decision, groups corroborating stories, and ranks the small set that may
// receive a paced identity check. Keeping the selector pure makes the shadow replay reproducible.

import { deriveSourceTier, SOURCE_TIERS, type SourceTierId } from '../scope'
import { cleanTicker, coreCompanyName, normTicker } from '../symbology'
import { isRoutineFiling } from '../text-match'
import { lookupSource, normalizeDomain } from '../sources/approved-domains'
import type { FeedItem } from '../types'

export const RESCUE_SELECTOR_VERSION = 'second-look-v1'

export type RescuePool = 'ticker' | 'name'
export type RescueDecisionReasonCode =
  | 'sent_to_main_inbox'
  | 'score_outside_second_look'
  | 'social_low_quality_source'
  | 'routine_filing'
  | 'duplicate_story'
  | 'manually_blocked'
  | 'no_company_identity'
  | 'no_strong_company_event'
  | 'second_look_candidate'

export const RESCUE_REASON_LABELS: Record<RescueDecisionReasonCode, string> = {
  sent_to_main_inbox: 'Sent to the main inbox.',
  score_outside_second_look: 'Outside the score range for a second look.',
  social_low_quality_source: 'Social or low-quality source.',
  routine_filing: 'Routine filing.',
  duplicate_story: 'Already covered by another version of this story.',
  manually_blocked: 'Previously dismissed or already used.',
  no_company_identity: 'No clear listed-company identity in the saved headline data.',
  no_strong_company_event: 'No strong company event found.',
  second_look_candidate: 'Queued for a possible second look.',
}

const DECISION_EVENTS = new Set([
  'earnings_revenue_margin', 'guidance_change', 'mna', 'capital_actions', 'debt_credit',
  'default_distress', 'credit_rating_downgrade', 'credit_rating_upgrade', 'accounting_restatement',
  'dividend_cut', 'litigation_enforcement', 'regulatory', 'management', 'commercial', 'product',
  'operations', 'cybersecurity', 'capex', 'executive_exit', 'ownership_activist',
  'insider_transaction', 'strategic_review', 'restructuring_layoffs',
])

const EVENT_PRIORITY: Record<string, number> = {
  default_distress: 3,
  accounting_restatement: 3,
  credit_rating_downgrade: 3,
  dividend_cut: 3,
  litigation_enforcement: 3,
  regulatory: 3,
  cybersecurity: 3,
  executive_exit: 3,
  guidance_change: 3,
  earnings_revenue_margin: 2,
  mna: 2,
  strategic_review: 2,
  ownership_activist: 2,
  capital_actions: 2,
  debt_credit: 2,
  credit_rating_upgrade: 2,
  restructuring_layoffs: 2,
  commercial: 1,
  product: 1,
  operations: 1,
  capex: 1,
  management: 1,
  insider_transaction: 1,
}

const FULL_DATE_RE = /\b(?:20\d{2}[/-]\d{1,2}[/-]\d{1,2}|\d{1,2}[/-]\d{1,2}[/-]20\d{2}|(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+\d{1,2}(?:st|nd|rd|th)?,?\s+20\d{2}|\d{1,2}(?:st|nd|rd|th)?\s+(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?),?\s+20\d{2}|Q[1-4]\s*20\d{2})\b/i

export interface RescueRankInputs {
  strong_signal_count: number
  event_priority: number
  source_rank: number
  quantified: boolean
  independent_reports: number
  original_score: number
  specific_date: boolean
  found_at: string
  ticker_present: boolean
}

export interface RescueInitialDecision {
  rule_version: typeof RESCUE_SELECTOR_VERSION
  kept: boolean
  reason_codes: RescueDecisionReasonCode[]
  original_score: number
  rank_inputs: RescueRankInputs
}

export interface RescueCandidate {
  event_id: string
  identity_key: string
  pool: RescuePool
  query: string
  ticker: string | null
  company_name: string
  listing_country: string | null
  headline: string
  url: string
  domain: string
  source_name: string
  source_tier: SourceTierId
  event_types: string[]
  found_at: string
  rank_inputs: RescueRankInputs
  supporting_event_ids: string[]
}

export interface RescueSelection {
  candidates: RescueCandidate[]
  primary_count: number
  name_count: number
  reconciled: {
    total: number
    inboxed: number
    outside_score: number
    social: number
    routine_filing: number
    duplicate: number
    manually_blocked: number
    no_identity: number
    no_signal: number
    candidates: number
  }
}

function itemSourceTier(item: FeedItem): SourceTierId {
  const raw = String(item.source_tier || '') as SourceTierId
  return raw in SOURCE_TIERS ? raw : deriveSourceTier(item)
}

function sourceRank(item: FeedItem): number {
  return SOURCE_TIERS[itemSourceTier(item)]?.rank ?? 0
}

function eventPriority(item: FeedItem): number {
  return Math.max(0, ...(item.event_types || []).map((event) => EVENT_PRIORITY[String(event).toLowerCase()] || 0))
}

function decisionEvent(item: FeedItem): boolean {
  return (item.event_types || []).some((event) => DECISION_EVENTS.has(String(event).toLowerCase()))
}

function quantified(item: FeedItem): boolean {
  return Number(item.rank_factors?.quantified || 0) > 0
}

function identity(item: FeedItem): { ticker: string | null; name: string; country: string | null; key: string } | null {
  const companies = (item.companies || [])
    .map((company) => ({
      ticker: cleanTicker(company?.ticker),
      name: String(company?.name || '').trim(),
      country: typeof company?.listing_country === 'string' ? company.listing_country : null,
    }))
    .filter((company) => company.name || company.ticker)
  const named = new Map<string, typeof companies>()
  for (const company of companies) {
    const core = coreCompanyName(company.name)
    if (core) named.set(core, [...(named.get(core) || []), company])
  }
  // An event-level score across several issuers cannot be assigned to whichever ticker happened to be
  // listed first. The second look needs one unambiguous company before it spends a directory check.
  if (named.size > 1) return null
  const onlyNamed = named.size === 1 ? [...named.values()][0] : companies
  const tickers = new Map<string, string>()
  for (const company of onlyNamed) if (company.ticker) tickers.set(normTicker(company.ticker), company.ticker)
  if (tickers.size > 1) return null
  const withTicker = onlyNamed.find((company) => company.ticker)
  if (withTicker?.ticker) {
    return {
      ticker: withTicker.ticker,
      name: withTicker.name,
      country: withTicker.country,
      key: `ticker:${normTicker(withTicker.ticker)}`,
    }
  }
  if (named.size !== 1) return null
  const [core, matches] = [...named.entries()][0]
  const company = matches[0]
  return { ticker: null, name: company.name, country: company.country, key: `name:${core}` }
}

function publisherIdentity(item: FeedItem): string {
  const domain = normalizeDomain(String(item.domain || item.url || ''))
  const source = lookupSource(domain)?.source_name || String(item.source_name || '').trim()
  const normalizedSource = source.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
  return normalizedSource ? `source:${normalizedSource}` : domain ? `domain:${domain}` : ''
}

function eventFamily(item: FeedItem): string {
  const ranked = (item.event_types || [])
    .map((event) => String(event).toLowerCase())
    .filter(Boolean)
    .sort((left, right) => (EVENT_PRIORITY[right] || 0) - (EVENT_PRIORITY[left] || 0) || left.localeCompare(right))
  return ranked[0] || (quantified(item) ? 'quantified' : 'other')
}

function rankInputs(item: FeedItem, independentReports = 1): RescueRankInputs {
  const score = Number.isFinite(item.triage_score) ? Math.round(item.triage_score) : 0
  return {
    strong_signal_count: Number(decisionEvent(item)) + Number(quantified(item)) + Number(independentReports >= 2),
    event_priority: eventPriority(item),
    source_rank: sourceRank(item),
    quantified: quantified(item),
    independent_reports: independentReports,
    original_score: score,
    specific_date: FULL_DATE_RE.test(String(item.headline || '')),
    found_at: String(item.found_at || item.ts || ''),
    ticker_present: !!identity(item)?.ticker,
  }
}

export function classifyInitialRescueDecision(item: FeedItem): RescueInitialDecision {
  const rawScore = Number(item.triage_score)
  const score = Number.isFinite(rawScore) ? rawScore : 0
  const input = rankInputs(item)
  let reason: RescueDecisionReasonCode
  if (item.inboxed) reason = 'sent_to_main_inbox'
  else if (!Number.isFinite(rawScore) || score < 10 || score > 39) reason = 'score_outside_second_look'
  else if (itemSourceTier(item) === 'social' || item.caution === true || item.via === 'reddit') reason = 'social_low_quality_source'
  else if (isRoutineFiling(item.headline, itemSourceTier(item))) reason = 'routine_filing'
  else if (item.dedup_status === 'possible_duplicate') reason = 'duplicate_story'
  else if (!identity(item)) reason = 'no_company_identity'
  else if (!decisionEvent(item) && !quantified(item)) reason = 'no_strong_company_event'
  else reason = 'second_look_candidate'
  return {
    rule_version: RESCUE_SELECTOR_VERSION,
    kept: item.inboxed,
    reason_codes: [reason],
    original_score: Math.round(score),
    rank_inputs: input,
  }
}

function compareCandidates(left: RescueCandidate, right: RescueCandidate): number {
  const a = left.rank_inputs
  const b = right.rank_inputs
  return b.strong_signal_count - a.strong_signal_count
    || b.event_priority - a.event_priority
    || b.source_rank - a.source_rank
    || Number(b.quantified) - Number(a.quantified)
    || b.independent_reports - a.independent_reports
    || b.original_score - a.original_score
    || Number(b.specific_date) - Number(a.specific_date)
    || b.found_at.localeCompare(a.found_at)
    || left.event_id.localeCompare(right.event_id)
}

/** Reconcile every supplied row to one state, then return one representative per company/event cluster. */
export function selectRescueCandidates(
  items: readonly FeedItem[],
  now = Date.now(),
  maxAgeHrs = 36,
  blockedEventIds: ReadonlySet<string> = new Set(),
): RescueSelection {
  const counts: RescueSelection['reconciled'] = {
    total: 0, inboxed: 0, outside_score: 0, social: 0, routine_filing: 0,
    duplicate: 0, manually_blocked: 0, no_identity: 0, no_signal: 0, candidates: 0,
  }
  const maxAgeMs = Math.max(1, maxAgeHrs) * 3_600_000
  type ClusterRow = {
    item: FeedItem
    identity: NonNullable<ReturnType<typeof identity>>
    foundMs: number
    duplicate: boolean
  }
  const clusterRows: ClusterRow[] = []

  for (const item of items) {
    counts.total++
    const score = Number(item.triage_score)
    const found = Date.parse(String(item.found_at || item.ts || ''))
    if (item.inboxed) { counts.inboxed++; continue }
    if (!Number.isFinite(score) || score < 10 || score > 39 || !Number.isFinite(found) || now - found > maxAgeMs || found - now > 5 * 60_000) {
      counts.outside_score++; continue
    }
    if (itemSourceTier(item) === 'social' || item.caution === true || item.via === 'reddit') { counts.social++; continue }
    if (isRoutineFiling(item.headline, itemSourceTier(item))) { counts.routine_filing++; continue }
    if (blockedEventIds.has(item.event_id) || (!!item.dedup_group && blockedEventIds.has(item.dedup_group))) {
      counts.manually_blocked++; continue
    }
    const id = identity(item)
    if (!id) { counts.no_identity++; continue }
    // A persisted duplicate can corroborate a genuinely independent publisher copy, but it can never
    // become the representative sent to the directory. It already has its one terminal reconciliation
    // state here, even if no non-duplicate copy survives in the same 24-hour cluster.
    const duplicate = item.dedup_status === 'possible_duplicate'
    if (duplicate) counts.duplicate++
    clusterRows.push({ item, identity: id, foundMs: found, duplicate })
  }

  const families = new Map<string, ClusterRow[]>()
  for (const row of clusterRows) {
    // Publisher copies often disagree only on whether they supplied a ticker or listing country. Use
    // the exact normalized company name to keep those copies in one evidence package.
    const companyKey = coreCompanyName(row.identity.name)
      ? `company:${coreCompanyName(row.identity.name)}`
      : row.identity.key
    const key = `${companyKey}|${eventFamily(row.item)}`
    families.set(key, [...(families.get(key) || []), row])
  }

  const candidates: RescueCandidate[] = []
  const twentyFourHours = 24 * 3_600_000
  const clusters: ClusterRow[][] = []
  for (const rows of families.values()) {
    const ordered = [...rows].sort((left, right) => right.foundMs - left.foundMs
      || left.item.event_id.localeCompare(right.item.event_id))
    let cluster: ClusterRow[] = []
    let newest = 0
    for (const row of ordered) {
      if (!cluster.length || newest - row.foundMs <= twentyFourHours) {
        if (!cluster.length) newest = row.foundMs
        cluster.push(row)
      } else {
        clusters.push(cluster)
        cluster = [row]
        newest = row.foundMs
      }
    }
    if (cluster.length) clusters.push(cluster)
  }

  for (const members of clusters) {
    const representativeRows = members.filter((member) => !member.duplicate)
    if (!representativeRows.length) continue
    const independentPublishers = new Map<string, string>()
    const independentUrls = new Set<string>()
    for (const member of members) {
      const publisher = publisherIdentity(member.item)
      const url = String(member.item.url || '').trim()
      if (publisher && url && !independentPublishers.has(publisher) && !independentUrls.has(url)) {
        independentPublishers.set(publisher, url)
        independentUrls.add(url)
      }
    }
    const independentReports = independentPublishers.size
    const rankedMembers = representativeRows
      .map((member) => {
        const rank = rankInputs(member.item, independentReports)
        return { ...member, rank }
      })
      .sort((left, right) => compareCandidates({
        event_id: left.item.event_id, identity_key: '', pool: left.identity.ticker ? 'ticker' : 'name',
        query: '', ticker: left.identity.ticker, company_name: left.identity.name, listing_country: left.identity.country,
        headline: left.item.headline, url: left.item.url, domain: left.item.domain, source_name: left.item.source_name,
        source_tier: itemSourceTier(left.item), event_types: left.item.event_types || [], found_at: left.rank.found_at,
        rank_inputs: left.rank, supporting_event_ids: [],
      }, {
        event_id: right.item.event_id, identity_key: '', pool: right.identity.ticker ? 'ticker' : 'name',
        query: '', ticker: right.identity.ticker, company_name: right.identity.name, listing_country: right.identity.country,
        headline: right.item.headline, url: right.item.url, domain: right.item.domain, source_name: right.item.source_name,
        source_tier: itemSourceTier(right.item), event_types: right.item.event_types || [], found_at: right.rank.found_at,
        rank_inputs: right.rank, supporting_event_ids: [],
      }))
    const representative = rankedMembers[0]
    if (!representative) continue
    counts.duplicate += Math.max(0, representativeRows.length - 1)
    const strongCount = representative.rank.strong_signal_count
    // The best article remains the representative, while an independently saved ticker on another
    // non-duplicate copy can supply the cheaper exact identity query for the shared company/event.
    const identityOwner = rankedMembers.find((member) => member.identity.ticker) || representative
    const pool: RescuePool = identityOwner.identity.ticker ? 'ticker' : 'name'
    if (strongCount < (pool === 'ticker' ? 1 : 2)) { counts.no_signal++; continue }
    candidates.push({
      event_id: representative.item.event_id,
      identity_key: `${pool}:${identityOwner.identity.ticker
        ? normTicker(identityOwner.identity.ticker)
        : coreCompanyName(identityOwner.identity.name)}:${identityOwner.identity.country || ''}`,
      pool,
      query: identityOwner.identity.ticker || identityOwner.identity.name,
      ticker: identityOwner.identity.ticker,
      company_name: identityOwner.identity.name,
      listing_country: identityOwner.identity.country,
      headline: representative.item.headline,
      url: representative.item.url,
      domain: representative.item.domain,
      source_name: representative.item.source_name,
      source_tier: itemSourceTier(representative.item),
      event_types: representative.item.event_types || [],
      found_at: representative.rank.found_at,
      rank_inputs: representative.rank,
      supporting_event_ids: members.map((member) => member.item.event_id).filter((id) => id !== representative.item.event_id),
    })
  }
  candidates.sort(compareCandidates)
  counts.candidates = candidates.length
  return {
    candidates,
    primary_count: candidates.filter((candidate) => candidate.pool === 'ticker').length,
    name_count: candidates.filter((candidate) => candidate.pool === 'name').length,
    reconciled: counts,
  }
}

export function withInitialRescueDecision(item: FeedItem): FeedItem {
  const decision = classifyInitialRescueDecision(item)
  return {
    ...item,
    decision_rule_version: decision.rule_version,
    decision_kept: decision.kept,
    decision_reason_codes: decision.reason_codes,
    original_triage_score: decision.original_score,
    decision_rank_inputs: decision.rank_inputs,
  }
}
