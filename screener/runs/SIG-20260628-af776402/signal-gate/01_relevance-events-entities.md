# Relevance, Event Types & Entities — SIG-20260628-af776402

## 1. What Happened (3 lines max)

Forrestania, a gold mining company, has agreed to acquire the Edna May gold mine from Ramelius Resources for A$300 million. The deal is a direct asset sale — Ramelius is divesting a named operating asset. The source is the Australian Financial Review, 2026-06-28.

## 2. Step 1 — Relevance

- **relevance_label:** material
- **relevance_confidence:** 0.90
- **Driving criterion:** Capital structure and revenue impact — the A$300 million asset sale directly changes Ramelius Resources' capital structure (cash inflow of $300m, removal of the Edna May asset from the balance sheet) and alters its revenue base (loss of Edna May's gold production). A $300m transaction is large relative to any mid-cap Australian gold miner's market capitalisation and asset base, satisfying the capital structure and supply/demand criteria. [Australian Financial Review, 2026-06-28]

## 3. Step 2 — Event Types

| Event type | Tagged | Evidence (one line) |
|---|---|---|
| mna | ✓ | Forrestania acquires Edna May gold mine from Ramelius Resources for A$300 million [AFR, 2026-06-28] |
| capital_actions | ✓ | The $300m proceeds represent a major capital event for Ramelius — asset disposal generating significant cash [AFR, 2026-06-28] |
| operations | ✓ | Edna May is an operating gold mine; its transfer changes the production profile and asset base of both buyer and seller [AFR, 2026-06-28] |

## 4. Step 3 — Entities & Linkage

| Field | Value |
|---|---|
| Primary issuer(s) | Ramelius Resources (seller of Edna May; the event directly changes its asset base, revenue, and capital structure) |
| Secondary issuer(s) | Forrestania (buyer; described as "gold hotshot" — inference: private or unlisted entity, not from source text explicitly) |
| Sector | Materials — Gold Mining (GICS: 15104010) |
| Geography | Australia (Western Australia — Edna May mine is located in WA; Ramelius Resources is an ASX-listed Australian gold miner) |
| Commodity | Gold |
| **issuer_linkage** | primary_issuer |

## 5. Verdict

Verdict: material, 3 event type(s), linkage primary_issuer
