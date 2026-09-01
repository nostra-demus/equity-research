# Scenario & Fair Value — NU

All values are for Nu Class A ordinary shares (`NU · NYSE · USD`). NU is a deposit-taking financial institution reporting under IFRS in USD, so direct equity methods—P/E, P/TBV and residual income—are valid; EV/EBITDA, FCFF and an EV bridge are not valuation methods for this lender. [data/NU/FY2025 Form 20-F, cover page; Valuation Module Rules, Business-Type Method Map]

## 1. Method Summary

| Method | Fair / Implied Value (per share) | Confidence | Weight | Why This Weight |
|---|---:|---|---:|---|
| Own-history multiples (02) | No fair-value point | Low | 0% | The export has only seven observations over about 17 months; `02` explicitly marks reversion illustrative-only rather than a fair-value input. [Capital IQ Financials → Multiples, 2025-03-31 to 2026-08-28; Multiples — Own History — NU, §§2, 4] |
| Relative / peers (03) | **US$9.70** | Medium-low | 40% | This is the producer's growth-adjusted 10.0x NTM-P/E result on US$0.970 NTM EPS. The three named Brazilian bank peers are relevant, but the durability of NU's return and growth premium is not established. [Capital IQ Company Comparable Analysis, Financial Data / Trading Multiples, as of 2026-08-29; Relative Valuation — Peers — NU, §§2–5] |
| Intrinsic residual income (04) | **US$7.65**; US$6.69–8.70 sensitivity | Low | 60% | Residual income is the primary type-appropriate intrinsic method for a financial institution, but its US$12.16% constructed group cost of equity is not filing-disclosed for the Group and the long fade is an analyst assumption. [Intrinsic DCF — NU, §§2–7] |
| Reverse-DCF (05) | US$14.30 price cross-check; not a fair value | Low | n/a | Reverse-DCF is not a weighted value input. Its output is not a clean inversion of `04`: it substitutes a 16.51% CGU-specific rate and describes `04` as US$5.55, whereas `04` uses 12.16% and reports US$7.65. Its solved 47.36% terminal ROE / 9.78% cost of equity is therefore a separate sensitivity, not corroboration. [Reverse DCF — NU, §§1–2A; Intrinsic DCF — NU, §§3, 6] |
| Sum-of-the-parts (06) | US$7.38 collapsed P/E check | Low | 0% | NU has one Banking segment; `06` labels the P/E output a single-segment sanity check, not a stand-alone fair-value method. [Sum-of-the-Parts — NU, §§1–5] |

Weights sum to 100% across the two valid, value-producing methods. The 60% residual-income weight respects the financial-company method map; it is not higher because the group cost of equity is not directly disclosed. `02` and `06` remain visible below but do not enter the base point.

## 2. Triangulation & Reconciliation

The valid weighted field is **US$7.65–9.70**, a **26.7%** high-to-low spread: below the 40% confidence-cap trigger, but not close agreement. The US$7.38 collapsed-SOTP check is shown for transparency but is excluded because it repeats the peer-P/E lens; the US$2.96 raw peer-median P/TBV result is a downside reference within `03`, not a second independent method. [Relative Valuation — Peers — NU, §5; Intrinsic DCF — NU, §§6–7; Sum-of-the-Parts — NU, §5]

| Method | Value / Range | Confidence | Weight | Why this weight |
|---|---:|---|---:|---|
| Own-history multiples (02) | No value; NTM P/E 14.8x–24.0x is illustrative-only | Low | 0% | The series is not a through-cycle multiple range. [Multiples — Own History — NU, §§2, 4] |
| Relative / peers (03) | US$9.70 base; US$7.38 return-normalised P/TBV; US$2.96 raw peer-P/TBV reference | Medium-low | 40% | Uses a matched NTM P/E and named peers, but the current premium is not fully warranted by the quality and moat evidence. [Relative Valuation — Peers — NU, §§3–5] |
| Intrinsic residual income (04) | US$7.65; US$6.69–8.70 sensitivity | Low | 60% | Direct equity valuation is appropriate for a bank; the cost-of-equity and fade assumptions limit reliance. [Intrinsic DCF — NU, §§3–7] |
| Reverse-DCF (05) | US$14.30 price implication; no value | Low | n/a | Cross-check only, and rate/model inputs do not match `04` as noted above. [Reverse DCF — NU, §§1–2A] |
| SOTP (06) | US$7.38; US$5.90–7.92 named-bank checks | Low | 0% | Sole-segment P/E sanity check; duplicates the peer lens. [Sum-of-the-Parts — NU, §§2–5] |

`02` and `03` each report **“Not assessable — no sector-level multiple history”** and neither fires `RF-VAL-001` or `RF-VAL-002`. That is a named evidence gap, not evidence that either peer or own-history anchor is stable. [Multiples — Own History — NU, §5; Relative Valuation — Peers — NU, §6]

**Base-case fair value: US$8.47 per share.** The mechanically weighted point is `60% × US$7.653661 + 40% × US$9.70 = US$8.472197`, rounded to US$8.47. Residual income gets the larger weight because it directly values a lender's common equity and explicitly fades excess returns; the peer lens receives substantial weight because it is contemporaneous, but its 10.0x adjusted P/E rests on a judgmental growth premium. The base does not use the reverse-DCF because its discount-rate and value inputs conflict with `04`, and it does not average the raw US$2.96 peer-P/TBV warning into the weighted point.

Executed calculation and raw output:

```text
$ python3 - <<'PY'
price=14.30; ri=7.653661; peer=9.70; tbv=2.46
base=.60*ri+.40*peer
cases={'bear': (tbv*(1.20/7.61),7.61),
       'base': (.9700,base/.9700),
       'bull': (1.1101,10.0)}
print(f'weighted_base={base:.6f}')
for name,(eps,pe) in cases.items():
    fv=eps*pe; rote=eps/tbv
    print(name, f'EPS={eps:.6f}', f'P/E={pe:.6f}x', f'FV={fv:.6f}',
          f'P/TBV={fv/tbv:.6f}x', f'ROTE={rote:.4%}',
          f'identity={pe*rote:.6f}x')
bear=cases['bear'][0]*cases['bear'][1]
print(f'upside={(base-price)/price:.4%}; mos={(base-price)/base:.4%}; downside={(price-bear)/price:.4%}; spread={(peer-ri)/ri:.4%}')
PY
weighted_base=8.472197
bear EPS=0.387911 P/E=7.610000x FV=2.952000 P/TBV=1.200000x ROTE=15.7687% identity=1.200000x
base EPS=0.970000 P/E=8.734223x FV=8.472197 P/TBV=3.443982x ROTE=39.4309% identity=3.443982x
bull EPS=1.110100 P/E=10.000000x FV=11.101000 P/TBV=4.512602x ROTE=45.1260% identity=4.512602x
upside=-40.7539%; mos=-68.7874%; downside=79.3566%; spread=26.7367%
```

## 3. Bull / Base / Bear Fair-Value Levels

The convergence horizon is 12 months, to September 2027. The fair-value levels are P/E-derived; each P/E moves in the same direction as its EPS input. No forward TBVPS estimate is supplied in the pool. The financial cross-check below therefore uses the latest audited **current TBVPS of US$2.46 at 30 June 2026** as an explicitly mismatched proxy against forward-EPS cases, rather than inventing a forward tangible-book forecast. [data/NU/H1 FY2026 reviewed interim financial statements, Statement of Financial Position, p.7; Note 9; Price & Capital Structure — NU, §6]

| Case | Fair Value / Share (point) | Forward Metric (EPS/EBITDA) | Multiple | Horizon | What Must Be True (operating drivers) |
|---|---:|---|---:|---|---|
| Bull | **US$11.10** | NTM EPS bull proxy **US$1.1101**; equals the FY2027 consensus EPS and is an inference, not a vendor NTM case | **10.00x P/E** | 12 months | Credit-card and loan interest keeps converting into earnings, lower credit cost does not reverse, and the market again accepts the 10.0x growth-adjusted P/E used in `03`. Q2 risk-adjusted NIM was 12.4%, but this must persist without a rise in delinquency and ECL coverage. [Capital IQ Estimates → Consensus, FY2027 EPS, current export; Relative Valuation — Peers — NU, §5; Q2 2026 Earnings Presentation, slides 15–18] |
| Base | **US$8.47** | NTM EPS **US$0.9700** | **8.734x P/E** | 12 months | The US$7.65 residual-income and US$9.70 peer outputs reconcile at the stated 60% / 40% weights. The implied P/E is above the 7.61x peer median but below `03`'s 10.0x growth-adjusted result, requiring some return premium without assuming a return to the short, invalid own-history range. [Capital IQ Company Comparable Analysis, Financial Data / Trading Multiples, as of 2026-08-29; Relative Valuation — Peers — NU, §5; Intrinsic DCF — NU, §6] |
| Bear (cyclical credit down-leg) | **US$2.95** | NTM EPS stress proxy **US$0.3879**; implied by a 15.77% ROTE proxy on current TBVPS, not a vendor forecast | **7.61x P/E** | 12 months | The raw peer-median 1.20x P/TBV reference in `03` is applied to current TBVPS. Credit cost worsens as the macro/ECL downside state and risk expansion bite; the filing's 100%-downside macro weighting adds US$504.7m to ECL before tax, not a mechanically translated EPS loss. [Relative Valuation — Peers — NU, §5; Earnings Sensitivity — NU, §§2, 4–6] |

| Financial scenario reconciliation | TBVPS basis | P/TBV | EPS basis | Implied P/E | ROTE | Identity check |
|---|---|---:|---|---:|---:|---|
| Bull | Current US$2.46 at 2026-06-30; no forward TBVPS in pool | 4.513x proxy | NTM bull proxy US$1.1101 | 10.000x | 45.13% proxy | `10.000 × 45.13% = 4.513x` |
| Base | Current US$2.46 at 2026-06-30; no forward TBVPS in pool | 3.444x proxy | NTM US$0.9700 | 8.734x | 39.43% proxy | `8.734 × 39.43% = 3.444x` |
| Bear (cyclical) | Current US$2.46 at 2026-06-30; no forward TBVPS in pool | 1.200x proxy | NTM stress proxy US$0.3879 | 7.610x | 15.77% proxy | `7.610 × 15.77% = 1.200x` |

The price method is P/E, and all P/TBV / ROTE rows are a current-book cross-check only; their time bases are deliberately labelled and cannot be treated as matched forward P/TBV forecasts. The closest filed down-leg is FY2022, when diluted EPS was **negative US$0.078**; P/E therefore cannot turn that actual trough into a share-price level. The US$2.95 bear is a conservative 12-month credit down-leg based on the peer-median P/TBV reference, not a proven full-cycle floor; no historical Brazilian-bank P/TBV series is in the pool to price the negative-EPS trough. [data/NU/FY2025 Form 20-F, Consolidated Statements of Income, F-6–F-7; Historical Financials — NU, §1; Relative Valuation — Peers — NU, §§5–6]

No structural-reset calculation is triggered. The moat verdict is **Narrow moat — trajectory not assessable**, not eroding, and the business-quality disruption score is 50/100, above the approximately 40 trigger; the bear therefore remains a credit-cycle case rather than an avoid-ruin floor. [Moat — NU, §5; Business Quality — NU, §1]

## 4. Margin of Safety & Downside (two separate metrics)

| Metric | Value |
|---|---:|
| Current price | **US$14.30** — pool-verified last close, 2026-08-29 |
| Base-case fair value (point) | **US$8.47** |
| Bear-case fair value | **US$2.95** |
| Implied upside to base case = `(base FV − price) / price` (%) | **(40.8%)** |
| **Margin of safety** = `(base FV − price) / base FV` — the cushion (%) | **(68.8%)** — negative; no cushion |
| **Downside to bear** = `(price − bear FV) / price` — *inverted: higher = worse* (%) | **79.4%** |

The US$14.30 price is the source-bound Capital IQ workbook read (`current_price`, `status: present`; CIQ Comps → Financial Data “Day Close Price Latest”, as of 2026-08-29), and agrees with `01`'s pool-verified price-state. Its age is two calendar days at the 2026-09-01 run date, below the stale-price threshold. [`ciq_facts.json`, `current_price` = US$14.30, source ref as stated; Price & Capital Structure — NU, §§1, 7]

## 5. Warranted-Multiple Check

The base point translates to 8.734x NTM P/E and a 3.444x current-TBV proxy, above the 7.61x / 1.20x peer medians but below `03`'s 10.0x adjusted P/E; it recognises NU's higher return and growth without assuming the current 14.76x NTM P/E is durable. [Relative Valuation — Peers — NU, §§2–5]

That premium remains limited by mixed 52/100 business quality, a narrow moat with trajectory not assessable, high regulatory and consumer-credit exposure, and a Q2 risk-adjusted NIM that the earnings work does not treat as a through-cycle level. [Business Quality — NU, §§1–4; Moat — NU, §5; Earnings Synthesis — NU, §4]

The specific RF-OWN-004 value-trap trigger does not apply, but the 74.4% voting versus 18.6% economic-founder position still limits Class A holders' ability to force a multiple expansion. [FY2025 Form 20-F, Items 6A and 7A; Ownership & Insider Behavior — NU, §3]

## 6. Fair-Value Read

The 12-month bull/base/bear levels are **US$11.10 / US$8.47 / US$2.95** per NYSE Class A share. At the pool-verified US$14.30 price, implied base-case upside is negative 40.8%, margin of safety is negative 68.8%, and downside to the bear case is 79.4% (inverted: higher is worse). The US$8.47 base is driven by a 60% residual-income / 40% peer blend; own-history reversion and the single-segment SOTP have zero weight. The biggest swing factor is a credit-cycle outcome: whether higher-yield lending converts into durable earnings or instead raises ECL, delinquency and the multiple the market will pay.
