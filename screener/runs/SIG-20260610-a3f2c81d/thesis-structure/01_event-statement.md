# M0.1 Event Statement — SIG-20260610-a3f2c81d

> FIXTURE — hand-crafted golden example; not a live run output.

## 1. Event Statement (sterile)

> The Reserve Bank of India's Monetary Policy Committee lowered the policy repo rate by 50 basis points to 5.00% on 10 June 2026, in an off-cycle decision passed by a 5-1 vote. The committee recorded May headline CPI of 2.9% and kept the policy stance at neutral. The decision was published in an RBI press release the same morning.

- **sentence_count:** 3
- **character_count:** 332 (≥ 50)

## 2. Sources

| Role | Source | URL | Grade | Rationale |
|---|---|---|---|---|
| Primary | RBI press release | rbi.org.in (fixture) | A | Official policy-authority publication |
| Supporting | Reuters | reuters.com (fixture) | A | Primary newswire |

## 3. Causal-Language Gate

- **Phrases checked/repaired:** "surprise" (dropped — headline adjective); "citing" → "recorded"; checked for because / due to / driven by / leading to — none present.
- **causal_language_check:** PASS (locked true)

## 4. 60-Second Source Check

- **What was checked:** rate level, vote split, stance, CPI figure — against the RBI press release at 2026-06-10T05:20Z.
- **60_second_source_check:** PASS (locked true)

## 5. Verdict

Verdict: M0.1 complete
