import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const result = spawnSync(process.execPath, [path.join(webRoot, 'scripts', 'build-snapshot.mjs')], {
  cwd: webRoot,
  encoding: 'utf8',
})
assert.equal(result.status, 0, result.stderr || result.stdout)

const snapshot = JSON.parse(readFileSync(path.join(webRoot, 'public', 'data', 'snapshot.json'), 'utf8'))
const modules = snapshot.swarmGraph?.modules ?? []
assert.ok(modules.length > 0, 'the static research graph must contain modules')
assert.ok(modules.every((module) => typeof module.exactResume === 'boolean'), 'every static module must carry exactResume')
assert.equal(modules.find((module) => module.name === 'management-governance')?.exactResume, true,
  'the exact-resume management-governance module must stay marked true')

console.log('build-snapshot.test.mjs: static exact-resume truth passed')
