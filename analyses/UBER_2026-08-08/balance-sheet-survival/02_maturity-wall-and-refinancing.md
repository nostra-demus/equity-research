# Maturity Wall & Refinancing — UBER

Reporting currency: US dollars (USD, millions unless stated). Reporting standard: US GAAP. All figures are carrying values as of June 30, 2026, the most recent balance sheet in the data pool [Q2 FY26 10-Q, Note 5 (Debt and Credit Arrangements)], unless stated otherwise. Gross debt is taken verbatim from `01_capital-structure-and-leverage.md`'s canonical figure of $12,945M (interest-bearing debt $12,723M per Note 5 + ~$222M finance leases carried forward from the FY2025 balance, flagged there as approximate/stale). This agent reads the maturity schedule independently from the underlying debt note and reconciles to that canonical total below.

**Subsequent-event overlay (not in the figures below).** On 2026-07-16 Uber signed a business combination agreement to acquire Delivery Hero SE (~$14.8bn equity value) and executed a €14.2 billion bridge credit agreement to help fund it; expected close is H2 2027 [Q2 FY26 10-Q, Note 15]. None of the maturity, coupon, or refinancing figures below reflect this — they are the as-reported, pre-Delivery-Hero-financing picture. Section 4 and Section 5 carry the caveat forward.

## 1. Maturity Schedule

Buckets below are calendar years, matching the structure of Uber's own debt note (10-K Note 8 uses the same calendar-year format) [FY25 10-K, Note 8]. "Within 12 months" is anchored to the report date (2026-08-08): the only debt due before August 2027 is the December-2026 Term Loan, so this bucket equals calendar 2026. Subsequent rows follow calendar years 2027–2030, with "Thereafter" covering 2031 onward.

| Period | Amount Due | % of Total Debt | Instrument(s) | Source |
|---|---:|---:|---|---|
| Within 12 months (2026, remainder) | $2,000M | 15.4% | 2026 Term Loan — $2.0bn drawn, due December 2026 | Q2 FY26 10-Q, Note 5 |
| Year 2 (2027) | $0 | 0.0% | — no scheduled maturities | Q2 FY26 10-Q, Note 5 |
| Year 3 (2028) | $3,049M | 23.5% | 2028 Exchangeable Senior Notes ($1,324M carrying value; ~$1.15bn principal, matures May 2028) + 2028 Convertible Notes ($1,725M, matures December 2028) | Q2 FY26 10-Q, Note 5 |
| Year 4 (2029) | $1,500M | 11.6% | 2029 Senior Notes (matures August 2029) | Q2 FY26 10-Q, Note 5 |
| Year 5 (2030) | $1,250M | 9.7% | 2030 Senior Notes (matures January 2030) | Q2 FY26 10-Q, Note 5 |
| Thereafter (2031+) | $5,000M | 38.6% | 2031 Senior Notes ($1,000M, Jan 2031) + 2034 Senior Notes ($1,500M, Sep 2034) + 2035 Senior Notes ($1,250M, Sep 2035) + 2054 Senior Notes ($1,250M, Sep 2054) | Q2 FY26 10-Q, Note 5 |
| Less: unamortized discount / issuance costs | $(76)M | (0.6%) | Netted across all instruments | Q2 FY26 10-Q, Note 5 |
| Finance leases (approximate — stale) | ~$222M | 1.7% | Not separately disclosed on the Jun-30-2026 balance sheet; FY2025 year-end balance carried forward, weighted-average maturity ~2030 per Capital IQ (not precisely bucketed above — flagged, per `01`) | FY25 10-K, Note 8; CIQ Financials_Annual.xls → Capital Structure Details |
| **Total** | **$12,945M** | **100.0%** | Matches `01`'s canonical gross debt figure exactly | Reconciliation computed |

**2028 is the true wall, not 2026.** The single largest calendar-year maturity is **2028 at $3,049M (23.5% of total gross debt)** — larger than the immediate 2026 Term Loan. It is split across two instruments with early-conversion/exchange optionality (the 2028 Exchangeable Senior Notes, secured by pledged Aurora stock and settleable in cash or Aurora stock at Uber's election up to the ~$1.15bn principal; and the 2028 Convertible Notes, unsecured with no financial covenants). Both could in principle convert/exchange before their stated maturity dates under specified triggers, which would pull this maturity forward rather than push it back [Q2 FY26 10-Q, Note 5].

**Revolver and undrawn Term Loan capacity are not in this table** — they carry no scheduled repayment while undrawn. The $5.0bn Revolving Credit Agreement matures September 2029 and was $0 drawn as of June 30, 2026. The Term Loan Credit Agreement's remaining $1.0bn commitment **expired August 2, 2026** — before this report's date — per the credit agreement's own terms ("permits borrowings through August 2, 2026, after which any undrawn commitments expire") [Q2 FY26 10-Q, Note 5, p.11781 region]. That $1.0bn is no longer available liquidity; only the $2.0bn already drawn under the Term Loan remains outstanding (and is the Within-12-months line above).

## 2. Maturity Profile Metrics

| Metric | Value |
|---|---:|
| Weighted-average maturity (years) | ~6.3 years (weighted by carrying value against each instrument's exact/stated maturity month from the June 30, 2026 balance sheet date; heavily skewed by the 2054 Senior Notes — $1,250M (9.7% of debt) that sit 28.25 years out contribute ~43% of the total weighted-year sum) |
| % due within 12 months | 15.4% ($2,000M ÷ $12,945M) |
| % due within 24 months | 25.7% ($3,324M = $2,000M + $1,324M ÷ $12,945M) |
| % due within 36 months | 39.0% ($5,049M = $2,000M + $1,324M + $1,725M ÷ $12,945M) |
| Largest single maturity year (and amount) | **2028 — $3,049M (23.5% of total gross debt)**, split between the 2028 Exchangeable Senior Notes (May 2028) and the 2028 Convertible Notes (December 2028) |

A WAM of ~6.3 years reads comfortably on its own, but that average is doing a lot of work: strip out the long-dated 2034/2035/2054 Senior Notes ($4,000M, 30.9% of the stack) and the remaining $8,945M of debt has a WAM of roughly 2.2 years — the near-term profile is materially tighter than the headline average suggests.

## 3. Rate Exposure

| Metric | Value | Source |
|---|---:|---|
| Fixed-rate share | ~85.1% ($11,021M = all Senior Notes $7,750M + 2028 Convertible Notes $1,725M + 2028 Exchangeable Senior Notes $1,324M (0.00% coupon, fair-value elected — no floating linkage) + finance leases ~$222M, ÷ $12,945M canonical gross debt) | Q2 FY26 10-Q, Note 5; computed |
| Floating-rate share | ~15.4% ($2,000M — the 2026 Term Loan only, Term SOFR + 0.825%, stated 4.46% / effective 4.8%; the $5.0bn Revolver is also floating-rate but undrawn and contributes $0 today) | Q2 FY26 10-Q, Note 5 |
| Weighted-average coupon (stated rates) | ~3.64% (weighted by carrying value across all nine instruments) | Computed from Q2 FY26 10-Q, Note 5 stated-rate table |
| Weighted-average coupon (effective rates) | ~3.82% (weighted by carrying value; effective rates include discount/issuance-cost amortization) | Computed from Q2 FY26 10-Q, Note 5 effective-rate table |
| Current market refi rate — 5-year tenor benchmark | ~5.2%–5.3% indicative (5-year US Treasury yield 4.33% as of 2026-08-07 + ICE BofA BBB US Corporate Index spread ~90–100bps as of early Aug 2026) | Web-sourced, indicative/unverified — see Sources below |
| Current market refi rate — 10-year tenor benchmark | ~5.5%–5.6% indicative (10-year US Treasury yield 4.65% as of 2026-08-07 + comparable BBB+ spread) | Web-sourced, indicative/unverified |
| Estimated refi cost step-up (headline, blended effective coupon vs. 5Y benchmark) | **+~140bps** (3.82% effective coupon vs. ~5.25% midpoint) | Computed — see caveat below |

**The headline step-up is misleading on its own — read the footnote, not just the number.** Roughly a quarter of Uber's debt ($3,049M — the 2028 Convertible Notes at 0.875% and the 2028 Exchangeable Senior Notes at 0.00%) carries a near-zero coupon because both were priced against equity-linked conversion/exchange features (into Uber stock, or into pledged Aurora stock), not against a plain-vanilla credit spread. Stripping those two instruments out, the weighted coupon on the six **plain, fixed-rate Senior Notes** ($7,750M) is **~4.67%** — against the ~5.25%–5.6% indicative market benchmarks above, the real step-up on those notes when they actually mature (soonest: 2029) is closer to **+60 to +90bps**, not +140bps. The floating-rate 2026 Term Loan (effective 4.8%, priced at Term SOFR + 0.825% ≈ 4.48% at today's 3.65% SOFR) would reprice roughly flat-to-slightly-lower if refinanced today — it was drawn in June 2026, close to current terms.

**Rating-linked pricing exists on the Revolver, not disclosed for the Term Loan or Notes.** The Credit Agreement's margin over Term SOFR/base rate and its commitment fee "fluctuate based upon the ratings of our non-credit enhanced senior unsecured long-term debt" [FY25 10-K, Note 8] — a rating downgrade would mechanically raise the cost of any future revolver draw. No change-of-control put, cross-default provision, or rating-trigger pricing step is disclosed for the Term Loan, the Senior Notes, the Convertible Notes, or the Exchangeable Notes [per `00_solvency-data-triage.md`, confirmed absent from the pool].

**No interest-rate hedge is disclosed against the floating exposure.** Uber's FY2025 10-K details FX forward/cash-flow hedges but discloses no interest-rate swap or cap against the Term Loan or Revolver [`00_solvency-data-triage.md`; FY25 10-K, Note 3]. The full $2,000M floating balance (15.4% of gross debt) is therefore unhedged: a 100bps move in SOFR changes annual cash interest on this position by ~$20M — small in absolute terms against Uber's $10.1bn TTM FCF (§4), but it is a live, unhedged exposure.

## 4. Refinancing Exposure

### Refi Funding Plan (no speculation)

| Source of repayment for next-24m maturities ($3,324M: the $2,000M Dec-2026 Term Loan + $1,324M May-2028 Exchangeable Notes) | Amount | Evidence |
|---|---:|---|
| Cash on hand | $4,870M cash & equivalents + $521M short-term investments = $5,391M unrestricted | Q2 FY26 10-Q, Balance Sheet |
| Forecast FCF (recent run-rate, labeled) | TTM (twelve months ended Jun-30-2026) FCF of $10,116M (CFO $10,424M − capex), +18.5% YoY — a trailing run-rate, not a company-issued forecast | `earnings/01_historical-financials.md`, cross-checked to CIQ Financials_Quarterly.xls → Cash Flow |
| Revolver availability | $5,000M fully available — $0 drawn of the $5.0bn committed Revolving Credit Agreement as of Jun-30-2026, no borrowing-base mechanism (commitment-based, not asset-based) | Q2 FY26 10-Q, Note 5 |
| Asset-sale proceeds | Unknown / not announced for debt repayment. (The Aurora Class A stake — $1,763M fair value — is already pledged as collateral for the 2028 Exchangeable Notes, not held for sale; the $8,759M of other strategic equity stakes (Didi, Grab, other) carry no announced monetization plan.) | Q2 FY26 10-Q, Note 3; `01_capital-structure-and-leverage.md` §3 |
| New debt issuance | Not committed for these specific maturities. Management has stated it "expect[s] to enter into term loan facilities that will reduce the commitments under the bridge credit agreement in the third quarter of 2026" and "expect[s] to enter into a new revolving facility that will replace [the] existing revolving credit agreement in the third quarter of 2026" — but both are tied to the Delivery Hero financing and revolver refresh, not to the 2026/2028 maturities in this table | Q2 FY26 10-Q, "Liquidity and Material Cash Requirements" section |

Cash and short-term investments alone ($5,391M) cover the entire next-24-month maturity wall ($3,324M) 1.6x over, without touching the fully-available $5.0bn revolver or the $10.1bn TTM FCF. Nothing in this row set is unknown or assumed.

**Read.** The near-term wall (next 12–24 months) is covered by cash on hand alone, without needing FCF, the revolver, or market access — this is a self-funded position for these specific maturities. S&P rates Uber BBB+ (issuer credit rating, foreign currency, long-term, as of 2026-08-06) [Capital IQ Credit Health Panel], and Uber's own Credit Health "Solvency" and "Overall" ranks are 1 (best) against a ten-company comparable set that includes DoorDash, Lyft, Grab, and Hertz [same source] — a rating and relative-health position consistent with continued market access, though this is a comp-set rank, not a numeric solvency score, and should not be read as a guarantee. Recent refi activity (the June 2026 $3.0bn Term Loan, the July 2026 €14.2bn bridge facility) shows demonstrated, current market access at scale. Floating-rate debt is $2,000M (15.4% of gross debt) — every 100bps move in benchmark rates changes annual cash interest on this slice by ~$20M, an amount immaterial next to $10.1bn of TTM FCF. **Conclusion: self-funded / low refi risk for the maturity wall as presented.**

## 5. Refinancing Read

The maturity wall itself is not what will strain Uber over the next two years: $2,000M is due in December 2026 and $1,324M more in May 2028, both fully covered by $5,391M of unrestricted cash and short-term investments before FCF or the revolver are even needed. The real wall — 2028, at $3,049M (23.5% of gross debt) split across two equity-linked instruments — sits far enough out, and the company generates enough cash ($10.1bn TTM FCF), that it reads as refinanceable in most environments rather than exposed. The blended weighted-average coupon (3.64% stated / 3.82% effective) understates the true refinancing cost because a quarter of the stack is near-zero-coupon convertible/exchangeable paper; the honest comparison — plain Senior Notes at ~4.67% against an indicative current market rate of ~5.2%–5.6% — points to a real step-up of roughly +60 to +90bps when those notes mature (soonest 2029), not the flashier +140bps the blended figure implies. **The single biggest refinancing risk is not the schedule in this table — it is the subsequent, not-yet-closed Delivery Hero acquisition**, funded via a new €14.2 billion bridge facility that management plans to term out into permanent debt in Q3 2026: if that converts to permanent financing at scale, it would roughly double gross debt (per `01`'s pro-forma flag) on top of the maturity schedule above, none of which this report's figures capture. Under a "market closure" test (no new unsecured issuance for 12 months) applied strictly to the maturity schedule in this report — the $2,000M Term Loan due December 2026 — Uber clears it comfortably: $5,391M of unrestricted cash and short-term investments alone cover it 2.7x over, with the $5.0bn undrawn revolver and $10.1bn of TTM FCF as further, untouched backstops. This conclusion is scoped to the as-reported debt stack only; it does not extend to a scenario where the Delivery Hero bridge has already converted to permanent debt, which is outside this agent's figures and is flagged for `06_downside-stress-test` to size explicitly.

---

### Sources for web-sourced benchmark rates (indicative, unverified, dated)

- [5-Year Treasury Rate — YCharts / Forbes Advisor](https://www.forbes.com/advisor/investing/treasury-rates/) — 4.33% as of 2026-08-07
- [US 10-Year Treasury Yield — Trading Economics](https://tradingeconomics.com/united-states/government-bond-yield) — 4.65% as of 2026-08-07
- [SOFR Rate Today — sofrrate.com](https://www.sofrrate.com/) — 3.65% as of 2026-08-06
- [ICE BofA BBB US Corporate Index Option-Adjusted Spread — FRED](https://fred.stlouisfed.org/series/BAMLC0A4CBBB) — BBB spread ~100bps, investment-grade ~81bps, early August 2026 (per market commentary referencing this series)
