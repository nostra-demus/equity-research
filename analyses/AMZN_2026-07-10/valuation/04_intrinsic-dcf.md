# Intrinsic DCF — AMZN

**Reporting standard:** US GAAP. **Currency:** USD (millions unless stated). **Fiscal year end:** December 31. **Listing:** Nasdaq Global Select Market. **Business type:** Operating company (three segments: North America, International, AWS). **Business-type gate applied:** FCFF DCF appropriate; no Financial or REIT method needed.

**Discounting convention:** Mid-year (t − 0.5 applied to each explicit FCF period). Terminal value discounted at t = 10 (end of explicit forecast). This is the standard convention and is stated per MODULE_RULES DCF Standard 8.

**Intrinsic confidence cap:** Terminal value exceeds 75% of EV (base case 79.9%) — DCF is terminal-dominated; a second lens (exit-multiple cross-check) is shown alongside. Per MODULE_RULES Score Cap, valuation confidence is capped at 60 for the Gordon method alone; the exit-multiple cross-check partially lifts this.

---

## 1. FCF Base & Normalizations

Base year: **FY2025** (audited; 10-K filed April 9, 2026). All figures USD millions.

| Item | Base-Year Value | Normalization Applied | Source |
|---|---:|---|---|
| Revenue | $716,924M | None | FY2025 10-K, Item 7, p.24 |
| EBIT (reported) | $79,975M | Add back $4,300M in one-time charges (FTC settlement $2,500M + severance $1,800M; confirmed management-called one-offs) → adjusted EBIT $84,275M | FY2025 10-K, Item 7, p.27; Q3 2025 Earnings Call, Oct 30, 2025 |
| Normalized effective tax rate | 21.0% | US statutory rate used in place of the reported FY2025 effective rate of 19.7%, which is distorted by a $15,301M gain on equity investments (Anthropic reclassification + Rivian; FVTPL-equivalent non-deductible for operating income purposes). Stripping this distortion yields 21% as the structural rate. Note: the moat module (09_moat.md §3) independently derived 21% for its NOPAT computation — this DCF reconciles to that rate. | FY2025 10-K, Note 5, p.54–55; 09_moat.md §3 |
| NOPAT (base, normalized) | $66,577M | Adjusted EBIT $84,275M × (1 − 0.21) = $66,577M | Computed |
| D&A | $65,756M | EBITDA $145,731M − EBIT $79,975M = $65,756M; used as reported (non-cash, correctly excluded from NOPAT then re-added) | Capital IQ Income Statement, FY2025; earnings/01_historical-financials.md |
| Gross capex | $131,819M | No normalization — LTM capex is stated at $151,003M, but FY2025 ($131,819M) is used as the explicit-period anchor; the forecast ramps capex to ~$200B in FY2026 per guidance | FY2025 10-K, p.22; earnings/01_historical-financials.md |
| Working capital change | $18,393M avg drain | Revenue-linked driver: 3-year average (FY2023–FY2025) WC cash drain = ($17,318M + $18,541M + $19,319M) / 3 = $18,393M; expressed as % of avg revenue = 2.86% of revenue. Applied as 2.86% of forecast revenue each year. Sign: WC drain subtracts from FCF (NWC rising in absolute terms, absorbing cash despite negative CCC — driven by broad WC definition including accrued liabilities and unearned revenue). | earnings/06_earnings-quality.md §1 (WC change table) |

**Working-capital sign sanity check.** Amazon's CCC is deeply negative (−56.9 days, FY2025). The broad WC definition used in the CFO bridge includes accounts payable, unearned AWS revenue, and accrued liabilities that all GROW as business scales — producing a net cash drain even though the CCC ratio improves. The 2.86% drag reflects this expansion of the full WC complex with revenue, not a sign error. The individual components (AR+Inv−AP) would show a WC release, but the filing's CFO bridge consistently shows a net WC drain across FY2023–FY2025, and that is the controlling evidence. [earnings/06_earnings-quality.md §1; FY2025 10-K Cash Flow Statement]

---

## 2. Forecast Assumptions

Explicit forecast period: **FY2026–FY2035** (10 years). All revenue in $B (billions).

| Assumption | FY2026 | FY2027 | FY2028 | FY2029 | FY2030 | FY2031 | FY2032 | FY2033 | FY2034 | FY2035 | Terminal | Source / Basis |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| Revenue growth % | 14.9% | 13.0% | 12.0% | 11.5% | 11.0% | 10.5% | 10.0% | 9.5% | 8.5% | 8.0% | 3.5% | Yr1–2: consensus ($823.4B, $930.6B; Capital IQ Estimates, as of 2026-07-03). Yr3–10: analyst assumption; fade from 12% to 8% reflecting AWS maturation and retail deceleration |
| EBIT margin % | 12.6% | 13.2% | 14.0% | 14.5% | 15.0% | 15.5% | 15.8% | 16.0% | 16.2% | 16.5% | 16.5% | Yr1: consensus EBIT $103,833M / $823,424M = 12.6% (Capital IQ Estimates). Yr2–10: analyst assumption; expansion driven by AWS mix shift, advertising scale, and operating leverage; capped at 16.5% (conservative vs 35% AWS at ~25% mix) |
| Tax rate % | 21% | 21% | 21% | 21% | 21% | 21% | 21% | 21% | 21% | 21% | 21% | Normalized US statutory rate; see §1 normalization. Consistent with 09_moat.md §3 |
| Capex (% of revenue) | 24.3% | 22.0% | 19.5% | 17.5% | 16.0% | 15.0% | 14.5% | 14.0% | 13.5% | 13.0% | 13.0% | Yr1: management guided ~$200B for FY2026 (Q1 2026 call) / $823B = 24.3%; company-guided. Yr2–10: analyst assumption; moderating as AI buildout completes by 2028–2030 |
| D&A (% of revenue) | 9.7% | 10.2% | 10.7% | 11.0% | 11.2% | 11.3% | 11.4% | 11.5% | 11.5% | 11.5% | 11.5% | Base: FY2025 D&A $65,756M / $716,924M = 9.2%; rising as $131–200B annual capex enters depreciation (5–30yr lives); analyst assumption for path |
| ΔWC (% of revenue, cash drain) | 2.86% | 2.86% | 2.86% | 2.86% | 2.86% | 2.86% | 2.86% | 2.86% | 2.86% | 2.86% | 2.86% | Revenue-linked driver; 3-year average FY2023–FY2025. Analyst assumption (held constant; WC complex scales with revenue) |

**Key assumption notes:**
- **Revenue Yr1–2 are company-guided/consensus** (earnings/04_guidance-consensus.md). All years Yr3–10 are **analyst assumptions**.
- **EBIT margin expansion** is the single most uncertain assumption. It depends on (a) AWS mix shift from 18% to ~25% of revenue by FY2030 and (b) the AI capex D&A headwind not overwhelming revenue growth. The earnings/07_earnings-sensitivity.md §4 identifies AWS revenue growth vs D&A step-up as the single most impactful variable.
- **Capex in FY2026 is peak.** Management guided ~$200B and Q1 2026 annualized capex of $170B confirms the investment pace. Capex moderating from 24% to 13% of revenue by FY2035 is an **analyst assumption** contingent on AWS AI buildout tapering.
- **Moat context:** business-model/09_moat.md returns a **Narrow moat** verdict. Per MODULE_RULES §5 structural-decline trigger: no "No moat proven" or "eroding" flag applies — Amazon has real competitive advantages. The terminal assumptions therefore do NOT apply a runoff discount. However, the terminal EBIT margin is capped at 16.5% (no perpetual excess-return assumption beyond what the narrow moat can support) and terminal g is set at 3.5% (below long-run US nominal GDP growth of ~4.5%, consistent with a maturing business with a narrow moat fading toward the cost of capital). The declining-perpetuity scenario (runoff terminal) is shown in §5 for completeness as the structural-impairment bear input.
- **Cyclicality gate:** Amazon is classified as "Partly externally driven" (business-model/10_external-dependency.md §3). The business is not purely cyclical; AWS provides a buffer. The current margin (11.2% FY2025) is NOT a cyclical peak — it is a recovery from the FY2022 trough (2.6%). The terminal margin of 16.5% is set above the current level (reasonable given AWS expansion) and no mid-cycle normalization is required (no commodity cycle).

---

## 3. Discount Rate (WACC)

| Component | Value | Source |
|---|---:|---|
| Risk-free rate | 4.54% | 10-yr US Treasury yield, July 10, 2026. Web-sourced (tradingeconomics.com, etfdb.com Treasury snapshot July 2, 2026 = 4.49%; July 9 = 4.56%; July 10 ~4.54%). Labeled: **web-sourced, unverified.** |
| Equity-risk premium (ERP) | 4.45% | Damodaran US ERP, July 2026 update (4.45% US-specific; mature-market baseline 4.17%). Web-sourced, labeled: **web-sourced, unverified.** |
| Beta | 1.46 | 5-year monthly beta, Capital IQ Comparable Analysis tab, as of 2026-07-01. |
| **Cost of equity (CAPM)** | **11.04%** | ke = 4.54% + 1.46 × 4.45% = 4.54% + 6.50% = 11.04% |
| Pre-tax cost of debt (blended) | 3.91% | Blended: financial bonds ~$130.6B at ~4.0% (new Q1 2026 issuance at market; prior bonds at ~3.1%) + lease liabilities ~$104.9B at 3.8% (10-K stated weighted-average discount rate on operating leases). Blended = (130.6×4.0% + 104.9×3.8%) / (130.6+104.9) = 3.91%. Inference on financial bond blended rate. |
| After-tax cost of debt | 3.09% | 3.91% × (1 − 21%) = 3.09% |
| Equity weight (market value) | 91.6% | Market cap $2,563,849M / total capital $2,799,389M. Total capital = market cap + total debt (broad, including leases $235,540M). |
| Debt weight (market value) | 8.4% | Total debt (broad) $235,540M / total capital $2,799,389M. |
| **WACC (computed)** | **10.37%** | See formula and verification below. |

**WACC formula (executed):**

```
WACC = w_e × k_e + w_d × k_d × (1 − t)
     = 0.9159 × 11.04% + 0.0841 × 3.91% × (1 − 0.21)
     = 10.1083% + 0.2600%
     = 10.37%
```

**Computed WACC: 10.37%** (rounded to 10.4% for the sensitivity grid).

**Cross-check vs moat module (Gate 4):** The moat module (09_moat.md §3) independently estimated WACC at ~11.2% (using rf=4.5%, ERP=5.0%, beta=1.46, ke=11.8%, narrow capital structure excluding lease liabilities). The DCF-computed WACC of 10.4% diverges by 0.8pp — within the 2pp gate. The difference arises from: (1) using the updated July 2026 Damodaran ERP of 4.45% vs the moat module's estimate of 5.0%; (2) including lease liabilities in the capital structure (broad basis, consistent with the MODULE_RULES canonical EV bridge). **No analyst override of the computed WACC is applied.** The sensitivity grid spans WACC 9.4%–11.4%, which covers both the DCF-computed rate (10.4%) and the moat module's estimate (11.2%).

---

## 4. Free Cash Flow Forecast & Discounting

FCFF definition used: `FCFF = NOPAT + D&A − Capex − ΔNWC`, where NOPAT = EBIT × (1 − t), using normalized tax rate 21%.

All figures in USD millions.

| Year | Revenue | EBIT | NOPAT | D&A | Capex | ΔWC (drain) | FCF | Disc Factor (mid-yr) | PV of FCF |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| FY2026 | 823,746 | 103,792 | 81,996 | 79,903 | 200,170 | 23,555 | −61,826 | 0.9519 | −58,851 |
| FY2027 | 930,833 | 122,870 | 97,067 | 94,945 | 204,783 | 26,617 | −39,388 | 0.8624 | −33,970 |
| FY2028 | 1,042,533 | 145,955 | 115,304 | 111,551 | 203,294 | 29,811 | −6,250 | 0.7814 | −4,884 |
| FY2029 | 1,162,424 | 168,551 | 133,156 | 127,867 | 203,424 | 33,240 | 24,359 | 0.7080 | 17,246 |
| FY2030 | 1,290,290 | 193,544 | 152,899 | 144,513 | 206,446 | 36,896 | 54,070 | 0.6415 | 34,686 |
| FY2031 | 1,425,771 | 220,994 | 174,586 | 161,112 | 213,866 | 40,770 | 81,062 | 0.5812 | 47,117 |
| FY2032 | 1,568,348 | 247,799 | 195,761 | 178,792 | 227,410 | 44,847 | 102,295 | 0.5266 | 53,873 |
| FY2033 | 1,717,341 | 274,775 | 217,072 | 197,494 | 240,428 | 49,107 | 125,031 | 0.4772 | 59,660 |
| FY2034 | 1,863,315 | 301,857 | 238,467 | 214,281 | 251,548 | 53,282 | 147,919 | 0.4323 | 63,951 |
| FY2035 | 2,012,380 | 332,043 | 262,314 | 231,424 | 261,609 | 57,544 | 174,584 | 0.3917 | 68,388 |

**Sum of PV of explicit FCFs: $247,216M**

**Executed snippet (key outputs):**

```python
# WACC blend
we=0.9159, ke=0.1104, wd=0.0841, kd_pretax=0.0391, t=0.21
WACC = 0.9159*0.1104 + 0.0841*0.0391*(1-0.21) = 0.10368 = 10.37%

# PV of FCF sum (mid-year convention, WACC=10.37%)
pv_sum = sum(FCF[i] / (1+0.10368)^(i+0.5) for i in 0..9) = $247,216M

# Terminal value (Gordon, g=3.5%, TV at t=10)
FCF_yr11 = 174,584 * 1.035 = $180,694M
TV_base = 180,694 / (0.10368 - 0.035) = $2,630,842M
PV_TV = 2,630,842 / (1.10368)^10 = $980,959M

# EV -> equity -> per share (broad net debt $92,451M, diluted shares 10,874M)
EV_base = 247,216 + 980,959 = $1,228,175M
Equity = 1,228,175 - 92,451 = $1,135,724M
Per_share = 1,135,724 / 10,874 = $104.44
```

**Working-capital sign check:** The ΔWC column shows a positive drain (subtracting from FCF) every year. Revenue is growing and the WC complex (unearned revenue, accrued liabilities, AP, AR) expands proportionally. The NWC ratio in the CFO sense generates a net cash use of 2.86% of revenue annually, consistent with three years of actual data (FY2023–FY2025). No sign inversion is required.

**FCF profile note:** FCFs are negative for the first three years (FY2026–FY2028) because ~$200B annual AI capex exceeds NOPAT + D&A combined. This is consistent with management's stated investment posture (Q1 2026 call, CFO: "we will continue to make significant investments, especially in AI") and the $364B AWS backlog. FCFs turn positive in FY2029 as capex moderates and revenue grows into the D&A load.

---

## 5. Terminal Value

**Method 1: Gordon Growth Perpetuity (base)**

Formula: `TV = FCFF_{n+1} / (WACC − g) = FCFF_n × (1 + g) / (WACC − g)`

Where:
- `FCFF_n` = FCF in Year 10 (FY2035) = $174,584M
- `g` = 3.5% (terminal perpetual growth rate — see rationale below)
- `WACC − g` = 10.37% − 3.50% = 6.87pp (comfortably positive)

`TV = 174,584 × 1.035 / 0.0687 = 180,694 / 0.0687 = $2,630,842M`

- **Terminal value (undiscounted):** $2,630,842M
- **PV of terminal value (discounted at t=10):** $980,959M
- **Terminal value as % of total EV: 79.9%** — **FLAG: terminal-dominated (>75%); low confidence on the Gordon method alone.** The exit-multiple cross-check is mandatory per MODULE_RULES Gate 5.

**Terminal growth g rationale (3.5%):**
- US long-run nominal GDP growth is ~4.0–4.5% (real ~2–2.5% + inflation ~2%). Amazon's narrow moat means terminal ROIC should fade toward WACC (~10.4%), not sustain large excess returns.
- Financeable g cross-check: at terminal capex=13%, D&A=11.5%, WC drain=2.86% of revenue, NOPAT margin=13.0% of revenue → reinvestment rate = 33.4% of NOPAT; implied ROIC = g / reinvestment_rate. Setting g=3.5%: implied ROIC = 3.5% / 33.4% = 10.5% ≈ WACC (10.4%). This passes Gate 2 — the terminal growth is financeable at ROIC ≈ WACC. [Executed Python snippet above]
- Using g=4.0% would imply ROIC = 12% > WACC, requiring a persistent excess return — only supportable if the AWS moat strengthens materially. This is the bull scenario.

**Method 2: Exit Multiple Cross-Check (required — terminal >75% of EV)**

At FY2035 (Year 10):
- Revenue = $2,012B; EBIT margin = 16.5%; D&A = 11.5% → EBITDA margin = 28.0%
- EBITDA Year 10 = $563,466M

| Exit Multiple | Terminal Value | PV Terminal | Total EV | Per Share |
|---|---:|---:|---:|---:|
| 6x EV/EBITDA | $3,381B | $1,261B | $1,508B | $130 |
| 8x EV/EBITDA | $4,508B | $1,681B | $1,928B | $169 |
| 10x EV/EBITDA | $5,635B | $2,101B | $2,348B | $207 |
| 12x EV/EBITDA | $6,762B | $2,521B | $2,768B | $246 |
| 15x EV/EBITDA | $8,452B | $3,152B | $3,399B | $304 |

**Gordon vs exit multiple divergence:** The Gordon TV of $2.63T implies a 4.7x EV/EBITDA multiple on FY2035 EBITDA — very low for a company with AWS at ~40% EBIT margin and $150B+ annualized revenue. A mature Amazon in 2035 with stable AWS, growing advertising, and disciplined retail would likely trade at 8–12x EV/EBITDA (similar to today's Alphabet at ~11x NTM EBITDA). The Gordon DCF understates intrinsic value because: (a) the deep negative FCFs in FY2026–FY2028 compound at a high discount rate, destroying PV; and (b) the terminal FCF ($174.6B) is modest relative to the business scale at Year 10 ($2T revenue, $563B EBITDA) because high reinvestment continues.

**Cross-method read:** Gordon gives ~$104; exit 10x EBITDA gives ~$207; exit 8x gives ~$169. The spread is large ($100/share, ~95%). This is a genuine disagreement — not an averaging opportunity. The Gordon method is most conservative and serves as the floor; exit multiples capture the terminal franchise value better given Amazon's investment-phase dynamics.

**Structural-decline / runoff terminal (bear input — not the base case):**

Moat trajectory: **stable, with widening potential in AWS** (09_moat.md §5). The moat-quality/business-quality read does NOT trigger the mandatory declining-perpetuity trigger (07_business-quality.md industry rate-of-change = 45/100, above the ≤40 threshold). However, a bear scenario is shown for §24 Filter 5 purposes and as the structural-impairment input to scenario-and-fair-value (07).

Bear terminal: g = 2.0% (zero real growth, implying only inflationary persistence — moat eroding, D&A headwind overwhelming revenue growth):
- `TV_bear = 174,584 × 1.020 / (0.1037 − 0.020) = $178,076 / 0.0837 = $2,127,551M`
- PV TV bear = $2,127,551M / (1.1037)^10 = $793,213M
- Total EV bear = $247,216M + $793,213M = $1,040,429M
- Per share bear = ($1,040,429M − $92,451M) / 10,874M = **$87.20/share**

This bear terminal is the structural-reset input for 07_scenario-and-fair-value. It does not replace the base-case intrinsic value of $104/share.

---

## 6. DCF Output

**Base case: Gordon Growth (g = 3.5%, WACC = 10.4%)**

| Step | Value |
|---|---:|
| PV of explicit FCFs (FY2026–FY2035) | $247,216M |
| + PV of terminal value (Gordon, g=3.5%) | $980,959M |
| **= Enterprise value (Gordon base)** | **$1,228,175M** |
| − Net debt (broad basis, as of Mar 31, 2026) | ($92,451M) |
| − Minority interest | $0 |
| − Preferred equity | $0 |
| **= Equity value** | **$1,135,724M** |
| ÷ Diluted shares (Q1 2026 weighted-average) | 10,874M |
| **= Intrinsic value per share (Gordon base)** | **$104/share** |
| Current price (Jul 1, 2026, pool-verified) | $238.34 |
| Premium of price to intrinsic (Gordon) | +128% |

**Exit-multiple anchor (10x EV/EBITDA, FY2035): $207/share**

Net debt used: **broad basis ($92,451M)** per 01_price-and-capital-structure.md §7 canonical anchor. Diluted shares 10,874M per same anchor. No deviation.

---

## 7. Sensitivity Grid (per-share intrinsic value)

Gordon Growth model; WACC across columns, terminal growth rate (g) down rows.

| | WACC = 9.4% (−1pp) | WACC = 10.4% (base) | WACC = 11.4% (+1pp) |
|---|---:|---:|---:|
| g = 4.0% (bull — AWS moat persists) | $143 | $112 | $90 |
| g = 3.5% (base — narrow moat fades to WACC) | $132 | **$104** | $84 |
| g = 2.0% (bear — moat erodes) | $107 | $87 | $72 |

**Grid range (Gordon): $72 – $143 per share.** No cell approaches WACC−g ≤ 0 (minimum spread is 7.4pp at WACC=9.4%, g=2.0%).

**Exit-multiple reference (10x EV/EBITDA, insensitive to g, varies with WACC):**

| | WACC = 9.4% | WACC = 10.4% | WACC = 11.4% |
|---|---:|---:|---:|
| 8x EBITDA exit | $199 | $169 | $143 |
| 10x EBITDA exit | $241 | $207 | $178 |
| 12x EBITDA exit | $283 | $246 | $214 |

At the current price of $238.34, the exit-multiple cross-check implies that the market is pricing Amazon at approximately **10–12x FY2035 EBITDA** at a 10.4% WACC — meaning the current price requires both strong execution (revenue growing to $2T, margins expanding to 16.5%) and a premium terminal multiple consistent with a wide moat.

---

## 8. Intrinsic Read

**Base-case intrinsic value: $104/share (Gordon DCF, WACC=10.4%, g=3.5%); the sensitivity grid spans $72–$143 on the Gordon method and $143–$283 on exit multiples.** The Gordon DCF implies the stock trades at a 128% premium to intrinsic value — but this is almost entirely a consequence of the model mechanics during the AI investment cycle: FCFs are deeply negative for 2026–2028 (compounding at 10.4% dramatically destroys PV), and the terminal Gordon value undervalues the franchise because g=3.5% implies only 4.7x terminal EBITDA for what will be a $563B EBITDA business. The exit-multiple cross-check at 8–12x EV/EBITDA gives $169–$246/share, bracketing the current price of $238. The single assumption the intrinsic value is most sensitive to is the **terminal exit multiple (or equivalently, the long-run FCF margin and terminal g)**: a move from 8x to 12x EBITDA on Year 10 adds $77/share; within the Gordon method, a 1pp move in WACC shifts value by $20–28/share. The deep capex cycle makes this a franchise-value play rather than a near-term FCF story — the intrinsic estimate is unreliable in the conventional Gordon sense, and the exit-multiple method is the more informative lens for Amazon at this stage.

---

*Sources (web-sourced inputs, labeled unverified):*
- Risk-free rate: [US 10-yr Treasury, July 10, 2026 — tradingeconomics.com](https://tradingeconomics.com/united-states/government-bond-yield), [ETF DB Treasury Snapshot July 2, 2026](https://etfdb.com/fixed-income-content-hub/july-2-2026-treasury-yields-snapshot/)
- Equity-risk premium: [Damodaran US ERP July 2026 — elitecurrensea.com](https://elitecurrensea.com/stocks/damodaran-equity-risk-premiums-july-2026/), [Damodaran SSRN 2026 Edition](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=6361419)
