# Valuation Module Memo — AKAM

Verdict: Materially overvalued — the **$68.78** base fair value is **35.6% below** the pool-verified **$106.79** price. [valuation/07_scenario-and-fair-value.md, §§4, 6]

Memo date: 2026-09-14

## Scores at a Glance

| Score or status | Result | Source |
|---|---:|---|
| Valuation attractiveness (**higher = cheaper**) | **10/100** | [Valuation Module synthesis, 2026-09-14, §1 Valuation Verdict] |
| Margin of safety (**higher = better**) | **5/100** | [Valuation Module synthesis, 2026-09-14, §1 Valuation Verdict] |
| Valuation confidence | **50/100** | [Valuation Module synthesis, 2026-09-14, §1 Valuation Verdict] |
| Downside risk (**inverted — higher is worse**) | **85/100** | [Valuation Module synthesis, 2026-09-14, §1 Valuation Verdict] |
| Data quality | **72/100** | [Valuation Module synthesis, 2026-09-14, §1 Valuation Verdict] |
| Overall usefulness | **62/100** | [Valuation Module synthesis, 2026-09-14, §1 Valuation Verdict] |
| Cross-method dispersion | **Not assessable — one valid value-producing method** | [Valuation Module synthesis, 2026-09-14, §1 Valuation Verdict] |
| Dominant method | **Intrinsic FCFF DCF** | [Valuation Module synthesis, 2026-09-14, §1 Valuation Verdict] |

Only one binding cap applies. Because the discounted-cash-flow model, or DCF—valuing future cash in today’s money—is the only valid value-producing method, Valuation confidence is capped at **50/100** and finishes at **50/100**. Terminal value—the estimated worth after the detailed forecast—is **82.2%** of DCF enterprise value, above the **75%** trigger that would separately cap confidence at **60/100**, but the stricter single-method cap governs. The no-price, stale-price, no-consensus, no-peer-data, multi-segment sum-of-the-parts, misaligned-owner, and sector-cycle caps do not apply. The **greater-than-40%** cross-method-spread cap also does not apply because dispersion is Not assessable, not measured as 0%. [valuation/04_intrinsic-dcf.md, §§5–7; valuation/07_scenario-and-fair-value.md, §§1–2]

No §24 misaligned-controlling-owner filter or **RF-OWN-004** flag was found. The operating value-trap risk comes instead from an apparent but unreconciled peer discount, no proven economic moat, **48/100** business quality, **35/100** disruption risk, **5.14x** strict net debt to GAAP-derived EBITDA, and cash conversion that has not been proven. [valuation/01_price-and-capital-structure.md, §5; valuation/03_relative-valuation-peers.md, §§2–7; valuation/07_scenario-and-fair-value.md, §5]

The Sector Cycle Reality Test did not produce a cap. The own-history specialist emitted no cycle tag because the available IGV price proxy rose **14.1%**, below the roughly **25%** guide, while the peer specialist found sector-level multiple history Not assessable. The absence of a tag does not prove either zero-weight multiple anchor is sound. [valuation/02_multiples-own-history.md, §5; valuation/03_relative-valuation-peers.md, §6; valuation/07_scenario-and-fair-value.md, §2]

## What This Module Found

The decision applies to **AKAM common stock on the Nasdaq Global Select Market in USD**. The current price is the pool-verified **$106.79** close on **2026-09-14**. [CIQ Comps → Financial Data, “Day Close Price Latest” subject row, data as of 2026-09-14; valuation/01_price-and-capital-structure.md, §§1, 7]

The 12-month fair-value levels are **$109.66 bull, $68.78 base, and $45.65 bear_cyclical**. A separate **$33.99 bear_structural** floor applies over **24–36 months**. These are scenario levels, not probability-weighted targets; the master synthesizer, not this module, assigns probabilities. [valuation/07_scenario-and-fair-value.md, §§1–3]

All valid levels come from one free-cash-flow-to-the-firm DCF, or FCFF DCF—cash available to debt and equity investors, discounted and then bridged from enterprise value to equity. The base is **$68.78**, but terminal value supplies **82.2%** of enterprise value, and a **1-percentage-point** WACC plus **0.5-percentage-point** terminal-growth swing spans **$45.65–$109.66**. [valuation/04_intrinsic-dcf.md, §§1, 4–8] That range is uncertainty inside one model, not independent method agreement.

At **$106.79**, the reverse DCF says the price requires **16.35% annual free-cash-flow growth** from **$629.9m** in the last 12 months to **$1.245bn by FY2030**, or a **19.21% FY2030 FCF margin** on the model’s revenue path. Matched FCF grew at **6.34% a year in FY2023–FY2025** and then fell **9.92%** in the latest 12 months, so the required cash path is not proven. [valuation/05_reverse-dcf.md, §§2–5]

Margin of safety—the cushion between base value and price—is **−55.3% = ($68.78 − $106.79) / $68.78**. The **$45.65** 12-month bear implies **57.3% downside**, while the **$33.99** structural floor implies **68.2% downside** over its longer horizon. [valuation/07_scenario-and-fair-value.md, §4]

The strongest counterpoint is the required return. Holding the forecast cash path fixed, the market price reconciles at a **5.05%** implied WACC—the return demanded by lenders and shareholders—which is **1.17 percentage points below** the model’s **6.22%**. A persistently lower required return could support the price without the full 16.35% cash-growth solve. [valuation/05_reverse-dcf.md, §2A]

## The Specialists, Briefly

| Specialist | Brief finding |
|---|---|
| valuation-data-triage | **Sufficient, with method limitations.** Price, filings, cash flow, consensus, and peer data are present, but own-history has only six closes and sum-of-the-parts is not applicable to one reportable segment. [valuation/00_valuation-data-triage.md, §§3, 5–6A] |
| price-and-capital-structure | **Pool-verified anchor established.** **$106.79** price, **153.686m** diluted working shares, and **$6,082.6m** strict net debt form the canonical bridge. [valuation/01_price-and-capital-structure.md, §§2, 4–7] |
| multiples-own-history | **Upper-range directional read; fair value not assessable.** Price to next-12-month normalized EPS is **11.9%** above its six-close mean, but roughly **1.5 years** cannot support a reversion value. [valuation/02_multiples-own-history.md, §§2–6] |
| relative-valuation-peers | **Warranted peer value not assessable.** The apparent **77.4% EV/EBITDA discount** uses a mixed **59.4x** peer median and a subject multiple that does not reconcile to the filing bridge; **$377.81** is mechanical only. [valuation/03_relative-valuation-peers.md, §§2–7] |
| intrinsic-dcf | **Base intrinsic value $68.78; low confidence.** Terminal value is **82.2%** of enterprise value; the grid is **$45.65–$109.66**, with a **$33.99** structural-runoff input. [valuation/04_intrinsic-dcf.md, §§5–8] |
| reverse-dcf | **Current price embeds a stretch not proven by available data.** It requires **16.35%** annual FCF growth to **$1.245bn** in FY2030 at the model WACC, or a **19.21%** margin. [valuation/05_reverse-dcf.md, §§2–5] |
| sum-of-the-parts | **Effectively single-segment — SOTP collapses.** Security, Delivery, and CIS lack separate profit and capital data, so no independent breakup value is produced. [valuation/06_sum-of-the-parts.md, §§1–5] |
| scenario-and-fair-value | **Single-method fair value; confidence capped at 50.** The 12-month levels are **$109.66 / $68.78 / $45.65**, plus a separate **$33.99** structural floor over 24–36 months. [valuation/07_scenario-and-fair-value.md, §§1–6] |

The main reconciliation is that only the **$68.78 intrinsic DCF** is a valid value-producing point. The **$45.65–$109.66** span is its sensitivity grid, not a cross-method football field, so dispersion is Not assessable rather than 0%. The DCF receives **100% mechanical weight** only because no usable forward multiple or sum-of-the-parts value exists; that does not imply high trust. The **$377.81** peer output is excluded, own-history has too few closes for reversion, and one reportable segment prevents a breakup value. [valuation/02_multiples-own-history.md, §§2–4; valuation/03_relative-valuation-peers.md, §§2–5; valuation/06_sum-of-the-parts.md, §§1–5; valuation/07_scenario-and-fair-value.md, §§1–2]

Within the DCF, the **$68.78** Gordon-growth base is above the **$60.03** exit-multiple check, while the declining-perpetuity case is **$33.99**. The market-implied **5.05% WACC** versus the model’s **6.22%** means part of the gap may be the required return rather than cash growth alone; at the model WACC, however, the price still requires 16.35% annual FCF growth. [valuation/04_intrinsic-dcf.md, §§5–8; valuation/05_reverse-dcf.md, §§2A–5]

## What Would Change This Read

| Direction | Observable change |
|---|---|
| Make the stock cheaper relative to value | Evidence that Security and CIS growth converts into FCF near the reverse-DCF requirement: roughly **$1.245bn by FY2030**, or a **19.21% margin on $6.482bn revenue**, together with support for a required return near the **5.05%** market-implied WACC. [valuation/05_reverse-dcf.md, §§2–3] |
| Support lower values | Persistent CFO margin near H1 FY2026’s **29.4%**, cash capital spending near **20% of revenue**, Delivery price pressure, or a move toward the **7.22% WACC / 0.30% terminal-growth** sensitivity would support **$45.65**; a lasting decline supports the **$33.99** structural floor. [valuation/04_intrinsic-dcf.md, §§2, 5, 7; valuation/07_scenario-and-fair-value.md, §3] |
| Highest-value next data request | A consistent, same-date peer export with enterprise value and last-12-month and next-12-month revenue, EBITDA, EBIT, EPS, FCF, and net debt for the named peers, sufficient to build a second matched-basis value-producing method. [valuation/03_relative-valuation-peers.md, §5] |

## Bottom Line

- **Verdict: Materially overvalued.** The **$68.78** base is **35.6% below** the **$106.79** verified price, and margin of safety is **−55.3%**. [valuation/07_scenario-and-fair-value.md, §§4, 6]

- It could be better than it looks because Security revenue grew **10%**, CIS grew **39%**, and the top valid DCF sensitivity reaches **$109.66**, or **2.7% above** price, if the forecast cash path holds with a **5.22% WACC** and **1.30%** terminal growth. The earnings evidence does not separately prove that cash conversion. [valuation/05_reverse-dcf.md, §3; valuation/07_scenario-and-fair-value.md, §3]

- It could be worse because the price requires **16.35%** annual FCF growth through FY2030 versus **6.34%** matched growth in FY2023–FY2025 and a **9.92%** latest-12-month decline; the 12-month bear implies **57.3% downside**. [valuation/05_reverse-dcf.md, §§3, 5; valuation/07_scenario-and-fair-value.md, §4]

- The key missing evidence is a same-date, matched-basis peer export that can produce a valid second valuation method. Until then, confidence remains capped at **50/100**. [valuation/03_relative-valuation-peers.md, §5; valuation/07_scenario-and-fair-value.md, §§1–2]

- Watch whether Security and CIS growth converts into roughly **$1.245bn** of FY2030 FCF or a **19.21%** margin on the model revenue path; those are the expectations embedded at the model WACC. [valuation/05_reverse-dcf.md, §§2–5]

## Plain-English Glossary

- **Fair value:** The module’s estimate of what one share is worth under its stated assumptions.
- **Margin of safety:** The cushion between the estimated value and the market price.
- **Discounted cash flow (DCF):** A valuation that converts forecast future cash into today’s value.
- **Free cash flow (FCF):** Cash from operations minus cash capital spending.
- **Enterprise value:** The value of the operating business before moving from debt and cash to shareholder value.
- **FCFF:** Free cash flow available to both debt and equity investors.
- **WACC:** Weighted-average cost of capital, or the return demanded by lenders and shareholders.
- **Terminal value:** Estimated business value after the detailed forecast period.
- **Strict net debt:** Total debt minus cash and cash equivalents only.
- **P/NTM EPS:** Price divided by forecast earnings per share for the next 12 months.
- **EV/EBITDA:** Enterprise value divided by earnings before interest, tax, depreciation, and amortization.
- **Sum-of-the-parts (SOTP):** Valuing separate business units individually and adding them together.
