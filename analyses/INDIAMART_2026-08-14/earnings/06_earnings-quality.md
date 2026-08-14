# Earnings Quality — INDIAMART

**Jurisdiction / regime:** India, NSE/BSE-listed (NSE: INDIAMART). Reporting standard: Ind AS. Reporting currency: INR. Fiscal year ends 31 March. All figures in **₹ million**, consolidated, unless stated otherwise. Sourcing note: no `ciq_facts.json` sidecar exists for this run, so figures below are this agent's own sourced read of the Capital IQ (CIQ) financial-statement exports (Tier 5, CLAUDE.md §4) cross-checked against the FY26 Annual Report (Ind AS, audited) and the Jun-2026 interim filing (SEBI LODR Reg 33), consistent with `01_historical-financials`. Cash flow data **is** available (CIQ Cash Flow tab, cross-checked to the interim filing's condensed cash flow statement) — the partial-data cap for missing cash flow data does not apply.

---

## 1. EBITDA → CFO → FCF Bridge (5 years, FY22–FY26)

| Item | FY22 | FY23 | FY24 | FY25 | FY26 | Trend |
|---|---:|---:|---:|---:|---:|---|
| EBITDA | 2,971.01 | 2,618.07 | 3,176.77 | 5,140.44 | 5,205.94 | Volatile (step-changes; see `01_historical-financials` §6) |
| Working capital change¹ | +1,799.96 | +2,550.64 | +2,936.82 | +2,338.29 | +2,843.21 | Stable — positive (cash source) every year |
| Tax paid (cash) | −971.22 | −754.48 | −915.41 | −1,548.42 | −1,567.94 | Increasing in line with profit |
| Interest paid (proxy)² | −54.0 | −81.5 | −89.1 | −74.1 | −29.8 | Improving (shrinking; company is net-cash) |
| Other operating items (residual)³ | +277.39 | +425.55 | +482.58 | +375.92 | +490.78 | Increasing (tracks rising SBC, see §4) |
| **CFO** | **4,023.14** | **4,758.28** | **5,591.66** | **6,232.13** | **6,942.19** | Improving — grows every year |
| Total capex (maintenance + growth, unsplit)⁴ | −44.20 | −172.00 | −146.80 | −78.60 | −70.00 | Volatile, small base; asset-light |
| **FCF (CFO − Total Capex)** | **3,978.94** | **4,586.28** | **5,444.86** | **6,153.53** | **6,872.19** | Improving — grows every year |
| **CFO / EBITDA %** | **135.4%** | **181.8%** | **176.0%** | **121.2%** | **133.4%** | Volatile but consistently well above the 70% healthy line |

¹ Sum of the cash-flow statement's own line items: Change in Acc. Receivable + Change in Acc. Payable + Change in Unearned Rev. + Change in Other Net Operating Assets [Capital IQ export, `Financials (1).xls`, Cash Flow tab]. The dominant component every year is the growth in Unearned Revenue (customer prepayments) — see §3.
² Cash Interest Paid is disclosed as a standalone supplemental cash-flow line only for FY22 (₹54.02mn); the field is blank ("NA") for FY23–FY26 in the CIQ export. FY23–FY26 use "Interest Expense" from the P&L (which reconciles to Finance Costs, Note 22 of the FY26 Annual Report: ₹29.81mn FY26, ₹74.06mn FY25) as a proxy for cash interest paid — labelled, not silently substituted (CLAUDE.md §15). The amounts are immaterial (<1.5% of EBITDA in every year) because the company carries no bank debt — "Total Debt" is entirely lease liabilities [FY26 Annual Report, Note 15 / interim balance sheet].
³ Residual/plug required to reconcile the EBITDA-based bridge (EBITDA − tax − interest + WC change) to reported CFO. This captures non-cash add-backs not itemised above — chiefly Stock-Based Compensation (₹366.20mn FY26, ₹187.44mn FY25 — see §4) and the non-cash "Share in net loss of associates" add-back (₹547.72mn FY26), net of the removal of the non-operating investment gains from Net Income in the CFO reconciliation (₹1,906.51mn FY26 — see §5/§7). Shown as a derived plug, not a single filed line item — CLAUDE.md §15 arithmetic shown.
⁴ **Capex split not disclosed — total capex used.** IndiaMART does not break out maintenance vs. growth capex in the Annual Report or CIQ export. FCF below may understate or overstate true recurring free cash flow to the extent capex is lumpy, but the amounts involved are small relative to CFO (≤3% of CFO in every year), so the distortion risk from this gap is low.

**Lead figure is reported FCF above — it is real, bank-verified cash, not fictitious.** However, a large and *structural* (not one-off) share of the YoY growth in FCF is attributable to the growth in customer prepayments (Unearned Revenue), which is itself decelerating with the top line. Per CLAUDE.md §15, the supplementary "ex-deferred-revenue-growth" view is shown below, labelled as this agent's own construction (Inference, not from filings) — it is **not** a substitute lead figure because the deferred-revenue build is a recurring feature of the subscription model across all 5 years, not a lumpy one-off customer advance:

| | FY22 | FY23 | FY24 | FY25 | FY26 |
|---|---:|---:|---:|---:|---:|
| Reported FCF | 3,978.94 | 4,586.28 | 5,444.86 | 6,153.53 | 6,872.19 |
| Less: net growth in Unearned Revenue (deferred-revenue build)⁵ | −1,809.37 | −2,332.76 | −2,775.18 | −2,376.68 | −2,876.11 |
| **"Ex-deferred-revenue-growth" operating FCF (own construction)** | **2,169.57** | **2,253.52** | **2,669.68** | **3,776.85** | **3,996.08** |
| As % of reported FCF | 54.5% | 49.1% | 49.0% | 61.4% | 58.1% |
| YoY growth of this measure | — | +3.9% | +18.5% | +41.5% | **+5.8%** |

⁵ [Capital IQ export, `Financials (1).xls`, Cash Flow tab, "Change in Unearned Rev." row]. Inference, not from filings — this is not a company-disclosed sub-total.

**Finding:** reported FCF grew every year and looks stable, but roughly half of it is the cash benefit of a growing prepayment book. Once that structural float benefit is stripped out, underlying operating FCF growth decelerated sharply from +41.5% (FY25) to +5.8% (FY26) — tracking the revenue-growth deceleration already flagged in `01_historical-financials` (30.8%→13.0% FY23→FY26), not diverging from it. This is a magnitude finding, not a manipulation finding: the prepayment cash is real and collected, but its growth rate — not its existence — is the thing to watch.

---

## 2. Cash Conversion Assessment

CFO has tracked *above* EBITDA in every one of the last 5 years (121%–182% of EBITDA), never once dipping toward the 70% "healthy" line, let alone the 50% red-flag line — so the mechanical cash-conversion-breakdown check does **not** trigger. This is structural, not a one-off: IndiaMART sells prepaid annual/multi-year subscriptions, so cash is collected up front and Unearned Revenue (₹19,652.60mn at FY26 vs ₹16,776.49mn at FY25, +17.1% YoY [FY26 Annual Report, Note 19]) keeps growing every year — it has never declined, which is the single strongest positive cash-quality signal in this dossier. The trajectory shows some volatility (182% in FY23 down to 121% in FY25, back up to 133% in FY26) but no deterioration: the ratio simply mean-reverts around a very high base as EBITDA itself swings (see `01_historical-financials` §1 on the FY23 margin step-down and FY25 snap-back). No RF-EQ-002 condition is met.

---

## 3. Working Capital Trends

IndiaMART is a subscription/services marketplace with **no inventory** ("Inventory Method: NA" [Capital IQ export, `Financials (1).xls`, Balance Sheet tab]) and **no company-disclosed COGS/cost-of-revenue line** — its Ind AS profit & loss statement is single-step (Employee benefits, Finance costs, D&A, Other expenses) [FY26 Annual Report, Consolidated Statement of Profit and Loss, p. as cited in `01_historical-financials` fn.²]. DIO is not applicable. DPO below uses CIQ's own vendor-constructed "Cost Of Goods Sold" bucket as the denominator — flagged as Tier-5 vendor construction, not a statutory line — and the disclosed Accounts Payable balance is trivial (₹13.02mn at FY26, 0.1% of Total Current Liabilities), so DPO is not a meaningful liquidity signal for this business; it is shown only because the template requires it.

| Metric | FY24 | FY25 | FY26 | Direction | Risk |
|---|---:|---:|---:|---|---|
| Receivable days (DSO)⁶ | 10.42 | 11.15 | 8.89 | Falling in FY26 after a mild FY25 rise | Low — trivially small in absolute terms; subscription model collects most cash upfront |
| Inventory days (DIO) | N/A | N/A | N/A | Not applicable | Not applicable — no inventory (services business) |
| Payable days (DPO)⁷ | 0.31 | 0.48 | 0.63 | Rising in % terms | Not meaningful — sub-1-day in absolute terms; AP is 0.1% of current liabilities, not a real supplier-financing signal |
| Cash conversion cycle (DSO+DIO−DPO) | 10.11 | 10.67 | 8.26 | Improving in FY26 | Low |

⁶ DSO = 365 × average Total Receivables ÷ Revenue, average of opening/closing balances. Receivables: FY23 284.30, FY24 398.78, FY25 449.39, FY26 314.86 [Capital IQ export, Balance Sheet tab].
⁷ DPO = 365 × average Accounts Payable ÷ CIQ "Cost Of Goods Sold" (vendor construction). Accounts Payable: FY23 4.25, FY24 5.03, FY25 11.18, FY26 13.02 [Capital IQ export, Balance Sheet tab]. COGS: FY24 5,506.62, FY25 6,111.19, FY26 7,016.59 [Capital IQ export, Income Statement tab].

**Flag check:** DSO rising >10% YoY? FY24→FY25 +7.0% (below threshold); FY25→FY26 −20.3% (falling). Not triggered. DIO rising >15%? Not applicable. DPO "rising sharply"? The percentage move (+56% FY24→FY25, +30% FY25→FY26) technically looks large but the absolute base is sub-1-day and the AP balance is economically immaterial (₹13mn against ₹13,650mn of current liabilities) — **not treated as a genuine liquidity signal.**

**The metric that actually matters for this business is the deferred-revenue (contract-liability) trend, not DSO/DIO/DPO.** Total Unearned Revenue (current + non-current) grew every year: FY22 ₹9,070.38mn → FY23 ₹11,624.63mn → FY24 ₹14,399.81mn → FY25 ₹16,776.49mn → FY26 ₹19,652.60mn [FY26 Annual Report, Note 19; Capital IQ Balance Sheet tab]. Operating working capital (excluding cash/investments from current assets, per `01_historical-financials` fn.⁴) is **negative** ₹12,916.52mn at FY26 — the company is effectively financed by its own customers. Deferred-revenue growth (+17.1% FY26) currently outpaces recognised-revenue growth (+13.02% FY26), a forward-looking positive: bookings are still running ahead of recognition.

---

## 4. Non-GAAP Adjustments

**None disclosed.** A full-text search of the FY26 Annual Report for "adjusted EBITDA", "non-GAAP", "adjusted EPS" and "adjusted net profit" returned no matches [`IndiaMART_InterMESH_Limited_-_Form_Annual_Report(Apr-30-2026).pdf`, full-text search, 2026-08-13 — same search already run by `01_historical-financials` §4]. IndiaMART reports a single set of Ind AS consolidated GAAP figures; there is no management-adjusted overlay for the accrual-quality checklist to test against, and consequently no exclusion game (e.g., excluding Stock-Based Compensation from an "adjusted" number) is possible — SBC is fully expensed within Employee benefits expense in the reported GAAP P&L [FY26 Annual Report, Note 21: Employee share-based payment expense ₹366.20mn FY26 vs ₹187.44mn FY25, within total Employee benefits expense ₹6,928.25mn].

| Adjustment | Amount | Recurring? (Y/N) | Concern Level (Low/Mid/High) | Evidence |
|---|---:|---|---|---|
| Company-disclosed non-GAAP adjustment | None found | N/A | N/A | Full-text search, FY26 Annual Report, 2026-08-25 (no matches) |
| Stock-Based Compensation (fully in GAAP earnings, not excluded from anything) | ₹366.20mn (FY26), ₹187.44mn (FY25) — **+95.4% YoY**, rising from 3.65% to 7.03% of EBITDA | Y — recurring, and growing fast | Low (fully expensed, not hidden) but worth monitoring given the growth rate | [FY26 Annual Report, Note 21] |

CIQ separately carries a "Normalized Net Income" / "Normalized Diluted EPS" line (₹47.01 vs reported ₹78.77 diluted EPS, FY26) — this is Capital IQ's own vendor normalization, **not** company-disclosed, and its precise methodology is not documented in the workbook (already flagged in `01_historical-financials` §4). Not treated as an "adjustment" for scoring purposes here; carried forward to §7 for context only.

---

## 5. One-Off Items (last 3 years)

| Item | Period | Amount (₹mn) | Classification | Evidence |
|---|---|---:|---|---|
| Gain (Loss) On Sale Of Invest. (fair-value gain/realised gain on the ~₹30bn treasury book of mutual funds, ETFs, bonds) | FY24 / FY25 / FY26 | 2,047.16 / 2,669.22 / 1,906.51 | **Recurring "one-off"** — CIQ's own income-statement structure buckets this under "Unusual Items," but it has recurred, at material size, in every one of the last 5 years (FY22–FY26: 1,037.96 / 1,746.47 / 2,047.16 / 2,669.22 / 1,906.51) | [Capital IQ export, Income Statement tab, "Unusual Items" block; FY26 Annual Report, Note 20 "Other income" — Fair value gain (net) on mutual funds/ETFs/bonds ₹1,129.48mn + Fair value gain on Investment in other entities ₹777.03mn = ₹1,906.51mn FY26] |
| Merger & Related Restructuring Charges (Scheme of Amalgamation: Busy Infotech / Hello Trade / Tolexo) | FY23 only | −40.7 | Genuine one-off (isolated to FY23; ₹0 in FY22, FY24, FY25, FY26) | [Capital IQ export, Income Statement tab; FY26 Annual Report, Note 38 "Scheme of Amalgamation"] |
| Liabilities and provisions no longer required, written back | FY26 | +40.12 | Genuine one-off, small | [FY26 Annual Report, Note 20 "Other income"] |
| Income-tax / GST demands (Tolexo AY16-17, AY17-18; GST TRAN-1 credit dispute) | Ongoing, disclosed contingent liabilities, not yet in P&L | 302.68 (income tax) + 219.18 (GST) contingent, undiscounted | Genuine contingency — not recognised in P&L; management believes position defensible, no provision booked | [FY26 Annual Report, Note 36 "Contingent liabilities and commitments"] |
| Asset Writedown | FY24 / FY25 / FY26 | 4.82 / 0.46 / 0.16 | Genuine, immaterial | [Capital IQ export, Income Statement tab] |

**The material finding here is the first row.** The "investment gains" are legitimate under Ind AS (FVTPL fair-value-through-P&L accounting for the treasury book is mandatory, not a choice), fully disclosed in Note 20, and not fraudulent — but they are **not actually unusual**: they have appeared, at material size, in all 5 years reviewed. Labelling them "Unusual Items" (as CIQ's own income-statement structure does) is the exact "recurring one-off" trap this section exists to catch — carried into §7 and §8, and into the Section 10 finding below.

---

## 6. Accrual Quality Flags

| Flag | Triggered (Y/N) | Evidence |
|---|---|---|
| Revenue growing faster than CFO for 2+ years | **Y** (3 consecutive years) | Revenue growth FY24/25/26: 21.45% / 16.01% / 13.02%; CFO growth over the same years: 17.51% / 11.45% / 11.39% [Calc. from Capital IQ export]. **Context, not a red flag on its own:** CFO/EBITDA remains 121%–176% across these same 3 years (§2) — this reflects a *decelerating float benefit* (deferred-revenue growth cooling in line with the top line, §3), not receivables build-up or channel stuffing. |
| Receivables growing faster than revenue | N (isolated single-year exception, already reversed) | Receivables +40.3% in FY24 (vs revenue +21.45%) — the one year this triggers — but −29.9% in FY25→FY26... actually FY25 receivables +12.7% (below revenue +16.01%), and FY26 receivables −29.9% (revenue +13.02%). Only FY24 shows the pattern, and it fully reversed the following year [Capital IQ export, Balance Sheet tab]. |
| Inventory growing faster than COGS | N/A | No inventory — services business (§3). |
| Deferred revenue declining (subscription/contract business) | N | Unearned Revenue grew every year FY22–FY26 (₹9,070mn → ₹19,653mn), including +17.1% in FY26 alone, outpacing revenue growth (§3). This is the single strongest positive signal in this review. |
| Capitalized costs growing as % of revenue | N | Capex fell from 1.75% of revenue (FY23) to 0.45% (FY26); Other Intangibles balance declined every year FY22→FY26 (no fresh material capitalisation) [Capital IQ export, Balance Sheet / Cash Flow tabs]. |
| Frequent accounting policy changes | N | No change-in-accounting-policy or change-in-useful-life disclosures found in a full-text search of the FY26 Annual Report; only the routine FY25 Scheme of Amalgamation (a corporate restructuring, not a policy change) [FY26 Annual Report, Note 38]. |

**1 of 6 flags triggered — below the 2-flag threshold.** `RF-EQ-001 (rising accruals divergent from cash earnings)` is **not** emitted: cash conversion remains far above the healthy line throughout (§2), and the single triggered flag is explained by a decelerating (not reversing) structural cash source, not by classic accrual manipulation (receivables build, inventory build, or capitalized-cost inflation — all of which read N above).

---

## 7. Reported vs Adjusted Reconciliation

IndiaMART does **not** disclose company-defined adjusted metrics (§4). The one reconciliation the filings and CIQ workbook do support is between statutory Ind AS Profit Before Tax and CIQ's own "EBT Excl. Unusual Items" line, which strips out the recurring investment gains flagged in §5 — shown here because it directly quantifies how much of reported pre-tax profit is non-operating:

| Metric | Reported (Ind AS, statutory) FY26 | CIQ "Excl. Unusual Items" (vendor construction) FY26 | Difference | % of Reported | Recurring? | Evidence |
|---|---:|---:|---:|---:|---|---|
| Profit Before Tax (PBT / EBT) | 6,479.43 | 4,532.11 | 1,947.32 | 30.1% | **Y — has recurred every year FY22–FY26 despite CIQ's "unusual" label** | [FY26 Annual Report, Consolidated Statement of P&L; Capital IQ export, Income Statement tab, "EBT Incl./Excl. Unusual Items" rows] |
| Net Income | 4,746.82 | Not separately reconciled by CIQ on a tax-effected basis | — | — | — | [FY26 Annual Report] |
| EPS (diluted) | ₹78.77 | ₹47.01 (CIQ "Normalized Diluted EPS" — vendor construction, methodology not documented) | ₹31.76 | 40.3% | Directionally consistent with the PBT gap above, but not independently verifiable from the workbook's own documentation | [Capital IQ export, Income Statement tab — same figure already flagged in `01_historical-financials` §4] |
| EBITDA / EBIT | 5,205.94 / 5,015.93 | Not applicable — EBITDA/EBIT are computed on Revenue from Operations only and already exclude the investment gains (a "Total Income" line, not "Revenue from Operations," carries them) | — | — | — | [FY26 Annual Report; Capital IQ export] |

**Reading this table:** EBIT and EBITDA are already clean of the investment-gains distortion (they sit above the "Other income" line in the Ind AS P&L structure). It is PBT, Net Income and EPS that are materially inflated by a recurring, disclosed, non-operating item — 30% of PBT and roughly 40% of diluted EPS in FY26. Use EBIT/EBITDA, not EPS, as the primary earnings-quality read for this company (consistent with `01_historical-financials` §3's own flag on EPS volatility).

---

## 8. Accounting Trap Checklist

*(Severity /100 — higher = WORSE, inverted)*

| Trap | Triggered? (Y/N) | Evidence | Severity /100 |
|---|---|---|---:|
| Stock-based compensation excluded from adjusted earnings | N — no adjusted earnings exist; SBC is fully in GAAP earnings | [FY26 Annual Report, Note 21] | 10 (SBC growing +95.4% YoY, worth monitoring, but not hidden) |
| Restructuring costs recur every year | N | One-off in FY23 only, ₹0 in all other years (§5) | 5 |
| Capitalized costs rising faster than revenue | N | Capex and intangibles both falling as % of revenue (§6) | 5 |
| Receivable factoring / supplier finance disclosed | N | No such disclosure found in the FY26 Annual Report | 5 |
| Inventory write-downs or reserve releases | N/A | No inventory (§3) | 0 |
| Revenue recognized before cash collection risk is clear | N — opposite pattern: cash collected before revenue is recognised | Unearned Revenue growing every year (§3, §6) | 5 |
| Change in useful life / depreciation assumptions | N | No such disclosure found | 5 |
| Tax rate unusually low or boosted by one-off | Y (Low confidence) | Effective tax rate: FY22 23.77%, FY23 23.55%, FY24 26.50%, **FY25 21.98%**, FY26 26.74% [Capital IQ export, Income Statement tab, "Effective Tax Rate %"]. FY25's dip sits ~3pp below the ~25% band the other 4 years cluster around, with no specific one-off tax event disclosed in the notes reviewed — flagged conservatively per CLAUDE.md §4, not confirmed | 20 |
| Large fair-value / mark-to-market gains | **Y** | ₹1,906.51mn FY26 / ₹2,669.22mn FY25 / ₹2,047.16mn FY24 gains on the treasury book, recurring every year, 30% of FY26 PBT (§5, §7) | 60 |

---

## 9. Earnings Quality Score

**Score: 72/100** (Strong / low risk band, 61–80).

Single most important reason: cash conversion is exceptional and structural — CFO has exceeded EBITDA in every one of the last 5 years (121%–182%), funded by a prepayment-based subscription model with deferred revenue that has never declined (§2, §3) — but a materially large and *recurring* (not truly "unusual," despite CIQ's own labelling) share of reported Profit Before Tax and diluted EPS — roughly 30% and 40% respectively in FY26 — comes from mark-to-market/realised gains on the company's ~₹30bn treasury investment book (§5, §7). This is fully disclosed, Ind AS-compliant, and not deceptive, but it makes headline Net Income/EPS a meaningfully noisier earnings-quality signal than EBIT/EBITDA, which is what caps the score below the 81–100 band.

---

## 10. The Single Biggest Quality Concern

The single biggest risk that reported earnings could overstate the "real" economic picture is not accrual manipulation or aggressive revenue recognition — both read clean (§6) — it is that **a fixed, recurring, non-operating slice of profit and EPS (~30% of PBT, ~40% of diluted EPS in FY26) comes from gains on a large treasury investment book that Capital IQ's own income-statement structure classifies as "unusual," even though it has appeared in every one of the last 5 fiscal years** (§5, §7). Because this gain is market-linked (fair-value-through-P&L on mutual funds, ETFs, bonds and other investments), it is inherently more volatile than the operating business — visible in the quarterly EPS swings already flagged upstream (₹31.24 → ₹8.33 → ₹28.56 across three consecutive quarters, `01_historical-financials` §3) — and a market drawdown or a shift in treasury allocation could shrink or reverse it independent of how the core marketplace is performing. A reader relying on headline diluted EPS as the earnings-quality anchor for this company would be misreading its trend; EBIT and EBITDA, which exclude this item entirely, are the cleaner reads.
