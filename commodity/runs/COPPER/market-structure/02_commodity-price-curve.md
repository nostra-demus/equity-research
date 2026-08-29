# Price Trend & Term Structure — COPPER

**Run date:** 2026-08-28 · **Run root:** `commodity/runs/COPPER/` · **Profile read:** `frameworks/commodity/COMMODITY_PROFILES.md` §`## COPPER` (lines 318–389) · **Rules:** root `CLAUDE.md` + `.claude/agents/commodity/MODULE_RULES.md` · **Sibling read:** `commodity/runs/COPPER/market-structure/00_commodity-triage.md` (verdict **Partial**).

**Benchmark and units (profile-binding).** LME Copper Grade A, **USD per tonne**, is the global benchmark. COMEX `HG` is **US¢/lb** (quoted here as USD/lb for readability). SHFE is **RMB/tonne**. These are three different contracts with different grades, warehouse eligibility, delivery locations and prompt-date conventions — the profile requires them to be *aligned* before comparison, never treated as one price. Conversion used throughout: **1 tonne = 2,204.62 lb**.

---

## 0. Evidence status before anything else (MODULE_RULES §8A)

**Zero of the four required semantic series this orb owns carries an accepted, current, immutable vintage.** Everything below is therefore either (a) **unvintaged live-web context**, which per §8A may explain the situation but **cannot raise sufficiency or conviction**, or (b) **my own arithmetic on that context**, labelled inference. No pulse vintage has been fabricated and no scraped quote is presented as one.

| Need ID | Stable series ID | Status | As-of | Vintage / retrieval ID | Exact reason unusable |
|---|---|---|---|---|---|
| `copper-current-price` | `copper.current-price` | **missing — `PULSE-MISSING`** | — | none | The swarm pulse quote transport for `@HG.1` could not be refreshed in this environment (`EPERM` on the pinned `tsx` runner's IPC pipe under the sandbox). Coverage gate reports the pulse quote snapshot absent. An unvintaged web anchor is recorded in §1 and is explicitly **not** this row |
| `copper-comex-price-history` | `copper.comex-price-history` | **unavailable** | — | none | No continuous back-adjusted `@HG.1` close history resolved from the declared lawful shared market route; the shared history is absent or ambiguous |
| `copper-lme-cash-three-month-curve` | `copper.lme-cash-three-month-curve` | **unavailable** | — | none | No connector claims this series and no licensed LME feed with exact prompt dates is wired. This kills the profile's headline market-structure lens (cash–3M backwardation) as *evidence*; §3 below reports it only as unvintaged web context |
| `copper-regional-arbitrage` | `copper.regional-arbitrage` | **unavailable** | — | none | No connector claims this series. The LME–COMEX–SHFE arb net of FX, tax and freight cannot be computed to evidence standard; §4 gives an unvintaged, partially-aligned approximation and names what is missing |

**Consequence I must honour and do not argue with:** these unusable required rows make both forecast horizons `not_assessable`, and MODULE_RULES §11's deterministic contract mechanically produces **`Research More`** at the terminal thesis unless a proven critical risk forces `Avoid`. Nothing in this report converts unvintaged context into a rated call, and I have not substituted a weaker source silently for any missing required row.

**One conflict is material enough to flag at the top.** Two mutually exclusive readings of the COMEX curve exist in the unvintaged material (§3). Under §4's conservative default I do **not** credit a rolled long with the favourable one.

---

## 1. Price Now & Trend

| Horizon | Level | Change | Source |
|---|---|---|---|
| **Spot / front (COMEX `HG` front month)** | **US$6.62/lb** (= 662 US¢/lb; ≈ US$14,594/tonne by my own conversion, **not** an LME print) | +0.45% on the day | [Web: TradingEconomics copper page, as-of **2026-08-28** — **unvintaged, unverified, single secondary source**] |
| **Front (LME Copper Grade A, 3-month)** | **US$14,251/tonne** (= US$6.464/lb by my conversion) | +0.4% on the day; prior close US$14,201/t was the highest ever close | [Web: NaturalNews summarising wire copy, as-of **2026-08-26** — unvintaged, unverified, secondary] |
| **LME cash (implied)** | **≈ US$14,499/tonne** — *my arithmetic:* 3M 14,251 + cash premium 248 | — | Inference from the two figures above; **not** an LME official cash settlement |
| 1 month | +5.43% | — | [Web: TradingEconomics, as-of 2026-08-28 — unvintaged] |
| 3 months | **not sourced** | — | No dated 3-month change found from a source I am willing to cite. Not estimated |
| 6 months | **not sourced** | — | Same. One search summary placed a ~$6.71/lb record in "May 2026", which contradicts the dated 2026-08-12 record print below; unresolved, so not used |
| 12 months | **+46.63%** | — | [Web: TradingEconomics, as-of 2026-08-28 — unvintaged] |
| 52-week range | High **US$6.83/lb** (August 2026, described as the all-time high). Low **not printed by any source I found**; *implied* ≈ US$4.51/lb — my arithmetic: 6.62 ÷ 1.4663 | — | High: [Web: TradingEconomics, as-of 2026-08-28 — unvintaged]. Low: inference, not a printed low |

**Trend read.** Copper is in a strong, mature uptrend and is sitting within about 3% of an all-time high. The metal is up roughly 47% over twelve months and about 5% in the last month alone, and the last three weeks have produced a run of record prints on both venues: a COMEX September record of $6.7140/lb on 2026-08-12, a fresh $6.7270/lb on 2026-08-25, and an LME 3-month record close of $14,201/tonne on 2026-08-25 with a $14,343/tonne intraday high, against a prior LME record of $14,527.50/tonne [Web: wire summaries, dated 2026-08-25 to 2026-08-27 — unvintaged, unverified]. The important qualifier, and it is the whole story of this run: the wire reporting attributes the rally to **a shortage of copper available outside the United States** created by US buyers pulling metal across the Atlantic and Pacific ahead of a possible 2027 refined-copper tariff — **not** to a proven global deficit. That is a location problem, and a location problem shows up in the curve and the basis, which is what the rest of this report measures. It is also a claim I cannot verify: the refined-balance series that would settle it (`copper-refined-balance`) belongs to `commodity-demand-inventory` and is `unavailable`.

---

## 2. Technical Levels (chart context, not fundamentals)

These are **chart levels the market is actually quoting** — reference points for where orders sit, not statements about what copper is worth. None of them is a valuation input, and none should be read as one.

- **US$6.83/lb (COMEX) — overhead resistance / the all-time high.** Described as the all-time high set in August 2026 [Web: TradingEconomics, as-of 2026-08-28 — unvintaged]. Chart level only.
- **US$6.71–6.73/lb (COMEX) — the breakout shelf, now the first support/pivot.** Two dated record prints, $6.7140 on 2026-08-12 and $6.7270 on 2026-08-25, sit here [Web: wire summaries, 2026-08-14 and 2026-08-27 — unvintaged]. Price has since traded back below it, so it is currently resistance-turned-pivot rather than support.
- **US$6.55/lb (COMEX) — the watched pullback low.** Price fell below $6.55 on 2026-08-13 after the first record, and has held above it since [Web: wire summary, as-of 2026-08-14 — unvintaged].
- **US$14,000/tonne (LME) — the round-number line the London market is watching.** It appears by name in current commentary framing ("can keep copper above $14,000"), which is what makes it a watched level; the round number, not any fundamental, is why [Web: trade commentary, accessed 2026-08-28 — unvintaged, unverified].
- **Moving averages: not stated.** I found no dated, sourceable value for a widely-watched moving average (50-day, 200-day) on either venue. I am not inventing one. This is a gap, not a level.

---

## 3. Futures Curve / Term Structure

### 3a. COMEX `HG` — the vehicle a US-listed rolled long actually holds

| Contract | Price (USD/lb) | Expiry | Source |
|---|---|---|---|
| HGQ2026 (Aug-26) | 6.5945 | 2026-08-27 | [Web: TradingView COMEX-HG1! contracts page, session close, accessed 2026-08-28 — **unvintaged, unverified**] |
| **HGU2026 (Sep-26) — front for a long on 2026-08-28** | **6.6260** | 2026-09-28 | same |
| HGV2026 (Oct-26) | 6.6650 | 2026-10-28 | same |
| HGX2026 (Nov-26) | 6.6995 | 2026-11-25 | same |
| HGZ2026 (Dec-26) | 6.7270 | 2026-12-29 | same |
| HGF2027 (Jan-27) | 6.7330 | 2027-01-27 | same |
| HGH2027 (Mar-27) | 6.8285 | 2027-03-29 | same |
| 2031 far month | ≈ 7.84 | 2031 | same |

**Shape: contango** (each deferred month above the one in front of it, monotonically, out to 2031).

**Annualised roll yield, my own arithmetic, both tenors, so the reader can check it:**
- Sep-26 → Dec-26: (6.7270 − 6.6260) ÷ 6.6260 = **+1.524%** over 92 days → ×(365/92) = **+6.05%/yr contango**.
- Sep-26 → Mar-27: (6.8285 − 6.6260) ÷ 6.6260 = **+3.056%** over 182 days → ×(365/182) = **+6.13%/yr contango**.
- **Roll yield to a rolled long ≈ −6.1%/yr.** Contango is a cost: the long sells the cheaper near contract and buys the dearer far one every roll.

**This number is contested and I am flagging it rather than smoothing it.** Two other unvintaged quote sources give December-2026 copper at **$6.017/lb** and **$6.18/lb**, which against a $6.63 front would be *steep backwardation* (roughly −9% over three months, ≈ −31%/yr, i.e. a large roll **gain** to a long) — the opposite sign. The TradingView chain is internally coherent (monotonic, consistent with the front-month level, consistent with a partially-priced January-2027 US tariff lifting deferred US-delivered prices) and the conflicting quotes are not; one of them also happens to equal a figure reported as an intraday *September* record, which smells like a scrape artefact. But "smells like" is not evidence. **Under §4 the conservative reading for a long wins: assume the carry cost, do not bank a roll gain that a second source contradicts.** The COMEX curve shape is formally **not assessable for conviction** (`copper-comex-price-history` unavailable, `copper-lme-cash-three-month-curve` unavailable).

### 3b. LME — the physical benchmark, and it is doing the opposite

The LME cash–3M spread is the profile's designated tightness read. As unvintaged context only:

| Date (as-of) | LME cash − 3M | Annualised roll yield to a long (my arithmetic) | Source |
|---|---:|---:|---|
| ~2026-08-11 | **+US$45/t** (backwardation) | ≈ +1.3%/yr | [Web: wire summary, accessed 2026-08-28 — unvintaged] |
| ~2026-08-24 (intraday peak) | **≈ +US$550/t** — "highest in more than five years" | ≈ +14.9%/yr | [Web: wire summary, dated 2026-08-25 — unvintaged] |
| 2026-08-24 (a reported print) | **+US$434/t** — "highest since October 2021" | ≈ +11.9%/yr | [Web: wire summary, dated 2026-08-25 — unvintaged] |
| after the 20kt delivery | **≈ +US$175/t** | ≈ +4.9%/yr | [Web: OilPrice/ING summary, dated ~2026-08-26 — unvintaged] |
| 2026-08-26 (latest found) | **+US$248/t** | **≈ +6.9%/yr** — (248 ÷ 14,499) × (365/91) | [Web: NaturalNews summarising wire copy, 2026-08-26 — unvintaged] |

**Shape: backwardation** — cash above 3-month, which is the classic near-term-tightness signal and **pays** a holder who rolls, the mirror image of the COMEX picture.

**What the split implies.** Same metal, two venues, opposite carry, and this is not a contradiction to be averaged: **LME backwardation prices scarcity of metal you can touch in London/Asia today; COMEX contango prices a term premium for US-delivered metal after a possible January-2027 tariff.** Location and delivery date are doing the work, exactly as the profile's family rule warns. The practical consequence for a portfolio is large and is stated in §5: the *venue* of the exposure changes the annual carry by roughly 13 percentage points on identical metal.

### 3c. Carry placed in its own history

- **Peak: roughly the 99th percentile of a five-year window.** $434/t was reported as the highest since October 2021 (≈ 4.9 years) and ~$550/t as the highest in more than five years [Web: wire summaries, 2026-08-25 — unvintaged]. Placement by *reported rank*, not by a distribution I hold.
- **Today (~$248/t): elevated but well off the extreme** — roughly 5.5× the $45/t level of about two weeks earlier, and about 45% of the peak.
- **Direction: violently flattening.** The spread lost roughly 55–68% of its value in two to three sessions.
- **A true z-score is not computable and I am not printing one.** `copper.lme-cash-three-month-curve` is `unavailable`, so I hold no spread history and no standard deviation. Anyone quoting a z-score for copper carry in this run is making it up.

### 3d. Cash-and-carry verdict: does storage pay?

Decomposition of the front–deferred spread into cost of carry versus implied convenience yield. **Financing is sourced; storage and insurance are my labelled estimates** — LME and CME warehouse rent schedules are published but I could not retrieve a citable dated rate in this environment, so the storage leg is an estimate and the verdicts below inherit that uncertainty.

- **Financing:** US 3-month Treasury bill **3.79%** on 2026-08-26 [Web: TradingEconomics US 3-month bill yield, as-of 2026-08-26 — unvintaged].
- **Storage + insurance (ESTIMATE, not sourced):** ~US$0.55/tonne/day rent ≈ US$201/t/yr ≈ **1.4%** of a $14,499/t cash price, plus ~0.15% insurance → **≈ 1.5%/yr**.
- **Full cost of carry ≈ 5.3%/yr** (3.79% + 1.5%), of which only the financing leg is sourced.

**LME — cash-and-carry does NOT pay, by a wide margin.** Buying cash metal at ~$14,499/t and selling the 3-month at $14,251/t locks in a **−$248/t** spread and then pays roughly **$191/t** of carry over the quarter (5.3%/yr × 0.25 × $14,499) — a loss of about **$439/t per quarter**, ≈ **−12.1%/yr**. Rearranged, the **implied convenience yield ≈ 12.2%/yr**: `y = r + u − (F/S − 1) = 3.79% + 1.5% + 6.86% ≈ 12.2%/yr`. The London market is paying roughly 12% a year for the privilege of having the metal *now* rather than in three months. That is the near-dated basis the profile asks for (LME cash–3M), and it is the single most informative number in this report.

**COMEX — cash-and-carry roughly pays, marginally.** Contango of **+6.05%/yr** against an estimated full carry of **≈5.3%/yr** leaves about **+0.75%/yr** to a storer, i.e. an implied convenience yield of roughly **zero to slightly negative**. That is internally consistent with COMEX warehouse stocks at a record ~675,185 tonnes after 46 consecutive daily increases [Web: wire summary, accessed 2026-08-28 — unvintaged]: metal sits in US sheds because the curve just about funds it *and* because it carries tariff optionality. Given the §3a quote conflict and the estimated storage leg, treat this as **directional, not decided**.

---

## 4. Physical Basis, Regional Premiums & Delivery Pressure

| Measure | Latest | Own-history placement | Direction | Source/date |
|---|---:|---:|---|---|
| **Aligned physical assessment − deliverable futures (true basis)** | **Not computable** | — | — | No lawful physical assessment aligned on grade, location, delivery date, currency and unit is reachable here. `copper-regional-arbitrage` is `unavailable`. Restricted benchmark data stays manual/unavailable; no licence has been worked around |
| LME cash − LME 3M (near-dated basis, same grade/venue) | **+US$248/t** (backwardation) | ~99th pct at the 2026-08-24 peak; still ~5.5× the level of two weeks earlier | Flattening hard | [Web: wire summary, 2026-08-26 — unvintaged] |
| **COMEX front − LME 3M (regional premium, PARTIALLY aligned)** | **≈ +US$547/t (+3.8%)** — my arithmetic: COMEX 6.7125/lb × 2,204.62 = $14,798/t, less LME 3M $14,251/t | Described as "levels not seen since last autumn" — i.e. roughly a 12-month high, by report, not by a distribution I hold | Widening into the tariff decision | COMEX close 2026-08-25 and LME 3M 2026-08-26 [Web: wire summaries — unvintaged] |
| **COMEX Dec-26 − LME 3M (better date alignment)** | ≈ +US$579/t (+4.1%) — 6.7270/lb × 2,204.62 = $14,830/t vs $14,251/t | — | — | Same sources; **still not date-matched** (see alignment note) |
| **Yangshan / China import premium (LME-basis, CIF Shanghai)** | EQ copper arriving late Aug **US$75/t**; Sept arrival **US$75–85/t**; registered B/L Aug arrival **US$110–120/t** | Below its own recent range — reported to have peaked last year and traded materially lower since | Weakening; SHFE/LME price ratio deteriorating | [Web: SMM Yangshan copper spot commentary, August 2026 — vendor assessment, unvintaged, unverified] |
| **Accessible physical inventory** | **Cross-reference, not my vote** | — | — | Owned by `commodity-demand-inventory` (`copper-visible-inventory`, `copper-inventory-accessibility-opacity`), both `unavailable`. I emit no inventory signal |

### Basis alignment — what is and is not matched

Stating this plainly because a number that does not align these terms **is not basis**:
- **Grade:** COMEX Grade 1 electrolytic cathode vs LME Copper Grade A — economically comparable but **different brand lists and different warehouse eligibility**. Not identical.
- **Location:** COMEX = US-warehouse-linked; LME = a global warehouse network. This is precisely the axis the tariff trade is exploiting, so the location gap *is* the signal, not noise to be netted out.
- **Delivery date:** COMEX front (Sep-26) against an LME **3-month** prompt is a **date mismatch of roughly two months**. The Dec-26 line above narrows it, but LME's rolling 3-month prompt and COMEX's fixed expiry calendar never align exactly.
- **Currency:** both USD — no FX adjustment needed on this leg. The SHFE leg (RMB/tonne, plus VAT and a separate bonded regime) is **not** additive and I have not converted it; the Yangshan premium above is already quoted on an LME basis in USD/t, which is why it is usable and the SHFE outright is not.
- **Unit:** all converted at 2,204.62 lb/tonne, shown inline every time.
- **Freight, duty and VAT:** **not deducted.** The $547/t figure is therefore a *gross* venue spread, not the net arbitrage the profile requires. Trans-Pacific/Atlantic freight and any duty would consume part of it. Calling it "the arb" would overstate it.

### Delivery pressure and accessible inventory

Reported as **delivery-pressure evidence only** — warrant mechanics, deliveries and load-outs. The inventory *level* is `commodity-demand-inventory`'s causal row and I am not emitting a second inventory vote.

- **Cancelled warrants / load-out intent:** roughly **half of remaining LME stock was already earmarked for withdrawal** at the height of the squeeze, with **51,400 tonnes** of fresh withdrawal orders on 2026-08-24 and **65,400 tonnes** earmarked over recent days [Web: wire summaries, 2026-08-25 to 2026-08-27 — unvintaged].
- **Deliveries in:** Trafigura and others delivered **more than 20,000 tonnes** into LME warehouses on 2026-08-25, the largest one-day on-warrant build since April; **on-warrant stock rose ~63kt over three days, a >50% increase** [Web: wire summaries — unvintaged].
- **Stock trajectory (context, owned elsewhere):** LME warehouse stock 204,975 t, down from 249,850 t in late July and 389,425 t in late May; the 42-session decline was reported as the longest since 2014. COMEX stock at a record ~675,185 t after 46 consecutive daily increases [Web: wire summaries — unvintaged].
- **No emergency exchange rule, lending-guidance intervention or EFP dislocation was reported** in the material I found. Absence of a report is not proof of absence.

**Delivery-pressure verdict: `stressed`, relieving — but formally `not assessable` for conviction.** The assessed read: the LME prompt was under genuine delivery stress through 2026-08-24 (a five-year-extreme backwardation, a longest-since-2014 stock drawdown, and half of remaining warrants cancelled is a squeeze on any reasonable definition), and that stress was substantially relieved within two sessions by ~20kt of deliveries and a >50% on-warrant rebuild. The formal status is `not assessable` because every input above is unvintaged secondary reporting and the warrant-status series that would evidence it is `unavailable`.

### Driver attribution (MODULE_RULES §4a)

Two claims in circulation deserve the arithmetic, and both fail the adjective their tellers attach to them.

```
Attribution: US tariff premium (COMEX front − LME 3M) change over 12m
  ≈ +$0.248/lb today ($547/t ÷ 2,204.62), against a premium described as being back at
  "levels not seen since last autumn" — i.e. a comparable ~4% premium ~12 months ago
  [Web: wire summary, 2026-08-27 — unvintaged; basis = COMEX-front-vs-LME-3M level, NOT date-matched]
  = a CHANGE of ≈ +$0.00/lb of the +$2.11/lb (+46.63%) 12-month move observed
  → ~0% explained, ~100% residual (unattributed).
```
The US tariff premium is a **level, not the 12-month driver**. If the premium is roughly where it was a year ago, it cannot account for a 47% rise; non-US copper went up on its own, for reasons this orb does not own and which the blocked macro, supply and balance rows cannot currently supply. Anyone writing "the tariff explains the rally" is asserting a cause their own numbers do not carry. The honest statement is that **the 12-month move is essentially unexplained by anything in this report**, and that caps conviction rather than decorating it.

```
Attribution: LME cash–3M backwardation collapse, ~$550/t → ~$248/t (−$302/t, −55%)
  × the outright LME 3M price change over the same sessions [Web: wire summaries, 2026-08-25/26 — unvintaged]
  = the outright price rose +0.4% to a record $14,251/t while the spread halved
  → 0% of the outright move is explained by the carry collapse; the two moved in opposite directions.
```
The tightness premium drained out of the *spread* without leaving the *price*. That matters for a rolled long: the part of the return that was being paid by carry disappeared while the flat price did not fall, which is the exact configuration in which a spot-price win and a total-return loss can coexist.

---

## 5. Value & Roll-Adjusted Return

### Real (deflated) price versus its own ~5-year range — a value line, not a forecast

Deflator: **US CPI, +3.4% year on year in July 2026** [Web: CNBC/BLS CPI report, 2026-08-12 — unvintaged], with prior-year rates taken at roughly 8% (2021→22) and ~2.9–3.2%/yr thereafter — **my estimate, labelled inference**; no vintaged CPI series is wired for this run.

| Reference point | Nominal | In August-2026 dollars (my arithmetic) |
|---|---:|---:|
| 5-year low, ~late July 2022 | ≈ US$3.30/lb | × ~1.133 → **≈ US$3.74/lb** |
| May-2021 peak | US$4.90/lb | × ~1.230 → **≈ US$6.03/lb** |
| May-2024 peak | US$5.11/lb | × ~1.071 → **≈ US$5.47/lb** |
| **Today (2026-08-28)** | **US$6.62/lb** | **US$6.62/lb** |

[Nominal history: Web: INN / TradingEconomics copper price history, accessed 2026-08-28 — unvintaged, unverified.]

**Value line: RICH versus its own real five-year history — at or very near the top, roughly the 100th percentile.** Today's price exceeds every prior five-year peak *after* adjusting for inflation: about 10% above the deflated 2021 peak, about 21% above the deflated 2024 peak, and roughly 77% above the deflated 2022 low. This is a statement about where the price sits in its own distribution. It is **not** a forecast, **not** a short signal, and **not** a fair-value estimate — the structural anchor that would carry fair value (the 90th-percentile mine cash-cost floor plus the new-mine incentive price, `copper-cost-incentive-range`) is `unavailable` and belongs to `commodity-cost-curve-fair-value`. A commodity can sit at a real high for years when the incentive price has moved up under it; nothing here tells us whether it has.

### Roll-adjusted expected-return contribution (~12-month horizon, horizons matched)

**No forward price view is produced here.** This orb describes the price and the curve; it does not forecast the price leg, and the macro/supply/balance orbs that would are blocked by `unavailable` required rows. So what follows is the **carry alone** — roll yield plus collateral — over a matched **annualised (~12-month)** horizon. I have deliberately **not** added the trailing +5.43% one-month or +46.63% twelve-month spot moves to an annual roll yield: those are realised history on a different basis, and adding them would be exactly the horizon-mixing the rule forbids.

| Rolled long, ~12 months | Price leg | Roll yield | Collateral (3M bill) | **Net carry** |
|---|---:|---:|---:|---:|
| **COMEX `HG` / US-listed rolled vehicle** | not forecast here | **−6.1%/yr** (contango, §3a) | +3.79%/yr | **≈ −2.3%/yr** |
| **LME-rolled long, at the 2026-08-26 spread** | not forecast here | **+6.9%/yr** (backwardation) | +3.79%/yr | **≈ +10.7%/yr** |
| LME-rolled, at the ~$175/t level | not forecast here | +4.9%/yr | +3.79%/yr | ≈ +8.7%/yr |
| LME-rolled, back at the ~$45/t level of ~2026-08-11 | not forecast here | +1.3%/yr | +3.79%/yr | ≈ +5.1%/yr |

Fund fees, tracking error and FX are excluded and are not mine to quantify — the instruments orb runs in this same layer, its output is not guaranteed present on a fresh run, and **the market-structure synthesis owns the reconciliation of these figures against the instruments roll-drag.** I am not reaching into it.

**Does carry pay a long or bleed it? It depends entirely on the venue, and that is the finding.**
- On **COMEX**, carry **bleeds**: roughly **−2.3%/yr** net of collateral, before any fund fee. A rolled long needs the spot price to rise about 2.3% a year just to break even, and more than that after fees. This is the mechanism by which a correct bullish call on copper gets booked as a loss.
- On the **LME**, carry **pays**: up to about **+10.7%/yr** at the 2026-08-26 spread. But that spread is a **five-year extreme that already gave back roughly half its value in two sessions**, so the forward-looking figure is closer to the +5% to +9% band than to +10.7%, and it is mean-reverting by construction.
- **The gap between the two is ~13 percentage points a year on identical metal.** For a portfolio, the choice of venue is currently a larger decision than the direction of the price.

**Conservative posture, and it is the one I recommend carrying forward.** The COMEX roll figure rests on a quote chain a second source contradicts by sign; the LME roll figure rests on a spread at a five-year extreme that is collapsing in real time. Neither is vintaged. So the roll-adjusted return should be treated as **not assessable for conviction**, with the numbers above as visible, non-conviction context — and the asymmetry noted: the *conservative* case for a long is the COMEX bleed, not the LME pay.

---

## Self-check

- Spot/front price carries a date and source — **yes**, and is explicitly labelled unvintaged and marked as *not* satisfying `copper-current-price` (`PULSE-MISSING`).
- Curve shape classified with a quantified roll yield, carry placed vs its own history — **yes** (COMEX contango −6.1%/yr; LME backwardation +6.9%/yr; peak ≈99th pct of 5 years, flattening), with the sign conflict on COMEX disclosed rather than smoothed, and no fabricated z-score.
- Cash-and-carry / convenience-yield verdict explicit — **yes**: LME storage does **not** pay (≈ −12.1%/yr; implied convenience yield ≈ 12.2%/yr); COMEX storage marginally **does** (≈ +0.75%/yr). Financing sourced; storage/insurance labelled estimates.
- Physical basis aligns grade/location/date/unit; regional premiums and delivery pressure placed vs history — **yes**, with the true aligned basis stated as **not computable** and freight/duty explicitly not deducted from the venue spread.
- Accessible inventory referenced, not duplicated — **yes**; cross-referenced to `commodity-demand-inventory`, no inventory signal emitted.
- Real (deflated) value line and a named roll-adjusted return stated — **yes**; reconciliation against the instruments orb left to the market-structure synthesis.
- Technical levels labelled as chart context — **yes**; no moving average invented where none was sourceable.
