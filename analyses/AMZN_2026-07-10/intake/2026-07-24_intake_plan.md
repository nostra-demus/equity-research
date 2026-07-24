# AMZN Document Intake — 2026-07-24

## Verdict
scoped_rerun · No new documents landed since the prior 2026-07-23 intake scan — the same five documents recorded then (one tier-5 YipitData cloud-spend panel and four tier-10 screener wire events) are all still the newest pool files versus the 2026-07-10 run watermark, confirmed byte-identical by sha256. The YipitData panel still clears the materiality gate (68) — it gives an independent VA-consensus cross-check on AWS/Azure/GCP 1Q26 growth and shows AWS's AI-token share extending its lead over Azure — so the scoped rerun recommendation (earnings/revenue-drivers, earnings/guidance-consensus, business-model/moat, and cascade) stands unchanged and has not yet been actioned. The four wire events remain note_only, most notably the unconfirmed $225B chip-commitment claim.

## New documents since the last run (analyses/AMZN_2026-07-10)

| Document | Provider · type · §4 tier · as-of | Materiality /100 | Bears on (orb) | Re-run? |
| --- | --- | --- | --- | --- |
| `external/yipitdata/Cloud (AWS, Azure, GCP) _ Mar-26 Update.pdf` | YipitData · alt-data panel · tier 5 · 2026-03 | 68 | earnings/revenue-drivers, earnings/guidance-consensus, business-model/moat | `/research:rerun earnings revenue-drivers AMZN`, `/research:rerun earnings guidance-consensus AMZN`, `/research:rerun business-model moat AMZN` |
| `screener_event_EVT-14cd12418d3f.md` | Nasdaq (screener wire) · tier 10 · 2026-07-17 | 55 | earnings/revenue-drivers (uncorroborated) | note only |
| `screener_event_EVT-37c9b5f64b76.md` | Yahoo Finance (screener wire) · tier 10 · 2026-07-19 | 22 | — | note only |
| `screener_event_EVT-bd42f71c12ab.md` | TheStreet (screener wire) · tier 10 · 2026-07-19 | 15 | — | note only |
| `screener_event_EVT-d91208d97714.md` | Nasdaq (screener wire) · tier 10 · 2026-07-13 | 28 | — | note only |

## Scoped rerun plan

Three orbs clear the materiality gate (60), all triggered by the YipitData Mar-26 cloud-spend panel:

1. `/research:rerun earnings guidance-consensus AMZN` — the panel gives an independent Visible Alpha-consensus cross-check on AWS/Azure/GCP 1Q26 growth (with stated vendor error margins) the current run's consensus read does not carry.
2. `/research:rerun earnings revenue-drivers AMZN` — the panel's AWS/cloud growth read and AI-token-share detail (51% vs Azure's 27%, from 16%/53% a year prior) sits below the granularity of the run's current Q1 2026 10-Q-based read.
3. `/research:rerun business-model moat AMZN` — the AI-token-share swing is competitive-economics evidence bearing on the AWS-vs-Azure-vs-GCP competitive-position read (lower confidence: moat's own WHAT-TO-READ list doesn't name alt-data panels explicitly).

Each cascades through balance-sheet-survival, management-governance, valuation, and catalyst. This scope has not changed since it was first recommended on 2026-07-23 and has not yet been actioned.

## Watch (note-only)

- **$225B chip-commitment / $20B run-rate quote (Nasdaq wire, 2026-07-17, materiality 55):** a single tier-10 source quoting CEO Andy Jassy. No filing or second independent source in the pool corroborates the figures — per `INTAKE.md` §5 a tier-9/10 single-source claim defaults to note_only regardless of materiality until corroborated. Would be a material new revenue driver for earnings/revenue-drivers if confirmed.
- **Capex-vs-Shopify comparison piece (Yahoo Finance, 2026-07-19, materiality 22):** generic commentary, no new quantified Amazon fact — below gate.
- **Florida fulfillment-center closures (TheStreet, 2026-07-19, materiality 15):** WARN notice, ~1,110 employees combined vs Amazon's >1.5M headcount — immaterial at this scale.
- **Speculative external Trainium/Inferentia chip-sales story (Nasdaq, 2026-07-13, materiality 28):** single-source, "reportedly," no verified figures — below gate.
