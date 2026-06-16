# M0.5 Primary Falsification — SIG-20260616-8930aad4

## 1. The Kill Switch

- **falsification_sentence:** The $70M exceptional charge does not appear in TCS's Q1 FY27 income statement filed with BSE/NSE, whether because TCS reverses, restates, or reclassifies the charge, or because the reported Q1 FY27 net profit after accounting for this charge departs by less than $35M from its pre-announcement consensus figure.
- **falsification_condition_type:** mechanism_reversal

## 2. Monitoring Specification

| Field | Value |
|---|---|
| monitorable_metric_1 | TCS Q1 FY27 Quarterly Financial Results — BSE filing (bseindia.com → Financial Results → TCS) under SEBI LODR Reg 33; the "Exceptional Items" line in the income statement |
| monitorable_metric_2 | TCS Q1 FY27 reported net profit vs. pre-announcement consensus net profit (Bloomberg consensus or CapIQ consensus, snapshot dated June 13, 2026 or earlier) |
| monitorable_threshold_rate | 35 |
| monitorable_threshold_rate_unit | USD million — the charge either appears as an exceptional item of ≥ $35M (roughly Rs 2,900 crore, half the announced $70M / Rs 5,830 crore) in the Q1 FY27 filing, OR the reported net profit falls short of consensus by at least $35M; if neither condition is met, the earnings-impact thesis is falsified |
| monitorable_threshold_date | 2026-07-31 (inside the M0.4 medium_weeks_3months horizon; TCS Q1 FY27 results are expected mid-July 2026, with the BSE/NSE filing the same day) |

## 3. Uncomfortable Check

- **uncomfortable_check:** PASS (locked true)
- **uncomfortable_check_rationale:** The load-bearing claim is that a $70M charge — announced via BSE/NSE exchange filing on June 16, 2026 and not yet in any audited financial statement — will appear in TCS's Q1 FY27 reported income statement and drag reported EPS below consensus. HARM-001 scores 80 entirely because this one-step transmission (announced charge → reported earnings line) is fast and direct. If the charge does not materialize in the Q1 FY27 filing — for any reason, including settlement renegotiation, accounting reclassification, or a restatement of the provision — then the magnitude of earnings harm is unproven, the speed sub-score collapses, and HARM-001's composite score likely falls below the 75-point primary threshold. The thesis would not be "dented": there would be no quantified earnings impact to carry forward to candidate-surfacing. The fact that WC-004 shows the stock rose 1.57% on disclosure day makes this falsifier genuinely uncomfortable — it is possible the market already reads the charge as fully absorbed, and if the Q1 filing also shows no incremental harm (charge smaller than announced, or offset by an unusually strong quarter), the entire short-term earnings-pressure thesis ends. A motivated holder cannot dismiss this falsifier by saying "the company just reclassified it" — any material deviation from $70M in the Q1 exceptional-items line falsifies the core claim.

## 4. Secondary Falsifiers

| ID | Description | Metric | P(fires in horizon) |
|---|---|---|---:|
| SF-001 | TCS settles or renegotiates the DXC/CSC payment before Q1 FY27 results, reducing the total cash outflow below $150M already provisioned and eliminating the need for the $70M incremental charge — the announced charge is publicly withdrawn or amended via a fresh BSE/NSE filing | BSE/NSE exchange filing by TCS (SEBI LODR Reg 30 material-event intimation) disclosing any amendment to the June 16, 2026 charge announcement | 0.08 |
| SF-002 | TCS Q1 FY27 reported net profit beats pre-announcement consensus by more than $35M despite the charge — meaning an unusually strong operating quarter offsets the exceptional item and consensus revisions move upward, reversing the earnings-pressure narrative | Bloomberg or CapIQ Q1 FY27 net profit actuals vs. consensus snapshot (dated ≤ June 13, 2026); a beat of ≥ $35M above that consensus confirms the charge is absorbed with no net EPS drag visible to the market | 0.15 |
| SF-003 | A second material legal event affecting TCS's reported EPS in Q1 FY27 (unrelated to this case) dominates the earnings narrative and makes the $70M charge impossible to isolate as a discrete driver — the thesis cannot be confirmed or denied on its own terms | TCS Q1 FY27 earnings transcript and results release (BSE/NSE filing + analyst commentary): look for any second exceptional item or management disclosure that dwarfs the $70M in size | 0.07 |

## 5. Lock State

- **locked_after_m0_complete:** pending (edge-definition sets the lock; after that these criteria cannot be moved)

## 6. Verdict

Verdict: kill switch set — TCS Q1 FY27 BSE/NSE exceptional-items line missing or below $35M by 2026-07-31
