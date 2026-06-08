# Price & Capital Structure — CRM

**Company:** Salesforce, Inc. (NYSE:CRM) · **Reporting standard:** US GAAP · **Currency:** USD · **Fiscal year ends:** Jan 31 · **As-of:** 2026-06-08

**One-line headline:** The capital structure was transformed in the last two quarters — Salesforce took on roughly $25 billion of new senior notes plus a $6 billion term loan to fund its ~$8 billion Informatica acquisition and bought back ~$23 billion of stock, swinging the company from a net-cash balance sheet (about −$2.0 billion at Jan-31-2025) to net debt of about +$30.7 billion at Apr-30-2026. Anything downstream that still assumes "Salesforce has net cash" is wrong.

---

## 1. Current Price

| Field | Value | Source | As-of Date |
|---|---|---|---|
| Current price | $185.66 | Capital IQ Quick Comparable Analysis — "Day Close Price Latest" (data pool) | 2026-06-08 |
| Currency | USD | Capital IQ comps export, As-Of 2026-06-08 | 2026-06-08 |
| Price basis (last close / intraday / indicative) | Last close, vendor-carried latest | Capital IQ comps export | 2026-06-08 |

**Price source is a data-pool vendor file, not web — no indicative/web label required.** The price comes from the Capital IQ "Company Comparable Analysis" workbook, Financial Data tab, "Day Close Price Latest" = $185.66, with the tab stamped `As-Of Date: 2026-06-08`. This is a Tier-3/4 vendor export inside the data pool, so the partial-data web-quote rule does not apply.

**Two pool prices exist — both dated 2026-06-08 — and they differ; downstream agents must know this:**
- **$185.66** — Capital IQ comps "Day Close Price Latest" `[Capital IQ Comparable Analysis, Financial Data, As-Of 2026-06-08]`. **Used as the current price** because it is the vendor's most current "latest" close and it ties exactly to the comps enterprise value (see §4).
- **$176.17** — Capital IQ Estimates "Latest Price/Last Close Price" `[Capital IQ EstimatesReport, Consensus, As-Of 2026-05-28 filing snapshot]` and the same figure appears as the Apr-30-2026 price in the Historical Capitalization tab (pricing as-of the 2026-05-28 filing date). This is a slightly older close tied to the Q1 filing-date snapshot.

The two differ by 5.4% ($185.66 vs $176.17). I use $185.66 (more current, and it reconciles the comps EV with no plug). Downstream agents that prefer the consensus tab's $176.17 must say so and re-run the bridge; at $176.17 the market cap on 819M shares is ~$144.3 billion and enterprise value ~$175.0 billion (the values Capital IQ's own Current-Capitalization and Implied-Valuation pages use). 52-week range: $276.80 high / $163.52 low `[Capital IQ EstimatesReport, Consensus]`. Sell-side mean target price $257.03 (range $160–$475, 52 estimates) `[Capital IQ EstimatesReport, Consensus]` — shown for context only; this agent makes no valuation call.

---

## 2. Share Count

| Field | Value | Source |
|---|---:|---|
| Basic shares outstanding (cover page, as of Feb-25-2026) | 923 M | FY2026 10-K (filed Mar-02-2026), cover page |
| Shares outstanding on balance-sheet date Jan-31-2026 | 929 M | FY2026 10-K, balance sheet (1,073 M issued − treasury) |
| Shares outstanding on balance-sheet date Apr-30-2026 (Q1 FY2027) | 819 M | Capital IQ Financials (annual), Balance Sheet, col. Apr-30-2026, filed 2026-05-28 |
| Basic weighted-average shares (FY2026, period to Jan-31-2026) | 950 M | FY2026 10-K, EPS reconciliation note |
| Diluted weighted-average shares (FY2026) | 956 M | FY2026 10-K, EPS reconciliation note (basic 950 + 6 employee stock awards via treasury-stock method) |
| Options/RSUs count (separate line) | Not separately quantified; net dilutive effect = 6 M shares in FY2026 | FY2026 10-K, EPS reconciliation note |
| Convertibles / potential shares | None outstanding (no convertible debt at Apr-30-2026) | Capital IQ Capital Structure Summary, "Total Convertible Debt" = nil latest quarters |
| **Fully diluted shares (TSM + if-converted)** | ~825 M (819 M Apr-30-2026 balance-sheet count + ~6 M net option/RSU dilution) — see note | Inference from 10-K dilution rate applied to latest count |
| **Share count used for market cap** | **819 M** (most recent, Apr-30-2026) | Capital IQ Balance Sheet / Historical Capitalization, Apr-30-2026 |
| **Share count used for per-share fair value** | **819 M** (latest count; near-identical to fully diluted given tiny 6 M dilution) | as above |

**Material gap between the cover-page count (923 M) and the latest vendor count (819 M) — reconciled, not ignored.** The 10-K cover page reports ~923 M shares "as of February 25, 2026," and the Jan-31-2026 balance sheet shows 929 M. Capital IQ's Apr-30-2026 (Q1 FY2027) balance-sheet column shows only 819 M — a drop of ~110 M shares (~12%) in one quarter. That looks extreme, but it reconciles to a balance-sheet fact: treasury stock rose from −$32,228 M (Jan-31-2026) to −$55,028 M (Apr-30-2026), an increase of ~$22.8 billion `[Capital IQ Financials (annual), Balance Sheet]`. ~$22.8 billion of repurchases ÷ ~110 M shares implies an average buyback price of about $207, which sits inside the stock's Q1 FY2027 trading range — so the count and the treasury change are internally consistent. The 819 M count is therefore the more current figure and is what I use.

- **Caveat for downstream:** the 819 M figure is from the Capital IQ vendor extract for Apr-30-2026; the most recent *filing-sourced* count is 923 M (10-K cover, Feb-25-2026). Per the source hierarchy, a filing outranks a vendor export — but here the vendor figure is *more recent* (Apr-30-2026 vs Feb-25-2026) and is corroborated by the filed treasury-stock movement. If a Q1 FY2027 10-Q cover page becomes available, use its "as of" share count and re-run market cap; the gap to watch is 819 M vs 923 M.
- **Fully diluted share count is computable and is essentially the same as the basic count.** Net dilution from employee stock awards was only 6 M shares on ~950 M in FY2026 (about 0.6%), and there is no convertible debt to add back. So fully diluted ≈ 825 M. No material option-strike or convert-term data is missing; the small dilution is the only adjustment and it does not move the per-share math.

---

## 3. Market Capitalization

`Market cap = share count × current price`

`Market cap = 819 M shares × $185.66 = $152,056 M ≈ $152.1 billion`
`[Shares: Capital IQ Balance Sheet, Apr-30-2026, filed 2026-05-28; Price: Capital IQ comps "Day Close Price Latest", As-Of 2026-06-08]`

This ties to the Capital IQ comps "Market Capitalization Latest" of $152,055.5 M for CRM `[Capital IQ Comparable Analysis, Financial Data, As-Of 2026-06-08]`.

**Cross-checks under other counts/prices (for downstream choice):**
- At $185.66 × 923 M (10-K cover count) = ~$171.4 billion.
- At $185.66 × 956 M (FY2026 diluted weighted-average) = ~$177.5 billion.
- At $176.17 × 819 M (consensus-tab price) = ~$144.3 billion (Capital IQ's own Current-Capitalization market cap).

---

## 4. Enterprise Value Bridge

All balance-sheet components are as of **Apr-30-2026 (Q1 FY2027), filed 2026-05-28** — the latest available — at the current price of **$185.66** on **819 M** shares.

| Component | Amount (USD M) | Source |
|---|---:|---|
| Market capitalization | 152,056 | 819 M × $185.66 (see §3) |
| + Total debt (short + long term, incl. finance leases) | 42,548 | Capital IQ Capital Structure Summary (annual), Apr-30-2026 |
| + Minority / non-controlling interest | 0 | Capital IQ Historical Capitalization & Income Statement — nil |
| + Preferred equity | 0 | Capital IQ Historical Capitalization — nil |
| + Operating lease liabilities (optional adjustment) | Not added separately — finance/operating lease liabilities of ~$3,268 M are already inside the $42,548 M total-debt figure | Capital IQ Capital Structure Summary, "Total Lease Liabilities" = 3,268 |
| + Underfunded pension / other long-term obligations | Not added — Pension/OPEB tab is empty; no underfunded plan disclosed | Capital IQ Pension-OPEB tab (empty) |
| − Cash & equivalents (+ ST investments) | (11,837) | Capital IQ Balance Sheet / Capital Structure, Apr-30-2026 (cash $10,365 + ST investments... see note) |
| − Equity-method / long-term marketable securities | Not deducted (treated inside operations) | Capital IQ Historical Capitalization — "Long Term Marketable Securities" line = nil |
| **= Enterprise value (EV)** | **182,767** | Sum of the above |

`EV = 152,056 + 42,548 + 0 + 0 − 11,837 = $182,767 M ≈ $182.8 billion`

**The bridge ties with no plug.** It matches the Capital IQ comps "Total Enterprise Value Latest" of $182,766.5 M for CRM `[Capital IQ Comparable Analysis, Financial Data, As-Of 2026-06-08]`. The only rounding difference is sub-$1 M.

**Composition of the $42,548 M total debt** `[Capital IQ Capital Structure Summary (annual), Apr-30-2026]`:
- Senior bonds and notes: $33,285 M (unsecured)
- Term loans (the drawn Informatica Credit Agreements): $5,995 M (floating-rate)
- Lease liabilities (finance + capitalized): $3,268 M

**Note on cash figure.** The Capital Structure tab carries "Total Cash & ST Investments" = $11,837 M for Apr-30-2026, and the Implied-Valuation and Current-Capitalization pages use the same $11,837 M. The detailed quarterly Balance-Sheet tab's columns are mis-labeled by one year (its period headers read "…Jul-31-2025" but the filing dates run through 2026-05-28), so I take cash from the annual Capital Structure / Historical Capitalization tabs, which carry correct Apr-30-2026 period-end dates and tie to the comps. Treat $11,837 M as the latest total cash and short-term investments.

**Adjustments deliberately NOT made (and why):**
- **Operating leases** are not added on top — they are already inside the $42,548 M total-debt number (lease liabilities $3,268 M). Adding them again would double-count.
- **Pension / OPEB** — none disclosed (Pension-OPEB tab empty); nothing to add.
- **Equity-method investments / long-term marketable securities** — Capital IQ shows nil on the dedicated bridge line, so no separate deduction. Salesforce does carry "Long-term Investments" (~$5.1 billion) and goodwill on the balance sheet, but these are operating/strategic, not a cash-equivalent to net off; leaving them in EV is the conservative choice.
- **Contingent / acquisition earn-outs** — not separately quantified in the pool; not added.

---

## 5. Net Debt & Leverage Snapshot

Net debt definition used: `Net debt = total debt − cash & short-term investments` (CLAUDE.md §15 default; Salesforce does not disclose a different definition).

| Metric | Value | Source |
|---|---:|---|
| Total debt | $42,548 M | Capital IQ Capital Structure Summary (annual), Apr-30-2026 |
| Cash & equivalents (+ ST investments) | $11,837 M | Capital IQ Capital Structure / Historical Capitalization, Apr-30-2026 |
| **Net debt (total debt − cash)** | **$30,711 M** | ties to Capital IQ "Net Debt" line for Apr-30-2026 |
| Net debt / LTM EBITDA (GAAP EBITDA) | ~2.38x | $30,711 M ÷ LTM EBITDA $12,895 M (LTM to Apr-30-2026) `[Capital IQ Implied Valuation / Key Stats]` |
| Total debt / LTM EBITDA (GAAP) | ~3.30x | $42,548 M ÷ $12,895 M |
| (Vendor cross-check) Net debt / EBITDA | 2.32x | Capital IQ Capital Structure Summary, Apr-30-2026 (vendor's own ratio) |

**EBITDA basis stated:** the EBITDA here is GAAP/as-reported trailing-twelve-month EBITDA from the Capital IQ financials ($12,895 M LTM to Apr-30-2026), not a management-adjusted number. Salesforce's own non-GAAP operating metrics would show a different (higher) figure; this snapshot uses the reported figure for consistency.

**The leverage story is the finding.** Net debt was −$1,962 M (net cash) at Jan-31-2025, +$8,146 M at Jan-31-2026 (after the November-2025 Informatica close and the $6 billion term-loan draw), and +$30,711 M at Apr-30-2026 after the ~$25 billion senior-notes issuance termed out the acquisition financing and the large Q1 buyback drew down cash. Net debt / EBITDA moved from "not meaningful / net cash" to ~2.3–2.4x in roughly twelve months. Salesforce reported it was in compliance with all debt covenants as of Jan-31-2026 `[FY2026 10-K, Note 9 (Debt) / liquidity discussion]`; covenant headroom is a balance-sheet-survival-module question, not assessed here.

---

## 6. Per-Share Reference Values

All on the latest 819 M share count and the latest filed equity (Apr-30-2026, filed 2026-05-28).

| Metric | Per Share | Source |
|---|---:|---|
| Book value per share | $41.80 | Capital IQ Balance Sheet (annual), Apr-30-2026 ("Book Value/Share"); ties to equity $34,235 M ÷ 819 M |
| Tangible book value per share | **−$38.71** | Capital IQ Balance Sheet (annual), Apr-30-2026 ("Tangible Book Value/Share"); tangible book = −$31,706 M ÷ 819 M |
| Net debt (not net cash) per share | −$37.50 | Net debt $30,711 M ÷ 819 M shares |

**Tangible book value is deeply negative (−$38.71/share, −$31.7 billion total).** This is the direct accounting footprint of years of acquisitions, now amplified by Informatica: goodwill and intangibles far exceed equity. For a software business this is normal and not by itself a solvency signal, but it means book-based methods (P/B, P/tangible-book) are close to meaningless for valuation — the comps show "P/TangBV — NM" for CRM `[Capital IQ Comparable Analysis, Trading Multiples]`. Flagging it so downstream agents do not anchor on tangible book.

---

## 7. Anchor Summary (canonical numbers for downstream agents)

Use these verbatim. Every other valuation agent (`02`–`07`, `99`) should pull the price, share count, net debt, and EV from this block, and state any divergence explicitly rather than silently re-deriving.

- **Current price:** $185.66 (as-of 2026-06-08, last close, Capital IQ comps "Day Close Price Latest"). Alternate pool price $176.17 (Capital IQ Estimates "Latest Price/Last Close", 2026-05-28 snapshot) — 5.4% lower; flag if used.
- **Reporting currency:** USD. Reporting standard: US GAAP. Fiscal year ends Jan 31.
- **Share count (market cap):** 819 M (Capital IQ Balance Sheet, Apr-30-2026, filed 2026-05-28). Most recent filing-sourced count is 923 M (10-K cover, Feb-25-2026); the gap reconciles to ~$22.8 billion of Q1 FY2027 buybacks.
- **Share count (per-share fair value):** 819 M (≈ fully diluted; net option/RSU dilution only ~6 M, no converts).
- **Market cap:** ~$152.1 billion (819 M × $185.66).
- **Total debt:** $42,548 M (Apr-30-2026).
- **Cash & ST investments:** $11,837 M (Apr-30-2026).
- **Net debt:** $30,711 M (Apr-30-2026) — NOT net cash. This changed within the last twelve months.
- **Enterprise value (EV):** ~$182.8 billion (ties to Capital IQ comps TEV $182,766.5 M).
- **Minority interest / preferred:** none.
- **Per share:** book value $41.80; tangible book value −$38.71; net debt per share −$37.50.

**Key caveats to propagate:**
1. Two pool prices ($185.66 vs $176.17) differ by 5.4% — the chosen price is the comps "latest"; a different choice shifts market cap by ~$8 billion.
2. Share count 819 M (vendor, Apr-30-2026) vs 923 M (10-K cover, Feb-25-2026) — material; reconciled via treasury-stock change but worth confirming against a Q1 FY2027 10-Q cover when available.
3. **The balance sheet is freshly leveraged** (net debt ~$30.7 billion, ~2.3–2.4x EBITDA) after Informatica — any model still assuming net cash is stale.
4. Tangible book value is negative; book-based multiples are not informative for this company.

### Anchor Block (copy-forward)

- Price: $185.66 (2026-06-08, last close — Capital IQ comps "Day Close Price Latest"; alt. $176.17 Capital IQ Estimates Consensus)
- Currency: USD (US GAAP; FY ends Jan 31)
- Shares (market cap): 819 M (Capital IQ Balance Sheet, Apr-30-2026, filed 2026-05-28)
- Shares (per-share fair value): 819 M (≈ fully diluted; +~6 M net option/RSU dilution, no converts) (FY2026 10-K dilution note)
- Market cap: ~$152,056 M (~$152.1 B)
- Net debt: $30,711 M (Apr-30-2026 — total debt $42,548 M − cash $11,837 M)
- EV: ~$182,767 M (~$182.8 B; ties to Capital IQ comps TEV)
- Key caveats: net debt (not net cash) post-Informatica; two pool prices ($185.66 / $176.17, 5.4% apart); share count 819 M vendor vs 923 M 10-K cover (reconciled via ~$22.8 B Q1 buyback); tangible book value negative
