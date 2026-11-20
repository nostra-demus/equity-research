# Capital Structure & Leverage — TTWO

**Company:** Take-Two Interactive Software, Inc. (NasdaqGS:TTWO) · **Date:** 2026-11-19
**Reporting currency:** **USD, in millions** unless stated. **Reporting standard: US GAAP.** Fiscal year ends **31 March** (so "FY2026" = year ended 2026-03-31, and the latest balance sheet is the quarter ended **2026-09-30**, which is Q2 of FY2027).
**Filing regime:** US SEC — Form 10-K (annual), Form 10-Q (quarterly).

**Standing verification note carried forward from `00_solvency-data-triage.md` §5.** All 30 manifest sources in this frozen generation carry **no `numeric_reading_check` field at all** — they are **unchecked, not verified clean** — and no labelled extractor warning annotation appears in `GENERATION_ROOT/corpus.txt`, so there is no specific flagged amount to quarantine. The duty that transfers: **every material amount in this report was read directly from the frozen filing extract that reports it** — `10Q_2Q_0001628280-26-072254.txt` (Q2 FY27 10-Q), `10K_2025_26_0001628280-26-037434.txt` (FY26 10-K), `10K_2024_25_0001628280-25-026694.txt` (FY25 10-K) — and the Capital IQ workbook tabs are used only as a vendor **read to reconcile against**, never as the authority for a filing's own number (CLAUDE.md §5). Where a figure is vendor-sourced it is labelled as such. Every restating layer downstream must carry this unchecked-source qualifier forward.

Cross-module inputs used: `earnings/01_historical-financials.md` (leverage trend cross-check), `business-model/11_capital-allocation-governance.md` (how the debt got here), `business-model/07_business-quality.md` (cyclicality classification — Cyclicality score **22/100**, Weak, so the mid-cycle leverage rows below are mandatory per MODULE_RULES Calculation Standard 4). Valuation is deliberately not read (MODULE_RULES Cross-Module Inputs).

---

## 1. Debt Stack

All amounts as of **2026-09-30** (Q2 FY27 10-Q, Note 10 "Debt" and Condensed Consolidated Balance Sheets). "Entity" = which legal entity owes the money.

| Instrument | Amount | Entity (HoldCo/OpCo) | Secured? | Seniority | Collateral | Maturity | Rate (fixed/floating) | Source |
|---|---:|---|---|---|---|---|---|---|
| **Short-term debt, net (balance-sheet line)** | **629.2** | — | — | — | — | within 12 months | — | `Q2 FY27 10-Q, Condensed Consolidated Balance Sheets` |
| — 2027 Notes (reclassified to current) | 600.0 face (fair value 596.1) | Take-Two Interactive Software, Inc. (parent/issuer) | **No** — unsecured | Senior unsecured; "rank equally with all of our other existing and future unsubordinated obligations" | None | **2027-04-14** | **Fixed 3.70%** | `Q2 FY27 10-Q, Note 10 (Debt)` |
| — 2026 Convertible Notes (assumed with Zynga) | 29.4 principal; carried at **fair value 29.8** (ASC 825 fair-value option, Level 2) | **Zynga Inc. (OpCo subsidiary)**, guaranteed by Take-Two | **No** — unsecured | Senior unsecured obligation **of Zynga**, pari passu with Zynga's other senior unsecured unsubordinated obligations; therefore **structurally senior** to Take-Two's own debt as to Zynga and its assets | None | **2026-12-15** (within weeks of this report) | **Fixed 0.00%** (no regular interest; principal does not accrete) | `Q2 FY27 10-Q, Note 10 (Debt)`; `FY26 10-K, Note 11 (Debt)` |
| — less unamortized discount & issuance cost | (0.6) | — | — | — | — | — | — | `Q2 FY27 10-Q, Note 10 (Debt)` |
| **Long-term debt, net (balance-sheet line)** | **1,890.6** | — | — | — | — | — | — | `Q2 FY27 10-Q, Condensed Consolidated Balance Sheets` |
| — 2028 Notes | 800.0 face (fair value 796.5) | Take-Two (parent) | No | Senior unsecured | None | 2028-03-28 | Fixed 4.95% | `Q2 FY27 10-Q, Note 10 (Debt)` |
| — 2029 Notes | 300.0 face (fair value 298.3) | Take-Two (parent) | No | Senior unsecured | None | 2029-06-12 | Fixed 5.40% | `Q2 FY27 10-Q, Note 10 (Debt)` |
| — 2032 Notes | 500.0 face (fair value 454.8) | Take-Two (parent) | No | Senior unsecured | None | 2032-04-14 | Fixed 4.00% | `Q2 FY27 10-Q, Note 10 (Debt)` |
| — 2034 Notes | 300.0 face (fair value 289.6) | Take-Two (parent) | No | Senior unsecured | None | 2034-06-12 | Fixed 5.60% | `Q2 FY27 10-Q, Note 10 (Debt)` |
| — less unamortized discount & issuance cost | (9.4) | — | — | — | — | — | — | `Q2 FY27 10-Q, Note 10 (Debt)` |
| **Revolver (drawn)** | **Nil drawn** on a **$1,000.0 committed** unsecured five-year revolving facility; **$997.9 available**; $2.1 of letters of credit outstanding | Take-Two (Borrower under the 2022 Credit Agreement) | **No** — unsecured | Senior unsecured | None | **2030-05-19**, with two one-year extension options | **Floating** — 0.000–0.625% over an alternate base rate (7.00% at 2026-09-30) **or** 1.000–1.625% over SOFR (~3.91% at 2026-09-30); the spread is **set by the Company's credit rating** | `Q2 FY27 10-Q, Note 10 (Debt) — Credit Agreement`; `FY26 10-K, Note 11 (Debt) — Credit Agreement` |
| **Finance / capital leases** | **None.** The phrase "finance lease" does not appear anywhere in the FY26 10-K (0 occurrences); all leases are **operating** leases | n/a | n/a | n/a | n/a | n/a | n/a | Direct read of `FY26 10-K` (frozen extract) |
| **Total gross debt — face value of borrowings** | **2,529.8** | — | — | — | — | — | — | `Q2 FY27 10-Q, Note 10 (Debt)` maturities table: Total 2,529.4 + fair-value adjustments 0.4 = **Total face value 2,529.8** |
| **Total gross debt — balance-sheet carrying value** | **2,519.8** | — | — | — | — | — | — | 629.2 + 1,890.6, both read off the `Q2 FY27 10-Q, Condensed Consolidated Balance Sheets` |

**Ties to the balance sheet.** Short-term debt, net $629.2 **plus** long-term debt, net $1,890.6 **equals $2,519.8**, which is the sum of the two debt lines printed on the Q2 FY27 10-Q balance sheet — no residual. The $10.0 gap to the $2,529.8 face value is the $9.4 + $0.6 of unamortized discount and issuance cost, plus the $0.4 fair-value adjustment on the convertible. Senior Notes principal alone is **$2,500.0** ("As of September 30, 2026, we had $2,500.0 of Senior Notes outstanding" — `Q2 FY27 10-Q, Item 2 MD&A`).

**Everything is unsecured and all borrowings are fixed-rate.** No collateral is pledged against any borrowing in either filing, and every note carries a fixed coupon; the only floating-rate instrument in the structure is the **undrawn** revolver. The vendor export agrees: "0 floating / 2,970 fixed" [`ciq_facts.json` → `debt_maturity_wall`, from `CIQ Financials → Capital Structure Details` — tier-5 vendor export]. Weighted-average coupon on the $2,500.0 of Senior Notes = (600×3.70 + 800×4.95 + 300×5.40 + 500×4.00 + 300×5.60) ÷ 2,500 = 11,480 ÷ 2,500 = **4.59%** (my arithmetic from the coupons in `Q2 FY27 10-Q, Note 10`).

**One vendor-convention difference to note, not a conflict.** `CIQ Financials_Quarterly → Capital Structure Details` lists "Operating Lease Liabilities 440.3, Secured: Yes" alongside the notes [vendor export, as-reported FY2026 block, `Source: Q2 2027 filed Nov-09-2026`]. That is the vendor treating the leased asset as collateral for the lease; the **filings disclose no secured borrowings**. The $440.3 is also the **2026-03-31** lease liability, not the latest — at 2026-09-30 it is $391.6 (see §2).

---

## 2. Other Debt-Like Obligations

| Obligation | Amount | Treatment | Source |
|---|---:|---|---|
| **Operating leases** | **391.6** at 2026-09-30 (current lease liabilities 66.9 + non-current 324.7). At 2026-03-31: 440.3 (70.1 + 370.2) | **US GAAP, so these sit on the balance sheet as separate "Lease liabilities" lines and are NOT inside the debt line or the borrowings-maturity table.** Under IFRS 16 they would be inside the debt figure. §4 and §5 below therefore show gross debt **both ways**, labelled. The FY26 lease note gives total undiscounted future payments of **548.5**, less imputed interest **(108.2)** = liability **440.3**; weighted-average remaining lease term **7.14 years**, weighted-average discount rate **4.74%**. One facility lease with future payments of ~**2.4** had not yet commenced at 2026-03-31 | `Q2 FY27 10-Q, Condensed Consolidated Balance Sheets`; `FY26 10-K, Note 13 (Leases)` |
| **Pension / OPEB underfunding** | **No funded status is disclosed, and no defined-benefit deficit is presented.** Employer contributions under **all** defined-contribution and pension plans were **55.1** (FY2026), 51.4 (FY2025), 43.0 (FY2024) | The FY26 10-K describes a US **401(k) defined-contribution** plan plus "various pension plans for our non-U.S. employees, some of which are required by local laws". No projected benefit obligation, plan assets or funded status is presented anywhere in the filing, and both `CIQ Financials_Annual → Pension-OPEB` (21×11) and `CIQ Financials_Quarterly → Pension-OPEB` (15×6) are **header-only with no defined-benefit data rows**. Treatment: **nothing added to debt.** Honest qualifier — the filing's reference to non-US "pension plans" without a funded status means a small defined-benefit element cannot be fully ruled out from this pool; it is **not disclosed**, not proven absent | `FY26 10-K, Note 14 (Commitments and Contingencies) — Employee Savings Plans`; `CIQ Financials_Annual/_Quarterly → Pension-OPEB` (vendor export, empty) |
| **Preferred equity** | **Nil.** Preferred stock, $0.01 par value, 5.0 shares authorized; **no shares issued and outstanding** at 2026-09-30 and 2026-03-31 | Nothing added to debt | `Q2 FY27 10-Q, Condensed Consolidated Balance Sheets` |
| **Non-current software development royalties** | 72.1 at 2026-09-30 (84.5 at 2026-03-31) | A trade-type obligation, not interest-bearing debt. **Not** added to gross debt. Noted so the reader can see it was considered | `Q2 FY27 10-Q, Condensed Consolidated Balance Sheets` |

Minimum contractual commitments ($740.1 total at 2026-03-31) and contingencies belong to `05_off-balance-sheet-and-contingencies` and are not debt-stack items here.

---

## 3. Cash & Liquid Assets

All as of **2026-09-30**.

| Item | Amount | Restricted? | Source |
|---|---:|---|---|
| **Cash & equivalents** | **1,149.4** (2026-03-31: 1,545.5) | No | `Q2 FY27 10-Q, Condensed Consolidated Balance Sheets` |
| **Liquid short-term investments** | **524.2** (2026-03-31: 443.8) | No — but **not cash equivalents**: "primarily consisted of **bank time deposits with maturities greater than 90 days**", carried at amortized cost with zero unrealized gain or loss | `Q2 FY27 10-Q, Note 5 (Short-Term Investments)`; `Q2 FY27 10-Q, Item 2 MD&A` |
| **Restricted cash — current** | **15.0** (2026-03-31: 13.2) | **Yes — flagged, and excluded from every net-debt figure below** | `Q2 FY27 10-Q, Condensed Consolidated Balance Sheets` |
| **Restricted cash — long-term** | **68.0** (2026-03-31: 79.4) | **Yes — flagged and excluded.** Restricted cash totals **83.0** at 2026-09-30 | `Q2 FY27 10-Q, Condensed Consolidated Balance Sheets` |
| *What the restriction is* | — | "Our restricted cash and cash equivalents balances are **primarily related to dedicated accounts limited to the payment of certain internal royalty obligations.** Balances that are restricted from use for more than one year are classified as non-current." | `FY26 10-K, Note 1 (Basis of Presentation) — Cash and Cash Equivalents` |
| **Offshore cash — concentration flag (not a disclosed restriction)** | **945.0** of the 1,149.4 of cash & equivalents, i.e. **82.2%**, is held **outside the United States by foreign subsidiaries** | **Not** described as trapped. The filing says the balances "are dispersed across various locations around the world… such dispersion meets the business and liquidity needs of our foreign affiliates. In addition, we expect to have the ability to generate sufficient cash domestically to support ongoing operations for the foreseeable future." No dividend blocker, repatriation restriction or regulatory block is disclosed. Recorded as a **concentration to monitor**, not netted out | `Q2 FY27 10-Q, Item 2 MD&A — Financial Condition` |
| **Gross liquidity (basis label per §15): cash + liquid short-term investments, no debt netted** | **1,673.6** (1,149.4 + 524.2) | Excludes the 83.0 of restricted cash and excludes the undrawn revolver (that is `03`'s work) | Build shown; components from `Q2 FY27 10-Q, Condensed Consolidated Balance Sheets` |

---

## 4. Gross & Net Debt

As of **2026-09-30**, USD millions. Gross debt here is **borrowings at balance-sheet carrying value ($2,519.8)**; the face-value variant ($2,529.8) is shown alongside because it is the number the maturity schedule is built on.

| Metric | Value | Source |
|---|---:|---|
| **Gross debt — borrowings only, carrying value** | **2,519.8** | 629.2 + 1,890.6 [`Q2 FY27 10-Q, Condensed Consolidated Balance Sheets`] |
| *Gross debt — borrowings only, face value (memo)* | *2,529.8* | `Q2 FY27 10-Q, Note 10 (Debt)` maturities table, "Total face value" |
| *Gross debt — borrowings PLUS operating-lease liabilities (the IFRS-16-equivalent view; memo)* | *2,911.4* | 2,519.8 + 391.6 lease liabilities [`Q2 FY27 10-Q, Condensed Consolidated Balance Sheets`] — this is also exactly the vendor's "Total Debt" of 2,911.4 [`ciq_facts.json` → `total_debt_m`, `CIQ Financials → Balance Sheet` FQ2 Sep-30-2026] |
| − Cash & equivalents | (1,149.4) | `Q2 FY27 10-Q, Condensed Consolidated Balance Sheets` |
| **Net debt (strict, §15) — gross debt − cash & equivalents** | **1,370.4** | 2,519.8 − 1,149.4. **This is the module's canonical figure** (see §7). On face-value debt the strict figure is 1,380.4 |
| − Liquid short-term investments | (524.2) | `Q2 FY27 10-Q, Note 5 (Short-Term Investments)` |
| **Net debt (broad, incl. short-term investments)** | **846.2** | 1,370.4 − 524.2 |
| *Net debt (broad **and** lease-inclusive) — the vendor's basis* | *1,237.8* | `ciq_facts.json` → `net_debt_m` = 1,237.8 [`CIQ Financials → Balance Sheet` 'Net Debt', FQ2 Sep-30-2026 — the sidecar's own `source_ref` warns this is a CIQ vendor basis that may net short-term/liquid investments] |

**Reconciliation of the vendor's $1,237.8 to the strict $1,370.4 — it is a definitional difference, not a misread.** The ~$1.67bn of implied netting that the triage flagged resolves exactly, with no residual:

> strict 1,370.4 − short-term investments 524.2 + operating-lease liabilities 391.6 = **1,237.8** ✔

Equivalently, from the vendor side: (borrowings 2,519.8 + leases 391.6) − (cash 1,149.4 + short-term investments 524.2) = 2,911.4 − 1,673.6 = **1,237.8** ✔. So the vendor figure is **broad on the cash side AND lease-inclusive on the debt side** — two departures from §15 in the same number. It is reported above with both labels attached, as §15 requires, and it is **not** the canonical figure. `earnings/01_historical-financials.md` §1 reaches the identical reconciliation independently.

The strict basis is the §15 default and is the right default here for a second reason: $524.2m of the liquidity sits in bank time deposits with maturities over 90 days, which the company itself classifies outside cash equivalents.

---

## 5. Leverage Ratios

### 5a. The EBITDA bases, stated before they are used

There is **no reported (GAAP) EBITDA** for this company, because US GAAP has no EBITDA line and TTWO's GAAP operating result is a **loss**:

| GAAP profit anchor | Value | Source |
|---|---:|---|
| Income (loss) from operations, FY2026 | **(104.2)** | `FY26 10-K, Consolidated Statements of Operations` |
| Loss from operations, six months to 2026-09-30 | **(153.0)** | `Q2 FY27 10-Q, Condensed Consolidated Statements of Operations` |
| Loss from operations, six months to 2025-09-30 | (76.4) | `Q2 FY27 10-Q, Condensed Consolidated Statements of Operations` |
| **GAAP operating loss, LTM to 2026-09-30** (engine bridge: −104.2 − (−76.4) + (−153.0)) | **(180.8)** | My arithmetic from the three filing figures above |

So any "debt ÷ reported GAAP operating profit" ratio has a **negative denominator and is not meaningful**. Every leverage multiple below therefore rests on a **non-GAAP EBITDA**, and that qualifier must travel with the number at every layer (§3).

| EBITDA base | Value | What it is, and how it was built |
|---|---:|---|
| **(A) Company-defined EBITDA, LTM to 2026-09-30** | **677.6** | **The company's own published non-GAAP definition:** "GAAP net income (loss) excluding interest income (expense), provision for (benefit from) income taxes, depreciation expense, and amortization and impairment of **acquired** intangibles" [`Q2 FY27 earnings release, 2026-11-09, Non-GAAP Financial Measure`]. Company-disclosed on that definition: **H1 FY27 (six months to 2026-09-30) = 259.2**; H1 FY26 = 342.2; Q1 FY27 = 167.0; Q2 FY27 = 92.2 [`Q2 FY27 earnings release, Reconciliation of GAAP to Non-GAAP Measure`; `Q1 FY27 earnings release, 2026-08-06, same table`]. The company does **not** publish a FY2026 full-year EBITDA in this pool, so **FY2026 = 760.6 is my own build on the company's stated definition, from the FY26 10-K's own lines**: net loss (298.2) + income taxes 100.4 + interest expense 151.4 − interest income (85.1) + depreciation 166.4 + amortization and impairment of intangibles 725.7 = **760.6** [`FY26 10-K, Consolidated Statements of Operations`; `FY26 10-K, Consolidated Statements of Cash Flows`; `FY26 10-K, Note 17 (Interest and Other, Net)`; `FY26 10-K, Note 9` total intangible amortization 725.7]. **LTM bridge: 760.6 − 342.2 + 259.2 = 677.6.** Labelled **engine-computed**, not company-reported |
| **(B) Vendor EBITDA, LTM to 2026-09-30** | **724.9** | `ciq_facts.json` → `ltm_ebitda_m` = **724.9** [`CIQ Financials → Income Statement` 'EBITDA', LTM 12 months Sep-30-2026 — tier-5 vendor export]. My own read of that workbook tab matches 724.9 exactly, so there is **no misread to flag**. FY2026 on the same vendor basis = 788.5 |
| **(C) Mid-cycle / normalised EBITDA** | **565.3** | Five-year average of the company's own annual EBITDA on the vendor basis, FY2022–FY2026: (671.0 + 555.5 + 432.2 + 379.5 + 788.5) ÷ 5 = 2,826.7 ÷ 5 = **565.3** [`CIQ Financials_Annual → Income Statement`, EBITDA row — vendor export; my arithmetic]. Chosen over the ten-year average ($471.8m, computed in `business-model/07_business-quality.md §6`) because the pre-FY2022 years predate the Zynga acquisition and describe a company roughly half today's revenue |
| **(D) Company-guided FY2027 EBITDA — the coming peak (forward, not realised)** | **1,024 to 1,082** (midpoint **1,053**) | `Q2 FY27 earnings release, 2026-11-09, Outlook — Fiscal Year Ending March 31, 2027`, reconciled from guided net income $109–142 + taxes $86–111 + net interest expense $41 + depreciation $165 + amortization of acquired intangibles $623. **A company forecast, not a reported period** — use only as a labelled forward cross-check |

**(A) vs (B) — the reconciliation, and which one leads.** My filing-derived company-definition figure is **$47.3m (6.5%) below** the vendor's LTM EBITDA (677.6 vs 724.9), and $27.9m (3.5%) below it at FY2026 (760.6 vs 788.5). Both gaps run the same way. Per §4/§5 the **filing-derived figure (A) leads** for the headline, because it is built from the audited filing's own lines on the company's own published definition; the vendor figure (B) is cited for its own number and is **not overridden** — both are shown on every ratio below so the reader can see the spread. A separate vendor inconsistency, named: `CIQ Financials_Annual → Ratios` reports Total Debt/EBITDA of **3.639x** and Net Debt/EBITDA of **1.547x** for the LTM column, which implies a denominator of ~$799.9m, not $724.9m — at FY2026 the same tab's implied denominator is **exactly $868.1m, which is that tab's own EBITDA**R** line** (EBITDA before rent). So the vendor's Ratios tab is computed on **EBITDAR**, which is why it prints lower leverage. I use EBITDA, not EBITDAR, throughout.

**What neither EBITDA base adds back, and why that matters.** Both (A) and (B) add back amortization of **acquired** intangibles but **not** amortization of capitalized game-development costs ($412.8 in FY2026, $190.8 in H1 FY27) [`FY26 10-K, Consolidated Statements of Cash Flows`; `Q2 FY27 10-Q, Condensed Consolidated Statements of Cash Flows`]. That is the conservative treatment and it is the right one, because the company spent **$688.9m of cash on software development costs and licenses in FY2026** and $372.4m in H1 FY27 on the same line. A "standard" EBITDA that added **all** depreciation and amortization back to the FY2026 operating loss would read (104.2) + 166.4 + 725.7 + 412.8 = **$1,200.7m** and would cut gross leverage to 2.1x — that number is **not used here**, because it would add back an amortization charge matched by a larger recurring cash outflow.

### 5b. The ratios

Gross debt = **2,519.8** (borrowings, carrying value). Net debt = **1,370.4** (**strict §15 basis** — the canonical figure). Lease-inclusive variants shown in brackets where material. Higher = worse on every row.

| Ratio | On Reported EBITDA | On Adjusted EBITDA | Source |
|---|---:|---:|---|
| **Gross debt / EBITDA** | **Not meaningful** — no GAAP EBITDA exists; the nearest reported measure is the **LTM GAAP operating loss of (180.8)**, a negative denominator | **3.72x** on (A) company-defined LTM EBITDA 677.6 · **3.48x** on (B) vendor LTM EBITDA 724.9 · [lease-inclusive: 4.30x on (A), 4.02x on (B)] | 2,519.8 ÷ 677.6 = 3.72x; 2,519.8 ÷ 724.9 = 3.48x; 2,911.4 ÷ 677.6 = 4.30x; 2,911.4 ÷ 724.9 = 4.02x. Inputs per §4 and §5a |
| **Net debt / EBITDA** (**strict** net debt 1,370.4) | **Not meaningful** (as above) | **2.02x** on (A) · **1.89x** on (B) · [lease-inclusive, strict cash: 2.60x on (A), 2.43x on (B)] | 1,370.4 ÷ 677.6 = 2.02x; 1,370.4 ÷ 724.9 = 1.89x |
| *Net debt / EBITDA on the **broad** basis (846.2) — shown for completeness, not canonical* | *Not meaningful* | *1.25x on (A) · 1.17x on (B)*. The vendor's own broad-**and**-lease-inclusive figure: **1.71x** [`ciq_facts.json` → `net_debt_ebitda_x` = 1,237.8 ÷ 724.9] | 846.2 ÷ 677.6 = 1.25x; 846.2 ÷ 724.9 = 1.17x |
| **Debt / capital** | — | **40.7%** on borrowings-only · [lease-inclusive **44.2%**] | 2,519.8 ÷ (2,519.8 + 3,673.6 equity) = 2,519.8 ÷ 6,193.4 = 40.7%. Lease-inclusive: 2,911.4 ÷ 6,585.0 = 44.2% — which matches `CIQ Financials_Annual → Ratios` 'Total Debt/Capital' 0.442126 for the LTM column exactly [vendor export] |
| **Debt / equity** | — | **68.6%** on borrowings-only · [lease-inclusive **79.3%**] | 2,519.8 ÷ 3,673.6 = 68.6%. Lease-inclusive: 2,911.4 ÷ 3,673.6 = 79.3% — matches `CIQ Financials_Annual → Ratios` 'Total Debt/Equity' 0.792519 exactly [vendor export] |

**Cycle-position rows — mandatory here, because `business-model/07_business-quality.md` scores Cyclicality 22/100 (Weak) and classifies TTWO as "a cyclical, hit-driven owner of entertainment intellectual property".** The dominant cycle is the **release slate**, not the economy: FY26 revenue rose $1,022.8m (+18.2%) on five named franchise launches, then Q2 FY27 net bookings fell **18%** to $1,601.3m "simply because the company sat between launches" [`business-model/07_business-quality.md`, citing `FY26 10-K, MD&A` and `Q2 FY27 earnings release, 2026-11-09`].

| Net debt / EBITDA by cycle position (strict net debt 1,370.4) | Multiple | Cycle label |
|---|---:|---|
| On (D) company-guided FY2027 EBITDA, midpoint 1,053 | **1.30x** | **Coming peak** — the Grand Theft Auto VI launch year (title released **2026-11-19**). Forward company guidance, not realised |
| On (B) vendor LTM EBITDA to 2026-09-30, 724.9 | **1.89x** | **Latest — between launches.** Not the peak: 8.1% below FY2026's 788.5, and the whole LTM window sits **before** the GTA VI launch |
| On (A) company-defined LTM EBITDA, 677.6 | **2.02x** | **Latest — between launches**, on the filing-built company definition |
| On (C) mid-cycle / normalised EBITDA, 565.3 | **2.42x** | **Mid-cycle / normalised** — the company's own five-year average EBITDA. This is the central estimate; the 1.30x above is a floor, not a forecast |

So the honest range is **1.30x at the guided peak to 2.42x through the cycle**, with the latest realised reading at **1.89–2.02x**. A single-year figure headlined on its own would mislead in either direction here — and the direction is unusual: the latest period is *between* launches, so **the peak lies ahead, not behind**, which is the opposite of the usual cyclical trap.

---

## 6. Leverage Trend

Strict basis throughout (gross borrowings at carrying value − cash & equivalents). Every debt and cash figure below is read from the filings' own balance sheets and debt notes; the EBITDA row is the vendor series, labelled, because the company publishes no annual EBITDA.

| Metric | FY2024 (2024-03-31) | FY2025 (2025-03-31) | FY2026 (2026-03-31) | Latest (2026-09-30) | Direction |
|---|---:|---:|---:|---:|---|
| Gross debt (borrowings, carrying) | 3,082.9 | 3,661.1 | 2,518.0 | 2,519.8 | Fell 31.2% FY25→FY26, flat since |
| Cash & equivalents | 754.0 | 1,456.1 | 1,545.5 | 1,149.4 | Rose, then fell 25.6% in H1 FY27 |
| **Net debt (strict §15 basis)** | **2,328.9** | **2,205.0** | **972.5** | **1,370.4** | **Fell sharply, then rose again** |
| *Net debt (broad basis, memo)* | *2,306.9* | *2,195.6* | *528.7* | *846.2* | *Same shape* |
| EBITDA (vendor basis, annual / LTM) | 432.2 | 379.5 | 788.5 | 724.9 | — |
| **Net debt / EBITDA** (strict ÷ vendor EBITDA) | **5.39x** | **5.81x** | **1.23x** | **1.89x** | **Down then back up** |
| *Gross debt / EBITDA (same bases, memo)* | *7.13x* | *9.65x* | *3.19x* | *3.48x* | *Same shape* |
| Total stockholders' equity | 5,667.9 | 2,137.7 | 3,510.9 | 3,673.6 | Collapsed on impairments, then rebuilt by issuing shares |
| Operating-lease liabilities (off the debt line, US GAAP) | 451.1 | 444.8 | 440.3 | 391.6 | Slowly declining |

Sources: FY2024 and FY2025 balance sheets from `FY25 10-K, Consolidated Balance Sheets`; FY2026 from `FY26 10-K, Consolidated Balance Sheets` and `FY26 10-K, Note 11 (Debt)`; latest from `Q2 FY27 10-Q, Condensed Consolidated Balance Sheets` and `Note 10 (Debt)`; EBITDA row from `CIQ Financials_Annual → Income Statement`, EBITDA row, with the LTM value pinned at 724.9 by `ciq_facts.json` [vendor export]. The FY2024–FY2026 net-debt and leverage series matches `earnings/01_historical-financials.md` §1 line-for-line (2,328.9 / 2,205.0 / 972.5 and 5.39x / 5.81x / 1.23x), which reached them independently.

**Leverage more than halved in FY2026 and has since given back about a third of that, and the two moves had completely different causes.** The FY2026 fall from 5.81x to 1.23x came from **repaying $1,150.0m of notes — the $600.0m 2025 Notes on 2025-04-14 and the $550.0m 2026 Notes on 2026-03-28 — "with proceeds from our May 2025 equity issuance"** (5.5m shares at $225.00, net proceeds $1,192.8m), alongside EBITDA rising from 379.5 to 788.5 and operating cash flow swinging from $(45.2)m to $+624.3m [`Q2 FY27 10-Q, Note 10 (Debt)`; `FY26 10-K, Note 12`; `FY26 10-K, Consolidated Statements of Cash Flows`; `CIQ Financials_Annual → Income Statement` for EBITDA]. That is debt retired with **shareholders' money, not operating cash** — the point `business-model/11_capital-allocation-governance.md` makes, and the reason the share count rose 61.7% from 115.8m (2022-03-31) to 187.2m with **zero buybacks in FY2024, FY2025 and FY2026** [`FY26 10-K, Item 5`; `CIQ Historical Capitalization` — vendor export].

**The rise since — $397.9m of it — is all cash burn, no new borrowing, and it reconciles exactly.** Net debt went from 972.5 to 1,370.4, a rise of **397.9**, built as: cash & equivalents fell **396.1** (1,545.5 → 1,149.4) plus gross carrying debt rose **1.8** (2,518.0 → 2,519.8, purely discount amortization and the convertible's fair-value mark). The cash fall itself reconciles with no residual: operating cash flow **(173.5)** + investing **(259.9)** + financing **+30.4** + FX **(2.7)** = **(405.7)** total change in cash *and restricted cash*, less the **(9.6)** fall in restricted cash (92.6 → 83.0) = **(396.1)** ✔ [`Q2 FY27 10-Q, Condensed Consolidated Statements of Cash Flows`; balance-sheet lines as above]. Inside the investing figure, **$80.4m simply moved from cash into bank time deposits** — which is why the broad basis rose less (528.7 → 846.2, a rise of 317.5), and 397.9 − 317.5 = **80.4** ✔, the same number. The real cash drains were the **negative $(173.5)m of operating cash flow** in the six months and **$163.3m of fixed-asset purchases** (which includes buying the London office building the company had been leasing, for a total capitalized cost of $91.8m on 2026-08-10) [`Q2 FY27 10-Q, Note on subsequent/other transactions, p.1036 of extract`]. **Nothing in the rise is new debt.**

---

## 6A. HoldCo / OpCo & Structural Subordination

**Applicable, but small and about to disappear.**

| Item | Evidence | Why It Matters |
|---|---|---|
| **Where debt sits (HoldCo vs OpCo)** | **$2,500.0 of Senior Notes (98.8% of borrowings) and the $1,000.0 revolver sit at the parent, Take-Two Interactive Software, Inc.** — "the Company's senior unsecured obligations [which] rank equally with all of our other existing and future unsubordinated obligations" [`Q2 FY27 10-Q, Note 10 (Debt) — Senior Notes`]. The one exception: the **$29.4 of 2026 Convertible Notes are "senior unsecured indebtedness of Zynga, ranking pari passu with all of our other existing and future senior unsecured unsubordinated obligations of Zynga. As a result, the 2026 Convertible Notes are structurally senior to the indebtedness of the Company as to Zynga, its subsidiaries, and their respective assets."** Take-Two guarantees them, and that guarantee "rank[s] equally with all of" Take-Two's other senior unsecured obligations [`FY26 10-K, Note 11 (Debt) — Convertible Notes`] | **Structural subordination exists and is disclosed, and it is 1.2% of gross borrowings ($29.4 of $2,529.8). It matures 2026-12-15** — within weeks of this report — after which the structure is, on this pool's evidence, entirely parent-level unsecured. The subsidiaries named in the vendor profile (Zynga, Gearbox, Platygobian) issue no other debt disclosed in the filings [`CIQ Public Company Profile` — vendor export] |
| **Upstreaming constraints (dividend blockers, regulatory)** | **No dividend blocker, repatriation restriction or regulatory upstreaming block is disclosed in either filing.** The 2022 Credit Agreement's negative covenants run the other way — they "limit or restrict the Company and its subsidiaries' ability to… incur **subsidiary indebtedness**, grant liens, and dispose of all or substantially all assets" [`FY26 10-K, Note 11 (Debt) — Credit Agreement`]. On cash location the company states only that the $945.0 held abroad "is dispersed across various locations around the world… such dispersion meets the business and liquidity needs of our foreign affiliates. In addition, we expect to have the ability to generate sufficient cash domestically to support ongoing operations for the foreseeable future" [`Q2 FY27 10-Q, Item 2 MD&A`] | The debt is at the entity that owns the group, so there is no HoldCo-cannot-reach-the-cash problem of the usual kind. The covenant restriction on **subsidiary** indebtedness is itself a protection against future structural subordination. **What is not disclosed:** any quantification of how much of the $945.0 offshore could be moved to the US, in what time, at what tax cost. Recorded as "Not disclosed in the data pool", not assumed to be free |
| **Material restricted / trapped cash** | **Restricted cash $83.0** (current 15.0 + long-term 68.0), restriction described as "dedicated accounts limited to the payment of certain internal royalty obligations" [`Q2 FY27 10-Q, Condensed Consolidated Balance Sheets`; `FY26 10-K, Note 1`]. **Offshore cash $945.0 = 82.2% of cash & equivalents**, not described as restricted [`Q2 FY27 10-Q, Item 2 MD&A`] | The $83.0 restricted balance is **excluded from every net-debt figure above** — it is not silently netted. Net debt is therefore **not** understated by restricted cash. The offshore concentration is a timing-and-tax question for `03_liquidity-runway`, not a net-debt adjustment: the company has not disclosed any legal barrier, and inventing a haircut would be inference presented as fact |

---

## 7. Leverage Anchor Summary (canonical numbers for downstream agents)

**Use these verbatim. Carry every label with the number (§3, §15).** All figures **USD millions, US GAAP**, as of **2026-09-30** unless marked.

| Anchor | Canonical value | Label that must travel with it |
|---|---:|---|
| **Reporting currency** | **USD, millions** | US GAAP; fiscal year ends 31 March; latest balance sheet 2026-09-30 (Q2 FY2027) |
| **Gross debt** | **2,519.8** | **Borrowings only, balance-sheet carrying value** (short-term debt, net 629.2 + long-term debt, net 1,890.6). Face value **2,529.8**. **Operating leases are NOT in this figure** — US GAAP. Lease-inclusive variant **2,911.4** (= 2,519.8 + 391.6), which is also the vendor's "Total Debt" |
| **Net debt — CANONICAL** | **1,370.4** | **Strict §15 basis: gross debt (carrying) − cash & equivalents only.** 2,519.8 − 1,149.4. **This is the designated canonical figure for every downstream agent in this module** (MODULE_RULES Calculation Standard 3: strict by default). Switching basis mid-module requires an explicit one-line reason |
| Net debt — broad (do not headline alone) | 846.2 | **Broad basis: also nets the 524.2 of liquid short-term investments.** Never present as bare "net debt" |
| Net debt — vendor figure, if quoted | 1,237.8 | **Broad AND lease-inclusive** (nets short-term investments on the cash side, adds operating leases on the debt side). Reconciles exactly: 1,370.4 − 524.2 + 391.6 = 1,237.8 |
| **Cash & liquid investments** | Cash & equivalents **1,149.4**; liquid short-term investments **524.2**; **gross liquidity 1,673.6** | Restricted cash of **83.0** (15.0 current + 68.0 long-term, dedicated internal-royalty accounts) is **excluded** and must stay excluded. **82.2% of cash & equivalents (945.0) is held offshore** — not disclosed as restricted, but flagged. The undrawn committed revolver ($997.9 available of a $1,000.0 commitment) is **not** in the 1,673.6 — `03` adds it |
| **EBITDA base** | **677.6 — company-defined, LTM to 2026-09-30, ENGINE-COMPUTED BRIDGE** | **Non-GAAP.** The company's own published definition (GAAP net loss excluding net interest, income taxes, depreciation, and amortization/impairment of **acquired** intangibles). Build: FY2026 **760.6** (my build from FY26 10-K lines, because the company publishes no FY2026 full-year EBITDA) − H1 FY26 **342.2** (company-disclosed) + H1 FY27 **259.2** (company-disclosed) = 677.6. **Cycle position: latest, BETWEEN LAUNCHES — not peak and not trough.** The GTA VI launch (2026-11-19) falls *after* this window |
| EBITDA base — vendor alternative | **724.9** | `ciq_facts.json` → `ltm_ebitda_m`, `CIQ Financials → Income Statement` LTM Sep-30-2026 — tier-5 vendor export. My own read of that tab matches exactly. **6.5% above my filing-built figure** (677.6); gap flagged, vendor not overridden |
| EBITDA base — **mid-cycle / normalised** | **565.3** | Five-year average of the company's own annual EBITDA FY2022–FY2026 on the vendor basis: (671.0 + 555.5 + 432.2 + 379.5 + 788.5) ÷ 5. **Mandatory for this name** — `business-model/07` scores Cyclicality 22/100 (Weak) |
| EBITDA base — forward peak (labelled forecast) | **1,024–1,082** (midpoint 1,053) | **Company FY2027 guidance**, `Q2 FY27 earnings release, 2026-11-09, Outlook`. A forecast, not a reported period. **The coming peak** (GTA VI launch year) |
| **Reported (GAAP) profit anchor** | **LTM operating loss (180.8)**; FY2026 operating loss (104.2) | **There is no GAAP EBITDA.** Any "debt ÷ reported EBITDA" ratio is **not meaningful** — negative denominator. Every leverage multiple in this module is on a **non-GAAP** EBITDA; that caveat must propagate |
| **Net debt / EBITDA — canonical net debt (1,370.4) on every base** | **2.02x** on company-defined LTM 677.6 · **1.89x** on vendor LTM 724.9 · **2.42x** on mid-cycle 565.3 · **1.30x** on guided FY27 peak 1,053 | All four use the **strict** net-debt figure. The *broad*-basis equivalents are 1.25x / 1.17x / 1.50x / 0.80x — use only if explicitly relabelled |
| **Gross debt / EBITDA** | **3.72x** on 677.6 · **3.48x** on 724.9 · **4.46x** on 565.3 · **2.39x** on 1,053 | Borrowings-only gross debt 2,519.8. Lease-inclusive (2,911.4): 4.30x / 4.02x / 5.15x / 2.76x |
| **Debt / capital · Debt / equity** | **40.7% · 68.6%** (borrowings-only); 44.2% · 79.3% (lease-inclusive) | Equity = total stockholders' equity **3,673.6**; **no preferred stock issued**; no minority interest |
| **Fixed / floating** | **100% of drawn borrowings are fixed-rate**; weighted-average coupon on the $2,500.0 of Senior Notes **4.59%** | The only floating-rate instrument is the **undrawn** revolver (ABR 7.00% or SOFR ~3.91% at 2026-09-30, plus a rating-determined spread). No interest-rate swaps are disclosed |
| **Structural subordination** | **29.4** of **2,529.8** face borrowings = **1.2%**, at Zynga (OpCo), **structurally senior** as to Zynga's assets, Take-Two-guaranteed, **maturing 2026-12-15** | Material to map, immaterial in size, and days from expiry |
| **Credit rating — vendor-sourced only, not a rating action** | S&P Foreign Currency LT **BBB**; CIQ relative credit-health quartile **4 (bottom)** on all four of overall / operational / solvency / liquidity, against 25 Interactive Home Entertainment peers, LTM period ending 2026-09-30 | `CIQ Credit Health Panel → Summary`, financials updated 2026-11-10 — **tier-5 vendor export, not a rating-agency rationale or outlook.** No rating-agency report is in this pool; no rating trajectory may be inferred. Noted because the revolver's spread is **rating-determined** |

**Caveats every downstream agent must propagate:**
1. **Every leverage multiple here rests on a non-GAAP EBITDA.** GAAP operating profit is negative on both the latest full year and the LTM. There is no GAAP-EBITDA-based ratio to show.
2. **The canonical EBITDA (677.6) is partly engine-computed.** Its FY2026 component (760.6) is my own build on the company's published definition from the FY26 10-K's own lines, because the company does not publish a FY2026 full-year EBITDA in this pool. The H1 FY27 and H1 FY26 components (259.2 and 342.2) are company-disclosed.
3. **This is a cyclical, release-slate-driven business** (`business-model/07`, Cyclicality 22/100). **1.30x is a floor built on company guidance, 2.42x on the own five-year average is the central estimate.** Do not headline a single-year multiple without its cycle label.
4. **Source-check status: UNCHECKED, not verified clean** (no `numeric_reading_check` field on any of the 30 manifest sources). Every amount above was verified by a direct read of the frozen filing extract that reports it; nothing is quoted from a vendor tab under a filing's name.
5. **The vendor's net debt (1,237.8) and net leverage (1.71x) are on a different definition** — broad on cash, lease-inclusive on debt. They reconcile exactly to the canonical figures and are not in conflict, but they are **not interchangeable** with them.
6. **Not net cash.** TTWO is net debt on both bases (strict 1,370.4; broad 846.2), so the §24 Filter-3 net-cash credit does not apply here. The structure is also **not** evaluated against any "optimal leverage" frame — this module rejects it (MODULE_RULES Core Principle 8).

**No solvency verdict is made here.** Maturities (`02`), liquidity runway (`03`), coverage and covenant headroom (`04`), off-balance-sheet items (`05`), the downside stress test (`06`) and the solvency verdict (`99`) are other agents' work.
