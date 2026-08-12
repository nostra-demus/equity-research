# valuation Module Dossier — DHER

> Deterministic, lossless concatenation of every artifact in this module — the module synthesis and every specialist output, in order. Generated mechanically (no LLM rewriting), so nothing is omitted or paraphrased. This is the module's "see everything" tier; the module's decision lives in `99_*-synthesis.md` and the short read in `valuation_memo.md`.

- Generated: 2026-08-12T15:20:31Z
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

# Valuation Module — DHER (Delivery Hero SE) (Synthesis)

## Abstract

DHER is fairly valued at its current, deal-contaminated price: the base-case fair value of €39.65/share sits only 6.6% above the €37.20 price (2026-08-07, pool-verified), a thin margin of safety (6.2%) driven by the own-history multiple, cross-checked by a discounted-cash-flow (DCF) and a sum-of-the-parts (SOTP) breakup that both cluster near €33. Bull is €49.01, base €39.65, bear (12-month operating trough) €18.59 — a 50.0% downside to bear from today's price — while the wider cross-method football field spans €25.10 (own-history) to €79.2 (peer-relative), a +215% disagreement resolved by trusting DHER's own-financials-anchored methods. The price implies roughly 16.5% annual profit growth for seven years, aggressive against a two-year decelerating trend and a "no moat proven" verdict. Against the pre-deal price (€15.73), the same base case implies a 60.3% margin of safety — the market materially undervalued DHER standalone before Uber's still-unpriced tender offer. Verdict: fairly valued, with real deal-completion and convertible-dilution risk layered on top.

## 1. Valuation Verdict

- **Verdict:** Fairly valued
- **Base-case fair value (point, per share):** €39.65 (12-month horizon, FY2026E revenue €15,648.3m × 0.94x EV/Sales)
- **Current price:** €37.20 (2026-08-07, Capital IQ, **pool-verified but deal-contaminated** — Uber Technologies announced an acquisition offer for DHER on 2026-07-16, and no fixed offer price is disclosed anywhere in the data pool; the stock is up >130% from its €15.73 pre-announcement close on 2026-03-26)
- **Bull / Base / Bear fair-value levels (points):** Bull **€49.01** (FY26E revenue €15,957.6m × 1.10x) / Base **€39.65** (€15,648.3m × 0.94x) / Bear, 12-month operating trough **€18.59** (€15,114.1m × 0.55x). A separate, multi-year **structural / avoid-ruin floor of −€2.84/share** exists (declining-perpetuity DCF reset, triggered by "No moat proven" + a ≤40 industry-disruption score) but is demoted below the headline bear per the graduated routing rule — carried as a kill-criteria input, not a 12-month target.
- **Cross-method dispersion (football field, low–high):** Method base-case points span **€25.10** (own-history EV/Sales reversion, `02`) to **€79.2** (peer-relative, quality-adjusted, `03`) — a +215% spread, far beyond the 40% flag threshold. The intrinsic DCF (`04`, €33.31) and SOTP (`06`, €32.59) cluster tightly between them, within 2% of each other. Per-method sensitivity ranges widen further: `04`'s full cross-check spans €6–€54, `06`'s spans €13.23–€56.49, and `03`'s raw (unadjusted) peer median implies €157.9 at the extreme high end.
- Valuation attractiveness /100 *(higher = cheaper)*: **45**
- Margin of safety /100 *(higher = better)*: **38**
- Valuation confidence /100: **55** (capped — see §4)
- Downside risk /100 *(higher = worse)*: **62**
- Data quality /100: **73**
- Overall usefulness /100: **82**
- Dominant valuation method (one line): DHER's own-history EV/Sales reversion (`02`), cross-checked by the intrinsic DCF (`04`) and by SOTP's MENA/talabat direct comparable (`06`) — these three cluster within a tight €25–€33 band and are trusted over the peer-relative read (`03`), which rests on a peer set with no clean scale-and-quality match for DHER.
- What's priced in (one line): At €37.20 the market is pricing roughly 16.5% annual free-cash-flow growth for seven straight years (`05`) — aggressive against a two-year decelerating trend and a "No moat proven" verdict — and this cannot be cleanly separated from an undisclosed Uber deal-completion premium layered on top.
- Biggest valuation risk (one line): Two compounding, unquantified risks sit outside every fair-value level shown — €2,588.4m of convertible-bond dilution (~23% of market cap, conversion terms not in the pool) not netted into any per-share figure, and deal-completion risk: if the Uber offer breaks with no fixed price ever disclosed, the price has historically reverted toward levels below every bull/base/bear level in this report.

## 1A. Module Disconfirmation

- **Strongest bear point:** At €37.20, DHER trades near the top of its own three-year EV/Sales range (86th percentile, `02`), and the reverse-DCF shows the price implies ~16.5% FCF CAGR for seven years — aggressive against a trend that has decelerated for two straight years (+23.7%→+14.4%→+11.3% consensus revenue growth) on a business the moat module scores "No moat proven" (group ROIC 0.8%–1.6% vs. a company-disclosed 10.7%–13.7% cost of capital, a 900–1,700bp gap) [`02_multiples-own-history.md` §3; `05_reverse-dcf.md` §3, §5].
- **Strongest bull point:** MENA (68% of segment Adjusted EBITDA) is valued almost 1:1 off talabat's own public market multiple — the tightest, most direct comparable in this entire report — and the pre-deal price (€15.73) sat *below even the bear-case fair value* (€18.59), meaning the market materially undervalued DHER's standalone prospects before the Uber offer emerged [`06_sum-of-the-parts.md` §5; `07_scenario-and-fair-value.md` §4].
- **Single killer risk:** If the Uber deal breaks (no fixed offer price was ever disclosed in the pool) and the price reverts toward pre-deal levels, or if the rider-cost/employment-classification regulatory variable moves adversely (the company's own disclosed stress test: −€344.5m, ~38% of FY2025 Adjusted EBITDA, with no offsetting pricing mechanism), DHER's leveraged balance sheet (€2,512.8m net debt) turns the structural-reset DCF equity value negative (−€2.84/share) — an avoid-ruin scenario, not merely a lower price target [`04_intrinsic-dcf.md` §5; `07_scenario-and-fair-value.md` §3].
- **Disconfirming evidence already visible:** `03` itself concedes the +215% `02`-vs-`03` method spread is largely "a peer-set composition effect," not a clean mispricing signal — DHER's EV/Sales is close to its two genuinely quality-matched peers (Meituan, Swiggy), and the wide gap comes mostly from including larger, already-profitable, structurally different names (Uber, DoorDash, Prosus) in the median [`03_relative-valuation-peers.md` §4]. Separately, `04`'s mechanically computed WACC (7.45%) diverges 3.25–6.25 percentage points from DHER's own company-disclosed cost of capital (10.7%–13.7%, used in its own goodwill-impairment testing); at the higher, company-disclosed rate, intrinsic value collapses to €6–€15/share — below every fair-value level in this report [`04_intrinsic-dcf.md` §3, §7].

## 2. Specialist Roll-Up

| Specialist | Verdict Line | Biggest Finding |
|---|---|---|
| valuation-data-triage | Sufficient — all five methods can run; no standard partial-data caps triggered | Current price is present and internally consistent but deal-contaminated by the pending Uber offer; fully diluted share count (convertible bonds, ~23% of market cap) is not computable from the pool |
| price-and-capital-structure | Price pool-verified (€37.20, 2026-08-07) but deal-contaminated; EV bridge ties exactly to Capital IQ's own figures | Stock is up >130% from €15.73 (pre-Uber-announcement, 2026-03-26) with no fixed offer price disclosed; €2,588.4m convertible-bond overhang unquantified |
| multiples-own-history | DHER trades at a real premium to its own EV/Sales and P/Book history (+22%/+36% and above the entire range respectively) | The premium tracks the Uber tender timeline, not a fundamentals re-rating — own-history reversion implies €25.10/share, ~33% below current price |
| relative-valuation-peers | DHER trades at a 62–72% EV/Sales discount to the 6-peer median, only partly warranted by quality | Quality-adjusted (Meituan+Swiggy) base case implies ≈€79.2/share, a +215% disagreement with `02` driven mainly by peer-set composition, not a clean signal |
| intrinsic-dcf | Base-case intrinsic value €33.31/share, 10.5% below current price but 111.8% above pre-deal price | Terminal-dominated (78.1% of EV); at DHER's own disclosed 10.7%–13.7% cost of capital (vs. 7.45% computed), value falls to €6–€15/share |
| reverse-dcf | At €37.20 the market prices ~16.5% FCF CAGR for 7 years; at €15.73 it priced only ~5.5% | The 16.5%/5.5% gap is the clearest quantification in this pool of how much of the re-rate is deal-completion odds vs. standalone fundamentals |
| sum-of-the-parts | SOTP base case €32.59/share (12.4% below current price; +107.2% above pre-deal price) | MENA/talabat, valued almost 1:1 off a direct public comp, is the strongest anchor; a €4,830m capitalized unallocated-corporate-cost drag is larger than net debt and easy to miss |
| scenario-and-fair-value | Base €39.65, bull €49.01, bear €18.59 (12-month); structural avoid-ruin floor −€2.84 | Margin of safety at current price is thin (+6.2%); at the pre-deal price it was 60.3%, with the bear-case fair value sitting above the pre-deal print entirely |

## 3. Reconciliation

**Headline disagreement, not averaged away.** `02` (own-history multiples, €25.10) and `03` (peer-relative, €79.2) disagree by +215% — more than five times the 40% flag threshold. This synthesis follows `07`'s reconciliation: `02`, `04` (€33.31), and `06` (€32.59) are all anchored, directly or indirectly, in DHER's own reported financials and segment economics, and cluster tightly within a €7–8 band of each other. `03` alone is driven by an external, disputed judgment call — how much of the raw 6-peer EV/Sales premium (inflated by Uber, DoorDash, and Prosus, three structurally different, larger, profitable-or-holding-company businesses) should be excluded as not comparable to DHER. `03`'s own report concedes this is "a mixed verdict, not a clean read either way." The policy-mandated multiples-majority weighting (67% to `02`+`03`, split 45%/22% to reflect this reliability judgment; 33% to `04`+`06`, split 15%/18%, at the ≈⅓ combined cap) produces the mechanically weighted base point of €39.6–€39.65/share, cross-validated independently by a direct forward-metric × multiple build (€39.65). This module trusts DHER's own-financials-anchored cluster over the peer read for this company, because DHER has no clean scale-and-quality-matched public comparable at the group level.

A second, smaller reconciliation item: `04`'s mechanically computed WACC (7.45%) diverges materially (3.25–6.25pp) from DHER's own company-disclosed cost of capital (10.7%–13.7%, used in its own IAS 36 goodwill-impairment testing). Per Gate 4, this is not treated as a discretionary override (the computed figure was not adjusted) — instead `04` widened its sensitivity grid to span both, and the base case here is reported at the computed WACC while flagging that the disclosed-cost-of-capital range would pull intrinsic value down to €6–€15/share.

## 4. Score Cap Application

| Cap Trigger | Applied? (Y/N) | Affected Score | Final Cap |
|---|---|---|---|
| No pool-verified price (price-state `indicative` or `none`) | N | — | N/A — price is pool-verified (€37.20, 2026-08-07); deal-contamination is a flagged caveat on every price-relative read, not a price-state cap |
| No consensus / forward estimates | N | — | N/A — full consensus, guidance, and multiples data present |
| No peer data | N | — | N/A — 6-name usable peer set (10-name gross set) present |
| Only one valuation method usable | N | — | N/A — 4 value-producing methods ran (own-history, peers, DCF, SOTP) |
| No cash flow AND DCF is only method | N | — | N/A — cash flow statement present; DCF is one of four methods |
| SOTP not possible for multi-segment | N | — | N/A — SOTP ran in full (5 segments, MENA at 68.3% under the 85% single-segment threshold) |
| Methods disagree >40% unreconciled | **Y** | Valuation confidence | **max 55** — `02` vs `03` diverge +215%; `07` reconciled the gap explicitly with stated reasoning, but per Reconciliation Gate 6 the magnitude still ties to the score cap |
| Terminal value >75% of DCF EV | **Y** | Valuation confidence | max 60 — `04`'s terminal value is 78.1% of EV (superseded by the more restrictive 55 above) |
| Misaligned controlling owner (RF-OWN-004, §24 Filter 6) | N | — | N/A — management-governance found no current controlling owner (dispersed, single-class ownership); RF-OWN-004 is a **forward watch item** only, tied to whether the Uber tender closes without a full squeeze-out — not a current trigger [`management-governance/04_ownership-and-insider-behavior.md`, Finding 04-014] |

Most restrictive applicable cap: **valuation confidence capped at 55.**

## 5. Fair-Value Summary

DHER's base case (€39.65/share) is a 12-month EV/Sales (FY2026E revenue × 0.94x) build, driven by DHER's own multiple history (`02`) as the largest weighted input, cross-checked by an intrinsic DCF (`04`, terminal-dominated at 78% of EV) and by SOTP's MENA/talabat direct comparable (`06`) — both of which land within a few percent of each other and a few percent below the multiples-weighted base. The current price (€37.20) implies the market expects roughly 16.5% annual free-cash-flow growth for seven straight years (`05`), which the earnings-module evidence (a two-year decelerating growth trend, a "No moat proven" verdict, and Street estimates cut ~30% over the trailing year) does not clearly support on a standalone basis — some of that gap is very likely an undisclosed Uber deal-completion premium rather than a standalone re-rating, but this module cannot separate the two without a disclosed offer price. The margin of safety at the current price is thin (+6.2%, base FV vs. price), while the downside to the 12-month operating bear case is real (50.0% loss if both the deal breaks and the operating bear materializes) — two genuinely different reads that should not be collapsed into one number. This is not a classic value-trap setup in the ownership sense (no misaligned controlling owner is currently in place), but it is a value-trap risk on operating grounds: the base case credits FY2025's first-ever year of GAAP profitability as durable, when `07`'s own warranted-multiple check flags that this inflection is unproven and could reverse if margin gains prove to be a fragile, marketing-spend-funded one-off rather than a structural improvement.

## 6. What Would Change The Valuation Verdict?

| Current Verdict | What Would Make It Cheaper | What Would Make It More Expensive | Data Needed |
|---|---|---|---|
| Fairly valued | A disclosed Uber offer price materially above €39.65/share with high completion odds; a durable FY2026 margin beat (Adjusted EBITDA above the €935m guidance midpoint) confirming the profitability inflection is structural, not a one-off; resolution of the Glovo Spain contingent liability (€440–770m) at the low end, removing a governance-linked tail risk from the bear case | The Uber deal breaking with no replacement bidder, sending the price back toward the €15.73 pre-announcement level; a rider-cost/employment-classification regulatory outcome at or near the disclosed −€344.5m stress case; confirmation that the €2,588.4m of convertible bonds are materially in-the-money, diluting per-share value below every level shown | The disclosed fixed Uber offer price and terms (cash/stock/mix); the six convertible-bond tranches' conversion prices/ratios; the FY2025 audited Annual Report (not yet in the pool, currently sourced from Capital IQ vendor extracts and the earnings-call transcript) |

## 7. Note To The Final Synthesizer

- **Fair-value levels (12-month):** Bull €49.01 / Base €39.65 / Bear (operating trough) €18.59, all built as FY2026E revenue × EV/Sales multiple (1.10x / 0.94x / 0.55x), bridged with fixed net debt (€2,512.8m) and minority interest (€154.2m) per `01`'s canonical anchor. A separate structural/avoid-ruin floor of −€2.84/share exists (multi-year, declining-perpetuity DCF) — carried as a kill-criteria input, not a probability-weighted case, per this module's boundary.
- **Dominant method:** own-history EV/Sales reversion (`02`), cross-validated by intrinsic DCF (`04`) and SOTP's MENA/talabat direct comp (`06`) — these three cluster at €25–€33. **Discount the peer-relative read (`03`, €79.2)** for this company: DHER has no clean scale-and-quality-matched public comparable, and `03` itself attributes most of its wide implied value to a peer-set composition effect, not a clean mispricing signal.
- **What the price implies:** ~16.5% annual FCF growth for 7 years at €37.20 (aggressive; decelerating trend + "No moat proven"), versus only ~5.5% at the pre-deal price of €15.73 (achievable, inside the company's own guided trajectory). The 16.5%-vs-5.5% gap is the cleanest available quantification of how much of the post-announcement re-rate is deal-completion odds versus a standalone fundamentals re-rate — this module cannot separate the two further because no fixed Uber offer price is disclosed in the pool. (Context, unverified: management-governance found a web-sourced, unconfirmed report of a €41.50/share cash offer, ~$14.8bn deal value [Web: Bloomberg/Reuters via Prosus press releases, retrieved 2026-08-12, unverified] — not corroborated in the pool and not used in any figure above.)
- **Margin of safety vs. downside to bear (two separate reads):** at the current price, margin of safety is thin (+6.2%) and downside to the operating bear case is substantial (50.0%). At the pre-deal price, margin of safety was 60.3% and the bear-case fair value (€18.59) sat *above* the pre-deal print (€15.73) entirely — the cleanest evidence that the pre-deal market materially undervalued DHER standalone.
- **Genuine value or value trap:** no ownership-based value-trap trigger applies (RF-OWN-004 not currently triggered — a forward watch item only, tied to whether the Uber tender closes without a full squeeze-out). There IS an operating-quality value-trap risk: the base case credits an unproven, one-year-old profitability inflection over a five-year loss-making history; if that inflection reverses, the multiple this base case assumes (0.94x, above DHER's own 3-year mean of 0.82x) is not warranted.
- **Partial-data caps applied:** valuation confidence capped at 55 (methods disagree +215%, reconciled but the magnitude still triggers the cap per Reconciliation Gate 6; terminal value at 78.1% of DCF EV also caps at 60, superseded by the more restrictive 55). No price-state cap applies — the price is pool-verified, just deal-contaminated (a distinct, separately-flagged issue, not a missing-price condition).
- **Biggest missing data point (single highest-value next request):** the six convertible-bond tranches' conversion prices/ratios (€2,588.4m face, ~23% of market cap) — without them, every per-share fair-value figure in this module is a ceiling, not a fully diluted read, and the dilution risk cannot be quantified rather than merely flagged.
- **Explicit handoff:** the master synthesizer's "Valuation and Peer Mispricing" section should defer to this synthesis. The bull/base/bear fair-value LEVELS here (€49.01 / €39.65 / €18.59, plus the −€2.84 structural floor) are the inputs for the master's probability-weighted scenario model — this module assigns no probabilities to deal completion, to the operating scenarios, or to the structural-reset path; that weighting, together with how much of the current €37.20 price to attribute to deal-completion odds versus standalone fundamentals, belongs entirely to the master synthesizer.

## 8. Simple Summary

- At today's price (€37.20), DHER is roughly fairly valued — the base fair value (€39.65) is only 6.6% above price, not a real bargain and not obviously expensive either.
- Bull €49.01, base €39.65, bear (12-month) €18.59 per share; a separate, worse structural floor of −€2.84/share exists if both a regulatory shock and competitive erosion hit at once with no pricing offset.
- The market is pricing in about 16.5% annual profit growth for seven straight years — a stretch against DHER's own decelerating trend and "no moat proven" business quality.
- The downside is real: a 50% drop to the bear case at current price, plus €2,588.4m of convertible bonds (~23% of market cap) that could dilute per-share value further and are not reflected in any figure here.
- The method to trust most is DHER's own trading history plus its cash-flow-based valuation and its breakup value (they agree with each other); the peer-comparison method reads far richer (€79) but is the least reliable because DHER has no clean, matching public peer.
- This is not a classic value trap from ownership (no misaligned controlling owner), but it could still be one operationally if DHER's brand-new year of profitability turns out to be a one-off rather than a real turn.
- A pool-verified price was available, but it is contaminated by a pending Uber takeover offer with no disclosed price — every "cheap/expensive" read here is partly a bet on whether that deal closes, and on what terms.
- This module is highly useful for the master synthesizer: it triangulates cleanly across four methods, flags the deal contamination and convertible-dilution risk explicitly, and hands over ready-to-use fair-value levels for the probability-weighted scenario work.



---

## valuation / 00_valuation-data-triage.md

_Source: `00_valuation-data-triage.md`_

# Valuation Data Triage — DHER

## 1. File Inventory

| Filename | Type | Period Covered | Last Modified | Valuation Relevance |
|---|---|---|---|---|
| Company Comparable Analysis Delivery Hero SE.xls — Financial Data | Multiples/comps export (tab) | LTM/NTM as of 2026-08-10 (in-doc "As-Of Date") | Drive-sync 2026-08-10 (not authoritative, F23) | High |
| Company Comparable Analysis Delivery Hero SE.xls — Trading Multiples | Multiples export (tab) | As of 2026-08-10 | " | High |
| Company Comparable Analysis Delivery Hero SE.xls — Operating Statistics | Peer/comps export (tab) | As of 2026-08-10 | " | Medium |
| Company Comparable Analysis Delivery Hero SE.xls — Business Description | Peer/comps export (tab) | As of 2026-08-10 | " | Low |
| Company Comparable Analysis Delivery Hero SE.xls — Implied Valuation | Multiples export (tab) | As of 2026-08-10 | " | High |
| Company Comparable Analysis Delivery Hero SE.xls — Valuation Chart | Multiples export (tab) | As of 2026-08-10 | " | Low |
| Company Comparable Analysis Delivery Hero SE.xls — Credit Health Panel | Capital-structure data (tab) | As of 2026-08-10 | " | Medium |
| Company Comparable Analysis Delivery Hero SE.xls — Disclaimer | Other (tab) | n/a | " | Low |
| Delivery Hero SE XTRA DHER Analyst Coverage.rtf | Consensus/estimate export | Current sell-side roster | Drive-sync 2026-08-10 | Medium |
| Delivery Hero SE XTRA DHER Competitors.rtf | Peer/comps export | Recently disclosed (≤2 yrs) | Drive-sync 2026-08-10 | High |
| Delivery Hero SE XTRA DHER Customers.rtf | Other | n/a | Drive-sync 2026-08-10 | Low |
| Delivery Hero SE XTRA DHER Financials.xls — Key Stats | Capital-structure / multiples (tab) | FY2021A–FY2028E; latest capitalization ~2026-Q2 print | Drive-sync 2026-08-10 | High |
| Delivery Hero SE XTRA DHER Financials.xls — Income Statement | Quarterly/annual filing data (tab) | FY2021A–FY2028E | " | High |
| Delivery Hero SE XTRA DHER Financials.xls — Balance Sheet | Capital-structure data (tab) | FY2020A–FY2025A (Dec-31-2025) | " | High |
| Delivery Hero SE XTRA DHER Financials.xls — Cash Flow | Cash flow data (tab) | FY2020A–FY2025A | " | High |
| Delivery Hero SE XTRA DHER Financials.xls — Multiples | Multiples export (tab) | FY2024A–FY2028E | " | High |
| Delivery Hero SE XTRA DHER Financials.xls — Historical Capitalization | Capital-structure data (tab) | Quarterly, 2023-06-30 to 2025-12-31 | " | High |
| Delivery Hero SE XTRA DHER Financials.xls — Capital Structure Summary | Capital-structure data (tab) | FY2023–FY2025 | " | High |
| Delivery Hero SE XTRA DHER Financials.xls — Capital Structure Details | Capital-structure data (tab) | FY2023–FY2025 | " | Medium |
| Delivery Hero SE XTRA DHER Financials.xls — Ratios | Multiples/ratios export (tab) | FY series | " | Medium |
| Delivery Hero SE XTRA DHER Financials.xls — Supplemental | Other financial data (tab) | FY series | " | Low |
| Delivery Hero SE XTRA DHER Financials.xls — Industry Specific | Other (tab) | FY series | " | Low |
| Delivery Hero SE XTRA DHER Financials.xls — Pension OPEB | Other financial data (tab) | FY series | " | Low |
| Delivery Hero SE XTRA DHER Financials.xls — Segments | Segment data (tab) | FY2020–FY2025 (revenue & EBITDA by segment) | " | High |
| Delivery Hero SE XTRA DHER Fixed Income Securities Summary.rtf | Capital-structure / debt data | Outstanding bonds, maturities to 2027+ | Drive-sync 2026-08-10 | Medium |
| Delivery Hero SE, 2025 Earnings Call, Mar 26, 2026.pdf | Transcript | FY2025 results call, 2026-03-26 | Drive-sync 2026-08-10 | High |
| Delivery Hero SE, Q1 2026 Sales_ Trading Statement Call, Apr 30, 2026.pdf | Transcript | Q1 2026, 2026-04-30 | Drive-sync 2026-08-10 | Medium |
| DeliveryHeroSEXTRADHEREstimatesReport.xls — Consensus | Consensus/estimate export (tab) | Data as of ≤2026-08-05 (cross-checked to 2026-07-24 revision log); current FY2026 | " | High |
| DeliveryHeroSEXTRADHEREstimatesReport.xls — Guidance | Consensus/estimate export (tab) | FY2017–FY2026, guidance-vs-actual history | " | High |
| DeliveryHeroSEXTRADHEREstimatesReport.xls — Multiples | Multiples export (tab) | NTM, FY2026–FY2033 | " | High |
| DeliveryHeroSEXTRADHEREstimatesReport.xls — Recent Changes | Consensus/estimate export (tab) | Revision log through 2026-07-24 | " | Medium |
| DeliveryHeroSEXTRADHEREstimatesReport.xls — Revisions | Consensus/estimate export (tab) | Revision history | " | Medium |
| DeliveryHeroSEXTRADHEREstimatesReport.xls — Surprise | Consensus/estimate export (tab) | Historical beat/miss | " | Medium |
| DeliveryHeroSEXTRADHEREstimatesReport.xls — Trends | Consensus/estimate export (tab) | Estimate trend history | " | Low |
| Delivery_Hero_SE-Annual_Report(Apr-25-2025).pdf | Annual filing | FY2024 (audited, published Apr-25-2025) | Drive-sync 2026-08-10 | High |
| Delivery_Hero_SE_-_Form_Annual_Report(Apr-25-2025).pdf | Annual filing (duplicate/alt form of same FY2024 report) | FY2024 | " | High |
| Uber Technologies, Inc., Delivery Hero SE - M&A Call.pdf | Transcript (deal-specific) | M&A call, 2026-07-16 | " | High (materially affects price interpretation) |

No workbook tabs were left as opaque single-file rows: all three `.xls` workbooks (Company Comparable Analysis — 8 tabs; Delivery Hero SE XTRA DHER Financials — 13 tabs; DeliveryHeroSEXTRADHEREstimatesReport — 7 tabs) were extracted tab-by-tab and reconciled against `_pool_extracts/manifest.md` (28 tabs total). `manifest.json` reports 0 extraction failures across all 12 source files — every source is `status: ok`, so nothing is treated as missing on extraction grounds. No `ciq_facts.json` sidecar exists in this run; figures below are this agent's own sourced read of the extracts.

**Material context carried forward, not a data gap:** DHER is the subject of an announced Uber Technologies acquisition offer, discussed on a dedicated M&A call held 2026-07-16. Sell-side Target Price and Recommendation fields show a cluster of large revisions dated 2026-07-16 through 2026-07-24 consistent with re-anchoring to deal terms rather than a fundamentals re-rate (`earnings/04_guidance-consensus.md §1`). Downstream valuation agents must treat the current market price as **deal-contaminated** — it likely reflects the pending offer, not a standalone fundamental read — and flag this explicitly wherever price-relative metrics are computed.

## 1A. External Data

No files exist under `data/DHER/external/`. No external-data rows to report; the sufficiency verdict is unaffected by this absence.

## 1B. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country / exchange | Germany — Frankfurt Stock Exchange / Deutsche Börse XETRA (ticker XTRA:DHER) | `Delivery Hero SE XTRA DHER Financials.xls, Key Stats tab` header; `Company Comparable Analysis...xls` header |
| Filing regime | EU/Germany — Delivery Hero SE is a Societas Europaea registered in Berlin, Germany | `Delivery_Hero_SE-Annual_Report(Apr-25-2025).pdf`, consolidation note: "SHAREHOLDINGS OF DELIVERY HERO SE, BERLIN" |
| Reporting standard | IFRS (as adopted by the EU) | `DeliveryHeroSEXTRADHEREstimatesReport.xls, Consensus tab`: "Acctg. Standard: IFRS"; confirmed in `earnings/04_guidance-consensus.md §1` |
| Reporting currency (and scale) | EUR, millions | `Delivery Hero SE XTRA DHER Financials.xls, Key Stats tab`: "Currency: EUR"; all financial tabs report "In Millions of the reported currency" |
| Fiscal-year end | 31 December (current fiscal year FY2026, FQ2 2026 print due 2026-08-27) | `DeliveryHeroSEXTRADHEREstimatesReport.xls, Consensus tab` header |
| Document language(s) | English (Annual Report, transcripts, all Capital IQ exports) | Direct inspection of extracts |

Delivery Hero SE files a German/EU-regime Annual Report (Board's Report + audited IFRS consolidated financial statements + Notes + Corporate Governance Report + Compensation Report), the local equivalent of a US 10-K under CLAUDE.md §27. No US SEC forms are expected or required for this issuer; none being present in the pool is not a gap.

## 2. Most Recent Sources

| Source Type | Filename | Period / As-of | Age (months, vs. run date 2026-08-12) |
|---|---|---|---|
| Annual filing | Delivery_Hero_SE-Annual_Report(Apr-25-2025).pdf | FY2024 (published 2025-04-25) | ~15.6 |
| Quarterly filing / interim update | Delivery Hero SE, Q1 2026 Sales_ Trading Statement Call, Apr 30, 2026.pdf | Q1 2026 (2026-04-30) | ~3.4 |
| Capital structure / balance sheet | Delivery Hero SE XTRA DHER Financials.xls, Balance Sheet tab | FY2025 (Dec-31-2025) | ~7.4 |
| Consensus / estimate export | DeliveryHeroSEXTRADHEREstimatesReport.xls, Consensus tab | Data as of ≤2026-08-05 | ~0.2 |
| Multiples export | DeliveryHeroSEXTRADHEREstimatesReport.xls, Multiples tab / Company Comparable Analysis, Trading Multiples tab | As of 2026-08-10 | ~0.07 (2 days) |
| Peer / comps export | Delivery Hero SE XTRA DHER Competitors.rtf; Company Comparable Analysis, Financial Data tab | As of 2026-08-10 (comps pricing) | ~0.07 |
| Current price (Capital IQ) | DeliveryHeroSEXTRADHEREstimatesReport.xls, Consensus tab ("Latest Price/Last Close Price") and Company Comparable Analysis, Financial Data tab | EUR 37.18/37.20 (native, XTRA:DHER), as of ≤2026-08-10 | ~0.07 |
| Cash flow statement | Delivery Hero SE XTRA DHER Financials.xls, Cash Flow tab | FY2025 (Dec-31-2025) | ~7.4 |
| Segment data | Delivery Hero SE XTRA DHER Financials.xls, Segments tab | FY2025 (Dec-31-2025) | ~7.4 |

No IBKR screenshot is present in the pool; the current price is sourced from the Capital IQ Estimates Consensus tab and cross-checked against the Company Comparable Analysis workbook's own "Financial Data" tab (native EUR 37.18/37.20 vs. that workbook's USD-converted 43.01 — the latter is a currency-converted figure, "Values converted at today's spot rate," not a separate price). **`01_price-and-capital-structure` should treat this Capital-IQ-sourced price as pool-verified** (not merely indicative/web-sourced), since it is a licensed vendor export, per MODULE_RULES.md source hierarchy #3.

## 3. Valuation Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Current price | Y | Capital IQ Estimates Consensus tab / Company Comparable Analysis Financial Data tab, EUR 37.18/37.20, as of ≤2026-08-10 — but deal-contaminated (see M&A caveat above) | Anchor for market cap, EV, multiples, margin of safety |
| Diluted share count | Partial — basic shares outstanding present (303.7m latest, Key Stats tab); no options/RSU/convertible dilution schedule found in the pool tabs reviewed | Key Stats tab; Historical Capitalization tab (labelled "Dilution: Basic") | Needed for market cap and per-share fair value |
| Dilution data (options/RSUs/convertibles) | N — not found as a standalone schedule in the Capital IQ exports reviewed; Annual Report Notes may carry it but were not exhaustively mined at this triage stage | Not proven from available data | Needed for fully diluted per-share fair value |
| Business type track (Operating / Financial / REIT / Commodity / Holding co.) | Y — Operating (food-delivery/quick-commerce marketplace) | `business-model/02_business-identity.md`: "Valuation norm: FCFF DCF and EV/EBITDA multiples are the applicable general method — no REIT/bank/insurer-style method applies here" | Determines which valuation methods are valid |
| Total debt, cash, minority/preferred | Y | Balance Sheet tab, Capital Structure Summary tab: FY2025 Total Debt €4,625.5m, Cash & ST Investments €2,112.7m, Minority Interest €154.2m, no preferred equity | Needed for the enterprise-value bridge |
| Income statement (LTM or FY) | Y | Income Statement tab; Key Stats tab (FY2025 Revenue €14,059.6m, EBITDA €304.9m, EBIT €93.7m, Net Income −€782.9m) | Earnings/EBITDA base for multiples and DCF |
| Cash flow statement | Y | Cash Flow tab, FY2020–FY2025 | FCF base for DCF and FCF yield |
| Forward estimates (consensus) | Y | Consensus tab (FY2026E Revenue, EBITDA, EPS with 10–14 analysts); Guidance tab (management FY2026 guidance: Revenue growth qualitative, Adjusted EBITDA €910–960m, FCF €200m) — flagged deal-contaminated for Target Price/Recommendation only | NTM/FY multiples and DCF near-term path |
| Historical multiple data | Y | Delivery Hero SE XTRA DHER Financials.xls, Multiples tab (FY2024A–FY2028E TEV/Revenue, TEV/EBITDA, TEV/EBIT, P/BV) | Own-history re-rating read |
| Peer / comps data | Y | Company Comparable Analysis workbook (10 named comps: HelloFresh, Prosus, Deliveroo, Eternal/Zomato, Luckin Coffee, Meituan, Naspers, Ride On Express, Swiggy, Skylark); Competitors.rtf (Uber, DoorDash, Jahez, others) | Relative valuation and SOTP segment multiples |
| Segment-level revenue & EBIT | Y | Segments tab: 5 reportable segments (Asia, MENA, Europe, Americas, Integrated Verticals) with revenue & EBITDA FY2020–FY2025 | Sum-of-the-parts |
| Dividend / buyback data | N — Dividend per Share = "NA" across all periods in Ratios tab; DHER pays no dividend (consistent with a loss-making/reinvesting growth company) | Delivery Hero SE XTRA DHER Financials.xls, Ratios tab | Shareholder-yield read |

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

All ten cross-module inputs exist in the run root (`analyses/DHER_2026-08-12/business-model/` and `analyses/DHER_2026-08-12/earnings/`), both fully populated with `99_*-synthesis.md` present. `management-governance/` and `balance-sheet-survival/` also completed and are available for the value-trap and solvency-cap reads even though not formally required cross-module inputs for this module.

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No current price | N — price is present (EUR 37.18/37.20, Capital IQ, ≤2026-08-10) | 01, 05, 07, 99 | Not applicable |
| No consensus / forward estimates | N — full Consensus/Guidance/Multiples/Revisions tabs present | 02, 03, 04, 05 | Not applicable |
| No peer data | N — 10-company Capital IQ comp set plus Competitors.rtf present | 03, 06 | Not applicable |
| No segment-level data | N — 5-segment revenue & EBITDA history present | 06 | Not applicable |
| No balance sheet / capital structure | N — Balance Sheet, Capital Structure Summary/Details, Historical Capitalization all present | 01, 04, 06 | Not applicable |
| No cash flow statement | N — Cash Flow tab present FY2020–FY2025 | 04 | Not applicable |

No partial-data caps from the standard table are triggered. Two items outside that standard table warrant explicit downstream handling, not a formal score cap at this stage:
- **No detailed options/RSU/convertible dilution schedule found** in the reviewed tabs — `01` should default to disclosed basic/latest shares outstanding (303.7m) and flag per Fully Diluted Equity Rule 2(c) as a limitation if a treasury-stock-method schedule cannot be located in the Annual Report Notes.
- **Deal-contaminated price** — the pending Uber acquisition means the current price and sell-side Target Price/Recommendation fields do not represent a clean standalone-fundamentals read. This is not a missing-price condition (price is pool-verified) but every downstream margin-of-safety / reverse-DCF / "what's priced in" read must state this caveat inline (per Core Principle 3 and the M&A note above).

## 6A. Method Readiness Matrix

| Method | Ready? (Y/N) | Blocking Missing Inputs | Notes |
|---|---|---|---|
| Own-history multiples | Y | None | FY2024A–FY2028E TEV/Revenue, TEV/EBITDA, TEV/EBIT, P/BV series present (Multiples tab); EBITDA/EBIT only turned positive in FY2025, so pre-2024 multiples are not meaningful (NM) and the own-history band is short |
| Peer relative valuation | Y | None | 10-company Capital IQ comp set with LTM/NTM multiples; note most peers also loss-making or barely profitable (Deliveroo, Swiggy, Eternal/Zomato), so peer band itself needs quality-adjustment |
| Intrinsic DCF (Operating FCFF) | Y | None (dilution schedule gap does not block DCF) | Cash flow statement, capex, and segment data all present for an FCFF build |
| Reverse DCF | Y (conditional on `04` running first, per layer sequencing) | None | Price is pool-verified; deal-contamination caveat must be carried into the "what's priced in" read |
| SOTP | Y | None | 5 reportable segments (Asia, MENA, Europe, Americas, Integrated Verticals) with revenue & EBITDA; named regional peers exist for MENA (talabat/Jahez-type comps) and Asia; matching comparables for all 5 segments should be confirmed in `06` |

## 6. Sufficiency Verdict

- **Verdict:** Sufficient
- **Reason:** A full earnings base (income statement and cash flow), full capital-structure data, forward consensus estimates, peer comps, and a pool-verified current price are all present, enabling all five valuation methods (own-history multiples, peer relative, DCF, reverse-DCF, SOTP) to run.
- **Methods that can run:** own-history multiples, peer relative valuation, intrinsic DCF (FCFF), reverse-DCF, SOTP (5-segment).
- **Active partial-data caps:** None from the standard MODULE_RULES.md table. Two non-tabled cautions carry forward for downstream agents: (1) no explicit options/RSU/convertible dilution schedule located in the reviewed tabs — default to basic/latest shares outstanding (303.7m) and flag as a limitation if not resolved from the Annual Report Notes; (2) the current price and sell-side Target Price/Recommendation consensus are deal-contaminated by the pending Uber acquisition (M&A call, 2026-07-16) — every price-relative read must carry this caveat inline.
- **Critical missing items:** None.



---

## valuation / 01_price-and-capital-structure.md

_Source: `01_price-and-capital-structure.md`_

# Price & Capital Structure — DHER (Delivery Hero SE)

## 1. Current Price

| Field | Value | Source | As-of Date |
|---|---|---|---|
| Current price | €37.20 | Capital IQ, Delivery Hero SE XTRA:DHER Financials.xls, "Key Stats" tab (Latest Capitalization) and "Multiples" tab (quarter-to-date column) | 2026-08-07 |
| Cross-check (USD-converted) | $43.01 | Capital IQ, Company Comparable Analysis Delivery Hero SE.xls, "Financial Data" tab (Day Close Price Latest, currency = USD) | 2026-08-10 |
| Currency | EUR (company's trading and reporting currency; Frankfurt Xetra listing) | — | — |
| Price basis | Last close (Capital IQ; "Historical Equity Pricing Data supplied by Interactive Data Pricing and Reference Data LLC") | — | — |

**Price-state: pool-verified.** The current price is present directly in the data pool from two independent Capital IQ exports pulled three days apart (2026-08-07 and 2026-08-10), and they reconcile: $43.01 ÷ €37.20 implies an EUR/USD rate of ~1.156, a plausible spot rate — the two figures are the same underlying quote in two currencies, not a discrepancy. The €37.20 figure is also internally consistent with the vendor's own downstream math: Market Cap = 303.744978m shares × €37.20 = €11,299.3m, which is exactly the "Market Capitalization" line the workbook itself reports (Key Stats tab) — confirming the price, share count, and market cap tie together as of the same pricing date.

**Deal contamination — read this before using the price anywhere downstream.** Per the valuation-data-triage note, Uber Technologies announced an acquisition offer for Delivery Hero on 2026-07-16 (M&A Call transcript, Uber Technologies, Inc., Delivery Hero SE — M&A Call, 2026-07-16). On that call, Uber's CFO stated Prosus N.V. — a major DHER shareholder — has "irrevocably committed to tender its stake," which alone would bring the acquirer's economic ownership "to over 50% following a successful offer" [Uber-DHER M&A Call, 2026-07-16, Q&A]. The current €37.20 price is therefore **not a clean read of standalone fundamentals** — it embeds the market's assessment of deal completion odds, timing, and (absent a disclosed fixed offer price in the documents reviewed) some estimate of deal terms. For scale: Capital IQ's own quarterly price series shows DHER at €15.73 as of 2026-03-26 (the FY2025 results filing date, pre-announcement) versus €37.20 now — a >130% increase, consistent with the stock re-rating on deal news rather than organic operating improvement [Delivery Hero SE XTRA DHER Financials.xls, "Historical Capitalization" tab]. **Every downstream valuation agent using this price (multiples, relative valuation, DCF-implied read, margin of safety) must carry this flag: the current price is arbitrage/deal-priced, not a standalone-fundamentals price, and any "cheap/expensive" or margin-of-safety read is really a read on deal-completion risk, not on DHER as a standalone business.** No specific fixed per-share offer consideration (cash, stock, or mix) was found in the M&A call transcript or elsewhere in the pool — the call discusses synergies (>$1bn) and EPS accretion but not a disclosed offer price; this is itself a gap this agent flags rather than estimates.

**Price staleness.** Run date 2026-08-12 minus quote date 2026-08-07 = 5 calendar days ≈ 3 trading days (Fri 08-07 close → Mon 08-10, Tue 08-11, Wed 08-12). This is well under the 5-trading-day threshold, so no refresh attempt or staleness cap applies. The price is fresh.

## 2. Share Count

| Field | Value | Source |
|---:|---:|---|
| Basic shares outstanding (latest) | 303,744,978 | Capital IQ, Financials.xls, Key Stats tab ("Latest Capitalization," implicitly as of 2026-08-07 — ties to market cap arithmetic) |
| Basic shares outstanding (FY2025 balance-sheet date, Dec-31-2025) | 298,227,538 | Capital IQ, Financials.xls, Balance Sheet tab, "Total Shares Out. on Filing Date" |
| Registered/subscribed share capital (Dec-31-2024, prior fiscal year) | 287,385,940 no-par registered shares (€287,385,940.00 subscribed capital) | Delivery Hero SE Annual Report 2024 (IFRS), "Composition of subscribed capital" |
| Weighted-average diluted shares out (FY2025) | 298.647 million | Capital IQ, Financials.xls, Income Statement tab |
| Weighted-average basic shares out (FY2025) | 298.647 million (identical to diluted) | Capital IQ, Financials.xls, Income Statement tab |
| Woowa share-option program outstanding | 905,442 options (wtd. avg. strike €44.09), FY2024 year-end | Delivery Hero SE Annual Report 2024, Note H.2 (Share-Based Payments) |
| RSUs granted in FY2024 | 2,382,976 RSUs granted during the year (cumulative outstanding not separately totalled in extract) | Delivery Hero SE Annual Report 2024, Note H.2 |
| Convertible bonds outstanding (face, FY2025) | €2,588.4 million across 6 tranches (Conv. Bonds I–IV + Convertible Loan), maturities 2026–2030, coupons 0.875%–3.25% | Capital IQ, Financials.xls, Capital Structure Summary / Capital Structure Details tabs |
| **Fully diluted shares (TSM + if-converted)** | Not computable from available extracts | See limitation below |
| Share count used for market cap | 303,744,978 (latest basic) | Capital IQ Key Stats — ties to the vendor's own market-cap arithmetic |
| Share count used for per-share fair value | 303,744,978 (latest basic), flagged as a limitation | See below |

**Limitation — fully diluted count not computable.** DHER is loss-making at the net-income level (FY2025 net loss €782.9m), so under IFRS diluted EPS = basic EPS and all potentially dilutive instruments (stock options, RSUs, and the €2,588.4m of convertible bonds) are excluded from the diluted weighted-average share count as anti-dilutive [Capital IQ Income Statement tab; Annual Report 2024 Note H.2]. That EPS treatment is not the same question as balance-sheet dilution risk: none of the six convertible-bond tranches' conversion prices or conversion ratios were extracted from the documents in the pool (the Annual Report references "conversion price or option price to be determined" only in the context of authorized/conditional share-capital resolutions, not the specific outstanding tranches' strikes). The Woowa option pool (905,442 options, ~0.3% of shares) is immaterial. The convertible-bond overhang (€2,588.4m face, ~23% of market cap) is NOT immaterial and could be dilutive if the bonds are in or near the money — most were issued in 2020–2023 when DHER traded well above its recent lows, so historical strikes are plausibly still above €37.20, but this is inference, not confirmed from filings, and is flagged rather than assumed. Downstream agents should treat the basic/latest count (303.7m) as the best available figure for both market cap and per-share fair value, with this convertible-dilution overhang carried as an explicit caveat, not netted in.

## 3. Market Capitalization

`Market cap = share count × current price = 303,744,978 × €37.20 = €11,299.3 million`

This matches the vendor's own computed figure exactly (Capital IQ Key Stats tab, "Market Capitalization" = 11,299.313181), confirming price/share-count/date alignment.

**Flag: this market cap is deal-contaminated (see §1) — it is not a clean read of DHER's standalone equity value.**

## 4. Enterprise Value Bridge

| Component | Amount (€m) | Source |
|---|---:|---|
| Market capitalization | 11,299.3 | §3 above |
| + Total debt (short + long term) | 4,625.5 | Capital IQ, Financials.xls, Balance Sheet / Capital Structure Summary tabs (FY2025) |
| + Minority / non-controlling interest | 154.2 | Capital IQ, Financials.xls, Balance Sheet tab (FY2025) |
| + Preferred equity | 0.0 (none disclosed) | Capital IQ, Financials.xls, Key Stats tab |
| + Operating lease liabilities | Not added separately — already embedded in Total Debt ("Total Lease Liabilities" €437.8m is a sub-component of the €4,625.5m debt figure, per Capital Structure Summary "Debt Summary Data") | Capital IQ, Financials.xls, Capital Structure Summary tab |
| + Underfunded pension / other LT obligations | Not added — Pension & Other Post-Retirement Benefits liability is €33.8m (FY2025), immaterial (<0.3% of EV) and not separately added to avoid double-counting a liability already in Total Liabilities | Capital IQ, Financials.xls, Balance Sheet tab |
| − Cash & equivalents (+ ST investments) | (2,112.7) | Capital IQ, Financials.xls, Balance Sheet tab (FY2025) = "Cash And Equivalents," identical to "Total Cash & ST Investments" — no separate ST-investments line exists, so no double-count risk |
| − Equity-method investments | Not netted separately — DHER's equity-method investments are €9.8m (FY2025), immaterial | Capital IQ, Financials.xls, Balance Sheet tab (Supplemental Items) |
| **= Enterprise value (EV)** | **13,966.3** | Sum of above; ties exactly to Capital IQ's own "Total Enterprise Value (TEV)" figure (Key Stats tab) |

**Adjustments NOT made, and why:** operating leases are not added on top of Total Debt because Capital IQ's Total Debt figure already includes €437.8m of lease liabilities as a debt sub-component (adding again would double-count); pension obligations (€33.8m) and equity-method investments (€9.8m) are each under 0.3% of EV and are left inside their respective balance-sheet buckets rather than pulled out, given their immateriality; no contingent-liability or litigation-reserve adjustment is made because none was quantified as material in the extracts reviewed.

**Cash quality.** DHER's "Cash & Equivalents" (€2,112.7m, FY2025) is composed of ordinary bank balances, cash on hand, and short-term liquid deposits — there is no financial-subsidiary investment book, no disclosed margin/restricted balance of any size (the FY2024 Annual Report discloses restricted cash of only €2.0 million, i.e., 0.05% of that year's cash balance — immaterial), and no long-tenor mark-to-market securities folded into the headline cash line. The vendor's "cash" definition is adopted as-is here because it is not inflated by any of the items §4 of the operating rules warns against. **EV is therefore shown on a single basis (no with/without split needed).**

## 5. Net Debt & Leverage Snapshot

| Metric | Value | Source |
|---:|---:|---|
| Total debt (FY2025) | €4,625.5m | Capital IQ, Financials.xls, Balance Sheet / Capital Structure Summary |
| Cash & equivalents (FY2025) | €2,112.7m | Capital IQ, Financials.xls, Balance Sheet |
| **Net debt (strict: total debt − cash) (FY2025)** | **€2,512.8m** | Capital IQ, Financials.xls, Balance Sheet, "Supplemental Items" (matches Capital Structure Summary tab exactly) |
| Net debt / EBITDA (GAAP EBITDA €304.9m, FY2025) | ≈8.24x | GAAP EBITDA per Capital IQ Key Stats tab (FY2025A) |
| Net debt / Adjusted EBITDA (company-defined, €903m, FY2025) | ≈2.78x | Company-reported Adjusted EBITDA, Delivery Hero SE 2025 Earnings Call transcript, Mar-26-2026 ("Adjusted EBITDA grew by a strong 30% year-over-year, reaching EUR 903 million") |

**Reported-vs-adjusted flag (§15 hygiene).** GAAP EBITDA (€304.9m) and the company's own non-GAAP "Adjusted EBITDA" (€903m) differ by roughly €600m — a large gap, not disclosed in granular bridge form in the extracts reviewed, presumably driven by stock-based compensation and one-off items. Both are shown, separately labeled; neither is silently substituted for the other. **Separately, Capital IQ's own "Capital Structure Summary" and "Ratios" tabs report Net Debt/EBITDA = 5.53x for FY2025 (and 15.55x for FY2024) — this reconciles to neither the GAAP EBITDA figure (€304.9m → 8.24x) nor the company's Adjusted EBITDA figure (€903m → 2.78x) found elsewhere in the pool.** This is flagged as an unreconciled vendor computation (implied EBITDA base of ≈€454.6m for FY2025) rather than silently adopted or averaged away; downstream agents citing a leverage ratio should use the GAAP or company-Adjusted figures above (both traceable to a named EBITDA basis) and treat the vendor's pre-computed ratio as unverified.

## 6. Per-Share Reference Values

| Metric | Per Share | Source |
|---:|---:|---|
| Book value per share (FY2025, basic shares on filing date) | €5.50 | Capital IQ, Financials.xls, Balance Sheet, "Book Value/Share" (= €1,639.6m equity ÷ 298.227538m shares) |
| Tangible book value per share (FY2025) | −€11.84 | Capital IQ, Financials.xls, Balance Sheet, "Tangible Book Value/Share" (tangible book value is negative: −€3,530.5m, driven by €4,424.3m of goodwill and €745.8m of other intangibles) |
| Net debt per share (latest shares, 303,744,978) | €8.27 | Calculated: €2,512.8m ÷ 303,744,978 shares |

## 7. Anchor Summary (canonical numbers for downstream agents)

Current price is pool-verified and internally consistent (§1), but is **deal-contaminated** by Uber's pending acquisition offer for Delivery Hero (announced 2026-07-16) — it reflects deal-completion odds and an assumed (undisclosed) offer premium, not a standalone-fundamentals price. Every downstream price-relative read (margin of safety, multiples, DCF-implied, reverse-DCF) must carry this flag explicitly. Separately, the fully diluted share count is not computable from available extracts because convertible-bond conversion terms were not found in the pool; the €2,588.4m convertible-bond overhang (~23% of market cap) is a real, unquantified dilution risk that basic-share-count valuation work does not capture.

### Anchor Block (copy-forward)

- Price: €37.20 (2026-08-07, Capital IQ last close; cross-checked to $43.01 as of 2026-08-10, same underlying quote)
- Price-state: pool-verified — **but deal-contaminated (Uber acquisition offer, announced 2026-07-16); not a standalone-fundamentals price**
- Currency: EUR (Delivery Hero SE reports under IFRS; Frankfurt Xetra primary listing)
- Shares (market cap): 303,744,978 (Capital IQ Key Stats, latest — ties exactly to vendor market-cap arithmetic)
- Shares (per-share fair value): 303,744,978 (same as above; fully diluted count not computable — convertible-bond conversion terms not in pool, flagged as limitation, not netted)
- Market cap: €11,299.3 million
- Net debt: €2,512.8 million (strict basis: total debt €4,625.5m − cash & equivalents €2,112.7m, FY2025)
- EV: €13,966.3 million
- Key caveats: (1) current price and any price-relative read is deal-contaminated by the pending Uber tender offer and does not reflect standalone fundamentals; no fixed offer price was disclosed in the M&A call transcript reviewed; (2) fully diluted share count excludes €2,588.4m of convertible bonds whose conversion terms were not extracted from the pool — a real, unquantified dilution risk; (3) GAAP EBITDA (€304.9m) vs. company Adjusted EBITDA (€903m) diverge sharply, and Capital IQ's own pre-computed Net Debt/EBITDA ratio (5.53x) reconciles to neither and is treated as unverified; (4) the FY2025 Annual Report filing (filed ~2026-03-26 per Capital IQ) is not present in the data pool — FY2025 balance-sheet figures here are Capital IQ vendor extracts (Tier 5), not cross-checked against the primary filing; the FY2024 Annual Report (filed Apr-25-2025) is the only primary filing available in the pool.



---

## valuation / 02_multiples-own-history.md

_Source: `02_multiples-own-history.md`_

# Multiples — Own History — DHER (Delivery Hero SE)

**Reporting currency: EUR.** Anchor numbers (price €37.20 as of 2026-08-07, 303,744,978 shares, market cap €11,299.3m, EV €13,966.3m, net debt €2,512.8m strict basis) are taken verbatim from `01_price-and-capital-structure.md` and are not recomputed here.

**Read this before the tables below.** Delivery Hero SE is the subject of a live, pending Uber Technologies acquisition offer (M&A call, 2026-07-16), which more than doubled the price from €15.73 (2026-03-26, pre-announcement) to €37.20 (2026-08-07) — a >130% move [Capital IQ, DHER Financials.xls, "Historical Capitalization" tab; 01 anchor]. Every multiple computed off the current price in this report is therefore **not a clean read of standalone re-rating** — it measures deal-completion odds and an assumed (unconfirmed) offer premium layered on top of the company's fundamentals. The "own history" comparison in Sections 3–5 is, in practice, a comparison of *deal-priced-DHER* against *standalone-DHER's own trading range* — read the premium/discount figures as "how rich the deal price looks against the company's own multiple history," not as "how rich the standalone stock looks." Separately, ~€2,588.4m of convertible bonds (~23% of market cap) carry unquantified dilution risk not reflected in the basic share count used throughout [01 anchor].

**Business type / method map.** DHER is an online-marketplace / logistics operating company (food and quick-commerce delivery), not a REIT or financial institution — EV-based multiples (EV/Sales, EV/EBITDA, EV/EBIT) are the primary lens. P/E and P/Book are shown as secondary because the company only turned GAAP-EBITDA/EBIT positive in FY2025 and remains net-loss-making; P/Tangible Book is dropped as not meaningful (tangible book value is negative). P/FFO and P/NAV do not apply.

---

## 1. Current Multiples

| Multiple | Basis (LTM / NTM / FY) | Metric Value | Current Multiple | Source |
|---|---|---:|---:|---|
| P / E | LTM | EPS −€2.62 (FY2025A, net loss €782.9m) | NM (negative) | Capital IQ, DHER Financials.xls, Income Statement tab; Multiples tab (P/LTM EPS, Close = NM all quarters shown) |
| P / E | NTM | Normalized EPS €0.14 (consensus mean) | ≈264.6x | Capital IQ Estimates Report, Multiples tab (NTM Price/Earnings = 264.58) & Consensus tab (Market Summary, EPS Normalized NTM) — flag: base is barely above zero, so the multiple is extremely sensitive to small EPS revisions and is not economically meaningful despite being technically positive |
| EV / EBITDA (GAAP) | LTM (FY2025A) | EBITDA €304.9m | 45.8x | Capital IQ, DHER Financials.xls, Income Statement tab (Supplemental Items, EBITDA) + anchor EV €13,966.3m |
| EV / EBITDA (CapIQ vendor LTM) | LTM (rolling, as of 2026-08-07) | Implied base ≈€453m (unreconciled — see 01 flag) | 30.8x | Capital IQ, DHER Financials.xls, Multiples tab, "TEV/LTM EBITDA," Close, 2026-08-07 column — flagged as an unreconciled EBITDA base per `01`'s own §15 note; shown for completeness, not relied on below |
| EV / Adj. EBITDA (company-defined) | LTM (FY2025A) | Adjusted EBITDA €903m | 15.5x | Company-reported, Delivery Hero SE 2025 Earnings Call transcript, 2026-03-26 ("Adjusted EBITDA grew... reaching EUR 903 million") + anchor EV |
| EV / EBITDA | NTM | NTM EBITDA €1,016.3m (consensus mean) | 13.7x | Capital IQ Estimates Report, Multiples tab (NTM TEV/EBITDA = 13.74) |
| EV / EBIT (GAAP) | LTM (FY2025A) | EBIT €93.7m | 149.1x (NM-adjacent) | Capital IQ, DHER Financials.xls, Income Statement tab + anchor EV — EBIT only turned positive in FY2025; the multiple is a near-breakeven-denominator artifact, not a stable read |
| EV / EBIT | NTM | NTM EBIT ≈€548m (consensus-derived) | 25.5x | Capital IQ Estimates Report, Multiples tab (NTM TEV/EBIT = 25.47) |
| EV / Sales | LTM (FY2025A) | Revenue €14,059.6m | 0.99x | Capital IQ, DHER Financials.xls, Multiples tab ("TEV/LTM Total Revenue," Close, 2026-08-07) |
| EV / Sales | NTM | NTM Revenue €16,049.7m (consensus mean) | 0.87x | Capital IQ Estimates Report, Multiples tab (NTM TEV/REV = 0.870) |
| P / Book | LTM (FY2025A) | Book value/share €5.50 | 6.77x | Capital IQ, DHER Financials.xls, Multiples tab ("P/BV," Close, 2026-08-07); ties to `01` anchor BVPS |
| P / Tangible Book | LTM (FY2025A) | Tangible BVPS −€11.84 (negative) | NM | `01` anchor (tangible book value −€3,530.5m, driven by €4,424.3m goodwill + €745.8m other intangibles) |
| P / FCF (CapIQ Levered FCF basis) | LTM (FY2025A) | Levered FCF €355.65m | 31.8x | Capital IQ, DHER Financials.xls, Cash Flow tab (Levered FCF) & Multiples tab ("Market Cap/LTM Levered FCF," Close = 31.77x, 2026-08-07) |
| FCF yield (normalized, CFO − total capex) | LTM (FY2025A) | CFO €79.5m − Capex €171.0m = −€91.5m | NM (negative) | Capital IQ, DHER Financials.xls, Cash Flow tab — §15 flag: FY2025 CFO fell sharply from €638.3m (FY2024) to €79.5m on a large working-capital swing (inventory change −€547.7m in FY2025 vs. −€193.0m in FY2024); this is a disclosed cash-timing effect, not a structural FCF collapse, but the strict CLAUDE-definition figure is genuinely negative for the LTM period and is headlined here rather than the more flattering CapIQ "Levered FCF" figure above |
| Dividend yield | LTM | DPS €0.00 (no dividend ever paid, FY2020–2025) | 0.0% | Capital IQ, DHER Financials.xls, Cash Flow tab ("Total Dividends Paid" = 0 every year); Capital IQ Estimates Report, Consensus tab (DPS row) |

---

## 2. Historical Multiple Bands (own history available in the pool: ~2.3–3 years)

**Data-availability caveat before the table.** The Capital IQ "Multiples" export in the pool only carries a genuine quarterly time series from 2025-06-30 to 2026-08-07 (~14 months). To extend the window, this agent additionally computed period-matched TEV ÷ period revenue from the "Historical Capitalization" tab (semi-annual snapshots back to 2023-06-30) and the annual Income Statement / Ratios tabs — both are pool-sourced, not vendor-precomputed multiples, so they are shown as a distinct, labeled series. Combined, this yields a real own-history band of ~2.3–3 years (pricing dates April 2024 – August 2026 for EV/Sales; August 2023 – August 2026 for P/Book), short of an ideal 5-year window — no earlier Capital IQ multiples export or period-matched TEV data was found in the pool. This is a genuine sample-size limitation (n=6–8 observations per multiple), not a "recently listed company" situation (DHER has traded since 2017); it lowers statistical confidence in the mean/median without invalidating the read.

**GAAP earnings history makes EV/EBITDA, EV/EBIT and P/E bands unreliable.** GAAP EBITDA was negative every year from FY2020 through FY2024 (as low as −€1,438.1m in FY2021) and only turned marginally positive in FY2025 (€304.9m, a 2.2% margin); GAAP EBIT followed the same pattern, turning positive only in FY2025 (€93.7m); net income has been negative every year since at least 2016. [Capital IQ, DHER Financials.xls, Income Statement / Ratios tabs.] That means EV/EBITDA, EV/EBIT and P/E were **NM for the large majority of the look-back window**, and the handful of quarters where they do compute (Sep-2025 onward) sit on a still-thin, rapidly-changing denominator — the CIQ quarterly close for TEV/LTM EBITDA alone swings from 16.1x to 76.0x across six quarters. These three multiples are shown below for transparency but are **not treated as a reliable own-history band** and are excluded from the reversion-implied-value table in Section 4.

| Multiple | Min | Mean | Median | Max | Current | Percentile of Range |
|---|---:|---:|---:|---:|---:|---:|
| EV / Sales (n=8: FY2023A, FY2024A period-matched + CIQ quarterly Jun-25→Aug-26) | 0.52x | 0.82x | 0.73x | 1.25x | 0.99x | ≈86th |
| P / Book (n=6: semi-annual, 2023-06-30 → 2025-12-31, period-matched) | 2.76x | 3.75x | 2.92x | 6.00x | 6.77x | >100th (above the historical max) |
| EV / EBITDA (GAAP, n=6 quarterly CIQ closes, Jun-25→Aug-26 — first quarter with a positive value was Sep-25) | 16.1x | 31.3x | 23.9x | 76.0x | 30.8x | ≈67th, but see reliability flag above — not a stable band |
| EV / EBIT (GAAP) | NM for essentially the whole window (negative FY2020–2024; first positive reading Sep-2025 at ~70x, immediately unstable) | — | — | — | 149.1x (LTM) / 25.5x (NTM) | Not assessable — insufficient meaningful history |
| P / E | NM for the entire window shown (LTM P/E is NM in every quarter in the CIQ export; net losses every year FY2016–2025) | — | — | — | NM (LTM) / 264.6x (NTM, near-zero-EPS artifact) | Not assessable |

**Sources for the computed (non-vendor-precomputed) series:** EV/Sales FY2023A and FY2024A = period-matched TEV (Historical Capitalization tab, balance dates 2023-12-31 and 2024-12-31, priced as of the FY2023/FY2024 filing dates) ÷ FY revenue (Income Statement tab); P/Book six-point series = period-matched market cap ÷ book value of common equity, both from the Historical Capitalization tab. All quarterly CIQ close values are from DHER Financials.xls, Multiples tab.

---

## 3. Re-Rating / De-Rating Read

**EV/Sales — the most reliable multiple here — sits at a premium of +22% to its own ~3-year mean (0.82x) and +36% to its own median (0.73x), at roughly the 86th percentile of its own range (0.52x–1.25x).** But the shape of that range tells the real story: the pre-deal print (Mar-2026 quarter, priced at €15.73, i.e. before the Uber announcement) sat at 0.52x — the **bottom** of the entire range — while the two most recent quarters (Jun-26 at 0.97x and the current Aug-26 read at 0.99x) sit at the top. The stock did not organically re-rate through 2023–early 2026; it traded at a discount to its own multiple history right up until deal pricing took over. **P/Book shows the same pattern more extremely**: current 6.77x sits above the entire 2023–2025 range (2.76x–6.00x, mean 3.75x, median 2.92x) — a premium of +80% to mean and +132% to median — again explained almost entirely by the price move, not by book-value improvement (FY2025 book value/share, €5.50, is in fact below the FY2023-06 level of ~€11.60 implied by the period's €3,038.2m book value on 261.7m shares). **Read plainly: on both multiples with a usable own history, DHER is trading rich versus itself — and the evidence points to the Uber tender as the driver, not a fundamentals re-rating (margin, growth, or capital-structure improvement).**

---

## 4. Implied Value from Reversion

**Base case (named): EV/Sales reverting to its own ~3-year median of 0.73x, applied to LTM (FY2025A) revenue of €14,059.6m.**

| Multiple | Reversion Target (mean / median) | Implied EV or Equity | Implied Price/Share | vs Current Price (€37.20) |
|---|---:|---:|---:|---:|
| EV / Sales — median (base case) | 0.73x | EV €10,291m → Equity €7,624m | **€25.10** | **−32.5%** |
| EV / Sales — mean | 0.82x | EV €11,474m → Equity €8,807m | €29.00 | −22.0% |
| P / Book — median (dispersion only) | 2.92x | Equity ≈ €4,872m (2.92 × €5.50 × 303.7m shares) | €16.04 | −56.9% |
| P / Book — mean (dispersion only) | 3.75x | Equity ≈ €6,262m | €20.62 | −44.6% |

Equity value from EV/Sales rows = Implied EV − net debt (€2,512.8m, strict) − minority interest (€154.2m), consistent with the `01` EV bridge; per-share = equity ÷ 303,744,978 shares.

**EV/EBITDA, EV/EBIT and P/E are excluded from this table** — Section 2 established that GAAP EBITDA/EBIT were negative for most of the look-back window and P/E has never been positive on an LTM basis, so no reliable own-mean/median multiple exists to apply. Forcing a reversion figure off a one-year-old, ~30x-to-76x-swinging EV/EBITDA band would be false precision, not evidence.

**Base-case point: €25.10/share (EV/Sales, own-median reversion), with a cross-multiple dispersion of €16.04–€29.00/share** across the two multiples with a genuine own-history band. Every figure in this range sits meaningfully below the current €37.20 — implying the current price is not explained by DHER's own trading history and rests instead on the market's assessment of Uber deal-completion odds (see header caveat; an unverified web-sourced report cited in the management-governance module puts the reported cash offer at €41.50/share [Web: Prosus press release / Reuters via TradingView, retrieved 2026-08-12, unverified] — if broadly accurate, the €37.20 price implies the market is pricing in a meaningful chance of the deal closing near that level, discounted for time and completion risk, not a standalone re-rating).

**Reversion-assumption check.** This table assumes DHER's own-history multiple is still the right "warranted" level to revert to. That assumption is weak here: FY2025 was the company's first year of positive GAAP EBITDA/EBIT after five years of losses, so the pre-deal multiple band (built almost entirely on a loss-making, still-unprofitable company) may understate what a durably profitable DHER should trade at — the business-model evidence for that structural improvement being sustained (rather than a one-off inflection) sits outside this module's scope (see `earnings/01_historical-financials.md` and `business-model` outputs). Equally, the current price reflects a takeover premium, not organic re-rating, so it cannot be used to validate a higher "new" warranted multiple either. Both directions of adjustment are plausible; this module does not resolve which dominates.

---

## 5. Own-History Read

DHER trades at a real premium to its own multiple history on every metric with a usable band — +22%/+36% to the EV/Sales mean/median, and above the entire 2023–2025 range on P/Book — but that premium is not evidence of an improving standalone business: the pre-deal price (€15.73, 2026-03-26) sat at the **bottom** of the same EV/Sales range, and the jump to the top of the range tracks the Uber tender timeline, not a change in margins, growth, or leverage. Reverting to the company's own 3-year median EV/Sales (0.73x) implies €25.10/share, roughly 33% below the current €37.20 — a real signal that, absent the deal, DHER's own trading history does not support today's price. The single biggest caveat: this entire read assumes the pre-deal multiple band is still the right "own history" to revert to, when FY2025 was in fact the company's first-ever year of GAAP profitability at the EBITDA/EBIT line — a business genuinely inflecting from loss-making to profitable could deserve a structurally higher multiple than its own loss-making-era history, and this module cannot adjudicate that from multiples data alone. On ownership: the management-governance module found no current controlling-owner misalignment (RF-OWN-004 not triggered; Naspers/Prosus never held control and is exiting via the tender, not exercising it), so the premium/discount read here is a deal-completion-odds question, not a structural value-trap question — but it flagged a forward risk that if the Uber tender closes without a full squeeze-out, remaining minority holders would sit under a majority owner (Uber) optimizing for its own synergy capture, not DHER's standalone per-share value — worth carrying into any post-close reassessment of "own history," should the deal not close.



---

## valuation / 03_relative-valuation-peers.md

_Source: `03_relative-valuation-peers.md`_

# Relative Valuation — Peers — DHER

**Read this before the tables.** The current price (€37.20, 2026-08-07) is deal-contaminated: Uber Technologies announced an agreement to acquire Delivery Hero on 2026-07-16, and the stock has more than doubled from its pre-announcement level of €15.73 (2026-03-26) [`01_price-and-capital-structure.md`, §1, citing Delivery Hero SE XTRA DHER Financials.xls, "Historical Capitalization" tab]. No fixed offer price (cash, stock, or mix) was found anywhere in the data pool. Every multiple and every premium/discount read below is therefore measuring **deal-completion odds and an assumed, undisclosed offer premium**, not a standalone read of what the market thinks DHER's business is worth. Separately, ~€2,588.4m of convertible bonds (~23% of market cap) carry unquantified dilution risk not reflected in the basic share count used throughout [`01_price-and-capital-structure.md`, §2]. Both flags apply to every number in this report and are repeated at the points where they matter most.

## 1. Peer Set

| Peer | Ticker | Why Comparable | Source of Inclusion |
|---|---|---|---|
| Uber Technologies, Inc. | NYSE:UBER | Global on-demand delivery/mobility platform; Uber Eats competes head-to-head with DHER's brands worldwide, and Uber's own CEO placed talabat's Middle East growth, user base and margin roughly level with Uber's own Middle East business. Also DHER's pending acquirer (announced 2026-07-16) — this is simultaneously a competitor comp and a conflicted party in the current price. | Named competitor in `business-model/08_competitive-map.md`, §2 (Competitor A); not present in the CIQ default comp workbook, so multiples are web-sourced |
| DoorDash, Inc. | NasdaqGS:DASH | Closest scale peer globally (FY2025 revenue $13.72bn vs DHER's ~$15.9bn); now competes directly with DHER's Europe segment and, via Deliveroo's Gulf footprint, in DHER's dominant MENA segment | Named competitor in `business-model/08_competitive-map.md`, §2 (Competitor B); not present in the CIQ default comp workbook, so multiples are web-sourced |
| Meituan | SEHK:3690 | Large Asian local-commerce/food-delivery platform; comparable low/negative-margin, still-scaling marketplace economics closest to DHER's own profile | CIQ default comparable-company set (`Company-Comparable-Analysis-Delivery-Hero-SE__Trading-Multiples.txt`) |
| Swiggy Limited | NSEI:SWIGGY | India food delivery + quick-commerce (Instamart) marketplace; negative-EBITDA, high-growth profile closest to DHER's own | CIQ default comparable-company set |
| Eternal Limited (fka Zomato) | NSEI:ETERNAL | India food delivery + quick-commerce (Blinkit) marketplace, directly analogous business model (marketplace + integrated-inventory vertical, mirroring DHER's own Dmarts build-out) | CIQ default comparable-company set |
| Prosus N.V. | ENXTAM:PRX | Internet/e-commerce holding company with a material online food-delivery segment and stakes in several delivery platforms (including a stake in Swiggy) | CIQ default comparable-company set |

**Peer-set provenance.** This set blends the named competitors in `business-model/08_competitive-map.md` (Uber, DoorDash) with the most genuinely comparable names from Capital IQ's own default comp workbook (Meituan, Swiggy, Eternal, Prosus). The CIQ default set also returned five names excluded here as weak comparables and flagged, not silently dropped: **HelloFresh SE** (a meal-kit direct seller, not a delivery marketplace — no commission/take-rate economics), **Luckin Coffee** (a China coffee-retail chain), **Skylark Holdings** (a Japan restaurant operator), **RIDE ON EXPRESS Holdings** (a single-country owned-restaurant sushi-delivery chain, not a marketplace), and **Naspers Limited** (the controlling holding company of Prosus — including both would double-count the same underlying economics, so only Prosus is kept). **Deliveroo plc** appears in the CIQ set but reports "-" on every multiple because it has been a wholly owned DoorDash subsidiary since 2025-10-02 and no longer trades independently — excluded for lack of data, not judgment.

**Named competitor with no usable multiples.** `business-model/08_competitive-map.md` also names **Jahez International** (Tadawul:6017) as a direct MENA competitor to talabat/HungerStation. It does not appear in the CIQ comp workbook and is ~26x smaller than DHER by revenue [`08_competitive-map.md`, §2] — well outside a comparable-scale bound. Its own FY2025 figures (net margin ~3.2%, KSA-segment Adjusted EBITDA margin 11.9%) are web-sourced and unverified, and are used qualitatively in `08_competitive-map.md` but excluded from the peer-median calculation here for scale-mismatch and data-reliability reasons.

**Private peers that cannot be compared (no public multiples).** Careem (Uber-owned, UAE), Noon Food (UAE, privately held), Getir and JOKR (privately held quick-commerce) compete directly with DHER in named segments but disclose no public trading multiples — flagged, not estimated.

## 2. Peer Multiples & Operating Stats

Business type: operating/growth marketplace with thin-to-negative margins across most of the cohort. Per the Business-Type Method Map, EV-based multiples (EV/Sales, EV/EBITDA) are the appropriate primary lens; P/E and P/TangBV are shown for completeness but are NM or economically unusable for most of this set (loss-making numerators, negative tangible book values).

| Company | P/E (LTM / NTM) | EV/EBITDA LTM | EV/EBIT LTM | EV/Sales LTM | FCF Yield | Rev Growth (LTM/TTM) | EBITDA Margin | ROIC | Net Debt/EBITDA | Data As-of |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| **DHER** | NM / 264.6x (distorted, near-zero forward EPS base + inflated deal price) | 30.8x | 151.5x (near-breakeven EBIT, noisy) | 1.0x | 3.1% (1 ÷ Market Cap/LTM Levered FCF of 31.77x) | +14.4% | 2.2% (CIQ LTM basis); company's own Adjusted EBITDA margin 6.4% (€903m/€14,059.8m FY2025) — flagged, both shown | 0.8%–1.6% (FY2025, best year; `business-model/09_moat.md`, §3) | 2.8x (Adj. EBITDA basis) / 8.2x (GAAP EBITDA basis) — see `01_price-and-capital-structure.md`, §5; CIQ's own pre-computed Total Debt/EBITDA = 10.2x | CIQ, 2026-08-10 (LTM); company figures FY2025 |
| Uber Technologies | 17.1x / 18.6x | 22.10x | ~28.7x (derived: EV $159.92bn ÷ (Rev $52.017bn × 10.7% GAAP op. margin)) | 2.99x | 6.31% | +16.7% (TTM) | ~13.5% (derived: EV/Sales ÷ EV/EBITDA) | 27.93% (web-sourced calc; methodology not disclosed, likely not directly comparable to the moat-file's own DHER ROIC calc — flagged) | 1.25x | stockanalysis.com, 2026-08-12 (web, unverified) |
| DoorDash | 111.3x / 33.0x | 49.98x | ~124.2x (derived: EV $90.33bn ÷ (Rev $13.717bn × 5.3% GAAP op. margin)) | 5.65x | 2.82% | +33.6% (TTM; +27.9% FY2025 reported) | ~11.3% (derived) | 8.67% (web-sourced calc, same methodology caveat as Uber) | −1.14x (net cash) | stockanalysis.com, 2026-08-12 (web, unverified) |
| Meituan | NM / 66.9x | NM (negative EBITDA) | NM | 1.2x | Not sourced | +5.47% | −10.8% | Not sourced | NM (CIQ) | CIQ, 2026-08-10 |
| Swiggy | NM / NM | NM (negative EBITDA) | NM | 2.6x | Not sourced | +46.79% | −13.7% | Not sourced | NM (CIQ) | CIQ, 2026-08-10 |
| Eternal (Zomato) | NM / 206.7x | 163.1x (near-breakeven EBITDA, noisy) | NM | 4.2x | Not sourced | +190.5% (CIQ-reported; unusually high, likely a Blinkit-consolidation/restatement effect around the FY2025 Zomato→Eternal rename rather than organic growth — treat with caution) | 2.6% | Not sourced | 2.6x (Total Debt/EBITDA, CIQ — not a net-debt basis) | CIQ, 2026-08-10 |
| Prosus | 9.4x / 11.68x | 13.9x | 14.7x | 10.9x | Not sourced | +57.29% | 6.5% | Not sourced | 24.9x (Total Debt/EBITDA, CIQ — holding-company debt against equity stakes, not a like-for-like operating leverage figure; flagged as an outlier) | CIQ, 2026-08-10 |
| **Peer median (6-name set)** | n/a (too many NM) | 36.04x (n=4: Uber, DoorDash, Prosus, Eternal) | 28.7x (n=3: Uber, DoorDash, Prosus — derived/noisy) | 3.60x (n=6) | 4.57% (n=2: Uber, DoorDash) | +33.6% (n=5, Eternal outlier excluded) / +40.2% (n=6, all included) | 4.55% (n=6, derived where noted) | n/a (n=2, small sample) | n/a (bases inconsistent across peers — not averaged) | — |

All peer figures for Uber and DoorDash are **web-sourced (stockanalysis.com), as of 2026-08-12, unverified** — neither name is in the CIQ comp workbook, and this data was not independently cross-checked against a second vendor. CIQ figures for Meituan, Swiggy, Eternal, and Prosus are Tier-5 vendor data, `Company-Comparable-Analysis-Delivery-Hero-SE__Trading-Multiples.txt` and `__Operating-Statistics.txt`, as-of 2026-08-10, USD-converted at spot rate.

## 3. Premium / Discount to Peer Median

| Multiple | Company | Peer Median | Premium / (Discount) |
|---|---:|---:|---:|
| EV/Sales LTM | 1.0x | 3.60x (n=6) | **(72.2%) discount** |
| EV/Sales NTM | 0.87x | 2.30x (n=4: Meituan, Swiggy, Eternal, Prosus) | **(62.2%) discount** |
| EV/EBITDA LTM | 30.8x | 36.04x (n=4: Uber, DoorDash, Prosus, Eternal) | **(14.5%) discount** — low reliability; DHER's own LTM EBITDA base is near-breakeven, so the multiple is denominator-sensitive |
| EV/EBITDA NTM | 13.74x | 69.9x (n=3: Meituan, Eternal, Prosus) | **(80.3%) discount** — flagged: the peer median itself is inflated by near-zero forward-EBITDA bases at Eternal (69.9x) and Prosus (102.03x); treat as directional, not precise |
| EV/EBIT LTM | 151.5x | 28.7x (n=3, derived) | **+428% premium** — unreliable: both DHER's and several peers' EBIT bases are near-zero or derived, producing an artifact of small denominators rather than a real valuation signal |
| FCF Yield (yield metric — reading inverted) | 3.1% | 4.57% (n=2: Uber, DoorDash) | DHER's yield sits ~32% below peer median → under the yield-inversion rule this reads as a **premium** (DHER pays more per unit of free cash flow than Uber/DoorDash), not a discount. Small sample (n=2), flagged. |
| P/TangBV LTM | NM (tangible book value negative, −$13.69/share) | 3.7x (full 11-name CIQ set) | Not computable — DHER's tangible book is negative (goodwill-heavy balance sheet), so this multiple is not usable for DHER |

**Cross-method disagreement (not averaged away).** EV/Sales and NTM EV/EBITDA both show DHER trading at a wide discount to the peer median (62–80%). EV/EBIT shows a large premium, and FCF yield (small sample) also reads as a premium. The EV/EBIT and FCF-yield readings are treated as **unreliable** here: EV/EBIT is a small-denominator artifact on a cohort where several members (DHER included) sit at or near breakeven operating income, and the FCF-yield peer sample is only two names. **EV/Sales is the most reliable read for this cohort** — it is the one multiple with full data coverage across all six peers and is not distorted by near-zero profit denominators. The discussion below weights EV/Sales as the primary signal.

**Is the gap typical or unusual?** **Not assessable.** No historical (multi-period) peer-multiple dataset exists in the data pool — the CIQ Trading Multiples and Operating Statistics exports are single-date snapshots (as-of 2026-08-10), and no prior-quarter or prior-year peer comp export was found. This agent cannot state whether the current EV/Sales discount is wider or narrower than DHER's typical historical relationship to these peers. What can be stated: the discount exists on a price that has already more than doubled since the pre-deal-announcement level (€15.73, 2026-03-26 → €37.20 now, +136.5%) [`01_price-and-capital-structure.md`, §1] — i.e., DHER still trades at a steep EV/Sales discount to this peer group even after the deal-driven re-rating, which is itself informative even without a peer-relative time series.

## 4. Is the Gap Warranted?

Partly. DHER's business-quality score is 34/100 ("Weak") and its moat verdict is "No moat proven," with group ROIC of 0.8%–1.6% in its best-ever year (FY2025) against a company-disclosed 10.7%–13.7% cost of capital — a gap of roughly 900–1,700 basis points through-cycle [`business-model/07_business-quality.md`; `business-model/09_moat.md`, §3]. Against the two profitable, GAAP-positive peers in this set (Uber at 10.7% GAAP operating margin, DoorDash at 5.3%) and against Prosus's 6.5% EBITDA margin, a discount is directionally warranted — DHER's revenue growth (+14.4% LTM) also trails the peer median (+33.6% to +40.2%) and its leverage (2.8x–10.2x depending on EBITDA basis) sits well above Uber's 1.25x and DoorDash's net-cash position. But DHER's EV/Sales (1.0x) is not meaningfully wide of its two closest-quality peers — Meituan (1.2x) and Swiggy (2.6x), both similarly loss-making, still-scaling marketplaces — where the honest comparison set actually sits close to or below DHER's own multiple. Much of the 72% discount to the full six-name median is a **peer-set composition effect**: it is driven by Uber, DoorDash and Prosus (2.99x–10.9x), which are structurally different — larger, already-profitable, or holding-company — businesses, not a clean statement that the market is pricing DHER as unusually cheap versus its true quality-matched peers. Conclusion: **discount is warranted versus profitable peers (Uber, DoorDash); versus the closest-quality peers (Meituan, Swiggy) the gap narrows sharply and is not clearly warranted by the quality evidence alone** — this is a mixed verdict, not a clean read either way, and it sits on a price that is itself deal-contaminated (§ above).

## 5. Implied Value from Peer Multiples

Applied on the same basis throughout (LTM peer multiple → LTM company metric; NTM peer multiple → NTM company metric), using Capital IQ's own USD-converted LTM/NTM revenue and EBITDA figures and EV bridge (`Company-Comparable-Analysis-Delivery-Hero-SE__Implied-Valuation.txt`, as-of 2026-08-10: Cash $2,442.4m, Total Debt $5,347.4m, Minority Interest $178.27m, 303.74m shares) — a basis internally consistent with, though not identical in date/currency to, the EUR figures in `01_price-and-capital-structure.md`.

**Quality adjustment applied:** the raw six-name EV/Sales median (3.60x) is not used as the base case — per §4, it is inflated by structurally different, more-profitable peers. The base case instead applies the median of DHER's two closest-quality peers (Meituan, Swiggy — both negative-EBITDA, still-scaling marketplaces): **EV/Sales LTM = 1.9x**.

| Multiple | Applied Peer Multiple | Implied EV | Implied Price/Share | vs Current Price (€37.20) |
|---|---:|---:|---:|---:|
| **EV/Sales LTM (base case, quality-adjusted: Meituan+Swiggy median)** | **1.9x on LTM Revenue $16,253.9m** | **$30,882.4m** | **≈€79.2** (($30,882.4m + $2,442.4m − $5,347.4m − $178.27m) ÷ 303.74m shares = $91.53, ÷ ~1.156 USD/EUR) | **+113%** |
| EV/Sales NTM (quality-adjusted: Meituan+Swiggy median) | 1.515x on NTM Revenue $18,554.5m | $28,110.1m | ≈€71.3 | +92% |
| EV/EBITDA NTM (quality-adjusted: Meituan only, closest single comparable with a meaningful NTM EBITDA multiple) | 25.83x on NTM EBITDA $1,174.9m | $30,347.4m | ≈€77.6 | +109% |
| EV/Sales LTM (raw, unadjusted 6-peer median — dispersion upper bound, NOT the base case) | 3.60x on LTM Revenue $16,253.9m | $58,514.0m | ≈€157.9 | +325% |
| CIQ full 11-name default comp set (reference only — includes weak comparables §1 flags as excluded; not used as this agent's implied value) | Mean-across-multiples | $13,853.2m (median) | $45.61 → ≈€39.5 (median); range −$2.70 to $281.91 across the full set | −(6)% to +(large) |

**Base-case point: ≈€79.2/share** (EV/Sales LTM, quality-adjusted to the Meituan/Swiggy median), with a **dispersion of roughly €71–€158/share** across the other bases shown, driven mainly by how much of the raw peer-group premium (Uber, DoorDash, Prosus) is judged applicable versus excluded for quality. The wide dispersion itself is a finding: small changes in which peers are treated as "quality-matched" move the implied share price by more than 2x.

**Caveats specific to this implied value (repeat of the top-of-report flags, applied here):** (1) every peer multiple used to compute EV is itself measured against a DHER price that is deal-contaminated for the *company* side of the comparison, but the *peer* multiples are standalone, undistorted reads — so this section is comparing a deal-priced DHER against standalone-priced peers, and the resulting "upside" partly reflects that the deal has not (on these metrics) driven DHER's multiple up to where its closest peers sit, not necessarily that DHER is a clean re-rating candidate absent the deal; (2) no fixed Uber offer price is disclosed, so this agent cannot state whether €37.20 already reflects most of a negotiated deal value or embeds a large completion-risk discount; (3) the €2,588.4m convertible-bond overhang is not netted into any of the equity bridges above and would dilute the per-share figures if the bonds are in the money.

## 6. Relative Read

On EV/Sales — the most reliable multiple for this cohort — DHER trades at a 62–72% discount to its six-peer median, and that discount survives even after the stock has more than doubled on Uber's acquisition offer. Roughly half of that gap looks warranted by DHER's weak business quality (34/100), no proven moat, sub-cost-of-capital returns, and higher leverage than Uber or DoorDash; the other half is a peer-set composition effect, since DHER's multiple is close to its true quality-matched peers (Meituan, Swiggy), both also loss-making, still-scaling marketplaces. The quality-adjusted peer-multiple base case implies ≈€79/share (dispersion ≈€71–€158), a large gap to the current €37.20 — but that gap has to be read against a price that is itself an active M&A arbitrage on undisclosed deal terms, not a standalone mispricing an investor can expect to close through ordinary re-rating.



---

## valuation / 04_intrinsic-dcf.md

_Source: `04_intrinsic-dcf.md`_

# Intrinsic DCF — DHER (Delivery Hero SE)

**Business type: Operating** (two-sided food/quick-commerce marketplace and logistics network; `business-model/02_business-identity.md`: "FCFF DCF and EV/EBITDA multiples are the applicable general method — no REIT/bank/insurer-style method applies here"). The FCFF (free cash flow to the firm — cash generated by the whole business before debt payments) DCF below is the correct method per the Business-Type Method Map in `MODULE_RULES.md`.

**Deal-contamination flag, stated up front (carried from `01_price-and-capital-structure.md`).** DHER is the subject of a live, announced Uber acquisition offer (M&A call, 2026-07-16). The current price (€37.20, 2026-08-07) reflects deal-completion odds and an unspecified assumed offer premium, not a standalone-fundamentals read — it is >130% above the €15.73 pre-announcement price (2026-03-26). This DCF is built entirely on standalone fundamentals, ignoring the deal; §6 and §8 compare the result to **both** prices.

**Partial-data notes carried forward:** (1) no audited FY2025 Annual Report exists in the data pool — FY2025 figures come from the FY2025 earnings-call transcript and a Capital IQ workbook export, cross-checked against each other (`earnings/01_historical-financials.md`); (2) the fully diluted share count is not computable — €2,588.4m of convertible bonds (~23% of market cap) have no disclosed conversion price/ratio in the pool, so this DCF uses the basic/latest share count (303,744,978) per `01`'s instruction, with the dilution risk carried as an unquantified caveat in §6.

---

## 1. FCF Base & Normalizations

**Base year: FY2025 (year ended 31 December 2025).** Reporting standard: IFRS as adopted by the EU. Reporting currency: EUR million.

| Item | Base-Year Value | Normalization Applied | Source |
|---|---:|---|---|
| Revenue | 14,059.6 | None | `earnings/01_historical-financials.md` §1 |
| Reported EBIT (statutory Operating Income) | 93.7 (0.7% margin) | **Not used as the DCF base** — distorted by a €259.7m goodwill impairment and a swing in "management adjustments"/legal provisions (§ below) | CIQ Income Statement tab; `earnings/06_earnings-quality.md` §5, §7 |
| Adjusted EBITDA (company-defined, non-GAAP) | 903.0 (6.42% margin) | None (company's own headline metric; excludes SBC, restructuring/M&A costs, goodwill impairments, ROU depreciation) | FY2025 Earnings Call, CFO prepared remarks; `earnings/01_historical-financials.md` §1, footnote 1 |
| Less: D&A (cash-flow-statement basis) | 365.5 (2.6% of revenue) | None | `earnings/03_margin-drivers.md` §2 |
| Less: Stock-based compensation (SBC) | 224.1 (1.6% of revenue) | **Added back as a real economic cost** — SBC is excluded from the company's Adjusted EBITDA by definition, but it dilutes shareholders every year (5 of 5 years positive, `earnings/06_earnings-quality.md` §4) and is treated here as a genuine (non-cash) operating expense, per CLAUDE.md §15 hygiene (no silent use of a management-adjusted number) | `earnings/06_earnings-quality.md` §4 |
| **= Normalized EBIT (this agent's own build)** | **313.4 (2.23% margin)** | Adjusted EBITDA − D&A − SBC. Not a company-published line. | This agent's calculation |
| Normalized tax rate | 25% | **Reconciled to `business-model/09_moat.md` §3's own NOPAT build** — the moat module's structural rate is the midpoint of the company's own disclosed 15.0%–35.0% statutory CGU tax-rate range used in its FY24 goodwill-impairment testing (FY24 Annual Report, Note F.1.b). Used identically here so the DCF and the moat ROIC do not diverge on the tax rate (MODULE_RULES §3 reconciliation requirement). *Inference, not from filings — the company does not disclose one blended structural rate.* | `business-model/09_moat.md` §3 |
| **= Normalized NOPAT (base year)** | **235.1** (= 313.4 × (1 − 25%)) | — | This agent's calculation |

**FCFF identity used, and why:** `FCFF = NOPAT + D&A − capex − ΔNWC` (Economic Consistency Gate 1, income-statement/balance-sheet build), **not** `CFO − capex`. FY2025 CFO (€79.5m) is severely distorted by an estimated ~€600–650m one-off legal/regulatory cash outflow (EU antitrust settlement plus Glovo Spain rider-reclassification payments) that collapsed cash conversion to 8.8% of Adjusted EBITDA — the single largest earnings-quality finding in `earnings/06_earnings-quality.md` (RF-EQ-002; earnings-quality score 36/100, "Poor quality"). Anchoring the DCF on FY2025's raw CFO would embed a non-representative one-off into every forecast year; the NOPAT-based build avoids that.

**Partial-data cap:** earnings quality is scored 36/100 ("Poor") and no audited FY2025 filing exists in the pool. Intrinsic confidence is capped below the level a clean, audited base year would support (see §8).

---

## 2. Forecast Assumptions

7-year explicit forecast, FY2026–FY2032, fading into a terminal state. All figures EUR million unless stated as %.

| Assumption | FY26 | FY27 | FY28 | FY29 | FY30 | FY31 | FY32 | Terminal | Source / Basis |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|
| Revenue growth % | 11.3% | 9.0% | 8.0% | 7.0% | 6.0% | 5.0% | 4.0% | 3.0% | FY26: **Street consensus** mean, 14 analysts, `earnings/04_guidance-consensus.md` §3 (company guides only qualitatively, "above GMV growth"). FY27+: **analyst assumption**, fading toward the top of the 8–10% guided GMV range and then below it as the own-delivery mix-shift tailwind fades (already flagged as decelerating, `earnings/03_margin-drivers.md` §5) |
| Adjusted EBITDA margin % | 5.97% | 6.5% | 6.9% | 7.1% | 7.2% | 7.2% | 7.2% | 7.2% | FY26: **company guidance midpoint** (€935m) ÷ Street consensus revenue. FY27+: **analyst assumption** — margin expansion continues but is deliberately capped (not extrapolated to Uber's 10.7% or even DoorDash's 5.3% EBIT-margin peer level) because `business-model/09_moat.md` found **"No moat proven"** at group level (§3 below explains why the cap matters) |
| D&A (% of revenue) | 2.5% | 2.4% | 2.3% | 2.2% | 2.1% | 2.0% | 2.0% | 2.0% | **Analyst assumption**, continuing the observed decline (3.1% FY24 → 2.6% FY25, `earnings/03_margin-drivers.md` §2) |
| SBC (% of revenue) | 1.5% | 1.4% | 1.3% | 1.2% | 1.1% | 1.0% | 1.0% | 1.0% | **Analyst assumption** — company guides SBC "broadly stable" in absolute euros (FY2025 Earnings Call, CFO remarks); modelled here as declining % of a growing revenue base, consistent with that guidance |
| Capex (% of revenue) | 2.3% | 2.2% | 2.15% | 2.1% | 2.05% | 2.0% | 2.0% | 2.0% | **Analyst assumption**, close to the FY2025 actual (2.32% of revenue, broad capex = PP&E + capitalized intangibles, `earnings/01_historical-financials.md` §1 footnote 2), tapering slightly |
| Δ Working capital (cash-conversion-cycle days) | 2.7 | 2.5 | 2.3 | 2.1 | 2.0 | 2.0 | 2.0 | 2.0 | **Days-of-sales driver**, per `earnings/06_earnings-quality.md` §3 (DSO 12.6 + DIO 6.3 − DPO 15.9 = 2.9 days, FY2025). NWC ≈ (CCC days/365) × Revenue. **Analyst assumption** that the already-improving cycle (12.3 → 8.3 → 2.9 days, FY23–FY25) continues to shrink slightly then holds |
| Tax rate % | 25% | 25% | 25% | 25% | 25% | 25% | 25% | 25% | Held flat — see §1 (reconciled to `business-model/09_moat.md` §3) |

Every non-FY26 cell is an **analyst assumption, not company-guided** — DHER does not publish multi-year guidance. FY26 revenue growth and the Adjusted EBITDA margin are anchored to Street consensus / management's own guidance midpoint respectively.

---

## 3. Discount Rate (WACC)

| Component | Value | Source |
|---|---:|---|
| Risk-free rate | 3.20% | German 10-year Bund yield, **web-sourced**, 2026-08-11 (Trading Economics/CNBC quote) — labelled, dated, unverified |
| Equity-risk premium | 4.17% | Damodaran Germany "mature-market floor" country ERP, **web-sourced**, July-2026 data update — labelled, dated, unverified |
| Beta | 1.2 | **Company-disclosed** entity-specific beta factor used in DHER's own FY24 goodwill-impairment (IAS 36) testing — FY24 Annual Report, Note F.1.b, p.168–169 |
| Cost of equity (k_e) | 8.20% | CAPM: k_e = rf + β×ERP (the return equity investors require, given the stock's market risk) |
| Pre-tax cost of debt (k_d) | 7.50% | **Derived**: FY2025 interest expense (€382.1m, CIQ Income Statement tab) ÷ average FY2024–FY2025 total debt (€5,146.45m, Capital Structure Summary tab) = 7.42%, rounded to 7.5% and **cross-checked** to DHER's S&P issuer credit rating of **B** (Company Comparable Analysis, Credit Health Panel) — a single-B euro-denominated credit typically carries a spread well above the ~296bp blended (mostly BB) Euro High-Yield index average (ICE BofA, web-sourced), consistent with a ~7.5–8.0% all-in pre-tax cost. The disclosed weighted-average coupon across DHER's actual debt instruments (~4.3%, Capital Structure Details tab) is **not used directly** — it understates the true cost of debt because ~56% of the debt stack (€2,588.4m of the €4,625.5m FY2025 total) is low-coupon convertible bonds priced for their embedded equity option, not for credit risk alone |
| Tax rate | 25% | Same normalized rate as NOPAT, §1 |
| Equity / debt weights (market value) | 70.95% / 29.05% | Equity = market cap €11,299.3m; Debt = total debt €4,625.5m (both from `01_price-and-capital-structure.md` §3–§4, the canonical anchor). No preferred equity |
| **WACC** | **7.45%** | See formula and executed snippet below |

**Formula (pinned, not eyeballed):** `WACC = w_e·k_e + w_d·k_d·(1 − t)` (no preferred equity, so no `w_p` term).

**Executed calculation:**
```
=== 1. WACC BLEND ===
k_e = rf + beta*ERP = 0.0320 + 1.2*0.0417 = 0.0820 (8.20%)
k_d (pretax) = 7.50%  after-tax = 0.0750*(1-0.25) = 0.0562 (5.625%)
w_e = 11299.3/15924.8 = 0.7095 (70.95%)   w_d = 4625.5/15924.8 = 0.2905 (29.05%)
WACC = w_e*k_e + w_d*k_d_after = 0.7095*0.0820 + 0.2905*0.0562 = 0.0745 (7.45%)
Sanity: after-tax k_d (5.62%) <= WACC (7.45%) < k_e (8.20%)  -> True
```

**WACC sanity bounds (Gate 4):** `after-tax k_d (5.62%) ≤ WACC (7.45%) < k_e (8.20%)` — satisfied, no assembly error. DHER is a mid-cap (EV ≈ €14.0bn), not a developed-market large/mega-cap, so the β>1.4-needs-justification clause does not apply; β=1.2 is used as directly company-disclosed with no override.

**Gate 4 cross-check against the moat module's own cost of capital — this is a real, material divergence, not swept aside.** `business-model/09_moat.md` §3 discloses DHER's own company-specific WACC used in goodwill-impairment testing: **10.7%** (Woowa CGU, the largest) up to **13.7%** for higher-risk CGUs (Asia-ex-Korea). That is **3.25–6.25 percentage points above** this agent's mechanically-computed 7.45% — well outside the ~2pp tolerance in MODULE_RULES §4. This is **not treated as an override** (no discretionary judgment was applied to the computed 7.45% — it is the direct CAPM/cost-of-debt blend), so the ±1.5pp override band does not apply; instead, per the rule, **§7's sensitivity grid is widened to span both** the computed WACC and the moat-disclosed range, and §6/§8 report the base case at the computed WACC while flagging the much lower values the moat-consistent WACC would imply. The gap likely reflects that impairment-testing WACCs are deliberately conservative/prudential across risky, often-EM CGUs, while the CAPM build here uses a single group-level beta and a euro risk-free rate — both defensible, but the reader should not treat 7.45% as the only credible number.

---

## 4. Free Cash Flow Forecast & Discounting

Currency: EUR million.

| Year | Revenue | EBIT | NOPAT | Capex | ΔWC | FCF | Discount Factor (t−0.5) | PV of FCF |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| FY2026 | 15,648.3 | 308.3 | 231.2 | 359.9 | +4.05 | 258.5 | 0.9647 | 249.3 |
| FY2027 | 17,056.7 | 460.5 | 345.4 | 375.2 | +1.07 | 378.4 | 0.8978 | 339.7 |
| FY2028 | 18,421.2 | 607.9 | 455.9 | 396.1 | −0.75 | 484.3 | 0.8355 | 404.6 |
| FY2029 | 19,710.7 | 729.3 | 547.0 | 413.9 | −2.67 | 569.4 | 0.7775 | 442.7 |
| FY2030 | 20,893.3 | 835.7 | 626.8 | 428.3 | +1.08 | 636.2 | 0.7236 | 460.3 |
| FY2031 | 21,938.0 | 921.4 | 691.0 | 438.8 | +5.72 | 685.3 | 0.6734 | 461.5 |
| FY2032 | 22,815.5 | 958.3 | 718.7 | 456.3 | +4.81 | 713.9 | 0.6267 | 447.4 |

**Working-capital sign check.** DHER's operating working capital is small and slightly positive (cash-conversion cycle 2.9 days FY2025 — receivables + a thin inventory book, less payables). As revenue grows and the CCC ratio is held/slightly compressed, the €-value of net working capital still rises slowly (Revenue effect dominates a shrinking-but-still-positive day count) — a small, recurring cash **use** (ΔNWC positive = subtracts from FCF) in most years, turning briefly to a small cash **release** in FY2028–FY2029 when the day-count compression outpaces revenue growth. Both signs are shown above and are consistent with the actual modelled ΔNWC path, not assumed from a fixed convention.

**Mid-year convention used** (cash flows arrive on average mid-period; discounting at t−0.5, not end-of-year, per DCF Calculation Standard 8).

**Sum of PV of explicit FCFs (FY2026–FY2032) = €2,805.5m.**

**Executed calculation (forecast build, discounting, PV sum):**
```
=== 2. EXPLICIT FORECAST FY2026-FY2032 (base case) ===
Year         Rev   EBITDA     D&A     SBC     EBIT    NOPAT   Capex   dNWC      FCF
2026     15648.3    934.2   391.2   234.7    308.3    231.2   359.9   4.05    258.5
2027     17056.7   1108.7   409.4   238.8    460.5    345.4   375.2   1.07    378.4
2028     18421.2   1271.1   423.7   239.5    607.9    455.9   396.1  -0.75    484.3
2029     19710.7   1399.5   433.6   236.5    729.3    547.0   413.9  -2.67    569.4
2030     20893.3   1504.3   438.8   229.8    835.7    626.8   428.3   1.08    636.2
2031     21938.0   1579.5   438.8   219.4    921.4    691.0   438.8   5.72    685.3
2032     22815.5   1642.7   456.3   228.2    958.3    718.7   456.3   4.81    713.9

=== 3. MID-YEAR DISCOUNTING & PV SUM ===
2026: FCF=258.5  t=0.5  DF=1/(1+0.0745)^0.5=0.9647  PV=249.3
2027: FCF=378.4  t=1.5  DF=1/(1+0.0745)^1.5=0.8978  PV=339.7
2028: FCF=484.3  t=2.5  DF=1/(1+0.0745)^2.5=0.8355  PV=404.6
2029: FCF=569.4  t=3.5  DF=1/(1+0.0745)^3.5=0.7775  PV=442.7
2030: FCF=636.2  t=4.5  DF=1/(1+0.0745)^4.5=0.7236  PV=460.3
2031: FCF=685.3  t=5.5  DF=1/(1+0.0745)^5.5=0.6734  PV=461.5
2032: FCF=713.9  t=6.5  DF=1/(1+0.0745)^6.5=0.6267  PV=447.4
SUM PV of explicit FCFs (FY2026-FY2032) = 2805.5
```

---

## 5. Terminal Value

**Method: Gordon growth (base case).** `TV = FCFF_{n+1} / (WACC − g) = FCFF_2032 × (1 + g) / (WACC − g)`, where FCFF_2032 = €713.9m and g = 3.0% (analyst assumption, at the long-run nominal-GDP proxy for the euro area — DHER reports in EUR even though ~85% of revenue is earned outside the eurozone, so the reporting-currency ceiling applies, not a blended EM growth rate). `WACC − g` = 7.45% − 3.0% = 4.45pp, comfortably positive — not a near-convergence case.

```
=== 4. TERMINAL VALUE (Gordon growth, base case) ===
FCF_2032=713.9; FCF_2033=FCF_2032*(1+g)=713.9*(1+0.03)=735.3
TV = FCF_2033/(WACC-g) = 735.3/(0.0745-0.03) = 16505.3
PV(TV) = TV * DF(t=7) = 16505.3 * 0.6045 = 9977.9
```

- **Terminal value (undiscounted): €16,505.3m**
- **PV of terminal value: €9,977.9m**
- **Terminal value as % of total EV: 78.1%** — **exceeds the 75% threshold: this DCF is flagged terminal-dominated and low-confidence** (Gate 5). A second lens is required and shown below.

**Exit-multiple cross-check (Gate 5 second lens).** Implied exit EV/EBITDA = TV ÷ terminal (FY2032) Adjusted EBITDA = €16,505.3m ÷ €1,642.7m = **10.05x**. For context, the market currently prices DHER (on the deal-contaminated price) at forward EV/EBITDA multiples ranging from 14.7x (FY2026) down to 7.4–11.5x across FY2027–FY2033 (`DeliveryHeroSEXTRADHEREstimatesReport.xls, Multiples tab`). The 10.05x implied exit multiple sits inside that observed range — the Gordon-growth TV is not obviously unreasonable on a multiple basis, even though it is still terminal-dominated.

**Financeable-growth cross-check (Gate 2 — a real, unreconciled gap):**
```
=== 7. GATE 2 FINANCEABLE-GROWTH CROSS-CHECK ===
FY2032 reinvestment rate = (capex-D&A+dNWC)/NOPAT = (456.3-456.3+4.81)/718.7 = 0.67%
FY2032 ROIC (gross invested capital, rolled fwd from moat's FY24-25 avg EUR7,399.6m) = 718.7/7289.7 = 9.86%
Implied financeable growth = ROIC x reinvestment rate = 9.86% x 0.67% = 0.07%
Modeled terminal g = 3.0%  Gap = 2.93pp (> 1.5pp threshold -> confidence capped, grid shown at financeable g too)
```
Implied financeable growth (~0.1%) sits 2.93pp below the modelled terminal g (3.0%) — well outside the ~1.5pp tolerance. **Qualitative bridge, not fully quantified:** DHER is genuinely capital-light (business-model capital-intensity score 76/100 — capex only ~1.1–2.3% of revenue) because its real "growth capital" is customer-acquisition **marketing spend**, which runs through opex (already embedded in, and capping, the margin path in §2) rather than through capex — the classical reinvestment-rate formula, built on capex minus D&A, structurally undercounts this. That bridge is directional, not quantified to the euro. Per Gate 2's teeth, this DCF therefore (a) **caps intrinsic confidence** (see §8) and (b) shows the sensitivity grid **at the financeable g (~0.1%)** in §7 alongside the base case, rather than asserting the 3.0% modelled g stands unchallenged.

**Structural-decline / runoff terminal — mandatory trigger fired twice.** Per `MODULE_RULES.md`, this scaling is required because **two** independent triggers fire: (a) `business-model/09_moat.md` verdict is **"No moat proven"** — group-level ROIC (0.8%–1.6% best year, ≈ −6.1% through-cycle) sits below the company's own 10.7%–13.7% disclosed cost of capital by 900–1,700+ basis points; and (b) `business-model/07_business-quality.md` scores industry rate-of-change/disruption at **26/100** (≤40 — RF-BQ-005, active decay/high-disruption trigger: repeated competitor consolidation, DHER itself is a live M&A target). Trigger (a) is reflected in the base case above by capping margin expansion well short of what the model could otherwise support (§2, §7 explicit note) — no perpetual excess return is assumed. Trigger (b) requires **also** building a separate declining-perpetuity/runoff terminal, shown below as the structural-reset **bear input** (it does **not** replace the base case):

- Explicit bear path: revenue growth fading 8%→2%, Adjusted EBITDA margin **compressing** 5.5%→4.2% (the rider-cost-inflation stress case from `earnings/07_earnings-sensitivity.md` §6 — a 245bp reclassification-driven hit with no disclosed pass-through mechanism, applied cumulatively), terminal g = **1.0% nominal** (below the ECB's ~2% inflation target — a real-terms decline, stated on the same nominal basis as the rest of this model).

```
=== 8. RUNOFF / DECLINING-PERPETUITY TERMINAL (structural-reset bear input, not base) ===
PV explicit FCF (bear) = 863.2; TV (g=1.0%) = 1555.3; PV(TV) = 940.2
EV = 1803.4; TV%EV=52.1%; Equity = 1803.4-2512.8-154.2 = -863.6; per share = -2.84
```

This runoff case produces an **enterprise value of only €1,803.4m against €2,512.8m of net debt and €154.2m of minority interest — equity value goes negative (−€863.6m, −€2.84/share)**. This is the DCF-side counterpart to a balance-sheet-survival read: if the rider-cost/regulatory bear case and continued competitive erosion both materialize with no pricing offset, DHER's standalone equity value is close to wiped out by its debt load. This is a **structural-reset bear scenario feeding `07_scenario-and-fair-value`**, not the base-case intrinsic value below.

---

## 6. DCF Output

| Step | Value |
|---|---:|
| PV of explicit FCFs | €2,805.5m |
| + PV of terminal value | €9,977.9m |
| **= Enterprise value** | **€12,783.5m** |
| − Net debt (strict basis, FY2025, per `01`) | €2,512.8m |
| − Minority / preferred | €154.2m |
| **= Equity value** | **€10,116.5m** |
| ÷ Diluted shares (basic/latest, per `01` — fully diluted count not computable) | 303,744,978 |
| **= Intrinsic value per share (base case)** | **€33.31** |
| vs current price (€37.20, 2026-08-07, **deal-contaminated**) | −10.5% (intrinsic below current price) |
| vs pre-deal price (€15.73, 2026-03-26) | +111.8% (intrinsic well above the pre-announcement price) |

**Executed calculation:**
```
=== 5. EV -> EQUITY -> PER SHARE ===
EV = SUM PV FCF + PV(TV) = 2805.5 + 9977.9 = 12783.5
TV as % of EV = 78.1%
Equity value = EV - net debt - minority = 12783.5 - 2512.8 - 154.2 = 10116.5
Per-share = Equity value / shares = 10116.5 / 303.744978 = 33.31
```

**Convertible-bond overhang, not netted in.** €2,588.4m of convertible bonds (~23% of market cap) have no disclosed conversion price/ratio in the pool (`01_price-and-capital-structure.md` §2). If materially in-the-money and converted, per-share intrinsic value above would be diluted further downward (mechanically, adding shares to the denominator without adding cash to the numerator, since the bonds are already inside net debt) — this DCF's per-share figure should be read as a **ceiling**, not adjusted for this unquantified risk.

**Reading the current price against this DCF is a read on deal-completion risk, not on DHER's standalone value** (per `01`'s explicit flag) — the base-case intrinsic value (€33.31) sits *below* the current €37.20 deal-contaminated quote but *far above* the €15.73 pre-announcement price, i.e., the DCF supports roughly half of the deal-driven re-rate on standalone fundamentals alone, with the rest reflecting the market's assessment of the Uber offer.

---

## 7. Sensitivity Grid (per-share intrinsic value)

Standard grid (WACC ±1%, g ±0.5% around the base case):

| | WACC −1% (6.45%) | WACC (7.45%) | WACC +1% (8.45%) |
|---|---:|---:|---:|
| g +0.5% (3.5%) | €53.92 | €37.64 | €27.95 |
| g (3.0%) | €46.02 | **€33.31** | €25.28 |
| g −0.5% (2.5%) | €40.11 | €29.85 | €23.06 |

**Extended cross-check grid — spanning the Gate 4 WACC divergence and the Gate 2 financeable-growth gap** (required because both diverge from the base assumptions by more than their respective tolerances):

| | WACC (7.45%, computed) | Moat-disclosed WACC-low (10.7%) | Moat-disclosed WACC-high (13.7%) |
|---|---:|---:|---:|
| g (3.0%, modelled) | €33.31 | €14.91 | €7.92 |
| financeable g (~0.1%, Gate 2) | €19.79 | €11.09 | €6.12 |

The standard grid alone (€23.06–€53.92) understates how fragile this number is: once the WACC is read at DHER's own disclosed cost of capital (10.7%–13.7%) and/or growth is capped at the financeable rate, intrinsic value per share falls to **€6–€15**, materially below even the pre-deal price.

---

## 8. Intrinsic Read

**Base-case intrinsic value: €33.31/share** (WACC 7.45%, terminal g 3.0%, Gordon growth, mid-year discounting), sitting 10.5% below the current deal-contaminated price (€37.20) and 111.8% above the pre-announcement price (€15.73). The standard sensitivity grid disperses that point across **€23–€54**; a wider, methodologically-required cross-check (spanning the moat module's own 10.7%–13.7% cost-of-capital disclosure and the unreconciled Gate 2 financeable-growth gap) pulls the range down to **€6–€20** — a reminder that this DCF is terminal-dominated (78% of EV) and rests on a base year with poor earnings quality (36/100) and no audited FY2025 filing in the pool, so confidence in the point estimate is capped, not high. The single assumption this value is most sensitive to is the **discount rate**: moving WACC from the mechanically-computed 7.45% to DHER's own company-disclosed 10.7% cuts intrinsic value by more than half (€33.31 → €14.91 at the same 3.0% growth), and the structural-reset/runoff scenario (triggered by the "No moat proven" verdict and the industry's ≤40 rate-of-change score) shows equity value can go **negative** if the rider-cost/competitive bear case materializes without a pricing offset — that is the single most important read for a downstream fair-value triangulation: DHER's intrinsic value is real but sits well below where the stock currently trades, and the deal premium, not standalone cash generation, explains most of the gap to €37.20.



---

## valuation / 05_reverse-dcf.md

_Source: `05_reverse-dcf.md`_

# Reverse DCF — What's Priced In — DHER (Delivery Hero SE)

**Business type: Operating** (per `04_intrinsic-dcf.md` and `business-model/02_business-identity.md`) — this reverse-DCF inverts an FCFF (free cash flow to the firm) model, not a bank/REIT equity-direct model.

**Deal-contamination flag — read this before the numbers below.** DHER is the subject of a live, announced Uber acquisition offer (M&A call, 2026-07-16), with no fixed offer price disclosed anywhere in the pool. The current price (€37.20, 2026-08-07) is therefore not a clean read of standalone fundamentals — it embeds the market's assessment of deal-completion odds and an unspecified assumed premium. **A reverse-DCF solved off €37.20 is really solving for a blend of (a) deal-completion probability and (b) whatever standalone growth/margin assumptions the market separately holds — the two cannot be disentangled without a disclosed offer price, and this agent does not attempt to.** Per the orchestrator's instruction, this report solves what BOTH the current deal-contaminated price (€37.20) and the pre-announcement price (€15.73, 2026-03-26) imply, and treats the gap between the two solves as the deal-premium effect rather than a standalone-fundamentals signal.

This agent inverts the SAME model as `04_intrinsic-dcf.md`: same WACC (7.45%), same terminal growth (3.0%), same 7-year explicit horizon (FY2026–FY2032), same mid-year discounting convention for explicit cash flows and end-of-year discounting for the terminal value. Only the growth/margin assumption is solved for.

## 1. Inputs

| Input | Value | Source |
|---|---:|---|
| Current price (deal-contaminated) | €37.20 (2026-08-07) | `01_price-and-capital-structure.md` §1, pool-verified |
| Pre-announcement price | €15.73 (2026-03-26) | `01_price-and-capital-structure.md` §1, Capital IQ Historical Capitalization tab |
| Shares (latest basic, used for both) | 303.744978m | `01` §2 |
| Net debt (strict, FY2025) | €2,512.8m | `01` §5 |
| Minority interest | €154.2m | `01` §4 |
| EV @ current price | €13,966.3m (= mkt cap €11,299.3m + net debt + minority) | Reproduces `01`'s own EV bridge exactly |
| EV @ pre-deal price | €7,444.9m (= mkt cap €4,777.9m + net debt + minority) | This agent's calc — uses the SAME FY2025 net debt/minority, which is a defensible pairing since Dec-31-2025 balance-sheet net debt is close in time to the 2026-03-26 pre-deal quote (that quote is the FY2025 results-filing date) |
| FCF base (year 0, FY2025 normalized) | €274.7m | This agent's calc, built on `04`'s own normalized-NOPAT methodology: Adjusted EBITDA €903.0m − D&A €365.5m − SBC €224.1m = Normalized EBIT €313.4m; NOPAT = €313.4m × (1−25%) = €235.0m; FCF = NOPAT + D&A − Capex (€325.8m) − ΔNWC (set to 0 for the static base year) = €274.7m |
| Discount rate (WACC) used | **7.45%**, taken verbatim from `04_intrinsic-dcf.md` §3 (CAPM k_e 8.20% [rf 3.20% + β1.2 × ERP 4.17%], after-tax k_d 5.62%, blended at market-value weights 70.95%/29.05% equity/debt) | `04` §3 — NOT re-derived here |
| Terminal growth (g) | **3.0%**, taken verbatim from `04` §5 (euro-area long-run nominal-GDP proxy) | `04` §5 |
| Forecast horizon | 7 years (FY2026–FY2032) + Gordon-growth terminal | `04` §2, §5 |
| Discounting convention | Mid-year (t−0.5) for explicit FCFs; full-year (t=7) for the terminal value | `04` §4–§5, held identical here |

**What is held fixed vs. solved for.** WACC, terminal g, the 7-year horizon, the discounting convention, and the FY2025 normalized FCF base are all held fixed at `04`'s values. The single free variable in the primary solve is a constant annual FCF growth rate applied for 7 years; two secondary solves instead hold the growth SHAPE fixed (either `04`'s own revenue growth path, or a fixed high-growth phase followed by a drop to terminal g) and solve for margin or the number of high-growth years instead.

## 2. Implied Expectations

**Solver: `scipy.optimize.brentq` root-find, executed via Python (`/tmp/dher_reverse_dcf.py`), not hand-computed.** Full runs and outputs below.

Primary solve — model: `FCF_t = FCF_base × (1+g)^t` for t = 1..7, discounted at WACC (mid-year), plus a Gordon-growth terminal value (`TV = FCF_7 × (1+3.0%) / (7.45% − 3.0%)`, discounted at t = 7) — solved for the constant `g` that reproduces the target EV:

```
def ev_from_g(g, fcf0, wacc=0.0745, tg=0.03, n=7):
    pv = 0.0; fcf_t = fcf0; fcf_list = []
    for t in range(1, n+1):
        fcf_t = fcf0 * (1+g)**t
        fcf_list.append(fcf_t)
        pv += fcf_t / (1+wacc)**(t-0.5)
    TV = fcf_list[-1] * (1+tg) / (wacc - tg)
    return pv + TV/(1+wacc)**n
# brentq(lambda g: ev_from_g(g, 274.7) - target_EV, ...)
```

Roots returned:
- **EV target €13,966.3m (current price €37.20): g = 16.47%**
- **EV target €7,444.9m (pre-deal price €15.73): g = 5.49%**
- Check: `ev_from_g(0.1647, 274.7)` = €13,966.3m ✓ (PV explicit €2,787.7m + PV terminal €11,178.6m; terminal = 80.0% of this reverse-solved EV, close to `04`'s own 78.1%)

Cross-check against `04`'s own (non-uniform, margin-expanding) forecast: `04`'s own FCF path implies a 6-year FY26→FY32 CAGR of `(713.9/258.5)^(1/6) − 1 = 18.45%` — a higher headline CAGR than the 16.47% smooth solve above, yet it produces a LOWER value (€33.31/share) than €37.20. This is because `04`'s growth is back-loaded (FY26 FCF conversion is deliberately depressed, ramping up over time), whereas the uniform 16.47% solve front-loads more cash into the earlier, less-discounted years — the two are not contradictory, they are different growth SHAPES with the same net effect measured differently. **Flagged, not glossed over.**

Secondary solve — implied steady-state Adjusted EBITDA margin, holding `04`'s own revenue growth path fixed (11.3%→9.0%→8.0%→7.0%→6.0%→5.0%→4.0%, terminal 3.0%) and its D&A%/SBC%/capex%/ΔNWC schedule fixed, solving for a single constant margin `m` applied to all 7 years:

```
=== SECONDARY SOLVE ===
Implied steady-state Adj. EBITDA margin @ current price: 7.48%
Implied steady-state Adj. EBITDA margin @ pre-deal price: 5.44%
Reference points: FY2025 actual = 6.4%; 04's own (capped) terminal margin = 7.2%; FY2026 guidance midpoint = 5.97%
```

Tertiary solve — fade model: N years at a high growth rate before dropping straight to terminal g (3.0%):

```
=== TERTIARY SOLVE ===
At 15% growth phase: EV at N=0 yrs = €6,419.0m; EV at N=7 yrs (all years at 15%) = €12,869.5m
Current-price target (€13,966.3m) EXCEEDS the full-horizon 15% case
  -> the current price requires MORE than 15% growth sustained through the ENTIRE 7-year window
At 20% growth phase: implied years @ current price = 6.00 yrs (of 7); @ pre-deal price = 1.00 yr (of 7)
At 15% growth phase: implied years @ pre-deal price = 2.00 yrs (of 7)
```

| What the Price Implies | Current price (€37.20) | Pre-deal price (€15.73) |
|---|---:|---:|
| Implied FCF CAGR over the 7-year horizon (primary) | **16.47%** | **5.49%** |
| Implied steady-state Adj. EBITDA margin (secondary, `04`'s revenue path held fixed) | 7.48% | 5.44% |
| Implied years of above-GDP growth (tertiary, fade model) | >7 yrs at 15%/yr (undershoots even at full horizon); ≈6.0 yrs at 20%/yr | 2.0 yrs at 15%/yr; ≈1.0 yr at 20%/yr |

## 3. Implied vs Achievable

| Implied Requirement | Company History | Earnings-Module Evidence | Achievable? |
|---|---|---|---|
| Implied FCF CAGR = 16.47%/yr for 7 yrs (current price) | Revenue growth is decelerating every year — +46.5% (FY22) → +15.9% (FY23) → +23.7% (FY24) → +14.4% (FY25) → +11.3% (FY26 Street consensus) [`earnings/01_historical-financials.md` §1, §6]. Adjusted EBITDA growth decelerated even more sharply: +173% (FY24 YoY) → +30% (FY25 YoY) [`earnings/01` §1] | FY2026 Street EBITDA estimates were cut ~30% over the trailing 12 months (€1,366m → €952m) [`earnings/04_guidance-consensus.md` §4]; the single largest earnings-sensitivity variable, rider-cost inflation with no disclosed pass-through, has a bear case of −€344.5m — 38% of FY2025 Adjusted EBITDA — in one regulatory outcome [`earnings/07_earnings-sensitivity.md` §2, §6]; group ROIC (0.8%–1.6% best year, ≈−6.1% through-cycle) sits 900–1,700bps below the company's own disclosed 10.7%–13.7% cost of capital — "No moat proven" [`business-model/09_moat.md` §3] | **Stretch / No** |
| Implied FCF CAGR = 5.49%/yr for 7 yrs (pre-deal price) | Sits well below even the already-decelerating trend (FY26 guide 11.3% revenue growth alone) | Consistent with a company that has tracked its own Adjusted EBITDA guidance closely for 3 straight years [`earnings/04` §6] | **Yes** |
| Implied steady-state Adj. EBITDA margin = 7.48% (current price) | FY2025 actual margin 6.4%, expanding but decelerating (+814bps→+800bps→+308bps→+79bps YoY, FY2021–FY2025) [`earnings/01` §6] | `04`'s OWN base case deliberately caps terminal margin at 7.2% — below even Uber's 10.7% EBIT margin and DoorDash's 5.3% — specifically because the moat module found no defensible advantage to justify going higher [`04_intrinsic-dcf.md` §2]. 7.48% sits just above that already-conservative cap | **Stretch** |
| Implied FCF CAGR = 5.44%-margin case (pre-deal) | Below FY2026 guidance midpoint (5.97%) | Achievable without assuming any moat-dependent margin breakout | **Yes** |

In 2–4 sentences: the market's implied expectations at the deal-contaminated €37.20 price (16.47% FCF CAGR for 7 straight years, or a steady-state margin above `04`'s own deliberately capped 7.2% ceiling) are **aggressive** — they require DHER's profit growth to reaccelerate against a trend that has been decelerating for two straight years, on a company that the moat module found earns below its own disclosed cost of capital and that carries a going-concern flag on a material subsidiary (Glovo Spain rider-classification risk, €440–770m contingent liability) [`business-model/01_disqualifier-scan.md` §2]. By contrast, the pre-announcement price (€15.73) implies only 5.49% FCF CAGR — comfortably inside the company's own recently-guided and closely-tracked trajectory, and closer to what the standalone evidence actually supports.

**Market-ceiling sanity check (one-directional).** Translating the 16.47% implied FCF CAGR into an implied revenue trajectory (holding the FCF/Revenue conversion ratio at `04`'s own terminal level of 3.13%) implies FY2032 revenue of roughly **$28.9bn** (from FY2025's ~$15.9bn, at the FY2025 average EUR/USD rate of 1.1306 used in `business-model/09_moat.md` §3). Against a **web-sourced** (Fortune Business Insights, accessed 2026-08-12, unverified, labelled per §4) global meal-delivery market of ~$350.6bn in 2026 growing at a stated 9.58% CAGR (implying ~$607bn by 2032), that implied revenue is only **~4.5%→4.8% of the addressable market** — a modest, plausible increment, not an implausible-share capture. **This check does NOT trip the market-ceiling kill signal** — it does not make the case for the implied growth, it simply confirms the aggressiveness identified above is a margin/competitive-durability problem (no proven moat, decelerating trend, regulatory tail risk), not a market-size problem. This is a low-tier, web-sourced, GMV-vs-revenue-approximated proxy and is treated as directional context only, not as evidence on its own.

## 4. Robustness

*All roots below from the same executed `brentq` solver as §2; full script output in `/tmp/dher_reverse_dcf.py`.*

| Discount Rate | Implied FCF CAGR to Justify Current Price (€37.20) |
|---|---:|
| WACC −1% (6.45%) | 11.77% |
| WACC (7.45%) | **16.47%** |
| WACC +1% (8.45%) | 20.49% |

**FCF-base stress (derived from `earnings/07_earnings-sensitivity.md`'s own rider-cost bear/bull stress applied to the FY2025 Adjusted EBITDA base of €903.0m — the single highest-ranked earnings-sensitivity variable):**

| FCF Base Scenario | Adj. EBITDA | FCF Base | Implied FCF CAGR (current price, WACC 7.45%) |
|---|---:|---:|---:|
| Low (rider-cost bear, −€344.5m) | €558.5m | €16.4m | **77.21%** |
| Base (FY2025 actual) | €903.0m | €274.7m | **16.47%** |
| High (rider-cost bull, +€140.6m) | €1,043.6m | €380.2m | **10.71%** |

**Terminal g ±0.5% (mandatory — terminal value is 78.1% of EV in `04`'s base case, above the 60% trigger; base FCF and WACC held at base):**

| Terminal g | Implied FCF CAGR (current price) |
|---|---:|
| 2.5% | 18.07% |
| 3.0% (base) | **16.47%** |
| 3.5% | 14.68% |

**Which input dominates.** The FCF-base swing (from the rider-cost bear/bull range) moves the implied CAGR by **66.5 percentage points** (10.71%→77.21%) — a ~23x range in the underlying FCF base itself, since it starts from a small, near-zero normalized figure. The WACC ±1% swing moves the implied CAGR by only **8.7 percentage points** (11.77%→20.49%), and terminal g ±0.5% moves it by **3.4 percentage points** (14.68%→18.07%). **The FCF base — driven overwhelmingly by the single rider-cost/regulatory variable — is by far the dominant sensitivity, consistent with every other DHER valuation output in this run (`04`'s own base-vs-cross-check grid moved by more on the base/WACC axis than on g alone).** This is not a discount-rate story; it is a base-year-earnings-quality and regulatory-tail-risk story.

## 5. What's-Priced-In Read

At €37.20 (deal-contaminated), the market is pricing in roughly **16.5% annual FCF growth for 7 years**, or a steady-state Adjusted EBITDA margin above `04`'s own deliberately-capped 7.2% ceiling — **aggressive**, because it requires profit growth to reaccelerate against a two-year decelerating trend, on a business the moat module found earns below its own 10.7%–13.7% disclosed cost of capital, carries a going-concern flag on a material subsidiary, and has a single regulatory variable (rider-cost reclassification) capable of erasing 38% of Adjusted EBITDA in one outcome. This is not primarily a standalone-fundamentals read, though — €37.20 also embeds an undisclosed deal-completion premium, and this reverse-DCF cannot separate the two. At the pre-announcement price of €15.73, the market was pricing in only **~5.5% annual FCF growth** — comfortably **conservative to fair** against the company's own guided and closely-tracked trajectory. The gap between the two solves (16.5% vs. 5.5%) is the clearest quantification available in this pool of how much of the post-announcement re-rate is deal-completion odds/premium rather than a standalone re-rate of DHER's own prospects — and `04`'s own base-case intrinsic value (€33.31/share, itself 10.5% below €37.20) corroborates that the standalone case does not support the current price without the deal.



---

## valuation / 06_sum-of-the-parts.md

_Source: `06_sum-of-the-parts.md`_

# Sum-of-the-Parts — DHER (Delivery Hero SE)

**Reporting basis:** IFRS as adopted by the EU, reporting currency EUR, fiscal year ending 31 December. Delivery Hero reports five reportable segments — four regional online-marketplace ("platform") segments (MENA, Asia, Europe, Americas) plus one cross-regional operating-model segment (Integrated Verticals, the own-warehouse "Dmarts" quick-commerce business) [FY24 Annual Report, Combined Management Report, Note A.3 "Segments", p.100]. MENA is 68.3% of FY2024 Group Adjusted EBITDA — well under the 85% single-segment threshold — so this is a genuinely multi-segment business and SOTP is run in full, not collapsed [`business-model/03_segment-map.md` §2].

**Price context (carried from `01_price-and-capital-structure.md`, mandatory on every comparison below):** the current price of €37.20 (2026-08-07, pool-verified, Capital IQ) is **deal-contaminated** by Uber Technologies' pending acquisition offer for Delivery Hero, announced 2026-07-16. The stock has more than doubled from €15.73 (2026-03-26, pre-announcement). No fixed offer price was found in the pool. Every "vs current price" comparison in this report is therefore a read on deal-completion odds and assumed terms, not a clean standalone-fundamentals comparison — this is flagged inline wherever the comparison appears. Separately, ~€2,588.4m of convertible bonds (~23% of market cap) carry unquantified dilution risk: conversion prices were not found in the pool, so the per-share figures below use the basic/latest share count (303,744,978) per `01`'s Anchor Block and do **not** net this dilution in. If conversion strikes sit below the SOTP values derived here, actual per-share value would be somewhat lower than shown.

---

## 1. Segment Inventory

Primary basis: FY2024 (audited, Delivery Hero SE Annual Report, published 2025-04-25 — the most recent Tier-1 segment disclosure in the pool). "% of Total EBIT" denominator = the sum of the five reportable segments' Adjusted EBITDA, which by construction totals 100% (the segment-sum ties to Group Adjusted EBITDA almost exactly: €692.6m segment-sum vs. €692.5m Group-reported, a rounding difference) [FY24 AR, "Key Figures" p.4].

| Segment | Revenue (Total Segment Revenue basis) | Adj. EBITDA | Margin | % of Total (Segment) EBIT | Source |
|---|---:|---:|---:|---:|---|
| MENA | €3,527.8m | €472.9m | 13.4% | 68.3% | FY24 AR, "Key Figures" p.4 |
| Asia | €4,071.9m | €385.1m | 9.5% | 55.6% | FY24 AR, "Key Figures" p.4 |
| Integrated Verticals | €2,709.8m | −€98.7m | −3.6% | −14.3% | FY24 AR, "Key Figures" p.4 |
| Europe | €1,891.9m | −€77.0m | −4.1% | −11.1% | FY24 AR, "Key Figures" p.4 |
| Americas | €939.6m | €10.3m | 1.1% | 1.5% | FY24 AR, "Key Figures" p.4 |
| **Sum** | **€13,141.0m** (102.7% of Total Segment Revenue €12,796.4m — the 2.7pt excess is a disclosed −€344.5m intersegment-consolidation adjustment, not an error) | **€692.6m** (≈100% of Group Adj. EBITDA €692.5m) | — | **100.0%** | FY24 AR, p.4 "Notes" |

**FY2025 directional cross-check (unaudited, Tier 5 — Capital IQ, not the primary basis):** MENA Adj. EBITDA €546.0m (60.5% of the €902.8m segment-sum, ties to Company-reported Adjusted EBITDA €903m), Asia €333.1m (36.9%, down y/y — the only segment where Adj. EBITDA fell), Europe −€79.2m, Americas €100.0m (a sharp swing from €10.3m in FY2024), Integrated Verticals €2.9m (first year in positive territory) [`Delivery Hero SE XTRA DHER Financials.xls, Segments tab, Dec-31-2025 column`]. This widens MENA's dominance further and is used as the base year for the FY2026E forward metrics in Section 3 below, per this module's forward-basis hard rule.

**The unallocated bucket does not vanish (Reconciliation Gate 3).** Below segment Adjusted EBITDA sits a large, named, centralized reconciling item: "Unallocated Management Adjustments" (−€511.9m FY2024 / −€146.7m FY2025) plus "Unallocated Expenses for Share-Based Compensation" (−€171.1m FY2024 / −€224.1m FY2025) — together −€683.0m (FY2024) and −€370.8m (FY2025) [`Delivery Hero SE XTRA DHER Financials.xls, Segments tab`; FY24 AR, p.107]. This bucket is the reason the Group's audited IFRS operating result was a loss of −€341.3m in FY2024 despite €692.5m of segment Adjusted EBITDA [FY24 AR, p.107]. It is carried forward, capitalized and subtracted, in the Section 4 equity bridge — it is not dropped.

**Minority-interest note carried forward:** the MENA segment consolidates 100% of talabat's results even though DHER holds only an 80% economic interest following talabat's December 2024 Dubai Financial Market listing [FY24 AR, p.106; `business-model/03_segment-map.md` §1]. This is addressed explicitly in Section 4 — it materially changes the equity bridge and is the single largest data-quality finding in this report.

---

## 2. Segment Multiples & Comparables

Every segment is valued on a **forward** metric — FY2026E — because DHER discloses no analyst consensus at the segment level (only Group-level consensus exists in the pool: `earnings/04_guidance-consensus.md`). FY2026E segment metrics are therefore built from a stated, evidence-anchored method (Section 3), not fabricated, and every multiple below cites a named, forward-basis comparable.

| Segment | Metric Used (period basis) | Multiple Applied | Named Comparable | Comparable's Multiple | Source |
|---|---|---:|---|---:|---|
| MENA | FY2026E Adj. EBITDA (forward) | 12.0x EV/EBITDA | Talabat Holding plc (DFM:TALABAT) | ~12.0x FY2026-guidance-implied EV/EBITDA (EV €5,433.3m ÷ FY2026 guided Adj. EBITDA midpoint €454.2m$^{1}$) | Web-sourced, unverified: stockanalysis.com Talabat statistics, accessed 2026-08-12 (EV, market cap); Talabat FY2026 Adj. EBITDA guidance $510m–$540m per market-data aggregator search, 2026 (unverified) |
| Asia | FY2026E Adj. EBITDA (forward) | 14.2x EV/EBITDA (45% discount to comp) | Meituan (SEHK:3690) | 25.83x NTM TEV/Forward EBITDA | `Company Comparable Analysis Delivery Hero SE.xls, Trading Multiples tab`, as of 2026-08-10 (in-pool, Capital IQ) |
| Europe | FY2026E Revenue (forward) | 1.2x EV/Revenue (deal multiple, undiscounted) | DoorDash's acquisition of Deliveroo plc (announced 2025-05-06, closed 2025-10-02) | 1.2x implied EV/Revenue (EV ~£2.4bn ÷ Deliveroo FY2024 revenue ~£2.0bn) | Web-sourced, unverified: DoorDash IR press release "DoorDash Announces Agreement to Acquire Deliveroo," 2025-05-06 |
| Americas | FY2026E Revenue (forward) | 1.8x EV/Revenue (10% discount to comp) | Swiggy Limited (NSEI:SWIGGY) | 1.98x NTM TEV/Forward Total Revenue | `Company Comparable Analysis Delivery Hero SE.xls, Trading Multiples tab`, as of 2026-08-10 (in-pool, Capital IQ) |
| Integrated Verticals | FY2026E Revenue (forward) | 0.95x EV/Revenue (64% discount to comp) | Eternal Limited / Zomato-Blinkit (NSEI:ETERNAL) | 2.62x NTM TEV/Forward Total Revenue | `Company Comparable Analysis Delivery Hero SE.xls, Trading Multiples tab`, as of 2026-08-10 (in-pool, Capital IQ) |

$^{1}$ Talabat FY2026 guided Adj. EBITDA midpoint $525m converted at EUR/USD ~1.156 (per `01`'s own cross-check rate) = €454.2m; Talabat's own EV of AED 23.07bn converted via AED/USD peg 3.6725 then EUR/USD 1.156 = €5,433.3m.

**Why each comparable matches the segment's economics, not just its label (Hard Rule):**
- **MENA — Talabat.** This is close to a direct match, not an analogy: talabat *is* the core of DHER's MENA segment (the segment map notes MENA "is run almost entirely through talabat" [`business-model/08_competitive-map.md` §1]). Talabat's own FY2026-guidance-implied multiple (~12.0x) is used un-discounted. Cross-check: talabat's guided Adj. EBITDA (€454.2m) is smaller than DHER's disclosed MENA segment Adj. EBITDA (€546.0m FY2025), consistent with MENA also including Yemeksepeti (Türkiye) and hyperinflation-accounting effects — a reasonable, not exact, reconciliation.
- **Asia — Meituan.** Meituan combines commission-based food-delivery marketplace economics with an expanding instant-retail/quick-commerce business — the same mix as DHER's Asia segment (foodpanda + Baemin/Woowa). It is NOT chosen for its "delivery" surface label alone; the match is the marketplace-plus-instant-retail structure. But DHER's Asia segment is explicitly **losing share** — GMV fell −7.7% in FY2024 "driven by rising competition," with Adjusted EBITDA "flat year-over-year... due to the effects of the competitive environment" [FY24 AR, p.105–106; `business-model/08_competitive-map.md` §3] — versus Meituan's continued growth leadership in a much larger home market. A 45% discount to Meituan's multiple is applied for this reason. (Grab Holdings, a closer geographic match for Southeast Asia, trades even richer — 33.2x LTM EV/EBITDA, web-sourced, stockanalysis.com, 2026-08-12 — so it does not lower the range; it confirms Asia food-delivery/quick-commerce peers as a group carry a growth premium DHER's Asia segment has not earned on its own recent trend.)
- **Europe — the DoorDash/Deliveroo transaction.** This is a real, market-clearing acquisition price for a European on-demand food-delivery marketplace operating in the same countries as DHER's Europe segment (UK, Ireland, France, Italy, Belgium, plus Gulf overlap) — stronger evidence than a trading multiple, because it is what a real, informed buyer (DoorDash, itself a comp in `business-model/08_competitive-map.md`) actually paid. Limitation, stated: the 1.2x multiple was set on Deliveroo's trailing (FY2024) revenue, not a forward figure; applying it to DHER's FY2026E Europe revenue is the best available like-for-like basis but is not a purely forward-on-forward comparison.
- **Americas — Swiggy.** Swiggy is a food-delivery-plus-quick-commerce (Instamart) marketplace in a large emerging market, still not consistently profitable at group level (NTM EBITDA is NM/negative) — a reasonably matched maturity and margin stage to PedidosYa/Americas, which only turned Adjusted EBITDA-positive in H2 2024 and remains thin (1.1% FY2024 margin). A modest 10% discount reflects Americas' smaller scale.
- **Integrated Verticals — Eternal/Blinkit.** This is the one segment where DHER holds inventory and operates its own warehouses (a "principal" model, buying and reselling stock) rather than the commission-based marketplace model of the other four segments [`business-model/03_segment-map.md`]. Eternal's Blinkit business is the closest public match on that structural basis — a principal-model quick-commerce operator, not a marketplace. **A large discount (64%) is applied, and this is a explicit methodology flag, not a rounding choice:** because Integrated Verticals is a principal (inventory-owning) business, its revenue includes a pass-through cost-of-goods component that a commission-based marketplace's revenue does not — applying a marketplace-calibrated revenue multiple at face value would overstate its value. Blinkit is also the clear category leader in its home market; DHER's Dmarts network (800 stores across 48 countries, per the FY2025 earnings call) is comparatively fragmented. Even after the discount, this segment carries the **lowest-confidence** valuation in this report (Section 5).

**Web-sourced multiples are labelled unverified per this module's source hierarchy** — Talabat's EV/guidance figures and the DoorDash/Deliveroo transaction terms are dated, web-sourced inputs used only because no equivalent figure exists in the data pool; the in-pool Capital IQ Trading Multiples tab figures (Meituan, Swiggy, Eternal) are Tier 5 vendor data, not web-sourced.

---

## 3. Segment Valuation

**FY2026E metric construction (labelled inference where it departs from a directly-disclosed figure):**
- **Revenue:** FY2025 (Tier 5) segment revenue grown at the Group consensus FY2026E revenue growth rate (+11.3%, €15,653.2m ÷ €14,059.6m, `DeliveryHeroSEXTRADHEREstimatesReport.xls, Consensus tab`) applied uniformly across segments, since no segment-level revenue consensus exists in the pool. **Inference, not from filings.**
- **Adjusted EBITDA (MENA, Asia, Americas, Integrated Verticals):** built from management's own qualitative FY2026 segment commentary on the FY2025 earnings call (2026-03-26) — MENA and Asia guided to "flattish levels of adjusted EBITDA... at constant currency" (analyst question, confirmed by management's response pattern); Integrated Verticals to "remain on slight positive EBITDA, while still reinvesting"; Americas assumed to continue building on its H2 2025 turn to profitability [`Delivery Hero SE, 2025 Earnings Call, Mar 26 2026`, Q&A]. These qualitative directions are translated into FY2026E point estimates and then scaled (factor 0.9294) so the four segments sum to the Group's own Street-consensus FY2026E Adjusted EBITDA of €951.8m (`earnings/04_guidance-consensus.md` §3) — this scaling is the reconciliation step required by Reconciliation Gate 3. **Inference, not from filings**, anchored to a real qualitative disclosure and a real consensus total.
- **Adjusted EBITDA (Europe):** management indicated Europe reached "around breakeven" in Q4 2025 following the Spain rider-model transition, "continuing to work on... improving the operational performance" [same source]. FY2026E is set at €0m (breakeven), an inference from the Q4 2025 run-rate, given no full-year number was given. Because this base is near zero, Europe is valued on Revenue (Section 2), not EBITDA, to avoid a small-denominator distortion.

| Segment | FY2026E Metric | Metric Value | Multiple | Segment EV | Formula |
|---|---|---:|---:|---:|---|
| MENA | Adj. EBITDA | €507.5m | 12.0x | **€6,090.0m** | 507.5 × 12.0 |
| Asia | Adj. EBITDA | €309.6m | 14.2x | **€4,396.3m** | 309.6 × 14.2 |
| Europe | Revenue | €2,768.2m | 1.2x | **€3,321.8m** | 2,768.2 × 1.2 |
| Americas | Revenue | €1,177.5m | 1.8x | **€2,119.5m** | 1,177.5 × 1.8 |
| Integrated Verticals | Revenue | €3,550.6m | 0.95x | **€3,373.1m** | 3,550.6 × 0.95 |
| **Gross enterprise value (sum)** | | | | **€19,300.7m** | Sum of above |

For reference, the underlying FY2026E revenue figures by segment (before the EBITDA-basis segments' figures are dropped from the value calc) are: Asia €4,918.6m, MENA €4,491.0m, Europe €2,768.2m, Americas €1,177.5m, Integrated Verticals €3,550.6m.

---

## 4. Equity Bridge

**Two items in this bridge are non-standard and are each explained rather than dropped in silently (Reconciliation Gate 3):**

**(a) Capitalized unallocated corporate costs.** The "Unallocated Management Adjustments" and "Unallocated Expenses for Share-Based Compensation" lines identified in Section 1 have run at −€395.2m (FY2023), −€683.0m (FY2024), and −€370.8m (FY2025) — a 3-year average of **€483.0m/year** [`Delivery Hero SE XTRA DHER Financials.xls, Segments tab`]. This is treated as a persistent, real economic cost (SBC is a genuine dilution cost to shareholders; the "management adjustments" bucket has recurred every year at a scale too large and too consistent to treat as one-off, despite management's own "adjusted" framing) and is capitalized as a perpetuity at an assumed 10% capitalization rate (**Inference, not from filings** — no DHER-specific WACC was computed within this agent's scope; 8%–12% sensitivity is shown in Section 5): €483.0m ÷ 10% = **−€4,830.0m**. This is the single largest bridge item — larger than net debt — and is the main reason this SOTP's segment-EV sum cannot be read at face value.

**(b) Minority interest — fair-value basis, not book value.** `01`'s EV bridge carries minority interest at its balance-sheet figure, €154.2m. That figure is not used here because the MENA segment valuation in Section 3 prices **100% of talabat's economics** at talabat's own market multiple, while DHER owns only 80% of talabat following its December 2024 Dubai listing [`business-model/03_segment-map.md` §1]. The correct SOTP treatment is to subtract the public 20% stake's **fair value**, not its balance-sheet carrying value, or the MENA segment value is overstated by ignoring a stake DHER does not own. Talabat's own market cap is AED 25.62bn (≈€6,034.9m at AED/USD 3.6725 and EUR/USD 1.156, both web-sourced, stockanalysis.com, 2026-08-12); 20% of that is **€1,207.0m** — roughly 7.8x larger than the €154.2m book figure. This departs from `01`'s headline minority-interest figure for a stated, segment-specific reason (Reconciliation Gate 1 permits this with an explicit one-line reason): the SOTP methodology requires netting the minority claim on the specific asset being valued at its own market price, and the size of the gap (€1,207.0m vs. €154.2m) is itself a material finding, not a rounding adjustment.

**(c) Conglomerate/complexity discount — 8%, base case.** DHER is not a passive holding company (Business-Type Method Map treats it as Operating, not Holding), so the typical 15–30% holdco discount is not applied wholesale. But a smaller discount is warranted: the group carries a large, opaque unallocated corporate-cost bucket (item a) that is not attributable to any one segment, and it spans five segments at very different maturities — from a 68%-profit-share MENA cash generator to Integrated Verticals, which the company itself says has not yet reached breakeven. An 8% discount is applied to the base case, reflecting this execution and disclosure complexity, not a passive-holdco penalty.

| Step | Value (€m) | Formula / Source |
|---|---:|---|
| Gross enterprise value | 19,300.7 | Section 3 sum |
| − Capitalized unallocated corporate costs | (4,830.0) | €483.0m ÷ 10% cap rate, see (a) above |
| − Net debt | (2,512.8) | `01_price-and-capital-structure.md` §5, strict basis (total debt €4,625.5m − cash €2,112.7m, FY2025) |
| − Minority interest (fair value, talabat 20%) | (1,207.0) | See (b) above; departs from `01`'s book figure (€154.2m) with the stated segment-specific reason |
| + Equity-method investments | 9.8 | `01_price-and-capital-structure.md` §4 (immaterial, FY2025) |
| Subtotal | 10,760.7 | |
| − Conglomerate / complexity discount (8%) | (860.9) | See (c) above |
| **= Equity value** | **9,899.8** | |
| ÷ Diluted shares | 303,744,978 | `01_price-and-capital-structure.md` Anchor Block (basic/latest, best available — fully diluted count not computable; convertible-bond overhang not netted, see header) |
| **= SOTP value per share** | **€32.59** | 9,899.8m ÷ 303,744,978 |
| vs current price (€37.20, deal-contaminated) | **−12.4%** | (32.59 − 37.20) / 37.20 |
| vs pre-announcement price (€15.73, 2026-03-26) | **+107.2%** | (32.59 − 15.73) / 15.73 |

**Net debt is a deduction, not an add-back** — DHER carries net debt, not net cash (€2,512.8m net debt, strict basis, per `01`), so no sign-discipline conflict arises here.

**Cross-method dispersion — the low/high sensitivity is wide and is shown, not hidden.** The two largest swing factors are (i) how much discount to apply to the Asia and Integrated Verticals comparables, and (ii) the corporate-cost capitalization rate. Holding net debt, equity-method investments, and the fair-value minority-interest adjustment fixed (these are facts, not estimates), and varying only the segment-multiple discounts and the capitalization rate:

| Case | Key assumption changes vs. base | Equity Value (€m) | Per Share | vs Current Price (€37.20) |
|---|---|---:|---:|---:|
| **Low** | MENA 10.0x (talabat's own recent LTM range); Asia 10.3x (60% Meituan discount); Europe 0.9x; Americas 1.5x (25% disc.); Integrated Verticals 0.55x (79% disc.); cap rate 8% (→ −€6,037.5m corp-cost drag); conglomerate discount 15% | 4,017.9 | **€13.23** | −64.4% |
| **Base** | As above (Section 3–4) | 9,899.8 | **€32.59** | −12.4% |
| **High** | MENA 12.0x (unchanged — a tight direct comp); Asia 19.4x (25% Meituan discount); Europe 1.6x; Americas 1.98x (no discount); Integrated Verticals 1.7x (35% disc.); cap rate 12% (→ −€4,025.0m corp-cost drag); no conglomerate discount | 17,157.8 | **€56.49** | +51.9% |

This is a genuinely wide range — not false precision, and not a typo. It reflects real uncertainty concentrated in two places: (1) how much of Meituan's/Grab's Asia growth premium and Eternal's Blinkit-leadership premium DHER's own, weaker-positioned Asia and Integrated Verticals segments deserve, and (2) how persistent — and therefore how heavily to capitalize — the ~€483m/year unallocated corporate-cost bucket really is. The **base case (€32.59) is the point estimate this report stands behind**; the range is the disclosed dispersion, per this module's no-false-precision standard.

---

## 5. SOTP Read

The base-case breakup value, €32.59/share, sits about 12% **below** the current €37.20 price — but that price is deal-contaminated by Uber's pending offer (announced 2026-07-16, `01_price-and-capital-structure.md` §1), so this is not evidence DHER is overvalued on fundamentals; it is evidence the current price embeds a takeover premium this standalone-fundamentals SOTP does not attempt to price. Against the €15.73 pre-announcement price, the same base case is **more than double** (+107%) — the more useful read of the two, since it compares like with like (fundamentals vs. fundamentals).

**MENA (talabat) carries the value.** Even after subtracting the fair-value 20% public minority stake DHER does not own (€1,207.0m — 7.8x the €154.2m book figure `01` carries), MENA's segment EV (€6,090.0m) is the largest single contributor and is valued almost 1:1 off talabat's own market price, the tightest and most direct comparable in this report. This is not a hidden segment the consolidated multiple is masking — talabat is separately listed and its value is visible — but the SOTP does surface that the market-implied 20% minority claim (€1,207.0m) is materially larger than the balance-sheet minority-interest figure most readers would default to, which is a real, quantified finding this analysis adds.

**What the consolidated read is more likely to be masking is the unallocated corporate-cost bucket, not a segment.** Capitalizing the persistent ~€483m/year "Unallocated Management Adjustments + SBC" drag (Section 4a) subtracts €4,830.0m at the base 10% cap rate — larger than net debt, and larger than four of the five segments' individual EVs. This is easy to miss because it does not appear as a distinct segment line: a reader who simply sums segment Adjusted EBITDA (which nearly exactly equals Group Adjusted EBITDA, €902.8m FY2025 vs. reported €903m) can be misled into thinking nothing sits below the segment table, when in fact a cost bucket nearly as large as MENA's entire segment EBITDA does.

Sources: `analyses/DHER_2026-08-12/valuation/01_price-and-capital-structure.md`; `analyses/DHER_2026-08-12/business-model/03_segment-map.md`; `analyses/DHER_2026-08-12/business-model/08_competitive-map.md`; `analyses/DHER_2026-08-12/earnings/04_guidance-consensus.md`; `_pool_extracts/Delivery-Hero-SE-XTRA-DHER-Financials__Segments.txt`; `_pool_extracts/Company-Comparable-Analysis-Delivery-Hero-SE__Trading-Multiples.txt`; `_pool_extracts/DeliveryHeroSEXTRADHEREstimatesReport__Consensus.txt`; `_pool_extracts/Delivery-Hero-SE-2025-Earnings-Call-Mar-26-2026.txt`; web-sourced (labelled unverified throughout): stockanalysis.com (Talabat Holding, Grab Holdings statistics, accessed 2026-08-12), DoorDash IR press release on the Deliveroo acquisition (2025-05-06).



---

## valuation / 07_scenario-and-fair-value.md

_Source: `07_scenario-and-fair-value.md`_

# Scenario & Fair Value — DHER (Delivery Hero SE)

**Read this before everything below.** The current price (€37.20, 2026-08-07, pool-verified per `01_price-and-capital-structure.md`) is **deal-contaminated**: Uber Technologies announced an agreement to acquire Delivery Hero on 2026-07-16, and the stock more than doubled from its pre-announcement level of €15.73 (2026-03-26). No fixed offer price was found anywhere in the data pool. Every price-relative read below (margin of safety, downside-to-bear, implied upside) is shown at **both** the current deal-priced level and, as a secondary reference, the pre-announcement price — because the current price is mostly answering "how likely is this deal and at what terms," not "what is DHER worth standalone." This module does not assign probabilities to deal completion or to any scenario — that is the master synthesizer's job.

## 1. Method Summary

| Method | Fair / Implied Value (per share) | Confidence | Weight | Why This Weight |
|---|---:|---|---:|---|
| Own-history multiples (02) | €25.10 (dispersion €16.04–€29.00) | Medium — EV/Sales is DHER's most reliable own-history multiple, but the reversion band is built almost entirely on 2.3–3 years of loss-making history (n=6–8 observations), and 02 itself flags the band may understate what a newly profitable DHER deserves | 45% | Own-history EV/Sales reversion is DHER's cleanest standalone-fundamentals read (no peer-set composition judgment call), so it anchors the base — but its short, loss-making-era sample keeps the weight below what a longer clean history would earn |
| Relative / peers (03) | €79.2 quality-adjusted base (dispersion €71–€158) | Low-Medium — base case rests on a 2-name "quality-matched" subset (Meituan, Swiggy); the raw 6-peer median (€157.9) is inflated by structurally different, larger, profitable peers (Uber, DoorDash, Prosus); no historical peer-multiple time series exists to say if the gap is typical | 22% | Real signal (DHER trades at a genuine discount even to its two closest-quality peers) but DHER has no clean, scale-and-quality-matched public comp — the named "peers" span from mega-cap profitable platforms to immature India names — so this method is weak for THIS company per the reliability standard, and is downweighted within the 02+03 multiples-majority bucket even though it stays in that bucket per the Method-Weighting Policy |
| Intrinsic DCF (04) | €33.31 (standard grid €23–€54; wider cross-check spanning the moat-disclosed WACC and Gate-2 financeable-growth gap: €6–€54) | Low-Medium — terminal-dominated (78% of EV, exceeds the 75% flag threshold), FY2025 base year carries poor earnings quality (36/100), and the mechanically-computed WACC (7.45%) diverges >3pp from DHER's own company-disclosed cost of capital (10.7%–13.7%) | 15% | Cross-check per Method-Weighting Policy §1 (operating company with usable forward estimates → DCF capped, combined with 06, at ≈≤⅓); its terminal dominance and WACC fragility argue for the low end of that cap |
| Reverse-DCF (05) | Not a fair-value input — implied growth read | n/a | n/a | Informs whether the base case is achievable (§3 below), not weighted into the triangulation |
| Sum-of-the-parts (06) | €32.59 (dispersion €13.23–€56.49) | Medium — MENA/talabat (68% of segment EBITDA) is valued almost 1:1 off a tight, direct public comparable (talabat itself), the strongest single input in this report; but the €4,830m capitalized unallocated-corporate-cost bridge item (larger than net debt) and the 8% conglomerate discount are judgment calls that drive most of the €13–€56 dispersion | 18% | Genuinely multi-segment business (MENA at 68.3% of segment EBITDA, under the 85% single-segment threshold) so SOTP is a valid, informative cross-check; weighted above 04 because its MENA anchor is unusually direct, but still capped with 04 at ≈⅓ combined per policy (this is an Operating company, not a Holding company, so SOTP is not elevated to primary) |

Weights sum to 100% across the four value-producing methods valid for this Operating business (Business-Type Method Map: FCFF DCF + reverse-DCF, EV/EBITDA/EV/Sales/P-E, no REIT/bank method applies). Reverse-DCF (05) is a cross-check, not a weighted input, per the module's standard.

**Multiples-first applied.** DHER is an Operating business with a usable forward metric (Street consensus FY2026E revenue and Adjusted EBITDA exist per `02` and `04`) and both an own-history multiple band (`02`) and a peer multiple set (`03`) — so per the Scenario Construction & Method-Weighting Policy, `02`+`03` together carry majority weight (67%) and `04`+`06` are capped as a combined cross-check (33%, at the ≈⅓ ceiling). No exception applies (DHER is classified Operating, not Holding company, in the Business-Type Method Map — `06`'s own report states this explicitly — so SOTP is not elevated to primary).

## 2. Triangulation & Reconciliation

**Method football field — shown at true dispersion, not narrowed:**

| Method | Value / Range | Confidence | Weight | Why this weight |
|---|---:|---|---:|---|
| Own-history multiples (02) | €25.10 (range €16.04–€29.00) | Medium | 45% | Cleanest standalone read; short, loss-making-era sample |
| Relative / peers (03) | €79.2 (range €71–€158) | Low-Medium | 22% | No clean scale/quality-matched comp; 2-name base sample |
| Intrinsic DCF (04) | €33.31 (range €23–€54; wide cross-check €6–€54) | Low-Medium | 15% | Terminal-dominated; WACC divergence vs. company's own disclosed cost of capital |
| Sum-of-the-parts (06) | €32.59 (range €13.23–€56.49) | Medium | 18% | Strong MENA anchor; large corporate-cost/discount judgment calls |

**Headline finding: the cross-method spread is extreme, not modest.** `02` (€25.10) and `03` (€79.2) differ by **+215%** — far above the 40% disagreement threshold that MODULE_RULES requires be flagged as the headline, not averaged away. The two DCF/SOTP cross-checks (`04` at €33.31, `06` at €32.59) sit close together, within 2% of each other, forming a tight cluster with `02` roughly €5–8 below and `03` far above both. This is not noise: `02`, `04` and `06` are all anchored, directly or indirectly, in DHER's own reported financials and segment economics; `03` alone is driven by an external, disputed judgment call — how much of the raw 6-peer premium (Uber, DoorDash, Prosus — all structurally different, larger, profitable businesses) should be excluded as "not comparable." `03` itself concedes this: "much of the 72% discount to the full six-name median is a peer-set composition effect... this is a mixed verdict, not a clean read either way."

**Reconciliation judgment.** This report trusts DHER's own multiple history (`02`) and its bottom-up methods (`04`, `06`) more than the peer-relative read (`03`) for THIS company, specifically because DHER lacks a clean scale-and-quality-matched public comparable — the named peer set spans mega-cap, already-profitable platforms (Uber, DoorDash) that trade on a fundamentally different risk/return profile, immature India names (Swiggy, Eternal) at a different growth stage, and a holding company (Prosus) whose 10.9x EV/Sales reflects portfolio economics, not DHER's own. `03`'s own two-peer "quality-matched" base (Meituan, Swiggy) is a defensible floor for the peer read but a thin sample to carry majority weight alone. Applying the policy-mandated multiples-majority weighting (67% to `02`+`03`, split 45%/22% within that bucket to reflect this reliability judgment) and the capped 33% cross-check weight (`04`/`06`, split 15%/18% reflecting `06`'s stronger MENA anchor against `04`'s terminal-value fragility) produces a mechanically-weighted **base-case fair value point of €39.6/share** (executed calculation below). No further discretionary override was applied beyond the stated weight split — the weights themselves are the disclosed lens choice, not a silent re-anchor.

**Executed calculation (weighted blend):**
```
w02, w03, w04, w06 = 0.45, 0.22, 0.15, 0.18   (sums to 1.00)
v02, v03, v04, v06 = 25.10, 79.2, 33.31, 32.59
blend = 0.45*25.10 + 0.22*79.2 + 0.15*33.31 + 0.18*32.59
      = 11.295 + 17.424 + 4.9965 + 5.8662 = 39.58  ≈ EUR 39.6/share
```
This is cross-validated independently in §3 via a direct metric×multiple build (FY26E revenue × warranted EV/Sales multiple), which reproduces €39.65/share — a 0.2% difference attributable to the choice of forward-revenue basis (NTM-consensus vs. FY2026-calendar), not a modelling inconsistency.

## 3. Bull / Base / Bear Fair-Value Levels

Each case is a single derived fair-value LEVEL — a point, not a range — built as (forward metric × multiple), with a **12-month horizon** (FY2026 as the forward year), consistent with CLAUDE.md §16. All three cases hold net debt (€2,512.8m, strict basis) and minority interest (€154.2m) fixed at the FY2025 actuals per `01`'s canonical anchor — these are facts, not scenario-dependent, and every case uses the identical bridge convention.

| Case | Fair Value / Share (point) | Forward Metric (FY26E Revenue) | Multiple (EV/Sales) | Horizon | What Must Be True (operating drivers) |
|---|---:|---:|---:|---|---|
| Bull | **€49.01** | €15,957.6m (+13.5% YoY) | 1.10x | 12 months (FY2026) | GMV like-for-like growth at the top of the guided range (10% vs. 9% midpoint) sustained, own-delivery/mix-shift tailwind continues rather than stalling, Asia margin recovers +192bps toward the FY2024 level (Korea's Q1 2026 inflection holds), and the multiple re-rates toward DHER's own historical ceiling (1.25x max, `02`) — not fully to it, reflecting that a full re-rate to the historical peak would need evidence of a durable margin structure this report does not yet have |
| **Base** | **€39.65** (≈€39.6) | €15,648.3m (+11.3% YoY, Street consensus) | 0.94x | 12 months (FY2026) | Street-consensus FY2026 revenue growth (11.3%, 14 analysts) and Adjusted EBITDA guidance midpoint (€935m) are met; no rider-cost reclassification shock beyond what is already absorbed; the multiple sits above `02`'s own 3-year mean (0.82x)/median (0.73x) but below its max (1.25x), reflecting partial credit for FY2025's first-ever year of GAAP profitability (which `02`'s own-history band, built almost entirely on loss-making years, may understate) and partial credit for `03`'s quality-adjusted peer-discount evidence |
| Bear (cyclical/operating trough) | **€18.59** | €15,114.1m (+7.5% YoY) | 0.55x | 12 months (FY2026) | GMV like-for-like growth at the bottom of the guided range (8%), own-delivery mix-shift stalls, Asia competitive intensity persists (a further −192bps segment margin move, per `earnings/07_earnings-sensitivity.md`), and the rider-cost/employment-classification variable moves adversely without a pricing offset (the company's own disclosed stress test: a 245bp cost-ratio shock ≈ −€344.5m, ~38% of FY2025 Adjusted EBITDA) — the multiple compresses to 0.55x, just above DHER's own actual historical low print (0.52x, recorded 2026-03-26, the pre-announcement close, when the market still priced DHER as a still-loss-making, unproven business) |

**Multiple discipline check.** Bull (1.10x) ≥ Base (0.94x) ≥ Bear (0.55x) — expansion in bull, compression in bear, each moving the same direction as its revenue metric, all anchored inside `02`'s own-history EV/Sales band (min 0.52x, mean 0.82x, median 0.73x, max 1.25x). No case extrapolates beyond that band.

**Why DHER's bear case is built this way, not as a classic commodity trough.** `business-model/07_business-quality.md` scores cyclicality 42/100 ("moderate — not a classic commodity-cycle business"), so a boom-bust trough anchor does not apply. Instead, the bear case combines (a) the company's own worst-disclosed operating stress test (`earnings/07_earnings-sensitivity.md`'s rider-cost/regulatory shock, the single highest-ranked sensitivity variable, asymmetric and severe: −€344.5m bear vs. +€140.6m bull) with (b) a multiple compressed to DHER's own actual historical low (0.52x, the real pre-deal print from a five-year loss-making stretch) — the closest available evidenced-trough analog for a company without a commodity cycle. This is evidence-based, not an invented deeper trough.

**Structural / permanent-impairment down-leg — avoid-ruin floor, not the headline bear.** Two triggers fire simultaneously: `business-model/09_moat.md` returns **"No moat proven"** (group ROIC 0.8%–1.6% best year, ≈−6.1% through-cycle, versus a company-disclosed 10.7%–13.7% WACC), and `business-model/07_business-quality.md` scores industry rate-of-change/disruption at **26/100** (≤40, RF-BQ-005). Per the graduated routing rule, this does **not** become the headline bear: the moat module's own trajectory read is explicitly **"widening (narrow, segment-specific)"**, not eroding, and `04_intrinsic-dcf` — a usable, weighted method in this triangulation (§1) — already reflects the lost excess return by deliberately capping terminal Adjusted EBITDA margin at 7.2% (below both Uber's 10.7% and DoorDash's 5.3% operating margins) specifically because of the "No moat proven" finding. Both conditions for demotion are met (non-eroding trajectory + a weighted method already carrying the fade), so the structural reset is carried here as the labelled **avoid-ruin floor**, not the 12-month bear:

```
Structural-reset EV (04's own runoff/declining-perpetuity build, reproduced and verified):
  PV explicit FCF (bear operating path) = EUR 863.2m
  PV terminal value (g = 1.0% nominal, below ECB inflation target -- real-terms decline) = EUR 940.2m
  EV = 863.2 + 940.2 = EUR 1,803.4m   [ties exactly to 04's stated EV]
  Equity = EV - net debt - minority = 1,803.4 - 2,512.8 - 154.2 = -EUR 863.6m
  Per share = -863.6m / 303.744978m shares = -EUR 2.84/share
```

Method: EV-based impaired-DCF reset (declining-perpetuity terminal, per the Operating-company map), bridged with `01`'s canonical net-debt anchor (net debt subtracted before dividing by shares, as required for an EV-based reset). Driver: revenue growth fading 8%→2%, Adjusted EBITDA margin **compressing** 5.5%→4.2% (the rider-cost stress case applied cumulatively) with no pricing offset, terminal g = 1.0%. **This produces a negative equity value (−€2.84/share) — DHER's net debt (€2,512.8m) exceeds even this stressed enterprise value.** This is a genuine avoid-ruin signal for §24/Kill Criteria, not a 12-month price target: if the rider-cost/regulatory bear case and continued competitive erosion both materialize with no pricing offset over a multi-year horizon, DHER's standalone equity value is close to wiped out by its debt load. It does not replace the −18.6/share 12-month bear above.

## 4. Margin of Safety & Downside (two separate metrics)

Shown at **both** prices per the deal-contamination flag — leading with the current (deal-priced) read, pre-announcement price as the secondary, standalone-fundamentals reference.

| Metric | vs. Current Price (€37.20, deal-contaminated) | vs. Pre-Announcement Price (€15.73, 2026-03-26, standalone reference) |
|---|---:|---:|
| Price | €37.20 (2026-08-07) | €15.73 (2026-03-26) |
| Base-case fair value (point) | €39.65 | €39.65 |
| Bear-case fair value (12-month operating trough) | €18.59 | €18.59 |
| Implied upside to base case = (base FV − price) / price | **+6.6%** | **+152.0%** |
| **Margin of safety** = (base FV − price) / base FV — the cushion | **+6.2%** | **+60.3%** |
| **Downside to bear** = (price − bear FV) / price — *inverted: higher = worse* | **50.0%** | **−18.2%** (price already sits below the bear-case level) |

**Executed calculation:**
```
base_fv = 39.65; bear_fv = 18.59
price_current = 37.20; price_predeal = 15.73

# vs current price
upside_c = (39.65-37.20)/37.20        = 6.6%
mos_c    = (39.65-37.20)/39.65        = 6.2%
dtb_c    = (37.20-18.59)/37.20        = 50.0%

# vs pre-deal price
upside_p = (39.65-15.73)/15.73        = 152.0%
mos_p    = (39.65-15.73)/39.65        = 60.3%
dtb_p    = (15.73-18.59)/15.73        = -18.2%   (bear FV exceeds pre-deal price)
```

**Reading this pair of numbers.** At the current deal-contaminated price, the margin of safety is thin (+6.2%) and the downside to the 12-month operating bear case is real (50.0% — a genuine loss if the deal breaks AND the operating bear materializes). At the pre-announcement price, the standalone read is starkly different: DHER traded at a 60.3% discount to this report's triangulated base case, and even the bear-case fair value (€18.59) sat above the pre-deal price (€15.73) — meaning the market was pricing DHER, pre-deal, below even a stressed operating scenario. That gap (not the current price) is the cleanest evidence in this report that the pre-deal market materially undervalued DHER's standalone prospects; whether the current €37.20 represents fair compensation for that gap being closed via a takeover, versus overpaying for deal-completion odds on undisclosed terms, is a probability question for the master synthesizer, not this module.

## 5. Warranted-Multiple Check

The base-case fair value (€39.65) implies an EV/Sales (FY26E) multiple of 0.94x — above DHER's own 3-year mean (0.82x) and median (0.73x), though below its historical max (1.25x, itself reached only in the deal-contaminated recent quarters). Whether DHER "deserves" a multiple above its own historical average is genuinely contested by the evidence in this pool: `business-model/07_business-quality.md` scores the business 34/100 ("Weak"), and `business-model/09_moat.md` finds **"No moat proven"** — group ROIC (0.8%–1.6% best year, ≈−6.1% through-cycle) sits 900–1,700+bps below the company's own 10.7%–13.7% disclosed cost of capital, which argues against paying up for a re-rate. Set against that, FY2025 was DHER's first-ever year of GAAP EBITDA/EBIT profitability, and `02`'s own report flags that its own-history multiple band — built almost entirely during the loss-making era — may systematically understate what a durably profitable DHER should trade at; that structural question (is the inflection durable, or a fragile one-off funded by continued heavy marketing spend, as `07_business-quality.md` describes it) is outside this module's scope to resolve. **Net: the base case does not require a multiple the business has never earned (0.94x sits inside DHER's own observed range), but it does require crediting a recent, unproven inflection over a longer loss-making history — a real value-trap risk if that inflection does not hold, flagged here rather than assumed away.** No structurally misaligned controlling-owner flag applies (`03`'s report notes RF-OWN-004 was not triggered; Prosus is exiting via the tender, not exercising control) — the value-trap risk here is operating/moat-based, not ownership-based.

## 6. Fair-Value Read

This report's triangulated **base-case fair value is €39.65/share (12-month horizon)**, bracketed by a **bull of €49.01** and a **12-month operating-trough bear of €18.59**; a separate, multi-year **structural/avoid-ruin floor of −€2.84/share** exists but is not the headline bear (the moat trajectory is "widening," not eroding, and a weighted method already prices in the lost excess return — see §3). Against the current deal-contaminated price (€37.20), the margin of safety is thin (+6.2%) and the downside to the operating bear case is real (50.0%) — meaning today's price sits close to a defensible standalone fair value even before crediting any takeover premium, which itself is informative: this is not obviously a case of the market wildly overpaying, nor is it a clean bargain. Against the pre-announcement price (€15.73), the standalone case is dramatically different: a 60.3% margin of safety, with the bear-case fair value sitting above the pre-deal price entirely. The single method driving the answer is the **method spread itself** — `02` (own-history multiples, €25.10) and `03` (peer-relative, €79.2) disagree by +215%, an order of magnitude beyond the 40% flag threshold, reconciled here by trusting DHER's own-financials-anchored methods (`02`, `04`, `06`, which cluster within a tight €25–€33 band) over the peer-relative read (`03`), which rests on a peer set with no clean scale-and-quality match for DHER. The single biggest swing factor between bull and bear is **rider-cost/employment-classification regulation** — the company's own disclosed stress test alone moves Adjusted EBITDA by −€344.5m (≈38% of FY2025 Adjusted EBITDA) with no offsetting pricing mechanism, and a related contingent liability (Spain reclassification, €440m–€770m) sits outside even this range. This module assigns no probability to deal completion, to the operating scenarios, or to the structural-reset path — those weightings belong to the master synthesizer.
