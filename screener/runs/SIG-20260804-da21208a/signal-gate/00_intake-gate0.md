# Signal Intake & Gate 0 — SIG-20260804-da21208a

## 1. Intake Record

| Field | Value |
|---|---|
| Signal ID | SIG-20260804-da21208a |
| Event ID (sha256-12) | EVT-ac896dbc3764 |
| Input nature | news_headline |
| Input datetime | 2026-08-04T08:52:40.974Z |
| Headline | Singapore's Grab lifts annual forecasts as AI, incentives drive growth |
| Source name (as given / canonical) | Reuters — Latest (news sitemap) / Reuters |
| Source URL | https://www.reuters.com/business/retail-consumer/singapores-grab-lifts-annual-revenue-forecast-2026-08-03/ |
| Requested by | ceekay@muns.io |

## 2. Gate 0 — Approved-Source Check

- **On the approved list:** Yes — matched canonical name "Reuters" (the raw `source_name` field carries the sitemap-feed label "Reuters — Latest (news sitemap)", a close variant of the on-list entry).
- **Source grade:** A — Reuters is a primary newswire named directly in `sources.signal_gate.allowed`, and it also sits in Source-quality Tier 1 (official company announcement / exchange filing / Reuters / Bloomberg / FT / WSJ / company IR / government agencies) per the module rules.
- **approved_source_check:** true

## 3. Dedup Pre-Check

- **event_id match in ledger:** No — grepped `screener/ledger/events.ndjson` (17 lines) for `EVT-ac896dbc3764`; no match.
- **URL match in ledger:** No — grepped the ledger for the exact URL path (`reuters.com/business/retail-consumer/singapores-grab-...`); no match. A separate grep for "grab" (case-insensitive) across the whole ledger also returned zero hits, so there is no near-neighbor Grab event on record either.

## 4. Gate Decision

This signal clears Gate 0 cleanly: the source is Reuters, a Grade-A primary newswire on the swarm's approved list, and the computed event_id (`EVT-ac896dbc3764`, from sha256 of the normalized headline + source URL) has no match anywhere in the 17-line events ledger, nor does the raw URL or any prior Grab-related event. This is a genuinely new signal to the pipeline. Not applicable to human_prompt handling — this is a news_headline intake with a verifiable URL, so no M0.1 on-list-source lookup is deferred.

## Routing

Routing: Proceed
Next module: signal-gate continues
