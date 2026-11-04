# Downside Stress Test — GOOGL

Alphabet reports under U.S. GAAP in USD. All figures below are USD millions unless stated otherwise. EBITDA is a Capital IQ calculation from reported data, not management-adjusted EBITDA; Alphabet does not disclose a company EBITDA measure or adjustment reconciliation.

## 1. Base Case (today)

| Input | Value | Source |
|---|---:|---|
| Base EBITDA (cash-backed) | 185,516 LTM; CFO was 179,551, or 96.8% of EBITDA | [CIQ Financials→Income Statement “EBITDA” [LTM 12 months Sep-30-2026]; `ciq_facts.json`, `ltm_ebitda_m`; CIQ Financials→Cash Flow “Cash from Ops.” [LTM 12 months Sep-30-2026]; `ciq_facts.json`, `ltm_ocf_m`] |
| Net debt | 73,489 strict basis = 129,823 gross debt, including 3,705 finance leases, less 56,334 cash and equivalents; operating leases and marketable securities excluded | [Q3 FY2026 Form 10-Q, Consolidated Balance Sheets; Notes 4 and 6 (Leases and Debt)] |
| Net debt / EBITDA | 0.40x strict basis | 73,489 ÷ 185,516; [Q3 FY2026 Form 10-Q, Notes 4 and 6; CIQ Financials→Income Statement “EBITDA” [LTM Sep-30-2026]; `ciq_facts.json`, `ltm_ebitda_m`] |
| EBITDA / interest | 43.94x on a 4,222 gross-interest proxy, including estimated capitalised interest | [FY2025 Form 10-K, Other Income (Expense) note; Q3 FY2026 Form 10-Q, Other Income (Expense) note; `04_coverage-and-covenants.md`, §1] |
| Tightest covenant + threshold | Contractual covenant and threshold not disclosed. Sensitivity only: 4.5x maximum strict net leverage; 91.2% illustrative headroom | [Q3 FY2026 Form 10-Q, Note 6 (Credit Facility); `04_coverage-and-covenants.md`, §§2–3] |
| Next-12m obligations | 4,018 known uses outside FCF = 1,016 debt due + 3,002 currently declared common and preferred dividends; this is not a full forecast of purchase commitments | [Q3 FY2026 Form 10-Q, Note 6 (Debt); Note 11 (Dividends); `03_liquidity-runway.md`, §2] |
| Committed liquidity | 265,098 = 56,334 cash and equivalents + 208,764 marketable securities; excludes the 10,000 revolver because availability is undisclosed | [Q3 FY2026 Form 10-Q, Consolidated Balance Sheets; Note 6 (Credit Facility)] |
| Floating-rate debt (gross) | 3,386 direct contractual proxy, about 2.7% of 127,485 debt face value; swaps may raise or lower net exposure | [Q3 FY2026 Form 10-Q, Notes 3 and 6; `02_maturity-wall-and-refinancing.md`, §3] |
| Hedge coverage (if any) | Interest-rate swaps convert an undisclosed portion of fixed debt to floating; hedge notional and net floating exposure are not disclosed | [Q3 FY2026 Form 10-Q, Note 3 (Derivative Financial Instruments)] |
| Working-capital seasonality / peak build | Not disclosed. Stress uses the 10,869 increase in inventory from 31 December 2025 to 30 September 2026 as a labelled partial working-capital cash-outflow proxy, not as a disclosed seasonal peak | [FY2025 Form 10-K, Consolidated Balance Sheets; Q3 FY2026 Form 10-Q, Consolidated Balance Sheets; `06_earnings-quality.md`, §3] |

The reporting currency is USD. The 185,516 base is cash-backed at the CFO level, but not at the free-cash-flow level: LTM CFO less total capex was only 19,747 after 159,804 of capex. The CIQ sidecar's present 60.3x interest-coverage fact uses reported interest expense after capitalised interest; the 43.94x used here is the more conservative gross-interest proxy, so the two figures are definitionally different rather than conflicting. [CIQ Financials→Cash Flow / Income Statement [LTM Sep-30-2026]; `ciq_facts.json`, `ltm_ocf_m`, `ltm_ebitda_m`, `interest_coverage_x`; `04_coverage-and-covenants.md`, §1]

The deterministic CIQ balance-sheet read is 150,331 total debt and (114,767) net debt, meaning net cash on CIQ's broad, lease-inclusive basis. It reconciles to the filing read: CIQ includes 20,508 of operating-lease liabilities in debt and nets the full 265,098 cash-and-marketable-securities pool. This report instead uses the stricter filing-based 73,489 net-debt measure throughout, so the difference is definitional rather than a competing balance-sheet fact. [CIQ Financials→Balance Sheet “Total Debt” and “Net Debt” [Q3 Sep-30-2026]; `ciq_facts.json`, `total_debt_m`, `net_debt_m`; Q3 FY2026 Form 10-Q, Consolidated Balance Sheets; Note 4 (Leases)]

No material pending acquisition not reflected in the 30 September balance sheet was identified. Wiz and Intersect were closed in March 2026; no acquisition pro-forma adjustment is therefore made. The October 2026 Waymo 5,000 senior secured term-loan facility is not added because its draw status is not disclosed and it was not on the 30 September balance sheet. [Q3 FY2026 Form 10-Q, Notes 6 and 8 (Debt; Acquisitions and Divestitures)]

## 2. Stress Scenarios

The stressed FCF calculation is `FCF(h) = 19,747 − 185,516 × h × (1 − 16.8%)`, where `h` is the EBITDA haircut. It holds capex, cash interest and known financing uses fixed; 16.8% is the FY2025 effective tax rate. The liquidity gap is `known uses − (usable liquidity + stressed FCF)`; a negative gap is a surplus. The working-capital column adds the 10,869 inventory-build proxy. The rate column adds 67.7 of cash interest, equal to 3,386 direct floating-rate debt × 200bp, before any tax benefit or unknown swap effect. [FY2025 Form 10-K, Note 14 (Income Taxes); Q3 FY2026 Form 10-Q, Notes 3 and 6; `03_liquidity-runway.md`, §§2–3]

| Metric | Base | −30% EBITDA | −40% EBITDA | −60% EBITDA | −40% + WC shock | −40% + rates +200bp |
|---|---:|---:|---:|---:|---:|---:|
| EBITDA | 185,516 | 129,861 | 111,310 | 74,206 | 111,310 | 111,310 |
| Net debt / EBITDA | 0.40x | 0.57x | 0.66x | 0.99x | 0.66x | 0.66x |
| EBITDA / interest | 43.94x | 30.76x | 26.36x | 17.58x | 26.36x | 25.95x |
| Tightest covenant headroom | Not assessable contractually; +91.2% illustrative | Not assessable; +87.4% illustrative | Not assessable; +85.3% illustrative | Not assessable; +78.0% illustrative | Not assessable; +85.3% illustrative | Not assessable; +85.3% illustrative |
| Covenant breach? (Y/N) | Not assessable; N on illustrative case | Not assessable; N on illustrative case | Not assessable; N on illustrative case | Not assessable; N on illustrative case | Not assessable; N on illustrative case | Not assessable; N on illustrative case |
| 12-month liquidity gap | (280,827) surplus | (234,522) surplus | (219,087) surplus | (188,217) surplus | (208,218) surplus | (219,020) surplus |
| Survives without external action? (Y/N) | Y* | Y* | Y* | Y* | Y* | Y* |

\*On the matched FCF basis and known uses above. It is not a contractual-covenant conclusion, and it is not a full forecast of the 213,400 of disclosed purchase commitments due within 12 months.

The direct floating-rate proxy is small, but the actual economic rate exposure is not computable because the swap notional is undisclosed. The company is not classified as a deep commodity or cyclically calibrated name by the business-model input; the required −30%/−40%/−60% cases therefore remain the relevant set, with advertising demand and regulation as the main external risks rather than a demonstrated commodity trough. [Q3 FY2026 Form 10-Q, Note 3; `10_external-dependency.md`, §§1–3]

All scenarios assume zero management mitigation — this is a survival bound, not a forecast; the earnings module's realised-offset case (`earnings/07` §2) is the expected-outcome read.

**Executed calculation check (Bash/AWK; USD millions):**

```text
$ awk 'BEGIN {e=185516; nd=73489; i=4222; f=19747; t=.168; l=265098; o=4018; w=10869; r=3386*.02; split("0 .3 .4 .6",hs," "); for(n=1;n<=4;n++){h=hs[n]; se=e*(1-h); sf=f-e*h*(1-t); printf("haircut=%.0f%% EBITDA=%.1f leverage=%.3fx coverage=%.2fx leverage_headroom=%.1f%% gap=%.1f\\n",h*100,se,nd/se,se/i,(4.5-nd/se)/4.5*100,o-(l+sf))} h=.4; se=e*(1-h); sf=f-e*h*(1-t); printf("40%%+WC EBITDA=%.1f leverage=%.3fx coverage=%.2fx leverage_headroom=%.1f%% gap=%.1f\\n",se,nd/se,se/i,(4.5-nd/se)/4.5*100,(o+w)-(l+sf)); printf("40%%+200bp EBITDA=%.1f leverage=%.3fx coverage=%.2fx leverage_headroom=%.1f%% gap=%.1f\\n",se,nd/se,se/(i+r),(4.5-nd/se)/4.5*100,o-(l+sf-r)); printf("break_4.5x=%.1f%% liquidity=%.1f%% refi_6.0x=%.1f%% commitment_overlay_WC=%.1f%%\\n",(1-nd/(4.5*e))*100,(l+f-o)/(e*(1-t))*100,(1-nd/(6*e))*100,(l+f-o-213400-w)/(e*(1-t))*100)}'
haircut=0% EBITDA=185516.0 leverage=0.396x coverage=43.94x leverage_headroom=91.2% gap=-280827.0
haircut=30% EBITDA=129861.2 leverage=0.566x coverage=30.76x leverage_headroom=87.4% gap=-234522.2
haircut=40% EBITDA=111309.6 leverage=0.660x coverage=26.36x leverage_headroom=85.3% gap=-219087.3
haircut=60% EBITDA=74206.4 leverage=0.990x coverage=17.58x leverage_headroom=78.0% gap=-188217.4
40%+WC EBITDA=111309.6 leverage=0.660x coverage=26.36x leverage_headroom=85.3% gap=-208218.3
40%+200bp EBITDA=111309.6 leverage=0.660x coverage=25.95x leverage_headroom=85.3% gap=-219019.6
break_4.5x=91.2% liquidity=181.9% refi_6.0x=93.4% commitment_overlay_WC=36.6%
```

**Purchase-commitment overlay — not included in the headline gap.** The filing discloses 213,400 of material purchase commitments due within 12 months. The pool does not separate the amount that will be operating cost or capex already reflected in the FCF scaling from any incremental cash call; adding all of it to the FCF-based gap would double count an unknown amount. As a deliberately unmatched outer bound, adding the entire 213,400 plus the 10,869 WC proxy turns the −40% case into a 5,182 gap and solves to a 36.6% EBITDA decline. This is a data-limit bound, not a forecast or a claim that Alphabet breaks at 36.6%. [Q3 FY2026 Form 10-Q, Item 2 (Purchase Commitments and Other Contractual Obligations); `05_off-balance-sheet-and-contingencies.md`, §§1 and 5]

## 3. Break Points

| Break Point | EBITDA Decline That Triggers It |
|---|---:|
| Tightest covenant breaches | **Not assessable contractually.** Illustrative 4.5x maximum strict-net-leverage sensitivity: 91.2% decline |
| Committed liquidity exhausted within 12 months | **Does not exhaust on an EBITDA decline alone.** Calculated 181.9% decline is outside the possible 0–100% range |
| Net leverage exceeds 6.0x refi-market threshold | 93.4% decline; 6.0x is a labelled market-access sensitivity, not a disclosed covenant |

The illustrative MAX-covenant solve is direction-aware: `h = 1 − net debt ÷ (T × EBITDA) = 1 − 73,489 ÷ (4.5 × 185,516) = 91.2%`. The alternative illustrative MIN-coverage case is looser: `h = 1 − (T × interest) ÷ EBITDA = 1 − (3.0 × 4,222) ÷ 185,516 = 93.2%`. Neither is a real breach point because Alphabet does not disclose a maintenance threshold, covenant EBITDA definition, addback caps, springing trigger or cure rights. [Q3 FY2026 Form 10-Q, Note 6 (Credit Facility); `04_coverage-and-covenants.md`, §§2–3]

The liquidity solve uses usable broad liquidity and known uses: `h = (265,098 + 19,747 − 4,018) ÷ (185,516 × (1 − 16.8%)) = 181.9%`. A result above 100% means liquidity does not run out from an EBITDA decline alone under this matched-basis calculation. The 6.0x refi sensitivity is `h = 1 − 73,489 ÷ (6.0 × 185,516) = 93.4%`. The calculation output in Section 2 produced each result. [Q3 FY2026 Form 10-Q, Consolidated Balance Sheets; CIQ Financials→Income Statement / Cash Flow [LTM Sep-30-2026]; `ciq_facts.json`, `ltm_ebitda_m`, `ltm_ocf_m`]

## 4. Survival Read

On the matched FCF basis, Alphabet survives every required −30% to −60% EBITDA haircut without an equity raise, asset sale, waiver or new unsecured refinancing: strict net leverage reaches only 0.99x and the −60% case retains a 188,217 liquidity surplus. The known 12-month maturity is only 1,016, so a 12-month market closure does not force a refinancing; the undrawn 10,000 revolver is excluded because availability is not disclosed. [Q3 FY2026 Form 10-Q, Note 6 (Debt and Credit Facility); `02_maturity-wall-and-refinancing.md`, §§1 and 4]

The first modelled break is the noncontractual 4.5x leverage sensitivity at a 91.2% EBITDA fall, while actual covenant failure remains not assessable. The important limitation is not debt service: it is the 213,400 of purchase commitments due within 12 months, whose overlap with future operating cost and capex is not disclosed. If all were treated as incremental cash use, the unmatched −40% plus WC bound would need about 5,182 of external funding; that is a warning to obtain the commitment cash-flow split, not evidence that an ordinary 30–40% recession forces financing. [Q3 FY2026 Form 10-Q, Item 2 (Purchase Commitments and Other Contractual Obligations); `05_off-balance-sheet-and-contingencies.md`, §§1 and 5]
