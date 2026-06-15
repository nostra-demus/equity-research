// THE STORY health check — the standing guard that the "useful article read" never silently regresses.
//
// The reader's on-demand enrichment (ui/server/src/news/enrich.ts) reads an article body with a free LLM and
// leads with its substance (gist / who-gains / who-exposed). When that read momentarily misses it degrades to
// a thin fallback. The cache-quality + auto-heal changes mean a degraded read should NOT persist — it gets a
// short TTL and the background heal pass re-reads it. This script measures whether that's actually true:
// it classifies every cached read and reports the DEGRADED rate among stories still on the live wire.
//
// It is both the census and the regression guard:
//   npx tsx scripts/news-enrich-health.ts            report (always exit 0)
//   npx tsx scripts/news-enrich-health.ts --strict   exit 1 if the degraded rate exceeds the threshold
//   npx tsx scripts/news-enrich-health.ts --heal      force the LIVE engine to re-read every degraded story
//   npx tsx scripts/news-enrich-health.ts --json out.json   dump the structured result
//
// --strict is meant for CI / the watchdog. --heal hits the running engine (it has the LLM keys) and is the
// manual "fix it now" lever; the engine also heals on its own every cycle.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { REPO_ROOT, STATE_DIR } from '../ui/server/src/config'
import { readFeed } from '../ui/server/src/news/feed'
import { isEnrichmentComplete, type EventEnrichment } from '../ui/server/src/news/enrich'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const args = process.argv.slice(2)
const STRICT = args.includes('--strict')
const HEAL = args.includes('--heal')
const jsonOut = args.includes('--json') ? args[args.indexOf('--json') + 1] : ''
// Allowed degraded rate among on-wire stories before --strict fails. A single transient miss between heal
// cycles is normal; a systemic break (no keys, a broken provider chain, a bad fallback) pushes this high.
const THRESHOLD = Number(process.env.NEWS_ENRICH_HEALTH_MAX_DEGRADED_FRAC) || 0.2
const ENGINE = process.env.ENGINE_URL || 'http://127.0.0.1:8787'

function loadCache(): Record<string, EventEnrichment> {
  for (const file of ['news-enrich-cache.json', 'news-enrich-cache.bak.json']) {
    try {
      const o = JSON.parse(fs.readFileSync(path.join(STATE_DIR, file), 'utf8'))
      if (o && typeof o === 'object') return o as Record<string, EventEnrichment>
    } catch {}
  }
  return {}
}

type Klass = 'rich' | 'sec' | 'filing_floor' | 'degraded'
function classify(e: EventEnrichment): Klass {
  if (e.gist?.length || e.companies?.length || e.beneficiaries?.length || e.exposed?.length) return 'rich'
  if (e.sec) return 'sec'
  // a filing whose floor is the intended final read (complete) is not a degradation
  if (e.complete) return 'filing_floor'
  return 'degraded'
}

async function healViaEngine(ids: string[]): Promise<{ id: string; healed: boolean; note?: string }[]> {
  const out: { id: string; healed: boolean; note?: string }[] = []
  for (const id of ids) {
    try {
      const res = await fetch(`${ENGINE}/api/news/enrich?event_id=${encodeURIComponent(id)}&force=1`, { signal: AbortSignal.timeout(40_000) })
      const e = (await res.json()) as EventEnrichment
      out.push({ id, healed: isEnrichmentComplete(e) })
    } catch (err: any) {
      out.push({ id, healed: false, note: err?.name === 'TimeoutError' ? 'engine timed out' : `engine unreachable (${ENGINE})` })
    }
  }
  return out
}

async function main() {
  const cache = loadCache()
  const ids = Object.keys(cache)
  if (!ids.length) {
    console.log('news-enrich-health: enrich cache is empty (open an event to populate it).')
    if (jsonOut) fs.writeFileSync(jsonOut, JSON.stringify({ empty: true }, null, 2))
    return
  }

  // which cached events are still on the live wire (the heal/retry layer can only touch these)
  let onWire = new Set<string>()
  try {
    const feed = readFeed(REPO_ROOT, 2, { maxItems: 2000 })
    onWire = new Set((feed.items as any[]).map((it) => it.event_id))
  } catch {}

  const counts: Record<Klass, number> = { rich: 0, sec: 0, filing_floor: 0, degraded: 0 }
  const degradedOnWire: { id: string; attempts: number; summary: string }[] = []
  for (const [id, e] of Object.entries(cache)) {
    const k = classify(e)
    counts[k]++
    if (k === 'degraded' && onWire.has(id)) degradedOnWire.push({ id, attempts: e.read_attempts || 0, summary: (e.summary || '').slice(0, 70) })
  }

  const onWireTotal = ids.filter((id) => onWire.has(id)).length
  const degradedFrac = onWireTotal ? degradedOnWire.length / onWireTotal : 0

  console.log('— THE STORY (enrich) health —')
  console.log(`cache entries: ${ids.length}  ·  on the live wire: ${onWireTotal}`)
  console.log(`  rich brief:    ${counts.rich}`)
  console.log(`  SEC parse:     ${counts.sec}`)
  console.log(`  filing floor:  ${counts.filing_floor}  (intended — the headline is the disclosure)`)
  console.log(`  DEGRADED:      ${counts.degraded}  (of which ${degradedOnWire.length} still on the wire = heal targets)`)
  console.log(`  degraded rate (on-wire): ${(degradedFrac * 100).toFixed(1)}%  (threshold ${(THRESHOLD * 100).toFixed(0)}%)`)
  if (degradedOnWire.length) {
    console.log('  heal targets:')
    for (const d of degradedOnWire.slice(0, 15)) console.log(`    ${d.id}  attempts=${d.attempts}  "${d.summary}"`)
  }

  let healResults: { id: string; healed: boolean; note?: string }[] = []
  if (HEAL && degradedOnWire.length) {
    console.log(`\nhealing ${degradedOnWire.length} degraded read(s) via ${ENGINE} …`)
    healResults = await healViaEngine(degradedOnWire.map((d) => d.id))
    const ok = healResults.filter((r) => r.healed).length
    console.log(`healed ${ok}/${healResults.length}`)
    for (const r of healResults.filter((r) => !r.healed)) console.log(`  still degraded: ${r.id}${r.note ? ` (${r.note})` : ''}`)
  }

  if (jsonOut) {
    fs.writeFileSync(jsonOut, JSON.stringify({ total: ids.length, onWireTotal, counts, degradedFrac, degradedOnWire, healResults }, null, 2))
    console.log(`\nwrote ${jsonOut}`)
  }

  if (STRICT && degradedFrac > THRESHOLD) {
    console.error(`\nFAIL: on-wire degraded rate ${(degradedFrac * 100).toFixed(1)}% exceeds ${(THRESHOLD * 100).toFixed(0)}% — the article read is regressing. Run with --heal or check the LLM provider keys.`)
    process.exitCode = 1
  }
}

void main()
