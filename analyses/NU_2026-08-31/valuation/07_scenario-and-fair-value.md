# Scenario & Fair Value — NU

All values are for Nu Class A ordinary shares (`NU · NYSE · USD`). NU is a deposit-taking financial institution that reports under IFRS in USD, so the valid equity-value lenses are P/E, P/TBV, and residual income rather than EV/EBITDA or FCFF. [Valuation Data Triage — NU, §§1A, 6A; Price & Capital Structure — NU, §7]

## 1. Method Summary

| Method | Fair / Implied Value (per share) | Confidence | Weight | Why This Weight |
|---|---:|---|---:|---|
| Own-history multiples (02) | No fair-value point; 17-month positioning series only | Low | 0% | The seven observations are materially shorter than the required 3–5-year history and `02` marks any reversion as illustrative-only. It is not a value-producing input. [Multiples — Own History — NU, §§2, 4] |
| Relative / peers (03) | **US$7.38** primary NTM P/E; US$2.95–7.38 cross-multiple dispersion | Medium-low | 50% | A directly named Brazilian-bank peer set and matched NTM P/E are available, but NU's growth premium is only partly evidenced and the P/TBV result is highly sensitive to durable returns. [Relative Valuation — Peers — NU, §§2–5] |
| Intrinsic residual-income (04) | **US$5.55**; US$4.40–6.94 sensitivity grid | Low | 50% | Residual income is a valid primary financial-company method, but its 16.51% cost of equity is a Brazil-focused CGU rate rather than a proven group hurdle, and FY2026 earnings include a US$991.0m deferred-tax benefit with uncertain reversal timing. [Intrinsic Equity Value — NU, §§3, 6–8] |
| Reverse residual-income (05) | US$14.30 implies 47.36% terminal ROE at `04`'s 16.51% hurdle, or a 9.78% implied cost of equity | Low | n/a | Cross-check only. It shows that price and `04` cannot both be right, but does not itself produce a fair value. [Reverse DCF — NU, §§2–2A, 5] |
| Sum-of-the-parts (06) | US$7.38 collapsed P/E check; US$5.90–7.92 across named-bank checks | Low | 0% | NU has one Banking segment. The producer marks this as a single-segment sanity check, not a stand-alone weighted value. [Sum-of-the-Parts — NU, §§1–5] |

Weights sum to 100% across the two valid, value-producing methods. The financial-company method map makes residual income valid, but its CGU-specific discount rate is a material limitation; this offsets the peer method's unresolved growth-premium question and supports equal, rather than decorative, weights. `02` and `06` remain in the football field but do not enter the base point.

## 2. Triangulation & Reconciliation

The displayed football field runs from **US$2.95 to US$7.92**, a 2.68x span (168% from low to high). That is the headline uncertainty: US$2.95 is the unadjusted peer-median P/TBV check and US$7.92 is the highest named-bank NTM-P/E check. They are not independent methods; they share the same peer group and differ chiefly in whether NU's excess return is durable. The two weighted primary points are narrower, US$5.55–7.38 (33%), but neither supports the US$14.30 pool price. [Relative Valuation — Peers — NU, §5; Intrinsic Equity Value — NU, §§6–7; Sum-of-the-Parts — NU, §§2, 5]

| Method | Value / Range | Confidence | Weight | Why this weight |
|---|---:|---|---:|---|
| Own-history multiples | No value; observed NTM P/E 14.8x–24.0x is illustrative-only | Low | 0% | The 17-month history is not a through-cycle reference. [Multiples — Own History — NU, §§2, 4] |
| Relative / peers | US$7.38 primary; US$2.95–7.38 across NTM P/E, LTM P/E and P/TBV | Medium-low | 50% | NTM P/E is the producer's matched-basis primary result; the P/TBV lower point is a warning, not a mechanically adjusted base. [Relative Valuation — Peers — NU, §5] |
| Intrinsic residual income | US$5.55; US$4.40–6.94 sensitivity | Low | 50% | Correct equity-direct method for a lender, but its group cost of equity and tax normalization are not proven. [Intrinsic Equity Value — NU, §§3, 6–8] |
| Sum-of-the-parts | US$7.38; US$5.90–7.92 named-bank check range | Low | 0% | Duplicates the peer P/E lens for a sole Banking segment. [Sum-of-the-Parts — NU, §§1–5] |

Neither `02` nor `03` could assess sector-level multiple history, so neither fires a cycle-elevated or cycle-depressed tag. That is an explicit evidence gap, not proof that either reference is stable. [Multiples — Own History — NU, §5; Relative Valuation — Peers — NU, §6]

**Base-case fair value: US$6.47 per share.** It is the mechanically weighted point: 50% of the US$7.38 peer NTM-P/E value plus 50% of the US$5.55 residual-income value = US$6.465, rounded to US$6.47. [Relative Valuation — Peers — NU, §5; Intrinsic Equity Value — NU, §6] The peer lens is more directly linked to tradable Brazilian-bank valuations, while residual income is the business-type-appropriate intrinsic method; equal weights reflect the latter's CGU-rate limitation and the former's unproven premium. This is a reconciliation judgment, not a midpoint smearing of the full US$2.95–7.92 football field.

Executed calculation and raw output:

```text
$ /usr/local/Cellar/python@3.12/3.12.14/Frameworks/Python.framework/Versions/3.12/bin/python3.12 - <<'PY'
price=14.30; peer_primary=7.38; residual_income=5.55
base=0.50*peer_primary+0.50*residual_income
fy27_bvps_vendor_basic=4.12174; basic=4790.029; diluted=4908.841
fy27_bvps_diluted=fy27_bvps_vendor_basic*basic/diluted
fy27_tbvps_proxy=fy27_bvps_diluted*(2.46/2.70)
bull=fy27_tbvps_proxy*2.30; base_mult=base/fy27_tbvps_proxy; bear=fy27_tbvps_proxy*1.20
print(base, fy27_bvps_diluted, fy27_tbvps_proxy, bull, base_mult, bear)
print((base-price)/price, (base-price)/base, (price-bear)/price)
PY
6.465 4.021978646661981 3.664491877512027 8.428331318277661 1.7642263151724493 4.397390253014432
-0.5479020979020979 -1.2119102861562258 0.6924901920968929
```

The raw inputs are the US$7.38 peer primary value, US$5.55 residual-income value, US$4.12174 FY2027 consensus book value per share, 4,790.029m market-cap shares, 4,908.841m diluted shares, and current US$2.46 tangible book value per diluted share / US$2.70 book value per diluted share. [Relative Valuation — Peers — NU, §5; Intrinsic Equity Value — NU, §6; Capital IQ Estimates → Consensus, FY2027 Book Value / Share, current frozen export; Price & Capital Structure — NU, §§2, 6]

## 3. Bull / Base / Bear Fair-Value Levels

The horizon is 12 months, to roughly August 2027. A financial-company P/TBV framework is used for all three scenario levels so the multiple moves are comparable. The FY2027 vendor book-value-per-share consensus is US$4.12174. It is adjusted from the vendor per-share basis to `01`'s fully diluted basis: `4.12174 × 4,790.029m / 4,908.841m = US$4.0220`. The resulting FY2027 tangible-book-value-per-share (TBVPS) proxy is `US$4.0220 × (US$2.46 / US$2.70) = US$3.6645`; holding the June 2026 tangible-to-book ratio constant is an inference, not a published tangible-book consensus. [Capital IQ Estimates → Consensus, FY2027 Book Value / Share, current frozen export; Price & Capital Structure — NU, §§2, 6]

| Case | Fair Value / Share (point) | Forward Metric (EPS/EBITDA) | Multiple | Horizon | What Must Be True (operating drivers) |
|---|---:|---|---:|---|---|
| Bull | **US$8.43** | FY2027 TBVPS proxy US$3.6645 | **2.30x P/TBV** | 12 months | The FY2027 book-value consensus is reached, the Q2 credit-income and lower-credit-cost benefits do not reverse sharply, and NU earns the core peer set's highest current P/TBV (Itaú's 2.30x). Q2's lower credit cost added 115bp to risk-adjusted NIM, but higher early delinquency remains visible; this is an operating condition, not a forecast coefficient. [Capital IQ Estimates → Consensus, FY2027 Book Value / Share, current frozen export; Capital IQ Company Comparable Analysis → Trading Multiples, 2026-08-29; Earnings Sensitivity — NU, §§2, 4–6] |
| Base | **US$6.47** | FY2027 TBVPS proxy US$3.6645 | **1.764x P/TBV** | 12 months | The peer-primary and residual-income methods reconcile as above. The 1.764x multiple is 47% above the selected direct-peer median of 1.20x but below Itaú's 2.30x, requiring some credit-growth premium without assuming that NU sustains its current observed 5.7x trailing P/TBV. [Relative Valuation — Peers — NU, §§2–5; Intrinsic Equity Value — NU, §6] |
| Bear (credit-cycle trough) | **US$4.40** | FY2027 TBVPS proxy US$3.6645 | **1.20x P/TBV** | 12 months | The forward book base remains intact but investors apply the selected direct-peer median P/TBV. The relevant prior downturn is FY2022, when NU reported diluted EPS of **negative US$0.078**; P/E was therefore unusable in that down-leg. The bear uses P/TBV rather than a mild P/E haircut, while the disclosed 100%-downside macro case raises ECL by US$504.7m before tax. [Historical Financials — NU, §1; Capital IQ Estimates → Consensus, FY2027 Book Value / Share, current frozen export; Capital IQ Company Comparable Analysis → Trading Multiples, 2026-08-29; Earnings Sensitivity — NU, §§2, 4] |

The bear is a credit-cycle trough, not a permanent-impairment floor. A structural-reset calculation is not triggered: the moat verdict is narrow with a provisionally widening trajectory, not eroding, and business-model disruption risk is 50/100, above the approximately 40 trigger. [Moat — NU, §5; Business Quality — NU, §1]

## 4. Margin of Safety & Downside (two separate metrics)

| Metric | Value |
|---|---:|
| Current price | **US$14.30** — pool-verified last close, 2026-08-29 |
| Base-case fair value (point) | US$6.47 |
| Bear-case fair value | US$4.40 |
| Implied upside to base case = `(base FV − price) / price` | **(54.8%)** |
| **Margin of safety** = `(base FV − price) / base FV` — the cushion | **(121.2%)** — negative; no cushion |
| **Downside to bear** = `(price − bear FV) / price` — *inverted: higher = worse* | **69.3%** |

The US$14.30 price is the deterministic sidecar's authoritative workbook read (`CIQ Comps→Financial Data 'Day Close Price Latest'`, as of 2026-08-29), consistent with `01`; its two-calendar-day age is below the stale-price threshold. [Price & Capital Structure — NU, §§1, 7; `ciq_facts.json` `current_price` = US$14.30, source ref as stated]

## 5. Warranted-Multiple Check

The base 1.764x forward P/TBV is a 47% premium to the selected direct-peer median of 1.20x but remains below Itaú's 2.30x; it gives NU some credit for higher growth without assuming its recent 5.7x trailing P/TBV is durable. [Relative Valuation — Peers — NU, §§2–5]

NU's quality score is 52/100 and its moat is narrow and only provisionally widening; its four-year IFRS ROE of 17.2% is only 68bp above the 16.51% company-disclosed equity hurdle. [Business Quality — NU, §§1–4; Moat — NU, §§3–5]

The pool price implies a 3.90x forward P/TBV (`US$14.30 / US$3.6645`), 121% above the base multiple and above the core peer set's 2.30x high, while ECL coverage rose 149bp to 16.86% by June 2026 and filing-built TTM CFO was negative US$1.382bn; that premium is not supported by a proven through-cycle return record. [Earnings Quality — NU, §§1–3, 9–10; Capital IQ Company Comparable Analysis → Trading Multiples, 2026-08-29]

## 6. Fair-Value Read

The 12-month bull/base/bear fair-value levels are **US$8.43 / US$6.47 / US$4.40** per NYSE Class A share. At the pool-verified US$14.30 price, the base-case implied upside is negative 54.8%, the margin of safety is negative 121.2%, and downside to the bear level is 69.3% (inverted: higher is worse). Equal weighting of the peer NTM-P/E and residual-income methods drives the US$6.47 base; the short own-history series and collapsed SOTP do not contribute weight. The biggest swing factor is whether credit losses and risk-adjusted NIM permit a P/TBV premium to move from the peer-median 1.20x toward the peer-high 2.30x. [Relative Valuation — Peers — NU, §5; Intrinsic Equity Value — NU, §6; Earnings Sensitivity — NU, §§2, 4]
