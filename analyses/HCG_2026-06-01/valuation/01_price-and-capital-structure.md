# Price & Capital Structure — HCG

**Company:** HealthCare Global Enterprises Limited (NSE: HCG, BSE: 539787) — pan-India oncology-focused hospital network.
**Reporting currency:** Indian Rupee (INR, ₹). All amounts in ₹ million (₹ Mn) unless a per-share or bn figure is stated. Fiscal year ends 31 March; FY26 = year ended 31 Mar 2026.
**Date:** 2026-06-01.
**Business type (from `00_valuation-data-triage`):** Operating company (Health Care Facilities). The EV bridge below is a value-relevant input (operating-company method map), not informational-only.
**Anchor source basis:** Capital IQ exports in the data pool are the primary price/capital-structure source (no IBKR screenshot in pool). The FY26 capital-structure figures are independently corroborated against the company's own audited FY26 results deck (board-approved, filed 19 May 2026), so they sit at filing-grade quality, not vendor-only.

> **Cross-module inputs used:** `earnings/01_historical-financials.md` (FY26 levels: Reported EBITDA ₹4,658M, company net-debt definitions, rights-issue context) and `valuation/00_valuation-data-triage.md` (source map; flagged the two price figures and the share-count spread to reconcile here). Both were available and consumed rather than re-derived.

---

## 1. Current Price

| Field | Value | Source | As-of Date |
|---|---|---|---|
| Current price (anchor) | ₹646.15 | EstimatesReport.xls "Latest Price/Last Close Price" (NSEI:HCG), conversion "Today's Spot Rate", current FY = Mar-31-2027 | ~late-May 2026 (most recent pool snapshot) |
| Alternate price (used by CIQ for its TEV) | ₹637.25 | Financials.xls "Current Capitalization" → Share Price; CIQ tearsheet (`HCG_CIQReportLandscape.rtf`) | basis tied to Mar-31-2026 capitalization snapshot |
| BSE last close (reference) | ₹648.10 | EstimatesReport.xls "Last Close Price" (BSE:539787) | ~late-May 2026 |
| Currency | INR (₹) | both exports | — |
| Price basis | Last close (exchange close, primary class NSE) | EstimatesReport.xls | — |
| 52-week range (context) | ₹513.30 – ₹804.65 (NSE) | EstimatesReport.xls "52 Wk. High/Low" | trailing 52 wk |

**Price reconciliation (required by triage).** Two pool prices exist and differ by ~1.4%: CIQ Current-Capitalization ₹637.25 (tied to a Mar-31-2026 snapshot) and the consensus export's NSE last close ₹646.15 (a later, "Today's Spot Rate" snapshot, current fiscal year already rolled to FY27). I take **₹646.15 (NSE last close)** as the headline anchor price because it is the more recent of the two pool figures and is exchange-close on the primary listing. Both are pool-sourced (Capital IQ); no web quote was needed, so the indicative/unverified label does not apply.

**Important downstream note on the market-cap price.** CIQ's pre-computed market cap and TEV (Section 3–4) are built on its own ₹637.25. Where this report shows CIQ's reproduced TEV, it uses ₹637.25 so the tie-out holds; where it states the canonical market cap for downstream agents, it uses the anchor ₹646.15. The two market-cap figures differ by ~₹1,440M (~1.5%) — small, but downstream agents must use one consistently. **Use ₹646.15 and the 149.30M share count (below).**

---

## 2. Share Count

| Field | Value | Source |
|---|---:|---|
| Basic shares outstanding (current, post rights issue) | 149.30M | Financials.xls "Current Capitalization" → Shares Out. 149.302203M; equals paid-up equity capital ₹1,493.0M ÷ ₹10 face value (Balance Sheet, Common Stock, FY26 PR col) |
| CIQ "Total Shares Out. on Filing Date" (FY26) | 144.67M | Financials.xls Balance Sheet, Supplemental, Filing Date serial 46161 (≈2026-05-15) — **anomalous, not used** (see note) |
| Diluted weighted-average shares (FY26) | 143.33M | Financials.xls Income Statement → Weighted Avg. Diluted Shares Out. (FY26 PR col) |
| Basic weighted-average shares (FY26) | 141.86M | Financials.xls Income Statement → Weighted Avg. Basic Shares Out. (FY26 PR col) |
| Options/RSUs outstanding | 3.22M @ W/avg strike ₹145.55 | Financials.xls Supplemental → Options Out. at end of period (FY25; FY26 not refreshed in export — dash) |
| Convertibles / potential shares | None | Financials.xls Capital Structure Details → "Convertible = No" on every debt line (FY24, FY25) |
| **Fully diluted shares (TSM, if-converted)** | **151.79M** | 149.30M basic + 2.48M net new from options via treasury-stock method (calc below); no converts |
| Share count used for **market cap** | 149.30M | most recent shares outstanding (paid-up capital basis) — per Fully-Diluted Equity Rule 1 |
| Share count used for **per-share fair value** | 151.79M (fully diluted, TSM) | per Fully-Diluted Equity Rule 2; falls back to nothing — full TSM applied |

**Share-count reconciliation (which count, why).**

- **149.30M is the correct current count.** Three independent ties confirm it: (1) CIQ Current Cap "Shares Out." = 149.302203M; (2) FY26 paid-up equity capital ₹1,493.0M ÷ ₹10 face value = 149.30M (Balance Sheet "Common Stock", FY26 PR col); (3) institutional ownership block of 29,356,888 shares = 19.66% of total implies 29,356,888 ÷ 0.1966 = 149.32M total (`Public Ownership Summary.rtf`). The ~10M jump from FY25 (139.42M) to FY26 (149.30M) is the **₹4,250 Mn rights issue completed in Q4 FY26, oversubscribed 1.3x** [HCG Q4 & FY26 Results deck, filed 19 May 2026, p.14].
- **The 144.67M "filing-date" field is rejected.** CIQ's Balance-Sheet supplemental field "Total Shares Out. on Filing Date" = 144.666666M does not reconcile with the company's own paid-up capital (it would imply a ₹10.32 face value, inconsistent with the ₹10 face on every prior year). It is a stale/interim CIQ proprietary field; tellingly, CIQ's own market-cap divisor is 149.30M, not 144.67M. Note that CIQ's printed Book Value/Share ₹92.07 and TBV/Share ₹63.01 were computed on this 144.67M figure — Section 6 recomputes them on 149.30M.
- **Material gap basic vs diluted WA:** diluted WA (143.33M) is the FY26 *period average* and predates full settlement of the rights issue, so it is below the current 149.30M post-issue count. For point-in-time market cap I use the current count (149.30M), not the period average — correct per the module's Fully-Diluted Equity Rule 1.

**Share Count Reconciliation Table (per MODULE_RULES Fully-Diluted Equity Rule 3):**

| Step | Shares (M) | Note |
|---|---:|---|
| Basic shares outstanding (current, post rights issue) | 149.30 | paid-up capital ₹1,493.0M ÷ ₹10 |
| + Options via treasury-stock method | +2.48 | 3.22M options − (3.22M × ₹145.55 ÷ ₹637.25 = 0.74M repurchased) = 2.48M net new |
| + Convertibles (if-converted) | +0.00 | none outstanding |
| **= Fully diluted shares used (per-share fair value)** | **151.79** | ~1.7% dilution over basic |

**TSM limitation:** Options-outstanding is the FY25 year-end count (3.22M, strike ₹145.55); the FY26 figure is not refreshed in the export. FY26 likely saw minor net option movement, so 151.79M fully diluted carries a small (<~1%) uncertainty. With the strike (₹145.55) deep in-the-money versus ₹637.25, the dilutive direction is settled even if the exact count drifts. This is the only dilution-data limitation; it does not force a fallback to diluted weighted-average.

---

## 3. Market Capitalization

`Market cap = current shares outstanding × current price`

- **Canonical (anchor price ₹646.15 × 149.30M):** 646.15 × 149.302203 = **₹96,461.1M (₹96.46 bn)** — *use this downstream.*
- CIQ-reproduced (₹637.25 × 149.302203 = ₹95,142.8M, ₹95.14 bn) — shown only so the CIQ TEV tie-out in Section 4 reproduces exactly; not the downstream anchor.

The ₹1,318M difference between the two is purely the ₹637.25-vs-₹646.15 price gap on an identical share count. Downstream agents should use **₹96,461.1M** and note the ~1.4% price-snapshot sensitivity.

---

## 4. Enterprise Value Bridge

All capital-structure components are as at 31 Mar 2026 (FY26), corroborated line-by-line against the company's audited FY26 results deck. Two EV figures are shown: the canonical bridge on the anchor price (₹646.15), and CIQ's reproduced TEV on ₹637.25 (tie-out check).

| Component | Amount (₹ Mn) | Source |
|---|---:|---|
| Market capitalization (anchor, ₹646.15 × 149.30M) | 96,461.1 | Section 3 |
| + Total debt (short + long term, **incl. lease liabilities**) | 17,353.6 | Financials.xls Current Cap / Balance Sheet (FY26 PR); deck p.21 ties: non-curr borrowings 5,991.9 + non-curr leases 7,599.8 + curr borrowings 3,112.2 + curr leases 649.7 = 17,353.6 |
| + Minority / non-controlling interest | 782.4 | Financials.xls Current Cap; deck p.21 "Non-controlling interests 782.4" |
| + Preferred equity | 0.0 | Financials.xls Current Cap → "Pref. Equity = –" (none) |
| + Operating lease liabilities (separate add-on) | 0.0 (not added separately) | already inside Total Debt above (Ind AS 116 capitalized leases ₹8,249.5M); not double-counted |
| + Underfunded pension / other LT obligations | 0.0 (not added) | Pension & OPEB ₹252.6M is small (~0.2% of EV); CIQ excludes it from TEV — see "adjustments not made" |
| − Cash & equivalents (+ ST investments) | −5,409.2 | Financials.xls Current Cap / Balance Sheet (FY26 PR): Cash & Equivalents 5,409.2 (ST investments nil in FY26 col) |
| − Equity-method investments (treated separately) | 0.0 (not deducted) | Equity Method Investments ₹68.2M is immaterial (~0.06% of EV); left in — see "adjustments not made" |
| **= Enterprise value (EV), canonical (₹646.15)** | **109,187.9** | 96,461.1 + 17,353.6 + 782.4 + 0 − 5,409.2 |
| *Memo: EV reproduced on CIQ price (₹637.25)* | *107,869.6* | *ties exactly to CIQ "Total Enterprise Value (TEV)" 107,869.628861 ✓* |

**Bridge arithmetic shown:** EV = market cap + total debt + minority + preferred − cash. On the anchor price: 96,461.1 + 17,353.6 + 782.4 + 0.0 − 5,409.2 = **₹109,187.9M**. No plug. The CIQ-price memo line reproduces CIQ's published TEV to the rupee, confirming the bridge components are correct and only the price differs.

**Lease treatment — material, stated explicitly.** Total debt of ₹17,353.6M *includes* ₹8,249.5M of capitalized lease liabilities (Ind AS 116). This is ~47% of reported total debt and ~7.6% of EV. HCG is lease-heavy (hospital real estate). I keep leases inside debt to match CIQ's TEV and the CLAUDE.md net-debt default, but downstream EV/EBITDA users must note: HCG's EBITDA is post-Ind AS 116 (rent is below the line), so leaving leases in debt is the consistent treatment. An **EV excluding lease liabilities** would be **₹109,187.9 − 8,249.5 = ₹100,938.4M (anchor price)** — provided as a cross-check for any agent that prefers a pre-IFRS-16 / EV-to-EBITDAR frame. Pick one basis and hold it; do not mix lease-in-debt EV with pre-lease EBITDA.

**Adjustments deliberately NOT made (and why):**
- **Operating leases as a separate add-on:** not added — already capitalized inside total debt under Ind AS 116; adding CIQ's "Debt Equiv. of Oper. Leases" would double-count.
- **Underfunded pension / OPEB (₹252.6M):** not added to EV. Immaterial (~0.23% of EV) and CIQ excludes it from its TEV; flagged for completeness.
- **Equity-method investments (₹68.2M):** not deducted. Immaterial (~0.06% of EV); deducting would change EV by <0.1%.
- **Contingent liabilities / Milann fertility divestiture proceeds:** not adjusted. The Milann sale (consideration ~₹376M, close expected Q1 FY27) had not closed at 31 Mar 2026 [deck p.~250]; no pro-forma adjustment made — that is a forward event for later agents, not a balance-sheet fact today.
- **Margin-money bank balances / mutual-fund holdings:** CIQ classifies all ₹5,409.2M as cash; the company nets ~₹287M margin money and ~₹21M MF differently in its own net-debt schedule. I follow the CIQ/CLAUDE.md cash definition for the bridge and surface the company definition in Section 5.

---

## 5. Net Debt & Leverage Snapshot

Net debt = total debt − cash & equivalents (CLAUDE.md / MODULE_RULES default). HCG also publishes its own net-debt definitions; both are shown so the gap is not hidden.

| Metric | Value | Source |
|---|---:|---|
| Total debt (incl. leases) | ₹17,353.6M | Financials.xls Current Cap / Balance Sheet (FY26 PR) |
| Cash & equivalents (+ ST inv) | ₹5,409.2M | Financials.xls Current Cap / Balance Sheet (FY26 PR) |
| **Net debt (total debt − cash, incl. leases) — primary** | **₹11,944.4M** | derived; ties to CIQ Balance Sheet "Net Debt" FY26 field 11,944.4 ✓ |
| Net debt — company-defined, **incl. leases** (nets margin money + MF) | ₹11,636M | HCG Q4&FY26 deck, Net Debt schedule, 31 Mar 2026 |
| Net debt — company-defined, **excl. leases** | ₹3,387M | HCG Q4&FY26 deck, Net Debt schedule, 31 Mar 2026 |
| Lease liabilities (within total debt) | ₹8,249.5M | Balance Sheet FY26 PR (non-curr 7,599.8 + curr 649.7) |
| Net debt / FY26 Reported EBITDA (primary, incl. leases) | 2.56x | 11,944.4 ÷ 4,658 (Reported EBITDA, `earnings/01`; CIQ Key Stats EBITDA 4,657.9) |
| Total debt / FY26 Reported EBITDA | 3.73x | 17,353.6 ÷ 4,658 |
| Net debt (company ex-leases) / FY26 Reported EBITDA | 0.73x | 3,387 ÷ 4,658 (matches company-disclosed 0.73x) |

**Definition note (required):** the three net-debt lines differ for two reasons — (1) lease treatment (₹8,249.5M of Ind AS 116 leases in/out of debt), and (2) the company nets ~₹287M margin-money bank balances and ~₹21M mutual funds into cash that CIQ classifies elsewhere. Primary leverage on the CLAUDE.md default is **2.56x net debt / Reported EBITDA**; the company's headline **0.73x** is an ex-lease, ex-margin-money figure. EBITDA basis is **Reported** (GAAP/Ind AS, pre other-income), not adjusted; adjusted EBITDA (₹4,711M) would move the ratios trivially (2.54x / 0.72x). The Q4 FY26 rights issue (₹4,250M) is what cut net debt year-on-year, not free cash flow (FY26 FCF was ₹586M per `earnings/01`).

---

## 6. Per-Share Reference Values

Per-share values use the **fully diluted** count (151.79M) per MODULE_RULES Fully-Diluted Equity Rule 2/4, except where noted. CIQ's printed per-share figures (BVPS ₹92.07, TBV/share ₹63.01) used 144.67M and are superseded.

| Metric | Per Share | Source / calc |
|---|---:|---|
| Book value per share (fully diluted) | ₹87.75 | Total Common Equity ₹13,319.7M (Balance Sheet FY26 PR) ÷ 151.79M |
| Book value per share (current basic 149.30M, memo) | ₹89.21 | 13,319.7 ÷ 149.30M |
| Tangible book value per share (fully diluted) | ₹60.05 | TBV ₹9,115.1M (= equity 13,319.7 − goodwill 3,875.9 − other intangibles 328.7; Balance Sheet FY26 PR) ÷ 151.79M |
| Tangible book value per share (basic 149.30M, memo) | ₹61.05 | 9,115.1 ÷ 149.30M |
| Net debt per share (primary, incl. leases) | −₹78.69 | net debt ₹11,944.4M ÷ 151.79M (negative = net DEBT, not net cash) |
| Net debt per share (company ex-leases) | −₹22.31 | ₹3,387M ÷ 151.79M |

HCG is a **net-debt** company (no net cash); the per-share net-debt figure is shown negative to make the sign explicit. Goodwill (₹3,875.9M) and other intangibles (₹328.7M) are ~32% of book equity, so tangible book is materially below book.

---

## 7. Anchor Summary (canonical numbers for downstream agents)

Every other valuation agent should use these verbatim. Where two figures exist, the **bolded** one is canonical; the alternate is given only for the CIQ tie-out.

- **Current price:** **₹646.15** (NSE last close, ~late-May 2026 pool snapshot, exchange close). Alternate ₹637.25 (CIQ Current-Cap snapshot, basis Mar-31-2026) exists; the two differ ~1.4% and CIQ's own TEV uses ₹637.25 — agents reproducing CIQ multiples should note which price is embedded.
- **Currency:** INR (₹); FY ends 31 March; FY26 = year ended 31 Mar 2026.
- **Shares (market cap):** **149.30M** (paid-up capital ₹1,493.0M ÷ ₹10; corroborated by CIQ divisor and institutional-ownership back-out). Do NOT use the 144.67M CIQ "filing-date" field.
- **Shares (per-share fair value):** **151.79M** fully diluted (149.30M + 2.48M options via TSM; no converts).
- **Market cap:** **₹96,461.1M (₹96.46 bn)** on ₹646.15. (CIQ-price memo: ₹95,142.8M on ₹637.25.)
- **Net debt:** **₹11,944.4M** (total debt − cash, incl. leases; CLAUDE.md default). Company ex-lease net debt ₹3,387M; company incl-lease ₹11,636M.
- **Enterprise value:** **₹109,187.9M (₹109.19 bn)** on ₹646.15. (CIQ-price memo: ₹107,869.6M, ties to CIQ TEV exactly.) EV ex-lease (cross-check): ₹100,938.4M.
- **Key caveats to propagate:** (1) two pool prices differ ~1.4% — market cap/EV carry a ~1.4% price-snapshot band; (2) leases are inside debt/EV/net-debt — EV/EBITDA must stay post-Ind AS 116 to be consistent; (3) TSM dilution uses FY25 option count (FY26 not refreshed) — fully diluted 151.79M has <~1% uncertainty; (4) FY26 figures are board-approved-deck + CIQ "Press Release" grade (full statutory FY26 statements not yet in pool), though every capital-structure line cross-ties to the audited deck.

### Anchor Block (copy-forward)

- Price: ₹646.15 (NSE last close, ~late-May 2026 pool snapshot, exchange close; alternate CIQ ₹637.25 basis Mar-31-2026)
- Currency: INR (₹)
- Shares (market cap): 149.30M (paid-up capital ₹1,493.0M ÷ ₹10; CIQ Current Cap & institutional back-out corroborate)
- Shares (per-share fair value): 151.79M (fully diluted, TSM on 3.22M options @ ₹145.55; no converts; FY26 option count not refreshed — <~1% uncertainty)
- Market cap: ₹96,461.1M (₹96.46 bn) on ₹646.15 (CIQ-price memo ₹95,142.8M on ₹637.25)
- Net debt: ₹11,944.4M (total debt − cash, incl. leases; company ex-lease ₹3,387M)
- EV: ₹109,187.9M (₹109.19 bn) on ₹646.15 (CIQ TEV memo ₹107,869.6M; EV ex-lease ₹100,938.4M)
- Key caveats: two pool prices (~1.4% band); leases inside debt/EV (keep EV/EBITDA post-Ind AS 116); fully-diluted count uses FY25 option data; FY26 = audited-deck/CIQ-PR grade, full statutory FY26 statements not in pool
