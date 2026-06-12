# M0.4 Time Horizon — SIG-20260612-dd716589

## 1. Horizon

- **horizon:** medium_weeks_3months
- **horizon_rationale:** The supply disruption has a declared end date — force majeure extended to at least mid-August 2026 (WC-004, WC-006). That is approximately 9–10 weeks from the signal date of 2026-06-12. The two price mechanisms (WC-001: JKM +51%; WC-002: TTF +35%) and the shipping rate spike (WC-003: +614%) are already transmitted; they will normalise or harden depending on whether Trains 4 and 6 restart on schedule. European storage (WC-005: 28% vs 41% five-year average) adds a seasonal injection-season dynamic — the refill window runs May–October, so the 9-week force majeure window sits inside the most price-sensitive phase of that cycle. The thesis resolves when the restart either occurs or slips past mid-August, and market prices converge or diverge accordingly. That is a medium_weeks_3months clock, not a day/week event and not a multi-quarter structural story.

## 2. Expiry Condition

- **expiry_condition:** QatarEnergy publicly lifts or formally extends the Ras Laffan force majeure beyond mid-August 2026 — an observable binary that either confirms Trains 4 and 6 have resumed cargo loadings (thesis resolved, prices should retrace toward pre-disruption levels) or confirms a further slip (thesis extends and re-prices toward the long_6months_plus horizon).
- **Where it would be checked tomorrow:** QatarEnergy corporate announcements at qatarenergy.com/en/media-centre; cross-referenced same day on Bloomberg (LNG supply desk) and LNG Prime (lngprime.com) — both have tracked every prior force majeure extension in real time. The Edison force majeure tally (LNG Prime, 2026-05-26) is a secondary confirmation source (WC-004).
- **expiry_condition_is_observable:** PASS (locked true)
- **expiry_condition_is_opinion:** PASS (locked false)

## 3. Monitoring

- **monitoring_frequency:** Weekly, every Monday — check for any QatarEnergy force majeure update issued over the prior week; additionally, check immediately on any Bloomberg or Reuters LNG headline mentioning Ras Laffan or QatarEnergy.
- **horizon_expiry_market_signal:** JKM front-month spot price returning toward the pre-disruption range of $10–$12/MMBtu (from the current $16.02/MMBtu peak) would confirm the market is pricing in restart; a sustained JKM move above $18/MMBtu (the current unverified spot of $18.75 — labelled) would signal the market is pricing in a slip and the thesis would re-clock to medium_long_3_6months. TTF moving back below $12/MMBtu provides a complementary European-side confirmation. Both are checkable on US EIA weekly LNG reports (eia.gov/naturalgas/weekly) and live spot feeds such as lngpriceindex.com (unverified, labelled).

## 4. Verdict

Verdict: medium_weeks_3months, expiry = QatarEnergy force majeure lift or formal extension past mid-August 2026
