# Run Metadata

- ticker: AKAM
- run_date: 2026-09-14
- orchestrator: /research:full (per-module chain)
- data_folder: data/AKAM/

## Modules completed

- balance-sheet-survival: synthesis — analyses/AKAM_2026-09-14/balance-sheet-survival/99_balance-sheet-survival-synthesis.md
- business-model: synthesis — analyses/AKAM_2026-09-14/business-model/99_business-model-synthesis.md
- catalyst: synthesis — analyses/AKAM_2026-09-14/catalyst/99_catalyst-synthesis.md
- competitive-intel: synthesis — analyses/AKAM_2026-09-14/competitive-intel/99_competitive-intel-synthesis.md
- earnings: synthesis — analyses/AKAM_2026-09-14/earnings/99_earnings-synthesis.md
- management-governance: synthesis — analyses/AKAM_2026-09-14/management-governance/99_management-governance-synthesis.md
- valuation: synthesis — analyses/AKAM_2026-09-14/valuation/99_valuation-synthesis.md

## Synthesizer status

- succeeded — analyses/AKAM_2026-09-14/final_thesis.md

## Modules aborted

- none

## Derived output status

- Memo status: succeeded — analyses/AKAM_2026-09-14/memo.md
- Audit dossier status: succeeded — analyses/AKAM_2026-09-14/audit_dossier.md

## 3–6 month idea assessment

- not_assessable; immutable admission status: not_applicable
- Gap: canonical market evidence is unavailable because no unambiguous provider-bound equity history was found for AKAM (`history_missing`).
- Gap: `decision_record.idea_valuation_bridge` is null, so the 365-day source scenarios cannot be projected into a 90–183 day holding window.

## Integrity gate

- GATE: PROVISIONAL — the final decision record and thesis carry the verify-evidence failure.
- GATE-VERIFY: PROVISIONAL — final immutable `verification_report_v2.json` verdict `Material issues`, integrity 65/100.
- Pre-mortem: `Survives with haircut`; the decision record applies 50→45 (−5 points), while final immutable `pre_mortem_v2.json` recommends 40/100 for admission authority.
- GATE-EXPECTATIONS: PASS — confidence is not above 60; final immutable `expectations_gap_v2.json` nevertheless rates the edge `Weak`, non-exploitable, at 30/100.

## Commit SHA

- (to be filled after commit)
