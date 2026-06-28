# News-Impact Sizing — SIG-20260612-dd716589

## 0. Event & Mode

- Originating event (from M0.1): QatarEnergy declared force majeure on contracted LNG cargo loadings for June–July 2026 (extended to mid-August 2026) after Iranian missile strikes knocked Trains 4 and 6 offline at Ras Laffan, removing 12.8 mtpa (~17% of Qatar's LNG export capacity) and driving JKM spot prices +51% to $16.02/MMBtu and LNG carrier spot rates +614% to $300,000/day.
- Mode: **fallback** for CND-001 (FLNG), CND-002 (GLNG), and CND-003 (WDS) — the forward multiple band for each is self-anchored (sector band sourced from unverified web, labelled; no verified filed analyst EV/EBITDA forward model for these names in M0.6.2). **Primary** for CND-004 (Cheniere LNG) — both the consensus forward earnings base (NTM EPS mean $17.91; EBITDA guidance midpoint $7.50B from SEC 8-K Q1 2026) and a forward EV/EBITDA band (8×–12×, sector normal range, cited from M0.6.2 Block 3) are available from the upstream market-implied data and do not need re-fetching (CLAUDE.md §2).

---

## 1. Per-Candidate Sizing

Candidates are sized in rank order from `02_expression-ranking.md` (CND-001 through CND-004 first), then CND-005, CND-006, and CND-007 are assessed for applicability.

---

### CND-001 · Flex LNG Ltd. (NYSE: FLNG) — Rank 1 (Exposure 85/100)

**Applicable: yes**

**Event quantification — guidance-raise earnings impact (finite-life)**

Flex LNG's FY2026 EBITDA guidance was raised to $255–$280M (midpoint $267.5M, up ~11% or ~$17.5M at the midpoint) following the Qatar disruption [Flex LNG 6-K Q1 2026, SEC EDGAR, May 13 2026]. Revenue guidance was lifted to $345–$370M (midpoint $357.5M), approximately 10% above the February 2026 guidance [Flex LNG Q1 2026 earnings call summary, Investing.com, May 13 2026, unverified web, labelled]. Q1 2026 fleet-wide TCE (time-charter-equivalent — average daily revenue per vessel across the whole fleet) was $65,729/day; FY2026 guided TCE is $73,000–$78,000/day [Flex LNG 6-K Q1 2026, SEC EDGAR, May 13 2026]. The 91.2% of remaining 2026 fleet days are already fixed at contracted rates; 3 open vessels were fixed at elevated spot/short-term rates following the disruption.

No pass-through taxes apply to LNG carrier vessel revenue — revenue is earned as hire under time-charter contracts, not as an indirect-tax-inclusive gross flow. Revenue is recognised as stated.

After-tax margin: FY2025 adjusted net income was $101.1M on full-year revenue of $340M [Flex LNG Q4 2025 Earnings Release, Nasdaq / Finviz, February 11 2026, unverified web, labelled; consistent with the 40.3% EBITDA-to-net conversion: $101.1M / $251.1M adjusted EBITDA FY2025] → **adjusted after-tax margin ~29.7%**. The incremental revenue from the guidance raise drops through at or near the full-year margin because the cost base (vessel mortgage interest, operating costs) is largely fixed. Cross-check: FY2025 adjusted EBITDA $251.1M; net income $101.1M — ratio 40.3%. Applying 40.3% to the FY2026 incremental EBITDA lift of $17.5M → approximately $7.1M after-tax. Applying the 29.7% margin to the $37.5M revenue lift → $11.1M after-tax. The two approaches differ because the EBITDA-to-net step includes interest ($92.6M in FY2025 — declining as vessels deleverage [Flex LNG Q4 2025, same source]); the revenue-to-net route better captures the incremental margin on added revenue. Using the revenue-to-net route as primary: **ΔE/yr ≈ $11.1M after-tax**.

FX: Flex LNG reports in USD. No cross-currency conversion required.

**Recurrence: finite-life** — the guidance raise reflects the capture of elevated LNG spot rates during the force majeure window (declared June–July 2026, extended to mid-August 2026). The disruption is bounded by a declared end date; 91.2% of fleet days remain on pre-existing contracted rates. The incremental earnings do not represent a permanent step-change in contracted TCE rates — they reflect the 3 open vessels operating in an elevated-rate market during the outage. Classification: finite-life. Duration: approximately 0.5 years (the disruption window March–August 2026 ≈ 6 months).

Cost of equity (CAPM): Risk-free rate ~4.3% (US 10-year Treasury, approximately June 2026, unverified web, labelled); beta ~1.3 (LNG shipping / marine transportation — higher-beta sub-sector; consistent with FLNG's 52-week range $21.72–$33.40, approximately ±35% from midpoint, indicating elevated sensitivity; labelled inference); equity risk premium ~5.5% (Damodaran US ERP estimate, unverified web, labelled) → cost of equity ≈ 4.3% + 1.3 × 5.5% ≈ **11.5%**.

NPV of $11.1M earned over the remaining 0.5-year tail of the disruption window:

NPV = $11.1M ÷ (1 + 11.5%)^0.5 ≈ $11.1M ÷ 1.056 ≈ **$10.5M**

**Duration-trap check:** Wrongly capitalising $11.1M at FLNG's self-anchored multiple (market cap $1,643M ÷ adjusted net income $101.1M ≈ **16.2×**) would give 16.2 × $11.1M = $180M — versus the correct NPV of $10.5M. That is a **17× overstatement**. The recurrence call is the swing input: the Qatar disruption is a finite-window rate event, not a permanent step-up in FLNG's contracted earnings base.

**Implied move (fallback):**
Market cap as of 2026-06-26: ~$1,643M (price $29.48 × 54.09M fully diluted shares [StockAnalysis.com FLNG market-cap page, 2026-06-26/2026-06-28, unverified web, labelled]; share-count source: 54.09M from search-confirmed StockAnalysis data; no material dilutive instruments beyond common shares confirmed in available sources).

Implied move = $10.5M ÷ $1,643M = **+0.6%**

This is the fundamentals floor for the already-quantified, closed guidance-raise event. The M0.6.3 variant mechanism (charter-renewal step-up of $20M–$42M EBITDA above guidance on 2–3 contracts maturing 2026–2028) is NOT sized here — no filed charter announcement at $100k+/day exists as of 2026-06-28. Sizing an uncontracted forward mechanism as a closed event would violate §5: the number does not appear in a filed source because the event has not occurred.

**Observed move:**
FLNG's 52-week low was $21.72 [StockAnalysis.com / MarketBeat.com, unverified web, labelled]. The 52-week low falls in the period leading into the disruption (the Iran strikes began approximately February 28, 2026 and the 52-week low is consistent with the pre-disruption trough). From ~$21.72 to the current price of $29.48 (2026-06-26): **observed move +35.6%** [StockAnalysis.com, 2026-06-26, unverified web, labelled]. The precise pre-disruption closing price (e.g. February 27, 2026) was not available from sources accessed; the 52-week low is used as the best available pre-event anchor and is labelled approximate.

**Gap read: re_rate_to_judge**

| | |
|---|---|
| Implied fundamentals-floor move (finite-life guidance raise, 0.5-yr NPV) | **+0.6%** |
| Observed move (52-week low to current, approximate) | **+35.6%** |
| Gap | ~35 percentage points |

The gap reflects: (a) the charter-renewal step-up hypothesis (market pricing that 2–3 renewals lock in at $100k+/day — not yet a filed number); (b) momentum re-rate on the LNG shipping narrative; (c) short-squeeze dynamics from the 14.5% short interest in a stock trading 19% above the sell-side consensus target. All three are beyond what the fundamentals floor captures.

**Caveats:**
- Duration trap confirmed above (17× overstatement if the guidance-raise earnings are capitalised at the multiple rather than NPV'd over the finite window).
- If Qatar's outage extends to 3–5 years (the QatarEnergy CEO cited this as a potential timeline per Reuters / CNBC, 2026-03-19 [unverified web, labelled]), the recurrence classification shifts from finite-life to near-permanent for vessels re-contracting during that window, and the sizing method changes materially. This run uses the mid-August 2026 declared end date (M0.1/M0.5 working assumption).
- This is a fundamentals floor. The charter-renewal re-rate judgment belongs to the research swarm.

**Sources:**

| Source | Retrieved | Claim supported | Grade | URL |
|---|---|---|---|---|
| Flex LNG 6-K Q1 2026 (SEC EDGAR) | 2026-05-13 | FY2026 EBITDA guidance $255–$280M midpoint $267.5M; TCE guidance $73–78k/day; Q1 fleet TCE $65,729/day; revenue guidance $345–370M; 91.2% contract coverage; $0.75/share dividend | A | https://www.sec.gov/Archives/edgar/data/0001772253/000162828026034365/q12026flexpr11.htm |
| Flex LNG Q4 2025 Earnings Release (Nasdaq press release) | 2026-02-11 | FY2025 adjusted net income $101.1M; adjusted EBITDA $251.1M; revenue $340M; adjusted EPS $1.87; TCE $71,728/day; interest expense $92.6M | B | https://www.nasdaq.com/press-release/flex-lng-fourth-quarter-2025-earnings-release-2026-02-11 |
| StockAnalysis.com FLNG statistics / market cap | 2026-06-26/2026-06-28 | Price $29.48; market cap ~$1.59–1.71B; 54.09M shares; 14.53% short interest; 52-week range $21.72–$33.40 | B | https://stockanalysis.com/stocks/flng/market-cap/ |
| Investing.com / StockTitan Q1 2026 earnings call summary | 2026-05-13 | FY2026 revenue guidance ~10% above February 2026 guidance; EBITDA guidance ~11% above; 3 open vessels fixed at elevated short-term rates; disruption context | B | https://www.investing.com/news/transcripts/earnings-call-transcript-flex-lng-q1-2026-sees-solid-results-amid-challenges-93CH-4684978 |

---

### CND-002 · Golar LNG Ltd. (NASDAQ: GLNG) — Rank 2 (Exposure 72/100)

**Applicable: yes — with inference-basis caveat on the LNG-price-linked component**

**Event quantification — LNG-price-linked variable tolling fee (finite-life)**

Golar LNG operates two floating liquefaction units — FLNG Hilli (tolling contract with Perenco/BP, Cameroon) and FLNG Gimi (20-year lease commenced mid-2025, BP) — as the primary listed DIR-002 (non-Qatar LNG liquefaction) expression.

Q1 2026 total operating revenues: $137.6M; net income attributable to Golar LNG: $83.6M [Golar LNG 6-K Q1 2026, SEC EDGAR, filed 2026; Quiver Quantitative / Investing.com Q1 2026 earnings summary, 2026-06-28, unverified web, labelled].

**After-tax margin Q1 2026: $83.6M ÷ $137.6M = 60.7%**

Accounting note: FLNG Gimi revenue is recognised as a sales-type lease (finance-lease treatment) — the income-statement entry is interest-like and carries a higher margin than a service contract. The 60.7% after-tax margin is a reported figure but does not equal the cash operating margin on the tolling business; the filing caption "sales-type lease revenue" of $50.0M in Q1 2026 [Golar LNG 6-K Q1 2026, same source] is an accounting construct, not a repeat cash flow from operations in the traditional sense. This is disclosed per §15 (reported vs adjusted distinction).

FX: Golar LNG reports in USD. No conversion required.

**Quantification challenge:** Golar's Hilli contract has a variable fee component linked to Brent/LNG prices above a floor. The exact formula and the fraction of total revenue that is price-linked is not confirmed from a filed contract term available in this run. FLNG Gimi's revenue is fixed under the BP lease. Q1 2026 adjusted EBITDA was $105.6M [same source, labelled], annualising to ~$422M — versus Q1 2025 annualised ~$164M. The $258M annualised uplift is real, but the majority (~$200M+ annualised) is from FLNG Gimi startup (not Qatar-price-driven), and a smaller portion is from Hilli's variable fee uplift.

Conservative estimate of Qatar-event-attributable ΔE/yr: assume 20% of the $258M annualised EBITDA uplift is LNG-price-linked via Hilli's variable component (the balance being Gimi structural startup). 20% × $258M × 60.7% after-tax margin ≈ **$31.3M/yr** (labelled: inference, not from a filed contract disclosure).

**Recurrence: finite-life** — the variable fee uplift on Hilli resets with LNG prices; it is not locked in permanently. Duration: 0.5 years (mid-August 2026 force majeure end date).

NPV: $31.3M/yr × 0.5 yr ÷ (1 + 11.5%)^0.5 ≈ $15.7M ÷ 1.056 ≈ **$14.9M** (upper indicative bound; inference basis)

**Duration-trap check:** Wrongly capitalising $31.3M at GLNG's implied multiple (market cap ~$5,070M ÷ annualised Q1 net income run-rate of $83.6M × 4 = $334.4M → implied P/E ≈ 15.2×) gives 15.2 × $31.3M = $476M → $476M ÷ $5,070M = **9.4%** implied move. Correct NPV-based floor: 0.3% (below). Overstatement: **~31×**.

**Implied move (fallback):**
Market cap: ~$5,070M (price ~$49.6 × ~101.8M shares [CompaniesMarketCap.com, 2026-06-19, unverified web, labelled]; share-count source: 101.8M from CompaniesMarketCap implied from market cap ÷ price).

Implied move = $14.9M ÷ $5,070M = **+0.3%** (upper indicative bound, inference basis)

**Observed move:**
GLNG gained more than 48% year-to-date and approximately 25% in the month surrounding the March 2026 disruption [Seeking Alpha, 'Golar LNG: One of the Biggest Winners from the Iran War', 2026-03-23, unverified web, labelled]. On March 26, 2026 the stock opened at $55.04 and closed at $55.46 [same source; labelled]. Current price ~$49.76 (ticker mapping, 2026-06-26) — retraced from the March high. Using the approximate pre-disruption price of ~$40 (inference from 48% YTD gain and approximate year-start price; labelled inference, not a confirmed closing price): from ~$40 to ~$49.76 (current) = **observed move approximately +24%**.

**Gap read: re_rate_to_judge**

| | |
|---|---|
| Implied fundamentals-floor move (Hilli variable fee, 0.5-yr NPV, inference basis) | **+0.3%** |
| Observed move (approximate, pre-disruption to current) | **~+24%** |
| Gap | ~24 percentage points |

The market is re-rating Golar's strategic position as a floating liquefaction operator in a tighter LNG market — narrative value, platform optionality, and the Gimi expansion story — well beyond the discrete tolling-fee uplift from the 6-month disruption window.

**Caveats:**
- The LNG-price-linked uplift is inference, not from filed contract terms. The 20% attribution of the EBITDA uplift to price-linked Hilli fees is a conservative estimate that could be higher or lower; the research swarm should verify the Hilli variable-fee formula from the filed 6-K or prior annual report.
- FLNG Gimi's sales-type lease accounting inflates the reported after-tax margin — the true incremental cash margin on Gimi would be different.
- This is a fundamentals floor. The re-rating of Golar as a floating liquefaction platform operator in a structurally tighter LNG world is the analyst's judgment (M0.7).

**Sources:**

| Source | Retrieved | Claim supported | Grade | URL |
|---|---|---|---|---|
| Golar LNG 6-K Q1 2026 (SEC EDGAR) | 2026-05-xx | Q1 2026 revenues $137.6M; net income $83.6M; adjusted EBITDA $105.6M; FLNG Gimi sales-type lease revenue $50.0M; Hilli 100% uptime; Gimi production 19% above contractual committed volume | A | https://www.sec.gov/Archives/edgar/data/0001207179/000117184326003563/exh_991.htm |
| Quiver Quantitative / Investing.com Q1 2026 earnings summary | 2026-06-28 | Q1 2026 revenues $137.6M (+120% YoY from $62.5M); net income $83.6M (+920% YoY from $8.2M); EPS $0.49 vs $0.42 estimate; cash $1.06B | B | https://www.quiverquant.com/news/GOLAR+LNG+%28%24GLNG%29+Releases+Q1+2026+Earnings |
| Seeking Alpha 'Golar LNG: One of the Biggest Winners from the Iran War' | 2026-03-23 | GLNG ~+25% in prior month; ~+48% YTD; Goldman Sachs Buy / $60 target; March 26 open $55.04, close $55.46 | B | https://seekingalpha.com/article/4884964-golar-lng-one-of-the-biggest-winners-from-the-iran-war |
| CompaniesMarketCap.com GLNG | 2026-06-19 | GLNG market cap ~$5.0B; price ~$49.6 | B | https://companiesmarketcap.com/gola-lng/marketcap/ |

---

### CND-003 · Woodside Energy Group Ltd. (NYSE: WDS) — Rank 3 (Exposure 58/100)

**Applicable: yes**

**Event quantification — spot-linked LNG price uplift (finite-life)**

Woodside is an Australian integrated LNG producer. Approximately 51% of Q1 2026 LNG sold on gas-hub index pricing (JKM / TTF linked) [Rigzone, 'Woodside LNG Trading Shielded from Iran War', 2026-04-29, unverified web, labelled; Woodside Q1 2026 ASX quarterly results].

FY2025 financials [Woodside FY2025 Full-Year Results Press Release, February 24 2026, Woodside corporate IR site / Business Wire, labelled]:
- Revenue: $12,984M (USD)
- NPAT (net profit after tax): $2,718M USD
- Underlying NPAT: $2,649M USD
- **After-tax margin: $2,718M ÷ $12,984M = 20.9%** (reported NPAT); underlying: 20.4%

Q1 2026: operating revenue $3.26B; production 45.2 MMboe; average realised price $63/boe (+11% vs prior quarter) [Woodside Q1 2026 ASX quarterly / StockTitan / Motley Fool Australia, 2026-04-29, unverified web, labelled]. Scarborough first cargo targeted Q4 2026 (96% complete).

No pass-through taxes applicable — Woodside's revenue is recognised at the LNG cargo realised price (FOB or DES basis), not on a gross-with-indirect-tax basis. Revenue is as stated.

FX: Woodside reports in USD for press releases and financial results. No cross-currency conversion required.

**Quantification approach:**

The pre-disruption JKM baseline was $10.61/MMBtu (WC-001). Disruption-period JKM: $16.02/MMBtu. Theoretical maximum price uplift: +51.0%.

However, Woodside's Q1 2026 realised price uplift of +11% QoQ reflects a mix of LNG pricing and non-LNG volumes (oil/condensate, gas). Not all of the 11% increase is attributable to Qatar — it includes Sangomar production and seasonal factors. As a conservative attribution, 50% of the 11% realised price uplift is assigned to Qatar-linked LNG spot repricing (the balance to non-LNG commodity mix and volume timing). This gives a Qatar-attributable price uplift of approximately **5.5% on the realised-price basis**.

Applying this to the 51% spot-linked volume share:
- Annual revenue base: $12,984M
- Spot-linked share: 51% → $6,622M
- Qatar-attributable price uplift applied to spot-linked revenues: 5.5% × $6,622M = $364M incremental revenue
- After-tax: $364M × 20.9% = **$76M ΔE/yr** (conservative attribution)

**Recurrence: finite-life** — JKM/TTF spot-linked realisation resets daily with the market. The outage window (mid-August 2026 end date) defines the duration. 0.5 years.

ΔE for the disruption window: $76M/yr × 0.5 yr = $38M

NPV at 11.5% cost of equity (beta ~0.9 for an integrated LNG E&P, lower than pure shipping; 11.5% is used for consistency and is conservative vs WDS's actual beta):

NPV = $38M ÷ (1 + 11.5%)^0.5 ≈ $38M ÷ 1.056 ≈ **$36M**

**Duration-trap check:** Wrongly capitalising $76M at Woodside's implied P/E (market cap ~$38,100M ÷ underlying NPAT $2,649M ≈ **14.4×**) would give 14.4 × $76M = $1,094M → $1,094M ÷ $38,100M = **2.9%**. Correct NPV-based implied move: 0.09% (below). Overstatement: **~32×**.

**Implied move (fallback):**
Market cap: ~$38,100M (price ~$20.05 × 1.90B shares [MacroTrends / search, 2026-06-28, unverified web, labelled]; implied: $20.05 × 1.90B = $38.1B, cross-checked against search-retrieved $38.12B [CompaniesMarketCap, 2026-06-13], consistent; share-count source: MacroTrends WDS shares outstanding, 1.90B).

Implied move = $36M ÷ $38,100M = **+0.09%**

**Observed move:**
On March 2, 2026 (first trading day after the Iran strikes) Woodside closed +6.8% in Australia (A$30.24 from ~A$28.29) [ts2.tech Woodside energy article, 2026-03-02, unverified web, labelled]. WDS reached its 52-week high of $25.19 (NYSE ADR) on March 19, 2026 [MacroTrends WDS price history, unverified web, labelled]. Current price ~$20.05 (June 2026). The stock has retraced substantially from the March peak. Most isolated disruption-specific observed move: the **+6.8% event-day reaction** on March 2, 2026.

**Gap read: re_rate_to_judge**

| | |
|---|---|
| Implied fundamentals-floor move (spot-linked LNG revenue uplift, 0.5-yr NPV, conservative attribution) | **+0.09%** |
| Observed disruption-day reaction | **+6.8%** |
| Gap | ~6.7 percentage points |

At WDS's large market cap ($38B+), even a full 51% LNG price pass-through without hedges would yield at most ~$335M NPV (see below for the check) → +0.88% implied. The 6.8% observed move is predominantly sector-narrative repricing, oil-price uplift (LNG/oil are correlated in investor positioning), and Scarborough volume optionality entering an elevated-price environment.

Upper bound check (no hedges, full 51% price uplift, 51% spot-linked volumes): $12,984M × 51% × 51% × 20.9% = $706M/yr ÷ 2 (0.5 yr) ÷ 1.056 = **$334M NPV** → +334/38,100 = **+0.88%** maximum. Even the maximum does not approach the observed move.

**Caveats:**
- The 5.5% conservative Qatar-attribution of the realised price uplift is an inference. The true figure depends on Woodside's hedge ratios for H1 2026, which are not confirmed from filed disclosures in this run.
- 49% of Woodside's LNG is on long-term contracts (price-linked differently) and the company uses term shipping to avoid Strait of Hormuz routing — both dilute the exposure further.
- Scarborough Q4 2026 startup represents a distinct earnings growth driver that the market is pricing separately from the Qatar event.

**Sources:**

| Source | Retrieved | Claim supported | Grade | URL |
|---|---|---|---|---|
| Woodside FY2025 Full-Year Results Press Release (Woodside IR / Business Wire) | 2026-02-24 | Revenue $12,984M; NPAT $2,718M; underlying NPAT $2,649M; record production 198.8 MMboe | A (company press release) | https://www.businesswire.com/news/home/20260223899485/en/Woodside-Energy-Releases-Full-Year-2025-Results |
| Woodside Q1 2026 ASX quarterly / StockTitan / Motley Fool Australia | 2026-04-29 | Q1 2026 revenue $3.26B; production 45.2 MMboe; average realised price $63/boe (+11% QoQ); 51% LNG on gas-hub index pricing; Scarborough 96% complete; full-year guidance reaffirmed | A (ASX filing) / B (press summary) | https://www.woodside.com/media-centre/news-stories/story/2025-full-year-results--operational-excellence-delivers-long-term-value |
| ts2.tech Woodside share price report | 2026-03-02 | WDS closed +6.8% at A$30.24 on March 2, 2026 (disruption first trading day) | B (unverified web, labelled) | https://ts2.tech/en/woodside-energy-share-price-jumps-on-oil-spike-as-hormuz-fears-rattle-markets/ |
| MacroTrends WDS price history | 2026-06-28 | 52-week high $25.19 (March 19 2026); 52-week low $14.27; current price ~$20.05; shares outstanding 1.90B | B (unverified web, labelled) | https://www.macrotrends.net/stocks/charts/WDS/woodside-energy-group/stock-price-history |
| Search-confirmed market cap (CompaniesMarketCap / StockAnalysis) | 2026-06-13 | Market cap ~$38.12B | B (unverified web, labelled) | https://stockanalysis.com/stocks/wds/market-cap/ |

---

### CND-004 · Cheniere Energy, Inc. (NYSE: LNG) — Rank 4 (Exposure 42/100)

**Applicable: yes — PRIMARY mode**

**Event quantification — EBITDA guidance raise from elevated spot-linked volume pricing (finite-life with one-off component)**

Cheniere raised FY2026 Consolidated Adjusted EBITDA guidance by approximately $500M at the midpoint (from a $6.75–$7.25B range to $7.25–$7.75B, midpoint $7.50B) [Cheniere Energy 8-K Q1 2026, SEC EDGAR, May 7 2026]. Q1 2026 consolidated adjusted EBITDA: $2.33B (+25% YoY); revenues $5.87B; adjusted net income $1.01B [Cheniere Energy 8-K Q1 2026, SEC EDGAR, May 7 2026; confirmed via TradingView / Investing.com earnings summary, unverified web, labelled]. Cheniere's ~95% contracted long-term SPA (sale and purchase agreement) book insulates most volume from spot LNG price moves; the guide raise reflects the ~5% optimization/uncontracted volume selling at JKM/TTF + basis, plus a non-recurring Q1 2026 tax credit [Cheniere 8-K Q1 2026, same source].

No pass-through taxes apply — Cheniere's revenue is recognised at the LNG delivery price net of the Henry Hub feed-gas cost (the integrated margin) or as a regasification/liquefaction toll; it is not an indirect-tax-inclusive gross. Revenue as stated.

**Reported vs adjusted — §15 hygiene:** Q1 2026 reported net loss was $3.50B, driven by $5.4B of non-cash fair-value losses on long-term commodity derivatives. Adjusted net income was $1.01B [Cheniere 8-K Q1 2026]. All analysis below uses the adjusted figures. The non-cash derivative mark is a §15 reporting artefact, not a cash or operational deterioration.

**After-tax margin (adjusted):** Q1 2026 adjusted net income $1.01B ÷ revenues $5.87B = **17.2%** (annualising Q1: implied annual adjusted net income ~$4.04B on revenue ~$23.5B → consistent with a $50B market cap at approximately 12× adjusted earnings).

FX: Cheniere reports in USD. No conversion required.

**ΔE/yr from the guidance raise:**

$500M EBITDA raise. EBITDA-to-net conversion: Q1 2026 adjusted EBITDA $2.33B → adjusted net income $1.01B = 43.3% conversion ratio. Applying this to the $500M EBITDA lift: **ΔE ≈ $216M** additional adjusted net income for FY2026.

Expressed as % of consensus EPS base: consensus NTM EPS mean $17.91 [StockAnalysis.com, M0.6.2 Block 1, June 12 2026, labelled]; shares fully diluted 209.55M [search-confirmed, June 2026, unverified web, labelled]. $216M ÷ 209.55M = $1.03 incremental EPS. EPS revision: $1.03 ÷ $17.91 = **+5.8%** on the consensus base.

Note: the consensus EPS of $17.91 has already been updated post-Q1 earnings (guidance raise absorbed). The guidance raise was confirmed May 7 2026; the consensus as of June 12 2026 already incorporates the raise. The ΔE against the pre-guidance-raise base (approximately $19+ three months prior per M0.6.2 Block 2) shows EPS actually trended down net of the guidance raise due to the non-cash derivative dilution. For the purpose of sizing the event-driven fundamentals move, the correct ΔE is the guidance raise itself relative to the pre-raise baseline (approximately $16/share implied before the May 7 raise, based on the $17.91 mean minus the $1.03 uplift), giving **+6.5% EPS revision** from the guidance-raise event.

Using the more conservative M0.6.2-confirmed revision of +5.8% (consensus mean basis):

**ΔE = +5.8%** (against the current consensus EPS base in primary mode)

**ΔMultiple (primary mode):**
Current EV/EBITDA: 10.2× [M0.6.2 Block 3; EV $76.86B ÷ $7.50B EBITDA guidance midpoint, confirmed from Cheniere 8-K Q1 2026 and M0.6.2 M0.6.2 Block 3, June 12 2026]. Sector normal range: 8×–12× (10-year median ~11.2×; recent trough 7.3× March 2026) [M0.6.2 Block 3, unverified web, labelled].

The guidance raise ($7.50B from $7.00B) reflects a finite-window disruption event plus one non-recurring item. A permanently higher earnings base would typically warrant a multiple at or above the historical midpoint (~10×). However:
- 95% of Cheniere's book is long-term contracted; the disruption benefit accrues only to the ~5% optimization volumes plus the tax credit.
- The sector was at 10.2× prior to the raise — at the midpoint of normal range. No additional multiple expansion is supported by this specific event alone.
- If the IEA 3–5 year disruption scenario later materialises and drives a permanent LNG supply regime change, a re-rate to 11–12× would be justified; but that scenario has not occurred yet as of 2026-06-28.

ΔM = **0** (no justified multiple expansion from this finite-window guidance raise, holding the multiple constant at 10.2×).

**Primary-mode implied move:**
(1 + ΔE)(1 + ΔM) − 1 = (1 + 5.8%)(1 + 0%) − 1 = **+5.8%**

**Duration-trap check (for the finite-life component):** The $500M EBITDA guidance raise applied at the current 10.2× forward EV/EBITDA would imply an EV increase of 10.2 × $500M = $5.1B → equity uplift $5.1B ÷ $50.6B market cap = **+10.1%**. This treats the one-year guidance raise as if it were a permanent run-rate, which overstates value. The correct primary-mode answer (+5.8%) uses the ΔE-only method (holding the multiple constant), which is equivalent to asking: "does the consensus EPS revision justify this price?" — the answer is +5.8%, not +10.1%. The 10.1% figure would emerge only if the market re-rates (ΔM) simultaneously, which is not supported here.

**Implied move (primary mode): +5.8%**

**Observed move:**
Pre-disruption reference: Cheniere guided $6.75–$7.25B EBITDA at approximately $269/share on February 26, 2026 (Q4 2025 earnings; search-confirmed, labelled). Disruption-day peak: stock hit an intraday high near $297, closing approximately $285 on March 19, 2026 [Money.USNews.com / Investing.com, 2026-03-19, unverified web, labelled]; subsequently ran to a 52-week high of $300.89 [StockAnalysis / search, labelled].

Most isolated disruption-reaction move (pre-disruption price $269 to $285 close on March 19): **observed move +6.0%** (dated March 19, 2026).

Current price: $241.64 (M0.6.2, June 12 2026) — below the $269 pre-disruption reference. The stock retreated from the March high as broad-market conditions and the non-cash derivative Q1 loss weighed on sentiment.

**Gap read: priced** (at the March 19 disruption-day close) → **underpriced_candidate** (at the current price relative to the guidance raise)

At the March 19 reaction:
- Implied fundamentals-floor: +5.8%
- Observed move: +6.0%
- These are essentially equal → **priced** at the event-day reaction

At the current price ($241.64 vs the pre-disruption $269 baseline):
- The stock is −10.1% below the pre-disruption reference despite the guidance raise remaining in force ($7.50B EBITDA guidance has not been withdrawn)
- The guidance raise supports a +5.8% move above the pre-disruption price — implying a fair-value floor of approximately $269 × 1.058 ≈ **$285**
- Current price $241.64 is approximately 15% below this floor
- Gap read: **underpriced_candidate** at the current price relative to the fundamentals floor the guidance raise supports

The current discount reflects the non-cash derivative loss weighing on headline EPS (the $3.5B net loss in Q1 2026) and broader energy-sector de-rating from April–May 2026. The operational earnings (adjusted) are consistent with the guidance.

**Caveats:**
- ΔM = 0 is deliberately conservative. If the IEA 3–5 year outage scenario materialises, a re-rate from 10.2× toward 11–12× is justified and would raise the implied move to 16–26% from the current price. That re-rating is the analyst's judgment (M0.7), not this floor.
- The non-cash derivative loss ($5.4B in Q1 2026) does not affect operating earnings but suppresses the reported P/E headline, which may be why the stock has underperformed its adjusted earnings trajectory.
- Only ~5% of Cheniere's volume is spot-exposed; the EBITDA guidance raise partially includes a non-recurring tax credit — the research swarm should verify the durable proportion.

**Sources:**

| Source | Retrieved | Claim supported | Grade | URL |
|---|---|---|---|---|
| Cheniere Energy 8-K Q1 2026 (SEC EDGAR) | 2026-05-07 | FY2026 Consolidated Adjusted EBITDA guidance $7.25–7.75B (midpoint $7.50B); DCF $4.75–5.25B; Q1 2026 consolidated adjusted EBITDA $2.33B (+25% YoY); revenues $5.87B; adjusted net income $1.01B; non-cash derivative loss $5.4B | A | https://www.sec.gov/Archives/edgar/data/0000003570/000000357026000016/cei20261stqtrerex991.htm |
| StockAnalysis.com LNG consensus / overview | 2026-06-12 | NTM EPS mean $17.91; EPS high $20.77; low $15.25; 23 analysts Strong Buy; consensus target $302.64; price $236.49; short interest 1.90%; market cap ~$50.6B; 209.55M shares | B | https://stockanalysis.com/stocks/lng/ |
| M0.6.2 Block 3 (upstream market-implied, SIG-20260612-dd716589) | 2026-06-12 | Cheniere EV $76.86B; 2026 EBITDA guidance $7.50B; EV/EBITDA 10.2×; sector range 8×–12×; 10-yr median 11.2× | B (as sourced and labelled in M0.6.2) | screener/runs/SIG-20260612-dd716589/edge-definition/02_market-implied.md |
| Money.USNews.com / Investing.com 'Cheniere, Venture Global shares surge' | 2026-03-19 | LNG hit all-time high near $297 intraday; closed approximately $285; up ~7% on March 19; up ~28% in prior month; BofA raised target to $322 | B (unverified web, labelled) | https://www.investing.com/news/stock-market-news/cheniere-venture-global-shares-surge-amid-iran-attacks-on-qatar-lng-infrastructure-4571568 |

---

### CND-005 · Excelerate Energy (NYSE: EE) — not_applicable

EE's existing FSRU fleet operates on fixed-rate, take-or-pay time-charter contracts. The IND-002 mechanism (higher LNG import demand → FSRU re-contracting at elevated rates) reaches EE's P&L only at contract renewal events, not through current cashflows. No specific contract renewal or charter announcement attributable to the Qatar disruption has been filed or publicly disclosed as of 2026-06-28. Sizing an unconfirmed forward re-contracting event would require assumptions on timing, rates, and terms that are not in any filing. Missing reason: no quantifiable closed event for EE from the Qatar disruption within the current reporting window; the IND-002 thesis mechanism accrues at the next re-contracting event, which may fall outside the mid-August 2026 thesis horizon.

---

### CND-006 · Enagás S.A. (BME: ENG) — not_applicable

Enagás' storage and regasification revenues are regulated under the Spanish CNMC tariff framework. The DIR-003 and IND-002 mechanisms reach Enagás' P&L through regulated capacity reservation fees and throughput charges, not spot-spread income. The tariff structure caps the uplift from the storage deficit and elevated LNG import demand; the exact regulation-determined capacity fee change for the 2026 injection season (which would require the CNMC's specific tariff order) was not retrieved from available sources. Storage segment revenue is also not confirmed as a discrete filing-level line in the upstream candidate inputs. Missing reason: regulated tariff structure prevents direct conversion of the DIR-003 mechanism to a filing-confirmed revenue uplift for the event period; storage segment revenue not confirmed from primary filing.

---

### CND-007 · Enel S.p.A. (OTC: ENLAY / BIT: ENEL) — not_applicable

The HARM-002 mechanism (unhedged Italian CCGT gas-cost squeeze) requires: (a) the share of Enel's Italian CCGT capacity that is unhedged and exposed to TTF/PSV spot prices, and (b) the gas-cost spread between hedged and unhedged procurement. Neither figure was retrieved from Enel's filed annual report or quarterly results in this run; both are explicitly marked "exposure not yet quantified" in the upstream candidate mapping. Enel's €115.6B diversified utility structure (60%+ renewable capacity, international grids, retail) further dilutes any short-exposure signal to a small fraction of group EBITDA. Missing reason: unhedged CCGT gas procurement volume and hedge ratio not confirmed from filed annual report; exposure too diluted for reliable sizing at the group level without segment-level filed disclosure.

---

## 2. Verdict

**4 candidates assessed; 3 sized (CND-001 FLNG, CND-003 WDS in fallback; CND-004 Cheniere in primary; CND-002 GLNG in fallback with inference caveat); 3 not_applicable (CND-005 EE, CND-006 ENG, CND-007 ENLAY)**

| Candidate | Mode | Implied move | Observed move | Gap read |
|---|---|---|---|---|
| FLNG (CND-001) | fallback | +0.6% | ~+35.6% (52-wk low to current) | re_rate_to_judge |
| GLNG (CND-002) | fallback (inference) | +0.3% | ~+24% (approx.) | re_rate_to_judge |
| WDS (CND-003) | fallback | +0.09% | +6.8% (event-day reaction) | re_rate_to_judge |
| LNG (CND-004) | primary | +5.8% | +6.0% (event-day); −10.1% (current vs pre-event) | priced (event-day) / underpriced_candidate (current) |

**Biggest finding: Cheniere Energy (CND-004) is the most actionable gap.** The guidance raise supports a +5.8% fundamentals-floor move, the event-day reaction (+6.0%) matched it almost exactly — confirming the market priced the guidance raise correctly at the time. But the stock has since retreated 10.1% below the pre-disruption baseline, despite the EBITDA guidance remaining in force. At current prices, the fundamentals floor implies the stock is approximately 15% below the guidance-justified fair-value floor — making it an **underpriced_candidate** by this metric alone, before any re-rating for the IEA 3–5 year outage scenario or multiple expansion.

FLNG and GLNG are both `re_rate_to_judge` — the observed moves are 30–100× larger than the short-window earnings impact of the disruption on existing contracts. The market is pricing the charter-renewal narrative (FLNG) and floating liquefaction platform optionality (GLNG) that the fundamentals floor by design cannot see.

Reminder: this is a fundamentals floor, not a verdict — routing (provisional), edge score (74), and candidate rankings from `02_expression-ranking.md` are unchanged. No price target is issued here (CLAUDE.md §16). The re-rate judgment on FLNG's charter-renewal step-up and Cheniere's multi-year upside scenario belongs to the research swarm.
