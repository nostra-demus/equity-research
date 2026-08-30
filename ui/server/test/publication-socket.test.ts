process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { PUBLICATION_SOCKET_ROOT, REPO_ROOT, STATE_DIR } from '../src/config'
import { beginExecutionAttempt } from '../src/execution-provenance'
import { startSupervisorPublicationSocket } from '../src/launcher'
import { createRun, finishRun } from '../src/registry'

const runRoot = `analyses/ZZSOCKET_${Date.now()}`
const execFileAsync = promisify(execFile)
const absolute = path.join(REPO_ROOT, runRoot)
fs.mkdirSync(absolute, { recursive: true })
const profile = { key: 'claude:sonnet:default', parentModel: 'sonnet', parentReasoning: 'default' }
const run = createRun({
  kind: 'module', ticker: 'ZZSOCKET', provider: 'claude', executionProfile: profile,
  profileKey: profile.key, model: 'sonnet', reasoningLevel: 'default', prompt: '', user: 'test',
  userVia: 'local', runRoot, willCommitToMain: false, writeTargetsAbs: [absolute], coveredModules: [],
  readDepsAbs: [], closeWatcher: undefined, expected: new Map(),
})
run.publicationToken = randomUUID()
beginExecutionAttempt(run)

const request = (socketPath: string, options: { method?: string; token?: string; body?: string; path?: string } = {}) =>
  new Promise<{ status: number; body: any }>((resolve, reject) => {
    const body = options.body ?? '{}'
    const req = http.request({
      socketPath, path: options.path ?? '/publication', method: options.method ?? 'POST',
      headers: {
        'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body),
        'X-Nostra-Publication-Token': options.token ?? run.publicationToken!,
      },
    }, (response) => {
      let raw = ''
      response.setEncoding('utf8')
      response.on('data', (chunk) => { raw += chunk })
      response.on('end', () => resolve({ status: response.statusCode || 0, body: JSON.parse(raw || '{}') }))
    })
    req.on('error', reject)
    req.end(body)
  })

const publication = await startSupervisorPublicationSocket(run)
try {
  assert.equal(fs.lstatSync(publication.socketPath).isSocket(), true)
  assert.equal(fs.lstatSync(publication.socketPath).mode & 0o077, 0)
  assert.equal(path.dirname(path.dirname(publication.socketPath)), fs.realpathSync(PUBLICATION_SOCKET_ROOT))
  assert.equal(publication.socketPath.startsWith(`${path.resolve(STATE_DIR)}${path.sep}`), false,
    'publication metadata must not be trapped beneath unreadable supervisor state')
  assert.equal(fs.lstatSync(PUBLICATION_SOCKET_ROOT).mode & 0o077, 0)
  assert.equal((await request(publication.socketPath, { method: 'GET' })).status, 405)
  assert.equal((await request(publication.socketPath, { token: randomUUID() })).status, 403)
  assert.equal((await request(publication.socketPath, { body: '{broken' })).status, 400)
  assert.equal((await request(publication.socketPath, { body: '{"phase":"stamp","forged":true}' })).status, 400)
  assert.equal((await request(publication.socketPath, { body: JSON.stringify({ padding: 'x'.repeat(70_000) }) })).status, 413)
  const missingMemory = await request(publication.socketPath, {
    path: '/memory/status',
    body: JSON.stringify({ agentKey: 'business-model/01_test', outputRel: 'business-model/01_test.md' }),
  })
  assert.equal(missingMemory.status, 409, 'missing memory is a bounded request rejection, never a process exception')
  assert.equal(missingMemory.body.error, 'memory request rejected')
  for (let attempt = 0; attempt < 2; attempt++) {
    const result = await request(publication.socketPath, { body: '{"phase":"stamp"}' })
    assert.equal(result.status, 200, `attempt ${attempt}: ${JSON.stringify(result.body)}`)
    assert.equal(result.body.ok, true, 'archive/commit and attest/verify require multiple requests per live run')
  }
  const helperResult = await execFileAsync('python3', ['-c', [
    'import json,sys',
    `sys.path.insert(0, ${JSON.stringify(path.join(REPO_ROOT, 'scripts'))})`,
    'from supervisor_publication import post',
    'print(json.dumps(post({"phase":"stamp"})))',
  ].join(';')], {
    cwd: REPO_ROOT,
    env: {
      ...process.env,
      NOSTRA_COCKPIT_RUN: '1',
      NOSTRA_PUBLICATION_ENDPOINT: 'http://localhost/publication',
      NOSTRA_PUBLICATION_SOCKET: publication.socketPath,
      NOSTRA_PUBLICATION_TOKEN: run.publicationToken,
    },
    encoding: 'utf8',
  })
  assert.equal(JSON.parse(helperResult.stdout).ok, true, 'shared Python callers reach the exact UDS without TCP')

  const concurrentRoot = `analyses/ZZSOCKET_CONCURRENT_${Date.now()}`
  const concurrentAbsolute = path.join(REPO_ROOT, concurrentRoot)
  fs.mkdirSync(concurrentAbsolute, { recursive: true })
  const concurrentRun = createRun({
    kind: 'module', ticker: 'ZZSOCKETCONCURRENT', provider: 'claude', executionProfile: profile,
    profileKey: profile.key, model: 'sonnet', reasoningLevel: 'default', prompt: '', user: 'test',
    userVia: 'local', runRoot: concurrentRoot, willCommitToMain: false,
    writeTargetsAbs: [concurrentAbsolute], coveredModules: [], readDepsAbs: [], closeWatcher: undefined,
    expected: new Map(),
  })
  concurrentRun.publicationToken = randomUUID()
  beginExecutionAttempt(concurrentRun)
  const concurrentPublication = await startSupervisorPublicationSocket(concurrentRun)
  try {
    publication.verify()
    concurrentPublication.verify()
  } finally {
    await concurrentPublication.close()
    finishRun(concurrentRun, 'done')
    fs.rmSync(concurrentAbsolute, { recursive: true, force: true })
  }
  publication.verify()
  run.publicationCompleted = true
  fs.unlinkSync(publication.socketPath)
  fs.writeFileSync(publication.socketPath, 'forged replacement\n', { mode: 0o600 })
  assert.throws(() => publication.verify(), /publication transport integrity failed/)
  assert.equal(run.publicationCompleted, false, 'unlink/replacement poisons terminal publication state')
} finally {
  await publication.close()
  finishRun(run, 'done')
  fs.rmSync(absolute, { recursive: true, force: true })
}
assert.equal(fs.existsSync(publication.socketPath), false)
console.log('PASS: per-run Unix publication socket is strict, reusable while live, and cleaned')
