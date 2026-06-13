// Live feed verifier for the screener news firehose. Reads a JSON array of candidate feeds and, for
// each, does EXACTLY what production does — fetches with the production User-Agent and runs the
// production parseFeed() — so a PASS here means it will work in the live ingester. For RSS/Atom it
// reports the distinct ITEM-LINK domains (not the feed-host domain), because the approved-domains
// firewall gates on the item link's domain (e.g. MarketWatch's feed is on dowjones.io but items
// link to marketwatch.com). For JSON APIs it confirms a 200 + a parseable list.
//
// Run: npx tsx scripts/verify-feeds.ts <candidates.json> [--out results.json] [--conc 8]
// Candidate shape (extra fields ignored): { source_name, registrable_domain, region, input_nature,
//   access: 'rss'|'atom'|'json_api'|'html_scrape', feed_url, ... }

import fs from 'node:fs'
import path from 'node:path'
import { parseFeed } from '../ui/server/src/news/sources/rss'

interface Candidate {
  source_name: string
  registrable_domain: string
  region?: string
  input_nature?: string
  access: string
  feed_url: string
  category?: string
  high_value?: boolean
  key_required?: boolean
  notes?: string
}

interface Result extends Candidate {
  http_status: number | string
  items: number
  link_domains: { domain: string; count: number }[]
  ms: number
  verdict: 'live' | 'empty_valid' | 'fail' // live = items now; empty_valid = real feed, empty at this moment (keep); fail = drop
  ok: boolean // verdict !== 'fail' — i.e. wire it in
  reason: string
}

// A browser-like default UA: many publishers (LiveMint, some India/EU sites) soft-block non-browser
// agents (200 + empty challenge page). This mirrors the production default we will set.
const BROWSER_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 nostra-demus-screener/1.0'
// SEC + many .gov endpoints require a descriptive UA WITH a contact, or they 403.
const GOV_UA = 'nostra-demus-screener/1.0 (ceekay@muns.io)'

function uaFor(url: string): string {
  try {
    const h = new URL(url).hostname
    if (/\.gov$|\.gov\.|sec\.gov|federalreserve|bls\.gov|bea\.gov|census\.gov|treasury|eia\.gov|cftc|fda\.gov|ftc\.gov|justice\.gov/i.test(h)) return GOV_UA
  } catch {}
  return BROWSER_UA
}

function hostOf(u: string): string | null {
  try {
    return new URL(u).hostname.toLowerCase().replace(/^www\./, '')
  } catch {
    return null
  }
}

/** Tally the registrable-ish domain of each item link. We keep the full host but also collapse the
 *  obvious eTLD+1 so the wiring step sees the real link target. */
function tallyLinkDomains(links: string[]): { domain: string; count: number }[] {
  const m = new Map<string, number>()
  for (const l of links) {
    const h = hostOf(l)
    if (!h) continue
    m.set(h, (m.get(h) || 0) + 1)
  }
  return [...m.entries()]
    .map(([domain, count]) => ({ domain, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)
}

async function fetchWithRetry(url: string, timeoutMs = 14_000): Promise<{ status: number | string; body: string }> {
  for (let attempt = 1; attempt <= 2; attempt++) {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), timeoutMs)
    try {
      const res = await fetch(url, {
        signal: ctrl.signal,
        redirect: 'follow',
        headers: {
          'user-agent': uaFor(url),
          accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml, application/json, */*',
          'accept-language': 'en-US,en;q=0.9',
        },
      })
      const body = await res.text()
      clearTimeout(timer)
      if ((res.status === 429 || res.status >= 500) && attempt === 1) {
        await new Promise((r) => setTimeout(r, 2500))
        continue
      }
      return { status: res.status, body }
    } catch (e: any) {
      clearTimeout(timer)
      if (attempt === 1) {
        await new Promise((r) => setTimeout(r, 1500))
        continue
      }
      return { status: e?.name === 'AbortError' ? 'timeout' : e?.message || 'fetch-error', body: '' }
    }
  }
  return { status: 'unknown', body: '' }
}

async function verifyOne(c: Candidate): Promise<Result> {
  const t0 = Date.now()
  const base: Result = { ...c, http_status: '', items: 0, link_domains: [], ms: 0, verdict: 'fail', ok: false, reason: '' }
  let { status, body } = await fetchWithRetry(c.feed_url)
  base.http_status = status
  if (typeof status !== 'number') {
    base.ms = Date.now() - t0
    base.reason = `fetch failed: ${status}`
    return base
  }
  if (status !== 200) {
    base.ms = Date.now() - t0
    base.reason = `HTTP ${status}`
    return base
  }
  if (c.access === 'json_api') {
    base.ms = Date.now() - t0
    try {
      const j = JSON.parse(body)
      const arr = Array.isArray(j) ? j : j?.articles || j?.results || j?.data || j?.items || j?.feed?.entry || []
      base.items = Array.isArray(arr) ? arr.length : 0
      base.verdict = base.items >= 1 ? 'live' : 'empty_valid'
      base.ok = true
      base.reason = `json ok (${base.items} items in first page)`
    } catch {
      base.reason = 'not JSON'
    }
    return base
  }
  // rss / atom / html (try to parse anyway — some "html" sources are really feeds)
  let parsed = parseFeed(body, 80)
  const looksLikeFeed = (b: string) => /<rss|<feed[ >]|<rdf|<channel[ >]/i.test(b)
  // retry-on-empty once: a 0-item parse from a feed that LOOKS valid is often transient burst-throttle.
  if (parsed.length === 0) {
    await new Promise((r) => setTimeout(r, 2500))
    const retry = await fetchWithRetry(c.feed_url)
    if (typeof retry.status === 'number' && retry.status === 200) {
      const re = parseFeed(retry.body, 80)
      if (re.length > parsed.length) { parsed = re; body = retry.body }
    }
  }
  base.ms = Date.now() - t0
  base.items = parsed.length
  base.link_domains = tallyLinkDomains(parsed.map((p) => p.link))
  if (parsed.length >= 1) {
    base.verdict = 'live'
    base.ok = true
    base.reason = `${parsed.length} items`
  } else if (looksLikeFeed(body)) {
    // real feed structure but empty right now (e.g. a low-frequency SEC form on a weekend) — keep it
    base.verdict = 'empty_valid'
    base.ok = true
    base.reason = 'valid feed, empty at this moment'
  } else {
    base.verdict = 'fail'
    base.reason = 'not a feed (no item/entry; likely HTML/challenge page)'
  }
  return base
}

/** Host-aware scheduler: feeds on the SAME host run sequentially (politeness — avoids burst-throttle
 *  false negatives); different hosts run concurrently up to `conc`. Preserves input order in output. */
async function hostAwarePool<T extends { feed_url: string }, R>(items: T[], conc: number, fn: (t: T, i: number) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length)
  const groups = new Map<string, number[]>() // host -> indices
  items.forEach((it, i) => {
    const h = hostOf(it.feed_url) || `idx${i}`
    if (!groups.has(h)) groups.set(h, [])
    groups.get(h)!.push(i)
  })
  const hostKeys = [...groups.keys()]
  let nextHost = 0
  async function worker() {
    for (;;) {
      const k = nextHost++
      if (k >= hostKeys.length) return
      const idxs = groups.get(hostKeys[k])!
      for (let j = 0; j < idxs.length; j++) {
        const i = idxs[j]
        out[i] = await fn(items[i], i)
        if (j < idxs.length - 1) await new Promise((r) => setTimeout(r, 600)) // gap between same-host feeds
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(conc, hostKeys.length) }, worker))
  return out
}

async function main() {
  const inPath = process.argv[2]
  if (!inPath) {
    console.error('usage: tsx scripts/verify-feeds.ts <candidates.json> [--out results.json] [--conc 8]')
    process.exit(1)
  }
  const outIdx = process.argv.indexOf('--out')
  const outPath = outIdx > -1 ? process.argv[outIdx + 1] : path.join(path.dirname(inPath), 'feed-verify-results.json')
  const concIdx = process.argv.indexOf('--conc')
  const conc = concIdx > -1 ? Number(process.argv[concIdx + 1]) || 8 : 8

  const raw = JSON.parse(fs.readFileSync(inPath, 'utf8'))
  const cands: Candidate[] = Array.isArray(raw) ? raw : raw?.feeds || []
  // de-dup by feed_url
  const seen = new Set<string>()
  const uniq = cands.filter((c) => c?.feed_url && !seen.has(c.feed_url) && (seen.add(c.feed_url), true))
  console.error(`verifying ${uniq.length} unique feeds (conc=${conc})…\n`)

  let done = 0
  const results = await hostAwarePool(uniq, conc, async (c, i) => {
    const r = await verifyOne(c)
    done++
    const tag = r.verdict === 'live' ? 'LIVE' : r.verdict === 'empty_valid' ? 'EMPT' : 'FAIL'
    const dom = r.link_domains.length ? ' → ' + r.link_domains.map((d) => `${d.domain}(${d.count})`).join(', ') : ''
    console.error(
      `[${String(done).padStart(3)}/${uniq.length}] ${tag} ${String(r.http_status).padStart(7)} ${String(r.items).padStart(3)}it ${r.ms}ms  ${r.source_name} <${r.registrable_domain}> ${r.access}${dom}`,
    )
    return r
  })

  fs.writeFileSync(outPath, JSON.stringify(results, null, 2) + '\n')

  const live = results.filter((r) => r.verdict === 'live')
  const empty = results.filter((r) => r.verdict === 'empty_valid')
  const ok = results.filter((r) => r.ok)
  const fail = results.filter((r) => !r.ok)
  console.error(`\n=== SUMMARY: ${live.length} LIVE + ${empty.length} EMPTY-VALID = ${ok.length} KEEP, ${fail.length} FAIL of ${results.length} ===`)
  console.error(`\nLIVE feeds by region:`)
  for (const region of ['US', 'IN', 'GLOBAL', 'OTHER', '']) {
    const rs = ok.filter((r) => (r.region || '') === region)
    if (rs.length) console.error(`  ${region || '?'}: ${rs.length}`)
  }
  // surface the distinct item-link domains across all live feeds — the candidates for the firewall
  const domCount = new Map<string, number>()
  for (const r of ok) for (const d of r.link_domains) domCount.set(d.domain, (domCount.get(d.domain) || 0) + d.count)
  console.error(`\nDistinct item-link domains across live feeds (${domCount.size}):`)
  console.error(
    [...domCount.entries()].sort((a, b) => b[1] - a[1]).map(([d, c]) => `  ${d} (${c})`).join('\n'),
  )
  console.error(`\nresults written to ${outPath}`)
}

main()
