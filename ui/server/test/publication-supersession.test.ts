process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
// A retained ready-publication receipt is retried at a later startup and commits the OLD bytes frozen when
// it was sealed. If a newer run published the same paths in between, that retry reverts published research
// to stale bytes. supersededPublicationPaths() names exactly those paths; recovery commits only the rest, so
// the answer must be complete as well as correct. It is exercised here
// against a throwaway repository with exact committer times, because the recovery-flow tests run inside the
// real checkout and must never create commits there.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { supersededPublicationPaths } from '../src/launcher'

const repo = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'publication-supersession-')))
const snapshots = path.join(repo, '.snapshots')
// A GIT_DIR / GIT_WORK_TREE / GIT_INDEX_FILE inherited from the environment would point `git init` and
// `git commit` below at the REAL repository. Strip them so this helper can only ever touch the throwaway.
const inherited = Object.fromEntries(Object.entries(process.env)
  .filter(([name]) => !['GIT_DIR', 'GIT_WORK_TREE', 'GIT_INDEX_FILE', 'GIT_COMMON_DIR', 'GIT_OBJECT_DIRECTORY'].includes(name)))
const git = (args: string[], at?: number): string => execFileSync('git', args, {
  cwd: repo, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
  env: {
    ...inherited,
    GIT_AUTHOR_NAME: 'Test', GIT_AUTHOR_EMAIL: 'test@example.com',
    GIT_COMMITTER_NAME: 'Test', GIT_COMMITTER_EMAIL: 'test@example.com',
    GIT_CONFIG_GLOBAL: '/dev/null', GIT_CONFIG_SYSTEM: '/dev/null',
    ...(at === undefined ? {} : { GIT_AUTHOR_DATE: `@${at} +0000`, GIT_COMMITTER_DATE: `@${at} +0000` }),
  },
}).trim()

/** Commit `files` with an exact committer time and return the commit id. */
function publish(files: Record<string, string>, at: number): string {
  for (const [relative, body] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(repo, relative)), { recursive: true })
    fs.writeFileSync(path.join(repo, relative), body)
  }
  git(['add', '--', ...Object.keys(files)])
  git(['commit', '-q', '-m', `publish at ${at}`], at)
  return git(['rev-parse', 'HEAD'])
}

let snapshotCount = 0
/** Freeze `body` the way the supervisor does: raw bytes in a numbered file outside the published tree. */
function sealed(relative: string, body: string): { path: string; snapshot: string } {
  fs.mkdirSync(snapshots, { recursive: true })
  const snapshot = path.join(snapshots, String(snapshotCount++))
  fs.writeFileSync(snapshot, body)
  return { path: relative, snapshot }
}

const SEALED = 2_000_000_000 // the second the receipt was sealed
const sealedAt = new Date(SEALED * 1000 + 300).toISOString() // 300 ms into that second
const probe = (entries: Array<{ path: string; snapshot: string }>, ownCommit?: string) =>
  supersededPublicationPaths({ entries, sealedAt, ownCommit }, repo)

try {
  git(['init', '-q', '-b', 'main'])
  const root = 'analyses/ZZSUPER_2099-01-01'
  publish({
    [`${root}/unchanged.md`]: 'old bytes\n',
    [`${root}/reran.md`]: 'old bytes\n',
    [`${root}/landed.md`]: 'old bytes\n',
    [`${root}/same-second.md`]: 'old bytes\n',
    [`${root}/a[1].md`]: 'old bytes\n',
    [`${root}/a1.md`]: 'old bytes\n',
  }, SEALED - 3600)

  // A first publication: HEAD has nothing at this path, so there are no newer bytes to revert.
  assert.deepEqual(probe([sealed(`${root}/brand-new.md`, 'sealed bytes\n')]), [],
    'a path HEAD does not publish is a first publication, never superseded')

  // The ordinary retry: the receipt updates a file last published BEFORE it was sealed.
  assert.deepEqual(probe([sealed(`${root}/unchanged.md`, 'sealed bytes\n')]), [],
    'updating a file whose published bytes predate the receipt is the normal retry and must proceed')

  // The receipt's own commit landed and the process died before the receipt was cleared. HEAD now equals
  // the snapshot, and that commit IS newer than the receipt. It must still recover.
  publish({ [`${root}/landed.md`]: 'sealed bytes\n' }, SEALED + 5)
  assert.deepEqual(probe([sealed(`${root}/landed.md`, 'sealed bytes\n')]), [],
    'a newer commit that already carries the sealed bytes is this receipt landing, not a supersession')

  // A full run commits its primary snapshot, then seals the RUN_METADATA backfill inside the same second.
  // Committer time has one-second resolution, so that predecessor must not read as "newer".
  publish({ [`${root}/same-second.md`]: 'primary bytes\n' }, SEALED)
  assert.deepEqual(probe([sealed(`${root}/same-second.md`, 'backfilled bytes\n')]), [],
    'a commit in the very second the receipt was sealed is its own predecessor')

  // THE DEFECT: a newer run re-published the path after the receipt was sealed. Retrying would revert it.
  const newer = publish({ [`${root}/reran.md`]: 'newer published bytes\n' }, SEALED + 600)
  assert.deepEqual(probe([
    sealed(`${root}/unchanged.md`, 'sealed bytes\n'),
    sealed(`${root}/reran.md`, 'stale sealed bytes\n'),
  ]), [{ path: `${root}/reran.md`, commit: newer, committedAt: SEALED + 600 }],
  'a path re-published with different bytes after sealing is superseded, and only that path is named')

  // The recorded primary commit is never a newer publication, whatever the clock says.
  assert.deepEqual(probe([sealed(`${root}/reran.md`, 'stale sealed bytes\n')], newer), [],
    "the receipt's own recorded primary commit is excluded outright")

  // A published name may contain glob characters. `a[1].md` was last published before the receipt; only
  // the unrelated `a1.md` is newer. Dating the literal file by the glob match would be a false refusal.
  publish({ [`${root}/a1.md`]: 'newer sibling bytes\n' }, SEALED + 900)
  assert.deepEqual(probe([sealed(`${root}/a[1].md`, 'sealed bytes\n')]), [],
    'pathspecs are literal: a glob-looking file name is never dated by a sibling it happens to match')

  // Recovery publishes every path the probe does NOT name, so the answer must be complete: a report bounded
  // to a few paths would let the rest of the stale bytes through.
  const many = Object.fromEntries(Array.from({ length: 8 }, (_, index) => [`${root}/bulk-${index}.md`, 'old bytes\n']))
  publish(many, SEALED - 1800)
  publish(Object.fromEntries(Object.keys(many).map((relative) => [relative, 'newer published bytes\n'])), SEALED + 1200)
  assert.deepEqual(probe(Object.keys(many).map((relative) => sealed(relative, 'stale sealed bytes\n'))).map((item) => item.path).sort(),
    Object.keys(many).sort(), 'every superseded path is returned, however many there are')

  // A newer commit that REMOVED a path superseded it too: re-adding it would undo a newer publication.
  // A removal that predates the receipt is not newer, so re-publishing that path is the receipt's to do.
  publish({ [`${root}/removed-later.md`]: 'old bytes\n', [`${root}/removed-earlier.md`]: 'old bytes\n' }, SEALED - 900)
  git(['rm', '-q', '--', `${root}/removed-earlier.md`])
  git(['commit', '-q', '-m', 'remove before sealing'], SEALED - 60)
  git(['rm', '-q', '--', `${root}/removed-later.md`])
  git(['commit', '-q', '-m', 'remove after sealing'], SEALED + 1300)
  const removal = git(['rev-parse', 'HEAD'])
  assert.deepEqual(probe([
    sealed(`${root}/removed-later.md`, 'sealed bytes\n'),
    sealed(`${root}/removed-earlier.md`, 'sealed bytes\n'),
  ]), [{ path: `${root}/removed-later.md`, commit: removal, committedAt: SEALED + 1300 }],
  'a path removed by a newer commit is superseded; one removed before sealing is an ordinary republication')

  // A RUN_METADATA backfill receipt commits one file but binds its whole primary snapshot by sha256 alone.
  // Those bound paths are compared by content, with the same newer-commit rule and own-commit exclusion.
  const sha = (body: string) => `sha256:${createHash('sha256').update(body).digest('hex')}`
  const primary = publish({ [`${root}/bound-kept.md`]: 'primary bytes\n', [`${root}/bound-reran.md`]: 'primary bytes\n' }, SEALED)
  const rerun = publish({ [`${root}/bound-reran.md`]: 'a newer rerun\n' }, SEALED + 1400)
  const boundProbe = (ownCommit?: string) => supersededPublicationPaths({
    entries: [], sealedAt, ownCommit,
    boundHashes: { [`${root}/bound-kept.md`]: sha('primary bytes\n'), [`${root}/bound-reran.md`]: sha('primary bytes\n') },
  }, repo)
  assert.deepEqual(boundProbe(primary), [{ path: `${root}/bound-reran.md`, commit: rerun, committedAt: SEALED + 1400 }],
    'a bound-only path is superseded by a newer rerun; one still carrying the bound bytes is not')
  assert.deepEqual(supersededPublicationPaths({
    entries: [sealed(`${root}/bound-kept.md`, 'primary bytes\n')], sealedAt,
    boundHashes: { [`${root}/bound-kept.md`]: sha('a different bound hash is ignored for a snapshot path\n') },
  }, repo), [], 'a path with a sealed snapshot is judged by its snapshot bytes, never twice')

  // commit-run.sh reconciles a push race with a synthetic merge: `commit-tree -p <remote> -p <data commit>`.
  // Those merges are on main all the time. A path carried in by either parent must be attributed, never
  // mistaken for an unreadable newer commit, which would now refuse the whole receipt.
  publish({ [`${root}/merged-data.md`]: 'old bytes\n', [`${root}/merged-remote.md`]: 'old bytes\n' }, SEALED - 700)
  const base = git(['rev-parse', 'HEAD'])
  git(['checkout', '-q', '-b', 'engine-data'])
  const dataCommit = publish({ [`${root}/merged-data.md`]: 'newer data-lane bytes\n' }, SEALED + 1500)
  git(['checkout', '-q', 'main'])
  const remoteCommit = publish({ [`${root}/merged-remote.md`]: 'newer remote bytes\n' }, SEALED + 1510)
  const mergedTree = git(['merge-tree', '--write-tree', remoteCommit, dataCommit])
  const merge = execFileSync('git', ['commit-tree', mergedTree, '-p', remoteCommit, '-p', dataCommit, '-m', 'synthetic data merge'], {
    cwd: repo, encoding: 'utf8', env: {
      ...inherited, GIT_AUTHOR_NAME: 'Test', GIT_AUTHOR_EMAIL: 'test@example.com', GIT_COMMITTER_NAME: 'Test',
      GIT_COMMITTER_EMAIL: 'test@example.com', GIT_AUTHOR_DATE: `@${SEALED + 1520} +0000`, GIT_COMMITTER_DATE: `@${SEALED + 1520} +0000`,
    },
  }).trim()
  git(['update-ref', 'refs/heads/main', merge])
  assert.notEqual(base, merge)
  const mergedAnswer = probe([
    sealed(`${root}/merged-data.md`, 'stale sealed bytes\n'),
    sealed(`${root}/merged-remote.md`, 'stale sealed bytes\n'),
  ])
  assert.deepEqual(mergedAnswer.map((item) => item.path).sort(), [`${root}/merged-data.md`, `${root}/merged-remote.md`],
    'both sides of a synthetic data merge are attributed')
  assert.ok([dataCommit, merge].includes(mergedAnswer.find((item) => item.path.endsWith('merged-data.md'))!.commit),
    'the data-lane side is dated by the commit that carried its bytes')
  // The answer must not depend on how the machine configures git. With `log.diffMerges=combined`, a plain
  // `-m` walk lists no names for that merge, which the doubt rule would refuse at every startup.
  const configured = { GIT_CONFIG_COUNT: process.env.GIT_CONFIG_COUNT, GIT_CONFIG_KEY_0: process.env.GIT_CONFIG_KEY_0, GIT_CONFIG_VALUE_0: process.env.GIT_CONFIG_VALUE_0 }
  Object.assign(process.env, { GIT_CONFIG_COUNT: '1', GIT_CONFIG_KEY_0: 'log.diffMerges', GIT_CONFIG_VALUE_0: 'combined' })
  try {
    assert.deepEqual(probe([
      sealed(`${root}/merged-data.md`, 'stale sealed bytes\n'),
      sealed(`${root}/merged-remote.md`, 'stale sealed bytes\n'),
    ]).map((item) => item.path).sort(), [`${root}/merged-data.md`, `${root}/merged-remote.md`],
    'a machine-level log.diffMerges setting changes nothing')
  } finally {
    for (const [name, value] of Object.entries(configured)) {
      if (value === undefined) delete process.env[name]
      else process.env[name] = value
    }
  }

  // A newer commit can turn a sealed FILE into a directory. git then lists it by its contents (`x.md/y`),
  // never by the sealed name: that is still a newer publication of the path, in a commit of its own.
  publish({ [`${root}/became-directory.md`]: 'old bytes\n', [`${root}/beside.md`]: 'old bytes\n' }, SEALED - 400)
  git(['rm', '-q', '--', `${root}/became-directory.md`])
  git(['commit', '-q', '-m', 'remove the file'], SEALED + 1600)
  const directoryCommit = publish({ [`${root}/became-directory.md/inside.md`]: 'a directory now\n' }, SEALED + 1601)
  const besideCommit = publish({ [`${root}/beside.md`]: 'newer beside bytes\n' }, SEALED + 1602)
  assert.deepEqual(probe([
    sealed(`${root}/became-directory.md`, 'stale sealed bytes\n'),
    sealed(`${root}/beside.md`, 'stale sealed bytes\n'),
  ]).sort((a, b) => a.path.localeCompare(b.path)), [
    { path: `${root}/became-directory.md`, commit: directoryCommit, committedAt: SEALED + 1601 },
    { path: `${root}/beside.md`, commit: besideCommit, committedAt: SEALED + 1602 },
  ], 'a file replaced by a directory is superseded by the commit that created the directory')

  // Anything short of a clean answer throws, so the caller retains and reports the receipt instead of
  // committing on a guess.
  assert.throws(() => supersededPublicationPaths({ entries: [], sealedAt: 'not a date' }, repo),
    /no valid creation time/)
  // The directory must EXIST: a missing cwd fails to spawn at all and never runs git. An existing
  // directory that is not a repository makes git itself fail, which is the case that matters.
  const notARepository = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'not-a-repository-')))
  try {
    assert.throws(() => supersededPublicationPaths({
      entries: [sealed(`${root}/reran.md`, 'x')], sealedAt,
    }, notARepository), (error: any) => /not a git repository/i.test(String(error?.stderr || error?.message)),
    'a git failure is never read as "not superseded"')
  } finally { fs.rmSync(notARepository, { recursive: true, force: true }) }

  console.log('PASS: every path newer bytes were published over after sealing, and only those, is superseded')
} finally {
  fs.rmSync(repo, { recursive: true, force: true })
}
