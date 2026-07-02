// Rolling token document-frequency — the SELF-LEARNING boilerplate detector for the themes layer.
// The static noise classes in text-match.ts (calendar words, event vocabulary, routine-filing shapes)
// close the channels we have SEEN fail; this layer closes the ones we haven't: whatever vocabulary the
// wire floods with next (a new exchange's notice phrasing, results season, a novel filing type) becomes
// "generic" automatically and stops counting toward theme matches — no hand-list edit, no deploy.
//
// Mechanism: a ring of the last N UTC days, each holding {docs, token→doc-frequency} over that day's
// material items (headline tokens only — company-guess tokens are deliberately NOT counted, and
// themeTokens exempts company-derived tokens from suppression anyway). A token is GENERIC iff its daily
// df/docs exceeded `dailyRatio` on ≥ `persistDays` of the ring's qualifying days (docs ≥ minDailyDocs).
// Persistence across days is the burst-vs-boilerplate discriminator: SAST/results boilerplate is
// frequent EVERY day of its season, while a genuine market-wide shock ("hormuz", a tariff target) is a
// burst and stays an anchor exactly while its narrative forms. Cold start (fresh state dir, < persistDays
// of history) yields an EMPTY generic set — the system degrades to the static classes, never worse.
//
// Pure core + thin file I/O, mirroring the pool/counter discipline in engine.ts. Never throws to the
// caller; a lost DF state only costs a few days of learned suppression.

import fs from 'node:fs'
import path from 'node:path'
import { topicTokens } from '../text-match'
import type { ThemeItemView } from './types'

export interface TokenDfConfig {
  windowDays: number // ring length (days of history kept)
  dailyRatio: number // daily df/docs above which a token counts toward genericness
  persistDays: number // days over the ratio (of the ring) required to become generic — the burst-vs-boilerplate dial
  minDailyDocs: number // a day with fewer docs neither counts toward nor against (too small to read)
  protected: string[] // escape hatch: tokens never marked generic (empty by default; for a sustained genuine story)
}
export const DEFAULT_TOKEN_DF_CONFIG: TokenDfConfig = {
  windowDays: 7,
  dailyRatio: 0.015,
  persistDays: 3,
  minDailyDocs: 150,
  protected: [],
}

interface DfDay {
  day: string // UTC date, YYYY-MM-DD
  docs: number // items counted this day
  df: Record<string, number> // token → number of docs containing it (once per doc)
}
export interface TokenDfState {
  v: 1
  days: DfDay[] // ring, newest LAST, length ≤ windowDays
}

const utcDay = (ms: number) => new Date(ms).toISOString().slice(0, 10)

/** Drop a closed day's long tail (Zipf: mostly singletons) so the persisted file stays small. A token
 *  that can never clear minDailyDocs × dailyRatio can never contribute to genericness anyway. */
function pruneDay(d: DfDay): void {
  const floor = Math.max(3, Math.ceil(d.docs * 0.0025))
  for (const [tok, n] of Object.entries(d.df)) if (n < floor) delete d.df[tok]
}

/** Count this cycle's items into the ring (each item passes through exactly once per cycle — runCycle
 *  only hands post-dedup NEW items). Rotates the ring to `nowMs`'s UTC day, pruning days as they close.
 *  Headline tokens only; the same topicTokens the theme layer starts from, so ratios speak its language. */
export function updateTokenDf(state: TokenDfState, items: ThemeItemView[], nowMs: number, cfg: TokenDfConfig = DEFAULT_TOKEN_DF_CONFIG): void {
  const today = utcDay(nowMs)
  let cur = state.days[state.days.length - 1]
  if (!cur || cur.day < today) {
    if (cur) pruneDay(cur) // the previous day just closed — shed its singleton tail
    cur = { day: today, docs: 0, df: {} }
    state.days.push(cur)
    if (state.days.length > cfg.windowDays) state.days.splice(0, state.days.length - cfg.windowDays)
  }
  // cur.day > today would mean a backwards clock — keep counting into the newest bucket (bounded skew)
  for (const it of items) {
    cur.docs++
    for (const tok of topicTokens(it.headline, [])) cur.df[tok] = (cur.df[tok] || 0) + 1
  }
}

/** The corpus-generic set: tokens over `dailyRatio` on ≥ `persistDays` qualifying days of the ring. */
export function buildGenericSet(state: TokenDfState, cfg: TokenDfConfig = DEFAULT_TOKEN_DF_CONFIG): Set<string> {
  const over = new Map<string, number>()
  for (const d of state.days) {
    if (d.docs < cfg.minDailyDocs) continue // too small a day to read a ratio from
    const bar = d.docs * cfg.dailyRatio
    for (const [tok, n] of Object.entries(d.df)) if (n > bar) over.set(tok, (over.get(tok) || 0) + 1)
  }
  const generic = new Set<string>()
  const shielded = new Set(cfg.protected)
  for (const [tok, days] of over) if (days >= cfg.persistDays && !shielded.has(tok)) generic.add(tok)
  return generic
}

// ---- thin file I/O (same posture as engine.ts pool/counter helpers) ----

const dfPath = (stateDir: string) => path.join(stateDir, 'themes-token-df.json')

export function loadTokenDf(stateDir: string): TokenDfState {
  try {
    const s = JSON.parse(fs.readFileSync(dfPath(stateDir), 'utf8'))
    if (s?.v === 1 && Array.isArray(s.days)) return s as TokenDfState
  } catch {}
  return { v: 1, days: [] }
}

export function saveTokenDf(stateDir: string, state: TokenDfState): void {
  try {
    fs.mkdirSync(stateDir, { recursive: true })
    fs.writeFileSync(dfPath(stateDir), JSON.stringify(state) + '\n')
  } catch {
    // a lost DF state only costs a few days of learned suppression
  }
}
