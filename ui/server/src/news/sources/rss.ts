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

export interface RssOptions {
  feedsPath: string // absolute path to the versioned feed list (frameworks/screener/rss_feeds.json)
  lookbackMin: number // items older than 3× this are skipped (RSS has no timespan parameter)
  timeoutMs: number
  stateDir: string // where the conditional-GET cache lives
  userAgent?: string
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

/** The item's outbound link: RSS puts it in <link>text</link>; Atom in <link href> (prefer rel="alternate"). */
function linkOf(block: string): string | null {
  const rssText = /<link[^>]*>([^<]+)<\/link>/i.exec(block)
  if (rssText && rssText[1].trim().startsWith('http')) return decodeEntities(rssText[1].trim())
  const linkTags = block.match(/<link\b[^>]*>/gi) || []
  let fallback: string | null = null
  for (const tag of linkTags) {
    const href = /href\s*=\s*["']([^"']+)["']/i.exec(tag)?.[1]
    if (!href) continue
    const rel = /rel\s*=\s*["']([^"']+)["']/i.exec(tag)?.[1]
    if (!rel || rel === 'alternate') return decodeEntities(href)
    if (!fallback) fallback = decodeEntities(href)
  }
  return fallback
}

function dateOf(block: string): string | null {
  return textOf(block, 'pubDate') || textOf(block, 'published') || textOf(block, 'updated') || textOf(block, 'dc:date')
}

/** Parse one RSS 2.0 or Atom document into raw articles. Tolerant by construction: a malformed
 *  entry yields nothing rather than an error. Exported for the test suite. */
export function parseFeed(xml: string, maxItems = 60): { title: string; link: string; date: string | null }[] {
  const out: { title: string; link: string; date: string | null }[] = []
  // entry blocks: RSS <item>…</item>, Atom <entry>…</entry>
  const blocks = xml.split(/<(?:item|entry)[\s>]/i).slice(1)
  for (const rawBlock of blocks.slice(0, maxItems)) {
    const block = rawBlock.split(/<\/(?:item|entry)>/i)[0]
    const title = textOf(block, 'title')
    const link = linkOf(block)
    if (!title || !link || !/^https?:\/\//i.test(link)) continue
    out.push({ title, link, date: dateOf(block) })
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
  const userAgent = opts.userAgent || 'nostra-demus-screener/1.0 (news ingester)'

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

  const perFeed = await Promise.allSettled(
    feeds.map(async (feed): Promise<RawArticle[]> => {
      for (let attempt = 1; attempt <= 3; attempt++) {
        const ctrl = new AbortController()
        const timer = setTimeout(() => ctrl.abort(), opts.timeoutMs)
        try {
          const headers: Record<string, string> = { 'user-agent': userAgent, accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml' }
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
          const items = parseFeed(xml)
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
    }),
  )

  saveCache(opts.stateDir, cache)

  const out: RawArticle[] = []
  const seen = new Set<string>()
  for (const r of perFeed) {
    if (r.status !== 'fulfilled') continue // isolation: a feed's terminal failure was already logged
    for (const a of r.value) {
      if (!seen.has(a.url)) {
        seen.add(a.url)
        out.push(a)
      }
    }
  }
  return out
}
