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
import { acquireRetainedFlock, acquireRetainedFlockSync, releaseRetainedFlock } from './singleton-lock'

export type ChatRole = 'user' | 'assistant'
export type ChatScope = 'run' | 'module' | 'orb'
export type UserVia = 'cf-access' | 'local'

export interface StoredChatMessage {
  role: ChatRole
  content: string
  ts: number // epoch ms
  // Completed streamed turns share one id on their question and answer. Besides making retries
  // reconcilable, this is the durable boundary used for ordering and retention.
  turnId?: string
  sourcePath?: string // assistant turns: the scope/source the answer drew from (from chat-meta)
  costUsd?: number // assistant turns: the metered cost of that turn, when known
  thinking?: string // assistant turns: the model's extended-thinking reasoning for this answer, when captured
  computed?: unknown[] // assistant turns: bounded deterministic what-if cards streamed before the prose
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
  // Highest question-arrival timestamp intentionally removed by bounded transcript retention. WAL healing
  // uses this durable floor to distinguish a genuinely pruned old turn from a receipt→transcript crash gap.
  prunedThroughTs?: number
  // Turn ids whose pair was intentionally removed by retention but whose aggregate cost/metadata was already
  // settled. This makes receipt healing idempotent even when a WAL-only turn falls behind the prune floor.
  settledPrunedTurnIds?: string[]
  // Arrival time of the user turn whose mutable presentation metadata last won. Optional for older files.
  // Comparing this with a pending turn's monotonic message timestamp prevents a slower, older completion
  // from overwriting the title/model/runRoot chosen by a newer question.
  metaUpdatedAt?: number
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
const MAX_COMPLETION_RECEIPTS = 10_000
// Prune in batches. Trimming to the hard ceiling made every subsequent completion rescan + stat all
// 10,000 receipts; the low-water mark amortizes that work across the next thousand completions.
const COMPLETION_RECEIPT_LOW_WATER = 9_000
const MAX_RECEIPT_CACHE = 512
const MAX_COMPUTED_PAYLOADS = 6
const MAX_COMPUTED_JSON_CHARS = 64_000
const RECEIPTS_DIR = path.join(CHATS_DIR, 'turn-receipts')
const TURN_RESERVATIONS_DIR = path.join(CHATS_DIR, 'turn-reservations')
const CONVERSATION_MUTATIONS_DIR = path.join(CHATS_DIR, 'conversation-mutations')
const CONVERSATION_CLOCKS_DIR = path.join(CHATS_DIR, 'conversation-clocks')
const CONVERSATION_OWNERS_DIR = path.join(CHATS_DIR, 'conversation-owners')
const REVOCATIONS_DIR = path.join(CHATS_DIR, 'conversation-revocations')
// Stable kernel-lock files must never be unlinked. Hashing unbounded client/conversation ids into a fixed
// pool keeps that safety property without allowing canceled turns or deleted chats to grow inode use
// forever. At the server's maximum of three simultaneous chats, cross-key contention is vanishingly rare;
// it only causes a safe retry, never duplicate paid work or a lost write.
// These `.flock` shards are a fresh chat namespace. Production rollout is generation-drained by the one
// launchd job plus server.ts's STATE_DIR-wide retained `engine.lock` before routes listen, so a baseline
// process with only its in-memory chat chain cannot overlap this protocol against the same local state.
const LOCK_SHARD_COUNT = 4096

// A conversation id is server-minted from a safe alphabet so it maps 1:1 to a filename with zero path
// traversal surface. Every id that reaches the filesystem (create OR a client-echoed id) is validated
// against this before we build a path from it.
const ID_RE = /^chat_[a-z0-9]{1,20}_[a-f0-9]{6,16}$/
export function isValidConversationId(id: unknown): id is string {
  return typeof id === 'string' && ID_RE.test(id)
}

// Client-minted turn ids are deliberately a separate namespace from conversation ids. The restricted
// alphabet is safe to log and transport in headers while leaving enough room for UUID/random encodings.
const TURN_ID_RE = /^turn_[a-z0-9_-]{8,100}$/
export function isValidTurnId(id: unknown): id is string {
  return typeof id === 'string' && TURN_ID_RE.test(id)
}

export class ChatTurnReservationError extends Error {
  constructor(public readonly code: 'INVALID_TURN_ID' | 'TURN_ALREADY_PENDING' | 'TURN_CONTEXT_MISMATCH' | 'CONVERSATION_BUSY', message: string) {
    super(message)
    this.name = 'ChatTurnReservationError'
  }
}

function newId(): string {
  // time prefix keeps ids loosely sortable; the random suffix makes collisions effectively impossible.
  return `chat_${Date.now().toString(36)}_${crypto.randomBytes(5).toString('hex')}`
}

function newTurnId(): string {
  return `turn_${crypto.randomBytes(12).toString('hex')}`
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

function userHash(user: string): string {
  return crypto.createHash('sha256').update(user).digest('hex')
}

function receiptKeyFor(user: string, turnId: string): string {
  return `${userHash(user)}_${turnId}`
}

function receiptFileFor(user: string, turnId: string): string {
  const key = receiptKeyFor(user, turnId)
  const file = path.join(RECEIPTS_DIR, `${key}.json`)
  if (path.basename(key) !== key || path.dirname(path.resolve(file)) !== path.resolve(RECEIPTS_DIR)) {
    throw new Error('unsafe chat turn receipt key')
  }
  return file
}

function lockShardFile(dir: string, namespace: string, key: string): string {
  const digest = crypto.createHash('sha256').update(`${namespace}\0${key}`).digest()
  const shard = digest.readUInt32BE(0) % LOCK_SHARD_COUNT
  return path.join(dir, `shard-${shard.toString(16).padStart(3, '0')}.flock`)
}

function turnReservationFileFor(user: string, turnId: string): string {
  return lockShardFile(TURN_RESERVATIONS_DIR, 'chat-turn', receiptKeyFor(user, turnId))
}

function conversationMutationFileFor(id: string): string {
  if (!isValidConversationId(id)) throw new Error('unsafe conversation mutation id')
  return lockShardFile(CONVERSATION_MUTATIONS_DIR, 'chat-conversation', id)
}

function conversationClockFileFor(id: string): string {
  if (!isValidConversationId(id)) throw new Error('unsafe conversation clock id')
  const file = path.join(CONVERSATION_CLOCKS_DIR, `${id}.json`)
  if (path.basename(id) !== id || path.dirname(path.resolve(file)) !== path.resolve(CONVERSATION_CLOCKS_DIR)) {
    throw new Error('unsafe conversation clock key')
  }
  return file
}

function revocationFileFor(user: string, id: string): string {
  if (!isValidConversationId(id)) throw new Error('unsafe conversation revocation id')
  const key = `${userHash(user)}_${id}`
  const file = path.join(REVOCATIONS_DIR, `${key}.json`)
  if (path.basename(key) !== key || path.dirname(path.resolve(file)) !== path.resolve(REVOCATIONS_DIR)) {
    throw new Error('unsafe conversation revocation key')
  }
  return file
}

function conversationOwnerFileFor(user: string, id: string): string {
  if (!isValidConversationId(id)) throw new Error('unsafe conversation owner id')
  const key = `${userHash(user)}_${id}`
  const file = path.join(CONVERSATION_OWNERS_DIR, `${key}.json`)
  if (path.basename(key) !== key || path.dirname(path.resolve(file)) !== path.resolve(CONVERSATION_OWNERS_DIR)) {
    throw new Error('unsafe conversation owner key')
  }
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

function clampComputed(computed: unknown[] | undefined): unknown[] | undefined {
  if (!Array.isArray(computed) || computed.length === 0) return undefined
  const kept: unknown[] = []
  let chars = 0
  for (const payload of computed.slice(0, MAX_COMPUTED_PAYLOADS)) {
    try {
      const encoded = JSON.stringify(payload)
      if (encoded === undefined || chars + encoded.length > MAX_COMPUTED_JSON_CHARS) break
      kept.push(JSON.parse(encoded))
      chars += encoded.length
    } catch {
      // A circular / non-JSON payload must not make chat-history persistence fail.
    }
  }
  return kept.length ? kept : undefined
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
  if (isConversationRevoked(convo.user, convo.id)) throw new Error('conversation was deleted')
  fs.mkdirSync(CHATS_DIR, { recursive: true })
  const file = fileFor(convo.id)
  const tmp = `${file}.tmp.${crypto.randomBytes(4).toString('hex')}`
  fs.writeFileSync(tmp, JSON.stringify(convo))
  fs.renameSync(tmp, file)
  // Close the cross-process race where deletion publishes its tombstone and unlinks just before this
  // rename. Whichever ordering wins, a revoked transcript can never remain visible or be resurrected.
  if (isConversationRevoked(convo.user, convo.id)) {
    try { fs.unlinkSync(file) } catch { /* the deleting process may already have removed it */ }
    throw new Error('conversation was deleted')
  }
}

type ReceiptConversation = Omit<ChatConversation, 'messages'>

interface CompletionReceipt {
  v: 1
  userHash: string
  turnId: string
  completedAt: number
  conversation: ReceiptConversation
  userMessage: StoredChatMessage
  assistantMessage: StoredChatMessage
  // True when this pair remained in the bounded transcript at receipt publication. A receipt is the WAL:
  // if the following transcript write never lands, this bit lets replay heal the missing pair without
  // re-inserting an old turn that a later 400-message retention pass intentionally removed.
  turnRetained?: boolean
}

export interface CompletedChatTurn {
  // The receipt intentionally carries only this completed pair, not the independently pruned transcript.
  conversation: ChatConversation
  userMessage: StoredChatMessage
  assistantMessage: StoredChatMessage
}

const receiptCache = new Map<string, CompletionReceipt>()
const memoryRevocations = new Set<string>()
let durableReceiptCount: number | null = null

function revocationKey(user: string, id: string): string {
  return `${userHash(user)}_${id}`
}

function hasConversationOwner(user: string, id: string): boolean {
  try {
    const marker = JSON.parse(fs.readFileSync(conversationOwnerFileFor(user, id), 'utf8')) as Record<string, unknown>
    return marker?.v === 1 && marker.userHash === userHash(user) && marker.conversationId === id
  } catch {
    return false
  }
}

function writeConversationOwner(user: string, id: string): void {
  if (hasConversationOwner(user, id)) return
  fs.mkdirSync(CONVERSATION_OWNERS_DIR, { recursive: true })
  const file = conversationOwnerFileFor(user, id)
  const tmp = `${file}.tmp.${crypto.randomBytes(4).toString('hex')}`
  const marker = { v: 1, userHash: userHash(user), conversationId: id, createdAt: Date.now() }
  fs.writeFileSync(tmp, JSON.stringify(marker), { flag: 'wx' })
  try {
    // Publish ownership BEFORE its first durable receipt. That direct proof lets DELETE authorize and
    // tombstone the exact WAL crash window where the receipt exists but the transcript does not yet.
    fs.linkSync(tmp, file)
  } catch (error: any) {
    if (error?.code !== 'EEXIST') throw error
  } finally {
    try { fs.unlinkSync(tmp) } catch { /* already gone */ }
  }
  // A corrupt pre-existing marker must never be treated as authority or followed by a replayable receipt.
  if (!hasConversationOwner(user, id)) throw new Error('chat conversation owner marker is unreadable')
}

function isConversationRevoked(user: string, id: string): boolean {
  const key = revocationKey(user, id)
  if (memoryRevocations.has(key)) return true
  // History-disabled controls NEW transcript/receipt persistence. It must not disable privacy state for
  // durable chats written before the toggle: after a restart, their on-disk tombstone is the only thing
  // preventing an old receipt or crash-left transcript from becoming visible again.
  try { return fs.existsSync(revocationFileFor(user, id)) } catch { return true }
}

function writeConversationRevocation(user: string, id: string, durable: boolean): void {
  const key = revocationKey(user, id)
  memoryRevocations.add(key)
  // A cache-only conversation created while history is disabled has no durable data to revoke. Older chats
  // do, so their deletion marker remains durable even if the operator has since disabled new history writes.
  if (!durable) return
  fs.mkdirSync(REVOCATIONS_DIR, { recursive: true })
  const file = revocationFileFor(user, id)
  if (fs.existsSync(file)) return
  const tmp = `${file}.tmp.${crypto.randomBytes(4).toString('hex')}`
  fs.writeFileSync(tmp, JSON.stringify({ v: 1, userHash: userHash(user), conversationId: id, revokedAt: Date.now() }), { flag: 'wx' })
  try {
    // Publish the complete marker without replacing another process's equally authoritative revocation.
    fs.linkSync(tmp, file)
  } catch (error: any) {
    if (error?.code !== 'EEXIST') throw error
  } finally {
    try { fs.unlinkSync(tmp) } catch { /* already gone */ }
  }
}

function withDurableConversationMutationNow<T>(id: string, fn: () => T): T {
  if (disabled()) return fn()
  let fd: number
  try {
    fd = acquireRetainedFlockSync(conversationMutationFileFor(id), {
      waitMs: 0,
      busyMessage: 'this conversation is being updated by another server — retry in a moment',
    })
  } catch (error: any) {
    if (error?.code === 'EBUSY') {
      throw new ChatTurnReservationError('CONVERSATION_BUSY', error.message)
    }
    throw error
  }
  try { return fn() } finally { releaseRetainedFlock(fd) }
}

async function withDurableConversationMutation<T>(id: string, fn: () => T | Promise<T>): Promise<T> {
  if (disabled()) return fn()
  let fd: number
  try {
    fd = await acquireRetainedFlock(conversationMutationFileFor(id), {
      waitMs: 2_000,
      pollMs: 5,
      busyMessage: 'this conversation is being updated by another server — retry in a moment',
    })
  } catch (error: any) {
    if (error?.code === 'EBUSY') {
      throw new ChatTurnReservationError('CONVERSATION_BUSY', error.message)
    }
    throw error
  }
  try { return await fn() } finally { releaseRetainedFlock(fd) }
}

function cacheReceipt(key: string, receipt: CompletionReceipt): void {
  // Delete + set gives the bounded map simple LRU behavior.
  receiptCache.delete(key)
  receiptCache.set(key, receipt)
  while (receiptCache.size > MAX_RECEIPT_CACHE) {
    const oldest = receiptCache.keys().next().value as string | undefined
    if (oldest === undefined) break
    receiptCache.delete(oldest)
  }
}

function parseReceipt(raw: string, expectedHash: string, expectedTurnId: string): CompletionReceipt | null {
  try {
    const receipt = JSON.parse(raw) as CompletionReceipt
    if (
      receipt?.v !== 1 || receipt.userHash !== expectedHash || receipt.turnId !== expectedTurnId ||
      !isValidConversationId(receipt.conversation?.id) || receipt.conversation?.user !== undefined && userHash(receipt.conversation.user) !== expectedHash ||
      receipt.userMessage?.role !== 'user' || receipt.userMessage.turnId !== expectedTurnId ||
      receipt.assistantMessage?.role !== 'assistant' || receipt.assistantMessage.turnId !== expectedTurnId
    ) return null
    return receipt
  } catch {
    return null
  }
}

function readCompletionReceipt(user: string, turnId: string): CompletionReceipt | null {
  const key = receiptKeyFor(user, turnId)
  const cached = receiptCache.get(key)
  if (cached) {
    // Revocations are direct filesystem lookups even on a cache hit. This makes a delete performed by one
    // server process immediately authoritative over stale receipt caches in every other process.
    if (isConversationRevoked(user, cached.conversation.id)) {
      receiptCache.delete(key)
      return null
    }
    // Cache-only receipts created while history is disabled intentionally have no disk owner. A durable
    // receipt must always have the direct owner proof needed to delete it even if its transcript is absent.
    try {
      if (fs.existsSync(receiptFileFor(user, turnId))) writeConversationOwner(user, cached.conversation.id)
    } catch {
      return null
    }
    cacheReceipt(key, cached)
    return cached
  }
  let raw: string
  try {
    raw = fs.readFileSync(receiptFileFor(user, turnId), 'utf8')
  } catch {
    return null
  }
  const receipt = parseReceipt(raw, userHash(user), turnId)
  if (receipt && isConversationRevoked(user, receipt.conversation.id)) return null
  if (receipt) {
    try { writeConversationOwner(user, receipt.conversation.id) } catch { return null }
  }
  if (receipt) cacheReceipt(key, receipt)
  return receipt
}

function completionFromReceipt(receipt: CompletionReceipt): CompletedChatTurn {
  // Never expose the cached object itself: callers can shape an SSE response without being able to mutate
  // the immutable replay source for later requests.
  const userMessage = structuredClone(receipt.userMessage)
  const assistantMessage = structuredClone(receipt.assistantMessage)
  return {
    conversation: { ...structuredClone(receipt.conversation), messages: [userMessage, assistantMessage] },
    userMessage,
    assistantMessage,
  }
}

function receiptFiles(): string[] {
  try { return fs.readdirSync(RECEIPTS_DIR).filter((file) => file.endsWith('.json')) } catch { return [] }
}

function pruneDurableReceipts(): void {
  const files = receiptFiles()
  durableReceiptCount = files.length
  if (files.length <= MAX_COMPLETION_RECEIPTS) return
  const oldest = files
    .map((file) => {
      let mtime = 0
      try { mtime = fs.statSync(path.join(RECEIPTS_DIR, file)).mtimeMs } catch { /* vanished */ }
      return { file, mtime }
    })
    .sort((a, b) => a.mtime - b.mtime)
    .slice(0, files.length - COMPLETION_RECEIPT_LOW_WATER)
  for (const { file } of oldest) {
    try {
      fs.unlinkSync(path.join(RECEIPTS_DIR, file))
      durableReceiptCount--
      receiptCache.delete(file.slice(0, -'.json'.length))
    } catch { /* already gone */ }
  }
}

interface CompletionReceiptWrite {
  receipt: CompletionReceipt
  created: boolean
}

function writeCompletionReceipt(receipt: CompletionReceipt): CompletionReceiptWrite {
  const key = `${receipt.userHash}_${receipt.turnId}`
  if (disabled()) {
    const existing = readCompletionReceipt(receipt.conversation.user, receipt.turnId)
    if (existing) return { receipt: existing, created: false }
    cacheReceipt(key, receipt)
    return { receipt, created: true }
  }
  // This precedes receipt publication by design. If the process dies after the receipt is linked but before
  // the transcript rename, DELETE still has a restart-safe, user-scoped authorization proof.
  writeConversationOwner(receipt.conversation.user, receipt.conversation.id)
  const existing = readCompletionReceipt(receipt.conversation.user, receipt.turnId)
  if (existing) return { receipt: existing, created: false }
  fs.mkdirSync(RECEIPTS_DIR, { recursive: true })
  if (durableReceiptCount === null) durableReceiptCount = receiptFiles().length
  const file = receiptFileFor(receipt.conversation.user, receipt.turnId)
  const tmp = `${file}.tmp.${crypto.randomBytes(4).toString('hex')}`
  fs.writeFileSync(tmp, JSON.stringify(receipt), { flag: 'wx' })
  let committed = receipt
  let created = false
  try {
    // A hard link publishes the fully-written temp inode without replacing an immutable winner from another
    // process. EEXIST means that process won; use its authoritative receipt.
    fs.linkSync(tmp, file)
    created = true
  } catch (error: any) {
    if (error?.code !== 'EEXIST') throw error
    const winner = readCompletionReceipt(receipt.conversation.user, receipt.turnId)
    if (!winner) throw new Error('chat turn receipt exists but is unreadable')
    committed = winner
  } finally {
    try { fs.unlinkSync(tmp) } catch { /* already gone */ }
  }
  if (created) durableReceiptCount++
  cacheReceipt(key, committed)
  if ((durableReceiptCount ?? 0) > MAX_COMPLETION_RECEIPTS) pruneDurableReceipts()
  return { receipt: committed, created }
}

// A completion receipt is the write-ahead log (WAL), not merely a retry cache. Publication intentionally
// precedes the transcript write so a network retry can never pay twice. If the process dies in that small
// window, the next direct receipt lookup reconstructs the missing History view. An explicit delete writes
// its revocation first, so recovery can never resurrect deleted data.
function healConversationFromReceipt(receipt: CompletionReceipt): void {
  if (disabled() || isConversationRevoked(receipt.conversation.user, receipt.conversation.id)) return
  try {
    withDurableConversationMutationNow(receipt.conversation.id, () => {
      if (isConversationRevoked(receipt.conversation.user, receipt.conversation.id)) return
      const file = fileFor(receipt.conversation.id)
      const current = readConvoFile(file)
      if (current && current.user !== receipt.conversation.user) return
      if (current?.messages.some((message) => message.turnId === receipt.turnId)
        || current?.settledPrunedTurnIds?.includes(receipt.turnId)) return

      let healed: ChatConversation
      if (!current) {
        healed = {
          ...structuredClone(receipt.conversation),
          messages: [structuredClone(receipt.userMessage), structuredClone(receipt.assistantMessage)],
        }
      } else {
        healed = current
        // A later turn can make the transcript newer before this WAL gap is reconciled, so updatedAt cannot
        // decide whether the missing pair was intentional. The retention floor decides presentation only;
        // even an already-pruned WAL gap still needs its cost/metadata settled exactly once.
        const outsideRetention = receipt.turnRetained === false || (current.prunedThroughTs ?? 0) >= receipt.userMessage.ts
        if (outsideRetention) markSettledPrunedTurn(healed, receipt.turnId)
        else {
          insertCompletedTurn(healed, structuredClone(receipt.userMessage), structuredClone(receipt.assistantMessage))
          pruneConversation(healed)
        }
        healed.updatedAt = Math.max(healed.updatedAt, receipt.conversation.updatedAt, receipt.assistantMessage.ts)
        const recoveredCost = typeof receipt.assistantMessage.costUsd === 'number' && receipt.assistantMessage.costUsd > 0
          ? receipt.assistantMessage.costUsd
          : 0
        healed.costUsd = +(healed.costUsd + recoveredCost).toFixed(4)
        if ((receipt.conversation.metaUpdatedAt ?? 0) >= (healed.metaUpdatedAt ?? 0)) {
          applyMutableMeta(healed, receipt.conversation)
          healed.metaUpdatedAt = receipt.conversation.metaUpdatedAt
        }
      }
      writeConvoFile(healed)
    })
  } catch {
    // Replay remains available; a later direct lookup can retry healing after a busy deploy-overlap writer.
  }
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
type ConversationContext = Pick<ChatConversation, 'swarm' | 'subject' | 'scope' | 'module' | 'orbKey' | 'orbPath'>
function sameConversationContext(conversation: ConversationContext, meta: ConversationMeta): boolean {
  if (conversation.swarm !== meta.swarm || conversation.subject !== meta.subject || conversation.scope !== meta.scope) return false
  if (meta.scope === 'module' && (conversation.module ?? '') !== (meta.module ?? '')) return false
  if (meta.scope === 'orb') {
    // orbKey is the stable graph identity across reruns. Older transcripts may only have orbPath, so retain
    // that exact fallback without allowing one orb's computed/history context to cross into another.
    if (conversation.orbKey || meta.orbKey) return Boolean(conversation.orbKey && meta.orbKey && conversation.orbKey === meta.orbKey)
    return (conversation.orbPath ?? '') === (meta.orbPath ?? '')
  }
  return true
}

function ownedExistingId(requestedId: string | undefined, user: string, meta: ConversationMeta): string | null {
  if (!isValidConversationId(requestedId)) return null
  const c = readConvoFile(fileFor(requestedId))
  return c && c.user === user && sameConversationContext(c, meta) && !isConversationRevoked(user, requestedId) ? requestedId : null
}

interface MutableConversationMeta {
  title: string
  model?: string
  style?: string
  runRoot?: string
  orbPath?: string
}

export interface UserMessageRollback {
  id: string
  pendingId: string
  turnId: string
  messageTs: number
  content: string
  meta: MutableConversationMeta
  initialMeta: ConversationMeta
  created: boolean
}

// Pending turns intentionally live only for the lifetime of this process. A crash therefore cannot strand a
// user-only question in History: the durable write happens once, atomically, when the answer completes.
const pendingTurns = new Map<string, UserMessageRollback>()
// A second request carrying the same id while the first is still running must not launch a second model
// call. Key by authoritative user as turn ids only need to be unique within one user's request stream.
const pendingTurnReservations = new Map<string, string>()
// Includes timestamps issued to questions which are pending and therefore absent from the durable transcript.
// Without this high-water, a late answer can collide with a third question reserved after a newer answer.
const pendingTimestampHighWater = new Map<string, number>()

// The descriptor, not pathname contents, is the paid-turn lease. Kernel flock ownership survives helper
// exit, is exclusive across processes, and disappears automatically if this process crashes. The stable
// inode is never unlinked, so there is no stale-PID recovery and no unlink/recreate ABA window.
const durableTurnLeases = new Map<string, number>()

function claimDurableTurnReservation(user: string, turnId: string, pendingId: string): boolean {
  if (disabled()) return true
  const file = turnReservationFileFor(user, turnId)
  let fd: number
  try {
    fd = acquireRetainedFlockSync(file, {
      waitMs: 0,
      busyMessage: 'chat turn is already pending',
    })
  } catch (error: any) {
    if (error?.code === 'EBUSY') return false
    throw error
  }
  if (durableTurnLeases.has(pendingId)) {
    releaseRetainedFlock(fd)
    throw new Error('duplicate pending turn lease id')
  }
  durableTurnLeases.set(pendingId, fd)
  return true
}

function releaseDurableTurnReservationByOwner(user: string, turnId: string, pendingId: string): void {
  // user + turnId stay in the signature so all callers release from the same authoritative rollback token;
  // the unforgeable in-process pending id selects the retained descriptor. Do not branch on the CURRENT
  // history setting: an operator can toggle it after admission, and a lease acquired while enabled must
  // still close. Disabled-at-admission turns simply have no entry in this map.
  void user
  void turnId
  const fd = durableTurnLeases.get(pendingId)
  if (fd === undefined) return
  durableTurnLeases.delete(pendingId)
  releaseRetainedFlock(fd)
}

function releaseDurableTurnReservation(turn: UserMessageRollback): void {
  releaseDurableTurnReservationByOwner(turn.initialMeta.user, turn.turnId, turn.pendingId)
}

function pendingTurnKey(user: string, turnId: string): string {
  return JSON.stringify([user, turnId])
}

function releasePendingTurn(turn: UserMessageRollback): void {
  pendingTurns.delete(turn.pendingId)
  const key = pendingTurnKey(turn.initialMeta.user, turn.turnId)
  if (pendingTurnReservations.get(key) === turn.pendingId) pendingTurnReservations.delete(key)
  releaseDurableTurnReservation(turn)
  releaseTimestampHighWaterIfIdle(turn.id)
}

function requestedMutableMeta(meta: ConversationMeta, current?: ChatConversation): MutableConversationMeta {
  return {
    title: meta.title || current?.title || '',
    model: meta.model ?? current?.model,
    style: meta.style ?? current?.style,
    runRoot: meta.runRoot || current?.runRoot,
    orbPath: meta.orbPath || current?.orbPath,
  }
}

function applyMutableMeta(convo: ChatConversation, meta: MutableConversationMeta): void {
  convo.title = meta.title || convo.title
  convo.model = meta.model
  convo.style = meta.style
  convo.runRoot = meta.runRoot
  convo.orbPath = meta.orbPath
}

function maxConversationTs(convo?: ChatConversation | null): number {
  if (!convo) return 0
  let max = Math.max(convo.createdAt || 0, convo.updatedAt || 0)
  for (const message of convo.messages) max = Math.max(max, Number.isFinite(message.ts) ? message.ts : 0)
  return max
}

// Array order is turn-arrival order, not completion-time order, so its final element is not necessarily the
// highest timestamp. Always inspect the whole conversation and updatedAt before issuing a new timestamp.
function nextMessageTs(convo?: ChatConversation | null, floor = 0): number {
  return Math.max(Date.now(), maxConversationTs(convo) + 1, floor + 1)
}

function readConversationClock(id: string): number {
  if (disabled()) return 0
  try {
    const clock = JSON.parse(fs.readFileSync(conversationClockFileFor(id), 'utf8')) as Record<string, unknown>
    if (clock?.v !== 1 || clock.conversationId !== id || !Number.isFinite(clock.highWater)) {
      throw new Error('chat conversation clock is unreadable')
    }
    return Number(clock.highWater)
  } catch (error: any) {
    if (error?.code === 'ENOENT') return 0
    throw error
  }
}

function writeConversationClock(id: string, highWater: number): void {
  if (disabled()) return
  fs.mkdirSync(CONVERSATION_CLOCKS_DIR, { recursive: true })
  const file = conversationClockFileFor(id)
  const tmp = `${file}.tmp.${crypto.randomBytes(4).toString('hex')}`
  fs.writeFileSync(tmp, JSON.stringify({ v: 1, conversationId: id, highWater }))
  fs.renameSync(tmp, file)
}

function nextConversationMessageTs(id: string, convo?: ChatConversation | null, floor = 0): number {
  // Every caller holds the cross-process conversation mutation lock. Persisting the admission clock closes
  // the same-millisecond two-worker gap that a process-local high-water cannot see: question order and
  // mutable metadata arbitration now share one durable sequence even before either transcript is written.
  const now = Math.max(
    nextMessageTs(convo, floor),
    (pendingTimestampHighWater.get(id) ?? 0) + 1,
    readConversationClock(id) + 1,
  )
  pendingTimestampHighWater.set(id, now)
  writeConversationClock(id, now)
  return now
}

function releaseTimestampHighWaterIfIdle(id: string): void {
  for (const pending of pendingTurns.values()) if (pending.id === id) return
  pendingTimestampHighWater.delete(id)
  // An aborted first turn has no transcript to own its durable clock. Later established conversations keep
  // the clock across restarts so an overlapping process cannot issue an older admission timestamp.
  if (!disabled() && !readConvoFile(fileFor(id))) {
    try { fs.unlinkSync(conversationClockFileFor(id)) } catch { /* absent / already cleaned */ }
  }
}

interface MessageGroup {
  messages: StoredChatMessage[]
  arrivalTs: number
  ordinal: number
}

// New turns group by turnId. Older files predate turn ids, so preserve their normal user→assistant pairs as
// groups too; malformed legacy singletons remain standalone rather than being guessed into the wrong turn.
function messageGroups(messages: StoredChatMessage[]): MessageGroup[] {
  const groups: MessageGroup[] = []
  const byTurnId = new Map<string, MessageGroup>()
  for (let i = 0; i < messages.length; i++) {
    const message = messages[i]
    if (typeof message.turnId === 'string' && message.turnId) {
      const existing = byTurnId.get(message.turnId)
      if (existing) {
        existing.messages.push(message)
        if (message.role === 'user') existing.arrivalTs = Math.min(existing.arrivalTs, message.ts)
      } else {
        const group = { messages: [message], arrivalTs: message.ts, ordinal: i }
        groups.push(group)
        byTurnId.set(message.turnId, group)
      }
      continue
    }
    const next = messages[i + 1]
    if (message.role === 'user' && next?.role === 'assistant' && !next.turnId) {
      groups.push({ messages: [message, next], arrivalTs: message.ts, ordinal: i })
      i++
    } else {
      groups.push({ messages: [message], arrivalTs: message.ts, ordinal: i })
    }
  }
  return groups
}

function insertCompletedTurn(convo: ChatConversation, user: StoredChatMessage, assistant: StoredChatMessage): void {
  const groups = messageGroups([...convo.messages, user, assistant])
  groups.sort((a, b) => a.arrivalTs - b.arrivalTs || a.ordinal - b.ordinal)
  convo.messages = groups.flatMap((group) => group.messages)
}

function pruneConversation(convo: ChatConversation): void {
  if (convo.messages.length <= MAX_MESSAGES_PER_CONVO) return
  const groups = messageGroups(convo.messages)
  let retained = convo.messages.length
  let first = 0
  while (retained > MAX_MESSAGES_PER_CONVO && first < groups.length) {
    retained -= groups[first].messages.length
    first++
  }
  if (first > 0) {
    const removed = groups.slice(0, first)
    const removedThrough = Math.max(...removed.map((group) => group.arrivalTs))
    convo.prunedThroughTs = Math.max(convo.prunedThroughTs ?? 0, removedThrough)
    for (const group of removed) {
      for (const message of group.messages) if (message.turnId) markSettledPrunedTurn(convo, message.turnId)
    }
  }
  convo.messages = groups.slice(first).flatMap((group) => group.messages)
}

function markSettledPrunedTurn(convo: ChatConversation, turnId: string): void {
  const ids = convo.settledPrunedTurnIds ?? []
  if (!ids.includes(turnId)) ids.push(turnId)
  // Durable receipts are globally capped at the same bound, so an id cannot remain replayable after it falls
  // outside this per-conversation settlement window.
  if (ids.length > MAX_COMPLETION_RECEIPTS) ids.splice(0, ids.length - MAX_COMPLETION_RECEIPTS)
  convo.settledPrunedTurnIds = ids
}

// Record a pending user question and return an exact rollback token alongside the resolved conversation.
// The server keeps the token only for the streamed request; clean completion commits both sides of the turn,
// while cancellation simply discards the token because the prior durable state was never changed.
export type RecordPendingUserMessageResult =
  | { status: 'pending'; conversation: ChatConversation; rollback: UserMessageRollback }
  | { status: 'completed'; completed: CompletedChatTurn }

export function recordPendingUserMessage(meta: ConversationMeta, content: string, requestedId?: string, requestedTurnId?: string): Promise<RecordPendingUserMessageResult> {
  if (requestedTurnId !== undefined && !isValidTurnId(requestedTurnId)) {
    return Promise.reject(new ChatTurnReservationError('INVALID_TURN_ID', 'invalid chat turn id'))
  }
  const turnId = requestedTurnId ?? newTurnId()
  const existingId = ownedExistingId(requestedId, meta.user, meta)
  const id = existingId ?? newId()
  return withLock(id, () => withDurableConversationMutation(id, () => {
    const reservationKey = pendingTurnKey(meta.user, turnId)
    // This synchronous block is the authoritative admission point. A completion publishes its receipt before
    // releasing the matching reservation, so every interleaving observes exactly one of these two states.
    const completed = readCompletionReceipt(meta.user, turnId)
    if (completed) {
      if (!sameConversationContext(completed.conversation, meta)) {
        throw new ChatTurnReservationError('TURN_CONTEXT_MISMATCH', 'chat turn belongs to a different subject or scope')
      }
      return { status: 'completed' as const, completed: completionFromReceipt(completed) }
    }
    if (pendingTurnReservations.has(reservationKey)) {
      throw new ChatTurnReservationError('TURN_ALREADY_PENDING', 'chat turn is already pending')
    }
    const pendingId = `pending_${crypto.randomBytes(8).toString('hex')}`
    if (!claimDurableTurnReservation(meta.user, turnId, pendingId)) {
      // A different process can finish between our first receipt read and its lease release. Recheck the
      // immutable result before reporting "pending"; either way, this request never reaches a paid model.
      const racedCompletion = readCompletionReceipt(meta.user, turnId)
      if (racedCompletion) {
        if (!sameConversationContext(racedCompletion.conversation, meta)) {
          throw new ChatTurnReservationError('TURN_CONTEXT_MISMATCH', 'chat turn belongs to a different subject or scope')
        }
        return { status: 'completed' as const, completed: completionFromReceipt(racedCompletion) }
      }
      throw new ChatTurnReservationError('TURN_ALREADY_PENDING', 'chat turn is already pending')
    }
    try {
      // The prior owner may publish its receipt and release between our first lookup and kernel acquisition.
      // Recheck while we own the shard; otherwise that narrow success-after-release window could launch a
      // second paid answer even though the immutable winner is already durable.
      const afterClaimCompletion = readCompletionReceipt(meta.user, turnId)
      if (afterClaimCompletion) {
        if (!sameConversationContext(afterClaimCompletion.conversation, meta)) {
          throw new ChatTurnReservationError('TURN_CONTEXT_MISMATCH', 'chat turn belongs to a different subject or scope')
        }
        releaseDurableTurnReservationByOwner(meta.user, turnId, pendingId)
        return { status: 'completed' as const, completed: completionFromReceipt(afterClaimCompletion) }
      }
      const existing = existingId ? readConvoFile(fileFor(id)) : null
      const now = nextConversationMessageTs(id, existing)
      const safeContent = clampContent(content)
      const rollback: UserMessageRollback = {
        id,
        pendingId,
        turnId,
        messageTs: now,
        content: safeContent,
        meta: requestedMutableMeta(meta, existing ?? undefined),
        initialMeta: { ...meta },
        // Admission already proved whether this id belonged to the caller. If the file is deleted before this
        // queued callback reads it, it must stay an existing-thread token so completion cannot resurrect it.
        created: existingId === null,
      }
      // Build the virtual snapshot before publishing the in-process token. If any clock/read/allocation step
      // throws, the catch below closes the retained kernel fd so the exact turn remains immediately retryable.
      const conversation: ChatConversation = existing
        ? { ...existing, messages: [...existing.messages, { role: 'user', content: safeContent, ts: now, turnId }], updatedAt: now }
        : {
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
          messages: [{ role: 'user', content: safeContent, ts: now, turnId }],
          metaUpdatedAt: 0,
        }
      pendingTurns.set(pendingId, rollback)
      pendingTurnReservations.set(reservationKey, pendingId)
      return { status: 'pending' as const, conversation, rollback }
    } catch (error) {
      pendingTurns.delete(pendingId)
      if (pendingTurnReservations.get(reservationKey) === pendingId) pendingTurnReservations.delete(reservationKey)
      releaseDurableTurnReservationByOwner(meta.user, turnId, pendingId)
      releaseTimestampHighWaterIfIdle(id)
      throw error
    }
  }))
}

// Public compatibility helper used by the store tests and any non-streaming caller that wants the durable
// conversation but does not need cancellation. Streaming routes use recordPendingUserMessage above.
export function recordUserMessage(meta: ConversationMeta, content: string, requestedId?: string): Promise<ChatConversation> {
  const existingId = ownedExistingId(requestedId, meta.user, meta)
  const id = existingId ?? newId()
  return withLock(id, () => withDurableConversationMutation(id, () => {
    let convo = existingId ? readConvoFile(fileFor(id)) : null
    const now = nextConversationMessageTs(id, convo)
    const msg: StoredChatMessage = { role: 'user', content: clampContent(content), ts: now }
    if (convo) {
      applyMutableMeta(convo, requestedMutableMeta(meta, convo))
      convo.messages.push(msg)
      convo.updatedAt = now
      convo.metaUpdatedAt = now
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
        metaUpdatedAt: now,
      }
    }
    pruneConversation(convo)
    if (!disabled()) writeConvoFile(convo)
    releaseTimestampHighWaterIfIdle(id)
    return convo
  }))
}

// Cancel an in-memory pending turn. There is no durable rollback because incomplete turns are never written.
export function rollbackUserMessage(token: UserMessageRollback): Promise<boolean> {
  if (!isValidConversationId(token?.id) || typeof token?.pendingId !== 'string' || !token.pendingId || !isValidTurnId(token?.turnId)) return Promise.resolve(false)
  return withLock(token.id, () => {
    const active = pendingTurns.get(token.pendingId)
    if (!active || active.id !== token.id || active.turnId !== token.turnId) return false
    releasePendingTurn(active)
    return true
  })
}

// Atomically commit the pending user question and its assistant answer. Keeping both mutations under the
// same per-conversation lock means History can never observe a committed orphan question. Older turns may
// finish after newer ones; their transcript still lands, but their presentation metadata cannot win.
export function recordAssistantMessageForPending(token: UserMessageRollback, content: string, extra?: { sourcePath?: string; costUsd?: number; thinking?: string; computed?: unknown[] }, shouldCommit: () => boolean = () => true): Promise<boolean> {
  if (!isValidConversationId(token?.id) || typeof token?.pendingId !== 'string' || !token.pendingId || !isValidTurnId(token?.turnId)) return Promise.resolve(false)
  return withLock(token.id, () => withDurableConversationMutation(token.id, () => {
    // Evaluated inside the per-id lock. If another write held the lock while the response disconnected,
    // the close event has already flipped this guard and the still-pending question remains rollback-able.
    if (!shouldCommit()) return false
    const active = pendingTurns.get(token.pendingId)
    if (!active || active.id !== token.id || active.turnId !== token.turnId) return false
    if (isConversationRevoked(active.initialMeta.user, active.id)) return false
    let convo = readConvoFile(fileFor(active.id))
    if (!convo) {
      if (!active.created) return false // an existing conversation deleted mid-turn stays deleted
      const meta = active.initialMeta
      convo = {
        v: 1,
        id: active.id,
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
        createdAt: active.messageTs,
        updatedAt: active.messageTs,
        costUsd: 0,
        messages: [],
        metaUpdatedAt: 0,
      }
    }
    if (active.messageTs >= (convo.metaUpdatedAt ?? 0)) {
      applyMutableMeta(convo, active.meta)
      convo.metaUpdatedAt = active.messageTs
    }
    // Another process can have issued the same millisecond timestamp from the same pre-commit snapshot.
    // The conversation lock makes the latest file authoritative; rebase only an exact collision so every
    // durable message remains unique without changing normal arrival ordering.
    const questionTs = convo.messages.some((message) => message.ts === active.messageTs)
      ? nextMessageTs(convo)
      : active.messageTs
    const now = nextConversationMessageTs(active.id, convo, questionTs)
    const userMessage: StoredChatMessage = { role: 'user', content: active.content, ts: questionTs, turnId: active.turnId }
    const assistantMessage: StoredChatMessage = { role: 'assistant', content: clampContent(content), ts: now, turnId: active.turnId, sourcePath: extra?.sourcePath, costUsd: extra?.costUsd, thinking: extra?.thinking ? clampContent(extra.thinking) : undefined, computed: clampComputed(extra?.computed) }
    // Completion time can differ from question order. Insert the atomic pair among whole turns using the
    // question's monotonic arrival timestamp; never sort the two messages away from each other.
    insertCompletedTurn(convo, userMessage, assistantMessage)
    pruneConversation(convo)
    convo.updatedAt = now
    if (typeof extra?.costUsd === 'number' && extra.costUsd > 0) convo.costUsd = +(convo.costUsd + extra.costUsd).toFixed(4)
    const { messages: _messages, ...conversation } = convo
    const receipt: CompletionReceipt = {
      v: 1,
      userHash: userHash(active.initialMeta.user),
      turnId: active.turnId,
      completedAt: now,
      conversation,
      userMessage,
      assistantMessage,
      turnRetained: convo.messages.some((message) => message.turnId === active.turnId),
    }
    // Publish the replay source before releasing admission. The transcript is a separately retained view;
    // even if this pair is immediately pruned, the bounded immutable receipt remains directly addressable.
    const receiptWrite = writeCompletionReceipt(receipt)
    const authoritative = receiptWrite.receipt
    if (authoritative.userMessage.content !== active.content) {
      throw new Error('chat turn id was completed for a different question')
    }
    // Another process can only win here if it published between admission and completion (for example an
    // older deployment that predates durable leases). Never overwrite its canonical answer with the local
    // loser. Release this reservation and heal History from the immutable winner; the route will roll its
    // streamed partial back and offer an exact-id Retry, which replays that winner at zero cost.
    if (!receiptWrite.created) {
      releasePendingTurn(active)
      return false
    }
    if (!disabled()) writeConvoFile(convo)
    releasePendingTurn(active)
    return true
  }))
}

// Record the assistant's answer for a turn already opened by recordUserMessage. No-op if the conversation
// vanished (deleted mid-turn) — the turn still streamed to the user; only its history line is lost.
export function recordAssistantMessage(id: string, content: string, extra?: { sourcePath?: string; costUsd?: number; thinking?: string }): Promise<void> {
  if (!isValidConversationId(id)) return Promise.resolve()
  return withLock(id, () => withDurableConversationMutation(id, () => {
    const convo = readConvoFile(fileFor(id))
    if (!convo) return
    const now = nextConversationMessageTs(id, convo)
    convo.messages.push({ role: 'assistant', content: clampContent(content), ts: now, sourcePath: extra?.sourcePath, costUsd: extra?.costUsd, thinking: extra?.thinking ? clampContent(extra.thinking) : undefined })
    pruneConversation(convo)
    convo.updatedAt = now
    if (typeof extra?.costUsd === 'number' && extra.costUsd > 0) convo.costUsd = +(convo.costUsd + extra.costUsd).toFixed(4)
    if (!disabled()) writeConvoFile(convo)
    releaseTimestampHighWaterIfIdle(id)
  }))
}

// Reconcile a client retry with one cache/filesystem key lookup. The authoritative user's hash is part of
// that key, so a turn id cannot reveal another operator's answer.
export function findCompletedTurnForUser(turnId: string, user: string): CompletedChatTurn | null {
  if (!isValidTurnId(turnId) || typeof user !== 'string' || !user) return null
  const receipt = readCompletionReceipt(user, turnId)
  if (receipt) healConversationFromReceipt(receipt)
  return receipt ? completionFromReceipt(receipt) : null
}

export function getConversation(id: string): ChatConversation | null {
  if (!isValidConversationId(id)) return null
  const conversation = readConvoFile(fileFor(id))
  return conversation && !isConversationRevoked(conversation.user, id) ? conversation : null
}

export function deleteConversation(id: string, user: string): boolean {
  if (!isValidConversationId(id) || typeof user !== 'string' || !user) return false
  try {
    return withDurableConversationMutationNow(id, () => {
      const conversation = readConvoFile(fileFor(id))
      const durableOwner = hasConversationOwner(user, id)
      // Conversation ids are visible to every operator in the shared History list. Identity, not possession
      // of the id, authorizes deletion. A nonexistent random id must not allocate a permanent marker; the only
      // missing-transcript exception is history-disabled mode's bounded in-memory receipt cache.
      if (conversation && conversation.user !== user) return false
      const ownsCacheOnlyReceipt = !conversation && disabled() && [...receiptCache.values()].some(
        (receipt) => receipt.conversation.id === id && receipt.conversation.user === user,
      )
      if (!conversation && !durableOwner && !ownsCacheOnlyReceipt) return false

      // Publish revocation BEFORE removing the History view. This is the deletion transaction's commit point:
      // a crash afterwards can leave a stale transcript file, but no process can replay or resurrect its turns.
      writeConversationRevocation(user, id, Boolean(conversation) || durableOwner)
      for (const [key, receipt] of receiptCache) {
        if (receipt.conversation.id === id && receipt.conversation.user === user) receiptCache.delete(key)
      }
      let deleted = durableOwner
      if (conversation) {
        try {
          fs.unlinkSync(fileFor(id))
          deleted = true
        } catch { /* already gone / unreadable */ }
      }
      // Receipt files can be removed lazily by the bounded batch pruner; the direct tombstone makes the hot
      // delete path O(cache size), avoids a 10k-file event-loop scan, and remains authoritative across processes.
      if (durableOwner) {
        try { fs.unlinkSync(conversationOwnerFileFor(user, id)) } catch { /* tombstone is already authoritative */ }
      }
      try { fs.unlinkSync(conversationClockFileFor(id)) } catch { /* deleted/legacy conversations may have none */ }
      return deleted
    })
  } catch (error) {
    if (error instanceof ChatTurnReservationError && error.code === 'CONVERSATION_BUSY') return false
    throw error
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
    if (c && !isConversationRevoked(c.user, c.id)) all.push(c)
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
