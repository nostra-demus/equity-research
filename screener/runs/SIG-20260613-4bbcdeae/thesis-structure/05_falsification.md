# M0.5 Primary Falsification — SIG-20260613-4bbcdeae

## 1. The Kill Switch

- **falsification_sentence:** If Intel's Q2 2026 Data Center & AI segment revenue prints below $4.85B (a quarter-on-quarter decline of more than 5% from the $5.1B Q1 2026 level), the inflection thesis is dead — the Q1 print was a one-quarter event, not a durable run-rate, and the load-bearing claim of a sustained DC+AI revenue recovery collapses.
- **falsification_condition_type:** magnitude_decay

---

## 2. Monitoring Specification

| Field | Value |
|---|---|
| monitorable_metric_1 | Intel Q2 2026 DC+AI segment revenue ($B) — reported in Intel's Q2 2026 earnings release (8-K filed to SEC EDGAR; primary source: Intel Investor Relations at intc.com/investor-relations/financial-information/quarterly-earnings) |
| monitorable_metric_2 | Sell-side analyst consensus Buy-rating count among the 48-analyst S&P Global / CapIQ poll (tracked weekly via S&P Global Market Intelligence consensus feed or Yahoo Finance analyst ratings page for INTC) — must reach ≥ 14 of 48 analysts (from current 10) within the horizon to confirm the re-rating thesis |
| monitorable_threshold_rate | 4.85 |
| monitorable_threshold_rate_unit | USD billions (DC+AI segment quarterly revenue; a sub-$4.85B Q2 print = falsification) |
| monitorable_threshold_date | 2026-09-14 (the Q2 2026 earnings release is expected in late July 2026; this date is well inside the medium_weeks_3months horizon and is the latest date by which the Q2 print would be available) |

---

## 3. Uncomfortable Check

- **uncomfortable_check:** PASS (locked true)
- **uncomfortable_check_rationale:** The load-bearing claim of this thesis is that Q1 2026's $5.1B DC+AI segment revenue (+22% YoY, +7% QoQ) represents the start of a durable inflection — the fact that justifies BofA's two-notch upgrade (WC-001), the revised 2030 EPS estimate of $6.24 (WC-004), and the TAM revision to >$170B (WC-005). A Q2 print below $4.85B would mean the Q1 beat was a pull-forward, a one-time customer build, or a seasonal spike — not structural recovery. If that fires: the entire BofA earnings revision ($6.24 EPS by 2030, WC-004) loses its Q1 empirical anchor; the $135 price target collapses because it is built on 25x a $6.24 EPS that requires durable revenue growth; the consensus re-rating thesis (from 10 buys to a broader move) goes into reverse as the upgrade proves premature; and the secondary beneficiaries (capital equipment at DIR-002, data center REITs at IND-002) lose their catalyst. This genuinely kills the thesis — it is not a dent. A motivated holder cannot explain away a sequential revenue decline in the one segment the entire upgrade was predicated on.

---

## 4. Secondary Falsifiers

| ID | Description | Metric | P(fires in horizon) |
|---|---|---|---:|
| SF-001 | Sell-side consensus does not move: the 48-analyst S&P Global poll remains at 10 Buys (or declines) over the entire weeks-to-3-month horizon, indicating buy-side and sell-side alike rejected the BofA thesis rather than following it — the re-rating narrative fails even if revenue holds. Monitored weekly via S&P Global Market Intelligence or Yahoo Finance analyst ratings for INTC. | Analyst Buy-rating count (S&P Global / CapIQ consensus poll for INTC) remaining ≤ 10 of 48 through 2026-09-14 | 0.35 |
| SF-002 | A second major hyperscaler (Microsoft, Google, Amazon, or Meta) publicly discloses a reduction or pause in x86 server CPU procurement in favour of ARM-based or custom silicon, directly contradicting WC-005's TAM revision logic. This would signal that the $170B TAM estimate is wrong in direction, not just timing. Monitored via earnings transcripts, 8-K filings, or capital allocation commentary from these four companies filed to SEC EDGAR. | Any explicit procurement-shift disclosure by one of the four named hyperscalers in an earnings call transcript, 8-K, or investor-day filing (SEC EDGAR; reported by Bloomberg, Reuters, or WSJ) through 2026-09-14 | 0.20 |
| SF-003 | Intel foundry revenue (Q2 2026) declines more than 10% quarter-on-quarter from Q1 2026's $5.4B, revealing that the broader manufacturing recovery underpinning the TAM thesis is also stalling — not just the data-center CPU segment. This kills the thesis at a wider level by showing the Q1 2026 results were a multi-segment aberration. Monitored via Intel Q2 2026 8-K (SEC EDGAR, Intel Investor Relations). | Intel Foundry segment Q2 2026 revenue below $4.86B (i.e., more than 10% below Q1's $5.4B), reported in the Q2 2026 earnings release | 0.18 |

---

## 5. Lock State

- **locked_after_m0_complete:** pending (edge-definition sets the lock; after that these criteria cannot be moved)

---

## 6. Verdict

Verdict: kill switch set — Intel Q2 2026 DC+AI segment revenue crossing below $4.85B by 2026-09-14
