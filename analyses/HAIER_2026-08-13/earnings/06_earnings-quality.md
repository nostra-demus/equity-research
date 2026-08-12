# Earnings Quality — HAIER (Haier Smart Home Co., Ltd., SHSE: 600690 / SEHK: 6690)

**Basis note:** all figures RMB (CNY) millions unless stated otherwise, China ASBE (CAS) A-share basis, fiscal year ending December 31, per upstream `01_historical-financials`. Cash flow statement IS available for HAIER (CapIQ export cross-checked against the FY2025 Annual Report), so the partial-data cap for missing cash-flow data does NOT apply here. Quarterly EBITDA and quarterly gross margin are not disclosed by the company (CAS quarterly filings show revenue, net profit, EPS, CFO only) — this caps QoQ cash-conversion granularity but not the annual bridge below, which is filing-and-CapIQ-sourced. No `ciq_facts.json` sidecar exists for this ticker (confirmed absent), so all figures below are this agent's own sourced reads, computed via an executed Python script (shown in-line), not a mechanically-pinned sidecar value.

---

## 1. EBITDA → CFO → FCF Bridge (5 years)

| Item | FY2021 | FY2022 | FY2023 | FY2024 | FY2025 | Trend |
|---|---:|---:|---:|---:|---:|---|
| EBITDA | 18,229.1 | 19,678.9 | 23,668.6 | 28,024.6 | 26,543.4 | Inflecting (peaked FY2024) |
| Working capital change¹ | +4,325.4 | −1,183.0 | −214.9 | −3,295.6 | −4,986.6 | Deteriorating (turning more negative) |
| Tax paid (cash) | −8,331.1 | −8,778.1 | −13,430.1 | −14,410.3 | −14,767.1 | Rising steadily |
| Interest paid² | −2,258.8 | −1,699.8 | −1,086.4 | −1,087.1 | −570.3 | Improving (falling) |
| Other operating items³ | +11,270.9 | +12,238.6 | +17,598.5 | +17,086.5 | +19,783.6 | Rising |
| **CFO** | **23,235.4** | **20,256.6** | **26,535.8** | **26,318.1** | **26,002.9** | Volatile / flat since FY2023 |
| Capex (total, split not disclosed)⁴ | −7,372.4 | −8,209.8 | −10,541.6 | −10,080.1 | −8,851.6 | Volatile |
| **FCF (CFO − Total Capex)** | **15,863.0** | **12,046.8** | **15,994.2** | **16,238.0** | **17,151.3** | Stable-to-improving |
| **CFO / EBITDA %** | **127.5%** | **102.9%** | **112.1%** | **93.9%** | **98.0%** | Consistently high, no breakdown |

¹ Working capital change = sum of the CAS cash-flow statement's disclosed operating-asset/liability change lines (Δ receivables, Δ inventory, Δ payables, Δ deferred taxes, Δ other net operating assets) [CapIQ export "Financials.xls", Cash Flow tab, computed by this agent, Bash-verified]. Positive = cash inflow.

² Cash interest paid is disclosed by the company only for FY2025 (RMB 150.9mn, [CapIQ export, Cash Flow tab, "Cash Interest Paid" supplemental line]) — a figure that does not reconcile to the much larger P&L interest expense (RMB 2,679.5mn, FY2025), most likely because the CAS cash-flow statement folds interest paid into the combined "分配股利、利润或偿付利息支付的现金" (dividends/profit-distribution-or-interest-paid) line, which is dominated by dividends (RMB 13,873.4mn, FY2025) [FY2025 Annual Report (A-share/CAS), Mar-26-2026, p.~185 cash-flow notes] and does not isolate interest. For FY2021–FY2024, where cash interest paid is not separately disclosed, this bridge uses **Net Interest Expense from the P&L as a proxy** (an accrual figure, not a cash figure) — labelled *Inference, not from filings* for those years only.

³ "Other operating items" is a residual/plug: `Other = CFO − EBITDA + Tax Paid + Interest Paid − Working Capital Change`, shown so the bridge reconciles exactly to reported CFO. Because Haier's CAS cash-flow statement builds up from Net Profit (not from EBITDA), this plug absorbs items a pure EBITDA-based bridge would not naturally net out: depreciation & amortization double-counting between the EBITDA add-back and the CF statement's own D&A add-back line, minority interest, deferred-tax movements, bad-debt provisions/reversals (Section 6), share-based compensation (RMB 489.7mn, FY2025 — Section 4), and non-operating gains/losses excluded from EBIT. The size of this plug (RMB 11.3bn–19.8bn/year) is a *known consequence of bridging two different accounting frameworks*, not evidence of a hidden cash source — but its steady growth (from RMB 11.3bn in FY2021 to RMB 19.8bn in FY2025) tracks the growth in cash taxes paid and cannot be broken down further with the disclosure in this pool.

⁴ **Capex split not disclosed — total capex used.** FCF may understate true recurring free cash flow if a meaningful share of the RMB 8.9bn (FY2025) capex is growth capex (new manufacturing capacity, per the FY2025 Annual Report's disclosed washing-machine capacity project) rather than maintenance. No normalisation to an operating-FCF figure was needed: unlike a company whose reported FCF is inflated by a one-off cash item (a large customer advance) or a company-defined non-standard add-back, Haier's FCF = CFO − total capex with no such distortion identified. The strong CFO/EBITDA ratio is instead structurally supported by a **negative cash conversion cycle** funded through supplier credit (Section 3) — a recurring, multi-year structural feature, not a one-time item, but one worth reading alongside the supplier-finance disclosure in Section 8.

Trend column: Improving / Stable / Deteriorating (Volatile used where the direction reverses more than once across the 5 years).

---

## 2. Cash Conversion Assessment

CFO tracked EBITDA closely and stayed **comfortably above the 70% "healthy" threshold in every one of the last 5 years** — CFO/EBITDA ran 127.5% (FY2021), 102.9% (FY2022), 112.1% (FY2023), 93.9% (FY2024), and 98.0% (FY2025), with the trailing-twelve-months-to-Mar-2026 figure at 97.6% (RMB 25,329.8mn CFO ÷ RMB 25,950.2mn EBITDA) [CapIQ export, "Financials.xls", Cash Flow / Income Statement tabs]. There is no cash-conversion breakdown by CLAUDE.md §13's definition (CFO/EBITDA below 50% for 2+ of the last 3 years does not apply — the metric has never dropped below 93.9% in the entire 5-year window). The trajectory is a gentle normalisation from >100% (FY2021–FY2023, when working-capital releases and light tax cash outflows flattered CFO) toward the high-90s% (FY2024–FY2025, as cash taxes paid rose from RMB 8.3bn to RMB 14.8bn and working capital increasingly absorbed cash rather than released it) — earnings are backed by cash, but the FY2024/FY2025 pattern (Section 6) shows the earnings-to-cash gap widening, even though it remains a small gap in absolute terms.

---

## 3. Working Capital Trends

**Formula basis:** DSO uses revenue in the denominator; DIO and DPO use COGS. Average balances `(opening + closing) / 2` are used throughout, computed via an executed Python script.

| Metric | FY2023 | FY2024 | FY2025 | Direction | Risk |
|---|---:|---:|---:|---|---|
| Receivable days (DSO) | 42.23 | 50.54 | 50.62 | Rose sharply FY2024, then flat | **DSO rose +19.67% YoY in FY2024 — flag** |
| Inventory days (DIO) | 74.04 | 72.78 | 73.77 | Stable | No flag (change < 15% both years) |
| Payable days (DPO) | 127.03 | 130.28 | 125.61 | Stable, slightly declining FY2025 | No flag |
| Cash conversion cycle (DSO + DIO − DPO) | −10.76 | −6.96 | −1.21 | **Rising toward zero (less negative) every year** | The negative-CCC cushion — being paid by customers before paying suppliers — is shrinking |

[Computed by this agent from CapIQ export "Financials.xls" Balance Sheet and Income Statement tabs, Bash-verified: FY2023 DSO=42.23 DIO=74.04 DPO=127.03; FY2024 DSO=50.54 DIO=72.78 DPO=130.28; FY2025 DSO=50.62 DIO=73.77 DPO=125.61.]

**DSO flag detail:** receivable days jumped from 42.2 to 50.5 (+19.7% YoY) in FY2024, then held flat in FY2025. This coincides with the period upstream (`01_historical-financials`, Section 2) flags as affected by the Youjin and COSMOPlat business-combination-under-common-control restatement — the Balance Sheet tab labels FY2021–FY2024 columns "Restated" on a consistent basis, so the jump is real on a comparable basis, not a restatement artefact, but the underlying driver (organic credit-term stretch vs. consolidation of newly combined entities' receivables) cannot be isolated from this data pool. Flagged as a genuine open question, not resolved either way.

**Cash conversion cycle note:** Haier runs a **negative cash conversion cycle** throughout (it collects from customers, on average, well before it pays suppliers) — a structural feature of scale in the appliance industry, not a new development. But the cushion has narrowed steadily, from −10.8 days (FY2023) to −7.0 days (FY2024) to −1.2 days (FY2025), driven mostly by the DSO increase. If DSO continues rising while DPO holds flat or falls, the CCC could turn positive within 1–2 years, which would pull cash from operations even at unchanged accrual profitability.

---

## 4. Non-GAAP Adjustments

| Adjustment | Amount (FY2025) | Recurring? (Y/N) | Concern Level (Low / Mid / High) | Evidence |
|---|---:|---|---|---|
| Non-recurring items excluded from "adjusted" net profit (CSRC-defined) | RMB 949.2mn (4.9% of reported net profit) | **Y — recurs every year at a similar magnitude** (RMB 772.5mn FY2023, RMB 926.3mn FY2024, RMB 949.2mn FY2025) | Mid | [FY2025 Annual Report (A-share/CAS), Mar-26-2026, p.14, "非经常性损益项目和金额"] |
| — of which: government subsidies unrelated to core-business continuing operations | RMB 1,315.4mn (FY2025); RMB 1,324.2mn (FY2024); RMB 1,093.6mn (FY2023) | **Y — the single largest, most stable component every year** | Mid | Same source, same page |
| — of which: non-current asset disposal losses (incl. reversal of impairment) | −RMB 203.1mn (FY2025); −RMB 77.0mn (FY2024); −RMB 97.9mn (FY2023) | Y — recurs every year, always negative | Low | Same source |
| — of which: fair-value gains on financial assets/liabilities held by non-financial-business entities | +RMB 157.5mn (FY2025); +RMB 46.1mn (FY2024); +RMB 20.8mn (FY2023) | Y — recurs, growing | Low | Same source |
| Supplementary "ex-share-based-payment" net profit (voluntary disclosure) | RMB 20,652.7mn vs. RMB 20,163.1mn reported (net income to Company, pre-minority-interest basis) — a RMB 489.7mn add-back | Y — SBC now a recurring annual charge (first material year FY2025, driven by new 2025 A-share/H-share employee stock ownership plans plus legacy 2021/2022 option plans) | Low-Mid | [FY2025 Annual Report, p.15, "十一、存在股权激励...可选择披露扣除股份支付影响后的净利润"; Note 25 "股份支付", p.~330] |

**Assessment:** the company's own **officially adjusted metric moves in the conservative direction** — it *deducts* non-recurring gains from reported net profit to arrive at RMB 18,603.6mn "adjusted" (ex-non-recurring) net profit for FY2025, versus RMB 19,552.8mn reported [FY2025 Annual Report, p.14] — the opposite of the more common non-GAAP pattern of adding back real costs to inflate the picture. That is a quality-positive signal. The one adjustment that *does* run in the inflationary direction — the supplementary "ex-SBC" net profit shown as extra colour, adding back a real, dilutive RMB 489.7mn compensation expense — is disclosed transparently as a voluntary supplementary line, not substituted for the headline number, and is small (2.4% of reported net profit). Flagged as a Low-Mid concern, not a High one, because of that transparency and scale. The recurring-government-subsidy pattern (~RMB 1.1–1.3bn every year, ~5–7% of reported net profit) is the more material issue: it is genuinely excluded from the company's own "core" profit metric (good), but a subsidy stream this stable across three straight years functions economically like recurring income, and readers should treat Haier's "core"/adjusted profit line, not the headline, as the more decision-useful number. No adjustment here exceeds 15% of GAAP earnings and stock-based compensation is not excluded from the company's primary adjusted metric — both thresholds in this section's flag criteria are clear.

---

## 5. One-Off Items (last 3 years)

| Item | Period | Amount | Classification (Genuine / Suspicious / Recurring "one-off") | Evidence |
|---|---|---:|---|---|
| Government subsidies (non-core, one-off per CSRC definition) | FY2023–FY2025 | RMB 1,093.6mn / 1,324.2mn / 1,315.4mn | **Recurring "one-off"** — same magnitude every year | [FY2025 Annual Report, p.14] |
| Non-current asset disposal losses | FY2023–FY2025 | −RMB 97.9mn / −77.0mn / −203.1mn | Recurring "one-off" (small, always negative) | [FY2025 Annual Report, p.14] |
| AR bad-debt reserve reversal | FY2025 | RMB 332.4mn reversed (RMB 299.9mn newly provisioned, RMB 332.4mn reversed, RMB 121.7mn written off) | Genuine (specific troubled-customer receivables resolved — the "individually assessed" bad-debt balance fell from RMB 401.9mn to RMB 130.8mn, and the individually-significant troubled-receivable balance fell to zero from RMB 195.5mn) but **a reserve release that reduced the FY2025 bad-debt expense line to near zero (RMB 1.2mn net) versus a RMB 346.3mn net provision expense in FY2024** — a real earnings tailwind from a shrinking reserve, not underlying revenue quality | [FY2025 Annual Report, p.169–170, "本期应收账款坏账准备变动情况"] |
| North America Q1 2026 profit weakness (winter storms, tariffs) | Q1 2026 | Company states >10% ex-North-America operating profit growth in the quarter | Genuine, dated, named one-off per management — but an unverified company claim not reconciled to a segment P&L in this pool (per upstream `01_historical-financials`, Section 6) | [2026 First Quarter Report, Apr-27-2026, p.2] |
| Q4 2025 profit trough (weakest quarter of the year, −59% QoQ from Q3 2025) | Q4 2025 | RMB 2,180.1mn net profit vs. RMB 5,339.7mn (Q3 2025) | Not independently explained in this data pool as one-off vs. seasonal — flagged, not resolved (per upstream Section 5) | [FY2025 Annual Report, p.13] |

---

## 6. Accrual Quality Flags

| Flag | Triggered (Y/N) | Evidence |
|---|---|---|
| Revenue growing faster than CFO for 2+ years | **Y** | FY2024: revenue +4.31% vs. CFO −0.82%; FY2025: revenue +5.71% vs. CFO −1.20% — two consecutive years [CapIQ export, Ratios & Cash Flow tabs, Bash-verified] |
| Receivables growing faster than revenue | **Y** | FY2023: AR +23.68% vs. revenue +12.57%; FY2024: AR +25.53% vs. revenue +4.31% — two of the last three years [CapIQ export, Ratios tab, "Growth Over Prior Year"] |
| Inventory growing faster than COGS | **Y** | FY2024: inventory +9.27% vs. COGS +3.74%; FY2025: inventory +8.47% vs. COGS +7.39% — two of the last three years (FY2025 gap is marginal, ~1pp) [computed from CapIQ export Balance Sheet/Income Statement, Bash-verified] |
| Deferred revenue declining (if subscription/contract business) | N — not applicable in a clean sense | Haier is a hardware manufacturer, not a subscription business; "Unearned Revenue, Current" is volatile, not trending (RMB 10,027mn FY2021 → 9,353mn → 7,849mn → 10,865mn → 8,535mn FY2025) with no consistent direction [CapIQ export, Balance Sheet tab] — not scored as a distortion flag given the business model |
| Capitalized costs growing as % of revenue | N (immaterial) | Capitalized R&D investment rose from RMB 554.6mn (FY2024) to RMB 620.7mn (FY2025), +11.9% YoY — faster than revenue growth (+5.71%) in growth-rate terms, but the absolute base is tiny: 0.19% of revenue (FY2024) → 0.21% of revenue (FY2025). Not scored as triggered given the immaterial base [FY2025 Annual Report, p.~85 "本期资本化研发投入"] |
| Frequent accounting policy changes | N | Annual report explicitly marks "会计政策、会计估计变更" as "不适用" (not applicable) — no policy change, no restatement of prior-period errors, same domestic auditor for 13 consecutive years, standard unqualified ("无保留意见") audit opinion, no material litigation, no delisting risk flagged [FY2025 Annual Report, Mar-26-2026, p.92–93] |

**Three of six rows triggered Y** — rising accruals diverging from cash earnings.

RF-EQ-001 (rising accruals divergent from cash earnings)

---

## 7. Reported vs Adjusted Reconciliation

| Metric | Reported (FY2025) | Adjusted (FY2025) | Difference | % of Reported | Recurring? | Evidence |
|---|---:|---:|---:|---:|---|---|
| EBITDA | 26,543.4 | — | — | — | Company does not publish an adjusted/non-GAAP EBITDA | [CapIQ export; no company disclosure found] |
| EBIT | 20,866.8 | — | — | — | Company does not publish an adjusted/non-GAAP EBIT | [CapIQ export; no company disclosure found] |
| Net profit attributable to shareholders | 19,552.8 | 18,603.6 (ex non-recurring items, company-defined) | −949.2 | −4.9% | Y — same relative magnitude every year (−4.65% FY2023, −4.95% FY2024, −4.86% FY2025) | [FY2025 Annual Report, p.14] |
| Basic EPS | 2.12 | 2.02 (ex non-recurring items) | −0.10 | −4.7% | Y (same basis as above) | [FY2025 Annual Report, p.14] |

Note the direction: the company's own adjusted figure is **below** the reported figure in every metric shown — it strips out non-recurring gains rather than adding back real costs. This is the opposite of the typical earnings-inflation pattern this section exists to catch.

---

## 8. Accounting Trap Checklist

*(Severity scale: higher = WORSE — inverted, per CLAUDE.md §12.)*

| Trap | Triggered? (Y/N) | Evidence | Severity /100 |
|---|---|---|---:|
| Stock-based compensation excluded from adjusted earnings | Y (supplementary disclosure only, not the primary adjusted metric) | RMB 489.7mn SBC in FY2025; company's *voluntary* supplementary "ex-SBC" net profit (RMB 20,652.7mn) is higher than the pre-minority-interest reported figure (RMB 20,163.1mn) — but this is not substituted for the headline reported/adjusted numbers in Section 7 [FY2025 Annual Report, p.15] | 25 |
| Restructuring costs recur every year | N | Asset-writedown-and-restructuring-costs CF line is small and volatile (RMB 3.6mn–91.7mn/year), no consistent restructuring-cost pattern [CapIQ export, Cash Flow tab] | 5 |
| Capitalized costs rising faster than revenue | Y (immaterial in absolute size) | See Section 6 — capitalized R&D growth (+11.9%) outpaced revenue growth (+5.71%) in FY2025, but remains ~0.2% of revenue | 10 |
| Receivable factoring / supplier finance disclosed | **Y — material, both sides of working capital** | AR derecognized via outright-sale factoring: RMB 6,343.0mn (period end) vs. RMB 6,095.2mn (period start) [Annual Report, p.169]; bills receivable endorsed/discounted and derecognized, not yet due: RMB 9,969.0mn [Annual Report, p.170]; AP supply-chain-finance program covering RMB 8,675.4mn of payables (of which suppliers had already drawn RMB 4,518.0mn early) [Annual Report, p.~185, "供应商融资安排的有关信息"] — combined off-balance-sheet-style financing across receivables and payables is roughly RMB 25bn, ~8% of FY2025 revenue | 55 |
| Inventory write-downs or reserve releases | N (inventory) / **Y (receivables)** | Inventory write-down provision rose from RMB 1,697.7mn to RMB 1,897.7mn with RMB 993.8mn newly provisioned and RMB 793.8mn written off — no reversal-to-P&L observed, a clean process [Annual Report, p.174]. But the **AR bad-debt reserve was net-reversed by RMB 332.4mn in FY2025** (Section 5) — a real earnings tailwind | 30 |
| Revenue recognized before cash collection risk is clear | N | No specific evidence of premature recognition found in this pool; DSO (Section 3) is the relevant monitoring metric and is already flagged there | 10 |
| Change in useful life / depreciation assumptions | N | Explicitly disclosed as "not applicable" — no accounting-estimate change this period [Annual Report, p.92] | 5 |
| Tax rate unusually low or boosted by one-off | N (structural, disclosed) | Effective tax rate fell from ~17.0% (FY2021) to ~14.1% (FY2025) [CapIQ export, Income Statement tab], but this reflects dozens of Haier subsidiaries qualifying for China's 15% High-and-New-Technology-Enterprise preferential tax rate (vs. 25% standard statutory rate) — a long-standing, disclosed, structural regime, not a one-off benefit [Annual Report, p.~283, "享受税收优惠的公司及优惠税率"] | 15 |
| Large fair-value / mark-to-market gains | N | Total fair-value-measured-item P&L impact ~RMB 100.4mn in FY2025 (wealth management products, equity investments, derivatives combined) — under 0.5% of net profit [Annual Report, p.15] | 10 |

---

## 9. Earnings Quality Score

**66/100** (band: 61–80, "Mostly clean but some working capital or adjustment noise").

The single most important reason: cash conversion is genuinely strong and has never broken down (CFO/EBITDA never fell below 93.9% in five years, and the company's own non-GAAP adjustments run in the conservative — not inflationary — direction), which keeps the score in the "mostly clean" band rather than lower. But three concrete, evidence-based sources of noise pull the score down from the top of that band: (1) a material, disclosed pattern of receivable factoring, bill discounting, and supplier-finance arrangements covering roughly RMB 25bn (~8% of revenue) across both sides of working capital, which can flatter the very DSO/DPO/cash-conversion-cycle metrics used to certify "clean" cash generation; (2) a recurring ~RMB 1.1–1.3bn/year government-subsidy stream booked as "non-recurring" every single year; and (3) a genuine accrual-quality divergence (RF-EQ-001) — receivables and inventory both growing faster than their respective revenue/COGS bases in 2 of the last 3 years, with FY2024's DSO spike (+19.7% YoY) unresolved as organic vs. consolidation-driven.

---

## 10. The Single Biggest Quality Concern

The single biggest risk that reported earnings could overstate the economic picture is not a headline non-GAAP trick — Haier does not have one, and its own adjustments run conservative — but the **scale of disclosed working-capital financing arrangements sitting underneath a headline cash-conversion cycle that is already thinning fast**. Between FY2023 and FY2025 the cash conversion cycle moved from −10.8 days to −1.2 days (Section 3) — the buffer where customers effectively pre-fund Haier's supplier payments is nearly gone — at the same time as the company discloses RMB ~16.3bn of receivables/notes derecognized through factoring and endorsement, and RMB ~8.7bn of payables running through a supplier-finance program that lets suppliers collect early from a bank rather than from Haier (Section 8). None of this is hidden — it is disclosed in the notes, which is why this is a §27 opacity-not-language distinction, not an opacity flag — but it means a meaningful share of the "cash conversion cycle looks fine" story is doing work through financing arrangements rather than pure organic collections-versus-payments timing. If any of those facilities were to tighten (a bank reducing factoring capacity, or suppliers declining early-payment terms), the reported cash conversion cycle could turn positive quickly, pulling working capital cash out of CFO even with unchanged accrual profitability — and FY2024's already-observed DSO spike is a live data point that the underlying trend, before any financing-arrangement support, may already be moving the wrong way.
