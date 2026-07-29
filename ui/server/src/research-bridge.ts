// Screener wire → research data bridge.
//
// A wire event that matters to a company the user is actively researching becomes a NOTE in that
// subject's data pool (`data/<TICKER>/screener_event_<EVENT_ID>.md`) — the exact pattern
// /screener:handoff established for thesis memos. Everything downstream is the EXISTING doc-intake
// machinery: the pool watcher sees the new file, the research tab lights up, the intake analysis
// writes the scoped rerun plan, and the IntakeDock shows the affected orbs. This module only builds
// the note; it never launches anything.
//
// MANUAL-FIRST by design. The reader's "Send to research" action is the primary path: the HUMAN
// asserts the event is relevant to a subject (a sector story like "Dubai housing sales fell 16%"
// carries no EMAAR ticker, but the Emaar analyst knows it's evidence), and the click is the §24
// consent for the follow-up intake analysis. Every send is recorded in the bridge ledger
// (.state/research-bridge.ndjson: event, ticker, score, headline, who) — that ledger is the
// TRAINING CORPUS for the eventual automatic mode: what the humans chose to route is the ground
// truth for what auto-routing should learn to send, so no garbage gets in while it learns.
// The automatic ticker-match path exists but ships OFF — opt in with SCREENER_RESEARCH_BRIDGE=1
// once the manual ledger says it can be trusted.
//
// Noise discipline: one note per STORY per subject — syndicated copies of the same story (shared
// `dedup_group`, different event_ids across outlets) dedupe against the notes already in the pool,
// so re-sending the CBS copy of a story already routed via the Globe & Mail is a no-op that points
// at the existing note.
//
// Truth discipline: the note self-declares CLAUDE.md §4 tier 10 (dated web source, unverified) in its
// header — the same self-declaration the handoff memo makes at tier 9 — so /research:intake's tier
// rules (a single uncorroborated web claim defaults to note_only) apply unchanged. The engine's own
// enrichment read is included only when COMPLETE, and labelled as inference, never as the source.

import fs from 'node:fs'
import path from 'node:path'
import type { EventEnrichment } from './news/enrich'
import type { FeedItem } from './news/types'
import { findFeedItemByEventId } from './news/feed'
import { EVENT_ID_RE, isValidTicker, safeSubjectSegment } from './sandbox'
import { BRIDGE_MODE, isReservedDataFolder } from './config'

export interface BridgeOpts {
  dataDir: string
  stateDir: string
  now?: () => Date
}

export interface BridgeResult {
  path: string // repo-relative-ish pool path (data/<T>/<note>) for display
  already: boolean
  // set when `already` is because ANOTHER outlet's copy of the same story (same dedup_group) is
  // already in the pool — the client words its toast differently for a cluster duplicate
  duplicateOf?: string
}

export interface BridgedLink {
  ticker: string
  path: string
}

const NOTE_RE = /^screener_event_(EVT-[0-9a-f]{12})\.md$/

export function eventNoteName(eventId: string): string {
  if (!EVENT_ID_RE.test(eventId)) throw Object.assign(new Error('bad event id'), { statusCode: 400 })
  return `screener_event_${eventId}.md`
}

// ---- wire lookup (server-authoritative, anti-poisoning) ------------------------------------------
// The note is always built from the event's OWN stored firehose record, never from client-supplied
// fields — same rule enrichEvent applies. Delegates to feed.ts's line-scan finder, which walks the
// full date-rotated firehose (local inbox + Drive archive) as deep as the reader's own archive
// search can display, so anything the user can OPEN can also be sent.

export function findWireItem(
  repoRoot: string,
  eventId: string,
  opts: { archiveDir?: string; maxDates?: number } = {},
): FeedItem | null {
  if (!EVENT_ID_RE.test(eventId)) return null
  return findFeedItemByEventId(repoRoot, eventId, opts)
}

// ---- note rendering -------------------------------------------------------------------------------

// Single-line field: strip ALL control characters (newlines included) and collapse whitespace, so a
// hostile wire field (a URL or headline carrying "\n- Routed to ...") can never inject a fake line,
// heading, or provenance claim into the note. Then length-cap.
const cap = (s: string | null | undefined, n: number): string => {
  const t = String(s ?? '').replace(/[\u0000-\u001F\u007F]/g, ' ').replace(/ +/g, ' ').trim()
  return t.length > n ? `${t.slice(0, n)}…` : t
}

// Block field (the quoted story text only): keep newlines — quote() re-prefixes every line — but
// strip every other control character and carriage returns.
const capBlock = (s: string | null | undefined, n: number): string => {
  const t = String(s ?? '')
    .replace(/\r\n?/g, '\n')
    .replace(/[\u0000-\u0009\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
  return t.length > n ? `${t.slice(0, n)}…` : t
}

// Third-party text (headline, article lede) is quoted line-by-line so it reads as SOURCE MATERIAL,
// never as the note's own voice — the analyst agents treat pool documents as data, and the quoting
// keeps that boundary visible.
const quote = (s: string): string =>
  s.split('\n').map((ln) => `> ${ln.trim()}`).filter((ln) => ln !== '>').join('\n')

// Does the wire's own extraction name this subject? (exact symbol, or its pre-suffix base — EMAAR.DU
// names EMAAR). Used only to keep the note's provenance line truthful.
function wireNamesTicker(item: FeedItem, ticker: string): boolean {
  return (item.companies || []).some((c) => {
    const u = String(c?.ticker || '').toUpperCase().trim()
    return u === ticker || (u.includes('.') && u.split('.')[0] === ticker)
  })
}

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

  const namedByWire = wireNamesTicker(item, o.ticker)
  const routedLine =
    o.mode === 'manual'
      ? `- Routed to ${o.ticker}: manually from the cockpit by ${cap(o.user, 120) || 'local'} on ${nowIso} — ${namedByWire ? 'the analyst confirmed a company the wire itself names.' : 'the analyst asserted this event bears on the subject (the wire itself named no matching ticker; the link is analyst judgment).'}`
      : `- Routed to ${o.ticker}: automatically on ${nowIso} — the wire's extracted ticker matched this tracked subject exactly.`

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

  // the article's own publication date beats the engine's triage time for the citation (§5); fall
  // back to the wire timestamp, which is when the scanner READ it, not when the outlet published it
  const citeDate = (enr?.published || '').slice(0, 10) || String(item.ts || '').slice(0, 10)

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
    `- Wire timestamp (when the scanner read it): ${cap(item.ts, 40)}${enr?.published ? ` · published ${cap(enr.published, 40)}` : ''}`,
    `- URL: ${cap(item.url, 500) || '(none recorded)'}`,
    routedLine,
  ]
  if (item.dedup_group) lines.push(`- Story cluster: ${cap(item.dedup_group, 40)}`)
  if (screenerRead) lines.push(`- Screener read: ${screenerRead}`)
  if (namedCompanies) lines.push(`- Companies the wire named: ${namedCompanies}`)

  lines.push('', '## Headline (verbatim)', '', quote(headline))
  if (headlineEn) lines.push('', `English translation: ${headlineEn}`)

  const story = capBlock(item.snippet, 4000)
  if (story) lines.push('', '## Story, as carried by the source (verbatim lede)', '', quote(story))

  if (enr) {
    const eLines: string[] = []
    if (enr.summary) eLines.push(`- Summary: ${cap(enr.summary, 800)}`)
    for (const g of (enr.gist || []).slice(0, 6)) eLines.push(`- ${cap(g, 400)}`)
    if (enr.market_angle) eLines.push(`- Market angle: ${cap(enr.market_angle, 500)}`)
    const listParties = (label: string, ps?: { name: string; mechanism?: string; basis?: string }[]) => {
      for (const p of (ps || []).slice(0, 4)) {
        const why = cap(p.mechanism || p.basis, 300)
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
        '## Screener enrichment (the engine’s own article read — inference, §6 level 1; engine-derived, NOT verbatim source text)',
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
    `Cite as: \`Web: ${cap(item.source_name, 120) || 'wire source'}, ${citeDate} (${item.event_id}, indicative, unverified)\`.`,
    'Only the quoted Headline / Story blocks are verbatim from the wire record; the enrichment section is the engine’s own derived read. The article, not this note, is the source (§5).',
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

/** Is another outlet's copy of the SAME story (shared dedup_group) already in this pool? Returns the
 *  existing note if so — one story, one note, however many outlets carried it. */
function findClusterDuplicate(dir: string, seg: string, item: FeedItem, noteName: string): BridgeResult | null {
  const cluster = String(item.dedup_group || '').trim()
  if (!cluster) return null
  let names: string[] = []
  try {
    names = fs.readdirSync(dir)
  } catch {
    return null
  }
  for (const f of names) {
    const m = NOTE_RE.exec(f)
    if (!m || f === noteName) continue
    try {
      if (fs.readFileSync(path.join(dir, f), 'utf8').includes(`- Story cluster: ${cluster}`)) {
        return { path: `data/${seg}/${f}`, already: true, duplicateOf: m[1] }
      }
    } catch {
      /* unreadable note — skip */
    }
  }
  return null
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
  const dup = findClusterDuplicate(dir, seg, o.item, noteName)
  if (dup) return dup

  const md = renderEventNote({ item: o.item, ticker: seg, mode: o.mode, user: o.user, enrichment: o.enrichment, now: o.opts.now })
  // The temp file lives in the SAME directory (data/ is a Drive/FUSE mount — a cross-device rename
  // would EXDEV) and starts with a dot so the pool scanners (which skip dot-files) never count it.
  // random suffix (not just pid) — two concurrent sends for the SAME event+ticker in the same process
  // would otherwise share one tmp name and race on write/rename.
  //
  // The move onto `fp` is a HARD LINK, not a rename: a plain rename always succeeds and would silently
  // CLOBBER a note another writer created between our existence/dedup checks above and this line — the
  // exact race a manual "Send to research" click, a stream-mode delivery, and this batch sweep can all
  // hit against the SAME pool. fs.linkSync is atomic AND exclusive: it throws EEXIST if `fp` now exists,
  // so the loser here reports `already: true` instead of overwriting the winner's note (Codex review,
  // PR #359). The temp file is written in full first, so the eventual link still hands the pool a
  // complete file, never a partial one.
  const tmp = path.join(dir, `.${noteName}.tmp.${process.pid}.${Math.random().toString(36).slice(2)}`)
  try {
    fs.writeFileSync(tmp, md)
    try {
      fs.linkSync(tmp, fp)
    } catch (e: any) {
      if (e?.code === 'EEXIST') return { path: rel, already: true }
      throw e
    }
  } finally {
    try { fs.unlinkSync(tmp) } catch { /* best-effort cleanup either way (linked-away or still there) */ }
  }
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
    dedup_group: o.item.dedup_group || null,
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
 *  OPT-IN: the automatic path ships OFF (SCREENER_RESEARCH_BRIDGE=1 enables it). The manual sends —
 *  recorded in the bridge ledger — are the training data that earns auto-routing its trust first.
 *  When enabled, still conservative: the pool is evidence, not a news feed. Floor tunable via
 *  SCREENER_RESEARCH_BRIDGE_MIN_SCORE (default 60). */
export function shouldAutoBridge(item: FeedItem): boolean {
  // BRIDGE_MODE is authoritative, and the two routing paths NEVER run together (config.ts contract):
  //  - 'batch' → the 12-hourly sweep owns routing, so this per-item path is OFF, even if a stale
  //    SCREENER_RESEARCH_BRIDGE=1 is still set (that combination used to double-route every item and defeat
  //    the two-windows-a-day analysis cap — Codex #359 r3673683041).
  //  - 'stream' → this per-item path is ON (the mode alone enables it; the legacy flag no longer has to be
  //    set too, which is what made 'stream' silently inert before — Codex #359 r3673607345).
  //  - 'off'/unset → back-compat: the path is governed by the legacy SCREENER_RESEARCH_BRIDGE=1 flag alone.
  if (BRIDGE_MODE === 'batch') return false
  if (BRIDGE_MODE !== 'stream' && process.env.SCREENER_RESEARCH_BRIDGE !== '1') return false
  if (item.caution) return false // caution-only social chatter never seeds an evidence pool
  if (item.source_tier === 'social') return false
  if (item.relevance !== 'material') return false
  const raw = Number(process.env.SCREENER_RESEARCH_BRIDGE_MIN_SCORE)
  const min = Number.isFinite(raw) && raw >= 0 ? raw : 60
  return (item.triage_score ?? 0) >= min
}

/** Tracked subjects whose pool folder matches one of the item's extracted tickers — EXACT symbol
 *  only. The unattended path never suffix-strips (EMAAR.DU ↛ EMAAR): bare-symbol collisions across
 *  exchanges would route company A's news into company B's evidence pool with no human in the loop.
 *  The manual menu (where a human confirms) is where the looser match belongs. */
export function matchTrackedSubjects(item: FeedItem, dataDir: string): string[] {
  const candidates = new Set<string>()
  for (const c of item.companies || []) {
    const u = String(c?.ticker || '').toUpperCase().trim()
    if (u) candidates.add(u)
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
 *  a bridge miss loses one note, never the ingest cycle. `getEnrichment` is a THUNK so the (whole-
 *  cache-parsing) peek only runs for the handful of items that pass the gates, never per wire item.
 *  Returns the subjects it wrote to. */
export function autoBridgeItem(item: FeedItem, opts: BridgeOpts, getEnrichment?: () => EventEnrichment | null): string[] {
  const written: string[] = []
  try {
    if (!shouldAutoBridge(item)) return written
    const matched = matchTrackedSubjects(item, opts.dataDir)
    if (!matched.length) return written
    let enrichment: EventEnrichment | null = null
    try {
      enrichment = getEnrichment?.() ?? null
    } catch {
      enrichment = null
    }
    for (const ticker of matched) {
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
