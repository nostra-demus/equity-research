# Permanent memory Phase 0

This directory freezes the baseline that must exist before a common memory envelope or index is
introduced. It is deliberately read-only with respect to historical research artifacts.

- `catalogue.json` inventories the current stores, schemas, producers, and readers. `observed_count`
  values describe the 2026-08-21 snapshot and are enforced as non-shrinking lower bounds; ordinary
  corpus growth does not require rewriting history. These counts are a coarse aggregate preservation
  signal, while a separate coverage check requires every current artifact to match a declared store.
  Declared-but-unmounted source stores use `null`.
- `decisions.json` records the accepted identity, bitemporal, retention/access, and append-only
  correction semantics that later schemas must implement.
- `benchmark.json` is a held-out set of questions. Retrieval sees only each question and its declared
  search scope; `answer_key`, evidence paths, and forbidden paths are used only for scoring.
- `corpus-manifest.json` freezes the corpus itself: every ranked file, pinned to its Git blob id.
  Every search root the benchmark names sits inside a lane the engine publishes to continuously and
  without CI (CLAUDE.md §25), so ranking those folders as they stand made an ordinary research
  commit able to move a score and turn `main` red — which, because branches must be up to date,
  blocked every open PR (issue #477). The manifest is the fix: the file list AND the bytes are
  pinned, so a later publish into the same run folder is simply not part of the corpus. Worktree
  bytes are used while they still hash to the pinned blob; a file rewritten since the freeze is read
  back out of Git history. The freeze covers the full file set — answers and distractors both —
  because pinning only the evidence files would strip the distractors and inflate every score.
- `baseline-report.json` is the deterministic result of the repository's frozen Phase 0 folder-and-
  literal-grep retrieval, and records under `method.corpus_manifest_sha256` which freeze produced it.
  Its corpus fingerprint is observational metadata. CI tolerates a corpus-byte/file-count difference
  only while every benchmark row, category result, metric, method, and policy outcome remains
  identical; any scored drift requires an intentional reviewed refresh.
- `adapter-baseline.json` is the reviewed lower bound for supported legacy sources and adapted
  events. The CLI refuses a decrease so a wrong root or accidental corpus loss cannot replace a
  healthy projection with an empty or silently smaller database. Increases do not require a refresh.

## The coverage check gates publication, in two places

`scripts/validate_data_catalogue.py` is that separate coverage check. Autonomous publication runs it
twice, on the same catalogue bytes and the same glob rules, so the two cannot disagree about the paths a
publication proposes. (The second run judges the WHOLE index, so it can additionally fail on unrelated
uncatalogued data that publication did not propose.)

1. **Before sealing (`--paths`).** The cockpit supervisor freezes a publication's exact path list into
   an immutable, digest-signed ready receipt. A sealed list the catalogue rejects can never publish,
   and a retained receipt is retried at every startup. On 2026-09-16/17 one such receipt crash-looped
   the engine overnight. So the supervisor asks first: an uncovered path fails the live run, where
   Activity shows it, and no receipt is written.
2. **After staging (`--index`, then `--tree`).** `scripts/commit-run.sh` repeats the check on the exact
   Git index and on the commit it is about to push.

`/research:full` and `/research:rerun` publish the whole run root, so every untracked, non-ignored file
in a run root is swept into the path list. **A new file written into a run root therefore needs one of
three deliberate homes, decided when it is introduced:**

- **Research data or an audit artifact** — add its path to a store in `catalogue.json`. Check what it
  contains first: the repository is public, so a trace that records who acted (an operator's login or
  email, free text they typed) needs redacting before it is catalogued.
- **Supervisor control state** (a marker the engine reads and clears, never evidence) — add its name to
  `SUPERVISOR_CONTROL_MARKERS` in `ui/server/src/launcher.ts`, which keeps it out of every snapshot, in
  every data root. A test fails if the catalogue ever lists one of those names in a research run root,
  because dropping a catalogued file would silently withhold data.
- **Local-only scratch** (a lock file, a temp file) — add it to `.gitignore`, which keeps it out of the
  sweep. A retained lock beside a ledger counts: `/screener:signal` and `/screener:handoff` publish all of
  `screener/ledger/`.

In a store that lists exact file names — a research run root, `analyses/<RUN>/` — a file with none of
the three is refused before sealing, by name. That is the intended failure: it surfaces the missing
decision instead of hiding the file or publishing it by accident.

**That protection stops at a blanket glob.** `commodity/runs/**`, `screener/runs/**`,
`analyses/provider-parity/**` and `analyses/*/_pool_extracts/**` accept ANY file name, so under those
roots the coverage check has nothing to refuse: whatever is swept is published. There the
control-marker list and `.gitignore` are the only guards, and a new file needs the same three-way
decision made by hand. `scripts/test_commit_run.py` pins this gap so it stays a known property.

Run the baseline and its integrity checks from the repository root:

```bash
python3 scripts/memory_baseline.py --check
python3 scripts/test_memory_phase0.py
```

`--check` also prints how far the live search roots have moved from the freeze (files added, gone, or
rewritten). That line is reported, never failed: publishing into those folders is exactly what the
engine is supposed to do. It exists so a corpus that has aged out of usefulness is visible rather
than silently forgotten.

To intentionally refresh the committed report after changing fixtures or the ranker, render the new
JSON, review the diff, and replace `baseline-report.json`. The runner records no wall-clock timings
or generation timestamp, so identical inputs produce identical bytes.

Re-freezing the corpus is a separate, deliberate act — do it when the pinned snapshot no longer
represents the repository, not to clear a red check:

```bash
python3 scripts/memory_baseline.py --render-manifest > frameworks/memory/phase0/corpus-manifest.json
python3 scripts/memory_baseline.py > frameworks/memory/phase0/baseline-report.json   # review this diff
```

The refresh reads the search roots as they stand and refuses to freeze bytes that are not committed,
so run it on a clean checkout. Re-rendering the manifest re-opens every score to movement, which is
the point: the scored diff is what gets reviewed.
