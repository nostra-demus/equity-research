// The watchlist: names you are waiting on, and the price you are waiting for.
//
// It is ONE list built from two contributors. The engine already decides which names it holds no
// position in — /research:size writes them to analyses/portfolio/<date>_sizing.json as prose triggers
// ("Track at $190-200 for re-entry") that nothing in the cockpit has ever displayed. The human adds the
// names the engine has never looked at, and turns prose into conditions a machine can actually check.
//
// Two rules shape the whole module:
//
//  1. MEMBERSHIP COMES FROM THE STANDING LEDGER, NOT FROM sizing.json. That file carries no currency
//     (so its rows could never be priced), it repeats a ticker when two runs are standing (UBER appears
//     twice in 2026-08-16), and `/research:size AMZN` writes a ONE-NAME watch[]. listAllCalls() already
//     drops superseded runs, applies errata and resolves post-mortem overrides, and it carries the
//     currency/entry price a quote needs. So the ledger decides WHO is on the list; sizing.json only
//     decorates each row with the engine's own written trigger.
//
//  2. THE ENGINE'S PROSE IS NEVER PARSED INTO A CONDITION. "Track at $190-200" is written for a human.
//     Mining a number out of it would manufacture an un-cited, un-dated figure carrying engine
//     authority — the §3/§5 failure. Engine rows are reminder-only until a human adopts one by adding a
//     real trigger, which is the whole point of the surface.
//
// Persistence is one file per USER-TOUCHED entry under the git-tracked watchlist/ folder. A pure engine
// row is never written to disk; a file appears the moment you give the row a reason, a trigger or an
// archive. That means regenerating any engine artifact can never conflict with user state, and two
// machines editing different rows write non-overlapping paths that git merges without a conflict.
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { ANALYSES_DIR, REPO_ROOT } from './config'
import { cleanTicker, normTicker } from './news/symbology'
import { normCurrency } from './news/equity-quote'
import type { AbsentReason, LiveQuote } from './news/equity-quote'

export const WATCHLIST_DIR = path.join(REPO_ROOT, 'watchlist')
export const WATCHLIST_ENTRIES_DIR = path.join(WATCHLIST_DIR, 'entries')
export const WATCHLIST_MAX_ROWS = 500
export const WATCHLIST_MAX_TRIGGERS = 6
export const WATCHLIST_MAX_ATTACHMENTS = 5
export const WATCHLIST_MAX_TAGS = 12

/** `WL-YYYYMMDD-<8 hex>`. Random, never content-hashed: archive → restore → archive inside one second
 *  must not collide (the reasoning screener-actions.ts:56 already records for its own ids). */
export const WATCH_ID_RE = /^WL-[0-9]{8}-[a-f0-9]{8}$/

// ---------- shapes ----------

export type TriggerKind = 'price_level' | 'pct_drop' | 'valuation_mos' | 'event_date'
export type TriggerDirection = 'at_or_below' | 'at_or_above'
/** Three-valued on purpose. If "cannot be checked" is not its own state it renders as "not met" — a
 *  false negative stated as fact (§3). */
export type EvalState = 'condition_met' | 'not_met' | 'not_evaluable'

export interface PriceLevelTrigger {
  kind: 'price_level'
  trigger_id: string
  /** Explicit, NEVER inferred from the verdict: the ledger carries a Short Candidate, and guessing
   *  "below = good" fires a short's trigger backwards. */
  direction: TriggerDirection
  level: number
  currency: string
  note?: string
}
export interface PctDropTrigger {
  kind: 'pct_drop'
  trigger_id: string
  drop_pct: number
  /** FROZEN at save time — a materialised number, date and source, never a live pointer. A drifting
   *  reference can never be reached in a rising market and silently redefines itself (§19). */
  reference: { value: number; currency: string; as_of: string | null; source: string }
  note?: string
}
export interface ValuationMosTrigger {
  kind: 'valuation_mos'
  trigger_id: string
  /** Pinned. Following "the latest run" would change what the trigger MEANS with no record of it. */
  run_root: string
  scenario_label: string
  anchor_value: number
  anchor_currency: string
  anchor_as_of: string | null
  required_mos_pct: number
  direction: TriggerDirection
  note?: string
}
export interface EventDateTrigger {
  kind: 'event_date'
  trigger_id: string
  due_date: string
  label: string
  acknowledged_at?: string | null
  note?: string
}
export type WatchTrigger = PriceLevelTrigger | PctDropTrigger | ValuationMosTrigger | EventDateTrigger

export interface WatchAttachment {
  attachment_id: string
  filename: string
  bytes: number
  added_at: string
  added_by: string
}

export interface WatchListing {
  ticker: string
  ticker_raw: string
  currency: string | null
  exchange: string | null
  company_name: string | null
  /** `TICKER|CURRENCY` — the merge key. Same ticker in a different currency is a different security
   *  (§16: a fair value derived on one line is not a fair value on another), so it never merges. */
  listing_key: string
}

export interface WatchEngineRef {
  run_root: string
  decision: string | null
  decision_date: string | null
  /** sha256-12 over run_root|decision|size_in_trigger|next_review. Archiving mutes THIS assertion; a
   *  changed one re-surfaces. */
  fingerprint: string
}

export interface WatchArchive {
  at: string
  by: string
  reason: string
  muted_fingerprint: string | null
  /** 'assertion' re-surfaces when the engine changes its view; 'listing' is an opt-in permanent mute. */
  mute_scope: 'assertion' | 'listing'
}

export interface WatchEntry {
  schema_version: 'watchlist-entry/v1'
  entry_id: string
  origin: 'manual' | 'engine'
  listing: WatchListing
  engine_ref: WatchEngineRef | null
  why: string
  conviction: 'high' | 'medium' | 'low' | null
  review_date: string | null
  tags: string[]
  triggers: WatchTrigger[]
  attachments: WatchAttachment[]
  archive: WatchArchive | null
  history: { at: string; by: string; action: string; detail: string }[]
  created_at: string
  created_by: string
  updated_at: string
}

/** One engine call worth watching, projected from the standing ledger + decorated with sizing prose. */
export interface EngineWatchRow {
  listing: WatchListing
  run_root: string
  decision: string | null
  decision_date: string | null
  /** The engine's own words. Displayed verbatim, never parsed. */
  size_in_trigger: string | null
  next_review: string | null
  entry_price: number | null
  final_thesis_path: string | null
  fingerprint: string
}

export interface TriggerEval {
  trigger_id: string
  kind: TriggerKind
  mode: 'auto' | 'reminder'
  state: EvalState
  /** The arithmetic, in words, so "not met" is checkable rather than trusted (§15). */
  detail: string
  reason: AbsentReason | 'no_reference' | 'currency_mismatch_trigger' | 'no_anchor' | null
  due?: boolean
}

export type RowState = 'condition_met' | 'due' | 'armed' | 'not_evaluable' | 'watching'

export interface MergedWatchRow {
  listing_key: string
  ticker: string
  company_name: string | null
  currency: string | null
  exchange: string | null
  origin: 'engine' | 'manual' | 'both'
  entry_id: string | null
  why: string
  conviction: WatchEntry['conviction']
  review_date: string | null
  tags: string[]
  triggers: WatchTrigger[]
  attachments: WatchAttachment[]
  engine: EngineWatchRow | null
  /** Set when an archived engine row came back because the engine changed what it says. */
  resurfaced: boolean
  archive: WatchArchive | null
  quote: LiveQuote | null
  quote_reason: AbsentReason | null
  evals: TriggerEval[]
  state: RowState
  run_root: string | null
  final_thesis_path: string | null
}

// ---------- identity ----------

export function listingKey(ticker: unknown, currency: unknown): string {
  const t = normTicker(cleanTicker(ticker) ?? String(ticker ?? ''))
  const c = normCurrency(currency == null ? null : String(currency))
  return `${t}|${c || ''}`
}

export function makeListing(input: {
  ticker: unknown
  currency?: unknown
  exchange?: unknown
  companyName?: unknown
}): WatchListing {
  const raw = String(input.ticker ?? '').trim()
  const ticker = normTicker(cleanTicker(raw) ?? raw)
  const currency = normCurrency(input.currency == null ? null : String(input.currency)) || null
  return {
    ticker,
    ticker_raw: raw,
    currency,
    exchange: input.exchange ? String(input.exchange).trim() : null,
    company_name: input.companyName ? String(input.companyName).trim() : null,
    listing_key: `${ticker}|${currency || ''}`,
  }
}

export function fingerprintEngineRow(parts: {
  run_root: string
  decision?: string | null
  size_in_trigger?: string | null
  next_review?: string | null
}): string {
  const s = [parts.run_root, parts.decision ?? '', parts.size_in_trigger ?? '', parts.next_review ?? '']
    .map((x) => String(x).replace(/\s+/g, ' ').trim())
    .join('|')
  return `sha256:${crypto.createHash('sha256').update(s).digest('hex').slice(0, 12)}`
}

export function newEntryId(now: Date = new Date()): string {
  const d = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
  return `WL-${d}-${crypto.randomBytes(4).toString('hex')}`
}
export const isWatchId = (s: unknown): s is string => typeof s === 'string' && WATCH_ID_RE.test(s)

// ---------- store ----------

/** Every entry on disk. Tolerant by design: one unreadable file degrades ONE row, it never throws and
 *  never empties the list — the keep-scanning posture standingRunDir already takes. */
export function readEntries(dir: string = WATCHLIST_ENTRIES_DIR): { entries: WatchEntry[]; unreadable: string[] } {
  const entries: WatchEntry[] = []
  const unreadable: string[] = []
  let names: string[] = []
  try {
    names = fs.readdirSync(dir).filter((n) => n.endsWith('.json'))
  } catch {
    return { entries, unreadable }
  }
  for (const n of names.sort()) {
    try {
      const j = JSON.parse(fs.readFileSync(path.join(dir, n), 'utf8'))
      // A row without a usable listing has no identity: every consumer keys on listing_key, so letting
      // it through turns "degrades one row" into a 500 for the whole read.
      const ok = j && typeof j === 'object' && !Array.isArray(j)
        && typeof j.entry_id === 'string'
        && j.listing && typeof j.listing === 'object' && typeof j.listing.listing_key === 'string' && j.listing.listing_key
      if (ok) entries.push(j as WatchEntry)
      else unreadable.push(n)
    } catch {
      unreadable.push(n)
    }
  }
  return { entries, unreadable }
}

/** Atomic: tmp then rename, so a crash mid-write can never leave a half-parsed entry behind. */
export function writeEntry(entry: WatchEntry, dir: string = WATCHLIST_ENTRIES_DIR): void {
  fs.mkdirSync(dir, { recursive: true })
  const file = path.join(dir, `${entry.entry_id}.json`)
  const tmp = `${file}.tmp-${process.pid}`
  fs.writeFileSync(tmp, JSON.stringify(entry, null, 2) + '\n')
  fs.renameSync(tmp, file)
}

export function deleteEntry(entryId: string, dir: string = WATCHLIST_ENTRIES_DIR): void {
  try { fs.rmSync(path.join(dir, `${entryId}.json`), { force: true }) } catch { /* already gone */ }
}

// ---------- the engine's half ----------

/** Baskets that mean "we hold no position", per size.md §2 and DECISION_LEDGER.md's decision→basket
 *  table. Selected and Short are the two that DO carry a position; everything else is on watch. */
const POSITION_BASKETS = new Set(['Selected', 'Short'])

interface SizingWatchRow { ticker?: unknown; decision?: unknown; size_in_trigger?: unknown; next_review?: unknown }

/**
 * The newest sizing file worth trusting. Scoped runs (`/research:size AMZN`) write a one-name watch[],
 * so anything but a whole-book run is skipped; a corrupt file falls through to the next-newest rather
 * than taking the decoration down. Sorted by the in-file generated_at, because size.md mandates a `_v2`
 * suffix when today's file already exists and filename order stops being reliable at `_v10`.
 */
export function readSizingDecoration(analysesDir: string = ANALYSES_DIR): {
  file: string | null
  generated_at: string | null
  byTicker: Map<string, SizingWatchRow[]>
} {
  const empty = { file: null, generated_at: null, byTicker: new Map<string, SizingWatchRow[]>() }
  const dir = path.join(analysesDir, 'portfolio')
  let names: string[] = []
  try {
    // `_v2` suffix when today's file already exists (size.md §6) — a re-run's book must not be invisible
    names = fs.readdirSync(dir).filter((n) => /_sizing(_v\d+)?\.json$/.test(n))
  } catch {
    return empty
  }
  const parsed: { name: string; at: string; watch: SizingWatchRow[] }[] = []
  for (const n of names) {
    try {
      const j = JSON.parse(fs.readFileSync(path.join(dir, n), 'utf8'))
      const scope = String(j?.scope ?? '').trim()
      if (scope && scope !== 'all') continue // a scoped run's watch[] is not the whole book
      if (!Array.isArray(j?.watch)) continue
      parsed.push({ name: n, at: String(j?.generated_at ?? n.slice(0, 10)), watch: j.watch as SizingWatchRow[] })
    } catch {
      continue // corrupt — keep scanning older files
    }
  }
  if (!parsed.length) return empty
  parsed.sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : a.name < b.name ? 1 : -1))
  const top = parsed[0]
  const byTicker = new Map<string, SizingWatchRow[]>()
  for (const row of top.watch) {
    const t = normTicker(String(row?.ticker ?? ''))
    if (!t) continue
    const list = byTicker.get(t) ?? []
    list.push(row)
    byTicker.set(t, list)
  }
  return { file: top.name, generated_at: top.at, byTicker }
}

/** Shape of the standing-ledger entries this module consumes. Structural so the caller can hand in
 *  listAllCalls().calls directly, and a test can hand in a literal. */
export interface StandingCall {
  ticker: string
  company?: string | null
  currency?: string | null
  basket?: string | null
  decision?: string | null
  decision_date?: string | null
  entry_price?: number | null
  run_root: string
  final_thesis_path?: string | null
  next_checkpoint?: { due_date?: string | null } | null
}

/**
 * Which standing calls are on watch, decorated with the engine's own trigger prose.
 *
 * Membership is the UNION of two rules, and the union is deliberate: the basket rule is the floor that
 * stays correct when the sizing file is stale, scoped or missing, while the sizing file additionally
 * carries names the sizing skill excluded for reasons this layer cannot re-derive (no proven edge, a
 * provisional integrity status, a pre-mortem that did not survive) — listAllCalls does not read
 * expectations_gap or pre_mortem, so that judgment is taken as given rather than guessed at.
 */
export function readEngineWatch(
  calls: StandingCall[],
  decoration: ReturnType<typeof readSizingDecoration>,
): EngineWatchRow[] {
  const rows: EngineWatchRow[] = []
  const seen = new Set<string>()
  for (const c of calls) {
    const t = normTicker(String(c.ticker ?? ''))
    if (!t) continue
    const basket = String(c.basket ?? '').trim()
    const inSizing = decoration.byTicker.has(t)
    if (!inSizing && POSITION_BASKETS.has(basket)) continue // holds a position and the book agrees
    // Two standing runs for one ticker are two distinct calls (UBER, 2026-08-16). Keep the newest —
    // the ledger sorts newest-first — but never silently drop one by keying a Map on the ticker alone.
    if (seen.has(t)) continue
    seen.add(t)
    const deco = decoration.byTicker.get(t)?.[0]
    const size_in_trigger = deco?.size_in_trigger == null ? null : String(deco.size_in_trigger)
    const next_review = deco?.next_review == null ? (c.next_checkpoint?.due_date ?? null) : String(deco.next_review)
    rows.push({
      listing: makeListing({ ticker: t, currency: c.currency, companyName: c.company }),
      run_root: c.run_root,
      decision: c.decision ?? null,
      decision_date: c.decision_date ?? null,
      size_in_trigger,
      next_review,
      entry_price: typeof c.entry_price === 'number' ? c.entry_price : null,
      final_thesis_path: c.final_thesis_path ?? null,
      fingerprint: fingerprintEngineRow({ run_root: c.run_root, decision: c.decision, size_in_trigger, next_review }),
    })
  }
  return rows
}

// ---------- trigger evaluation ----------

const r2 = (n: number) => Math.round(n * 100) / 100
const pct1 = (n: number) => Math.round(n * 10) / 10

export interface EvalContext {
  quote: LiveQuote | null
  quoteReason: AbsentReason | null
  today: string
}

/**
 * One trigger against today. Every auto trigger that cannot be checked returns `not_evaluable` carrying
 * the concrete reason — it NEVER falls through to "not met", which would state a false negative as fact.
 */
export function evaluateTrigger(t: WatchTrigger, ctx: EvalContext): TriggerEval {
  const base = { trigger_id: t.trigger_id, kind: t.kind } as const

  if (t.kind === 'event_date') {
    const due = t.acknowledged_at ? false : t.due_date <= ctx.today
    return {
      ...base,
      mode: 'reminder',
      state: 'not_met', // a date is never "met" — it comes due, and only a human clears it
      detail: t.acknowledged_at
        ? `${t.label} — acknowledged ${t.acknowledged_at.slice(0, 10)}`
        : due
          ? `${t.label} — due ${t.due_date}`
          : `${t.label} — ${t.due_date}`,
      reason: null,
      due,
    }
  }

  const q = ctx.quote
  if (!q) {
    return { ...base, mode: 'auto', state: 'not_evaluable', detail: 'No live price to check against.', reason: ctx.quoteReason }
  }

  // The trigger's currency and the quote's must be the same measurement. There is no FX module here, and
  // converting would need a rate and a date the row does not carry (§15) — so it refuses instead.
  const want =
    t.kind === 'price_level' ? t.currency : t.kind === 'pct_drop' ? t.reference.currency : t.anchor_currency
  if (normCurrency(want) !== normCurrency(q.currency)) {
    return {
      ...base,
      mode: 'auto',
      state: 'not_evaluable',
      detail: `Set in ${want}, priced in ${q.currency} — comparing them needs an FX rate and date this row does not carry.`,
      reason: 'currency_mismatch_trigger',
    }
  }

  if (t.kind === 'price_level') {
    const met = t.direction === 'at_or_below' ? q.price <= t.level : q.price >= t.level
    const gap = pct1(((q.price - t.level) / t.level) * 100)
    return {
      ...base,
      mode: 'auto',
      state: met ? 'condition_met' : 'not_met',
      detail: met
        ? `${money(q.currency, q.price)} is ${t.direction === 'at_or_below' ? 'at or below' : 'at or above'} ${money(t.currency, t.level)}`
        : `${money(q.currency, q.price)} is ${Math.abs(gap)}% ${gap > 0 ? 'above' : 'below'} ${money(t.currency, t.level)}`,
      reason: null,
    }
  }

  if (t.kind === 'pct_drop') {
    if (!(t.reference.value > 0)) {
      return { ...base, mode: 'auto', state: 'not_evaluable', detail: 'The reference price is missing or not positive.', reason: 'no_reference' }
    }
    const threshold = r2(t.reference.value * (1 - t.drop_pct / 100))
    const met = q.price <= threshold
    const fell = pct1(((t.reference.value - q.price) / t.reference.value) * 100)
    return {
      ...base,
      mode: 'auto',
      state: met ? 'condition_met' : 'not_met',
      detail: `${t.drop_pct}% below ${money(t.reference.currency, t.reference.value)}${t.reference.as_of ? ` (${t.reference.as_of})` : ''} = ${money(t.reference.currency, threshold)}; now ${money(q.currency, q.price)}, ${fell >= 0 ? 'down' : 'up'} ${Math.abs(fell)}%`,
      reason: null,
    }
  }

  // valuation_mos
  if (!(t.anchor_value > 0)) {
    return { ...base, mode: 'reminder', state: 'not_evaluable', detail: 'No fair value is pinned to this trigger.', reason: 'no_anchor' }
  }
  const mos = pct1(((t.anchor_value - q.price) / t.anchor_value) * 100)
  const met = t.direction === 'at_or_below' ? mos >= t.required_mos_pct : -mos >= t.required_mos_pct
  return {
    ...base,
    mode: 'auto',
    state: met ? 'condition_met' : 'not_met',
    detail: `(${money(t.anchor_currency, t.anchor_value)} − ${money(q.currency, q.price)}) ÷ ${t.anchor_value} = ${mos}% vs ${t.required_mos_pct}% required`,
    reason: null,
  }
}

function money(currency: string | null | undefined, v: number): string {
  return `${(currency || '').trim()} ${v.toFixed(2)}`.trim()
}

/** What the row says at a glance. Anything actionable outranks anything quiet. */
export function rollupState(evals: TriggerEval[]): RowState {
  if (!evals.length) return 'watching'
  if (evals.some((e) => e.state === 'condition_met')) return 'condition_met'
  if (evals.some((e) => e.due)) return 'due'
  if (evals.some((e) => e.state === 'not_met' && e.mode === 'auto')) return 'armed'
  if (evals.some((e) => e.state === 'not_evaluable')) return 'not_evaluable'
  return 'watching'
}

/**
 * The entry a listing_key means. Two live entries for one listing are only reachable by hand-editing the
 * folder, but when it happens the merge and the archive button must pick the SAME one — otherwise the
 * button acts on a row that is not on screen and appears to do nothing. Newest by created_at wins.
 */
export function pickEntryForListing(entries: WatchEntry[], key: string): WatchEntry | null {
  let best: WatchEntry | null = null
  for (const e of entries) {
    if (e.listing?.listing_key !== key) continue
    if (!best || String(e.created_at) > String(best.created_at)) best = e
  }
  return best
}

/**
 * Reject a trigger set that asks the same question twice. The UI disables the buttons, but a body can
 * arrive from anywhere, and a redundant trigger is not harmless: whichever is looser fires first and the
 * row then shows two chips saying the same thing, one of which can never be the reason it fired.
 *
 * Repeats that ARE meaningful stay allowed: several dated reminders on one name is ordinary, and a price
 * floor plus a ceiling are two different questions (which is why direction is stored, not inferred).
 */
export function triggerSetProblem(triggers: { kind: TriggerKind; direction?: TriggerDirection }[]): string | null {
  const count = (k: TriggerKind) => triggers.filter((t) => t.kind === k).length
  if (count('pct_drop') > 1) return 'only one drop-from-reference trigger per row'
  if (count('valuation_mos') > 1) return 'only one margin-of-safety trigger per row'
  const levels = triggers.filter((t) => t.kind === 'price_level')
  if (levels.length > 2) return 'at most two price levels per row'
  if (levels.length === 2 && levels[0].direction === levels[1].direction) {
    return 'two price levels must point in different directions'
  }
  return null
}

// ---------- the merge ----------

export interface MergeInput {
  entries: WatchEntry[]
  engine: EngineWatchRow[]
  quotes?: Map<string, { quote: LiveQuote | null; reason: AbsentReason | null }>
  today: string
}

/**
 * One list from two contributors.
 *
 * Rows join on `listing_key` (ticker AND currency), never on the ticker alone: the same symbol in a
 * different currency is a different security, so those stay two rows rather than being merged into one
 * that would show the wrong company's price.
 *
 * The ARCHIVE RULE lives here. Archiving mutes one engine ASSERTION, identified by its fingerprint:
 *   - the same call, regenerated identically day after day -> stays archived, silently
 *   - the engine rewords its trigger, or a new run supersedes it -> the row RE-SURFACES, badged
 *   - mute_scope 'listing' -> stays hidden regardless, and says so in the archive view
 * Muting the ticker outright would hide the moment the engine decides you were wrong, which is the §8
 * failure; keying on the source date would resurface everything daily, because the standing ledger is
 * frequently byte-identical to yesterday's.
 */
export function mergeWatchlist(input: MergeInput): { rows: MergedWatchRow[]; archived: MergedWatchRow[] } {
  const byKey = new Map<string, WatchEntry>()
  for (const e of input.entries) {
    const k = e.listing?.listing_key
    if (k && !byKey.has(k)) byKey.set(k, pickEntryForListing(input.entries, k)!)
  }

  const rows: MergedWatchRow[] = []
  const archived: MergedWatchRow[] = []
  const usedEntries = new Set<string>()

  const build = (
    listing: WatchListing,
    entry: WatchEntry | null,
    engine: EngineWatchRow | null,
  ): MergedWatchRow => {
    const q = input.quotes?.get(listing.listing_key) ?? { quote: null, reason: null }
    const triggers = entry?.triggers ?? []
    const evals = triggers.map((t) => evaluateTrigger(t, { quote: q.quote, quoteReason: q.reason, today: input.today }))
    const arch = entry?.archive ?? null
    // Re-surface test: the archive muted a specific assertion; if the engine now says something else,
    // the mute no longer applies to what is on screen.
    const resurfaced = !!(
      arch && engine && arch.mute_scope === 'assertion' && arch.muted_fingerprint && arch.muted_fingerprint !== engine.fingerprint
    )
    return {
      listing_key: listing.listing_key,
      ticker: listing.ticker,
      company_name: entry?.listing.company_name ?? listing.company_name ?? engine?.listing.company_name ?? null,
      currency: listing.currency,
      exchange: entry?.listing.exchange ?? listing.exchange ?? null,
      origin: entry && engine ? 'both' : engine ? 'engine' : 'manual',
      entry_id: entry?.entry_id ?? null,
      why: entry?.why ?? '',
      conviction: entry?.conviction ?? null,
      review_date: entry?.review_date ?? engine?.next_review ?? null,
      tags: entry?.tags ?? [],
      triggers,
      attachments: entry?.attachments ?? [],
      engine,
      resurfaced,
      archive: arch,
      quote: q.quote,
      quote_reason: q.reason,
      evals,
      state: rollupState(evals),
      run_root: engine?.run_root ?? null,
      final_thesis_path: engine?.final_thesis_path ?? null,
    }
  }

  for (const eng of input.engine) {
    const entry = byKey.get(eng.listing.listing_key) ?? null
    if (entry) usedEntries.add(entry.entry_id)
    const row = build(eng.listing, entry, eng)
    // archived stays archived unless the engine changed what it says (or the row was never muted)
    if (row.archive && !row.resurfaced) archived.push(row)
    else rows.push(row)
  }

  for (const e of input.entries) {
    if (usedEntries.has(e.entry_id) || !e.listing?.listing_key) continue
    if (byKey.get(e.listing.listing_key)?.entry_id !== e.entry_id) continue // superseded duplicate
    const row = build(e.listing, e, null)
    if (row.archive) archived.push(row)
    else rows.push(row)
  }

  const rank: Record<RowState, number> = { condition_met: 0, due: 1, armed: 2, not_evaluable: 3, watching: 4 }
  rows.sort((a, b) => {
    if (rank[a.state] !== rank[b.state]) return rank[a.state] - rank[b.state]
    const ar = a.review_date ?? '9999-12-31'
    const br = b.review_date ?? '9999-12-31'
    if (ar !== br) return ar < br ? -1 : 1
    return a.ticker < b.ticker ? -1 : a.ticker > b.ticker ? 1 : 0
  })
  archived.sort((a, b) => String(b.archive?.at ?? '').localeCompare(String(a.archive?.at ?? '')))
  return { rows, archived }
}
