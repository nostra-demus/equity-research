# Coverage & Covenants — EMAR (Emaar Properties PJSC)

**Reporting standard:** IFRS | **Currency:** AED millions | **Fiscal year:** 31 December  
**Latest period:** FY2025 (Dec-31-2025); Q1-2026 (Mar-31-2026) most recent interim  
**Primary sources:** Capital IQ Annual Financials (Income Statement, Ratios, Capital Structure tabs), FY2025 Investor Presentation / Preliminary Annual Report (Feb-12-2026), earnings/01_historical-financials.md, earnings/06_earnings-quality.md, 01_capital-structure-and-leverage.md  
**Partial-data flag:** No covenant disclosure in pool — actual headroom is not assessable; labeled market-standard assumptions are used and are clearly marked throughout.

All coverage ratios and headroom figures were computed by an executed Python snippet (results shown below each formula). Numbers are not mental arithmetic.

---

## 1. Coverage Ratios

**EBITDA basis:** Reported (CIQ), FY2025 AED 24,132 mn — the canonical basis designated in 01_capital-structure-and-leverage.md. Company-adjusted EBITDA (AED 25,561 mn) is shown for cross-reference. The adjustment (+AED 1,429 mn, +5.9%) backs out a non-cash IFRS 9/15 discounting item; it is mechanically sound and disclosed but is in management's favour, so the more conservative CIQ figure is used as the primary basis for coverage.

**Interest expense basis:** Gross interest expense per CIQ Annual Income Statement, FY2025: AED 492 mn. This is the accrual-basis figure and is used for all coverage ratios per MODULE_RULES §5. Note: interest paid (cash, per CFO bridge in earnings/06_earnings-quality.md) was AED 1,002 mn in FY2025 — roughly 2x the accrual figure. The difference likely reflects: (a) timing of sukuk coupon payments, (b) subsidiary-level interest at Emaar India / Egypt / Pakistan flowing through the consolidated CFS, and (c) finance lease interest (IFRS 16) recorded separately in the cash flow statement rather than in the income-statement interest line. The accrual figure (AED 492 mn) is used for comparability; the cash figure is flagged and materially higher.

**Cash-backing of EBITDA:** Per earnings/06_earnings-quality.md, normalised CFO/EBITDA is approximately 97%–104% (removing off-plan buyer advance payments that inflate reported CFO). EBITDA is well-backed by cash at the operating level. The one structural caveat is that AED 2,505 mn of interest income (non-operating, earned on AED ~43 bn project escrow and deposits, FY2025) flows through reported net income; it does not affect EBITDA directly but flatters reported EPS. Coverage ratios below are not affected by this item.

| Ratio | Formula | Value | Source |
|---|---|---:|---|
| EBITDA / interest expense | 24,132 / 492 | **49.0x** | Capital IQ Annual IS (FY2025); computed |
| EBIT / interest expense | 22,552 / 492 | **45.8x** | Capital IQ Annual IS (FY2025); computed |
| (EBITDA − capex) / interest expense | (24,132 − 934) / 492 | **47.2x** | Capital IQ Annual IS + Capex (FY2025); computed |
| Fixed-charge coverage: (EBITDA − capex) / (interest + current lease payments) | (24,132 − 934) / (492 + 135) | **37.0x** | Capital IQ Capital Structure Summary, FY2025; computed |

**Cross-check on company-adjusted EBITDA (AED 25,561 mn):**
- EBITDA(adj) / interest: 52.0x
- (EBITDA(adj) − capex) / interest: 50.1x

**Cash interest cross-check:** Using interest paid (AED 1,002 mn, cash) instead of accrual interest expense (AED 492 mn):
- EBITDA / interest paid = 24.1x — still vastly above any plausible covenant threshold.

**Caveat on capex split:** Total capex (AED 934 mn) is used as Emaar does not separately disclose maintenance vs. growth capex. If a material share is growth-oriented (hotel/mall expansion), maintenance capex would be lower, and (EBITDA − maintenance capex) / interest would be higher. This means 47.2x is the conservative floor.

---

## 2. Covenant Inventory

**Covenant disclosure status:** No credit agreement, loan agreement, sukuk trust deed, or standalone covenant schedule is present in the data pool. The 00_solvency-data-triage.md confirms: "Covenant / credit-agreement disclosure: Not present in pool as a standalone document." Accordingly, actual covenant headroom cannot be computed. The partial-data rule (MODULE_RULES.md) is applied: labeled market-standard assumptions are used, and covenant headroom is marked "Not assessable" for scoring purposes.

**Basis for labeled assumptions:** Emaar Properties PJSC is rated BBB+ (S&P, stable) / Baa1 (Moody's, stable) as of Jun-28-2026 per Capital IQ Credit Health Panel. This is solid investment-grade. Sukuk trust certificates (the three series representing ~60% of gross debt) typically carry incurrence-based covenants (not maintenance covenants) — i.e., covenants that restrict what the company can do (issue more debt, sell assets) but do not require it to maintain a minimum financial ratio. Bank revolving credit and term loans at IG developers more commonly carry maintenance covenants, but at conservative thresholds. For a BBB+-rated UAE real estate developer, the labeled assumptions below reflect the looser end of the IG covenant spectrum.

| Covenant | Threshold (Labeled Assumption) | Current Actual | Headroom | Source |
|---|---|---:|---:|---|
| Max net leverage (net debt / EBITDA) | 4.0x — labeled assumption for investment-grade UAE real estate developer; typical range 3.5x–5.0x for this credit type | 0.04x (strict basis) / −0.72x (broad basis, net cash) | ~99% (strict) / ~118% (broad) | Labeled assumption; actual per 01_capital-structure-and-leverage.md |
| Min interest coverage (EBITDA / interest) | 3.0x — labeled assumption for investment-grade developer; typical range 2.5x–3.5x | 49.0x (FY2025, reported EBITDA) | ~1,535% | Labeled assumption; computed from Capital IQ Annual IS, FY2025 |
| Min liquidity / net worth | Not assessable — no covenant disclosure | Not assessable | Not assessable | No pool data |
| Springing covenant (e.g., revolver utilization trigger) | Not assessable — no credit agreement in pool. Revolving credit AED 3.7 mn drawn vs. AED 3,669 mn undrawn (FY2025) — effectively undrawn, so any springing covenant based on utilization would almost certainly be inactive | Not active (inference) | Not assessable | Capital IQ Capital Structure Details, FY2025; inference |
| Equity cure rights (Y/N) | Not disclosed | Not disclosed | Not assessable | No pool data |

**Covenant headroom for scoring:** Marked **"Not assessable"** — no actual covenant thresholds are in the data pool. The labeled assumptions produce implied headroom that is extremely wide by any standard (coverage 49x vs. an assumed 3x threshold), but these are assumptions, not disclosures.

### Covenant EBITDA Definition & Quality

| Item | Value / Description | Source |
|---|---|---|
| Covenant EBITDA definition summary | Not disclosed — no credit agreement in pool | No pool data |
| Addbacks permitted (types) | Not disclosed | No pool data |
| Addback caps / limits | Not disclosed | No pool data |
| Is covenant EBITDA materially above reported EBITDA? | Likely not material: company's own adjusted EBITDA (AED 25,561 mn) is only 5.9% above CIQ reported EBITDA (AED 24,132 mn); the single adjustment is a non-cash IFRS 9/15 discounting item; no SBC, no large restructuring adds-back pattern; the FY2021–FY2023 recurring writedowns (AED 3.6 bn total) would have been addbacks under a standard covenant EBITDA definition, but they are absent in FY2024–FY2025 | earnings/06_earnings-quality.md; 01_capital-structure-and-leverage.md |
| Addback illusion risk | Low probability but not provable: no covenant EBITDA definition is disclosed. The disclosed adjustments are modest and mechanically sound. However, because the credit agreement is not in the pool, there is no way to rule out large addbacks (e.g., unrealised gains, exceptional items) that could make headroom look wider than the economic reality. This risk is flagged but, given the extreme coverage ratios (49x on reported EBITDA), even aggressive addbacks would not materially change the safety picture. | Inference, not from filings |

**Explicit statement:** Because the covenant EBITDA definition and addback caps are undisclosed, the headroom quality cannot be fully judged — "addback illusion" risk exists but is assessed as low-probability at these coverage levels.

---

## 3. Headroom & Breach Proximity

All figures are computed from FY2025 reported (CIQ) EBITDA and gross interest expense. Labeled assumptions apply where noted.

| Metric | Value |
|---|---:|
| Tightest labeled covenant | Min interest coverage 3.0x (labeled assumption) |
| Actual EBITDA / interest (FY2025) | 49.0x |
| Headroom on tightest labeled covenant (%) | ~1,535% (labeled — not assessable for scoring) |
| EBITDA decline that would breach min coverage at 3.0x (approx.) | −93.9% (EBITDA from AED 24,132 mn to AED 1,476 mn) |
| Debt increase that would breach max leverage at 4.0x (labeled, EBITDA constant) | AED 95,667 mn additional net debt (9.0x current EBITDA — practically unreachable) |
| Tightest lever in any plausible stress | Interest coverage — but even a −60% EBITDA haircut (to AED 9,653 mn) leaves coverage at 19.6x, far above any plausible minimum |

**Worked EBITDA-decline scenarios against labeled covenants:**

| EBITDA Haircut | EBITDA (AED mn) | EBITDA / Interest | Breach 3.0x min ICR? | Net Leverage (strict basis) | Breach 4.0x max leverage? |
|---|---:|---:|---|---:|---|
| No haircut (FY2025) | 24,132 | 49.0x | No | 0.04x | No |
| −30% | 16,892 | 34.3x | No | 0.05x | No |
| −50% | 12,066 | 24.5x | No | 0.07x | No |
| −60% | 9,653 | 19.6x | No | 0.09x | No |
| −90% | 2,413 | 4.9x | No | 0.36x | No |
| −93.9% (breach point, ICR) | 1,476 | 3.0x | At threshold | 0.58x | No |

*Computed: for each row, EBITDA = 24,132 × (1 − haircut); ICR = EBITDA / 492; Net Leverage (strict) = 861 / EBITDA.*

Even a 93.9% EBITDA collapse — which would take Emaar from its FY2025 level of AED 24,132 mn to AED 1,476 mn, below even the FY2021 trough of AED 7,803 mn by 81% — would be required to breach the labeled minimum coverage covenant. This is not a scenario grounded in any realistic stress; it serves to illustrate that coverage headroom is, by any measure, extreme.

---

## 4. Coverage / Covenant Read

Earnings cover interest by an overwhelming margin: EBITDA / gross interest expense is 49.0x and EBIT / interest is 45.8x on FY2025 reported figures, and even reducing to cash interest paid (AED 1,002 mn) yields 24.1x. These ratios place Emaar in the top tier of investment-grade developers globally. The company's gross debt is only 0.44x EBITDA, and on the broad-basis net-debt measure Emaar is in net cash of AED 17,287 mn — meaning the company could theoretically retire all financial debt and still hold AED 6,672 mn of liquid assets.

No actual covenant thresholds are disclosed in the data pool; the stated headroom figures use labeled market-standard assumptions (max 4.0x net leverage, min 3.0x interest coverage for a BBB+-rated developer) and are marked "Not assessable" for scoring. Against those assumptions, even a 60% EBITDA decline leaves interest coverage at 19.6x — headroom is effectively infinite for any stress scenario that is economically plausible for Emaar. The tightest covenant in any forward scenario is the interest-coverage minimum (closest to being relevant numerically, though still at 1,535% implied headroom on the labeled threshold), and it would require a 93.9% EBITDA collapse — from AED 24,132 mn to AED 1,476 mn, a level below the FY2021 trough by over 80% — to breach.

The single real coverage risk is not a breach but a definitional one: if the credit agreement contains an unusual covenant EBITDA definition that strips out large addbacks or introduces non-standard triggers, headroom quality could differ from what the reported numbers suggest. Given the extreme magnitude of the coverage ratios and the modest gap between reported and company-adjusted EBITDA (5.9%), this risk is low-probability but cannot be confirmed without the credit agreement.

---

*All coverage ratios and headroom percentages computed by executed Python snippet (results shown above the tables). No mental arithmetic. Interest paid vs. accrual discrepancy noted and both figures stated. EBITDA basis and gross/net interest basis stated per MODULE_RULES §5. Covenant headroom marked "Not assessable" per MODULE_RULES Partial-Data cap (no covenant disclosure in pool).*
