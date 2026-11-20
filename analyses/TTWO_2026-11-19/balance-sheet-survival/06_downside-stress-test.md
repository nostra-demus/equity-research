# Downside Stress Test — TTWO

**Company:** Take-Two Interactive Software, Inc. (NasdaqGS:TTWO) · **Date:** 2026-11-19
**Reporting currency: USD, in millions** unless stated. **Reporting standard: US GAAP.** Fiscal year ends **31 March**, so "FY2027" is the year ending 2027-03-31. Every balance-sheet input is as of **2026-09-30** (Q2 of FY2027). **Filing regime:** US SEC — Form 10-K (annual), Form 10-Q (quarterly).

**Standing verification qualifier carried forward from `00_solvency-data-triage.md` §5 and `01`–`05`.** All 30 manifest sources in this frozen generation carry **no `numeric_reading_check` field at all** — they are **unchecked, not verified clean** — and no labelled extractor warning annotation appears in `GENERATION_ROOT/corpus.txt`, so there is no specific flagged amount to quarantine. The duty that transfers: every amount used below was read directly from the frozen filing extract that reports it — `10K_2025_26_0001628280-26-037434.txt` (FY26 10-K), `10Q_2Q_0001628280-26-072254.txt` (Q2 FY27 10-Q), `10K_2024_25_0001628280-25-026694.txt` (FY25 10-K, which carries the credit-agreement exhibit) — or taken verbatim, with its label, from `01`–`05`, which did the same. Capital IQ workbook tabs are used only as a vendor read to reconcile against, never as the authority for a filing's own number (CLAUDE.md §5). **This qualifier travels into `99` unchanged.**

**Upstream inputs used, all five present.** `01_capital-structure-and-leverage.md` (canonical strict net debt, EBITDA bases, debt stack); `02_maturity-wall-and-refinancing.md` (the 12- and 24-month maturity amounts and the cash-finance-cost bridge); `03_liquidity-runway.md` (committed liquidity, the reconciled FCF basis, the runway cases); `04_coverage-and-covenants.md` (the single maintenance covenant, its threshold, its own metric, and its instruction to stress cash and EBITDA **jointly**); `05_off-balance-sheet-and-contingencies.md` (the contractual spending floor that does not shrink when earnings fall). Cross-module: `business-model/10_external-dependency.md` (cycle depth), `business-model/07_business-quality.md` (Cyclicality 22/100), `business-model/11_capital-allocation-governance.md` (acquisition status), `earnings/03_margin-drivers.md` and `earnings/06_earnings-quality.md` (cash-backing of EBITDA), `earnings/07_earnings-sensitivity.md` (the one measured realised offset in the pool). No declared input was missing.

**Pending-acquisition (pro-forma) check — done, and the answer is no, so no pro-forma base is built.** `business-model/11_capital-allocation-governance.md` records that "the deal-making has stopped": business acquisitions were **$(2.6)** in FY2026 and **nil** in the six months to 2026-09-30 (against $(2.0) a year earlier), and "no new material transaction is disclosed in either FY2027 10-Q or either FY2027 earnings release" [`FY26 10-K, Consolidated Statements of Cash Flows`; `Q2 FY27 10-Q, Condensed Consolidated Statements of Cash Flows`]. `Q2 FY27 10-Q, Note 16 (Subsequent Events)` discloses only "a reorganization involving certain intangible assets to simplify our global operating structure", with no consideration and no proceeds. So the stress base below is the reported balance sheet at 2026-09-30, on the **strict §15 net-debt basis** that `01` §7 designates as this module's canonical figure. One limit on that conclusion, named: the pool contains **no TTWO material-event (8-K) feed** (the Key Developments export resolves to a different issuer, Alphabet Inc.) and the DEF 14A export is an empty stub, so any transaction announced after **2026-11-09** would not be visible here [`00_solvency-data-triage.md` §5].

**Every stressed figure and every break-point solve below was produced by executed Python** (four `Bash` runs; the commands and their printed output are reproduced in §5), not by mental arithmetic.

---

## 1. Base Case (today)

| Input | Value | Source |
|---|---:|---|
| **Base EBITDA (cash-backed) — the headline stress base** | **677.6** — company-defined, LTM to 2026-09-30, **non-GAAP, engine-computed bridge** | `01` §7 anchor (A): FY2026 **760.6** (engine build from the FY26 10-K's own lines on the company's published definition) − H1 FY26 **342.2** (company-disclosed) + H1 FY27 **259.2** (company-disclosed) [`Q2 FY27 earnings release, 2026-11-09, Reconciliation of GAAP to Non-GAAP Measure`; `Q1 FY27 earnings release, 2026-08-06`; `FY26 10-K`, Statements of Operations and of Cash Flows, Note 9, Note 17] |
| *— cash-backed cross-check, and it is materially lower* | **373.2** = 677.6 − the **304.4** gap between the **716.3** of cash spent on software development and licences over the LTM and the **411.9** of amortisation charged for it. **LTM CFO of 367.1 lands within 6.1 of that figure**, independently | `04` §1; `earnings/06_earnings-quality.md` §1 (CFO/EBITDA **50.6%** LTM, earnings quality **48/100**); `FY26 10-K` and `Q2 FY27 10-Q`, Statements of Cash Flows |
| *— vendor alternative (B)* | 724.9 | `ciq_facts.json → ltm_ebitda_m`, `CIQ Financials → Income Statement` LTM Sep-30-2026 — tier-5 vendor export |
| *— mid-cycle / normalised (C)* | **565.3** — own five-year average FY2022–FY2026 | `01` §7; `CIQ Financials_Annual → Income Statement` EBITDA row — vendor export |
| *— company-guided FY2027 (D), a FORECAST not a reported period* | 1,024–1,082 (midpoint **1,053**) | `Q2 FY27 earnings release, 2026-11-09, Outlook` |
| **Reported (GAAP) profit anchor — there is no GAAP EBITDA** | **LTM income (loss) from operations (180.8)**; FY2026 **(104.2)** | `FY26 10-K` and `Q2 FY27 10-Q`, Statements of Operations. Any "debt ÷ reported EBITDA" ratio has a negative denominator and is **not meaningful** |
| **Net debt** | **1,370.4 — strict §15 basis** (gross borrowings at carrying value 2,519.8 − cash & equivalents 1,149.4). **This is the basis `01` §7 designates as canonical and the one used throughout this report.** Broad basis (also netting the 524.2 of liquid short-term investments): 846.2 | from `01` §4, §7 |
| **Net debt / EBITDA** | **2.02x** on (A) 677.6 · 1.89x on (B) 724.9 · **2.42x on mid-cycle (C) 565.3** · 1.30x on guided (D) · **3.67x on the cash-backed 373.2** | from `01` §5b, §7; the cash-backed row is computed here |
| **EBITDA / interest** | **4.99x** on (A) · 5.34x on (B) · 4.17x on (C) — on **gross** interest expense of **135.7** (LTM). Content-adjusted: **0.51x**. Fixed-charge coverage: **0.44x** | from `04` §1 |
| **Tightest covenant + threshold** | **Maximum "Leverage Ratio" of 3.75 : 1.00**, tested at each fiscal-quarter end, §6.05 of the 2022 Credit Agreement as amended 2025-05-19. It is tightest because it is the **only** maintenance financial covenant in the whole structure — no interest-coverage, no minimum-liquidity, no net-worth test, and the Senior Notes indenture carries none. Covenant metric = **Consolidated Total Indebtedness (face borrowings, net of cash netting up to the Maximum Cash Netting Amount) ÷ Consolidated Adjusted EBITDA**. Actual **1.07x**, headroom **+71.4%** (MAX / ceiling form). **No equity cure right exists.** | from `04` §2, §3, citing `FY25 10-K, Exhibit 10.41, §6.05`; `FY26 10-K, Note 11 (Debt)` |
| **Next-12m obligations** | **629.4** of debt maturities (29.4 Zynga 2026 Convertible Notes due 2026-12-15 + 600.0 of 2027 Notes due 2027-04-14); **114.8** of forward cash coupon; **290.0** of guided capex; **0.0** of committed dividends or buybacks. Gross-obligations total **1,034.2**. **24-month maturities 1,429.4** (adds the 800.0 of 2028 Notes due 2028-03-28) | from `02` §1–§2 and `03` §2, citing `Q2 FY27 10-Q, Note 10 (Debt)`; `Q2 FY27 10-Q, Item 2 MD&A — Capital Expenditures` |
| **Committed liquidity** | **2,671.5** = cash & equivalents 1,149.4 + liquid short-term investments 524.2 + committed undrawn revolver availability 997.9. **In-hand only (gross-liquidity basis, §15): 1,673.6.** Restricted cash 83.0 excluded; 494.0 of **uncommitted** capacity excluded | from `03` §1, citing `Q2 FY27 10-Q, Condensed Consolidated Balance Sheets`, `Note 5`, `Note 10 (Debt)` |
| **Usable liquidity after the minimum-liquidity deduction** | **2,671.5 — unchanged, because there is no minimum-liquidity covenant to reserve against.** `04` searched the full agreement text and found zero matches for "minimum liquidity" / "net worth" | `04` §2; `03` §1 |
| **Floating-rate debt (gross)** | **0.0 — 0.0% of drawn borrowings float.** All 2,529.4 of principal carries a stated fixed coupon (3.70 / 4.95 / 5.40 / 4.00 / 5.60 / 0.00%); weighted-average coupon on the 2,500.0 of Senior Notes **4.59%**. The only floating instrument is the **undrawn** revolver | from `02` §3, citing `Q2 FY27 10-Q, Note 10 (Debt)`, `Item 3 — Interest Rate Risk` |
| **Hedge coverage (if any)** | **None on interest rates — no interest-rate swaps are disclosed anywhere in the pool.** The only derivatives are FX forwards (748.7 to sell / 327.8 to buy at 2026-09-30), "not designated as hedging instruments", covering balance-sheet items, not the revenue line | `02` §3; `Q2 FY27 10-Q, Item 3`; `earnings/07_earnings-sensitivity.md` row 7 |
| **Working-capital seasonality / peak build** | **Seasonal, in the company's own words: "Sales of our full game products are also seasonal, with peak demand typically occurring in the fourth calendar quarter during the holiday season." The peak build is NOT quantified anywhere** — so `03`'s hard check stands: "Peak working-capital need not disclosed — runway may be overstated." The measured proxy used in the shock column below is the **225.0 decrease in deferred revenue over the LTM**, a filings-sourced working-capital cash outflow (78.5 − 156.2 + (147.3)) | `Q2 FY27 10-Q, Item 2 MD&A — Fluctuations in Quarterly Operating Results and Seasonality`; `03` §3c Seasonality check; deferred-revenue bridge from `04` §3, from the Statements of Cash Flows |

**Which EBITDA base the stress runs on, and why both are carried.** MODULE_RULES' stress rule requires cash-backed EBITDA "where the two differ materially", and here they differ a lot: **677.6 against 373.2**, because the company spends roughly **1.7x** as much cash on games as it charges in amortisation. The scenario table below therefore runs the haircuts on the canonical **677.6** — so every row is directly comparable to `01` and `04`, and so the covenant can be tested on its own contractual metric — and carries a **separate cash-backed block** at 373.2 immediately underneath. Reading only the 677.6 rows would overstate survival; reading only the 373.2 rows would double-charge the content spend against a covenant whose own definition does not charge it.

**Cycle calibration, from the company's own history (mandatory here — `business-model/07_business-quality.md` scores Cyclicality 22/100 and calls TTWO "a cyclical, hit-driven owner of entertainment intellectual property"; `business-model/10_external-dependency.md` rates both the consumer cycle and the console-hardware cycle **Mid**).** The company's own annual EBITDA series FY2022–FY2026 is **671.0 / 555.5 / 432.2 / 379.5 / 788.5** [`CIQ Financials_Annual → Income Statement` — vendor export]. Peak-in-window to trough (FY2022 → FY2025) is **−43.4%**; the widest single year-on-year comparison in the series (FY2026 → FY2025) is **−51.9%**; the latest LTM is already **−8.1%** below FY2026. The **−43.4%** reading is run as a named scenario below. The cycle that drives this company is the **release slate, not the economy**, and the unusual feature is that the latest period sits *between* launches, so the peak lies ahead rather than behind.

---

## 2. Stress Scenarios

All figures USD millions. **Mechanics, stated before the numbers, so every cell can be rebuilt:**
- **EBITDA** = 677.6 × (1 − h).
- **Net debt / EBITDA (static)** holds today's strict net debt of **1,370.4** constant over the stressed EBITDA — the figure comparable to `01`. **Net debt / EBITDA (+12m)** is the same ratio on the stressed balance sheet twelve months in: debt 2,529.8 − 629.4 repaid = **1,900.4** (face), cash & equivalents 1,149.4 + stressed FCF − 629.4.
- **EBITDA / interest** uses **gross** interest expense of **135.7**, held constant, because 100% of drawn borrowings are fixed-rate and `04` requires gross, not net. The rate-shock column adds 20.0.
- **Covenant** is tested on its **own** metric and in the **MAX / ceiling** direction, per `04` §2's explicit direction-awareness check: headroom = (3.75 − actual) ÷ 3.75. Stressed covenant Consolidated Adjusted EBITDA = 797.2 × (1 − h) — the **proportional** haircut, which is the conservative of the two mechanics (the absolute pass-through variant, 797.2 − 677.6h, is carried in §3). `04` qualifier 8 requires cash and EBITDA to be stressed **jointly**, so the netting leg moves with the cash balance, and the post-2026-12-31 **Maximum Cash Netting Amount of 1,500.0** is applied. Two netting cases are shown because `04` qualifier 9 could not prove that the 524.2 of bank time deposits qualifies as "Permitted Investments": **full netting** and the conservative **cash-only netting** anchor `04` asked this agent to use.
- **FCF scaling, stated as required:** lost EBITDA drops through to free cash flow one-for-one with **no cash-tax relief** — `stressed FCF(h) = 62.6 − 677.6h`. Base FCF is `03`'s reported §15 figure (CFO − total capex) for the LTM to 2026-09-30, **62.6**. The zero-tax-shield choice is evidenced, not assumed: FY2026 cash income taxes of **149.4** were paid almost entirely as foreign withholding tax (**Turkey 83.6**, Finland 26.0, UK 19.3) with **US federal nil**, and the group is already GAAP loss-making, so there is little domestic tax to shield [`FY26 10-K, Note 15 (Income Taxes)`]. A 21%-shield variant is solved in §3 and moves the break-points by 6–8 percentage points in the company's favour.
- **12-month liquidity gap** = obligations not already inside that FCF − (usable liquidity + stressed FCF). Per `02` §4 and `03` §3b, **cash finance costs absent from the chosen FCF are 0.0** — cash interest and lease payments run through CFO, so they are **not** re-added here, and total capex is already deducted inside the FCF. The obligation term is therefore the **629.4** of maturities plus **0.0** of committed dividends plus **0.0** of absent finance costs. Negative = surplus. A 24-month gap is shown beside it because that is where the wall actually sits.

| Metric | Base (today) | −30% EBITDA | −40% EBITDA | −43.4% (own-history trough) | −60% EBITDA | −40% + WC shock (−225.0) | −40% + rates +200bp |
|---|---:|---:|---:|---:|---:|---:|---:|
| **EBITDA (on A, 677.6)** | **677.6** | **474.3** | **406.6** | **383.5** | **271.0** | **406.6** | **406.6** |
| Net debt / EBITDA — static, strict 1,370.4 | **2.02x** | 2.89x | **3.37x** | 3.57x | **5.06x** | 3.37x | 3.37x |
| Net debt / EBITDA — dynamic at +12m, strict | 1.94x | 3.21x | 3.91x | 4.20x | 6.36x | 4.46x | 3.96x |
| EBITDA / interest (gross 135.7) | **4.99x** | 3.50x | **3.00x** | 2.83x | **2.00x** | 3.00x | 2.61x |
| Covenant Leverage Ratio at +12m — **full netting** | 1.07x *(today)* / 0.99x *(+12m, h=0)* | 1.79x | **2.23x** | 2.41x | **3.76x** | 2.70x | 2.27x |
| **Tightest covenant headroom — full netting** | **+71.4%** *(today)* | **+52.4%** | **+40.6%** | **+35.7%** | **−0.4%** | **+28.1%** | **+39.5%** |
| **Covenant breach? (Y/N) — full netting** | **N** | **N** | **N** | **N** | **Y** | **N** | **N** |
| Covenant Leverage Ratio at +12m — **cash-only netting** (conservative anchor) | 1.73x *(today)* | 2.73x | 3.32x | 3.57x | 5.41x | 3.79x | 3.36x |
| **Tightest covenant headroom — cash-only netting** | **+53.8%** *(today)* | **+27.3%** | **+11.4%** | **+4.7%** | **−44.2%** | **−1.1%** | **+10.3%** |
| **Covenant breach? (Y/N) — cash-only netting** | **N** | **N** | **N** | **N (4.7 points left)** | **Y** | **Y** | **N** |
| **12-month liquidity gap — total committed 2,671.5** | **(2,104.7) surplus** | (1,901.4) surplus | **(1,833.7) surplus** | (1,810.6) surplus | **(1,698.1) surplus** | (1,608.7) surplus | (1,813.7) surplus |
| 12-month liquidity gap — in-hand 1,673.6 only | (1,106.8) surplus | (903.5) surplus | (835.8) surplus | (812.7) surplus | (700.2) surplus | (610.8) surplus | (815.8) surplus |
| **24-month liquidity gap — total committed** | (1,367.3) surplus | (960.7) surplus | (825.2) surplus | (779.1) surplus | (554.2) surplus | (375.2) surplus | (785.2) surplus |
| **24-month liquidity gap — in-hand only** | **(369.4) surplus** | **+37.2 GAP** | **+172.7 GAP** | **+218.8 GAP** | **+443.7 GAP** | **+622.7 GAP** | **+212.7 GAP** |
| Revolver draw the 24-month gap needs, vs the draw the covenant permits | 0.0 vs 1,889.1 | 37.2 vs 992.3 | **172.7 vs 693.3** | 218.8 vs 591.7 | **443.7 vs 95.4 → not permitted** | 622.7 vs 693.3 | 212.7 vs 693.3 |
| Liquidity runway, net-of-FCF basis (total committed / in-hand) | 56.6 / 35.4 mo | 41.6 / 26.1 mo | 38.3 / 24.0 mo | 37.2 / 23.3 mo | 32.9 / 20.6 mo | — | — |
| **Survives without external action? (Y/N)** | **Y** | **Y** — but the in-hand pool runs out inside 24 months and the revolver must be drawn (37.2) | **Y** — needs a 172.7 revolver draw by +24m, which the covenant permits | **Y, narrowly** — covenant headroom on the cash-only-netting anchor is down to **+4.7%** | **N** — covenant breaches at +12m on both netting cases, and the 443.7 draw the 24-month gap needs exceeds the 95.4 the covenant would permit | **N on the conservative anchor** — cash-only-netting headroom **−1.1%** | **Y** — the 200bp costs 20.0 a year only if the revolver is drawn; nothing on existing debt reprices |

**All scenarios assume zero management mitigation — this is a survival bound, not a forecast; the earnings module's realised-offset case (`earnings/07` §2) is the expected-outcome read.** No price rises, no cost programme, no hedging benefit, no cut to the 290.0 of guided capex, no cut to the 716.3-a-year content spend, no slate re-timing, and no benefit at all from the Grand Theft Auto VI launch that happened on **2026-11-19**, inside the stress window. That is the correct posture for a survival test (CLAUDE.md §24 Filter 3 — the question is whether the structure holds if nothing goes right), but it must be labelled rather than left implicit. Three further things are deliberately held fixed against the company: the **323.7** FY2027 tranche of minimum contractual commitments to developers, intellectual-property licensors and sports leagues does not shrink when net bookings fall [`05` §5, from `FY26 10-K, Note 14`]; the **90.0** of interest income a year the cash pile earns is not credited as a cushion [`04` §1]; and the interest bill is held at the full gross **135.7** even after 629.4 of debt repays (the forward coupon on the post-repayment stack is **92.6**).

### The same haircuts on the cash-backed EBITDA base (373.2)

This is the block MODULE_RULES' stress rule points at, and it is uncomfortable. The covenant is **not** tested here, because the covenant's own contractual definition does not charge the content gap — testing it on this base would be the §15 defect of running a sensitivity across a basis it was not measured on.

| Metric | Base | −30% | −40% | −43.4% | −60% |
|---|---:|---:|---:|---:|---:|
| Cash-backed EBITDA (677.6 − 304.4 content gap) | **373.2** | 261.2 | **223.9** | 211.2 | **149.3** |
| Net debt / cash-backed EBITDA (strict 1,370.4) | **3.67x** | 5.25x | **6.12x** | 6.49x | **9.18x** |
| Cash-backed EBITDA / gross interest 135.7 | **2.75x** | 1.93x | **1.65x** | 1.56x | **1.10x** |

**What this block changes and what it does not.** On the cash-truthful base, the company is already at **3.67x net leverage** today and crosses **6x on a 40% haircut** — so the refinancing-market threshold row in §3 is reached far earlier on this measure than on the headline one. What it does **not** change is the covenant or the liquidity answer, because neither is computed on this base: the covenant uses Consolidated Adjusted EBITDA (797.2 on `04`'s floor build) and the liquidity test uses actual cash. The honest statement of the two together: **the covenant and the cash box are what hold; the cash-generating capacity behind them is roughly half what the EBITDA headline implies** (CFO/EBITDA **50.6%** LTM, below 70% in five of six periods, `earnings/06_earnings-quality.md`).

### The realised-offset second case (CLAUDE.md §9) — run beside the bound, not instead of it

CLAUDE.md §9 requires that where the filings show how much of a past shock the company actually absorbed, that measured offset be computed and run as a second case. Two measured responses exist in this pool, and one measured ratio must be **refused**:

- **Refused, with the reason named.** `earnings/07_earnings-sensitivity.md` row 2 computes a **117.1%** realised offset — guided gross profit fell 61.5 between the two FY2027 outlooks while guided operating expenses were cut 72.0, so guided EBIT **rose** 10.5. That percentage **cannot be scaled onto a 30–60% EBITDA collapse**: it was measured on a 61.5 mix-driven gross-profit revision between two guidance tables, not on a realised print, and management attributed part of the operating-expense favourability to "timing". Applying a 117% offset to a 271.0 loss would erase the stress entirely and would be the §15 defect of using a sensitivity across a basis it was not measured on.
- **Used, as absolute measured dollars.** The **72.0** of operating-expense reduction the company actually put in its own guidance in one quarter's update [`Q2 FY27 earnings release, 2026-11-09, FY2027 outlook` vs `Q1 FY27 earnings release, 2026-08-06, p.3`], plus **106.5** = the product-cost ratio improvement of **−160 basis points** that the company realised across FY2026 (14.6% → 13.0% of revenue) applied to FY2026 total net revenue of **6,656.4** [`FY26 10-K, Item 7 — Cost of revenue`; `FY26 10-K, Consolidated Statements of Operations`; `earnings/07` row 5, which records that this was "realised without any fee increase to recover"]. **Total measured annual cost response: 178.5.**

| Case | Zero-mitigation EBITDA | **Realised-offset EBITDA (+178.5)** | Offset as % of the EBITDA lost | Effective haircut after the offset | FCF (12m) | 24-month in-hand gap | Covenant at +12m, full netting |
|---|---:|---:|---:|---:|---:|---:|---:|
| −30% | 474.3 | **652.8** | 87.8% | **−3.7%** | +37.8 | **(319.8) surplus** | 1.06x |
| −40% | 406.6 | **585.1** | 65.9% | **−13.7%** | (29.9) | **(184.3) surplus** | 1.26x |
| −60% | 271.0 | **449.5** | 43.9% | **−33.7%** | (165.5) | **+86.7 gap** | 1.80x |

**Two qualifiers travel with this case and must not be dropped.** The 72.0 was measured between two **guidance** tables rather than two realised prints, and part of it was attributed to timing, which is not a durable cost action. The 106.5 is a realised annual ratio improvement but was achieved in a *rising*-revenue year, through platform mix and a direct-to-consumer channel, so it is not proof the same move is available in a falling one. With that said, the arithmetic is unambiguous: **at the measured offset, a −40% EBITDA shock becomes a −13.7% effective shock, the 24-month in-hand liquidity gap disappears, and covenant headroom stays above +66%.** Zero mitigation is the bound; this is the base rate.

---

## 3. Break Points

| Break Point | EBITDA Decline That Triggers It |
|---|---:|
| **Tightest covenant breaches — holding cash constant at today's balance (the `04` §3 figure)** | **71.4%** (full netting) · **53.8%** (cash-only netting) · **66.5%** (after the 2026-12-31 netting step-down) |
| **Tightest covenant breaches — cash stressed jointly with EBITDA, as `04` qualifier 8 requires** | **59.9%** full netting, proportional covenant-EBITDA haircut · **68.2%** full netting, absolute pass-through · **45.6%** cash-only netting, proportional — **this is the conservative anchor** · 51.9% cash-only netting, absolute |
| **Committed liquidity exhausted within 12 months** | **Not reached on an EBITDA decline alone** (`h = 310.6%`, and `163.3%` on in-hand liquidity only) |
| **Committed liquidity exhausted within 24 months** | **Not reached on an EBITDA decline alone — but only just:** `h = 100.9%`. On **in-hand liquidity only** (no revolver draw): **27.3%** |
| **Net leverage (strict, on A) exceeds a refinancing-market threshold** | **49.4%** to exceed 4.00x (the covenant's own post-Qualified-Acquisition step-up level) · **59.6%** to exceed 5.00x · **66.3%** to exceed 6.00x. **On the cash-backed base of 373.2 the company is already above 3.67x today and crosses 6x at a 40% haircut** |
| **The revolver stops being drawable (the covenant caps the draw below the 24-month cash need)** | **Between 43.4% and 60%** — at −43.4% the 24-month gap of 218.8 sits inside the 591.7 the covenant permits; at −60% the 443.7 gap exceeds the 95.4 permitted |

### The solves, executed and shown

**(a) Covenant breach — MAX / ceiling, on the covenant's OWN numerator.** The covenant metric is **Consolidated Total Indebtedness net of contractual cash netting**, not strict net debt and not gross debt, so the numerator read off `04` §3 is used, not a hard-coded figure. MAX form: `h = 1 − (debt metric) ÷ (T × EBITDA)`, with `T = 3.75`.

```
A1  static, today, full netting:   netCTI = 2,529.8 − min(1,673.6, 2,000.0) = 856.2
    h = 1 − 856.2 ÷ (3.75 × 797.2) = 1 − 856.2 ÷ 2,989.5 = 0.7136  →  71.4%
A2  static, cash-only netting:     netCTI = 2,529.8 − 1,149.4 = 1,380.4
    h = 1 − 1,380.4 ÷ 2,989.5 = 0.5383  →  53.8%
A3  static, after the 2026-12-31 step-down and the 29.4 convertible repayment:
    debt 2,500.4, cash 1,644.2, netting capped at 1,500.0 → netCTI = 1,000.4
    h = 1 − 1,000.4 ÷ 2,989.5 = 0.6654  →  66.5%
```

**Joint solve — cash falls with EBITDA, which is what actually tightens this covenant.** At the 12-month point, with no new borrowing: debt = 2,529.8 − 629.4 = **1,900.4**; the nettable pool = 1,673.6 + (62.6 − 677.6h) − 629.4 = **1,106.8 − 677.6h**, which is below the 1,500.0 cap at every haircut, so the full amount nets. Therefore `netCTI(h) = 1,900.4 − (1,106.8 − 677.6h) = 793.6 + 677.6h` — the numerator **rises** as EBITDA falls, which is why the joint break-point is far earlier than the static one.

```
B1  full netting, covenant EBITDA haircut PROPORTIONAL (797.2 × (1−h)):
    793.6 + 677.6h = 3.75 × 797.2 × (1−h)
    h = (2,989.5 − 793.6) ÷ (677.6 + 2,989.5) = 2,195.9 ÷ 3,667.1 = 0.5988  →  59.9%
B2  full netting, covenant EBITDA ABSOLUTE pass-through (797.2 − 677.6h):
    h = (2,989.5 − 793.6) ÷ (677.6 + 3.75 × 677.6) = 2,195.9 ÷ 3,218.6 = 0.6823  →  68.2%
B3  cash-only netting, PROPORTIONAL — the conservative anchor `04` directs:
    cash & equivalents(h) = 1,149.4 + (62.6 − 677.6h) − 629.4 = 582.6 − 677.6h
    netCTI(h) = 1,900.4 − (582.6 − 677.6h) = 1,317.8 + 677.6h
    h = (2,989.5 − 1,317.8) ÷ 3,667.1 = 1,671.7 ÷ 3,667.1 = 0.4559  →  45.6%
B4  cash-only netting, ABSOLUTE:  h = 1,671.7 ÷ 3,218.6 = 0.5194  →  51.9%
```

Both covenant-EBITDA mechanics are shown rather than one, because the bridge from company-defined EBITDA (677.6) to covenant EBITDA (797.2) is built from items that are **not** EBITDA-proportional — stock-based compensation +344.7, interest income −90.0, the deferred-revenue decrease −225.0 — so neither mechanic is exactly right. The proportional one is the conservative of the two and is used for the headline. Neither solve returns `h ≥ 1`, because the covenant metric carries positive net debt at every haircut.

**(b) Liquidity exhaustion.** Equation: `usable liquidity + stressed 12-month FCF(h) = obligations not already inside that FCF`. Usable liquidity is `03`'s committed figure **2,671.5** with **nothing deducted for a minimum-liquidity covenant, because none exists**, and with restricted cash of 83.0 and uncommitted capacity of 494.0 already excluded. Obligations = maturities **629.4** + committed dividends/buybacks **0.0** + cash finance costs absent from the chosen FCF **0.0** (interest and leases are inside CFO per `02` §4 and `03` §3b — adding them would charge the same payment twice). Scaling: `FCF(h) = 62.6 − 677.6h`, no cash-tax relief.

```
12 months, total committed:  h = (2,671.5 + 62.6 − 629.4) ÷ 677.6 = 3.1061  →  310.6%   h ≥ 1
12 months, in-hand only:     h = (1,673.6 + 62.6 − 629.4) ÷ 677.6 = 1.6334  →  163.3%   h ≥ 1
24 months, total committed:  h = (2,671.5 + 2×62.6 − 1,429.4) ÷ (2×677.6) = 1.0089  →  100.9%   h ≥ 1
24 months, in-hand only:     h = (1,673.6 + 2×62.6 − 1,429.4) ÷ (2×677.6) = 0.2726  →  27.3%
With a 21% cash-tax shield instead of zero:  24m total committed 127.7% · 24m in-hand 34.5%
Realised-offset case (+178.5 of measured cost response), 24m in-hand:
    h = (1,673.6 + 2×(62.6 + 178.5) − 1,429.4) ÷ (2×677.6) = 0.536  →  53.6%
```

**Three `h ≥ 1` results reported plainly, not as a fabricated percentage.** On committed liquidity, **liquidity exhaustion is not reached on an EBITDA decline alone** inside either window — committed liquidity of 2,671.5 is 4.24x the 12-month maturities and 1.87x the 24-month wall before any cash generation. The 24-month total-committed figure of **100.9%** means the structure runs out of committed liquidity at almost exactly the point EBITDA reaches zero, which is a boundary worth stating rather than rounding past. **The one finite liquidity break-point is the in-hand pool at 27.3%** — a 27% EBITDA fall empties cash plus bank deposits over 24 months and forces a revolver draw. That is not itself a survival break (the revolver is committed to 2030-05-19 and is not borrowing-base), but it converts the funding plan from a balance-sheet fact into a covenant-conditional one.

**Precision cap, stated rather than hidden.** Two residuals from `03` §3b remain open and bound the precision of every liquidity figure above: **revolver commitment and letter-of-credit fees are not disclosed anywhere in the pool** (unquantified, not assumed zero), and **the peak intra-quarter working-capital need is not disclosed**, so each liquidity break-point should be read as the **upper** end of its case. Neither residual is large enough to move a break-point by the ~18 percentage points that separate the conservative covenant anchor (45.6%) from the full-netting one (59.9%), but neither is zero.

**(c) Net leverage exceeds a refinancing threshold — MAX form with `T` = the threshold.**

```
T = 4.00x:  h = 1 − 1,370.4 ÷ (4.00 × 677.6) = 0.4944  →  49.4%
T = 5.00x:  h = 1 − 1,370.4 ÷ (5.00 × 677.6) = 0.5955  →  59.6%
T = 6.00x:  h = 1 − 1,370.4 ÷ (6.00 × 677.6) = 0.6629  →  66.3%
```

---

## 4. Survival Read

**The structure first breaks at a covenant, not at the cash box, and on the conservative reading it breaks at a roughly 46% EBITDA decline — with the first *visible* strain much earlier, at about 27%.** The single maintenance covenant in the entire capital structure is the maximum Leverage Ratio of **3.75 : 1.00**, at **1.07x** today with **+71.4%** headroom [`04` §3, engine-computed on the contract's own definitions — **not** a company-reported figure, because neither filing discloses the computed ratio and the quarterly compliance certificate is not in the pool]. Holding cash constant it would take a **71.4%** fall in covenant EBITDA to breach. But cash does not hold constant, and this covenant is a net-debt test whose cushion is almost entirely the contractual cash netting: stress the cash balance alongside EBITDA, as `04` instructed, and the breach point moves to **59.9%** on full netting and **45.6%** on the cash-only-netting anchor that applies if the 524.2 of bank time deposits does not qualify as a "Permitted Investment" — a question the filings do not answer. Separately, a **27.3%** EBITDA fall empties cash and bank deposits over 24 months and forces a revolver draw; that is survivable (the facility is committed to 2030-05-19, is not borrowing-base, and the covenant permits a 693.3 draw at a −40% haircut against a 172.7 need) but it means the 2028 Notes get paid with borrowed money rather than with the balance sheet.

**A 30–40% EBITDA decline — a normal recession, not a tail — is survivable on its own, and a 60% one is not.** At **−40%** with zero management response: committed liquidity still covers the 12-month maturities with a **1,833.7 surplus**, covenant headroom is **+40.6%** on full netting, net leverage is **3.37x** and EBITDA covers gross interest **3.00x**. The company would need to draw **172.7** of its revolver by the 24-month mark, which the covenant permits; it would need **no** equity raise, **no** asset sale and **no** waiver. At **−60%**, the covenant breaches at the 12-month point on both netting cases (**−0.4%** full netting, **−44.2%** cash-only) and the **443.7** revolver draw the 24-month gap needs exceeds the **95.4** the covenant would permit — so at that depth the company needs a **lender waiver or amendment**, and there is **no equity cure right** in this agreement to write a cheque against [`04` §2, from a direct search of `FY25 10-K, Exhibit 10.41`]. Two cases in between deserve naming rather than averaging: the **own-history −43.4%** scenario (FY2022 peak 671.0 to FY2025 trough 379.5) leaves only **+4.7%** of covenant headroom on the cash-only-netting anchor, and the **−40% plus a repeat of the LTM 225.0 deferred-revenue decrease** breaches that anchor outright at **−1.1%**. So the honest sentence is: a 40% decline survives on the full-netting reading of the contract and on a 60% probability-free view of the facts; it does **not** survive a 40% decline plus a working-capital shock on the conservative netting reading.

**Market-closure test — assume no new unsecured refinancing for 12 months.** Liquidity holds, and nothing breaks inside twelve months at any haircut tested. Only **629.4** falls due in that window against **1,149.4** of cash & equivalents (**1.83x**), **1,673.6** including bank deposits (**2.66x**) and **2,671.5** including the committed revolver (**4.24x**) [`02` §4]. Even at **−60%** with zero mitigation, the 12-month gap is a **1,698.1 surplus** on committed liquidity and a **700.2 surplus** on in-hand liquidity alone. **What breaks first under closure is the covenant, not the cash** — at −60% the Leverage Ratio fails at the 12-month quarter-end while the cash box is still full, because the covenant's numerator rises as the cash drains and its denominator falls as EBITDA does, from both ends at once. Beyond twelve months closure bites differently: the **800.0** of 2028 Notes due **2028-03-28** is covered **1.17x** by in-hand liquidity and **1.87x** including the revolver, so the 24-month wall is payable without the market — but paying it drains liquidity to roughly **244.2** against realised **LTM FCF of 62.6** and a just-reported half-year FCF of **(356.2)**. Two dated, mechanical tightenings arrive before any trading deteriorates and neither needs anyone to do anything: the **29.4** Zynga convertible repays on **2026-12-15**, and the Maximum Cash Netting Amount steps **down from 2,000.0 to 1,500.0 on 2026-12-31**, together costing about **4.8 percentage points** of covenant headroom from the quarter ending 2027-03-31 — visible only in the credit-agreement exhibit, in neither filing's narrative [`04` §3].

**TTWO is not net cash on either basis — strict net debt 1,370.4, broad 846.2 — so the §24 Filter-3 net-cash credit does not apply, and the survival read does not get the strongest outcome.** What it does get is a structure that is **100% fixed-rate, 100% unsecured, free of any borrowing base, carrying exactly one maintenance covenant with no springing trigger, no minimum-liquidity test and no interest-coverage test**, against committed liquidity of 2,671.5 — and whose weakness is not the debt terms but the cash engine behind them: EBITDA converted to operating cash at **50.6%** over the LTM, free cash flow was negative in three of the last five fiscal years, and the whole 24-month funding plan reduces to one unreported product cycle. The decisive number is not in this module's gift to forecast and is deliberately left unprobabilised: for the company's guided FY2027 operating cash flow of **over 1,000.0** to land after a first half that printed **(173.5)**, the six months to 2027-03-31 must generate **over 1,173.5** of operating cash flow against a best-ever full year of **434.1** [`03` §3a]. If it lands, no stress in this report matters. If it does not, the first thing that fails is a covenant the engine — not the company — has computed.

**Out-of-scope boundary.** No probability is assigned to any scenario above, no solvency verdict is reached, and no valuation or rating is offered — those belong to `99_balance-sheet-survival-synthesis`, the valuation module and the master synthesizer.

---

## 5. Executed Calculation Record (fix F09)

Every stressed figure, every headroom percentage and every break-point solve above was produced by executed Python, not mental arithmetic. Four `Bash` runs; inputs are the upstream anchors cited in §1 and the filing lines they rest on, and the printed output is reproduced verbatim.

**Run 1 — base inputs, cash-backed cross-check, and the own-history cycle calibration:**

```
EA=677.6; EB=724.9; EC=565.3; ED=1053.0; CONTENT_GAP=304.4; E_CASHBACK=EA-CONTENT_GAP
ND_STRICT=1370.4; FACE=2529.8; INT_GROSS=135.7; COV_EBITDA=797.2; T=3.75
CASH=1149.4; STI=524.2; GROSS_LIQ=CASH+STI; REVOLVER=997.9; LIQ_TOTAL=GROSS_LIQ+REVOLVER
MAT12=629.4; MAT24=1429.4; FCF_BASE=62.6; NET_CAP_NOW=2000.0; NET_CAP_AFTER=1500.0
hist={'FY2022':671.0,'FY2023':555.5,'FY2024':432.2,'FY2025':379.5,'FY2026':788.5}
```

```
gross liquidity 1673.6 total committed 2671.5 cash-backed EBITDA proxy 373.2 vs LTM CFO 367.1
base net lev (strict/A) 2.02  EBITDA/int (A) 4.99
base covenant: netCTI 856.2 lev 1.074 headroom 71.4 %
peak-in-window FY2022 671.0 -> trough FY2025 379.5 = -43.4 %
FY2026 788.5 -> FY2025 379.5 (worst y/y comparison) = -51.9 %
latest LTM 724.9 vs FY2026 788.5 = -8.1 %
```

**Run 2 — the scenario grid (zero-mitigation bound):**

```
def fcf(h, extra=0.0): return 62.6 - 677.6*h - extra
def state12(h, extra=0.0):
    f=fcf(h,extra); return f, 1149.4+f-629.4, 1673.6+f-629.4, 2529.8-629.4
def cov_lev(h, extra=0.0, cash_only=False, prop=True):
    f,ce,pool,debt=state12(h,extra)
    netcti = debt - min(max(0.0, ce if cash_only else pool), 1500.0)
    cov = 797.2*(1-h) if prop else 797.2 - 677.6*h
    return netcti, cov, netcti/cov
```

```
Base: EBITDA 677.6 | cash int 135.7 | FCF(12m) 62.6
   net lev static(strict 1370.4) 2.02x | dynamic +12m 1.94x | EBITDA/int 4.99x
   covenant full-netting lev 0.995x hr 73.5% breach=N | cash-only-netting lev 1.653x hr 55.9% breach=N
   12m gap: total -2104.7 (surplus 2104.7) | in-hand -1106.8 || 24m gap: total -1367.3 | in-hand -369.4
-30%: EBITDA 474.32 | FCF(12m) -140.68
   net lev static 2.89x | dynamic +12m 3.21x | EBITDA/int 3.5x
   covenant full-netting lev 1.786x hr 52.4% breach=N | cash-only-netting lev 2.726x hr 27.3% breach=N
   12m gap: total -1901.42 | in-hand -903.52 || 24m gap: total -960.74 | in-hand 37.16
-40%: EBITDA 406.56 | FCF(12m) -208.44
   net lev static 3.37x | dynamic +12m 3.91x | EBITDA/int 3.0x
   covenant full-netting lev 2.226x hr 40.6% breach=N | cash-only-netting lev 3.322x hr 11.4% breach=N
   12m gap: total -1833.66 | in-hand -835.76 || 24m gap: total -825.22 | in-hand 172.68
-43.4% own-history: EBITDA 383.52 | FCF(12m) -231.48
   net lev static 3.57x | dynamic +12m 4.2x | EBITDA/int 2.83x
   covenant full-netting lev 2.411x hr 35.7% breach=N | cash-only-netting lev 3.572x hr 4.7% breach=N
   12m gap: total -1810.62 | in-hand -812.72 || 24m gap: total -779.14 | in-hand 218.76
-60%: EBITDA 271.04 | FCF(12m) -343.96
   net lev static 5.06x | dynamic +12m 6.36x | EBITDA/int 2.0x
   covenant full-netting lev 3.764x hr -0.4% breach=Y | cash-only-netting lev 5.408x hr -44.2% breach=Y
   12m gap: total -1698.14 | in-hand -700.24 || 24m gap: total -554.18 | in-hand 443.72
-40% + WC shock 225.0: EBITDA 406.56 | FCF(12m) -433.44
   net lev static 3.37x | dynamic +12m 4.46x | EBITDA/int 3.0x
   covenant full-netting lev 2.696x hr 28.1% breach=N | cash-only-netting lev 3.792x hr -1.1% breach=Y
   12m gap: total -1608.66 | in-hand -610.76 || 24m gap: total -375.22 | in-hand 622.68
-40% + rates +200bp: EBITDA 406.56 | cash int 155.7 | FCF(12m) -228.44
   net lev static 3.37x | dynamic +12m 3.96x | EBITDA/int 2.61x
   covenant full-netting lev 2.268x hr 39.5% breach=N | cash-only-netting lev 3.364x hr 10.3% breach=N
   12m gap: total -1813.66 | in-hand -815.76 || 24m gap: total -785.22 | in-hand 212.68
```

**Run 3 — the break-point solves and the realised-offset second case:**

```
=== (a) COVENANT BREACH SOLVES — MAX/ceiling: h = 1 - (debt metric)/(T x EBITDA) ===
A1 static today      netCTI 856.2  : h = 1 - 856.2/(3.75x797.2)  = 0.7136 -> 71.4%
A2 static cash-only  netCTI 1380.4 : h = 0.5383 -> 53.8%
A3 post step-down    netCTI 1000.4 : h = 0.6654 -> 66.5%
--- JOINT: netCTI(h) = 1900.4 - (1106.8 - 677.6h) = 793.6 + 677.6h
B1 joint, covEBITDA PROPORTIONAL: h = (2989.5 - 793.6)/(677.6 + 2989.5) = 0.5988 -> 59.9%
B2 joint, covEBITDA ABSOLUTE:     h = (2989.5 - 793.6)/(677.6 + 3.75x677.6) = 0.6823 -> 68.2%
B3 joint + cash-only netting, PROPORTIONAL: h = (2989.5 - 1317.8)/3667.1 = 0.4559 -> 45.6%
B4 joint + cash-only netting, ABSOLUTE:     h = 0.5194 -> 51.9%
=== (b) LIQUIDITY EXHAUSTION SOLVES ===
  tax shield 0% | total committed 2671.5 | 12m 629.4:  h = 3.1061 -> 310.6%  >=1 NOT reached on EBITDA alone
  tax shield 0% | total committed 2671.5 | 24m 1429.4: h = 1.0089 -> 100.9%  >=1 NOT reached on EBITDA alone
  tax shield 0% | in-hand only 1673.6   | 12m 629.4:  h = 1.6334 -> 163.3%  >=1 NOT reached on EBITDA alone
  tax shield 0% | in-hand only 1673.6   | 24m 1429.4: h = 0.2726 ->  27.3%
  tax shield 21%| total committed 2671.5| 24m 1429.4: h = 1.2771 -> 127.7%  ; in-hand 24m h = 0.345 -> 34.5%
=== (c) NET LEVERAGE EXCEEDS A REFI THRESHOLD ===
  T=4.0x: h = 1 - 1370.4/(4.0x677.6) = 0.4944 -> 49.4%
  T=5.0x: h = 0.5955 -> 59.6%     T=6.0x: h = 0.6629 -> 66.3%
=== REALISED-OFFSET SECOND CASE (CLAUDE.md §9) ===
  measured offsets: guided opex cut 72.0 + product-cost -160bp x FY26 revenue 6656.4 = 106.5 ; total 178.5
  -30%: zero-mitigation 474.3 -> realised-offset 652.8 (offset 87.8% of the 203.3 lost); effective haircut 3.7%
        FCF(12m) 37.8; 24m in-hand gap -319.8; covenant joint full-netting 1.059x
  -40%: zero-mitigation 406.6 -> realised-offset 585.1 (offset 65.9% of the 271.0 lost); effective haircut 13.7%
        FCF(12m) -29.9; 24m in-hand gap -184.3; covenant joint full-netting 1.258x
  -60%: zero-mitigation 271.0 -> realised-offset 449.5 (offset 43.9% of the 406.6 lost); effective haircut 33.7%
        FCF(12m) -165.5; 24m in-hand gap 86.7; covenant joint full-netting 1.795x
```

**Run 4 — the cash-backed base, the covenant cap on drawing the revolver, and the runway re-run:**

```
=== CASH-BACKED EBITDA BASE (373.2) UNDER THE SAME HAIRCUTS ===
  -0.0%:  373.2  | net lev 3.67x | EBITDA/int 2.75x
  -30.0%: 261.24 | net lev 5.25x | EBITDA/int 1.93x
  -40.0%: 223.92 | net lev 6.12x | EBITDA/int 1.65x
  -43.4%: 211.23 | net lev 6.49x | EBITDA/int 1.56x
  -60.0%: 149.28 | net lev 9.18x | EBITDA/int 1.1x
=== 24-MONTH CUMULATIVE CASH NEED AND THE COVENANT CAP ON DRAWING THE REVOLVER ===
  -0.0%:  pool 369.4   draw needed 0.0   | covEBITDA 797.2 max netCTI 2989.5 -> max permitted draw 1889.1 | OK
  -27.3%: pool -0.57   draw needed 0.57  | covEBITDA 579.56 max netCTI 2173.37 -> max permitted 1072.97 | OK
  -30.0%: pool -37.16  draw needed 37.16 | covEBITDA 558.04 max netCTI 2092.65 -> max permitted 992.25  | OK
  -40.0%: pool -172.68 draw needed 172.68| covEBITDA 478.32 max netCTI 1793.7  -> max permitted 693.3   | OK
  -43.4%: pool -218.76 draw needed 218.76| covEBITDA 451.22 max netCTI 1692.06 -> max permitted 591.66  | OK
  -60.0%: pool -443.72 draw needed 443.72| covEBITDA 318.88 max netCTI 1195.8  -> max permitted 95.4    | BREACH / insufficient
=== REALISED-OFFSET 24m in-hand break-point ===
  h = (1673.6 + 2x(62.6+178.5) - 1429.4)/(2x677.6) = 0.536 -> 53.6%
=== 03 GROSS-OBLIGATIONS RUNWAY, BASE CHECK ===
  base: total 31.0 months | in-hand 19.4 months  [matches 03 §3c: 31.0 / 19.4]
=== NET-OF-FCF RUNWAY PER SCENARIO (03 §3d form: burn = 629.4 - FCF(h)) ===
   -0.0%:  FCF 62.6    burn 566.8  -> total 56.6 mo | in-hand 35.4 mo
   -30.0%: FCF -140.68 burn 770.08 -> total 41.6 mo | in-hand 26.1 mo
   -40.0%: FCF -208.44 burn 837.84 -> total 38.3 mo | in-hand 24.0 mo
   -43.4%: FCF -231.48 burn 860.88 -> total 37.2 mo | in-hand 23.3 mo
   -60.0%: FCF -343.96 burn 973.36 -> total 32.9 mo | in-hand 20.6 mo
```

---

## 6. Qualifiers `99` Must Carry Forward

1. **Source-check status: UNCHECKED, not verified clean.** No `numeric_reading_check` field exists on any of the 30 manifest sources. Every amount here was read from the frozen filing extract that reports it, or taken verbatim with its label from `01`–`05`.
2. **Every leverage and coverage multiple rests on a non-GAAP EBITDA.** The GAAP operating result is a **loss** — (180.8) LTM and (104.2) in FY2026 — so there is no GAAP-EBITDA-based ratio anywhere in this report, and the canonical 677.6 is partly engine-computed (its FY2026 component of 760.6 is an engine build on the company's published definition, because the company publishes no FY2026 full-year EBITDA in this pool).
3. **Every covenant figure is the engine's own calculation on contract definitions, not a company-reported number.** Neither filing discloses the computed Leverage Ratio, the covenant Consolidated Adjusted EBITDA, or an express compliance statement, and the §5.01(c) compliance certificate is not in the pool. `04`'s covenant EBITDA of 797.2 is a **floor** (seven uncapped add-back clauses deliberately omitted), so error in the breach points runs toward **too early**, not too late.
4. **The conservative covenant anchor is the cash-only-netting case, and it is live, not hypothetical.** Whether the 524.2 of bank time deposits qualifies as "Permitted Investments" under the agreement's two-year and $250,000,000-capital tests is **not proven from available data** — the filing names neither the banks nor the deposit maturities. On that anchor the breach point is a **45.6%** EBITDA decline, and a −40% decline plus a repeat of the LTM 225.0 deferred-revenue outflow **breaches**.
5. **There is no equity cure right.** A §6.05 breach needs a lender waiver or amendment, not a cheque.
6. **Two dated, mechanical tightenings land before any trading deteriorates:** the 29.4 Zynga convertible repays **2026-12-15**, and the Maximum Cash Netting Amount steps down from 2,000.0 to 1,500.0 on **2026-12-31**, together costing about 4.8 percentage points of headroom from the quarter ending 2027-03-31. Neither appears in the 10-K or 10-Q narrative.
7. **Every scenario is a zero-mitigation bound, labelled as such on every line.** The measured realised-offset case (+178.5 of annual cost response, built as 72.0 + 106.5 with both qualifiers attached) is the expected-outcome read and turns a −40% shock into a −13.7% effective one. The 117.1% offset in `earnings/07` row 2 was **refused** for this stress, by name, because its basis does not support scaling onto a 30–60% EBITDA decline.
8. **Liquidity precision is capped by two undisclosed items** — revolver commitment and letter-of-credit fees, and the peak intra-quarter working-capital need — so each liquidity break-point is the **upper** end of its case.
9. **No probability is attached to any haircut, and no solvency verdict, valuation or rating is offered here** — `99`, the valuation module and the master synthesizer own those.
10. **Not net cash on either basis** (strict 1,370.4; broad 846.2), so the §24 Filter-3 net-cash credit does not apply. The structure is not assessed against any "optimal leverage" frame — this module rejects it (MODULE_RULES Core Principle 8).
