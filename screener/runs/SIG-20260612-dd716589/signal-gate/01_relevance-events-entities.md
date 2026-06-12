# Relevance, Event Types & Entities — SIG-20260612-dd716589

## 1. What Happened (3 lines max)

A major Gulf LNG producer has declared force majeure on cargo loadings scheduled for June and July 2026 following a compressor train failure at its facility. Force majeure legally excuses the producer from delivering contracted LNG volumes during the affected period. The specific producer, facility name, volume affected, and duration are not disclosed in the headline; the article body was not fetchable (Reuters.com blocked this environment).

## 2. Step 1 — Relevance

- **relevance_label:** material
- **relevance_confidence:** 0.88
- **Driving criterion:** Supply/demand dynamics — a force majeure on June–July cargo loadings directly removes contracted LNG supply from the market for at least two months; a compressor train failure at a major Gulf facility is an operational disruption with immediate impact on delivered volumes, spot pricing, and buyer procurement. [Reuters headline, 2026-06-12]

Note: confidence is capped at 0.88 (not 0.95+) because the article body was inaccessible; the producer identity, precise volume foregone, and duration remain unconfirmed beyond the headline. The materiality conclusion is robust to this gap — force majeure on June–July loadings from a "major" Gulf producer is by definition a supply shock.

## 3. Step 2 — Event Types

| Event type | Tagged | Evidence (one line) |
|---|---|---|
| operations | ✓ | Compressor train failure is a physical plant failure causing output curtailment [Reuters headline, 2026-06-12] |
| regulatory | ✓ | Force majeure is a legal/contractual declaration invoking a standard clause in LNG sale-and-purchase agreements; it alters the producer's legal obligations [Reuters headline, 2026-06-12] |
| macro_sector | ✓ | A major Gulf LNG producer removing June–July cargoes affects global LNG spot supply and regional pricing; not company-specific in impact [Reuters headline, 2026-06-12] |

## 4. Step 3 — Entities & Linkage

| Field | Value |
|---|---|
| Primary issuer(s) | Unnamed "major Gulf LNG producer" — identity not disclosed in headline; article body inaccessible. (Inference: candidate producers in the Gulf include Qatar Energy / QatarEnergy LNG, RasGas legacy facilities, and ADNOC's Das Island / Ruwais LNG; none confirmed from source.) |
| Secondary issuer(s) | None named in source |
| Sector | Energy — LNG production and export (GICS: Energy / Oil, Gas & Consumable Fuels) |
| Geography | Gulf region (Middle East); specific country not stated in headline |
| Commodity | LNG (liquefied natural gas) |
| **issuer_linkage** | sector_only |

Issuer linkage is `sector_only` because the primary issuer is unnamed in the source. No company or ticker can be identified from the headline alone, and the article body was not retrievable. Any entity attribution beyond "major Gulf LNG producer" would be inference, not from the source.

## 5. Verdict

Verdict: material, 3 event type(s), linkage sector_only
