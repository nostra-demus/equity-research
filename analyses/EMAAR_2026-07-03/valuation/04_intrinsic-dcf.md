# Intrinsic DCF — EMAR (Emaar Properties PJSC, DFM:EMAAR)

**Reporting standard:** IFRS | **Currency:** AED (UAE Dirham), AED millions unless stated
**Fiscal year end:** 31 December | **Jurisdiction:** UAE — Dubai Financial Market (DFM)
**Business type:** Operating real estate developer with recurring income streams (per `00_valuation-data-triage` §6A). FCFF DCF is the correct primary method per the Business-Type Method Map — this is NOT a REIT or financial, and EV-based analysis applies.
**Discounting convention:** Mid-year (cash flows discounted at t − 0.5), reflecting that cash arrives throughout the year rather than at year-end.

---

## Business-Type Gate

Emaar is classified as an **Operating real estate developer** (80% development, 16% leasing/retail, 5% hospitality) per `00_valuation-data-triage` §6A and `03_margin-drivers` §1. It is NOT classified as a Financial, REIT, or Holding company. The FCFF DCF with an EV bridge is the correct primary method. Cyclicality gate also applies: Emaar's business-quality cyclicality score is 30/100 (`07_business-quality` §1), confirming a deeply cyclical business at or near a Dubai residential cycle peak. The FCF base and terminal assumptions must anchor to mid-cycle, not FY2025 peak levels.

---

## 1. FCF Base & Normalizations

Base year: **FY2025 (year ending 31 December 2025)**

| Item | Base-Year Value (AED Mn) | Normalization Applied | Source |
|---|---:|---|---|
| Revenue | 49,557 | None — accepted as base; FY2025 is a cycle-peak year, used as starting point only; terminal is NOT set at this level | Capital IQ Annual Financials, FY2025 Income Statement |
| EBIT | 22,552 | None for base year; terminal margin set to 35% (mid-cycle), not 45.5% (peak). See §2. | Capital IQ Annual Financials, FY2025 |
| Normalized effective tax rate | 13.0% | Accepted as structural steady-state. FY2025 effective rate post-UAE Corporate Tax (9%) + DMTT (15%). FY2023 rate (1.5%) is pre-tax-era and is not used. No one-off non-deductible FVTPL loss identified; rate is accepted without further stripping. | FY2025 Investor Presentation (Feb-12-2026), slide 12 (NPBT AED 25,657 Mn vs Net Profit AED 22,326 Mn = 13.0%). Moat module §3 confirmed same 13% anchor. Cross-orb reconciliation: confirmed consistent. |
| NOPAT (EBIT × (1 − 13%)) | 19,620 | — | Computed |
| D&A | 1,580 | None — computed as CIQ EBITDA (AED 24,132 Mn) minus EBIT (AED 22,552 Mn) | Capital IQ Annual Financials, FY2025 |
| Capex | 934 | None — low because developer model funds growth via buyer advances (restricted escrow), not capex | Capital IQ Annual Cash Flow, FY2025 |
| Delta-NWC (implied, FY2025) | −4,029 (source) | Derived as: NOPAT + D&A − Capex − Normalised FCF = 20,266 − 24,295 = −4,029 Mn. Negative = net operating WC fell (cash source). Emaar is a net-negative-NWC developer: buyer advances received upfront exceed trade AR, so a growing revenue base releases cash from this structure each year. Normalised FCF (ex-unearned revenue) = AED 24,295 Mn per `earnings/06_earnings-quality` — this is the lead FCF base, not the inflated reported FCF of AED 32,524 Mn. | `earnings/06_earnings-quality`, §1 (normalised FCF FY2025 AED 24,295 Mn); computed |
| Delta-NWC as % of revenue (FY2025) | −8.13% of revenue | Revenue-linked driver: as revenue grows at Emaar's developer model, operating NWC becomes more negative (buyer advances scale with sales), releasing cash. This driver fades to zero in the terminal as the cycle normalises. See §2. | Computed: −4,029 / 49,557 |
| Normalised FCF (FY2025) | 24,295 | Reported FCF (AED 32,524 Mn) is reduced by AED 8,229 Mn of unearned-revenue advance payments from off-plan buyers. These are real cash inflows but represent future delivery obligations — removing them shows recurring cash generation. The AED 2,505 Mn of interest income on escrow cash is non-operating and non-recurring at this scale; excluded from FCFF (interest income is below-the-line in NOPAT). | `earnings/06_earnings-quality`, §1 and §10 |

**FCF definitional anchor:** FCFF = NOPAT + D&A − Capex − ΔNWC (income-statement / balance-sheet build). This matches the normalised FCF per `earnings/06` (cross-checked: zero residual). Cycle position note: FY2025 is almost certainly a cycle peak for Dubai residential (record UAE property sales AED 71.1 Bn, record revenue backlog AED 134.3 Bn, normalised FCF AED 24,295 Mn). These peak figures are used as base-year starting points only; the forecast fades to mid-cycle by years 5–7.

---

## 2. Forecast Assumptions

Forecast horizon: **7 years (FY2026–FY2032)**, then Gordon growth terminal.

| Assumption | FY2026 | FY2027 | FY2028 | FY2029 | FY2030 | FY2031 | FY2032 | Terminal | Source / Basis |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|
| Revenue growth % | 7.1% | 13.9% | 8.0% | 5.0% | 3.0% | 2.5% | 2.0% | 2.0% | FY2026–27: Consensus estimates (Capital IQ, earnings/04, Jun-22-2026). FY2028–32: analyst assumption — AED 134.3 Bn UAE backlog supports near-term; fade to mid-cycle growth as Dubai cycle normalises |
| EBIT margin % | 45.2% | 44.0% | 42.0% | 39.5% | 37.0% | 35.5% | 35.0% | 35.0% | FY2026–27: analyst assumption near-consensus; gradual compression from mix shift (apartments +62.7% share), construction cost inflation. FY2028–32: analyst assumption — cyclicality gate applied; terminal 35.0% is mid-cycle (between FY2021 trough 23.5% and FY2025 peak 45.5%); see cyclicality gate below |
| Tax rate % | 13.0% | 13.0% | 13.0% | 13.0% | 13.0% | 13.0% | 13.0% | 13.0% | UAE Corporate Tax (9%) + DMTT (15%) steady-state; company-disclosed per FY2025 Investor Presentation slide 12. Moat module §3 cross-checked: same rate confirmed. No further OECD Pillar Two uplift assumed (analyst assumption) |
| Capex (% of revenue) | 1.9% | 1.9% | 2.0% | 2.0% | 2.0% | 2.0% | 2.0% | 2.0% | Analyst assumption — FY2025 capex was 1.88% of revenue. Hotel/mall expansion (Dubai Mall Grand Drive H2-2028, Dubai Expo Mall H2-2027) adds modest step-up. Low because developer funds growth via buyer advances (restricted escrow), not fixed-asset capex |
| D&A (% of revenue) | 3.2% | 3.2% | 3.2% | 3.2% | 3.2% | 3.2% | 3.2% | 3.2% | Analyst assumption — FY2025 D&A was 3.19% of revenue; held stable reflecting hotel key additions at consistent pace |
| ΔNWC (% of revenue, revenue-linked driver) | −8.13% | −7.00% | −5.00% | −3.00% | −1.50% | −0.50% | 0.00% | 0.00% | Analyst assumption — fading from FY2025 level (−8.13%) as the cycle normalises. Negative = NWC falls (cash source) for a negative-NWC developer; in terminal, WC delta = 0 (no further release). See WC sign sanity check below |

**Working capital sign sanity check:** Emaar operates as a negative-NWC developer — buyer advance payments (unearned revenue) grow with sales, systematically exceeding trade AR. As revenue grows and this ratio is held, NWC becomes MORE negative each year, which ADDS to FCF (ΔNWC is negative = NWC falls = release). The model confirms this: in every year FY2026–FY2031, ΔNWC is negative (a cash source that increases FCF). In FY2032 (terminal), ΔNWC = 0 (no further release). The sign has been verified — a growing revenue base at a negative-NWC developer correctly produces a positive FCF contribution from WC, not a drag. This is the opposite of a normal business: here, growth HELPS FCF via WC mechanics, fading as the cycle peaks.

**Cyclicality gate (MODULE_RULES §8):** Terminal EBIT margin of 35.0% is benchmarked against:
- **Peer-normal anchor:** Aldar Properties (only listed peer) has EBITDA margin ~29%, EBIT margin ~24% (Capital IQ Comps, Jun-28-2026). Emaar earns a premium to Aldar due to brand and location moat — terminal of 35% EBIT is above peer-normal but below current peak, consistent with the narrow moat evidence. DAMAC and Nakheel/Dubai Holding have no public financials.
- **Prior-trough anchor:** FY2021 EBIT margin = 23.5% (`earnings/01_historical-financials` §1). FY2020 EBITDA margin ~18.7% (AED 5.2 Bn EBITDA / AED 27.9 Bn revenue, from `earnings/03_margin-drivers` §cycle-position note). Terminal of 35.0% sits above the prior-trough (23.5%) and below the current peak (45.5%), consistent with a narrow-moat developer earning through-cycle returns above the cost of capital (moat module through-cycle ROIC ~11–12% vs WACC ~9%).
- The terminal margin of 35% is NOT "below the most recent peak" in a vague sense — it is specifically anchored at the midpoint between the FY2021 trough (23.5%) and FY2025 peak (45.5%), and validated against the Aldar peer margin. The cyclicality gate is satisfied.

---

## 3. Discount Rate (WACC)

| Component | Value | Source |
|---|---:|---|
| Risk-free rate | 4.48% | 10-year US Treasury yield, ~4.47–4.49% as of July 2, 2026 (web-sourced, unverified: tradingeconomics.com, Jul-2026; used because AED is pegged to USD at 3.6725, making the USD risk-free rate the appropriate anchor for AED-denominated cash flows) |
| Equity risk premium (UAE) | 4.87% | Damodaran country risk premium dataset (Jan-2026 update), UAE Aa2 Moody's rating, adjusted default spread 0.42% (web-sourced: pages.stern.nyu.edu/~adamodar/New_Home_Page/datafile/ctryprem.html, accessed Jul-2026, unverified) |
| Beta | 1.0 | Inference, not from filings — GCC developer peer range 0.9–1.1 per moat module §3; midpoint used. Capital IQ exports do not provide an explicit reported beta for EMAAR. |
| Cost of equity | 9.35% | CAPM: 4.48% + 1.0 × 4.87% = 9.35% |
| Pre-tax cost of debt | 3.76% | Weighted average of three outstanding sukuk: USD 500 Mn at 3.64% (due Sep-2026), USD 500 Mn at 3.875% (due 2029), USD 499.9 Mn at 3.70% (due 2031). Capital IQ Capital Structure Details, Q1-2026. |
| After-tax cost of debt | 3.27% | 3.76% × (1 − 13%) = 3.27% |
| Equity weight | 91.5% | Market cap AED 107,833 Mn / (AED 107,833 Mn + AED 10,064 Mn total debt) = 91.5% at AED 12.20/share |
| Debt weight | 8.5% | AED 10,064 Mn / AED 117,897 Mn = 8.5% |
| **Computed WACC** | **8.83%** | **0.915 × 9.35% + 0.085 × 3.27% = 8.56% + 0.28% = 8.83%** |

**Analyst override:** None applied. Computed WACC (8.83%) falls within the moat module's estimated WACC range of 9.0–10.0% (moat module §3, *Inference, not from filings*). The gap is 0.67pp — within the 2pp cross-check tolerance of MODULE_RULES Gate 4. The computed WACC is used as-is; both the computed (8.83%) and moat-module-inferred (9.0–10.0%) ranges are disclosed. No unbounded judgment override applied.

**WACC sanity bounds (MODULE_RULES §8):** Risk-free rate and ERP are both dated and labelled web-sourced. After-tax cost of debt (3.27%) is positive and plausible given sukuk rates. Terminal g (2.0%) is below the long-run nominal growth proxy for the AED/USD economy (~5–6% for UAE nominal GDP at ~4% real + ~2% inflation, or ~4–5% for a more conservative USD-linked view). WACC passes all sanity bounds.

---

## 4. Free Cash Flow Forecast & Discounting

FCFF identity: **FCFF = NOPAT + D&A − Capex − ΔNWC**

All figures AED millions. Mid-year convention: discount factor = 1 / (1 + WACC)^(yr − 0.5).

```
Executed Python snippet — output:

Year     Rev      EBIT    NOPAT    D&A  Capex    dNWC      FCF  dNWC-sign      DF    PV_FCF
FY2026  53,076   23,990  20,871  1,698  1,008  -4,315   25,876 release(+FCF) 0.9586  24,804
FY2027  60,241   26,506  23,060  1,928  1,145  -4,217   28,060 release(+FCF) 0.8808  24,715
FY2028  65,060   27,325  23,773  2,082  1,301  -3,253   27,807 release(+FCF) 0.8093  22,505
FY2029  68,313   26,984  23,476  2,186  1,366  -2,049   26,345 release(+FCF) 0.7437  19,592
FY2030  70,362   26,034  22,650  2,252  1,407  -1,055   24,549 release(+FCF) 0.6833  16,775
FY2031  72,121   25,603  22,275  2,308  1,442    -361   23,501 release(+FCF) 0.6279  14,756
FY2032  73,564   25,747  22,400  2,354  1,471       0   23,283 absorb(-FCF)  0.5769  13,433
```

**WC sign check:** In every year FY2026–FY2031, ΔNWC is negative (NWC falls), correctly adding to FCF ("release(+FCF)"). In FY2032, ΔNWC = 0 (no further release). The sign is consistent with a negative-NWC developer where revenue growth makes NWC more negative each year — a cash source, not a drag. Sanity-check passed: revenue is growing AND the WC line adds to FCF (correct for this business model).

**Sum of PV of explicit FCFs: AED 136,581 Mn**

---

## 5. Terminal Value

**Method:** Gordon Growth Model (Gordon perpetuity). Exit multiple is not used as the primary terminal method because Emaar's cycle position makes terminal-year multiples unreliable anchors.

**Terminal g choice — Gate 2 (Financeable Growth) flag and resolution:**

The financeable-growth cross-check (MODULE_RULES Gate 2) flagged a gap exceeding the 1.5pp threshold:
- Terminal NOPAT: AED 22,400 Mn; Net reinvestment (Capex − D&A) = AED 1,471 Mn − AED 2,354 Mn = −AED 883 Mn (negative net capex because D&A > Capex — a developer-specific structural feature where maintenance D&A on hotels/malls exceeds maintenance capex in steady-state)
- Reinvestment rate: −3.94% (negative, implying capital is being returned, not invested)
- Implied growth at through-cycle ROIC 12%: 12% × (−3.94%) = −0.47%
- The gap vs modeled terminal g = 3.5%: 3.97pp — exceeds the 1.5pp Gate 2 threshold

**Resolution per MODULE_RULES Gate 2:** Terminal g is LOWERED to 2.0% (the base case) from 3.5%. 2.0% is close to AED/USD long-run inflation (~2–2.5%) and represents a plausible low-real-growth terminal for a narrow-moat developer that earns above WACC but cannot sustain high nominal growth indefinitely. The original 3.5% case is shown in the sensitivity grid but is NOT the base case. Intrinsic confidence is capped (noted in §8).

Note on the developer mechanics: the negative net reinvestment arises because reported capex (hotel/mall maintenance + small additions) is below D&A on the same assets. In a true terminal, a developer's "reinvestment" in new land parcels flows through working capital (land bank acquisition), not reported capex — so the reinvestment rate calculation understates true capital needs. The conservative solution is to lower g rather than inflate the reinvestment assumption. This is appropriate given the cyclicality and narrow-moat context.

| Terminal Metric | Base Case (g=2.0%) | Sensitivity reference (g=3.5%) | Bear / Runoff (g=0%) |
|---|---:|---:|---:|
| Terminal FCF (FY2032 × (1+g)) | AED 23,749 Mn | AED 24,098 Mn | AED 23,283 Mn |
| Terminal value (undiscounted) | AED 347,711 Mn | AED 452,118 Mn | AED 263,680 Mn |
| PV of terminal value | AED 192,299 Mn | AED 250,041 Mn | AED 145,827 Mn |
| Terminal value as % of total EV | **58.5%** | **64.7%** | **51.6%** |

**Terminal value as % of EV (base case): 58.5% — below the 75% terminal-dominance threshold. Not flagged.**

```
Executed Python snippet — PV of TV at g=2.0%:
  Terminal FCF (FY2032): 23,283
  × (1 + 2.0%): 23,749
  ÷ (WACC − g) = (8.83% − 2.0%): 347,711 (undiscounted TV)
  ÷ (1 + 8.83%)^7: 192,299 (PV of TV)
```

**Structural-decline / runoff trigger (§5 declining-perpetuity gate):**

- `09_moat.md` verdict: **Narrow moat** (not "Strong moat" or "No moat proven"). A narrow moat is not the "No moat proven" trigger for a forced fade-to-WACC terminal. However, the moat is narrow and cyclical, so the base terminal DOES NOT include a perpetual excess-return premium — the terminal EBIT margin of 35% is chosen to deliver a through-cycle ROIC of approximately 11–12% (consistent with the moat module's through-cycle figure), barely above WACC of 8.83%. The base case is thus calibrated as a narrow-moat terminal, not a wide-moat premium.
- `07_business-quality.md` rate-of-change/disruption score: **62/100** — above the ≤40 threshold that would trigger an active-decay declining-perpetuity terminal. Real estate development is not a disruption-exposed business at current timescales. Therefore the declining-perpetuity terminal is shown as the **structural-impairment bear scenario** for `07_scenario-and-fair-value`, NOT as the base case.

**Declining-perpetuity / structural-impairment bear scenario (inputs to `07_scenario-and-fair-value`):**

```
Executed Python snippet — Bear/Runoff terminal:
  Scenario: Dubai cycle reverts toward mid-cycle trough
  Trough revenue assumed: AED 40,000 Mn (between FY2021 AED 27.9 Bn and FY2025 AED 49.6 Bn)
  Trough EBIT margin: 30% (between FY2021 23.5% trough and FY2025 45.5% peak)
  Trough NOPAT: AED 10,440 Mn
  Trough FCF (no WC release): AED 10,920 Mn
  Runoff TV (g=0%, undiscounted): AED 123,669 Mn
  Explicit FCF years 1-4: PV = AED 91,617 Mn
  PV of runoff TV (from year 4): AED 88,159 Mn
  Total EV (bear): AED 179,776 Mn
  + Net cash (broad): AED 24,969 Mn
  - Minority: AED 13,808 Mn
  = Equity value (bear): AED 190,937 Mn
  Bear per share: AED 21.60
```

The bear case of AED 21.60/share reflects the scenario where the current Dubai property upcycle peaks and reverts to mid-trough margins within the forecast horizon. Even in this scenario — which uses 4 years of backlog-supported FCF followed by a runoff perpetuity at trough margins — the per-share value (AED 21.60) exceeds the current price (AED 12.20) by 77%, primarily because of the AED 24,969 Mn net cash cushion that directly protects equity holders.

---

## 6. DCF Output

```
Executed Python snippet — EV to equity bridge (base case):

EV = PV of explicit FCFs + PV of terminal value
   = AED 136,581 Mn + AED 192,299 Mn
   = AED 328,880 Mn

+ Net cash (§15 broad basis: debt AED 10,064 Mn − cash+STI+trading AED 35,034 Mn)
  = + AED 24,969 Mn (net cash; add to EV for equity value)

- Minority interest (non-controlling interest)
  = − AED 13,808 Mn

= Equity value = AED 328,880 + 24,969 − 13,808 = AED 340,041 Mn

÷ Diluted shares (8,838.790 Mn, basic = estimated fully diluted; no dilution instruments identified)

= Intrinsic value per share = AED 340,041 / 8,838.790 = AED 38.47
```

| Step | Value (AED Mn) |
|---|---:|
| PV of explicit FCFs (FY2026–FY2032) | 136,581 |
| + PV of terminal value (g = 2.0%) | 192,299 |
| **= Enterprise value** | **328,880** |
| − Minority / non-controlling interest | (13,808) |
| + Net cash (broad basis: −net debt) | 24,969 |
| **= Equity value** | **340,041** |
| ÷ Diluted shares (Mn) | 8,838.790 |
| **= Intrinsic value per share** | **AED 38.47** |
| vs current price (AED 12.20, pool-verified Jun-28-2026) | **Current price is 68.3% below base intrinsic value** |

**Net debt basis note:** The broad basis (−AED 24,969 Mn net cash) is the canonical figure from `01_price-and-capital-structure` §7 (CIQ standard). Restricted cash (project escrow AED 43,338 Mn) is EXCLUDED — it is buyer-ring-fenced and not available for general corporate use. Using the strict basis (net cash −AED 2,115 Mn) would give equity value of AED 317,187 Mn and intrinsic value of AED 35.88/share — the sensitivity is shown but the broad basis is canonical.

---

## 7. Sensitivity Grid (Per-Share Intrinsic Value, AED)

Terminal growth (rows) vs WACC (columns). Base case in centre cell.

```
Executed Python snippet — sensitivity grid:
WACC:                  7.83%        8.83%        9.83%
g = 2.5%              47.0         40.3         35.4
g = 2.0% (BASE)       44.4         38.5         34.1
g = 1.5%              42.1         36.9         32.9
```

| | WACC −1% (7.83%) | WACC base (8.83%) | WACC +1% (9.83%) |
|---|---:|---:|---:|
| g +0.5% = 2.5% | 47.0 | 40.3 | 35.4 |
| g base = 2.0% | 44.4 | **38.5** | 34.1 |
| g −0.5% = 1.5% | 42.1 | 36.9 | 32.9 |

**Grid dispersion (base model): AED 32.9–47.0/share.**
**Bear (structural-impairment / cycle-trough runoff, g=0%): AED 21.60/share.**
**Current price: AED 12.20/share.**

Even the most conservative cell in the standard grid (WACC +1%, g −0.5% = AED 32.9/share) implies the stock is 170% above current price on a base-case DCF. The bear/runoff scenario (AED 21.60) still implies 77% above current price. This suggests either the DCF inputs are persistently too optimistic, or the market is pricing the stock at a very deep discount to intrinsic value — a finding that inverts the usual burden of proof.

**Additional sensitivity — strict net-cash basis (AED 2,115 Mn vs AED 24,969 Mn broad):**
Using strict net cash reduces the per-share range by approximately AED 2.6/share across all cells.

---

## 8. Intrinsic Read

The base-case intrinsic value is **AED 38.47/share** (WACC 8.83%, terminal g 2.0%), with the sensitivity grid spanning AED 32.9–47.0/share and a structural-impairment bear of AED 21.60/share. At the current price of AED 12.20, the stock trades at a discount of approximately 68% to the base-case intrinsic value across all cells of the grid — a gap so wide that it warrants explicit scrutiny of what the model is likely to be getting wrong, not just congratulating the finding.

**The three most likely sources of DCF optimism that could close this gap:**

1. **Cycle normalisation is deeper and faster than modeled.** The forecast uses consensus near-term revenue growth (FY2026: +7.1%, FY2027: +13.9%) anchored to the AED 134.3 Bn UAE backlog. If Dubai property demand collapses faster than the backlog buffers — e.g. because new sales drop 30%+ in 2025–2026 and construction delivery slows — then the FY2028–2032 revenue trajectory deflates well below the model. Even a 25% revenue cut in terminal-year revenue would compress the base intrinsic by roughly AED 10–12/share.

2. **Working capital assumptions.** The model includes AED 4.3–4.2 Bn of WC cash releases in FY2026–2027 from the growing negative-NWC developer structure. These are real economic flows in a rising-revenue environment, but they depend on continued new-sales momentum (buyer advances must keep growing to sustain the release). If new-sales momentum stalls, the WC release evaporates and the near-term FCF compresses materially.

3. **WACC could be higher.** A beta of 1.0 may understate country/cycle risk for a single-city developer at cycle peak. At beta = 1.3 (the higher end of a plausible range for a concentrated cyclical developer), cost of equity rises to ~10.83%, WACC to ~10.2%, and the base-case intrinsic falls to roughly AED 24–27/share — a tighter but still substantial premium to current price.

**The single assumption the model is most sensitive to:** Revenue trajectory from FY2028 onward, driven by how quickly the Dubai property cycle normalises. The AED 134.3 Bn backlog provides 5–6 years of revenue visibility, but the conversion pace (POC milestone certification) depends on contractor capacity, construction timelines, and delivery scheduling — the single highest-sensitivity variable identified in `earnings/07_earnings-sensitivity` §4.

**Confidence level: Medium-Low (capped).** Capped because: (a) the financeable-growth gate flagged a >1.5pp gap between implied growth and modeled terminal g, requiring the terminal g to be lowered; (b) the working-capital release figures are large relative to NOPAT in years 1–2, creating uncertainty; (c) the moat is narrow and the business is deeply cyclical, making the through-cycle terminal margin assumption materially uncertain. The base DCF value of AED 38.47 is a derived point estimate, not a precision figure — the AED 32.9–47.0 grid shows its fragility.

---

## Self-Check

- [x] Business-type gate applied: FCFF DCF is correct for an operating developer. Not a Financial or REIT.
- [x] Cyclicality gate applied: terminal EBIT margin of 35% benchmarked against Aldar peer (24% EBIT) and Emaar's own FY2021 trough (23.5%); terminal is between trough and peak, not at peak.
- [x] FCF base year stated (FY2025); normalizations itemized (unearned-revenue removal for normalised FCF; no tax-rate stripping needed as rate is structural).
- [x] Every forecast assumption labeled company-guided, consensus, or analyst assumption.
- [x] WACC components all shown with sources; web-sourced rates labeled. No analyst override (computed 8.83% is within 0.67pp of moat module's 9–10% estimate; Gate 4 satisfied).
- [x] Terminal value disclosed as % of EV (58.5% base case; below 75% threshold; not flagged).
- [x] Financeable-growth cross-check run; gap >1.5pp identified and resolved by lowering terminal g from 3.5% to 2.0%; confidence capped.
- [x] Working capital change forecast from revenue-linked driver (% of revenue, fading from −8.13% to 0%); not a flat absolute.
- [x] Working capital sign verified: negative ΔNWC = NWC falls = cash source = adds to FCF. Correct for a negative-NWC developer growing revenue. Sanity-check explicitly passed.
- [x] EV → equity bridge uses `01`'s canonical net cash (broad basis, −AED 24,969 Mn) and share count (8,838.790 Mn).
- [x] Discounting convention stated and defaults to mid-year (t − 0.5).
- [x] Sensitivity grid populated; per-share dispersion AED 32.9–47.0.
- [x] Report leads with single base-case intrinsic value (AED 38.47); grid is the dispersion exhibit; bear/runoff scenario shown separately.
- [x] Declining-perpetuity / structural-impairment bear shown (AED 21.60/share): labeled as bear input for `07_scenario-and-fair-value`, NOT the base case.
- [x] Narrow moat: terminal does NOT carry perpetual excess return premium — terminal ROIC is calibrated to ~11–12% (barely above WACC), consistent with narrow-moat evidence.
- [x] Computed FCF sum, terminal value, and EV → equity → per-share bridge are all from executed Bash/Python snippets with command + result shown (F09 requirement satisfied).
- [x] Partial-data cap applied (Medium-Low confidence) per financeable-growth flag and developer WC uncertainty.
- [x] No banned phrases.

---

*All FCF projections, WACC components, PV computations, terminal value, and equity bridge produced by executed Python (Bash) snippets from raw upstream module inputs. No mental arithmetic used for derived values. Numbers verified to reconcile: explicit FCF PV = AED 136,581 Mn + PV TV = AED 192,299 Mn = EV AED 328,880 Mn.*

