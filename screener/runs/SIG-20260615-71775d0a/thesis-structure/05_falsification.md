# M0.5 Primary Falsification — SIG-20260615-71775d0a

## 1. The Kill Switch

- **falsification_sentence:** If the combined market cap of HONA and HON (post-split shares × their prices) falls and stays more than 10% below the pre-spin HON combined market cap of ~$138.85B for two consecutive weeks after regular-way trading begins on June 29, 2026, the spin-off has destroyed rather than unlocked value and the thesis is dead.
- **falsification_condition_type:** mechanism_reversal

## 2. Monitoring Specification

| Field | Value |
|---|---|
| monitorable_metric_1 | HONA daily closing price on Nasdaq (nasdaq.com/market-activity/stocks/hona or Bloomberg/IBKR quote — labelled indicative) × ~317M shares outstanding post-distribution |
| monitorable_metric_2 | HON daily closing price on Nasdaq (post-reverse-split, ticker HON) × ~317M shares outstanding post-split |
| monitorable_threshold_rate | 124,965 (i.e., ~$138.85B × 0.90 = ~$124.965B combined market cap floor; breach = HONA market cap + HON market cap < $124.965B) |
| monitorable_threshold_rate_unit | USD millions (combined HONA + HON market cap) |
| monitorable_threshold_date | 2026-09-07 (10 weeks from the June 29, 2026 distribution date — inside the medium_weeks_3months horizon set by M0.4) |

## 3. Uncomfortable Check

- **uncomfortable_check:** PASS (locked true)
- **uncomfortable_check_rationale:** The thesis rests on one claim: that separating Honeywell Aerospace from the parent makes the two pieces together worth more than the combined company was. The load-bearing assumption is that the market was applying a "conglomerate discount" to the aerospace business inside HON, and that a stand-alone listing removes that discount and raises total value. If the combined market cap instead drops more than 10% below the pre-spin baseline and stays there for two weeks, that discount has not closed — it has widened, or the separation itself has destroyed value (through stranded costs, loss of cross-segment revenue, or the market deciding the parent without aerospace is worth less than expected). Every beneficiary party in M0.3 that depends on a positive spin-off outcome — the pure-play aerospace re-rating (DIR-002), the index rebalancing buy (IND-001), the prime brokerage volume thesis (IND-002) — collapses if the combined value goes the other way. The investment banking fees (DIR-001) are the only piece that does not reverse, but those fees are already earned and not investable. This falsifier is not a peripheral risk: it attacks the mechanism the entire thesis is built on. If it fires, there is no version of the thesis left to hold.

## 4. Secondary Falsifiers

| ID | Description | Metric | P(fires in horizon) |
|---|---|---|---:|
| SF-001 | The June 29 distribution is delayed or cancelled — for example, a regulator blocks the separation, a material adverse change clause is triggered, or Honeywell's board reverses the decision — meaning HONA never begins regular-way trading and the entire spin-off timeline collapses | SEC EDGAR or Honeywell IR: absence of an 8-K confirming distribution completion by market open June 30, 2026; or a filing announcing postponement or withdrawal | 0.04 |
| SF-002 | HONA's first regular-way price implies a stand-alone enterprise value materially below the $17.4B net sales / $4.3B pro forma adjusted EBIT base, meaning investors are discounting the aerospace business more heavily as a stand-alone entity than it was priced inside the conglomerate — the opposite of the re-rating thesis | HONA EV/EBIT multiple on day one of regular-way trading (price × shares ÷ implied EV); falsified if the implied EBIT multiple is below 8× (roughly a 40% discount to the 13–15× range typical for pure-play aerospace peers) | 0.20 |
| SF-003 | A large forced-seller overhang persists beyond 8 weeks — index funds, HON dividend-yield investors, and generalist holders who do not want an aerospace-only stock dump HONA shares steadily, preventing the price-discovery window from clearing — meaning the thesis has not resolved and both stocks remain directionally weak with no stabilisation signal | HONA average daily volume (via Nasdaq or Bloomberg) staying above 3× its expected steady-state volume (estimated from comparable spin-off distribution events) for more than 8 consecutive weeks from June 29 | 0.25 |

## 5. Lock State

- **locked_after_m0_complete:** pending (edge-definition sets the lock; after that these criteria cannot be moved)

## 6. Verdict

Verdict: kill switch set — HONA + HON combined market cap crossing below $124,965M (90% of pre-spin ~$138.85B) for two consecutive weeks by 2026-09-07
