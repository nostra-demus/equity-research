# Price & Capital Structure — UBER

No `ciq_facts.json` sidecar exists for this run (confirmed absent — see `00_valuation-data-triage.md` §1); all figures below are this agent's own sourced read of the Capital IQ pool extracts, cross-checked across the two independent Capital IQ workbooks in the pool (the company Financials export and the Comparable Analysis / comps export). No primary 10-K/10-Q sits in `data/UBER/`; every figure below is a **Capital IQ export (source tier 5)**, cited as such — never attributed to "10-K" or "10-Q" by name, per `00_valuation-data-triage.md` §1A. Reporting standard: **US GAAP**. Reporting currency: **USD** (in millions unless stated as per-share). Jurisdiction: US / NYSE.

## 1. Current Price

| Field | Value | Source | As-of Date |
|---|---|---|---|
| Current price | $68.18 | Capital IQ export — Uber Technologies Inc NYSE UBER Financials.xls, Key Stats tab, "Current Capitalization" block | Close, Aug-05-2026 |
| Currency | USD | Financials.xls, Key Stats tab | — |
| Price basis | Last close (explicitly stated: "Currency in USD in mm, LTM as of Jun-30-2026 TEV and Market Cap are calculated using a close price as of Aug-05-2026") | Uber Technologies Inc NYSE UBER Public Company Profile.rtf | Aug-05-2026 |

**Corroboration.** The $68.18 close is confirmed by two further, separately-exported Capital IQ tabs pulled the same day: (1) Company Comparable Analysis Uber Technologies Inc.xls, Financial Data tab — "Day Close Price Latest 68.18," As-Of Date 2026-08-06; (2) UberTechnologies,IncNYSEUBEREstimatesReport (1).xls, Consensus tab — "Latest Price/Last Close Price 69.48/68.18" (69.48 = intraday/latest tick; 68.18 = the last close used for capitalization purposes), consensus pulled 2026-08-05 10:04 GMT. All three exports agree to the cent. This is a single-vendor (Capital IQ) pool price with internal multi-tab corroboration — not a web-sourced quote, so the "two independent web sources" test does not apply; it is **pool-verified**.

**Price staleness.** Run date 2026-08-06; price as-of Aug-05-2026 close = 1 calendar day ≈ 1 trading day old. This is well inside the 5-trading-day threshold — no refresh attempt or staleness cap is required. The price remains fresh for margin-of-safety and downside-to-bear use downstream.

**Price-state: `pool-verified`.**

## 2. Share Count

| Field | Value | Source |
|---|---:|---|
| Basic shares outstanding (as-of, tied to current cap table) | 2,035.599 mm | Financials.xls, Key Stats tab, "Current Capitalization" block, "Shares Out." (dilution basis: Basic; paired with the $68.18 price) |
| Total shares outstanding, balance-sheet date (Jun-30-2026) | 2,036.458 mm | Financials.xls, Balance Sheet tab, Supplemental Items, "Total Shares Out. on Balance Sheet Date" |
| Weighted-avg basic shares (LTM Jun-30-2026) | 2,061.502 mm | Financials.xls, Income Statement tab |
| Weighted-avg diluted shares (LTM Jun-30-2026) | 2,087.980 mm | Financials.xls, Income Statement tab |
| Implied dilution effect (diluted − basic, LTM) | +26.48 mm (~1.3%) | Derived from the two rows above |
| Options/RSUs count (separate strike-price schedule) | Not disclosed in pool | — |
| Convertibles / potential shares | 2028 Convertible Notes, $1,725mm principal, 0.875% coupon, matures 2028-12-01; 2028 Exchangeable Senior Notes, $1,125mm principal, 0% coupon, secured, matures 2028-05-15 | Financials.xls, Capital Structure Details tab |
| **Fully diluted shares used (proxy)** | **2,087.980 mm** (LTM weighted-average diluted) | Financials.xls, Income Statement tab — limitation below |
| Share count used for market cap | 2,035.599 mm | Financials.xls, Key Stats tab |
| Share count used for per-share fair value | 2,087.980 mm | Financials.xls, Income Statement tab |

**Cross-check discrepancy (flagged, not resolved).** A second, independently-exported Capital IQ workbook — Company Comparable Analysis Uber Technologies Inc.xls, Financial Data tab — states "Shares Outstanding Latest" as 2,042.6 mm (as-of 2026-08-06), about 7 mm shares (~0.35%) higher than the Financials.xls Key Stats figure used above. Both exports are the same vendor pulling different snapshot dates/dilution conventions; the gap is immaterial to market cap (<0.4%) but is noted so a downstream agent does not treat the two as independent confirmations of the identical number. This agent uses the Financials.xls Key Stats figure as canonical because it is the export that is directly paired, in the same table, with the $68.18 price and the EV bridge components below (internal tie-out).

**Fully diluted share limitation.** No options/RSU strike-price schedule and no separate if-converted share count for the two convertible/exchangeable notes are disclosed in the pool, so an independent treasury-stock-method (TSM) + if-converted build cannot be constructed bottom-up. Per the Fully Diluted Equity Rules fallback, this agent uses the GAAP **weighted-average diluted share count** (2,087.980 mm, LTM Jun-30-2026), which already embeds the TSM effect of options/RSUs and the if-converted effect of the notes to the extent GAAP diluted-EPS rules found them dilutive in the period — but this is a **weighted-average for the trailing 12 months, not a point-in-time fully diluted count as of today**, and may differ from a true today-dated fully diluted share count. This is a labeled limitation, not a gap that blocks valuation.

**Which count for which purpose.** Market cap uses the most recent as-of basic share count (2,035.599 mm) per the Fully Diluted Equity Rules (market-cap count = latest "as of" count, not a weighted average). Per-share fair-value outputs downstream should use the diluted weighted-average (2,087.980 mm) so per-share intrinsic/DCF/SOTP values are not overstated by ignoring options, RSUs, and the convertible/exchangeable notes.

## 3. Market Capitalization

`Market cap = share count (2,035.599 mm) × current price ($68.18) = $138,787.14 mm (~$138.8bn)`

This ties exactly to Financials.xls, Key Stats tab, "Market Capitalization" = 138,787.140706. Cross-check: Company Comparable Analysis.xls, Financial Data tab states Market Capitalization Latest = $139,261.7mm (using its own 2,042.6mm share count × $68.18) — a 0.34% variance explained entirely by the share-count discrepancy noted in §2, not by a price disagreement.

## 4. Enterprise Value Bridge

| Component | Amount ($mm) | Source |
|---|---:|---|
| Market capitalization | 138,787.14 | §3 above |
| + Total debt (short + long term) | 14,731 | Financials.xls, Balance Sheet tab, Jun-30-2026 press-release column: Curr. Port. of LT Debt (1,997) + Curr. Port. of Leases (178) + Long-Term Debt (10,726) + Long-Term Leases (1,830) = 14,731; matches Key Stats tab "+ Total Debt" line exactly |
| + Minority / non-controlling interest | 1,083 | Financials.xls, Balance Sheet tab, Jun-30-2026: Minority Interest 1,083; matches Key Stats tab |
| + Preferred equity | 0 | Financials.xls, Key Stats tab: "Pref. Equity —" (none outstanding) |
| + Operating lease liabilities | Not added separately — already included in "Total debt" above (Curr./LT Leases lines are Capital IQ's operating+finance lease liabilities per Capital Structure Details tab) | Financials.xls, Balance Sheet / Capital Structure Details tabs |
| + Underfunded pension / other long-term obligations | None disclosed — Financials.xls, Pension OPEB tab is sparse/not applicable to Uber | Financials.xls, Pension OPEB tab |
| − Cash & equivalents (+ ST investments) | (5,391) | Financials.xls, Balance Sheet tab, Jun-30-2026: Cash And Equivalents 4,870 + Short Term Investments 521 = 5,391; matches Key Stats tab "− Cash & Short Term Investments" |
| − Equity-method investments | Not netted — see cash-quality note below | — |
| **= Enterprise value (EV)** | **149,210.14 (~$149.2bn)** | Sum of above; ties exactly to Financials.xls, Key Stats tab "Total Enterprise Value (TEV)" = 149,210.140706 |

**Cross-check.** Company Comparable Analysis.xls, Financial Data tab computes EV independently as Market Cap (139,261.7) + Net Debt (9,340) + Minority Interest (1,083) − Preferred (0) = **149,684.7**, a 0.32% variance vs. the $149,210.14mm figure above, fully explained by the same ~0.35% share-count snapshot difference noted in §2/§3 (both exports use the identical $9,340mm net-debt figure — see §5). The two independent Capital IQ exports agree on EV to within a third of a percent.

**Adjustments NOT made, and why:**
- Operating leases are already folded into "Total debt" via Capital IQ's Curr./LT Leases lines (Capital Structure Details tab lists "Operating Lease Liabilities" of $1,559mm and "Finance Leases" of $222mm within the debt schedule), so no separate add-on is applied — adding them again would double-count.
- No pension/OPEB adjustment — not applicable to Uber (sparse/blank tab).
- No equity-method-investment carve-out is added back to EV (see cash-quality note immediately below) — the pool's current-period bridge already treats them as non-cash, non-netted assets, which this agent adopts, but flags the underlying data quality question.

### Cash quality — flagged, not silently accepted

"Cash & Short Term Investments" of $5,391mm (Jun-30-2026: $4,870mm cash + $521mm ST investments) is genuine operating cash and short-dated equivalents. **Restricted cash ($661mm at Jun-30-2026) is already excluded** — it sits on its own balance-sheet line and is not part of the $5,391mm netted above; this is the correct treatment and required no adjustment.

Separately, Uber carries **$12,532mm of "Long-term Investments"** and **$3,773mm of "Equity Method Investments"** on the Jun-30-2026 balance sheet (Financials.xls, Balance Sheet tab) — up sharply from $9,465mm and $287mm, respectively, at FY2025 year-end. On the Q2 2026 earnings call, CFO Balaji Krishnamurthy stated Uber "deployed about $4 billion of capital in the second quarter" on "market purchases of Delivery Hero stock" ahead of the announced Delivery Hero acquisition [Q2 2026 Earnings Call transcript, Aug-05-2026, l.577–585]. This explains most of the jump: it is a strategic, pre-acquisition equity stake in a company being bought, not a liquid or cash-like asset, and is correctly **not** netted against EV here.

Two things are flagged for downstream agents rather than resolved:
1. **Definitional inconsistency inside the same Capital IQ workbook.** The Historical Capitalization tab (quarterly EV bridge) nets a "Long Term Marketable Securities" line against EV for every quarter from Dec-2024 through Mar-2026 (ranging $3,873mm–$5,737mm), but the Key Stats tab's "Current Capitalization" bridge (the one used for §4 above, based on the Jun-30-2026 press-release balance sheet) shows this line as blank/zero. It is unclear from the pool whether this genuinely fell to zero (e.g., because the underlying holdings lost public-market/marketable status once folded into the Delivery Hero stake or other equity-method positions) or whether the field is simply unpopulated in the latest snapshot. **This agent does not net any portion of the $12,532mm Long-term Investments against EV, because there is no reliable current-period split between liquid/marketable and illiquid/strategic holdings in the pool** — inventing one would be a fabricated figure. Flagged as a data-quality gap for the next data refresh (the FY2026 10-K's investment note would resolve it).
2. **Materiality for downstream agents.** At ~$16.3bn combined (Long-term Investments + Equity Method Investments), these holdings are large enough (≈11.8% of the $149.2bn EV) that a different vendor view — or a future refresh that nets any portion of them as "cash-like" — would materially change net debt and EV. Any downstream agent that encounters a Capital IQ "cash" figure inclusive of these items should NOT adopt it uncritically; the canonical net-debt figure in this report nets ONLY the $5,391mm of true cash & ST investments (§5).

## 5. Net Debt & Leverage Snapshot

| Metric | Value ($mm) | Source |
|---|---:|---|
| Total debt | 14,731 | §4 above |
| Cash & equivalents (+ ST investments) | 5,391 | §4 above |
| **Net debt (strict: total debt − cash & equivalents)** | **9,340** | Derived (14,731 − 5,391); matches Financials.xls, Balance Sheet tab "Net Debt" supplemental line (9,340, Jun-30-2026) exactly, and matches the independently-computed Comparable Analysis.xls "LTM Net Debt" figure (9,340) exactly — two-source agreement on this figure specifically |
| Net Debt / LTM EBITDA (Capital IQ GAAP EBITDA) | 1.19x | Financials.xls, Ratios tab, "Net Debt/EBITDA," LTM column (1.187615) — vendor-computed ratio cited as-is, not independently recomputed, to avoid mixing EBITDA bases |

Net debt is presented on the **strict** basis (total debt − cash & equivalents, including short-term investments), consistent with CLAUDE.md §15's default definition. No broad-basis (netting in long-term marketable securities) figure is presented as canonical for the reasons stated in the cash-quality note above — the current-period split needed to compute a broad-basis figure is not reliably available in this pool.

## 6. Per-Share Reference Values

| Metric | Per Share | Source |
|---|---:|---|
| Book value per share | $13.41 | Financials.xls, Balance Sheet tab, Jun-30-2026, "Book Value/Share" |
| Tangible book value per share | $8.21 | Financials.xls, Balance Sheet tab, Jun-30-2026, "Tangible Book Value/Share"; cross-confirmed by Company Comparable Analysis.xls, Financial Data tab, "LTM Tangible Book Value/Share" = 8.21 |
| Net debt per share (strict) | $4.59 | Derived: $9,340mm net debt ÷ 2,035.599mm shares (the market-cap share count) |

## 7. Anchor Summary (canonical numbers for downstream agents)

- **Current price:** $68.18, close as of Aug-05-2026 — pool-verified, corroborated across three independent Capital IQ exports (Financials.xls Key Stats, Comparable Analysis.xls Financial Data, EstimatesReport Consensus). 1 trading day old at run date — no staleness cap applies.
- **Share count (market cap):** 2,035.599 mm (Financials.xls, Key Stats — most recent "as of" basic count paired with price).
- **Share count (per-share fair value):** 2,087.980 mm (LTM weighted-average diluted, Income Statement tab) — a GAAP-embedded proxy for fully diluted shares, not an independently rebuilt TSM/if-converted count; labeled limitation (no options/RSU strike-price schedule in the pool).
- **Market cap:** $138,787.14 mm (~$138.8bn).
- **Net debt (strict basis, canonical for downstream reuse per Reconciliation Gate 1):** $9,340 mm.
- **EV:** $149,210.14 mm (~$149.2bn) — cross-checked to within 0.32% by an independent Capital IQ export.
- **Reporting currency:** USD.
- **Key caveats:** (1) no primary 10-K/10-Q in the pool — every figure above is a Capital IQ export (tier 5), cited as such; (2) fully diluted share count is a weighted-average proxy, not a bottom-up TSM/if-converted build, because option/RSU strike terms are not disclosed in the pool; (3) ~$16.3bn of Long-term Investments + Equity Method Investments (including a ~$4bn Q2-2026 Delivery Hero pre-acquisition stake) is correctly excluded from net debt/cash, but the pool's own current-vs-historical treatment of a "Long Term Marketable Securities" line item is internally inconsistent and unresolved — flagged, not guessed at; (4) a ~0.35% share-count/EV variance exists between two Capital IQ exports (Financials.xls vs. Comparable Analysis.xls), immaterial but noted for transparency.

### Anchor Block (copy-forward)

- Price: $68.18 (Aug-05-2026 close, last close)
- Price-state: pool-verified
- Currency: USD
- Shares (market cap): 2,035.599 mm (Financials.xls, Key Stats tab)
- Shares (per-share fair value): 2,087.980 mm (Financials.xls, Income Statement tab — LTM weighted-average diluted; limitation: not a bottom-up TSM/if-converted rebuild)
- Market cap: $138,787.14 mm
- Net debt: $9,340 mm (strict: total debt $14,731mm − cash & ST investments $5,391mm)
- EV: $149,210.14 mm
- Key caveats: no primary 10-K/10-Q in pool (Capital IQ export, tier 5, throughout); fully diluted share count is a weighted-average proxy; ~$16.3bn of long-term/equity-method investments (incl. a ~$4bn Delivery Hero pre-acquisition stake) excluded from net debt with an internally-inconsistent vendor treatment flagged; ~0.35% share-count variance between two Capital IQ exports (immaterial, noted)
