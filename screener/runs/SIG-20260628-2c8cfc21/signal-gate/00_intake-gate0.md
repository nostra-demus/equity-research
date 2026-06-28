# Signal Intake & Gate 0 — SIG-20260628-2c8cfc21

## 1. Intake Record

| Field | Value |
|---|---|
| Signal ID | SIG-20260628-2c8cfc21 |
| Event ID (sha256-12) | EVT-0c55880b61c5 |
| Input nature | exchange_announcement |
| Input datetime | 2026-06-28T15:12:09.613Z |
| Headline | MODERN INNO DT (02322): PROFIT WARNING |
| Source name (as given / canonical) | HKEXnews (HK Exchange Filing) / HKEXnews (HK Exchange Filing) |
| Source URL | https://www1.hkexnews.hk/listedco/listconews/sehk/2026/0628/2026062800071.pdf |
| Requested by | nvaz51000@gmail.com |

## 2. Gate 0 — Approved-Source Check

- **On the approved list:** Yes — matched canonical name "HKEXnews (HK Exchange Filing)" (exact match in `sources.signal_gate.allowed`)
- **Source grade:** A — this is a primary exchange filing direct from HKEXnews, the Hong Kong Stock Exchange's official disclosure platform; it is an official exchange announcement, not a secondary aggregator
- **approved_source_check:** true

## 3. Dedup Pre-Check

- **event_id match in ledger:** No — EVT-0c55880b61c5 does not appear in screener/ledger/events.ndjson (10 entries checked)
- **URL match in ledger:** No — the URL string "2026062800071" does not appear in any ledger entry

## 4. Gate Decision

The signal arrives from HKEXnews (HK Exchange Filing), which is on the approved-source list as a primary exchange filing source, earning a Grade A rating. The dedup check confirms this is a new submission: neither the computed event_id (EVT-0c55880b61c5) nor the source URL appears in the ledger. The signal passes Gate 0 and moves forward to the remaining signal-gate modules (relevance check and materiality scoring).

## Routing

Routing: Proceed
Next module: signal-gate continues
