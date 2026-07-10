# Reverse DCF — What's Priced In — AMZN

**Reporting standard:** US GAAP. **Currency:** USD (millions unless stated). **Fiscal year end:** December 31. **Price-state:** `pool-verified` — price is unlocked for all price-relative scoring. **Business type:** Operating company — FCFF / EV model applies (not DDM or NAV).

**Model note.** This reverse-DCF inverts the SAME model as `04_intrinsic-dcf.md` verbatim: identical WACC (10.37%), normalized NOPAT base ($66,577M), terminal growth rate (3.5%), horizon (10 years), and mid-year discounting convention. The only change is direction: instead of forecasting FCF growth to derive a fair value, it holds the price fixed and solves for the NOPAT CAGR the current EV requires. An independent WACC re-derivation or a different FCF base would make the two non-comparable and produce opposite verdicts on the same stock — this agent does neither.

**Discounting convention (from 04):** Mid-year (t − 0.5) for explicit-period FCFs; terminal value discounted at t = 10 (end of period).

---

## 1. Inputs

| Input | Value | Source |
|---|---:|---|
| Current price | $238.34 | Capital IQ Key Stats, July 1, 2026 last close; 3-way cross-confirmed [01_price-and-capital-structure.md §1] |
| Enterprise value (EV) | $2,656,300M | Market cap $2,563,849M + total debt (broad) $235,540M − cash & ST investments $143,089M [01 §4, Capital IQ Capital Structure Summary, Mar-31-2026] |
| Net debt (broad basis — canonical) | $92,451M | Total debt including lease liabilities $235,540M − cash $143,089M [01 §5] |
| Diluted shares | 10,874M | Q1 2026 diluted weighted-average [01 §2, Form 10-Q Q1 2026] |
| FCF (NOPAT) base — normalized | $66,577M | Normalized NOPAT: adjusted EBIT $84,275M × (1 − 21%) = $66,577M; taken verbatim from [04_intrinsic-dcf.md §1]. Adjustment removes $4,300M in FY2025 one-time charges (FTC settlement $2,500M + severance $1,800M). |
| Discount rate (WACC) | 10.37% | Taken verbatim from [04_intrinsic-dcf.md §3]: ke = 11.04% (rf 4.54% + beta 1.46 × ERP 4.45%), equity weight 91.6%, kd after-tax 3.09%, debt weight 8.4%. |
| Terminal growth rate (g) | 3.5% | Taken verbatim from [04_intrinsic-dcf.md §5]. |
| Forecast horizon | 10 years (FY2026–FY2035) | Taken verbatim from [04_intrinsic-dcf.md §2]. |
| Terminal value as % of EV (from 04) | 79.9% | [04_intrinsic-dcf.md §5] — terminal-dominated; terminal g robustness is mandatory per instructions. |

---

## 2. Implied Expectations

**What was held fixed:** WACC (10.37%), terminal growth rate (3.5%), 10-year horizon, mid-year discounting, normalized NOPAT base ($66,577M as Year 0), net debt (broad, $92,451M), and diluted shares (10,874M) — all identical to 04.

**What was solved for:** The constant NOPAT (FCF proxy) CAGR over the 10-year explicit period that makes the present value of all cash flows equal to the current EV of $2,656,300M.

**Solver executed (bisection, Python):**

```python
# bisect(): finds g_fcf such that dcf_ev(g_fcf) = $2,656,298M
# dcf_ev: PV of NOPAT * (1+g)^i discounted mid-year, plus Gordon terminal at t=10
# WACC=10.37%, g_terminal=3.5%, T=10, NOPAT_base=$66,577M
implied_g = bisect(obj, lo=0.01, hi=0.80)
# → 16.40%
# EV at root: $2,656,298M (target $2,656,298M — $2M rounding vs 01 anchor of $2,656,300M)
```

**Root returned: 16.40% NOPAT CAGR over 10 years.**

| What the Price Implies | Solved Value |
|---|---:|
| Implied NOPAT CAGR over the 10-year horizon | **16.40%/yr** |
| Implied NOPAT at Year 10 (FY2035) at 16.4% CAGR | **$304B** (vs 04 base of $207B at ~13% NOPAT CAGR from base) |
| Implied years of 15%-growth then 3.5% perpetuity | **12 years** (if growth falls to 3.5% after 12 years, current EV is justified) |
| Implied years of 20%-growth then 3.5% perpetuity | **8 years** |
| Implied years of 25%-growth then 3.5% perpetuity | **6 years** |
| Implied revenue at FY2035 (NOPAT margin held at 9.3%) | **$3.27T** (vs 04 explicit forecast of $2.01T; vs FY2025 actual of $0.72T) |

**What the base case in 04 implies by comparison:** 04 used an explicit FCF path (with negative FCFs in FY2026–FY2028) and a terminal g of 3.5%, producing a Gordon DCF value of $104/share — implying the forward model's explicit FCF path grows at an effective rate well below what the market is pricing. The current price of $238.34 is 128% above the Gordon fair value. The reverse-DCF quantifies the gap: the market requires 16.4% NOPAT CAGR (annually, for 10 years), versus the ~12–13% effective NOPAT CAGR embedded in 04's explicit path.

---

## 3. Implied vs Achievable

| Implied Requirement | Company History | Earnings-Module Evidence | Achievable? |
|---|---|---|---|
| **NOPAT CAGR 16.4%/yr for 10 years** | Revenue CAGR FY2021–FY2025: 11.1%. NOPAT (normalized) CAGR FY2021–FY2025: ~36%, but this was a recovery from the FY2022 trough (EBIT margin 2.6% → 11.2%). On a stable-base to stable-base comparison, the organic trend is 11–12%/yr revenue with margin expansion adding 4–5pp of NOPAT growth annually in the recovery years — a non-repeating tailwind. | AWS revenue growth at 28% YoY (Q1 2026) is the single largest driver. D&A step-up from the $170B+ annualized capex program is the single largest risk (ranked #1 by absolute EBIT swing, ~$7.1B avg EBIT impact; [07_earnings-sensitivity.md §3]). Consensus FY2026 revenue is $823B (+14.9% YoY); FY2027 $931B (+13.0%) [04 §2]. | **Stretch** — achievable for 3–5 years (AWS at 28% growth, advertising at 22% growth, margin recovery); sustaining 16%+ NOPAT CAGR for a full 10-year horizon with a $3.27T implied revenue endpoint is a higher bar |
| **NOPAT reaching $304B by FY2035** | FY2025 normalized NOPAT $66,577M — a 4.6× increase over 10 years at 16.4% CAGR | 04's explicit base case reaches $207B NOPAT at FY2035 (~13% NOPAT CAGR). Getting to $304B requires either higher revenue growth or materially higher margins than 04's 16.5% terminal EBIT margin. | **Stretch to No** at the point-estimate level; achievable in an AWS-dominance scenario with Trainium margin advantage materializing |
| **Revenue reaching $3.27T by FY2035** | FY2025 revenue $716.9B; 04 forecasts $2.01T by FY2035 at ~11% blended revenue CAGR | Consensus FY2026 $823B implies 14.9% growth. If the 16.4% CAGR is sustained, revenue reaches $3.27T — $1.26T above 04's explicit forecast. The gap is the margin of "premium above the base case" the market is embedding. | **Aggressive** — $3.27T is ~4.6× FY2025 revenue and ~2.4T above the current US e-commerce + cloud market combined. This is not impossible but requires Amazon to expand into meaningfully new revenue streams (AI services, physical grocery, healthcare, advertising) at scale within the decade. |

**Judge in 2–4 sentences.** At $238.34, the market is not simply pricing a continuation of FY2025 momentum — it is pricing 16.4% annual NOPAT growth for a full decade, which on a constant-margin assumption requires Amazon to reach $3.27T in revenue by FY2035. This is $1.26T above the explicit base case in 04, which already assumes 8–15% revenue growth and margin expansion to 16.5%. Historical revenue CAGR (11.1%, FY2021–FY2025) is materially below the implied rate; the FY2022–FY2025 NOPAT recovery (84.8% CAGR, recovering from near-zero margins) is not a repeatable benchmark and should not be used to justify 16%+ NOPAT growth from a normalized base. The earnings module identifies AWS revenue growth versus D&A step-up timing as the central swing variable — if AWS grows at 28%+ and D&A is absorbed, the near-term 3–5 year NOPAT trajectory is plausible at 15–20%. The market's implied requirement is fair for a 3–5 year view but **aggressive for a full 10-year horizon**, particularly because: (a) the revenue endpoint is very large relative to plausible TAM, and (b) a narrow moat verdict (09_moat.md §5) means ROIC should fade toward WACC in the terminal years rather than sustain substantial excess returns — which is precisely what g = 3.5% already assumes, meaning the burden falls entirely on the FCF growth rate itself.

**Market-ceiling sanity check (one-directional — can only raise the bar).**

The implied endpoint revenue of $3.27T by FY2035 must be compared to the addressable market. Amazon operates across three large markets: (1) global e-commerce + retail (estimated ~$6–9T by 2035 at historical growth rates, web-sourced — unverified), (2) global cloud infrastructure (estimated ~$1.5–2T by 2035, web-sourced — unverified), and (3) digital advertising (estimated ~$800B–$1.2T by 2035, web-sourced — unverified). These are rough, cited-with-caveats estimates from unverified web sources; they cannot be treated as firm numbers (market-sizing is a low-tier input per CLAUDE.md §4). Taking the addressable markets at face value, $3.27T of Amazon revenue by FY2035 implies continued leadership across all three markets simultaneously at an average share approximating their current positions scaling. The numbers do not show an impossible share (>100% of any single market), so the market-ceiling test does not flip the implied growth from aggressive to unachievable on market-size grounds alone. However, $3.27T is a large number that requires consistent execution across e-commerce, cloud, advertising, and new verticals (healthcare, grocery, AI services) with no significant competitive displacement in any of them over a decade. This is possible, not certain. The market-ceiling check confirms the implied growth is aggressive — it neither kills nor definitively validates it. Given the low quality of the TAM estimates, this check is informational, not decisive; the earnings-module evidence is the more reliable guide.

---

## 4. Robustness

**Solver commands and roots for each scenario (all executed, roots shown):**

```python
# WACC robustness:
bisect(lambda g: dcf_ev(g, wacc=0.09368) - TARGET_EV, -0.10, 1.0)  → 13.99%
bisect(lambda g: dcf_ev(g, wacc=0.10368) - TARGET_EV, -0.10, 1.0)  → 16.40%
bisect(lambda g: dcf_ev(g, wacc=0.11368) - TARGET_EV, -0.10, 1.0)  → 18.62%

# FCF base robustness (NOPAT proxy):
bisect(lambda g: dcf_ev(g, NOPAT0=11_194)  - TARGET_EV, -0.60, 3.0)  → 41.75%
bisect(lambda g: dcf_ev(g, NOPAT0=66_577)  - TARGET_EV, -0.10, 1.0)  → 16.40%
bisect(lambda g: dcf_ev(g, NOPAT0=76_564)  - TARGET_EV, -0.10, 1.0)  → 14.50%

# Terminal g robustness (TV=79.9% >60% threshold):
bisect(lambda g: dcf_ev(g, terminal_g=0.030) - TARGET_EV, 0.01, 1.0)  → 17.05%
bisect(lambda g: dcf_ev(g, terminal_g=0.035) - TARGET_EV, 0.01, 1.0)  → 16.40%
bisect(lambda g: dcf_ev(g, terminal_g=0.040) - TARGET_EV, 0.01, 1.0)  → 15.69%
```

### WACC Sensitivity

| Discount Rate | Implied NOPAT CAGR to Justify Price |
|---|---:|
| WACC − 1pp = 9.37% | 13.99% |
| WACC (base) = 10.37% | **16.40%** |
| WACC + 1pp = 11.37% | 18.62% |

The spread across a 2pp WACC range is 4.6pp of implied growth rate — meaningful but not the dominant swing factor.

### FCF Base Sensitivity

The FCF base is the dominant swing input. A factor of 6.8× between the low base (company FCF $11.2B) and the base (normalized NOPAT $66.6B) causes a 25pp swing in implied growth (41.75% vs 16.40%), dwarfing the WACC effect (4.6pp). The base case in 04 — and therefore in this analysis — uses the normalized NOPAT ($66,577M), which strips the $4,300M in one-time charges and taxes at the 21% structural rate. This is the correct base for a reverse-DCF that inverts 04.

| FCF / NOPAT Base | Value | Implied NOPAT CAGR |
|---|---:|---:|
| Low — company-disclosed FCF FY2025 [earnings/01_historical-financials.md §1] | $11,194M | **41.75%** |
| Base — normalized NOPAT from 04 (EBIT adj. × 79%) [04_intrinsic-dcf.md §1] | $66,577M | **16.40%** |
| High — normalized NOPAT ×1.15 (optimistic normalization) | $76,564M | **14.50%** |

**Most sensitive input: the FCF base, by a wide margin.** A low company FCF base ($11.2B) implies a growth rate (41.75%) that is clearly unachievable and confirms that the company FCF is not the right base for valuation (it reflects a temporary FCF trough caused by AI capex, not normalized earnings power). The analysis is most informative at the normalized NOPAT base of $66.6B (consistent with 04), where the implied growth is 16.4%.

### Terminal Growth Rate Sensitivity (mandatory — TV = 79.9% of EV)

Terminal value is 79.9% of EV in 04's base case, well above the 60% threshold. This makes the reverse-DCF highly sensitive to the assumed terminal growth rate.

| Terminal g | Implied NOPAT CAGR |
|---|---:|
| g = 3.0% (−0.5pp) | 17.05% |
| g = 3.5% (base) | **16.40%** |
| g = 4.0% (+0.5pp) | 15.69% |

The terminal g range of ±0.5pp shifts the implied growth requirement by 1.4pp — meaningfully less than the FCF base shift, but comparable to the WACC ±1pp effect. At g = 4.0% (implying Amazon grows at US nominal GDP rate perpetually, a stronger moat assumption), the implied growth requirement falls slightly to 15.7%, which is marginally easier but still well above the 11% historical revenue CAGR. The 04 terminal g of 3.5% is the appropriate base for a narrow-moat business where ROIC is expected to converge toward WACC.

**Dominant input by sensitivity magnitude: FCF base >> WACC ≈ terminal g.** Any analysis of what is priced in for AMZN must first be clear on what normalized FCF base is used; WACC and terminal g effects are secondary.

---

## 5. What's-Priced-In Read

At $238.34, the market is pricing in 16.4% annual NOPAT growth for 10 years (FY2026–FY2035), implying NOPAT reaching $304B and revenue reaching $3.27T by FY2035 on a constant-margin assumption. That is **aggressive** relative to the company's actual historical revenue CAGR of 11.1% (FY2021–FY2025) and to the explicit base case in 04, which models only $2.01T of revenue at FY2035 — yet the current price is 128% above the Gordon DCF fair value. The key bull argument the market is embedding is that the AWS AI infrastructure buildout (28% revenue growth, $364B backlog) compounds with advertising and margin expansion to deliver above-historical-average FCF growth for the next decade; the key risk is that the AI capex wave ($170B+ annualized) generates a D&A headwind that compresses NOPAT growth below the 16% implied rate during the FY2026–FY2028 period — precisely the window identified by the earnings sensitivity module as the single highest-risk variable (D&A step-up ranked #1 by EBIT impact). If the implied growth of 16.4% is below what Amazon can plausibly deliver (a scenario requiring AWS acceleration, advertising compounding, and Trainium margin benefits all materializing together), the current price is fair; if the D&A timing mismatch and the large implied revenue endpoint prove harder to reach, the current price embeds downside.

---

*Sources:*
- Price and EV: [01_price-and-capital-structure.md §1, §4, §7 — Capital IQ Key Stats and Capital Structure Summary, Mar-31-2026 / Jul-1-2026]
- WACC, normalized NOPAT base, terminal g, discounting convention: [04_intrinsic-dcf.md §1, §3, §5] — taken verbatim; no independent re-derivation.
- Historical FCF and revenue data: [earnings/01_historical-financials.md §1, §2]
- Sensitivity variables and rankings: [earnings/07_earnings-sensitivity.md §2, §3]
- Moat verdict and ROIC: [business-model/09_moat.md §5]
- Risk-free rate, ERP (web-sourced, unverified, per 04): tradingeconomics.com (10-yr Treasury Jul 10, 2026); Damodaran US ERP July 2026 update — elitecurrensea.com
