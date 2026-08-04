// One shared definition of a theme's narrative core. A theme is not the transitive closure of vaguely
// similar headlines: every core row must carry the SAME pair of recurring, non-company narrative anchors.
// Discovery, assignment, healing and qualification all use this module so one layer cannot certify a bag
// another layer would reject.

import { themeNarrativeTokens } from '../text-match'
import type { Theme, ThemeMember } from './types'

const headlineOf = (member: ThemeMember): string =>
  String((typeof member.headline_en === 'string' && member.headline_en.trim()) || member.headline || '').trim()

export interface NarrativeCore {
  anchors: [string, string] | []
  members: ThemeMember[]
  excluded: ThemeMember[]
}

function tokenSet(member: ThemeMember, generic?: Set<string>): Set<string> {
  return themeNarrativeTokens(
    headlineOf(member),
    Array.isArray(member.companies) ? member.companies : [],
    member.tier,
    generic,
  )
}

/**
 * Select the densest common two-anchor core. Declared anchors constrain the search when a validated
 * narrative contract exists. Ties prefer the pair with the lower corpus frequency (more specific), then
 * lexical order for repeatability. A single bridge row can be in several candidates, but it cannot make
 * rows lacking the winning pair part of the returned core.
 */
export function selectNarrativeCore(
  members: ThemeMember[],
  declaredAnchors: string[] = [],
  generic?: Set<string>,
): NarrativeCore {
  const rows = Array.isArray(members) ? members : []
  if (!rows.length) return { anchors: [], members: [], excluded: [] }

  const declared = new Set(declaredAnchors.map((v) => String(v).toLowerCase().trim()).filter(Boolean))
  const sets = rows.map((member) => {
    // A validator may choose the pair, but it cannot grant a permanent exemption from the rolling
    // boilerplate guard. If both words later become corpus-wide vocabulary, they no longer prove that a
    // new row belongs to this thesis. The compiler can re-ground the theme on a more specific pair.
    const tokens = [...tokenSet(member, generic)].filter((token) => !declared.size || declared.has(token)).sort()
    return new Set(tokens)
  })
  const tokenFrequency = new Map<string, number>()
  for (const tokens of sets) for (const token of tokens) tokenFrequency.set(token, (tokenFrequency.get(token) || 0) + 1)

  const pairMembers = new Map<string, number[]>()
  for (let row = 0; row < sets.length; row++) {
    const tokens = [...sets[row]].slice(0, 18) // bound pathological headlines without changing normal rows
    for (let i = 0; i < tokens.length; i++) {
      for (let j = i + 1; j < tokens.length; j++) {
        const key = `${tokens[i]}\u0000${tokens[j]}`
        const support = pairMembers.get(key) || []
        support.push(row)
        pairMembers.set(key, support)
      }
    }
  }

  const winner = [...pairMembers.entries()]
    .filter(([, support]) => support.length >= 2)
    .sort((a, b) => {
      const bySupport = b[1].length - a[1].length
      if (bySupport) return bySupport
      const [a1, a2] = a[0].split('\u0000'); const [b1, b2] = b[0].split('\u0000')
      const aFrequency = (tokenFrequency.get(a1) || 0) + (tokenFrequency.get(a2) || 0)
      const bFrequency = (tokenFrequency.get(b1) || 0) + (tokenFrequency.get(b2) || 0)
      return aFrequency - bFrequency || a[0].localeCompare(b[0])
    })[0]

  if (!winner) return { anchors: [], members: [], excluded: [...rows] }
  const anchors = winner[0].split('\u0000') as [string, string]
  const included = new Set(winner[1])
  return {
    anchors,
    members: rows.filter((_, index) => included.has(index)),
    excluded: rows.filter((_, index) => !included.has(index)),
  }
}

/** A validated contract owns assignment. Contractless legacy themes use a stricter three-token floor and
 * stay out of the PM surface while the normal validation queue migrates them. */
export function assignmentAnchors(theme: Theme): string[] {
  const anchors = theme.narrative?.anchor_terms
  return Array.isArray(anchors) && anchors.length === 2 ? anchors : []
}
