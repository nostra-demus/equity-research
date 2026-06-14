# M0.4 Time Horizon — SIG-20260613-4bbcdeae

## 1. Horizon

- **horizon:** medium_weeks_3months
- **horizon_rationale:** The thesis rests on three already-occurred mechanisms: a two-notch analyst rating upgrade (WC-001/WC-004), a TAM revision to >$170B by 2030 (WC-005), and a Q1 2026 DC+AI revenue beat of $5.1B / +22% YoY (WC-003). The tradeable signal — whether the Q1 inflection is durable and whether other analysts follow the BofA upgrade — resolves at the next quarterly earnings release, expected in late July 2026 (approximately 6–8 weeks from 2026-06-14). Consensus re-rating cycles for large-cap tech typically run 4–12 weeks as buy-side and sell-side absorb the lead analyst's note, which places the thesis squarely in the weeks-to-3-month window; the 2030 TAM endpoint is a structural target, not the near-term clock.

## 2. Expiry Condition

- **expiry_condition:** Intel Q2 2026 earnings release publishes, reporting data-center and AI segment revenue — the thesis expires (resolves) the moment that print is available, regardless of the direction of the result. A Q2 DC+AI revenue figure at or above $5.1B confirms the run-rate; a figure materially below $5.1B falsifies the inflection thesis.
- **Where it would be checked tomorrow:** Intel Investor Relations page (https://www.intc.com/investor-relations/financial-information/quarterly-earnings) — this is where Intel posts its quarterly earnings release and 8-K. The Q2 2026 earnings date can also be tracked on SEC EDGAR (intel 8-K filings feed) and confirmed via Manufacturing Dive or Yahoo Finance earnings calendars once scheduled.
- **expiry_condition_is_observable:** PASS (locked true)
- **expiry_condition_is_opinion:** PASS (locked false)

## 3. Monitoring

- **monitoring_frequency:** Weekly — check every Monday for: (a) any new sell-side rating changes on Intel (tracked via Yahoo Finance analyst ratings page or S&P Global Market Intelligence consensus feed); (b) any Intel 8-K or press release filed to SEC EDGAR that pre-announces revenue or guidance; (c) announcement of the Q2 2026 earnings date. Frequency shifts to daily in the week Intel confirms its Q2 earnings date and the 48 hours surrounding the print.
- **horizon_expiry_market_signal:** The INTC implied-volatility term structure flattening around the Q2 earnings date — specifically, the front-month / next-month IV spread compressing toward zero as the event is priced and then collapsing post-print. This is distinct from the earnings release itself and observable on CBOE options data or IBKR options chain for INTC; a return of realized vol to the pre-upgrade 20-day average ($3–4 daily range) also signals the market has absorbed the upgrade and the thesis has reached its natural resolution point.

## 4. Verdict

Verdict: medium_weeks_3months, expiry = Intel Q2 2026 earnings release (DC+AI segment revenue print)
