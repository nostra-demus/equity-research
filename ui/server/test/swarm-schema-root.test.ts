// Manifest admission must not turn a schema path into an arbitrary read capability. Use a separate
// fixture repository in a child process so discovery tests never edit the live checkout's manifests.
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { REPO_ROOT } from '../src/config'

const parent = path.join(REPO_ROOT, '.cache', 'test-output')
fs.mkdirSync(parent, { recursive: true })
const fixture = path.join(parent, `swarm-schema-root-${randomUUID()}`)
fs.mkdirSync(fixture, { recursive: true })
const moduleUrl = pathToFileURL(path.join(REPO_ROOT, 'ui', 'server', 'src', 'swarms.ts')).href
try {
  const script = `
    import assert from 'node:assert/strict';
    import fs from 'node:fs';
    import path from 'node:path';
    const root = process.env.ENGINE_REPO_ROOT;
    const manifest = path.join(root, '.claude/agents/schema-fixture/SWARM.md');
    const schemaRoot = path.join(root, 'frameworks/proof');
    fs.mkdirSync(path.dirname(manifest), {recursive:true});
    fs.mkdirSync(schemaRoot, {recursive:true});
    fs.writeFileSync(path.join(schemaRoot, 'decision.schema.json'), '{}\\n');
    const {listSwarms} = await import(${JSON.stringify(moduleUrl)});
    let checked = 0;
    const write = (schemaLine, bindings = true) => fs.writeFileSync(manifest,
      '---\\nid: schema-fixture\\nrun_root_template: fixture/runs/{ITEM}\\nplaceholder: ITEM\\nruns_root: fixture/runs\\n' +
      'decision_artifacts: [decision.json]\\n' + schemaLine +
      (bindings ? 'publication_schemas: [run:decision.json=decision.schema.json]\\n' : '') + '---\\n');
    const admitted = () => listSwarms(true).find(x => x.id === 'schema-fixture');
    write('schemas_root: frameworks/proof\\n');
    assert.equal(admitted()?.schemasRoot, 'frameworks/proof'); checked++;
    for (const value of ['../escape', '/absolute/schema', 'frameworks/../proof', 'frameworks\\\\proof', '.', '', {bad:'root'}]) {
      write('schemas_root: ' + JSON.stringify(value) + '\\n');
      assert.equal(admitted(), undefined, 'reject unsafe/malformed root: '+JSON.stringify(value)); checked++;
    }
    write('schemas_root: frameworks/missing\\n');
    assert.equal(admitted(), undefined); checked++;
    fs.writeFileSync(path.join(root, 'frameworks/not-a-directory'), '{}');
    write('schemas_root: frameworks/not-a-directory\\n');
    assert.equal(admitted(), undefined); checked++;
    fs.symlinkSync(schemaRoot, path.join(root, 'frameworks/linked'), 'dir');
    write('schemas_root: frameworks/linked\\n');
    assert.equal(admitted(), undefined); checked++;
    fs.symlinkSync(path.join(root, 'frameworks'), path.join(root, 'linked-parent'), 'dir');
    write('schemas_root: linked-parent/proof\\n');
    assert.equal(admitted(), undefined); checked++;
    write('');
    assert.equal(admitted(), undefined, 'declared bindings require a schema root'); checked++;
    write('', false);
    assert.ok(admitted(), 'a legacy schema-free manifest retains its existing discovery contract'); checked++;
    console.log(JSON.stringify({checked}));
  `
  const result = spawnSync(process.execPath, [...process.execArgv, '--input-type=module', '-e', script], {
    cwd: fixture, encoding: 'utf8', timeout: 20_000,
    env: { ...process.env, ENGINE_REPO_ROOT: fixture, ENGINE_STATE_DIR: path.join(fixture, '.state') },
  })
  assert.equal(result.status, 0, result.stderr || result.stdout || String(result.error))
  assert.equal(JSON.parse(result.stdout.trim()).checked, 14)
} finally {
  fs.rmSync(fixture, { recursive: true, force: true })
}
console.log('PASS: declared schema roots are contained program directories')
