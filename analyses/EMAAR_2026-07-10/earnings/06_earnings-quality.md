# Earnings Quality — EMAR (Emaar Properties PJSC, DFM: EMAAR)

**Reporting basis:** IFRS. **Currency:** AED millions unless stated (AED pegged to USD at ~3.673). **Fiscal year:** ends 31 December. **Cash flow data:** full audited IFRS Consolidated Statement of Cash Flows available for FY2024–FY2025 [FY25 AR, p.169], plus CIQ standardized cash flow FY2021–LTM Mar-2026 [CIQ Financials_Annual, Cash Flow tab]. **No partial-data cap applies** — cash conversion and the EBITDA→FCF bridge are fully assessable.

Upstream input read: `01_historical-financials.md` (present). Business-model module not read by this agent — the segment/cyclicality context is taken from the facts sidecar and filings.

**Plain-English glossary (first use):** *EBITDA* = rough operating cash profit before interest, tax and depreciation; *CFO* = cash generated from operations; *FCF* = free cash flow = CFO − capital spending (capex); *DSO/DIO/DPO* = days a firm takes to collect receivables / hold inventory / pay suppliers; *accrual* = profit booked before the cash arrives; *contract liability / advances* = cash a customer pays up-front for a home not yet handed over (a liability, not yet earned).

**Two EBITDA definitions are kept apart (§15):** the tables use **CIQ standardized EBITDA** (operating income + depreciation/amortisation) as the spine because it foots across all years; Emaar's own press-release "EBITDA" is a non-IFRS measure ~AED 1.0–1.5bn higher (it folds in net finance income and share of joint-venture results) and is reconciled in Section 4.

---

## 1. EBITDA → CFO → FCF Bridge (5 years + LTM)

All AED millions. Positive working-capital change = cash inflow. The bridge foots exactly: `EBITDA + working-capital change − cash tax paid + other operating items = CFO`.

| Item | FY2021 | FY2022 | FY2023 | FY2024 | FY2025 | LTM Mar-26 | Trend |
|---|---:|---:|---:|---:|---:|---:|---|
| EBITDA (CIQ std) | 7,803 | 9,332 | 14,405 | 17,563 | 24,132 | 25,201 | Improving |
| Working-capital change (total) | +1,053 | +8,229 | +2,662 | +5,619 | +9,432 | +6,537 | Inflow every yr |
| — of which **customer advances** (Δ contract liab.) | +2,103 | +4,138 | +3,294 | +8,442 | +8,229 | +8,347 | Large, cyclical |
| — of which development properties (Δ inventory) | n/d | n/d | n/d | −2,551 | −3,756 | n/d | Cash out (build) |
| — of which trade + unbilled receivables (Δ) | n/d | n/d | n/d | +1,998 | +4,583 | n/d | Inflow (collecting) |
| Tax paid (cash) | n/d | n/d | n/d | −224 | −844 | −874 | Rising |
| Other operating items (net — see note) | +1,705 | +1,380 | +2,764 | +1,524 | +738 | +1,109 | Shrinking |
| **CFO** | 10,561 | 18,942 | 19,831 | 24,481 | 33,458 | 31,973 | Improving |
| *(memo) Cash interest/finance costs paid — booked in financing, NOT in CFO* | −974 | −809 | −921 | −855 | −1,002 | −1,093 | — |
| Maintenance capex | not split | not split | not split | not split | not split | not split | — |
| Growth capex | not split | not split | not split | not split | not split | not split | — |
| Total capex (PP&E) | −1,288 | −960 | −578 | −534 | −934 | −991 | Small/stable |
| **FCF (CFO − total capex) — reported** | 9,273 | 17,982 | 19,253 | 23,948 | 32,524 | 30,982 | Improving |
| **Normalised operating FCF (ex customer-advance build) — LEAD figure (§15)** | **7,170** | **13,844** | **15,959** | **15,506** | **24,295** | **22,635** | Improving |
| **CFO / EBITDA %** | 135% | 203% | 138% | 139% | 139% | 127% | Stable-high |
| Normalised CFO / EBITDA % (ex advances) | 108% | 159% | 115% | 91% | 105% | 94% | Above 70% every yr |

**Capex split not disclosed — total capex used.** Emaar reports only total additions to property, plant and equipment (AED 934m FY25 [FY25 AR, Cash Flows, p.169]); it does not split maintenance vs growth. FCF may understate true recurring free cash because the real development outlay is **not** PP&E capex — it flows through operating cash as the change in development-property inventory (−AED 3,756m FY25) and through a separate investing line, "amounts incurred on investment properties" (−AED 1,015m FY25 [FY25 AR, Cash Flows, p.169]). PP&E capex is therefore genuinely small for this business.

**Lead figure is the normalised operating FCF (§15).** Reported FCF (CFO − capex) of **AED 30,982m LTM** is materially inflated by the build in customer advances — cash collected up-front for off-plan homes not yet handed over. Stripping that net advance build (AED 8,347m LTM) gives **normalised operating FCF of ~AED 22,635m LTM**, the recurring cash the operations throw off. Both are shown; the reported figure is labelled and is not the company's steady-state cash generation. The Section 5 one-off table reconciles to this adjustment.

**Note on "Other operating items" (net plug).** This line reconciles CIQ EBITDA to CFO and captures: the add-back of minority-interest earnings (CFO is total-entity; the CIQ base is profit attributable to owners), non-cash provisions (doubtful debt AED 60m + end-of-service AED 50m FY25), deferred tax, and the removal of the AED 801m non-cash share of joint-venture results — less small items. Crucially it EXCLUDES the two largest finance items: Emaar books **finance income received (AED 2,516m FY25) in investing** and **finance costs paid (AED 1,002m FY25) in financing**, so neither inflates nor deflates CFO [FY25 AR, Cash Flows, p.169]. For FY2025 this plug (+738) equals exactly the gap between IFRS "cash from operations before working-capital changes" (AED 24,870m [FY25 AR, p.169]) and CIQ EBITDA (24,132) — an independent cross-check that the bridge is clean. The plug has shrunk from +2,764 (FY23) to +738 (FY25) as prior non-cash provisions disappeared and cash taxes rose — so CFO increasingly leans on the customer-advance inflow.

---

## 2. Cash Conversion Assessment

CFO exceeds EBITDA every single year (CFO/EBITDA 127–203%, and 137–139% in each of the last three years) — well above the 70% "healthy" line and never near the 50% red-flag line. This is not judged from one year: it holds across all five years and the LTM. The important nuance is that the excess over EBITDA is driven by customer advances (a growth-phase, cyclical working-capital tailwind). Strip those out and **normalised CFO/EBITDA is still 91–159% (94% LTM, 105% FY25)** — above 70% in every period — so the underlying earnings are cash-backed even without the advance build. The trajectory: headline conversion is stable-high, but normalised conversion has eased from ~115% (FY23) toward ~94% (LTM) as the non-cash cushion faded and UAE corporate-tax cash payments began. Conclusion: earnings are genuinely cash-backed; the reported cash figure overstates the repeatable level.

---

## 3. Working Capital Trends

Figures below use the **true IFRS balances**, not CIQ's standardized lines. **CIQ mis-buckets ~AED 47bn of other assets into "Accounts Receivable" (58bn) and shows a trivial "Inventory" of AED 45m**, producing a misleading DSO of ~420–544 days and DIO of <1 day [CIQ Financials_Annual, Ratios tab]. The real IFRS figures (below) tell a cleaner and materially different story. Period-end basis used for 3-year comparability (average-based figures cited in notes).

| Metric | FY2023 | FY2024 | FY2025 | Direction | Risk |
|---|---:|---:|---:|---|---|
| DSO — true trade + unbilled receivables ÷ revenue | 235d | 159d | 82d | Falling sharply | Low — improving |
| DIO — development properties ÷ cost transferred to revenue | n/d* | 1,255d | 912d | Falling | Low — turning faster |
| DPO — operating payables ÷ COGS | n/d* | 349d | 289d | Falling | Low — paying faster |
| Cash conversion cycle (gross, DSO + DIO − DPO) | n/d | 1,065d | 705d | Falling | See note |
| *(memo)* Customer advances / contract liabilities (balance) | 22,858 | 32,495 | 40,724 | Rising | Funds the cycle |

*Denominators (pinned per template):* DSO on **revenue** (avg-based FY25 = 98d, FY24 = 168d); DIO and DPO on **COGS** (DIO uses the cost of development properties transferred to cost of revenue — AED 20,102m FY25 [FY25 AR, Note 13, p.193]; avg-based DIO FY25 = 866d, FY24 = 1,198d). *FY2023 DIO/DPO marked n/d — the FY2022 inventory/payables components were not pulled; the falling direction is unambiguous.*

**The cash conversion cycle is the wrong lens for this business, so read it with the advances memo.** A gross cycle of ~700 days looks alarming, but it is entirely funded by customers: contract-liability advances of **AED 40,724m** exceed trade + unbilled receivables (AED 11,137m) by ~3.7x and cover 81% of development-property inventory (AED 50,235m). On a customer-funded basis Emaar runs on **negative operating working capital** — buyers pre-pay the build. Every gross metric is also improving.

Checking the three named flags:
- **DSO rising >10% YoY (revenue-recognition concern)?** No — the opposite. True trade + unbilled receivables **fell 28%** (AED 15,484m → 11,137m) while revenue **rose 40%** [FY25 AR, Note 11, p.192]. Within that, unbilled receivables (contract assets from over-time revenue) fell from AED 14,018m to 8,688m. Revenue is being billed and collected, not parked in receivables. Strong positive signal.
- **DIO rising >15% YoY (inventory build / channel stuffing)?** No. Development properties rose only 11% (AED 45,096m → 50,235m) while the cost of properties sold rose 53% (AED 13,119m → 20,102m) [FY25 AR, Note 13, p.193] — inventory shrank relative to throughput. Net realisable value of the pipeline is AED 159,651m, ~3.2x carrying cost, so no impairment overhang.
- **DPO rising sharply (stretching suppliers)?** No — DPO fell (349d → 289d); Emaar is paying suppliers faster, not stretching them. No liquidity-stress signal.

---

## 4. Non-GAAP Adjustments

Emaar's disclosure is unusually clean on this axis: **it does not report an "adjusted EPS", "adjusted net income", or any restructuring/SBC add-back.** The only non-GAAP measure is a company-defined "EBITDA" in its press releases.

| Adjustment | Amount | Recurring? | Concern Level | Evidence |
|---|---:|---|---|---|
| Company "EBITDA" vs CIQ standardized EBITDA | +~AED 1.0–1.5bn (company higher) | Y (definitional) | Low | Company EBITDA folds in net finance income (AED 2.0bn FY25) + share of JV results; sits ~=PBT. [Q4/FY25 press release; CIQ IS] |
| Adjusted EPS / adjusted net income | None disclosed | — | None | Company reports only audited IFRS EPS [FY25 AR, Note 29] |
| Stock-based compensation excluded from "adjusted" | Not applicable | N | None | SBC immaterial — employees' share programme reserve is AED 1.68m against AED 94bn equity [FY25 AR, Balance Sheet, p.168] |

No adjustment recurs as an earnings-flattering "one-off", none exceeds 15% of GAAP earnings, and SBC is not being hidden (there is essentially none). The company EBITDA is higher than standardized EBITDA (a mild optimistic framing), but it reconciles transparently to profit-before-tax and is not used to manufacture an earnings number.

---

## 5. One-Off Items (last 3 years)

| Item | Period | Amount | Classification | Evidence |
|---|---|---:|---|---|
| Asset writedown / impairment (P&L) | FY2023 | −AED 1,256m | Genuine (downturn impairment; conservative) | CIQ IS "Asset Writedown"; FY23 AR |
| Asset writedown + provisions (CF add-back) | FY2023 | +AED 2,011m | Genuine (non-cash, depressed FY23 earnings) | CIQ Financials_Annual, Cash Flow tab |
| Gain on sale of assets (P&L) | FY2023 | +AED 700m | Genuine (disposal) | CIQ IS FY2023 |
| Fair-value remeasurement of pre-existing interest (Albro step-acquisition) | FY2024 | +AED 229m | Genuine (one-off acquisition gain) | FY25 AR, Cash Flows (add-back), p.169 |
| Gain on sale of investments (P&L) | FY2024 / FY2025 | +AED 229m / +AED 194m | Genuine (disposal), immaterial (<1% PBT) | CIQ IS |
| Customer-advance working-capital inflow | FY2023–LTM | +AED 3.3bn → +AED 8.3bn/yr | **Recurring cash but cyclical — reverses when sales slow** | FY25 AR, Note 22, p.206 (reconciles to Section 1 normalisation) |

Direction of the accounting one-offs is conservative, not aggressive: FY2021–FY2023 carried genuine impairments and heavy doubtful-debt provisions (AED 0.4–1.0bn/yr) during the Dubai downturn, which **depressed** reported earnings; these fell to ~AED 40–60m by FY2024–FY2025. So the recent earnings growth is partly the absence of prior drag — the past was under-stated, not the present over-stated. The single "recurring one-off" that matters is not a P&L item at all — it is the customer-advance cash inflow, which flatters CFO/FCF (handled in Section 1).

---

## 6. Accrual Quality Flags

| Flag | Triggered (Y/N) | Evidence |
|---|---|---|
| Revenue growing faster than CFO for 2+ years | **Y (mild)** | Annual: revenue +32.7%/+39.6% (FY24/FY25) vs CFO +23.4%/+36.7% — a small gap; CFO level stays far above net income. On a clean TTM basis the gap is wide (revenue +33.4% vs CFO +3.8% [01]) because the advance-driven CFO is plateauing — a "cash-conversion growth is decelerating" signal, not an earnings-vs-cash divergence. |
| Receivables growing faster than revenue | **N** | True trade + unbilled receivables FELL 28% while revenue rose 40% [FY25 AR, Note 11, p.192]. Strong negative (good). |
| Inventory growing faster than COGS | **N** | Development properties +11% vs cost-of-sales +53% [FY25 AR, Note 13, p.193]. |
| Deferred revenue declining (contract business) | **N** | Advances/contract liabilities RISING (AED 22.9bn → 32.5bn → 40.7bn); unsatisfied performance obligations (backlog) nearly doubled to AED 174.9bn [FY25 AR, Note 22, p.206]. |
| Capitalised costs growing as % of revenue | **Y (minor)** | Deferred sales commission (cost to obtain contracts) AED 2,892m → 4,583m, ~8.1% → ~9.2% of revenue [FY25 AR, Note 12, p.193]; capitalised borrowing cost AED 116m (0.2% of revenue). Standard IFRS 15, amortised over the contract; small. |
| Frequent accounting policy changes | **N** | Only routine comparative reclassification and the scheduled IAS 21 amendment (exchangeability, adopted 1 Jan 2025) [FY25 AR, Note 2]. |

The two triggers are both mild and explained (a plateauing advance-driven CFO growth, and a small, standard capitalised sales-commission asset). The hard-to-fake accruals — receivables and inventory — are moving decisively the *right* way.

---

## 7. Reported vs Adjusted Reconciliation

Emaar does **not** disclose adjusted EBITDA, adjusted EBIT, adjusted net income, or adjusted EPS. The table separates the company's non-IFRS EBITDA, the CIQ standardized figure, and the audited IFRS number.

| Metric (FY2025) | Reported | Adjusted / Standardized | Difference | % of Reported | Recurring? | Evidence |
|---|---:|---:|---:|---:|---|---|
| EBITDA | AED 25.6bn (company, non-IFRS) | AED 24,132m (CIQ std) | −AED ~1.5bn | ~6% | Y (definitional) | Q4/FY25 press release; CIQ IS |
| EBIT | Not reported by company | AED 22,552m (CIQ = operating income) | n/a | n/a | — | CIQ IS |
| Net income (to owners) | AED 17,599m (audited IFRS) | — (no company adjustment) | — | — | — | FY25 AR, Note 29 |
| EPS (basic & diluted) | AED 1.99 (audited IFRS) | AED 1.27 (CIQ vendor-normalized) | −AED 0.72 | −36% | — (vendor construct) | FY25 AR, Note 29; CIQ IS |

The only "adjusted" EPS in the data is CIQ's vendor-normalized figure (applies a standard tax charge and strips unusual items) — a **vendor construct, not a company adjustment**, so it is not evidence of management massaging. The company's own reported EPS is the audited IFRS number.

---

## 8. Accounting Trap Checklist

| Trap | Triggered? | Evidence | Severity /100 *(higher = WORSE — inverted)* |
|---|---|---|---:|
| Stock-based compensation excluded from adjusted earnings | N | SBC immaterial (AED 1.68m); no adjusted EPS reported [FY25 AR, p.168] | 5 |
| Restructuring costs recur every year | N | Writedowns/restructuring in FY21–23 only; zero FY24–FY25 [CIQ IS] | 10 |
| Capitalised costs rising faster than revenue | Y (minor) | Deferred sales commission ~8.1%→9.2% of revenue; standard IFRS 15 [FY25 AR, Note 12] | 25 |
| Receivable factoring / supplier finance disclosed | N | None disclosed; trade payables non-interest-bearing [FY25 AR, Note 21, p.206] | 5 |
| Inventory write-downs or reserve releases | N | Dev. properties at lower of cost/NRV, NRV 3.2x cost; doubtful-debt reversal only AED 24m [FY25 AR, Notes 11, 13] | 10 |
| Revenue recognised before cash-collection risk is clear | Y (low) | Over-time (POC) recognition creates AED 8.7bn unbilled contract assets — but these are FALLING and are dwarfed by AED 40.7bn customer advances, so collection risk is low [FY25 AR, Notes 11, 22] | 25 |
| Change in useful life / depreciation assumptions | N | Not observed; investment property at cost less depreciation, no assumption change [FY25 AR, Note 18] | 10 |
| Tax rate unusually low or boosted by one-off | N (earnings); note cash-tax lag | Effective rate RISING 1.5%→13% as UAE CT phases in — not artificially low. But cash tax paid (AED 844m) lags accrued tax (AED 3,331m); the gap builds tax payable (AED 1.2bn→3.8bn) and flatters CFO by ~AED 2.5bn/yr [FY25 AR, Note 9; CIQ IS] | 35 |
| Large fair-value / mark-to-market gains | N | Investment property at **cost** (not fair-valued through P&L); FV change in earnings only AED 229m FY24, zero FY25 [FY25 AR, Note 18, KAM] | 5 |

Most traps are clean. The two low-severity triggers (capitalised sales commission; over-time revenue recognition) are standard and well-collateralised by advances. The one item worth carrying to the synthesizer is the **cash-tax payment lag** — not an earnings trap (the P&L tax is fully accrued) but a CFO tailwind that fades as UAE corporate-tax cash payments normalise.

---

## 9. Earnings Quality Score

**Score: 81 / 100** — band: *Cash-backed, repeatable, minimal adjustments* (bottom of the top band).

Single most important reason: **the reported earnings are fully cash-backed even after stripping the customer-advance tailwind** — normalised CFO/EBITDA is 91–159% across five years (94% LTM) — with the hardest-to-fake accruals moving the right way (true trade + unbilled receivables down 28% while revenue rose 40%; development inventory turning faster), investment property held at cost (no fair-value gains inflating profit), negligible stock comp, and no adjusted-EPS engineering. It is held at the band floor rather than mid-80s by one honest caveat: **reported FCF (AED 30,982m LTM) overstates steady-state cash by ~27%** versus normalised operating FCF (~AED 22,635m), because both the customer-advance build (~AED 8.3bn/yr) and the corporate-tax payment lag (~AED 2.5bn/yr) are cyclical tailwinds that reverse when Dubai off-plan sales cool.

---

## 10. The Single Biggest Quality Concern

The reported earnings are clean; the risk sits in the **cash-flow headline, not the P&L**. Emaar's CFO and reported FCF are flattered by two cyclical tailwinds that will not repeat at current magnitude: (1) the net build in customer advances — AED 55.4bn of new off-plan collections against AED 47.2bn released to revenue, a +AED 8.2bn working-capital inflow that is ~25% of CFO and depends on Dubai pre-sales continuing to outrun handovers; and (2) a corporate-tax payment lag, where cash tax paid (AED 844m) is a fraction of accrued tax (AED 3,331m), padding CFO by ~AED 2.5bn while the tax-payable balance triples. Both are real cash today, both are well-disclosed, and neither means the earnings are fictitious — normalised operating FCF of ~AED 22.6bn is still large. The single thing a downstream reader must not do is extrapolate the AED 31bn reported FCF as recurring: when the Dubai property cycle turns and new sales slow, the advance inflow flattens or reverses and the tax lag closes, so cash generation would step down toward the normalised level even if the P&L holds up. Earnings quality is high; the reported cash number is the part that needs a haircut.

---

## Citations

- **[FY25 AR]** FY2025 Integrated Annual Report (audited, IFRS, AED) — Consolidated Statement of Cash Flows p.169; Consolidated Statement of Financial Position p.168; Note 9 (Income tax); Note 11 (Trade & unbilled receivables) p.192; Note 12 (Other assets/receivables) p.193; Note 13 (Development properties) p.193; Note 15 (Revenue from contracts, recognition policy) p.177; Note 18 (Investment properties — cost model); Note 21 (Trade & other payables) p.206; Note 22 (Advances from customers) p.206; Note 23 (Retentions payable); Note 29 (EPS); Independent Auditor's Report — Key Audit Matter (NRV/recoverable amount of properties) p.~150.
- **[FY24 AR]** FY2024 Integrated Annual Report (audited, IFRS) — Note 11 comparative (FY2023 trade & unbilled receivables AED 17,255,072k); Note 13 comparative.
- **[FY23 AR]** FY2023 Annual Report (audited, IFRS) — FY2021–FY2023 impairment/writedown context.
- **[CIQ Financials_Annual]** Emaar Properties PJSC DFM EMAAR Financials_Annual.xls — Income Statement, Balance Sheet, Cash Flow, Ratios, Industry-Specific tabs (FY2020–FY2025 + LTM Mar-31-2026); source of standardized EBITDA/EBIT, capex, CIQ working-capital days, vendor-normalized EPS.
- **[Q4/FY25 press release]** Q4 / FY2025 Earnings Press Release (DFM intimation), 12 Feb 2026 — company EBITDA AED 25.6bn, PBT AED 25.7bn.
- **[ciq_facts.json]** deterministic facts sidecar — LTM EBITDA 25,200.7; LTM CFO 31,973.0; Levered FCF 3,066.7 (a different, after-interest definition — not the CFO−capex figure); segment mix Real Estate 80% / Leasing-Retail 15% / Hospitality 5%.
- **[01]** Upstream `01_historical-financials.md` — annual/TTM spine and the customer-advance flag routed to this agent.

### Self-check
- EBITDA→FCF bridge populated FY2021–LTM with citations; every column foots exactly (verified by executed computation, not mental arithmetic).
- Capex maintenance/growth split explicitly stated as not disclosed; total capex used; the true development outlay (inventory + investment-property lines) noted so FCF is not mis-read.
- CFO/EBITDA computed and cross-checked; assessed across all years, not one.
- Working-capital metrics use actual IFRS balance-sheet figures (Notes 11/13/21/22); CIQ's mis-bucketed receivables/inventory artifact flagged and corrected; denominators pinned (DSO on revenue, DIO/DPO on COGS).
- Non-GAAP adjustments sourced from company disclosure — the only one is company-defined EBITDA; no adjusted EPS exists.
- Accrual flags carry explicit Y/N with evidence; recurring "one-off" (customer-advance CFO flatter) flagged as recurring/cyclical.
- Score matches band description (81 = bottom of "cash-backed, repeatable, minimal adjustments").
- §15 lead applied: normalised operating FCF is the lead figure with reported FCF labelled beside it; the Section 5 one-off table reconciles to the normalisation.
- Major accounting judgment flagged for the synthesizer: reported CFO/FCF overstates steady-state by ~27% (customer-advance build + corporate-tax payment lag), both cyclical.
- No banned phrases used.
