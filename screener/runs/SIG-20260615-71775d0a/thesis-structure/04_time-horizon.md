# M0.4 Time Horizon — SIG-20260615-71775d0a

## 1. Horizon

- **horizon:** medium_weeks_3months
- **horizon_rationale:** The distribution itself closes on June 29, 2026 — 14 days out — making the corporate action a near-term event. But the investment thesis turns on what happens after separation: HONA and Honeywell Technologies (HON) begin trading as stand-alone companies, sell-side analysts initiate separate coverage, passive funds rebalance to reflect two new index constituents, and forced sellers (shareholders who do not want an aerospace-only stock) clear their positions. That post-distribution price-discovery and overhang-clearing process typically runs 6–10 weeks following the first regular-way session, placing full thesis resolution inside a medium_weeks_3months window. The formal June 29 distribution date anchors the start of the clock; the ~2–3 months after it are when the sum-of-parts repricing either materialises or does not.

## 2. Expiry Condition

- **expiry_condition:** HONA opens for regular-way trading on Nasdaq on June 29, 2026 at market open (9:30 a.m. ET), ending the when-issued (HONAV) period and establishing the first real price for the stand-alone Honeywell Aerospace business. At that point the spin-off corporate action is fully settled, both entities are trading independently, and the thesis clock — whether HONA + HON combined trade above, at, or below the pre-spin HON price — begins running. The thesis is fully resolved (or expired without resolution) once both stocks have traded for 10 full weeks from June 29 without the combined market cap having moved more than 15% from the pre-distribution HON close of ~$205.88.
- **Where it would be checked tomorrow:** Nasdaq market data (nasdaq.com/market-activity/stocks/hona and /honiv for the when-issued HON), or any major data terminal (Bloomberg, IBKR quote screen, Yahoo Finance — labelled indicative, unverified) showing HONA and HONIV / HON prices. The formal distribution completion can be confirmed on the Honeywell Investor Relations page (investor.honeywell.com) or on SEC EDGAR (a Form 8-K is expected from Honeywell International on June 29 confirming distribution completion).
- **expiry_condition_is_observable:** PASS (locked true)
- **expiry_condition_is_opinion:** PASS (locked false)

## 3. Monitoring

- **monitoring_frequency:** Daily through June 29 (distribution date, the hard event); then weekly every Monday for the following 10 weeks to track the HONA + HON combined market cap versus pre-spin HON baseline (~$138.85B). Specifically: check HONA and HON prices each Monday morning, multiply by shares outstanding (HONA ~317M post-split; HON ~317M post-split), sum, and compare to the pre-distribution HON combined market cap.
- **horizon_expiry_market_signal:** The HONAV when-issued spread versus the implied HONA value collapses to zero on June 29 at distribution — a spread of zero (or the HONAV/HONA price converging) is the market-side confirmation that the corporate action has settled and the thesis enters its resolution window. After June 29, the signal to watch is the HON + HONA combined market cap stabilising within ±5% of the pre-spin HON market cap (~$138.85B) for two consecutive weeks, indicating that post-spin selling and index rebalancing have cleared and the market has reached a settled view on stand-alone values.

## 4. Verdict

Verdict: medium_weeks_3months, expiry = HONA regular-way trading opens on Nasdaq on June 29, 2026 (confirmed via SEC Form 8-K or Honeywell IR page that day)
