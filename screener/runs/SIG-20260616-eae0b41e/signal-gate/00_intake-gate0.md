# Signal Intake & Gate 0 — SIG-20260616-eae0b41e

## 1. Intake Record

| Field | Value |
|---|---|
| Signal ID | SIG-20260616-eae0b41e |
| Event ID (sha256-12) | EVT-74fc26154504 |
| Input nature | exchange_announcement |
| Input datetime | 2026-06-16T11:23:51.971Z |
| Headline | Norben Tea & Exports Limited |
| Source name (as given / canonical) | BSE / NSE Exchange Filing |
| Source URL | https://nsearchives.nseindia.com/corporate/team_bbodade_06052026154831_NORBTEAEXP1.pdf |
| Requested by | ceekay@muns.io |

## 2. Gate 0 — Approved-Source Check

- **On the approved list:** Yes — matched canonical name "BSE / NSE Exchange Filing" (exact match against SWARM.md `sources.signal_gate.allowed`)
- **Source grade:** A — this is a primary exchange filing published directly on NSE's archives; it is an official disclosure, not an aggregator
- **approved_source_check:** true

## 3. Dedup Pre-Check

event_id computed as: sha256(lowercase, whitespace-collapsed headline + "|" + source_url) = sha256("norben tea & exports limited|https://nsearchives.nseindia.com/corporate/team_bbodade_06052026154831_NORBTEAEXP1.pdf") → first 12 hex chars = 74fc26154504 → EVT-74fc26154504.

- **event_id match in ledger:** No — EVT-74fc26154504 does not appear in screener/ledger/events.ndjson
- **URL match in ledger:** No — the NSE archive URL does not appear in the ledger

## 4. Gate Decision

The signal comes from BSE / NSE Exchange Filing, which is on the approved list and earns a Grade A rating as a primary exchange disclosure. The computed event_id has no match in the ledger and the source URL has no match either, so this is not a resubmission. The signal proceeds to the next module in the signal-gate pipeline. The body text notes that Norben Tea & Exports Limited filed a document with the exchanges; the M0.1 60-second check will need to read that filing to establish what the document actually says and whether it carries a material event.

## Routing

Routing: Proceed
Next module: signal-gate continues
