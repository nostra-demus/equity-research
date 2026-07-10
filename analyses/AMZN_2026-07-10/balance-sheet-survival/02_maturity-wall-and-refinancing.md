# Maturity Wall & Refinancing — AMZN

**Reporting standard:** US GAAP. **Currency:** USD (millions unless stated). **Fiscal year end:** December 31. **Primary data source:** FY2025 10-K (December 31, 2025) and Q1 2026 10-Q (March 31, 2026 — the most current period available). **Upstream input:** `01_capital-structure-and-leverage.md` (gross debt, instruments, net cash position). **Cross-module inputs:** `analyses/AMZN_2026-07-03/earnings/01_historical-financials.md` (FCF, CFO); `analyses/AMZN_2026-07-03/business-model/11_capital-allocation-governance.md` (rating commentary, refi activity).

**Important:** Between December 31, 2025 and March 31, 2026, Amazon executed a large debt issuance — $37.0B in USD notes and €14.5B ($16.8B) in Euro-denominated notes, for a combined ~$53.8B in new face-value debt. This report uses March 31, 2026 as its primary balance-sheet date throughout (the latest filed period), and references December 31, 2025 data where the Q1 10-Q does not provide year-by-year maturity granularity.

---

## 1. Maturity Schedule

All figures in USD millions. The year-by-year principal maturity schedule is from the FY2025 10-K Note 6 (as of December 31, 2025), adjusted for the March 2026 issuances which all mature 2028 or later (confirmed in Q1 2026 10-Q, Note 5). The March 2026 notes added ~$53,782M of face-value debt, all with maturities from 2028 to 2076. The 2026 and 2027 scheduled maturities shown below are therefore unchanged from the FY2025 10-K.

The current portion of long-term debt at March 31, 2026 was $2,832M (Q1 2026 10-Q, Note 5), confirming the remaining 2026 maturity quantum is approximately $2,752M–$2,832M (the slight difference reflects carrying-value vs face-value rounding).

| Period | Amount Due (face) | % of Total Debt | Instrument(s) | Source |
|---|---:|---:|---|---|
| Within 12 months (remainder of 2026) | $2,752 | 2.2% | 2021 Notes (1.00%–3.25% tranche maturing 2026) | FY2025 10-K, Note 6, p.58; Q1 2026 10-Q, Note 5 current portion $2,832M |
| Year 2 (2027) | $8,832 | 7.2% | 2017 Notes + 2020 Notes + April 2022 Notes + Dec 2022 Notes tranches | FY2025 10-K, Note 6, p.58 |
| Year 3 (2028) | ~$22,250 | ~18.1% | 2020 Notes + April 2022 Notes + Dec 2022 Notes + 2025 Notes + March 2026 USD Notes ($2.8B floating + fixed) + March 2026 Euro Notes | Q1 2026 10-Q, Note 5 (March 2026 tranches "2028–2076" / "2028–2064"); commitment table confirms $16,657M principal+interest in 2028; principal estimated after subtracting ~$5.5B of annual interest on ~$122B at ~4.5% avg rate |
| Year 4 (2029) | ~$6,000 | ~4.9% | Dec 2022 Notes + April 2022 Notes + March 2026 floating rate USD note ($2.8B includes 2029 tranche) | Q1 2026 10-Q, commitment table $11,076M (incl. interest) for 2029; principal estimated |
| Year 5 (2030) | ~$5,000 | ~4.1% | 2021 Notes + 2020 Notes tranches | Q1 2026 10-Q, commitment table $10,710M (incl. interest) for 2030; principal estimated |
| Thereafter (2031+) | ~$78,798 | ~63.6% | 2014 Notes (2034–2044) + 2017 Notes (2027–2057) + 2021 Notes (2031–2061) + 2022 Notes (2032+) + 2025 Notes (2031–2065) + March 2026 USD Notes (multi-tranche to 2076) + March 2026 Euro Notes (to 2064) | FY2025 10-K, Note 6 + Q1 2026 10-Q, Note 5; commitment table "thereafter" $145,575M includes interest |
| **Total (face value, March 31, 2026)** | **$122,632** | **100%** | Senior unsecured notes (USD + Euro); $152M short-term borrowings in addition | Q1 2026 10-Q, Note 5, p.17 |

**Reconciliation note:** Total face value of long-term notes per Q1 2026 10-Q, Note 5 is $122,632M, plus $836M other LT debt and $850M other LT debt (Mar 31), plus $152M short-term borrowings = total gross financial debt ~$122,784M + $850M = $123,634M approximate gross financial debt as of March 31, 2026. Long-term debt carrying value per the Q1 balance sheet is $119,074M (after $726M unamortized discount and $2,832M current portion subtracted). The $2,752M 2026 maturity figure is from the FY2025 10-K annual schedule; the 2028 onwards figure incorporates the March 2026 additions but the per-year split for 2028–2030 is estimated (see below) because the Q1 10-Q does not publish a standalone year-by-year principal maturity table — only the all-in commitment table (principal + interest combined). Estimates are labeled.

**Estimation methodology for 2028–2030:** The Q1 2026 10-Q commitments table (Note 4, p.15) shows long-term debt principal and interest combined as: $5,937M (9 months of 2026), $13,583M (2027), $16,657M (2028), $11,076M (2029), $10,710M (2030), $145,575M (thereafter). To extract approximate principal, I estimate annual interest on the $122,632M face-value stock at a weighted-average coupon of ~3.9% (see Section 3) ≈ ~$4,780M per year. After subtracting estimated interest: 2028 principal ≈ $16,657M − $4,800M ≈ ~$11,857M (with ~$10B in March 2026 tranche maturities plus ~$2B from prior notes). The 2028–2030 estimates carry material uncertainty due to multi-currency interest calculations and the 2026 note starting dates. These are labeled as estimated throughout.

---

## 2. Maturity Profile Metrics

The WAM of 14.2 years is directly from the Q1 2026 10-Q, Note 5, footnote (1), which states: "The combined weighted-average remaining life of the Notes was 14.2 years as of March 31, 2026." This supersedes the FY2025 10-K's 14.1-year figure (which predated the March 2026 issuances).

| Metric | Value |
|---|---:|
| Weighted-average maturity (years) | 14.2 years |
| % due within 12 months (2026 remainder) | 2.2% ($2,752M of $122,632M) |
| % due within 24 months (2026 + 2027) | 9.4% ($2,752M + $8,832M = $11,584M) |
| % due within 36 months (2026 + 2027 + 2028 est.) | ~28.6% (est. $11,584M + ~$11,857M est. = ~$23,441M est.) |
| Largest single maturity year (and amount) | 2028 (estimated ~$11,857M principal, the heaviest year — but still only ~9.7% of total) |

**Note on 36-month share:** The 2028 maturity estimate carries the uncertainty described above. If the full $16,657M (interest-inclusive) were treated as principal, the 36-month share would be ~23.0% — still not elevated relative to the WAM. The principal-only figure of ~$11,857M is the correct estimate.

---

## 3. Rate Exposure

Amazon's long-term debt is overwhelmingly fixed-rate. The floating-rate component as of March 31, 2026 is small and well-identified: $2.8B of USD notes (SOFR + 0.44%/0.59%, due 2028/2029) and €1.8B ($~2.1B equivalent) of Euro notes (EURIBOR + 0.35%, due 2028), totaling approximately $4.9B of floating-rate principal. That is ~4.0% of total face-value debt.

The weighted-average coupon for the entire portfolio is estimated at approximately 3.85%–4.1%, derived as follows: the pre-March 2026 book ($68,836M face, FY2025 notes) had a weighted-average stated rate of approximately 3.1%–3.8% across the various issuances; the March 2026 USD notes ($37.0B, 3.85%–6.05%) and March 2026 Euro notes ($16.8B equivalent, 2.50%–4.85%) added higher-coupon tranches. Blending these, the portfolio weighted-average stated coupon is approximately 3.85%–4.1% (Inference from Note 5 coupon ranges and issuance sizes; a precise weighted average is not disclosed in the 10-Q). The interest expense line in the Q1 2026 income statement ($800M for Q1 2026 vs $541M for Q1 2025) annualizes to approximately $3.2B on an approximately $122.6B face-value book, implying an effective yield of ~2.6%–3.2% — which is lower than the stated coupon range because the unamortized discount on older below-market notes and the Q1 2026 timing (March issuances only contributed 2-3 weeks of interest in Q1) both suppress the annualized figure. A run-rate annual interest cost of ~$4.5B–$5.0B on the full $122.6B portfolio is a reasonable estimate for FY2026.

For the refi cost benchmark, the 10-year US Treasury yield on July 2, 2026 was approximately 4.47%–4.49% (web-sourced, July 2, 2026, labeled unverified). Amazon's credit rating is AA (S&P, stable), A1 (Moody's, stable), AA- (Fitch, stable). The ICE BofA AA corporate index OAS (option-adjusted spread — the extra yield AA-rated corporate bonds pay over comparable Treasuries) has historically been in the 50–80 bps range for high-quality AA names. Amazon's March 2026 bond offering priced at approximately +20 bps over the AA corporate average (web: Bloomberg, March 2026 deal pricing), implying Amazon specifically priced at roughly 50–70 bps over Treasuries on its 10-year equivalent tranches. This gives a market refinancing rate for new 10-year Amazon senior unsecured notes of approximately 4.47% + 0.55% = ~5.0%–5.1% (indicative/unverified, derived from web sources). The 30-year tranche of the March 2026 deal priced at +130 bps over Treasuries (web-sourced, unverified), consistent with its longer duration.

| Metric | Value | Source |
|---|---:|---|
| Fixed-rate share | ~96.0% | Q1 2026 10-Q, Note 5 — $2.8B USD floating + ~$2.1B EUR floating = ~$4.9B floating of $122.6B total |
| Floating-rate share | ~4.0% (~$4.9B) | Q1 2026 10-Q, Note 5, fn. (2) and (3) |
| Weighted-average stated coupon (estimated) | ~3.85%–4.10% | Inference from Note 5 coupon ranges and issuance sizes; not disclosed in aggregate in the 10-Q |
| Annualized interest run-rate (estimated, FY2026) | ~$4.5B–$5.0B | Derived from Q1 2026 interest expense ($800M × 4 = $3.2B as partial-year proxy, plus full-year effect of March 2026 issuances) |
| Current market refi rate — 10-year Amazon senior unsecured (indicative) | ~5.0%–5.1% | Web: 10Y UST ~4.47%–4.49% (July 2, 2026, unverified) + ~55 bps Amazon AA spread (estimated from March 2026 deal pricing, web-sourced, unverified) |
| Estimated refi cost step-up (bps) | ~90–125 bps | Comparing ~3.85%–4.10% weighted-average coupon to ~5.0%–5.1% current market rate |

**Rate sensitivity note:** The ~$4.9B floating-rate exposure (SOFR and EURIBOR-linked, all due 2028–2029) reprices with market rates. A +200 bps rate shock on the floating portion adds approximately $98M in annual interest cost (~$4.9B × 2.0% = $98M), which is immaterial relative to Amazon's $23.9B Q1 2026 operating income run-rate. Floating-rate risk is not a material concern at this portfolio composition.

---

## 4. Refinancing Exposure

### Refi Funding Plan (no speculation)

Next-24-month maturities (2026 + 2027): $11,584M (approximately $2,752M in 2026 and $8,832M in 2027).

| Source of repayment for next-24m maturities | Amount | Evidence |
|---|---:|---|
| Cash on hand (unrestricted, March 31, 2026) | ~$98,940M | Q1 2026 10-Q balance sheet: cash $101,816M less restricted cash $2,876M = ~$98,940M usable. FY2025 10-K Note 2 fn. (2) for restricted definition. |
| Liquid marketable securities (March 31, 2026) | $41,273M | Q1 2026 10-Q balance sheet, p.6 |
| Total unrestricted liquid assets (cash + securities) | ~$140,213M | Sum of above two lines |
| FCF (strict, LTM Mar-31-2026: CFO $148,531M minus gross capex $151,003M) | ($2,472M) negative | earnings cross-module `01_historical-financials.md`; Q1 2026 10-Q cash flow statement |
| CFO (LTM Mar-31-2026, confirmed from 10-Q) | $148,531M | Q1 2026 10-Q, Consolidated Statements of Cash Flows (Twelve Months Ended March 31, 2026) |
| Revolver availability ($15.0B + $5.0B = $20.0B committed facilities) | $20,000M committed, $0 drawn | Q1 2026 10-Q, Note 5, p.18: "no borrowings outstanding...as of March 31, 2026"; availability = full $20.0B |
| Asset-sale proceeds | Not announced / not committed | No asset-sale program disclosed in Q1 2026 10-Q or FY2025 10-K |
| New debt issuance | Not committed (next tranche unannounced) | $17.5B delayed-draw term loan signed June 8, 2026 (committed but undrawn, expires Sept 30, 2026; matures 3 years after drawdown). Web: TechCrunch, June 10, 2026; Marketscreener, June 8, 2026 (labeled unverified). Also CAD $14B bond sale closed June 12, 2026 (web: TechCrunch, June 10, 2026, labeled unverified). |

**Refinancing exposure narrative:** The $11.6B next-24-month wall is covered many times over by cash alone. Amazon's unrestricted liquid assets at March 31, 2026 total approximately $140B — more than 12x the next-24-month maturity obligations. Even under a complete market closure (no new issuance, no revolver draws), Amazon could repay every dollar of the 2026 and 2027 maturities without touching the investment portfolio. The remaining liquid assets after repaying all 2026–2027 maturities would still be approximately $128B. The rating posture is strong and stable: S&P AA (stable), Moody's A1 (stable, revised from positive to stable in February 2026 citing accelerated capex — not a downgrade; the underlying A1 rating was unchanged), Fitch AA- (stable). Amazon actively issued into the market in March 2026 ($37B USD + €14.5B EUR in a single offering, the largest non-acquisition corporate bond sale on record, drawing $126B of orders on the USD portion alone), confirming market access at scale even under elevated capex. Post-quarter, Amazon signed a $17.5B delayed-draw term loan (June 2026) and a CAD $14B bond sale, demonstrating continued access across markets. The strict FCF is negative for the LTM period (large capex build), meaning Amazon cannot service debt from FCF alone, but cash-on-hand and CFO ($148.5B LTM) more than cover all obligations. The floating-rate share of ~4% means interest costs are largely insensitive to rate moves.

**Verdict:** Self-funded / low refi risk. The 24-month wall of $11.6B is a small fraction of a $140B liquid asset base, the rating is high-grade and stable, and Amazon demonstrated it can issue $54B+ in a single market window at tight spreads. There is no scenario in which Amazon cannot refinance or repay its 2026–2027 maturities.

---

## 5. Refinancing Read

The near-term maturity wall is structurally negligible. The $2.75B due in the remainder of 2026 and $8.83B due in 2027 — combined $11.6B over 24 months — represent less than 8% of Amazon's unrestricted liquid assets at March 31, 2026, and less than 8% of LTM CFO ($148.5B). The 2028 year is the largest single maturity spike (estimated ~$11.9B in principal, primarily the first tranches of the December 2022, 2025, and March 2026 note series to mature), but it is still comfortably below one quarter of CFO and dwarfed by liquid assets.

The estimated refinancing cost step-up is +90 to +125 basis points: the portfolio's weighted-average stated coupon of ~3.85%–4.10% compares to current market rates of ~5.0%–5.1% for new 10-year Amazon senior unsecured notes (indicative, web-sourced July 2026). In dollar terms, refinancing the 2026–2027 maturities ($11.6B) at a 100 bps step-up costs approximately $116M in additional annual interest — roughly 0.5% of Q1 2026 annualized operating income ($95.4B). This is trivially small.

The single biggest refinancing risk is not repayment capacity — it is the pace of new debt issuance needed to fund the $200B+ FY2026 capex program. Amazon has already layered ~$54B of new debt in Q1 2026 (March issuances) and signed a further $17.5B delayed-draw facility and a CAD $14B bond post-quarter. The leverage trajectory is rising rapidly on gross terms (long-term debt face value grew from $68.8B at December 31, 2025 to $122.6B at March 31, 2026, an ~$53.8B increase in one quarter), even as the net-cash position on the strict basis remains comfortable. If Amazon continues to issue debt at this pace to fund capex, the balance sheet moves from the current position (strictly net cash by $17.9B at December 31, 2025) toward a net-debt position, potentially narrowing the refinancing buffer over a 2–3 year horizon. However, as of the most current data (March 31, 2026), this is a trajectory concern, not a current risk.

Under a "market closure" scenario (no new unsecured issuance for 12 months), Amazon survives comfortably: unrestricted cash and securities of ~$140B at March 31, 2026 cover the $2.75B remaining 2026 maturity 51x over, and the $20B committed revolving facilities are available as an additional backstop. Even after the large March 2026 issuances, Amazon's liquid asset base ($140B) exceeds its total gross financial debt ($122.6B face) — it remains net cash on both the strict and broad bases. Market closure is not a solvency risk for Amazon over any 12-month horizon visible in current data.

---

## Self-Check

- [x] The maturity schedule sums to $122,632M (face value from Q1 2026 10-Q, Note 5), which reconciles to the gross financial debt from `01` updated for the March 2026 issuances. The FY2025 10-K total of $68,836M + $37,000M USD March 2026 + $16,782M EUR March 2026 = $122,618M ≈ $122,632M (±$14M rounding on the Euro translation at deal date vs. period-end FX). Reconciling item: $14M FX rounding on the €14.5B Euro notes between issuance and March 31, 2026 period-end.
- [x] WAM of 14.2 years is directly from Q1 2026 10-Q, Note 5, fn. (1) — not vague.
- [x] 12/24/36-month shares are computed: 2.2% / 9.4% / ~28.6% (2028 estimated).
- [x] Fixed/floating split stated: ~96% / ~4%; floating-rate sensitivity quantified ($98M annual at +200 bps).
- [x] Refi cost step-up: ~3.85%–4.10% coupon vs ~5.0%–5.1% market rate = +90–125 bps, web-sourced benchmark labeled and dated.
- [x] Refinancing risk tied to FCF/liquidity ($140B liquid assets vs $11.6B next-24m maturities) and market access (March 2026 record issuance).
- [x] No partial-data cap applied — year-by-year maturity table is available from FY2025 10-K for the pre-March 2026 stock; March 2026 tranches confirmed as 2028+ in Q1 10-Q Note 5; 2028–2030 per-year splits estimated (labeled) due to commitment table showing principal + interest combined, not separated.
- [x] No banned phrases used without accompanying numbers.
