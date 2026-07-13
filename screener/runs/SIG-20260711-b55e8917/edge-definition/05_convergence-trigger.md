# M0.6.5 Convergence Trigger — SIG-20260711-b55e8917

## 1. Primary Trigger

| Field | Value |
|---|---|
| trigger_name | Carvana Q2 2026 earnings release (Form 8-K + earnings call) |
| trigger_date_range | July 29, 2026 after market close (confirmed: Carvana IR press release, StockTitan 2026-07-09, web: stocktitan.net/news/CVNA/carvana-to-report-second-quarter-2026-results, indicative, unverified) |
| trigger_type | scheduled |
| probability_if_unscheduled | null |
| probability_note | Scheduled — SEC-required Form 8-K filing follows a fixed quarterly calendar; no discretion to skip. The earnings call at 5:30 p.m. ET on July 29 is also publicly pre-announced via Carvana IR. |
| Inside M0.4 horizon? | Yes — M0.4 sets "medium_weeks_3months"; July 29, 2026 is 17 days from today (July 12, 2026), well within the 3-month window. |

## 2. Causal Mechanism (four steps)

1. **Trigger manifests the variant's data.** On July 29, 2026 Carvana files its Q2 2026 8-K and management addresses new-car franchise volume on the earnings call. Two things happen simultaneously: (a) management either discloses new-car unit count for all seven Stellantis stores or declines to provide it, and (b) when analysts press for guidance on additional franchise acquisitions, management either confirms the Stellantis 1-per-12-month cap as a binding constraint or is silent on a non-Stellantis OEM deal — neither of which supports a multi-thousand-store disruption narrative.

2. **Consensus models and estimates update.** Morgan Stanley, JPMorgan, Baird, RBC, and BTIG analysts — who have not published a cap-constrained terminal store count or cap-adjusted optionality NPV — revise or flag the structural ceiling after the call explicitly surfaces it. Because no major sell-side model has previously assigned a store-count ceiling to the new-car expansion story (confirmed search gap, M0.6.3 §4), the call is the first moment the cap constraint is on-record in management's own words, forcing model updates in the immediate post-earnings note cycle (July 30 – August 1, 2026).

3. **Capital reallocates.** Long-only funds and hedge funds that own CVNA on the basis of new-car franchise disruption optionality — and that have priced that optionality at a multiple the $53.8B EV premium implies — reduce or exit positions as the sell-side notes mark down the optionality's NPV to align with a 1-per-year acquisition pace. Short sellers (including those flagged by the 25–30% short interest on CVNA as of mid-2026, per M0.6.2) cover partially or add, creating asymmetric selling pressure in the 72 hours following the earnings release.

4. **Price converges toward the variant view.** With the sell-side now modelling cap-constrained new-car optionality (~$1.6–$6.2B) rather than unconstrained disruption optionality (~$53.8B premium), the multiple that justified a $75.4B EV compresses toward a dealer-group-plus-used-car-franchise blended multiple. The stock reprices downward, partially closing the gap between the current EV and the cap-constrained fair value — the magnitude of convergence depends on how much of the $53.8B premium the market assigns specifically to new-car franchise optionality versus permanent used-car market dominance.

## 3. Secondary Triggers

| ID | Trigger | Date | Type | P | Mechanism (one line) |
|---|---|---|---|---:|---|
| ST-001 | Stellantis North America August 2026 monthly sales report (covering July 2026) | First week of August 2026 (Stellantis publishes monthly U.S. sales in the first week of each calendar month; H1 2026 report released July 1, 2026 — web: prnewswire.com/news-releases/stellantis-reports-us-sales-gains-in-first-half-2026-302816096.html, indicative, unverified) | scheduled | null | If Casa Grande's July 2026 unit volume is disclosed at below 350 units (the M0.5 falsification threshold), the one confirmed data-point collapses and partial convergence occurs before Q2 earnings as the volume-superiority thesis loses its empirical anchor. |
| ST-002 | Northcoast Research or a second sell-side firm publishes a cap-adjusted CVNA optionality note | Unscheduled; could appear any time between now and Q2 earnings (July 29) | unscheduled | 0.20 | A second-analyst publication naming the Stellantis 1-per-12-month cap as a constraint on terminal store count would validate the trade press coverage already out (DealershipGuy, CBT News) and force the broader sell-side to re-examine the unconstrained disruption assumption — partial convergence without waiting for the earnings print. P=0.20 because Northcoast already flagged the policy but has not yet published an optionality NPV adjustment; the remaining major sell-side firms have not flagged it at all. |
| ST-003 | Carvana Q3 2026 earnings release (Form 8-K + earnings call) | Late October 2026 (historical pattern: Q1 reported April 29, 2026; Q3 expected ~October 28–30, 2026) | scheduled | null | If July 29 earnings do not force convergence (e.g. management guides to multi-OEM expansion), Q3 earnings becomes the second scheduled event that either confirms a second acquisition (still only 1-per-year pace) or forces the market to price 12 additional months of waiting for store #9 — a further compression of the disruption timeline. |
| ST-004 | Any Carvana 8-K or press release disclosing a non-Stellantis OEM franchise agreement | Unscheduled | unscheduled | 0.15 | A Honda, Toyota, or other-OEM franchise announcement would partially validate the multi-OEM expansion path the market may be pricing and would cause partial convergence in the opposite direction — reducing the mispricing as the structural cap is partially circumvented. This is a bearish-to-thesis event and a partial-convergence trigger for the SHORT side of any pair trade. P=0.15 based on no confirmed OEM negotiation found in any search as of July 12, 2026 and Stellantis's policy being OEM-brand-specific. |

## 4. Verdict

Verdict: trigger scheduled (July 29, 2026) — proven timing

The primary trigger is a calendared, SEC-mandatory Form 8-K filing with a publicly pre-announced earnings call, landing 17 days from today and squarely inside the M0.4 3-month horizon. The four-step mechanism runs from management disclosure of the cap constraint on the call → sell-side model revision (Morgan Stanley, JPMorgan, Baird, RBC, BTIG) → long-only and short-seller capital reallocation → EV multiple compression. The biggest single uncertainty is not timing but magnitude: how much of the $53.8B EV premium the market is allocating to new-car franchise disruption optionality versus permanent used-car dominance. If the market is rationally pricing the used-car franchise at 15–22x EBITDA on its own merits, the convergence on new-car optionality alone moves the stock less than the full $53.8B gap implies. That ambiguity weakens the variant (as noted in M0.6.3 Verdict) but does not weaken the trigger — the trigger is dated, observable, and causally connected to the mechanism.
