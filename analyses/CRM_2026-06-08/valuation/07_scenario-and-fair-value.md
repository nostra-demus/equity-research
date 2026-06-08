# Scenario & Fair Value — CRM

**Company:** Salesforce, Inc. (NYSE:CRM) · **Reporting standard:** US GAAP · **Currency:** USD (millions unless per-share) · **Fiscal year ends Jan 31** · **As-of:** 2026-06-08

**Anchor numbers (verbatim from `01_price-and-capital-structure.md`):** current price **$185.66** (Capital IQ comps "Day Close Price Latest", 2026-06-08, last close); shares **819 M** (Apr-30-2026); market cap **~$152,056 M**; net debt **$30,711 M** (NOT net cash — flipped after the Informatica deal and ~$25 B of new senior notes); enterprise value (EV) **~$182,767 M**. Every per-share level below bridges EV to equity by subtracting the same $30,711 M net debt and dividing by 819 M shares.

**This agent triangulates the independent methods (`02`–`05`) into one fair-value range and the bull/base/bear levels around it.** It produces fair-value **levels** and the margin of safety only. Scenario probabilities, the probability-weighted target price, risk/reward, the final rating, and position sizing belong to the **master synthesizer**, not this module.

**One-line headline:** The methods disagree by a lot — peers say roughly fair (~$160–200), the DCF says worth more (~$233 base), and CRM's own multiple history says worth much more (~$302–356) — and the disagreement is the whole story; reconciled (not averaged), the defensible base-case fair value is **~$205–235 per share**, a ~16% margin of safety to the bear case sits below, and which way the stock resolves hangs on one swing factor: whether the guided second-half-FY27 revenue reacceleration actually shows up in bookings (cRPO), because every "worth more" lens needs that and the bookings data has not yet confirmed it.

---

## 1. Method Summary

All values are pulled from `02`–`05` verbatim, not re-derived. SOTP (`06`) was not run: Salesforce is a single reportable segment (>85% of profit from one operating segment), so SOTP collapses to the consolidated read and produces no independent value — it is excluded from the weighting and noted, not forced.

| Method | Fair / Implied Value (per share) | Confidence | Weight | Why This Weight |
|---|---:|---|---:|---|
| Own-history multiples (`02`) | ~$302–356 (3y-mean reversion, reliable metrics); full-5y memo ~$450+ (NOT warranted) | Medium-low | **20%** | The deep discount is real (NTM EV/EBITDA 10.6x is ~45% below its own 5y mean, NTM GAAP P/E 13.3x is a fresh low), but the lens itself says the *warranted* multiple has moved DOWN — growth roughly halved (~25% → ~9–10%) and the balance sheet flipped from ~$2 B net cash to $30.7 B net debt. So a full reversion to the old mean is not the base case; reliability for THIS company is discounted, and only the defensible lower end (~$302, revenue/EBITDA-anchored) is usable. |
| Relative / peers (`03`) | ~$160–200 (forward-anchored credible band) | Medium | **35%** | The clean forward comps (SAP NTM EV/EBITDA 14.0x, Adobe 8.1x, Oracle, Workday) bracket CRM's current 10.6x, and the trailing 30–44% "discount" is a peer-composition artifact the lens already stripped out. This is the "what would a buyer pay for this growth/margin/leverage profile today" anchor — the most grounded read of the current tape, so it carries real weight. |
| Intrinsic DCF (`04`) | $233 base (grid $175–304); downside-case $172; reported-FCF upside $275 | Medium | **45%** | Full audited cash-flow base, company guidance and consensus all present (no FCF-proxy cap). It carries the most weight because it is the only forward, cash-based intrinsic value and it disciplines the stock-comp / acquired-intangible-amortization treatment that usually over-values SaaS. Held to 45% (not higher) because terminal value is ~65% of EV (a 1-point WACC move swings the base ~$40–60/sh) and the GAAP-vs-non-GAAP margin call is itself the swing factor. |
| Reverse-DCF (`05`) | **implied, not a value** — price implies ~+0.9%/yr perpetual FCF growth (−0.8% to −1.2% over 10y) | Medium | **n/a** | Cross-check, not a weighted input. Tells us the price already requires almost no growth (below the ~3% economy rate), so the base case being *above* the price is achievable on the priced-in math — a low bar, not a stretch. |
| Sum-of-the-parts (`06`) | not run — single reportable segment | n/a | **n/a** | SOTP collapses to the consolidated read; no independent value to weight (`MODULE_RULES` Segment/SOTP rule). |

Weights sum to **100%** across the value-producing methods (`02` 20% + `03` 35% + `04` 45%). Reverse-DCF (`05`) is a cross-check, not a weighted value. SOTP (`06`) produces no independent value.

---

## 2. Triangulation & Reconciliation

**Weighted base-case fair value: ~$205–235 per share (midpoint ~$220).** The weighted central point of the three value-producing methods is ~$228 (DCF base $233 × 45% + peer forward-mid $180 × 35% + own-history defensible-low $302 × 20%); the base range brackets that point from the DCF base ($233) down toward peer parity (~$205, just above the peer-credible top of $200, to charge the leverage and slower-growth drag the peer lens identifies).

**The spread is the finding — it exceeds 40%, so it is reconciled here, not averaged (CLAUDE.md §16; `MODULE_RULES` Reconciliation Gate 6).** Across the method centrals the high-to-low spread is **~68%** ($302 own-history vs $180 peers); across the extremes it is **~123%** ($356 vs $160). This is a genuine three-way disagreement, and the reconciliation is about *which question each method answers*:

- **Where they agree:** all four methods agree the price is NOT demanding. The reverse-DCF proves it — at $185.66 the market is pricing in ~+0.9%/yr FCF growth forever, below the economy's ~3% and far below CRM's ~28%/yr four-year FCF history; if FCF merely grew with the economy at 3% forever, the EV would be worth ~$270/sh (+45%). No method says the stock is expensive.
- **Where they diverge, and who I trust:** the divergence is entirely about *how much* upside. I trust the **DCF and the peer lens more than the own-history reversion for THIS company**, and weight accordingly. The own-history method ($302–356) is the highest read but rests on reverting to a multiple built in the 2021 zero-rate, 20%+-growth, net-cash era — and the `02` lens itself says the warranted multiple has structurally moved down (growth halved, $30.7 B of net debt added), so that reversion is an *upside* scenario, not the base. The peer lens ($160–200) is the most grounded read of the current tape but the lowest, because forward comps already price CRM roughly in line. The DCF ($233) splits the two on disciplined cash flows that charge stock-based pay and refuse to bank acquired-intangible amortization — the economically honest middle. Reconciled, the base sits between the peer "fair today" floor and the DCF "worth more on cash flows" read: **~$205–235**, with the own-history high end pushed up into the bull case where it belongs.
- **The single binding swing factor across all three:** every "worth more than peers" read needs the same thing — the guided second-half-FY27 revenue reacceleration to appear in bookings/cRPO. It has not yet: cRPO has printed "in line" with no upside for two straight quarters (`02` §3; `05` §5). Until it does, the peer-parity floor governs; if it does, the DCF and own-history reversion open up.

---

## 3. Bull / Base / Bear Fair-Value Levels

Levels only — **no probabilities assigned** (that is the master synthesizer's job). Each case is tied to specific operating drivers and to the implied forward multiple. Note: the dedicated `earnings/07_earnings-sensitivity.md` was NOT produced in this run, so the operating-driver ranges below are taken from `earnings/04_guidance-consensus.md` and `earnings/02_revenue-drivers.md` (FY27 guide, FY30 framework, cRPO trend) as carried into `04`/`05` — flagged for the synthesizer.

| Case | Fair Value / Share | Implied NTM EV/EBITDA | Implied NTM P/E | What Must Be True (operating drivers) |
|---|---:|---:|---:|---|
| **Bull** | **$275–320** | ~14.8–16.9x | ~19.8–23.0x | Second-half-FY27 revenue reacceleration confirms in cRPO/bookings; revenue holds ~11%+ toward the FY30 ~$63 B framework; GAAP operating margin expands past ~26% toward the non-GAAP target as scale leverage lands; AND the market accepts CRM's reported-FCF treatment (full D&A added back). Lower end ($275) = `04` reported-FCF upside; upper end ($302–320) = `02` 3y-mean multiple reversion. This requires re-rating to ~CRM's own 3y mean (~16.6x NTM EV/EBITDA) — a multiple it earned when growing faster, so it is conditional on growth re-accelerating, not automatic. |
| **Base** | **$205–235** | ~11.5–12.9x | ~14.7–16.9x | FY27 revenue ~10.9% (guide midpoint $46.05 B), fading toward ~GDP+ over the decade; GAAP operating margin expands ~21% → ~26% on operating leverage (well below the 34.3% non-GAAP target, by design); capex stays light (~1.5–2% of revenue); deferred-revenue billing keeps reinvestment near neutral; net debt ~2.4x EBITDA serviced (EBITDA/interest ~22x). This is the disciplined DCF base ($233) pulled toward peer parity for the leverage/growth drag. Implied multiple (11.5–12.9x) sits just above CRM's current 10.6x and below SAP's 14.0x — a modest, warranted step-up, not a re-rating to the old mean. |
| **Bear** | **$160–175** | ~9.4–10.1x | ~11.5–12.6x | Revenue fades hard (toward ~3% sooner); margin expands only to ~23%; the deferred-revenue cash tailwind fades; cRPO stays "in line" with no reacceleration, so the market keeps CRM at peer-parity forward multiples and refuses to pay up while the new-debt interest drag holds reported FCF growth in low single digits. Lower end ($160) = `03` forward EV-multiple floor; upper end ($172–175) = `04` downside-case / DCF grid floor. Implied multiple (~9.4–10.1x) is roughly the current peer median (9.86x) — i.e. CRM priced as a no-growth, levered software name. |

---

## 4. Margin of Safety

Sign convention: margin of safety = `(base FV − price) / base FV`; a positive number means the price sits below fair value, so a margin of safety exists. Up/downside = `(level / price − 1)`.

| Metric | Value |
|---|---:|
| Current price | $185.66 |
| Base-case fair value (midpoint) | ~$220 |
| Base-case fair value (range) | ~$205–235 |
| Bear-case fair value | ~$160–175 (using $160 lower anchor for the downside) |
| Upside to base case (midpoint) | **+18.5%** |
| Upside to base case (low / high) | +10.4% / +26.6% |
| Downside to bear case (low / high anchor) | **−13.8%** (to $160) / −5.7% (to $175) |
| **Margin of safety = (base FV − price) / base FV** (on midpoint $220) | **+15.6%** |
| Margin of safety (on base-low $205, conservative) | +9.4% |

**Read:** at $185.66 there is a ~16% margin of safety to the base-case midpoint and ~9% to the low end of the base range. The downside to a defensible bear case (~$160–175) is roughly **−6% to −14%** — shallow, because the price already sits close to the DCF downside-case ($172) and the peer forward-multiple floor ($160). The reverse-DCF reinforces this: the price is between "zero FCF growth forever" ($161/sh equivalent) and "3% growth forever" ($270/sh), much closer to the no-growth end, so the priced-in expectations leave limited room below before the valuation would require FCF to actually shrink for a decade.

---

## 5. Warranted-Multiple Check

The base-case fair value ($205–235) implies a forward multiple of **~11.5–12.9x NTM EV/EBITDA** and ~14.7–16.9x NTM P/E. That sits just above CRM's current 10.6x and below its closest large-suite comp SAP (14.0x), and below its own 3-year mean (~16.6x) — a multiple a ~30% EBITDA-margin, ~38% FCF-margin software franchise with ~10% growth plausibly deserves, so the base does NOT require a multiple the business has never earned. The **bull case is where the warranted-multiple risk lives**: $275–320 implies ~14.8–16.9x, a re-rating back toward CRM's own faster-growth-era mean, which is only warranted if the second-half-FY27 revenue reacceleration confirms in bookings/cRPO — absent that, paying up to the old mean is paying for growth the bookings data has not yet shown, and that is the value-trap risk to flag on the upside (it is a *do-not-underwrite-the-snap-back* caveat, not a structural trap).

**The §24 Filter 6 unaligned-owner value-trap overlay does NOT apply here.** The management-governance module (`04_ownership-and-insider-behavior.md`, finding 04-015) confirms RF-OWN-004 does not trigger: Salesforce has no controlling owner, one-share-one-vote (no dual class), the founder-CEO holds only 2.8%, pledging and hedging are affirmatively banned, and an activist (ValueAct) sits on the board with interests aligned to per-share value. So persistent cheapness here is not a structural value trap from a value-indifferent owner — the cheapness, to the extent it exists, is the lower *warranted* multiple from slower growth plus fresh leverage (`02`/`03`), which the base case already incorporates.

---

## 6. Fair-Value Read

The defensible base-case fair value is **~$205–235 per share** (midpoint ~$220), about **+16% above** the $185.66 price, with the bear case at **~$160–175** giving roughly **−6% to −14%** downside — a shallow floor because the price already sits at the DCF downside and peer forward-multiple floor. The **DCF drives the answer** (45% weight: the only forward cash-based intrinsic value, base $233), pulled down toward peer parity ($205) for the leverage and slower-growth drag the peer lens identifies, with the own-history reversion ($302–356) pushed up into the bull case because the warranted multiple has structurally moved down (growth halved, net debt up $32 B in a year) and that reversion is upside, not base. The **single biggest swing factor between bull and bear is whether the guided second-half-FY27 revenue reacceleration shows up in bookings (cRPO)** — every "worth more than peers" read needs it, the reverse-DCF shows the price is paying for almost no growth so the bar is low, but cRPO has printed "in line" with no upside for two straight quarters, so the peer-parity floor governs until that confirms.

---

### Self-Check
- Every method's value and confidence pulled from `02`–`05` verbatim, not re-derived; SOTP (`06`) correctly noted as collapsing to the consolidated read (single segment). ✓
- Method weights justified by reliability FOR THIS company and sum to 100% across value-producing methods (`02` 20% + `03` 35% + `04` 45%). ✓
- Reverse-DCF (`05`) used as a cross-check, weight n/a — not a weighted value. ✓
- Cross-method disagreement >40% (centrals ~68%, extremes ~123%) flagged as the headline and reconciled explicitly, not averaged. ✓
- Bull/base/bear are fair-value LEVELS tied to operating drivers and implied multiples — NO probabilities assigned. ✓
- Margin of safety computed explicitly with stated sign convention (+15.6% on base midpoint; downside −6% to −14% to bear). ✓
- Warranted-multiple check done; value-trap risk flagged on the BULL case (re-rating to old mean needs unconfirmed reacceleration); §24 Filter 6 confirmed NOT tripping (RF-OWN-004 not triggered per management-governance `04`). ✓
- Boundary respected: no probabilities, no probability-weighted target, no risk/reward ratio, no rating, no position sizing. ✓
- Level math executed in Python (`/tmp/crm_fv_levels.py`); EV→equity bridge uses `01` net debt $30,711 M ÷ 819 M shares throughout. ✓
- No banned phrases used without a paired number. ✓

**Partial-data note for the synthesizer:** cross-module `business-model/07_business-quality.md`, `09_moat.md`, `10_external-dependency.md`, and `earnings/07_earnings-sensitivity.md` were NOT produced in this run. The warranted-multiple judgment leans on `02`/`03`'s own quality/growth/leverage reads and `04`'s ROIC ~11.8% > WACC 8.5% moat inference; the bull/base/bear operating drivers are anchored to `earnings/04` guidance and `earnings/02` revenue drivers rather than a dedicated sensitivity module. Triangulation confidence is therefore capped by the three-way >40% method spread (`MODULE_RULES` cap: valuation confidence max 55 where methods disagree >40% — here reconciled, but the spread is real and the synthesizer should carry it).
