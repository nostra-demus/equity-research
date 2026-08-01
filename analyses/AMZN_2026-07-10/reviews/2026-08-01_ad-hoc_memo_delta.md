# AMZN Memo Delta — 2026-08-01 (ad-hoc review)

*Filed ad-hoc, not on the 30d schedule (which falls due 2026-08-09). The trigger is an event: the memo's own named decisive test ran on 30 July and resolved against the thesis.*

## 1. One-line verdict

Thesis status: **broken** · Delta: **broken** · Amazon reported Q2 2026 a day before the memo's own decisive test date and every number ran against the central idea; the shares closed above the memo's own bull case.

## 2. What changed since the original memo

Amazon reported Q2 2026 on **30 July 2026** [Amazon Q2 2026 results, IR release, 2026-07-30]:

| Line | Reported | What the memo said |
|---|---|---|
| Net sales | $200.6B, +20% | — |
| Operating income | **$27.5B, +43%** | "$23–25B, above the $23.4B consensus mid-point" |
| AWS revenue | **$42.2B, +37%** — fastest in 18 quarters | assumed ~28% holding |
| **AWS operating margin** | **39.4%** ($16.6B) | **would compress 100–300bp from 35.4%** |
| Capex guidance | raised to **~$220B** | ~$200B modelled |

The shares closed **$270.87** on 31 July, from $235.50 on 30 July [stockanalysis.com AMZN price history, accessed 2026-08-01, indicative]. That is above the memo's bull case of **$247**.

Three post-decision items also sit in the pool, all carrying the same framing — that the spend is a response to demand, not a drag: *"Andy Jassy said Amazon will spend $220 billion this year — and still won't have enough capacity to meet demand"* [engine-routed wire event, `data/AMZN/screener_event_EVT-dcc5aa8f071a.md`, tier-10 web source, dated].

## 3. Did the original thesis play out?

**No — and the memo said in advance exactly what would prove it wrong.**

> *"if AWS margin holds or expands, the hypothesis is wrong and the bull case at $247+ is live"* — decision_record.json `edge_proof`, 2026-07-10

AWS margin expanded, from a 35.4% base to **39.4%**. On the memo's own stated terms the idea is refuted, so this is recorded **broken**, not merely at risk.

**Did the stock move for our reason or another reason?** (§10 luck vs skill.) Neither — it moved for the reason we argued *against*. We said more capex meant a coming margin squeeze; the quarter showed more capex alongside accelerating revenue and expanding margin, and the market re-rated the shares on that. This is a **genuine miss**: price wrong and thesis wrong.

We held no position — the call was Watchlist — so this is **opportunity cost, not loss**: **+13.65%** from the $238.34 reference price, against an S&P 500 move of about **−0.22%**, i.e. **+13.87pp** benchmark-relative.

*The Nasdaq 100 sector comparison is not recorded. Only Nasdaq Composite levels could be sourced, and putting a Composite number under the name "Nasdaq 100" would attach a figure to a source it did not come from (§5). The call is benchmark-scoreable, not yet sector-scoreable.*

## 4. Forecasts, catalysts, risks

**Forecasts** — 1 falsified, 4 still open:

- **Falsified:** Q2 EBIT "$23–25B". Actual $27.5B. Its *direction* (above consensus) was right; only the magnitude was too low.
- **Still open, running against:** FY2026 AWS margin compression (settles Feb 2027 — but both reported quarters are above the base, so H2 would need to average ~30% to land it); the $190–210 re-rating (price is 29% above the top of that range).
- **Still open, no evidence either way:** the Anthropic mark-down, the Globalstar acquisition.

**Catalysts:** the 31 July print **materialized** (a day early) and was decisive. Q3 guidance pending.

**Risks:** the killer risk (AWS margin below 30%) **did not materialize** — the opposite happened. The formal kill criterion did not trigger. Capex escalation beyond the modelled ~$200B **did** materialize, at ~$220B — but the market read it as demand, not cost.

Worth recording: the kill criterion and the falsification condition were **not symmetric**, and only the softer one was written into `kill_criteria`. The condition that actually fired lived in `edge_proof`, where nothing was watching it.

## 5. Section impact map

| Original section | Changed? | Materiality /100 | Why | Impacted module(s) | Re-run? |
|---|---|---:|---|---|---|
| The Actual Variant Perception (D&A compresses AWS margins) | Yes | 95 | The variable the thesis turned on moved the opposite way, twice | earnings, valuation | `/research:earnings AMZN` |
| Valuation and Peer Mispricing (base FV $210) | Yes | 90 | Base rests on an EBIT anchor now two quarters stale, against a $270.87 price | valuation | `/research:valuation AMZN` |
| Catalyst Calendar / Kill Criteria | Yes | 70 | The decisive test ran and resolved; kill criterion and falsification condition were asymmetric | catalyst | no |
| Capital spend read (capex as future D&A) | Yes | 75 | Scored on one side only; the demand reading is the one the numbers support | earnings, business-model | `/research:rerun earnings margin-drivers AMZN` |

## 6. Stage-One sheet comment

Amazon reported Q2 2026 on 30 July and it went against our call in every line that mattered. We argued that depreciation from the AI capex wave would squeeze AWS margins; instead AWS revenue grew 37 percent, its fastest in eighteen quarters, and the AWS operating margin expanded to 39.4 percent against the 35.4 percent base we said would compress. Group operating income was 27.5 billion dollars, above the 23 to 25 billion we forecast, and capex guidance was raised to about 220 billion with management saying capacity still cannot meet demand. The shares closed 31 July at 270.87 dollars, above even our bull case of 247. We wrote our own falsification test into the note - if the AWS margin holds or expands, the idea is wrong - and that test has fired. The thesis is recorded broken. We took no position, so this is opportunity cost rather than loss: plus 13.7 percent against the S and P 500 since our 238.34 dollar reference price. We are not re-rating the stock on this note. The valuation and earnings work needs redoing on the new numbers before we hold any view at all.

## 7. Questions for management / analysts

1. AWS operating margin has risen for two consecutive quarters while capex accelerated. How much is Trainium mix and how much is capacity utilisation — and which is repeatable?
2. What is the current weighted-average lag between capex spend and first billing, and how has it moved since the 6–24 month range given on the Q1 2026 call?
3. At a ~$220B annual capex run rate, at what point does depreciation growth exceed AWS revenue growth on your own plan?
4. How much of the $364B backlog is contracted at fixed price versus consumption-based, and what portion bills within twelve months?
5. What would have to be true for AWS operating margin to fall back below 35%?
6. How is the $60.6B Anthropic Level 3 position being re-measured, and what observable inputs would move it?

## 8. Watch before the next checkpoint

- **Q3 2026 results** — whether the AWS margin holds near 39% or the depreciation drag appears with a longer lag. The original kill criterion (Q3 EBIT guide below $22B) is still live and unresolved.
- **FY2026 full-year AWS margin vs the 35.4% base** — the open forecast settles here in **Feb 2027**, currently running the opposite way.
- **Any Anthropic mark-down above $15B** — would resolve that forecast and reopen the GAAP earnings-quality question.
- **Whether the raised ~$220B capex converts to billings on schedule**, or begins to outrun revenue as the original thesis argued.
- **Globalstar** — completion or termination inside the 12-month window.

---

*This review does not re-value the company and does not change the original memo, thesis, or decision record. It records what happened and what it costs the thesis. A fresh view requires re-running valuation and earnings on the Q2 numbers.*
