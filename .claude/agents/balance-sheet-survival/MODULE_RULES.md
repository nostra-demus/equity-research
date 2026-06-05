# Balance-Sheet-Survival Module — Operating Rules

This file defines the operating rules specific to the **balance-sheet-survival module** of the equity research system.

The repo root `CLAUDE.md` contains cross-cutting rules — git policy, global investing standards — that apply to all modules.

Every subagent in this module reads BOTH the repo root `CLAUDE.md` AND this `MODULE_RULES.md` first, then runs its own task.

---

## Scope

This module answers one question:

> "Can this company service and refinance its obligations — and what happens to it in a downside?"

It maps the debt stack, the maturity wall, the liquidity runway, covenant headroom, and off-balance-sheet/contingent exposures, then **stress-tests survival** against explicit downside earnings.

This module DOES:
- build the full capital structure (debt by type/seniority, leases, pensions, preferred) and gross/net leverage
- lay out the maturity wall and refinancing exposure (fixed/floating, coupon vs market)
- measure liquidity runway (cash + committed undrawn facilities + FCF vs near-term obligations)
- compute coverage ratios and covenant headroom
- surface off-balance-sheet and contingent liabilities
- run a downside EBITDA stress test and state the survival conclusion

This module does NOT:
- value the company or produce a fair value / price target — the **valuation module** owns that
- assign scenario probabilities, compute probability-weighted returns, size positions, or issue a Buy/Sell rating — the **master synthesizer** owns that
- forecast earnings — it reads the earnings module's outputs

**Boundary with the master synthesizer (read this twice).** This module produces the survival read — leverage, runway, headroom, and stress outcomes at stated levels. The master synthesizer folds that into the Risk Register and the verdict. Produce the levels and the stress results; stop there. Do not assign probabilities, do not rate the stock, do not size a position.

---

## Business Type Applicability Gate (Hard Rule)

This module's default metrics (debt/EBITDA, coverage, covenant headroom) assume an operating company with corporate debt.

- If the company is a **bank/insurer** (regulatory capital and depositor/policyholder liabilities dominate), the module must NOT force debt/EBITDA logic. The triage returns **Insufficient data** with: "Financial institution — requires a separate solvency framework (CET1 / LCR / NSFR / asset quality)."
- If the company is a **REIT-like** entity, treat it as operating but require coverage to include **recurring (maintenance) capex** and lease-like fixed charges; do not use EBITDA addbacks without cash-backing.
- If the company is a **HoldCo/OpCo structure**, structural subordination mapping is mandatory (see Structural Priority & Entity Mapping below).

---

## Core Principles

1. **Survival before upside.** This module exists to find the floor — what breaks, when, and whether the company makes it through. Lead with the downside.
2. **Gross AND net.** Always show gross leverage alongside net. Cash can be trapped, restricted, or offshore; net leverage alone flatters a fragile structure.
3. **The wall, not the average.** A comfortable weighted-average maturity can still hide a dangerous single-year spike. Show the schedule by year, not just the average.
4. **Committed liquidity only.** Liquidity is cash + liquid investments + **committed, undrawn** facilities. Uncommitted lines can be pulled exactly when needed — exclude them and say so.
5. **Covenants in real terms.** State the actual covenant threshold and the actual headroom to it, not a vague "comfortable."
6. **Contingencies are live until proven dormant.** Guarantees, standby LCs, litigation, and tax claims count until evidence shows they are remote. Record the recorded liability AND the maximum exposure.
7. **Be blunt and conservative.** When data is thin, assume the more fragile reading and say why.
8. **Net cash is a strategic asset; reject "optimal leverage" (CLAUDE.md §24, Filter 3).** A strong balance sheet is the one that minimizes debt to maximize the safety of capital — not the one that maximizes debt to minimize the cost of capital. Leverage is the most common cause of permanent loss. Treat net cash and zero/low debt as a positive: it funds counter-cyclical action (holding staff, supporting suppliers/dealers, buying assets cheap, taking strategic bets competitors cannot) precisely when earnings fall. Do NOT mark a net-cash balance sheet down as "lazy" or "sub-optimal." A company that survives every downside haircut on its own, with no refinancing dependence, earns the strongest survival read.

---

## Source Hierarchy (most → least trusted)

1. Annual filings (10-K, 20-F, annual report) — debt notes, maturity tables, covenant disclosures, commitments & contingencies
2. Quarterly filings (10-Q, 6-K)
3. Capital IQ / Bloomberg / FactSet — capital structure summary, fixed-income detail, maturities, ratings
4. Credit rating agency reports (Moody's/S&P/Fitch) if in the pool
5. Earnings transcripts and investor presentations (management commentary on leverage, refi, ratings)
6. User notes
7. Web sources — only for inputs not in the pool (current benchmark interest rates, a rating headline). Label web-sourced numbers, with the date, as unverified.
8. Your own inference — must be labeled *"Inference, not from filings."*

When the deck says "comfortable" and the filing shows a near-term wall, trust the filing.

---

## Evidence Citation Format

Every "Evidence" cell uses this format:

`[Source, Period, Page or Section]`

Examples:
- `FY24 10-K, Note 13 (Debt)`
- `FY24 10-K, Note 18 (Commitments & Contingencies)`
- `Q2 FY26 10-Q, p.18 (maturities)`
- `Capital IQ Capital Structure, data as of 2026-05-09`
- `Q2 FY26 transcript, prepared remarks (refi)`
- `Web: 5Y UST yield, 2026-05-31 (indicative, unverified)`

Do NOT write "company filings" or "annual report" alone — those are not citations.

---

## Calculation Standards

1. Always state the reporting currency and whether EBITDA is **reported** or **adjusted** (and company-defined vs standard).
2. **Gross debt** = all interest-bearing debt (short-term + current portion of long-term + long-term) + finance/capital leases. State whether operating leases are included (IFRS 16 capitalizes them; US GAAP keeps them off the debt line) — show both views if material.
3. **Net debt** = gross debt − cash & equivalents − liquid short-term investments. State the definition; flag restricted or trapped cash.
4. **Leverage:** show BOTH `gross debt / EBITDA` and `net debt / EBITDA`. Label the EBITDA basis. If leverage is quoted on adjusted EBITDA, also give the GAAP-EBITDA-based ratio for the same period.
5. **Interest coverage:** show `EBITDA / interest`, `EBIT / interest`, and `(EBITDA − capex) / interest`. Use gross interest expense unless net interest is disclosed and justified.
6. **Fixed-charge coverage** (where data allows): `(EBITDA − capex) / (gross interest + scheduled debt amortization + lease payments)`.
7. **Liquidity** = cash + liquid short-term investments + **committed, undrawn** facilities. State committed vs uncommitted; exclude uncommitted lines from the headline figure.
8. **Liquidity runway** = liquidity ÷ near-term cash obligations (next-12-month maturities + cash interest + maintenance capex + committed dividends). Express in months or quarters.
9. **Maturity wall:** weighted-average maturity (WAM); % of total debt maturing within 12 / 24 / 36 months; the single largest maturity year.
10. **Rate exposure:** fixed vs floating mix; weighted-average coupon; compare to the current market refinancing cost (web-source the benchmark rate, labeled) to estimate the refi cost step-up.
11. **Covenant headroom** = `(covenant threshold − actual) / threshold`, signed so positive = headroom remaining. Do this for each maintenance covenant (max leverage, min coverage, min liquidity / net worth).
12. **Off-balance-sheet:** record BOTH the recorded liability and the maximum/contingent exposure, with the ratio between them.
13. **Stress:** apply explicit EBITDA haircuts and recompute. Show every formula. A reader must be able to reproduce every number.

### Structural Priority & Entity Mapping (Hard Rules)

1. **HoldCo vs OpCo mapping is mandatory when applicable.** If any material debt sits at a holding company, add an explicit HoldCo/OpCo map and state whether the HoldCo has dividend-upstream access or is structurally subordinated.
2. **Security and collateral must be stated.** For each major instrument: secured/unsecured, collateral type, and whether the collateral is shared with the revolver.
3. **Cross-default / change-of-control / rating-trigger scan.** Record any change-of-control puts, cross-default provisions, and rating-linked pricing steps if disclosed. If not disclosed, state: "Not disclosed in the data pool."

### True Liquidity Availability (Hard Rules)

1. **Revolvers are not "liquidity" unless availability is known.** If a facility is borrowing-base-based, liquidity must use **availability** (commitment − drawings − reserves), not the headline commitment. If availability is not disclosed, headline liquidity must exclude the revolver and show it as "committed but availability unknown" — and state whether that understates or overstates the risk.
2. **Minimum-liquidity and springing covenants.** If any minimum-liquidity requirement exists, subtract it from usable liquidity and state it explicitly.
3. **Trapped/restricted cash.** Usable cash must exclude restricted cash and must flag offshore/trapped cash if disclosed.

### Covenant Definition Rigor (Hard Rules)

1. **Covenant EBITDA is not reported EBITDA.** When covenant headroom is computed, state: the covenant EBITDA definition (addbacks allowed), any addback caps, whether the company is currently using addbacks aggressively (if disclosed), and therefore whether the headroom is high- or low-quality.
2. **Springing covenants must be handled.** If a covenant applies only when revolver utilization exceeds a threshold, state whether it is currently "active" or "not active."
3. **Cure rights must be captured.** If equity cures are permitted, state the size/frequency limits and how they change breach risk.

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

### Balance-Sheet-Survival Module Scores

| Score | Direction | What it measures |
|---|---|---|
| Solvency strength /100 | higher = better | Overall ability to service and repay/refinance debt through a cycle |
| Liquidity runway /100 | higher = better | Cushion of committed liquidity vs near-term obligations |
| Refinancing risk /100 | **higher = WORSE** (inverted) | Exposure to the maturity wall and to a higher refi cost |
| Covenant headroom /100 | higher = better | Distance from the tightest maintenance covenant breach |
| Downside resilience /100 | higher = better | Survival under the downside stress test |
| Data quality /100 | higher = better | Completeness of solvency-relevant data |
| Overall usefulness /100 | higher = better | How useful this module is for the master synthesizer |

**Inverted scores are flagged explicitly** in every table header that uses them.

Be strict. Default to the middle band when uncertain. The synthesis verdict-block scores aggregate the underlying section work — use judgment, do not blindly average.

---

## Solvency Verdict Categories

The synthesis agent must pick exactly one:

- **Fortress balance sheet** — net cash or very low leverage (net debt/EBITDA < ~1x), deep committed liquidity, no near-term wall, wide covenant headroom. Net cash here is a strategic asset (counter-cyclical optionality per §24 Filter 3), not idle capital — credit it as such in the survival read.
- **Solid** — investment-grade-like; comfortable coverage and headroom; maturities laddered and refinanceable in most environments
- **Adequate** — leverage elevated but serviceable; coverage and headroom acceptable; some refinancing or covenant attention needed
- **Stretched** — high leverage, thin covenant headroom, OR a near-term wall whose refinancing is not yet secured; survival depends on refi access or asset sales
- **Distress risk** — covenant breach likely, a near-term liquidity gap, or an unrefinanceable maturity in a plausible downside
- **Insufficient data** — cannot assess solvency from available data

---

## Partial-Data Rules

When specific data is missing, the affected agents must cap their output as described:

| Missing Data | Affected Agents | Rule |
|---|---|---|
| No debt maturity schedule | 02, 06 | Build the wall from the ST/LT split only and flag it; cap refinancing-risk confidence |
| No covenant disclosure | 04, 06 | Use typical market covenants as a LABELED assumption; true headroom cannot be computed; flag |
| No cash flow statement | 03, 04, 06 | FCF and coverage proxied from EBIT/EBITDA; liquidity runway capped |
| No undrawn-facility disclosure | 03 | Liquidity = cash only; flag that it is understated |
| No interest-expense detail | 04 | Coverage proxied from average rate × debt; flag |
| No credit ratings | 99 | Note the absence; do not infer a rating |
| No revolver availability / borrowing-base detail | 03, 06 | Liquidity cannot include the revolver; treat as "availability unknown"; cap liquidity-runway confidence |
| No covenant EBITDA definition / addback detail | 04, 06 | Headroom quality cannot be judged; cap covenant confidence; flag "addback illusion" risk |
| No HoldCo/OpCo disclosure for known HoldCo debt | 01, 99 | Structural subordination not assessable; cap solvency strength |

---

## Score Cap Rules

When data is missing or weak, these hard caps override an agent's own scoring. The synthesis agent applies all applicable caps.

| Missing / Weak Data | Score Cap |
|---|---|
| No debt maturity schedule | Refinancing-risk confidence Low; Solvency strength max 70 |
| No covenant disclosure | Covenant headroom = "Not assessable"; Overall usefulness max 75 |
| No cash flow statement | Liquidity runway max 50 |
| Only annual data (no interim) | Solvency strength max 75 |
| No EBITDA base (stress test cannot run) | Downside resilience = "Not assessable"; Overall usefulness max 70 |
| Off-balance-sheet exposures undisclosed for a known-litigious/levered name | Solvency strength max 75 |
| Revolver exists but availability unknown (borrowing base) | Liquidity runway max 60 |
| Covenant headroom relies on assumed covenant-EBITDA addbacks | Covenant headroom max 60 |
| HoldCo has material debt but upstreaming constraints unclear | Solvency strength max 70 |

If multiple caps affect the same score, use the most restrictive.

---

## Cross-Module Inputs

The balance-sheet-survival module reads outputs from previously-run modules. Under `/research:full` it runs after business-model and earnings.

**From business-model (`analyses/{TICKER}_{DATE}/business-model/`):**
- `10_external-dependency.md` — cyclicality / commodity / policy exposure (calibrates how deep the stress haircut should be)
- `11_capital-allocation-governance.md` — debt trajectory, acquisition-driven leverage, pledging, related-party exposure
- `03_segment-map.md` — the asset base (informs asset-sale capacity as a liquidity lever)

**From earnings (`analyses/{TICKER}_{DATE}/earnings/`):**
- `01_historical-financials.md` — EBITDA, EBIT, CFO, FCF, capex, net debt, and the leverage trend
- `06_earnings-quality.md` — cash conversion (is the EBITDA used for coverage/leverage actually cash-backed?)
- `03_margin-drivers.md` — how far margins (and thus EBITDA) can fall in a downside

**From valuation (`analyses/{TICKER}_{DATE}/valuation/`), if available:**
- `01_price-and-capital-structure.md` — the EV bridge / debt stack can be reused as a cross-check

If a cross-module file is missing, the affected agent proceeds independently and states:
*"{module} cross-module input not available — proceeding on this module's own read of the data pool."*

---

## Stress-Test Rule (Hard Rule)

The `06_downside-stress-test` agent is mandatory and must run:

**A) EBITDA haircuts (base set):** −30%, −40%, −60%. For a deep cyclical/commodity name (per `10_external-dependency`), also calibrate one haircut to the trough-to-peak EBITDA range from the company's own history.

**B) PLUS at least two liquidity / market shocks:**
1. **Working-capital shock:** add a cash outflow equal to a disclosed seasonal build, or — if not disclosed — a labeled assumption (e.g., X% of revenue) with the value stated.
2. **Rate shock:** if material floating-rate exposure exists, apply +200 bps to the floating portion (net of hedges if disclosed).
3. **Market closure:** assume refinancing markets are shut for 12 months (no new unsecured issuance); revolver draws are allowed only if availability is known.

For each scenario, recompute net leverage, coverage, covenant headroom (breach Y/N), and the 12-month liquidity gap.

The stress test must state: which factor breaks first (covenant, liquidity, or maturity), the EBITDA decline where it breaks, and what external action is required (waiver, asset sale, equity, restructuring). It uses cash-backed EBITDA (cross-checked against `earnings/06_earnings-quality`), not headline adjusted EBITDA, where the two differ materially.

---

## Style Rules

- Plain English. Short sentences.
- Plain enough for a non-finance reader (CLAUDE.md §21): use the simplest word that keeps the meaning, and the first time a finance term appears (e.g. net leverage, covenant headroom, fixed-charge coverage, liquidity runway) keep the term and its number but add a short plain meaning in a clause. Plain is not vague — never drop a number or a citation.
- Every important claim → evidence in the same paragraph or table row, in the citation format above.
- Numbers beat adjectives. Show the formula behind every ratio.
- Label all inference: *"Inference, not from filings."*

### Banned phrases

These may NOT appear unless paired with a specific number in the same sentence:

- "adequate liquidity" (state the runway in months)
- "manageable debt" / "manageable leverage" (state the leverage ratio)
- "well-capitalized" (state the ratio)
- "ample headroom" / "comfortable headroom" (state the actual headroom %)
- "comfortable coverage" (state the coverage ratio)
- "no near-term maturities" (state the maturity schedule)
- "strong balance sheet" (state net leverage and liquidity)
- "deleveraging on track" (state the leverage path with numbers)

---

## Out-of-Scope Requests

If the invocation message asks for anything outside a subagent's specific scope — a fair value / price target, scenario probabilities, risk/reward, a Buy/Sell rating, position sizing — do NOT comply. Produce the standard report and add:
`Out-of-scope request received: [describe]. This belongs to the valuation module or the master synthesizer, not the balance-sheet-survival module.`

---

## Inputs Every Subagent Receives

- `TICKER` — company ticker
- `DATA_PATH` — `data/{TICKER}/`
- `OUTPUT_PATH` — `analyses/{TICKER}_{DATE}/balance-sheet-survival/{NN}_{name}.md`
- `DATE` — today's date
- `UPSTREAM_INPUTS` — paths to outputs from agents this one depends on (in-module and cross-module; may be empty)

Read these from the invocation message. Never hardcode.

---

## Output Path Convention

`analyses/{TICKER}_{DATE}/balance-sheet-survival/{NN}_{agent-name}.md`

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

A good Balance-Sheet-Survival module output should let the master synthesizer answer five questions quickly:

1. How levered is it, gross and net, and is that rising or falling?
2. When is the maturity wall, and is the refinancing secured or exposed?
3. How long is the liquidity runway against near-term obligations?
4. How close is the tightest covenant to breaking?
5. Does the company survive a 30–60% EBITDA decline — and if not, at what point does it break?

---

## Subagent List & Execution Layers

Layer 0 (sequential, fail-fast):
- `00_solvency-data-triage`

Layer 1 (sequential — the foundation everything else needs):
- `01_capital-structure-and-leverage`

Layer 2 (parallel, all depend on `01`):
- `02_maturity-wall-and-refinancing`
- `03_liquidity-runway`
- `04_coverage-and-covenants`
- `05_off-balance-sheet-and-contingencies`

Layer 3 (sequential — the survival test, depends on `01`–`05`):
- `06_downside-stress-test`

Layer 4 (sequential, synthesizer):
- `99_balance-sheet-survival-synthesis` (depends on all prior)

If an upstream output is missing, the dependent subagent notes it explicitly:
*"Upstream output missing: [name] — proceeding with available data."*
