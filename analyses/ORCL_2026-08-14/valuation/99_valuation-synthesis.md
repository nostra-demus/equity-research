# Valuation Module — ORCL (Synthesis)

## Abstract

Oracle screens modestly overvalued: the triangulated base-case fair value is $133.77 a share, about 13% below the $153.94 price, so the margin of safety is negative — a cushion of roughly zero, not a small one. Bull, base and headline-bear levels of $212.67, $133.77 and $31.44 (a 24–36 month structural-reset bear, next to a milder $94.62 twelve-month cyclical trough) are anchored on own-history and peer multiples, with the intrinsic DCF corroborating caution. The reverse-DCF shows today's price already assumes a 51% FY2027 revenue beat against management's own 33.6% guide and a 62% terminal margin no peer has ever reached — aggressive, bordering on unachievable. The real downside anchor is the structural bear case, a 79.6% fall, tied to Oracle's 4.46x net-debt-to-EBITDA leverage and an eroding return on capital funding a concentrated AI-infrastructure bet. Net: fairly-to-modestly rich, not a bargain.

## 1. Valuation Verdict

- **Verdict:** Modestly overvalued
- **Base-case fair value (point, per share):** $133.77
- **Current price:** $153.94 (Aug-13-2026, 02:26 PM GMT-5, delayed NYSE quote, Capital IQ pool export; price-state `pool-verified`, 1 trading day old)
- **Bull / Base / Bear fair-value levels (points):** Bull $212.67 (+38.2% vs price) / Base $133.77 (−13.1% vs price) / Bear-cyclical $94.62 (12-month trough, −38.5% vs price) / Bear-structural (headline) $31.44 (24–36 month reset, −79.6% vs price)
- **Cross-method dispersion (football field, low–high):** $68.92 (intrinsic DCF, Gordon terminal) to $212.01 (raw SOTP peer-parity ceiling) — a 207.7% high-to-low spread; the three weighted methods alone span $68.92–$151.27
- Valuation attractiveness /100 (higher = cheaper): **25** — base fair value sits below price; no discount to unlock
- Margin of safety /100 (higher = better): **15** — margin of safety is **−15.08%** (negative; price trades above base-case fair value, so there is no cushion)
- Valuation confidence /100: **55** — capped at 60 by the terminal-value dominance rule (DCF terminal value = 80.7% of EV, MODULE_RULES Score-Cap row); set below the cap given the 208% cross-method spread
- Downside risk /100 (higher = worse, inverted): **85** — downside-to-bear (headline, structural) is **79.58%**; even the milder 12-month cyclical-trough bear implies 38.5%
- Data quality /100: **90** — full filings, consensus (41 analysts), a 10-name peer comp set, and complete capital-structure data; `00_valuation-data-triage.md` verdicts "Sufficient," no critical gaps
- Overall usefulness /100: **85**
- Dominant valuation method (one line): own-history (`02`) and peer (`03`) multiples anchor the base (80% combined weight, per the multiples-first policy), with intrinsic DCF (`04`, 20%) trusted as a genuine corroborating cross-check rather than an outlier — three independent lenses (DCF, reverse-DCF, and the business-model module's eroding-moat finding) converge on the same caution
- What's priced in (one line): a 51.3% FY2027 revenue beat against management's own +33.6% guide, a 22.6% revenue CAGR through FY2034, and a 61.9% terminal EBIT margin with no peer precedent (best peer: Microsoft 46.8%) — aggressive, bordering on unachievable
- Biggest valuation risk (one line): Oracle carries net debt/EBITDA of 4.46x and generated −$23.7bn of free cash flow in FY26 funding a concentrated, four-mega-customer AI-infrastructure bet; if that RPO backlog ($638bn, +363% YoY) fails to convert to margin-protected cash on schedule, both the DCF and the structural-reset bear case say the downside is severe, not shallow

## 1A. Module Disconfirmation

- **Strongest bear point:** the reverse-DCF (`05`) shows today's price requires expectations with no historical or peer precedent — a 51.3% FY2027 revenue beat vs. management's own just-issued +33.6% guide, and a 61.9% terminal EBIT margin (best peer, Microsoft, is 46.8%) — while the intrinsic DCF's own base case (`04`) sits 55.2% below price and the business-model module independently verdicts the moat "eroding" (ROIC 12.35%→8.22% over four years, now at/below the ~11.2% estimated WACC).
- **Strongest bull point (steelman):** the two methods actually anchored on what the market pays — own-history (`02`, $151.27) and peer multiples (`03`, $148.70) — land within 2 points of each other and close to today's price, despite being built from entirely independent data; Oracle's PEG ratio (0.65) is roughly half the peer median (1.31), and the raw SOTP peer-parity ceiling ($212.01) shows real optionality if the $638bn RPO backlog converts to cash the way management projects.
- **Single killer risk specific to the fair-value read:** AI-infrastructure customer concentration — `earnings/07_earnings-sensitivity.md` ranks this the #1 sensitivity, with a modeled downside of −$6,937M EBITDA (23% of FY26 EBITDA) if one of the four >$8bn named customers pulls back, and "no disclosed upside mirror of comparable size." This single variable is the fulcrum between the $212.67 bull and the $31.44–$94.62 bear range.
- **Disconfirming evidence already visible:** `05`'s independent market-ceiling check converts the price-implied FY2030 revenue into an implied global cloud-infrastructure market share of ≈14–17% (vs. ≈3% today) — a 5–6x share gain in four years that no hyperscaler (AWS, Azure) has ever achieved this fast. This is a second, independent kill signal pointing the same direction as the terminal-margin finding, not a reason to soften the read.

## 2. Specialist Roll-Up

| Specialist | Verdict Line | Biggest Finding |
|---|---|---|
| valuation-data-triage | Sufficient — all five methods can run, no critical gaps | FY26 reported FCF is negative (−$23.7bn) on an AI-capex surge and Cloud & Software is 90.7% of segment profit (single-segment collapse) — both flagged for downstream handling, not data gaps |
| price-and-capital-structure | Price-state `pool-verified`, $153.94, 1 day old | EV $584,464.2M (lease-inclusive); net debt (strict) $136,143M; tangible book value is **negative** (−$9.70/share) on $65.5bn of goodwill/intangibles |
| multiples-own-history | Oracle trades close to its own 5-year median on EV-based multiples (17–32nd percentile), not a statistical extreme | Own-median EV/EBIT reversion implies ~$151.27/share — essentially flat to price — but that "in line with history" read sits on top of net debt that rose 38.7% YoY |
| relative-valuation-peers | Neither clearly cheap nor expensive — the answer flips depending on which peer slice is used | Quality-adjusted base case (leverage- and moat-adjusted 11.5x NTM EV/EBITDA) is $148.70/share (−3.4%); raw peer-median dispersion runs $118.10–$191.75 |
| intrinsic-dcf | Base-case intrinsic value $68.92/share, 55.2% below price; terminal value is 80.7% of EV (terminal-dominated, low-confidence) | The financeable-growth cross-check FAILED on the first pass and had to correct terminal capex to 19.1% of revenue (not simply = D&A) to sustain 3.5% terminal growth |
| reverse-dcf | Price implies a 22.6% revenue CAGR through FY2034 and a 61.9% terminal EBIT margin — "aggressive, bordering on unachievable" | Even the model's theoretical best case (zero net reinvestment forever) falls $92.3bn short of today's $584.5bn EV target |
| sum-of-the-parts | Single-segment collapse (Cloud & Software = 90.7% of profit) — no hidden breakup value; raw base case $212.01/share is a "peer-parity ceiling, not a base fair value" | Applying Oracle's own current 11.65x multiple to the identical EBITDA base reproduces today's price almost exactly — the market's multiple already reflects the leverage/FCF-quality gap vs MSFT/SAP |
| scenario-and-fair-value | Base-case fair value $133.77/share (−13.1% vs price); headline bear is the 24–36-month structural reset at $31.44 | The 208% high-to-low football field is corroborated, not contradicted, by the reverse-DCF's independent finding that price already assumes precedent-free growth and margin |

## 3. Reconciliation

The high-to-low spread across methods is **207.7%** ($68.92 DCF to $212.01 raw SOTP), well above the 40% Reconciliation-Gate tolerance — this spread is the single biggest finding of this module and is led with, not averaged away. Two clusters exist: (1) the multiples methods — own-history ($151.27) and peers ($148.70) — land within 2 points of each other despite independent data sources, and both sit close to today's price; (2) the DCF ($68.92) sits 119.5% below that cluster. `07_scenario-and-fair-value.md` does not treat the DCF's low reading as a stray outlier to discount to zero: it is corroborated by two other independent lenses in the same run — the reverse-DCF's finding that price already requires precedent-free growth and margin assumptions, and the business-model module's independently-derived "eroding" moat verdict (return on capital below cost of capital for four straight years). Because three independent methods point the same direction, the DCF is weighted at 20% (not zero, not equal-weighted to the multiples methods) per the multiples-first policy, pulling the blended base ($133.77) below both multiples methods individually — a disclosed, reasoned departure from a pure 02/03 average (~$150.0), not a silent drag. The raw SOTP ($212.01) is excluded from the blend entirely because `06` itself states its base case is a "peer-parity ceiling," not a base fair value, since it implicitly prices Oracle's leverage (net debt/EBITDA 4.46x) as if it were MSFT's (0.6x) or SAP's (0.8x). **Trust ranking for this company: own-history and peer multiples for the central tendency; DCF and reverse-DCF as the disciplining cross-check on whether that central tendency is achievable; raw SOTP as an optimistic ceiling only.**

## 4. Score Cap Application

| Cap Trigger | Applied? (Y/N) | Affected Score | Final Cap |
|---|---|---|---|
| No pool-verified price (price-state `indicative` or `none`) | N — price is `pool-verified`, 1 trading day old | — | Not applicable |
| No consensus / forward estimates | N — 41-analyst consensus present | — | Not applicable |
| No peer data | N — 10-name Capital IQ comp set present | — | Not applicable |
| Only one valuation method usable | N — five methods ran (02, 03, 04, 05, 06) | — | Not applicable |
| No cash flow AND DCF is only method | N — cash flow statement present; multiples also run | — | Not applicable |
| SOTP not possible for multi-segment | N — SOTP ran and collapsed to single-segment per its own data-driven finding, not a missing-data block | — | Not applicable |
| Methods disagree >40% unreconciled | N — spread is 207.7% but `07` explicitly reconciled it (three-lens corroboration for the DCF's low reading, §3 above); not a silent average | — | Not applicable |
| Terminal value >75% of DCF EV | **Y** — DCF terminal value is 80.7% of EV (`04` §5a) | Valuation confidence | **Max 60** (set at 55, below the cap, given the added 207.7% cross-method spread) |
| Misaligned controlling owner (RF-OWN-004) | N — founder Larry Ellison (40.21% of vote) is an engaged, value-aligned Executive Chair/CTO, not a value-indifferent controller; `management-governance/99` finding 04-008 confirms the filter does not trip | — | Not applicable |

## 5. Fair-Value Summary

The bull ($212.67), base ($133.77), and headline-bear ($31.44) levels are driven by two different logics: bull and base are built off own-history and peer NTM/FY2027 EV/EBITDA multiples (14.0x expanding case, ~10.63x implied base), while the headline bear is a declining-perpetuity DCF reset (terminal margin 22.0%, below Oracle's own FY23 trough, terminal ROIC 7.0%, below WACC) rather than a metric-times-multiple construction — the correct method for an operating-company permanent-impairment scenario. The current $153.94 price implies, per the reverse-DCF, a 51.3% FY2027 revenue beat against management's own freshly-issued +33.6% guide and a 61.9% terminal EBIT margin with no peer precedent; earnings-module evidence does not support this — Oracle's own 4-year revenue CAGR is 12.2%, and the #1 named earnings sensitivity (AI-customer concentration) points toward downside, not upside, of comparable size. The margin of safety is **−15.08%** (price sits above, not below, base-case fair value — no cushion), a separate and distinct read from the downside-to-bear, which is **79.58%** to the headline structural-reset case (or 38.54% to the milder 12-month cyclical trough). This is not a classic value-trap setup — no misaligned controlling owner, and the moat is genuinely eroding rather than being unfairly discounted — but the mirror image of one: the stock is priced for the optimistic scenario (RPO backlog converting cleanly to margin-protected cash) while carrying leverage (net debt/EBITDA 4.46x) and cash-flow evidence (−$23.7bn FY26 FCF) that argue for caution, not a premium.

## 6. What Would Change The Valuation Verdict?

| Current Verdict | What Would Make It Cheaper | What Would Make It More Expensive | Data Needed |
|---|---|---|---|
| Modestly overvalued | Price falls toward or below $133.77 (base FV) without a fair-value deterioration; OR the FY2027 print lands at or above the guided +33.6% with gross margin recovering per management's "improves rapidly" claim, which would lift the multiples-methods base and narrow the DCF-vs-multiples gap | The stock re-rates further above $153.94 on continued AI-infrastructure enthusiasm with no confirming margin/cash-flow evidence; OR one of the four >$8bn named customers cuts contracted RPO (the #1 named earnings sensitivity), pulling the multiples-methods base down toward the DCF's $68.92 | The FY2027 actual print (revenue growth and gross margin, due within the fiscal year ending May-2027) — the single nearest-term, most falsifiable test of what today's price already assumes; a historical peer-premium/discount panel (currently "Not assessable" per `03` §3) would sharpen whether the relative-valuation read is typical or unusual |

## 7. Note To The Final Synthesizer

- Bull/base/bear fair-value levels: **$212.67 / $133.77 / $31.44** (headline, 24–36mo structural reset) — a milder 12-month cyclical-trough bear also exists at **$94.62**, kept as a separate, fully-computed case (not merged into the headline). Dominant method: own-history + peer multiples (80% combined weight) for the central tendency, with intrinsic DCF (20%) disciplining it downward on corroborated, not cherry-picked, grounds.
- What the price implies (from reverse-DCF): a 51.3% FY2027 revenue beat vs. management's own +33.6% guide, a 22.6% revenue CAGR through FY2034, and a 61.9% terminal EBIT margin with no peer precedent — earnings-module evidence (12.2% historical 4-year CAGR; AI-customer concentration as the #1 downside sensitivity) does not support this being achievable.
- Margin of safety is **−15.08%** (no cushion — price above base fair value) and downside-to-bear is **79.58%** (headline structural) / **38.54%** (cyclical-trough context) — these are two distinct numbers, not one collapsed metric.
- This is genuine caution, not a value trap: no misaligned controlling owner trips (§24 Filter 6 does not apply — Ellison is engaged and value-aligned), and the moat is independently verdicted "eroding" by the business-model module (ROIC below WACC, 4 straight years), so the warranted multiple is not a premium one — the current price is closer to requiring a re-rating the fundamentals have not yet earned than to reflecting an unfair discount.
- Trust own-history (`02`) and peer (`03`) multiples for the central tendency on this company; trust the DCF (`04`) and reverse-DCF (`05`) as the disciplining cross-check on achievability, not as a stray low outlier; discount the raw SOTP (`06`, $212.01) to a ceiling reference only — it prices Oracle's balance sheet as if it were MSFT's or SAP's, which it is not.
- No partial-data cap applied for missing price/consensus/peers — data is complete. The one cap that DID apply: terminal value is 80.7% of DCF EV, capping valuation confidence at 60 (set at 55 here, reflecting the added 207.7% cross-method dispersion).
- Biggest missing data point (single highest-value next request): a multi-year historical peer-premium/discount panel for the CIQ comp set — `03` could only source a single-date (2026-08-13) snapshot, so whether ORCL's current premium/discount to peers is typical or unusual for THIS stock cannot be assessed; this would sharpen the relative-valuation read materially.
- **Explicit handoff:** the master synthesizer's "Valuation and Peer Mispricing" section should defer to this synthesis. The bull/base/bear fair-value LEVELS here ($212.67 / $133.77 / $31.44, plus the $94.62 cyclical-trough context case) are the inputs for the master's probability-weighted scenario model — this module assigns no probabilities.

## 8. Simple Summary

- Oracle is **modestly overvalued**, not cheap: base fair value is $133.77 against a $153.94 price, about 13% rich.
- Bull / base / bear levels: **$212.67 / $133.77 / $31.44** (headline structural-reset bear, 24–36 months out); a milder 12-month cyclical-trough bear sits at $94.62.
- The market is pricing in a 51% beat of Oracle's own just-issued FY2027 growth guidance and a profit margin no software peer has ever reached — an aggressive, largely unproven bet.
- The real downside is severe if that bet fails: **79.6%** to the structural-reset bear case, tied to Oracle's heavy debt load (4.46x net debt/EBITDA) and negative free cash flow (−$23.7bn in FY26) funding a concentrated AI-infrastructure build.
- Own-history and peer trading multiples matter most for this stock — they anchor the fair-value estimate; the discounted-cash-flow model is the disciplining cross-check, not the headline.
- This is not a classic value trap (no misaligned controlling owner) — it is closer to the opposite: the stock is priced for a best-case outcome while its own moat is independently found to be eroding.
- A current, verified price was available throughout — no data gap on that front; the module's data quality is high (90/100).
- This module is highly useful for the master synthesizer: it delivers concrete, reconciled fair-value levels, a clear "what's priced in" read, and a named killer risk (AI-customer concentration) that ties the bull and bear cases together.
