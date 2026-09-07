# Downside Stress Test — NVT

**Company:** nVent Electric plc (NYSE: NVT) · **Reporting currency: USD, in millions** · **Reporting standard: US GAAP** · **Fiscal year ends 31 December** · **Measurement date: 30 June 2026** (Q2 FY26 Form 10-Q, filed 2026-07-31) · **Report date: 2026-09-07**

**Read these five things before the tables. They set the basis for every number below.**

1. **This is a survival bound, not a forecast.** Every scenario holds management's response at zero — no price rises, no cost programme, no capacity deferral, no dividend or buyback cut beyond what a row names. That is the right posture for a survival test (CLAUDE.md §24, Filter 3), but it is a *bound*, and it is labelled as one on every line (CLAUDE.md §9). Where the filings let a realised offset be measured, it is computed and run as a second case (§2A).
2. **Two structures are run, not one.** The **as-reported** 30-June-2026 balance sheet, and a **pro-forma** balance sheet for the Maverick Power acquisition announced 24 August 2026 ($1.75bn cash plus up to $550m earnout, "cash on hand and new debt", committed Bank of America bridge, expected close Q4 2026). **The financing mix, tenor and pricing are not disclosed in this data pool** [`nVent news release "nVent to Acquire Maverick Power", 2026-08-24`]. Every Maverick line is labelled **pro-forma inference, not from filings**, and is never presented as reported.
3. **Every covenant line uses the credit agreement's OWN definitions**, taken from `04_coverage-and-covenants`: covenant EBITDA $1,106.7m (the only addback is non-cash share-based compensation), covenant net debt $1,250.0m (principal $1,500.0m less the $250.0m cash-netting cap). Those are a different basis from the reported-EBITDA leverage and coverage rows, and the two are never mixed (CLAUDE.md §15).
4. **The base EBITDA is at a cyclical peak.** `01` records LTM reported EBITDA of $1,074.6m against a normalised / mid-cycle $863.6m. A haircut applied to a peak understates the fall from a normalised base — every table therefore also shows the mid-cycle read.
5. **Every stressed figure, headroom and break-point solve below was produced by an executed Python calculation**, not by hand. The commands and their output are printed in §3.

---

## 1. Base Case (today)

| Input | Value | Source |
|---|---:|---|
| **Base EBITDA (cash-backed), LTM to 30-Jun-2026** | **1,074.6** — reported, continuing operations, GAAP-derived (operating income 842.7 + D&A 231.9) | `01` §7; `ciq_facts.json` `ltm_ebitda_m` 1,074.6 [`CIQ Financials → Income Statement`, LTM Jun-30-2026]. **Cash-backing confirmed**: continuing-ops CFO $772.8m = **71.9%** of EBITDA, and 69–79% for four straight years with no low-conversion flag [`earnings/06_earnings-quality`; `04` §1] |
| Memo — company adjusted EBITDA | 1,061.5 | `01` §7. Its Q2 FY26 component ($340.1m) is computed by `01` from filed tables, not company-published — caveat carried |
| Memo — **normalised / mid-cycle EBITDA** | **863.6** | Three-year average of reported EBITDA (FY2024 675.6 / FY2025 840.5 / LTM 1,074.6) [`01` §5]. *A labelled normalisation, not a forecast* |
| **Net debt (strict §15 basis — `01`'s designated canonical figure)** | **1,236.4** | `01` §4 and §7: gross debt $1,492.4m [`Q2 FY26 10-Q, Note 10 (Debt)`] − cash $256.0m. The **broad** basis is identical — nVent holds no short-term investments |
| Memo — net debt, strict, **excluding the $79.6m of cash that cannot be readily repatriated** | 1,316.0 | `01` §7 designates this variant for use here |
| **Net debt / EBITDA (strict, peak EBITDA)** | **1.15x** · **1.43x** on mid-cycle EBITDA | 1,236.4 ÷ 1,074.6 · 1,236.4 ÷ 863.6 [`01` §5] |
| **EBITDA / interest** | **14.35x** (1,074.6 ÷ 74.9). Interest is disclosed **net only** | `04` §1. LTM net interest $74.9m = FY2025 75.0 − H1'25 35.0 + H1'26 34.9 [`Q2 FY26 10-Q, Condensed Consolidated Statements of Income`] |
| **Tightest covenant + threshold** | **Maximum net leverage 3.75x** (MAX / ceiling), electively **4.25x for four testing periods in connection with certain material acquisitions**. Actual **1.13x** on the credit agreement's own definitions → **+69.9% headroom** | `04` §2–§3 [`Q2 FY26 10-Q, Note 10`]. Second covenant: minimum interest coverage **3.00x** (MIN / floor), actual 14.78x, +392.5% |
| Covenant EBITDA / covenant net debt | **1,106.7** / **1,250.0** | `04` §2. Covenant EBITDA is only **3.0% above** reported EBITDA — one addback (non-cash share-based comp), no restructuring, deal-cost or synergy addbacks. Netting capped at $250.0m of the $256.0m cash |
| **Next-12m obligations (1-Jul-2026 to 30-Jun-2027)** | **151.0** on the financing basis (13.8 maturities + 137.2 dividends) · **292.6** on the gross-obligations basis (adds 74.9 cash interest + 66.7 maintenance-capex proxy) | `03` §2; maturities from `02` §1a (**0.92%** of the $1,500.0m principal, all term-loan amortisation) |
| **Committed liquidity** | **856.0 — gross-liquidity basis** (cash 256.0 + committed undrawn revolver availability 600.0, disclosed, non-borrowing-base, maturing 2030-06-30) | `03` §1 [`Q2 FY26 10-Q, Note 10`] |
| **Usable liquidity used in every solve below** | **776.4** | 856.0 less the **$79.6m** of repatriation-limited cash. **No minimum-liquidity covenant exists** to subtract [`04` §2 — searched and found nil]. The $300.0m accordion is excluded (lender-consent, not committed) |
| **Floating-rate debt (gross)** | **200.0 — 13.3%** of the $1,500.0m principal (Term Loan Facility, average rate 4.903% at 30-Jun-2026); 1,300.0 (86.7%) fixed | `01` §7; `02` §3 [`Q2 FY26 10-Q, Note 10`] |
| **Hedge coverage (interest rate)** | **None.** The $350.5m of cross-currency swaps hedge **currency, not interest rate** | `Q2 FY26 10-Q, Note 9`; `01` §7. No commodity hedging is disclosed anywhere in the pool [`earnings/07`, row 4] |
| **Working-capital seasonality / peak build** | Seasonal, company-stated. **Largest realised build in the pool: $219.7m in H1 2026** (58% of it — $128.3m — in Q1, which took cash to a $190.0m trough). **A peak need is nowhere disclosed** | `03` §3A "Seasonality / Peak Liquidity Need" [`Q2 FY26 10-Q, MD&A, Liquidity and Capital Resources`; `Q1 FY26 10-Q, MD&A`] |
| **Normalised operating FCF (the flow that absorbs the stress)** | **634.1** | `03` §3A: continuing-ops CFO 772.8 − capex 112.9 − the **$25.8m one-off IEEPA tariff refund**. The recurring figure leads; the inflated $659.9m is shown beside it, labelled (CLAUDE.md §15) |
| Effective tax rate used in the FCF drop-through | **22.2%** | 168.4 tax ÷ (591.0 earnings + 168.4) [`CIQ Financials → Income Statement`, LTM Jun-30-2026; `03` §3B] |

**Currency and EBITDA basis, stated as required.** All figures are **USD millions, US GAAP**. The stress base is **reported** EBITDA on continuing operations, cross-checked as cash-backed against `earnings/06_earnings-quality` — not headline company-adjusted EBITDA, and not the covenant number. Covenant rows use covenant EBITDA and say so.

### 1A. Pro-forma base for Maverick Power — **PRO-FORMA INFERENCE, NOT FROM FILINGS**

**Step 2a of this agent's workflow requires a pro-forma base before haircutting, because a material acquisition is signed and not yet in the reported balance sheet.** Built on the same **strict §15 basis** the rest of this report uses, and on the credit agreement's own definitions for the covenant lines.

| Pro-forma build (all *inference, not from filings*) | Value | How it is built, and what is assumed |
|---|---:|---|
| Net debt, strict, at 30-Jun-2026 (reported) | 1,236.4 | `01` §4 |
| + Maverick cash consideration | **1,750.0** | `nVent news release, 2026-08-24`. **Mix-independent for net debt**: a dollar of cash spent adds a dollar of net debt exactly as a dollar borrowed does, so the debt-funded portion and the cash-funded portion enter identically here. A stock-funded portion would add nothing — **there is none; the consideration is all cash** |
| + target's own net debt consolidating at close | **0.0 assumed — NOT DISCLOSED** | The release does not say whether the deal is cash-free / debt-free, and Maverick is private with no filed balance sheet in this pool. **Assuming zero is the flattering assumption and it is flagged as such**; any assumed debt adds one-for-one to every pro-forma leverage figure below |
| No double-count check | passed | No acquisition debt is drawn yet (the balance sheet is dated 30-Jun-2026, the deal was signed 24-Aug-2026) and no escrowed or restricted acquisition cash sits in the $256.0m. Nothing is added twice |
| **= Pro-forma net debt, strict §15** | **2,986.4** | |
| **= Pro-forma covenant net debt** | **3,000.0** | (1,500.0 principal + 1,750.0 new debt) − the $250.0m netting cap. On the alternative funding case where the $176.4m of freely usable cash is spent first, `04` §3A computes **2,999.0** — within $1.0m, so **the funding mix is very nearly irrelevant to the covenant** |
| Maverick's own EBITDA (perimeter-matched to the debt above) | **~152.2**, range **152.2–166.7** | $1,750.0m ÷ the release's own "approximately 11.5 times anticipated 2026 adjusted EBITDA" (and ÷ 10.5x after the present value of expected tax benefits). **Not disclosed directly** — this is implied from the stated multiple, so the leverage is shown as a range bracketing it. On the wider figure PF leverage is 2.41x rather than 2.43x — the choice does not move the answer |
| **PF EBITDA — peak / trailing base** | **1,226.8** | 1,074.6 + 152.2. **Mixed basis (§15): nVent's trailing twelve months plus Maverick's anticipated full-year 2026.** Carry this label wherever the number is quoted |
| **PF EBITDA — normalised / mid-cycle base** | **1,015.8** | 863.6 + 152.2 |
| PF EBITDA — FY2026 consensus base | 1,377.2 | 1,225.0 [`CIQ Estimates → Consensus`, FY2026] + 152.2 |
| **PF covenant EBITDA** | **1,258.9** | 1,106.7 + 152.2. **The weakest input in this report**: Maverick's implied EBITDA is a company-*adjusted* figure derived from a purchase multiple, and the covenant's definition permits almost no addbacks — so this line probably flatters the covenant ratio |
| **PF net leverage — strict, on PEAK EBITDA** | **2.43x** | 2,986.4 ÷ 1,226.8 |
| **PF net leverage — strict, on MID-CYCLE EBITDA** | **2.94x** | 2,986.4 ÷ 1,015.8. **This, not 2.43x, is the central estimate for a cyclical name** (MODULE_RULES Calculation Standard 4); 2.43x is the floor |
| PF net leverage — strict, on forward consensus EBITDA | 2.17x | 2,986.4 ÷ 1,377.2 |
| PF net leverage with the full **$550m earnout** paid — peak / mid-cycle | **2.88x** / **3.48x** | (2,986.4 + 550.0) ÷ 1,226.8 and ÷ 1,015.8. The earnout is contingent on 2027–2028 performance, and management's own language points toward paying it: returns are "expected to be significantly better if the potential additional considerations are paid" [`nVent news release, 2026-08-24`; `05` §3] |
| **PF covenant net leverage** | **2.38x** peak · **2.88x** mid-cycle · **3.41x** mid-cycle **with the earnout paid** | 3,000.0 ÷ 1,258.9 · ÷ 1,041.6 · 3,550.0 ÷ 1,041.6 [`04` §3A] |
| **PF headroom on the 3.75x ceiling** | **+36.5%** peak · **+23.2%** mid-cycle · **+9.1%** mid-cycle with the earnout paid | Direction-aware MAX form: (3.75 − actual) ÷ 3.75 |
| PF cash interest, assumed | **171.1** at 5.5% on $1,750m of new debt (range 162.4 at 5.0% / 179.9 at 6.0%) | **The coupon is a labelled assumption — the pool discloses no pricing.** The range brackets nVent's own 5.650% 2033 coupon [`04` §3A] |
| PF normalised FCF | **559.2** (funding Case A) / **566.7** (Case B) | 634.1 less after-tax incremental interest [`03` §3B]. **Maverick's own cash generation is deliberately excluded** — including it would lengthen every runway, so this is a conservative bound |
| PF usable liquidity | **776.4** (Case A, all-debt-funded) / **600.0** (Case B, freely usable cash spent first — the revolver and nothing else) | `03` §3B, less the $79.6m of repatriation-limited cash in each case |

---

## 2. Stress Scenarios

**Both grids apply the haircut to EBITDA and hold everything else fixed** — debt, cash, interest, capex, dividends. FCF scales as: `stressed FCF(h) = FCF_base − EBITDA_base × h × (1 − 0.222)`, i.e. lost EBITDA drops through to cash at the after-tax operating rate, with cash interest and maintenance capex held at their base levels. **Covenant EBITDA is haircut in the same proportion as reported EBITDA** — the conservative choice: holding the $40.5m of non-cash share-based comp fixed instead moves the as-reported covenant break point from −69.9% to −72.0%, i.e. further away. **The 12-month liquidity gap is `(maturities + dividends + any named shock) − stressed FCF`; a negative figure is a surplus.** Cash interest and capex are not re-added there, because FCF already carries both (MODULE_RULES §8 — adding them would double-count).

### 2A. As-reported structure (30 June 2026)

| Metric | Base | −30% EBITDA | −40% EBITDA | −60% EBITDA | **−37.4% history-calibrated** | **Realised-offset case (−16.8%)** | −40% + WC shock | −40% + rates +200bp |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| EBITDA (reported basis) | 1,074.6 | 752.2 | 644.8 | 429.8 | 673.1 | 894.1 | 644.8 | 644.8 |
| Net debt / EBITDA (strict §15, canonical) | 1.15x | 1.64x | 1.92x | 2.88x | 1.84x | 1.38x | 1.92x | 1.92x |
| EBITDA / interest (net interest 74.9) | 14.35x | 10.04x | 8.61x | 5.74x | 8.99x | 11.94x | 8.61x | **8.17x** (interest 78.9) |
| Covenant net leverage (credit-agreement basis: 1,250.0 ÷ covenant EBITDA) | 1.13x | 1.61x | 1.88x | 2.82x | 1.80x | 1.36x | 1.88x | 1.88x |
| **Tightest covenant headroom** (MAX 3.75x ceiling) | **+69.9%** | **+57.0%** | **+49.8%** | **+24.7%** | **+51.9%** | **+63.8%** | **+49.8%** | **+49.8%** |
| Second covenant — min interest coverage (floor 3.00x), covenant basis | 14.78x / +392.5% | 10.34x / +244.8% | 8.87x / +195.5% | 5.91x / +97.0% | 9.26x / +208.5% | 12.29x / +309.8% | 8.87x / +195.5% | 8.42x / +180.5% |
| **Covenant breach? (Y/N)** | **N** | **N** | **N** | **N** | **N** | **N** | **N** | **N** |
| Stressed normalised FCF | 634.1 | 383.3 | 299.7 | 132.5 | 321.7 | 493.6 | 299.7 | 296.6 |
| **12-month liquidity gap** (uses − sources; negative = surplus) | **−483.1** | **−232.3** | **−148.7** | **+18.5** | **−170.7** | **−342.6** | **+71.0** | **−145.6** |
| Usable liquidity remaining after the gap (of 776.4) | 776.4 | 776.4 | 776.4 | 757.9 | 776.4 | 776.4 | 705.4 | 776.4 |
| **Survives without external action? (Y/N)** | **Y** | **Y** | **Y** | **Y** | **Y** | **Y** | **Y** | **Y** |

**Notes on the two extra columns, and on the two named shocks.**

- **The history-calibrated scenario is required because this is a cyclical name** (`business-model/07_business-quality` scores cyclicality 30/100, reverse-mapped — its lowest row; `earnings/02_revenue-drivers` calls Q2 FY26 "a peak-of-cycle print"). **The company's own post-divestiture history contains no EBITDA decline to calibrate against** — continuing-operations EBITDA rose in every year on record: 395.4 (FY2022) → 575.9 → 673.1 → 824.6 → 1,074.6 LTM [`earnings/01_historical-financials` §1]. The only fall in the pool, FY2021's $484.6m to FY2022's $395.4m (−18.4%), sits across the Thermal Management basis break and is **not comparable**. So the honest calibration is not a trough-to-peak ratio but a **revert to a level the company actually printed on this continuing-operations perimeter eighteen months ago: FY2024 EBITDA of $673.1m, a −37.4% haircut.** *Labelled: FY2024 predates the $975.7m Electrical Products Group acquisition, so it is a smaller asset base — reverting to it is a deliberately adverse calibration, not a like-for-like one.*
- **The working-capital shock is the $219.7m realised H1-2026 build** — the largest in the pool, not a disclosed peak, so it may understate a future one [`03` §3A]. **It is deliberately internally adverse**: in a −40% volume-driven downturn working capital would *release* cash, not consume it. Stacking a peak build on a demand collapse is a bound, and is labelled as one.
- **The rate shock is +200bp on the $200.0m of floating debt = +$4.0m a year**, with no hedge offset (the cross-currency swaps hedge FX only). At 13.3% floating it moves EBITDA/interest by 0.44 turns and nothing else. It is **material to state and immaterial to the answer** — say so rather than pad it.
- **The −60% column is the only as-reported scenario that produces any gap at all**, and it is $18.5m against $776.4m of usable liquidity — 2.4% of it. Even at **zero EBITDA** (h = 1.00) stressed FCF is −$201.9m and usable liquidity plus that flow is $574.5m against $151.0m of obligations.

### 2B. Pro-forma for Maverick Power — **PRO-FORMA INFERENCE, NOT FROM FILINGS**

Covenant net debt $3,000.0m, covenant EBITDA $1,258.9m, strict net debt $2,986.4m, PF EBITDA base $1,226.8m, PF interest $171.1m (5.5% assumed), PF FCF $559.2m, usable liquidity $776.4m (funding Case A). **Every figure rests on a financing mix, tenor and price the pool does not contain.**

| Metric | Base (PF) | −30% EBITDA | −40% EBITDA | −60% EBITDA | **−37.4% history-calibrated** | **Realised-offset case (−16.8%)** | −40% + WC shock | −40% + rates +200bp |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| PF EBITDA | 1,226.8 | 858.8 | 736.1 | 490.7 | 768.5 | 1,020.7 | 736.1 | 736.1 |
| PF net debt / EBITDA (strict §15) | 2.43x | 3.48x | 4.06x | 6.09x | 3.89x | 2.93x | 4.06x | 4.06x |
| PF EBITDA / interest | 7.17x | 5.02x | 4.30x | 2.87x | 4.49x | 5.97x | 4.30x | **3.50x** (interest 210.1) |
| PF covenant net leverage (3,000.0 ÷ covenant EBITDA) | 2.38x | 3.40x | **3.97x** | **5.96x** | **3.80x** | 2.86x | **3.97x** | **3.97x** |
| **Tightest covenant headroom** (MAX 3.75x ceiling) | **+36.5%** | **+9.2%** | **−5.9%** | **−58.9%** | **−1.4%** | **+23.6%** | **−5.9%** | **−5.9%** |
| Headroom on the **4.25x acquisition election** (four testing periods) | +43.9% | +19.8% | **+6.6%** | −40.2% | **+10.5%** | +32.8% | +6.6% | +6.6% |
| Second covenant — min interest coverage (floor 3.00x), covenant basis | 7.36x / +145.3% | 5.15x / +71.7% | 4.41x / +47.2% | **2.94x / −1.9%** | 4.61x / +53.6% | 6.12x / +104.1% | 4.41x / +47.2% | 3.60x / +19.9% |
| **Covenant breach? (Y/N)** | **N** | **N** | **Y on 3.75x · N if the 4.25x election is taken** | **Y — both covenants** | **Y on 3.75x (marginal, −1.4%) · N on 4.25x** | **N** | **Y on 3.75x · N on 4.25x** | **Y on 3.75x · N on 4.25x** |
| Stressed PF FCF | 559.2 | 272.9 | 177.4 | **−13.5** | 202.6 | 398.9 | 177.4 | 147.0 |
| **12-month liquidity gap** (negative = surplus) | **−408.2** | **−121.9** | **−26.4** | **+164.5** | **−51.6** | **−247.9** | **+193.3** | **+3.9** |
| **Survives without external action? (Y/N)** | **Y** | **Y** | **Liquidity Y; covenant NO — needs the 4.25x election or a waiver** | **NO — covenant breach on both tests; needs a waiver, and a $164.5m gap against $776.4m of liquidity** | **Liquidity Y; covenant marginal — needs the election** | **Y** | **Liquidity Y ($193.3m gap vs $776.4m); covenant NO** | **Liquidity Y; covenant NO** |

**Four qualifiers that must travel with 2B.**

- **The 4.25x election is real and it is exactly this situation.** The credit agreement permits 4.25x "at nVent Finance's election and subject to certain conditions, **for four testing periods in connection with certain material acquisitions**" [`Q2 FY26 10-Q, Note 10`]. It is not a waiver and it does not need lender consent at the time — but it lasts four quarters, not indefinitely, and "certain conditions" are not disclosed in the pool. So the −40% pro-forma outcome is best stated as: **breaches the standing 3.75x ceiling; clears the temporary 4.25x election with +6.6% to spare, for four quarters only.**
- **The pro-forma rate shock is much larger than the as-reported one and is a bound.** It assumes the whole $1,750m of new debt is floating (+$35.0m at +200bp) on top of the $200.0m term loan (+$4.0m). The fixed/floating split of the acquisition financing is **not disclosed**; if it is termed out with fixed-rate notes the shock reverts to the as-reported $4.0m.
- **PF FCF turns negative at −60%** (−$13.5m). That is the first scenario in this report in which the business consumes cash rather than generating it.
- **The mid-cycle pro-forma is worse than every column above and belongs beside them.** On the normalised base, PF covenant leverage is **2.88x (+23.2% headroom)** before the earnout and **3.41x (+9.1%)** with it — meaning that measured from a normalised earnings base with the earnout paid, **a further −9.1% EBITDA decline breaches the 3.75x ceiling.** That is the single most fragile number this report produces.

**Mitigation assumption, stated as CLAUDE.md §9 requires.** *All scenarios above assume zero management mitigation — this is a survival bound, not a forecast; the earnings module's realised-offset case (`earnings/07` §2) is the expected-outcome read.*

### 2C. The realised-offset case, computed rather than assumed (CLAUDE.md §9)

**What the filings actually let us measure, and what they do not.**

- **Measurable — the cost channel.** `earnings/07` §2 computes the realised offset from the filings and the calls: pre-mitigation inflation of ~$110m over H1 FY26 ÷ $2,713.3m of sales = ~405bps, against an observed gross-margin change of −170bps → **realised offset = 1 − 170/405 = 58%**, with a quarterly path of **40% (Q1 FY26) → 79% (Q2 FY26)**. That is measured, not assumed.
- **Not measurable — the volume channel.** `earnings/07` §6 states it plainly: "The pool contains no organic-revenue decline since the divestiture, so the true decremental rate is **not measurable from available data**." There is therefore **no realised offset to run for a demand-driven EBITDA fall**, and the −30/−40/−60% columns stay bounds. Saying otherwise would be invention.

**So the realised-offset case is run on the cost channel, and the arithmetic cuts both ways:**

| Read | Arithmetic |
|---|---|
| **The offset applied to a −40% bound** | If the −$429.8m of EBITDA loss is cost-driven, the 58% measured offset means the realised hit is **$429.8m × 0.42 = $180.5m = −16.8% of EBITDA** — the "realised-offset case" column in §2A and §2B |
| **The offset applied to the full known cost exposure** | The entire disclosed cost exposure is roughly **$270m gross** a year (~$190m all-in tariffs plus ~$80m of non-tariff inflation) [`earnings/07` rows 3–4]. At the measured 58% offset that is **−$113.4m of EBITDA = −10.6%** — well short of even the −30% haircut |
| **What a −40% fall would require through the cost channel** | A gross pre-mitigation cost shock of **$1,023.4m — 19.0% of guided FY2026 sales of $5,372.5m**, i.e. **5.4 times** the entire all-in tariff run rate. For −30% it is $767.6m (14.3% of sales); for −60%, $1,535.1m (28.6%) |

**Conclusion of the realised-offset test: a −30% to −60% EBITDA fall at nVent is a volume event, not a cost event.** Cost inflation of the size the company is actually absorbing, run at the rate it has actually absorbed it, gets nowhere near these haircuts. **Three qualifiers travel with the 58%** and are not dropped: the cost dollars are call figures stated as floors ("more than", "approximately"), so the offset is conservative; the previous cycle **over-recovered and then handed the price back** (group price +5.5% in 2023, −0.2% in 2024), so the offset is not a permanent ratchet; and "no contractual pass-through" is a fact about contracts, never a measurement — the 58% is the measurement [`earnings/07` §2].

---

## 3. Break Points

**The covenant solve is direction-aware and uses the covenant's OWN numerator**, read from `04`: the nVent covenant nets cash (capped at $250.0m), so the numerator is **covenant net debt**, not gross or secured debt.

- **MAX / ceiling** (max net leverage): `h = 1 − covenant net debt ÷ (T × covenant EBITDA)`
- **MIN / floor** (min interest coverage): `h = 1 − (T × interest) ÷ covenant EBITDA`
- **Liquidity**: solve `usable liquidity + stressed FCF(h) = next-12-month obligations`, with `stressed FCF(h) = FCF_base − EBITDA_base × h × (1 − 0.222)`

### 3A. As-reported structure

| Break Point | EBITDA Decline That Triggers It | The solve |
|---|---:|---|
| **Tightest covenant breaches (max net leverage 3.75x, MAX/ceiling)** | **−69.9%** | `h = 1 − 1,250.0 ÷ (3.75 × 1,106.7) = 1 − 1,250.0 ÷ 4,150.1 = 0.6988`. Covenant EBITDA would have to fall to $333.3m |
| Same covenant, on the 4.25x acquisition election | −73.4% | `h = 1 − 1,250.0 ÷ (4.25 × 1,106.7) = 0.7342` |
| Same covenant, holding non-cash share-based comp fixed at $40.5m instead of haircutting it | −72.0% | `1,074.6 × (1−h) + 32.1 = 333.3` → `h = 0.7197`. **The proportional assumption used in §2 is the more conservative one** |
| Same covenant, measured from the **normalised / mid-cycle** base | a **further −62.5%** | `h = 1 − 1,250.0 ÷ (3.75 × 889.4) = 0.6252`, where $889.4m is covenant EBITDA scaled to the mid-cycle base |
| Second covenant breaches (min interest coverage 3.00x, MIN/floor) | −79.7% | `h = 1 − (3.00 × 74.9) ÷ 1,106.7 = 1 − 224.7 ÷ 1,106.7 = 0.7970`. Nearly ten percentage points further out than the leverage covenant, so **it does not bind** |
| **Committed liquidity exhausted within 12 months** | **Not reached on an EBITDA decline alone — `h = 1.51 ≥ 1`** | `776.4 + (634.1 − 836.0h) = 151.0` → `836.0h = 1,259.5` → `h = 1.5065`. At h = 1.00 (EBITDA of zero) stressed FCF is −$201.9m and sources are $574.5m against $151.0m of obligations. **State it plainly rather than print a fabricated %** |
| Same, with the $219.7m working-capital shock stacked on | Still not reached — `h = 1.24 ≥ 1` | `776.4 + (634.1 − 836.0h) = 151.0 + 219.7` → `h = 1.2437` |
| Same, on **cash only** (revolver excluded — the market-closure variant) | **−78.9%** | `176.4 + (634.1 − 836.0h) = 151.0` → `h = 0.7888` |
| Net leverage exceeds **2.5x — the top of management's own stated target range** | **−54.0%** | `h = 1 − 1,236.4 ÷ (2.5 × 1,074.6) = 0.5398`. "We exited the quarter with net leverage of 1.2x, well below our target range of 2 to 2.5x" [`Q2 FY26 transcript, 2026-07-31, prepared remarks (CFO)`] |
| Net leverage exceeds **4.0x — a labelled refi-market threshold** | **−71.2%** | `h = 1 − 1,236.4 ÷ (4.0 × 1,074.6) = 0.7124`. *4.0x is an assumption, not a disclosure — no rating-agency report is in this pool, so no rating threshold is asserted* [`00_solvency-data-triage`; `02` §3]. At 6.0x: −80.8% |

### 3B. Pro-forma structure — **PRO-FORMA INFERENCE, NOT FROM FILINGS**

| Break Point | EBITDA Decline That Triggers It | The solve |
|---|---:|---|
| **Tightest covenant breaches (3.75x ceiling)** | **−36.4%** | `h = 1 − 3,000.0 ÷ (3.75 × 1,258.9) = 1 − 3,000.0 ÷ 4,720.9 = 0.3645` |
| Same, on the **4.25x acquisition election** (four testing periods only) | −43.9% | `h = 1 − 3,000.0 ÷ (4.25 × 1,258.9) = 0.4393` |
| Same, **with the full $550m earnout paid** | **−24.8%** | `h = 1 − 3,550.0 ÷ (3.75 × 1,258.9) = 0.2480` |
| Same, measured from the **normalised / mid-cycle** base | a **further −23.2%** | `h = 1 − 3,000.0 ÷ (3.75 × 1,041.6) = 0.2320` |
| Same, **mid-cycle base AND the earnout paid** | **a further −9.1%** | `h = 1 − 3,550.0 ÷ (3.75 × 1,041.6) = 0.0911`. **The most fragile figure in this report** |
| Second covenant breaches (min interest coverage 3.00x) at PF interest of $171.1m | −59.2% | `h = 1 − (3.00 × 171.1) ÷ 1,258.9 = 0.5923`. At +200bp interest of $210.1m: **−49.9%** |
| **Committed liquidity exhausted within 12 months — funding Case A** | Not reached — `h = 1.24 ≥ 1` | `776.4 + (559.2 − 954.5h) = 151.0` → `h = 1.2411` |
| **Committed liquidity exhausted — funding Case B** (freely usable cash spent at close; the revolver is the only usable liquidity) | Not reached, but only just — `h = 1.06 ≥ 1` | `600.0 + (566.7 − 954.5h) = 151.0` → `h = 1.0642` |
| **Committed liquidity exhausted — the UNDRAWN-BRIDGE-TENOR case** (bridge drawn at close and NOT termed out within 12 months) | **`h ≤ 0` — the gap exists at TODAY's EBITDA, before any decline** | Case B: uses = 1,573.6 bridge + 13.8 amortisation + 137.2 dividends = **$1,724.6m**; sources at h = 0 = 600.0 liquidity + 566.7 FCF = **$1,166.7m** → **gap $557.9m**, solved `h = −0.585`. Case A (all-debt-funded, $1,750.0m bridge): uses $1,901.0m, sources $1,335.6m → **gap $565.4m**, `h = −0.592`. At −30% the gap is $844–852m; at −40%, $940–947m; at −60%, $1,131–1,138m |
| PF net leverage exceeds 2.5x (management's own ceiling) | **−2.6%** — i.e. it is essentially there on day one | `h = 1 − 2,986.4 ÷ (2.5 × 1,226.8) = 0.0263`. On the mid-cycle base it is **already above 2.5x at 2.94x before any decline** |
| PF net leverage exceeds the labelled 4.0x refi threshold | −39.1% | `h = 1 − 2,986.4 ÷ (4.0 × 1,226.8) = 0.3914` |

### 3C. Executed calculations (fix F09)

Every stressed figure, headroom and break point above was produced by the two Python scripts below and copied from their output — none was computed by hand.

```
$ python3 stress.py
=== AS-REPORTED (30-Jun-2026) ===
Base                      h= 0.000 EBITDA= 1074.6 ND/E=1.15x E/int=14.35x covLev=1.13x hr= 69.9% covMinCov=14.78x hrmin=392.5% FCF= 634.1 gap= -483.1
-30% EBITDA               h= 0.300 EBITDA=  752.2 ND/E=1.64x E/int=10.04x covLev=1.61x hr= 57.0% covMinCov=10.34x hrmin=244.8% FCF= 383.3 gap= -232.3
-40% EBITDA               h= 0.400 EBITDA=  644.8 ND/E=1.92x E/int= 8.61x covLev=1.88x hr= 49.8% covMinCov= 8.87x hrmin=195.5% FCF= 299.7 gap= -148.7
-60% EBITDA               h= 0.600 EBITDA=  429.8 ND/E=2.88x E/int= 5.74x covLev=2.82x hr= 24.7% covMinCov= 5.91x hrmin= 97.0% FCF= 132.5 gap=   18.5
Hist-cal: revert to FY2024 h=0.374 EBITDA=  673.1 ND/E=1.84x E/int= 8.99x covLev=1.80x hr= 51.9% covMinCov= 9.26x hrmin=208.5% FCF= 321.7 gap= -170.7
Realised-offset 58%       h= 0.168 EBITDA=  894.1 ND/E=1.38x E/int=11.94x covLev=1.36x hr= 63.8% covMinCov=12.29x hrmin=309.8% FCF= 493.6 gap= -342.6
-40% + WC shock 219.7     h= 0.400 EBITDA=  644.8 ND/E=1.92x E/int= 8.61x covLev=1.88x hr= 49.8%                              FCF= 299.7 gap=   71.0
-40% + rates +200bp       h= 0.400 EBITDA=  644.8 ND/E=1.92x E/int= 8.17x covLev=1.88x hr= 49.8% covMinCov= 8.42x hrmin=180.5% FCF= 296.6 gap= -145.6
hist-cal haircut = 0.3736
=== BREAK POINTS AS-REPORTED ===
covenant MAX 3.75x  h = 1 - 1250.0/(3.75*1106.7) = 0.6988
covenant MAX 4.25x  h = 0.7342
covenant MIN 3.00x  h = 1 - (3.00*74.9)/1106.7  = 0.7970
  strict net lev > 2.5x  h = 0.5398 | > 3.0x  h = 0.6165 | > 3.75x h = 0.6932 | > 4.0x h = 0.7124 | > 6.0x h = 0.8082
liquidity exhaustion h = (776.4 + 634.1 - 151.0)/(1074.6*0.778) = 1.5065  (>=1 -> not reached)
  at h=1.0: FCF = -201.9  liq+FCF = 574.5 vs obl 151.0
  cash-only usable 176.4: h = 0.7888   |   with WC shock 219.7: h = 1.2437
as-reported covenant break, SBC held fixed: 0.7197  vs proportional 0.6988

$ python3 stress_pf.py
PF net debt strict 2986.4 | PF lev peak 2.43 | mid-cycle 2.94 | fwd consensus 2.17 | +earnout peak 2.88 | +earnout mid 3.48
PF lev peak on Maverick EBITDA range 152.2-166.7: 2.43 - 2.41
Base PF                h=0.000 E=1226.8 ND/E=2.43x E/int= 7.17x covLev=2.38x hr= 36.5% minCov=7.36x hrm=145.3% FCF= 559.2 gap= -408.2
-30%                   h=0.300 E= 858.8 ND/E=3.48x E/int= 5.02x covLev=3.40x hr=  9.2% minCov=5.15x hrm= 71.7% FCF= 272.9 gap= -121.9
-40%                   h=0.400 E= 736.1 ND/E=4.06x E/int= 4.30x covLev=3.97x hr= -5.9% minCov=4.41x hrm= 47.2% FCF= 177.4 gap=  -26.4
-60%                   h=0.600 E= 490.7 ND/E=6.09x E/int= 2.87x covLev=5.96x hr=-58.9% minCov=2.94x hrm= -1.9% FCF= -13.5 gap=  164.5
hist-cal -37.4%        h=0.374 E= 768.5 ND/E=3.89x E/int= 4.49x covLev=3.80x hr= -1.4% minCov=4.61x hrm= 53.6% FCF= 202.6 gap=  -51.6
realised-offset -16.8% h=0.168 E=1020.7 ND/E=2.93x E/int= 5.97x covLev=2.86x hr= 23.6% minCov=6.12x hrm=104.1% FCF= 398.9 gap= -247.9
PF -40% + WC 219.7  gap = 193.3
PF -40% + rates +200bp: interest 210.1 E/int 3.50 minCov 3.60 gap 3.9
=== PF BREAK POINTS ===
cov MAX 3.75x h = 1 - 3000/(3.75*1258.9) = 0.3645 | 4.25x election h = 0.4393 | with 550 earnout h = 0.2480
cov MIN 3.00x at PF interest 171.1 h = 0.5923 | at +200bp interest 210.1 h = 0.4993
  strict net lev > 2.5x h = 0.0263 | > 4.0x h = 0.3914
liquidity exhaustion Case A h = 1.2411 | Case B h = 1.0642
=== BRIDGE NOT TERMED OUT (12m) ===
Case A bridge 1750.0: uses=1901.0 sources(h=0)=1335.6 gap@h=0 = 565.4 -> break-point h = -0.592
     h=0.3: gap = 851.7 | h=0.4: gap = 947.2 | h=0.6: gap = 1138.1
Case B bridge 1573.6: uses=1724.6 sources(h=0)=1166.7 gap@h=0 = 557.9 -> break-point h = -0.585
     h=0.3: gap = 844.2 | h=0.4: gap = 939.7 | h=0.6: gap = 1130.6
PF mid-cycle covenant EBITDA 1041.6 | covLev 2.88x headroom 23.2% | further decline to breach h = 0.2320
  with full 550 earnout: covLev 3.41x, h = 0.0911 | on 4.25x election: h = 0.3223
AS-REPORTED mid-cycle covLev 1.41x headroom 62.5% | further decline to breach h = 0.6252
cost-channel check at the measured 58% offset:
  -30% EBITDA needs a gross pre-mitigation cost shock of 767.6m = 14.3% of guided FY26 sales
  -40% EBITDA needs 1023.4m = 19.0% of sales | -60% needs 1535.1m = 28.6% of sales
  known all-in cost exposure ~270m gross at 58% offset -> 113.4m of EBITDA = -10.6% haircut
```

---

## 4. Survival Read

**On the balance sheet nVent actually reports today, nothing breaks inside a normal recession and nothing breaks in a severe one: the tightest covenant — the 3.75x maximum net leverage ceiling in the Senior Credit Facilities, measured on the credit agreement's own definitions — needs a −69.9% fall in covenant EBITDA to break, the 3.00x minimum interest-coverage floor needs −79.7%, and committed liquidity is never exhausted on an EBITDA decline alone (the solve returns `h = 1.51`, meaning the company still has $574.5m of usable sources against $151.0m of obligations even at zero EBITDA).** A −30% or −40% decline — a normal recession, not a tail — leaves net leverage at 1.64x / 1.92x strict, interest covered 10.0x / 8.6x, covenant headroom of +57.0% / +49.8%, and an annual free-cash surplus of $232.3m / $148.7m before touching a dollar of the $776.4m of usable liquidity. **Survivable on its own, with no equity raise, no asset sale and no waiver.** Even −60% produces only an $18.5m twelve-month gap, 2.4% of usable liquidity, with the covenant still +24.7% clear. Add the $219.7m peak working-capital build to the −40% case and the gap is $71.0m against $776.4m; add +200bp of rates and it costs $4.0m a year, because only 13.3% of the debt floats and none of it is rate-hedged.

**The pro-forma balance sheet is a different credit, and the number that changes is the covenant, not the liquidity.** Adding $1.75bn of cash consideration takes strict net leverage to 2.43x on peak EBITDA and **2.94x on a normalised mid-cycle base** — and the EBITDA fall that breaks the 3.75x ceiling collapses from **−69.9% to −36.4%**, to **−24.8%** if the full $550m earnout is paid, and to **a further −9.1% measured from a normalised base with the earnout paid.** A −40% decline breaches the standing ceiling by 5.9% but clears the 4.25x acquisition election with +6.6% to spare — and that election lasts four testing periods, not indefinitely, with conditions the pool does not disclose. So the pro-forma answer is: **liquidity holds at −30/−40/−60% (the solve returns `h ≥ 1` even in the funding case where the entire freely usable cash balance is spent and the revolver is the only usable liquidity), but the covenant does not — a 40% earnings decline post-Maverick requires either the election or a lender waiver, and a 60% decline breaches both covenants and turns FCF negative.** Recognise what that means in a downturn: management may need to choose between the buyback, the $137.2m dividend and the covenant, and the covenant wins.

**Market-closure test — assume no new unsecured refinancing for 12 months.** *As-reported: it holds, and easily.* Only $13.8m of debt matures inside the window (0.92% of principal); the $600.0m revolver is committed and does not itself mature until 2030-06-30, so a closed market cannot pull it; and even excluding the revolver entirely, the break point on cash alone is a −78.9% EBITDA fall. *Pro-forma: it holds only if the acquisition debt is termed out.* **This is the one place the structure genuinely breaks, and it breaks at zero EBITDA decline.** If the committed Bank of America bridge is drawn at a Q4 2026 close and is not refinanced within twelve months, up to $1,573.6–1,750.0m enters the twelve-month maturity bucket, against usable liquidity plus stressed free cash flow of $1,166.7–1,335.6m — a **$557.9–565.4m funding gap at today's earnings**, solving to `h ≈ −0.59`. That is not an earnings question at all; it is a market-access question, and the pool contains no tenor, no pricing and no take-out plan. It widens to roughly $940m at −40% and $1,130m at −60%.

**What would be needed, and in what order.** As-reported: nothing. Pro-forma at −30%: nothing. Pro-forma at −40%: the 4.25x election first (a company election, not a negotiation), then a waiver if the decline runs past four quarters, then dividend and buyback suspension — which on its own restores $137.2m + $58.0m a year and closes every liquidity gap in §2B. Pro-forma at −60%: a waiver on both covenants is unavoidable, and the $164.5m gap plus negative FCF makes an asset sale or an equity raise a live option rather than a theoretical one. Under the bridge-not-termed-out case at any earnings level: **refinancing access, and nothing else, is the answer** — the company would need to issue term paper, extend the bridge, or draw and hold the revolver, and none of that is inside its own control. **The single fact that would most change this read is the tenor and pricing of the Maverick financing, and it is not in this data pool.**

**Two things this report does not do.** It assigns **no probability** to any of these scenarios — that is the master synthesizer's job — and it produces no solvency verdict, which belongs to `99_balance-sheet-survival-synthesis`. **Downside resilience is assessable** (a usable EBITDA base exists and covenants are fully disclosed, so no partial-data cap binds), and on the reported structure it is high; the pro-forma structure is where the assessment gets harder, and it is labelled inference throughout because the pool does not disclose how a $1.75bn cheque is being financed.
