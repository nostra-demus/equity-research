# Permanent memory Phase 0

This directory freezes the baseline that must exist before a common memory envelope or index is
introduced. It is deliberately read-only with respect to historical research artifacts.

- `catalogue.json` inventories the current stores, schemas, producers, and readers. `observed_count`
  values describe this checkout on 2026-08-21; declared-but-unmounted source stores use `null`.
- `decisions.json` records the accepted identity, bitemporal, retention/access, and append-only
  correction semantics that later schemas must implement.
- `benchmark.json` is a held-out set of questions. Retrieval sees only each question and its declared
  search scope; `answer_key`, evidence paths, and forbidden paths are used only for scoring.
- `baseline-report.json` is the deterministic result of the repository's current folder-and-literal-
  grep style retrieval. It is a measurement, not an adoption gate or a claim about model quality.
- `adapter-baseline.json` is the reviewed lower bound for supported legacy sources and adapted
  events. The CLI refuses a decrease so a wrong root or accidental corpus loss cannot replace a
  healthy projection with an empty or silently smaller database. Increases do not require a refresh.

Run the baseline and its integrity checks from the repository root:

```bash
python3 scripts/memory_baseline.py --check
python3 scripts/test_memory_phase0.py
```

To intentionally refresh the committed report after changing the corpus or fixtures, render the new
JSON, review the diff, and replace `baseline-report.json`. The runner records no wall-clock timings or
generation timestamp, so identical inputs produce identical bytes.
