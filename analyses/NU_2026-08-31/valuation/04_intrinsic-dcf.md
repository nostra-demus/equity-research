# Intrinsic Equity Value — NU (Residual-Income Model)

NU is a deposit-taking financial institution. An FCFF DCF and EV bridge would treat deposits, loans, funding cost and regulatory capital as non-operating items, which is not valid for a lender. This report therefore values equity directly with a residual-income model: opening book value plus the present value of earnings above the required return on equity. The decision line is **NU · NYSE · USD**. NU reports under IFRS Accounting Standards in US dollars and has a 31 December year-end. [Valuation Data Triage — NU, §1A; Price & Capital Structure — NU, §§1, 7]

## 1. Equity Base & Normalizations

All amounts are US$ millions unless stated otherwise. The base is equity at 30 June 2026, not CFO or FCF: lending and deposit flows make the latter unsuitable as distributable cash for this bank. [Earnings Quality — NU, §§1–3]

| Item | Base Value | Treatment in Residual-Income Model | Source |
|---|---:|---|---|
| Parent equity / opening book value | 13,249.7 | Opening equity, B0 | [H1 FY2026 reviewed interim financial statements, Statement of Financial Position, p.8; Price & Capital Structure — NU, §6] |
| Fully diluted shares | 4,908.841m | Per-share denominator throughout | [H1 FY2026 reviewed interim financial statements, Note 9; Price & Capital Structure — NU, §2] |
| Book value per diluted share | 2.70 | Reconciles to 13,249.7 / 4,908.841 | [Price & Capital Structure — NU, §6] |
| H1 FY2026 reported net income | 1,932.520 | Deducted from the FY2026 consensus full-year earnings estimate; it is already reflected in the 30 June book value | [H1 FY2026 interim financial statements, Statement of Income, p.5; Statement of Changes in Equity, p.10] |
| FY2026 consensus GAAP EPS | 0.85 | FY2026 net income = 0.85 × 4,908.841 = 4,172.5; used only for unreported H2 earnings | [Capital IQ Estimates — Trends, FY2026 current; Guidance & Consensus — NU, §4] |
| H1 FY2026 deferred-tax benefit | 991.046 | **Not normalized away.** The filing does not disclose its reversal timing or a forward cash-tax rate, so a tax adjustment would be invented. It is instead a model-risk flag. | [H1 FY2026 interim financial statements, Note 30, pp.36–37; Earnings Quality — NU, §5] |
| Cash dividends / modeled repurchases | None modeled through FY2030 | NU has no dividend policy. A US$1.0bn repurchase authorization is not treated as an executed buyback; the filing does not give a committed timing or completed amount in the evidence used here. This is an analyst assumption, not company guidance. | [FY2025 Form 20-F, Item 8.A, “Dividend and Dividend Policy”; H1 FY2026 reviewed interim financial statements, Note 31; Price & Capital Structure — NU, §6] |

The H1 book tax rate was 11.8%, lowered by the US$991.046m deferred-tax benefit against US$1,249.145m current tax expense. The residual-income model uses GAAP earnings after tax, so it cannot use an EBIT/NOPAT tax normalization; future cash-tax timing is not proven from available data. This makes the FY2026 consensus earnings input less certain, rather than a reason to fabricate a normalized rate. [H1 FY2026 interim financial statements, Statement of Income, p.5; Note 30, p.37]

## 2. Forecast Assumptions

`RI_t = NI_t − k_e × B_{t−1} × period fraction`; `B_t = B_{t−1} + NI_t − distributions`. No distributions are modeled during the explicit period. For this lender, retained earnings are the relevant reinvestment: capex and conventional working-capital assumptions are not used.

| Assumption | H2 2026 | FY2027 | FY2028 | FY2029 | FY2030 | Terminal FY2031 onward | Source / Basis |
|---|---:|---:|---:|---:|---:|---:|---|
| GAAP EPS (US$) | 0.456 | 1.080 | 1.280 | 1.460 | 1.620 | Not separately forecast | H2 is FY2026 consensus EPS 0.850 less H1 reported earnings per diluted share equivalent (1,932.520 / 4,908.841 = 0.394); FY2027–30 are **analyst assumptions, not company-guided**. |
| Net income (US$m) | 2,240.0 | 5,301.5 | 6,283.3 | 7,166.9 | 7,952.3 | 8,438.8 | H2 calculation above; FY2027–30 are EPS × diluted shares; terminal earnings are 20.0% terminal ROE × FY2030 ending book. |
| ROE on beginning book | 33.8% annualized | 34.2% | 30.2% | 26.5% | 23.2% | 20.0% | Explicit-period path is **analyst assumption** that fades from FY2025 IFRS ROE of 30.3%; terminal 20.0% is only 349bp above the 16.51% company hurdle. [Moat — NU, §3; FY2025 Form 20-F, pp.155, 157, F-38] |
| Distribution / payout | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 85.0% | Explicit zero payout is an analyst assumption; terminal payout is `(20.0% − 3.0%) / 20.0%`, which retains 15.0% to finance 3.0% book-value growth. |
| Book-value / residual-income growth | Derived | Derived | Derived | Derived | Derived | 3.0% | Terminal residual-income growth is an **analyst assumption**, below Nu’s 3.69% Brazil long-term-inflation assumption in its impairment test because NU reports in USD and has material FX translation exposure. [FY2025 Form 20-F, Note 4, goodwill impairment analysis, F-37–F-38; External Dependency Check — NU, §§1–2] |

The near-term earnings path is not a smooth extrapolation of the latest quarter. Q2 2026 risk-adjusted NIM was 12.4%, following a 294bp sequential lift from credit income and lower credit cost, while risk expansion also added 24bp to early delinquencies and US$170m to the allowance bridge. The forecast therefore fades ROE after FY2027 rather than treats the latest spread as a permanent run rate. [Q2 2026 Earnings Presentation, slides 16, 18; Earnings Sensitivity — NU, §§2, 4]

**Financeable-growth check.** For a lender, retained earnings rather than industrial capex is the financeable-growth driver. The terminal assumptions reconcile exactly: `20.0% terminal ROE × 15.0% retention = 3.0% growth`. This is below the 20.0% terminal ROE, so it requires the modeled 85.0% terminal payout; it is an assumption, not a disclosed capital-return plan.

## 3. Cost of Equity

This model discounts equity directly at the cost of equity (`k_e`); it does not calculate WACC or use an EV bridge. The **used 16.51% rate is the company’s own disclosed Brazil-focused Investments-activities CGU cost of equity**, not a group-wide rate. It is conservative versus the illustrative market build below and avoids assigning a low USD CAPM rate to a business with 91.4% of FY2025 geographic revenue in Brazil. [FY2025 Form 20-F, Note 4, goodwill impairment analysis, F-37–F-38; External Dependency Check — NU, §1]

| Component / cross-check | Value | Source / treatment |
|---|---:|---|
| USD long-term government-bond rate | 4.45% | Web-sourced, 1 July 2026 US Treasury rate used in Damodaran’s July update; unverified third-party valuation input. [Web: Damodaran, current data update, 2026-07-01] |
| Brazil total equity-risk premium | 7.59% | Web-sourced January 2026 country-risk data; includes country exposure and is an external input. [Web: Damodaran, Country Default Spreads and Risk Premiums, 2026-01-05] |
| Beta | 1.00 floor, illustrative only | No sourced NU beta was found in the frozen pool. The module’s cyclical/emerging-market floor is used only for the market check, not as a claimed measured beta. [Valuation MODULE_RULES, Economic Consistency Gate 4; Business Quality — NU, §§1–2] |
| Illustrative market cost of equity | 12.04% | `4.45% + 1.00 × 7.59%`; not used because beta is a policy floor rather than a sourced NU measurement. |
| **Used cost of equity** | **16.51%** | **Company-disclosed impairment-test cost of equity for the Brazil-focused Investments CGU; no discretionary WACC override.** [FY2025 Form 20-F, Note 4, goodwill impairment analysis, F-37–F-38] |

The used 16.51% rate clears the low-side test: it is 12.06 percentage points above the 4.45% USD reference rate. The company’s rate is 4.47 percentage points above the illustrative 12.04% market check. That gap is disclosed rather than tuned away: the filed rate has narrower scope than the group but is the only company-specific hurdle located, and using it is conservative. The relevant financial-company arithmetic is `k_e`, not `after-tax k_d ≤ WACC < k_e`.

### 3A. Cost-of-Capital Reality Test

| Reference | Rate | Source | Gap vs used cost of equity |
|---|---:|---|---:|
| Used cost of equity | 16.51% | This report, §3 | — |
| Company disclosed discount rate | 16.51% | Investments-activities CGU impairment test; stated as a cost of equity, not a group-wide rate. [FY2025 Form 20-F, Note 4, F-37–F-38] | 0bp |
| Market-implied rate | Runs after this report; the FCFF reverse-DCF slot is invalid for this financial issuer | [Valuation Data Triage — NU, §6A] | Not assessable |
| Trailing earnings yield | 5.13% | `1 / 19.5x` using the present Capital IQ LTM P/E; this is not a cost-of-equity estimate. [Capital IQ Financials → Multiples, latest P/LTM EPS 19.5x; `ciq_facts.json` `pe_ltm_current_x`] | −1,138bp |
| Illustrative market build | 12.04% | Web inputs and 1.00 beta floor in §3 | −447bp |

**Escalation branch:** no low-rate escalation applies because the model uses, rather than undercuts, the company’s own disclosed rate. Scope remains a limitation: this is a Brazil-focused Investments CGU rate, not proof of the correct group-wide cost of equity.

## 4. Residual-Income Forecast & Discounting

Discounting uses the mid-year convention. Measured from 30 June 2026, the H2 2026 earnings midpoint is 0.25 years away; each full-year forecast is discounted to its mid-year. Ending book values reflect the no-distribution explicit-period assumption.

| Period | Opening Book | Net Income | Equity Charge | Residual Income | Ending Book | Discount Factor | PV of Residual Income |
|---|---:|---:|---:|---:|---:|---:|---:|
| H2 2026 | 13,249.7 | 2,240.0 | 1,093.8 | 1,146.2 | 15,489.7 | 0.962519 | 1,103.3 |
| FY2027 | 15,489.7 | 5,301.5 | 2,557.3 | 2,744.2 | 20,791.2 | 0.858295 | 2,355.3 |
| FY2028 | 20,791.2 | 6,283.3 | 3,432.6 | 2,850.7 | 27,074.6 | 0.736671 | 2,100.0 |
| FY2029 | 27,074.6 | 7,166.9 | 4,470.0 | 2,696.9 | 34,241.5 | 0.632281 | 1,705.2 |
| FY2030 | 34,241.5 | 7,952.3 | 5,653.3 | 2,299.1 | 42,193.8 | 0.542684 | 1,247.7 |

Sum of PV of explicit residual income: **US$8,511.5m**.

Executed calculation and raw output:

```text
$ /usr/local/Cellar/python@3.12/3.12.14/Frameworks/Python.framework/Versions/3.12/bin/python3.12 - <<'PY'
B0=13249.7; sh=4908.841; ke=0.1651; g=0.03; h1=1932.520
profits=[0.85*sh-h1,1.08*sh,1.28*sh,1.46*sh,1.62*sh]
periods=[0.5,1,1,1,1]; times=[.25,1,2,3,4]
labels=['H2 2026','FY2027','FY2028','FY2029','FY2030']
B=B0; pv=0
print('Residual-income model (US$m):')
print('period | BOP | NI | ROE | equity_charge | RI | EOP | DF | PV_RI')
for lab,ni,p,t in zip(labels,profits,periods,times):
    charge=ke*B*p; ri=ni-charge; Bnext=B+ni; df=(1+ke)**(-t); pvri=ri*df; pv+=pvri
    print(f'{lab} | {B:.1f} | {ni:.1f} | {ni/B/p:.2%} | {charge:.1f} | {ri:.1f} | {Bnext:.1f} | {df:.6f} | {pvri:.1f}')
    B=Bnext
ri_next=B*0.20-B*ke; tv=ri_next/(ke-g); pv_tv=tv*(1+ke)**(-4.5); equity=B0+pv+pv_tv
print(f'PV explicit RI={pv:.1f}; terminal RI FY2031={ri_next:.1f}; TV={tv:.1f}; PV TV={pv_tv:.1f}; equity={equity:.1f}; value/share={equity/sh:.2f}; TV%= {pv_tv/(pv+pv_tv):.1%}')
print('Sensitivity $/share:')
for roe in [.18,.20,.22]:
    row=[]
    for k in [.1551,.1651,.1751]:
        Bb=B0; pp=0
        for ni,p,t in zip(profits,periods,times):
            ri=ni-k*Bb*p; pp+=ri*(1+k)**(-t); Bb+=ni
        row.append(f'{(B0+pp+(roe-k)*Bb/(k-g)*(1+k)**(-4.5))/sh:.2f}')
    print(f'terminal ROE {roe:.0%}: ' + ' | '.join(row))
print('Cost of equity market check (not used):',4.45+7.59)
PY
Residual-income model (US$m):
period | BOP | NI | ROE | equity_charge | RI | EOP | DF | PV_RI
H2 2026 | 13249.7 | 2240.0 | 33.81% | 1093.8 | 1146.2 | 15489.7 | 0.962519 | 1103.3
FY2027 | 15489.7 | 5301.5 | 34.23% | 2557.3 | 2744.2 | 20791.2 | 0.858295 | 2355.3
FY2028 | 20791.2 | 6283.3 | 30.22% | 3432.6 | 2850.7 | 27074.6 | 0.736671 | 2100.0
FY2029 | 27074.6 | 7166.9 | 26.47% | 4470.0 | 2696.9 | 34241.5 | 0.632281 | 1705.2
FY2030 | 34241.5 | 7952.3 | 23.22% | 5653.3 | 2299.1 | 42193.8 | 0.542684 | 1247.7
PV explicit RI=8511.5; terminal RI FY2031=1472.6; TV=10899.8; PV TV=5480.0; equity=27241.2; value/share=5.55; TV%= 39.2%
Sensitivity $/share:
terminal ROE 18%: 5.50 | 4.91 | 4.40
terminal ROE 20%: 6.22 | 5.55 | 4.98
terminal ROE 22%: 6.94 | 6.19 | 5.55
Cost of equity market check (not used): 12.04
```

## 5. Continuing Value

Method and formula:

`CV_2030 = RI_2031 / (k_e − g_RI)`

`= [B_2030 × (terminal ROE − k_e)] / (k_e − g_RI)`

`= [42,193.8 × (20.0% − 16.51%)] / (16.51% − 3.0%) = US$10,899.8m`.

- Terminal residual income: **US$1,472.6m** in FY2031.
- Continuing value, undiscounted: **US$10,899.8m**.
- PV of continuing value: **US$5,480.0m**.
- Continuing value is **39.2% of total present value of residual income** and **20.1% of total equity value**. It is not terminal-dominated on the 75% threshold.

The terminal ROE fades from 34.2% in FY2027 to 20.0%, only 349bp over the 16.51% equity hurdle. A residual return is permitted because the upstream moat read is *Narrow moat — trajectory widening (provisional)*, not “No moat proven”; its 17.2% four-year IFRS ROE was only 68bp over the same hurdle, so a 20.0% terminal ROE is an analyst assumption rather than a proven durable result. The structural-runoff trigger is not met: business-quality rate-of-change/disruption is 50/100, above the ≤40 trigger. [Moat — NU, §§3, 5; Business Quality — NU, §1]

## 6. Equity Value Output

| Step | Value |
|---|---:|
| Opening book value | 13,249.7 |
| + PV of explicit residual income | 8,511.5 |
| + PV of continuing value | 5,480.0 |
| **= Equity value** | **27,241.2** |
| ÷ Fully diluted shares | 4,908.841m |
| **= Intrinsic value per NYSE NU share** | **US$5.55** |
| Current NYSE NU price, 2026-08-29 | US$14.30 |
| Model value versus current price | (61.2%) |

No debt, cash, minority-interest or EV bridge is added here: those are already part of the regulated lender’s book equity and balance-sheet economics. The filing-based strict net-cash bridge of US$7,811.0m is informational, not a cash amount that can be added to a banking residual-income valuation. [Price & Capital Structure — NU, §§4–5]

## 7. Sensitivity Grid (US$ per NYSE NU share)

Cost of equity across columns; terminal ROE down rows. Terminal residual-income growth is held at 3.0%.

| Terminal ROE \ Cost of Equity | 15.51% | 16.51% | 17.51% |
|---|---:|---:|---:|
| 22.0% | 6.94 | 6.19 | 5.55 |
| 20.0% | 6.22 | **5.55** | 4.98 |
| 18.0% | 5.50 | 4.91 | 4.40 |

The grid spans US$4.40–6.94 per share. It varies the two assumptions that determine continuing residual income; it does not give equal status to a cost of equity lower than the company’s filed hurdle.

## 8. Intrinsic Read

**Base intrinsic value is US$5.55 per NYSE NU share; the sensitivity grid gives US$4.40–6.94.** This is 61.2% below the pool-verified US$14.30 close on 29 August 2026, but it is a low-confidence equity cross-check rather than a rating: the discount rate comes from a Brazil-focused CGU, while FY2026 reported earnings include a material deferred-tax benefit with uncertain reversal timing. [Capital IQ Comps → Financial Data, subject row, as-of 2026-08-29; H1 FY2026 interim financial statements, Note 30, pp.36–37]

The dominant assumption is not near-term EPS; it is whether NU can sustain returns well above a 16.51% required equity return after its current credit-income and lower-credit-cost lift fades. The filed evidence shows both higher early delinquencies from risk expansion and ECL coverage rising to 16.86% at June 2026, so a terminal ROE materially above the 18–22% grid is not proven from available data. [Earnings Sensitivity — NU, §§2, 4; Earnings Quality — NU, §§3, 10]

Partial data: financial-company residual-income model used; no group-wide cost of equity, sourced NU beta, or forecast cash-tax reversal is available. Intrinsic confidence is capped at Low.
