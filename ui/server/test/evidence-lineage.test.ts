// Supervisor-owned reusable-output lineage. Run: npx tsx test/evidence-lineage.test.ts
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {
  captureOutputLineageAttempt,
  outputLineageManifestPath,
  readVerifiedOutputLineage,
  settleOutputLineageAttempt,
  verifyReusableOutputLineage,
  verifyReusableOutputLineageForGeneration,
  type OutputLineageOptions,
} from '../src/evidence-lineage'

const temporary = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'nostra-output-lineage-')))
const repoRoot = path.join(temporary, 'repo')
const stateDir = path.join(temporary, 'state')
fs.mkdirSync(path.join(repoRoot, 'analyses'), { recursive: true })
const options: OutputLineageOptions = {
  repoRoot,
  stateDir,
  now: () => new Date('2099-01-01T00:00:00.000Z'),
}
const generationA = 'a'.repeat(64)
const generationB = 'b'.repeat(64)

function makeRoot(name: string): string {
  const root = `analyses/${name}_2099-01-01`
  fs.mkdirSync(path.join(repoRoot, root, 'business-model'), { recursive: true })
  return root
}

function write(root: string, relative: string, body: string): void {
  const absolute = path.join(repoRoot, root, relative)
  fs.mkdirSync(path.dirname(absolute), { recursive: true })
  fs.writeFileSync(absolute, body)
}

function boundAttempt(root: string, relative: string, attemptId: string, generation = generationA) {
  return captureOutputLineageAttempt({
    runRoot: root,
    outputRels: [relative],
    generationDigest: generation,
    attemptId,
    provider: 'codex',
    profileKey: 'codex|sol:high',
  }, options)
}

try {
  {
    const root = makeRoot('ZZLINEAGEPART')
    const relative = 'business-model/03_partial.md'
    const attempt = boundAttempt(root, relative, 'attempt-bound-partial')
    write(root, relative, '# Valid partial output\n\nThe provider stopped later, but these bytes are complete.\n')
    settleOutputLineageAttempt(attempt, options)
    const entry = verifyReusableOutputLineageForGeneration(root, relative, generationA, options)
    assert.equal(entry?.attempt_id, 'attempt-bound-partial',
      'a mechanically valid partial output is retained even when the enclosing process later fails')
    assert.equal(entry?.provider, 'codex')
  }

  for (const order of [['left', 'right'], ['right', 'left']] as const) {
    const root = makeRoot(`ZZLINEAGEMERGE${order[0].toUpperCase()}`)
    const relatives = {
      left: 'business-model/01_left.md',
      right: 'business-model/02_right.md',
    }
    // Parallel siblings capture the same empty whole-manifest digest before either provider starts.
    const attempts = {
      left: boundAttempt(root, relatives.left, `attempt-${order.join('-')}-left`),
      right: boundAttempt(root, relatives.right, `attempt-${order.join('-')}-right`),
    }
    write(root, relatives.left, '# Left sibling output\n')
    write(root, relatives.right, '# Right sibling output\n')
    settleOutputLineageAttempt(attempts[order[0]], options)
    settleOutputLineageAttempt(attempts[order[1]], options)
    assert.deepEqual(
      readVerifiedOutputLineage(root, options).entries.map((entry) => entry.output_rel),
      [relatives.left, relatives.right],
      `disjoint sibling lineage must merge when ${order[0]} settles first`,
    )
  }

  for (const order of [['left', 'right'], ['right', 'left']] as const) {
    const root = makeRoot(`ZZLINEAGESTALE${order[0].toUpperCase()}`)
    const relatives = {
      left: 'business-model/01_left.md',
      right: 'business-model/02_right.md',
    }
    // Seed two protected entries, matching an interrupted run whose stale module syntheses were valid in the
    // prior attempt. Exact Continue then privately removes both files while retaining their durable lineage
    // receipt until the replacement children settle.
    for (const side of ['left', 'right'] as const) {
      const seed = boundAttempt(root, relatives[side], `attempt-stale-seed-${side}`)
      write(root, relatives[side], `# Original ${side} output\n`)
      settleOutputLineageAttempt(seed, options)
    }
    fs.unlinkSync(path.join(repoRoot, root, relatives.left))
    fs.unlinkSync(path.join(repoRoot, root, relatives.right))
    const attempts = {
      left: boundAttempt(root, relatives.left, `attempt-stale-${order.join('-')}-left`),
      right: boundAttempt(root, relatives.right, `attempt-stale-${order.join('-')}-right`),
    }
    write(root, relatives.left, '# Rebuilt left output\n')
    write(root, relatives.right, '# Rebuilt right output\n')
    settleOutputLineageAttempt(attempts[order[0]], options)
    settleOutputLineageAttempt(attempts[order[1]], options)
    const entries = readVerifiedOutputLineage(root, options).entries
    assert.deepEqual(entries.map((entry) => entry.output_rel), [relatives.left, relatives.right],
      `stale disjoint sibling lineage must merge when ${order[0]} settles first`)
    assert.ok(entries.every((entry) => entry.attempt_id.startsWith('attempt-stale-')),
      'both rebuilt outputs retain their new protected attempt lineage')
  }

  {
    const root = makeRoot('ZZLINEAGEOVERLAP')
    const relative = 'business-model/03_shared.md'
    const first = boundAttempt(root, relative, 'attempt-overlap-first')
    const second = boundAttempt(root, relative, 'attempt-overlap-second')
    write(root, relative, '# First writer bytes\n')
    settleOutputLineageAttempt(first, options)
    write(root, relative, '# Second writer bytes\n')
    assert.throws(
      () => settleOutputLineageAttempt(second, options),
      /write ownership overlapped/,
      'two concurrent attempts changing the same output must conflict',
    )
    assert.equal(verifyReusableOutputLineage(root, relative, options), null,
      'a same-path conflict revokes the first settlement instead of trusting either writer')
  }

  {
    const root = makeRoot('ZZLINEAGEUNBOUND')
    const relative = 'business-model/04_value.md'
    const first = boundAttempt(root, relative, 'attempt-bound-original')
    write(root, relative, '# Original bound output\n')
    settleOutputLineageAttempt(first, options)
    assert.ok(verifyReusableOutputLineage(root, relative, options))

    const standalone = captureOutputLineageAttempt({
      runRoot: root,
      outputRels: [relative],
      generationDigest: null,
      attemptId: 'attempt-standalone',
      provider: 'claude',
      profileKey: 'claude:opus:default',
    }, options)
    write(root, relative, '# Rewritten without a frozen evidence generation\n')
    settleOutputLineageAttempt(standalone, options)
    assert.equal(verifyReusableOutputLineage(root, relative, options), null,
      'an unbound standalone rewrite revokes the earlier trusted lineage')
  }

  {
    const root = makeRoot('ZZLINEAGEDELETE')
    const relative = 'business-model/04_deleted.md'
    const first = boundAttempt(root, relative, 'attempt-bound-before-delete')
    write(root, relative, '# Bound output deleted by a later attempt\n')
    settleOutputLineageAttempt(first, options)

    const standalone = captureOutputLineageAttempt({
      runRoot: root,
      outputRels: [relative],
      generationDigest: null,
      attemptId: 'attempt-standalone-delete',
      provider: 'claude',
      profileKey: 'claude:opus:default',
    }, options)
    fs.unlinkSync(path.join(repoRoot, root, relative))
    settleOutputLineageAttempt(standalone, options)
    assert.equal(readVerifiedOutputLineage(root, options).entries.length, 0,
      'deleting a previously bound output removes its protected lineage entry')
  }

  {
    const root = makeRoot('ZZLINEAGEKEEP')
    const relative = 'business-model/05_customer.md'
    const first = boundAttempt(root, relative, 'attempt-original')
    write(root, relative, '# Byte-identical retained output\n')
    settleOutputLineageAttempt(first, options)
    const original = verifyReusableOutputLineage(root, relative, options)!

    const later = boundAttempt(root, relative, 'attempt-new-generation', generationB)
    // A provider may touch/rewrite a file to the same bytes. Hash identity, not mtime, is authoritative.
    write(root, relative, '# Byte-identical retained output\n')
    settleOutputLineageAttempt(later, options)
    const retained = verifyReusableOutputLineage(root, relative, options)!
    assert.equal(retained.attempt_id, original.attempt_id)
    assert.equal(retained.generation_digest, generationA,
      'unchanged bytes must not be re-attested under a later evidence generation')
  }

  {
    const root = makeRoot('ZZLINEAGETAMPER')
    const relative = 'business-model/06_tamper.md'
    const attempt = boundAttempt(root, relative, 'attempt-tamper')
    write(root, relative, '# Trusted output\n')
    settleOutputLineageAttempt(attempt, options)
    write(root, relative, '# Changed after settlement\n')
    assert.equal(verifyReusableOutputLineage(root, relative, options), null,
      'post-settlement byte tampering is not reusable')
    fs.unlinkSync(path.join(repoRoot, root, relative))
    assert.equal(verifyReusableOutputLineage(root, relative, options), null,
      'a missing protected output is not reusable')
  }

  {
    const sourceRoot = makeRoot('ZZLINEAGECROSSA')
    const targetRoot = makeRoot('ZZLINEAGECROSSB')
    const relative = 'business-model/07_cross.md'
    const attempt = boundAttempt(sourceRoot, relative, 'attempt-cross')
    write(sourceRoot, relative, '# Root A output\n')
    settleOutputLineageAttempt(attempt, options)
    fs.copyFileSync(
      outputLineageManifestPath(sourceRoot, options),
      outputLineageManifestPath(targetRoot, options),
    )
    assert.throws(() => readVerifiedOutputLineage(targetRoot, options), /exact run root/,
      'a copied manifest is rejected by its root binding')
  }

  {
    const root = makeRoot('ZZLINEAGEINVALID')
    const relative = 'business-model/08_invalid.md'
    const attempt = boundAttempt(root, relative, 'attempt-invalid')
    write(root, relative, '# Truncated output\n\n```json\n{"open": true}\n')
    settleOutputLineageAttempt(attempt, options)
    assert.equal(verifyReusableOutputLineage(root, relative, options), null,
      'a changed but mechanically invalid partial is never attested')
  }

  if (process.platform !== 'win32') {
    const root = makeRoot('ZZLINEAGEHARDLINK')
    const relative = 'business-model/08_hardlink.md'
    const outside = path.join(temporary, 'outside.md')
    fs.writeFileSync(outside, '# Aliased output bytes\n')
    fs.linkSync(outside, path.join(repoRoot, root, relative))
    const attempt = boundAttempt(root, relative, 'attempt-hardlink')
    // The path exists and contains valid markdown, but it aliases another path and cannot be trusted.
    settleOutputLineageAttempt(attempt, options)
    assert.equal(verifyReusableOutputLineage(root, relative, options), null,
      'a hard-linked provider output is never attested or reused')
  }

  {
    const root = makeRoot('ZZLINEAGESNAPSHOT')
    const relative = 'business-model/09_snapshot.md'
    const attempt = boundAttempt(root, relative, 'attempt-snapshot')
    write(root, relative, '# Snapshot output\n')
    settleOutputLineageAttempt(attempt, options)
    const snapshot = readVerifiedOutputLineage(root, options)
    assert.match(snapshot.manifestDigest!, /^sha256:[a-f0-9]{64}$/)
    assert.match(snapshot.verifiedDigest, /^sha256:[a-f0-9]{64}$/)
    assert.deepEqual(snapshot.entries.map((entry) => entry.output_rel), [relative])
    if (process.platform !== 'win32') {
      assert.equal(fs.statSync(path.dirname(outputLineageManifestPath(root, options))).mode & 0o077, 0)
      assert.equal(fs.statSync(outputLineageManifestPath(root, options)).mode & 0o077, 0)
    }
  }

  console.log('evidence-lineage tests passed')
} finally {
  fs.rmSync(temporary, { recursive: true, force: true })
}
