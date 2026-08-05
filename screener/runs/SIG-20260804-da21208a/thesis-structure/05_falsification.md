# M0.5 Primary Falsification — SIG-20260804-da21208a

## 1. The Kill Switch

- **falsification_sentence:** Grab's Q3 2026 earnings print, expected by mid-November 2026, reports on-demand gross merchandise value (GMV — the total dollar value of orders/trips booked through the app) growth decelerating to below 10% year-over-year, roughly half the 21.5% pace reported for Q2 2026.
- **falsification_condition_type:** magnitude_decay

## 2. Monitoring Specification

| Field | Value |
|---|---|
| monitorable_metric_1 | Grab on-demand GMV, year-over-year % growth, as disclosed in Grab Holdings' Q3 2026 earnings release (grab.com/sg/press) and the corresponding Form 6-K filing (SEC EDGAR, issuer CIK 0001855612) |
| monitorable_metric_2 | Grab total revenue, year-over-year % growth, from the same Q3 2026 release/6-K — used to cross-check that a GMV slowdown is a genuine demand deceleration and not a one-off mix artifact |
| monitorable_threshold_rate | 10 |
| monitorable_threshold_rate_unit | % year-over-year GMV growth (cross-checked against revenue growth in the same print) |
| monitorable_threshold_date | 2026-11-15 (Grab's expected Q3 2026 print date, inside the M0.4 medium_weeks_3months horizon that closes when Q3 results are released) |

## 3. Uncomfortable Check

- **uncomfortable_check:** PASS (locked true)
- **uncomfortable_check_rationale:** The load-bearing claim underneath every carried-forward party in the M0.3 beneficiary map — DIR-001 (payment rails), DIR-002 (driver-fleet financing), IND-001 (competing platforms), HARM-001 (informal taxis), HARM-002 (delivery merchants) — is that Grab's Q2 2026 acceleration (GMV +21.5%, revenue +21.7%, WC-003/WC-004) reflects a genuine, continuing rise in Southeast Asia on-demand demand, not a one-quarter pull-forward (e.g., a promotional push timed around the guidance raise and buyback announcement). Every "speed" and "magnitude" sub-score in M0.3 assumes that pace holds through the M0.4 horizon. If Q3 GMV growth halves to below 10%, the payment-volume mechanism DIR-001 depends on shrinks, the added-driver-hours mechanism DIR-002 depends on weakens, the regional-tailwind inference IND-001 depends on is unconfirmed or reversed, and the continued-share-loss inference behind HARM-001/HARM-002 no longer holds because Grab itself is not growing at the rate that inference requires. This is not a miss on the margins — it is the same mechanism that produced every carried-forward party running in reverse. The thesis would be dead, not dented.

## 4. Secondary Falsifiers

| ID | Description | Metric | P(fires in horizon) |
|---|---|---|---:|
| SF-001 | Grab cuts its FY2026 revenue guidance below the pre-August-2026 floor of $4.04bn (reversing WC-001) at the Q3 2026 print or in any interim disclosure before it | FY2026 revenue guidance range, low end — Grab IR release / Form 6-K | 0.15 |
| SF-002 | A major Southeast Asia on-demand peer (e.g., GoTo/Gojek, or Delivery Hero's foodpanda) reports flat or declining on-demand GMV for the period overlapping Grab's Q2/Q3 2026 — showing Grab's growth is share capture, not a regional demand tailwind, and invalidating IND-001's peer-tailwind assumption | Peer on-demand GMV, year-over-year % growth — peer's own quarterly earnings release | 0.30 |
| SF-003 | Grab discloses that its in-house payment product (GrabPay / GXS Bank) share of on-demand GMV settled in-app has risen materially (e.g., crosses 40% of GMV), showing volume is shifting away from third-party payment rails rather than through them — falsifies DIR-001 specifically | GrabPay/GXS in-app payment penetration, % of on-demand GMV — Grab investor materials or earnings-call disclosure | 0.20 |

## 5. Lock State

- **locked_after_m0_complete:** pending (edge-definition sets the lock; after that these criteria cannot be moved)

## 6. Verdict

Verdict: kill switch set — Grab on-demand GMV YoY growth crossing below 10% by 2026-11-15
