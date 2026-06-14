---
description: Build the screener's track record from the conviction ledger — hit rate, Brier, lock→confirm time, false-discard rate. Refuses to quote metrics until enough checks have resolved (no false confidence, §11/§19). Writes a dated calibration JSON.
argument-hint: (no arguments)
allowed-tools: Read, Bash
---

You build the screener's conviction track record. Execute in order.

1. Run the deterministic aggregator (it reads only the conviction ledger; it never fabricates a metric):

```
python3 scripts/screener_calibrate.py --print
```

It writes `screener/ledger/conviction/<DATE>_conviction_calibration.json` and prints the verdict.

2. Commit per CLAUDE.md §25 via the serialized helper:

```
bash scripts/commit-run.sh "Screener calibration: $(date +%Y-%m-%d)" -- "screener/ledger/conviction/"
```

3. Report, in plain English (§21): the verdict line; if there is enough resolved history — the hit
rate, Brier (lower is better-calibrated), median days from lock to first confirmation, and the
false-discard rate; if not — say exactly how many resolved checks exist vs the floor, and that the
record fills in as ideas hit their dates. Never present a metric the aggregator left null as if it
were measured.

## Hard rule

The aggregator owns the math and the small-N refusal. Do not compute or estimate any metric yourself,
and do not "fill in" a null with a guess — an honest empty track record is the correct output until the
checks resolve.
