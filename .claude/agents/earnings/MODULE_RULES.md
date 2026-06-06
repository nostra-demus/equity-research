# Earnings Module — Operating Rules

This file defines the operating rules specific to the **earnings module** of the equity research system.

The repo root `CLAUDE.md` contains cross-cutting rules — git policy, global investing standards — that apply to all modules.

Every subagent in this module reads BOTH the repo root `CLAUDE.md` AND this `MODULE_RULES.md` first, then runs its own task.

---

## Scope

This module answers one question:

> "What is the earnings setup for the next 3–12 months — is it accelerating, stable, decelerating, inflecting, or unclear?"

This module does NOT:
- produce valuation, price targets, or fair-value estimates
- give a Buy/Sell/Hold rating
- size a position or produce portfolio weights
- build bull/base/bear financial models

---

## Core Principles

1. **No source = no claim.** If something cannot be verified from the data pool, write: *"Not proven from available data."*
2. **Drivers, not descriptions.** Don't describe what earnings were — identify what MOVES them.
3. **Segment-level where possible.** Consolidated numbers hide mix effects. Decompose by segment when disclosure allows.
4. **Filings beat decks.** When sources disagree, the more conservative regulated filing wins.
5. **Be blunt.** No vague positives without evidence in the same sentence.

---

## Source Hierarchy (most → least trusted)

1. Audited annual filing (10-K / 20-F for US; Annual Report for India; local annual report elsewhere)
2. Interim / quarterly filing (10-Q / 6-K for US; quarterly financial results filed to NSE/BSE for India; local equivalent)
3. Earnings transcripts
4. Investor presentations
5. Capital IQ / Bloomberg / FactSet exports
6. User notes
7. Web sources (only if filings missing)
8. Your own inference — must be labeled *"Inference, not from filings."*

When the deck is bullish and the filing is cautious, trust the filing.

---

## Evidence Citation Format

Every "Evidence" cell uses this format:

`[Source, Period, Page or Section]`

Examples:
- `FY24 10-K, p.42`
- `Q2 FY26 transcript, prepared remarks`
- `FY24 Annual Report, Note 18`
- `Q3 FY26 investor deck, slide 12`
- `Capital IQ export, FY23 consensus`
- `BSE filing, Oct 2025`

Do NOT write "company filings" or "annual report" alone — those are not citations.

---

## Jurisdiction-Aware Sourcing (Hard Rule)

This module follows CLAUDE.md §27. The US form names in this file and its agents (10-K, 10-Q, 8-K, 20-F/6-K, Form 4) are EXAMPLES, not requirements. Detect the listing jurisdiction from triage `00` and read/cite the local equivalent. An Indian company is the default-likely case, not an edge case.

- **India / SEBI-LODR equivalents for THIS module:** the quarterly trend comes from the **quarterly financial results** (SEBI LODR Reg 33, limited-review) filed to NSE/BSE; the full-year financials come from the **Annual Report** (Board's Report + audited financials + Auditor's Report + Notes); guidance comes from **stock-exchange intimations (SEBI LODR Reg 30) and results/investor presentations**; management tone and driver detail come from **earnings-call transcripts**.
- **Other jurisdictions:** use the local annual report, the local interim/quarterly report (e.g. UK interim via RNS), local exchange announcements, and the earnings call.
- **State the reporting standard** (US GAAP / IFRS / Ind AS) on the numbers — it changes how revenue, leases, and provisions read, so never compare across standards silently. Report in the company's own currency; any cross-currency figure carries its FX date and rate.
- **Never mark a non-US company's data "missing"** because a US form is absent when the local equivalent exists — that is a bad-extraction error (§20), not a real data gap.

---

## Calculation Standards

1. Always state the reporting currency.
2. Always state whether numbers are reported, adjusted, or company-defined.
3. Never mix reported EBITDA and adjusted EBITDA without labeling.
4. Growth rates must be computed as: `(current period − prior period) / prior period`.
5. Margin change must be shown in basis points where possible.
6. FCF must be defined as: `CFO − total capex` unless the company provides a better disclosed definition.
7. Capex sign convention: if capex is shown as negative cash flow, use absolute value when calculating FCF.
8. Net debt must be: `total debt − cash and equivalents` unless the company defines it differently.
9. If fiscal calendars differ across data sources, explicitly reconcile them.
10. If a metric comes from Capital IQ, Bloomberg, or FactSet, label the source and "data as of" date.

---

## TTM Rule

If quarterly data is available, agents should calculate or extract TTM revenue, EBITDA, EBIT, EPS, CFO, capex, and FCF where useful.

TTM = latest four reported quarters.

If quarterly data is not available, state: *"TTM not available from current data."*

---

## Scoring Rules

All scores are out of 100, whole numbers. Bands:

| Band | Meaning |
|---|---|
| 0–20 | Very weak / very high risk / unknown |
| 21–40 | Weak / high risk |
| 41–60 | Mixed / average |
| 61–80 | Strong / low risk |
| 81–100 | Very strong / very low risk / very clear |

### Earnings Module Scores

| Score | Direction | What it measures |
|---|---|---|
| Earnings clarity /100 | higher = better | How clearly we can model the next 12 months |
| Earnings quality /100 | higher = better | How clean, repeatable, and cash-backed the earnings are |
| Consensus setup /100 | higher = more beatable | Whether the market's bar is set low enough to beat |
| Earnings volatility /100 | **higher = WORSE** (inverted) | How sensitive earnings are to small input changes |
| Data quality /100 | higher = better | Completeness of earnings-relevant data |
| Overall usefulness /100 | higher = better | How useful this module is for the final synthesizer |

**Inverted scores are flagged explicitly** in every table header that uses them.

Be strict. High scores require evidence. Default to the middle band when uncertain. The synthesis verdict-block scores aggregate the underlying section tables — use judgment, do not blindly average.

---

## Earnings Verdict Categories

The synthesis agent must pick exactly one:

- **Earnings accelerating** — drivers support beat risk, consensus bar looks beatable
- **Earnings stable** — no major change in trajectory, consensus roughly right
- **Earnings decelerating** — drivers weakening, miss risk elevated
- **Earnings inflecting — positive** — direction change from decline to growth; specify the driver
- **Earnings inflecting — negative** — direction change from growth to decline; specify the driver
- **Mixed earnings setup** — conflicting signals across revenue, margins, and quality
- **Insufficient data** — can't form a view

---

## Partial-Data Rules

When specific data is missing, the affected agents must cap their output as described:

| Missing Data | Affected Agents | Rule |
|---|---|---|
| No consensus / estimate data | 04, 05, 99 | 04 produces guidance-only read; 05 caps beat/miss setup at "Unclear"; 99 caps consensus setup score |
| No quarterly data (only annual) | 01, 02, 03, 06 | Skip seasonality and QoQ analysis; mark QoQ trends as "Not available" |
| No earnings transcript | 02, 03, 04 | Management commentary unavailable; work from filings only and flag the limitation |
| No segment-level P&L | 02, 03, 99 | Segment decomposition skipped; consolidated-only read with limitation flagged |
| No cash flow statement | 06, 99 | Earnings quality capped; cash conversion marked "Unavailable" |
| No current price | 99 | Do not discuss stock reaction precision; earnings-only verdict |

---

## Score Cap Rules

When data is missing or weak, these hard caps override the agent's own scoring. The synthesis agent applies all applicable caps.

| Missing / Weak Data | Score Cap |
|---|---|
| No quarterly data | Earnings clarity max 60 |
| No consensus / estimate data | Consensus setup max 30 |
| No cash flow statement | Earnings quality max 45 |
| No earnings transcript | Earnings clarity max 70 |
| No segment-level P&L for multi-segment business | Earnings clarity max 70 |
| No revision history | Consensus setup max 60 |
| No sensitivity disclosures and only inferred sensitivities | Earnings volatility confidence must be Low |
| Conflicting sources not reconcilable | Overall usefulness max 65 |

---

## Cross-Module Inputs

The earnings module optionally reads outputs from previously-run modules:

- `analyses/{TICKER}_{DATE}/business-model/03_segment-map.md` — segment structure
- `analyses/{TICKER}_{DATE}/business-model/06_value-chain.md` — pricing power context
- `analyses/{TICKER}_{DATE}/business-model/10_external-dependency.md` — external variable identification

If these files are missing, the earnings module proceeds independently and each affected agent states:
*"Business-model module not available — segment decomposition and external variable identification based on this module's own read."*

---

## Segment-Level Rule

Do NOT add a separate segment-earnings agent. Instead, mandate inside `02_revenue-drivers` and `03_margin-drivers`:

- If business-model `03_segment-map.md` exists, read it and decompose revenue/margin drivers by segment.
- If the company is single-segment (>85% from one segment), state that and proceed at consolidated level.
- If segment-level P&L is not disclosed, say so explicitly and do not guess.

---

## Style Rules

- Plain English. Short sentences.
- Plain enough for a non-finance reader (CLAUDE.md §21): use the simplest word that keeps the meaning, and the first time a finance term appears (e.g. EBITDA, FCF, basis points, cash conversion) keep the term and its number but add a short plain meaning in a clause. Plain is not vague — never drop a number or a citation.
- Every important claim → evidence in the same paragraph or table row, in the citation format above.
- Numbers beat adjectives. If you can quote a number from a filing, do.
- Label all inference: *"Inference, not from filings."*

### Banned phrases

These phrases may NOT appear unless paired with specific evidence in the same sentence:

- "strong fundamentals"
- "well positioned"
- "robust growth"
- "attractive opportunity"
- "monitor closely"
- "best-in-class"
- "industry-leading"
- "on track"
- "broadly in line"
- "comfortable with estimates"

---

## Out-of-Scope Requests

If the invocation message asks for anything outside a subagent's specific scope — valuation, target price, scenarios, ratings, forecasts, trade ideas — do NOT comply. Produce the standard report and add:
`Out-of-scope request received: [describe]. Route to the appropriate specialist.`

---

## Inputs Every Subagent Receives

- `TICKER` — company ticker
- `DATA_PATH` — `data/{TICKER}/`
- `OUTPUT_PATH` — `analyses/{TICKER}_{DATE}/earnings/{NN}_{name}.md`
- `DATE` — today's date
- `UPSTREAM_INPUTS` — paths to outputs from agents this one depends on (may be empty)

Read these from the invocation message. Never hardcode.

---

## Output Path Convention

`analyses/{TICKER}_{DATE}/earnings/{NN}_{agent-name}.md`

---

## Chat Confirmation Format

Every subagent ends its turn with:

```
Agent: {name}
Output: {path}
Verdict: {agent-specific verdict line}
Biggest finding: {one line}
```

Add lines only if applicable:
- `Out-of-scope: ...`
- `Insufficient data: ...`
- `Partial data: ...` (name which data is missing and which cap was applied)

---

## Independent Reads

Each subagent reads `DATA_PATH` independently and extracts what it needs.
Subagents do NOT share an authoritative manifest.
The synthesizer reconciles disagreements at the end.

---

## What Good Looks Like

A good Earnings module output should let the master synthesizer answer five questions quickly:

1. Are earnings accelerating, stable, decelerating, or inflecting?
2. What is the single biggest driver of the next 3–12 months?
3. Is consensus easy or hard to beat?
4. Are earnings backed by cash?
5. Which one variable can break the setup?

---

## Subagent List & Execution Layers

Layer 0 (sequential, fail-fast):
- `00_earnings-data-triage`

Layer 1 (parallel):
- `01_historical-financials`
- `04_guidance-consensus`

Layer 2 (parallel, all depend on `01_historical-financials`):
- `02_revenue-drivers`
- `03_margin-drivers`
- `06_earnings-quality`

Layer 3 (parallel):
- `05_beat-miss-setup` (depends on 01, 02, 03, 04)
- `07_earnings-sensitivity` (depends on 01, 02, 03)

Layer 4 (sequential, synthesizer):
- `99_earnings-synthesis` (depends on all prior)

If an upstream output is missing, the dependent subagent notes it explicitly:
*"Upstream output missing: [name] — proceeding with available data."*
