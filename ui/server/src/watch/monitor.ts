// The watchlist's clock. Every few minutes it prices every watched name, works out what each one says
// (evaluate.ts), turns what just changed into cockpit messages (alerts.ts → inbox.ts) and emails only the
// urgent ones (email.ts). It also makes sure every research name on the list has a watch plan, reading each
// report once (reader.ts) — one at a time, inside the day's reading limit.
//
// Nothing here buys, sells or launches research. A failure degrades to "can't check" for the names it
// touches and is retried on the next tick; the timer itself never throws.
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { mergeWatchlist, onTheWatchlist, type EngineWatchRow, type MergedWatchRow, type WatchEntry } from '../watchlist'
import type { AbsentReason, QuoteOutcome } from '../news/equity-quote'
import {
  ACKNOWLEDGEABLE,
  DEFAULT_THRESHOLDS,
  STATUS_RANK,
  evaluateName,
  priceText,
  type Condition,
  type ConditionType,
  type NameEvaluation,
  type PriceFacts,
  type StatusWord,
  type Thresholds,
} from './evaluate'
import { REARM_PCT, stepAlerts, type NameAlertState } from './alerts'
import { WatchInbox, type WatchMessageItem } from './inbox'
import { selectEmailBatch, type Delivered, type EmailBatchEntry, type WatchEmailConfig } from './email'
import { loadPriceRecord, marketIndexFor, observe, savePriceRecord, sessionMove, sessionOf, type ListingSubject } from './prices'
import { loadPlan, runSegOf, type ReadOutcome } from './reader'
import { BUY_NOW_DECISIONS, ROLE_LABEL, type LeftOut, type PlanItem, type PlanPrice, type WatchPlan } from './plan'

export const MONITOR_STATE_SCHEMA = 'watch-monitor/v1' as const
/** A gap this long between checks means the checks stopped (the cockpit or the machine was off). */
const COCKPIT_OFF_MS = 45 * 60_000
const READ_RETRY_MS = 60 * 60_000
const READ_GIVE_UP_MS = 24 * 60 * 60_000
const READ_MAX_ATTEMPTS = 3
/** How often a read report's files are checked for a correction made in place. */
const DIGEST_CHECK_MS = 60 * 60_000
/** How long the first-day summary waits for every report to be read before going out anyway. */
const SUMMARY_GRACE_MS = 30 * 60_000
/** The one test email: retried at most hourly, and given up after this many tries until the addresses change. */
const EMAIL_TEST_RETRY_MS = 60 * 60_000
const EMAIL_TEST_MAX_ATTEMPTS = 3

/** Research calls that get a watch plan: Watchlist calls, read for their lines, and buy calls, which keep only
 *  their record's bad case — after one "buy now" message, only a buy call's warnings are watched. */
const planned = (decision: string | null | undefined): boolean => decision === 'Watchlist' || BUY_NOW_DECISIONS.has(decision ?? '')
/** The run a basis is about: "analyses/X_2026-07-10|read" → "analyses/X_2026-07-10" (how far it was read follows the bar). */
const basisRun = (basis: string): string => basis.split('|')[0]

export interface MonitorThresholds extends Thresholds { rearmPct: number }

export interface ReadRecord { attempts: number; last_at: string; status: ReadOutcome['status']; detail: string }

/** The one test email for a set of addresses (sendEmailTestOnce). */
interface EmailTest { addresses: string; message_id: string | null; attempts: number; tried_at: string | null; sent: boolean }

interface MonitorState {
  schema_version: typeof MONITOR_STATE_SCHEMA
  switched_on_at: string | null
  summary_sent_at: string | null
  last_tick_at: string | null
  names: Record<string, NameAlertState>
  email_paused: string[]
  /** Conditions you have said you have seen: listing key -> condition id -> when you said it. A fact you have
   *  looked at stops deciding the name's status without pretending it went away (evaluate.ts ACKNOWLEDGEABLE). */
  seen: Record<string, Record<string, string>>
  reads: Record<string, ReadRecord>
  /** What was already true for each name when it was first seen, held for the one first-day summary. */
  pending_summary: Record<string, { ticker: string; items: WatchMessageItem[] }>
  email_test: EmailTest | null
}

const emptyState = (): MonitorState => ({
  schema_version: MONITOR_STATE_SCHEMA, switched_on_at: null, summary_sent_at: null, last_tick_at: null,
  names: {}, email_paused: [], seen: {}, reads: {}, pending_summary: {}, email_test: null,
})

/** What the screen shows about a name's watch plan. */
export interface PlanView {
  state: 'ready' | 'reading' | 'waiting' | 'failed' | 'budget'
  detail: string
  /** When this state was established — the read record's own time, or the reading's. A panel that cannot say
   *  WHEN it last tried leaves the reader unable to tell today's answer from one two days old, which is how
   *  a spent allowance and a provider limit from another day came to be shown as one story. */
  at: string | null
  run_root: string
  decision: string | null
  decision_date: string | null
  items: PlanItem[]
  left_out: LeftOut[]
  reader: WatchPlan['reader'] | null
}

/** Everything the list and the detail panel need about one name, beside the existing row fields. */
export interface RowWatch {
  status: StatusWord
  status_label: string
  headline: string | null
  conditions: Omit<Condition, 'line'>[]
  next_line: NameEvaluation['next_line']
  next_date: NameEvaluation['next_date']
  day_move_pct: number | null
  market: { label: string; move_pct: number } | null
  plan: PlanView | null
  email_paused: boolean
  unread: number
}

export interface MonitorDeps {
  stateDir: string
  now?: () => Date
  today: () => string
  loadEngineRows: () => Promise<EngineWatchRow[]>
  loadEntries: () => WatchEntry[]
  quote: (subjects: ListingSubject[]) => Promise<Map<string, QuoteOutcome>>
  indexLevels: (symbols: string[]) => Promise<Map<string, { last: number; as_of: string | null }>>
  readPlan: (row: EngineWatchRow) => Promise<ReadOutcome>
  emailConfig: () => WatchEmailConfig
  sendEmail: (batch: EmailBatchEntry[], cfg: WatchEmailConfig) => Promise<{ ok: boolean; detail: string; delivered?: Delivered[] }>
  /** The digest of a run's research files as they are now (reader.ts loadResearchSources). With it, a report
   *  corrected in place is read again; without it (tests), a read plan is kept as it is. */
  currentDigest?: (runRoot: string) => string | null
  thresholds?: MonitorThresholds
  tickMs?: number
  /** No timers at all: the caller drives every check (tests). */
  manual?: boolean
  log?: (msg: string) => void
}

const ABSENT_TEXT: Record<AbsentReason, string> = {
  no_currency: 'The listing has no currency, so it cannot be priced safely. Edit the row to pick the listing.',
  unknown_symbol: 'The price feed does not carry this listing.',
  currency_mismatch: 'The price feed answered in another currency — a different listing, so it is not used.',
  name_mismatch: "The price feed answered with a different company's name, so it is not used.",
  stale_feed: 'The newest price on offer is too old to call current.',
  implausible_price: "The price is far out of line with the research's — likely the wrong units or listing.",
  feed_unavailable: 'The price feed could not be reached just now.',
  not_quoted: 'The price feed came back without this listing in it.',
}

// A message stands alone — in the cockpit and in an email — so a passed date's tests are spelled out in it.
const toItem = (c: Condition, at: string): WatchMessageItem => ({
  id: c.id, type: c.type, urgent: c.urgent, title: c.title,
  detail: c.checklist?.length ? `${c.detail} The research's tests to check by hand:\n${c.checklist.map((x) => `• ${x}`).join('\n')}` : c.detail,
  quote: c.quote, source: c.source, at,
})

function durationText(ms: number): string {
  const min = Math.round(ms / 60_000)
  if (min < 90) return `${min} minutes`
  const h = Math.round(min / 6) / 10
  return h < 48 ? `${h} hours` : `${Math.round(h / 24)} days`
}
const clockText = (iso: string) => new Date(iso).toISOString().slice(0, 16).replace('T', ' ') + ' UTC'

export function createWatchMonitor(deps: MonitorDeps) {
  const now = () => (deps.now ? deps.now() : new Date())
  const t: MonitorThresholds = deps.thresholds ?? { ...DEFAULT_THRESHOLDS, rearmPct: REARM_PCT }
  const dir = path.join(deps.stateDir, 'watchlist')
  const stateFile = path.join(dir, 'monitor-state.json')
  const pricesFile = path.join(dir, 'price-record.json')
  const inbox = new WatchInbox(dir)
  const prices = loadPriceRecord(pricesFile)
  const state = loadState()
  const planCache = new Map<string, WatchPlan | null>()
  const reading = new Set<string>()
  const queued = new Set<string>()
  const digestCheckedAt = new Map<string, number>()
  let readChain: Promise<void> = Promise.resolve()
  let market = new Map<string, { label: string; move_pct: number; session: string }>()
  let ticking: Promise<void> | null = null
  let timer: ReturnType<typeof setInterval> | null = null
  let soon: ReturnType<typeof setTimeout> | null = null
  let stopped = false
  let lastError: string | null = null

  function loadState(): MonitorState {
    try {
      const j = JSON.parse(fs.readFileSync(stateFile, 'utf8'))
      if (j?.schema_version === MONITOR_STATE_SCHEMA) return { ...emptyState(), ...j }
    } catch { /* first run */ }
    return emptyState()
  }

  function saveState(): void {
    try {
      fs.mkdirSync(dir, { recursive: true, mode: 0o700 })
      const tmp = `${stateFile}.tmp-${process.pid}-${crypto.randomBytes(4).toString('hex')}`
      fs.writeFileSync(tmp, JSON.stringify(state) + '\n', { mode: 0o600 })
      fs.renameSync(tmp, stateFile)
    } catch (e: any) {
      deps.log?.(`[watchlist] could not save its state: ${e?.message ?? e}`)
    }
  }

  function cachedPlan(seg: string): WatchPlan | null {
    if (!planCache.has(seg)) planCache.set(seg, loadPlan(seg, deps.stateDir))
    return planCache.get(seg) ?? null
  }

  /**
   * The plan a row is judged by, and whether messages may be sent for it yet. A research name is held
   * silent until its report has been read — otherwise the buy price the reader finds a minute later would
   * arrive as "news" when it was true all along. A name you added yourself needs no plan.
   */
  function planInfo(row: MergedWatchRow): { plan: WatchPlan | null; ready: boolean; view: PlanView | null; basis: string } {
    const eng = row.engine
    if (!eng || !planned(eng.decision)) return { plan: null, ready: true, view: null, basis: eng?.run_root ?? 'yours' }
    const seg = runSegOf(eng.run_root)
    if (!seg) return { plan: null, ready: true, view: null, basis: eng.run_root }
    const cached = cachedPlan(seg)
    const plan = cached && cached.run_root === eng.run_root ? cached : null
    const rec = state.reads[seg]
    const view = (st: PlanView['state'], detail: string, at: string | null = null): PlanView => ({
      state: st, detail, at, run_root: eng.run_root, decision: eng.decision, decision_date: eng.decision_date,
      items: plan?.items ?? [], left_out: plan?.left_out ?? [],
      // The reading's own record belongs to the plan on screen. A plan carried through a later failure keeps
      // the reading that produced it; the failure's own words and time are the view's, above.
      reader: plan?.reader ?? null,
    })
    if (plan && plan.reader.status === 'ok') {
      return { plan, ready: true, view: view('ready', plan.reader.detail, plan.reader.at ?? rec?.last_at ?? null), basis: `${eng.run_root}|read` }
    }
    if (rec?.status === 'no_sources') return { plan: null, ready: true, view: view('failed', rec.detail, rec.last_at), basis: `${eng.run_root}|none` }
    // A read that could not happen — the model's sign-in expired, or today's reading limit is spent — must not
    // leave the name silent for hours. Until the text is read, it is watched on what the decision record
    // itself stores as data (its bad case, its kill criteria, big drops); when the read succeeds, the basis
    // changes and the name gets one "now watching" message with its full plan.
    if (rec?.status === 'failed' || rec?.status === 'budget') {
      const retry = reading.has(seg) || queued.has(seg) ? ' Trying again now.' : ''
      return {
        plan, ready: true,
        view: view(rec.status === 'budget' ? 'budget' : 'failed',
          `${rec.status === 'budget' ? rec.detail : `Could not read the research: ${rec.detail}`}${retry}`, rec.last_at),
        basis: `${eng.run_root}|partial`,
      }
    }
    if (reading.has(seg)) return { plan, ready: false, view: view('reading', 'Reading the research now.'), basis: `${eng.run_root}|reading` }
    return { plan, ready: false, view: view('waiting', 'Waiting to read the research.', rec?.last_at ?? null), basis: `${eng.run_root}|waiting` }
  }

  function factsFor(row: MergedWatchRow, at: Date, record: boolean): PriceFacts {
    const q = row.quote
    if (!q) {
      return {
        price: null, currency: row.currency, as_of: null, as_of_is_close: false, stale: false,
        reason: row.quote_reason ? ABSENT_TEXT[row.quote_reason] : row.currency ? 'No price for this listing yet.' : ABSENT_TEXT.no_currency,
        day_move_pct: null, market: null, session: null,
      }
    }
    const session = sessionOf(q.as_of, at)
    const move = q.stale ? null : sessionMove(prices, row.listing_key, q.price, session)
    if (record && !q.stale) observe(prices, row.listing_key, q.price, q.as_of, at)
    const mi = marketIndexFor(row.exchange, row.currency)
    const m = mi ? market.get(mi.symbol) : undefined
    return {
      price: q.price, currency: q.currency, as_of: q.as_of, as_of_is_close: q.as_of_is_close, stale: q.stale, reason: null,
      day_move_pct: move,
      // the market's move only means something beside the stock's if both are for the same session
      market: m && m.session === session ? { label: m.label, move_pct: m.move_pct } : null,
      session,
    }
  }

  function nowWatchingItem(row: MergedWatchRow, plan: WatchPlan | null, changed: boolean, basis: string, at: string): WatchMessageItem {
    const items = plan?.items ?? []
    const lines = items.flatMap((i) => (i.kind === 'price' ? [`${ROLE_LABEL[i.role].toLowerCase()} ${priceText(i)}`] : []))
    const dates = items.filter((i) => i.kind === 'date' && i.date).length
    const deals = items.filter((i) => i.kind === 'deal_breaker').length
    const parts = [lines.length ? lines.join(', ') : 'no price to wait for']
    if (dates) parts.push(`${dates} dated ${dates === 1 ? 'event' : 'events'}`)
    if (deals) parts.push(`${deals} ${deals === 1 ? 'deal-breaker' : 'deal-breakers'}`)
    return {
      id: `now_watching:${basis}`, type: 'now_watching', urgent: false,
      title: changed ? 'New research — watching it again' : 'Now watching',
      detail: `Set up from its research${plan?.decision_date ? ` of ${plan.decision_date}` : ''}: ${parts.join('; ')}.`,
      quote: null, source: plan?.run_root ?? row.run_root ?? null, at,
    }
  }

  /** The one message a buy call gets: its research says buy. After it, only the call's warnings are watched
   *  (operator decision, 2026-09-15). Urgent when it is news; listed plainly in the first-day summary. */
  function buyNowItem(row: MergedWatchRow, plan: WatchPlan | null, basis: string, at: string, urgent: boolean): WatchMessageItem {
    const bad = plan?.items.find((i): i is PlanPrice => i.kind === 'price' && i.role === 'bad_case')
    return {
      id: `buy_now:${basis}`, type: 'research_buy_now', urgent,
      title: 'Research says buy now',
      detail: `Its research${plan?.decision_date ? ` of ${plan.decision_date}` : ''} ends in ${plan?.decision ?? row.engine?.decision ?? 'a buy call'}. `
        + (bad
          ? `From here on only its warnings are watched: a fall under its bad case of ${priceText(bad)}.`
          : 'From here on only its warnings are watched, and its research names no bad-case price to watch.'),
      quote: null, source: plan?.run_root ?? row.run_root ?? null, at,
    }
  }

  function ensurePlans(rows: EngineWatchRow[], at: Date): void {
    for (const row of rows) {
      const seg = runSegOf(row.run_root)
      if (!seg || reading.has(seg) || queued.has(seg)) continue
      const plan = cachedPlan(seg)
      if (plan && plan.reader.status === 'ok' && plan.run_root === row.run_root) {
        // Read once per version of the report: one corrected in place (a data fix to its record or thesis) is read
        // again. Its files are hashed at most hourly — cheap, but not every few minutes for nothing.
        if (!deps.currentDigest || at.getTime() - (digestCheckedAt.get(seg) ?? 0) < DIGEST_CHECK_MS) continue
        digestCheckedAt.set(seg, at.getTime())
        const digest = deps.currentDigest(row.run_root)
        if (!digest || digest === plan.source_digest) continue
      }
      const rec = state.reads[seg]
      if (rec) {
        const since = at.getTime() - Date.parse(rec.last_at)
        const wait = rec.status === 'failed' ? (rec.attempts >= READ_MAX_ATTEMPTS ? READ_GIVE_UP_MS : READ_RETRY_MS)
          : rec.status === 'no_sources' ? READ_GIVE_UP_MS
            : rec.status === 'budget' ? READ_RETRY_MS : 0
        if (since < wait) continue
      }
      queued.add(seg)
      readChain = readChain.then(async () => {
        queued.delete(seg)
        if (stopped) return
        reading.add(seg)
        let outcome: ReadOutcome
        try { outcome = await deps.readPlan(row) } catch (e: any) { outcome = { status: 'failed', plan: null, detail: String(e?.message ?? e), cost_usd: 0 } }
        reading.delete(seg)
        const prev = state.reads[seg]
        const attempts = outcome.status === 'failed'
          ? (prev?.status === 'failed' && prev.attempts < READ_MAX_ATTEMPTS ? prev.attempts + 1 : 1)
          : 0
        const doneAt = now()
        state.reads[seg] = { attempts, last_at: doneAt.toISOString(), status: outcome.status, detail: outcome.detail }
        if (outcome.plan) planCache.set(seg, outcome.plan)
        else planCache.delete(seg)
        // (Not when an earlier reading is still watched: then only a re-read of a corrected copy failed.)
        if (outcome.status === 'failed' && attempts >= READ_MAX_ATTEMPTS && state.summary_sent_at && outcome.plan?.reader.status !== 'ok') {
          inbox.addForName(
            { listing_key: row.listing.listing_key, ticker: row.listing.ticker, company_name: row.listing.company_name },
            'cant_check',
            [{
              id: `setup_failed:${seg}:${doneAt.toISOString().slice(0, 10)}`, type: 'setup_failed', urgent: false,
              title: "Couldn't read its research",
              detail: `Tried ${attempts} times. ${outcome.detail} Until it can, only its bad case and deal-breakers are watched; it tries again tomorrow.`,
              quote: null, source: row.run_root, at: doneAt.toISOString(),
            }],
            { enabled: false, paused: false }, doneAt,
          )
        }
        saveState()
        scheduleTick(3_000)
      })
    }
  }

  /**
   * The first time email is on for a set of addresses, one test goes out — so mail is seen to arrive from this
   * engine before any real alert depends on it. It is the one email that is not urgent, and it says it is a
   * test. Retried at most hourly, EMAIL_TEST_MAX_ATTEMPTS times; a new set of addresses gets its own.
   */
  async function sendEmailTestOnce(cfg: WatchEmailConfig, at: Date): Promise<void> {
    const addresses = cfg.recipients.map((r) => r.trim().toLowerCase()).sort().join(',')
    const prev = state.email_test?.addresses === addresses ? state.email_test : null
    if (prev && (prev.sent || prev.attempts >= EMAIL_TEST_MAX_ATTEMPTS)) return
    if (prev?.tried_at && at.getTime() - Date.parse(prev.tried_at) < EMAIL_TEST_RETRY_MS) return
    const test: EmailTest = prev ?? { addresses, message_id: null, attempts: 0, tried_at: null, sent: false }
    let message = test.message_id ? inbox.get(test.message_id) : null
    if (!message) {
      const n = cfg.recipients.length
      const atIso = at.toISOString()
      message = inbox.addGeneral('system', 'Test email', [{
        id: `email_test:${atIso}`, type: 'email_test', urgent: false, title: 'This is a test',
        detail: `Watchlist email is on for ${n} ${n === 1 ? 'address' : 'addresses'}. From now on an urgent message — a line the research drew is crossed, or new research says buy — is emailed like this one. Everything else stays in the cockpit. Nothing needs doing.`,
        quote: null, source: null, at: atIso,
      }], at)
      test.message_id = message.id
    }
    test.attempts++
    test.tried_at = at.toISOString()
    state.email_test = test
    const sent = [{ message, items: message.items }]
    const res: { ok: boolean; detail: string; delivered?: Delivered[] } = await deps.sendEmail(sent, cfg)
      .catch((e: any) => ({ ok: false, detail: String(e?.message ?? e) }))
    inbox.markEmailed(sent, res.ok, res.detail, at, res.delivered)
    test.sent = res.ok
  }

  async function runTick(): Promise<void> {
    const at = now()
    const atIso = at.toISOString()
    const today = deps.today()
    const engineAll = await deps.loadEngineRows()
    const entries = deps.loadEntries()
    const engineOnList = engineAll.filter((e) => onTheWatchlist(e.decision))
    const subjects: ListingSubject[] = [
      ...engineOnList.map((e) => ({ key: e.listing.listing_key, ticker: e.listing.ticker, currency: e.listing.currency, exchange: e.listing.exchange, companyName: e.listing.company_name, entryPrice: e.entry_price })),
      ...entries.filter((e) => !e.archive).map((e) => ({ key: e.listing.listing_key, ticker: e.listing.ticker, currency: e.listing.currency, exchange: e.listing.exchange, companyName: e.listing.company_name, entryPrice: null })),
    ]
    const quotes = await deps.quote(subjects)
    const rows = mergeWatchlist({ entries, engine: engineAll, quotes, today }).rows

    // the home markets these names move with, recorded like any other price
    const wanted = new Map<string, string>()
    for (const r of rows) {
      const mi = marketIndexFor(r.exchange, r.currency)
      if (mi) wanted.set(mi.symbol, mi.label)
    }
    const levels = await deps.indexLevels([...wanted.keys()])
    const nextMarket = new Map<string, { label: string; move_pct: number; session: string }>()
    for (const [sym, lvl] of levels) {
      const key = `MKT:${sym}`
      const session = sessionOf(lvl.as_of, at)
      const mv = sessionMove(prices, key, lvl.last, session)
      observe(prices, key, lvl.last, lvl.as_of, at)
      if (mv != null) nextMarket.set(sym, { label: wanted.get(sym) ?? sym, move_pct: mv, session })
    }
    market = nextMarket

    ensurePlans(engineOnList.filter((e) => planned(e.decision)), at)

    if (!state.switched_on_at) state.switched_on_at = atIso
    const offFor = state.last_tick_at ? at.getTime() - Date.parse(state.last_tick_at) : 0
    const wasOff = offFor > COCKPIT_OFF_MS
    const changedWhileOff: string[] = []
    const emailCfg = deps.emailConfig()
    const present = new Set<string>()
    let notReady = 0

    for (const row of rows) {
      const key = row.listing_key
      present.add(key)
      const info = planInfo(row)
      const facts = factsFor(row, at, true)
      const ev = evaluateName({ plan: info.plan, triggers: row.triggers, evals: row.evals, facts, today, thresholds: t, seen: state.seen[row.listing_key] })
      if (!info.ready) { notReady++; continue }
      // WHAT YOU SAW IS FORGOTTEN ONCE THE THING IS GONE. Condition ids are built from their own content — a
      // decision date, a date item's hash — so every re-run mints new ones, and without this the old run's
      // acknowledgements stayed in the state file for the life of the install. Only a name whose plan is
      // READY prunes: a name mid-read has no conditions yet, and must not lose what you told it.
      const ack = state.seen[key]
      if (ack) {
        const live = new Set(ev.conditions.map((c) => c.id))
        for (const id of Object.keys(ack)) if (!live.has(id)) delete ack[id]
        if (!Object.keys(ack).length) delete state.seen[key]
      }
      const prev = state.names[key]
      const step = stepAlerts(prev, { listing_key: key, run_root: info.basis, conditions: ev.conditions, price: facts.price, now: at }, t.rearmPct)
      state.names[key] = step.state
      const name = { listing_key: key, ticker: row.ticker, company_name: row.company_name }
      const email = { enabled: emailCfg.enabled, paused: state.email_paused.includes(key) }
      if (step.baseline) {
        const buyCall = BUY_NOW_DECISIONS.has(info.plan?.decision ?? '')
        const already = ev.conditions.filter((c) => c.type !== 'cant_check').map((c) => toItem(c, atIso))
        if (!state.summary_sent_at) {
          // On the first day a buy call is listed as already there, like everything else in the summary.
          state.pending_summary[key] = { ticker: row.ticker, items: buyCall ? [buyNowItem(row, info.plan, info.basis, atIso, false), ...already] : already }
          continue
        }
        // After the first day: new research that ends in a buy is the one urgent message a buy call gets. Any
        // other new research (or a research name new to the list) gets one "now watching" message with anything
        // already true in it — urgent if any of that is. A name you just added yourself is set up silently: you
        // know it is there.
        if (!info.view) continue
        // The SAME research, only read further — its text read at last after a failed or refused read — is not new
        // research: it is not called new, nothing already told is told again, and a buy call's "buy now" went out
        // with the first reading.
        const sameRun = !!prev?.run_root && basisRun(prev.run_root) === basisRun(info.basis)
        const fresh = sameRun ? already.filter((i) => !prev!.fired[i.id]) : already
        if (sameRun && buyCall) {
          if (fresh.length) inbox.addForName(name, ev.status, fresh, email, at)
          continue
        }
        const lead = buyCall
          ? buyNowItem(row, info.plan, info.basis, atIso, true)
          : nowWatchingItem(row, info.plan, step.researchChanged && !sameRun, info.basis, atIso)
        inbox.addForName(name, ev.status, [lead, ...fresh], email, at)
        continue
      }
      if (step.events.length) {
        inbox.addForName(name, ev.status, step.events.map((c) => toItem(c, atIso)), email, at)
        if (wasOff) changedWhileOff.push(row.ticker)
      }
    }

    // Names that left the list. An empty engine read while the state still holds research names is far
    // more likely a failed read of the calls than every call changing at once, so nothing is removed on it.
    const engineReadLooksEmpty = engineAll.length === 0 && Object.values(state.names).some((n) => n.run_root && n.run_root !== 'yours')
    if (!engineReadLooksEmpty) {
      // What you said you had seen goes with the name. Kept, it would silence a condition on the day the name
      // came back — under the same id, because the id is built from the date, not from when it was last read.
      for (const key of Object.keys(state.seen)) if (!present.has(key)) delete state.seen[key]
      for (const key of Object.keys(state.names)) {
        if (present.has(key)) continue
        delete state.names[key]
        if (entries.some((e) => e.listing.listing_key === key && e.archive)) continue // you took it off yourself
        const eng = engineAll.find((e) => e.listing.listing_key === key)
        inbox.addForName(
          { listing_key: key, ticker: eng?.listing.ticker ?? key.split('|')[0], company_name: eng?.listing.company_name ?? null },
          'waiting',
          [{
            id: `removed:${atIso.slice(0, 10)}`, type: 'removed', urgent: false, title: 'Came off the watchlist',
            detail: eng && !onTheWatchlist(eng.decision)
              ? `Its newest research says ${eng.decision}, and ${eng.decision} calls are not watched.`
              : 'Its research no longer lists it as a name to watch — for example, the book now holds a position in it.',
            quote: null, source: eng?.run_root ?? null, at: atIso,
          }],
          { enabled: false, paused: false }, at,
        )
      }
    }

    // The first-day summary: everything that was already true, once, instead of a flood of "news".
    if (!state.summary_sent_at && (notReady === 0 || at.getTime() - Date.parse(state.switched_on_at) > SUMMARY_GRACE_MS)) {
      const flagged = Object.values(state.pending_summary).filter((n) => n.items.length)
      const items: WatchMessageItem[] = [{
        id: 'already_there:intro', type: 'already_there', urgent: false, title: 'Switched on',
        detail: `From now on you get a message when something changes. Below is what was already true at the start${notReady ? `; ${notReady} ${notReady === 1 ? 'name is' : 'names are'} still being set up and will get their own message` : ''}.`,
        quote: null, source: null, at: atIso,
      }]
      for (const n of flagged) for (const i of n.items) items.push({ ...i, ticker: n.ticker })
      const title = `Watching ${rows.length} ${rows.length === 1 ? 'name' : 'names'} — ${flagged.length
        ? `${flagged.length} already ${flagged.length === 1 ? 'needs' : 'need'} a look`
        : 'nothing needs you yet'}`
      inbox.addGeneral('summary', title, items, at)
      state.summary_sent_at = atIso
      state.pending_summary = {}
    }

    if (wasOff && state.last_tick_at) {
      inbox.addGeneral('system', `The cockpit was off for ${durationText(offFor)}`, [{
        id: `cockpit_was_off:${state.last_tick_at}`, type: 'cockpit_was_off', urgent: false,
        title: `No checks from ${clockText(state.last_tick_at)} to ${clockText(atIso)}`,
        detail: changedWhileOff.length
          ? `Checks have resumed. While it was off, something changed for ${changedWhileOff.join(', ')} — see their messages.`
          : 'Checks have resumed. Nothing on the list changed while it was off.',
        quote: null, source: null, at: atIso,
      }], at)
    }

    if (emailCfg.enabled) {
      await sendEmailTestOnce(emailCfg, at)
      // A name whose email is paused sends nothing more — including what was already waiting to go.
      const paused = new Set(state.email_paused)
      const batch = selectEmailBatch(inbox.pendingEmail().filter((m) => !m.listing_key || !paused.has(m.listing_key)), inbox.all(), at)
      if (batch.length) {
        const res: { ok: boolean; detail: string; delivered?: Delivered[] } = await deps.sendEmail(batch, emailCfg)
          .catch((e: any) => ({ ok: false, detail: String(e?.message ?? e) }))
        inbox.markEmailed(batch, res.ok, res.detail, at, res.delivered)
      }
    }

    state.last_tick_at = atIso
    saveState()
    savePriceRecord(pricesFile, prices)
  }

  async function tick(): Promise<void> {
    if (stopped) return
    if (ticking) return ticking
    ticking = (async () => {
      try {
        await runTick()
        lastError = null
      } catch (e: any) {
        lastError = String(e?.message ?? e)
        deps.log?.(`[watchlist] check failed: ${lastError}`)
      } finally {
        ticking = null
      }
    })()
    return ticking
  }

  function scheduleTick(ms: number): void {
    if (stopped || deps.manual) return
    if (soon) clearTimeout(soon)
    soon = setTimeout(() => { soon = null; void tick() }, ms)
    soon.unref?.()
  }

  function start(): void {
    if (timer || stopped || deps.manual) return
    timer = setInterval(() => { void tick() }, deps.tickMs ?? 5 * 60_000)
    timer.unref?.()
    scheduleTick(20_000)
  }

  function stop(): void {
    stopped = true
    if (timer) clearInterval(timer)
    if (soon) clearTimeout(soon)
    timer = null
    soon = null
  }

  /** Resolves once every queued report read and any check in progress have finished. */
  async function idle(): Promise<void> {
    // A tick can queue reads after it awaits prices. Drain that producer before its read queue.
    if (ticking) await ticking
    await readChain
  }

  /** The list's rows with what each one says right now — evaluated fresh against the prices the request
   *  just fetched, so the screen never lags the quotes beside it. Read-only: records nothing. */
  function decorate<T extends MergedWatchRow>(rows: T[]): (T & { watch: RowWatch })[] {
    const at = now()
    const today = deps.today()
    const unread = new Map<string, number>()
    for (const m of inbox.list()) if (!m.read_at && m.listing_key) unread.set(m.listing_key, (unread.get(m.listing_key) ?? 0) + 1)
    const out = rows.map((row) => {
      const info = planInfo(row)
      const facts = factsFor(row, at, false)
      const ev = evaluateName({ plan: info.plan, triggers: row.triggers, evals: row.evals, facts, today, thresholds: t, seen: state.seen[row.listing_key] })
      const watch: RowWatch = {
        status: ev.status, status_label: ev.status_label, headline: ev.headline,
        conditions: ev.conditions.map(({ line: _line, ...c }) => c),
        next_line: ev.next_line, next_date: ev.next_date,
        day_move_pct: facts.day_move_pct, market: facts.market, plan: info.view,
        email_paused: state.email_paused.includes(row.listing_key),
        unread: unread.get(row.listing_key) ?? 0,
      }
      return { ...row, watch }
    })
    const gap = (r: { watch: RowWatch }) => (r.watch.next_line?.gap_pct == null ? Number.POSITIVE_INFINITY : Math.abs(r.watch.next_line.gap_pct))
    return out.sort((a, b) =>
      STATUS_RANK[a.watch.status] - STATUS_RANK[b.watch.status] || gap(a) - gap(b) || a.ticker.localeCompare(b.ticker))
  }

  function setEmailPaused(listingKey: string, paused: boolean): void {
    const set = new Set(state.email_paused)
    if (paused) set.add(listingKey)
    else set.delete(listingKey)
    state.email_paused = [...set].sort()
    saveState()
    // What was already waiting to go (held for the 30-minute grouping, or retrying) is paused with it, and stays
    // paused when email is resumed: it is not sent late.
    if (paused) inbox.pauseEmail(listingKey, now())
  }

  /**
   * Say you have seen a condition, or take it back.
   *
   * Only a condition that cannot clear itself can be acknowledged (evaluate.ts ACKNOWLEDGEABLE), and saying so
   * changes nothing about the fact: it is still evaluated, still shown, still in its own words. It stops
   * deciding the status, so the name leaves "Needs you" until something NEW happens — a further date passing,
   * or a fresh reading, each of which is a different id.
   */
  function setSeen(listingKey: string, conditionId: string, seen: boolean): boolean {
    // ONLY A CONDITION THAT COULD BE ACKNOWLEDGED. An id names its own type before the colon, and a write
    // for any other type would be stored, re-serialised on every tick and read by nobody — so it is refused
    // at the door rather than left for the sweep to find.
    if (seen && !ACKNOWLEDGEABLE.has(conditionId.split(':')[0] as ConditionType)) return false
    const forName = { ...(state.seen[listingKey] ?? {}) }
    if (seen) forName[conditionId] = now().toISOString()
    else delete forName[conditionId]
    if (Object.keys(forName).length) state.seen[listingKey] = forName
    else delete state.seen[listingKey]
    saveState()
    // No tick. Nothing the tick computes depends on this — the screen re-reads through decorate(), which
    // reads state.seen directly — and scheduleTick REPLACES the pending timer, so a click here would cancel
    // the run a just-finished plan read had queued, and re-quote every listing for nothing.
    return true
  }

  function status() {
    return {
      last_tick_at: state.last_tick_at,
      switched_on_at: state.switched_on_at,
      summary_sent_at: state.summary_sent_at,
      last_error: lastError,
      reading: [...reading],
      queued: [...queued],
      reads: state.reads,
      email_test: state.email_test,
    }
  }

  return { start, stop, tick, idle, nudge: () => scheduleTick(5_000), decorate, setEmailPaused, setSeen, status, inbox }
}

export type WatchMonitor = ReturnType<typeof createWatchMonitor>
