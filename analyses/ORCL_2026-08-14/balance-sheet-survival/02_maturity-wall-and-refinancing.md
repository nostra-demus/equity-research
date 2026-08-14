# Maturity Wall & Refinancing — ORCL

Reporting currency: USD. Reporting standard: US GAAP. Fiscal year ends May 31 ("FY2027" = year ending 2027-05-31). Figures below are Oracle's audited FY2026 Form 10-K (year ended 2026-05-31, filed 2026-06-22) — specifically the 10-K's own "Future principal payments for all of our borrowings" table and its lease-maturity table — cross-checked against the Capital IQ Capital Structure Details instrument-level export (as of 2026-05-31). No `ciq_facts.json` sidecar exists for this run; the figures below are this agent's own sourced read, reconciled line-by-line to `01_capital-structure-and-leverage.md`. A full maturity schedule IS disclosed (10-K debt note + CIQ instrument list), so the Partial-Data Rule for "no maturity schedule" does **not** apply and no confidence cap is triggered on that basis.

## 1. Maturity Schedule

The debt that is actually rolled over or repaid through capital markets — commercial paper, senior notes, and the term loan ("notes payable and other borrowings," Oracle's own "aggregate indebtedness" definition) — totals **$130,105mn face value** ($129,541mn carrying value after a $564mn unamortized discount/issuance-cost adjustment) [FY26 10-K, Note on Debt, "Future principal payments for all of our borrowings at May 31, 2026"]. This is the primary refinancing wall and is used as the 100% base below. Finance leases ($7,701mn liability) and operating leases ($30,190mn liability) are real, growing cash obligations but are not "refinanced" in capital markets — they are shown as memo rows and reconciled to the canonical $167,432mn all-in gross-debt figure from `01`.

| Period | Amount Due | % of Total Debt (of $130,105mn) | Instrument(s) | Source |
|---|---:|---:|---|---|
| Within 12 months (FY2027, year ending 2027-05-31) | $7,210mn | 5.5% | Commercial Paper Notes ($1,468mn, rolling program to 2027-05-31), 2.65% Senior Notes due Jul-2026 ($3,000mn), 2.80% Senior Notes due Apr-2027 ($2,250mn), plus ~$492mn of scheduled FY2027 Term Loan Credit Agreement 2 amortization (1.25%–2.50% of principal per quarter) | [FY26 10-K, Note on Debt, "Future principal payments"; CIQ Financials_Annual.xls, Capital Structure Details tab] |
| Year 2 (FY2028) | $10,145mn | 7.8% | 3.25% Senior Notes due Nov-2027 ($2,750mn), 2.30% Senior Notes due Mar-2028 ($2,000mn), 4.50% Senior Notes due May-2028 ($750mn), remaining Term Loan Credit Agreement 2 balance (final maturity 2027-08-16, ~$4,645mn after FY2027 amortization) | [same] |
| Year 3 (FY2029) | $5,500mn | 4.2% | 4.80% Senior Notes due Aug-2028 ($1,500mn), Floating-Rate Senior Notes due Aug-2028 ($500mn, SOFR+0.76%), 4.55% Senior Notes due Feb-2029 ($3,000mn), Floating-Rate Senior Notes due Feb-2029 ($500mn, SOFR+1.11%) | [same] |
| Year 4 (FY2030) | $7,250mn | 5.6% | 4.20% Senior Notes due Sep-2029 ($1,500mn), 6.15% Senior Notes due Nov-2029 ($1,250mn), 2.95% Senior Notes due Apr-2030 ($3,250mn), 3.25% Senior Notes due May-2030 ($500mn), 4.65% Senior Notes due May-2030 ($750mn) | [same] |
| Year 5 (FY2031) | $9,750mn | 7.5% | 4.45% Senior Notes due Sep-2030 ($3,000mn), 2.875% Senior Notes due Mar-2031 ($3,250mn), 4.95% Senior Notes due Feb-2031 ($3,500mn) | [same] |
| Thereafter (FY2032 onward) | $90,250mn | 69.4% | ~40 remaining senior-note tranches maturing 2032–2066, including a large block of 20–40-year paper (e.g., $5,000mn 5.70% due Feb-2036, $5,000mn 6.70% due Feb-2056, $4,500mn 3.60% due Apr-2050) issued mostly in FY2026's $42.7bn debt raise for the AI-infrastructure build-out | [same] |
| **Total** | **$130,105mn** | **100%** | Commercial Paper + Senior Notes + Term Loan Credit Agreement 2 | Sum of rows above; ties to [FY26 10-K, Item 1A, "aggregate of $129.5 billion of outstanding indebtedness" (net of the $564mn discount)] |

**Memo — lease obligations (not part of the 100% base above, shown for completeness):**

| Period | Finance Lease Payments (undiscounted) | Operating Lease Payments (undiscounted) | Source |
|---|---:|---:|---|
| FY2027 | $656mn | $3,712mn | [FY26 10-K, Leases note, "Maturities of lease liabilities"] |
| FY2028 | $676mn | $3,603mn | [same] |
| FY2029 | $697mn | $3,550mn | [same] |
| FY2030 | $718mn | $3,550mn | [same] |
| FY2031 | $740mn | $3,519mn | [same] |
| Thereafter | $7,973mn | $23,933mn | [same] |
| Total lease payments (undiscounted) | $11,460mn | $41,867mn | [same] |
| Less: imputed interest | ($3,759mn) | ($11,677mn) | [same] |
| **Lease liability (discounted, on balance sheet)** | **$7,701mn** | **$30,190mn** | [same; ties to `01` Section 1] |

**Reconciliation to `01`'s canonical all-in gross debt:** $129,541mn (notes payable, net of discount) + $7,701mn (finance lease liability) + $30,190mn (operating lease liability) = **$167,432mn**, an exact match to `01_capital-structure-and-leverage.md`'s canonical figure. No reconciling gap.

Reporting currency: USD throughout.

## 2. Maturity Profile Metrics

Computed on the $130,105mn notes-payable-and-term-loan base (the debt actually subject to refinancing), using instrument-level maturity dates from the Capital IQ Capital Structure Details export, reference date 2026-08-14 (today) unless noted.

| Metric | Value |
|---|---:|
| Weighted-average maturity (years, from today 2026-08-14) | 14.3 years |
| Weighted-average maturity (years, from FY2026 balance-sheet date 2026-05-31) | 14.6 years |
| % due within 12 months (FY2027) | 5.5% ($7,210mn) |
| % due within 24 months (FY2027+FY2028) | 13.3% ($17,355mn) |
| % due within 36 months (FY2027+FY2028+FY2029) | 17.6% ($22,855mn) |
| Largest single disclosed year (within the 5-year table) | FY2028, $10,145mn (7.8%) — driven by the Term Loan's Aug-2027 final maturity landing in fiscal 2028 plus $5.5bn of senior notes |

**Reading the long WAM correctly — it is not a laddered, low-risk profile.** A 14+ year weighted-average maturity looks reassuring on its own, but it is almost entirely a mechanical artifact of the $42.7bn senior-note raise in FY2026, much of which was placed in very long tenors (20–40 years) to fund the AI-infrastructure build-out [`01`, Section 6; FY26 10-K MD&A]. It is not evidence of a mature, laddered structure built up over many years of disciplined issuance — it is the product of one enormous debt-funded capex year. The near-term wall is smaller in dollar terms than the "thereafter" bucket, but it is still real: **$22.9bn (17.6% of the notes-payable book) comes due within 36 months**, against a company whose FY2026 levered free cash flow was **−$23,686mn** and whose FY2027 guided net capex is **~$70bn** [`business-model/11_capital-allocation-governance.md`, Section 3; `earnings/01_historical-financials.md`, Section 1].

**Inference, not from filings:** the CIQ instrument-level list shows two later single-year concentrations of $5,000mn each within the "Thereafter" bucket (5.70% notes due Feb-2036 and 6.70% notes due Feb-2056) — larger in dollar terms than any of the five disclosed near-term years — but the 10-K itself only discloses the 5-year-plus-thereafter format, so this finer detail is Capital IQ-derived, not filing-disclosed at that granularity.

## 3. Rate Exposure

Computed on the combined notes-payable + finance-lease face-value base ($137,806mn: $130,105mn notes payable + $7,701mn finance leases), since finance leases carry a real, disclosed imputed rate (5.70%) and are debt-like secured obligations; operating leases are excluded from the rate-exposure calc (they are lease commitments, not instruments with a market-quoted refinancing rate).

| Metric | Value | Source |
|---|---:|---|
| Fixed-rate share (gross, by stated coupon type) | 95.5% ($131,669mn) | Calc from CIQ Capital Structure Details, per-instrument coupon-type flag |
| Floating-rate share (gross, by stated coupon type) | 4.5% ($6,137mn: $5,137mn Term Loan SOFR+1.35% + $1,000mn floating senior notes, SOFR+0.76%/+1.11%) | [same] |
| **Floating-rate share, net of hedges** | **~1.0% (~$1,437mn)** — Oracle has interest-rate swaps converting **$4,700mn** of the Term Loan's floating-rate balance to an effective fixed rate of **4.74%** (fiscal 2026 and 2025); only the ~$437mn unswapped Term Loan residual plus the $1,000mn floating senior notes remain genuinely floating | [FY26 10-K, Note on Debt, "we entered into certain interest rate swap agreements that have the economic effect of converting our $4.7 billion of floating-rate borrowings... to fixed-rate borrowings with a fixed annual interest rate of 3.07%... effective interest rates after consideration of the interest rate swap agreements were 4.74% for each of fiscal 2026 and 2025"] |
| Weighted-average coupon (notes payable only, $130,105mn face) | 4.77% | Calc from CIQ per-instrument coupons, principal-weighted |
| Weighted-average coupon (notes payable + finance leases, $137,806mn face) | 4.82% | Calc, same method, blending in the 5.70% finance-lease imputed rate |
| Current market refi rate — near/mid tenor (indicative proxy) | ~6.5%–6.7% (10-Year US Treasury yield 4.65% [2026-08-13] + an Oracle-specific credit spread proxy of ~200bp, based on Oracle's 5-year CDS spread, which exceeded 198bp / traded near its widest level ever in August 2026, above 2008 financial-crisis levels) | Web: 10Y UST yield via Trading Economics, 2026-08-13 (indicative, unverified); Oracle 5Y CDS spread via BondbloX / Seeking Alpha, Aug-2026 (indicative, unverified) |
| Current market refi rate — long tenor (directly observed) | 7.2%–7.8% (Oracle's own dollar bonds trading in the secondary market: the 4.125% notes due 2045 yielding ~7.2%; the 6.90% notes due 2052 at a yield-to-call of ~7.78%, Z-spread ~325bp) | Web: BondbloX (Oracle Corp bond pages), Aug-2026 (indicative, unverified) |
| Estimated refi cost step-up (bps) | **+180bps to +300bps** versus the 4.77% notes-payable weighted-average coupon — the low end applies to near-term refinancing, the high end to the long-dated paper that dominates the "thereafter" bucket | Calc: 6.65% − 4.77% ≈ +188bps (near/mid tenor); 7.2%–7.8% − 4.77% ≈ +243bps to +301bps (long tenor) |

The practical read: Oracle's *rate* exposure (floating-rate debt repricing with market rates) is small — about 1% of the debt book net of the Term Loan swap. The much larger exposure is *rollover* risk: fixed-rate debt maturing and having to be reissued at a materially higher coupon, because credit spreads — not just base rates — have widened sharply since Oracle's own notes were priced.

## 4. Refinancing Exposure

### Refi Funding Plan (no speculation)

Next-24-month refinancing-relevant maturities (FY2027 + FY2028, notes-payable basis) = **$17,355mn**.

| Source of repayment for next-24m maturities | Amount | Evidence |
|---|---:|---|
| Cash on hand | $31,289mn (FY2026 year-end cash & equivalents) | [FY26 10-K, Consolidated Balance Sheet]. Nominally covers the $17,355mn wall more than 1.8x over, **but** this cash is disclosed as freshly raised from FY2026's $42.7bn note issuance and $5.0bn preferred issuance, not retained operating cash — FY2026 levered free cash flow was −$23,686mn [`01`, Section 3; `earnings/01_historical-financials.md`]. It should be read as pre-funded capex dry powder that competes with debt repayment for the same dollars, not as surplus liquidity sitting idle. |
| Forecast FCF (or recent run-rate, labeled) | **Negative — not a source of repayment.** FY2026 levered FCF (CFO − total capex) = −$23,686mn; management has guided FY2027 net capex of roughly $70bn, higher than FY2026's ~$48bn net outlay, against FY2026 CFO of $31,977mn | [`business-model/11_capital-allocation-governance.md`, Section 3, Q4 FY26 earnings call, 2026-06-10; `earnings/01_historical-financials.md`, Section 1]. FCF is a net **user** of cash over the next 24 months on the current guidance, not a funding source for maturities. |
| Revolver availability | $10,000mn committed, $0 drawn as of 2026-05-31, unsecured, not a borrowing-base facility (so full commitment is usable) | [FY26 10-K, Note on Debt — Revolving Credit Agreement, entered 2026-03-06, 5-year term to 2031-03-06] |
| Asset-sale proceeds | Unknown — no asset-sale program announced or authorized in the data pool | Not disclosed. Stated as unknown per this module's hard rule; do not assume. |
| New debt issuance | Unknown / not specifically committed for these maturities — Oracle's FY2026 $42.7bn senior-note issuance was for "general corporate purposes, which may include capital expenditures, repayment of indebtedness, future investments or acquisitions and payment of cash dividends" [FY26 10-K, Note on Debt], i.e. broad authority, not an earmarked refinancing plan for the FY2027/FY2028 maturities specifically | No specific forward issuance plan for these tranches is disclosed in the pool. |

Cash ($31.3bn) plus the undrawn revolver ($10.0bn) — $41.3bn of committed liquidity — comfortably exceeds the $17.4bn next-24-month notes-payable wall on a standalone, static basis. The problem is that this same liquidity pool is also the funding source management has guided toward ~$70bn of FY2027 net capex; it cannot cover both the maturity wall and the capex program without either curtailing capex, drawing the revolver, or returning to the debt and/or equity markets. Rating posture is negative: S&P downgraded Oracle's issuer credit rating to BBB− from BBB (and short-term rating to A-3 from A-2) on 2026-07-09, one notch above speculative grade [`01`, Section 6; Key Developments, 2026-07-09], and Oracle's 5-year CDS spread widened to its highest level in roughly 18 years in August 2026, exceeding levels seen in the 2008 financial crisis (Web: BondbloX, Seeking Alpha, Aug-2026, indicative/unverified) — both signal the market is pricing meaningful further-downgrade risk, which would raise the cost (and could narrow the buyer base) for the next refinancing round. Floating-rate exposure itself is small (≈1% of the debt book net of the Term Loan swap), so a Fed rate move does not directly reprice much of Oracle's interest bill — the live risk is the coupon step-up on rollover, not floating-rate repricing. **Conclusion: exposed — depends on open markets.** The near-term (24-month) wall is technically covered by cash + the undrawn revolver in isolation, but Oracle's simultaneous ~$70bn capex commitment means it is not self-funded in practice — continued, open access to unsecured debt markets is required to run both programs at once, at a moment when the company's own rating and CDS trajectory are both moving the wrong way.

## 5. Refinancing Read

The maturity wall itself is not the acute problem: only 5.5% of the notes-payable book ($7.2bn) is due within 12 months and 17.6% ($22.9bn) within 36 months, against a headline 14+ year weighted-average maturity — but that long WAM is a product of the single largest debt-funded capex year in the company's history (FY2026's $42.7bn issuance, much of it 20–40-year paper), not evidence of a seasoned, low-risk ladder. Refinancing today's maturing debt at current market levels would add roughly **+180bps to +300bps** versus the existing 4.77% weighted-average coupon (6.5%–6.7% at the near/mid tenor via a Treasury-plus-CDS-spread proxy, versus 7.2%–7.8% directly observed on Oracle's own long-dated secondary bonds) — a real, quantifiable cost step-up, not a rounding issue, on a book this large. The single biggest refinancing risk is not any one maturity date; it is that Oracle must simultaneously roll ~$17.4bn of FY2027–FY2028 debt AND fund a guided ~$70bn of FY2027 net capex, almost entirely from the same $31.3bn cash pile, $10.0bn undrawn revolver, and continued market access — at the exact moment S&P has cut the rating to one notch above junk (2026-07-09) and Oracle's CDS spreads have widened to their highest level in roughly 18 years. **Survival under a 12-month "market closure" (no new unsecured issuance):** cash ($31.3bn) plus the undrawn revolver ($10.0bn) = $41.3bn would cover the FY2027 notes-payable maturity ($7.2bn) plus the FY2027 finance- and operating-lease payments (~$4.4bn combined) several times over, so Oracle would **not** default on its FY2027 debt-service obligations even with zero new unsecured issuance — but it could not simultaneously fund anything close to the guided ~$70bn FY2027 net capex program from that same liquidity pool, so a genuine market closure would force a sharp capex retrenchment, not a default, within the next 12 months. This is **inference, not from filings** — the 10-K does not model a market-closure scenario; it is this agent's own synthesis of the disclosed cash, revolver, and capex-guidance figures.
