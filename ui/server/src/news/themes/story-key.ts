import { createHash } from 'node:crypto'

// One canonical family for an underlying wire story. `dedup_group` is itself the earliest member's
// event_id (news/dedup.ts), so it shares the SAME namespace as the fallback event_id. A second,
// observation-level key preserves status-changing updates inside that family.

export interface ThemeStoryIdentity {
  event_id?: unknown
  dedup_group?: unknown
  headline?: unknown
  headline_en?: unknown
  event_types?: unknown
}

export const MAX_THEME_FAMILY_OBSERVATIONS = 6

export type ThemeFamilyStance = 'supports' | 'challenges' | 'context'

export interface ThemeFamilyClassification<T extends ThemeStoryIdentity> {
  member: T
  stance: ThemeFamilyStance
}

// This is intentionally a broad *preservation* detector, not a claim that the engine understands every
// English sentence. A false positive retains one extra bounded observation; a false negative could erase
// the update that disproves a thesis. Corroboration and score calculations use themeStoryFamilyKey, so a
// preserved update never masquerades as a second independent story.
const STATUS_UPDATE_RE = /\b(?:correct(?:s|ed|ing|ions?)?|clarif(?:y|ies|ied|ying|ications?)|revis(?:e|es|ed|ing|ions?)|restat(?:e|es|ed|ing|ements?)|retract(?:s|ed|ing|ions?)?|withdraw(?:s|n|ing|als?)?|withdrew|revers(?:e|es|ed|ing|als?)|den(?:y|ies|ied|ying|ials?)|refut(?:e|es|ed|ing)|rescind(?:s|ed|ing)?|cancel(?:s|l?ed|lations?|l?ing)?|postpon(?:e(?:s|d)?|ements?|ing)|delay(?:s|ed|ing)?|defer(?:s|red|ring)?|deferrals?|suspend(?:s|ed|ing)?|suspensions?|scrap(?:s|ped|ping)?|call(?:s|ed|ing)?[\s-]+off|adjourn(?:s|ed|ing|ments?)?|reschedul(?:e|es|ed|ing)|shift(?:s|ed|ing)|mov(?:e|es|ed|ing)|chang(?:e|es|ed|ing)|restor(?:e|es|ed|ing|ation)|reinstat(?:e|es|ed|ing|ement)|resum(?:e|es|ed|ing)|go(?:es|ing)?\s+ahead|proceed(?:s|ed|ing)?|false|incorrect|inaccurate|untrue)\b/i
const ADVERSE_UPDATE_RE = /\b(?:retract(?:s|ed|ing|ions?)?|withdraw(?:s|n|ing|als?)?|withdrew|revers(?:e|es|ed|ing|als?)|den(?:y|ies|ied|ying|ials?)|refut(?:e|es|ed|ing)|rescind(?:s|ed|ing)?|cancel(?:s|l?ed|lations?|l?ing)?|postpon(?:e(?:s|d)?|ements?|ing)|delay(?:s|ed|ing)?|defer(?:s|red|ring)?|suspend(?:s|ed|ing)?|scrap(?:s|ped|ping)?|call(?:s|ed|ing)?[\s-]+off|false|incorrect|inaccurate|untrue)\b/i
const RESTORATIVE_UPDATE_RE = /\b(?:restor(?:e|es|ed|ing|ation)|reinstat(?:e|es|ed|ing|ement)|resum(?:e|es|ed|ing)|go(?:es|ing)?\s+ahead|proceed(?:s|ed|ing)?)\b/i

export type ThemeStoryUpdateKind = 'ordinary' | 'other' | 'adverse' | 'restorative'

function headlineOf(item: ThemeStoryIdentity): string {
  return String((typeof item.headline_en === 'string' && item.headline_en.trim()) || item.headline || '')
}

const timestamp = (item: ThemeStoryIdentity & { found_at?: unknown }): number => {
  const value = typeof item.found_at === 'string' ? Date.parse(item.found_at) : Number.NaN
  return Number.isFinite(value) ? value : Number.NEGATIVE_INFINITY
}

function normalizedHeadline(item: ThemeStoryIdentity): string {
  return headlineOf(item)
    .normalize('NFKC')
    .toLocaleLowerCase('en-US')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .replace(/\s+/g, ' ')
    .slice(0, 500)
}

function fallbackHeadlineKey(item: ThemeStoryIdentity): string {
  const headline = normalizedHeadline(item)
  return headline ? `headline:${headline}` : ''
}

/** The underlying publisher-copy family. Use this for breadth, corroboration, and score calculations. */
export function themeStoryFamilyKey(item: ThemeStoryIdentity): string {
  const group = typeof item?.dedup_group === 'string' ? item.dedup_group.trim() : ''
  if (group) return group
  const event = typeof item?.event_id === 'string' ? item.event_id.trim() : ''
  if (event) return event
  // Runtime ledger compatibility only: well-formed engine rows always carry event_id. Keeping a bounded
  // headline fallback prevents malformed rows from collapsing into one empty-string family.
  return fallbackHeadlineKey(item)
}

function isStatusUpdate(item: ThemeStoryIdentity): boolean {
  const eventTypes = Array.isArray(item.event_types) ? item.event_types.map(String) : []
  return eventTypes.includes('accounting_restatement') || STATUS_UPDATE_RE.test(headlineOf(item))
}

export function themeStoryUpdateKind(item: ThemeStoryIdentity): ThemeStoryUpdateKind {
  const headline = headlineOf(item)
  if (RESTORATIVE_UPDATE_RE.test(headline)) return 'restorative'
  if (ADVERSE_UPDATE_RE.test(headline)) return 'adverse'
  return isStatusUpdate(item) ? 'other' : 'ordinary'
}

/**
 * One evidence observation. Ordinary publisher copies collapse to their family. Any correction,
 * cancellation, postponement, denial, reinstatement, or other status-change wording gets a content-bound
 * suffix, so no source-tier or score tie-break can erase a later thesis-changing update. The family key
 * remains available separately to prevent those observations from inflating independent corroboration.
 */
export function themeStoryKey(item: ThemeStoryIdentity): string {
  const family = themeStoryFamilyKey(item)
  if (!family || !isStatusUpdate(item)) return family
  const headline = normalizedHeadline(item)
  if (!headline) return family
  const observation = createHash('sha256').update(headline).digest('hex').slice(0, 12)
  return `${family}:update:${observation}`
}

/**
 * One exact row inside a canonical family. Unlike `themeStoryKey`, this identity does not depend on a
 * finite vocabulary of English correction words: every distinct event id in an exact `dedup_group` gets
 * a bounded audit lane. Breadth and conviction still use `themeStoryFamilyKey`, so preserving the row can
 * only trigger review; it can never masquerade as independent corroboration.
 */
export function themeStoryObservationKey(item: ThemeStoryIdentity): string {
  const family = themeStoryFamilyKey(item)
  if (!family) return fallbackHeadlineKey(item)
  const event = typeof item?.event_id === 'string' ? item.event_id.trim() : ''
  if (!event || event === family) return family
  return `${family}:observation:${event}`
}

/** Exact-family rows are distinct observations unless they carry exact normalized content or the exact
 * same event identity. Substring similarity is unsafe here: “confirms expansion” is a literal prefix of
 * “confirms expansion was cancelled”, yet the latter must enter the review queue as a new observation. */
export function sameThemeStoryObservation(left: ThemeStoryIdentity, right: ThemeStoryIdentity): boolean {
  if (themeStoryFamilyKey(left) !== themeStoryFamilyKey(right)) return false
  const leftHeadline = normalizedHeadline(left)
  const rightHeadline = normalizedHeadline(right)
  return Boolean(leftHeadline && rightHeadline && leftHeadline === rightHeadline)
    || themeStoryObservationKey(left) === themeStoryObservationKey(right)
}

/**
 * Resolve the currently effective classification for every story family. Historical observations stay in
 * the bounded audit ring, but only one row per family may affect conviction. A later challenge always
 * wins. A later support may restore the family only when its source priority is at least the active
 * challenge's; low-quality rewrites cannot reverse stronger disconfirmation. Context never overrides an
 * explicit support/challenge state.
 */
export function resolveThemeFamilyState<T extends ThemeStoryIdentity & { found_at?: unknown }>(
  rows: ThemeFamilyClassification<T>[],
  priority: (member: T) => number,
): ThemeFamilyClassification<T>[] {
  const byFamily = new Map<string, ThemeFamilyClassification<T>[]>()
  for (const row of rows) {
    const family = themeStoryFamilyKey(row.member)
    if (!family) continue
    const familyRows = byFamily.get(family) || []
    familyRows.push(row)
    byFamily.set(family, familyRows)
  }
  const out: ThemeFamilyClassification<T>[] = []
  for (const familyRows of byFamily.values()) {
    familyRows.sort((a, b) => timestamp(a.member) - timestamp(b.member)
      || priority(a.member) - priority(b.member)
      || String(a.member.event_id || '').localeCompare(String(b.member.event_id || '')))
    let active: ThemeFamilyClassification<T> | undefined
    let unresolvedChallengePriority = Number.NEGATIVE_INFINITY
    let latestChallengeAt = Number.NEGATIVE_INFINITY
    for (const row of familyRows) {
      if (row.stance === 'context') continue
      if (!active) {
        active = row
        if (row.stance === 'challenges') {
          unresolvedChallengePriority = priority(row.member)
          latestChallengeAt = timestamp(row.member)
        }
        continue
      }
      const rowTime = timestamp(row.member)
      const activeTime = timestamp(active.member)
      if (row.stance === 'challenges') {
        if (rowTime >= activeTime) {
          // Keep the strongest source threshold across every still-unresolved challenge. A later weak
          // rewrite may become the visible current row, but it cannot lower the quality required for a
          // subsequent support row to restore the family.
          unresolvedChallengePriority = active.stance === 'challenges'
            ? Math.max(unresolvedChallengePriority, priority(row.member))
            : priority(row.member)
          latestChallengeAt = Math.max(latestChallengeAt, rowTime)
          active = row
        }
      } else if (active.stance !== 'challenges') {
        // Equal source clocks are common for batched publisher copies. Do not let an arbitrary event-id
        // tie replace an already-active support (and invalidate its why-now pointer); only stronger
        // provenance may win the tie. A challenge still wins equal-time conflicts in the branch above.
        if (rowTime > activeTime
          || (rowTime === activeTime && priority(row.member) > priority(active.member))) active = row
      } else if (rowTime > latestChallengeAt && priority(row.member) >= unresolvedChallengePriority) {
        active = row
        unresolvedChallengePriority = Number.NEGATIVE_INFINITY
        latestChallengeAt = Number.NEGATIVE_INFINITY
      }
    }
    if (active) out.push(active)
    else if (familyRows.length) out.push(familyRows[familyRows.length - 1])
  }
  return out.sort((a, b) => timestamp(b.member) - timestamp(a.member)
    || String(a.member.event_id || '').localeCompare(String(b.member.event_id || '')))
}

/** Keep at most `perFamily` newest distinct observations for each family and at most `maxMembers` total. */
export interface BoundThemeFamilyHistoryOptions<T extends ThemeStoryIdentity> {
  perFamily?: number
  priority?: (member: T) => number
  stance?: (member: T) => ThemeFamilyStance | undefined
  /** Unclassified rows that must be shown to the narrative compiler before historical evidence. */
  preferred?: (member: T) => boolean
}

export function boundThemeFamilyHistory<T extends ThemeStoryIdentity & { found_at?: unknown }>(
  members: T[],
  maxMembers: number,
  options: BoundThemeFamilyHistoryOptions<T> = {},
): T[] {
  const cap = Math.max(0, Math.floor(maxMembers))
  if (!cap) return []
  const exact = new Map<string, T>()
  for (const member of members) {
    const key = themeStoryObservationKey(member)
    const prior = exact.get(key)
    const memberPriority = options.priority?.(member) ?? 0
    const priorPriority = prior ? options.priority?.(prior) ?? 0 : Number.NEGATIVE_INFINITY
    // An exact observation is one fact with competing provenance. Source hierarchy wins first; recency
    // only breaks a tie, so a newer wire rewrite cannot replace an older filing carrying the same event.
    if (!prior || memberPriority > priorPriority
      || (memberPriority === priorPriority && timestamp(member) >= timestamp(prior))) exact.set(key, member)
  }
  const byFamily = new Map<string, T[]>()
  for (const member of exact.values()) {
    const family = themeStoryFamilyKey(member)
    if (!family) continue
    const rows = byFamily.get(family) || []
    rows.push(member)
    byFamily.set(family, rows)
  }
  const perFamily = Math.max(1, Math.floor(options.perFamily ?? MAX_THEME_FAMILY_OBSERVATIONS))
  const familySelections = [...byFamily.values()].map((rows) => {
    const newest = [...rows].sort((a, b) => timestamp(b) - timestamp(a)
      || String(a.event_id || '').localeCompare(String(b.event_id || '')))
    const selected: T[] = []
    const ids = new Set<unknown>()
    const add = (member: T | undefined) => {
      if (!member || selected.length >= perFamily || ids.has(member.event_id)) return
      ids.add(member.event_id); selected.push(member)
    }
    const newestWhere = (predicate: (member: T) => boolean) => newest.find(predicate)
    // A new cancellation/correction has not received a stance yet. Put it ahead of the old active
    // support for this family, otherwise a tight global cap can keep one historical row per family and
    // silently evict the very observation that requires re-adjudication.
    add(newestWhere((member) => options.preferred?.(member) === true))
    if (options.stance) {
      const active = resolveThemeFamilyState(newest.flatMap((member) => {
        const stance = options.stance!(member)
        return stance ? [{ member, stance }] : []
      }), options.priority || (() => 0))[0]
      add(active?.member)
    } else add(newest[0])
    add(newestWhere((member) => options.stance?.(member) === 'challenges'))
    add(newestWhere((member) => options.stance?.(member) === 'supports'))
    add(newestWhere((member) => themeStoryUpdateKind(member) === 'adverse'))
    add(newestWhere((member) => themeStoryUpdateKind(member) === 'restorative'))
    if (options.priority) add([...newest].sort((a, b) => options.priority!(b) - options.priority!(a) || timestamp(b) - timestamp(a))[0])
    const original = [...newest].reverse().find((member) => {
      const event = typeof member.event_id === 'string' ? member.event_id.trim() : ''
      return event && event === themeStoryFamilyKey(member)
    }) || newest[newest.length - 1]
    add(original)
    for (const member of newest) add(member)
    return selected
  })
  // Fill one slot per family before taking second/third observations. One noisy family therefore cannot
  // crowd independent families out of the global cap; within each family the active state is first.
  const retained: T[] = []
  for (let depth = 0; depth < perFamily && retained.length < cap; depth++) {
    const round = familySelections.map((rows) => rows[depth]).filter((member): member is T => Boolean(member))
      .sort((a, b) => Number(options.preferred?.(b) === true) - Number(options.preferred?.(a) === true)
        || timestamp(b) - timestamp(a)
        || String(a.event_id || '').localeCompare(String(b.event_id || '')))
    for (const member of round) {
      if (retained.length >= cap) break
      retained.push(member)
    }
  }
  return retained.sort((a, b) => timestamp(a) - timestamp(b)
    || String(a.event_id || '').localeCompare(String(b.event_id || '')))
}
