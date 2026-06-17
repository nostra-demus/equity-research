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
import { discoverDeterministic, linkThemes, mergeAndRetire, DEFAULT_DISCOVER_CONFIG, type DiscoverConfig } from './discover'
import { scoreTheme, ensureDaily, rollDaily, DEFAULT_THEME_SCORE_CONFIG, type ThemeScoreConfig } from './score'
import { appendThemeMutations, buildSummary, loadThemes, readRecentThemeItems, writeThemesIndex } from './store'
import type { Theme, ThemeItemView, ThemeSummary } from './types'

export interface ThemesConfig {
  score: ThemeScoreConfig
  assign: AssignConfig
  discover: DiscoverConfig
  poolCap: number // max unclustered items kept between discovery passes
}
export const DEFAULT_THEMES_CONFIG: ThemesConfig = {
  score: DEFAULT_THEME_SCORE_CONFIG,
  assign: DEFAULT_ASSIGN_CONFIG,
  discover: DEFAULT_DISCOVER_CONFIG,
  poolCap: 1000,
}

/** Build a ThemesConfig from the NEWS config block's themes* knobs (env-tunable). */
export function themesConfigFromNews(news: { themesRetireHours?: number; themesMaxMembers?: number }): ThemesConfig {
  const maxMembers = news.themesMaxMembers || DEFAULT_THEMES_CONFIG.assign.maxMembers
  return {
    score: DEFAULT_THEMES_CONFIG.score,
    assign: { ...DEFAULT_THEMES_CONFIG.assign, maxMembers },
    discover: { ...DEFAULT_THEMES_CONFIG.discover, maxMembers, retireHours: news.themesRetireHours || DEFAULT_THEMES_CONFIG.discover.retireHours },
    poolCap: DEFAULT_THEMES_CONFIG.poolCap,
  }
}

// An optional LLM pass that renames/validates freshly-created themes in place (sets name/slug/
// description/keywords; may set status:'retired' to reject a non-theme). Async; absent = deterministic.
export type LlmNamer = (created: Theme[], now: Date) => Promise<void>

export interface StepInput {
  themes: Theme[]
  pool: ThemeItemView[]
  items: ThemeItemView[] // this cycle's material items
  runDiscovery: boolean
  now: Date
  cfg?: ThemesConfig
  llmNamer?: LlmNamer
}

export interface StepResult {
  themes: Theme[]
  pool: ThemeItemView[]
  changed: ThemeSummary[] // themes that materially changed (for persist + SSE)
  assignments: Map<string, string[]> // event_id → theme_ids (for stamping theme_ids on items)
}

/** Pure(ish) in-memory step. The only side effect is mutating the passed theme objects. */
export async function stepThemes(input: StepInput): Promise<StepResult> {
  const cfg = input.cfg || DEFAULT_THEMES_CONFIG
  const { now } = input
  const nowMs = now.getTime()
  const themes = input.themes
  const changedIds = new Set<string>()

  // 0. seed each existing live theme's daily ring from its CURRENT (pre-assignment) member ring, so the
  //    per-member bumps below don't double-count this cycle's items. New ledgers / fresh themes only.
  for (const t of themes) if (t.status === 'live') ensureDaily(t, nowMs)

  // 1. assignment (every cycle) — also bumps each touched theme's daily ring per new member landed
  const a = assignThemes(input.items, themes, cfg.assign, now)
  for (const id of a.touched) changedIds.add(id)
  let pool = [...input.pool, ...a.unclustered]

  // 2. discovery (periodic)
  if (input.runDiscovery && pool.length) {
    const { created, leftover } = discoverDeterministic(pool, themes, now, cfg.discover)
    pool = leftover
    if (created.length && input.llmNamer) {
      try {
        await input.llmNamer(created, now)
      } catch {
        // LLM failure → keep the deterministic names (fail-soft)
      }
    }
    for (const t of created) {
      if (t.status === 'live') {
        themes.push(t)
        changedIds.add(t.theme_id)
      }
    }
    linkThemes(themes, cfg.discover)
    for (const id of mergeAndRetire(themes, now, cfg.discover)) changedIds.add(id)
  }

  // 3. rescore EVERY live theme (drives decay); a tier flip counts as a material change. Also roll its
  //    daily ring forward to today (zero-pads quiet days; seeds any theme discovered in step 2).
  for (const t of themes) {
    if (t.status !== 'live') continue
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

  const changed = themes.filter((t) => changedIds.has(t.theme_id)).map(buildSummary)
  return { themes, pool, changed, assignments: a.assignments }
}

// ---- I/O wrapper ----

const poolPath = (stateDir: string) => path.join(stateDir, 'themes-unclustered.json')
const counterPath = (stateDir: string) => path.join(stateDir, 'themes-cycle.json')

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
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}
function savePool(stateDir: string, pool: ThemeItemView[], cap: number): void {
  try {
    fs.mkdirSync(stateDir, { recursive: true })
    fs.writeFileSync(poolPath(stateDir), JSON.stringify(pool.slice(-cap)) + '\n')
  } catch {
    // a lost pool only costs a few items' clustering chance
  }
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
export async function runThemesCycle(input: RunThemesInput): Promise<{ changed: ThemeSummary[]; assignments: Map<string, string[]> }> {
  const now = input.now || (() => new Date())
  const cfg = input.cfg || DEFAULT_THEMES_CONFIG
  const themes = loadThemes(input.repoRoot)
  let pool = loadPool(input.stateDir)
  // on a discovery cycle, augment the pool with recent MATERIAL firehose items that aren't already a
  // member of any theme — so discovery forms from the whole recent backlog (rich cold-start), not just
  // the few items this cycle. Self-heals duplicates via mergeAndRetire.
  if (input.runDiscovery) {
    const memberIds = new Set<string>()
    for (const t of themes) for (const m of t.members) memberIds.add(m.event_id)
    const haveInPool = new Set(pool.map((p) => p.event_id))
    for (const it of readRecentThemeItems(input.repoRoot, input.minScore ?? 50)) {
      if (!memberIds.has(it.event_id) && !haveInPool.has(it.event_id)) {
        pool.push(it)
        haveInPool.add(it.event_id)
      }
    }
    if (pool.length > cfg.poolCap) pool = pool.slice(pool.length - cfg.poolCap)
  }
  const res = await stepThemes({ themes, pool, items: input.items, runDiscovery: input.runDiscovery, now: now(), cfg, llmNamer: input.llmNamer })
  // persist: append only the changed themes to the ledger; rewrite the full live index
  const changedThemes = res.themes.filter((t) => res.changed.some((c) => c.theme_id === t.theme_id))
  appendThemeMutations(input.repoRoot, changedThemes, now)
  savePool(input.stateDir, res.pool, cfg.poolCap)
  writeThemesIndex(input.repoRoot, res.themes, now)
  return { changed: res.changed, assignments: res.assignments }
}
