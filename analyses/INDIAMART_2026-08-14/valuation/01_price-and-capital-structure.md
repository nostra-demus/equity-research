# Price & Capital Structure — INDIAMART

**Jurisdiction / reporting regime:** India (NSE: INDIAMART). Reporting standard Ind AS (India's IFRS-converged standard). Fiscal year ends 31 March. Reporting currency INR (all figures in ₹ millions unless stated; 1 crore = 10 million). Local-equivalent documents used: Annual Report (Ind AS) in place of a 10-K, and quarterly results filed under SEBI LODR Reg. 33 in place of a 10-Q.

## 1. Current Price

| Field | Value | Source | As-of Date |
|---|---|---|---|
| Current price | ₹1,784.60 | Capital IQ Financials export ("Key Stats" / "Historical Capitalization" sheets), close price used for TEV/market-cap calc [`IndiaMART InterMESH Limited NSEI INDIAMART Financials.xls`]; corroborated as "Previous Close" on Capital IQ Public Company Profile snapshot | 2026-08-12 (stated explicitly on the CIQ export: "TEV and Market Cap are calculated using a close price as of Aug-12-2026") |
| Currency | INR | — | — |
| Price basis | Last close (confirmed close, not intraday) | Capital IQ Public Company Profile [`IndiaMART InterMESH Limited NSEI INDIAMART Public Company Profile.rtf`] | Snapshot last updated 2026-08-13 05:18 AM (GMT-5) |

**Price staleness.** Run date 2026-08-14; quote as-of 2026-08-12. Age ≈ 2 calendar days = 2 trading days (Wed 12 Aug → Fri 14 Aug, no weekend in between). This is well inside the 5-trading-day freshness threshold — no refresh attempt or staleness cap needed. This is a genuine, disclosed as-of date (the export states it explicitly), not merely a file-download date, so it does not fall into the "vendor-export freshness unconfirmed" case.

Note: the same Capital IQ profile snapshot also shows a "Last (Delayed)" intraday tick of ₹1,797.90 (delayed ≥20 minutes, captured during the 2026-08-13 trading session). That figure is NOT used here — it is an unconfirmed intraday print, not a close, and mixing it with the EV bridge (which the vendor itself computed off the 2026-08-12 close) would break internal consistency. The anchor price is the confirmed 2026-08-12 close of ₹1,784.60.

**Price-state tag: `pool-verified`.**

## 2. Share Count

| Field | Value | Source |
|---|---:|---|
| Basic shares outstanding (as-of 2026-06-30, filing date 2026-07-21) | 60,133,558 | Q1 FY27 interim results (SEBI LODR), filed 2026-07-21 [`IndiaMART_InterMESH_Limited_-_Form_Interim_Report(Jul-21-2026).pdf`]; cross-checked against Capital IQ Balance Sheet / Key Stats sheets (identical) |
| Weighted-average basic shares (LTM to 2026-06-30) | 60,052,232 | Capital IQ Income Statement sheet, LTM column |
| Weighted-average diluted shares (FY26, year ended 2026-03-31) | 60,259,902 | FY26 Annual Report (Ind AS), Note on EPS: "Weighted average number of equity shares in calculating diluted EPS (C)" = 6,02,59,902 [`IndiaMART_InterMESH_Limited_-_Form_Annual_Report(Apr-30-2026).pdf`] |
| Weighted-average diluted shares (LTM to 2026-06-30) | 60,291,720 | Capital IQ Income Statement sheet, LTM column (consistent with the FY26 filing figure above, rolled forward one quarter) |
| Options/RSUs outstanding | Effectively nil — 0 ESOP options outstanding at 2026-03-31 (versus 13,868 at 2025-03-31); 27,184 shares issued on ESOP exercise during FY26 | FY26 Annual Report (Ind AS), ESOP note [`...Annual_Report(Apr-30-2026).pdf`] |
| Convertibles / potential shares | None disclosed — Capital Structure Details sheet marks the company's only capital-structure item (lease liabilities) "Convertible: No"; no convertible debt or preference shares issued by the company itself (CCPS references in the filings are IndiaMART's own investments INTO other companies as an investor, not instruments it has issued) | Capital IQ Capital Structure Details sheet; FY26 Annual Report |
| **Fully diluted shares (TSM + if-converted)** | ~60,291,720 (LTM weighted-average diluted; treasury-stock-method dilution for ESOPs already applied by the company, per Ind AS) | As above |
| Share count used for market cap | 60,133,558 (basic, period-end, 2026-06-30) | Matches Capital IQ market-cap calculation |
| Share count used for per-share fair value | 60,291,720 (LTM weighted-average diluted) | Best available fully-diluted proxy; no period-end fully-diluted count is separately disclosed |

The gap between basic and diluted is small (~0.26%) and shrinking — the ESOP pool is essentially exhausted (nil options outstanding at FY26-end). Market cap uses the period-end basic count (matching vendor convention and actual shares in issue); per-share fair-value work downstream should use the LTM diluted count to be conservative on dilution, though the difference is immaterial for this company.

## 3. Market Capitalization

`Market cap = share count × current price = 60,133,558 × ₹1,784.60 = ₹107,314.35 million (₹10,731.44 crore)`

Reconciles exactly to the Capital IQ Key Stats sheet figure (₹107,314.347606 million) and to the Public Company Profile snapshot (₹107,314.3 million).

## 4. Enterprise Value Bridge

**Cash-quality finding (material).** Of the ₹33,886.58 million Capital IQ groups as "Cash & Short-Term Investments" (2026-06-30), only ₹368.11 million is actual cash and cash equivalents. The remaining ₹33,434.47 million (98.7% of the line) is "Total current investments" — quoted mutual funds / exchange-traded funds measured at fair value through profit or loss (FVTPL), per the Q1 FY27 interim filing's investments note (e.g., ICICI Prudential Liquid Fund, Axis Liquid Fund, Bajaj Finserv Liquid Fund). These are liquid/short-duration debt-fund holdings used for treasury management of the company's own operating surplus — not investments held by a financial subsidiary, not restricted/margin balances, and not long-tenor instruments. But they are NOT "cash and cash equivalents" under Ind AS 7 (NAV can move with the market) and they carry FVTPL mark-to-market risk. Per the cash-quality rule, both bases are shown below.

| Component | Amount (₹mn) | Source |
|---|---:|---|
| Market capitalization | 107,314.35 | §3 above |
| + Total debt (all lease liabilities — no bank borrowings) | 216.28 | Q1 FY27 interim results, Note 15(a): current lease liabilities ₹105.23mn + non-current ₹111.05mn [`Form_Interim_Report(Jul-21-2026).pdf`]; matches Capital IQ Capital Structure Summary sheet exactly |
| + Minority / non-controlling interest | 0 | Balance sheet carries no NCI line (100%-owned consolidation) [`Form_Interim_Report(Jul-21-2026).pdf`] |
| + Preferred equity | 0 | No preference shares in issue |
| + Operating lease liabilities (off-balance-sheet) | Not added — CIQ's supplemental "Debt Equivalent Oper. Leases" estimate was ₹879.44mn at 2026-03-31 (~1.2% of EV), an imputed/estimated figure, not a filed liability; immaterial, not added |
| + Underfunded pension / other long-term obligations | Not added — "Debt Equiv. of Unfunded Proj. Benefit Obligation" ₹591.08mn at 2026-03-31 (CIQ estimate, ~0.8% of EV); the underlying pension liability (₹314.84mn) is already on the balance sheet within Total Liabilities but not folded into the EV bridge; immaterial, not added |
| − Cash & equivalents (strict) | 368.11 | Q1 FY27 interim results, Note 11 [`Form_Interim_Report(Jul-21-2026).pdf`] |
| − ST investments + current investments (mutual funds, "broad" basis) | 33,886.58 total (368.11 cash + 33,434.47 current investments; CIQ additionally itemizes ₹84.00mn as "Short Term Investments" — the filing's closest analogous line, "Bank balances other than cash and cash equivalents," is ₹87.20mn; a ~₹3.2mn/immaterial classification variance) | Q1 FY27 interim results, investments note (current investments ₹33,434.47mn) [`Form_Interim_Report(Jul-21-2026).pdf`]; Capital IQ Balance Sheet sheet for the ST-investments sub-split |
| − Equity-method investments | Not separately carved out — ₹2,746.89mn of investments in associates (2026-06-30) sit in Long-Term Investments, outside the Cash & ST Investments line; left in as an asset supporting equity value, per standard treatment | Capital IQ Balance Sheet sheet |
| **= Enterprise value — BROAD basis (canonical)** | **73,644.05** | Nets the full treasury book (cash + all current investments) against debt and market cap; matches Capital IQ's own TEV figure exactly, and is the basis peer/multiples work downstream will most likely draw from for cross-comparability |
| **= Enterprise value — STRICT basis (conservative alternative)** | **107,162.52** | Nets only true cash & equivalents (₹368.11mn) against debt and market cap; leaves the ₹33.4bn mutual-fund book on the balance sheet as a non-cash asset |

**Canonical choice and reasoning:** the BROAD basis (₹73,644.05mn) is used as the canonical EV. The mutual-fund holdings are genuinely liquid (quoted liquid/debt schemes, redeemable in days, not equity funds), are IndiaMART's own treasury — not a financial subsidiary's book — and the company is otherwise debt-free (its only "debt" is ₹216.28mn of capitalized lease liabilities). Treating ₹33.4bn of liquid, redeemable treasury as economically equivalent to cash is reasonable here. The STRICT figure is shown alongside because these holdings are technically "current investments," not Ind AS 7 cash equivalents, and carry FVTPL mark-to-market exposure that a pure cash balance does not — downstream agents relying on EV should be aware the two bases differ by ~₹33.5bn (a ~45% swing in EV), driven entirely by this one line.

## 5. Net Debt & Leverage Snapshot

| Metric | Value (₹mn, as of 2026-06-30) | Source |
|---|---:|---|
| Total debt (all lease liabilities) | 216.28 | Q1 FY27 interim results, Note 15(a) |
| Cash & equivalents | 368.11 | Q1 FY27 interim results, Note 11 |
| **Net debt — strict basis** (Total debt − Cash & equivalents only) | **(151.83)** net cash | Computed; matches the earnings module's own strict-basis figure at the same date [`analyses/INDIAMART_2026-08-13/earnings/01_historical-financials.md`] |
| **Net debt — broad basis** (Total debt − Cash, ST investments & current investments) | **(33,670.3)** net cash | Matches Capital IQ Historical Capitalization sheet exactly; matches the earnings module's own broad-basis figure |
| Net debt / EBITDA (CIQ-adjusted, LTM) | Not meaningful — net cash on both bases | Capital IQ Capital Structure Summary sheet ("NM") |
| Total debt / EBITDA (CIQ-adjusted, LTM) | 0.04x | Capital IQ Capital Structure Summary sheet |

IndiaMART carries no bank borrowings of any kind — its entire "debt" line is capitalized lease liabilities under Ind AS 116. This is a capital-structure characteristic, not a leverage or solvency finding (that belongs to the balance-sheet-survival module); noted here only because it explains why the "Total Debt" figure feeding the EV bridge is so small relative to the cash/investment book.

## 6. Per-Share Reference Values

| Metric | Per Share (₹) | Source |
|---|---:|---|
| Book value per share | 369.11 | Q1 FY27 interim results balance sheet (Total Common Equity ₹22,195.98mn ÷ 60.133558mn shares); matches Capital IQ Balance Sheet sheet exactly |
| Tangible book value per share | 291.13 | Same basis, Tangible Book Value ₹17,506.61mn (equity less Goodwill ₹4,542.72mn and Other Intangibles ₹146.65mn) |
| Net cash per share — broad basis | 559.93 | ₹33,670.3mn net cash ÷ 60.133558mn shares |
| Net cash per share — strict basis | 2.52 | ₹151.83mn net cash ÷ 60.133558mn shares |

## 7. Anchor Summary (canonical numbers for downstream agents)

Current price is a confirmed, dated pool close (2026-08-12) — margin of safety, downside-to-bear, and observed up/downside are assessable downstream using it. Capital structure is essentially debt-free; the one material caveat is that the headline "cash" figure is 98.7% liquid mutual-fund investments rather than bank cash — both EV bases are shown above, and downstream agents should state which basis (broad, canonical) they are using whenever they cite EV or net debt.

### Anchor Block (copy-forward)

- Price: ₹1,784.60 (2026-08-12 close, last close basis)
- Price-state: pool-verified — margin of safety, downside-to-bear, observed up/down, and attractiveness are all assessable
- Currency: INR
- Shares (market cap): 60,133,558 (basic, period-end 2026-06-30; Q1 FY27 interim results)
- Shares (per-share fair value): 60,291,720 (LTM weighted-average diluted, treasury-stock-method already applied; ESOP pool effectively exhausted)
- Market cap: ₹107,314.35 million (₹10,731.44 crore)
- Net debt: (₹33,670.3) million net cash — BROAD basis (canonical); (₹151.83) million net cash — STRICT basis
- EV: ₹73,644.05 million (₹7,364.40 crore) — BROAD basis (canonical); ₹107,162.52 million (₹10,716.25 crore) — STRICT basis
- Reporting currency: INR (Ind AS, FY ends 31 March)
- Key caveats: (1) "Cash & ST Investments" is 98.7% liquid mutual-fund holdings (FVTPL, not Ind AS cash equivalents) — EV/net-debt swing ~₹33.5bn (~45%) between bases; (2) fully diluted share count is a weighted-average proxy, not a disclosed period-end fully-diluted figure, though the gap to basic is immaterial (~0.26%) and the ESOP pool is nearly exhausted; (3) operating-lease and pension debt-equivalents (~₹1.5bn combined, CIQ estimates) were not added to the EV bridge — immaterial (~2% of EV) but named for completeness.
