// Layer 2 of the ingestion stack: direct publisher RSS/Atom feeds — lower latency than GDELT and
// immune to its rate limits. Deliberately dependency-free: we need exactly three fields (title,
// link, date) from two well-known formats, so a ~60-line extractor beats adding the repo's first
// runtime XML dependency. The approved-domains firewall in normalize.ts stays the single authority:
// items are filtered by their LINK's domain downstream, so an off-list feed item still drops.
//
// Resilience: per-feed isolation (one bad feed never hurts the rest), 3-attempt backoff, hard
// timeout per request, conditional GET (ETag/Last-Modified cached in STATE_DIR/rss-cache.json so an
// unchanged feed costs one 304), and a lookback filter so a cold cache can't flood the pipeline.

import fs from 'node:fs'
import path from 'node:path'
import type { RawArticle } from '../types'

// Default User-Agent: a real browser string. Many publishers (LiveMint, Moneycontrol, several India/
// EU sites) soft-block non-browser agents — they answer 200 with an empty challenge page, so a
// "nostra-demus-screener/1.0" UA silently yields zero items. A browser UA is read by all of them.
// SEC/.gov endpoints instead REQUIRE a descriptive UA with a contact, and reject look-alike contact
// suffixes elsewhere (Moneycontrol 403s on a contact-tagged UA) — so SEC feeds set a per-feed
// `user_agent` override in rss_feeds.json rather than forcing one global UA to please everyone.
const DEFAULT_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'

export interface RssOptions {
  feedsPath: string // absolute path to the versioned feed list (frameworks/screener/rss_feeds.json)
  lookbackMin: number // items older than 3× this are skipped (RSS has no timespan parameter)
  timeoutMs: number
  stateDir: string // where the conditional-GET cache lives
  userAgent?: string // default UA when a feed doesn't override it (DEFAULT_UA if unset)
  concurrency?: number // max DISTINCT HOSTS fetched at once (default 8) — bounds load as the list grows
  perHostGapMs?: number // pause between two feeds on the SAME host (default 700ms) — politeness vs burst-blocks
}

export interface RssDeps {
  fetchFn?: typeof fetch
  sleep?: (ms: number) => Promise<void>
  now?: () => Date
  log?: (m: string) => void
}

interface FeedEntry {
  url: string
  source_name?: string
  user_agent?: string // optional per-feed UA override (e.g. SEC's required contact UA)
}

type CondCache = Record<string, { etag?: string; lastModified?: string }>

const cachePath = (stateDir: string) => path.join(stateDir, 'rss-cache.json')

function loadCache(stateDir: string): CondCache {
  try {
    const o = JSON.parse(fs.readFileSync(cachePath(stateDir), 'utf8'))
    return o && typeof o === 'object' ? o : {}
  } catch {
    return {}
  }
}

function saveCache(stateDir: string, cache: CondCache): void {
  try {
    fs.mkdirSync(stateDir, { recursive: true })
    fs.writeFileSync(cachePath(stateDir), JSON.stringify(cache, null, 1) + '\n')
  } catch {
    // a lost cache only costs one full re-fetch next cycle
  }
}

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" }

function decodeEntities(s: string): string {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&(amp|lt|gt|quot|apos);/g, (_, e) => ENTITIES[e])
}

function stripCdata(s: string): string {
  return s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
}

function textOf(block: string, tag: string): string | null {
  const m = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i').exec(block)
  if (!m) return null
  const t = decodeEntities(stripCdata(m[1]).trim()).replace(/\s+/g, ' ').trim()
  return t || null
}

/** The item's outbound link. Handles, in order:
 *  - RSS <link>text</link>, including CDATA-wrapped and entity-encoded URLs (e.g. Federal Reserve
 *    feeds use <link><![CDATA[https://…]]></link>);
 *  - Atom <link href> (prefer rel="alternate" over rel="self"/enclosure);
 *  - a <guid> that is itself a permalink URL — many RSS feeds (LiveMint, CNBC-TV18, The Hindu
 *    BusinessLine and other Indian/wire feeds) leave <link> empty and carry the canonical article
 *    URL only in <guid isPermaLink="true">. Without this fallback those feeds parse to ZERO items. */
// Absolute http(s) URL, resolving a RELATIVE link/guid against the feed's own URL when we have it.
// Some feeds (e.g. EIA press releases) emit item links as "/pressroom/releases/…" — rejecting those
// outright silently drops every item; resolving them against the feed URL recovers them. Anchors and
// non-http schemes (mailto:, javascript:) are still rejected.
function absOf(v: string, baseUrl?: string): string | null {
  if (!v || v.startsWith('#')) return null
  if (/^https?:\/\//i.test(v)) return v
  if (!baseUrl) return null
  try {
    const u = new URL(v, baseUrl)
    return u.protocol === 'http:' || u.protocol === 'https:' ? u.href : null
  } catch {
    return null
  }
}

function linkOf(block: string, baseUrl?: string): string | null {
  // RSS <link>…</link> — tolerate CDATA + entities, not just a bare URL
  const rssText = /<link[^>]*>([\s\S]*?)<\/link>/i.exec(block)
  if (rssText) {
    const v = absOf(decodeEntities(stripCdata(rssText[1]).trim()), baseUrl)
    if (v) return v
  }
  // Atom <link href="…"> — prefer rel="alternate"; keep any href as a fallback
  const linkTags = block.match(/<link\b[^>]*>/gi) || []
  let hrefFallback: string | null = null
  for (const tag of linkTags) {
    const href = /href\s*=\s*["']([^"']+)["']/i.exec(tag)?.[1]
    if (!href) continue
    const rel = /rel\s*=\s*["']([^"']+)["']/i.exec(tag)?.[1]
    const v = absOf(decodeEntities(href), baseUrl)
    if ((!rel || rel === 'alternate') && v) return v
    if (!hrefFallback) hrefFallback = v
  }
  if (hrefFallback) return hrefFallback
  // <guid> permalink fallback (skip when isPermaLink="false")
  const guid = /<guid\b([^>]*)>([\s\S]*?)<\/guid>/i.exec(block)
  if (guid && !/ispermalink\s*=\s*["']?\s*false/i.test(guid[1] || '')) {
    const v = absOf(decodeEntities(stripCdata(guid[2]).trim()), baseUrl)
    if (v) return v
  }
  return null
}

function dateOf(block: string): string | null {
  return textOf(block, 'pubDate') || textOf(block, 'published') || textOf(block, 'updated') || textOf(block, 'dc:date')
}

/** The entry's own body/lede, straight from the feed — the fullest the feed offers. This is the
 *  fetch-free article text that lets enrichment read a story even when the source page 403s or renders
 *  client-side (most of the wire). May contain HTML; the consumer strips it. */
function snippetOf(block: string): string | null {
  return textOf(block, 'content:encoded') || textOf(block, 'description') || textOf(block, 'summary') || textOf(block, 'content')
}

/** Parse one RSS 2.0 or Atom document into raw articles. Tolerant by construction: a malformed
 *  entry yields nothing rather than an error. Exported for the test suite. */
export function parseFeed(xml: string, maxItems = 60, baseUrl?: string): { title: string; link: string; date: string | null; snippet: string | null }[] {
  const out: { title: string; link: string; date: string | null; snippet: string | null }[] = []
  // entry blocks: RSS <item>…</item>, Atom <entry>…</entry>
  const blocks = xml.split(/<(?:item|entry)[\s>]/i).slice(1)
  for (const rawBlock of blocks.slice(0, maxItems)) {
    const block = rawBlock.split(/<\/(?:item|entry)>/i)[0]
    const link = linkOf(block, baseUrl)
    if (!link || !/^https?:\/\//i.test(link)) continue
    let title = textOf(block, 'title')
    const snippet = snippetOf(block)
    // Some data feeds (e.g. Atlanta Fed GDPNow) ship an EMPTY <title> with the real headline in the
    // body — synthesize a title from the lede rather than silently dropping the item.
    if (!title && snippet) {
      title = decodeEntities(snippet.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()).slice(0, 140).trim()
    }
    if (!title) continue
    out.push({ title, link, date: dateOf(block), snippet })
  }
  return out
}

/**
 * Pull every configured feed (in parallel, isolated) and return raw articles tagged via:'rss'.
 * Never throws: a missing/invalid feed list or a failing feed degrades to fewer items + a log line.
 */
export async function fetchRss(opts: RssOptions, deps: RssDeps = {}): Promise<RawArticle[]> {
  const fetchFn = deps.fetchFn || fetch
  const sleep = deps.sleep || ((ms: number) => new Promise<void>((r) => setTimeout(r, ms)))
  const now = deps.now || (() => new Date())
  const log = deps.log || (() => {})
  const defaultUa = opts.userAgent || DEFAULT_UA
  const concurrency = Math.max(1, opts.concurrency ?? 8)
  const perHostGapMs = opts.perHostGapMs ?? 700

  let feeds: FeedEntry[]
  try {
    const doc = JSON.parse(fs.readFileSync(opts.feedsPath, 'utf8'))
    feeds = Array.isArray(doc?.feeds) ? doc.feeds.filter((f: any) => typeof f?.url === 'string') : []
  } catch {
    log(`rss: feed list missing/unreadable at ${opts.feedsPath} — skipping the RSS layer`)
    return []
  }
  if (!feeds.length) return []

  const cache = loadCache(opts.stateDir)
  const oldestMs = now().getTime() - opts.lookbackMin * 3 * 60_000

  // One feed → its fresh, on-window articles. Self-contained and total: every failure path returns []
  // (per-feed isolation), so one bad feed never affects another and the scheduler need not guard.
  const fetchOneFeed = async (feed: FeedEntry): Promise<RawArticle[]> => {
    const ua = feed.user_agent || defaultUa
    for (let attempt = 1; attempt <= 3; attempt++) {
      const ctrl = new AbortController()
      const timer = setTimeout(() => ctrl.abort(), opts.timeoutMs)
      try {
        // The trailing */* matters: some content-negotiation-strict origins (e.g. Eurostat) return 406 to
        // the explicit-only list — verified live, Eurostat 406s on the strict list but 200s with */* — and
        // a feed that serves a generic content-type would otherwise be rejected. Keeps the specific types
        // first (preferred) while never hard-failing a valid feed on the Accept header alone.
        const headers: Record<string, string> = { 'user-agent': ua, accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*' }
        const cond = cache[feed.url]
        if (cond?.etag) headers['if-none-match'] = cond.etag
        if (cond?.lastModified) headers['if-modified-since'] = cond.lastModified
        const res = await fetchFn(feed.url, { headers, signal: ctrl.signal })
        if (res.status === 304) return [] // unchanged since last cycle
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const xml = await res.text()
        const etag = res.headers.get('etag')
        const lastModified = res.headers.get('last-modified')
        if (etag || lastModified) cache[feed.url] = { etag: etag || undefined, lastModified: lastModified || undefined }
        const items = parseFeed(xml, 60, feed.url)
        const arts: RawArticle[] = []
        for (const it of items) {
          const d = it.date ? new Date(it.date) : null
          const fresh = !d || Number.isNaN(d.getTime()) || d.getTime() >= oldestMs
          if (!fresh) continue
          let domain: string
          try {
            domain = new URL(it.link).hostname
          } catch {
            continue
          }
          arts.push({
            title: it.title,
            url: it.link,
            domain,
            seendate: d && !Number.isNaN(d.getTime()) ? d.toISOString().replace(/\.\d{3}Z$/, 'Z') : now().toISOString().replace(/\.\d{3}Z$/, 'Z'),
            via: 'rss',
            snippet: it.snippet || undefined,
          })
        }
        return arts
      } catch (e: any) {
        if (attempt === 3) {
          log(`rss ${feed.source_name || feed.url}: ${e?.name === 'AbortError' ? 'timeout' : e?.message || e}, gave up`)
          return []
        }
        await sleep(1000 * attempt)
      } finally {
        clearTimeout(timer)
      }
    }
    return []
  }

  // Host-aware scheduling: feeds on the SAME host run sequentially with a politeness gap (rate-
  // sensitive publishers answer 200-but-empty when bursted); DIFFERENT hosts run concurrently up to
  // `concurrency`. With a handful of feeds this behaves like the old fire-all; it only starts to
  // matter as the list grows and several feeds share a host (e.g. many SEC EDGAR form feeds).
  const groups = new Map<string, FeedEntry[]>()
  for (const feed of feeds) {
    let host: string
    try {
      host = new URL(feed.url).hostname
    } catch {
      host = feed.url
    }
    if (!groups.has(host)) groups.set(host, [])
    groups.get(host)!.push(feed)
  }
  const hostKeys = [...groups.keys()]
  let nextHost = 0
  const collected: RawArticle[] = []
  const worker = async (): Promise<void> => {
    for (;;) {
      const k = nextHost++
      if (k >= hostKeys.length) return
      const group = groups.get(hostKeys[k])!
      for (let j = 0; j < group.length; j++) {
        const arts = await fetchOneFeed(group[j]) // never throws
        for (const a of arts) collected.push(a)
        if (j < group.length - 1) await sleep(perHostGapMs)
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, hostKeys.length) }, worker))

  saveCache(opts.stateDir, cache)

  // dedup across feeds by URL (first occurrence wins) — unchanged contract
  const out: RawArticle[] = []
  const seen = new Set<string>()
  for (const a of collected) {
    if (!seen.has(a.url)) {
      seen.add(a.url)
      out.push(a)
    }
  }
  return out
}
