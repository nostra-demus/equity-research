# Relevance, Event Types & Entities — SIG-20260716-1f0ddd45

## 1. What Happened (3 lines max)

Iran's Islamic Revolutionary Guard Corps (IRGC) threatened to close additional export corridors — naming the Strait of Hormuz and Bab el-Mandeb — after the US reimposed a naval blockade of Iranian ports and resumed strikes. The IRGC said it had already struck US military sites in Bahrain, Kuwait, and Jordan, and accused the US of sending "naval pirates" to control the Strait of Hormuz. The article states the conflict "has severely disrupted global energy supplies and raised inflation concerns" [South China Morning Post, 2026-07-16].

## 2. Step 1 — Relevance

- **relevance_label:** material
- **relevance_confidence:** 0.85
- **Driving criterion:** Impact on supply/demand dynamics — a threat to close the Strait of Hormuz and Bab el-Mandeb, the two named chokepoints for regional energy exports, is a direct threat to global oil and gas supply, and the source itself states the conflict has "severely disrupted global energy supplies and raised inflation concerns" [South China Morning Post, 2026-07-16]. This is a live escalation (fresh naval blockade, fresh strikes on Bahrain/Kuwait/Jordan sites), not a repeated warning with no new facts.

## 3. Step 2 — Event Types

| Event type | Tagged | Evidence (one line) |
|---|---|---|
| macro_sector | ✓ | A geopolitical/military escalation (US naval blockade of Iran, IRGC strikes on Bahrain/Kuwait/Jordan, threat to close the Strait of Hormuz and Bab el-Mandeb) that reads as a country/region-level energy-supply event, not a single-company event [South China Morning Post, 2026-07-16]. |

No other listed event type applies: there is no named company, earnings figure, deal, filing, litigation, rating action, or management change in the text — this is a state-actor conflict story, not a corporate event.

## 3b. Step 2b — Filing-Type Classification (deterministic)

Ran: `python3 scripts/screener_filing_classifier.py classify screener/runs/SIG-20260716-1f0ddd45/intake.json`

| Field | Value |
|---|---|
| **filing_type** | unknown_filing |
| **override_hit** | false |
| **override_categories** | none |
| **rationale** | No routine pattern and no override keyword matched — abstaining to unknown_filing (no ceiling applied). |

Note: this is expected and correct — the classifier is built for listed-company exchange filings, and this signal is a geopolitical news story with no corporate filing at all. `unknown_filing` applies zero derate, per MODULE_RULES ("a filing type the classifier does not recognize must never be silently suppressed").

Body-fetch note: `intake.json`'s `body_text` originally held only the repeated headline. The source URL was fetched with WebFetch and the extracted article facts (IRGC quote, named chokepoints, blockade/strike details, dates) were written back into `intake.json`'s `body_text` field before running the classifier above, so Step 2b classified the same full text assessed in Steps 1–3.

## 4. Step 3 — Entities & Linkage

| Field | Value |
|---|---|
| Primary issuer(s) | Iran / Islamic Revolutionary Guard Corps (IRGC) — a state/military actor, not a company |
| Secondary issuer(s) | United States (military/government); Bahrain, Kuwait, Jordan (named as sites of US military installations struck by the IRGC) |
| Sector | Energy / oil & gas shipping and maritime transport (chokepoint risk) |
| Geography | Middle East — Strait of Hormuz (Persian Gulf), Bab el-Mandeb (Red Sea gateway), Bahrain, Kuwait, Jordan |
| Commodity | Crude oil / regional energy exports (the article does not name a specific grade, volume, or LNG distinct from "energy exports") |
| **issuer_linkage** | macro_only |
| **issuer_public_status** | not_applicable — the primary issuer is a sovereign/military actor (Iran/IRGC), not a company; no corporate primary issuer exists to classify as public or private_unlisted |

### 4a. Private/Unlisted Linkage — not applicable

This step is scoped to a **private/unlisted company** primary issuer (Step 3a: "Record `issuer_public_status` for the primary issuer: `public` or `private_unlisted`"). Here the primary issuer is a state/military actor with no corporate identity, and `issuer_linkage` is already `macro_only` — there is no company-linkage search to run at this step. (Any company-specific beneficiary/exposure mapping to public shipping, energy, or insurance names is Phase 1 / candidate-surfacing work, out of scope for this agent.)

## 5. Verdict

Verdict: material, 1 event type(s), linkage macro_only, filing_type unknown_filing
