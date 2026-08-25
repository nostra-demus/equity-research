import { createHash } from 'node:crypto'
import { buildSupplyChainBoard, type SupplyChainBoard, type SupplyChainLead } from '../../supply-chain'
import { peekCachedEnrichment } from '../enrich'
import { cleanTicker, normTicker, type VerifiedEquityListing } from '../symbology'
import { companyKeys, normName } from '../text-match'
import type { ArticleParty } from '../triage/groq'
import type { Theme, ThemeMember, ThemePlayer, ThemePlayerEvidence, ThemePlayerRelationship } from './types'

const arr = <T>(value: T[] | null | undefined): T[] => Array.isArray(value) ? value : []

const exactNewsEvidence = (member: ThemeMember): ThemePlayerEvidence => ({
  kind: 'news',
  event_id: member.event_id,
  headline: (member.headline_en || member.headline || '').trim() || null,
  publisher: member.source_name?.trim() || null,
  url: member.url?.trim() || null,
  published_at: member.found_at || null,
  source_ref: null,
  source_file: null,
})

const hasExactNewsLocator = (evidence: ThemePlayerEvidence): boolean => evidence.kind === 'news'
  && Boolean(evidence.event_id && evidence.headline && evidence.publisher && evidence.url && evidence.published_at)

function relationshipFromParty(party: ArticleParty): ThemePlayerRelationship | null {
  if (party.order === 'first') return 'direct_subject'
  return ['parent', 'supplier', 'customer', 'competitor', 'substitute', 'other'].includes(String(party.relationship || ''))
    ? party.relationship as ThemePlayerRelationship
    : null
}

function relationshipFromLead(lead: SupplyChainLead): ThemePlayerRelationship {
  const role = `${lead.role} ${lead.mechanism}`.toLowerCase()
  if (/supplier|vendor|sells? (?:to|into)/.test(role)) return 'supplier'
  if (/customer|buyer|purchases? from/.test(role)) return 'customer'
  if (/competitor/.test(role)) return 'competitor'
  if (/substitute|alternative/.test(role)) return 'substitute'
  return 'other'
}

interface Candidate extends Omit<ThemePlayer, 'ticker' | 'listing_status' | 'idea_eligible'> {
  ticker_candidate: string | null
  article_relationship_proof: boolean
}

function candidateKey(candidate: Pick<Candidate, 'name' | 'order' | 'relationship' | 'side'>): string {
  return `${normName(candidate.name)}|${candidate.order}|${candidate.relationship}|${candidate.side}`
}

function mergeCandidates(candidates: Candidate[]): Candidate[] {
  const merged = new Map<string, Candidate>()
  for (const candidate of candidates) {
    const key = candidateKey(candidate)
    if (!normName(candidate.name) || !candidate.mechanism.trim() || !candidate.evidence.length) continue
    const prior = merged.get(key)
    if (!prior) {
      merged.set(key, { ...candidate, evidence: [...candidate.evidence] })
      continue
    }
    if (prior.mechanism !== candidate.mechanism || prior.mechanism_basis !== candidate.mechanism_basis) continue
    const evidence = new Map([...prior.evidence, ...candidate.evidence].map((row) => [
      `${row.kind}|${row.event_id || ''}|${row.source_file || ''}|${row.source_ref || ''}`,
      row,
    ]))
    prior.evidence = [...evidence.values()]
    prior.article_relationship_proof ||= candidate.article_relationship_proof
    if (!prior.ticker_candidate) prior.ticker_candidate = candidate.ticker_candidate
  }
  return [...merged.values()]
}

function articleCandidates(theme: Theme, stateDir: string): Candidate[] {
  if (!theme.narrative) return []
  const supportIds = new Set(theme.narrative.evidence.filter((row) => row.stance === 'supports').map((row) => row.event_id))
  const out: Candidate[] = []
  for (const member of arr(theme.members)) {
    if (!supportIds.has(member.event_id)) continue
    const enrichment = peekCachedEnrichment(stateDir, member.event_id)
    if (!enrichment) continue
    const add = (party: ArticleParty, side: 'beneficiary' | 'harmed') => {
      const relationship = relationshipFromParty(party)
      if (!party.named_in_article || !party.mechanism?.trim() || !party.order || !relationship) return
      if (party.order === 'second' && relationship === 'other') return
      const evidence = exactNewsEvidence(member)
      if (!hasExactNewsLocator(evidence)) return
      out.push({
        name: party.name.trim(),
        ticker_candidate: cleanTicker(party.ticker),
        order: party.order === 'first' ? 1 : 2,
        side,
        relationship,
        mechanism: party.mechanism.trim(),
        mechanism_basis: 'source_statement',
        evidence: [evidence],
        article_relationship_proof: party.order === 'second',
      })
    }
    for (const party of arr(enrichment.beneficiaries)) add(party, 'beneficiary')
    for (const party of arr(enrichment.exposed)) add(party, 'harmed')
  }
  return out
}

function expressionCandidates(theme: Theme): Candidate[] {
  if (!theme.narrative) return []
  const memberById = new Map(arr(theme.members).map((member) => [member.event_id, member]))
  const companyByKey = new Map(arr(theme.companies).map((company) => [company.name_key, company]))
  return arr(theme.narrative.expressions).flatMap((expression) => {
    const company = companyByKey.get(expression.name_key)
    if (!company || !expression.mechanism?.trim()) return []
    const evidence = arr(expression.evidence_event_ids).flatMap((eventId) => {
      const member = memberById.get(eventId)
      if (!member || !companyKeys(member.companies).has(expression.name_key)) return []
      const proof = exactNewsEvidence(member)
      return hasExactNewsLocator(proof) ? [proof] : []
    })
    if (!evidence.length) return []
    return [{
      name: company.name,
      ticker_candidate: cleanTicker(company.ticker),
      order: 1 as const,
      side: expression.side,
      relationship: 'direct_subject' as const,
      mechanism: expression.mechanism.trim(),
      mechanism_basis: 'engine_inference' as const,
      evidence,
      article_relationship_proof: false,
    }]
  })
}

function relationshipExportCandidates(firstOrder: ThemePlayer[], board: SupplyChainBoard): Candidate[] {
  const anchors = new Set(firstOrder.flatMap((player) => player.ticker ? [normTicker(player.ticker)] : []))
  if (!anchors.size) return []
  return board.leads.flatMap((lead) => {
    if (lead.order !== 2 || !anchors.has(normTicker(lead.anchor_ticker)) || !lead.mechanism?.trim()) return []
    if (!lead.source_ref?.trim() && !lead.source_file?.trim()) return []
    return [{
      name: lead.name,
      ticker_candidate: cleanTicker(lead.symbol),
      order: 2 as const,
      side: 'unclear' as const,
      relationship: relationshipFromLead(lead),
      mechanism: lead.mechanism.trim(),
      mechanism_basis: 'source_statement' as const,
      evidence: [{
        kind: 'relationship_export' as const,
        event_id: null,
        headline: null,
        publisher: null,
        url: null,
        published_at: null,
        source_ref: lead.source_ref?.trim() || null,
        source_file: lead.source_file?.trim() || null,
      }],
      article_relationship_proof: false,
    }]
  })
}

export type ThemeListingVerifier = (ticker: string, companyName: string) => Promise<VerifiedEquityListing | null>

async function verifyCandidates(candidates: Candidate[], verify?: ThemeListingVerifier): Promise<ThemePlayer[]> {
  const verified = new Map<string, VerifiedEquityListing | null>()
  const out: ThemePlayer[] = []
  for (const candidate of mergeCandidates(candidates)) {
    const wanted = cleanTicker(candidate.ticker_candidate)
    let listing: VerifiedEquityListing | null = null
    if (wanted && verify) {
      const key = `${wanted}|${normName(candidate.name)}`
      if (!verified.has(key)) verified.set(key, await verify(wanted, candidate.name).catch(() => null))
      listing = verified.get(key) || null
    }
    const ticker = listing ? cleanTicker(listing.ticker) : null
    const hasExactNews = candidate.evidence.some((row) => row.kind === 'news' && !!row.event_id && !!row.headline && !!row.publisher && !!row.url && !!row.published_at)
    const ideaEligible = !!ticker && hasExactNews && candidate.side !== 'unclear'
      && (candidate.order === 1 || candidate.article_relationship_proof)
    out.push({
      name: candidate.name,
      ticker,
      listing_status: ticker ? 'verified_public' : 'no_verified_listing',
      order: candidate.order,
      side: candidate.side,
      relationship: candidate.relationship,
      mechanism: candidate.mechanism,
      mechanism_basis: candidate.mechanism_basis,
      evidence: candidate.evidence,
      idea_eligible: ideaEligible,
    })
  }
  return out.sort((a, b) => a.order - b.order || Number(b.idea_eligible) - Number(a.idea_eligible) || a.name.localeCompare(b.name))
}

/** Rebuild the authoritative contract from exact narrative events, cached body reads and relationship
 * exports. Relationship-export rows stay visible but can never seed Ideas in this upgrade. */
export async function rebuildThemePlayers(
  theme: Theme,
  repoRoot: string,
  stateDir: string,
  verify?: ThemeListingVerifier,
  board: SupplyChainBoard = buildSupplyChainBoard(repoRoot),
): Promise<ThemePlayer[]> {
  if (theme.player_contract_version !== 1 || !theme.narrative) return []
  const directAndArticle = await verifyCandidates([
    ...expressionCandidates(theme),
    ...articleCandidates(theme, stateDir),
  ], verify)
  const relationshipRows = relationshipExportCandidates(directAndArticle.filter((player) => player.order === 1), board)
  if (!relationshipRows.length) return directAndArticle

  // Direct/article rows were already verified above. Verify only new export rows so a scanner cycle
  // never repeats the same listing lookup merely because a relationship export exists.
  const relationshipPlayers = await verifyCandidates(relationshipRows, verify)
  return [...directAndArticle, ...relationshipPlayers]
    .sort((a, b) => a.order - b.order || Number(b.idea_eligible) - Number(a.idea_eligible) || a.name.localeCompare(b.name))
}

/** Fingerprint only source material that can change the player contract. A newly cached article read
 * therefore queues normal revalidation exactly once; unrelated cache activity does nothing. */
export function themePlayerEvidenceFingerprint(theme: Theme, stateDir: string, board: SupplyChainBoard): string {
  const rows: string[] = []
  const supportIds = new Set(arr(theme.narrative?.evidence).filter((row) => row.stance === 'supports').map((row) => row.event_id))
  for (const member of arr(theme.members)) {
    if (!supportIds.has(member.event_id)) continue
    const enrichment = peekCachedEnrichment(stateDir, member.event_id)
    if (!enrichment) continue
    rows.push(`${member.event_id}|${JSON.stringify(enrichment.beneficiaries || [])}|${JSON.stringify(enrichment.exposed || [])}`)
  }
  const expressionKeys = new Set(arr(theme.narrative?.expressions).map((expression) => expression.name_key))
  const tickers = new Set(arr(theme.companies)
    .filter((company) => expressionKeys.has(company.name_key))
    .flatMap((company) => cleanTicker(company.ticker) ? [normTicker(company.ticker!)] : []))
  for (const lead of board.leads) {
    if (tickers.has(normTicker(lead.anchor_ticker))) rows.push(`${lead.lead_id}|${lead.source_file || ''}|${lead.source_ref || ''}`)
  }
  return createHash('sha256').update(rows.sort().join('\n')).digest('hex').slice(0, 20)
}
