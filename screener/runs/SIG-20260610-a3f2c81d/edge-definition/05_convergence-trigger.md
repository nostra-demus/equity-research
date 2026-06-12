# M0.6.5 Convergence Trigger — SIG-20260610-a3f2c81d

> FIXTURE — hand-crafted golden example; not a live run output.

## 1. Primary Trigger

| Field | Value |
|---|---|
| trigger_name | Q2 FY27 results season for listed HFCs (first full quarter at lower funding costs) |
| trigger_date_range | 2026-10-15 → 2026-11-15 (exchange results calendar) |
| trigger_type | scheduled |
| probability_if_unscheduled | null |
| probability_note | Mandatory publication (SEBI LODR Reg 33) — probability not applicable |
| Inside M0.4 horizon? | Yes |

## 2. Causal Mechanism (four steps)

1. Sep-quarter HFC results print spreads/NIM up 10–20 bps as CP/NCD rolls captured the June cut.
2. Sell-side financials teams update funding-cost assumptions and differentiate funding-mix winners.
3. Funds rotate within financials from uniform sector exposure toward borrowing-funded spread expanders.
4. Pure-play HFC prices converge toward the variant NIM path (re-rating + EPS upgrades).

## 3. Secondary Triggers

| ID | Trigger | Date | Type | P | Mechanism (one line) |
|---|---|---|---|---:|---|
| ST-001 | RBI monthly WALR/funding-cost data | monthly from ~2026-07-31 | scheduled | — | Macro desks flag transmission speed before results |

## 4. Verdict

Verdict: trigger scheduled 2026-10-15→11-15 — proven timing
