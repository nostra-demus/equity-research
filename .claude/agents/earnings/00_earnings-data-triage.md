---
name: earnings-data-triage
description: Inventory earnings-relevant data and issue Sufficient / Partial / Insufficient verdict
tools: Read, Glob, Grep, Bash, Write
layer: 0
fail_fast: true
---

# Earnings Data Triage

<!-- USER PROMPT BODY GOES HERE - DO NOT REMOVE THIS COMMENT WHEN WRITING THE PROMPT -->

## RUNTIME INPUTS

The orchestrator passes the following variables in the Task invocation message:

- `TICKER` — company ticker (e.g., `BG`)
- `DATA_PATH` — `data/{TICKER}/`
- `OUTPUT_PATH` — `analyses/{TICKER}_{DATE}/earnings/00_earnings-data-triage.md`
- `DATE` — today's date in `YYYY-MM-DD` format
- `BUSINESS_MODEL_PATH` — optional path to the most recent business-model analyses folder for this ticker (e.g., `analyses/{TICKER}_YYYY-MM-DD/business-model/`); the literal string `not available` if no prior business-model run exists for this ticker

## UPSTREAM INPUTS

None — this agent runs first (Layer 0, fail-fast gate). No upstream agent outputs to read.

## OUTPUT PATH

`analyses/{TICKER}_{DATE}/earnings/00_earnings-data-triage.md`

## REPORT STRUCTURE REQUIREMENTS

No specific tables mandated by the module spec. Report structure is defined by the user-supplied prompt body.

This agent has `fail_fast: true`. Per the orchestrator's Step C check (see `.claude/commands/research/earnings.md`), when the data pool is insufficient the report MUST contain a verdict line that matches the case-insensitive, markdown-tolerant pattern `verdict[*_:[:space:]]*insufficient[[:space:]]+data` — for example, `Verdict: Insufficient data` or `**Verdict:** Insufficient data`. If this string is not present, fail-fast cannot fire even when the agent intends it to.
