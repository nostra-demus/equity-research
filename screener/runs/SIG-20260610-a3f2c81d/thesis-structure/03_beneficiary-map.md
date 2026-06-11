# M0.3 Beneficiary Map — SIG-20260610-a3f2c81d

> FIXTURE — hand-crafted golden example; not a live run output.

## 1. Impact Matrix

| ID | Industry (GICS) | Side | Mechanism (cites WC-IDs) | Directness /25 | Magnitude /25 | Speed /25 | Reversibility /25 | Composite | Tier |
|---|---|---|---|---:|---:|---:|---:|---:|---|
| DIR-001 | Housing finance companies (Consumer Finance, 40202010) | direct | Repo-linked market borrowings reprice down (WC-001, WC-003); mortgage yields lag → spread expands | 25 | 15 | 15 | 25 | 80 | primary |
| DIR-002 | Vehicle financiers / NBFC consumer lenders (40202010) | direct | Same funding-cost decline on shorter books (WC-001, WC-003) | 25 | 15 | 15 | 15 | 70 | secondary |
| IND-001 | Residential real-estate developers (60201030) | indirect | Cheaper mortgages → housing demand → presales (2-step from WC-001) | 15 | 5 | 5 | 15 | 40 | parked |
| HARM-001 | Banks with high EBLR floating retail books (40101010) | harmed | EBLR assets reprice within a quarter (WC-001); deposits lag → NIM compresses | 25 | 15 | 25 | 15 | 80 | primary |

Scoring notes: DIR-001 1-step funding link (25), magnitude estimated from 50 bps × borrowing mix (15), benefit over 1–2 quarters (15), unlikely policy reversal in horizon (25). HARM-001 mechanical EBLR repricing (25), hits next reporting quarter (25), reverses as deposits reprice (15).

## 2. Population Gate

- direct populated: Y · indirect populated: Y · harmed populated: Y
- **primary_count:** 2 · **secondary_count:** 1 · **parked_count:** 1 · **carry_forward_count:** 3
- **zero_carry_forward_action:** proceed

## 3. Pair-Trade Notes

Long housing finance (DIR-001) vs short high-EBLR banking (HARM-001) — isolates rate-transmission asymmetry from market beta.

## 4. Ticker Check

- **performed:** true · **violations:** none · **repair_action:** none

## 5. Verdict

Verdict: 3 carried forward (2 primary, 1 secondary) — proceed
