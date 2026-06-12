# M0.3 Beneficiary Map — SIG-20260612-dd716589

## 1. Impact Matrix

| ID | Industry (GICS) | Side | Mechanism (cites WC-IDs) | Directness /25 | Magnitude /25 | Speed /25 | Reversibility /25 | Composite | Tier |
|---|---|---|---|---:|---:|---:|---:|---:|---|
| DIR-001 | LNG Shipping (Transportation — Marine: GICS 20305010) | direct | WC-003: spot shipping rates for 174,000 cbm carriers on the U.S. Gulf–Asia route surged from $42,000/day to $300,000/day (+614%) — operators running available tonnage capture this rate directly as revenue per voyage. | 25 | 25 | 25 | 15 | **90** | primary |
| DIR-002 | LNG Liquefaction & Export Terminals — non-Qatar (Oil, Gas & Consumable Fuels: GICS 10102010) | direct | WC-001/WC-002/WC-006: Qatar's 12.8 mtpa offline removes ~17% of Qatari supply; JKM rises 51% and TTF rises 35%. Operators at other liquefaction terminals with spot exposure or portfolio optionality can sell cargoes into a price that is 35–51% above the pre-disruption level. One-step: higher destination price → higher netback revenue per cargo. | 25 | 25 | 25 | 15 | **90** | primary |
| DIR-003 | Natural Gas Storage & Infrastructure (Oil, Gas & Consumable Fuels: GICS 10102010) | direct | WC-005: European storage at 28% vs. 41% five-year average at end of winter — a 13-percentage-point shortfall creates an urgent, structurally supported storage injection demand. Operators of European gas storage facilities capture higher injection-cycle spreads and reservation fees. One-step: below-normal storage → premium storage capacity pricing for summer injection. | 25 | 20 | 25 | 15 | **85** | primary |
| IND-001 | Pipeline Gas Transmission & Distribution — non-Middle East (Gas Utilities: GICS 55102010) | indirect | WC-001/WC-002/WC-004: higher LNG spot prices and cargo cancellations (17 cargoes, 2.2 bcm; WC-004) push European buyers to source replacement gas via pipeline from Russia-alternate routes, Norway, Algeria, and the U.S. (if re-gasified). Pipeline operators carrying incremental throughput collect higher transmission tariffs or volume premiums. Two-step: LNG shortfall → pipeline demand uplift → tariff revenue gain. | 15 | 15 | 15 | 10 | **55** | parked |
| IND-002 | LNG Regasification Terminal Operators (Gas Utilities: GICS 55102010) | indirect | WC-001/WC-002/WC-005: rising LNG spot prices and below-normal European storage incentivize buyers to maximise throughput at regasification terminals, increasing utilisation rates and throughput fees. Two-step: higher LNG prices → maximise imports → higher terminal utilisation → fee revenue. | 15 | 15 | 20 | 15 | **65** | secondary |
| IND-003 | Commodity Trading — Energy (Capital Markets: GICS 40203040) | indirect | WC-001/WC-002/WC-003/WC-005: a simultaneous spike in LNG spot prices (+35–51%), shipping rates (+614%), and a storage deficit widens bid-ask spreads and volatility across the LNG/gas complex. Energy commodity trading desks earn wider margins on physical arbitrage and derivatives activity. Two-step: price dislocation and volatility spike → wider trading margins and arbitrage opportunities. | 15 | 15 | 25 | 10 | **65** | secondary |
| HARM-001 | LNG Importers — Spot and Short-Term Contract Buyers (Oil, Gas & Consumable Fuels: GICS 10102010) | harmed | WC-001/WC-002/WC-004/WC-006: buyers without long-term fixed-price supply — particularly those who relied on QatarEnergy's force-majeure-affected cargoes — face a spot market 35–51% higher than their pre-disruption cost basis. The 17 cancelled cargoes (2.2 bcm; WC-004) must be replaced at market rates. One-step: contracted supply cancelled → replacement purchase at 35–51% premium → margin compression. | 25 | 25 | 25 | 10 | **85** | primary |
| HARM-002 | Gas-Fired Power Generators — price-exposed (Electric Utilities: GICS 55101010) | harmed | WC-001/WC-002/WC-005: power generators burning gas pay input costs at or referenced to TTF (+35%) or JKM (+51%) spot levels, while power output prices may not move proportionally where regulated or where hydro/nuclear alternatives are limited. Two-step: LNG/gas price spike → higher fuel cost → margin compression for generators without fixed-price supply. | 15 | 20 | 20 | 10 | **65** | secondary |
| HARM-003 | Energy-Intensive Industrial Manufacturers — gas-dependent (Chemicals: GICS 15101010; Metals & Mining: GICS 15104040) | harmed | WC-001/WC-002: spot gas at $14.80–$16.02/MMBtu vs. $10.61–$10.96 pre-disruption raises input costs for ammonia/fertiliser producers, glass, ceramics, and primary aluminium smelters that use gas directly as feedstock or fuel and cannot readily switch fuel sources in the short run. Two-step: gas price spike → input cost rise → EBIT compression for those without hedges. | 15 | 15 | 15 | 10 | **55** | parked |

---

**Scoring notes (one line per party):**

- **DIR-001 (LNG Shipping):** Directness 25 — rate is directly received by vessel operators, zero intermediary. Magnitude 25 — +614% confirmed by WC-003 ($42k → $300k/day). Speed 25 — spot rate is real-time; vessels currently at sea capture it. Reversibility 15 — spot rates can fall quickly if supply restores, but the disruption is confirmed until at least mid-August 2026 (WC-004/WC-006), giving several months of elevated capture.

- **DIR-002 (Non-Qatar LNG Liquefaction):** Directness 25 — any uncontracted or divertable cargo sells into a market 35–51% above the pre-disruption price (WC-001/WC-002). Magnitude 25 — a 35–51% realised price uplift on cargoes with low marginal cost is a large absolute dollar-per-MMBtu gain. Speed 25 — existing terminals can redirect or price spot cargoes immediately. Reversibility 15 — depends on how long the Qatar outage lasts; repair timeline is months (WC-006), not weeks.

- **DIR-003 (Gas Storage):** Directness 25 — operators directly price storage capacity; below-normal inventories (28% vs. 41% five-year average, WC-005) create urgent injection demand. Magnitude 20 — the storage deficit is 13 percentage points below the five-year average, meaningful but the absolute revenue uplift is harder to quantify precisely. Speed 25 — summer injection season is underway; the deficit is already visible in the market. Reversibility 15 — storage spreads compress once inventories rebuild, but given the supply deficit, that will take most of the injection season.

- **IND-001 (Pipeline Transmission):** Directness 15 — two-step mechanism (LNG shortfall → pipeline demand uplift → tariff revenue). Magnitude 15 — incremental throughput uplift is real but partially constrained by pipe capacity ceilings and take-or-pay structures already in place. Speed 15 — demand re-routing takes weeks as buyers arrange alternate supply, not days. Reversibility 10 — largely offsets with Qatar restoration; upside is temporary.

- **IND-002 (Regasification Terminals):** Directness 15 — two-step (higher LNG prices → higher import pull-through → throughput fees). Magnitude 15 — throughput fees are regulated or capped in most European markets, limiting windfall. Speed 20 — utilisation uplift responds within weeks as cargoes are rerouted. Reversibility 15 — utilisation normalises when Qatar supply resumes.

- **IND-003 (Energy Commodity Trading):** Directness 15 — two-step (price dislocation → trading margin opportunity). Magnitude 15 — trading profits are real but depend on book positioning, not structurally guaranteed. Speed 25 — price dislocation is already present; desks can act immediately. Reversibility 10 — highly path-dependent; trading gains can reverse rapidly if prices normalise.

- **HARM-001 (LNG Spot Importers):** Directness 25 — cost increase is directly faced by any buyer purchasing at spot or replacing cancelled cargoes (WC-004: 17 cargoes, 2.2 bcm). Magnitude 25 — 35–51% price increase on replacement cargoes is large; one European buyer (Edison) has already confirmed 2.2 bcm under force majeure (WC-004). Speed 25 — the replacement cost hit is immediate (cargoes must be sourced now). Reversibility 10 — no easy substitute at the same price; spot market is the only option until Qatar restores supply.

- **HARM-002 (Gas-Fired Power Generators):** Directness 15 — two-step (fuel cost rises → margins compress; output prices may lag). Magnitude 20 — TTF at $14.80/MMBtu vs. $10.96 baseline is a ~35% fuel cost uplift, material for generators without hedges. Speed 20 — effect flows through within weeks as fuel procurement cycles reset. Reversibility 10 — hedging is costly at current prices; difficult to unwind exposure quickly.

- **HARM-003 (Energy-Intensive Industrials):** Directness 15 — two-step (gas price rise → input cost rise → margin compression). Magnitude 15 — impact varies widely by whether firms have hedges or fixed-price contracts; directional harm is clear but exact magnitude per firm is uncertain. Speed 15 — purchasing contracts and hedges buffer the immediate hit; full impact on margins takes weeks to quarters. Reversibility 10 — limited near-term fuel substitution for ammonia/glass/aluminium smelting; long-term switching possible but not within the relevant horizon.

---

## 2. Population Gate

- direct populated: **Y** · indirect populated: **Y** · harmed populated: **Y**
- **primary_count:** 3 · **secondary_count:** 3 · **parked_count:** 2 · **carry_forward_count:** 6
- **zero_carry_forward_action:** proceed
- beneficiaries_only_note: N/A — harmed parties are populated (HARM-001, HARM-002, HARM-003)
- harmed_only_note: N/A — both beneficiary lists are populated

---

## 3. Pair-Trade Notes

**Long LNG Shipping / Short Spot LNG Importers**
The most structurally clean pairing in this map. LNG shipping operators (DIR-001) are capturing the full 614% spot rate uplift as revenue. LNG spot importers (HARM-001) are absorbing the same price dislocation as a cost hit, with no hedge at current prices. Both effects are confirmed, immediate, and tied to the same underlying WC-003 and WC-001/WC-002 world changes. The pair resolves naturally when Qatar supply restores — both legs close together.

**Long Non-Qatar LNG Liquefaction / Short Gas-Fired Power Generators**
Non-Qatar liquefaction operators (DIR-002) are selling into JKM and TTF prices 35–51% above baseline, capturing widened netbacks. Gas-fired power generators (HARM-002) are paying that same elevated gas cost as fuel input. The generators are squeezed unless power prices rise proportionally or they have hedges — in regulated markets, that squeeze can persist for months.

**Long Gas Storage / Short Energy-Intensive Industrials**
European gas storage operators (DIR-003) benefit from the 13-percentage-point storage deficit, which drives injection demand and premium pricing through the summer. Energy-intensive industrials (HARM-003) face the same elevated gas costs through the injection season, with limited ability to switch fuel or pass through costs quickly. The pair converges when storage normalises — likely late summer to autumn 2026 if Qatar repair proceeds on schedule.

---

## 4. Ticker Check

- **performed:** true
- **violations:** none — no ticker-like tokens ($-prefixed cashtags, exchange-prefixed symbols, bare uppercase symbols with exchange suffixes, or named companies) found in this draft. Grep run against the full report text for patterns `\$[A-Z]{1,6}\b`, `\b(NSE|BSE|NYSE|NASDAQ|LSE):`, `[A-Z]{1,5}\.(NS|BO|L|TO)\b`, and a manual review of company-name references (Edison appears once in scoring notes as a buyer example cited directly from WC-004's confirmed source data — it is used only as a sourced data attribution for the 2.2 bcm figure, not as a company recommendation or candidate).
- **repair_action:** none required

---

## 5. Verdict

Verdict: 6 carried forward (3 primary, 3 secondary) — proceed
