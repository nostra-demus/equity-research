# Intrinsic DCF — UBER

**Reporting standard:** US GAAP. **Currency:** USD millions unless per-share. **Fiscal year end:** December 31. **Source caveat (carried from `01_price-and-capital-structure.md` and the earnings/business-model modules):** no primary 10-K/10-Q sits in `data/UBER/`; every historical figure below is a Capital IQ vendor export (source-hierarchy tier 5), cited as "CIQ export," never as "10-K." The Q2 FY2026 earnings-call transcript (Aug-05-2026) is a primary call record.

**Business-Type Gate.** `00_valuation-data-triage.md` and `business-model/02_business-identity.md`/`03_segment-map.md` classify Uber as a two-sided, take-rate marketplace (Mobility / Delivery / Freight) — an **Operating** company under the Business-Type Method Map. This report proceeds with a standard **FCFF DCF**. Freight (≈10% of FY2025 revenue) is industrial-cycle exposed, but at that weight it does not push the whole company into the Commodity/Cyclical row of the Method Map; its soft-cycle history (negative-to-breakeven EBITDA in 5 of the last 6 years) is folded into the margin path as a bounded drag, not treated as a separate cyclicality-gate exercise.

**Anchors reused verbatim from `01_price-and-capital-structure.md`:** current price $68.18 (Aug-05-2026 close, pool-verified); net debt (strict) $9,340mm; minority interest $1,083mm; preferred $0; diluted shares (per-share fair-value count) 2,087.980mm (LTM weighted-average diluted — labeled limitation, not a bottom-up TSM/if-converted rebuild).

## 1. FCF Base & Normalizations

**Base year: FY2025** (Dec-31-2025, the latest full audited-filing-equivalent year in the pool; a Jun-30-2026 LTM column also exists but FY2025 is used as the clean, non-partial-year DCF anchor).

| Item | Base-Year Value (FY2025) | Normalization Applied | Source |
|---|---:|---|---|
| Reported FCF (CFO − total capex) | $9,763mm | None — `earnings/06_earnings-quality.md` §1 confirms no one-off inflation of this figure; shown here as the clean historical reference point, not the DCF's forward-build base | `earnings/01_historical-financials.md` §1; CIQ export, Cash Flow tab |
| EBIT (GAAP operating income) | $5,565mm | None | CIQ export, Income Statement tab |
| Effective tax rate used for NOPAT | **24%** (normalized) vs. GAAP reported rate "NM" (a net tax *benefit* of −$4,346mm) | Strips out the one-off, non-cash deferred-tax valuation-allowance release ($4,346mm FY2025, $5,758mm FY2024) that inflated GAAP net income/EPS — **this rate reconciles to `business-model/09_moat.md` §3's published canonical normalized rate (24%, "approximating combined US federal + state statutory rates"); no divergence between the moat ROIC test and this DCF's NOPAT tax rate.** | `business-model/09_moat.md` §3; `earnings/06_earnings-quality.md` §4, §8 |
| NOPAT (normalized) | $5,565mm × (1−0.24) = **$4,229mm** | Uses the normalized 24% rate, not the GAAP reported rate | Calc. |
| Stock-based compensation (SBC) | $1,826mm (~3.5% of revenue) | **Not added back** in this DCF's FCFF build — SBC is treated as a real, dilutive economic cost embedded in EBIT, not a non-cash addback the way the cash-flow statement treats it. This is the single largest driver of the gap between the DCF's normalized FCFF base and the reported CFO-based FCF above (see bridge below) and is a deliberately conservative choice for a per-share valuation, consistent with CLAUDE.md §15 hygiene (adjustments shown, not netted silently). | `earnings/06_earnings-quality.md` §4 (SBC add-back to Adj. EBITDA) |
| Working-capital driver used | DSO 25.1 days / DPO 10.7 days (FY2025); DIO not applicable (no inventory) | A trade-AR/AP proxy (`NWC_trade = DSO/365 × Revenue − DPO/365 × COGS`) scaled to forecast revenue/COGS, per the module's revenue-linked working-capital rule. This is **narrower** than the full negative-working-capital dynamic `earnings/06_earnings-quality.md` §2 documents (Uber's Accrued Expenses to drivers/merchants growing faster than revenue funds a broader cash-conversion benefit that Capital IQ's own DPO line — Accounts Payable only — does not capture) — flagged explicitly as a **conservative simplification** that likely understates true forward FCF generation on this dimension. | `earnings/06_earnings-quality.md` §3 |
| D&A (% of revenue) | $719mm (1.38% of revenue) | Held flat forward (~1.35%) — historical trend is stable | CIQ export, Income Statement tab |
| Capex (% of revenue) | $336mm (0.65% of revenue) | Held flat forward (~0.6%) — asset-light, no capex guidance since FY2020 | CIQ export, Cash Flow tab; `earnings/04_guidance-consensus.md` §2 |
| **Normalized FY2025 FCFF (NOPAT + D&A − Capex − ΔNWC_trade)** | **$4,526mm** | Bridges from the $9,763mm reported CFO-based FCF primarily via (a) the SBC non-add-back (−$1,826mm) and (b) the swap from the full disclosed FY2025 working-capital cash *source* of $906mm (per `earnings/06_earnings-quality.md` §1) to this narrower trade-based ΔNWC of only $86mm (a ~$1.0bn swing); the remainder of the ~$5.2bn total gap reflects smaller reconciling items (net interest income embedded in CFO via net income; actual cash taxes paid of $345mm vs. the theoretical 24%-of-EBIT tax charge) that this pool's data cannot decompose to full precision (no note-level detail on "Other Operating Activities"). This is the **DCF's forecast base**, not a restatement of the historical FCF figure. | Calc., this agent |

**FCFF identity used (Economic Consistency Gate 1):** `FCFF = NOPAT + D&A − Capex − ΔNWC` (income-statement/balance-sheet build), used **instead of** `CFO − capex` for the forward forecast because a forward cash-flow statement cannot be projected line-by-line from consensus data, and because treating SBC as a real cost (not adding it back) is the more conservative basis for a fully-diluted per-share value. This is a definitional choice, stated once and used consistently — not mixed with the CFO-based definition anywhere in the forecast.

## 2. Forecast Assumptions

Explicit horizon: **FY2026–FY2031 (6 years)**. Terminal starts FY2032.

| Assumption | FY26 | FY27 | FY28 | FY29 | FY30 | FY31 | Terminal | Source / Basis |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| Revenue growth % | 11.2% | 15.8% | 13.8% | 10.4% | 10.4% | 7.9% | 4.0% | **Consensus** (Capital IQ Estimates Report, Consensus tab, Company Level, FY2026–FY2031; estimate coverage 47/52 → 9/9 analysts). **FY2027–FY2028's step-up is flagged**: it likely embeds partial/full-year consolidation of the pending Delivery Hero acquisition (deal announced, not yet closed — `business-model/03_segment-map.md` §3), a real forecast risk if the deal timeline slips. Terminal g = **analyst assumption**, ≈ US long-run nominal GDP proxy (rf 4.6% less a margin), not company-guided |
| EBIT margin % | 13.5% | 14.5% | 15.2% | 15.6% | 15.9% | 16.0% | 16.0% (plateau) | **Analyst assumption**, deliberately **moderated below** the raw consensus-implied Adj. EBITDA trajectory (which would imply EBIT margin near 19% by FY2031 backing out D&A/SBC/other add-backs at a shrinking ratio). The plateau — not continued expansion — reflects `business-model/09_moat.md`'s "No moat proven" verdict and its own explicit caution: "a buyer should not extrapolate the current 9–11% return on capital as the steady-state level." LTM actual EBIT margin = 12.1% |
| Tax rate % | 24% | 24% | 24% | 24% | 24% | 24% | 24% | **Normalized**, reconciled to `business-model/09_moat.md` §3's canonical rate (§1 above) |
| Capex (% of revenue) | 0.6% | 0.6% | 0.6% | 0.6% | 0.6% | 0.6% | 0.6% | **Analyst assumption**, matches the FY2021–FY2025 historical average (all years <1% of revenue); no company capex guidance since FY2020 |
| Δ Working capital (days-based: DSO 25.1d / DPO 10.7d on forecast revenue/COGS) | $295mm use | $465mm use | $469mm use | $404mm use | $445mm use | $370mm use | scales with revenue at g | **Days-of-sales basis from `earnings/06_earnings-quality.md` §3**, held at FY2025 levels (DSO/DPO not projected to drift further, a conservative flat assumption given both have been *improving* historically) |

## 3. Discount Rate (WACC)

| Component | Value | Source |
|---|---:|---|
| Risk-free rate | 4.6% | Web: 10-year US Treasury yield, Aug-05/06-2026 (indicative, dated) — matches the rate `business-model/09_moat.md` §3 also used |
| Equity-risk premium | 5.0% | Inference, not from filings — standard long-run US ERP assumption, matching `business-model/09_moat.md` §3's assumption for clean cross-module reconciliation. (Cross-check: Damodaran's contemporaneous implied ERP, Jan-2026 update, ≈4.2–4.3% — Web-sourced, dated — i.e. the 5.0% figure used here is, if anything, conservative/higher, not aggressive.) |
| Beta | 1.15 | Capital IQ 5-Year Beta — Company Comparable Analysis Uber Technologies Inc.xls, Operating Statistics tab, As-Of 2026-08-06 (same source `09_moat.md` cites) |
| Cost of equity (CAPM: `k_e = rf + β×ERP`) | 4.6% + 1.15×5.0% = **10.35%** | Calc. |
| Pre-tax cost of debt | Interest expense (LTM) $462mm ÷ Total debt (LTM) $14,731mm = **3.14%** | `earnings/03_margin-drivers.md` §3 (interest expense); `01_price-and-capital-structure.md` §4 (total debt) |
| After-tax cost of debt | 3.14% × (1−0.24) = **2.39%** | Calc., using the same normalized 24% tax rate as NOPAT |
| Equity / debt weights (**market-value**) | Equity 90.4% ($138,787mm) / Debt 9.6% ($14,731mm) | `01_price-and-capital-structure.md` §3–§4 (market cap and total debt) |
| **WACC** | **`0.904×10.35% + 0.096×2.39%` = 9.59%** | Calc. — see executed snippet below |

**Formula (pinned):** `WACC = w_e·k_e + w_d·k_d·(1−t)`. No preferred equity exists (`01`, §4), so no `w_p·k_p` term. Weights are **market-value** weights (equity at the $138,787mm market cap, debt at the $14,731mm book value used as the market-value proxy for debt, standard practice absent quoted bond prices) and sum to 1.

**Sanity bounds (Economic Consistency Gate 4).** `after-tax k_d (2.39%) ≤ WACC (9.59%) < k_e (10.35%)` — **holds**. Cost of equity check for a US mega-cap: `rf + 1.4×ERP` = 4.6% + 7.0% = 11.6%; the CAPM `k_e` of 10.35% (β=1.15) sits below this ceiling, so no beta-override justification is required.

**Cross-check against `business-model/09_moat.md`'s inferred cost of capital.** The moat module computed **WACC ≈ 8.1%**, using the **same** rf, ERP, and beta but **book-value** capital weights (Debt 30.5% / Equity+Minority 69.5% off the FY2025 balance sheet, versus this report's market-value weights of Debt 9.6% / Equity 90.4% off the current $138.8bn market cap). The 1.49pp gap (9.59% vs. 8.1%) is **under** the 2pp threshold that would require a dual-WACC sensitivity grid per MODULE_RULES Gate 4, but given the closeness of the two figures the §7 sensitivity grid's `WACC−1%` column (8.59%) already sits close to the moat module's 8.1% estimate, so both readings are effectively spanned. No override of the mechanically-computed WACC is applied — the 9.59% figure is used as computed.

**Executed snippet — WACC blend:**
```
python3:
rf=0.046; erp=0.05; beta=1.15; tax=0.24
ke = rf + beta*erp                      # 0.1035
mktcap=138787.14; total_debt=14731.0
we = mktcap/(mktcap+total_debt)         # 0.904044
wd = total_debt/(mktcap+total_debt)     # 0.095956
kd_pretax = 462.0/14731.0               # 0.031362
kd_aftertax = kd_pretax*(1-tax)         # 0.023835
wacc = we*ke + wd*kd_aftertax           # 0.0958557...

Output:
Cost of equity (ke): 0.1035
we, wd: 0.9040439129864393 0.09595608701356073
kd_pretax, kd_aftertax: 0.03136243296449664 0.023835449053017446
WACC: 0.0958557014174351
after-tax kd <= WACC < ke ? True
```

## 4. Free Cash Flow Forecast & Discounting

**Discounting convention: mid-year** (t−0.5) — cash flows are assumed to arrive evenly through each year, not as a single year-end lump sum; this avoids systematically understating value.

| Year | Revenue | EBIT | NOPAT | Capex | ΔNWC | FCFF | Discount Factor (t−0.5) | PV of FCFF |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| FY2026 | 57,830 | 7,807 | 5,933 | 347 | 295 | 6,072 | 0.9553 (t=0.5) | 5,800 |
| FY2027 | 66,985 | 9,713 | 7,382 | 402 | 465 | 7,420 | 0.8717 (t=1.5) | 6,468 |
| FY2028 | 76,228 | 11,587 | 8,806 | 457 | 469 | 8,909 | 0.7955 (t=2.5) | 7,087 |
| FY2029 | 84,184 | 13,133 | 9,981 | 505 | 404 | 10,209 | 0.7259 (t=3.5) | 7,411 |
| FY2030 | 92,947 | 14,779 | 11,232 | 558 | 445 | 11,484 | 0.6624 (t=4.5) | 7,607 |
| FY2031 | 100,247 | 16,039 | 12,190 | 601 | 370 | 12,571 | 0.6044 (t=5.5) | 7,599 |

D&A (not shown as its own column) is embedded in the FCFF calc: FCFF = NOPAT + D&A − Capex − ΔNWC, with D&A ≈1.35% of revenue each year (FY2026 $781mm → FY2031 $1,353mm).

**Working-capital sign check.** Uber's trade-based NWC (`DSO/365 × Revenue − DPO/365 × COGS`) is small and **positive** at every point (FY2025: $2,639mm), and it **grows** as revenue grows (DSO > DPO in dollar terms once COGS's lower base is applied) — so `ΔNWC` is a **use** of cash every explicit year ($295mm–$469mm), correctly **subtracted** from FCFF. This is not a negative-working-capital business on this narrow AR/AP measure (confirmed: cash-conversion-cycle in `earnings/06_earnings-quality.md` §3 is positive, 14.5 days FY2025, not negative) — no sign-inversion risk applies here, though as noted in §1 the broader accrued-payables dynamic (outside this proxy) likely understates true cash generation, making this a conservative treatment.

**Sum of PV of explicit FCFFs: $41,971mm.**

**Executed snippet — PV of explicit FCFF, terminal value, and EV → equity → per-share bridge:**
```
python3:
fcff = {2026:6072.0,2027:7420.0,2028:8909.0,2029:10209.0,2030:11484.0,2031:12571.0}
wacc = 0.0958557014174351; g = 0.04
for i,y in enumerate(sorted(fcff), start=1):
    t = i - 0.5
    df = 1/((1+wacc)**t)
    print(y, "t=",t, "DF=",round(df,4), "PV=",round(fcff[y]*df,1))
sum_pv_fcff = sum(fcff[y]/((1+wacc)**(i-0.5)) for i,y in enumerate(sorted(fcff),start=1))
tv_undisc = fcff[2031]*(1+g)/(wacc-g)
pv_tv = tv_undisc/((1+wacc)**5.5)
ev = sum_pv_fcff + pv_tv
equity = ev - 9340.0 - 1083.0        # net debt, minority (01's canonical figures)
per_share = equity/2087.980           # diluted share count (01's canonical figure)

Output:
2026 t= 0.5  DF= 0.9553  PV= 5800.4
2027 t= 1.5  DF= 0.8717  PV= 6468.1
2028 t= 2.5  DF= 0.7955  PV= 7086.7
2029 t= 3.5  DF= 0.7259  PV= 7410.5
2030 t= 4.5  DF= 0.6624  PV= 7606.8
2031 t= 5.5  DF= 0.6044  PV= 7598.5
Sum PV of explicit FCFF: 41970.9
TV (undiscounted, end of FY2031): 234064.6
Discount factor for TV (t=5.5): 0.6044
PV of TV: 141479.0
Enterprise value (DCF): 183450.0
TV % of EV: 77.12 %
Equity value: 173027.0
Per-share intrinsic value: 82.87
vs price 68.18 => upside 21.5%
```

## 5. Terminal Value

**Method: Gordon growth.** `TV = FCFF_2032 / (WACC − g) = FCFF_2031 × (1+g) / (WACC − g) = 12,571 × 1.04 / (0.0959 − 0.04) = $234,065mm` (undiscounted, valued as of end-FY2031). `WACC − g = 5.59pp` — comfortably positive, well clear of the near-zero danger zone.

- **Terminal value (undiscounted):** $234,065mm
- **PV of terminal value** (discounted at t=5.5, mid-year-consistent): **$141,479mm**
- **Terminal value as % of total EV: 77.1%** → **exceeds the 75% threshold — flagged terminal-dominated, low-confidence** (Economic Consistency Gate 5). Per the hard rule, a second lens is added below.

**Second lens — exit-multiple cross-check (Gate 5 requirement).** The Gordon TV implies an exit multiple of `TV_undiscounted / FY2031 Adj. EBITDA ($24,743mm consensus) = 9.46x` forward EV/EBITDA on the terminal metric. For context, Uber trades at **11.89x NTM EV/EBITDA today**, and the *current price itself* implies only a **6.05x FY2031 EV/EBITDA multiple** (Capital IQ Estimates Report, Multiples tab, "FY 2031" column, based-on-market-price). This DCF's terminal multiple (9.46x) sits **between** those two anchors — below today's growth multiple (sensible, since growth has decayed to ~4% by then) but **above** what today's price already implies for that same forward year, which is internally consistent with this DCF's base case landing above the current price (§6). The cross-check does not flag the terminal assumption as obviously inflated, but it does show the DCF is pricing a more generous mature-state multiple than the market currently assigns to FY2031.

**Financeable-growth cross-check (Economic Consistency Gate 2) — flagged, not clean.** Terminal-year (FY2031) reinvestment: `Capex − D&A + ΔNWC = 601 − 1,353 + 370 = −$382mm` (net **dis**investment — D&A alone exceeds capex plus the working-capital build). Reinvestment rate = −382/12,190 (NOPAT) = **−3.1%**. Implied growth = ROIC × reinvestment rate ≈ 9.4%(FY2025 ROIC) × −3.1% ≈ **−0.3%**, or ≈ **−0.3%** at the LTM ROIC (10.6%) too — **far below** both the modeled explicit-period growth (7.9–15.8%) and the terminal `g` of 4.0% (a gap far exceeding the ~1.5pp trigger). **This is flagged as a known artifact of applying a capex-based reinvestment formula to an asset-light platform**: Uber's real "growth capital" flows overwhelmingly through opex (SG&A/R&D, expensed not capitalized) and through investing activities *outside* capex — LTM total investing cash outflow was $7,723mm against capex of just $308mm, a >25x gap (`earnings/03_margin-drivers.md` §9), driven by AV equity stakes and the Delivery Hero share purchases. This is a **real, partially-quantified** bridge (the investing-outflow evidence), but it is **not** precise enough to close the −0.3% vs. +4.0% gap to the ~1.5pp tolerance. Per the hard rule, **intrinsic confidence is capped** (already capped by the >75% terminal-dominance flag above) **and a supplementary sensitivity grid at the mechanically-implied "financeable" growth rate is shown** (§7) rather than asserting the 4.0% base case is unconditionally safe.

**"No moat proven" terminal-scaling trigger (CLAUDE.md §24 Filter 5 / avoid-ruin).** `business-model/09_moat.md` §5 returns **"No moat proven"** (3-year average ROIC 6.2% below the ~8.1% WACC it computed; only the two most recent years clear that bar) — an *unproven, not necessarily decaying*, franchise. Per the hard rule, the **base** terminal therefore carries **no perpetual excess-return premium**: the EBIT margin path is **plateaued at 16.0%** from FY2031 onward (not extrapolated further upward, as raw consensus arithmetic would imply — see §2), and terminal `g` (4.0%) sits at a nominal-GDP-proxy level with no moat premium baked in. This is a fade, not a decline — the base case still assumes Uber *holds* its recently-improved (but "early-stage, not yet fully proven," per the moat module) margin level rather than either compounding it further or losing it.

**Structural-decline / runoff terminal (separate trigger — `business-model/07_business-quality.md` rate-of-change score = 35/100, ≤ the ~40 threshold).** Because the rate-of-change/disruption score is this low (management itself frames the AV transition as unresolved, spreading ~$10bn across 6+ unproven partners "so that we're not dependent on one partner"), a **declining-perpetuity / runoff terminal** is built alongside the base, on the SAME nominal basis:

| Runoff assumption | Value | Basis |
|---|---:|---|
| Terminal `g` (nominal) | **−2.0%** | Below current US inflation (~2.5–3%) — a genuine negative real *and* nominal trajectory, reflecting a structural reset (e.g., a major-market driver-reclassification ruling, or AV disintermediation) rather than the base case's steady state |
| Terminal EBIT margin (faded, non-recovering) | 8.0% (vs. base-case plateau of 16.0%; LTM actual 12.1%) | A structural-impairment assumption — cost structure re-regulated / take-rate compressed with no recovery, not a cyclical dip |
| Terminal FCFF (on FY2031 revenue base $100,247mm) | $6,847mm | NOPAT ($100,247×8%×0.76=$6,095mm) + D&A ($1,353mm) − Capex ($601mm) − ΔNWC (≈0, revenue no longer growing) |
| TV (undiscounted) | $57,916mm | `6,847×0.98/(0.0959−(−0.02))` |
| PV of TV | $35,007mm | Discounted at t=5.5, same WACC |
| **Resulting EV / equity / per-share** (keeping the same explicit-period PV of $41,971mm — only the terminal differs) | EV $76,978mm → Equity $66,555mm → **$31.88/share** | Calc. |

**This runoff terminal is explicitly NOT the base case.** It is the structural-reset **bear input** that feeds `07_scenario-and-fair-value`'s structural-reset bear case and the master synthesizer's Kill Criteria (CLAUDE.md §24) — it sits beside the base-case intrinsic value below, it does not replace it.

## 6. DCF Output

| Step | Value |
|---|---:|
| PV of explicit FCFFs | $41,971mm |
| + PV of terminal value (Gordon, g=4.0%) | $141,479mm |
| **= Enterprise value** | **$183,450mm** |
| − Net debt (strict, `01`'s canonical figure) | $9,340mm |
| − Minority interest | $1,083mm |
| − Preferred | $0mm |
| **= Equity value** | **$173,027mm** |
| ÷ Diluted shares (`01`'s per-share fair-value count) | 2,087.980mm |
| **= Intrinsic value per share (base case)** | **$82.87** |
| vs current price ($68.18, Aug-05-2026 close, pool-verified) | +$14.69 (+21.5%) |

*(Memo — structural-reset runoff terminal, not the base: $31.88/share, −53.3% vs. the base case, feeding `07`'s bear input only.)*

## 7. Sensitivity Grid (per-share intrinsic value)

WACC across columns, terminal growth down rows. Base case = WACC 9.59%, g 4.0%.

| | WACC −1% (8.59%) | WACC (9.59%) | WACC +1% (10.59%) |
|---|---:|---:|---:|
| g +0.5% (4.5%) | $113.60 | $89.89 | $73.99 |
| g (4.0%) | $102.50 | **$82.87** | $69.21 |
| g −0.5% (3.5%) | $93.59 | $77.00 | $65.11 |

No cell in this grid has `WACC − g` within ~1–2pp of zero (the tightest gap, top-right corner, is still 6.09pp), so every cell above is a valid, non-NM number.

**Supplementary grid — financeable-growth cross-check (Gate 2 remedy, g = 2.0%):**

| | WACC −1% (8.59%) | WACC (9.59%) | WACC +1% (10.59%) |
|---|---:|---:|---:|
| g = 2.0% | $74.98 | $64.04 | $55.67 |

This is shown because the mechanical Gate-2 check (§5) implies a "financeable" terminal growth rate far below the base case's 4.0% and the bridge for the gap (asset-light, opex/investing-funded growth) is only partially quantified. A reader should treat $64–$75/share (at WACC≈9.6%) as the more conservative anchor if the market ever re-prices Uber's terminal growth down toward what a narrow, capex-based reinvestment rate can literally finance.

## 8. Intrinsic Read

The DCF's base-case intrinsic value is **$82.87/share** — 21.5% above the $68.18 pool-verified price (Aug-05-2026 close) — but the primary sensitivity grid disperses that point across **$65.11–$113.60** (WACC ±1pp, g ±0.5pp), and the terminal value itself makes up 77% of enterprise value, which is the single most fragile part of this number: this is fundamentally a bet on what Uber's margin and growth look like in 2032 and beyond, not on the next six years of consensus-anchored cash flow (whose PV, $41,971mm, is only 23% of the total). The assumption this value is most sensitive to is the combination of **terminal growth and the durability of the current margin plateau** — the Gate-2 financeable-growth check (§5) implies a far more conservative $64–$75/share range if Uber's real reinvestment needs (capital-light but opex/M&A-funded) turn out to demand a lower sustainable growth rate than the 4.0% base case assumes, and `business-model/09_moat.md`'s "No moat proven" / early-stage-widening verdict means the 16% terminal EBIT margin plateau (versus 12.1% LTM) is itself an unproven assumption, not a settled one. The separately-shown structural-reset runoff terminal ($31.88/share) is the tail the rate-of-change score (35/100) makes non-trivial, though it is a bear input for `07`, not part of this base read.
