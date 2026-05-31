# Price & Capital Structure — BG

**Company:** Bunge Global SA (NYSE: BG). **Reporting currency:** US$ (millions unless a per-share or share-count basis is stated). **Latest filing for capital structure:** Q1 FY2026 10-Q, quarter ended March 31, 2026. **Today:** 2026-06-01.

**Business type (from `00_valuation-data-triage` and `business-model/10_external-dependency`):** commodity/cyclical **Operating** company (agri-commodity processor/merchandiser). The EV bridge below is value-relevant (not informational-only as it would be for a financial or REIT issuer).

> **Single highest-value missing input:** the data pool contains **no current price** — only a stale grant-date reference ($81.39, NYSE close as of Jul-2-2025) [FY25 10-K, line 5519], ~11 months old and not usable. Per the partial-data rule this agent supplied an **indicative web-sourced** price, clearly labeled below, and the no-price caps are propagated to downstream agents (05 reverse-DCF unrunnable on observed price; 07 fair-value levels only, no observed up/downside; 99 margin-of-safety "Not assessable", valuation confidence ≤55).

---

## 1. Current Price

| Field | Value | Source | As-of Date |
|---|---|---|---|
| Current price | **$123.35** (indicative) | Web: MarketBeat quote page, last regular-session close | 2026-05-29 (3:59 PM ET close) |
| Currency | USD | NYSE listing (Trading Symbol BG) [Q1 FY26 10-Q cover, line 34] | — |
| Price basis | Last close (indicative, web-sourced — NOT from data pool) | — | Most recent close before 2026-06-01 (May 30–31 = weekend) |

**Required label (verbatim):** *Indicative price, web-sourced as of 2026-06-01, not from data pool — unverified.* The figure used is the MarketBeat last-regular-session close of **$123.35 on 2026-05-29** [Web: MarketBeat quote page, 2026-05-29 close (indicative, unverified)].

**Corroboration / range check (two independent web sources):**
- MarketBeat: $123.35 close, 2026-05-29; reported market cap $23.93B; shares outstanding 194,018,000 — this share count matches the 10-Q cover page (194,018,115) exactly, which supports the source's data integrity [Web: MarketBeat, 2026-05-29 (indicative, unverified)].
- CNBC/search aggregate: ~$126.50 intraday, prior close $126.19, market cap ~$24.5B; 52-week range $71.60–$133.93 [Web: search/CNBC quote, 2026-06-01 (indicative, unverified)].
- The two sources bracket a **~$123–126** indicative range. This agent anchors on the **lower, precisely-dated MarketBeat close ($123.35, 2026-05-29)** per the module's conservative default; downstream agents should treat the price as an indicative ~$123–126 band, not a precise figure, and the no-price caps still bind because no pool-sourced price exists.

---

## 2. Share Count

| Field | Value | Source |
|---|---:|---|
| Basic shares outstanding (as-of) | 194,018,115 | Q1 FY26 10-Q cover page, as of Apr-27-2026 [10-Q, line 48] |
| Registered shares issued & outstanding (balance-sheet date) | 194,015,131 | Q1 FY26 10-Q balance sheet, as of Mar-31-2026 [10-Q, line 219] |
| Basic weighted-average shares (Q1 FY26) | 193,753,107 | Q1 FY26 10-Q Note 18 [10-Q, line 1611] |
| Diluted weighted-average shares (Q1 FY26) | 195,733,665 | Q1 FY26 10-Q Note 18 [10-Q, line 1614] |
| Dilutive stock options & awards (Q1 FY26) | 1,980,558 | Q1 FY26 10-Q Note 18 [10-Q, line 1613] |
| Anti-dilutive / contingent RSUs excluded | <1,000,000 (not dilutive) | Q1 FY26 10-Q Note 18, footnote (1) [10-Q, line 1620] |
| Convertibles / potential shares | None (no convertible debt outstanding) | Q1 FY26 10-Q Note 13 (Debt) — all instruments are term loans / senior notes / short-term debt, no convertible line [10-Q, lines 1356–1393] |
| Preferred equity | None outstanding | No preferred/preference instrument on the balance sheet or in Note 17 (Equity); only a generic cash-flow caption references "preference shareholders" [10-K, line 4868] |
| **Fully diluted shares (TSM + if-converted)** | **195,733,665** | Diluted WA from Note 18 — no in-the-money converts to add; equals diluted WA |
| Share count used for **market cap** | **194,018,115** (cover-page, Apr-27-2026) | Per Fully-Diluted Equity Rule 1 (most recent "as of" shares, not period WA) |
| Share count used for **per-share fair value** | **195,733,665** (diluted WA) | Per Fully-Diluted Equity Rule 2 (fully diluted; TSM already embedded in Note 18 diluted) |

**Share Count Reconciliation Table (per MODULE_RULES Fully-Diluted Equity Rule 3):**

| Step | Shares | Source |
|---|---:|---|
| Basic weighted-average (Q1 FY26) | 193,753,107 | 10-Q Note 18, line 1611 |
| + Dilutive stock options & awards (TSM) | 1,980,558 | 10-Q Note 18, line 1613 |
| + In-the-money convertibles (if-converted) | 0 | None outstanding (Note 13) |
| **= Fully diluted shares used (per-share fair value)** | **195,733,665** | 10-Q Note 18, line 1614 |

**Notes:**
- **Basic-to-diluted gap is immaterial:** dilutive options/awards add 1,980,558 shares, ≈1.0% of basic. There is no convertible overhang and no preferred. The market-cap count (194,018,115 cover) and the per-share fair-value count (195,733,665 diluted WA) differ by ~1.7M shares (≈0.9%) — small, but each is used for its correct purpose: the cover-page "as-of" count for market cap (it is the current share base), the diluted weighted-average for per-share fair value (it embeds the treasury-stock-method dilution).
- **Treasury shares:** 14,496,632 shares held in treasury at cost ($967M) at Mar-31-2026 [10-Q balance sheet, line 223]; these are excluded from outstanding/diluted counts above (correctly not double-counted).
- **Post-Viterra base:** the Viterra acquisition (closed mid-2025) issued 65.6M new registered shares on Jul-2-2025, lifting the diluted weighted-average ~44% (FY24 142.2M → Q1'26 195.7M); the current share base above already reflects the full post-deal count [earnings/01_historical-financials §6; FY25 10-K Note 2].
- **Limitation:** option strike-by-strike detail is not separately tabulated here, but it is unnecessary — the 10-Q Note 18 already applies the treasury-stock method to reach the diluted figure, so the fully-diluted count is filing-sourced, not estimated.

---

## 3. Market Capitalization

**Formula:** `Market cap = share count × current price`

- Market cap = **194,018,115 shares × $123.35** = **$23,932M ≈ $23.93B**
  - Using the indicative MarketBeat close (2026-05-29). [Shares: 10-Q cover, Apr-27-2026, line 48. Price: Web: MarketBeat close 2026-05-29 (indicative, unverified).]
  - **Independent tie-out:** MarketBeat itself reports market cap **$23.93B** [Web: MarketBeat, 2026-05-29] — matches the calculation to rounding, confirming arithmetic.
- Sensitivity to the indicative-price band: at the higher ~$126.50 search level, market cap ≈ $24.5B; at $123.35, ≈ $23.93B. **Indicative market-cap band ≈ $23.9–24.5B.**
- On the diluted weighted-average count (195,733,665) at $123.35, market cap = $24,144M ≈ $24.14B — shown for reference; the cover-page count is the canonical market-cap basis.

> Because the price is web-sourced (not pool-sourced), this market cap is **indicative only**. It is the best available anchor but carries the no-price caveat to all downstream agents.

---

## 4. Enterprise Value Bridge

All capital-structure components are from the **Q1 FY2026 10-Q balance sheet (Mar-31-2026)** unless noted. Market cap is indicative (Section 3).

| Component | Amount (US$M) | Source |
|---|---:|---|
| Market capitalization (indicative) | 23,932 | Section 3 (194,018,115 × $123.35) |
| + Total debt (short-term + current LTD + long-term) | 14,553 | 10-Q Note 13, line 1393 (= 3,245 + 1,361 + 9,947) |
| + Minority / non-controlling interest | 1,381 | 10-Q balance sheet, line 225 (Noncontrolling interests) |
| + Redeemable non-controlling interest | 51 | 10-Q balance sheet, line 216 |
| + Preferred equity | 0 | None outstanding (Section 2) |
| − Cash & equivalents | (839) | 10-Q balance sheet, line 187 |
| **= Enterprise value (EV), base** | **39,078** | Sum of the above ≈ **$39.08B** |

**Arithmetic shown:** 23,932 + 14,553 + 1,381 + 51 − 839 = **39,078**.

**Alternative EV netting short-term investments** (the $760M of marketable securities & other short-term investments in Other current assets — foreign government & corporate debt securities, CDs/time deposits, that the module standard permits treating as cash-like) [10-Q Note 6, line 755, 772–781]:
- EV = 39,078 − 760 = **38,318M ≈ $38.32B**.
- This agent presents the **base EV ($39.08B, cash-only)** as canonical (conservative — higher EV) and the **$38.32B** as the cash-plus-ST-investments alternative. Downstream agents should pick one consistently and label it; both are sourced.

**EV bridge ties (Reconciliation Gate 2):** `EV = market cap + total debt + minority + redeemable minority + preferred − cash`, no plug. Total debt ties to Note 13's reported $14,553M exactly. Only market cap is indicative (price-driven).

**Adjustments NOT made — named explicitly:**
- **Operating lease liabilities (NOT added):** current $501M + non-current $1,135M = $1,636M of operating-lease obligations [10-Q balance sheet, lines 208, 214]. Not added to EV because the EBITDA/EBIT base used by downstream multiples agents is post-ASC 842 (rent in operating costs is already largely capitalized on-balance-sheet under current GAAP) and the company does not present a lease-adjusted EV; adding them would require a matching EBITDAR. Flagged so an agent that uses pre-IFRS-16-style metrics can add ~$1.64B if needed.
- **Pension / other long-term obligations (NOT added):** "Other non-current liabilities" of $1,148M [10-Q line 215] include pension and other items; no separately-disclosed *underfunded* pension figure is in the Q1 10-Q to quantify an EV add-on (the FY25 pension settlement charge is a P&L item, not a balance-sheet net liability disclosed here). Not added; would require the FY25 10-K pension note to size.
- **Equity-method investments (NOT netted):** Investments in affiliates $1,276M [10-Q line 198] are left **inside** EV (not subtracted). The SOTP agent (`06`) may elect to net these when valuing the consolidated operating business separately; flagged for consistency. If netted, EV would fall by $1,276M to ~$37.8B (cash-only) — do this only if the affiliate earnings are also excluded from the EBITDA base.
- **Trade structured finance / time deposits offset:** $102M time deposits and $102M LC obligations net to zero on-balance-sheet and are excluded [10-Q balance sheet, lines 188, 206; Note 3].

---

## 5. Net Debt & Leverage Snapshot

| Metric | Value (US$M) | Source |
|---|---:|---|
| Total debt | 14,553 | 10-Q Note 13, line 1393 |
| Cash & equivalents | 839 | 10-Q balance sheet, line 187 |
| Marketable securities & ST investments (memo) | 760 | 10-Q Note 6, line 755 |
| **Net debt (total debt − cash & equivalents)** | **13,714** | 14,553 − 839; ties to earnings/01_historical-financials §2 [k] |
| Net debt (also less ST investments, memo) | 12,954 | 14,553 − 839 − 760 |
| Net debt / FY25 GAAP-built EBITDA | **6.13x** | 13,714 / 2,236 (EBITDA = Total EBIT + D&A) [earnings/01 §1] |
| Net debt / TTM GAAP-built EBITDA | **5.83x** | 13,714 / 2,354 [earnings/01 §2] |
| Net debt / TTM **adjusted** EBITDA (memo) | **4.49x** | 13,714 / 3,054 (CapIQ adjusted-EBITDA quarters Q2'25–Q1'26) [earnings/01 §3] |

**Net debt definition:** `total debt − cash and equivalents`, per the root standard. Bunge does not publish a single "net debt" caption; the $13,714M figure is reproduced from the filing balance sheet and matches the earnings module's extraction exactly (anchor-consistency check passes). The ST-investments-inclusive figure ($12,954M) is shown as a memo because $760M of marketable securities/CDs are cash-like, but the canonical net-debt figure stays at the conservative cash-only $13,714M.

**Leverage flag (no judgment — fact):** net debt jumped from $2,927M (Dec-31-2024) to $13,714M (Mar-31-2026), and ND/EBITDA from ~1.3x to ~5.8x (GAAP-built), driven by the Viterra acquisition ($4,201M cash + assumed debt) [earnings/01 §6]. The EBITDA denominator is itself volatile/mark-to-market-distorted (Section caveat carried from earnings/01 §4), so the leverage ratio swings with the basis chosen — stated in full so downstream agents pick a basis explicitly.

---

## 6. Per-Share Reference Values

Per-share values use the **diluted weighted-average count (195,733,665)** as the per-share-fair-value basis (Section 2). Price is indicative.

| Metric | Per Share (US$) | Source / Formula |
|---|---:|---|
| Book value per share | **$81.97** | Total Bunge shareholders' equity $16,045M ÷ 195,733,665 [10-Q balance sheet, line 224] |
| Tangible book value per share | **$63.61** | (Equity $16,045M − goodwill $3,291M − intangibles $304M = $12,450M) ÷ 195,733,665 [10-Q lines 196, 197, 224] |
| Net debt per share | **$70.06** | Net debt $13,714M ÷ 195,733,665 (company is net-debt, not net-cash) |
| Memo: BVPS on cover-page shares (194,018,115) | $82.70 | $16,045M ÷ 194,018,115 |
| Memo: TBVPS on cover-page shares | $64.17 | $12,450M ÷ 194,018,115 |

**Notes:** equity excludes the $1,381M of noncontrolling interests (book value is the parent's $16,045M, not total equity $17,426M) [10-Q lines 224–226]. The indicative price (~$123) sits **above** book value per share (~$82) and well above tangible book (~$64); this is stated as a fact for downstream agents, not a valuation judgment.

---

## 7. Anchor Summary (canonical numbers for downstream agents)

Use these verbatim. The price is **indicative/web-sourced** — every downstream agent must propagate that caveat, and the no-current-price caps remain in force (margin of safety "Not assessable"; valuation confidence ≤55; reverse-DCF cannot solve on an observed price; scenario agent outputs fair-value levels with no observed up/downside %).

- **Current price:** **$123.35** — *Indicative price, web-sourced as of 2026-06-01, not from data pool — unverified* (MarketBeat last close 2026-05-29; corroborating band ~$123–126.50). **NOT a pool-sourced price.**
- **Currency:** USD; capital structure as of Mar-31-2026 (Q1 FY26 10-Q).
- **Shares — market cap basis:** **194,018,115** (10-Q cover, as of Apr-27-2026).
- **Shares — per-share fair-value basis:** **195,733,665** (diluted WA, 10-Q Note 18).
- **Market cap (indicative):** **$23,932M (~$23.9B)**; band ~$23.9–24.5B across the price range.
- **Total debt:** **$14,553M** (10-Q Note 13).
- **Cash & equivalents:** **$839M**; ST investments memo **$760M** (10-Q Note 6).
- **Net debt:** **$13,714M** (cash-only); memo $12,954M including ST investments.
- **Enterprise value (indicative):** **$39,078M (~$39.1B)** base (cash-only); alternative $38,318M (~$38.3B) if ST investments netted.
- **NCI / redeemable NCI in EV:** $1,381M / $51M. **Preferred:** none. **Convertibles:** none.
- **Book value / share:** ~$81.97; **tangible BV/share:** ~$63.61.
- **Net debt / EBITDA:** ~5.8–6.1x (GAAP-built); ~4.5x (adjusted) — basis-dependent, choose explicitly.

### Anchor Block (copy-forward)

- Price: $123.35 (2026-05-29, last close — INDICATIVE, web-sourced, not from data pool — unverified; band ~$123–126.50)
- Currency: USD
- Shares (market cap): 194,018,115 (10-Q cover, Apr-27-2026)
- Shares (per-share fair value): 195,733,665 (10-Q Note 18 diluted WA; fully diluted — no converts/preferred)
- Market cap: $23,932M (~$23.9B; indicative; band ~$23.9–24.5B)
- Net debt: $13,714M (total debt $14,553M − cash $839M; memo $12,954M incl. ST investments)
- EV: $39,078M (~$39.1B, cash-only base; alt $38,318M if ST investments netted) — indicative (market-cap leg price-driven)
- Key caveats: **No pool-sourced price — current price is indicative/web-sourced; no-price caps bind (MoS Not assessable, valuation confidence ≤55, reverse-DCF unrunnable on observed price, no observed up/downside).** Leverage ratio is basis-dependent on a mark-to-market-distorted EBITDA. EV excludes operating leases (~$1,636M), undisclosed net pension, and does not net equity-method investments (~$1,276M) — each flagged for the agent that needs it.
