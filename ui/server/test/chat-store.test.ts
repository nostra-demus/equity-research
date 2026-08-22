// Chat-history store: conversations persist to STATE_DIR/chats/ (one atomic JSON per conversation) so the
// Ask panel's history survives restarts and can be reopened. Covers create-on-first-turn, append, the
// server-authoritative identity, listing + filters, get/delete, id validation, and path-traversal safety.
// Run: npx tsx test/chat-store.test.ts
import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawn, type ChildProcess } from 'node:child_process'

// STATE_DIR is read at config import time, so point it at a temp dir BEFORE importing the module.
const STATE = fs.mkdtempSync(path.join(os.tmpdir(), 'chatstore-'))
process.env.ENGINE_STATE_DIR = STATE
const store = await import('../src/chat-store')
const {
  recordUserMessage, recordPendingUserMessage, recordAssistantMessage, recordAssistantMessageForPending, rollbackUserMessage, getConversation, deleteConversation,
  findCompletedTurnForUser, listConversations, searchConversationMemory, isValidConversationId, isValidTurnId,
} = store
const CHATS_DIR = path.join(STATE, 'chats')
const userHash = (user: string) => crypto.createHash('sha256').update(user).digest('hex')
const lockShardFile = (dir: string, namespace: string, key: string) => {
  const digest = crypto.createHash('sha256').update(`${namespace}\0${key}`).digest()
  return path.join(dir, `shard-${(digest.readUInt32BE(0) % 4096).toString(16).padStart(3, '0')}.flock`)
}
const turnLockFile = (user: string, turnId: string) => lockShardFile(
  path.join(CHATS_DIR, 'turn-reservations'), 'chat-turn', `${userHash(user)}_${turnId}`,
)
const conversationLockFile = (id: string) => lockShardFile(
  path.join(CHATS_DIR, 'conversation-mutations'), 'chat-conversation', id,
)

let passed = 0
async function check(name: string, fn: () => void | Promise<void>) {
  try {
    await fn()
    passed++
    console.log(`  ok  ${name}`)
  } catch (e: any) {
    console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`)
    process.exitCode = 1
  }
}

// A rejection that settles before its `await` attaches escapes every check() and, by default, kills the
// process mid-file: the remaining checks never run and the failure reads as whatever ran last. Fail the
// run loudly and keep going, so an escape is diagnosable instead of a truncated suite.
process.on('unhandledRejection', (reason: any) => {
  console.error(`FAIL  unhandled rejection\n      ${reason?.stack || reason?.message || reason}`)
  process.exitCode = 1
})

const meta = (over: Partial<Parameters<typeof recordUserMessage>[0]> = {}) => ({
  user: 'alice@example.com', userVia: 'cf-access' as const,
  swarm: 'research', subject: 'EMAR', scope: 'run' as const,
  title: 'Ask · EMAR — whole run', model: 'sonnet', style: 'simple',
  ...over,
})

const reservePending = async (...args: Parameters<typeof recordPendingUserMessage>) => {
  const result = await recordPendingUserMessage(...args)
  assert.equal(result.status, 'pending', 'test expected a new pending reservation')
  if (result.status !== 'pending') throw new Error('expected pending reservation')
  return result
}

const FLOCK_HOLDER_PROGRAM = [
  'import fcntl, os, sys',
  'f = open(sys.argv[1], "a+")',
  'fcntl.flock(f.fileno(), fcntl.LOCK_EX)',
  'print("LOCKED", flush=True)',
  'sys.stdin.read()',
].join('\n')

async function startForeignFlock(file: string): Promise<ChildProcess> {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.closeSync(fs.openSync(file, 'a'))
  const child = spawn('python3', ['-c', FLOCK_HOLDER_PROGRAM, file], { stdio: ['pipe', 'pipe', 'pipe'] })
  return await new Promise<ChildProcess>((resolve, reject) => {
    let stdout = ''
    let stderr = ''
    const timer = setTimeout(() => {
      child.kill('SIGKILL')
      reject(new Error(`foreign flock holder did not start: ${stderr || stdout || 'timeout'}`))
    }, 5_000)
    child.stdout!.on('data', (chunk) => {
      stdout += String(chunk)
      if (!stdout.includes('LOCKED')) return
      clearTimeout(timer)
      resolve(child)
    })
    child.stderr!.on('data', (chunk) => { stderr += String(chunk) })
    child.once('error', (error) => { clearTimeout(timer); reject(error) })
    child.once('exit', (code, signal) => {
      if (stdout.includes('LOCKED')) return
      clearTimeout(timer)
      reject(new Error(`foreign flock holder exited ${code ?? signal}: ${stderr}`))
    })
  })
}

async function stopForeignFlock(child: ChildProcess): Promise<void> {
  if (child.exitCode !== null || child.signalCode !== null) return
  await new Promise<void>((resolve) => {
    child.once('exit', () => resolve())
    child.kill('SIGKILL')
  })
}

// ---- id validation ----
await check('accepts a well-formed minted id, rejects junk + traversal', () => {
  // mint one via a real turn and confirm it validates
  return recordUserMessage(meta(), 'hi').then((c) => {
    assert.ok(isValidConversationId(c.id), `minted id should validate: ${c.id}`)
    assert.equal(isValidConversationId('../etc/passwd'), false)
    assert.equal(isValidConversationId('chat_abc'), false) // missing random suffix
    assert.equal(isValidConversationId('foo'), false)
    assert.equal(isValidConversationId(''), false)
    assert.equal(isValidConversationId(42 as any), false)
  })
})

await check('validates the client turn-id namespace', () => {
  assert.equal(isValidTurnId('turn_retry_key_0001'), true)
  assert.equal(isValidTurnId('turn_RETRY_key_0001'), false, 'case variants must never alias on macOS receipt filenames')
  assert.equal(isValidTurnId('retry_key_0001'), false)
  assert.equal(isValidTurnId('turn_short'), false)
  assert.equal(isValidTurnId('turn_retry/key/0001'), false)
})

// ---- create on first turn, then append ----
await check('first user turn creates the conversation with server identity', async () => {
  const c = await recordUserMessage(meta(), 'What is the bull case?')
  assert.equal(c.user, 'alice@example.com')
  assert.equal(c.userVia, 'cf-access')
  assert.equal(c.subject, 'EMAR')
  assert.equal(c.scope, 'run')
  assert.equal(c.messages.length, 1)
  assert.equal(c.messages[0].role, 'user')
  assert.equal(c.messages[0].content, 'What is the bull case?')
  assert.ok(typeof c.messages[0].ts === 'number')
  // file exists on disk
  assert.ok(fs.existsSync(path.join(CHATS_DIR, `${c.id}.json`)))
})

await check('assistant turn appends + accrues cost; second question extends the same thread', async () => {
  const c = await recordUserMessage(meta(), 'Q1')
  await recordAssistantMessage(c.id, 'A1', { sourcePath: 'analyses/EMAR/final_thesis.md', costUsd: 0.02 })
  await recordUserMessage(meta(), 'Q2', c.id)
  await recordAssistantMessage(c.id, 'A2', { costUsd: 0.03 })
  const got = getConversation(c.id)!
  assert.equal(got.messages.map((m) => m.content).join(','), 'Q1,A1,Q2,A2')
  assert.equal(got.messages[1].sourcePath, 'analyses/EMAR/final_thesis.md')
  assert.ok(Math.abs(got.costUsd - 0.05) < 1e-9, `cost accrued: ${got.costUsd}`)
  assert.ok(got.updatedAt >= got.createdAt)
})

await check('assistant thinking persists with the turn (and stays absent when not captured)', async () => {
  const c = await recordUserMessage(meta(), 'Q with reasoning')
  await recordAssistantMessage(c.id, 'A with reasoning', { thinking: 'step 1… step 2…' })
  await recordUserMessage(meta(), 'Q plain', c.id)
  await recordAssistantMessage(c.id, 'A plain')
  const got = getConversation(c.id)!
  assert.equal(got.messages[1].thinking, 'step 1… step 2…')
  assert.equal(got.messages[3].thinking, undefined)
})

await check('canceling a streamed turn removes only its pending question from durable History', async () => {
  const c = await recordUserMessage(meta(), 'kept question')
  await recordAssistantMessage(c.id, 'kept answer')
  const pending = await reservePending(meta(), 'canceled question', c.id)
  assert.equal(await rollbackUserMessage(pending.rollback), true)
  assert.deepEqual(getConversation(c.id)!.messages.map((m) => m.content), ['kept question', 'kept answer'])
  assert.equal(await rollbackUserMessage(pending.rollback), false, 'cleanup is idempotent')

  const first = await reservePending(meta(), 'canceled first question')
  assert.equal(getConversation(first.conversation.id), null, 'an unfinished first turn is never exposed in durable History')
  assert.equal(await rollbackUserMessage(first.rollback), true)
  assert.equal(getConversation(first.conversation.id), null, 'an aborted first turn must not leave an empty conversation')
})

await check('cancel rollback restores the retention boundary and prior mutable metadata', async () => {
  const c = await recordUserMessage(meta({ runRoot: 'analyses/EMAR_old', orbPath: 'old/orb.md' }), 'q0')
  await Promise.all(Array.from({ length: 399 }, (_, i) => recordAssistantMessage(c.id, `a${i}`)))
  const before = structuredClone(getConversation(c.id)!)
  assert.equal(before.messages.length, 400)
  const pending = await reservePending(meta({
    title: 'Changed title', model: 'opus', style: 'detailed',
    runRoot: 'analyses/EMAR_new', orbPath: 'new/orb.md',
  }), 'canceled overflow', c.id)
  assert.equal(pending.conversation.messages.length, 401, 'the route still gets a virtual snapshot containing the pending question')
  assert.deepEqual(getConversation(c.id), before, 'pending work must not mutate the durable conversation')
  assert.equal(await rollbackUserMessage(pending.rollback), true)
  assert.deepEqual(getConversation(c.id), before, 'rollback must reconstruct the exact pre-turn durable state')
})

await check('pending success atomically commits the question and answer', async () => {
  const c = await recordUserMessage(meta(), 'kept seed')
  const turnId = 'turn_completed_test_0001'
  const pending = await reservePending(meta({ title: 'Newest title', model: 'opus' }), 'completed question', c.id, turnId)
  const computed = [{ metric: 'revenue_growth', target: 123.45 }]
  const memory = { kind: 'ask-memory', shelves: [{ kind: 'run', label: 'current research', count: 1 }] }
  assert.equal(await recordAssistantMessageForPending(pending.rollback, 'completed answer', {
    sourcePath: 'analyses/EMAR/final_thesis.md', costUsd: 0.04, thinking: 'receipt reasoning', computed, memory,
  }), true)
  const got = getConversation(c.id)!
  assert.deepEqual(got.messages.map((m) => m.content), ['kept seed', 'completed question', 'completed answer'])
  assert.equal(got.messages[1].turnId, turnId)
  assert.equal(got.messages[2].turnId, turnId)
  assert.equal(got.title, 'Newest title')
  assert.equal(got.model, 'opus')
  assert.equal(got.costUsd, 0.04)
  const completed = findCompletedTurnForUser(turnId, 'alice@example.com')
  assert.equal(completed?.conversation.id, c.id)
  assert.equal(completed?.userMessage.content, 'completed question')
  assert.equal(completed?.assistantMessage.content, 'completed answer')
  assert.equal(completed?.assistantMessage.thinking, 'receipt reasoning')
  assert.equal(completed?.assistantMessage.sourcePath, 'analyses/EMAR/final_thesis.md')
  assert.equal(completed?.assistantMessage.costUsd, 0.04)
  assert.deepEqual(completed?.assistantMessage.computed, computed)
  assert.deepEqual(completed?.assistantMessage.memory, memory)
  assert.equal(findCompletedTurnForUser(turnId, 'mallory@example.com'), null, 'lookup is scoped to the authoritative user')
  assert.equal(await rollbackUserMessage(pending.rollback), false, 'a committed turn cannot be rolled back as pending')
})

await check('one user cannot reserve the same turn id twice while it is pending', async () => {
  const c = await recordUserMessage(meta(), 'reservation seed')
  const turnId = 'turn_duplicate_test_0001'
  const first = await reservePending(meta(), 'first request', c.id, turnId)
  await assert.rejects(
    recordPendingUserMessage(meta(), 'duplicate request', c.id, turnId),
    (error: any) => error?.code === 'TURN_ALREADY_PENDING',
  )
  assert.equal(await rollbackUserMessage(first.rollback), true)
  const afterRollback = await reservePending(meta(), 'allowed after rollback', c.id, turnId)
  // Queue a re-admission against the in-flight commit. BOTH interleavings are contractual: the commit
  // publishes its receipt before releasing the reservation, so a concurrent admission observes either that
  // published receipt (replay) or the reservation the commit still holds (TURN_ALREADY_PENDING). Which one
  // it lands on is the scheduler's choice, not the store's — pinning a single branch asserts machine load,
  // and under CPU pressure the racer arrives first often enough to fail the suite. Assert instead what has
  // to hold either way: no second paid answer, and no duplicated durable pair. Settle the outcome at
  // creation, because a contractual rejection that lands while the commit is still awaited escapes as an
  // unhandled rejection. Omit the conversation id so the retry uses a different lock and proves the
  // user+turn admission is global.
  const commit = recordAssistantMessageForPending(afterRollback.rollback, 'committed once')
  const raced = recordPendingUserMessage(meta(), 'allowed after rollback', undefined, turnId).then(
    (result) => ({ ok: true as const, result }),
    (error: any) => ({ ok: false as const, error }),
  )
  assert.equal(await commit, true)
  const outcome = await raced
  if (outcome.ok) {
    assert.equal(outcome.result.status, 'completed', 'an admitted racer replays the receipt, it never launches a second answer')
    if (outcome.result.status === 'completed') assert.equal(outcome.result.completed.assistantMessage.content, 'committed once')
  } else {
    // Carry the real error into the message: on an unexpected rejection the bare assertion reads
    // "undefined == 'TURN_ALREADY_PENDING'", which hides the thing you actually need to debug.
    assert.equal(outcome.error?.code, 'TURN_ALREADY_PENDING',
      `the only contractual rejection is the reservation the commit still holds — got ${outcome.error?.stack || outcome.error}`)
  }
  // The receipt-wins rule itself is deterministic once the commit is durable: the release runs inside the
  // same mutation that published the receipt, so after `await commit` no interval remains in which a
  // re-admission could still be handed a fresh reservation.
  const afterCommit = await recordPendingUserMessage(meta(), 'allowed after rollback', undefined, turnId)
  assert.equal(afterCommit.status, 'completed', 'completion receipt wins re-admission once the commit is durable')
  if (afterCommit.status === 'completed') assert.equal(afterCommit.completed.assistantMessage.content, 'committed once')
  assert.equal(getConversation(c.id)!.messages.filter((message) => message.turnId === turnId).length, 2, 'the raced retry cannot duplicate the durable pair')
  await assert.rejects(
    recordPendingUserMessage(meta(), 'bad id', c.id, 'not-a-turn-id'),
    (error: any) => error?.code === 'INVALID_TURN_ID',
  )
})

await check('a kernel lease prevents a second process from launching the same paid turn and crash-releases', async () => {
  const reservations = path.join(CHATS_DIR, 'turn-reservations')
  fs.mkdirSync(reservations, { recursive: true })
  const liveTurn = 'turn_cross_process_live_0001'
  const liveFile = turnLockFile('alice@example.com', liveTurn)
  const holder = await startForeignFlock(liveFile)
  const inode = fs.statSync(liveFile).ino
  try {
    await assert.rejects(
      recordPendingUserMessage(meta(), 'must not launch', undefined, liveTurn),
      (error: any) => error?.code === 'TURN_ALREADY_PENDING',
    )
    assert.equal(fs.statSync(liveFile).ino, inode, 'a live owner keeps the stable lock inode')
  } finally {
    await stopForeignFlock(holder)
  }

  const afterCrash = await reservePending(meta(), 'crashed owner can be retried', undefined, liveTurn)
  assert.equal(await rollbackUserMessage(afterCrash.rollback), true)
  assert.equal(fs.statSync(liveFile).ino, inode, 'release closes the descriptor instead of unlinking the lock')
})

await check('three delayed turn contenders cannot displace a live kernel owner', async () => {
  const reservations = path.join(CHATS_DIR, 'turn-reservations')
  fs.mkdirSync(reservations, { recursive: true })
  const turnId = 'turn_reclaim_aba_0001'
  const file = turnLockFile('alice@example.com', turnId)
  const holder = await startForeignFlock(file)
  const inode = fs.statSync(file).ino
  try {
    const attempts = await Promise.allSettled([
      recordPendingUserMessage(meta(), 'contender C', undefined, turnId),
      recordPendingUserMessage(meta(), 'contender D', undefined, turnId),
      recordPendingUserMessage(meta(), 'contender E', undefined, turnId),
    ])
    assert.equal(attempts.every((result) => result.status === 'rejected' && result.reason?.code === 'TURN_ALREADY_PENDING'), true)
    assert.equal(fs.statSync(file).ino, inode, 'contenders never rename or unlink the live generation')
  } finally {
    await stopForeignFlock(holder)
  }
  const winner = await reservePending(meta(), 'one winner after crash release', undefined, turnId)
  assert.equal(await rollbackUserMessage(winner.rollback), true)
  assert.equal(fs.statSync(file).ino, inode)
})

await check('canceled unique turns use bounded stable lock shards instead of per-turn files', async () => {
  for (let i = 0; i < 25; i++) {
    const pending = await reservePending(meta(), `bounded lock ${i}`, undefined, `turn_bounded_shard_${String(i).padStart(4, '0')}`)
    assert.equal(await rollbackUserMessage(pending.rollback), true)
  }
  const turnFiles = fs.readdirSync(path.join(CHATS_DIR, 'turn-reservations'))
  const conversationFiles = fs.readdirSync(path.join(CHATS_DIR, 'conversation-mutations'))
  assert.equal(turnFiles.every((file) => /^shard-[0-9a-f]{3}\.flock$/.test(file)), true)
  assert.equal(conversationFiles.every((file) => /^shard-[0-9a-f]{3}\.flock$/.test(file)), true)
  assert.ok(turnFiles.length <= 4096, 'turn lock inode count has a hard shard bound')
  assert.ok(conversationFiles.length <= 4096, 'conversation lock inode count has a hard shard bound')
})

await check('an admission failure after turn-lock claim releases the exact lease for retry', async () => {
  const conversation = await recordUserMessage(meta(), 'clock corruption seed')
  const clocks = path.join(CHATS_DIR, 'conversation-clocks')
  fs.mkdirSync(clocks, { recursive: true })
  const clock = path.join(clocks, `${conversation.id}.json`)
  fs.writeFileSync(clock, '{broken')
  const turnId = 'turn_clock_failure_retry_0001'
  await assert.rejects(recordPendingUserMessage(meta(), 'must release after clock error', conversation.id, turnId))
  fs.unlinkSync(clock)
  const retried = await reservePending(meta(), 'must release after clock error', conversation.id, turnId)
  assert.equal(await rollbackUserMessage(retried.rollback), true, 'the retained fd was closed on the failing admission')
})

await check('toggling history mode after admission cannot strand a retained turn lease', async () => {
  const turnId = 'turn_toggle_lease_0001'
  const pending = await reservePending(meta(), 'toggle-safe reservation', undefined, turnId)
  process.env.ENGINE_CHAT_HISTORY_DISABLED = '1'
  try {
    assert.equal(await rollbackUserMessage(pending.rollback), true)
  } finally {
    delete process.env.ENGINE_CHAT_HISTORY_DISABLED
  }
  const retried = await reservePending(meta(), 'toggle-safe reservation', undefined, turnId)
  assert.equal(await rollbackUserMessage(retried.rollback), true)
})

await check('conversation-lock timeout is a typed admission failure and never creates a turn lease', async () => {
  const conversation = await recordUserMessage(meta(), 'busy admission seed')
  const mutations = path.join(CHATS_DIR, 'conversation-mutations')
  fs.mkdirSync(mutations, { recursive: true })
  const lockFile = conversationLockFile(conversation.id)
  const holder = await startForeignFlock(lockFile)
  const inode = fs.statSync(lockFile).ino
  const turnId = 'turn_conversation_busy_0001'
  try {
    await assert.rejects(
      recordPendingUserMessage(meta(), 'must stop before paid work', conversation.id, turnId),
      (error: any) => error?.code === 'CONVERSATION_BUSY' && /retry/i.test(error?.message || ''),
    )
    const turnLease = turnLockFile('alice@example.com', turnId)
    assert.equal(fs.existsSync(turnLease), false, 'busy conversation admission cannot fall through to an untracked paid turn')
  } finally {
    await stopForeignFlock(holder)
  }
  const retry = await reservePending(meta(), 'must stop before paid work', conversation.id, turnId)
  assert.equal(await rollbackUserMessage(retry.rollback), true, 'the same exact id remains retryable after contention clears')
  assert.equal(fs.statSync(lockFile).ino, inode, 'conversation release preserves the stable coordinator inode')
})

await check('three process-local coordinators cannot displace a live conversation kernel owner', async () => {
  const conversation = await recordUserMessage(meta(), 'kernel conversation seed')
  const mutations = path.join(CHATS_DIR, 'conversation-mutations')
  fs.mkdirSync(mutations, { recursive: true })
  const file = conversationLockFile(conversation.id)
  const holder = await startForeignFlock(file)
  const inode = fs.statSync(file).ino
  const workers = await Promise.all(['c', 'd', 'e'].map((name) => import(
    new URL(`../src/chat-store.ts?conversation-flock-${name}=${crypto.randomUUID()}`, import.meta.url).href
  )))
  try {
    const attempts = await Promise.allSettled(workers.map((worker, i) => worker.recordPendingUserMessage(
      meta(), `conversation contender ${i}`, conversation.id, `turn_conversation_aba_000${i + 1}`,
    )))
    assert.equal(attempts.every((result) => result.status === 'rejected' && result.reason?.code === 'CONVERSATION_BUSY'), true)
    assert.equal(fs.statSync(file).ino, inode, 'no contender can move the owner inode')
    for (let i = 0; i < 3; i++) {
      const turnLease = turnLockFile('alice@example.com', `turn_conversation_aba_000${i + 1}`)
      assert.equal(fs.existsSync(turnLease), false)
    }
  } finally {
    await stopForeignFlock(holder)
  }
  const admitted = await workers[0].recordPendingUserMessage(
    meta(), 'admitted after crash release', conversation.id, 'turn_conversation_aba_retry',
  )
  assert.equal(admitted.status, 'pending')
  if (admitted.status === 'pending') assert.equal(await workers[0].rollbackUserMessage(admitted.rollback), true)
  assert.equal(fs.statSync(file).ino, inode)
})

await check('an immutable receipt winner cannot be overwritten by a deploy-overlap loser', async () => {
  const turnId = 'turn_cross_process_winner_0001'
  const pending = await reservePending(meta(), 'same exact question', undefined, turnId)
  const assistantTs = pending.rollback.messageTs + 1
  const { messages: _messages, ...conversation } = pending.conversation
  conversation.updatedAt = assistantTs
  conversation.costUsd = 0.02
  const receipt = {
    v: 1,
    userHash: userHash('alice@example.com'),
    turnId,
    completedAt: assistantTs,
    conversation,
    userMessage: { role: 'user', content: 'same exact question', ts: pending.rollback.messageTs, turnId },
    assistantMessage: { role: 'assistant', content: 'authoritative winner', ts: assistantTs, turnId, costUsd: 0.02 },
    turnRetained: true,
  }
  const receipts = path.join(CHATS_DIR, 'turn-receipts')
  fs.mkdirSync(receipts, { recursive: true })
  fs.writeFileSync(path.join(receipts, `${userHash('alice@example.com')}_${turnId}.json`), JSON.stringify(receipt))

  assert.equal(await recordAssistantMessageForPending(pending.rollback, 'losing answer', { costUsd: 0.03 }), false)
  assert.equal(findCompletedTurnForUser(turnId, 'alice@example.com')?.assistantMessage.content, 'authoritative winner')
  const got = getConversation(pending.conversation.id)!
  assert.deepEqual(got.messages.map((message) => message.content), ['same exact question', 'authoritative winner'])
  assert.equal(got.messages.some((message) => message.content === 'losing answer'), false)
})

await check('a receipt published just before successful lease acquisition is replayed without paid duplication', async () => {
  const turnId = 'turn_receipt_before_claim_0001'
  const winner = await reservePending(meta(), 'lease handoff question', undefined, turnId)
  assert.equal(await recordAssistantMessageForPending(winner.rollback, 'lease handoff winner'), true)
  const receiptFile = path.join(CHATS_DIR, 'turn-receipts', `${userHash('alice@example.com')}_${turnId}.json`)
  const fresh = await import(new URL(`../src/chat-store.ts?receipt-before-claim=${crypto.randomUUID()}`, import.meta.url).href)
  const readFile = fs.readFileSync
  let hidInitialLookup = false
  ;(fs as any).readFileSync = (file: fs.PathOrFileDescriptor, ...args: any[]) => {
    if (!hidInitialLookup && String(file) === receiptFile) {
      hidInitialLookup = true
      const error = Object.assign(new Error('fault-injected first receipt miss'), { code: 'ENOENT' })
      throw error
    }
    return (readFile as any)(file, ...args)
  }
  try {
    const replay = await fresh.recordPendingUserMessage(meta(), 'lease handoff question', undefined, turnId)
    assert.equal(replay.status, 'completed', 'the post-flock receipt read closes the handoff race')
    if (replay.status === 'completed') assert.equal(replay.completed.assistantMessage.content, 'lease handoff winner')
  } finally {
    ;(fs as any).readFileSync = readFile
  }
})

await check('a receipt heals History when the process dies between WAL publication and transcript write', async () => {
  const turnId = 'turn_wal_heal_0001'
  const pending = await reservePending(meta(), 'recover my history', undefined, turnId)
  assert.equal(await recordAssistantMessageForPending(pending.rollback, 'recovered answer', {
    computed: [{ kind: 'scenario', scenario: { variable: 'x', impact: 7 } }],
  }), true)
  const transcript = path.join(CHATS_DIR, `${pending.conversation.id}.json`)
  fs.unlinkSync(transcript) // fault injection: simulate a crash/failure after immutable receipt publication
  assert.equal(getConversation(pending.conversation.id), null)
  const replay = findCompletedTurnForUser(turnId, 'alice@example.com')
  assert.equal(replay?.assistantMessage.content, 'recovered answer')
  assert.deepEqual(getConversation(pending.conversation.id)?.messages.map((message) => message.content), [
    'recover my history', 'recovered answer',
  ], 'receipt lookup reconstructs the reopenable History view')
})

await check('WAL healing merges a missing retained turn even after a later turn advances History', async () => {
  const seed = await recordUserMessage(meta(), 'WAL merge seed')
  await recordAssistantMessage(seed.id, 'WAL merge seed answer')
  const beforeA = structuredClone(getConversation(seed.id)!)
  const a = await reservePending(meta(), 'question A lost after receipt', seed.id, 'turn_wal_merge_a_0001')
  assert.equal(await recordAssistantMessageForPending(a.rollback, 'answer A', { costUsd: 0.02 }), true)
  // Fault injection: A's receipt survived, but its transcript rename did not. A later tab then commits C
  // against the last pre-A transcript before A is reconciled.
  fs.writeFileSync(path.join(CHATS_DIR, `${seed.id}.json`), JSON.stringify(beforeA))
  const c = await reservePending(meta(), 'later question C', seed.id, 'turn_wal_merge_c_0001')
  assert.equal(await recordAssistantMessageForPending(c.rollback, 'later answer C', { costUsd: 0.03 }), true)
  assert.deepEqual(getConversation(seed.id)!.messages.map((message) => message.content), [
    'WAL merge seed', 'WAL merge seed answer', 'later question C', 'later answer C',
  ])

  assert.equal(findCompletedTurnForUser('turn_wal_merge_a_0001', 'alice@example.com')?.assistantMessage.content, 'answer A')
  const healed = getConversation(seed.id)!
  assert.deepEqual(healed.messages.map((message) => message.content), [
    'WAL merge seed', 'WAL merge seed answer', 'question A lost after receipt', 'answer A', 'later question C', 'later answer C',
  ])
  assert.equal(healed.costUsd, 0.05, 'recovered and later turn costs both remain in the conversation total')
})

await check('deleting an existing conversation while reservation queues cannot resurrect it', async () => {
  const c = await recordUserMessage(meta(), 'delete me')
  const pendingPromise = reservePending(meta(), 'must not resurrect', c.id)
  assert.equal(deleteConversation(c.id, 'alice@example.com'), true)
  const pending = await pendingPromise
  assert.equal(pending.rollback.created, false, 'admission knew this was an existing id before deletion')
  assert.equal(await recordAssistantMessageForPending(pending.rollback, 'must stay deleted'), false)
  assert.equal(await rollbackUserMessage(pending.rollback), true)
  assert.equal(getConversation(c.id), null)
})

await check('out-of-order concurrent rollback preserves the exact 400-message counterfactual', async () => {
  const c = await recordUserMessage(meta(), 'q0')
  await Promise.all(Array.from({ length: 399 }, (_, i) => recordAssistantMessage(c.id, `a${i}`)))
  const before = structuredClone(getConversation(c.id)!)
  const older = await reservePending(meta({ title: 'Older pending' }), 'pending A', c.id)
  const newer = await reservePending(meta({ title: 'Newer pending' }), 'pending B', c.id)
  assert.deepEqual(getConversation(c.id), before, 'neither pending question enters the file before completion')
  assert.equal(await rollbackUserMessage(older.rollback), true)
  const between = getConversation(c.id)!
  assert.equal(between.messages.length, 400)
  assert.equal(between.messages[0].content, 'q0', 'no committed head may be evicted while B is pending')
  assert.equal(between.messages.at(-1)?.content, 'a398')
  assert.equal(await rollbackUserMessage(newer.rollback), true)
  assert.deepEqual(getConversation(c.id), before, 'rolling both turns back in either order must restore the original file')
})

await check('an unfinished turn cannot strand retention across later writes', async () => {
  const c = await recordUserMessage(meta(), 'q0')
  await Promise.all(Array.from({ length: 399 }, (_, i) => recordAssistantMessage(c.id, `a${i}`)))
  const pending = await reservePending(meta(), 'process dies before this completes', c.id)
  await Promise.all(Array.from({ length: 50 }, (_, i) => recordAssistantMessage(c.id, `later-${i}`)))
  const got = getConversation(c.id)!
  assert.equal(got.messages.length, 400, 'in-memory pending work cannot disable the durable cap')
  assert.equal(got.messages.some((m) => m.content === 'process dies before this completes'), false)
  assert.equal(await rollbackUserMessage(pending.rollback), true)
})

await check('reverse completion keeps arrival order, atomic adjacency, unique timestamps, and monotonic updatedAt', async () => {
  const c = await recordUserMessage(meta(), 'q0')
  await Promise.all(Array.from({ length: 399 }, (_, i) => recordAssistantMessage(c.id, `a${i}`)))
  const older = await reservePending(meta({ title: 'Older title', model: 'haiku' }), 'pending A', c.id)
  const newer = await reservePending(meta({ title: 'Newer title', model: 'opus' }), 'pending B', c.id)
  // Complete in reverse order to exercise arrival-order adjudication rather than completion order.
  assert.equal(await recordAssistantMessageForPending(newer.rollback, 'answer B'), true)
  const afterNewer = getConversation(c.id)!
  assert.equal(await recordAssistantMessageForPending(older.rollback, 'answer A'), true)
  const got = getConversation(c.id)!
  assert.equal(got.messages.length, 400)
  const olderIndex = got.messages.findIndex((message) => message.turnId === older.rollback.turnId)
  const newerIndex = got.messages.findIndex((message) => message.turnId === newer.rollback.turnId)
  assert.ok(olderIndex >= 0 && newerIndex >= 0)
  assert.ok(olderIndex < newerIndex, 'turn groups follow question arrival even when answers finish in reverse')
  assert.deepEqual(got.messages.slice(olderIndex, olderIndex + 2).map((message) => [message.role, message.content, message.turnId]), [
    ['user', 'pending A', older.rollback.turnId],
    ['assistant', 'answer A', older.rollback.turnId],
  ])
  assert.deepEqual(got.messages.slice(newerIndex, newerIndex + 2).map((message) => [message.role, message.content, message.turnId]), [
    ['user', 'pending B', newer.rollback.turnId],
    ['assistant', 'answer B', newer.rollback.turnId],
  ])
  const timestamps = got.messages.map((message) => message.ts)
  assert.equal(new Set(timestamps).size, timestamps.length, 'every persisted message timestamp is unique')
  assert.ok(got.updatedAt > afterNewer.updatedAt, 'an older question completing later still advances updatedAt')
  assert.ok(got.updatedAt >= Math.max(...timestamps), 'updatedAt covers every completion timestamp')
  assert.equal(got.title, 'Newer title')
  assert.equal(got.model, 'opus')
})

await check('a slow turn crossing the retention boundary is pruned whole, never left as an orphan answer', async () => {
  const c = await recordUserMessage(meta(), 'retention seed question')
  await recordAssistantMessage(c.id, 'retention seed answer')
  const slowTurnId = 'turn_retention_slow_000000'
  const slow = await reservePending(meta(), 'slow boundary question', c.id, slowTurnId)
  // `slow` holds its reservation for the whole loop. Reservations are a bounded pool of shared lock shards,
  // so an unrelated turn id can hash onto slow's shard and be refused. Production accepts that by design
  // (the documented ceiling is three simultaneous chats, and the refusal costs a retry, never duplicate paid
  // work) — but 200 sequential turns against one long-held lease is far outside that envelope, and a random
  // id collides here roughly one run in twenty. Pick ids that miss slow's shard so this check measures
  // retention pruning, which is what it is for, rather than shard luck.
  const slowShard = turnLockFile(meta().user, slowTurnId)
  const fastTurnIds: string[] = []
  for (let i = 0; fastTurnIds.length < 200; i++) {
    const candidate = `turn_retention_fast_${String(i).padStart(6, '0')}`
    if (turnLockFile(meta().user, candidate) !== slowShard) fastTurnIds.push(candidate)
  }
  for (let i = 0; i < 200; i++) {
    const fast = await reservePending(meta(), `fast question ${i}`, c.id, fastTurnIds[i])
    assert.equal(await recordAssistantMessageForPending(fast.rollback, `fast answer ${i}`), true)
  }
  const beforeSlowCompletion = structuredClone(getConversation(c.id)!)
  const slowComputed = [{ scenario: 'slow-retained-receipt', value: 77 }]
  assert.equal(await recordAssistantMessageForPending(slow.rollback, 'slow boundary answer', {
    sourcePath: 'analyses/EMAR/slow.md', costUsd: 0.07, thinking: 'slow reasoning', computed: slowComputed,
  }), true)
  const got = getConversation(c.id)!
  assert.equal(got.messages.length, 400)
  const slowMessages = got.messages.filter((message) => message.turnId === slow.rollback.turnId)
  assert.equal(slowMessages.length, 0, 'the oldest slow pair is removed together at the 400-message boundary')
  assert.equal(got.messages.some((message) => message.content === 'slow boundary question'), false)
  assert.equal(got.messages.some((message) => message.content === 'slow boundary answer'), false)
  const replay = findCompletedTurnForUser(slow.rollback.turnId, 'alice@example.com')
  assert.equal(replay?.conversation.id, c.id, 'receipt remains replayable after transcript retention removes the pair')
  assert.equal(replay?.userMessage.content, 'slow boundary question')
  assert.equal(replay?.assistantMessage.content, 'slow boundary answer')
  assert.equal(replay?.assistantMessage.thinking, 'slow reasoning')
  assert.equal(replay?.assistantMessage.sourcePath, 'analyses/EMAR/slow.md')
  assert.equal(replay?.assistantMessage.costUsd, 0.07)
  assert.deepEqual(replay?.assistantMessage.computed, slowComputed)
  assert.equal(getConversation(c.id)!.messages.some((message) => message.turnId === slow.rollback.turnId), false,
    'replaying a turn that retention intentionally pruned must not reinsert it into History')
  const receiptOnDisk = fs.readdirSync(path.join(CHATS_DIR, 'turn-receipts')).some((file) => {
    try { return JSON.parse(fs.readFileSync(path.join(CHATS_DIR, 'turn-receipts', file), 'utf8')).turnId === slow.rollback.turnId } catch { return false }
  })
  assert.equal(receiptOnDisk, true, 'the retained replay is durable, not transcript-derived')
  // Fault injection: its receipt published but the transcript write (including aggregate cost + settlement
  // id) never landed. The pair stays outside retention, while cost settles once and replay cannot double it.
  fs.writeFileSync(path.join(CHATS_DIR, `${c.id}.json`), JSON.stringify(beforeSlowCompletion))
  assert.ok(findCompletedTurnForUser(slow.rollback.turnId, 'alice@example.com'))
  const healedPruned = getConversation(c.id)!
  assert.equal(healedPruned.messages.some((message) => message.turnId === slow.rollback.turnId), false)
  assert.equal(healedPruned.costUsd, +(beforeSlowCompletion.costUsd + 0.07).toFixed(4))
  assert.ok(healedPruned.settledPrunedTurnIds?.includes(slow.rollback.turnId))
  assert.ok(findCompletedTurnForUser(slow.rollback.turnId, 'alice@example.com'))
  assert.equal(getConversation(c.id)!.costUsd, healedPruned.costUsd, 'a second receipt lookup cannot double the recovered cost')
  for (let i = 0; i < got.messages.length; i += 2) {
    const question = got.messages[i]
    const answer = got.messages[i + 1]
    assert.equal(question.role, 'user')
    assert.equal(answer.role, 'assistant')
    assert.equal(question.turnId, answer.turnId, `retained turn at message ${i} must stay atomic`)
  }
})

await check('A/B reserve, B complete, C reserve, A complete, C complete keeps every timestamp unique', async () => {
  const originalNow = Date.now
  Date.now = () => 42_000
  try {
    const c = await recordUserMessage(meta(), 'three-turn seed')
    await recordAssistantMessage(c.id, 'three-turn seed answer')
    const a = await reservePending(meta(), 'question A', c.id, 'turn_three_way_a_0001')
    const b = await reservePending(meta(), 'question B', c.id, 'turn_three_way_b_0001')
    assert.equal(await recordAssistantMessageForPending(b.rollback, 'answer B'), true)
    const afterB = getConversation(c.id)!.updatedAt
    const third = await reservePending(meta(), 'question C', c.id, 'turn_three_way_c_0001')
    assert.ok(third.rollback.messageTs > afterB, 'C reservation advances beyond B completion')
    assert.equal(await recordAssistantMessageForPending(a.rollback, 'answer A'), true)
    const afterA = getConversation(c.id)!.updatedAt
    assert.ok(afterA > third.rollback.messageTs, 'late A answer advances beyond the still-pending C timestamp')
    assert.equal(await recordAssistantMessageForPending(third.rollback, 'answer C'), true)
    const got = getConversation(c.id)!
    const messages = got.messages.filter((message) => message.turnId?.startsWith('turn_three_way_'))
    assert.deepEqual(messages.map((message) => message.content), ['question A', 'answer A', 'question B', 'answer B', 'question C', 'answer C'])
    const timestamps = messages.map((message) => message.ts)
    assert.equal(new Set(timestamps).size, 6)
    assert.ok(got.updatedAt > afterA)
    assert.ok(got.updatedAt >= Math.max(...timestamps))
  } finally {
    Date.now = originalNow
  }
})

await check('two process-local stores share a durable admission clock and newer metadata wins', async () => {
  const originalNow = Date.now
  Date.now = () => 84_000
  try {
    const seed = await recordUserMessage(meta({ title: 'Clock seed' }), 'cross-process clock seed')
    await recordAssistantMessage(seed.id, 'cross-process clock seed answer')
    const workerA = await import(new URL(`../src/chat-store.ts?clock-a=${crypto.randomUUID()}`, import.meta.url).href)
    const workerB = await import(new URL(`../src/chat-store.ts?clock-b=${crypto.randomUUID()}`, import.meta.url).href)
    const a = await workerA.recordPendingUserMessage(
      meta({ title: 'Older process A', model: 'haiku' }), 'process A question', seed.id, 'turn_process_clock_a_0001',
    )
    const b = await workerB.recordPendingUserMessage(
      meta({ title: 'Newer process B', model: 'opus' }), 'process B question', seed.id, 'turn_process_clock_b_0001',
    )
    assert.equal(a.status, 'pending'); assert.equal(b.status, 'pending')
    if (a.status !== 'pending' || b.status !== 'pending') throw new Error('expected pending cross-process turns')
    assert.ok(a.rollback.messageTs < b.rollback.messageTs, 'the durable clock orders admissions across process-local maps')
    assert.equal(await workerB.recordAssistantMessageForPending(b.rollback, 'process B answer'), true)
    assert.equal(await workerA.recordAssistantMessageForPending(a.rollback, 'process A answer'), true)
    const got = getConversation(seed.id)!
    assert.equal(got.title, 'Newer process B')
    assert.equal(got.model, 'opus')
    assert.deepEqual(got.messages.slice(-4).map((message) => message.content), [
      'process A question', 'process A answer', 'process B question', 'process B answer',
    ])
  } finally {
    Date.now = originalNow
  }
})

await check('a client-echoed id for a NON-existent conversation mints a fresh id (no ghost file)', async () => {
  const c = await recordUserMessage(meta(), 'orphan', 'chat_zzzzzz_deadbeef')
  assert.notEqual(c.id, 'chat_zzzzzz_deadbeef')
  assert.ok(isValidConversationId(c.id))
})

await check('an invalid echoed id is ignored (never used to build a path)', async () => {
  const c = await recordUserMessage(meta(), 'safe', '../../../etc/passwd')
  assert.ok(isValidConversationId(c.id))
  assert.equal(c.messages[0].content, 'safe')
})

await check('the same user cannot carry a conversation across subject or scope context', async () => {
  const original = await recordUserMessage(meta({ subject: 'AAA', title: 'Ask · AAA' }), 'AAA question')
  await recordAssistantMessage(original.id, 'AAA answer')
  const forked = await reservePending(
    meta({ subject: 'BBB', title: 'Ask · BBB', scope: 'module', module: 'valuation' }),
    'BBB question',
    original.id,
    'turn_cross_context_0001',
  )
  assert.notEqual(forked.conversation.id, original.id, 'context mismatch must fork before any prior card/history can carry forward')
  assert.equal(forked.conversation.subject, 'BBB')
  assert.equal(forked.conversation.scope, 'module')
  assert.deepEqual(getConversation(original.id)?.messages.map((message) => message.content), ['AAA question', 'AAA answer'])
  assert.equal(await rollbackUserMessage(forked.rollback), true)

  const receiptTurnId = 'turn_cross_context_receipt_0001'
  const paid = await reservePending(meta({ subject: 'AAA', title: 'Ask · AAA' }), 'same exact question', original.id, receiptTurnId)
  assert.equal(await recordAssistantMessageForPending(paid.rollback, 'AAA receipt answer'), true)
  await assert.rejects(
    recordPendingUserMessage(
      meta({ subject: 'BBB', title: 'Ask · BBB' }), 'same exact question', undefined, receiptTurnId,
    ),
    (error: any) => error?.code === 'TURN_CONTEXT_MISMATCH',
    'the store itself must reject both fast and raced receipt replay across context',
  )
})

// ---- identity is server-authoritative: the same subject can hold two users' separate conversations ----
await check('two users get two separate conversations for the same subject', async () => {
  const a = await recordUserMessage(meta({ user: 'a@x.com' }), 'from A')
  const b = await recordUserMessage(meta({ user: 'b@x.com' }), 'from B')
  assert.notEqual(a.id, b.id)
  assert.equal(getConversation(a.id)!.user, 'a@x.com')
  assert.equal(getConversation(b.id)!.user, 'b@x.com')
})

await check('a user cannot append to (or misattribute) ANOTHER user\'s conversation — it forks instead', async () => {
  const a = await recordUserMessage(meta({ user: 'owner@x.com' }), 'A owns this', undefined)
  await recordAssistantMessage(a.id, 'answer to owner')
  // attacker B echoes A's id with a title of their choosing
  const forked = await recordUserMessage(meta({ user: 'attacker@x.com', title: 'HIJACKED' }), 'injected question', a.id)
  assert.notEqual(forked.id, a.id, 'must NOT attach to the owner\'s conversation')
  assert.equal(forked.user, 'attacker@x.com')
  // A's conversation is untouched: still 2 messages, original owner + title, no injected turn
  const aAfter = getConversation(a.id)!
  assert.equal(aAfter.user, 'owner@x.com')
  assert.equal(aAfter.messages.length, 2)
  assert.notEqual(aAfter.title, 'HIJACKED')
  assert.equal(aAfter.messages.some((m) => m.content === 'injected question'), false)
})

// ---- listing + filters ----
await check('list returns summaries newest-first with user/subject/scope/text filters', async () => {
  const all = listConversations()
  assert.ok(all.conversations.length > 0)
  assert.ok(all.conversations[0].updatedAt >= all.conversations[all.conversations.length - 1].updatedAt, 'newest-updated first')
  // summaries carry a preview + count but never the full transcript
  const withMsgs = all.conversations.find((c) => c.messageCount >= 2)
  assert.ok(withMsgs && typeof withMsgs.preview === 'string')
  assert.ok(!('messages' in (withMsgs as any)))

  const byUser = listConversations({ user: 'a@x.com' })
  assert.ok(byUser.conversations.length >= 1)
  assert.ok(byUser.conversations.every((c) => c.user === 'a@x.com'))

  assert.ok(all.users.includes('alice@example.com'))
  assert.ok(all.subjects.includes('EMAR'))
})

await check('text search matches the question body', async () => {
  const c = await recordUserMessage(meta({ subject: 'AAPL' }), 'unicorn margin decomposition please')
  await recordAssistantMessage(c.id, 'ok')
  const hit = listConversations({ q: 'unicorn' })
  assert.ok(hit.conversations.some((x) => x.id === c.id))
  const miss = listConversations({ q: 'zzzznotpresent' })
  assert.equal(miss.conversations.some((x) => x.id === c.id), false)
})

await check('memory search reuses existing durable transcripts but never crosses users', async () => {
  const own = await recordUserMessage(meta({ subject: 'AMZN', title: 'Ask · AMZN memory' }), 'memoryneedle advertising margin')
  await recordAssistantMessage(own.id, 'The earlier working answer about memoryneedle')
  const other = await recordUserMessage(meta({ user: 'other@example.com', subject: 'AMZN' }), 'memoryneedle private note')
  await recordAssistantMessage(other.id, 'must never be returned')
  const hits = searchConversationMemory({ user: 'alice@example.com', question: 'what did we say about memoryneedle?', subject: 'AMZN', swarm: 'research' })
  assert.ok(hits.some((hit) => hit.id === own.id))
  assert.ok(hits.every((hit) => hit.id !== other.id))
  assert.ok(hits.find((hit) => hit.id === own.id)?.snippet.includes('memoryneedle'))
  const excluded = searchConversationMemory({ user: 'alice@example.com', question: 'memoryneedle', subject: 'AMZN', excludeId: own.id })
  assert.ok(excluded.every((hit) => hit.id !== own.id), 'the open conversation must not retrieve itself')
})

await check('scope + subject filters compose', async () => {
  const c = await recordUserMessage(meta({ subject: 'MSFT', scope: 'module', module: 'valuation', title: 'Ask · MSFT — valuation' }), 'valuation q')
  const r = listConversations({ subject: 'MSFT', scope: 'module' })
  assert.ok(r.conversations.some((x) => x.id === c.id))
  assert.ok(r.conversations.every((x) => x.subject === 'MSFT' && x.scope === 'module'))
})

// ---- get + delete ----
await check('getConversation returns null for a bad id and for a missing id', () => {
  assert.equal(getConversation('../secret'), null)
  assert.equal(getConversation('chat_aaaaaa_00ff00ff'), null) // valid shape, no file
})

await check('delete removes the file; a re-read is null; bad ids are safely no-ops', async () => {
  const c = await recordUserMessage(meta(), 'to be deleted')
  const turnId = 'turn_delete_receipt_0001'
  const pending = await reservePending(meta(), 'delete receipt question', c.id, turnId)
  assert.equal(await recordAssistantMessageForPending(pending.rollback, 'delete receipt answer'), true)
  const staleTranscript = structuredClone(getConversation(c.id)!)
  assert.ok(findCompletedTurnForUser(turnId, 'alice@example.com'))
  assert.ok(fs.existsSync(path.join(CHATS_DIR, `${c.id}.json`)))
  assert.equal(deleteConversation(c.id, 'mallory@example.com'), false, 'knowing a shared History id cannot delete another user’s transcript')
  assert.ok(getConversation(c.id), 'the owner’s transcript remains after an unauthorized delete')
  assert.ok(findCompletedTurnForUser(turnId, 'alice@example.com'), 'the owner’s replay receipt remains after an unauthorized delete')
  assert.equal(deleteConversation(c.id, 'alice@example.com'), true)
  assert.equal(getConversation(c.id), null)
  assert.equal(findCompletedTurnForUser(turnId, 'alice@example.com'), null, 'explicit History deletion revokes durable and cached replay')
  assert.ok(fs.existsSync(path.join(CHATS_DIR, 'conversation-revocations', `${userHash('alice@example.com')}_${c.id}.json`)),
    'revocation is durable and directly addressable across processes')
  assert.ok(fs.existsSync(path.join(CHATS_DIR, 'turn-receipts', `${userHash('alice@example.com')}_${turnId}.json`)),
    'privacy does not depend on a synchronous scan/unlink of every receipt')
  fs.writeFileSync(path.join(CHATS_DIR, `${c.id}.json`), JSON.stringify(staleTranscript))
  assert.equal(getConversation(c.id), null, 'a stale transcript left by a crash stays hidden behind the revocation')
  assert.equal(listConversations({ user: 'alice@example.com' }).conversations.some((row) => row.id === c.id), false,
    'a revoked transcript can never reappear in History')
  fs.unlinkSync(path.join(CHATS_DIR, `${c.id}.json`))
  assert.equal(deleteConversation(c.id, 'alice@example.com'), false) // already gone
  const revocations = path.join(CHATS_DIR, 'conversation-revocations')
  const markerCount = fs.readdirSync(revocations).length
  assert.equal(deleteConversation('chat_missing_deadbeef', 'alice@example.com'), false)
  assert.equal(fs.readdirSync(revocations).length, markerCount, 'random missing ids cannot grow permanent revocation state')
  assert.equal(deleteConversation('../../etc/passwd', 'alice@example.com'), false) // never touches an outside path
})

await check('a WAL-only completed turn can be authorized and deleted without resurrecting History', async () => {
  const user = 'wal-delete@example.com'
  const turnId = 'turn_wal_delete_0001'
  const pending = await reservePending(meta({ user }), 'question before transcript crash', undefined, turnId)
  assert.equal(await recordAssistantMessageForPending(pending.rollback, 'secret WAL answer'), true)
  const id = pending.conversation.id
  const transcriptFile = path.join(CHATS_DIR, `${id}.json`)
  const ownerFile = path.join(CHATS_DIR, 'conversation-owners', `${userHash(user)}_${id}.json`)
  assert.ok(fs.existsSync(ownerFile), 'receipt publication first writes a direct user-scoped owner proof')

  // Model the exact WAL window: immutable completion exists, transcript rename never landed.
  fs.unlinkSync(transcriptFile)
  assert.equal(deleteConversation(id, 'mallory@example.com'), false, 'another user cannot spend the owner proof')
  assert.equal(fs.existsSync(transcriptFile), false)
  assert.equal(deleteConversation(id, user), true, 'the real owner can tombstone a receipt-only conversation')
  assert.equal(findCompletedTurnForUser(turnId, user), null, 'the deleted receipt cannot heal History')
  assert.equal(fs.existsSync(ownerFile), false, 'the durable tombstone replaces the temporary owner proof')

  const restartedStore = await import(new URL(`../src/chat-store.ts?wal-delete=${Date.now()}`, import.meta.url).href)
  assert.equal(restartedStore.findCompletedTurnForUser(turnId, user), null, 'deletion remains authoritative after restart')
})

await check('history-disabled still honors deletion of older durable chats after a restart', async () => {
  const user = 'toggle-delete@example.com'
  const turnId = 'turn_toggle_delete_0001'
  const pending = await reservePending(meta({ user }), 'durable before the toggle', undefined, turnId)
  assert.equal(await recordAssistantMessageForPending(pending.rollback, 'private durable answer'), true)
  const id = pending.conversation.id
  const transcriptFile = path.join(CHATS_DIR, `${id}.json`)
  const staleTranscript = fs.readFileSync(transcriptFile, 'utf8')

  process.env.ENGINE_CHAT_HISTORY_DISABLED = '1'
  try {
    assert.equal(deleteConversation(id, user), true)
    const marker = path.join(CHATS_DIR, 'conversation-revocations', `${userHash(user)}_${id}.json`)
    assert.ok(fs.existsSync(marker), 'the mode toggle cannot turn a durable deletion into process-only memory')

    // Model a crash leaving the unlinked transcript behind, then import a fresh store instance so no
    // in-process revocation/cache can help. Both transcript and exact-turn replay must remain private.
    fs.writeFileSync(transcriptFile, staleTranscript)
    const restartedStore = await import(new URL(`../src/chat-store.ts?restart=${Date.now()}`, import.meta.url).href)
    assert.equal(restartedStore.getConversation(id), null)
    assert.equal(restartedStore.findCompletedTurnForUser(turnId, user), null)
    fs.unlinkSync(transcriptFile)
  } finally {
    delete process.env.ENGINE_CHAT_HISTORY_DISABLED
  }
})

await check('history-disabled mode keeps replay bounded in memory and writes no durable receipt', async () => {
  const turnId = 'turn_disabled_receipt_0001'
  process.env.ENGINE_CHAT_HISTORY_DISABLED = '1'
  try {
    const pending = await reservePending(meta({ user: 'disabled@example.com' }), 'disabled question', undefined, turnId)
    assert.equal(await recordAssistantMessageForPending(pending.rollback, 'disabled answer', { computed: [{ value: 9 }] }), true)
    assert.equal(getConversation(pending.conversation.id), null)
    assert.equal(findCompletedTurnForUser(turnId, 'disabled@example.com')?.assistantMessage.content, 'disabled answer')
    const durable = fs.existsSync(path.join(CHATS_DIR, 'turn-receipts')) && fs.readdirSync(path.join(CHATS_DIR, 'turn-receipts')).some((file) => {
      try { return JSON.parse(fs.readFileSync(path.join(CHATS_DIR, 'turn-receipts', file), 'utf8')).turnId === turnId } catch { return false }
    })
    assert.equal(durable, false)
    assert.equal(deleteConversation(pending.conversation.id, 'disabled@example.com'), false)
    assert.equal(findCompletedTurnForUser(turnId, 'disabled@example.com'), null, 'deletion also clears cache-only receipts')
  } finally {
    delete process.env.ENGINE_CHAT_HISTORY_DISABLED
  }
})

// ---- concurrency: many appends to one conversation don't drop a message ----
await check('concurrent appends to one conversation preserve every message (per-id serialization)', async () => {
  const c = await recordUserMessage(meta(), 'seed')
  await Promise.all(Array.from({ length: 20 }, (_, i) => recordAssistantMessage(c.id, `chunk-${i}`)))
  const got = getConversation(c.id)!
  assert.equal(got.messages.length, 21, `expected 1 seed + 20 appends, got ${got.messages.length}`)
  const bodies = new Set(got.messages.slice(1).map((m) => m.content))
  for (let i = 0; i < 20; i++) assert.ok(bodies.has(`chunk-${i}`), `missing chunk-${i}`)
})

console.log(`\n${passed} checks passed`)
process.on('exit', () => { try { fs.rmSync(STATE, { recursive: true, force: true }) } catch {} })
