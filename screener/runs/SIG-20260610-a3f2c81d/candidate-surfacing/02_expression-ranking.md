# Expression Ranking — SIG-20260610-a3f2c81d

> FIXTURE — hand-crafted golden example; not a live run output.

## 1. Ranked Shortlist

| Rank | CND | Ticker | Company | Side | Exposure /100 (driver) | Liquidity | Prior coverage (decision · date · pool?) | Caveats |
|---:|---|---|---|---|---|---|---|---|
| 1 | CND-001 | CANFINHOME | Can Fin Homes | long | 86 (purest funding-mix capture) | mid-cap ok | never run · no pool | pass-through competition (SF-002) |
| 2 | CND-002 | LICHSGFIN | LIC Housing Finance | long | 80 (pure-play, scale dampens) | very liquid | never run · no pool | governance → research swarm |
| 3 | CND-003 | CHOLAFIN | Cholamandalam | long | 64 (secondary tier, faster pass-through) | very liquid | never run · no pool | diluted expression |
| 4 | CND-004 | FEDERALBNK | Federal Bank | pair_short_leg | 58 (HARM-001 expression) | futures available | never run · no pool | deposit franchise can mute |

## 2. Pair Expressions

| Pair | Long leg | Short leg | What the pair isolates |
|---|---|---|---|
| P1 | CND-001 CANFINHOME | CND-004 FEDERALBNK | Rate-transmission asymmetry minus market/sector beta |

## 3. Ranking Rationale

Exposure purity ranks CANFINHOME first: nearly the whole P&L is the thesis mechanism. LICHSGFIN matches purity at greater scale (slower per-unit effect). CHOLAFIN is a diluted secondary expression; FEDERALBNK exists for the pair.

## 4. Verdict

Verdict: 4 ranked, top = CANFINHOME (86/100)
