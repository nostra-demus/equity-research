# M0.5 Primary Falsification — SIG-20260612-dd716589

## 1. The Kill Switch

- **falsification_sentence:** QatarEnergy publicly announces that Trains 4 and 6 at Ras Laffan have resumed cargo loadings — confirmed by a QatarEnergy corporate announcement or an on-list newswire (Bloomberg, Reuters, or Argus Media) — and JKM front-month spot falls back below $12.00/MMBtu within 10 trading days of that announcement, confirming the market has priced in the supply restoration.
- **falsification_condition_type:** mechanism_reversal — the supply disruption that is the sole cause of elevated LNG prices and shipping rates ends earlier than the declared mid-August 2026 force majeure horizon, removing the price and rate support that the top-tier beneficiaries (DIR-001 LNG Shipping, DIR-002 non-Qatar liquefaction, DIR-003 gas storage) depend on.

## 2. Monitoring Specification

| Field | Value |
|---|---|
| monitorable_metric_1 | JKM front-month LNG spot price — US EIA Weekly Natural Gas Report (eia.gov/naturalgas/weekly), published every Wednesday; supplemented by lngpriceindex.com/jkm-price (unverified, labelled) for intra-week reads |
| monitorable_metric_2 | QatarEnergy force majeure status — QatarEnergy corporate announcements (qatarenergy.com/en/media-centre), cross-referenced with Bloomberg LNG supply desk and LNG Prime (lngprime.com), both of which have tracked every prior extension in real time (WC-004 source) |
| monitorable_threshold_rate | 12.00 |
| monitorable_threshold_rate_unit | USD/MMBtu (JKM front-month spot; threshold represents a ~25% decline from the confirmed $16.02/MMBtu peak and re-entry into the $10–$12/MMBtu pre-disruption range established in WC-001) |
| monitorable_threshold_date | 2026-08-15 (one day after the declared mid-August 2026 force majeure end date; any confirmed Trains 4 and 6 restart followed by JKM at or below $12.00/MMBtu on this date confirms falsification — the thesis has no price support argument remaining) |

## 3. Uncomfortable Check

- **uncomfortable_check:** PASS (locked true)
- **uncomfortable_check_rationale:** The load-bearing claim this falsifier attacks is the one fact every top-tier beneficiary depends on: Qatar's 12.8 mtpa supply gap (17% of Qatar's total capacity, WC-006) keeps LNG spot prices 35–51% above pre-disruption levels and LNG shipping rates 614% above baseline. If Trains 4 and 6 restart ahead of schedule and JKM falls below $12.00/MMBtu, that gap closes. DIR-001 (LNG Shipping) loses the rate premium that is its entire thesis — shipping rates follow supply availability directly, and $300,000/day rates are only defensible while tonnage demand is structurally elevated by the Qatar detour. DIR-002 (non-Qatar liquefaction) loses the 35–51% price uplift on spot and portfolio cargoes that is its incremental revenue argument. DIR-003 (gas storage) loses the urgency premium that makes the 28% vs. 41% storage deficit (WC-005) a pricing event — an early restart allows the injection season to proceed at normal rates, compressing the storage spread. A motivated holder cannot explain this away: JKM at $11.50/MMBtu with Trains 4 and 6 confirmed loading cargoes is not a "dent" in the thesis — it is the thesis ending. The falsifier attacks the mechanism (Qatar supply offline → price dislocation → beneficiary windfall), not a peripheral detail.

## 4. Secondary Falsifiers

| ID | Description | Metric | P(fires in horizon) |
|---|---|---|---:|
| SF-001 | Emergency LNG supply from non-Qatar producers (US, Australia, Russia) is mobilised in sufficient volume to functionally replace the 12.8 mtpa Qatar gap before Trains 4 and 6 restart — shipping rates and JKM fall as the market reprices available supply, even without Qatar coming back online. Kill condition: JKM falls below $12.00/MMBtu AND confirmed new spot cargo commitments from non-Qatar producers exceed 8 mtpa annualised run-rate, sourced from Platts S&P Global or Argus Media cargo-tracking data. | Platts S&P Global LNG Analytics (cargo tracking); JKM front-month spot (US EIA weekly) | 0.10 |
| SF-002 | European demand collapses faster than supply recovers — an unusually warm summer 2026 reduces gas consumption and storage injection demand, causing TTF and JKM to fall below pre-disruption levels even with Qatar still offline. Kill condition: TTF front-month falls below $10.96/MMBtu (WC-002 baseline) before 2026-08-15, sourced from ICE or EIA weekly data. This kills DIR-003 (gas storage spreads) outright and materially undermines DIR-002's netback argument. | TTF front-month spot (ICE natural gas futures; US EIA International LNG Prices table) | 0.15 |
| SF-003 | LNG shipping spot rate collapses due to a rapid supply of spot tonnage from vessels repositioned from other routes (e.g. Pacific routes, spot fleet not yet committed) — rates fall back toward $80,000–$100,000/day or below even while Qatar remains offline, removing the core DIR-001 rate-premium argument. Kill condition: LNG spot rate for 174,000 cbm carriers (U.S. Gulf–Asia route) falls below $100,000/day, sourced from Spark Commodities (spark-commodities.com) or Platts S&P Global LNG freight assessments. | LNG spot freight rate — Spark Commodities (spark-commodities.com) Baltic Exchange LNG Index; Platts S&P Global LNG freight assessments | 0.20 |

## 5. Lock State

- **locked_after_m0_complete:** pending (edge-definition sets the lock; after that these criteria cannot be moved)

## 6. Verdict

Verdict: kill switch set — JKM front-month spot crossing $12.00/MMBtu on confirmed Trains 4 and 6 restart by 2026-08-15
