// connector-runner — the PURE helpers (no spawn): the as_of parser and the fetcher env allowlist. Run:
// npx tsx test/connector-runner.test.ts.
let passed = 0
function check(name: string, cond: boolean, detail = '') {
  if (cond) { passed++; console.log(`  ok  ${name}`) }
  else { console.error(`FAIL  ${name}  ${detail}`); process.exitCode = 1 }
}

const { parseAsOf, fetchEnv } = await import('../src/connector-runner')

// ---- parseAsOf: reads the data date the fetcher prints on success ----
check('parses as_of from the fetcher stdout', parseAsOf('wrote data/WHEAT/... (net -60,432) as_of 2026-07-07 + sidecar') === '2026-07-07')
check('parses as_of from a --verify line', parseAsOf('OK verify: host → 200, net short, as_of 2026-06-30') === '2026-06-30')
check('null when no as_of present', parseAsOf('some other output') === null)

// ---- fetchEnv: a fetcher gets the network + CONNECTOR_* keys, NEVER provider secrets or a PR token ----
const env = fetchEnv({
  PATH: '/usr/bin', HOME: '/home/x', LANG: 'C', HTTPS_PROXY: 'http://p', NODE_EXTRA_CA_CERTS: '/ca.pem',
  CONNECTOR_FOO_KEY: 'feed-key', LC_ALL: 'C',
  GROQ_API_KEY: 'secret', ANTHROPIC_API_KEY: 'sk', GH_PR_TOKEN: 'ghp', GH_APP_PRIVATE_KEY: 'app', SOME_SECRET: 'no',
} as any)
check('keeps PATH/HOME + proxy + CA (a fetch needs the network)', env.PATH === '/usr/bin' && env.HOME === '/home/x' && env.HTTPS_PROXY === 'http://p' && env.NODE_EXTRA_CA_CERTS === '/ca.pem')
check('keeps LANG/LC_ locale', env.LANG === 'C' && env.LC_ALL === 'C')
check('keeps CONNECTOR_* keys (for a keyed feed)', env.CONNECTOR_FOO_KEY === 'feed-key')
check('DROPS provider secrets', env.GROQ_API_KEY === undefined && env.ANTHROPIC_API_KEY === undefined)
check('DROPS the PR token + §28 data-App identity', env.GH_PR_TOKEN === undefined && env.GH_APP_PRIVATE_KEY === undefined)
check('DROPS unrelated secrets by default', env.SOME_SECRET === undefined)

console.log(`\n${passed} checks passed${process.exitCode ? ' (with failures)' : ''}`)
