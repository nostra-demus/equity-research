# Novelty & Context — SIG-20260716-070c5069

## 1. Step 4 — Ledger Retrieval

Window searched: last 72 hours widened to 7 days (2026-07-09 through 2026-07-16, the full span the ledger holds back to its oldest entry) — widened because the upstream entities table (`01_relevance-events-entities.md`) tags this signal `issuer_linkage: macro_only` with no primary issuer and only a secondary issuer (Anarock, a data/commentary provider, not a transacting party), so a narrow 48–72h window risks missing a slow-moving regional real-estate storyline. Issuers/terms searched: `dubai`, `anarock`, `uae`, `real.estate`/`residential`/`property`, `west asia`.

Command run: `grep -in "dubai" screener/ledger/events.ndjson` (0 matches), `grep -in "anarock" screener/ledger/events.ndjson` (0 matches), `grep -in "uae\|real.estate\|residential\|west asia\|property" screener/ledger/events.ndjson` (0 matches), against a ledger of 16 total lines (`wc -l screener/ledger/events.ndjson`).

| Prior signal_id | Date | Headline | Issuer overlap | Similarity band | Point estimate |
|---|---|---|---|---|---|
| Ledger empty of any match — new_event path | — | — | — | — | — |

One tangential hit exists on close inspection: `SIG-20260716-1f0ddd45` ("Iran threatens to close more vital seaways as US renews blockade", 2026-07-16T05:17:26Z) shares the same regional "West Asia conflict" macro backdrop, but it concerns shipping-lane / seaway blockade risk, not Dubai residential property sales, and carries no issuer overlap (no shared primary or secondary issuer — Anarock is not named in that record). Per the rubric, "without issuer overlap require ≥0.985-equivalent (verbatim) plus identical headline" — this pair fails that bar by a wide margin, so it is excluded from the match table above and does not change the new_event verdict.

## 2. Step 5 — Fact Delta (vs best match: none)

| Field | Prior value | Current value | Changed? |
|---|---|---|---|
| guidance | n/a — no prior record | n/a | No prior to compare |
| deal_value | n/a | n/a | No prior to compare |
| fine_amount | n/a | n/a | No prior to compare |
| eps | n/a | n/a | No prior to compare |
| revenue | n/a | AED 225.7bn H1 2026 residential sales value (−16% YoY) [Outlook Business, 2026-07-16] | No prior to compare |
| counterparty | n/a | n/a | No prior to compare |
| court | n/a | n/a | No prior to compare |
| regulator | n/a | n/a | No prior to compare |

**fact_delta** = (0 changed_fields × 0.15) + (0 confirmation × 0.35) + (0 better source × 0.10) = **0.00** (capped at 1.0). No prior event exists to diff against, so every field row is "no prior to compare" by construction, not a scored non-change.

## 3. Step 6 — Confirmation Upgrade

- Prior official? Not applicable — no prior ledger record exists for this issuer/topic.
- Current official? No — Outlook Business, Grade B secondary business press, is not itself the primary data originator (per `00_intake-gate0.md`, the underlying Dubai housing data traces to a Dubai Land Department-type source it is reporting on).
- Issuer overlap? No — no prior record found.
- Event-or-similarity condition? Not met — similarity is 0.00 (no match).
- **confirmation_upgrade:** false

## 4. Step 7 — Pairwise Classification

- Branch fired (walked top-down, all prior conditions false until the final else): `ELSE IF similarity >= 0.78: related_topic` — false (similarity is 0.00, not ≥0.78) → falls through to `ELSE: new_event`.
- **pair_label:** new_event

## 5. Step 8 — Novelty

**novelty** = base(new_event) 0.85 + 0.50 × 0.00 (fact_delta) + 0.00 (no confirmation upgrade) = **0.85**

## 6. Verdict

Verdict: new_event, novelty 0.85, fact_delta 0.00
