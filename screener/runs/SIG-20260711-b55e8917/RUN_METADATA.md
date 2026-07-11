# RUN_METADATA — SIG-20260711-b55e8917

| Field | Value |
|---|---|
| Signal ID | SIG-20260711-b55e8917 |
| Headline | Prediction: Carvana's New-Car Business Will Work. Early Numbers Are Stunning. |
| Source | The Motley Fool |
| Date | 2026-07-11 |
| Started | 2026-07-11T15:16:34Z |
| Finished | 2026-07-11T15:32:00Z (approx) |
| Repo SHA at start | fca49a316bcc0ac1be2f2874ef06a836f3632532 |

## Module Outcomes

| Module | Status | Routing |
|---|---|---|
| signal-gate | Completed | LOG |
| thesis-structure | Skipped — terminal routing | — |
| edge-definition | Skipped — terminal routing | — |
| candidate-surfacing | Skipped — terminal routing | — |

## Final Result

- **Routing:** LOG
- **Materiality score:** 34 (below the 40-point PARK floor)
- **Status reason:** The Motley Fool is an approved Tier 4 retail-investment opinion site. The article covers a real event (Carvana's $171M acquisition of 7 Stellantis dealerships, with specific Casa Grande sales figures), but is uncorroborated by any primary disclosure or wire-class source. Source quality collapse (2/20) pulled the score below LOG threshold despite genuine novelty (0.85) and first-seen event status.
- **Thesis ID:** none (signal-gate terminal — thesis not assembled)
- **Candidates:** none

## Notes

- No `override_promote` in intake; human override not applicable.
- Ledger event appended by synthesis agent (signal_id confirmed in screener/ledger/events.ndjson).
- Board index refreshed via `scripts/update_board_index.py`.
