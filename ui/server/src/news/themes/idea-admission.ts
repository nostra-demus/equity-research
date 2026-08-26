import type { ThemePlayer } from './types'

export interface ThemeIdeaAdmissionInput {
  narrative_complete: boolean
  support_count: number
  coherent: boolean
  unresolved_challenge: boolean
  pending_revalidation: boolean
  why_now_event_id: string | null
  why_now_exact: boolean
  why_now_current: boolean
  players: ThemePlayer[]
  theme_rev: number
  package_rev: number
}

export interface ThemeIdeaAdmissionResult {
  admitted: boolean
  blockers: string[]
  eligible_players: ThemePlayer[]
  player_proof_event_ids: string[]
}

/** One fail-closed admission contract shared by Themes and Ideas. It intentionally accepts only facts
 * already bound to the exact current revision; neither caller may repair or expand the package. */
export function admitThemeToIdeas(input: ThemeIdeaAdmissionInput): ThemeIdeaAdmissionResult {
  const blockers: string[] = []
  if (!input.narrative_complete) blockers.push('The validated narrative is incomplete.')
  if (input.support_count < 2) blockers.push('At least two distinct supporting news events are required.')
  if (!input.coherent) blockers.push('The retained news does not clear the narrative-coherence gate.')
  if (input.unresolved_challenge) blockers.push('A retained challenge is unresolved.')
  if (input.pending_revalidation) blockers.push('New evidence is still awaiting revalidation.')
  if (!input.why_now_event_id || !input.why_now_exact) blockers.push('A current exact why-now event is required.')
  else if (!input.why_now_current) blockers.push('The why-now event is stale.')
  if (input.theme_rev !== input.package_rev) blockers.push('The package mixes theme revisions.')

  const whyNow = input.why_now_event_id
  const eligiblePlayers = input.players.filter((player) => {
    if (!player.idea_eligible || player.listing_status !== 'verified_public' || player.side === 'unclear'
      || !player.ticker || !player.mechanism.trim()) return false
    const exactNews = player.evidence.some((row) => row.kind === 'news' && !!row.event_id && !!row.headline
      && !!row.publisher && !!row.url && !!row.published_at)
    if (!exactNews) return false
    if (player.order === 2 && !player.evidence.some((row) => row.kind === 'news' && !!row.event_id && !!row.published_at)) return false
    return true
  })
  const proofIds = [...new Set(eligiblePlayers.flatMap((player) => player.evidence
    .filter((row) => row.kind === 'news' && !!row.event_id && row.event_id !== whyNow)
    .map((row) => row.event_id!)))]
  if (!eligiblePlayers.length) blockers.push('No independently verified listed player has a causal mechanism and exact proof.')
  else if (!proofIds.length) blockers.push('Player proof must be a different news event from why now.')

  return {
    admitted: blockers.length === 0,
    blockers,
    eligible_players: eligiblePlayers,
    player_proof_event_ids: proofIds,
  }
}
