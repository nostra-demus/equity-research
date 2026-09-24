# Scenario & Fair Value — V

Visa Inc. is a U.S. GAAP operating company reporting in USD. All values below apply to Visa Class A common stock (`V`, NYSE, USD) and use the 1,898m Q3 FY2026 diluted Class-A-equivalent shares and $11,499m strict net debt plus $514m preferred equity from the canonical valuation bridge. [Visa Q3 FY2026 Form 10-Q, Note 12 and pp. 4, 14, 17–18; `01_price-and-capital-structure`, Anchor Summary]

## 1. Method Summary

| Method | Fair / Implied Value (per share) | Confidence | Weight | Why This Weight |
|---|---:|---|---:|---|
| Own-history multiples (02) | $355.21 | Medium | 40% | The selected own-median EV/revenue value uses reported LTM revenue and a matched historic denominator. It is more reproducible than the P/E reversion, but the sector-cycle stability test is not assessable and historical trading levels are not an independent proof of worth. [Capital IQ Financials → Multiples, through 30-Jun-2026; Capital IQ Comps → Financial Data, 17-Aug-2026; `02_multiples-own-history`, §§2, 4–5] |
| Relative / peers (03) | $367.62 | Low–medium | 35% | NTM P/E uses the closest direct peer, Mastercard, with a stated 5% growth-and-regulatory-risk adjustment. The peer set is only one company and neither peer-relative history nor a sector multiple history is available. [Capital IQ Comps → Financial Data and Trading Multiples, 17-Aug-2026; `03_relative-valuation-peers`, §§1, 5–6] |
| Intrinsic DCF (04) | $243.23 | Low | 25% | It starts from reported CFO less capex, but the FY27–FY31 growth, margin and working-capital path is analyst-built and terminal value is 74.3% of EV. Its 9.04% WACC also has a material, unresolved alternative interpretation: the same cash flows price at a 7.15% implied WACC. [Visa Q3 FY2026 Form 10-Q, p. 10; `04_intrinsic-dcf`, §§1–8; `05_reverse-dcf`, §2A] |
| Reverse-DCF (05) | Price implies 19.67% five-year FCF CAGR at 9.04% WACC; 7.15% implied WACC on the DCF base path | Cross-check | n/a | It tests the hurdle embedded in the price; it is not a fair-value input. The growth read is demanding, but the lower implied discount-rate solve means it does not prove the market is wrong. [`05_reverse-dcf`, §§2–5] |
| Sum-of-the-parts (06) | $352.51 | Not independent | 0% | Zero-weighted. Visa has one Payment Services segment, and this collapsed check reuses the same company-wide NTM EBITDA and Mastercard comparator as the peer EV/EBITDA read. [Visa FY2025 Form 10-K, Note 14, p. 87; `06_sum-of-the-parts`, §§1–5] |

The value-producing method weights sum to 100%. The 75% combined multiples weight satisfies the operating-company multiples-first rule; the DCF is a 25% cross-check, below the one-third ceiling. The SOTP remains visible but is not counted as a second peer observation.

## 2. Triangulation & Reconciliation

### Method Football Field

| Method | Value / Range | Confidence | Weight | Why this weight |
|---|---:|---|---:|---|
| Intrinsic DCF (04) | $243.23 | Low | 25% | Reported cash-flow base, but analyst-built outer years, 74.3% terminal-value share and unresolved 9.04% versus 7.15% discount-rate interpretation. [`04_intrinsic-dcf`, §§2–8; `05_reverse-dcf`, §2A] |
| SOTP (06) | $352.51 | Not independent | 0% | Collapsed single-segment sanity check using the same Mastercard-based NTM EBITDA approach as part of the peer work. [`06_sum-of-the-parts`, §§2–5] |
| Own-history multiples (02) | $355.21 | Medium | 40% | Median EV/revenue reversion on reported LTM revenue; sector-multiple history is not assessable. [`02_multiples-own-history`, §§4–5] |
| Relative / peers (03) | $367.62 | Low–medium | 35% | Adjusted Mastercard NTM P/E; direct-peer sample is one and the sector-cycle reference is not assessable. [`03_relative-valuation-peers`, §§1, 5–6] |

**Headline finding — the independent-method field is $243.23 to $367.62 per share, a $124.39 or 51.14% high-to-low spread relative to the low.** This exceeds the 40% threshold, so downstream valuation confidence is capped at 55/100 despite the reconciliation below. The collapsed SOTP is shown for transparency but excluded from that independent-method calculation. The own-history and peer references both state that their Sector Cycle Reality Tests are not assessable; neither carries `RF-VAL-001` or `RF-VAL-002`, but neither multiple reference can be treated as a cycle-stable anchor. [`02_multiples-own-history`, §5; `03_relative-valuation-peers`, §6; Valuation MODULE_RULES, Reconciliation Gate 6 and Score-Cap Rules]

The mechanically weighted base point is **$331.56 per share**: `0.40 × $355.21 + 0.35 × $367.62 + 0.25 × $243.23`. Multiples get the larger weight because Visa is an operating company with usable forward estimates, while the own-history value rests on reported revenue and the peer read uses the closest available direct rival. The $243.23 DCF cannot be ignored: at 9.04% WACC, the reverse model says the observed price requires 19.67% FCF CAGR over five years, which is not proven; at the same time, the 7.15% implied-WACC solve means the DCF's lower value is not a conclusive estimate of intrinsic worth. The base level therefore maps the mechanical blend to an 18.338x NTM vendor EBITDA multiple—above the 17.47x own-history low, but below the current 19.5x NTM and adjusted-peer 19.48x readings—rather than assuming a return to a historical mean. [Capital IQ Comps → Financial Data and Trading Multiples, 17-Aug-2026; `02_multiples-own-history`, §§1–4; `03_relative-valuation-peers`, §5; `04_intrinsic-dcf`, §§6–8; `05_reverse-dcf`, §§2–3]

## 3. Bull / Base / Bear Fair-Value Levels

All three levels use the same EV-to-equity bridge: `(forward vendor EBITDA × EV/EBITDA multiple − $11,499m strict net debt − $514m preferred equity) ÷ 1,898m diluted shares`. “Vendor EBITDA” is Capital IQ's special-item-excluding measure, not Visa-reported EBITDA. The horizon is 12 months from 23 September 2026. [Capital IQ Comps → Financial Data, 17-Aug-2026; Visa Q3 FY2026 Form 10-Q, pp. 4, 14, 17–18 and Note 12; `01_price-and-capital-structure`, Anchor Summary]

| Case | Fair Value / Share (point) | Forward Metric (EPS/EBITDA) | Multiple | Horizon | What Must Be True (operating drivers) |
|---|---:|---:|---:|---|---|
| Bull | **$425.88** | $36,720m NTM vendor EBITDA: 5% above $34,971m consensus | 22.34x NTM EV/EBITDA | 12 months | *Inference, not from filings:* payment activity and yield/mix remain better than the base while incentives and marketing do not take more of revenue, allowing EBITDA 5% above consensus; the multiple returns only to the 22.34x own-history mean, below the 28.47x observed maximum. Activity, pricing/mix and incentives overlap and are not summed from the one-quarter sensitivity bounds. [Capital IQ Comps → Financial Data, 17-Aug-2026; `02_multiples-own-history`, §2; `07_earnings-sensitivity`, §§2, 5] |
| Base | **$331.56** | $34,971m NTM vendor EBITDA consensus | 18.338x NTM EV/EBITDA | 12 months | Consensus EBITDA is achieved, but the warranted multiple stays near the lower end of the 17.47x–28.47x own-history band because the moat is stable rather than widening and regulatory dependence is the weakest quality factor (40/100). [Capital IQ Comps → Financial Data, 17-Aug-2026; `02_multiples-own-history`, §2; `07_business-quality`, §§1–4; `09_moat`, §5] |
| Bear | **$283.37** | $31,474m NTM vendor EBITDA: 10% below consensus | 17.47x NTM EV/EBITDA | 12 months | *Inference, not from filings:* payment activity, travel-linked cross-border commerce and yield/mix soften while client-incentive intensity stays elevated; the multiple moves to the observed own-history low. The 10% metric reduction is not a sum of the earnings sensitivity rows, which overlap; it is a coherent adverse operating case built from those named drivers. [Capital IQ Comps → Financial Data, 17-Aug-2026; `02_multiples-own-history`, §2; `07_earnings-sensitivity`, §§2, 5–6; `10_external-dependency`, §§1, 3–5] |

No structural-reset case is required. The moat verdict is **Strong moat** with a stable, not confirmed widening, trajectory, and the business-quality rate-of-change row is 55/100, above the ≤40 structural-runoff trigger. [`09_moat`, §5; `07_business-quality`, §1]

Executed calculation (Python 3.12; USD millions except per-share output):

```bash
/usr/local/Cellar/python@3.12/3.12.14/Frameworks/Python.framework/Versions/3.12/bin/python3.12 -c 'shares=1898.;nd=11499.;pref=514.;own=355.21;peer=367.62;dcf=243.23;base=.40*own+.35*peer+.25*dcf;base_mult=(base*shares+nd+pref)/34971.48;cases={"bear":(34971.48*.90,17.47),"base":(34971.48,base_mult),"bull":(34971.48*1.05,22.34)};print(f"weighted_base={base:.2f}; base_EV_EBITDA={base_mult:.4f}x");[print(f"{n}: metric={m:.3f}; multiple={x:.4f}x; EV={m*x:.3f}; equity={m*x-nd-pref:.3f}; per_share={(m*x-nd-pref)/shares:.2f}") for n,(m,x) in cases.items()]'
```

```text
weighted_base=331.56; base_EV_EBITDA=18.3381x
bear: metric=31474.332; multiple=17.4700x; EV=549856.580; equity=537843.580; per_share=283.37
base: metric=34971.480; multiple=18.3381x; EV=641311.033; equity=629298.033; per_share=331.56
bull: metric=36720.054; multiple=22.3400x; EV=820326.006; equity=808313.006; per_share=425.88
```

## 4. Margin of Safety & Downside (two separate metrics)

The pool-verified anchor is stale by 26 U.S. trading days, so price-relative calculations are shown both at the freshest available quote and at the canonical pool price. The $361.52 quote is an indicative, unverified web cross-check; it leads the presentation for freshness but does not replace the $364.15 pool anchor or relax the confidence cap. [Capital IQ Comps → Financial Data, 17-Aug-2026; `ciq_facts.json` `current_price`; Web: Visa Investor Relations and StockAnalysis, NYSE close, 23-Sep-2026, indicative and unverified; `01_price-and-capital-structure`, §§1, 7]

| Metric | Value |
|---|---:|
| Current price — fresh context | $361.52, 23-Sep-2026, indicative web quote; unverified |
| Current price — canonical pool anchor | $364.15, 17-Aug-2026 close; pool-verified but 26 trading days stale |
| Base-case fair value (point) | $331.56 |
| Bear-case fair value | $283.37 |
| Implied upside to base case = `(base FV − price) / price` | **(8.29%)** at $361.52 fresh context; **(8.95%)** at $364.15 stale pool anchor |
| **Margin of safety** = `(base FV − price) / base FV` — the cushion | **(9.04%)** at $361.52 fresh context; **(9.83%)** at $364.15 stale pool anchor |
| **Downside to bear** = `(price − bear FV) / price` — *inverted: higher = worse* | **21.62%** at $361.52 fresh context; **22.18%** at $364.15 stale pool anchor |

The fresh-context metric is a recalculation, not a second price source for scoring. The 51.14% cross-method field is more restrictive than the stale-price rule: downstream valuation confidence remains capped at 55/100. [Valuation MODULE_RULES, Score-Cap Rules]

## 5. Warranted-Multiple Check

The base 18.338x NTM EV/EBITDA multiple is inside Visa's 17.47x–28.47x own-history range and below both the current 19.5x NTM multiple and the 19.48x adjusted Mastercard read. It is defensible only if Visa's strong but stable network advantage continues to earn returns above its cost of capital without regulation, incentives or alternative rails reducing its economics; the evidence does not support paying a mean or peak multiple by default. [`02_multiples-own-history`, §§1–5; `03_relative-valuation-peers`, §§4–5; `09_moat`, §§3–5; `07_business-quality`, §§1–4]

No structurally misaligned controlling-owner flag applies, so this is not an owner-induced value-trap case. The material valuation risk is instead that the market price retains a 19.5x NTM EBITDA multiple while the DCF's 9.04% WACC read requires FCF growth that has not been established from available evidence. [`02_multiples-own-history`, §6; `04_intrinsic-dcf`, §8; `05_reverse-dcf`, §§2–5]

## 6. Fair-Value Read

The 12-month levels are **$283.37 bear, $331.56 base and $425.88 bull per V share**. At the freshest available $361.52 indicative quote, the base level gives a negative 9.04% margin of safety and 21.62% downside to the bear; at the stale, pool-verified $364.15 anchor those figures are negative 9.83% and 22.18%, respectively. The base point is 75% multiples-based and 25% DCF-based, but its confidence is capped because the full independent-method spread is 51.14%. The largest swing factor is whether payment activity and client incentives support the Street EBITDA path at a lower discount rate, or instead validate the DCF's lower cash-flow value and a multiple nearer the historical floor. [`02_multiples-own-history`, §4; `03_relative-valuation-peers`, §5; `04_intrinsic-dcf`, §§6–8; `05_reverse-dcf`, §§2–5; `07_earnings-sensitivity`, §§2–6]
