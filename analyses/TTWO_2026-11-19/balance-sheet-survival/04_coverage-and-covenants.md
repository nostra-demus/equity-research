# Coverage & Covenants — TTWO

**Company:** Take-Two Interactive Software, Inc. (NasdaqGS:TTWO) · **Date:** 2026-11-19
**Reporting currency:** **USD, in millions** unless stated. **Reporting standard: US GAAP.** Fiscal year ends **31 March**; the latest balance sheet and income statement are for the quarter ended **2026-09-30** (Q2 of FY2027). **Filing regime:** US SEC — Form 10-K, Form 10-Q.
**"LTM" throughout = the twelve months to 2026-09-30**, bridged as FY2026 − six months to 2025-09-30 + six months to 2026-09-30. Each bridge is shown where it is used.

**Standing verification note carried forward from `00_solvency-data-triage.md` §5 and `01_capital-structure-and-leverage.md`.** All 30 manifest sources in this frozen generation carry **no `numeric_reading_check` field at all** — they are **unchecked, not verified clean** — and no labelled extractor warning annotation appears in `GENERATION_ROOT/corpus.txt`, so there is no specific flagged amount to quarantine. The duty that transfers: **every amount below was read directly from the frozen filing extract that reports it** — `10K_2025_26_0001628280-26-037434.txt` (FY26 10-K), `10Q_2Q_0001628280-26-072254.txt` (Q2 FY27 10-Q), `10K_2024_25_0001628280-25-026694.txt` (FY25 10-K, which carries the credit-agreement exhibit) — and the Capital IQ workbook tabs are used only as a vendor **read to reconcile against**, never as the authority for a filing's own number (CLAUDE.md §5). Where a figure is vendor-sourced it is labelled. Every restating layer downstream must carry this unchecked-source qualifier forward.

**Upstream anchors taken verbatim from `01_capital-structure-and-leverage.md` §7, with their labels.** Gross debt (borrowings only, balance-sheet carrying value) **2,519.8**; face value **2,529.8**; lease-inclusive variant **2,911.4**. Net debt **1,370.4 — strict §15 basis** (gross carrying debt − cash & equivalents only), the module's canonical figure. Cash & equivalents **1,149.4**; liquid short-term investments **524.2**; gross liquidity **1,673.6**; restricted cash **83.0** excluded. EBITDA bases: **(A) company-defined LTM 677.6** (engine-computed bridge on the company's own published definition), **(B) vendor LTM 724.9**, **(C) mid-cycle / normalised 565.3** (own five-year average), **(D) company-guided FY2027 1,024–1,082, midpoint 1,053** (a forecast, not a reported period). **There is no GAAP EBITDA** — the GAAP operating result is a loss on both the latest full year and the LTM, so every multiple here rests on a **non-GAAP** EBITDA and that qualifier travels with it.

**All ratios and headroom percentages below were produced by an executed Python snippet** (two `Bash` runs; commands and printed output are reproduced in §5), not by mental arithmetic.

**Cross-module inputs used:** `earnings/01_historical-financials.md` (LTM baseline, capex definition), `earnings/06_earnings-quality.md` (cash-backing of EBITDA — Earnings-quality score **48/100**, and TTM CFO/EBITDA **50.6%**). Valuation is deliberately not read (MODULE_RULES Cross-Module Inputs).

---

## 1. Coverage Ratios

**The LTM input bridges, shown before they are used** (each component read from the filing named):

| LTM input | FY2026 | − H1 FY26 | + H1 FY27 | = LTM to 2026-09-30 | Source |
|---|---:|---:|---:|---:|---|
| Gross interest expense | 151.4 | 76.3 | 60.6 | **135.7** | `FY26 10-K, Note 17 (Interest and Other, Net)`; `Q2 FY27 10-Q, Condensed Consolidated Statements of Operations` |
| Interest income | 85.1 | 37.2 | 42.1 | **90.0** | same two sources |
| **Net interest expense** | 66.3 | 39.1 | 18.5 | **45.7** | 135.7 − 90.0 |
| Capex — purchases of fixed assets | 162.8 | 57.0 | 163.3 | **269.1** | `FY26 10-K, Consolidated Statements of Cash Flows`; `Q2 FY27 10-Q, Condensed Consolidated Statements of Cash Flows` |
| Capex — total (fixed assets + asset acquisitions) | 190.2 | 68.4 | 182.7 | **304.5** | same; this is the definition `earnings/06_earnings-quality.md` uses, and its figure of 304.5 matches exactly |
| GAAP income (loss) from operations | (104.2) | (76.4) | (153.0) | **(180.8)** | `FY26 10-K, Consolidated Statements of Operations`; `Q2 FY27 10-Q, Condensed Consolidated Statements of Operations` |
| Cash paid for leases (FY2026 actual) | 82.4 | — | — | **82.4** used as the trailing lease charge | `FY26 10-K, Note 13 (Leases) — Supplemental operating cash flow information` |

**Independent reconciliation of the interest figure.** My filing-built LTM gross interest expense of **135.7** matches the vendor's own LTM interest-expense cell of **−135.7** exactly [`CIQ Financials_Annual → Income Statement`, Interest Expense row, LTM column — tier-5 vendor export]. There is no misread to flag on this input. The FY2026 figure also ties to the company's own cash disclosure: **interest paid was 153.0 in FY2026** against 151.4 of expense [`FY26 10-K, Consolidated Statements of Cash Flows — Supplemental data`], so the accrual and the cash cost are within 1.1% of each other and the accrual is not understating the cash burden.

### The four required ratios

**Interest basis: GROSS interest expense (135.7), not net.** MODULE_RULES Calculation Standard 5 requires gross unless net is disclosed and justified. Net interest expense **is** separately computable here (45.7, because the company earned 90.0 of interest income on its cash pile), so the net-basis ratios are shown as a clearly labelled memo line — not as the headline. Using net would roughly triple every coverage ratio and would assume the interest income survives a downside, which is exactly what a stress case should not assume.

| Ratio | Value | Source |
|---|---:|---|
| **EBITDA / interest** | **4.99x** on (A) company-defined LTM EBITDA 677.6 · **5.34x** on (B) vendor LTM EBITDA 724.9 · **4.17x** on (C) mid-cycle 565.3 | 677.6 ÷ 135.7 = 4.99x; 724.9 ÷ 135.7 = 5.34x; 565.3 ÷ 135.7 = 4.17x. EBITDA bases per `01` §7; interest per the bridge above |
| **EBIT / interest** | **(1.33)x — negative, because EBIT is negative.** The LTM GAAP operating loss is (180.8) | (180.8) ÷ 135.7 = (1.33)x [`Q2 FY27 10-Q` and `FY26 10-K` Statements of Operations]. The vendor's own LTM EBIT of **(112.5)** is also negative, giving (0.83)x [`CIQ Financials_Annual → Income Statement`, EBIT row, LTM column — tier-5 vendor export]. The two differ because the vendor's EBIT definition excludes items the filing's operating-loss line includes; the filing figure leads (§4) and the vendor figure is cited for its own number, not overridden |
| **(EBITDA − capex) / interest** | **2.75x** on (A) · **3.10x** on (B) · **1.92x** on (C), using **total capex 304.5**. On fixed-asset capex only (269.1): **3.01x** on (A), **3.36x** on (B), **2.18x** on (C) | (677.6 − 304.5) ÷ 135.7 = 2.75x; (724.9 − 304.5) ÷ 135.7 = 3.10x; (565.3 − 304.5) ÷ 135.7 = 1.92x; (677.6 − 269.1) ÷ 135.7 = 3.01x |
| **Fixed-charge coverage** (how far earnings after investment stretch over interest, scheduled debt repayment and rent together) | **0.44x** on (A) · **0.50x** on (B) — **below 1.0x.** Excluding scheduled debt repayment (interest + rent only): **1.71x** on (A), **1.93x** on (B) | Denominator = gross interest **135.7** + scheduled debt repayment in the next 12 months **629.4** + cash lease payments **82.4** = **847.5**. (677.6 − 304.5) ÷ 847.5 = 0.44x; (724.9 − 304.5) ÷ 847.5 = 0.50x. The 629.4 = the 29.4 of 2026 Convertible Notes due **2026-12-15** + the 600.0 of 2027 Notes due **2027-04-14**, both inside twelve months of 2026-09-30 [`Q2 FY27 10-Q, Note 10 (Debt)`, maturities table: FY2027 remaining 29.4, FY2028 1,400.0; per-instrument dates in the same note] |
| *Memo — net-interest basis (labelled, not the headline)* | *EBITDA / net interest **14.83x** on (A), **15.86x** on (B)* | *677.6 ÷ 45.7; 724.9 ÷ 45.7. Shown because the company does disclose interest income (90.0 LTM); not used as the headline because interest income on cash is itself at risk in a downside* |

**Two bases are mixed inside the fixed-charge ratio, and both are labelled, per §15.** The numerator is **trailing** (LTM EBITDA minus LTM capex); the scheduled-debt-repayment term in the denominator is **forward** (the next twelve months from 2026-09-30), because that is the only basis on which a scheduled repayment exists. The lease term is **trailing** (FY2026 cash paid, 82.4); the forward schedule for FY2027 is 92.9 [`FY26 10-K, Note 13 (Leases)`], which would push the denominator to 858.0 and the ratio to 0.43x on (A) — a 0.01x difference, so the basis choice does not drive the conclusion. The closest fully matched-basis version is the **interest-and-rent-only** line (1.71x on (A)), which uses trailing terms throughout and deliberately excludes the repayment.

**What the sub-1.0x fixed-charge coverage does and does not mean.** It does **not** mean the company cannot pay. It means that in the twelve months from 2026-09-30, earnings after investment (373.1 on basis (A)) do not by themselves cover interest plus the 629.4 of debt actually falling due plus rent — so **629.4 of the 847.5 has to come from the 1,673.6 of gross liquidity (cash 1,149.4 + liquid short-term investments 524.2) or be refinanced**, and 1,673.6 is 2.7x the 629.4. The runway arithmetic and the refinancing question belong to `03_liquidity-runway` and `02_maturity-wall-and-refinancing`; this agent's point is narrower — the ratio is below one, and the reason is a dated repayment, not an inability to carry interest.

### EBITDA basis, interest basis, and cash quality — stated, as required

- **EBITDA basis: non-GAAP on every row. There is no reported GAAP EBITDA.** Basis **(A) 677.6** is the company's own published definition — "GAAP net income (loss) excluding interest income (expense), provision for (benefit from) income taxes, depreciation expense, and amortization and impairment of **acquired** intangibles" [`Q2 FY27 earnings release, 2026-11-09, Non-GAAP Financial Measure`] — and its FY2026 component (760.6) is an **engine-computed build** from the FY26 10-K's own lines because the company publishes no FY2026 full-year EBITDA in this pool. Basis **(B) 724.9** is the Capital IQ vendor figure [`ciq_facts.json` → `ltm_ebitda_m`, `CIQ Financials → Income Statement`, LTM Sep-30-2026 — tier-5 vendor export]; my own read of that tab matches 724.9 exactly. (A) sits **6.5% below** (B); both are shown on every row rather than averaged.
- **Interest basis: GROSS interest expense (135.7).** Net (45.7) is shown only as a labelled memo.
- **EBITDA is materially above cash-backed EBITDA, and this caveats every coverage ratio above.** `earnings/06_earnings-quality.md` scores earnings quality **48/100** and reports **CFO / EBITDA of 50.6% in the twelve months to 2026-09-30** — i.e. roughly half of the EBITDA used in the ratios above turned into operating cash — against 79.2% (FY2026), −11.9% (FY2025), −3.7% (FY2024), 0.2% (FY2023) and 38.4% (FY2022): below 70% in five of six periods. Two named causes, both verified here from the filings:
  1. **The content-spend gap of 304.4.** Over the LTM the company spent **716.3 of cash** on software development costs and licences (688.9 − 345.0 + 372.4) while charging only **411.9 of amortisation** for it (412.8 − 191.7 + 190.8) [`FY26 10-K` and `Q2 FY27 10-Q`, Statements of Cash Flows]. EBITDA bases (A) and (B) both leave the amortisation **inside** the expense base (neither adds back capitalised-content amortisation), so EBITDA is charged 411.9 while cash is charged 716.3. Charge that 304.4 gap as well and **(EBITDA − total capex − content-spend gap) / interest falls to 0.51x** on basis (A): (677.6 − 304.5 − 304.4) ÷ 135.7. That is the cash-truthful coverage number for a company mid-investment-cycle, and it is the one a reader should hold next to the 4.99x.
  2. **Stock-based compensation of 344.7 over the LTM** (305.3 − 136.6 + 176.0) is a real cost of employing people that basis (A) and (B) both leave in — but the *management-reporting* EBITDA the Street tracks adds it back, which is why `earnings/06` flags a 29.5–32.5% non-cash share in that measure. Coverage computed on the management-reporting basis would be about 50% higher than the 4.99x above and is **not** used here.
- **Cash interest is already inside CFO.** TTWO adds the interest *accrual* back in the operating section (60.6 in H1 FY27; 151.4 in FY2026) and the *cash payment* runs out through the accounts-payable-and-accrued-liabilities change, so reported CFO — and therefore reported FCF (CFO − total capex, §15) — is **after** cash interest of 153.0 (FY2026) [`FY26 10-K, Consolidated Statements of Cash Flows` and Supplemental data]. Downstream agents must not re-add it.

---

## 2. Covenant Inventory

**Covenant disclosure is present and numeric, so the MODULE_RULES "no covenant disclosure" partial-data rule does NOT apply and nothing here is marked "Not assessable".** The full governing text is in the pool: the 2022 Credit Agreement as amended by **Amendment No. 3, dated 2025-05-19**, filed as an exhibit to the FY25 10-K, including **Section 6.05 Financial Covenant** and the defined terms it depends on [`FY25 10-K, Exhibit 10.41 (Amendment No. 3 to the Credit Agreement dated as of May 23, 2022)`].

**There is exactly ONE maintenance financial covenant across the entire capital structure.** I searched the full agreement text for an interest-coverage, minimum-liquidity, minimum-net-worth or fixed-charge covenant and found **none** (zero matches for "interest coverage", "minimum liquidity", "net worth", "fixed charge" anywhere in the exhibit). The Senior Notes indenture carries **no maintenance financial covenant at all** — only "certain limitations on the ability of the Company and its subsidiaries to grant liens without equally securing the Senior Notes, or to enter into certain sale and lease-back transactions" [`FY26 10-K, Note 11 (Debt) — Senior Notes`]. So the maximum Leverage Ratio is the only metric that can be breached on a financial test.

| Covenant | Threshold | Current Actual | Headroom | Source |
|---|---|---:|---:|---|
| **Max net leverage — "Leverage Ratio" (the only maintenance financial covenant)** | **3.75 : 1.00**, tested at the end of **each fiscal quarter**; rises to **4.25 : 1.00 for the first four quarter-ends following a Qualified Acquisition** (an "Adjusted Leverage Ratio Period"), then must return to 3.75x for at least two fiscal quarters before another step-up | **1.07x** — engine-computed on the agreement's own definitions at 2026-09-30 (net Consolidated Total Indebtedness **856.2** ÷ covenant Consolidated Adjusted EBITDA **797.2**); see the build in §3. **Not a company-reported figure** | **+71.4%** (MAX / ceiling form: (3.75 − 1.074) ÷ 3.75) | `FY25 10-K, Exhibit 10.41, §6.05 Financial Covenant`; threshold confirmed in substance by `FY26 10-K, Note 11 (Debt) — Credit Agreement` ("a maximum leverage ratio covenant") |
| Min interest coverage | **None. No interest-coverage covenant exists** in the 2022 Credit Agreement or the Senior Notes indenture | n/a | **n/a — no covenant to have headroom against** | Direct search of `FY25 10-K, Exhibit 10.41` (0 matches for "interest coverage" / "fixed charge"); `FY26 10-K, Note 11 (Debt)` |
| Min liquidity / net worth | **None. No minimum-liquidity and no minimum-net-worth covenant exists** | n/a | **n/a** | Direct search of `FY25 10-K, Exhibit 10.41` (0 matches for "minimum liquidity" / "net worth") |
| Springing covenant trigger (e.g. revolver utilization threshold) | **None — §6.05 is NOT springing.** It applies "determined as of the end of each of its fiscal quarters", unconditionally, whether or not the revolver is drawn. So the covenant is **permanently ACTIVE**, including today with the revolver at **0% drawn** (nil borrowings; 997.9 available of a 1,000.0 commitment; 2.1 of letters of credit outstanding) | Covenant active; revolver utilization 0.0% | n/a — nothing to spring | `FY25 10-K, Exhibit 10.41, §6.05`; `Q2 FY27 10-Q, Note 10 (Debt) — Credit Agreement` |
| **Equity cure rights (Y/N, limits)** | **N — none disclosed.** The agreement contains **no equity-cure / "Cure Amount" / "Specified Equity Contribution" mechanic.** The only "Cure Amount" in the whole FY25 10-K extract sits in a different exhibit (the Receivables Purchase Agreement, Exhibit 10.42) and concerns set-off against the purchaser, not the financial covenant | n/a | **A breach could not be fixed by writing an equity cheque into the covenant calculation** — it would need a waiver or an amendment from the lenders. Conservative reading applied | Direct search of `FY25 10-K, Exhibit 10.41` (0 matches for equity cure / Specified Equity Contribution); match at `FY25 10-K, Exhibit 10.42 (Receivables Purchase Agreement)` is unrelated |
| Other — **quarterly compliance certificate** | Required: "concurrently with any delivery of financial statements… a Compliance Certificate of a Financial Officer… (ii) setting forth reasonably detailed calculations demonstrating compliance with Section 6.05 and (iii) setting forth reasonably detailed calculations demonstrating the Leverage Ratio for the period of four (4) consecutive fiscal quarters" | **The certificate itself is not in the pool, and neither the 10-K nor the 10-Q discloses the computed Leverage Ratio or an explicit "we were in compliance" statement** | — | `FY25 10-K, Exhibit 10.41, §5.01(c)`; absence confirmed by direct search of `FY26 10-K` and `Q2 FY27 10-Q` |
| Other — **cross-default and acceleration** | Events of default include "non-payment of principal and interest when due thereunder, breaches of representations and warranties, **noncompliance with covenants**, acts of insolvency, **cross-defaults to material indebtedness**, and material judgment defaults (subject to certain limitations and cure periods)". On the Senior Notes: automatic acceleration on bankruptcy/insolvency; otherwise holders of **≥25%** of a series may declare it due | No default disclosed | — | `FY26 10-K, Note 11 (Debt) — Credit Agreement` and *— Senior Notes* |
| Other — **change-of-control put** | On a Change of Control Repurchase Event, each Senior Notes holder may require repurchase at **101% of principal plus accrued interest** | Not triggered | — | `FY26 10-K, Note 11 (Debt) — Senior Notes` |
| Other — **rating-linked pricing (not a covenant, but a rating-sensitive cost)** | Revolver loans price at **0.000%–0.625% over an alternate base rate (7.00% at 2026-09-30)** or **1.000%–1.625% over SOFR (~3.91% at 2026-09-30)**, "which rates are determined by the Company's credit rating" | Undrawn, so no cash effect today | — | `Q2 FY27 10-Q, Note 10 (Debt)`; `FY26 10-K, Note 11 (Debt)` (6.75% ABR / ~3.66% SOFR at 2026-03-31) |
| Other — **negative covenants and the incremental basket** | Limits on the ability to "incur **subsidiary indebtedness**, grant liens, and dispose of all or substantially all assets, in each case subject to certain exceptions and baskets". **Uncommitted** incremental capacity of up to the greater of **250.0 and 35.0% of Consolidated Adjusted EBITDA** = **279.0** on my 797.2 covenant-EBITDA build | n/a (uncommitted — excluded from liquidity) | — | `FY26 10-K, Note 11 (Debt) — Credit Agreement`; 0.35 × 797.2 = 279.0, my arithmetic |

**Direction-awareness check (MODULE_RULES Calculation Standard 11), done explicitly.** The one covenant here is a **MAX / ceiling** covenant, so headroom = (threshold − actual) ÷ threshold = (3.75 − 1.074) ÷ 3.75 = **+71.4%**, positive meaning headroom remaining. There are **no MIN / floor covenants** in this structure (no minimum coverage, liquidity or net worth), so the MIN formula has nothing to apply to and the sign-inversion trap cannot arise. Stated so `06_downside-stress-test` can rely on it.

### A genuine reading ambiguity in the covenant text, named and resolved from the filings

The frozen extract of Exhibit 10.41 is a **conformed redline** of Amendment No. 3: deleted and inserted words are run together without markup, so the raw text reads, for example, "May 2319, 20272030", "DecemberMarch 31, 2025", and "$1,000,000,000the Maximum Cash Netting Amount". This is a real ambiguity on a material term and is flagged rather than ignored. **It is resolved by cross-checking the FY26 10-K's own narrative, which states the post-amendment facts directly:** the facility is **1,000.0** (not 750.0) and the maturity date is **May 19, 2030** (not May 23, 2027) [`FY26 10-K, Note 11 (Debt) — Credit Agreement`]. In every redline pair, therefore, the **inserted** text is the operative one. Applying that consistently:

- The operative §6.05 threshold is the **flat 3.75 : 1.00 for each fiscal quarter ending on or after March 31, 2025**, with the 4.25x post-Qualified-Acquisition window — **not** the superseded step-down schedule (4.75x Jun-2024 / 5.75x Sep-2024 / 5.50x Dec-2024 / 4.25x Mar & Jun-2025 / 4.00x Sep-2025 / 3.75x Dec-2025 and thereafter), which is the struck text. At 2026-09-30 both readings give **3.75x**, so the ambiguity does not change today's threshold.
- The operative cash-netting allowance is **"the Maximum Cash Netting Amount"**, defined as "**(i) until and including December 31, 2026, $2,000,000,000 and (ii) thereafter, $1,500,000,000**" — **not** the struck flat $1,000,000,000 [`FY25 10-K, Exhibit 10.41`, definition of "Maximum Cash Netting Amount"]. **This corrects `00_solvency-data-triage.md` §5 note 3 by name**, which recorded the netting allowance as "up to $1,000,000,000" — that is the deleted figure. It matters: the step-down from 2,000.0 to 1,500.0 on 2026-12-31 is a dated, contractual tightening of headroom, quantified in §3 below.

### Covenant EBITDA Definition & Quality (required, because headroom is computed)

| Item | Value / Description | Source |
|---|---|---|
| **Covenant EBITDA definition summary** | **"Consolidated Adjusted EBITDA" = Consolidated Net Income** (GAAP net income or loss of the Borrower and consolidated Subsidiaries) **plus**, without duplication and only to the extent deducted in arriving at it, a list of twenty add-backs **(a)–(t)**, **minus** interest income, extraordinary income/gains and other non-cash income; then **plus increases in deferred revenue and minus decreases in deferred revenue** for the period; minus cash paid in the period for non-cash charges added back earlier; **plus** pro-forma Acquired EBITDA of businesses bought in the period and **minus** Disposed EBITDA of businesses sold. Measured over **the trailing four consecutive fiscal quarters** for which financial statements have been delivered. The ratio is `Consolidated Total Indebtedness ÷ Consolidated Adjusted EBITDA` | `FY25 10-K, Exhibit 10.41`, definitions of "Consolidated Adjusted EBITDA", "Consolidated Net Income", "Leverage Ratio" |
| **Addbacks permitted (types)** | (a) income/franchise taxes · (b) interest expense **and** amortisation/write-off of debt discount, issuance costs, commissions, discounts and other Indebtedness fees · (c) **depreciation and amortisation expense** · (d) **amortisation of intangibles including goodwill** and organisation costs · (e) **unusual, infrequent, extraordinary or non-recurring charges, expenses or losses** · (f) **non-cash stock option and other equity-based compensation** · (g) any other non-cash charges/expenses/losses (excluding ordinary-course accruals or reserves for future cash charges) · (h) losses on early extinguishment of debt · (i) unrealised Swap losses (net of gains) · (j) **foreign-exchange losses (net of gains)** · (k) indemnified acquisition expenses actually reimbursed in cash · (l) **acquisition-related expenses, successful or not** · (m) equity-issuance transaction costs, successful or not · (n) **restructuring, integration and related charges** (expressly including retention, severance, systems-establishment, contract-termination including future lease commitments, facility consolidation and employee relocation) · (o) **non-recurring litigation expenses** · (p) losses (or gains) on strategic investments · (q) losses on discontinued licensed-IP commitments · (r) other adjustments consistent with Regulation S-X · (s) **"other addbacks and adjustments set forth in the Models"** · (t) **projected "run rate" synergies, operating-expense reductions, net cost savings and integration costs** | `FY25 10-K, Exhibit 10.41`, definition of "Consolidated Adjusted EBITDA", clauses (a)–(t) |
| **Addback caps / limits** | Only **two** real limits exist, and only one is numeric. (1) **Clause (t) run-rate synergies are capped at 15% of Consolidated EBITDA for the period** (calculated after giving effect to the clause-(t) add-back), must be "reasonably identifiable, factually supportable", expected to continue, realisable within **18 months**, certified in detail by a Financial Officer, net of benefits already realised, and non-duplicative. (2) Acquired/Disposed EBITDA pro-forma adjustments are **elective** below **1,000.0 of consideration per acquired business** and **500.0 per disposed business**. **Clauses (e), (f), (g), (l), (n), (o) and (s) carry NO cap** — in particular stock-based compensation (f) and "non-recurring" charges (e) are uncapped, and clause (s) refers add-backs out to private "Models prepared by JPMorgan Chase Bank, N.A." for the ratings and Senior Notes marketing presentations, **which are not in this pool and whose contents are therefore unknown** | `FY25 10-K, Exhibit 10.41`, clause (t) provisos (x)(y)(z), clauses (iv)–(v), and the definition of "Models" |
| **Is covenant EBITDA materially above reported EBITDA?** | **Yes — materially, and in two steps.** Against the only reported GAAP anchor (an LTM **operating loss of 180.8**) there is no comparison to make. Against the non-GAAP bases: my conservative covenant build is **797.2**, which is **17.6% above (A) company-defined 677.6** (+119.6) and **10.0% above (B) vendor 724.9** (+72.3). The single largest driver is **uncapped stock-based compensation of 344.7**, partly offset by the **225.0 deferred-revenue decrease** the contract makes me subtract. And 797.2 is itself the *floor* of the plausible covenant range: on the broad-but-textually-available reading of clause (c) "depreciation and amortisation expense", the **411.9 of capitalised-content amortisation** is also an add-back, lifting covenant EBITDA to **1,209.1** — **78.4% above (A)** — before any use of clauses (e), (j), (l), (n), (o), (s) or (t). | My build in §3, from `FY26 10-K` and `Q2 FY27 10-Q` statement lines; definition per `FY25 10-K, Exhibit 10.41` |

**Headroom quality: LOW-to-MEDIUM, and the reason is specific — not an absence of disclosure.** The definition is fully disclosed, so the MODULE_RULES "no covenant-EBITDA definition" cap does not bite. What degrades the *quality* of the headroom is the content of that definition plus three unknowns:
1. **Uncapped add-backs do most of the work.** 344.7 of stock-based compensation (clause (f)) is added back with no limit, on a measure used to test a 3.75x ceiling. On basis (A) EBITDA of 677.6, that one add-back is 50.9% of the EBITDA base.
2. **Clause (s) points outside the pool.** "Other addbacks and adjustments set forth in the Models" imports an unknown quantity of further add-backs from JPMorgan-prepared models that are not in this evidence set. I cannot size it, and I do not assume it is zero — I state that covenant EBITDA could be **higher** than my 797.2 by an amount I cannot measure. That direction makes the headroom *wider*, not narrower, so my figure is the conservative one.
3. **No company-computed number to check against.** Neither filing discloses the computed Leverage Ratio, the covenant Consolidated Adjusted EBITDA, or an express compliance statement, and the §5.01(c) compliance certificate is not in the pool. **Every covenant figure in §2 and §3 is therefore the engine's own calculation on contract definitions, not a company-reported or auditor-adjacent figure.** This is the single highest-value missing document identified by `00_solvency-data-triage.md` §6, and I carry that qualifier forward unchanged.
4. **"Addback illusion" risk is real but points the right way.** Because my build deliberately omits the uncapped clauses (e), (j), (l), (n), (o), (s) and (t) and the clause-(c) content-amortisation reading, the error in my 1.07x is far more likely to be **too high** (too little headroom) than too low. The illusion risk here is not that the company has hidden headroom from me — it is that a reader could mistake 71.4% of *covenant* headroom for 71.4% of *cash* headroom. It is not: the same company shows **fixed-charge coverage of 0.44x** and **content-adjusted interest coverage of 0.51x** in §1.

---

## 3. Headroom & Breach Proximity

### The covenant build, shown line by line so it can be rebuilt (§15 "aggregates travel with their build")

**Covenant Consolidated Adjusted EBITDA, trailing four quarters to 2026-09-30 — conservative build:**

| Line | LTM amount | Clause | Source of each component |
|---|---:|---|---|
| Consolidated Net Income (net loss): (298.2) − (145.8) + (88.1) | **(240.5)** | base | `FY26 10-K` and `Q2 FY27 10-Q` Statements of Operations |
| + income taxes: 100.4 − 16.5 + (73.1) | **10.8** | (a) | same |
| + interest expense (incl. debt issuance / discount amortisation): 151.4 − 76.3 + 60.6 | **135.7** | (b) | `FY26 10-K, Note 17`; `Q2 FY27 10-Q` |
| + depreciation: 166.4 − 82.9 + 80.5 | **164.0** | (c) | Statements of Cash Flows |
| + amortisation and impairment of intangibles: 725.7 − 349.5 + 321.3 | **697.5** | (d) | Statements of Cash Flows |
| + non-cash stock-based compensation: 305.3 − 136.6 + 176.0 | **344.7** | (f) | Statements of Cash Flows |
| − interest income: 85.1 − 37.2 + 42.1 | **(90.0)** | minus-limb | `FY26 10-K, Note 17`; `Q2 FY27 10-Q` |
| − decrease in deferred revenue: 78.5 − 156.2 + (147.3) = (225.0), so subtracted | **(225.0)** | proviso (ii) | Statements of Cash Flows, Deferred revenue line |
| **= Covenant Consolidated Adjusted EBITDA (conservative)** | **797.2** | | sum of the above; my arithmetic, executed in §5 |
| *Memo: + capitalised-content amortisation 411.9 on the broad clause-(c) reading* | *1,209.1* | *(c)* | *412.8 − 191.7 + 190.8* |

**Deliberately omitted from my build, each of which would RAISE covenant EBITDA and widen headroom:** clause (e) unusual/non-recurring charges, (g) other non-cash charges, (j) FX losses (17.4 in FY2026 alone), (l) acquisition-related expenses, (n) restructuring and integration, (o) non-recurring litigation, (s) "Models" add-backs (unquantifiable from this pool), (t) run-rate synergies up to 15%. My 797.2 is therefore a **floor** on covenant EBITDA.

**Consolidated Total Indebtedness and the contractual cash netting:**

| Line | Amount | Source |
|---|---:|---|
| Face value of borrowings (Senior Notes 2,500.0 + Zynga 2026 Convertible Notes 29.4, plus 0.4 fair-value adjustment) | **2,529.8** | `Q2 FY27 10-Q, Note 10 (Debt)`, maturities table "Total face value"; `01` §7 |
| − Operating-lease liabilities: **expressly excluded.** "Indebtedness shall not include Non-Financing Lease Obligations or other obligations under or in respect of operating leases". Consolidated Total Indebtedness is limited to Indebtedness clauses (a) borrowed money, (b) bonds/debentures/notes and (g) **Financing** Lease Obligations — and TTWO has **no finance leases** | **(0.0)** | `FY25 10-K, Exhibit 10.41`, definitions of "Indebtedness" and "Consolidated Total Indebtedness"; `01` §1 (zero occurrences of "finance lease" in the FY26 10-K) |
| − Contractual cash netting: "Consolidated Total Indebtedness shall be reduced by up to the Maximum Cash Netting Amount of cash and Permitted Investments… that does not appear as 'restricted'". Cap = **2,000.0** until and including 2026-12-31. Actual unrestricted = cash & equivalents **1,149.4** + liquid short-term investments **524.2** = **1,673.6**, which is below the cap, so the full amount nets | **(1,673.6)** | `FY25 10-K, Exhibit 10.41`, "Consolidated Total Indebtedness" and "Maximum Cash Netting Amount"; balances from `Q2 FY27 10-Q, Condensed Consolidated Balance Sheets` and `Note 5 (Short-Term Investments)` |
| **= Net Consolidated Total Indebtedness (covenant basis)** | **856.2** | 2,529.8 − 1,673.6 |

**One labelled assumption inside the netting, and the conservative alternative run beside it.** The 524.2 of short-term investments is "primarily… bank time deposits with maturities greater than 90 days" [`Q2 FY27 10-Q, Item 2 MD&A`]. "Permitted Investments" clause (d) covers "certificates of deposit, time deposits, or bankers' acceptances maturing no more than two (2) years from the date of acquisition… issued or guaranteed by or placed with… any bank organized under the laws of (i) the United States of America or any state thereof or (ii) a jurisdiction other than the United States of America but with a presence in the United States of America, in each case, having at the date of acquisition thereof combined capital and surplus of not less than $250,000,000". The filing does **not** name the banks or confirm the two-year maturity and capital tests, so whether the full 524.2 qualifies is **not proven from available data** — *inference, not from filings.* The **cash-only-netting** case below is the conservative version that assumes none of it qualifies.

### Headroom table — all four netting cases, direction-aware (MAX / ceiling form)

| Case | Net Consolidated Total Indebtedness | ÷ covenant EBITDA | Leverage Ratio | Threshold | **Headroom** |
|---|---:|---:|---:|---:|---:|
| **Base — full netting (1,673.6 nets; cap 2,000.0 not binding)** | **856.2** | 797.2 | **1.074x** | 3.75x | **+71.4%** |
| Conservative — cash-&-equivalents-only netting (1,149.4) | 1,380.4 | 797.2 | 1.732x | 3.75x | **+53.8%** |
| **Bound — no netting at all** (contrary to the contract; shown only to size how much of the headroom the netting clause creates) | 2,529.8 | 797.2 | 3.173x | 3.75x | **+15.4%** |
| Generous covenant EBITDA (content amortisation added back, 1,209.1), full netting | 856.2 | 1,209.1 | 0.708x | 3.75x | +81.1% |
| Mid-cycle / normalised — covenant EBITDA proxy 621.7 (mid-cycle 565.3 × my 797.2/724.9 covenant uplift of 1.0997), full netting | 856.2 | 621.7 | 1.377x | 3.75x | **+63.3%** |
| Company-guided FY2027 peak — covenant proxy 1,158.0 (guided 1,053 × 1.0997), full netting. **A forecast, not a reported period** | 856.2 | 1,158.0 | 0.739x | 3.75x | +80.3% |

The **mid-cycle row is the central estimate** for a company `business-model/07_business-quality.md` scores at Cyclicality **22/100** and calls "a cyclical, hit-driven owner of entertainment intellectual property"; the guided-peak row is a floor on leverage, not a forecast of headroom. The mid-cycle and guided-peak covenant-EBITDA figures are **proxies built by scaling**, labelled as such — *inference, not from filings* — because the contract's add-back list cannot be rebuilt for a five-year average or for a forward guide.

### A dated tightening nobody has to do anything to trigger: 2026-12-31

The Maximum Cash Netting Amount steps **down from 2,000.0 to 1,500.0 "thereafter"** — i.e. from the quarter ending 2027-03-31 onwards. Today's 1,673.6 of unrestricted cash and investments is **above** 1,500.0, so the step-down bites by 173.6 of lost netting. Combined with the 29.4 of 2026 Convertible Notes repaying on **2026-12-15** (which reduces both debt and cash):

- debt 2,529.8 − 29.4 = **2,500.4**; unrestricted cash 1,673.6 − 29.4 = **1,644.2**; netting capped at **1,500.0**
- net Consolidated Total Indebtedness = **1,000.4** → Leverage Ratio **1.255x** → headroom **+66.5%**
- **The step-down costs about 4.8 percentage points of headroom all by itself**, with no change in trading. It is mechanical, dated, and not disclosed in either the 10-K or the 10-Q narrative — it is only visible in the exhibit.

### Breach proximity

| Metric | Value |
|---|---:|
| **Tightest covenant** | **Maximum Leverage Ratio, 3.75 : 1.00**, §6.05 of the 2022 Credit Agreement — and it is tightest by default: it is the **only** maintenance financial covenant in the entire structure (no interest-coverage, no minimum-liquidity, no net-worth test; the Senior Notes indenture has none) |
| **Headroom on tightest covenant (%)** | **+71.4%** (base, full netting: 1.074x against 3.75x). **+53.8%** on cash-only netting; **+63.3%** on mid-cycle covenant EBITDA; **+66.5%** from 2027-03-31 after the netting step-down. Engine-computed on the agreement's definitions — **not a company-reported figure** |
| **EBITDA decline that would breach it (approx.)** | **About 71% — a fall in covenant EBITDA from 797.2 to 228.3**, holding debt and cash constant (856.2 ÷ 3.75 = 228.3). On cash-only netting: **about 54%** (to 368.1). From 2027-03-31 after the netting step-down: **about 66%** (to 266.8). **Cash does not stay constant in a real downside, and that is what actually tightens this covenant** — because netting is the cushion. Holding EBITDA's *breach point* against a falling cash balance: cash at 75% of 1,673.6 → breach at a **57%** EBITDA fall; at 50% → **43%**; at 25% → **29%**; at zero → **15%**. **So the covenant is far more sensitive to cash leaving the balance sheet than to EBITDA falling.** `06_downside-stress-test` should run the two together, not separately |
| **Debt increase that would breach it (approx.)** | **About +2,133 of NET debt** (max permitted net Consolidated Total Indebtedness = 3.75 × 797.2 = 2,989.5, against today's 856.2). On gross borrowings, that is a rise from 2,529.8 to about **4,663** if cash is unchanged. **Fully drawing the 1,000.0 committed revolver would not breach it** — and on day one would not move the ratio at all, because a draw adds debt and cash in equal measure and the 2,000.0 netting cap is not yet binding (1,673.6 + 1,000.0 = 2,673.6 exceeds the cap, so 673.6 of the draw would stop netting and the ratio would rise to (3,529.8 − 2,000.0) ÷ 797.2 = **1.92x**, still +48.8% of headroom). The 279.0 **uncommitted** incremental basket (greater of 250.0 and 35% of Consolidated Adjusted EBITDA) adds nothing to that conclusion |

**The operational move that would actually trip it.** Not an EBITDA fall on its own — a **71% drop in covenant EBITDA** is far outside anything in this company's own ten-year history (the worst year in the series is FY2025 at 379.5 against FY2026's 788.5, a 51.9% fall, and that year the covenant threshold had been temporarily loosened to 4.00–4.25x anyway). The realistic path to a breach is **combined**: cash leaving the balance sheet at the same time as EBITDA falls. Concretely, if the company spent down roughly half of its 1,673.6 of cash and investments — which is not far-fetched given it burnt 396.1 of cash in the six months to 2026-09-30, with operating cash flow of **(173.5)** and 163.3 of fixed-asset purchases [`Q2 FY27 10-Q, Condensed Consolidated Statements of Cash Flows`] — then a **43%** covenant-EBITDA fall breaches. A debt-funded acquisition is the other route, and the contract partly anticipates it: a **Qualified Acquisition** lifts the ceiling to 4.25x for four quarters, which buys room rather than removing it.

---

## 4. Coverage / Covenant Read

**Earnings carry the interest bill comfortably on an accrual basis and barely at all on a cash basis, and both statements are true of the same twelve months.** EBITDA of 677.6 (company-defined, LTM to 2026-09-30) covers gross interest expense of 135.7 **4.99 times** (5.34x on the vendor's 724.9) — but EBIT is **negative** at (180.8), so interest coverage on operating profit is **(1.33)x**; charge the 304.5 of total capex and coverage falls to **2.75x**; charge the 304.4 gap between the 716.3 of cash spent on games and the 411.9 of amortisation booked for it and coverage falls to **0.51x**; and fixed-charge coverage — earnings after investment over interest plus the 629.4 of debt actually due in the next twelve months plus 82.4 of rent — is **0.44x**. The 629.4 is covered by the 1,673.6 of cash and liquid investments (2.7x), not by earnings, which is why `03_liquidity-runway` and `02_maturity-wall-and-refinancing` own the next part of this question. `earnings/06_earnings-quality.md` scores earnings quality **48/100** with CFO/EBITDA at **50.6%**, so the 4.99x headline must never travel without the 0.51x beside it.

**The tightest covenant is the maximum Leverage Ratio of 3.75 : 1.00, and it is tightest only because it is the sole maintenance financial covenant in the entire capital structure — there is no interest-coverage test, no minimum-liquidity test, no net-worth test, and the Senior Notes indenture carries no maintenance covenant at all.** On the agreement's own definitions at 2026-09-30 I compute a Leverage Ratio of **1.07x** — net Consolidated Total Indebtedness of 856.2 (face borrowings 2,529.8 less the full 1,673.6 of contractually nettable unrestricted cash and investments, against a netting cap of 2,000.0) over covenant Consolidated Adjusted EBITDA of 797.2 — giving **+71.4% of headroom**, or **+53.8%** if none of the 524.2 of bank time deposits qualifies as a Permitted Investment, and **+63.3%** on a mid-cycle covenant-EBITDA proxy of 621.7. **This is the engine's own calculation, not a company-reported figure**: neither filing discloses the computed ratio and the quarterly compliance certificate is not in the pool. Two things degrade the quality of that headroom without narrowing it: **344.7 of uncapped stock-based-compensation add-back** (50.9% of the EBITDA base it sits on), and clause (s), which imports an unknown further set of add-backs from JPMorgan-prepared "Models" that are not in this evidence set.

**What would trip it: cash leaving, not EBITDA falling.** Holding cash constant, covenant EBITDA would have to fall about **71%** (to 228.3) to breach — outside anything in this company's own history, where the worst year, FY2025, fell 51.9%. But the netting clause is what creates most of the cushion: with **no** netting the ratio is 3.17x and headroom is only **+15.4%**, so the breach point moves to a **57% / 43% / 29%** EBITDA fall if cash and investments run down to 75% / 50% / 25% of today's 1,673.6 — and the company burnt 396.1 of cash in the last six months with operating cash flow of **(173.5)**. **Two dated items tighten this before any trading deteriorates:** the 29.4 of Zynga 2026 Convertible Notes repay on **2026-12-15**, and the contractual Maximum Cash Netting Amount steps **down from 2,000.0 to 1,500.0 on 2026-12-31** — together costing roughly **4.8 percentage points** of headroom (to 1.255x, +66.5%) from the quarter ending 2027-03-31, mechanically. And there is **no equity cure right** in this agreement: a breach would need a lender waiver or amendment, not a cheque. `06_downside-stress-test` should therefore stress EBITDA and the cash balance **jointly**, using the cash-only-netting case as its conservative anchor.

---

## 5. Executed Calculation Record (fix F09)

Every ratio and headroom percentage above was produced by executed Python, not mental arithmetic. Two `Bash` runs; the inputs are the filing lines cited in §1 and §3, and the printed output is reproduced verbatim.

**Run 1 — LTM bridges, coverage ratios, covenant-EBITDA build, headroom and breach proximity:**

```
python3 - <<'PY'
r=lambda x,n=2: round(x,n)
def ltm(fy, h1_prior, h1_cur): return fy - h1_prior + h1_cur
int_exp = ltm(151.4, 76.3, 60.6)      # LTM gross interest expense
int_inc = ltm(85.1, 37.2, 42.1)       # LTM interest income
capex_fx = ltm(162.8, 57.0, 163.3)    # LTM purchases of fixed assets
capex_tot= ltm(190.2, 68.4, 182.7)    # LTM total capex (fixed + asset acquisitions)
dep  = ltm(166.4, 82.9, 80.5); amint= ltm(725.7, 349.5, 321.3)
amsw = ltm(412.8, 191.7, 190.8); cash_sw = ltm(688.9, 345.0, 372.4)
sbc  = ltm(305.3, 136.6, 176.0); cni = ltm(-298.2, -145.8, -88.1)
tax  = ltm(100.4, 16.5, -73.1); dr = ltm(78.5, 156.2, -147.3)
op_loss = ltm(-104.2, -76.4, -153.0)
EA, EB, EC = 677.6, 724.9, 565.3       # EBITDA bases (A)/(B)/(C) from 01 §7
sched_amort_12m = 29.4 + 600.0; lease_cash_fy26 = 82.4
cov = cni + tax + int_exp + dep + amint + sbc - int_inc + dr
CTI_face = 2529.8; net_full = min(1149.4+524.2, 2000.0); net_cash_only = min(1149.4, 2000.0)
THRESH = 3.75
hr_max = lambda th, act: (th-act)/th     # MAX / ceiling covenant form
PY
```

```
LTM gross interest expense = 135.7      LTM interest income = 90.0      LTM NET interest expense = 45.7
LTM capex (fixed assets) = 269.1        LTM total capex (fixed+asset acq) = 304.5
LTM depreciation = 164.0                LTM amort/impair acquired intangibles = 697.5
LTM amort/impair software dev costs = 411.9   LTM cash software dev spend = 716.3
  excess cash content spend over amortization = 304.4
LTM stock comp = 344.7                  LTM Consolidated Net Income (net loss) = -240.5
LTM income tax provision = 10.8         LTM change in deferred revenue = -225.0
LTM GAAP operating loss = -180.8
--- Coverage on gross interest expense 135.7 ---
  EBITDA/int (A) company-defined 677.6: 4.99x | (EBITDA-totcapex)/int: 2.75x | (EBITDA-fxcapex)/int: 3.01x
  EBITDA/int (B) vendor 724.9: 5.34x | (EBITDA-totcapex)/int: 3.1x | (EBITDA-fxcapex)/int: 3.36x
  EBITDA/int (C) mid-cycle 565.3: 4.17x | (EBITDA-totcapex)/int: 1.92x | (EBITDA-fxcapex)/int: 2.18x
  EBIT/int (GAAP op loss -180.8): -1.33 x  | vendor EBIT -112.5: -0.83 x
  EBITDA/NET interest (A): 14.83 x | (B): 15.86 x
  content-adj (A): (EBITDA - totcapex - excess content spend)/int = 0.51 x
  FCCR den = int 135.7 + sched amort 12m 629.4 + lease cash 82.4 = 847.5
  FCCR (A): 0.44 x | (B): 0.5 x
  FCCR ex-amortization (int+lease only): 1.71 x (A); 1.93 x (B)
Covenant Consolidated Adjusted EBITDA (conservative build) = 797.2
  + content amortization (clause (c) broad reading)   = 1209.1
  Full netting (cash+time deposits 1,673.6): net CTI 856.2 / cov-EBITDA 797.2 = 1.074x vs 3.75x -> headroom 71.4%
  Cash-only netting (1,149.4):               net CTI 1380.4 / cov-EBITDA 797.2 = 1.732x vs 3.75x -> headroom 53.8%
  No netting (bound, contrary to contract):  net CTI 2529.8 / cov-EBITDA 797.2 = 3.173x vs 3.75x -> headroom 15.4%
  Full netting, generous cov-EBITDA:         net CTI 856.2 / cov-EBITDA 1209.1 = 0.708x vs 3.75x -> headroom 81.1%
Breach EBITDA (full netting): net CTI 856.2 /3.75 = 228.32 -> cov-EBITDA decline needed: 71.4 %
Breach EBITDA (cash-only netting): 368.11 -> decline 53.8 %
Max permitted net CTI at cov-EBITDA 797.2 = 2989.5 -> net debt headroom 2133.3
  gross debt could rise to 4663.1 from 2529.8 -> + 2133.3
Revolver utilization: 0.0 % -> no springing covenant applies (none exists)
```

**Run 2 — cycle-position proxies, the 2026-12-31 netting step-down, and the joint cash/EBITDA sensitivity:**

```
covenant-EBITDA / vendor-EBITDA uplift factor = 1.0997
mid-cycle covenant-EBITDA proxy = 621.68
mid-cycle: 856.2 / 621.68 = 1.377 x -> headroom 63.3 %
guided-peak covenant-EBITDA proxy = 1158.02 -> lev 0.739 x headroom 80.3 %
After 2026-12-15 convertible repay + 2026-12-31 netting step-down: debt 2500.4, cash 1644.2, netting capped 1500.0
  net CTI = 1000.4 -> lev 1.255 x -> headroom 66.5 %
  vs today's 1.074x / 71.4%  => step-down costs 4.8 pp of headroom
  breach cov-EBITDA = 266.77 -> decline from 797.2 of 66.5 %
  cash at 100% of 1,673.6 = 1673.6: net CTI 856.2,  breach cov-EBITDA 228.32 -> decline 71.4%
  cash at  75% of 1,673.6 = 1255.2: net CTI 1274.6, breach cov-EBITDA 339.89 -> decline 57.4%
  cash at  50% of 1,673.6 =  836.8: net CTI 1693.0, breach cov-EBITDA 451.47 -> decline 43.4%
  cash at  25% of 1,673.6 =  418.4: net CTI 2111.4, breach cov-EBITDA 563.04 -> decline 29.4%
  cash at   0% of 1,673.6 =    0.0: net CTI 2529.8, breach cov-EBITDA 674.61 -> decline 15.4%
```

---

## 6. Qualifiers Downstream Agents Must Carry Forward

1. **Every coverage and leverage multiple here rests on a non-GAAP EBITDA.** GAAP operating profit is a **loss** of (180.8) over the LTM and (104.2) in FY2026, so EBIT/interest is negative and there is no GAAP-EBITDA-based coverage ratio to show.
2. **Covenant headroom is the engine's own calculation on contract definitions, not a company-reported figure.** No computed Leverage Ratio, no covenant Consolidated Adjusted EBITDA and no express compliance statement appears in the FY26 10-K or the Q2 FY27 10-Q, and the §5.01(c) compliance certificate is not in the pool.
3. **My covenant EBITDA of 797.2 is a FLOOR.** Seven uncapped add-back clauses — (e), (g), (j), (l), (n), (o), (s) — and clause (t) run-rate synergies (capped at 15%) are deliberately excluded, as is the broad clause-(c) reading that would add the 411.9 of capitalised-content amortisation and lift it to 1,209.1. Error in the 1.07x runs toward **too little** headroom, not too much.
4. **The netting amount was misread upstream and is corrected here.** `00_solvency-data-triage.md` §5 note 3 records the indebtedness-netting allowance as "up to $1,000,000,000". That is the **struck** figure in the conformed redline of Amendment No. 3. The operative term is the **Maximum Cash Netting Amount: 2,000.0 until and including 2026-12-31, then 1,500.0** [`FY25 10-K, Exhibit 10.41`]. The resolution is evidence-based, not assumed: the FY26 10-K's own narrative confirms the *inserted* side of every other redline pair (facility 1,000.0, maturity 2030-05-19).
5. **A dated, mechanical tightening sits in the exhibit and in neither filing's narrative:** the netting step-down on 2026-12-31 costs about **4.8 percentage points** of headroom from the quarter ending 2027-03-31 with no change in trading.
6. **There is no equity cure right.** A §6.05 breach would require a lender waiver or amendment. No cure mechanic, size limit or frequency limit exists to soften it.
7. **No springing covenant exists**, and §6.05 is **permanently active** — tested at every fiscal-quarter end whether or not the revolver is drawn (it is 0% drawn; 997.9 available of 1,000.0; 2.1 of letters of credit).
8. **The covenant is more sensitive to the cash balance than to EBITDA**, because contractual cash netting supplies most of the cushion (removing it alone takes headroom from +71.4% to +15.4%). `06` must stress cash and EBITDA jointly and should use the **cash-only-netting case (+53.8%)** as its conservative anchor.
9. **Whether the 524.2 of bank time deposits qualifies as "Permitted Investments" is not proven from available data** — the filing names neither the issuing banks nor the deposit maturities against the contract's two-year and $250,000,000-capital tests. *Inference, not from filings.* Both the full-netting and cash-only-netting cases are carried above for that reason.
10. **Source-check status: UNCHECKED, not verified clean.** No `numeric_reading_check` field exists on any of the 30 manifest sources. Every amount above was verified by a direct read of the frozen filing extract that reports it; the one vendor figure used as a cross-check (LTM interest expense −135.7) matched my filing build exactly, and the vendor LTM EBIT of (112.5) is cited under the vendor's own name, not a filing's.

**No partial-data cap applies to this agent.** Covenant disclosure is present and numeric, the covenant-EBITDA definition is fully disclosed, interest-expense detail is disclosed by year and by instrument, and the cash flow statements are present — so neither the "no covenant disclosure" rule (headroom "Not assessable"; Overall usefulness max 75), the "no covenant EBITDA definition" rule (covenant confidence capped), the "no interest-expense detail" rule (coverage proxied), nor the "no cash flow statement" rule binds. The MODULE_RULES cap *"covenant headroom relies on assumed covenant-EBITDA addbacks → max 60"* is **not** triggered either: the add-backs I used are the contract's own enumerated clauses applied to the filings' own lines, and the clauses I could not quantify were omitted rather than assumed. What limits confidence instead is the **absence of a company-computed ratio to check my build against** (qualifier 2), which `99` should weigh as a confidence qualifier rather than a hard cap.

**No solvency verdict is made here.** The maturity wall (`02`), the liquidity runway (`03`), off-balance-sheet items (`05`), the downside stress test (`06`) and the solvency verdict (`99`) are other agents' work.
