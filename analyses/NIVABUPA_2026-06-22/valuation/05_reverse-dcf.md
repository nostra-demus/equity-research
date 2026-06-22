# Reverse DCF — What's Priced In — NIVABUPA

**Company:** Niva Bupa Health Insurance Company Limited (NSEI:NIVABUPA / BSE:544286)
**Analysis date:** 2026-06-22
**Price-state:** `pool-verified` — price INR 84.03 from Capital IQ export, corroborated by three independent data points within the pool [01_price-and-capital-structure.md §1]
**Business type:** Financial issuer — IRDAI-regulated health insurer. Per MODULE_RULES Business-Type Map, this agent inverts the **equity-direct Residual Income (RI) model** from `04_intrinsic-dcf.md`, not an FCFF/EV model. EV-based multiples are not applicable here. The reverse-solve asks: what peak ROE does the market price require, and can the company plausibly deliver it?

---

## 1. Inputs

| Input | Value | Source |
|---|---:|---|
| Current price | INR 84.03 | Capital IQ Financials.xls → Key Stats tab; pool-verified [01_price-and-capital-structure.md §1] |
| Market capitalisation (equity value) | INR 155,267 mn (₹15,527 crores) | 1,847.757 mn shares × INR 84.03 [01_price-and-capital-structure.md §3]; confirmed in Key Stats Market Capitalisation |
| Book equity (BV) FY26 — opening anchor | INR 35,824.4 mn (₹3,582 crores) | Capital IQ Balance Sheet, FY26 [01_price-and-capital-structure.md §6; 04_intrinsic-dcf.md §1] |
| ROE FY26 (base-year) | 10.7% | Management-disclosed, Q4 FY26 Earnings Call, May 8 2026 [04_intrinsic-dcf.md §1] |
| Cost of equity (Ke) | 12.87% | From 04_intrinsic-dcf.md §3 verbatim: rf 6.85% + β 0.85 × ERP 7.08% = 12.87% |
| Forecast horizon | 10 years (FY27–FY36) | 04_intrinsic-dcf.md §4 verbatim |
| Discounting convention | Mid-year (FY27 at t=0.5, FY36 at t=9.5) | 04_intrinsic-dcf.md §4 verbatim |
| Terminal ROE | Ke (12.87%) → terminal RI = 0 | "No moat proven" verdict from 09_moat.md §5; used verbatim from 04_intrinsic-dcf.md §5 |
| Model used | Residual Income (RI) / excess-return on equity | 04_intrinsic-dcf.md §§2–6 — Financial issuer; FCFF DCF not applicable |
| Net debt (informational only) | INR 1,954.1 mn (strict) | [01_price-and-capital-structure.md §5]; not relevant to equity-direct RI valuation |

**Model logic recap (from `04`, not re-derived):** Equity value = BV₀ + PV(all future Residual Incomes), where Residual Income_t = (ROE_t − Ke) × BV_(t−1). BV grows by retained earnings each year (payout ratio = zero; insurer reinvests all earnings into solvency capital). The model has no WACC — it uses the cost of equity (Ke = 12.87%) as the single discount rate applied to equity-direct cash flows.

**Model structure from `04`:** ROE ramps linearly from the FY26 base of 10.7% to a peak by FY30, then fades back toward Ke by FY36. The reverse solve holds this exact structure and finds the peak ROE that makes the RI model output equal to the market capitalisation of INR 155,267 mn.

**Required excess value:** The market capitalisation of INR 155,267 mn sits INR 119,443 mn above the current book equity of INR 35,824 mn. The market is therefore paying 4.33× book value, embedding the expectation that Niva Bupa will generate INR 119,443 mn in present-value terms from future excess returns (returns above the 12.87% cost of equity).

---

## 2. Implied Expectations

**Solver executed (Python, bisection):**

```python
# Bisection root-find: find peak_roe such that RI_model(peak_roe) == 155,267 mn
# Structure: FY27-FY30 ramp from 10.7% to peak_roe; FY31-FY36 fade peak_roe → Ke
# Mid-year discounting; terminal RI = 0

BV0 = 35824.4; Ke = 0.1287; target = 155267.0
# Bisection between 0.40 and 0.55: f(0.40)=−44,567; f(0.55)=+38,889
# Root found at iteration 60: peak_roe = 0.4889
# Equity value at root: INR 155,266.4 mn (vs target 155,267.0 mn) ✓
```

**Root returned:** implied peak ROE = **48.9%** (converged to within INR 0.6 mn of target).

| What the Price Implies | Solved Value |
|---|---:|
| Implied peak ROE (FY30) to justify INR 84.03 | **48.9%** |
| Implied ROE by FY27 (ramp year 1) | 20.2% |
| Implied ROE by FY28 (ramp year 2) | 29.8% |
| Implied ROE by FY29 (ramp year 3) | 39.3% |
| Implied ROE by FY36 (terminal) | ~12.9% (fade to Ke) |
| Implied constant ROE (all 10 years, no ramp/fade) | 30.1% |
| Years of 20% ROE (then terminal RI = 0) needed to justify price | ~24 years |

**What was held fixed:** cost of equity (Ke = 12.87%), book equity base (BV₀ = INR 35,824 mn), model structure (10-year horizon, mid-year discounting, zero payout, fade to terminal ROE = Ke), ramp/fade schedule from `04` (4-year ramp, 6-year fade). **What was solved for:** the peak ROE in FY30 at which the sum BV₀ + PV(all RIs over FY27–FY36) equals the market capitalisation of INR 155,267 mn.

**Alternative framing:** Even if the company achieves and sustains a 20% ROE — which no Indian health insurer has demonstrated on a through-cycle basis — the current price would require that performance to continue for approximately **24 consecutive years** before the stock earns its cost of capital. Under the standard 10-year horizon of the forward model, justifying the price requires a peak ROE of nearly 49%.

---

## 3. Implied vs Achievable

| Implied Requirement | Company History | Earnings-Module Evidence | Achievable? |
|---|---|---|---|
| Peak ROE = 48.9% (FY30) | FY26 ROE = 10.7%; through-cycle average FY24–FY26 ≈ 6–8% [09_moat.md §3] | Management guided "mid- to high-teens" ROE by FY29 at a 99% combined ratio [Q4 FY26 transcript, May 8 2026, CFO]; consensus consensus EPS normalized FY27 ₹1.12, FY28 ₹2.37 [04_guidance-consensus.md §3]; maximum plausible ROE given peer set: ICICI Lombard 17.8%, Star Health 13.1% normalized [09_moat.md §3] | **No** — requires a 4.6× lift from today's 10.7% ROE to a level no peer in the sector has approached |
| ROE at 20.2% by FY27 (ramp year 1) | Never demonstrated; FY26 ROE first time above 10% | EOM ratio must fall to ~31% (vs 33.7% today); no single-year move of this magnitude observed in history | **No** — requires a step-change operating-leverage acceleration not supported by any guidance or history |
| ROE = 30.1% sustained (constant model) | Highest peer ROE observed in data: ICICI Lombard 17.8% FY26; Star Health 13.1% normalized | No evidence base for 30% ROE in Indian health insurance | **No** — exceeds any known comparator in the sector |
| 24 years of 20% ROE (alternative framing) | No insurer in the peer set has demonstrated 20% ROE | "No moat proven" verdict [09_moat.md §5] means no structural basis for this duration | **No** — moat verdict and competitive dynamics make multi-decade 20% ROE implausible |

**In plain terms:** The current price of INR 84.03 embeds an expectation that Niva Bupa will, in four years, be generating a return on its equity of approximately 49%. The company's own management considers mid-to-high-teens ROE by FY29 an ambitious target that requires achieving a 99% combined ratio — a level it has never reached. The most profitable health insurer in its peer set, ICICI Lombard, generates an 18% ROE, and the largest standalone health insurer, Star Health, generates a 13% normalized ROE. The implied peak ROE of nearly 49% is roughly 2.7× the best peer benchmark in the sector. No evidence in the available data — historical financials, management guidance, or peer benchmarks — supports the expectation embedded in the price. The market is pricing Niva Bupa as if it will become the highest-ROE health insurer in the world, not merely in India.

**Market-ceiling sanity check (insurance / financial issuer adaptation):** Niva Bupa is a Financial issuer — a revenue-TAM ceiling test is not meaningful for a bank or insurer; the relevant scale check is the addressable premium pool vs the company's own book. The Indian retail health insurance market is guided to grow at 17–19% CAGR over five years [Q4 FY26 transcript, CEO]; at the FY26 GWP base of ₹9,433 crores and a 10.1% retail market share, the company is already a significant player. A 49% peak ROE is not a market-share problem — it is a structural economics problem: no health insurer at any meaningful scale has produced 49% ROE because underwriting profitability in health insurance is structurally bounded by loss ratios (currently 66–68% of premiums), regulatory EOM caps, and investment yields. Even capturing 100% of incremental industry growth would not produce the magnitude of return embedded in the price — the constraint is economics, not addressable market size. This is not a case where the company might run out of market; it is a case where the implied return on capital exceeds anything the business model of health insurance has ever generated.

---

## 4. Robustness

### 4a. Cost of Equity (Ke) sensitivity

| Cost of Equity (Ke) | Implied Peak ROE to Justify INR 84.03 |
|---|---:|
| 11.87% (−1pp from base) | 47.3% |
| **12.87% (base — from `04`)** | **48.9%** |
| 13.87% (+1pp from base) | 50.4% |

*Solver: bisection on each Ke variant; all three roots converged to within INR 1 mn of target.*

### 4b. Book equity (BV₀) base sensitivity

| BV₀ Scenario | BV₀ Used (INR mn) | Implied Peak ROE |
|---|---:|---:|
| BV low (−10% from Capital IQ: normalisation haircut scenario) | 32,242 | 51.7% |
| **BV base (Capital IQ FY26 as-filed)** | **35,824** | **48.9%** |
| BV high (+10%: if Capital IQ understates equity) | 39,407 | 46.3% |

**Which input dominates?** The implied peak ROE is highly insensitive to the cost of equity (a ±1pp change in Ke shifts the implied peak ROE by only ±1.6pp) but moderately sensitive to the BV₀ base (a ±10% change in BV₀ shifts the implied peak ROE by ±2.6pp). The dominant finding — that the required peak ROE is approximately 47–52% across the entire grid — is robust across all tested inputs. The key binding constraint is the 4.33× price-to-book ratio: as long as the market pays this premium, no reasonable combination of Ke and BV₀ brings the implied ROE into achievable territory.

### 4c. Terminal ROE sensitivity

*Note: In the RI model, the terminal value concept works differently from a Gordon-growth FCFF DCF — the "terminal value" is zero when ROE = Ke, and non-zero when there is a persistent excess return. Varying terminal ROE therefore tests whether assuming a small persistent excess return materially reduces the implied peak ROE needed over the horizon.*

| Terminal ROE Assumption | Implied Peak ROE |
|---|---:|
| 0.97 × Ke (mild terminal underperformance) | 50.9% |
| **1.00 × Ke (base — no moat)** | **48.9%** |
| 1.03 × Ke (small persistent excess: moat evidence required) | 47.0% |

Even assuming a small perpetual excess return (terminal ROE = 1.03 × Ke, a scenario the "no moat proven" verdict from `09_moat.md` does not support), the required peak ROE is still 47.0% — entirely outside the range of achievable outcomes.

**Summary:** The implied peak ROE of ~47–52% across the entire robustness grid sits 2.6–3.1× above management's own most optimistic scenario ("mid- to high-teens ROE by FY29"), and 2.6–2.9× above the best ROE any named peer in the sector has achieved. No combination of discount-rate assumptions or book-equity haircuts closes this gap.

---

## 5. What's-Priced-In Read

At INR 84.03, the market is pricing in a peak ROE of approximately **49%** by FY30 — a level that is nearly three times the company's own guided "mid- to high-teens" ROE target and more than twice the best ROE observed anywhere in the Indian health insurance sector. That expectation is **aggressive to the point of being financially implausible**: the structural economics of health insurance — loss ratios above 60%, regulated EOM caps, and investment yields of 7% — place an effective ceiling on ROE well below what the price requires. The forward DCF from `04` independently confirmed this: the base-case intrinsic value is INR 19.94 per share (INR 15.4–25.7 across the full bull/base/bear grid), and the current price exceeds every cell in the 9-cell sensitivity grid by more than 3×. The reverse-DCF confirms that the path from current price back to fundamental value requires not just executing management's ambitious targets, but exceeding them by a factor that has no precedent in this sector or any named peer — implying that the implied expectations are not merely a stretch, they are structurally unachievable.

---

## Self-Check

- [x] Price (INR 84.03) and market cap (INR 155,267 mn) taken from `01_price-and-capital-structure.md` verbatim; price-state is `pool-verified` — agent ran as required.
- [x] Business type is Financial issuer (health insurer); equity-direct RI model inverted, not FCFF/EV; consistent with MODULE_RULES Business-Type Map.
- [x] Ke (12.87%), BV₀ (INR 35,824 mn), model structure (10-year horizon, mid-year convention, zero payout, fade to terminal ROE = Ke), and discounting convention taken from `04_intrinsic-dcf.md` verbatim — no independent WACC or base re-derived.
- [x] Solve executed via Python bisection (Bash); command and root shown in §2 (converged to INR 0.6 mn of target).
- [x] Implied peak ROE (48.9%) compared against company history (through-cycle ROE 6–8%, FY26 = 10.7%), management guidance ("mid- to high-teens" by FY29), and peer benchmarks (ICICI Lombard 17.8%, Star Health 13.1%).
- [x] Achievable/No judgement is evidence-backed (cited history, guidance, peer data).
- [x] Robustness shown across Ke (±1pp) AND BV₀ base (±10%) AND terminal ROE (±3% of Ke); dominant input named (BV₀ > Ke in sensitivity, but both confirm the same implausibility verdict).
- [x] All three robustness re-solves executed via bisection; roots shown.
- [x] Market-ceiling sanity check adapted for Financial issuer (premium pool / addressable market substitute noted; structural economics constraint identified as the binding issue, not market size).
- [x] No banned phrases.

---

*Sources used:*
- `analyses/NIVABUPA_2026-06-22/valuation/01_price-and-capital-structure.md` — price (INR 84.03, pool-verified), market cap (INR 155,267 mn), shares (1,847.757 mn), net debt (INR 1,954.1 mn).
- `analyses/NIVABUPA_2026-06-22/valuation/04_intrinsic-dcf.md` — Ke (12.87%), BV₀ (INR 35,824 mn), model structure, terminal ROE assumption, discounting convention (all used verbatim).
- `analyses/NIVABUPA_2026-06-22/earnings/01_historical-financials.md` — FY26 EBIT, PAT, CFO base and growth history; accounting notes.
- `analyses/NIVABUPA_2026-06-22/earnings/07_earnings-sensitivity.md` — achievable ROE / EOM / combined ratio ranges.
- `analyses/NIVABUPA_2026-06-22/earnings/04_guidance-consensus.md` — management ROE guidance ("mid- to high-teens by FY29"); industry growth guidance (17–19% CAGR).
- `analyses/NIVABUPA_2026-06-22/business-model/09_moat.md` — "No moat proven" verdict; peer ROE benchmarks (ICICI Lombard 17.8%, Star Health 13.1%).
- Capital IQ Financials.xls (NSEI:NIVABUPA), FY2026 ("Latest Filings" restatement), vendor tier §4 tier 5.
- Q4 FY26 Earnings Call transcript, May 8 2026 — management ROE guidance, combined ratio target.
