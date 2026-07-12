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

// ---- P1: the untrusted-agent child env is a minimal allowlist (no provider-secret exfil) ----
const { buildChildEnv, isValidPrUrl } = await import('../src/feedback-dispatch')
const base = {
  PATH: '/usr/bin', HOME: '/home/x', LC_ALL: 'C', ANTHROPIC_API_KEY: 'sk-ant', CLAUDE_CODE_OAUTH_TOKEN: 'oauth',
  GROQ_API_KEY: 'gsk-secret', GEMINI_API_KEY: 'g-secret', OPENAI_API_KEY: 'sk-oai',
  GH_APP_PRIVATE_KEY: 'app-key', GH_APP_ID: '123', SOME_RANDOM_SECRET: 'nope',
}
const ce = buildChildEnv(base as any, 'ghp_pat')
check('child env keeps runtime PATH/HOME', ce.PATH === '/usr/bin' && ce.HOME === '/home/x')
check('child env keeps Anthropic/Claude auth (agent must run)', ce.ANTHROPIC_API_KEY === 'sk-ant' && ce.CLAUDE_CODE_OAUTH_TOKEN === 'oauth')
check('child env keeps LC_ prefix (locale)', ce.LC_ALL === 'C')
check('child env DROPS provider secrets (Groq/Gemini/OpenAI)', ce.GROQ_API_KEY === undefined && ce.GEMINI_API_KEY === undefined && ce.OPENAI_API_KEY === undefined)
check('child env DROPS the §28 data-App identity', ce.GH_APP_PRIVATE_KEY === undefined && ce.GH_APP_ID === undefined)
check('child env DROPS unrelated/unknown vars by default', ce.SOME_RANDOM_SECRET === undefined)
check('child env injects ONLY the PR token as GH creds', ce.GH_TOKEN === 'ghp_pat' && ce.GITHUB_TOKEN === 'ghp_pat')
const ce2 = buildChildEnv({ ...base, ENGINE_FEEDBACK_ENV_PASSTHROUGH: 'SOME_RANDOM_SECRET' } as any, 'ghp_pat')
check('operator passthrough opt-in adds a named var (no code change)', ce2.SOME_RANDOM_SECRET === 'nope')
check('no token → no GH creds injected', buildChildEnv(base as any, undefined).GH_TOKEN === undefined)

// ---- P2: only a real PR on THIS repo is a valid pr_url (no javascript:/lookalike/other-repo links) ----
check('valid canonical PR url accepted', isValidPrUrl('https://github.com/nostra-demus/equity-research/pull/123'))
check('javascript: url rejected', !isValidPrUrl('javascript:alert(document.cookie)'))
check('lookalike host rejected', !isValidPrUrl('https://github.com.evil.com/nostra-demus/equity-research/pull/1'))
check('other-repo PR url rejected', !isValidPrUrl('https://github.com/evil/repo/pull/1'))
check('issues (not pull) url rejected', !isValidPrUrl('https://github.com/nostra-demus/equity-research/issues/1'))
check('trailing-path url rejected', !isValidPrUrl('https://github.com/nostra-demus/equity-research/pull/1/files'))
check('non-string rejected', !isValidPrUrl(null) && !isValidPrUrl(undefined) && !isValidPrUrl(42))

console.log(`\n${passed} checks passed${process.exitCode ? ' (with failures)' : ''}`)
