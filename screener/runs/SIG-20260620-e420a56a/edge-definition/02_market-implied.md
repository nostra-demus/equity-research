# M0.6.2 Market-Implied View — SIG-20260620-e420a56a

## 1. Subject

This thesis has no single primary issuer — Jio Platforms Limited is the filing entity but is not yet listed. The subject is the five carry-forward industries from M0.3, treated as a portfolio of affected listed spaces. The most concrete representative instrument available at this stage for each space is:

- **Primary 1 — Capital Markets & Investment Banking (India):** Representative listed names: Nuvama Wealth Management (NSE: NUVAMA), 360 ONE WAM (NSE: 360ONE), JM Financial (NSE: JMFINANCIL), IIFL Capital Services (NSE: IIFLCAPS). Sector average forward PE ~31x per industry data, June 2026.
- **Primary 2 — Equity Retail Brokerage & Wealth Management (India):** Representative listed name: Angel One (NSE: ANGELONE). Current stock price Rs 354.80 (22 Jun 2026), forward PE ~24.7x.
- **Primary 3 — PE & Unlisted Indian Tech / Telecom Funds (harmed):** No listed single-issuer subject at this stage. Crowding-out is a capital-flow phenomenon measured indirectly through PE/VC activity data and IPO subscription patterns.
- **Secondary 1 — Telecom Infrastructure & Tower Operators (India):** Representative listed name: Indus Towers (NSE: INDUSTOWER). Current price ~Rs 413, forward PE ~14.4x, trailing EV/EBITDA ~6.9x.
- **Secondary 2 — Incumbent Indian Telecom Operators (harmed):** Representative listed name: Bharti Airtel (NSE: BHARTIARTL). Current price Rs 1,917 (22 Jun 2026), forward PE ~30x, trailing EV/EBITDA ~11.3x.

Where a block exists only at issuer level (options, short interest) and no single-issuer representative has been selected by the engine, the block carries a `missing_reason` as noted below.

---

## 2. The Five Blocks

### Block 1 — Estimate Dispersion

**Capital Markets & Investment Banking — Nuvama Wealth Management (representative)**

| Metric | Value | Source (dated) |
|---|---|---|
| FY27 EPS — consensus | Rs 67.22 | stockanalysis.com/nse/NUVAMA/forecast, data last updated May 2026 |
| FY26 EPS — actual/consensus | Rs 56.06 | stockanalysis.com/nse/NUVAMA/forecast, May 2026 |
| FY27 EPS growth YoY | +19.9% | stockanalysis.com/nse/NUVAMA/forecast |
| Analyst count (Nuvama) | 7–8 analysts | S&P Global Market Intelligence via stockanalysis.com |
| Sector forward PE (India Capital Markets) | ~31x (average); JM Financial ~10.9x; Nuvama ~27x; 360 ONE ~38–40x | Web: simplywall.st / marketsmojo.com / companiesmarketcap.com, Jun 2026 (unverified) |

**Equity Retail Brokerage — Angel One (representative)**

| Metric | Value | Source (dated) |
|---|---|---|
| Trailing PE | 35.9x | stockanalysis.com/nse/ANGELONE, 22 Jun 2026 |
| Forward PE (NTM) | 24.7x | stockanalysis.com/nse/ANGELONE, 22 Jun 2026 |
| FY26 EPS — actual | Rs 9.85 (-22.3% YoY) | stockanalysis.com/nse/ANGELONE/forecast, 22 Jun 2026 |
| FY27 EPS — consensus | Rs 14.31 (+45.3% YoY) | stockanalysis.com/nse/ANGELONE/forecast, 22 Jun 2026 |
| Analyst count | 4 analysts (FY27) | stockanalysis.com/nse/ANGELONE/forecast, 22 Jun 2026 |
| Analyst price target (12m) | Rs 353.64 (-0.33% from current Rs 354.80) | stockanalysis.com/nse/ANGELONE, 22 Jun 2026; 11 analysts |

**Telecom Infrastructure — Indus Towers (representative)**

| Metric | Value | Source (dated) |
|---|---|---|
| FY26 EPS — consensus | Rs 27.09 | stockanalysis.com/nse/INDUSTOWER/forecast, last updated Feb 2026 |
| FY27 EPS — consensus | Rs 28.66 (+5.8% YoY) | stockanalysis.com/nse/INDUSTOWER/forecast, Feb 2026 |
| Analyst count | 25 analysts | stockanalysis.com/nse/INDUSTOWER, 22 Jun 2026 |

**Incumbent Telecom — Bharti Airtel (representative)**

| Metric | Value | Source (dated) |
|---|---|---|
| FY26 EPS — consensus | Rs 48.62 | stockanalysis.com/nse/BHARTIARTL/forecast, data last updated May 2026 |
| FY27 EPS — consensus | Rs 63.84 (+31.3% YoY) | stockanalysis.com/nse/BHARTIARTL/forecast, May 2026 |
| Analyst count | 32 analysts | stockanalysis.com/nse/BHARTIARTL, 22 Jun 2026 |
| 12-month consensus price target | Rs 2,287 (+19.4% from Rs 1,917) | stockanalysis.com/nse/BHARTIARTL, 22 Jun 2026 |
| Consensus rating | Buy (32 analysts) | stockanalysis.com/nse/BHARTIARTL, 22 Jun 2026 |

**PE / Unlisted Funds — missing_reason:** No single listed issuer covers this space. The crowding-out mechanism (HARM-002) applies to unlisted PE vehicles and pre-IPO allocation pools; no publicly traded single instrument maps to this industry at this stage in the screener pipeline.

*Interpretation:* Angel One's forward PE of 24.7x sits well below its trailing 35.9x, meaning the market is already pricing in a sharp FY27 earnings recovery (+45% EPS growth). For Airtel, 32 analysts are nearly unanimous Buy with a 19% upside target, priced into a trailing EV/EBITDA of ~11.3x. Indus Towers has far fewer bulls (consensus: Hold) despite a modest EPS growth trajectory of ~6% — the market is not giving it credit for a 5G-driven densification step-up.

---

### Block 2 — Revision Trajectory (3m / 1m / now)

**Capital Markets & Investment Banking — Nuvama (sector proxy)**

| Period | FY27 EPS estimate | Source |
|---|---|---|
| ~3 months ago (Mar 2026) | Rs 49.86 (earlier figure per search data) | Web: search result citing Nuvama EPS revision from Rs 49.86 → Rs 57.37, unverified, Jun 2026 |
| ~1 month ago (May 2026) | Rs ~57 (analyst data last updated May 14, 2026) | stockanalysis.com/nse/NUVAMA/forecast, May 2026 |
| Now (Jun 2026) | Rs 67.22 (FY27 consensus) | stockanalysis.com/nse/NUVAMA/forecast, Jun 2026 |
| Delta 3m → now | +~Rs 17 / +~34% | Derived |

Note: The 3-month-ago figure (Rs 49.86) is sourced from a search summary citing MOSL coverage (unverified, web source, labelled accordingly). The current FY27 consensus of Rs 67.22 is from stockanalysis.com (May 2026 data). The absolute revision magnitude is directionally consistent with the Jio DRHP filing date improving IB fee pipeline outlook.

**Equity Retail Brokerage — Angel One**

| Period | FY27 EPS estimate | Source |
|---|---|---|
| ~3 months ago (Mar 2026) | Not retrievable from available web sources | missing_reason: searched smart-investing.in PE history (Mar 2026 date); only trailing PE of 27.6x for 2 Mar 2026 was available, not forward EPS estimate |
| Now (Jun 2026) | Rs 14.31 | stockanalysis.com/nse/ANGELONE/forecast, 22 Jun 2026 |
| Direction | FY27 estimates marked "Upgrade" vs prior | stockanalysis.com/nse/ANGELONE/forecast, 22 Jun 2026 |

**Incumbent Telecom — Bharti Airtel**

| Period | FY27 EPS estimate | Source |
|---|---|---|
| ~3 months ago (Mar 2026) | ~Rs 50–60 range (implied from Nuvama Research rolling valuation to Sep-27E, earlier target Rs 2,200; new target Rs 2,500 post EBITDA tweak) | Web: Nuvama Research note citing +2.5%/+3.6% FY26E/27E EBITDA revision, unverified, approximate |
| Now (Jun 2026) | Rs 63.84 | stockanalysis.com/nse/BHARTIARTL/forecast, May 2026 |
| Direction | Upward — FY27 EPS consensus +31.3% growth priced; ARPU trajectory to Rs 280 by FY27 is the consensus anchor | Multiple analyst reports, web sources, Jun 2026 |

**Telecom Infrastructure — Indus Towers**

| Period | FY27 EPS estimate | Source |
|---|---|---|
| ~3 months ago / 1 month ago | No revision data available | missing_reason: stockanalysis.com forecast data last updated Feb 2026; no intra-period revision history retrieved from available web sources |
| Now (Jun 2026) | Rs 28.66 | stockanalysis.com/nse/INDUSTOWER/forecast, data last updated Feb 2026 |
| Direction | Flat to modest-upward; 25 analysts on Hold; 3-year EPS CAGR only ~7.6% | stockanalysis.com/nse/INDUSTOWER, 22 Jun 2026 |

*Interpretation:* The clearest upward revision momentum is in Capital Markets / IB (Nuvama FY27 EPS up ~34% over 3 months), consistent with an improving IPO pipeline. Angel One FY27 estimates are directionally upgraded. Airtel FY27 EPS revisions are modestly positive, anchored by ARPU growth. Indus Towers revisions are stale and nearly flat — no upgrade wave has been priced in for the 5G densification thesis.

---

### Block 3 — Implied Scenario from the Multiple

**A. Bharti Airtel (Incumbent Telecom — harmed space) — most data-complete subject**

- **Current trailing EV/EBITDA:** 11.3x (EV Rs 13.61 trillion; TTM EBITDA Rs 1.20 trillion) — stockanalysis.com/nse/BHARTIARTL, 22 Jun 2026 (unverified, labelled)
- **Sector historical norm:** India telecom sector has traded at a 10-year average of ~9x EV/EBITDA; reached ~10.5x by Sep 2025 (at +17% premium to 10-year average) — Web: businesstoday.in, Nov 2025 (unverified, labelled)
- **Sector analyst valuation anchors:** Analysts value Airtel's India mobility at 15x EV/EBITDA (Sep-27E); overall blended target ~18x on price target of Rs 2,287–2,500 — Web: Nuvama Research note / stockanalysis.com, May–Jun 2026 (unverified, labelled)

**Back-out arithmetic:**

| Scenario | Assumed NTM EV/EBITDA | Implied EBITDA (EV / multiple) | Implied EBITDA growth vs FY26 actual (Rs 121,268 cr) |
|---|---|---|---|
| Bear (10-year avg, 9x) | 9x | Rs 13,61,000 cr ÷ 9 = Rs 1,51,222 cr | +24.7% |
| Base (current, ~11.3x) | 11.3x | Rs 1,20,442 cr | ~flat to FY26 actual |
| Bull (analyst target, ~18x) | 18x | Rs 13,61,000 cr ÷ 18 = Rs 75,611 cr — does not reconcile at current EV | — |

Note: The analyst 18x target is applied to a forward (Sep-27E) base — at a forward EV of ~Rs 15 trillion (implied by Rs 2,287 target price × 5.99 billion shares + net debt ~Rs 2.9 trillion) and 18x, the implied FY28 EBITDA would be ~Rs 167,000 cr. Versus FY26 actual of Rs 121,268 cr, that implies a ~38% EBITDA step-up over two years, or roughly 17% per year compounded. FY26 YoY growth was +15.5% — so the current multiple is pricing in a continuation of the FY26 growth trajectory at 15–17% EBITDA compounding through FY28.

**Scenario read:** The current 11.3x trailing EV/EBITDA — already above the 10-year average of 9x — prices in sustained 15–17% EBITDA compounding, primarily through ARPU expansion (Rs 257 → Rs 280+ by FY27) and 5G subscriber monetisation. The priced scenario is "duopoly ARPU upgrade continues; no meaningful pricing disruption from Jio." A renewed price war or sub-market ARPU expansion would cause the multiple to revert toward 9x — a ~20% EV de-rating from current.

**B. Angel One (Retail Brokerage — beneficiary space)**

- **Current forward PE:** 24.7x on FY27 consensus EPS of Rs 14.31 — stockanalysis.com, 22 Jun 2026
- **Sector average forward PE (India Capital Markets):** ~31x — simplywall.st, Jun 2026 (unverified, labelled)
- **FY26 actual EPS:** Rs 9.85 (-22% YoY due to SEBI F&O curbs hitting revenue)

**Back-out arithmetic:**

| Scenario | Assumed forward PE | Implied EPS (current price Rs 354.80 / PE) |
|---|---|---|
| Bear (discount to sector avg, 20x) | 20x | Rs 17.74 — implies price is overvalued vs bear EPS |
| Base (current, 24.7x on FY27 EPS Rs 14.31) | 24.7x | Rs 14.37 — consistent with 45% FY27 EPS recovery |
| Bull (sector avg PE, 31x) | 31x | Rs 11.45 — would only require Rs 11.45 EPS; already beat by FY26 actual |

The market is pricing in a full FY27 earnings recovery to Rs 14.31 EPS (+45% from FY26 trough) but has not yet granted the stock the full sector-average multiple. At 24.7x, the market is paying for the recovery but applying a discount — implying residual uncertainty about the F&O volume trajectory and whether the SEBI regulatory environment stabilises.

*Interpretation:* The current Airtel multiple prices in uninterrupted ARPU compounding with no Jio pricing disruption — the Jio DRHP has not yet caused a visible multiple de-rating. Angel One's forward PE of 24.7x prices in a FY27 earnings recovery but at a discount to the sector, implying the market is not yet crediting the IPO subscription tailwind from the Jio listing pipeline.

---

### Block 4 — Options Implied Move

**missing_reason:** Searched for ATM call/put premiums and IV percentile/rank for the five representative names (BHARTIARTL, ANGELONE, INDUSTOWER, NUVAMA, 360ONE) via NiftyTrader, TradingView options chain, NSE derivatives page, and Yahoo Finance options chain (22 Jun 2026). Yahoo Finance options chain returned HTTP 503. NiftyTrader and TradingView confirmed options exist for BHARTIARTL and ANGELONE with weekly/monthly expiries, but ATM premium prices and IV percentile rank for the nearest catalyst expiry (August 2026 or September 2026, closest to expected SEBI observations letter date) were not returned in structured form from publicly accessible, non-paywalled web searches. No IV rank figure was fabricated. A broker terminal (NSE derivatives, IBKR, or Kotak Neo live options chain) is required to populate this block accurately.

---

### Block 5 — Short Interest & Positioning

**Bharti Airtel (BHARTIARTL) — Incumbent Telecom (harmed)**

| Metric | Value | Source (dated) |
|---|---|---|
| Promoter holding | 48.87% | Web: choiceindia.com shareholding pattern, Jun 2026 (unverified, labelled) |
| FII holding | 27.79% | Web: choiceindia.com, Jun 2026 (unverified, labelled) |
| DII holding | 2.43% | Web: choiceindia.com, Jun 2026 (unverified, labelled) |
| Retail | 2.68% | Web: choiceindia.com, Jun 2026 (unverified, labelled) |
| Short interest % float | missing_reason: India exchanges do not publish a standardised short interest report analogous to US FINRA data; searched NSEIndia, choiceindia, trendlyne for a dedicated short interest % figure; none returned a current figure — Indian market short data requires F&O net short positions as a proxy and is not available in the searched web sources |
| Named large passive holders | Not individually disclosed in searched sources | missing_reason: individual ETF-level holdings not disclosed in Q1 2026 shareholding filings returned by web search |

**Angel One (ANGELONE) — Equity Retail Brokerage (beneficiary)**

| Metric | Value | Source (dated) |
|---|---|---|
| Promoter holding | 28.79% | Web: choiceindia.com, Jun 2026 (unverified, labelled) |
| FII holding | 12.80% | Web: choiceindia.com, Jun 2026 (unverified, labelled) |
| Mutual funds | 16.77% | Web: choiceindia.com, Jun 2026 (unverified, labelled) |
| DII (other) | 18.88% | Web: choiceindia.com, Jun 2026 (unverified, labelled) |
| Retail / public | 39.52% | Web: choiceindia.com, Jun 2026 (unverified, labelled) |
| Short interest % float | missing_reason: same as above — no standardised Indian short interest series returned |

**Indus Towers (INDUSTOWER) — Telecom Infrastructure (beneficiary)**

| Metric | Value | Source (dated) |
|---|---|---|
| Promoter (Bharti Airtel) holding | ~50–51% | Web: trendlyne.com shareholding, Apr 2026 (unverified, labelled) |
| FII holding | ~25.9–26.4% | Web: trendlyne.com / choiceindia.com, Apr 2026 (unverified, labelled) |
| Mutual funds | ~13.7–14.0% | Web: trendlyne.com, Apr 2026 (unverified, labelled) |
| Short interest % float | missing_reason: same as above |

**PE & Unlisted Funds (harmed) — missing_reason:** No single-issuer subject at this stage; short interest and passive ownership are issuer-level data points not applicable to an unlisted industry category.

**Capital Markets / IB sector (Nuvama, 360ONE) positioning:**
No structured shareholding pattern for this block retrieved in time-stamped form for the current report. **missing_reason:** Searched screener.in, trendlyne.com, groww.in for June 2026 shareholding pattern filings for Nuvama and 360ONE; results returned general price data but not structured holder tables. Individual ETF holders and short interest remain unknown from available web sources.

*Interpretation:* Bharti Airtel's FII ownership of 27.8% is substantial relative to its ~51% promoter lock-up, meaning foreign institutional holders represent the primary marginal seller. Angel One's retail float of ~39.5% is unusually high for a capital-markets stock, suggesting the institutional base is thinner and the stock is more sensitive to retail sentiment around the IPO pipeline. High retail ownership in a brokerage stock is in effect a reflexive positioning bet — retail investors own the platform that benefits from their own subscription activity.

---

## 3. Implied Scenario Interpretation

The market, as of 22 June 2026, is pricing in a scenario of **uninterrupted duopoly compounding for Bharti Airtel and a delayed earnings recovery for retail brokerage** — but neither price yet fully discounts the Jio DRHP as a new competitive variable.

Block 3 shows that Bharti Airtel's trailing EV/EBITDA of 11.3x — already a 26% premium to the sector's 10-year average of 9x — is consistent only with 15–17% annual EBITDA compounding through FY28, driven by ARPU reaching Rs 280+ by FY27. This multiple encodes no pricing disruption from Jio: the consensus narrative is that Jio will monetise up-market (not compete on price), and the current multiple takes that as a given. A Jio IPO-funded pricing replay would require that 11.3x to compress back toward 9–10x, implying EV destruction of roughly 15–20%.

Block 1 shows Angel One's forward PE of 24.7x pricing in a 45% FY27 EPS recovery to Rs 14.31 — but at a 20% discount to the sector average of 31x. This gap says the market is paying for the recovery in brokerage volumes but not yet for the upside from a new mega-IPO subscription wave. Stated differently: the Jio listing pipeline and the resulting account-opening and subscription-commission surge is not yet in Angel One's consensus estimate (FY27 EPS of Rs 14.31 from 4 analysts, last updated June 2026). The Nuvama revision trajectory in Block 2 — FY27 EPS up ~34% over 3 months — shows that the capital markets / IB space is beginning to re-price for the pipeline, but Angel One's retail brokerage estimates have not moved comparably.

The options block (Block 4) could not be filled from available sources; it would tell us whether the options market is pricing an event-driven move around the expected SEBI observations letter window (August–September 2026). That information gap is material: if IV is elevated, the options market has already priced the event; if IV is low, options would be the cheapest way to express a directional view on the capital-markets beneficiaries. This block should be populated from a live terminal before any position is sized.

---

## 4. Coverage

- **all_five_fields_present:** false
- **fields_missing_flagged:**
  - Block 4 (Options Implied Move) — missing entirely across all five representative names. ATM premiums, implied move %, and IV percentile for the SEBI observations letter catalyst window (Aug–Sep 2026 expiry) were not available from non-paywalled web searches. Source: NiftyTrader, TradingView, NSE derivatives, Yahoo Finance (503 error), 22 Jun 2026.
  - Block 5 (Short Interest % float) — missing for all names. India exchanges do not publish a standardised short-interest series; F&O net short positions are the proxy but were not returned in the web searches. Named passive/ETF holders were not individually identified in retrieved shareholding filings.
  - Block 2 (Revision Trajectory) — Angel One 3-month-ago estimate not retrievable; Indus Towers revision history stale (last update Feb 2026). Both gaps named above in the block.
  - PE & Unlisted Funds (HARM-002) — no single-issuer subject; Blocks 1, 2, 3, 4, 5 all not applicable at this stage.

---

## 5. Verdict

Verdict: 3/5 blocks filled (Blocks 1, 2 partial, 3 filled; Block 4 missing; Block 5 partial ownership only, no short interest) — market pricing **ARPU-compounding intact for telecom, FY27 brokerage recovery partly priced, Jio IPO subscription upside not yet in estimates**
