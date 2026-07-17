// "What changed since the last version" — the SERVER-side authority over a run's own version history.
//
// WHY THIS EXISTS. The engine commits every run to git (`analyses/**` goes straight to main, CLAUDE.md
// §25), and a re-run writes IN PLACE into the same dated folder — so the previous decision record is
// overwritten on disk and git is the ONLY witness that it ever existed. The cockpit could not reach it:
// asked "what changed after analyzing data?", the chat correctly answered that it holds one snapshot and
// cannot diff against a prior version. That refusal was the system working (§3: no source = no claim).
// This module hands it the second snapshot. It does not loosen the closed book — chat still has no tools.
//
// POSTURE (mirrors intake.ts / data-needs.ts): read-only, launches nothing, writes nothing, never throws,
// and returns a STATE rather than a guess. "Nothing changed", "nothing to compare against" and "not
// committed yet" are three DIFFERENT answers and must never collapse into one — collapsing them is how a
// diff comes to silently compare the wrong two things, which is worse than showing no diff at all.
//
// Exit 0 + empty is the dangerous case, not the error case: `git log` on a never-committed path exits 0
// with empty stdout, exactly like a path with no changes. Only `ls-files --error-unmatch` tells them
// apart. Likewise `$HOME` is itself a git repo on this machine, so an unanchored query there answers
// exit 0 + empty — a silent "nothing changed" about the wrong repository.
import { execFile } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { promisify } from 'node:util'
import { ANALYSES_DIR, REPO_ROOT } from './config'
import { diffDecisionRecords, headlineWithDate, type RecordDiff } from './run-diff'

const execFileAsync = promisify(execFile)

// async execFile ONLY — NEVER execFileSync. Node is single-threaded and this runs on the same event loop
// as the live SSE streams; a sync fork stalls the keep-alives and the cockpit reads that as "System
// offline" (see the same rule stated verbatim at server.ts:69-72). Do not "simplify" this to sync.
const GIT_OPTS = { cwd: REPO_ROOT, timeout: 15_000, maxBuffer: 8_000_000, encoding: 'utf8' as const }
const git = (args: string[]) => execFileAsync('git', args, GIT_OPTS)

/**
 * Research-only in v1, and deliberately narrow: this is BOTH the shape barrier and the CodeQL taint
 * sanitizer for the path + git-argv sinks below. A swarm's runsRoot gets its own regex when a second
 * swarm needs this (CLAUDE.md §26) — until then a non-analyses root returns null (fail closed).
 */
export const RUN_ROOT_RE = /^analyses\/[A-Z0-9.\-]{1,15}_\d{4}-\d{2}-\d{2}$/

export interface VersionRef {
  rev: string // full sha, or 'working-tree'
  shortRev: string // 7 chars, or 'working tree'
  date: string // YYYY-MM-DD
  subject: string // the commit subject VERBATIM — the engine's own account of WHY ('' for the working tree)
  pathAtRev: string // repo-relative path AT THAT REV (rename-aware)
  status?: string // the name-status letter at that rev: 'A' | 'M' | 'R099' | …
  renameFrom?: string // for an R status, the path this rev renamed FROM — the only licence to change folder
  uncommitted?: true
}

export interface WhatChangedCompared {
  state: 'compared'
  runRoot: string
  prev: VersionRef
  cur: VersionRef
  versionsFound: number // "found" — --follow is best-effort; NEVER "the complete history"
  renamedFrom?: string
  diff: RecordDiff
  memo: { state: 'unchanged' | 'changed' | 'added' | 'unknown'; note?: string }
}

export type NoneReason =
  | 'first_version'
  | 'untracked'
  | 'not_committed'
  | 'no_repo'
  | 'prior_unreadable'
  | 'unavailable'

export interface WhatChangedNone {
  state: 'first_version' | 'no_history'
  runRoot: string
  cur: VersionRef | null
  reason: NoneReason
  detail: string // the exact honest sentence both the UI and the chat render
  versionsFound: number
}

export type WhatChangedRead = WhatChangedCompared | WhatChangedNone

const none = (runRoot: string, reason: NoneReason, detail: string, cur: VersionRef | null = null, versionsFound = 0): WhatChangedNone => ({
  state: reason === 'first_version' ? 'first_version' : 'no_history',
  runRoot,
  cur,
  reason,
  detail,
  versionsFound,
})

const posixDirname = (p: string): string => {
  const i = p.lastIndexOf('/')
  return i <= 0 ? '' : p.slice(0, i)
}

// THE RULE for `--follow -M --name-status`: the path at a commit is the LAST tab-separated field of its
// name-status line. `R099 <old> <new>` -> <new>; `A <path>` / `M <path>` -> <path>. The older commit then
// carries its own (older) path on its own line. Reading an old rev at the CURRENT path exits 128
// ("path … exists on disk, but not in …") — which is exactly what breaks on renamed runs.
function parseFollowLog(stdout: string): VersionRef[] {
  const out: VersionRef[] = []
  for (const chunk of stdout.split('\x01')) {
    if (!chunk.trim()) continue
    const lines = chunk.split('\n')
    const [rev, aI, ...subjParts] = (lines[0] || '').split('\x1f')
    const status = lines.slice(1).find((l) => l.trim())
    if (!rev || !status) continue
    const fields = status.split('\t')
    const pathAtRev = (fields[fields.length - 1] || '').trim()
    if (!pathAtRev) continue
    const letter = (fields[0] || '').trim()
    out.push({
      rev,
      shortRev: rev.slice(0, 7),
      date: (aI || '').slice(0, 10),
      subject: subjParts.join('\x1f').trim(),
      pathAtRev,
      status: letter,
      // `R099 <old> <new>` — <old> is the middle field, and the ONLY evidence that a folder change is a
      // real rename rather than a similarity guess.
      ...(letter.startsWith('R') && fields.length >= 3 ? { renameFrom: fields[1].trim() } : {}),
    })
  }
  return out // newest first
}

// `--follow -M` is RENAME DETECTION, and rename detection is CONTENT-SIMILARITY based — not a guarantee.
// Left alone it will happily walk out of this run's folder into a different run's folder whose record
// merely looks similar, and hand that back as "the previous version of this run". Proven reachable: a
// near-identical fixture followed from one run folder into another, reporting 3 versions and a phantom
// rename. It does NOT happen on today's real EMAAR history — which is exactly why it would be found late
// and debugged as data corruption rather than as a diff bug.
//
// Two independent guards, because they refuse different things:
//
//  (1) THE RENAME CHAIN (correctness). Walking newest -> oldest, the folder may only change across an
//      adjacent pair when the NEWER revision's own name-status is `R <old> <new>` with <old> equal to the
//      older revision's path. That is git telling us a rename happened, rather than us inferring one from
//      a resemblance. The real EMAR -> EMAAR reconciliation (#240) records exactly that (`R099`), so it
//      is kept; a similarity guess has no R line and is cut.
//
//  (2) THE RUN DATE (semantics). A run's identity is its date. Re-labelling the ticker keeps the same run
//      (analyses/EMAR_2026-07-03 -> analyses/EMAAR_2026-07-03). A different date is a different data
//      VINTAGE — a different analysis, not a new version of this one — so even a genuine `git mv` across
//      dates must not be presented here. That comparison is run history; it has its own name and its own
//      surface, and conflating the two is a §20 bad-extraction error in UI form.
//
// The list is ordered newest-first, so a violation truncates the tail rather than dropping a middle.
function sameRunOnly(versions: VersionRef[], runRoot: string): VersionRef[] {
  const m = /_(\d{4}-\d{2}-\d{2})$/.exec(runRoot)
  const dateSuffix = m ? `_${m[1]}` : null
  const out: VersionRef[] = []
  for (let i = 0; i < versions.length; i++) {
    const v = versions[i]
    if (dateSuffix && !posixDirname(v.pathAtRev).endsWith(dateSuffix)) break // guard (2)
    out.push(v)
    const next = versions[i + 1]
    if (!next) break
    if (posixDirname(next.pathAtRev) === posixDirname(v.pathAtRev)) continue // same folder — fine
    if (v.renameFrom && v.renameFrom === next.pathAtRev) continue // guard (1): git says it IS a rename
    break // a folder change with no rename evidence — the chain ends here
  }
  return out
}

/** blob sha at a rev, or null when the path did not exist there. */
async function blobAt(rev: string, relPath: string): Promise<string | null> {
  try {
    const { stdout } = await git(['-C', REPO_ROOT, 'rev-parse', '--verify', '--quiet', `${rev}:${relPath}`])
    return stdout.trim() || null
  } catch {
    return null // exit 1 = absent at that rev
  }
}

/** blob sha of an on-disk file (git's own filters applied, so it is comparable to a committed blob). */
async function blobOnDisk(abs: string): Promise<string | null> {
  try {
    const { stdout } = await git(['-C', REPO_ROOT, 'hash-object', '--', abs])
    return stdout.trim() || null
  } catch {
    return null
  }
}

function parseRecord(raw: string): Record<string, unknown> | null {
  try {
    const v = JSON.parse(raw)
    // matches standingRunDir's object guard — an array or a primitive is not a decision record
    return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : null
  } catch {
    return null
  }
}

/**
 * The version-to-version comparison for ONE run's decision_record.json.
 *
 * Returns null when there is no run / no record on disk / the CURRENT record is unreadable — the decision
 * surfaces are already broken in that case and reporting it is not this view's job. Otherwise a STATE.
 *
 * Takes a runRoot, NEVER a bare ticker: both callers already hold a resolved run root, and re-resolving
 * here would let this block describe a different run than the surrounding context.
 */
export async function readWhatChanged(args: { runRoot: string; verdictField?: string | null }): Promise<WhatChangedRead | null> {
  const { runRoot } = args
  const callField = args.verdictField || 'decision'

  // ---- Barrier 1: shape (also the honest research-only gate) ----
  if (!RUN_ROOT_RE.test(runRoot)) return null

  // ---- Barrier 2: containment, INLINE, immediately before the fs/git sinks, against a CONSTANT root
  // derived from config (never from the request). CodeQL recognizes js/path-injection sanitization only
  // AT the sink, never behind a helper — so this stays here, expanded, in every function that needs it.
  const absRun = path.resolve(REPO_ROOT, runRoot)
  if (absRun !== ANALYSES_DIR && !absRun.startsWith(ANALYSES_DIR + path.sep)) return null
  const absRecord = path.resolve(absRun, 'decision_record.json')
  if (!absRecord.startsWith(ANALYSES_DIR + path.sep)) return null
  const absMemo = path.resolve(absRun, 'memo.md')
  if (!absMemo.startsWith(ANALYSES_DIR + path.sep)) return null

  // ---- the current record must be readable, or there is nothing to compare FROM ----
  let curRaw: string
  try {
    curRaw = fs.readFileSync(absRecord, 'utf8')
  } catch {
    return null
  }
  const curRec = parseRecord(curRaw)
  if (!curRec) return null

  const relRecord = path.relative(REPO_ROOT, absRecord).split(path.sep).join('/')
  const relMemo = path.relative(REPO_ROOT, absMemo).split(path.sep).join('/')

  try {
    // ---- 1. anti-wrong-repo assert. `$HOME` is itself a git repo; an unanchored query there answers
    // exit 0 + empty = a silent "nothing changed" about the wrong repository. ----
    const top = (await git(['-C', REPO_ROOT, 'rev-parse', '--show-toplevel'])).stdout.trim()
    if (!top || fs.realpathSync(top) !== fs.realpathSync(REPO_ROOT)) {
      return none(runRoot, 'no_repo', "Version history isn't available here — this copy of the dossier isn't in git.")
    }

    // ---- 2. an initialised repo with ZERO commits passes #1 and fails here. "Repo exists" is not enough.
    // `--quiet` makes it exit 1 with NO stderr, so this must be caught HERE — the generic catch below
    // cannot tell that silent failure apart from a real fault and would report 'unavailable'. ----
    try {
      await git(['-C', REPO_ROOT, 'rev-parse', '--verify', '--quiet', 'HEAD'])
    } catch {
      return none(runRoot, 'no_repo', "Version history isn't available here — this copy of the dossier has no commits yet.")
    }

    // ---- 3. tracked? THE probe. `git log` exits 0 + EMPTY for an untracked path, exactly like a tracked
    // path with no commits — this is the only thing that separates "never committed" from "unchanged". ----
    try {
      await git(['-C', REPO_ROOT, 'ls-files', '--error-unmatch', '--', relRecord])
    } catch {
      return none(runRoot, 'untracked', "This run hasn't been committed yet — there's no recorded version to compare against.")
    }

    // ---- 4. the version list + the path at each rev, in one call. --follow is MANDATORY: without it a
    // renamed run (EMAR -> EMAAR, #240) reports 1 version — a false negative. ----
    const { stdout } = await git([
      '-C', REPO_ROOT,
      'log', '--follow', '-M', '--name-status', '--format=%x01%H%x1f%aI%x1f%s',
      '--', relRecord,
    ])
    const versions = sameRunOnly(parseFollowLog(stdout), runRoot)
    if (versions.length === 0) {
      return none(runRoot, 'not_committed', "This run isn't committed on the checked-out branch yet.")
    }

    // ---- 5. current = the WORKING-TREE bytes (what the cockpit is actually showing).
    //         previous = the newest committed version whose blob differs from it.
    // This dissolves the write-then-commit race with no ordering assumption: the engine writes the file
    // and commit-run.sh commits it moments later, so there is a real window where HEAD is stale. There is
    // no window in which this view is WRONG — only one in which it honestly says "not yet committed". It
    // is also why no analyses/ watcher and no new SSE event are needed: the diff is correct on write. ----
    const diskSha = await blobOnDisk(absRecord)
    const headSha = await blobAt(versions[0].rev, versions[0].pathAtRev)
    const dirty = !!diskSha && !!headSha && diskSha !== headSha

    let prevRef: VersionRef | undefined
    let curRef: VersionRef
    if (dirty) {
      prevRef = versions[0] // the newest COMMIT — never versions[1]; the user is looking at the working tree
      curRef = {
        rev: 'working-tree',
        shortRev: 'working tree',
        date: '',
        subject: '',
        pathAtRev: relRecord,
        uncommitted: true,
      }
    } else {
      prevRef = versions[1]
      curRef = versions[0]
    }

    if (!prevRef) {
      return none(
        runRoot,
        'first_version',
        'This is the first recorded version of this dossier. There is nothing to compare it against yet.',
        curRef,
        versions.length,
      )
    }

    // ---- 6. read the previous record AT ITS OWN pathAtRev (a renamed run breaks otherwise) ----
    let prevRaw: string
    try {
      prevRaw = (await git(['-C', REPO_ROOT, 'show', `${prevRef.rev}:${prevRef.pathAtRev}`])).stdout
    } catch {
      return none(
        runRoot,
        'prior_unreadable',
        `The previous version on record (${prevRef.shortRev}, ${prevRef.date}) can't be read. No comparison is shown.`,
        curRef,
        versions.length,
      )
    }
    const prevRec = parseRecord(prevRaw)
    if (!prevRec) {
      // NEVER silently fall back to the version before it — that compares the wrong two things while
      // looking perfectly correct. Name the rev and stop.
      return none(
        runRoot,
        'prior_unreadable',
        `The previous version on record (${prevRef.shortRev}, ${prevRef.date}) isn't valid JSON, so it can't be compared. No comparison is shown.`,
        curRef,
        versions.length,
      )
    }

    // ---- 7. memo: blob-SHA compare only. Never transfer the body — memo.md moved ~250 lines in the real
    // EMAAR re-run; it would blow the chat budget and bury the answer. ----
    const prevMemoRel = posixDirname(prevRef.pathAtRev) + '/memo.md'
    const prevMemoSha = await blobAt(prevRef.rev, prevMemoRel)
    const curMemoSha = fs.existsSync(absMemo) ? await blobOnDisk(absMemo) : null
    let memo: WhatChangedCompared['memo']
    if (prevMemoSha && curMemoSha) memo = prevMemoSha === curMemoSha ? { state: 'unchanged' } : { state: 'changed' }
    else if (!prevMemoSha && curMemoSha) memo = { state: 'added', note: 'the memo did not exist in the previous version' }
    else if (prevMemoSha && !curMemoSha) memo = { state: 'unknown', note: 'the memo is on record in the previous version but not on disk now' }
    else memo = { state: 'unknown', note: 'memo not on record' } // a missing witness is NOT "unchanged"

    const diff = diffDecisionRecords(prevRec, curRec, { verdictField: callField })
    diff.headline = headlineWithDate(diff, callField, prevRef.date)

    // The record diff cannot see the memo, so 'identical' means "the RECORD is identical" — but the
    // headline it produces says "Nothing changed.", which a reader takes to mean everything. When the memo
    // was rewritten under an unchanged record that sentence is simply false, and the memo is the artefact
    // most people actually read. Reconcile it here, where both witnesses are in hand.
    if (diff.verdict === 'identical' && (memo.state === 'changed' || memo.state === 'added')) {
      diff.headline = 'The call and the record are unchanged — but the memo was rewritten.'
      diff.subline = `Every number is the same as ${prevRef.date}. The write-up around them is not.`
    }

    const prevDir = posixDirname(prevRef.pathAtRev)
    const curDir = posixDirname(curRef.pathAtRev)

    return {
      state: 'compared',
      runRoot,
      prev: prevRef,
      cur: curRef,
      versionsFound: versions.length,
      ...(prevDir !== curDir ? { renamedFrom: prevDir } : {}),
      diff,
      memo,
    }
  } catch (e: any) {
    // git absent (ENOENT), timeout, maxBuffer blown, or a repo with zero commits (#2 above).
    const msg = String(e?.message || '')
    if (/not a git repository|ambiguous argument 'HEAD'|unknown revision/i.test(msg)) {
      return none(runRoot, 'no_repo', "Version history isn't available here — this copy of the dossier isn't in git.")
    }
    return none(runRoot, 'unavailable', "Couldn't read the version history for this run.", null, 0)
  }
}

// ---------------------------------------------------------------------------------------------------
// The chat CONTEXT block. Deterministic — no LLM summarisation of the delta. This feature exists BECAUSE
// the model correctly refused to fabricate; handing it prose to paraphrase would reintroduce the very
// thing it was right to refuse. One source of truth, so the chat and the panel can never disagree.
// ---------------------------------------------------------------------------------------------------

const fmtCell = (v: string | number | null): string => (v === null ? '—' : String(v))

export function whatChangedMarkdown(read: WhatChangedRead): string {
  if (read.state !== 'compared') {
    return [
      `Version history for this run (${read.runRoot}): no comparison is available.`,
      '',
      read.detail,
      '',
      'Do not infer what changed by reading the current snapshot — say plainly that there is no recorded ' +
        'previous version to compare against.',
    ].join('\n')
  }

  const { diff, prev, cur, versionsFound, runRoot, memo } = read
  const lines: string[] = []
  lines.push(
    `Comparing THIS run's decision record (${runRoot}) against its own previous recorded version.`,
    `This is a version-to-version comparison of ONE run — not a comparison with a different dated run folder.`,
    `Versions found: ${versionsFound} (a rename can break the chain, so this may not be the complete history).`,
    '',
    `- Previous: ${prev.shortRev} · ${prev.date}${prev.subject ? ` · "${prev.subject}"` : ''}`,
    `- Current:  ${cur.shortRev}${cur.date ? ` · ${cur.date}` : ''}${cur.subject ? ` · "${cur.subject}"` : ''}${cur.uncommitted ? ' (on disk, NOT yet committed)' : ''}`,
  )
  if (read.renamedFrom) lines.push(`- Note: this run was renamed from ${read.renamedFrom}.`)
  lines.push('', `VERDICT: ${diff.headline}`)
  if (diff.subline) lines.push(diff.subline)
  if (diff.tailSummary) lines.push(diff.tailSummary)

  // Tier 1 — every anchor, moved or not. An unchanged anchor is evidence.
  lines.push('', `THE CALL (Tier 1)${diff.hasInverted ? ' — higher is better unless marked ⌄' : ''}`)
  lines.push('| Anchor | Previous | Current | Moved? |', '|---|---|---|---|')
  for (const a of diff.anchors) {
    const mark = a.polarity === 'lower_better' || a.polarity === 'ambiguous' ? ' ⌄' : ''
    lines.push(`| ${a.label}${mark} | ${fmtCell(a.prev)} | ${fmtCell(a.cur)} | ${a.moved ? 'YES' : 'no'} |`)
    if (a.note) lines.push(`| | | | ${a.note} |`)
  }
  for (const m of diff.modules) {
    const p = m.scoreReadable ? fmtCell(m.prevScore) : 'unknown'
    const c = m.scoreReadable ? fmtCell(m.curScore) : 'unknown'
    lines.push(`| module score · ${m.module} | ${p} | ${c} | ${m.scoreMoved ? 'YES' : 'no'} |`)
  }

  // Tier 2 — set comparison, not a count. red_flags stayed 6 -> 6 in the real EMAAR pair while one entry
  // was swapped; a length check misses it entirely.
  if (diff.lists.length) {
    lines.push('', 'THE EVIDENCE (Tier 2) — set comparison, not a count')
    for (const l of diff.lists) {
      lines.push(`- ${l.field}: ${l.prevCount} → ${l.curCount}${l.note ? ` (${l.note})` : ''}`)
      for (const t of l.added) lines.push(`  ADDED:    ${t}`)
      for (const t of l.removed) lines.push(`  REMOVED:  ${t}`)
      for (const r of l.reworded) lines.push(`  REWORDED: ${r.cur}`)
    }
  }

  if (diff.prose.length) {
    lines.push('', 'THE WORDING (Tier 3) — reworded; no number moved')
    lines.push(diff.prose.map((p) => p.label).join(', ') + '.')
  }
  lines.push('', `Memo: ${memo.state}${memo.note ? ` (${memo.note})` : ''}.`)
  return lines.join('\n')
}
