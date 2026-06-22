# Intrinsic DCF — NIVABUPA

**Company:** Niva Bupa Health Insurance Company Limited (NSEI:NIVABUPA / BSE:544286)
**Reporting standard:** India GAAP (IRDAI insurance template); IFRS voluntarily maintained and used as primary management metric. All equity-base figures from Capital IQ vendor export (§4 tier 5), described as restated from IRDAI/Companies Act statutory filings.
**Reporting currency:** INR (Indian Rupees). Figures in INR Millions unless stated otherwise. 1 crore = 10 million.
**Fiscal year end:** 31 March. FY26 = April 2025 – March 2026.
**Analysis date:** 2026-06-22.

---

## Business-Type Gate: Financial Issuer — FCFF DCF Not Applicable

Per the MODULE_RULES.md Business-Type Method Map, Niva Bupa is an **IRDAI-regulated health insurer — a Financial issuer**. The map is unambiguous:

> "Financial (bank / insurer) → do NOT build an FCFF DCF or an EV bridge. Build an equity-direct model — Dividend Discount Model or residual-income / excess-return-on-equity — discounted at the cost of equity."

This report therefore does **not** build an FCFF DCF, does not compute a WACC, and does not use an EV bridge for valuation. The method used is a **Residual Income (Excess-Return on Equity)** model, also called the Edwards-Bell-Ohlson framework, discounted at the cost of equity (Ke). Sections below are relabelled accordingly.

The EV bridge from `01_price-and-capital-structure.md` is informational only (INR 157,221 mn / INR 15,722 crores) and is not the valuation output.

---

## 1. Earnings Base & Normalizations

The RI model uses PAT (profit after tax) and book equity as inputs — not FCFF or CFO. For an insurer, the economic earning power is PAT, and the economic book value is net worth (equity).

| Item | FY26 Value | Normalization Applied | Source |
|---|---:|---|---|
| PAT (India GAAP reported) | INR 3,661 mn | None required — IGAAP PAT = IFRS PAT for FY26 (INR 3,660 mn vs INR 3,661 mn); negligible rounding | Capital IQ Financials.xls Income Statement FY26; Q4 FY26 Earnings Call May 8 2026 p.5 |
| PAT (IFRS, management-disclosed) | INR 3,660 mn (₹366 crores) | Same as above | Q4 FY26 Earnings Call May 8 2026 p.5 (CEO: "profit after tax on an Ind AS basis was INR 366 crores") |
| FY25 PAT (IFRS) | INR 2,030 mn (₹203 crores) | No normalization — full-year IGAAP/IFRS aligned at annual level | Q4 FY25 Earnings Call May 7 2025 p.4 |
| FY26 ROE (Ind AS, management-disclosed) | 10.7% | No normalization required; no non-deductible FVTPL losses (investment book is ~100% debt instruments); no fair-value distortion applicable | Q4 FY26 Earnings Call May 8 2026 p.5; moat module §3 confirms no FVTPL distortion |
| Book equity FY26 (period-end) | INR 35,824.4 mn | None | Capital IQ Balance Sheet FY26; confirmed in 01_price-and-capital-structure.md §6 |
| FY26 effective tax rate | Not separately disclosed in available data; standard Indian corporate rate ~25.17% (analyst assumption — no one-off distortions identified) | No normalization needed; no non-deductible items flagged | Capital IQ export; Q4 FY26 call; moat module §3 states "no structural-rate normalization is required" |

**Base year:** FY26 (ending March 31, 2026). PAT of INR 3,661 mn and book equity of INR 35,824.4 mn are the anchors.

**Two items NOT used as base:**
- FY25 CFO of INR 16,753 mn (materially inflated by a one-time 1/N accounting reserve build-up — not a recurring cash flow; earnings-quality module §10 confirms). Not relevant to this RI model regardless.
- Capital IQ normalized EPS of INR 0.71/share (FY26): the ₹1.27 gap from reported EPS of ₹1.98 is not fully transparent and the full-year IGAAP PAT of INR 3,661 mn ties to audited-equivalent figures. The full-year PAT is used, not the Capital IQ normalized per-share figure.

---

## 2. Forecast Assumptions

### 2a. Model Logic

The Residual Income model defines:
- **Earnings_t = ROE_t × BV_(t−1)**
- **Residual Income_t = (ROE_t − Ke) × BV_(t−1)** (excess earnings above the cost of equity — the "excess return on equity")
- **BV_t = BV_(t−1) + Earnings_t − Dividends_t**
- **Equity Value = BV_0 + PV(all future Residual Incomes)**

Payout ratio is zero throughout the explicit horizon (no dividend history; IPO November 2024; insurer is reinvesting for growth — solvency capital grows with the premium book). Under the clean-surplus assumption, dividends do not affect intrinsic value in this framework; they affect only the BV path, not the sum of PV(RI).

### 2b. ROE Forecast Path

The single most important driver of intrinsic value is the ROE path relative to the cost of equity. Every row below is the basis for the excess-return calculation.

| Assumption | FY27 | FY28 | FY29 | FY30 | FY31 | FY32 | FY33 | FY34 | FY35 | FY36 | Terminal | Source / Basis |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| ROE % | 11.5% | 12.5% | 13.5% | 14.5% | 14.1% | 13.7% | 13.3% | 13.0% | 12.8% | 12.8% | Ke (~12.87%) | Analyst assumption (see rationale below); terminal anchored to "No moat proven" verdict |
| PAT / Ke used | 12.87% | 12.87% | 12.87% | 12.87% | 12.87% | 12.87% | 12.87% | 12.87% | 12.87% | 12.87% | 12.87% | Ke = 12.87% (see §3) |
| Excess ROE (ROE – Ke) | −1.37% | −0.37% | +0.63% | +1.63% | +1.23% | +0.83% | +0.43% | +0.13% | −0.07% | −0.07% | 0% | Derived |

**ROE ramp rationale (all labeled):**

- **FY27 ROE 11.5%:** *Analyst assumption.* Management guided EOM ratio declining ~200–250 bps per year [Q4 FY26 call, CFO, May 8 2026] and combined ratio improving toward 99% by FY29. At 11.5%, ROE improves modestly above FY26's 10.7% — conservative, as FY27 marks the first full year of IFRS 17 transition (effective April 2026), which may create comparability headwinds.

- **FY28 ROE 12.5%:** *Analyst assumption.* Continued EOM improvement; loss ratio roughly stable per company trajectory; IFRS 17 base effects absorbed.

- **FY29 ROE 13.5%:** *Analyst assumption directionally anchored to management guidance.* CFO guided combined ratio approaching ~99% by FY29 [Q4 FY26 call, p.7]. A 99% COR with 7.2% investment yield on growing AUM is consistent with mid-teens ROE per management: "close to 11% currently, and [99% combined ratio] will translate to mid- to high-teens ROE" [Q4 FY26 call, CFO, p.7]. 13.5% is a conservative interpretation of "mid-teens."

- **FY30 ROE 14.5%:** *Analyst assumption.* "Mid-teens" ROE achieved — conservative end of management's directional range.

- **FY31–FY36 ROE fade (14.1% → 12.8%):** *Analyst assumption (fade schedule).* Once operational leverage matures, the company has no proven moat to sustain perpetual excess returns above Ke. The moat module returned a "No moat proven" verdict [09_moat.md §5], which requires the terminal ROE to converge to Ke. The fade over 6 years reflects the time needed for competitive dynamics to erode any temporary scale advantage.

- **Terminal ROE = Ke (~12.87%):** *Anchored to MODULE_RULES moat verdict.* "No moat proven" means the DCF must carry no perpetual excess return: terminal RI = 0. This is a fade, not a collapse — the franchise continues operating but earns exactly its cost of capital in perpetuity, generating zero additional equity value beyond the terminal book value.

### 2c. GWP Growth (Context — not a direct input to RI, but drives BV accumulation pace)

GWP growth is the engine that expands the book equity as retained earnings accumulate. Management guided 17–19% industry CAGR on a 5-year view [Q4 FY26 call, p.8]; Niva Bupa has historically grown ~5–10 ppts above the industry (market share gaining). The ROE schedule above implicitly assumes the company continues to grow its GWP at rates sufficient to generate the PAT levels shown — consistent with 20–25% GWP growth in FY27–FY30, decelerating toward industry rates as the company matures. This is not independently modeled as a separate line item — it manifests through the ROE × BV path.

---

## 3. Cost of Equity (Ke)

There is no WACC for a financial issuer. The discount rate is the **cost of equity** applied to equity cash flows (residual incomes and book equity).

| Component | Value | Source |
|---|---:|---|
| Risk-free rate (India 10-year G-sec) | 6.85% | Web: tradingeconomics.com, India 10-year G-sec yield June 19 2026 — 6.85%; unverified, labelled web-sourced |
| Equity risk premium (India total ERP) | 7.08% | Damodaran ctryprem.html, January 2026 data (US base ERP 4.23% + India country risk premium 2.85%); web-sourced, unverified |
| Beta | 0.85 | Inference, not from filings — IPO November 2024, <18 months listed; limited traded beta history; moat module §3 used this same figure for the ROE vs Ke comparison; consistent with a listed Indian health insurer at growth stage |
| **Cost of equity (Ke = rf + β × ERP)** | **12.87%** | Calculated: 6.85% + 0.85 × 7.08% = 12.87% |

**No override applied.** The CAPM-computed Ke of 12.87% is used without adjustment. It is consistent with the moat module's cost-of-equity estimate of ~12.5% (moat §3: "Cost of equity ≈ 7.0% + 0.85 × 6.5% ≈ 12.5%"), noting the moat module used 7.0% risk-free (web-indicative, mid-2026) and 6.5% ERP versus this report's more current 6.85% G-sec and 7.08% Damodaran ERP. The two estimates diverge by approximately 37 bps — well within the ~2pp tolerance before requiring a dual-grid. This report's 12.87% is the more precisely sourced figure and is used as the canonical Ke; the moat module's 12.5% provides directional corroboration.

**WACC sanity bounds (adapted for equity-only model):** India nominal long-run GDP growth is approximately 7% — this forms the ceiling for a sustainable terminal growth rate and is used in the sensitivity grid for scenarios with persistent excess returns.

---

## 4. Residual Income Forecast & Discounting

**Convention:** Mid-year discounting (FY27 RI arrives at t=0.5, FY28 at t=1.5, …, FY36 at t=9.5). This is the default convention per MODULE_RULES §8. Each year's residual income is the excess return earned on the opening book equity for that year.

**Code executed:**

```
python3 — NIVABUPA RI model (executed above; full output shown)

BV FY26 base: INR 35,824 mn, Ke = 12.87%

Year     BV_start   ROE%      PAT  Excess%  Excess RI     BV_end
FY27       35,824   11.5%    4,120    -1.37%       -490     39,944
FY28       39,944   12.5%    4,993    -0.37%       -147     44,937
FY29       44,937   13.5%    6,067     0.63%        284     51,004
FY30       51,004   14.5%    7,396     1.63%        832     58,399
FY31       58,399   14.1%    8,234     1.23%        719     66,634
FY32       66,634   13.7%    9,129     0.83%        554     75,762
FY33       75,762   13.3%   10,076     0.43%        327     85,839
FY34       85,839   13.0%   11,159     0.13%        113     96,998
FY35       96,998   12.8%   12,416    -0.07%        -66    109,414
FY36      109,414   12.8%   14,005    -0.07%        -74    123,419

PV of explicit RIs (mid-year convention):
FY27: RI=-490, DF(t=0.5)=0.9413, PV=-461
FY28: RI=-147, DF(t=1.5)=0.8340, PV=-123
FY29: RI=+284, DF(t=2.5)=0.7389, PV=+210
FY30: RI=+832, DF(t=3.5)=0.6546, PV=+545
FY31: RI=+719, DF(t=4.5)=0.5800, PV=+417
FY32: RI=+554, DF(t=5.5)=0.5139, PV=+285
FY33: RI=+327, DF(t=6.5)=0.4553, PV=+149
FY34: RI=+113, DF(t=7.5)=0.4034, PV=+46
FY35: RI=-66,  DF(t=8.5)=0.3574, PV=-24
FY36: RI=-74,  DF(t=9.5)=0.3166, PV=-24

Sum PV of explicit RI: INR 1,021 mn
```

**Sign interpretation:** FY27–FY28 show **negative** residual income because ROE (11.5–12.5%) is still below Ke (12.87%) — the company has not yet earned its cost of equity. FY29–FY34 show positive residual income as ROE exceeds Ke (management-guided improvement to mid-teens). FY35–FY36 turn modestly negative again as the fade brings ROE back below Ke toward convergence. The total explicit PV(RI) of INR +1,021 mn reflects the net of these: a small positive from the peak excess-return years is partially offset by the transition years before and after peak.

**Structural observation:** The dominant driver of intrinsic value in this model is the **starting book equity of INR 35,824 mn** — not the excess return stream. The company earns only a modest, short-lived excess return even in the bull case because (a) the "no moat" verdict anchors terminal RI to zero and (b) the company currently earns below its cost of equity. This is the mathematical expression of a business trading at a premium to book without a proven economic moat.

---

## 5. Terminal Value

**Method:** Residual Income with terminal ROE converging to Ke.

- **Terminal ROE = Ke (~12.87%):** Mandated by the "No moat proven" verdict from `09_moat.md §5`. A terminal ROE equal to Ke means terminal RI = 0, which means the continuing value of excess earnings is zero. The franchise survives and grows, but it earns no more than its cost of capital in perpetuity — a fair description of an unproven-moat franchise.

- **Terminal continuing value (base case): INR 0 mn.** The explicit 10-year forecast runs ROE through its fade phase to approximately Ke by FY35–FY36. The continuing value beyond FY36 is zero because terminal RI = 0.

- **Terminal value as % of equity value:** In the RI framework, "terminal value" does not map cleanly to the FCFF DCF concept. The BV at FY36 (INR 123,419 mn) already represents the compounded retained earnings — and since it earns exactly Ke in perpetuity, it is worth exactly book value (P/B = 1.0 at terminal). The entire terminal book value is captured through the clean-surplus identity: Equity Value = BV_0 + PV(RI), where BV_0 anchors the value. The percentage of total equity value from the initial book equity anchor is: 35,824 / 36,845 = **97.2%** — nearly all of the intrinsic equity value is the current book equity, not future excess returns. This is the quantitative signal that the stock's intrinsic worth is tightly bounded by its book value.

- **Structural decline / runoff trigger (CLAUDE.md §24 Filter 5):** Business-quality module scores rate-of-change / disruption at 55 [07_business-quality.md §1] — above the ≤40 threshold that would trigger a declining-perpetuity terminal. No declining-perpetuity terminal is required. The "no moat proven" classification already ensures no excess terminal return, which is the correct (fade, not collapse) treatment for this case.

---

## 6. Equity Value Bridge

```
=== BASE CASE EQUITY VALUE (Python output) ===
BV FY26 (anchor):                     35,824.4 mn
+ PV of explicit RI (FY27-FY36):       1,020.6 mn
+ Terminal RI CV:                           0.0 mn  (ROE→ke; no moat)
= Total equity value:                  36,845.0 mn
  = INR 3,685 crores

Shares: 1,847.757 mn (Capital IQ Key Stats; 01_price-and-capital-structure.md anchor)
Intrinsic value per share (BASE):  INR 19.94
Current price:                     INR 84.03
Price premium over intrinsic:      +321.4%
```

| Step | Value |
|---|---:|
| BV FY26 (opening anchor) | INR 35,824.4 mn |
| + PV of explicit RIs (FY27–FY36, mid-year) | INR 1,020.6 mn |
| + Terminal RI continuing value | INR 0 mn |
| **= Intrinsic equity value** | **INR 36,845.0 mn (₹3,685 crores)** |
| ÷ Diluted shares | 1,847.757 mn |
| **= Intrinsic value per share (BASE)** | **INR 19.94** |
| Current price (Capital IQ Key Stats, pool-verified) | INR 84.03 |
| Price as premium to base intrinsic | +321% |

**Net debt bridge note:** The RI model values equity directly; no EV → equity bridge is needed or appropriate. The strict net debt of INR 1,954 mn (subordinated NCDs + lease liabilities − operating cash) has already been excluded from the equity valuation base — it sits outside the equity book and does not enter the RI calculation.

**Minority interest / preferred:** Nil [01_price-and-capital-structure.md §4]. No adjustment needed.

---

## 7. Sensitivity Grid (per-share intrinsic value, INR)

**Rows:** Terminal ROE scenario (how much ROE exceeds or misses Ke in perpetuity)
**Cols:** Cost of equity (Ke) shift from base of 12.87%

```python
=== SENSITIVITY GRID OUTPUT (executed above) ===

                       ke=11.9%   ke=12.9%   ke=13.9%
Term ROE = 0.97×ke       21.9       19.9       18.1   (bear — terminal ROE below Ke)
Term ROE = 1.00×ke       21.9       19.9       18.1   (base — no excess at terminal)
Term ROE = 1.03×ke       23.5       21.3       19.3   (bull — small persistent excess return)
```

| Terminal ROE | Ke = 11.9% (−1pp) | Ke = 12.87% (base) | Ke = 13.9% (+1pp) |
|---|---:|---:|---:|
| 0.97× Ke (bear: mild terminal underperformance) | INR 21.9 | INR 19.9 | INR 18.1 |
| 1.00× Ke (base: ROE = Ke; no excess) | INR 21.9 | INR 19.9 | INR 18.1 |
| 1.03× Ke (bull: small perpetual excess, requires moat evidence) | INR 23.5 | INR 21.3 | INR 19.3 |

**Grid observation:** The dispersion across the entire 9-cell grid is INR 18.1 to INR 23.5 per share — a spread of INR 5.4. The current price of INR 84.03 sits **more than 3× above every scenario in the grid.** The intrinsic value range of INR 18.1–23.5 is insensitive to the key assumptions because the model is driven primarily by the starting book value (INR 35,824 mn / INR 19.39 per share), not by future excess returns. Even the most optimistic scenario (Ke −1pp, terminal ROE = 1.03×Ke with a small persistent excess) yields only INR 23.5/share.

---

## 8. Bull / Base / Bear Scenario Summary

```
=== BULL / BASE / BEAR (Python output) ===
Bull: INR 25.7/share  (ke=11.9%, peak ROE 15.5%, terminal ROE 1.03×ke)
Base: INR 19.9/share  (ke=12.87%, peak ROE 14.5%, terminal ROE=ke → no excess)
Bear: INR 15.4/share  (ke=13.9%, ROE peaks 12%, never exceeds ke)
Price: INR 84.03/share
```

| Scenario | Key Assumptions | Intrinsic Value/Share |
|---|---|---:|
| Bull | Ke −1pp (11.9%), ROE reaches 15.5% by FY30, small persistent excess return (1.03× Ke) in terminal | INR 25.7 |
| **Base** | Ke 12.87%, ROE reaches 14.5% by FY30 (management-guided directional), terminal ROE = Ke | **INR 19.9** |
| Bear | Ke +1pp (13.9%), ROE reaches only 12.0%, never exceeds Ke; muted operating leverage execution | INR 15.4 |

---

## 9. Intrinsic Read

The base-case intrinsic value is **INR 19.94 per share** — barely above the current book value of INR 19.39 per share. The sensitivity grid dispersion of INR 15.4–25.7 sits entirely below the current price of INR 84.03. At the current price, Niva Bupa trades at 4.33× book value, embedding a very large premium for future excess returns — but the RI model finds that excess returns are modest, short-lived (peaking in FY30 and then fading back to the cost of equity by FY35–FY36), and entirely contingent on achieving the management-guided 99% combined ratio by FY29 under conditions where the moat module has returned a "No moat proven" verdict. The single assumption the model is most sensitive to is **whether the company can sustain a ROE materially above its cost of equity (~12.9%) beyond FY30**: if competitive dynamics, regulatory resets (IRDAI commission cap), or slower-than-guided EOM improvement prevent that, the intrinsic value does not exceed INR 20. The current market price of INR 84.03 would only make sense in a DCF sense if the company achieves and sustains very high ROEs (well above 20%) for many years — a level it has never demonstrated and which no evidence in the available data supports.

**Partial data notice:** The primary audited Annual Report (IRDAI statutory filing / SEBI LODR) is absent from the data pool. All financial inputs are from Capital IQ vendor export (§4 tier 5) and earnings call transcripts (Claim Level 3). This caps **intrinsic confidence to Medium** — the model inputs are reliable at the annual level (IGAAP PAT and book equity are internally consistent), but individual line items (tax rate paid, exact ROE denominator, options/RSU dilution) cannot be verified against primary filings. The directional conclusion — that intrinsic value is far below the current price — is robust to a wide range of assumptions (the entire 9-cell grid confirms it).

---

## Self-Check

- [x] Business-type gate applied — Financial issuer (health insurer); no FCFF DCF or EV bridge used as valuation output; residual income / excess-return model applied per MODULE_RULES Business-Type Map.
- [x] Earnings base (PAT FY26 INR 3,661 mn; BV FY26 INR 35,824 mn) stated and normalizations itemized — none material required.
- [x] Every forecast assumption labeled analyst assumption / company-guided directional / moat-verdict anchored.
- [x] Cost of equity components shown with sources; risk-free rate and ERP are web-sourced and labeled. No WACC computed (financial issuer). Ke cross-checked against moat module's own Ke estimate (~12.5% vs 12.87% — 37 bps, well within 2pp tolerance).
- [x] Terminal value: ROE converging to Ke by design (no moat proven); terminal RI = 0; terminal value as proportion of equity value discussed.
- [x] Structural decline trigger checked: disruption score 55 > 40 threshold; no declining-perpetuity terminal required. "No moat" already imposes zero terminal excess return.
- [x] EV bridge not used for equity valuation (financial issuer); equity is valued directly. Net debt and share count from 01 anchor used in the per-share bridge.
- [x] Discounting convention: mid-year (t−0.5 default). FY27 at t=0.5, FY36 at t=9.5.
- [x] Sensitivity grid populated; 9-cell grid shows INR 18.1–23.5 dispersion — all far below current price.
- [x] Output leads with base-case intrinsic (INR 19.94/share); sensitivity grid is the dispersion exhibit.
- [x] Computations executed via Bash/Python snippet; raw output shown in §4 and §6.
- [x] No banned phrases.
- [x] Working capital / DSO-DIO-DPO: Not applicable to a health insurer (premiums collected before coverage; no trade receivables in standard sense). Noted and documented in earnings-quality module §3.
- [x] Financeable-growth cross-check: not applicable in RI model (the "reinvestment" is automatic via retained earnings growing BV; growth = ROE × retention rate, which is fully embedded in the BV path).

---

*Sources used:*
- Capital IQ Financials.xls (NSEI:NIVABUPA), FY2026 ("Latest Filings" restatement), vendor tier §4 tier 5.
- Capital IQ EstimatesReport.xls (NSEI:NIVABUPA), data as of 2026-05-11, vendor tier §4 tier 5.
- Q4 FY26 Earnings Call transcript, May 8 2026 (S&P Global Market Intelligence).
- Q3 FY26 Earnings Call transcript, January 29 2026 (S&P Global Market Intelligence).
- Q4 FY25 Earnings Call transcript, May 7 2025 (S&P Global Market Intelligence).
- `analyses/NIVABUPA_2026-06-22/valuation/01_price-and-capital-structure.md` — price, shares, net debt anchor.
- `analyses/NIVABUPA_2026-06-22/business-model/09_moat.md` — moat verdict, Ke cross-check, ROE history.
- `analyses/NIVABUPA_2026-06-22/business-model/07_business-quality.md` — disruption/rate-of-change score.
- `analyses/NIVABUPA_2026-06-22/earnings/01_historical-financials.md` — PAT, BV, FCF base.
- `analyses/NIVABUPA_2026-06-22/earnings/03_margin-drivers.md` — combined ratio, EOM path.
- `analyses/NIVABUPA_2026-06-22/earnings/04_guidance-consensus.md` — management targets (ROE, combined ratio).
- `analyses/NIVABUPA_2026-06-22/earnings/06_earnings-quality.md` — normalization items.
- `analyses/NIVABUPA_2026-06-22/earnings/07_earnings-sensitivity.md` — variable ranges.
- Web: tradingeconomics.com, India 10-year G-sec yield June 19 2026 = 6.85% (unverified, web-sourced).
- Web: Damodaran ctryprem.html, January 2026 data, India total ERP = 7.08% (unverified, web-sourced).
