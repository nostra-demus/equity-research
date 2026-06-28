# Signal Intake & Gate 0 — SIG-20260628-af776402

## 1. Intake Record

| Field | Value |
|---|---|
| Signal ID | SIG-20260628-af776402 |
| Event ID (sha256-12) | EVT-a06dfba81a31 |
| Input nature | news_headline |
| Input datetime | 2026-06-28T12:36:49.365Z |
| Headline | Gold hotshot Forrestania buys Ramelius's Edna May for $300m |
| Source name (as given / canonical) | Australian Financial Review / Australian Financial Review |
| Source URL | https://www.afr.com/street-talk/gold-hotshot-forrestania-buys-ramelius-s-edna-may-for-300m-20260628-p60aq7?ref=rss&utm_medium=rss&utm_source=rss_feed |
| Requested by | nvaz51000@gmail.com |

## 2. Gate 0 — Approved-Source Check

- **On the approved list:** Yes — matched canonical name "Australian Financial Review" (explicit entry in `sources.signal_gate.allowed`)
- **Source grade:** A — the Australian Financial Review is a primary financial newspaper (not a secondary aggregator re-citing another outlet); it is listed directly on the approved list as a Grade A source
- **approved_source_check:** true

## 3. Dedup Pre-Check

- **event_id match in ledger:** No — EVT-a06dfba81a31 does not appear in screener/ledger/events.ndjson
- **URL match in ledger:** No — afr.com/street-talk/gold-hotshot-forrestania… does not appear in screener/ledger/events.ndjson

## 4. Gate Decision

The signal clears both gate tests. The source, Australian Financial Review, is explicitly on the approved list and qualifies as Grade A (a primary financial news outlet, not a re-aggregator). The computed event_id EVT-a06dfba81a31 has no match in the ledger, and the source URL also has no prior entry, so this is a fresh submission — not a resubmission of a seen article. The signal proceeds to the next signal-gate agent for relevance and materiality assessment.

## Routing

Routing: Proceed
Next module: signal-gate continues
