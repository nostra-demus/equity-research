// Read-time themes projection for the HTTP API. The persisted board index is a cycle snapshot; evidence
// gates are time-dependent, so serving that file forever after the scanner stops can leave an actionable
// label alive long after its six-hour proof window expired. This reader keeps the parsed ledger until it
// changes, but reprojects global/geo/commodity views on a short TTL against the current clock.

import fs from 'node:fs'
import path from 'node:path'
import { buildCommodityThemesIndex } from './commodity-index'
import { buildGeoThemesIndex, hasThemeGeo, type ThemeGeo } from './geo-index'
import { buildThemesIndex, loadThemes } from './store'
import type { Theme, ThemesIndex } from './types'

export interface ThemesApiCommoditySlice {
  scoped: boolean
  subject?: string
}

export interface ThemesIndexReaderOptions {
  now?: () => Date
  ttlMs?: number
  load?: (repoRoot: string) => Theme[] // injected only for focused cache tests
}

interface LedgerSnapshot {
  ledgerMtimeMs: number
  boardMtimeMs: number
  generatedAt: string
  themes: Theme[]
}

interface ProjectionCache {
  builtAtMs: number
  expiresAtMs: number
  indexes: Map<string, ThemesIndex>
}

const ledgerPath = (repoRoot: string) => path.join(repoRoot, 'screener', 'ledger', 'themes.ndjson')
const boardIndexPath = (repoRoot: string) => path.join(repoRoot, 'screener', 'board', 'themes_index.json')

function lastSuccessfulStage(repoRoot: string): { mtimeMs: number; generatedAt: string } {
  const fp = boardIndexPath(repoRoot)
  let mtimeMs = 0
  try { mtimeMs = fs.statSync(fp).mtimeMs } catch { return { mtimeMs, generatedAt: '' } }
  try {
    const value = JSON.parse(fs.readFileSync(fp, 'utf8')) as { generated_at?: unknown }
    const generatedAt = typeof value.generated_at === 'string' && Number.isFinite(Date.parse(value.generated_at))
      ? value.generated_at
      : ''
    return { mtimeMs, generatedAt }
  } catch {
    return { mtimeMs, generatedAt: '' }
  }
}

/** Build a process-local reader. Ledger mutations invalidate immediately; an unchanged ledger is still
 *  reprojected at least once per TTL so time-only qualification decay cannot remain stale indefinitely. */
export function createThemesIndexReader(
  repoRoot: string,
  opts: ThemesIndexReaderOptions = {},
): (geo?: ThemeGeo, commodity?: ThemesApiCommoditySlice) => ThemesIndex {
  const now = opts.now || (() => new Date())
  const ttlMs = Math.max(0, opts.ttlMs ?? 60_000)
  const load = opts.load || loadThemes
  let snapshot: LedgerSnapshot | null = null
  let projections: ProjectionCache | null = null

  return (geo: ThemeGeo = {}, commodity: ThemesApiCommoditySlice = { scoped: false }): ThemesIndex => {
    const nowD = now()
    const nowMs = nowD.getTime()
    let ledgerMtimeMs = 0
    try { ledgerMtimeMs = fs.statSync(ledgerPath(repoRoot)).mtimeMs } catch { /* no ledger yet */ }
    const stage = lastSuccessfulStage(repoRoot)

    // Parsing a large ledger is the expensive part. Keep that snapshot until its mtime changes; the
    // cheaper summaries below have an independent TTL because their evidence gates depend on the clock.
    if (!snapshot || snapshot.ledgerMtimeMs !== ledgerMtimeMs || snapshot.boardMtimeMs !== stage.mtimeMs) {
      snapshot = { ledgerMtimeMs, boardMtimeMs: stage.mtimeMs, generatedAt: stage.generatedAt, themes: load(repoRoot) }
      projections = null
    }
    const projectionsExpired = !projections
      || nowMs >= projections.expiresAtMs
      || nowMs < projections.builtAtMs // injected/system clock moved backwards: rebuild rather than pin
    if (projectionsExpired) {
      projections = {
        builtAtMs: nowMs,
        expiresAtMs: nowMs + ttlMs,
        indexes: new Map(),
      }
    }
    const ledger = snapshot!
    const cache = projections!

    const hasGeo = hasThemeGeo(geo)
    const key = `${hasGeo ? geo.country || '' : ''}|${hasGeo ? geo.geoRegion || '' : ''}|${commodity.scoped ? 'c' : ''}|${commodity.subject || ''}`
    const hit = cache.indexes.get(key)
    if (hit) return hit

    const fixedNow = () => nowD
    const index = commodity.scoped
      ? buildCommodityThemesIndex(ledger.themes, { commodity: commodity.subject, geo: hasGeo ? geo : null }, fixedNow)
      : hasGeo
        ? buildGeoThemesIndex(ledger.themes, geo, fixedNow)
        : buildThemesIndex(ledger.themes, fixedNow)
    // Qualification is intentionally reprojected on the wall clock, but liveness is not. A request at
    // 17:00 must not turn a last-successful 10:00 pipeline stage into “index 17:00”.
    index.projected_at = index.generated_at
    index.generated_at = ledger.generatedAt
    cache.indexes.set(key, index)
    return index
  }
}
