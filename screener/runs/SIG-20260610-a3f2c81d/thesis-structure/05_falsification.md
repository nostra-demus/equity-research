# M0.5 Primary Falsification — SIG-20260610-a3f2c81d

> FIXTURE — hand-crafted golden example; not a live run output.

## 1. The Kill Switch

- **falsification_sentence:** If 3-month AAA HFC commercial-paper yields have not declined by at least 25 bps from their 2026-06-09 level by 2026-08-15, the funding-cost transmission this thesis depends on is not occurring.
- **falsification_condition_type:** mechanism_failure_transmission

## 2. Monitoring Specification

| Field | Value |
|---|---|
| monitorable_metric_1 | 3-month AAA HFC CP yield (CCIL / exchange money-market data) |
| monitorable_metric_2 | 1-year AAA NBFC NCD yield (exchange bond data) |
| monitorable_threshold_rate | 25 |
| monitorable_threshold_rate_unit | bps decline from 2026-06-09 baseline |
| monitorable_threshold_date | 2026-08-15 |

## 3. Uncomfortable Check

- **uncomfortable_check:** PASS (locked true)
- **uncomfortable_check_rationale:** If short funding does not reprice, the DIR-001 spread-expansion mechanism — the load-bearing claim — is dead. There is no fallback story.

## 4. Secondary Falsifiers

| ID | Description | Metric | P(fires in horizon) |
|---|---|---|---:|
| SF-001 | MPC reverses the cut at/before the Aug 2026 meeting | RBI MPC calendar | 0.05 |
| SF-002 | Deposit-rate war keeps HFC bank-line costs flat | WALR on fresh rupee loans (RBI monthly) | 0.15 |

## 5. Lock State

- **locked_after_m0_complete:** pending (edge-definition sets the lock)

## 6. Verdict

Verdict: kill switch set — 3m AAA HFC CP yield failing to fall 25 bps by 2026-08-15
