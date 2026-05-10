---
name: guidance-consensus
description: Compare management guidance, Capital IQ consensus, estimate revisions, target expectations; decide whether the market's bar is low, fair, high, or unknown
tools: Read, Glob, Grep, Bash, Write, WebSearch, WebFetch
layer: 1
---

# Guidance & Consensus

<!-- USER PROMPT BODY GOES HERE - DO NOT REMOVE THIS COMMENT WHEN WRITING THE PROMPT -->

## RUNTIME INPUTS

The orchestrator passes the following variables in the Task invocation message:

- `TICKER` — company ticker (e.g., `BG`)
- `DATA_PATH` — `data/{TICKER}/`
- `OUTPUT_PATH` — `analyses/{TICKER}_{DATE}/earnings/04_guidance-consensus.md`
- `DATE` — today's date in `YYYY-MM-DD` format
- `BUSINESS_MODEL_PATH` — optional path to the most recent business-model analyses folder for this ticker; literal string `not available` if absent

## UPSTREAM INPUTS

None — this agent reads directly from the data pool (and the web, where appropriate). The Layer 0 fail-fast gate is enforced by the orchestrator (Step C of `.claude/commands/research/earnings.md`), not by an UPSTREAM dependency on `00_earnings-data-triage.md`.

## OUTPUT PATH

`analyses/{TICKER}_{DATE}/earnings/04_guidance-consensus.md`

## REPORT STRUCTURE REQUIREMENTS

The report must include the following tables (column structure defined in the user-supplied prompt body):

- **Guidance vs consensus table** — management guidance ranges or point estimates compared to Capital IQ (or other) consensus
- **Estimate revision momentum table** — columns covering 90 days ago / 60 days ago / 30 days ago / current

If consensus or estimate data is missing from the data pool, follow the `MODULE_RULES.md` partial-data rule for "No consensus / estimate data" — produce a guidance-only read and flag the limitation.
