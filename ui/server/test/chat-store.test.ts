// Chat-history store: conversations persist to STATE_DIR/chats/ (one atomic JSON per conversation) so the
// Ask panel's history survives restarts and can be reopened. Covers create-on-first-turn, append, the
// server-authoritative identity, listing + filters, get/delete, id validation, and path-traversal safety.
// Run: npx tsx test/chat-store.test.ts
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

// STATE_DIR is read at config import time, so point it at a temp dir BEFORE importing the module.
const STATE = fs.mkdtempSync(path.join(os.tmpdir(), 'chatstore-'))
process.env.ENGINE_STATE_DIR = STATE
const store = await import('../src/chat-store')
const {
  recordUserMessage, recordAssistantMessage, getConversation, deleteConversation,
  listConversations, isValidConversationId,
} = store
const CHATS_DIR = path.join(STATE, 'chats')

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

const meta = (over: Partial<Parameters<typeof recordUserMessage>[0]> = {}) => ({
  user: 'alice@example.com', userVia: 'cf-access' as const,
  swarm: 'research', subject: 'EMAR', scope: 'run' as const,
  title: 'Ask · EMAR — whole run', model: 'sonnet', style: 'simple',
  ...over,
})

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
  assert.ok(fs.existsSync(path.join(CHATS_DIR, `${c.id}.json`)))
  assert.equal(deleteConversation(c.id), true)
  assert.equal(getConversation(c.id), null)
  assert.equal(deleteConversation(c.id), false) // already gone
  assert.equal(deleteConversation('../../etc/passwd'), false) // never touches an outside path
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
