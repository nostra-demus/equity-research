// Production-faithful feed health check. For EVERY feed in rss_feeds.json it replicates exactly what
// the live ingester does — the SAME request shape (per-feed user_agent override else the browser
// DEFAULT_UA, the auto-fallback to the CONTACT_UA on a WAF-cloak status, the RSS_ACCEPT header) and the
// SAME parseFeed() with the feed URL as base — then reports, per feed, whether it yields items.
//
// It is BOTH the one-shot census and the permanent regression guard: run it after any feed/parser/UA
// change. A feed that returns 0 items and is NOT on the documented KNOWN_EMPTY allow-list is a failure.
//
// Run:  npx tsx scripts/feed-health.ts            (report)
//       npx tsx scripts/feed-health.ts --json out.json
//       npx tsx scripts/feed-health.ts --strict    (exit 1 if any undocumented feed yields 0 items)

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseFeed, DEFAULT_UA, CONTACT_UA, RSS_ACCEPT } from '../ui/server/src/news/sources/rss'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO = path.resolve(__dirname, '..')
const FEEDS = path.join(REPO, 'frameworks/screener/rss_feeds.json')

// Feeds that legitimately return 0 items at some times (weekend / low-frequency / episodic publishers).
// These are NOT failures — documented so the guard doesn't cry wolf. Keyed by a stable URL substring.
const KNOWN_EMPTY: { match: string; why: string }[] = [
  { match: 'cftc.gov/RSS', why: 'CFTC press feed — quiet on weekends' },
  { match: 'atlantafed.org/rss/GDPNow', why: 'GDPNow — updates only a few times per quarter' },
  { match: 'type=NT%2010-K', why: 'SEC late-filing notice — sparse' },
  { match: 'type=NT%2010-Q', why: 'SEC late-filing notice — sparse' },
  { match: 'type=15-12B', why: 'SEC deregistration — sparse' },
  { match: 'type=25-NSE', why: 'SEC delisting — sparse' },
  { match: 'type=SC%2013G', why: 'SEC 13G — sparse on weekends' },
  { match: 'type=SD', why: 'SEC specialized disclosure — sparse' },
  { match: 'type=11-K', why: 'SEC employee stock-plan annual — sparse' },
  { match: 'businesswire.com', why: 'BW category feeds — low-volume categories empty on weekends' },
  { match: 'nseindia.com', why: 'NSE — markets closed on weekends' },
  { match: 'bseindia.com', why: 'BSE — markets closed on weekends' },
  { match: 'eia.gov/rss/todayinenergy', why: 'EIA Today in Energy — weekday cadence' },
  { match: 'treasurydirect.gov', why: 'TreasuryDirect data feeds — link-less rows / weekday cadence' },
]
const isKnownEmpty = (url: string) => KNOWN_EMPTY.find((k) => url.includes(k.match))

interface Feed { url: string; source_name: string; user_agent?: string }
type Status = 'ok-browser' | 'ok-override' | 'ok-contact-fallback' | 'empty' | 'empty-known' | 'dead' | 'error'
interface Row { source_name: string; url: string; status: Status; http: number | string; items: number; ua_used: string; note?: string }

const CLOAK = new Set([403, 404, 302, 410, 451])

async function fetchOnce(url: string, ua: string, timeoutMs: number): Promise<{ status: number | string; xml?: string }> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const res = await fetch(url, { headers: { 'user-agent': ua, accept: RSS_ACCEPT }, signal: ctrl.signal })
    if (!res.ok) return { status: res.status }
    return { status: res.status, xml: await res.text() }
  } catch (e: any) {
    return { status: e?.name === 'AbortError' ? 'timeout' : e?.message || 'fetch-error' }
  } finally {
    clearTimeout(timer)
  }
}

const sleep = (ms: number) => new Promise<void>((res) => setTimeout(res, ms))
const isTransient = (s: number | string) => s === 'timeout' || (typeof s === 'string') || (typeof s === 'number' && s >= 500)

async function checkFeed(feed: Feed, timeoutMs: number): Promise<Row> {
  const firstUa = feed.user_agent || DEFAULT_UA
  let r = await fetchOnce(feed.url, firstUa, timeoutMs)
  // retry transient failures (network blip / 5xx / timeout) up to 2× with backoff — production does the
  // same (3 attempts), so the guard must too or a concurrent-burst blip reads as a false failure.
  for (let attempt = 1; attempt <= 2 && isTransient(r.status); attempt++) { await sleep(800 * attempt); r = await fetchOnce(feed.url, firstUa, timeoutMs) }
  let uaUsed = firstUa
  // auto-fallback to the contact UA on a cloak-shaped block (mirrors production)
  if (typeof r.status === 'number' && CLOAK.has(r.status) && firstUa !== CONTACT_UA) {
    let r2 = await fetchOnce(feed.url, CONTACT_UA, timeoutMs)
    for (let attempt = 1; attempt <= 2 && isTransient(r2.status); attempt++) { await sleep(800 * attempt); r2 = await fetchOnce(feed.url, CONTACT_UA, timeoutMs) }
    if (typeof r2.status === 'number' && r2.status >= 200 && r2.status < 300) { r = r2; uaUsed = CONTACT_UA }
    else r = r2 // still failing → report the fallback's status
  }
  const base = { source_name: feed.source_name, url: feed.url, http: r.status, ua_used: uaUsed }
  if (typeof r.status !== 'number' || r.status < 200 || r.status >= 300 || !r.xml) {
    return { ...base, status: typeof r.status === 'string' ? 'error' : 'dead', items: 0, note: String(r.status) }
  }
  const items = parseFeed(r.xml, 60, feed.url).length
  if (items > 0) {
    const st: Status = uaUsed === CONTACT_UA && firstUa !== CONTACT_UA ? 'ok-contact-fallback' : feed.user_agent ? 'ok-override' : 'ok-browser'
    return { ...base, status: st, items }
  }
  const known = isKnownEmpty(feed.url)
  return { ...base, status: known ? 'empty-known' : 'empty', items: 0, note: known?.why }
}

async function main() {
  const args = process.argv.slice(2)
  const jsonOut = args.includes('--json') ? args[args.indexOf('--json') + 1] : null
  const strict = args.includes('--strict')
  const timeoutMs = 20_000
  const conc = 6
  const feeds: Feed[] = JSON.parse(fs.readFileSync(FEEDS, 'utf8')).feeds
  console.log(`feed-health: probing ${feeds.length} feeds (production-faithful: override||browser UA + contact-UA fallback + parseFeed)\n`)

  const rows: Row[] = []
  let i = 0
  async function worker() {
    while (i < feeds.length) {
      const idx = i++
      const row = await checkFeed(feeds[idx], timeoutMs)
      rows.push(row)
      const bad = row.status === 'empty' || row.status === 'dead' || row.status === 'error'
      if (bad || row.status === 'ok-contact-fallback') {
        const tag = row.status === 'ok-contact-fallback' ? 'RESCUED' : 'FAIL   '
        console.log(`  ${tag} [${String(row.http).padStart(5)}] ${row.items}it  ${row.source_name.slice(0, 48)}`)
      }
    }
  }
  await Promise.all(Array.from({ length: conc }, worker))

  const by: Record<string, number> = {}
  for (const r of rows) by[r.status] = (by[r.status] || 0) + 1
  console.log('\n=== SUMMARY ===')
  for (const [k, v] of Object.entries(by).sort((a, b) => b[1] - a[1])) console.log(`  ${k.padEnd(20)} ${v}`)
  const failures = rows.filter((r) => r.status === 'empty' || r.status === 'dead' || r.status === 'error')
  console.log(`\n  WORKING: ${rows.length - failures.length}/${rows.length}   |   undocumented failures: ${failures.length}`)
  const rescued = rows.filter((r) => r.status === 'ok-contact-fallback')
  if (rescued.length) console.log(`  (${rescued.length} feeds self-healed via the contact-UA fallback)`)

  if (jsonOut) { fs.writeFileSync(jsonOut, JSON.stringify(rows, null, 2)); console.log(`\n  wrote ${jsonOut}`) }
  if (strict && failures.length) { console.error(`\nSTRICT: ${failures.length} undocumented feed(s) yield 0 items / error.`); process.exit(1) }
}

main()
