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
