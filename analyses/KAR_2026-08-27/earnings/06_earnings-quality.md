# Earnings Quality — KAR

Karoon Energy Ltd (ASX: KAR) reports under IFRS (AASB) in US dollars, changed its fiscal year end from 30 June to 31 December (a 6-month transition period, "TY23", sits between the last old-convention year and the first new-convention year), and reports full audited/reviewed income statement, balance sheet, and cash flow **half-yearly**, not quarterly [`00_earnings-data-triage.md` §0; `01_historical-financials.md` §0]. This report follows `01_historical-financials.md`'s established basis: three genuine 12-month periods under the old 30-June year end (FY2021–FY2023) plus two genuine 12-month periods under the new 31-December year end (FY2024–FY2025); the 6-month TY23 stub is excluded from annual comparisons to avoid mixing period lengths (CLAUDE.md §15). Cash flow data IS available (audited FY2025 Consolidated Statement of Cash Flows and reviewed H1 2025 Consolidated Statement of Cash Flows are both present in the pool) — no partial-data cap applies on that ground. FY2021–FY2023 figures are Capital IQ-sourced only (no primary annual filing for those periods exists in this pool), consistent with `01_historical-financials.md`'s own caveat; FY2024–FY2025 figures are filing-sourced and cited to page/note.

**Lead finding on FCF (CLAUDE.md §15):** reported FY2025 free cash flow was **negative US$37.1m** (CFO $251.4m − total capex $288.5m), but **US$202.6m of that capex was a one-off, company-itemised M&A/settlement outflow** — the US$115.0m buyout of the Baúna FPSO charter lease plus an US$87.6m contingent-consideration payment to Petrobras [FY2025 Annual Report, "Financial Summary" narrative, p.49: "Net cash outflows from investment activities in 2025 were US$288.5 million, of which US$115.0 million related to the acquisition of the Baúna Cidade de Itajaí FPSO and US$87.6 million related to the Petrobras contingent consideration payment"; Three Year Summary, p.141]. Stripping that itemised one-off, **normalised operating FCF for FY2025 was +US$165.5m** (CFO $251.4m − recurring capex $85.9m). The reported negative headline is a real cash outcome (Karoon did pay the cash out), not an accounting fiction — but it reflects a discrete strategic buyout and a legacy liability settlement, not a deterioration in the recurring cash the operations throw off. Both figures are shown side by side below, labelled.

## 1. EBITDA → CFO → FCF Bridge (5 years)

Currency: US dollars. **EBITDA basis note (CLAUDE.md §15):** FY2021–FY2023(Jun) use the Capital IQ-standardized EBITDA (no company-reported EBITDA exists for those periods in this pool); FY2024–FY2025 use the company's own reported "EBITDA" line from the audited Financial Summary [FY2025 Annual Report, p.48], which differs from Capital IQ's standardized FY24/FY25 EBITDA ($498.3m/$364.7m) by a material margin already flagged in `01_historical-financials.md` §1. This is a basis switch, stated explicitly, not silently mixed.

| Item | FY2021 (Jun) | FY2022 (Jun) | FY2023 (Jun) | FY2024 (Dec) | FY2025 (Dec) | Trend |
|---|---:|---:|---:|---:|---:|---|
| EBITDA | 84.3 | 206.3 | 332.0 | 450.3 | 380.7 | Volatile |
| Working capital change (core: receivables + inventory + payables) | (28.8) | (28.5) | +12.4 | (2.9) | +0.3 | Volatile |
| Tax paid (cash) | (10.8) | (39.4) | (78.8) | (43.0) | (48.0) | Volatile |
| Interest paid (gross finance costs paid) | (13.2) | (18.9) | (19.8) | (52.0) | (66.3) | Rising |
| Other operating items (residual — see note below) | (1.7) | +34.7 | +60.1 | +82.2 | (15.3) | Volatile |
| **CFO** | **29.8** | **154.2** | **305.9** | **434.6** | **251.4** | Volatile |
| Maintenance capex (sustaining development/production spend) | n/a — split not disclosed | n/a — split not disclosed | n/a — split not disclosed | 26.0 | 57.9 | Rising |
| Growth capex (exploration & evaluation capitalised + other PP&E) | n/a | n/a | n/a | 104.6 | 28.0 | Falling |
| One-off / M&A capex (FPSO buyout FY25; bolt-on oil & gas asset acquisitions FY24) | n/a | n/a | n/a | 88.0 | 202.6 | Volatile |
| Total capex | 172.9 | 114.1 | 355.3 | 218.6 | 288.5 | Volatile |
| **FCF (CFO − Total Capex), reported** | **(143.1)** | **40.1** | **(49.4)** | **216.0** | **(37.1)** | Volatile |
| **Normalised operating FCF (CFO − maintenance − growth capex, ex one-off M&A)** | n/a | n/a | n/a | **304.0** | **165.5** | Falling but positive |
| **CFO / EBITDA %** | **35.4%** | **74.7%** | **92.1%** | **96.5%** | **66.0%** | Deteriorating (FY25 vs FY24) |

**Capex split note:** "Capex split not disclosed" for FY2021–FY2023 — only a single Capital IQ "Capital Expenditure" total exists for those years, with no primary filing in this pool to source a maintenance/growth breakdown. Total capex is used for those three years' FCF calculation. For FY2024–FY2025 the split IS disclosed: the company's own "Flow of Funds" summary separates "Net cashflows from investing activities (excl. M&A)" from "Acquisitions/divestments" as distinct lines [FY2025 Annual Report, Three Year Summary, p.141], and the FY2025 narrative itemises the two M&A components (FPSO buyout $115.0m; Petrobras contingent-consideration payment $87.6m) [p.49]. Maintenance capex = "Payments for oil and gas assets" (cash-basis, developing/sustaining existing Baúna/Who Dat production); growth capex = "Payments for exploration and evaluation expenditure capitalised" + "Purchase of plant and equipment and intangibles" [FY2025 Annual Report, Consolidated Statement of Cash Flows, p.81].

**"Other operating items" residual — name it, don't round it away (CLAUDE.md §15):** this row is a plug that reconciles EBITDA, working-capital change, tax paid and interest paid back to reported CFO exactly; it is not independently derived and its size varies a lot by year (from −$15.3m to +$82.2m). For FY2024–FY2025, where the company's own reconciliation note is available [FY2025 Annual Report, Note 8, p.94], the residual is substantially composed of: non-cash P&L items sitting inside EBITDA that don't move cash the same period (share-based payments $2.8m/$2.4m, discount unwinding on restoration provisions $10.5m/$9.0m, net FX losses/gains, amortisation of finance costs), a large non-cash change in fair value of contingent consideration (−$21.2m FY25 gain / +$6.5m FY24 loss) and the non-recurring $35.3m gain on disposal of the FPSO right-of-use asset (FY25 only) — both of which reduce EBITDA-implied cash without being cash items — plus tax-related balance-sheet timing (deferred tax assets, current tax asset/liability movements: −$27.9m net in FY25, +$77.6m net favourable in FY24 from a $50.9m deferred-tax-asset release and a $20.6m current-tax-liability increase). The FY2024 residual is dominated by that one-off $50.9m deferred tax asset movement — a real, disclosed swing, not an error, but it means FY2024's exceptionally high 96.5% CFO/EBITDA ratio is flattered by a non-recurring tax-timing benefit that will not repeat every year.

## 2. Cash Conversion Assessment

Cash conversion (CFO ÷ EBITDA) has been above the 70% "healthy" threshold in three of the last four years — 74.7% (FY2022), 92.1% (FY2023), 96.5% (FY2024) — and never fell below the 50% "red flag" line in any of the five years shown; the weakest year, FY2021 (35.4%), reflects the early growth-phase working-capital drag of a smaller company and pre-dates the period this module otherwise relies on. FY2025 conversion slipped to 66.0%, still comfortably above 50% but the lowest reading since FY2021, driven by a $66.3m cash interest bill (up from $52.0m, reflecting a full year of the $350m term loan drawn in FY2024) and the unwind of FY2024's favourable tax-timing benefit described above. Because CFO/EBITDA was NOT below 50% in any of the last three reported years (92.1% FY23, 96.5% FY24, 66.0% FY25), the module's cash-conversion-breakdown trigger does not fire — cash conversion is a genuine strength of this earnings profile, not a quality concern, though the FY2025 step-down against a rising interest bill is worth watching into FY2026.

## 3. Working Capital Trends

**Basis:** period-end balances (not averages), stated consistently across all three columns because a reliable average would require a Jun-2022/Dec-2023 primary-filing balance sheet that either doesn't exist in this pool (old-convention years) or would mix fiscal-year conventions with the new-convention years. FY2023 column uses the old 30-June fiscal year end and is Capital IQ-sourced (no primary annual filing for FY2023(Jun) exists in this pool — same caveat as `01_historical-financials.md` §1); FY2024/FY2025 columns are filing-sourced [FY2025 Annual Report, Consolidated Statement of Financial Position, p.79, Notes 9–11]. COGS ("Cost of sales") = Revenue − Gross profit each year [FY2025 Annual Report, p.78].

| Metric | FY2023 (Jun, CIQ-sourced) | FY2024 (Dec, filing) | FY2025 (Dec, filing) | Direction | Risk |
|---|---:|---:|---:|---|---|
| Receivable days (DSO) | 47.1 | 29.0 | 28.4 | Falling / stable | Low — within the company's own disclosed 30–45 day receivable terms [Note 9, p.96]; Baúna crude is sold entirely through one contracted marketer (Shell Western Supply and Trading), so DSO reflects single-counterparty credit risk, not a broad receivables book — a concentration flagged in `business-model/06_value-chain.md`, not itself an earnings-quality defect |
| Inventory days (DIO) | 11.3 | 13.7 | 31.9 | **Rising sharply (+133% YoY FY24→FY25)** | **Flagged — see note below** |
| Payable days (DPO) | 62.0 | 54.2 | 71.5 | Volatile, rising FY25 | Medium — "Trade and other payables" is a broader balance-sheet line than pure 30-day trade credit (it also carries royalty/government-take accruals and JV cash-call balances), so a DPO well above the company's own disclosed "usually paid within 30 days" trade-payables norm [Note 11 accounting policy, p.97] reflects that broader composition, not stretched supplier terms per se |
| Cash conversion cycle (DSO + DIO − DPO) | (3.6) | (11.5) | (11.2) | Stable, negative | Low — a negative cycle means Karoon is, on net, paid before it pays out; favourable to liquidity and consistent year to year |

**DIO flag, with context:** current (crude-oil) inventory held on the FPSO rose from $4.4m (FY2024) to $23.3m (FY2025) — the non-current $10.5m component (drilling/workover spares, per Note 10) was unchanged, so the whole rise sits in the crude-oil line. The company attributes this to cargo-lifting timing: "more oil inventory on hand at year end reflecting production and one less cargo in the period" [FY2025 Annual Report, Directors' Report, p.49]. This reads as a disclosed operational/logistics timing effect in a single-FPSO, cargo-based sales model (there is no multi-tier distribution "channel" to stuff) rather than a demand-related build-up — but it still meets the module's mechanical >15% YoY DIO threshold and is carried forward as a genuine accrual-quality flag in Section 6, since an un-shipped cargo sitting in inventory at year-end is real earnings/cash timing risk into the following period regardless of the stated cause.

## 4. Non-GAAP Adjustments

Karoon discloses "Underlying EBITDAX" and "Underlying NPAT" as labelled non-IFRS measures reconciled from statutory results in a fully itemised table [FY2025 Annual Report, Financial Summary, p.48, footnote 5]. Amounts below are each item's NPAT-basis impact.

| Adjustment | Amount (FY2025 / FY2024, US$m, NPAT basis) | Recurring? (Y/N) | Concern Level (Low/Mid/High) | Evidence |
|---|---:|---|---|---|
| Unsuccessful exploratory wells (dry-hole write-offs) | 10.9 / 12.0 | **Y — present in both disclosed years** | **Mid — this is a normal, recurring cost of upstream E&P exploration, not a true one-off; treating it as "non-recurring" every year understates the run-rate cost of the exploration programme** | FY2025 Annual Report, p.48; Note 5415 relates cost to Who Dat West (MC-629-1) well |
| Non-cash FX movements — Brazil deferred tax assets (in tax expense) | (26.4) / 60.9 | **Y — present in both years, opposite sign each time, >15% of GAAP NPAT both years** | **High — a $30m+ swing on a ~$125m NPAT base, driven by BRL/USD translation of Brazilian deferred tax balances, not by operations** | FY2025 Annual Report, p.48 (adjustment table); Note 5(a) tax reconciliation, p.90 |
| Change in fair value of contingent consideration (Petrobras) | (14.0) / 4.3 | **Y — recurs while the $34.2m liability remains outstanding** | Mid — non-cash, but a real embedded derivative still on the balance sheet [Note 18(ii), p.6288] | FY2025 Annual Report, p.48; Consolidated Statement of Profit or Loss, p.78 |
| Realised losses/(gains) on cash flow hedges + FX losses/(gains) | 1.5+5.1 / 8.1+(2.6) | Y — present both years | Low-Mid | FY2025 Annual Report, p.48 |
| Non-recurring gain on disposal of FPSO right-of-use asset | (35.3) / 0 | N — tied to the specific FPSO buyout event | **Low for repeatability, but material size: 28.1% of GAAP FY2025 NPAT — exceeds the module's 15%-of-GAAP-earnings threshold** | FY2025 Annual Report, p.48/78; Note 3(b) |
| Non-recurring FPSO transition costs | 2.9 / 0 | N (first occurrence) | Low | FY2025 Annual Report, p.48 |
| Non-recurring corporate relocation costs | 4.8 / 0 | N (first occurrence) | Low | FY2025 Annual Report, p.48 |
| Non-recurring flotel costs expensed | 13.9 / 0 | N (first occurrence, but sizeable: 11.1% of GAAP NPAT) | Low-Mid | FY2025 Annual Report, p.48 |
| Non-recurring advisory & transaction costs | 0 / 3.8 | N | Low | FY2025 Annual Report, p.48 |

**Pattern flag:** every one of the two disclosed years carries a DIFFERENT set of items labelled "non-recurring" (FPSO transition/corporate relocation/flotel costs in FY2025; advisory & transaction costs in FY2024) on top of items that recur in BOTH years (unsuccessful wells, the Brazil FX deferred-tax swing, contingent-consideration fair-value change). This is the module's "recur every period, then they're not one-off" pattern: Underlying NPAT has excluded a materially different basket of costs in each of the only two years this pool can itemise, which makes "Underlying" a moving target rather than a stable, comparable measure. Stock-based compensation is NOT excluded from Underlying results — it is not listed among the reconciling items — which is a genuine positive: management is not using the adjusted-earnings framework to strip out equity compensation.

## 5. One-Off Items (last 2 years — see limitation)

Only FY2024 and FY2025 carry an itemised, filing-sourced one-off breakdown in this pool (no primary annual filing exists for FY2023 or earlier). This is a data-availability limitation, not a finding of opacity.

| Item | Period | Amount | Classification (Genuine / Suspicious / Recurring "one-off") | Evidence |
|---|---|---:|---|---|
| Gain on disposal of FPSO right-of-use asset | FY2025 | +$35.3m (pre-tax); +$18.6m offsetting deferred tax impact | Genuine one-off — tied to the FPSO buyout, a real and disclosed strategic transaction | FY2025 Annual Report, p.48, 78; Note 3(b) |
| Petrobras contingent-consideration payment | FY2025 | −$87.6m cash (M&A-classified capex) | Genuine one-off cash settlement of a legacy acquisition liability; $34.2m of the contingent-consideration liability remains outstanding at FY25-end | FY2025 Annual Report, p.49, 141; Note 18(ii) |
| FPSO acquisition (Baúna Cidade de Itajaí) | FY2025 | −$115.0m cash | Genuine one-off strategic buyout of a previously-leased asset | FY2025 Annual Report, p.49; Note 12 |
| Unsuccessful exploratory well (Who Dat West) | FY2025 / FY2024 | $10.9m / $12.0m (NPAT basis) | **Recurring "one-off"** — see Section 4 flag | FY2025 Annual Report, p.48; Note 5415 |
| E&E asset impairment | FY2024 | $15.1m | Genuine one-off in that year, but a normal exploration-portfolio outcome | FY2025 Annual Report, Note 8 reconciliation, p.94 (comparative column) |
| Advisory & transaction costs | FY2024 | $3.8m | Genuine one-off, tied to a specific transaction | FY2025 Annual Report, p.48 |

## 6. Accrual Quality Flags

| Flag | Triggered (Y/N) | Evidence |
|---|---|---|
| Revenue growing faster than CFO for 2+ years | **N — not applicable in the direction tested.** Revenue was falling (−19.0% FY25 vs FY24) and CFO fell faster (−42.1%), which is a cash-conversion deceleration already captured in Section 2, not the "revenue outpacing cash" accrual pattern this row tests for. The FYE change leaves only one clean YoY comparison in this pool, so "2+ years" cannot be tested either way. | `01_historical-financials.md` §1; this report's Section 1 |
| Receivables growing faster than revenue | N — receivables FELL 20.9% (61.8→48.9) against a 19.0% revenue fall; roughly in line, slightly favourable | FY2025 Annual Report, p.78-79 |
| Inventory growing faster than COGS | **Y — inventory rose 126.8% (14.9→33.8) while COGS fell 2.5% (397.4→387.3)** | FY2025 Annual Report, p.78-79, Note 10 |
| Deferred revenue declining (if subscription/contract business) | Not applicable — Karoon is an upstream commodity producer with no subscription or contract-liability revenue model; there is no deferred-revenue balance to test | Business model confirmed in `business-model/03_segment-map.md` and `06_value-chain.md` |
| Capitalized costs growing as % of revenue | N — exploration & evaluation expenditure capitalised FELL as a share of revenue, from 13.6% of revenue (FY2024: $106.0m / $776.5m) to 3.8% (FY2025: $24.0m / $628.6m). Total capitalised oil-and-gas investment did rise sharply as a % of revenue (14.7%→41.4%), but that rise is fully attributable to the itemised one-off FPSO buyout and contingent-consideration settlement (Section 1/5), not stealth capitalisation of ordinary costs | FY2025 Annual Report, p.48, 81 |
| Frequent accounting policy changes | N — no evidence found of accounting-policy changes beyond the already-disclosed fiscal-year-end change (a one-time structural event, not a pattern) | FY2025 Annual Report, accounting policies notes throughout |

**Only 1 of 6 rows triggers Y** (inventory vs COGS). This is below the module's 2-row threshold, so **`RF-EQ-001 (rising accruals divergent from cash earnings)` is NOT emitted** — accrual quality is not a compounding, multi-signal concern based on available data, though the inventory build (Section 3) should still be monitored into the next print given it meets the mechanical DIO threshold on its own.

## 7. Reported vs Adjusted Reconciliation

| Metric | Reported | Adjusted | Difference | % of Reported | Recurring? | Evidence |
|---|---:|---:|---:|---:|---|---|
| EBITDA (FY2025, company "EBITDA" vs Underlying EBITDAX — different measures, not directly comparable) | $380.7m | $388.8m (Underlying EBITDAX) | +$8.1m | +2.1% | Mixed — EBITDAX adds back exploration expense (structurally recurring add-back); "Underlying" further strips the one-off items in Section 4/5 | FY2025 Annual Report, p.48 |
| EBIT | Not disclosed by the company as a line item; this module's Section 1 does not construct one | — | — | — | — | FY2025 Annual Report, Consolidated Statement of Profit or Loss, p.78 |
| Net income (NPAT) | $125.5m | $107.5m (Underlying NPAT) | −$18.0m | −14.3% | Mixed — see Section 4 pattern flag; the net adjustment direction reverses year to year (FY2024 Underlying NPAT was $214.0m, +$86.5m ABOVE statutory) | FY2025 Annual Report, p.48 |
| EPS (diluted) | $0.1678 | ~$0.1437 (derived — "Inference, not from filings": the company does not disclose an underlying diluted EPS figure; this is $107.5m ÷ 748.06m weighted-average diluted shares) | −$0.024 | −14.3% | Same as Net income row | `01_historical-financials.md` §4; FY2025 Annual Report, p.78, 48 |

The FY2024 comparison year runs the opposite direction (Underlying NPAT $214.0m vs statutory $127.5m, i.e. one-off items DEPRESSED the reported FY2024 result relative to underlying) — flagged in `01_historical-financials.md` §4 and repeated here because it means "Underlying" is not a one-directional flattering adjustment; it has cut both ways across the two years this pool can itemise.

## 8. Accounting Trap Checklist

*Severity column is INVERTED — higher = WORSE (CLAUDE.md §12).*

| Trap | Triggered? (Y/N) | Evidence | Severity /100 *(higher = WORSE — inverted)* |
|---|---|---|---:|
| Stock-based compensation excluded from adjusted earnings | N | SBC ($2.8m FY25/$2.4m FY24) is not listed among the Underlying NPAT/EBITDAX reconciling items [p.48] | 5 |
| Restructuring costs recur every year | Y (in substance) | A different "non-recurring" corporate/transition/advisory cost line appears in every disclosed year (Section 4 pattern flag) | 45 |
| Capitalized costs rising faster than revenue | N | E&E capitalised fell as % of revenue FY24→FY25 (Section 6) | 10 |
| Receivable factoring / supplier finance disclosed | N | No factoring, reverse-factoring, or supply-chain-finance disclosure found anywhere in the annual report | 5 |
| Inventory write-downs or reserve releases | N | Inventory measured at lower of cost/NRV [Note 10, p.96]; no write-down disclosed this year; the FY2025 inventory build (Section 3) is a volume/timing effect, not a valuation write-down | 15 |
| Revenue recognized before cash collection risk is clear | N | Receivables on standard 30–45 day terms [Note 9, p.96]; single contracted marketing counterparty (Shell) | 10 |
| Change in useful life / depreciation assumption | N — no evidence found of a DD&A useful-life or method change; units-of-production method applied consistently, tied to disclosed reserves estimates | FY2025 Annual Report, p.98 (accounting policy) | 10 |
| Tax rate unusually low or boosted by one-off | **Y** | Effective tax rate collapsed from **46.7% (FY2024: $111.8m tax / $239.3m PBT) to 12.4% (FY2025: $17.7m tax / $143.2m PBT)** — a prima-facie 34% Brazilian statutory rate reconciled down mainly by a **−$26.4m non-cash FX translation adjustment** (vs +$60.9m the prior year, an over $87m two-year swing on the same line) [Note 5(a), p.90] | **75** |
| Large fair-value / mark-to-market gains | **Y** | $21.2m FV gain on contingent consideration (FY2025) and $35.3m gain on FPSO right-of-use-asset disposal (FY2025) both flow through statutory P&L; both are well disclosed and itemised out of Underlying results, but both are large and non-operating | **50** |

## 9. Earnings Quality Score

**Score: 68/100 — Strong (61–80 band): mostly clean but with some working-capital and adjustment noise.**

The single most important reason for this score: **cash generation is fundamentally real and well-disclosed** — CFO/EBITDA has been above 65% in every one of the last four years and above 90% in two of them, the company reconciles NPAT to CFO and EBITDA to Underlying results in granular, itemised detail (an unusually transparent filer for this sector), and the negative reported FY2025 FCF is fully explained by an itemised, one-off strategic buyout (normalised operating FCF was +$165.5m). What keeps the score out of the 81–100 band is a genuine, evidence-based pattern rather than any single critical flaw: the effective tax rate swung by roughly 34 percentage points between FY2024 and FY2025 on a large non-cash FX item, "non-recurring" cost items have appeared in literally every disclosed year (just different ones each time, Section 4), unsuccessful-well write-offs recur annually while being labelled non-recurring, and the FY2025 inventory build meets the mechanical DIO red-flag threshold even though it is explained as cargo-timing.

## 10. The Single Biggest Quality Concern

The single biggest risk that reported earnings could overstate the durability of the underlying economics is **tax-expense and "Underlying"-earnings volatility, not cash generation**: Karoon's effective tax rate moved from 46.7% to 12.4% year-on-year almost entirely on a non-cash, Brazilian-real-denominated deferred-tax FX translation swing of over $87m across just two years [Note 5(a), p.90], and the company's own "Underlying NPAT" — the number management and sell-side analysts anchor to — has excluded a different basket of "non-recurring" items in every year this pool can itemise, including a genuinely recurring exploration cost (unsuccessful wells, $10.9m–$12.0m a year) mislabelled as one-off. None of this means the cash is fictitious: CFO has tracked EBITDA closely in most years, and the negative headline FY2025 FCF is a real, itemised, one-off capital deployment (the FPSO buyout and a legacy liability settlement) rather than a sign of deteriorating operations. The risk is narrower than a solvency or fraud concern — it is that both the statutory tax line and the "Underlying" earnings measure are noisier, and less comparable period-to-period, than a reader taking either number at face value would assume.
