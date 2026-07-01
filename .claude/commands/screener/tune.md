---
description: Close the screener feedback loop — read the human feedback ledger (#131 capture) and RECOMMEND bounded rank-weight nudges (scope / source_tier / source reputation), backtest-gated and small-N-refused. Recommend-only; a human applies via the Scoring panel. Writes a dated tuning JSON.
argument-hint: (no arguments)
allowed-tools: Read, Bash
---

You turn captured human feedback into recommended scoring corrections. Execute in order.

1. Run the deterministic consumer (it reads only `screener/ledger/screener_feedback.ndjson` and never
   touches the live weights):

```
python3 scripts/screener_feedback_tune.py --print
```

It writes `screener/ledger/feedback/<DATE>_feedback_tuning.json` and prints the report.

2. Commit the report per CLAUDE.md §25 via the serialized helper:

```
bash scripts/commit-run.sh "Screener feedback tuning: $(date +%Y-%m-%d)" -- "screener/ledger/feedback/"
```

3. Report, in plain English (§21):
   - the status line (`recommendations` / `insufficient_data` / `no_recommendation` / `unvalidated`);
   - if there are live recommendations — each weight nudge as "**<category>**: <current> → <proposed>
     (<N> flags agreed, backtest generalized)", said as what it means ("macro news is scored too high —
     lower it 3 points"), NOT as raw field names;
   - the **backtest** result (did the nudges move held-out flagged items the right way);
   - any **source-reputation** candidate (a source consistently over-scored → consider down-tiering it);
   - the routing backlogs (wrong-company / duplicate counts) as the extraction / dedup work they feed;
   - the **residual** note (whether a chunk of the error is uniform → the LLM title-base, root #1, or the
     global boost — not a per-category weight);
   - the **capture gap** (event / size can't be tuned until #131 snapshots their category label).
   - Finish with the one action a human takes: open the cockpit **Scoring** panel and apply the
     `proposed_weights_patch` if it looks right — the command does NOT apply it.

## Hard rule

The script owns the math and every guardrail (small-N refusal, per-category N + consistency gates,
bounded step, no sign-flip, the train/holdout backtest). Do NOT apply a weight change yourself, do NOT
edit `STATE_DIR/rank-weights.json`, and do NOT "fill in" a null or override a withheld recommendation —
rank weights are a global lever, so applying is always a human decision made in the Scoring panel. An
honest "not enough feedback yet" is the correct output until the ledger fills.
