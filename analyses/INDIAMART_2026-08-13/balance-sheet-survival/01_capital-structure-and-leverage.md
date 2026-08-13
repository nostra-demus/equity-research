# Capital Structure & Leverage — INDIAMART

**Reporting currency: INR (₹ millions), consolidated, Ind AS (Indian Accounting Standards, Companies Act 2013 Sec. 133). Fiscal year ends 31 March** (e.g. "FY26" = year ended 31-Mar-2026). Jurisdiction: India, listed NSE (INDIAMART) / BSE (542726), SEBI-LODR regime. All figures below are consolidated unless stated otherwise, sourced independently from the Capital IQ (CIQ) exports and the underlying audited Annual Report / SEBI LODR Reg 33 quarterly filings, cross-checked against each other. No `ciq_facts.json` sidecar exists for this pool run; all figures are this agent's own sourced read.

---

## 1. Debt Stack

IndiaMART carries **no bank borrowings, no bonds, no term loans, and no revolver**. The only interest-bearing / debt-like item on the consolidated balance sheet is **lease liabilities** (Ind AS 116 capitalises all leases — there is no separate off-balance-sheet "operating lease" bucket in this filing). Confirmed independently by the cash-flow statement: "Total Debt Issued" = nil in every period FY22 through LTM Jun-2026 [Capital IQ export, `Financials (1).xls`, Cash Flow tab] — the company has never drawn debt financing in this window.

| Instrument | Amount (FY26, 31-Mar-2026) | Amount (Latest, 30-Jun-2026) | Entity (HoldCo/OpCo) | Secured? | Seniority | Collateral | Maturity | Rate (fixed/floating) | Source |
|---|---:|---:|---|---|---|---|---|---|---|
| Short-term debt / bank borrowings | ₹0 | ₹0 | — | — | — | — | — | — | No line item exists — confirmed by "Total Debt Issued = nil" every period [Financials (1).xls, Cash Flow tab] |
| Bonds / notes | ₹0 (parent level) | ₹0 | — | — | — | — | — | — | Not disclosed / does not exist at parent [FY26 Annual Report, Consolidated Balance Sheet] |
| Term loans | ₹0 | ₹0 | — | — | — | — | — | — | Not disclosed / does not exist |
| Revolver (drawn) | ₹0 — no revolver facility exists | ₹0 | — | — | — | — | — | — | No facility line item in Capital Structure Details export [`Financials Capital Structure Details.xls`] |
| Finance / capital leases — current portion | ₹100.12mn | ₹105.23mn | IndiaMART InterMESH Ltd (parent, consolidated) | Yes (per CIQ; secured by the underlying leased asset, standard for an Ind AS 116 right-of-use lease) | Senior | Underlying leased premises/equipment | Various, per lease term | Fixed | [FY26 Annual Report (Ind AS), Consolidated Balance Sheet, Note 15(a) — Lease liabilities; `Financials Capital Structure Details.xls`, FY2026 & FQ1 2027 "As Reported Details" — Type: Capital Lease, Seniority: Senior, Secured: Yes] |
| Finance / capital leases — non-current portion | ₹130.90mn | ₹111.05mn | IndiaMART InterMESH Ltd (parent, consolidated) | Yes | Senior | Underlying leased premises/equipment | Various, per lease term | Fixed | Same as above |
| **Total gross debt** | **₹231.02mn** | **₹216.28mn** | — | 100% secured, 100% senior | — | — | — | Fixed | [FY26 Annual Report, Consolidated Balance Sheet; `Financials Capital Structure Summary.xls` — Total Debt ₹231.02mn FY26 / ₹216.28mn Jun-26, Total Secured Debt = 100%, Total Senior Debt = 100%] |

**Footnote — subsidiary-level convertible notes (immaterial, excluded from the total above):** two "Corporate Convertible" instruments are recorded at wholly-owned subsidiary Livekeeping Technologies Private Limited (senior unsecured, coupon 0.001%, private placement, INR-denominated, maturities 1-Jan-2036 and 24-May-2036) — both show **$0mm / ₹0mm outstanding** at both offer and current dates. These do not add to gross debt. [`Fixed Income Securities Summary.xls`, Securities Summary tab]

**Trend:** gross debt has fallen every year as leases amortise down with no replacement financing drawn: ₹406.67mn (FY24) → ₹330.37mn (FY25) → ₹231.02mn (FY26) → ₹216.28mn (latest, 30-Jun-2026) [`Financials (1).xls`, Balance Sheet tab].

---

## 2. Other Debt-Like Obligations

| Obligation | Amount | Treatment | Source |
|---|---:|---|---|
| Operating leases (IFRS 16 / US GAAP note) | Already capitalised — see Section 1 | Ind AS 116 (India's IFRS-16 equivalent) requires all leases (finance and what would elsewhere be called "operating") onto the balance sheet as right-of-use assets with a matching lease liability. There is no separate off-balance-sheet operating-lease bucket to add; the ₹231.02mn / ₹216.28mn total in Section 1 is the complete lease obligation. | [FY26 Annual Report, Note 2 (Material accounting policies) — Ind AS 116 application; Note 15(a) — Lease liabilities] |
| Pension / OPEB underfunding | Net unfunded liability ₹591.1mn (FY26): Projected Benefit Obligation ₹827.66mn vs Plan Assets ₹236.58mn. Booked on balance sheet as Current ₹132.9mn + Long-Term ₹458.2mn (labelled "Pension & Other Post-Retire. Benefits" in the CIQ balance sheet export). | Gratuity defined-benefit plan under Ind AS 19; recognised on-balance-sheet, not off-balance-sheet. Grew from ₹265.5mn (FY22) to ₹591.1mn (FY26) as the workforce and compensation base expanded. | [`Financials Pension OPEB.xls` — PBO ₹827.66mn, Plan Assets ₹236.58mn, Net Liability ₹591.1mn, FY26; FY26 Annual Report, gratuity/defined-benefit note] |
| Preferred equity | ₹0 — none disclosed | Not applicable | [FY26 Annual Report, Consolidated Balance Sheet, Equity section — Share capital + Other equity only, no preference share capital line] |

---

## 3. Cash & Liquid Assets

| Item | Amount (FY26, 31-Mar-2026) | Amount (Latest, 30-Jun-2026) | Restricted? | Source |
|---|---:|---:|---|---|
| Cash & equivalents | ₹804.13mn | ₹368.11mn | No | [`Financials (1).xls`, Balance Sheet tab; FY26 Annual Report, Consolidated Balance Sheet, Note 11] |
| Short-term investments (bank deposits >3mo) | ₹104.47mn | ₹84.00mn | Partially — see flag below | [`Financials (1).xls`, Balance Sheet tab] |
| Trading Asset Securities (treasury book: mutual funds, bonds, ETFs, AIF units — funded largely by customer-subscription prepayment float) | ₹30,294.05mn | ₹33,434.47mn | No | [`Financials (1).xls`, Balance Sheet tab; FY26 Annual Report, Note 8 — Investments] |
| **Total Cash & ST Investments (broad liquid base)** | **₹31,202.65mn** | **₹33,886.58mn** | — | [`Financials Capital Structure Summary.xls` — Total Cash & ST Investments] |
| Restricted / trapped cash (flag) | ₹3.30mn "earmarked balances with banks" (FY26) vs ₹2.61mn (FY25) — comprising unclaimed/unpaid dividend ₹0.48mn, bank balance held for the IndiaMART Employee Benefit Trust ₹2.73mn, and a deposit under lien ₹0.09mn | Immaterial in absolute terms (~0.01% of the broad cash base) but flagged, not silently netted, per MODULE_RULES Rule 3. Sits within the "bank balances other than cash and cash equivalents" note, not inside the headline Cash & equivalents line, so it is not already excluded from Section 3's cash figures above. | [FY26 Annual Report, Note 11 (Cash and bank balances) — "Earmarked balances with banks*" ₹3.30mn FY26 / ₹2.61mn FY25] |

No offshore/trapped-cash disclosure was found beyond the earmarked-balance note above; the company is a single-country (India) operator with modest overseas subsidiary presence and no disclosed repatriation restriction.

---

## 4. Gross & Net Debt

| Metric | FY26 (31-Mar-2026) | Latest (30-Jun-2026) | Source |
|---|---:|---:|---|
| Gross debt | ₹231.02mn | ₹216.28mn | Section 1 |
| − Cash & equivalents | ₹804.13mn | ₹368.11mn | Section 3 |
| **Net debt (strict, §15)** | **−₹573.11mn (net cash)** | **−₹151.83mn (net cash)** | Calc.; cross-checked against `earnings/01_historical-financials.md` §1 fn.5 (identical figures) |
| − Short-term investments + Trading Asset Securities | ₹30,398.52mn | ₹33,518.47mn | Section 3 |
| **Net debt (broad, incl. investments, §15)** | **−₹30,971.63mn (net cash)** | **−₹33,670.30mn (net cash)** | Matches CIQ's own "Net Debt" line exactly [`Financials Capital Structure Summary.xls` — Net Debt −30,971.6 FY26 / −33,670.3 Jun-26] |

Both bases show a **net-cash** balance sheet at every date shown; the two bases diverge sharply (₹573mn vs ₹31.0bn at FY26-end) because the "broad" figure nets in the ₹30bn+ treasury book of short-duration mutual funds/bonds/ETFs that IndiaMART holds against its customer-prepayment float (see `earnings/01_historical-financials.md` §1 fn.4 — this book sits inside Current Assets, not inside the headline Cash & equivalents line). Neither figure nets the ₹3.30mn earmarked/restricted balance flagged in Section 3.

---

## 5. Leverage Ratios

*No adjusted EBITDA is disclosed by the company* — a full-text search of the FY26 Annual Report for "adjusted EBITDA" / "non-GAAP" returned no matches [`earnings/01_historical-financials.md` §4]. All ratios below use **reported EBITDA** only. EBITDA base used: FY26 annual reported EBITDA ₹5,205.94mn; LTM (4 quarters ended 30-Jun-2026) reported EBITDA ₹5,314.65mn [Capital IQ export, `Financials (1).xls`, Income Statement tab — "LTM Jun-30-2026" column; a ~2.2% unreconciled gap exists between this figure and other CIQ tabs' EBITDA sums for the same period, flagged in `earnings/01_historical-financials.md` fn.7 as an inconsistency within CIQ's own workbooks, not a filing conflict].

| Ratio | On Reported EBITDA (FY26 / Latest LTM) | On Adjusted EBITDA | Source |
|---|---:|---:|---|
| Gross debt / EBITDA | 0.0444x (FY26: 231.02/5,205.94) / 0.0407x (Latest: 216.28/5,314.65) | n/a — not disclosed | Calc.; CIQ's own denominator gives 0.0436x FY26 / 0.0369x Jun-26 [`Financials Capital Structure Summary.xls` — Total Debt/EBITDA] — consistent to within the ~2% CIQ cross-tab gap noted above |
| Net debt / EBITDA (strict basis) | N/M — net cash of −0.11x FY26 / −0.03x Latest | n/a | Calc. from Section 4 strict row |
| Net debt / EBITDA (broad basis) | N/M — net cash equal to ~5.95x FY26 EBITDA / ~6.34x Latest LTM EBITDA | n/a | Calc. from Section 4 broad row; matches CIQ's own "Net Debt/EBITDA: NM" designation [`Financials Capital Structure Summary.xls`] |
| Debt / capital | 0.95% FY26 (231.02/24,234.77) / 0.97% Latest (216.28/22,412.26) | (n/a) | [`Financials Capital Structure Summary.xls` — Total Debt % of Total Capital 0.009533 FY26 / 0.009650 Jun-26] |
| Debt / equity | 0.96% FY26 (231.02/24,003.75) / 0.97% Latest (216.28/22,195.98) | (n/a) | Calc. from Section 1 and Section 4 balance sheet figures |

**Cycle position of the EBITDA base:** `business-model/10_external-dependency.md` classifies IndiaMART as **"Partly externally driven"** (SME/India-GDP demand link is qualitative, no quantified sensitivity disclosed) — not flagged as a deep cyclical / commodity name. MODULE_RULES' mid-cycle/normalised-EBITDA requirement therefore does not apply here; the FY26/latest-LTM reported EBITDA figures above are used as both the "latest" and effectively the working base, with no separate peak-vs-trough overlay required. Note for context only: `earnings/01_historical-financials.md` §6 records EBITDA margin as genuinely volatile within the last 5 years (39.4% FY22 → 26.6% FY23 → 26.5% FY24 → 37.0% FY25 → 33.2% FY26) — a cost-cycle effect, not a demand-cycle one — so a reader should not treat FY26's 33.2% margin as a permanent steady state even though no formal mid-cycle adjustment is triggered.

**Net debt/EBITDA basis used above:** both strict and broad bases are shown per Section 4; the ratio itself is not meaningfully different in decision terms (both are deeply net cash) — see Section 7 for which basis downstream agents should treat as canonical.

---

## 6. Leverage Trend

Net debt shown on the **strict** basis (gross debt − cash & equivalents only, §15 default) as the primary trend row, with the broad basis (also netting ST investments + the treasury book) alongside, both labelled.

| Metric | FY24 (Mar-24) | FY25 (Mar-25) | FY26 (Mar-26) | Latest (Jun-26) | Direction |
|---|---:|---:|---:|---:|---|
| Net debt — strict (§15) | −₹441.37mn (net cash) | −₹404.47mn (net cash) | −₹573.11mn (net cash) | −₹151.83mn (net cash) | Net cash narrowed FY25→FY26 dip reversed, then narrowed sharply into the latest quarter |
| Net debt — broad (incl. ST investments + treasury book) | −₹22,824.8mn (net cash) | −₹28,392.9mn (net cash) | −₹30,971.6mn (net cash) | −₹33,670.3mn (net cash) | Deepening net cash every period |
| Net debt / EBITDA (broad basis, N/M convention) | N/M (net cash, ~7.2x FY24 EBITDA) | N/M (net cash, ~5.5x FY25 EBITDA) | N/M (net cash, ~5.95x FY26 EBITDA) | N/M (net cash, ~6.3x LTM EBITDA) | Stable — deep net cash throughout |
| Gross debt | ₹406.67mn | ₹330.37mn | ₹231.02mn | ₹216.28mn | Falling every period (lease amortisation, no new debt) |

Leverage is **falling on every measure that matters** — gross debt has fallen every year since the pool's earliest available year (FY22: ₹562.8mn) purely from lease amortisation, with zero new debt drawn in any period [`Financials (1).xls`, Cash Flow tab — "Total Debt Issued" = nil FY22–LTM Jun-26]. The **broad-basis net-cash pile has deepened every year** (−₹22.8bn FY24 to −₹33.7bn latest), driven by strong, growing free cash flow (FCF ₹5,444.9mn FY24 → ₹6,872.2mn FY26 [`earnings/01_historical-financials.md` §1]) and a subscription model that collects cash upfront (unearned revenue grew from ₹9,210.0mn to ₹19,652.6mn combined current+non-current, FY24→FY26). The one apparent wrinkle is the **strict-basis net cash figure narrowing sharply between FY26-end (−₹573.11mn) and the latest quarter (−₹151.83mn)** — this reflects the ₹804.13mn "Cash & equivalents" balance falling to ₹368.11mn as a large FY26 dividend (final ₹30/share + special ₹30/share, ~₹3.6bn total, declared Apr-2026) was paid out of the narrow cash-and-equivalents bucket even as funds were simultaneously rotated into the (much larger) treasury book of short-duration investments, which grew ₹2.68bn over the same quarter [`business-model/11_capital-allocation-governance.md` — dividend signal row; Section 3 above]. The single control acquisition in this window (Busy Infotech/Tolexo, $66.93mm, FY22, prior to the FY24 start of this trend table) was entirely self-funded from cash with zero debt drawn [`business-model/11_capital-allocation-governance.md`].

---

## 6A. HoldCo / OpCo & Structural Subordination

**Not applicable — no material HoldCo-level debt indicated.** IndiaMART InterMESH Limited is itself the ultimate listed parent (not a subsidiary of another operating HoldCo), and its own balance sheet carries the ₹231.02mn / ₹216.28mn of lease liabilities described in Section 1. The only debt instruments found anywhere in the corporate structure below the parent are the two zero-outstanding convertible notes at wholly-owned subsidiary Livekeeping Technologies Private Limited (Section 1 footnote) — both $0mm/₹0mm outstanding, so there is no structural-subordination exposure to assess. [`IndiaMART InterMESH Limited (NSEI_INDIAMART) Corporate Structure Tree.xls` — subsidiary map; `Fixed Income Securities Summary.xls`]

---

## 7. Leverage Anchor Summary (canonical numbers for downstream agents)

- **Gross debt:** ₹231.02mn (FY26, 31-Mar-2026) / ₹216.28mn (latest, 30-Jun-2026) — entirely lease liabilities, 100% secured, 100% senior; no bank borrowings, bonds, term loans, or revolver exist [Section 1].
- **Net debt — canonical figure: strict basis (§15 default; no reason found in this pool to switch to broad).** Strict net debt = −₹573.11mn (net cash) at FY26-end, −₹151.83mn (net cash) at the latest quarter-end (30-Jun-2026). **Broad basis, shown alongside, labelled:** −₹30,971.63mn (net cash) FY26-end / −₹33,670.30mn (net cash) latest — this nets in the ₹30–34bn treasury book of short-duration mutual funds/bonds/ETFs. Downstream liquidity-runway (03) and stress-test (06) agents should note that MODULE_RULES separately defines *liquidity* (not net debt) as cash + liquid short-term investments, so Section 3's full ₹31.2–33.9bn "Total Cash & ST Investments" figure — not the strict net-debt figure — is the correct input for those agents' own liquidity calculations.
- **Cash & liquid investments:** ₹804.13mn cash + ₹104.47mn ST investments + ₹30,294.05mn trading securities = ₹31,202.65mn total (FY26); ₹368.11mn + ₹84.00mn + ₹33,434.47mn = ₹33,886.58mn total (latest, 30-Jun-2026). ₹3.30mn is earmarked/restricted (immaterial, flagged in Section 3, not netted out above).
- **EBITDA base used:** Reported EBITDA (company discloses no adjusted EBITDA) — ₹5,205.94mn FY26 annual, ₹5,314.65mn LTM ended 30-Jun-2026 [Section 5]. Cycle position: not a deep-cyclical name per `business-model/10_external-dependency.md` ("Partly externally driven"), so no separate mid-cycle/normalised EBITDA figure is required or provided — latest-year/LTM reported EBITDA is used as-is. A ~2.2% unreconciled gap exists between this figure and other CIQ tabs' EBITDA for the same periods (flagged in `earnings/01_historical-financials.md` fn.7) — propagate this caveat downstream.
- **Net debt / EBITDA (canonical, strict basis):** N/M — net cash equal to ~0.11x FY26 EBITDA / ~0.03x LTM EBITDA. **On the broad basis (labelled, not canonical):** N/M — net cash equal to ~5.95x FY26 EBITDA / ~6.34x LTM EBITDA.
- **Reporting currency:** INR (₹ millions), Ind AS consolidated, FY ends 31 March.

**No number above is estimated or based on adjusted EBITDA** — all figures are either directly filed (FY26 Annual Report, Q1 FY27 Interim Report) or a Capital IQ Tier-5 vendor export cross-checked against the filing (e.g. lease liabilities ₹231.02mn ties exactly to Note 15(a) of the Consolidated Balance Sheet). The one flagged uncertainty is the ~2.2% EBITDA cross-tab gap noted above, which downstream agents should carry forward as a caveat on any EBITDA-denominated ratio.

**IndiaMART is net cash on every measure and every year shown.** Strict-basis net cash (cash & equivalents only, less debt) has run positive since FY23 and stood at ₹573.11mn at FY26-end / ₹151.83mn at the latest quarter-end; on the broad basis (also netting the company's ₹30bn+ short-duration treasury book), net cash has deepened every year, from roughly ₹22.8bn (FY24) to ₹33.7bn (latest). This is a **strategic-flexibility signal, not a "lazy balance sheet"** (CLAUDE.md §24, Filter 3): the company has funded its only control acquisition (Busy Infotech/Tolexo, $66.93mm, FY22) and roughly two decades of ~20 minority venture-style investments entirely from internal cash with zero debt ever drawn [`business-model/11_capital-allocation-governance.md`], and this net-cash position gives it the ability to fund counter-cyclical action, absorb a demand downturn, or pursue further M&A without any refinancing dependence. This module does not conclude IndiaMART is "under-levered" or that it should add debt to optimise its cost of capital — per MODULE_RULES, the "optimal leverage" frame is rejected outright.
