# Relative Valuation — Peers — UBER

**Anchor (reused verbatim from `01_price-and-capital-structure.md`, not re-derived):** price $68.18 (close, Aug-05-2026, pool-verified); market-cap share count 2,035.599mm; per-share fair-value share count 2,087.980mm (LTM weighted-average diluted); net debt (strict) $9,340mm; minority interest $1,083mm; preferred $0; market cap $138,787.14mm; EV $149,210.14mm. Reporting standard US GAAP, currency USD. No `ciq_facts.json` sidecar exists for this run (confirmed absent in `00_valuation-data-triage.md`); every figure below is a Capital IQ export (source tier 5), cited as such.

## 1. Peer Set

The peer set is **sourced from two places**: the three named competitors in `business-model/08_competitive-map.md` (Lyft, DiDi, Grab — Mobility-segment rivals) plus Capital IQ's own default comp-set selection for Uber (`Company Comparable Analysis Uber Technologies Inc.xls`, 10 names, as-of 2026-08-06), which is the source `08_competitive-map.md` itself draws from and separately flags DoorDash as a Delivery-segment (not Mobility-only) rival excluded from its own map. Because this agent values the whole company (Mobility + Delivery + Freight), DoorDash is added back in as a core comparable. **Neither set is fully self-selected** — it is competitive-map-named plus the vendor's own relevancy-ranked list.

| Peer | Ticker | Why Comparable | Source of Inclusion |
|---|---|---|---|
| Lyft, Inc. | NasdaqGS:LYFT | Direct US/Canada peer-to-peer ridesharing marketplace, same two-sided matching model as Uber Mobility | `08_competitive-map.md` (named) + CIQ comp set |
| DoorDash, Inc. | NasdaqGS:DASH | Multi-sided commerce/delivery marketplace (merchants–consumers–dashers); the closest structural match to Uber Delivery, Uber's second-largest segment | CIQ comp set only — `08_competitive-map.md` excluded it because that map is scoped to the Mobility segment; added here because this is a whole-company valuation |
| DiDi Global Inc. | OTCPK:DIDI.Y | Ride-hailing platform; Uber's CEO names DiDi directly as a head-to-head Brazil Mobility and Delivery ("DiDi Food") competitor on the Q2 FY2026 call | `08_competitive-map.md` (named, management-cited) + CIQ comp set |
| Grab Holdings Limited | NasdaqGS:GRAB | Southeast Asia ride-hailing + delivery "superapp" — the same multi-vertical, take-rate model as Uber, at smaller scale | `08_competitive-map.md` (named) + CIQ comp set |

**Core marketplace peer set = Lyft, DoorDash, DiDi, Grab** — these four run the same asset-light, two/three-sided digital-marketplace economics as Uber and are used for the primary premium/discount and implied-value work below.

**Extended Capital IQ default set (context only, excluded from the primary median):**

| Company | Ticker | Why excluded from the core median |
|---|---|---|
| Avis Budget Group, Inc. | NasdaqGS:CAR | Asset-heavy car-rental fleet owner — carries fleet-financing debt of $28.6bn against $1.5bn LTM EBITDA (18.6x net debt/EBITDA); a fundamentally different balance-sheet and capital-intensity model than Uber's asset-light marketplace [Company Comparable Analysis Uber Technologies Inc.xls, Financial Data & Business Description tabs, as-of 2026-08-06] |
| Hertz Global Holdings, Inc. | NasdaqGS:HTZ | Same asset-heavy car-rental model; net debt/EBITDA of 55.1x reflects fleet-financing leverage structurally incomparable to a marketplace operator [same source] |
| Daiwa Motor Transportation Co., Ltd. | TSE:9082 | Small (LTM revenue $126mm), single-city traditional taxi/real-estate conglomerate in Japan — not a digital marketplace [same source] |
| Taiwan Taxi Co., Ltd. | TPEX:2640 | Small (LTM revenue $99mm) traditional local taxi dispatch operator, not a platform marketplace [same source] |
| Chenqi Technology Limited | SEHK:9680 | Business-model-relevant (ride-hailing + Robotaxi in China) but extremely small (LTM revenue $783mm), early-stage/recently listed, and loss-making at every margin line — too immature for a reliable multiple read [same source] |
| Chariot Transit Inc. | Private, defunct | "Went out of business" per its own Capital IQ business description — a private, non-operating entity with no public multiples. Flagged per the partial-data rule, not guessed at; excluded entirely [Company Comparable Analysis Uber Technologies Inc.xls, Business Description tab] |

These six names remain in the extended CIQ default-comp-set summary statistics shown in §2 for transparency (Capital IQ's own vendor-computed median across all 10 names, including the mismatched ones), but the core 4-name median is the one used for the premium/discount read (§3) and implied value (§5), consistent with the Business-Type Method Map principle that a comparable must match the target's actual economics, not its surface industry label.

## 2. Peer Multiples & Operating Stats

All figures: Capital IQ export, `Company Comparable Analysis Uber Technologies Inc.xls` (Trading Multiples, Operating Statistics, Financial Data tabs), **data as of 2026-08-06**, currency USD, LTM = latest twelve months through each company's own most recent filing date shown. Uber's own multiples cross-checked against `Uber Technologies Inc NYSE UBER Financials.xls`, Multiples/Ratios tabs (close Aug-05-2026) — the two exports tie within rounding (e.g., TEV/LTM EBITDA 19.2x both places).

### LTM (trailing) — core marketplace peers + Uber

| Company | P/E (LTM) | EV/EBITDA (LTM) | EV/EBIT (LTM) | EV/Sales (LTM) | FCF Yield | Rev Growth (LTM YoY) | EBITDA Margin (LTM, GAAP-basis) | ROIC | Net Debt/EBITDA | Data As-of |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| **Uber (UBER)** | 14.9x | 19.2x | 22.6x | 2.7x | 7.3%¹ | 16.7% | 13.5% | 10.6% (LTM)² | 1.19x | 2026-08-05/06 |
| Lyft (LYFT) | 2.3x³ | 144.1x⁴ | NM | 0.9x | 18.9%⁵ | 9.4% | -0.1% | Not disclosed | Net cash (n.m.) | 2026-08-06 |
| DoorDash (DASH) | 108.7x | 53.4x | 99.9x | 5.5x | ~1.2%⁶ | 33.6% | 9.5% | Not disclosed | Net cash (n.m.) | 2026-08-06 |
| DiDi Global (DIDI.Y) | NM | NM | NM | 0.3x | Not sourced | 10.0% | -1.6% | Not disclosed | Net cash (n.m.) | 2026-08-06 |
| Grab Holdings (GRAB) | 33.9x | 32.5x | 80.5x | 3.0x | Not sourced | 21.5% | 9.2% | Not disclosed | Net cash (n.m.) | 2026-08-06 |
| **Core peer median (4)** | 71.3x⁷ | 42.9x⁸ | 90.2x⁹ | 1.95x | n/a¹⁰ | 15.7% | 4.55% | n/a | n/a | — |
| **Core peer mean (4)** | 48.3x⁷ | 76.7x⁸ | 90.2x⁹ | 2.43x | n/a | 18.7% | 4.6% | n/a | n/a | — |

¹ Uber FCF yield = LTM FCF $10,116mm [`earnings/01_historical-financials.md`, §2] ÷ market cap $138,787.14mm [`01_price-and-capital-structure.md`, §3] = 7.29% — own calculation, not a CIQ-tabulated figure.
² Uber ROIC = CIQ "Return on Capital %," LTM = 10.59% [Financials.xls, Ratios tab]. `business-model/09_moat.md` flags this as a **recent peak** — the 3-year average (FY2023–FY2025) is 6.16%, below the ~8.1% WACC estimate; see §4 below.
³ Lyft's LTM net income margin (43.8%) is inconsistent with its negative EBITDA/EBIT for the same period and reads as a one-off non-operating item (e.g., a tax credit), not recurring earnings — `08_competitive-map.md` flags this; the 2.3x P/E is **not a clean earnings comparison** and is excluded from the core-peer P/E median.
⁴ Lyft's 144.1x EV/EBITDA is a near-zero-denominator artifact (LTM EBITDA is -$6.7mm, essentially breakeven) — economically not meaningful; included in the range for transparency but flagged.
⁵ Lyft FCF yield: Web-sourced as of 2026-07-16, unverified (financecharts.com) — "18.85%," described as an all-time-high TTM FCF period ($1.1bn). Not a data-pool figure; carries no vendor error-margin disclosure.
⁶ DoorDash FCF yield: derived, not a single sourced figure — FY2025 FCF ≈$1.1bn [Web: macrotrends.net, unverified, FY2025 annual] ÷ current LTM market cap $89,809.2mm [Capital IQ Comparable Analysis, 2026-08-06] ≈ 1.2%. **Basis mismatch flagged**: annual FY2025 FCF against a current-date market cap, not an LTM-to-LTM match — treat as directional only.
⁷ P/E core median/mean exclude Lyft's flagged 2.3x (see note 3); computed on DoorDash (108.7x) and Grab (33.9x) only — median = mean = (108.7+33.9)/2 = 71.3x with just two usable data points. DiDi is NM (loss-making).
⁸ EV/EBITDA core median/mean exclude DiDi (NM, negative EBITDA); Lyft's 144.1x is **included** in the mean (pulling it far above the median) but median is computed on all three usable values (32.5, 53.4, 144.1) = 53.4x — shown as 42.9x here is the median of the two non-distorted names (DoorDash 53.4x, Grab 32.5x) with Lyft's 144.1x excluded as an outlier artifact (note 4); the mean (76.7x) includes Lyft to show the full spread.
⁹ EV/EBIT core median/mean computed on DoorDash (99.9x) and Grab (80.5x) only; Lyft and DiDi are NM (negative EBIT).
¹⁰ FCF yield median not computed — DiDi and Grab data not sourced; only 2 of 4 core peers have any FCF figure, and one of those two carries a basis-mismatch flag (note 6).

**Reliability flag on LTM multiples:** three of the four core peers (Lyft, DiDi, and to a lesser extent Grab/DoorDash) run near-zero or negative LTM EBITDA/EBIT/EPS, which makes trailing P/E, EV/EBITDA, and EV/EBIT multiples for this peer set extreme, NM, or driven by tiny denominators rather than by genuine valuation differences. The **forward (NTM) basis below is materially more reliable** for this specific comp set and is used as the primary lens in §3–§5.

### NTM (forward) — core marketplace peers + Uber (Capital IQ consensus)

| Company | NTM EV/Revenue | NTM EV/EBITDA | NTM P/E | NTM EPS ($) | NTM Revenue ($mm) | NTM EBITDA ($mm) |
|---|---:|---:|---:|---:|---:|---:|
| **Uber (UBER)** | 2.41x | 11.89x | 16.22x | 4.20 | 62,191.9 | 12,589.0 |
| Lyft (LYFT) | 0.77x | 7.94x | 9.76x | 1.69 | 7,537.8 | 734.1 |
| DoorDash (DASH) | 4.50x | 20.78x | 31.61x | 6.56 | 19,513.8 | 4,224.5 |
| DiDi Global (DIDI.Y) | 0.30x | 16.58x | 28.08x | 0.12 | 38,123.8 | 686.0 |
| Grab Holdings (GRAB) | 2.40x | 12.26x | 24.65x | 0.15 | 4,671.7 | 913.1 |
| **Core peer median (4)** | 1.585x | 14.42x | 26.365x | — | — | — |

Source: `Company Comparable Analysis Uber Technologies Inc.xls`, Trading Multiples & Financial Data tabs, as-of 2026-08-06. Uber's own NTM figures cross-checked against `UberTechnologies,IncNYSEUBEREstimatesReport (1).xls`, Multiples tab (NTM TEV/REV 2.407x, TEV/EBITDA 11.89x, P/E 16.22x) — exact match.

### Extended Capital IQ default comp set (10 names, context/cross-check only — includes the mismatched-economics names from §1)

| Metric | High | Low | Mean | Median (all 9 with data) |
|---|---:|---:|---:|---:|
| LTM TEV/Revenue | 5.5x | 0.1x | 2.1x | 2.3x |
| LTM TEV/EBITDA | 144.1x | 9.4x | 44.2x | 32.5x |
| LTM TEV/EBIT | 99.9x | 12.0x | 57.4x | 64.0x |
| LTM P/Diluted EPS | 108.7x | 2.3x | 39.8x | 33.9x |
| LTM P/TangBV | 37.1x | 0.9x | 7.9x | 2.6x |
| NTM TEV/Revenue | 4.5x | 0.3x | 2.18x | 2.32x |
| NTM TEV/EBITDA | 63.83x | 7.94x | 26.85x | 18.68x |
| NTM P/E | 33.45x | 9.76x | 25.51x | 28.08x |

This is Capital IQ's own vendor-computed summary statistic block [Trading Multiples tab, "Summary Statistics" rows], not an eyeballed figure — but it mixes asset-light marketplaces with asset-heavy car-rental (Avis, Hertz) and small traditional-taxi operators (Daiwa, Taiwan Taxi), so it is shown for cross-check only and is **not** the basis for §3–§5 below.

## 3. Premium / Discount to Peer Median

Computed against the **core 4-name marketplace peer median** (§2). Positive = premium (Uber's multiple sits above the median, i.e., the market pays more per unit of that metric); negative = discount.

| Multiple | Basis | Company | Peer Median | Premium / (Discount) |
|---|---|---:|---:|---:|
| EV/Revenue | NTM | 2.41x | 1.585x | **+52.0%** (premium) |
| EV/EBITDA | NTM | 11.89x | 14.42x | **-17.5%** (discount) |
| P/E | NTM | 16.22x | 26.365x | **-38.5%** (discount) |
| EV/Revenue | LTM | 2.7x | 1.95x | +38.5% (premium) |
| EV/EBITDA | LTM (ex-Lyft outlier) | 19.2x | 42.9x | -55.2% (discount, low-reliability — see §2 flag) |
| EV/EBIT | LTM | 22.6x | 90.2x | -74.9% (discount, low-reliability — only 2 usable peer data points) |
| P/E | LTM (ex-Lyft, flagged) | 14.9x | 71.3x | -79.1% (discount, low-reliability — only 2 usable peer data points) |

**Revenue-multiple caveat:** EV/Revenue comparability across this specific peer set is weak — ride-hailing/delivery platforms recognize revenue on different gross-bookings-vs-net-take-rate conventions that this pool does not reconcile line-by-line, so a peer with a much lower take rate mechanically shows a lower EV/Revenue multiple without being "cheaper" in any economic sense. The EV/Revenue premium above is shown for completeness but is **not used** in the implied-value work in §5.

**Is the gap typical or unusual? Not assessable.** No peer-multiple time series exists in this data pool — only the current (2026-08-06) snapshot for each peer. `02_multiples-own-history.md` (Uber's own multiple history) is a separate question from the peer-relative gap history, and answering "is today's gap to peers wider/narrower than normal" requires knowing what each peer's own multiple was at prior points, which this pool does not provide. This is stated as a genuine gap, not assumed away.

## 4. Is the Gap Warranted?

The gap is mixed, not one-directional, and the evidence points toward the EV/EBITDA and P/E discounts being **too deep relative to what the fundamentals argue**, while a smaller, genuine discount is defensible. On the metrics that matter most for a scaled, profitable platform — margin and growth — Uber leads or matches this exact peer set: its LTM EBITDA margin (13.5%, GAAP-basis) is the highest of the four core peers (DoorDash 9.5%, Grab 9.2%, Lyft -0.1%, DiDi -1.6%) [§2], and its LTM revenue growth (16.7%) sits close to the core-peer median (15.7%) despite Uber's far larger base. Against that, `business-model/09_moat.md` finds **no moat proven on an economic basis** — Uber's 3-year average return on capital (6.16%, FY2023–FY2025) sits below its ~8.1% estimated cost of capital, and only the two most recent years clear that line, a pattern the moat agent explicitly labels a "recent peak," not a demonstrated through-cycle advantage. `business-model/07_business-quality.md` scores overall quality only 47/100 (Mixed/Average), with regulatory dependence (28/100) and competitive intensity (32/100) — both cited with the same Brazil/DiDi/Meituan incentive-spend evidence used in `08_competitive-map.md` — as the binding constraints, and flags Uber's AV bet ($10bn spread across six-plus unproven partners) as a Filter 5 fast-changing-industry risk (rate-of-change score 35/100) that caps how much durability credit any current margin lead deserves. Uber is also the only net-debt name among the four core peers (1.19x net debt/EBITDA vs. net cash at Lyft, DoorDash, DiDi, and Grab), a modest but real balance-sheet asymmetry. Netting these: the market's ~-17.5% NTM EV/EBITDA discount and ~-38.5% NTM P/E discount are larger than a fair reading of the quality gap supports, given Uber's margin leadership over this exact set — **the discount is too deep (relative upside)** on both metrics, but only to a modest degree once the moat/quality caveats are priced in (see the quality-adjusted multiples in §5, not the raw peer median).

## 5. Implied Value from Peer Multiples

All implied-value work uses `01`'s canonical net debt ($9,340mm), minority interest ($1,083mm), preferred ($0), and per-share fair-value share count (2,087.980mm, diluted weighted-average) — never CIQ's own Implied Valuation tab share count (2,042.56mm), which is shown only as a labeled cross-check below. Basis is matched throughout: NTM peer multiple × NTM company metric.

**Quality adjustment applied:** given the moat/quality caveats in §4 (no moat proven on a through-cycle ROIC-vs-WACC basis; business quality 47/100; Filter 5 fast-changing-industry flag on AV disintermediation risk; Uber alone carries net debt in this net-cash peer set), a haircut is applied to the raw core-peer median rather than using it unadjusted: **-10% on EV/EBITDA** (smaller haircut — margin and scale evidence are strong and directly comparable) and **-15% on P/E** (larger haircut — only 4 data points feed this median, EPS is the metric most sensitive to non-operating/tax noise even on a forward basis, and Uber carries more financial leverage than any core peer).

| Multiple | Applied Peer Multiple | Implied EV or Equity | Implied Price/Share | vs Current Price ($68.18) |
|---|---:|---:|---:|---:|
| NTM EV/EBITDA, quality-adjusted (13.0x = 14.42x peer median − 10%) | 13.0x | EV $163,657mm → Equity $153,234mm | **$73.39** | **+7.6%** |
| NTM EV/EBITDA, raw peer median (unadjusted) | 14.42x | EV $181,534mm → Equity $171,111mm | $81.95 | +20.2% |
| NTM P/E, quality-adjusted (22.4x = 26.365x peer median − 15%) | 22.4x | Equity value implicit (per-share metric) | $94.08 | +38.0% |
| NTM P/E, raw peer median (unadjusted) | 26.365x | Equity value implicit (per-share metric) | $110.73 | +62.4% |
| NTM EV/Revenue, peer median (context only — excluded, see §3 caveat) | 1.585x | EV $98,574mm → Equity $88,151mm | $42.22 | -38.1% |

**Base-case point: $73.39/share** — the NTM EV/EBITDA read at the quality-adjusted multiple (13.0x), because EV/EBITDA avoids the EPS-level tax/SBC noise flagged in `earnings/01_historical-financials.md` §4 and rests on four usable forward data points rather than two.

**Dispersion across usable methods (EV/EBITDA and P/E, adjusted and unadjusted): roughly $73–$111/share.** The EV/Revenue read ($42/share) is excluded from this dispersion, not because it is inconvenient, but because the take-rate/revenue-recognition mismatch across this peer set (§3) makes that specific comparison unreliable, not merely conservative.

**Cross-check — Capital IQ's own Implied Valuation tab** [`Company-Comparable-Analysis-Uber-Technologies-Inc__Implied-Valuation.txt`], built on the full 10-name extended set (§2) and CIQ's own 2,042.56mm share count, computes a mean-across-all-multiples implied price of $121.17/share and a median of $106.11/share — both well above this agent's core-4-peer, quality-adjusted figures, because the CIQ blend includes the mismatched-economics names' multiples (Avis, Hertz, Daiwa, Taiwan Taxi, Chenqi) and does not apply any quality haircut. This is shown as a labeled reference point, not adopted as a method.

## 6. Relative Read

Uber trades at a genuine discount to its closest same-business-model peers on forward earnings (-38.5% NTM P/E) and forward cash-margin (-17.5% NTM EV/EBITDA) multiples, even though it has the highest EBITDA margin and comparable revenue growth among the four-name core marketplace set (Lyft, DoorDash, DiDi, Grab). That gap is only partly warranted: `business-model/09_moat.md`'s own finding that Uber's return on capital has cleared its cost of capital for only two years (not a full cycle) and `07_business-quality.md`'s 47/100 mixed quality score with an unresolved AV-disintermediation risk (Filter 5) justify some discount, but not the full one priced in today. Applying a quality-adjusted peer multiple (13.0x NTM EV/EBITDA, a 10% haircut to the raw 14.42x peer median) implies a base-case value of **$73.39/share (+7.6% vs. the $68.18 current price)**, with a cross-method dispersion of roughly **$73–$111/share** once the P/E read (quality-adjusted and unadjusted) is included; the EV/Revenue-implied $42/share is excluded as unreliable given cross-company revenue-recognition differences in this peer set. No peer-multiple history exists in the pool, so whether today's gap is wider or narrower than Uber's typical relationship to these four names is **not assessable**.
