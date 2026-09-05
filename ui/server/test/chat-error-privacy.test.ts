// Ask outcomes go directly to research/news SSE clients. Unknown provider diagnostics stay private.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import fsPromises from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nostra-chat-error-'))
const executable = path.join(root, 'fake-claude.cjs')
const diagnostic = 'PRIVATE_DIAGNOSTIC_SENTINEL token=fixture-secret /private/account/config https://example.invalid/?key=fixture-secret'
process.env.CLAUDE_BIN = executable
process.env.NOSTRA_ENGINE_CONFIG_DIR = root
process.env.ENGINE_STATE_DIR = path.join(root, 'state')
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
fs.writeFileSync(executable, `#!${process.execPath}
const fs = require('node:fs');
if (process.argv.includes('--help')) {
  process.stdout.write('--model --tools --system-prompt --include-partial-messages');
} else {
  const mode = fs.readFileSync(0, 'utf8');
  const diagnostic = ${JSON.stringify(diagnostic)};
  if (mode === 'result') {
    process.stdout.write(JSON.stringify({type: 'result', is_error: true, result: diagnostic}) + '\\n');
  } else if (mode === 'timeout') {
    setInterval(() => {}, 1000);
  } else {
    process.stderr.write((mode === 'auth' ? 'authentication failed ' : mode === 'quota' ? 'usage limit ' : '') + diagnostic);
    process.exitCode = 1;
  }
}
`, { mode: 0o755 })

try {
  const { classifyChatLine, classifyCodexChatLine, runChatTurn, chatTurnsInFlight } = await import('../src/chat-llm')
  const privateError = (error: string | undefined, expected: RegExp) => {
    assert.ok(error, 'a failed turn needs a public error')
    assert.match(error, expected)
    assert.doesNotMatch(error, /PRIVATE_DIAGNOSTIC_SENTINEL|fixture-secret|\/private\/account|example\.invalid/)
  }
  for (const [input, expected] of [
    [{ result: diagnostic }, /Claude could not answer/],
    [{ result: diagnostic, api_error_status: 401 }, /signed in/],
    [{ result: diagnostic, api_error_status: 429 }, /usage limit/],
    [{ result: diagnostic, subtype: 'error_max_turns' }, /cut off/],
  ] as const) {
    const [event] = classifyChatLine({ type: 'result', is_error: true, ...input })
    assert.equal(event.kind, 'result')
    if (event.kind === 'result') privateError(event.error, expected)
  }
  for (const [prefix, expected] of [
    ['', /Codex could not answer/],
    ['401 authentication failed ', /signed in/],
    ['429 quota exceeded ', /usage limit/],
    ['model is unavailable ', /model is not available/],
  ] as const) {
    const [event] = classifyCodexChatLine({ type: 'turn.failed', error: { message: prefix + diagnostic } })
    assert.equal(event.kind, 'result')
    if (event.kind === 'result') privateError(event.error, expected)
  }

  // Exercise real subprocess stderr and terminal JSON, not just the pure classifiers.
  for (const [mode, expected] of [
    ['stderr', /Claude could not answer/],
    ['result', /Claude could not answer/],
    ['auth', /signed in/],
    ['quota', /usage limit/],
    ['timeout', /took too long/],
  ] as const) {
    const outcome = await runChatTurn({
      system: 'closed book', user: mode, model: 'sonnet', signal: new AbortController().signal,
      timeoutMs: mode === 'timeout' ? 500 : 5_000,
      onToken: () => assert.fail('a failed fixture must not emit answer text'),
    })
    privateError(outcome.error, expected)
    assert.equal(chatTurnsInFlight(), 0, 'failure releases the concurrency slot')
  }

  // Workspace errors must also be safe, before Codex can read auth or start a model process.
  const originalMkdtemp = fsPromises.mkdtemp
  fsPromises.mkdtemp = (async () => { throw new Error(diagnostic) }) as typeof fsPromises.mkdtemp
  try {
    const outcome = await runChatTurn({
      system: 'closed book', user: 'must not spawn', model: 'codex:gpt-5.6-sol',
      signal: new AbortController().signal, onToken: () => assert.fail('workspace failure cannot emit tokens'),
    })
    privateError(outcome.error, /Codex could not answer/)
    assert.equal(chatTurnsInFlight(), 0)
  } finally {
    fsPromises.mkdtemp = originalMkdtemp
  }
  console.log('chat-error-privacy: structured errors, CLI stderr, timeout, and workspace failures expose only safe retry guidance')
} finally {
  fs.rmSync(root, { recursive: true, force: true })
}
