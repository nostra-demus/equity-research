# AMZN Document Intake — 2026-07-23

## Verdict
scoped_rerun · Five documents landed since the 2026-07-10 run finished: one tier-5 YipitData cloud-spend panel (Mar-26 update) and four tier-10 screener wire events. The YipitData panel clears the materiality gate (68) — it gives an independent VA-consensus cross-check on AWS/Azure/GCP 1Q26 growth and shows AWS's AI-token share extending its lead over Azure, bearing on earnings/revenue-drivers, earnings/guidance-consensus, and business-model/moat. Scope the rerun to those three orbs and their cascade. All four wire events (chip-commitment quote, a generic capex-comparison piece, a routine Florida facility closure, and a speculative external-chip-sales story) are single tier-10 sources with no filing or second independent source backing them, so per INTAKE.md §5 they stay note_only — most notably the $225B chip-commitment claim, which would be material if corroborated but is not yet.

## New documents since the last run (analyses/AMZN_2026-07-10)

| Document | Provider · type · §4 tier · as-of | Materiality /100 | Bears on (orb) | Re-run? |
| --- | --- | --- | --- | --- |
| Cloud (AWS, Azure, GCP) Mar-26 Update.pdf | YipitData · alt_data_panel · tier 5 · as-of 2026-03 | 68 | earnings/revenue-drivers, earnings/guidance-consensus, business-model/moat | `/research:rerun earnings guidance-consensus AMZN`, `/research:rerun earnings revenue-drivers AMZN`, `/research:rerun business-model moat AMZN` |
| screener_event_EVT-14cd12418d3f.md ("Jassy: chip business has $225B in commitments") | Nasdaq (screener wire) · tier 10 · as-of 2026-07-17 | 55 | earnings/revenue-drivers (candidate, not confirmed) | note only |
| screener_event_EVT-37c9b5f64b76.md ("Amazon's Trillion-Dollar Capex Gamble vs Shopify") | Yahoo Finance (screener wire) · tier 10 · as-of 2026-07-19 | 22 | — | note only |
| screener_event_EVT-bd42f71c12ab.md ("Amazon closes another major facility, ~500 workers") | TheStreet (screener wire) · tier 10 · as-of 2026-07-19 | 15 | — | note only |
| screener_event_EVT-d91208d97714.md ("Amazon's AI Chip Bet Could Be Bigger Than Investors Realize") | Nasdaq (screener wire) · tier 10 · as-of 2026-07-13 | 28 | — | note only |

## Scoped rerun plan

1. `/research:rerun earnings guidance-consensus AMZN` — the panel gives an independent VA-consensus cross-check on AWS/Azure/GCP growth (with stated vendor margins of error), which the current consensus read does not carry.
2. `/research:rerun earnings revenue-drivers AMZN` — the panel is a measured-panel read on the AWS/cloud revenue driver and the AI-workload/token-share driver, at a level of granularity (AI token share, GPU/Graviton mix) the current run's Q1 10-Q-sourced read does not capture.
3. `/research:rerun business-model moat AMZN` — the AI-token-share swing (AWS 51% vs Azure 27%, up from 16%/53% a year earlier) is competitive-economics evidence bearing on the moat verdict's AWS-vs-Azure-vs-GCP competitive-position read.

Each command cascades to its dependent modules (balance-sheet-survival, management-governance, valuation, catalyst) per the live dependency graph; the server recomputes the exact cascade at launch time.

## Watch (note-only)

- **YipitData panel's headline AWS growth number is already stale.** Its "1Q26 AWS growth of 29.3%" estimate covers a quarter Amazon has already reported (28% YoY per the Q1 2026 10-Q, already in the current thesis) — the new information is the AI-token-share detail and the independent consensus cross-check, not a fresher growth print. Its brief "C2QTD26" early-April reads for AWS/Azure are self-flagged by the vendor as low-confidence and are not actionable yet.
- **"$225B chip commitments" (EVT-14cd12418d3f).** A single Nasdaq wire report of a CEO Jassy quote — no filing, investor deck, or second independent outlet in the pool confirms the $225B commitment figure or the $20B run-rate. Per INTAKE.md §5 a single uncorroborated tier-10 wire claim defaults to note_only regardless of how material it would be if true. Worth flagging for the next Q2 earnings call as a confirmation trigger, since a real $225B chip-commitment disclosure would be a genuine new revenue-driver data point.
- **Capex-vs-Shopify comparison piece (EVT-37c9b5f64b76).** Generic multi-name commentary, screener-tagged "relevant_non_material," no new quantified Amazon fact captured.
- **Florida facility closure (EVT-bd42f71c12ab).** A WARN notice affecting ~494 employees (plus an earlier ~616 at a second facility) is immaterial against Amazon's >1.5M-person workforce and does not move any module's read.
- **Speculative external chip-sales story (EVT-d91208d97714).** "Reportedly exploring" framing, no verified figures, single source — watch for corroboration but nothing to act on yet.
