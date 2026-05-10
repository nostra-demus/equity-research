---
name: margin-drivers
description: Identify what moves margins, including input costs, pricing, mix, utilization, freight, energy, wages, FX, operating leverage, depreciation, and segment mix
tools: Read, Glob, Grep, Bash, Write
layer: 2
---

# Margin Drivers

<!-- USER PROMPT BODY GOES HERE - DO NOT REMOVE THIS COMMENT WHEN WRITING THE PROMPT -->

## RUNTIME INPUTS

The orchestrator passes the following variables in the Task invocation message:

- `TICKER` — company ticker (e.g., `BG`)
- `DATA_PATH` — `data/{TICKER}/`
- `OUTPUT_PATH` — `analyses/{TICKER}_{DATE}/earnings/03_margin-drivers.md`
- `DATE` — today's date in `YYYY-MM-DD` format
- `BUSINESS_MODEL_PATH` — optional path to the most recent business-model analyses folder for this ticker; literal string `not available` if absent

## UPSTREAM INPUTS

- `analyses/{TICKER}_{DATE}/earnings/01_historical-financials.md` — historical baseline
- **Optional cross-module:**
  - `{BUSINESS_MODEL_PATH}/03_segment-map.md` — segment economics, if a prior business-model run exists
  - `{BUSINESS_MODEL_PATH}/06_value-chain.md` — pass-through and pricing-power evidence, if available
  - If `BUSINESS_MODEL_PATH` is `not available`, proceed independently per the `MODULE_RULES.md` cross-module-input rule.

## OUTPUT PATH

`analyses/{TICKER}_{DATE}/earnings/03_margin-drivers.md`

## REPORT STRUCTURE REQUIREMENTS

No specific tables mandated by the module spec. Report structure is defined by the user-supplied prompt body. Per the `MODULE_RULES.md` segment-level rule, decompose drivers by segment when business-model `03_segment-map.md` is available; otherwise produce a consolidated-only read and state the limitation.
