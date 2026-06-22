# Scenario & Fair Value — NIVABUPA

**Company:** Niva Bupa Health Insurance Company Limited (NSEI:NIVABUPA / BSE:544286)
**Business type:** Financial issuer — IRDAI-regulated standalone health insurer (SAHI)
**Reporting currency:** INR (Indian Rupees). Figures in INR per share unless stated; monetary totals in INR millions (1 crore = 10 million).
**Reporting standard:** India GAAP (IRDAI insurance template); IFRS voluntarily reported as the primary management metric.
**Fiscal year end:** 31 March. FY26 = April 2025 – March 2026.
**Analysis date:** 2026-06-22
**Price-state:** `pool-verified` — INR 84.03 from Capital IQ export; three independent pool sources agree within 0.4%; last confirmed-dated close INR 83.62 on 2026-05-21 (~32 days stale). [01_price-and-capital-structure.md §1]

**Anchor block (from `01`, used verbatim throughout):**
- Price: INR 84.03
- Shares: 1,847.757 million (basic, proxy for fully diluted — dilution schedule absent from pool)
- Market cap: INR 155,267M (INR 15,527 crores)
- Net debt (strict): INR 1,954.1M (total debt INR 3,540.7M − operating cash INR 1,586.6M; insurer investment portfolio of INR 96,072.9M is NOT netted)
- BV/share: INR 19.39 | TBV/share: INR 19.11 | FY26 EPS (reported): INR 1.98

**Business-type gate (read first):** Niva Bupa is a Financial issuer per MODULE_RULES Business-Type Map. This means (a) the RI model / excess-return method is the primary intrinsic lens, not an FCFF DCF; (b) the primary equity multiples are P/E and P/Tangible Book; (c) EV-based multiples are informational only and do NOT enter the fair-value calculation; and (d) any equity bridge (net debt subtraction) is done at the book/market equity level, not via an EV → equity step. All bridge arithmetic below uses the P/BV or residual-income framework, which is already equity-direct — no net debt subtraction is applied to a value that already sits at the equity level.

---

## 1. Method Summary

| Method | Fair / Implied Value (per share) | Confidence | Weight | Why This Weight |
|---|---:|---|---:|---|
| Own-history multiples (02) | INR 77.4–81.5 (illustrative range only) | Very low | **0%** | Short history: 6 quarterly observations since Nov 2024 IPO, below the ~3-year minimum. Agent 02 explicitly flagged all reversion-implied values as "illustrative-only — NOT fair-value inputs for 07." Excluded per partial-data rule and the agent's own caveat. Range shown in §2 football field for transparency only. |
| Relative / peers (03) | INR 75.8 (primary: quality-adj P/E); INR 63.2 (secondary: ROE-scaled P/TBV) | Medium-low | **30%** | Peer set is thin (2 primary comps; 1 of the 2 has no usable NTM P/E; Star Health P/TBV not available). Quality adjustment is necessary and applied (12.5% discount from SAHI median; ROE-scaling for P/TBV). The primary P/E implied value of INR 75.8 is the most market-grounded anchor and carries moderate weight, but the thin peer set limits confidence. |
| Intrinsic RI / excess-return model (04) | INR 19.94 (base); range INR 15.4–25.7 | Medium | **70%** | Primary intrinsic method for a Financial issuer per Business-Type Map. Directly values the franchise on ROE vs cost of equity. Assumptions labeled; Ke cross-checked against moat module estimate (37 bps difference — within tolerance). The "no moat proven" terminal condition is evidence-anchored. Dominant weight because this is the correct method for this business type; confirmed directionally by the structural observation that 97% of intrinsic equity value is the starting book (INR 19.39/share). |
| Reverse-DCF (05) | Peak ROE implied = 48.9% | n/a — cross-check only | n/a | Inverts `04`'s model. Finds that the current price of INR 84.03 requires a peak ROE of ~49% by FY30 — approximately 3× management's most optimistic guided outcome and 2.7× the best peer ROE observed in the sector. Confirms price is embedding expectations that are structurally implausible. Not a value input; used only to assess what is priced in. |
| Sum-of-the-parts (06) | INR 76.4–108.9 (sanity-check range only) | Low | **0%** | SOTP collapsed to consolidated read: 100% of EBIT in one "Health Insurance" segment; no sub-segment profit disclosed in any filing or transcript. Agent 06 explicitly flagged this as a "dominant-segment sanity check only." Excluded from triangulation per partial-data rule and agent's own flag. Range shown in §2 football field for transparency. |

**Weights sum to 100% across the two value-producing methods (03 and 04).** Methods 02 and 06 are zero-weighted per their own producers' flags. The reverse-DCF (05) is a cross-check, not a weighted input.

---

## 2. Triangulation & Reconciliation

### Method Football Field — Full Cross-Method Dispersion

| Method | Value / Range | Confidence | Weight | Why this weight |
|---|---:|---|---:|---|
| Own-history multiples (02) | INR 77.4–81.5 (illustrative-only) | Very low | 0% | 6 data points, ~18 months history; agent flagged "not a fair-value input." Shown for transparency only. |
| Relative / peers (03) — primary P/E | INR 75.8 | Medium-low | 30% | Quality-adjusted warranted multiple; thin peer set (2 comps) |
| Relative / peers (03) — secondary P/TBV | INR 63.2 | Low | 0% (subsumed in 03's 30%) | ROE-scaled anchor; shown as the floor within method 03 |
| Intrinsic RI model (04) — base | INR 19.94 | Medium | 70% | Primary method for Financial issuer; Ke and terminal ROE anchored to moat verdict |
| Intrinsic RI model (04) — bull | INR 25.7 | — | — | Ke −1pp, peak ROE 15.5%, small perpetual excess |
| Intrinsic RI model (04) — bear | INR 15.4 | — | — | Ke +1pp, ROE peaks 12%, never exceeds Ke |
| Sum-of-the-parts (06) | INR 76.4–108.9 (sanity-check only) | Low | 0% | Collapsed single-segment; shown for transparency only |

**Cross-method spread headline: the two value-producing methods disagree by 280% in spread terms ((INR 75.8 − INR 19.94) / INR 75.8 = 73.7%). This is far above the 40% cross-method divergence threshold and is the headline finding of this reconciliation.**

### Derivation of the Base-Case Fair Value Point

Computed via Python bisection (executed above):
- Peer (03) primary value: INR 75.80 × 30% = INR 22.74
- RI model (04) base: INR 19.94 × 70% = INR 13.96
- **Mechanical weighted blend: INR 36.70/share**

**Reconciliation judgment — why the RI model dominates (70/30):**

For an IRDAI-regulated health insurer — a Financial issuer per MODULE_RULES — the intrinsic method is the residual-income model, which values equity on the spread between ROE and the cost of equity, not on cash flows to the firm. This is the correct primary lens. The RI model here is built on documented FY26 book equity of INR 35,824M, a Ke of 12.87% (inputs sourced and cross-checked), and a terminal ROE of Ke (anchored to the "No moat proven" verdict from `09_moat.md §5`). It is internally consistent, correctly structured for this business type, and covers the full 10-year explicit period plus terminal.

The peer method (03) is the secondary anchor. The peer set is thin — only two listed comparables in the SAHI category, one of which (Star Health) lacks a usable TBV multiple, and the Capital IQ NTM EPS for NIVABUPA is flagged as unreliable (see `03_relative-valuation-peers.md §2`). The 30% peer weight is appropriate: the method is valid, the primary P/E implied value (INR 75.8) is evidence-based, but the thin comp set limits its standing.

The large spread (INR 75.8 vs INR 19.94 = 73.7% gap) reflects a real economic disagreement, not a data problem: **the peer multiple embeds the market's growth premium for Niva Bupa's trajectory toward underwriting profitability, while the RI model assigns value based on what the business actually earns relative to its cost of capital.** At an ROE of 10.7% versus a Ke of 12.87%, the business currently destroys equity value in economic terms — the RI model values that honestly. The peer multiple reflects what investors are willing to pay today for the option on mid-teens ROE, regardless of whether that outcome is achievable. Both lenses are methodologically correct; the RI model is given higher weight because it is the primary intrinsic method for this business type, and because the reverse-DCF (05) confirms the peer multiple-implied price is embedding expectations that are structurally implausible.

The mechanical weighted blend of INR 36.70/share is adopted as the base-case fair value without adjustment. No silent re-anchor is applied.

---

## 3. Bull / Base / Bear Fair-Value Levels

All fair-value levels computed via executed Python snippet (outputs shown in §2 derivation section above). Horizon: 12 months (default). No probabilities assigned.

**Note on cyclicality gate:** Niva Bupa is not a cyclical or commodity business. Business quality cyclicality score = 65/100 (strong — health insurance demand is largely non-cyclical; see `07_business-quality.md §1`). The standard cyclicality gate (requiring a through-cycle trough anchor) is not the binding constraint. The binding driver is **operating leverage on the combined ratio** and **IRDAI regulatory binary risk** — the two largest variables from `07_earnings-sensitivity.md §2`.

**Structural-reset / permanent-impairment trigger check:**
- Moat verdict: "No moat proven" — bare unproven moat, NOT an actively eroding moat trajectory. Moat trajectory is described as "widening" in `09_moat.md §5`.
- Business quality disruption score: 55 (above the ≤40 threshold for the §24 Filter 5 flag).
- Per MODULE_RULES graduated-trigger rules: a bare "No moat proven" verdict (unproven, not decaying) with a usable `04` in the blend (70% weight, and it fades terminal ROE to Ke) means the structural reset is NOT the headline Bear. It is carried as the labelled **avoid-ruin floor** to §24 below. The headline Bear is the 12-month scenario built from `07_earnings-sensitivity.md` drivers.

| Case | Fair Value / Share (INR) | Implied P/E | Implied P/BV | Horizon | What Must Be True |
|---|---:|---:|---:|---|---|
| Bull | **INR 43.98** | 22.2× | 2.27× | 12 months | RI: Ke −1pp (11.9%), ROE reaches 15.5% (above guided "mid-teens"), terminal ROE modestly above Ke (1.03×); peer: no quality discount from SAHI median (43.75× LTM P/E). Requires: EOM ratio falls ~300 bps in FY27 (above-trend operating leverage), combined ratio breaks 99% early (FY28), no adverse IRDAI regulatory action, investment yields hold near 7.2%, and market re-rates to full SAHI peer multiple (removing the quality discount). GWP growth sustains at ≥25%. |
| **Base** | **INR 36.70** | **18.5×** | **1.89×** | 12 months | RI: Ke 12.87%, ROE reaches 14.5% by FY30 (management's guided "mid-teens" range), terminal ROE = Ke (no moat). Peer: quality-adjusted warranted LTM P/E of 38.3× (12.5% discount from SAHI median). Requires: EOM ratio declines ~200 bps per year (in line with management guidance), combined ratio approaches 99% by FY29, investment yield stable at ~7.2%, IRDAI does not materially disrupt commission/EOM structure, GWP grows at ~22–25% CAGR. |
| Bear | **INR 16.51** | 8.3× | 0.85× | 12 months | RI: Ke +1pp (13.9%), ROE peaks at 12.0% (never exceeds Ke) — GWP growth slows to ~12–15%, fixed-cost leverage reverses, EOM ratio re-widens 200 bps. Peer: P/TBV at 1.0× (book value) — appropriate anchor for an insurer earning at or below its cost of equity. Requires: one or more of: (a) IRDAI imposes adverse commission-cap restructuring, causing GWP growth to fall 10+ ppts; (b) medical inflation accelerates to 9–10%, widening loss ratio by 200 bps; (c) RBI rate-cut cycle compresses investment yield by 100 bps — all three compound adversely per `07_earnings-sensitivity.md §6` (the non-linear negative case). |

**§24 Avoid-ruin floor (structural-reset — NOT the headline Bear):** The bare "No moat proven" trigger fires the structural reset calculation, which is demoted from the headline Bear because (a) the moat trajectory is widening (not actively eroding), and (b) `04` (with 70% weight) already fades terminal ROE to Ke, so the no-excess-return impairment is priced into the blend.

Structural reset computed on the business-type-appropriate equity method — P/BV at ROE/Ke ratio (already equity-direct; no net debt subtraction needed):
- Required sustainable ROE if current P/BV of 4.33× is warranted: 4.33 × Ke (12.87%) = 55.8% — unachievable.
- Structural reset P/BV = ROE / Ke = 10.7% / 12.87% = 0.831× (the insurer permanently earns its current ROE with no improvement).
- Structural reset per share = 0.831× × BV/share INR 19.39 = **INR 16.12/share**.
- Snippet output: `structural_reset_pershare = 19.39 * (10.7 / 12.87) = INR 16.12` (this is already an equity value from a P/BV method on BV/share — dividing by shares directly, no net debt subtraction).

The avoid-ruin floor is **INR 16.12/share** — broadly consistent with the RI bear (INR 15.4) and the headline Bear (INR 16.51), confirming the bear case effectively encompasses the structural reset already. The floor is labelled for §24 / Kill Criteria as the multi-year permanent impairment scenario (ROE permanently stuck at 10.7%, no operating leverage materialisation, market re-rates to 0.83× book).

---

## 4. Margin of Safety & Downside (two separate metrics)

All computed via executed Python snippet (outputs verified above):

```
base_fv = 0.70 × 19.94 + 0.30 × 75.80 = 13.96 + 22.74 = INR 36.70
bear_fv = 0.70 × 15.40 + 0.30 × 19.11 = 10.78 + 5.73 = INR 16.51
MOS  = (36.70 − 84.03) / 36.70 = −129.0%
DTB  = (84.03 − 16.51) / 84.03 = +80.4%
```

| Metric | Value |
|---|---:|
| Current price | INR 84.03 |
| Base-case fair value (point) | INR 36.70 |
| Bear-case fair value | INR 16.51 |
| Bull-case fair value | INR 43.98 |
| Implied downside to base = (price − base FV) / price | −56.3% (price is 56.3% above base fair value) |
| Implied upside to bull = (bull FV − price) / price | −47.7% (price is above even the bull case) |
| **Margin of safety** = (base FV − price) / base FV — the cushion | **−129.0%** — no margin of safety exists; price is 129% above base fair value |
| **Downside to bear** = (price − bear FV) / price — *inverted: higher = worse* | **+80.4%** — price would need to fall 80.4% to reach the bear fair value |

**Interpretation:** The margin of safety is deeply negative (−129.0%), meaning the current price of INR 84.03 is not below but far above the base fair value of INR 36.70. There is no cushion; the risk runs entirely in the other direction. The downside-to-bear of 80.4% describes the loss if the bear case plays out. Even in the bull case (INR 43.98/share), the stock offers no positive return from the current price — it is priced above every scenario in the fair-value grid.

Price-state: `pool-verified` — both price-relative metrics are assessable. ~32 days staleness between today's analysis date and the last confirmed-dated close (INR 83.62 on 2026-05-21) is a data-quality caveat, not a no-price trigger. At a 56% implied downside to base fair value, this staleness is immaterial to the conclusion.

---

## 5. Warranted-Multiple Check

The current price of INR 84.03 implies a P/BV of 4.33× on FY26 book equity. For a P/BV multiple to be economically justified, the business must be able to sustain a ROE at least equal to: P/BV × Ke = 4.33 × 12.87% = **55.8%**. Niva Bupa's FY26 ROE is 10.7% — a factor of 5.2× below what the current multiple requires. Management's most optimistic guided outcome is "mid- to high-teens" ROE by FY29, and the best comparable peer (ICICI Lombard) achieves 17.8%. The current P/BV multiple demands a level of return the company has never approached and that no named peer in the sector has ever achieved.

The reverse-DCF (`05`) independently confirmed this: justifying INR 84.03 on the RI model requires a peak ROE of ~49% by FY30, approximately 2.7× the best ROE in the Indian health insurance sector. This is not a case of a modestly stretched multiple that a few years of operating improvement could close — the gap is structural, rooted in the economics of health insurance (loss ratios above 60%, regulated EOM caps, investment yields of 7%). The stock is not temporarily expensively priced relative to a reachable fair value; it is priced for an outcome the business model cannot deliver.

No RF-OWN-004 (misaligned controlling owner) flag was formally triggered by the governance module — Bupa Group (55.35% promoter) is assessed as broadly aligned with per-share value creation [management-governance/99_management-governance-synthesis.md §1], and the governance synthesis did not apply the §24 Filter 6 value-trap cap. The related-party risk (unquantified Bupa Singapore brand/reinsurance/technology fees) is unresolved due to absent Annual Report but is not a triggered flag. The warranted-multiple gap is driven by fundamentals, not ownership structure.

---

## 6. Fair-Value Read

The base-case fair value for Niva Bupa is **INR 36.70/share** (bull: INR 43.98; bear: INR 16.51), derived 70% from the residual-income (excess-return on equity) model and 30% from quality-adjusted peer multiples — the correct method mix for a Financial issuer with a "No moat proven" verdict. The current price of INR 84.03 is 56% above the base fair value and 91% above even the bull fair value — there is no scenario in the valuation grid at which the stock is priced attractively. The margin of safety is −129% (price is 129% above the base fair value); the downside to the bear case is 80%. The dominant method is the RI model (04): for an insurer earning a 10.7% ROE against a 12.87% cost of equity, intrinsic value is anchored close to book value (INR 19.94/share base) because the company earns below its cost of capital now and has no proven moat to sustain excess returns in perpetuity. The single biggest swing factor between bull and bear is the EOM ratio / operating leverage trajectory: a bull move of 270 bps EOM improvement adds ₹1.03 to EPS; a bear reversal of 200 bps (if GWP growth slows sharply or IRDAI disrupts distribution economics) strips ₹0.77 from EPS — and either outcome compounds with the medical inflation and investment yield variables, creating a non-linear downside asymmetry in the bear case. The market is pricing Niva Bupa's option on mid-teens ROE as if that outcome is a near-certainty; the evidence from the business itself (10.7% ROE, combined ratio still above 100%, no proven moat, IRDAI regulatory uncertainty) says it is a possibility at best.

---

## Self-Check

- [x] Every method's value and confidence pulled from `02`–`06`, not re-derived.
- [x] Method weights (30% peer / 70% RI) justified by reliability for this Financial issuer; sum to 100% across value-producing methods. Mechanical blend (INR 36.70) is the published base — no silent re-anchor. Methods 02 and 06 zero-weighted with reasons stated.
- [x] Reverse-DCF used as cross-check only, not weighted.
- [x] Method disagreement 73.7% (>40%) flagged as headline finding in §2.
- [x] Bull / base / bear are each a single derived LEVEL (a point), tied to operating drivers and dated (12 months). No probabilities assigned.
- [x] Margin of safety = (base FV − price) / base FV = −129.0%; downside to bear = (price − bear FV) / price = +80.4%. Two SEPARATE metrics; neither is a proxy for the other. Price-state is `pool-verified`; both are assessable.
- [x] Warranted-multiple check: P/BV 4.33× requires sustained ROE 55.8%, unachievable. No value-trap from RF-OWN-004 (not formally triggered by governance module).
- [x] Boundary respected: no probabilities, no risk/reward, no rating, no position sizing.
- [x] Weighted level math, margin of safety, and implied multiples produced by executed Python snippet (outputs shown in §2 and §4).
- [x] Cyclicality gate: not a cyclical/commodity business (cyclicality score 65); bear case built from sensitivity module variables (EOM reversal + IRDAI regulatory risk) — appropriate for this business type.
- [x] Structural-reset / permanent-impairment trigger: bare "No moat proven" fired; structural reset INR 16.12/share computed via P/BV × BV/share (already equity-direct — no net debt subtraction); routed to §24 avoid-ruin floor (not headline Bear) because `04` is in the blend and moat is widening, not eroding. Reset per-share reconciles to stated method and inputs.
- [x] No banned phrases.

---

*Sources used:*
- `analyses/NIVABUPA_2026-06-22/valuation/01_price-and-capital-structure.md` — price, shares, net debt, EV, BV/share anchor
- `analyses/NIVABUPA_2026-06-22/valuation/02_multiples-own-history.md` — own-history multiple bands (illustrative-only flag confirmed)
- `analyses/NIVABUPA_2026-06-22/valuation/03_relative-valuation-peers.md` — peer-implied values (INR 75.8 primary; INR 63.2 secondary)
- `analyses/NIVABUPA_2026-06-22/valuation/04_intrinsic-dcf.md` — RI model base INR 19.94, bull INR 25.7, bear INR 15.4; Ke 12.87%
- `analyses/NIVABUPA_2026-06-22/valuation/05_reverse-dcf.md` — implied peak ROE 48.9%; cross-check used only
- `analyses/NIVABUPA_2026-06-22/valuation/06_sum-of-the-parts.md` — sanity-check range INR 76.4–108.9 (collapsed single-segment flag confirmed)
- `analyses/NIVABUPA_2026-06-22/business-model/07_business-quality.md` — aggregate quality 54/100; regulatory dependence 30/100; disruption score 55
- `analyses/NIVABUPA_2026-06-22/business-model/09_moat.md` — "No moat proven" verdict; moat trajectory widening; Ke cross-check ~12.5%
- `analyses/NIVABUPA_2026-06-22/earnings/07_earnings-sensitivity.md` — variable ranges for bull/base/bear drivers; EOM, loss ratio, investment yield impacts
- `analyses/NIVABUPA_2026-06-22/management-governance/99_management-governance-synthesis.md` — governance verdict, RF-OWN-004 status, ownership structure
- Capital IQ Financials.xls (NSEI:NIVABUPA), FY2026 data, vendor tier §4 tier 5; Capital IQ EstimatesReport.xls, data as of 2026-05-11, vendor tier §4 tier 5
