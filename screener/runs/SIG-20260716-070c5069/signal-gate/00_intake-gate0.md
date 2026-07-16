# Signal Intake & Gate 0 — SIG-20260716-070c5069

## 1. Intake Record

| Field | Value |
|---|---|
| Signal ID | SIG-20260716-070c5069 |
| Event ID (sha256-12) | EVT-870c13fe70bd |
| Input nature | news_headline |
| Input datetime | 2026-07-16T05:28:48.141Z |
| Headline | Housing Sales in Dubai Declines 16 Pc in Jan-Jun to AED 226 Bn Amid West Asia Conflict |
| Source name (as given / canonical) | Outlook Business |
| Source URL | https://www.outlookbusiness.com/news/housing-sales-in-dubai-declines-16-pc-in-jan-jun-to-aed-226-bn-amid-west-asia-conflict |
| Requested by | ceekay@muns.io |

## 2. Gate 0 — Approved-Source Check

- **On the approved list:** Yes — matched canonical name "Outlook Business" (exact match, `sources.signal_gate.allowed` in `.claude/agents/screener/SWARM.md`).
- **Source grade:** B — Outlook Business is a secondary business-press outlet on the approved list; the underlying fact (Dubai housing sales data) traces to a regional property-market data/regulatory source (e.g. Dubai Land Department) it is reporting on, not itself the primary data originator.
- **approved_source_check:** true

## 3. Dedup Pre-Check

- Normalized string used for hashing: lowercased, whitespace-collapsed headline + "|" + source_url.
- Computed via `shasum -a 256`: full hash `870c13fe70bd75d3b22a91aac10cfe2dd46c9376b3b321eb4e415a2a3fae14c2` → `event_id = EVT-870c13fe70bd`.
- **event_id match in ledger:** No — grepped `screener/ledger/events.ndjson` (16 lines) for `870c13fe70bd`, no hit.
- **URL match in ledger:** No — grepped for `outlookbusiness.com/news/housing-sales-in-dubai`, no hit.

## 4. Gate Decision

The source, Outlook Business, is on the approved list, so Gate 0 passes with a Grade B source-quality read (secondary business press covering a regional housing-market statistic). The dedup pre-check found no matching event_id or URL in the ledger, so this is not a resubmission. The signal is new and clears the origin firewall; it proceeds to the rest of the Phase 0.1 gauntlet (relevance, event typing, similarity, materiality) in `signal-gate`.

## Routing

Routing: Proceed
Next module: signal-gate continues
