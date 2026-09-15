// The cockpit's watchlist messages. One message per name: the first thing goes out at once, and anything
// else about that name in the next 30 minutes is added to the same unread message rather than starting a
// new one. Every message can be marked read, deleted, or answered "was this right?" — the answers, counted
// by message type, are how the thresholds get tuned.
//
// Kept in STATE_DIR (private, gitignored): a message is about the operator's own list and today's prices,
// not research data. Delete hides a message from the list; the record stays, so its feedback still counts
// and the log can always say what was sent.
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { CONDITION_STATUS, STATUS_RANK, type ConditionType, type StatusWord } from './evaluate'

export const MESSAGES_SCHEMA = 'watch-messages/v1' as const
export const GROUP_WINDOW_MS = 30 * 60_000
const KEEP_MESSAGES = 2000
export const MAX_EMAIL_ATTEMPTS = 6

/** Message items that are not conditions: what the watcher itself has to say. None is urgent except
 *  'research_buy_now' — new research that says buy, on the fixed urgent list beside the crossed lines. The one
 *  'email_test' is emailed on purpose (monitor.ts), and says it is a test. */
export type SystemItemType = 'now_watching' | 'already_there' | 'removed' | 'cockpit_was_off' | 'setup_failed' | 'research_buy_now' | 'email_test'
export type MessageItemType = ConditionType | SystemItemType

export interface WatchMessageItem {
  id: string
  type: MessageItemType
  urgent: boolean
  title: string
  detail: string
  quote: string | null
  source: string | null
  at: string
  /** Set on items inside a summary, which covers several names. */
  ticker?: string | null
}

export type EmailStateName = 'not_urgent' | 'pending' | 'sent' | 'failed' | 'off' | 'paused' | 'skipped'
export interface EmailState {
  state: EmailStateName
  /** Items already emailed — a later urgent item on the same message goes out as a follow-up. */
  sent_items: string[]
  attempts: number
  last_attempt_at: string | null
  sent_at: string | null
  detail: string
  /** Items that reached some addresses but not all, by address tag (email.ts recipientTag — never the address):
   *  a retry sends each address only what it has not had. Cleared once every address has everything. */
  delivered?: Record<string, string[]>
}

export interface WatchMessage {
  id: string
  kind: 'name' | 'summary' | 'system'
  listing_key: string | null
  ticker: string | null
  company_name: string | null
  status: StatusWord | null
  title: string
  urgent: boolean
  items: WatchMessageItem[]
  created_at: string
  updated_at: string
  read_at: string | null
  read_by: string | null
  deleted_at: string | null
  deleted_by: string | null
  feedback: { verdict: 'yes' | 'no'; note: string; at: string; by: string } | null
  email: EmailState
}

export interface EmailOptions { enabled: boolean; paused: boolean }

const itemRank = (t: MessageItemType): number =>
  t in CONDITION_STATUS ? STATUS_RANK[CONDITION_STATUS[t as ConditionType]]
    // "Research says buy now" leads its message like a buy price reached: only a warning comes before it.
    : t === 'research_buy_now' ? STATUS_RANK.buy_price_reached : 7

function sortItems(items: WatchMessageItem[]): WatchMessageItem[] {
  return [...items].sort((a, b) => itemRank(a.type) - itemRank(b.type))
}

function emailStateFor(urgent: boolean, opts: EmailOptions): EmailStateName {
  if (!urgent) return 'not_urgent'
  if (opts.paused) return 'paused'
  return opts.enabled ? 'pending' : 'off'
}

export function newMessageId(now: Date): string {
  const d = now.toISOString().slice(0, 10).replace(/-/g, '')
  return `WM-${d}-${crypto.randomBytes(4).toString('hex')}`
}
export const MESSAGE_ID_RE = /^WM-\d{8}-[a-f0-9]{8}$/

function validMessage(m: any): m is WatchMessage {
  return m && typeof m === 'object' && typeof m.id === 'string' && Array.isArray(m.items)
    && typeof m.created_at === 'string' && m.email && typeof m.email === 'object' && Array.isArray(m.email.sent_items)
}

export function unsentUrgent(m: WatchMessage): WatchMessageItem[] {
  return m.items.filter((i) => i.urgent && !m.email.sent_items.includes(i.id))
}

export class WatchInbox {
  private messages: WatchMessage[]

  constructor(private readonly dir: string) {
    this.messages = this.load()
  }

  private get file(): string { return path.join(this.dir, 'messages.json') }
  private get logFile(): string { return path.join(this.dir, 'messages.jsonl') }

  private load(): WatchMessage[] {
    try {
      const j = JSON.parse(fs.readFileSync(this.file, 'utf8'))
      return Array.isArray(j?.messages) ? j.messages.filter(validMessage) : []
    } catch {
      return []
    }
  }

  private persist(): void {
    try {
      fs.mkdirSync(this.dir, { recursive: true, mode: 0o700 })
      const tmp = `${this.file}.tmp-${process.pid}-${crypto.randomBytes(4).toString('hex')}`
      fs.writeFileSync(tmp, JSON.stringify({ schema_version: MESSAGES_SCHEMA, messages: this.messages }) + '\n', { mode: 0o600 })
      fs.renameSync(tmp, this.file)
    } catch { /* best-effort: the in-memory list still serves; the next write retries the whole file */ }
  }

  private log(entry: Record<string, unknown>): void {
    try {
      fs.mkdirSync(this.dir, { recursive: true, mode: 0o700 })
      fs.appendFileSync(this.logFile, JSON.stringify(entry) + '\n', { mode: 0o600 })
    } catch { /* the log is for audit; a failed append must never lose the message itself */ }
  }

  /** Every message, deleted ones included (newest first). */
  all(): WatchMessage[] { return this.messages }
  /** What the cockpit shows: newest first, deleted ones hidden. */
  list(): WatchMessage[] { return this.messages.filter((m) => !m.deleted_at) }
  get(id: string): WatchMessage | null { return this.messages.find((m) => m.id === id) ?? null }
  unreadCount(): number { return this.list().filter((m) => !m.read_at).length }

  private insert(m: WatchMessage): void {
    this.messages = [m, ...this.messages].slice(0, KEEP_MESSAGES)
  }

  /**
   * Add what just happened to one name. Joins the newest UNREAD message for that name if it began less than
   * 30 minutes ago; otherwise starts a new message. A message you already read is never grown behind your
   * back — new items after that start a new, unread one.
   */
  addForName(
    name: { listing_key: string; ticker: string; company_name: string | null },
    status: StatusWord,
    items: WatchMessageItem[],
    email: EmailOptions,
    now: Date,
  ): WatchMessage | null {
    if (!items.length) return null
    const at = now.toISOString()
    const open = this.messages.find((m) =>
      m.kind === 'name' && m.listing_key === name.listing_key && !m.read_at && !m.deleted_at
      && now.getTime() - Date.parse(m.created_at) < GROUP_WINDOW_MS)
    if (open) {
      const have = new Set(open.items.map((i) => i.id))
      const added = items.filter((i) => !have.has(i.id))
      if (!added.length) return open
      open.items = sortItems([...open.items, ...added])
      open.title = open.items[0].title
      if (STATUS_RANK[status] < STATUS_RANK[open.status ?? 'waiting']) open.status = status
      const nowUrgent = open.items.some((i) => i.urgent)
      if (nowUrgent && !open.urgent) {
        open.urgent = true
        if (open.email.state === 'not_urgent') open.email.state = emailStateFor(true, email)
      }
      open.updated_at = at
      this.log({ at, op: 'grow', id: open.id, ticker: name.ticker, items: added.map((i) => i.type) })
      this.persist()
      return open
    }
    const sorted = sortItems(items)
    const urgent = sorted.some((i) => i.urgent)
    const m: WatchMessage = {
      id: newMessageId(now), kind: 'name', listing_key: name.listing_key, ticker: name.ticker, company_name: name.company_name,
      status, title: sorted[0].title, urgent, items: sorted, created_at: at, updated_at: at,
      read_at: null, read_by: null, deleted_at: null, deleted_by: null, feedback: null,
      email: { state: emailStateFor(urgent, email), sent_items: [], attempts: 0, last_attempt_at: null, sent_at: null, detail: '' },
    }
    this.insert(m)
    this.log({ at, op: 'add', id: m.id, ticker: name.ticker, urgent, items: sorted.map((i) => i.type) })
    this.persist()
    return m
  }

  /** A message about the watchlist as a whole (the first-day summary, the cockpit having been off, the one
   *  test email). Never urgent, so the urgent path never emails it; only the test is sent, on purpose. */
  addGeneral(kind: 'summary' | 'system', title: string, items: WatchMessageItem[], now: Date): WatchMessage {
    const at = now.toISOString()
    const m: WatchMessage = {
      id: newMessageId(now), kind, listing_key: null, ticker: null, company_name: null, status: null, title,
      urgent: false, items, created_at: at, updated_at: at, read_at: null, read_by: null, deleted_at: null, deleted_by: null,
      feedback: null, email: { state: 'not_urgent', sent_items: [], attempts: 0, last_attempt_at: null, sent_at: null, detail: '' },
    }
    this.insert(m)
    this.log({ at, op: 'add', id: m.id, kind, items: items.length })
    this.persist()
    return m
  }

  markRead(id: string, read: boolean, by: string, now: Date): WatchMessage | null {
    const m = this.get(id)
    if (!m || m.deleted_at) return null
    const at = now.toISOString()
    m.read_at = read ? (m.read_at ?? at) : null
    m.read_by = read ? (m.read_by ?? by) : null
    // Read in the cockpit before the email went out: the email would only repeat what was already seen.
    if (read && m.email.state === 'pending') { m.email.state = 'skipped'; m.email.detail = 'Read in the cockpit before it was emailed.' }
    this.log({ at, op: read ? 'read' : 'unread', id, by })
    this.persist()
    return m
  }

  readAll(by: string, now: Date): number {
    let n = 0
    for (const m of this.list()) {
      if (m.read_at) continue
      this.markRead(m.id, true, by, now)
      n++
    }
    return n
  }

  remove(id: string, by: string, now: Date): WatchMessage | null {
    const m = this.get(id)
    if (!m || m.deleted_at) return null
    const at = now.toISOString()
    m.deleted_at = at
    m.deleted_by = by
    if (m.email.state === 'pending') { m.email.state = 'skipped'; m.email.detail = 'Deleted before it was emailed.' }
    this.log({ at, op: 'delete', id, by })
    this.persist()
    return m
  }

  feedback(id: string, verdict: 'yes' | 'no', note: string, by: string, now: Date): WatchMessage | null {
    const m = this.get(id)
    if (!m) return null
    const at = now.toISOString()
    m.feedback = { verdict, note: note.trim().slice(0, 1000), at, by }
    this.log({ at, op: 'feedback', id, by, verdict, type: m.items[0]?.type ?? null, note: m.feedback.note })
    this.persist()
    return m
  }

  /** "Was this right?" answers, counted by the message's leading item type — the tuning signal. */
  tally(): { type: string; yes: number; no: number }[] {
    const by = new Map<string, { yes: number; no: number }>()
    for (const m of this.messages) {
      if (!m.feedback) continue
      const t = m.items[0]?.type ?? 'unknown'
      const row = by.get(t) ?? { yes: 0, no: 0 }
      row[m.feedback.verdict]++
      by.set(t, row)
    }
    return [...by.entries()].map(([type, v]) => ({ type, ...v })).sort((a, b) => a.type.localeCompare(b.type))
  }

  /** Messages with urgent items not yet emailed, and room for another attempt. */
  pendingEmail(): WatchMessage[] {
    return this.messages.filter((m) => {
      if (m.deleted_at || m.read_at || m.email.attempts >= MAX_EMAIL_ATTEMPTS) return false
      const s = m.email.state
      if (s === 'pending' || s === 'failed') return unsentUrgent(m).length > 0
      return s === 'sent' && unsentUrgent(m).length > 0
    })
  }

  /**
   * Record one send. `ok` means every address now has every item. Otherwise the message stays failed and is tried
   * again, and `delivered` records what did reach an address, so the next try sends each address only the rest.
   */
  markEmailed(
    sent: { message: WatchMessage; items: WatchMessageItem[] }[], ok: boolean, detail: string, now: Date,
    delivered: { message_id: string; tag: string; items: string[] }[] = [],
  ): void {
    const at = now.toISOString()
    for (const { message, items } of sent) {
      const m = this.get(message.id)
      if (!m) continue
      m.email.attempts++
      m.email.last_attempt_at = at
      m.email.detail = detail
      if (ok) {
        m.email.state = 'sent'
        m.email.sent_at = at
        m.email.sent_items = [...new Set([...m.email.sent_items, ...items.map((i) => i.id)])]
        m.email.attempts = 0
        delete m.email.delivered
      } else {
        m.email.state = 'failed'
        for (const d of delivered) {
          if (d.message_id !== m.id) continue
          const had = m.email.delivered ?? {}
          had[d.tag] = [...new Set([...(had[d.tag] ?? []), ...d.items])]
          m.email.delivered = had
        }
      }
      this.log({ at, op: ok ? 'emailed' : 'email_failed', id: m.id, items: items.map((i) => i.type), detail })
    }
    this.persist()
  }

  /** Email paused for a name: what was already waiting to go (held for the grouping window, or retrying) does
   *  not go either. It stays in the cockpit, marked paused. */
  pauseEmail(listingKey: string, now: Date): number {
    let n = 0
    for (const m of this.messages) {
      if (m.listing_key !== listingKey || (m.email.state !== 'pending' && m.email.state !== 'failed')) continue
      m.email.state = 'paused'
      m.email.detail = 'Email was paused for this name before it went out.'
      n++
    }
    if (n) {
      this.log({ at: now.toISOString(), op: 'email_paused', listing_key: listingKey, messages: n })
      this.persist()
    }
    return n
  }
}
