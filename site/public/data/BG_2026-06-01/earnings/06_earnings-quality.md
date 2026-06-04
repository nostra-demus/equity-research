# Earnings Quality — BG

**Company:** Bunge Global SA (NYSE: BG). **Reporting currency:** US$ millions unless noted (EPS in US$/share). **Fiscal year:** ends Dec 31. **FY0 = FY2025** (10-K, year ended Dec 31, 2025); **latest quarter Q0 = Q1 2026** (10-Q, ended Mar 31, 2026).

Upstream `01_historical-financials.md` is present and used as the baseline. Cash flow statements for FY2023–FY2025 and Q1 2026 / Q1 2025 are available, so the partial-data cap (earnings quality max 45 for missing cash flow) does **not** apply.

**Three structural facts dominate this entire assessment — flagged once, applied throughout:**
1. **Viterra closed mid-2025** (registered shares issued July 2, 2025; $4,201M cash + 65.6M shares) [FY25 10-K, Note 2; Statement of Changes in Equity, line 4902]. It roughly doubled the revenue and balance-sheet base from Q3 2025. Year-over-year balance-sheet ratios (DSO/DIO/DPO) computed across the Dec-2024 (pre-Viterra) → Dec-2025 (post-Viterra) line are **not like-for-like** and overstate any "deterioration." This is acquisition mix, not necessarily accrual decay.
2. **GAAP earnings are heavily distorted by non-cash mark-to-market (MTM) timing** on commodity / freight / FX contracts and readily marketable inventory (RMI). GAAP vs adjusted gap is large and recurring (Q1 2026: GAAP diluted EPS $0.35 vs adjusted $1.83) [Q1 2026 earnings release, p.1–2]. This is the central earnings-quality problem: GAAP single-period earnings are an unreliable read of economics, **and** the cleaner adjusted series is management-defined.
3. **Capex split IS partially disclosed** for Q1 2026 only (sustaining $95M; growth/productivity ~$240M of $336M total) [Q1 2026 call, prepared remarks, lines 175–179]. No annual sustaining/growth split is given. Where unavailable, total capex is used and flagged.

---

## 1. EBITDA → CFO → FCF Bridge (3–5 years)

The 10-K presents three years of cash flow (FY2023–FY2025); a four-quarter TTM (to Q1 2026) is added. Only three fiscal years exist in the pool (post-2018 SEC rules; no five-year exhibit) [FY25 10-K, line 4684]. EBITDA is the GAAP-built figure from upstream (**Bunge does not report a GAAP EBITDA line** — it is Total EBIT + D&A, stated for comparability, not a company metric). All rows GAAP / as-reported.

| Item | FY2023 | FY2024 | FY2025 | TTM→Q1'26 | Trend |
|---|---:|---:|---:|---:|---|
| EBITDA (GAAP-built = Total EBIT + D&A) [a] | 3,784 | 2,260 | 2,236 | 2,354 | Deteriorating |
| Net income (CFO starting line) [b] | 2,337 | 1,188 | 843 | — | Deteriorating |
| D&A (non-cash add-back) | 451 | 468 | 703 | ~975 (FY26 guide) | Rising (Viterra) |
| Net unrealized (gains)/losses on derivatives [c] | (366) | 262 | 395 | 958 (Q1'26) | Volatile / large |
| FX (gain)/loss on debt (non-cash) | (281) | 174 | (216) | — | Volatile |
| Gain on sale of investments/PP&E | (4) | (205) | (160) | — | Recurring gains |
| Working capital change (sum of WC lines) [d] | 583 | (52) | (725) | — | Deteriorating |
| Tax paid (cash) — **not separately disclosed** [e] | n/d | n/d | n/d | n/d | n/d |
| Interest paid (cash) — **not separately disclosed** [e] | n/d | n/d | n/d | n/d | n/d |
| **CFO** | **3,308** | **1,900** | **844** | **588** | **Deteriorating** |
| Capex (total — split not disclosed annually) [f] | 1,122 | 1,376 | 1,723 | 1,749 | Rising |
| **FCF (CFO − total capex)** | **2,186** | **524** | **(879)** | **(1,161)** | **Deteriorating** |
| **CFO / EBITDA %** | **87.4%** | **84.1%** | **37.7%** | **25.0%** | **Deteriorating** |

Trend column: Improving / Stable / Deteriorating.

**Notes:**
- **[a] EBITDA** built per upstream as Total EBIT + D&A. D&A from cash flow: $451/$468/$703M (FY23/24/25) [FY25 10-K, line 4830]. Not a Bunge-reported line.
- **[b] CFO build** starts from total net income $2,337/$1,188/$843M [FY25 10-K, line 4826]. CFO is shown indirect-method; the bridge items below are the reconciling lines.
- **[c] Net unrealized (gains)/losses on derivative contracts** is a large, swinging non-cash add-back inside CFO: −$366M (FY23), +$262M (FY24), +$395M (FY25), **+$958M in Q1 2026 alone** [FY25 10-K, line 4842; Q1 10-Q, line 260]. This is the cash-flow mirror of the MTM timing problem — in a quarter with big unrealized derivative losses, CFO is *flattered* by adding them back; in a quarter with unrealized gains, CFO is reduced. It makes single-period CFO almost as noisy as GAAP earnings.
- **[d] Working capital change** = sum of trade receivables + inventories + secured advances + trade payables/accrued + advances on sales + margin deposits + recoverable taxes + marketable securities + "other, net" operating-asset lines [FY25 10-K, lines 4837–4846]. FY2025 was a **−$725M use** (inventory build −$700M, receivables −$469M, partly offset by payables +$153M). FY2023 was a +$583M source (post-2022 inventory unwind: inventories +$1,518M source).
- **[e] Cash interest paid and cash income taxes paid are NOT separately disclosed** in the supplied data pool (the supplemental cash-flow note is not in the extracted text). Income-statement interest expense ($516/$471/$628M) and income tax expense ($714/$336/$288M) [FY25 10-K, lines 4695, 4700] are the only available proxies; they are accrual, not cash, figures. Marked n/d (not disclosed).
- **[f] Capex annual split not disclosed.** *"Capex split not disclosed at the annual level — total capex used. FCF may understate true recurring free cash flow."* Only Q1 2026 is split: sustaining $95M vs growth/productivity ~$240M [Q1 2026 call, lines 175–179]. If that ~28% sustaining / 72% growth mix held for FY2025, maintenance capex would be ~$480M and "maintenance FCF" would be roughly CFO − $480M ≈ +$364M (FY2025) rather than −$879M — i.e. the negative reported FCF is substantially a growth-investment and working-capital phenomenon, not a sign the base business cannot self-fund. **This is an inference, not from filings**, offered only to size the distortion.

**Spot-checks:** CFO/EBITDA FY2025 = 844 / 2,236 = 37.7% ✓. FCF FY2025 = 844 − 1,723 = −879 ✓. FCF FY2023 = 3,308 − 1,122 = 2,186 ✓.

---

## 2. Cash Conversion Assessment

CFO tracked EBITDA closely in FY2023 (87%) and FY2024 (84%) — healthy, above the 70% bar — then collapsed to 38% in FY2025 and 25% on a TTM basis. Three forces drive the FY2025 collapse, and they are not equal in quality: (i) a genuine **−$725M working-capital use**, dominated by a −$700M inventory build that is partly the Viterra consolidation and partly normal seasonal/commodity inventory financing (Q1 is reliably a cash outflow: CFO −$285M Q1'25, −$541M Q1'26) [FY25 10-K, lines 4838, 4847; Q1 10-Q, line 265]; (ii) a **+$395M non-cash derivative add-back** that signals GAAP earnings carried unrealized gains not yet in cash; and (iii) lower underlying profit. The first and third are real cash-conversion pressure; the second is timing noise that should reverse. The verdict: cash conversion has genuinely weakened, but the headline 38%/25% overstates the decay because it is measured across the acquisition and inventory-build year. A clean read requires a full post-Viterra year (FY2026), not yet complete.

---

## 3. Working Capital Trends

Computed from audited balance sheet and income statement. **Critical limitation: FY2025 year-end is post-Viterra; FY2024 year-end is pre-Viterra. The FY2023 year-end balance sheet is NOT in the pool** (10-K shows only Dec-2025 and Dec-2024) [FY25 10-K, line 4764], so FY2023 days are N/A. DSO uses net sales; DIO/DPO use COGS. Cross-period day comparisons here are distorted by the mid-year acquisition base change.

| Metric | FY2023 | FY2024 | FY2025 | Direction | Risk |
|---|---:|---:|---:|---|---|
| Receivable days (DSO) | N/A [g] | 14.8 | 20.1 | Rising +36% | Flagged — but see note |
| Inventory days (DIO) | N/A [g] | 47.7 | 72.0 | Rising +51% | Flagged — but see note |
| Payable days (DPO) | N/A [g] | 20.4 | 26.6 | Rising +30% | Monitor |
| Cash conversion cycle (DSO + DIO − DPO) | N/A | 42.0 | 65.5 | Rising +56% | Acquisition-driven |

**Flag tests:**
- **DSO rising >10% YoY:** YES (+36%, 14.8 → 20.1 days). **But this is materially a Viterra artifact** — trade receivables rose from $2,148M to $3,870M and the 10-K attributes the increase "primarily due to … the Acquisition of Viterra and increased Net sales" [FY25 10-K, lines 2813–2816]. It is **not** flagged as a standalone revenue-recognition concern, because (i) receivables are sold under a securitization program ($1,174M derecognized at year-end — see §6/§8), and (ii) the base changed mid-year. Concern level: **Mid**, pending a clean post-Viterra year.
- **DIO rising >15% YoY:** YES (+51%, 47.7 → 72.0 days). **Viterra-driven**: inventories rose $6,491M → $13,198M, "primarily due to increased inventory balances from the Acquisition of Viterra" [FY25 10-K, lines 2818–2820]. Of total inventory, $11,361M is RMI (mark-to-market commodity inventory readily convertible to cash), up from $5,224M [FY25 10-K, line 6039]. RMI exceeded net debt by ~$400M at Q1'26 [Q1 2026 call, line 181]. Concern level: **Low–Mid** — high DIO is structural for a commodity processor and the inventory is liquid and hedged, not stale finished goods. Not a channel-stuffing signal.
- **DPO rising sharply:** Modest (+30%), in line with the inventory/payables build and attributed to Viterra and higher volumes [FY25 10-K, lines 2851–2854]. No reverse-factoring / supplier-finance program is disclosed (the "$559M / $825M carried at fair value" in trade payables is RMI-related forward-purchase mark-to-market, not a financing arrangement) [FY25 10-K, line 4788; Q1 10-Q, Note 11, line 1027]. Concern level: **Low**.

- **[g]** FY2023 days are N/A because the Dec-31-2023 balance sheet (receivables, inventory, payables) is not in the supplied 10-K, which presents only two balance-sheet years.

**Net read:** every working-capital metric rose, but the rises are dominated by the mid-2025 acquisition base change, not by deteriorating collection or stale inventory. This is the single most important caveat in this report — do not read these days as evidence of accrual manipulation.

---

## 4. Non-GAAP Adjustments

Bunge discloses adjusted (non-GAAP) metrics in its earnings release/slides only, **not** in the 10-K/10-Q. The reconciliation has exactly **two** adjustment categories. Cleanest disclosure is Q1 2026 [Q1 2026 earnings release, p.1–2].

| Adjustment | Amount (Q1 2026) | Recurring? | Concern Level | Evidence |
|---|---:|---|---|---|
| Mark-to-market timing differences — Total EBIT | +$336M | Yes (every period, sign varies) | **Mid** | Q1 2026 release, p.2 |
| Mark-to-market timing differences — diluted EPS | +$1.28 | Yes (sign varies) | **Mid** | Q1 2026 release, p.2 |
| Certain (gains) & charges — Total EBIT | +$41M | Partly (Viterra costs recur) | **Mid** | Q1 2026 release, p.2 |
| Certain (gains) & charges — diluted EPS | +$0.20 | Partly | Low–Mid | Q1 2026 release, p.2 |
| Stock-based compensation — **NOT excluded from adjusted** | — | n/a | **Low (positive)** | Q1 2026 release, p.2; SBC expensed in CFO $73M FY25 [10-K line 4831] |

**Assessment of the adjustment quality:**
- The **MTM timing** adjustment is the defensible kind: it strips the non-cash gain/loss on hedges and RMI that has not yet been realized through delivery, and the sign genuinely flips (Q1'25 +$0.08 EPS vs Q1'26 +$1.28; FY2023 GAAP *exceeded* adjusted). It is recurring in existence but self-reversing in direction — so it is not a one-way flatter of earnings. **But** it is large enough that the user must trust management's segregation of "timing" from "permanent": Q1 2026 MTM was $336M of a $377M total adjustment, and the adjusted EPS uplift ($1.48) was **423% of GAAP EPS ($0.35)**. When the adjustment dwarfs the reported number by 4x, the adjusted figure effectively *is* the earnings number, and its quality rests entirely on management's MTM classification. Concern: **Mid**.
- **SBC is correctly left inside adjusted earnings** ($73M FY2025, $23M Q1'26) — a genuine positive vs many large-caps that exclude it. The accounting-trap "SBC excluded" is NOT triggered.
- **Exceeds 15% of GAAP earnings:** YES, by a wide margin (FY2025 adjusted EPS $7.57 was 54% above GAAP $4.91; Q1'26 423% above). This is why the upstream module correctly treats the adjusted series as the operating read — but it must be labeled management-defined every time.

---

## 5. One-Off Items (last 3 years)

| Item | Period | Amount | Classification | Evidence |
|---|---|---:|---|---|
| Viterra acquisition & integration costs | FY2023 / FY2024 / FY2025 | $114M / $244M / $223M | **Recurring "one-off"** | FY25 10-K, lines 2720, 2730 |
| U.S. pension plan settlement loss | FY2025 | $118M | Genuine (buy-out completed Dec 2025) | FY25 10-K, lines 2711–2712 |
| Long-term investment impairment | FY2025 | $30M | Genuine (non-cash) | FY25 10-K, lines 2712–2713 |
| Gain on sale of BP Bunge Bioenergia 50% stake | FY2024 | +$195M (gain) | Genuine, non-recurring gain | FY25 10-K, lines 2714, 2732 |
| Gain on sale of investments / PP&E (CFO line) | FY2023 / FY2024 / FY2025 | +$4M / +$205M / +$160M | **Recurring gains** | FY25 10-K, line 4833 |
| Impairment charges (CFO line) | FY2023 / FY2024 / FY2025 | $104M / $41M / $53M | Recurring (each year) | FY25 10-K, line 4828 |
| Prior impairments (Australian Plant Proteins, etc.) | FY2023 | $20M + $16M | Genuine | FY25 10-K, lines 2733–2735 |

**Reconciliation flag for the master synthesizer:** Upstream `01_historical-financials.md` (§4) attributed the BP Bunge Bioenergia stake-sale gain to **FY2023**. The FY2025 10-K MD&A states the **$195M gain was recorded in 2024** ("the absence of a $195 million prior year gain … recorded in Other (expense) income – net" in the 2025-vs-2024 discussion, and "a $195 million gain, in 2024" in the 2024-vs-2023 discussion) [FY25 10-K, lines 2714, 2732]. I follow the audited filing: **the gain was FY2024.** This explains part of why FY2024 GAAP held up relative to adjusted. Minor, but flagged because it affects which year carried the favorable one-off.

**Key finding:** **Viterra integration costs have now recurred for three consecutive years** ($114M → $244M → $223M) and impairment charges and asset-sale gains appear in CFO every single year. Items management adjusts out as "certain charges" are partly a running annual cost of an active M&A/portfolio-reshaping strategy, not true one-offs. They should be only partially added back.

---

## 6. Accrual Quality Flags

| Flag | Triggered (Y/N) | Evidence |
|---|---|---|
| Revenue growing faster than CFO for 2+ years | **YES** | Revenue +32.4% FY25 while CFO fell −56% ($1,900M→$844M); revenue −10.8% FY24 while CFO fell −43% [FY25 10-K, lines 4690, 4847]. **But** FY25 revenue growth is Viterra consolidation, not organic — so this is a structural mismatch (a doubled-revenue base whose first cash cycle is an inventory build), not classic accrual inflation. Flagged, with that caveat. |
| Receivables growing faster than revenue | **YES (mechanically)** | Receivables +80% ($2,148M→$3,870M) vs revenue +32%. Driven by Viterra base + securitization timing, per MD&A [FY25 10-K, lines 2813–2816]. Acquisition artifact. |
| Inventory growing faster than COGS | **YES (mechanically)** | Inventory +103% ($6,491M→$13,198M) vs COGS +35% ($49,715M→$66,920M). Viterra consolidation; $11,361M is liquid RMI [FY25 10-K, lines 2818–2820, 6039]. Acquisition artifact, liquid inventory. |
| Deferred revenue declining (subscription/contract business) | **NO (and N/A)** | Not a subscription business. "Advances on sales" (contract liabilities) **rose** from $501M to $814M [FY25 10-K, line 6523] — cash collected ahead of performance, a *positive* accrual signal. |
| Capitalized costs growing as % of revenue | **NO** | No evidence of capitalized software/development costs growing; D&A rise is Viterra PP&E (PP&E $5,254M→$11,678M from the acquisition) [FY25 10-K, line 4775], not aggressive capitalization. Useful lives unchanged (straight-line) [FY25 10-K, line 5312]. |
| Frequent accounting policy changes | **NO** | Adopted ASU 2023-09 (tax disclosure) routinely; one RMI segment **misclassification** ($481M between two segments at Dec-2024, no total impact) was identified and corrected [FY25 10-K, lines 6040–6043]. Segment redefinition (Q3 2025) is presentation, not policy. The misclassification is noted but immaterial to totals. |

**Read:** four of six flags trigger, but **all four are mechanical consequences of consolidating Viterra mid-year**, not evidence of earnings being inflated by accruals. The two flags that test for classic manipulation in this business model (declining contract liabilities; rising capitalized costs) are both negative/clean. The honest conclusion: the accrual screen looks bad on its face but is explained by the acquisition; it would become a genuine red flag only if it persists into a clean FY2026.

---

## 7. Reported vs Adjusted Reconciliation

Annual GAAP is from the audited filing; annual "adjusted" is the Capital IQ normalized series, which upstream verified ties to Bunge's own adjusted (non-GAAP) figures [Capital IQ Surprise export, data as of 2026-05-09]. Quarterly is from the company's own release. Bunge does **not** publish an adjusted EBITDA reconciliation in its filings — only adjusted Total EBIT and adjusted EPS — so the EBITDA row is the constructed GAAP-built figure with no company adjusted counterpart.

| Metric | Reported (GAAP) | Adjusted | Difference | % of Reported | Recurring? | Evidence |
|---|---:|---:|---:|---:|---|---|
| **FY2025 annual** | | | | | | |
| EBITDA (GAAP-built) | 2,236 | n/d (no company adj. EBITDA) | — | — | — | FY25 10-K lines 2373, 4830 |
| EBIT (Bunge "Total EBIT") | 1,533 | 2,034 | +501 | +32.7% | Yes (MTM + charges) | 10-K line 2373; CapIQ 2026-05-09 |
| Net income attrib. (implied) | 816 | ~1,257 | +441 | +54% | Yes | 10-K line 4706; CapIQ |
| EPS diluted | 4.91 | 7.57 | +2.66 | +54.2% | Yes | 10-K line 4717; CapIQ |
| **Q1 2026 quarter** | | | | | | |
| Total EBIT | 184 | 561 | +377 | +205% | Yes ($336 MTM + $41 charges) | Q1 2026 release p.2 |
| Segment EBIT | 319 | 661 | +342 | +107% | Yes ($336 MTM + $6) | Q1 2026 release p.2 |
| Net income attrib. | 68 | ~340 | +272 | +400% | Yes | Q1 2026 release p.2 |
| EPS diluted | 0.35 | 1.83 | +1.48 | +423% | Yes ($1.28 MTM + $0.20) | Q1 2026 release p.2 |

**Direction flips (important):** In **FY2023, GAAP EPS ($14.87) EXCEEDED adjusted ($13.66)** because that year carried favorable items; in **FY2024–FY2025, adjusted exceeded GAAP** because of net charges (pension, impairment, Viterra costs, adverse MTM) [FY25 10-K, MD&A lines 2320–2329]. Because the adjustment is two-sided, it is more credible than a one-way "add back every bad thing" reconciliation — but the sheer size (Q1'26 adjusted EPS is 5.2x GAAP) means the adjusted figure carries almost all the information, and its integrity depends on the MTM split that only management can compute.

---

## 8. Accounting Trap Checklist

Severity is an **inverted sub-score (higher = worse)** for each trap, /100.

| Trap | Triggered? | Evidence | Severity /100 (higher = worse) |
|---|---|---|---:|
| Stock-based comp excluded from adjusted earnings | **NO** | SBC stays inside adjusted EPS ($73M FY25, $23M Q1'26) [Q1 release p.2; 10-K line 4831] | 5 |
| Restructuring / integration costs recur every year | **YES** | Viterra integration $114M/$244M/$223M (FY23/24/25) — 3 years running [10-K lines 2720, 2730] | 55 |
| Capitalized costs rising faster than revenue | **NO** | PP&E rise is Viterra purchase accounting, not capitalized opex; useful lives unchanged [10-K lines 4775, 5312] | 10 |
| Receivable factoring / supplier finance disclosed | **YES (factoring)** | Trade receivables securitization: $1,174M derecognized at Dec-2025, $13,313M gross sold in FY2025 (program up to $1.5bn) [10-K lines 6001, 6012, 5977]. Flatters DSO and CFO. **No** supplier finance/reverse factoring. | 45 |
| Inventory write-downs or reserve releases | **Minor** | RMI carried at fair value (marks run through COGS, not a discretionary reserve); credit-loss allowance rolled forward normally ($113M→$197M, incl. $93M purchased-credit-deteriorated from Viterra) [10-K lines 5956, 6039] | 25 |
| Revenue recognized before cash-collection risk clear | **NO** | Commodity sales recognized on delivery; "advances on sales" (cash before revenue) rose to $814M — collection risk runs the other way [10-K line 6523] | 10 |
| Change in useful life / depreciation assumptions | **NO** | Straight-line, no change disclosed for FY2025 [10-K line 5312] | 5 |
| Tax rate unusually low or boosted by one-off | **YES (quarterly)** | FY2025 GAAP rate 25.4% (above statutory — no annual boost). **But Q1 2026 booked a tax *benefit* of $14M** (negative rate) vs $80M expense prior year, on South America tax benefits + low pre-tax income; adjusted rate ~18% [Q1 2026 release p.8; FY25 10-K line 6637]. FY2026 guided adjusted rate 22–26% [Q1 call line 214]. The Q1 GAAP EPS would have been even lower without the tax benefit — it does not flatter the headline. | 35 |
| Large fair-value / mark-to-market gains | **YES — the central trap** | MTM timing on commodities/freight/FX/RMI swings GAAP EBIT by hundreds of millions per quarter ($336M in Q1'26 alone); net unrealized derivative add-back in CFO was +$958M in Q1'26 [Q1 release p.2; Q1 10-Q line 260] | 60 |

**Two traps dominate:** (1) **MTM fair-value swings** make GAAP earnings unreliable single-period and force reliance on a management-defined adjusted number; (2) **recurring integration costs** that are adjusted out but recur. A third, lower-grade item — **receivables securitization** — structurally flatters both DSO and reported CFO and should be remembered when reading cash conversion. None of the three is fraud-grade; all three are quality *haircuts*, not disqualifiers.

---

## 9. Earnings Quality Score

**Earnings quality: 52 / 100** (higher = better) — **Band: 41–60, "Material concerns — cash conversion weak."**

**Single most important reason:** GAAP earnings are dominated by non-cash mark-to-market timing (Q1 2026 adjusted EPS was 5.2x GAAP; FY2025 adjusted EPS 54% above GAAP), so the usable earnings number is **management-defined**, and on a cash basis CFO/EBITDA collapsed from ~85% to 38% (FY2025) and 25% (TTM) with FCF turning negative (−$879M FY2025). The score is held *up* from the bottom of the band by three offsets: the adjustments are two-sided (the sign flips year to year, and GAAP exceeded adjusted in FY2023), SBC is correctly kept inside adjusted earnings, and the working-capital/cash-conversion deterioration is **substantially explained by the mid-2025 Viterra consolidation and a liquid RMI inventory build** rather than by accrual manipulation. It is held *down* from a passing 61+ because the cash gap is real, the cleaner series is not independently verifiable from the filings, integration "one-offs" recur, and receivables securitization flatters the cash and DSO that remain. A clean post-Viterra FY2026 with CFO/EBITDA back above 70% would justify re-scoring into the 61–70 range.

---

## 10. The Single Biggest Quality Concern

The single biggest risk that reported earnings overstate economic reality is **the dependence on a management-defined "adjusted" number whose largest component — mark-to-market timing — only management can measure.** Bunge's GAAP earnings are genuinely uninformative on a single-period basis (Q1 2026 GAAP EPS $0.35 carried a $1.28 MTM drag; the cash-flow mirror was a +$958M non-cash derivative add-back), so any reader is effectively forced onto the adjusted EPS series. That series strips out the hedge/RMI marks the company classifies as "timing," and the classification of which marks are temporary timing versus permanent economic loss is not independently checkable from the 10-K or 10-Q. The mitigant is real: the adjustment is two-sided (it reduced earnings in FY2023, when GAAP exceeded adjusted, and the sign flips quarter to quarter), Bunge does not abuse the softer levers (SBC stays in, no reverse factoring, no useful-life change, contract liabilities rising), and the alarming working-capital and cash-conversion screens are largely the arithmetic of consolidating a doubled-size Viterra mid-year plus a liquid commodity-inventory build. So the concern is not fabricated earnings — it is that the only usable profit figure is one the company computes for itself, on top of a balance sheet whose true cash-generating cadence will not be visible until a full clean post-acquisition year (FY2026) is reported. Until then, treat the adjusted EPS as directionally sound but unverifiable, and weight cash conversion over reported profit.

**Flag for master synthesizer:** (1) Earnings are only usable on a management-defined adjusted basis — apply a conviction haircut, not a disqualification. (2) BP Bunge Bioenergia $195M gain belongs to **FY2024**, not FY2023 (per audited 10-K) — reconcile against the historical-financials module. (3) CFO/EBITDA at 25–38% and negative FCF are real but acquisition-distorted; the key disconfirming/confirming evidence is the FY2026 cash-conversion print.
