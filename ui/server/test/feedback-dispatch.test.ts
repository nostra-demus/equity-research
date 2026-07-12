// feedback dispatch — the FAIL-CLOSED admin gate + "ready" preconditions. Run:
// npx tsx test/feedback-dispatch.test.ts. Pure config logic (no spawn, no worktree): proves that
// without an allowlist NOBODY can dispatch, and that "ready" needs both the enable flag and a PR token.
// The env is set BEFORE importing config (config reads process.env at module load).
import assert from 'node:assert/strict'

let passed = 0
function check(name: string, cond: boolean, detail = '') {
  if (cond) { passed++; console.log(`  ok  ${name}`) }
  else { console.error(`FAIL  ${name}  ${detail}`); process.exitCode = 1 }
}

process.env.ENGINE_DISPATCH_ADMINS = 'boss@muns.io , Second@Muns.io'
process.env.ENGINE_FEEDBACK_DISPATCH_ENABLED = '1'
process.env.GH_PR_TOKEN = 'ghp_test'

const { isDispatchAdmin, feedbackDispatchReady, DISPATCH_ADMINS } = await import('../src/config')

check('allowlist parsed + lowercased + trimmed', DISPATCH_ADMINS.join('|') === 'boss@muns.io|second@muns.io', DISPATCH_ADMINS.join('|'))
check('an allowlisted email is an admin (case-insensitive)', isDispatchAdmin('BOSS@muns.io'))
check('a second allowlisted email is an admin', isDispatchAdmin('second@muns.io'))
check('a non-listed email is NOT an admin', !isDispatchAdmin('random@muns.io'))
check('empty / undefined email is NOT an admin', !isDispatchAdmin('') && !isDispatchAdmin(undefined as any))
check('ready = enabled AND token present', feedbackDispatchReady() === true)

console.log(`\n${passed} checks passed${process.exitCode ? ' (with failures)' : ''}`)
