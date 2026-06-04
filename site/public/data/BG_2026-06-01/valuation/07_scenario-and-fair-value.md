# Scenario & Fair Value — BG

**Company:** Bunge Global SA (NYSE: BG). **Reporting currency:** US$ (per-share in US$/share). **Business type:** commodity/cyclical **Operating** company (agri-commodity oilseed processor/merchandiser) per `00_valuation-data-triage` and `01_price-and-capital-structure`. **Today:** 2026-06-01.

**Anchors carried verbatim from `01` (not re-derived):** indicative price **$123.35** — *web-sourced as of 2026-06-01, not from data pool — unverified* (MarketBeat last close 2026-05-29; corroborating band ~$123–126.50); per-share fair-value share count **195,733,665** (diluted WA, 10-Q Note 18); net debt **$13,714M**; NCI + redeemable NCI **$1,432M**; consolidated EV **$39,078M**; book value/share ~$81.97; tangible BV/share ~$63.61.

> **NO POOL-SOURCED PRICE — confidence cap binds and propagates.** The only price available is web-sourced/indicative. Per the partial-data rule and `01`'s instruction, this agent expresses fair value as **levels** with the observed up/downside explicitly caveated, and propagates the no-price cap: **valuation confidence ≤ 55; margin of safety is computed against the indicative price but flagged as not-pool-verified.** Restoring a pool-sourced price is the single highest-value missing input.

> **HEADLINE FINDING (cross-method spread > 40%).** The three value-producing methods disagree by **~53%** on the base case — relative/peers center ~$137.5, intrinsic DCF midpoint ~$105, SOTP-normalized base ~$90. Per `MODULE_RULES.md` Reconciliation Gate 6, that disagreement is itself the finding and caps valuation confidence at 55 independent of the price gap. The spread is **not** a data error — it is the gap between a *forward-normalized* lens (peers/reverse-DCF, which credit the FY26 biofuel-led margin recovery) and a *through-cycle mid-cycle* lens (intrinsic DCF / SOTP, which haircut margins back toward the cycle middle and subtract $13.7bn of post-Viterra net debt). Reconciled in §2.

---

## 1. Method Summary

| Method | Fair / Implied Value (per share) | Confidence | Weight | Why This Weight |
|---|---:|---|---:|---|
| Own-history multiples (02) | No usable point — directional only | Low | **0%** | No multi-year traded-multiple band exists in the pool; `02` produced **no** reversion target (the formal implied-value table was correctly skipped) and explicitly deferred value to `03`/`04`/`05`. It contributes a *qualifier*, not a value: current forward EV/EBITDA ~9–10x and forward P/E ~12–13x are mid-range on BG's own curve, with **no multiple expansion embedded beyond FY26**. Cannot carry weight without a value. |
| Relative / peers (03) | **$126 – $155** (center ~$135–140) | Low | **30%** | Forward P/E (13.1x vs ~13.4x ADM/Wilmar median, −2%) is the single cleanest cyclical comparator and is reliable; but the EV/EBITDA leg rests on a **trough-distorted, two-stock** peer denominator (no peer export in pool; usefulness capped 70). Weighted below DCF because the upside half of its range leans on a noisy ~12–14x peer EV/EBITDA the group does not warrant. |
| Intrinsic DCF (04) | **$85 – $130** (midpoint ~$105; Gordon $115 / exit $86) | Medium-Low | **45%** | Primary intrinsic method for a commodity/cyclical operator, run correctly on a **mid-cycle margin band (3.2–3.5%)**, not a peak/trough point. Highest weight because it is the only method that normalizes the cycle *and* respects the balance sheet, and it reconciles economically (reinvestment 25.6% × ROIC 9.7% ≈ 2.5% terminal g). Held to Med-Low — not higher — because terminal value is 66–72% of EV and the WACC (7.0% vs mechanical 6.05%) is the single most judgmental input. |
| Reverse-DCF (05) | (implied, not a value) — price embeds **~2.3% FCFF CAGR / ~3.3% EBIT margin** | Low | **n/a** | Cross-check, not a weighted input. Tells us the ~$123 price requires only mid-cycle economics to *hold* (no margin recovery to the FY23 peak, no above-GDP growth). Informs whether the base case is achievable — see §2 and §5. |
| Sum-of-the-parts (06) | **$54 / $90 / $129** (SOTP-B normalized bear/base/bull) | Low | **25%** | A four-segment SOTP that **collapses to the consolidated read**: the segments are economically near-identical thin-margin (2.5–4.6% EBIT) commodity processors, so SOTP unlocks no hidden value and applies no conglomerate discount. Its real contribution is to **pin the downside** — it quantifies how $13.7bn net debt ($70/share) absorbs 60–70% of gross EV before equity. Weighted below DCF because every segment multiple is comparable-justified against a single public peer (ADM at a 10-yr-high). |

Weights sum to **100%** across the value-producing methods (03 + 04 + 06 = 30 + 45 + 25). `02` carries 0% (no value produced). Reverse-DCF (`05`) is a cross-check, not a weighted value. No method the Business-Type Method Map marks "do not use" for a commodity/cyclical operating company is used; all three weighted methods are EV/FCFF-based or SOTP, which is correct for the type.

---

## 2. Triangulation & Reconciliation

**Weighted base-case central fair value: ≈ $111/share** (0.45 × $105 DCF + 0.30 × $137.5 peers + 0.25 × $90 SOTP). Blending each method's range edges gives a **weighted base-case range of ≈ $100 – $137**, which this agent narrows to a **defensible base of ~$100 – $115 (midpoint ~$108)** by leaning conservative where the methods conflict (`MODULE_RULES` Core Principle 6) — specifically, by discounting the upper half of the peer range, which rests on a trough-distorted peer EV/EBITDA denominator the moat/quality evidence says BG does not warrant.

**The ~53% high-to-low spread across base-case points ($90 SOTP → $137.5 peers) is the headline and the reason confidence is capped at 55.** Reconciling, in order of trust for *this* company:

1. **Intrinsic DCF is the most reliable here and is weighted highest (45%)** because it is the only method that normalizes the cycle to a mid-cycle margin *and* respects the post-Viterra balance sheet, and it ties out economically. Its midpoint (~$105) sits **below** the ~$123 price.
2. **SOTP (~$90 base) agrees with the DCF's low half** and is trusted for the *downside*, not the level: it independently confirms that, on through-cycle/trough-to-normalized earnings minus $13.7bn net debt, the equity is a thin slice. Where it diverges from peers, the divergence is the net-debt subtraction plus the trough-vs-normalized denominator — not a multiple dispute.
3. **Peers (~$137.5 center) is the high outlier and is trusted only on its forward-P/E leg** (which says BG is in line with ADM/Wilmar at ~13x, i.e. ~$126). Its EV/EBITDA-driven upside to $155 rests on a noisy two-stock peer median (~12–14x) at a cyclical high, and `03` itself judged the EV/EBITDA discount "largely warranted." So the *low end* of the peer range (~$126, the forward-P/E read) is the credible part; the high end is down-weighted.
4. **Reverse-DCF reconciles the apparent contradiction.** It is NOT inconsistent with the DCF/SOTP being below price: the reverse-DCF's "price is conservative-to-fair, asymmetry to upside" rests on a **forward FY26 normalized FCFF base (~$1,750M)** that already credits the biofuel-led margin recovery, whereas the intrinsic DCF (mid-cycle 3.35% margin) and SOTP (normalized-but-haircut) are more conservative on *through-cycle* margins. The honest reconciliation: **at the ~$123 price the equity is fair-to-fully-valued IF the FY26 crush/biofuel margin recovery holds mid-cycle, and modestly over-valued (DCF/SOTP base ~$90–115) IF margins retrace toward the FY25 trough.** The single swing factor between those two worlds is the crush/biofuel spread (§3, §6).

Net: the credible base-case fair value is **~$100–$115 (midpoint ~$108)**, modestly below the indicative ~$123 price. The forward lens (peers low-end ~$126, reverse-DCF) can justify the current price, but only on the assumption that the policy-driven margin recovery does not retrace — which is the bet, not a fact.

---

## 3. Bull / Base / Bear Fair-Value Levels

Levels are triangulated across the methods and tied to the operating drivers from `earnings/07_earnings-sensitivity` (the dominant variables are the **soybean/softseed crush spread** and **biofuel mandate policy**, each ~$1.0–1.5 of FY26 adjusted EPS; together >±$2, ~±23% of the ~$9.25 base) and to the warranted multiple from `business-model/07` (quality 28/100) and `09` (narrow moat, ROIC 6.7% ≤ 7.2% cost of equity). Implied multiples computed on FY26E consensus EBITDA $3,997M and FY26E adjusted EPS $9.43, bridged via net debt $13,714M + NCI $1,432M on 195.73M diluted shares.

| Case | Fair Value / Share | Implied Multiple | What Must Be True (operating drivers) |
|---|---:|---:|---|
| **Bull** | **~$135 – $145** (anchor ~$140) | ~10.6x EV/EBITDA FY26E; ~14.8x P/E FY26E adj | Biofuel mandate stays favorable AND the crush spread expands above mid-cycle (the two together = +>$2 EPS, `earnings/07` rank 1–2 tailwind). FY26 adjusted EPS prints at/above the top of the $9.00–9.50 guide and FY27 reaches the ~$10.89 consensus; Viterra synergies lift through-cycle ROIC toward the adjusted 8% (above the 7.2% cost of equity). Maps to peers' EV/EBITDA leg partially closing toward the ~12x peer median and the DCF Gordon high (~$130) — i.e. the market pays a mid-cycle-plus multiple. **Requires the policy/spread tailwind to persist, not just hold.** |
| **Base** | **~$100 – $115** (midpoint ~$108) | ~9.1x EV/EBITDA FY26E; ~11.5x P/E FY26E adj | Mid-cycle holds: adjusted EBIT margin ~3.3–3.4% (the reverse-DCF's priced-in level and the Street's FY26 implied 3.31%), FY26 adjusted EPS in the $9.00–9.50 guide, FCFF normalizes to ~$1.7–2.0bn as Viterra working-capital build unwinds. Crush/biofuel spread neither expands nor retraces. Implied EV/EBITDA (~9.1x) sits **inside BG's own forward curve (9.0–9.8x)** — no re-rating assumed. This is the weighted blend of DCF midpoint, peers' forward-P/E leg, and SOTP base. |
| **Bear** | **~$80 – $90** (anchor ~$85) | ~8.0x EV/EBITDA FY26E; ~9.0x P/E FY26E adj | Crush/biofuel spread retraces toward the FY25 trough (EBIT margin ~2.2–2.9%): biofuel mandate under-delivers (RVO retrace −$1.50 EPS, `earnings/07` §4) and/or crush compresses (−$1.06), with operating de-leverage on the $2,037M fixed base amplifying the hit and ~5.8x net-debt/EBITDA amplifying it again at the EPS line (`earnings/07` §6, downside-skewed). Maps to the DCF exit-multiple value (~$86) and the SOTP-B normalized bear-to-base ($54–90). Implied ~8.0x EV/EBITDA ≈ BG's own band floor / ADM historical trough. **The SOTP-A trough cross-check ($30 base, −$3 bear) shows the floor is lower still if a full trough recurs on the freshly-doubled debt** — flagged, not used as the central bear. |

**No probabilities are assigned to these cases — that is the master synthesizer's job.** These are fair-value levels only.

---

## 4. Margin of Safety

Sign convention: margin of safety = `(base FV − price) / base FV`; **positive = price below fair value = margin exists.** Price is indicative/web-sourced (not pool-verified), so every percentage row carries that caveat.

| Metric | Value |
|---|---:|
| Current price (indicative, web-sourced — *not pool-verified*) | $123.35 |
| Base-case fair value (midpoint) | ~$108 |
| Bear-case fair value | ~$85 |
| Upside to base case (%) | **−12.4%** (price is **above** base FV) |
| Downside to bear case (%) | **−31.1%** |
| Margin of safety = (base FV − price) / base FV | **−14.2% (NEGATIVE — no margin of safety at the indicative price)** |

**Read:** at the indicative ~$123 price there is **no margin of safety** — the price sits ~12% above the base-case fair-value midpoint and ~31% above the bear-case level. Even at the top of the base range ($115) the margin of safety is still slightly negative (−7%). A margin of safety only opens up below ~$100. **Caveat (binding):** because the price is web-sourced and not pool-verified, these percentages are **directional, not pool-grade**; per the no-price cap they would normally be marked "Not assessable," and the synthesis (`99`) should treat margin of safety as **Not assessable on pool data** while noting the indicative figure points to a negative cushion. A pool-sourced price within the corroborating ~$123–126.50 band would not change the sign.

---

## 5. Warranted-Multiple Check

The base-case fair value (~$108) implies **~9.1x FY26E EV/EBITDA and ~11.5x FY26E adjusted P/E** — multiples that sit **inside BG's own forward curve (9.0–9.8x EV/EBITDA, 12–13x P/E) and below ADM's 10.3x 10-year-median EV/EBITDA**, so the base case assumes **no re-rating** and is warranted by the business: a narrow-moat (50/100 scale, but shared with ADM/Cargill/LDC), low-quality (aggregate 28/100), sub-cost-of-capital operator (ROIC 6.7% ≤ 7.2% cost of equity) carrying ~5.8x net-debt/EBITDA does not deserve a premium multiple, and `03` already judged the EV/EBITDA discount to peers "largely warranted." **Value-trap flag:** the *bull* case (~$140, ~10.6x EV/EBITDA, ~14.8x P/E) requires a multiple **above** BG's own forward curve and approaching the cyclical-high peer level — a multiple the business has not sustained through a cycle on sub-cost-of-capital returns; reaching it depends on the policy-driven crush/biofuel spread *expanding* and holding, not merely existing. Justifying upside much beyond ~$126 (the forward-P/E-in-line level) therefore leans on a re-rating the quality/moat evidence does not support, so the upside half of the range carries genuine value-trap risk and should not be treated as a base expectation.

---

## 6. Fair-Value Read

Triangulated base-case fair value is **~$100–$115/share (midpoint ~$108)**, modestly **below** the indicative ~$123 price — so at today's (web-sourced, not pool-verified) level there is **no margin of safety** (−14% on the base midpoint, ~−31% to the ~$85 bear). The **intrinsic DCF (45% weight) drives the answer**, with SOTP (~$90) confirming the downside via the $13.7bn net-debt drag and peers' forward-P/E leg (~$126) marking the credible top of the base; the methods disagree by ~53% (the headline), which caps confidence at 55 on its own before the no-price cap is even applied. The single biggest swing factor between bull (~$140) and bear (~$85) is the **soybean/softseed crush spread and the biofuel mandate policy that drives it** — one external, policy-set, downside-skewed transmission chain with no contractual margin floor (`earnings/07` §4, §6): if the FY26 recovery holds mid-cycle the price is roughly fair, and if it retraces to the FY25 trough the equity is worth closer to the $85–90 bear-to-base — the price is not the risk, the mid-cycle margin assumption is.

---

### Self-Check
- [x] Every method's value and confidence pulled from `02`–`06`, not re-derived (02 = no point/directional; 03 = $126–155; 04 = $85–130; 05 = implied ~2.3% CAGR cross-check; 06 = $54/90/129).
- [x] Weights justified by reliability for THIS company and sum to 100% across value-producing methods (03+04+06 = 30+45+25); 02 = 0% (no value); 05 = n/a (cross-check).
- [x] Reverse-DCF used as a cross-check, not a weighted value; it reconciles the forward-vs-mid-cycle gap rather than adding a level.
- [x] Method disagreement (~53% > 40%) flagged as the headline; ties to the Gate-6 confidence cap.
- [x] Bull/base/bear are fair-value LEVELS tied to operating drivers (crush spread, biofuel policy from `earnings/07`) and the warranted multiple — **NO probabilities assigned**.
- [x] Margin of safety computed explicitly (−14.2% base; sign convention stated) and flagged not-pool-verified per the no-price cap.
- [x] Warranted-multiple check flags value-trap risk on the bull case (multiple above BG's own curve on sub-cost-of-capital returns).
- [x] Boundary respected: no probabilities, no probability-weighted target, no risk/reward, no rating, no position sizing.
- [x] No banned phrases (discounts/premiums quantified vs a stated fair value or multiple; warranted-vs-observed test applied).
