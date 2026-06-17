# Signal Intake & Gate 0 — SIG-20260615-71775d0a

## 1. Intake Record

| Field | Value |
|---|---|
| Signal ID | SIG-20260615-71775d0a |
| Event ID (sha256-12) | EVT-2a8fccbcc040 |
| Input nature | company_press_release |
| Input datetime | 2026-06-15T17:25:12.070Z |
| Headline | HONEYWELL BOARD OF DIRECTORS APPROVES SPIN-OFF OF HONEYWELL AEROSPACE |
| Source name (as given / canonical) | PR Newswire / PR Newswire |
| Source URL | https://www.prnewswire.com/news-releases/honeywell-board-of-directors-approves-spin-off-of-honeywell-aerospace-302799898.html |
| Requested by | nvaz51000@gmail.com |

## 2. Gate 0 — Approved-Source Check

- **On the approved list:** Yes — matched canonical name "PR Newswire"
- **Source grade:** A — PR Newswire is a primary press-release wire; this release originates directly from the company (Honeywell), making it a company-issued disclosure distributed over a primary newswire, not a secondary aggregation
- **approved_source_check:** true

## 3. Dedup Pre-Check

- **event_id match in ledger:** No — EVT-2a8fccbcc040 not found in screener/ledger/events.ndjson
- **URL match in ledger:** No — URL fragment "302799898" not found in screener/ledger/events.ndjson

## 4. Gate Decision

The signal comes from PR Newswire, which is on the approved list (Grade A). The sha256-derived event_id EVT-2a8fccbcc040 does not appear in the ledger, and the source URL has no prior match either. This is a first-time submission of a board-approved spin-off announcement — a material structural event for Honeywell. The signal proceeds to the next signal-gate module.

## Routing

Routing: Proceed
Next module: signal-gate continues
