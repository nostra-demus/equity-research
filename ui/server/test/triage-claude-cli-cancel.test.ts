// Integration regression for the real Claude CLI runner. Run in its own process so CLAUDE_BIN can point
// at a harmless fake before config.ts is imported. The fake answers --help, then stays alive like a stuck
// completion; aborting the parent cycle must terminate it promptly instead of waiting for the CLI timeout.
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-cli-cancel-'))
const fake = path.join(tmp, 'fake-claude.mjs')
const childStarted = path.join(tmp, 'child-started')
fs.writeFileSync(fake, `#!/usr/bin/env node
import fs from 'node:fs'
if (process.argv.includes('--help')) {
  console.log('--print --output-format --verbose --system-prompt --tools --model --max-turns --max-budget-usd --permission-mode')
  process.exit(0)
}
fs.writeFileSync(${JSON.stringify(childStarted)}, 'started')
process.stdin.resume()
setInterval(() => {}, 1000)
`)
fs.chmodSync(fake, 0o755)
process.env.CLAUDE_BIN = fake

try {
  const { defaultClaudeCliRunner } = await import('../src/news/triage/claude-cli')
  const parent = new AbortController()
  const started = Date.now()
  const pending = defaultClaudeCliRunner('system', 'user', {
    model: 'haiku', timeoutMs: 10_000, signal: parent.signal,
  })
  const childDeadline = Date.now() + 1_000
  while (!fs.existsSync(childStarted) && Date.now() < childDeadline) {
    await new Promise((resolve) => setTimeout(resolve, 5))
  }
  assert.ok(fs.existsSync(childStarted), 'fake CLI reached its dispatched/in-flight state')
  parent.abort()
  const result = await Promise.race([
    pending,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error('CLI did not settle after parent abort')), 1_000)),
  ])
  const elapsed = Date.now() - started
  assert.match(result.error || '', /cycle aborted/i)
  assert.equal(result.costUsdKnown, false, 'a killed child with no result event has unknown actual cost')
  assert.equal(result.requestDispatched, true)
  assert.ok(elapsed < 1_000, `parent abort must settle promptly (elapsed ${elapsed}ms)`)
  console.log('  ok  in-flight Claude CLI exits promptly when the parent cycle is aborted')
} catch (error: any) {
  console.error(`FAIL  in-flight Claude CLI cancellation\n      ${error?.stack || error}`)
  process.exitCode = 1
} finally {
  fs.rmSync(tmp, { recursive: true, force: true })
}
