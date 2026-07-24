# Relative Valuation — Peers — TSLA

**Anchor (from `01_price-and-capital-structure.md`):** Price $319.69, as-of 2026-07-23, `pool-verified`. Market cap $1,262,630.8mm (3,949.5mm shares). EV $1,235,847.8mm (broad-cash-basis, canonical). Per-share fair-value share count ≈4,252.5mm (approximate fully diluted, TSM-proxy — Inference, not from filings).

## 1. Peer Set

The peer set comes from TWO sources, both used here: (a) the Capital IQ "Quick Comparable Analysis" export in the data pool (`Company Comparable Analysis Tesla Inc .xls`), which is CIQ's own default comp set for TSLA sorted by its proprietary relevancy score; and (b) `business-model/08_competitive-map.md`, which names Ford, GM, and BYD specifically from Tesla's own competitive position (BYD is not in the CIQ export and is web-sourced here). The CIQ export lists 10 peer companies plus Tesla ("Displaying 11 Companies"). One of the 10 (NVIDIA) is flagged below as not a genuine business comparable and is excluded from the "core" median used for the premium/discount and implied-value work in Sections 3–5; it is shown for reference only.

| Peer | Ticker | Why Comparable | Source of Inclusion |
|---|---|---|---|
| Ford Motor Company | NYSE:F | US/global light-vehicle manufacturer, growing EV lineup (Mach-E, F-150 Lightning), competes directly with Tesla Automotive in North America [`08_competitive-map.md` §2] | Competitive-map (named) + CIQ default comp set |
| General Motors Company | NYSE:GM | US/global light-vehicle manufacturer with own EV lineup and large China JV presence, competes with Tesla Automotive in North America and China [`08_competitive-map.md` §2] | Competitive-map (named) + CIQ default comp set |
| BYD Company Limited | HKEX:1211 | The volume leader in global battery-electric vehicles — 2.26mm BEV units in 2025 vs Tesla's 1.64mm, 12.1% global BEV share vs Tesla's 8.8% [`08_competitive-map.md` §2, §3] | Competitive-map (named); **not in the CIQ export** — sourced from the web (`stockanalysis.com`, accessed 2026-07-24, unverified) |
| Honda Motor Co., Ltd. | TSE:7267 | Global light-vehicle manufacturer with an expanding EV/hybrid lineup, overlaps Tesla Automotive in multiple regions [`Company Comparable Analysis Tesla Inc .xls`, Business Description tab] | CIQ default comp set |
| Mercedes-Benz Group AG | XTRA:MBG | Premium global vehicle manufacturer with its own EV lineup (EQ series), overlaps Tesla's premium-price-point Automotive segment | CIQ default comp set |
| Renault SA | ENXTPA:RNO | Global light-vehicle manufacturer with EV models (Megane E-Tech, Scenic E-Tech), European-market overlap | CIQ default comp set |
| Kia Corporation | KOSE:A000270 | Global light-vehicle manufacturer with a fast-growing dedicated EV lineup (EV6, EV9), direct price-point overlap in several markets | CIQ default comp set |
| Stellantis N.V. | BIT:STLAM | Multi-brand global light-vehicle manufacturer (Jeep, Peugeot, Fiat, Ram) building out an EV transition, overlaps Tesla Automotive globally | CIQ default comp set |
| Rivian Automotive, Inc. | NasdaqGS:RIVN | US EV pure-play (trucks/SUVs), closest business-model analog to Tesla among the CIQ set (single-segment BEV manufacturer, pre-scale) | CIQ default comp set |
| Lucid Group, Inc. | NasdaqGS:LCID | US EV pure-play (luxury sedans/SUVs), same business-model analog as Rivian, earlier-stage and smaller | CIQ default comp set |
| NVIDIA Corporation | NasdaqGS:NVDA | **Flagged, not treated as a core peer.** A semiconductor/AI-compute company, not a vehicle manufacturer; included in CIQ's default set likely on relevancy-score/market-cap or AI-narrative grounds, not shared business economics. Shown in Section 2 for reference; excluded from the "core" peer median used in Sections 3–5 | CIQ default comp set (flagged exclusion) |

**No private peers requiring exclusion.** All named and CIQ-listed peers are publicly traded with disclosed multiples (BYD's via web, all others via the pool). The one limitation is BYD's absence from the pool's own CIQ export — the single most important competitor by BEV volume [`08_competitive-map.md` §5] has to be sourced externally and is labeled accordingly throughout.

## 2. Peer Multiples & Operating Stats

All figures data-as-of 2026-07-24 unless noted (BYD row: web-sourced, accessed 2026-07-24). LTM basis unless marked NTM. Source for all rows except BYD and the TSLA "reconciled" EV/EBITDA note: `Company Comparable Analysis Tesla Inc .xls`, Trading Multiples / Financial Data / Operating Statistics tabs.

| Company | P/E (LTM) | EV/EBITDA (LTM) | EV/EBIT (LTM) | EV/Sales (LTM) | FCF Yield | Rev Growth (LTM YoY) | EBITDA Margin (LTM) | ROIC | Total Debt/EBITDA (gross) | Data As-of |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| **TSLA** | 296.1x | **114.9x** (reconciled — see flag below; CIQ's own Trading Multiples tab shows 97.7x) | 288.9x | 11.9x | 0.46% (TTM FCF $5,762M ÷ mkt cap $1,262,630.8M — own calc, `earnings/01`) | +11.75% | 10.4% | 2.75% (CIQ) / 3.15%–3.74% (own calc, `09_moat.md`) | 1.3x | 2026-07-23 |
| Ford (F) | NM | 36.0x | NM | 1.0x | Not disclosed in pool | +3.82% | 4.0% | Not disclosed in pool | 18.8x | 2026-04-30 |
| GM | 40.6x | 10.8x | 18.0x | 1.0x | Not disclosed in pool | −1.10% | 8.9% | Not disclosed in pool | 7.6x | 2026-07-21 |
| BYD (1211.HK) | 26.06x (web) | 7.23x (web) | Not sourced | 1.05x (web) | −11.07% (web — heavy 2026 capex, not steady-state) | Not sourced (LTM) | Not sourced | Not disclosed | Not sourced | 2026-07-24, **web-sourced, unverified** (stockanalysis.com) |
| Honda (7267) | NM | 16.1x | NM | 0.7x | Not disclosed in pool | +0.50% | 4.6% | Not disclosed in pool | 12.8x | 2026-06-18 |
| Mercedes-Benz (MBG) | 8.7x | 9.8x | 15.8x | 0.9x | Not disclosed in pool | −8.64% | 8.5% | Not disclosed in pool | 8.5x | 2026-04-29 |
| Renault (RNO) | NM | 14.8x | 42.8x | 1.0x | Not disclosed in pool | +3.01% | 10.4% | Not disclosed in pool | 11.4x | 2026-03-18 |
| Kia (A000270) | 7.2x | 2.6x | 3.4x | 0.3x | Not disclosed in pool | +5.83% | 9.7% | Not disclosed in pool | 0.2x | 2026-05-15 |
| Stellantis (STLAM) | NM | NM | NM | 0.2x | Not disclosed in pool | +3.76% | −0.7% | Not disclosed in pool | NM | 2026-04-30 |
| Rivian (RIVN) | NM | NM | NM | 4.4x | Not disclosed in pool | +10.43% | −54.9% | Not disclosed in pool | NM | 2026-04-30 |
| Lucid (LCID) | NM | NM | NM | 5.3x | Not disclosed in pool | +61.03% | −234.9% | Not disclosed in pool | NM | 2026-05-05 |
| NVIDIA (NVDA) — *flagged, not core* | 32.0x | 30.2x | 30.9x | 19.8x | Not disclosed in pool | +70.68% | 65.3% | Not disclosed in pool | 0.1x | 2026-05-20 |
| **Core peer median (9, excl. NVDA, excl. BYD — pool-sourced only)** | 23.9x (n=3: GM, Kia, +BYD would change this — see below) | 10.8x | 16.9x | 1.0x | n/a | 3.76% | 4.6% | n/a | 9.95x | 2026-07-24 |
| **Core peer median (10, excl. NVDA, incl. BYD)** | 26.06x | 10.8x | 16.9x | 1.0x | n/a | 3.76% | 4.6% | n/a | 9.95x | 2026-07-24 |
| **CIQ full-set median (10, incl. NVDA, per CIQ's own Summary Statistics row)** | 20.3x | 14.8x | 18.0x | 1.0x | n/a | 3.79% | 6.5% | n/a | 8.5x | 2026-07-24 |

**Material finding — internal CIQ inconsistency on TSLA's own LTM EV/EBITDA (flag, not silently overridden).** The Company Comparable Analysis export's own Trading Multiples tab shows TSLA's TEV/EBITDA LTM as 97.7x. Recomputing directly from the SAME workbook's Financial Data tab (EV $1,235,847.8mm ÷ LTM EBITDA $10,755mm) gives 114.9x — a materially different number using the export's own inputs. This 114.9x figure is independently confirmed by a second CIQ export, `Tesla Inc NasdaqGS TSLA Financials_Annual.xls`, Multiples tab, which shows "TEV/LTM EBITDA — Close" = 114.90914x for the identical date (2026-07-23) [`Tesla-Inc-NasdaqGS-TSLA-Financials_Annual__Multiples.txt`, row "TEV/LTM EBITDA — Close", 2026-07-23 column]. Two independent CIQ sources agree on 114.9x against the Comparable Analysis export's own Trading Multiples tab showing 97.7x for the same company, same date, same underlying EV and EBITDA figures published two tabs away in the same file — a vendor bad-extraction/inconsistency (CLAUDE.md §20), not a genuine difference in period or definition. **114.9x is used as canonical for TSLA's own LTM EV/EBITDA throughout this report; the peer-side EV/EBITDA figures in the same Trading Multiples tab were not independently re-derivable for each peer company in this pool and are used as-published — a labeled limitation.**

**FCF yield, ROIC, and revenue growth are not disclosed for the CIQ peer set in this pool** (only price, share count, EV, LTM/NTM revenue-EBITDA-EBIT-EPS, and the ratio set shown above are in the export). BYD's FCF yield (−11.07%) is heavily negative because of the company's 2026 capex ramp — not comparable to a steady-state read — and is shown for completeness, not used in the premium/discount math below (Section 3) given no matching CIQ-peer FCF-yield data exists to build a peer median.

## 3. Premium / Discount to Peer Median

Using the **core peer median (10 companies, excl. NVDA, incl. BYD where sourced)** as the reference. Positive = TSLA trades at a premium to the peer median.

| Multiple | Company (TSLA) | Peer Median (core) | Premium / (Discount) |
|---|---:|---:|---:|
| P/E, LTM | 296.1x | 26.06x (n=3 usable: GM, Kia, BYD — most peers NM on negative/thin LTM earnings) | **+1,036%** |
| EV/EBITDA, LTM (reconciled) | 114.9x | 10.8x | **+964%** |
| EV/EBIT, LTM | 288.9x | 16.9x | **+1,610%** |
| EV/Sales, LTM | 11.9x | 1.0x | **+990%** |
| P/Tangible BV, LTM | 14.5x | 1.2x | **+1,108%** |
| EV/Sales, NTM (forward) | 11.15x | 0.93x (n=9, excl. NVDA; BYD forward EV/Sales not sourced) | **+1,099%** |
| EV/EBITDA, NTM (forward) | 71.31x | 7.68x | **+828%** |
| Forward P/E, NTM | 167.6x | 6.93x (median of 8, incl. BYD's web-sourced forward P/E of 17.1x) | **+2,321%** |

**Is the gap typical or unusual? Not assessable.** The data pool contains only a single point-in-time snapshot of peer multiples (the Company Comparable Analysis export, "As-Of Date: 2026-07-24"). No historical time series of peer-relative multiples (TSLA's multiple against this same peer set at prior dates) exists in the pool, and a reliable, apples-to-apples multi-year peer-comp history is not practically reconstructable from web sources within this agent's scope. This report cannot say whether the current ~800–2,300% premium is wider or narrower than TSLA's typical premium to these peers over the past ~3 years — it can only report the current-point-in-time gap. This is a genuine data gap, not invented.

## 4. Is the Gap Warranted?

Two of the underlying business-model findings cut in opposite directions, and the honest read is that neither supports a premium anywhere near what is observed. On the positive side, Tesla's LTM gross margin (18.9%) and LTM EBITDA margin (10.4%) sit above the core peer median (12.85% gross margin implied from Operating Statistics; 4.6% EBITDA margin), LTM revenue growth (+11.75%) beats the peer median (+3.76%), and leverage is far lower (Total Debt/Capital 15.5% vs. peer median ~54%, Total Debt/EBITDA 1.3x vs. peer median ~10.0x) [`Company Comparable Analysis Tesla Inc .xls`, Operating Statistics tab; `01_price-and-capital-structure.md` §5] — real, evidenced advantages that argue for some premium. On the negative side, `09_moat.md` found **"No moat proven"**: Tesla's return on capital (2.75%–3.74% LTM, and only 8.3%–9.4% even on the more forgiving 5-year through-cycle average) sits below its estimated ~11.5% cost of capital by 210–885 basis points on every basis computed, and `07_business-quality.md` scored the aggregate quality **33/100 (Weak)**, anchored by margin stability (22/100 — operating margin has fallen every year for three straight years, from 16.8% in FY2022 to 4.1% LTM) and a "losing" competitive position against BYD on full-year-2025 global BEV volume share (8.8% vs. BYD's 12.1%) [`08_competitive-map.md` §3]. A ~900–2,300% multiple premium is not warranted by a business whose own moat module concludes its structural advantages "have not translated into economic value creation" and whose quality score sits in the bottom third of the scoring band. **Verdict: premium is unjustified (relative downside) on the disclosed automotive/EV business as currently measured** — with the explicit caveat that none of the named peers (Ford, GM, BYD, Honda, Mercedes-Benz, Renault, Kia, Stellantis, Rivian, Lucid) carries a comparable disclosed bet on autonomous driving (FSD/robotaxi) or humanoid robotics (Optimus), so a peer-multiple lens cannot price whatever optionality the market may be assigning to those unmonetized, zero-disclosed-revenue-line initiatives [`07_business-quality.md` row: Industry rate-of-change; `09_moat.md` §2, Technology/IP row] — that valuation question belongs to `04_intrinsic-dcf` / `06_sum-of-the-parts`, not to this peer-comp module.

## 5. Implied Value from Peer Multiples

**Quality adjustment applied (base case).** Given the genuine (but modest) evidenced advantages — higher gross/EBITDA margin, faster growth, far lower leverage — against the "no moat proven" / weak-quality-score evidence, a **1.3x NTM EV/Sales multiple** is used as the warranted base case: a 40% premium to the core peer median of 0.93x NTM EV/Sales, crediting the margin/growth/leverage edge but explicitly rejecting anything near the ~11–12x actually observed. EV/Sales is used as the named primary multiple because it is the least distorted by Tesla's currently near-zero net margin and thin LTM EPS base (the P/E and EV/EBIT multiples swing to extreme values on small denominators and are shown only as dispersion, not as the primary basis). This premium choice is **Inference, not from filings.**

| Multiple | Applied Peer Multiple | Implied EV or Equity | Implied Price/Share | vs Current Price ($319.69) |
|---|---:|---:|---:|---:|
| **NTM EV/Sales — quality-adjusted (BASE CASE, named primary)** | **1.3x** (peer median 0.93x × 1.4 premium) | EV $144,117.9M → Equity $170,900.9M | **$40.19** | **−87.4%** |
| NTM EV/Sales — raw peer median (no premium; sanity check) | 0.93x | EV $103,099.7M → Equity $129,882.7M | $30.54 | −90.4% |
| LTM EV/Sales — raw peer median | 1.0x | EV $103,619.0M → Equity $130,402.0M | $30.67 | −90.4% |
| NTM EV/EBITDA — raw peer median | 7.68x | EV $133,062.2M → Equity $159,845.2M | $37.59 | −88.2% |
| LTM EV/EBIT — raw peer median | 16.9x | EV $72,298.2M → Equity $99,081.2M | $23.30 | −92.7% |
| LTM P/Tangible BV — raw peer median | 1.2x | Equity multiple direct: $21.99/sh TangBV × 1.2 | $26.39 | −91.7% |
| NTM Forward P/E — raw peer median | 6.93x | Equity multiple direct: $1.91/sh NTM EPS × 6.93 | $13.23 | −95.9% |

Equity bridge used for EV-basis rows: `Implied equity = Implied EV − Total debt ($16,080M) − Minority interest ($661M) − Preferred ($0) + Cash & ST investments ($43,524M, broad canonical basis)` = `Implied EV + $26,783M`, divided by the ≈4,252.5mm per-share fair-value share count, both per `01_price-and-capital-structure.md` §4, §7. P/E and P/TangBV rows apply the multiple directly to the per-share metric (no EV bridge needed).

**Base-case point: ≈$40/share** (1.3x NTM EV/Sales, quality-adjusted). **Dispersion across methods: ≈$13–$40/share**, i.e. every peer-comp method — even the quality-adjusted one — implies a value 85–96% below the current $319.69 price. The dispersion is wide because Tesla's own multiples are currently most extreme on the metrics most sensitive to its thin near-term earnings (forward P/E, EV/EBIT), and narrowest on revenue-based multiples, which is why EV/Sales is used as the primary basis.

## 6. Relative Read

On every multiple available in this pool — LTM and NTM, price-based and enterprise-value-based — Tesla trades at a premium to its core auto/EV peer median of roughly 800% to 2,300%, and the quality evidence (a "No moat proven" verdict with return on capital 210–885 basis points below its own cost of capital, and a 33/100 "Weak" business-quality score anchored by three straight years of margin compression) does not support a premium of anywhere near that size. The base-case peer-multiple-implied value is **≈$40/share** (1.3x NTM EV/Sales, quality-adjusted for Tesla's real margin/growth/leverage edge over peers), with a cross-method dispersion of **≈$13–$40/share** — all of it far below the $319.69 current price. The one thing this peer-comp lens cannot price is whatever the market is paying for Tesla's unmonetized autonomous-driving and robotics bets, since no named peer carries a comparable disclosed initiative; that question belongs to the DCF and sum-of-the-parts methods downstream, not to this module.
