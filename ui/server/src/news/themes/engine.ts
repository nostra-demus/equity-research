// The themes orchestrator — what runCycle calls once per cycle, AFTER the inbox/firehose write (so a
// bug here can never block or corrupt the core pipeline). A pure in-memory core (stepThemes) tied to
// thin file I/O (runThemesCycle). Fail-soft everywhere: any throw is swallowed by the caller's guard
// and the cycle proceeds.
//
//   assign new material items → existing themes  (every cycle, ~$0)
//   (periodic) discover new themes from the unclustered pool + name them (optional LLM)
//   rescore every live theme                      (every cycle — drives the hot→parked decay)
//   merge near-dupes + retire dead themes
//   persist (append changed themes to the ledger; rewrite the live index) + return changed summaries

import fs from 'node:fs'
import path from 'node:path'
import { assignThemes, boundThemeMembers, DEFAULT_ASSIGN_CONFIG, type AssignConfig } from './assign'
import { coherenceOf, discoverDeterministic, familyRepresentativeItems, linkThemes, mergeAndRetire, refreshThemeIdentity, DEFAULT_DISCOVER_CONFIG, type DiscoverConfig } from './discover'
import { scoreTheme, ensureDaily, rollDaily, DEFAULT_THEME_SCORE_CONFIG, type ThemeScoreConfig } from './score'
import { appendThemeMutations, buildSummary, loadThemes, maybeCompactThemesLedger, readRecentThemeItems, readThemesIndex, writeThemesIndex } from './store'
import { buildGenericSet, loadTokenDf, saveTokenDf, updateTokenDf, DEFAULT_TOKEN_DF_CONFIG, type TokenDfConfig } from './token-df'
import type { Theme, ThemeCompilerAttempt, ThemeItemView, ThemeRemoval, ThemeSummary } from './types'
import { boundThemeFamilyHistory, themeStoryFamilyKey, themeStoryObservationKey } from './story-key'
import { sourcePriority } from './evidence'
import { buildSupplyChainBoard } from '../../supply-chain'
import { rebuildThemePlayers, themePlayerEvidenceFingerprint, type ThemeListingVerifier } from './players'

export interface ThemesConfig {
  score: ThemeScoreConfig
  assign: AssignConfig
  discover: DiscoverConfig
  poolCap: number // max unclustered items kept between discovery passes
  df: TokenDfConfig // rolling document-frequency suppression (token-df.ts)
  renamePerPass: number // healed-theme renames folded into an EXISTING namer call per discovery pass
  renameIdentityShift: number // keyword-jaccard drop that flags needs_rename on an LLM-named theme
  renamePurgeShare: number // member-purge share that flags needs_rename
  coherenceHealBelow: number // early off-cadence heal trigger (coherenceOf below this)
}
export const DEFAULT_THEMES_CONFIG: ThemesConfig = {
  score: DEFAULT_THEME_SCORE_CONFIG,
  assign: DEFAULT_ASSIGN_CONFIG,
  discover: DEFAULT_DISCOVER_CONFIG,
  poolCap: 1000,
  df: DEFAULT_TOKEN_DF_CONFIG,
  renamePerPass: 2,
  renameIdentityShift: 0.5,
  renamePurgeShare: 0.3,
  coherenceHealBelow: 0.5,
}

/** Build a ThemesConfig from the NEWS config block's themes* knobs (env-tunable). */
export function themesConfigFromNews(news: { themesRetireHours?: number; themesMaxMembers?: number; themesDfWindowDays?: number; themesDfDailyRatio?: number; themesDfPersistDays?: number; themesDfMinDailyDocs?: number; themesDfProtected?: string[] }): ThemesConfig {
  const maxMembers = news.themesMaxMembers || DEFAULT_THEMES_CONFIG.assign.maxMembers
  return {
    ...DEFAULT_THEMES_CONFIG,
    assign: { ...DEFAULT_THEMES_CONFIG.assign, maxMembers },
    discover: { ...DEFAULT_THEMES_CONFIG.discover, maxMembers, retireHours: news.themesRetireHours || DEFAULT_THEMES_CONFIG.discover.retireHours },
    df: {
      ...DEFAULT_TOKEN_DF_CONFIG,
      windowDays: news.themesDfWindowDays || DEFAULT_TOKEN_DF_CONFIG.windowDays,
      dailyRatio: news.themesDfDailyRatio || DEFAULT_TOKEN_DF_CONFIG.dailyRatio,
      persistDays: news.themesDfPersistDays || DEFAULT_TOKEN_DF_CONFIG.persistDays,
      minDailyDocs: news.themesDfMinDailyDocs || DEFAULT_TOKEN_DF_CONFIG.minDailyDocs,
      protected: news.themesDfProtected || DEFAULT_TOKEN_DF_CONFIG.protected,
    },
  }
}

// An optional LLM pass that renames/validates freshly-created themes in place (sets name/slug/
// description/keywords; may set status:'retired' to reject a non-theme). Async; absent = deterministic.
export type LlmNamer = (created: Theme[], now: Date, generic?: Set<string>) => Promise<ThemeCompilerAttempt | void>

export interface StepInput {
  themes: Theme[]
  pool: ThemeItemView[]
  items: ThemeItemView[] // this cycle's material items
  runDiscovery: boolean
  now: Date
  cfg?: ThemesConfig
  llmNamer?: LlmNamer
  generic?: Set<string> // corpus-generic tokens this cycle (token-df.ts) — suppressed by themeTokens everywhere
  playerEvidenceFingerprints?: ReadonlyMap<string, string>
}

export interface StepResult {
  themes: Theme[]
  pool: ThemeItemView[]
  changed: ThemeSummary[] // live themes that materially changed (for SSE)
  removed: ThemeRemoval[] // explicit invalidations for live clients
  changedThemeIds: string[] // every structural mutation, including merged/retired rows (for persistence)
  assignments: Map<string, string[]> // event_id → theme_ids (for stamping theme_ids on items)
  compilerAttempt?: ThemeCompilerAttempt
}

/** Pure(ish) in-memory step. The only side effect is mutating the passed theme objects. */
export async function stepThemes(input: StepInput): Promise<StepResult> {
  const cfg = input.cfg || DEFAULT_THEMES_CONFIG
  const { now } = input
  const nowMs = now.getTime()
  const themes = input.themes
  const changedIds = new Set<string>()
  const notSocial = (v: ThemeItemView) => (v.source_tier || '') !== 'social'

  // Migrate at most two legacy narratives per cycle. A cached body read or relationship export changing
  // its exact evidence fingerprint uses this same normal validator queue; it is never patched directly.
  let legacyPlayerMigrations = 0
  for (const theme of input.playerEvidenceFingerprints ? themes : []) {
    if (theme.status !== 'live' || !theme.narrative) continue
    const fingerprint = input.playerEvidenceFingerprints?.get(theme.theme_id)
    const legacy = theme.player_contract_version !== 1
    const changedEvidence = theme.player_contract_version === 1 && fingerprint !== undefined
      && fingerprint !== theme.player_evidence_fingerprint
    if ((!legacy || legacyPlayerMigrations >= 2) && !changedEvidence) continue
    if (legacy) legacyPlayerMigrations++
    if (theme.needs_player_revalidation) continue
    theme.needs_player_revalidation = true
    theme.validation_queued_at ||= now.toISOString().replace(/\.\d{3}Z$/, 'Z')
    theme.rev++
    changedIds.add(theme.theme_id)
  }

  // An overflowed theme is a tombstone, not a sink. Preserve its bounded audit as discovery input before
  // retiring it, and also reclaim any current-cycle row the cap evicted. The firehose cold-start repairs
  // older omissions after a restart; this local hand-off prevents the triggering pass itself losing them.
  const overflowRecovery: ThemeItemView[] = []
  const retiredOverflowIds = new Set<string>()
  const recoverMember = (member: Theme['members'][number]): ThemeItemView => ({
    event_id: member.event_id,
    dedup_group: member.dedup_group,
    headline: member.headline,
    headline_en: member.headline_en,
    ...(member.source_is_english === true ? { source_is_english: true as const } : {}),
    found_at: member.found_at,
    ...(member.observed_at ? { observed_at: member.observed_at } : {}),
    triage_score: member.score,
    source_tier: member.tier,
    source_name: member.source_name,
    url: member.url,
    companies: member.companies,
    event_types: member.event_types,
    issuer_linkage: member.issuer_linkage,
    country: member.country,
    region: member.region,
    commodities: member.commodities,
  })
  const registerOverflowRetirement = (theme: Theme): boolean => {
    if (retiredOverflowIds.has(theme.theme_id)) return false
    retiredOverflowIds.add(theme.theme_id)
    overflowRecovery.push(...theme.members.map(recoverMember).filter(notSocial))
    return true
  }
  const retireLiveOverflowThemes = (alsoChanged?: Set<string>): Set<string> => {
    const retired = new Set<string>()
    for (const theme of themes) {
      if (theme.status === 'live' && theme.narrative_update_overflow === true) {
        theme.status = 'retired'
        theme.rev++
        changedIds.add(theme.theme_id)
        registerOverflowRetirement(theme)
        retired.add(theme.theme_id)
      } else if (alsoChanged?.has(theme.theme_id)
        && theme.status === 'retired' && theme.narrative_update_overflow === true
        && registerOverflowRetirement(theme)) {
        // mergeAndRetire may age-retire the just-overflowed keeper before this scan sees it.
        retired.add(theme.theme_id)
      }
    }
    return retired
  }
  const unclaimedRecovery = (rows: ThemeItemView[]): ThemeItemView[] => {
    const liveObservations = new Set(themes
      .filter((theme) => theme.status === 'live')
      .flatMap((theme) => theme.members.map(themeStoryObservationKey)))
    return rows.filter((row) => !liveObservations.has(themeStoryObservationKey(row)))
  }

  // Normalize legacy/previous-process state before any scoring, queueing or discovery work. Member and
  // pending-debt state obey the configured hard cap even when the last persisted row predates this rule.
  for (const theme of themes) {
    const beforeMembers = theme.members.map((member) => member.event_id).join('\0')
    const beforePending = (theme.pending_narrative_event_ids || []).join('\0')
    const beforeNeedsNarrativeUpdate = theme.needs_narrative_update === true
    const beforeOverflow = theme.narrative_update_overflow === true
    boundThemeMembers(theme, cfg.assign.maxMembers)
    if (beforeMembers !== theme.members.map((member) => member.event_id).join('\0')
      || beforePending !== (theme.pending_narrative_event_ids || []).join('\0')
      || beforeNeedsNarrativeUpdate !== (theme.needs_narrative_update === true)
      || beforeOverflow !== (theme.narrative_update_overflow === true)) {
      theme.rev++
      changedIds.add(theme.theme_id)
    }
  }

  // A hard-cap overflow means this bounded record no longer contains every fact needed to rebuild or
  // validate its narrative. Keeping it live but excluding it from every compiler lane creates a permanent
  // zombie. Retire it before any assignment on every scanner cycle; successor discovery may remain on
  // cadence, but an incomplete theme must never absorb another row in the meantime.
  retireLiveOverflowThemes()

  // Version migration is automatic and bounded. Old lexical clusters remain internal and cannot absorb
  // stories; each discovery pass enrolls at most four newest-first for the existing validator lane, with no hand edits
  // to historical rows and no separate model call.
  if (input.runDiscovery) {
    const legacyDebt = themes
      .filter((theme) => theme.status === 'live' && !theme.narrative && !theme.narrative_update_overflow
        && !theme.needs_validation && !theme.needs_rename)
      .sort((a, b) => (a.last_flow < b.last_flow ? 1 : a.last_flow > b.last_flow ? -1 : 0))
      .slice(0, 4)
    for (const theme of legacyDebt) {
      if (theme.generation === 'deterministic') {
        theme.needs_validation = true
        // Legacy clusters predate the FIFO contract. Enrol their complete retained member set so a large
        // theme is not judged forever from one ten-row prompt while qualification counts every row.
        theme.pending_narrative_event_ids = theme.members.map((member) => member.event_id)
      }
      else theme.needs_rename = true
      theme.validation_queued_at = now.toISOString().replace(/\.\d{3}Z$/, 'Z')
      theme.rev++
      changedIds.add(theme.theme_id)
    }
  }

  // CLAUDE.md §4/§24: a `social` (Reddit) item is discovery/corroboration only and must NEVER independently
  // drive an investment narrative — a theme is a thesis precursor. The band/score caps keep social out of
  // the top `pick`, but a non-drop social item still lands in `picks` (and the discovery cold-start pool),
  // and the themes layer has NO source-tier guard (score.ts even counts an unrecognised tier at full
  // news-level magnitude). So drop social items at the door: they neither seed a new theme nor inflate an
  // existing one's magnitude/breadth. Both entry points are covered here — this cycle's `items` and the
  // accumulated/back-filled `pool` (runThemesCycle seeds it from readRecentThemeItems).
  const items = input.items.filter(notSocial)

  // 0. seed each existing live theme's daily ring from its CURRENT (pre-assignment) member ring, so the
  //    per-member bumps below don't double-count this cycle's items. New ledgers / fresh themes only.
  for (const t of themes) if (t.status === 'live') ensureDaily(t, nowMs)

  // when a heal shifted an LLM-named theme's identity or membership enough, its persisted narrative
  // name/description likely describe the OLD mix — flag it for a re-name (rides an existing namer call)
  const flagRename = (t: Theme, r: { identityShift: number; purgeShare: number }) => {
    if (t.generation !== 'deterministic' && (r.identityShift > cfg.renameIdentityShift || r.purgeShare > cfg.renamePurgeShare)) {
      if (!t.needs_rename) t.validation_queued_at = now.toISOString().replace(/\.\d{3}Z$/, 'Z')
      t.needs_rename = true
    }
  }

  // A once-specific pair can become corpus boilerplate. Stop assignment immediately and queue the same
  // thesis for re-grounding instead of either granting a permanent generic-word exemption or letting the
  // self-healer erase the evidence before the compiler can choose a replacement pair.
  if (input.generic?.size) {
    for (const theme of themes) {
      if (theme.status !== 'live' || !theme.narrative?.anchor_terms?.some((anchor) => input.generic!.has(anchor))) continue
      if (!theme.needs_rename) {
        theme.needs_rename = true
        theme.validation_queued_at = now.toISOString().replace(/\.\d{3}Z$/, 'Z')
        delete theme.validation_attempted_at
        theme.rev++
        changedIds.add(theme.theme_id)
      }
    }
  }

  // 1. assignment (every cycle) — also bumps each touched theme's daily ring per new member landed
  const a = assignThemes(items, themes, cfg.assign, now, input.generic)
  for (const id of a.touched) {
    changedIds.add(id)
    // assignThemes records the exact pending event IDs on validated themes. Keeping that write next to
    // membership means duplicate/no-op assignments cannot manufacture validation debt.
  }
  const assignmentOverflows = retireLiveOverflowThemes()
  if (assignmentOverflows.size) {
    for (const item of items) {
      if (a.assignments.get(item.event_id)?.some((themeId) => assignmentOverflows.has(themeId))) {
        overflowRecovery.push(item)
      }
    }
  }
  // Keep bounded within-family history until discovery has selected families and attached their audit
  // excerpts. Collapsing to one representative here erased cancellations/restorations before
  // discoverDeterministic could preserve them on the created theme.
  let pool = [...input.pool.filter(notSocial), ...a.unclustered]

  // 1b. self-heal existing themes (periodic): re-derive each live theme's identity from its members with
  //     the current tokenizer and purge members that no longer match — draining themes mis-seeded before
  //     SEC form codes were excluded (the "Mortgage Finance Innovation" magnet bug). Retire any that
  //     decayed below the cluster minimums. Idempotent for healthy themes. Runs on the discovery cadence.
  if (input.runDiscovery) {
    for (const t of themes) {
      if (t.status !== 'live') continue
      const r = refreshThemeIdentity(t, cfg.discover, now, input.generic)
      if (r.retire) { t.status = 'retired'; t.rev++; changedIds.add(t.theme_id) }
      else if (r.changed) { changedIds.add(t.theme_id); flagRename(t, r) }
    }
    retireLiveOverflowThemes()
  }

  // 2. Discovery remains periodic, but narrative UPDATE classification runs every scanner cycle. New
  // matching evidence otherwise sits unclassified for the full discovery cadence, and sustained ingress
  // can outrun a queue that only drains hourly.
  let created: Theme[] = []
  if (input.runDiscovery) {
    if (pool.length) {
      const discovered = discoverDeterministic(pool, themes, now, cfg.discover, input.generic)
      created = discovered.created
      pool = discovered.leftover
    }
  }

  // Fair debt order uses the last attempt when present (round-robin under repeated failures), otherwise
  // the original enqueue clock. Within each theme, llm.sampleMembers drains pending IDs oldest-first.
  const debtTime = (theme: Theme) => Date.parse(theme.validation_attempted_at || theme.validation_queued_at || '') || 0
  const byDebt = (a: Theme, b: Theme) => debtTime(a) - debtTime(b) || a.theme_id.localeCompare(b.theme_id)
  const updates = themes
    // Overflow means the missing row cannot be classified from this bounded record. Retrying the model
    // would spend money without a path to truth; keep the thesis quarantined until its evidence is rebuilt.
    .filter((t) => t.status === 'live' && t.narrative && (t.needs_narrative_update || t.needs_player_revalidation)
      && !t.narrative_update_overflow && !t.needs_rename)
    .sort(byDebt)
  const pendingValidations = themes
    // A raw cluster whose pre-validation audit overflowed cannot be judged from the retained subset.
    // Keep it quarantined until its evidence is rebuilt instead of paying the compiler to approve a
    // materially incomplete cluster.
    .filter((t) => t.status === 'live' && t.generation === 'deterministic' && t.needs_validation
      && !t.narrative_update_overflow)
    .sort(byDebt)
  const renames = themes
    .filter((t) => t.status === 'live' && t.needs_rename && !t.narrative_update_overflow)
    .sort(byDebt)
    .slice(0, cfg.renamePerPass)

  // Four is the compiler's hard batch. Every scanner cycle reserves capacity for raw validation and
  // re-grounding debt, not only the discovery cadence: otherwise a provider-starved discovery pass strands
  // candidates for another four cycles after fallback capacity returns. The namer sends one theme per
  // provider request, so this queue cap does not create an oversized provider payload.
  const validationBatch: Theme[] = []
  const add = (theme: Theme | undefined) => {
    if (theme && !validationBatch.includes(theme) && validationBatch.length < 4) validationBatch.push(theme)
  }
  for (const theme of updates.slice(0, 2)) add(theme)
  add(pendingValidations[0] || created[0])
  add(renames[0])
  for (const theme of updates) add(theme)
  for (const theme of pendingValidations) add(theme)
  for (const theme of created) add(theme)
  for (const theme of renames) add(theme)

  let compilerAttempt: ThemeCompilerAttempt | undefined
  if (input.llmNamer && validationBatch.length) {
    const beforeCompiler = new Map(validationBatch.map((theme) => [theme.theme_id, JSON.stringify(theme)]))
    try {
      compilerAttempt = (await input.llmNamer(validationBatch, now, input.generic)) || undefined
    } catch {
      // LLM failure → keep queue flags for a later cycle (fail-soft)
    }
    // The production namer stamps validation_attempted_at immediately before an actual request. A budget,
    // cooldown, limiter or TPM-envelope skip is capacity state, not an attempt.
    for (const theme of validationBatch) {
      if (beforeCompiler.get(theme.theme_id) !== JSON.stringify(theme)) changedIds.add(theme.theme_id)
    }
  }

  if (input.runDiscovery) {
    for (const t of created) {
      if (t.status === 'live') {
        themes.push(t)
        changedIds.add(t.theme_id)
      }
    }
    const mergedOrRetired = mergeAndRetire(themes, now, cfg.discover)
    for (const id of mergedOrRetired) changedIds.add(id)
    const mergeOverflows = retireLiveOverflowThemes(mergedOrRetired)
    if (mergeOverflows.size) {
      // A merged tombstone retains the pre-cap audit that may have fallen out of its overflowed keeper.
      // Reclaim it now; the next cold start can independently rebuild the same evidence from firehose.
      for (const theme of themes) {
        if (theme.status === 'merged' && theme.merged_into && mergeOverflows.has(theme.merged_into)
          && mergedOrRetired.has(theme.theme_id)) {
          overflowRecovery.push(...theme.members.map(recoverMember).filter(notSocial))
        }
      }
      for (const item of items) {
        if (a.assignments.get(item.event_id)?.some((themeId) => mergeOverflows.has(themeId))) {
          overflowRecovery.push(item)
        }
      }
    }
    // Link only the post-merge live set. Linking first leaves the just-merged tombstone in every related
    // edge until the next discovery pass even though clients have already received its removal event.
    linkThemes(themes, cfg.discover)
  }

  // 3. rescore EVERY live theme (drives decay); a tier flip counts as a material change. Also roll its
  //    daily ring forward to today (zero-pads quiet days; seeds any theme discovered in step 2).
  for (const t of themes) {
    if (t.status !== 'live') continue
    // coherence-lite early heal (non-discovery cycles): a theme whose members have drifted from its
    // identity gets refreshThemeIdentity NOW instead of waiting up to a full discovery cadence — the
    // window in which a polluted theme would otherwise keep absorbing and displaying strangers.
    if (!input.runDiscovery && t.members.length >= cfg.discover.minClusterItems && coherenceOf(t, input.generic) < cfg.coherenceHealBelow) {
      const r = refreshThemeIdentity(t, cfg.discover, now, input.generic)
      if (r.retire) { t.status = 'retired'; t.rev++; changedIds.add(t.theme_id); continue }
      if (r.changed) { changedIds.add(t.theme_id); flagRename(t, r) }
    }
    rollDaily(t, nowMs)
    const before = t.tier
    const s = scoreTheme(t, now, cfg.score)
    t.scores = s.scores
    t.tier = s.tier
    t.fresh_flow = s.fresh_flow
    t.flow_series = s.flow_series
    if (t.tier !== before) changedIds.add(t.theme_id)
  }

  // Defer reclaimed overflow evidence until the next discovery pass. The current pass has already used
  // the doomed theme's incomplete bounded record; rebuilding immediately from that same subset can create
  // churn before the cold-start has restored omitted firehose rows. Persisting it here loses no arrival.
  const recoveredPoolRows = unclaimedRecovery(overflowRecovery)
  pool.push(...recoveredPoolRows)
  const recoveredEventIds = new Set(recoveredPoolRows.map((row) => row.event_id))

  // bound the pool (newest kept); recovery rows win an audit lane before ordinary backlog at the same
  // family-history depth, so the assignment that triggered retirement cannot be silently consumed.
  pool = boundThemeFamilyHistory(pool, cfg.poolCap, {
    priority: (item) => sourcePriority(item.source_tier),
    preferred: (item) => recoveredEventIds.has(item.event_id),
  })

  // Assignment ran before an overflow was known. Never stamp a tombstone onto the same rows that were
  // reclaimed for discovery; keep any independent live-theme assignment on a multi-theme item.
  const invalidOverflowAssignments = new Set(retiredOverflowIds)
  for (const theme of themes) {
    if (theme.status === 'merged' && theme.merged_into && retiredOverflowIds.has(theme.merged_into)) {
      invalidOverflowAssignments.add(theme.theme_id)
    }
  }
  for (const [eventId, themeIds] of a.assignments) {
    const liveIds = themeIds.filter((themeId) => !invalidOverflowAssignments.has(themeId))
    if (liveIds.length) a.assignments.set(eventId, liveIds)
    else a.assignments.delete(eventId)
  }

  const changedThemeIds = [...changedIds]
  const changed = themes.filter((t) => changedIds.has(t.theme_id) && t.status === 'live').map((t) => buildSummary(t, now))
  const removed = themes
    .filter((t) => changedIds.has(t.theme_id) && (t.status === 'retired' || t.status === 'merged'))
    .map((t): ThemeRemoval => ({ theme_id: t.theme_id, reason: t.status as ThemeRemoval['reason'], merged_into: t.merged_into, rev: t.rev }))
  return { themes, pool, changed, removed, changedThemeIds, assignments: a.assignments, ...(compilerAttempt ? { compilerAttempt } : {}) }
}

// ---- I/O wrapper ----

const poolPath = (stateDir: string) => path.join(stateDir, 'themes-unclustered.json')
const counterPath = (stateDir: string) => path.join(stateDir, 'themes-cycle.json')

/** Persisted pools written by older builds may be newest-first. Normalize before ANY tail cap, otherwise
 *  `slice(-cap)` can discard the freshest rows before discoverDeterministic gets a chance to sort them. */
function poolOldestFirst(pool: ThemeItemView[]): ThemeItemView[] {
  return [...pool].sort((a, b) => {
    const aMs = Date.parse(a.found_at); const bMs = Date.parse(b.found_at)
    const safeA = Number.isFinite(aMs) ? aMs : Number.NEGATIVE_INFINITY
    const safeB = Number.isFinite(bMs) ? bMs : Number.NEGATIVE_INFINITY
    return safeA - safeB // stable for equal clocks: later arrival remains later in the pool
  })
}

/** Read + increment the persisted cycle counter (for the "discover every N cycles" cadence). */
export function bumpCycleCounter(stateDir: string): number {
  let n = 0
  try {
    n = Number(JSON.parse(fs.readFileSync(counterPath(stateDir), 'utf8'))?.n) || 0
  } catch {
    n = 0
  }
  n++
  try {
    fs.mkdirSync(stateDir, { recursive: true })
    fs.writeFileSync(counterPath(stateDir), JSON.stringify({ n }) + '\n')
  } catch {
    // a lost counter only nudges the discovery cadence by a cycle
  }
  return n
}

function loadPool(stateDir: string): ThemeItemView[] {
  try {
    const arr = JSON.parse(fs.readFileSync(poolPath(stateDir), 'utf8'))
    return Array.isArray(arr) ? poolOldestFirst(arr) : []
  } catch {
    return []
  }
}
function savePool(stateDir: string, pool: ThemeItemView[], cap: number): void {
  try {
    fs.mkdirSync(stateDir, { recursive: true })
    fs.writeFileSync(poolPath(stateDir), JSON.stringify(poolOldestFirst(pool).slice(-cap)) + '\n')
  } catch {
    // a lost pool only costs a few items' clustering chance
  }
}

function assessmentFingerprint(summary: unknown): string | null {
  if (!summary || typeof summary !== 'object' || Array.isArray(summary)) return null
  const assessment = (summary as { assessment?: unknown }).assessment
  if (!assessment || typeof assessment !== 'object' || Array.isArray(assessment)) return null
  const status = (assessment as { status?: unknown }).status
  if (status !== 'actionable' && status !== 'forming' && status !== 'context') return null
  return JSON.stringify(assessment)
}

export interface RunThemesInput {
  repoRoot: string
  stateDir: string
  items: ThemeItemView[]
  /** Optional exactly-new subset for corpus DF accounting. `items` may include idempotent crash-recovery
   * replays needed by assignment; those must not count as a second document. */
  dfItems?: ThemeItemView[]
  runDiscovery: boolean
  minScore?: number // discovery cold-start: seed the pool from recent firehose items at/above this score
  now?: () => Date
  cfg?: ThemesConfig
  llmNamer?: LlmNamer
  verifyListing?: ThemeListingVerifier
}

/** Full cycle with persistence. Returns the changed theme summaries (for the SSE bus) and the
 *  assignments (so runCycle can stamp theme_ids onto the firehose/inbox items). Never throws. */
export async function runThemesCycle(input: RunThemesInput): Promise<{ changed: ThemeSummary[]; removed: ThemeRemoval[]; assignments: Map<string, string[]>; compilerAttempt?: ThemeCompilerAttempt }> {
  const now = input.now || (() => new Date())
  const cycleNow = now()
  const cfg = input.cfg || DEFAULT_THEMES_CONFIG
  const themes = loadThemes(input.repoRoot)
  const relationshipBoard = buildSupplyChainBoard(input.repoRoot)
  const playerEvidenceFingerprints = input.verifyListing ? new Map(themes
    .filter((theme) => theme.status === 'live' && !!theme.narrative)
    .map((theme) => [theme.theme_id, themePlayerEvidenceFingerprint(theme, input.stateDir, relationshipBoard)])) : undefined
  // The index is the exact projection open clients last received. Keep it only as a comparison baseline;
  // absent/legacy rows with no assessment are ignored so an upgrade does not emit every theme at once.
  const priorIndex = readThemesIndex(input.repoRoot)
  let pool = loadPool(input.stateDir)
  // rolling token-DF: count this cycle's (non-social) items into the ring, then materialize the
  // corpus-generic set every code path suppresses this cycle. An enhancement layer — a failure here
  // must never block the cycle (the static classes in text-match.ts carry the load alone).
  let generic: Set<string> | undefined
  try {
    const dfState = loadTokenDf(input.stateDir)
    updateTokenDf(dfState, (input.dfItems ?? input.items).filter((v) => (v.source_tier || '') !== 'social'), cycleNow.getTime(), cfg.df)
    saveTokenDf(input.stateDir, dfState)
    generic = buildGenericSet(dfState, cfg.df)
  } catch {
    generic = undefined
  }
  // on a discovery cycle, augment the pool with recent MATERIAL firehose items that aren't already a
  // member of a LIVE theme — retired/merged rows are tombstones, so their evidence must remain eligible
  // to rebuild under a distinct identity. Discovery forms from the whole recent backlog (rich cold-start),
  // not just the few items this cycle. Self-heals duplicates via mergeAndRetire.
  if (input.runDiscovery) {
    const memberStories = new Set<string>()
    for (const t of themes) {
      if (t.status !== 'live') continue
      for (const m of t.members) memberStories.add(themeStoryFamilyKey(m))
    }
    for (const it of readRecentThemeItems(input.repoRoot, input.minScore ?? 50, cfg.poolCap)) {
      const story = themeStoryFamilyKey(it)
      if (!memberStories.has(story)) pool.push(it)
    }
    pool = boundThemeFamilyHistory(poolOldestFirst(pool), cfg.poolCap, {
      priority: (item) => sourcePriority(item.source_tier),
    })
  }
  const playerAwareNamer: LlmNamer | undefined = input.llmNamer ? async (batch, at, currentGeneric) => {
    const result = await input.llmNamer!(batch, at, currentGeneric)
    for (const theme of batch) {
      if (theme.status !== 'live' || !theme.narrative || theme.player_contract_version !== 1 || theme.needs_player_revalidation) continue
      const before = JSON.stringify({ players: theme.players, fingerprint: theme.player_evidence_fingerprint })
      theme.players = await rebuildThemePlayers(theme, input.repoRoot, input.stateDir, input.verifyListing, relationshipBoard)
      theme.player_evidence_fingerprint = themePlayerEvidenceFingerprint(theme, input.stateDir, relationshipBoard)
      if (before !== JSON.stringify({ players: theme.players, fingerprint: theme.player_evidence_fingerprint })) theme.rev++
    }
    return result
  } : undefined
  const res = await stepThemes({
    themes, pool, items: input.items, runDiscovery: input.runDiscovery, now: cycleNow, cfg,
    llmNamer: playerAwareNamer, generic, playerEvidenceFingerprints,
  })
  // A theme can cross the 6h qualification boundary while its persisted Theme record and heat tier remain
  // unchanged. Compare the new assessment with the prior index and emit only genuine projection changes.
  // These time-only summaries must NOT become ledger mutations: no Theme field/revision changed.
  const emittedById = new Map(res.changed.map((summary) => [summary.theme_id, summary]))
  const priorById = new Map(priorIndex.themes.map((summary) => [summary.theme_id, summary as unknown]))
  for (const theme of res.themes) {
    if (theme.status !== 'live' || emittedById.has(theme.theme_id)) continue
    const priorFingerprint = assessmentFingerprint(priorById.get(theme.theme_id))
    if (!priorFingerprint) continue
    const current = buildSummary(theme, cycleNow)
    const currentFingerprint = assessmentFingerprint(current)
    if (currentFingerprint !== priorFingerprint) emittedById.set(theme.theme_id, current)
  }
  // persist: append only structurally changed themes to the ledger; rewrite the full live index
  const changedIds = new Set(res.changedThemeIds)
  const changedThemes = res.themes.filter((t) => changedIds.has(t.theme_id))
  const fixedNow = () => cycleNow
  const ledgerAdvanced = appendThemeMutations(input.repoRoot, changedThemes, fixedNow, res.compilerAttempt)
  if (!ledgerAdvanced) {
    // The ledger is the source of truth. Publishing the in-memory index, consuming the pool, emitting SSE
    // freshness, or stamping assignments after a failed append creates a state clients can see but the next
    // process cannot reconstruct. Leave every downstream artifact untouched so the next cycle retries from
    // the same durable inputs.
    return { changed: [], removed: [], assignments: new Map(), ...(res.compilerAttempt ? { compilerAttempt: res.compilerAttempt } : {}) }
  }
  maybeCompactThemesLedger(input.repoRoot, fixedNow) // keep the append-only ledger from ballooning (→ git-push 408s)
  savePool(input.stateDir, res.pool, cfg.poolCap)
  writeThemesIndex(input.repoRoot, res.themes, fixedNow, res.compilerAttempt)
  return { changed: [...emittedById.values()], removed: res.removed, assignments: res.assignments, ...(res.compilerAttempt ? { compilerAttempt: res.compilerAttempt } : {}) }
}
