// Client-side story grouping for the news wire. The server stamps each item with a `dedup_group`
// (news/dedup.ts) = the earliest member's event_id of the story it belongs to. Here we fold the flat
// feed into one entry per story: pick the representative row to show, list the corroborating sources,
// and compute a small corroboration bonus so a story carried by several outlets ranks a touch higher.
// Pure + memo-friendly (the components call groupByDedup inside a useMemo). No grouping ⇒ each item is
// its own group, so this is a no-op when dedup is disabled or an item predates it.

import { sourceTierDef } from './scope'
import type { FeedItem } from './types'

export interface StoryGroup {
  group: string // the dedup_group id (earliest member's event_id)
  rep: FeedItem // the representative row to render
  members: FeedItem[] // every member of the story, newest-first
  others: FeedItem[] // members other than the representative (the expandable list)
  sources: string[] // distinct source names, the representative's first
  distinctSources: number
  effectiveScore: number // rep.triage_score + corroboration bonus — the Ranked sort key
}

const tierRank = (it: FeedItem): number => sourceTierDef(it.source_tier)?.rank ?? 0
const tsv = (it: FeedItem): string => it.ts || ''

/** Multi-source corroboration nudges a story up the Ranked list: +3 per extra source, capped at +10. */
export const corroborationBonus = (distinctSources: number): number => Math.min(10, 3 * Math.max(0, distinctSources - 1))

/**
 * The distinct regions a story touches. A dedup group can SPAN regions: `region` is stamped per source
 * (Reuters → GLOBAL, WSJ → US, The Economic Times → IN — see news/sources/approved-domains.ts), and a
 * story is merged ACROSS sources (this file's header: "Reuters + FT + CNBC"). So the representative row's
 * region alone under-represents the story — a story an Indian outlet carried can have a GLOBAL wire as its
 * rep. The Geography filter and its counts use this whole-group set so picking "IN" keeps that story
 * instead of hiding it (empty/blank regions dropped; rep is itself a member, so it is included).
 */
export function groupRegions(g: StoryGroup): string[] {
  const seen = new Set<string>()
  for (const m of g.members) { const r = (m.region || '').trim(); if (r) seen.add(r) }
  return [...seen]
}

/** Best representative of a story: best §4 source tier → highest quick-score → earliest seen. */
function pickRep(members: FeedItem[]): FeedItem {
  return members.slice().sort((a, b) => tierRank(b) - tierRank(a) || b.triage_score - a.triage_score || (tsv(a) < tsv(b) ? -1 : 1))[0]
}

/**
 * Fold a flat feed list into story groups, preserving the order in which each group is first seen
 * (so a caller that pre-sorted the list keeps that order at the group level). One pass + one sort.
 */
export function groupByDedup(items: FeedItem[]): StoryGroup[] {
  const order: string[] = []
  const byGroup = new Map<string, FeedItem[]>()
  for (const it of items) {
    const g = it.dedup_group || it.event_id
    const arr = byGroup.get(g)
    if (arr) arr.push(it)
    else { byGroup.set(g, [it]); order.push(g) }
  }
  const out: StoryGroup[] = []
  for (const g of order) {
    const members = byGroup.get(g)!.slice().sort((a, b) => (tsv(b) < tsv(a) ? -1 : 1)) // newest-first
    const rep = pickRep(members)
    const others = members.filter((m) => !(m.event_id === rep.event_id && m.ts === rep.ts))
    const sources: string[] = []
    const seen = new Set<string>()
    // Corroboration must reflect INDEPENDENT, on-list outlets. A `social` (Reddit) member is discovery-
    // only (CLAUDE.md §4/§24): the same low-trust story cross-posted to several subreddits carries a
    // DISTINCT per-subreddit source_name ("Reddit r/Layoffs", "Reddit r/ValueInvesting", …), which would
    // otherwise inflate the corroboration count and lift an all-social story as if several real outlets
    // had confirmed it — bypassing the server's capSocialScore cap (a 69 story would sort at 72 ≥ the
    // pick threshold). Count only NON-social distinct sources toward the bonus (an all-social group gets
    // zero), while still LISTING every distinct source under `sources` so the wire shows the chatter.
    const corroborating = new Set<string>()
    for (const m of [rep, ...members]) {
      const s = (m.source_name || '').trim()
      if (s && !seen.has(s)) { seen.add(s); sources.push(s) }
      if (s && (m.source_tier || '') !== 'social') corroborating.add(s)
    }
    out.push({ group: g, rep, members, others, sources, distinctSources: sources.length, effectiveScore: rep.triage_score + corroborationBonus(corroborating.size) })
  }
  return out
}
