// The two-shell fallback rule: /m-prefixed non-asset paths get the phone shell, everything else the
// desktop one. The dangerous failure is silent — /moo serving the mobile bundle, or /m/history serving
// the desktop one, is no error anywhere, just the wrong app. Run: npx tsx test/static-shell.test.ts
import assert from 'node:assert/strict'
import { shellForUrl } from '../src/static-shell'

let passed = 0
function check(name: string, fn: () => void) {
  try { fn(); passed++; console.log(`  ok  ${name}`) }
  catch (e: any) { console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`); process.exitCode = 1 }
}

check('every spelling of the mobile prefix routes to the phone shell', () => {
  for (const u of ['/m', '/m/', '/m/history', '/m/anything/deep', '/m?x=1', '/m#frag', '/m/?utm=1']) {
    assert.equal(shellForUrl(u), 'mobile', u)
  }
})

check('paths that merely START with m stay on the desktop shell', () => {
  for (const u of ['/', '/moo', '/mx', '/mobile', '/market', '/m2', '/am', '/screener/m']) {
    assert.equal(shellForUrl(u), 'desktop', u)
  }
})

const EXPECTED_CHECKS = 2
assert.ok(passed >= EXPECTED_CHECKS, `only ${passed} checks ran, expected at least ${EXPECTED_CHECKS}`)
console.log(`\nstatic-shell.test.ts: ${passed} checks passed`)
