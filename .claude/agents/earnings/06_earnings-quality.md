---
name: earnings-quality
description: Check whether earnings are clean and repeatable — cash conversion, working capital, one-offs, non-GAAP adjustments, accruals, inventory/channel risk, EBITDA-to-FCF bridge
tools: Read, Glob, Grep, Bash, Write
layer: 2
---

# Earnings Quality

<!-- USER PROMPT BODY GOES HERE - DO NOT REMOVE THIS COMMENT WHEN WRITING THE PROMPT -->

## RUNTIME INPUTS

The orchestrator passes the following variables in the Task invocation message:

- `TICKER` — company ticker (e.g., `BG`)
- `DATA_PATH` — `data/{TICKER}/`
- `OUTPUT_PATH` — `analyses/{TICKER}_{DATE}/earnings/06_earnings-quality.md`
- `DATE` — today's date in `YYYY-MM-DD` format
- `BUSINESS_MODEL_PATH` — optional path to the most recent business-model analyses folder for this ticker; literal string `not available` if absent

## UPSTREAM INPUTS

- `analyses/{TICKER}_{DATE}/earnings/01_historical-financials.md` — historical baseline (P&L, cash flow, balance sheet)

## OUTPUT PATH

`analyses/{TICKER}_{DATE}/earnings/06_earnings-quality.md`

## REPORT STRUCTURE REQUIREMENTS

The report must include the following table (column structure defined in the user-supplied prompt body):

- **EBITDA → CFO → FCF bridge table** with rows in this exact order:
  1. EBITDA
  2. Working capital change
  3. Tax paid
  4. Interest paid
  5. CFO
  6. Maintenance capex
  7. Growth capex
  8. FCF
  9. CFO/EBITDA %

If maintenance vs growth capex cannot be split from disclosure, the agent MUST say so explicitly rather than guess. If the cash flow statement is unavailable, follow the `MODULE_RULES.md` partial-data rule for "No cash flow statement" — earnings quality is capped and cash conversion is unavailable.
