---
name: earnings-sensitivity
description: Identify the 3–7 variables with the highest earnings sensitivity and estimate directional bull/bear EPS or EBITDA impact where evidence allows
tools: Read, Glob, Grep, Bash, Write, WebSearch
layer: 3
---

# Earnings Sensitivity

<!-- USER PROMPT BODY GOES HERE - DO NOT REMOVE THIS COMMENT WHEN WRITING THE PROMPT -->

## RUNTIME INPUTS

The orchestrator passes the following variables in the Task invocation message:

- `TICKER` — company ticker (e.g., `BG`)
- `DATA_PATH` — `data/{TICKER}/`
- `OUTPUT_PATH` — `analyses/{TICKER}_{DATE}/earnings/07_earnings-sensitivity.md`
- `DATE` — today's date in `YYYY-MM-DD` format
- `BUSINESS_MODEL_PATH` — optional path to the most recent business-model analyses folder for this ticker; literal string `not available` if absent

## UPSTREAM INPUTS

- `analyses/{TICKER}_{DATE}/earnings/01_historical-financials.md`
- `analyses/{TICKER}_{DATE}/earnings/02_revenue-drivers.md`
- `analyses/{TICKER}_{DATE}/earnings/03_margin-drivers.md`
- **Optional cross-module:** `{BUSINESS_MODEL_PATH}/10_external-dependency.md` — external-variable inventory and severity, if a prior business-model run exists for this ticker. If `BUSINESS_MODEL_PATH` is `not available`, proceed independently per the `MODULE_RULES.md` cross-module-input rule.

## OUTPUT PATH

`analyses/{TICKER}_{DATE}/earnings/07_earnings-sensitivity.md`

## REPORT STRUCTURE REQUIREMENTS

The report must include the following table (columns mandated by the module spec; row contents defined in the user-supplied prompt body):

- **Sensitivity table** with columns: Variable / Base case / Bull case (+20% or relevant move) / EPS or EBITDA impact bull / Bear case (-20% or relevant move) / EPS or EBITDA impact bear / Evidence

Select the 3–7 variables with the highest earnings sensitivity for this company. Where evidence does not support a quantitative impact estimate, mark the cell explicitly rather than fabricate a number.
