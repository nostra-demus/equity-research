# Downside Stress Test — AKAM

All figures are USD millions under U.S. GAAP unless stated otherwise. EBITDA is GAAP-derived operating profit before interest, tax, depreciation and amortization; it is not Akamai's company-defined Adjusted EBITDA. The base uses LTM EBITDA of $1,184.1m and LTM FCF of $629.9m, both cash-backed in the limited sense that LTM CFO was $1,447.2m. That cash conversion still contains recurring stock-based compensation and a rising working-capital outflow, so adjusted EBITDA is not substituted. [FY2025 Form 10-K, Consolidated Statements of Income and Cash Flows, pp.54–56; Q2 FY2026 Form 10-Q, Statements of Income and Cash Flows, pp.5, 7–8]

## 1. Base Case (today)

The 30 June balance sheet predates the July 2026 LayerX acquisition. The filing says Akamai paid approximately $205.0m cash, subject to post-closing adjustments, but does not disclose LayerX's cash, debt, interest expense or EBITDA. I therefore use a **known-component pro forma**: reported strict net debt plus the $205.0m cash consideration, no target EBITDA contribution, and usable liquidity less the same cash outflow. This is not a complete acquisition pro forma; the actual numerator and denominator could each move when target financial information is available. [Q2 FY2026 Form 10-Q, Note 6 (Acquisition)]

Management said the deal should have no material full-year FY26 revenue impact and should reduce non-GAAP EPS by about $0.12 across Q3–Q4. That does not quantify EBITDA, target net debt or target cash, but it gives no basis to add EBITDA to the survival denominator. [Q2 FY2026 earnings call, CFO prepared remarks]

| Input | Value | Source |
|---|---:|---|
| Base EBITDA (cash-backed) | $1,184.1 LTM GAAP-derived | FY25 $1,275.6 − H1 FY25 $655.5 + H1 FY26 $564.1. LTM CFO of $1,447.2m and FCF of $629.9m support the cash-backed read, with SBC/working-capital qualifiers. [FY2025 Form 10-K, pp.54–56; Q2 FY2026 Form 10-Q, pp.5, 7–8] |
| Net debt | $6,287.6 known-component pro forma, **strict** basis = reported $6,082.6 strict + $205.0 LayerX cash consideration | Strict reported net debt is $7,562.8 debt carrying value − $1,480.3 cash. Target net debt/cash is not disclosed and is omitted, not assumed to be zero. [Q2 FY2026 Form 10-Q, Condensed Consolidated Balance Sheets, pp.3–4; Note 6 (Acquisition); Note 7 (Debt), pp.17–20] |
| Net debt / EBITDA | 5.31x = $6,287.6 / $1,184.1 | Calculation from the stated rows. A FY23–FY25 average EBITDA of $1,221.8m gives a 5.15x normalised proxy, not a proven cycle midpoint. A complete pro-forma ratio is `(6,287.6 + target net debt − target cash) / (1,184.1 + target EBITDA)`; no defensible numeric range can be bracketed while all three target inputs are undisclosed. [FY2025 Form 10-K, Consolidated Statements of Income, p.54; Q2 FY2026 Form 10-Q, p.5; Q2 FY2026 earnings call, CFO prepared remarks] |
| EBITDA / interest | 35.73x = $1,184.1 / $33.1 LTM gross interest expense | [FY2025 Form 10-K, Consolidated Statements of Income, p.54; Q2 FY2026 Form 10-Q, Statements of Income, p.5; Note 7 (Interest Expense), p.20] |
| Tightest covenant + threshold | Maximum consolidated leverage ratio; threshold, debt numerator, covenant EBITDA definition, trigger and cure rights are not disclosed | The company reported compliance at 30 June, but that does not quantify headroom. [Q2 FY2026 Form 10-Q, Note 7 (Revolving Credit Facilities), pp.19–20] |
| Next-12m obligations | $1,150.0 scheduled principal: 0.375% 2027 convertible notes due 1 Sep. 2027 | The $1,725.0m 2033 Notes are a separate conversion contingency, not a scheduled maturity. [Q2 FY2026 Form 10-Q, Note 7 (Debt), pp.17–19] |
| Committed liquidity | $4,150.4 pro forma = reported $4,355.4 ($1,480.3 cash + $1,875.1 current marketable securities + $1,000.0 undrawn committed revolver) − $205.0 LayerX cash payment | The $150.0m 2025 facility is uncommitted and excluded. The $1.0bn revolver was undrawn, and the Capital IQ capital-structure workbook reports $1.0bn undrawn availability. [Q2 FY2026 Form 10-Q, Condensed Consolidated Balance Sheets, p.3; Note 7 (Debt), pp.19–20; Capital IQ Financials → Capital Structure Summary, 30 Jun. 2026 filing column — vendor basis] |
| Floating-rate debt (gross) | $0.0 drawn; all $7,640.0 principal of notes is fixed-rate | The undrawn revolver would float if used. [Q2 FY2026 Form 10-Q, Note 7 (Debt), pp.17–20] |
| Hedge coverage (if any) | Not applicable to the drawn note stack; no debt hedge is needed for the fixed-rate notes | [Q2 FY2026 Form 10-Q, Note 7 (Debt), pp.17–20] |
| Working-capital seasonality / peak build | Peak build not disclosed. H1 FY26 operating working capital used $198.3, versus $132.7 in H1 FY25; $198.3 is used only as an incremental stress shock, not as a proven seasonal peak. | [Q2 FY2026 Form 10-Q, Statements of Cash Flows, p.7; Item 2, Cash Provided by Operating Activities] |

The CIQ sidecar confirms LTM CFO of $1,447.2m, matching the filing build. It reports $9,339.0m total debt, $4,722.7m net debt and $1,079.9m EBITDA, rather than this report's $7,562.8m debt carrying value, $6,082.6m reported strict net debt and $1,184.1m GAAP-derived EBITDA. The vendor debt includes $1,776.2m operating leases and its net-debt figure also nets cash plus marketable securities; its EBITDA definition is different. Those are material basis differences, so the filing-based strict series remains the stress anchor. [CIQ Financials → Cash Flow, “Cash from Ops.”, LTM Jun-30-2026; CIQ Financials → Balance Sheet, “Total Debt” and “Net Debt”, Jun-30-2026 — vendor basis; CIQ Financials → Income Statement, “EBITDA”, LTM Jun-30-2026 — vendor basis; `ciq_facts.json`, `ltm_ocf_m`, `total_debt_m`, `net_debt_m`, and `ltm_ebitda_m`, present]

The business is in an investment transition, not identified as a deep commodity or cyclically calibrated name in the cross-module work; no extra historical-trough haircut is added. Costs related to data-centre capacity and customer IT spending are material, but a historic EBITDA peak-to-trough range is not established in the available record. [Q2 FY2026 Form 10-Q, Item 2, pp.30–34; Business-model External Dependency, §§1–3]

## 2. Stress Scenarios

All cases assume the September 2027 $1,150.0m maturity is paid from existing liquidity: no new unsecured refinancing for 12 months. They use the known-component LayerX pro forma above. For the working-capital case, the $198.3m is an incremental cash outflow; it reduces both FCF and cash, so strict net debt rises by $198.3m in that column.

FCF scaling is a stated assumption, not a filing forecast: `FCF(h) = $629.879 − $1,184.094 × h × (1 − 25%)`, where `h` is the EBITDA haircut. The 25% is FY2025's $150.4m tax expense divided by $602.4m pretax income. It holds cash interest, total capex and lease cash payments fixed; it gives no credit for price, cost, hedge, capex or dividend mitigation. The rate case has no effect because there is no drawn floating-rate debt and no revolver draw is required. [FY2025 Form 10-K, Consolidated Statements of Income, p.54; Q2 FY2026 Form 10-Q, Note 7 (Debt), pp.17–20]

| Metric | Base | −30% EBITDA | −40% EBITDA | −60% EBITDA | −40% + WC shock | −40% + rates +200bp |
|---|---:|---:|---:|---:|---:|---:|
| EBITDA | $1,184.1 | $828.9 | $710.5 | $473.6 | $710.5 | $710.5 |
| Net debt / EBITDA | 5.31x | 7.59x | 8.85x | 13.28x | 9.13x | 8.85x |
| EBITDA / interest | 35.73x | 25.01x | 21.44x | 14.29x | 21.44x | 21.44x — not applicable; $0 drawn floating debt |
| Tightest covenant headroom | Not assessable | Not assessable | Not assessable | Not assessable | Not assessable | Not assessable |
| Covenant breach? (Y/N) | Not assessable | Not assessable | Not assessable | Not assessable | Not assessable | Not assessable |
| 12-month liquidity gap (uses − sources) | $(3,630.3) surplus | $(3,363.9) surplus | $(3,275.1) surplus | $(3,097.4) surplus | $(3,076.7) surplus | $(3,275.1) surplus |
| Survives without external action? | Y, on known components | Y, on known components | Y, on known components | Y, on known components | Y, on known components | Y, on known components; rate shock has $0 effect |

The liquidity-gap row is `scheduled maturity − (usable liquidity + stressed FCF)`; a negative number is a surplus. Covenant rows are not replaced with an assumed market covenant because `04` supplied no labeled threshold, covenant EBITDA definition or debt numerator. The reported compliance statement alone cannot show a breach point. [Q2 FY2026 Form 10-Q, Note 7 (Revolving Credit Facilities), pp.19–20]

All scenarios assume zero management mitigation — this is a survival bound, not a forecast; the earnings module's realised-offset case (`earnings/07` §2) is the expected-outcome read.

Calculation audit — executed Bash command using the table inputs:

```bash
awk 'BEGIN {
  E=1184.094; ND=6082.571+205.0; I=33.143; FCF=629.879;
  L=4355.4-205.0; O=1150.0; tax=0.25; WC=198.332;
  n=6; names[1]="Base"; h[1]=0; w[1]=0; names[2]="-30%"; h[2]=.30; w[2]=0;
  names[3]="-40%"; h[3]=.40; w[3]=0; names[4]="-60%"; h[4]=.60; w[4]=0;
  names[5]="-40%+WC"; h[5]=.40; w[5]=WC; names[6]="-40%+rates"; h[6]=.40; w[6]=0;
  for(i=1;i<=n;i++) { e=E*(1-h[i]); nd=ND+w[i]; fcf=FCF-E*h[i]*(1-tax)-w[i]; gap=O-(L+fcf); printf "%-10s EBITDA %.3f; ND/EBITDA %.3fx; coverage %.3fx; FCF %.3f; gap %.3f\n", names[i],e,nd/e,e/I,fcf,gap }
  printf "Liquidity h %.6f; 6x leverage h %.6f\n", (L+FCF-O)/(E*(1-tax)), 1-ND/(6*E)
}'
```

```text
Base       EBITDA 1184.094; ND/EBITDA 5.310x; coverage 35.727x; FCF 629.879; gap -3630.279
-30%       EBITDA 828.866; ND/EBITDA 7.586x; coverage 25.009x; FCF 363.458; gap -3363.858
-40%       EBITDA 710.456; ND/EBITDA 8.850x; coverage 21.436x; FCF 274.651; gap -3275.051
-60%       EBITDA 473.638; ND/EBITDA 13.275x; coverage 14.291x; FCF 97.037; gap -3097.437
-40%+WC    EBITDA 710.456; ND/EBITDA 9.129x; coverage 21.436x; FCF 76.319; gap -3076.719
-40%+rates EBITDA 710.456; ND/EBITDA 8.850x; coverage 21.436x; FCF 274.651; gap -3275.051
Liquidity h 4.087827; 6x leverage h 0.114996
```

## 3. Break Points

| Break Point | EBITDA Decline That Triggers It |
|---|---:|
| Tightest covenant breaches | **Not assessable.** The filing identifies a maximum consolidated leverage covenant but not its threshold, numerator or Covenant EBITDA. [Q2 FY2026 Form 10-Q, Note 7 (Revolving Credit Facilities), pp.19–20] |
| Committed liquidity exhausted within 12 months | **Does not exhaust on an EBITDA decline alone.** Mechanical solve is 408.8%, above a 100% EBITDA decline. |
| Net leverage exceeds 6.0x | **11.5% decline.** This is an analyst monitoring threshold for refinancing, not a disclosed covenant. |

The covenant formula for a maximum leverage test is `h = 1 − debt metric / (T × EBITDA)`. Here both `T` and the debt metric are undisclosed, so solving it would fabricate precision. The liquidity solve is `h = ($4,150.4 + $629.879 − $1,150.0) / ($1,184.094 × 75%) = 4.0878`, or 408.8%; at a 100% decline the model still has $2,742.2m surplus against the scheduled maturity. The 6.0x monitoring solve is `h = 1 − $6,287.571 / (6.0 × $1,184.094) = 11.5%`. [Q2 FY2026 Form 10-Q, Condensed Consolidated Balance Sheets, p.3; Note 6 (Acquisition); Note 7 (Debt), pp.17–20; calculation from stated rows]

The 2033 conversion right is the material unmodeled timing risk. The notes were convertible in Q3 FY26; none had been submitted by the filing date, and post-filing status is not in the frozen evidence. If all $1,725.0m of principal converted alongside the $1,150.0m scheduled maturity, the $2,875.0m use would still leave a $1,372.4m surplus in the −60% case including the committed revolver, or a $372.4m surplus using only cash plus current marketable securities. This is a calculated liquidity sensitivity, not a statement that conversion will occur. [Q2 FY2026 Form 10-Q, Note 7 (Conversion Rights of the Notes), pp.17–18; calculation from stated rows]

## 4. Survival Read

On the known-component LayerX pro forma, AKAM survives the modeled 30–60% EBITDA decline and a 12-month closure of unsecured refinancing markets: even the −60% case has a $3.10bn scheduled-maturity liquidity surplus. The first modeled warning is refinancing leverage, not cash: strict net leverage rises above the labeled 6.0x monitoring level after an 11.5% EBITDA decline and reaches 13.28x at −60%; cash interest coverage remains 14.29x because the existing $7.64bn note principal is fixed-rate and mostly zero- or low-coupon. [Q2 FY2026 Form 10-Q, Note 7 (Debt), pp.17–20; calculation audit above]

The actual covenant break point is not proven because the credit agreement's threshold and calculation rules are absent. That missing document, plus LayerX's debt, cash and EBITDA, is more valuable than a guessed covenant. The company does not need an equity raise, distressed asset sale or waiver in these cash tests, but a deeper earnings decline would leave it dependent on maintaining a very high leverage profile and on the undisclosed covenant terms rather than on a lack of cash. [Q2 FY2026 Form 10-Q, Note 6 (Acquisition); Note 7 (Revolving Credit Facilities), pp.19–20]

Partial data: covenant threshold, covenant EBITDA definition, debt numerator, cure rights, and LayerX debt/cash/EBITDA are not disclosed in the frozen pool. Covenant headroom and its EBITDA breach point are therefore Not assessable; the acquisition stress is a known-component pro forma, not a complete target pro forma.
