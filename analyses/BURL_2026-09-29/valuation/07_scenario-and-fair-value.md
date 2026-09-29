# Scenario & Fair Value — BURL

All values are for Burlington Stores, Inc. common stock (`BURL`, NYSE, USD). The pool-verified close is **$254.69 on 2026-09-28** and per-share values use the 63.896m diluted weighted-average-share proxy. [Capital IQ Comps → Financial Data, subject row, 2026-09-28; Q2 FY2026 Form 10-Q, p.6; `ciq_facts.json`, `current_price` and `shares_outstanding_m`]

## 1. Method Summary

| Method | Fair / Implied Value (per share) | Confidence | Weight | Why This Weight |
|---|---:|---|---:|---|
| Own-history multiples (02) | $317.03–$438.53 mechanical sensitivity | Low | 0% | `02` explicitly marks its reversion values illustrative rather than admissible: the historical P/E series is basic-share based, and its EV-based series has an unresolved Capital IQ EV-definition conflict. It remains visible but is not a fair-value input. |
| Relative / peers (03) | **$281.39** base; $302.88 EV/EBITDA check | Medium | **70%** | The matched NTM P/E is a direct equity valuation against the two closest public off-price peers and needs no lease-heavy EV bridge. Its 10% discount already reflects durability and capital-structure uncertainty. |
| Intrinsic DCF (04) | **$133.46** | Low–medium | **30%** | It uses filing-based strict net debt and normalizes the tariff refund, but 74.35% of EV is terminal value and the result rests on large store/supply-chain reinvestment assumptions. It is therefore a cross-check, capped below one-third of the blend. |
| Reverse-DCF (05) | 46.75% FY2026–FY2030 FCFF CAGR implied; not a value | Low | n/a | A price-implied-expectations cross-check only; it does not produce a fair value. |
| Sum-of-the-parts (06) | Not assessable — single-segment collapse | n/a | 0% | BURL reports one U.S. off-price retail segment, so a breakup would duplicate the consolidated peer read rather than add an independent value. |

Weights sum to 100% across the two valid, value-producing methods. BURL is an operating retailer with usable forward estimates, so the peer method carries the majority; the DCF is deliberately a minority cross-check. `02` and `03` both found the sector-cycle multiple-history test **not assessable**, not cycle-elevated or cycle-depressed; neither emitted `RF-VAL-001` or `RF-VAL-002`. [valuation/02 Multiples — Own History, §§4–5; valuation/03 Relative Valuation — Peers, §§5–6; valuation/04 Intrinsic DCF, §§5–8; valuation/06 Sum-of-the-Parts, §§1–5]

## 2. Triangulation & Reconciliation

The headline finding is the **126.94% full high-to-low spread** from the DCF's $133.46 to the peer method's $302.88 EV/EBITDA support check. Even comparing only the two method base points, $133.46 versus $281.39 is a 110.84% spread. This exceeds the 40% threshold, so valuation confidence is capped at 55; the explanation below does not remove that cap.

| Method | Value / Range | Confidence | Weight | Why this weight |
|---|---:|---|---:|---|
| Own-history multiples (02) | $317.03–$438.53, illustrative only | Low | 0% | Shown for transparency; excluded because `02` says it is not an admissible fair-value input. |
| Relative / peers (03) | $281.39 NTM P/E base; $302.88 NTM EV/EBITDA check | Medium | 70% | The P/E result applies BURL's $12.06 NTM EPS to a 23.333x warranted peer P/E; the EV check uses a lease-inclusive vendor debt basis and is not the selected peer point. |
| Intrinsic DCF (04) | $133.46; sensitivity $109.91–$168.23 | Low–medium | 30% | Cash-flow method with strict-debt bridge, but a 74.35% terminal-value share and a high capex burden make its absolute value fragile. |
| Reverse-DCF (05) | 46.75% implied FCFF CAGR; 13.85% implied steady-state EBIT margin | Low | n/a | It tests whether the market price can be met; it is not a value. |
| Sum-of-the-parts (06) | Not assessable — collapsed | n/a | 0% | One reportable segment; no independent breakup value. |

The mechanically weighted base point is **$237.01 per share**: 70% of the $281.39 peer P/E result plus 30% of the $133.46 DCF. The peer P/E deserves more weight because it uses a matched forward equity metric and a direct peer set, while the DCF is unusually sensitive to terminal value and to whether growth capex ever becomes cash flow. The DCF cannot be ignored: at the current price, its reverse solve needs 46.75% FCFF compounding for five years or a 13.85% steady-state EBIT margin, neither of which is proven by the available operating evidence. The own-history values do not corroborate the peer value because `02` itself flags its basis defects; they are a historical market record, not an independent proof that BURL warrants its former multiple. [data/BURL/Company Comparable Analysis Burlington Stores Inc.xls, Financial Data and Trading Multiples, 2026-09-28; valuation/03 Relative Valuation — Peers, §5; valuation/04 Intrinsic DCF, §§5–8; valuation/05 Reverse DCF, §§2–5]

The executed calculation was:

```text
$ /usr/local/Cellar/python@3.12/3.12.14/Frameworks/Python.framework/Versions/3.12/bin/python3.12 - <<'PY'
peer, dcf, price = 281.39, 133.46, 254.69
base = .70*peer + .30*dcf
bull = 13.00 * 28.51
base_pe = base / 12.06
bear = 3.49 * 19.00
print(base, bull, base_pe, bear)
print((302.88-dcf)/dcf, (base-price)/price, (base-price)/base, (price-bear)/price)
PY
237.01099999999997 370.63 19.652653399668325 66.31
1.2693638568125272 -0.0694099177876843 -0.07458579129173186 0.739582629740116
```

The base level's 19.65x NTM-P/E equivalent is a **translation of the weighted peer/DCF point**, not a new own-history reversion assumption. It is below the 28.51x low in `02`'s basic-share historical P/E series and below `03`'s 23.333x warranted peer P/E. That conservative translation is the disclosed effect of giving the low DCF a 30% weight; it should not be mistaken for evidence that a 19.65x P/E is a stable historical anchor.

## 3. Bull / Base / Bear Fair-Value Levels

The levels below use a 12-month convergence horizon. The forward EPS inputs are a practical equity-value translation of the method blend. The bear's $3.49 uses the actual FY2022 diluted GAAP EPS trough because BURL is a cyclical discretionary retailer; the pool does not supply a through-cycle normalized-EPS trough. It is therefore a conservative basis-limited downside case, not a claim that GAAP and CIQ normalized EPS are interchangeable. FY2022 also had $8.685bn sales and a 4.6% CIQ EBIT margin, versus $12.199bn LTM sales and a 7.8% CIQ EBIT margin, which prevents the bear from being merely a small haircut to current earnings. [earnings/01 Historical Financials, §§1–2; business-model/07 Business Quality, §§1 and 4]

| Case | Fair Value / Share (point) | Forward Metric (EPS/EBITDA) | Multiple | Horizon | What Must Be True (operating drivers) |
|---|---:|---:|---:|---|---|
| Bull | **$370.63** | $13.00 NTM EPS — 7.8% above the $12.06 vendor NTM EPS | **28.51x P/E** — the low end of `02`'s observed historical P/E band | 12 months | Inference, not from filings: sales remain near the top of FY2026 guidance, merchandise margin retains the Q2 underlying 70bp improvement after refund reinvestment, SG&A leverage holds, and the market restores BURL at least to the bottom of its historical P/E band. The $13.00 EPS is an upside scenario, not consensus. [data/BURL/BURL_Q2_2026_Earnings_PR.pdf, Outlook, 2026-08-27; data/BURL/Burlington Stores, Inc., Q2 2027 Earnings Call, 2026-08-27, prepared remarks; data/BURL/Company Comparable Analysis Burlington Stores Inc.xls, Financial Data, 2026-09-28; valuation/02 Multiples — Own History, §2] |
| Base | **$237.01** | $12.06 NTM EPS | **19.65x P/E equivalent** — `$237.01 ÷ $12.06` | 12 months | FY2026 revenue guidance and the NTM EPS consensus are broadly met, but the 70% peer / 30% DCF blend remains in force because capex, consumer demand, markdown risk and the no-recurring-tariff-refund normalization constrain the warranted multiple. [data/BURL/Company Comparable Analysis Burlington Stores Inc.xls, Financial Data, 2026-09-28; data/BURL/BURL_Q2_2026_Earnings_PR.pdf, Outlook, 2026-08-27; valuation/04 Intrinsic DCF, §§1–6] |
| Bear (cyclical trough) | **$66.31** | $3.49 EPS — actual FY2022 diluted GAAP trough used as the basis-limited through-cycle proxy | **19.00x P/E** — below the 19.65x base equivalent | 12 months if a deep consumer/markdown downturn develops | A repeat of the admitted performance trough: low-income consumer demand and weather weaken traffic, markdowns reverse merchandise-margin gains, and fixed store/supply-chain costs lose leverage. The 19.00x multiple is judgment, not a reported historical low; it is below `02`'s basic-share series and makes this a severe capital-loss boundary rather than a central forecast. [earnings/01 Historical Financials, §1; earnings/07 Earnings Sensitivity, §§2–6; business-model/10 External Dependency, §§1–5] |

The bull multiple is above the base equivalent and is anchored at the low end of `02`'s historic band. The bear multiple is below the base equivalent. Neither lower base nor bear equivalent is presented as a clean extension of `02`'s own-history range: `02` rejected that series as a fair-value input because its historical share and EV bases do not reconcile. The required mechanics are transparent rather than concealed.

No separate structural-reset value is calculated. The trigger does not fire: the moat verdict is **Narrow moat — structural, not yet proven economic** with trajectory **not assessable**, rather than “No moat proven” or eroding; the business-quality disruption score is 45, above the ≤40 trigger. The headline bear is thus the recoverable cyclical-trough case, not a permanent-impairment case. [business-model/09 Moat, §5; business-model/07 Business Quality, §1]

## 4. Margin of Safety & Downside (two separate metrics)

| Metric | Value |
|---|---:|
| Current price | **$254.69** — pool-verified NYSE close, 2026-09-28 |
| Base-case fair value (point) | **$237.01** |
| Bear-case fair value | **$66.31** |
| Implied upside to base case = (base FV − price) / price (%) | **(6.94%)** |
| **Margin of safety** = (base FV − price) / base FV — the cushion (%) | **(7.46%)** |
| **Downside to bear** = (price − bear FV) / price — *inverted: higher = worse* (%) | **73.96%** |

The price is pool-verified and one trading day old, so price-relative reads are assessable without a staleness adjustment. The negative margin of safety is different from the 73.96% inverted downside-to-bear figure; the latter is the loss if the stated trough case occurs. [Capital IQ Comps → Financial Data, subject row, 2026-09-28; valuation/01 Price & Capital Structure, §§1 and 7]

## 5. Warranted-Multiple Check

The base level translates to 19.65x NTM EPS, below BURL's 23.333x warranted peer P/E and below the lowest 28.51x P/E in the disputed own-history series. That restraint is supported by a 42/100 business-quality score, a narrow but not economically proven moat, 7.8% LTM EBIT margin versus 12.7% for Ross and 12.2% for TJX, and substantial store/supply-chain spending; it does not rely on double-counting BURL's lower margin inside an earnings multiple. [business-model/07 Business Quality, §§1–4; business-model/09 Moat, §§3–5; valuation/03 Relative Valuation — Peers, §§2 and 4]

The bull requires a 28.51x P/E, merely re-entering the bottom of the historical range, plus $13.00 NTM EPS. That level is not supported by a proven sustained excess-return spread: through-cycle ROIC is 7.0% on the cited CIQ series and the moat report could not establish a matching cost-of-capital spread. The sector-cycle test is not assessable for both own history and peers, so neither the former P/E band nor the current peer median can be treated as a confirmed durable anchor. [business-model/09 Moat, §§3–5; valuation/02 Multiples — Own History, §5; valuation/03 Relative Valuation — Peers, §6]

## 6. Fair-Value Read

For the next 12 months, the derived fair-value levels are **$370.63 bull, $237.01 base, and $66.31 cyclical-trough bear** per BURL share. At the $254.69 pool-verified close, the base point implies **(6.94%)** upside, a **(7.46%)** margin of safety, and a **73.96%** inverted downside-to-bear. The 70%-weighted peer P/E drives the base level, but the 30%-weighted DCF sharply limits it because its normalized cash-flow value is $133.46. The largest swing factor is whether merchandise-margin and SG&A gains turn into durable cash flow after tariff-refund reinvestment and heavy growth capex, rather than reversing through a consumer and markdown downturn. [valuation/03 Relative Valuation — Peers, §5; valuation/04 Intrinsic DCF, §§1–8; earnings/07 Earnings Sensitivity, §§2–6]
