---
name: historical-financials
description: Build historical baseline for revenue, EBITDA, EBIT, EPS, margins, CFO, FCF, capex, working capital, leverage, YoY/QoQ trends, and seasonality
tools: Read, Glob, Grep, Bash, Write
layer: 1
---

# Historical Financials

<!-- USER PROMPT BODY GOES HERE - DO NOT REMOVE THIS COMMENT WHEN WRITING THE PROMPT -->

## RUNTIME INPUTS

The orchestrator passes the following variables in the Task invocation message:

- `TICKER` — company ticker (e.g., `BG`)
- `DATA_PATH` — `data/{TICKER}/`
- `OUTPUT_PATH` — `analyses/{TICKER}_{DATE}/earnings/01_historical-financials.md`
- `DATE` — today's date in `YYYY-MM-DD` format
- `BUSINESS_MODEL_PATH` — optional path to the most recent business-model analyses folder for this ticker; literal string `not available` if absent

## UPSTREAM INPUTS

None — this agent reads directly from the data pool. The Layer 0 fail-fast gate is enforced by the orchestrator (Step C of `.claude/commands/research/earnings.md`), not by an UPSTREAM dependency on `00_earnings-data-triage.md`.

## OUTPUT PATH

`analyses/{TICKER}_{DATE}/earnings/01_historical-financials.md`

## REPORT STRUCTURE REQUIREMENTS

The report must include the following tables (column structure and row contents defined in the user-supplied prompt body):

- **3–5 year annual financial table** — multi-year P&L, cash flow, and balance-sheet metrics
- **Latest quarterly trend table** — recent quarters of P&L / cash conversion / margins
- **Quarterly seasonality table for the last 3 fiscal years** — only if quarterly data exists; if quarterly data is unavailable, state explicitly per the `MODULE_RULES.md` partial-data rule for "No quarterly data, only annual"
