# M0.1 Event Statement — SIG-20260613-4bbcdeae

## 1. Event Statement (sterile)

> On 2026-06-11, Bank of America analyst Vivek Arya issued a two-notch rating change on Intel Corporation — from underperform to buy — and raised the price target from $96 to $135. The note revised the server CPU total addressable market estimate from approximately $125B to more than $170B by 2030. Intel's Q1 2026 data-center and AI segment revenue was $5.1B, a 22% increase over the prior-year quarter. Intel shares closed approximately 6% higher on 2026-06-11.

- **sentence_count:** 4
- **character_count:** 485 (≥ 50)

## 2. Sources

| Role | Source | URL | Grade | Rationale |
|---|---|---|---|---|
| Primary | The Motley Fool (reporting on BofA analyst note by Vivek Arya, 2026-06-13) | https://www.fool.com/investing/2026/06/13/intel-just-got-a-rare-double-upgrade-from-bank-of/?source=iedfolrf0000001 | B | The Motley Fool is on the approved source list. It is a secondary outlet summarising a Grade-A primary (the BofA analyst note); grade B applies per Gate 0 rules. All headline facts — rating change, price target, TAM revision, Q1 revenue, and stock move — were retrieved and confirmed from this URL on 2026-06-14. |

## 3. Causal-Language Gate

- **Phrases checked/repaired:**
  - "increase" (in "22% increase over the prior-year quarter") — retained; describes a measured numerical change, not a causal relationship.
  - "higher" (in "shares closed approximately 6% higher") — retained; describes an observed price level, not a cause.
  - "revised" (in "note revised the server CPU … estimate") — retained; describes an action taken by the analyst, not a causal inference.
  - Checked and confirmed absent: "because", "due to", "driven by", "as a result", "leading to", "signals", "suggests", "implies", "panic", "crisis", "soaring", "plunging", "aggressively", "inevitably", and synonyms doing causal work.
- **causal_language_check:** PASS (locked true)

## 4. 60-Second Source Check

- **What was checked:** WebFetch of https://www.fool.com/investing/2026/06/13/intel-just-got-a-rare-double-upgrade-from-bank-of/?source=iedfolrf0000001 on 2026-06-14. Confirmed: (1) Bank of America analyst Vivek Arya issued the upgrade on 2026-06-11; (2) rating moved from underperform to buy; (3) price target raised from $96 to $135; (4) server CPU TAM revised from approximately $125B to more than $170B by 2030; (5) Intel Q1 2026 data-center and AI revenue of $5.1B, up 22% year-over-year; (6) shares up approximately 6% on the day. All six facts confirmed with literal matches in the article. Source (The Motley Fool) is on the SWARM.md approved list.
- **60_second_source_check:** PASS (locked true)

## 5. Verdict

Verdict: M0.1 complete
