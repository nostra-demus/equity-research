# Earnings Module — Operating Rules

This file defines the operating rules specific to the **earnings module**.

The repo root `CLAUDE.md` contains cross-cutting rules (git policy, global investing standards) that apply to all modules. Every subagent in this module reads BOTH the repo root `CLAUDE.md` AND this `MODULE_RULES.md` first, then runs its own task.

---

## 1. Scope

This module answers one question: **"What changes the numbers in the next 3–12 months?"**

It does NOT do:
- Valuation
- Position sizing
- Business-model classification (that's the `business-model` module)

If the invocation drifts into one of those, follow the out-of-scope handling rule (§9 below).

---

## 2. Source Hierarchy (most → least trusted)

Same priority order as the business-model module. Each claim cites its source in `[Source, Period, Page]` format (e.g., `FY24 10-K, p.42`; `Q1 FY26 transcript, prepared remarks`).

1. Primary filings — 10-K, 10-Q, 20-F, annual report
2. Earnings releases and earnings call transcripts
3. Management guidance (in releases or transcripts)
4. Sell-side consensus, estimate revisions, target expectations
5. Inferred or calculated values (label `Inference, not from filings.`)
6. Web research (only if filings/data missing)

When the deck or press release is bullish and the filing is cautious, trust the filing.

---

## 3. Cross-Module Input Rule

If a prior `business-model` module run exists for this ticker (most recent `analyses/{TICKER}_*/business-model/` folder, resolved by the orchestrator and passed as `BUSINESS_MODEL_PATH`):

- Agent `02_revenue-drivers` should read `{BUSINESS_MODEL_PATH}/03_segment-map.md`.
- Agent `03_margin-drivers` should read `{BUSINESS_MODEL_PATH}/03_segment-map.md` and `{BUSINESS_MODEL_PATH}/06_value-chain.md`.
- Agent `07_earnings-sensitivity` should read `{BUSINESS_MODEL_PATH}/10_external-dependency.md`.
- Agent `99_earnings-synthesis` may read any of the above plus the business-model synthesizer output.

If `BUSINESS_MODEL_PATH` equals the literal string `not available`, agents must proceed independently and state explicitly in their report:

> "Business-model module not available — segment decomposition and external variable identification based on this module's own read."

---

## 4. Segment-Level Rule (for `02_revenue-drivers` and `03_margin-drivers`)

- If `business-model/03_segment-map.md` exists, decompose revenue/margin drivers by segment.
- If the company is single-segment or >85% of revenue from one segment, state that and proceed at the consolidated level.
- If segment-level P&L is not disclosed, say so and do NOT guess.

---

## 5. Scoring System (applied in `99_earnings-synthesis`)

All scores are 0–100, whole numbers.

| Score | Direction |
|---|---|
| Earnings clarity /100 | higher = better |
| Earnings quality /100 | higher = better |
| Consensus setup /100 | higher = more beatable |
| Earnings volatility /100 | higher = WORSE (inverted) |
| Data quality /100 | higher = better |
| Overall usefulness /100 | higher = better |

Use the same 0–100 score bands as the business-model module — see `.claude/agents/business-model/MODULE_RULES.md` for the canonical band definitions (0–20, 21–40, 41–60, 61–80, 81–100). Do not duplicate the band definitions here; refer to that file.

Be strict. High scores require evidence. Default to the middle band when uncertain.

---

## 6. Earnings Verdict Categories

The synthesizer (`99_earnings-synthesis`) must pick exactly ONE of:

- **Earnings accelerating**
- **Earnings stable**
- **Earnings decelerating**
- **Earnings inflecting** — specify positive or negative
- **Mixed earnings setup**
- **Insufficient data**

---

## 7. Partial-Data Rules

| Missing data | Affected agents | Rule |
|---|---|---|
| No consensus / estimate data | 04, 05, 99 | 04 produces guidance-only read; 05 caps beat/miss setup at Unclear; 99 caps consensus setup score |
| No quarterly data, only annual | 01, 02, 03, 06 | Skip seasonality and QoQ analysis; mark QoQ as Not available |
| No earnings transcript | 02, 03, 04 | Management commentary unavailable; work from filings only |
| No segment-level P&L | 02, 03, 99 | Segment decomposition skipped; consolidated-only read with limitation |
| No cash flow statement | 06, 99 | Earnings quality capped; cash conversion unavailable |
| No current price | 99 | Do not discuss stock reaction precision; earnings-only verdict |

---

## 8. Banned Phrases

These phrases may NOT appear unless paired with specific evidence in the same sentence:

- "strong fundamentals"
- "well positioned"
- "robust platform"
- "attractive opportunity"
- "monitor closely"
- "best-in-class"
- "industry-leading"
- "diversified business"
- "shareholder-friendly"
- "disciplined acquirer"
- "prudent capital allocation"

---

## 9. Out-of-Scope Requests

Same handling as the business-model module. If the invocation message asks for anything outside a subagent's specific scope (valuation, target price, scenarios, ratings, forecasts, trade ideas, anything assigned to a different specialist), do NOT comply. Instead:

1. Produce the standard report for this subagent.
2. Add a line to the chat confirmation:
   `Out-of-scope request received: [describe]. Route to the appropriate specialist.`

Never silently expand scope.

---

## 10. Runtime Input Contract

Every subagent invocation receives, via the orchestrator's Task message:

- `TICKER` — company ticker
- `DATA_PATH` — `data/{TICKER}/`
- `OUTPUT_PATH` — `analyses/{TICKER}_{DATE}/earnings/{NN}_{name}.md`
- `DATE` — today's date in `YYYY-MM-DD` format
- `UPSTREAM_INPUTS` — paths to upstream agent outputs this one depends on (per the agent file's own UPSTREAM INPUTS section)
- `BUSINESS_MODEL_PATH` — optional path to the most recent business-model analyses folder for this ticker (e.g., `analyses/{TICKER}_YYYY-MM-DD/business-model/`); the literal string `not available` if no prior business-model run exists for this ticker

Read these from the invocation message. Never hardcode.
