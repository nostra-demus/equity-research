# Downside Stress Test — BURL

## 1. Base Case (today)

Burlington Stores, Inc. is a U.S. GAAP operating retailer. Amounts are USD millions and balance-sheet inputs are as of 1 August 2026; flow inputs are LTM to that date. The stress base uses $1,360.7m of Capital IQ standard EBITDA, rather than company-defined adjusted EBITDA. It is cash-backed at the CFO level: LTM CFO was $1,415.5m, though normalised FCF is only $357.0m after removing the $55.5m tariff-refund cash benefit. [ciq_facts.json, CIQ Financials→Income Statement `EBITDA` and Cash Flow `Cash from Ops.` [LTM 2026-08-01] — vendor export; data/BURL/Burlington_Stores_Inc_-_Form_10-Q(Aug-27-2026).doc, Q2 FY2026, p.20 and MD&A—Liquidity and Capital Resources, p.30]

| Input | Value | Source |
|---|---:|---|
| Base EBITDA (cash-backed) | 1,360.7 | CIQ standard LTM EBITDA; not a BURL-reported GAAP subtotal. LTM CFO of $1,415.5m exceeds it. [ciq_facts.json, CIQ Financials→Income Statement `EBITDA` and Cash Flow `Cash from Ops.` [LTM 2026-08-01] — vendor export] |
| Net debt | 1,215.8 strict | `$1,919.5m` financial gross debt less `$703.7m` cash and equivalents. This canonical strict basis includes finance leases and excludes operating leases. [data/BURL/Burlington_Stores_Inc_-_Form_10-Q(Aug-27-2026).doc, Q2 FY2026, pp.5, 10, 12–13; balance-sheet-survival/01_capital-structure-and-leverage, §§1, 4] |
| Net debt / EBITDA | 0.89x | `$1,215.8m ÷ $1,360.7m`; strict net debt divided by CIQ standard LTM EBITDA. |
| EBITDA / interest | 18.4x | `$1,360.7m ÷ $74.1m` gross LTM interest expense. [ciq_facts.json, CIQ Financials→Income Statement `EBITDA ÷ Interest Expense` [LTM 2026-08-01] — vendor export; balance-sheet-survival/04_coverage-and-covenants, §1] |
| Tightest covenant + threshold | Not assessable contractually | No maintenance threshold, current covenant calculation, covenant-EBITDA definition, addback cap, springing trigger or cure right is disclosed. A 4.0x maximum **strict net-leverage** test is used below solely as the conservative end of `04`'s labelled generic 4.0–4.5x illustration; it is not BURL's disclosed covenant. [data/BURL/Burlington_Stores_Inc_-_Form_10-Q(Aug-27-2026).doc, Q2 FY2026, Note 4, pp.12–14; balance-sheet-survival/04_coverage-and-covenants, §§2–3] |
| Next-12m obligations | 20.1 | `$17.5m` Term Loan amortisation plus `$2.6m` current finance-lease liability. [data/BURL/Burlington_Stores_Inc_-_Form_10-Q(Aug-27-2026).doc, Q2 FY2026, Note 4, p.12; Note 3, p.10; balance-sheet-survival/02_maturity-wall-and-refinancing, §1] |
| Committed liquidity | 1,645.7 | `$703.7m` cash + `$942.0m` disclosed ABL availability. The ABL is subject to its borrowing base and is not cash in hand. [data/BURL/Burlington_Stores_Inc_-_Form_10-Q(Aug-27-2026).doc, Q2 FY2026, p.5; Note 4, pp.13–14] |
| Floating-rate debt (gross) | 1,711.7 | Term Loan Facility is floating-rate at 5.5% at 1 August 2026. [data/BURL/Burlington_Stores_Inc_-_Form_10-Q(Aug-27-2026).doc, Q2 FY2026, Note 4, pp.12–13] |
| Hedge coverage | 1,100.0 notional | Interest-rate swaps hedge this Term Loan variable-rate exposure through 24 September 2031; residual floating exposure is `$611.7m`. [data/BURL/Burlington_Stores_Inc_-_Form_10-Q(Aug-27-2026).doc, Q2 FY2026, Note 5, p.14; balance-sheet-survival/02_maturity-wall-and-refinancing, §3] |
| Working-capital seasonality / peak build | Peak build not disclosed | Working capital was `$380.3m` at 1 August, while Q4 produced 31.5% of FY2023–FY2025 annual revenue on average. The filing does not disclose a matched peak build; the working-capital shock below is therefore an assumption. [data/BURL/Burlington_Stores_Inc_-_Form_10-Q(Aug-27-2026).doc, Q2 FY2026, MD&A—Liquidity and Capital Resources, p.30; data/BURL/Burlington_Stores_Inc_-_Form_10-K(Mar-19-2026).doc, FY2025, Item 1—Seasonality, p.5] |

The $5,202.4m CIQ net-debt figure is not used in the stress base: it includes the $3,992.6m U.S.-GAAP operating-lease liability. That is a valid lease-inclusive vendor obligation measure, but not strict or broad §15 net debt. Operating leases remain a material fixed-cost risk; normal operating-lease cash payments are already within CFO/FCF and are not added again to the 12-month cash-use line. [ciq_facts.json, CIQ Financials→Balance Sheet `Net Debt` [Q2 2026-08-01] — vendor export; data/BURL/Burlington_Stores_Inc_-_Form_10-Q(Aug-27-2026).doc, Q2 FY2026, pp.5, 10–11]

No pending material business acquisition was identified in the admitted filing set or in `business-model/11_capital-allocation-governance`; no pro-forma debt or EBITDA adjustment is therefore applied. This is limited to the frozen evidence pool. BURL's current investment programme is presented as stores, supply chain and IT capex. [data/BURL/Burlington_Stores_Inc_-_Form_10-K(Mar-19-2026).doc, FY2025, Item 7—Capital Expenditures, p.33; business-model/11_capital-allocation-governance, §1]

FCF scaling for the stress is an inference, not from filings: `stressed FCF(h) = $357.038m − ($1,360.7m × h × 74.8%)`, where `h` is the EBITDA decline and 74.8% is one minus BURL's FY2025 25.2% effective tax rate. It holds cash interest and total capex fixed and lets only the after-tax EBITDA loss flow through to FCF. This is deliberately harsh because it assumes no price action, cost cut, capex cut, or sourcing offset. The remaining $217.6m repurchase authorisation is discretionary rather than a committed 12-month use, so it is not modeled as either an outflow or a mitigating cut. [data/BURL/Burlington_Stores_Inc_-_Form_10-K(Mar-19-2026).doc, FY2025, MD&A—Income Taxes; data/BURL/Burlington_Stores_Inc_-_Form_10-Q(Aug-27-2026).doc, Q2 FY2026, p.20 and p.30; earnings/06_earnings-quality, §§1–2; balance-sheet-survival/03_liquidity-runway, §2]

## 2. Stress Scenarios

`12-month liquidity gap = uses ($20.1m maturity) − [reported usable liquidity + stressed FCF]`; a negative result is a surplus. The contractual covenant result remains **Not assessable** throughout. To make the balance-sheet sensitivity visible, the table also shows a clearly labelled, non-contractual 4.0x maximum-strict-net-leverage illustration. BURL is consumer-, weather- and inventory-exposed rather than classified as a deep commodity cycle; the −60% case is the severe survival bound. [business-model/10_external-dependency, §§1, 3; earnings/03_margin-drivers, §§1–2]

| Metric | Base | −30% EBITDA | −40% EBITDA | −60% EBITDA | −40% + WC shock | −40% + rates +200bp |
|---|---:|---:|---:|---:|---:|---:|
| EBITDA | 1,360.7 | 952.5 | 816.4 | 544.3 | 816.4 | 816.4 |
| Net debt / EBITDA | 0.89x | 1.28x | 1.49x | 2.23x | 2.24x | 1.50x |
| EBITDA / interest | 18.36x | 12.85x | 11.02x | 7.35x | 11.02x | 9.46x |
| Tightest covenant headroom | Not assessable; illustrative 4.0x: 77.7% | Not assessable; illustrative: 68.1% | Not assessable; illustrative: 62.8% | Not assessable; illustrative: 44.2% | Not assessable; illustrative: 44.1% | Not assessable; illustrative: 62.4% |
| Covenant breach? (Y/N) | Not assessable; illustrative N | Not assessable; illustrative N | Not assessable; illustrative N | Not assessable; illustrative N | Not assessable; illustrative N | Not assessable; illustrative N |
| 12-month liquidity gap | $(1,982.6)m surplus | $(1,677.2)m surplus | $(1,575.5)m surplus | $(1,371.9)m surplus | $(965.5)m surplus | $(1,563.2)m surplus |
| Survives without equity raise, distressed asset sale, or covenant waiver? | Y | Y | Y | Y | Y | Y |

Working-capital shock: the filing does not disclose peak seasonal cash usage, so this is a labelled 5% of LTM revenue assumption: `5% × $12,198.6m = $609.9m`. It is treated as an immediate cash use, which raises strict net debt by $609.9m and reduces usable liquidity by the same amount. The ABL is held at its reported $942.0m availability because no borrowing-base sensitivity is disclosed; a real inventory or receivable shock could change it. [Capital IQ Financials Quarterly workbook, Income Statement, LTM 2026-08-01 — vendor export; data/BURL/Burlington_Stores_Inc_-_Form_10-Q(Aug-27-2026).doc, Q2 FY2026, Note 4, pp.13–14]

Rate shock: after the $1.1bn swaps, `$611.7m × 2% = $12.2m` of extra annual cash interest. This scenario deducts the full $12.2m from FCF and adds it to strict net debt, with no tax shield, and uses `$86.3m` interest for coverage. [data/BURL/Burlington_Stores_Inc_-_Form_10-Q(Aug-27-2026).doc, Q2 FY2026, Note 4, pp.12–13; Note 5, p.14]

All scenarios assume zero management mitigation — this is a survival bound, not a forecast; `earnings/07` §2 supplies the expected-outcome sensitivity framework, but it does not disclose a measured realised offset for BURL's demand or merchandise shocks.

The executed calculation was:

```text
$ awk 'BEGIN {e=1360.7; nd=1215.812; intr=74.1; liq=1645.686; mat=20.144; fcf=357.038; keep=.748; wc=.05*12198.6; rate=(1711.658-1100)*.02; for(i=0;i<4;i++){h=(i==0?0:(i==1?.3:(i==2?.4:.6))); eb=e*(1-h); sf=fcf-e*h*keep; print sprintf("%3.0f%%: EBITDA %.1f | leverage %.2fx | coverage %.2fx | 4.0x headroom %.1f%% | gap %.1f",100*h,eb,nd/eb,eb/intr,100*(4-nd/eb)/4,mat-liq-sf)} h=.4; eb=e*(1-h); sf=fcf-e*h*keep; print sprintf("40%%+WC: EBITDA %.1f | leverage %.2fx | coverage %.2fx | 4.0x headroom %.1f%% | gap %.1f",eb,(nd+wc)/eb,eb/intr,100*(4-(nd+wc)/eb)/4,mat-(liq-wc)-sf); print sprintf("40%%+rates: EBITDA %.1f | leverage %.2fx | coverage %.2fx | 4.0x headroom %.1f%% | gap %.1f",eb,(nd+rate)/eb,eb/(intr+rate),100*(4-(nd+rate)/eb)/4,mat-liq-(sf-rate)); print sprintf("breaks: illustrative 4.0x %.1f%% | liquidity %.1f%% | 6.0x %.1f%%",100*(1-nd/(4*e)),100*((liq+fcf-mat)/(e*keep)),100*(1-nd/(6*e)))}'
  0%: EBITDA 1360.7 | leverage 0.89x | coverage 18.36x | 4.0x headroom 77.7% | gap -1982.6
 30%: EBITDA 952.5 | leverage 1.28x | coverage 12.85x | 4.0x headroom 68.1% | gap -1677.2
 40%: EBITDA 816.4 | leverage 1.49x | coverage 11.02x | 4.0x headroom 62.8% | gap -1575.5
 60%: EBITDA 544.3 | leverage 2.23x | coverage 7.35x | 4.0x headroom 44.2% | gap -1371.9
40%+WC: EBITDA 816.4 | leverage 2.24x | coverage 11.02x | 4.0x headroom 44.1% | gap -965.5
40%+rates: EBITDA 816.4 | leverage 1.50x | coverage 9.46x | 4.0x headroom 62.4% | gap -1563.2
breaks: illustrative 4.0x 77.7% | liquidity 194.8% | 6.0x 85.1%
```

## 3. Break Points

| Break Point | EBITDA Decline That Triggers It |
|---|---:|
| Tightest covenant breaches | **Not assessable.** No contractual maintenance threshold or covenant EBITDA is disclosed. Under the labelled 4.0x maximum-strict-net-leverage illustration, 77.7%. |
| Committed liquidity exhausted within 12 months | **Does not exhaust on an EBITDA decline alone.** The mechanical solve is 194.8%, beyond a possible 100% EBITDA fall. |
| Net leverage exceeds 6.0x | 85.1% under a labelled 6.0x refinancing-risk marker; this is neither a BURL covenant nor a disclosed lender threshold. |

The illustrative covenant is a MAX/ceiling test using the stated generic numerator, strict net debt: `h = 1 − ND ÷ (T × EBITDA) = 1 − 1,215.812 ÷ (4.0 × 1,360.7) = 77.7%`. It must not be read as a contractual BURL breach point. The filing's disclosed 3.50x condition limits certain distributions, but neither its calculation nor whether it is a maintenance test is disclosed. [data/BURL/Burlington_Stores_Inc_-_Form_10-K(Mar-19-2026).doc, FY2025, Schedule I, Note 1; balance-sheet-survival/04_coverage-and-covenants, §§2–3]

Liquidity uses `1,645.686 + [357.038 − (1,360.7 × h × 0.748)] = 20.144`, so `h = (1,645.686 + 357.038 − 20.144) ÷ (1,360.7 × 0.748) = 194.8%`. At a full 100% EBITDA loss, the same zero-mitigation scaling still leaves about `$964.8m` after the $20.1m stated maturity; that is a model result, not a forecast. The 6.0x marker is the same MAX form: `h = 1 − 1,215.812 ÷ (6.0 × 1,360.7) = 85.1%`. The executed `awk` output in Section 2 is the calculation record for these solves.

## 4. Survival Read

On the stated strict financial-debt basis, no modeled cash break occurs through a 60% EBITDA decline: at −60%, net leverage is 2.23x, EBITDA covers gross interest 7.35x, and the 12-month cash result is a `$1.372bn` surplus. The first modeled threshold is the non-contractual 4.0x illustration at a 77.7% EBITDA decline; the real covenant breach point is **Not assessable** until BURL's current Term Loan/ABL agreement or compliance certificate is available. [data/BURL/Burlington_Stores_Inc_-_Form_10-Q(Aug-27-2026).doc, Q2 FY2026, Note 4, pp.12–14; balance-sheet-survival/04_coverage-and-covenants, §§2–4]

The 30–40% recession-style haircuts survive on their own under this zero-mitigation bound, including a $609.9m assumed working-capital call at −40%; that combined case retains a `$965.5m` 12-month surplus. The important qualification is that the reported $942.0m ABL availability is borrowing-base-dependent and that $2.559bn of purchase commitments have no disclosed timing. Those commitments are merchandise purchases rather than a stated loss and cannot be added mechanically to FCF without double counting, but an extreme inventory or vendor-payment shock could make the reported ABL availability less usable. [data/BURL/Burlington_Stores_Inc_-_Form_10-Q(Aug-27-2026).doc, Q2 FY2026, Note 4, pp.13–14; Note 11, p.20]

Market closure test: assuming no new unsecured refinancing for 12 months, the $20.1m scheduled financial-debt maturity is covered by reported cash and disclosed ABL capacity; no equity raise, distressed asset sale or covenant waiver is modeled as necessary. This does not settle the Parent-versus-subsidiary cash-access constraint or the later $1.624bn 2031 Term Loan bullet, and it excludes any unreported deterioration in the ABL borrowing base. [data/BURL/Burlington_Stores_Inc_-_Form_10-Q(Aug-27-2026).doc, Q2 FY2026, p.30; Note 4, pp.12–14; balance-sheet-survival/02_maturity-wall-and-refinancing, §§1, 5]
