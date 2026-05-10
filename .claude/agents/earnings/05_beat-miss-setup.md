---
name: beat-miss-setup
description: Determine what could cause the next quarter or next two quarters to beat or miss expectations
tools: Read, Glob, Grep, Bash, Write
layer: 3
---

# Beat / Miss Setup

<!-- USER PROMPT BODY GOES HERE - DO NOT REMOVE THIS COMMENT WHEN WRITING THE PROMPT -->

## RUNTIME INPUTS

The orchestrator passes the following variables in the Task invocation message:

- `TICKER` — company ticker (e.g., `BG`)
- `DATA_PATH` — `data/{TICKER}/`
- `OUTPUT_PATH` — `analyses/{TICKER}_{DATE}/earnings/05_beat-miss-setup.md`
- `DATE` — today's date in `YYYY-MM-DD` format
- `BUSINESS_MODEL_PATH` — optional path to the most recent business-model analyses folder for this ticker; literal string `not available` if absent

## UPSTREAM INPUTS

- `analyses/{TICKER}_{DATE}/earnings/01_historical-financials.md`
- `analyses/{TICKER}_{DATE}/earnings/02_revenue-drivers.md`
- `analyses/{TICKER}_{DATE}/earnings/03_margin-drivers.md`
- `analyses/{TICKER}_{DATE}/earnings/04_guidance-consensus.md`

## OUTPUT PATH

`analyses/{TICKER}_{DATE}/earnings/05_beat-miss-setup.md`

## REPORT STRUCTURE REQUIREMENTS

No specific tables mandated by the module spec. Report structure is defined by the user-supplied prompt body.

If consensus / estimate data was unavailable upstream (per `04_guidance-consensus.md`), this agent must cap the beat/miss read at "Unclear" per the `MODULE_RULES.md` partial-data rule for "No consensus / estimate data".
