# Maturity Wall & Refinancing — INDIAMART

**Reporting currency: INR (₹ millions), consolidated, Ind AS (Indian Accounting Standards, Companies Act 2013 Sec. 133). Fiscal year ends 31 March.** Jurisdiction: India, listed NSE (INDIAMART) / BSE (542726), SEBI-LODR regime. Gross debt figures are carried forward from `01_capital-structure-and-leverage.md` (canonical: ₹231.02mn at FY26-end 31-Mar-2026, ₹216.28mn at the latest quarter-end 30-Jun-2026) and cross-checked directly against the FY26 Annual Report's lease-liability maturity note. No `ciq_facts.json` sidecar exists for this pool run; all figures below are this agent's own sourced read.

**Framing note, stated up front:** IndiaMART's entire gross debt is lease liabilities on office/equipment right-of-use assets (Ind AS 116) — the company carries **zero bank borrowings, bonds, term loans, or revolver** [`01_capital-structure-and-leverage.md`, Section 1]. There is no bond or loan maturing that requires capital-markets access; what "matures" here is a schedule of contracted lease payments that either roll off as leases expire or get renewed/renegotiated directly with landlords. This is a fundamentally lower-risk maturity profile than a market-debt wall, and the analysis below states that distinction explicitly rather than applying corporate-bond refinancing logic uncritically.

---

## 1. Maturity Schedule

Source: the FY26 Annual Report discloses a maturity analysis of **expected undiscounted cash flows** for lease liabilities as at each year-end [FY26 Annual Report (Ind AS), Note 15(a) — Lease liabilities]. This is the only year-by-year breakdown in the data pool; the Capital IQ Capital Structure Details export shows no maturity date field for the lease-liability line (`Maturity: -`) [`Financials Capital Structure Details.xls`, FQ1 2027 & FY2026 "As Reported Details"].

| Period | Amount Due (undiscounted) | % of Total (undiscounted schedule) | Instrument(s) | Source |
|---|---:|---:|---|---|
| Within 12 months | ₹117.38mn | 45.4% | Lease liabilities (office/equipment right-of-use leases) | FY26 Annual Report (Ind AS), Note 15(a) |
| Year 2 (12–24 months) | ₹115.91mn | 44.8% | Lease liabilities | FY26 Annual Report (Ind AS), Note 15(a) |
| Year 3 (24–36 months) | ₹20.56mn | 8.0% | Lease liabilities | FY26 Annual Report (Ind AS), Note 15(a) |
| Years 4–5 (36–60 months, combined bucket as disclosed) | ₹3.43mn | 1.3% | Lease liabilities | FY26 Annual Report (Ind AS), Note 15(a) |
| Thereafter (beyond 60 months) | ₹1.23mn | 0.5% | Lease liabilities | FY26 Annual Report (Ind AS), Note 15(a) |
| **Total (undiscounted lease payments)** | **₹258.51mn** | **100%** | — | FY26 Annual Report (Ind AS), Note 15(a) |

**Reconciliation to `01`'s canonical gross debt figure (required by self-check):** the ₹258.51mn total above is **undiscounted** (it includes future interest not yet accrued). `01`'s canonical gross debt of ₹231.02mn (FY26-end) is the **discounted** balance-sheet lease liability (current portion ₹100.12mn + non-current portion ₹130.90mn [FY26 Annual Report, Consolidated Balance Sheet, Note 15(a)]). The ₹27.49mn gap (₹258.51mn − ₹231.02mn) is the embedded future interest on the lease book, consistent with the FY26 P&L's "Interest cost of lease liabilities" of ₹27.09mn [FY26 Annual Report, Note 22 (Finance costs)] — the two figures track closely because the FY26 interest charge reflects roughly one year's unwind of a broadly similar-sized lease book. This is a standard Ind AS 116 reconciling item, not a data conflict.

**FY25 comparative (for trend context):** Within 1yr ₹129.61mn / Year 2 ₹115.35mn / Year 3 ₹113.49mn / Years 4–5 ₹20.52mn / Thereafter ₹2.99mn = Total ₹381.96mn [FY26 Annual Report, Note 15(a), comparative column]. The total undiscounted lease book has shrunk 32.3% year-on-year (₹381.96mn → ₹258.51mn) as leases roll off with no material new lease additions (FY26 additions were only ₹5.83mn against ₹131.85mn of payments made) [FY26 Annual Report, Note 15(a), lease-liability reconciliation].

**Scale check:** the entire lease book (₹258.51mn undiscounted, ≈$2.9mm at ~₹87/USD) is roughly 3.7% of FY26 EBITDA (₹5,205.94mn [`01`, Section 5]) and roughly 0.7% of the company's cash + liquid investments (₹31,202.65mn at FY26-end [`01`, Section 3]). At this scale, "maturity wall" is a formal exercise, not a real solvency question — the numbers are shown in full below because the module's job is to check, not to assume.

---

## 2. Maturity Profile Metrics

| Metric | Value |
|---|---:|
| Weighted-average maturity (WAM), years | ~1.18 years (≈14 months) — estimated using each bucket's midpoint (0.5 / 1.5 / 2.5 / 4.0 / assumed 6.0 years) weighted by the undiscounted amount in that bucket; the filing discloses bucketed ranges, not exact dates, so this is an approximation. *Inference from disclosed buckets, not a company-stated WAM.* |
| % due within 12 months | 45.4% (₹117.38mn / ₹258.51mn) |
| % due within 24 months | 90.3% (₹233.29mn / ₹258.51mn) |
| % due within 36 months | 98.2% (₹253.85mn / ₹258.51mn) |
| Largest single maturity year (and amount) | Within-12-months bucket, ₹117.38mn (45.4% of the schedule) — Year 2 is close behind at ₹115.91mn (44.8%), so the "wall" is really front-loaded across the first 24 months, not concentrated in one year |

The profile is short and front-loaded: 90.3% of the entire lease-payment schedule is due inside 24 months, and 98.2% inside 36 months, with almost nothing (1.8%) beyond Year 3. This is the normal shape for a book of office/equipment leases with multi-year renewal cycles, not a distress signature — a genuine corporate-bond wall this front-loaded would be a red flag, but here the total sum at risk is ₹258.51mn against ₹31.2bn of liquid resources (Section 4).

---

## 3. Rate Exposure

| Metric | Value | Source |
|---|---:|---|
| Fixed-rate share | 100% | `01_capital-structure-and-leverage.md`, Section 1 — all lease liabilities carry a fixed implicit/incremental-borrowing rate set at lease inception under Ind AS 116; Capital IQ's own "Floating Rate" field for the instrument reads "NA" [`Financials Capital Structure Details.xls`] |
| Floating-rate share | 0% | Same as above — there is no floating-rate debt to reprice if market rates move |
| Weighted-average implied discount rate | ≈9.65% (FY26 interest cost on lease liabilities ₹27.09mn ÷ average lease-liability balance of ₹280.70mn [(₹330.37mn opening + ₹231.02mn closing)/2]) | Calc. from FY26 Annual Report, Note 22 (Finance costs) and Note 15(a) (lease-liability reconciliation). *Inference, not from filings* — the filing does not itself state a single blended rate; this is a computed average across leases signed at different times and different implicit rates. |
| Current market refi rate (matching tenor, indicative benchmarks) | RBI policy repo rate 5.25% (Aug-2026, unchanged); India 2-year G-sec yield 6.00% (7-Aug-2026); India 3-year G-sec yield ≈6.05% (Aug-2026); India AAA-rated corporate bond yield, 2–3yr tenor, ≈6.56%–6.70% (LSEG benchmark, early Aug-2026) | **Web-sourced, indicative/unverified, dated Aug-2026** — see Sources below. No IndiaMART-specific credit rating exists in the data pool (Credit Health Panel shows "S&P Foreign Currency LT: –" for IndiaMART [`Credit Health Panel/Summary.txt`]; no CRISIL/ICRA/CARE rating action for the company was found in the pool — the company has never needed a rating because it has never issued rated debt) |
| Estimated refi cost step-up (bps) | **Not a clean like-for-like comparison — flagged, not computed as a headline number.** The implied ~9.65% average lease discount rate sits ABOVE today's ~6.6–6.7% AAA 2–3yr corporate-bond benchmark by roughly +295 to +310 bps, which on its face would suggest a NEGATIVE step-up (cheaper, not more expensive, to refinance today). But this comparison mixes two different things: the 9.65% figure is a blended real-estate/equipment lease discount rate set at various historical lease-inception dates (which typically embed an asset-specific/illiquidity premium above generic corporate credit), not a market bond coupon being rolled over. Lease renewals are negotiated with landlords against prevailing commercial-rent and lease-financing terms, not against G-sec or AAA-bond yields. **No reliable refi cost step-up can be computed from this pool's data**; the market-rate figures above are shown only to establish that IndiaMART is not facing a rising-rate refinancing shock (rates have been broadly stable to lower over FY24–FY26 relative to when older leases were priced) | Calc.; caveat is this agent's own read, labeled |

---

## 4. Refinancing Exposure

### Refi Funding Plan (no speculation)

| Source of repayment for next-24m maturities (₹233.29mn undiscounted, Section 1) | Amount | Evidence |
|---|---:|---|
| Cash on hand | ₹368.11mn (30-Jun-2026) — alone covers 158% of the entire next-24-month lease-payment schedule | `01_capital-structure-and-leverage.md`, Section 3; [FY26 Annual Report, Note 11] |
| Forecast FCF (recurring operating free cash flow) | FY26 FCF ₹6,872.19mn (CFO ₹6,942.19mn − capex ₹70.00mn); FY26 EBITDA ₹5,205.94mn — either figure dwarfs the ₹233.29mn 24-month lease obligation by roughly 20–30x | `earnings/01_historical-financials.md`, Section 1 |
| Revolver availability | Not applicable — no revolver facility exists [`01`, Section 1] | `01_capital-structure-and-leverage.md`, Section 1 |
| Asset-sale proceeds | Not applicable / not needed — no asset sale has been announced or is required | N/A |
| New debt issuance | Not applicable — no new debt issuance is committed or announced; the company has drawn zero incremental debt in every period FY22–LTM Jun-2026 [`01`, Section 1] | `01_capital-structure-and-leverage.md`, Section 1 |

The near-term wall (next 12–24 months, ₹233.29mn undiscounted) is fully covered by cash on hand alone (₹368.11mn), before any recourse to the company's ₹33.9bn broad liquid base (cash + ST investments + treasury book, latest [`01`, Section 3]) or to its recurring FCF (₹6,872mn FY26). IndiaMART requires no market access — no bank facility renewal, no bond rollover, no equity raise — to meet every lease payment scheduled through FY31 and beyond; the payments are, in substance, funded out of ordinary operating cash generation as they fall due, the same way rent is paid. No credit rating exists because the company has never needed one: it has drawn zero debt financing in every period covered by this pool ("Total Debt Issued" = nil, FY22 through LTM Jun-2026 [`01`, Section 1]). Floating-rate exposure is zero (Section 3), so no interest cost reprices if market rates move in either direction — the entire lease book sits at fixed, historically-set discount rates. **Conclusion: self-funded / low refi risk.**

---

## 5. Refinancing Read

The maturity wall here is trivial in absolute and relative terms: ₹258.51mn of total undiscounted lease payments (₹231.02mn on the balance sheet, discounted), front-loaded with 90.3% due inside 24 months, against ₹368.11mn of cash alone and ₹6,872mn of FY26 free cash flow — a coverage ratio no genuine debt-maturity wall would ever show. There is no cost step-up to compute in a meaningful sense: the only "refinancing" event that occurs is a landlord lease renewal, not a capital-markets rollover, and IndiaMART has no credit rating and no history of needing one because it has issued zero bonds, term loans, or drawn revolvers across the entire five-year window in this pool. The single biggest refinancing-adjacent risk is not financial but operational — if IndiaMART needed to relocate or expand office footprint on short notice, new leases would price at whatever commercial-rent and lease-financing terms prevail at signing, which the company does not control, but this is a cost-of-doing-business risk, not a solvency risk. **Under a "market closure" scenario (no new unsecured issuance available for 12 months), IndiaMART survives without any observable stress**: it has no unsecured issuance to roll in the first place, and its FY26 cash on hand (₹804.13mn at FY26-end / ₹368.11mn latest) plus ₹6,872mn of FY26 FCF comfortably exceed the entire lease-payment schedule for the next several years combined. This is a stated conclusion from this agent's own read of the maturity data, not the formal Layer-4 stress test — `06_downside-stress-test` owns the full EBITDA-haircut and liquidity-shock analysis.

---

Sources:
- [India 2 Year Note Yield - Trading Economics](https://tradingeconomics.com/india/2-year-note-yield)
- [India - 10-Year Government Bond Yield 2026 - countryeconomy.com](https://countryeconomy.com/bonds/india)
- [RBI August 2026 Policy: Repo Rate Held at 5.25% - Finnovate](https://www.finnovate.in/learn/blog/rbi-august-2026-policy-repo-rate-rupee-inflation)
- [RBI Policy Update August 2026 - India Infoline](https://www.indiainfoline.com/news/economy/rbi-policy-update-august-2026-repo-rate-unchanged-at-5-25-fy27-gdp-growth-raised-to-6-7-inflation-forecast-cut)
- [Corporate Bond Rates India 2026: Yield Analysis & Trends - Stashfin](https://www.stashfin.com/blogs/corporate-bonds-rate)
- [AAA Bonds Yield Spread (1Y vs 3Y) - India Macro Indicators](https://indiamacroindicators.co.in/economic-indicators/aaa-rated-bonds-yield-spread-1-year-3-year)
