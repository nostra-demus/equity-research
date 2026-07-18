// Chat stream-json classifier: the pure layer that turns the claude CLI's stream-json lines into the
// semantic events behind the Ask panel's live working state (chat-status / chat-thinking / chat-token).
// Every UI stage must map 1:1 to a REAL CLI event — this test pins that mapping so a CLI output change
// or a refactor can't silently blind the panel (or, worse, mis-attribute reasoning text to the answer).
// Run: npx tsx test/chat-stream-events.test.ts
import assert from 'node:assert/strict'
import { classifyChatLine } from '../src/chat-llm'

let passed = 0
function check(name: string, fn: () => void) {
  try {
    fn()
    passed++
    console.log(`  ok  ${name}`)
  } catch (e: any) {
    console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`)
    process.exitCode = 1
  }
}

const streamEvent = (event: any) => ({ type: 'stream_event', event })

// ---- lifecycle ----
check('system init -> ready with the resolved model id', () => {
  assert.deepEqual(classifyChatLine({ type: 'system', subtype: 'init', model: 'claude-sonnet-4-5', tools: [] }), [{ kind: 'ready', model: 'claude-sonnet-4-5' }])
})
check('system init without a model string -> ready with model undefined', () => {
  assert.deepEqual(classifyChatLine({ type: 'system', subtype: 'init' }), [{ kind: 'ready', model: undefined }])
})
check('non-init system lines are silent', () => {
  assert.deepEqual(classifyChatLine({ type: 'system', subtype: 'compact_boundary' }), [])
})

// ---- thinking stream ----
check('thinking block start -> thinking-start', () => {
  assert.deepEqual(classifyChatLine(streamEvent({ type: 'content_block_start', index: 0, content_block: { type: 'thinking', thinking: '' } })), [{ kind: 'thinking-start' }])
})
check('redacted thinking block start -> thinking-start (stage is real even when text is withheld)', () => {
  assert.deepEqual(classifyChatLine(streamEvent({ type: 'content_block_start', index: 0, content_block: { type: 'redacted_thinking' } })), [{ kind: 'thinking-start' }])
})
check('thinking_delta -> thinking text, verbatim', () => {
  assert.deepEqual(classifyChatLine(streamEvent({ type: 'content_block_delta', index: 0, delta: { type: 'thinking_delta', thinking: 'The FY24 note says…' } })), [{ kind: 'thinking', text: 'The FY24 note says…' }])
})
check('signature_delta (thinking integrity blob) is silent — never shown as reasoning', () => {
  assert.deepEqual(classifyChatLine(streamEvent({ type: 'content_block_delta', index: 0, delta: { type: 'signature_delta', signature: 'abc123' } })), [])
})

// ---- answer stream ----
check('text block start -> answer-start', () => {
  assert.deepEqual(classifyChatLine(streamEvent({ type: 'content_block_start', index: 1, content_block: { type: 'text', text: '' } })), [{ kind: 'answer-start' }])
})
check('text_delta -> token', () => {
  assert.deepEqual(classifyChatLine(streamEvent({ type: 'content_block_delta', index: 1, delta: { type: 'text_delta', text: 'Net debt fell' } })), [{ kind: 'token', text: 'Net debt fell' }])
})
check('message_start / content_block_stop / message_delta are silent', () => {
  for (const ev of [{ type: 'message_start' }, { type: 'content_block_stop', index: 0 }, { type: 'message_delta', delta: {} }]) {
    assert.deepEqual(classifyChatLine(streamEvent(ev)), [])
  }
})

// ---- assembled-assistant fallback ----
check('final assistant message -> fallback-text per text block; thinking blocks never replayed', () => {
  const line = {
    type: 'assistant',
    message: { content: [{ type: 'thinking', thinking: 'reasoning…' }, { type: 'text', text: 'Part one. ' }, { type: 'text', text: 'Part two.' }] },
  }
  assert.deepEqual(classifyChatLine(line), [
    { kind: 'fallback-text', text: 'Part one. ' },
    { kind: 'fallback-text', text: 'Part two.' },
  ])
})
check('synthetic assistant error message is silent (the result event carries the real error)', () => {
  assert.deepEqual(classifyChatLine({ type: 'assistant', error: true, message: { content: [{ type: 'text', text: 'auth failed' }] } }), [])
})

// ---- result ----
check('clean result -> cost, no error', () => {
  assert.deepEqual(classifyChatLine({ type: 'result', subtype: 'success', total_cost_usd: 0.042, result: 'done' }), [{ kind: 'result', costUsd: 0.042, error: undefined }])
})
check('missing cost defaults to 0', () => {
  const [r] = classifyChatLine({ type: 'result', subtype: 'success' })
  assert.equal(r.kind, 'result')
  if (r.kind === 'result') assert.equal(r.costUsd, 0)
})
check('auth-failed result -> friendly sign-in message', () => {
  const [r] = classifyChatLine({ type: 'result', is_error: true, api_error_status: 401, result: 'authentication error' })
  if (r.kind !== 'result') throw new Error('expected result event')
  assert.match(r.error!, /signed in/)
})
check('max-turns result -> friendly cut-off message', () => {
  const [r] = classifyChatLine({ type: 'result', is_error: true, subtype: 'error_max_turns', result: '' })
  if (r.kind !== 'result') throw new Error('expected result event')
  assert.match(r.error!, /cut off/)
})

// ---- junk safety ----
check('junk and unknown lines are silent', () => {
  for (const junk of [null, undefined, 42, 'str', {}, { type: 'user' }, { type: 'stream_event' }, { type: 'stream_event', event: { type: 'content_block_start' } }]) {
    assert.deepEqual(classifyChatLine(junk), [])
  }
})

console.log(`\nchat-stream-events: ${passed} checks passed${process.exitCode ? ' — WITH FAILURES' : ''}`)
