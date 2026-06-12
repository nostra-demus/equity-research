# Novelty & Context — SIG-20260610-a3f2c81d

> FIXTURE — hand-crafted golden example; not a live run output.

## 1. Step 4 — Ledger Retrieval

Window searched: 2026-06-07T05:30Z → 2026-06-10T05:30Z. Issuers searched: Reserve Bank of India.

| Prior signal_id | Date | Headline | Issuer overlap | Similarity band | Point estimate |
|---|---|---|---|---|---|
| Ledger empty / no matches — new_event path | | | | | 0.00 |

## 2. Step 5 — Fact Delta (vs best match: none)

No prior record — fact delta not applicable.

**fact_delta** = 0 × 0.15 + 0 + 0 = **0.00**

## 3. Step 6 — Confirmation Upgrade

- No prior record → **confirmation_upgrade:** false

## 4. Step 7 — Pairwise Classification

- Branch fired: "ELSE: new_event" (similarity < 0.78)
- **pair_label:** new_event

## 5. Step 8 — Novelty

**novelty** = base(new_event) 0.85 + 0.50 × 0.00 + 0 = **0.85**

## 6. Verdict

Verdict: new_event, novelty 0.85, fact_delta 0.00
