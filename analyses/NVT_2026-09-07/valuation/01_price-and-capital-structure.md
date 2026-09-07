# Price & Capital Structure — NVT

Evidence binding: frozen. `DATA_PATH` = `NOSTRA_FROZEN_EVIDENCE_ROOT` (cited logically as `data/NVT/`); every read resolved through the bound generation `6db32848…1aecd1e6`. No live `data/NVT/` or `_pool_extracts/` path was read.

Jurisdiction and regime (from `00_valuation-data-triage`, §1A): **US SEC filer** (Forms 10-K / 10-Q), **US GAAP**, reporting currency **USD in millions**, fiscal year ends **31 December**. The issuer is incorporated in Ireland with executive offices in London, but it files US forms and lists on the NYSE — US form names are correct here, no local-equivalent substitution needed (CLAUDE.md §27).

---

## 1. Current Price

| Field | Value | Source | As-of Date |
|---|---|---|---|
| **Decision line** (ticker · venue · currency) | **NVT · New York Stock Exchange · USD** — Ordinary Shares, nominal value $0.01 per share | `Q2 FY26 10-Q, cover page` ("Securities registered pursuant to Section 12(b): Ordinary Shares … NVT … New York Stock Exchange") | 30-Jun-2026 filing |
| Current price (**canonical anchor**) | **USD 171.16** | `Capital IQ Financials export → Key Stats, Current Capitalization` (Share Price 171.16); the same close ties exactly to `→ Multiples`, final column, TEV/LTM EBITDA Close 26.2436x and P/LTM EPS Close 47.5188x | **Close 2026-08-12** |
| Currency | USD | `Capital IQ Financials export → Key Stats` ("Currency: USD"); `Q2 FY26 10-Q` financial statements | — |
| Price basis (last close / intraday / indicative) | **Last close, pool-sourced, as-of date CONFIRMED by the export itself** | The `→ Multiples` tab's final column is headed `2026-08-12` and its Close values reproduce the Key Stats current-capitalization multiples to six decimals — so the workbook timestamps the quote; this is not a download date | 2026-08-12 |
| Refresh quote (**indicative, not the anchor**) | **USD 156.03** — corroborated by two independent web sources at the same figure (0.0% divergence) | `Web: stockanalysis.com quote page, retrieved 2026-09-07` ("Last close $156.03, as of September 4, 2026, 4:00 PM EDT"); corroborated by `Web: investing.com NVT page, retrieved 2026-09-07` ($156.03, "Closed 04/09") | Close **2026-09-04** |

**Single listed line — no cross-line issue.** nVent Electric plc has one class of ordinary shares registered under Section 12(b), trading as NVT on the NYSE in USD [`Q2 FY26 10-Q, cover page`]. There is no second share class, no dual A/H listing, no ADR and no GDR, so there is no ratio to apply, no FX conversion, and no cross-line premium/discount to reconcile. Every fair value, margin of safety, downside-to-bear and yield in this run is denominated in this line.

| Listed line | Ticker · venue | Currency | Price | As-of | Premium / (discount) vs decision line, same-currency | Notes for a holder of this line |
|---|---|---|---:|---|---:|---|
| Ordinary Shares $0.01 par (the decision line) | NVT · NYSE | USD | 171.16 | 2026-08-12 | — (is the decision line) | Only listed line |
| — | — | — | — | — | — | No other listed line exists |

### Price staleness (quantitative)

- Anchor as-of: **2026-08-12 close**. Run date: **2026-09-07**.
- Age = **26 calendar days**. In trading days: 26 × 5/7 ≈ **18.6**; counted directly (13 Aug through 4 Sep, with 7 Sep a US market holiday) = **17 trading days**. Either method exceeds the **15-trading-day** tier.
- **Refresh attempted, and here is the result.** No fresher price exists anywhere in the data pool — the pool holds exactly two price marks, both from Capital IQ, and both pre-date the run: `Financials → Key Stats / Multiples` at 171.16 (2026-08-12) and `Estimates → Consensus` "Latest Price/Last Close Price 170.70/171.16" (export dated to ~2026-08-07 by its own Recent-Changes tab). A web refresh returned **USD 156.03 as of the 2026-09-04 close**, confirmed at the identical figure by two independent sources. Per MODULE_RULES ("Price freshness — re-anchor, don't just cap", clause 1), an indicative web quote does **not** replace a pool quote as the anchor: **the pool price of 171.16 remains the `pool-verified` anchor**, and the fresh quote is carried alongside, labelled `Indicative price, web-sourced as of 2026-09-04 close, not from data pool — unverified`.
- **The drift is material and must not be buried.** 156.03 vs 171.16 is **−8.84%** — enough to move every margin-of-safety and downside-to-bear read by roughly nine percentage points. Per MODULE_RULES clause 2, **`07` and `99` must present the price-relative reads at BOTH prices, each labelled with its price and as-of date, and lead with the fresher read.** Both bridges are built in §3 and §4 below so no downstream agent has to re-derive them.
- **Cap handed forward:** stale `pool-verified` price, as-of known and > 15 trading days ⇒ **valuation confidence max 60** at `99`, and a mandatory inline staleness flag (stating the 2026-08-12 as-of date and the drift risk) on every price-relative read in `07` and `99` (MODULE_RULES → Score-Cap rules). This is the staleness cap, **not** the no-price cap: margin of safety and downside-to-bear remain assessable.
- **One sequencing fact downstream agents need.** The anchor (2026-08-12) and every consensus mark in this pool (to 2026-08-07) **pre-date** the Maverick Power acquisition announced **2026-08-24** ($1.75bn cash plus up to $550m earnout, close expected Q4 2026, funded from cash on hand and new debt) [`nVent news release, 2026-08-24`]. The indicative refresh quote (2026-09-04) **post-dates** it. Stating this is a data fact about what each price knew, not a valuation judgment.

**Vendor-export internal inconsistency (data-quality note, not a defect in the anchor).** The Estimates workbook carries three different price marks at once: "Latest Price" 170.70, "Last Close Price" 171.16, and a "Potential Upside/Diff. from Target Price" of 22.74% / 37.44 against a mean target of 202.13 — which back-solves to a price of **164.69** (202.13 − 37.44 = 164.69; 37.44 ÷ 164.69 = 22.73%), a price mark neither of the other two fields uses [`Capital IQ Estimates export → Consensus, Market Summary block`]. The Estimates workbook's fields were therefore refreshed at different moments. The Financials workbook's 171.16 is preferred as the anchor because its as-of date is explicitly carried in the Multiples tab's column header and its multiples reconcile to it exactly.

---

## 2. Share Count

| Field | Value | Source |
|---|---:|---|
| Basic shares outstanding (as-of 30-Jun-2026) | **161,857,939** (161.858m) | `Q2 FY26 10-Q, cover page` ("On June 30, 2026, 161,857,939 shares of the registrant's common stock were outstanding") |
| Basic shares outstanding — vendor cross-check | 161.857939m | `Capital IQ Financials export → Key Stats, Current Capitalization` (Shares Out.) — agrees to the share |
| Basic weighted-average shares (Q2 2026 / H1 2026) | 161.8m / 161.8m | `Q2 FY26 10-Q, Note 4 (Earnings Per Share)` |
| Diluted weighted-average shares (Q2 2026 / H1 2026) | **164.1m / 164.1m** | `Q2 FY26 10-Q, Note 4 (Earnings Per Share)` |
| Options/RSUs/PSUs — dilutive increment (company's own treasury-stock-method calculation) | **+2.3m** (Q2 2026; +2.3m H1 2026) | `Q2 FY26 10-Q, Note 4` ("Dilutive impact of stock options, restricted stock units and performance share units") |
| Anti-dilutive options excluded | 0.2m (Q2 2026) | `Q2 FY26 10-Q, Note 4` |
| Convertibles / potential shares | **None.** The debt note lists only a revolving credit facility, a term loan and three tranches of fixed-rate senior notes — no convertible instrument | `Q2 FY26 10-Q, Note 10 (Debt)` |
| **Fully diluted shares (TSM + if-converted)** | **164.2m** = 161.858m period-end basic outstanding + 2.3m company-computed TSM dilutive increment; no converts to add | derived from `Q2 FY26 10-Q, cover page` + `Note 4` |
| **Share count used for market cap** | **161.858m** (period-end shares outstanding) | MODULE_RULES → Fully Diluted Equity Rules 1: market cap uses the most recent "as of" outstanding count, not a period weighted-average |
| **Share count used for per-share fair value** | **164.2m** (fully diluted) | MODULE_RULES → Fully Diluted Equity Rules 2: options/RSUs/PSUs via the treasury stock method, using the company's own disclosed dilutive increment |

**Share Count Reconciliation Table**

| Step | Shares (m) | Source |
|---|---:|---|
| Basic shares outstanding, 30-Jun-2026 | 161.858 | `Q2 FY26 10-Q, cover page` |
| + Options / RSUs / PSUs (treasury stock method, company-computed) | 2.300 | `Q2 FY26 10-Q, Note 4` |
| + Convertibles (if-converted) | 0.000 | none exist — `Q2 FY26 10-Q, Note 10` |
| **= Fully diluted shares** | **164.158 ≈ 164.2** | derived |

**The basic-to-diluted gap is small: 2.3m shares, or 1.42% of the basic count.** It is not material enough to change a valuation verdict, but the per-share fair value must still divide by 164.2m, not 161.9m, or every per-share level is overstated by ~1.4%. The company's own diluted weighted-average (164.1m) sits 0.1m below the 164.2m fully diluted count because the weighted average is measured over a period while the outstanding count is a point in time; either is defensible and the difference is 0.06%. This report uses **164.2m** for per-share fair value and states it once so every downstream agent reuses it (MODULE_RULES → Reconciliation Gate 4).

**One forward-looking share-count fact, flagged not modelled.** On 2026-05-16 the Board authorised repurchases of up to **$500.0m** of ordinary shares; the authorisation began 2026-07-23 and expires 2029-07-22 [`Q2 FY26 10-Q, Note 12` block covering share repurchase]. LTM repurchases through 30-Jun-2026 were $58.0m [`Capital IQ Financials export → Cash Flow`, LTM Jun-30-2026]. No buyback beyond the balance-sheet date is reflected in any count above, and none is assumed.

---

## 3. Market Capitalization

`Market cap = shares outstanding × price`

**Canonical (pool-verified anchor, 2026-08-12 close):**

`161.857939m × USD 171.16 = USD 27,703.6m`

Tie-out: `Capital IQ Financials export → Key Stats` reports Market Capitalization **27,703.604839**. This report's arithmetic reproduces it exactly, so the vendor's read and this agent's read agree to the cent.

**At the indicative refresh price (web-sourced, 2026-09-04 close — labelled, not the anchor):**

`161.857939m × USD 156.03 = USD 25,254.7m`

Cross-check: the web source's own displayed market cap of $25.25bn matches this arithmetic, and its shares-outstanding figure of 161.86m matches the 10-Q cover page — corroboration that the web quote is on the same share base, not a different one [`Web: stockanalysis.com quote page, retrieved 2026-09-07`].

Difference between the two market caps: **−$2,448.9m (−8.84%)**.

---

## 4. Enterprise Value Bridge

`EV = market cap + total debt + minority interest + preferred equity − cash & equivalents − short-term investments`

**Canonical bridge — at the pool-verified anchor price of USD 171.16 (2026-08-12), balance sheet as of 30-Jun-2026, USD millions:**

| Component | Amount | Source |
|---|---:|---|
| Market capitalization | 27,703.6 | §3 above: 161.857939m × 171.16 [`Capital IQ Financials export → Key Stats`, close 2026-08-12] |
| + Total debt (short + long term) — **canonical, filing debt-note basis** | **1,492.4** | `Q2 FY26 10-Q, Note 10 (Debt)`, "Total debt 1,492.4" (carrying value net of $7.6m issuance costs/discounts on $1,500.0m principal). Ties to the balance sheet: current maturities and short-term borrowings 13.8 + long-term debt 1,478.6 = 1,492.4 [`Q2 FY26 10-Q, Condensed Consolidated Balance Sheets`]. Adopted from `balance-sheet-survival/01_capital-structure-and-leverage.md`, Leverage Anchor Summary |
| + Minority / non-controlling interest | **0.0** | `Q2 FY26 10-Q, Condensed Consolidated Balance Sheets` — the equity section is ordinary shares 1.6 + additional paid-in capital 2,035.4 + retained earnings 1,977.7 + accumulated other comprehensive loss (27.8) = total equity 3,986.9, with **no** non-controlling-interest line; corroborated by `Capital IQ Financials export → Key Stats` ("Total Minority Interest –") |
| + Preferred equity | **0.0** | `Q2 FY26 10-Q, Condensed Consolidated Balance Sheets` — no preferred line; corroborated by `Capital IQ Financials export → Key Stats` ("Pref. Equity –") |
| + Operating lease liabilities (optional adjustment — **NOT taken in the canonical bridge**) | (140.5) | `Q2 FY26 10-Q, lease note`: current operating lease liabilities 33.0 + non-current 107.5 = 140.5. Shown as a labelled variant below, not in the canonical line |
| + Underfunded pension / other long-term obligations (**NOT taken**) | (133.3) | `Q2 FY26 10-Q, Condensed Consolidated Balance Sheets`, "Pension and other post-retirement compensation and benefits 133.3" — see the not-made-adjustments note below |
| − Cash & equivalents | **(256.0)** | `Q2 FY26 10-Q, Condensed Consolidated Balance Sheets`, "Cash and cash equivalents 256.0" |
| − Short-term investments | **(0.0)** | None on the balance sheet; `Capital IQ Financials export → Balance Sheet` reports "Cash & Short Term Investments 256.0", i.e. all cash and no investments |
| − Long-term marketable securities | **(0.0)** | `Capital IQ Financials export → Key Stats` ("Long Term Marketable Securities –") |
| − Equity-method investments | **(0.0)** | No equity-method investment line appears on the balance sheet; other non-current assets are 224.6 and are not identified as equity-method holdings [`Q2 FY26 10-Q, Condensed Consolidated Balance Sheets`] |
| **= Enterprise value (EV) — canonical** | **28,940.0** | 27,703.6 + 1,492.4 + 0.0 + 0.0 − 256.0 − 0.0. No plug (MODULE_RULES → Reconciliation Gate 2) |

**Bridge at the indicative refresh price (USD 156.03, 2026-09-04 close — labelled, not the anchor):**

`25,254.7 + 1,492.4 + 0.0 + 0.0 − 256.0 = **USD 26,491.1m**`

**Lease-inclusive variant, for comparability with the vendor's TEV only:**

`28,940.0 + 140.5 operating lease liabilities = **29,080.5**` — which reproduces `Capital IQ Financials export → Key Stats`, "Total Enterprise Value (TEV) 29,080.504839", to the cent. Use this figure **only** when reading a Capital IQ multiple that was itself computed on TEV (for example the TEV/LTM EBITDA of 26.24x); do not mix it with the canonical 28,940.0.

### Canonical debt source and the vendor reconciliation (CLAUDE.md §15, MODULE_RULES → Cross-Module Inputs)

`balance-sheet-survival/01_capital-structure-and-leverage.md` ran in this run root, and its Leverage Anchor Summary designates **gross debt of $1,492.4m on the filing debt-note basis** as canonical. That figure is used above. This agent also holds a data-vendor aggregate — `ciq_facts.json` `total_debt_m` = **1,632.9** [`CIQ Financials → Balance Sheet 'Total Debt'`] — and it is **not** silently preferred. **The gap is exactly $140.5m, and it is entirely operating-lease liabilities**: 1,492.4 debt-note total + 33.0 current operating lease liabilities + 107.5 non-current operating lease liabilities = 1,632.9 [`Q2 FY26 10-Q, lease note` and `Note 10`]. This is a definitional difference, not a misread of the workbook — the sidecar's read of the vendor file is accepted as accurate, and the §4 source hierarchy decides which SOURCE wins: the filing's own debt note. The same reconciliation is carried in `earnings/01_historical-financials.md` §1 and in `balance-sheet-survival/01` §7, so all three modules now stand on one number.

### Cash quality — what is netted, and what is flagged

Only genuine operating cash is netted. All $256.0m is "Cash and cash equivalents" on the face of the balance sheet; there are **no** short-term investments, **no** financial-subsidiary investment portfolio, **no** margin balances and **no** long-tenor mark-to-market securities to strip out, so the vendor's "Cash & Short Term Investments 256.0" and the filing's cash line are the same money. Nothing was adopted uncritically.

**But $79.6m of that $256.0m — 31.1% — is not freely movable.** In the company's own words: "*we had $256.0 million of cash on hand, of which $79.6 million is held in certain countries in which the ability to repatriate is limited due to local regulations or significant potential tax consequences*" [`Q2 FY26 10-Q, MD&A, Liquidity and Capital Resources`]. The comparable a year and a half earlier was $53.2m of $131.2m (40.5%) [`FY24 10-K, MD&A, Liquidity and Capital Resources`]. Netting that trapped balance against holding-company debt assumes free movement the filing explicitly qualifies. Two consequences, both stated rather than buried:

- **EV both ways.** Canonical EV nets the full $256.0m: **28,940.0**. Netting only the $176.4m of freely usable cash gives **29,019.6** (+79.6). **The canonical figure is 28,940.0** — the strict §15 basis nets cash and equivalents as reported, and the trapped balance is a real asset of the group even if it is costly to move; the conservative variant is the one to reach for in a stress case, and `balance-sheet-survival/03_liquidity-runway` and `/06_downside-stress-test` own that read.
- The revolving credit facility's undrawn $600.0m capacity [`Q2 FY26 10-Q, Note 10`] is **liquidity, not cash**, and is nowhere in this bridge.

### Adjustments NOT made, and why

- **Operating leases ($140.5m) are not added to debt.** Under US GAAP the company's own debt note excludes them, and CLAUDE.md §4 puts the filing above the vendor aggregate. The lease-inclusive variant is shown above (29,080.5) so any vendor-computed TEV multiple stays comparable.
- **Finance leases (~$17.8m, per `balance-sheet-survival/01`) are not added.** Immaterial at 0.06% of EV.
- **Underfunded pension and other post-retirement benefits ($133.3m) are not added.** This is the balance-sheet liability, not a measured funding shortfall on a valuation basis, and the pool has no FY2025 10-K pension note to size it properly (the only 10-K in the pool is FY2024). Adding it would raise EV by 0.46%. Flagged, not taken.
- **Deferred tax liabilities ($232.0m) are not added.** Standard practice excludes them from EV; they are not a claim with a fixed maturity.
- **The Maverick Power acquisition is NOT in this bridge, and must not be quietly folded in.** Announced 2026-08-24 for $1.75bn cash plus up to $550m of earnout, close expected Q4 2026, funded from cash on hand and new debt [`nVent news release, 2026-08-24`]. It had not closed as of the run date, it is not on the 30-Jun-2026 balance sheet, and the anchor price pre-dates the announcement. `balance-sheet-survival/01` publishes a **labelled pro-forma** net debt of ~$2,986.4m and pro-forma net leverage of ~2.43x (reported EBITDA basis) for it — that figure is pro-forma arithmetic on an undisclosed financing mix, is explicitly *"Inference, not from filings"*, and may be used only with that label attached. **The canonical EV above is pre-deal.**

---

## 5. Net Debt & Leverage Snapshot

| Metric | Value | Source |
|---|---:|---|
| Total debt (canonical — §4 above) | **1,492.4** | `Q2 FY26 10-Q, Note 10 (Debt)`; adopted from `balance-sheet-survival/01`, Leverage Anchor Summary |
| Cash & equivalents | **256.0** | `Q2 FY26 10-Q, Condensed Consolidated Balance Sheets` |
| **Net debt (strict, §15: total debt − cash & equivalents) — CANONICAL** | **1,236.4** | 1,492.4 − 256.0. Matches `balance-sheet-survival/01` §7 and `earnings/01_historical-financials.md` §2 exactly |
| − Liquid short-term investments (if netted) | **0.0** | nVent holds none [`Q2 FY26 10-Q` balance sheet; `Capital IQ Financials export → Balance Sheet`] |
| **Net debt (broad, incl. investments)** | **1,236.4 — identical to strict** | With zero short-term investments the broad and strict bases coincide. Stated so no downstream agent invents a difference |
| *Memo:* net debt — conservative variant, excluding the $79.6m of trapped cash | 1,316.0 | 1,492.4 − 176.4. Basis: strict, on freely usable cash only. `balance-sheet-survival/03` and `/06` use this |
| *Memo:* net debt — Capital IQ vendor variant (**do not headline**) | 1,376.9 | `ciq_facts.json` `net_debt_m`; lease-inclusive basis: 1,492.4 + 140.5 leases − 256.0 = 1,376.9, reconciled exactly |
| Net debt / latest EBITDA — **reported (GAAP-derived) LTM EBITDA** | **1.15x** | 1,236.4 ÷ 1,074.6. EBITDA from `ciq_facts.json` `ltm_ebitda_m` [`CIQ Financials → Income Statement 'EBITDA', LTM 12 months Jun-30-2026`] — a tier-5 vendor figure, cited as such |
| Net debt / latest EBITDA — **company-adjusted LTM EBITDA** | **1.16x** | 1,236.4 ÷ 1,061.5, per `balance-sheet-survival/01` §7 (that agent computed the Q2 FY26 component from the 10-Q's own tables; carry its caveat) |
| Net debt / **mid-cycle (normalised) EBITDA** | **1.43x** | 1,236.4 ÷ 863.6, where 863.6 is the three-year average of reported EBITDA (FY2024 675.6, FY2025 840.5, LTM 1,074.6) per `balance-sheet-survival/01` §7. A labelled normalisation, not a forecast |

**Basis discipline (CLAUDE.md §15).** The **strict** row is the §15 default and is the figure the Anchor Summary carries forward. Because there are no short-term investments, the broad basis is arithmetically identical here — which removes the usual trap, but the label is still stated every time. The vendor's 1,376.9 is a **lease-inclusive** figure and is never to be labelled "strict".

**Cycle caveat that must travel with every leverage figure above.** Both the reported ($1,074.6m) and adjusted ($1,061.5m) LTM EBITDA bases sit at a **cyclical peak** — LTM revenue of $4,834m is 24% above FY2025's $3,893m and 61% above FY2024's $3,006m [`Capital IQ Financials export → Key Stats`]. Quoting 1.15x without the 1.43x mid-cycle counterpart understates the leverage a downturn would reveal. This is `balance-sheet-survival/01`'s caveat and it is propagated here verbatim rather than dropped in transit (CLAUDE.md §3).

---

## 6. Per-Share Reference Values

All per-share figures below divide by the **fully diluted count of 164.2m** (the per-share fair-value count fixed in §2), so they are directly comparable with every per-share fair value downstream.

| Metric | Per Share | Source |
|---|---:|---|
| Book value per share | **USD 24.28** | Total equity 3,986.9 ÷ 164.2m [`Q2 FY26 10-Q, Condensed Consolidated Balance Sheets`]. On the 161.858m basic count it is USD 24.63 |
| Tangible book value per share | **USD (2.94) — negative** | (Total equity 3,986.9 − goodwill 2,676.3 − intangibles, net 1,793.3) = (482.7) ÷ 164.2m [`Q2 FY26 10-Q, Condensed Consolidated Balance Sheets`]. Corroborated qualitatively by `Capital IQ Financials export → Key Stats`, which reports Price/Tangible BV as "NM" |
| Net debt per share (strict, §15 basis) | **USD 7.53 of net debt** | Net debt 1,236.4 ÷ 164.2m. nVent is **not** net cash |
| *Memo:* price-to-book at the anchor price | 7.05x | 171.16 ÷ 24.28. Vendor cross-check: `Capital IQ Financials export → Key Stats` P/BV 6.95x, computed on the basic count (171.16 ÷ 24.63) — the 0.10x gap is purely the share-count basis, not a data disagreement |

**Tangible book value is negative by $482.7m, and that is a structural fact about this balance sheet, not a rounding artefact.** Goodwill ($2,676.3m) and intangibles ($1,793.3m) together are $4,469.6m against total equity of $3,986.9m — the product of an acquisition programme that spent roughly $1,120m (FY2023), $678m (FY2024) and $976m (FY2025) [`earnings/01_historical-financials.md` §5]. Any downstream method that would use tangible book as a floor (P/TBV, a liquidation-style anchor) **cannot run on this company**; that is why the vendor reports P/Tangible BV as "NM" in every column. This is an observation about which methods are available, not a valuation judgment.

---

## 6A. Distribution Basis

nVent pays a quarterly cash dividend, and a shareholder-yield read is contemplated in the valuation triage (`00_valuation-data-triage` §3), so the basis is fixed here once and used verbatim downstream.

| Field | Value | Source |
|---|---|---|
| Yield basis (trailing / forward-declared / forward-estimated) | **Both stated. Trailing** = $0.82 per share actually paid in the twelve months to 30-Jun-2026. **Forward-declared run-rate** = $0.84 per share ($0.21 × 4), which is a run-rate extrapolation of the latest declared quarterly rate, **not** a declared annual amount | Trailing: H1-2026 cash dividends paid per ordinary share $0.42 [`Q2 FY26 10-Q, income statement`], plus $0.20 + $0.20 for the two 2025 payment quarters [`FY24 10-K, subsequent-events dividend note`; `Q1 FY26 10-Q, dividend note`]. Cross-check: LTM common dividends paid $132.9m ÷ ~161.9m shares = $0.821 [`Capital IQ Financials export → Cash Flow`, LTM Jun-30-2026] |
| Amount per share and the period it covers | **$0.21 per ordinary share** for the quarter; declared 2026-05-16, paid 2026-08-07 | `Q2 FY26 10-Q, Note 12 (Dividends payable)`: "On May 16, 2026, the Board of Directors declared a quarterly cash dividend of $0.21 per ordinary share payable on August 7, 2026" |
| Ex-date and record date of the most recent distribution | **Record date: 2026-07-24** (close of business). **Ex-date: not disclosed in the data pool** — the filing states the record date only | `Q2 FY26 10-Q, Note 12 (Dividends payable)` |
| Is the next distribution still available to a buyer today? (Y / N) | **N.** The record date of 2026-07-24 has passed and the dividend was paid on 2026-08-07 — a buyer on 2026-09-07 does not receive it. The next declaration (a board action expected around Q3-2026) **is not in this data pool**, so no forward distribution is confirmed as available | `Q2 FY26 10-Q, Note 12`; pool inventory per `00_valuation-data-triage` §1 |
| Gross or net (withholding; depositary fee) | **Gross.** The shares are ordinary shares listed directly on the NYSE — **not an ADR or GDR — so there is no depositary fee and no ratio adjustment** [`Q2 FY26 10-Q, cover page`]. The issuer is Irish-incorporated [`Q2 FY26 10-Q, cover page`], so Irish dividend withholding may apply to some holders, but **the withholding rate and any exemption are not disclosed anywhere in this data pool — Not assessable from the pool.** Do not assert a net yield |
| Yield on the **decision line** at the decision-line price | **Trailing: 0.48%** (0.82 ÷ 171.16). **Forward-declared run-rate: 0.49%** (0.84 ÷ 171.16). At the indicative 2026-09-04 refresh price of 156.03: trailing **0.53%**, run-rate **0.54%** — labelled indicative, not the anchor | derived from the rows above |

**The plain reading: at roughly half a percent, the dividend is not a material part of the return on this line, and the most recent one is already gone.** Its record date passed on 2026-07-24, so it is not income available to a buyer today and must never be presented as a reason to own the stock (CLAUDE.md §16). Any yield quoted downstream must carry the basis (trailing vs forward-declared run-rate), the price and its as-of date, and the gross label.

---

## 7. Anchor Summary (canonical numbers for downstream agents)

**Use these verbatim (MODULE_RULES → Reconciliation Gate 1). Any departure must state its own basis and its reason on the same line.**

- **Reporting currency:** **USD, millions** (per-share in dollars). US GAAP. Fiscal year ends 31 December. Balance-sheet date **30-Jun-2026**.
- **Current price (canonical anchor):** **USD 171.16**, last close **2026-08-12**, **pool-verified** with the as-of date confirmed by the export itself.
- **Price staleness:** **26 calendar days ≈ 17–19 trading days** — beyond the 15-trading-day tier. **Refresh attempted:** no fresher pool quote exists; a corroborated web quote of **USD 156.03 (close 2026-09-04, two independent sources at the identical figure)** was found and is carried as *indicative, web-sourced, not from data pool — unverified*. It does **not** replace the anchor. **The drift is −8.84%**, so `07` and `99` must show every price-relative read at BOTH prices, lead with the fresher one, and carry an inline staleness flag naming the 2026-08-12 as-of date. **Cap: valuation confidence max 60.**
- **Share count used for market cap:** **161.858m** (161,857,939 shares outstanding at 30-Jun-2026) [`Q2 FY26 10-Q, cover page`].
- **Share count used for per-share fair value:** **164.2m fully diluted** = 161.858m + 2.3m options/RSUs/PSUs on the company's own treasury-stock-method calculation; no convertibles exist [`Q2 FY26 10-Q, Note 4` and `Note 10`]. No limitation — the dilution data needed is disclosed.
- **Market cap:** **USD 27,703.6m** at the anchor price. At the indicative 2026-09-04 quote: **USD 25,254.7m** (labelled).
- **Net debt:** **USD 1,236.4m — strict §15 basis** (total debt 1,492.4 − cash 256.0). **Broad basis is identical** (no short-term investments). **This is `balance-sheet-survival/01_capital-structure-and-leverage.md`'s canonical filing-based figure, adopted here, and it agrees with `earnings/01_historical-financials.md` — all three modules stand on one number.**
- **Reconciliation carried forward with the number (not buried in §4/§5):** the Capital IQ vendor aggregate is total debt **1,632.9** / net debt **1,376.9** [`ciq_facts.json`]. **The entire $140.5m gap is operating-lease liabilities** (33.0 current + 107.5 non-current) that the company's own debt note does not classify as debt. The vendor read is accurate for the vendor's own basis; the filing wins under CLAUDE.md §4. Never label 1,376.9 "strict".
- **Enterprise value (EV):** **USD 28,940.0m** at the anchor price (= 27,703.6 + 1,492.4 + 0.0 minority + 0.0 preferred − 256.0 cash). At the indicative 2026-09-04 quote: **USD 26,491.1m** (labelled). **Lease-inclusive variant for reading vendor TEV multiples only: 29,080.5** (ties Capital IQ TEV exactly).
- **Leverage:** net debt / LTM reported EBITDA **1.15x**; / company-adjusted EBITDA **1.16x**; / mid-cycle normalised EBITDA **1.43x**. Both LTM bases are at a **cyclical peak** — quote the mid-cycle figure alongside.
- **Per share (on 164.2m):** book value **USD 24.28**; tangible book value **USD (2.94) — negative**, so no tangible-book floor method is available; net debt **USD 7.53** per share.
- **Pre-deal warning that must travel with every number above:** the anchor price, the consensus set, and this balance sheet all **pre-date the Maverick Power acquisition announced 2026-08-24** ($1.75bn cash + up to $550m earnout, close expected Q4 2026, cash-and-new-debt funded) [`nVent news release, 2026-08-24`]. The EV bridge is **pre-deal**. `balance-sheet-survival/01`'s pro-forma net debt of ~$2,986.4m / ~2.43x is *Inference, not from filings* and may only be used with that label.

### Anchor Block (copy-forward)

- Decision line: **NVT · New York Stock Exchange · USD** (Ordinary Shares, $0.01 nominal) — every downstream fair value, margin of safety, and yield is on THIS line. **Single listed line.**
- Other listed lines: **None** — no second class, no dual listing, no ADR/GDR; no FX conversion and no ratio adjustment apply.
- Price: **USD 171.16** (as-of **2026-08-12 close**, basis: last close, pool-sourced with the as-of date confirmed by the export). Indicative refresh carried alongside: **USD 156.03** (2026-09-04 close, web-sourced, corroborated by two independent sources, **unverified — not the anchor**), a **−8.84%** drift.
- Price-state: **`pool-verified`** — the canonical tag `05`/`07`/`99` read. The no-price cap does **NOT** bind: reverse-DCF (`05`) can run, and margin of safety, downside-to-bear, observed up/down and valuation attractiveness all remain assessable. The **staleness** cap binds instead: valuation confidence **max 60**, with a mandatory inline staleness flag and dual-price presentation in `07`/`99`.
- Currency: **USD** (millions; per-share in dollars). US GAAP, FY ends 31 December.
- Distribution basis: **trailing $0.82/share (12 months to 30-Jun-2026) and forward-declared run-rate $0.84/share ($0.21 × 4)** — most recent distribution $0.21/share, ex-date not disclosed in the pool, **record date 2026-07-24**, **still available to a buyer today: N** (record date passed, paid 2026-08-07), **gross** (no depositary fee — direct NYSE ordinary listing; Irish withholding treatment not disclosed in the pool). Yield on the decision line: **0.48% trailing / 0.49% run-rate at $171.16**.
- Shares (market cap): **161,857,939 (161.858m)** [`Q2 FY26 10-Q, cover page`, as of 30-Jun-2026].
- Shares (per-share fair value): **164.2m fully diluted** [`Q2 FY26 10-Q, Note 4` — 161.858m + 2.3m TSM increment; no convertibles per `Note 10`]. No limitation.
- Market cap: **USD 27,703.6m** at $171.16 · **USD 25,254.7m** at the indicative $156.03.
- Net debt: **USD 1,236.4m — strict §15 basis** (broad basis identical; no short-term investments). Source: `Q2 FY26 10-Q, Note 10` + balance sheet, adopted from `balance-sheet-survival/01`'s canonical filing-based figure — **reconciled and in agreement**. Vendor variant 1,376.9 differs solely by $140.5m of operating leases; do not headline it and never label it "strict".
- EV: **USD 28,940.0m** at $171.16 · **USD 26,491.1m** at the indicative $156.03 · **USD 29,080.5m** lease-inclusive (vendor-TEV-comparable only).
- Key caveats: (1) **price is 26 calendar days / ~17–19 trading days stale** — confidence cap 60, dual-price presentation mandatory; (2) **every input here is pre-Maverick-Power** (announced 2026-08-24, $1.75bn + up to $550m earnout, unclosed); (3) **$79.6m of the $256.0m of cash cannot be readily repatriated** — conservative net debt is 1,316.0; (4) **LTM EBITDA is at a cyclical peak** — carry the 1.43x mid-cycle leverage alongside the 1.15x; (5) **tangible book value is negative ($482.7m)** — no tangible-book floor method is available; (6) the FY2025 10-K is absent from the pool, so no FY2025 figure may be cited to an FY2025 filing.

No valuation judgment is made in this report. Whether $171.16 (or $156.03) is the right price for this company is `02`–`07`'s work, and the rating is the master synthesizer's.
