# M0.4 Time Horizon — SIG-20260628-2c8cfc21

## 1. Horizon

- **horizon:** short_days_weeks
- **horizon_rationale:** The three confirmed world changes (HK$220M–HK$260M net loss disclosed in unaudited management accounts, ~170% loss widening, full ECL provisioning on money lending receivables) all turn on a single upcoming event: the release of the FY2026 audited or preliminary annual results. The board meeting to approve those results was already scheduled for 29 June 2026 — one day after this run — meaning the audited figures will be filed on HKEXnews within days to a few weeks at most. HKEX listing rules require preliminary results within three months of the financial year-end (31 March 2026), so the outer bound is late June 2026. The provisioning mechanism — full ECL write-down on identified client receivables — is already recorded in management accounts; audit confirmation or revision completes the transmission, which is a short-cycle accounting event, not a multi-quarter economic cycle.

## 2. Expiry Condition

- **expiry_condition:** The FY2026 preliminary annual results announcement or full annual report is published by Modern Innovative Digital Technology Company (Stock Code: 2322) on HKEXnews — confirming, revising, or expanding the unaudited HK$220M–HK$260M net loss range and disclosing the exact ECL provision line item for FY ended 31 March 2026.
- **Where it would be checked tomorrow:** HKEXnews filing search at https://www1.hkexnews.hk/listedco/listconews/advancedsearch/search_active_main.aspx — search Stock Code 2322, document type "Annual Results / Preliminary Results Announcement"; a new filing from the company ends the thesis.
- **expiry_condition_is_observable:** PASS (locked true)
- **expiry_condition_is_opinion:** PASS (locked false)

## 3. Monitoring

- **monitoring_frequency:** Daily — check HKEXnews filings page for Stock Code 2322 each morning until the annual results announcement appears.
- **horizon_expiry_market_signal:** The bid-ask spread on 2322.HK normalises and daily trading volume reverts toward its 30-day average after the results are filed — an unusually wide spread or elevated volume relative to the thinly-traded baseline would indicate the market is still pricing in the unresolved uncertainty; compression of spread and volume back to pre-announcement levels is the market-side confirmation that the event has resolved.

## 4. Verdict

Verdict: short_days_weeks, expiry = FY2026 annual/preliminary results published on HKEXnews for Stock Code 2322
