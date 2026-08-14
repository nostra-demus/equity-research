# earnings Module Dossier — ORCL

> Deterministic, lossless concatenation of every artifact in this module — the module synthesis and every specialist output, in order. Generated mechanically (no LLM rewriting), so nothing is omitted or paraphrased. This is the module's "see everything" tier; the module's decision lives in `99_*-synthesis.md` and the short read in `earnings_memo.md`.

- Generated: 2026-08-14T06:57:57Z
- Module folder: `earnings`
- Contents: 1 module synthesis + 9 specialist outputs = 10 files

## Table of Contents

- [earnings — module synthesis](#earnings-module-synthesis) — `99_earnings-synthesis.md`
- [earnings / 00_earnings-data-triage.md](#earnings-00-earnings-data-triage-md) — `00_earnings-data-triage.md`
- [earnings / 01_historical-financials.md](#earnings-01-historical-financials-md) — `01_historical-financials.md`
- [earnings / 02_revenue-drivers.md](#earnings-02-revenue-drivers-md) — `02_revenue-drivers.md`
- [earnings / 03_margin-drivers.md](#earnings-03-margin-drivers-md) — `03_margin-drivers.md`
- [earnings / 04_guidance-consensus.md](#earnings-04-guidance-consensus-md) — `04_guidance-consensus.md`
- [earnings / 05_beat-miss-setup.md](#earnings-05-beat-miss-setup-md) — `05_beat-miss-setup.md`
- [earnings / 06_earnings-quality.md](#earnings-06-earnings-quality-md) — `06_earnings-quality.md`
- [earnings / 07_earnings-sensitivity.md](#earnings-07-earnings-sensitivity-md) — `07_earnings-sensitivity.md`
- [earnings / 08_earnings-red-flags.md](#earnings-08-earnings-red-flags-md) — `08_earnings-red-flags.md`


---

## earnings — module synthesis

_Source: `99_earnings-synthesis.md`_

# Earnings Module — ORCL (Synthesis)

## Abstract

Oracle's earnings setup is mixed, not a clean acceleration. Revenue is genuinely re-accelerating on cloud-infrastructure demand: the contracted-but-unrecognized order book (RPO) rose 363% to $638 billion in one year, and that backlog is currently limited by data-center supply, not customer demand, with 98% of AI capacity already contracted. Management's FQ1 FY2027 and full-year guidance sit within roughly 0.1%-0.7% of Street consensus, a fair bar, neither easy nor hard to clear. The biggest earnings risk is that a pullback from any one of four customers who each contracted over $8 billion in a single quarter would hit revenue directly against a debt load that grew 54% in a year to $167.4 billion, funding capacity built for that same concentrated demand.

## 1. Earnings Verdict

- **Verdict: Mixed earnings setup** — revenue is clearly accelerating (17.3% FY26, guided 27%-29% for FQ1 FY2027), but GAAP operating margin is roughly flat (-21bps) and guided to worsen further in FY27, and reported earnings growth leans heavily on items that will not repeat (a one-time $2.7bn investment gain, a GAAP-to-non-GAAP gap of 39%-42% of operating income, and EBITDA flattery from a 97.1%-YoY depreciation step-up). Revenue, margins, and quality point in different directions, so the setup does not clear the bar for a clean "accelerating" call [`02_revenue-drivers.md` §7; `03_margin-drivers.md` §3, §8; `06_earnings-quality.md` §9-10].
- Earnings quality /100: **62** *(06_earnings-quality — "mostly clean but some working capital or adjustment noise"; this figure should not be read in isolation from the business-model capital-allocation-governance score of 42/100, which grades the same facts more broadly — see Section 3)*
- Consensus setup /100 *(higher = more beatable)*: **52** *(from 04_guidance-consensus — bar assessed "fair": guidance-vs-consensus gaps of 0.03%-0.74%, thin recent revision breadth (+2 net last month vs +22/+10 over three months), and a clean operating beat rate closer to a coin flip once one-off gains are stripped from the headline beat streak)*
- Earnings volatility /100 *(higher = worse)*: **68** *(from 07_earnings-sensitivity — "High volatility" band; confidence on the precise number is Medium-Low because 5 of 6 variables rest on inference, not a company-disclosed sensitivity)*
- Next-quarter setup: **Balanced** *(from 05_beat-miss-setup — hinges on an unquantified capex-to-revenue margin-timing lag that management itself declines to size in quarters)*
- Biggest earnings driver (one line): Cloud infrastructure (OCI) capacity conversion from the $638bn RPO backlog — 79% of FY26's revenue growth, currently supply-constrained not demand-constrained [`02_revenue-drivers.md` §6a-7].
- Biggest earnings risk (one line): A pullback or delay from one of the four customers that each contracted over $8bn in a single quarter (AMD, Meta, NVIDIA, OpenAI, TikTok, xAI named) would hit revenue directly against a debt load that rose 54% in one year to $167.4bn and was raised specifically to fund capacity built for that same concentrated demand [`07_earnings-sensitivity.md` §4-5; `08_earnings-red-flags.md` §5].
- Red-flag severity verdict (verbatim from `08_earnings-red-flags.md` §5): **Material concerns** — high-severity flags present; earnings setup may be overstated or fragile.

## 1A. Module Disconfirmation

- **Strongest bear point:** FY26's headline growth (GAAP net income available to common +36%, EPS +34%) is not a clean read of the underlying business — a $2.7bn one-time Ampere Computing gain, a GAAP-to-non-GAAP operating-income gap of 39%-42% for two straight years running (mostly stock-based compensation), and restructuring charges that recurred under a newly-named plan in consecutive years together mean the "acceleration" is partly a presentation artifact, not a repeatable operating result [`06_earnings-quality.md` §7-8, §10].
- **Strongest bull point:** The revenue engine behind the acceleration is real, organic, and cash-backed — RPO grew 363% to $638bn on named, signed contracts, FX and M&A together explain only ~1pp of the 17.3% growth, and normalised CFO/EBITDA (net of a large customer-prepayment surge) still sits around 90%, a genuinely healthy conversion rate [`02_revenue-drivers.md` §3, §6a; `06_earnings-quality.md` §1].
- **Single killer risk:** A pullback from one of the four customers that each contracted over $8bn in Q4 FY26 alone, which would hit revenue directly while the associated data-center cost base (and the debt raised to build it) is already sunk — modeled at a $6.9bn EBITDA downside, roughly 23% of FY26 EBITDA, in a 20% stress case [`07_earnings-sensitivity.md` §2, §4].
- **Disconfirming evidence already visible:** Gross margin already compressed 469bps in FY26 and management has pre-announced it will "step down" further in FY27 due to the data-center expensing-to-revenue timing lag — the margin deterioration this thesis worries about is not hypothetical, it is already guided [`03_margin-drivers.md` §3, §9]. Days payable outstanding nearly tripled (43 to 128 days) in two years, a live signal that part of the capex build is being funded by stretching supplier terms rather than pure operating cash generation [`06_earnings-quality.md` §3].

## 2. Specialist Roll-Up

| Specialist | Verdict Line | Biggest Finding |
|---|---|---|
| earnings-data-triage | Sufficient — no active partial-data caps, no critical missing items | Full data set: audited 10-K, latest 10-Q, two verbatim CIQ transcripts, live consensus/revisions export, complete quarterly financials FQ1 2016-FQ4 2026 |
| historical-financials | Revenue "Accelerating" (17.3% FY26); FCF "Decelerating (turned negative)" | FY26 capex jumped 162% to $55,663M, turning FCF from -$394M (FY25) to -$23,686M (FY26) even as CFO grew 53.6% and net debt (strict) rose 38.7% to $136,143M |
| revenue-drivers | Growth is organic and demand-led, supply-constrained not demand-constrained | Cloud infrastructure/RPO conversion is 79% of FY26's 17.35pp revenue growth (13.71pp of it), with essentially zero decomposition residual |
| margin-drivers | GAAP operating margin roughly flat (-21bps); gross margin compressed 469bps and guided to worsen further | Cost of revenue (data-center capacity cost) is the single biggest margin driver, offset almost exactly by opex leverage (+502bps) — the two are separately earned, not the same driver reversing |
| guidance-consensus | Bar is "fair" | Guidance-vs-consensus gaps of 0.03%-0.74%; clean-quarter revision breadth thins to +2 net (Revenue, EPS) once the post-print re-basing wave is excluded |
| beat-miss-setup | Setup is "balanced" | Whether an in-line-to-strong revenue print converts to an EPS beat depends on an unquantified capex-to-revenue margin-timing lag; FQ1 is Oracle's seasonally smallest, thinnest-margin quarter and the year-ago comp missed both lines |
| earnings-quality | 62/100 — mostly clean but some working capital/adjustment noise | Core cash engine is genuinely strong (normalised CFO/EBITDA ~90%), but FY26's reported growth leans on a one-time investment gain, recurring "one-off" restructuring, and a 39-42% GAAP-to-non-GAAP gap |
| earnings-sensitivity | Volatility 68/100 (inverted, High band) | AI-customer/counterparty concentration inside RPO is the single highest-sensitivity variable ($6.9bn EBITDA downside, ~23% of FY26 EBITDA), largely outside company control |

## 3. Reconciliation

Two disagreements surfaced across the specialist outputs, both already flagged upstream by `08_earnings-red-flags.md` §1 and carried forward here rather than averaged away:

1. **EBIT trend direction.** `01_historical-financials.md` §1 labels the headline EBIT trend "Inflecting" using a Capital IQ-derived figure (33.2% FY26 margin) that excludes restructuring charges. `03_margin-drivers.md` §3 shows the audited GAAP operating margin was roughly flat to slightly down (30.59% FY26 vs 30.80% FY25, -21bps). Both figures are internally correct on their own stated basis, and `01` discloses the gap in its own footnote. Per CLAUDE.md §4/§5, the audited GAAP figure outranks a data-vendor construct that excludes a real reported expense line — this synthesis treats `03`'s flat-to-slightly-down GAAP read as the more credible trend, not `01`'s "Inflecting" label.
2. **Earnings-quality score vs capital-allocation score.** `06_earnings-quality.md` scores earnings quality 62/100 ("mostly clean"), while the business-model module's `11_capital-allocation-governance.md` scores the same underlying facts 42/100 ("capital allocation concerns") and characterizes the presentation as "stronger than the cash-generative core of the business currently supports." These are not factually inconsistent — `06` grades narrow cash-earnings quality (CFO vs EBITDA, accrual flags), while `11` grades the broader capital-structure and governance picture (debt trajectory, dividend coverage, credit rating). Per `08_earnings-red-flags.md` §1 and §6, this synthesis carries both readings rather than letting the narrower, more comfortable score stand alone — see Section 5b.

No other material disagreements between specialists were identified.

## 4. Score Cap Application

| Cap Trigger | Applied? (Y/N) | Affected Score | Final Cap |
|---|---|---|---|
| No consensus / estimate data | N — consensus, revisions, surprise, and guidance tabs all present and current [`00_earnings-data-triage.md` §5] | Consensus setup | Not applicable |
| No cash flow statement | N — audited cash flow statement present in the 10-K and CIQ exports | Earnings quality | Not applicable |
| No revision history | N — Revisions and Recent Changes tabs present, including same-day entries | Consensus setup | Not applicable |
| No verbatim transcript AND no sell-side proxy | N — verbatim CIQ transcripts present for both FQ3 and FQ4 FY2026 | Earnings clarity | Not applicable |
| Transcript role filled ONLY by a sell-side proxy | N — verbatim transcripts available, not a proxy | Earnings clarity | Not applicable |
| Only inferred sensitivities | **Y** — 5 of 6 variables in `07_earnings-sensitivity.md` §1, §7 rest on inference, not a company-disclosed sensitivity (only FX is company-disclosed, FY26 10-K Item 7A) | Earnings volatility confidence | **Confidence set to Low** on the precise 68/100 figure — the High-volatility band read is retained, but the exact number should not be treated as precisely calibrated |

No other cap is triggered; this module's own data-sufficiency verdict is "Sufficient" with no active partial-data caps [`00_earnings-data-triage.md` §6].

## 5. Earnings Setup Summary

### Revenue Setup

The current revenue trajectory is real and organic — FX and M&A together explain only about 1pp of FY26's 17.3% growth, and the decomposition in `02_revenue-drivers.md` §6a reconciles to essentially zero residual — but it is not a steady-state run rate. FY26's 77% cloud-infrastructure growth and 363% RPO surge sit well above Oracle's own 5-year revenue CAGR and above management's own guided FY25-FY30 long-term CAGR of 31%, meaning the current pace should be read as peak-of-cycle-adjacent, not a baseline to extrapolate [`02_revenue-drivers.md` §7]. The single factor that would flip revenue direction is a pullback, delay, or renegotiation by one of the four customers that each contracted over $8bn in a single quarter (named: AMD, Meta, NVIDIA, OpenAI, TikTok, xAI) — the same concentration that is currently the largest positive contributor to growth is, structurally, the largest way it reverses [`02_revenue-drivers.md` §4; `07_earnings-sensitivity.md` §4]. There is no material gap between reported and organic revenue to name here — unlike margins, the revenue growth decomposition reconciles cleanly and is not distorted by a one-off.

### Margin Setup

Current margins are not at a cyclical peak; they are mid-transition, and the transition is guided to continue worsening before it improves. Gross margin fell 469bps in FY26 because new data-center capacity is expensed from the day it goes live but takes an unquantified "multiple quarters" to reach full contracted revenue — management has already pre-announced FY27 gross margin will "step down" further for the same reason [`03_margin-drivers.md` §3, §9]. The segment or driver that does the most damage if it worsens another 10-20% is cost of revenue itself (the data-center capacity cost line) — it is already the single largest component of the FY26 margin bridge at -469bps, larger than any other line, and it is the one driver management itself says will get worse, not better, next year [`03_margin-drivers.md` §7-8]. Oracle's own protection mechanism is contract design, not a blanket pass-through: CEO Magouyrk describes fixed-price contracts only where cost certainty exists at signing, with a floating-cost mechanism reserved for contracts signed under uncertainty — meaning already-locked fixed-price contracts absorb any subsequent GPU/memory cost inflation with no contractual recourse [`03_margin-drivers.md` §3]. Opex leverage (+502bps combined S&M/R&D/G&A) offset the gross-margin hit almost exactly in FY26, but that offset is partly funded by a restructuring charge that recurred under a newly-named plan for the second straight year, so its durability into FY27 is an open question, not a given [`03_margin-drivers.md` §5; `06_earnings-quality.md` §8].

### Quality Check

The single largest gap between reported and economic earnings is the combination of a one-time $2.7bn investment gain and a persistent 39%-42%-of-operating-income GAAP-to-non-GAAP adjustment (mostly stock-based compensation), and that gap is not narrowing — it has held at roughly the same size for two straight years [`06_earnings-quality.md` §7]. The recurring items management treats as one-offs — restructuring charges under successive named plans (2024 Plan, 2026 Plan) — function economically like an ongoing cost, not a genuine non-repeating item, even though each individual charge is real and disclosed [`06_earnings-quality.md` §5, §8]. To model normalized earnings for next year, the more defensible starting point is management's own ex-gains figure (18% non-GAAP EPS growth, not the 34% GAAP headline) rather than either raw GAAP or the full non-GAAP number, because both extremes embed a distortion in opposite directions — GAAP embeds the SBC/restructuring/amortization noise, non-GAAP embeds the one-time investment gain and excludes real recurring costs [`06_earnings-quality.md` §4, §10; `04_guidance-consensus.md` §2].

### Consensus Bar

For Oracle to beat the current bar by a material margin, the data-center capacity conversion lag would need to run shorter than management's own unquantified "multiple quarters" assumption — the single variable the beat/miss setup itself names as most likely to move the outcome [`05_beat-miss-setup.md` §10]. The bar looks most likely to be set correctly on revenue (guidance and consensus sit within 0.1%-0.74% of each other at both the quarterly and full-year level) but slightly soft on the "clean" EPS read specifically, since the historical beat streak used to calibrate expectations is inflated by one-time gains in two of the last three EPS "beats" [`04_guidance-consensus.md` §3, §6-7]. A meaningful share of the positive revision breadth cited in the consensus data (net +22 Revenue, +10 EPS over three months) is anchored to the same 2026-06-10 print and guidance event, not an independent re-rating since — the cleaner one-month window shows only mild net upgrades (+2 on both), so the bar is not being actively re-priced upward by the Street beyond what management already told them [`04_guidance-consensus.md` §5].

## 5b. Leverage & Capital Structure

Both triggers fire: net debt/EBITDA is 4.46x (well above the 3.0x trigger) and total debt rose 54% year over year (above the 50% trigger), so this section is required.

Net debt (strict basis: total debt minus cash and equivalents) stood at $136,143M at FY26-end (May-31-2026), up 38.7% from $98,166M a year earlier, putting net debt/EBITDA at 4.46x on the Capital-IQ-derived EBITDA basis used throughout this module ($30,494M) — the highest level in the five-year window [`01_historical-financials.md` §1]. On a gross basis, total debt jumped 54% in one year, from $108.95bn (FY25) to $167.43bn (FY26), on $42.7bn of new senior notes plus $5.0bn of Mandatory Convertible Preferred Stock; business-model's own capital-allocation read puts gross Total Debt/EBITDA at 5.03x and states Net Debt/(EBITDA-Capex) is no longer computable because FY26 capex ($55.7bn) exceeded all of EBITDA outright [`business-model/11_capital-allocation-governance.md` §1]. The single largest driver of the leverage change is the AI-datacenter capex ramp itself ($55,663M net cash capex, +162% YoY), which the debt and preferred-stock issuance were raised to fund — not an acquisition or buyback [`01_historical-financials.md` §1; `business-model/11_capital-allocation-governance.md` §1]. The EBITDA used in the module's headline 4.46x ratio is the Capital-IQ-derived figure built on an EBIT that excludes restructuring charges ($30,494M); using GAAP operating income ($20,606M) plus D&A ($8,109M) instead gives a GAAP-based EBITDA of $28,715M and a net debt/GAAP-EBITDA ratio of 4.74x — modestly worse than the headline figure [`01_historical-financials.md` §1, §4; `03_margin-drivers.md` §3]. Debt maturity profile (the fraction due within 24 months and its weighted-average rate versus current market rates) is **not disclosed** in any upstream output read for this synthesis — stated explicitly as not assessable from available data. Elevated leverage is already constraining capital allocation: buybacks fell to $93M in FY26 from $600M in FY25 (effectively stopped), the $5.8bn FY26 common dividend is now funded by debt and preferred-stock proceeds rather than free cash flow (levered FCF was -$24.5bn), and S&P downgraded Oracle's issuer credit rating to BBB- (from BBB, stable outlook) on 2026-07-09 — one notch above non-investment grade [`business-model/11_capital-allocation-governance.md` §1-3].

## 6. Key Numbers

- Revenue growth rate: +17.3% FY26 YoY ($57,399M → $67,357M); guided +27%-29% CC/USD for FQ1 FY2027 [`01_historical-financials.md` §1; `04_guidance-consensus.md` §2]
- EBITDA margin: 45.3% FY26 (Capital-IQ-derived basis, excludes restructuring from EBIT); GAAP-based EBITDA margin ≈42.6% ($28,715M/$67,357M) [`01_historical-financials.md` §1; `03_margin-drivers.md` §3]
- EPS: $5.83 diluted GAAP FY26 (+34.3% YoY); $7.63 Non-GAAP FY26; FY27 Non-GAAP guide $8.05 point (≈18% growth ex-gains per management) [`01_historical-financials.md` §1, §4; `04_guidance-consensus.md` §2]
- CFO / EBITDA: 104.9% reported FY26; 89.6% normalised (net of a $4,642M customer-prepayment surge) [`06_earnings-quality.md` §1]
- Biggest driver current level: Cloud infrastructure (OCI) revenue $18,101M FY26 (+77% USD); total RPO $638bn (+363% YoY) [`02_revenue-drivers.md` §4]
- Consensus gap: FY27 revenue consensus $89,337M vs guide $90,000M (-0.74%); FY27 Non-GAAP EPS consensus $8.053 vs guide $8.05 (+0.04%) [`04_guidance-consensus.md` §3]
- Estimate revision direction: Positive but thinning — net +2 (Revenue and EPS, FY2027) over the last month vs +22/+10 over three months [`04_guidance-consensus.md` §5]
- Earnings volatility score: 68/100 (inverted, higher = worse), High-volatility band, confidence Low on the precise figure [`07_earnings-sensitivity.md` §7]

## 7. What Would Change The Earnings Verdict?

| Current Verdict | What Would Upgrade It | What Would Downgrade It | Data Needed |
|---|---|---|---|
| Mixed earnings setup | FY27 gross margin stabilizes or improves faster than management's own "step down" guidance, and/or the clean (ex-one-off) operating EPS beat rate improves beyond a coin flip for two consecutive quarters | A pullback, delay, or renegotiation from any of the four largest RPO customers; a further gross-margin step-down beyond what's already guided; a second credit-rating downgrade below investment grade | FQ1 FY2027 results (due 2026-09-04), a company-disclosed debt maturity/rate schedule, and a customer-level concentration or diversification metric in a future filing |

Consensus setup is not "Unknown" for ORCL — estimate data is live and current — so this verdict is not constrained by the no-consensus rule; the Mixed classification instead reflects genuine, evidence-based divergence between the revenue trend (accelerating) and the margin/quality trend (flat-to-worsening, distorted by one-offs), not a data gap.

## 8. Note To The Final Synthesizer

- Revenue is accelerating and demand-led (RPO +363% to $638bn, supply-constrained not demand-constrained), but this is peak-of-cycle-adjacent — well above Oracle's own 5-year CAGR and above management's own guided long-term CAGR — and should not be extrapolated as a steady-state rate.
- Earnings are cash-backed at the core (normalised CFO/EBITDA ≈90%), but the reported growth headline is not clean: it is inflated by a one-time $2.7bn investment gain, an EBITDA/D&A flattery effect, and recurring restructuring charges booked as one-offs under successive named plans.
- The consensus bar is fair, not conspicuously easy or hard — guidance and consensus sit within 0.1%-0.74% of each other, and most of the positive revision breadth simply reflects analysts re-anchoring to the June 2026 print rather than an independent re-rating since.
- Next-quarter setup is balanced; the single swing factor is an unquantified capex-to-revenue margin-timing lag that management itself declines to size in quarters, and FQ1 is Oracle's seasonally smallest, thinnest-margin quarter with a year-ago comp that missed both lines.
- The top sensitivity variable — AI-infrastructure customer/counterparty concentration inside RPO — is currently a tailwind (backlog growing) but is structurally the same channel through which the setup would most likely break; it compounds with a debt load that grew 54% in one year and was raised to fund capacity built for that same concentrated demand.
- No partial-data cap applies to this module's headline scores; the only confidence limitation is that 5 of 6 earnings-sensitivity variables rest on inference rather than a company-disclosed sensitivity, which caps confidence (not the score itself) on the 68/100 volatility figure at Low.
- The single biggest missing data point is a company-disclosed debt maturity schedule and rate profile — Oracle carries $129.5bn-$167.4bn of debt with no filed interest-rate sensitivity table, and the pool contains no maturity-bucket breakdown.
- **Red-flag severity verdict (verbatim from `08_earnings-red-flags.md` §5): Material concerns** — 23 red flags triggered (11 High, 11 Medium, 2 Low, 1 Unclear), zero Critical. The single most dangerous flag is the compounding link between customer/counterparty concentration (~23% of FY26 EBITDA at risk in a stress case) and the $129.5bn-$167.4bn debt load sized to serve that same demand.
- High-severity flags not otherwise covered above and explicitly carried forward per the mandatory propagation rule: (1) the GAAP-to-non-GAAP operating-income gap has run 39%-42% for two straight years, driven mainly by stock-based compensation; (2) days payable outstanding nearly tripled (43→128 days) in two years, meaning the capex build is partly funded by stretched supplier terms, not just debt and cash flow; (3) no company-disclosed interest-rate sensitivity exists despite the debt load and a fresh S&P downgrade to BBB- — one notch above non-investment grade.
- Forensic tag check: `06_earnings-quality.md` §6 explicitly did NOT emit RF-EQ-001 (only 1 of 6 accrual-quality flags triggered, below the 2-flag threshold) and did NOT find a cash-conversion breakdown (RF-EQ-002 conditions not met — CFO/EBITDA has not fallen below 50% for 2+ of the last 3 years). Neither forensic tag fired; none to propagate.
- What would change the verdict: see Section 7 — most decisively, evidence on whether the gross-margin step-down management has already guided for FY2027 tracks or exceeds their own assumption, and whether any of the four largest named RPO customers shows signs of pulling back.

## 9. Simple Summary

- Revenue is speeding up, driven almost entirely by AI cloud-infrastructure demand (RPO backlog up 363% to $638 billion) — but the current pace is faster than Oracle's own long-term guided growth rate, so it should not be treated as the new normal.
- Margins are not improving — gross margin fell 469 basis points this year and management says it will fall further next year, because new data centers cost money the day they turn on but take quarters to earn their full contracted revenue.
- Earnings are not fully clean: a one-time $2.7 billion investment gain and recurring "one-off" restructuring charges inflated this year's headline growth numbers; strip those out and profit growth is closer to 18%, not the 34% headline.
- The Wall Street bar for next quarter is fair — not stacked against Oracle, not conspicuously easy either.
- The setup going into the next print is balanced, hinging on whether new data centers start earning revenue as fast as management assumes.
- The single biggest swing factor is customer concentration — four customers each signed contracts over $8 billion in one quarter, and any one of them pulling back would hit revenue hard while the debt raised to build their capacity stays on the books.
- Earnings volatility is high (68 out of 100, where higher is worse) — small changes in a few key variables can move earnings by a meaningful amount.
- This module is useful to the final synthesizer: it separates a genuinely strong revenue story from a genuinely questionable earnings-quality and leverage story, which a single blended score would hide.



---

## earnings / 00_earnings-data-triage.md

_Source: `00_earnings-data-triage.md`_

# Earnings Data Triage — ORCL

## 0. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country | United States | 10-K cover page: "Oracle Corporation ... Delaware ... Austin, Texas" [FY26 10-K, cover page] |
| Exchange | New York Stock Exchange (NYSE: ORCL) | [FY26 10-K, cover page — "Common Stock ... ORCL ... New York Stock Exchange"] |
| Filing regime | US SEC | Form 10-K / Form 10-Q filed under Securities Exchange Act of 1934 [FY26 10-K, cover page; Q3 FY26 10-Q, cover page] |
| Reporting standard | US GAAP | "Acctg. Standard: US GAAP" [Capital IQ Estimates Report, Consensus tab, header] |
| Reporting currency | US Dollar (USD) | "Currency: Reported Currency" / "$" figures throughout [FY26 Earnings Press Release, Jun-10-2026] |
| Fiscal-year end | May 31 | "For the fiscal year ended May 31, 2026" [FY26 10-K, cover page] |
| Document language(s) | English (all documents) | — |

No jurisdiction-mapping issue: this is a standard US SEC filer. 10-K = audited annual filing; 10-Q = interim filing; 8-K-equivalent role for the latest quarter is filled by the earnings press release (Q4 FY26 results are reported in the press release + 10-K MD&A, not a standalone 10-Q — normal for US filers, since Q4 has no separate 10-Q).

## 1. File Inventory

Multi-tab workbooks were pre-extracted via `extract_pool.py` (11 workbooks → 56 tabs; 66 extract files; 0 failures — confirmed in `_pool_extracts/manifest.json`, all 21 top-level sources `status: ok`). Every tab is listed below as its own row, reconciled against `_pool_extracts/manifest.md`.

| Filename | Type | Period Covered | Last Modified (Drive sync — not authoritative) | Earnings Relevance |
|---|---|---|---|---|
| Oracle_Corporation_-_Form_10-K(Jun-22-2026).doc | Annual filing (10-K) | FY2026, ended May-31-2026 (filed Jun-22-2026) | Aug 14 2026 (sync date) | High |
| Oracle_Corporation_-_Form_10-Q(Mar-11-2026).doc | Quarterly filing (10-Q) | Q3 FY2026, ended Feb-28-2026 (filed Mar-11-2026) | Aug 14 2026 (sync date) | High |
| Oracle_Earnings Press Release Q4FY26.pdf | Earnings press release | Q4 & FY2026, ended May-31-2026 (dated Jun-10-2026) | Aug 14 2026 (sync date) | High |
| Oracle_Latest_Earnings_Presentation-Slides-Q4-26.pdf | Investor deck | Q4 & FY2026 (dated Jun-10-2026) | Aug 14 2026 (sync date) | High |
| Oracle Corporation, Q4 2026 Earnings Call, Jun 10, 2026.rtf | Verbatim transcript (CIQ) | FQ4 2026 call, Jun-10-2026 | Aug 14 2026 (sync date) | High |
| Oracle Corporation, Q3 2026 Earnings Call, Mar 10, 2026.rtf | Verbatim transcript (CIQ) | FQ3 2026 call, Mar-10-2026 | Aug 14 2026 (sync date) | High |
| OracleCorporationNYSEORCLEstimatesReport.xls → Consensus | Consensus/estimate export | Current FY end May-31-2027; FQ1 2027 release Sep-04-2026 | Aug 14 2026 (sync date) | High |
| OracleCorporationNYSEORCLEstimatesReport.xls → Recent Changes | Estimate revisions | Rolling, most recent rows dated today (e.g. "5:30 AM" same-day) | Aug 14 2026 (sync date) | High |
| OracleCorporationNYSEORCLEstimatesReport.xls → Guidance | Guidance data | Latest: FY2027 guidance confirmed Jun-10-2026; FQ1 FY2027 guidance issued Jun-10-2026 | Aug 14 2026 (sync date) | High |
| OracleCorporationNYSEORCLEstimatesReport.xls → Surprise | Estimate/actuals surprise history | FY1999–FY2026 | Aug 14 2026 (sync date) | High |
| OracleCorporationNYSEORCLEstimatesReport.xls → Trends | Estimate trend history | Multi-year, through FY2027+ estimates | Aug 14 2026 (sync date) | Medium |
| OracleCorporationNYSEORCLEstimatesReport.xls → Revisions | EPS/revenue revision history | FQ1 2027 through FY2036 estimates | Aug 14 2026 (sync date) | Medium |
| OracleCorporationNYSEORCLEstimatesReport.xls → Multiples | Consensus-based multiples | Current | Aug 14 2026 (sync date) | Low |
| Oracle Corporation NYSE ORCL Financials_Quarterly.xls → Income Statement | Data export (quarterly financials) | FQ1 2016 (Aug-2016) through latest reported quarter | Aug 14 2026 (sync date) | High |
| Oracle Corporation NYSE ORCL Financials_Quarterly.xls → Balance Sheet | Data export (quarterly financials) | FQ1 2016 through latest reported quarter | Aug 14 2026 (sync date) | High |
| Oracle Corporation NYSE ORCL Financials_Quarterly.xls → Cash Flow | Data export (quarterly financials) | FQ1 2016 through latest reported quarter | Aug 14 2026 (sync date) | High |
| Oracle Corporation NYSE ORCL Financials_Quarterly.xls → Segments | Data export (quarterly segment) | FQ1 2016 through latest reported quarter | Aug 14 2026 (sync date) | High |
| Oracle Corporation NYSE ORCL Financials_Quarterly.xls → Ratios | Data export (quarterly ratios) | Same range | Aug 14 2026 (sync date) | Medium |
| Oracle Corporation NYSE ORCL Financials_Quarterly.xls → Key Stats | Data export | Same range | Aug 14 2026 (sync date) | Medium |
| Oracle Corporation NYSE ORCL Financials_Quarterly.xls → Multiples | Data export (valuation) | Same range | Aug 14 2026 (sync date) | Low |
| Oracle Corporation NYSE ORCL Financials_Quarterly.xls → Capital Structure Summary | Data export | Same range | Aug 14 2026 (sync date) | Medium |
| Oracle Corporation NYSE ORCL Financials_Quarterly.xls → Capital Structure Details | Data export | Same range | Aug 14 2026 (sync date) | Low |
| Oracle Corporation NYSE ORCL Financials_Quarterly.xls → Historical Capitalization | Data export | Same range | Aug 14 2026 (sync date) | Low |
| Oracle Corporation NYSE ORCL Financials_Quarterly.xls → Supplemental | Data export | Same range | Aug 14 2026 (sync date) | Low |
| Oracle Corporation NYSE ORCL Financials_Quarterly.xls → Industry Specific | Data export | Same range | Aug 14 2026 (sync date) | Low |
| Oracle Corporation NYSE ORCL Financials_Quarterly.xls → Pension OPEB | Data export | Same range | Aug 14 2026 (sync date) | Low |
| Oracle Corporation NYSE ORCL Financials_Annual.xls → Income Statement | Data export (annual financials) | FY2017 through FY2026 | Aug 14 2026 (sync date) | High |
| Oracle Corporation NYSE ORCL Financials_Annual.xls → Balance Sheet | Data export (annual financials) | FY2017 through FY2026 | Aug 14 2026 (sync date) | High |
| Oracle Corporation NYSE ORCL Financials_Annual.xls → Cash Flow | Data export (annual financials) | FY2017 through FY2026 | Aug 14 2026 (sync date) | High |
| Oracle Corporation NYSE ORCL Financials_Annual.xls → Segments | Data export (annual segment) | FY2017 through FY2026 | Aug 14 2026 (sync date) | High |
| Oracle Corporation NYSE ORCL Financials_Annual.xls → Ratios | Data export | Same range | Aug 14 2026 (sync date) | Medium |
| Oracle Corporation NYSE ORCL Financials_Annual.xls → Key Stats | Data export | Same range | Aug 14 2026 (sync date) | Medium |
| Oracle Corporation NYSE ORCL Financials_Annual.xls → Multiples | Data export | Same range | Aug 14 2026 (sync date) | Low |
| Oracle Corporation NYSE ORCL Financials_Annual.xls → Capital Structure Summary | Data export | Same range | Aug 14 2026 (sync date) | Medium |
| Oracle Corporation NYSE ORCL Financials_Annual.xls → Capital Structure Details | Data export | Same range | Aug 14 2026 (sync date) | Low |
| Oracle Corporation NYSE ORCL Financials_Annual.xls → Historical Capitalization | Data export | Same range | Aug 14 2026 (sync date) | Low |
| Oracle Corporation NYSE ORCL Financials_Annual.xls → Supplemental | Data export | Same range | Aug 14 2026 (sync date) | Low |
| Oracle Corporation NYSE ORCL Financials_Annual.xls → Industry Specific | Data export | Same range | Aug 14 2026 (sync date) | Low |
| Oracle Corporation NYSE ORCL Financials_Annual.xls → Pension OPEB | Data export | Same range | Aug 14 2026 (sync date) | Low |
| Company Comparable Analysis Oracle Corporation.xls → Financial Data | Data export (comps) | As-Of 2026-08-13 | Aug 14 2026 (sync date) | Medium |
| Company Comparable Analysis Oracle Corporation.xls → Trading Multiples | Data export (comps) | As-Of 2026-08-13 | Aug 14 2026 (sync date) | Low |
| Company Comparable Analysis Oracle Corporation.xls → Operating Statistics | Data export (comps) | As-Of 2026-08-13 | Aug 14 2026 (sync date) | Low |
| Company Comparable Analysis Oracle Corporation.xls → Implied Valuation | Data export (comps) | As-Of 2026-08-13 | Aug 14 2026 (sync date) | Low |
| Company Comparable Analysis Oracle Corporation.xls → Valuation Chart | Data export (comps) | As-Of 2026-08-13 | Aug 14 2026 (sync date) | Low |
| Company Comparable Analysis Oracle Corporation.xls → Credit Health Panel | Data export | As-Of 2026-08-13 | Aug 14 2026 (sync date) | Low |
| Company Comparable Analysis Oracle Corporation.xls → Business Description | Data export | Current | Aug 14 2026 (sync date) | Low |
| Company Comparable Analysis Oracle Corporation.xls → Disclaimer | Boilerplate | — | Aug 14 2026 (sync date) | Low |
| Oracle Corporation NYSE ORCL Credit Health Panel.xls → Summary | Data export (credit) | Current | Aug 14 2026 (sync date) | Low |
| Oracle Corporation NYSE ORCL Credit Health Panel.xls → Financials | Data export (credit) | Current | Aug 14 2026 (sync date) | Low |
| Oracle Corporation NYSE ORCL Credit Health Panel.xls → Operational Metrics Charts | Data export (credit) | Current | Aug 14 2026 (sync date) | Low |
| Oracle Corporation NYSE ORCL Credit Health Panel.xls → Solvency Metrics Charts | Data export (credit) | Current | Aug 14 2026 (sync date) | Low |
| Oracle Corporation NYSE ORCL Credit Health Panel.xls → Liquidity Metrics Charts | Data export (credit) | Current | Aug 14 2026 (sync date) | Low |
| Oracle Corporation NYSE ORCL Credit Health Panel.xls → Disclaimer | Boilerplate | — | Aug 14 2026 (sync date) | Low |
| ORCL_Charting Excel Export - Aug 13th 2026.xls → Pane 1 | Price/volume data export | Through 2026-08-12 | Aug 14 2026 (sync date) | Medium (stock reaction context only) |
| ORCL_Charting Excel Export - Aug 13th 2026.xls → Raw | Empty stub (0×0) | — | Aug 14 2026 (sync date) | Low |
| ORCL_Charting Excel Export - Aug 13th 2026.xls → Attributions | Boilerplate | — | Aug 14 2026 (sync date) | Low |
| Oracle_Short_Interest_Charting Excel Export Aug-13-2026.xls → Chart 1 with Data | Data export (short interest) | Through Aug-13-2026 | Aug 14 2026 (sync date) | Low |
| Oracle_Short_Interest_Charting Excel Export Aug-13-2026.xls → Attributions | Boilerplate | — | Aug 14 2026 (sync date) | Low |
| Oracle Corporation NYSE ORCL Events Calendar.xls → Events Calendar | Data export (event dates) | Includes FQ1 2027 release Sep-04-2026 | Aug 14 2026 (sync date) | Medium |
| Oracle Corporation NYSE ORCL Key Developments.xls → Key Developments | Data export (news/events log) | Through 2026-08-12 | Aug 14 2026 (sync date) | Medium |
| Oracle Corporation NYSE ORCL Public Company Profile.rtf | Data export (profile) | Current | Aug 14 2026 (sync date) | Low |
| Oracle Corporation NYSE ORCL Customers.rtf | Data export (customers, last 2 yrs) | Rolling 2-year window | Aug 14 2026 (sync date) | Low |
| Oracle Corporation NYSE ORCL Suppliers.rtf | Data export (suppliers, last 2 yrs) | Rolling 2-year window | Aug 14 2026 (sync date) | Low |
| Oracle Corporation NYSE ORCL Public Ownership History.xls → History | Data export (ownership) | Historical | Aug 14 2026 (sync date) | Low |
| Oracle Corporation NYSE ORCL Public Ownership Insider Trading.xls → Insider Trading | Data export (insider trades) | Historical through recent | Aug 14 2026 (sync date) | Low |
| Oracle Corporation NYSE ORCL Public Ownership Summary.rtf | Data export (ownership summary) | Current | Aug 14 2026 (sync date) | Low |

No external-data documents present (`data/ORCL/external/` does not exist) — Section 1A omitted.

## 2. Most Recent Sources

| Source Type | Filename | Period | Age (months, as of 2026-08-14) |
|---|---|---|---|
| Annual filing | Oracle_Corporation_-_Form_10-K(Jun-22-2026).doc | FY2026, ended May-31-2026 (filed Jun-22-2026) | ~1.7 |
| Quarterly filing | Oracle_Corporation_-_Form_10-Q(Mar-11-2026).doc | Q3 FY2026, ended Feb-28-2026 (filed Mar-11-2026) | ~5.1 (note: the most recent QUARTER, Q4 FY26, is covered by the earnings press release + 10-K MD&A, not a standalone 10-Q — normal for a US filer, since Q4 is reported inside the annual filing) |
| Earnings transcript | Oracle Corporation, Q4 2026 Earnings Call, Jun 10, 2026.rtf | FQ4 2026 call | ~2.1 |
| Investor deck | Oracle_Latest_Earnings_Presentation-Slides-Q4-26.pdf | Q4 & FY2026 | ~2.1 |
| Consensus / estimate export | OracleCorporationNYSEORCLEstimatesReport.xls (Consensus tab) | Live as of data pull; Current FY end May-31-2027, FQ1 2027 release Sep-04-2026; Recent Changes tab shows same-day revisions | <1 day |
| Cash flow data | Oracle Corporation NYSE ORCL Financials_Quarterly.xls (Cash Flow tab) | Through latest reported quarter (FQ4 2026) | ~2.1 |
| Guidance data | OracleCorporationNYSEORCLEstimatesReport.xls (Guidance tab) | FY2027 guidance confirmed and FQ1 FY2027 guidance issued Jun-10-2026 | ~2.1 |

## 3. Earnings Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Income statement | Y | FY26 10-K (audited); Financials_Annual.xls / Financials_Quarterly.xls Income Statement tabs; earnings press release | Needed for revenue, margin, EPS |
| Balance sheet | Y | FY26 10-K (audited); Financials_Annual.xls / Financials_Quarterly.xls Balance Sheet tabs | Needed for working capital and leverage |
| Cash flow statement | Y | FY26 10-K (audited); Financials_Annual.xls / Financials_Quarterly.xls Cash Flow tabs | Needed for CFO, FCF, earnings quality |
| Latest quarter | Y | Q4 FY26 earnings press release (Jun-10-2026) + FY26 10-K MD&A; Financials_Quarterly.xls through FQ4 2026 | Needed for trend and setup |
| Last 8 quarters | Y | Financials_Quarterly.xls Income Statement/Balance Sheet/Cash Flow/Segments tabs run FQ1 2016 through the latest reported quarter — well over 8 quarters | Needed for seasonality and inflection |
| Consensus estimates | Y | OracleCorporationNYSEORCLEstimatesReport.xls Consensus tab, live/current as of the data pull | Needed for market bar |
| Estimate revisions | Y | OracleCorporationNYSEORCLEstimatesReport.xls Recent Changes and Revisions tabs, including same-day entries | Needed for revision momentum |
| Earnings transcript | Y | Verbatim CIQ transcripts for FQ3 2026 (Mar-10-2026) and FQ4 2026 (Jun-10-2026) — both carry Call Participants / Presentation / Q&A structure, confirming verbatim status, not a sell-side proxy | Needed for management tone and driver detail |
| Segment P&L | Y | FY26 10-K, Note 13 (Segment Information); Financials_Annual.xls / Financials_Quarterly.xls Segments tabs | Needed for mix shift |
| Current price | Y | ORCL_Charting Excel Export (Pane 1 tab), daily price data through 2026-08-12; Company Comparable Analysis As-Of 2026-08-13 | Needed only for master-level stock reaction context |

## 4. Cross-Module Availability

| Business-Model Output | Available? (Y/N) |
|---|---|
| 03_segment-map.md | Y — present at `analyses/ORCL_2026-08-14/business-model/03_segment-map.md` (Cloud and Software / Hardware / Services segments per FY26 10-K, Note 13) |
| 06_value-chain.md | Y — present at `analyses/ORCL_2026-08-14/business-model/06_value-chain.md` |
| 10_external-dependency.md | Y — present at `analyses/ORCL_2026-08-14/business-model/10_external-dependency.md` |

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No consensus / estimate data | N — consensus, revisions, surprise, guidance, and trends tabs are all present and current | 04, 05, 99 | Not applicable |
| No quarterly data | N — quarterly financials, segments, and cash flow run FQ1 2016 through the latest reported quarter | 01, 02, 03, 06 | Not applicable |
| No VERBATIM transcript, sell-side proxy present | N — both FQ3 2026 and FQ4 2026 transcripts are verbatim CIQ call transcripts (full Presentation + Q&A) | 02, 03, 04 | Not applicable |
| No transcript AND no sell-side proxy | N | 02, 03, 04 | Not applicable |
| No segment-level P&L | N — Note 13 of the 10-K and the Segments tabs in both Financials workbooks provide segment P&L | 02, 03, 99 | Not applicable |
| No cash flow statement | N — audited cash flow statement in the 10-K, plus Cash Flow tabs in both Financials workbooks | 06, 99 | Not applicable |
| No current price | N — daily price series through 2026-08-12 (ORCL_Charting Excel Export, Pane 1 tab) | 99 | Not applicable |

## 6. Sufficiency Verdict

- **Verdict:** Sufficient
- **Reason:** The pool contains the audited FY2026 10-K, the latest 10-Q (Q3 FY26), the Q4 FY26 earnings press release, two verbatim CIQ earnings-call transcripts (FQ3 and FQ4 2026), a live/current consensus and revisions export, and complete income statement, balance sheet, and cash flow data at both annual and quarterly granularity (FQ1 2016 through FQ4 2026) — every element of the sufficiency rule is met with no extraction failures across all 21 source files / 56 workbook tabs.
- **Active partial-data caps:** None.
- **Critical missing items:** None.



---

## earnings / 01_historical-financials.md

_Source: `01_historical-financials.md`_

# Historical Financials — ORCL

All figures in USD millions except per-share items. Reporting standard: US GAAP. Fiscal year ends May 31 (e.g., "FY2026" = the year ended May 31, 2026). Source data pulled from Oracle's audited FY2026 Form 10-K (filed 2026-06-22), the Q3 FY2026 Form 10-Q (filed 2026-03-11), the Q4 FY2026 earnings press release (dated 2026-06-10), and Capital IQ financial-data exports (data as of 2026-08-13).

## 1. Annual Financial Table (5 years, FY2022–FY2026)

| Metric | FY2022 | FY2023 | FY2024 | FY2025 | FY2026 | Trend |
|---|---:|---:|---:|---:|---:|---|
| Revenue | 42,440 | 49,954 | 52,961 | 57,399 | 67,357 | Accelerating |
| Revenue YoY % | 4.8% | 17.7% | 6.0% | 8.4% | 17.3% | Volatile → re-accelerating |
| Gross Profit | 33,563 | 36,390 | 37,818 | 40,472 | 44,336 | Stable |
| Gross Margin % | 79.1% | 72.9% | 71.4% | 70.5% | 65.8% | Decelerating (compressing) |
| EBITDA | 18,958 | 19,778 | 21,896 | 22,333 | 30,494 | Volatile → Accelerating |
| EBITDA Margin % | 44.7% | 39.6% | 41.3% | 38.9% | 45.3% | Volatile |
| EBIT | 15,836 | 13,670 | 15,757 | 17,977 | 22,385 | Inflecting |
| EBIT Margin % | 37.3% | 27.4% | 29.7% | 31.3% | 33.2% | Inflecting |
| EPS (diluted) | 2.41 | 3.07 | 3.71 | 4.34 | 5.83 | Volatile → Accelerating |
| CFO | 9,539 | 17,165 | 18,673 | 20,821 | 31,977 | Accelerating |
| Capex | (4,511) | (8,695) | (6,866) | (21,215) | (55,663) | Accelerating (spend ramp) |
| FCF (CFO – Capex) | 5,028 | 8,470 | 11,807 | (394) | (23,686) | Decelerating (turned negative) |
| Working Capital | 12,122 | (2,086) | (8,990) | (8,064) | 4,803 | Volatile |
| Net Debt (strict)* | 54,476 | 80,716 | 83,960 | 98,166 | 136,143 | Accelerating (rising) |
| Net Debt / EBITDA | 2.87x | 4.08x | 3.83x | 4.40x | 4.46x | Accelerating (rising) |

Trend column uses exactly one of: Accelerating / Stable / Decelerating / Volatile / Inflecting. Where the underlying trajectory is not one-directional (e.g., a mid-period dip followed by recovery), the label reflects the dominant multi-year shape, with the specific pattern named in Section 6.

\* Net Debt (strict) = Total Debt − Cash and Equivalents only, per CLAUDE.md §15 default. Capital IQ's own "Net Debt" field additionally nets short-term investments (a broader basis): FY2022 53,957 / FY2023 80,294 / FY2024 83,753 / FY2025 97,749 / FY2026 135,538 [Financials_Annual.xls, Balance Sheet tab]. The gap is small (short-term investments are minor — $605M at FY2026) but the two bases are not interchangeable; this table uses the strict basis throughout and the strict figure drives the Net Debt/EBITDA ratio above.

FCF = CFO − total capex (capex shown as a negative cash outflow in the source; absolute value used for the subtraction). Computed: FY2022 9,539 − 4,511 = 5,028; FY2023 17,165 − 8,695 = 8,470; FY2024 18,673 − 6,866 = 11,807; FY2025 20,821 − 21,215 = −394; FY2026 31,977 − 55,663 = −23,686 [1][2].

Working Capital = Total Current Assets − Total Current Liabilities [1].

Note on EBIT sourcing: the CIQ "EBIT"/"Operating Income" field used above (and in the FY2022–FY2025 columns, for which no press-release GAAP-to-non-GAAP bridge is available in the pool) excludes restructuring & other charges from operating income — it is not identical to Oracle's own GAAP operating income line in the 10-K income statement. For FY2026, GAAP operating income per the audited 10-K/press release is $20,606M (31% margin) versus the CIQ EBIT figure of $22,385M (33.2% margin) used in the table above; the ~$1,779M gap is explained by CIQ excluding restructuring charges ($1,779M in the CIQ annual income statement's "Restructuring Charges" line for FY2026) from its EBIT calculation [2][8]. This is a real classification difference, not a data error — flagged per CLAUDE.md §5 (cite the source the number came from). Section 4 below uses the company's own GAAP and non-GAAP figures directly for FY2026 and FY2025.

## 2. TTM Snapshot

Oracle's fiscal Q4 (May 31 fiscal year-end) means the latest reported quarter's trailing-twelve-month (TTM) window equals the full FY2026 fiscal year, and the prior TTM window equals the full FY2025 fiscal year.

| Metric | Latest TTM (FY2026, ended May-31-2026) | Prior TTM (FY2025, ended May-31-2025) | Change | Evidence |
|---|---:|---:|---:|---|
| Revenue | 67,357 | 57,399 | +17.3% | [2] Financials_Annual.xls, Income Statement tab |
| EBITDA | 30,494 | 22,333 | +36.5% | [2] |
| EBIT | 22,385 | 17,977 | +24.5% | [2] (see EBIT sourcing note above) |
| EPS diluted | 5.83 | 4.34 | +34.3% | [2] |
| CFO | 31,977 | 20,821 | +53.6% | [3] Financials_Annual.xls, Cash Flow tab |
| Capex | (55,663) | (21,215) | +162.4% | [3] |
| FCF | (23,686) | (394) | Turned more negative by $23,292 | [3], calc shown above |
| Net debt at latest period-end (strict) | 136,143 | 98,166 | +38.7% | [4] Financials_Annual.xls, Balance Sheet tab |

Net debt is a point-in-time balance-sheet metric, not a TTM flow metric — the two columns above show the balance at each period's fiscal year-end, not a trailing sum.

## 3. Latest Quarterly Trend Table (8 quarters, FY2025 Q1 – FY2026 Q4)

| Metric | FY25 Q1 (Aug-24) | FY25 Q2 (Nov-24) | FY25 Q3 (Feb-25) | FY25 Q4 (May-25) | FY26 Q1 (Aug-25) | FY26 Q2 (Nov-25) | FY26 Q3 (Feb-26) | FY26 Q4 (May-26) | QoQ Trend | YoY vs Same Q |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|---|
| Revenue | 13,307 | 14,059 | 14,130 | 15,903 | 14,926 | 16,058 | 17,190 | 19,184 | Accelerating | +20.6% (Q4 FY26 vs Q4 FY25) |
| Gross Margin % | 70.7% | 70.9% | 70.3% | 70.2% | 67.3% | 66.5% | 64.6% | 65.2% | Decelerating (compressing) | −500 bps (Q4 FY26 vs Q4 FY25) |
| EBITDA | 4,998 | 5,332 | 5,544 | 6,458 | 6,152 | 6,959 | 7,894 | 9,488 | Accelerating | +46.9% (Q4 FY26 vs Q4 FY25) |
| EBITDA Margin % | 37.6% | 37.9% | 39.2% | 40.6% | 41.2% | 43.3% | 45.9% | 49.5% | Accelerating (expanding) | +887 bps (Q4 FY26 vs Q4 FY25) |
| EPS (diluted) | 1.03 | 1.10 | 1.02 | 1.19 | 1.01 | 2.10 | 1.27 | 1.45 | Volatile | +21.8% (Q4 FY26 vs Q4 FY25) |

Note on FY26 Q2 EPS ($2.10): this quarter includes a $2,493M pre-tax gain on sale of investments [Financials_Quarterly.xls, Income Statement tab, "Gain (Loss) On Sale Of Invest." row, Nov-30-2025 column], which the Q4 FY26 press release identifies as a $2.7 billion gain from the sale of Oracle's investment in Ampere Computing Holdings LLC [8, p.4 non-operating income discussion]. This is a one-time, non-operating item — the FY26 Q2 EPS spike is not a run-rate operating result and should not be extrapolated into the QoQ/YoY trend read for underlying earnings power.

QoQ Trend and YoY vs Same Q are single summary labels/figures per row, covering the full 8-quarter window; individual quarter-over-quarter moves within the window are visible in the row itself.

Source: [5] Financials_Quarterly.xls, Income Statement tab, Capital IQ, data as of 2026-08-13.

## 4. Reported vs Adjusted Metrics

Oracle discloses non-GAAP figures for operating income, net income, and EPS; it does not disclose a separate non-GAAP EBITDA. All figures below are FY2026 (year ended May-31-2026) vs FY2025 (year ended May-31-2025), as reported in the Q4 FY2026 earnings press release's GAAP-to-non-GAAP reconciliation.

| Metric | Reported (GAAP) FY2026 | Adjusted (Non-GAAP) FY2026 | Adjustment Amount | Adjustment Reason | Evidence |
|---|---:|---:|---:|---|---|
| Operating Income (EBIT) | 20,606 | 28,926 | +8,320 | Stock-based compensation +4,811; amortization of intangibles +1,671; restructuring & other +1,838 | [8] Q4 FY2026 Earnings Press Release, "Reconciliation of Selected GAAP Measures to Non-GAAP Measures," FY2026 YTD table, p.4 |
| EBITDA | Not separately disclosed by the company | Not separately disclosed by the company | — | Oracle's non-GAAP framework adjusts operating income and EPS only; it does not publish a company-defined non-GAAP EBITDA. An implied figure (non-GAAP operating income $28,926M + D&A $8,109M ≈ $37,035M) can be derived but is not a company-disclosed number — labeled: Inference, not from filings. | [8]; D&A from [3] Cash Flow tab, "Depreciation & Amort., Total," FY2026 |
| EPS (diluted) | 5.83 | 7.63 | +1.80 | Same three addbacks as operating income, net of the non-GAAP effective tax rate (19.9% FY2026 vs 12.6% GAAP) | [8], reconciliation table and footnote (5), p.4 |

| Metric | Reported (GAAP) FY2025 | Adjusted (Non-GAAP) FY2025 | Adjustment Amount | Adjustment Reason | Evidence |
|---|---:|---:|---:|---:|---|
| Operating Income (EBIT) | 17,678 | 25,033 | +7,355 | Stock-based compensation +4,674; amortization of intangibles +2,307; restructuring & other +374 | [8], same table, FY2025 column |
| EPS (diluted) | 4.34 | 6.03 | +1.69 | Same addbacks, net of non-GAAP tax rate (19.7% FY2025 vs 12.1% GAAP) | [8] |

Reported vs adjusted figures are kept in separate rows throughout this report; the annual table in Section 1 uses reported/CIQ-sourced figures only (with the EBIT sourcing caveat noted there), never blending GAAP and non-GAAP within a single cell.

## 5. Quarterly Seasonality Table (last 3 fiscal years, FY2024–FY2026)

| Quarter | FY2024 Rev Share | FY2025 Rev Share | FY2026 Rev Share | Avg Rev Share | FY2024 EBITDA Margin | FY2025 EBITDA Margin | FY2026 EBITDA Margin |
|---|---:|---:|---:|---:|---:|---:|---:|
| Q1 (Aug) | 23.5% | 23.2% | 22.2% | 23.0% | 38.1% | 37.6% | 41.2% |
| Q2 (Nov) | 24.4% | 24.5% | 23.8% | 24.3% | 39.5% | 37.9% | 43.3% |
| Q3 (Feb) | 25.1% | 24.6% | 25.5% | 25.1% | 39.4% | 39.2% | 45.9% |
| Q4 (May) | 27.0% | 27.7% | 28.5% | 27.7% | 43.0% | 40.6% | 49.5% |

No quarter falls below the 20% floor. Q4 (the fiscal year-end quarter) is the largest quarter every year and is trending toward the 30% flag threshold: 27.0% (FY2024) → 27.7% (FY2025) → 28.5% (FY2026), a rising Q4 concentration rather than a stable seasonal pattern. Q4 also carries the highest EBITDA margin in every year shown (43.0% / 40.6% / 49.5%), consistent with a large-deal, license-and-renewal-heavy fiscal year-end push layered on top of the recurring cloud revenue base.

Data-reconciliation note: quarterly EBITDA figures in this table are drawn directly from the Financials_Quarterly.xls tab and are internally self-consistent within the quarterly series, but for FY2023 and FY2024 the sum of the four quarterly EBITDA figures (as captured in the quarterly export) does not exactly tie to the corresponding annual EBITDA figure in Financials_Annual.xls (e.g., FY2024: quarterly sum $21,228M vs annual $21,896M, a $668M gap) — this reflects a post-quarter reclassification captured in the annual "Reclassified" restatement flag [2] that was not back-applied to the older quarterly columns in [5]. FY2025 and FY2026 quarterly sums tie to their annual figures within rounding ($22,332M vs $22,333M; $30,493M vs $30,494M), so this table's most decision-relevant years are unaffected.

## 6. Key Trend Summary

Revenue growth is re-accelerating after a mid-cycle dip: 4.8% (FY2022) → 17.7% (FY2023, boosted by the Cerner acquisition which closed June 2022 and contributed a full year for the first time) → 6.0% (FY2024, as the Cerner comparison normalized) → 8.4% (FY2025) → 17.3% (FY2026) [2]. The FY2026 acceleration is organic and cloud-infrastructure-led rather than acquisition-driven — quarterly revenue growth stepped up every quarter of FY2026 (12.2% → 14.2% → 21.7% → 20.6% YoY, Section 3) — so the dominant direction is Accelerating, not simply volatile. Margins show a split picture: gross margin has compressed every year for five straight years (79.1% → 65.8%, a 1,326bps decline, Section 1), consistent with the mix shift toward capital-intensive cloud infrastructure revenue, while EBITDA and EBIT margins troughed in FY2023 (39.6% / 27.4%) and have since inflected upward to 45.3% / 33.2% in FY2026 — an Inflecting pattern, not a simple compression story, because the FY2023 trough was driven by one-time Cerner-related restructuring and amortization that has since rolled off. There is material, and growing, seasonality: fiscal Q4 (May quarter-end) is the largest quarter in every one of the last three fiscal years and its share of annual revenue has risen each year (27.0% → 27.7% → 28.5%), alongside the highest EBITDA margin of any quarter. The clearest inflection point in the last five years is the FY2026 capex ramp: capital expenditure jumped from $21,215M (FY2025) to $55,663M (FY2026, +162%), driving free cash flow from a small negative (−$394M, FY2025) to sharply negative (−$23,686M, FY2026) even as operating cash flow grew 53.6% — this is an AI/cloud-infrastructure buildout, not a deterioration in the underlying business, but it is the single largest swing in this dataset and it has pushed net debt up 38.7% in one year (to $136,143M strict basis) and net debt/EBITDA to 4.46x, the highest level in the five-year window (Section 1).

## 7. Citations

[1] FY2026 Form 10-K (Oracle_Corporation_-_Form_10-K, filed 2026-06-22), audited consolidated balance sheet and income statement
[2] Oracle Corporation NYSE ORCL Financials_Annual.xls, Income Statement tab — Capital IQ & proprietary data, data as of 2026-08-13
[3] Oracle Corporation NYSE ORCL Financials_Annual.xls, Cash Flow tab — Capital IQ & proprietary data, data as of 2026-08-13
[4] Oracle Corporation NYSE ORCL Financials_Annual.xls, Balance Sheet tab — Capital IQ & proprietary data, data as of 2026-08-13
[5] Oracle Corporation NYSE ORCL Financials_Quarterly.xls, Income Statement tab — Capital IQ & proprietary data, data as of 2026-08-13
[6] Oracle Corporation NYSE ORCL Financials_Quarterly.xls, Cash Flow tab — Capital IQ & proprietary data, data as of 2026-08-13
[7] Oracle Corporation NYSE ORCL Financials_Quarterly.xls, Balance Sheet tab — Capital IQ & proprietary data, data as of 2026-08-13
[8] Oracle Q4 FY2026 Earnings Press Release (dated 2026-06-10), "Reconciliation of Selected GAAP Measures to Non-GAAP Measures," pp.4–5 (fiscal 2026 year-to-date table) and pp.1–2 (headline non-GAAP EPS growth, Ampere gain discussion)
[9] Q3 FY2026 Form 10-Q (Oracle_Corporation_-_Form_10-Q, filed 2026-03-11)

All growth rates, margins (in bps where noted), TTM figures, FCF, and leverage ratios in this report were computed via an executed Python script against the source figures above (not mental arithmetic); the script and its output are retained in the agent's tool-call log for this run.



---

## earnings / 02_revenue-drivers.md

_Source: `02_revenue-drivers.md`_

# Revenue Drivers — ORCL

All figures USD millions unless stated. Fiscal year ends May 31 (FY2026 = year ended May-31-2026). Reporting standard: US GAAP. Latest reported quarter: FQ4 FY2026 (Jun-10-2026 press release/call); next release FQ1 FY2027 due 2026-09-04 (not yet reported).

## 1. Segment Decomposition Status

Segment decomposition applied — business-model `03_segment-map.md` is available and used [`analyses/ORCL_2026-08-14/business-model/03_segment-map.md`]. Oracle reports three ASC 280 operating segments — Cloud and Software, Hardware, Services — but Cloud and Software alone is 86.9% of FY26 revenue ($58,530M of $67,357M) and 90.7% of FY26 segment profit [FY26 10-K, Note 13 (Segment Information), p.100], clearing the module's >85%-from-one-segment bar. So this report gives full driver tables for all three segments (Section 5) but treats Oracle as, in substance, a single-segment company for the purpose of naming "the" biggest driver (Section 7) — and within Cloud and Software itself, MD&A discloses a finer offering-level split (cloud applications / cloud infrastructure / software license / software support) that is the real locus of the story and is used throughout this report [FY26 10-K, Item 7 MD&A, "Revenues by Offerings," p.45].

## 2. Revenue Driver Tree

| Business Type | Revenue Formula |
|---|---|
| Multi-segment (SaaS-hybrid + hardware + services) | Sum of segment revenue drivers |

Oracle's own formula, stated per offering [`business-model/02_business-identity.md`, Section 2; FY26 10-K, Item 1 Business, p.1-4]:
- Cloud infrastructure (OCI/IaaS): revenue = compute & storage capacity delivered (GPUs, gigawatts) × usage/contracted rate.
- Cloud applications (SaaS): revenue = subscribing customers × modules/seats × subscription price, recognized ratably over 1–5-year contracts.
- Software license + support: revenue = new licenses sold up front + installed base × support renewal rate (~1-year contracts, priced as a % of the license fee).
- Hardware: units sold × price, plus hardware support priced as a % of the hardware fee.
- Services: consulting/customer-success hours or fixed-fee engagements billed.

Company-specific one-line formula: **Total revenue = (cloud infrastructure capacity × contracted rate) + (SaaS seats × subscription price) + (installed-base software renewals + new license sales) + hardware units × price + services hours billed** — of which cloud infrastructure is now the fastest-growing and most capital-intensive line, and is currently supply- (not demand-) constrained (Section 7).

## 3. Market / Share / Price / Mix Split

| Driver Bucket | Current Direction | Evidence | Importance /100 |
|---|---|---|---:|
| End-market demand | Improving, strongly — AI infrastructure and enterprise cloud migration demand is the dominant swing factor; total Remaining Performance Obligations (RPO, i.e. contracted-but-unrecognized revenue — a forward order book) rose from $138B to $638B, +363% YoY, "primarily attributable to certain significant cloud contracts" [FY26 10-K, Item 7 MD&A, p.55; Q4 FY26 transcript, CFO Maxson] | +$500bn RPO increase in one year, concentrated in named large AI-infrastructure customers (AMD, Meta, NVIDIA, OpenAI, TikTok, xAI and others) [Key Developments, 2026-02-02] | 90 |
| Company market share | Mixed by sub-market — gaining share off a small base in cloud infrastructure (Oracle ~3% of global cloud-infra spend vs AWS 28%/Azure 21%/Google Cloud 14%, but Oracle's 77% FY26 infra revenue growth and 363% RPO growth outpace AWS's 20–37% and approach Google Cloud's ~63%); likely losing relative share in cloud applications (Oracle SaaS +11% vs SAP cloud/backlog growth of 22–27%) [`business-model/08_competitive-map.md` §3-4, citing Web: Synergy Research Group, 2026 (unverified, dated)] | Third-party/web-sourced, dated and labelled unverified per source hierarchy — directional only | 55 |
| Price / realization | Not separately disclosed for cloud infrastructure (no unit price or ASP metric published); for software support, USD growth (+1%) roughly equals installed-base retention with flat-to-slightly-negative constant-currency pricing (-1% CC) [FY26 10-K, Item 7 MD&A, "Revenues by Offerings," p.45] | Software support $19,804M (+1% USD / -1% CC) vs $19,523M FY25 | 20 |
| Product / customer / geography mix | Improving toward cloud, deteriorating for legacy license — cloud (apps+infra) rose from 43% to 51% of total company revenue in one year; software license fell -9% (-10% CC) [FY26 10-K, Item 7 MD&A, p.38, p.45]. Geographically, the Americas contributed 88% of FY26 constant-currency revenue growth vs EMEA 5% and Asia Pacific 7% [`business-model/02_business-identity.md` §1, citing FY26 10-K Item 7, p.41 area] — a US-concentration mix shift, consistent with AI-datacenter siting | Cloud share of revenue 43%→51% YoY; Americas 88% of CC growth | 75 |
| FX translation | Small net tailwind — FY26 total revenue grew 17% USD vs 16% constant currency (CC), i.e. roughly +1pp of the +17.3% reported growth came from currency translation, not underlying activity [Q4 FY26 investor deck, slide 4, "FY 2026 Financial Highlights"] | 17% USD / 16% CD | 10 |
| M&A / divestitures | None disclosed as revenue-affecting in FY26 — the Cerner acquisition (closed June 2022) is fully lapped in the base period and no new consolidated acquisition or divestiture is disclosed in the FY26 10-K MD&A revenue discussion. (The $2.7bn Ampere Computing gain in FQ2 FY26 was a gain on sale of an equity investment, booked below the operating line — it is a non-operating item, not a revenue-line divestiture, per `01_historical-financials.md` §3 note) | [FY26 10-K, Item 7 MD&A revenue discussion; `01_historical-financials.md`] | 0 |

This confirms growth is overwhelmingly organic and demand-led (not FX- or M&A-driven): FX added only ~1pp of the +17.3% FY26 revenue growth, and there is no acquisition contribution to flag as inorganic. The growth is real activity — end-market demand and product mix shift toward cloud infrastructure — not currency or deal-driven, so it is fair to describe the current setup as organic demand growth, subject to the customer-concentration caveat in Section 7.

## 4. Revenue Driver Table (consolidated)

| Driver | Current Level | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Cloud infrastructure (OCI/IaaS) capacity & bookings | $18,101M FY26 revenue (+77% USD / +75% CC); Q4 FY26 alone +93% YoY to $5.8B | Improving | High | [FY26 10-K, Item 7 MD&A, "Revenues by Offerings," p.45; Q4 FY26 investor deck, slide 4] |
| Remaining Performance Obligations (RPO) / forward order book | $638B total RPO (+363% YoY); +$85B added in Q4 FY26 alone; 12% expected to convert to revenue in next 12 months (~$76.6B implied cRPO), 34% in months 13-36, 34% in months 37-60, remainder thereafter | Improving | High | [FY26 10-K, Item 7 MD&A, p.55; Note 1; Q4 FY26 transcript, CFO Maxson prepared remarks; Q4 FY26 investor deck, slide 8] |
| Data-center / GPU capacity (supply-side constraint) | +1.2GW incremental DC capacity added in FY26; 97.5% AI-infrastructure utilization; 98% of AI datacenter capacity already contracted | Improving, but the binding constraint on growth is now supply (power + GPU availability), not demand | High | [Q4 FY26 investor deck, slide 7; Q4 FY26 transcript, CEO Magouyrk prepared remarks] |
| Cloud applications (SaaS) | $15,888M FY26 revenue (+11% USD / +10% CC) | Stable-to-improving, but decelerating relative to cloud infrastructure and trailing SAP's cloud/backlog growth (22-27%) | Mid | [FY26 10-K, Item 7 MD&A, p.45; `business-model/08_competitive-map.md` §3] |
| Software license (on-premise, new sales) | $4,737M FY26 revenue (-9% USD / -10% CC) | Deteriorating | Low | [FY26 10-K, Item 7 MD&A, p.45] |
| Software support (installed-base renewals) | $19,804M FY26 revenue (+1% USD / -1% CC) | Stable (flat, FX-driven headline) | Mid | [FY26 10-K, Item 7 MD&A, p.45] |
| Customer/counterparty concentration within RPO | 4 customers contracted >$8B each in Q4 FY26 alone; named large counterparties include AMD, Meta, NVIDIA, OpenAI, TikTok, xAI [Q4 FY26 transcript, CEO Magouyrk; Key Developments, 2026-02-02] | Deteriorating as a risk factor even while adding revenue — a pullback by any one of these names could reverse a High-magnitude portion of forward revenue | High | [`business-model/10_external-dependency.md` §1, "Industrial cycle"] |
| Geographic mix (US vs international) | US revenue $32,075M→$39,835M FY25→FY26 (+24.2%) vs UK/Germany/Japan/Other Countries combined +9.0% blended [CIQ Financials_Annual.xls, Segments tab, Geographic Segments] | Improving (US), Stable (international) | Mid | [CIQ Financials_Annual.xls, Segments tab] |
| FX translation | +1pp of FY26's +17.3% reported revenue growth (17% USD vs 16% CC) | Stable/modest tailwind, direction not controlled by the company | Low | [Q4 FY26 investor deck, slide 4] |
| Hardware | $3,084M FY26 revenue (+5.0%), shrinking-to-flat multi-year base, cannibalized by OCI migration | Deteriorating (structurally, long-run) though FY26 ticked up | Low | [CIQ Financials_Annual.xls, Segments tab; FY26 10-K, Item 7 MD&A, "Hardware Business," p.40] |
| Services | $5,743M FY26 revenue (+9.7%), thinnest margin of the three segments, largely a follow-on of cloud/software/hardware sales | Stable | Low | [CIQ Financials_Annual.xls, Segments tab; FY26 10-K, Item 7 MD&A, "Services Business," p.41] |

Magnitude bands per this report's own scale: High >5% of total revenue impact from a reasonable move, Mid 2-5%, Low <2%.

## 5. Revenue Drivers By Segment

### Segment: Cloud and Software (86.9% of FY26 revenue, $58,530M)

| Driver | Current Level | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Cloud infrastructure (OCI) capacity delivered | +1.2GW added FY26; guided to add "close to 1GW next quarter" alone | Improving | High | [Q4 FY26 investor deck, slide 8-9] |
| Cloud infrastructure contracted rate / bookings mix | "Majority of Q4 RPO via Bring-Your-Own-Hardware or Pre-pay," contractual margins "maintaining and improving" per management | Improving (per management characterization; not independently verifiable from filings) | High | [Q4 FY26 investor deck, slide 7 — management's own characterization, not an audited figure] |
| SaaS seat/subscription growth | Cloud applications +11% USD / +10% CC | Stable | Mid | [FY26 10-K, Item 7 MD&A, p.45] |
| Software license new-sales volume | -9% USD / -10% CC, customers migrating to cloud | Deteriorating | Low | [FY26 10-K, Item 7 MD&A, p.45] |
| Software support renewal base | +1% USD / -1% CC | Stable | Mid | [FY26 10-K, Item 7 MD&A, p.45] |

### Segment: Hardware (4.6% of FY26 revenue, $3,084M)

| Driver | Current Level | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Engineered Systems / server / storage unit sales | $3,084M FY26 (+5.0% YoY), down from $4,152M in FY2017 on a 9-year view | Stable near-term, Deteriorating long-run | Low | [CIQ Financials_Annual.xls, Segments tab] |
| Cannibalization from OCI | 10-K names "customer demand for competing offerings, including cloud infrastructure offerings" as a direct risk | Deteriorating (structural headwind) | Low | [FY26 10-K, Item 7 MD&A, "Hardware Business," p.40] |

### Segment: Services (8.5% of FY26 revenue, $5,743M)

| Driver | Current Level | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Consulting/customer-success billings | $5,743M FY26 (+9.7% YoY) | Improving, but the 10-K itself frames this segment as a follow-on of the other three, not an independent growth engine | Low | [CIQ Financials_Annual.xls, Segments tab; FY26 10-K, Item 7 MD&A, "Services Business," p.41] |
| Customer IT discretionary spend | 10-K names "personnel reductions in our customers' IT departments" and "tighter controls over customer discretionary spending" as revenue drivers | Mixed/uncertain | Low | [FY26 10-K, Item 7 MD&A, "Services Business," p.41] |

## 6. Revenue Growth Decomposition

FY26 vs FY25 total revenue growth: $67,357M − $57,399M = $9,958M, or +17.3% [`01_historical-financials.md` §1; CIQ Financials_Annual.xls, Segments tab]. Oracle does not disclose a separate volume × price split for any offering (no unit price/ASP metric for cloud infrastructure, no seat count for SaaS, no unit count for hardware) — the decomposition below therefore uses the product-line ("mix") breakdown that IS fully disclosed, with FX shown separately at the total-company level. This is a data limitation stated explicitly, per Section 6a below.

| Component | Contribution to Growth (pp) | Evidence |
|---|---:|---|
| Volume (units/capacity) | Not separately disclosed. Best available proxy: +1.2GW incremental data-center capacity added FY26, 98% of AI datacenter capacity already contracted — consistent with capacity-gated (volume-led), not price-led, growth in the largest-growing line. Inference, not from filings. | [Q4 FY26 investor deck, slide 7] |
| Price | Not separately disclosed for cloud infrastructure or SaaS. Software support's roughly flat CC growth (-1%) implies renewal pricing is close to flat on the legacy book. Inference, not from filings. | [FY26 10-K, Item 7 MD&A, p.45] |
| Mix (product-line shift, dollar-actual basis) | Cloud infrastructure +13.71pp; Cloud applications +2.82pp; Software support +0.49pp; Software license -0.81pp; Hardware +0.26pp; Services +0.89pp | See Section 6a for the derivation of each figure |
| FX | ~+1pp | 17% USD vs 16% CC total revenue growth [Q4 FY26 investor deck, slide 4] |
| Acquisitions / divestitures | 0pp — none disclosed as revenue-affecting in FY26 | [FY26 10-K, Item 7 MD&A revenue discussion] |
| Other / residual | ~0pp (see reconciliation, Section 6a) | — |
| **Total revenue growth** | **+17.3pp (actual reported)** | [`01_historical-financials.md` §1] |

## 6a. Decomposition Attribution and Residual (MODULE_RULES "Driver Attribution" / §15)

```
Cloud infrastructure: ($18,101M − $10,234M) / $57,399M (FY25 revenue base)
  = $7,867M / $57,399M = 13.71pp of the 17.3pp observed total-company growth
  → Basis: FY25 total-company revenue as the denominator (dollar-actual, not constant-currency).
    Matches the Total row's own basis (Section 6 uses reported/actual dollars throughout). No mismatch.

Cloud applications: ($15,888M − $14,272M) / $57,399M
  = $1,616M / $57,399M = 2.82pp

Software support: ($19,804M − $19,523M) / $57,399M
  = $281M / $57,399M = 0.49pp

Software license: ($4,737M − $5,201M) / $57,399M
  = −$464M / $57,399M = −0.81pp

Hardware: ($3,084M − $2,936M) / $57,399M
  = $148M / $57,399M = 0.26pp

Services: ($5,743M − $5,233M) / $57,399M
  = $510M / $57,399M = 0.89pp
```

Sum of the six product-line/segment components: 13.71 + 2.82 + 0.49 − 0.81 + 0.26 + 0.89 = **17.36pp**, against the stated Total revenue growth of **17.35pp** (exact = $9,958M/$57,399M = 17.348%). **Reconciled to within 0.02pp (rounding only) — residual is effectively zero.** This is expected and not a coincidence: unlike a volume × price sensitivity applied across a basis it wasn't measured on, this decomposition sums Oracle's own disclosed FY26-vs-FY25 offering-level dollar figures, which by construction add up to the disclosed total. The genuine gap in this decomposition is NOT the arithmetic (it reconciles exactly) — it is that the components are product-line dollars, not true volume/price factors. Oracle discloses no compute-unit count, no per-unit contracted rate, and no SaaS seat count that would let this report split "cloud infrastructure +13.71pp" further into "more capacity delivered" vs "higher price per unit of capacity." That split is Not proven from available data; the capacity evidence in the Volume row above (98% of DC capacity contracted, +1.2GW added) supports a capacity-led (not price-led) read but does not quantify it. FX (+1pp) is measured at the total-company level (17% USD vs 16% CC) and is not double-counted against the dollar-actual product-line figures above, because those product-line dollar deltas are themselves USD-actual (i.e., FX-inclusive) — the +1pp FX figure sits alongside the product-line breakdown as a separate lens on the SAME $9,958M of growth, not an additive component on top of it. Reader note: do not sum the Mix components (17.36pp) and the FX row (+1pp) together — that would double count, since the disclosed FY26/FY25 dollar deltas used for Mix already embed FX.

## 7. The Single Biggest Revenue Driver

**Cloud infrastructure (OCI/IaaS) capacity conversion from the RPO backlog** is the single biggest driver of Oracle's next 3-12 months of revenue. The arithmetic in Section 6a supports this without qualification: cloud infrastructure alone cleared 13.71pp of the 17.35pp FY26 total revenue growth — 79% of the observed increase, comfortably above the "roughly half" bar this report requires before naming a single biggest driver, and the decomposition reconciles with essentially zero residual. A 10-20% swing in how fast the $638B RPO backlog converts to revenue — up if data-center capacity comes online faster than the 98%-contracted, 97.5%-utilized current state implies, down if any of the concentrated large AI-infrastructure counterparties (four customers contracted >$8B each in Q4 FY26 alone; named names include AMD, Meta, NVIDIA, OpenAI, TikTok, xAI) pulls back — would move total revenue by roughly the same order of magnitude, given cloud infrastructure is now $18.1B of $67.4B total revenue and growing at 77%. The current direction is Improving and supply-constrained (not demand-constrained): management states 98% of AI datacenter capacity is already contracted and GPU/AI-infrastructure utilization sits at 97.5% [Q4 FY26 investor deck, slide 7], meaning the near-term ceiling on this driver is how fast Oracle can build (power, GPUs, data-center shells), not whether customers want more. This is explicitly a non-run-rate read: FY26's 77% cloud-infrastructure growth and 363% RPO growth are the early-to-mid phase of a discrete AI-infrastructure buildout cycle, well above Oracle's own 5-year historical revenue CAGR (~10-12%, per `01_historical-financials.md` §1), and management's own long-term outlook (31% revenue CAGR FY25-FY30, per Q4 FY26 investor deck slide 15) implies deceleration from FY26's pace over the guided window, not a continuation of it. Per the module's Cycle-Position Rule, the reader should treat FY26's growth rate as a peak-of-cycle-adjacent input into any forward model, not a steady-state baseline, and should weight the customer-concentration risk (Section 4) as the primary way this driver could reverse.



---

## earnings / 03_margin-drivers.md

_Source: `03_margin-drivers.md`_

# Margin Drivers — ORCL

All figures USD millions unless noted. Fiscal year ends May 31 (FY2026 = year ended May-31-2026). Reporting standard: US GAAP. Sector overlay applied: SaaS / subscription software (hybrid — cloud subscription + legacy perpetual license + hardware + services), per `business-model/02_business-identity.md` §3a and `frameworks/SECTOR_OVERLAYS.md` — margin analysis uses GAAP gross margin (charged for stock-based compensation, or SBC, in full), cost-of-revenue / infrastructure cost as % of revenue, and S&M/R&D leverage as the primary metric grammar, in place of a generic raw-material/freight cost stack. Oracle also carries a genuine capital-intensity dimension (data-center depreciation, capex) that the pure-software SaaS grammar does not fully capture, so this report supplements the SaaS KPIs with the depreciation/capex lens the business-identity module itself flags as the dominant swing factor.

## 1. Segment Decomposition Status

`business-model/03_segment-map.md` exists and is used. Oracle reports three ASC 280 segments — Cloud and Software, Hardware, Services. Cloud and Software is 86.9% of FY2026 revenue ($58,530M of $67,357M) and 90.7% of FY2026 total segment margin ($34,468M of $38,018M) [FY26 10-K, Note 13, p.100], which clears the module's >85%-from-one-segment threshold on both revenue and profit. Per the Segment-Level Rule, Oracle is treated as effectively single-segment, and the analysis below proceeds primarily at the consolidated level, with Hardware and Services covered briefly in Section 6 for completeness.

Within the dominant Cloud and Software segment, the real value-driving split is not disclosed as an audited ASC 280 sub-segment but is broken out in MD&A by "offering": cloud applications (SaaS), cloud infrastructure (OCI/IaaS), software license, and software support [FY26 10-K, Item 7 MD&A, "Revenues by Offerings," p.45]. Because this offering-level split is where the actual margin story lives (OCI is capital-intensive and lower-margin; software support is close to zero-marginal-cost), Section 6 also decomposes drivers at this MD&A-disclosed offering level, flagged as non-audited supplementary disclosure, not a second ASC 280 segment.

Segment-level profit is a company-defined measure that excludes R&D, G&A, SBC, amortization of intangibles, restructuring, and interest expense [FY26 10-K, Note 13, p.100–101, footnote 1] — segment margin rates below are cost-allocation constructs, not GAAP operating margins, and are not directly comparable to a peer's segment operating margin.

## 2. Cost Stack

Rows follow the SaaS/subscription-software cost grammar (GAAP gross margin charged for SBC in full; infrastructure cost as % of revenue; S&M/R&D leverage), not a generic COGS/freight/labor table. Figures are FY2026 vs FY2025, consolidated.

| Cost Line | % of Revenue (FY26 / FY25) | Direction | Evidence | Margin Risk |
|---|---:|---|---|---|
| Cost of revenue (cloud & software infrastructure, hardware, services — "Cost of Goods Sold" per CIQ, ties to GAAP cost-of-revenue lines) | 34.18% / 29.49% (+469bps, worse) | Headwind, worsening | COGS $23,021M (FY26) vs $16,927M (FY25), +36.0% vs revenue +17.3% [Financials_Annual.xls, Income Statement tab]; management attributes this to "impacts from ramping up our data centers and the acceleration in our infrastructure revenue" [Q4 FY26 transcript, CFO Maxson] | High — this is the largest single line-item swing in the entire cost stack (see Section 7) |
| — of which: SBC charged inside cost of revenue | 1.28% / 1.46% (-18bps, improving) | Mild tailwind | SBC-in-COGS $859M (FY26) vs $840M (FY25) [Financials_Annual.xls, Income Statement tab, "Stock-Based Comp., COGS"] | Low — GAAP gross margin already reflects this in full; the SBC component is small and roughly flat, so it is NOT the driver of the ~469bps gross-margin compression (data-center capacity cost is) |
| Sales & Marketing (S&M) | 12.37% / 15.07% (-270bps, improving) | Tailwind | S&M $8,331M (FY26) vs $8,651M (FY25) [Financials_Annual.xls, Income Statement tab, "Selling and Marketing Exp."]; CFO cited "efficiency actions in our cost structure" [Q4 FY26 transcript] | Mid — real operating leverage as fixed sales cost is spread over higher revenue |
| Research & Development (R&D) | 15.25% / 17.18% (-193bps, improving) | Tailwind | R&D $10,272M (FY26) vs $9,860M (FY25) [Financials_Annual.xls, Income Statement tab; reconciles to FY26 10-K, Note 13, p.101] | Mid — R&D dollars still grew (+4.2%) but slower than revenue (+17.3%) |
| General & Administrative (G&A) | 2.40% / 2.79% (-39bps, improving) | Tailwind | G&A $1,618M (FY26) vs $1,602M (FY25) [Financials_Annual.xls, Income Statement tab] | Low |
| Amortization of intangibles | 2.48% / 4.02% (-154bps, improving) | Tailwind (rolling off) | $1,671M (FY26) vs $2,307M (FY25) [Financials_Annual.xls, Income Statement tab; FY26 10-K reconciliation, Note 13, p.101] | Mid — this is Cerner-acquisition-related intangible amortization rolling down the amortization curve, a structural/mechanical improvement, not an operating win |
| Restructuring & other charges | 2.64% / 0.52% (+212bps, worse) | Headwind | $1,779M (FY26) vs $299M (FY25) [Financials_Annual.xls, Income Statement tab, "Restructuring Charges"] | Mid — elevated one-year charge; funds part of the S&M/G&A/R&D leverage seen above, so its ongoing recurrence is a genuine open question |
| D&A — pure depreciation (cash-flow basis, embedded across COGS/opex, shown separately for visibility) | 11.32% / 6.74% of revenue (Depreciation & Amort. ex-intangibles $7,623M FY26 vs $3,867M FY25, +97.1%) | Headwind, worsening sharply | [Financials_Annual.xls, Cash Flow tab, "Depreciation & Amort."] | High — direct mechanical consequence of the FY26 capex ramp ($55,663M net cash capex, +162% YoY per `01_historical-financials.md` §1); the single fastest-growing cost line in the entire stack |
| Interest expense (below the operating-margin line; shown for financing-cost context, not part of the operating-margin bridge in Section 7) | 6.83% / 6.23% of revenue (gross interest expense $4,599M FY26 vs $3,578M FY25) | Headwind, worsening | [Financials_Annual.xls, Income Statement tab, "Interest Expense"]; net debt $136,143M (strict), +38.7% YoY [`01_historical-financials.md` §1] | Mid — does not touch operating margin, but compresses net margin and funds the same capex program driving the cost-of-revenue and D&A lines above |

## 3. Gross Margin → EBITDA Margin → EBIT Margin Walk

| Margin Level | FY2026 | FY2025 | Change bps | Main Reason | Evidence |
|---|---:|---:|---:|---|---|
| Gross margin (GAAP) | 65.83% | 70.51% | -469bps | Cost of revenue growing +36.0% vs revenue +17.3%, driven by data-center capacity being expensed as it comes online ahead of earning its full contracted revenue | [Financials_Annual.xls, Income Statement tab]; "our gross margin declining driven by impacts from ramping up our data centers and the acceleration in our infrastructure revenue" [Q4 FY26 transcript, CFO Maxson] |
| EBITDA margin | 45.27% | 38.91% | +636bps | D&A is added back in EBITDA, which mechanically hides the depreciation step-up (D&A ex-intangibles +97.1% YoY) that is the actual near-term margin drag; EBITDA margin expansion overstates underlying operating-margin trajectory for a business whose capex is this large | [Financials_Annual.xls, Income Statement tab] |
| EBIT margin — GAAP operating margin (the metric that actually reaches the income statement) | 30.59% | 30.80% | -21bps | Gross-margin compression (-469bps) almost exactly offset by opex leverage in S&M/G&A/R&D/amortization roll-off (+656bps combined), partly clawed back by a higher restructuring charge (-212bps) — see Section 7 for the full bridge | [`01_historical-financials.md` §4, GAAP Operating Income $20,606M FY26 / $17,678M FY25]; note the CIQ "EBIT" figure used in `01_historical-financials.md` §1 ($22,385M FY26, 33.2% margin) excludes restructuring charges and is NOT the GAAP figure used here — flagged per `01_historical-financials.md`'s own EBIT-sourcing note |
| EBIT margin — Non-GAAP operating margin (management's own adjusted measure, adds back SBC, amortization, restructuring) | 42.94% | 43.61% | -67bps | Even on Oracle's own non-GAAP basis (which strips out the restructuring swing and SBC/amortization), operating margin still compressed slightly — the gross-margin/data-center-cost headwind is large enough that opex leverage alone did not fully offset it once restructuring and SBC/amortization are excluded from both sides | [`01_historical-financials.md` §4, Non-GAAP Operating Income $28,926M FY26 / $25,033M FY25] |

Pass-through lag, stated explicitly (per business-model `06_value-chain.md`): Oracle's cost pass-through is structural and forward-looking, not retroactive. CEO Magouyrk: "When we're selling stuff at a time period where we have certainty... we will then do fixed-price contracts. At times that we don't know those costs... we then do not do fixed-price contracts... we have a mechanism whereby those costs end up being floating" [Q4 FY26 transcript, CEO Magouyrk]. In practice this means new, uncertain-cost contracts carry a real cost-indexed pass-through clause, but contracts already locked at a fixed price absorb any subsequent rise in memory, SSD, or GPU costs — an analyst on the call flagged "component costs have gone up a lot, especially memory" [Q4 FY26 transcript, John DiFucci, Guggenheim]. The clearest evidence of the lag is structural, not contractual: new data-center capacity is expensed (depreciation, power, personnel) from the day it goes live, but takes multiple quarters to ramp to its full contracted revenue — management states this directly for the FY27 outlook: gross margin "will step down due to timing for the ramp-up of our data center projects into their full revenue contribution plus impacts from mix," with infrastructure margin expected to "improve rapidly" only once "we reach full contractual revenue levels at our data centers" [Q4 FY26 transcript, CFO Maxson]. No specific quarter-count for the lag is disclosed — treat "multiple quarters" as **Inference, not from filings**, bounded only by management's own qualitative "rapidly... once we reach full contractual revenue" language.

## 4. Margin Walk — Which Margin Level Matters Most?

Operating margin (GAAP, with non-GAAP shown alongside) is the more decision-useful metric for Oracle right now, not gross margin in isolation. Gross margin is being mechanically reshaped by a segment mix shift Oracle itself calls multi-year — the capital-intensive OCI infrastructure business scaling inside Cloud and Software — and its year-over-year comparison is distorted by the timing gap between when data-center capacity is expensed and when it earns its full contracted revenue (Section 3). Operating margin captures the net of that real headwind against real, disclosed opex leverage (S&M/R&D/G&A shrinking as a share of revenue) that management is actively delivering and that shows up in cash flow and EPS. That said, gross margin remains the single most useful **leading indicator** to watch quarter to quarter, because it is the most direct read on whether new data-center capacity is converting to revenue on schedule — a further gross-margin step-down beyond what management has already guided for FY2027 would be the first place a demand or supply problem in OCI would show up.

## 5. Margin Driver Table (consolidated)

| Driver | Impact on Margins | Direction (Tailwind / Neutral / Headwind / Unknown) | Magnitude (High / Mid / Low) | Evidence |
|---|---|---|---|---|
| Mix shift toward OCI (cloud infrastructure) inside Cloud and Software | Compresses gross margin as capital-intensive infrastructure revenue (77% growth FY26, 93% in Q4) grows far faster than high-margin software support (+1%) | Headwind | High | Segment margin 64.1% (FY24) → 62.8% (FY25) → 58.9% (FY26) [`business-model/03_segment-map.md` §1]; OCI revenue $18,101M (+77%) vs software support $19,804M (+1%) [FY26 10-K, Item 7 MD&A, p.45] |
| Data-center capacity build-out ahead of revenue recognition (capex → depreciation lag) | Direct driver of the -469bps gross-margin move and the largest single cost-stack swing (D&A ex-intangibles +97.1%) | Headwind, guided to persist into FY27 | High | Net cash capex $55,663M FY26 (+162% YoY) vs $21,215M FY25 [`01_historical-financials.md` §1]; "our fiscal year 2027 gross margin will step down due to timing for the ramp-up of our data center projects" [Q4 FY26 transcript, CFO Maxson] |
| Operating expense leverage (S&M, R&D, G&A) | Revenue grew 17.3% while S&M fell 3.7% in dollars and R&D grew only 4.2% — all three lines shrank as a share of revenue | Tailwind | High (combined +502bps) | S&M -270bps, R&D -193bps, G&A -39bps as % of revenue [Financials_Annual.xls, Income Statement tab] |
| Amortization of intangibles roll-off (Cerner acquisition-related) | Structural decline as FY2022 Cerner-related intangibles amortize down the curve | Tailwind, mechanical, will continue to fade | Mid (+154bps this year) | $1,671M (FY26) vs $2,307M (FY25) vs $3,582M (FY23 peak) [Financials_Annual.xls, Income Statement tab] |
| Restructuring charges | Elevated FY26 charge partly funded the S&M/G&A leverage above; whether the charge (and the savings) recur is unclear | Headwind this year; direction next year Unknown | Mid (-212bps this year) | $1,779M (FY26) vs $299M (FY25) [Financials_Annual.xls, Income Statement tab] |
| GPU/component input-cost inflation (memory, SSD) on fixed-price legacy contracts | Absorbed by Oracle on already-signed fixed-price contracts, not passed through | Headwind, magnitude not disclosed | Unknown | "component costs have gone up a lot, especially memory" [Q4 FY26 transcript, John DiFucci]; contract-design pass-through only applies to new, uncertain-cost contracts [Q4 FY26 transcript, CEO Magouyrk] |
| Fixed-cost absorption / utilization on the OCI side | 97.5% global GPU utilization — a supply-constrained market where returned capacity is "instantly snapped up" — implies capacity, once live, is running near-full, which should support unit economics as data centers mature | Tailwind (forward-looking) | Mid–High, not yet fully reflected in reported gross margin | "our global GPU utilization rate is 97.5%" [Q4 FY26 transcript, CEO Magouyrk; cited in `business-model/06_value-chain.md` §1] |
| FX | Constant-currency revenue growth (16%) ran about 1 point below reported growth (17%) FY26; no cost-side FX margin impact separately quantified | Neutral to Unknown at the margin line | Low–Unknown | [`business-model/02_business-identity.md` §4]; FX earnings sensitivity is disclosed only as a hypothetical (10% FX move → $(2,767)M) at the revenue/earnings level, not decomposed to a margin bps figure [FY26 10-K, Item 7A, p.56] |
| SBC (stock-based compensation) growth | SBC grew slower than revenue (total SBC $4,811M FY26 vs $4,674M FY25, +2.9%, vs revenue +17.3%) — a real, if modest, margin tailwind, and GAAP gross/operating margin already reflects it in full | Mild tailwind | Low | [Financials_Annual.xls, Income Statement tab, "Stock-Based Comp., Total"] |

## 6. Margin Drivers By Segment (if applicable)

### Segment: Cloud and Software (86.9% of FY26 revenue, 90.7% of FY26 segment margin)

| Driver | Impact | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| OCI (cloud infrastructure) share of segment revenue rising | Segment margin compressed from 64.1% (FY24) to 58.9% (FY26) as the lower-margin, capital-intensive OCI offering grows far faster than software support | Headwind | High | `business-model/03_segment-map.md` §1; OCI +77% FY26 vs software support +1% [FY26 10-K, Item 7 MD&A, p.45] |
| Software license revenue decline | Software license revenue fell 9% (FY26 $4,737M vs FY25 $5,201M) as customers migrate to cloud; license revenue is recognized up front at high margin, so its decline is a modest incremental headwind to segment mix | Headwind, small | Low | `business-model/03_segment-map.md` §1 |
| RPO conversion timing | Total RPO $638B (+363% YoY); management states ~12% recognized in the next 12 months and ~34% in months 13–36 [Q4 FY26 transcript, CFO Maxson] — a large, multi-year revenue tail that will keep pulling segment mix toward OCI as it converts | Headwind to gross margin near-term, tailwind to revenue growth | High | `business-model/02_business-identity.md` §3a; Q4 FY26 transcript |

### Segment: Hardware (4.6% of FY26 revenue, 5.3% of FY26 segment margin)

| Driver | Impact | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Stable segment margin on a flat-to-shrinking revenue base | Segment margin rate 65.4% (FY26) vs 65.3% (FY25) — essentially flat | Neutral | Low | `business-model/03_segment-map.md` §1; Hardware revenue $3,084M (FY26) vs $2,936M (FY25) [FY26 10-K, Note 13, p.100] |
| Cannibalization by Oracle's own OCI offering | 10-K names "customer demand for competing offerings, including cloud infrastructure offerings" as a direct risk to the hardware business | Headwind, structural, low current magnitude given segment's small size | Low (consolidated impact) | [FY26 10-K, Item 7 MD&A, "Hardware Business," p.40] |

### Segment: Services (8.5% of FY26 revenue, 4.0% of FY26 segment margin)

| Driver | Impact | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Segment margin improving off a low base | Segment margin rate rose to 26.7% (FY26) from 19.0% (FY25) and 16.9% (FY24) — a real improvement, but the 10-K itself states this remains "lower margins than our cloud and software and hardware businesses" | Tailwind | Low (small profit share) | `business-model/03_segment-map.md` §1; [FY26 10-K, Item 7 MD&A, "Services Business," p.41] |

## 7. Margin Bridge — Latest Period

GAAP operating margin, FY2026 vs FY2025 (30.59% vs 30.80%, -21bps). Each row is a directly reported cost line's ratio-of-revenue change (not a modeled sensitivity), decomposed and reconciled to the stated Total.

| Component | Margin Impact (bps) | Evidence |
|---|---:|---|
| Volume / operating leverage (S&M -270bps + G&A -39bps + R&D -193bps ratio improvement, i.e. margin benefit as fixed-ish costs are spread over 17.3% higher revenue) | +502 | [Financials_Annual.xls, Income Statement tab] — see Section 2 for each line |
| Price | Not separately disclosed — Oracle's cost pass-through is embedded in contract design (fixed vs floating pricing at signing), not a distinct realized "price" line item; its effect is folded into the input-costs/mix row below | n/a |
| Input costs / mix (gross margin / cost-of-revenue ratio change — data-center capacity costs, GPU/power/memory absorption, and the OCI-mix shift, which the disclosure does not separately decompose from each other) | -469 | [Financials_Annual.xls, Income Statement tab]; "gross margin declining driven by impacts from ramping up our data centers and the acceleration in our infrastructure revenue" [Q4 FY26 transcript, CFO Maxson] |
| FX | Not decomposed to a margin bps figure in available disclosure — constant-currency revenue growth ran ~1pt below reported growth, but no cost-side FX margin impact is separately quantified | Not disclosed |
| One-offs (restructuring & other charges, ratio change) | -212 | [Financials_Annual.xls, Income Statement tab, "Restructuring Charges," $1,779M FY26 vs $299M FY25] |
| Other (amortization-of-intangibles roll-off +154bps + other operating expense ratio +4bps) | +158 | [Financials_Annual.xls, Income Statement tab] |
| **Total margin change** | **-21** | GAAP Operating Income $20,606M/$67,357M (30.59%) vs $17,678M/$57,399M (30.80%) [`01_historical-financials.md` §4] |

Reconciliation: +502 - 469 - 212 + 158 = -21bps, exactly matching the stated Total. Residual = 0bps.

## 7a. Bridge Attribution and Residual

Every component above is **asserted directly from disclosure** (a reported cost line's own ratio-of-revenue change), not derived from a quoted sensitivity, elasticity, or pass-through lag applied across a different basis — so the "show the multiplication" requirement does not apply to any row; each figure is the literal GAAP cost line divided by GAAP revenue, for the same fiscal year, on a consolidated basis, compared year over year. Because every component is a directly reported line item rather than a modeled estimate, the bridge reconciles exactly:

```
Volume/operating leverage: reported S&M+G&A+R&D ratio change (asserted from disclosure, no sensitivity applied) = +502bps
Input costs/mix: reported cost-of-revenue ratio change (asserted from disclosure, no sensitivity applied) = -469bps
One-offs: reported restructuring ratio change (asserted from disclosure, no sensitivity applied) = -212bps
Other: reported amortization + other-opex ratio change (asserted from disclosure, no sensitivity applied) = +158bps
  Sum = -21bps of the -21bps observed change
  → basis matches (all components measured consolidated, same FY26-vs-FY25 basis, same revenue denominator) — reconciled, 0bps residual
```

Because the residual is zero, Section 8 can name a single biggest driver with full confidence in the arithmetic. The caveat is not about the math — it is about what the bridge does NOT decompose: the -469bps "input costs/mix" line bundles at least two effects the disclosure does not separately quantify (the OCI-vs-software mix shift, and the capacity-build-ahead-of-revenue timing lag) and neither the 10-K nor the earnings call gives a standalone dollar or bps figure for either sub-effect in isolation — treat any further split of that -469bps as **Not proven from available data**.

## 8. The Single Biggest Margin Driver

Cost of revenue (data-center capacity cost, principally depreciation, power, and personnel tied to the OCI build-out) is the single biggest margin driver — it is the largest individual line-item move in the bridge (-469bps), larger than any other single component, and it is the one driver management has explicitly guided to worsen further in FY2027 ("gross margin will step down due to timing for the ramp-up of our data center projects into their full revenue contribution" [Q4 FY26 transcript, CFO Maxson]), while FY26's opex-leverage tailwind (+502bps combined across S&M/G&A/R&D) is a real but separately-earned offset, not a repeat of the same driver. Its current direction is a headwind, and it is a headwind by construction — new data-center capacity is expensed from day one of operation but earns its full contracted revenue only over multiple quarters, so as long as capex keeps growing faster than the installed base converts to run-rate revenue (FY27 net capex guided to ~$70B, versus $55.7B in FY26 [`04_guidance-consensus.md` §2]), this driver's magnitude should stay in the "High" band. The one caveat on the word "biggest": the -21bps *net* margin change this year was small precisely because opex leverage (+502bps) almost fully offset the cost-of-revenue headwind (-469bps) — so while cost of revenue is the largest single component, the observed net margin move for FY26 does not "trace mostly to" this driver in isolation; it traces to the two large, roughly offsetting forces described in Section 7.

## 9. Investment Spend — Both Signs

Net cash capex jumped from $21,215M (FY25) to $55,663M (FY26), +162% YoY [`01_historical-financials.md` §1], and is guided to roughly $70B net cash outlay in FY27 (plus $20–25B of customer prepayments/timing impacts, implying gross capex in the ~$90–95B range) [`04_guidance-consensus.md` §2]. This is well above the company's own multi-year capex history and both readings apply.

| Reading | What it would show | Evidence here |
|---|---|---|
| Spend as a future COST | Pure PP&E depreciation nearly doubled (D&A ex-intangibles $3,867M FY25 → $7,623M FY26, +97.1%) [Financials_Annual.xls, Cash Flow tab]; gross margin already stepped down ~469bps FY26 and is guided to step down further in FY27 "due to timing for the ramp-up of our data center projects into their full revenue contribution" [Q4 FY26 transcript, CFO Maxson]; FCF turned sharply negative (-$23,686M FY26 vs -$394M FY25) [`01_historical-financials.md` §1]; net debt rose 38.7% to $136,143M (strict basis) to help fund it [`01_historical-financials.md` §1] |
| Spend as a DEMAND signal | Total RPO (contracted, not-yet-recognized revenue) jumped 363% to $638B [FY26 10-K, Note 1; Q4FY26 Earnings Press Release, p.2], far outstripping the 162% rise in capex; global GPU utilization is 97.5% and returned capacity is "instantly snapped up" — capacity, not customer demand, is the binding constraint [Q4 FY26 transcript, CEO Magouyrk]; four customers each contracted for more than $8B in a single quarter, named publicly as AMD, Meta, NVIDIA, OpenAI, TikTok, xAI [`business-model/10_external-dependency.md` §1, Key Developments 2026-02-02]; CEO on the capex-timing question: "My job is starting to spend the money a little bit faster, so I can get ramped revenue" [Q4 FY26 transcript, CEO Magouyrk]; FY27 revenue guidance raised to $90B (+34% constant currency), which management itself says "surpass[es] the 5-year revenue CAGR included in our long-term outlook" [Q4 FY26 transcript, CFO Maxson] |

**Current read:** The evidence favors the demand signal as the dominant driver of the capex program: RPO growth (+363%) is running well ahead of capex growth (+162%), GPU utilization at 97.5% indicates Oracle is supply-constrained rather than building speculative capacity, and management's own framing of the risk is "spend the money a little bit faster" to capture already-contracted revenue, not a search for demand. The cost-side reading is nonetheless real and already visible in FY26's -469bps gross-margin move and FY27's guided further step-down — the two readings are not mutually exclusive, they are sequential (cost hits first, revenue conversion follows with a lag management has not quantified in quarters). The single observable that would flip the current read from "demand-led, cost is a temporary lag" to "cost is the dominant story": a deceleration or reversal in RPO growth, or a pullback from one of the named concentrated large customers (four customers over $8B each in a single quarter, per `business-model/10_external-dependency.md` §5) — either would mean capacity is being built ahead of demand, not ahead of already-contracted revenue, and would validate the pure-cost reading instead.



---

## earnings / 04_guidance-consensus.md

_Source: `04_guidance-consensus.md`_

# Guidance & Consensus — ORCL

## 1. Consensus Data Metadata

| Field | Value |
|---|---|
| Source | Capital IQ Estimates Report (`OracleCorporationNYSEORCLEstimatesReport.xls`) — Consensus, Guidance, Recent Changes, Revisions, Trends, and Surprise tabs |
| Data as of date | Live/current as of the data pull. Most recent same-day revision entries are timestamped 2026-08-14 ("5:30 AM" / "5:03 AM" rows, Recent Changes tab); a prior batch of analyst-level revisions is dated 2026-08-11. This is well after the last reported quarter (FQ4 FY2026, reported 2026-06-10) and well before the next release (FQ1 FY2027, due 2026-09-04) — consensus has fully absorbed the latest print, so the stale-consensus guard does not apply |
| Fiscal year basis | Current fiscal year = FY2027, ending May-31-2027. Next earnings release: FQ1 FY2027, Sep-04-2026 [Capital IQ Estimates Report, Consensus tab, header] |
| Analyst count | 42 analysts contribute to FY2027 Revenue and FY2027 Non-GAAP EPS consensus (Consensus tab, "No. of Estimates" row). The nearer FQ1 FY2027 quarter has thinner coverage: ~32 analysts for Revenue, ~33 for EPS Normalized (Revisions tab, "Last Month — # of Analysts") |
| Currency | US Dollar (USD), reported currency, "Today's Spot Rate" conversion basis per the export header — not applicable since Oracle reports natively in USD [Capital IQ Estimates Report, Consensus tab, header] |
| Calendarization issue? | N — Oracle's fiscal year ends May-31; both the consensus export and management's own guidance use this same fiscal calendar throughout |

## 2. Management Guidance

All guidance below is management's own forward-looking guidance, issued on the FQ4 FY2026 earnings call and press release dated 2026-06-10 — the most recent guidance event in the data pool. Figures are Non-GAAP (company-defined; Oracle's non-GAAP EPS excludes items such as stock-based compensation and, this cycle, one-time investment gains — see Section 6).

| Metric | Period | Guidance | Type (Point / Range / Qualitative) | Source |
|---|---|---|---|---|
| Total revenue | Q1 FY2027 | Growth of 27%–29% in both constant currency (CC) and USD, i.e. ≈$18,956.02M–$19,254.54M off the FQ1 FY2026 actual base of $14,926M (midpoint ≈$19,105.28M) | Range | Oracle Q4 FY26 Earnings Press Release, 2026-06-10, "Guidance for Q1 FY 2027" |
| Total revenue | FY2027 (full year) | $90 billion total revenue — prior guidance confirmed/reaffirmed | Point | Oracle Q4 FY26 Earnings Press Release, 2026-06-10, "Guidance for Full FY 2027" |
| Total cloud revenue | Q1 FY2027 | Growth of 57%–63% CC / 58%–64% USD | Range | Oracle Q4 FY26 Earnings Press Release, 2026-06-10, "Guidance for Q1 FY 2027" |
| Non-GAAP EPS | Q1 FY2027 | $1.71–$1.75 CC (growth 16%–19%) / $1.72–$1.76 USD (growth 17%–20%) — midpoint $1.74 (USD) | Range | Oracle Q4 FY26 Earnings Press Release, 2026-06-10, "Guidance for Q1 FY 2027" |
| Non-GAAP EPS | FY2027 (full year) | $8.05 — raised from prior guidance; ≈18% growth once FY2026's one-time investment gains are excluded from the base | Point | Oracle Q4 FY26 Earnings Press Release, 2026-06-10, "Guidance for Full FY 2027" |
| Capital expenditure (net cash outlay) | FY2027 (full year) | ≈$70 billion net cash outlay for capex, plus ≈$20–25 billion of customer prepayments and timing impacts — so reported (gross) capex on the cash-flow statement will be higher by that amount, implying gross capex in the ≈$90–95 billion area | Range (qualitative point + a stated add-on band) | Oracle Q4 FY26 Earnings Call transcript, 2026-06-10, CFO (Hilary Maxson) prepared remarks |
| Capital financing plan | FY2027 (full year) | Expects to raise ≈$40 billion through a combination of debt and equity, including the previously announced $20 billion at-the-market equity issuance; does not expect to issue additional debt in calendar 2026 | Qualitative | Oracle Q4 FY26 Earnings Press Release, 2026-06-10, "Capital Investment Program and Capital Funding" |
| Gross margin (the % of revenue left after the direct cost of delivering it) | FY2027 (full year) | Expected to "step down" versus FY2026 due to the timing of data-center ramp-up ahead of full revenue contribution, plus mix impacts; infrastructure margin expected to "improve rapidly" once data centers reach full contractual revenue | Qualitative | Oracle Q4 FY26 Earnings Call transcript, 2026-06-10, CFO prepared remarks |
| Operating costs (as % of revenue) | FY2027 (full year) | Expected to be "slightly negative year-over-year" — i.e., operating expense as a share of revenue is expected to shrink further | Qualitative | Oracle Q4 FY26 Earnings Call transcript, 2026-06-10, CFO prepared remarks |
| Oracle Health segment growth | FY2027 (full year) | Expected to push the overall Oracle Health business growth rate "to double-digits" | Qualitative | Oracle Q4 FY26 Earnings Press Release, 2026-06-10 |

Guidance midpoints (used for the gap calculation in Section 3): FQ1 FY2027 revenue midpoint = $19,105.28M; FQ1 FY2027 Non-GAAP EPS midpoint = $1.74. FY2027 revenue and EPS guidance are both single-point figures ($90,000M and $8.05), so no midpoint calculation is needed for those two rows.

## 3. Guidance vs Consensus Table

Gap = Consensus minus Guidance (positive = Street sits above guidance/midpoint; negative = Street sits below).

| Metric | Period | Management Guidance | Street Consensus | Gap | Gap Direction |
|---|---|---|---|---:|---|
| Revenue | Q1 FY2027 | $18,956.02M–$19,254.54M (midpoint $19,105.28M) | Mean $19,128.44M (32 analysts) | +$23.16M (+0.12%) | Consensus marginally above guidance midpoint — essentially in-line |
| Revenue | FY2027 | $90,000M (point) | Mean $89,336.55M (42 analysts) | −$663.45M (−0.74%) | Consensus below guidance — guidance is the higher number |
| Non-GAAP EPS | Q1 FY2027 | $1.72–$1.76 (midpoint $1.74) | Mean $1.73946 (33 analysts) | −$0.00054 (−0.03%) | Essentially in-line |
| Non-GAAP EPS | FY2027 | $8.05 (point) | Mean $8.05313 (42 analysts) | +$0.00313 (+0.04%) | Essentially in-line — consensus marginally above guidance |

[Capital IQ Estimates Report, Consensus tab, Market Summary and Company Level sections; Guidance tab, "Guidance" rows for FQ1 2027 / FY 2027 columns]

Both gaps sit well under 1% of the underlying figure in either direction. The one gap of any real size is FY2027 revenue, where the Street's $89,337M average sits $663M (−0.74%) below management's own $90 billion guide — a modest, not elevated, beat-risk pocket on the full-year revenue line specifically. EPS is priced essentially exactly to guidance at both the quarter and full-year level.

## 3A. Alt-Data Cross-Check

Not applicable — no external alt-data panel is present in the data pool (`data/ORCL/external/` does not exist, confirmed in `00_earnings-data-triage.md` Section 1). Section omitted per the module rule; its absence is not a data gap.

## 4. Estimate Revision Momentum Table

Capital IQ's Trends tab buckets revision history in monthly snapshots rather than exact day counts; the columns below are labelled by their nearest day-count equivalent (≈90 / ≈60 / ≈30 days ago) using the 3-month / 2-month / 1-month-ago columns.

| Estimate | ≈90 Days Ago | ≈60 Days Ago | ≈30 Days Ago | Current | Direction |
|---|---:|---:|---:|---:|---|
| Revenue (next Q, FQ1 FY2027) | $19,019.95M | $19,142.53M | $19,122.46M | $19,124.08M | Flat — choppy: peaked 60 days ago, essentially unchanged over the last 30 days |
| EPS Normalized (next Q, FQ1 FY2027) | $1.68 | $1.72 | $1.74 | $1.74 | Rising |
| Revenue (next FY, FY2027) | $88,560.03M | $88,983.96M | $89,218.42M | $89,315.20M (Trends tab) / $89,336.55M (Consensus tab mean, same-day snapshot) | Rising |
| EPS Normalized (next FY, FY2027) | $8.03 | $8.03 | $8.05 | $8.05 | Rising (modest) |

[Capital IQ Estimates Report, Trends tab, "EPS Normalized" and "Revenue" sections, FQ1 2027 / FY 2027 columns]

Note: the Trends tab's "Current" FY2027 revenue figure ($89,315.20M) and the Consensus tab's "Mean" FY2027 revenue figure ($89,336.55M) differ by ~0.02% — both come from the same Capital IQ export and the gap is immaterial; flagged for transparency rather than reconciled away.

## 5. Revision Breadth

| Metric | Up Revisions | Down Revisions | Net Revision Breadth | Period |
|---|---:|---:|---:|---|
| Revenue next FY (FY2027) | 4 | 2 | +2 | Last Month |
| Revenue next FY (FY2027) | 7 | 3 | +4 | Last 2 Months |
| Revenue next FY (FY2027) | 28 | 6 | +22 | Last 3 Months |
| EPS Normalized next FY (FY2027) | 2 | 0 | +2 | Last Month |
| EPS Normalized next FY (FY2027) | 4 | 0 | +4 | Last 2 Months |
| EPS Normalized next FY (FY2027) | 22 | 12 | +10 | Last 3 Months |
| EBITDA next FY (FY2027) | 0 | 0 | 0 | Last Month |
| EBITDA next FY (FY2027) | 1 | 0 | +1 | Last 2 Months |
| EBITDA next FY (FY2027) | 4 | 2 | +2 | Last 3 Months |

[Capital IQ Estimates Report, Revisions tab, "Revenue", "EPS Normalized", and "EBITDA" sections, FY 2027 column]

Breadth is positive at every horizon for Revenue and EPS, but the magnitude thins sharply once the FQ4 FY2026 print and the fresh FY2027 guidance (both dated 2026-06-10) are excluded: the "Last 3 Months" window captures the wave of re-basing that followed that print (net +22 on revenue, +10 on EPS), while the "Last Month" window — the cleanest read on where analysts stand today, independent of that print — shows only mild net upgrades (+2 on both). EBITDA coverage is thin (10–12 analysts) and revisions there are flat to mildly positive; treat the EBITDA row as low-confidence given the small sample.

## 6. Historical Beat / Miss Pattern

Magnitude = actual vs. Street estimate, % surprise, from the Surprise tab (Revenue and EPS Normalized).

| Period | Revenue Beat/Miss | EPS Beat/Miss | Magnitude | Notes |
|---|---|---|---:|---|
| Q-4 = FQ1 FY2026 (Aug 2025) | Miss | Miss | Rev −0.78%, EPS −0.68% | Actual revenue $14,926M vs. estimate $15,043.0M; actual Non-GAAP EPS $1.47 vs. estimate $1.479 |
| Q-3 = FQ2 FY2026 (Nov 2025) | Miss | Beat (large) | Rev −0.83%, EPS +37.8% | The EPS beat is a one-off, not a repeatable operating beat: GAAP EPS beat the same quarter by +79.5% (actual $2.10 vs. estimate $1.171), consistent with the FY26 press-release footnote citing "one-time net investment gains from certain transactions" (from selling the Ampere chip business and Bloom Energy warrants) landing mostly in this quarter |
| Q-2 = FQ3 FY2026 (Feb 2026) | Beat | Beat | Rev +1.66%, EPS +5.9% | Clean beat on both lines, no footnoted one-off |
| Q-1 = FQ4 FY2026 (May 2026) | Beat | Beat | Rev +0.46%, EPS +7.65% | Also carries a small one-time investment gain: ex-gains Non-GAAP EPS was $2.03 (vs. reported $2.111) against a $1.962 estimate — still a genuine beat (+3.4%) once the one-off is stripped out, just smaller than the headline number |

[Capital IQ Estimates Report, Surprise tab, "EPS Normalized"/"EPS (GAAP)"/"Revenue" (Fiscal Quarters) sections, FQ1 2026–FQ4 2026 columns; Oracle Q4 FY26 Earnings Press Release, 2026-06-10, Footnote 1]

Reading the last four quarters as reported, Oracle beat on revenue in 2 of 4 and beat on EPS in 3 of 4. Stripping the one-time investment gains that inflated two of those EPS beats (Q-3 heavily, Q-1 modestly), the "clean" operating EPS beat rate is closer to 2 of 4 as well — the headline beat streak overstates repeatable operating strength.

## 7. Bar Assessment

**Bar is fair.**

Management's own FY2027 guidance and the Street's consensus sit within roughly ±0.1% of each other on Non-GAAP EPS (both quarter and full year) and within −0.74% on full-year revenue [Capital IQ Estimates Report, Consensus tab; Guidance tab] — none of these gaps is large enough to call the setup meaningfully low or high on the guidance-vs-consensus test alone. Revision breadth over the last month is only mildly positive (net +2 on both Revenue and EPS FY2027, out of ~41 analysts still in consensus) [Capital IQ Estimates Report, Revisions tab], while the larger net-positive breadth over the last 2–3 months (+4 to +22) mostly reflects analysts re-anchoring to the fresh guidance issued alongside the 2026-06-10 print, not an independent re-rating beyond it. The historical beat pattern (Section 6) shows a beat-heavy last four quarters on the surface, but two of those three EPS beats were inflated by one-time investment gains — the underlying operating beat rate is closer to a coin flip. Putting the near-zero guidance gap, the thin post-print revision drift, and the weaker-than-headline clean beat rate together, the bar going into FQ1 FY2027 (release 2026-09-04) looks calibrated to what management itself guided — not stacked against the company, but not conspicuously easy either.



---

## earnings / 05_beat-miss-setup.md

_Source: `05_beat-miss-setup.md`_

# Beat / Miss Setup — ORCL

## 1. Next Quarter Context

The next print is FQ1 FY2027 (quarter ended Aug-31-2026), due 2026-09-04. This is Oracle's seasonally smallest quarter — Q1 has averaged 23.0% of annual revenue over the last three fiscal years, versus 27.7% for the fiscal year-end Q4 [`01_historical-financials.md` §5]. Management guided FQ1 FY2027 revenue growth of 27%–29% (CC and USD), implying $18,956M–$19,255M (midpoint $19,105M), and Non-GAAP EPS of $1.72–$1.76 (midpoint $1.74); Street consensus sits at $19,128M revenue (32 analysts) and $1.739 EPS (33 analysts) — both essentially on top of guidance (+0.12% and −0.03% respectively) [`04_guidance-consensus.md` §2–3]. `04_guidance-consensus.md` §7 calls the bar "fair" — not stacked against the company, but not conspicuously easy either.

## 2. Beat Scenarios

| Scenario | Driver | What Would Need To Happen | Likelihood (High / Mid / Low) | Evidence |
|---|---|---|---|---|
| OCI capacity ramps ahead of the guided pace | Cloud infrastructure (OCI/IaaS) capacity conversion from the $638B RPO backlog — the single biggest revenue driver, 79% of FY26's growth [`02_revenue-drivers.md` §6a, §7] | Data-center capacity comes online at or above the "close to 1GW next quarter" pace management flagged, converting already-contracted (98%-contracted, 97.5%-utilized) capacity to revenue faster than the 57%–63% CC cloud-revenue guide implies | Mid | [`02_revenue-drivers.md` §4, Q4 FY26 investor deck slide 7-9] |
| Opex leverage continues at FY26's pace | S&M/R&D/G&A leverage — S&M fell 270bps, R&D 193bps, G&A 39bps as a share of revenue in FY26, driven partly by "efficiency actions" management cited [`03_margin-drivers.md` §2, §7] | Sales, R&D and G&A costs keep growing slower than the guided 27–29% revenue growth, expanding non-GAAP EPS beyond the $1.72–$1.76 guide even if gross margin steps down as guided | Mid | [`03_margin-drivers.md` §5, §7 — Volume/operating leverage row +502bps FY26] |
| Full-year revenue guide ($90B) is met, beating the lower consensus | Same OCI/RPO conversion driver, at the FY2027 full-year level | Oracle simply delivers its own reaffirmed $90B FY27 guide; Street's $89,337M mean sits $663M (−0.74%) below that guide, so hitting the guide alone clears full-year consensus | Mid | [`04_guidance-consensus.md` §3] |
| RPO conversion pulled forward via prepay/BYOH deal structures | RPO conversion timing — 12% of the $638B RPO is slated to convert in the next 12 months; "majority of Q4 RPO via Bring-Your-Own-Hardware or Pre-pay" per management | A disproportionate share of newly-signed large contracts (4 customers >$8B each in Q4 FY26) begin recognizing revenue earlier than the standard 12/34/34% conversion schedule | Low | [`02_revenue-drivers.md` §4, §5; Q4 FY26 investor deck slide 7] |

## 3. Miss Scenarios

| Scenario | Driver | What Would Need To Happen | Likelihood (High / Mid / Low) | Evidence |
|---|---|---|---|---|
| Gross margin degrades beyond the guided step-down | Cost of revenue / data-center capacity cost — the single biggest margin driver, -469bps FY26, guided to worsen further in FY27 | New data-center capacity (depreciation, power, personnel) is expensed the moment it goes live, but the disclosed lag to full contracted revenue is unquantified ("multiple quarters," inference); if the lag runs longer than management's own guide assumes, EPS misses even with in-line revenue | Mid | [`03_margin-drivers.md` §3, §7-8; CFO Maxson: FY27 gross margin "will step down due to timing for the ramp-up of our data center projects"] |
| A concentrated large customer pulls back or delays | Customer/counterparty concentration within RPO — 4 customers (AMD, Meta, NVIDIA, OpenAI, TikTok, xAI named) contracted >$8B each in Q4 FY26 alone | Any one of these counterparties slows, delays, or renegotiates a contracted commitment, denting the cloud-infrastructure revenue line against the steep 57–63% CC growth guide while the associated data-center cost base is already sunk | Low-Mid | [`02_revenue-drivers.md` §4, §7] |
| Legacy software license decline outpaces the offset | Software license new-sales volume, -9% USD / -10% CC in FY26 | On-premise license erosion accelerates faster than cloud/SaaS pickup can offset it at the margin, a small but persistent drag (Low magnitude, -0.81pp of FY26 growth) | Low | [`02_revenue-drivers.md` §4, §6a] |
| Same-quarter-last-year miss repeats | Historical Q1 pattern — FQ1 FY2026 (the direct year-ago comp) missed on both revenue (-0.78%) and EPS (-0.68%) | Whatever drove last year's Q1 miss against Street (thinner Q1 seasonal base, harder ramp-up timing) recurs, since Q1 is structurally Oracle's smallest and most execution-sensitive quarter | Mid | [`04_guidance-consensus.md` §6] |

## 4. What Magnitude Matters?

| Metric | Consensus / Bar | Material Beat Threshold | Material Miss Threshold | Why |
|---|---:|---:|---:|---|
| Revenue | $19,128M (mean, 32 analysts); guide midpoint $19,105M | >$19,510M (≥+2.0% vs consensus) | <$18,956M (below the guide floor, ≈-0.9% vs consensus) | Historical clean quarterly surprises have ranged -0.83% to +1.66% [`04_guidance-consensus.md` §6]; a 2%+ beat or a print below management's own guided floor would be outside that recent range |
| EBITDA / EBIT | Not separately guided; FY27 gross margin guided to "step down" and opex "slightly negative YoY" (qualitative only) | N/A — no point/range consensus disclosed for this line at the quarterly level | N/A | `04_guidance-consensus.md` carries no quarterly EBITDA/EBIT consensus figure; qualitative guidance only |
| EPS (Non-GAAP) | $1.739 (mean, 33 analysts); guide midpoint $1.74 | >$1.83 (≥+5% vs consensus, in line with the two "clean" beats of +3.4% and +5.9% seen in the last four quarters) | <$1.72 (below the guide floor) | Stripped of one-time investment gains, the clean operating EPS beat rate is close to a coin flip and clean beats have run 3.4%-5.9% [`04_guidance-consensus.md` §6] |
| Guidance | FY2027 point guide: $90,000M revenue, $8.05 Non-GAAP EPS, ~$70B net capex | Full-year guide raised above $90B/$8.05, or FQ2 FY27 cloud-growth guide issued above the FQ1 57-63% CC band | Full-year $90B/$8.05 guide walked back, or gross-margin "step down" language hardened into a specific, larger-than-expected bps figure | The FY2027 point guide is already the market's anchor (consensus sits within ±0.1%-0.7% of it); any explicit revision either way is a genuine signal, not noise |

## 5. In-Line Print But Bad Guidance Risk

| Risk | Evidence | Why It Matters |
|---|---|---|
| In-line current quarter but guide-down on gross margin beyond what's already flagged | Management has already guided FY27 gross margin to "step down... due to timing for the ramp-up of our data center projects" [`03_margin-drivers.md` §3] | A larger-than-expected step-down would signal the capex/depreciation-to-revenue lag is running longer than management's own model, undercutting the FY27 EPS point guide of $8.05 even if FQ1 revenue is in line |
| Beat current quarter but weak margin guide | Cost of revenue rose +36.0% vs revenue +17.3% in FY26, the largest single line-item swing in the cost stack [`03_margin-drivers.md` §2, §7] | Revenue beats have historically come from the OCI/RPO conversion story, which is inherently the same driver pressuring gross margin — a revenue beat and a margin disappointment can arrive in the same print |
| Beat EPS due to one-offs, miss quality | FQ2 FY26 Non-GAAP EPS beat by +37.8% and GAAP EPS by +79.5%, both inflated by a $2,493M pre-tax gain on the Ampere Computing sale; FQ4 FY26's beat was also partly one-off ($2.111 reported vs $2.03 ex-gains) [`01_historical-financials.md` §3; `04_guidance-consensus.md` §6] | Oracle's non-GAAP framework does not cleanly exclude investment/asset-sale gains; any headline EPS beat next quarter needs to be checked against a similar disclosed one-off before being read as an operating beat |
| Beat revenue but working capital deteriorates | FCF turned sharply negative (-$23,686M FY26 vs -$394M FY25) even as CFO grew 53.6%, driven by the capex ramp; net debt/EBITDA rose to 4.46x, the highest in the five-year window [`01_historical-financials.md` §1] | A revenue beat funded by an accelerating capex/financing program ($70B net capex and a ~$40B debt-and-equity raise guided for FY27) is not the same quality of beat as one funded from existing capacity — cash conversion should be checked alongside any headline beat |

## 6. Seasonality Read

Seasonality does not help the setup for FQ1 FY2027. Q1 (the August quarter) is consistently Oracle's smallest quarter — 22.2% of FY2026 revenue, a three-year average of 23.0%, versus Q4's 28.5% — and it carries the lowest EBITDA margin of the four quarters in every one of the last three fiscal years (41.2% in FY26 Q1 vs 49.5% in FY26 Q4) [`01_historical-financials.md` §5]. This is not itself bearish — guidance and consensus both already reflect the seasonal pattern — but it does mean Q1 has the least revenue cushion and the thinnest margin base of any quarter in the fiscal year to absorb an execution slip, and it is the exact quarter that missed both lines a year ago (Section 7).

## 7. Historical Pattern

Oracle's last four quarters show a headline beat-heavy pattern — revenue beat in 2 of 4, EPS beat in 3 of 4 — but two of those three EPS beats were inflated by one-time investment gains (the Ampere Computing and Bloom Energy warrant sales), and once those are stripped out the clean operating EPS beat rate falls to roughly 2 of 4, a coin flip [`04_guidance-consensus.md` §6]. Most relevant to the setup immediately ahead: the direct year-ago comp, FQ1 FY2026, missed on both revenue (-0.78%) and EPS (-0.68%). This pattern should be weighted moderately by the synthesizer — it is not a strong systematic beat or miss bias, but the one clean same-quarter data point available points toward Q1 being Oracle's harder quarter to clear, and the quality-adjusted beat rate overall is weaker than the headline suggests.

## 8. Setup Verdict

**Setup is balanced.**

The single most important factor is whether the data-center cost ramp (which management has already guided to "step down" gross margin further in FY2027) tracks the pace management itself assumed, or runs longer than the unquantified "multiple quarters" lag implied on the call [`03_margin-drivers.md` §3] — this determines whether an in-line-to-strong revenue print (supported by a 98%-contracted, supply-constrained demand backdrop) still converts to an EPS beat. The biggest risk that could flip the setup toward a clean miss is a pullback or delay from one of the four customers that each contracted for more than $8B in a single quarter (named: AMD, Meta, NVIDIA, OpenAI, TikTok, xAI) — a name in that group stepping back would hit the revenue line directly while the associated data-center cost base is already sunk, turning operating leverage negative rather than positive.

## 9. Second-Quarter Look-Ahead

Guidance data available in the pool covers only FQ1 FY2027 and the FY2027 full year — no FQ2 FY2027-specific guidance has been issued yet [`04_guidance-consensus.md` §2]. One visible complication: FQ2 FY2027 will lap FQ2 FY2026's one-time $2,493M pre-tax Ampere Computing gain, so the year-over-year GAAP EPS comparison in that quarter will look mechanically tougher even if underlying operating performance is fine — a headline "deceleration" there would need to be checked against the one-off base before being read as a real slowdown. Beyond that comp effect, there is no further visibility from the current data pool.

## 10. Pre-Mortem

If this setup assessment turns out wrong, the most likely reason is that the margin-timing lag between data-center capex/depreciation and RPO-to-revenue conversion — which management itself declines to quantify in quarters — proved materially longer or shorter than the "already guided" framing here assumed, swinging EPS in a direction the guidance-vs-consensus gap analysis (Section 1) did not capture because that gap only measures where the Street sits today, not how the margin lag actually resolves.



---

## earnings / 06_earnings-quality.md

_Source: `06_earnings-quality.md`_

# Earnings Quality — ORCL

All figures in USD millions unless stated otherwise. Reporting standard: US GAAP. Fiscal year ends May 31 ("FY2026" = year ended May-31-2026). Source: FY2026 Form 10-K (filed 2026-06-22), Q4 FY2026 earnings press release (dated 2026-06-10), and Capital IQ Financials_Annual.xls (Income Statement / Balance Sheet / Cash Flow tabs, data as of 2026-08-13) [1][2][3][4][8]. No `ciq_facts.json` sidecar is present in `_pool_extracts/`; all figures below are this agent's own sourced read, reconciled against the upstream `01_historical-financials.md` output where overlapping.

## 1. EBITDA → CFO → FCF Bridge (5 years, FY2022–FY2026)

| Item | FY2022 | FY2023 | FY2024 | FY2025 | FY2026 | Trend |
|---|---:|---:|---:|---:|---:|---|
| EBITDA | 18,958 | 19,778 | 21,896 | 22,333 | 30,494 | Accelerating (FY2026 step-up) |
| Working capital change | 870 | (2,181) | 456 | (2,069) | (5,905) | Deteriorating (larger cash use each of the last 2 years) |
| Tax paid (cash) | (2,567) | (3,009) | (3,560) | (4,020) | (3,704) | Stable, rising in $ terms |
| Interest paid (cash) | (2,735) | (3,250) | (3,655) | (3,374) | (3,896) | Rising with debt load |
| Other operating items (plug — see note below) | (4,987) | 5,827 | 3,536 | 7,951 | 14,988 | Volatile |
| **CFO** | **9,539** | **17,165** | **18,673** | **20,821** | **31,977** | Accelerating |
| Capex (total; split not disclosed) | (4,511) | (8,695) | (6,866) | (21,215) | (55,663) | Accelerating (AI build-out ramp) |
| **FCF (CFO − Total Capex), reported** | **5,028** | **8,470** | **11,807** | **(394)** | **(23,686)** | Decelerating (turned sharply negative) |
| **CFO / EBITDA %** | 50.3% | 86.8% | 85.3% | 93.2% | 104.9% | Improving |

Capex split not disclosed — total capex used. Oracle does not break out maintenance vs. growth capex in the 10-K or press release. FCF may understate true recurring free cash flow (i.e. the number above conflates AI-datacenter growth spend with any ordinary replacement spend) [1, Cash Flow Statement; 8].

**"Other operating items" is a plug, not a disclosed line**, computed as: CFO − EBITDA + Interest paid + Tax paid − Working capital change (so that the row reconciles the table exactly). It is required because EBITDA in Section 1 of `01_historical-financials.md` is built as CIQ operating income (which excludes restructuring & other charges, per that report's Section 1 sourcing note) plus D&A, while CFO is built from full GAAP net income. The residual therefore mixes: the stock-based compensation add-back ($2,613/$3,547/$3,974/$4,674/$4,811 across FY2022–FY2026 [3, "Stock-Based Compensation" row]), restructuring & other charges excluded from CIQ's EBIT ($1,838 FY2026 / $374 FY2025 per the press-release reconciliation [8, p.4]), non-operating gains/losses on investments (a $2,433 gain in FY2026 tied to the Ampere Computing sale and Bloom Energy warrants [8, p.1–2; 3, "(Gain) Loss On Sale Of Invest." row]), and other non-cash/tax-timing items. The FY2026 residual of $14,988 is large and is named explicitly here rather than absorbed silently — it is dominated by the SBC add-back and the gap between CIQ's restructuring-excluded EBIT and full GAAP net income, not by a single unexplained item [CLAUDE.md §15].

### Normalised operating FCF (lead figure, §15)

FY2026 CFO includes a $4,642 increase in unearned (deferred) revenue [3, "Change in Unearned Rev." row], up sharply from a $154 increase in FY2025 and never above $781 in any of the prior four years shown. Management's own commentary explains the driver: large-scale AI cloud contracts where "the customer prepaid Oracle for the purchase of the GPUs, or the customer bought and supplied the GPUs to Oracle," with the cumulative prepaid/customer-supplied-hardware portion of these contracts now totalling $75 billion [Oracle Q4 FY2026 Earnings Press Release, 2026-06-10, "Remaining Performance Obligations" section]. FY2027 guidance separately confirms this is a real and ongoing cash mechanic, not a one-quarter fluke — management guides to ≈$20–25 billion of "customer prepayments and timing impacts" reducing FY2027's net capex outlay versus its ≈$90–95 billion gross figure [Oracle Q4 FY2026 Earnings Call transcript, 2026-06-10, CFO prepared remarks, per `04_guidance-consensus.md` §2]. This is a real, cash-backed, disclosed item — not fabricated earnings — but it is large and unusual in scale relative to Oracle's historical deferred-revenue cash flow, so it is treated here as the kind of one-off cash item §15 requires netting out of the lead FCF figure:

| Metric | Reported (company cash-flow statement) | Normalised (net of FY2026 unearned-revenue prepayment surge) |
|---|---:|---:|
| CFO | 31,977 | 27,335 (= 31,977 − 4,642) |
| FCF (CFO − Capex) | (23,686) | (28,328) |
| CFO / EBITDA % | 104.9% | 89.6% |

Both figures are shown; the reported FCF of −$23,686M is NOT the headline this report leads with, because a material slice of the reported cash inflow is a customer-prepayment mechanic tied to a handful of large AI contracts rather than steady-state operating cash generation. Even on the normalised basis, cash conversion (CFO/EBITDA ≈ 90%) remains strong — the underlying operating business is genuinely cash-backed; it is the capex ramp, not the earnings, that has turned FCF negative.

## 2. Cash Conversion Assessment

CFO has tracked EBITDA closely and, since FY2023, has consistently exceeded 85% of EBITDA — well above the 70% threshold this module treats as healthy — rising to 93.2% in FY2025 and a reported 104.9% (normalised ≈89.6%, see above) in FY2026 [3]. FY2022's 50.3% is the one weak year in the five-year window, driven by a large negative swing in "Other Operating Activities" and working capital that year, not by an earnings-quality problem specific to that period. The trajectory since then has been a steady improvement, not a decline, and the last three years (85.3% / 93.2% / 89.6% normalised) sit consistently in the healthy zone — CFO/EBITDA has NOT been below 50% for 2 or more of the last 3 years, so this is not a cash-conversion breakdown.

## 3. Working Capital Trends

| Metric | FY2024 | FY2025 | FY2026 | Direction | Risk |
|---|---:|---:|---:|---|---|
| Receivable days (DSO) | 51.0 | 52.2 | 51.3 | Flat | Low — no >10% YoY move |
| Inventory days (DIO) | 7.6 | Not disclosed | Not disclosed | Not assessable | Low (inventory was $334M / <1% of assets at last disclosure; CIQ shows "-" for FY2025–FY2026, consistent with Oracle's shift away from hardware-heavy reporting, not a data omission this agent can resolve from the pool) |
| Payable days (DPO) | 42.9 | 80.5 | 127.6 | Rising sharply | High |
| Cash conversion cycle (DSO + DIO − DPO) | ≈15.7 | ≈−20.9 (DIO assumed ≈7.4, last known level; inference) | ≈−69.0 (DIO assumed ≈7.4; inference) | Deeply negative and widening | Medium-High |

Formulas: DSO = 365 × average Accounts Receivable ÷ Revenue; DIO = 365 × average Inventory ÷ COGS; DPO = 365 × average Accounts Payable ÷ COGS. Average balances = (opening + closing) ÷ 2, using fiscal year-end balances [4, Balance Sheet tab: Accounts Receivable, Inventory, Accounts Payable rows; 2, Income Statement tab: "Cost Of Goods Sold" row].

- DSO: FY2024 = 365×((6,915+7,874)/2)/52,961 = 51.0 days; FY2025 = 365×((7,874+8,558)/2)/57,399 = 52.2 days; FY2026 = 365×((8,558+10,385)/2)/67,357 = 51.3 days. Flat — not flagged.
- DPO: FY2024 = 365×((1,204+2,357)/2)/15,143 = 42.9 days; FY2025 = 365×((2,357+5,113)/2)/16,927 = 80.5 days (+87.6% YoY); FY2026 = 365×((5,113+10,977)/2)/23,021 = 127.6 days (+58.5% YoY). **Flagged: DPO rising sharply in both of the last two years.** Accounts Payable itself grew from $1,204M (FY2023) to $2,357M (FY2024) to $5,113M (FY2025) to $10,977M (FY2026) [4]. This coincides directly with the AI-datacenter capex ramp (gross PP&E rose from $72.7B to $152.3B over the same FY2025→FY2026 window [4, Balance Sheet tab]) — the payables stretch reads as Oracle extending payment terms with hardware and data-center construction vendors to help fund the build-out, alongside the $43 billion of debt Oracle raised in FY2026 [8, "Capital Investment Program and Capital Funding"], rather than a deterioration in trade credit with ordinary operating suppliers. This is a genuine liquidity signal worth monitoring (a vendor payment-term squeeze reversing suddenly would pull forward a large cash outflow), not evidence of revenue-recognition or accrual manipulation.
- DIO: last disclosed inventory balance is FY2024 ($334M); CIQ's Balance Sheet export shows no separate inventory figure for FY2025 or FY2026, and this agent found no "Inventories" line in the FY2026 10-K's face balance sheet or notes — inventory (always under 1% of total assets historically) appears to have been folded into another current-asset line as immaterial. DIO for FY2025–FY2026 is therefore **not assessable from available data**; the FY2024 figure (7.6 days) is shown for reference and the FY2025/FY2026 cash conversion cycle above uses that same figure as an inference, labelled as such.

## 4. Non-GAAP Adjustments

| Adjustment | Amount (FY2026) | Recurring? (Y/N) | Concern Level (Low / Mid / High) | Evidence |
|---|---:|---|---|---|
| Stock-based compensation | 4,811 | Y — every year, rising each year | High | [8, Q4 FY2026 Earnings Press Release, "Reconciliation," p.4]. 4,811/17,087 GAAP net income = 28.2% — well above the 15%-of-GAAP-earnings threshold this module flags |
| Amortization of intangible assets | 1,671 | Y — every year (declining as older acquisitions fully amortize) | Mid | [8, same table] |
| Restructuring & other | 1,838 | Y — recurred in FY2025 ($374) via the 2024 Restructuring Plan and FY2026 ($1,838) via the newly initiated 2026 Restructuring Plan | High | [8, same table; FY2026 10-K, "Restructuring and Other Expenses"] — a "one-off" that has appeared in consecutive fiscal years under successive named plans |
| One-time investment gains (Ampere Computing sale + Bloom Energy warrants) | Not separately broken out in the pool beyond the combined effect; Q2 FY26 alone carried a $2,493M pre-tax gain on sale of investments tied to Ampere | N — genuinely one-time (asset sale) | Low-Mid | [8, Footnote 1, "Q4 and FY 2026 results include one-time net investment gains from certain transactions"; Financials_Quarterly.xls, Income Statement tab, Nov-2025 column, "Gain (Loss) On Sale Of Invest." row] — management itself excludes this from its FY2027 growth math (18% vs the 34% GAAP EPS growth actually reported), which is the correct treatment, but it means FY2026's *reported* GAAP growth rate is not a clean run-rate signal |

## 5. One-Off Items (last 3 years)

| Item | Period | Amount | Classification (Genuine / Suspicious / Recurring "one-off") | Evidence |
|---|---|---:|---|---|
| Gain on sale of Ampere Computing Holdings LLC investment | Q2 FY2026 (Nov-2025) | $2,493M pre-tax (company describes the deal as ~$2.7 billion) | Genuine one-off | [Financials_Quarterly.xls, Income Statement tab, Nov-2025 column; 8, p.1–2] |
| Bloom Energy warrants gain | FY2026 | Not separately quantified in the pool | Genuine one-off | [8, Footnote 1] |
| Deferred tax liability remeasurement, U.S. One Big Beautiful Bill Act | FY2026 | $933M unfavorable (increased tax expense) | Genuine one-off (law change) | [FY2026 10-K, MD&A, "Provision for income taxes increased... primarily related to an unfavorable impact of $933 million from the enactment of the U.S. One, Big, Beautiful Bill Act"] |
| Restructuring — 2026 Restructuring Plan | FY2026 | $1,838M (restructuring & other, total) | Recurring "one-off" | [8, p.4; FY2026 10-K, "Restructuring and Other Expenses"] |
| Restructuring — 2024 Restructuring Plan | FY2025 (substantially complete by FY2026) | $374M | Recurring "one-off" | [8, p.4] |
| Unearned-revenue / customer-prepayment surge (large AI GPU contracts) | FY2026 | $4,642M incremental cash inflow (vs $154M FY2025) | Genuine but unusually large in scale — flagged, not fabricated | [3, "Change in Unearned Rev." row; 8, "Remaining Performance Obligations" section] |

## 6. Accrual Quality Flags

| Flag | Triggered (Y/N) | Evidence |
|---|---|---|
| Revenue growing faster than CFO for 2+ years | N | Revenue growth FY2024/25/26 = 6.0%/8.4%/17.3%; CFO growth over the same years = 8.8%/11.5%/53.6% — CFO has grown FASTER than revenue in every one of the last three years [2][3] |
| Receivables growing faster than revenue | Y (mild) | AR grew 21.3% FY2026 (8,558→10,385) vs revenue growth of 17.3% — a ~4-point gap, not large but real [4][2] |
| Inventory growing faster than COGS | Not assessable | Inventory not separately disclosed FY2025–FY2026 (see Section 3) |
| Deferred revenue declining (subscription/contract business) | N | Total unearned revenue (current + non-current) rose from $10,733M (FY2025) to $15,395M (FY2026), +43.4%; non-current unearned revenue alone rose from $1,346M to $5,479M (+307%) [4] — growth, not decline |
| Capitalized costs growing as % of revenue | N (mixed, no clear trend) | Prepaid expenses (which include deferred sales commissions) were 5.4% of revenue (FY2024), 8.4% (FY2025), 6.4% (FY2026) [4][2] — rose then fell, not a one-directional rise |
| Frequent accounting policy changes | N | No policy changes identified in the FY2026 10-K accounting-policy notes beyond routine ASU adoptions |

Only 1 of 6 flags is triggered (a mild receivables-vs-revenue gap), below the 2-flag threshold. **RF-EQ-001 is NOT emitted** — accrual quality does not show the rising-accruals-divergent-from-cash-earnings pattern this tag is reserved for.

## 7. Reported vs Adjusted Reconciliation

| Metric | Reported (GAAP) FY2026 | Adjusted (Non-GAAP) FY2026 | Difference | % of Reported | Recurring? | Evidence |
|---|---:|---:|---:|---:|---|---|
| Operating Income (EBIT) | 20,606 | 28,926 | 8,320 | 40.4% | Mostly Y (SBC + intangible amortization recur every year; restructuring recurs under successive plans) | [8, p.4] |
| Net income | 17,087 | 22,337 | 5,250 | 30.7% | Mostly Y, plus one genuine one-off (investment gains partly offset) | [8, p.4] |
| Net income available to common shareholders | 16,984 | 22,234 | 5,250 | 30.9% | Same as above | [8, p.4] |
| EPS (diluted) | 5.83 | 7.63 | 1.80 | 30.9% | Same as above | [8, p.4] |

FY2025 comparison, for trend context: GAAP Operating Income $17,678 vs Non-GAAP $25,033 (diff 41.6% of reported); GAAP Net Income $12,443 vs Non-GAAP $17,284 (diff 38.9% of reported); GAAP EPS $4.34 vs Non-GAAP $6.03 (diff 39.0% of reported) [8, p.4]. The gap between reported and adjusted earnings has been consistently large (39–42% at the operating-income level) for at least two straight years — this is not a one-year anomaly, it is how Oracle habitually presents its "adjusted" results, and SBC alone accounts for over half of the total addback in both years.

## 8. Accounting Trap Checklist

*(Severity column is inverted — higher = WORSE.)*

| Trap | Triggered? (Y/N) | Evidence | Severity /100 |
|---|---|---|---:|
| Stock-based compensation excluded from adjusted earnings | Y | $4,811M FY2026, 28.2% of GAAP net income, excluded in full from non-GAAP results every year [8, p.4] | 55 |
| Restructuring costs recur every year | Y | 2024 Restructuring Plan (FY2025, $374M) followed by 2026 Restructuring Plan (FY2026, $1,838M), both excluded from non-GAAP [8, p.4; 10-K MD&A] | 55 |
| Capitalized costs rising faster than revenue | N | Prepaid/deferred-commission balance as % of revenue is not one-directional (5.4%→8.4%→6.4%, Section 6) | 10 |
| Receivable factoring / supplier finance disclosed | N | No factoring, securitization, or supply-chain-finance program disclosed in the FY2026 10-K; the DPO stretch documented in Section 3 is organic payables growth tied to the capex ramp, not a formal financing arrangement | 15 |
| Inventory write-downs or reserve releases | N | No material inventory write-down disclosed; inventory itself is immaterial and no longer separately reported | 5 |
| Revenue recognized before cash collection risk is clear | N | DSO is flat (~51–52 days, Section 3); allowance for credit losses is reviewed per-invoice per the 10-K's revenue-recognition note; the $638B RPO figure represents signed but unrecognized future contracts, not revenue already booked | 15 |
| Change in useful life / depreciation assumptions | N | Servers/networking equipment depreciated straight-line over a stated 6-year useful life, unchanged this year [FY2026 10-K, PP&E note]; the 10-K's risk factors flag that useful lives "could be shortened should our cloud strategies change" — a forward risk, not a current-year manipulation | 20 |
| Tax rate unusually low or boosted by one-off | Y | GAAP effective tax rate 12.6% (FY2026) vs the company's own non-GAAP rate of 19.9% — the gap is driven mainly by stock-based-compensation-related tax benefits (which scale with the stock price, not with operating performance) plus a partially offsetting $933M unfavorable one-time deferred-tax remeasurement [8, Footnote 5; 10-K MD&A] | 60 |
| Large fair-value / mark-to-market gains | Y | $2,493M pre-tax gain on the Ampere Computing sale (Q2 FY2026) plus a Bloom Energy warrants gain, together driving a large share of FY2026's 36% GAAP net-income-available-to-common growth (management's own math: excluding these gains, FY2026 non-GAAP EPS growth was 13%, not the ~19% headline rate implied without the exclusion) [8, Footnote 1; p.1–2] | 55 |

## 9. Earnings Quality Score

**Score: 62/100** (band: 61–80, "Mostly clean but some working capital or adjustment noise").

Single most important reason: the core operating cash engine is genuinely strong — CFO has exceeded EBITDA in 3 of the last 4 years and normalised cash conversion in FY2026 is still ≈90% of EBITDA (Section 1–2) — but this year's *reported* growth numbers are inflated by several distinct, compounding items that are each individually disclosed but collectively material: recurring restructuring charges dressed as one-offs under successive named plans, a GAAP tax rate (12.6%) well below the company's own ~20% non-GAAP rate, a large one-time investment gain that drove roughly a third of reported net-income growth, and a capex-driven working-capital shift (DPO stretched from 43 to 128 days in two years, plus a $4.6B customer-prepayment surge embedded in CFO). None of these individually would collapse the score, but their number and direction all point the same way — this year's headline growth reads better than the underlying run rate.

## 10. The Single Biggest Quality Concern

The single biggest risk that reported earnings overstate economic reality is that FY2026's headline growth (GAAP net income available to common up 36%, EPS up 34% [8, p.4]) is not a clean read of the underlying business: a large chunk of it comes from a one-time $2.5 billion+ investment gain (Ampere Computing sale) that management itself excludes from its own forward growth math (18% non-GAAP EPS growth ex-gains, not 34% GAAP), while the reported cash-flow strength is partly a function of an unusually large, disclosed customer-prepayment mechanic tied to a handful of AI infrastructure contracts rather than steady operating cash generation (Section 1). Underneath these one-year distortions, however, the core cash-conversion signal is not fictitious — CFO tracked or exceeded EBITDA in every recent year and even the normalised FY2026 figure (≈90% of EBITDA) is healthy. The more durable concern to monitor going forward is the capex-and-payables dynamic: Oracle is funding an unprecedented AI datacenter build-out partly by stretching supplier payment terms (DPO 43→128 days in two years) alongside raising $43 billion of debt in FY2026, which means free cash flow — genuinely, not just as an accounting artefact — has swung from modestly negative (−$394M FY2025) to sharply negative (−$23,686M reported / −$28,328M normalised FY2026), and any disruption to the prepayment or vendor-financing mechanics that are currently cushioning that gap would show up quickly in reported cash flow.



---

## earnings / 07_earnings-sensitivity.md

_Source: `07_earnings-sensitivity.md`_

# Earnings Sensitivity — ORCL

All figures USD millions unless stated. Fiscal year ends May 31 (FY2026 = year ended May-31-2026). Reporting standard: US GAAP. Base metric used for dollar-impact quantification is FY2026 EBITDA ($30,494M, a Capital IQ-derived figure — Oracle does not publish its own non-GAAP EBITDA — per `01_historical-financials.md` §4), FY2026 GAAP operating income/EBIT ($20,606M), and FY2026 consolidated revenue ($67,357M), all from `01_historical-financials.md` §1/§2. Where a row's underlying disclosure is expressed at a different profit level (GAAP EBIT, or pre-tax earnings for the FX table), the impact cell states that level explicitly rather than forcing it into a single EBITDA figure — mixing EBITDA and EBIT impacts without labeling would itself be a hygiene defect.

## 1. Variable Selection

The six variables below were selected from the magnitude ratings in the two required upstream driver tables — `02_revenue-drivers.md` §4 (Cloud infrastructure/RPO conversion and customer/counterparty concentration both rated "High" magnitude) and `03_margin-drivers.md` §5/§7 (cost-of-revenue/data-center-capacity-cost and operating-expense leverage both rated "High" magnitude, and the largest single line-item swings in the FY2026 margin bridge). Two variables were added from the optional business-model cross-module input, `business-model/10_external-dependency.md`: FX (the one variable with a company-disclosed, filing-level per-unit sensitivity, Item 7A) and the AI-infrastructure customer-concentration pullback (which that module's own §5 names as "the single biggest lever" for Oracle's earnings — larger than any FX, rate, or power-cost move). A seventh candidate, interest-rate risk on Oracle's $129.5 billion of debt, is included as a sixth row despite the 10-K explicitly not publishing a quantified interest-rate sensitivity table (`business-model/10_external-dependency.md` §2) — it is included because rising debt is flagged High in both upstream margin drivers (interest expense line, `03_margin-drivers.md` §2) and external dependency, but its bull/bear sizing rests on an inference, clearly labeled below, since no company-disclosed rate exists.

## 2. Sensitivity Table

| Variable | Base Case | Move Basis | Bull Case | Impact (bull) | Bear Case | Impact (bear) | Confidence | Evidence |
|---|---|---|---|---:|---|---:|---|---|
| AI-infrastructure customer/counterparty concentration (RPO backlog) | $638B total RPO; implied ~$76.6B (12%) converts to revenue in next 12 months; 4 customers each contracted >$8B in Q4 FY26 alone (named: AMD, Meta, NVIDIA, OpenAI, TikTok, xAI) | Inference from driver table: business-model module's own 20%-pullback stress test applied to the implied 12-month cRPO figure, at the FY26 consolidated EBITDA margin (45.27%) as flow-through | No incremental upside separately modeled beyond the OCI-conversion-pace row below (see note) | EBITDA +$0M (not separately quantified) | One or more named large customers pull back 20% of the embedded next-12-month backlog | EBITDA −$6,937M | Low | `business-model/10_external-dependency.md` §5; FY26 10-K, Item 7 MD&A, p.55 (RPO conversion schedule); Q4 FY26 transcript, CEO Magouyrk |
| Cost of revenue / gross margin (data-center capacity cost ramp) | Gross margin 65.83% FY26, down 469bps YoY from 70.51% FY25 | Historical observed range: the actual FY26 YoY move (469bps) used as the bull/bear test band, applied to FY26 revenue ($67,357M) | Gross margin recovers 469bps (reverses FY26's move) | EBIT +$3,159M | Gross margin compresses a further 469bps beyond FY26's exit level (consistent with management's guided, unquantified FY27 "step down") | EBIT −$3,159M | Medium | `03_margin-drivers.md` §3, §7; Q4 FY26 transcript, CFO Maxson ("gross margin will step down due to timing for the ramp-up of our data center projects") |
| FX (USD vs basket of foreign currencies) | Company-disclosed 10% FX-rate move → $(2,767)M FY26 earnings impact (vs $(2,379)M FY25) | Company-disclosed sensitivity | USD weakens 10% (FX rates +10%) | Pre-tax earnings +$2,767M | USD strengthens 10% (FX rates −10%) | Pre-tax earnings −$2,767M | High | FY26 10-K, Item 7A, Sensitivity Analysis table, p.56 |
| Operating expense leverage (S&M + R&D + G&A as % of revenue) | Combined ratio improved 502bps FY26 (S&M −270bps, R&D −193bps, G&A −39bps) | Historical observed range: 200bps (a fraction of FY26's actual 502bps combined move) applied to FY26 revenue ($67,357M) — Inference, not from filings, on the size of the fraction | Combined opex ratio improves a further 200bps | EBIT +$1,347M | Combined opex ratio worsens 200bps (spend re-accelerates, e.g. competitive response) | EBIT −$1,347M | Medium | `03_margin-drivers.md` §2, §7 |
| Cloud infrastructure (OCI) revenue / RPO conversion pace | OCI FY26 revenue $18,101M (+77% USD YoY); Q4 FY26 alone +93% YoY | Inference from driver table: upstream's own stated "10-20% swing in how fast the $638B RPO backlog converts to revenue... would move total revenue by roughly the same order of magnitude" (midpoint 15%), applied to the OCI revenue base, flow-through at FY26 consolidated EBITDA margin (45.27%) | RPO conversion pace +15% vs current run-rate | EBITDA +$1,229M | RPO conversion pace −15% vs current run-rate | EBITDA −$1,229M | Medium | `02_revenue-drivers.md` §7; FY26 10-K, Item 7 MD&A, p.45, p.55 |
| Interest expense / financing cost on new FY2027 debt | $129.5B total debt outstanding (FY26); management guides to raise ~$40B of debt and equity in FY27 | Inference: assumes ~$20B (half of the guided $40B raise) is debt, priced 100bp above/below an unstated base assumption — no company-disclosed rate-sensitivity table exists (10-K Item 7A covers only currency risk) | New FY27 debt priced 100bp cheaper than assumed | Pre-tax earnings +$200M | New FY27 debt priced 100bp more expensive than assumed | Pre-tax earnings −$200M | Low | `business-model/10_external-dependency.md` §1-§2; `04_guidance-consensus.md` §2; FY26 10-K, Item 1A, p.19 |

Note on the customer-concentration row: the bull case is left at $0 rather than mirrored, because no upstream disclosure quantifies an upside beyond continuation of the current RPO growth trajectory — that continuation is already captured in the OCI-conversion-pace row above. Showing $0 avoids double-counting an upside that belongs to a different row while still surfacing the much larger, real, one-sided downside.

## 3. Sensitivity Ranking

| Rank | Variable | Absolute Impact (avg of bull + bear) | Direction of Current Trend |
|---:|---|---:|---|
| 1 | AI-infrastructure customer/counterparty concentration | $3,469M | Rising RPO overall (backlog growing 363% YoY), but concentration in a handful of named large customers is itself building — a revenue tailwind today that doubles as the largest single downside risk |
| 2 | Cost of revenue / gross margin (data-center capacity cost) | $3,159M | Worsening — compressed 469bps in FY26 and guided by management to step down further in FY27 |
| 3 | FX | $2,767M | Small net tailwind in FY26 (~+1pp of revenue growth from FX translation); direction going forward is not controlled by the company and is not predictable from this data |
| 4 | Operating expense leverage (S&M+R&D+G&A) | $1,347M | Improving — 502bps combined tailwind in FY26; management guides opex ratio to be "slightly negative year-over-year" (i.e., continued mild improvement) in FY27, qualitatively |
| 5 | Cloud infrastructure (OCI) revenue / RPO conversion pace | $1,229M | Improving, and currently supply-constrained (management states 98% of AI datacenter capacity already contracted, 97.5% GPU utilization) rather than demand-constrained |
| 6 | Interest expense / financing cost on new debt | $200M | Worsening — net debt up 38.7% YoY to $136,143M (strict basis) and management plans to raise ~$40B more in FY27 |

## 4. The Single Highest-Sensitivity Variable

AI-infrastructure customer/counterparty concentration inside the Remaining Performance Obligations (RPO, i.e. contracted-but-unrecognized revenue) backlog is the single variable that moves earnings the most, at an estimated $6,937M EBITDA downside in the stress case modeled above — equal to roughly 23% of FY2026's actual EBITDA base ($30,494M). It is external, not company-controlled: Oracle names the concentration itself ("4 customers contracting for more than $8 billion this quarter" [Q4 FY26 transcript, CEO Magouyrk]) and publicly identifies the counterparties (AMD, Meta, NVIDIA, OpenAI, TikTok, xAI [`business-model/10_external-dependency.md` §1, Key Developments 2026-02-02]). The current direction looks positive on the surface — RPO grew 363% YoY to $638B [FY26 10-K, Item 7 MD&A, p.55] — but that growth is exactly what has concentrated the risk. For this variable to swing to the adverse case, one or more of the named large customers would need to materially reduce, delay, or cancel contracted AI-infrastructure capacity — whether from their own capex retrenchment, a shift to a competing cloud provider, or a broader slowdown in the AI-infrastructure investment cycle that Oracle itself has no control over. The 10-K's own risk-factor language anticipates this exact scenario: Oracle could become "locked into multi-year commitments for excess data center space and related capital expenditures... without receiving corresponding revenue" [FY26 10-K, Item 1A, p.18].

## 5. Interaction Effects

Several of these variables move together rather than independently. The AI-infrastructure customer-concentration risk (rank 1) and the OCI/RPO conversion-pace variable (rank 5) are mechanically linked — both stem from the same $638B backlog, so a customer pullback shows up simultaneously as slower RPO conversion and as the discrete concentration risk; the two rows in this table should be read as two lenses on the same underlying exposure, not fully independent risks to be added together. The debt-financing variable (rank 6) is also linked to the concentration risk: Oracle is raising the $129.5B of debt (and a further ~$40B planned for FY27) specifically to fund the data-center capacity that the concentrated customer contracts are meant to fill [`business-model/10_external-dependency.md` §1-§2]. If a named large customer pulled back, Oracle would be left simultaneously with lower revenue AND a debt load sized to a demand level that no longer exists — the two risks compound rather than diversify. Gross-margin compression (rank 2) and operating-expense leverage (rank 4) already partly offset each other in the FY2026 actual results (−469bps vs +502bps, net EBIT margin move of only −21bps per `03_margin-drivers.md` §7), so a reader should not assume both move independently in the same direction — the FY2026 evidence shows they have moved in opposite directions.

## 6. Non-Linear Or Asymmetric Risks

The AI-infrastructure customer-concentration variable is explicitly asymmetric: the modeled downside ($6,937M EBITDA) has no disclosed upside mirror of comparable size, and because the exposure sits in just four customers each contracting for more than $8 billion in a single quarter, the risk is lumpy rather than smoothly distributed — a pullback from even one of these named counterparties could plausibly clear a large share of the modeled stress case on its own, not gradually. The gross-margin/cost-of-revenue variable carries a genuine pass-through lag (a form of operating deleverage in a high fixed-cost business): new data-center capacity is expensed — depreciation, power, personnel — from the day it goes live, but takes management's own qualitative "multiple quarters" (unquantified) to ramp to its full contracted revenue [`03_margin-drivers.md` §3, CFO Maxson]. This means a slowdown in RPO conversion does not reduce costs proportionally — the fixed capacity cost continues regardless, so a demand shortfall hits margins disproportionately harder than an equivalent demand beat helps them. The debt-financing variable carries a rare direct linkage from financing risk to revenue risk: the 10-K states a credit-rating downgrade could "limit eligibility to contract with certain customers" [FY26 10-K, Item 1A, p.19] — meaning a financing-cost shock is not confined to the interest line, it could also constrain the very revenue-generating activity (new AI-infrastructure contracts) the debt is funding.

## 7. Earnings Volatility Score

**68/100** (inverted scale — higher = WORSE, more sensitive to small input changes)

This sits in the 61–80 "High volatility — multiple variables with large impact" band. The two largest-ranked variables (customer/counterparty concentration at $3,469M average impact and cost-of-revenue/gross margin at $3,159M) are each equal to roughly 10% of FY2026 EBITDA on their own, and the top variable is largely outside management's control. Per the module's score-cap rule, only one of the six variables (FX) rests on a company-disclosed sensitivity — the other five are inference-based (basis: inferred), which caps how much precision this score itself can claim; the 68 reflects a High-volatility read on the ranking and magnitude evidence, but the underlying confidence in the exact number is Medium-Low given how much of the table rests on labeled inference rather than filed sensitivities.



---

## earnings / 08_earnings-red-flags.md

_Source: `08_earnings-red-flags.md`_

# Earnings Red Flags — ORCL

All upstream earnings-module outputs (00 through 07) are present and were read in full. Business-model cross-module outputs are available at `analyses/ORCL_2026-08-14/business-model/` and were read where relevant (01_disqualifier-scan, 03_segment-map, 06_value-chain, 10_external-dependency, 11_capital-allocation-governance, 12_red-flags-sweep). No upstream output is missing — this scan proceeds with full data availability, not a degraded-confidence scan.

## 1. Upstream Evidence Map

Oracle's FY2026 (year ended May-31-2026) earnings setup, as built by the prior agents: revenue re-accelerated to +17.3% on a 363% surge in Remaining Performance Obligations (RPO, the contracted-but-unrecognized order book) tied to AI-infrastructure demand, while gross margin compressed 469 basis points (bps, hundredths of a percentage point) as data-center capacity is expensed before it earns its full contracted revenue. Guidance and consensus sit within roughly ±0.1%–0.7% of each other for FQ1 FY2027 (due 2026-09-04) and full-year FY2027, and the beat/miss setup is called "balanced." Underneath that setup sits a capital structure that changed sharply in one year: capex nearly tripled, free cash flow (FCF) turned deeply negative, total debt rose 54%, and S&P downgraded Oracle to BBB-.

### Bullish Evidence

| Source Agent | Claim | Evidence | Confidence |
|---|---|---|---|
| 02_revenue-drivers | FY26 revenue growth (+17.3%) is organic and demand-led, not FX- or M&A-driven; quarterly growth stepped up every quarter of FY26 (12.2%→14.2%→21.7%→20.6% YoY) | [02_revenue-drivers output, §3, §6] | High |
| 02_revenue-drivers | RPO backlog +363% YoY to $638B; 98% of AI datacenter capacity already contracted, 97.5% GPU utilization — growth is supply-constrained, not demand-constrained | [02_revenue-drivers output, §4] | High |
| 04_guidance-consensus | Management's FY2027 guidance and Street consensus sit within ±0.1% (EPS) to −0.74% (revenue) of each other — the bar is "fair," not stacked against the company | [04_guidance-consensus output, §3, §7] | High |
| 06_earnings-quality | Core cash-conversion engine is genuinely strong: CFO has exceeded EBITDA in 3 of the last 4 years; normalised FY26 CFO/EBITDA ≈90% even after stripping the customer-prepayment surge | [06_earnings-quality output, §1–2] | High |
| business-model 01_disqualifier-scan | No disqualifier triggered; unqualified audit opinion, 24-year auditor tenure (E&Y since 2002), no restatement, no going-concern language | [business-model/01_disqualifier-scan output, §1, §3] | High |
| 03_margin-drivers | Real, disclosed operating-expense leverage: S&M −270bps, R&D −193bps, G&A −39bps as a share of revenue in FY26 | [03_margin-drivers output, §2, §7] | High |

### Bearish Evidence

| Source Agent | Claim | Evidence | Confidence |
|---|---|---|---|
| 03_margin-drivers | Gross margin compressed −469bps FY26, guided to worsen further FY27 | [03_margin-drivers output, §3] | High |
| 01_historical-financials | Free cash flow turned sharply negative: −$23,686M reported FY26 (vs −$394M FY25); net debt (strict basis) up 38.7% to $136,143M | [01_historical-financials output, §1] | High |
| business-model 11_capital-allocation-governance | Total debt +54% in one year to $167.4bn; S&P downgraded issuer rating to BBB- on 2026-07-09, one notch above non-investment grade; dividend now funded by debt, not FCF | [business-model/11_capital-allocation-governance output, §1] | High |
| 06_earnings-quality | Restructuring "one-offs" recurred under successive plans: 2024 Plan ($374M FY25), 2026 Plan ($1,838M FY26) | [06_earnings-quality output, §4, §8] | High |
| 07_earnings-sensitivity | Customer/counterparty concentration = single largest earnings-sensitivity variable, $6.9B EBITDA downside (≈23% of FY26 EBITDA), largely outside company control | [07_earnings-sensitivity output, §4] | Medium — the module's own confidence label on this row is Low, since it is stress-test inference, not a company-disclosed sensitivity |
| business-model 12_red-flags-sweep | Oracle disclosed FY26 cybersecurity incidents in past tense ("experienced cybersecurity incidents that, to date, have not had a material impact") — unresolved, open-ended risk | [business-model/12_red-flags-sweep output, §2] | Medium |

### Missing Evidence

| What Is Missing | Which Agent Flagged It | Impact On Setup |
|---|---|---|
| Inventory days (DIO) for FY2025–FY2026 — no longer separately disclosed | 06_earnings-quality | FY25–FY26 cash-conversion-cycle figures rest on an inferred, carried-forward FY24 DIO figure; low practical impact (inventory <1% of assets) |
| Capex split between maintenance and growth spend | 01_historical-financials, 06_earnings-quality | Cannot independently confirm how much of the FY26 capex ramp ($55,663M, +162% YoY) is discretionary AI-growth spend vs unavoidable replacement spend |
| Company-disclosed interest-rate sensitivity | 07_earnings-sensitivity, business-model 10_external-dependency | True financing-cost exposure on $129.5B–$167.4B of debt is unquantified by the company (Item 7A covers only FX) |

### Contradictions Between Agents

| Agent A | Agent A Says | Agent B | Agent B Says | Reconcilable? (Y/N) | Which Is More Credible |
|---|---|---|---|---|---|
| 01_historical-financials | Headline annual trend table labels EBIT "Inflecting" (Capital IQ-derived figure, 33.2% FY26 margin, up from 31.3% FY25) | 03_margin-drivers | GAAP operating margin (the figure that actually reaches the income statement) was roughly flat to slightly down: 30.59% FY26 vs 30.80% FY25, a change of −21bps | Y — both figures are correct on their own stated basis, and 01 discloses the gap itself in a footnote | 03's GAAP-basis read is more credible as "the" trend — CLAUDE.md §4/§5 rank the audited GAAP figure above a data-vendor construct that excludes restructuring charges; a reader taking 01's trend column at face value alone would get a rosier read than the audited result supports |
| 06_earnings-quality | Earnings quality is "mostly clean but some working capital or adjustment noise," 62/100 | business-model 11_capital-allocation-governance / 12_red-flags-sweep | Capital allocation "concerns," 42/100; Oracle is "managing an earnings and balance-sheet presentation that looks stronger than the cash-generative core of the business currently supports" | Y — the two reads score different things (06 grades cash-earnings quality narrowly; 11/12 grade capital-allocation and balance-sheet discipline more broadly) and are not factually inconsistent | Neither report is wrong on its own scope; the synthesis should carry both readings rather than average them into a single reassuring picture |

## 2. Red-Flag Scan — Category By Category

### 2.1 Data Completeness

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Inventory days (DIO) not separately disclosed for FY2025–FY2026 | Unavailable | Low | Unknown | [06_earnings-quality output, §3] | Cash-conversion-cycle figure for the last two years rests on a carried-forward FY24 inference; immaterial in dollar terms |
| Capex split between maintenance and growth spend not disclosed | Unavailable | Low | Unknown | [01_historical-financials output, §1; 06_earnings-quality output, §1] | The "this is growth capex, not deterioration" framing throughout 02/03/06 cannot be independently verified against a disclosed baseline |

### 2.2 Historical Trend

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| FY26 Q2 EPS spike ($2.10, vs $1.10–$1.27 in adjacent quarters) was driven by a one-time $2,493M pre-tax gain on the Ampere Computing sale, not an operating result | Triggered | Medium | Medium | [01_historical-financials output, §3; 04_guidance-consensus output, §6] | Already correctly excluded from the QoQ/YoY operating trend read upstream; risk is a downstream reader re-including it without the caveat |
| Fiscal Q4 revenue concentration is rising toward the module's 30% seasonality-flag threshold (27.0% FY24 → 27.7% FY25 → 28.5% FY26) | Triggered | Low | Medium | [01_historical-financials output, §5] | A growing share of Oracle's annual result depends on a single quarter's execution |

### 2.3 Revenue

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| AI-infrastructure customer/counterparty concentration inside the RPO backlog (4 customers each contracted >$8B in Q4 FY26 alone; named AMD, Meta, NVIDIA, OpenAI, TikTok, xAI) is a near-term revenue-miss risk for FQ1 FY2027 | Triggered | High | Low | [02_revenue-drivers output, §4, §7; 05_beat-miss-setup output, §3, §8] | No current evidence any named customer is pulling back — RPO is growing — but a single counterparty's delay would hit revenue directly while the associated cost base is already sunk |
| Cloud applications (SaaS) growth of +11% USD may represent relative share loss, not share gain, versus SAP's cloud/backlog growth of 22%–27% | Triggered | Medium | Medium | [02_revenue-drivers output, §3, citing `business-model/08_competitive-map.md` §3–4, itself citing web-sourced Synergy Research Group data, labelled unverified] | The headline "cloud share of revenue rose 43%→51%" narrative could overstate genuine competitive strength in the SaaS sub-line specifically |
| RPO is increasingly built on non-standard deal structures — "majority of Q4 RPO via Bring-Your-Own-Hardware or Pre-pay" per management — complicating whether the backlog carries conventional contracted-revenue economics | Triggered | Medium | Medium | [02_revenue-drivers output, §5, citing Q4 FY26 investor deck slide 7 — management's own characterization] | The $638B RPO headline number may not be uniformly comparable across contracts; conversion pace and margin per dollar of RPO could vary more than the aggregate figure suggests |

### 2.4 Margins

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Gross margin compression (−469bps FY26) is guided by management to continue in FY27, with the conversion lag between data-center expensing and full contracted revenue left unquantified ("multiple quarters") | Triggered | High | High | [03_margin-drivers output, §3, §9; CFO Maxson, Q4 FY26 transcript] | The single largest identified swing factor in the cost stack, and the one driver management itself says will worsen further |
| EBITDA margin expansion (+636bps FY26) mechanically flatters the underlying trend by adding back depreciation & amortization (D&A), which itself grew 97.1% YoY as a direct consequence of the capex ramp | Triggered | High | High | [03_margin-drivers output, §3; 06_earnings-quality output, §1] | A reader relying on the EBITDA-margin trend line alone would materially overstate FY26's true operating-margin trajectory versus the roughly flat GAAP figure |
| FY26's operating-expense leverage tailwind (+502bps combined S&M/R&D/G&A) is partly funded by a restructuring charge that recurred under a newly-initiated 2026 plan | Triggered | Medium | Medium | [03_margin-drivers output, §2, §5; 06_earnings-quality output, §5, §8] | If restructuring-funded savings prove non-repeatable, the offset to gross-margin compression that kept FY26's net EBIT margin change to only −21bps would weaken in future years |

### 2.5 Guidance / Consensus

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Estimate-revision breadth thins sharply once the post-print re-basing wave is excluded: net +2 (Revenue and EPS) over the last month, versus net +22 (Revenue) / +10 (EPS) over the last three months | Triggered | Low | Low | [04_guidance-consensus output, §5, §7] | The larger positive breadth headline mostly reflects analysts re-anchoring to fresh guidance issued alongside the 2026-06-10 print, not an independent re-rating since |
| Headline beat pattern (revenue beat 2 of 4, EPS beat 3 of 4) overstates repeatable operating strength once one-time investment gains are stripped from two of the three EPS beats — the "clean" operating beat rate falls to roughly a coin flip | Triggered | Medium | Medium | [04_guidance-consensus output, §6, §7; 05_beat-miss-setup output, §7] | Any future headline EPS beat needs to be checked against a similarly disclosed one-off before being read as a genuine operating beat |

### 2.6 Beat / Miss Setup

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Whether an in-line-to-strong FQ1 FY27 revenue print converts to an EPS beat depends on an unquantified capex-to-revenue margin-timing lag that management declines to size in quarters | Triggered | High | Medium | [05_beat-miss-setup output, §5, §10 (Pre-Mortem)] | Named by 05's own pre-mortem as the most likely reason the beat/miss call could be wrong |
| FQ1 FY2027 is Oracle's seasonally smallest and thinnest-margin quarter, and the direct year-ago comp (FQ1 FY26) missed both revenue (−0.78%) and EPS (−0.68%) | Triggered | Medium | Medium | [05_beat-miss-setup output, §6, §7; 04_guidance-consensus output, §6] | Q1 has the least revenue cushion and the thinnest margin base of any quarter to absorb an execution slip |

### 2.7 Earnings Quality / Accounting

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| The gap between reported (GAAP) and adjusted (non-GAAP) operating income has been 39%–42% of the reported figure for two straight years, driven mainly by stock-based compensation (SBC) excluded in full ($4,811M FY26, 28.2% of GAAP net income) | Triggered | High | High | [06_earnings-quality output, §4, §7, §8] | Any "earnings accelerating" read that leans on non-GAAP EPS growth needs to be weighed against how large and persistent this addback is |
| Restructuring charges — excluded from non-GAAP results as if one-time — recurred in consecutive fiscal years under successive named plans (2024 Plan, $374M FY25; 2026 Plan, $1,838M FY26) | Triggered | High | Medium | [06_earnings-quality output, §5, §8] | A charge that recurs under a new name each year functions economically like an ongoing cost, not a genuine one-off |
| A $2.7B one-time gain on the Ampere Computing sale (plus a Bloom Energy warrants gain) drove a meaningful share of FY26's headline 36% GAAP net-income growth and 34% EPS growth; management's own ex-gains growth figure is 18% non-GAAP EPS growth | Triggered | High | Low | [06_earnings-quality output, §4–5, §10; business-model/12_red-flags-sweep output, §2] | The "earnings accelerating" verdict for FY26 is partly an artifact of a non-recurring investment gain |
| GAAP effective tax rate (12.6% FY26) sits well below the company's own non-GAAP rate (19.9%), driven mainly by stock-based-compensation-related tax benefits that scale with the stock price, not operating performance | Triggered | Medium | Medium | [06_earnings-quality output, §8] | A further, non-operating boost to reported EPS growth; a stock-price pullback would mechanically compress reported EPS even with flat operations |
| Days payable outstanding (DPO) nearly tripled in two years (42.9 → 80.5 → 127.6 days) | Triggered | High | Medium | [06_earnings-quality output, §3; business-model/11_capital-allocation-governance output, §1] | The AI-infrastructure build-out is partly funded by stretching supplier payment terms alongside new debt; a sudden reversal would pull forward a large cash outflow while FCF is already deeply negative |
| FY26 CFO includes an unusually large ($4,642M) customer-prepayment/deferred-revenue surge, versus never more than $781M in any of the prior four years; normalised CFO/EBITDA (≈90%) and normalised FCF (−$28,328M) are both worse than the reported headline figures (104.9%, −$23,686M) | Triggered | Medium | Medium | [06_earnings-quality output, §1] | Reported cash-flow strength is partly a function of this prepayment mechanic; management guides a similarly large ($20–25B) benefit in FY27, so this is a recurring mechanic to track |

### 2.8 Sensitivity / External Variables

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| AI-infrastructure customer/counterparty concentration is the single largest earnings-sensitivity variable ($6,937M EBITDA downside in a 20%-pullback stress case, ≈23% of FY26 EBITDA), and it compounds with the $129.5B–$167B debt load sized to serve that same demand | Triggered | High | Low | [07_earnings-sensitivity output, §2, §4, §5; business-model/10_external-dependency output, §5] | Currently a tail risk, not an active trend — but the magnitude if triggered exceeds any FX, rate, or power-cost move identified, and is largely outside company control |
| No company-disclosed interest-rate sensitivity exists despite $129.5B–$167.4B of debt and a fresh S&P downgrade to BBB- (one notch above non-investment grade) | Triggered | High | Medium | [07_earnings-sensitivity output, §1, §7; business-model/10_external-dependency output, §2] | Refinancing-cost exposure on a rapidly growing debt load is real but unquantified by the company |
| Five of the six identified earnings-sensitivity variables rest on inference rather than a company-disclosed sensitivity (only FX is company-disclosed) | Triggered | Medium | Unknown | [07_earnings-sensitivity output, §1, §7] | Caps the precision of the module's own earnings-volatility score (68/100) |

### 2.9 Source Conflicts

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| `01_historical-financials`'s headline annual trend table labels EBIT margin "Inflecting" using a Capital IQ figure that excludes restructuring charges (33.2% FY26), while `03_margin-drivers`'s GAAP-basis walk shows operating margin roughly flat to slightly down (30.59% vs 30.80%, −21bps) for the same year | Triggered | Medium | Medium | [01_historical-financials output, §1 footnote; 03_margin-drivers output, §3] | A face-value read of 01's trend column without the footnote overstates margin improvement versus the audited GAAP figure |
| `06_earnings-quality` scores earnings quality "mostly clean," 62/100, while business-model `11_capital-allocation-governance` and `12_red-flags-sweep` describe the same facts as "capital allocation concerns" (42/100) and a presentation that "looks stronger than the cash-generative core of the business currently supports" | Unclear | Medium | Medium | [06_earnings-quality output, §9–10; business-model/11_capital-allocation-governance output, §2, §4; business-model/12_red-flags-sweep output, §4] | Not a factual contradiction — the two modules score different things — but the synthesis must carry both readings, not let the narrower score imply comfort |

### 2.10 Narrative / Framing

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| The "earnings accelerating" story for FY26 (17.3% revenue growth, 34% headline GAAP EPS growth) rests on three qualifiers a face-value reading of 02/03/04/05 alone would not surface: a one-time $2.7B investment gain, a debt-and-payables-funded capacity build tied to concentrated AI customers, and an EBITDA metric flattered by a rapidly growing D&A add-back | Triggered | High | High | [Synthesis of 01_historical-financials, 03_margin-drivers, 06_earnings-quality, and business-model/11_capital-allocation-governance, all cited above] | The underlying revenue/RPO growth is real and demand-led, but the earnings-acceleration headline overstates how much of FY26's reported growth is repeatable without these qualifiers attached |
| The setup is arguably as much a commodity/policy-conditional bet (GPU and power supply, a FERC gas-pipeline approval gating one named data-center site) as a company-specific earnings story | Not Triggered | — | — | [02_revenue-drivers output, §7 already labels FY26 growth "peak-of-cycle-adjacent"; business-model/10_external-dependency output, §3 already classifies Oracle "Mostly externally driven"] | No hidden framing gap found — already explicitly self-flagged by both the revenue-drivers agent and the external-dependency cross-module input |

## 3. Red-Flag Summary Table

| # | Category | Red Flag | Status | Severity | Probability | One-Line Impact |
|---:|---|---|---|---|---|---|
| 1 | Margins | Gross margin compression guided to continue, unquantified conversion lag | Triggered | High | High | Largest cost-stack swing; the one driver management itself says will worsen |
| 2 | Margins | EBITDA margin flattered by D&A add-back (+97.1% YoY) | Triggered | High | High | Overstates true operating-margin trajectory vs. GAAP |
| 3 | Beat/Miss Setup | EPS beat/miss hinges on unquantified margin-timing lag | Triggered | High | Medium | Named by 05 itself as the most likely reason the setup call could be wrong |
| 4 | Earnings Quality | GAAP-to-non-GAAP gap 39–42% of operating income, two years running (SBC-driven) | Triggered | High | High | Non-GAAP EPS growth leans heavily on a large, persistent addback |
| 5 | Earnings Quality | Restructuring "one-offs" recur under successive named plans | Triggered | High | Medium | Funds part of the opex-leverage tailwind; savings may not be truly repeatable |
| 6 | Earnings Quality | $2.7B Ampere one-off inflated FY26 headline growth (34% vs 18% ex-gains) | Triggered | High | Low | FY26's "accelerating" read is partly a non-recurring-gain artifact |
| 7 | Earnings Quality | Days payable outstanding nearly tripled (43→128 days) | Triggered | High | Medium | Capex build partly funded by stretched supplier terms, not just debt |
| 8 | Sensitivity | Customer/counterparty concentration = largest sensitivity variable, compounds with debt | Triggered | High | Low | ≈23% of FY26 EBITDA at risk in a stress case; largely outside company control |
| 9 | Sensitivity | No company-disclosed interest-rate sensitivity despite $129.5–167.4B debt + BBB- downgrade | Triggered | High | Medium | Refinancing-cost exposure real but unquantified by the company |
| 10 | Revenue | AI customer/counterparty concentration in RPO — near-term miss risk | Triggered | High | Low | A single named counterparty pullback would hit revenue directly against sunk cost base |
| 11 | Narrative | "Earnings accelerating" headline rests on one-off gain + debt-funded build + EBITDA flattery | Triggered | High | High | Face-value read of 02/03/04/05 alone overstates repeatability of FY26 growth |
| 12 | Historical Trend | FY26 Q2 EPS spike ($2.10) driven by one-time Ampere gain | Triggered | Medium | Medium | Not a repeatable quarterly EPS level; already correctly excluded upstream |
| 13 | Revenue | SaaS +11% may mask relative share loss vs SAP (22–27%) | Triggered | Medium | Medium | Web-sourced/unverified caveat; competitive read weaker than headline cloud-mix shift suggests |
| 14 | Revenue | RPO increasingly built on non-standard structures (BYOH/pre-pay) | Triggered | Medium | Medium | Complicates comparability and conversion-pace assumptions for the $638B backlog |
| 15 | Margins | Opex-leverage tailwind partly funded by recurring restructuring | Triggered | Medium | Medium | Offset to gross-margin compression may not fully persist |
| 16 | Guidance/Consensus | Headline beat pattern overstates clean operating strength once one-offs stripped | Triggered | Medium | Medium | "Clean" EPS beat rate closer to a coin flip than the 3-of-4 headline suggests |
| 17 | Beat/Miss Setup | FQ1 seasonally weakest quarter; year-ago comp missed both lines | Triggered | Medium | Medium | Least revenue/margin cushion of any quarter to absorb an execution slip |
| 18 | Earnings Quality | GAAP tax rate (12.6%) vs non-GAAP (19.9%), SBC-linked | Triggered | Medium | Medium | A further, non-operating boost to reported EPS growth |
| 19 | Earnings Quality | $4.6B customer-prepayment surge inflates reported CFO/FCF vs normalised figures | Triggered | Medium | Medium | Reported cash-flow strength partly a prepayment mechanic, not pure operating cash generation |
| 20 | Sensitivity | 5 of 6 sensitivity variables are inference-based, not company-disclosed | Triggered | Medium | Unknown | Caps confidence in the module's own 68/100 earnings-volatility score |
| 21 | Source Conflicts | 01's "Inflecting" EBIT trend (CIQ basis) vs 03's flat/−21bps GAAP operating margin | Triggered | Medium | Medium | Face-value read of 01's headline table overstates margin improvement |
| 22 | Source Conflicts | 06's "mostly clean" (62/100) vs business-model's "capital allocation concerns" (42/100) on the same facts | Unclear | Medium | Medium | Synthesis must carry both readings, not let the narrower score imply comfort |
| 23 | Historical Trend | Q4 revenue concentration rising toward the 30% seasonality-flag threshold | Triggered | Low | Medium | Growing share of the annual result depends on one quarter's execution |
| 24 | Guidance/Consensus | Revision breadth thins sharply excluding the post-print re-basing wave | Triggered | Low | Low | Modest signal, not an independent re-rating since the June print |

## 4. Red-Flag Score

| Metric | Value |
|---|---|
| Total flags triggered | 23 |
| Critical flags | 0 |
| High flags | 11 |
| Medium flags | 11 |
| Low flags | 2 |
| Unclear flags | 1 |
| Unavailable checks (data missing) | 2 |

## 5. Red-Flag Severity Verdict

**Material concerns** — high-severity flags present; earnings setup may be overstated or fragile.

No disqualifier is triggered, no going-concern language exists, and the core operating cash engine remains genuinely cash-backed (normalised CFO/EBITDA ≈90%), so this does not rise to Critical concerns. But 11 High-severity flags cluster around the same underlying issue from different angles: the gross-margin/EBITDA read is flattered by non-cash add-backs and a guided-but-unquantified conversion lag, the GAAP-to-non-GAAP gap and recurring "one-off" restructuring charges make reported earnings growth partly a presentation choice, and a debt load that rose 54% in one year (now BBB-, one notch from non-investment grade) is directly exposed to the same concentrated customer base that management describes as diversifying. The single most dangerous red flag is the compounding link between AI-customer/counterparty concentration (≈23% of FY26 EBITDA at risk in a stress case, per 07) and the $129.5B–$167B debt sized to serve that same demand (per business-model 11) — a pullback from even one named counterparty would hit revenue and leave debt-funded capacity built for demand that no longer exists. What would resolve it: a company-disclosed customer-level concentration limit or diversification metric in a future filing, and continued RPO growth without a slowdown in the named-customer base.

## 6. What The Synthesis Agent Should Know

- 23 red flags triggered (11 High, 11 Medium, 2 Low), 1 Unclear, 2 Unavailable checks. Zero Critical.
- The single most dangerous red flag: AI-customer/counterparty concentration inside the $638B RPO backlog, compounding with $129.5B–$167B of debt sized to serve that same demand — a $6.9B EBITDA stress-case impact (≈23% of FY26 EBITDA), largely outside company control [07_earnings-sensitivity output, §4; business-model/10_external-dependency output, §5].
- No red flag here should change the earnings-module verdict from what 02/03/04/05 already support at the revenue/demand level (accelerating, demand-led, supply-constrained) — but the verdict language should not be presented without the qualifiers in flags #4, #6, and #11 (non-GAAP gap, one-off gain, EBITDA/D&A flattery), which materially temper how "clean" the acceleration reads.
- Score-cap relevance: the earnings-quality score (62/100, `06_earnings-quality`) should not be read in isolation from the business-model capital-allocation-governance score (42/100) — flag #22 (Unclear, Source Conflicts) requires the synthesis to carry both, not average them.
- Two upstream contradictions to reconcile: (1) 01's headline "Inflecting" EBIT trend vs 03's flat/−21bps GAAP operating margin — 03's GAAP basis should be treated as the more credible trend read; (2) 06's "mostly clean" earnings-quality framing vs the more alarmed business-model capital-allocation read — both should be carried forward, not averaged.
- Missing data that prevented a full scan: capex maintenance/growth split (not disclosed by the company) and inventory days for FY25–FY26 (no longer separately disclosed) — both are minor, not scan-invalidating.
- The setup is dirtier than a face-value read of 02/03/04/05 alone would suggest, primarily because those four reports are individually well-sourced and rigorous but do not, on their own, aggregate the cumulative weight of the earnings-quality (06) and cross-module capital-allocation (business-model 11/12) findings into a single picture. Read together, FY26's "acceleration" is real at the revenue/RPO level but overstated at the reported-earnings level once non-GAAP addbacks, one-off gains, and D&A flattery are stripped out.

## 7. Pre-Mortem — If The Earnings Setup Fails

If this earnings setup turns out wrong, the most likely reason is that the capex-to-revenue margin-timing lag — the gap between when new data-center capacity is expensed (depreciation, power, personnel, from day one of operation) and when it earns its full contracted revenue — runs longer than management's own guidance assumes. Management has already guided FY27 gross margin to "step down" for exactly this reason but has declined to quantify the lag beyond "multiple quarters," and 05_beat-miss-setup's own pre-mortem names this same mechanism as the most likely reason its beat/miss call could be wrong [05_beat-miss-setup output, §10; 03_margin-drivers output, §3, §9]. Because the guidance-vs-consensus gap analysis in 04 only measures where the Street sits today — and the Street has already anchored tightly to management's own guidance — a longer-than-guided lag would not show up as a pre-print warning sign in the consensus data; it would only appear after the fact, in a gross-margin print that misses even a revenue number that beats.
