# Historical Financials — NVT

**Company:** nVent Electric plc (NYSE: NVT). **Jurisdiction/regime:** US SEC domestic filer (Irish-incorporated). **Reporting standard:** US GAAP. **Currency: USD, in millions except per-share.** **Fiscal year ends 31 December.** [Triage §0]

**Evidence binding:** frozen generation `6db32848…1aecd1e6`. Live `data/NVT/` was not read; `data/NVT/…` is a citation label only.

### Definitions used in this report (CLAUDE.md §15)

- **EBITDA** = operating income + depreciation and amortisation, continuing operations. Plain meaning: operating profit before the non-cash charges for wearing out assets and writing down acquired intangibles. nVent does **not** report a GAAP EBITDA; this row is computed by this agent from company-sourced components, and the company's own *adjusted* EBITDA is shown separately in §4.
- **EBIT** = operating income as reported on the face of the income statement, continuing operations. Plain meaning: profit from running the business, before interest and tax.
- **EPS (diluted)** = diluted earnings per ordinary share. Two series are shown: **total** (includes the divested Thermal Management business reported in discontinued operations) and **continuing operations only**. They are not interchangeable.
- **FCF** = CFO − total capex (§15 default). The company defines free cash flow differently — operating cash flow of continuing operations − capex **+ proceeds from sale of property and equipment** [15] — so both are shown and labelled where they differ.
- **Net debt (strict, §15)** = total debt − cash and cash equivalents. "Total debt" here is the figure from the company's **own debt note**, which lists only the revolving facility, term loans and senior notes (net of issuance costs) — **no lease liabilities** [5][12]. See the net-debt basis note under §1.
- **Working capital** = total current assets − total current liabilities, as reported.
- **Basis points (bps)** = hundredths of a percentage point; 100bps = 1.0 percentage point.

### Two basis breaks that govern every table below — read first

1. **Thermal Management was divested.** nVent agreed to sell Thermal Management on 31-Jul-2024 and closed on 30-Jan-2025 for $1.65bn of cash proceeds. Its results are shown as **discontinued operations for all periods presented in the FY24 10-K, i.e. FY2022–FY2024** [4]. The FY2021 column was **never restated** in this pool: Capital IQ's FY2021 revenue of $2,462.0m still includes Thermal Management, whereas FY2022 onwards do not [17]. **FY2021 is therefore not comparable to FY2022+, and the FY2022 revenue "decline" of −6.8% is an artefact of that basis change, not a real fall.** It is marked "NM" (not meaningful) throughout.
2. **There is no FY2025 Form 10-K in the pool.** FY2025 full-year income-statement and cash-flow figures are cited to the **Capital IQ export (tier-5 vendor data, as of ~12-Aug-2026)** [17][19], never under a filing's name — except FY2025 operating income, net income, revenue and EPS, which the **company's own Q1 FY26 earnings presentation** restates quarter by quarter [13] and which is the better source (§4). The 31-Dec-2025 **balance sheet and debt note are filing-grade**, as the comparative column in the two 10-Qs [10][12].

---

## 1. Annual Financial Table (5 years) — USD millions, US GAAP

| Metric | FY2021 | FY2022 | FY2023 | FY2024 | FY2025 | Trend |
|---|---:|---:|---:|---:|---:|---|
| Revenue | 2,462.0 ᵃ | 2,295.1 | 2,668.9 | 3,006.1 | 3,893.1 ᵛ | Accelerating |
| Revenue YoY % | n/a | NM ᵃ | +16.3% | +12.6% | +29.5% | Accelerating |
| Gross Profit | 941.9 ᵃ | 822.9 | 1,075.2 | 1,209.1 | 1,469.1 ᵛ | Accelerating |
| Gross Margin % | 38.3% ᵃ | 35.9% | 40.3% | 40.2% | 37.7% ᵛ | Volatile |
| — GM change (bps) | n/a | NM ᵃ | +443 | −6 | −249 | Volatile |
| EBITDA (op. income + D&A) | 484.6 ᵃᵛ | 395.4 | 575.9 | 673.1 | 824.6 | Accelerating |
| EBITDA Margin % | 19.7% ᵃ | 17.2% | 21.6% | 22.4% | 21.2% | Volatile |
| — EBITDA margin change (bps) | n/a | NM ᵃ | +435 | +81 | −121 | Volatile |
| EBIT (operating income, reported) | 376.2 ᵃᵛ | 309.0 | 462.7 | 527.1 | 616.8 | Accelerating |
| EBIT Margin % | 15.3% ᵃ | 13.5% | 17.3% | 17.5% | 15.8% | Volatile |
| — EBIT margin change (bps) | n/a | NM ᵃ | +387 | +20 | −169 | Volatile |
| EPS (diluted, **total** incl. disc. ops) | 1.61 ᵃᵛ | 2.38 | 3.37 | 1.97 | 4.31 ᵛ | Volatile |
| EPS (diluted, **continuing ops only**) | n/a | 1.74 | 2.73 | 1.43 | 2.60 | Volatile |
| CFO (continuing operations) | 373.3 ᵃᵛ | 273.3 | 422.2 | 501.0 | 649.0 ᵛᵈ | Accelerating |
| Capex (continuing operations) | 39.5 ᵃᵛ | 40.5 | 65.6 | 74.0 | 93.3 ᵛ | Accelerating |
| FCF (CFO − capex) | 333.8 ᵃ | 232.8 | 356.6 | 427.0 | 555.7 | Accelerating |
| Working Capital (CA − CL, reported) | 275.2 ᵃᵛ | 579.7 ᵛ | 602.5 ᵛʰ | 587.7 ᵛʰ | 636.1 ᵛ | Stable |
| **Net Debt — strict basis** | 949.7 ᵛᵖ | 785.7 ᵛᵖ | 1,601.1 | 2,023.8 | 1,322.3 | Volatile |
| **Net Debt / EBITDA — strict basis** | 1.96x ᵃᵛᵖ | 1.99x ᵛᵖ | 2.78x | 3.01x | 1.60x | Volatile |

**Footnote keys.** ᵃ = FY2021 is on the pre-divestiture basis (includes Thermal Management) and is **not comparable** to FY2022+ — see basis break 1. ᵛ = Capital IQ export, tier-5 vendor data, as of ~12-Aug-2026 (no FY2025 10-K exists in this pool). ᵈ = FY2025 CFO derived: reported total CFO $465.2m **plus** the $183.8m operating cash *outflow* of discontinued operations that Capital IQ itemises inside it = **$649.0m** continuing-operations CFO [19]. The $183.8m outflow is consistent with cash taxes paid rising to $283.3m in FY2025 on the Thermal Management disposal gain [19]. ʰ = FY2023/FY2024 working capital includes assets and liabilities held for sale (current assets held for sale $253.6m / $300.8m; current liabilities held for sale $114.7m / $122.5m) [2]; excluding them, working capital was **$463.6m (FY2023)** and **$409.4m (FY2024)**, so the "Stable" trend is on the reported basis and the underlying ex-held-for-sale build in FY2025 is larger than the reported row suggests. ᵖ = FY2021/FY2022 total debt is built from Capital IQ's own balance-sheet split (long-term debt + current maturities, with lease liabilities listed on separate lines) — **composition inferred from the vendor line split, not confirmed against a filing debt note**, because no FY2021/FY2022 10-K is in this pool.

### Net-debt basis note (CLAUDE.md §15, WORKFLOW step 7) — required reading for every Net Debt figure in this report

- **FY2023, FY2024, FY2025 and 30-Jun-2026 net debt is "strict" without qualification.** For those four dates the total-debt figure comes from the company's **own debt note**, which itemises only the revolving credit facility, term loans and senior notes net of unamortised issuance costs — **it contains no lease liabilities** [5][12]. FY2023 $1,780.7m and FY2024 $2,155.0m [5]; FY2025 $1,559.8m and 30-Jun-2026 $1,492.4m [12]. Composition is therefore confirmed clean of operating leases, and the label is used unqualified.
- **FY2021 and FY2022 net debt is "strict basis (vendor total-debt figure; composition unconfirmed against the filing debt note)."** No FY2021/FY2022 filing debt note is in this pool.
- **This report's net debt deliberately differs from the Capital IQ "Net Debt" field, and the gap is fully explained.** `ciq_facts.json` reports net debt of **$1,376.9m** at 30-Jun-2026 on total debt of $1,632.9m. That vendor total-debt figure **folds in lease liabilities**: $1,492.4m debt-note total + $33.0m current lease liabilities + $107.5m long-term lease liabilities = **$1,632.9m exactly** [18]. Net of $256.0m cash: $1,376.9m — reconciled to the cent. This is a definitional difference, not a misread of the workbook: this report keeps the strict, lease-free basis the doctrine defaults to, and the vendor's $1,376.9m is the same balance sheet with leases added to debt.
- **Downstream note:** net debt here is a supporting line for the trend and TTM tables. The `balance-sheet-survival` module builds the canonical, filing-verified net-debt figure directly from the debt note; the two are not guaranteed to match, and this module's figure must never be quoted as if it carried that module's verification.

### Reconciliation: why this table's EBIT differs from the Capital IQ EBIT series (§5 — adjudicating the number that disagrees)

Capital IQ's Income Statement reports EBIT of 376.2 / 370.9 / 448.3 / 529.6 / 632.7 for FY2021–FY2025, against the reported operating income of 376.2 / 309.0 / 462.7 / 527.1 / 616.8 used above [17][1][13]. The whole difference is two reclassifications, and each ties exactly:

- Capital IQ moves **restructuring charges out of SG&A**: FY2022 $3.4m, FY2023 $3.9m, FY2024 $7.0m.
- Capital IQ moves **non-operating pension income/expense into SG&A**: FY2022 −$58.5m (income), FY2023 +$18.3m (expense), FY2024 +$4.5m.
- Check FY2022: reported SG&A $468.3m − $58.5m − $3.4m = **$406.4m** = Capital IQ SG&A [1][17]. Check FY2023: $557.3m + $18.3m − $3.9m = **$571.7m** [1][17]. Both tie.

**Why this matters and is not cosmetic.** The reported FY2022 EBIT margin of 13.5% is depressed by roughly 250bps purely because a $58.5m pension *income* item sits below operating income in the filing but inside Capital IQ's operating line. A reader using Capital IQ's series sees FY2022→FY2023 EBIT margin move from 16.2% to 16.8% (+63bps); the filing basis shows 13.5% → 17.3% (+387bps). **The FY2023 margin step-up is real but is materially smaller than the filing-basis row alone implies.** Downstream agents must not read the +387bps as an operating inflection without netting out this classification effect.

---

## 2. TTM Snapshot — twelve months ended 30-Jun-2026 vs twelve months ended 30-Jun-2025

Built from actual reported quarters (Q3 FY25 + Q4 FY25 + Q1 FY26 + Q2 FY26 vs Q3 FY24 + Q4 FY24 + Q1 FY25 + Q2 FY25), not estimated.

| Metric | Latest TTM (to 30-Jun-26) | Prior TTM (to 30-Jun-25) | Change | Evidence |
|---|---:|---:|---:|---|
| Revenue | 4,834.0 | 3,306.6 | +46.2% | Quarterly actuals [20]; latest TTM ties exactly to Capital IQ LTM revenue of 4,834.0 [17] and to FY2025 3,893.1 − H1'25 1,772.4 + H1'26 2,713.3 [9][13] |
| Adjusted EBITDA (company non-GAAP) | 1,061.5 | 739.9 | +43.5% | Sum of quarterly adjusted EBITDA [13][20]; FY2025 quarters 176.0 / 214.4 / 230.1 / 226.0 confirmed against the company's own reconciliation [13] |
| — Adjusted EBITDA margin | 21.96% | 22.38% | −42bps | Computed |
| Adjusted operating income (company non-GAAP) | 994.8 | 688.9 | +44.4% | [13][20]; Q2 FY26 $323m confirmed in prepared remarks [16] |
| EPS diluted — **total, GAAP** | 3.66 | 3.51 | +4.3% | [20][6][9]; ties to Capital IQ LTM diluted EPS 3.65 (rounding) [17]. **Distorted**: the prior TTM contains Q1 FY25 GAAP EPS of $2.16, of which $1.64 was discontinued operations (the Thermal Management disposal gain) [6] |
| EPS diluted — **adjusted, continuing ops** | 4.35 | 2.75 | +58.2% | [13][20]; Q2 FY26 $1.45 confirmed in prepared remarks [16] |
| CFO (continuing operations) | 772.8 | Not derivable | n/a | FY2025 continuing CFO 649.0 [19] − H1'25 154.9 [11] + H1'26 278.7 [11]. Prior TTM needs H1 FY24 cash flow; the Q2 FY25 10-Q is **not in this pool** |
| Capex | 112.9 | Not derivable | n/a | FY2025 93.3 [19] − H1'25 38.0 + H1'26 57.6 [11]. **Cross-check: ties exactly to Capital IQ LTM capex of 112.9** [19] |
| FCF (CFO − capex, §15) | 659.9 | Not derivable | n/a | 772.8 − 112.9. Cash conversion 62.2% of adjusted EBITDA |
| **Net debt at 30-Jun-2026 (point-in-time)** | **1,236.4 — strict basis** | 1,322.3 at 31-Dec-2025 — strict basis | −85.9 | Total debt 1,492.4 [12] − cash 256.0 [10]. Composition confirmed clean of operating leases against the filing debt note [12] |
| **Net debt / TTM adjusted EBITDA** | **1.16x — strict basis** | — | — | 1,236.4 ÷ 1,061.5. On Capital IQ's LTM EBITDA of 1,074.6 the same strict net debt gives **1.15x** [21] |

**Note:** Net debt is a point-in-time balance-sheet metric, not a TTM flow metric. The "Prior TTM" cell for net debt is the 31-Dec-2025 balance, labelled as such, because a 30-Jun-2025 balance sheet is not in this pool.

**Reconciliation to `ciq_facts.json` (required):** the sidecar reports net debt $1,376.9m and net debt / LTM EBITDA **1.28x**. This report's 1.16x is the same balance sheet on the strict, lease-free debt basis and against the company's own adjusted EBITDA. Both differences are itemised: $140.5m of lease liabilities on the debt side (see §1 basis note) and $13.1m between the company's adjusted EBITDA ($1,061.5m) and Capital IQ's LTM EBITDA ($1,074.6m). No figure is overridden; the vendor read is accepted as an accurate read of the workbook.

**Company-defined FCF differs.** nVent's own free-cash-flow measure adds back proceeds from the sale of property and equipment [15]. For H1 FY26 the two coincide ($278.7m − $57.6m = $221.1m, with nil property proceeds) [11]; for H1 FY25 the company measure is $1.6m higher. The difference is immaterial at these levels but is stated so the two are never mixed.

---

## 3. Latest Quarterly Trend Table (8 quarters) — USD millions

| Metric | Q3 FY24 | Q4 FY24 | Q1 FY25 | Q2 FY25 | Q3 FY25 | Q4 FY25 | Q1 FY26 | Q2 FY26 | QoQ Trend | YoY vs Same Q |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|---|
| Revenue | 782.0 | 752.2 | 809.3 | 963.1 | 1,054.0 | 1,066.7 | 1,242.0 | 1,471.3 | Accelerating (+18.5% QoQ in Q2 FY26) | Accelerating: +34.8%, +41.8%, +53.5%, **+52.8%** |
| Gross Margin % | N/A | N/A | 38.8% | 38.6% | N/A | N/A | 35.9% | 37.9% | Volatile | Decelerating: Q2 FY26 37.9% vs Q2 FY25 38.6%, **−70bps** |
| Adjusted EBITDA (company non-GAAP) | 177.7 | 171.8 | 176.0 | 214.4 | 230.1 | 226.0 | 267.3 | 338.1 | Accelerating | Accelerating: +29.6%, +31.6%, +51.9%, **+57.7%** |
| Adjusted EBITDA Margin % | 22.7% | 22.8% | 21.8% | 22.3% | 21.8% | 21.2% | 21.5% | 23.0% | Inflecting (up 146bps QoQ in Q2 FY26) | Inflecting: −89bps, −165bps, −23bps, **+72bps** |
| EPS diluted — total, GAAP | 0.62 | 0.06 | **2.16** ᵍ | 0.67 | 0.74 | 0.73 | 0.87 | 1.32 | Accelerating | Accelerating (ex-gain): +19.4%, n/m ᵍ, +31.8%, **+97.0%** |
| EPS diluted — adjusted, continuing | 0.63 | 0.59 | 0.67 | 0.86 | 0.91 | 0.90 | 1.09 | 1.45 | Accelerating | Accelerating: +44.4%, +52.5%, +62.7%, **+68.6%** |

ᵍ Q1 FY25 GAAP diluted EPS of $2.16 includes **$1.64 from discontinued operations** — the gain on the Thermal Management disposal that closed 30-Jan-2025 [6]. Continuing-operations diluted EPS that quarter was **$0.52** [13]. Any YoY comparison against Q1 FY25 on the total GAAP line is meaningless; the adjusted continuing-operations line is the comparable series.

**Basis check on the two FY2024 quarters (done, and it passes).** Q3 FY24 $782.0m + Q4 FY24 $752.2m = $1,534.2m; FY2024 continuing-operations revenue was $3,006.1m [1], implying H1 FY24 continuing revenue of $1,471.9m. That leaves $283.0m of Thermal Management revenue in H1 FY24 against a full-year Thermal figure of $622.7m [4] — i.e. Thermal's H2 sales are absent from the Q3/Q4 FY24 columns, which is exactly what a continuing-operations presentation should show. **Q3 FY24 and Q4 FY24 are therefore on the same continuing-operations basis as every later quarter and the table is basis-consistent.** (The Q1 FY24 and Q2 FY24 columns in the same vendor export — $874.6m and $880.3m — are **not**; they are as-then-reported and include Thermal Management, so they are deliberately excluded from this table.)

**FY2025 quarters tie exactly to the full year:** 809.3 + 963.1 + 1,054.0 + 1,066.7 = **3,893.1** = FY2025 revenue [13][17].

**Gross margin is only available for four of the eight quarters.** Q1/Q2 FY25 and Q1/Q2 FY26 come from the two 10-Qs [6][9]. Q3 FY24, Q4 FY24, Q3 FY25 and Q4 FY25 gross profit is not disclosed anywhere in this pool — the Q1 FY26 deck's quarterly reconciliation starts at operating income [13], and no Q3/Q4 filing is present. Marked **N/A**, not estimated.

**Adjusted EBITDA is the company's own non-GAAP measure, and it is not the same as the GAAP-derived EBITDA in §1.** For Q1 FY26 the company reports adjusted EBITDA of $265.3m [14] against a GAAP-derived figure (operating income $195.7m + D&A $57.9m) of **$253.6m** [6] — an $11.7m gap from restructuring and acquisition costs. For Q2 FY26 the GAAP-derived figure is $359.2m (operating income $300.7m + D&A $58.5m) [9][11] against the vendor's adjusted $338.1m [20]; the two definitions treat intangible amortisation and one-off costs differently and must not be compared with each other. The row above is one consistent basis (company adjusted) across all eight quarters. FY2025's four quarters are confirmed against the company's own reconciliation [13]; Q3/Q4 FY24 and Q2 FY26 are vendor-sourced on that same stated basis [20], with Q2 FY26 adjusted operating income of $323m independently confirmed in the earnings call [16].

---

## 4. Reported vs Adjusted Metrics

The company **does** disclose adjusted metrics and gives a line-by-line reconciliation. Its definition: adjusted operating income excludes intangible amortisation, acquisition-related expenses, restructuring costs, impairments and other unusual non-operating items; adjusted EBITDA = adjusted operating income + depreciation; return on sales (ROS) = adjusted operating income ÷ net sales [13].

**FY2025 (full year, USD m):**

| Metric | Reported Value | Adjusted Value | Adjustment Amount | Adjustment Reason | Evidence |
|---|---:|---:|---:|---|---|
| Operating income | 616.8 | 785.8 | +169.0 | Intangible amortisation 147.1; acquisition transaction & integration 14.4; restructuring & other 7.5 | [13] |
| EBITDA | 824.6 (= 616.8 + D&A 207.8) | 846.5 | +21.9 | Acquisition costs 14.4 + restructuring 7.5. Intangible amortisation is *not* an add-back here because it is already outside adjusted operating income | [13][19] |
| EPS (diluted, continuing) | 2.60 | 3.35 | +0.75 | Operating adjustments +169.0, pension mark-to-market gain −12.9, tax on adjustments −33.8 | [13] |
| ROS | 15.8% | 20.2% | +438bps | Same adjustments as operating income | [13] |

**Q1 FY26 and Q2 FY26 (USD m):**

| Metric | Q1 FY26 Reported | Q1 FY26 Adjusted | Q2 FY26 Reported | Q2 FY26 Adjusted | Adjustment Reason | Evidence |
|---|---:|---:|---:|---:|---|---|
| Operating income | 195.7 | 248.5 | 300.7 | 322.7 (company: "$323 million") | Q1: intangible amortisation 41.1, restructuring & other 8.9, acquisition costs 2.8 (= +52.8) | [6][14][9][16] |
| EBITDA | 253.6 | 265.3 | 359.2 | 338.1 ᵛ | Definitions differ — see §3 note | [6][14][9][11][20] |
| EPS (diluted, continuing) | 0.86 | 1.09 | 1.32 | 1.45 | Operating adjustments net of tax | [6][14][9][16] |
| ROS | 15.8% | 20.0% | 20.4% | 21.9% | Same adjustments | [6][14][9][16] |

ᵛ Q2 FY26 adjusted EBITDA is vendor-sourced [20]; the company's Q2 reconciliation slide is not in this pool (no Q2 FY26 earnings deck exists here — the latest deck is Q1 FY26).

**The size of the adjustment is itself the finding.** In FY2025 adjusted diluted EPS of $3.35 is **29% above** reported continuing-operations EPS of $2.60, and $147.1m of the $169.0m operating add-back — 87% of it — is **intangible amortisation from acquisitions** [13]. That is a recurring, acquisition-driven charge, not a one-off. Reported and adjusted are labelled separately everywhere in this report and are never mixed. Assessing whether the adjustments are legitimate is the `earnings-quality` agent's job, not this one's.

---

## 5. Quarterly Seasonality Table (last 3 fiscal years)

*Insufficient quarterly history for seasonality analysis.*

The pool does not contain three complete fiscal years of quarterly revenue on a consistent continuing-operations basis. FY2025 is complete and ties exactly to the full year (four quarters summing to $3,893.1m) [13]. FY2026 has only two reported quarters. FY2024 has only its **second half** on the continuing-operations basis — the Q1 FY24 and Q2 FY24 vendor columns still include Thermal Management (see §3 basis check), and no restated FY2024 quarterly split exists in this pool. Building a four-quarter FY2024 share row would require estimating the Thermal split, which the seasonality rule forbids.

**What the actual data does support, at half-year granularity:**

| Period | H1 revenue share | H2 revenue share | Evidence |
|---|---:|---:|---|
| FY2024 (continuing ops) | 49.0% ($1,471.9m, derived) | 51.0% ($1,534.2m) | FY2024 total $3,006.1m [1] less Q3 $782.0m and Q4 $752.2m [20] |
| FY2025 | 45.5% ($1,772.4m) | 54.5% ($2,120.7m) | [9][13] |

| FY2025 quarter | Revenue | Share of FY2025 | Adjusted EBITDA margin |
|---|---:|---:|---:|
| Q1 FY25 | 809.3 | 20.8% | 21.8% |
| Q2 FY25 | 963.1 | 24.7% | 22.3% |
| Q3 FY25 | 1,054.0 | 27.1% | 21.8% |
| Q4 FY25 | 1,066.7 | 27.4% | 21.2% |

**No quarter crosses the >30% or <20% flag** on the one complete year available. On this single year the shape is a mild H2 weighting (54.5% of revenue), but **one year is not a seasonality pattern**, and the FY2025 H2 skew is confounded by the Electrical Products Group acquisition landing mid-year — acquisitions contributed 17.0 percentage points of the 53.5% Q1 FY26 revenue growth [13], so part of the apparent H2 lift is acquired volume arriving, not a seasonal rhythm. Treat seasonality as **Not proven from available data** and do not let any downstream agent build a quarterly phasing assumption on it.

---

## 6. Key Trend Summary

**Revenue growth is Accelerating, and sharply.** Continuing-operations revenue rose +16.3% in FY2023, +12.6% in FY2024, +29.5% in FY2025, and the trailing twelve months to 30-Jun-2026 is running **+46.2%** at $4,834.0m against $3,306.6m a year earlier [1][17][20]. Quarterly YoY growth has climbed through +34.8%, +41.8%, +53.5% and +52.8% over the last four quarters. **This is not all organic**: the company's own reconciliation splits Q1 FY26's 53.5% into 34.4pp organic, 2.1pp currency and **17.0pp acquisitions** [13], and the Q2 FY26 10-Q's own comparison of $1,471.3m against $963.1m carries the same acquisition effect. The revenue-drivers agent must decompose this rather than quote the headline.

**Margins are Volatile at the gross line and Inflecting upward at the EBITDA line.** Gross margin has moved 35.9% → 40.3% → 40.2% → 37.7% over FY2022–FY2025, a 249bps fall in the latest full year, and Q2 FY26 gross margin of 37.9% is 70bps below Q2 FY25 [9][17]. But adjusted EBITDA margin went the other way in the most recent quarter: after four quarters of YoY compression (−89bps, −165bps, −23bps) it turned **+72bps YoY and +146bps QoQ in Q2 FY26**, to 23.0% — the highest of the eight quarters shown. **These two series disagree, and the disagreement is the point:** gross margin is still down YoY while operating leverage below the gross line is more than offsetting it. The 10-Q attributes 460bps of the Q2 SG&A ratio improvement to that leverage and flags roughly $25m of tariff reimbursements inside gross profit [9] — a one-off help that the margin-drivers agent must size before treating the Q2 gross margin as run-rate.

**Seasonality: not proven.** Only one complete fiscal year of consistent-basis quarterly revenue exists (FY2025, H2-weighted at 54.5%), and that skew is confounded by a mid-year acquisition. No quarter breaches the >30% / <20% flag.

**Two clear inflection points in the last five years.** First, the **Thermal Management divestiture** (agreed 31-Jul-2024, closed 30-Jan-2025 for $1.65bn) [4] — it re-based every historical line, put $1.64 of one-off gain into Q1 FY25 GAAP EPS, drove a $183.8m operating cash *outflow* in FY2025 discontinued operations (largely disposal taxes), and funded the balance sheet repair. Second, the **acquisition programme**: $1,120.1m spent in FY2023 (ECM Industries), $677.7m in FY2024 (Trachte) and $975.7m in FY2025 (Electrical Products Group) [3][19]. Together these took strict net debt / EBITDA from 1.99x (FY2022) to **3.01x (FY2024)**, then the disposal proceeds and $873.3m of FY2025 debt repayment [19] pulled it back to **1.60x (FY2025)** and **1.16x at 30-Jun-2026** — all on the strict, lease-free basis confirmed against the filing debt note [5][12]. A third event sits outside every number above: the **Maverick Power acquisition announced 24-Aug-2026**, after the Q2 10-Q and after every price and consensus mark in this pool.

**Data limitations carried forward.** No FY2025 Form 10-K (FY2025 income-statement and cash-flow lines are vendor or company-deck sourced, never cited to a filing); no Q3/Q4 FY25 or Q3/Q4 FY24 filings (so four of eight quarterly gross-margin cells are N/A and prior-TTM cash flow is not derivable); FY2021 is on a pre-divestiture basis and is not comparable to later years.

---

## 7. Citations

All documents are in the frozen extract generation `6db32848…1aecd1e6`, cited under the logical label `data/NVT/`.

[1] FY24 10-K (nVent Electric plc, Form 10-K, fiscal year ended 31-Dec-2024), Consolidated Statements of Operations and Comprehensive Income, p.40 — `data/NVT/nVent Electric plc, 2025.pdf`
[2] FY24 10-K, Consolidated Balance Sheets, p.41
[3] FY24 10-K, Consolidated Statements of Cash Flows, p.42
[4] FY24 10-K, Note 6 (Discontinued Operations), p.55–56
[5] FY24 10-K, Note 10 (Debt)
[6] Q1 FY26 10-Q (quarter ended 31-Mar-2026, signed 1-May-2026), Condensed Consolidated Statements of Income and Comprehensive Income, p.3 — `data/NVT/nVent Electric plc, Q1 2026.pdf`
[7] Q1 FY26 10-Q, Condensed Consolidated Balance Sheets and Statements of Cash Flows, p.4–5
[8] Q1 FY26 10-Q, Note 10 (Debt)
[9] Q2 FY26 10-Q (quarter and six months ended 30-Jun-2026), Condensed Consolidated Statements of Income and Comprehensive Income, p.3, and MD&A "Results of Operations" — `data/NVT/nVent Electric plc, Q2 2026.pdf`
[10] Q2 FY26 10-Q, Condensed Consolidated Balance Sheets, p.4
[11] Q2 FY26 10-Q, Condensed Consolidated Statements of Cash Flows, p.5
[12] Q2 FY26 10-Q, Note 10 (Debt)
[13] Q1 FY26 earnings presentation, 1-May-2026, "Reported to Adjusted 2025 Reconciliation", slide 16 — `data/NVT/nVent Electric plc, Q1 2026 ppt.pdf`
[14] Q1 FY26 earnings presentation, 1-May-2026, "Reported to Adjusted 2026 Reconciliation", slide 15
[15] Q1 FY26 earnings presentation, 1-May-2026, "Organic Sales Growth and Free Cash Flow Reconciliation", slide 17
[16] Q2 FY26 earnings call transcript (S&P Global Market Intelligence, verbatim), 31-Jul-2026, prepared remarks — `data/NVT/nVent Electric plc, Q2 2026 Earnings Call, Jul 31, 2026.pdf`
[17] Capital IQ Financials export → Income Statement tab, annual FY2021–FY2025 + LTM 12 months Jun-30-2026; vendor data as of ~12-Aug-2026 — `data/NVT/nVent Electric plc NYSE NVT Financials.xls`
[18] Capital IQ Financials export → Balance Sheet tab, same workbook and as-of date
[19] Capital IQ Financials export → Cash Flow tab, same workbook and as-of date
[20] Capital IQ Estimates export → Surprise tab, quarterly actuals FQ3 2024 – FQ2 2026; vendor data as of ~Aug-2026 — `data/NVT/nVentElectricplcNYSENVTEstimatesReport.xls`
[21] `ciq_facts.json` deterministic facts sidecar, frozen generation `6db32848…1aecd1e6` (net debt $1,376.9m, total debt $1,632.9m, LTM EBITDA $1,074.6m, net debt/EBITDA 1.28x — all on Capital IQ's lease-inclusive vendor basis; reconciled in §1 and §2)

---

### Calculation provenance (fix F09)

Every growth rate, margin, basis-point delta, TTM aggregate, FCF figure and leverage ratio in this report was produced by an executed Python snippet, not mental arithmetic. Two spot-checks reproduced here:

- **FY2025 revenue YoY:** `(3893.1 − 3006.1) / 3006.1 × 100 = 29.5%`.
- **Q2 FY26 adjusted EBITDA margin YoY delta:** `(338.1/1471.3 − 214.4/963.1) × 10000 = +72bps` (22.98% vs 22.26%).
- **Independent ties confirming the series are internally consistent:** FY2025 quarterly revenue sums to $3,893.1m exactly (= the full year); TTM revenue of $4,834.0m equals Capital IQ's LTM column exactly; TTM capex of $112.9m built from FY2025 $93.3m − H1'25 $38.0m + H1'26 $57.6m equals Capital IQ's LTM capex exactly; and Capital IQ's net debt of $1,376.9m equals strict debt $1,492.4m + leases $140.5m − cash $256.0m exactly.
