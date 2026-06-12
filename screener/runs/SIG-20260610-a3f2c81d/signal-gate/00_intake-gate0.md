# Signal Intake & Gate 0 — SIG-20260610-a3f2c81d

> FIXTURE — hand-crafted golden example; not a live run output.

## 1. Intake Record

| Field | Value |
|---|---|
| Signal ID | SIG-20260610-a3f2c81d |
| Event ID (sha256-12) | EVT-4be09c2d71aa |
| Input nature | news_headline |
| Input datetime | 2026-06-10T05:12:00+00:00 |
| Headline | RBI's Monetary Policy Committee cuts repo rate 50 bps to 5.00% in surprise off-cycle move |
| Source name | Reuters (canonical match) |
| Source URL | https://www.reuters.com/world/india/rbi-mpc-cuts-repo-rate-50bps-2026-06-10/ |
| Requested by | fixture |

## 2. Gate 0 — Approved-Source Check

- **On the approved list:** Yes — Reuters (primary newswire)
- **Source grade:** A — primary newswire carrying the official decision, corroborated by the RBI press release.
- **approved_source_check:** true

## 3. Dedup Pre-Check

- **event_id match in ledger:** No (ledger had no prior entries for this event)
- **URL match in ledger:** No

## 4. Gate Decision

Pass. On-list grade-A source, no prior ledger entry. Proceed to the gauntlet.

## Routing

Routing: Proceed
Next module: signal-gate continues
