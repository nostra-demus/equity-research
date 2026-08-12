# Earnings Quality — DHER

Reporting standard: IFRS as adopted by the EU, consolidated. Reporting currency: EUR million unless stated per-share. No audited FY2025 annual report is present in the pool — FY2025 figures below come from the verbatim FY2025 earnings-call transcript (management-stated) and the Capital IQ workbook export; FY2021–FY2024 figures are cross-checked against the audited FY2024 Annual Report where it covers the year. This is the same sourcing caveat carried from `01_historical-financials.md` and applies throughout this report.

## 1. EBITDA → CFO → FCF Bridge (5 years, FY2021–FY2025)

Currency: EUR million. "EBITDA" here is the company's own non-GAAP **Adjusted EBITDA** (the metric the company guides to and the market tracks) [FY24 Annual Report, Alternative Performance Measures footnote; FY2025 Earnings Call transcript, CFO prepared remarks]. "Working capital change" and "Other operating items" are this agent's own derivation (not a company-published bridge): Working capital change = the sum of the disclosed cash-flow-statement lines "Change in Acc. Receivable" + "Change in Inventories" + "Change in Acc. Payable" + "Change in Other Net Operating Assets" [Delivery Hero SE XTRA DHER Financials.xls, Cash Flow tab]; "Other operating items" is a balancing plug (D&A add-back already embedded in the EBITDA-to-EBIT gap, plus stock-based comp neutralization, restructuring/impairment non-cash portions, M&A gains/losses, FX, minority-interest funding items) that makes the row **reconcile exactly to reported CFO** — this plug is NOT a company-disclosed line item; the company does not publish a full Adjusted-EBITDA-to-CFO bridge.

| Item | FY2021 | FY2022 | FY2023 | FY2024 | FY2025 | Trend |
|---|---:|---:|---:|---:|---:|---|
| EBITDA (Adjusted, company-defined) | -795.6 | -467.2 | 253.6 | 692.5 | 903.0 | Improving (level), decelerating (pace) |
| Working capital change (derived, see note) | +117.0 | +183.1 | +18.1 | +630.9 | -459.9 | Deteriorating (FY2025 reversal) |
| Tax paid | -66.1 | -68.1 | -198.1 | -292.9 | -272.6 | Rising then flat |
| Interest paid | -46.7 | -92.6 | -173.4 | -254.9 | -246.5 | Rising then flat |
| Other operating items (plug, see note) | -110.0 | -244.0 | +80.3 | -137.3 | +155.6 | Volatile |
| **CFO** | -901.4 | -688.8 | -19.5 | 638.3 | 79.5 | Volatile |
| Maintenance capex | Not disclosed | Not disclosed | Not disclosed | Not disclosed | Not disclosed | — |
| Growth capex | Not disclosed | Not disclosed | Not disclosed | Not disclosed | Not disclosed | — |
| Total capex (PP&E + capitalized intangibles) | -320.9 | -251.5 | -260.0 | -279.5 | -325.8 | Rising |
| **FCF (CFO − Total Capex) — this agent's normalized operating figure** | -1,222.3 | -940.3 | -279.5 | +358.8 | **-246.3** | Volatile |
| **CFO / EBITDA (Adjusted) %** | N/M (both negative) | N/M (both negative) | -7.7% | 92.2% | **8.8%** | Deteriorating |

**Capex split not disclosed — total capex used. FCF may understate true recurring free cash flow.** No maintenance-vs-growth capex breakdown is disclosed anywhere in the pool.

**Company-defined FCF, shown alongside for reference (labeled, not headlined per CLAUDE.md §15):** FY2024 ≈ **€210–217m** (derived two ways — cross-checked: (a) €250m ÷ 1.15 from the stated "+15% year-over-year" FY2025 growth figure [FY2025 Earnings Call, CFO prepared remarks] = ~€217.4m; (b) directly computed as CFO(638.3) − Capex(279.5) − Payments of lease liabilities(148.7, FY24 Annual Report, Consolidated Statement of Cash Flows) = €210.1m — the two methods agree within ~€7m, i.e., FY2024's company FCF needed **no material extraordinary-item adjustment**, consistent with management's own statement that legal provisions were only *increased* (a non-cash accrual) in FY2024, not paid in cash [FY2025 Earnings Call, CFO prepared remarks]). FY2025 company-guided/reported FCF = **+€250m**, stated as "+15% year-over-year" [FY2025 Earnings Call, CFO prepared remarks], defined by the company as "cash flow from operating activities, less capital expenditures and payment of lease liabilities," **explicitly excluding extraordinary cash outflows related to ongoing legal disputes (e.g., EU antitrust and Glovo Spain)** and extraordinary M&A breakup-fee inflows [FY24 Annual Report, footnote 13]. **This report leads with the normalized figure (-€246.3m) per CLAUDE.md §15 — the company's own +€250m headline is not the recurring cash the operations threw off in FY2025; see Section 2 for the resolution of this gap.**

## 2. Cash Conversion Assessment

Cash conversion (CFO ÷ Adjusted EBITDA) swung from a healthy 92.2% in FY2024 to a very weak 8.8% in FY2025, even though Adjusted EBITDA itself grew 30% to €903.0m [FY2025 Earnings Call]. This is not a one-year blip against an otherwise clean history: CFO/EBITDA was also negative (-7.7%) in FY2023, meaning **2 of the last 3 fiscal years (FY2023 and FY2025) show CFO/EBITDA below 50%.** The FY2025 collapse is driven almost entirely by a single working-capital swing — "Change in Other Net Operating Assets" moved from +€489.1m (FY2024, a cash inflow) to -€173.9m (FY2025, a cash outflow), a €663.0m negative swing [Delivery Hero SE XTRA DHER Financials.xls, Cash Flow tab] — which management directly attributes to paying out and releasing the EU antitrust provision and making rider-model-transition payments in Glovo Spain that had only been *accrued* (not paid) the year before [FY2025 Earnings Call, CFO prepared remarks: "we made the payment and released the provision for the EU antitrust case," "payments related to the shift in rider model in Glovo Spain"]. On a stricter, unadjusted (GAAP) EBITDA basis the picture is somewhat better for FY2025 (CFO/GAAP-EBITDA = 79.5/304.9 = 26.1%) but still well below a healthy conversion rate, and GAAP EBITDA was itself negative or near-zero in FY2021–FY2024, making that ratio not meaningful for most of the window.

**RF-EQ-002 (cash-conversion breakdown)**

## 3. Working Capital Trends

Formulas: DSO = 365 × average Accounts Receivable ÷ Revenue; DIO = 365 × average Inventory ÷ COGS; DPO = 365 × average Accounts Payable ÷ COGS. Average balances = (opening + closing) / 2. Source: Delivery Hero SE XTRA DHER Financials.xls, Balance Sheet and Income Statement tabs.

| Metric | FY2023 | FY2024 | FY2025 | Direction | Risk |
|---|---:|---:|---:|---|---|
| Receivable days (DSO) | 20.9 | 16.9 | 12.6 | Improving (falling) | Low — no evidence of aggressive revenue recognition; collection is getting faster, not slower |
| Inventory days (DIO) | 7.5 | 6.5 | 6.3 | Improving (falling) | Low — inventory turns are stable/fast, consistent with a delivery/quick-commerce business, not a goods inventory build |
| Payable days (DPO) | 16.1 | 15.1 | 15.9 | Stable | Low — no material supplier-stretching pattern |
| Cash conversion cycle (DSO + DIO − DPO) | 12.3 | 8.3 | 2.9 | Improving (shrinking) | Low — the underlying operating cash cycle is genuinely getting more efficient |

None of the three flag thresholds (DSO +10% YoY, DIO +15% YoY, sharply rising DPO) are triggered — all three metrics moved favorably every year in this window. This is a **genuine positive quality signal**, distinct from and partly offsetting the legal/regulatory cash-outflow story above: the *operating* working-capital engine (collections, inventory turns, supplier terms) is healthy and improving; the FY2025 cash-conversion breakdown in Section 2 is a one-off-payment story, not a deteriorating operating cash cycle.

**Data-quality flag (not one of the three formal triggers above, but material):** the Capital IQ cash-flow-statement line "Change in Inventories" shows -€547.7m in FY2025 (and -€193.0m in FY2024) — far larger in magnitude than the actual balance-sheet inventory movement over the same periods (+€16.0m FY2025: €174.6m → €190.6m; +€31.1m FY2024: €143.5m → €174.6m) [Delivery Hero SE XTRA DHER Financials.xls, Balance Sheet and Cash Flow tabs]. This gap is present in both years reviewed, suggesting the vendor's "Change in Inventories" cash-flow line is not a pure inventory-account movement (it may bundle Dmarts merchandise/vendor-prepayment items differently from the balance-sheet "Inventory" line). This is flagged as an unresolved vendor-mapping inconsistency, not evidence of manipulation — but it means the DSO/DIO/DPO reads above (based on the cleaner balance-sheet figures) should be trusted over any working-capital reading built from the CIQ cash-flow "Change in Inventories" line.

## 4. Non-GAAP Adjustments

| Adjustment | Amount (FY2025) | Recurring? (Y/N) | Concern Level (Low / Mid / High) | Evidence |
|---|---:|---|---|---|
| Stock-based compensation excluded from Adjusted EBITDA | €224.1m (24.8% of Adj. EBITDA; up from €171.1m FY2024, +31% YoY) | Y — recurring every year, 5 of 5 years (2021–2025: 303.1, 325.9, 247.4, 171.1, 224.1) | High | FY2025 Earnings Call, CFO prepared remarks; CIQ Income Statement tab, "Stock-Based Comp., Total" |
| "Management adjustments" (mainly reorganization/legal-risk provisions, incl. Glovo Spain rider-model transition) | €147m (down from a higher prior-year level; company states this is "less than 0.3% of GMV") | Y — this bucket recurs every year under different labels (restructuring, legal provisions); the underlying driver (rider-classification legal risk) is multi-jurisdictional and unresolved | High | FY2025 Earnings Call, CFO prepared remarks |
| "Other reconciliation items" (Uber breakup-fee gain reversal / goodwill impairment) | swung from +€158m (FY2024) to -€260m (FY2025) | N (the specific items — Uber Taiwan breakup fee, FY2025 goodwill impairment — are each individually non-recurring) but the SIZE of this swing bucket recurs, just with different contents each year | Mid | FY2025 Earnings Call, CFO prepared remarks: "traced back to the Uber breakup fee we recognized in 2024 as well as goodwill impairment in 2025" |
| Right-of-use asset depreciation excluded from Adjusted EBITDA | Not separately quantified in this pool | Y (structural, applies every year) | Low-Mid — a defensible IFRS 16 add-back but still moves reported vs. adjusted profitability | FY24 Annual Report, Alternative Performance Measures footnote |

Total adjustment from reported (GAAP) EBITDA to Adjusted EBITDA in FY2025 = €598.1m (€304.9m → €903.0m) — this is **66% of the entire Adjusted EBITDA figure itself**, and in FY2024 the adjustment (€716.8m, from -€24.3m to €692.5m) was **larger than the whole Adjusted EBITDA total.** These adjustments recur every period (they are not "one-off" by the report template's own test) and materially exceed the 15%-of-GAAP-earnings threshold that should trigger scrutiny.

## 5. One-Off Items (last 3 years, FY2023–FY2025)

| Item | Period | Amount | Classification (Genuine / Suspicious / Recurring "one-off") | Evidence |
|---|---|---:|---|---|
| Uber Taiwan-deal breakup fee (gain) | FY2024 | +€220.9m | Genuine (non-recurring M&A break-fee gain) — but it flatters reported FY2024 EBITDA/EBIT even after Adjusted-EBITDA stripping, and is the main driver of the "other reconciliation items" swing described above | FY24 Annual Report, Note 6 "Other Operating Income" |
| Goodwill impairment | FY2021–FY2025, every year | -85.9 / -760.9 / -857.8 / -89.7 / -259.7 | **Recurring "one-off"** — a goodwill impairment has occurred every single year in the 5-year window, never zero | CIQ Income Statement tab, "Impairment of Goodwill" |
| Asset writedown & restructuring costs (cash-flow addback) | FY2020–FY2025, every year | 1.2 / 85.9 / 748.4 / 1,004.7 / 133.2 / 248.3 | **Recurring "one-off"** — present in every one of the 6 years shown, and material (>€700m in 2 of those years) | CIQ Cash Flow tab, "Asset Writedown & Restructuring Costs" |
| EU antitrust provision payment + release | FY2025 | Payment made and provision released; FY2024 P&L allocation to the provision was €225.5m | Suspicious as an "extraordinary" label — the underlying antitrust investigation and the associated cash cost is a multi-year item (provisioned/increased in 2023–2024, paid in 2025) that the company nonetheless excludes from its guided FCF, including for FY2026 | FY2025 Earnings Call, CFO prepared remarks; FY24 Annual Report, Note 5 "General Administrative Expenses" ("Allocation to antitrust provisions" €225.5m FY2024) |
| Glovo Spain rider-model-transition payments | FY2025 (ongoing) | Not separately quantified in this pool | **Recurring "one-off"** — rider-classification legal risk is explicitly flagged by the company as ongoing and unresolved in Spain, Italy, and Argentina [FY24 Annual Report, risk section], so cash costs tied to this issue are likely to recur, not to be a single clean exclusion | FY2025 Earnings Call, CFO prepared remarks; FY24 Annual Report, litigation/risk disclosures |

**Resolving the ~€496m FY2025 FCF gap flagged by `01_historical-financials.md`:** this agent's normalized FY2025 FCF (CFO − total capex) = -€246.3m; the company's own guided/reported FY2025 FCF = +€250m; the gap = €496.3m. The company's FCF definition (footnote 13) is CFO − capex − lease payments, EXCLUDING extraordinary legal cash outflows and extraordinary M&A inflows. Algebraically: (Extraordinary outflow addback) − (Lease payments) = €496.3m. Using FY2024's directly disclosed lease-payment figure (€148.7m, FY24 Annual Report, Consolidated Statement of Cash Flows) as the best available proxy for FY2025 (not separately disclosed for FY2025 in this pool — **inference, not from filings**), the **implied FY2025 extraordinary legal/regulatory cash outflow is approximately €645m** — roughly 4.6% of FY2025 revenue and nearly 3x the entire FY2024 antitrust provision allocation (€225.5m) taken alone. This scale strongly suggests the excluded bucket covers both the EU antitrust settlement AND material Glovo Spain rider-reclassification cash costs (severance, back-pay, social-security reclassification costs typically run large across multiple markets), consistent with the CFO naming both items as distinct drivers on the call. **This is not a rounding artifact — it is the single largest earnings-quality finding in this report:** DHER's "second consecutive year of positive free cash flow" narrative is built on excluding a legal/regulatory cash cost on the order of €600–650m in FY2025 alone, and the same exclusion methodology is explicitly carried into FY2026 guidance (">€200m, excluding extraordinary outflows") for a company that discloses unresolved rider-classification litigation risk in at least three jurisdictions. The precise euro split between the lease-payment subtraction and the extraordinary-item addback is **not disclosed in this pool** and is flagged as an open item for a future audited FY2025 filing to close.

## 6. Accrual Quality Flags

| Flag | Triggered (Y/N) | Evidence |
|---|---|---|
| Revenue growing faster than CFO for 2+ years | **Y** | FY2021–FY2023: revenue grew +136.9%/+46.5%/+15.9% while CFO stayed negative all three years (-901.4/-688.8/-19.5) [CIQ Income Statement, Cash Flow tabs]; again in FY2025: revenue +14.4% while CFO fell -87.5% (638.3 → 79.5) despite Adjusted EBITDA growing +30% |
| Receivables growing faster than revenue | N | AR grew faster than revenue in FY2023 only (+18.4% vs. +15.9%); the trend has since reversed — AR fell -15.7% (FY2024) and -13.5% (FY2025) while revenue kept growing, the opposite of a quality concern (Section 3) |
| Inventory growing faster than COGS | N | Inventory grew slower than COGS in all three years reviewed (FY2023: +1.6% vs. +9.8%; FY2024: +21.7% vs. +28.7%; FY2025: +9.2% vs. +18.5%) — balance-sheet basis, per the data-quality flag in Section 3 |
| Deferred revenue declining (if subscription/contract business) | N | Unearned Revenue, Current: €77.2m (FY2023) → €68.9m (FY2024) → €81.9m (FY2025) — one down year followed by recovery, not a sustained decline |
| Capitalized costs growing as % of revenue | N | Capitalized intangible investment stable at ~1.1% of revenue across FY2023–FY2025 (1.13% / 1.14% / 1.10%) |
| Frequent accounting policy changes | N | No specific company-disclosed policy changes found beyond the CIQ vendor's own restatement/reclassification labels (Restated/Reclassified/Other across years), which reflect the data vendor's own presentation, not confirmed company policy changes — insufficient evidence to trigger this flag |

Only 1 of 6 flags is triggered — below the 2-flag threshold for RF-EQ-001, so that tag is **not** emitted here. (The single triggered flag — revenue outpacing CFO — is itself material and is captured through RF-EQ-002 above and the FCF-gap finding in Section 5.)

## 7. Reported vs Adjusted Reconciliation

| Metric | Reported (FY2025) | Adjusted (FY2025) | Difference | % of Reported | Recurring? | Evidence |
|---|---:|---:|---:|---:|---|---|
| EBITDA | €304.9m | €903.0m | +€598.1m | 196% (of reported) / 66% (of adjusted) | Y — every year, always material | CIQ Income Statement tab; FY2025 Earnings Call |
| EBIT | €93.7m | Not disclosed — company does not publish an "Adjusted EBIT" line | N/A | N/A | — | FY24 Annual Report, FY2025 Earnings Call — Adjusted EBITDA is the sole headline non-GAAP profitability metric |
| Net income | -€782.9m | -€257.7m (CIQ "Normalized Net Income" — a data-vendor normalization, not a company-published figure) | +€525.2m | 67.1% | Y | CIQ Income Statement tab, "Normalized Net Income" |
| EPS (diluted) | -€2.62 | -€0.86 (CIQ "Normalized Diluted EPS") | +€1.76 | 67.2% | Y | CIQ Income Statement tab |

FY2024 for context: reported EBITDA -€24.3m vs. Adjusted €692.5m (+€716.8m, adjustment exceeds the entire adjusted figure); reported net income -€882.4m vs. CIQ-normalized -€251.9m (+€630.5m, 71.4% of reported).

## 8. Accounting Trap Checklist

Severity column is inverted — higher = WORSE.

| Trap | Triggered? (Y/N) | Evidence | Severity /100 |
|---|---|---|---:|
| Stock-based compensation excluded from adjusted earnings | Y | FY2025 SBC €224.1m = 24.8% of Adjusted EBITDA, up 31% YoY; excluded from Adjusted EBITDA by definition [FY24 Annual Report APM footnote; CIQ Income Statement] | 55 |
| Restructuring costs recur every year | Y | Asset Writedown & Restructuring Costs present in all 6 years reviewed (2020–2025), never zero, exceeding €700m in FY2022 and FY2023 | 60 |
| Capitalized costs rising faster than revenue | N | Stable ~1.1% of revenue FY2023–FY2025 | 10 |
| Receivable factoring / supplier finance disclosed | N (not quantified) | FY24 Annual Report confirms adoption of the IAS 7/IFRS 7 supplier-finance disclosure amendment, but no quantified outstanding supplier-finance or receivables-factoring balance was found in the reviewed sections — Not proven from available data | 15 |
| Inventory write-downs or reserve releases | Y (unclear magnitude) | FY24 Annual Report bundles "inventory write-downs" inside a €1,883.3m Dmarts merchandise-cost line with no separate quantification; separately, the CIQ cash-flow "Change in Inventories" line diverges sharply from the balance-sheet inventory movement (Section 3) — flagged as unresolved, not confirmed manipulation | 40 |
| Revenue recognized before cash collection risk is clear | N | DSO improved every year (20.9 → 16.9 → 12.6 days, FY2023–FY2025) | 10 |
| Change in useful life / depreciation assumptions | N | Not proven from available data — no disclosure found in reviewed sections | 0 |
| Tax rate unusually low or boosted by one-off | Y | Effective tax rate "NM" every year (positive tax expense despite pre-tax losses); management directly stated FY2024 tax was elevated by a one-off, with FY2025 "a better reflection of ongoing tax levels" [FY2025 Earnings Call, CFO prepared remarks] — explained and disclosed, but still a real driver of the FY2025 net-income improvement | 35 |
| Large fair-value / mark-to-market gains | Y (modest) | "Other Non-Operating Inc. (Exp.)" swung from +€64.0m (FY2024) to -€53.0m (FY2025), attributed to fair-value adjustments of minority investments [FY2025 Earnings Call, CFO prepared remarks; CIQ Income Statement] | 20 |

## 9. Earnings Quality Score

**Score: 36/100** — Band: 21–40, "Poor quality — significant gap between reported earnings and cash."

The single most important reason: FY2025's headline "second consecutive year of positive free cash flow" (+€250m, +15% YoY) is built on excluding an implied ~€600–650m legal/regulatory cash outflow (Section 5) tied to unresolved, multi-jurisdiction rider-classification litigation and an EU antitrust settlement — and cash conversion (CFO/Adjusted EBITDA) collapsed to 8.8% in FY2025, the second of the last three years below the 50% cash-conversion threshold (RF-EQ-002). This sits alongside Adjusted EBITDA adjustments (€598.1m FY2025) that are 66% the size of the adjusted metric itself, and restructuring/impairment charges that have recurred in every one of the last five years. These are offset only partially by genuinely improving operating working-capital metrics (DSO, DIO, cash conversion cycle all improved every year, Section 3) and by the company's own transparent, well-labeled disclosure of every adjustment discussed here — nothing in this report rests on undisclosed information, but the scale of the gap between statutory and adjusted/guided figures is too large for a higher score.

## 10. The Single Biggest Quality Concern

The single biggest risk that DHER's reported earnings overstate economic reality is the FCF exclusion methodology itself. Delivery Hero now guides free cash flow "excluding extraordinary outflows" as a standing policy (adopted from January 1, 2025 onward, per FY24 Annual Report footnote 13) in a business that discloses ongoing, unresolved legal and regulatory risk across at least three jurisdictions (EU antitrust; rider employment-classification disputes in Spain, Italy, and Argentina). In FY2024, when those risks were only being provisioned (a non-cash accrual), the company's guided FCF and this agent's simple CFO-minus-capex-minus-lease calculation agreed closely (~€210–217m both ways) — the exclusion did essentially no work. In FY2025, when the antitrust case was actually settled in cash and Glovo Spain rider-transition payments were made, the exclusion did an implied ~€600–650m of work, turning a genuinely negative operating free cash flow year (-€246.3m, CFO minus total capex) into a headline "+€250m, up 15%." Because the underlying legal risks that generate these "extraordinary" outflows are not resolved — the company itself still flags them as live risks — there is a real possibility this pattern repeats: provisions get booked in one year (flattering that year's guided FCF), and the cash leaves in a later year (excluded from that year's guided FCF too, because it is again labeled "extraordinary"). That is a structural, repeatable gap between the cash DHER's core delivery/marketplace operations generate and the cash figure management presents to the market, not a one-time reporting quirk.

