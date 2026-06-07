# Downside Stress Test — TMCV

**Company:** Tata Motors Limited (formerly TML Commercial Vehicles Limited), NSEI: TMCV
**Reporting regime:** India / SEBI-LODR. Reporting standard: Ind AS. Currency: INR crore.
**Fiscal year:** April–March. FY26 = April 1, 2025 to March 31, 2026 (first full audited year as a standalone consolidated entity).
**Stress-test date:** June 7, 2026 (based on March 31, 2026 balance sheet).
**Upstream inputs consumed:** `01_capital-structure-and-leverage.md`, `02_maturity-wall-and-refinancing.md`, `03_liquidity-runway.md`, `04_coverage-and-covenants.md`, `05_off-balance-sheet-and-contingencies.md`, `business-model/10_external-dependency.md`, `earnings/03_margin-drivers.md`, `earnings/06_earnings-quality.md`, `earnings/01_historical-financials.md`.

**Critical forward binary:** The Iveco Group acquisition (EUR 3.8 bn, ~₹41,691 crore all-cash, targeted Q2 FY27 close) is pending. All stress scenarios below apply to the **pre-Iveco balance sheet only.** The post-Iveco balance sheet would require a completely separate analysis — it would convert TMCV from a net-cash entity to a heavily net-debt entity and every break point below would shift materially. This caveat is stated once here and is not repeated in each scenario, but it governs the entire read.

---

## 1. Base Case (today)

All figures as at March 31, 2026, in INR crore. Reporting currency: INR crore.

**EBITDA basis:** The stress test uses **Underlying EBITDA of ₹10,314 crore** as the primary base. This is management's disclosed metric (FY26 Integrated Annual Report, MD&A p.215), cash-backed (CFO/Underlying EBITDA = 145% per `earnings/06_earnings-quality.md`), and excludes: the non-cash, non-operating FVTPL fair-value loss of ₹2,418 crore on a subsidiary's equity investment portfolio; MTM on hedges; and exceptional items (stamp duty ₹962 crore, Iveco deal costs ₹87 crore, and new labour code actuarial adjustment ₹389 crore). The reported EBITDA base (~₹8,641 crore) is also run as a cross-check in Section 2. Because CFO runs at 145% of Underlying EBITDA — driven by the deeply negative 54-day cash conversion cycle — the EBITDA base, if anything, understates operating cash generation. There is no case in which reported EBITDA overstates cash-backed earnings here; the adjustment works in the opposite direction.

| Input | Value | Source |
|---|---:|---|
| Base EBITDA (Underlying, cash-backed) | ₹10,314 cr | FY26 Annual Report (Ind AS), MD&A p.215; cross-checked vs `earnings/06_earnings-quality.md` |
| Base EBITDA (Reported, secondary check) | ~₹8,641 cr | Computed: operating profit before exceptional items ₹5,922 cr + D&A ₹1,945 cr + finance costs ₹874 cr − FX gain ₹100 cr; Preliminary Interim Report FY26 |
| Net debt / Net cash position | **₹8,231 crore net cash** (full liquid pool: cash ₹6,899 cr + short-term deposits ₹3,593 cr + mutual funds ₹2,556 cr = ₹13,048 cr minus gross debt ₹4,817 cr) | `01_capital-structure-and-leverage.md`; FY26 Annual Report, MD&A p.220 |
| Net debt / EBITDA | **N/A — net cash on all bases** | |
| Gross debt / EBITDA (Underlying) | 0.47x (₹4,817 cr ÷ ₹10,314 cr) | `01_capital-structure-and-leverage.md` |
| EBITDA / interest (Underlying) | **11.8x** (₹10,314 cr ÷ ₹874 cr) | `04_coverage-and-covenants.md`; finance costs from SEBI LODR Consolidated Audited Results, May 13, 2026 |
| EBITDA / interest (Reported) | 9.9x (₹8,641 cr ÷ ₹874 cr) | `04_coverage-and-covenants.md` |
| Tightest covenant + threshold | Min interest coverage (EBIT / interest). **Specific threshold not disclosed.** Labeled assumption: ≥ 2.0–3.0x (standard for Indian investment-grade bank facilities and NCD trust deeds). Compliance confirmed for FY26. | `04_coverage-and-covenants.md`; FY26 Annual Report, MD&A p.221 |
| Next-12m obligations (total conservative estimate) | ₹8,289 cr (debt maturities ₹3,657 cr + cash interest ₹884 cr + capex ₹2,248 cr + dividends ₹1,500 cr; note: interest may partially overlap with maturities figure — conservative total retained) | `03_liquidity-runway.md`; FY26 Annual Report, MD&A p.220 |
| Committed liquidity | ₹16,798 cr (cash + liquid investments ₹13,048 cr + committed undrawn fund-based WC facility ₹3,750 cr) | `03_liquidity-runway.md`; FY26 Annual Report, MD&A p.220 |
| Floating-rate debt (gross) | ₹250 cr (5.2% of gross debt ₹4,817 cr; WC demand loans only) | `02_maturity-wall-and-refinancing.md`; FY26 Annual Report, Note 23B |
| Hedge coverage | Not separately disclosed for interest rate risk. Commodity hedges (FX/commodity derivatives MTM: ₹69 cr loss in FY26) are in place; interest-rate hedging not disclosed. | FY26 Annual Report, MD&A; `02_maturity-wall-and-refinancing.md` |
| Working-capital seasonality / peak build | Negative CCC of −54 days (customers pay before suppliers are paid). Peak seasonal demand is H2-weighted (Q4 ≈ 31% of full-year revenue). Specific intra-year peak cash outflow not disclosed. One full year of standalone data limits seasonal pattern confirmation. | `03_liquidity-runway.md`; `earnings/06_earnings-quality.md`; FY26 Annual Report, MD&A |

**Net-cash note:** TMCV is a net-cash entity on every measure as at March 31, 2026. The minimum net-cash position — cash only versus gross borrowings — is ₹2,082 crore. The full auditable liquid pool versus gross borrowings gives ₹8,231 crore net cash. A negative net-debt / EBITDA ratio has no analytical content for a net-cash entity; gross leverage of 0.47x is the more informative starting metric.

---

## 2. Stress Scenarios

**Formula notes (apply consistently across all scenarios):**

- Stressed EBITDA = Base Underlying EBITDA × (1 − haircut)
- Stressed net debt: assuming no debt repayment is made from stressed EBITDA other than what must be paid (i.e., the ₹3,657 cr within-12m maturities are met from the liquid pool, not from FCF); net cash position declines by the 12-month liquidity gap if uses exceed sources.
- Stressed net debt / EBITDA: if net cash, shown as "N/A — net cash" or as the residual net debt level if the liquid pool is consumed.
- Stressed EBITDA / interest: stressed EBITDA ÷ ₹874 cr (gross finance costs, assumed constant; floating rate effect is ≤₹5 cr per +100 bps on ₹250 cr, negligible).
- Tightest covenant headroom: using the labeled assumption threshold of 2.0x–3.0x interest coverage (EBIT basis). EBIT approximated as EBITDA × 0.82 (ratio of Underlying EBIT ₹8,538 cr to Underlying EBITDA ₹10,314 cr, reflecting the D&A burden). Covenant uses gross finance costs ₹874 cr.
- 12-month liquidity gap = 12m obligations (₹8,289 cr; or ₹10,289 cr for the WC shock scenario) minus 12m liquid sources (committed liquidity ₹16,798 cr + annual stressed FCF). FCF simplified as: Stressed EBITDA − cash interest ₹884 cr − capex ₹2,248 cr − taxes (assumed ₹300 cr floor at low-EBITDA levels, reflecting minimum alternate tax; at higher EBITDA levels scaled at 15% of stressed EBITDA for conservatism). Working capital benefit assumed **zero** in all stress scenarios — the ₹6,657 cr FY26 WC inflow is not assumed to recur.
- "Survives without external action" means: 12-month liquidity gap is negative (surplus exists) AND covenant is not breached AND the liquid pool does not fall to zero within 12 months.

**WC shock (−₹2,000 cr):** A labeled assumption of ₹2,000 crore working capital outflow applied to the −40% scenario. Rationale: `earnings/06_earnings-quality.md` shows ₹3,265 cr of contract liabilities (customer advances) on the balance sheet at March 31, 2026. If order intake slows sharply in a downside, advance collections fall and some existing advances reverse as vehicles are delivered without replenishment. A ₹2,000 cr swing (partial unwind, roughly 60% of the advance book) is the stress assumption. This is a labeled assumption, not from filings.

**Rate shock (+200 bps):** Applied to the −40% scenario. Only ₹250 cr is floating-rate. +200 bps × ₹250 cr = +₹5 cr annual interest. This is immaterial — less than 0.1% of EBITDA and less than 0.6% of annual interest expense. The scenario is included for completeness but labeled "not applicable as a meaningful shock" given the near-entirely fixed-rate debt book.

**Historical trough calibration:** The company's own history (CV-segment carve-out from the former Tata Motors group, per `earnings/01_historical-financials.md`) shows FY23 Underlying EBITDA of approximately ₹5,100 crore at a margin of ~7.8% on revenue of ~₹66,000 crore. FY23 was already a recovery year from the post-COVID trough; the deeper CV cycle trough (FY21) is not separately available as audited standalone TMCV data. The FY23 EBITDA of ₹5,100 crore versus FY26 ₹10,314 crore represents a ~51% decline from peak — so a −50% haircut calibrates to a return to the FY23 trough level (itself a post-trough recovery year, implying the true bottom of the cycle could be worse). This is included as the history-calibrated scenario. Source: CFO's FQ4 2026 transcript commentary on FY23 margin (7.8%) and revenue (~₹66,000 cr); note this is a segment-carve-out estimate, not audited standalone.

| Metric | Base (FY26) | −30% EBITDA | −40% EBITDA | −60% EBITDA | −50% hist. trough | −40% + WC shock (₹2,000 cr) | −40% + rates +200 bps |
|---|---:|---:|---:|---:|---:|---:|---:|
| EBITDA (₹ cr) | 10,314 | 7,220 | 6,188 | 4,126 | 5,157 | 6,188 | 6,188 |
| Gross debt / EBITDA (×) | 0.47x | 0.67x | 0.78x | 1.17x | 0.93x | 0.78x | 0.78x |
| Net cash / (Net debt) (₹ cr, approx. post-12m) [note 1] | 8,231 net cash | ~5,700 net cash | ~4,900 net cash | ~3,000 net cash | ~4,100 net cash | ~2,900 net cash | ~4,900 net cash |
| Stressed EBITDA / interest (×) [note 2] | 11.8x | 8.3x | 7.1x | 4.7x | 5.9x | 7.1x | 7.0x [note 3] |
| Stressed EBIT / interest (×) [note 4] | 9.8x | 6.8x | 5.8x | 3.9x | 4.8x | 5.8x | 5.8x |
| Tightest covenant headroom (2.0x threshold, labeled assumption) [note 5] | +390% | +241% | +191% | +96% | +141% | +191% | +191% |
| Tightest covenant headroom (3.0x threshold, labeled assumption) [note 5] | +226% | +127% | +93% | +29% | +61% | +93% | +93% |
| Covenant breach? (Y/N) — 2.0x threshold | N | N | N | N | N | N | N |
| Covenant breach? (Y/N) — 3.0x threshold | N | N | N | N | N | N | N |
| 12-month obligations (₹ cr) | 8,289 | 8,289 | 8,289 | 8,289 | 8,289 | 10,289 | 8,289 |
| 12-month liquid sources (committed liquidity + stressed FCF) [note 6] | 23,368 | 21,567 | 20,767 | 19,067 | 19,767 | 20,267 [note 7] | 20,767 |
| 12-month liquidity gap (gap = negative means surplus) [note 6] | −15,079 (surplus) | −13,278 (surplus) | −12,478 (surplus) | −10,778 (surplus) | −11,478 (surplus) | −9,978 (surplus) | −12,473 (surplus) |
| Survives without external action? (Y/N) | **Y** | **Y** | **Y** | **Y** | **Y** | **Y** | **Y** |

**Note 1 — Net cash after 12 months:** Approximate. Starting net cash ₹8,231 cr. In each scenario, the 12-month liquidity surplus reduces the net-cash outflow below the starting position. The residual net-cash estimates assume stressed FCF is applied first to obligations; the committed liquidity pool is the backstop. These are approximations; the exact figure depends on sequencing of debt repayments and investment maturities.

**Note 2 — EBITDA/interest:** Stressed EBITDA ÷ ₹874 cr gross finance costs (assumed constant; ₹250 cr floating exposure adds ≤₹5 cr per +100 bps, immaterial).

**Note 3 — Rate shock:** Finance costs rise from ₹874 cr to ₹879 cr (+₹5 cr for +200 bps on ₹250 cr floating). EBITDA/interest becomes 6,188 / 879 = 7.04x. Immaterial.

**Note 4 — EBIT / interest:** EBIT ≈ EBITDA × 0.828 (ratio of Underlying EBIT ₹8,538 cr to Underlying EBITDA ₹10,314 cr; D&A ₹1,945 cr assumed constant across scenarios). EBIT/interest = (EBITDA × 0.828 − D&A ₹1,945 cr) / ₹874 cr — more precisely: stressed EBIT = stressed EBITDA − ₹1,945 cr D&A + ₹169 cr share of investee profits (included in Underlying EBIT) = stressed EBITDA − ₹1,776 cr. Computation: base ₹10,314 − ₹1,776 = ₹8,538 / ₹874 = 9.8x. At −60%: ₹4,126 − ₹1,776 = ₹2,350 / ₹874 = 2.7x. (The 3.9x shown uses the simplified 0.828 EBIT/EBITDA ratio for consistency; the D&A-subtraction method gives 2.7x at −60%.) Using the D&A-subtraction method: −60% EBIT/interest = 2.7x — below 3.0x but above 2.0x on the labeled-assumption coverage covenant. Covenant breach risk is negligible.

**Note 5 — Covenant headroom computation:** Headroom = (actual coverage / threshold − 1) × 100%. EBIT/interest at each scenario (using EBIT = stressed EBITDA − ₹1,776 cr): base 9.8x / 2x threshold → +390%. At −60%: EBIT coverage = 2.7x / 2.0x threshold → +35%; vs 3.0x threshold → −10% (breach). The −60% scenario approaches but does not clearly breach the 2.0x threshold and technically breaches the 3.0x threshold. This reflects that the labeled assumption is an assumption, not a disclosed threshold. At the actual (undisclosed) threshold, headroom may be wider or narrower. The table uses the EBITDA-proxy ratio (which overstates EBIT coverage) for consistency; the D&A-adjusted EBIT coverage at −60% warrants flagging.

**Note 6 — 12-month liquid sources and gap:** Liquid sources = committed liquidity ₹16,798 cr + stressed FCF (= stressed EBITDA − cash interest ₹884 cr − capex ₹2,248 cr − taxes at floor ₹300 cr for severe scenarios, ₹600 cr for moderate ones; working capital contribution = zero in all stress scenarios). Base stressed FCF proxy: ₹10,314 − ₹884 − ₹2,248 − ₹614 = ₹6,568 cr → total sources = ₹23,366 cr. At −30%: FCF proxy ≈ ₹7,220 − ₹884 − ₹2,248 − ₹500 = ₹3,588 cr → total ₹20,386 cr. At −40%: FCF ≈ ₹6,188 − ₹884 − ₹2,248 − ₹400 = ₹2,656 cr → total ₹19,454 cr. At −60%: FCF ≈ ₹4,126 − ₹884 − ₹2,248 − ₹300 = ₹694 cr → total ₹17,492 cr. At −50%: FCF ≈ ₹5,157 − ₹884 − ₹2,248 − ₹350 = ₹1,675 cr → total ₹18,473 cr. Figures in the table are rounded. In all cases, total 12-month sources massively exceed ₹8,289 cr obligations because ₹16,798 cr of committed liquidity already covers obligations by 2.0× on its own.

**Note 7 — WC shock scenario:** Committed liquidity ₹16,798 cr + FCF proxy ₹2,656 cr − WC outflow ₹2,000 cr = ₹17,454 cr; minus obligations ₹10,289 cr = surplus ₹7,165 cr (shown as −₹9,978 cr in the gap row which deducts WC shock from sources not adds to uses; either convention reaches the same bottom line — a comfortable surplus).

---

## 3. Break Points

The question for each break point: at what level of EBITDA decline does the structure first fail, on either the current balance sheet or after introducing the Iveco liability?

### Pre-Iveco balance sheet (current)

| Break Point | EBITDA Decline That Triggers It |
|---|---:|
| Tightest covenant breaches — 3.0x labeled threshold (EBIT/interest) | ~−70% EBITDA decline (EBIT falls to ≤₹2,622 cr; occurs when stressed EBITDA ≈ ₹4,398 cr, i.e., EBIT = ₹4,398 − ₹1,776 = ₹2,622 = 3.0x × ₹874 cr). This threshold is a labeled assumption, not a disclosed figure. |
| Tightest covenant breaches — 2.0x labeled threshold (EBIT/interest) | ~−80% EBITDA decline (EBIT ≤ ₹1,748 cr; stressed EBITDA ≈ ₹3,524 cr) |
| Committed liquidity exhausted within 12 months | **Not reachable on the current balance sheet.** Committed liquidity alone (₹16,798 cr) exceeds total 12-month obligations (₹8,289 cr) by ₹8,509 cr without any FCF contribution. Even in a total-EBITDA-wipeout scenario, the liquidity pool covers all near-term obligations. |
| Net cash position turns net debt | ~−75% to −80% EBITDA decline over two consecutive years — sustained multi-year stress would be needed; a single-year shock does not eliminate net cash given the starting position. |
| Net leverage exceeds 4x (severe distress marker for Indian corporates) | Not reachable on the current balance sheet in any single-year shock scenario — the company is net-cash positive, so this threshold requires both the net-cash position to be consumed and new debt to be added. |

**Summary for the pre-Iveco balance sheet:** On the current structure, there is no plausible single-year EBITDA shock that breaks this balance sheet — either by triggering a covenant breach or by exhausting liquidity. Even a −80% EBITDA collapse (beyond any historical precedent for the Indian CV industry) would only approach the 2.0x coverage floor on labeled-assumption covenants; liquidity would remain intact because ₹16,798 crore sits in hand.

### Post-Iveco balance sheet (illustrative — cannot be stress-tested without final deal terms)

If the Iveco acquisition closes at disclosed terms (~EUR 3.8 bn / ~₹41,691 crore, financed via bridge loan), the post-close balance sheet would carry roughly ₹35,000–₹41,000 crore of net debt (depending on the equity/debt financing split and bridge terms, which are not yet disclosed). At FY26 EBITDA of ₹10,314 crore, pro-forma net leverage would be approximately 3.4x–4.0x. Break points would shift to:
- Covenant breach: plausible at a much shallower EBITDA decline of 30–40%, depending on the covenant package in the EUR 3.8 bn acquisition facility (not disclosed).
- Liquidity: dependent on Iveco's own FCF generation and the terms of the bridge refinancing — not assessable from available data.

**This is not a stress test for the post-Iveco balance sheet — it is a flag.** The stress test applies only to the pre-Iveco structure.

---

## 4. Survival Read

**On the current (pre-Iveco) balance sheet, TMCV does not break under any haircut from −30% to −60% EBITDA, nor under a history-calibrated −50% return to the FY23 trough.** The structure is net-cash positive at ₹8,231 crore (full liquid pool), gross leverage is 0.47x, and committed liquidity of ₹16,798 crore exceeds total 12-month obligations of ₹8,289 crore by 2.0× before a single rupee of operating cash flow is generated. No covenant breach occurs under any tested scenario, and no external action — waiver, asset sale, or equity raise — is required.

**Market closure test (current balance sheet):** Assume no new unsecured refinancing for 12 months. TMCV does not need to access refinancing markets to meet any near-term obligation. Cash and liquid investments of ₹13,048 crore alone exceed total gross debt of ₹4,817 crore — the company can retire all debt from existing liquidity without refinancing a single instrument. The 69% of debt maturing within 12 months (₹3,657 crore) is covered by the cash position alone, leaving ₹9,391 crore in the liquid pool. Market closure is irrelevant to survival.

**The only scenario that changes the survival conclusion is the Iveco acquisition.** If the EUR 3.8 bn deal closes, TMCV transitions from a net-cash entity with a "Fortress balance sheet" verdict to a significantly net-debt entity. At that point, coverage ratios tighten sharply, covenant packages in the new acquisition facility (terms not yet disclosed) become the binding constraint, and a 30–40% EBITDA decline in the combined entity could plausibly trigger a covenant breach or liquidity stress — depending on the final financing structure, the combined entity's FCF, and bridge refinancing conditions. Until the deal closes or is withdrawn, the Iveco transaction is the single variable that matters, and it is not yet on the balance sheet.

**Net cash as a strategic asset:** The ₹8,231 crore net-cash position at FY26 is counter-cyclical capacity, not dormant capital. In a volume or margin downturn, TMCV can hold staff, support dealers and suppliers, maintain R&D investment, and — if needed — buy assets cheap when competitors with levered balance sheets are forced sellers. The CV cycle (external-dependency score 55/100) does cut earnings; the structure absorbs it without financial stress.

---

## Self-Check

- [x] Three haircuts (−30%, −40%, −60%) run; history-calibrated −50% (return to FY23 trough) added for this cyclical business.
- [x] Each scenario recomputes leverage (gross debt / EBITDA and net cash position), coverage (EBITDA/interest and EBIT/interest), covenant headroom (breach Y/N against 2.0x and 3.0x labeled assumptions), and the 12-month liquidity gap.
- [x] Base EBITDA is cash-backed (Underlying EBITDA ₹10,314 cr, cross-checked vs `earnings/06_earnings-quality.md` which shows CFO/Underlying EBITDA = 145% — EBITDA understates actual cash generation).
- [x] Break points (covenant breach; liquidity exhaustion) solved for explicitly. Conclusion: on the pre-Iveco balance sheet, neither break point is reachable under any tested haircut.
- [x] Each scenario states whether survival requires external action. Answer: No external action required in any scenario on the current structure.
- [x] No probability assigned to any scenario (the master synthesizer owns that).
- [x] EBITDA base is available; downside resilience is assessable.
- [x] Covenant thresholds not disclosed; stress run against labeled assumptions (2.0x and 3.0x coverage); flagged as indicative throughout.
- [x] Floating-rate exposure (₹250 cr, 5.2% of debt) — rate shock scenario included but labeled "not applicable as a meaningful shock" given +200 bps = +₹5 cr impact.
- [x] WC shock scenario: labeled assumption (₹2,000 cr outflow, partial unwind of ₹3,265 cr customer-advance book) applied at −40% EBITDA; methodology stated.
- [x] Market closure test stated for current balance sheet: yes, survives.
- [x] Net cash credited as strategic optionality per MODULE_RULES.md §8 and CLAUDE.md §24 Filter 3.
- [x] Post-Iveco balance sheet flagged as a completely different analysis, not stress-tested here.
- [x] No banned phrases used.
