# AKAM Document Intake — 2026-09-14

## Verdict

scoped_rerun · Three unique Capital IQ peer estimates reports and one byte-identical routed Fastly copy arrived after the run; the scan used `final_thesis.md` as the finished-run watermark. The unique reports add matched NTM revenue, EBITDA, EBIT, and P/E multiples for Cloudflare, Fastly, and Fortinet, the exact peer set named by the run's priority-1 valuation data need. Re-run only `valuation/relative-valuation-peers` and then its downstream cascade; the reports still lack a clearly stated overall as-of date and full EV/share bridges, while the duplicate is note-only.

## New documents since the last run (analyses/AKAM_2026-09-14)

| Document | Provider · type · §4 tier · as-of | Materiality /100 | Bears on (orb) | Re-run? |
|---|---|---:|---|---|
| `data/AKAM/Cloudflare,IncNYSENETEstimatesReport.xls` | Capital IQ · vendor_export · tier 5 · not stated | 80 | `valuation / relative-valuation-peers` | `/research:rerun valuation relative-valuation-peers AKAM` |
| `data/AKAM/Fastly,IncNasdaqGSFSLYEstimatesReport.xls` | Capital IQ · vendor_export · tier 5 · not stated | 80 | `valuation / relative-valuation-peers` | `/research:rerun valuation relative-valuation-peers AKAM` |
| `data/AKAM/Fortinet,IncNasdaqGSFTNTEstimatesReport.xls` | Capital IQ · vendor_export · tier 5 · not stated | 80 | `valuation / relative-valuation-peers` | `/research:rerun valuation relative-valuation-peers AKAM` |
| `data/AKAM/external/capital-iq-peer-trading-multiples-export/Fastly,IncNasdaqGSFSLYEstimatesReport.xls` | Capital IQ peer trading-multiples export · broker_research · tier 7 · not stated | 5 | None — exact duplicate | note only |

## Scoped rerun plan

1. `/research:rerun valuation relative-valuation-peers AKAM` — the run's priority-1 data need names Cloudflare, Fastly, and Fortinet, and the three unique reports supply the NTM multiple and forward operating inputs that this orb explicitly consumes. Proposed downstream cascade: `valuation`, then `catalyst`.

## Watch (note-only)

- `data/AKAM/external/capital-iq-peer-trading-multiples-export/Fastly,IncNasdaqGSFSLYEstimatesReport.xls` — exact duplicate of the top-level Fastly report, with the same SHA-256 and origin; it adds no independent evidence, and its sidecar classifies it as tier-7 `broker_research`.
