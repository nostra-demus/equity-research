# Thesis Integrity Synthesis — SIG-20260804-da21208a

## Abstract

This thesis's one test for being wrong asks Grab's order-and-trip volume growth to more than halve in a single quarter — a move that has not happened once in the last six quarters, which have all landed in a tight 20%-24% band. That makes the kill switch fireproof: it could not catch even a realistic, moderate slowdown in time to matter, even while the thesis's own named worry (growth propped up by driver and rider discounts) could be actively playing out. Verdict: Thesis broken. Routing: watchlist_integrity_broken — the pipeline stops here, before candidate-surfacing spends any work naming companies.

## 1. What Was Attacked

- **original_routing_outcome:** provisional
- **original_final_score:** 67/100
- **adversarial_direction:** Attack the carried-forward beneficiary tiers on the long side — direct beneficiary DIR-001 (payment-rail processors, the highest-scored "primary" tier) and its paired indirect beneficiary IND-001 (competing Southeast Asia platforms) — by showing that the harmed-party tier (HARM-001, informal-taxi displacement) rests on a plainer, more directly confirmed one-way mechanism, while DIR-001's own scoring already concedes its magnitude is unquantifiable (no processor take-rate is disclosed anywhere) and IND-001 is explicitly "inferred... unconfirmed by peer data."

## 2. Findings (transcribed from 01)

- **bear_case_steelman:** Every carried-forward party in M0_3 depends on one assumption — that Grab's Q2 2026 acceleration reflects real, continuing demand. M0_6_3's own numbers cut against that: the incremental dollar spent on incentives this quarter bought less growth (13.9% marginal ratio) than the average dollar has historically (10.9%), and 81% of GMV growth came from more people using the app rather than existing users spending more. If Grab throttles incentive spend, growth could soften toward the mid-to-high teens without ever approaching the "below 10%" level the kill switch requires to fire — the exact risk the thesis names could unfold quarter after quarter while the designated monitor stays silent.
- **kill-switch attack:** is_fireproof=true — This is a must-cross kill (dies only if GMV growth falls below 10%). Grab's own reported quarterly on-demand GMV growth has run 20%-24% across six straight quarters (Q4 2024 through Q2 2026). The threshold requires a drop of 11-14 percentage points in one quarter — roughly three times the metric's entire observed volatility range over the last year and a half. A realistic bear path (incentive-funded growth softening as fuel-cost support eases) points to deceleration into the mid-to-high teens, not a collapse below 10%. The defect is magnitude, not timing — the base-case trigger date (2026-11-03/04) sits comfortably before the 2026-11-15 threshold date.
- **citation spot-check:** 5 claims checked, 3 verified / 2 not (unverified — not miscited: the "26/26 unanimous" consensus read is single-vendor sourced against other aggregators showing at least one non-Buy rating, and the Uber 21.22x EV/EBITDA peer benchmark sits inside a wide 14.8x-27.7x cross-vendor range).

## 3. Verdict and Routing

- **verdict:** Thesis broken
- **routing:** watchlist_integrity_broken
- **routing_reason:** The M0_5 kill switch is fireproof: it requires GMV growth to fall below 10% inside one quarter — a drop far beyond anything Grab has shown in six consecutive quarters of results, and roughly three times the metric's own volatility range. A realistic bear-case path implied by the thesis's own mechanism would never cross that threshold, so the thesis's central named risk could actively be confirming itself while the designated test never fires. Per MODULE_RULES.md's binding verdict table, a fireproof kill switch with no genuine test is "Thesis broken," which maps to Routing: watchlist_integrity_broken.
- **edge_score_haircut_note:** If this record is ever revisited, the M0_5 threshold should be recalibrated inside Grab's own observed 20%-24% GMV-growth band (e.g., a fall to the mid-to-high teens by Q3, not below 10%) so the kill switch can actually fire on a realistic bear path; the current threshold cannot.

## Machine Output

Wrote: `screener/runs/SIG-20260804-da21208a/thesis_integrity_review.json` (validates against frameworks/screener/thesis_integrity_review.schema.json)
Board index refreshed.

## Routing

Routing: watchlist_integrity_broken
