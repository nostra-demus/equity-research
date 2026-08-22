// SwarmManifest.wire (swarms.ts parseWire) — the self-declared news-wire capability block (§26).
// Off the REAL repo manifests: the commodity swarm declares the full five-field wire; screener and
// research declare none, so their `wire` is undefined (the client's fail-closed gate — a wire must be
// POSITIVELY declared, never defaulted). parseWire edge cases (empty block, blank strings, partial
// block) run in a SUBPROCESS against a tmpdir AGENTS_DIR, because REPO_ROOT/AGENTS_DIR freeze from
// ENGINE_REPO_ROOT at config import and cannot be re-pointed in-process (parseManifest is not
// exported, so listSwarms is the only door — same constraint commodity.test.ts lives with).
// Run: npx tsx test/wire-manifest.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { listSwarms } from '../src/swarms'

let passed = 0
function check(name: string, fn: () => void) {
  try { fn(); passed++; console.log(`  ok  ${name}`) }
  catch (e: any) { console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`); process.exitCode = 1 }
}

const here = path.dirname(fileURLToPath(import.meta.url))
const tmpdirs: string[] = []
const tmp = (prefix: string) => { const d = fs.mkdtempSync(path.join(os.tmpdir(), prefix)); tmpdirs.push(d); return d }

// ---- the REAL repo manifests ----
const swarms = listSwarms(true) // force: never trust another test's (or module-load-time) cache

check("the commodity swarm declares the full wire block, parsed snake_case → camelCase", () => {
  const c = swarms.find((s) => s.id === 'commodity')
  assert.ok(c, 'commodity SWARM.md not discovered')
  assert.deepEqual(c!.wire, {
    eventScope: 'commodity',
    groupBy: 'subject',
    subjectField: 'commodity',
    pulse: 'frameworks/commodity/pulse_sources.json',
    defaultView: 'latest',
  })
})

check('screener declares NO wire → wire is undefined (fail-closed, key omitted from /api/swarms)', () => {
  const s = swarms.find((x) => x.id === 'screener')
  assert.ok(s, 'screener SWARM.md not discovered')
  assert.equal(s!.wire, undefined)
  assert.ok(!('wire' in JSON.parse(JSON.stringify(s))), 'wire must serialize as ABSENT, not null — deploy-skew clients gate on the key')
})

check('research (the grandfathered synthetic default) has no wire and still lists first', () => {
  assert.equal(swarms[0].id, 'research')
  assert.equal(swarms[0].wire, undefined)
  assert.deepEqual(swarms[0].decisionArtifacts, ['decision_record.json'])
})

// ---- parseWire edge cases via a tmpdir AGENTS_DIR in a subprocess ----
function writeSwarm(agentsDir: string, id: string, wireYaml: string) {
  const dir = path.join(agentsDir, id)
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(
    path.join(dir, 'SWARM.md'),
    `---\nid: ${id}\nrun_root_template: ${id}/runs/{X}\nplaceholder: X\n${wireYaml}---\n\n${id} manifest body\n`,
  )
}

check('parseWire: empty block → undefined; blank strings → undefined; partial block → just that key', () => {
  const repo = tmp('wiremanifest-')
  const agents = path.join(repo, '.claude', 'agents')
  writeSwarm(agents, 'wireempty', 'wire:\n') // a bare `wire:` key (YAML null)
  writeSwarm(agents, 'wireblank', 'wire:\n  event_scope: ""\n  group_by: "   "\n') // set but content-free
  writeSwarm(agents, 'wirepartial', 'wire:\n  event_scope: commodity\n') // only event_scope
  writeSwarm(agents, 'wirenone', '') // no wire key at all
  writeSwarm(agents, 'decisionvalid', 'decision_artifacts:\n  - terminal/decision.json\n')
  writeSwarm(agents, 'decisionunsafe', 'decision_artifacts:\n  - ../outside.json\n')
  writeSwarm(agents, 'decisionwrongtype', 'decision_artifacts: terminal.json\n')
  const unsafeDir = path.join(agents, 'wireunsafe')
  fs.mkdirSync(unsafeDir, { recursive: true })
  fs.writeFileSync(path.join(unsafeDir, 'SWARM.md'), [
    '---', 'id: wireunsafe', 'run_root_template: ../outside/{X}', 'placeholder: X',
    'runs_root: ../outside', '---', '', 'unsafe manifest', '',
  ].join('\n'))

  // the probe imports listSwarms fresh in a child process whose ENGINE_REPO_ROOT is the tmp repo
  const probe = path.join(repo, 'probe.ts')
  const swarmsSrc = path.resolve(here, '..', 'src', 'swarms')
  fs.writeFileSync(probe, [
    `import { listSwarms } from ${JSON.stringify(swarmsSrc)}`,
    `console.log(JSON.stringify(listSwarms(true).map((s) => ({ id: s.id, wire: s.wire ?? null, decisionArtifacts: s.decisionArtifacts ?? null }))))`,
    '',
  ].join('\n'))
  const tsx = path.join(here, '..', 'node_modules', '.bin', process.platform === 'win32' ? 'tsx.cmd' : 'tsx')
  const r = spawnSync(tsx, [probe], {
    encoding: 'utf8',
    env: { ...process.env, ENGINE_REPO_ROOT: repo, ENGINE_ACTIVITY_LOG_DISABLED: '1' },
  })
  assert.equal(r.status, 0, `probe subprocess failed: ${r.stderr || r.error}`)
  const lines = r.stdout.trim().split('\n')
  const out: { id: string; wire: Record<string, string> | null; decisionArtifacts: string[] | null }[] = JSON.parse(lines[lines.length - 1])

  const by = (id: string) => out.find((s) => s.id === id)
  assert.ok(by('wireempty') && by('wireblank') && by('wirepartial') && by('wirenone'), `tmp swarms not discovered: ${r.stdout}`)
  assert.equal(by('wireempty')!.wire, null, 'a bare `wire:` (YAML null) parses to NO wire')
  assert.equal(by('wireblank')!.wire, null, 'a wire block of empty/whitespace strings parses to NO wire')
  assert.equal(by('wirenone')!.wire, null, 'no wire key → no wire')
  assert.deepEqual(by('wirepartial')!.wire, { eventScope: 'commodity' }, 'a partial block keeps just the declared key (others absent)')
  assert.deepEqual(by('decisionvalid')!.decisionArtifacts, ['terminal/decision.json'], 'safe run-root-relative JSON targets are preserved')
  assert.equal(by('decisionunsafe'), undefined, 'an escaping decision artifact invalidates the manifest')
  assert.equal(by('decisionwrongtype'), undefined, 'decision_artifacts must be a non-empty list')
  assert.equal(by('wireunsafe'), undefined, 'a manifest whose runs root escapes the repo is dropped at discovery')
  assert.equal(out[0].id, 'research', 'the synthetic research default still heads the list in the tmp repo')
})

for (const d of tmpdirs) fs.rmSync(d, { recursive: true, force: true })
console.log(`\nwire-manifest.test.ts: ${passed} passed`)
