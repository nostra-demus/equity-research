# M0.4 Time Horizon — SIG-20260610-a3f2c81d

> FIXTURE — hand-crafted golden example; not a live run output.

## 1. Horizon

- **horizon:** medium_long_3_6months
- **horizon_rationale:** Funding-cost transmission to HFC/NBFC P&L runs over 1–2 reporting quarters as borrowings roll (WC-001/WC-003 mechanisms); the Sep-quarter results season is the visibility point.

## 2. Expiry Condition

- **expiry_condition:** Publication of Q2 FY27 (Sep-quarter) results for the major listed housing-finance companies (Oct–Nov 2026 season).
- **Where it would be checked tomorrow:** NSE/BSE results calendar and company filings pages.
- **expiry_condition_is_observable:** PASS (locked true)
- **expiry_condition_is_opinion:** PASS (locked false)

## 3. Monitoring

- **monitoring_frequency:** weekly (money-market rates), quarterly (results)
- **horizon_expiry_market_signal:** 3-month AAA HFC CP rates renormalizing toward the new repo level (CCIL/exchange data).

## 4. Verdict

Verdict: medium_long_3_6months, expiry = Q2 FY27 HFC results publication
