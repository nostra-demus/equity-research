# Price & Capital Structure — NIVABUPA

**Company:** Niva Bupa Health Insurance Company Limited (NSEI:NIVABUPA / BSE:544286)
**Reporting standard:** India GAAP (IRDAI insurance template); company also voluntarily reports IFRS internally. All financial figures from Capital IQ vendor export based on India GAAP filings.
**Reporting currency:** INR (Indian Rupees). Figures in INR Millions unless noted. 1 crore = 10 million.
**Fiscal year:** 31 March. FY26 = April 2025 – March 2026.
**Listing jurisdiction:** India — NSE and BSE (detected from Capital IQ Financials.xls Key Stats header; US forms 10-K/10-Q are not applicable).
**Business type (per MODULE_RULES Business-Type Map):** Financial issuer — IRDAI-regulated health insurer. The EV bridge in this report is **informational only**; valuation must be done on an equity-direct basis (P/E, P/Tangible Book, excess-return on equity, DDM). EV-based multiples and FCFF DCF are secondary/informational for this entity.

---

## 1. Current Price

| Field | Value | Source | As-of Date |
|---|---|---|---|
| Current price | INR 84.03 | Capital IQ Financials.xls → Key Stats tab, Current Capitalization block | As-of date of quote not explicitly stated on the Key Stats tab itself (pool-sourced, as-of date unconfirmed — export downloaded ~Jun 2026) |
| Latest confirmed-dated price | INR 83.62 | Capital IQ Financials.xls → Historical Capitalization tab, Pricing as of column for the Mar-31-2026 period | 2026-05-21 (32 days before today's analysis date of 2026-06-22) |
| Currency | INR | Capital IQ Financials.xls, Key Stats and Historical Capitalization tabs | — |
| Price basis | Last close, pool-sourced from Capital IQ export | Capital IQ Financials.xls | Key Stats quote: ~Jun 2026; confirmed dated close: 2026-05-21 |
| 52-week high / low | INR 92.90 / 67.50 | Capital IQ Estimates Consensus tab, Market Summary section | As of export date ~Jun 2026 |

**Price-state determination:** The price of INR 84.03 is pool-sourced from a Capital IQ export (vendor tier, §4 tier 5). The export file's download date is approximately June 2026 but the Key Stats price cell carries no explicit "as of" timestamp within the export itself. The most recently dated close in the pool is INR 83.62 as of 2026-05-21 (from Historical Capitalization tab). The difference between the two (INR 84.03 vs. INR 83.62) is 0.5% — consistent with normal daily trading. The Estimates Consensus tab also shows "Latest Price/Last Close Price: 81.95/84.03" for NSEI:NIVABUPA, corroborating INR 84.03 as the last close. **Price-state: `pool-verified`** (the price is from the data pool; the as-of date is unconfirmed at the exact cell level, which is a staleness caveat, not a no-price trigger per MODULE_RULES Score-Cap rules). The ~1-month staleness between today's analysis date and the confirmed 2026-05-21 dated close is a data-quality deduction that downstream multiples and margin-of-safety calculations inherit; it does not trigger the no-price Score-Cap row.

**Corroboration:** Two Capital IQ export sources agree on INR 84.03 (Key Stats tab and Estimates Consensus Market Summary tab). The Historical Capitalization tab independently shows INR 83.62 on 2026-05-21. The Comps export (as of 2026-06-04) shows NIVABUPA at USD 0.88, which at an implied INR/USD rate of ~95.8 equals INR 84.3 — consistent with the INR 84.03 figure. Three independent data points within the pool agree within ~0.4%.

---

## 2. Share Count

| Field | Value | Source |
|---|---:|---|
| Basic shares outstanding (most recent, Key Stats) | 1,847.757 million | Capital IQ Financials.xls → Key Stats tab, Shares Out. row, Current Capitalization block |
| Basic shares outstanding (balance sheet date, FY26) | 1,847.457 million | Capital IQ Financials.xls → Balance Sheet tab, Supplemental row 65 (Total Shares Out. on Filing Date; FY26 = Mar-31-2026) |
| Diluted weighted-average shares (FY26 income statement basis) | Not separately disclosed in pool; Key Stats note "Dilution: Basic" | Capital IQ Financials.xls → Key Stats tab, header row 8 |
| Options / RSUs / warrants (dilutive instruments) | Not available in pool — no option schedule or dilution table present | Data pool; Capital IQ financial export does not include the detailed equity-compensation schedule for this issuer |
| Convertibles / potential shares | No convertibles in debt structure; subordinated NCDs are non-convertible (10.70% NCDs, unsecured) | Capital IQ Financials.xls → Capital Structure Details tab, FY26 section |
| **Fully diluted shares (TSM + if-converted)** | **Cannot be computed** — dilution detail absent; using 1,847.757M as proxy | Data pool — limitation: may understate diluted count if untracked stock options or RSUs exist |
| Share count used for market cap | 1,847.757 million (Key Stats most recent) | Capital IQ Financials.xls → Key Stats tab |
| Share count used for per-share fair value | 1,847.757 million (basic, used as proxy for diluted — stated limitation) | Capital IQ Financials.xls → Key Stats tab; no dilution schedule available |

**Share count reconciliation:**

| Component | Shares (millions) | Source |
|---|---:|---|
| Basic shares outstanding (most recent) | 1,847.757 | Key Stats tab, Current Capitalization block |
| + Dilutive options / RSUs (TSM) | Not available | Not disclosed in pool |
| + Convertible instruments (if-converted) | Nil — NCDs are non-convertible | Capital Structure Details tab |
| **= Proxy fully diluted shares** | **1,847.757** | Basic as proxy |

The difference between the Key Stats current figure (1,847.757M) and the balance sheet filing-date figure (1,847.457M) is 0.300M shares (0.016%), consistent with minor stock-compensation vesting between the balance sheet date (March 31, 2026) and the data export date. This is immaterial. No gap adjustment is required.

**Limitation:** A full dilution schedule (option strike prices, RSU vesting schedules, ESOP outstanding) is absent from the pool. The basic share count of 1,847.757M is used for both market cap and per-share fair value. If significant unexercised options or unvested RSUs exist, the fully diluted count could be modestly higher. Downstream agents should flag this when computing per-share intrinsic value. The company's FY26 diluted EPS of INR 1.98 (per Key Stats) uses the same basic count (Key Stats notes "Dilution: Basic"), suggesting dilution from options is either negligible or not separately computed in the vendor export for this issuer.

---

## 3. Market Capitalization

`Market cap = share count × current price = 1,847.757M × INR 84.03 = INR 155,267.0M`

(= INR 15,526.7 crores)

Cross-check: Capital IQ Key Stats tab states Market Capitalization = INR 155,267.043M — matches to the nearest million. Arithmetic verified.

| Item | Value | Source |
|---|---|---|
| Share count | 1,847.757 million | Capital IQ Key Stats tab |
| × Price per share | INR 84.03 | Capital IQ Key Stats tab |
| **= Market capitalization** | **INR 155,267.0M (₹15,527 crores)** | Calculated; confirmed in Key Stats |

---

## 4. Enterprise Value Bridge

**Critical business-type caveat (read first).** Niva Bupa is an IRDAI-regulated health insurer — a Financial issuer per MODULE_RULES Business-Type Map. For an insurer, the EV bridge is **informational only**. The investment portfolio (INR 96,072.9M in FY26) is the primary underwriting asset that matches policyholder liabilities; it is not a surplus cash balance and must NOT be netted from EV. The Capital IQ cash line of INR 1,586.6M represents genuine operating cash (cash and bank balances separate from the investment portfolio), and this is the only item netted. The full investment portfolio is the insurer's core business asset and does not reduce enterprise value.

| Component | Amount (INR M) | Source |
|---|---:|---|
| Market capitalization | 155,267.0 | Calculated (Key Stats) |
| + Total debt — subordinated NCDs | 2,540.4 | Capital IQ Capital Structure Details tab, FY26; 10.70% Sub NCDs (Nov 2031 + Mar 2032 maturities) |
| + Total debt — lease liabilities | 1,000.3 | Capital IQ Capital Structure Summary tab, FY26; Ind AS 116 lease liability |
| + Total debt (combined) | 3,540.7 | Capital IQ Capital Structure Summary tab, FY26 |
| + Minority / non-controlling interest | — | Key Stats: nil; confirmed in Historical Capitalization and Capital Structure Summary |
| + Preferred equity | — | Key Stats: nil; no preferred shares in issue |
| + Operating lease liabilities | Already included in Total Debt above (lease liabilities are capitalised under Ind AS 116 and included in Capital IQ's Total Debt figure) | Capital Structure Summary tab, FY26 |
| + Underfunded pension / OPEB | INR 23.6M net unfunded defined benefit obligation (immaterial: <0.01% of EV) | Capital IQ Pension OPEB tab, FY26 — Net Asset/Liability row = (23.6)M |
| − Cash & equivalents (operating cash only) | (1,586.6) | Capital IQ Capital Structure Summary tab, Additional Totals row; Balance Sheet tab row 21 (Cash and Equivalents). This is the operating cash balance, not the investment portfolio. |
| − Investment portfolio (insurer underwriting assets — NOT netted) | See note below | Balance Sheet tab FY26: Investment in Debt Securities INR 90,410.9M + Other Investments INR 5,662.0M = Total Investments INR 96,072.9M |
| **= Enterprise value (EV)** | **157,221.1** | Calculated; confirmed in Key Stats (TEV = 157,221.143M) |

(= INR 15,722.1 crores)

**Cross-check:** INR 155,267.0M + INR 3,540.7M − INR 1,586.6M = INR 157,221.1M. Matches Key Stats TEV to the nearest INR 0.1M.

**Adjustments NOT made (and why):**

1. **Investment portfolio (INR 96,072.9M) not netted.** A health insurer's investment portfolio matches policyholder reserves and regulatory solvency capital — it is the underwriting business itself, not surplus cash. Netting it against EV (as a data vendor might do under a "broad cash" definition) would produce a meaningless and deeply negative net debt figure of approximately INR −94,118.8M, which would imply a negative EV of approximately INR 61,148.2M. That result is not informative and is not a valid EV. Only the INR 1,586.6M of operating cash (per the balance sheet Cash and Equivalents line, separate from Total Investments) is netted.

2. **Operating leases.** Already capitalised and included in the INR 3,540.7M Total Debt figure (Capital Structure Summary shows INR 1,000.3M Lease Liabilities as a component of Total Debt). No separate add-back required.

3. **Pension underfunding.** The net defined benefit obligation is INR 23.6M (per Pension OPEB tab). This is less than 0.02% of EV and is immaterial. Not added to EV.

4. **Contingent claims.** No material contingent liability is disclosed from pool data; the Pension OPEB tab and Capital Structure Details do not show any other off-balance-sheet obligations.

---

## 5. Net Debt & Leverage Snapshot

**Net debt definition:** Total debt − cash and equivalents (strict basis, per CLAUDE.md §15). The insurer's investment portfolio is excluded from the cash side as explained in §4.

| Metric | Value | Source |
|---|---:|---|
| Total debt | INR 3,540.7M | Capital IQ Capital Structure Summary tab, FY26 |
| — of which: subordinated NCDs | INR 2,540.4M | Capital Structure Details, FY26 |
| — of which: lease liabilities (Ind AS 116) | INR 1,000.3M | Capital Structure Details, FY26 |
| Cash & equivalents (operating cash only) | INR 1,586.6M | Balance Sheet tab, FY26; Capital Structure Summary Additional Totals |
| **Net debt (strict: total debt − cash)** | **INR 1,954.1M** | Calculated; confirmed in Capital Structure Summary Additional Totals row (Net Debt = 1,954.1) |
| Net debt / FY26 EBITDA (vendor-derived; GAAP basis) | 0.38× | Calculated: 1,954.1 / 5,147.9 = 0.38×; confirmed in Capital Structure Summary (Credit Ratios: Net Debt/EBITDA = 0.367 — minor rounding difference vs using rounded EBITDA figure) |

**Basis label:** Net debt is stated on the **strict** basis (total debt − cash and equivalents). No liquid investments are netted. A broad-basis figure netting the investment portfolio would be deeply misleading for an insurer and is not presented. The Capital IQ Capital Structure Summary also shows "Total Cash & ST Investments = 1,586.6" for FY26, confirming that their "cash" line equals the operating cash balance alone (the investment portfolio is classified separately in the Balance Sheet as Total Investments, not as Cash & ST Investments by Capital IQ for this insurer).

**Leverage context:** Net debt of INR 1,954.1M (INR 195 crores) against total equity of INR 35,824.4M (INR 3,582 crores) gives a net debt/equity ratio of 5.5%. Leverage is very low. The subordinated NCDs of INR 2,540.4M carry a fixed coupon of 10.70% and mature in November 2031 and March 2032 — long-dated, fixed-rate, no near-term refinancing pressure (next maturity in the fixed-payment schedule is INR 357M in the first year, predominantly lease principal). EBIT/interest expense of 13.6× (Ratios tab, FY26) confirms comfortable interest coverage.

---

## 6. Per-Share Reference Values

All per-share figures use 1,847.757M shares (Key Stats most recent basic count, proxy for fully diluted given dilution schedule unavailability — stated limitation).

| Metric | Per Share (INR) | Source |
|---|---:|---|
| Book value per share | 19.39 | Calculated: 35,824.4M / 1,847.757M; cross-check: Capital IQ Key Stats shows P/BV close of 4.333× on price 84.03 → implied BV/share = 84.03 / 4.333 = 19.40 ✓ (rounding only) |
| Tangible book value per share | 19.11 | Calculated: 35,308.6M tangible BV / 1,847.757M; confirmed in Capital IQ Balance Sheet tab row 70 (19.112 per share using filing-date count of 1,847.457M — immaterial rounding difference) |
| Net debt per share (strict) | 1.06 | Calculated: 1,954.1M / 1,847.757M |
| Current price | 84.03 | Capital IQ Key Stats tab |
| Price / Book value | 4.33× | Calculated: 84.03 / 19.39; confirmed Key Stats P/BV close FY26 = 4.333× |
| Price / Tangible Book value | 4.40× | Calculated: 84.03 / 19.11; confirmed Key Stats Price/Tang BV close FY26 = 4.397× |
| Price / FY26 EPS (reported) | 42.4× | Calculated: 84.03 / 1.98; confirmed Key Stats P/LTM EPS close FY26 = 42.44× |

**Note on goodwill:** Capital IQ Balance Sheet tab shows no goodwill (row 30 = "−" for all years including FY26). The only intangible is Other Intangibles of INR 515.8M (capitalised software/platform). Tangible book value is therefore INR 35,824.4M − INR 515.8M = INR 35,308.6M, confirming the Capital IQ Tangible Book Value of INR 35,308.6M in row 69 of the Balance Sheet tab.

---

## 7. Anchor Summary (canonical numbers for downstream agents)

### Anchor Block (copy-forward)

- **Price:** INR 84.03 (pool-sourced; last confirmed dated close INR 83.62 as of 2026-05-21; Key Stats and Estimates Consensus tab corroborate INR 84.03 as most recent close; ~1-month staleness caveat)
- **Price-state:** `pool-verified` — price is from the Capital IQ data pool; as-of date unconfirmed at the Key Stats cell level (staleness is a data-quality caveat, not a no-price trigger per MODULE_RULES)
- **Currency:** INR (Indian Rupees)
- **Shares (market cap):** 1,847.757 million (Capital IQ Key Stats tab, most recent basic count)
- **Shares (per-share fair value):** 1,847.757 million (basic, used as proxy for fully diluted — limitation: dilution schedule absent from pool; no convertibles exist; dilution from options/RSUs unknown but the Key Stats EPS uses the same basic count, suggesting dilution is either small or not computed by the vendor for this issuer)
- **Market cap:** INR 155,267.0M (INR 15,527 crores)
- **Net debt (strict):** INR 1,954.1M (INR 195 crores) — total debt INR 3,540.7M minus operating cash INR 1,586.6M. Insurer investment portfolio (INR 96,072.9M) is NOT netted.
- **EV (informational only — Financial issuer):** INR 157,221.1M (INR 15,722 crores) — informational bridge; downstream valuation must be equity-direct (P/E, P/TBV, residual income / excess-return on equity). EV-based multiples are secondary.
- **Key caveats:**
  1. Business type is **Financial issuer (insurer)**. MODULE_RULES Business-Type Map requires equity-direct valuation. EV bridge is informational only.
  2. Investment portfolio of INR 96,072.9M is the insurer's core underwriting asset — not a surplus cash balance to net against EV. Only INR 1,586.6M of operating cash is netted in the strict net-debt calculation.
  3. Dilution detail (options/RSU schedule) is absent from the pool. The 1,847.757M share count is basic and used as the proxy for fully diluted — a stated limitation that carries through to all per-share fair-value outputs.
  4. Price as-of date is unconfirmed at the Key Stats level; latest confirmed-dated close is INR 83.62 on 2026-05-21 (~32 days before this analysis). Downstream multiples and margin-of-safety calculations inherit this ~1-month staleness risk.
  5. No standalone audited IRDAI Annual Report PDF is in the pool. All financial figures are from the Capital IQ vendor export (§4 tier 5), described as restated from IRDAI/Companies Act filings. Downstream agents must cite the Capital IQ export, not the filing.
  6. Operating lease liabilities (INR 1,000.3M) are already capitalised in the Ind AS 116 balance sheet and included in the Total Debt figure. No separate adjustment is needed.

---

*Agent: price-and-capital-structure*
*Output: analyses/NIVABUPA_2026-06-22/valuation/01_price-and-capital-structure.md*
