# Coverage & Covenants — EMAR

*Emaar Properties PJSC (DFM: EMAAR) — Dubai / UAE real-estate developer. Reporting standard **IFRS**; currency **AED (UAE dirham), millions** unless stated; fiscal year ends **31 December**. Coverage is measured on **LTM to 31 Mar 2026** (latest Q1-2026 balance sheet paired with LTM income statement). Filings are in English — no translation gap. Debt and the EBITDA base are taken from `01_capital-structure-and-leverage.md`; EBIT, interest and capex from the audited FY2025 annual report and `earnings/01_historical-financials.md`; EBITDA cash-quality from `earnings/06_earnings-quality.md`.*

*Plain-English note (first use): **coverage** = how many times operating profit covers the interest bill; **EBITDA** ≈ operating cash profit before interest, tax and depreciation; **fixed-charge coverage** = profit-after-reinvestment ÷ all fixed financing charges (interest + lease + finance-cost unwinding); **covenant** = a promise to lenders (e.g. keep leverage below X) that, if broken, lets them demand repayment; **covenant headroom** = the signed distance between the actual ratio and the covenant limit (positive = room to spare); **gearing** = net debt ÷ (net debt + capital), a debt-to-capital measure.*

All coverage ratios and covenant-headroom percentages below were produced by an **executed Python snippet** (command + printed result shown in this agent's working log), not mental arithmetic — the EBITDA/interest result (52.1x) ties exactly to the pinned `ciq_facts.json` `interest_coverage_x` = 52.1.

---

## 1. Coverage Ratios

Gross interest = **finance costs on borrowings** (the cash cost of the debt), LTM **AED 483.5m** (CIQ Interest Expense; reconciles to the audited FY2025 Note 7(b) "Finance costs on borrowings" AED 492.1m). EBITDA basis = **CIQ standardized / reported-IFRS EBITDA** (operating income + depreciation/amortisation), LTM **AED 25,200.7m** — the conservative spine; Emaar's own non-IFRS "EBITDA" is ~AED 1.0–1.5bn higher (it folds in net finance income), so using the company figure would make coverage look *even larger*.

| Ratio | Value | Source |
|---|---:|---|
| EBITDA / interest | **52.1x** | 25,200.7 / 483.5 [CIQ IS, LTM Mar-26; ties ciq_facts 52.1x] |
| EBIT / interest | **48.6x** | 23,520.7 / 483.5 [CIQ IS, LTM] |
| (EBITDA − capex) / interest | **50.1x** | (25,200.7 − 991.4) / 483.5; capex = PP&E capex AED 991.4m LTM [CIQ CF] |
| Fixed-charge coverage | **23.5x** | (25,200.7 − 991.4) / 1,028.1; denominator = FY2025 **total** finance costs (borrowing interest + lease interest + unwinding of long-term payables) [FY2025 AR, Note 7(b)] |

**Interest is GROSS, not net — and the net picture is more extreme, not less.** Per module calculation standard 5, coverage uses gross interest. On a **net** basis Emaar is a net *creditor*: LTM interest-and-investment income of **AED 2,593.8m** is ~5.4x its **AED 483.5m** interest expense, giving **net finance income of ~AED 2,110m** [CIQ IS, LTM; FY2025 AR Note 7]. So a "net interest coverage" ratio is not meaningful — the company earns more on its cash than it pays on its debt.

**Conservative interest variants (coverage stays >20x on every definition):** on FY2025 **total finance costs** (AED 1,028.1m, the broadest measure) EBITDA/interest = **24.5x**; on **all-in interest incurred** (borrowing interest AED 492.1m + capitalised interest AED 116.4m) = **41.4x**; on **cash finance costs paid** (AED ~1,093m LTM) = **23.1x** [FY2025 AR Note 7; earnings/06]. The narrowest gross measure (borrowing interest only) gives 52.1x; the broadest gives ~23x.

**EBITDA is cash-backed — coverage is not flattered by non-cash profit.** `earnings/06_earnings-quality.md` scores earnings quality **81/100** and shows **normalised CFO/EBITDA of 91–159% across five years (94% LTM)** even after stripping the customer-advance tailwind — so the EBITDA carrying this interest is real cash, not addbacks. The item `earnings/06` flags as *over*-stated is reported FCF (the customer-advance and tax-lag tailwinds), **not** EBITDA; interest coverage measured on EBITDA is therefore not caveated for cash quality. (If anything, the coverage denominator is understated: the CIQ EBITDA used is ~AED 1–1.5bn below the company's own EBITDA.)

---

## 2. Covenant Inventory

**Lender covenants exist and are met, but their thresholds are undisclosed.** The FY2025 debt note states verbatim: *"As at the reporting date, the Group has complied with applicable financial covenants on its loans and borrowings"* [FY2025 AR, Note 24 (Interest-bearing loans and borrowings)]. The note does **not** quantify the covenant metrics or limits, and no covenant-EBITDA definition is given anywhere in the pool. Per the module partial-data rule, the actual maintenance-covenant thresholds are treated as undisclosed → labeled market assumptions are used for indicative headroom, and **covenant headroom is marked "Not assessable" for scoring**.

The **one quantified balance-sheet threshold** that *is* disclosed is the Board's capital-management **gearing policy**: *"The Group's policy is to keep the gearing ratio below 50%… gearing ratio is negative 188% (2024: negative 89%)"* where gearing = net debt ÷ (net debt + capital), net debt = loans + sukuk − cash, capital = equity attributable to owners less the net-unrealised-gains reserve [FY2025 AR, Note on Capital Management]. It is a **Board policy target, not a lender covenant** (breaching it is not an event of default), but it is a real, disclosed, quantified limit with a stated actual, so it anchors the read.

Headroom is **direction-aware** (module standard 11): MAX/ceiling covenant `(threshold − actual)/threshold`; MIN/floor covenant `(actual − threshold)/threshold`; signed so positive = room remaining.

| Covenant | Threshold | Current Actual | Headroom | Source |
|---|---|---:|---:|---|
| Max net leverage (net debt/EBITDA) | **Assumed 3.5x** (labeled — IG property developer); actual lender limit **undisclosed** | −0.08x (strict, net cash) / −0.99x (broad) | **+102%** (strict) / +128% (broad) — *indicative* | Threshold assumed; actual from `01` / ciq_facts |
| Min interest coverage (EBITDA/interest) | **Assumed 3.0x** (labeled); actual lender limit **undisclosed** | 52.1x | **+1,637%** — *indicative* | Threshold assumed; actual §1 |
| Gearing — net debt/(net debt+capital) *(disclosed Board policy, MAX)* | **< 50%** | **−188%** (2024: −89%) | **+476%** | FY2025 AR, Note on Capital Management |
| Min liquidity / net worth | **None disclosed** | Free cash AED 12,179.5m + ST investments AED 22,503.4m; common equity AED 89,783.9m | n/a — no minimum disclosed | FY2025 AR; `01` §3 |
| Springing covenant (e.g. revolver-utilisation trigger) | **Not disclosed** | AED 3,673m syndicated revolving credit facility is **essentially undrawn** (drawn AED 3.673m; ~0.1%), repayable by 2030 at EIBOR+0.95% | n/a — no springing trigger disclosed; facility undrawn | FY2025 AR, Note 24 (RCF) |
| Equity cure rights (Y/N, limits) | **Not disclosed in the data pool** | — | — | — |
| Other — change-of-control / cross-default / rating triggers | **Not disclosed in the data pool** | May-2026 ~29.7% ownership transfer (ICD → Dubai Holding / Emirates Power Investment) stays within **Dubai government** ultimate control, so a typical loss-of-government-control CoC put likely would not trip — but the CoC terms are not in the pool | n/a — not disclosed | FY2025 AR; `01` §6A |

Assumed thresholds are **conservative** for the credit: S&P **BBB+** / Moody's **Baa1** investment-grade [Credit-Health Panel, as-of 2026-06-28; Q4/FY2025 press release], 99.9% unsecured debt, ~90% fixed-rate. Real investment-grade covenants (where present) are typically looser than the 3.5x leverage / 3.0x cover assumed here, so the indicative headroom is if anything understated.

### Covenant EBITDA Definition & Quality

| Item | Value / Description | Source |
|---|---|---|
| Covenant EBITDA definition summary | **Not disclosed** — the lender covenant metrics and their EBITDA definition are not in the pool | FY2025 AR, Note 24 (compliance stated, terms not quantified) |
| Addbacks permitted (types) | **Not disclosed** | — |
| Addback caps / limits | **Not disclosed** | — |
| Is covenant EBITDA materially above reported EBITDA? | **Unknown for the lender definition** — but the EBITDA used for coverage here (CIQ standardized) is **below** Emaar's own non-IFRS EBITDA and is **cash-backed** (normalised CFO/EBITDA 91–159%, earnings-quality 81/100), so there is **no "addback illusion"** in the figure this agent uses | `earnings/06`; earnings/01 §4 |

Because the lender covenant-EBITDA definition is undisclosed, the *formal* headroom quality against lender covenants cannot be certified (residual "addback illusion" risk in principle). In practice this is immaterial: coverage is 52x and leverage is negative (net cash) on the reported, cash-backed EBITDA, so no plausible covenant-EBITDA definition changes the conclusion.

---

## 3. Headroom & Breach Proximity

| Metric | Value |
|---|---:|
| Tightest covenant | **Assumed max net leverage 3.5x** (labeled assumption — the smallest indicative headroom; lender limit undisclosed). Tightest *disclosed* threshold = the Board gearing policy < 50%. |
| Headroom on tightest covenant (%) | **+102%** (assumed max net leverage, strict net-cash basis) · +476% on the disclosed gearing policy |
| EBITDA decline that would breach it (approx.) | A net-leverage covenant **cannot be breached by an EBITDA fall alone** while the group is net cash (net debt/EBITDA stays negative). For the assumed **3.0x min interest cover**, EBITDA would have to fall **~94%** (from 25,201 to ~1,450) — or interest rise **~17x** (to ~AED 8,400m) at flat EBITDA. |
| Debt increase that would breach it (approx.) | To breach the assumed **3.5x max net leverage** (strict), net debt must swing from −2,115 (net cash) to **+88,202** — a **~AED 90bn** increase in debt / fall in cash. Against AED ~35bn of liquid assets and AED 10bn of gross debt today, that move is not plausible. |

The move that trips the tightest covenant is therefore an **~AED 90bn balance-sheet deterioration** (leverage) or a **~94% EBITDA collapse** (coverage) — both far outside any plausible downside; the detailed stress path is `06_downside-stress-test`'s job.

---

## 4. Coverage / Covenant Read

Earnings carry the interest bill many times over: EBITDA covers gross interest **52.1x** (48.6x on EBIT, 50.1x after PP&E capex, and still **23–25x** on the broadest total-finance-cost or cash-interest definitions), and on a net basis Emaar *earns* more interest income (AED 2,594m) than it pays (AED 484m) — the EBITDA doing the covering is cash-backed (earnings-quality 81/100), so the ratios are not flattered. Lender covenant thresholds are **not quantified** in the filings (only compliance is confirmed, and the group is investment-grade BBB+/Baa1), so true lender headroom is **marked "Not assessable" for scoring**; the only disclosed quantified limit — the Board's gearing policy of **< 50%** — sits at **−188% actual (+476% headroom)** because the group is net cash. On the most conservative labeled market assumptions the tightest covenant is an assumed **3.5x max net leverage at ~+102% headroom**, and tripping it would require a **~AED 90bn** swing into net debt or a **~94%** EBITDA collapse to breach a 3.0x interest-cover floor — neither remotely in view.

---

**Partial data:** Lender covenant thresholds and covenant-EBITDA definition are undisclosed in the pool (only a compliance statement plus a Board gearing policy are given). Indicative headroom uses labeled market-assumption covenants; **covenant headroom is "Not assessable" for scoring** per the module partial-data / score-cap rule. Interest-expense detail is fully disclosed (FY2025 AR Note 7(b)) — no interest proxy needed.
