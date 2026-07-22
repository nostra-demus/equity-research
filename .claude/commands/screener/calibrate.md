---
description: Build the screener's track record from the conviction ledger — hit rate, Brier, lock→confirm time, false-discard rate, and the thesis-integrity gate's verdict distribution. Refuses to quote metrics until enough checks have resolved (no false confidence, §11/§19). Writes a dated calibration JSON.
argument-hint: (no arguments)
allowed-tools: Read, Bash
---

You build the screener's conviction track record. Execute in order.

1. Run the deterministic aggregator (it reads only the conviction ledger + the thesis ledger; it never fabricates a metric):

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

Always ALSO report `integrity_gate_note` and, when `n_integrity_reviewed` > 0, the
`integrity_gate_distribution` counts (how many reviewed theses have a terminal latest integrity verdict
— the adversarial gate rejected them — vs routed Proceed) — this is honest at any N (a tally, not a
rate) so it means something from the very first
review, unlike the floor-gated metrics above. Never present `integrity_gate_hit_rate` as measured — it
is null by design until a review mechanism exists that can check a KILLED thesis's own claims against
what actually happened (no such mechanism exists yet; see `scripts/screener_calibrate.py`'s docstring).

## Hard rule

The aggregator owns the math and the small-N refusal. Do not compute or estimate any metric yourself,
and do not "fill in" a null with a guess — an honest empty track record is the correct output until the
checks resolve.
