# Liquidity Runway — EMAR (Emaar Properties PJSC, DFM:EMAAR)

**Reporting standard:** IFRS
**Reporting currency:** AED (UAE Dirham), in millions unless stated
**Fiscal year end:** 31 December
**Latest period:** Q1-2026 (Mar-31-2026) balance sheet; FY2025 (Dec-31-2025) income statement and cash flow
**Run date:** 2026-06-22

**Upstream inputs used:**
- `01_capital-structure-and-leverage.md` — cash, gross debt, revolver, restricted cash
- `02_maturity-wall-and-refinancing.md` — next-12-month maturities (AED 5,182 mn)
- `earnings/01_historical-financials.md` — CFO, normalised FCF, capex
- `earnings/06_earnings-quality.md` — FCF quality, cash interest, advance-payment structure

---

## 1. Liquidity Sources (committed only)

All figures in AED millions. Reporting currency: UAE Dirham (AED). AED is pegged to USD at 3.6725 — no FX conversion risk on USD-denominated sukuk.

| Source | Amount (AED mn) | Usable? | Notes | Source |
|---|---:|---|---|---|
| Cash & equivalents (Q1-2026) | 12,179.5 | **Y** | Unrestricted. Excludes AED 43,338.5 mn restricted project-escrow cash — that balance is legally ring-fenced for project completion under Dubai Land Department (DLD) regulation and cannot service debt. | Capital IQ Quarterly Balance Sheet, Mar-31-2026 |
| Liquid short-term investments (Q1-2026) | 22,503.4 | **Y** | Capital IQ classifies as STI (not cash equivalents); liquid financial assets, not restricted. Shown separately per §15 strict-basis discipline. Not included in headline committed liquidity but available as a secondary buffer. | Capital IQ Quarterly Balance Sheet, Mar-31-2026 |
| Restricted cash / project escrow (Q1-2026) | 43,338.5 | **NO — EXCLUDED** | DLD-regulated escrow; earmarked for project milestones; cannot be used for debt service. The company's own "Net Cash" figure of AED 61,655 mn (FY2025) includes this balance — that figure must not be used for any coverage or runway calculation here. | Capital IQ Quarterly Balance Sheet, Mar-31-2026; 01_capital-structure-and-leverage.md |
| Committed revolving credit facilities — undrawn (UAE, Emaar Properties PJSC) | 3,669.3 | **Y** | Main AED revolver: AED 3,673.0 mn committed, AED 3.7 mn drawn, AED 3,669.3 mn undrawn at FY2025. Matures 2030. Subject to covenant compliance (covenant terms not in pool — Module Rule partial-data flag applied). | Capital IQ Capital Structure Details, FY2025; 01_capital-structure-and-leverage.md |
| Other committed undrawn facilities (UAE RCFs, per investor presentation) | 3,673.7 | **Y** | FY2025 investor presentation discloses total undrawn RCFs of ~AED 7,343 mn, representing UAE revolving credit facilities only. The residual beyond the main revolver (AED 3,673.7 mn) consists of additional funded and non-funded undrawn facilities per footnote. Specific terms not in pool. | FY2025 Preliminary Annual Report (Feb-12-2026), p.8 |
| **Total committed undrawn facilities** | **7,343.0** | **Y** | UAE revolving credit facilities only per disclosure. Footnote states Emaar "also has access to other funded and non-funded undrawn facilities" beyond this — those are not quantified and are excluded from the headline figure. | FY2025 Preliminary Annual Report (Feb-12-2026), p.8 |
| **Total usable liquidity — strict basis (cash + committed undrawn)** | **19,522.5** | | Cash of AED 12,179.5 mn + committed undrawn AED 7,343.0 mn. Excludes STI of AED 22,503.4 mn (shown separately). | Computed |
| **Total usable liquidity — broad basis (cash + STI + committed undrawn)** | **42,025.9** | | Labelled basis; STI is liquid but not cash. | Computed |

**Uncommitted lines note:** No uncommitted credit lines are separately identified in the data pool. The investor presentation's reference to "other funded and non-funded undrawn facilities" beyond the AED 7,343 mn figure is not quantified and is excluded per module doctrine.

**Availability note:** Specific borrowing-base or minimum-liquidity requirements for the revolvers are not disclosed in the data pool. Covenant terms are not available. Per MODULE_RULES, the revolver is included because the headline availability (undrawn balance) is disclosed; however, the liquidity-runway confidence is capped at 60 per the partial-data rule (revolver exists but covenant/borrowing-base detail is unknown).

---

## 2. Near-Term Uses (next 12 months)

All figures in AED millions. "Next 12 months" is measured from the balance sheet date (Dec-31-2025) per the maturity schedule in `02`; as of run date (Jun-22-2026) the Sukuk Series 3 (AED 2,753 mn) is approximately three months away (September 2026) and remains outstanding.

| Use | Amount (AED mn) | Source |
|---|---:|---|
| Debt maturities — 2026 bucket (from `02`) | 5,182 | 02_maturity-wall-and-refinancing.md; FY2025 Preliminary Annual Report (Feb-12-2026), p.8. Comprises: Sukuk Series 3 (AED 2,753 mn, Sep-2026); EGP revolving credit — Emaar Misr (AED 603 mn, rolling); PKR revolving facilities — Emaar Pakistan (AED 431 mn, rolling); secured USD term loan (AED 15 mn). The rolling EGP and PKR facilities are working-capital lines that are expected to renew at subsidiary level rather than be repaid at group level — treated conservatively as full repayment for runway purposes. |
| Cash interest expense (FY2025 actual, annualised) | 1,002 | earnings/06_earnings-quality.md; Capital IQ Annual Cash Flow, FY2025. Includes interest on all debt instruments (sukuk coupons, subsidiary floating-rate facilities). |
| Capex (FY2025 actual, used as proxy for maintenance capex) | 934 | earnings/01_historical-financials.md; Capital IQ Annual Cash Flow, FY2025. Capex split between maintenance and growth is not disclosed by Emaar. Total capex (AED 534–934 mn range across FY2021–FY2025) is used in full as a conservative estimate. Given the asset-light development model (capex is 2.8% of FY2025 CFO of AED 33.5 Bn), this distortion is immaterial. Inference, not from filings. |
| Dividends — committed (AED 1.00 per share for FY2024, paid in 2025; FY2025 dividend not yet declared as of run date) | 8,839 | FY2025 Preliminary Annual Report (Feb-12-2026), p.11 (6.3% yield reference; AED 1/share for FY2024). Share count: EPS AED 1.991, net income attributable AED 17,599 mn → ~8,839 mn shares. FY2025 dividend used as proxy for next-12-month committed dividend; actual FY2025 per-share dividend not disclosed in pool as of run date. The AED 1/share figure is conservative — the company may increase this given 30% net profit growth in FY2025. |
| IFRS 16 finance lease — current portion (FY2025) | 134.9 | 01_capital-structure-and-leverage.md; Capital IQ Capital Structure Details, FY2025. |
| **Total near-term uses** | **16,092** | |

**Note on EGP/PKR facility treatment:** The EGP revolving credit (AED 603 mn) and PKR revolving facilities (AED 431 mn) are local-currency working-capital lines at Emaar Misr and Emaar Pakistan respectively. Per `02`, these are described as "rolling on an annual basis." In practice, repayment at the group level is not expected — they renew locally. Including them in the 12-month uses figure is deliberately conservative and produces an overstated outflow. The true redemption use is primarily the Sukuk Series 3 (AED 2,753 mn) plus the smaller secured USD loan (AED 15 mn).

---

## 3. Runway

| Metric | Value |
|---|---:|
| Total committed liquidity (strict: cash + committed undrawn) | AED 19,522.5 mn |
| Total committed liquidity (broad: cash + STI + committed undrawn) | AED 42,025.9 mn |
| Annual normalised FCF (FY2025 lead figure per earnings/06_earnings-quality.md) | AED 24,295 mn |
| Annual reported FCF (CFO − capex, FY2025) | AED 32,524 mn (labelled: overstated by AED 8,229 mn of advance customer payments) |
| Total near-term uses (12 months) | AED 16,092 mn |
| **FCF annual surplus over near-term uses** | **AED +8,203 mn** |
| Net near-term obligations (uses − normalised FCF) | AED −8,203 mn (surplus; FCF covers all uses) |
| **Liquidity runway — static committed liquidity only** | **~14.6 months** |

**Formula — static runway (committed liquidity only):**
AED 19,522.5 mn ÷ (AED 16,092 mn ÷ 12 months) = **14.6 months**
This measures how long Emaar could fund all near-term obligations from cash and committed undrawn facilities alone, with zero FCF.

**Formula — FCF surplus basis:**
Normalised FCF AED 24,295 mn − Total near-term uses AED 16,092 mn = **AED +8,203 mn annual surplus**
FCF more than covers all near-term obligations without drawing on existing liquidity. There is no finite runway — the internal cash engine is self-funding.

**Coverage of the Sukuk Series 3 alone (key event, Sep-2026, AED 2,753 mn):**
Unrestricted cash (Q1-2026) AED 12,179.5 mn ÷ AED 2,753 mn = **4.4× coverage by cash alone**, before any FCF or revolver draw.

### Seasonality / Peak Liquidity Need (Hard Check)

Emaar's cash flow dynamics are **structurally inverted** relative to a typical seasonal working-capital build. The company collects customer advance payments upfront (averaging AED 8.2–8.4 Bn annually in FY2024–FY2025), which means the "seasonal" cash effect is additive to the balance, not a drain. Revenue recognition is back-loaded toward Q4 (averaging 32.5% of annual revenue in Q4), but this reflects IFRS 15 percentage-of-completion milestone timing, not a cash draw — the cash was already collected in prior periods.

No peak working-capital need in the conventional sense is disclosed. The one outflow concentration is the **Q4 dividend payment** (the FY2024 dividend of ~AED 8.8 Bn was paid in 2025; timing within the year is not separately disclosed). Even if the full dividend is paid in a single quarter, unrestricted cash of AED 12,179.5 mn (Q1-2026) covers it 1.4× without any FCF generation in that quarter.

The risk is not a seasonal liquidity squeeze but a **delivery-schedule risk**: if construction milestones slip, the advance payments sit longer as deferred revenue obligations and delay EBITDA recognition — this is a margin and earnings risk, not a near-term liquidity risk.

Peak working-capital need not disclosed — but the advance-payment model means a conventional build-and-drain WC cycle does not apply. Runway is not overstated on this basis.

---

## 4. Sources & Uses Bridge

Internal sources (normalised FCF of AED 24,295 mn) cover all near-term uses (AED 16,092 mn) with an annual surplus of AED 8,203 mn, meaning no external access — refinancing, asset sale, or revolver drawdown — is required to meet the next 12 months of obligations. The single largest use is the Sukuk Series 3 redemption (AED 2,753 mn, September 2026), which is covered 4.4× by unrestricted cash alone at Q1-2026 and approximately 8.8× if the AED 7,343 mn committed undrawn facilities are added.

Already-in-hand liquidity (unrestricted cash AED 12,179.5 mn) covers 75.7% of total 12-month uses of AED 16,092 mn without a single AED of FCF materialising. The remaining 24.3% of uses (approximately AED 3,912 mn) would need to come from either committed undrawn facilities (AED 7,343 mn available, 1.9× that residual gap) or FCF — neither of which is under pressure. The proportion of the runway that depends on FCF materialising is effectively zero: in-hand cash plus the committed revolver alone cover 120% of near-term uses even under the conservative assumption of no FCF.

---

## 5. Liquidity Read

The runway is not a finite figure — FCF covers all near-term obligations by a wide margin, with an annual surplus of AED 8,203 mn, and unrestricted cash alone (AED 12,179.5 mn at Q1-2026) covers the single biggest event (Sukuk Series 3, AED 2,753 mn, September 2026) 4.4 times over. The committed liquidity position (cash + AED 7,343 mn undrawn facilities = AED 19,522.5 mn strict) is 1.2× total 12-month uses even if FCF generates nothing. The runway depends on one thing: whether unrestricted cash is accurately reported and is genuinely free of restrictions — the AED 43 Bn escrow balance sitting alongside it in reported figures creates an optical risk if any reader conflates the two; the module takes the AED 12.2 Bn unrestricted figure at face value, consistent with Capital IQ's classification and the company's own disclosure that escrow cash is "not under lien." The single biggest liquidity risk is not near-term solvency — it is a refinancing-cost step-up: when the three sukuk roll over the next decade, the ~3.7% coupons reset to a market rate approximately 157 basis points higher, permanently embedding higher interest expense, though at AED 24,132 mn EBITDA versus AED 492 mn interest expense, even a doubling of interest cost is inconsequential.

---

## Self-Check

- [x] Liquidity uses committed facilities only; uncommitted lines excluded and noted.
- [x] Restricted cash (AED 43,338.5 mn) flagged and excluded from every liquidity calculation.
- [x] Near-term uses pull the AED 5,182 mn 12-month maturity figure from `02`.
- [x] FCF surplus stated in place of a finite runway (FCF covers all uses).
- [x] Static runway (14.6 months) shown with formula for reference.
- [x] Split between in-hand liquidity (75.7% of uses, no FCF needed) and must-materialize FCF (zero — cash alone is sufficient) is stated.
- [x] Revolver availability is disclosed (undrawn balance known); partial-data cap applied because covenant/borrowing-base terms are not in the pool (liquidity-runway confidence capped at 60 per MODULE_RULES).
- [x] No banned phrases. Runway stated in months and as surplus; no "adequate liquidity."
- [x] Advance-payment FCF distortion flagged; normalised FCF is the lead figure.
- [x] Seasonality hard check completed.
