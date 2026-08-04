// Cold-start theme backfill must use the source/discovery clock, never the later triage audit clock.
// Legacy firehose rows lack source time and therefore fail closed instead of looking newly published.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { readRecentThemeItems } from '../src/news/themes/store'

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'themes-source-time-'))
const now = new Date()
const day = now.toISOString().slice(0, 10)
const inbox = path.join(root, 'screener', 'inbox')
fs.mkdirSync(inbox, { recursive: true })

const base = {
  kind: 'item',
  ts: now.toISOString(),
  headline: 'Grid operator expands AI data-center power capacity',
  url: 'https://example.test/grid-capacity',
  domain: 'example.test',
  source_name: 'Example News',
  via: 'rss',
  region: 'US',
  input_nature: 'news_headline',
  triage_score: 82,
  band: 'pick',
  triage_reason: 'Material capacity expansion.',
  relevance: 'material',
  event_types: ['capex'],
  issuer_linkage: 'primary',
  companies: [{ name: 'GridCo', ticker: 'GRID', listing_country: 'US' }],
  size_bucket: 'large',
  dedup_status: 'new',
  inboxed: true,
}
const sourceTime = new Date(now.getTime() - 60_000).toISOString()
const olderTime = new Date(now.getTime() - 180_000).toISOString()
const middleTime = new Date(now.getTime() - 120_000).toISOString()
const rows = [
  { ...base, event_id: 'EVT-111111111111', dedup_group: 'EVT-111111111111' },
  {
    ...base, event_id: 'EVT-222222222222', dedup_group: 'persisted-two', found_at: sourceTime,
    headline_en: 'English grid capacity headline', country: 'IN', region: 'ASIA', commodities: ['GOLD'],
    url: 'https://example.test/grid-capacity-2',
  },
  {
    ...base, event_id: 'EVT-333333333333', dedup_group: 'persisted-three', found_at: olderTime,
    headline: 'Identical syndicated capacity headline', url: 'https://example.test/grid-capacity-3',
  },
  {
    ...base, event_id: 'EVT-444444444444', dedup_group: 'persisted-four', found_at: middleTime,
    headline: 'Identical syndicated capacity headline', url: 'https://example.test/grid-capacity-4',
  },
]
fs.writeFileSync(path.join(inbox, `${day}_firehose.ndjson`), rows.map((row) => JSON.stringify(row)).join('\n') + '\n')

const items = readRecentThemeItems(root, 50)
assert.deepEqual(items.map((item) => item.event_id), ['EVT-333333333333', 'EVT-444444444444', 'EVT-222222222222'], 'backfill is oldest→newest')
assert.deepEqual(items.map((item) => item.dedup_group), ['persisted-three', 'persisted-four', 'persisted-two'], 'persisted canonical groups survive backfill; identical headlines are not re-clustered')
const enriched = items[2]
assert.equal(enriched.found_at, sourceTime)
assert.equal(enriched.headline_en, 'English grid capacity headline')
assert.equal(enriched.country, 'IN')
assert.equal(enriched.region, 'ASIA')
assert.deepEqual(enriched.commodities, ['GOLD'])

fs.rmSync(root, { recursive: true, force: true })
console.log('themes source-time backfill: legacy triage clocks fail closed')
