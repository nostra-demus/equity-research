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
import { BRIDGE_MODE, BRIDGE_MODE_EXPLICIT_OFF, isReservedDataFolder } from './config'

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
  /** How an AUTO route found this subject. 'ticker' (default) = the wire's extracted symbol matched;
   *  'name' = no ticker matched and the wire named the company. Recorded because the two carry different
   *  strength, and the note is the reader's only evidence of which one happened. */
  matchedBy?: 'ticker' | 'name'
  /** For a 'name' route: the wire company name that actually matched. Passed in rather than re-derived,
   *  because the note must quote the company that MATCHED — picking the first ticker-less company would
   *  put "Wildberries" on an AMZN note whenever the wire named several. A false provenance claim in the
   *  one line whose whole job is provenance (§5). */
  matchedName?: string
}

export function renderEventNote(o: RenderNoteOpts): string {
  const { item } = o
  const nowIso = (o.now ? o.now() : new Date()).toISOString()
  const headline = cap(item.headline, 400)
  const headlineEn = item.headline_en && item.headline_en !== item.headline ? cap(item.headline_en, 400) : ''
  const enr = o.enrichment && o.enrichment.ok !== false ? o.enrichment : null

  const namedByWire = wireNamesTicker(item, o.ticker)
  // An auto-route that matched on the company NAME must not claim it matched a ticker — the reader uses
  // this line to judge how firm the link is, and a name match is the weaker of the two (§5).
  const autoWhy =
    o.matchedBy === 'name'
      ? `the wire extracted no ticker, but named this tracked subject's company exactly ("${cap(o.matchedName || '', 80)}").`
      : "the wire's extracted ticker matched this tracked subject exactly."
  const routedLine =
    o.mode === 'manual'
      ? `- Routed to ${o.ticker}: manually from the cockpit by ${cap(o.user, 120) || 'local'} on ${nowIso} — ${namedByWire ? 'the analyst confirmed a company the wire itself names.' : 'the analyst asserted this event bears on the subject (the wire itself named no matching ticker; the link is analyst judgment).'}`
      : `- Routed to ${o.ticker}: automatically on ${nowIso} — ${autoWhy}`

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
  matchedBy?: 'ticker' | 'name'
  matchedName?: string
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

  const md = renderEventNote({ item: o.item, ticker: seg, mode: o.mode, user: o.user, enrichment: o.enrichment, matchedBy: o.matchedBy, matchedName: o.matchedName, now: o.opts.now })
  // Claim `fp` itself with an exclusive create: a plain rename always succeeds and would silently CLOBBER
  // a note another writer created between our existence/dedup checks above and this line — the exact race
  // a manual "Send to research" click, a stream-mode delivery, and this batch sweep can all hit against
  // the SAME pool. A prior fix used fs.linkSync (atomic AND exclusive on a normal filesystem), but the
  // deployed pool is a Google Drive Stream mount (scripts/ops/MIGRATION.md) whose FUSE layer does not
  // support POSIX hard links — every note would fail with EPERM/ENOTSUP in production, silently disabling
  // routing entirely (Codex #359 P1). 'wx' (O_CREAT|O_EXCL) is the same portable exclusive-create the
  // repo's own singleton-lock.ts already relies on: it throws EEXIST if `fp` now exists, so the loser here
  // reports `already: true` instead of overwriting the winner's note, and it works the same on a
  // Drive/FUSE mount as on local disk — no hard link, no temp file, no cross-device rename involved.
  let fd: number
  try {
    fd = fs.openSync(fp, 'wx')
  } catch (e: any) {
    if (e?.code === 'EEXIST') return { path: rel, already: true }
    throw e
  }
  try {
    fs.writeSync(fd, md)
  } finally {
    fs.closeSync(fd)
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
/** Is the per-item auto-route path enabled AT ALL, independent of any single item's own eligibility?
 *  Same authoritative BRIDGE_MODE contract shouldAutoBridge enforces below — split out and exported so a
 *  status surface (the bridge scheduler's getBridgeStatus) can report whether unattended per-item routing
 *  is actually live, instead of only knowing about the batch loop's own timer. Before this, the status
 *  endpoint reported `running: false` (and the cockpit chip said "News bridge off") even while
 *  BRIDGE_MODE=stream was actively routing every material item, since 'running' only ever looked at the
 *  batch scheduler (Codex #359, "Report stream mode as active without the legacy flag"). */
export function isPerItemBridgeActive(): boolean {
  // BRIDGE_MODE is authoritative, and the two routing paths NEVER run together (config.ts contract):
  //  - 'batch' → the 12-hourly sweep owns routing, so this per-item path is OFF, even if a stale
  //    SCREENER_RESEARCH_BRIDGE=1 is still set (that combination used to double-route every item and defeat
  //    the two-windows-a-day analysis cap — Codex #359 r3673683041).
  //  - 'stream' → this per-item path is ON (the mode alone enables it; the legacy flag no longer has to be
  //    set too, which is what made 'stream' silently inert before — Codex #359 r3673607345).
  //  - explicit 'off' → a hard kill switch: disables this path too, even if the legacy flag is still set
  //    (an operator who explicitly writes BRIDGE_MODE=off must not have unattended routing keep running
  //    behind their back — Codex #359 r3674305117).
  //  - unset → back-compat: the path is governed by the legacy SCREENER_RESEARCH_BRIDGE=1 flag alone.
  if (BRIDGE_MODE === 'batch') return false
  if (BRIDGE_MODE_EXPLICIT_OFF) return false
  return BRIDGE_MODE === 'stream' || process.env.SCREENER_RESEARCH_BRIDGE === '1'
}

export function shouldAutoBridge(item: FeedItem): boolean {
  if (!isPerItemBridgeActive()) return false
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
export function matchTrackedSubjects(
  item: FeedItem,
  dataDir: string,
  /** Canonical company name per tracked subject (e.g. AMZN -> "Amazon.com, Inc."). When supplied, an item
   *  whose wire enrichment extracted NO matching ticker may still match a subject by NAME. Omitted =>
   *  today's ticker-only behaviour exactly, so no existing caller changes semantics. */
  subjectNames?: Record<string, string>,
): string[] {
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
  if (out.length || !subjectNames) return out.sort()

  // NAME FALLBACK — only when no ticker matched, so a good ticker match is never overridden.
  // The wire's enrichment guesses companies from the headline and often names the company WITHOUT a
  // symbol: Fortune's "Andy Jassy said Amazon will spend $220 billion this year" came through as
  // `Amazon · giant company · US` with ticker null, scored 89 and material, and was silently dropped
  // while the same day's "…Sold $25 Billion in Bonds" (tagged `Amazon · AMZN`) routed fine. Dropping a
  // covered company's material news because an upstream guesser omitted the symbol is a miss, not a
  // safety property. Matching is EXACT on the normalised name (never a substring), which keeps the
  // ticker-path's reason for strictness — "Amazon" must not reach a different Amazon-ish subject.
  // Length floor is 2, not something larger: matching is EXACT on the normalised name, so a short name
  // can only ever hit a subject whose own name normalises to the same short string. A bigger floor would
  // not add safety — it would permanently exclude real companies (BP, 3M, ABB, AXA, ING, UBS, SAP) from
  // ever matching by name. A single character is excluded as pure noise.
  // Restricted to companies the wire genuinely tagged with NO ticker. A company entry that carries a
  // ticker — even one that failed the strict pass above (wrong exchange suffix, a symbol that isn't
  // actually tracked) — must not fall through to the looser name match: that would let a rejected ticker
  // guess win anyway, defeat the exact-ticker safety rule the ticker pass exists to enforce, and the note
  // would still claim "the wire extracted no ticker" when it did (Codex #374 P1).
  const wanted = new Set(
    (item.companies || [])
      .filter((c) => !String(c?.ticker || '').trim())
      .map((c) => normaliseCompanyName(String(c?.name || '')))
      .filter((n) => n.length >= 2),
  )
  if (!wanted.size) return []
  const named: string[] = []
  for (const [t, name] of Object.entries(subjectNames)) {
    if (!isValidTicker(t) || isReservedDataFolder(t)) continue
    const n = normaliseCompanyName(name)
    if (n.length < 2 || !wanted.has(n)) continue
    // Prove the pool exists, exactly as the ticker path does above. The sweep happens to pass a map built
    // from already-filtered subjects, but this is an EXPORTED matcher: a caller with a stale alias map
    // would otherwise be handed a subject bridgeEventToSubject then rejects with "no data/<T>/ pool".
    // Asymmetric strictness between the two paths is a bug waiting for its caller.
    try {
      if (fs.statSync(path.join(dataDir, t)).isDirectory()) named.push(t.toUpperCase())
    } catch { /* not a tracked subject */ }
  }
  return named.sort()
}

/** Strip a company name to the part that identifies it, so a wire headline's "Amazon" matches a pool's
 *  "Amazon.com, Inc." and "Norsk Hydro" matches "Norsk Hydro ASA". Lowercased, punctuation dropped, and
 *  legal-form suffixes removed from the END only — never from the middle, where they can be part of the
 *  actual name, and never identity-bearing words like "Group" / "Holdings" (see SUFFIX below — those stay,
 *  because two different issuers can share everything but that word). Deliberately conservative: it
 *  normalises, it does not fuzzy-match. */
export function normaliseCompanyName(raw: string): string {
  let s = String(raw || '').toLowerCase()
  // Collapse a DOTTED acronym into one token before punctuation becomes whitespace, or "BP p.l.c." would
  // shatter into "bp p l c" and the suffix list — which knows "plc" — would never see it. Only runs of
  // single letters each followed by a period match, so "amazon.com" is untouched and still splits into
  // "amazon" + "com" for the suffix pass.
  s = s.replace(/\b(?:[a-z]\.){2,}/g, (m) => m.replace(/\./g, ''))
  s = s.replace(/&/g, ' and ').replace(/[.,''`"()\[\]]/g, ' ').replace(/[-/]/g, ' ')
  s = s.replace(/\s+/g, ' ').trim()
  // Deliberately EXCLUDES identity-bearing words — 'group' and 'holdings' foremost — for the same reason
  // news/symbology.ts's coreCompanyName does (see its comment): "Man Group PLC" and "MAN SE" must not
  // both collapse to "man". Stripping them let one issuer's tickerless name silently claim a DIFFERENT
  // issuer's research pool with no human in the loop (Codex #374 P1). 'the' is handled separately below
  // (leading only — the suffix pass only ever sees the END of the name).
  const SUFFIX = new Set([
    'inc', 'incorporated', 'corp', 'corporation', 'co', 'company', 'ltd', 'limited', 'plc', 'llc', 'lp',
    'sa', 'nv', 'bv', 'ag', 'asa', 'ab', 'oyj', 'as', 'spa', 'se', 'kk', 'pjsc', 'psc', 'jsc', 'pt', 'tbk',
    'com',
  ])
  const parts = s.split(' ').filter(Boolean)
  while (parts.length > 1 && SUFFIX.has(parts[parts.length - 1])) parts.pop()
  // ...and a LEADING article, which the suffix pass cannot reach: "The Coca-Cola Company" normalised to
  // "the coca cola" and so failed to match a wire naming plain "Coca-Cola". Same for Disney, Home Depot,
  // Kroger — a large class of names. Only stripped when something remains.
  while (parts.length > 1 && parts[0] === 'the') parts.shift()
  return parts.join(' ')
}

/** The wire company name that normalises to this subject's canonical name — i.e. the one that actually
 *  matched. Used only to keep a name-routed note's provenance line truthful (picking the first
 *  ticker-less company instead would put the wrong company's name on the note whenever the wire named
 *  several — §5). Lives here (not bridge-batch.ts) so both the batch sweep and the per-item stream path
 *  can share it without a circular import; bridge-batch.ts re-exports it for its existing callers. */
export function wireNameMatching(item: FeedItem, subjectName?: string): string | undefined {
  if (!subjectName) return undefined
  const target = normaliseCompanyName(subjectName)
  if (!target) return undefined
  for (const c of item.companies || []) {
    const raw = String(c?.name || '')
    if (raw && normaliseCompanyName(raw) === target) return raw
  }
  return undefined
}

/** Route one freshly-ingested wire item into every matching tracked subject's pool. Never throws —
 *  a bridge miss loses one note, never the ingest cycle. `getEnrichment` is a THUNK so the (whole-
 *  cache-parsing) peek only runs for the handful of items that pass the gates, never per wire item.
 *  `subjectNames` mirrors the batch sweep's alias map (canonical company name per tracked subject) — the
 *  caller supplies it (server.ts caches it briefly; see bridge-scheduler.ts's getBridgeSubjectNames), so a
 *  wire item naming a covered company with NO ticker can match here too, not only on the 12-hourly sweep
 *  (Codex #374 P2: this path silently lacked the fallback the batch path just gained). Omitted => ticker-
 *  only matching, exactly as before. Returns the subjects it wrote to. */
export function autoBridgeItem(
  item: FeedItem,
  opts: BridgeOpts,
  getEnrichment?: () => EventEnrichment | null,
  subjectNames?: Record<string, string>,
): string[] {
  const written: string[] = []
  try {
    if (!shouldAutoBridge(item)) return written
    // matchTrackedSubjects never mixes the two passes within one call: it returns the ticker matches alone
    // when there are any, and only falls through to the name pass (all-or-nothing) when there are none — so
    // one boolean covers every subject in `matched`, no per-subject re-derivation needed.
    const viaTicker = matchTrackedSubjects(item, opts.dataDir)
    const matched = viaTicker.length ? viaTicker : matchTrackedSubjects(item, opts.dataDir, subjectNames)
    if (!matched.length) return written
    const byName = !viaTicker.length && matched.length > 0
    let enrichment: EventEnrichment | null = null
    try {
      enrichment = getEnrichment?.() ?? null
    } catch {
      enrichment = null
    }
    for (const ticker of matched) {
      try {
        const res = bridgeEventToSubject({
          item, ticker, mode: 'auto', user: 'auto', userVia: 'local', enrichment,
          matchedBy: byName ? 'name' : 'ticker',
          matchedName: byName ? wireNameMatching(item, subjectNames?.[ticker]) : undefined,
          opts,
        })
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
