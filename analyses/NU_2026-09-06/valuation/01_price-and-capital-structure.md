# Price & Capital Structure — NU

**Scope note.** This agent fixes the anchor numbers only: price, share count, market capitalisation, the enterprise-value bridge, net debt, and per-share reference values. It makes no valuation judgement — no multiple, no peer comparison, no fair value. Those belong to `02`–`07`.

**Reporting basis.** IFRS Accounting Standards as issued by the IASB (interim statements under IAS 34); presentation currency **US dollar (USD)**; fiscal year ends 31 December [FY2025 20-F, cover page and Note 2; Q2 2026 Interim Report (Aug-14-2026), KPMG review report]. Nu Holdings is a US-listed **foreign private issuer** filing Form 20-F, so the absence of a 10-K / 10-Q / 8-K / DEF 14A is not a data gap (CLAUDE.md §27).

**Business type — read this before using the EV bridge.** The `00` triage classifies NU as a **Financial (bank)**. Under the MODULE_RULES Business-Type Method Map, EV-based multiples, an FCFF DCF, and **the EV bridge as a value** are all invalid for this issuer. Section 4 below is therefore built for completeness and cross-checking only, and is labelled informational throughout. The base a valuation actually runs on here is **equity**: book value, tangible book value, and earnings.

**Cross-module note.** `balance-sheet-survival/01_capital-structure-and-leverage.md` was **not produced in this run root** (only `00_solvency-data-triage.md` exists). There is therefore no inherited filing-based canonical net-debt figure. Per the Cross-Module Inputs rule, this agent builds total debt **directly from the Q2 2026 interim filing's own notes** (Note 24 borrowings, Note 21 repurchase agreements, and the lease-liability line) rather than adopting the Capital IQ vendor aggregate, and states the reconciliation in §4 and §7. `earnings/01_historical-financials.md` is available and was used as a cross-check.

**Duplicate-copy note.** The pool carries several Capital IQ exports twice and the filings three times. One copy of each has been used: the Q2 2026 interim financials from `Nu_Holdings_Ltd_-_Form_Interim_Report(Aug-14-2026).pdf`, and the CIQ balance sheet from `Nu Holdings Ltd NYSE NU Financials Balance Sheet.xls` → tab `Balance Sheet`. No figure enters this report twice under two filenames.

---

## 1. Current Price

| Field | Value | Source | As-of Date |
|---|---|---|---|
| **Decision line** (ticker · venue · currency) | **NYSE:NU · New York Stock Exchange · USD** — Class A Ordinary Shares (not an ADR, so no depositary fee) | `Nu Holdings Ltd NYSE NU Equity Listings.xls` → tab `Equity Listings` (primary listing, shown in bold); FY2025 20-F, Item 4 | 2026-08-28 |
| Current price (anchor) | **USD 14.30** | `Company Comparable Analysis Nu Holdings Ltd .xls` → tab `Financial Data`, subject row "Day Close Price Latest"; corroborated by `NuHoldingsLtdNYSENUEstimatesReport.xls` → tab `Consensus`, Market Summary ("Latest Price/Last Close Price 14.30/14.30") and by `… Equity Listings` → `Last Close Price 14.3`, Trade Date 2026-08-28 | 2026-08-28 close (export as-of 2026-08-29) |
| Currency | US dollar (USD) | `… Equity Listings`, Currency column | 2026-08-28 |
| Price basis | **Last close** — pool-sourced, exchange close, date disclosed inside the export | `… Equity Listings`, Trade Date field | 2026-08-28 |
| Fresher indicative quote (context only) | USD 15.37 — *Indicative price, web-sourced as of 2026-09-04, not from data pool — unverified* | Web: stockanalysis.com quote page and investing.com historical-data page, both read 2026-09-06, both reporting a 2026-09-04 close of USD 15.37 (agree exactly, within the ~1% corroboration test) | 2026-09-04 close |

**Why the as-of date is real, not a download date.** The Capital IQ `Equity Listings` export carries its own `Trade Date` field of 2026-08-28 for every line, and the comps workbook carries `As-Of Date: 2026-08-29`. The price's own as-of is therefore disclosed, not inferred from a file timestamp. Price-state is **`pool-verified`**.

**The 14.88 divergence — named, not adopted.** A second Capital IQ read of USD **14.88** sits in `Nu Holdings Ltd NYSE NU Financials Key Stats.xls` → tab `Key Stats`, "Current Capitalization → Share Price". That figure is **undated in the export** — it carries no trade date and matches none of the dated prices in the pool (the `Historical Capitalization` tab prices the Jun-30-2026 balance sheet at USD 13.93 as of 2026-08-13). The dated USD 14.30 is adopted as the anchor; USD 14.88 is recorded here as an undated vendor divergence of +4.1% and is **not** used anywhere downstream. Anyone finding a market cap of USD 71,880.6m in the Key Stats tab is looking at the 14.88 figure, not this module's anchor.

**Price staleness — counted, refreshed, and handed to `99`.**
- Anchor as-of: 2026-08-28 (Friday close). Run date: 2026-09-06 (Sunday). Calendar age **9 days**.
- Exact count of trading sessions since the anchor close: **5** (Aug 31, Sep 1, Sep 2, Sep 3, Sep 4).
- The MODULE_RULES conversion (`calendar days × 5/7`) gives **6.4 trading days**.
- The two counts straddle the ">5 trading days" line. Per CLAUDE.md §4 (use the more conservative interpretation when readings conflict), treat the anchor as **stale**: `99` applies **valuation confidence max 70**. It does *not* reach the >15-trading-day tier.
- **Refresh attempted, and it succeeded on an indicative basis.** No fresher price exists anywhere in the data pool — the Key Stats 14.88 is undated and so cannot serve as a refresh, and the IBKR files in this pool are the user's personal Indian tax pack, not a price screenshot. A web refresh was then attempted and returned **USD 15.37 at the 2026-09-04 close**, reported identically by two independent sources (stockanalysis.com and investing.com). That is **+7.48%** above the pool anchor.
- **Consequence for `07` and `99` (Price freshness — re-anchor, don't just cap).** The pool price stays the `pool-verified` anchor, but the drift is material. `07` and `99` must present margin of safety and downside-to-bear **at both prices** — USD 14.30 (pool-verified, 2026-08-28) and USD 15.37 (indicative, web-sourced, 2026-09-04) — each labelled, leading with the fresher read. The fair-value **levels** are price-independent, so re-anchoring is a one-step recomputation: return = `(level − price) / price`.

### Other listed lines

Nu Holdings has **nine active listings** across seven venues. All are the same economic Class A ordinary share, reached through different wrappers. Every line below is priced at the **2026-08-28** close — the same date as the decision-line anchor — except Boerse Muenchen (2026-08-27).

| Listed line | Ticker · venue | Currency | Price | As-of | Ratio to 1 ordinary share | Price per ordinary share, own currency | Premium / (discount) vs decision line, same-currency | Notes for a holder of this line |
|---|---|---|---:|---|---|---:|---:|---|
| Class A ordinary (decision line) | NYSE:NU · New York Stock Exchange | USD | 14.30 | 2026-08-28 | 1:1 | USD 14.30 | — | 3-month average volume 76.82m shares — by far the deepest line. 52-week range 18.98 / 11.20 |
| CEDEAR (USD-settled) | BASE:NUD · Buenos Aires | **USD** | 7.51 | 2026-08-28 | 2 CEDEARs = 1 ordinary | **USD 15.02** | **+5.03%** | **The only cross-line gap measurable with no FX assumption.** Same currency, same date. 3-month average volume 0.09m — thin |
| BDR Level I | BOVESPA:ROXO34 · São Paulo | BRL | 12.33 | 2026-08-28 | 6 BDRs = 1 ordinary | BRL 73.98 | Not computable — no sourced FX (see below) | Depositary Banco Bradesco S.A.; a BDR carries a depositary fee and Brazilian tax treatment the NYSE line does not. 3-month average volume 7.11m BDRs |
| CEDEAR (ARS-settled) | BASE:NU · Buenos Aires | ARS | 11,500 | 2026-08-28 | 2 CEDEARs = 1 ordinary | ARS 23,000 | Not computable — no sourced FX | Argentine capital-control and implied-FX effects sit inside this price. Volume 0.63m |
| Class A ordinary | BVC:NUCO · Bolsa de Valores de Colombia | COP | 46,200 | 2026-08-28 | 1:1 | COP 46,200 | Not computable — no sourced FX | Volume 0.09m — thin |
| Class A ordinary | BMV:NU N · Bolsa Mexicana de Valores | MXN | 243.68 | 2026-08-28 | 1:1 | MXN 243.68 | Not computable — no sourced FX | Volume 0.03m — thin |
| Class A ordinary | BIT:1NUH · Borsa Italiana | EUR | 12.45 | 2026-08-28 | 1:1 | EUR 12.45 | Not computable — no sourced FX | 3-month average volume reported as 0 |
| Class A ordinary | DB:M1Z · Deutsche Boerse | EUR | 12.32 | 2026-08-28 | 1:1 | EUR 12.32 | Not computable — no sourced FX | 3-month average volume reported as 0 |
| Class A ordinary | MUN:M1Z · Boerse Muenchen | EUR | 12.79 | **2026-08-27** | 1:1 | EUR 12.79 | Not computable — no sourced FX | Different (older) trade date and 3-month average volume 0 — a stale, illiquid print, not a tradable gap |

Source for the whole table: `Nu Holdings Ltd NYSE NU Equity Listings.xls` → tab `Equity Listings` (exchange, ticker, security name carrying the ratio, currency, trade date, last close, 52-week range, 3-month average volume).

**Why NYSE:NU is the decision line.** It is Capital IQ's flagged primary listing, it is the ordinary share itself rather than a depositary receipt, it is quoted in the company's own reporting currency (USD), and its 3-month average volume of 76.82m shares is roughly ten times the next-deepest line. Every fair value, margin of safety, downside-to-bear, and yield produced by this module belongs to **this** line and to no other.

**FX limitation, stated honestly.** The data pool contains **no dated USD cross-rates for BRL, ARS, COP, MXN or EUR** on 2026-08-28. (The only FX table in the pool — `Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx` → tab `IBKR - SBI FX Rates` — is an INR-based table for the Indian tax year to 2026-03-31 and is useless here.) A same-currency premium/discount for the non-USD lines is therefore **not computable from pool evidence**, and rather than import an unverified web rate for six lines this report states the **implied parity cross-rate** each line would need for zero gap, and lets the reader judge plausibility:

| Line | Price per ordinary share | Implied parity rate vs USD 14.30 | Read |
|---|---:|---:|---|
| BOVESPA:ROXO34 | BRL 73.98 | **5.17 BRL/USD** | A plausible BRL/USD level. This also **resolves the ratio conflict** the `00` triage flagged: the CIQ Consensus Market Summary field "Common Shares Per ADR = 1" for ROXO34 cannot be right — at 1:1 the implied rate would be 0.86 BRL/USD, which is absurd. The `Equity Listings` security name "BDR EACH 6 REPR 1 ORD SHS" is the correct ratio, and **6:1 is what this module uses.** |
| BASE:NU | ARS 23,000 | 1,608 ARS/USD | Plausible order of magnitude for a CEDEAR-implied Argentine rate |
| BVC:NUCO | COP 46,200 | 3,231 COP/USD | Plausible COP/USD level |
| BMV:NU N | MXN 243.68 | 17.04 MXN/USD | Plausible MXN/USD level |
| BIT:1NUH | EUR 12.45 | 0.871 EUR/USD (≈ 1.149 USD/EUR) | The two liquid-listed European lines imply rates 1.1% apart — internally consistent, so no material gap is evidenced |
| DB:M1Z | EUR 12.32 | 0.862 EUR/USD (≈ 1.161 USD/EUR) | as above |
| MUN:M1Z | EUR 12.79 | 0.894 EUR/USD (≈ 1.118 USD/EUR) | Implies a ~2.7% gap vs DB:M1Z, but the print is a day older with zero reported volume — a stale mark, not a tradable difference |

**The one material cross-line fact.** `BASE:NUD` (the USD-settled Argentine CEDEAR) prices the ordinary share at **USD 15.02 against USD 14.30 on the NYSE on the same day — a +5.0% premium, with no FX assumption anywhere in the comparison.** That is a real, tradable difference in what a holder of that line paid. It is a capital-control / cross-border-access premium on a line with 0.09m average daily volume, **not** evidence about fair value, and nothing in this module's fair value transfers to it.

**A second CIQ units defect, named so nobody uses it.** The Estimates `Consensus` tab reports a `BOVESPA:ROXO34` mean target price of **3.56** under a header reading "(USD)", while the same block reports the ROXO34 price as **12.33** in "Brazilian Real". Those two numbers are not on the same basis, and Capital IQ's own "Potential Upside" cell for ROXO34 is blank ("-/-") — the vendor did not compute it either. **The ROXO34 target price is unusable as published and must not be quoted by any downstream agent.** The NYSE:NU consensus target (mean USD 18.78 / median USD 19.00, 22 contributors) is the only target on a clean basis, and it belongs to `03`/`07`, not to this agent.

---

## 2. Share Count

| Field | Value | Source |
|---|---:|---|
| Class A ordinary shares issued and outstanding (net of treasury), as of Jun-30-2026 | 3,808,087,961 | Q2 2026 Interim Report (Aug-14-2026), Note 31 (Equity), share roll-forward |
| Class B ordinary shares issued and outstanding, as of Jun-30-2026 | 1,022,600,698 | Q2 2026 Interim Report, Note 31 |
| **Total ordinary shares outstanding, as of Jun-30-2026** | **4,830,688,659** (4,830.7m) | Q2 2026 Interim Report, Note 31; independently matched by CIQ `Balance Sheet` → "Total Shares Out. on Filing Date" 4,830.688659m and by comps `Financial Data` → "Shares Outstanding Latest" 4,830.7m |
| Treasury shares held (Class A), Jun-30-2026 | 40,659,600 (already deducted above) | Q2 2026 Interim Report, Note 31(a) and 31(e)(i) |
| Basic weighted-average shares, Q2 2026 | 4,857,131 thousand (4,857.1m) | Q2 2026 Interim Report, Note 9 |
| **Diluted weighted-average shares, Q2 2026** | **4,904,837 thousand (4,904.8m)** | Q2 2026 Interim Report, Note 9 |
| Diluted weighted-average shares, H1 2026 | 4,908,841 thousand (4,908.8m) | Q2 2026 Interim Report, Note 9 |
| Dilutive adjustment, Q2 2026 — share-based payment (SOPs + RSUs) | +44,667 thousand | Q2 2026 Interim Report, Note 9 |
| Dilutive adjustment, Q2 2026 — business acquisition contingent shares | +3,039 thousand | Q2 2026 Interim Report, Note 9 |
| Antidilutive instruments **excluded** from the diluted count, Q2 2026 | 14,675 thousand (26,050 thousand for H1) | Q2 2026 Interim Report, Note 9 |
| Authorised and unissued shares reserved for share-based payments | 228,167,482 | Q2 2026 Interim Report, Note 31 |
| Convertibles / other potential shares | **None.** No convertible debt exists. Class B converts 1:1 into Class A and is already counted in the 4,830.7m total | FY2025 20-F, Item 7 / Item 10 (Class B convertible one-for-one); Q2 2026 Interim Report, Note 24 (borrowings are financial bills and a margin loan facility — no convertible instrument) |
| **Fully diluted shares (TSM + if-converted), point-in-time** | **4,878,395 thousand (4,878.4m)** | Build shown below |
| **Share count used for market cap** | **4,830,688,659 (4,830.7m)** — point-in-time shares outstanding | Q2 2026 Interim Report, Note 31 |
| **Share count used for per-share fair value** | **4,878,395 thousand (4,878.4m)** — fully diluted | Build shown below |

### Share Count Reconciliation Table

| Step | Shares (thousands) | Basis |
|---|---:|---|
| Class A ordinary outstanding, Jun-30-2026 (net of 40,659,600 treasury) | 3,808,088 | Interim Note 31 |
| + Class B ordinary outstanding, Jun-30-2026 (convertible 1:1 into Class A) | 1,022,601 | Interim Note 31 |
| **= Total shares outstanding — used for market cap** | **4,830,689** | |
| + Options / RSUs, treasury-stock method (the Q2 2026 dilutive increment the company itself computed) | 44,667 | Interim Note 9 |
| + Business-acquisition contingent shares | 3,039 | Interim Note 9 |
| + Convertible securities, if-converted | 0 | No convertibles outstanding |
| **= Fully diluted shares — used for per-share fair value** | **4,878,395** | |
| *Memo: antidilutive instruments not included* | *14,675* | *Interim Note 9 — excluded because they are antidilutive at the current price* |

**Why both counts, and which does what.** Market capitalisation multiplies the shares that actually exist today (4,830.7m) by today's price — this is the MODULE_RULES Fully Diluted Equity Rule 1, and it reproduces the vendor market cap exactly (§3). Per-share fair value divides by the fully diluted count (4,878.4m), because a fair value is a claim per share after the options and RSUs already granted are settled. The gap between the two is **47.7m shares, or 0.99%** — under 1%, so it does not move any per-share figure by more than about a cent. This is a genuinely low-dilution share base for a company whose employee incentive plan is entirely share-settled.

**Both share classes are counted, and this matters by 21%.** Only Class A is listed; Class B is unlisted, holds 74.3% of voting power, and is convertible one-for-one into Class A [FY2025 20-F, Item 3.D / Item 7]. Because Class B has identical economic rights and converts 1:1, market capitalisation is computed on the **total** 4,830.7m, not on the 3,808.1m Class A alone. Capital IQ does the same, pricing both classes at the Class A price [`Key Stats` → Current Capitalization, "+ Class B Ordinary Shares Shares Out 1,022.600698 × Class B Ordinary Shares Share Price"]. **Using the Class A count alone would understate market capitalisation by 21.2%** (3,808.1 / 4,830.7 − 1). Any downstream agent quoting a market cap near USD 54.5bn has made this error.

**Weighted-average versus point-in-time.** The basic weighted average for Q2 2026 (4,857.1m) is *above* the Jun-30-2026 outstanding count (4,830.7m) because the company bought back 40.7m Class A shares during the quarter. Trailing per-share metrics (LTM diluted EPS of USD 0.734, CIQ `Key Stats`) are computed on weighted-average counts and should not be mixed with the point-in-time counts used for market cap and fair value.

---

## 3. Market Capitalization

`Market cap = shares outstanding × current price`

**At the pool-verified anchor (USD 14.30, 2026-08-28 close):**

`4,830,688,659 × USD 14.30 = USD 69,078.8m` (USD 69.08bn)

This ties exactly to the vendor's own figure — comps `Financial Data`, subject row "Market Capitalization Latest" = 69,078.8 — which is a clean check that the share count and price used here are the same two numbers Capital IQ used.

**At the fresher indicative quote (USD 15.37, 2026-09-04 close, web-sourced, unverified):**

`4,830,688,659 × USD 15.37 = USD 74,247.7m` (USD 74.25bn) — **+7.48%** versus the anchor.

*Memo only, not the market cap:* on the fully diluted count, `4,878,395 thousand × USD 14.30 = USD 69,761.1m`. This is shown so downstream agents can see the size of the dilution effect (+USD 682m, +0.99%); the market cap figure to use is **USD 69,078.8m**.

**Undated vendor alternative, for reference only:** the CIQ `Key Stats` tab shows Market Capitalization 71,880.6m at its undated share price of 14.88. Not adopted (§1).

---

## 4. Enterprise Value Bridge

> **INFORMATIONAL ONLY — do not use this EV as a value.** NU is a Financial (bank). Under the MODULE_RULES Business-Type Method Map, EV-based multiples and the EV bridge as a value are invalid for this issuer, and no downstream agent may build an EV/EBITDA, EV/EBIT or EV/Sales read on it. The reason is visible in the bridge itself: it excludes **deposits of USD 45,328.4m** and **payables to network of USD 15,541.7m**, which together are USD 60.9bn of the bank's actual funding [Q2 2026 Interim Report, statement of financial position, Notes 22 and 23]. An "enterprise value" that ignores 74% of a bank's liabilities is an arithmetic exercise, not an economic quantity. It is built here because the Report Structure requires it and because the component parts (debt, cash, minority interest, associates) are themselves needed for §5 and §6.

All balance-sheet components are as of **Jun-30-2026**, from the KPMG-reviewed IAS 34 interim statements.

| Component | Amount (USD m) | Source |
|---|---:|---|
| Market capitalization (at USD 14.30) | 69,078.8 | §3 above |
| + Total debt (canonical, filing-built — see build below) | 5,807.0 | Q2 2026 Interim Report: Note 24 (borrowings and financing) + Note 21 (repurchase agreements) + balance-sheet lease liabilities |
| + Minority / non-controlling interest | 2.1 | Q2 2026 Interim Report, statement of financial position, "Equity attributable to non-controlling interests" 2,051 thousand |
| + Preferred equity | 0.0 | Q2 2026 Interim Report — no preferred class in the equity statement; CIQ `Key Stats` "Book Value of Pref. Equity" = "–"; comps `Financial Data` "LTM Total Pref. Equity" = "–" |
| + Operating lease liabilities | *already inside total debt (66.4)* | Q2 2026 Interim Report, balance sheet "Lease liabilities" 66,433 thousand |
| + Underfunded pension / other long-term obligations | 0.0 | CIQ `Nu Holdings Ltd NYSE NU Financials.xls` → tab `Pension OPEB` carries no funded-status figures; no defined-benefit obligation is disclosed in the interim statements |
| − Cash & equivalents | (13,551.6) | Q2 2026 Interim Report, Note 11 (Cash and Cash Equivalents), 13,551,611 thousand |
| − Equity-method investments (investments in associates) | (93.0) | Q2 2026 Interim Report, statement of financial position, "Investments in associates" 93,004 thousand |
| **= Enterprise value (informational only)** | **61,243.3** | 69,078.8 + 5,807.0 + 2.1 + 0.0 − 13,551.6 − 93.0 |

At the fresher indicative price of USD 15.37 the same bridge gives **USD 66,412.2m**. No plug is used; every line is sourced and the arithmetic is shown.

### Total debt — built from the filing, with the vendor gap named

| Build | Amount (USD m) | Source |
|---|---:|---|
| Borrowings and financing (the company's own debt note) | 4,682.3 | Q2 2026 Interim Report, **Note 24** — financial bills 2,814.3 + margin loan credit facility 1,867.9 = 4,682,252 thousand |
| + Repurchase agreements (secured wholesale funding) | 1,058.3 | Q2 2026 Interim Report, **Note 21**, 1,058,343 thousand |
| + Lease liabilities | 66.4 | Q2 2026 Interim Report, balance sheet, 66,433 thousand |
| **= Total debt (canonical for this run)** | **5,807.0** | |
| *Memo: debt-note-only figure (Note 24 alone)* | *4,682.3* | *The narrowest defensible definition — what the company itself labels "borrowings and financing"* |
| *Memo: Capital IQ vendor "Total Debt"* | *5,896.7* | *CIQ `Balance Sheet`, as-of Jun-30-2026; `ciq_facts.json` `total_debt_m` = 5,896.7, status `present`* |

**Reconciliation of the vendor figure — the gap is named, not silently dropped.** The Capital IQ aggregate of **USD 5,896.7m** exceeds the filing-built canonical figure of **USD 5,807.0m** by exactly **USD 89.7m**, which is the interim balance sheet's **derivative financial liabilities** (89,659 thousand, Note 20). Capital IQ folds derivative liabilities into its "Short-term Borrowings" line (1,148.002 = repurchase agreements 1,058.343 + derivatives 89.659). Derivatives are hedging instruments carried at fair value, not borrowed money, so they are excluded from the canonical debt figure here. The reconciliation is exact and leaves no residual:

`4,682.252 (Note 24) + 1,058.343 (Note 21) + 66.433 (leases) + 89.659 (derivatives) = 5,896.687 = CIQ Total Debt`

I hold the vendor figure and I am **not** using it in the bridge; the filing-built 5,807.0 is canonical (CLAUDE.md §4 — filings beat vendor exports). This is a 1.5% difference and changes nothing material, but the basis is stated so no downstream agent has to guess which number it inherited.

**`ciq_facts.json` reconciliation.** The sidecar reports `total_debt_m` = 5,896.7 (`present`) and `net_debt_m` = −9,274.2 (`present`, with its own warning that the basis "may net short-term/liquid investments"). Both are correctly read from the workbook; this agent's figures differ only by the two definitional choices named above (derivatives excluded from debt; short-term investments excluded from cash), and both are labelled. This is a definition gap, not a misread.

### Cash quality — what is netted, and what is deliberately not

**Netted (USD 13,551.6m).** The filing's own "Cash and cash equivalents" line, whose four components are all genuine IAS 7 equivalents with original maturities of three months or less [Q2 2026 Interim Report, Note 11]:

| Component | USD m | Comment |
|---|---:|---|
| Deposits at central banks | 7,741.9 | Held by the Brazilian, Colombian and Mexican subsidiaries. In Brazil remunerated at 100% of the CDI rate with **daily maturity** — liquid, not term-locked |
| Reverse repurchase agreements | 3,096.4 | Overnight, collateralised by Mexican and Colombian government bonds |
| Bank balances | 2,101.7 | |
| Short-term investments | 611.6 | Mainly USD, fixed-rate, averaging 3.6% |
| **Total** | **13,551.6** | |

**Deliberately NOT netted:**

| Excluded item | USD m | Why |
|---|---:|---|
| Compulsory and other deposits at central banks | 9,149.1 | **Restricted.** Regulatory reserve requirements; the filing classifies these inside financial assets at amortised cost, not cash [Interim, Note 15]. Capital IQ also holds them out of cash, labelling them "Restricted Cash". Netting these would flatter net cash by 68% |
| Securities at FVOCI | 14,046.8 | Long-tenor mark-to-market portfolio [Interim, Note 12] |
| Securities at amortised cost | 3,776.5 | [Interim, Note 12] |
| Securities at FVTPL | 1,358.0 | Mark-to-market through profit or loss [Interim, Note 12] |
| Derivatives (asset side) | 115.3 | [Interim, Note 20] |

**The vendor's cash definition is not adopted.** Capital IQ shows "Cash And Equivalents" of **10,455.2m** — USD 3,096.4m below the filing's own figure, exactly the reverse-repurchase-agreement leg, which the vendor reclassifies out of cash. It separately shows "Total Cash & ST Investments" of **15,170.8m**, i.e. USD 1,619.2m *above* the filing's cash line, by adding a slice of the securities book. Neither is used as "cash & equivalents" here: the filing's own USD 13,551.6m is (CLAUDE.md §5 — cite the source the number came from, and prefer the filing where it carries its own figure for the same line item).

**The real cash-quality caveat is location, not liquidity.** These balances are genuinely liquid, but they sit inside **regulated banking subsidiaries** — Nu Pagamentos and Nu Financeira in Brazil and their Mexican and Colombian equivalents — whose ability to upstream cash to the Cayman holding company is limited by local capital and regulatory rules. The 20-F says this plainly: the holding company "is a holding company with no material assets other than the ownership interests in our subsidiaries, and we are therefore dependent upon the results of operations of and, in turn, the payments, dividends and distributions from, our subsidiaries," and notes the risk of "legal restrictions on dividend distributions by our local [subsidiaries]" [FY2025 20-F, Item 3.D risk factors]. So the net cash in §5 is not free corporate cash available to a holder — it is a bank's working liquidity, most of which is required to run the bank.

### Adjustments deliberately NOT made

| Adjustment | Made? | Why |
|---|---|---|
| Operating lease liabilities capitalised separately | No — already included | Under IFRS 16 the USD 66.4m lease liability is already on the balance sheet and already inside total debt. No off-balance-sheet lease add-back exists |
| Underfunded pension / OPEB | No | No defined-benefit obligation disclosed; the CIQ `Pension OPEB` tab is empty of funded-status figures |
| Deposits (USD 45,328.4m) and payables to network (USD 15,541.7m) | **No** | These are a bank's operating funding, not debt. Excluding them is the standard convention **and is precisely why this EV figure is meaningless as a value for this issuer** |
| Deferred tax assets (USD 3,649.1m) | No | Not a claim on or a source of enterprise value; relevant to book value, not to the bridge |
| Provisions and contingent liabilities (USD 44.3m) | No | Immaterial at 0.06% of market cap [Interim, Note 25] |
| Non-controlling-interest reclassification | Flagged, not adjusted | NCI fell from USD 30.6m at Dec-31-2025 to **USD 2.1m** at Jun-30-2026, because the portion relating to investment-fund quotas (USD 26.4m) was reclassified into a liability line, "Obligations for quotas of investment funds" [Interim, statement of financial position and Note 2 accounting-policy paragraph]. This shrinks the NCI add-back in the bridge by USD 26.4m. At 0.04% of market cap it changes nothing, but the reason for the year-on-year drop is stated so nobody reads it as a disposal |

---

## 5. Net Debt & Leverage Snapshot

All figures as of Jun-30-2026, USD millions.

| Metric | Value | Source |
|---|---:|---|
| Total debt (canonical — §4 above) | 5,807.0 | Q2 2026 Interim Report, Notes 24 + 21 + lease liabilities |
| Cash & equivalents | 13,551.6 | Q2 2026 Interim Report, Note 11 |
| **Net debt (strict, §15: total debt − cash & equivalents)** | **(7,744.6) — i.e. NET CASH of USD 7,744.6m** | `5,807.0 − 13,551.6 = −7,744.6` |
| *Variant: strict basis on the debt-note-only debt figure* | *(8,869.4) — net cash USD 8,869.4m* | *`4,682.3 − 13,551.6 = −8,869.4`. Shown because "total debt" for a bank is definitionally contestable; the canonical figure above is the conservative (larger-debt) one* |
| − Liquid short-term investments (if netted) | not netted in the canonical figure | The securities portfolios are held out of cash (§4) |
| **Net debt (broad, incl. short-term investments — shown for reconciliation only, NOT canonical)** | **(9,274.2) — net cash USD 9,274.2m, BROAD BASIS** | CIQ `Balance Sheet` "Net Debt"; `ciq_facts.json` `net_debt_m` = −9,274.2. Build: CIQ total debt 5,896.7 − CIQ "Total Cash & ST Investments" 15,170.8 = −9,274.2 [CIQ `Capital Structure Summary`, Jun-30-2026 column] |
| Net debt / latest EBITDA | **Not applicable** | NU reports on Capital IQ's **Bank** template, which has no EBITDA line: `ciq_facts.json` `ltm_ebitda_m` = `unknown` ("Income Statement sheet has no 'EBITDA' row") and `net_debt_ebitda_x` = `unknown`. EBITDA is not a meaningful measure for a bank, where interest is revenue and cost of revenue, not a financing item |

**Basis discipline (CLAUDE.md §15).** The canonical figure carried into §7 is the **strict** basis: **net cash of USD 7,744.6m**. The vendor's −9,274.2 is a **broad** figure (it nets short-term investments on top of a wider debt definition) and is USD 1,529.6m more favourable. It is shown only so the two can be reconciled; it is **not** labelled strict, and no downstream agent should quote it as such. Where a downstream equity bridge needs a different definition it must say so in one line, per the Anchor consistency rule — silent substitution is not allowed.

**A net-cash figure is the wrong leverage read for this business — use these instead.** For a bank, net debt says almost nothing: the balance sheet is funded by USD 45.3bn of customer deposits and USD 15.5bn of payables to network, neither of which is "debt", and the asset side is a loan book, not plant. The measures that actually describe leverage here:

| Bank leverage metric | Value | Calculation / source |
|---|---:|---|
| Total equity / total assets | **16.0%** | `13,251.7 / 82,753.4` [Q2 2026 Interim, statement of financial position] |
| Tangible common equity / total assets | **14.6%** | `12,093.2 / 82,753.4` (tangible common equity built in §6) |
| Tier 1 capital ratio | **13.4%** | CIQ `Historical Capitalization`, Jun-30-2026 column (Tier 1 capital USD 4,785.8m) |
| Total capital ratio | **15.7%** | CIQ `Historical Capitalization`, Jun-30-2026 column (total capital USD 5,597.6m) |
| Gross loans / deposits | **88.8%** | `40,274.6 / 45,328.4` [CIQ `Balance Sheet` gross loans; Interim Note 22 deposits] |
| Net loans / deposits | **74.3%** | `33,661.7 / 45,328.4` |
| Total borrowings + repos / total funding (deposits + payables to network + borrowings + repos) | **8.7%** | `5,740.6 / 66,610.7` — wholesale borrowing is a small slice of how this bank is funded [Interim, Note 22/23/24/21] |
| Debt maturity profile | Nearest borrowings mature Jul-2026; financial bills run to Jun-2029; margin loan facility to Jun-2027. **No financial restrictive covenants**; Nu Holdings guarantees none of the borrowings | Q2 2026 Interim Report, Note 24 and its Covenants / Guarantees paragraphs |

These belong to the balance-sheet-survival module, which has not run its `01` in this run root; they are recorded here so the valuation module is not left with a meaningless net-cash figure as its only leverage read.

---

## 6. Per-Share Reference Values

Two columns are given because the two share counts serve different purposes (§2). **Downstream per-share fair values divide by the fully diluted count.**

| Metric | Per share — on shares outstanding (4,830.689m) | Per share — on fully diluted (4,878.395m) | Absolute (USD m) | Source |
|---|---:|---:|---:|---|
| Book value per share | **USD 2.74** | **USD 2.72** | Equity attributable to shareholders of the parent: 13,249.7 | Q2 2026 Interim Report, statement of financial position; matches CIQ `Balance Sheet` "Book Value/Share" 2.74 |
| Tangible book value per share | **USD 2.50** | **USD 2.48** | Tangible common equity: 12,093.2 | `13,249.7 − goodwill 409.4 − other intangibles 747.1 = 12,093.2` [Q2 2026 Interim Report, Note 19]; matches CIQ `Balance Sheet` "Tangible Book Value/Share" 2.50 and comps `Financial Data` "LTM Tangible Book Value/Share" 2.5 |
| Net cash per share (strict basis) | **USD 1.60** | **USD 1.59** | Net cash 7,744.6 | §5 above — but read the caution below |
| *Memo: total equity incl. NCI per share* | *USD 2.74* | *USD 2.72* | *13,251.7* | *NCI of 2.1 is immaterial* |

Arithmetic shown: `13,249.670 / 4,830.689 = 2.743`; `12,093.198 / 4,830.689 = 2.503`; `7,744.583 / 4,830.689 = 1.603`. On the fully diluted count: `13,249.670 / 4,878.395 = 2.716`; `12,093.198 / 4,878.395 = 2.479`; `7,744.583 / 4,878.395 = 1.588`.

**Caution on net cash per share.** The USD 1.60 figure must **not** be treated as spare cash backing the share price. As §4 sets out, this is a bank's working liquidity held inside regulated subsidiaries whose capacity to upstream it is legally constrained, and the same balance sheet carries USD 60.9bn of deposits and network payables against it. It is shown because the Report Structure requires it, and it is capped with this warning so no downstream agent nets it off a fair value.

**Book value is the base that matters here.** For a Financial issuer the Method Map points at P/E and P/tangible book. The tangible book anchor for this run is **USD 2.50 per share on the outstanding count / USD 2.48 fully diluted**, and the forward book-value path (FY2026E book value per share of 3.15, rising through the strip) is in the Estimates `Consensus` tab for `04` to use.

---

## 6A. Distribution Basis

| Field | Value | Source |
|---|---|---|
| Yield basis | **None — no dividend or distribution exists.** No trailing yield, no forward yield | CIQ `Ratios` and `Cash Flow`: dividend per share reported "NA" in every year FY2021–FY2025 and total dividends paid "–" across FY2021–LTM Jun-30-2026 |
| Amount per share and period covered | USD 0.00; no distribution has ever been declared | As above |
| Ex-date and record date of most recent distribution | None — no distribution has occurred | As above |
| Is the next distribution still available to a buyer today? | **N/A — there is none, and the company says one may not come.** "We may not pay any cash dividends in the foreseeable future… There is no assurance that future dividends will be paid" [FY2025 20-F, Item 3.D]. As a Cayman Islands company there is "no minimum mandatory dividend payable to our shareholders and no established periodicity" | FY2025 20-F, Item 3.D |
| Gross or net (withholding / depositary fee) | Not applicable on the decision line. NYSE:NU is an **ordinary share**, not an ADR, so no depositary fee applies. The BDR and CEDEAR lines would carry depositary fees and local tax treatment, but there is no distribution for them to be charged against | `… Equity Listings` (Security Type "Common Stock", Security Name "Class A Ordinary Shares") |
| Yield on the decision line at the decision-line price | **0.00%** | 0 / 14.30 |

**Any downstream agent quoting a dividend yield for NU is quoting a number that does not exist. The yield is zero.**

**The only cash return is the buyback, and here is its basis.** On 3 June 2026 the board approved a repurchase programme of **up to USD 1.0bn** of Class A ordinary shares, running from 4 June 2026 to 3 June 2027. Through 30 June 2026 the company repurchased **40,659,600 Class A shares for USD 500.4m** (an average of about USD 12.31 per share), leaving **USD 499.6m** available [Q2 2026 Interim Report, Note 31(e)(i)]. If any downstream agent quotes a buyback yield, the basis is: USD 500.4m executed over roughly four weeks against a market cap of USD 69,078.8m = **0.72% of market cap executed to date**, or **1.45% annualised if the full USD 1.0bn programme is completed within its twelve-month window** — the latter being a programme authorisation, not a commitment ("The program does not obligate the Company to acquire any specific number of shares"). Do not present the authorisation as a realised return.

---

## 7. Anchor Summary (canonical numbers for downstream agents)

Use these numbers verbatim. Where an agent must depart from one, it must say so in one line and give the reason (MODULE_RULES Reconciliation Gate 1).

| Anchor | Value | Basis / caveat |
|---|---|---|
| **Decision line** | NYSE:NU · New York Stock Exchange · USD (Class A Ordinary Shares) | All fair value, margin of safety, downside-to-bear and yield belong to this line only |
| **Current price (anchor)** | **USD 14.30**, 2026-08-28 close | Pool-verified, dated, corroborated across three CIQ exports |
| **Price-state** | **`pool-verified`** | Margin of safety, downside-to-bear, observed up/down and valuation attractiveness all **unlock**. The no-price Score-Cap row does **not** fire |
| **Staleness** | 5 exact trading sessions / 6.4 on the ×5/7 conversion | Straddles the ">5 trading days" line; the conservative read applies → **`99`: valuation confidence max 70**. Refresh attempted and documented |
| **Fresher indicative price** | **USD 15.37**, 2026-09-04 close — *web-sourced, not from data pool, unverified*, corroborated by two independent sources agreeing exactly | **+7.48%** above the anchor. `07`/`99` must show the price-relative reads at BOTH prices, leading with the fresher one (Price freshness — re-anchor, don't just cap) |
| **Currency** | **USD** (presentation currency). IFRS as issued by the IASB. Fiscal year ends 31 December | Subsidiary functional currencies are BRL, MXN and COP — every USD fair value carries FX translation risk not visible in the headline [FY2025 20-F, Note 2.a] |
| **Shares (market cap)** | **4,830,688,659** (4,830.7m) — total Class A 3,808,087,961 + Class B 1,022,600,698, Jun-30-2026 | Q2 2026 Interim Report, Note 31. **Both classes**; the Class A count alone understates market cap by 21.2% |
| **Shares (per-share fair value)** | **4,878,395 thousand** (4,878.4m) fully diluted | Outstanding + 44,667k options/RSUs on the treasury-stock method + 3,039k acquisition shares [Interim, Note 9]. No convertibles. Dilution is 0.99% |
| **Market cap** | **USD 69,078.8m** at USD 14.30 (USD 74,247.7m at USD 15.37) | Ties exactly to CIQ comps `Financial Data` |
| **Total debt (canonical)** | **USD 5,807.0m** | Built from the filing: Note 24 borrowings 4,682.3 + Note 21 repos 1,058.3 + leases 66.4 |
| **Net debt (canonical)** | **NET CASH of USD 7,744.6m — STRICT basis (total debt − cash & equivalents)** | `5,807.0 − 13,551.6`. **A net-cash figure is a weak leverage read for a bank** — use equity/assets 16.0%, tangible common equity/assets 14.6%, Tier 1 13.4%, total capital 15.7%, gross loans/deposits 88.8% |
| **Cash & equivalents** | **USD 13,551.6m** | The filing's own Note 11 figure — not the vendor's 10,455.2 and not the vendor's cash-plus-investments 15,170.8 |
| **Enterprise value** | **USD 61,243.3m at USD 14.30 — INFORMATIONAL ONLY, INVALID AS A VALUE** | Financial (bank): the Method Map bars EV multiples and the EV bridge as a value. The bridge omits USD 60.9bn of deposits and network payables |
| **Book value per share** | **USD 2.74** outstanding / **USD 2.72** fully diluted | Equity attributable to parent USD 13,249.7m, Jun-30-2026 |
| **Tangible book value per share** | **USD 2.50** outstanding / **USD 2.48** fully diluted | Tangible common equity USD 12,093.2m |
| **Distribution basis** | **None quoted — dividend yield is 0.00%.** Only cash return is a USD 1.0bn buyback authorisation (USD 500.4m executed to Jun-30-2026, USD 499.6m remaining) | No dividend has ever been paid and the 20-F says none may come |

**`balance-sheet-survival/01` did not run in this run root.** There is no inherited filing-based canonical net-debt figure. This agent therefore built total debt directly from the Q2 2026 interim filing's own notes.

**Vendor reconciliation, carried in the Anchor Summary so it travels with the number.** This agent also holds the Capital IQ aggregates and does **not** use them. (a) Vendor "Total Debt" of USD 5,896.7m exceeds the filing-built USD 5,807.0m by exactly USD 89.7m, which is derivative financial liabilities [Interim, Note 20] — hedging instruments, not borrowed money. (b) Vendor "Net Debt" of −USD 9,274.2m is a **broad** figure (it also nets USD 1,619.2m of short-term investments into cash) and is USD 1,529.6m more favourable than the strict figure above; it must never be quoted as "strict". (c) Vendor "Cash And Equivalents" of USD 10,455.2m is USD 3,096.4m *below* the filing's own cash line because the vendor reclassifies reverse repurchase agreements out of cash. The filing wins on all three (CLAUDE.md §4).

### Anchor Block (copy-forward)

- **Decision line:** NYSE:NU · New York Stock Exchange · USD (Class A Ordinary Shares) — every downstream fair value, margin of safety, and yield is on THIS line
- **Other listed lines:** BOVESPA:ROXO34 (BRL, BDR 6:1, premium/discount not computable — no sourced FX in pool); BASE:NUD (USD CEDEAR 2:1, **+5.03%** vs decision line, same currency, same date 2026-08-28, no FX needed); BASE:NU (ARS CEDEAR 2:1, not computable); BVC:NUCO (COP, not computable); BMV:NU N (MXN, not computable); BIT:1NUH (EUR, not computable); DB:M1Z (EUR, not computable); MUN:M1Z (EUR, 2026-08-27, zero volume — stale mark). No sourced FX rate for 2026-08-28 exists in the data pool, so only the USD-denominated CEDEAR gap is measurable
- **Price:** USD 14.30 (2026-08-28 close, last close). Fresher indicative: USD 15.37 (2026-09-04 close, web-sourced, unverified, +7.48%)
- **Price-state:** **`pool-verified`** — margin of safety, downside-to-bear, observed up/down and valuation attractiveness all unlock. Stale by 5 exact trading sessions / 6.4 on the ×5/7 conversion → conservative read applies the staleness cap: **valuation confidence max 70**
- **Currency:** USD (IFRS as issued by the IASB; FY ends 31 December; subsidiary functional currencies BRL / MXN / COP)
- **Distribution basis:** **none quoted** — dividend per share USD 0.00, no distribution ever declared, no ex-date or record date, still available to a buyer today: N/A (none exists), gross = net = zero. Decision-line dividend yield **0.00%**. Buyback: USD 1.0bn authorisation to 2027-06-03, USD 500.4m executed to 2026-06-30
- **Shares (market cap):** 4,830,688,659 [Q2 2026 Interim Report, Note 31 — Class A 3,808,087,961 + Class B 1,022,600,698]
- **Shares (per-share fair value):** 4,878,395 thousand fully diluted [Interim Note 9 treasury-stock method increment applied to the Jun-30-2026 outstanding count; no convertibles; 14,675 thousand antidilutive instruments excluded]
- **Market cap:** USD 69,078.8m at USD 14.30 (USD 74,247.7m at USD 15.37)
- **Net debt:** **NET CASH USD 7,744.6m — STRICT basis** (total debt USD 5,807.0m − cash & equivalents USD 13,551.6m), both built from the Q2 2026 interim filing's own notes. `balance-sheet-survival/01` did **not** run, so no canonical cross-module figure existed to inherit. Reconciled against the CIQ vendor figure of −USD 9,274.2m (**broad** basis): they do **not** agree, and the USD 1,529.6m gap is explained in full (derivatives added to debt; short-term investments netted into cash). Caution: net cash is a weak leverage measure for a bank — use equity/assets 16.0%, tangible common equity/assets 14.6%, Tier 1 13.4%, total capital 15.7%
- **EV:** USD 61,243.3m at USD 14.30 — **informational only; invalid as a value for a Financial (bank)**. No EV-based multiple may be built on it
- **Key caveats:** (1) price stale by 5–6 trading days with a corroborated +7.48% drift to USD 15.37 — present price-relative reads at both prices; (2) EV and net debt are informational for a bank — value equity directly on book, tangible book and earnings; (3) both share classes count for market cap, Class A alone understates it by 21.2%; (4) net cash sits inside regulated subsidiaries and is not free corporate cash; (5) the undated CIQ price of USD 14.88 and the CIQ net debt of −USD 9,274.2m are both rejected here with reasons — do not re-import them; (6) the CIQ ROXO34 target of 3.56 carries a currency-unit defect and is unusable
