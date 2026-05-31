# Valuation Module — Operating Rules

This file defines the operating rules specific to the **valuation module** of the equity research system.

The repo root `CLAUDE.md` contains cross-cutting rules — git policy, global investing standards — that apply to all modules.

Every subagent in this module reads BOTH the repo root `CLAUDE.md` AND this `MODULE_RULES.md` first, then runs its own task.

---

## Scope

This module answers one question:

> "What is this company worth, what is priced in at today's price, and how much margin of safety exists?"

It produces a **fair-value range** triangulated across multiple methods, an explicit read of **what the current price implies**, and the **downside** to a bear-case value.

This module DOES:
- establish the current price, diluted share count, and the market-cap → enterprise-value bridge
- value the company on its own multiple history, on peer multiples, on intrinsic cash flows (DCF), on a reverse-DCF ("what's priced in"), and on a sum-of-the-parts basis
- triangulate those methods into bull / base / bear fair-value **levels**
- state the margin of safety and the implied up/downside

This module does NOT:
- assign probabilities to scenarios, compute probability-weighted returns, or compute risk/reward — the **master synthesizer** owns that
- size positions or produce portfolio weights
- issue a final Buy / Sell / Hold rating — the master synthesizer owns that
- re-run earnings or business-model work — it consumes those modules' outputs

**Boundary with the master synthesizer (read this twice).** This module produces fair-value *levels* — the answer to "what is it worth." The master synthesizer turns those levels into a *bet* — probabilities, probability-weighted target price, risk/reward, positioning, and the final rating. Produce the levels and the margin of safety; stop there. Do not assign scenario probabilities, do not compute a probability-weighted price target, and do not recommend a position.

---

## Core Principles

1. **No price ≠ no valuation.** If the current price is missing, still produce a fair-value range in per-share and multiple terms and state the *implied* price. Do not invent an observed price; flag that observed up/downside cannot be computed and that this is the single highest-value missing input.
2. **Triangulate — never trust one method.** A fair value is only as good as the agreement among independent methods. Always show at least two methods and reconcile them. If methods disagree by more than ~40%, that disagreement is itself the finding.
3. **Warranted vs observed.** A low multiple is not "cheap" if the business does not deserve a higher one. Always ask what multiple the business *warrants* given quality, moat, cyclicality, and balance sheet (from the business-model and earnings modules) before calling anything mispriced.
4. **Margin of safety is the point.** Buy-side cares about downside before upside. Every fair-value read must state the distance from today's price to a defensible bear-case value.
5. **Ranges, not points.** Fair value is always a range. A single-number price target with false precision is a banned output.
6. **Be blunt and conservative.** When evidence is thin or methods conflict, default to the lower fair value and say why.

---

## Source Hierarchy (most → least trusted)

1. Annual filings (10-K, 20-F, annual report)
2. Quarterly filings (10-Q, 6-K)
3. Capital IQ / Bloomberg / FactSet exports (multiples, estimates, comps, capital structure)
4. IBKR screenshots / broker exports (current price, options, positioning)
5. Earnings transcripts and investor presentations
6. User notes
7. Web sources — used only for inputs not in the pool (current price as an *indicative* quote, peer multiples, risk-free rate / equity-risk-premium). Always label web-sourced numbers as web-sourced, with the date, and treat them as unverified.
8. Your own inference — must be labeled *"Inference, not from filings."*

**Special rule for current price:** prefer a user-provided IBKR or Capital IQ price in the data pool. If none exists, a web quote may be used ONLY when explicitly labeled `Indicative price, web-sourced as of {DATE}, not from data pool — unverified`, and the limitation must propagate to the synthesis.

When the deck is bullish and the filing is cautious, trust the filing.

---

## Evidence Citation Format

Every "Evidence" cell uses this format:

`[Source, Period, Page or Section]`

Examples:
- `FY24 10-K, p.42`
- `Q2 FY26 transcript, prepared remarks`
- `Capital IQ Multiples export, data as of 2026-05-09`
- `IBKR screenshot, 2026-05-30`
- `Web: exchange quote, 2026-05-31 (indicative, unverified)`

Do NOT write "company filings" or "annual report" alone — those are not citations.

---

## Calculation Standards

1. Always state the reporting currency and the per-share basis (use **diluted** shares unless a better disclosed count exists).
2. **Market cap** = diluted shares outstanding × price. State the share count, its source, and the price date.
3. **Enterprise value (EV)** = market cap + total debt + minority/non-controlling interest + preferred equity − cash & equivalents. State the full bridge with each component sourced. Note any adjustment (e.g., operating leases, pension, equity-method investments) explicitly.
4. **Define every multiple** and state whether it is on **reported** or **adjusted** metrics and the period basis — **LTM**, **NTM**, or a specific **FY**. Never mix bases without labeling. Core multiples: P/E, EV/EBITDA, EV/EBIT, EV/Sales, P/B, P/FCF, FCF yield, dividend yield.
5. Growth rates: `(current − prior) / prior`. Margin changes in basis points.
6. **FCF** = `CFO − total capex` unless the company provides a better disclosed definition. Capex sign: use absolute value.
7. **Net debt** = `total debt − cash and equivalents` unless the company defines it differently.
8. **DCF standard:** state every assumption with a source — forecast horizon (years), revenue/margin path, capex and working-capital path, tax rate, and the discount rate with its components (risk-free rate, equity-risk premium, beta, cost of debt, capital weights). State the terminal-value method (Gordon perpetuity growth OR exit multiple) and **disclose terminal value as a % of total EV**. If terminal value exceeds ~75% of EV, flag the DCF as terminal-dominated and low-confidence.
9. **Reverse-DCF standard:** hold the discount rate and horizon fixed at the DCF's values, then solve for the growth (and/or margin) the *current price* implies. State precisely what was solved for and judge whether those implied expectations are achievable against earnings-module evidence.
10. **SOTP standard:** value each reportable segment on a defensible segment-level metric × a cited comparable multiple; sum to a gross enterprise value; bridge to equity (− net debt − minority interest − unallocated corporate costs capitalized, + equity-method investments); divide by diluted shares. Disclose any conglomerate/holding-company discount applied and the reason. Name the comparable behind each segment multiple.
11. Always present fair value as a **range**. Margin of safety = `(fair value − current price) / fair value` (positive = price below fair value = margin of safety exists). State the sign convention every time.
12. If a metric comes from Capital IQ / Bloomberg / FactSet, label the source and the "data as of" date.
13. Show your formulas. A reader must be able to reproduce every number.

---

## TTM / LTM Rule

If quarterly data is available, compute LTM (last twelve months) revenue, EBITDA, EBIT, EPS, and FCF for trailing multiples. LTM = latest four reported quarters. If only annual data exists, use the latest FY and state *"LTM not available — trailing multiples on latest FY."*

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

### Valuation Module Scores

| Score | Direction | What it measures |
|---|---|---|
| Valuation attractiveness /100 | higher = cheaper | Upside from current price to base-case fair value (higher = more undervalued) |
| Margin of safety /100 | higher = better | Downside protection — distance from price to bear-case fair value |
| Valuation confidence /100 | higher = better | Reliability of the fair-value estimate: data completeness AND agreement across methods |
| Downside risk /100 | **higher = WORSE** (inverted) | How far the price could fall to a defensible bear-case value |
| Data quality /100 | higher = better | Completeness of valuation-relevant data (price, estimates, comps, capital structure) |
| Overall usefulness /100 | higher = better | How useful this module is for the master synthesizer |

**Inverted scores are flagged explicitly** in every table header that uses them.

Be strict. High `valuation attractiveness` requires BOTH a real discount to fair value AND a warranted-multiple argument for why it should re-rate. A cheap multiple alone is not enough. Default to the middle band when uncertain. The synthesis verdict-block scores aggregate the underlying section work — use judgment, do not blindly average.

---

## Valuation Verdict Categories

The synthesis agent must pick exactly one:

- **Materially undervalued** — base-case fair value is >25% above price AND a warranted-multiple argument supports re-rating
- **Modestly undervalued** — fair value 10–25% above price
- **Fairly valued** — fair value within ±10% of price
- **Modestly overvalued** — fair value 10–25% below price
- **Materially overvalued** — fair value >25% below price
- **Insufficient data** — cannot triangulate a fair value (e.g., no estimates AND no comps AND no usable cash-flow base)

If the multiples look cheap but quality, moat, cyclicality, or balance-sheet evidence argues the discount is deserved, keep the category honest (often "Fairly valued" or "Modestly undervalued") and explicitly flag **value-trap risk** in prose. Do not let a low multiple alone drive a "Materially undervalued" verdict.

---

## Partial-Data Rules

When specific data is missing, the affected agents must cap their output as described:

| Missing Data | Affected Agents | Rule |
|---|---|---|
| No current price | 01, 05, 07, 99 | 01 produces the EV bridge in per-share/implied terms and flags the gap; 05 (reverse-DCF) cannot run — state "what's priced in" is unknowable without price; 07 expresses targets as fair-value levels with NO observed up/downside %; 99 caps margin-of-safety and attractiveness scoring |
| No consensus / forward estimates | 02, 03, 04, 05 | Forward (NTM/FY) multiples unavailable — use LTM only; DCF builds its own forecast from history with assumptions flagged; cap valuation confidence |
| No peer data | 03, 06 | Relative valuation runs on the company's own history only and flags it; SOTP segment multiples must be justified from web/comparables or marked low-confidence |
| No segment-level data | 06 | SOTP cannot run — agent returns "SOTP not possible — segment EBIT and/or segment comparables unavailable" and does not guess |
| No balance sheet / capital structure | 01, 04, 06 | EV bridge incomplete; net debt unknown; equity bridges flagged; cap confidence |
| No cash flow statement | 04 | DCF FCF base is weak (proxied from EBIT) — flag and cap intrinsic confidence |

---

## Score Cap Rules

When data is missing or weak, these hard caps override an agent's own scoring. The synthesis agent applies all applicable caps.

| Missing / Weak Data | Score Cap |
|---|---|
| No current price | Margin of safety = "Not assessable"; Valuation confidence max 55 |
| No consensus / forward estimates | Valuation confidence max 60 |
| No peer data | Overall usefulness max 70 |
| Only ONE valuation method usable | Valuation confidence max 50 |
| No cash flow statement AND DCF is the only method | Valuation confidence max 45 |
| SOTP not possible for a multi-segment business | Overall usefulness max 80 |
| Methods disagree on fair value by >40% with no reconciliation | Valuation confidence max 55 |
| Fair value rests on a terminal value >75% of DCF EV | Valuation confidence max 60 |

If multiple caps affect the same score, use the most restrictive.

---

## Cross-Module Inputs

The valuation module reads outputs from previously-run modules. It is the **last** module in `/research:full` precisely because it depends on both upstream modules.

**From business-model (`analyses/{TICKER}_{DATE}/business-model/`):**
- `03_segment-map.md` — segment list, revenue/EBIT weights (drives SOTP and the dominant-segment read)
- `08_competitive-map.md` — named peers (drives relative valuation and SOTP segment comparables)
- `07_business-quality.md` and `09_moat.md` — quality/moat (drives the warranted-multiple premium/discount)
- `10_external-dependency.md` — cyclicality / commodity / policy exposure (drives terminal assumptions and any multiple haircut)

**From earnings (`analyses/{TICKER}_{DATE}/earnings/`):**
- `01_historical-financials.md` — the levels base: revenue, EBITDA, EBIT, EPS, FCF, net debt, share count
- `04_guidance-consensus.md` — forward estimates for NTM/FY multiples and the DCF near-term path
- `03_margin-drivers.md` — margin assumptions for the forecast
- `07_earnings-sensitivity.md` — the variable ranges that define bull/base/bear
- `06_earnings-quality.md` — whether to anchor on GAAP or adjusted earnings, and any quality haircut

If a cross-module file is missing, the affected agent proceeds independently and states:
*"{module} cross-module input not available — proceeding on this module's own read of the data pool."*

---

## Segment / SOTP Rule

The SOTP agent (`06_sum-of-the-parts`) is mandatory for multi-segment businesses (more than one reportable segment with material EBIT). If the company is effectively single-segment (>85% of EBIT from one segment), `06` states that and returns a "single-segment — SOTP collapses to the consolidated read" note rather than forcing a spurious breakup. Do NOT fabricate segment multiples; every segment multiple must cite a comparable.

---

## Style Rules

- Plain English. Short sentences.
- Every important claim → evidence in the same paragraph or table row, in the citation format above.
- Numbers beat adjectives. Show the formula behind every valuation output.
- Label all inference: *"Inference, not from filings."*

### Banned phrases

These may NOT appear unless paired with a specific number or range in the same sentence:

- "cheap" / "expensive" (state the discount/premium to fair value or to peers)
- "attractive valuation" / "compelling value"
- "trading at a discount" (to *what*, and by how much?)
- "fairly valued" (state the fair-value range and the gap to price)
- "undervalued" / "overvalued" (state by how much vs which method)
- "significant upside" / "limited downside"
- "re-rating opportunity" (to what multiple, warranted why?)
- "strong fundamentals" / "well positioned" / "best-in-class"

---

## Out-of-Scope Requests

If the invocation message asks for anything outside a subagent's specific scope — scenario probabilities, probability-weighted returns, risk/reward, a Buy/Sell rating, position sizing — do NOT comply. Produce the standard report and add:
`Out-of-scope request received: [describe]. This belongs to the master synthesizer, not the valuation module.`

---

## Inputs Every Subagent Receives

- `TICKER` — company ticker
- `DATA_PATH` — `data/{TICKER}/`
- `OUTPUT_PATH` — `analyses/{TICKER}_{DATE}/valuation/{NN}_{name}.md`
- `DATE` — today's date
- `UPSTREAM_INPUTS` — paths to outputs from agents this one depends on (in-module and cross-module; may be empty)

Read these from the invocation message. Never hardcode.

---

## Output Path Convention

`analyses/{TICKER}_{DATE}/valuation/{NN}_{agent-name}.md`

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

A good Valuation module output should let the master synthesizer answer five questions quickly:

1. Is the stock cheap or expensive, and by how much vs a defensible fair value?
2. What is the fair-value range, and which method drives it?
3. What is priced in at today's price — and is that achievable?
4. How much margin of safety exists — where is the bear-case value?
5. Which method is most reliable for this company, and where do the methods disagree?

---

## Subagent List & Execution Layers

Layer 0 (sequential, fail-fast):
- `00_valuation-data-triage`

Layer 1 (sequential — the anchor everything else needs):
- `01_price-and-capital-structure`

Layer 2 (parallel, all depend on `01`):
- `02_multiples-own-history`
- `03_relative-valuation-peers`
- `04_intrinsic-dcf`
- `05_reverse-dcf`
- `06_sum-of-the-parts`

Layer 3 (sequential — triangulation, depends on `02`–`06`):
- `07_scenario-and-fair-value`

Layer 4 (sequential, synthesizer):
- `99_valuation-synthesis` (depends on all prior)

If an upstream output is missing, the dependent subagent notes it explicitly:
*"Upstream output missing: [name] — proceeding with available data."*
