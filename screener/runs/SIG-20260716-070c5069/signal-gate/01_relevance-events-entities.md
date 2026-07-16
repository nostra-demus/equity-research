# Relevance, Event Types & Entities — SIG-20260716-070c5069

## 1. What Happened (3 lines max)

Dubai's total residential property sales value fell 16% year-on-year to AED 225.7 billion in the first half (Jan–Jun) of 2026, per real-estate consultancy Anarock, versus H1 2025 [Outlook Business, 2026-07-16]. Average price per square foot still rose to AED 1,900 from AED 1,800 a year earlier, though prices softened 4–7% between February and April 2026 [Outlook Business, 2026-07-16]. Anarock attributed the decline to regional geopolitical tension in early 2026 but its CEO called the effect "sentiment-driven, not structural" [Outlook Business, 2026-07-16].

## 2. Step 1 — Relevance

- **relevance_label:** relevant_non_material
- **relevance_confidence:** 0.60
- **Driving criterion:** Supply/demand dynamics — the article gives a quantified, checkable figure (aggregate Dubai residential sales value down 16% YoY to AED 225.7bn in H1 2026) [Outlook Business, 2026-07-16], which is the only strict-materiality criterion this event can touch. It stops short of `material` because (a) no single company or issuer is named as the subject — it is a market-wide aggregate, not a firm-specific fact, and (b) the article's own source, Anarock's CEO, frames the driver as "sentiment-driven, not structural" [Outlook Business, 2026-07-16] — i.e. not a durable shift in fundamentals, and average price per square foot actually rose year-on-year over the same period.

## 3. Step 2 — Event Types

| Event type | Tagged | Evidence (one line) |
|---|---|---|
| macro_sector | ✓ | Aggregate country/city-level real-estate demand statistic (Dubai residential sales value, 16% YoY decline) tied to a regional macro/geopolitical driver, not a single company's results [Outlook Business, 2026-07-16]. |

## 3b. Step 2b — Filing-Type Classification (deterministic)

Ran: `python3 scripts/screener_filing_classifier.py classify screener/runs/SIG-20260716-070c5069/intake.json`

| Field | Value |
|---|---|
| **filing_type** | unknown_filing |
| **override_hit** | false |
| **override_categories** | none |
| **rationale** | No routine pattern and no override keyword matched — abstaining to unknown_filing (no ceiling applied). |

## 4. Step 3 — Entities & Linkage

| Field | Value |
|---|---|
| Primary issuer(s) | None — no single company is the subject; the event is an aggregate market statistic for the Dubai residential real-estate sector as a whole. |
| Secondary issuer(s) | Anarock (real-estate consultancy) — cited as the data source and commentary provider, not itself a transacting party in the reported sales [Outlook Business, 2026-07-16]. |
| Sector | Real estate — residential property (Dubai) |
| Geography | Dubai, United Arab Emirates; regional framing references "West Asia" conflict |
| Commodity | None |
| **issuer_linkage** | macro_only |
| **issuer_public_status** | Not applicable — no single company primary issuer exists (macro/sector-wide statistic); see `issuer_linkage: macro_only`. |

### 4a. Private/Unlisted Linkage

Not applicable. This step is scoped to a private/unlisted **primary issuer**; here there is no company primary issuer at all — the event is an aggregate Dubai residential real-estate market statistic sourced from a consultancy (Anarock), not a transaction or disclosure by any single listed or unlisted company. No search for a public-company linkage was performed because the trigger condition (a private/unlisted primary issuer) does not exist in this signal.

## 5. Verdict

Verdict: relevant_non_material, 1 event type(s), linkage macro_only, filing_type unknown_filing
