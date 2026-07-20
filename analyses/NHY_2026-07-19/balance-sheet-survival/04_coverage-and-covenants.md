# Coverage & Covenants — NHY

Norsk Hydro ASA (Oslo Børs: NHY) reports under IFRS Accounting Standards as adopted by the EU, in Norwegian krone (NOK million), fiscal year ended 31 December [Integrated Annual Report 2025, p.140]. This is a Norwegian listed issuer, not a US SEC or India SEBI filer; the local-equivalent documents are the Board-approved Integrated Annual Report 2025 (annual-filing equivalent) and the Board-approved First Quarter Report 2026 (interim-filing equivalent) [`00_solvency-data-triage.md`]. Debt, net-debt basis, and the EBITDA base are carried forward from `01_capital-structure-and-leverage.md` (canonical strict net debt NOK 20,489m; canonical EBITDA base = company-reported audited EBITDA, FY2025 NOK 25,696m).

## 1. Coverage Ratios

All ratios use **gross** interest expense — Note 7.5 "Finance income and expense," "Interest expense (amortized cost)" NOK 2,357m FY2025, which already includes the lease-interest component (NOK 391m, separately disclosed as required by IFRS 16 but not additive to the 2,357m total) [Integrated Annual Report 2025, Note 7.5, p.182; Note 7.4 lease note, p.165]. This is the audited group interest expense, not a proxy — the no-interest-detail partial-data rule does not apply here.

| Ratio | Value (FY2025) | Value (TTM, ended 31-Mar-2026) | Source |
|---|---:|---:|---|
| EBITDA / interest (reported EBITDA) | 10.90x (25,696 / 2,357) | 9.82x (21,976 / 2,239) | [Integrated Annual Report 2025, p.36 (EBITDA), Note 7.5, p.182 (interest); First Quarter Report 2026, p.6, p.17 (finance note)] |
| EBITDA / interest (adjusted EBITDA, memo) | 12.26x (28,889 / 2,357) | n/a — TTM adjusted EBITDA not separately built here | [Integrated Annual Report 2025, p.36] |
| EBIT / interest | 6.11x (14,401 / 2,357) | 4.82x (10,781 / 2,239) | [Integrated Annual Report 2025, p.140 (EBIT); First Quarter Report 2026, p.6] |
| (EBITDA − capex) / interest | 5.99x (14,114 / 2,357) | 4.62x (10,346 / 2,239) | Derived from `earnings/01_historical-financials.md` §1–§2 |
| Fixed-charge coverage: (EBITDA − capex) / (interest + 12-month scheduled debt maturities) | 1.36x (14,114 / 10,403; maturities = current portion of long-term debt NOK 8,046m at FY2025-end) | 1.41x (10,346 / 7,341; maturities = short-term debt NOK 5,102m at Q1 2026-end) | [Integrated Annual Report 2025, Note 7.4, p.181 (current portion); First Quarter Report 2026, p.17 (balance sheet)] |

**Formula and derivation shown (Bash/Python executed, not mental arithmetic):**
```
interest_ttm = interest_FY2025 (2,357) − interest_Q1'25 (588) + interest_Q1'26 (470) = 2,239
EBITDA/interest FY2025  = 25,696 / 2,357  = 10.90x
EBIT/interest FY2025    = 14,401 / 2,357  = 6.11x
(EBITDA−capex)/interest = (25,696−11,582) / 2,357 = 5.99x
Fixed-charge coverage   = (25,696−11,582) / (2,357+8,046) = 1.36x
```

**EBITDA basis stated:** the primary base is **company-reported (audited) EBITDA** (NOK 25,696m FY2025), not the company's own further-adjusted EBITDA APM (NOK 28,889m, which is shown as a memo column above) and not the Capital IQ workbook's "EBITDA" field (NOK 51,454m for FY2025), which the earnings module flagged as a template/extraction mismatch that does not reconcile to any audited figure and is not used anywhere in this report [`earnings/01_historical-financials.md`, data-quality note]. Interest is **gross** (Note 7.5 "Interest expense," not netted against interest income).

**Cash-backing of the EBITDA base:** per `earnings/06_earnings-quality.md`, multi-year cash conversion (CFO/EBITDA) is 95.4% (FY2023), 57.9% (FY2024), 90.7% (FY2025) — a 3-year average of 81.3% and a TTM figure of 79.4%, both above the module's 70% "healthy" threshold. Reported EBITDA is **not materially above cash-backed EBITDA on a multi-year average basis**, but the most recent standalone quarter (Q1 2026) shows negative operating cash flow (NOK −1,891m) against a positive Adjusted EBITDA of NOK 8,668m, driven by a working-capital build on higher prices [`earnings/06_earnings-quality.md` §2]. Coverage ratios above should therefore be read as sound on a trailing-year basis but with a live, disclosed near-term cash-conversion wrinkle that a single-quarter snapshot would understate.

**Fixed-charge coverage caveat:** the "scheduled debt maturities" figure used (NOK 8,046m current portion of long-term debt at FY2025-end; NOK 5,102m short-term debt at Q1 2026-end) is a balance-sheet snapshot of the next-12-month maturity, not a smoothed annual amortization schedule — it can be lumpy year to year and should be cross-checked against `02_maturity-wall-and-refinancing.md`'s own year-by-year wall once available (that module had not yet produced output at the time this agent ran; this agent proceeded on its own read of the debt note, per MODULE_RULES.md). No separate lease-principal-repayment line is disclosed at the group level beyond what is folded into the current-portion-of-long-term-debt figure, so the fixed-charge formula uses interest + scheduled maturities only ("+ lease payments" collapses into the same maturities line here, since Hydro's lease liabilities are consolidated into the same debt note and are not decomposed into a separate lease-cash-payment schedule in this data pool).

## 2. Covenant Inventory

**No credit-agreement summary or maintenance-covenant schedule with numeric thresholds exists in the data pool.** The only disclosure is qualitative: "the majority of long-term loans are held by the parent company. There are no financial covenants for those loans. Some loans held by part-owned subsidiaries have financial covenants as part of the terms" [Integrated Annual Report 2025, Note 7.4, p.182]. The identity, amount, and specific threshold of those part-owned-subsidiary covenants are **not disclosed**. No credit-agreement, indenture, or bank-facility covenant text is in the pool for the parent-level bonds, term loans, or the two multicurrency revolvers.

Per the module's partial-data rule (no covenant disclosure → typical market covenant as a LABELED assumption; headroom "Not assessable" for scoring), the table below applies an indicative covenant calibrated to Hydro's actual credit profile — an S&P BBB-rated (foreign-currency, long-term) issuer [Credit Health Panel, Capital IQ export, as-of 2026-07-18] — rather than a generic leveraged-loan covenant, since Hydro is investment-grade, not a leveraged borrower. Investment-grade bonds typically carry incurrence covenants (negative pledge, limitation on liens, cross-default), not tight maintenance financial covenants — so a maintenance-covenant framework is itself of limited relevance to the parent-level debt; the assumed thresholds below are shown for indicative headroom only, not as evidence a real covenant exists at these levels.

| Covenant | Threshold | Current Actual | Headroom | Source |
|---|---|---:|---:|---|
| Max net leverage (LABELED ASSUMPTION — typical maintenance-covenant style ceiling for a BBB-rated industrial issuer, conservative low end of the market range) | 3.5x net debt/EBITDA (assumed) | 0.80x (net debt/EBITDA, strict, reported EBITDA) [`01_capital-structure-and-leverage.md` §5] | **+77.2%** (direction: MAX covenant, headroom = (3.5−0.80)/3.5) | Assumption per MODULE_RULES.md partial-data rule; actual from `01` |
| Min interest coverage (LABELED ASSUMPTION) | 3.0x EBITDA/interest (assumed) | 10.90x (FY2025) | **+263.4%** (direction: MIN covenant, headroom = (10.90−3.0)/3.0) | Assumption; actual derived §1 above |
| Min liquidity / net worth | Not disclosed | n/a | Not assessable | Not disclosed in data pool |
| Springing covenant trigger (revolver utilization threshold) | Not disclosed | Both revolvers (USD 1,600m and USD 800m committed) show **NOK 0 drawn** at FY2025-end [`01_capital-structure-and-leverage.md` §1] | Not applicable / not currently active (0% utilization on disclosed facilities) — but existence of a springing trigger is itself not confirmed or denied in the pool | [Integrated Annual Report 2025, p.179] |
| Equity cure rights (Y/N, limits) | Not disclosed | n/a | Not assessable | Not disclosed in data pool |
| Part-owned-subsidiary covenants (actual, disclosed to exist but not quantified) | Not disclosed (amount, metric, threshold all withheld) | Not disclosed | Not assessable | [Integrated Annual Report 2025, Note 7.4, p.182] — "Some loans held by part-owned subsidiaries have financial covenants as part of the terms" |

**Scoring implication:** per MODULE_RULES.md's Score Cap Rules, "No covenant disclosure" → Covenant headroom = "Not assessable" for scoring purposes, and Overall usefulness capped at max 75. The indicative headroom percentages above are shown for directional context only and must not be read as a confirmed covenant test.

### Covenant EBITDA Definition & Quality (required if headroom is computed)

| Item | Value / Description | Source |
|---|---|---|
| Covenant EBITDA definition summary | Not disclosed — no credit-agreement covenant-EBITDA definition exists in the pool. The indicative headroom above uses this module's canonical **reported (audited) EBITDA**, not a covenant-specific definition. | Not disclosed |
| Addbacks permitted (types) | Not disclosed for any real covenant. For context: the company's own **adjusted EBITDA APM** (NOK 28,889m FY2025, +NOK 3,193m vs reported) adds back unrealized LME/power/raw-material derivative timing gains, rationalization & closure costs, and transaction-related items — a company reporting APM, not a covenant definition [Integrated Annual Report 2025, p.36]. | [Integrated Annual Report 2025, p.36] |
| Addback caps / limits | Not disclosed (no real covenant exists to cap) | Not disclosed |
| Is covenant EBITDA materially above reported EBITDA? | Unknown — no covenant-EBITDA definition to compare. If a real covenant used the company's adjusted-EBITDA APM instead of reported EBITDA, covenant EBITDA would run ~12.4% above reported (28,889 vs 25,696, FY2025), which would flatter any real leverage/coverage test versus the figures in §1–§2 above. | Inference, not from filings |

**Explicit statement per partial-data rule:** the covenant definition is undisclosed, so headroom quality is **unknown** — there is a real risk of an "addback illusion" if any actual covenant (particularly at the part-owned-subsidiary level) uses a more generous EBITDA definition than the reported figure used here. This cannot be resolved from the current data pool.

## 3. Headroom & Breach Proximity

| Metric | Value |
|---|---:|
| Tightest covenant (of the two labeled assumptions) | Max net leverage (assumed 3.5x ceiling) — tighter than the assumed min-coverage test in relative headroom terms (+77.2% vs +263.4%) |
| Headroom on tightest covenant (%) | +77.2% (indicative only — Not assessable for scoring per the no-covenant-disclosure cap) |
| EBITDA decline that would breach it (approx.) | A **~77.2% collapse in EBITDA** from FY2025's NOK 25,696m down to ~NOK 5,854m, holding net debt fixed at NOK 20,489m, would push net leverage to the assumed 3.5x ceiling (20,489/5,854 = 3.5x). This is a far larger decline than the module's standard −30%/−40%/−60% stress-test haircuts (see `06_downside-stress-test.md`), which under this labeled assumption would NOT breach the assumed leverage covenant even at −60% EBITDA (25,696 × 0.40 = 10,278; 20,489/10,278 = 1.99x, still well inside 3.5x). |
| Debt increase that would breach it (approx.) | Net debt would need to rise from NOK 20,489m to ~NOK 89,936m (net debt/EBITDA = 3.5x at FY2025 EBITDA held flat) — a **~4.4x increase (+338.9%)** in net debt. This is not a realistic near-term scenario absent a large debt-funded acquisition. |
| EBITDA decline that would breach the assumed min-coverage covenant (3.0x) | EBITDA would need to fall to ~NOK 7,071m (a **72.5% decline** from FY2025's NOK 25,696m), holding interest expense flat at NOK 2,357m, for EBITDA/interest to fall to the assumed 3.0x floor. |

## 4. Coverage / Covenant Read

Earnings comfortably cover interest on the numbers actually disclosed: FY2025 EBITDA/interest is 10.90x and EBIT/interest is 6.11x, falling to 9.82x and 4.82x on a TTM (ended 31-Mar-2026) basis as EBITDA softened on lower alumina prices — both remain multiples away from any plausible distress level. Fixed-charge coverage is thinner at 1.36x (FY2025) because the denominator adds the next 12 months' scheduled debt maturity (NOK 8,046m) to interest — this reflects debt due for repayment/refinancing, not an inability to service interest itself, and should be read alongside `02_maturity-wall-and-refinancing.md`'s own maturity ladder once available. No real maintenance-covenant schedule is disclosed for the parent-level debt (Note 7.4 states there are none for parent-held loans, and confirms — without quantifying — that some part-owned-subsidiary loans do carry covenants); the indicative labeled-assumption test built here (3.5x max leverage, 3.0x min coverage, calibrated to Hydro's BBB S&P rating) shows wide headroom (+77.2% and +263.4% respectively) against actual net leverage of only 0.80x, but this headroom is explicitly **not assessable for scoring** under the module's no-covenant-disclosure cap, and the undisclosed part-owned-subsidiary covenant terms remain a genuine, unquantified gap.

