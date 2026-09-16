// Reads a finished research report ONCE and turns it into a watch plan (plan.ts).
//
// The model reads only the report's prose — the decision record, the final thesis and the catalyst
// synthesis — and every item it returns is checked against those same texts before it is kept. Fields the
// record already stores as data (the bad case, the kill criteria) never go through the model at all.
//
// Cost: one model call per report, on the same Claude/Codex plan research uses. The only limit is the day's
// reading total (WATCH.dailyUsd); a single read may use whatever is left of it, and none may start once it
// is spent. A report read successfully is never read again unless its files change.
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { ANALYSES_DIR, CHAT, STATE_DIR, WATCH } from '../config'
import { isUsageLimitError, runChatTurn, type ChatTurnOptions } from '../chat-llm'
import { resolveAllowedChatModel } from '../chat-models'
import { UsdBudget } from '../news/triage/budget'
import type { WatchListing } from '../watchlist'
import {
  BUY_NOW_DECISIONS, WATCH_PLAN_SCHEMA, parseReaderJson, priceLine, recordItems, roleWords, sha256, sourceDigest, validateReaderOutput,
  type PlanItem, type PlanPrice, type PlanSourceFile, type WatchPlan,
} from './plan'

export const READER_FILES = ['decision_record.json', 'final_thesis.md', 'catalyst/99_catalyst-synthesis.md'] as const
/** A file this long is not sent at all — and is listed as not read — rather than silently cut short. */
const MAX_FILE_CHARS = 600_000

export interface ResearchSources {
  runSeg: string
  record: any
  files: { file: string; text: string }[]
  skipped: string[]
  manifest: PlanSourceFile[]
  digest: string
}

/** The run folder name, from "analyses/AMZN_2026-07-10". Anything that is not one plain folder name is refused. */
export function runSegOf(runRoot: string | null | undefined): string | null {
  const rel = String(runRoot ?? '').replace(/^analyses[/\\]/, '')
  const seg = path.basename(rel)
  if (!seg || seg !== rel || seg.startsWith('.') || !/^[A-Za-z0-9._-]+$/.test(seg)) return null
  return seg
}

export function loadResearchSources(runRoot: string, analysesDir: string = ANALYSES_DIR): ResearchSources | null {
  const seg = runSegOf(runRoot)
  if (!seg) return null
  const dir = path.join(analysesDir, seg)
  let record: any
  try { record = JSON.parse(fs.readFileSync(path.join(dir, 'decision_record.json'), 'utf8')) } catch { return null }
  // The record is sent re-serialised, so every character appears as itself: a quote taken from it is then
  // checked against exactly the text the model saw (the raw file may carry \u escapes the model would not).
  const files: { file: string; text: string }[] = [{ file: 'decision_record.json', text: JSON.stringify(record, null, 1) }]
  const skipped: string[] = []
  for (const f of READER_FILES.slice(1)) {
    let text: string
    try { text = fs.readFileSync(path.join(dir, f), 'utf8') } catch { continue } // optional file
    if (!text.trim()) continue
    if (text.length > MAX_FILE_CHARS) { skipped.push(f); continue }
    files.push({ file: f, text })
  }
  const manifest = files.map((f) => ({ file: f.file, sha256: sha256(f.text), chars: f.text.length }))
  return { runSeg: seg, record, files, skipped, manifest, digest: sourceDigest(manifest) }
}

// ---------- the plan store ----------

export const plansDir = (stateDir: string = STATE_DIR) => path.join(stateDir, 'watchlist', 'plans')

export function loadPlan(runSeg: string, stateDir: string = STATE_DIR): WatchPlan | null {
  try {
    const j = JSON.parse(fs.readFileSync(path.join(plansDir(stateDir), `${runSeg}.json`), 'utf8'))
    return j?.schema_version === WATCH_PLAN_SCHEMA && Array.isArray(j.items) && j.reader ? (j as WatchPlan) : null
  } catch {
    return null
  }
}

export function savePlan(plan: WatchPlan, stateDir: string = STATE_DIR): void {
  const seg = runSegOf(plan.run_root)
  if (!seg) return
  const dir = plansDir(stateDir)
  fs.mkdirSync(dir, { recursive: true, mode: 0o700 })
  const file = path.join(dir, `${seg}.json`)
  const tmp = `${file}.tmp-${process.pid}-${crypto.randomBytes(4).toString('hex')}`
  fs.writeFileSync(tmp, JSON.stringify(plan, null, 1) + '\n', { mode: 0o600 })
  fs.renameSync(tmp, file)
}

// ---------- the prompt ----------

export const READER_SYSTEM = `You read one company's finished equity research report and list what a careful investor would keep watching, using only what the report itself says. You never add, compute, round, convert or infer a number.

Answer with ONE JSON object and nothing else:
{
  "prices": [{"role": "buy" | "look_again" | "fair", "low": number, "high": number | null, "quote": string, "file": string}],
  "dates": [{"label": string, "date": "YYYY-MM-DD" | null, "window": string | null, "what_to_check": string | null, "quote": string, "file": string}],
  "waiting_for": [{"text": string, "quote": string, "file": string}],
  "news": [{"topic": string, "quote": string, "file": string}]
}

How to fill it:
- quote: copied word for word from the named file — one sentence or less, never paraphrased, never stitched together from two places. Every number and every date you give must appear in its own quote. When the number sits under a label — a bullet such as "Target entry zone: $185–$200", or a table row — start the quote at that label, so the quote shows what the number is for.
- file: exactly one of the file names listed in the input.
- what_to_check, waiting_for.text and news.topic: copy a contiguous phrase from that item's own quote, preserving its direction and qualifiers. Do not paraphrase or borrow evidence from another part of the report; return null or omit the item if the quote cannot support it.
- prices: only prices the report ties to an action on THIS stock.
  - "buy" only when the report says to buy, enter or re-enter at that price.
  - "look_again" when it says to revisit, look again, re-rate, re-underwrite or reconsider at that price.
  - "fair" for the report's own fair value or base case — only when the report gives no buy or look_again price.
  - A range like "$190-200" is low 190, high 200. A single price has high null.
  - Leave out: scenario prices (bull, bear, tail), the price the stock traded at when the report was written, any price the report says NOT to buy at, any price the report ties to the stock RISING past it (for example "above ~$115 moves the call toward Avoid"), and prices of other companies.
- dates: dated events the report says to watch — results, filings, meetings, votes, court or regulator decisions, a financing or deal deadline. "date" is the exact day only when the quote gives the day; otherwise "date" is null and "window" holds the words for when, copied exactly from the quote and adding nothing (for example "~Jan-2027", "by end-Sep-2026" or "expected 2027"). "what_to_check" says, in the report's words, what that event should show.
- waiting_for: what the report says must happen before it would change its view (for example "net adds turn positive for 2 consecutive quarters"). Price levels belong in prices, not here.
- news: kinds of news the report says would matter (for example layoffs, financing terms, a guidance cut, a lawsuit ruling).
- If the report gives nothing for a list, return an empty list. Never invent an item to fill one.`

export function readerMessage(plan: WatchPlan, src: ResearchSources): string {
  const who = `${plan.company_name ?? plan.ticker} — ticker ${plan.ticker}${plan.exchange ? `, listed on ${plan.exchange}` : ''}${plan.currency ? `, trading in ${plan.currency}` : ''}`
  const when = `${plan.decision ?? 'unknown'}${plan.decision_date ? `, dated ${plan.decision_date}` : ''}`
  const priced = plan.entry_price
    ? ` Price when the report was written: ${plan.currency ?? ''} ${plan.entry_price}${plan.entry_price_as_of ? ` (${plan.entry_price_as_of})` : ''}.`
    : ''
  const head = [
    `Company: ${who}.`,
    `Research decision: ${when}.${priced}`,
    '',
    `The report's files follow. Quote only from them. The file names you may use are: ${src.files.map((f) => f.file).join(', ')}.`,
  ]
  const body = src.files.map((f) => `\n=== FILE: ${f.file} ===\n${f.text}\n=== END OF FILE: ${f.file} ===`)
  return [...head, ...body].join('\n')
}

// ---------- the read ----------

export type ReadStatus = 'ok' | 'cached' | 'failed' | 'budget' | 'limit' | 'no_sources'
export interface ReadOutcome { status: ReadStatus; plan: WatchPlan | null; detail: string; cost_usd: number }

/** The part of UsdBudget the reader uses — a test hands in a fake. */
export interface ReaderBudget {
  remaining(): number
  tryReserve(estUsd: number): object | null
  reconcile(reservation: any, actualUsd: number): void
}

export interface ReaderRow {
  listing: WatchListing
  run_root: string
  decision: string | null
  decision_date: string | null
}

export interface ReaderDeps {
  runTurn?: (opts: ChatTurnOptions) => Promise<{ costUsd: number; error?: string }>
  now?: () => Date
  stateDir?: string
  analysesDir?: string
  model?: string
  budget?: ReaderBudget
  /** Read again even when a good plan for these exact files exists. */
  force?: boolean
}

let sharedBudget: UsdBudget | null = null
/** The day's reading total, shared by every read in this process and persisted across restarts. */
export function watchReaderBudget(stateDir: string = STATE_DIR): UsdBudget {
  sharedBudget ??= UsdBudget.load(stateDir, WATCH.dailyUsd, Date.now(), 'watchlist-reader-budget.json')
  return sharedBudget
}

function readerModel(pref: string | undefined): { id: string; provider: 'claude' | 'codex' } | null {
  const choice = resolveAllowedChatModel(pref ?? WATCH.readerModel, CHAT.allowedModels)
    ?? resolveAllowedChatModel(CHAT.defaultModel, CHAT.allowedModels)
  return choice ? { id: choice.id, provider: choice.provider } : null
}

const ROLE_ORDER = { buy: 0, look_again: 1, fair: 2, bad_case: 3 } as const
const KIND_ORDER = { price: 0, date: 1, waiting_for: 2, deal_breaker: 3, news: 4 } as const

export function orderItems(items: PlanItem[]): PlanItem[] {
  return [...items].sort((a, b) => {
    if (a.kind !== b.kind) return KIND_ORDER[a.kind] - KIND_ORDER[b.kind]
    if (a.kind === 'price' && b.kind === 'price') return ROLE_ORDER[a.role] - ROLE_ORDER[b.role]
    if (a.kind === 'date' && b.kind === 'date') return String(a.date ?? '9999').localeCompare(String(b.date ?? '9999'))
    return 0
  })
}

function basePlan(row: ReaderRow, src: ResearchSources, now: Date): WatchPlan {
  const rec = src.record ?? {}
  const currency = row.listing.currency ?? (typeof rec.currency === 'string' && rec.currency ? rec.currency.toUpperCase() : null)
  const entry = Number(rec.entry_price)
  return {
    schema_version: WATCH_PLAN_SCHEMA,
    listing_key: row.listing.listing_key,
    ticker: row.listing.ticker,
    company_name: row.listing.company_name ?? (typeof rec.company_name === 'string' ? rec.company_name : null),
    currency,
    exchange: row.listing.exchange ?? (typeof rec.exchange === 'string' ? rec.exchange : null),
    origin: 'research',
    run_root: row.run_root,
    decision: row.decision ?? (typeof rec.decision === 'string' ? rec.decision : null),
    decision_date: row.decision_date ?? (typeof rec.decision_date === 'string' ? rec.decision_date : null),
    entry_price: Number.isFinite(entry) && entry > 0 ? entry : null,
    entry_price_as_of: typeof rec.entry_price_timestamp === 'string' && rec.entry_price_timestamp ? rec.entry_price_timestamp : null,
    sources: src.manifest,
    source_digest: src.digest,
    reader: { status: 'not_run', model: null, cost_usd: 0, at: null, detail: '' },
    items: orderItems(recordItems(rec, currency)),
    left_out: src.skipped.map((f) => ({ what: f, why: 'too long to read in one go, so it was not read' })),
    created_at: now.toISOString(),
  }
}

export async function readResearchPlan(row: ReaderRow, deps: ReaderDeps = {}): Promise<ReadOutcome> {
  const clock = deps.now ?? (() => new Date())
  const stateDir = deps.stateDir ?? STATE_DIR
  const src = loadResearchSources(row.run_root, deps.analysesDir ?? ANALYSES_DIR)
  if (!src) return { status: 'no_sources', plan: null, detail: 'The research files could not be read.', cost_usd: 0 }

  const existing = loadPlan(src.runSeg, stateDir)
  if (!deps.force && existing && existing.source_digest === src.digest && existing.reader.status === 'ok') {
    return { status: 'cached', plan: existing, detail: 'Already read.', cost_usd: 0 }
  }

  const base = basePlan(row, src, clock())
  // A buy call is watched for its warnings only (BUY_NOW_DECISIONS): the record's own bad case and kill
  // criteria are the whole plan, so its text is not read and nothing is spent.
  if (BUY_NOW_DECISIONS.has(base.decision ?? '')) {
    const plan: WatchPlan = {
      ...base,
      reader: { status: 'ok', model: null, cost_usd: 0, at: clock().toISOString(), detail: `A ${base.decision} call: only its warnings are watched, so its text is not read.` },
    }
    savePlan(plan, stateDir)
    return { status: 'ok', plan, detail: plan.reader.detail, cost_usd: 0 }
  }
  const failed = (detail: string, cost: number, model: string | null): ReadOutcome => {
    // A re-read of a report corrected in place that fails keeps the earlier reading watched — and on disk — rather
    // than falling back to the record's own fields; the next check tries again.
    if (existing?.reader.status === 'ok') return { status: 'failed', plan: existing, detail, cost_usd: cost }
    const plan: WatchPlan = { ...base, reader: { status: 'failed', model, cost_usd: Math.round(cost * 10_000) / 10_000, at: clock().toISOString(), detail } }
    savePlan(plan, stateDir)
    return { status: 'failed', plan, detail, cost_usd: cost }
  }

  const model = readerModel(deps.model)
  if (!model) return failed('No model is allowed for reading on this machine.', 0, null)

  const budget: ReaderBudget = deps.budget ?? watchReaderBudget(stateDir)
  const remaining = budget.remaining()
  const hold = model.provider === 'codex' ? WATCH.codexReadEstimateUsd : remaining
  const limitText = `Today's $${WATCH.dailyUsd} reading limit is used up; reading resumes tomorrow.`
  // Out of allowance: keep what the record itself stores as data watched (saved, so the watcher can use it)
  // and say why the text is not read yet. A plan read earlier stays as it is.
  const overLimit = (): ReadOutcome => {
    if (existing?.reader.status === 'ok') return { status: 'budget', plan: existing, detail: limitText, cost_usd: 0 }
    const plan: WatchPlan = { ...base, reader: { ...base.reader, detail: limitText } }
    savePlan(plan, stateDir)
    return { status: 'budget', plan, detail: limitText, cost_usd: 0 }
  }
  if (!(remaining >= 0.05) || remaining < hold) return overLimit()
  const reservation = budget.tryReserve(hold)
  if (!reservation) return overLimit()

  let text = ''
  let outcome: { costUsd: number; error?: string }
  try {
    outcome = await (deps.runTurn ?? runChatTurn)({
      system: READER_SYSTEM,
      user: readerMessage(base, src),
      model: model.id,
      signal: new AbortController().signal,
      onToken: (t) => { text += t },
      timeoutMs: WATCH.readerTimeoutMs,
      thinkingTokens: WATCH.readerThinkingTokens,
      // No stop per read (operator decision): the only ceiling is what is left of today's total.
      budgetUsd: model.provider === 'codex' ? undefined : remaining,
    })
  } catch (e: any) {
    outcome = { costUsd: 0, error: String(e?.message ?? e) }
  }
  // A turn the provider's own limit rejected carried no answer, so it is not a read and costs nothing. On
  // Codex, where a read is counted at an estimate rather than measured, charging it would spend the day's
  // whole reading allowance on probes and then refuse to read once the provider's plan came back.
  const limited = !!outcome.error && isUsageLimitError(outcome.error)
  const cost = limited ? 0 : model.provider === 'codex' ? hold : Math.max(0, Number(outcome.costUsd) || 0)
  budget.reconcile(reservation, cost)

  // THE PLAN'S OWN USAGE LIMIT IS NOT A FAILED READ. It says nothing about this report — every read on the
  // machine fails the same way until the plan resets, in about five hours. Counted as a failure it spent the
  // three attempts at once and then stood the report down for a day: on the live cockpit all ten reports
  // failed inside 23 seconds and none was read again that day. It is recorded like the daily reading limit —
  // a reason the text is not read YET, with the record's own bad case and deal-breakers watched meanwhile.
  if (limited && outcome.error) {
    // Only a plan that was actually READ is kept: an older partial one would hold a corrected record's bad
    // case and deal-breakers out of the watch for the whole outage, though `base` is already rebuilt from the
    // current files (the same rule `failed` follows).
    if (existing?.reader.status === 'ok') return { status: 'limit', plan: existing, detail: outcome.error, cost_usd: cost }
    const plan: WatchPlan = { ...base, reader: { ...base.reader, detail: outcome.error } }
    savePlan(plan, stateDir)
    return { status: 'limit', plan, detail: outcome.error, cost_usd: cost }
  }
  if (outcome.error) return failed(outcome.error, cost, model.id)
  const parsed = parseReaderJson(text)
  if (!parsed) return failed('The answer was not the list that was asked for.', cost, model.id)

  const checked = validateReaderOutput(parsed, {
    sources: new Map(src.files.map((f) => [f.file, f.text])),
    currency: base.currency,
    entryPrice: base.entry_price,
  })
  // A look-again or fair price at the research's own bad case IS that line — already watched, and already
  // saying "check the research again first" (HAIER: "a move toward the bear-cyclical level (CNY 16.79) should
  // trigger a full re-underwrite"). One price, one line. A buy price there stays: it is another instruction.
  const bad = base.items.find((i): i is PlanPrice => i.kind === 'price' && i.role === 'bad_case')
  const atBad = (i: PlanItem): i is PlanPrice =>
    !!bad && i.kind === 'price' && i.role !== 'buy' && Math.abs(priceLine(i) - bad.low) / bad.low < 0.005
  const items = checked.items.filter((i) => !atBad(i))
  const left_out = [...checked.left_out, ...checked.items.filter(atBad).map((i) => ({
    what: `${roleWords(i.role)} ${i.low}`, why: "the same price as the research's bad case, which is already watched",
  }))]
  const plan: WatchPlan = {
    ...base,
    items: orderItems([...items, ...base.items]),
    left_out: [...base.left_out, ...left_out],
    reader: {
      status: 'ok', model: model.id, cost_usd: Math.round(cost * 10_000) / 10_000, at: clock().toISOString(),
      detail: `${items.length} ${items.length === 1 ? 'item' : 'items'} kept from the text${left_out.length ? `, ${left_out.length} left out` : ''}.`,
    },
  }
  savePlan(plan, stateDir)
  return { status: 'ok', plan, detail: plan.reader.detail, cost_usd: cost }
}
