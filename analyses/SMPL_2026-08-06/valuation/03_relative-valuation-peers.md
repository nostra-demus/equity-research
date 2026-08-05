# Relative Valuation — Peers — SMPL

Anchor (from `01_price-and-capital-structure.md`, used verbatim): price $11.33 (close, Aug-04-2026, pool-verified); shares for market cap 88,460,545; fully diluted shares for per-share fair value 89,934,884; market cap $1,002.26M; net debt $324.58M (strict: total debt $448.46M − cash $123.88M); EV $1,326.84M. Business type: Operating (branded, asset-light packaged food) per the Business-Type Method Map — EV/EBITDA, EV/EBIT, EV/Sales, P/E and FCF yield are all valid multiples for this company.

## 1. Peer Set

The peer set comes from a dedicated Capital IQ comparable-company export in the data pool (`Company Comparable Analysis The Simply Good Foods Company.xls`, "Capital IQ Default Comps" template, as-of 2026-07-24) — a systematic vendor screen, not this agent's own selection, and not identical to the three competitors named qualitatively in `business-model/08_competitive-map.md` (BellRing, Glanbia, Kellanova). Only BellRing appears in both sets; Glanbia (Euronext Dublin/LSE: GL9, Optimum Nutrition sits inside a larger diversified segment) and Kellanova (NYSE: K, RXBAR is an undisclosed sub-brand of a ~9x-larger diversified cereal/snacks company) are **not** in this CIQ comp screen and have **no usable public multiples in this dataset** — Optimum Nutrition and RXBAR are not separately listed, so no standalone multiple exists for either; they are flagged, not guessed at.

| Peer | Ticker | Why Comparable | Source of Inclusion |
|---|---|---|---|
| Utz Brands | NYSE:UTZ | Branded US salty snacks (chips, pretzels) sold through the same mass/club/grocery/DSD channels; same GICS Packaged Foods & Meats classification | Capital IQ Default Comps screen, as-of 2026-07-24 |
| J&J Snack Foods | NasdaqGS:JJSF | Branded/private-label snack and nutritional food manufacturer selling into retail and foodservice; asset-light-adjacent branded-food comp | Capital IQ Default Comps screen, as-of 2026-07-24 |
| The Hain Celestial Group | NasdaqGS:HAIN | Branded "better-for-you"/organic/natural food and snack company — closest positioning match to SMPL's health-and-wellness angle outside BellRing | Capital IQ Default Comps screen, as-of 2026-07-24 |
| The Campbell's Company | NasdaqGS:CPB | Large diversified branded packaged-food company with a snacks segment (Goldfish, Snyder's, Kettle); useful as a mega-cap scale/quality benchmark, not a category-narrow peer | Capital IQ Default Comps screen, as-of 2026-07-24 |
| The Marzetti Company (fka Lancaster Colony) | NasdaqGS:MZTI | Branded specialty food company (dressings, dips, frozen bakery) sold to retail/foodservice; comparable asset-light branded-CPG structure | Capital IQ Default Comps screen, as-of 2026-07-24 |
| BellRing Brands | NYSE:BRBR | **Direct category competitor** — Premier Protein (RTD shakes) and Dymatize (powders/bars) compete head-on with Quest's RTD-shake/bar lines and Atkins'/OWYN's RTD shakes [business-model/08_competitive-map.md, Competitor A] | Capital IQ Default Comps screen AND named in `business-model/08_competitive-map.md` |
| Conagra Brands | NYSE:CAG | Large diversified branded frozen/shelf-stable food and snacks company (Birds Eye, Slim Jim, Angie's BOOMCHICKAPOP); scale/quality benchmark, broader category than SMPL | Capital IQ Default Comps screen, as-of 2026-07-24 |
| Freshpet | NasdaqGM:FRPT | High-growth, branded, single-category specialty food company; closer in market-cap range and growth-multiple profile than the mega-caps in this set | Capital IQ Default Comps screen, as-of 2026-07-24 |
| The Kraft Heinz Company | NasdaqGS:KHC | Mega-cap branded packaged-food company; included as a scale/quality benchmark, not a narrow category peer | Capital IQ Default Comps screen, as-of 2026-07-24 |
| John B. Sanfilippo & Son | NasdaqGS:JBSS | Branded/private-label nut and snack-bar processor; small-to-mid-cap branded-food comp closer to SMPL's own market-cap range | Capital IQ Default Comps screen, as-of 2026-07-24 |

**Composition caveat:** only BellRing is a true head-to-head active-nutrition/protein competitor. The other nine span from small/mid-cap branded-snack names (JJSF, MZTI, JBSS, FRPT, UTZ) to mega-cap diversified branded-food conglomerates (CPB, CAG, KHC) whose scale, category mix, and growth profile differ materially from SMPL's narrower protein/low-carb/weight-management portfolio. This is a GICS-sector-matched vendor screen, not a hand-picked category-pure set — the premium/discount reads in Section 3 should be read with that heterogeneity in mind, and the peer **median** (not mean, which two extreme EV/EBIT outliers distort) is used throughout for this reason.

## 2. Peer Multiples & Operating Stats

All figures as-of 2026-07-24 [Company Comparable Analysis The Simply Good Foods Company.xls, Trading Multiples, Financial Data, and Operating Statistics tabs], except SMPL's own multiples, which this agent recomputed on the canonical anchor from `01` (EV $1,326.84M, as of Aug-04-2026) rather than the comp workbook's own stale SMPL row (which embeds a $10.28 price / $1,234M EV, ~13 days older and pre-dating a subsequent price move) — per the Reconciliation Gate ("every agent uses the price... and EV from `01` verbatim"). Peer figures are untouched (their own price dates are each peer's own last reported close as of 2026-07-24, not the SMPL-specific date). SMPL's LTM Revenue ($1,392.2M) ties exactly to `earnings/01_historical-financials.md`'s independently-built LTM figure — cross-checked, no gap.

| Company | P/E (LTM) | EV/EBITDA (LTM) | EV/EBIT (LTM) | EV/Sales (LTM) | FCF Yield | Rev Growth (LTM YoY) | EBITDA Margin (LTM) | Total Debt/EBITDA (LTM) | Data As-of |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|
| **SMPL** | NM (EPS −$2.08) | **6.10x** (CIQ-basis EBITDA $217.5M); **5.66x** on company-defined Adj. EBITDA $234.6M | 6.86x | 0.95x | 11.9% (mkt cap basis; $119.4M LTM FCF ÷ $1,002.26M mkt cap [`earnings/01_historical-financials.md` §2]) / 9.0% (EV basis) | −4.5% | 15.6% (CIQ) / 16.9% (co. Adj. EBITDA margin, `earnings/01` §2) | 1.9x (CIQ Total Debt); 1.38x on co.-defined Net debt/Adj. EBITDA [`01`, §5] | 2026-08-04 (price) / 2026-05-30 (financials) |
| Utz Brands (UTZ) | NM | 29.0x | 240.8x | 2.0x | Not disclosed in comps export | +2.4% | 6.8% | 10.6x | 2026-07-24 |
| J&J Snack Foods (JJSF) | 25.3x | 7.7x | 16.3x | 1.0x | Not disclosed in comps export | −2.0% | 11.0% | 0.9x | 2026-07-24 |
| Hain Celestial (HAIN) | NM | 6.1x | 18.2x | 0.4x | Not disclosed in comps export | −10.0% | 5.8% | 6.1x | 2026-07-24 |
| Campbell's (CPB) | 10.5x | 6.1x | 10.3x | 1.3x | Not disclosed in comps export | −2.9% | 17.2% | 3.4x | 2026-07-24 |
| Marzetti (MZTI) | 16.7x | 8.6x | 11.9x | 1.4x | Not disclosed in comps export | +2.9% | 15.4% | 0.1x | 2026-07-24 |
| BellRing Brands (BRBR) | 10.1x | 8.5x | 9.2x | 1.2x | Not disclosed in comps export | +6.4% | 13.4% | 3.9x | 2026-07-24 |
| Conagra Brands (CAG) | NM | 7.3x | 9.5x | 1.3x | Not disclosed in comps export | −2.9% | 15.4% | 4.2x | 2026-07-24 |
| Freshpet (FRPT) | 15.5x | 15.0x | 31.2x | 2.5x | Not disclosed in comps export | +12.0% | 16.3% | 2.6x | 2026-07-24 |
| Kraft Heinz (KHC) | NM | 7.5x | 9.9x | 1.9x | Not disclosed in comps export | −1.8% | 23.1% | 3.4x | 2026-07-24 |
| John B. Sanfilippo (JBSS) | 14.1x | 8.0x | 11.2x | 0.9x | Not disclosed in comps export | +5.1% | 10.4% | 0.8x | 2026-07-24 |
| **Peer median (10 names)** | **14.8x** | **7.8x** | **11.5x** | **1.3x** | n/a | **+0.3%** | **14.4%** | **3.4x** | 2026-07-24 |

Forward (NTM) basis — same source, NTM EBITDA/Revenue/EPS are Capital IQ consensus estimates for each name:

| Company | NTM TEV/Fwd Revenue | NTM TEV/Fwd EBITDA | NTM Fwd P/E |
|---|---:|---:|---:|
| **SMPL** (recomputed on canonical EV/price) | **1.03x** (EV $1,326.84M ÷ NTM Rev $1,293.4M) | **6.07x** (EV $1,326.84M ÷ NTM EBITDA $218.42M) | **6.74x** (price $11.33 ÷ NTM EPS $1.68) |
| UTZ | 1.89x | 12.11x | 17.6x |
| JJSF | 1.01x | 8.67x | 18.78x |
| HAIN | 0.52x | 6.79x | 9.84x |
| CPB | 1.37x | 8.78x | 11.2x |
| MZTI | 1.37x | 8.41x | 15.01x |
| BRBR | 1.13x | 8.39x | 9.94x |
| CAG | 1.30x | 9.13x | 9.93x |
| FRPT | 2.35x | 12.89x | 40.75x |
| KHC | 1.93x | 9.47x | 12.55x |
| JBSS | 0.88x | 7.56x | 13.61x |
| **Peer median** | **1.34x** | **8.72x** | **13.08x** |

**FCF yield:** not disclosed anywhere in this peer comps export (no CFO/capex line items for the 10 peers) — this agent does not fabricate it. SMPL's own FCF yield ($119.4M LTM FCF ÷ $1,002.26M market cap = 11.9%; ÷ EV = 9.0%) is shown for context only and is **not** compared against a peer median in Section 3 for this reason.

**ROIC:** not computed for 8 of 10 peers in the pool. `business-model/09_moat.md` computed SMPL's own through-cycle ROIC at ~7.0% (CIQ vendor) / ~8.8% (agent-computed, FY2022–FY2025 average), against a ~5.8%–7.8% estimated WACC range — a marginal, not clearly moat-supporting, result. The same report cites a web-sourced, unverified BellRing ROIC of ~33.8% (latest) / ~46.6% (5-yr average) [`business-model/09_moat.md` §3, sourced to roic.ai/MacroTrends, accessed 2026-08 — vendor-calculated estimate, unverified, not a filed figure] — far above SMPL's own. No ROIC figure for the other 8 peers exists in this pool; this table does not guess at them.

**Data-quality flag (carried from `01`):** CIQ's own "EBITDA" line for SMPL ($217.5M LTM) sits between the company's own GAAP EBITDA (−$213.1M, impairment-distorted) and its own disclosed Adjusted EBITDA ($234.6M) [`01_price-and-capital-structure.md` §5]. The CIQ-basis multiples above are used for the peer premium/discount read in Section 3 because CIQ applies the same "unusual items" reclassification to every peer, making it the internally consistent basis for cross-company comparison — but it is neither SMPL's GAAP number nor its own company-defined Adjusted EBITDA, and both alternates are shown alongside for transparency, per CLAUDE.md §15.

## 3. Premium / Discount to Peer Median

Formula: `(company multiple − peer median) / peer median`. Positive = premium (company multiple higher, priced richer); negative = discount (company multiple lower, priced cheaper on that multiple). FCF yield is a yield metric (not shown here, since no peer FCF yield data exists to compare against) — if it existed, a higher SMPL yield than peer median would read as a discount, not a premium; this inversion did not need to be applied because no peer FCF yield exists to invert against.

| Multiple | Company | Peer Median | Premium / (Discount) |
|---|---:|---:|---:|
| EV/Sales (LTM) | 0.95x | 1.30x | **(26.7%)** |
| EV/EBITDA (LTM, CIQ-basis) | 6.10x | 7.80x | **(21.8%)** |
| EV/EBIT (LTM, CIQ-basis) | 6.86x | 11.50x | **(40.3%)** |
| P/E (LTM) | NM | 14.80x | Not computable — SMPL LTM EPS is negative (impairment-driven) |
| EV/Sales (NTM) | 1.03x | 1.34x | **(23.4%)** |
| EV/EBITDA (NTM) | 6.07x | 8.72x | **(30.3%)** |
| P/E (NTM) | 6.74x | 13.08x | **(48.4%)** |

SMPL trades at a discount to the peer median on every computable multiple, ranging from roughly 22% (LTM EV/EBITDA) to roughly 48% (NTM P/E). The EV/EBIT read (−40.3%) is the least reliable of the set — peer EV/EBIT dispersion is extreme (9.2x to 240.8x, driven by UTZ's near-zero EBIT base), so the peer median itself carries wide error even though it is more robust than the mean (36.8x). The NTM P/E discount (−48.4%) is the largest, but P/E discounts on a name whose earnings are currently thin and volatile (GAAP LTM EPS −$2.08, NTM consensus EPS only $1.68) mechanically amplify any given dollar gap in the multiple — this discount should not be read as twice as meaningful as the EV/EBITDA discount just because the percentage is larger.

**Is the gap typical or unusual? Not assessable.** The data pool contains only a single dated snapshot of peer multiples (2026-07-24) — no historical time series of peer multiples exists anywhere in the pool, and this agent does not fabricate a multi-year peer-relative history. `02_multiples-own-history.md` (SMPL's own multiple history against itself, not against peers) is a separate agent's output and does not substitute for this. This is the **relative gap to peers over time**, distinct from SMPL's own absolute multiple history, and it cannot be assessed from available data.

## 4. Is the Gap Warranted?

The evidence is mixed but net supports most of the discount, not all of it. Against the discount: `business-model/07_business-quality.md` scores SMPL 40/100 (Weak band) with the three lowest sub-scores — margin stability (30), competitive intensity (30), commodity dependence (30) — all directly tied to an ~800bps five-year gross-margin decline (40.7% FY21 → 33.3% TTM); `business-model/09_moat.md` concludes "No moat proven," with brand (the strongest candidate) capped at 30/100 because the company's own disclosed price elasticity assumption (≥1 for the September-2026 price increase) signals a price-taker, not a price-setter; and SMPL's LTM revenue fell −4.5% against a peer median of +0.3% — the second-worst growth rate in the ten-name set (only HAIN's −10.0% is worse), while `earnings/04_guidance-consensus.md` shows FY2027 consensus revenue, EBITDA, and EPS estimates still being cut across every trailing window (30/60/90-day trend all falling; net revision breadth −4 to −6 over the last three months) — the market has not finished re-rating this business down. Against the full observed discount, however: SMPL's LTM EBITDA margin (15.6%) sits above the peer median (14.4%), and its leverage (1.9x CIQ Total Debt/EBITDA, or 1.38x on the company's own Net debt/Adjusted EBITDA basis) is meaningfully below the peer median of 3.4x — SMPL is not the over-levered name in this set. **Conclusion: the discount is largely warranted, but not fully** — the weak-quality, no-moat, negative-growth evidence justifies trading below the peer median, but the depth of some of the observed gaps (30-48% on NTM EBITDA and NTM P/E) outruns what the margin and leverage evidence alone would support, given SMPL's still-competitive current profitability and below-median leverage.

## 5. Implied Value from Peer Multiples

**Quality adjustment applied:** an 18% discount to each peer median multiple (multiplier 0.82×), reflecting the net-negative but not extreme quality/growth/moat gap in Section 4 (weak quality score, no moat, worst-in-class-but-one growth) partially offset by SMPL's below-peer-median leverage and at-or-above-peer-median current EBITDA margin. This is smaller than the market's currently observed discount on the forward multiples (30–48%), reflecting the view that part of that gap is earnings-quality noise (a thin, volatile EPS/EBITDA base mechanically widening percentage-based multiple gaps) rather than a fundamentals-only quality discount. This adjustment is a judgment call tied to the cited evidence, not a mechanical output — `07_scenario-and-fair-value` may weight it differently.

Applied on the **same basis** as each peer multiple (NTM peer multiple × NTM company metric; LTM peer multiple × LTM company metric):

| Multiple | Applied Peer Multiple (peer median × 0.82) | Implied EV | Implied Equity Value | Implied Price/Share | vs Current Price ($11.33) |
|---|---:|---:|---:|---:|---:|
| **NTM EV/EBITDA (base case)** | **7.15x** (8.72 × 0.82) | $1,561.8M | $1,237.2M | **$13.76** | **+21.4%** |
| LTM EV/EBITDA (CIQ-basis) | 6.40x (7.80 × 0.82) | $1,391.1M | $1,066.6M | $11.86 | +4.7% |
| LTM EV/Sales | 1.07x (1.30 × 0.82) | $1,484.1M | $1,159.5M | $12.89 | +13.8% |
| NTM EV/Sales | 1.10x (1.34 × 0.82) | $1,421.2M | $1,096.6M | $12.19 | +7.6% |
| LTM EV/EBIT (low-confidence — see caveat) | 9.43x (11.50 × 0.82) | $1,823.8M | $1,499.2M | $16.67 | +47.1% |
| NTM P/E (low-confidence — see caveat) | 10.73x (13.08 × 0.82) | n/a (direct per-share) | n/a | $18.02 | +59.1% |

Equity bridge: Implied EV − net debt ($324.58M, `01`'s canonical strict basis) = Implied equity value; ÷ 89,934,884 fully diluted shares = implied price/share (for EV-based multiples). For the NTM P/E line, the multiple applies directly to NTM EPS ($1.68) — no bridge needed.

**Base-case point: $13.76/share**, from the primary multiple (NTM EV/EBITDA, quality-adjusted 7.15x applied to NTM EBITDA $218.42M) — +21.4% versus the current $11.33 price. This multiple is chosen as primary because SMPL's GAAP P/E is NM (negative LTM EPS) and EV/EBITDA is the standard primary multiple for an operating branded-food company under the Business-Type Method Map.

**Dispersion:** across the EV/Sales and EV/EBITDA methods (the more reliable subset — LTM and NTM, on Revenue and EBITDA bases), the implied price ranges **$11.86–$13.76** (roughly +5% to +21% versus current price). The LTM EV/EBIT ($16.67) and NTM P/E ($18.02) methods produce materially higher implied values, but both are flagged low-confidence: EV/EBIT because peer dispersion is extreme (9.2x–240.8x driven by a near-zero EBIT outlier), and P/E because it is being applied to a currently thin, still-being-cut consensus EPS base ($1.68 NTM, down from $1.74 ninety days ago per `earnings/04_guidance-consensus.md` §4) — a small change in that denominator moves the implied price a lot. These two are shown for completeness but are excluded from the base-case dispersion range.

## 6. Relative Read

SMPL trades at a 22%–48% discount to the peer median across every computable multiple (widest on NTM P/E, narrowest on LTM EV/EBITDA), and the evidence — a 40/100 weak business-quality score, no proven moat, an ~800bps five-year gross-margin decline, and LTM revenue growth of −4.5% against a peer median of +0.3% — supports most, but not all, of that gap; SMPL's below-peer-median leverage (1.9x vs. peer median 3.4x Total Debt/EBITDA) and at-or-above-peer-median current EBITDA margin (15.6% vs. 14.4%) argue the discount has room to be somewhat narrower than the market currently prices. Applying a quality-adjusted (18% haircut) peer-median NTM EV/EBITDA multiple of 7.15x to SMPL's NTM EBITDA of $218.42M implies a base-case value of **$13.76/share (+21.4% vs. the $11.33 current price)**, with a dispersion of **$11.86–$13.76** across the more reliable EV/Sales and EV/EBITDA methods (EV/EBIT and P/E-based reads of $16.67–$18.02 are shown but flagged low-confidence given extreme peer dispersion and a thin, still-falling consensus EPS base, respectively). The relative-gap-over-time context (typical vs. wider vs. narrower than SMPL's historical relationship to these peers) is **Not assessable** — the pool contains only a single 2026-07-24 peer-multiple snapshot, with no historical peer-comp series to compare it against.
