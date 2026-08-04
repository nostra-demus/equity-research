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
import { assignThemes, DEFAULT_ASSIGN_CONFIG, type AssignConfig } from './assign'
import { coherenceOf, discoverDeterministic, linkThemes, mergeAndRetire, refreshThemeIdentity, DEFAULT_DISCOVER_CONFIG, type DiscoverConfig } from './discover'
import { scoreTheme, ensureDaily, rollDaily, DEFAULT_THEME_SCORE_CONFIG, type ThemeScoreConfig } from './score'
import { appendThemeMutations, buildSummary, loadThemes, maybeCompactThemesLedger, readRecentThemeItems, readThemesIndex, writeThemesIndex } from './store'
import { buildGenericSet, loadTokenDf, saveTokenDf, updateTokenDf, DEFAULT_TOKEN_DF_CONFIG, type TokenDfConfig } from './token-df'
import type { Theme, ThemeItemView, ThemeRemoval, ThemeSummary } from './types'
import { themeStoryKey } from './story-key'

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
export type LlmNamer = (created: Theme[], now: Date, generic?: Set<string>) => Promise<void>

export interface StepInput {
  themes: Theme[]
  pool: ThemeItemView[]
  items: ThemeItemView[] // this cycle's material items
  runDiscovery: boolean
  now: Date
  cfg?: ThemesConfig
  llmNamer?: LlmNamer
  generic?: Set<string> // corpus-generic tokens this cycle (token-df.ts) — suppressed by themeTokens everywhere
}

export interface StepResult {
  themes: Theme[]
  pool: ThemeItemView[]
  changed: ThemeSummary[] // live themes that materially changed (for SSE)
  removed: ThemeRemoval[] // explicit invalidations for live clients
  changedThemeIds: string[] // every structural mutation, including merged/retired rows (for persistence)
  assignments: Map<string, string[]> // event_id → theme_ids (for stamping theme_ids on items)
}

/** Pure(ish) in-memory step. The only side effect is mutating the passed theme objects. */
export async function stepThemes(input: StepInput): Promise<StepResult> {
  const cfg = input.cfg || DEFAULT_THEMES_CONFIG
  const { now } = input
  const nowMs = now.getTime()
  const themes = input.themes
  const changedIds = new Set<string>()

  // Version migration is automatic and bounded. Old lexical clusters remain internal and cannot absorb
  // stories; each discovery pass enrolls at most four newest-first for the existing validator lane, with no hand edits
  // to historical rows and no separate model call.
  if (input.runDiscovery) {
    const legacyDebt = themes
      .filter((theme) => theme.status === 'live' && !theme.narrative && !theme.needs_validation && !theme.needs_rename)
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
  const notSocial = (v: ThemeItemView) => (v.source_tier || '') !== 'social'
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
    .filter((t) => t.status === 'live' && t.narrative && t.needs_narrative_update)
    .sort(byDebt)
  const pendingValidations = input.runDiscovery ? themes
    .filter((t) => t.status === 'live' && t.generation === 'deterministic' && t.needs_validation)
    .sort(byDebt) : []
  const renames = input.runDiscovery ? themes
    .filter((t) => t.status === 'live' && t.needs_rename && !t.needs_narrative_update)
    .sort(byDebt)
    .slice(0, cfg.renamePerPass) : []

  // Four is the compiler's hard batch. Reserve two slots for update debt on discovery cycles, then give
  // one lane each to validation and rename when present; unused lanes flow back to updates. On ordinary
  // cycles all four slots drain updates. A flood of renames/new clusters therefore cannot starve evidence.
  const validationBatch: Theme[] = []
  const add = (theme: Theme | undefined) => {
    if (theme && !validationBatch.includes(theme) && validationBatch.length < 4) validationBatch.push(theme)
  }
  for (const theme of updates.slice(0, input.runDiscovery ? 2 : 4)) add(theme)
  if (input.runDiscovery) {
    add(pendingValidations[0] || created[0])
    add(renames[0])
  }
  for (const theme of updates) add(theme)
  for (const theme of pendingValidations) add(theme)
  for (const theme of created) add(theme)
  for (const theme of renames) add(theme)

  if (input.llmNamer && validationBatch.length) {
    const attemptedAt = now.toISOString().replace(/\.\d{3}Z$/, 'Z')
    for (const theme of validationBatch) {
      theme.validation_attempted_at = attemptedAt
      if (!theme.validation_queued_at) theme.validation_queued_at = attemptedAt
      theme.rev++
      changedIds.add(theme.theme_id)
    }
    try {
      await input.llmNamer(validationBatch, now, input.generic)
    } catch {
      // LLM failure → keep queue flags for a later cycle (fail-soft)
    }
    for (const theme of validationBatch) changedIds.add(theme.theme_id)
  }

  if (input.runDiscovery) {
    for (const t of created) {
      if (t.status === 'live') {
        themes.push(t)
        changedIds.add(t.theme_id)
      }
    }
    for (const id of mergeAndRetire(themes, now, cfg.discover)) changedIds.add(id)
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

  // bound the pool (newest kept)
  if (pool.length > cfg.poolCap) pool = pool.slice(pool.length - cfg.poolCap)

  const changedThemeIds = [...changedIds]
  const changed = themes.filter((t) => changedIds.has(t.theme_id) && t.status === 'live').map((t) => buildSummary(t, now))
  const removed = themes
    .filter((t) => changedIds.has(t.theme_id) && (t.status === 'retired' || t.status === 'merged'))
    .map((t): ThemeRemoval => ({ theme_id: t.theme_id, reason: t.status as ThemeRemoval['reason'], merged_into: t.merged_into, rev: t.rev }))
  return { themes, pool, changed, removed, changedThemeIds, assignments: a.assignments }
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
  runDiscovery: boolean
  minScore?: number // discovery cold-start: seed the pool from recent firehose items at/above this score
  now?: () => Date
  cfg?: ThemesConfig
  llmNamer?: LlmNamer
}

/** Full cycle with persistence. Returns the changed theme summaries (for the SSE bus) and the
 *  assignments (so runCycle can stamp theme_ids onto the firehose/inbox items). Never throws. */
export async function runThemesCycle(input: RunThemesInput): Promise<{ changed: ThemeSummary[]; removed: ThemeRemoval[]; assignments: Map<string, string[]> }> {
  const now = input.now || (() => new Date())
  const cycleNow = now()
  const cfg = input.cfg || DEFAULT_THEMES_CONFIG
  const themes = loadThemes(input.repoRoot)
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
    updateTokenDf(dfState, input.items.filter((v) => (v.source_tier || '') !== 'social'), cycleNow.getTime(), cfg.df)
    saveTokenDf(input.stateDir, dfState)
    generic = buildGenericSet(dfState, cfg.df)
  } catch {
    generic = undefined
  }
  // on a discovery cycle, augment the pool with recent MATERIAL firehose items that aren't already a
  // member of any theme — so discovery forms from the whole recent backlog (rich cold-start), not just
  // the few items this cycle. Self-heals duplicates via mergeAndRetire.
  if (input.runDiscovery) {
    const memberStories = new Set<string>()
    for (const t of themes) for (const m of t.members) memberStories.add(themeStoryKey(m))
    const haveInPool = new Set(pool.map(themeStoryKey))
    for (const it of readRecentThemeItems(input.repoRoot, input.minScore ?? 50)) {
      const story = themeStoryKey(it)
      if (!memberStories.has(story) && !haveInPool.has(story)) {
        pool.push(it)
        haveInPool.add(story)
      }
    }
    pool = poolOldestFirst(pool)
    if (pool.length > cfg.poolCap) pool = pool.slice(pool.length - cfg.poolCap)
  }
  const res = await stepThemes({ themes, pool, items: input.items, runDiscovery: input.runDiscovery, now: cycleNow, cfg, llmNamer: input.llmNamer, generic })
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
  const ledgerAdvanced = appendThemeMutations(input.repoRoot, changedThemes, fixedNow)
  if (!ledgerAdvanced) {
    // The ledger is the source of truth. Publishing the in-memory index, consuming the pool, emitting SSE
    // freshness, or stamping assignments after a failed append creates a state clients can see but the next
    // process cannot reconstruct. Leave every downstream artifact untouched so the next cycle retries from
    // the same durable inputs.
    return { changed: [], removed: [], assignments: new Map() }
  }
  maybeCompactThemesLedger(input.repoRoot, fixedNow) // keep the append-only ledger from ballooning (→ git-push 408s)
  savePool(input.stateDir, res.pool, cfg.poolCap)
  writeThemesIndex(input.repoRoot, res.themes, fixedNow)
  return { changed: [...emittedById.values()], removed: res.removed, assignments: res.assignments }
}
