# Relevance, Event Types & Entities — SIG-20260804-da21208a

## 1. What Happened (3 lines max)

Grab Holdings raised its full-year 2026 guidance: revenue to $4.10–$4.15 billion (from $4.04–$4.10 billion) and adjusted EBITDA (earnings before interest, taxes, depreciation and amortization — a profit measure before financing and non-cash costs) to $720–$740 million (from $700–$720 million), both above prior market estimates [Reuters, 2026-08-03]. Second-quarter revenue rose 22% year-on-year to $997 million, beating the analyst estimate of $990.8 million, on 21% growth in gross merchandise value (GMV — the total value of rides and orders booked on the platform) to $6.5 billion [Reuters, 2026-08-03]. Grab also announced a new $750 million share buyback program; shares rose 4% in extended trading on the combined news [Reuters, 2026-08-03].

## 2. Step 1 — Relevance

- **relevance_label:** material
- **relevance_confidence:** 0.95
- **Driving criterion:** Shifts analyst expectations and alters capital structure — Q2 revenue of $997 million beat the analyst estimate of $990.8 million, and full-year 2026 revenue guidance was raised to $4.10–$4.15 billion (from $4.04–$4.10 billion) and adjusted EBITDA guidance to $720–$740 million (from $700–$720 million), both above prior market estimates [Reuters, 2026-08-03]; the company separately committed capital via a new $750 million buyback program [Reuters, 2026-08-03].

## 3. Step 2 — Event Types

| Event type | Tagged | Evidence (one line) |
|---|---|---|
| earnings_revenue_margin | ✓ | Q2 2026 revenue rose 22% YoY to $997 million, beating the $990.8 million analyst estimate; GMV rose 21% to $6.5 billion [Reuters, 2026-08-03]. |
| guidance_change | ✓ | Full-year 2026 revenue guidance raised to $4.10–$4.15 billion from $4.04–$4.10 billion, and adjusted EBITDA guidance raised to $720–$740 million from $700–$720 million [Reuters, 2026-08-03]. |
| capital_actions | ✓ | New $750 million share buyback program announced alongside the results [Reuters, 2026-08-03]. |

## 3b. Step 2b — Filing-Type Classification (deterministic)

Ran: `python3 scripts/screener_filing_classifier.py classify screener/runs/SIG-20260804-da21208a/intake.json`

| Field | Value |
|---|---|
| **filing_type** | unknown_filing |
| **override_hit** | false |
| **override_categories** | none |
| **rationale** | No routine pattern and no override keyword matched — abstaining to unknown_filing (no ceiling applied). |

## 4. Step 3 — Entities & Linkage

| Field | Value |
|---|---|
| Primary issuer(s) | Grab Holdings Limited — Southeast Asia's largest ride-hailing and delivery platform, Nasdaq-listed [Reuters, 2026-08-03]. |
| Secondary issuer(s) | None named — no counterparty, acquirer, or partner company is identified in the source text. |
| Sector | Ride-hailing and food/parcel delivery ("super-app" consumer internet platform), Southeast Asia |
| Geography | Singapore (headquarters); Southeast Asia (operating footprint) |
| Commodity | None directly — fuel prices are cited as a cost/demand backdrop ("higher fuel prices following the Iran war" affecting drivers and customers) but are not themselves the subject of the event [Reuters, 2026-08-03]. |
| **issuer_linkage** | primary_issuer |
| **issuer_public_status** | public |

### 4a. Private/Unlisted Linkage (only if `issuer_public_status: private_unlisted`)

Not applicable — the primary issuer, Grab Holdings Limited, is publicly listed (Nasdaq: confirmed by the source text describing it as "the Nasdaq-listed company") [Reuters, 2026-08-03]. No private/unlisted-linkage search was required or performed.

## 5. Verdict

Verdict: material, 3 event type(s), linkage primary_issuer, filing_type unknown_filing
