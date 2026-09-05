// The mobile chat turn reducer — the desktop sendChatMessage semantics as a pure state machine.
// What must hold (each mirrors a hard-won desktop behavior): optimistic append with baseline capture;
// error/stop roll back to the EXACT committed transcript while keeping the question + turn id so retry
// is idempotent; recovery REPLACES the partial answer (never duplicates); unknown stages are ignored
// (deploy skew §5); the wire transcript is windowed to 40. Run: npx tsx src/mobile/chat/chatTurn.test.ts
import assert from 'node:assert/strict'
import { CHAT_MAX_SEND, initialTurnState, newChatTurnId, turnReduce, windowMessages, type TurnState } from './chatTurn'
import type { ChatMessage } from '../../lib/types'

let passed = 0
function check(name: string, fn: () => void) {
  try { fn(); passed++; console.log(`  ok  ${name}`) }
  catch (e: any) { console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`); process.exitCode = 1 }
}

const send = (s: TurnState, text: string, turnId = 'turn_a') => turnReduce(s, { type: 'send', text, turnId, now: 1000 })

check('send appends the user turn + an empty assistant turn and snapshots the baseline', () => {
  const s = send(initialTurnState, ' what is the bull case? ')
  assert.equal(s.messages.length, 2)
  assert.equal(s.messages[0].content, 'what is the bull case?') // trimmed
  assert.equal(s.messages[1].role, 'assistant')
  assert.equal(s.messages[1].content, '')
  assert.equal(s.messages[0].turnId, 'turn_a')
  assert.equal(s.streaming, true)
  assert.equal(s.work?.stage, 'sending')
  assert.deepEqual(s.baseline?.messages, [])
  assert.equal(s.pendingIdx, 1)
})

check('a send during streaming, or of blank text, is a no-op', () => {
  const s = send(initialTurnState, 'q')
  assert.equal(send(s, 'another'), s)
  assert.equal(send(initialTurnState, '   '), initialTurnState)
})

check('tokens grow the assistant turn; the first token flips the stage to writing (deploy skew)', () => {
  let s = send(initialTurnState, 'q')
  s = turnReduce(s, { type: 'token', token: 'The bull ', now: 1100 })
  s = turnReduce(s, { type: 'token', token: 'case is…', now: 1101 })
  assert.equal(s.messages[1].content, 'The bull case is…')
  assert.equal(s.work?.stage, 'writing')
  assert.equal(s.work?.startedAt, 1000) // the stopwatch keeps the turn's own start
})

check('an unknown stage is ignored; known stages advance and keep the model id', () => {
  let s = send(initialTurnState, 'q')
  const before = s.work
  s = turnReduce(s, { type: 'status', stage: 'quantum-superposition', now: 1200 })
  assert.equal(s.work, before)
  s = turnReduce(s, { type: 'status', stage: 'sources', now: 1250 })
  assert.equal(s.work?.stage, 'sources')
  s = turnReduce(s, { type: 'status', stage: 'thinking', model: 'opus', now: 1300 })
  assert.equal(s.work?.stage, 'thinking')
  assert.equal(s.work?.model, 'opus')
  s = turnReduce(s, { type: 'status', stage: 'writing', now: 1400 })
  assert.equal(s.work?.model, 'opus') // model survives later stages that omit it
})

check('meta records the source + server-minted conversation id and advances to context', () => {
  let s = send(initialTurnState, 'q')
  s = turnReduce(s, { type: 'meta', sourcePath: 'analyses/AMZN_2026-07-10/final_thesis.md', conversationId: 'c1', now: 1050 })
  assert.equal(s.source, 'analyses/AMZN_2026-07-10/final_thesis.md')
  assert.equal(s.conversationId, 'c1')
  assert.equal(s.work?.stage, 'context')
})

check('thinking and computed attach to the in-flight assistant turn', () => {
  let s = send(initialTurnState, 'q')
  s = turnReduce(s, { type: 'thinking', token: 'Reading the run…' })
  s = turnReduce(s, { type: 'computed', card: { kind: 'scenario' } as any })
  s = turnReduce(s, { type: 'computed', card: { kind: 'unsupported' } as any })
  assert.equal(s.messages[1].thinking, 'Reading the run…')
  assert.equal(s.messages[1].computed?.length, 2) // appended, one card per variable
})

check('ERROR rolls back to the exact committed transcript and keeps the question + turn id for retry', () => {
  const committed: ChatMessage[] = [
    { role: 'user', content: 'earlier q', turnId: 'turn_0' },
    { role: 'assistant', content: 'earlier a', turnId: 'turn_0' },
  ]
  let s: TurnState = { ...initialTurnState, messages: committed, conversationId: 'c9', source: 'src' }
  s = send(s, 'new question', 'turn_b')
  s = turnReduce(s, { type: 'token', token: 'half an ans', now: 1100 })
  s = turnReduce(s, { type: 'error', message: 'chat is busy — try again in a moment' })
  assert.deepEqual(s.messages, committed)          // the half answer never became part of the thread
  assert.equal(s.conversationId, 'c9')
  assert.equal(s.source, 'src')
  assert.equal(s.error, 'chat is busy — try again in a moment')
  assert.equal(s.retryText, 'new question')
  assert.equal(s.retryTurnId, 'turn_b')
  // retry reuses the SAME id — that is what makes it idempotent server-side
  const retried = send(s, s.retryText!, s.retryTurnId!)
  assert.equal(retried.messages[2].turnId, 'turn_b')
})

check('STOP is the quiet twin of error: same rollback, retry ready, no error banner', () => {
  let s = send(initialTurnState, 'q', 'turn_c')
  s = turnReduce(s, { type: 'token', token: 'partial', now: 1100 })
  s = turnReduce(s, { type: 'stop' })
  assert.deepEqual(s.messages, [])
  assert.equal(s.error, undefined)
  assert.equal(s.retryText, 'q')
  assert.equal(s.retryTurnId, 'turn_c')
  assert.equal(s.streaming, false)
})

check('RECOVERED replaces the partial answer with the canonical one — never appends a duplicate', () => {
  let s = send(initialTurnState, 'q')
  s = turnReduce(s, { type: 'token', token: 'partial tex', now: 1100 })
  s = turnReduce(s, { type: 'recovered', turn: { conversationId: 'c2', turnId: 'turn_a', question: 'q', answer: 'the full saved answer', thinking: 'saved thinking', computed: [{ kind: 'scenario' } as any], sourcePath: 'sp' } as any })
  assert.equal(s.messages.length, 2)
  assert.equal(s.messages[1].content, 'the full saved answer')
  assert.equal(s.messages[1].thinking, 'saved thinking')
  assert.equal(s.messages[1].computed?.length, 1)
  assert.equal(s.conversationId, 'c2')
})

check('done commits: streaming off, retry cleared, transcript kept', () => {
  let s = send(initialTurnState, 'q')
  s = turnReduce(s, { type: 'token', token: 'full answer', now: 1100 })
  s = turnReduce(s, { type: 'done' })
  assert.equal(s.streaming, false)
  assert.equal(s.messages[1].content, 'full answer')
  assert.equal(s.retryTurnId, undefined)
  assert.equal(s.baseline, undefined)
})

check('the wire transcript is windowed to the last 40 turns (the server rejects more)', () => {
  const long: ChatMessage[] = Array.from({ length: 60 }, (_, i) => ({ role: i % 2 ? 'assistant' : 'user', content: `m${i}` }) as ChatMessage)
  const w = windowMessages(long, 'newest q', 'turn_z')
  assert.ok(w.length <= CHAT_MAX_SEND)
  assert.equal(w[w.length - 1].content, 'newest q')
  assert.equal(w[0].role, 'user') // never an orphaned leading assistant answer — whole pairs only
  assert.equal(w[0].content, 'm22') // oldest PAIRS dropped, not just the oldest message
})

check('hydrate installs a saved conversation with its computed cards; reset clears it', () => {
  const saved: ChatMessage[] = [{ role: 'user', content: 'q' }, { role: 'assistant', content: 'a', computed: [{ kind: 'scenario' } as any] }]
  let s = turnReduce(initialTurnState, { type: 'hydrate', messages: saved, conversationId: 'c3', source: 'sp' })
  assert.equal(s.messages[1].computed?.length, 1)
  assert.equal(s.conversationId, 'c3')
  s = turnReduce(s, { type: 'reset' })
  assert.deepEqual(s.messages, [])
  assert.equal(s.conversationId, undefined)
})

check('turn ids are unique and turn_-prefixed', () => {
  const a = newChatTurnId(); const b = newChatTurnId()
  assert.ok(a.startsWith('turn_') && b.startsWith('turn_') && a !== b)
})

const EXPECTED_CHECKS = 12
assert.ok(passed >= EXPECTED_CHECKS, `only ${passed} checks ran, expected at least ${EXPECTED_CHECKS} — something above is short-circuiting`)
console.log(`\nchatTurn.test.ts: ${passed} checks passed`)
