# Cost Curve & Fair Value — COPPER

**Run date:** 2026-08-28 · **Run root:** `commodity/runs/COPPER/` · **Owner orb:** `commodity-cost-curve` · **Required series owned:** `copper-cost-incentive-range` / `copper.cost-incentive-range` · **Profile anchor (binding):** `frameworks/commodity/COMMODITY_PROFILES.md` §`## COPPER` — *"the 90th-percentile mine cash-cost floor + the **incentive price** (needed to sanction new mines) as a structural anchor; a range."* · **Rules:** root `CLAUDE.md` §§3–5, 9, 11, 15, 16, 21 + `.claude/agents/commodity/MODULE_RULES.md` §§2–4a, 8, 8A.

> **Evidence status, stated before any number (MODULE_RULES §8A).** `data/COPPER/` does not exist, no accepted connector vintage exists anywhere in this run, and the pulse quote transport is dead (`PULSE-MISSING`, EPERM). **The required series this orb owns — `copper.cost-incentive-range` — is UNUSABLE.** Every figure below is unvintaged live-web context carrying its own source and as-of date. Under §8A it may explain the situation but **cannot raise data sufficiency or conviction**, cannot fill a coverage row, and cannot support a rated call.
>
> **What is different about this orb, stated without overclaiming it.** Unlike the upstream modules (measured primary-source coverage 0.0%), **five primary issuer documents were read directly this run** — Capstone Copper's 2026 guidance, First Quantum's 2026–2028 guidance and Q1-2026 results, and Antofagasta's Q2-2026 Production Report and 2026 Half Year Results. That is genuine primary cost evidence and it is why the cost anchor is a real *band* rather than an assertion. **It still does not lift sufficiency**, because the series has no accepted vintage, and because **no vendor-ranked percentile cost curve was reached at all** (Wood Mackenzie, CRU and S&P Global Market Intelligence are paywalled; three direct retrievals returned HTTP 403).
>
> **Nothing below is a price forecast.** A cash-cost floor is a statement about *marginal supply behaviour* — the level below which the highest-cost producers stop covering cash and supply self-corrects. It is not a target, not a prediction, and price is under no obligation to visit it.

---

## Abstract

Copper's observed COMEX front month at **US$6.62/lb (≈ US$14,595/t, 2026-08-28)** sits **above every anchor the profile's own valuation lens can construct**. Against the incentive price that is supposed to sanction new mines — **US$12,000–13,000/t (US$5.44–5.90/lb)** — the LME benchmark at **US$14,251/t** trades at a **+9.6% to +18.8% premium**, and the COMEX leg at a **+12.3% to +21.6% premium**. Against the medium-run all-in floor band of **US$3.00–4.00/lb**, the downside is **−40% to −55%** on COMEX. Against a disclosed high-cost producer's own audited-basis all-in sustaining cost (First Quantum, **US$3.50–3.80/lb**, 2026-04-28), today's price carries a **43%–47% margin**; against reachable *net* cash costs it carries **58%–83%**. **Margin of safety on the profile's own valuation lens is negative on both venues.** Three limits bind the read and none is a footnote: (1) the incentive-price anchor is an **assertion, not a build** — its best-known quote is **28 months stale** (BlackRock, 2024-04-25) and my own capital-intensity cross-check cannot reconstruct it, leaving an unexplained implied capital charge of ~US$5,900–7,700/t; (2) the cost anchor's own **direction is contested** — Codelco's direct C1 rose **+10.0% y/y** and First Quantum raised 2026 C1 guidance **+9.6%** mid-year, while a Wood Mackenzie relay says industry C1+sustaining **fell 13.2%** in 2025; and (3) most reachable cash costs are **net of by-product credits struck at record gold (US$4,000–4,300/oz) and molybdenum**, so the floor is itself distorted by *another* commodity's bull market. **The base rate for any reversion is `not assessable`** — market-structure `03` established N = 0 lawful price observations against a floor of 30.

---

## 1. Observed Market Price (not model output)

**This section contains market prints only. Not one number here is a model output, an anchor, or a fair value.**

| Spot/front/strip | Level (unit) | Contract / date | Source |
|---|---:|---|---|
| COMEX `HG` **front month** | **US$6.62/lb** (= 662 US¢/lb; **≈ US$14,595/t** at 2,204.62 lb/t — my conversion, arithmetic shown) | Sep-2026 front, **2026-08-28** | [Web: TradingEconomics copper page, 2026-08-28 — **UNVINTAGED**, unverified, secondary] via `market-structure/99` §Price & Trend |
| LME Copper Grade A, **3-month** (the profile's global benchmark) | **US$14,251/tonne** (**≈ US$6.464/lb** — my conversion) | 3-month prompt, **2026-08-26** | [Web: wire summary, 2026-08-26 — **UNVINTAGED**, secondary] via `market-structure/99` |
| LME **cash**, implied | ≈ US$14,499/t | 3M 14,251 + cash premium 248 — **inference, not an LME cash settlement** | `market-structure/99` |
| 12-month change (COMEX front) | **+46.63%** — implies a 12-months-ago price of **US$4.5147/lb ≈ US$9,955/t** (6.62 ÷ 1.4663 — my arithmetic, **inference**, not a printed level) | to 2026-08-28 | [TradingEconomics — UNVINTAGED] |
| 52-week / all-time high, as reported | US$6.83/lb (Aug-2026) | price ≈ 3% below it | `market-structure/99` |

**Three qualifiers travel with the observed price and may not be dropped.**

1. **`copper.current-price` is MISSING** (`PULSE-MISSING`, EPERM on the pinned `tsx` runner's IPC pipe). There is **no vintaged price anchor** in this run. The US$6.62/lb figure is a secondary web quote and is not an exchange settlement.
2. **The two venues are different instruments and I do not average them.** COMEX carries a **US Section 232 location basis** (the gross COMEX-front-over-LME-3M spread is **≈ +US$547/t, +3.8%**, 2026-08-25/26, *not date-matched*); LME does not. Every fair-value comparison below is therefore run **twice**, once per venue.
3. **The dates are not matched to each other** (COMEX 2026-08-28, LME 2026-08-26) and neither is matched to the anchor dates (Jan–Aug 2026 producer guidance; Sep-2025 broker cost curve; Apr-2024 incentive quote). I state the mismatch rather than quietly netting it.

---

## 2. Model Anchor Levels (profile-relevant only)

**The COPPER profile marks exactly two anchors relevant: the ~90th-percentile mine cash-cost floor, and the new-mine incentive price. Those are built first and they set the band. A substitution row is carried below them as clearly-labelled context only — it is NOT a profile-named anchor for copper and it does not set any end of the fair-value band.**

**Basis discipline (§15, binding on every row).** *C1 cash cost*, *C1 before by-product credits*, *C1 net of by-product credits*, *C1 + sustaining capital*, and *AISC (all-in sustaining cost)* are **five different numbers**, and companies use the same word "C1" for at least two of them. They are never compared as one series. Every level below carries its own basis.

### 2a. Floor 1 — cash cost, from primary producer disclosures (anchor-grade BAND)

| Producer | **Basis, stated exactly** | 2026 level (US$/lb) | ≈ US$/t | Source, date | Retrieval |
|---|---|---:|---:|---|---|
| Antofagasta | cash cost **BEFORE** by-product credits, FY26 guidance | **2.40 – 2.60** | 5,291 – 5,732 | Q2 2026 Production Report, **2026-07-15** | **PRIMARY, read** |
| Antofagasta | **NET** cash cost (after by-product credits), FY26 guidance | **1.15 – 1.35** | 2,535 – 2,976 | Q2 2026 Production Report, **2026-07-15** | **PRIMARY, read** |
| Antofagasta | **NET** cash cost, H1-2026 **realised**, −8% y/y | **1.22** | 2,690 | 2026 Half Year Results, **2026-08-13** | **PRIMARY, read** |
| Capstone Copper | **C1** cash cost per **payable** lb, FY26 guidance (net of by-products; assumes Au US$4,300/oz, Ag US$55/oz, Mo US$20/lb, CLP 875) | **2.45 – 2.75** | 5,401 – 6,063 | 2026 Guidance, **2026-02-17** | **PRIMARY, read** |
| First Quantum | **C1**, FY26 guidance (raised from 1.95–2.20 on 2026-01-15) | **2.15 – 2.40** | 4,740 – 5,291 | Q1 2026 Results, **2026-04-28** | **PRIMARY, read** |
| Codelco | **direct C1** cash cost, Q1-2026 (vs 210.7 ¢/lb Q1-2025) | **2.318** | 5,110 | Q1 2026 Operational & Financial Report, **2026-05-29** | **secondary relay — primary PDF returned unreadable binary (852.9 KB)** |
| Freeport-McMoRan | consolidated unit **NET** cash cost, 2026 average estimate (struck on Au US$4,000/oz, Mo US$30.00/lb; **±US$0.03/lb per ±US$100/oz gold**) | **~1.75** (`market-structure/01` carried ~1.90) | ~3,858 | 4Q-2025 8-K exhibit, **relayed** | **secondary — sec.gov HTTP 403** |
| 2025 realised cross-section, 8 producers, **mixed bases** | net cash cost / C1 net / unit cash cost / total unit cost | **0.58 – 2.67** | 1,279 – 5,886 | compilation of company filings, pub. **2026-05-14** | secondary compilation |

**What this band is, and what it is not.**
- **It IS:** an **anchor-grade band** for the *cash* cost of copper production, built from five directly-read primary producer disclosures plus two relays. The **net-of-by-product** cash-cost band across the reachable 2026 disclosures runs **≈ US$1.15 – 2.75/lb (US$2,535 – 6,063/t)**, with the **upper end (US$2.30 – 2.75/lb, ≈ US$5,100 – 6,100/t)** the best available proxy for a **high-cost producer's cash cost**.
- **It is NOT a 90th percentile of world production.** A percentile is a *production-weighted rank* of the whole ~23,500 kt world cost curve. What I have is an **unweighted convenience sample of five to eight listed producers** — which under-samples Chinese, Kazakh, Russian, Zambian and DRC tonnes entirely, and over-samples large-cap disclosure. **Calling the top of this band "the 90th percentile" would be a fabrication and I do not make the claim.**
- **The vendor-ranked curve was NOT reached.** Wood Mackenzie's *Global copper mine cost curve* and *cost summary* reports and S&P Global Market Intelligence's *Mine cost outlook 2026* and *Copper and Gold Market Outlook 2026* are paywalled; direct retrievals returned **HTTP 403** (spglobal.com ×2). This is a **gap, not a guess** (§11).

### 2b. Floor 2 — ~90th-percentile all-in / sustaining cost (anchor-grade BAND)

| Anchor | Level | **Basis, stated exactly** | Grade | What it means | Source, date |
|---|---:|---|---|---|---|
| Broker cost-curve read | **≈ US$6,700/t = US$3.04/lb** | **90th percentile of C1 cash cost INCLUDING sustaining capital expenditure** — *not* AISC, *not* bare C1 | anchor-grade, **~12 months stale**, broker research (verdict-stripped, MODULE_RULES §2 tier 5) | the level Bernstein identifies as a floor supporting price | [Bernstein via Investing.com, article **2025-09-04** — UNVINTAGED secondary relay] |
| Disclosed high-cost producer **AISC** | **US$3.50 – 3.80/lb = US$7,716 – 8,378/t** (raised from 3.25–3.55 on 2026-01-15) | **AISC** — C1 **plus** sustaining capital, corporate G&A, royalties and sustaining exploration | anchor-grade, **PRIMARY, read** | what one genuinely high-cost operator must earn to keep going without shrinking | [First Quantum Q1 2026 Results, **2026-04-28**] |
| Circulating 90th-pct AISC claim | "~US$4/lb is in the realm of the 90th-percentile AISC" | **AISC** | **low-grade secondary blog, undated in the material read** — carried for range only, **not relied on** | — | [aheadoftheherd relay, accessed 2026-08-28] |
| Industry-average C1 + sustaining | 183 US¢/lb (**a mean, not a percentile**) | C1 + sustaining capital, world average | secondary relay of a paywalled vendor | see the contested-direction finding in §2d | [Wood Mackenzie relay, June-2026 reference — UNVINTAGED] |

**The C1→AISC wedge, measured rather than assumed.** First Quantum discloses both on the same date and the same basis: **AISC − C1 = US$1.35 – 1.40/lb** (3.50−2.15 to 3.80−2.40). That single primary disclosure is what makes the two floors separable rather than a muddle, and it is why Bernstein's US$3.04/lb (C1+sustaining) and FQM's US$3.50–3.80/lb (AISC) are **consistent, not contradictory** — AISC is definitionally the larger number.

> **FLOOR 2, ANCHOR-GRADE BAND: US$3.00 – 4.00/lb (US$6,614 – 8,818/t).**
> Low end = the 90th-percentile **C1 + sustaining capital** read (Bernstein, 2025-09-04). High end = a disclosed **AISC** for a high-cost producer (First Quantum, 2026-04-28), corroborated in range by the low-grade ~US$4/lb AISC claim.
> **This is a band, deliberately. A single percentile figure cannot be published because the vendor-ranked curve was not reached.** It is a statement about where marginal supply stops covering its all-in cost — **not a target and not a forecast.**

### 2c. Upper anchor — the new-mine incentive price (anchor-grade BAND, and STALE)

| Source | Level | ≈ US$/lb | Date struck | Grade |
|---|---:|---:|---|---|
| BlackRock World Mining Fund (Olivia Markham) — the canonical quote | **US$12,000/t** | 5.44 | **2024-04-25** — **28 months stale** | asset-manager assertion; MINING.COM primary relay **HTTP 403**, sourced via Mining Weekly headline |
| Citic Securities | **> US$12,000/t** average needed **in 2026** to support new mine investment | > 5.44 | 2026 relay, **undated in the material read** | broker assertion, verdict-stripped |
| Deutsche Bank Research | **US$13,000/t** for high-cost, deep-earth projects; "incentive-driven pricing regime" | 5.90 | 2026 relay | broker assertion, verdict-stripped |
| Prior vintage, for drift measurement | **~US$11,000/t** quoted as the incentive price against a then-spot of ~US$8,200/t | 4.99 | **early 2024** | secondary relay |
| Capital intensity, the one build input reachable | **~US$30,000 of capex per tonne of ANNUAL capacity** on recently built projects | — | secondary relay, undated | secondary |

> **INCENTIVE ANCHOR, ANCHOR-GRADE BAND: US$12,000 – 13,000/t (US$5.44 – 5.90/lb).**
> Above it, new supply is invited. Below it, future supply starves.

**§15 — this aggregate does NOT travel with its build, and that is a finding.** A reader cannot rebuild US$12,000–13,000/t from anything published. My own cross-check, shown so it can be checked and rejected:

```
Undiscounted full-cycle check (INFERENCE — my arithmetic on one secondary capital-intensity figure)
  capex               US$30,000 per tonne of ANNUAL capacity
  ÷ mine life         30 years  ← MY ASSUMPTION, NOT SOURCED (20 yrs → US$1,500/t; 40 yrs → US$750/t)
  = capital charge    US$1,000 per tonne of LIFETIME metal
  + upper-band net cash cost   US$5,300 – 6,100/t   (§2a)
  = undiscounted full-cycle    US$6,300 – 7,100/t
Implied by the asserted band:  US$12,000 − 6,100 = 5,900  …  US$13,000 − 5,300 = 7,700
  → an implied capital charge of US$5,900 – 7,700/t, i.e. 5.9× to 7.7× the undiscounted figure.
```

That 5.9×–7.7× gap is the discount rate, the risk premium, the permitting and build delay, the grade profile and the tax/royalty regime — **none of which was sourced**. So: the incentive band is carried as an **assertion supported by no published build**, and the confidence attaching to it is capped accordingly. It is not discarded — it is the profile's named anchor and it is the only forward-supply anchor available — but it is not treated as evidence of the same strength as a producer's own filed cost guidance.

### 2d. §16 anchor-stability test — is the anchor itself cycle-distorted?

**Root §16 requires this before either anchor is used as a floor or a corroborating read. Both anchors fail the stability test in different ways, and the honest answer on the sector-history question is `Not assessable`.**

**(i) The incentive-price anchor has drifted upward, and every quote was struck inside the same bull run.**

| Date struck | Incentive price | Spot at the time | Anchor vs 2024 | Spot vs 2024 |
|---|---:|---:|---:|---:|
| early 2024 | ~US$11,000/t | ~US$8,200/t | — | — |
| **2024-04-25** | **US$12,000/t** | — | +9.1% | — |
| 2026 (relays) | **US$12,000 – 13,000/t** | US$14,251/t (LME 3M) | +9.1% to +18.2% | **+73.8%** |

The anchor rose **+9% to +18%** while the spot rose **~+74%** over the same span. Two readings follow and both matter: the anchor is **not** simply tracking price (mildly reassuring), **and** the gap between price and anchor has widened enormously (the finding). **But every reachable incentive-price quote was struck between early-2024 and 2026 — entirely inside the 2024–2026 copper bull market. No trough-vintage incentive price (2015–2016, or pre-2021) was reached anywhere.** Under §16, an anchor whose whole reference window sits inside one cycle cannot be shown to be a stable reference point. **Sector-level history for this anchor: `Not assessable`.**

**(ii) The cost-floor anchor's own DIRECTION is contested — two reachable readings point opposite ways, and I name both rather than averaging (§3).**

| Rising | Falling |
|---|---|
| **Codelco direct C1 231.8 ¢/lb Q1-2026 vs 210.7 ¢/lb Q1-2025 = +10.0% y/y** — driven by CLP appreciation and lower production, partly offset by higher moly credits [Codelco Q1-2026, 2026-05-29, relay] | **Industry C1 + sustaining capex fell ~13.2% y/y in 2025 to 183 ¢/lb** [Wood Mackenzie relay, June-2026 reference — the vendor source itself was NOT reached] |
| **First Quantum raised FY26 C1 guidance from US$1.95–2.20 to US$2.15–2.40/lb** (midpoint 2.075 → 2.275, **+9.6%**) and **AISC from US$3.25–3.55 to US$3.50–3.80/lb** (midpoint 3.40 → 3.65, **+7.4%**) between 2026-01-15 and 2026-04-28 [both PRIMARY, read] | **Antofagasta net cash cost fell 8% y/y to US$1.22/lb in H1-2026** [PRIMARY, 2026-08-13] — **but see (iii): this is a NET figure** |
| Capstone: 2026 C1 "expected to increase compared to 2025 primarily driven by modest inflation" [PRIMARY, 2026-02-17] | S&P Global (paywalled, relayed): "cost inflation has **reset the long-term incentive price higher**" — which cuts the *other* way, toward a rising anchor |

**Resolution (§4 conservative default):** the direction of the industry cost floor is **not established**. Note the one asymmetry that decides how to use it: the *falling* reading comes from a **vendor source that was not reached**, while the *rising* readings come from **primary documents that were read**. That does not settle it — the vendor figure is production-weighted and world-wide, the producer figures are not — but it means the falling read cannot be leaned on.

**(iii) The most important distortion: most reachable cash costs are NET of by-product credits struck at record gold and molybdenum prices.** Antofagasta's net cash cost fell 8% "through operational efficiency **and strong by-product credits**"; Capstone's C1 assumes **gold US$4,300/oz, silver US$55/oz, moly US$20/lb**; First Quantum's assumes **gold US$4,000/oz**; Freeport's assumes **gold US$4,000/oz and moly US$30.00/lb** and discloses the sensitivity explicitly:

```
Freeport disclosed sensitivity, applied (INFERENCE — applies to FCX's OWN cost line only, not to the industry):
  ±US$0.03/lb of copper net cash cost per ±US$100/oz gold, off a US$4,000/oz assumption.
  Gold at US$3,000/oz (−US$1,000) → +US$0.30/lb on FCX's copper net cash cost
  = a ~17% rise on a ~US$1.75/lb base, with NOT ONE TONNE of mining having changed.
```

**Plain English: a large part of the copper "cost floor" is currently being paid for by the gold and molybdenum bull markets. If gold falls, the copper cash-cost floor rises mechanically.** This is exactly the §16 failure mode — an anchor that is itself moving with the cycle it is supposed to measure against. It is also why the **gross** (before-by-product-credit) figure matters: Antofagasta's own gross cash cost is **US$2.40–2.60/lb**, roughly **double** its US$1.15–1.35/lb net figure. **Both are printed above and neither is used alone.**

### 2e. Substitution — CONTEXT ONLY, not a profile anchor for copper

**The COPPER profile does not name a demand-destruction or substitution anchor. This row therefore sets NO end of the fair-value band and casts no fair-value vote. It is carried because the observed evidence is loud and dated, and because ignoring it would be dishonest.**

| Reading | Level | Date | Source |
|---|---:|---|---|
| Copper / aluminium price ratio, record | **4.3** | Jan-2026 | [Reuters Factbox relay, 2026-06-30 — UNVINTAGED secondary] |
| Copper / aluminium ratio, latest reachable | **~4.2** | end-Jun-2026 | same |
| Indicative substitution trigger ratio | **3.5 – 4.0** — explicitly *"an indicative signal, not a rule"* | 2026 | [industry relay, accessed 2026-08-28] |
| Realised substitution, named | Ferrari, BMW and EV makers moving to more **aluminium wiring**; Daikin in air-conditioning | Jun–Jul 2026 | [Reuters Factbox relay 2026-06-30; Forbes 2026-07-07 — secondary] |
| Material cost saving, aluminium vs copper cable >50 mm² | 40 – 55% | 2026 | [trade relay — secondary, unverified] |
| **Tonnes of copper demand actually lost to substitution** | **NOT SOURCED — no number obtained from any source** | — | — |

**The substitution ceiling is NOT computable as a price level this run, and I refuse to invent one.** A parity level requires an aluminium price aligned on date, venue and unit; the one relay that quotes an aluminium level is **internally inconsistent** (it labels "US$3,000–3,200 per metric ton on the LME" as the *copper* price, which is impossible against a US$14,251/t copper print), so it cannot be used. What the evidence does support, stated in **ratio space only** where the inputs are consistent:

> At ~4.2–4.3, the copper/aluminium ratio is already **5% to 23% above the top of the indicative 3.5–4.0 substitution-trigger band** (4.2 ÷ 4.0 = 1.05; 4.3 ÷ 3.5 = 1.23), and substitution is reported as **realised, by name, not prospective**. **The substitution ceiling is not above this market — it appears to sit beneath it.** Unsized, unvintaged, and not a profile anchor: context, not a vote.

---

## 3. Model-Implied Fair-Value Band

**A range, never a single number (§16). Each end is tied to a named anchor and carries that anchor's basis and grade.**

| Case | Fair value (US$/lb) | Fair value (US$/t) | Set by which anchor | Model / window | Uncertainty & validation status |
|---|---:|---:|---|---|---|
| **Bear** | **3.00 – 4.00** | **6,614 – 8,818** | **Floor 2** — ~90th-pct **C1 + sustaining capital** at the low end (Bernstein, 2025-09-04); disclosed **AISC** for a high-cost producer at the high end (First Quantum, 2026-04-28) | cost-curve floor; medium-run (multi-year), not a 60- or 365-day level | **Anchor-grade BAND, not a percentile.** Vendor-ranked curve not reached (HTTP 403 ×3). Low end ~12 months stale and broker-sourced. **Not validated; not validatable — no lawful price history exists to test it against (N = 0).** |
| **Base** | **5.44 – 5.90** | **12,000 – 13,000** | **The incentive price** — the level that sanctions new mine supply (BlackRock 2024-04-25; Citic 2026; Deutsche Bank 2026) | mid-cycle structural anchor; **10–20-year supply-response horizon**, NOT a 12-month target | **Anchor-grade band but an ASSERTION WITHOUT A BUILD** (§2c: implied capital charge 5.9×–7.7× the undiscounted check, unexplained). Canonical quote **28 months stale**. Every quote struck inside the 2024–26 bull run → **§16 stability `Not assessable`.** |
| **Bull** | **6.08 – 6.62** | **13,400 – 14,595** | **The point where this framework's anchors are EXHAUSTED** — the substitution-trigger top in ratio terms, and the observed price itself | not an upside target; a statement that **the highest anchor the cost/incentive lens can construct sits at or below where the market already trades** | **The honest answer, not a level.** Above US$6.62/lb this orb has **no anchor at all**: the profile names no demand-destruction anchor for copper, the substitution ceiling appears to be already breached, and the empirical distribution is `not_assessable` (market-structure `03`: N = 0 vs a floor of 30). **Upside beyond the observed price is `not assessable` from this orb.** |

**How to read the bull row, because it is unusual and it matters.** A commodity's downside anchor is its cost curve; its upside anchor is the price at which buyers switch or stop buying. For copper, the profile names only the two cost/incentive anchors, and the one substitution reading available says the switching level has **already** been passed. **So the model does not produce a bull target — it produces the statement that it has run out of anchors below the market.** Publishing an invented bull level would be exactly the fabricated bound that market-structure `03` forbids ("the absence of a bound is not a licence to pick one"). I do not publish one.

**Cross-method disagreement, not averaged (§16).** The cost floor (US$3.00–4.00/lb) and the incentive price (US$5.44–5.90/lb) are **US$1.44–2.90/lb apart**, and that is not an error — they measure different things: one is where existing supply stops covering all-in cost, the other is where new supply gets built. **They are also not independent reads.** Both are broker/vendor-derived at their headline level, both were struck inside the same 2024–2026 window, and both move with the same inputs (energy, ore grade, FX, royalties, capital-goods inflation). Under §16, **treating their coexistence as "the methods agree" would be a corroboration error, and I do not treat it as one.**

---

## 4. Reverse Read — what the market appears to expect

**This is `market-implied expectation`. It is not consensus, it is not a forecast, and it is not fact.**

### 4a. Inverted through the incentive-price anchor

```
LME 3M observed    US$14,251/t  (2026-08-26, unvintaged)
Incentive anchor   US$12,000 – 13,000/t
Premium            14,251 − 13,000 = +US$1,251/t = +9.6%
                   14,251 − 12,000 = +US$2,251/t = +18.8%

COMEX front observed  US$6.62/lb (≈US$14,595/t, 2026-08-28)
Premium            6.62 ÷ 5.8967 − 1 = +12.3%
                   6.62 ÷ 5.4431 − 1 = +21.6%
```

**Required capital-cost inflation, solved in the same model.** For the LME price to sit merely *at* the incentive price rather than above it, the anchor must have risen since it was struck:

```
14,251 ÷ 12,000 = 1.1876 over 2024-04-25 → 2026-08-26 = 2.335 years
  → 1.1876^(1/2.335) = +7.6% per year, compounded
14,251 ÷ 13,000 = 1.0962 over the same span
  → +4.0% per year, compounded
```

> **Market-implied expectation (A): new-mine capital costs have inflated at roughly 4.0% to 7.6% a year since April 2024.**
> **Indicative cross-check, with its basis mismatch named:** First Quantum embeds **2.5% a year of compounding US-dollar inflation** in its own 2027–28 cost guidance [FQM, 2026-01-15, PRIMARY]. The market-implied rate is therefore **1.6× to 3.0×** what a producer actually books forward. **Basis caveat, and it is material: FQM's 2.5% is OPERATING-cost inflation; the market-implied figure is CAPITAL-cost inflation. These are different series and mining capital-goods inflation has historically run above operating inflation.** The comparison is **indicative, not matched (§15)** — it does not disprove the market-implied rate, it shows what would have to be true.

### 4b. Inverted through the cost floor — the margin the price is handing producers

| Against | Basis | Margin at US$6.62/lb (COMEX) | Arithmetic |
|---|---|---:|---|
| Reachable **net** cash cost, low end (US$1.15/lb) | net of by-product credits | **82.6%** | (6.62 − 1.15) ÷ 6.62 |
| Reachable **net** cash cost, high end (US$2.75/lb) | net of by-product credits | **58.5%** | (6.62 − 2.75) ÷ 6.62 |
| Antofagasta **gross** cash cost (US$2.60/lb) | **before** by-product credits | **60.7%** | (6.62 − 2.60) ÷ 6.62 |
| **First Quantum disclosed AISC (US$3.80/lb)** | **all-in sustaining** | **42.6%** | (6.62 − 3.80) ÷ 6.62 |
| **First Quantum disclosed AISC (US$3.50/lb)** | **all-in sustaining** | **47.1%** | (6.62 − 3.50) ÷ 6.62 |

> **Market-implied expectation (B): even the reachable HIGH-cost producer is earning a 43%–47% margin over its own disclosed all-in sustaining cost.** In plain English: at this price essentially no reachable copper mine on earth is losing money, and the highest-cost one we can see is comfortably profitable after sustaining capital, royalties and corporate costs. **There is no cost support anywhere near this price.** A cost floor 40–55% below the market cannot be the thing holding the market up.

### 4c. The model cannot uniquely invert price to ONE assumption — so I state the SET

The observed price is consistent with **at least four** different underlying assumptions, and nothing in this run separates them. I list them rather than choosing:

1. **The incentive price is understated** — real new-mine capital inflation of 4.0–7.6%/yr since April-2024 (§4a). *Status:* not verifiable; no capital-cost index reached.
2. **A deficit deep enough that price must ration demand ABOVE the incentive price**, because new supply cannot arrive in time. *Status:* **unevidenced.** The supply-demand module records the full-year 2026 balance direction as **NOT ESTABLISHED** (+96 kt reported vs −125 kt implied by the same release's own growth rates — a 221 kt gap with **opposite signs**), and the realised Q1-2026 print was a **surplus of +396 kt**.
3. **A location premium, not a global scarcity premium.** The COMEX leg carries a **+US$547/t (+3.8%)** gross premium over LME-3M into an undated US Section 232 refined-copper decision, and **69.8% of the world's visible copper sits in COMEX/US warehouses**. *Status:* removing the tariff basis from the COMEX leg **still leaves the LME leg US$1,251–2,251/t above the incentive band**, so location cannot be the whole answer — but it is not sized.
4. **The incentive-price anchor simply does not bind at either forecast horizon.** New mines take 10–20 years from sanction to full production. An anchor about decade-scale supply says almost nothing about a 60-day or 365-day price. *Status:* this is the mechanically strongest of the four and it is developed in §5.

**No single assumption is chosen. The set is the answer.**

### 4d. Driver attribution, in the mandatory form (§4a / root §15)

**Claim tested: can the rise in the cost floor explain the price move?**

```
Attribution: marginal-producer cash cost +21.1 US¢/lb y/y (Codelco direct C1 231.8 ¢/lb Q1-2026
  vs 210.7 ¢/lb Q1-2025) × 1.0 pass-through — an ASSUMED-BOUND basis, NOT a measured
  cost-to-price elasticity (no elasticity was sourced on any basis)
  [Codelco Q1-2026 Operational & Financial Report, 2026-05-29 — secondary relay; primary PDF unreadable]
  = +US$0.211/lb of the +US$2.11/lb (+46.63%) 12-month move observed on COMEX front month
  → 10.0% explained at the MAXIMUM a cost-push story could claim, 90.0% residual (unattributed).
```

**The residual is the finding, not a caveat.** Even granting a cost-push story the most generous possible assumption — that every cent of cost inflation passes straight into price — **90% of copper's 12-month move remains unexplained by the cost curve.** This is an independent confirmation of the market-structure orb's finding (~100% residual on the tariff-premium basis), reached on a different basis. **No adjective above "explains a tenth of" is available for a cost-push explanation of this rally.**

**Claim NOT made, and refused in the same form:**

```
Attribution: incentive-price anchor +US$1,000/t (BlackRock US$12,000/t 2024-04-25 → Deutsche Bank
  relay US$13,000/t 2026) × 1.0 anchor-to-price identity — an ASSUMED IDENTITY on a ~28-MONTH basis,
  not a measured sensitivity
  = +US$1,000/t against a +US$4,640/t (+46.63%) 12-month move (US$9,955/t implied → US$14,595/t, COMEX-derived)
  → PERIOD MISMATCH — REFUSED. A 28-month anchor drift cannot be used to explain a 12-month price move
    (§15: a base rate must match the claim's period). Even taken at face value it is 21.6% explained,
    78.4% residual. THE CLAIM IS NOT MADE.
```

---

## 5. Mean-Reversion Evidence Test

**A gap alone is not a trade.** Each gap below is tested for a mechanism, the evidence that would show it working, a dated catalyst window, a base rate, and a falsifier.

| Observed-vs-model gap | Closing mechanism | Evidence required | Catalyst window | Base rate | Falsifier | Status |
|---|---|---|---|---|---|---|
| **A. Price +9.6% to +21.6% above the incentive band** (US$12,000–13,000/t) | New mine supply gets sanctioned and eventually arrives, capping price | Project sanctioning announcements; capex-guidance increases; new feasibility studies moving to construction | **None inside either forecast horizon.** Greenfield copper takes **10–20 years** from sanction to full production; the profile's own supply lens shows total mine tonnes **flat** and the concentrate stream **falling −1.1% y/y** | **`Not assessable`** — no lawful point-in-time copper price history exists in this engine (market-structure `03`: N = 0 non-overlapping outcomes vs a §10 floor of 30; 0 of 3 regimes). I cannot say how often copper has reverted from a >15% premium to incentive | The incentive price is genuinely ≥US$14,251/t today (needs 4.0–7.6%/yr capital inflation, §4a); or a proven multi-year deficit | **DESCRIPTIVE ONLY.** Mechanism exists but **has no catalyst inside 60 days or 365 days**. Under my own rule this anchor **cannot lift or lower conviction at either horizon** — it is a decade-scale statement |
| **B. Price 43%–47% above a disclosed high-cost producer's AISC; 58%–83% above net cash cost** | Supply responds through the **fast** channels, not new mines: **scrap**, **restarts of idled capacity**, and **higher-cost tonnes being pushed** | Rising secondary/scrap refined output; a Cobre Panamá restart; producers raising throughput guidance; falling scrap discount | **Already visible and dated.** Scrap-based refined output **+5.6% Jan–May-2026**, scrap share of world refined output **17.3% → 17.8%**, China's scrap share of refined feedstock **25.2% in H1-2026**; **Cobre Panamá decision window 2026-12-31** (~350 kt/yr of idled capacity); next producer cost/guidance prints **Oct–Nov 2026 (Q3 results)** | **`Not assessable`** — same reason as A. **However** the supply-demand module supplies a *quantity* base rate that is not price history: the realised Q1-2026 balance was a **surplus of +396 kt**, ~2.9× Q1-2025 | The refined-minus-scrap spread narrowing further (already reported to have "narrowed considerably" in June-2026, **direction only, unsized**), which mechanically **reduces** the incentive to feed scrap; or a sanctioned US refined tariff that structurally splits the market | **LIVE MECHANISM, DATED CATALYST, NO BASE RATE.** This is the strongest reversion channel and the only one that can act inside 12 months. Confidence capped by the missing base rate |
| **C. Cu/Al ratio 4.2–4.3 vs an indicative 3.5–4.0 trigger — the substitution ceiling appears already breached** | Buyers switch to aluminium and thrift copper out of designs, destroying demand at the margin | **Tonnes** of copper demand lost to substitution — **not sourced from any source this run** | Design cycles: **12–36 months** from a switch decision to realised volume loss. Named realised switches already reported Jun–Jul 2026 (Ferrari, BMW, EV makers, Daikin) | **`Not assessable`** — no price history, and no historical substitution-elasticity series reached | The ratio falling back below ~4.0; or substitution proving reversible (aluminium's conductivity and connector penalties make some switches sticky and some temporary — **not established either way**) | **CONTEXT ONLY.** Real, named, dated, and **unsized**. **Not a profile anchor for copper** and it sets no band end. It is the reason the bull row in §3 has no anchor above it |

**What the table says as a whole.** The framework's own anchors give a **decade-scale** reason the price is high (A, descriptive only) and a **12-month-scale** reason it could fall (B, live), and **no base rate for either**, because this engine holds zero lawful copper price observations. **A wide gap plus a live mechanism plus no base rate is a reason to cap confidence, not a reason to be short.**

---

## 6. Margin of Safety

**Two separate numbers, run twice because the two venues are different instruments (§2 of the observed-price section).**

### On the LME 3-month leg — the profile's designated global benchmark, no US tariff basis
*Observed US$14,251/t (US$6.464/lb), 2026-08-26, unvintaged*

- **Premium to the base fair value (incentive price):** **+9.6% to +18.8%** (14,251 ÷ 13,000 − 1; 14,251 ÷ 12,000 − 1). **A premium, not a discount — the margin of safety on this anchor is NEGATIVE.**
- **Downside to the floor (bear / ~90th-pct all-in band, US$6,614–8,818/t):** **−38.1% to −53.6%** (8,818 ÷ 14,251 − 1; 6,614 ÷ 14,251 − 1).

### On the COMEX front-month leg — carries the Section 232 location basis
*Observed US$6.62/lb (≈US$14,595/t), 2026-08-28, unvintaged*

- **Premium to the base fair value (incentive price, US$5.44–5.90/lb):** **+12.3% to +21.6%**.
- **Downside to the floor (bear band, US$3.00–4.00/lb):** **−39.6% to −54.7%**.

**Four qualifiers, all binding.**

1. **The downside-to-floor number is NOT a price forecast and NOT a target.** It is the distance to a level defined by *marginal supply behaviour* on a **C1-plus-sustaining and AISC basis**. Price is under no obligation to go there, and a cost floor only binds over the medium run — and only if the cost anchor itself does not fall (§2d(iii): if gold retreats, the net cash-cost floor **rises**, which would *shrink* this distance without price moving).
2. **The premium to base is measured against an anchor that is 28 months stale at its canonical quote and has no published build.** A different, better-sourced incentive price could close some or all of it. That is the single highest-value data need (§7).
3. **Neither number may be used to size a position.** Every input is unvintaged (§8A); `copper.cost-incentive-range` is UNUSABLE; and the empirical distribution these numbers would have to be sized against is `not_assessable` at all ten horizons.
4. **Current price is present but unvintaged**, so the margin of safety is *computable* rather than "Not assessable" (§11) — but it inherits the price's own provenance. It is not an exchange settlement.

---

## 7. Sufficiency & Grade

### 7a. Required-series ledger (MODULE_RULES §8A) — the one row this orb owns

| Field | Value |
|---|---|
| **Need ID** | `copper-cost-incentive-range` |
| **Stable series ID** | `copper.cost-incentive-range` |
| **Owner orb** | `commodity-cost-curve` |
| **Status** | **UNUSABLE — `no_pool` / no accepted vintage** |
| **As-of** | 2026-08-28 |
| **Retrieval / vintage ID** | `missing:copper.cost-incentive-range:no-primary-vintage` — **no `sha256:` vintage; `source_vintage_refs` = []** |
| **Exact reason** | `data/COPPER/` does not exist; no connector vintage exists in this run; the pulse transport is dead (`PULSE-MISSING`, EPERM). The **vendor-ranked percentile cost curve required to state a true 90th percentile is paywalled and was not reached**: S&P Global *Mine cost outlook 2026* **HTTP 403**, S&P Global *Copper and Gold Market Outlook 2026* **HTTP 403**, Wood Mackenzie *Global copper mine cost curve* / *cost summary* paywalled (not attempted past the landing page). Additional failures: MINING.COM BlackRock incentive-price article **HTTP 403**, SEC EDGAR FCX 4Q-2025 8-K exhibit **HTTP 403**, LME Insight substitution article **HTTP 403**, **Codelco Q1-2026 Operational & Financial Report PDF unreadable binary** (852.9 KB, extraction failed — the same failure mode the supply orb logged). |
| **Consequence** | Both anchors are published as **anchor-grade BANDS from an unweighted producer sample plus broker relays**, never as a percentile. Under §8A none of it raises sufficiency or conviction. |

**Primary documents successfully read this run — five, listed so the claim can be checked:**

1. Capstone Copper, *2026 Guidance*, **2026-02-17** — C1 US$2.45–2.75/lb, production 200–230 kt, by-product price assumptions disclosed.
2. First Quantum Minerals, *2025 Preliminary Production and 2026–2028 Guidance*, **2026-01-15** — C1 and AISC for 2026/27/28, Au US$4,000/oz and 2.5%/yr inflation assumptions disclosed.
3. First Quantum Minerals, *Q1 2026 Results*, **2026-04-28** — C1 raised to US$2.15–2.40/lb, AISC raised to US$3.50–3.80/lb, realised copper price US$5.16/lb.
4. Antofagasta plc, *Q2 2026 Production Report*, **2026-07-15** — FY26 cash cost before by-product credits US$2.40–2.60/lb; net US$1.15–1.35/lb.
5. Antofagasta plc, *2026 Half Year Results*, **2026-08-13** — H1-26 net cash cost US$1.22/lb, −8% y/y.

### 7b. Anchor grade — reached, band-only, or missing

| Anchor | Reached? | Grade | Effect on the band |
|---|---|---|---|
| Cash-cost floor (Floor 1) | **Yes** — 5 primary producer disclosures + 2 relays | **anchor-grade BAND**, US$1.15–2.75/lb net (US$2.40–2.60/lb gross, Antofagasta) | Supports Floor 2 but does not set a band end on its own |
| ~90th-percentile all-in floor (Floor 2) | **BAND ONLY** — the true percentile was **not reached** | **anchor-grade BAND**, US$3.00–4.00/lb; low end broker-sourced and ~12 months stale | **Sets the bear end** |
| Incentive price | **BAND ONLY** — assertions, **no published build** | **anchor-grade BAND**, US$12,000–13,000/t; canonical quote **28 months stale** | **Sets the base** |
| Demand-destruction / substitution ceiling | **Not a profile anchor for copper**; not computable as a price level (no consistent aluminium price obtained) | context only, ratio space only | **Sets no band end**; explains why the bull row has no anchor |
| Sector-level history for either anchor (§16 stability) | **NO** | — | **`Not assessable`** — anchor stability cannot be shown; confidence capped |

### 7c. Scores and caps

- **Data sufficiency: 22 / 100** — root §11 band **0–29, "insufficient — refuse to rate"**. Basis: the one required series this orb owns is **unusable**; no accepted vintage exists; the vendor-ranked cost curve was not reached; the observed price itself is unvintaged (`copper.current-price` MISSING). The score is above the run's other modules (market-structure 10/100) **only** because five primary producer documents were read directly — and §8A bars even that from lifting it further.
- **Fair-value confidence: CAPPED at LOW / CONTEXTUAL.** Explicit reasons, each independently sufficient: (a) the required series is unusable and every input is unvintaged (§8A); (b) the base anchor is a **28-month-stale assertion with no reconstructable build** (§15); (c) the bear anchor is a **band, not a percentile**, because the ranked curve is paywalled; (d) **§16 anchor stability is `Not assessable`** — every incentive-price quote sits inside the 2024–26 bull run, and the cost floor's own direction is contested by two reachable readings; (e) the **base rate for any mean reversion is `not assessable`** (N = 0 price observations vs a floor of 30).
- **This orb issues NO `Action:` verdict.** Under MODULE_RULES §5 and §11 that belongs to the terminal `commodity-thesis` synthesis. Nothing here constitutes a proven critical risk, so **nothing here may be used to force `Avoid`** — and equally, **a negative margin of safety on an unvintaged, cycle-unstable anchor may not be used to force a `Trim` or a short.** The run's `not_assessable` distribution and unusable coverage mechanically produce **`Research More`**, and this orb does not disturb that.
- **Single highest-value next data request (§22) — one item.** A **lawful, dated, production-weighted copper mine cost curve with percentile ranks on a stated basis (C1, C1 + sustaining, and AISC shown separately), covering at least the 2015–2016 trough and the 2021 and 2024–26 peaks.** One series fixes four things at once: it replaces the band with a real 90th percentile, it supplies the multi-cycle history §16 demands for the stability test, it settles the contested direction of the cost floor, and it gives the incentive price a build instead of an assertion. Second, and only second: a producer-disclosed or feasibility-study-derived **incentive price with its capex, IRR hurdle, mine life and grade profile published**, so the US$12,000–13,000/t band can be rebuilt rather than quoted.

---

## Note to the Commodity Thesis

- **Fair-value band: bear US$3.00–4.00/lb (US$6,614–8,818/t), base US$5.44–5.90/lb (US$12,000–13,000/t), bull US$6.08–6.62/lb (US$13,400–14,595/t).** Carry the bull row **with its qualifier or not at all**: it is **not an upside target**, it is the statement that **the highest anchor this framework can build sits at or below where the market already trades**, and that upside beyond the observed price is **`not assessable`** from cost/incentive economics.
- **Margin of safety is NEGATIVE on the profile's own valuation lens, on both venues.** LME 3M: **+9.6% to +18.8% premium** to base, **−38.1% to −53.6%** to the floor. COMEX front: **+12.3% to +21.6% premium** to base, **−39.6% to −54.7%** to the floor. **Do not restate this as "copper is expensive"** (MODULE_RULES §6 bans the bare adjective) — restate it as: *the price is 10–22% above the level analysts say sanctions new mines, and 40–55% above the level at which the highest-cost tenth of supply stops covering its all-in sustaining cost.*
- **The single most decision-relevant number: at US$6.62/lb, a disclosed high-cost producer earns a 43%–47% margin over its OWN published all-in sustaining cost** (First Quantum AISC US$3.50–3.80/lb, 2026-04-28, PRIMARY), and 58%–83% over reachable net cash costs. **There is no cost support anywhere near this price.** Whatever is holding copper up, it is not the cost curve.
- **The cost floor cannot explain the rally, and the arithmetic is printed:** granting a cost-push story a **1.0 pass-through upper bound**, Codelco's +21.1 ¢/lb C1 rise explains **+US$0.211/lb of the +US$2.11/lb move — 10.0% explained, 90.0% residual (unattributed)**. This independently corroborates market-structure's ~100% residual on a *different* basis. **The terminal thesis must not adopt a cost-inflation driver story; this orb's arithmetic does not carry one.**
- **Both anchors are cycle-suspect and §16 stability is `Not assessable`.** Every incentive-price quote reachable was struck **inside the 2024–2026 bull run**; the canonical one is **28 months stale**. The cost floor's direction is **contested** (Codelco C1 **+10.0% y/y** and FQM guidance raised **+9.6%**, both PRIMARY, against a Wood Mackenzie relay of **−13.2%** whose vendor source was **not reached**). And most reachable cash costs are **net of by-product credits struck at record gold (US$4,000–4,300/oz) and molybdenum** — **if gold falls, the copper cost floor rises mechanically** (Freeport's own disclosed sensitivity: ±US$0.03/lb per ±US$100/oz gold, so gold at US$3,000/oz adds ~US$0.30/lb, ~17%, with no change in mining).
- **The reversion channel that can act inside 12 months is scrap and substitution — NOT new mines.** New mine supply has a 10–20-year lead and **no catalyst inside either forecast horizon**, so the incentive-price gap is **descriptive only at both 60 and 365 days**. What is already live and dated: scrap-based refined output **+5.6% Jan–May-2026**, scrap share **17.3% → 17.8%**, China's scrap feedstock share **25.2% H1-2026**; the **Cobre Panamá decision window 2026-12-31** (~350 kt/yr idled); named realised aluminium substitution (Ferrari, BMW, EV makers, Daikin, Jun–Jul 2026) with the Cu/Al ratio at **4.2–4.3 against an indicative 3.5–4.0 trigger**. **None of it is sized in tonnes, and the base rate for all of it is `not assessable`.**
- **Sufficiency and routing.** `copper.cost-incentive-range` is **UNUSABLE**; data sufficiency **22/100** (§11 refuse-to-rate band); fair-value confidence **capped at low/contextual**. Five primary producer documents were read — a genuine improvement on the run's 0.0% primary coverage — and **under §8A not one of them lifts sufficiency or conviction.** This orb issues no `Action:`; it establishes **no proven critical risk**, so it may not be used to force `Avoid`, and its negative margin of safety may not be used to force a `Trim` or a short on unvintaged, cycle-unstable anchors. The run's mechanical outcome remains **`Research More`**.
