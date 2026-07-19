// THE DATA-LIBRARY LINKAGE GUARD — the cross-swarm Data Library surface (ui/web
// components/datalibrary/*) and the server registry (src/pipelines.ts) must stay generic (§26):
// pipelines are discovered from .claude/connectors/*/connector.json manifests, so NO swarm id and NO
// connector id may be hardcoded in their code. Clone of wire-purity.test.ts: strips comments (prose may
// name them), fails on any quoted literal, and fails LOUDLY if a guarded tree is missing/empty or the
// connector registry is empty — a guard that silently passes over nothing guards nothing.
// Run: npx tsx test/datalibrary-purity.test.ts
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

const here = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(here, '..', '..', '..')
const dlDir = path.join(repoRoot, 'ui', 'web', 'src', 'components', 'datalibrary')
const pipelinesSrc = path.join(repoRoot, 'ui', 'server', 'src', 'pipelines.ts')
const connectorsDir = path.join(repoRoot, '.claude', 'connectors')

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
 *  inside a URL like 'https://…' (a `//` directly preceded by `:` is not a comment). */
function stripComments(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(^|[^:])\/\/.*$/gm, '$1')
}

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const SWARM_ID_LITERAL = /['"`](screener|commodity|research)['"`]/

// connector ids read from the registry at TEST time — the guard maintains itself as connectors land
const connectorIds = fs.existsSync(connectorsDir)
  ? fs.readdirSync(connectorsDir, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name)
  : []
const CONNECTOR_ID_LITERAL = connectorIds.length
  ? new RegExp(`['"\`](${connectorIds.map(esc).join('|')})['"\`]`)
  : null

check('the datalibrary component tree exists and is non-empty (the guard must never pass over nothing)', () => {
  assert.ok(fs.existsSync(dlDir), `datalibrary dir missing: ${dlDir} — if the tree moved, move this guard with it`)
  assert.ok(walk(dlDir).length > 0, `no source files under ${dlDir} — an empty guard target means the guard is stale`)
})

check('src/pipelines.ts exists (the server registry the guard covers)', () => {
  assert.ok(fs.existsSync(pipelinesSrc), `missing: ${pipelinesSrc} — if the module moved, move this guard with it`)
})

check('the connector registry is non-empty (the id matcher must have real ids to guard against)', () => {
  assert.ok(connectorIds.length > 0, `.claude/connectors/ is missing or empty — the self-maintaining matcher has nothing to match`)
})

check('no swarm-id and no connector-id string literal in Data Library / registry CODE', () => {
  const files = [...(fs.existsSync(dlDir) ? walk(dlDir) : []), pipelinesSrc].filter((f) => fs.existsSync(f))
  const offenders: string[] = []
  for (const f of files) {
    const stripped = stripComments(fs.readFileSync(f, 'utf8'))
    stripped.split('\n').forEach((ln, i) => {
      const s = SWARM_ID_LITERAL.exec(ln)
      if (s) offenders.push(`${path.relative(repoRoot, f)}:${i + 1} → quoted swarm id '${s[1]}': ${ln.trim().slice(0, 120)}`)
      const c = CONNECTOR_ID_LITERAL?.exec(ln)
      if (c) offenders.push(`${path.relative(repoRoot, f)}:${i + 1} → quoted connector id '${c[1]}': ${ln.trim().slice(0, 120)}`)
    })
  }
  assert.equal(offenders.length, 0,
    `the Data Library must stay generic (§26 — manifests declare, the engine interprets):\n      ${offenders.join('\n      ')}`)
})

check('guard self-test: catches quoted swarm + connector ids, ignores comments / paths / longer strings', () => {
  const swarmHit = (s: string) => SWARM_ID_LITERAL.test(stripComments(s))
  assert.equal(swarmHit(`const id = 'screener'`), true)
  assert.equal(swarmHit(`// falls back to 'commodity'`), false, 'line comments are exempt')
  assert.equal(swarmHit(`const t = 'run the research pipeline'`), false, 'a word inside a longer string is not an id literal')
  assert.ok(CONNECTOR_ID_LITERAL, 'connector matcher must exist')
  const connHit = (s: string) => CONNECTOR_ID_LITERAL!.test(stripComments(s))
  const sample = connectorIds[0]
  assert.equal(connHit(`const c = '${sample}'`), true)
  assert.equal(connHit(`// prose naming ${sample}`), false, 'comments are exempt')
  assert.equal(connHit(`const p = 'x/${sample}/y'`), false, 'a path segment is not an id literal')
})

console.log(`\ndatalibrary-purity.test.ts: ${passed} passed`)
