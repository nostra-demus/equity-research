# Downside Stress Test — V

Visa Inc. reports in USD under U.S. GAAP and has a September fiscal year-end. Amounts are USD millions unless stated otherwise. This is a survival test, not a forecast and not a stock rating.

## 1. Base Case (today)

| Input | Value | Source |
|---|---:|---|
| Base EBITDA (cash-backed) | $28,338m LTM GAAP-derived EBITDA: operating income plus depreciation and amortization. LTM CFO was $22,580m, or 79.7% of this EBITDA; Visa does not report company-defined adjusted EBITDA. | `[Visa FY2025 Form 10-K, Consolidated Statements of Operations and Cash Flows, pp.60, 65; Visa Q3 FY2026 Form 10-Q, Consolidated Statements of Operations and Cash Flows, pp.4, 10; analyses/V_2026-09-23/earnings/06_earnings-quality.md, §2]` |
| Net debt | $11,499m **strict** = $23,858m gross debt carrying value − $12,359m cash and equivalents. | `[Visa Q3 FY2026 Form 10-Q, Consolidated Balance Sheets and Note 8 (Debt), pp.4, 17–18]` |
| Net debt / EBITDA | 0.41x strict = $11,499m / $28,338m. | `[Visa Q3 FY2026 Form 10-Q, pp.4, 17–18; calculation]` |
| EBITDA / interest | 36.52x = $28,338m / $776m gross LTM interest expense. | `[Visa FY2025 Form 10-K, Consolidated Statements of Operations, p.60; Visa Q3 FY2026 Form 10-Q, Consolidated Statements of Operations, p.4; calculation]` |
| Tightest covenant + threshold | Contractual maintenance threshold **Not assessable**. The filing says Visa complied, but the frozen pool lacks the revolver agreement, lender EBITDA definition, addback caps, springing trigger and numerical test. A ≤4.0x maximum strict-net-leverage test is used below only as a labelled market-convention illustration. | `[Visa Q3 FY2026 Form 10-Q, Note 8 (Debt), p.18; Visa FY2025 Form 10-K, Note 10 (Credit Facility), p.84; data/V/manifest.json, frozen inventory]` |
| Next-12m obligations | $4,273m scheduled/declared base = $3,000m debt principal due within 12 months + about $1,273m for the already declared $0.67 dividend. The dividend total is a disclosed-rate proxy, not a full-year commitment. | `[Visa Q3 FY2026 Form 10-Q, Note 8 (Debt), pp.17–18; Note 11 (Stockholders’ Equity), pp.22–23; analyses/V_2026-09-23/balance-sheet-survival/03_liquidity-runway.md, §2]` |
| Committed liquidity | $13,792m usable = $12,359m cash + $1,433m current investment securities. It excludes $6,409m restricted cash/collateral and the $7,000m revolver because current availability is not disclosed. | `[Visa Q3 FY2026 Form 10-Q, Consolidated Balance Sheets and Notes 4 and 6, pp.4, 14–16; Visa FY2025 Form 10-K, Note 10, p.84]` |
| Floating-rate debt (gross) | $1,500m commercial paper, 6.2% of $24,131m principal, at a 3.77% June 30 weighted-average rate. | `[Visa Q3 FY2026 Form 10-Q, Note 8 (Debt), pp.17–18]` |
| Hedge coverage (if any) | Visa has swaps on an undisclosed portion of senior notes. The economic fixed/floating mix and hedge notional are not assessable. | `[Visa Q3 FY2026 Form 10-Q, Note 8 (Debt), p.18]` |
| Working-capital seasonality / peak build | No disclosed seasonal cash build. The stress below uses a $3,621m repeat of the adverse nine-month year-on-year movement in operating assets and liabilities as a labelled shock; it is not a disclosed seasonal peak. | `[Visa Q3 FY2026 Form 10-Q, Consolidated Statements of Cash Flows, p.10; analyses/V_2026-09-23/earnings/06_earnings-quality.md, §10]` |

The $28,338m base is deliberately below the $31,094m CIQ LTM EBITDA read. The latter is a vendor special-item-excluding series, while the filing-derived measure is the conservative numerator used here. The CIQ sidecar reports $23,858m total debt, $10,066m broad net debt and $31,094m LTM EBITDA; the debt read reconciles, but the broad basis and different EBITDA definition are not substituted into this report. `[data/V/ciq_facts.json, \`total_debt_m\`, \`net_debt_m\` and \`ltm_ebitda_m\`, LTM/Jun-30-2026 — CIQ vendor basis]`

No material acquisition pending close is identified in the business-model capital-allocation output or the Q3 filing; the stress therefore uses the reported balance sheet rather than a pro-forma acquisition base. `[analyses/V_2026-09-23/business-model/11_capital-allocation-governance.md, §1; Visa Q3 FY2026 Form 10-Q, Note 2, p.11]`

## 2. Stress Scenarios

The FCF scaling is `FCF(h) = $21,013m − (0.797 × $28,338m × h)`: the 79.7% LTM CFO/EBITDA conversion is applied to lost EBITDA, while cash interest and total capex remain fixed. The liquidity-gap row is `scheduled/declared uses − (usable liquidity + stressed FCF)`; a negative number is a surplus. EBITDA-only scenarios hold the June 30 strict net debt constant. The working-capital shock reduces cash by $3,621m and therefore raises strict net debt by the same amount; the rate shock adds $30m annual cash interest and strict net debt (`2.00% × $1,500m`). `[Visa FY2025 Form 10-K, Consolidated Statements of Cash Flows, p.65; Visa Q3 FY2026 Form 10-Q, Consolidated Statements of Cash Flows and Note 8, pp.10, 17–18; calculation]`

| Metric | Base | −30% EBITDA | −40% EBITDA | −60% EBITDA | −40% + WC shock | −40% + rates +200bp |
|---|---:|---:|---:|---:|---:|---:|
| EBITDA | $28,338m | $19,837m | $17,003m | $11,335m | $17,003m | $17,003m |
| Net debt / EBITDA | 0.41x | 0.58x | 0.68x | 1.01x | 0.89x | 0.68x |
| EBITDA / interest | 36.52x | 25.56x | 21.91x | 14.61x | 21.91x | 21.10x |
| Tightest covenant headroom | +89.9%* | +85.5%* | +83.1%* | +74.6%* | +77.8%* | +83.0%* |
| Covenant breach? | No* | No* | No* | No* | No* | No* |
| 12-month liquidity gap | $(30,532)m surplus | $(23,756)m surplus | $(21,498)m surplus | $(16,981)m surplus | $(17,877)m surplus | $(21,468)m surplus |
| Survives without external action? | Yes† | Yes† | Yes† | Yes† | Yes† | Yes† |

\* The headroom and breach cells use the labelled, non-contractual 4.0x maximum strict-net-leverage illustration: `(4.0x − stressed net debt / EBITDA) / 4.0x`. Actual covenant headroom and a contractual breach cannot be determined from the admitted documents. In the working-capital column, the $3,621m cash outflow is an incremental source/use and raises strict net debt to $15,120m. In the rate column, the $30m increase applies only to disclosed commercial paper; undisclosed senior-note swaps mean it does not represent a full economic rate sensitivity.

† This is the scheduled-debt-and-declared-dividend test, with no new unsecured refinancing and no revolver draw. It does not quantify a loss on the settlement guarantee or unestimated litigation outcomes, so it is not evidence that those exposures cannot cause a liquidity event. The external-dependency work describes Visa as partly externally driven rather than a deep commodity/cycle name; no history-calibrated extra EBITDA haircut is added. `[analyses/V_2026-09-23/business-model/10_external-dependency.md, §§1, 3; Visa Q3 FY2026 Form 10-Q, Note 9 (Settlement Guarantee Management), p.19; Note 16 (Legal Matters), pp.24–27]`

All scenarios assume zero management mitigation — this is a survival bound, not a forecast; the earnings module's realised-offset case (`earnings/07` §2) is the expected-outcome read. That output was not available in this run. No price increase, cost programme, hedge benefit, discretionary-capex cut or dividend cut is credited.

**Cash-return continuation bound.** The scheduled-use table does not treat discretionary capital returns as contractual obligations. If Visa instead keeps its latest $21,638m repurchase pace and $4,998m ordinary dividend run-rate, total 12-month uses become $29,636m = $3,000m maturity + $4,998m dividends + $21,638m buybacks. On that intentionally harsher no-cash-return-mitigation bound, liquidity exhausts at a 22.9% EBITDA decline; the −30%, −40% and −60% cases have 12-month shortfalls of $1,607m, $3,865m and $8,382m, respectively. This is a voluntary capital-allocation break, not a covenant or scheduled-maturity failure: suspending the corresponding amount of buybacks avoids it without equity, asset sales or a waiver. `[Visa FY2025 Form 10-K, Consolidated Statements of Cash Flows, p.65; Visa Q3 FY2026 Form 10-Q, Consolidated Statements of Cash Flows, p.10; analyses/V_2026-09-23/balance-sheet-survival/03_liquidity-runway.md, §4; calculation]`

## 3. Break Points

| Break Point | EBITDA Decline That Triggers It |
|---|---:|
| Tightest covenant breaches | **Not assessable contractually.** Illustrative 4.0x maximum strict-net-leverage test: **89.9%** decline. |
| Committed liquidity exhausted within 12 months | **Does not exhaust on an EBITDA decline alone.** Scheduled/declared-use solve is 135.2%, beyond a 100% decline. The non-contractual cash-return-continuation bound is 22.9%. |
| Net leverage exceeds 6.0x | **93.2%** decline; 6.0x is a labelled refinancing-market illustration, not Visa guidance or a covenant. |

The contractual covenant cannot be solved because its actual metric, direction, threshold and lender-defined EBITDA are not disclosed. The illustrative maximum-leverage solve is direction-correct for a ceiling: `h = 1 − net debt ÷ (T × EBITDA) = 1 − $11,499m ÷ (4.0 × $28,338m) = 89.9%`. For context only, a 3.0x minimum-coverage illustration would break at `h = 1 − (3.0 × $776m) ÷ $28,338m = 91.8%`; it is not the identified tightest covenant. `[Assumption, not from filings: module partial-data rule; Visa Q3 FY2026 Form 10-Q, pp.4, 17–18; calculation]`

The scheduled/declared liquidity solve is `h = [$13,792m + $21,013m − $4,273m] ÷ (0.797 × $28,338m) = 135.2%`. At a 100% EBITDA decline, this scaling gives FCF of negative $1,572m but still leaves a $7,947m scheduled-use surplus from beginning usable liquidity; it therefore does not create a false 100% break point. The 6.0x refinancing illustration uses `h = 1 − $11,499m ÷ (6.0 × $28,338m) = 93.2%`. `[Visa Q3 FY2026 Form 10-Q, pp.4, 10, 14–18; calculation]`

Calculation check (Bash executed):

```text
$ awk 'BEGIN {E=28338; ND=11499; I=776; L=13792; U=4273; F=21013; C=.797; W=3621; R=30; T=4; h[0]=0;h[1]=.3;h[2]=.4;h[3]=.6;h[4]=.4;h[5]=.4;name[0]="base";name[1]="-30";name[2]="-40";name[3]="-60";name[4]="-40+WC";name[5]="-40+200bp";for(s=0;s<6;s++){nd=ND+(s==4?W:(s==5?R:0));i=I+(s==5?R:0);u=U+(s==4?W:0);f=F-C*E*h[s]-(s==5?R:0);eb=E*(1-h[s]);printf "%s EBITDA=%.1f ND/EBITDA=%.3fx EBITDA/I=%.2fx H=%.1f%% gap=%+.1f\n",name[s],eb,nd/eb,eb/i,(T-nd/eb)/T*100,u-L-f}printf "covenant_h=%.1f%% liquidity_h=%.1f%% refi6x_h=%.1f%% mincov3x_h=%.1f%%\n",(1-ND/(T*E))*100,(L+F-U)/(C*E)*100,(1-ND/(6*E))*100,(1-3*I/E)*100}'
base EBITDA=28338.0 ND/EBITDA=0.406x EBITDA/I=36.52x H=89.9% gap=-30532.0
-30 EBITDA=19836.6 ND/EBITDA=0.580x EBITDA/I=25.56x H=85.5% gap=-23756.4
-40 EBITDA=17002.8 ND/EBITDA=0.676x EBITDA/I=21.91x H=83.1% gap=-21497.8
-60 EBITDA=11335.2 ND/EBITDA=1.014x EBITDA/I=14.61x H=74.6% gap=-16980.8
-40+WC EBITDA=17002.8 ND/EBITDA=0.889x EBITDA/I=21.91x H=77.8% gap=-17876.8
-40+200bp EBITDA=17002.8 ND/EBITDA=0.678x EBITDA/I=21.10x H=83.0% gap=-21467.8
covenant_h=89.9% liquidity_h=135.2% refi6x_h=93.2% mincov3x_h=91.8%
```

The cash-return-continuation solve was also executed: `h = [$13,792m + $21,013m − ($3,000m + $4,998m + $21,638m)] ÷ (0.797 × $28,338m) = 22.9%`.

## 4. Survival Read

On scheduled debt and the declared dividend, the structure does not break at a 30–60% EBITDA decline: strict net leverage reaches only 1.01x and EBITDA/interest remains 14.61x at −60%, while the market-closure test retains a $16,981m 12-month surplus. No new unsecured refinancing is assumed, and the undisclosed-availability revolver is excluded; Visa can meet the $3,000m scheduled debt wall from cash and stressed FCF in each listed case. `[Visa Q3 FY2026 Form 10-Q, Notes 4 and 8, pp.14, 17–18; calculation]`

The first quantified issue is not debt service or the illustrative leverage covenant. It is cash policy: continuing the latest $21,638m annual repurchase pace together with normal dividends would exhaust usable liquidity after a 22.9% EBITDA fall. In that bound Visa needs to stop buybacks, not raise equity, sell distressed assets or obtain a waiver; calling the capital-return pause a financing rescue would overstate the risk. `[Visa FY2025 Form 10-K, Consolidated Statements of Cash Flows, p.65; Visa Q3 FY2026 Form 10-Q, Consolidated Statements of Cash Flows, p.10; calculation]`

The unquantified risk that can overturn this read is a settlement-guarantee or legal cash call: Visa reports $168.6bn maximum daily gross settlement exposure, $9.5bn collateral, and no determinable future guarantee obligation or litigation-loss range. That is not $168.6bn of debt and cannot be inserted into the model as a loss; it means the observed debt-service cushion does not prove immunity to an exceptional liquidity event. Contractual covenant resilience remains **Not assessable** until the actual credit agreement and covenant definitions are available. `[Visa Q3 FY2026 Form 10-Q, Note 9, p.19; Note 16, pp.24–27]`
