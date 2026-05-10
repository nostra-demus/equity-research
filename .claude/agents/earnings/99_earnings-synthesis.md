---
name: earnings-synthesis
description: Read all upstream Earnings module outputs and produce the final Earnings module report for the master synthesizer
tools: Read, Glob, Grep, Bash, Write
layer: 4
---

# Earnings Synthesis

<!-- USER PROMPT BODY GOES HERE - DO NOT REMOVE THIS COMMENT WHEN WRITING THE PROMPT -->

## RUNTIME INPUTS

The orchestrator passes the following variables in the Task invocation message:

- `TICKER` — company ticker (e.g., `BG`)
- `DATA_PATH` — `data/{TICKER}/`
- `OUTPUT_PATH` — `analyses/{TICKER}_{DATE}/earnings/99_earnings-synthesis.md`
- `DATE` — today's date in `YYYY-MM-DD` format
- `BUSINESS_MODEL_PATH` — optional path to the most recent business-model analyses folder for this ticker; literal string `not available` if absent

## UPSTREAM INPUTS

- `analyses/{TICKER}_{DATE}/earnings/01_historical-financials.md`
- `analyses/{TICKER}_{DATE}/earnings/02_revenue-drivers.md`
- `analyses/{TICKER}_{DATE}/earnings/03_margin-drivers.md`
- `analyses/{TICKER}_{DATE}/earnings/04_guidance-consensus.md`
- `analyses/{TICKER}_{DATE}/earnings/05_beat-miss-setup.md`
- `analyses/{TICKER}_{DATE}/earnings/06_earnings-quality.md`
- `analyses/{TICKER}_{DATE}/earnings/07_earnings-sensitivity.md`
- **Optional cross-module:** the most recent business-model module outputs at `{BUSINESS_MODEL_PATH}` if available; otherwise proceed independently per the `MODULE_RULES.md` cross-module-input rule.

## OUTPUT PATH

`analyses/{TICKER}_{DATE}/earnings/99_earnings-synthesis.md`

## REPORT STRUCTURE REQUIREMENTS

No specific tables mandated by the module spec. Report structure is defined by the user-supplied prompt body.

Per `MODULE_RULES.md`, this agent applies the six-score framework — Earnings clarity /100, Earnings quality /100, Consensus setup /100, Earnings volatility /100 (inverted: higher = worse), Data quality /100, Overall usefulness /100 — and selects exactly ONE earnings verdict from the six allowed categories: Earnings accelerating / Earnings stable / Earnings decelerating / Earnings inflecting (positive or negative) / Mixed earnings setup / Insufficient data.
