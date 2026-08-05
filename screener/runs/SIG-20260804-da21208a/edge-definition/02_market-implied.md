# M0.6.2 Market-Implied View — SIG-20260804-da21208a

## 1. Subject

**Grab Holdings Limited (Nasdaq: GRAB)** — the primary issuer named directly in the signal payload (M0.1 event statement: Grab's own 4 August 2026 guidance raise, Q2 2026 results, and buyback announcement). Because the record carries a single named issuer, this dashboard is built at the issuer level throughout, including the blocks (options, short interest) that only exist at that level — no macro/aggregate substitution is needed here.

All figures below are dated **2026-08-05** unless a different date is shown next to the figure. Current share price: **$3.72** (stockanalysis.com, 2026-08-05) — up 1.4% from the $3.67 close the session before the guidance raise, but down 2.6% from the $3.82 after-hours print recorded immediately after the release (thesis_record.json, WC-006). The initial pop has partly faded one trading day later.

## 2. The Five Blocks

### Block 1 — Estimate Dispersion

| | Value | Source (dated) |
|---|---|---|
| FY2026 consensus revenue — high | $4.2bn | stockanalysis.com, Analyst Forecast, retrieved 2026-08-05 (23 analysts) |
| FY2026 consensus revenue — average | $4.1bn | stockanalysis.com, Analyst Forecast, retrieved 2026-08-05 |
| FY2026 consensus revenue — low | $4.0bn | stockanalysis.com, Analyst Forecast, retrieved 2026-08-05 |
| FY2026 consensus EPS — high / avg / low | $0.09 / $0.08 / $0.08 | stockanalysis.com, Analyst Forecast, retrieved 2026-08-05 |
| Company's own FY2026 revenue guidance (for comparison) | $4.10bn–$4.15bn | Grab Holdings IR press release, 2026-08-04 (thesis_record.json WC-001) |

*Interpretation:* The revenue spread is $0.2bn, about 4.9% of the average — a tight fence, and the average ($4.1bn) already sits inside the company's own newly raised guidance band. This snapshot is taken one trading day after the 4 August raise, so the tightness confirms the sell side moved to match management fast, not that the range was already this tight before the print.

### Block 2 — Revision Trajectory (3m / 1m / now)

| Checkpoint | FY2026 revenue anchor | Source (dated) |
|---|---|---|
| ~3 months ago (2026-05-04, Q1 2026 print) | Guidance $4.04bn–$4.10bn (midpoint $4.07bn) | Grab Q1 2026 earnings release, 2026-05-04 (thesis_record.json WC-001 baseline) |
| ~1 month ago (early July 2026) | Same guidance, unchanged: $4.04bn–$4.10bn (midpoint $4.07bn) | No guidance update issued between the Q1 (2026-05-04) and Q2 (2026-08-04) prints — confirmed by the WC-001 baseline being dated to the Q1 print, not an interim revision |
| Now (2026-08-04/05) | Raised guidance $4.10bn–$4.15bn (midpoint $4.125bn); analyst consensus average $4.1bn | Grab IR press release, 2026-08-04; stockanalysis.com forecast, 2026-08-05 |

*Interpretation:* The company guidance path — the anchor sell-side estimates were pinned to — was flat for roughly three months and then stepped up 1.4% at the midpoint on 4 August. **Missing_reason:** a dollar-denominated sell-side consensus revision history with exact 90/60/30-day-ago columns (e.g., a Zacks or Visible Alpha revision table) was searched at zacks.com/stock/quote/GRAB/detailed-earning-estimates (blocked by bot-detection) and not independently retrieved elsewhere; the guidance-trajectory table above is used as the closest verifiable proxy, and is labeled as company guidance, not raw analyst consensus dollars, to avoid conflating the two.

### Block 3 — Implied Scenario from the Multiple

| Input | Value | Source (dated) |
|---|---|---|
| Enterprise value (EV) | $10.67bn | stockanalysis.com, Key Statistics, 2026-08-05 |
| Market cap | $15.17bn | stockanalysis.com, Key Statistics, 2026-08-05 |
| FY2026 adjusted EBITDA guidance midpoint | $730m ((720+740)/2) | Grab IR press release, 2026-08-04 (thesis_record.json WC-002); "adjusted EBITDA" is Grab's own non-GAAP defined metric |
| FY2025 actual adjusted EBITDA | $500m | Grab Fourth Quarter and Full Year 2025 Results release, 2026-02-12 |
| Uber (UBER) trailing EV/EBITDA — peer reference | 21.22x | stockanalysis.com, Key Statistics, 2026-08-05 (trailing, not forward — labeled) |

**Arithmetic:**
- Forward EV/EBITDA on guidance = $10,670m ÷ $730m = **14.6x**
- Implied YoY EBITDA growth baked into the guidance = ($730m − $500m) ÷ $500m = **46.0%**
- If GRAB were priced at Uber's trailing 21.22x on GRAB's own FY26 EBITDA guidance midpoint: implied EV = $730m × 21.22 = **$15.5bn**, about 45% above GRAB's actual $10.67bn EV
- Cap–EV bridge: $15.17bn market cap − $10.67bn EV ≈ $4.5bn of net cash/investments priced in but not decomposed by source into gross debt vs. cash (inferred from the bridge, not a filed net-debt figure)

*Interpretation:* Even though management just guided to 46% adjusted-EBITDA growth — far faster than Uber's own pace — GRAB trades at 14.6x forward EBITDA versus Uber's 21.22x trailing multiple. The gap implies the market is pricing a scenario where this growth rate does not hold through the guided period (a deceleration path, not a continuation of the Q2 print), and/or applying a standing discount for GRAB's smaller scale, Southeast Asia listing, and large uncommitted cash balance rather than crediting the cash at par.

### Block 4 — Options Implied Move

| Metric | Value | Source (dated) |
|---|---|---|
| Implied move into the just-completed print (2026-08-03) | 10.29% | optionslam.com, GRAB Earnings Straddle History, retrieved 2026-08-05 |
| Actual realized move (max intraday / at close) | 8.17% max / 1.36% close — inside the implied move | optionslam.com, retrieved 2026-08-05 |
| IV / IV rank (stale snapshot) | IV ~40.6%, IV rank ~33rd percentile | Web-sourced snapshot dated approximately 2026-06-26 — over five weeks old, flagged stale |

*Interpretation:* The options market correctly sized a double-digit move for the 3 August print and the stock's realized move landed inside it — an orderly, not disorderly, reaction. **Missing_reason:** ATM call/put premiums and an implied-move percentage specific to the NEXT catalyst (Q3 2026 earnings, expected around 2026-11-11 per optionslam.com's own earnings calendar) were searched on optionslam.com and unusualwhales.com/stock/GRAB/volatility; optionslam explicitly states "historical tracking data for that date is not yet available," and the unusualwhales page returned only JS-rendered shell content with no extractable data via fetch. A current (post-print) IV percentile reading was also not found — the only IV rank figure located is five-plus weeks stale and is shown above labeled as such, not as current.

### Block 5 — Short Interest & Positioning

| Metric | Value | Source (dated) |
|---|---|---|
| Shares short | 315.17 million | stockanalysis.com, Key Statistics, 2026-08-05 |
| Short % of float | 11.35% | stockanalysis.com, Key Statistics, 2026-08-05 |
| Institutional ownership | 50.04% | stockanalysis.com, Key Statistics, 2026-08-05 |
| Insider ownership | 3.62% | stockanalysis.com, Key Statistics, 2026-08-05 |
| Named passive/institutional holders | Vanguard Group (~8.18m shares, ~0.20% of Grab, grew position 7.7% in Q1); BlackRock named among largest shareholders (share count not sourced) | MarketBeat / holdingschannel.com 13F aggregation, dated to Q1 2026 filings — soft-sourced, flagged |

*Interpretation:* At 11.35% of float, short interest is elevated for a large-cap platform stock — a meaningful bear cohort was already positioned ahead of the print, not a name the market was universally bullish on. **Note:** other web sources returned materially different short-interest percentages (5.47%, 9.19%, 4.56% of float) for GRAB, reflecting different free-float denominators and FINRA's biweekly settlement lag rather than a single clean series; the 11.35% figure above is the one independently verified against its own cited page and is used as the primary read, with the conflict flagged rather than hidden. The named-fund detail (Vanguard, BlackRock) is web-aggregated from 13F filings, not independently re-verified against SEC EDGAR directly, and is labeled accordingly.

## 3. Implied Scenario Interpretation

Two things point the same way. **Block 3** shows the market paying 14.6x forward EBITDA for guidance implying 46% EBITDA growth — a discount to Uber's own 21.22x trailing multiple despite GRAB's guided pace being roughly double Uber's — which only makes sense if the market expects that growth rate to fade rather than persist. **Block 5** adds that 11.35% of the float is already short, meaning a real bear cohort is positioned against the guidance holding. Read together with **Block 4** (the options market priced, and the stock cleared, an orderly ~10% move on the print itself — no panic, no euphoria), the scenario the market is pricing is not "guidance miss imminent" and not "durable re-rate to peer multiples" — it is a **show-me discount**: the raise is provisionally believed for FY2026 (Block 1's tight, already-updated estimate band), but the market is withholding the growth-durability premium a 46%-EBITDA-growth platform would otherwise command until the pace survives at least one more quarter.

## 4. Coverage

- **all_five_fields_present:** true (all five blocks carry sourced, dated data and an interpretation line)
- **fields_missing_flagged:**
  - Block 2 — a dollar-denominated sell-side consensus revision history (exact 90/60/30-day columns) could not be retrieved (zacks.com blocked by bot-detection); a company-guidance-trajectory proxy is used instead, clearly labeled.
  - Block 3 — a formalized, independently citable "Southeast Asia on-demand platform sector normal EV/EBITDA range" was searched (DBS Vickers research PDF — unreadable/corrupted extraction; RS Capital Substack — wrong-dated preview, paywalled valuation section; minichart.com — HTTP 403) and not found; Uber's multiple is used as a single verifiable peer point instead of a range.
  - Block 4 — ATM options premiums and an implied-move % specific to the next catalyst (Q3 2026 earnings, ~2026-11-11) are not yet tracked by optionslam.com or extractable from unusualwhales.com; only the just-completed print's implied move and a stale (~5-week-old) IV rank are available.
  - Block 5 — short-interest percentage of float conflicts across sources (4.56%–11.35%); the highest-confidence, directly-verified figure (11.35%, stockanalysis.com) is used and the conflict is flagged rather than resolved by averaging.

## 5. Verdict

Verdict: 5/5 blocks filled (each with noted sub-gaps) — market pricing a show-me discount: FY26 guidance provisionally believed, growth-durability premium withheld pending confirmation
