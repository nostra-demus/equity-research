# M0.4 Time Horizon — SIG-20260616-8930aad4

## 1. Horizon

- **horizon:** medium_weeks_3months
- **horizon_rationale:** The event that drives this thesis — TCS booking a $70M exceptional charge — is already announced and legally final. The only remaining observable is the Q1 FY27 earnings report, where the charge will appear as a line item in TCS's income statement. TCS's Q1 FY27 ends June 30, 2026; results are typically published in mid-July 2026, roughly 4–6 weeks from today. The transmission mechanism is one step: charge disclosed → charge confirmed in reported financials → EPS impact visible → consensus revisions complete. There is no contract cycle, seasonal window, or regulatory schedule that extends the clock beyond that Q1 print.

## 2. Expiry Condition

- **expiry_condition:** TCS publishes its Q1 FY27 financial results (ending June 30, 2026) confirming the $70M exceptional charge in the income statement and reporting the EPS impact for the quarter.
- **Where it would be checked tomorrow:** BSE and NSE exchange filings (bseindia.com → "Quarterly Results" for TCS; nseindia.com → "Financial Results" for TCS); and TCS's own investor-relations page (tcs.com/investor-relations). The Q1 FY27 results filing under SEBI LODR Regulation 33 will be the definitive document. NDTV Profit and Business Standard will carry the results the same day.
- **expiry_condition_is_observable:** PASS (locked true)
- **expiry_condition_is_opinion:** PASS (locked false)

## 3. Monitoring

- **monitoring_frequency:** Weekly — check BSE/NSE results filing page every Monday for the Q1 FY27 results announcement date; switch to daily monitoring once TCS announces the board meeting date for Q1 results (typically disclosed 2–3 weeks before the actual release).
- **horizon_expiry_market_signal:** The spread between TCS's reported EPS for Q1 FY27 and the pre-announcement consensus EPS estimate (sourced from Bloomberg or CapIQ) normalizing to zero — meaning the market has fully absorbed the charge and revised estimates have converged. A secondary signal is TCS's one-year forward P/E multiple returning to its pre-disclosure range (observable on any reputable data feed with a dated snapshot).

## 4. Verdict

Verdict: medium_weeks_3months, expiry = TCS Q1 FY27 results (BSE/NSE filing, mid-July 2026) confirming the $70M exceptional charge in reported financials
