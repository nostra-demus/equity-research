// Persistent store for the cockpit "chat with your data" (Ask) conversations.
//
// The Ask panel used to be entirely ephemeral: a conversation lived only in the browser's memory and was
// gone on refresh, close, scope-switch, or company-switch — so there was no way to view chat history or
// pick a conversation back up. This module gives every conversation a durable home: one JSON file per
// conversation under STATE_DIR/chats/ (gitignored, survives restarts/deploys, exactly like the append-only
// activity log). Each conversation records WHO asked (the Cloudflare Access identity, resolved server-side —
// never client-supplied), WHEN (created/updated timestamps + a per-message timestamp), and WHAT it was
// about (swarm/subject/scope), plus the full transcript so it can be reopened and continued.
//
// Identity is authoritative from the server (server.ts `identify`), never from the request body, so a
// conversation can't be misattributed by a tampered client. Writes are atomic (temp file + rename) and
// serialized per conversation id, so two turns landing close together can't corrupt or lose a message.
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { CHATS_DIR } from './config'

export type ChatRole = 'user' | 'assistant'
export type ChatScope = 'run' | 'module' | 'orb'
export type UserVia = 'cf-access' | 'local'

export interface StoredChatMessage {
  role: ChatRole
  content: string
  ts: number // epoch ms
  sourcePath?: string // assistant turns: the scope/source the answer drew from (from chat-meta)
  costUsd?: number // assistant turns: the metered cost of that turn, when known
  thinking?: string // assistant turns: the model's extended-thinking reasoning for this answer, when captured
}

// The identity + scope of a conversation — everything needed to reopen it against the right run and to
// attribute + list it. Supplied by the route from the authoritative identity + the validated request.
export interface ConversationMeta {
  user: string
  userVia: UserVia
  swarm: string // 'research' | a SWARM.md id like 'commodity'
  subject: string // ticker (research) / subject id (constellation swarm)
  scope: ChatScope
  module?: string
  orbPath?: string // run-root-relative path of the orb output (orb scope) — may go stale across re-runs
  orbKey?: string // stable node key of the orb (module/nn_slug) — survives re-runs, drives the reopen
  runRoot?: string // the run folder this conversation was answered from, at creation time
  title: string // the panel's header title, e.g. "Ask · EMAR — whole run"
  model?: string
  style?: string
}

export interface ChatConversation extends ConversationMeta {
  v: 1
  id: string
  createdAt: number
  updatedAt: number
  costUsd: number // cumulative across all assistant turns
  messages: StoredChatMessage[]
}

// A lightweight row for the history browser — never carries the full transcript.
export interface ConversationSummary {
  id: string
  user: string
  userVia: UserVia
  swarm: string
  subject: string
  scope: ChatScope
  module?: string
  orbKey?: string
  title: string
  model?: string
  createdAt: number
  updatedAt: number
  messageCount: number
  costUsd: number
  preview: string // first user question, trimmed
  lastPreview: string // most recent message, trimmed
}

// Defensive bounds so a pathological client can't grow one file without limit. The request layer already
// caps each message at 20k chars and the LLM context at 40 messages; storage keeps more history than the
// model sees, but not unboundedly.
const MAX_MESSAGES_PER_CONVO = 400
const MAX_CONTENT_CHARS = 24_000
const PREVIEW_CHARS = 160
const LIST_MAX_SCAN = 4000 // never read more than this many files to build a listing

// A conversation id is server-minted from a safe alphabet so it maps 1:1 to a filename with zero path
// traversal surface. Every id that reaches the filesystem (create OR a client-echoed id) is validated
// against this before we build a path from it.
const ID_RE = /^chat_[a-z0-9]{1,20}_[a-f0-9]{6,16}$/
export function isValidConversationId(id: unknown): id is string {
  return typeof id === 'string' && ID_RE.test(id)
}
function newId(): string {
  // time prefix keeps ids loosely sortable; the random suffix makes collisions effectively impossible.
  return `chat_${Date.now().toString(36)}_${crypto.randomBytes(5).toString('hex')}`
}

// Resolve an id to its file, asserting the result stays inside CHATS_DIR (belt-and-braces on top of ID_RE).
// path.basename strips any directory component the id could carry, so the sink below never sees a
// traversal-capable string even if a caller ever skipped the ID_RE check upstream.
function fileFor(id: string): string {
  const safeId = path.basename(id)
  const file = path.join(CHATS_DIR, `${safeId}.json`)
  const dir = path.resolve(CHATS_DIR)
  if (safeId !== id || path.dirname(path.resolve(file)) !== dir) throw new Error('unsafe conversation id')
  return file
}

const disabled = () => process.env.ENGINE_CHAT_HISTORY_DISABLED === '1'

function trim(s: string, n = PREVIEW_CHARS): string {
  const one = String(s ?? '').replace(/\s+/g, ' ').trim()
  return one.length > n ? one.slice(0, n - 1) + '…' : one
}
function clampContent(s: string): string {
  const str = String(s ?? '')
  return str.length > MAX_CONTENT_CHARS ? str.slice(0, MAX_CONTENT_CHARS) : str
}

function readConvoFile(file: string): ChatConversation | null {
  let raw: string
  try {
    raw = fs.readFileSync(file, 'utf8')
  } catch {
    return null // missing / unreadable
  }
  try {
    const o = JSON.parse(raw) as ChatConversation
    if (o && o.id && Array.isArray(o.messages)) return o
  } catch {
    /* corrupt file — treated as absent */
  }
  return null
}

// Atomic write: a temp sibling + rename, so a reader never sees a half-written file and a crash mid-write
// can't corrupt the existing conversation (the old file stays until rename replaces it).
function writeConvoFile(convo: ChatConversation): void {
  fs.mkdirSync(CHATS_DIR, { recursive: true })
  const file = fileFor(convo.id)
  const tmp = `${file}.tmp.${crypto.randomBytes(4).toString('hex')}`
  fs.writeFileSync(tmp, JSON.stringify(convo))
  fs.renameSync(tmp, file)
}

// Serialize all mutations of a single conversation so two near-simultaneous turns for the same id can't
// interleave a read-modify-write and drop a message. Different ids run in parallel (each its own chain).
const chains = new Map<string, Promise<unknown>>()
function withLock<T>(id: string, fn: () => T | Promise<T>): Promise<T> {
  const prev = chains.get(id) ?? Promise.resolve()
  const run = prev.then(fn, fn) // run regardless of a prior turn's outcome
  // a settled-swallowing tail is what the NEXT op waits on, so one turn's failure never wedges the chain;
  // storing the same `tail` reference we compare against lets us clean the map up once the chain is idle.
  const tail = run.then(() => {}, () => {})
  chains.set(id, tail)
  void tail.finally(() => { if (chains.get(id) === tail) chains.delete(id) })
  return run
}

// Only reuse a client-echoed conversation id when it is well-formed, exists, AND belongs to the SAME user.
// This is the write-side ownership guard: because GET /api/chats exposes every conversation's id to every
// operator, an id alone must never let one operator append turns to (or rewrite the metadata of) another
// operator's saved thread — that would silently misattribute a question to the original owner. A mismatched
// or unknown id falls through to a fresh conversation owned by the caller (continuing someone else's chat
// therefore forks it into your own, rather than injecting into theirs).
function ownedExistingId(requestedId: string | undefined, user: string): string | null {
  if (!isValidConversationId(requestedId)) return null
  const c = readConvoFile(fileFor(requestedId))
  return c && c.user === user ? requestedId : null
}

// Record a user question, creating the conversation on the first turn. Returns the resolved conversation
// (its `id` is what the route echoes back so subsequent turns attach here). `requestedId` is the client's
// echoed conversation id: honoured when valid, existing, AND owned by this user; otherwise a fresh id is minted.
export function recordUserMessage(meta: ConversationMeta, content: string, requestedId?: string): Promise<ChatConversation> {
  const existingId = ownedExistingId(requestedId, meta.user)
  const id = existingId ?? newId()
  return withLock(id, () => {
    const now = Date.now()
    const msg: StoredChatMessage = { role: 'user', content: clampContent(content), ts: now }
    let convo = existingId ? readConvoFile(fileFor(id)) : null
    if (convo) {
      // keep identity + subject/scope from creation authoritative; refresh the mutable presentation bits
      convo.title = meta.title || convo.title
      convo.model = meta.model ?? convo.model
      convo.style = meta.style ?? convo.style
      if (meta.runRoot) convo.runRoot = meta.runRoot
      if (meta.orbPath) convo.orbPath = meta.orbPath
      convo.messages.push(msg)
      convo.updatedAt = now
    } else {
      convo = {
        v: 1,
        id,
        user: meta.user,
        userVia: meta.userVia,
        swarm: meta.swarm,
        subject: meta.subject,
        scope: meta.scope,
        module: meta.module,
        orbPath: meta.orbPath,
        orbKey: meta.orbKey,
        runRoot: meta.runRoot,
        title: meta.title,
        model: meta.model,
        style: meta.style,
        createdAt: now,
        updatedAt: now,
        costUsd: 0,
        messages: [msg],
      }
    }
    if (convo.messages.length > MAX_MESSAGES_PER_CONVO) convo.messages = convo.messages.slice(-MAX_MESSAGES_PER_CONVO)
    if (!disabled()) writeConvoFile(convo)
    return convo
  })
}

// Record the assistant's answer for a turn already opened by recordUserMessage. No-op if the conversation
// vanished (deleted mid-turn) — the turn still streamed to the user; only its history line is lost.
export function recordAssistantMessage(id: string, content: string, extra?: { sourcePath?: string; costUsd?: number; thinking?: string }): Promise<void> {
  if (!isValidConversationId(id)) return Promise.resolve()
  return withLock(id, () => {
    const convo = readConvoFile(fileFor(id))
    if (!convo) return
    const now = Date.now()
    convo.messages.push({ role: 'assistant', content: clampContent(content), ts: now, sourcePath: extra?.sourcePath, costUsd: extra?.costUsd, thinking: extra?.thinking ? clampContent(extra.thinking) : undefined })
    if (convo.messages.length > MAX_MESSAGES_PER_CONVO) convo.messages = convo.messages.slice(-MAX_MESSAGES_PER_CONVO)
    convo.updatedAt = now
    if (typeof extra?.costUsd === 'number' && extra.costUsd > 0) convo.costUsd = +(convo.costUsd + extra.costUsd).toFixed(4)
    if (!disabled()) writeConvoFile(convo)
  })
}

export function getConversation(id: string): ChatConversation | null {
  if (!isValidConversationId(id)) return null
  return readConvoFile(fileFor(id))
}

export function deleteConversation(id: string): boolean {
  if (!isValidConversationId(id)) return false
  try {
    fs.unlinkSync(fileFor(id))
    return true
  } catch {
    return false // already gone / unreadable
  }
}

function toSummary(c: ChatConversation): ConversationSummary {
  const firstUser = c.messages.find((m) => m.role === 'user')
  const last = c.messages[c.messages.length - 1]
  return {
    id: c.id,
    user: c.user,
    userVia: c.userVia,
    swarm: c.swarm,
    subject: c.subject,
    scope: c.scope,
    module: c.module,
    orbKey: c.orbKey,
    title: c.title,
    model: c.model,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
    messageCount: c.messages.length,
    costUsd: c.costUsd,
    preview: trim(firstUser?.content ?? ''),
    lastPreview: trim(last?.content ?? ''),
  }
}

export interface ConversationQuery {
  user?: string
  subject?: string
  swarm?: string
  scope?: ChatScope
  q?: string // free text over user / subject / title / preview
  from?: number
  to?: number
  limit?: number
}

export interface ConversationListResult {
  conversations: ConversationSummary[]
  total: number // matching the filter (before limit)
  allTime: number // conversations stored in total
  users: string[] // distinct users, for the filter dropdown
  subjects: string[] // distinct subjects, for the filter dropdown
  earliest: number | null
}

// List conversations as summaries, newest-updated first, with the same filter surface as the activity log.
export function listConversations(query: ConversationQuery = {}): ConversationListResult {
  let files: string[]
  try {
    files = fs.readdirSync(CHATS_DIR).filter((f) => f.endsWith('.json'))
  } catch {
    return { conversations: [], total: 0, allTime: 0, users: [], subjects: [], earliest: null }
  }
  // Order by file mtime FIRST (a cheap stat, no read), so when there are more conversations than we're
  // willing to read (LIST_MAX_SCAN) we keep the NEWEST ones — not an arbitrary readdir/inode-order subset,
  // which would silently drop the most recent conversations. mtime tracks the last write closely enough to
  // pick the right set; the exact newest-first order is fixed by the updatedAt sort just below.
  const byMtime = files
    .map((f) => { let m = 0; try { m = fs.statSync(path.join(CHATS_DIR, f)).mtimeMs } catch { /* vanished mid-scan */ } return { f, m } })
    .sort((a, b) => b.m - a.m)
  const all: ChatConversation[] = []
  for (const { f } of byMtime.slice(0, LIST_MAX_SCAN)) {
    const c = readConvoFile(path.join(CHATS_DIR, f))
    if (c) all.push(c)
  }
  all.sort((a, b) => b.updatedAt - a.updatedAt)

  const users = [...new Set(all.map((c) => c.user))].sort()
  const subjects = [...new Set(all.map((c) => c.subject))].sort()
  const earliest = all.length ? Math.min(...all.map((c) => c.createdAt)) : null

  const q = query.q?.trim().toLowerCase()
  const matched = all.filter((c) => {
    if (query.user && c.user !== query.user) return false
    if (query.subject && c.subject !== query.subject) return false
    if (query.swarm && c.swarm !== query.swarm) return false
    if (query.scope && c.scope !== query.scope) return false
    if (query.from != null && c.updatedAt < query.from) return false
    if (query.to != null && c.updatedAt > query.to) return false
    if (q) {
      const firstUser = c.messages.find((m) => m.role === 'user')?.content ?? ''
      const hay = `${c.user} ${c.subject} ${c.title} ${firstUser}`.toLowerCase()
      if (!hay.includes(q)) return false
    }
    return true
  })

  // A non-positive / missing limit (e.g. an empty ?limit= → 0) falls back to the default, never collapses to 1.
  const limit = Math.max(1, Math.min(2000, query.limit && query.limit > 0 ? query.limit : 500))
  return {
    conversations: matched.slice(0, limit).map(toSummary),
    total: matched.length,
    allTime: files.length, // true total on disk (not just the read subset)
    users,
    subjects,
    earliest,
  }
}
