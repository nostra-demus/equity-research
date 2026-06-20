// Reddit subreddits as a DISCOVERY / SENTIMENT signal — the lowest-trust layer of the ingestion stack.
// Items land in the `social` source tier (scope.ts) and are hard-capped to the `watch` band in
// runCycle.ts (never a `pick`; CLAUDE.md §4/§24). reddit.com is on the ingestion firewall
// (approved-domains.ts) but deliberately NOT on the gauntlet's Gate-0 promotion list, so a Reddit-only
// signal can never drive a thesis — it must find an on-list corroborating source (M0.1).
//
// Reddit blocks automated access aggressively, so this is built for resilience: a descriptive contact
// User-Agent (Reddit bans generic/empty UAs), a per-subreddit fallback chain (www.reddit -> old.reddit
// -> a public mirror), a cross-cycle 429 penalty-box (mirrors gdelt.ts), slow per-host pacing, and
// no-retry on timeout. Reuses the dependency-free parseFeed from rss.ts — no new parser. Never throws:
// any failure degrades to fewer items + a log line. The firewall still gates every item by its domain
// (forced to reddit.com here), so an off-list mirror can never smuggle a non-Reddit item onto the wire.

import fs from 'node:fs'
import type { RawArticle } from '../types'
import { parseFeed, CONTACT_UA, RSS_ACCEPT } from './rss'

export interface RedditOptions {
  feedsPath: string // absolute path to frameworks/screener/reddit_feeds.json
  lookbackHours: number // items older than this are skipped (Atom feeds have no timespan parameter)
  timeoutMs: number
  perHostGapMs?: number // pause between subreddit fetches (all share host reddit.com) — default 2000ms
  mirrorTemplate?: string // public-mirror URL with a {sub} placeholder, used as the last fallback
  cycleMs?: number // length of one ingest cycle (for the 429 penalty-box); production-only
  backoffCyclesOn429?: number // cycles to skip the reddit.com hosts after a 429
}

export interface RedditDeps {
  fetchFn?: typeof fetch
  sleep?: (ms: number) => Promise<void>
  now?: () => Date
  log?: (m: string) => void
}

interface SubFeed {
  subreddit: string
  source_name?: string
  role?: string
  region?: string
  caution_only?: boolean
}

const realSleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

// Statuses that mean "reddit.com is blocking/throttling THIS IP" (not a per-feed glitch). Observed live:
// a tripped IP gets a 403 block PAGE (a ~185KB HTML body, not a feed) or a 429 rate-limit; 451 is the
// legal-block variant. Any of these on a reddit host trips the cross-cycle penalty-box so the IP can cool.
const REDDIT_BLOCK_STATUSES = new Set([403, 429, 451])

// Module-level cross-cycle 429 penalty-box (persists via the long-lived scheduler), mirroring gdelt.ts.
// Only set/read when cycleMs + backoffCyclesOn429 are supplied (production); unit tests pass neither.
let redditSkipUntilMs = 0
/** Test hook: clear the cross-cycle Reddit backoff so cases don't leak into each other. */
export function resetRedditBackoff(): void {
  redditSkipUntilMs = 0
}

/** Canonicalize any subreddit-post link (www/old.reddit, or a mirror that preserves the path) to a
 *  stable https://www.reddit.com/r/<sub>/comments/... permalink when one is recoverable, else return
 *  the link unchanged. The firewall gates on the RawArticle.domain we force to 'reddit.com', NOT this
 *  URL — so a mirror link that can't be canonicalized still passes, it just links to the mirror. */
export function canonicalRedditUrl(link: string): string {
  try {
    const u = new URL(link)
    // a reddit permalink path is /r/<sub>/comments/<id>/<slug>/ — recover it from any host
    const m = /\/r\/[^/]+\/comments\/[^/?#]+(?:\/[^/?#]*)?/i.exec(u.pathname)
    if (m) return 'https://www.reddit.com' + m[0]
    if (/(^|\.)reddit\.com$/i.test(u.hostname)) return 'https://www.reddit.com' + u.pathname
    return link
  } catch {
    return link
  }
}

function readSubs(feedsPath: string, log: (m: string) => void): SubFeed[] {
  try {
    const doc = JSON.parse(fs.readFileSync(feedsPath, 'utf8'))
    const rows = Array.isArray(doc?.subreddits) ? doc.subreddits : []
    return rows.filter((r: unknown): r is SubFeed => typeof (r as SubFeed)?.subreddit === 'string' && !!(r as SubFeed).subreddit.trim())
  } catch {
    log(`reddit: feed list missing/unreadable at ${feedsPath} — skipping the Reddit layer`)
    return []
  }
}

/**
 * Pull each configured subreddit's recent posts and return raw articles tagged via:'reddit', with the
 * domain forced to reddit.com (so the firewall + `social` tier apply regardless of which host served
 * the feed). Sequential with a politeness gap — all subs share one host. Never throws.
 */
export async function fetchReddit(opts: RedditOptions, deps: RedditDeps = {}): Promise<RawArticle[]> {
  const fetchFn = deps.fetchFn || fetch
  const sleep = deps.sleep || realSleep
  const now = deps.now || (() => new Date())
  const log = deps.log || (() => {})
  const perHostGapMs = opts.perHostGapMs ?? 2000
  const backoffEnabled = !!(opts.cycleMs && opts.backoffCyclesOn429)
  const subs = readSubs(opts.feedsPath, log)
  if (!subs.length) return []

  // If Reddit 429'd us recently, stay off the reddit.com hosts until the penalty decays — but still try
  // the public mirror (a different host), so the discovery layer degrades rather than going dark.
  const redditBlocked = backoffEnabled && now().getTime() < redditSkipUntilMs
  if (redditBlocked) {
    log(`reddit: penalty backoff — reddit.com hosts skipped (~${Math.ceil((redditSkipUntilMs - now().getTime()) / 60_000)} min left), mirror only`)
  }

  const mirrorOf = (sub: string): string | null => (opts.mirrorTemplate ? opts.mirrorTemplate.replace('{sub}', sub) : null)
  const oldestMs = now().getTime() - Math.max(1, opts.lookbackHours) * 3_600_000

  const out: RawArticle[] = []
  const seen = new Set<string>()
  // Once a reddit.com host blocks us — this cycle, or a prior cycle still inside the penalty window —
  // stop poking the reddit hosts for the REMAINING subreddits and go straight to the mirror. Re-hammering
  // an IP that's already throttling only deepens the block (the user's "don't get IP-banned" concern).
  let skipRedditHosts = redditBlocked

  for (let i = 0; i < subs.length; i++) {
    const feed = subs[i]
    const sub = feed.subreddit.trim()
    const sourceName = feed.source_name || `Reddit r/${sub}`
    const mirror = mirrorOf(sub)
    // endpoint chain: native -> old.reddit -> mirror. `skipReddit` is captured per-sub: the CURRENT sub
    // still runs its full chain (www blocked -> old.reddit is a real fallback on a different subdomain),
    // but once ANY reddit host blocked earlier in the cycle, the remaining subs go straight to the mirror.
    const endpoints = [`https://www.reddit.com/r/${sub}/new/.rss`, `https://old.reddit.com/r/${sub}/new/.rss`, ...(mirror ? [mirror] : [])]
    const skipReddit = skipRedditHosts

    let got: ReturnType<typeof parseFeed> | null = null
    for (const url of endpoints) {
      const isRedditHost = url.includes('reddit.com')
      if (skipReddit && isRedditHost) continue // a prior sub already hit an IP block — don't re-poke reddit
      const host = (() => { try { return new URL(url).hostname } catch { return url } })()
      // Explicit abort timer (the rss.ts pattern) so the signal stays armed through BOTH the fetch and
      // the res.text() body read — a mirror that sends headers then stalls the body can't hang the cycle.
      const ctrl = new AbortController()
      const timer = setTimeout(() => ctrl.abort(), opts.timeoutMs)
      try {
        const res = await fetchFn(url, { headers: { 'user-agent': CONTACT_UA, accept: RSS_ACCEPT }, signal: ctrl.signal })
        if (isRedditHost && REDDIT_BLOCK_STATUSES.has(res.status)) {
          // The IP is blocked/throttled — it won't clear in seconds, and poking it keeps the penalty
          // alive. Set the cross-cycle backoff (skip the reddit.com hosts for a few cycles so the IP can
          // cool), skip reddit hosts for the rest of THIS cycle too, and fall through to the mirror.
          if (backoffEnabled) redditSkipUntilMs = now().getTime() + opts.cycleMs! * opts.backoffCyclesOn429!
          skipRedditHosts = true
          log(`reddit r/${sub} (${host}): HTTP ${res.status} blocked${backoffEnabled ? ` — backing off reddit.com for ${opts.backoffCyclesOn429} cycles` : ''}; falling back`)
          continue
        }
        if (!res.ok) {
          log(`reddit r/${sub} (${host}): HTTP ${res.status}`)
          continue
        }
        const xml = await res.text()
        const items = parseFeed(xml, 60, url)
        if (items.length) { got = items; break } // an empty-but-200 feed falls through to the next endpoint
      } catch (err: unknown) {
        const e = err as { name?: string; message?: string }
        // A timeout (AbortError) won't answer on an immediate retry; network errors are transient. Either
        // way, no retry on the SAME host — fall through to the next endpoint; the next cycle re-pulls.
        log(`reddit r/${sub} (${host}): ${e?.name === 'AbortError' ? 'timeout' : e?.message || String(err)}`)
        continue
      } finally {
        clearTimeout(timer)
      }
    }

    if (got) {
      for (const it of got) {
        const d = it.date ? new Date(it.date) : null
        const fresh = !d || Number.isNaN(d.getTime()) || d.getTime() >= oldestMs
        if (!fresh) continue
        const url = canonicalRedditUrl(it.link)
        if (seen.has(url)) continue
        seen.add(url)
        out.push({
          title: it.title,
          url,
          domain: 'reddit.com', // forced — the firewall + `social` tier fire regardless of serving host
          seendate: d && !Number.isNaN(d.getTime()) ? d.toISOString().replace(/\.\d{3}Z$/, 'Z') : now().toISOString().replace(/\.\d{3}Z$/, 'Z'),
          via: 'reddit',
          source_name: sourceName,
          snippet: feed.caution_only
            ? `[retail crowding / euphoria — caution input, not a source] ${it.snippet || ''}`.trim()
            : it.snippet || undefined,
        })
      }
    }

    if (i < subs.length - 1) await sleep(perHostGapMs)
  }

  return out
}
