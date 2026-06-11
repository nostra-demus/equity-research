# Valuation Module — Operating Rules

This file defines the operating rules specific to the **valuation module** of the equity research system.

The repo root `CLAUDE.md` contains cross-cutting rules — git policy, global investing standards — that apply to all modules.

Every subagent in this module reads BOTH the repo root `CLAUDE.md` AND this `MODULE_RULES.md` first, then runs its own task.

---

## Scope

This module answers one question:

> "What is this company worth, what is priced in at today's price, and how much margin of safety exists?"

It produces **bull / base / bear fair-value levels** (points) triangulated across multiple methods — with the cross-method dispersion shown separately — an explicit read of **what the current price implies**, the **margin of safety** (discount to base fair value), and the **downside to bear**.

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

1. **No price ≠ no valuation.** If the current price is missing, still produce the fair-value **levels** (bull/base/bear) in per-share and multiple terms and state the *implied* price. Do not invent an observed price; flag that observed up/downside cannot be computed and that this is the single highest-value missing input. **A price that is not pool-verified — an indicative / web-sourced / unconfirmed quote — is treated the SAME as no price for every price-relative read** (margin of safety, downside-to-bear, observed up/down, attractiveness): it may be shown for context, labelled, but it does not unlock those scores. Only a pool-verified, dated price does (see Score-Cap rules — the single canonical no-price cap).
2. **Triangulate — never trust one method.** A fair value is only as good as the agreement among independent methods. Always show at least two methods and reconcile them. If methods disagree by more than ~40%, that disagreement is itself the finding.
3. **Warranted vs observed.** A low multiple is not "cheap" if the business does not deserve a higher one. Always ask what multiple the business *warrants* given quality, moat, cyclicality, and balance sheet (from the business-model and earnings modules) before calling anything mispriced. **Unaligned-owner value trap (CLAUDE.md §24, Filter 6):** if the management-governance module flagged a structurally misaligned controlling owner (RF-OWN-004 — government control, a listed subsidiary of a value-maximizing parent, or a sprawling unrelated conglomerate), persistent cheapness is a value trap, not a margin of safety. Do not underwrite a reversion to the old mean that the owner has no interest in delivering — such businesses are often perennially cheap and stay cheap.
4. **Downside before upside.** Buy-side cares about the downside first. Every fair-value read states TWO distinct, separately-named numbers — never collapse them into one (see Calculation Standards 11): the **margin of safety** = the discount of price to the *base-case* fair value (the cushion if your base case is right), and the **downside to bear** = how far price falls to the *bear-case* value (the loss if the bear case plays out, an inverted metric).
5. **No false precision — but each scenario is a derived level (point).** Consistent with CLAUDE.md §16 ("bear, base, and bull fair-value *levels*"): bull / base / bear are each a single derived fair-value LEVEL off a coherent assumption set; the **range** is the bull-to-bear spread plus the cross-method football field shown alongside. What is banned is a single all-in price target presented with false precision and no dispersion — NOT a derived point per scenario. Never narrow the method dispersion into a fake mid-band wearing a scenario label.
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
- Acceptable web price sources (only if needed): the primary exchange quote page, or a reputable market-data provider page. Must include a timestamp/date and the currency. Never use blogs or forums. Always label as indicative/unverified.

When the deck is bullish and the filing is cautious, trust the filing.

---

## Evidence Citation Format

Every "Evidence" cell uses this format:

`[Source, Period, Page or Section]`

Examples:
- (US) `FY24 10-K, p.42` / (India) `FY24 Annual Report (Ind AS), Note 18 (Segment)`
- `Q2 FY26 transcript, prepared remarks`
- `Capital IQ Multiples export, data as of 2026-05-09`
- `IBKR screenshot, 2026-05-30`
- `Web: exchange quote, 2026-05-31 (indicative, unverified)`

Do NOT write "company filings" or "annual report" alone — those are not citations.

---

## Jurisdiction-Aware Sourcing (Hard Rule)

This module follows CLAUDE.md §27. The US form names used throughout this file and its agents (10-K, 10-Q, 8-K, Form 4, DEF 14A, S-1) are EXAMPLES, not requirements. Detect the listing jurisdiction from the `00` triage (US SEC / India SEBI-LODR / UK / other), then read and cite the local-equivalent document. Never mark a non-US company's data "missing" because a US form is absent when the local equivalent exists — that is a bad-extraction error (§20), not a real data gap. An Indian company is the default-likely case.

India / SEBI-LODR equivalents for this module's inputs:
- **Shares, debt, cash, minority/preferred:** the balance sheet in the latest Annual Report or the latest quarterly results (SEBI LODR Reg 33).
- **Promoter & public holding:** the shareholding-pattern filing (drives the float / per-share-count read).
- **Segment EBIT / assets (for SOTP):** the Ind AS 108 segment note in the Annual Report.
- **Reporting standard:** Ind AS; **currency:** INR (state lakh/crore scale but always give the absolute number).

On any number: state the reporting standard (US GAAP / IFRS / Ind AS) and the company's own currency, and carry the FX date and rate on any cross-currency conversion (§15). Use the company's own fiscal year (an Indian "FY24" usually ends 31 March) — never assume a USD / US-GAAP / December-year default.

---

## Calculation Standards

1. Always state the reporting currency and the per-share basis (use **diluted** shares unless a better disclosed count exists).
2. **Market cap** = diluted shares outstanding × price. State the share count, its source, and the price date.
3. **Enterprise value (EV)** = market cap + total debt + minority/non-controlling interest + preferred equity − cash & equivalents. State the full bridge with each component sourced. Note any adjustment (e.g., operating leases, pension, equity-method investments) explicitly.
4. **Define every multiple** and state whether it is on **reported** or **adjusted** metrics and the period basis — **LTM**, **NTM**, or a specific **FY**. Never mix bases without labeling. Core multiples: P/E, EV/EBITDA, EV/EBIT, EV/Sales, P/B, P/FCF, FCF yield, dividend yield.
5. Growth rates: `(current − prior) / prior`. Margin changes in basis points.
6. **FCF** = `CFO − total capex` unless the company provides a better disclosed definition. Capex sign: use absolute value.
7. **Net debt** = `total debt − cash and equivalents` unless the company defines it differently.
8. **DCF standard:** state every assumption with a source — forecast horizon (years), revenue/margin path, capex and working-capital path, tax rate, and the discount rate with its components (risk-free rate, equity-risk premium, beta, cost of debt, capital weights). State the terminal-value method (Gordon perpetuity growth OR exit multiple) and **disclose terminal value as a % of total EV**. If terminal value exceeds ~75% of EV, flag the DCF as terminal-dominated and low-confidence. **State the discounting convention and default to the mid-year convention** (cash flows arrive on average mid-period, so discount at t−0.5); end-of-year discounting systematically understates value by roughly a half-year's discount (larger at high WACC) and may be used only if stated and justified.
9. **Reverse-DCF standard:** hold the discount rate, horizon, terminal growth, **and the normalized FCF base** fixed **at the forward DCF's (`04`'s) values** — the reverse-DCF must invert the SAME model, not re-derive an independent WACC or use a different (e.g. un-normalized / one-off-inflated) base, which can produce opposite verdicts on the same stock. Then solve for the growth (and/or margin) the *current price* implies. State precisely what was solved for and judge whether those implied expectations are achievable against earnings-module evidence. (`05` therefore runs AFTER `04` and reads it; if `04` is unavailable, self-derive and flag as unreconciled.)
10. **SOTP standard:** value each reportable segment on a defensible segment-level metric × a cited comparable multiple; sum to a gross enterprise value; bridge to equity (− net debt − minority interest − unallocated corporate costs capitalized, + equity-method investments); divide by diluted shares. Disclose any conglomerate/holding-company discount applied and the reason. Name the comparable behind each segment multiple.
11. **Output shape and the two price-relative metrics (canonical — every agent uses these definitions verbatim).** Present fair value as bull / base / bear **levels (points)** plus the cross-method dispersion (the football field) — never a single point with no dispersion, and never a vague band in place of the base point (Core Principle 5). Then state two *separate* price-relative metrics, each with its sign convention every time:
    - **Margin of safety** = `(base-case fair value − current price) / base-case fair value` (positive = price below fair value = cushion exists). Denominator is fair value — this is the discount/cushion, NOT the upside.
    - **Downside to bear** = `(current price − bear-case fair value) / current price` (an **inverted** metric — higher = worse). Denominator is price — this is the loss to the bear case.
    Both require a pool-verified current price; without one, both are **"Not assessable"** (Score-Cap rules). Do not let "margin of safety" mean distance-to-bear — that is the separate Downside-risk score.
12. If a metric comes from Capital IQ / Bloomberg / FactSet, label the source and the "data as of" date.
13. Show your formulas. A reader must be able to reproduce every number.

### Economic Consistency Gates (Hard Rules)

1. **FCFF identity must hold.** For operating companies, intrinsic valuation must reconcile to one of:
   - `FCFF = CFO − total capex` (preferred when a cash flow statement exists), OR
   - `FCFF = NOPAT + D&A − capex − ΔNWC` (when building from the income statement and balance sheet).
   State which definition is used and why. Do not mix definitions within a single valuation.
2. **Growth must be financeable.** If using an operating DCF, provide a cross-check:
   - `Reinvestment rate ≈ (capex − D&A + ΔNWC) / NOPAT`
   - `Implied growth ≈ ROIC × reinvestment rate`
   If implied growth differs materially from modeled growth, flag it and explain what bridges the gap (pricing, mix, margin expansion, working-capital release, one-offs). **Teeth:** if implied growth differs from the modeled terminal `g` by more than ~1.5pp and the bridge is not quantified, the agent must either lower terminal `g` to the financeable level, OR cap intrinsic confidence and show the sensitivity grid at the financeable `g`. A flagged-but-unquantified gap may not be left to stand on an un-financeable terminal value.
3. **ROIC drift rule.** In the terminal years, ROIC should trend toward WACC unless moat/quality evidence explicitly supports persistent excess returns. Label any persistence as an inference and cite the upstream moat/quality outputs if available.
4. **WACC sanity bounds.** Flag if:
   - the risk-free rate or ERP is missing a dated source,
   - the after-tax cost of debt is below 0% or implausibly low versus the company's credit reality, or
   - terminal growth `g` exceeds the long-run nominal growth proxy for the reporting currency's economy (justify if higher).
   **WACC override discipline:** the WACC is the single most value-determining input, so a discretionary override of the mechanically-computed figure must (a) show both the computed and the used WACC, (b) carry a one-sentence justification, (c) stay within ±1.5pp of the computed value, and (d) be cross-checked against any cost of capital inferred by the moat / business-quality module (`09_moat.md` §3 economic-moat test). If the override and that inferred cost of capital diverge by more than ~2pp, run the sensitivity grid spanning both rather than asserting one.
5. **Terminal dominance escalation.** If terminal value is >75% of EV, the DCF is low-confidence (already stated). In that case the intrinsic output must add a second lens: an exit-multiple cross-check OR an economic-profit / ROIC-based narrative.
6. **Cyclicality gate.** If the business is cyclical or commodity-linked (from the upstream external-dependency output or inference), do NOT use a single-point mid-cycle margin assumption. Require a margin band and a mid-cycle normalization explanation. **The terminal/normalized margin must be benchmarked against BOTH a peer-normal margin AND the company's own prior-trough (prior-downturn) margin — not merely set "below the most recent peak." If the earnings module flagged the latest period as a cycle peak (or a one-time policy tailwind is in the base), a terminal margin at or near that peak is rejected; state the peer-normal anchor, the prior-trough anchor, and where in that range the terminal sits, each cited. If no peer data is available (the no-peer-data partial-data case), benchmark against the prior-trough and the company's own through-cycle history alone, and say so — do not treat the missing peer anchor as a reason to default to the peak. For a young entity with less than one full standalone cycle, use the predecessor entity / segment / industry prior-downturn as the trough anchor and name it. This is evidence-based: cite the documented cycle position; do not impose a trough the history does not support.**

---

## TTM / LTM Rule

If quarterly data is available, compute LTM (last twelve months) revenue, EBITDA, EBIT, EPS, and FCF for trailing multiples. LTM = latest four reported quarters. If only annual data exists, use the latest FY and state *"LTM not available — trailing multiples on latest FY."*

---

## Fully Diluted Equity Rules (Hard Rules)

These rules govern share counts and refine Calculation Standards items 1–2.

1. **Market-cap share count:** use the most recent shares outstanding (cover-page or equivalent "as of" count), not the period diluted weighted-average.
2. **Per-share fair-value share count:** use **fully diluted shares** where possible:
   - Options/RSUs via the **treasury stock method** (state the assumed average strike, or use the disclosed weighted-average).
   - Convertibles via **if-converted** when in-the-money; otherwise treat them as debt.
   - If detailed dilution data is unavailable, default to diluted weighted-average shares and clearly label it as a limitation.
3. Always show a **Share Count Reconciliation Table**: basic shares, + options/RSUs, + converts, = fully diluted shares used.

---

## Reconciliation Gates (Hard Rules)

Before the synthesis publishes, these tie-outs must hold or be explicitly flagged:

1. **Anchor consistency.** Every agent uses the price, share counts, net debt, and EV from `01_price-and-capital-structure` verbatim. **Where `01` designates a canonical net-debt / net-cash figure among several definitions, every downstream equity bridge (02 / 03 / 04 / 06 / 07) uses THAT figure; using a different definition (e.g. broad vs basic) is allowed only with an explicit one-line reason — silent substitution is a divergence and is not allowed.** If an agent's number differs (e.g., a later filing), it must say so — silent divergence is not allowed.
2. **EV bridge ties.** `EV = market cap + total debt + minority + preferred − cash`, with no plug. Label any estimated component.
3. **SOTP ties to consolidated.** The segment revenue and EBIT used in SOTP must reconcile to the consolidated totals; name any unallocated/corporate bucket — it may not vanish.
4. **Share-count consistency.** The market-cap count and the per-share fair-value count are each stated once (in `01`) and reused everywhere; per-share outputs divide by the fair-value count, never a mixed number.
5. **Currency consistency.** All methods use one reporting currency; if an input is in another currency, state the rate and date used to convert.
6. **Cross-method tolerance.** If two value-producing methods disagree on fair value by more than 40%, the synthesis must reconcile the gap explicitly (ties to the score cap) — it may not silently average them.

---

## Business-Type Method Map (Hard Rule)

Method validity depends on the business type identified in `00_valuation-data-triage` (Operating / Financial / REIT / Commodity / Holding company). Apply this map; never force operating-company methods onto a business where they are meaningless.

| Business type | Primary intrinsic method | Primary multiples | Do NOT use |
|---|---|---|---|
| Operating | FCFF DCF (+ reverse-DCF) | EV/EBITDA, EV/EBIT, P/E, FCF yield | — |
| Financial (bank / insurer) | DDM or residual-income / excess-return on equity (value equity directly, discount at cost of equity) | P/E, P/tangible book; (insurers) P/embedded value | EV-based multiples, FCFF DCF, the EV bridge as a value |
| REIT / real estate | NAV (asset value − net debt) and/or DDM on FFO | P/FFO, P/AFFO, P/NAV, implied cap rate | EBITDA / FCFF DCF (depreciation is non-economic) |
| Commodity / cyclical | FCFF DCF on **normalized mid-cycle** earnings | mid-cycle EV/EBITDA, P/NAV (resources) | single-point peak / trough margins |
| Holding company | SOTP / NAV (`06` is primary) | look-through / SOTP | a consolidated single multiple as the headline |

For **Financial** and **REIT** issuers the EV bridge in `01` is informational only — value equity directly. If the type is ambiguous, state the assumption and run the most conservative applicable method. This map is the single source of truth; agents cite it rather than re-deriving method validity.

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
| Margin of safety /100 | higher = better | The cushion: discount of price to **base-case** fair value — `(base FV − price)/base FV`. (Distance to the *bear* case is the separate Downside-risk score below — do not duplicate it here.) |
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

If the multiples look cheap but quality, moat, cyclicality, or balance-sheet evidence argues the discount is deserved, keep the category honest (often "Fairly valued" or "Modestly undervalued") and explicitly flag **value-trap risk** in prose. Do not let a low multiple alone drive a "Materially undervalued" verdict. A structurally misaligned controlling owner (RF-OWN-004, §24 Filter 6) is a value-trap trigger in its own right: with such an owner the verdict may not be "Materially undervalued" on a cheap multiple alone, and the value-trap flag is mandatory.

---

## Partial-Data Rules

When specific data is missing, the affected agents must cap their output as described:

| Missing Data | Affected Agents | Rule |
|---|---|---|
| No pool-verified price (price-state `indicative` or `none` — absent, or only an indicative / web-sourced quote) | 01, 05, 07, 99 | 01 produces the EV bridge in per-share/implied terms, tags the price-state (`pool-verified` / `indicative` / `none`), and flags the gap; 05 (reverse-DCF) cannot run — "what's priced in" is unknowable without a real price; 07 expresses targets as fair-value levels with NO observed up/downside %, margin of safety, or downside-to-bear; 99 applies the single canonical no-price Score-Cap row below |
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
| No pool-verified price (price-state `indicative` or `none`) | Margin of safety, downside-to-bear (the Downside-risk score), observed up/down, and valuation attractiveness = **"Not assessable"**; valuation confidence max 55. *(Single canonical no-price cap — `01` tags the price-state; `05`/`07`/`99` apply THIS row and do not redefine which scores are capped. A pool price whose as-of date is unconfirmed remains `pool-verified` — staleness is a data-quality caveat, not a trigger for this row.)* |
| No consensus / forward estimates | Valuation confidence max 60 |
| No peer data | Overall usefulness max 70 |
| Only ONE valuation method usable | Valuation confidence max 50 |
| No cash flow statement AND DCF is the only method | Valuation confidence max 45 |
| SOTP not possible for a multi-segment business | Overall usefulness max 80 |
| Methods disagree on fair value by >40% with no reconciliation | Valuation confidence max 55 |
| Fair value rests on a terminal value >75% of DCF EV | Valuation confidence max 60 |
| Structurally misaligned controlling owner flagged (RF-OWN-004, §24 Filter 6) | Valuation attractiveness max 60; value-trap flag mandatory; verdict no better than "Modestly undervalued" on a cheap multiple alone |

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

**From management-governance (`analyses/{TICKER}_{DATE}/management-governance/`), if available** — under `/research:full` this module runs before valuation, so its outputs exist in the run root:
- `04_ownership-and-insider-behavior.md` and `99_management-governance-synthesis.md` — the unaligned-owner flag (RF-OWN-004) that drives the §24 Filter 6 value-trap read. If unavailable (e.g., a standalone valuation run), proceed on this module's own read and leave the final value-trap adjudication to the master synthesizer.

If a cross-module file is missing, the affected agent proceeds independently and states:
*"{module} cross-module input not available — proceeding on this module's own read of the data pool."*

---

## Segment / SOTP Rule

The SOTP agent (`06_sum-of-the-parts`) is mandatory for multi-segment businesses (more than one reportable segment with material EBIT). If the company is effectively single-segment (>85% of EBIT from one segment), `06` states that and returns a "single-segment — SOTP collapses to the consolidated read" note rather than forcing a spurious breakup. Do NOT fabricate segment multiples; every segment multiple must cite a comparable.

---

## Style Rules

- Plain English. Short sentences.
- Plain enough for a non-finance reader (CLAUDE.md §21): use the simplest word that keeps the meaning, and the first time a finance term appears (e.g. EV/EBITDA, reverse-DCF, terminal value, margin of safety) keep the term and its number but add a short plain meaning in a clause. Plain is not vague — never drop a number or a citation.
- Every important claim → evidence in the same paragraph or table row, in the citation format above.
- Numbers beat adjectives. Show the formula behind every valuation output.
- Label all inference: *"Inference, not from filings."*

### Banned phrases

These may NOT appear unless paired with a specific number or range in the same sentence:

- "cheap" / "expensive" (state the discount/premium to fair value or to peers)
- "attractive valuation" / "compelling value"
- "trading at a discount" (to *what*, and by how much?)
- "fairly valued" (state the bull/base/bear fair-value levels and the gap to price)
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
2. What are the bull/base/bear fair-value levels (and the base point), and which method drives them?
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
- `06_sum-of-the-parts`

Layer 3 (depends on `04` — inverts the same model):
- `05_reverse-dcf` (reads `04`'s canonical WACC + normalized FCF base; see Reconciliation/DCF standard 9)

Layer 4 (triangulation, depends on `02`–`06`):
- `07_scenario-and-fair-value`

Layer 5 (synthesizer):
- `99_valuation-synthesis` (depends on all prior)

If an upstream output is missing, the dependent subagent notes it explicitly:
*"Upstream output missing: [name] — proceeding with available data."*
