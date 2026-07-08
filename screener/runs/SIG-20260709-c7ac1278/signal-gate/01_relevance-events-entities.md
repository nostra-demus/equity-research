# Relevance, Event Types & Entities — SIG-20260709-c7ac1278

## 1. What Happened (3 lines max)

Ascension Saint Thomas (a Tennessee subsidiary of the private nonprofit Ascension Health) agreed to acquire Williamson Health, an independent nonprofit hospital system in Franklin, Tennessee, for approximately $1 billion ($700 million purchase price plus ~$395 million in capital commitments over 10 years). The Williamson Health board voted unanimously on 2026-07-06 to accept the offer, beating competing bids from HCA Healthcare and Optum (UnitedHealth's health services arm). The deal requires approval from the Williamson County Board of Commissioners and federal/state regulators, with expected closing in 2027 or 2028.

## 2. Step 1 — Relevance

- **relevance_label:** material
- **relevance_confidence:** 0.92
- **Driving criterion:** Capital structure — the transaction transfers ownership and commits ~$1 billion in combined acquisition price and capital investment ($700M purchase price + $235M facility/EHR investment over 10 years + $140M strategic projects + $20M routine capex), representing a deal that restructures the capital position of both entities and signals active hospital-consolidation M&A in Tennessee at scale. [Healthcare Dive, 2026-07-08]

## 3. Step 2 — Event Types

| Event type | Tagged | Evidence (one line) |
|---|---|---|
| mna | ✓ | Ascension agrees to acquire Williamson Health for ~$1B ($700M purchase price + capital commitments), beating HCA Healthcare and Optum bids [Healthcare Dive, 2026-07-08] |

## 3b. Step 2b — Filing-Type Classification (deterministic)

Ran: `python3 scripts/screener_filing_classifier.py classify screener/runs/SIG-20260709-c7ac1278/intake.json`

| Field | Value |
|---|---|
| **filing_type** | material_exchange_filing |
| **override_hit** | true |
| **override_categories** | mna |
| **rationale** | Override keyword(s) mna matched — classified material_exchange_filing regardless of routine wrapper text. No ceiling applied. |

## 4. Step 3 — Entities & Linkage

| Field | Value |
|---|---|
| Primary issuer(s) | Ascension Health (via Ascension Saint Thomas); Williamson Health |
| Secondary issuer(s) | HCA Healthcare (public, NYSE: HCA) — losing bidder; UnitedHealth Group / Optum (public, NYSE: UNH) — losing bidder |
| Sector | Healthcare / Hospital Systems |
| Geography | United States — Tennessee (Franklin, TN; Ascension HQ: St. Louis, MO) |
| Commodity | None |
| **issuer_linkage** | primary_issuer |
| **issuer_public_status** | private_unlisted (both Ascension Health and Williamson Health are private nonprofits with no public equity; Ascension has publicly traded debt instruments but no listed equity) |

### 4a. Private/Unlisted Linkage (only if `issuer_public_status: private_unlisted`)

Real search conducted via WebSearch (query: "HCA Healthcare Williamson Health bid acquisition Tennessee 2026") and WebSearch (query: "Ascension Health publicly traded stock ticker nonprofit 2026").

| Field | Value |
|---|---|
| private_linkage_tags | competitor_informative_to_public_company |
| private_linkage_evidence | HCA Healthcare (NYSE: HCA) submitted a competing $700M bid for Williamson Health and lost to Ascension — the same purchase price, differentiated only by capital commitments ($210M from HCA vs $235M from Ascension) and tax obligations; this is directly informative to HCA's M&A appetite, pricing discipline, and Tennessee market strategy. Optum (subsidiary of UnitedHealth Group, NYSE: UNH) was the third finalist; being outbid reveals UNH/Optum's continued interest in owning hospital assets and their valuation ceiling for community systems. [Williamson Herald, 2026-07-06; NewsChannel5, 2026-07-08] |
| linked_public_companies | HCA Healthcare (NYSE: HCA); UnitedHealth Group (NYSE: UNH) |

## 5. Verdict

Verdict: material, 1 event type (mna), linkage primary_issuer, filing_type material_exchange_filing
