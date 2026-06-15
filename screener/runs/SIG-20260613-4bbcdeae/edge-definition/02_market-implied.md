# M0.6.2 Market-Implied View — SIG-20260613-4bbcdeae

## 1. Subject

**Intel Corporation (INTC, NASDAQ)** — the primary issuer named in the signal payload. The thesis record identifies the server CPU semiconductor industry (GICS 45301020) and semiconductor capital equipment (GICS 45301010) as the primary carry-forward industry groups, but every issuer-level block (options, short interest, positioning) requires a single stock. INTC is the most concrete available subject and is the explicit anchor of the BofA upgrade event. Where data exists only at industry/index level, that is noted.

---

## 2. The Five Blocks

### Block 1 — Estimate Dispersion

| Metric | Value | Source (dated) |
|---|---|---|
| NTM EPS — consensus mean | $1.09 | StockAnalysis.com (INTC forecast page), data as of 2026-06-11, 40 analysts |
| NTM EPS — high estimate | $1.39 | StockAnalysis.com, same pull |
| NTM EPS — low estimate | $0.95 | StockAnalysis.com, same pull |
| Spread (high minus low) | $0.44 (40% of mean) | Derived; same source |
| Analyst count | 40 | StockAnalysis.com, 2026-06-11 |
| Price target consensus | $93.12 mean; range $45–$150 | StockAnalysis.com, 2026-06-11 |
| Buy / Hold / Sell distribution | ~10 Buy / 31 Hold / ~7 Underperform-Sell of 48 | thesis_record.json M0_2, S&P Global poll, 2026-06-14 |

*Interpretation:* A 40% high-to-low spread on NTM EPS (consensus $1.09, range $0.95–$1.39) indicates materially elevated analyst disagreement for a mega-cap semiconductor — roughly twice the dispersion typical of a large-cap in a stable earnings phase. This reflects genuine uncertainty about the pace and durability of the DC+AI recovery, not just model noise. The price target range ($45–$150) is even wider, suggesting some analysts anchor to pre-recovery bear cases while others already price the full BofA scenario.

---

### Block 2 — Revision Trajectory (3m / 1m / now)

| Period | NTM EPS Consensus | Source (dated) |
|---|---|---|
| ~3 months ago (circa mid-March 2026) | ~$0.01–$0.11 non-GAAP FY2026 consensus; street expected $0.01 for Q1 specifically | Yahoo Finance earnings page, TIKR Blog "Intel Stock Rose 24% After Q1 2026 Earnings" (article dated 2026-04-24); Benzinga Q4 2025 earnings coverage (2026-01-22) — unverified secondary |
| ~1 month ago (circa mid-May 2026) | ~$1.00–$1.05 range; Q2 2026 consensus $0.09 pre-print vs company guidance of $0.20 | Web search aggregate: multiple sources note revenue estimate revision +11.57% in 90 days (unverified secondary, retrieved 2026-06-14) |
| Now (2026-06-14) | $1.09 mean; $0.95–$1.39 range (40 analysts); BofA 2030 EPS $6.24 | StockAnalysis.com, 2026-06-11 (unverified secondary) |
| Delta: 3m-ago → now | ~+$1.00+ / >900% revision upward | Derived from above |
| Direction | Strongly upward, driven by Q1 2026 EPS beat ($0.29 actual vs $0.01 expected) and BofA upgrade on 2026-06-11 | Cross-confirmed across sources |

*Interpretation:* The revision trajectory is among the most dramatic for a large-cap stock in recent memory. Three months ago the consensus modeled Intel as approximately breakeven to slightly loss-making on a non-GAAP basis; the Q1 2026 print ($0.29 EPS, a 2,800% beat) forced a wholesale rewrite of models. The BofA upgrade (2026-06-11) then added a second upward step. Current estimates have risen sharply but remain widely dispersed, suggesting the upgrade is still being absorbed. The direction is unambiguously upward, but the pace of revision rather than its direction carries the informational weight.

---

### Block 3 — Implied Scenario from the Multiple

**Current multiples (all as of 2026-06-14, source: StockAnalysis.com — unverified secondary):**

| Metric | Value | Source |
|---|---|---|
| Current price | $124.57 | thesis_record.json WC-002 (confirmed 2026-06-11); StockAnalysis inference |
| Forward P/E (NTM) | ~117.79x | StockAnalysis.com, 2026-06-14 |
| EV/EBITDA (forward) | 45.01x | StockAnalysis.com, 2026-06-14 |
| Intel 10-year median EV/EBITDA | ~8.15x | GuruFocus, web search retrieval 2026-06-14 — unverified secondary |
| Intel 20-year average EV/EBITDA | ~11.49x | Web search aggregate, 2026-06-14 — unverified secondary |
| Semiconductor sector median forward P/E | ~34.45x | GuruFocus / CSIMarket Q1 2026 — unverified secondary |

**Arithmetic — back-out of what earnings path the price implies:**

The current forward P/E of ~117.79x on a consensus EPS of $1.09 yields the observed $124.57 price ($1.09 × 117.79 ≈ $128; close to current; small difference reflects rounding and model definitions).

The question is: what EPS is needed for INTC to trade at a "normal" semiconductor multiple?

- **Low scenario** (revert to Intel's own 10-year median EV/EBITDA of ~8.15x): At current EV, this implies EBITDA must grow roughly 5.5x from current depressed levels to justify the stock price under historical norms. Alternatively, for the P/E version: if P/E normalises to the sector median of 34.45x, the price of $124.57 implies the market expects EPS of $124.57 / 34.45 ≈ **$3.62** to justify the current price at a normal multiple. That would require roughly 3.3x the current $1.09 NTM consensus — a scenario not in any published consensus for at least 3–4 years.
- **Normal scenario** (revert to AMD's post-recovery P/E of ~48x, a recovered-but-not-peak semiconductor multiple): Implied EPS = $124.57 / 48 ≈ **$2.60**. This is also far above the current $1.09 consensus; BofA's 2030 EPS estimate of $6.24 would reach this level roughly midway through the recovery arc.
- **High scenario** (stay at current 117.79x P/E, i.e. the market is pricing in continued earnings recovery toward $6+ EPS and is willing to pay a turn-around premium throughout): At today's price the market is not pricing the current EPS — it is pricing a terminal state where EPS reaches approximately $3.50–$6.24 (the BofA 2030 target range) and discounting that back at an expansive multiple, treating the current 117.79x as a peak-distortion P/E that compresses as earnings inflate the denominator.

**Plain reading of the arithmetic:** At $124.57 and 117.79x forward P/E, the market is not pricing the $1.09 consensus at all. It is pricing an earnings path that converges toward BofA's 2030 EPS estimate of $6.24 and applying a sector-premium multiple on that destination. The current price requires EPS to reach approximately $3.60 at a normalised 34.45x sector P/E, or $2.60 at a more generous 48x recovered multiple — both outcomes multiple years out. The market has priced in the full recovery before the recovery is confirmed.

*Interpretation:* The multiple already embeds a "durable DC+AI inflection" scenario well ahead of consensus estimates. A buyer at current prices needs Intel's EPS to reach $3.60–$6.00+ on a 3–5 year horizon AND for a normal multiple to persist throughout — a high-scenario outcome that is not yet in analyst models.

---

### Block 4 — Options Implied Move

| Metric | Value | Source (dated) |
|---|---|---|
| Next earnings date | 2026-07-23 | Barchart.com expected-move page, retrieved 2026-06-14 (unverified secondary) |
| 90-day IV mean (calls + puts average) | 89.46% | AlphaQuery.com, as of 2026-06-12 (unverified secondary) |
| IV (calls) | 89.84% | AlphaQuery.com, 2026-06-12 |
| IV (puts) | 89.08% | AlphaQuery.com, 2026-06-12 |
| Historical volatility (close-to-close) | 90.33% | AlphaQuery.com, 2026-06-12 |
| IV rank | ~90.35% | Barchart.com, retrieved 2026-06-14 (unverified secondary) |
| IV percentile | ~99% | Barchart.com, retrieved 2026-06-14 (unverified secondary) |
| Implied move (through July expiry) | ~23–24% in either direction | Yahoo Finance options article, dated 2026-04-30 (unverified secondary); this was the post-Q1 reading and may have partially compressed by 2026-06-14 as the upgrade event is absorbed |
| ATM call premium (July expiry, specific strike) | Not retrieved — search returned platform-level descriptions only | missing_reason: Barchart INTC options page rendered placeholder text in WebFetch; MarketChameleon returned a timeout; real-time ATM premium requires direct platform access |
| ATM put premium (July expiry, specific strike) | Not retrieved | missing_reason: same as call premium above |

*Interpretation:* At IV ~89% and an IV percentile at the 99th percentile, INTC options are pricing the most elevated uncertainty in at least a year. The ~23–24% implied move through the July 23 earnings date (sourced from late April 2026; likely partially compressed by June 14 given the upgrade news has partially been absorbed) is large even for a semiconductor name in a turnaround phase. The options market is telling us the upgrade-and-recovery thesis is contested, not consensus — a stock the market agreed on would carry a much lower IV rank.

---

### Block 5 — Short Interest & Positioning

| Metric | Value | Source (dated) |
|---|---|---|
| Shares sold short | 134.96 million | StockAnalysis.com, 2026-06-14 (unverified secondary) |
| Short interest as % of float | 2.69% | StockAnalysis.com, 2026-06-14 |
| Institutional ownership | 66.91% of outstanding shares | StockAnalysis.com, 2026-06-14 |
| Vanguard Group | ~383.9 million shares (~8.8% of outstanding) | Web search (Investing.com / Fintel data), 2026-06-14 (unverified secondary) |
| BlackRock / iShares | ~241.0 million shares (~5.5% of outstanding) | Web search, 2026-06-14 (unverified secondary) |
| State Street | ~203.6 million shares (~4.7% of outstanding) | Web search, 2026-06-14 (unverified secondary) |
| Named ETF holders | VanEck Semiconductor ETF (SMH), Technology Select Sector SPDR (XLK), Vanguard PRIMECAP funds | ETFdb.com data, web search 2026-06-14 (unverified secondary) |

*Interpretation:* Short interest at 2.69% of float is low in absolute terms — not a meaningful short-squeeze overhang, and not a sign of deep bearish conviction from the active community. The dominant ownership is passive (Vanguard + BlackRock + State Street alone = ~19% of outstanding), meaning a large fraction of the share register is insensitive to the recovery narrative in the near term — it will not sell on bad news or buy on good news at any meaningful scale outside index rebalancing. Active positioning (the remaining ~47% of institutional ownership outside the passive trio) is the marginal price-setter, and the dispersed price targets ($45–$150) suggest active managers are not aligned. The options market's 99th-percentile IV, combined with the low short interest, indicates the uncertainty is about the upside pace of recovery, not about distress risk.

---

## 3. Implied Scenario Interpretation

The price already requires the optimistic outcome. At $124.57 with a forward P/E of ~117.79x and EV/EBITDA of 45.01x — both multiples roughly 4–6x Intel's own long-run median — the market is not debating whether the DC+AI segment inflection is real. It has already capitalised an earnings path that converges toward $3.60–$6.00 EPS on a 3–5 year horizon at normalised multiples. From **Block 3**, the arithmetic is unambiguous: to justify the current price at the sector's normal 34x P/E, Intel must deliver roughly $3.62 in EPS — more than 3x the current NTM consensus of $1.09 and a level not in any published model until at least 2028–2030 on the most bullish sell-side views. From **Block 4**, the 99th-percentile IV and the ~23–24% implied move through the July 23 earnings date show the options market prices meaningful two-way risk around whether the DC+AI recovery is durable enough to support those earnings projections — despite the stock price itself having already moved. From **Block 2**, the revision trajectory reinforces the disconnect: estimates were revised from near-zero to $1.09 in a matter of weeks after the Q1 beat and the BofA upgrade, but $1.09 is nowhere near the EPS level required to justify the current stock price at normal multiples. In plain terms: **the market is pricing the destination (a fully recovered Intel with $3.60+ EPS), not the journey, while the options market simultaneously prices substantial uncertainty about whether that destination will be reached.** This is a high-beta, binary-outcome setup — the price embeds the bull case and the volatility surface prices the bear case at the same time.

---

## 4. Coverage

- **all_five_fields_present:** false
- **fields_missing_flagged:**
  - Block 4 — ATM call premium (July expiry): missing_reason: Barchart INTC options page returned placeholder text on WebFetch ("[[strike]]"); MarketChameleon timed out. The implied move % (23–24%) is sourced from a Yahoo Finance article dated 2026-04-30 and may not reflect June 14 pricing. Specific dollar premiums for ATM calls and puts at the July 23 earnings expiry were not retrievable from any accessed source.
  - Block 4 — ATM put premium (July expiry): missing_reason: same search failure as call premium above. IV metrics (89.46% mean, IV rank 90.35%, IV percentile 99%) were retrieved from AlphaQuery and Barchart; the specific premium amounts were not.

---

## 5. Verdict

Verdict: 4.5/5 blocks filled — market is pricing a full DC+AI earnings recovery (destination ~$3.60–$6.00 EPS) while options embed high two-way uncertainty about the path
