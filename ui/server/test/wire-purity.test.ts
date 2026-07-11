// THE LINKAGE GUARD — the shared wire surface (ui/web components/wire/* + lib/wire.ts) must stay
// swarm-agnostic (CLAUDE.md §26): everything it needs derives from the manifest's self-declared
// `wire:` block, so NO swarm id may be hardcoded in its code. This test reads every wire source
// file, strips comments (line, block, and JSX — prose may NAME the swarms), and fails on any
// quoted swarm-id literal ('screener' | 'commodity' | 'research') left in actual code. It also
// fails LOUDLY if the wire tree moves or empties — a guard that silently passes over nothing
// guards nothing. Run: npx tsx test/wire-purity.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

let passed = 0
function check(name: string, fn: () => void) {
  try { fn(); passed++; console.log(`  ok  ${name}`) }
  catch (e: any) { console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`); process.exitCode = 1 }
}

// ui/web resolved relative to THIS file (ui/server/test → ../../web), so the guard follows the tree
const here = path.dirname(fileURLToPath(import.meta.url))
const webRoot = path.resolve(here, '..', '..', 'web')
const wireDir = path.join(webRoot, 'src', 'components', 'wire')
const wireLib = path.join(webRoot, 'src', 'lib', 'wire.ts')

function walk(dir: string): string[] {
  const out: string[] = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...walk(p))
    else if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) out.push(p)
  }
  return out
}

/** Drop block comments (covers JSX {/* … *​/} bodies too) and line comments — but never the `//`
 *  inside a URL like 'https://…' (a `//` directly preceded by `:` is not a comment). Comments may
 *  freely name the swarms; only CODE is held to the purity bar. */
function stripComments(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(^|[^:])\/\/.*$/gm, '$1')
}

// a swarm id as an EXACT quoted literal ('screener' / "commodity" / `research`) — a path segment like
// '../screener/EventRail' or prose inside a longer string does not match, an id comparison does
const SWARM_ID_LITERAL = /['"`](screener|commodity|research)['"`]/

check('the wire component tree exists and is non-empty (the guard must never pass over nothing)', () => {
  assert.ok(fs.existsSync(wireDir), `wire component dir missing: ${wireDir} — if the tree moved, move this guard with it`)
  const files = walk(wireDir)
  assert.ok(files.length > 0, `no source files under ${wireDir} — an empty guard target means the guard is stale`)
})

check('ui/web/src/lib/wire.ts exists (the wire config layer the guard covers)', () => {
  assert.ok(fs.existsSync(wireLib), `missing: ${wireLib} — if the lib moved, move this guard with it`)
})

check('no swarm-id string literal in wire CODE (comments may name them; code must read the manifest)', () => {
  const files = [...walk(wireDir), wireLib]
  const offenders: string[] = []
  for (const f of files) {
    const stripped = stripComments(fs.readFileSync(f, 'utf8'))
    stripped.split('\n').forEach((ln, i) => {
      const m = SWARM_ID_LITERAL.exec(ln)
      if (m) offenders.push(`${path.relative(webRoot, f)}:${i + 1} → quoted swarm id '${m[1]}' in code: ${ln.trim().slice(0, 120)}`)
    })
  }
  assert.equal(
    offenders.length,
    0,
    `the shared wire surface must stay swarm-agnostic (§26 — derive from the manifest wire block, never a hardcoded id):\n      ${offenders.join('\n      ')}`,
  )
})

// self-test: the stripper + matcher actually catch what they claim to (so a refactor of this guard
// can't silently neuter it) and ignore what they must ignore
check('guard self-test: catches quoted ids, ignores comments / path segments / longer strings', () => {
  const hit = (s: string) => SWARM_ID_LITERAL.test(stripComments(s))
  assert.equal(hit(`const id = 'screener'`), true)
  assert.equal(hit(`if (swarm === "commodity") {}`), true)
  assert.equal(hit('const x = `research`'), true)
  assert.equal(hit(`// the screener's default 'commodity' behavior`), false, 'line comments are exempt')
  assert.equal(hit(`/* falls back to 'research' */`), false, 'block comments are exempt')
  assert.equal(hit(`{/* the 'screener' rail */}`), false, 'JSX comments are exempt')
  assert.equal(hit(`import { EventRail } from '../screener/EventRail'`), false, 'a path segment is not an id literal')
  assert.equal(hit(`const t = 'run the research pipeline'`), false, 'a word inside a longer string is not an id literal')
  assert.equal(hit(`const u = 'https://x.test/a' // see 'commodity'`), false, 'a URL does not eat the line, and the comment stays exempt')
})

console.log(`\nwire-purity.test.ts: ${passed} passed`)
