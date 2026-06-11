# Relevance, Event Types & Entities — SIG-20260610-a3f2c81d

> FIXTURE — hand-crafted golden example; not a live run output.

## 1. What Happened (3 lines max)

The RBI's MPC lowered the policy repo rate by 50 bps to 5.00% on 10 June 2026, off-cycle, by a 5-1 vote. May headline CPI was recorded at 2.9%. The stance stays neutral.

## 2. Step 1 — Relevance

- **relevance_label:** material
- **relevance_confidence:** 0.96
- **Driving criterion:** changes funding costs (cash flow / margins) economy-wide — a 50 bps policy-rate move mechanically reprices repo-linked lending and market borrowing rates [Reuters, 2026-06-10]

## 3. Step 2 — Event Types

| Event type | Tagged | Evidence (one line) |
|---|---|---|
| macro_sector | ✓ | Policy-rate decision affecting all rate-sensitive sectors |
| regulatory | ✓ | Central-bank policy action (official authority) |

## 4. Step 3 — Entities & Linkage

| Field | Value |
|---|---|
| Primary issuer(s) | Reserve Bank of India (policy authority) |
| Secondary issuer(s) | — |
| Sector | Financials / rate-sensitive sectors |
| Geography | India |
| Commodity | — |
| **issuer_linkage** | macro_only |

## 5. Verdict

Verdict: material, 2 event types, linkage macro_only
