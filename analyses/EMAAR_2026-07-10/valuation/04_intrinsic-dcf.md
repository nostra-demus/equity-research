# Intrinsic DCF — EMAR (Emaar Properties PJSC, DFM: EMAAR)

**Reporting standard:** IFRS. **Currency:** AED millions (dirham pegged to USD at 3.6725; USD shown at that peg). **Fiscal year:** ends 31 December. **Method:** FCFF DCF (unlevered free-cash-flow to the firm, discounted to enterprise value, then bridged to equity).

**Business-type gate applied.** The `00` triage classifies Emaar as **Operating with a real-estate / NAV overlay** — ~80% of revenue is build-to-sell property development (operating-company-like; the EV bridge is meaningful), ~15% leasing/retail (malls) and ~5% hospitality (recurring, REIT-like). Per the MODULE_RULES Business-Type Method Map, the triage names **EV/EBITDA, P/E and FCFF DCF as the primary methods, with NAV and SOTP as cross-checks** — so an FCFF DCF is valid here and is what this agent builds. The malls/hospitality NAV and the listed-subsidiary look-through are `06_sum-of-the-parts`'s job, not re-done here. **Cyclicality gate is live** (a Dubai property-cycle developer at a record-2025 peak; consensus long-term growth −14.8%): the base and terminal are normalized off the peak, not extrapolated from it.

**Plain-English glossary (first use):** *FCFF* = free cash flow to the firm — the cash the operations throw off before financing, available to all capital providers; *NOPAT* = operating profit after a normalized tax, before financing; *WACC* = weighted-average cost of capital (the blended return debt and equity holders require — the discount rate); *terminal value (TV)* = the value of all cash flows beyond the explicit forecast; *ROIC* = return on invested capital (profit earned per AED 100 of capital); *mid-year convention* = discounting each year's cash as if it arrives mid-year, since cash flows in through the year, not all on 31 December.

---

## 1. FCF Base & Normalizations

**Base year: FY2025 (audited) with an LTM-to-Mar-2026 cross-check.** FY2025 is a **cyclical peak** — Dubai's strongest year on record — so the base is used only to anchor the *level*; the forecast (§2) normalizes margins, cash tax and the working-capital tailwind down through the cycle. A full cash flow statement exists (annual + LTM), so FCF is **not** proxied — no partial-data FCF cap applies.

| Item | Base-Year Value (LTM Mar-26) | Normalization Applied | Source |
|---|---:|---|---|
| Reported FCF (CFO − PP&E capex) | 30,982 | **Headline — inflated; not used as the base.** | earnings/06 §1; CIQ Cash Flow |
| − Customer-advance build (Δ contract liabilities) | (8,347) | Cyclical working-capital tailwind (off-plan pre-collections outrunning handovers) — reverses when the cycle turns; stripped from the recurring base | earnings/06 §1, §10 |
| − Cash-tax-lag normalization (to accrued 15%) | (~2,494) | Cash tax paid AED 874m vs accrued ~AED 3,368m; the payable is building — normalize to the structural 15% rate | earnings/06 §8; CIQ IS |
| = **Normalized operating FCF (recurring, peak-year)** | **~20,140** | Lead figure (§15) — the recurring cash, not the AED 31bn headline | derived |
| **Normalized FCFF, NOPAT-based (accrued 15% tax)** | **~19,700** | = EBIT 23,521 × (1−0.15) + D&A ~1,680 − capex ~2,000 + non-advance ΔWC ~0 | derived; CIQ IS/CF |
| Memo — FY2025 EBIT / EBIT margin | 22,552 / **45.5%** | **Cyclical PEAK margin** — flattered by cheap legacy-land spread; forecast fades it | CIQ IS |
| Memo — LTM EBITDA (CIQ standardized) | 25,201 | For leverage/multiple context only | ciq_facts `ltm_ebitda_m` |
| Excluded — net finance income (~2,013 FY25) | non-operating | Return ON the cash pile → captured via the net-cash add-back in the §6 bridge (not double-counted in FCFF) | earnings/06 §1 |
| Excluded — securities/term-deposit investing (−7,679 FY25) | treasury | Deploying excess cash into deposits — a financing/treasury choice, not operating capex | CIQ Cash Flow |

**The base is ~AED 19.7–20bn of normalized FCFF at peak-year revenue/margins** — materially below the AED 31bn reported FCF and consistent with earnings/06's finding that reported cash overstates steady-state by ~27%. The forecast normalizes this down through the cycle.

---

## 2. Forecast Assumptions

Explicit horizon **10 years (FY2026–FY2035)** — long enough to model a full Dubai cycle (backlog-conversion up-leg → roll-over → mid-cycle) so the terminal is struck on **normalized, not peak**, cash. Every cell labeled.

| Assumption | Yr1 26 | Yr2 27 | Yr3 28 | Yr4 29 | Yr5 30 | Yr6 31 | Yr7 32 | Yr8 33 | Yr9 34 | Yr10 35 | Terminal | Source / Basis |
|---|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|---|
| Revenue growth % | +7.1 | +13.9 | +5.9 | −6.3 | −13.3 | −11.5 | −4.3 | +4.0 | +4.0 | +4.0 | +1.5 | 26–27 **consensus**; 28 near-consensus; 29–35 **analyst** cycle path |
| Revenue (AED m) | 53,089 | 60,456 | 64,000 | 60,000 | 52,000 | 46,000 | 44,000 | 45,760 | 47,590 | 49,494 | — | ″ |
| EBIT margin % | 43 | 41 | 38 | 36 | 34 | 32 | 31 | 33 | 34 | **35** | **35** | **consensus-derived** GM fade → EBIT (26–28); **analyst** down-cycle 29–35 |
| Tax rate % (NOPAT) | 15 | 15 | 15 | 15 | 15 | 15 | 15 | 15 | 15 | 15 | **15** | **moat canonical anchor** (UAE DMTT/Pillar-Two floor) — §3 reconciles |
| Capex (% revenue) | 4.0 | 4.0 | 4.0 | 4.0 | 4.0 | 4.0 | 4.0 | 4.0 | 4.0 | 4.0 | 4.0 | **analyst** (FY25 PP&E 934 + inv-property 1,015 = 3.9% rev); consensus capex 2.0–2.3bn |
| D&A (% revenue) | 3.1 | 3.1 | 3.1 | 3.1 | 3.1 | 3.1 | 3.1 | 3.1 | 3.1 | 3.1 | 3.1 | **analyst** (FY25 D&A/rev 3.2%) |
| Contract-liab. (advances) % rev | 82 | 80 | 74 | 68 | 62 | 58 | 57 | 57 | 58 | 58 | 58 | **analyst** — revenue-linked WC driver (FY25 40,724/49,557 = 82%) |

**Margin normalization (Cyclicality Gate — three anchors cited).** The terminal/mid-cycle **EBIT margin of 35%** is set *between* documented cycle points, not "below the recent peak":
- **FY2025 peak: 45.5%** [CIQ IS] — rejected as terminal (flattered by the cheap legacy-land spread, which management guides *down*: gross margin 63% FY23 → 55% FY25 → "low 50s" [earnings/03 §3]).
- **Peer-normal (Aldar, the one audited UAE peer): EBIT ~27.2%** [business-model/09 §3] — the terminal keeps a **~+8pp genuine premium** over Aldar, which the moat module confirms is real (brand + Downtown-Dubai location + land bank), but sheds the cyclical half of the current ~18pp gap.
- **Prior-trough (FY2021: EBIT 23.5%; FY2022: 32.3%)** [CIQ IS] — the terminal 35% sits **above** the trough (mid-cycle, not trough); the modeled **down-cycle low of 31% (FY2032)** sits just below FY2022's 32.3%, reflecting the moat module's *eroding* land-spread (a future trough can be worse than the last because the cheap-land buffer is smaller).

**Working capital scales with revenue (revenue-linked driver, not a flat absolute).** Emaar is a **negative-working-capital business** — buyers pre-fund construction, so contract-liability advances (AED 40,724m) exceed trade+unbilled receivables (11,137m) ~3.7x and the cash-conversion cycle is negative on a customer-funded basis [earnings/06 §3]. I model the dominant WC item — customer advances — as a **% of revenue** (the disclosed driver), and take the WC cash effect from the modeled year-on-year change in that balance (§4). The non-advance WC (development inventory build vs receivables/payables release) nets to ~0 through the cycle [earnings/06 §1: FY21–LTM non-advance WC averages ~0] and is folded in.

---

## 3. Discount Rate (WACC)

| Component | Value | Source |
|---|---:|---|
| Risk-free rate | 4.50% | US 10Y ~4.54% (Web: 2026-07-10, indicative/unverified); AED pegged to USD → US 10Y is the AED risk-free proxy |
| Equity-risk premium (UAE, total) | 4.87% | Damodaran 2026 (Web, unverified): mature-market 4.23% + UAE country-risk-premium 0.64% |
| Beta | 1.15 | Analyst — cyclical single-city developer; net cash → asset beta ≈ equity beta (matches business-model/09) |
| **Cost of equity (CAPM)** | **10.10%** | = 4.50% + 1.15 × 4.87% |
| Pre-tax cost of debt | 5.00% | Emaar 2029 sukuk ~5.0% mid (Web, unverified); S&P BBB+ / Moody's Baa1 |
| Tax rate (shield) | 15% | Normalized (§1) — same rate as NOPAT |
| After-tax cost of debt | 4.25% | = 5.00% × (1 − 0.15) |
| Equity / debt weights (market value) | 91.5% / 8.5% | mkt cap 107,818 / total debt 10,064.4 (valuation/01) |
| **WACC — computed** | **9.60%** | formula below |
| **WACC — used (base)** | **10.5%** | override justified below |

**Formula (executed, not eyeballed):**

```
== WACC BLEND ==
ke (CAPM) = 0.0450 + 1.15*0.0487 = 0.1010 (10.10%)
kd after-tax = 0.0500*(1-0.15) = 0.0425 (4.25%)
weights we=0.9146 wd=0.0854 (sum 1.000)
WACC computed = 0.9146*0.1010 + 0.0854*0.0425 = 0.0960 (9.60%)
WACC USED (base) = 10.5%  [computed 9.60%; moat-inferred ~11.4%; grid spans 9.5-11.5%]
```

**Override discipline (computed 9.60% → used 10.5%, +0.9pp, within ±1.5pp).** One-sentence justification: the 8.5% debt weight overstates any leverage benefit for a company holding ~3.5x more cash than debt — for a net-cash business WACC should approximate the **cost of equity (~10.1%)**, not be discounted below it — and a **single-city Dubai property-cycle** equity warrants a premium over the Aa2-sovereign-anchored Damodaran UAE ERP (Dubai's own credit is weaker than Abu Dhabi's). **Gate-4 cross-check:** the moat module (`09_moat.md` §3) independently infers a cost of capital of **~11.4% (range 10–12.5%)** using a higher 6.0% ERP; my 10.5% is within 0.9pp of it (inside the ~2pp tolerance), and the **§7 grid spans 9.5%–11.5%, covering both my computed 9.6% and the moat's 11.4%** — so no single rate is asserted. This WACC and the §1 normalized FCF base are the canonical inputs the reverse-DCF (`05`) inverts.

---

## 4. Free Cash Flow Forecast & Discounting

`FCFF = NOPAT + D&A − capex + WC cash effect`, where the **WC cash effect = +Δ(contract-liability balance)**. Because customer advances are a *liability*, a rise in that balance is a *fall* in net working capital → it **releases cash and ADDS to FCFF**; a fall in the balance absorbs cash and subtracts (i.e. +ΔCL = −ΔNWC). Mid-year convention (discount at t−0.5).

```
== EXPLICIT FCFF (AED m) ==
  Yr     Rev  EBm   EBIT  NOPAT   D&A  Capx     CL    dCL   FCFF    DF     PV
2026   53089  43%  22828  19404  1646  2124  43533   2809  21735 0.951  20677
2027   60456  41%  24787  21069  1874  2418  48365   4832  25357 0.861  21830
2028   64000  38%  24320  20672  1984  2560  47360  -1005  19091 0.779  14874
2029   60000  36%  21600  18360  1860  2400  40800  -6560  11260 0.705   7939
2030   52000  34%  17680  15028  1612  2080  32240  -8560   6000 0.638   3828
2031   46000  32%  14720  12512  1426  1840  26680  -5560   6538 0.577   3775
2032   44000  31%  13640  11594  1364  1760  25080  -1600   9598 0.523   5016
2033   45760  33%  15101  12836  1419  1830  26083   1003  13427 0.473   6350
2034   47590  34%  16181  13754  1475  1904  27602   1519  14844 0.428   6353
2035   49494  35%  17323  14724  1534  1980  28707   1104  15383 0.387   5958
Sum PV of explicit FCFF (mid-year) = 96,600
```

**Sum of PV of explicit FCFs: AED 96,600m.**

**Working-capital sign — checked against the modeled ΔCL, not assumed.** While the advance ratio is held (~80–82%, FY2026–27) and revenue grows, the contract-liability balance *rises* (+2,809, +4,832) → this negative-WC business **releases cash → ADDS to FCFF** (as required for a negative-WC book). Once the ratio mean-reverts down *and* revenue rolls over (FY2028–2032), the balance *falls* (−1,005 → −8,560) → it **absorbs cash → SUBTRACTS from FCFF** — the advance-reversal earnings/06 §10 flagged. Net over the decade the balance falls AED 40,724 → 28,707 = **−12,017 (a net cash USE of ~AED 12bn)**, so the WC tailwind is not extrapolated — it reverses net through the cycle. Sanity check passes: revenue *growing* in FY2026–27 with the ratio held → WC *adds* (correct sign for a negative-WC business); revenue *falling* with the ratio reverting → WC *cuts* (correct).

---

## 5. Terminal Value

**Method — Gordon growth, struck at ROIC ≈ WACC (no perpetual excess return).** Formula (written out): `TV = FCFF_{n+1} / (WACC − g)`, with `FCFF_{n+1} = NOPAT_terminal × (1+g) × (1 − g/ROIC)`. Setting terminal **ROIC = 9.5%** honors the moat module's economic test — **through-cycle ROIC ~7.5–9.5%, at or below the ~10.5–11.4% WACC**; Emaar clears its cost of capital only at the cyclical peak [business-model/09 §3]. The terminal therefore carries **no durable excess return**, and TV collapses to ≈ NOPAT/WACC.

```
== TERMINAL (BASE: ROIC 9.5% < WACC 10.5%, g 1.5%) ==
NOPAT_2035=14,724 EBITDA_2035=18,857 reinv=15.8%
FCFF_2036=12,586  TV=139,839  (= NOPAT/WACC check 140,233)
implied exit EV/EBITDA=7.4x (on NORMALIZED EBITDA; market 4.0x on PEAK EBITDA; Aldar 8.3x)
PV_TV=54,161  TV%EV=36%   EV=150,761
```

- Terminal g (base) = **1.5% nominal** — below UAE long-run nominal GDP (~4–5%) and below the ~2% inflation-plus-real proxy; because ROIC ≈ WACC, **g barely moves TV** (see §7), so the value is driven by WACC and the mid-cycle margin, not by g. `WACC − g` = 9.0pp, comfortably positive.
- **Terminal value (undiscounted): AED 139,839m.** **PV of TV: AED 54,161m.**
- **Terminal value as % of total EV: 36%** — well under the 75% terminal-dominance flag. The value sits mostly in the *visible* explicit cash flows, a point of strength for confidence.
- **Exit-multiple cross-check:** the Gordon TV implies **7.4x EV/EBITDA on normalized (mid-cycle) EBITDA** — sane for a mature developer earning its cost of capital (Aldar trades 8.3x), but note the market today applies only **4.0x on PEAK EBITDA**. The gap (4.0x → 7.4x) is the **value-trap question** (§7): if the government-owner discount is structural, the multiple need not re-rate.

**Structural-decline / runoff terminal (bear input — eroding-moat trigger fired, `CLAUDE.md` §24 Filter 5 lens).** The moat module returns a **Narrow moat with an *eroding* economic trajectory** (land-spread narrowing, new 15% tax, competition rising at the peak, consensus −14.8% LT growth) and explicitly hands this DCF the "peak-return / declining-perpetuity treatment" — so alongside the Gordon base I build a **runoff terminal**: **g = 0% nominal (≈ −2% real, below UAE ~2% inflation), terminal EBIT margin faded to 28%** (toward Aldar's 27% plus a thin residual premium), exit ~6.7x. This yields TV ~AED 103bn and a per-share of **~AED 17.6 (book NCI)**, or **~AED 15.0** combining the runoff terminal with the economic-minority deduction and a 5.0x exit. *(Note: the industry rate-of-change score is 72/100 — well above 40 — so §24 Filter 5's disruption trigger does NOT fire; this runoff is driven by the eroding **economic** moat and cyclicality, not by technology disruption.)* **This runoff is the structural-impairment scenario that feeds `07`'s structural-reset bear — it does not replace the base.**

---

## 6. DCF Output

Bridge uses valuation/01's anchors verbatim (broad/canonical net cash; book NCI). FCFF is the full consolidated operating cash flow, so associates (equity-method income is excluded from EBIT) are **added** and the minority claim is **deducted**.

| Step | Value (AED m) | Per share (AED) |
|---|---:|---:|
| PV of explicit FCFs | 96,600 | 10.93 |
| + PV of terminal value | 54,161 | 6.13 |
| **= Enterprise value (DCF)** | **150,761** | 17.06 |
| + Net cash (broad, canonical — valuation/01) | 24,969 | 2.82 |
| + Equity-method investments (associates/JVs) | 7,529 | 0.85 |
| − Minority interest (book NCI — valuation/01) | (13,808) | (1.56) |
| − Preferred | 0 | 0 |
| **= Equity value** | **169,451** | |
| ÷ Diluted shares (8,838.789849m) | | |
| **= Intrinsic value per share (base, book-NCI bridge)** | | **AED 19.2** |
| **Intrinsic per share (economic-minority basis, NCI at ~21% of EV)** | 151,589 | **AED 17.2** |
| **Central base-case intrinsic (midpoint of the two minority treatments)** | | **≈ AED 18** |
| vs current price | | **AED 12.20** (US$3.32, 2026-06-28) |
| Memo: consensus mean target | | AED 17.07 |
| Memo: book value / share | | AED 10.16 |

**Minority-interest judgment (material — flagged).** Minorities take **~21% of group earnings** (mostly the listed Emaar Development), but book NCI (AED 13,808m) is only ~8% of the DCF EV. Because FCFF here is 100% of the consolidated operating cash, deducting the minority at its **~21% economic earnings share (AED ~31,660m)** is the more conservative owner read and lowers the base to **AED 17.2**; book NCI (01-consistent) gives AED 19.2. The truth sits between — hence the central **~AED 18**. This tension is properly resolved in `06_sum-of-the-parts`.

**The single most important observation:** the market EV (broad AED 96,657m) ≈ the **PV of my explicit 10-year FCFF alone (AED 96,600m)**. The market is paying for the visible forecast cash and assigning **~zero to the post-2035 business** (explicit-only per-share ≈ AED 13.0 book / 12.3 economic — right at the price). The intrinsic-above-price is the terminal + balance sheet the market is not underwriting — consistent with the **government-owner value-trap discount (RF-OWN-004)** the triage carried in, and with cyclical-peak fear.

---

## 7. Sensitivity Grid (per-share intrinsic value, AED)

**Grid 1 — required WACC × terminal-g (book-NCI bridge):**

| | WACC 9.5% | WACC 10.5% | WACC 11.5% |
|---|---:|---:|---:|
| g +0.5% (2.0%) | 20.95 | 19.16 | 17.73 |
| g (1.5%) | 20.92 | **19.17** | 17.77 |
| g −0.5% (1.0%) | 20.88 | 19.18 | 17.81 |

The grid is **almost flat down the g-axis** — this is the honest signal that, with terminal ROIC ≈ WACC, **terminal growth adds no value**. The live dispersion is WACC (columns) and, more importantly, the mid-cycle margin (Grid 2). No cell is near `WACC − g ≤ 0`, so none is NM.

**Grid 2 — WACC × mid-cycle EBIT margin (the dominant driver; shifts the whole margin path, book-NCI bridge):**

| Terminal EBIT margin | WACC 9.5% | WACC 10.5% | WACC 11.5% |
|---|---:|---:|---:|
| 37% | 22.02 | 20.17 | 18.69 |
| **35% (base)** | 20.92 | **19.17** | 17.77 |
| 33% | 19.81 | 18.17 | 16.85 |
| 31% | 18.71 | 17.17 | 15.94 |

**Grid 3 — value-trap cross-check (terminal exit multiple on normalized EBITDA, book-NCI bridge):** a persistent depressed multiple, not a Gordon re-rating.

| Terminal EV/EBITDA | Per share (book NCI) | Per share (economic NCI 21%) |
|---|---:|---:|
| 4.0x (today's market, on normalized EBITDA) | 16.35 | 14.92 |
| 5.0x | 17.18 | 15.57 |
| 6.0x | 18.00 | 16.23 |
| 7.4x (Gordon base) | 19.16 | 17.14 |

Across all three grids plus the runoff terminal, the per-share dispersion is **~AED 15–22 (book NCI) / ~AED 13–17 (economic NCI)**, centered ~AED 17–19. Even the **explicit-only floor (zero terminal) is ~AED 13.0**, at/above the price — so the DCF's undervaluation signal does not depend on the terminal.

**Financeable-growth cross-check (Gate 2 — passes).** Terminal reinvestment is set = `g / ROIC` = 1.5% / 9.5% = **15.8% of NOPAT**, so implied growth = ROIC × reinvestment = 9.5% × 15.8% = **1.5% = modeled g** — locked and financeable. (Emaar's *recent* very-low reinvestment — capital-light, negative-WC — would finance only ~0% growth if extrapolated; the terminal deliberately charges the higher, sustainable reinvestment needed to keep buying land at market prices, which is why terminal FCFF steps below the flattered recent level.)

---

## 8. Intrinsic Read

**Base-case intrinsic value ≈ AED 18/share** (AED 19.2 on valuation/01's book-minority bridge; AED 17.2 deducting minorities at their ~21% economic earnings share) — with the sensitivity grid dispersing that point over **~AED 15–22** (WACC 9.5–11.5% and mid-cycle EBIT margin 31–37%), and a **structural-decline / value-trap floor near AED 13–15** (runoff terminal, or the market's depressed 4.0x multiple persisting). Even the zero-terminal floor (~AED 13) sits at the AED 12.20 price, so on discounted cash flows Emaar screens ~30–50% below intrinsic — a read the AED 17.07 Street consensus target independently brackets. The single assumption that decides the answer is the **normalized mid-cycle development margin** (±2pp EBIT ≈ ±AED 1/share, and it drives whether the down-cycle is as shallow as modeled), followed by whether the market's low multiple is cyclical fear (re-rates) or the structural **government-owner value-trap discount (RF-OWN-004)** that keeps a cash-rich, minority-leaky, single-city-cyclical developer perennially below its cash value — the reason the gap to price is left for `07`/`99` to adjudicate, not closed here.

---

### Self-check
- **Business-type gate applied** — FCFF DCF is the triage-designated primary method for an Operating+real-estate-overlay issuer; NAV/SOTP left to `06`; EV bridge not forced onto a pure REIT.
- **FCF base year stated (FY2025 peak + LTM) and normalizations itemized** (advance build, cash-tax lag, finance income, securities treasury).
- **Every forecast cell labeled** company-guided/consensus/analyst.
- **WACC** — all components sourced (rf, ERP, cost of debt web-labeled unverified); override shown both figures (9.6% computed / 10.5% used), justified, within ±1.5pp; Gate-4 cross-check vs moat's ~11.4% and grid spans both.
- **Terminal value disclosed as 36% of EV** (< 75%); exit-multiple cross-check shown; runoff/declining-perpetuity terminal built as the `07` bear input.
- **Cyclicality gate** — terminal margin 35% benchmarked against peer-normal (Aldar 27.2%), prior-trough (FY2021 23.5% / FY2022 32.3%) AND the FY2025 peak (45.5%), each cited.
- **WC forecast from a revenue-linked driver** (contract-liability % of revenue), not a flat absolute; **sign read off the modeled ΔCL** — advance build ADDS (FY26–27), advance reversal SUBTRACTS (FY28–32); net cycle = −12bn cash use; sanity-checked for a negative-WC business.
- **Financeable-growth cross-check run** (Gate 2) — terminal reinvestment = g/ROIC, implied g = modeled g = 1.5%, locked.
- **EV→equity→per-share bridge uses 01's net cash and share count**; economic-minority sensitivity shown.
- **Mid-year convention** stated (t−0.5), applied to explicit flows and TV.
- **Grid populated**; per-share dispersion range given; output leads with a single base point + dispersion.
- **WACC blend, PV sum, TV, and bridge all computed by executed snippets** (shown) — not mental arithmetic.
- Confidence: **Medium** — full cash-flow base and near-term consensus present (no partial-data cap), but out-year forecast is analyst-built for a deeply cyclical single-city developer at a peak, and the government-owner value-trap discount is unmodeled here; the RF-OWN-004 valuation-attractiveness cap (max 60) is applied downstream by `03`/`07`/`99`.
- No banned phrases.
