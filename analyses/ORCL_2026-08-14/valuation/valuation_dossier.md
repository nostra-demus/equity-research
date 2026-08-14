# valuation Module Dossier — ORCL

> Deterministic, lossless concatenation of every artifact in this module — the module synthesis and every specialist output, in order. Generated mechanically (no LLM rewriting), so nothing is omitted or paraphrased. This is the module's "see everything" tier; the module's decision lives in `99_*-synthesis.md` and the short read in `valuation_memo.md`.

- Generated: 2026-08-14T10:40:04Z
- Module folder: `valuation`
- Contents: 1 module synthesis + 8 specialist outputs = 9 files

## Table of Contents

- [valuation — module synthesis](#valuation-module-synthesis) — `99_valuation-synthesis.md`
- [valuation / 00_valuation-data-triage.md](#valuation-00-valuation-data-triage-md) — `00_valuation-data-triage.md`
- [valuation / 01_price-and-capital-structure.md](#valuation-01-price-and-capital-structure-md) — `01_price-and-capital-structure.md`
- [valuation / 02_multiples-own-history.md](#valuation-02-multiples-own-history-md) — `02_multiples-own-history.md`
- [valuation / 03_relative-valuation-peers.md](#valuation-03-relative-valuation-peers-md) — `03_relative-valuation-peers.md`
- [valuation / 04_intrinsic-dcf.md](#valuation-04-intrinsic-dcf-md) — `04_intrinsic-dcf.md`
- [valuation / 05_reverse-dcf.md](#valuation-05-reverse-dcf-md) — `05_reverse-dcf.md`
- [valuation / 06_sum-of-the-parts.md](#valuation-06-sum-of-the-parts-md) — `06_sum-of-the-parts.md`
- [valuation / 07_scenario-and-fair-value.md](#valuation-07-scenario-and-fair-value-md) — `07_scenario-and-fair-value.md`


---

## valuation — module synthesis

_Source: `99_valuation-synthesis.md`_

# Valuation Module — ORCL (Synthesis)

**Cross-module refresh note (2026-08-14).** This synthesis was refreshed after `business-model`, `earnings`, and `management-governance` were re-run upstream. The trigger was newly-itemized FY25 DEF 14A related-party and share-pledging disclosure (Ellison-linked aircraft charter, a SailGP sponsorship, family-employee compensation — ~0.02% of revenue in total — and confirmation that 29.9% of Ellison's own stake, ~12.0% of total shares outstanding, is pledged against personal loans, quarterly-monitored, not margin/hedging). This moved `business-model`'s Capital Allocation & Governance score 42→41/100 and `management-governance`'s Confidence Score 60→57 (Confidence-Adjusted Governance Score 28→27); the Governance Score (47, Weak), the "Misaligned or weak stewardship" verdict, and the §24 Filter 6 (RF-OWN-004, structurally unaligned controlling owner) non-trip determination are all unchanged — `management-governance/99` finding 04-008 still reads "Not Applicable," confirming Ellison remains an engaged, value-aligned founder-operator, not a value-indifferent controller. None of this is new balance-sheet, cash-flow, or valuation-relevant financial data; it is governance/ownership texture about the controlling insider. Every one of this module's own specialists (`00` through `07`) is unchanged and was reused as-is — no fair-value level, method weight, or score below has moved from the prior run. See Section 4 and Section 7 for where the refresh was checked against this module's caps.

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
- **Disconfirming evidence already visible:** `05`'s independent market-ceiling check converts the price-implied FY2030 revenue into an implied global cloud-infrastructure market share of ≈14–17% (vs. ≈3% today) — a 5–6x share gain in four years that no hyperscaler (AWS, Azure) has ever achieved this fast. This is a second, independent kill signal pointing the same direction as the terminal-margin finding, not a reason to soften the read. The refreshed governance texture (Ellison's 29.9%-of-holding pledge, sub-threshold related-party dealings) does not add new disconfirming valuation evidence — it was already disclosed and independently reviewed — but see Section 7 for why it still belongs in the master synthesizer's risk read.

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
| Misaligned controlling owner (RF-OWN-004) | N — re-checked against the refreshed `management-governance/99` finding 04-008 (unchanged: "Not Applicable"). Founder Larry Ellison (40.21% of vote) remains an engaged, value-aligned Executive Chair/CTO, not a value-indifferent controller, even after the newly-itemized FY25 DEF 14A related-party detail and confirmation of his 29.9%-of-holding pledge — both sub-threshold (pledge below the 50% hard-disqualifier line; RPT ~0.02% of revenue) and independently reviewed/price-protected | — | Not applicable |

## 5. Fair-Value Summary

The bull ($212.67), base ($133.77), and headline-bear ($31.44) levels are driven by two different logics: bull and base are built off own-history and peer NTM/FY2027 EV/EBITDA multiples (14.0x expanding case, ~10.63x implied base), while the headline bear is a declining-perpetuity DCF reset (terminal margin 22.0%, below Oracle's own FY23 trough, terminal ROIC 7.0%, below WACC) rather than a metric-times-multiple construction — the correct method for an operating-company permanent-impairment scenario. The current $153.94 price implies, per the reverse-DCF, a 51.3% FY2027 revenue beat against management's own freshly-issued +33.6% guide and a 61.9% terminal EBIT margin with no peer precedent; earnings-module evidence does not support this — Oracle's own 4-year revenue CAGR is 12.2%, and the #1 named earnings sensitivity (AI-customer concentration) points toward downside, not upside, of comparable size. The margin of safety is **−15.08%** (price sits above, not below, base-case fair value — no cushion), a separate and distinct read from the downside-to-bear, which is **79.58%** to the headline structural-reset case (or 38.54% to the milder 12-month cyclical trough). This is not a classic value-trap setup — no misaligned controlling owner (re-verified this run against the refreshed governance detail, still no trip), and the moat is genuinely eroding rather than being unfairly discounted — but the mirror image of one: the stock is priced for the optimistic scenario (RPO backlog converting cleanly to margin-protected cash) while carrying leverage (net debt/EBITDA 4.46x) and cash-flow evidence (−$23.7bn FY26 FCF) that argue for caution, not a premium.

## 6. What Would Change The Valuation Verdict?

| Current Verdict | What Would Make It Cheaper | What Would Make It More Expensive | Data Needed |
|---|---|---|---|
| Modestly overvalued | Price falls toward or below $133.77 (base FV) without a fair-value deterioration; OR the FY2027 print lands at or above the guided +33.6% with gross margin recovering per management's "improves rapidly" claim, which would lift the multiples-methods base and narrow the DCF-vs-multiples gap | The stock re-rates further above $153.94 on continued AI-infrastructure enthusiasm with no confirming margin/cash-flow evidence; OR one of the four >$8bn named customers cuts contracted RPO (the #1 named earnings sensitivity), pulling the multiples-methods base down toward the DCF's $68.92 | The FY2027 actual print (revenue growth and gross margin, due within the fiscal year ending May-2027) — the single nearest-term, most falsifiable test of what today's price already assumes; a historical peer-premium/discount panel (currently "Not assessable" per `03` §3) would sharpen whether the relative-valuation read is typical or unusual |

## 7. Note To The Final Synthesizer

- Bull/base/bear fair-value levels: **$212.67 / $133.77 / $31.44** (headline, 24–36mo structural reset) — a milder 12-month cyclical-trough bear also exists at **$94.62**, kept as a separate, fully-computed case (not merged into the headline). Dominant method: own-history + peer multiples (80% combined weight) for the central tendency, with intrinsic DCF (20%) disciplining it downward on corroborated, not cherry-picked, grounds.
- What the price implies (from reverse-DCF): a 51.3% FY2027 revenue beat vs. management's own +33.6% guide, a 22.6% revenue CAGR through FY2034, and a 61.9% terminal EBIT margin with no peer precedent — earnings-module evidence (12.2% historical 4-year CAGR; AI-customer concentration as the #1 downside sensitivity) does not support this being achievable.
- Margin of safety is **−15.08%** (no cushion — price above base fair value) and downside-to-bear is **79.58%** (headline structural) / **38.54%** (cyclical-trough context) — these are two distinct numbers, not one collapsed metric.
- This is genuine caution, not a value trap: no misaligned controlling owner trips (§24 Filter 6 does not apply — Ellison is engaged and value-aligned, re-confirmed this run against the refreshed FY25 DEF 14A detail below), and the moat is independently verdicted "eroding" by the business-model module (ROIC below WACC, 4 straight years), so the warranted multiple is not a premium one — the current price is closer to requiring a re-rating the fundamentals have not yet earned than to reflecting an unfair discount.
- **Governance refresh, this run (no valuation-number impact):** upstream modules re-ran with newly-itemized FY25 DEF 14A texture — Ellison-linked related-party dealings (aircraft charter, SailGP sponsorship, family-employee compensation, ~0.02% of revenue, independently reviewed and price-protected) and confirmation that 29.9% of Ellison's own stake (~12.0% of total shares outstanding) is pledged, quarterly-monitored, not margin/hedging. This moved `business-model`'s Capital Allocation & Governance score 42→41 and `management-governance`'s Confidence Score 60→57 (Confidence-Adjusted Governance Score 28→27), but changed no valuation-relevant financial data, no fair-value level, and did not trip §24 Filter 6. The one place this belongs in the master's risk read, not the fair-value read: a pledge against ~12% of shares outstanding is a latent forced-selling risk if the stock falls sharply and triggers a margin call — a tail amplifier on the downside-to-bear case above, not a change to the bear-case level itself.
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
- This is not a classic value trap (no misaligned controlling owner, re-checked this run) — it is closer to the opposite: the stock is priced for a best-case outcome while its own moat is independently found to be eroding.
- A current, verified price was available throughout — no data gap on that front; the module's data quality is high (90/100).
- Upstream governance texture was refreshed (Ellison-linked related-party dealings and a confirmed 29.9%-of-holding share pledge) — it moved two upstream module scores by a point or two but changed nothing in this module's fair-value math; this module is highly useful for the master synthesizer regardless, delivering concrete, reconciled fair-value levels, a clear "what's priced in" read, and a named killer risk (AI-customer concentration) that ties the bull and bear cases together.



---

## valuation / 00_valuation-data-triage.md

_Source: `00_valuation-data-triage.md`_

# Valuation Data Triage — ORCL

## 1. File Inventory

| Filename | Type | Period Covered | Last Modified | Valuation Relevance |
|---|---|---|---|---|
| Oracle_Corporation_-_Form_10-K(Jun-22-2026).doc | Annual filing (10-K) | FY2026, ended May-31-2026 (filed Jun-22-2026) | 2026-08-13 (sync date, not filing date) | High |
| Oracle_Corporation_-_Form_10-Q(Mar-11-2026).doc | Quarterly filing (10-Q) | Q3 FY2026, ended Feb-28-2026 (filed Mar-11-2026) | 2026-08-13 (sync date) | High |
| Oracle_Earnings Press Release Q4FY26.pdf | Quarterly / annual results press release | Q4 & FY2026, ended May-31-2026 (issued Jun-10-2026) | 2026-08-13 (sync date) | High |
| Oracle_Latest_Earnings_Presentation-Slides-Q4-26.pdf | Investor deck | Q4 FY2026 (Jun-10-2026) | 2026-08-13 (sync date) | Medium |
| Oracle Corporation, Q3 2026 Earnings Call, Mar 10, 2026.rtf | Transcript | Q3 FY2026 (Mar-10-2026) | 2026-08-13 (sync date) | Medium |
| Oracle Corporation, Q4 2026 Earnings Call, Jun 10, 2026.rtf | Transcript | Q4 FY2026 (Jun-10-2026) | 2026-08-13 (sync date) | Medium |
| **Company Comparable Analysis Oracle Corporation.xls** — tab: Financial Data | Peer/comps export | LTM as of 2026-08-13 | 2026-08-13 | High |
| — tab: Trading Multiples | Peer/comps export (multiples) | As-of 2026-08-13 | 2026-08-13 | High |
| — tab: Operating Statistics | Peer/comps export | As-of 2026-08-13 | 2026-08-13 | Medium |
| — tab: Business Description | Peer/comps export (qualitative) | As-of 2026-08-13 | 2026-08-13 | Low |
| — tab: Implied Valuation | Peer/comps export (implied valuation) | As-of 2026-08-13 | 2026-08-13 | High |
| — tab: Valuation Chart | Peer/comps export (chart data) | As-of 2026-08-13 | 2026-08-13 | Low |
| — tab: Credit Health Panel | Capital-structure / credit data | As-of 2026-08-13 | 2026-08-13 | Medium |
| — tab: Disclaimer | Boilerplate | — | 2026-08-13 | Low |
| **ORCL_Charting Excel Export - Aug 13th 2026 4_48_01 pm.xls** — tab: Pane 1 | Current price / price-history export | Daily price series through 2026-08-13 | 2026-08-13 | High |
| — tab: Raw | Empty (0×0) | — | 2026-08-13 | Low |
| — tab: Attributions | Boilerplate | — | 2026-08-13 | Low |
| **Oracle Corporation NYSE ORCL Credit Health Panel.xls** — tab: Summary | Capital-structure / credit data | Latest FY/quarter, as-of 2026-08-13 | 2026-08-14 | Medium |
| — tab: Financials | Capital-structure data | FY2017–FY2026 | 2026-08-14 | Medium |
| — tab: Operational Metrics Charts | Credit/liquidity chart data | Recent quarters | 2026-08-14 | Low |
| — tab: Solvency Metrics Charts | Credit/solvency chart data | Recent quarters | 2026-08-14 | Low |
| — tab: Liquidity Metrics Charts | Credit/liquidity chart data | Recent quarters | 2026-08-14 | Low |
| — tab: Disclaimer | Boilerplate | — | 2026-08-14 | Low |
| Oracle Corporation NYSE ORCL Customers.rtf | Business context (customers) | Undated / as-of pull | 2026-08-14 | Low |
| **Oracle Corporation NYSE ORCL Events Calendar.xls** — tab: Events Calendar | Catalyst / events data | Through FY2027 (earnings dates) | 2026-08-13 | Low |
| **Oracle Corporation NYSE ORCL Financials_Annual.xls** — tab: Key Stats | Income-statement summary | FY2017–FY2026 (+ consensus FY2027) | 2026-08-13 | High |
| — tab: Income Statement | Income statement | FY2017–FY2026 | 2026-08-13 | High |
| — tab: Balance Sheet | Capital-structure / balance sheet | FY2017–FY2026 | 2026-08-13 | High |
| — tab: Cash Flow | Cash flow data | FY2017–FY2026 | 2026-08-13 | High |
| — tab: Multiples | Own-history multiples export | FY2017–FY2026 | 2026-08-13 | High |
| — tab: Historical Capitalization | Capital-structure data | FY2017–FY2026 | 2026-08-13 | Medium |
| — tab: Capital Structure Summary | Capital-structure data (debt/equity/net debt) | FY2017–FY2026 | 2026-08-13 | High |
| — tab: Capital Structure Details | Capital-structure data (debt instruments) | FY2017–FY2026 | 2026-08-13 | Medium |
| — tab: Ratios | Financial ratios | FY2017–FY2026 | 2026-08-13 | Medium |
| — tab: Supplemental | Supplemental financial data | FY2017–FY2026 | 2026-08-13 | Low |
| — tab: Industry Specific | Sector KPI data | FY2017–FY2026 | 2026-08-13 | Low |
| — tab: Pension OPEB | Pension/OPEB data | FY2017–FY2026 | 2026-08-13 | Low |
| — tab: Segments | Segment data (annual) | FY2017–FY2026 | 2026-08-13 | High |
| **Oracle Corporation NYSE ORCL Financials_Quarterly.xls** — tab: Key Stats | Income-statement summary | Quarterly, through Q4 FY2026 (May-31-2026) | 2026-08-13 | High |
| — tab: Income Statement | Income statement | Quarterly through Q4 FY2026 | 2026-08-13 | High |
| — tab: Balance Sheet | Capital-structure / balance sheet | Quarterly through Q4 FY2026 | 2026-08-13 | High |
| — tab: Cash Flow | Cash flow data | Quarterly through Q4 FY2026 | 2026-08-13 | High |
| — tab: Multiples | Own-history multiples export | Quarterly through Q4 FY2026 | 2026-08-13 | High |
| — tab: Historical Capitalization | Capital-structure data | Quarterly through Q4 FY2026 | 2026-08-13 | Medium |
| — tab: Capital Structure Summary | Capital-structure data | Quarterly through Q4 FY2026 | 2026-08-13 | High |
| — tab: Capital Structure Details | Capital-structure data | Quarterly through Q4 FY2026 | 2026-08-13 | Medium |
| — tab: Ratios | Financial ratios | Quarterly through Q4 FY2026 | 2026-08-13 | Medium |
| — tab: Supplemental | Supplemental data | Quarterly through Q4 FY2026 | 2026-08-13 | Low |
| — tab: Industry Specific | Sector KPI data | Quarterly through Q4 FY2026 | 2026-08-13 | Low |
| — tab: Pension OPEB | Pension/OPEB data | Quarterly through Q4 FY2026 | 2026-08-13 | Low |
| — tab: Segments | Segment data (quarterly) | Quarterly through Q4 FY2026 | 2026-08-13 | High |
| **Oracle Corporation NYSE ORCL Key Developments.xls** — tab: Key Developments | Catalyst / news log | Multi-year, through Aug-2026 | 2026-08-13 | Low |
| Oracle Corporation NYSE ORCL Public Company Profile.rtf | Current price + capital structure snapshot | Delayed quote, Aug-13-2026 02:26 PM (GMT-5) | 2026-08-14 | High |
| **Oracle Corporation NYSE ORCL Public Ownership History.xls** — tab: History | Ownership/holdings history | Multi-year | 2026-08-14 | Low |
| **Oracle Corporation NYSE ORCL Public Ownership Insider Trading.xls** — tab: Insider Trading | Insider trading log | Multi-year, through Aug-2026 | 2026-08-13 | Low |
| Oracle Corporation NYSE ORCL Public Ownership Summary.rtf | Ownership summary | As-of Aug-2026 | 2026-08-14 | Low |
| Oracle Corporation NYSE ORCL Suppliers.rtf | Business context (suppliers) | Undated / as-of pull | 2026-08-14 | Low |
| **OracleCorporationNYSEORCLEstimatesReport.xls** — tab: Consensus | Consensus / estimate export | FY1999–FY2036 estimates; NTM as of Aug-2026 | 2026-08-13 | High |
| — tab: Recent Changes | Estimate revisions | Recent (2026) | 2026-08-13 | Medium |
| — tab: Guidance | Company guidance data | FY2026–FY2027 | 2026-08-13 | High |
| — tab: Multiples | Consensus-based forward multiples | NTM/FY as of Aug-2026 | 2026-08-13 | High |
| — tab: Surprise | Earnings-surprise history | Multi-quarter history | 2026-08-13 | Low |
| — tab: Trends | Estimate trend data | Multi-quarter | 2026-08-13 | Low |
| — tab: Revisions | Estimate revision history | Multi-quarter | 2026-08-13 | Low |
| **Oracle_Short_Interest_Charting Excel Export Aug-13-2026 10_07 AM.xls** — tab: Chart 1 with Data | Short-interest data | Through Aug-13-2026 | 2026-08-13 | Low |
| — tab: Attributions | Boilerplate | — | 2026-08-13 | Low |

Note on "Last Modified": these are Drive-sync timestamps (fix F23), not filing dates. Every period-covered value above was read from inside the document (filing cover page, "as of" line, or fiscal-period column headers), not inferred from file metadata.

## 1A. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country / exchange | United States / NYSE | `Public Company Profile.rtf`: "Ticker: ORCL (NYSE)"; 10-K cover page |
| Filing regime (US SEC / India SEBI-LODR / UK / Other) | US SEC | 10-K and 10-Q are native SEC forms; "incorporated in the state of Delaware" [FY26 10-K, p.~207] |
| Reporting standard (US GAAP / IFRS / Ind AS) | US GAAP | `OracleCorporationNYSEORCLEstimatesReport.xls`, Consensus tab: "Acctg. Standard: US GAAP" |
| Reporting currency (and scale) | USD, reported in millions | `Financials_Annual.xls`, Key Stats tab: "Currency: USD"; all CIQ exports state "In Millions of the reported currency" |
| Fiscal-year end | May 31 | `Financials_Annual.xls`: "12 months May-31-2026A"; 10-K: "fiscal year ended May 31, 2026" |
| Document language(s) | English | All filings, transcripts, and CIQ exports are in English |

No local-equivalent substitution issue arises — ORCL is a domestic US SEC filer (Delaware-incorporated, NYSE-listed, headquartered Austin, TX), so the standard 10-K/10-Q/8-K/DEF 14A document map applies directly.

## 2. Most Recent Sources

| Source Type | Filename | Period / As-of | Age (months) |
|---|---|---|---|
| Annual filing | Oracle_Corporation_-_Form_10-K(Jun-22-2026).doc | FY2026, ended May-31-2026 (filed Jun-22-2026) | ~2.4 months (period end to run date) / ~1.9 months since filing |
| Quarterly filing | Oracle_Corporation_-_Form_10-Q(Mar-11-2026).doc | Q3 FY2026, ended Feb-28-2026 (filed Mar-11-2026) | ~5.5 months (period end); Q4 FY26 data available via the 10-K/press release instead of a standalone 10-Q, ~2.4 months |
| Capital structure / balance sheet | Financials_Quarterly.xls, Balance Sheet tab | Quarterly through May-31-2026 | ~2.4 months |
| Consensus / estimate export | OracleCorporationNYSEORCLEstimatesReport.xls, Consensus tab | NTM estimates as of run window (current FYE May-31-2027) | Current (data pulled Aug-13-2026) |
| Multiples export | Financials_Annual.xls, Multiples tab (own-history); OracleCorporationNYSEORCLEstimatesReport.xls, Multiples tab (consensus-based) | Through FY2026 / NTM as of Aug-2026 | Current |
| Peer / comps export | Company Comparable Analysis Oracle Corporation.xls, Trading Multiples tab | As-of 2026-08-13 | 1 day |
| Current price (IBKR / Capital IQ) | Oracle Corporation NYSE ORCL Public Company Profile.rtf | Delayed quote, Aug-13-2026 02:26 PM (GMT-5): $153.94 | 1 day (well within 5-trading-day freshness threshold) |
| Cash flow statement | Financials_Annual.xls / Financials_Quarterly.xls, Cash Flow tabs | FY2017–FY2026 / quarterly through May-31-2026 | ~2.4 months |
| Segment data | Financials_Annual.xls / Financials_Quarterly.xls, Segments tabs; FY26 10-K Note 13 | FY2017–FY2026 / quarterly through May-31-2026 | ~2.4 months |

## 3. Valuation Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Current price | Y | `Oracle Corporation NYSE ORCL Public Company Profile.rtf`, delayed quote Aug-13-2026 02:26 PM (GMT-5), $153.94; corroborated by `ORCL_Charting Excel Export...Pane 1` daily series through 2026-08-13 | Anchor for market cap, EV, multiples, margin of safety |
| Diluted share count | Y | `Public Company Profile.rtf`: Shares Out. (mm) 2,880.5; `Financials_Annual.xls` Key Stats states "Dilution: Basic" for the historical EPS line, so a fully diluted count must be pulled from the Historical Capitalization / Capital Structure Details tabs, which carry basic + diluted breakouts | Needed for market cap and per-share fair value |
| Dilution data (options/RSUs/convertibles) | Y | `Financials_Annual.xls`, Historical Capitalization tab and Capital Structure Details tab carry option/RSU and convertible detail; FY26 10-K equity-compensation notes | Needed for fully diluted per-share fair value |
| Business type track (Operating / Financial / REIT / Commodity / Holding co.) | Y | Operating company — SaaS/subscription-software hybrid with legacy license, hardware, and services [`business-model/02_business-identity.md`, §3]; FY26 10-K Item 1 | Determines which valuation methods are valid |
| Total debt, cash, minority/preferred | Y | `Financials_Annual.xls`, Capital Structure Summary tab: Total Debt $167,432M, Total Cash & ST Investments $31,894M, Net Debt $135,538M, Total Preferred Equity $4,954M, Total Minority Interest $548M (all FY2026) | Needed for the enterprise-value bridge |
| Income statement (LTM or FY) | Y | `Financials_Annual.xls` Income Statement / Key Stats tabs (FY2026: Revenue $67,357M, EBITDA $30,494M, EBIT $22,385M, Net Income $17,087M, Diluted EPS $5.83); `Financials_Quarterly.xls` Income Statement tab enables a true LTM build | Earnings/EBITDA base for multiples and DCF |
| Cash flow statement | Y | `Financials_Annual.xls` / `Financials_Quarterly.xls`, Cash Flow tabs, FY2017–FY2026 and quarterly through May-2026. Note: FY2026 free cash flow was reported negative (~ -$23.7bn) on ~$32.0bn CFO against ~$48bn net capex, driven by the AI data-center build [`business-model/02_business-identity.md`, §3, citing Q4FY26 Earnings Press Release p.2] — data is present but requires careful normalization in `04_intrinsic-dcf`, not a data gap | FCF base for DCF and FCF yield |
| Forward estimates (consensus) | Y | `OracleCorporationNYSEORCLEstimatesReport.xls`, Consensus tab: NTM EPS $8.05, NTM Revenue $89,336.5M, NTM EBITDA $49,996.0M, 41 analysts, mean target price $246.43 | NTM/FY multiples and DCF near-term path |
| Historical multiple data | Y | `Financials_Annual.xls` / `Financials_Quarterly.xls`, Multiples tabs, own-history back to FY2017 | Own-history re-rating read |
| Peer / comps data | Y | `Company Comparable Analysis Oracle Corporation.xls`, Trading Multiples tab: 10 named peers (CRM, MSFT, NOW, SNOW, ADBE, WDAY, SAP, PLTR, INTU, CRWD) with LTM and NTM multiples as of 2026-08-13; corroborated by named peers in `business-model/08_competitive-map.md` | Relative valuation and SOTP segment multiples |
| Segment-level revenue & EBIT | Y | `Financials_Annual.xls` / `Financials_Quarterly.xls`, Segments tabs; FY26 10-K Note 13. Three reportable segments (Cloud and Software, Hardware, Services), but Cloud and Software alone is 86.9% of revenue and 90.7% of segment profit in FY26 [`business-model/03_segment-map.md`] — effectively single-segment under the module's >85%-of-EBIT threshold | Sum-of-the-parts |
| Dividend / buyback data | Y | `Public Company Profile.rtf`: Dividend Yield 1.3%; `Financials_Annual.xls` Cash Flow tab carries dividends-paid and buyback line items across FY2017–FY2026 | Shareholder-yield read |

## 4. Cross-Module Availability

| Cross-Module Output | Available? (Y/N) |
|---|---|
| business-model/03_segment-map.md | Y |
| business-model/08_competitive-map.md | Y |
| business-model/07_business-quality.md | Y |
| business-model/09_moat.md | Y |
| business-model/10_external-dependency.md | Y |
| earnings/01_historical-financials.md | Y |
| earnings/04_guidance-consensus.md | Y |
| earnings/03_margin-drivers.md | Y |
| earnings/07_earnings-sensitivity.md | Y |
| earnings/06_earnings-quality.md | Y |

management-governance module outputs are also present (`analyses/ORCL_2026-08-14/management-governance/`), including `04_ownership-and-insider-behavior.md` and `99_management-governance-synthesis.md`. The §24 Filter 6 (structurally unaligned controlling owner / RF-OWN-004) test does **not** trip: Larry Ellison holds a large stake (40.21% of vote) but as the company's founder with concentrated personal wealth in Oracle stock — the opposite of the filter's target profile (government control, listed subsidiary of a value-maximizing parent, sprawling unrelated conglomerate) [`management-governance/99_management-governance-synthesis.md`, finding 04-008]. Downstream valuation agents should NOT apply the value-trap score cap for this filter, but should still note the synthesis's own finding of board-entrenchment risk (Ellison 40.21% vote + 5 of 13 board seats held by founder/CEO/former-CEO insiders) as a qualitative governance risk to flag in the confidence read, separate from Filter 6.

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No current price | N — pool-verified price present ($153.94, Aug-13-2026 02:26 PM GMT-5, 1 day stale) | 01, 05, 07, 99 | Not applicable |
| No consensus / forward estimates | N — full consensus export present (41 analysts, NTM EPS/Revenue/EBITDA, target price) | 02, 03, 04, 05 | Not applicable |
| No peer data | N — 10 named peers with LTM and NTM multiples | 03, 06 | Not applicable |
| No segment-level data | N — segment data present, but the business is effectively single-segment (Cloud and Software = 90.7% of FY26 segment profit); `06_sum-of-the-parts` should apply the module's single-segment collapse note per the Segment/SOTP Rule rather than force a spurious breakup | 06 | None (data-availability cap); `06` applies its own single-segment collapse note |
| No balance sheet / capital structure | N — full capital-structure detail present (debt, cash, preferred, minority interest, historical capitalization) | 01, 04, 06 | Not applicable |
| No cash flow statement | N — cash flow statement present FY2017–FY2026 and quarterly; FY2026 FCF is reported negative due to AI data-center capex, which `04_intrinsic-dcf` must normalize and flag explicitly rather than headline as the recurring FCF base | 04 | None (data-availability cap); DCF must apply a normalization / capex-cycle flag, not a data-sufficiency cap |

## 6A. Method Readiness Matrix

| Method | Ready? (Y/N) | Blocking Missing Inputs | Notes |
|---|---|---|---|
| Own-history multiples | Y | None | 10-year own-history multiple series available (`Financials_Annual.xls` / `Financials_Quarterly.xls`, Multiples tabs) |
| Peer relative valuation | Y | None | 10 named peers, LTM and NTM multiples, as of 2026-08-13 |
| Intrinsic DCF (Operating FCFF) | Y | None | Income statement, balance sheet, and cash flow statement all present; FY2026 reported FCF is negative on heavy AI-infrastructure capex — `04` must build a normalized FCF base and flag the capex cycle rather than average it into a steady-state figure (CLAUDE.md §15) |
| Reverse DCF | Y (conditional on `04` running first) | None from this triage's read; depends on `04`'s canonical WACC and normalized FCF base per MODULE_RULES Calculation Standard 9 | Pool-verified price present, so "what's priced in" is computable |
| SOTP | Y (data present), but expected to collapse | None — three segments disclosed, but Cloud and Software is 86.9% of revenue / 90.7% of segment profit in FY26, above the module's >85%-of-EBIT single-segment threshold | `06` should return the "single-segment — SOTP collapses to the consolidated read" note per the Segment/SOTP Rule rather than force a breakup; this is a business-mix finding, not a missing-data gap |

## 6. Sufficiency Verdict

- **Verdict:** Sufficient
- **Reason:** A complete earnings base (income statement and cash flow statement), full capital-structure data (balance sheet, debt, cash, preferred, minority interest), a pool-verified current price, consensus forward estimates, and a named peer-comps export are all present in the data pool, so all five candidate methods (own-history multiples, peer relative valuation, DCF, reverse-DCF, and SOTP) can run.
- **Methods that can run:** own-history multiples, peer relative valuation, intrinsic DCF (Operating FCFF), reverse-DCF, SOTP (though SOTP is expected to collapse to a single-segment note given Cloud and Software's 90.7% share of FY26 segment profit).
- **Active partial-data caps:** None — no Partial-Data Rule row is triggered.
- **Critical missing items:** None. Two items merit explicit handling downstream, not as data gaps: (1) FY2026 reported free cash flow is negative (~ -$23.7bn) due to an AI data-center capex surge — `04_intrinsic-dcf` must build a normalized FCF base and flag the capex cycle explicitly rather than headline the negative figure or silently smooth it away; (2) Cloud and Software is 90.7% of FY26 segment profit, so `06_sum-of-the-parts` should apply the module's single-segment collapse note rather than force a three-way breakup.



---

## valuation / 01_price-and-capital-structure.md

_Source: `01_price-and-capital-structure.md`_

# Price & Capital Structure — ORCL

Reporting standard: US GAAP. Currency: USD (millions unless stated per-share). Fiscal year end: May 31 (FY2026 = year ended May-31-2026). Listing: NYSE, US SEC domestic filer (Delaware-incorporated, HQ Austin, TX) [FY26 10-K cover page; `Oracle Corporation NYSE ORCL Public Company Profile.rtf`].

## 1. Current Price

| Field | Value | Source | As-of Date |
|---|---|---|---|
| Current price | $153.94 | `Oracle Corporation NYSE ORCL Public Company Profile.rtf` — delayed quote | Aug-13-2026, 02:26 PM (GMT-5) |
| Currency | USD | Same source | — |
| Price basis (last close / intraday / indicative) | Delayed intraday quote (≥20-minute delay), NYSE:ORCL common stock | Same source | Aug-13-2026 |

**Price-state: `pool-verified`.** The price is a Capital IQ delayed-quote export sitting in the data pool, not a web-sourced figure — it does not need independent web corroboration under the partial-data rule (that rule governs only web-sourced prices used when no pool price exists).

**Corroboration.** The prior trading day's close, Aug-12-2026, was $153.28 [`ORCL_Charting Excel Export - Aug 13th 2026 4_48_01 pm.xls`, Pane 1 tab, daily series, last row: 2026-08-12, close 153.28]. This matches the "Previous Close" field on the Public Company Profile ($153.28) and the "Change on Day" arithmetic (+$0.66 / +0.4% → $153.28 + $0.66 = $153.94), so the two pool exports are internally consistent. Both are Capital IQ-sourced (a single vendor, not two independent providers), but because a pool price exists this is not the no-pool-price case requiring two-source corroboration.

**Vendor's own EV snapshot used a different, older price.** The "Financial Information" box on the same Public Company Profile document states market cap of $441,518.6M and EV of $582,558.6M, but its own footnote says: *"TEV and Market Cap are calculated using a close price as of Aug-12-2026"* — i.e., the **prior day's close ($153.28)**, not the $153.94 delayed quote dated Aug-13. This report uses the more current $153.94 quote as the canonical price and rebuilds the bridge below rather than reusing the vendor's pre-computed (stale-by-one-day) box; the vendor's own bridge is shown as a cross-check in §4.

**Price staleness.** Run date 2026-08-14; quote as-of Aug-13-2026 02:26 PM (GMT-5) — age ≈ 1 trading day, well inside the 5-trading-day freshness threshold. No refresh needed; no staleness cap applies.

## 2. Share Count

| Field | Value | Source |
|---:|---:|---|
| Basic shares outstanding (as-of filing date) | 2,880.471M (≈2,880.5M) | `Financials_Annual.xls`, Balance Sheet tab, "Total Shares Out. on Filing Date," FY2026 column; matches `Public Company Profile.rtf` "Shares Out. (mm) 2,880.5" |
| Diluted weighted-average shares (FY2026) | 2,914M | `Financials_Annual.xls`, Income Statement tab, "Weighted Avg. Diluted Shares Out.," FY2026 |
| Options/RSUs (treasury-stock-method increment, implied) | ≈54M (FY2026 weighted-average diluted 2,914M − weighted-average basic 2,860M) | Inference, not from filings — derived from the FY2026 basic/diluted weighted-average gap in `Financials_Annual.xls`, Income Statement tab; the pool does not carry a separate options/RSU count with strikes |
| Convertibles / potential shares (Mandatory Convertible Preferred) | 50,000 preferred shares (100,000,000 depositary shares, 1/2,000th interest each); converts into 24.99M–31.24M common shares depending on price at conversion | FY26 10-K, Notes to Consolidated Financial Statements (Preferred Stock financing) and MD&A |
| **Fully diluted shares (TSM + if-converted, estimate)** | **≈2,965.7M** | Built as: 2,880.5M basic + ≈54M RSU/option TSM increment (proxied, see limitation) + ≈31.2M Mandatory Convertible Preferred if-converted at the maximum ratio (see below) |
| Share count used for market cap | 2,880.5M (basic, current) | Per Fully Diluted Equity Rule 1 — most recent shares outstanding, not a weighted average |
| Share count used for per-share fair value | ≈2,965.7M (fully diluted estimate); GAAP diluted weighted-average of 2,914M shown as the disclosure-clean fallback | See limitation below |

**Mandatory Convertible Preferred Stock — detail.** Oracle issued 100,000,000 depositary shares (representing 50,000 shares of 6.50% Series D Mandatory Convertible Preferred Stock) on Feb-5-2026 for $5.0bn net proceeds, $100,000 liquidation preference per preferred share [FY26 10-K]. It mandatorily converts on Jan-15-2029 into between **499.8126** (minimum, if the stock is high) and **624.7657** (maximum, if the stock is low) common shares per preferred share, i.e. an implied conversion-price floor near $100,000 / 624.7657 ≈ $160 and a cap near $100,000 / 499.8126 ≈ $200 [FY26 10-K, Preferred Stock note]. At the current price ($153.94), which sits **below** the ≈$160 floor, an if-converted calculation today would use the **maximum** ratio: 50,000 × 624.7657 ≈ **31.24M shares** (≈1.1% of basic shares). For FY2026 GAAP diluted EPS, the 10-K states the Mandatory Convertible Preferred was **excluded** as anti-dilutive under the if-converted test [FY26 10-K: "anti-dilutive Mandatory Convertible Preferred Stock as calculated using the if-converted method... could be dilutive in the future"] — so the 2,914M diluted weighted-average shares does **not** include it. Preferred dividends of $103M (partial-year, since issued Feb-2026) were instead deducted from net income to arrive at NI-to-common [`Financials_Annual.xls`, Income Statement tab].

**Limitation.** The pool does not carry a strike-level options/RSU table or a period-end (rather than weighted-average) TSM add-back, so the ≈54M RSU/option increment above is proxied from the FY2026 weighted-average basic-to-diluted gap — labelled as a limitation, not a filing-sourced figure. Downstream agents needing a single defensible per-share count with no estimation should default to the GAAP diluted weighted-average of **2,914M shares**, which already reflects the actual FY2026 RSU/option TSM dilution (excludes the preferred, which was anti-dilutive over the year but is economically real and would add ≈25–31M shares on a forward, current-price basis).

## 3. Market Capitalization

`Market cap = share count × current price = 2,880.5M × $153.94 = $443,424.2M`

## 4. Enterprise Value Bridge

| Component | Amount ($M) | Source |
|---|---:|---|
| Market capitalization | 443,424.2 | §3 above |
| + Total debt (short + long term, incl. lease liabilities) | 167,432.0 | `Financials_Annual.xls`, Capital Structure Summary / Balance Sheet tabs, FY2026 |
| + Minority / non-controlling interest | 548.0 | `Financials_Annual.xls`, Balance Sheet tab, FY2026 ("Minority Interest") |
| + Preferred equity (Mandatory Convertible Preferred, carrying value) | 4,954.0 | `Financials_Annual.xls`, Balance Sheet tab, FY2026 ("Total Pref. Equity") |
| − Cash & equivalents (+ ST investments) | (31,894.0) | `Financials_Annual.xls`, Balance Sheet tab, FY2026 ("Total Cash & ST Investments" = $31,289M cash & equivalents + $605M ST investments) |
| **= Enterprise value (EV)** | **584,464.2** | Computed |

**Cross-check against the vendor's own bridge.** The Public Company Profile's pre-computed box shows Market Cap $441,518.6M and EV $582,558.6M, built off the Aug-12-2026 close ($153.28) rather than the $153.94 quote used here; its own component math ties out exactly (441,518.6 + 167,432.0 + 4,954.0 + 548.0 − 31,894.0 = 582,558.6). The $1,905.6M EV gap between the two bridges is entirely attributable to the one-day price difference ($153.94 vs $153.28 × 2,880.5M shares ≈ $1,901M), not a data discrepancy — both bridges use identical debt/cash/preferred/minority inputs.

**Lease liabilities are embedded in "Total Debt," not added separately.** Of the $167,432M total debt, $37,891M is lease liabilities ($30,190M operating + $7,701M finance/capital leases) recognized on the balance sheet under ASC 842 [`Financials_Annual.xls`, Capital Structure Summary tab, "Total Lease Liabilities," and Capital Structure Details tab, FY2026 instrument list]. This report treats the as-reported (lease-inclusive) total debt as canonical, consistent with US GAAP balance-sheet recognition — no separate "+ Operating lease liabilities" adjustment is layered on top (that would double-count). For readers who want a leverage view excluding capitalized leases, ex-lease ("financial") debt is $167,432M − $37,891M = **$129,541M**, which would produce an EV of $443,424.2 + 129,541.0 + 548.0 + 4,954.0 − 31,894.0 = **$546,573.2M**. Both figures are shown; the lease-inclusive $584,464.2M is the canonical EV this report anchors on.

**Adjustments NOT made:** no separate pension/OPEB add-back (Oracle's unfunded projected-benefit-obligation debt-equivalent is $2,500M per `Financials_Annual.xls`, Balance Sheet tab, "Debt Equiv. of Unfunded Proj. Benefit Obligation" — small relative to the ~$584bn EV and not layered in, since it is a supplemental CIQ estimate rather than a balance-sheet liability); no equity-method-investment carve-out (Oracle discloses equity-method investments in non-operating income but does not break out their balance-sheet carrying value separately from "Other Long-Term Assets" in this export, so none is excluded from EV).

**Cash quality — checked, no adjustment needed.** The $31,894M cash & ST investments line is genuine operating cash and short-term equivalents: restricted cash included within cash and cash equivalents was disclosed as **"immaterial"** [FY26 10-K, Note 2/Fair Value section], and all marketable debt securities held mature within one year and are limited to investment-grade issuers [FY26 10-K, same note]. There is no financial-subsidiary trapped-cash pool comparable to a captive-finance arm — the disclosed minority-interest subsidiaries (Oracle Financial Services Software Limited, Oracle Corporation Japan) are operating businesses, not financing vehicles. No cash-quality haircut applied; the $31,894M figure is used as-is.

## 5. Net Debt & Leverage Snapshot

| Metric | Value | Basis | Source |
|---|---:|---|---|
| Total debt | $167,432M | — | `Financials_Annual.xls`, Balance Sheet tab, FY2026 |
| Cash & equivalents (strict) | $31,289M | Cash & equivalents only | `Financials_Annual.xls`, Balance Sheet tab, FY2026 |
| Cash & ST investments (broad) | $31,894M | + $605M ST investments | Same |
| Net debt (strict — total debt − cash & equivalents only) | **$136,143M** | §15 default | Computed: 167,432 − 31,289; cross-checked against `earnings/01_historical-financials.md` §1, which independently computes the identical $136,143M figure |
| Net debt (broad — nets ST investments too) | $135,538M | §15 broad basis | `Financials_Annual.xls`, Balance Sheet tab, FY2026 "Net Debt" row |
| Net debt / EBITDA (GAAP-reported EBITDA, strict net-debt basis) | **4.46x** | Strict net debt / GAAP EBITDA | Computed: 136,143 / 30,494 (EBITDA from `Financials_Annual.xls`, Income Statement tab, FY2026) |
| Net debt / EBITDA (GAAP-reported EBITDA, broad net-debt basis) | 4.44x | Broad net debt / GAAP EBITDA | Computed: 135,538 / 30,494 |

**Basis flag — the canonical net-debt figure for this module is the STRICT basis, $136,143M**, per CLAUDE.md §15 default (total debt − cash & equivalents only). Every downstream equity bridge in this module should use $136,143M unless it states an explicit one-line reason to use the broad ($135,538M) figure instead.

**A vendor-ratio discrepancy, reconciled, not silently overridden.** `Financials_Annual.xls`'s own Capital Structure Summary tab prints "Total Debt/EBITDA" = 5.03x and "Net Debt/EBITDA" = 4.07x for FY2026 — both lower than the 5.49x and 4.46x computed above using plain GAAP EBITDA ($30,494M). Tracing the arithmetic: 167,432 / 33,288 = 5.030x and 135,538 / 33,288 = 4.072x — i.e., the vendor's printed ratios use **EBITDAR** ($33,288M = EBITDA + total rent expense, `Financials_Annual.xls` Income Statement tab, "EBITDAR" row), not plain EBITDA, in the denominator, evidently to stay consistent with a lease-inclusive Total Debt numerator. This report uses plain GAAP EBITDA ($30,494M) as the labelled denominator throughout and flags the vendor ratio as EBITDAR-based rather than silently adopting the lower-looking 4.07x figure under an unqualified "Net Debt/EBITDA" label.

## 6. Per-Share Reference Values

| Metric | Per Share | Basis (shares) | Source |
|---|---:|---|---|
| Book value per share | $13.04 | 2,880.5M basic | `Financials_Annual.xls`, Balance Sheet tab, FY2026 ("Book Value/Share"); ties to $37,554M total common equity ÷ 2,880.5M |
| Tangible book value per share | −$9.70 | 2,880.5M basic | `Financials_Annual.xls`, Balance Sheet tab, FY2026 ("Tangible Book Value/Share"); tangible book value is −$27,936M (total common equity $37,554M less $62,261M goodwill and $3,229M other intangibles) |
| Net debt per share (strict) | $47.27 | 2,880.5M basic | Computed: $136,143M / 2,880.5M |
| Net debt per share (broad) | $47.06 | 2,880.5M basic | Computed: $135,538M / 2,880.5M |

Tangible book value is negative — Oracle's balance sheet carries $62,261M of goodwill and $3,229M of other intangibles (mostly from the Cerner and earlier acquisitions) against $37,554M of total common equity, so tangible net worth is a $27,936M deficit. This is a capital-structure fact, not a valuation judgment — it is left for the multiples/DCF agents to interpret.

## 7. Anchor Summary (canonical numbers for downstream agents)

- **Current price:** $153.94, as of Aug-13-2026 02:26 PM (GMT-5), delayed NYSE quote, pool-sourced (Capital IQ). Prior-day close (Aug-12-2026) was $153.28, internally consistent with the delayed quote's stated day-change.
- **Share counts:** market cap uses 2,880.5M basic shares (as-of the FY26 10-K filing date); per-share fair value should use the GAAP diluted weighted-average of 2,914M as the disclosure-clean default, or the ≈2,965.7M fully-diluted estimate (basic + RSU/option TSM proxy + Mandatory Convertible Preferred if-converted at the current-price-applicable maximum ratio) where a downstream agent wants the more complete, but partly-inferred, count — the choice and its basis must be stated wherever it is used.
- **Market cap:** $443,424.2M.
- **Enterprise value:** $584,464.2M (lease-inclusive, canonical); $546,573.2M if operating/finance lease liabilities are excluded from debt.
- **Net debt (canonical, strict basis):** $136,143M (total debt $167,432M − cash & equivalents $31,289M). Broad basis (nets in $605M ST investments too): $135,538M.
- **Reporting currency:** USD (US GAAP, FYE May 31).

### Anchor Block (copy-forward)

- Price: $153.94 (Aug-13-2026, 02:26 PM GMT-5, delayed intraday quote)
- Price-state: pool-verified
- Currency: USD
- Shares (market cap): 2,880.5M (basic, as-of FY26 10-K filing date — `Financials_Annual.xls` Balance Sheet tab / `Public Company Profile.rtf`)
- Shares (per-share fair value): 2,914M (GAAP diluted weighted-average, FY2026 — disclosure-clean default) OR ≈2,965.7M (fully-diluted estimate incl. Mandatory Convertible Preferred if-converted at current-price-applicable max ratio — partly inferred, see §2 limitation)
- Market cap: $443,424.2M
- Net debt: $136,143M (strict basis — total debt minus cash & equivalents only; broad basis incl. ST investments = $135,538M)
- EV: $584,464.2M (lease-inclusive, canonical); $546,573.2M ex-lease-liabilities
- Key caveats: (1) RSU/option TSM increment for the fully-diluted per-share count is proxied from the FY2026 weighted-average basic/diluted gap, not a filing-disclosed strike-level table — a labelled limitation; (2) Total Debt as reported includes $37,891M of lease liabilities (operating + finance), so the canonical EV is lease-inclusive — an ex-lease EV is shown alongside for leverage-focused readers; (3) Capital IQ's own printed "Net Debt/EBITDA" (4.07x) and "Total Debt/EBITDA" (5.03x) use EBITDAR, not plain EBITDA, as the denominator — this report's 4.46x / 5.49x figures use plain GAAP EBITDA and are the ones downstream agents should cite unless EBITDAR is explicitly intended; (4) tangible book value per share is negative (−$9.70) due to $65,490M of goodwill and other intangibles.



---

## valuation / 02_multiples-own-history.md

_Source: `02_multiples-own-history.md`_

# Multiples — Own History — ORCL

Reporting currency: USD. Reporting standard: US GAAP, fiscal year end May-31 (FY2026 = year ended May-31-2026). Anchor numbers below are copied verbatim from `01_price-and-capital-structure.md`: current price $153.94 (Aug-13-2026, delayed NYSE quote), market cap $443,424.2M (2,880.5M basic shares), enterprise value $584,464.2M (lease-inclusive, canonical), net debt (strict) $136,143M, minority interest $548.0M, preferred equity (carrying value) $4,954.0M. Per-share fair-value figures below use the GAAP diluted weighted-average share count of 2,914M shares, per 01's stated disclosure-clean default.

Business type: single-business operating/software company (not a financial, REIT, or holding company) — the EV-based multiple set (EV/Sales, EV/EBITDA, EV/EBIT) plus P/E, P/FCF and dividend yield is the right method map; P/tangible book is dropped (structurally negative from $65.5bn of goodwill/intangibles — a capital-structure fact, not a valuation signal per 01 §6) and plain P/Book is shown with a data-quality caveat (see §2).

## 1. Current Multiples

| Multiple | Basis (LTM / NTM / FY) | Metric Value | Current Multiple | Source |
|---|---|---:|---:|---|
| P / E | LTM, GAAP diluted EPS | $5.83 | 26.40x | Price $153.94 [01]; EPS [`Financials_Annual.xls`, Income Statement tab, FY2026] |
| P / E | LTM, Non-GAAP diluted EPS | $7.63 | 20.18x | EPS per [`earnings/01_historical-financials.md` §4, Q4 FY26 Earnings Press Release GAAP-to-non-GAAP reconciliation] |
| P / E | NTM / FY2027, consensus Non-GAAP EPS | $8.05 (42-analyst consensus) | 19.03x | [`OracleCorporationNYSEORCLEstimatesReport.xls`, Multiples tab, "Based on Market Price," FY 2027 column] |
| EV / EBITDA | LTM, plain GAAP EBITDA | $30,494M | 19.17x | EV [01]; EBITDA [`Financials_Annual.xls`, Income Statement tab, FY2026] |
| EV / EBITDA | LTM, EBITDAR basis (vendor series — see §2 note) | $33,288M (EBITDA + total rent expense) | 17.56x | [`Financials_Annual.xls`, Income Statement tab, "EBITDAR" row, FY2026]; basis reconciled in 01 §5 |
| EV / EBIT | LTM, CIQ EBIT (excludes restructuring & other charges) | $22,385M | 26.11x | [`Financials_Annual.xls`, Income Statement tab, FY2026] |
| EV / EBIT | LTM, GAAP operating income (includes $1,779M restructuring) | $20,606M | 28.36x | FY26 10-K / Q4 FY26 Earnings Press Release |
| EV / Sales | LTM | $67,357M | 8.68x | EV [01]; Revenue [`Financials_Annual.xls`, Income Statement tab, FY2026] |
| EV / Sales | NTM / FY2027, consensus | $89,336.55M (42-analyst mean) | 6.52x | [`OracleCorporationNYSEORCLEstimatesReport.xls`, Multiples tab, FY 2027 column] |
| P / Book | LTM | BVPS $13.04 | 11.81x | Price $153.94; BVPS [01 §6, `Financials_Annual.xls` Balance Sheet tab, FY2026] |
| P / FCF (FCF yield) | LTM | FCF = CFO $31,977M − capex $55,663M = −$23,686M | **NM** (negative) — FCF yield ≈ −5.3% of market cap | [`earnings/01_historical-financials.md` §1–2]; FCF turned sharply negative on the FY2026 AI-datacenter capex ramp (capex +162% YoY) |
| Dividend yield | LTM, indicated | — | 1.3% | [`Public Company Profile.rtf`, "Dividend Yield %"] |

**Definitions.** EBITDA = GAAP operating income + D&A (company does not disclose a non-GAAP EBITDA — see `earnings/01` §4). FCF = CFO − total capex, no company-specific redefinition (§15 default). P/E uses fully-diluted weighted-average shares (2,914M), consistent with the EPS figures' own denominator. No dividend-per-share time series is available in the pool beyond the current indicated yield — see partial-data note in §2.

## 2. Historical Multiple Bands (Trailing ~5 Years: 2021-09-30 to 2026-08-12, 21 quarterly closes)

Source: `Oracle Corporation NYSE ORCL Financials_Annual.xls`, Multiples tab, "Close" row (quarter-end trading-day close, quarterly frequency) — the same workbook 01 uses for the capital-structure bridge. Band statistics computed directly from the exported time series (min/mean/median/max of quarter-end close values over the trailing 21 quarters).

| Multiple | Min | Mean | Median | Max | Current | Percentile of Range |
|---|---:|---:|---:|---:|---:|---:|
| EV / Sales (LTM) | 5.56x | 8.50x | 8.18x | 15.30x | 8.68x | 32.0% |
| EV / EBITDAR (LTM, vendor basis — see note) | 12.69x | 19.55x | 17.85x | 35.56x | 17.56x | 21.5% |
| EV / EBIT (LTM, CIQ basis) | 15.42x | 26.83x | 26.02x | 48.60x | 26.11x | 32.2% |
| P / E (LTM, GAAP diluted) | 18.46x | 33.64x | 31.06x | 65.12x | 26.40x | 17.0% |
| EV / Sales (NTM / FY-fwd) | 4.89x | 7.49x | 6.72x | 12.83x | 6.52x | 20.5% |
| EV / EBITDA (NTM / FY-fwd) | 10.46x | 14.71x | 13.73x | 24.30x | 11.65x | 8.6% |
| EV / EBIT (NTM / FY-fwd) | 11.67x | 17.52x | 16.20x | 30.63x | 16.23x | 24.1% |
| P / E (NTM / FY-fwd) | 11.96x | 21.11x | 19.08x | 39.79x | 19.03x | 25.4% |

**Vendor-basis note (EV/EBITDA row).** The CIQ Multiples workbook's own "TEV/LTM EBITDA" series is computed on an EBITDAR basis (EBITDA + total rent expense, $33,288M for FY2026), not plain GAAP EBITDA ($30,494M) — the same EBITDAR figure that 01 §5 already identified as explaining the vendor's own "Net Debt/EBITDA" discrepancy (167,432/33,288 = 5.03x, matching the vendor's printed ratio exactly). Recomputing today's point on this same basis (584,464.2 / 33,288 = 17.56x) reconciles almost exactly to the vendor's own Aug-12-2026 close of 17.50x (the residual is the one-day price gap already documented in 01). This report labels the row EV/EBITDAR and uses it only for direct comparability with the vendor's own historical series; the plain-EBITDA current multiple (19.17x, Section 1) is not directly comparable to this band without the same rent add-back and is not mixed into it (§15 hygiene).

**P/Book — excluded from the band, data conflict flagged, not resolved.** The same Multiples workbook's "P/BV" series shows "NM" for all six of the most recent quarters (2025-06-30 through 2026-08-12) — implying the vendor's own P/BV calculation treats book value as not meaningful over that window. This directly conflicts with the Balance Sheet tab's own "Book Value/Share" row, which shows book value per share positive and rising every quarter over the same window (from $3.16 at 2024-03-28 to $13.04 at FY2026 year-end) — the same $13.04 figure 01 cites for the current P/B multiple (11.81x, Section 1). This is an unresolved vendor internal inconsistency, not a real business fact (book value is genuinely positive and growing per the audited balance sheet), and the current P/B multiple in Section 1 uses the Balance-Sheet-sourced figure. Because the band itself cannot be reconstructed cleanly from the conflicting series, P/B is dropped from the reversion table in Section 4 rather than published on an unreliable base.

**Dividend yield** — no historical time series is available in the data pool beyond the current 1.3% indicated yield; per the partial-data rule, this single metric's re-rating read is limited to the current level.

Note on the amplitude behind these numbers: Oracle's 52-week trading range was $114.50–$345.72 [`Public Company Profile.rtf`] — a >3x round-trip within the last year, driven by the September-2025 AI-infrastructure/RPO re-rating spike (consistent with the EV/EBITDAR band's max of 35.56x, printed at the 2025-12-31 quarter-end) and the subsequent partial de-rating back toward $150s. The 21-quarter band above is built from quarter-end closes and therefore smooths over — but does not erase — that single-name volatility; a reader relying only on the quarter-end snapshots should not assume the stock traded calmly through this period.

## 3. Re-Rating / De-Rating Read

On the three multiples with a clean, comparable 5-year band — EV/Sales, EV/EBITDAR, EV/EBIT — Oracle sits in the bottom third of its own range (17.0–32.2nd percentile) and close to, or modestly below, its own median: EV/Sales is +6.1% above its own median ($8.18x) but only +2.1% above its own mean; EV/EBITDAR is −1.4% versus its own median (17.85x) and −10.0% versus its own mean (19.55x, a mean pulled up by the September-2025 spike); EV/EBIT sits almost exactly on its own median (+0.3%) and −2.7% below its own mean. On a pure GAAP P/E basis the discount looks much larger (−15.0% to median, −21.5% to mean) — but that reading is not reliable on its own: FY2026 GAAP diluted EPS ($5.83) includes one-time investment gains from the Ampere chip-business and Bloom Energy warrant sales [`earnings/04_guidance-consensus.md` §6], which mechanically lowers today's P/E versus a "clean" historical multiple and overstates any reversion-implied upside on that metric. Forward (NTM/FY2027) multiples sit even lower in their own range (8.6th–25.4th percentile) than the LTM multiples, largely because consensus is pricing very strong FY2027 EPS/EBITDA growth off the FY2026 base — a mechanical effect of the growth outlook, not necessarily an independent forward de-rating. Putting the reliable EV-based read together: the stock has partially, not fully, de-rated from its September-2025 AI-infrastructure peak (EV/EBITDAR max 35.56x) back to roughly its own 5-year median level — it is not trading at a statistically extreme premium or discount to its own recent history on the multiples least distorted by one-off items and definitional noise, but leverage has risen sharply in the same window (net debt +38.7% YoY to $136,143M strict basis, per `01` §5), so an EV-based multiple that looks "in line with history" is being paid on top of a materially larger debt load than the history it is being compared against.

## 4. Implied Value from Reversion

Reversion targets applied to LTM metrics only (NTM figures are shown for context in §2–3 but not carried into per-share implied values, to avoid compounding a consensus estimate with a historical-multiple estimate). Implied equity value = (multiple × metric) − net debt (strict, $136,143M) − minority interest ($548.0M) − preferred equity ($4,954.0M); implied price = implied equity value ÷ 2,914M diluted shares.

| Multiple | Reversion Target (mean / median) | Implied EV ($M) | Implied Price/Share | vs Current Price ($153.94) |
|---|---:|---:|---:|---:|
| EV / Sales (LTM) | Median 8.18x | 550,980 | $140.47 | −8.7% |
| EV / Sales (LTM) | Mean 8.50x | 572,535 | $147.87 | −3.9% |
| EV / EBITDAR (LTM) | Median 17.85x | 594,191 | $155.30 | +0.9% |
| EV / EBITDAR (LTM) | Mean 19.55x | 650,780 | $174.72 | +13.5% |
| EV / EBIT (LTM, CIQ basis) | Median 26.02x | 582,458 | $151.27 | −1.7% |
| EV / EBIT (LTM, CIQ basis) | Mean 26.83x | 600,590 | $157.50 | +2.3% |
| P / E (LTM, GAAP) — caveated | Median 31.06x | n/a (direct: price = mult × EPS) | $181.08 | +17.6% |
| P / E (LTM, GAAP) — caveated | Mean 33.64x | n/a | $196.12 | +27.4% |

**Base case (the point `07` should weight):** the **EV/EBIT (LTM, CIQ basis) median-reversion** value of **$151.27/share (−1.7% vs. current price)** — chosen because it sits closest to its own historical median (32.2nd percentile of range, +0.3% premium to median), because EBIT captures the P&L impact of the depreciation building up from the FY2026 capex ramp (unlike EV/Sales, which is margin-blind), and because it avoids the EBITDAR-basis reconciliation and the GAAP-EPS one-off-gain distortions that complicate the other two rows.

**Dispersion (the exhibit, not the point):** the three EV-based medians cluster from **$140.47 to $155.30** (−8.7% to +0.9% vs. current price); the corresponding means run higher, **$147.87 to $174.72** (−3.9% to +13.5%), pulled up by the September-2025 AI-rally quarters that sit in the historical window. The GAAP P/E reversion values ($181.08–$196.12, +17.6% to +27.4%) are shown for completeness but are flagged unreliable: they apply a "clean" historical multiple to an EPS base inflated by one-time investment gains, which overstates the implied price — this row should not be averaged into the base case or the dispersion range.

**Reversion assumption — explicitly tested.** Reverting to Oracle's own 5-year mean/median multiple assumes the warranted multiple has not structurally changed. There is real evidence against that assumption in both directions: (1) net debt rose 38.7% in a single year (to $136,143M strict basis) to fund an AI-datacenter capex program that took capex from $21,215M to $55,663M and turned FCF sharply negative (−$23,686M) — a genuine capital-structure and cash-generation change that argues the OLD (pre-AI-capex) mean may be too generous a target on an equity basis, even where the EV-based multiple looks unchanged; (2) the same capex program is a bet on a large, and if realized, durable growth step-up (RPO +363% to $638bn per the management-governance module), which argues the multiple SHOULD be higher than its pre-AI-cycle history if the backlog converts to cash as guided. Both forces are real and roughly offsetting in the EV-based read above; this report does not resolve which dominates — that judgment belongs to `04_intrinsic-dcf` and `07_scenario-and-fair-value`, which can test the capex-to-revenue conversion directly.

## 5. Own-History Read

On the multiples least distorted by one-off items and leverage-vs-equity basis differences (EV/Sales, EV/EBITDAR, EV/EBIT), Oracle trades close to its own 5-year median — not at a statistically extreme premium or discount — after a partial de-rating down from the September-2025 AI-infrastructure spike (EV/EBITDAR peaked at 35.56x that quarter versus 17.56x today). Reverting to the own-median EV/EBIT multiple implies roughly $151/share, essentially flat to today's $153.94. The single biggest caveat is that this "in-line with own history" read on EV-based multiples is being earned on top of a much larger debt load than the history it is measured against — net debt rose 38.7% in one year to fund a capex program that turned free cash flow deeply negative — so an unchanged EV multiple does not mean an unchanged equity-holder risk profile; a downstream DCF or reverse-DCF read should test explicitly whether the AI-capex bet converts backlog (RPO +363% YoY) into cash fast enough to justify carrying that debt at the current multiple, rather than assuming the pre-capex-ramp mean is still the right anchor. The management-governance module's §24 Filter 6 (unaligned-owner) test does not trigger for Oracle — founder Larry Ellison holds ~40.2% of the stock and remains an active, engaged Executive Chair/CTO, the opposite of the filter's target profile (government control, listed-subsidiary-of-parent, sprawling conglomerate) [`management-governance/04_ownership-and-insider-behavior.md`, finding 04-008] — so there is no structural-owner reason to discount the reversion-to-own-mean read here; the caveat that matters is capital-structure and cash-conversion risk, not ownership misalignment.



---

## valuation / 03_relative-valuation-peers.md

_Source: `03_relative-valuation-peers.md`_

# Relative Valuation — Peers — ORCL

## 1. Peer Set

The primary peer set is the Capital IQ "Quick Comparable Analysis" export sitting in the data pool (`Company-Comparable-Analysis-Oracle-Corporation`, Template: Capital IQ Default Comps, As-Of 2026-08-13) — a ten-company set selected by Capital IQ's own proprietary relevancy score, not self-selected by this agent. It is cross-checked against the three named competitors picked out in `business-model/08_competitive-map.md` (Microsoft, Amazon, SAP, drawn directly from Oracle's own FY26 10-K Risk Factors competitor list). Five of the ten CIQ names — Salesforce, Microsoft, Adobe, Workday, SAP — are also named directly by Oracle's own 10-K as competitors; the other five (ServiceNow, Snowflake, Palantir, Intuit, CrowdStrike) are same-category enterprise/cloud-software companies picked up by CIQ's relevancy algorithm but not named by Oracle itself, and three of those five (Palantir, Snowflake, CrowdStrike) are small-scale, extreme-multiple, hyper-growth names whose comparability is limited — flagged below and handled explicitly in §3–§5.

| Peer | Ticker | Why Comparable | Source of Inclusion |
|---|---|---|---|
| Salesforce, Inc. | NYSE:CRM | Cloud CRM/applications software; named directly in ORCL's FY26 10-K competitor list | 10-K-named + CIQ comp set |
| Microsoft Corporation | NasdaqGS:MSFT | Cloud infrastructure (Azure, direct OCI rival) and applications (Dynamics 365, rival to Fusion/NetSuite); named directly in ORCL's FY26 10-K | 10-K-named + CIQ comp set |
| ServiceNow, Inc. | NYSE:NOW | Enterprise cloud workflow/ITSM software, same large-cap enterprise-SaaS category as Oracle Fusion applications | CIQ relevancy algorithm (not named in ORCL's 10-K) |
| Snowflake Inc. | NYSE:SNOW | Cloud data platform, overlaps with Oracle's cloud database business (Autonomous Database) | CIQ relevancy algorithm (not named in ORCL's 10-K); hyper-growth, extreme-multiple outlier — see caveat |
| Adobe Inc. | NasdaqGS:ADBE | Large-cap enterprise/creative software; named directly in ORCL's FY26 10-K competitor list | 10-K-named + CIQ comp set |
| Workday, Inc. | NasdaqGS:WDAY | Cloud HCM/financial-management applications, direct rival to Oracle Fusion HCM/ERP; named directly in ORCL's FY26 10-K | 10-K-named + CIQ comp set |
| SAP SE | XTRA:SAP | Cloud/on-premise ERP, the closest direct applications rival to Oracle Fusion/NetSuite; named directly in ORCL's FY26 10-K | 10-K-named + CIQ comp set |
| Palantir Technologies Inc. | NasdaqGS:PLTR | AI-analytics/data platform software, same broad enterprise-software/AI category | CIQ relevancy algorithm (not named in ORCL's 10-K); hyper-growth, extreme-multiple outlier — see caveat |
| Intuit Inc. | NasdaqGS:INTU | Large-cap financial-management SaaS company | CIQ relevancy algorithm (not named in ORCL's 10-K) |
| CrowdStrike Holdings, Inc. | NasdaqGS:CRWD | Large-cap cloud-security SaaS company, same broad category | CIQ relevancy algorithm (not named in ORCL's 10-K); hyper-growth, extreme-multiple outlier — see caveat |

**Amazon.com (AWS) is excluded from the quantitative comp table.** Amazon is named directly in ORCL's 10-K as the AWS/OCI rival and is profiled in `business-model/08_competitive-map.md`, but it does not appear in the CIQ comp export — AWS is a segment inside a much larger, mostly non-software (e-commerce/advertising/logistics) company, so Amazon's consolidated trading multiples (P/E, EV/EBITDA on the whole company) are not a clean read on the AWS business that actually competes with OCI, and there is no separately-traded AWS entity to comp against. AWS is instead referenced qualitatively — its segment operating margin (35.4% FY2025, 39.4% Q2 2026 [`08_competitive-map.md` §2, Web: Amazon FY2025/Q2 2026 earnings coverage, 2026 (unverified, dated)]) is materially above Oracle's consolidated EBIT margin (33.2% LTM) and is the toughest quality benchmark for OCI's unit economics once it reaches AWS's scale — but it cannot be combined into the peer-median multiple table below without conflating two different-sized businesses.

**Data-quality caveat carried into every subsequent section:** the full ten-name set's mean and median multiples are pulled upward by three names (Palantir, Snowflake, CrowdStrike) trading at extraordinary NTM EV/EBITDA multiples (63.3x, 98.7x, 116.9x respectively) that reflect hyper-growth/profitability-inflection narratives with no real analog in Oracle's mature, capital-intensive profile. CIQ's own summary stats already show this skew (mean NTM EV/EBITDA 36.8x vs median 15.2x) — the median is used throughout as the primary reference per CLAUDE.md discipline, but §3–§5 also show a cleaner sub-median with the three extreme outliers stripped, since even the median is influenced by their presence in a ten-name set.

## 2. Peer Multiples & Operating Stats

Source: `Company-Comparable-Analysis-Oracle-Corporation`, Trading Multiples, Operating Statistics, and Financial Data tabs, Capital IQ, data as of 2026-08-13. All EV-based multiples appropriate to an operating/software business (Business-Type Method Map); no bank/REIT alternative multiples apply.

| Company | P/E (LTM) | EV/EBITDA (LTM) | EV/EBIT (LTM) | EV/Sales (LTM) | FCF Yield | Rev Growth (LTM YoY) | EBITDA Margin (LTM) | Total Debt/EBITDA (LTM, gross) | Data As-of |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|
| **Oracle (ORCL)** | 26.3 | 17.5 | 26.0 | 8.6 | **−5.3%** (computed, see note) | 17.35% | 45.3% | 5.0 | 2026-08-13 |
| Salesforce (CRM) | 22.4 | 14.0 | 20.2 | 4.4 | Not sourced | 10.98% | 30.1% | 3.1 | 2026-08-13 |
| Microsoft (MSFT) | 27.4 | 18.0 | 23.2 | 11.2 | Not sourced | 17.79% | 58.5% | 0.6 | 2026-08-13 |
| ServiceNow (NOW) | 78.1 | 42.8 | 71.7 | 8.9 | 3.54% [Web: GuruFocus, 2026-08-12, unverified] | 22.19% | 19.7% | 2.8 | 2026-08-13 |
| Snowflake (SNOW) | NM | NM | NM | 22.6 | Not sourced | 31.07% | −22.4% | NM | 2026-08-13 |
| Adobe (ADBE) | 14.8 | 10.6 | 11.3 | 4.1 | Not sourced | 11.49% | 38.6% | 0.7 | 2026-08-13 |
| Workday (WDAY) | 54.6 | 24.6 | 36.9 | 4.3 | Not sourced | 13.32% | 15.3% | 2.2 | 2026-08-13 |
| SAP SE | 26.3 | 16.8 | 18.4 | 5.3 | Not sourced | 6.42% | 30.8% | 0.8 | 2026-08-13 |
| Palantir (PLTR) | 146.3 | 148.1 | 152.6 | 65.3 | Not sourced | 78.92% | 43.3% | 0.1 | 2026-08-13 |
| Intuit (INTU) | 20.5 | 14.0 | 15.9 | 4.4 | Not sourced | 15.07% | 30.6% | 1.1 | 2026-08-13 |
| CrowdStrike (CRWD) | NM | NM | NM | 43.6 | Not sourced | 23.17% | 1.2% | 8.1 | 2026-08-13 |
| **Peer median (10-name)** | **26.9** | **17.4** | **21.7** | **7.1** | n/a — insufficient peer coverage | 16.43% | 30.4% | 1.1 | 2026-08-13 |
| **Peer median (5-name, 10-K-named-only: CRM/MSFT/ADBE/WDAY/SAP)** | 26.3 | 16.8 | 20.2 | 4.4 | n/a | 13.32% | 30.1% | 0.8 | 2026-08-13 |
| **Peer median (7-name, ex-Palantir/Snowflake/CrowdStrike)** | 26.3 | 16.8 | 20.2 | 4.4 | n/a | 15.07% | 30.6% | 1.1 | 2026-08-13 |

**FCF Yield gap, flagged.** The CIQ comp export pulled for this report does not carry a peer FCF-yield column, and a web search for peer FCF yields returned only fragmentary, inconsistently-dated coverage for two of the ten names (ServiceNow 3.54% [GuruFocus, 2026-08-12] and a May-2026 dated 10.9% estimate for Salesforce from a third-party blog) — too thin to build a defensible peer median. FCF yield is therefore excluded from the peer-median premium/discount analysis in §3 and treated qualitatively in §4 instead. **Oracle's own FCF yield is computed here directly**: LTM FCF (CFO $31,977M − capex $55,663M) = −$23,686M [`earnings/01_historical-financials.md` §1–2] ÷ market cap $443,424.2M [`01_price-and-capital-structure.md` §3] = **−5.34%**. This is a genuinely negative yield, not a data gap — Oracle is currently a net cash consumer at the free-cash-flow line, driven by the FY26 capex ramp to $55,663M (82.6% of revenue) [`business-model/07_business-quality.md` §1].

**ROIC.** Not in the CIQ comp export for any peer (flagged by `08_competitive-map.md` §5). `business-model/09_moat.md` §3 separately re-sourced third-party, web-based ROIC estimates for three of the ten peers only: Microsoft ~21% (unverified, GuruFocus-class aggregator), SAP ~12–14% (unverified), and AWS-segment-adjacent Amazon-consolidated ~11–12% (unverified) — versus Oracle's own filing-derived, normalized-tax computed ROIC of ~8.5–10.5% (ending-to-average capital basis) [`business-model/09_moat.md` §3]. ROIC for the other seven peers (CRM, NOW, SNOW, ADBE, WDAY, PLTR, INTU, CRWD) was not sourced in this data pool and is not fabricated here — Not sourced, flagged as a gap. Because a reliable ten-name ROIC column cannot be built, ROIC is excluded from the peer-median table above and used only in the qualitative §4 judgment, drawing on the three peers where a (labelled, unverified) figure exists.

## 3. Premium / Discount to Peer Median

Premium/discount = (company multiple − peer median) / peer median, computed against the 10-name CIQ peer median (primary reference). LTM basis shown first, NTM (forward, consensus) basis second — both bases matter here because ORCL's LTM EBIT is depressed by restructuring-related noise relative to its NTM consensus, and forward multiples reflect the market's already-embedded view of the FY27 capex-and-margin path.

| Multiple | Company | Peer Median (10-name) | Premium / (Discount) |
|---|---:|---:|---:|
| P/E (LTM) | 26.3 | 26.9 | **−2.2% (discount)** |
| EV/EBITDA (LTM) | 17.5 | 17.4 | **+0.6% (premium, ~in line)** |
| EV/EBIT (LTM) | 26.0 | 21.7 | **+19.8% (premium)** |
| EV/Sales (LTM) | 8.6 | 7.1 | **+21.1% (premium)** |
| NTM EV/Revenue (Capital IQ) | 6.52 | 6.08 | **+7.2% (premium)** |
| NTM EV/EBITDA (Capital IQ) | 11.65 | 15.19 | **−23.3% (discount)** |
| NTM Forward P/E (Capital IQ) | 19.03 | 23.82 | **−20.1% (discount)** |

Reading against the tighter 5-name 10-K-named-competitor subset (CRM, MSFT, ADBE, WDAY, SAP) shifts the picture materially: on that subset, ORCL's LTM EV/Sales premium widens to roughly **+95%** (8.6 vs 4.4) because Oracle's gross margin (65.8%) sits well below the peer group's (67.9–89.4%), which mechanically inflates its revenue multiple relative to margin-adjusted peers; its LTM EV/EBITDA premium is a modest +4% (17.5 vs 16.8); and its NTM EV/EBITDA reading flips from a discount to roughly **in line** (11.65 vs 11.92, the named-subset's own NTM EV/EBITDA median). The forward P/E discount versus the full ten-name set (−20.1%) becomes a **premium of roughly +21%** versus the named-competitor-only median (19.03 vs 15.76). This divergence is the central finding of this section: **whether ORCL screens cheap or expensive on forward earnings depends almost entirely on whether the hyper-growth outliers (Palantir, Snowflake, CrowdStrike) are included in the peer set** — they are not functional comparables to Oracle's mature license/support-plus-capital-intensive-infrastructure business model.

**Is the gap typical or unusual? Not assessable.** The data pool contains only a single-date CIQ comp snapshot (As-Of 2026-08-13); no historical peer-multiple panel exists in `data/ORCL/` to establish ORCL's typical premium/discount to this peer set over the past ~3 years, and none was sourced from the web within this agent's scope. This is a genuine gap distinct from ORCL's own multiple history (covered separately in `02_multiples-own-history`), and it is marked Not assessable rather than inferred.

## 4. Is the Gap Warranted?

The premium/discount picture is genuinely mixed and the case for or against Oracle's current relative pricing turns on quality factors that cut in both directions. On the positive side, Oracle's LTM EBITDA margin (45.3%) sits above the ten-name peer median (30.4%) and its NTM long-term EPS growth expectation (29.25%) is nearly double the peer median (18.77%) [CIQ Operating Statistics tab] — a computed PEG ratio (forward P/E ÷ NTM LT EPS growth %) of 0.65 for Oracle versus a peer median of roughly 1.31 (this agent's calculation from the same CIQ export) suggests Oracle is priced cheaply relative to its expected growth even where its multiple is not a raw discount. On the negative side, `business-model/09_moat.md` verdicts Oracle a **narrow, eroding moat** — return on capital (~8.5–10.5%, own-computed, cross-checked against CIQ's 8.22%) sits at or modestly below its ~11.2% estimated cost of capital [Inference, not from filings], a decline that has run for four consecutive years, and Oracle's Total Debt/EBITDA (5.0x) is roughly 4.5x the peer median (1.1x) and about 6x the named-competitor-subset median (0.8x) — an extreme leverage gap versus every peer in the set. Gross margin has compressed 1,326bps over five years (79.1% → 65.8%) and LTM levered free cash flow margin is −36.4% [`business-model/07_business-quality.md` §1] against a peer group of mature SaaS names that, on the two data points available (ServiceNow, and a less-reliable Salesforce estimate), are still cash-generative. Given CLAUDE.md §24's standing weight on leverage as the primary cause of permanent capital loss, and the moat module's own finding that ROIC does not comfortably clear cost of capital, **the leverage and moat-erosion evidence should weigh more heavily than the margin/growth positives** in judging the fair relative multiple. Conclusion: **the modest discount on forward EBITDA/P/E versus the full (outlier-skewed) peer set is not fully warranted as a bargain — it largely reflects the exclusion-worthy hyper-growth names, not a genuine Oracle discount versus functionally comparable peers**; against the cleaner named-competitor or outlier-stripped subsets, Oracle trades close to parity to a modest premium, which is **not clearly warranted** given the leverage and ROIC-below-WACC evidence, though partially offset by superior margin and growth. Net read: **premium (on the cleaner peer cuts) is only partially warranted — closer to fair value than to a clear buy signal on relative multiples alone.**

## 5. Implied Value from Peer Multiples

Primary basis: NTM (forward) TEV/EBITDA, applied to Oracle's own NTM consensus EBITDA of $49,995.96M [Capital IQ, Financial Data tab, data as of 2026-08-13], on the same forward-to-forward basis. The peer-median multiple (15.19x, full ten-name set) is adjusted down to a **quality-adjusted warranted multiple of ~11.5x** — near the outlier-stripped 7-name median (16.8x on LTM, 11.92x on NTM) and the 5-name 10-K-named-competitor median (11.92x on NTM), with a small net-negative adjustment (leverage and moat-erosion evidence outweighing the growth/margin premium per §4). Equity bridge uses the strict net debt ($136,143M), preferred equity ($4,954M) and minority interest ($548M) from `01_price-and-capital-structure.md` §4, and the GAAP diluted weighted-average share count (2,914M) as the disclosure-clean per-share basis.

| Multiple | Applied Peer Multiple | Implied EV ($M) | Implied Price/Share | vs Current Price ($153.94) |
|---|---:|---:|---:|---:|
| **NTM EV/EBITDA — quality-adjusted (primary, base case)** | **11.5x** | **574,952** | **$148.70** | **−3.4%** |
| LTM EV/EBIT — peer median (raw, 10-name) | 21.7x | 485,755 | $118.10 | −23.3% |
| LTM EV/EBITDA — peer median (raw, 10-name) | 17.4x | 530,596 | $133.49 | −13.3% |
| NTM EV/Revenue — peer median (raw, 10-name) | 6.08x | 543,206 | $137.79 | −10.5% |
| NTM Forward P/E — peer median (raw, 10-name) | 23.82x | n/a (direct P/E) | $191.75 | +24.6% |

Equity-value arithmetic for the EV-based rows: Implied Equity = Implied EV − Net Debt ($136,143M) − Preferred Equity ($4,954M) − Minority Interest ($548M); Implied Price = Implied Equity ÷ 2,914M diluted shares. These figures cross-check closely against the CIQ export's own pre-built Implied Valuation tab (which uses 2,880.47M basic shares and lands at, e.g., $214.69 median NTM EV/EBITDA-implied price on the unadjusted 10-name median — consistent with this agent's $211.98 recomputation on the same unadjusted 15.19x multiple using diluted shares instead of basic).

The **quality-adjusted base-case point is $148.70/share (−3.4% versus the current $153.94 price)** — essentially fair value, tilted slightly rich. The **dispersion across raw (unadjusted) peer-median multiples ranges from $118.10 (LTM EV/EBIT) to $191.75 (NTM Forward P/E)** — a wide 62% spread reflecting genuine cross-method disagreement: EV/EBIT is depressed by margin compression already embedded in trailing results, while forward P/E is inflated by Oracle's outsized expected long-term EPS growth relative to peers (see §4 PEG discussion). This dispersion is shown, not averaged away, per CLAUDE.md §16.

## 6. Relative Read

Oracle is neither clearly cheap nor clearly expensive versus peers — the answer flips depending on which slice of the peer set is used, and that dependency is itself the finding. Against the full ten-name Capital IQ set (skewed upward by Palantir, Snowflake and CrowdStrike), Oracle screens at a meaningful 20–23% discount on forward EV/EBITDA and forward P/E; against the cleaner, functionally-comparable named-competitor subset (Salesforce, Microsoft, Adobe, Workday, SAP — all named directly in Oracle's own 10-K), that discount mostly disappears and flips to roughly in line to a modest premium, particularly on revenue multiples where Oracle's lower gross margin mechanically inflates EV/Sales. The gap is only partially warranted: Oracle's above-peer-median EBITDA margin and well-above-peer expected EPS growth argue for a premium, but its Total Debt/EBITDA (5.0x, roughly 4.5–6x the peer median depending on the cut), its eroding, at-or-below-cost-of-capital return on capital, and its deeply negative FCF yield (−5.3%, versus a peer group of still-cash-generative mature SaaS names) argue the other way and should carry more weight per this engine's standing leverage discipline. The quality-adjusted base-case peer-multiple-implied value is **$148.70/share (−3.4% vs the current $153.94 price)**, with a dispersion range of **$118.10 to $191.75** across individual peer-median multiples — this is a fair-value-to-slightly-rich read on relative multiples, not a margin-of-safety case, and it should be triangulated against the intrinsic-DCF and own-history modules before any conclusion on mispricing.



---

## valuation / 04_intrinsic-dcf.md

_Source: `04_intrinsic-dcf.md`_

# Intrinsic DCF — ORCL

Reporting standard: US GAAP. Currency: USD (millions, except per-share). Fiscal year end: May 31 (FY2026 = year ended May-31-2026). Business type: **Operating** (SaaS/subscription-software hybrid with a genuinely capital-intensive cloud-infrastructure arm), per the Business-Type Method Map in `MODULE_RULES.md` and `00_valuation-data-triage.md` §3 — a standard **FCFF DCF** is the correct primary method; no EV bridge suppression or DDM/NAV substitution applies. Because Oracle's own external-dependency read scores the AI-infrastructure "industrial cycle" **High** dependency (`business-model/10_external-dependency.md` §1) and business-quality scores cyclicality 38/100 (`business-model/07_business-quality.md` §1), this report voluntarily applies the Cyclicality Gate's terminal-margin discipline (peer-normal + own-prior-trough benchmarking) even though ORCL is not formally classified "Commodity/cyclical" under the Method Map — a conservative choice, stated explicitly.

**Terminal-trigger note (read before §5).** `business-model/09_moat.md` §5 states the moat trajectory is **eroding** ("Return on capital vs. cost of capital has moved the wrong way for four consecutive years"), and `business-model/07_business-quality.md` scores industry rate-of-change/disruption risk **33/100** (≤40). Both conditions in the §5 declining-perpetuity trigger fire. Per the trigger, this report builds a **second, labelled runoff/structural-impairment terminal** alongside the standard Gordon terminal (§5) — it is a disclosed bear-case lens, not a replacement for the base case.

## 1. FCF Base & Normalizations

Base year: **FY2026** (ended May-31-2026).

| Item | Base-Year Value | Normalization Applied | Source |
|---|---:|---|---|
| Revenue | $67,357M | None | `earnings/01_historical-financials.md` §1; FY26 10-K |
| GAAP Operating Income (EBIT) | $20,606M (30.6% margin) | None — this is the GAAP figure; the CIQ "EBIT" figure used elsewhere in the pool ($22,385M) excludes restructuring charges and is NOT used as the DCF base | `earnings/01_historical-financials.md` §4; Q4 FY26 Earnings Press Release, GAAP-to-non-GAAP reconciliation, p.4 |
| CFO | $31,977M | None | `earnings/01_historical-financials.md` §1 |
| Capex (net cash) | $55,663M (82.6% of revenue) | None | `earnings/01_historical-financials.md` §1 |
| **FCF, reported (CFO − Capex)** | **−$23,686M** | Not the headline figure — see below | `earnings/01_historical-financials.md` §1 |
| **FCF, normalized (§15)** | **−$28,328M** | CFO stripped of a $4,642M FY2026 unearned-revenue customer-prepayment surge (large AI/GPU contracts where "the customer prepaid Oracle... or supplied the GPUs") — a real, disclosed, but unusually large one-off cash mechanic, not steady-state operating cash generation | `earnings/06_earnings-quality.md` §1, "Normalised operating FCF" table |
| Normalized effective tax rate | **19.9%** (vs 12.6% GAAP reported) | Company-disclosed non-GAAP tax rate; strips stock-based-compensation tax benefits, intangible amortization, restructuring, the FY2021 legal-entity-realignment deferred-tax benefit, and the FY2026 One Big Beautiful Bill Act deferred-tax remeasurement | FY26 10-K, Note 12 (Income Taxes); Q4 FY26 Earnings Press Release, footnote 5. **This is the SAME canonical rate `business-model/09_moat.md` §3 uses for its NOPAT/ROIC test — this DCF reconciles to it rather than deriving an independent rate.** |

**Why FY2026 reported/normalized FCF is not usable as a steady-state DCF starting point.** FY2026 capex jumped 162% YoY ($21,215M → $55,663M) on the AI-infrastructure build-out, turning FCF sharply negative even as CFO grew 53.6% — `00_valuation-data-triage.md` §5 explicitly flags that this DCF "must build a normalized FCF base and flag the capex cycle explicitly rather than headline the negative figure or silently smooth it away." Rather than picking one normalized "steady-state" FCF figure (there is no steady state mid-cycle), this report builds an **explicit multi-year forecast** (§2, §4) that starts from the −$23,686M / −$28,328M FY2026 anchor, continues the guided FY2027 capex ramp (worsening FCF further near-term), and lets capex intensity decay back toward a depreciation-matched steady state over the forecast — the capex cycle is modeled explicitly, not averaged away.

## 2. Forecast Assumptions

Explicit forecast horizon: **8 years (FY2027–FY2034)**, chosen so the AI-infrastructure capex ratio (currently 82.6% of revenue) has room to decay back toward a depreciation-matched steady state before the terminal year — a shorter window would force an artificially abrupt capex step-down. FY2027 revenue and EPS are company-guided; every other cell beyond FY2027 is this agent's own analyst assumption, informed by, but **deliberately more conservative than**, management's own long-term outlook (see note below).

| Assumption | FY27 | FY28 | FY29 | FY30 | FY31 | FY32 | FY33 | FY34 | Terminal | Source / Basis |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| Revenue growth % | 33.6 | 24.0 | 18.0 | 14.0 | 11.0 | 9.0 | 7.0 | 5.5 | 3.5 | FY27: **company-guided** ($90,000M point guide, Q4 FY26 Earnings PR). FY28–FY34: **analyst assumption** — a decelerating path, NOT management's own stated 31% CAGR FY25–FY30 (Q4 FY26 investor deck, slide 15, per `earnings/02_revenue-drivers.md` §7) |
| GAAP EBIT margin % | 27.0 | 26.0 | 28.0 | 31.0 | 33.0 | 34.0 | 35.0 | 35.5 | 33.0 | **Analyst assumption**, informed by management's qualitative guidance that FY27 gross margin "will step down due to timing for the ramp-up of our data center projects," with infrastructure margin to "improve rapidly" once data centers hit full contracted revenue (Q4 FY26 transcript, CFO Maxson, per `earnings/03_margin-drivers.md` §3) |
| Gross margin % (for AP/COGS calc only) | 61.0 | 58.0 | 60.0 | 63.0 | 66.0 | 68.0 | 69.0 | 69.5 | 68.0 | **Analyst assumption** |
| Tax rate % (normalized) | 19.9 | 19.9 | 19.9 | 19.9 | 19.9 | 19.9 | 19.9 | 19.9 | 19.9 | **Company-disclosed** normalized rate, held flat (FY26 10-K, Note 12) |
| Capex (% of revenue) | 77.8 | 55.0 | 40.0 | 28.0 | 20.0 | 15.0 | 12.0 | 10.0 | 19.1* | FY27: **company-guided** (≈$70B net cash capex ÷ $90B guided revenue, Q4 FY26 transcript, CFO Maxson). FY28–FY34: **analyst assumption**, decaying toward a D&A-matched steady state. *Terminal capex is NOT simply set equal to D&A — see the financeable-growth fix in §5 |
| D&A (% of revenue) | 17.0 | 21.0 | 21.0 | 18.0 | 15.0 | 12.0 | 10.5 | 10.0 | 10.0 | **Analyst assumption** — mirrors the FY26–27 capex ramp with a 1–2 year depreciation lag (6-year useful life on data-center equipment, FY26 10-K PP&E note), then decays as capex growth slows |
| DSO (days) | 51 | 51 | 51 | 51 | 51 | 51 | 51 | 51 | 51 | Held flat at the FY2026 level — `earnings/06_earnings-quality.md` §3 flags DSO as "Flat — no >10% YoY move" |
| DPO (days) | 140 | 120 | 95 | 70 | 55 | 48 | 44 | 43 | 43 | **Analyst assumption** — FY2026 DPO (127.6 days) is capex-vendor-financing-driven, not an ordinary trade-payables stretch (`earnings/06_earnings-quality.md` §3); modeled to rise slightly further as the FY27 capex ramp peaks, then mean-revert to the FY2024 pre-surge level (42.9 days) as the buildout matures |

**Working capital scales with revenue/COGS, not a flat absolute.** Net working capital is built each year as `AR (DSO/365 × Revenue) − AP (DPO/365 × COGS)` — a days-of-sales approach using the DSO/DPO figures from `earnings/06_earnings-quality.md` §3 (inventory is excluded: it is immaterial and no longer separately disclosed by Oracle, per that report). This is NOT a flat ₹/$ absolute held constant.

**Why the base case is more conservative than management's own long-term outlook, stated with numbers.** Management's own long-term outlook — "31% revenue CAGR FY25–FY30" (Q4 FY26 investor deck, slide 15) — implies FY2030 revenue of roughly **$221B** off the FY2025 base of $57,399M. This report's base case instead reaches **$150,106M by FY2030**, a ~21.2% CAGR from the FY2025 base — meaningfully below management's guide. This is a deliberate, evidence-based choice, not an oversight: `business-model/09_moat.md` §5 finds the moat trajectory **eroding** (return on capital below cost of capital for four straight years) and `business-model/07_business-quality.md` scores industry rate-of-change/disruption risk 33/100 (≤40, a Filter-5 condition per CLAUDE.md §24). Per Core Principle 6 of `MODULE_RULES.md` ("when evidence is thin or methods conflict, default to the lower fair value and say why"), this report does not adopt management's own aggressive multi-year growth target as the base case.

## 3. Discount Rate (WACC)

| Component | Value | Source |
|---|---:|---|
| Risk-free rate | 4.65% | Web: 10-year US Treasury yield, Aug-13-2026 (tradingeconomics.com), indicative/unverified, labelled |
| Equity-risk premium | 4.42% | Web: Aswath Damodaran, implied ERP for the S&P 500, Jul-1-2026 estimate, unverified |
| Beta (5-year) | 1.72 | `Oracle Corporation NYSE ORCL Public Company Profile.rtf`, "Beta 5Y"; cross-checked against `Company Comparable Analysis Oracle Corporation.xls`, Operating Statistics tab, ORCL row — both pool-sourced and identical |
| Cost of equity (CAPM) | 12.25% | Computed: 4.65% + 1.72 × 4.42% |
| Pre-tax cost of debt | 4.98% | **Own computed** — principal-weighted average coupon across all FY2026 debt instrument tranches (senior notes, commercial paper, term loans, finance & operating lease liabilities), from `Financials_Annual.xls`, Capital Structure Details tab, FY2026 instrument list (sourced from FY26 10-K, Note 6/12–13) |
| Tax rate (for debt shield) | 19.9% | Same normalized rate as NOPAT (§1) |
| After-tax cost of debt | 3.99% | Computed: 4.98% × (1 − 0.199) |
| Preferred dividend rate | 6.50% | Series D Mandatory Convertible Preferred Stock coupon; `01_price-and-capital-structure.md` §2 |
| Equity weight (market value) | 72.01% | Market cap $443,424.2M ÷ total capital $615,810.2M |
| Debt weight (market value, book proxy) | 27.19% | Total debt $167,432.0M (lease-inclusive, canonical per `01_price-and-capital-structure.md` §4) ÷ total capital |
| Preferred weight | 0.80% | Preferred carrying value $4,954.0M ÷ total capital |
| **WACC** | **9.96%** | Computed — see formula below |

**Formula (pinned, not eyeballed):**

`WACC = w_e·k_e + w_d·k_d·(1 − t) + w_p·k_p`

- `k_e` (CAPM) = risk-free rate + beta × equity-risk premium = 4.65% + 1.72 × 4.42% = **12.25%**
- `k_d·(1−t)` = 4.98% × (1 − 0.199) = **3.99%**
- `w_e`, `w_d`, `w_p` are market-value weights of equity/debt/preferred (sum to 1); market cap, total debt, and preferred carrying value are all taken verbatim from `01_price-and-capital-structure.md` (the canonical anchor — no substitution)
- The `(1 − t)` term is the debt tax shield: interest is tax-deductible, so debt effectively costs less than its stated coupon.

**Executed WACC blend (Python):**

```
ke = rf + beta*erp = 0.0465 + 1.72*0.0442 = 0.122524   -> 12.2524%
kd_pretax = 0.0498 (own computed, principal-weighted across FY26 debt tranches incl. leases)
kd_at = 0.0498*(1-0.199) = 0.038990 -> 3.8990%... (printed: 3.9890%, see below)
E=443424.2  D=167432.0  P=4954.0  TOT=615810.2
we=0.7201  wd=0.2719  wp=0.0080
WACC = we*ke + wd*kd_at + wp*kp = 0.7201*0.122524 + 0.2719*0.03989 + 0.0080*0.065
WACC = 0.088230 + 0.010847 + 0.000523 = 0.099594  ->  9.9594%
Check: kd_at (3.99%) <= WACC (9.96%) < ke (12.25%) ?  True
```

**Sanity bounds (MODULE_RULES Gate 4).** `after-tax k_d (3.99%) ≤ WACC (9.96%) < k_e (12.25%)` — holds. This is a US mega-cap; `rf + 1.4 × ERP` = 4.65% + 1.4 × 4.42% = **10.84%**, and Oracle's CAPM cost of equity (12.25%) sits above that line — the trigger for requiring a specific, cited beta justification. That justification is satisfied: beta = 1.72 is Oracle's own disclosed 5-year beta (pool-sourced, `Public Company Profile.rtf`), not an assumed or inflated figure, and Oracle's leverage (net debt/EBITDA 4.46x, `01_price-and-capital-structure.md` §5) and revenue concentration in a handful of AI-infrastructure counterparties (`business-model/10_external-dependency.md` §5) are genuine, evidenced reasons for an above-market beta, not an unexplained override.

**Cross-check against the moat module's cost-of-capital estimate.** `business-model/09_moat.md` §3 independently estimates WACC at ~11.2% (using rf=4.7%, ERP=5.0%, beta=1.72, kd≈4.25% after-tax, weights ~77%/23%). This report's own build (9.96%) differs by **~1.24pp** — within the ~2pp reconciliation tolerance in MODULE_RULES Gate 4, so no dual-WACC grid is mandatory. The gap is driven mainly by the ERP input (4.42% here, web-dated Jul-2026, vs 5.0% there) and the debt-cost/weighting detail, not a beta or business disagreement. The §7 sensitivity grid's WACC+1% column (10.96%) already brackets close to the moat module's 11.2% estimate, so the grid's dispersion covers both readings without a separate grid.

## 4. Free Cash Flow Forecast & Discounting

**FCFF definition used:** `FCFF = NOPAT + D&A − Capex − ΔNWC` (Gate 1, second definition) — used because this is a forward multi-year model built from explicit income-statement and balance-sheet assumptions, not a single trailing year. The FY2026 base-year anchor above reconciles to the preferred `CFO − Capex` definition (§1).

| Year | Revenue | EBIT | NOPAT | Capex | ΔWC | FCF | Discount Factor (mid-year, t) | PV of FCF |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| FY27 | 89,989 | 24,297 | 19,462 | 70,011 | −2,308 | −32,943 | 0.9537 (t=0.5) | −31,416 |
| FY28 | 111,586 | 29,012 | 23,239 | 61,372 | 1,071 | −15,771 | 0.8674 (t=1.5) | −13,678 |
| FY29 | 131,672 | 36,868 | 29,531 | 52,669 | 4,506 | 7 | 0.7889 (t=2.5) | 6 |
| FY30 | 150,106 | 46,533 | 37,273 | 42,030 | 5,633 | 16,630 | 0.7174 (t=3.5) | 11,928 |
| FY31 | 166,618 | 54,984 | 44,042 | 33,324 | 4,422 | 31,289 | 0.6524 (t=4.5) | 20,410 |
| FY32 | 181,613 | 61,748 | 49,461 | 27,242 | 2,989 | 41,023 | 0.5933 (t=5.5) | 24,336 |
| FY33 | 194,326 | 68,014 | 54,479 | 23,319 | 2,157 | 49,407 | 0.5395 (t=6.5) | 26,655 |
| FY34 | 205,014 | 72,780 | 58,297 | 20,501 | 1,389 | 56,908 | 0.4906 (t=7.5) | 27,921 |

D&A is not shown as its own column above (table follows the REPORT STRUCTURE's literal column set) but is embedded in the FCF build: FCF = NOPAT + D&A − Capex − ΔWC, with D&A of $15,298M / $23,433M / $27,651M / $27,019M / $24,993M / $21,794M / $20,404M / $20,501M respectively (§2 D&A% × revenue). ΔWC ("ΔNWC" in the formula) is shown with its cash-flow sign already applied (i.e., this is `−ΔNWC` as it enters the FCF sum — a positive number in this column is a cash inflow).

**Working-capital sign — checked, not assumed.** NWC is built as `AR − AP` each year (§2). FY2026A NWC = **+$1,421M** (AR $9,467M − AP $8,046M). In FY2027, the guided capex ramp pushes DPO up further (140 days) while gross margin compresses (COGS rises as a share of revenue), so modeled NWC **falls to −$888M** — a genuine cash **release** (ΔNWC = −$2,308M), which correctly **ADDS** to FCF (subtracting a negative ΔNWC = adding cash): FY27 FCFF = 19,462 + 15,298 − 70,011 − (−2,308) = **−32,943**, confirmed by direct calculation. From FY2029 onward, as DPO reverts toward its FY2024 pre-surge level (43 days, below DSO's 51 days) while revenue keeps growing, NWC turns positive and keeps rising (to +$21,279M by FY34) — each year's *rising* NWC is now a cash **use** (ΔNWC positive, subtracted). This is the opposite mechanical pattern from a classic negative-working-capital business releasing cash as it grows — here, growth first releases cash (while DPO > its steady-state level, i.e. during the capex-financed vendor-terms stretch) and later absorbs cash (once DPO reverts below DSO) — and the sign in every row above was read off the actual modeled ΔNWC path, not assumed from a "growth releases cash" or "growth absorbs cash" default.

**Sum of PV of explicit FCFs: $66,163M** (executed calculation below).

**Executed discounting, PV sum, and terminal-value snippets (Python):**

```
>>> pv_explicit = [fcff[i] * (1+WACC)**-(i+0.5) for i in range(8)]
[-31416, -13678, 6, 11928, 20410, 24336, 26655, 27921]
>>> sum(pv_explicit)
66163

>>> df_tv = (1+WACC)**-7.5   # same mid-year factor as FY34 (year 8)
0.4906
>>> pv_tv = TV_fixed * df_tv    # TV_fixed from the financeable-growth-adjusted Gordon calc, §5
276309

>>> EV = sum(pv_explicit) + pv_tv
342472
>>> equity_value = EV - net_debt - minority - preferred
342472 - 136143 - 548 - 4954 = 200827
>>> per_share = equity_value / shares_disclosure_clean   # 2,914M
200827 / 2914 = 68.92
```

## 5. Terminal Value

**Discounting convention: mid-year (t − 0.5), stated and used throughout** — Oracle's cash flows (subscription billings, RPO conversion, capex outlays) arrive roughly evenly through each fiscal year, not in a lump at year-end, so mid-year discounting is used for both the explicit FCFs and the terminal value (the terminal value is discounted at the same t=7.5 factor as FY34's own cash flow, consistent with the underlying perpetuity cash flows also arriving mid-year).

### 5a. Standard Gordon-growth terminal (the base case)

`TV = FCFF_{n+1} / (WACC − g) = FCFF_FY34 × (1+g) / (WACC − g)`, where FCFF_{n+1} is the first cash flow after the FY2034 explicit forecast and g is the perpetual nominal growth rate.

- **g = 3.5%** (nominal) — below WACC (9.96%) by 6.46pp, comfortably clear of the "WACC − g under ~1–2pp is unreliable" threshold, and at/under a reasonable long-run US nominal-GDP growth proxy (~4%).
- Terminal-year assumptions: EBIT margin **33.0%** (a step DOWN from FY34's 35.5%, not a peak-chasing assumption), D&A 10.0% of revenue, gross margin 68.0%, DSO 51 / DPO 43 days, tax 19.9%.
- **Terminal-margin benchmarking (Cyclicality-Gate discipline, applied voluntarily — see header note).** Peer-normal anchor: SAP's LTM EBIT margin is 28.8% and AWS's segment operating margin is 35.4–39.4% (`business-model/09_moat.md` §3) — Oracle's 33.0% terminal margin sits between these two, reflecting a blend of its still-shrinking high-margin legacy annuity and its maturing, AWS-like infrastructure business. Own-prior-trough anchor: Oracle's own FY2023 GAAP EBIT margin (27.4%, `earnings/01_historical-financials.md` §1) is the company's own worst recent year — the 33.0% terminal sits above that trough but below FY2026's non-GAAP margin (42.9%), i.e. it is NOT a peak-chasing assumption.

**Financeable-growth cross-check (MODULE_RULES Economic Consistency Gate 2) — run, and it FAILED on the first pass, so the terminal capex assumption was corrected, not the growth rate.**

```
Reinvestment rate = (Capex - D&A + ΔNWC) / NOPAT
Implied growth = ROIC × Reinvestment rate
```

First pass (terminal capex naively set = terminal D&A, i.e. net capex reinvestment ≈ 0): Reinvestment rate = 0.66%, ROIC assumed = WACC = 9.96% (no persistent excess return — see ROIC-drift note below), Implied growth = **0.07%**, vs modeled terminal g of 3.5% — a **3.43pp gap**, far above the ~1.5pp threshold. This is a real inconsistency: a business cannot grow revenue 3.5%/year forever while making zero net new capital investment (capex exactly offsetting depreciation implies a flat physical capacity base). Per Gate 2, the fix applied here is to **quantify and correct the bridge** rather than merely lower g: solving `reinvestment rate = g / ROIC = 3.5% / 9.96% = 35.1%` for the required net reinvestment gives **terminal capex = 19.1% of revenue** (vs the naive 10.0%) — i.e., Oracle's terminal state still requires meaningful net capacity expansion (capex running ~9pp of revenue above D&A) to sustain 3.5% growth, which is economically sensible for a data-center-heavy infrastructure business and is NOT the same as assuming capex simply equals D&A forever.

```
>>> reinvestment_req = g_term / WACC = 0.035 / 0.09959 = 0.3514
>>> required_net_reinvestment = 0.3514 * NOPAT_T = 0.3514 * 56,088 = 19,710
>>> capex_T_fixed = 19,710 + D&A_T(21,219) - ΔNWC_T(370) = 40,560   (19.11% of Rev_T)
>>> FCFF_T_fixed = NOPAT_T(56,088) + D&A_T(21,219) - capex_T_fixed(40,560) - ΔNWC_T(370) = 36,377
>>> TV = FCFF_T_fixed / (WACC - g) = 36,377 / (0.09959 - 0.035) = 563,167
```

**ROIC-drift note (Gate 3).** Terminal ROIC is set equal to WACC (9.96%), i.e. **no persistent excess return** is assumed in the base case. This is deliberate: `business-model/09_moat.md` finds Oracle's current computed ROIC (8.5–10.5%) already sits at or modestly below its own ~11.2% WACC estimate, and explicitly labels the moat trajectory "eroding" — there is no evidence basis for assuming Oracle earns returns above its cost of capital in perpetuity.

- **Terminal value (undiscounted): $563,167M**
- **PV of terminal value: $276,309M**
- **Terminal value as % of total EV: 80.7%** — **flagged: terminal-dominated, low-confidence** (>75% threshold). Per Gate 5, an exit-multiple cross-check is added below.

### 5b. Exit-multiple cross-check (required — TV > 75% of EV)

`TV = terminal EBITDA × exit multiple`. Terminal EBITDA (EBIT_T $70,023M + D&A_T $21,219M) = **$91,241M**.

- **Implied exit multiple from the Gordon TV above:** $563,167M / $91,241M = **6.17x** EV/EBITDA. For a mature, GDP-growth (3.5%), at-cost-of-capital (ROIC=WACC) business with no further re-rating catalyst, a mid-single-digit-to-6x multiple is plausible (comparable to a mature infrastructure/utility-like asset) — not an absurd cross-check failure, but toward the low end of anything in Oracle's own peer set today.
- **Direct exit-multiple estimate:** applying **9.0x** EV/EBITDA (near the low end of the peer NTM EV/EBITDA range — Salesforce 10.9x, Microsoft 15.4x, peer-set low 8.0x, `Company Comparable Analysis Oracle Corporation.xls`, Trading Multiples tab — chosen low because the terminal-year business has decelerated to GDP-like growth and earns no excess return) to terminal EBITDA gives **TV = $821,173M** (undiscounted), **PV = $402,895M**.
- Under the exit-multiple basis: EV = $66,163M + $402,895M = **$469,058M**; equity value = $469,058M − $136,143M − $548M − $4,954M = **$327,413M**; per share (2,914M shares) = **$112.36**.
- **Cross-check read:** the two terminal methods bracket a wide per-share range ($68.92 Gordon vs $112.36 at 9.0x exit) — this is itself evidence that the terminal-dominance flag (§5a) is real, and the DCF's fair value is highly sensitive to which terminal lens is trusted more. Neither number should be read as more "true" than the other; both are shown.

### 5c. Declining-perpetuity / runoff terminal (structural-impairment lens — REQUIRED by the moat-erosion + rate-of-change triggers; NOT the base case)

Both triggers in the MODULE_RULES §5 rule fire: `business-model/09_moat.md` §5 states the moat trajectory is **eroding**, and `business-model/07_business-quality.md` scores rate-of-change/disruption risk **33/100** (≤40, RF-BQ-005). Per the rule, this second terminal is built and shown alongside the base, on the same nominal basis as the rest of this DCF (no real-rate substitution):

- **g = 1.5%** nominal — at/below current US inflation, representing a fading, non-recovering trajectory (a true multi-year declining path would trend this further toward zero/negative; this single-period Gordon approximation is the disclosed proxy for that trend).
- **Terminal EBIT margin = 22.0%** — BELOW Oracle's own FY2023 GAAP trough (27.4%), reflecting a scenario where the legacy switching-cost annuity has fully eroded as a share of the business and OCI has become a fully commoditized, price-competed infrastructure line with no margin protection.
- **Terminal ROIC = 7.0%** (below WACC — a genuinely value-destructive reinvestment profile, consistent with a moat that has fully eroded rather than merely stabilized at cost of capital).

```
Rev_r = 205,014 × 1.015 = 208,089
EBIT_r = 208,089 × 0.22 = 45,780;  NOPAT_r = 45,780 × (1-0.199) = 36,669
D&A_r = 208,089 × 0.10 = 20,809
Reinvestment rate = g/ROIC = 0.015/0.07 = 0.2143;  required net reinvestment = 0.2143×36,669 = 7,858
Capex_r = 7,858 + D&A_r(20,809) - ΔNWC_r(-2,010) = 30,676
FCFF_r = 36,669 + 20,809 - 30,676 - (-2,010) = 28,812
TV_runoff = 28,812 / (0.09959 - 0.015) = 340,589   (undiscounted)
PV(TV_runoff) = 340,589 × 0.4906 = 167,104
EV_runoff = 66,163 + 167,104 = 233,267
Equity_runoff = 233,267 - 136,143 - 548 - 4,954 = 91,622
Per-share_runoff = 91,622 / 2,914 = $31.44
```

**This runoff terminal ($31.44/share) is the structural-impairment / permanent-moat-loss scenario that feeds `07_scenario-and-fair-value`'s structural-reset bear case and the master synthesizer's CLAUDE.md §24 Kill Criteria review — it does NOT replace the base-case intrinsic value below.** The base case (§6) remains the Gordon-growth build (§5a).

## 6. DCF Output

| Step | Value |
|---|---:|
| PV of explicit FCFs (FY27–FY34) | $66,163M |
| + PV of terminal value (Gordon, base) | $276,309M |
| **= Enterprise value** | **$342,472M** |
| − Net debt (strict basis, per `01_price-and-capital-structure.md` §5) | $136,143M |
| − Minority interest | $548M |
| − Preferred equity (carrying value) | $4,954M |
| **= Equity value** | **$200,827M** |
| ÷ Diluted shares (disclosure-clean default, GAAP weighted-average) | 2,914M |
| **= Intrinsic value per share (base case)** | **$68.92** |
| (alternative: ÷ 2,965.7M fully-diluted estimate, per `01` §2) | $67.72 |
| vs current price ($153.94, Aug-13-2026, pool-verified) | **−55.2%** (DCF value sits 55.2% below the current price) |

For reference (not the base case): exit-multiple terminal (§5b) → **$112.36/share**; runoff/structural-impairment terminal (§5c) → **$31.44/share**.

## 7. Sensitivity Grid (per-share intrinsic value, base Gordon terminal, financeable-growth-consistent)

WACC across columns, terminal growth down rows. Every cell re-solves the §5a financeable-growth identity (terminal capex adjusts with g and WACC so the reinvestment rate always ties to `g/ROIC`) — this is why the grid's g-sensitivity is more muted than an unconstrained Gordon model would show: raising g without raising terminal reinvestment would violate Gate 2, so the grid does not let it.

| | WACC −1% (8.96%) | WACC (9.96%) | WACC +1% (10.96%) |
|---|---:|---:|---:|
| g +0.5% (4.00%) | $89.50 | $69.38 | $53.15 |
| g (3.50%) | $88.96 | $68.92 | $52.76 |
| g −0.5% (3.00%) | $88.41 | $68.46 | $52.37 |

No cell approaches `WACC − g ≤ 0` (the closest is WACC−1%/g+0.5%: 8.96%−4.00%=4.96pp, still comfortably positive) — no NM cells required.

**Executed sensitivity-grid snippet:**

```
def full_valuation(WACC_, g_):
    pv_expl = sum(fcff[i]*(1+WACC_)**-(i+0.5) for i in range(8))
    rev_t = rev[-1]*(1+g_); ebit_t = rev_t*0.33; nopat_t = ebit_t*(1-0.199)
    da_t = rev_t*0.10; cogs_t = rev_t*(1-0.68)
    ar_t = 51/365*rev_t; ap_t = 43/365*cogs_t; nwc_t = ar_t-ap_t; dnwc_t = nwc_t-nwc[-1]
    reinvest = g_/WACC_; net_req = reinvest*nopat_t
    capex_t = net_req+da_t-dnwc_t
    fcff_t = nopat_t+da_t-capex_t-dnwc_t
    tv = fcff_t/(WACC_-g_); df = (1+WACC_)**-7.5
    ev_ = pv_expl + tv*df
    return (ev_-net_debt-minority-preferred)/2914
# g=3.50%, WACC=8.96%/9.96%/10.96% -> $88.96 / $68.92 / $52.76   (matches table above)
```

## 8. Intrinsic Read

The base-case intrinsic value is **$68.92/share** (Gordon-growth terminal, 2,914M disclosure-clean diluted shares), and the sensitivity grid brackets that point in a **$52.37–$89.50** range (WACC ±1%, g ±0.5%) — a dispersion driven almost entirely by the WACC axis (the g axis is deliberately muted by the financeable-growth constraint enforced in every cell). That base sits **55.2% below** the current price of $153.94; a mechanically-different but methodologically valid terminal choice (a 9.0x exit-multiple cross-check instead of the Gordon formula) pushes the same model to $112.36/share — still below price, but far closer — which is itself the finding: **the single assumption this DCF is most sensitive to is not the growth rate, it is which terminal-value lens is trusted (Gordon-perpetuity-at-cost-of-capital vs a peer-multiple exit), followed closely by WACC.** This wide DCF-to-price gap is not this module's place to resolve — it is the raw material for `05_reverse-dcf` (which inverts this same WACC and FCF base to solve for what growth the current price actually implies) and for `07_scenario-and-fair-value`'s triangulation against the multiples-based methods; per `MODULE_RULES.md`'s Scenario Construction Policy, DCF is a minority-weighted cross-check against the multiples methods for an operating company with usable forward estimates, not the primary driver of the headline fair value.

**Partial-data cap.** Only FY2027 revenue and EPS are company-guided; every assumption from FY2028 onward (margins, capex decay, D&A, working-capital days, and all terminal assumptions) is this agent's own analyst construction, built deliberately more conservative than management's own stated long-term growth outlook given moat-erosion and rate-of-change evidence (§2). Combined with the >75% terminal-value share of EV (§5a), intrinsic-DCF confidence for this run should be treated as **capped, not high-conviction** — consistent with MODULE_RULES Score-Cap rules for a terminal-dominated DCF (valuation confidence max 60) and for a self-built, largely un-guided multi-year forecast.



---

## valuation / 05_reverse-dcf.md

_Source: `05_reverse-dcf.md`_

# Reverse DCF — What's Priced In — ORCL

Reporting standard: US GAAP. Currency: USD (millions, except per-share). Fiscal year end: May 31 (FY2026 = year ended May-31-2026).

**Price-state check.** `01_price-and-capital-structure.md` records price-state **`pool-verified`** ($153.94, Aug-13-2026, delayed NYSE quote, Capital IQ pool export, corroborated against the prior-day close and the vendor's own day-change arithmetic). This agent can run.

**Method note.** This report inverts the SAME model as `04_intrinsic-dcf.md` — same WACC (9.96%), same 8-year explicit forecast structure (FY27–FY34), same terminal growth rate (3.5% nominal), same mid-year discounting convention, same net debt/minority/preferred bridge. It was rebuilt line-for-line in Python and cross-checked against 04's own printed outputs (EV, PV of explicit FCFs, PV of terminal value, FY34 revenue all reconcile to 04's figures within rounding) before being used to solve backwards. Where 04's own model structure makes a lever ill-posed (raw FCF CAGR — see §2), that is stated explicitly rather than forced.

## 1. Inputs

| Input | Value | Source |
|---|---:|---|
| Current price | $153.94 (Aug-13-2026, pool-verified) | `01_price-and-capital-structure.md` §1, §7 |
| Enterprise value (target, canonical lease-inclusive) | $584,464.2M | `01_price-and-capital-structure.md` §4, §7 |
| Net debt (strict) / Minority / Preferred | $136,143M / $548M / $4,954M | `01_price-and-capital-structure.md` §5, §7 (same bridge 04 uses) |
| FCF base, FY2026 (reported / normalized) | −$23,686M / −$28,328M | `04_intrinsic-dcf.md` §1 — negative, mid-AI-capex-supercycle (capex 82.6% of revenue); NOT usable as a growing-perpetuity starting point (see §2) |
| NOPAT base, FY2026 (well-posed analog) | $16,505M (GAAP EBIT $20,606M × (1 − 19.9% normalized tax)) | `04_intrinsic-dcf.md` §1 |
| Discount rate (WACC) used | **9.96%** (9.9594%) — CAPM k_e 12.25% (rf 4.65% + β1.72 × ERP 4.42%), after-tax k_d 3.99%, k_p 6.50%, weights 72.0%/27.2%/0.8% E/D/P | `04_intrinsic-dcf.md` §3, taken verbatim (not re-derived) |
| Terminal growth (g) | 3.5% nominal | `04_intrinsic-dcf.md` §5a, taken verbatim |
| Forecast horizon | 8 years (FY2027–FY2034) | `04_intrinsic-dcf.md` §2, taken verbatim |
| Discounting convention | Mid-year (t − 0.5) | `04_intrinsic-dcf.md` §5, taken verbatim |
| Terminal-year construction | Financeable-growth-consistent: terminal ROIC = WACC (no persistent excess return), reinvestment rate = g/ROIC | `04_intrinsic-dcf.md` §5a, taken verbatim |

**Executed replication check (Python):** rebuilding 04's exact revenue/margin/capex/working-capital assumptions at the base-case growth path reproduces EV = $342,472M, PV(explicit) = $66,163M, PV(TV) = $276,309M, FY34 revenue = $205,014M — all matching 04's printed figures to the dollar (rounding aside). This confirms the model was replicated correctly before inverting it.

## 2. Implied Expectations

**What is held fixed vs solved for.** WACC (9.96%), the 8-year forecast structure (margin %, gross margin %, D&A %, DSO/DPO), the terminal margin (33.0%), terminal g (3.5%), and the terminal ROIC=WACC construction are all held fixed at 04's values. The lever solved for is a uniform scaling factor **k** applied to 04's own year-by-year revenue-growth path (FY27–FY34: 33.6%, 24.0%, 18.0%, 14.0%, 11.0%, 9.0%, 7.0%, 5.5%, each × k) — i.e., "how much faster than 04's base case does revenue have to compound, holding everything else in the model the same, to make the model's own EV equal today's $584,464.2M EV." This directly answers "what growth is priced in" using 04's own cost structure, not an independently invented one.

| What the Price Implies | Solved Value | Note |
|---|---:|---|
| Implied FCF CAGR over the horizon | **Not well-defined** | FY2027–FY2028 FCF is negative in both the base case and every solved scenario (the guided AI-capex ramp swamps cash generation in the first two explicit years regardless of growth rate) — a CAGR on a series that changes sign has no meaningful value. Revenue and NOPAT (below) are the well-posed analogs. |
| Implied revenue growth-path scaling factor (k) | **1.53×** 04's own growth path | Solved via `scipy.optimize.brentq`, bracketed [1,2], root at k=1.5270 |
| Implied Revenue CAGR, FY2026→FY2034 (8yr) | **22.6%** | vs 04's own (deliberately conservative) base case of 14.9% over the same 8 years |
| Implied FY2027 revenue growth (the very next print) | **+51.3%** YoY (revenue ≈ $101.9B) | vs management's own FY2027 **guidance** of +33.6% (≈$90.0B) — this is the single nearest-term, most falsifiable number in this report |
| Implied NOPAT CAGR, FY2026→FY2034 (8yr) | **24.9%** | NOPAT base $16,505M → implied FY34 NOPAT $97,679M |
| Implied FY2030 revenue (under the solve) | **$215.5B** | For reference: management's own most-optimistic disclosed long-term outlook (31% revenue CAGR, FY25–FY30, Q4 FY26 investor deck slide 15, per `04_intrinsic-dcf.md` §2) implies FY2030 revenue of ≈$221.4B — the price-implied path sits just below that guide's implied endpoint |
| Implied steady-state (terminal) EBIT margin, holding g=3.5% and the base explicit path (k=1) fixed | **61.9%** | Solved via `brentq`, bracketed [0.55, 0.62]; vs 04's own terminal assumption of 33.0% and vs the highest margin in Oracle's own peer set (Microsoft 46.8% LTM EBIT margin, `business-model/09_moat.md` §3) — this margin has no peer precedent |
| Diagnostic: max EV achievable at g=3.5%, terminal margin=33%, k=1, terminal ROIC → ∞ (zero net reinvestment, the best case the model geometry allows) | **$492.2B EV**, a $92.3B shortfall vs the $584.5B target | Even the theoretical upper bound of this specific terminal construction (no reinvestment at all in perpetuity, which is not economically realistic for a data-center business) falls short of today's price — see §3 |

**Executed solver (Python, `scipy.optimize.brentq`):**
```
def build(k, WACC, g_term=0.035, term_margin=0.33, roic_term=None):
    # replicates 04's exact revenue/margin/capex/WC build, growth[i] = base_growth[i]*k
    ...
def f_k(k): return build(k, WACC_base)[0] - 584464.2
k_sol = brentq(f_k, 1.0, 2.0)   ->  k_sol = 1.527023937424579
EV_check = build(k_sol, WACC_base)[0]  ->  584464.2000000776   (matches target)

def f_margin(m): return build(1.0, WACC_base, term_margin=m)[0] - 584464.2
m_sol = brentq(f_margin, 0.55, 0.62)  ->  m_sol = 0.6190151867371815
```

## 3. Implied vs Achievable

| Implied Requirement | Company History | Earnings-Module Evidence | Achievable? |
|---|---|---|---|
| FY2027 revenue +51.3% YoY | FY2026 actual +17.3% (highest in 5 years); 4yr CAGR FY22–26 = 12.2% | Management's own FY2027 guidance is +33.6% — already Oracle's most aggressive guide in years, driven by OCI's Q4 FY26 +93% YoY. The implied +51.3% requires beating that fresh guidance by ~18 points in the very next print | **No / Stretch** — beating a guide issued weeks ago by that much has no precedent in Oracle's disclosed history |
| Revenue CAGR 22.6%, FY26–FY34 (8yr) | Revenue CAGR FY22–26 (4yr) = 12.2%; EBIT (CIQ) CAGR FY22–26 = 9.0% | `earnings/07_earnings-sensitivity.md` ranks AI-infrastructure customer concentration as the #1 sensitivity, with a modeled **downside** of −$6,937M EBITDA (23% of FY26 EBITDA) and "no disclosed upside mirror of comparable size" (§6) — the earnings module's own asymmetry runs against, not for, sustaining this pace for 8 straight years | **Stretch, leaning No** |
| Terminal EBIT margin 61.9% (holding g=3.5%, ROIC=WACC) | Oracle's own 5-year margin range: 27.4% (FY23 trough) to 33.2% (FY26, CIQ EBIT basis) | No peer in `business-model/09_moat.md` §3 comes close: Microsoft 46.8%, AWS segment 35.4–39.4%, SAP 28.8% — 61.9% exceeds the best margin of any named peer by ~15 points | **No** — no evidence basis anywhere in the pool |
| FY2030 revenue $215.5B (vs management's own 31%-CAGR guide-implied $221.4B) | Management's own guide has already been undershot once: a smooth 31% CAGR from FY2025 ($57,399M) implies FY2026 revenue of ≈$75.2B; actual FY2026 was $67.4B — a ~10% miss against the guide's own implied first-year path | `04_intrinsic-dcf.md` §2 explicitly declined to adopt management's 31% guide as its own base case, citing `business-model/09_moat.md`'s "eroding" moat trajectory (ROIC below WACC for 4 straight years) and `07_business-quality.md`'s 33/100 disruption-risk score | **Stretch** — the one lens where price is closest to something management has actually said, but that guide itself has no delivery track record and was missed in year one |

**Market-ceiling sanity check (revenue-size test, one-directional).** ORCL is an operating business, so this test converts the implied revenue trajectory into an addressable-market read. Splitting the implied FY2030 revenue ($215.5B) into a non-OCI piece (grown at an illustrative 7%/yr from the FY2026 non-OCI base of $49,256M → ≈$64.6B by FY2030 — Inference, not from filings, a simplifying proxy since the pool does not carry a segment-level DCF) leaves an implied OCI/cloud-infrastructure revenue requirement of **≈$150.9B by FY2030**. The global cloud-infrastructure market was ≈$129B **per quarter** (≈$516B/year) in 2026, with the "Big Three" (AWS 28%, Azure 21%, Google Cloud 14%) holding 63% and Oracle holding ≈3% [`business-model/08_competitive-map.md` §3, Web: Synergy Research Group, 2026 — unverified, dated, Level 2]. Growing that market at an aggressive 20%/year for 4 years puts it at ≈$1,070B by FY2030; at a more conservative 15%/year, ≈$902B. Oracle's implied $150.9B of infrastructure revenue would then require a **≈14–17% global cloud-infrastructure market share by FY2030**, up from ≈3% today — a roughly **5–6x share increase in four years**. No hyperscaler has built a comparable share that fast: AWS and Azure each took the better part of a decade or more to reach their current 21–28% shares. This is an illustrative, approximate check (Level 2/3 evidence, segment split is this agent's own proxy, clearly labeled) — it can only make the growth requirement look harder, and it does: it is a **second, independent kill signal** (alongside the 61.9% implied terminal margin) pointing toward "aggressive/unachievable," not a reason to lift the read.

**Read.** Every lens examined — the near-term FY2027 print, the 8-year revenue CAGR, the terminal margin, and the market-share ceiling — points the same direction. The single lens where the price comes closest to something evidenced (management's own 31%-CAGR long-term guide) is itself a guide with zero years of delivery track record, already missed in its own first year, and built on top of a moat the business-model module scores as **eroding** (`business-model/09_moat.md` §5: "Return on capital vs. cost of capital has moved the wrong way for four consecutive years"). The market is pricing in an expectation set with no historical precedent in Oracle's own results and no peer precedent in the industry.

## 4. Robustness

Since terminal value is 80.7% of EV in 04's base case (well above the ~60% trigger), robustness is shown across WACC, the model's true "base" anchor (the FY2027 guided revenue level, since raw FY2026 FCF does not itself feed the multi-year build — see §1), and terminal g.

| Discount Rate | Implied Revenue CAGR (FY26–34) to Justify Price | Implied FY27 growth |
|---|---:|---:|
| WACC −1% (8.96%) | 20.3% | +46.0% |
| WACC (9.96%) | **22.6%** | +51.3% |
| WACC +1% (10.96%) | 24.8% | +56.4% |

| FY2027 Revenue Anchor (the model's real "base") | Required FY2028–34 CAGR | Overall FY26–34 CAGR |
|---|---:|---:|
| Guidance −5% ($85,490M) | 21.9% | 22.5% |
| Guidance (base, $89,989M) | 21.0% | 22.5% |
| Guidance +5% ($94,488M) | 20.2% | 22.6% |

| Terminal g (TV = 80.7% of EV in 04's base case — the ±0.5% check is required) | Implied Revenue CAGR (FY26–34) |
|---|---:|
| g − 0.5% (3.0%) | 22.6% |
| g (3.5%) | 22.6% |
| g + 0.5% (4.0%) | 22.5% |

**Executed robustness solves (Python, same `build()`/`brentq` machinery as §2):** WACC swept at −1%/base/+1% (roots 1.3686 / 1.5270 / 1.6779 on k); FY27 anchor swept ±5% with `build2()` solving k_rest on FY28–34 only; terminal g swept ±0.5% with `f_k_g()`. All four sweeps bracket and solve cleanly (no NM cells).

**Which input dominates.** **WACC is the dominant lever here — the opposite of the more common reverse-DCF pattern.** A 1-point WACC move shifts the implied revenue CAGR by ≈2.2–2.5 points (20.3%→24.8% across the ±1% range, a 4.5-point swing), while a ±5% swing in the FY2027 anchor (the closest analog to a "FCF base" stress for this specific model, since 04's forecast starts from a company-guided FY27 revenue figure, not from FY26 FCF) moves the required subsequent-year CAGR by only ≈1.7 points. Terminal g barely moves the answer at all (≤0.1 point across a full 1-point g range) — this is because 04's own financeable-growth constraint (terminal ROIC = WACC) makes the terminal-value build nearly linear in growth rather than hyperbolic in (WACC−g); 04's §7 sensitivity grid flags the same muting effect. The practical read: this reverse-DCF's "what's priced in" number is most sensitive to how the market is pricing Oracle's risk (WACC/beta), a little sensitive to how the FY27 print actually lands, and almost insensitive to the assumed long-run growth rate — because 04's own terminal construction already strips out most of the g-driven value creation by tying reinvestment to growth at zero excess return.

## 5. What's-Priced-In Read

At $153.94, the market is pricing in roughly a **51% FY2027 revenue beat against Oracle's own just-issued guidance**, sustained into a **22.6% revenue CAGR through FY2034** — a pace 7.6 points above 04's own already-conservative base case (14.9%) and, on the standard Gordon/financeable-growth terminal lens, requiring a **~62% terminal EBIT margin with no peer precedent** (vs. Microsoft's own best-in-class 46.8%). Even the model's theoretical best case (zero net reinvestment in perpetuity) falls $92.3B short of today's EV, and an independent market-share check finds the implied cloud-infrastructure revenue would require Oracle to hold a global market share (≈14–17%) that no hyperscaler has built this fast. This is **aggressive, bordering on unachievable** on the DCF's own terms — the one place it comes close to being merely "very aggressive" rather than "unachievable" is against management's own single most-optimistic long-term guide, a guide with zero years of delivery history that was already missed in year one, sitting on top of a moat `business-model/09_moat.md` independently scores as eroding. If Oracle's FY2027 print (due within the fiscal year ending May-2027) comes in near the guided +33.6% rather than the price-implied +51.3%, that is a direct, near-term falsification of what today's price already assumes.



---

## valuation / 06_sum-of-the-parts.md

_Source: `06_sum-of-the-parts.md`_

# Sum-of-the-Parts — ORCL

Reporting standard: US GAAP. Currency: USD (millions, except per-share). Fiscal year ends May 31 (FY2026 = year ended May-31-2026; FY2027 = year ending May-31-2027).

## 1. Segment Inventory

Oracle reports three ASC 280 operating segments: Cloud and Software, Hardware, and Services [FY26 10-K, Note 13 (Segment Information), p.99–100, via `business-model/03_segment-map.md` §1]. "Margin" below is Oracle's own company-defined segment-profit measure — it includes only the "direct controllable costs" of each business and excludes R&D, G&A, stock-based compensation, amortization of intangibles, restructuring, interest and other non-operating items [FY26 10-K, Note 13, p.100–101, footnote 1].

| Segment | Revenue (FY26) | Segment Margin — company-defined EBIT (FY26) | Margin % | % of Total Segment Margin | Source |
|---|---:|---:|---:|---:|---|
| Cloud and Software | $58,530M | $34,468M | 58.9% | 90.7% | FY26 10-K, Note 13, p.100 |
| Hardware | $3,084M | $2,017M | 65.4% | 5.3% | FY26 10-K, Note 13, p.100 |
| Services | $5,743M | $1,533M | 26.7% | 4.0% | FY26 10-K, Note 13, p.100 |
| **Total (reportable segments)** | **$67,357M** | **$38,018M** | **56.5%** | **100.0%** | FY26 10-K, Note 13, p.100 |

**Denominator definition (Gate 3).** "% of Total Segment Margin" sums to 100% of the $38,018M reportable-segment total — it is **not** 100% of consolidated profit. FY26 audited consolidated GAAP operating income is $20,606M [FY26 10-K / Q4 FY26 Earnings Press Release, "Reconciliation of Selected GAAP Measures to Non-GAAP Measures," p.4, via `earnings/01_historical-financials.md` §4]. The **$17,412M gap** ($38,018M − $20,606M) is a named, disclosed unallocated/corporate bucket — R&D ($10,272M), G&A ($1,618M), segment-level stock-based compensation ($1,618M), other allocations ($395M), amortization of intangibles ($1,671M), and restructuring & other charges ($1,838M) [FY26 10-K, Note 13, p.101 reconciliation table, via `business-model/03_segment-map.md` §3; tie-out: 10,272+1,618+1,618+395+1,671+1,838 = 17,412, reconciling exactly to 38,018−20,606]. This bucket is **not dropped** — see §3–4 for how it is handled.

Segment revenue is fully allocated (no "Other"/Corporate revenue bucket): $58,530M + $3,084M + $5,743M = $67,357M ties to consolidated revenue [FY26 10-K, Note 13, p.100].

**Partial-data rule triggered — effectively single-segment.** Cloud and Software is 86.9% of FY26 revenue and 90.7% of FY26 total segment margin [`business-model/03_segment-map.md` §2], clearing the >85%-of-EBIT threshold in both directions. **Oracle is, in substance, a single-reportable-segment company — SOTP collapses to the consolidated read**, rather than a forced three-way breakup. Hardware and Services are shown below only as a scale check (they are non-core, low-growth-to-shrinking adjuncts per `business-model/03_segment-map.md` §2), and the $17,412M corporate/unallocated bucket is capitalized-consistent (netted into the metric used, not dropped) per §3–4.

## 2. Segment Multiples & Comparables

| Segment | Metric Used | Period Basis | Multiple Applied | Named Comparable | Comparable's Multiple | Source |
|---|---|---|---:|---|---:|---|
| Consolidated (collapsed proxy for Cloud & Software, 90.7% of profit) | Forward consensus EBITDA, $49,996M | **NTM / FY2027** (fiscal year ending May-31-2027) — already nets the $17,412M unallocated corporate bucket, since it is a bottom-up, whole-company forward estimate | 14.95x (low) – 15.43x (high); 15.19x (base, average) | SAP SE (XTRA:SAP) — closest applications-layer economics to Oracle's ERP/SaaS franchise, directly named as a competitor to Oracle Fusion/NetSuite [FY26 10-K, Item 1A Risk Factors]; Microsoft Corp (NasdaqGS:MSFT) — spans BOTH halves of Oracle's dominant segment (Azure = direct OCI infrastructure rival; Dynamics 365 = applications rival), also directly named [FY26 10-K, Item 1A Risk Factors] | SAP: NTM TEV/Forward EBITDA 14.95x; MSFT: NTM TEV/Forward EBITDA 15.43x | `Company Comparable Analysis Oracle Corporation.xls`, Trading Multiples tab, data as of 2026-08-13 |
| Hardware (scale check only — see caveat) | Segment margin, $2,017M (FY26) | **Trailing (LTM/FY26)** — not structurable on a forward basis: Oracle discloses no segment-level forward guidance or consensus for Hardware, and states it "does not track assets for each business" [FY26 10-K, Note 13, p.100] | 16.98x (TTM EV/EBITDA) | Hewlett Packard Enterprise (HPE) — enterprise servers/storage/engineered-systems economics match Oracle's Hardware business (Oracle Engineered Systems, servers, storage); HPE is named directly alongside ORCL's other 10-K competitors as a hardware rival | 16.98x TTM EV/EBITDA | Web: valueinvesting.io, HPE valuation page, as of 2026-08-14 (unverified, dated) |
| Services (scale check only — see caveat) | Segment margin, $1,533M (FY26) | **Trailing (LTM/FY26)** — not structurable on a forward basis (no segment forward guidance/consensus disclosed) | 7.45x (TTM EV/EBITDA) | Accenture plc (ACN) — asset-light IT consulting/implementation-services economics match Oracle's Services business (consulting + customer success services, personnel-cost-driven) [FY26 10-K, Note 13, p.100: "primarily personnel-related expenses...facilities...external contractor expenses"] | 7.45x TTM EV/EBITDA | Web: valueinvesting.io, Accenture valuation page, as of 2026-08-14 (unverified, dated) |

**Why the consolidated forward metric, not a segment-level forward metric, for Cloud & Software.** Oracle guides and consensus estimates revenue, EPS and (implicitly) EBITDA only at the whole-company level [Oracle Q4 FY26 Earnings Press Release, 2026-06-10; `earnings/04_guidance-consensus.md` §2; Capital IQ Estimates Report, Consensus tab] — there is no disclosed or evidenced forward EBIT/EBITDA estimate specifically for the Cloud and Software segment. Per the Forward Basis Hard Rule's "suppress rather than guess" clause, a segment-specific forward SOTP for Cloud & Software is **not structurable** and is not fabricated here. Because Cloud & Software is 90.7% of segment profit, the whole-company forward consensus metric is used as the collapsed proxy instead — and because it is a bottom-up consolidated estimate, it already nets the $17,412M corporate bucket (R&D, G&A, SBC, amortization, restructuring), satisfying Reconciliation Gate 3 without a separate capitalize-and-subtract step.

**Hardware and Services are trailing-only and excluded from the primary sum.** Neither has a forward metric or forward comparable — both are marked *"not structurable on a forward basis — trailing sanity check only."* Their trailing EVs (below) are **not** added to the primary collapsed EV: they are already embedded inside the consolidated forward EBITDA used above (which covers 100% of the company, all three segments plus corporate costs). Adding them again would double-count.

**AWS excluded as a segment comparable.** Amazon Web Services is the most direct economic match for Oracle's cloud-infrastructure (OCI) sub-segment, but AWS is not separately listed — Amazon's consolidated multiples blend a mostly non-software e-commerce/logistics/advertising business and are not a clean OCI comparable [`business-model/08_competitive-map.md` §2, §5; consistent with `valuation/03_relative-valuation-peers.md` §1 exclusion]. AWS's disclosed segment operating margin (39.4% in Q2 2026 [Web, unverified]) is referenced qualitatively only, not as a multiple.

## 3. Segment Valuation

| Segment | Metric Value | Multiple | Segment EV |
|---|---:|---:|---:|
| Consolidated (collapsed — covers Cloud & Software + Hardware + Services + corporate, net of the $17,412M unallocated bucket) | $49,996M (FY2027 consensus EBITDA) | 14.95x – 15.43x (base 15.19x) | $747,440M – $771,438M (base $759,439M) |
| **Gross enterprise value (primary, collapsed)** | | | **$759,439M (base); range $747,440M–$771,438M** |
| Hardware (trailing, scale check — NOT additive) | $2,017M segment margin | 16.98x | ≈$34,249M |
| Services (trailing, scale check — NOT additive) | $1,533M segment margin | 7.45x | ≈$11,421M |

Formula: Segment EV = Metric Value × Multiple. Base case: $49,996M × 15.19x = $759,439M. The Hardware and Services rows total ≈$45.7B combined (≈6% of the primary gross EV) — shown to demonstrate their immateriality (consistent with the single-segment collapse in §1), not summed into the $759,439M line above.

**Scale cross-check on the corporate bucket.** FY26 trailing total segment margin ($38,018M) overstates true consolidated operating profit by 84% relative to audited GAAP operating income ($20,606M) because $17,412M of R&D, G&A, stock-based compensation, intangible amortization and restructuring sit below the segment-margin line (§1). Any segment-multiple SOTP that sums segment-margin-based EVs without netting this bucket materially overstates value — this is exactly why §2–3 value the collapsed business on **consolidated** forward EBITDA (which nets the bucket) rather than summing three segment-margin-based EVs and then trying to capitalize-and-subtract the corporate drag separately.

## 4. Equity Bridge

| Step | Value ($M) |
|---|---:|
| Gross enterprise value (base case) | 759,439 |
| − Capitalized unallocated corporate costs | 0 — already netted in the FY2027 consensus EBITDA metric used above (see §2–3); not a separate deduction (avoids double-counting) |
| − Net debt (strict basis, per `01_price-and-capital-structure.md` §5) | (136,143) |
| − Minority / non-controlling interest (per `01` §4) | (548) |
| − Preferred equity, carrying value (Mandatory Convertible Preferred, per `01` §4) | (4,954) |
| + Equity-method investments | 0 — not separately disclosed/carved out from "Other Long-Term Assets"; per `01` §4, none is excluded from EV |
| − Conglomerate / holdco discount | 0 — none applied. Oracle is not a diversified conglomerate of unrelated businesses; Hardware and Services are small, integrated adjuncts of the same core enterprise-software/cloud franchise (§1), so no diversification/complexity discount is warranted |
| **= Equity value (base case)** | **617,794** |
| ÷ Diluted shares (GAAP diluted weighted-average, per `01` §2, disclosure-clean default — excludes the Mandatory Convertible Preferred, consistent with subtracting its carrying value above rather than if-converting it) | 2,914M |
| **= SOTP value per share (base case)** | **$212.01** |
| Range (low SAP 14.95x / high MSFT 15.43x) | $207.89 – $216.13 |
| vs current price ($153.94, Aug-13-2026, pool-verified — per `01` §1) | **+35.0% to +40.4% (base +37.7%)** |

Net debt: Oracle is **net debt**, not net cash, throughout — no add-back sign issue applies. Cash quality was checked and cleared in `01` §4 (no financial-subsidiary trapped-cash pool; restricted cash immaterial); no haircut carried into this bridge.

**Reference / internal-consistency check (not part of the SOTP range).** Applying Oracle's own current NTM EV/EBITDA multiple (11.65x, same Trading Multiples export) to the identical $49,996M forward EBITDA base gives EV $582,453M → equity $440,808M → **$151.27/share**, essentially reproducing today's $153.94 price (within ~2%, consistent with normal quote-date/rounding). This confirms the bridge mechanics are internally consistent and isolates the entire SOTP-vs-price gap to one question: **does Oracle's dominant segment deserve a peer (MSFT/SAP-level, ~15x) multiple, or does the market's own ~11.65x multiple already reflect a warranted discount?** See §5.

## 5. SOTP Read

Oracle clears the single-segment threshold (Cloud and Software = 86.9% of revenue, 90.7% of profit), so there is no hidden multi-business breakup value to unlock here — this SOTP mechanically **collapses to the consolidated read**, and the two non-core segments (Hardware, Services) are worth a combined ≈$45.7B on a trailing basis, about 6% of the primary gross EV, confirming they are not where Oracle's value sits.

The mechanical named-comp exercise (Cloud & Software's economics proxied by the whole-company forward EBITDA, multiplied by SAP's and Microsoft's forward EV/EBITDA) produces a base case of **$212.01/share (+37.7% vs the $153.94 price)**, with a peer-driven range of $207.89–$216.13. That number should be read as a **peer-parity ceiling, not a base fair value**: it implicitly assumes Oracle's dominant segment deserves the same multiple as MSFT (net debt roughly 0.6x EBITDA) and SAP (roughly 0.8x), when Oracle itself carries net debt/EBITDA of 4.46x and generated **negative** free cash flow of −$23.7B in FY26 [`earnings/01_historical-financials.md` §1; `valuation/03_relative-valuation-peers.md` §2, §4]. `valuation/03_relative-valuation-peers.md` independently derived a leverage-and-moat-erosion-adjusted "quality-adjusted" multiple of 11.5x on the **same** $49,996M forward-EBITDA base and arrived at $148.70/share (−3.4% vs price) — essentially fair value. Per CLAUDE.md Core Principle 3 (warranted vs observed) and Core Principle 6 (default to the lower value when methods conflict), that quality-adjusted reading is the more defensible one: **the raw peer-multiple SOTP overstates fair value by roughly 40 percentage points because it prices Oracle's balance sheet as if it were MSFT's or SAP's, which it is not.** The market's own ~11.65x multiple (which reproduces the current price almost exactly, per §4) is not obviously irrational — it already looks close to what the leverage and negative-FCF gap versus true peers would warrant.

One further flag on the primary metric itself: FY2027 consensus EBITDA of $49,996M implies a jump from FY26's 45.3% actual EBITDA margin to ~56.0% — a roughly 1,070bp margin expansion in a single year, driven by the assumption that OCI's infrastructure margin "improves rapidly" once data centers reach full contractual revenue [`earnings/04_guidance-consensus.md` §2]. If that margin instead holds flat at FY26's 45.3%, forward EBITDA falls to ≈$40,445M and the same 15.19x base multiple implies ≈$162/share instead of $212 — a reminder that the primary SOTP number is highly sensitive to a margin-expansion assumption embedded in consensus, not yet realized in a reported quarter.

**Bottom line:** the segment breakdown does not surface a masked high-value business the consolidated multiple is hiding — Cloud and Software already IS effectively the whole company. The real question this SOTP surfaces is a quality-of-multiple question, not a mix question: once leverage and free-cash-flow quality are priced in (consistent with `03`'s independent read), Oracle's SOTP-implied value sits close to, not far above, the current price.



---

## valuation / 07_scenario-and-fair-value.md

_Source: `07_scenario-and-fair-value.md`_

# Scenario & Fair Value — ORCL

Reporting standard: US GAAP. Currency: USD (millions, except per-share). Fiscal year end May-31. All anchors (price, shares, net debt, EV) copied verbatim from `01_price-and-capital-structure.md`: current price **$153.94** (Aug-13-2026, 02:26 PM GMT-5, delayed NYSE quote, Capital IQ pool export, **price-state: pool-verified**, 1 trading day old — no staleness cap applies); diluted shares (per-share fair-value basis) **2,914M** (GAAP diluted weighted-average, the disclosure-clean default `02`/`03`/`04`/`06` all use); net debt (strict basis, canonical) **$136,143M**; minority interest **$548M**; preferred equity (carrying value) **$4,954M**.

## 1. Method Summary

| Method | Fair / Implied Value (per share) | Confidence | Weight | Why This Weight |
|---|---:|---|---:|---|
| Own-history multiples (02) | $151.27 (EV/EBIT LTM, CIQ-basis median reversion) | Medium-High | 40% | Clean EV-based read (avoids the EBITDAR-basis reconciliation and the GAAP-P/E one-off-gain distortion); Oracle sits close to its own 5-year median on the least-distorted multiples. Carries majority weight per the Multiples-First Hard Rule for an operating company with usable forward estimates. |
| Relative / peers (03) | $148.70 (NTM EV/EBITDA, quality-adjusted 11.5x) | Medium | 40% | A genuine, evidenced peer set (10 CIQ names, cross-checked against Oracle's own 10-K-named competitors), with an explicit, cited downward adjustment for leverage (Total Debt/EBITDA 5.0x vs peer median 1.1x) and moat-erosion evidence. Carries majority weight alongside `02` per the same hard rule. |
| Intrinsic DCF (04) | $68.92 (Gordon-growth terminal, base case) | Low-Medium (capped — terminal value 80.7% of EV, >75% threshold) | 20% | Valid cross-check, not primary, per the Multiples-First Hard Rule (04+06 combined capped at ≈≤⅓; 06 = 0%, so 04 alone sits at 20%, inside the cap). Weighted meaningfully — not zero — because three independent lenses (this DCF, `05` reverse-DCF, and `business-model/09_moat.md`'s eroding-trajectory finding) converge on the same caution, which is real evidence, not an artifact of one terminal-value choice. |
| Reverse-DCF (05) | (implied, not a value) — price implies a 22.6% FY26–34 revenue CAGR, a +51.3% FY27 print (vs. management's own +33.6% guide), and a 61.9% terminal EBIT margin with no peer precedent | High (mechanics); "aggressive, bordering on unachievable" (conclusion) | n/a | Cross-check only — informs whether the base case is achievable, does not enter the weighted blend. |
| Sum-of-the-parts (06) | $212.01 (raw peer-parity ceiling, base case) | Low as a fair-value input | 0% (zero-weighted) | Cloud & Software is 86.9% of revenue / 90.7% of segment profit — Oracle is effectively single-segment, and `06` itself states its own base case "should be read as a peer-parity ceiling, not a base fair value" and that the leverage/negative-FCF-adjusted read (`03`'s $148.70) "is the more defensible one." Per this module's own producer-flagged "collapsed / single-segment sanity-check only" language, it is excluded from the weighted base point and shown in the football field only. |

Weights sum to 100% across the value-producing, business-type-valid methods (`02`, `03`, `04`); `06` is zero-weighted per its own single-segment collapse note (Segment/SOTP Rule) and shown for transparency only. `05` is a cross-check, never a weighted value.

**Multiples-first applied.** ORCL is an **Operating** business (Business-Type Method Map) with a usable NTM/FY2027 consensus (41-analyst) EPS/EBITDA base and both an own-history (`02`) and peer (`03`) multiple set, so `02`+`03` carry the majority weight (80% combined) and `04` is capped as a minority cross-check (20%, within the ≈≤⅓ ceiling since `06`=0%). No stated reason elevates `04` or `06` to primary here — Oracle is not a multi-segment conglomerate (`06` §1 confirms the single-segment collapse) and a usable forward multiple exists (so the "no usable forward multiple" exception does not apply).

## 2. Triangulation & Reconciliation

### Method football field (full dispersion, not narrowed)

| Method | Value / Range | Confidence | Weight | Why this weight |
|---|---:|---|---:|---|
| 02 Own-history multiples | **$151.27** base; EV-based dispersion $140.47–$174.72 (medians→means); GAAP-P/E rows $181.08–$196.12 shown but flagged unreliable (one-off-gain-inflated EPS base), not used in the base or the dispersion | Medium-High | 40% | See §1 |
| 03 Peers | **$148.70** quality-adjusted base; raw peer-median dispersion $118.10–$191.75 | Medium | 40% | See §1 |
| 04 Intrinsic DCF | **$68.92** Gordon-terminal base; sensitivity grid $52.37–$89.50 (WACC±1%, g±0.5%); exit-multiple cross-check **$112.36** (9.0x terminal EV/EBITDA); declining-perpetuity/structural-impairment terminal **$31.44** (labelled bear input, not the base) | Low-Medium (capped ≤60, terminal-dominated) | 20% | See §1 |
| 06 SOTP | **$212.01** raw peer-parity-ceiling base; range $207.89–$216.13 | Low (as a fair-value input) | 0% | See §1 |

**Headline finding — the spread is the story.** Across the three weighted methods alone, `02` ($151.27) sits **119.5% above** `04`'s DCF base ($68.92) — more than triple the 40% Reconciliation-Gate tolerance. Including the (zero-weighted, but shown-for-transparency) `06` SOTP ceiling ($212.01), the full football field runs from **$68.92 to $212.01**, a **207.7% high-to-low spread**. This is not averaged away.

**Executed base-point calculation (Python):**
```
w02, w03, w04 = 0.40, 0.40, 0.20
base = 0.40*151.27 + 0.40*148.70 + 0.20*68.92
     = 60.508 + 59.480 + 13.784
     = 133.77  ->  BASE-CASE FAIR VALUE = $133.77/share
```

**Reconciliation judgement.** The multiples methods (`02`, `03`) are trusted more for the CENTRAL tendency — both use forward/trailing metrics the market actually prices off, and both independently land within 2 points of each other ($151.27 vs $148.70) despite being built from completely different data (own 5-year history vs a 10-name peer set). But the DCF's much lower read is not dismissed as an outlier: it is corroborated by two other independent lenses in this same run — `05`'s reverse-DCF finds the current price already requires a 51.3% FY27 revenue beat against Oracle's own just-issued +33.6% guide and a 61.9% terminal EBIT margin with no peer precedent (best peer: Microsoft 46.8%), and `business-model/09_moat.md` independently verdicts the moat trajectory **eroding** (return on capital 12.35%→8.22% over four years, now at or below the ~11.2% estimated cost of capital). Three independent methods pointing the same direction is evidence, not noise, so `04` is weighted at 20% (not zero, not equal-weighted) — enough to pull the blended base ($133.77) **below** both multiples methods individually, which is the honest output of the policy-mandated weighting, not a silent drag: the departure from a pure 02/03 average (~$150.0) to $133.77 is disclosed here and its cause (the `04`/`05`/`09` convergence) is named, not hidden. `06`'s $212.01 ceiling is excluded from the blend entirely (see §1) but is shown because it usefully brackets the OPTIMISTIC end of the football field — it is close to the Bull case derived independently in §3 below, a cross-check that the Bull level is not arbitrary.

**Base-case fair value (the point): $133.77/share.**

## 3. Bull / Base / Bear Fair-Value Levels

All cases use NTM/FY2027 consensus EBITDA ($49,996M, the same base `02` and `03` reference) as the forward metric, and the own-history NTM EV/EBITDA band from `02` §2 (min 10.46x, mean 14.71x, median 13.73x, max 24.30x, current 11.65x) as the multiple anchor. Metric deltas for Bull/Bear are drawn from `earnings/07_earnings-sensitivity.md`'s named variables, deliberately excluding rows flagged there as mechanically overlapping (customer-concentration and OCI/RPO-conversion-pace are "two lenses on the same underlying exposure" per that report's §5 — only one of the pair is stacked per case) and excluding operating-expense leverage (which `earnings/07` §5 notes moved in the OPPOSITE direction to gross margin in FY26 itself, so stacking both in the same direction is not disciplined). Horizon default: 12 months (through ~Aug-2027) for Bull/Base/Bear-cyclical; the structural reset carries its own 24–36 month horizon (see below).

| Case | Fair Value / Share (point) | Forward Metric (NTM EBITDA) | Multiple | Horizon | What Must Be True |
|---|---:|---:|---:|---|---|
| Bull | **$212.67** | $54,384M (base +$3,159M gross-margin recovery, reversing FY26's 469bps step-down, + $1,229M from OCI/RPO conversion running ~15% above current run-rate) | 14.0x (expanded toward the own-history NTM mean of 14.71x, vs 11.65x today) | 12 months (~Aug-2027) | Gross margin snaps back toward FY25 levels as data-center capacity hits full contracted revenue (management's own "improves rapidly" claim materializes); the four >$8bn AI-infrastructure customers (AMD, Meta, NVIDIA, OpenAI, TikTok, xAI) keep converting RPO on or ahead of schedule with no pullback; the market re-rates the stock back toward its 5-year mean multiple on growing confidence the AI-capex build is paying off, and the moat-erosion trend (ROIC vs WACC) begins to stabilize rather than widen. Cross-checks closely against `06`'s independently-derived $212.01 peer-parity-ceiling read. |
| Base | **$133.77** | $49,996M (consensus, unchanged — the weighted blend, not a re-derived metric; see §2) | 10.63x (implied by the blended value; below today's actual 11.65x and near the own-history NTM band floor of 10.46x) | 12 months (~Aug-2027) | Consensus NTM EBITDA is roughly achieved, but the market continues to price Oracle's leverage (Net Debt/EBITDA 4.46x, ~4.5–6x the peer median) and its confirmed-eroding return on capital at a discount to its own recent multiple and to peers — i.e., no further de-rating beyond what the DCF and reverse-DCF evidence already argues for, but no re-rating either. |
| Bear — cyclical trough (bear_cyclical) | **$94.62** | $39,900M (base −$6,937M customer/counterparty concentration pullback [one or more of the four >$8bn named customers cuts contracted RPO ~20%] − $3,159M further gross-margin compression [FY27 margin steps down another 469bps beyond FY26's already-lower exit level, consistent with management's own guided, unquantified step-down]) | 10.46x (compressed to the own-history NTM band floor — no expansion beyond the disclosed 5-year range, since real distress evidence exists but is not extreme enough to justify going below the historical floor) | 12 months (~Aug-2027) | A near-term AI-infrastructure demand shock: at least one of the four named mega-customers pulls back materially on contracted capacity (the single largest earnings-sensitivity risk per `earnings/07` §4, with "no disclosed upside mirror of comparable size"), and the FY27 gross-margin step-down management has already flagged qualitatively lands harder than guided. This is a 12-month print-driven miss, not a permanent-impairment scenario. |
| Bear — structural reset (bear_structural) — **HEADLINE BEAR** | **$31.44** | Terminal EBIT margin 22.0% (below Oracle's own FY23 GAAP trough of 27.4%) × revenue base, terminal ROIC 7.0% (below WACC — value-destructive reinvestment), g = 1.5% nominal | Declining-perpetuity DCF (not a metric×multiple construction — see bridge below) | 24–36 months (a multi-year permanent-impairment path, not a 12-month marker) | The moat module's already-**confirmed eroding** trajectory (ROIC 12.35%→8.22% over four straight years, now at/below the ~11.2% estimated cost of capital) does not stabilize: OCI never develops AWS/Azure-level scale or switching-cost economics and becomes a fully commoditized, price-competed infrastructure line with no margin protection, while the legacy software-support annuity (the one part of the business with a real, evidenced moat) keeps shrinking as a share of revenue faster than OCI can build a comparable-margin replacement. |

**Bull/Base/Bear multiple discipline check.** Bull multiple (14.0x) ≥ Base implied multiple (10.63x) ≥ Bear-cyclical multiple (10.46x) — expansion in Bull, compression in Bear, both anchored inside `02`'s own-history NTM band (10.46x–24.30x); metric and multiple move the same direction within each case (both up in Bull, both down in Bear-cyclical). The structural reset is deliberately NOT built on a metric×multiple basis — per the Business-Type Method Map, an impaired terminal DCF is the correct operating-company reset method, not a forced EBITDA×multiple.

**Structural-reset bridge — executed and reconciled to the canonical net-debt anchor (Python):**
```
# Re-verifying 04's declining-perpetuity / runoff terminal (04 sec 5c), business-type-appropriate
# method for an Operating company (impaired FCFF DCF), bridged with 01's canonical STRICT net debt.
pv_explicit_fcf   = 66163      # $M, PV of FY27-FY34 explicit FCFs (same base-case explicit path as 04)
pv_tv_runoff      = 167104     # $M, PV of the g=1.5%, term_margin=22.0%, term_ROIC=7.0% runoff terminal
ev_runoff = pv_explicit_fcf + pv_tv_runoff
#        = 66163 + 167104 = 233267   (EV-based reset -> bridge via 01's canonical net debt)
net_debt, minority, preferred = 136143, 548, 4954   # 01's canonical STRICT basis, subtracted BEFORE /shares
equity_runoff = ev_runoff - net_debt - minority - preferred
#             = 233267 - 136143 - 548 - 4954 = 91622
shares = 2914
price_runoff = equity_runoff / shares
#            = 91622 / 2914 = 31.44   ->  STRUCTURAL-RESET FAIR VALUE = $31.44/share
```
This reconciles exactly to `04_intrinsic-dcf.md` §5c and §6 — no double-subtraction of net debt, since the reset value here is an enterprise value (impaired FCFF), bridged once with the canonical strict net-debt figure.

**Which case is the headline Bear.** `business-model/09_moat.md` §5 states the moat trajectory is **confirmed eroding** (not a bare "No moat proven" verdict — Oracle has a real, evidenced switching-cost moat in its legacy annuity, but the consolidated business's return on capital has moved the wrong way for four straight years). `04_intrinsic-dcf.md` — the DCF whose base case fades terminal ROIC to WACC (no persistent excess return assumed) — IS included in this module's weighted blend (20%, not excluded), so the "keep the reset as an avoid-ruin floor rather than the headline" carve-out does not apply here. Per the graduated billing rule, a confirmed-eroding trajectory with a weighted DCF already reflecting the lost excess return means the structural reset becomes the **headline Bear**, billed as the **worse (lower) of** the two down-legs: structural reset ($31.44) vs cyclical trough ($94.62) → **$31.44 is the headline Bear.** The cyclical trough ($94.62, 12-month) remains a distinct, separately-labelled, fully-computed case above — it is not merged into the headline, and both reach this report on their own terms with their own horizons.

No probabilities are assigned to any case above — that is the master synthesizer's task.

## 4. Margin of Safety & Downside (two separate metrics)

**Executed calculation (Python):**
```
price = 153.94
base  = 133.77
bear_headline = 31.44   # structural reset, the headline Bear per §3
bear_cyclical = 94.62   # shown for context, not used in the headline metric below

implied_upside   = (base - price) / price          # = (133.77-153.94)/153.94 = -0.1310 -> -13.10%
margin_of_safety = (base - price) / base            # = (133.77-153.94)/133.77 = -0.1508 -> -15.08%
downside_to_bear  = (price - bear_headline) / price  # = (153.94-31.44)/153.94  = 0.7958  -> 79.58%
downside_to_bear_cyclical = (price - bear_cyclical) / price  # context only = (153.94-94.62)/153.94 = 0.3854 -> 38.54%
```

| Metric | Value |
|---|---:|
| Current price (Aug-13-2026, pool-verified) | $153.94 |
| Base-case fair value (point) | $133.77 |
| Bear-case fair value — **headline (structural reset, 24–36mo)** | $31.44 |
| Bear-case fair value — cyclical trough (12mo, context) | $94.62 |
| Implied upside to base case = (base FV − price) / price | **−13.10%** |
| **Margin of safety** = (base FV − price) / base FV — the cushion | **−15.08%** (negative — no cushion; price sits above the base-case fair value) |
| **Downside to bear** = (price − bear FV) / price — *inverted, higher = worse* (headline/structural) | **79.58%** |
| Downside to bear (cyclical trough only, context) | 38.54% |

Both metrics require, and have, a **pool-verified** price. Margin of safety and downside-to-bear are two separate numbers reported here — the margin of safety is negative (the stock trades ABOVE this report's base-case fair value, so there is no cushion, not a small one), while downside-to-bear is a large positive (inverted) number precisely because the headline bear reflects the structural-reset path, not a shallow cyclical dip.

## 5. Warranted-Multiple Check

The base case implies a **~10.63x NTM EV/EBITDA** multiple — below today's actual traded multiple (11.65x) and near the floor of Oracle's own 5-year NTM EV/EBITDA range (10.46x–24.30x). This is not a "cheap" read: `business-model/09_moat.md` verdicts a **narrow, eroding** moat (return on capital 8.5–10.5% own-computed, at or modestly below the ~11.2% estimated cost of capital, declining for four straight years), and `business-model/07_business-quality.md` scores capital intensity 12/100 and industry rate-of-change/disruption risk 33/100 (≤40, the CLAUDE.md §24 Filter-5 fast-changing-industry condition) — a business that has not proven it earns above its cost of capital does not warrant a premium multiple, and the base case does not assume one. The management-governance module's §24 Filter 6 (structurally misaligned controlling owner) does **not** trip — founder Larry Ellison (40.21% of vote) is an engaged, value-aligned Executive Chair/CTO, not a value-indifferent controller — so persistent cheapness would not be a value-trap issue here; but the finding runs the OTHER way in this case: the base-case read shows the stock priced **above**, not below, a defensible fair value, so the relevant flag is not "value trap masking cheapness" but "the current price already requires the market's most optimistic, least-evidenced growth assumptions (per `05`'s reverse-DCF: a 51.3% FY27 print vs. a 33.6% guide, and a 61.9% terminal margin with no peer precedent) to be true."

## 6. Fair-Value Read

The base-case fair value is **$133.77/share**, roughly 13% below the current $153.94 price (margin of safety **−15.1%** — no cushion). Bull is **$212.67/share** (+38.2%, requiring sustained mega-customer RPO conversion plus a re-rating back to Oracle's own 5-year mean multiple, and cross-checking closely against `06`'s independent $212.01 SOTP ceiling). The headline Bear is the **structural reset at $31.44/share** (downside-to-bear **79.6%**) — billed as headline rather than the milder cyclical trough ($94.62, −38.5% context case) because `business-model/09_moat.md` **confirms** an eroding moat trajectory and this module's weighted DCF (20% weight, not excluded) already prices in the lost excess-return path. The dominant swing factor between Bull and the headline Bear is not a single input but a converging one: whether Oracle's ~$638bn RPO backlog and its concentrated, four-mega-customer AI-infrastructure bet converts to cash-generative, margin-protected revenue fast enough to reverse four straight years of declining return on capital — or whether it entrenches a permanently lower-margin, more commoditized infrastructure business under a still-shrinking legacy annuity. The method disagreement itself is the headline finding of this report: `02`/`03` (multiples, 80% combined weight) land within 2 points of each other (~$150), while `04`'s DCF (20% weight) sits 119.5% below them and `06`'s raw SOTP (0% weight, shown only) sits 40.4% above them — a 208% high-to-low football field that is corroborated, not contradicted, by `05`'s independent reverse-DCF finding that today's price already requires growth and margin assumptions with no historical or peer precedent.
