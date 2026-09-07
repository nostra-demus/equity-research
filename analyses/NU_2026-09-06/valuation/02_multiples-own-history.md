# Multiples — Own History — NU

**Scope note.** This agent judges NU against **itself over time** only. No peer comparison (that is `03`), no cash-flow model (that is `04`), no final fair value (that is `07`).

**Reporting currency: US dollar (USD).** IFRS Accounting Standards as issued by the IASB; fiscal year ends 31 December [FY2025 Form 20-F, cover page and Note 2].

**Anchor numbers — taken verbatim from `01_price-and-capital-structure.md` §7.** Price **USD 14.30** (2026-08-28 close, pool-verified); shares for market cap **4,830,688,659**; market cap **USD 69,078.8m**; shares for per-share fair value **4,878,395 thousand** fully diluted; book value attributable to the parent **USD 13,249.67m** (BVPS 2.74 outstanding / 2.72 diluted); tangible common equity **USD 12,093.198m** (TBVPS 2.50 / 2.48); dividend **zero**. The fresher indicative quote of **USD 15.37** (2026-09-04 close, web-sourced, unverified, +7.48%) is carried alongside where it changes a read. No anchor is departed from anywhere in this report.

**Business type governs the multiple set.** `00_valuation-data-triage` classifies NU as a **Financial (bank)**. Under the MODULE_RULES Business-Type Method Map, **EV/EBITDA, EV/EBIT and EV/Sales are invalid for this issuer and are not computed** — `01` shows why in one line: its enterprise-value bridge excludes USD 45,328.4m of deposits and USD 15,541.7m of payables to network, i.e. USD 60.9bn of the bank's actual funding. The valid set is **P/E, P/book, P/tangible book**, with price-to-pre-tax-earnings and price-to-revenue as secondary reads. Capital IQ itself reports no EBITDA line for NU (`ciq_facts.json` `ltm_ebitda_m` = `unknown`, note: "Income Statement sheet has no 'EBITDA' row"), and `ev_ebitda_current_x`, `ev_ebitda_percentile` and `range_position` are all `unknown` for the same reason — the sidecar and the Method Map agree.

**Duplicate-copy note.** The pool carries the Capital IQ multiples history three times (`Nu Holdings Ltd NYSE NU Financials Multiples.xls`, `… Multiples (1).xls`, and the `Multiples` tab inside `Nu Holdings Ltd NYSE NU Financials.xls`). All three are **byte-identical in content** — same seven period columns, same figures. One copy is cited throughout: `Nu Holdings Ltd NYSE NU Financials Multiples.xls` → tab `Multiples`. No number enters this report twice under two filenames.

---

## 1. Current Multiples

All at the pool-verified anchor price of **USD 14.30, 2026-08-28 close**. Every figure below is the Capital IQ **Close** value for the period ending 2026-08-28, which is computed on that same USD 14.30 price — verified three ways: `14.30 / 19.480457 = 0.73407` = the reported LTM diluted EPS of 0.734069; `14.30 / 5.213629 = 2.7428` = the reported BVPS of 2.74; `14.30 / 5.712208 = 2.5034` = the reported TBVPS of 2.50. So the multiples export and this module's anchor are on the **same price**, not two different ones.

| Multiple | Basis (LTM / NTM / FY) | Metric Value | Current Multiple | Source |
|---|---|---:|---:|---|
| **P / E (reported diluted EPS excl. extraordinary)** | **LTM**, 12m to Jun-30-2026 | EPS USD **0.734069** | **19.48x** | `Nu Holdings Ltd NYSE NU Financials Multiples.xls` → `Multiples`, "P/LTM EPS" Close, period 2026-08-28; EPS from `… Financials Key Stats.xls` → `Key Stats`. Cross-checked against `ciq_facts.json` `pe_ltm_current_x` = **19.5**, status `present` — agrees |
| **P / E (consensus)** | **NTM** (next twelve months from 2026-08-28) | EPS USD **0.9686** (derived: 14.30 / 14.763576) | **14.76x** | `… Financials Multiples.xls` → `Multiples`, "P/NTM EPS" Close; identical figure in `NuHoldingsLtdNYSENUEstimatesReport.xls` → `Multiples`, NTM Price/Earnings 14.7635762956845 |
| P / E (consensus) | **FY2026E** | EPS USD 0.8482 | **16.86x** | `NuHoldingsLtdNYSENUEstimatesReport.xls` → `Multiples`, FY 2026 Price/Earnings; EPS from `… Key Stats.xls` |
| P / E (consensus) | **FY2027E** | EPS USD 1.11006 | **12.88x** | Same export, FY 2027 |
| P / E (**normalized** EPS, CIQ definition) | **LTM** | — | **25.66x** | `… Financials Multiples.xls` → `Multiples`, "P/LTM Normalized EPS" Close |
| **P / Book value** | **LTM / point-in-time** Jun-30-2026 | BVPS USD **2.7428** (equity to parent 13,249.67m) | **5.21x** | `… Financials Multiples.xls` → `Multiples`, "P/BV" Close; equity from Q2 2026 Interim Report (Aug-14-2026), statement of financial position |
| **P / Tangible book value** | **LTM / point-in-time** Jun-30-2026 | TBVPS USD **2.5034** (tangible common equity 12,093.198m) | **5.71x** | `… Financials Multiples.xls` → `Multiples`, "P/Tangible BV" Close; build in `01` §6 (13,249.7 − goodwill 409.4 − other intangibles 747.1) |
| P / Book (consensus) | **FY2026E** | BVPS USD 3.1477 (derived: 14.30 / 4.54297) | **4.54x** | `NuHoldingsLtdNYSENUEstimatesReport.xls` → `Multiples`, FY 2026 P/BV |
| Market cap / pre-tax earnings (EBT excl. unusual) | **LTM**, 12m to Jun-30-2026 | EBT USD **4,384.603m** | **15.75x** | `… Financials Multiples.xls` → `Multiples`, "Market Cap/LTM EBT Excl. Unusual Items" Close; EBT from `… Key Stats.xls` |
| Market cap / revenue (**CIQ net-revenue basis**) | **LTM**, 12m to Jun-30-2026 | Revenue USD **8,442.068m** | **8.18x** | `… Financials Multiples.xls` → `Multiples`, "Market Cap/LTM Total Revenue" Close |
| P / FCF, FCF yield | **Not computed — not meaningful for a bank** | — | — | LTM cash from operations is **−USD 10,304.8m** on the vendor basis and **−USD 1,381.6m** on the company basis, because a growing lender's loan book and deposits run through operating cash flow [`ciq_facts.json` `ltm_ocf_m`, status `present`; `earnings/01_historical-financials.md`, both bases labelled]. `ciq_facts.json` `levered_fcf_m` = `unknown`. Free cash flow is not an earnings base for this issuer |
| **Dividend yield** | — | USD **0.00** per share | **0.00%** | No dividend has ever been declared; dividend per share reported "NA" in every year FY2021–FY2025 and total dividends paid "–" across FY2021–LTM Jun-30-2026 [`Nu Holdings Ltd NYSE NU Financials Ratios.xls` → `Ratios`; `… Cash Flow.xls` → `Cash Flow`]. "We may not pay any cash dividends in the foreseeable future" [FY2025 Form 20-F, Item 3.D] |
| EV / EBITDA, EV / EBIT, EV / Sales | **Dropped — invalid for a Financial (bank)** | — | — | MODULE_RULES Business-Type Method Map; `01` §4 (the EV bridge omits USD 60.9bn of deposits and network payables); `ciq_facts.json` `ltm_ebitda_m` = `unknown` |

**Two vendor traps named so nobody re-imports them.**

1. **The `Key Stats` multiples are priced at USD 14.88, not at the anchor.** That tab's "Valuation Multiples based on Current Capitalization" block shows P/Diluted EPS LTM **20.27x**, P/BV **5.43x**, Price/Tang BV **5.94x**, Market Cap/Revenue **8.51x**, Market Cap/EBT **16.39x** — every one of them computed on the **undated USD 14.88** share price that `01` §1 rejected. Scaling by `14.30 / 14.88 = 0.96102` reproduces this report's figures exactly (20.270574 × 0.96102 = 19.48; 5.943892 × 0.96102 = 5.71). **Use the 14.30-based figures in the table above; the Key Stats block is +4.1% high on every multiple.**
2. **Market cap / revenue is not comparable between its LTM and NTM forms — they are on two different revenue definitions.** CIQ's "Market Cap/LTM Total Revenue" of 8.18x uses a **net** revenue of USD 8,442.1m, while its "Market Cap/NTM Total Revenues" of 2.72x is built on consensus revenue of roughly USD 25,400m — which sits on the company's **gross** revenue basis (the earnings module's TTM revenue on the company basis is USD 19,340.0m against the same vendor's 8,442.1m [`earnings/01_historical-financials.md`; `earnings/99_earnings-synthesis.md` §2], and consensus FY2026E revenue is 22,908.0m [`… Key Stats.xls`]). A "de-rating" from 8.18x to 2.72x is an accounting-basis change, not a valuation change. **The NTM revenue multiple is excluded from every band and every implied value in this report.**

---

## 2. Historical Multiple Bands — and the window is 20 months, not 3–5 years

**Partial-data flag, stated before the table.** The only multiple time series in the data pool is the Capital IQ `Multiples` export, and it covers **seven period columns from 2025-03-31 to 2026-08-28 — about 20 months (roughly 1.7 years), not the 3–5 years this agent is supposed to use.** Six columns are full quarters and the seventh is a two-month stub (2026-07-01 to 2026-08-28). Each column's Average / High / Low is computed by Capital IQ from **every trading day inside that period** ("Average multiples are calculated using positive close values on each trading day within the frequency periods selected"), so the band below rests on roughly 415 daily observations — it is not three data points. But 415 daily observations inside 20 months still only observe 20 months.

**This is a data-pull gap, not a short listing history.** NU has been listed on the NYSE since December 2021 [FY2021 Form 20-F, filed Apr-21-2022], so roughly 4.7 years of trading history exists — the pool's export simply was not pulled back that far. FY2022, FY2023 and FY2024 are **unobserved here**, and the pool contains no other multiple series to fill them (the `Charting Excel Export Aug-29-2026` file is an unlabelled daily series running ~0.027–0.030 with no metric name, and is not a multiple).

**Consequence, applied in full (Partial-Data Rule).** Because the observed own history is shorter than ~3 years, the reversion table in §4 is **illustrative only and is NOT a fair-value input for `07_scenario-and-fair-value`.** The band itself IS still handed to `07` — MODULE_RULES Scenario Construction §2 needs an evidenced upper and lower multiple to bound the bull and bear cases — but it is handed over labelled as a **20-month, not-full-cycle** band.

**Method.** *Min* = the lowest daily Low in any period. *Max* = the highest daily High in any period. *Mean* = the unweighted average of the seven period Averages. *Median* = the median of the same seven period Averages. *Current* = the Close for the period ending 2026-08-28 (i.e. at USD 14.30). *Percentile of range* = `(current − min) / (max − min)`, i.e. where today sits inside the full observed daily High–Low envelope. Time-weighting the mean by month length (3,3,3,3,3,3,2) rather than treating the two-month stub as a full period moves the P/E mean from 27.65x to 27.98x and the P/tangible-book mean from 7.44x to 7.51x — under 1.5% in both cases, so the unweighted figures are used.

Source for the entire table: `Nu Holdings Ltd NYSE NU Financials Multiples.xls` → tab `Multiples`, seven period columns 2025-03-31 through 2026-08-28 (Capital IQ, data as of 2026-08-28; export as-of 2026-08-29).

| Multiple | Min | Mean | Median | Max | Current | Percentile of Range |
|---|---:|---:|---:|---:|---:|---:|
| **P / LTM EPS** | 17.90x | 27.65x | 29.98x | 38.28x | **19.48x** | **7.8%** |
| **P / NTM EPS** | 12.90x | 20.07x | 21.70x | 26.90x | **14.76x** | **13.3%** |
| **P / Book value** | 4.48x | 6.73x | 7.14x | 8.77x | **5.21x** | **17.1%** |
| **P / Tangible book value** | 4.91x | 7.44x | 7.91x | 9.79x | **5.71x** | **16.4%** |
| Market cap / LTM pre-tax earnings (EBT) | 14.00x | 19.85x | 21.26x | 25.91x | **15.75x** | **14.7%** |
| Market cap / LTM revenue (CIQ net basis) | 7.43x | 10.64x | 10.57x | 14.29x | **8.18x** | **11.0%** |
| ~~EV / EBITDA~~, ~~EV / EBIT~~, ~~EV / Sales~~ | — | — | — | — | — | Invalid for a Financial — not computed |

**What the band is for.** These min / mean / median / max figures are the evidenced envelope `07` should stay inside when it sets its **bull** multiple (toward the upper band) and its **bear** multiple (toward the lower band), so the scenario multiples remain inside a multiple this company has actually traded at. Two warnings travel with them: (a) the envelope is 20 months, so the true full-cycle low is almost certainly **below** the 4.48x P/B / 12.90x forward-P/E floor shown here, and (b) the upper end (38.28x LTM P/E, 9.79x tangible book) was set in Q1-2025 and Q1-2026, both of which sit inside a single directional move rather than across a cycle.

---

## 3. Re-Rating / De-Rating Read

**The stock has de-rated hard, and it sits near the bottom of everything it has traded at in the last 20 months.** On the three most reliable multiples for a bank: forward P/E of **14.76x is 26.4% below its own 20-month mean of 20.07x and 31.9% below the median of 21.70x**; price-to-tangible-book of **5.71x is 23.2% below its own mean of 7.44x and 27.8% below the median of 7.91x**; price-to-book of **5.21x is 22.6% below the mean of 6.73x and 27.0% below the median of 7.14x**. On trailing P/E the gap is widest — 19.48x against a 27.65x mean, a **29.6% discount**, at the **7.8th percentile** of the observed daily range. Every one of the six valid multiples sits in the bottom fifth of its own 20-month envelope; not one of them is above its own mean.

**The mechanical reason is that earnings ran away from the price, not that the price collapsed.** Over the same window the share price went USD 13.14 (May-2025) → 15.59 (Nov-2025) → 16.65 (Feb-2026) → 12.19 (May-2026) → 13.93 (Aug-2026) → 14.30 [`Nu Holdings Ltd NYSE NU Financials Historical Capitalization.xls` → `Historical Capitalization`, plus the anchor], while LTM diluted EPS went USD 0.4034 (FY2024) → 0.5846 (FY2025) → **0.7341** (LTM Jun-2026), up 82.0% [`… Financials Key Stats.xls` → `Key Stats`], and book value per share went from USD 1.784 (8,607.909m over 4,824.407m shares, Mar-2025) to USD 2.743, up 53.8% [`… Historical Capitalization`]. A price that is roughly flat over a period in which the denominator grows 54–82% produces exactly this de-rate arithmetically. Growth is decelerating, not stopping — consensus still models EPS +45.1% in FY2026E and +30.9% in FY2027E [`… Key Stats.xls`].

**But there is a real, cited reason the warranted multiple may have fallen, and it is the earnings base itself.** The earnings module found that **40.4% of trailing-twelve-month net income to the parent — USD 1,458.6m of USD 3,607.1m — is a non-cash deferred tax credit**, that cash tax paid of USD 2,108.1m is 2.7x the profit-and-loss charge of USD 774.6m, and that its lead measure is **cash-backed net income of USD 2,148.5m** [`earnings/06_earnings-quality.md`; `earnings/99_earnings-synthesis.md` §2]. It also found that of the 187 basis points of net-margin expansion in Q2'26, the tax line contributed +300.2bp while every operating component together was **−112.0bp, with pre-tax margin down 155bp year on year** [`earnings/03_margin-drivers.md` §7B; Q2 2026 Interim Report, Statements of Income and Note 30]. **Restate today's P/E on cash-backed earnings and the "discount" inverts: cash-backed EPS = 0.734069 × (2,148.5 / 3,607.1) = USD 0.4372, so the current P/E is 14.30 / 0.4372 = 32.7x — ABOVE the 27.65x mean of the reported-EPS band, not 30% below it.** That single line is the most important number in this report.

---

## 4. Implied Value from Reversion — ILLUSTRATIVE ONLY, not a fair-value input for `07`

> **Read this before the table.** The own history observed here is **20 months**, not 3–5 years (§2). Under the Partial-Data Rule the figures below are a **directional, illustrative read of where the stock sits inside its own short range** — they are **not** a fair-value point or range for `07_scenario-and-fair-value` to weight, and no base-case fair value is designated from them. `07` should take the **band** from §2 to bound its bull and bear multiples, and take its base-case level from a method with a longer or independent evidence base.

Per-share values are `own multiple × aggregate metric ÷ 4,878,395 thousand fully diluted shares` for the balance-sheet and pre-tax multiples, and `own multiple × per-share earnings` for the two P/E lines (whose denominator is already a diluted per-share figure, on a weighted-average count of 4,904.8m that is slightly **above** the fully diluted point count — so those two lines are, if anything, marginally conservative). Aggregate metrics: book value USD 13,249.670m; tangible common equity USD 12,093.198m; LTM EBT USD 4,384.603m; LTM net revenue USD 8,442.068m [Q2 2026 Interim Report, statement of financial position; `… Financials Key Stats.xls`].

| Multiple | Reversion Target (mean / median) | Implied Equity Value (USD m) | Implied Price/Share (USD) | vs Current Price 14.30 | vs Fresher 15.37 |
|---|---:|---:|---:|---:|---:|
| P / Tangible book value | **mean 7.44x** | 89,942 | **18.44** | +28.9% | +19.9% |
| P / Tangible book value | **median 7.91x** | 95,634 | **19.60** | +37.1% | +27.5% |
| P / Book value | mean 6.73x | 89,197 | **18.28** | +27.8% | +18.9% |
| P / Book value | median 7.14x | 94,630 | **19.40** | +35.7% | +26.2% |
| P / NTM EPS | mean 20.07x | — (per-share build) | **19.44** | +35.9% | +26.5% |
| P / NTM EPS | median 21.70x | — (per-share build) | **21.01** | +46.9% | +36.7% |
| P / LTM EPS | mean 27.65x | — (per-share build) | **20.30** | +42.0% | +32.1% |
| P / LTM EPS | median 29.98x | — (per-share build) | **22.01** | +53.9% | +43.2% |
| Market cap / LTM pre-tax earnings | mean 19.85x | 87,051 | **17.84** | +24.8% | +16.1% |
| Market cap / LTM pre-tax earnings | median 21.26x | 93,215 | **19.11** | +33.6% | +24.3% |
| Market cap / LTM revenue (net basis) | mean 10.64x | 89,848 | **18.42** | +28.8% | +19.8% |
| Market cap / LTM revenue (net basis) | median 10.57x | 89,206 | **18.29** | +27.9% | +19.0% |

**The illustrative reference point, named.** Had this been a 3–5 year band, the designated base point would be the **own-MEDIAN price-to-tangible-book multiple of 7.91x, giving USD 19.60 per share** — tangible book is the most defensible denominator here because it is an audited balance-sheet number (USD 12,093.198m, built line by line in `01` §6) rather than an estimate, and it does not carry the deferred-tax distortion that sits inside the earnings denominators (§3). **It is named, and it is illustrative only.**

**Dispersion across the multiples used, as its separate exhibit.** The full high-to-low field is **USD 17.84 to USD 22.01** — a spread of 23.4% of the low. On the median basis alone the field is USD 18.29 to USD 22.01. The two earnings-based reversions sit at the top of the field precisely because the earnings denominator has grown fastest, which is the same fact that §3 flags as the least durable.

**The reversion assumption, stated explicitly, and it does not clearly hold.** Every figure above assumes the multiple NU deserves has not structurally changed since 2025. Three pieces of evidence say it may have:
- **The earnings base is lower quality than it was.** 40.4% of trailing net income is a self-reversing non-cash deferred tax credit whose fuel — provision build outrunning tax-deductible write-offs — only exists while the loan book grows fast, and sequential FX-neutral portfolio growth has more than halved (+11% → +7% → +5% quarter on quarter) [`earnings/06_earnings-quality.md`; `earnings/99_earnings-synthesis.md` §1A, citing Q2'26 Earnings Presentation slide 13]. A market that discounts that credit is not mispricing the stock; it is refusing to pay a growth multiple for a tax item.
- **Operating margin is going the other way.** Pre-tax margin fell 155bp year on year while reported net margin rose 187bp — the whole improvement is below the operating lines [`earnings/03_margin-drivers.md` §7B]. A falling pre-tax margin is a normal reason for a multiple to compress.
- **The currency exposure is unhedged and large.** On the company's own 17.8% BRL shock, roughly USD 1.05bn — 29% of trailing net income — is at risk, against an exposure management states it decided not to hedge [`earnings/99_earnings-synthesis.md` §1, citing FY2025 Form 20-F, Items 3.D and 11].

Against those, the operating engine is genuinely still running: constant-currency revenue +34.02%, ARPAC +22% FX-neutral for a sixth consecutive quarter, customers 123m → 139m, and loan-loss coverage **building** from 15.37% to 16.86% of gross credit assets in six months rather than being released [`earnings/99_earnings-synthesis.md` §1A, citing Q2'26 interim statements Note 7 and the Q2'26 presentation]. So the case that some of this de-rate is unwarranted is real. It is not proven from this module's evidence, and reverting all the way to a 20-month mean set during a faster-growth, higher-tax-credit period is not underwritten here.

---

## 5. Sector Cycle Reality Test

**Check run, partially matched, and the flag does NOT fire.** The data pool contains **no historical peer or sector multiple series** — the comps workbook (`Company Comparable Analysis Nu Holdings Ltd .xls` → `Trading Multiples`, As-Of 2026-08-29) gives only **current** peer multiples for the ten-name LatAm bank set (P/diluted EPS LTM: mean 9.3x, median 8.5x; P/tangible book LTM: mean 1.9x, median 1.8x; NTM forward P/E: mean 7.59x, median 7.73x), with no history behind them. Sector history was therefore web-sourced and is labelled: **the Brazilian banks industry traded at a price/earnings ratio of about 8.7x as of 2026-03-29, ABOVE its own three-year average of about 7.6x (+14.5%)** [Web: Simply Wall St, Brazilian (BOVESPA) financials / banks market pages, read 2026-09-06 — indicative, unverified], and **Itaú Unibanco's price-to-book of about 2.02x in January 2026 stood roughly 18.0% ABOVE its own three-year average of 1.71x** [Web: GuruFocus ITUB P/B page, data as of 2026-01-08 — indicative, unverified]. **Both sector reads move in the OPPOSITE direction to NU's own de-rating finding — the sector sat above its own historical average while NU fell to the bottom fifth of its own range — and both magnitudes (+14.5%, +18.0%) are below the ~25% materiality threshold. The trigger therefore requires a same-direction move of more than ~25%, and neither condition is met. No cycle-elevated / cycle-depressed flag is raised, and no `RF-VAL-001` / `RF-VAL-002` tag is emitted.** The honest limitation: the web sources measure against three-year averages, not against this report's exact 2025-01 to 2026-08 window, so the check is **directionally sound but not window-matched** — it rules out the "NU's mean is just the sector bubble" hypothesis rather than proving the band is stable. The larger threat to this band is **not** a sector cycle at all: it is that the band is only 20 months long (§2) and that the earnings denominator inside it is 40.4% deferred-tax credit (§3). Those are named separately and are not cured by this test.

---

## 6. Own-History Read

**NU trades at 14.76x forward earnings and 5.71x tangible book — 26.4% and 23.2% below its own 20-month means, in the bottom fifth of everything it has traded at since January 2025 — and reverting to those means would imply roughly USD 18.3 to USD 22.0 per share against USD 14.30 (USD 15.37 on the fresher indicative quote), which is +25% to +54%.** That entire range is **illustrative only**: the observed history is 20 months, not the 3–5 years a reversion target needs, because the Capital IQ multiples export was pulled only back to 2025-03-31 even though the stock has traded since December 2021 — so no base-case fair value is handed to `07` from this method, only the band that bounds its bull and bear multiples.

**The single biggest caveat: the de-rate may be deserved, and the cleanest test says it is.** Forty percent of trailing net income is a non-cash deferred tax credit that reverses as loan growth slows, pre-tax margin fell 155bp year on year while the reported net margin rose, and restating today's price against the earnings module's cash-backed net income of USD 2,148.5m puts the current price/earnings at **32.7x — above, not 30% below, the 27.65x mean of the band this report just built**. Reverting to the old mean assumes the market will again pay a growth multiple on an earnings line the market appears to be discounting; that is not proven here.

**On ownership (§24 Filter 6 — this module owns the read).** The management-governance module tested it and it is **negative**: state-owned shares 0.03%, one reported segment at 100% of revenue, and Nu is the top holding company rather than a listed subsidiary of a value-maximising parent — **`RF-OWN-004` is NOT emitted and no value-trap note flows to valuation** [`management-governance/04_ownership-and-insider-behavior.md` §4, finding 04-021; `management-governance/99_management-governance-synthesis.md` §C and the cap table]. So the persistent-cheapness-under-a-misaligned-owner trap does not apply, and no ownership-based discount is taken here. Separately and for the record, the governance module still reads shareholder rights as weak (20:1 dual class, 74.4% of votes on 18.6% of the economics, founder veto over dividends and M&A) — that is priced by that module under governance risk, not as a valuation discount by this one.

**Sector cycle:** tested and not flagged (§5) — the Brazilian bank sector sat *above* its own three-year average while NU de-rated, which is the opposite direction to the trigger, so this band is not flagged as cycle-elevated. It is flagged as **too short**, which is a different and, here, a bigger problem.
