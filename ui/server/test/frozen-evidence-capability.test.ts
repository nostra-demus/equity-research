// Run: npx tsx test/frozen-evidence-capability.test.ts
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {
  createFrozenEvidenceReadCapability,
  destroyFrozenEvidenceReadCapability,
  sweepStaleFrozenEvidenceCapabilities,
  verifyFrozenEvidenceReadCapability,
} from '../src/frozen-evidence-capability'

const temporary = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'nostra-frozen-capability-')))
const mutableRepo = path.join(temporary, 'repo')
const mutableData = path.join(mutableRepo, 'data')
const stateDir = path.join(temporary, 'state')
const capabilityRoot = path.join(temporary, 'private-capabilities')
const digest = 'a'.repeat(64)
const outDir = path.join(mutableRepo, 'analyses', 'TEST_2099-01-01', '_pool_extracts')
const generationDir = path.join(outDir, '.extract-generations', digest)
const evidenceRoot = path.join(generationDir, 'raw')
const source = { dataPath: path.join(mutableData, 'TEST'), outDir, generationDigest: digest, generationDir, evidenceRoot }
const options = { capabilityRoot, forbiddenRoots: [mutableRepo, mutableData, stateDir] }

function sealSource(): void {
  fs.mkdirSync(evidenceRoot, { recursive: true, mode: 0o700 })
  fs.writeFileSync(path.join(generationDir, 'manifest.json'), '{"bound":true}\n', { mode: 0o600 })
  fs.writeFileSync(path.join(evidenceRoot, 'filing.txt'), 'immutable filing bytes\n', { mode: 0o600 })
  if (process.platform !== 'win32') {
    fs.chmodSync(path.join(generationDir, 'manifest.json'), 0o400)
    fs.chmodSync(path.join(evidenceRoot, 'filing.txt'), 0o400)
    fs.chmodSync(evidenceRoot, 0o500)
    fs.chmodSync(generationDir, 0o500)
  }
}

try {
  sealSource()
  const capability = createFrozenEvidenceReadCapability(source, options)
  assert.equal(
    fs.readFileSync(path.join(capability.evidenceRoot, 'filing.txt'), 'utf8'),
    'immutable filing bytes\n',
    'the exact isolated capability bytes are readable',
  )
  assert.ok(!capability.root.startsWith(`${path.resolve(mutableRepo)}${path.sep}`))
  assert.notEqual(
    fs.statSync(path.join(capability.evidenceRoot, 'filing.txt')).ino,
    fs.statSync(path.join(evidenceRoot, 'filing.txt')).ino,
    'capability bytes are copied, never hard-linked back to the mutable namespace',
  )
  verifyFrozenEvidenceReadCapability(capability, source, options)

  // A future mutable projection has no relationship to the already-issued external capability.
  if (process.platform !== 'win32') fs.chmodSync(outDir, 0o700)
  fs.writeFileSync(path.join(outDir, 'future-projection.json'), '{"new":true}\n')
  assert.equal(fs.existsSync(path.join(capability.root, 'future-projection.json')), false)
  verifyFrozenEvidenceReadCapability(capability, source, options)

  const capabilityFile = path.join(capability.evidenceRoot, 'filing.txt')
  if (process.platform !== 'win32') fs.chmodSync(capabilityFile, 0o600)
  fs.writeFileSync(capabilityFile, 'tampered capability bytes\n')
  if (process.platform !== 'win32') fs.chmodSync(capabilityFile, 0o400)
  assert.throws(
    () => verifyFrozenEvidenceReadCapability(capability, source, options),
    /content changed/,
    'capability tampering fails its next provider-boundary verification',
  )

  destroyFrozenEvidenceReadCapability(capability, options)
  assert.equal(fs.existsSync(capability.root), false, 'chain cleanup removes the exact capability')

  const staleSafe = path.join(capabilityRoot, 'chain-Stale01')
  fs.mkdirSync(path.join(staleSafe, 'nested'), { recursive: true, mode: 0o700 })
  fs.writeFileSync(path.join(staleSafe, 'nested', 'evidence.txt'), 'stale private bytes\n', { mode: 0o600 })
  const outsideSibling = path.join(temporary, 'chain-Outside01')
  fs.mkdirSync(outsideSibling, { mode: 0o700 })
  fs.writeFileSync(path.join(outsideSibling, 'keep.txt'), 'keep\n', { mode: 0o600 })

  const unknown = path.join(capabilityRoot, 'operator-note.txt')
  fs.writeFileSync(unknown, 'do not delete\n', { mode: 0o600 })
  const unsafeRegular = path.join(capabilityRoot, 'chain-Regular1')
  fs.writeFileSync(unsafeRegular, 'not a directory\n', { mode: 0o600 })

  if (process.platform !== 'win32') {
    const outsideTarget = path.join(temporary, 'outside-target')
    fs.mkdirSync(outsideTarget, { mode: 0o700 })
    fs.writeFileSync(path.join(outsideTarget, 'sentinel.txt'), 'outside remains\n', { mode: 0o600 })
    fs.symlinkSync(outsideTarget, path.join(capabilityRoot, 'chain-RootLink1'))

    const nestedLink = path.join(capabilityRoot, 'chain-NestedLink1')
    fs.mkdirSync(nestedLink, { mode: 0o700 })
    fs.symlinkSync(path.join(outsideTarget, 'sentinel.txt'), path.join(nestedLink, 'linked.txt'))

    const hardLinkTarget = path.join(temporary, 'hard-link-target.txt')
    fs.writeFileSync(hardLinkTarget, 'shared inode remains\n', { mode: 0o600 })
    const hardLinkRoot = path.join(capabilityRoot, 'chain-HardLink1')
    fs.mkdirSync(hardLinkRoot, { mode: 0o700 })
    fs.linkSync(hardLinkTarget, path.join(hardLinkRoot, 'linked.txt'))

    const sharedModeRoot = path.join(capabilityRoot, 'chain-SharedMode1')
    fs.mkdirSync(sharedModeRoot, { mode: 0o755 })
  }

  const swept = sweepStaleFrozenEvidenceCapabilities(options)
  assert.deepEqual(swept.removed, ['chain-Stale01'])
  assert.equal(fs.existsSync(staleSafe), false, 'one proven stale chain is removed')
  assert.equal(fs.existsSync(path.join(outsideSibling, 'keep.txt')), true, 'a sibling outside the exact parent is untouched')
  assert.equal(fs.existsSync(unknown), true, 'an unrecognized parent entry is retained')
  assert.equal(fs.existsSync(unsafeRegular), true, 'a chain-named regular file is retained')
  assert.ok(swept.unsafe.some((issue) => issue.entry === 'operator-note.txt'))
  assert.ok(swept.unsafe.some((issue) => issue.entry === 'chain-Regular1'))
  if (process.platform !== 'win32') {
    assert.ok(swept.unsafe.some((issue) => issue.entry === 'chain-RootLink1'))
    assert.ok(swept.unsafe.some((issue) => issue.entry === 'chain-NestedLink1'))
    assert.ok(swept.unsafe.some((issue) => issue.entry === 'chain-HardLink1' && /hard-linked/.test(issue.reason)))
    assert.ok(swept.unsafe.some((issue) => issue.entry === 'chain-SharedMode1' && /owner-only/.test(issue.reason)))
    assert.equal(fs.readFileSync(path.join(temporary, 'outside-target', 'sentinel.txt'), 'utf8'), 'outside remains\n')
    assert.equal(fs.readFileSync(path.join(temporary, 'hard-link-target.txt'), 'utf8'), 'shared inode remains\n')
  }

  const missingSweep = sweepStaleFrozenEvidenceCapabilities({
    ...options,
    capabilityRoot: path.join(temporary, 'missing-capability-parent'),
  })
  assert.deepEqual(missingSweep, { removed: [], unsafe: [] }, 'a never-created parent is a clean no-op')

  if (process.platform !== 'win32') {
    const linkedParentTarget = path.join(temporary, 'linked-parent-target')
    const linkedParent = path.join(temporary, 'linked-capability-parent')
    fs.mkdirSync(linkedParentTarget, { mode: 0o700 })
    fs.writeFileSync(path.join(linkedParentTarget, 'sentinel.txt'), 'parent target remains\n', { mode: 0o600 })
    fs.symlinkSync(linkedParentTarget, linkedParent)
    const linkedParentSweep = sweepStaleFrozenEvidenceCapabilities({ ...options, capabilityRoot: linkedParent })
    assert.equal(linkedParentSweep.removed.length, 0)
    assert.equal(linkedParentSweep.unsafe[0]?.entry, '<capability-parent>')
    assert.equal(fs.readFileSync(path.join(linkedParentTarget, 'sentinel.txt'), 'utf8'), 'parent target remains\n')
  }

  const serverSource = fs.readFileSync(new URL('../src/server.ts', import.meta.url), 'utf8')
  const reconcileAt = serverSource.indexOf('.then(() => reconcileOrphanedProviderGroups())')
  const sweepAt = serverSource.indexOf('const capabilitySweep = sweepStaleFrozenEvidenceCapabilities(')
  const listenAt = serverSource.indexOf('await app.listen({ host: HOST, port: PORT })')
  assert.ok(reconcileAt >= 0 && reconcileAt < sweepAt, 'startup sweeps only after orphan provider groups are extinct')
  assert.ok(sweepAt < listenAt, 'startup refuses unsafe leftovers before accepting requests')
  assert.match(serverSource.slice(sweepAt, listenAt), /capabilitySweep\.unsafe\.length > 0[\s\S]*throw new Error/)
  console.log('frozen-evidence-capability tests passed')
} finally {
  if (process.platform !== 'win32') {
    const unseal = (candidate: string) => {
      let info: fs.Stats
      try { info = fs.lstatSync(candidate) } catch { return }
      if (info.isDirectory()) {
        fs.chmodSync(candidate, 0o700)
        for (const name of fs.readdirSync(candidate)) unseal(path.join(candidate, name))
      } else if (info.isFile()) fs.chmodSync(candidate, 0o600)
    }
    unseal(temporary)
  }
  fs.rmSync(temporary, { recursive: true, force: true })
}
