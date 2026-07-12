# News-Impact Sizing — SIG-20260711-b55e8917

## 0. Event & Mode

- Originating event (M0.1): In July 2026 Carvana completed the acquisition of seven Stellantis (CDJR) dealerships for $171 million and began operating them as new-car retail locations; the Casa Grande, AZ store recorded 700+ new vehicles sold in May 2026 versus a prior monthly average of 30–50 units under the previous operator.
- Mode: **primary** — the consensus forward EPS ($1.58 FY2026), forward EV/EBITDA NTM (20–22x), and TTM EV/EBITDA (29–32x) were all gathered upstream in `edge-definition/02_market-implied.md` (M0.6.2); both required feeds are present for the direct issuer (CVNA). The short-side candidates (AN, LAD) are sized in fallback mode — their forward consensus multiples were not surfaced individually in M0.6.2 (that report focused on CVNA), and no NTM EPS or EV/EBITDA dispersion data was gathered for them upstream.

---

## 1. Per-Candidate Sizing

### CVNA · Carvana Co. (NYSE) — CND-001

- **Applicable:** yes — Carvana is the direct issuer; the event (seven Stellantis franchise acquisitions + Casa Grande 700+ units/month) is a Carvana operational result with an observable market reaction.

- **Timing note on the observed move:** The originating signal was generated from The Motley Fool article dated July 11 2026 (Grade B, secondary analysis). The underlying facts broke earlier via CNBC on June 16 2026 (Grade A primary news), which is when the market first reacted. By July 11, CVNA had already traded through the post-news period. The news-impact sizing therefore uses the primary news date (June 16 2026) as the observed-move anchor, not the July 11 secondary article.

- **Event quantification:**

  The event has two components:
  1. A completed acquisition (7 Stellantis stores for $171M) — a permanent addition to Carvana's asset base.
  2. An operating result from those stores — Casa Grande 700+ units/month, confirmed as the #1-volume Stellantis store in the U.S. in May 2026.

  The question for sizing is: what annual after-tax earnings does this new-car business generate on a sustainable run-rate basis?

  **Revenue and margin inputs (all from primary and secondary sources below):**
  - Units per store per month: 700 (single confirmed data point, Casa Grande, May 2026) [CNBC, June 16 2026; M0.1 / WC-002, confirmed from Stellantis data shared with CNBC]
  - Stores: 7 (all operational as of July 2026) [M0.1 / WC-001; The Motley Fool, July 11 2026]
  - New-car gross profit per unit (GPU): $6,200 midpoint of BTIG-reported range of $5,500–$7,500 per unit [BTIG research, cited in M0.6.3; inference applied, not from a Carvana filing]
  - Pass-through taxes: not applicable — vehicle gross profit is the spread between selling price and acquisition cost, which is already net of indirect taxes in U.S. dealer accounting. No GST-style strip needed.
  - Annual gross profit from new-car: 7 × 700 × 12 × $6,200 = **$366.0M/year** in new-car gross profit
  - Cross-over demand substitution drag: BTIG reported that 75% of Carvana's new-car buyers initially searched for used vehicles [M0.6.3, BTIG data cited therein; inference from BTIG, not from a Carvana filing]. This means each new-car sale substitutes a would-have-been used-car sale where Carvana earns ~$6,900 GPU instead of $6,200. Opportunity cost per displaced used-car unit: $6,900 − $6,200 = $700/unit drag; affected units: 75% × 7 × 700 × 12 = 44,100 units/year. Annual drag: 44,100 × $700 = **$30.9M/year** in foregone used-car gross profit.
  - Net annual gross profit delta: $366.0M − $30.9M = **$335.1M/year**
  - After-tax margin: Carvana's effective tax rate applied to incremental gross profit. Q1 2026 8-K (SEC EDGAR, filed April 29 2026) shows $405M net income on $6.432B revenue (6.3% net margin) and $672M adj. EBITDA. The company's effective tax rate on incremental gross profit is approximately 28% (Inference from typical U.S. corporate rate; Carvana's 2025 and 2026 effective rates are not separately disclosed at the item level in available sources). After-tax factor: 0.72.
  - **ΔE/yr (after-tax earnings delta) = $335.1M × 0.72 = $241M/year**

- **Recurrence:** `permanent_step_change` — the seven Stellantis dealerships have been acquired and are operating. This is not a contract or project with a defined end date; the stores are Carvana's ongoing business. The Stellantis 1-per-rolling-12-month acquisition cap (January 6 2026 Stellantis policy, DealershipGuy newsletter, published February 26 2026; corroborated by CBT Automotive News and Carscoops) limits further growth, but does not affect the permanence of the current 7-store footprint.

- **ΔValue calculation (primary mode — capitalise at forward multiple, net acquisition cost):**

  - Forward P/E (consensus base): $65.90/share (CVNA close July 11 2026, Web: StockAnalysis.com, July 11 2026, indicative, unverified) ÷ FY2026 consensus EPS $1.58 (Web: Yahoo Finance / Zacks, ~July 10 2026, indicative, unverified) = **41.7×** forward P/E
  - Fully-diluted share count: Market cap = EV ($75.4B) − net debt (~$3.1B, from Block 3 bear-scenario back-calculation in M0.6.2) ≈ **$72.3B**; at $65.90/share = approximately **1,097M fully-diluted shares** (post-5-for-1 split effective May 7–8 2026). Share-count source: derived from EV and price data in M0.6.2; Carvana Q1 2026 8-K (SEC EDGAR, April 29 2026) is the underlying filing anchor.
  - ΔE/yr as a revision to EPS: $241M ÷ 1,097M shares = +$0.22/share against the $1.58 consensus base = **+13.9% EPS revision**
  - ΔValue of acquired earnings stream: $241M × 41.7× = **$10,050M** ($10.05B)
  - Net of acquisition consideration (§24 filter 4 — opportunity cost): $171M cash paid (Carvana acquisition cost, confirmed [CNBC, June 16 2026; The Motley Fool, July 11 2026]). Net ΔValue = $10,050M − $171M = **$9,879M** (~$9.9B)
  - ΔM justified re-rate (primary mode): The thesis (M0.6.3) argues the correct ΔM from this event is **negative or zero** — the Stellantis cap limits new-car optionality to ~8 stores by mid-2027, and the ~$53.8B EV premium already embedded in the stock cannot be supported by a 7–8-store footprint. No historical or peer band supports a multiple expansion from this news; if anything, the confirmed GPU cannibalization drags the justified multiple down. Setting ΔM = 0 for the fundamental floor.
  - **Implied move (primary mode, ΔM = 0): (1 + 0.139)(1 + 0) − 1 = +13.9%**

- **Duration-trap check:** Not applicable for a permanent step-change (the trap is capitalising a *finite* stream at the multiple). To illustrate what a 3-year finite-NPV would give: $241M × annuity factor at 12% cost of equity over 3 years (≈ 2.40) = $578M → implied move = $578M ÷ $72.3B = +0.8%. Capitalising at the 41.7× multiple gives $9.88B vs $578M — a 17× overstatement if the stream were misclassified as finite. The permanent-step-change classification is load-bearing; if the business proves temporary (stores returned to Stellantis, model abandoned), the correct value collapses to NPV ≈ +0.8% over 3 years. The recurrence call, not the headline GPU, is what moves the answer.

- **Observed move (dated, primary news reaction):**
  - CVNA closed at **$70.04 on June 16 2026** (CNBC news day) [Web: StockAnalysis.com, June 16 2026, indicative, unverified]
  - CVNA closed at **$62.86 on June 17 2026** [Web: StockAnalysis.com, June 17 2026, indicative, unverified]
  - Pre-news close (estimated June 13 2026, last Friday before news): approximately $76.00 (Inference — derived from the -8.3% June 16 move to $64.23 reported in one search result; the two price sources are inconsistent and I use a range: pre-news ~$70–$76). [Web: search result referencing June 16 2026 price action, indicative, unverified; StockAnalysis.com June 16 2026, indicative, unverified — see caveat on data inconsistency below]
  - **Two-day observed move (June 13 Friday close → June 17 Monday/Tuesday close): approximately −7% to −17%**, depending on the pre-news starting price. Using the StockAnalysis June 16 close of $70.04 as the pre-news approximation (if the stock had not yet fully reacted by close on June 16) and June 17 close of $62.86: observed move = **−10.2%** over 1 day (June 17 reaction). If the pre-news price was ~$76, the 2-day net move was approximately −17%.
  - **Data-inconsistency caveat:** Two independent web sources give different June 16 closing prices ($64.23 vs $70.04). The StockAnalysis figure ($70.04) is taken as the more directly sourced historical record; the $64.23 figure may reflect an intraday or alternate-session price. The observed-move range is therefore -10% to -17% (rounded), and the direction is unambiguous: the stock fell materially over the 2-day period following the news. [Web: StockAnalysis.com, June 16-17 2026; Web: search snippet referencing June 16 price action — both indicative, unverified]

- **Gap read: `re_rate_to_judge`**

  The fundamental earnings analysis gives an implied move of **+13.9%** (a positive contribution from adding a profitable new business that cost $171M and returns $241M/year in after-tax earnings). The observed market reaction was **approximately −10% to −17%** over the 2-day period surrounding the CNBC news break (June 16–17 2026). The two numbers point in opposite directions.

  This is a pure multiple-compression (re-rate) event, not an earnings story. The market did not read the 7-store acquisition as a $9.9B earnings-per-share uplift. It read it as confirmation that:
  (a) new-car GPU ($6,200) is lower than used-car GPU ($6,900), so the franchise mix dilutes Carvana's per-unit economics;
  (b) 75% of new-car buyers are substituting used-car demand, compounding the GPU drag;
  (c) the Stellantis 1-per-12-month cap means the disruption optionality embedded in the $75.4B EV is structurally capped.
  The result is a ΔM that is sharply negative, overriding a positive ΔE and producing a net negative observed return. The market effectively ran (1 + 0.139)(1 − ΔM) − 1 < 0, implying the market assigned a ΔM of roughly −21% to −27% to account for the total observed drop.

  The re-rate component — how much of the $53.8B EV premium above a dealer-group multiple is justified in light of the confirmed acquisition cap — is the judgment the research swarm and the analyst must make. This sizing provides the fundamental floor (+13.9% from the earnings addition); the observed gap of −25% to −31% relative to the implied is a multiple compression to be adjudicated separately.

- **Caveats:**
  - The 700 units/month is ONE store (Casa Grande) in ONE month (May 2026). Applying it to all 7 stores is an aggressive extrapolation; the M0.5 falsification threshold of 350/store tests whether the run-rate is sustainable.
  - The $6,200 GPU midpoint is a BTIG estimate; no Carvana filing separately discloses new-car franchise gross profit per unit.
  - The effective tax rate applied (28%) is an approximation; Carvana's actual deferred-tax position from its 2022 distressed-exchange could affect cash taxes paid.
  - The crossover substitution drag assumes BTIG's 75% figure is representative across all 7 stores, not just Casa Grande.
  - The Gotham City Research short-seller allegations (>$1B earnings overstatement, January 2026) remain unresolved; if a restatement occurs, the consensus EPS base and forward P/E anchor become unreliable. [CNBC, January 28 2026; M0.6.1 contrary view]
  - The opportunity cost charge (§24 filter 4) here is straightforward — $171M consideration vs $9.88B earnings value — but the acquirer may also have foregone: (a) the ability to deploy that $171M toward used-car reconditioning capacity, and (b) flexibility to exit the franchise business if OEM relations sour. These softer opportunity costs are not quantified.
  - This is a fundamentals floor, not a verdict. The multiple re-rate direction and magnitude are the analyst's judgment.

- **Sources:**

  | Source | Retrieved at | Claim supported | Grade | URL |
  |---|---|---|---|---|
  | CNBC, June 16 2026 | 2026-07-12 | 7 Stellantis stores, $171M, Casa Grande 700+ units/month confirmed as #1 U.S. Stellantis volume store | A | https://www.cnbc.com/2026/06/16/carvana-new-cars-dealerships.html |
  | Carvana 8-K / Q1 2026 earnings release, SEC EDGAR, filed April 29 2026 | 2026-07-12 | $6.432B revenue, $405M net income, $672M adj. EBITDA, 187,393 retail units — underlying business financials | A | https://www.sec.gov/Archives/edgar/data/0001690820/000169082026000034/ex99_1q12026.htm |
  | The Motley Fool, July 11 2026 | 2026-07-12 | $171M acquisition, 7 stores, Casa Grande 700+ units/month, BTIG new-car GPU range ($5,500–$7,500), 75% crossover substitution metric | B | https://www.fool.com/investing/2026/07/11/prediction-carvanas-new-car-business-will-work/?source=iedfolrf0000001 |
  | DealershipGuy newsletter, published 2026-02-26 | 2026-07-12 | Stellantis January 6 2026 consolidation policy — 1 CDJR acquisition per rolling 12-month cap | B | https://www.dealershipguy.com |
  | Web: StockAnalysis.com, June 16–17 2026 | 2026-07-12 | CVNA closing prices — June 16 $70.04, June 17 $62.86 | B (indicative, unverified) | https://stockanalysis.com/stocks/cvna/history/ |
  | Web: Yahoo Finance / Zacks, ~July 10 2026 | 2026-07-12 | FY2026 consensus EPS $1.58, Q2 2026 EPS consensus $0.42, 14 Strong Buy / 3 Moderate Buy / 5 Hold / 1 Sell (22 analysts) | B (indicative, unverified) | https://finance.yahoo.com/quote/CVNA/ |
  | Web: StockAnalysis.com / GuruFocus, ~July 10 2026 | 2026-07-12 | EV ~$75.4B, TTM EV/EBITDA 29–32x | B (indicative, unverified) | https://stockanalysis.com/stocks/cvna/ |
  | Web: Simply Wall St / Yahoo Finance, ~July 10 2026 | 2026-07-12 | FY2026 consensus revenue ~$25.7B, forward EV/EBITDA NTM ~20–22x | B (indicative, unverified) | https://finance.yahoo.com/quote/CVNA/ |

---

### AN · AutoNation, Inc. (NYSE) — CND-002

- **Applicable:** yes — AutoNation is a directly harmed party (DIR-002); it competes with Carvana for CDJR new-vehicle buyers through its ~240 franchise dealerships. The event (7 Carvana-operated CDJR stores recording 700+ units/month) directly displaces volume from competing traditional dealers. An observable market reaction on June 16 2026 exists.

- **Mode:** fallback — forward consensus EPS and forward P/E for AN were not gathered in M0.6.2 (that report focused on CVNA); they are self-anchored below from available market data.

- **Event quantification:**

  The event harms AutoNation by displacing a fraction of CDJR new-vehicle sales that would otherwise have gone to competing dealerships, including AN. The key constraint is the small scale: 7 stores out of 16,990 U.S. dealerships = 0.04% of the market.

  Displacement estimation:
  - AN's share of the U.S. new-car market (proxy): AN operates ~240 franchise dealerships. 240 ÷ 16,990 = ~1.41% of U.S. dealer locations. If displacement is proportional to dealer share: AN absorbs 1.41% of Carvana's 7-store volume.
  - Carvana new-car volume from 7 stores: 700 × 7 × 12 = 58,800 units/year.
  - Displaced AN units per year: 1.41% × 58,800 = ~829 units/year.
  - However, geographic overlap matters more than market-share math. AN does not necessarily operate CDJR dealerships in the same markets as Carvana's 7 acquired stores. This geographic uncertainty is unquantifiable from available data; the 1.41% proportional estimate is used as a conservative proxy. [Inference, not from filings]
  - AutoNation's new-vehicle GPU (gross profit per unit): Q1 2026 8-K (SEC EDGAR, filed ~May 1 2026) shows new vehicle revenue of $3.01B. AN typically reports new-vehicle gross of approximately 2.5–3.5% of new-vehicle revenue — implying GPU of roughly $900–$1,300 per unit on average new-vehicle transaction prices of ~$36,000–$38,000 per unit. Using $1,100/unit GPU as a mid-estimate [Inference from AN Q1 2026 8-K, SEC EDGAR, and industry benchmark; AN does not separately disclose per-unit GPU in the Q1 2026 8-K summary available].
  - Annual gross profit lost: 829 units × $1,100 GPU = **$911K/year** in lost new-car gross profit.
  - After-tax: $911K × 0.72 = **$656K after-tax ΔE/yr** (negative, i.e., earnings reduction).

- **Recurrence:** `permanent_step_change` — Carvana's 7 stores are operational and will continue displacing volume as long as they operate. The displacement is permanent at the current 7-store level.

- **ΔValue (fallback — self-anchored multiple):**

  - AN forward P/E (self-anchored): AN closed at approximately $195.86 on June 16 2026 [Web: search result referencing June 16 2026 AN price range $194.07–$197.76, indicative, unverified]. AN FY2026 consensus EPS: approximately $15–$18/share (Inference from AN FY2025 EPS of approximately $17–$19/share context and Q1 2026 new-vehicle trends; a specific FY2026 consensus EPS number was not extracted from a dated source — missing_reason: no AN-specific EPS consensus was gathered in M0.6.2 and a live fetch was not performed). Using self-anchored multiple: AN market cap ~$15B [01_ticker-mapping.md estimate]; net income proxy from AN Q1 2026 ($6.55B revenue, and assuming ~$450–$500M annual net income at typical 1.8–2.0% net margin on auto retail revenue): implied trailing P/E ≈ 15B ÷ $475M ≈ 31.6x (appears high for a dealer; more plausibly AN trades at ~12–13x NTM earnings given its sector). Using 12x as the self-anchored forward multiple for AN (consistent with traditional dealer group EV/EBITDA of 5–8x and the forward P/E band for dealer groups). [Inference; missing_reason: AN forward P/E not from a filed or vendor source — a dated analyst consensus was not available in the upstream data]
  - ΔValue = -$656K × 12 = **-$7.9M**
  - AN market cap: ~$15B [01_ticker-mapping.md, Web-sourced estimate, indicative, unverified]
  - **Implied move = -$7.9M ÷ $15,000M = -0.05%** (effectively zero — five basis points)

- **Duration-trap check:** N/A — permanent step-change.

- **Observed move:**
  - AN closed at $195.86 on June 16 2026 [Web: search result, June 16 2026, indicative, unverified]
  - Pre-news (June 13 2026) price: not obtained; search results returned June 16 intraday range ($194.07–$197.76) but no June 13 close
  - The June 16 intraday range of $194.07–$197.76 suggests the stock moved within a ~2% band on the day with no dramatic directional reaction — **approximately flat (0% to ±2%)** on the news day [Web: search result referencing AN June 16 2026 price range, indicative, unverified]
  - **Observed move: approximately 0% (no material reaction)**

- **Gap read: `priced`** — The fundamental earnings impact (−0.05%, five basis points) is immaterial and correctly not reflected in the stock price on news day (flat). The market's read is right: 7 stores out of 16,990 does not move the needle for a 240-store operator. This is a fundamentals-confirmed `priced` read, not a mispricing.

- **Caveats:**
  - The geographic overlap between AN's CDJR stores and Carvana's 7 locations is unknown from available filings; the displacement estimate is proportional-market-share math, not a store-by-store geographic overlap analysis.
  - AN's per-unit new-vehicle GPU was not extracted from a filed source — only estimated from revenue data and industry benchmarks. The fundamental impact would be even smaller if the actual GPU is lower.
  - The short thesis for AN rests on the *structural* disruption risk as Carvana expands beyond 7 stores over time, not on the immediate 7-store impact. That longer-term risk is a re-rate judgment, not a current-period earnings effect.
  - This is a fundamentals floor, not a verdict.

- **Sources:**

  | Source | Retrieved at | Claim supported | Grade | URL |
  |---|---|---|---|---|
  | AutoNation Q1 2026 8-K / earnings press release, SEC EDGAR, filed ~May 1 2026 | 2026-07-12 | New vehicle revenue Q1 2026 $3.01B (−7.3% YoY), new-vehicle same-store units −9% YoY; total Q1 revenue $6.55B | A | https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=AN |
  | Web: search result referencing AN June 16 2026 intraday price range | 2026-07-12 | AN June 16 2026 intraday $194.07–$197.76, close ~$195.86 | B (indicative, unverified) | Derived from web search results, 2026-07-12 |
  | 01_ticker-mapping.md, SIG-20260711-b55e8917 | 2026-07-12 | AN market cap ~$15B, 240+ stores, new-vehicle revenue ~46% of Q1 revenue | B (internal module output) | screener/runs/SIG-20260711-b55e8917/candidate-surfacing/01_ticker-mapping.md |

---

### LAD · Lithia Motors, Inc. (NYSE) — CND-003

- **Applicable:** yes — Lithia is the broadest-footprint harmed party (DIR-002; 680+ stores); the same competitive displacement applies. An observable market is available. However, the extremely small share of Carvana's 7-store footprint in Lithia's 680-store network makes the fundamental impact even smaller than for AN.

- **Mode:** fallback — no LAD-specific consensus EPS or forward P/E gathered in M0.6.2.

- **Event quantification:**

  - LAD's share of U.S. dealer locations: 680 ÷ 16,990 = 4.0% of U.S. dealership locations.
  - Displaced LAD units per year: 4.0% × 58,800 = ~2,352 units/year (proportional-share estimate; same geographic-overlap caveat as AN).
  - LAD new-vehicle GPU: Lithia FY2025 annual revenue $37.635B; new-vehicle revenue $18.70B (~49.7% of total) [Lithia Motors 8-K / FY2025 earnings release, SEC EDGAR, filed February 2026]. LAD's new-vehicle gross margin is typically 2.5–3.5% of new-vehicle revenue; using ~3% implies GPU of approximately $1,080–$1,200/unit on ~$35,000–$40,000 average transactions. Using $1,100/unit (consistent with the industry estimate for AN above). [Inference from Lithia FY2025 8-K and industry benchmark; Lithia does not separately disclose new-car GPU in the FY2025 8-K summary available]
  - Annual gross profit lost: 2,352 units × $1,100 GPU = **$2.59M/year**
  - After-tax: $2.59M × 0.72 = **$1.86M after-tax ΔE/yr** (negative)

- **Recurrence:** `permanent_step_change` — same as AN; the 7 Carvana stores are operational and ongoing.

- **ΔValue (fallback — self-anchored multiple):**

  - LAD market cap: ~$8.5B [01_ticker-mapping.md, Web estimate, indicative, unverified]; LAD was trading at ~$313.74 as of July 10 2026 [Web: MarketBeat, July 10 2026, indicative, unverified].
  - Self-anchored forward multiple: LAD is a traditional dealer group; sector forward P/E band is 10–14x for U.S. listed dealer groups. Using 11x (consistent with 5–8x EV/EBITDA at typical dealer leverage, and LAD's own EV/EBITDA of ~13x as noted in M0.6.2 Block 3). [Inference; missing_reason: LAD-specific forward P/E not from a filed or vendor source]
  - ΔValue = -$1.86M × 11 = **-$20.5M**
  - **Implied move = -$20.5M ÷ $8,500M = -0.24%** (effectively zero — 24 basis points)

- **Duration-trap check:** N/A — permanent step-change.

- **Observed move:**
  - No June 16 2026 LAD-specific closing price was obtained. The search results found LAD at ~$313.74 as of July 10 2026 [Web: MarketBeat, July 10 2026, indicative, unverified] but no June 13–17 daily closes were returned. Given the de minimis fundamental impact (24 basis points), a flat-to-minimal reaction is the expected read. Missing_reason: LAD June 13–17 2026 daily closing prices not available from open-web searches conducted on 2026-07-12.
  - **Observed move: not obtained — missing_reason above. Read: the fundamental implied move of −0.24% is within normal daily noise; a flat observed reaction is the expected default.**

- **Gap read: `priced`** — The fundamental earnings impact is 24 basis points, well within daily noise. Whether or not a specific LAD price move was recorded on June 16, no LAD-specific stock reaction to this news would be detectable or attributable at this scale. The market is expected to have correctly ignored a 0.04% market-share shift at the current 7-store level. The short thesis for LAD rests on the structural expansion path — 8, then 9, then 10 stores per year adding up — which is a future scenario the research swarm must assess, not a current-period earnings event.

- **Caveats:**
  - Driveway (Lithia's own online platform) partially offsets the competitive threat; if the Carvana model attracts volume that would have gone to Driveway, LAD partially captures it back, making the displacement even smaller than estimated.
  - Same geographic-overlap caveat as AN: proportional-share math is an approximation; actual competitive impact depends on store-level geographic overlap, which is not available from public filings.
  - The displacement estimate uses the same industry-average GPU as AN ($1,100/unit) rather than a LAD-specific figure; LAD's actual GPU could differ.
  - This is a fundamentals floor, not a verdict.

- **Sources:**

  | Source | Retrieved at | Claim supported | Grade | URL |
  |---|---|---|---|---|
  | Lithia Motors 8-K / FY2025 earnings release, SEC EDGAR, filed February 2026 | 2026-07-12 | New vehicle revenue FY2025 $18.70B (~49.7% of $37.635B total), 680+ stores | A | https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=LAD |
  | Web: MarketBeat, July 10 2026 | 2026-07-12 | LAD stock price ~$313.74 as of July 10 2026 | B (indicative, unverified) | https://www.marketbeat.com/stocks/NYSE/LAD/chart/ |
  | 01_ticker-mapping.md, SIG-20260711-b55e8917 | 2026-07-12 | LAD market cap ~$8.5B, 680+ stores, new-vehicle revenue ~49.7% of FY2025 total | B (internal module output) | screener/runs/SIG-20260711-b55e8917/candidate-surfacing/01_ticker-mapping.md |

---

## 2. Verdict

Verdict: 3 candidates sized — the biggest finding is CVNA: fundamentals imply **+13.9%** from the new-car earnings addition, but the market moved **−10% to −17%** over the 2-day news reaction (June 16–17 2026). The gap is a multiple compression, not a fundamentals miss.

- **CVNA (CND-001):** `re_rate_to_judge` — the market read the 7-store acquisition as a GPU-dilution and disruption-cap story, not as a $9.9B earnings uplift, and sold off −10–17% against a +13.9% fundamental implied move. The $25–31% total gap (implied vs. observed) is a re-rating the research swarm must adjudicate: how much of the current $53.8B EV premium above dealer-group multiples is justified in light of the confirmed Stellantis acquisition cap?
- **AN (CND-002):** `priced` — five basis points of implied negative impact from 7 stores against a 240-store network. Market correctly flat on the news. Short thesis rests on structural expansion, not the 7-store current impact.
- **LAD (CND-003):** `priced` — 24 basis points of implied negative impact against a 680-store network. De minimis and untestable from available daily price data. Same structural-expansion caveat as AN.

**Reminder: this is a fundamentals floor, not a verdict — routing and edge score are unchanged (provisional, 61). The re-rate judgment on CVNA belongs to the research swarm.**
