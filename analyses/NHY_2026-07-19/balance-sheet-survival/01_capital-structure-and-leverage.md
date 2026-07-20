# Capital Structure & Leverage — NHY

Reporting currency: **Norwegian krone (NOK), millions**, unless stated otherwise. Norsk Hydro ASA (Oslo Børs: NHY) reports under IFRS Accounting Standards as adopted by the EU, fiscal year ended 31 December [Integrated Annual Report 2025, p.140]. This is not a US SEC or India SEBI-LODR filer; the local-equivalent documents used here are the Board-approved Integrated Annual Report 2025 (the 10-K/annual-filing equivalent, approved 13-Feb-2026) and the Board-approved First Quarter Report 2026 (the 10-Q equivalent, approved 28-Apr-2026), per `00_solvency-data-triage.md` §4A. Norsk Hydro is an operating industrial company (integrated aluminium producer), not a bank, insurer, or REIT — the standard debt/EBITDA and leverage framework applies (MODULE_RULES.md, Business Type Applicability Gate).

**Basis note (read before the tables):** Three different "net debt" numbers appear across sources for the same date, and none is wrong — they use different definitions. This report designates ONE as canonical for downstream agents (§4, §7) and shows the others labelled for reconciliation.

## 1. Debt Stack

FY2025 (year-end 31-Dec-2025) instrument-level detail, sourced from the Capital IQ workbook's "Capital Structure Details" export and cross-tied to the audited Note 7.4 aggregate. The audited note discloses debt in three aggregate lines (unsecured loans NOK 31,721m, other loans NOK 445m, lease liabilities NOK 4,305m) plus bank loans/overdrafts NOK 103m tracked separately as short-term debt, for a total of NOK 36,574m [Integrated Annual Report 2025, Note 7.4 (Short and long-term debt), p.181-182]. The Capital IQ export decomposes the "unsecured loans" aggregate into named bond series and term loans (bonds, green bond, sustainability-linked instruments) — this decomposition is **not itself in the audited note**, which only names bond listings in prose ("five bonds in NOK... three bonds in EUR...") without per-bond amounts; the CIQ split is used here for granularity because the two sources' **totals** tie out exactly (36,574 = 36,471 audited "Outstanding debt" + 103 audited "Bank loans and overdraft facilities" = CIQ "Total Debt Outstanding" 36,574), and is flagged as vendor-sourced at the instrument-detail level.

| Instrument | Amount (NOK m) | Entity (HoldCo/OpCo) | Secured? | Seniority | Collateral | Maturity | Rate (fixed/floating) | Source |
|---|---:|---|---|---|---|---|---|---|
| Bank loans and overdraft facilities | 103 | Parent (centralized treasury) | No | Senior | None | 2026-12-31 | Not disclosed | [Norsk Hydro ASA OB NHY Financials.xls, Capital Structure Details tab; Integrated Annual Report 2025, Note 7.4, p.181] |
| Bonds (NOK) | 7,000 | Parent | No | Senior | None | Not disclosed at instrument level (part of NOK-bond series maturing through the 5-yr schedule, §2 of `02`) | Fixed (rate not disclosed at instrument level) | [Capital Structure Details tab] |
| Bonds (NOK) | 200 | Parent | No | Senior | None | Not disclosed | Fixed (rate not disclosed) | [Capital Structure Details tab] |
| European Green Bond | 5,940 | Parent | No | Senior | None | Not disclosed | Fixed, 3.750% | [Capital Structure Details tab] — repayment currency EUR, NOK-equivalent shown |
| Sustainability Linked Bond (floating) | 1,500 | Parent | No | Senior | None | 2028-11-30 | Floating, 3-month NIBOR + 2.000% | [Capital Structure Details tab] |
| Sustainability Linked Bond (fixed) | 1,500 | Parent | No | Senior | None | 2028-11-30 | Fixed, 5.257% | [Capital Structure Details tab] |
| Sustainability Linked Loan (USD) | 2,016 | Parent | No | Senior | None | 2029 | Not disclosed | [Capital Structure Details tab] — repayment currency USD, NOK-equivalent shown |
| Other loans | 445 | Parent/subsidiaries (unspecified) | No | Senior | None | Not disclosed | Not disclosed | [Capital Structure Details tab; Note 7.4] |
| Unsecured loans (residual, CIQ decomposition) | 17,764 | Parent (per Note 7.4: "majority of long-term loans are held by the parent company") | No | Senior | None | Not disclosed at instrument level | Not disclosed | [Capital Structure Details tab] |
| Multicurrency Syndicated RCF #1 | 0 drawn (USD 1,600m committed) | Parent | No | Senior | None (shared, unsecured) | 2030-11-01 | n/a — undrawn | [Integrated Annual Report 2025, p.179; Capital Structure Details tab] |
| Multicurrency Syndicated RCF #2 | 0 drawn (USD 800m committed) | Parent | No | Senior | None (shared, unsecured) | 2027-11-01 | n/a — undrawn | [Integrated Annual Report 2025, p.179] |
| Finance/capital leases (lease liabilities) | 4,305 | Consolidated group | **Yes** | Senior | Leased assets | Various (not itemised) | Not disclosed | [Capital Structure Details tab, classified "Capital Lease/Secured"; Note 7.4, p.181] |
| CIQ reconciling "Total Adjustments" (FX/discount/other, unexplained in workbook) | −4,199 | n/a | n/a | n/a | n/a | n/a | n/a | [Capital Structure Summary tab, "Total Adjustments" row] |
| **Total gross debt (FY2025)** | **36,574** | | | | | | | [Capital Structure Summary tab, "Total Debt Outstanding"; ties to Integrated Annual Report 2025, Note 7.4: 36,471 "Outstanding debt" + 103 "Bank loans and overdraft facilities" = 36,574] |

Memo — FY2024 comparison: Total gross debt NOK 34,748m [Balance Sheet tab; Note 7.4]. Of FY2025's NOK 36,574m, NOK 8,149m is classified current/short-term (bank loans NOK 103m + current portion of long-term debt NOK 8,046m) and NOK 28,425m is long-term (incl. lease liabilities) [Integrated Annual Report 2025, Note 7.4, p.181].

**Seniority/security:** Every instrument disclosed is **senior**; only the lease liabilities (NOK 4,305m, 11.8% of gross debt) are secured (by the leased assets themselves). All bonds, term loans, and the revolver are senior **unsecured**. Note 7.4 states: "the majority of long-term loans are held by the parent company. There are no financial covenants for those loans. Some loans held by part-owned subsidiaries have financial covenants as part of the terms" [Integrated Annual Report 2025, p.182] — the identity, amount, and covenant terms of those subsidiary-level loans are **not disclosed** in the data pool (covenant-headroom implications belong to `04_coverage-and-covenants`, not this agent).

**Change-of-control / cross-default clauses:** Not disclosed in the data pool.

## 2. Other Debt-Like Obligations

| Obligation | Amount (NOK m) | Treatment | Source |
|---|---:|---|---|
| Operating leases | Already capitalized — see Section 1 | Hydro reports under **IFRS**, which requires capitalizing substantially all leases (IFRS 16) onto the balance sheet as a right-of-use asset and a lease liability. There is no separate off-balance-sheet "operating lease" pool left to add — the NOK 4,305m "Lease Liabilities" line in Section 1 already is the full lease obligation. | [Integrated Annual Report 2025, Note 7.4, p.181 (Lease liabilities NOK 4,305m); Norsk Hydro ASA OB NHY Financials.xls, Balance Sheet tab, "Long-Term Leases" row] |
| Pension / OPEB | Defined-benefit obligation (DBO) NOK 18,169m; plan assets NOK 20,861m; **group-level plan assets exceed the DBO by NOK 2,692m** (a funding surplus on a global aggregate basis) | IFRS does not allow netting an overfunded plan in one jurisdiction against an underfunded plan in another. The balance sheet therefore separately recognizes a **pension asset** of NOK 10,563m (long-term assets, overfunded plans, mainly domestic) and a **pension/OPEB liability** of NOK 9,438m (long-term liabilities, underfunded plans) — these do not net to the plan-level surplus figure once other adjustments (actuarial items, non-Norwegian plans) are folded in; the net recognized position on the balance sheet is +NOK 1,661m [Pension OPEB tab]. Treat the NOK 9,438m liability line as the debt-like obligation that reduces net-debt-equivalent capacity; the NOK 10,563m asset is a separate, plan-specific item, not fungible cash. | [Norsk Hydro ASA OB NHY Financials.xls, Pension OPEB tab, FY2025 column; Balance Sheet tab, "Pension & Other Post-Retire. Benefits" row = NOK 9,438m] |
| Preferred equity | None | Not disclosed / none outstanding | [Norsk Hydro ASA OB NHY Financials.xls, Historical Capitalization tab, "Pref. Equity" row = "-" for all periods shown] |

## 3. Cash & Liquid Assets

| Item | Amount (NOK m, FY2025) | Restricted? | Source |
|---|---:|---|---|
| Cash & equivalents | 16,085 | Partially — of the NOK 16,085m cash position, **NOK 4.7 billion was outside Hydro's group cash-pooling arrangements at year-end 2025, mainly in Brazil** [Integrated Annual Report 2025, Note 7.2, p.181]. This is not formally "restricted" cash under IFRS, but it is not centrally poolable for group liquidity purposes — flag as a soft trapped-cash signal, not a hard restriction. | [Integrated Annual Report 2025, Note 7.2, p.181; Balance Sheet tab] |
| Short-term investments | 10,600 (audited, Note 7.3) — of which NOK 2,611m is "collateral accounts and other" (cash pledged mainly against derivative positions, not freely available) | The NOK 2,611m collateral-accounts component is functionally restricted (posted against derivatives). Hydro's own "Adjusted net debt" APM (§4) explicitly nets out collateral for short/long-term liabilities (NOK 2,848m combined FY2025) as unavailable-for-debt-service. | [Integrated Annual Report 2025, Note 7.3 (Short-term investments), p.181] |
| Cash & short-term investments in captive insurance company (Industriforsikring AS) | 1,267 | **Restricted in substance** — Hydro's own disclosure states this cash "is assumed to not be available to service or repay future Hydro debt" and is excluded from the company's Adjusted net debt measure. | [Integrated Annual Report 2025, "Adjusted net debt" note, p.180, footnote 3] |
| Collateral for long-term liabilities (added back as available in the company's "Net debt" APM) | 220 | Small, offsetting item | [Integrated Annual Report 2025, "Adjusted net debt" note, p.180] |

**Classification note:** Capital IQ's own "Short Term Investments" field for FY2025 (NOK 7,989m) is NOK 2,611m lower than the audited Note 7.3 figure (NOK 10,600m) — the gap is exactly the "collateral accounts and other" component, which CIQ appears to classify outside short-term investments (likely folded into other current-asset lines). Both figures reconcile once this component is accounted for; this is a classification difference, not an extraction error. At Q1 2026, CIQ's figure (NOK 9,413m) matches the company's own disclosed short-term investments exactly, so the gap is FY2025-specific. [Cross-checked: Norsk Hydro ASA OB NHY Financials.xls, Balance Sheet tab vs Integrated Annual Report 2025, Note 7.3, p.181; First Quarter Report 2026, "Adjusted net debt" table, p.24]

## 4. Gross & Net Debt

| Metric | Value (NOK m, FY2025) | Source |
|---|---:|---|
| Gross debt | 36,574 | [Section 1; Integrated Annual Report 2025, Note 7.4; Capital Structure Summary tab] |
| − Cash & equivalents | 16,085 | [Integrated Annual Report 2025, Note 7.2; Balance Sheet tab] |
| **Net debt (strict, §15 — canonical basis for this module, see designation below)** | **20,489** | Derived: 36,574 − 16,085 |
| − Short-term investments (CIQ classification, netting only the non-collateral portion, NOK 7,989m) | 7,989 | [Balance Sheet tab] |
| **Net debt (broad, incl. investments — CIQ basis)** | **12,500** | [Capital Structure Summary tab, "Net Debt" row — ties exactly to Gross debt (36,574) − Total Cash & ST Investments (24,074)] |

**Memo — company-defined APMs (shown for reconciliation, NOT used as this module's canonical figure, since each uses additional definitional adjustments beyond the standard strict/broad bases):**

- Hydro's own "**Net debt**" APM (= cash + full short-term investments incl. collateral accounts + collateral for long-term liabilities, less short- and long-term interest-bearing debt) = **NOK 9,669m** FY2025 (down from NOK 15,976m FY2024) [Integrated Annual Report 2025, "Adjusted net debt" note, p.180].
- Hydro's own "**Adjusted net debt**" APM (as above, further netting out collateral-for-liabilities, captive-insurance cash, net pension position, and provisions net of tax) = **NOK 18,213m** FY2025 (down from NOK 24,066m FY2024) [same source].
- These two company APMs are lower than this module's strict basis and (in the "Net debt" APM's case) lower than the broad/CIQ basis too, because they credit additional near-cash items (the collateral-accounts portion of short-term investments, and small collateral-for-liabilities add-backs) that this module's standard bases do not net in.

**Canonical designation:** Per MODULE_RULES.md's default rule ("strict by default; broad only with a stated reason"), this report designates the **strict basis (NOK 20,489m)** as the canonical net-debt figure for downstream agents in this module. No company-specific reason overrides the default here — short-term investments are real and largely liquid (time deposits, debt securities), but crediting them is exactly the general case the default rule is built for, not a special exception. Downstream agents should still be aware that on a broader (CIQ or company-APM) basis, net leverage reads meaningfully lower — this gap is material and is carried forward explicitly in §7.

## 5. Leverage Ratios

EBITDA base: **company-reported (audited) EBITDA**, FY2025 = NOK 25,696m; **adjusted EBITDA** (company APM), FY2025 = NOK 28,889m (+NOK 3,193m adjustment, mostly non-cash unrealized LME-linked derivative timing gains and rationalization/closure costs) [Integrated Annual Report 2025, p.36, "Other performance measures" table]. Per `earnings/01_historical-financials.md`, the Capital IQ workbook's own "EBITDA"/"EBIT" fields for Hydro (e.g., FY2025 "EBITDA" 51,454) do **not** reconcile to the audited figures and are not used anywhere in this report — a template/extraction mismatch flagged by the earnings module, not a real economic item.

| Ratio | On Reported EBITDA | On Adjusted EBITDA | Source |
|---|---:|---:|---|
| Gross debt / EBITDA | 1.42x (36,574 / 25,696) | 1.27x (36,574 / 28,889) | Derived from §1, §5 EBITDA figures |
| Net debt / EBITDA (**canonical, strict basis, NOK 20,489m**) | 0.80x (20,489 / 25,696) | 0.71x (20,489 / 28,889) | Derived |
| Net debt / EBITDA (broad basis, NOK 12,500m — memo, not canonical) | 0.49x (12,500 / 25,696) | 0.43x (12,500 / 28,889) | Derived |
| Debt / capital (Total debt ÷ [Total debt + Total equity incl. minority]) | 25.5% (36,574 / 143,669) | n/a | [Capital Structure Summary tab, "Total Debt" row = 0.254571 of Total Capital — ties exactly] |
| Debt / equity (Total debt ÷ Total common equity, NOK 99,843m) | 36.6% | n/a | Derived; on total equity incl. minority interest (NOK 107,095m) the ratio is 34.2% |

**Company's own headline leverage KPI (shown for context, not this module's basis):** Hydro targets **average Adjusted net debt / Adjusted EBITDA below 2.0x over the cycle**, with a targeted Adjusted net debt of around NOK 25 billion [Integrated Annual Report 2025, p.180]. On this company-defined basis (average Adjusted net debt NOK 21,051m ÷ Adjusted EBITDA NOK 28,889m), FY2025's ratio is **0.73x** [Integrated Annual Report 2025, Note 7.1, p.181] — comfortably inside the company's own 2.0x ceiling, but this measure uses a materially smaller numerator (average, further-adjusted net debt) than this module's canonical strict basis above; the two are not interchangeable.

**Cyclicality (per `business-model/07_business-quality.md` and `10_external-dependency.md`): Norsk Hydro is flagged as an extremely cyclical, price-taking commodity aluminium producer** — group ROE swung from 24.9% (2022, a post-COVID price-spike peak) to 2.6% (2023, the trough) and back to 7.7% (2025), which the business-model module reads as "roughly mid-cycle," not a peak or trough [`business-model/07_business-quality.md`]. Reported EBITDA is only disclosed for FY2023–FY2025 in this data pool (FY2021–FY2022 not available); the 3-year average is NOK 25,177m, essentially in line with FY2025's own NOK 25,696m — consistent with the mid-cycle read (no material peak/mid-cycle gap is visible in the years available, unlike a company currently sitting at a clear price-spike high).

| Leverage basis | Net debt / EBITDA |
|---|---:|
| Latest year (FY2025 reported EBITDA, NOK 25,696m) | 0.80x |
| 3-yr average / normalised (FY2023–FY2025 reported EBITDA, NOK 25,177m — the only years with disclosed reported EBITDA in this pool) | 0.81x |

Both readings use the canonical strict net debt of NOK 20,489m. The near-identical result reflects the mid-cycle positioning noted above — this is NOT evidence that Hydro is immune to the cycle; it means FY2025 itself is not an outlier high (peak) EBITDA year, so this particular normalisation does not reveal hidden leverage the way it would for a company reporting at a price-spike peak. A genuine trough scenario (2023-level ROE) is tested by `06_downside-stress-test`, not here.

## 6. Leverage Trend

All net-debt figures below use the strict basis (canonical). Reported EBITDA (annual, company-disclosed); "Latest" column uses the TTM reported EBITDA (four quarters ended 31-Mar-2026) from `earnings/01_historical-financials.md`.

| Metric | FY2023 | FY2024 | FY2025 | Latest (Q1 2026 balance sheet / TTM EBITDA) | Direction |
|---|---:|---:|---:|---:|---|
| Gross debt | 36,089 | 34,748 | 36,574 | 33,754 | Roughly flat, no clear trend |
| Net debt (strict basis) | 11,471 | 19,699 | 20,489 | 22,503 | **Rising** |
| Reported EBITDA (annual) / TTM (latest) | 23,291 | 26,543 | 25,696 | 21,976 (TTM) | Falling (latest) |
| Net debt (strict) / EBITDA | 0.49x | 0.74x | 0.80x | 1.02x (TTM) | **Rising** |

Memo — company's own "Net debt" APM tells a directionally similar but less alarming story: NOK 8,191m (FY2023, per `earnings/01_historical-financials.md`) → NOK 15,976m (FY2024) → NOK 9,669m (FY2025) → NOK 12,860m (Q1 2026) — a rise, then a fall, then a rise again, ending at a level below FY2024's peak. [Integrated Annual Report 2025, p.180; First Quarter Report 2026, p.24]

**Is leverage rising or falling, and why?** On this module's canonical (strict) basis, net leverage has risen every period shown: 0.49x (FY2023) → 0.74x (FY2024) → 0.80x (FY2025) → 1.02x (TTM through Q1 2026) — driven by a combination of (1) a shift in the cash/short-term-investment mix that this basis does not credit as offsetting debt, (2) continued shareholder distributions (buybacks of NOK 686m LTM plus an ongoing floor dividend) even as EBITDA has softened, and (3) the TTM EBITDA decline itself (−14.5% versus FY2025) on falling alumina prices (Q1 2026 revenue −11.7% YoY on a 40% YoY drop in the alumina price index) [`earnings/01_historical-financials.md`, §2, §6; `first-quarter-report-2026.pdf`, p.9]. On the broader company-APM basis the picture is calmer (leverage stayed inside the company's own sub-1x range throughout, per §5), because that basis credits Hydro's larger short-term-investment and collateral balances as available liquidity — a real difference in interpretation that downstream agents should carry forward, not average away.

## 6A. HoldCo / OpCo & Structural Subordination

Not applicable — no material HoldCo-level debt indicated. Norsk Hydro ASA is a single listed parent; per Note 7.4, "the majority of long-term loans are held by the parent company," and funding of subsidiaries, associates, and joint arrangements is done "on an arm's length basis," proportional to Hydro's ownership share [Integrated Annual Report 2025, p.179, 182]. This is a centralized-treasury structure (debt issued at the parent and passed down as intercompany loans/equity), not a HoldCo/OpCo structure with structural subordination risk. The only entity-level nuance worth flagging: some loans held by **part-owned subsidiaries** carry financial covenants not disclosed at the parent level (§1) — this is a covenant-disclosure gap for `04_coverage-and-covenants`, not a structural-subordination issue for this section.

## 7. Leverage Anchor Summary (canonical numbers for downstream agents)

- **Reporting currency:** NOK (Norwegian krone), millions. Fiscal year ended 31-Dec-2025 for the primary balance sheet used here; latest available balance sheet is 31-Mar-2026 (Q1 2026).
- **Gross debt:** NOK 36,574m (FY2025, audited-tied). [Integrated Annual Report 2025, Note 7.4, p.181; Norsk Hydro ASA OB NHY Financials.xls, Capital Structure Summary tab]
- **Net debt — canonical (strict basis, §15 default):** NOK 20,489m (= gross debt NOK 36,574m − cash & equivalents NOK 16,085m only). This is the figure downstream agents (`02`, `03`, `04`, `06`) should use unless they state an explicit reason to switch.
  - Broad basis (nets in liquid short-term investments, CIQ classification): NOK 12,500m — shown alongside, labelled, not canonical.
  - Company's own "Net debt" APM (further nets collateral items): NOK 9,669m — memo only, company-specific definition.
  - Company's own "Adjusted net debt" APM (further nets pension/provisions, excludes captive-insurance cash): NOK 18,213m — memo only.
- **Cash & liquid investments:** Cash & equivalents NOK 16,085m + short-term investments NOK 10,600m (audited) = NOK 26,685m total liquid assets. Of this, ~NOK 4.7bn cash sits outside group cash-pooling (mainly Brazil), and NOK 2,611m of short-term investments is collateral posted against derivatives — both flagged as reduced-availability, not fully "restricted." [§3]
- **EBITDA base used:** **Reported (audited) EBITDA, NOK 25,696m, FY2025** — used as the primary base. Adjusted EBITDA (company APM) is NOK 28,889m, FY2025. Cycle position: **mid-cycle / latest, not peak or trough**, per `business-model/07_business-quality.md` (FY2025 ROE 7.7% vs 2022 peak 24.9% and 2023 trough 2.6%); the only available 3-year normalised reported-EBITDA average (FY2023–FY2025, NOK 25,177m) is close to the FY2025 figure itself, so no material peak-vs-mid-cycle adjustment is available from this data pool (a genuine trough is modelled separately in `06_downside-stress-test`). Note the latest TTM reported EBITDA (through Mar-2026) is materially lower, NOK 21,976m (−14.5% vs FY2025) — flag this decline to downstream agents as the most current run-rate.
- **Net debt / EBITDA (canonical net debt, NOK 20,489m):** 0.80x on reported EBITDA (25,696); 0.71x on adjusted EBITDA (28,889). Using the latest TTM reported EBITDA (21,976) instead of FY2025, the ratio rises to ~0.93x — flagged as the more current (if not yet audited-annual) read.
- **Caveat for downstream agents:** the leverage read is basis-sensitive here. On this module's canonical strict basis, net leverage has risen in every period shown (0.49x FY2023 → 1.02x latest TTM) and sits close to 1x. On the company's own broader APMs, leverage is lower (0.7x–0.9x on the company's disclosed average Adjusted net debt/Adjusted EBITDA) and has been more range-bound. Both are cited in this report (§4–§6); use the canonical strict figures above unless a specific downstream need (e.g., matching a rating agency's or covenant's own definition) requires the broader basis, in which case state that reason explicitly.
- **Net cash / net debt status:** Norsk Hydro is **net debt on every basis shown** (strict, broad, and both company APMs) — it is not a net-cash company at FY2025 or Q1 2026. Net leverage nonetheless remains low in absolute terms (well under 1.0x-1.5x on any basis) relative to the company's own 2.0x-over-the-cycle ceiling, and the company holds NOK 24.2bn of undrawn, committed revolving credit as of FY2025-end [Integrated Annual Report 2025, p.179] — this liquidity detail belongs to `03_liquidity-runway`, not this section, and is noted here only for completeness of the anchor.

