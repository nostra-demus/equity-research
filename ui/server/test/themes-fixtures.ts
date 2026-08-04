import { normName } from '../src/news/text-match'
import { selectNarrativeCore } from '../src/news/themes/core'
import type { Theme, ThemeNarrative } from '../src/news/themes/types'

type NarrativeExpression = ThemeNarrative['expressions'][number]

export interface NarrativeFixtureOptions {
  support_event_ids?: string[]
  challenge_event_ids?: string[]
  context_event_ids?: string[]
  anchor_terms?: [string, string]
  thesis?: string
  why_now?: string
  why_now_event_id?: string
  mechanism_steps?: string[]
  horizon?: ThemeNarrative['horizon']
  falsifier?: string
  expressions?: NarrativeExpression[]
  validated_at?: string
  generation?: 'groq' | 'claude'
}

/** Attach the complete evidence-bound contract required for a public/actionable fixture. The helper never
 * invents evidence IDs: its support set is narrowed to one real dense anchor-pair core, and its default
 * expression is emitted only when a ticker is named by a supporting member. */
export function attachValidNarrative(theme: Theme, options: NarrativeFixtureOptions = {}): Theme {
  // Synthetic fixtures still exercise the production provenance gate. Give every fixture row an explicit
  // source locator unless the test supplied one (including a deliberately malformed value).
  for (const member of theme.members) {
    if (member.source_name === undefined) member.source_name = 'Synthetic theme fixture'
    if (member.url === undefined) member.url = `https://example.test/themes/${encodeURIComponent(member.event_id)}`
  }
  const requestedSupport = options.support_event_ids
    ? theme.members.filter((member) => options.support_event_ids!.includes(member.event_id))
    : theme.members
  const core = selectNarrativeCore(requestedSupport, options.anchor_terms || [])
  if (core.anchors.length !== 2 || core.members.length < 2) {
    throw new Error(`fixture ${theme.theme_id} has no two-row dense narrative core`)
  }

  const supportIds = core.members.map((member) => member.event_id)
  const supportIdSet = new Set(supportIds)
  const challengeIds = (options.challenge_event_ids || [])
    .filter((eventId) => theme.members.some((member) => member.event_id === eventId) && !supportIdSet.has(eventId))
  const whyNowEventId = options.why_now_event_id || supportIds[0]
  if (!supportIdSet.has(whyNowEventId)) throw new Error('why_now_event_id must name supporting fixture evidence')

  let expressions = options.expressions
  if (!expressions) {
    expressions = []
    for (const member of core.members) {
      const company = (Array.isArray(member.companies) ? member.companies : [])
        .find((candidate) => typeof candidate?.ticker === 'string' && candidate.ticker.trim())
      if (!company) continue
      const nameKey = normName(company.name)
      if (!nameKey) continue
      expressions.push({
        name_key: nameKey,
        side: 'beneficiary',
        role: 'direct',
        mechanism: `${company.name} is directly exposed to the recurring demand or supply change described by this evidence.`,
        evidence_event_ids: [member.event_id],
      })
      break
    }
  }

  theme.narrative = {
    version: 1,
    thesis: options.thesis || 'The recurring evidence indicates a durable change in industry demand, supply or economics.',
    why_now: options.why_now || `The latest supporting event is ${whyNowEventId}.`,
    why_now_event_id: whyNowEventId,
    mechanism_steps: options.mechanism_steps || [
      'The cited event changes industry demand, supply or capacity.',
      'That change affects revenue, costs, capital spending or pricing for the named exposure.',
    ],
    horizon: options.horizon || 'months',
    falsifier: options.falsifier || 'The thesis fails if later primary evidence reverses the cited industry change.',
    anchor_terms: core.anchors,
    evidence: [
      ...supportIds.map((event_id) => ({ event_id, stance: 'supports' as const })),
      ...challengeIds.map((event_id) => ({ event_id, stance: 'challenges' as const })),
    ],
    context_event_ids: (options.context_event_ids || [])
      .filter((eventId) => theme.members.some((member) => member.event_id === eventId) && !supportIdSet.has(eventId) && !challengeIds.includes(eventId)),
    expressions,
    validated_at: options.validated_at || '2026-08-04T06:00:00Z',
  }
  theme.generation = options.generation || 'claude'
  return theme
}
