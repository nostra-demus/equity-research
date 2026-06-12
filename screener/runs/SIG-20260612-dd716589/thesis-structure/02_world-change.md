# M0.2 World Change — SIG-20260612-dd716589

## 1. World Changes (already occurred — the reality lock)

| ID | Change | Magnitude | Baseline | Confirmed | Source |
|---|---|---|---|---|---|
| WC-001 | JKM (Japan-Korea Marker) front-month LNG spot price increase | +51% to $16.02/MMBtu (week ending 2026-04-24) | $10.61/MMBtu (pre-disruption, as of 2026-02-28) | 2026-04-24 | [US EIA, "International LNG prices rise amid Strait of Hormuz closure", 2026-04-30] |
| WC-002 | TTF (European benchmark) front-month LNG spot price increase | +35% to $14.80/MMBtu (week ending 2026-04-24) | ~$10.96/MMBtu (pre-disruption, as of 2026-02-28) | 2026-04-24 | [US EIA, "International LNG prices rise amid Strait of Hormuz closure", 2026-04-30] |
| WC-003 | LNG spot shipping rates (174,000 cbm carrier, U.S. Gulf-Asia route) | +614% to $300,000/day (circa 2026-03-05) | $42,000/day (2026-02-25) | 2026-03-05 | [OilPrice.com, "LNG Shipping Rates Soar 650% to $300,000 Per Day", 2026-03-05; unverified web, labelled] |
| WC-004 | QatarEnergy contracted LNG cargo deliveries cancelled under force majeure (Edison tally) | 17 cargoes subject to force majeure, representing ~2.2 billion cubic metres of gas | Baseline contract: 6.4 bcm/year (Edison long-term supply contract with QatarEnergy) | 2026-05-26 | [LNG Prime, "Edison says QatarEnergy extends force majeure until mid-August", 2026-05-26; Offshore Energy, 2026-05-26] |
| WC-005 | European natural gas storage level (end of winter season) | 28% full as of end of 2025–26 winter | Five-year average end-of-winter level: 41% full | 2026-04-24 | [US EIA, "International LNG prices rise amid Strait of Hormuz closure", 2026-04-30] |
| WC-006 | QatarEnergy LNG export capacity offline (Trains 4 and 6, Ras Laffan) | 12.8 million tonnes per annum offline = 17% of Qatar's total LNG export capacity | Qatar total LNG export capacity: ~77 mtpa across 14 trains (pre-event) | 2026-03-19 | [The National, "Months expected until Qatar's Ras Laffan LNG site resumes full operations", 2026-04-09; Al Jazeera, "QatarEnergy declares force majeure", 2026-03-24; labelled unverified web] |

## 2. Deferred Items (hypothetical / not yet occurred)

| Item | Why deferred |
|---|---|
| Permanent re-routing of LNG trade flows away from Middle East | This is a forecast of structural change, not yet confirmed as a measured durable shift — routing patterns are changing in the short term but whether they persist depends on resolution of the underlying supply disruption. Not yet measurable as a permanent reallocation. |
| Benefit to US LNG export utilisation rates or new contract awards | US terminal utilisation ticked up from 91% to 94% (February to March 2026), but causation to the Qatar disruption is not proven in isolation and new contract awards have not yet been disclosed. |
| Buyer fuel-switching at power and industrial facilities | Reported in qualitative terms in secondary sources but no confirmed measured volume shift sourced from a primary data source. |
| QatarEnergy revenue loss quantification ($20 billion per year) | The $20 billion per year figure appears in secondary sources citing QatarEnergy's own 2026-03-19 announcement, but is described as an estimate of lost revenue over a multi-year repair horizon — it is a prospective and conditional figure, not a confirmed accrued financial loss. Deferred pending a primary filing confirmation. |
| Credit rating action on QatarEnergy or related entities | Noted in background search results but no confirmed rating change sourced from an on-list rating agency release as of 2026-06-12. |

## 3. Sources Checked

| Source | What was checked | Found / Not found |
|---|---|---|
| US EIA, eia.gov/todayinenergy/detail.php?id=67604 | JKM and TTF spot prices, baseline and post-disruption; European storage level; global LNG volume offline | Found: JKM +51% to $16.02/MMBtu; TTF +35% to $14.80/MMBtu; baselines circa $10.61 and $10.96; storage 28% vs 41% 5yr avg; >10 Bcf/d (~20% of global supply) offline [EIA, 2026-04-30] |
| LNG Prime, lngprime.com (Edison force majeure article, 2026-05-26) | Cargo count and volume under force majeure; Edison baseline contract volume; replacement progress | Found: 17 cargoes, 2.2 bcm total, 1 bcm replaced, 6.4 bcm/year baseline contract |
| OilPrice.com, "LNG Shipping Rates Soar 650% to $300,000 Per Day" (2026-03-05) | LNG carrier spot shipping rate — pre-crisis baseline and post-crisis peak; ship type | Found: $42,000/day on 2026-02-25 → $300,000/day circa 2026-03-05 (174,000 cbm carriers; U.S. Gulf-Asia route); labelled unverified web |
| Reuters (intake source, https://www.reuters.com/business/energy/fixture-lng-force-majeure/) | Primary confirmation of force majeure event | Fetch blocked at runtime (HTTP 403); facts confirmed via Bloomberg (on-list, Grade A) and supporting sources |
| Bloomberg, "Qatar Extends Force Majeure on LNG Supply Through Mid-June" (2026-05-04) | Force majeure extension to mid-June; producer identity | Found: QatarEnergy confirmed as producer; force majeure extension confirmed |
| The National (2026-04-09) | Trains 4 and 6 offline; 12.8 mtpa capacity; ~17% of Qatar exports; repair timeline | Found: all four data points confirmed; labelled unverified web (not on approved source list) |
| Gasworld (2026-05-xx) | Extension to mid-August | Confirmed via LNG Prime and Riviera cross-reference; gasworld fetch blocked (403) |
| Argus Media, argusmedia.com (shipping rates repositioning article) | Further LNG freight rate data post-peak | Found: directional commentary on repositioning, no clean before/after numbers for separate quantification |
| IEA Gas Market Report Q2-2026 (iea.blob.core.windows.net PDF) | Broader supply/demand balance; European storage data | Not accessed directly at runtime (PDF not fetched); EIA figure used instead for storage |
| LNG Price Index (lngpriceindex.com/jkm-price) | Current JKM spot for reference | Found: $18.75/MMBtu (current, unverified web, labelled); not used as primary data point |

## 4. Gate

- **gate_result:** pass
- **gate_rationale:** Six already-occurred world changes are confirmed, each with a number, a baseline, a confirmed date, and an on-list or clearly-labelled source — the minimum of two is satisfied.

## 5. Verdict

Verdict: 6 world changes confirmed — gate pass
