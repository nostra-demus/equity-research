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
import { recordRssHealth, type FetchStatus } from '../source-health'

// Default User-Agent: a real browser string. Many publishers (LiveMint, Moneycontrol, several India/
// EU sites) soft-block non-browser agents — they answer 200 with an empty challenge page, so a
// "nostra-demus-screener/1.0" UA silently yields zero items. A browser UA is read by all of them.
// SEC/.gov endpoints instead REQUIRE a descriptive UA with a contact, and reject look-alike contact
// suffixes elsewhere (Moneycontrol 403s on a contact-tagged UA) — so SEC feeds set a per-feed
// `user_agent` override in rss_feeds.json rather than forcing one global UA to please everyone.
// The production request shape — EXPORTED so the feed-health checker (scripts/feed-health.ts) probes
// every feed byte-for-byte the way the live ingester does, and can never drift from it.
export const DEFAULT_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
// The honest descriptive contact UA. Used (a) as a per-feed override for sources whose WAF cloaks the
// browser UA (SEC, BLS, FDA, …), and (b) as the AUTOMATIC fallback when a browser-UA fetch is blocked.
export const CONTACT_UA = 'nostra-demus-screener/1.0 (ceekay@muns.io)'
export const RSS_ACCEPT = 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*'

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
  fallback_urls?: string[] // optional same-source mirrors; tried only after the primary endpoint fails
}

type CondCache = Record<string, { etag?: string; lastModified?: string }>

const cachePath = (stateDir: string) => path.join(stateDir, 'rss-cache.json')
const deliveryPath = (stateDir: string) => path.join(stateDir, 'rss-delivery-pending.json')
const RSS_DELIVERY_MAX_ROWS = 50_000
const RSS_DELIVERY_MAX_BYTES = 50_000_000
// A successful conditional response must be consumed in full before its validator can advance. This is a
// hostile/malformed-document guard, not a result cap: every supported entry below it is parsed, then ordinary
// freshness and revision dedupe decide what flows. A larger document fails closed with the prior validator.
export const RSS_DOCUMENT_ENTRY_CEILING = 10_000

interface DeliveryJournalV2 {
  version: 2
  rows: RawArticle[]
  /** Validators observed while producing `rows`; committed only after the caller acknowledges them. */
  candidateCache: CondCache
}

type DeliveryRead =
  | { status: 'ok'; rows: RawArticle[]; candidateCache?: CondCache }
  | { status: 'unavailable'; rows: [] }

function validRows(value: unknown): value is RawArticle[] {
  return Array.isArray(value) && value.length <= RSS_DELIVERY_MAX_ROWS && !value.some((row: any) =>
    !row || typeof row !== 'object' || typeof row.title !== 'string' || typeof row.url !== 'string'
    || typeof row.domain !== 'string' || typeof row.seendate !== 'string' || row.via !== 'rss')
}

function validCache(value: unknown): value is CondCache {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  return Object.values(value).every((entry: any) => entry && typeof entry === 'object' && !Array.isArray(entry)
    && (entry.etag === undefined || typeof entry.etag === 'string')
    && (entry.lastModified === undefined || typeof entry.lastModified === 'string'))
}

function readDeliveryJournal(stateDir: string): DeliveryRead {
  try {
    const parsed = JSON.parse(fs.readFileSync(deliveryPath(stateDir), 'utf8'))
    // Accept the first array-only journal written by the pre-v2 handoff patch. That implementation
    // already advanced rss-cache.json, so the committed cache is the correct fallback at acknowledge.
    if (validRows(parsed)) return { status: 'ok', rows: parsed }
    if (parsed?.version !== 2 || !validRows(parsed.rows) || !validCache(parsed.candidateCache)) {
      return { status: 'unavailable', rows: [] }
    }
    return { status: 'ok', rows: parsed.rows, candidateCache: parsed.candidateCache }
  } catch (error: any) {
    return error?.code === 'ENOENT' ? { status: 'ok', rows: [] } : { status: 'unavailable', rows: [] }
  }
}

function writeDeliveryJournal(stateDir: string, rows: readonly RawArticle[], candidateCache: CondCache): boolean {
  const target = deliveryPath(stateDir)
  const tmp = `${target}.tmp`
  let fd: number | undefined
  try {
    const journal: DeliveryJournalV2 = { version: 2, rows: [...rows], candidateCache }
    const bytes = `${JSON.stringify(journal)}\n`
    if (rows.length > RSS_DELIVERY_MAX_ROWS || Buffer.byteLength(bytes, 'utf8') > RSS_DELIVERY_MAX_BYTES) return false
    fs.mkdirSync(stateDir, { recursive: true })
    fd = fs.openSync(tmp, 'w', 0o600)
    fs.writeFileSync(fd, bytes)
    fs.fsyncSync(fd)
    fs.closeSync(fd)
    fd = undefined
    fs.renameSync(tmp, target)
    const dir = fs.openSync(stateDir, 'r')
    try { fs.fsyncSync(dir) } finally { fs.closeSync(dir) }
    return true
  } catch {
    if (fd !== undefined) try { fs.closeSync(fd) } catch { /* best effort */ }
    try { fs.rmSync(tmp, { force: true }) } catch { /* best effort */ }
    return false
  }
}

/** Clear RSS's raw handoff only after runCycle has durably projected or backlogged every normalized row. */
export function acknowledgeRssDeliveries(stateDir: string): boolean {
  const current = readDeliveryJournal(stateDir)
  if (current.status !== 'ok') return false
  const candidateCache = current.candidateCache || loadCache(stateDir)
  // Commit validators before clearing rows. A crash between the two can replay rows, but can never make
  // a publisher answer 304 before those rows have a durable runCycle authority.
  return saveCache(stateDir, candidateCache) && writeDeliveryJournal(stateDir, [], candidateCache)
}

function loadCache(stateDir: string): CondCache {
  try {
    const o = JSON.parse(fs.readFileSync(cachePath(stateDir), 'utf8'))
    return o && typeof o === 'object' ? o : {}
  } catch {
    return {}
  }
}

function saveCache(stateDir: string, cache: CondCache): boolean {
  const target = cachePath(stateDir)
  const tmp = `${target}.tmp`
  let fd: number | undefined
  try {
    fs.mkdirSync(stateDir, { recursive: true })
    fd = fs.openSync(tmp, 'w', 0o600)
    fs.writeFileSync(fd, JSON.stringify(cache, null, 1) + '\n')
    fs.fsyncSync(fd)
    fs.closeSync(fd)
    fd = undefined
    fs.renameSync(tmp, target)
    const dir = fs.openSync(stateDir, 'r')
    try { fs.fsyncSync(dir) } finally { fs.closeSync(dir) }
    return true
  } catch {
    if (fd !== undefined) try { fs.closeSync(fd) } catch { /* best effort */ }
    try { fs.rmSync(tmp, { force: true }) } catch { /* best effort */ }
    return false
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

// A URL identifies the article location, not the publisher's revision. Collapse byte-level presentation
// differences in a title, while preserving a correction/reversal whose normalized headline actually changed.
function deliveryKey(article: Pick<RawArticle, 'title' | 'url'>): string {
  const title = String(article.title || '').trim().replace(/\s+/g, ' ').toLowerCase()
  return `${title}\u0000${String(article.url || '').trim()}`
}

/** Accept conditional validators only from a document shape this adapter can actually consume. A number of
 * publisher WAFs answer a blocked request with HTTP 200 + an HTML challenge (sometimes with its own ETag).
 * Treating that validator as the feed's validator makes the immediate retry return 304 and permanently skips
 * the articles behind the challenge. Valid but currently empty RSS/Atom/news-sitemap documents still pass. */
function isSupportedFeedDocument(xml: string): boolean {
  let text = String(xml || '').replace(/^\uFEFF/, '').trimStart()
  // XML declarations, stylesheet processing instructions, comments and a doctype may precede the root.
  // Peel only those preamble constructs; the first ordinary element remains the authoritative shape.
  for (let guard = 0; guard < 16; guard++) {
    if (text.startsWith('<?')) {
      const end = text.indexOf('?>')
      if (end < 0) return false
      text = text.slice(end + 2).trimStart()
      continue
    }
    if (text.startsWith('<!--')) {
      const end = text.indexOf('-->')
      if (end < 0) return false
      text = text.slice(end + 3).trimStart()
      continue
    }
    if (/^<!doctype\b/i.test(text)) {
      let quote = ''
      let subsetDepth = 0
      let end = -1
      for (let i = 9; i < text.length; i++) {
        const ch = text[i]
        if (quote) {
          if (ch === quote) quote = ''
          continue
        }
        if (ch === '"' || ch === "'") { quote = ch; continue }
        if (ch === '[') subsetDepth++
        else if (ch === ']') subsetDepth = Math.max(0, subsetDepth - 1)
        else if (ch === '>' && subsetDepth === 0) { end = i; break }
      }
      if (end < 0) return false
      text = text.slice(end + 1).trimStart()
      continue
    }
    break
  }
  const root = /^<([a-z_][\w:.-]*)\b([^>]*)>/i.exec(text)
  if (!root) return false
  const name = root[1].toLowerCase()
  const supported = name === 'rss' || name === 'feed' || name === 'rdf:rdf'
    || (name === 'urlset' && /\bxmlns:news\s*=/i.test(root[2]))
  if (!supported) return false
  if (/\/\s*>$/.test(root[0])) {
    let remainder = text.slice(root[0].length).trimStart()
    for (let guard = 0; guard < 16 && remainder; guard++) {
      if (remainder.startsWith('<!--')) {
        const end = remainder.indexOf('-->')
        if (end < 0) return false
        remainder = remainder.slice(end + 3).trimStart()
        continue
      }
      if (remainder.startsWith('<?')) {
        const end = remainder.indexOf('?>')
        if (end < 0) return false
        remainder = remainder.slice(end + 2).trimStart()
        continue
      }
      return false
    }
    return remainder.length === 0
  }

  // A root opener alone is not a document. In particular, a connection/WAF truncation after `<rss>` would
  // otherwise look like a valid empty feed and install the response's ETag. Permit ordinary XML trailers,
  // then require the matching root close to be the last document element.
  let closed = text.trimEnd()
  for (let guard = 0; guard < 16; guard++) {
    if (closed.endsWith('-->')) {
      const start = closed.lastIndexOf('<!--')
      if (start < 0) return false
      closed = closed.slice(0, start).trimEnd()
      continue
    }
    if (closed.endsWith('?>')) {
      const start = closed.lastIndexOf('<?')
      if (start < 0) return false
      closed = closed.slice(0, start).trimEnd()
      continue
    }
    break
  }
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`</${escapedName}\\s*>$`, 'i').test(closed)
}

/** Bound parser work without silently treating a prefix as the whole conditional representation. Opening
 * entry tags are enough for the guard; malformed entries still consume safety capacity conservatively. */
function feedEntryCountExceeds(xml: string, ceiling: number): boolean {
  const entry = /<urlset[^>]*xmlns:news\s*=/i.test(xml)
    ? /<url(?=\s|\/?>)/gi
    : /<(?:item|entry)(?=\s|\/?>)/gi
  let count = 0
  while (entry.exec(xml)) if (++count > ceiling) return true
  return false
}

/** The entry's own body/lede, straight from the feed — the fullest the feed offers. This is the
 *  fetch-free article text that lets enrichment read a story even when the source page 403s or renders
 *  client-side (most of the wire). May contain HTML; the consumer strips it. */
function snippetOf(block: string): string | null {
  return textOf(block, 'content:encoded') || textOf(block, 'description') || textOf(block, 'summary') || textOf(block, 'content')
}

// A bare site root ("https://ferc.gov/", no path/query) — useless as a per-item link and, when every
// item shares it, collapses the whole feed to one row at dedup time.
function isRootUrl(u: string): boolean {
  try { const x = new URL(u); return (x.pathname === '/' || x.pathname === '') && !x.search && !x.hash } catch { return false }
}
// First real article href inside a body/description (FERC, TreasuryDirect put the per-item URL there).
function firstHttpHref(html: string | null): string | null {
  if (!html) return null
  const m = /href\s*=\s*["']?(https?:\/\/[^"'\s>]+)/i.exec(decodeEntities(html))
  return m ? m[1] : null
}

/** Google-News sitemap (`<urlset xmlns:news=…><url><loc>…</loc><news:news><news:title>…`).
 *  Some major wires expose their recent articles ONLY this way: Reuters has had no public RSS since
 *  2020, but its Arc news-sitemap carries the same three fields we need (article URL, headline,
 *  publication date) for the ~50 newest stories per page. Treating it as just another feed shape
 *  keeps it a plain rss_feeds.json row — no bespoke per-publisher adapter, and verify-feeds.ts /
 *  feed-health.ts check it byte-for-byte the way production does, because they reuse parseFeed. */
function parseNewsSitemap(xml: string, maxItems: number): { title: string; link: string; date: string | null; snippet: string | null }[] {
  const out: { title: string; link: string; date: string | null; snippet: string | null }[] = []
  // `<url[\s>]` can't match `<urlset …` (the next char is "s"), so the wrapper never becomes an entry.
  const blocks = xml.split(/<url[\s>]/i).slice(1)
  for (const rawBlock of blocks.slice(0, maxItems)) {
    const block = rawBlock.split(/<\/url>/i)[0]
    const link = textOf(block, 'loc')
    if (!link || !/^https?:\/\//i.test(link)) continue
    const title = textOf(block, 'news:title')
    if (!title) continue
    out.push({ title, link, date: textOf(block, 'news:publication_date') || textOf(block, 'lastmod'), snippet: null })
  }
  return out
}

/** Parse one RSS 2.0, Atom, or Google-News-sitemap document into raw articles. Tolerant by
 *  construction: a malformed entry yields nothing rather than an error. Exported for the test suite. */
export function parseFeed(xml: string, maxItems = 60, baseUrl?: string): { title: string; link: string; date: string | null; snippet: string | null }[] {
  // A news sitemap has no <item>/<entry>, so the RSS/Atom split below would yield nothing — detect it
  // by its news namespace (a plain URL sitemap without <news:title> stays unsupported: no headlines).
  if (/<urlset[^>]*xmlns:news\s*=/i.test(xml)) return parseNewsSitemap(xml, maxItems)
  const out: { title: string; link: string; date: string | null; snippet: string | null }[] = []
  // entry blocks: RSS <item>…</item>, Atom <entry>…</entry>
  const blocks = xml.split(/<(?:item|entry)[\s>]/i).slice(1)
  for (const rawBlock of blocks.slice(0, maxItems)) {
    const block = rawBlock.split(/<\/(?:item|entry)>/i)[0]
    let link = linkOf(block, baseUrl)
    if (!link || !/^https?:\/\//i.test(link)) continue
    let title = textOf(block, 'title')
    const snippet = snippetOf(block)
    // Some data feeds (e.g. Atlanta Fed GDPNow) ship an EMPTY <title> with the real headline in the
    // body — synthesize a title from the lede rather than silently dropping the item.
    if (!title && snippet) {
      title = decodeEntities(snippet.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()).slice(0, 140).trim()
    }
    if (!title) continue
    // FERC/TreasuryDirect class: every item's <link> is the site root and the real per-item URL is an
    // href in the body. Without this, all items dedup-collapse to one. Prefer the body href when the
    // link is a bare root and the body carries a deeper URL.
    if (isRootUrl(link)) {
      const href = firstHttpHref(snippet)
      if (href && !isRootUrl(href)) link = href
    }
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
  const delivery = readDeliveryJournal(opts.stateDir)
  if (delivery.status === 'unavailable') {
    log('rss: delivery journal needs attention — conditional fetch paused; existing bytes preserved')
    return []
  }
  // per-feed fetch outcome this cycle → persisted for the cockpit's Sources health panel
  const health = new Map<string, { status: FetchStatus; items: number; note?: string; sourceName?: string; activeUrl?: string; fallbackActive?: boolean }>()
  const rec = (feed: FeedEntry, status: FetchStatus, items: number, note?: string, activeUrl?: string) => health.set(feed.url, {
    status,
    items,
    note,
    sourceName: feed.source_name || feed.url,
    activeUrl: activeUrl || feed.url,
    fallbackActive: Boolean(activeUrl && activeUrl !== feed.url),
  })

  let feeds: FeedEntry[]
  try {
    const doc = JSON.parse(fs.readFileSync(opts.feedsPath, 'utf8'))
    feeds = Array.isArray(doc?.feeds) ? doc.feeds.filter((f: any) => typeof f?.url === 'string') : []
  } catch {
    log(`rss: feed list missing/unreadable at ${opts.feedsPath} — skipping the RSS layer`)
    return delivery.rows
  }
  if (!feeds.length) return delivery.rows

  // While deliveries are pending, their journaled validators are newer than rss-cache.json. Using
  // them avoids a full re-fetch on recovery without exposing those validators to a rolled-back binary.
  const cache: CondCache = Object.fromEntries(Object.entries(delivery.candidateCache || loadCache(opts.stateDir))
    .map(([url, value]) => [url, { ...value }]))
  const oldestMs = now().getTime() - opts.lookbackMin * 3 * 60_000

  // One feed → its fresh, on-window articles. Self-contained and total: every failure path returns []
  // (per-feed isolation), so one bad feed never affects another and the scheduler need not guard.
  const fetchOneFeed = async (feed: FeedEntry): Promise<RawArticle[]> => {
    let ua = feed.user_agent || defaultUa
    // WAF-cloak self-heal: a great many regulator/.gov feeds (BLS, SEC, DOL, FDA, CFPB, RBA, …) sit
    // behind Akamai/edge WAFs that 403/404/302 a spoofed browser UA but honor the honest contact UA.
    // Rather than hand-maintain a per-feed override for each, we AUTO-fall back to the contact UA once
    // on a cloak-shaped status — so every current AND future such feed self-heals with zero config.
    let triedContact = ua === CONTACT_UA
    const endpoints = [feed.url, ...((feed.fallback_urls || []).filter((u) => typeof u === 'string' && /^https?:\/\//i.test(u) && u !== feed.url))].slice(0, 4)
    let endpointIdx = 0
    let attempt = 1
    while (endpointIdx < endpoints.length) {
      const endpoint = endpoints[endpointIdx]
      const ctrl = new AbortController()
      const timer = setTimeout(() => ctrl.abort(), opts.timeoutMs)
      try {
        // The trailing */* matters: some content-negotiation-strict origins (e.g. Eurostat) return 406 to
        // the explicit-only list — verified live, Eurostat 406s on the strict list but 200s with */* — and
        // a feed that serves a generic content-type would otherwise be rejected. Keeps the specific types
        // first (preferred) while never hard-failing a valid feed on the Accept header alone.
        const headers: Record<string, string> = { 'user-agent': ua, accept: RSS_ACCEPT }
        const cond = cache[endpoint]
        if (cond?.etag) headers['if-none-match'] = cond.etag
        if (cond?.lastModified) headers['if-modified-since'] = cond.lastModified
        const res = await fetchFn(endpoint, { headers, signal: ctrl.signal })
        if (res.status === 304) { rec(feed, 'unchanged', 0, undefined, endpoint); return [] } // unchanged since last cycle
        if (!res.ok) {
          // cloak-shaped block → retry IMMEDIATELY with the honest contact UA before counting a failure
          if (!triedContact && (res.status === 403 || res.status === 404 || res.status === 302 || res.status === 410 || res.status === 451)) {
            triedContact = true
            ua = CONTACT_UA
            continue // the finally clears this attempt's timer; next iteration retries with the contact UA
          }
          throw new Error(`HTTP ${res.status}`)
        }
        const xml = await res.text()
        if (!isSupportedFeedDocument(xml)) throw new Error('unrecognized feed payload')
        if (feedEntryCountExceeds(xml, RSS_DOCUMENT_ENTRY_CEILING)) {
          throw new Error(`feed entry ceiling exceeded (${RSS_DOCUMENT_ENTRY_CEILING})`)
        }
        // The ceiling was checked against raw opening entries, so this parses the entire supported document.
        // Never advance an ETag after consuming only an arbitrary prefix: anything after that prefix would be
        // permanently hidden by the publisher's next 304.
        const items = parseFeed(xml, RSS_DOCUMENT_ENTRY_CEILING, endpoint)
        // Parsing must succeed before a response validator becomes a candidate. Otherwise a malformed body
        // can mutate `cache`, the retry sends that new ETag, and a 304 erases the only chance to read the feed.
        const etag = res.headers.get('etag')
        const lastModified = res.headers.get('last-modified')
        if (etag || lastModified) cache[endpoint] = { etag: etag || undefined, lastModified: lastModified || undefined }
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
            source_name: feed.source_name,
            snippet: it.snippet || undefined,
          })
        }
        rec(feed, arts.length ? 'ok' : 'empty', arts.length, undefined, endpoint)
        return arts
      } catch (e: any) {
        // A TIMEOUT (AbortError) does not retry: a feed that didn't answer within timeoutMs almost never
        // answers on an immediate 2nd/3rd try — that just burns another 1-2× timeoutMs per dead feed every
        // cycle (the dominant cost behind the 480s cycle-guard aborts). The next ~5-min cycle retries it
        // anyway (conditional-GET, so a recovered feed costs one 304). Transient connection/HTTP errors
        // ('fetch failed', HTTP 5xx) still get the full 3-attempt backoff.
        const isTimeout = e?.name === 'AbortError'
        if (isTimeout || attempt === 3) {
          const note = isTimeout ? 'timeout' : e?.message || String(e)
          if (endpointIdx + 1 < endpoints.length) {
            log(`rss ${feed.source_name || feed.url}: ${note} on primary endpoint; trying configured fallback`)
            endpointIdx++
            attempt = 1
            ua = feed.user_agent || defaultUa
            triedContact = ua === CONTACT_UA
            continue
          }
          log(`rss ${feed.source_name || feed.url}: ${note}, gave up`)
          rec(feed, 'error', 0, note, endpoint)
          return []
        }
        await sleep(1000 * attempt)
        attempt++
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

  // A URL is not a revision identity. Preserve same-look corrections/reversals, while collapsing an exact
  // title+URL observation repeated by mirrors. Use the identical key again across the durable handoff.
  const out: RawArticle[] = []
  const seenCurrent = new Set<string>()
  for (const a of collected) {
    const key = deliveryKey(a)
    if (!seenCurrent.has(key)) {
      seenCurrent.add(key)
      out.push(a)
    }
  }
  const recovered: RawArticle[] = []
  const seenDelivery = new Set<string>()
  for (const a of [...delivery.rows, ...out]) {
    const key = deliveryKey(a)
    if (seenDelivery.has(key)) continue
    seenDelivery.add(key)
    recovered.push(a)
  }
  // Rows and their candidate validators land in one durable handoff. rss-cache.json is deliberately
  // untouched here: acknowledgeRssDeliveries commits it only after runCycle has its own durable copy.
  // A rolled-back binary therefore re-fetches rather than advancing past rows it cannot recover.
  if (!writeDeliveryJournal(opts.stateDir, recovered, cache)) {
    log(`rss: delivery journal refused ${recovered.length} row(s) — conditional cache left unchanged`)
  }
  recordRssHealth(opts.stateDir, health, now().toISOString().replace(/\.\d{3}Z$/, 'Z'))
  return recovered
}
