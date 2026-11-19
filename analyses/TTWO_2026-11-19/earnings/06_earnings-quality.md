# Earnings Quality — TTWO

**Company:** Take-Two Interactive Software, Inc. (NasdaqGS:TTWO) · **Regime:** US SEC (10-K / 10-Q / 8-K Ex. 99.1) · **Standard:** US GAAP · **Currency:** USD, millions unless stated · **Fiscal year:** ends 31 March (FY2026 = year ended 2026-03-31; FY2027 in progress).

**Evidence binding.** Frozen supervisor-verified read mode. Every manifest / corpus / CIQ-facts / extract read resolved inside the single bound generation `.extract-generations/0af638492ecb0521db2676c79d75e6940c7227bb9f192567527b8a57eb43203d/`. The live logical path `data/TTWO/` was not read; it is a citation label only. `Alphabet Inc NasdaqGS GOOGL Key Developments.xls` is a wrong-company pool contaminant and is cited nowhere below.

**Definitions used throughout (§15).**

- **FCF = CFO − total capex.** "Total capex" = *Purchases of fixed assets* + *Asset acquisitions*, both from the cash-flow statement. The company discloses **no** FCF definition anywhere in this pool, so the §15 definition is used. The Capital IQ "Levered Free Cash Flow" of $787.6m for the latest twelve months is an **after-interest vendor construction** and is **not** used [10].
- **Net debt = total debt − cash and cash equivalents (strict basis).** Every net-debt figure below carries its basis label inline. The vendor's $1,237.8m at 2026-09-30 is a **broad** basis (it nets short-term investments) **and** its debt input includes lease liabilities [10].
- **EBITDA has three different meanings for this company and they are never mixed below.** (i) **EBITDA (CIQ vendor-computed)** — the vendor's figure, used in the bridge because the company publishes no full-year non-GAAP EBITDA in this pool. Critically, the vendor adds back only depreciation plus amortisation of acquired intangibles and goodwill; it leaves the **amortisation of capitalised software development costs inside cost of revenue**, so this EBITDA is already charged for content amortisation (proof: FY2024 EBIT $(544.8)m + D&A $977.0m = $432.2m) [7]. (ii) **Non-GAAP EBITDA (company-defined)** — GAAP net income excluding tax, interest income/expense, D&A and amortisation of acquired intangibles; it does **not** add back stock-based compensation [5, p.11]. (iii) **EBITDA, management-reporting basis** — (ii) further adjusted for deferred revenue, stock compensation, business acquisition and other; this is the number Capital IQ's "EBITDA" field tracks [5, p.2; 12].
- **Capital IQ "EPS Normalized" and "EBITDA" are management-basis, not GAAP** — carried forward from `04_guidance-consensus`, which reconciled both to the cent on two consecutive quarters [12].

---

## 1. EBITDA → CFO → FCF Bridge (FY2023–FY2026 + latest TTM)

This bridge is built from **the filing's own cash-flow line groupings**, so it foots exactly to reported CFO in every column (verified by executed arithmetic, §9). A generic template bridge would not foot for this company, because Take-Two's dominant operating outflow is **cash spent on software development costs and licenses** ($688.9m in FY2026) which sits *inside* operating cash flow, not in capex [1, p.66].

| Item | FY2023 | FY2024 | FY2025 | FY2026 | TTM to 2026-09-30 | Trend |
|---|---:|---:|---:|---:|---:|---|
| **EBITDA (CIQ vendor-computed)** | 555.5 | 432.2 | 379.5 | 788.5 | **724.9** | Inflecting up from FY2025 trough |
| Memo: GAAP net loss | (1,124.7) | (3,744.2) | (4,478.9) | (298.2) | (240.5) | Improving |
| + Depreciation | 90.3 | 135.5 | 153.9 | 166.4 | 164.0 | Stable |
| + Amortisation & impairment of intangibles | 1,506.7 | 1,418.9 | 922.6 | 725.7 | 697.5 | Falling |
| + Goodwill impairment (non-cash) | — | 2,342.1 | 3,545.2 | — | — | Gone |
| + Amortisation & impairment of software development costs and licenses (non-cash) | 268.3 | 292.7 | 333.8 | 412.8 | 411.9 | Rising |
| + Stock-based compensation (non-cash) | 317.8 | 335.6 | 324.0 | 305.3 | 344.7 | Stable ~$320m/yr |
| + Other non-cash (noncash lease, interest expense add-back, deferred tax, fair-value, other) | (201.5) | 90.4 | 398.0 | 319.5 | 277.7 | Volatile |
| **− Cash spend on software development costs and licenses** | **(492.8)** | **(603.4)** | **(691.6)** | **(688.9)** | **(716.3)** | Rising |
| **Working capital change** (receivables, software-dev **excluded** here, prepaid/other, inventory, deferred revenue, payables/accruals) | **(363.0)** | **(283.7)** | **(552.2)** | **(318.3)** | **(569.9)** | Persistent drag |
| — of which receivables | 106.8 | 83.7 | (105.0) | 35.0 | 384.1 | Large release in TTM |
| — of which prepaid / other current & non-current assets | 77.2 | (154.7) | 11.9 | (66.5) | (266.6) | **Deteriorating sharply** |
| — of which inventory | — | — | — | — | (19.3) | New drag |
| — of which deferred revenue | (141.9) | (11.8) | 6.8 | 78.5 | (225.0) | **Reversed to a drag** |
| — of which payables, accrued expenses and other liabilities | (405.1) | (200.9) | (465.9) | (365.3) | (443.1) | Persistent drag every year |
| **= CFO (reported)** | **1.1** | **(16.1)** | **(45.2)** | **624.3** | **367.1** | Inflecting, then flattening |
| Memo: cash interest paid | 137.0 | 137.0 | 147.1 | 153.0 | n/d | See note |
| Memo: cash income taxes paid | 176.8 | 150.2 | 144.3 | 149.4 | n/d | See note |
| Maintenance capex | not disclosed | not disclosed | not disclosed | not disclosed | not disclosed | — |
| Growth capex | not disclosed | not disclosed | not disclosed | not disclosed | not disclosed | — |
| Total capex (purchases of fixed assets + asset acquisitions) | 204.2 | 169.1 | 189.7 | 190.2 | **304.5** | **+72.1% in TTM** |
| **= FCF (CFO − total capex), reported** | **(203.1)** | **(185.2)** | **(234.9)** | **434.1** | **62.6** | Negative 3 of 5 years |
| **= Normalised operating FCF** (excl. the London building one-off) | (203.1) | (185.2) | (234.9) | 434.1 | **up to 154.4** | Still down ~15% YoY |
| **CFO / EBITDA %** | **0.2%** | **(3.7)%** | **(11.9)%** | **79.2%** | **50.6%** | **Below 50% in 4 of 5 years** |

*Sources: FY2023–FY2025 lines from `FY2025 10-K, Consolidated Statements of Cash Flows, p.68` [2]; FY2026 from `FY2026 10-K, Consolidated Statements of Cash Flows, p.66` [1]; TTM = FY2026 − six months ended 2025-09-30 + six months ended 2026-09-30, both six-month columns from `Q2 FY27 10-Q, Condensed Consolidated Statements of Cash Flows, p.5` [3]; EBITDA from `Capital IQ Financials_Annual, Income Statement tab, EBITDA row` [7], with the LTM $724.9m pinned by the deterministic facts sidecar [10].*

**Capex split: not disclosed.** *"Capex split not disclosed — total capex used. FCF may understate true recurring free cash flow."* Two things make that caveat less generous than it sounds for this company. First, the **largest discretionary spend is not in capex at all**: $716.3m of cash went into software development costs and licenses over the latest twelve months, inside CFO [1, p.66; 3, p.5] — so **FCF of $62.6m is already net of content investment and must never be read as "cash before content spend"**. Second, a usable recurring-capex proxy does exist: FY2024–FY2026 total capex averaged **$183.0m** ((169.1 + 189.7 + 190.2) ÷ 3), against $304.5m in the latest twelve months.

**Lead figure — normalised operating FCF of up to $154.4m, not the reported $62.6m (§15).** On 2026-08-10 Take-Two bought the London building it had previously leased, for a **total capitalised cost of $91.8m**, of which **$82.9m was allocated to land and $8.9m to the building (20-year life)** [3, Note 15 (Asset Acquisition)]. That purchase sits in *Purchases of fixed assets* and is a one-off property transaction, not recurring plant spend. Excluding it, normalised operating FCF for the twelve months to 2026-09-30 is **up to $154.4m** (367.1 − (304.5 − 91.8)) against the **reported $62.6m**. Two honesty qualifications travel with that figure: (a) the filing states the $91.8m capitalised cost "includes cash consideration, direct transaction costs, net of the derecognition of the preexisting lease liability and right-of-use asset" — **the cash element is not separately disclosed**, so $91.8m is a ceiling on the add-back, which is why the normalised figure is stated as "up to"; and (b) **even at the full add-back, normalised FCF of $154.4m is still below the $181.0m of the prior twelve months** [upstream `01_historical-financials.md` §2]. The capex spike explains most of the FCF fall; it does not make the fall disappear.

**Why the memo rows for interest and tax rather than bridge rows.** Take-Two's cash-flow statement adds back the full **interest expense** as a reconciling item ($151.4m in FY2026) and routes the actual cash interest and tax payments through the *accounts payable, accrued expenses and other liabilities* change [1, p.66]. Putting a separate "interest paid" and "tax paid" line into the bridge would therefore double-count them and the bridge would stop footing. They are shown as memo items from the filing's own supplemental disclosure instead. **`n/d` for the TTM** is deliberate: the 10-Q carries no supplemental interest/tax-paid disclosure, and Capital IQ's LTM column simply repeats the FY2026 figures ($153.0m and $149.4m), with the Jun-2026 and Sep-2026 quarters marked `NA` [9] — so no twelve-month figure exists and none is invented. The filing's **interest expense** for the six months to 2026-09-30 was $60.6m [3, p.5].

**FY2022 for context (vendor basis, one column back):** EBITDA $671.0m, CFO $258.0m, total capex $158.6m, FCF $99.4m, **CFO/EBITDA 38.4%** [7][8]. Adding that column does not improve the picture — it makes the sub-50% conversion read five years long rather than four.

---

## 2. Cash Conversion Assessment

CFO has not tracked EBITDA over this cycle. On the vendor EBITDA basis, cash conversion was **38.4% (FY2022), 0.2% (FY2023), −3.7% (FY2024), −11.9% (FY2025), 79.2% (FY2026) and 50.6% in the twelve months to 2026-09-30** — below the 70% healthy mark in five of six periods and below the 50% red-flag line in four of them, with FY2026 the single clean year [1][2][7][10]. Three of the five fiscal years printed **negative** free cash flow (FY2023 $(203.1)m, FY2024 $(185.2)m, FY2025 $(234.9)m), and the FY2026 recovery has already given back most of its ground: CFO over the latest twelve months is roughly flat at $367.1m while total capex rose 72.1% to $304.5m, cutting FCF to $62.6m from $181.0m, and strict-basis net debt rose from **$972.5m (1.23x, strict basis)** at FY2026 year-end to **$1,370.4m (1.89x, strict basis)** at 2026-09-30 [1, Note 11 (Debt); 3, Note 10 (Debt); 9][10]. The trajectory is therefore **not a trend but a swing**: one strong year inside a five-year run of weak conversion, with the latest twelve months back on the 50% line.

The mechanical cause is identifiable and is not fraud. EBITDA on this basis is already charged the **amortisation** of capitalised content ($411.9m in the TTM), while CFO is charged the **cash spend** on content ($716.3m) — a gap of **$304.4m** that is pure growth investment ahead of the Grand Theft Auto VI release, and a gap that ran $310.7m / $357.8m / $276.1m in FY2024 / FY2025 / FY2026 as well [1][2][3]. On top of that sits a payables-and-accruals outflow in **every single year** of the series (−$405.1m, −$200.9m, −$465.9m, −$365.3m, −$443.1m), which is the Zynga-era accrual base unwinding.

RF-EQ-002 (cash-conversion breakdown)

That tag is emitted because CFO/EBITDA was below 50% in **two of the last three fiscal years** (FY2024 −3.7% and FY2025 −11.9%; FY2026 79.2%), and the latest twelve months sit at 50.6%, barely over the line. It is emitted as a source signal for the synthesis layer's cross-module roll-up regardless of whether it alone moves this module's own score band in Section 9.

---

## 3. Working Capital Trends

**Formulas and basis, pinned.** `DSO = 365 × accounts receivable ÷ revenue`; `DIO = 365 × inventory ÷ COGS`; `DPO = 365 × accounts payable ÷ COGS`. DSO uses **revenue**; DIO and DPO use **cost of revenue**, never revenue. **Period-end balances are used consistently**, not averages — because the opening balances for FY2024 (Mar-31-2023, filing basis, receivables net of contract assets) are not in this pool, an average-balance series would silently switch bases mid-table (§15). All balances are the **filing's own** lines; the latest column divides the 2026-09-30 period-end balance by trailing-twelve-month revenue / COGS, matching the annual columns' construction. TTM COGS = $2,846.7m − $1,352.1m + $1,288.0m = **$2,782.6m** [1; 5 "Additional Data"].

| Metric | FY2025 (Mar-31-2025) | FY2026 (Mar-31-2026) | Latest (2026-09-30) | Direction | Risk |
|---|---:|---:|---:|---|---|
| Receivable days (DSO) | 50.0 | 40.4 | **44.5** | Up 4.1 days (+10.1%) vs FY2026 — but **down from 73.4 days a year earlier** (2026-09-30 vs 2025-09-30) | **Low.** The YoY direction is sharply better; the sequential rise is normal pre-launch |
| Inventory days (DIO) | not disclosed | 0.9 | **4.5** | Rising from a near-zero base (inventory $7.3m → $34.1m) | **Low in dollars, notable in direction** — see below |
| Payable days (DPO), accounts payable only | 27.6 | 27.1 | **27.2** | Flat | **Low.** No supplier stretching |
| Payable days (DPO), accounts payable **+ accrued expenses and other current liabilities** (labelled broad basis) | 187.7 | 170.4 | **165.4** | **Falling 22.3 days over 18 months** | **Medium** — the accrual base is shrinking, which is the cash drag in §1 |
| Cash conversion cycle (DSO + DIO − DPO, accounts-payable basis) | 22.3 (DIO not disclosed) | **14.3** | **21.7** | Up 7.4 days | Low |
| Memo: deferred-revenue days (365 × total deferred revenue ÷ revenue) | 71.8 | 65.2 | **59.3** | **Falling three periods running** | **Medium** — see Section 6 |

*Balances: `FY2025 10-K, Consolidated Balance Sheets, p.65` [2]; `FY2026 10-K, Consolidated Balance Sheets, p.63` [1]; `Q2 FY27 10-Q, Condensed Consolidated Balance Sheets, p.2` [3]. The 2025-09-30 receivable balance ($1,249.9m, vendor basis incl. contract assets) comes from `Capital IQ Financials_Quarterly, Balance Sheet tab, FQ2/CQ3 Sep-30-2025` [9] — a tier-5 vendor export, used because no Q2 FY26 10-Q exists in this pool.*

**Flag tests, answered explicitly.**

- **DSO rising >10% YoY?** **No.** DSO fell from roughly 73.4 days at 2025-09-30 to 44.5 days at 2026-09-30 — a 29-day improvement — because the abnormal H1 FY26 receivable build ($393.1m outflow) unwound into a $384.1m receivable release in the latest twelve months [3, p.5; 9]. The +10.1% move against the FY2026 year-end is sequential, not year-on-year, and does not meet the test. **No revenue-recognition concern from receivables.**
- **DIO rising >15% YoY?** **Yes on the percentage, immaterial on the dollars, and explained.** Inventory went from $7.3m to $34.1m (+367%) in six months while six-month cost of revenue *fell* 4.7% ($1,352.1m → $1,288.0m). The composition is the giveaway: **parts and supplies rose from $1.2m to $24.0m** while finished products went $6.2m → $10.1m [3, Note 8 (Inventory)]. That is componentry for physical/collector editions ahead of a launch, in a company whose revenue is **97.9% digital** [3, Disaggregation of Revenue]. It is a real accrual flag by the letter of the test and a $26.8m item in a $6.4bn revenue business. **Not channel stuffing** — there is no receivable build beside it.
- **DPO rising sharply?** **No — the opposite, and that is the finding.** Accounts payable days are flat at ~27. On the broad basis that actually matters here (accrued expenses and other current liabilities are $1,053.1m against accounts payable of only $207.7m), payable days have fallen 22.3 days since FY2025. Inside the accrual, **compensation and benefits fell from $371.5m to $234.8m** in six months — an annual-bonus payout — while **software development royalties accrued rose from $359.3m to $421.4m** [3, Note 9]. There is no liquidity signal from supplier stretching; there is a steady cash cost of paying down an accrual base built during the Zynga era.

---

## 4. Non-GAAP Adjustments

Take-Two's own reconciliations, not reconstructions. Q2 FY27 (three months ended 2026-09-30). The chain is: GAAP net loss $(54.0)m → **non-GAAP EBITDA $92.2m** → **management-reporting EBITDA $277.1m** [5, p.2 and p.11].

| Adjustment | Amount | Recurring? (Y/N) | Concern Level | Evidence |
|---|---:|---|---|---|
| Amortisation of acquired intangibles | +145.1 | **Y** — every quarter; $305.6m in the half, $333.2m in the year-ago half; guided $623m for FY2027 | **Low** | `Q2 FY27 earnings release, p.11 (Reconciliation of GAAP to Non-GAAP Measure)`; `same, Outlook table` |
| Depreciation and amortisation | +48.1 | **Y** | **Low** | `Q2 FY27 earnings release, p.11` |
| Interest expense | +30.2 | **Y** — real cash cost ($60.6m in the half) | **Low** (standard EBITDA exclusion) | `Q2 FY27 earnings release, p.11` |
| Interest income | (19.3) | **Y** | **Low** | `Q2 FY27 earnings release, p.11` |
| Benefit from income taxes | (57.9) | Y as a line, **N as a benefit** | **Mid** — the benefit, not the add-back, is the issue (Section 8) | `Q2 FY27 earnings release, p.11`; `Q2 FY27 10-Q, Note 13 (Income Taxes)` |
| **Stock-based compensation** | **+90.0** | **Y — every single quarter** ($176.0m in the half; $305.3m in FY2026; guided **$462m** for FY2027) | **HIGH** | `Q2 FY27 earnings release, p.2 (management-reporting table: cost of revenue 3.4 + S&M 23.1 + R&D 22.5 + G&A 41.0 = 90.0)`; `FY2026 10-K, p.66`; FY27 guidance derived in `04_guidance-consensus` §2.1 |
| **Net effect from deferred net revenue and related cost of revenue** | **+101.9** | **Y as a line, but sign-flipping** | **HIGH** | `Q2 FY27 earnings release, p.2` (revenue +104.3, cost of revenue +3.3, interest/other +0.9) |
| Business acquisition / acquisition-related expenses | +2.4 | **Y** — present in every quarter shown ($3.8m in the half; $7.5m in the year-ago half) | **Mid** — a "one-off" that never stops | `Q2 FY27 earnings release, p.2` |
| Other | (9.4) | Y | **Low** — reduces adjusted EBITDA | `Q2 FY27 earnings release, p.2` |
| Impact of business reorganisation | — in FY27; **$(0.1)m / $(0.5)m / +$5.0m / $(0.4)m** in FY26 quarters | Was recurring FY2024–FY2026, now absent | **Mid** (see Section 5) | `Q2 FY27 earnings release, p.2 (Six Months Ended September 30, 2025 columns)` |

**The three flag tests.**

1. **Adjustments that recur every period.** Amortisation of acquired intangibles, stock-based compensation, the deferred-revenue effect and acquisition-related expenses all appear in **every** period disclosed. None of them is a one-off. The acquisition-related line is the clearest offender in kind: $3.8m in the half and $7.5m a year earlier, four and a half years after the Zynga deal closed.
2. **Adjustments exceeding 15% of GAAP earnings.** All of them, trivially — GAAP earnings are a loss. The honest sizing is against revenue: the **total** step from GAAP net loss $(54.0)m to management-reporting EBITDA $277.1m is **$331.1m on $1,497.0m of revenue, i.e. 22.1% of the quarter's revenue**.
3. **Stock-based compensation excluded from "adjusted" numbers.** **Yes, and this is the single largest judgment-free distortion in the chain.** $90.0m was added back in Q2 FY27 — **32.5% of the $277.1m management-reporting EBITDA the Street's consensus field actually tracks**. For FY2027 the company's own outlook implies **$462m of stock compensation inside a derived management-basis EBITDA midpoint of $1,565m — 29.5%** [5; 12]. Stock compensation is a real cost of employing people: it diluted the share count from 177.1m shares outstanding at 2025-03-31 to 187.2m at 2026-09-30 [1, p.63; 3, p.2], and it is added back every quarter without exception.

---

## 5. One-Off Items (last three years)

| Item | Period | Amount | Classification | Evidence |
|---|---|---:|---|---|
| Goodwill impairment | FY2024 | 2,342.1 | **Genuine** one-off, non-cash; none in FY2026 | `FY2025 10-K, Consolidated Statements of Operations, p.66` |
| Goodwill impairment | FY2025 | 3,545.2 | **Genuine** one-off, non-cash; the auditor's sole Critical Audit Matter is the goodwill impairment assessment | `FY2026 10-K, p.64`; `FY2026 10-K, Report of Independent Registered Public Accounting Firm — Critical Audit Matter: Goodwill Impairment Assessment` |
| Business reorganisation expense | FY2024 | 104.6 | **Recurring "one-off"** — charged two years running | `FY2026 10-K, p.64` |
| Business reorganisation expense | FY2025 | 106.5 | **Recurring "one-off"** | `FY2026 10-K, p.64` |
| Business reorganisation — net **credit** | FY2026 | **(4.4)** | **Suspicious direction** — a reserve release, not a charge; it *added* $4.4m to FY2026 operating income | `FY2026 10-K, p.64`; `FY2026 10-K, MD&A` ("decreased by $110.9 … primarily") |
| Impairment of software development costs and licenses | FY2024 | 109.9 | **Recurring "one-off"** ($88.2m of it from the cost-reduction programme) | `FY2026 10-K, Note 7 (Software Development Costs and Licenses)` |
| Impairment of software development costs and licenses | FY2025 | 77.5 | **Recurring "one-off"** ($42.4m abandoned titles, $35.1m cost-reduction programme) | `FY2026 10-K, Note 7` |
| Impairment of software development costs and licenses | FY2026 | **(1.0)** | **Suspicious direction** — a net **recovery**: $(6.0)m written back on two terminated titles, $5.0m of new charges | `FY2026 10-K, Note 7` |
| Impairment of software development costs — abandoned third-party title | Q1 FY27 | 43.4 | **Recurring "one-off"** — same line, fourth year running | `Q1 FY27 10-Q, Note 7` |
| Impairment of software development costs | Q2 FY27 | 0.2 | Recurring, immaterial | `Q2 FY27 10-Q, Note 7` |
| **London building purchase** | Q2 FY27 (2026-08-10) | **91.8** capitalised cost (82.9 land + 8.9 building) | **Genuine** one-off — the capex normalisation in §1 | `Q2 FY27 10-Q, Note 15 (Asset Acquisition)`; `Q2 FY27 10-Q, MD&A — Liquidity` |
| **Government grants on qualified production spend** (reduce cost of revenue and R&D) | FY2024 / FY2025 / FY2026 | **51.2 / 210.6 / 85.4** | **Recurring but wildly lumpy** — and FY2025's was **55% of that year's $379.5m EBITDA** | `FY2026 10-K, Note 7` (cost of revenue reduced by $75.5 / $167.4 / $45.3; R&D reduced by $9.9 / $43.2 / $5.9) |
| Income tax benefit including reserve releases | Q2 FY27 | 57.9 | **Suspicious as a quality item** — turns a $(111.9)m pre-tax loss into a $(54.0)m net loss | `Q2 FY27 10-Q, Note 13` |
| Non-cash acquisition of non-voting equity shares in a privately-held entity | H1 FY27 | 62.1 | **Genuine** one-off, non-cash, **consideration not disclosed** | `Q2 FY27 10-Q, Note 5 (Fair Value Measurements — Nonrecurring)` |
| Equity issuance (underwritten offering) | FY2026 | 1,247.5 cash in | Genuine one-off — financing, not earnings; it is what halved net debt in FY2026 | `FY2026 10-K, p.66` |

**Reconciliation to the §1 normalisation.** Only one item in this table changes a §1 figure: the London building. $304.5m TTM capex − $91.8m = $212.7m; $367.1m CFO − $212.7m = **$154.4m normalised operating FCF**, against **$62.6m reported**. Nothing else above is adjusted out of the bridge, and the government-grant and tax-benefit items are deliberately **left in** — they are recurring features of this P&L, not removable one-offs.

**The reserve-release pattern deserves naming.** FY2026 is the clean cash year, and two of its lines are reversals of prior-year charges rather than an absence of charges: business reorganisation **+$4.4m** and software-development impairment **+$1.0m**. Together $5.4m — small against $788.5m of EBITDA. But the *year-on-year* optics are larger: those two lines moved from $184.0m of combined charges in FY2025 to a $5.4m combined credit in FY2026, a $189.4m swing that flattered the FY2026 operating-income improvement without any operating cause.

---

## 6. Accrual Quality Flags

| Flag | Triggered (Y/N) | Evidence |
|---|---|---|
| Revenue growing faster than CFO for 2+ years | **Y** | FY2024 revenue flat at $5,349.6m while CFO fell from $+1.1m to $(16.1)m; FY2025 revenue **+5.3%** to $5,633.6m while CFO fell again to $(45.2)m — two consecutive years. The latest twelve months are marginal in the same direction: revenue **+3.1%** (6,409.7 vs 6,219.9) against CFO **+2.6%** (367.1 vs 357.9). **Not** triggered in FY2026, when revenue rose 18.2% and CFO swung to $+624.3m [1][2][9][10] |
| Receivables growing faster than revenue | **N** | Receivables **fell** from $1,249.9m (2025-09-30, vendor basis incl. contract assets) to $780.8m (2026-09-30) — DSO 73.4 → 44.5 days — against TTM revenue up 3.1%. The sequential rise (737.0 → 780.8, +5.9%) is pre-launch and does not meet the year-on-year test [1][3][9] |
| Inventory growing faster than COGS | **Y** | Inventory $7.3m → $34.1m (+367%) in six months while six-month cost of revenue fell 4.7% ($1,352.1m → $1,288.0m). Composition is parts and supplies $1.2m → $24.0m. Immaterial in dollars; triggered by the letter of the test [3, Note 8; 5] |
| Deferred revenue declining (contract/recurrent business) | **Y** | Total deferred revenue (current + non-current) **$1,268.1m at 2025-09-30 → $1,042.1m at 2026-09-30, −17.8% YoY**, and $1,189.6m → $1,042.1m in six months. Deferred-revenue days fell 71.8 → 65.2 → 59.3 across three periods. This matters because **65% of FY2027 Net Bookings is recurrent consumer spending** and GAAP defers a large share of billings — a falling deferred balance is a falling forward book [3, Note 3; 9; `Q2 FY27 deck, slide 8`] |
| Capitalised costs growing as % of revenue | **Y** | Cash capitalised into software development costs and licenses: **10.53% of revenue in H1 FY26 → 12.29% in H1 FY27** (345.0/3,277.6 → 372.4/3,030.9). The balance rose from $1,973.4m (FY2025) → $2,346.3m (FY2026) → **$2,577.3m (2026-09-30)**, i.e. **+9.8% in six months while revenue fell 7.5%** [1][3] |
| Frequent accounting policy changes | **N** | The only adoption in the period is **ASU 2023-09 (income-tax disclosures)**, prospective from FY2026 and **disclosure-only** — it changes no measurement. Everything else cited (ASU 2025-10 government grants, ASU 2025-06 internal-use software, ASU 2024-03) is *not yet effective* (FY2028–FY2030). Auditor **Ernst & Young LLP, unqualified opinion, continuously since at least FY2017** — no auditor change, no restatement [1, Note 1 and Note 15; `Capital IQ Auditors export, FY2017–FY2026`] |

**Four of six rows triggered Y.**

RF-EQ-001 (rising accruals divergent from cash earnings)

That tag is emitted mechanically because two or more rows resolve Y, and it is emitted for the synthesis layer regardless of whether it alone moves this module's score band in Section 9. The honest reading of *which* four: the two large ones are the **capitalised-cost intensity** and the **falling deferred-revenue book**; the inventory trigger is a $26.8m rounding item on a physical-launch build, and the revenue-vs-CFO trigger is historical (FY2024–FY2025) with FY2026 having reversed it.

**The one line in this section that is not a flag but is the real exposure.** At 2026-03-31, **$2,149.7m of the $2,277.5m non-current capitalised software development balance — 91.6% of the total $2,346.3m — related to titles that had not yet been released** [1, Note 7]. That is **61% of total stockholders' equity of $3,510.9m** and 32% of FY2026 revenue, carried as an asset whose recoverability is tested on *management's expected performance of unreleased products*, using criteria the company itself lists as "historical performance of comparable products … orders for the product prior to its release, general market conditions, and past performance of the franchise" [1, Significant Accounting Policies]. **The 10-Q gives no interim update of the unreleased-title split**, so the 2026-09-30 portion of the larger $2,577.3m balance is not disclosed and is not estimated here. Amortisation runs over 9–36 months on a revenue-proportional or straight-line basis, whichever is greater [1, Significant Accounting Policies].

---

## 7. Reported vs Adjusted Reconciliation — Q2 FY27 (three months ended 2026-09-30)

The company **does** disclose adjusted metrics, on two levels, and discloses the full line-by-line build of both [5, p.2 and p.11]. No full-year FY2026 company-defined reconciliation exists in this pool (no Q4 FY26 release was admitted), so the latest quarter is used.

| Metric | Reported (GAAP) | Adjusted | Difference | % of Reported | Recurring? | Evidence |
|---|---:|---:|---:|---:|---|---|
| EBITDA (company-defined non-GAAP) | Net loss (54.0) | **92.2** | **+146.2** | n/m (reported base negative) — **= 9.8% of the quarter's $1,497.0m net revenue** | Y — same five lines every quarter | `Q2 FY27 earnings release, p.11` |
| EBITDA (management-reporting basis) | Net loss (54.0) | **277.1** | **+331.1** | n/m — **= 22.1% of net revenue** | Y | `Q2 FY27 earnings release, p.2 and p.11`; bridge: 92.2 + 101.9 + 90.0 + 2.4 − 9.4 = 277.1 |
| EBIT (income/(loss) from operations) | **(117.5)** | **229.6** (management-reporting) | **+347.1** | n/m — **= 23.2% of net revenue** | Y | `Q2 FY27 earnings release, p.2`. **The company discloses no adjusted EBIT as a named line** — this is the arithmetic of its own adjustment columns: deferred revenue +101.0, stock compensation +90.0, amortisation of acquired intangibles +153.0, acquisition-related +3.1 |
| Net income | **(54.0)** | **≈186.4** (management-reporting, derived) | **+240.4** | n/m | Y | Derived from `Q2 FY27 earnings release, p.2`: pre-tax (111.9) + 101.9 + 90.0 + 153.0 + 3.7 − 9.4 = 227.3; × (1 − 18% management tax rate) = 186.4. The company discloses the columns and the 18% rate but not this total |
| EPS (diluted) | **$(0.29)** | **≈$0.99** (management-reporting, derived) | **+$1.28** | n/m | Y | 186.4 ÷ 188.0m shares [5, p.2]. Capital IQ records the quarter's EPS **actual at $1.00** on its management basis [11] |

**Four columns exist and they are not interchangeable.** GAAP net loss $(54.0)m; non-GAAP EBITDA $92.2m; management-reporting EBITDA $277.1m; management-reporting EPS ≈$0.99. The step from the first to the third is **$331.1m on $1,497.0m of revenue**, and the two largest components are **$90.0m of stock-based compensation** (a cash-equivalent cost of employing people, added back every quarter) and **$101.9m of deferred-revenue timing** (revenue the company billed but GAAP defers — it moves income between periods rather than creating it).

**The deferred-revenue adjustment cuts both ways, and in this quarter it cut the helpful way.** For the **three** months to 2026-09-30 the net effect on revenue was **+$104.3m** (Net Bookings $1,601.3m above GAAP net revenue $1,497.0m). For the **six** months it was **−$43.7m** (Net Bookings $2,987.2m *below* GAAP net revenue $3,030.9m) [5, p.2 and "Net Bookings by content"]. So the single largest non-amortisation add-back in the quarter's management-reporting EBITDA was a positive only because of where the quarter fell in the billing cycle; on the half it was a subtraction. Any claim built on the Q2 management-basis number must carry that.

---

## 8. Accounting Trap Checklist

**Severity is an INVERTED score — higher means WORSE.**

| Trap | Triggered? (Y/N) | Evidence | Severity /100 *(higher = WORSE — inverted)* |
|---|---|---|---:|
| Stock-based compensation excluded from adjusted earnings | **Y** | $90.0m added back in Q2 FY27 = **32.5%** of the $277.1m management-reporting EBITDA the consensus field tracks; $176.0m in the half; $305.3m in FY2026; **$462m guided for FY2027 = 29.5%** of the derived management-basis EBITDA midpoint. Share count rose 177.1m → 187.2m over 18 months [5, p.2; 1, p.63 and p.66; 3, p.2; 12] | **75** |
| Restructuring costs recur every year | **Y (FY2024–FY2025), then reversed** | Business reorganisation $104.6m (FY2024), $106.5m (FY2025), **$(4.4)m credit (FY2026)**, absent in FY2027 to date. Software-development impairment $109.9m / $77.5m / $(1.0)m / $43.6m (H1 FY27) — the same line in four consecutive years [1, p.64 and Note 7; 2, p.66; 4, Note 7] | **50** |
| Capitalised costs rising faster than revenue | **Y** | Capitalised software-development cash spend **10.53% → 12.29% of revenue** H1 FY26 → H1 FY27; balance $2,346.3m → $2,577.3m (+9.8%) in six months while revenue fell 7.5%. **$2,149.7m (91.6% of the FY2026 balance) sat on unreleased titles = 61% of equity** [1, Note 7; 3, p.2 and Note 7] | **80** |
| Receivable factoring / supplier finance disclosed | **Y (disclosed), N (used)** | Uncommitted accounts-receivable purchase facility of up to **$215.0m** on a true-sale basis, entered 2025-05-19, with proceeds reported **inside operating cash flow**. "**No receivables were sold under this facility during the fiscal year ended March 31, 2026**" and "**No receivables were sold … during the six months ended September 30, 2026**" [1, MD&A — Accounts Receivable sale program; 3, Note 3]. So CFO is **not** flattered by factoring today; the mechanism to flatter it exists and is pre-approved | **30** |
| Inventory write-downs or reserve releases | **Y — releases, not write-downs** | FY2026 software-development impairment was a net **$(1.0)m recovery**, including **$(6.0)m written back** on two titles terminated under the FY2025 cost-reduction plan; business reorganisation a **$(4.4)m credit**. Combined $5.4m credit in FY2026 against $184.0m of charges in FY2025 [1, p.64 and Note 7] | **45** |
| Revenue recognised before cash collection risk is clear | **N** | 97.9% of revenue is digital online; five customers are **80.8% of net revenue** and 76.2% of gross receivables, but these are platform storefronts, allowances are **$0.7m** on $780.8m of gross receivables, and the company carries trade credit insurance on the majority of customers. Revenue split: $4,504.8m over time vs $1,128.8m point-in-time in FY2025 — a service-period model, not a sell-in model [3, MD&A — Financial Condition and Disaggregation of Revenue; 2, Note on revenue recognised] | **20** |
| Change in useful life / depreciation assumptions | **N** | No change disclosed. Policies unchanged: software titles amortised over **9 to 36 months**; office equipment 5 years; computer equipment 3–5 years; leasehold improvements ~7 years; buildings ~30 years. The London purchase was allocated $82.9m to **land (not depreciated)** and $8.9m to building over 20 years — honest allocation, but it means a $91.8m cash-equivalent outlay adds almost no depreciation [1, Significant Accounting Policies; 3, Note 15] | **15** |
| Tax rate unusually low or boosted by one-off | **Y** | Q2 FY27 **benefit** from income taxes of $57.9m against a $(111.9)m pre-tax loss — an **effective rate of 51.7% vs the 21% statutory rate**, "primarily driven by tax benefits of $57.1 related to geographic mix of earnings **and changes in reserves**, offset by tax expense of $20.0 related to tax credits". Six-month rate 45.3%. Without the benefit the quarter's net loss would have been $(111.9)m, not $(54.0)m. A **November 2026 reorganisation of certain intangible assets "to simplify our global operating structure"** will shift the jurisdictional mix of earnings from that month, impact "still evaluating" [3, Note 13 and Note 16] | **65** |
| Large fair-value / mark-to-market gains | **N** | Fair-value adjustments of $12.5m (FY2026), $6.9m (FY2025), $8.6m (FY2024) — immaterial against EBITDA. Level 3 assets $24.0m of $1,380.4m total financial assets. One non-cash item to note rather than a gain: **$62.1m of non-voting equity shares in a privately-held entity acquired in a non-cash transaction** in H1 FY27, consideration not disclosed [1, p.66; 3, Note 5] | **20** |

---

## 9. Earnings Quality Score

### **48 / 100** — band 41–60: *material concerns — cash conversion weak OR recurring one-offs*. Here, both.

**The single most important reason:** cash conversion has failed for most of this cycle, not for one year — CFO/EBITDA of **38.4% / 0.2% / −3.7% / −11.9% / 79.2% / 50.6%** across FY2022–FY2026 and the latest twelve months, with **negative free cash flow in three of five fiscal years** and the one clean year (FY2026) already half given back (normalised operating FCF of up to $154.4m in the latest twelve months against $181.0m a year earlier, reported FCF $62.6m against $181.0m) [1][2][3][7][9][10].

**What holds the score up to 48 rather than lower.** The disclosure is unusually complete, and that is worth real credit: Take-Two publishes the **entire line-by-line build** of both its non-GAAP and its management-reporting measures, and `04_guidance-consensus` reconciled the vendor's "EBITDA" and "EPS Normalized" fields to those builds **to the cent on two consecutive quarters** [12]. The deferred-revenue note states how much of the opening balance was recognised ($971.5m in the half). The auditor is **Ernst & Young LLP with an unqualified opinion continuously since at least FY2017**, no auditor change and no restatement of the filings; the sole Critical Audit Matter is the goodwill impairment assessment. The receivable-factoring facility exists but was **not used** in FY2026 or H1 FY27, so CFO is not flattered by it. DSO improved 29 days year on year. And the capex spike that cut reported FCF has a **named, verifiable one-off cause** — the $91.8m London building. None of this is an opaque set of accounts.

**What holds it down to 48.** Four of six accrual flags fire (`RF-EQ-001`) and cash conversion breaks the 50% test in two of the last three fiscal years (`RF-EQ-002`). $90.0m a quarter of stock-based compensation is excluded from the number the market tracks. A $101.9m deferred-revenue timing adjustment lifted the quarter's management-basis EBITDA while the same adjustment was *negative* $43.7m for the half. FY2026's operating-income improvement was flattered by $189.4m of swing in reserve lines that reversed rather than recurred. The quarter's GAAP loss was halved by a $57.9m tax benefit that included reserve releases, at a 51.7% effective rate against a 21% statutory rate. And $2,149.7m of capitalised development cost — 61% of equity — sits on titles that had not been released at the last annual balance-sheet date, with no interim update.

**No partial-data cap applies.** Audited FY2026 and FY2025 cash-flow statements, the six-month interim statements to 2026-09-30, and ~42 quarters of vendor cash-flow history are all present, so the `MODULE_RULES.md` "no cash flow statement → earnings quality max 45" cap does **not** bind, and the score is set on evidence rather than by a cap.

---

## 10. The Single Biggest Quality Concern

**The risk is not that reported earnings are fabricated — it is that $2.5bn of the balance sheet is an unamortised bet on games nobody has bought yet, and the cash cost of making them runs through operating cash flow every quarter while the charge against profit does not.** At 2026-03-31, **$2,149.7m of the $2,346.3m capitalised software-development balance related to titles that had not been released** — 91.6% of the asset, **61% of total stockholders' equity of $3,510.9m**, carried at cost and tested for recoverability against *management's forecast* of how unreleased products will perform [1, Note 7 and Significant Accounting Policies]. The balance has since grown to **$2,577.3m at 2026-09-30**, up 9.8% in six months while revenue fell 7.5% and the capitalisation rate rose from 10.53% to 12.29% of revenue [3, p.2 and Note 7]. Meanwhile **$716.3m of cash** went into content over the latest twelve months against only **$411.9m** of amortisation charged — a $304.4m gap that is why EBITDA of $724.9m converted to just $62.6m of reported free cash flow. The company has already shown it will write this asset down when a title dies: $109.9m in FY2024, $77.5m in FY2025, $43.4m in a single quarter in Q1 FY27 [1, Note 7; 4, Note 7]. If Grand Theft Auto VI — the title this build-up plainly funds, launched within days of this report's date with pre-orders management described only as "tracking far in excess of our initial expectations" and quantified nowhere in this pool — performs below the forecast embedded in that carrying value, the write-down lands as a non-cash charge **after** the cash has already gone out. That is the asymmetry: the cash risk is taken now and is visible in a 50.6% cash-conversion rate; the earnings risk is deferred and sits entirely inside one unverifiable management estimate. Secondary but real: the market's own yardstick for this company is a management-reporting EBITDA that excludes **$462m of guided FY2027 stock compensation (29.5% of it)** and adds back a deferred-revenue timing effect that was positive $104.3m for the quarter and negative $43.7m for the half — so the headline number the Street beats or misses is roughly 30% non-cash by construction and partly a function of billing timing.

---

## 11. Citations

[1] FY2026 Form 10-K (fiscal year ended 2026-03-31), filed 2026-05-22 — Consolidated Balance Sheets p.63; Consolidated Statements of Operations p.64; Consolidated Statements of Cash Flows p.66; Report of Independent Registered Public Accounting Firm (Critical Audit Matter — Goodwill Impairment Assessment); Significant Accounting Policies (software development costs, fixed assets, goodwill); Note 7 (Software Development Costs and Licenses); Note 11 (Debt) p.85–86; Note 15 (Income Taxes); MD&A (Accounts Receivable sale program; Business reorganization). `data/TTWO/10K_2025_26_0001628280-26-037434.pdf`
[2] FY2025 Form 10-K (fiscal year ended 2025-03-31) — Consolidated Balance Sheets p.65; Consolidated Statements of Operations p.66 (FY2025 / FY2024 / FY2023); Consolidated Statements of Cash Flows p.68 (FY2025 / FY2024 / FY2023); revenue recognised over time vs point in time. `data/TTWO/10K_2024_25_0001628280-25-026694.pdf`
[3] Q2 FY2027 Form 10-Q (quarter ended 2026-09-30) — Condensed Consolidated Balance Sheets p.2; Statements of Operations p.3; Statements of Cash Flows p.5 (six months ended 2026-09-30 and 2025-09-30); Note 3 (Revenue — Deferred Revenue, Contract assets, Accounts Receivable sale program); Note 5 (Fair Value Measurements); Note 7 (Software Development Costs and Licenses); Note 8 (Inventory); Note 9 (Accrued Expenses and Other Current Liabilities); Note 10 (Debt); Note 13 (Income Taxes); Note 15 (Asset Acquisition); Note 16 (Subsequent Events); MD&A (Liquidity and Capital Resources, Financial Condition, Capital Expenditures). `data/TTWO/10Q_2Q_0001628280-26-072254.pdf`
[4] Q1 FY2027 Form 10-Q (quarter ended 2026-06-30) — Note 7 (Software Development Costs and Licenses — $43.4 impairment); Note 8 (Accrued Expenses). `data/TTWO/10Q_1Q_0001628280-26-054870.pdf`
[5] TTWO Q2 FY2027 earnings release (Form 8-K Exhibit 99.1), dated 2026-11-09 — p.1 (Net Bookings $1,601.3m); p.2 (management-reporting adjustment columns; Outlook for Fiscal Year 2027; Q3 FY27 outlook); p.11 (Reconciliation of GAAP to Non-GAAP Measure — EBITDA bridge and FY27/Q3 outlook reconciliations); "Additional Data" (cost-of-revenue components by quarter and half); "Net Revenue and Net Bookings by Content, Platform Mix, Distribution Channel, and Geographic Region". `data/TTWO/TTWO 2Q27 Earnings Release FINAL.pdf`
[6] Take-Two Q2 FY27 investor deck, 2026-11-09 — slide 8 (FY27 recurrent consumer spending flat YoY, 65% of Net Bookings). `data/TTWO/Take-Two_Interactive_2Q FY27 FINAL.pdf`
[7] Capital IQ `Financials_Annual` export, **Income Statement** tab (FY2017 → FY2026 + LTM Sep-30-2026; reported currency USD m; restatement basis "Latest Filings"), data as of the 2026-11 export — EBITDA / EBIT rows. `data/TTWO/Take Two Interactive Software Inc NasdaqGS TTWO Financials_Annual.xls`
[8] Capital IQ `Financials_Annual` export, **Cash Flow**, **Balance Sheet** and **Supplemental** tabs (FY2017 → FY2026 + Sep-30-2026) — capex, FY2022 cash-flow lines, stock-based compensation before tax, unrecognised tax benefits. Same workbook as [7].
[9] Capital IQ `Financials_Quarterly` export, **Income Statement**, **Cash Flow** and **Balance Sheet** tabs (FQ1 2017 / Jun-30-2016 → FQ2 2027 / Sep-30-2026), data as of the 2026-11 export — standalone quarterly CFO and capex; the 2025-09-30 receivable and unearned-revenue balances (used because no Q2 FY26 10-Q is in this pool); `NA` cash interest/tax paid for Jun-2026 and Sep-2026. `data/TTWO/Take Two Interactive Software Inc NasdaqGS TTWO Financials_Quarterly.xls`
[10] `ciq_facts.json` deterministic facts sidecar (frozen extract generation) — `ltm_ebitda_m` 724.9; `ltm_ocf_m` 367.1; `levered_fcf_m` 787.6 (levered, **not** the §15 CFO−capex definition, and not used); `net_debt_m` 1,237.8 (CIQ **broad** vendor basis); `total_debt_m` 2,911.4; `margin_trend`; `multi_year_trajectory`. All referencing the Capital IQ workbooks at [7]–[9]. Reconciled: this report's EBITDA and CFO reads match the sidecar exactly; no material gap.
[11] Take-Two Interactive Software, Inc., Q2 2027 Earnings Call transcript, 2026-11-09 — S&P Global Market Intelligence Estimates header block (quarter EPS actual 1.00, management basis). `data/TTWO/Take-Two Interactive Software, Inc., Q2 2027 Earnings Call, Nov 09, 2026.rtf`
[12] Upstream module outputs: `analyses/TTWO_2026-11-19/earnings/00_earnings-data-triage.md` (jurisdiction, reporting standard, currency, fiscal-year end, GAAP-revenue-vs-Net-Bookings basis warning, no partial-data cap); `analyses/TTWO_2026-11-19/earnings/01_historical-financials.md` (annual and TTM baseline, prior-TTM FCF $181.0m, strict-basis net-debt series); `analyses/TTWO_2026-11-19/earnings/04_guidance-consensus.md` (the verified bridges proving Capital IQ "EBITDA" and "EPS Normalized" are management-basis, and the derived FY27 management-basis EBITDA range $1,536–1,594m including $462m of stock compensation).
[13] Capital IQ `Auditors` export — auditor history FY1996 → FY2026 (Ernst & Young LLP, unqualified, no change). `data/TTWO/Take Two Interactive Software Inc NasdaqGS TTWO Auditors.xls`

**Not used:** `Alphabet Inc NasdaqGS GOOGL Key Developments.xls` is a wrong-company pool contaminant (Alphabet Inc., not Take-Two) and is cited nowhere in this report [12].

---

## 12. Computation Log (executed, not mental arithmetic)

Every percentage, day-count, bridge total and residual above was produced by executed Python over the sourced figures in §1–§8. The bridge was verified to foot to reported CFO in every column before publication.

```
FY2023 bridge sum 1.1   = reported CFO 1.1   diff -0.0
FY2024 bridge sum -16.1 = reported CFO -16.1 diff -0.0
FY2025 bridge sum -45.2 = reported CFO -45.2 diff  0.0
FY2026 bridge sum 624.3 = reported CFO 624.3 diff  0.0
H1FY27 bridge sum -173.5 = reported CFO -173.5 diff 0.0
H1FY26 bridge sum   83.7 = reported CFO   83.7 diff -0.0
TTM    bridge sum  367.1 = reported CFO  367.1 diff  0.0   (= FY2026 - H1FY26 + H1FY27, ties to sidecar 367.1)

FY2022 EBITDA 671.0 CFO 258.0 capex 158.6 FCF   99.4 CFO/EBITDA 38.4%
FY2023 EBITDA 555.5 CFO   1.1 capex 204.2 FCF -203.1 CFO/EBITDA  0.2%
FY2024 EBITDA 432.2 CFO -16.1 capex 169.1 FCF -185.2 CFO/EBITDA -3.7%
FY2025 EBITDA 379.5 CFO -45.2 capex 189.7 FCF -234.9 CFO/EBITDA -11.9%
FY2026 EBITDA 788.5 CFO 624.3 capex 190.2 FCF  434.1 CFO/EBITDA 79.2%
TTM    EBITDA 724.9 CFO 367.1 capex 304.5 FCF   62.6 CFO/EBITDA 50.6%
TTM normalised FCF excl. London building = 367.1 - (304.5 - 91.8) = 154.4
Recurring-capex proxy = (169.1+189.7+190.2)/3 = 183.0

Working-capital days (period-end balances; DSO on revenue, DIO/DPO on COGS; TTM COGS = 2846.7-1352.1+1288.0 = 2782.6)
FY2025 DSO 50.0  DIO n/d  DPO(AP) 27.6  DPO(AP+accrued, broad) 187.7  CCC 22.3  DefRev days 71.8
FY2026 DSO 40.4  DIO  0.9  DPO(AP) 27.1  DPO(AP+accrued, broad) 170.4  CCC 14.3  DefRev days 65.2
Sep-26 DSO 44.5  DIO  4.5  DPO(AP) 27.2  DPO(AP+accrued, broad) 165.4  CCC 21.7  DefRev days 59.3
Sep-25 DSO 73.4 (vendor AR 1249.9 / prior-TTM revenue 6219.9)  ->  Sep-26 44.5 : -28.9 days YoY

Content investment vs charge:  FY2024 amort 292.7 vs cash 603.4 gap -310.7
                               FY2025 amort 333.8 vs cash 691.6 gap -357.8
                               FY2026 amort 412.8 vs cash 688.9 gap -276.1
                               TTM    amort 411.9 vs cash 716.3 gap -304.4
Capitalisation rate: H1FY26 345.0/3277.6 = 10.53% ; H1FY27 372.4/3030.9 = 12.29%
Capitalised balance: FY2024 1534.8 -> FY2025 1973.4 -> FY2026 2346.3 -> Sep-26 2577.3
Unreleased-title portion FY2026 2149.7 = 91.6% of balance = 61% of equity 3510.9
SBC: FY2024 335.6 (6.27% of rev) ; FY2025 324.0 (5.75%) ; FY2026 305.3 (4.59%) ; TTM 344.7 (5.38%)
SBC as % of mgmt-basis EBITDA: Q2 FY27 90.0/277.1 = 32.5% ; FY27 guided 462/1565 = 29.5%
Q2 FY27 pre-tax loss = -54.0 - 57.9 = -111.9 ; 6M pre-tax loss -161.2, benefit rate 45.3%
Government grants in P&L: FY2024 51.2 (12% of EBITDA) ; FY2025 210.6 (55%) ; FY2026 85.4 (11%)
Inventory 7.3 -> 34.1 = +367% while H1 COGS 1352.1 -> 1288.0 = -4.7%
Deferred revenue (curr+non-curr): Sep-25 1268.1 -> Sep-26 1042.1 = -17.8% YoY
GAAP->mgmt-EBITDA step Q2 FY27 = 331.1 on revenue 1497.0 = 22.1% of revenue
```
