# Signal Intake & Gate 0 — SIG-20260612-dd716589

## 1. Intake Record

| Field | Value |
|---|---|
| Signal ID | SIG-20260612-dd716589 |
| Event ID (sha256-12) | EVT-82c655bbde5d |
| Input nature | news_headline |
| Input datetime | 2026-06-12T13:39:48.480Z |
| Headline | Major Gulf LNG producer declares force majeure on June-July cargo loadings after compressor train failure |
| Source name (as given / canonical) | Reuters / Reuters |
| Source URL | https://www.reuters.com/business/energy/fixture-lng-force-majeure/ |
| Requested by | ceekay@muns.io |

## 2. Gate 0 — Approved-Source Check

- **On the approved list:** Yes — matched canonical name "Reuters" (exact match, first entry on `sources.signal_gate.allowed` list)
- **Source grade:** A — Reuters is a primary international newswire and appears directly on the allowed list as a first-tier source; no intermediary aggregator is involved
- **approved_source_check:** true

## 3. Dedup Pre-Check

Normalization applied: headline lowercased, whitespace collapsed; concatenated with "|" and source_url.

Input to sha256: `major gulf lng producer declares force majeure on june-july cargo loadings after compressor train failure|https://www.reuters.com/business/energy/fixture-lng-force-majeure/`

sha256 output: `82c655bbde5d641845de6272b33a987969a7965ad6fb34150c8237dfde481877`

event_id: `EVT-82c655bbde5d`

- **event_id match in ledger:** No — no entry with `EVT-82c655bbde5d` found in `screener/ledger/events.ndjson`
- **URL match in ledger:** No — no entry containing `fixture-lng-force-majeure` found in `screener/ledger/events.ndjson`

## 4. Gate Decision

The signal passes both gates. The source is Reuters, which is the first entry on the swarm manifest's `sources.signal_gate.allowed` list and is classified Grade A (primary international newswire). No prior ledger entry matches either the computed event_id (`EVT-82c655bbde5d`) or the source URL, so this is a new submission, not a resubmission. The signal proceeds to the remaining signal-gate agents (Steps 1–10 of the Phase 0.1 gauntlet).

## Routing

Routing: Proceed
Next module: signal-gate continues
