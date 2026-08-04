// API theme projections must age on wall-clock time even when the scanner/ledger stops changing. The
// expensive ledger parse remains mtime-cached; only the global/geo/commodity summaries expire on TTL.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { createThemesIndexReader } from '../src/news/themes/api-index'
import { createTheme } from '../src/news/themes/discover'
import { appendThemeMutations, loadThemes } from '../src/news/themes/store'
import type { ThemeItemView } from '../src/news/themes/types'

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'themes-api-index-'))
const initialNow = new Date('2026-08-04T06:00:00Z')
const at = (hoursAgo: number) => new Date(initialNow.getTime() - hoursAgo * 3_600_000).toISOString()
const company = { name: 'Nvidia', ticker: 'NVDA', listing_country: 'US' }
const row = (event_id: string, headline: string, hoursAgo: number): ThemeItemView => ({
  event_id,
  dedup_group: `story-${event_id}`,
  headline,
  found_at: at(hoursAgo),
  companies: [company],
  event_types: ['capex'],
  issuer_linkage: 'primary',
  triage_score: 82,
  source_tier: 'news',
  country: 'US',
  region: 'US',
  commodities: ['GOLD'],
})

const theme = createTheme([
  row('api-1', 'Nvidia expands AI data center chip capacity', 1),
  row('api-2', 'Nvidia lifts AI data center chip capacity', 2),
  row('api-3', 'Nvidia accelerates AI data center chip capacity', 3),
], initialNow, 'claude')
theme.name = 'AI Data-Center Chip Capacity'
theme.description = 'Nvidia is expanding chip capacity for AI data centers.'
appendThemeMutations(root, [theme], () => initialNow)

let clock = initialNow
let loads = 0
const read = createThemesIndexReader(root, {
  now: () => clock,
  ttlMs: 60_000,
  load: (repoRoot) => { loads++; return loadThemes(repoRoot) },
})

const globalNow = read()
const geoNow = read({ country: 'US' })
const commodityNow = read({}, { scoped: true, subject: 'GOLD' })
assert.equal(globalNow.themes[0]?.assessment.status, 'actionable')
assert.equal(geoNow.themes[0]?.assessment.status, 'actionable')
assert.equal(commodityNow.themes[0]?.assessment.status, 'actionable')
assert.equal(loads, 1, 'all projections share one parsed ledger snapshot')

// No scanner write and therefore no mtime change. Crossing the projection TTL must still age every view.
clock = new Date(initialNow.getTime() + 8 * 3_600_000)
assert.equal(read().themes[0]?.assessment.status, 'context')
assert.equal(read({ country: 'US' }).themes[0]?.assessment.status, 'context')
assert.equal(read({}, { scoped: true, subject: 'GOLD' }).themes[0]?.assessment.status, 'context')
assert.equal(loads, 1, 'TTL expiry reprojects from memory instead of reparsing an unchanged 32MB ledger')

fs.rmSync(root, { recursive: true, force: true })
console.log('themes API projection cache: time gates age without reparsing an unchanged ledger')
