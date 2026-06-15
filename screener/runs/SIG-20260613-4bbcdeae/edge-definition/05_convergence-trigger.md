# M0.6.5 Convergence Trigger — SIG-20260613-4bbcdeae

## 1. Primary Trigger

| Field | Value |
|---|---|
| trigger_name | Intel Q2 2026 Earnings Release — Non-GAAP Gross Margin and DC+AI Segment Revenue Print |
| trigger_date_range | 2026-07-23 (after market close), ± one trading day for any pre-announcement [Barchart.com earnings calendar, retrieved via 03_variant-perception.md, 2026-06-14; confirmed: Benzinga INTC earnings page, Unusual Whales INTC earnings history, Investing.com INTC earnings date — all retrieved 2026-06-14] |
| trigger_type | scheduled |
| probability_if_unscheduled | null |
| probability_note | This is a mandatory SEC-filed quarterly earnings release (8-K). Intel is a US public company required to report under Exchange Act rules. The date is confirmed across multiple financial calendars as 2026-07-23. The event is certain; only the outcome is unknown. |
| Inside M0.4 horizon? | Yes — M0.4 horizon is "medium_weeks_3months" expiring at the Q2 2026 earnings release. 2026-07-23 is 39 days from 2026-06-14, inside the 3-month window. The M0.4 record explicitly names this event as the expiry condition. |

---

## 2. Causal Mechanism (four steps)

1. **Trigger manifests the variant's data.** Intel files its Q2 2026 8-K on 2026-07-23, reporting non-GAAP gross margin at or near the guided 39% (not 40%+) and DC+AI segment revenue materially below the Q1 2026 level of $5.1B — confirming that the Q1 41% gross margin included the ~650bps non-recurring legacy inventory liquidation that CFO David Zinsner flagged on the Q1 earnings call, and that the hyperscaler pre-build described by SemiAnalysis and KeyBanc pulled forward a portion of Q1 DC+AI revenue. [Intel Q1 2026 8-K, SEC EDGAR, 2026-04-23; Intel Q1 2026 earnings call transcript, Motley Fool / TIKR, 2026-04-23; Q2 guidance 39% gross margin stated in Q1 2026 earnings release]

2. **Consensus models and estimates update.** Within 24–48 hours of the Q2 print, quantitative analysts at Citi (which revised FY2026 gross margin from 37% to 42% after Q1) and the broader sell-side update their forward gross margin paths downward — trimming FY2026 blended gross margin estimates from the 40–42% range toward 37–38%, and reducing their 2030 EPS power estimates below the BofA $6.24 anchor. The S&P Global / CapIQ consensus poll (currently 10 of 48 analysts at Buy) does not move further toward Buy, and some analysts who were considering upgrades hold at Hold or revert. [Citi revised estimate sourced: 24/7 Wall St., 2026-04-24, unverified secondary; S&P Global consensus count from thesis_record.json M0_5 watchlist_deferred_items, 2026-06-14]

3. **Capital reallocates.** Momentum-oriented hedge funds and long-only growth funds that entered INTC on the BofA double-upgrade on 2026-06-11 (the +6.5% day) reduce or exit positions as the Q2 print confirms the Q1 gross margin was not a clean baseline. Options market-makers who sold downside puts into the earnings event cover and reprice implied volatility, removing the post-upgrade IV compression. Index-rebalancing desks tracking semiconductor ETFs (SOX, SOXX) face no forced action but active managers with short-dated positions built around the BofA thesis reduce exposure. Buy-side analysts at funds holding INTC update their models and communicate new lower price targets to portfolio managers.

4. **Price converges toward the variant view.** With consensus 2030 EPS estimates revised from $6.24 toward the variant's $4.50–$5.00 range and the Q1 non-recurring gross margin factor now visible to the whole market (not just evidenced in the primary transcript), BofA's $135 price target — built on 25× $6.24 — loses its anchor. The market re-prices INTC on a 25× multiple applied to the lower EPS range, implying a fair value of $112–$125 (25× $4.50 to 25× $5.00), a 10–20% compression from the post-upgrade $124–$135 range. The BofA $135 price target becomes an isolated outlier relative to a revised sell-side median. [BofA $135 = 25× $6.24: Yahoo Finance / BofA note via Yahoo Finance, 2026-06-11, unverified secondary; price target arithmetic: inference from disclosed model structure, labelled]

---

## 3. Secondary Triggers

| ID | Trigger | Date | Type | P | Mechanism (one line) |
|---|---|---|---|---:|---|
| ST-001 | Intel Q2 2026 pre-announcement or preliminary revenue/margin guidance update | Any date between 2026-06-14 and 2026-07-22 | Unscheduled | 0.12 | If Intel files an 8-K pre-announcing Q2 revenue or gross margin below prior guidance, sell-side models reprice immediately — partial convergence before the full Q2 print, likely -3–5% on INTC and downward gross margin revisions by Citi and any analysts who anchored to the Q1 beat. |
| ST-002 | Q2 2026 earnings commentary by a major hyperscaler (Microsoft, Google, Amazon, Meta) explicitly confirming or reducing server CPU order volumes | 2026-07-08 to 2026-07-31 (hyperscaler Q2 earnings window) | Scheduled | 1.00 (event certain; outcome directional for INTC only if procurement is disclosed) | A hyperscaler disclosing reduced or deferred x86 server CPU orders confirms the pre-build mechanism and causes partial convergence by validating mechanism_2 (demand pull-forward) before Intel itself reports. |
| ST-003 | Citi or a second major sell-side firm walks back its post-Q1 gross margin revision of 42% ahead of Q2 earnings | Any date between 2026-06-14 and 2026-07-22 | Unscheduled | 0.15 | A public sell-side estimate reduction on gross margin from any analyst holding the 40–42% FY2026 view removes one pillar of the consensus anchor and causes partial convergence — the market sees the first crack in the post-Q1 upgrade narrative without needing the Q2 print. |
| ST-004 | Intel foundry monthly customer disclosure or 8-K material-event filing revealing slower 18A yield ramp | Any date, no specific calendar anchor | Unscheduled | 0.10 | A slower 18A yield improvement confirmed in any official disclosure extends the foundry gross-margin drag timeline, partial-confirming that the 2030 EPS path assumed by BofA requires a faster ramp than the evidence supports — partial convergence on the foundry margin component of the variant. |

---

## 4. Verdict

Verdict: trigger scheduled (2026-07-23) — proven timing

The primary trigger is Intel's mandatory Q2 2026 earnings 8-K filing, dated 2026-07-23 per Barchart.com (confirmed by Benzinga, Unusual Whales, Investing.com — all retrieved 2026-06-14). The date is certain, the event is non-deferrable, and the specific data items that manifest the variant (Q2 non-GAAP gross margin vs the guided 39% and the 650bps non-recurring Q1 component; DC+AI segment revenue vs the $5.1B Q1 baseline) are line items in the standard quarterly release. The trigger lands inside the M0.4 horizon (39 days from signal date). The four-step causal chain runs from print → consensus model updates (Citi, BofA comps) → capital reallocation by growth-oriented funds that entered on the upgrade → price compression toward the $112–$125 fair-value range implied by the variant's $4.50–$5.00 EPS view. Secondary triggers (hyperscaler Q2 commentary, pre-announcement, sell-side estimate cuts) could produce partial convergence as early as July 8. The trigger is proven; timing risk is low.
