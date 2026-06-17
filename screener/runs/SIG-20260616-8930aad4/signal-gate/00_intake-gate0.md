# Signal Intake & Gate 0 — SIG-20260616-8930aad4

## 1. Intake Record

| Field | Value |
|---|---|
| Signal ID | SIG-20260616-8930aad4 |
| Event ID (sha256-12) | EVT-4ac284fe8b11 |
| Input nature | news_headline |
| Input datetime | 2026-06-16T06:32:38.345Z |
| Headline | TCS To Take $70 Million Exceptional Charge In Q1FY27 After US Supreme Court Rejects Appeal In DXC Suit |
| Source name (as given / canonical) | NDTV Profit / NDTV Profit |
| Source URL | https://www.ndtvprofit.com/markets/tcs-to-take-70-million-exceptional-charge-in-q1fy27-after-us-supreme-court-rejects-appeal-in-dxc-suit-11641992#publisher=newsstand |
| Requested by | ceekay@muns.io |

## 2. Gate 0 — Approved-Source Check

- **On the approved list:** Yes — matched canonical name "NDTV Profit" (exact match in `sources.signal_gate.allowed`)
- **Source grade:** A — NDTV Profit is a primary financial news publication listed directly on the approved-source list; it is not a secondary aggregator
- **approved_source_check:** true

## 3. Dedup Pre-Check

- **event_id match in ledger:** No — EVT-4ac284fe8b11 not found in screener/ledger/events.ndjson
- **URL match in ledger:** No — source URL not found in screener/ledger/events.ndjson

## 4. Gate Decision

The signal comes from NDTV Profit, which is on the approved-source list (Grade A). The event_id EVT-4ac284fe8b11, computed as the sha256 of the normalized headline and source URL, does not appear in the ledger, and the URL itself has no prior match either. This is a new, clean submission from an approved source. The gate passes and the signal proceeds to the next module in the signal-gate pipeline.

## Routing

Routing: Proceed
Next module: signal-gate continues
