# Price & Capital Structure — TTWO

**Company:** Take-Two Interactive Software, Inc. (NasdaqGS:TTWO) · **Run date:** 2026-11-20
**Reporting standard:** US GAAP · **Reporting currency:** USD, in millions unless stated · **Fiscal year ends 31 March** (so "FY2026" = year ended 2026-03-31; the latest balance sheet is the quarter ended **2026-09-30**, which is Q2 of FY2027). Jurisdiction: US SEC domestic filer — Form 10-K, Form 10-Q, DEF 14A are the actual local documents [`FY26 10-K, cover page`; `Q2 FY27 10-Q, cover page`].

**Source-check status carried forward: UNCHECKED, not verified clean.** This frozen generation carries **no `numeric_reading_check`** object at any source or sheet level, and `GENERATION_ROOT/corpus.txt` carries no labelled extractor reading-warning annotation. There is therefore no literal warning token, no source/extract reference and no LF-line/column span to quarantine, and **no amount below is marked not-proven on that basis** — but a missing check means **unchecked, not clean**, so every workbook-cell figure is mechanically unverified by the pattern check. The duty that transfers: **every anchor number in this report was read directly from the frozen extract of the document that reports it.** Filing figures come from `10Q_2Q_0001628280-26-072254` (Q2 FY27 10-Q), `10K_2025_26_0001628280-26-037434` (FY26 10-K) and `TTWO 2Q27 Earnings Release FINAL` (2026-11-09); Capital IQ workbook tabs are used only as a vendor read to reconcile against, never as the authority for a filing's own number (CLAUDE.md §5). Every restating layer must carry this qualifier forward.

**Cross-module inputs used.** `balance-sheet-survival/01_capital-structure-and-leverage.md` (present in this run root) supplies the **canonical, filing-debt-note-based** gross-debt and net-debt figures adopted below. `earnings/01_historical-financials.md` (present) is used as an independent cross-check on net debt and share count. `00_valuation-data-triage.md` supplies the inventory, the jurisdiction read and the active caps.

---

## 1. Current Price

| Field | Value | Source | As-of Date |
|---|---|---|---|
| **Decision line** (ticker · venue · currency) | **NasdaqGS:TTWO · NASDAQ Global Select Market · USD** — Common Stock, $0.01 par value | `FY26 10-K, cover page`, "Securities registered pursuant to Section 12(b)": Common Stock $0.01 par / trading symbol TTWO / NASDAQ Global Select Market; "Securities registered pursuant to Section 12(g): None" | 2026-03-31 (registration), unchanged at `Q2 FY27 10-Q, cover page` |
| Current price | **USD 216.61** | `Capital IQ Comps → Financial Data`, subject row, "Day Close Price Latest"; pinned by `ciq_facts.json → current_price` = 216.61 | **2026-11-19** (export "As-Of Date: 2026-11-19") |
| Currency | **USD** | `Capital IQ Comps → Financial Data`, "Currency: US Dollar"; `ciq_facts.json → currency` = USD | 2026-11-19 |
| Price basis | **Last close** ("Day Close Price Latest"), not an intraday or indicative quote | `Capital IQ Comps → Financial Data` | 2026-11-19 |

**Single listed line — no cross-line issue.** The 10-K cover page registers exactly one class of security under Section 12(b) (Common Stock, $0.01 par, symbol TTWO, NASDAQ Global Select Market) and states "Securities registered pursuant to Section 12(g) of the Act: None" [`FY26 10-K, cover page`; identical at `FY25 10-K, cover page` and `Q2 FY27 10-Q, cover page`]. No second share class, no dual listing, no ADR or GDR line appears anywhere in this pool. So there is no premium/discount table to build, no FX date or rate to carry, and no ADR ratio to apply: every fair value, margin of safety and downside figure produced downstream belongs to **NasdaqGS:TTWO in USD**, the line a reader can actually buy.

**Second, independent pool read of the same price — they agree to 0.01%.** `Capital IQ Financials_Quarterly → Multiples` carries a separate current column dated **2026-11-18** with P/BV close of **11.038053**. Book value per share at 2026-09-30 is 3,673.6 ÷ 187.213488 = **19.6225**, so that column implies a price of 11.038053 × 19.6225 = **USD 216.59** — against the comps export's 216.61, a gap of 2 cents (0.01%). Two different workbooks in the pool therefore pin the same close. This also tells us what the "as-of 2026-11-19" label means in practice: it is the last close on or about **2026-11-18/19**, pulled on 2026-11-19.

**Price staleness — quantitative.** Age = run date 2026-11-20 − quote as-of 2026-11-19 = **1 calendar day ≈ 1 trading day**. That is well inside the 5-trading-day line, so the **staleness Score-Cap does not bind** and no refresh is required. Refresh attempt, stated for the record: the pool was checked for a fresher quote — the latest price-bearing columns in the pool are the comps export (2026-11-19) and the multiples current column (2026-11-18), and the short-interest export runs to 2026-11-19; **there is no fresher pool or user-provided quote**, and a web quote is neither needed nor permitted here because a pool source covers the same fact (MODULE_RULES Source Hierarchy, special rule for current price).

**One drift risk downstream must carry, which is not a staleness cap.** The anchor's as-of date (2026-11-19) is **the Grand Theft Auto VI release date itself** — "Rockstar Games will release Grand Theft Auto VI on November 19, 2026" [`Q2 FY27 10-Q, Item 1A Risk Factors` and `Item 2 MD&A`]. The paired multiples column is dated 2026-11-18, the day before. So the anchor is an at-or-just-before-launch close and contains **no post-launch trading**. For a company whose own filings say "Grand Theft Auto product releases may affect our financial performance on a quarterly and annual basis" [same source], that is a real reason the live price may have moved since. It is recorded as a dated-evidence limitation, not a reason to downgrade the price-state: the price **is** from the pool, it **is** one trading day old, and it stays `pool-verified`.

---

## 2. Share Count

| Field | Value | Source |
|---|---:|---|
| Basic shares outstanding (as-of 2026-10-26) | **187,213,488** (187.2m) | `Q2 FY27 10-Q, cover page`: "As of October 26, 2026, there were 187,213,488 shares of the Registrant's Common Stock outstanding, net of treasury stock" |
| Shares issued / treasury / outstanding at 2026-09-30 | 210.9 issued − 23.7 treasury = **187.2 outstanding** | `Q2 FY27 10-Q, Condensed Consolidated Balance Sheets` (common stock line and treasury-stock line) |
| Diluted weighted-average shares, Q2 FY27 (3 months to 2026-09-30) | **187.1** — basic *and* diluted are the same line, because the period is a net loss | `Q2 FY27 10-Q, Note 11 (Loss per Share)`: "Weighted average shares outstanding—basic 187.1 … Basic and diluted loss per share $(0.29)" |
| Diluted weighted-average shares, H1 FY27 (6 months to 2026-09-30) | **186.7** (same basic = diluted reason) | `Q2 FY27 10-Q, Note 11 (Loss per Share)` |
| Diluted weighted-average shares, FY2026 | **183.9** (basic = diluted; net loss year) | `FY26 10-K, Note 12 (Loss per Share)` |
| Options / RSU **dilutive increment** excluded as antidilutive, H1 FY27 | **1.1** from share-based awards | `Q2 FY27 10-Q, Note 11`: "For the six months ended September 30, 2026, we had 1.1 potentially dilutive shares from share-based awards … excluded due to the net loss for the period" (0.8 for the three months) |
| Convertibles / potential shares, H1 FY27 | **0.1** from the 2026 Convertible Notes | `Q2 FY27 10-Q, Note 11`, same sentence |
| **Unvested RSUs outstanding (the full overhang, not the dilutive increment)** | **8.1 at 2026-03-31** = 2.9 time-based + 1.1 market-based + 4.1 performance-based. Roll-forward to 2026-09-30: 8.1 + 1.9 granted − 1.6 vested − 0.2 forfeited = **8.2 (engine-computed)** | `FY26 10-K, Note 16 (Stock-Based Compensation)` — three separate non-vested RSU activity tables, each captioned "presented at 100% of target number of shares that may potentially vest"; H1 FY27 activity from `Q2 FY27 10-Q, Note 11` |
| Stock options outstanding | **None.** The phrase "stock options outstanding" appears zero times in this pool; the equity plans grant restricted stock units, not options (Black-Scholes is used only for ESPP purchase rights) | Direct read of `FY26 10-K, Note 16 (Stock-Based Compensation)`; corpus string count = 0 |
| ESPP capacity (authorised, not outstanding) | 9.0 shares may be issued under the 2017 Global ESPP; **~7.2 remained available** at 2026-03-31 | `FY26 10-K, Note 16 — Employee Stock Purchase Plans` |
| **Fully diluted shares — company-disclosed** | **188.0** | `TTWO 2Q27 Earnings Release FINAL, 2026-11-09`: "Share count used to calculate management reporting diluted net income per share is 188.0 million" |
| **Fully diluted shares — engine TSM / if-converted build (cross-check)** | **188.4** = 187.213488 cover-page + 1.1 share-based-award increment + 0.1 convertible | My arithmetic from the two filing sources in the rows above |
| **Share count used for market cap** | **187.213488** (187.2m) | `Q2 FY27 10-Q, cover page`, as-of 2026-10-26 — the most recent point-in-time "as of" count, per Fully Diluted Equity Rule 1. Independently confirmed by `CIQ Financials_Quarterly → Historical Capitalization`, "Shares Out." = 187.213488 at pricing date 2026-11-09, and by `ciq_facts.json → shares_outstanding_m` = 187.2 |
| **Share count used for per-share fair value** | **188.0** | The company's **own disclosed diluted count** for its management-reporting diluted EPS [`TTWO 2Q27 Earnings Release, 2026-11-09`]. Chosen over the engine's 188.4 build because it is disclosed rather than derived, and it is struck on a **profitable** earnings basis — which is the basis every forward per-share fair value downstream will use. The two differ by 0.4 shares (0.2%) |

### Share Count Reconciliation Table

| Step | Shares (m) | Basis |
|---|---:|---|
| Basic shares outstanding, net of treasury (2026-10-26) | 187.2 | `Q2 FY27 10-Q, cover page` |
| + Options/RSU dilutive increment (treasury-stock method, as computed by the company) | +1.1 | `Q2 FY27 10-Q, Note 11` (H1 FY27, excluded only because the period was a loss) |
| + Convertible notes, if-converted | +0.1 | `Q2 FY27 10-Q, Note 11` |
| **= Fully diluted shares (engine build)** | **188.4** | My arithmetic |
| *= Fully diluted shares (company-disclosed; CANONICAL for per-share fair value)* | **188.0** | `TTWO 2Q27 Earnings Release, 2026-11-09` |
| *Memo — maximum RSU overhang if every unvested unit vested in full* | *195.4* (187.2 + 8.2 + 0.1) | Not a diluted count; an outer bound (see below) |

**Three things about the share count that must travel downstream.**

1. **Basic equals diluted in every reported trailing period, and that is a loss artefact, not an absence of dilution.** "We incurred a net loss … therefore, the diluted weighted average shares outstanding excludes the effect of unvested common stock equivalents because their effect would be antidilutive" [`Q2 FY27 10-Q, Note 11`; identically at `FY26 10-K, Note 12`]. The moment the company prints a profit — which its own FY2027 guidance of GAAP diluted EPS $0.57–0.75 contemplates [`TTWO 2Q27 Earnings Release, Outlook for Fiscal Year 2027`] — the 1.1 + 0.1 comes back in. Using the trailing "diluted" count as if it were a fully diluted count would understate shares.
2. **The gap between the dilutive increment (1.1) and the total unvested RSU overhang (8.2) is large and is explained, not hidden.** Only time-based unvested units feed the treasury-stock increment; market-based units (1.1 at 2026-03-31, vesting on relative total shareholder return against the NASDAQ 100) and performance-based units (4.1 at 2026-03-31, tied to performance metrics on certain titles) are contingently issuable and stay out of the diluted count until their conditions are met [`FY26 10-K, Note 16`]. If every unvested unit ultimately vested, the count would be ~195.4m — **4.4% above** the 187.2m used for market cap. That is an outer bound on future dilution, **not** a share count to value on; it is recorded so a reader can size the overhang.
3. **A labelled basis difference in the vendor exports.** `CIQ Financials_Quarterly → Multiples`, `CIQ Financials_Annual → Multiples`, `CIQ Financials → Historical Capitalization` and `CIQ Estimates → Multiples` all carry the header line **"Dilution: Basic"**. So every vendor multiple and every vendor forward EPS in this pool — including NTM EPS of 9.61 [`Capital IQ Comps → Financial Data`] — is struck on a **basic** share count, while per-share fair value here is struck on **188.0 fully diluted**. The two are not interchangeable; the difference is 0.4% on the per-share figure and downstream agents must state which basis they are on.

---

## 3. Market Capitalization

`Market cap = share count × current price`

> 187,213,488 shares × USD 216.61 = **USD 40,552,313,636** = **USD 40,552.3m**

Both inputs are sourced and dated: the count from `Q2 FY27 10-Q, cover page` (as-of 2026-10-26), the price from `Capital IQ Comps → Financial Data` (as-of 2026-11-19).

**Tie-out:** `Capital IQ Comps → Financial Data` independently reports "Market Capitalization Latest" for the subject row as **40,552.3** — my arithmetic reproduces the vendor's figure to the decimal, which confirms the vendor is using the same 187.213488 count and the same 216.61 price. No plug, no residual.

For reference, on the **fully diluted 188.0** count the equity value at the same price is 188.0 × 216.61 = **40,722.7m** (+0.4%). Market cap stays on the point-in-time count (40,552.3m) per Fully Diluted Equity Rule 1; the 40,722.7m figure is shown only so a reader can see the size of the dilution step.

---

## 4. Enterprise Value Bridge

All balance-sheet components as of **2026-09-30**, USD millions.

| Component | Amount | Source |
|---|---:|---|
| Market capitalization | **40,552.3** | §3 above: 187.213488 × 216.61 |
| + Total debt (short + long term) — **canonical, filing debt note, carrying value** | **+2,519.8** | 629.2 short-term debt, net + 1,890.6 long-term debt, net [`Q2 FY27 10-Q, Condensed Consolidated Balance Sheets`]; composition from `Q2 FY27 10-Q, Note 10 (Debt)`. Adopted verbatim from `balance-sheet-survival/01`, §7 Leverage Anchor Summary |
| + Minority / non-controlling interest | **+0.0 (nil)** | No non-controlling interest line exists on the balance sheet; `CIQ Financials_Quarterly → Historical Capitalization` prints "+ Total Minority Interest" as "–" for every quarter including the latest; `Capital IQ Comps → Financial Data` prints "LTM Minority Interest" as "–" for the subject row |
| + Preferred equity | **+0.0 (nil)** | "Preferred stock, $0.01 par value, 5.0 shares authorized; **no shares issued and outstanding** at September 30, 2026 and March 31, 2026" [`Q2 FY27 10-Q, Condensed Consolidated Balance Sheets`]; vendor agrees ("+ Pref. Equity" = "–") |
| + Operating lease liabilities | **not added (+0.0)** — see note below | 391.6 at 2026-09-30 (66.9 current + 324.7 non-current) [`Q2 FY27 10-Q, Condensed Consolidated Balance Sheets`] |
| + Underfunded pension / other long-term obligations | **not added (+0.0)** — see note below | `FY26 10-K, Note 14 — Employee Savings Plans`; `CIQ Financials_Annual/_Quarterly → Pension OPEB` (header-only, no defined-benefit rows) |
| − Cash & equivalents | **−1,149.4** | `Q2 FY27 10-Q, Condensed Consolidated Balance Sheets` |
| − Short-term investments | **not deducted (−0.0)** — see cash-quality note | 524.2 at 2026-09-30 [`Q2 FY27 10-Q, Note 5 (Short-Term Investments)`] |
| − Restricted cash | **not deducted (−0.0)**, and must stay out | 15.0 current + 68.0 long-term = 83.0 [`Q2 FY27 10-Q, Condensed Consolidated Balance Sheets`] |
| − Equity-method investments | **not deducted (−0.0)** | **None disclosed.** No equity-method investment line or note appears anywhere in the FY26 10-K or the Q2 FY27 10-Q; `CIQ Financials_Quarterly → Historical Capitalization` also prints "− Long Term Marketable Securities" as "–" for every quarter |
| **= Enterprise value (EV) — CANONICAL** | **= 41,922.7** | 40,552.3 + 2,519.8 + 0 + 0 − 1,149.4 = **41,922.7**. No plug, no estimated component |

### The three EV variants, each labelled — and the reconciliation to the vendor's figure

| EV basis | Value | Build |
|---|---:|---|
| **EV (canonical) — §15 strict cash, borrowings-only debt** | **41,922.7** | 40,552.3 + 2,519.8 − 1,149.4 |
| EV (broad cash) — also nets the 524.2 of liquid short-term investments | 41,398.5 | 41,922.7 − 524.2 |
| EV (lease-inclusive debt, strict cash) — the IFRS-16-equivalent debt view | 42,314.3 | 40,552.3 + 2,911.4 − 1,149.4 |
| *EV (vendor) — Capital IQ "Total Enterprise Value Latest"* | *41,790.1* | 40,552.3 + vendor net debt 1,237.8 [`Capital IQ Comps → Financial Data`, subject row, As-Of 2026-11-19] |

**The vendor EV reconciles to the canonical EV exactly, with no residual:**

> canonical 41,922.7 − short-term investments 524.2 + operating-lease liabilities 391.6 = **41,790.1** ✔

So the vendor's EV is **broad on the cash side AND lease-inclusive on the debt side** — two departures from §15 in one number. The vendor's own build confirms it: `CIQ Financials_Quarterly → Historical Capitalization` prints the latest TEV as market cap − "Cash & Short Term Investments" 1,673.6 + "Total Debt" 2,911.4. The CIQ figure is **named and shown, never silently preferred**, and it is **not** the canonical figure here.

**Canonical debt source (CLAUDE.md §4, §15; MODULE_RULES Reconciliation Gate 1).** `balance-sheet-survival/01_capital-structure-and-leverage.md` ran in this run root and designated **gross debt 2,519.8 (borrowings only, balance-sheet carrying value)** built directly from `Q2 FY27 10-Q, Note 10 (Debt)` and tied line-for-line to the balance sheet (629.2 + 1,890.6 = 2,519.8, no residual). That is the figure used above. The data-vendor aggregate this agent also holds — `ciq_facts.json → total_debt_m` = **2,911.4** [`CIQ Financials → Balance Sheet` 'Total Debt', FQ2 Sep-30-2026] — is **390–392 higher, and the gap is entirely operating-lease liabilities the company's own debt note does not classify as debt**: 2,519.8 + 391.6 = 2,911.4 exactly. Under US GAAP those leases sit on separate "Lease liabilities" lines and are outside both the debt line and the borrowings-maturity table [`Q2 FY27 10-Q, Condensed Consolidated Balance Sheets`; `FY26 10-K, Note 13 (Leases)`]. The vendor figure is retained above only as a labelled cross-check and as the lease-inclusive variant.

**Adjustments deliberately NOT made, and why.**
- **Operating leases (391.6) not added to the canonical bridge.** This is a US-GAAP issuer, so leases are not borrowings in the filing's own debt note, and the company has **no finance or capital leases at all** — the phrase "finance lease" appears zero times in the FY26 10-K [direct read, confirmed in `balance-sheet-survival/01` §1]. The lease-inclusive EV (42,314.3) is published above so an agent that wants the IFRS-16-equivalent view can use it with its label. Lease terms, for context: weighted-average remaining term 7.14 years, weighted-average discount rate 4.74% [`FY26 10-K, Note 13 (Leases)`].
- **Pension underfunding not added.** No funded status, projected benefit obligation or plan assets are presented anywhere in the filing; the disclosure is a US 401(k) defined-contribution plan plus "various pension plans for our non-U.S. employees, some of which are required by local laws", with employer contributions across all plans of 55.1 in FY2026 [`FY26 10-K, Note 14 — Employee Savings Plans`]. Both vendor Pension-OPEB tabs are header-only. Honest qualifier: a small defined-benefit element **cannot be ruled out** from this pool — it is **not disclosed**, not proven absent. Nothing is added, and nothing is assumed away.
- **Non-current software development royalties (72.1) not added.** A trade-type obligation, not interest-bearing debt [`Q2 FY27 10-Q, Condensed Consolidated Balance Sheets`]. Named so a reader can see it was considered.
- **Contingent claims / minimum contractual commitments not added.** FY26 minimum contractual commitments total 740.1 [`FY26 10-K, Note 14`]; these are off-balance-sheet commitments adjudicated in `balance-sheet-survival/05`, not EV bridge items.
- **The undrawn revolver is not an EV item.** 997.9 available of a 1,000.0 committed unsecured facility, nil drawn, $2.1 of letters of credit, maturing 2030-05-19 [`Q2 FY27 10-Q, Note 10 (Debt) — Credit Agreement`]. Undrawn capacity is liquidity, not debt.

**Cash quality — only real operating cash is netted, and the test is shown rather than assumed.** Three items were examined before anything was netted:

| Item | Amount | Netted in canonical EV? | Reason |
|---|---:|---|---|
| Cash & cash equivalents | 1,149.4 | **Yes** | Operating cash and genuine equivalents, unrestricted [`Q2 FY27 10-Q, Balance Sheets`] |
| Short-term investments | 524.2 | **No** (shown as the broad variant) | They **pass** a quality test — "primarily consisted of **bank time deposits with maturities greater than 90 days**", carried at **amortized cost with zero unrealized gain or loss**, unrestricted, and not a financial-subsidiary portfolio [`Q2 FY27 10-Q, Note 5 (Short-Term Investments)` and `Item 2 MD&A`]. They are **not** long-tenor mark-to-market securities. They are excluded anyway because **§15 strict is the default and `balance-sheet-survival/01` designated the strict figure canonical** (Reconciliation Gate 1) — and because the company itself classifies them outside cash equivalents. The broad EV of 41,398.5 is a legitimate alternative read, published with its label |
| Restricted cash | 83.0 (15.0 + 68.0) | **No, and it must stay out** | "primarily related to **dedicated accounts limited to the payment of certain internal royalty obligations**" [`FY26 10-K, Note 1 — Cash and Cash Equivalents`]. Netting it would understate EV and flatter net debt |

One concentration to carry, not a netting adjustment: **945.0 of the 1,149.4 of cash & equivalents (82.2%) is held outside the United States by foreign subsidiaries.** The company describes it as "dispersed across various locations around the world… such dispersion meets the business and liquidity needs of our foreign affiliates", and discloses **no** repatriation restriction, dividend blocker or regulatory block [`Q2 FY27 10-Q, Item 2 MD&A — Financial Condition`]. It is netted in full because no legal barrier is disclosed; inventing a haircut would be inference presented as fact. What is **not** disclosed is how much of the 945.0 could move to the US, in what time, at what tax cost — recorded as "Not disclosed in the data pool".

---

## 5. Net Debt & Leverage Snapshot

As of **2026-09-30**, USD millions.

| Metric | Value | Source |
|---|---:|---|
| Total debt (canonical — §4 above) | **2,519.8** | 629.2 + 1,890.6 [`Q2 FY27 10-Q, Condensed Consolidated Balance Sheets`; composition `Note 10 (Debt)`]. Face value 2,529.8 [`Q2 FY27 10-Q, Note 10` maturities table]. Adopted from `balance-sheet-survival/01` §7 |
| Cash & equivalents | **1,149.4** | `Q2 FY27 10-Q, Condensed Consolidated Balance Sheets` |
| **Net debt (strict, §15: total debt − cash & equivalents) — CANONICAL** | **1,370.4** | 2,519.8 − 1,149.4. Designated canonical by `balance-sheet-survival/01` §7; reached independently by `earnings/01` §2 (same 1,370.4) |
| − Liquid short-term investments (if netted) | (524.2) | `Q2 FY27 10-Q, Note 5 (Short-Term Investments)` — bank time deposits >90 days, amortized cost |
| **Net debt (broad, incl. investments — shown, not canonical)** | **846.2** | 1,370.4 − 524.2. **Never present this as bare "net debt"** |
| *Net debt (vendor basis — broad on cash AND lease-inclusive on debt)* | *1,237.8* | `ciq_facts.json → net_debt_m` [`CIQ Financials → Balance Sheet` 'Net Debt', FQ2 Sep-30-2026]. Reconciles exactly: 1,370.4 − 524.2 + 391.6 = 1,237.8 ✔ |
| Net debt / latest EBITDA — **reported (GAAP)** | **Not meaningful** | There is **no GAAP EBITDA**: the LTM GAAP operating result is a **loss of (180.8)** [`balance-sheet-survival/01` §5a bridge from `FY26 10-K` and `Q2 FY27 10-Q` statements of operations]. A negative denominator produces no usable ratio |
| Net debt / latest EBITDA — **adjusted, company-defined LTM EBITDA 677.6** | **2.02x** | 1,370.4 ÷ 677.6. EBITDA base from `balance-sheet-survival/01` §5a (company's own published non-GAAP definition; the FY2026 component is an engine-computed build from `FY26 10-K` lines because the company publishes no FY2026 full-year EBITDA in this pool) |
| Net debt / latest EBITDA — **adjusted, vendor LTM EBITDA 724.9** | **1.89x** | 1,370.4 ÷ 724.9 [`ciq_facts.json → ltm_ebitda_m`, `CIQ Financials → Income Statement` LTM Sep-30-2026] |
| Net debt / **mid-cycle** EBITDA 565.3 (five-year average FY2022–FY2026) | **2.42x** | 1,370.4 ÷ 565.3 [`balance-sheet-survival/01` §5a (C)] |
| Net debt / **company-guided FY2027** EBITDA 1,053 midpoint | **1.30x** | 1,370.4 ÷ 1,053. A **company forecast**, not a reported period [`TTWO 2Q27 Earnings Release, 2026-11-09, Outlook`] |

The **strict** row is the §15 default and the figure the Anchor Summary carries forward. The broad row is shown because the 524.2 of short-term investments genuinely exists and is genuinely liquid — but it is labelled broad everywhere it appears and is never called strict. Two caveats must travel with every multiple above: **(a) every one of them rests on a non-GAAP EBITDA**, because GAAP operating profit is negative on both the latest full year and the LTM; **(b) the latest LTM window sits *between* game launches and *before* the GTA VI release of 2026-11-19**, so for this business the peak lies ahead rather than behind — 1.30x is a guidance-built floor, 2.42x the own-five-year-average central estimate, 1.89–2.02x the latest realised reading.

---

## 6. Per-Share Reference Values

All on the **187.213488** share count (the market-cap count), at **2026-09-30** balance-sheet values.

| Metric | Per Share | Source |
|---|---:|---|
| Book value per share | **USD 19.62** | Total stockholders' equity 3,673.6 ÷ 187.213488 [`Q2 FY27 10-Q, Condensed Consolidated Balance Sheets`] |
| Tangible book value per share — excluding goodwill and other intangibles | **USD 6.78** | (3,673.6 − goodwill 1,060.2 − other intangibles, net 1,344.3) = 1,269.1 ÷ 187.213488 [`Q2 FY27 10-Q, Balance Sheets`] |
| Tangible book value per share — **also** excluding capitalised software development costs (the vendor's basis) | **USD (6.55)** — negative | (1,269.1 − software development costs and licenses, net of current portion 2,494.9) = (1,225.8) ÷ 187.213488 = **(6.55)** [`Q2 FY27 10-Q, Balance Sheets`]. **This reproduces `Capital IQ Comps → Financial Data` "LTM Tangible Book Value/Share" of (6.55) for the subject row exactly** — which identifies what the vendor is doing and removes an apparent conflict with the 6.78 figure above. Two definitions, both named |
| Net debt per share — **strict** basis | **USD 7.32** net debt | 1,370.4 ÷ 187.213488 |
| Net debt per share — **broad** basis (memo) | USD 4.52 net debt | 846.2 ÷ 187.213488 |
| Net cash per share | **None — the company is net debt on both bases** | Strict 1,370.4 and broad 846.2 are both positive net debt [§5] |

Why the two tangible-book definitions matter and neither is wrong: 2,494.9 of non-current **capitalised software development costs** — nearly 27% of total assets — is the balance sheet's largest single asset [`Q2 FY27 10-Q, Balance Sheets`]. Whether it is "tangible" is a definitional choice, and the vendor's choice (exclude it) flips tangible book per share from +6.78 to −6.55. Any downstream P/B or P/TBV work must say which of the two it is on.

---

## 6A. Distribution Basis

**Not applicable — no yield is quoted anywhere in this run, and none may be.** The company has **never paid a dividend and does not expect to**: "We have never declared or paid cash dividends. We currently anticipate that all future earnings will be retained to finance the growth of our business" [`FY26 10-K, Item 5 — Dividend Policy`; identically at `FY25 10-K, Item 5`]. There is therefore no trailing or forward distribution, no ex-date or record date, and no gross-vs-net withholding question. Shareholder return runs through buybacks only, and even that is currently dormant: the Board has authorised repurchases of up to 21.7 shares, of which **11.7 have been repurchased in the past and 10.0 remain available**, with **no shares repurchased** in Q1 or Q2 of FY27 [`Q2 FY27 10-Q, Item 2 MD&A` and `Item 5`]. Downstream agents must not quote a dividend yield of any kind for TTWO.

---

## 7. Anchor Summary (canonical numbers for downstream agents)

**Use these verbatim (MODULE_RULES Reconciliation Gate 1 — Anchor consistency). Carry every label with every number.** USD, millions, US GAAP; balance-sheet items as of **2026-09-30**; price as of **2026-11-19**.

| Anchor | Canonical value | Label that must travel with it |
|---|---:|---|
| **Current price** | **USD 216.61** | Last close, **as-of 2026-11-19**, **pool-verified** [`Capital IQ Comps → Financial Data` "Day Close Price Latest"; pinned by `ciq_facts.json → current_price`]. Corroborated independently inside the pool by `CIQ Financials_Quarterly → Multiples` (2026-11-18 column, P/BV 11.038053 × BVPS 19.6225 = 216.59 — a 0.01% gap). **1 trading day old; no staleness cap.** Drift note: this is an at-or-just-before-GTA-VI-launch close (release date 2026-11-19 per `Q2 FY27 10-Q`) and contains no post-launch trading |
| **Price-state** | **`pool-verified`** | The canonical tag `05`/`07`/`99` read. **All price-relative reads unlock**: margin of safety, downside-to-bear, observed up/down and valuation attractiveness are **assessable**; `05` (reverse-DCF) **can run**. The no-price Score-Cap row does **not** bind |
| **Currency** | **USD** | US GAAP; fiscal year ends 31 March; "FY2027" = Apr-2026→Mar-2027, **not** a calendar year. No FX conversion anywhere in this module — no cross-currency rate or date to carry |
| **Decision line** | **NasdaqGS:TTWO · NASDAQ Global Select Market · USD** | **Single listed line.** One class registered under §12(b); §12(g) "None"; no second class, no dual listing, no ADR/GDR in this pool [`FY26 10-K, cover page`] |
| **Shares (market cap)** | **187.213488** (187.2m) | Cover-page count net of treasury, **as-of 2026-10-26** [`Q2 FY27 10-Q, cover page`]. Confirmed by `CIQ Financials_Quarterly → Historical Capitalization` "Shares Out." 187.213488 and `ciq_facts.json → shares_outstanding_m` 187.2 |
| **Shares (per-share fair value)** | **188.0** | **Company-disclosed fully diluted count** for management-reporting diluted EPS [`TTWO 2Q27 Earnings Release, 2026-11-09`]. Engine TSM/if-converted build = 188.4 (187.2 + 1.1 awards + 0.1 convertible), a 0.2% difference. **Limitation:** trailing GAAP "diluted" = basic (187.1 / 186.7 / 183.9) only because every trailing period is a loss and the increments are antidilutive — not because dilution is absent. **Maximum RSU overhang bound: 195.4** if all 8.2 unvested units vested (+4.4%); that is a bound, not a valuation count |
| **Market cap** | **40,552.3** | 187.213488 × 216.61. Reproduces `Capital IQ Comps → Financial Data` "Market Capitalization Latest" = 40,552.3 to the decimal. On the 188.0 fully diluted count the equity value is 40,722.7 (+0.4%) |
| **Total debt** | **2,519.8** | **Borrowings only, balance-sheet carrying value**, from the **filing's own debt note** (629.2 + 1,890.6) [`Q2 FY27 10-Q, Balance Sheets` and `Note 10 (Debt)`]. Face value 2,529.8. **Operating leases (391.6) are NOT in this figure.** Lease-inclusive variant 2,911.4 |
| **Net debt** | **1,370.4** | **Strict §15 basis: total debt (carrying) − cash & equivalents only** (2,519.8 − 1,149.4). **Adopted verbatim from `balance-sheet-survival/01_capital-structure-and-leverage.md` §7**, which built it from the filing's debt note; `earnings/01` §2 reaches the same 1,370.4 independently. Broad basis (also netting the 524.2 of short-term investments) = **846.2** — show only with that label. Switching basis mid-module requires an explicit one-line reason |
| **Enterprise value (EV)** | **41,922.7** | 40,552.3 + 2,519.8 + 0 minority + 0 preferred − 1,149.4 cash. No plug. Variants, each labelled: broad-cash **41,398.5**; lease-inclusive-debt **42,314.3**; **vendor TEV 41,790.1** |
| Minority interest · Preferred equity | **Nil · Nil** | No non-controlling interest line on the balance sheet; preferred stock 5.0 shares authorised, **none issued or outstanding** [`Q2 FY27 10-Q, Balance Sheets`]; vendor prints both as "–" |
| Equity-method investments | **None disclosed** | No equity-method line or note in either filing; vendor "− Long Term Marketable Securities" = "–" |
| **Per-share references** | BVPS **19.62** · TBVPS **6.78** (excl. goodwill + intangibles) / **(6.55)** (also excl. capitalised software dev costs — the vendor basis) · net debt/share **7.32** strict (4.52 broad) | On 187.213488 shares, 2026-09-30 book values. The (6.55) reproduces the vendor's own TBV/share exactly — two definitions, both named |
| **Distribution basis** | **None quoted — no dividend ever paid, none expected** | `FY26 10-K, Item 5 — Dividend Policy`. **No dividend yield may be quoted for TTWO anywhere in this run.** Buyback: 21.7 authorised, 11.7 done, 10.0 remaining, **nil repurchased in H1 FY27** [`Q2 FY27 10-Q, Items 2 and 5`] |

### The vendor-versus-filing reconciliation, stated here so it travels with the number

`balance-sheet-survival/01` ran in this run root and its filing-based figure **is** the canonical net debt above. This agent also holds the Capital IQ aggregates, and they differ — named here, not buried in §4/§5:

- **Vendor total debt 2,911.4 vs canonical 2,519.8.** The entire 391.6 gap is **operating-lease liabilities** the company's own debt note does not classify as debt (2,519.8 + 391.6 = 2,911.4 exactly). Under US GAAP those leases sit on separate balance-sheet lines, outside the debt line and outside the borrowings-maturity table.
- **Vendor net debt 1,237.8 vs canonical 1,370.4.** Reconciles with no residual: **1,370.4 − 524.2 short-term investments + 391.6 leases = 1,237.8** ✔. The vendor figure is **broad on the cash side AND lease-inclusive on the debt side** — two departures from §15 in one number.
- **Vendor EV 41,790.1 vs canonical 41,922.7.** Same two differences: **41,922.7 − 524.2 + 391.6 = 41,790.1** ✔.

In all three cases the vendor and the filing **do not conflict — they are different definitions, and both are named.** The filing-based figures are canonical (CLAUDE.md §4: filings beat vendor exports); the vendor figures are retained as labelled cross-checks and must never be swapped in silently.

### Anchor Block (copy-forward)

- **Decision line:** NasdaqGS:TTWO · NASDAQ Global Select Market · USD — every downstream fair value, margin of safety, downside-to-bear and yield is on THIS line. **Single listed line** (one §12(b) class; §12(g) None).
- **Other listed lines:** `None`
- **Price:** USD 216.61 (as-of 2026-11-19, last close)
- **Price-state:** `pool-verified` — the canonical tag `05`/`07`/`99` read. 1 trading day old; no staleness cap; no no-price cap.
- **Currency:** USD (US GAAP; FY ends 31 March; no FX conversion in this module)
- **Distribution basis:** none quoted — **no dividend ever paid and none expected**; no amount, no ex-date, nothing available to a buyer; no withholding or depositary-fee question arises. Do not quote a yield for TTWO.
- **Shares (market cap):** 187,213,488 (`Q2 FY27 10-Q, cover page`, as-of 2026-10-26)
- **Shares (per-share fair value):** 188.0m (`TTWO 2Q27 Earnings Release, 2026-11-09` — company-disclosed diluted count). Limitation: trailing GAAP diluted = basic because every trailing period is a loss; maximum RSU overhang bound 195.4m (+4.4%).
- **Market cap:** USD 40,552.3m
- **Net debt:** USD 1,370.4m — **strict §15 basis** (total debt 2,519.8 − cash & equivalents 1,149.4). **Reconciled against `balance-sheet-survival/01`'s canonical filing-based figure: they agree exactly** (it is the same figure, adopted verbatim), and `earnings/01` reaches it independently. Broad basis 846.2 (label required). Vendor basis 1,237.8 (broad + lease-inclusive) reconciles exactly and is not interchangeable.
- **EV:** USD 41,922.7m (strict cash, borrowings-only debt). Variants: 41,398.5 broad-cash · 42,314.3 lease-inclusive-debt · 41,790.1 vendor.
- **Key caveats:** (1) **Source-check status UNCHECKED, not clean** — this generation carries no `numeric_reading_check`, so every workbook-cell figure is mechanically unverified; each anchor above was read directly from the frozen extract of the filing that reports it, and the vendor tabs were used only to reconcile. (2) **Vendor exports are on a "Dilution: Basic" basis** (`CIQ Multiples`, `Historical Capitalization`, `Estimates → Multiples`) while per-share fair value here is on 188.0 fully diluted — state the basis on every per-share figure. (3) **Every leverage multiple rests on a non-GAAP EBITDA**; GAAP operating profit is an LTM loss of (180.8), so net-debt/EBITDA on a reported basis is Not meaningful. (4) **The price anchor is an at-launch close** — GTA VI released 2026-11-19, the anchor's own as-of date — so it contains no post-launch trading. (5) **Tangible book per share has two live definitions** (+6.78 and −6.55); name which one is in use. (6) **Pension:** no defined-benefit funded status is disclosed anywhere in the pool, so nothing is added to the bridge — not disclosed, not proven absent. (7) **82.2% of cash & equivalents (945.0) sits offshore**, with no disclosed restriction; netted in full, flagged as a concentration.
