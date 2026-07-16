# Signal Intake & Gate 0 — SIG-20260716-1f0ddd45

## 1. Intake Record

| Field | Value |
|---|---|
| Signal ID | SIG-20260716-1f0ddd45 |
| Event ID (sha256-12) | EVT-886ee1f12f0a |
| Input nature | news_headline |
| Input datetime | 2026-07-16T05:17:26.782Z |
| Headline | Iran threatens to close more vital seaways as US renews blockade |
| Source name (as given / canonical) | South China Morning Post / South China Morning Post |
| Source URL | https://www.scmp.com/news/world/middle-east/article/3360625/iran-threatens-block-more-vital-seaways-us-renews-blockade?utm_source=rss_feed |
| Requested by | ceekay@muns.io |

## 2. Gate 0 — Approved-Source Check

- **On the approved list:** Yes — matched "South China Morning Post" verbatim in `sources.signal_gate.allowed` (SWARM.md frontmatter, "Expanded coverage" block).
- **Source grade:** A — SCMP is the byline outlet reporting its own story (own dateline/reporting), not a secondary aggregator citing another Grade-A wire; treated as a primary on-list newswire under Gate 0's A/B rule.
- **approved_source_check:** true

## 3. Dedup Pre-Check

- **event_id match in ledger:** No — grepped all 15 lines of `screener/ledger/events.ndjson` for `EVT-886ee1f12f0a`; no hit. No prior "Iran"-headlined or seaway/blockade event on file either.
- **URL match in ledger:** No — grepped for the article ID `3360625`; no hit.

## 4. Gate Decision

The source is on the approved list at Grade A, and the event_id/URL dedup check found no prior ledger entry for this article or story — this is a new signal, not a resubmission. The gate passes and the signal proceeds to the rest of the Phase 0.1 gauntlet (relevance, event typing, similarity/novelty, materiality). Not applicable: this is a `news_headline` input with a source URL, so no human_prompt on-list-source check is required at M0.1.

## Routing

Routing: Proceed
Next module: signal-gate continues
