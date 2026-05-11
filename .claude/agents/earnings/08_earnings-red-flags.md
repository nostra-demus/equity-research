---
name: earnings-red-flags
description: Surfaces earnings-specific red flags not already covered by other earnings agents — accounting policy changes, deferred revenue dynamics, receivables/inventory channel risk, segment reporting changes, working capital anomalies, off-balance-sheet items, and other earnings-quality concerns. Each flag scored 0-100 (higher = worse). Modeled on the business-model red-flags-sweep agent.
tools: Read, Glob, Grep, Bash
layer: 3
---

# Earnings Red Flags

<!-- USER PROMPT BODY GOES HERE - DO NOT REMOVE THIS COMMENT WHEN WRITING THE PROMPT -->

## RUNTIME INPUTS

This agent receives via the orchestrator's Task message:

- `TICKER` — company ticker
- `DATA_PATH` — `data/{TICKER}/`
- `OUTPUT_PATH` — `analyses/{TICKER}_{DATE}/earnings/08_earnings-red-flags.md`
- `DATE` — today's date (`YYYY-MM-DD`)
- `BUSINESS_MODEL_PATH` — path to the most recent business-model run for this ticker, or the literal string `not available` if no prior business-model run exists
- `UPSTREAM_INPUTS` — see UPSTREAM INPUTS section below

## UPSTREAM INPUTS

Required (must be present and readable):

- `analyses/{TICKER}_{DATE}/earnings/01_historical-financials.md`
- `analyses/{TICKER}_{DATE}/earnings/02_revenue-drivers.md`
- `analyses/{TICKER}_{DATE}/earnings/03_margin-drivers.md`
- `analyses/{TICKER}_{DATE}/earnings/06_earnings-quality.md`

Cross-module (optional, only if `BUSINESS_MODEL_PATH` is not the literal string `not available`):

- `{BUSINESS_MODEL_PATH}/12_red-flags-sweep.md` — business-model red flags, used for cross-reference so this agent does NOT duplicate them. If `BUSINESS_MODEL_PATH` is `not available`, proceed independently and state so in the report per `MODULE_RULES.md` cross-module-input rule.

## OUTPUT PATH

`analyses/{TICKER}_{DATE}/earnings/08_earnings-red-flags.md`

## REPORT STRUCTURE REQUIREMENTS

The agent's analytical prompt body (to be filled in by the user) MUST produce output containing these sections, in this order:

1. **`## 1. Already Covered Upstream`** — a table summarizing which red flags are already covered by upstream earnings agents (00–07) and, where available, the business-model `12_red-flags-sweep.md`. New flags must NOT duplicate these.
2. **`## 2. New Red Flags`** — a table of NEW flags surfaced by this agent. Required columns: Red Flag, Why It Matters, Evidence (with `[Source, Period, Page]` citation), Severity (0–100, higher = worse).
3. **`## 3. Most Severe New Flag`** — narrative explanation of the highest-severity new flag and why it matters for next-12-months earnings.
4. **`## 4. Cross-Cutting Patterns`** — narrative identifying patterns that emerge across multiple flags (e.g., disclosure quality erosion, working capital deterioration, recurring "one-off" items, segment-reporting changes).

End with the standard chat-confirmation block in the same format used by other earnings agents:

```
Agent: earnings-red-flags
Output: {OUTPUT_PATH}
Verdict: {one-line verdict}
Biggest finding: {one line — the most severe new flag}
```

Note: the orchestrator strips this chat-confirmation block before writing the report to `OUTPUT_PATH`. The block is read by the orchestrator for logging only.
