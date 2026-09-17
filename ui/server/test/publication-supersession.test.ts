process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
// A retained ready-publication receipt is retried at a later startup and commits the OLD bytes frozen when
// it was sealed. If a newer run published the same paths in between, that retry reverts published research
// to stale bytes. supersededPublicationPaths() is the git-facing half of the refusal. It is exercised here
// against a throwaway repository with exact committer times, because the recovery-flow tests run inside the
// real checkout and must never create commits there.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { supersededPublicationPaths } from '../src/launcher'

const repo = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'publication-supersession-')))
const snapshots = path.join(repo, '.snapshots')
const git = (args: string[], at?: number): string => execFileSync('git', args, {
  cwd: repo, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
  env: {
    ...process.env,
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
  const landed = publish({ [`${root}/landed.md`]: 'sealed bytes\n' }, SEALED + 5)
  assert.deepEqual(probe([sealed(`${root}/landed.md`, 'sealed bytes\n')]), [],
    'a newer commit that already carries the sealed bytes is this receipt landing, not a supersession')

  // A full run commits its primary snapshot, then seals the RUN_METADATA backfill inside the same second.
  // Committer time has one-second resolution, so that predecessor must not read as "newer".
  const predecessor = publish({ [`${root}/same-second.md`]: 'primary bytes\n' }, SEALED)
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
  assert.notEqual(landed, predecessor)

  // A published name may contain glob characters. `a[1].md` was last published before the receipt; only
  // the unrelated `a1.md` is newer. Dating the literal file by the glob match would be a false refusal.
  publish({ [`${root}/a1.md`]: 'newer sibling bytes\n' }, SEALED + 900)
  assert.deepEqual(probe([sealed(`${root}/a[1].md`, 'sealed bytes\n')]), [],
    'pathspecs are literal: a glob-looking file name is never dated by a sibling it happens to match')

  // A permanently superseded receipt is re-examined at every startup, before listen(): report a few, stop.
  const many = Object.fromEntries(Array.from({ length: 8 }, (_, index) => [`${root}/bulk-${index}.md`, 'old bytes\n']))
  publish(many, SEALED - 1800)
  publish(Object.fromEntries(Object.keys(many).map((relative) => [relative, 'newer published bytes\n'])), SEALED + 1200)
  assert.equal(probe(Object.keys(many).map((relative) => sealed(relative, 'stale sealed bytes\n'))).length, 5,
    'the report is bounded')

  // Anything short of a clean answer throws, so the caller retains and reports the receipt instead of
  // committing on a guess.
  assert.throws(() => supersededPublicationPaths({ entries: [], sealedAt: 'not a date' }, repo),
    /no valid creation time/)
  assert.throws(() => supersededPublicationPaths({
    entries: [sealed(`${root}/reran.md`, 'x')], sealedAt,
  }, path.join(repo, 'not-a-repository')), undefined, 'a git failure is never read as "not superseded"')

  console.log('PASS: a retained publication receipt is refused once newer bytes were published over its paths')
} finally {
  fs.rmSync(repo, { recursive: true, force: true })
}
