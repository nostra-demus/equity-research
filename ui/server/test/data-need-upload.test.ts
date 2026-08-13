// Signed selected-data-need manual intake: atomic staging, terminal CAS, router-only publication, and
// durable provenance status. Uses only temporary pool/state roots. Run: npx tsx test/data-need-upload.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { Readable } from 'node:stream'
import { fileURLToPath } from 'node:url'
import {
  DATA_NEED_UPLOAD_ACTIVE_DIR, DATA_NEED_UPLOAD_ARCHIVE_DIR,
  commitDataNeedUpload, discardReceivedDataNeedUpload, readDataNeedUploadStatus,
  receiveDataNeedUploadFile, selectCurrentDataNeedForUpload, manualDataNeedUploadWriterReady,
} from '../src/data-need-upload'
import type { DataNeedsRead } from '../src/data-needs'

let passed = 0
async function check(name: string, fn: () => void | Promise<void>) {
  try { await fn(); passed++; console.log(`  ok  ${name}`) }
  catch (error: any) { console.error(`FAIL  ${name}\n      ${error?.stack || error}`); process.exitCode = 1 }
}

const here = path.dirname(fileURLToPath(import.meta.url))
const repo = path.resolve(here, '../../..')
const roots: string[] = []
const fixture = () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'data-need-upload-')); roots.push(root)
  const data = path.join(root, 'data'); const state = path.join(root, 'state')
  fs.mkdirSync(path.join(data, 'AMZN'), { recursive: true }); fs.mkdirSync(state, { mode: 0o700 })
  return { root, data, state }
}
const identity = {
  subject: 'AMZN', swarm: 'research', run_root: 'analyses/AMZN_2026-08-13',
  decision_fingerprint: `sha256:${'a'.repeat(64)}`, need_id: 'aws-growth', series: 'AWS growth rate',
}
const input = {
  ...identity, provider: 'YipitData / operator suggested', source_url: 'https://example.test/report',
  source_url_basis: 'user_supplied_unverified' as const, requested_by: 'operator@example.test',
}
const stream = (text: string) => Readable.from([Buffer.from(text)]) as Readable & { truncated?: boolean }

// Production shells into the canonical TypeScript owner/decision CAS. These temp fixtures deliberately
// isolate the upload envelope/router contract from a whole repo's run tree, so inject the Python router's
// explicit test seam while still running the real router in a separate process.
const TEST_ROUTER = `
import importlib.util, sys
script, pool, request_id, key_file = sys.argv[1:]
spec = importlib.util.spec_from_file_location("ingest_external", script)
router = importlib.util.module_from_spec(spec)
spec.loader.exec_module(router)
router.STABLE_AGE_S = 0
router.STABLE_RECHECK_S = 0
router.run(pool, manual_request=request_id, intent_key_path=key_file,
           manual_authority=lambda _intent: (True, None))
`
const runTestRouter = (dataDir: string, requestId: string, keyFile: string) => spawnSync('python3', [
  '-c', TEST_ROUTER, path.join(repo, '.claude/tools/ingest_external.py'), dataDir, requestId, keyFile,
], { cwd: repo, encoding: 'utf8', env: { ...process.env, INGEST_STABLE_READ_BACKOFF_S: '0' } })

await check('a selected historical call is readable but cannot accept a new shared-pool upload', () => {
  const need = {
    need_id: identity.need_id, series: identity.series, why_it_caps: 'caps', filing_required: false,
    entry_modules: ['earnings'], suggested_source: { name: 'Provider', acquisition: 'manual' }, tier: 9, cadence: 'monthly',
  }
  const selected = {
    contract_version: 'data-needs-read/2', subject: identity.subject, swarm: identity.swarm,
    run_root: identity.run_root, decision_fingerprint: identity.decision_fingerprint,
    decided_at: '2026-08-13T00:00:00.000Z', needs: [need], widened: [],
  } satisfies DataNeedsRead
  const current = { ...selected, run_root: 'analyses/AMZN_2026-08-14', decision_fingerprint: `sha256:${'b'.repeat(64)}` }
  assert.equal(selectCurrentDataNeedForUpload(selected, current, identity), 'selected_call_not_current')
  assert.equal((selectCurrentDataNeedForUpload(selected, selected, identity) as any).need.need_id, identity.need_id)
})

await check('stages one unique payload and exposes only staged_waiting durable truth', async () => {
  const f = fixture()
  const received = await receiveDataNeedUploadFile(stream('opaque observation 123'), '../../Yipit panel FY30.txt', 'text/plain', { dataDir: f.data })
  let terminalReads = 0
  const requestId = `DNU-${'1'.repeat(32)}`
  const committed = await commitDataNeedUpload(received, input, () => {
    terminalReads++
    const envelope = path.join(f.data, 'EXTERNAL-INBOX', DATA_NEED_UPLOAD_ACTIVE_DIR, requestId)
    assert.ok(fs.existsSync(path.join(envelope, 'payload')), 'terminal CAS runs after payload bytes are frozen')
    assert.ok(!fs.existsSync(path.join(envelope, 'intent.json')), 'terminal CAS is immediately before the commit marker')
  }, {
    dataDir: f.data, stateDir: f.state, requestId: () => requestId,
    now: () => new Date('2026-08-13T10:11:12.000Z'),
  })
  assert.equal(terminalReads, 1)
  assert.equal(committed.request_id, `DNU-${'1'.repeat(32)}`)
  const read = readDataNeedUploadStatus(identity, { dataDir: f.data, stateDir: f.state })
  assert.equal(read.contract_version, 'data-need-upload/1')
  assert.equal(read.status, 'staged_waiting')
  assert.deepEqual(read.items, [{
    request_id: committed.request_id, filename: 'Yipit panel FY30.txt',
    sha256: received.sha256, staged_at: '2026-08-13T10:11:12.000Z',
  }])
  assert.equal(JSON.stringify(read).includes(f.root), false, 'no absolute path may escape in status')
})

await check('terminal CAS failure publishes no signed request envelope', async () => {
  const f = fixture()
  const received = await receiveDataNeedUploadFile(stream('bytes'), 'note.txt', 'text/plain', { dataDir: f.data })
  await assert.rejects(() => commitDataNeedUpload(received, input, () => { throw new Error('selected_call_not_current') }, {
    dataDir: f.data, stateDir: f.state, requestId: () => `DNU-${'2'.repeat(32)}`,
  }), /selected_call_not_current/)
  const active = path.join(f.data, 'EXTERNAL-INBOX', DATA_NEED_UPLOAD_ACTIVE_DIR)
  assert.deepEqual(fs.readdirSync(active), [])
  assert.ok(!fs.existsSync(received.temp_path), 'failed terminal CAS cleans the moved payload without exposing an intent')
  discardReceivedDataNeedUpload(received)
})

await check('truncation, hardlinks, request collisions, and extra files fail closed', async () => {
  const f = fixture()
  const truncated = stream('prefix'); truncated.truncated = true
  await assert.rejects(() => receiveDataNeedUploadFile(truncated, 'large.txt', 'text/plain', { dataDir: f.data }), /limit/)

  const received = await receiveDataNeedUploadFile(stream('hardlink me'), 'note.txt', 'text/plain', { dataDir: f.data })
  fs.linkSync(received.temp_path, `${received.temp_path}.alias`)
  await assert.rejects(() => commitDataNeedUpload(received, input, () => undefined, {
    dataDir: f.data, stateDir: f.state, requestId: () => `DNU-${'3'.repeat(32)}`,
  }), /unique regular/)
  fs.unlinkSync(`${received.temp_path}.alias`); discardReceivedDataNeedUpload(received)

  const first = await receiveDataNeedUploadFile(stream('first'), 'first.txt', 'text/plain', { dataDir: f.data })
  await commitDataNeedUpload(first, input, () => undefined, {
    dataDir: f.data, stateDir: f.state, requestId: () => `DNU-${'4'.repeat(32)}`,
  })
  const second = await receiveDataNeedUploadFile(stream('second'), 'second.txt', 'text/plain', { dataDir: f.data })
  await assert.rejects(() => commitDataNeedUpload(second, input, () => undefined, {
    dataDir: f.data, stateDir: f.state, requestId: () => `DNU-${'4'.repeat(32)}`,
  }), /collision/)
  discardReceivedDataNeedUpload(second)
  const envelope = path.join(f.data, 'EXTERNAL-INBOX', DATA_NEED_UPLOAD_ACTIVE_DIR, `DNU-${'4'.repeat(32)}`)
  fs.writeFileSync(path.join(envelope, 'second-payload.txt'), 'forged second file')
  const read = readDataNeedUploadStatus(identity, { dataDir: f.data, stateDir: f.state })
  assert.equal(read.status, 'failed_tampered')
  assert.equal(read.items[0].reason, 'tampered_request')
})

await check('the existing Python router alone publishes, archives, and yields provenance-verified status', async () => {
  const f = fixture()
  const received = await receiveDataNeedUploadFile(stream('opaque observation 123'), 'Yipit panel FY30.txt', 'text/plain', { dataDir: f.data })
  const committed = await commitDataNeedUpload(received, input, () => undefined, {
    dataDir: f.data, stateDir: f.state, requestId: () => `DNU-${'5'.repeat(32)}`,
    now: () => new Date('2026-08-13T10:11:12.000Z'),
  })
  const run = runTestRouter(f.data, committed.request_id, committed.key_file)
  assert.equal(run.status, 0, run.stderr || run.stdout)
  const read = readDataNeedUploadStatus(identity, { dataDir: f.data, stateDir: f.state })
  assert.equal(read.status, 'routed_provenance_verified', JSON.stringify(read))
  assert.equal(read.items.length, 1)
  assert.match(read.items[0].routed_path || '', /^data\/AMZN\/external\//)
  const routed = path.join(f.data, (read.items[0].routed_path || '').slice('data/'.length))
  assert.equal(fs.readFileSync(routed, 'utf8'), 'opaque observation 123')
  const sidecar = JSON.parse(fs.readFileSync(`${routed}.source.json`, 'utf8'))
  assert.equal(sidecar.provider, input.provider, 'provider is forced by the signed server intent')
  assert.equal(sidecar.source_type, 'external_other', 'provider/filename metadata cannot upgrade payload inference')
  assert.equal(sidecar.tier, 9)
  assert.equal(sidecar.license, 'unspecified')
  assert.equal(sidecar.as_of, null, 'FY30 in filename cannot become a data-as-of')
  assert.equal(sidecar.request_context.source_url, input.source_url)
  assert.equal(sidecar.request_context.source_url_basis, 'user_supplied_unverified')
  assert.equal(sidecar.request_context.provider_basis, 'operator_supplied_unverified')
  assert.equal(sidecar.request_context.decision_fingerprint, identity.decision_fingerprint)
  assert.ok(fs.existsSync(path.join(f.data, 'EXTERNAL-INBOX', DATA_NEED_UPLOAD_ARCHIVE_DIR, committed.request_id, 'result.json')))
  assert.ok(!fs.existsSync(path.join(f.data, 'EXTERNAL-INBOX', DATA_NEED_UPLOAD_ACTIVE_DIR, committed.request_id)))

  const sidecarBytes = fs.readFileSync(`${routed}.source.json`)
  fs.writeFileSync(`${routed}.source.json`, `${sidecarBytes.toString('utf8')} `)
  const tamperedSidecar = readDataNeedUploadStatus(identity, { dataDir: f.data, stateDir: f.state })
  assert.equal(tamperedSidecar.status, 'failed_tampered', 'signed result binds the exact provenance-sidecar hash')
  assert.equal(tamperedSidecar.items[0].reason, 'tampered_request')
  fs.writeFileSync(`${routed}.source.json`, sidecarBytes)
  assert.equal(readDataNeedUploadStatus(identity, { dataDir: f.data, stateDir: f.state }).status, 'routed_provenance_verified')

  // Replaying the exact signed pair cannot publish another copy. It is recognized against the signed
  // archive result and consumed without touching the existing evidence.
  const archive = path.join(f.data, 'EXTERNAL-INBOX', DATA_NEED_UPLOAD_ARCHIVE_DIR, committed.request_id)
  const replay = path.join(f.data, 'EXTERNAL-INBOX', DATA_NEED_UPLOAD_ACTIVE_DIR, committed.request_id)
  fs.mkdirSync(replay, { mode: 0o700 })
  fs.copyFileSync(path.join(archive, 'payload'), path.join(replay, 'payload'))
  fs.copyFileSync(path.join(archive, 'intent.json'), path.join(replay, 'intent.json'))
  const again = runTestRouter(f.data, committed.request_id, committed.key_file)
  assert.equal(again.status, 0, again.stderr || again.stdout)
  assert.match(again.stdout, /replay of an already-routed request/)
  assert.ok(!fs.existsSync(replay))
  assert.equal(fs.readdirSync(path.dirname(routed)).filter((name) => name.startsWith('Yipit panel FY30') && !name.endsWith('.source.json')).length, 1)
})

await check('forged intent and changed payload never publish or impersonate a valid status item', async () => {
  const f = fixture()
  const received = await receiveDataNeedUploadFile(stream('trusted'), 'note.txt', 'text/plain', { dataDir: f.data })
  const committed = await commitDataNeedUpload(received, input, () => undefined, {
    dataDir: f.data, stateDir: f.state, requestId: () => `DNU-${'6'.repeat(32)}`,
  })
  const envelope = path.join(f.data, 'EXTERNAL-INBOX', DATA_NEED_UPLOAD_ACTIVE_DIR, committed.request_id)
  const intentFile = path.join(envelope, 'intent.json')
  const intent = JSON.parse(fs.readFileSync(intentFile, 'utf8')); intent.signature = `hmac-sha256:${'0'.repeat(64)}`
  fs.writeFileSync(intentFile, JSON.stringify(intent))
  let run = runTestRouter(f.data, committed.request_id, committed.key_file)
  assert.equal(run.status, 0); assert.match(run.stdout, /malformed or forged intent/)
  assert.equal(readDataNeedUploadStatus(identity, { dataDir: f.data, stateDir: f.state }).status, 'none')
  assert.ok(!fs.existsSync(path.join(f.data, 'AMZN', 'external')))

  const f2 = fixture()
  const received2 = await receiveDataNeedUploadFile(stream('trusted'), 'note.txt', 'text/plain', { dataDir: f2.data })
  const committed2 = await commitDataNeedUpload(received2, input, () => undefined, {
    dataDir: f2.data, stateDir: f2.state, requestId: () => `DNU-${'7'.repeat(32)}`,
  })
  const envelope2 = path.join(f2.data, 'EXTERNAL-INBOX', DATA_NEED_UPLOAD_ACTIVE_DIR, committed2.request_id)
  fs.writeFileSync(path.join(envelope2, 'payload'), 'changed')
  run = runTestRouter(f2.data, committed2.request_id, committed2.key_file)
  assert.equal(run.status, 0); assert.match(run.stdout, /payload hash or size mismatch/)
  const failed = readDataNeedUploadStatus(identity, { dataDir: f2.data, stateDir: f2.state })
  assert.equal(failed.status, 'failed_tampered'); assert.equal(failed.items[0].reason, 'tampered_request')
  assert.ok(!fs.existsSync(path.join(f2.data, 'AMZN', 'external')))
})

await check('writer authority is exact doer + host + canonical production data symlink', () => {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'manual-writer-'))); roots.push(root)
  const repoRoot = path.join(root, 'repo'); const pool = path.join(root, 'pool'); const home = path.join(root, 'home')
  const ops = path.join(home, '.nostra-ops')
  fs.mkdirSync(repoRoot); fs.mkdirSync(pool); fs.mkdirSync(ops, { recursive: true, mode: 0o700 })
  fs.symlinkSync(pool, path.join(repoRoot, 'data'))
  const writePrivate = (name: string, value: string) => {
    fs.writeFileSync(path.join(ops, name), value, { mode: 0o600 }); fs.chmodSync(path.join(ops, name), 0o600)
  }
  writePrivate('role', 'doer\n'); writePrivate('connector-writer-host', 'fixture-host\n'); writePrivate('pool-root', `${pool}\n`)
  const options = { repoRoot, dataDir: path.join(repoRoot, 'data'), homeDir: home, hostname: 'fixture-host' }
  assert.equal(manualDataNeedUploadWriterReady(options), true)
  assert.equal(manualDataNeedUploadWriterReady({ ...options, hostname: 'admin-host' }), false)
  writePrivate('role', 'admin\n'); assert.equal(manualDataNeedUploadWriterReady(options), false)
  writePrivate('role', 'doer\n'); fs.chmodSync(path.join(ops, 'pool-root'), 0o644)
  assert.equal(manualDataNeedUploadWriterReady(options), false)
  fs.chmodSync(path.join(ops, 'pool-root'), 0o600); fs.chmodSync(ops, 0o777)
  assert.equal(manualDataNeedUploadWriterReady(options), false)
  fs.chmodSync(ops, 0o700); fs.unlinkSync(path.join(repoRoot, 'data')); fs.mkdirSync(path.join(repoRoot, 'data'))
  assert.equal(manualDataNeedUploadWriterReady(options), false, 'an ordinary/alternate pool path is not writer authority')
})

await check('unsafe keys/state, invalid timestamps, and post-close read failures leave no request envelope', async () => {
  for (const kind of ['key-mode', 'state-mode', 'state-symlink', 'timestamp'] as const) {
    const f = fixture(); const requestId = `DNU-${({ 'key-mode': '8', 'state-mode': '9', 'state-symlink': 'a', timestamp: 'b' } as const)[kind].repeat(32)}`
    let stateDir = f.state
    if (kind === 'key-mode') {
      fs.writeFileSync(path.join(f.state, 'data-need-upload.key'), `${'42'.repeat(32)}\n`, { mode: 0o644 })
      fs.chmodSync(path.join(f.state, 'data-need-upload.key'), 0o644)
    } else if (kind === 'state-mode') {
      fs.chmodSync(f.state, 0o777)
    } else if (kind === 'state-symlink') {
      const target = path.join(f.root, 'state-target'); fs.mkdirSync(target, { mode: 0o700 })
      stateDir = path.join(f.root, 'state-link'); fs.symlinkSync(target, stateDir)
    }
    const received = await receiveDataNeedUploadFile(stream('cleanup bytes'), 'cleanup.txt', 'text/plain', { dataDir: f.data })
    await assert.rejects(() => commitDataNeedUpload(received, input, () => undefined, {
      dataDir: f.data, stateDir, requestId: () => requestId,
      ...(kind === 'timestamp' ? { now: () => new Date(Number.NaN) } : {}),
    }))
    const active = path.join(f.data, 'EXTERNAL-INBOX', DATA_NEED_UPLOAD_ACTIVE_DIR)
    assert.deepEqual(fs.readdirSync(active), [], `${kind} leaked a partial envelope`)
    discardReceivedDataNeedUpload(received)
  }

  const f = fixture()
  const sabotaged = (async function* () {
    yield Buffer.from('post-close bytes')
    const staging = path.join(f.data, 'EXTERNAL-INBOX', '.data-need-staging')
    const temp = path.join(staging, fs.readdirSync(staging)[0])
    fs.linkSync(temp, path.join(f.root, 'outside-alias'))
  })() as AsyncGenerator<Buffer> & { truncated?: boolean }
  await assert.rejects(() => receiveDataNeedUploadFile(sabotaged as any, 'read-failure.txt', 'text/plain', { dataDir: f.data }), /unique regular/)
  assert.deepEqual(fs.readdirSync(path.join(f.data, 'EXTERNAL-INBOX', '.data-need-staging')), [])
})

await check('UTF-8 NAME_MAX is enforced before staging', async () => {
  const f = fixture()
  await assert.rejects(
    () => receiveDataNeedUploadFile(stream('bytes'), `${'数'.repeat(100)}.txt`, 'text/plain', { dataDir: f.data }),
    /filename is too long/,
  )
})

await check('top-level durable status follows the newest deterministic request, not an older success', async () => {
  const f = fixture(); const stagedAt = () => new Date('2026-08-13T10:11:12.000Z')
  const old = await receiveDataNeedUploadFile(stream('old routed'), 'old.txt', 'text/plain', { dataDir: f.data })
  const oldCommit = await commitDataNeedUpload(old, input, () => undefined, {
    dataDir: f.data, stateDir: f.state, requestId: () => `DNU-${'1'.repeat(32)}`, now: stagedAt,
  })
  const run = runTestRouter(f.data, oldCommit.request_id, oldCommit.key_file)
  assert.equal(run.status, 0, run.stderr || run.stdout)

  const newer = await receiveDataNeedUploadFile(stream('new pending'), 'new.txt', 'text/plain', { dataDir: f.data })
  const newCommit = await commitDataNeedUpload(newer, input, () => undefined, {
    dataDir: f.data, stateDir: f.state, requestId: () => `DNU-${'f'.repeat(32)}`, now: stagedAt,
  })
  let read = readDataNeedUploadStatus(identity, { dataDir: f.data, stateDir: f.state })
  assert.equal(read.status, 'staged_waiting')
  assert.deepEqual(read.items.map((item) => item.request_id), [oldCommit.request_id, newCommit.request_id])
  fs.writeFileSync(path.join(f.data, 'EXTERNAL-INBOX', DATA_NEED_UPLOAD_ACTIVE_DIR, newCommit.request_id, 'extra'), 'tamper')
  read = readDataNeedUploadStatus(identity, { dataDir: f.data, stateDir: f.state })
  assert.equal(read.status, 'failed_tampered')
  assert.equal(read.items.at(-1)?.reason, 'tampered_request')
})

await check('manual GOLD policy rejection is distinct from tamper in durable status', async () => {
  const f = fixture(); fs.mkdirSync(path.join(f.data, 'GOLD'))
  const goldIdentity = { ...identity, subject: 'GOLD', swarm: 'commodity', run_root: 'commodity/runs/GOLD_2026-08-13' }
  const goldInput = { ...input, ...goldIdentity }
  const received = await receiveDataNeedUploadFile(stream('point in time gold view'), 'WILTW_2026-08-13.pdf', 'application/pdf', { dataDir: f.data })
  const committed = await commitDataNeedUpload(received, goldInput, () => undefined, {
    dataDir: f.data, stateDir: f.state, requestId: () => `DNU-${'d'.repeat(32)}`,
  })
  const run = runTestRouter(f.data, committed.request_id, committed.key_file)
  assert.equal(run.status, 0, run.stderr || run.stdout)
  const read = readDataNeedUploadStatus(goldIdentity, { dataDir: f.data, stateDir: f.state })
  assert.equal(read.status, 'rejected_policy')
  assert.equal(read.items[0]?.reason, 'policy_rejected')
  assert.ok(!fs.existsSync(path.join(f.data, 'GOLD', 'external')))
  assert.ok(!fs.existsSync(path.join(f.data, 'EXTERNAL-INBOX', DATA_NEED_UPLOAD_ACTIVE_DIR, committed.request_id, 'payload')))
})

await check('request-envelope parent swap cannot publish a signed intent or payload', async () => {
  const f = fixture()
  const received = await receiveDataNeedUploadFile(stream('parent swap'), 'swap.txt', 'text/plain', { dataDir: f.data })
  const requestId = `DNU-${'e'.repeat(32)}`
  const active = path.join(f.data, 'EXTERNAL-INBOX', DATA_NEED_UPLOAD_ACTIVE_DIR)
  const held = `${active}.held`; const outside = path.join(f.root, 'outside-active')
  fs.mkdirSync(outside, { mode: 0o700 })
  let swapped = false
  await assert.rejects(() => commitDataNeedUpload(received, input, () => {
    if (!swapped) {
      swapped = true
      fs.renameSync(active, held)
      fs.symlinkSync(outside, active)
    }
  }, { dataDir: f.data, stateDir: f.state, requestId: () => requestId }), /directory changed|ENOENT/)
  const escaped = path.join(outside, requestId)
  assert.equal(swapped, true)
  assert.ok(!fs.existsSync(path.join(escaped, 'payload')))
  assert.ok(!fs.existsSync(path.join(escaped, 'intent.json')))
  assert.ok(fs.existsSync(path.join(held, requestId, 'payload')), 'the moved inode is quarantined in the pinned old parent')
  assert.ok(!fs.existsSync(path.join(held, requestId, 'intent.json')), 'no signed commit marker exists in quarantine')
  discardReceivedDataNeedUpload(received)
})

await check('post-rename hash/write/fsync faults clean every partial request inode', async () => {
  const cases = ['payload-hash', 'intent-write', 'post-rename-fsync'] as const
  for (const [index, kind] of cases.entries()) {
    const f = fixture(); const requestId = `DNU-${String(index + 1).repeat(31)}c`
    const received = await receiveDataNeedUploadFile(stream(`cleanup ${kind}`), 'fault.txt', 'text/plain', { dataDir: f.data })
    const requestDir = path.join(f.data, 'EXTERNAL-INBOX', DATA_NEED_UPLOAD_ACTIVE_DIR, requestId)
    const originalOpen = fs.promises.open
    const originalWrite = fs.writeFileSync
    const originalFsync = fs.fsyncSync
    if (kind === 'payload-hash') {
      ;(fs.promises as any).open = async (file: fs.PathLike, ...args: any[]) => {
        if (String(file).endsWith(path.join(requestId, 'payload'))) throw Object.assign(new Error('fixture EIO'), { code: 'EIO' })
        return (originalOpen as any).call(fs.promises, file, ...args)
      }
    } else if (kind === 'intent-write') {
      ;(fs as any).writeFileSync = (file: any, bytes: any, ...args: any[]) => {
        const tmp = path.join(requestDir, '.intent.tmp')
        if (typeof file === 'number' && fs.existsSync(tmp)) {
          const opened = fs.fstatSync(file); const named = fs.lstatSync(tmp)
          if (opened.dev === named.dev && opened.ino === named.ino) {
            ;(originalWrite as any).call(fs, file, bytes, ...args)
            throw Object.assign(new Error('fixture EIO after bytes'), { code: 'EIO' })
          }
        }
        return (originalWrite as any).call(fs, file, bytes, ...args)
      }
    } else {
      ;(fs as any).fsyncSync = (fd: number) => {
        if (fs.fstatSync(fd).isDirectory()) throw Object.assign(new Error('fixture EIO after intent rename'), { code: 'EIO' })
        return originalFsync.call(fs, fd)
      }
    }
    try {
      await assert.rejects(() => commitDataNeedUpload(received, input, () => undefined, {
        dataDir: f.data, stateDir: f.state, requestId: () => requestId,
      }), /fixture EIO/)
    } finally {
      ;(fs.promises as any).open = originalOpen
      ;(fs as any).writeFileSync = originalWrite
      ;(fs as any).fsyncSync = originalFsync
    }
    const active = path.join(f.data, 'EXTERNAL-INBOX', DATA_NEED_UPLOAD_ACTIVE_DIR)
    assert.deepEqual(fs.readdirSync(active), [], `${kind} leaked a request envelope`)
    assert.ok(!fs.existsSync(path.join(requestDir, 'payload')))
    assert.ok(!fs.existsSync(path.join(requestDir, '.intent.tmp')))
    assert.ok(!fs.existsSync(path.join(requestDir, 'intent.json')))
  }
})

for (const root of roots) fs.rmSync(root, { recursive: true, force: true })
console.log(`\ndata-need-upload.test.ts: ${passed} passed${process.exitCode ? ' (with failures)' : ''}`)
