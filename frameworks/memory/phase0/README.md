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
- `baseline-report.json` is the deterministic result of the repository's frozen Phase 0 folder-and-
  literal-grep retrieval. Its corpus fingerprint is observational metadata. CI tolerates later
  corpus-byte/file-count drift only while every benchmark row, category result, metric, method, and
  policy outcome remains identical; any scored drift requires an intentional reviewed refresh.
- `adapter-baseline.json` is the reviewed lower bound for supported legacy sources and adapted
  events. The CLI refuses a decrease so a wrong root or accidental corpus loss cannot replace a
  healthy projection with an empty or silently smaller database. Increases do not require a refresh.

Run the baseline and its integrity checks from the repository root:

```bash
python3 scripts/memory_baseline.py --check
python3 scripts/test_memory_phase0.py
```

To intentionally refresh the committed report after changing fixtures or after corpus growth changes
any scored outcome, render the new JSON, review the diff, and replace `baseline-report.json`. Corpus
growth that leaves all scored outcomes unchanged does not rewrite the frozen observation. The runner
records no wall-clock timings or generation timestamp, so identical inputs produce identical bytes.
