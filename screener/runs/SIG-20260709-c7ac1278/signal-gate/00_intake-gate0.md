# Signal Intake & Gate 0 — SIG-20260709-c7ac1278

## 1. Intake Record

| Field | Value |
|---|---|
| Signal ID | SIG-20260709-c7ac1278 |
| Event ID (sha256-12) | EVT-87ff0c171d13 |
| Input nature | news_headline |
| Input datetime | 2026-07-08T16:46:19.637Z |
| Headline | Ascension plans to acquire independent system Williamson Health for nearly $1B |
| Source name (as given / canonical) | Fierce Healthcare / Fierce Healthcare |
| Source URL | https://www.fiercehealthcare.com/providers/ascension-plans-acquire-independent-system-williamson-health-nearly-1b |
| Requested by | ceekay@muns.io |

## 2. Gate 0 — Approved-Source Check

- **On the approved list:** Yes — matched canonical name "Fierce Healthcare" (listed verbatim in `sources.signal_gate.allowed`)
- **Source grade:** A — Fierce Healthcare is a primary sector-specific trade publication listed directly on the approved source list (not an aggregator citing another source)
- **approved_source_check:** true

## 3. Dedup Pre-Check

- **event_id match in ledger:** No — EVT-87ff0c171d13 is absent from `screener/ledger/events.ndjson`
- **URL match in ledger:** No — no match for the source URL in the ledger

## 4. Gate Decision

Source passes: Fierce Healthcare is explicitly listed in the swarm manifest's `sources.signal_gate.allowed`. The sha256-derived event_id EVT-87ff0c171d13 is not present in the ledger, and the source URL has no prior entry — this is a first submission. The signal proceeds to the rest of the signal-gate module for relevance scoring and novelty assessment.

## Routing

Routing: Proceed
Next module: signal-gate continues
