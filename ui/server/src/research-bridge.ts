// Screener wire → research data bridge.
//
// A wire event that matters to a company the user is actively researching becomes a NOTE in that
// subject's data pool (`data/<TICKER>/screener_event_<EVENT_ID>.md`) — the exact pattern
// /screener:handoff established for thesis memos. Everything downstream is the EXISTING doc-intake
// machinery: the pool watcher sees the new file, the research tab lights up, auto-intake writes the
// scoped rerun plan, and the IntakeDock shows the affected orbs. This module only builds the note;
// it never launches anything.
//
// Two ways in, one write path:
//   manual — the reader's "Send to research" action: the HUMAN asserts the event is relevant to a
//            subject the extractor couldn't name (a sector story like "Dubai housing sales fell 16%"
//            carries no EMAAR ticker, but the Emaar analyst knows it's evidence).
//   auto   — a material wire item whose extracted ticker matches a tracked subject is routed on
//            ingest (server.ts subscribes to the news bus). Free (no LLM); the paid intake analysis
//            stays governed by its own INTAKE_AUTO_ANALYZE + finished-run gates.
//
// Truth discipline: the note self-declares CLAUDE.md §4 tier 10 (dated web source, unverified) in its
// header — the same self-declaration the handoff memo makes at tier 9 — so /research:intake's tier
// rules (a single uncorroborated web claim defaults to note_only) apply unchanged. The engine's own
// enrichment read is included only when COMPLETE, and labelled as inference, never as the source.

import fs from 'node:fs'
import path from 'node:path'
import type { EventEnrichment } from './news/enrich'
import type { FeedItem } from './news/types'
import { listFirehoseDates, readDayItems } from './news/feed'
import { EVENT_ID_RE, isValidTicker, safeSubjectSegment } from './sandbox'
import { isReservedDataFolder } from './config'

export interface BridgeOpts {
  dataDir: string
  stateDir: string
  now?: () => Date
}

export interface BridgeResult {
  path: string // repo-relative-ish pool path (data/<T>/<note>) for display
  already: boolean
}

export interface BridgedLink {
  ticker: string
  path: string
}

export function eventNoteName(eventId: string): string {
  if (!EVENT_ID_RE.test(eventId)) throw Object.assign(new Error('bad event id'), { statusCode: 400 })
  return `screener_event_${eventId}.md`
}

// ---- wire lookup (server-authoritative, anti-poisoning) ------------------------------------------
// The note is always built from the event's OWN stored firehose record, never from client-supplied
// fields — same rule enrichEvent applies. Walks the date-rotated firehose (local inbox, then the
// Drive archive) newest-first, bounded, and stops at the first hit.

export function findWireItem(
  repoRoot: string,
  eventId: string,
  opts: { archiveDir?: string; maxDates?: number } = {},
): FeedItem | null {
  if (!EVENT_ID_RE.test(eventId)) return null
  const archiveDir = opts.archiveDir || ''
  const maxDates = Math.max(1, opts.maxDates ?? 21)
  for (const date of listFirehoseDates(repoRoot, archiveDir).slice(0, maxDates)) {
    const { items } = readDayItems(repoRoot, date, archiveDir)
    const hit = items.find((it) => it.event_id === eventId)
    if (hit) return hit
  }
  return null
}

// ---- note rendering -------------------------------------------------------------------------------

// Length-cap a field and strip control characters (keep newlines for the quoted story block).
const cap = (s: string | null | undefined, n: number): string => {
  const t = String(s ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim()
  return t.length > n ? `${t.slice(0, n)}…` : t
}

// Third-party text (headline, article lede) is quoted line-by-line so it reads as SOURCE MATERIAL,
// never as the note's own voice — the analyst agents treat pool documents as data, and the quoting
// keeps that boundary visible.
const quote = (s: string): string =>
  s.split('\n').map((ln) => `> ${ln.trim()}`).filter((ln) => ln !== '>').join('\n')

export interface RenderNoteOpts {
  item: FeedItem
  ticker: string
  mode: 'manual' | 'auto'
  user: string
  enrichment?: EventEnrichment | null
  now?: () => Date
}

export function renderEventNote(o: RenderNoteOpts): string {
  const { item } = o
  const nowIso = (o.now ? o.now() : new Date()).toISOString()
  const headline = cap(item.headline, 400)
  const headlineEn = item.headline_en && item.headline_en !== item.headline ? cap(item.headline_en, 400) : ''
  const enr = o.enrichment && o.enrichment.ok !== false ? o.enrichment : null

  const routedLine =
    o.mode === 'manual'
      ? `- Routed to ${o.ticker}: manually from the cockpit by ${cap(o.user, 120) || 'local'} on ${nowIso} — the analyst asserted this event bears on the subject (the wire itself extracted no matching ticker).`
      : `- Routed to ${o.ticker}: automatically on ${nowIso} — the wire's extracted ticker matched this tracked subject.`

  const screenerRead = [
    typeof item.triage_score === 'number' ? `score ${item.triage_score} (${item.band} band)` : '',
    item.relevance ? `relevance ${item.relevance}` : '',
    item.scope ? `scope ${item.scope}` : '',
    item.event_types?.length ? `event types: ${item.event_types.slice(0, 4).join(', ')}` : '',
    item.country ? `country ${item.country}` : '',
  ].filter(Boolean).join(' · ')

  const namedCompanies = (item.companies || [])
    .slice(0, 6)
    .map((c) => `${cap(c.name, 80)}${c.ticker ? ` (${cap(c.ticker, 16)})` : ''}`)
    .join(', ')

  const lines: string[] = [
    `# Wire event: ${headline}`,
    '',
    '> Engine-routed news event from the screener wire — treat as a dated web-sourced input',
    '> (CLAUDE.md §4 tier 10: web source, clearly dated, labelled unverified). Not a filing.',
    '> Any claim below that would move a conclusion must first be corroborated against a filing',
    '> or a second independent source (frameworks/INTAKE.md tier discipline).',
    '',
    `- Event id: ${item.event_id}`,
    `- Source: ${cap(item.source_name, 120) || 'unknown'}${item.domain ? ` (${cap(item.domain, 120)})` : ''} — via ${cap(item.via, 20) || 'wire'}`,
    `- Wire timestamp: ${cap(item.ts, 40)}${enr?.published ? ` · published ${cap(enr.published, 40)}` : ''}`,
    `- URL: ${cap(item.url, 500) || '(none recorded)'}`,
    routedLine,
  ]
  if (screenerRead) lines.push(`- Screener read: ${screenerRead}`)
  if (namedCompanies) lines.push(`- Companies the wire named: ${namedCompanies}`)

  lines.push('', '## Headline (verbatim)', '', quote(headline))
  if (headlineEn) lines.push('', `English translation: ${headlineEn}`)

  const story = cap(item.snippet, 4000)
  if (story) lines.push('', '## Story, as carried by the source (verbatim lede)', '', quote(story))

  if (enr) {
    const eLines: string[] = []
    if (enr.summary) eLines.push(`- Summary: ${cap(enr.summary, 800)}`)
    for (const g of (enr.gist || []).slice(0, 6)) eLines.push(`- ${cap(g, 400)}`)
    if (enr.market_angle) eLines.push(`- Market angle: ${cap(enr.market_angle, 500)}`)
    const listParties = (label: string, ps?: { name: string; mechanism?: string; basis?: string }[]) => {
      for (const p of (ps || []).slice(0, 4)) {
        const why = cap((p as any).mechanism || (p as any).basis, 300)
        eLines.push(`- ${label}: ${cap(p.name, 100)}${why ? ` — ${why}` : ''}`)
      }
    }
    listParties('Gains', enr.beneficiaries as any)
    listParties('Exposed', enr.exposed as any)
    if (enr.whats_priced) eLines.push(`- What the market likely already prices: ${cap(enr.whats_priced, 500)}`)
    if (enr.the_edge) eLines.push(`- Possible non-consensus angle: ${cap(enr.the_edge, 500)}`)
    if (enr.watch_item) eLines.push(`- Watch item: ${cap(enr.watch_item, 300)}`)
    if (enr.corroborated) eLines.push(`- Corroboration: pieced together from ${enr.corroborated.count} other outlet(s) (${enr.corroborated.domains.slice(0, 4).join(', ')}) — secondary-wire read, not the original page.`)
    if (eLines.length) {
      lines.push(
        '',
        '## Screener enrichment (the engine’s own article read — inference, not from filings)',
        '',
        ...eLines,
      )
    }
    if (enr.related?.length) {
      lines.push('', '## Related wire coverage (possible corroboration leads)', '')
      for (const r of enr.related.slice(0, 6)) {
        lines.push(`- ${cap(r.headline, 200)} — ${cap(r.source_name, 80)} (${cap(r.event_id, 20)}, ${cap(r.ts, 40)})`)
      }
    }
  }

  lines.push(
    '',
    '---',
    `Cite as: \`Web: ${cap(item.source_name, 120) || 'wire source'}, ${String(item.ts || '').slice(0, 10)} (${item.event_id}, indicative, unverified)\`.`,
    'Figures above are transcribed verbatim from the wire record; the article, not this note, is the source (§5).',
  )
  return lines.join('\n') + '\n'
}

// ---- the write path -------------------------------------------------------------------------------

function audit(stateDir: string, rec: Record<string, unknown>): void {
  try {
    fs.mkdirSync(stateDir, { recursive: true })
    fs.appendFileSync(path.join(stateDir, 'research-bridge.ndjson'), JSON.stringify(rec) + '\n')
  } catch {
    // the audit line is best-effort — losing it never fails the routing itself
  }
}

export function bridgeEventToSubject(o: {
  item: FeedItem
  ticker: string
  mode: 'manual' | 'auto'
  user: string
  userVia: string
  enrichment?: EventEnrichment | null
  opts: BridgeOpts
}): BridgeResult {
  const seg = safeSubjectSegment(o.ticker) // throws 400 on anything that isn't provably one path segment
  if (isReservedDataFolder(seg)) throw Object.assign(new Error('reserved data folder'), { statusCode: 400 })
  const noteName = eventNoteName(o.item.event_id) // throws 400 on a malformed event id
  const dir = path.join(o.opts.dataDir, seg)
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
    throw Object.assign(new Error(`unknown subject ${seg} — no data/${seg}/ pool`), { statusCode: 400 })
  }
  const fp = path.join(dir, noteName)
  const rel = `data/${seg}/${noteName}`
  if (fs.existsSync(fp)) return { path: rel, already: true }

  const md = renderEventNote({ item: o.item, ticker: seg, mode: o.mode, user: o.user, enrichment: o.enrichment, now: o.opts.now })
  // The temp file lives in the SAME directory (data/ is a Drive/FUSE mount — a cross-device rename
  // would EXDEV) and starts with a dot so the pool scanners (which skip dot-files) never count it.
  const tmp = path.join(dir, `.${noteName}.tmp.${process.pid}`)
  fs.writeFileSync(tmp, md)
  fs.renameSync(tmp, fp)
  audit(o.opts.stateDir, {
    v: 1,
    ts: (o.opts.now ? o.opts.now() : new Date()).toISOString(),
    event_id: o.item.event_id,
    ticker: seg,
    path: rel,
    mode: o.mode,
    user: o.user,
    userVia: o.userVia,
    headline: cap(o.item.headline, 200),
    triage_score: o.item.triage_score ?? null,
  })
  return { path: rel, already: false }
}

/** Every tracked subject this event has already been routed to (drives the "✓ sent" rows). */
export function listBridgedSubjects(eventId: string, dataDir: string): BridgedLink[] {
  if (!EVENT_ID_RE.test(eventId)) return []
  const noteName = eventNoteName(eventId)
  const out: BridgedLink[] = []
  let names: string[] = []
  try {
    names = fs.readdirSync(dataDir)
  } catch {
    return []
  }
  for (const n of names) {
    if (n.startsWith('.') || !isValidTicker(n) || isReservedDataFolder(n)) continue
    try {
      if (fs.existsSync(path.join(dataDir, n, noteName))) out.push({ ticker: n, path: `data/${n}/${noteName}` })
    } catch {
      /* a vanished dir mid-scan is fine */
    }
  }
  return out
}

// ---- automatic routing on ingest --------------------------------------------------------------------

/** Is this wire item material enough to enter a research pool without a human click?
 *  Conservative on purpose: the pool is evidence, not a news feed. Kill switch SCREENER_RESEARCH_BRIDGE=0
 *  (default on, matching the sibling default-on INTAKE_AUTO_ANALYZE); floor tunable via
 *  SCREENER_RESEARCH_BRIDGE_MIN_SCORE (default 60). */
export function shouldAutoBridge(item: FeedItem): boolean {
  if (process.env.SCREENER_RESEARCH_BRIDGE === '0') return false
  if (item.caution) return false // caution-only social chatter never seeds an evidence pool
  if (item.source_tier === 'social') return false
  if (item.relevance !== 'material') return false
  const raw = Number(process.env.SCREENER_RESEARCH_BRIDGE_MIN_SCORE)
  const min = Number.isFinite(raw) && raw >= 0 ? raw : 60
  return (item.triage_score ?? 0) >= min
}

/** Tracked subjects whose pool folder matches one of the item's extracted tickers — exact symbol first,
 *  then the pre-suffix base (EMAAR.DU → EMAAR), since pool folders use the bare symbol. */
export function matchTrackedSubjects(item: FeedItem, dataDir: string): string[] {
  const candidates = new Set<string>()
  for (const c of item.companies || []) {
    if (!c?.ticker) continue
    const u = String(c.ticker).toUpperCase().trim()
    if (u) candidates.add(u)
    const base = u.split('.')[0]
    if (base) candidates.add(base)
  }
  const out: string[] = []
  for (const t of candidates) {
    if (!isValidTicker(t) || isReservedDataFolder(t)) continue
    try {
      if (fs.statSync(path.join(dataDir, t)).isDirectory()) out.push(t)
    } catch {
      /* not a tracked subject */
    }
  }
  return out.sort()
}

/** Route one freshly-ingested wire item into every matching tracked subject's pool. Never throws —
 *  a bridge miss loses one note, never the ingest cycle. Returns the subjects it wrote to. */
export function autoBridgeItem(item: FeedItem, opts: BridgeOpts, enrichment?: EventEnrichment | null): string[] {
  const written: string[] = []
  try {
    if (!shouldAutoBridge(item)) return written
    for (const ticker of matchTrackedSubjects(item, opts.dataDir)) {
      try {
        const res = bridgeEventToSubject({ item, ticker, mode: 'auto', user: 'auto', userVia: 'local', enrichment, opts })
        if (!res.already) written.push(ticker)
      } catch {
        /* per-subject best-effort */
      }
    }
  } catch {
    /* never break the caller (the news bus fan-out) */
  }
  return written
}
