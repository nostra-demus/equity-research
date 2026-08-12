# Reverse DCF — What's Priced In — DHER (Delivery Hero SE)

**Business type: Operating** (per `04_intrinsic-dcf.md` and `business-model/02_business-identity.md`) — this reverse-DCF inverts an FCFF (free cash flow to the firm) model, not a bank/REIT equity-direct model.

**Deal-contamination flag — read this before the numbers below.** DHER is the subject of a live, announced Uber acquisition offer (M&A call, 2026-07-16), with no fixed offer price disclosed anywhere in the pool. The current price (€37.20, 2026-08-07) is therefore not a clean read of standalone fundamentals — it embeds the market's assessment of deal-completion odds and an unspecified assumed premium. **A reverse-DCF solved off €37.20 is really solving for a blend of (a) deal-completion probability and (b) whatever standalone growth/margin assumptions the market separately holds — the two cannot be disentangled without a disclosed offer price, and this agent does not attempt to.** Per the orchestrator's instruction, this report solves what BOTH the current deal-contaminated price (€37.20) and the pre-announcement price (€15.73, 2026-03-26) imply, and treats the gap between the two solves as the deal-premium effect rather than a standalone-fundamentals signal.

This agent inverts the SAME model as `04_intrinsic-dcf.md`: same WACC (7.45%), same terminal growth (3.0%), same 7-year explicit horizon (FY2026–FY2032), same mid-year discounting convention for explicit cash flows and end-of-year discounting for the terminal value. Only the growth/margin assumption is solved for.

## 1. Inputs

| Input | Value | Source |
|---|---:|---|
| Current price (deal-contaminated) | €37.20 (2026-08-07) | `01_price-and-capital-structure.md` §1, pool-verified |
| Pre-announcement price | €15.73 (2026-03-26) | `01_price-and-capital-structure.md` §1, Capital IQ Historical Capitalization tab |
| Shares (latest basic, used for both) | 303.744978m | `01` §2 |
| Net debt (strict, FY2025) | €2,512.8m | `01` §5 |
| Minority interest | €154.2m | `01` §4 |
| EV @ current price | €13,966.3m (= mkt cap €11,299.3m + net debt + minority) | Reproduces `01`'s own EV bridge exactly |
| EV @ pre-deal price | €7,444.9m (= mkt cap €4,777.9m + net debt + minority) | This agent's calc — uses the SAME FY2025 net debt/minority, which is a defensible pairing since Dec-31-2025 balance-sheet net debt is close in time to the 2026-03-26 pre-deal quote (that quote is the FY2025 results-filing date) |
| FCF base (year 0, FY2025 normalized) | €274.7m | This agent's calc, built on `04`'s own normalized-NOPAT methodology: Adjusted EBITDA €903.0m − D&A €365.5m − SBC €224.1m = Normalized EBIT €313.4m; NOPAT = €313.4m × (1−25%) = €235.0m; FCF = NOPAT + D&A − Capex (€325.8m) − ΔNWC (set to 0 for the static base year) = €274.7m |
| Discount rate (WACC) used | **7.45%**, taken verbatim from `04_intrinsic-dcf.md` §3 (CAPM k_e 8.20% [rf 3.20% + β1.2 × ERP 4.17%], after-tax k_d 5.62%, blended at market-value weights 70.95%/29.05% equity/debt) | `04` §3 — NOT re-derived here |
| Terminal growth (g) | **3.0%**, taken verbatim from `04` §5 (euro-area long-run nominal-GDP proxy) | `04` §5 |
| Forecast horizon | 7 years (FY2026–FY2032) + Gordon-growth terminal | `04` §2, §5 |
| Discounting convention | Mid-year (t−0.5) for explicit FCFs; full-year (t=7) for the terminal value | `04` §4–§5, held identical here |

**What is held fixed vs. solved for.** WACC, terminal g, the 7-year horizon, the discounting convention, and the FY2025 normalized FCF base are all held fixed at `04`'s values. The single free variable in the primary solve is a constant annual FCF growth rate applied for 7 years; two secondary solves instead hold the growth SHAPE fixed (either `04`'s own revenue growth path, or a fixed high-growth phase followed by a drop to terminal g) and solve for margin or the number of high-growth years instead.

## 2. Implied Expectations

**Solver: `scipy.optimize.brentq` root-find, executed via Python (`/tmp/dher_reverse_dcf.py`), not hand-computed.** Full runs and outputs below.

Primary solve — model: `FCF_t = FCF_base × (1+g)^t` for t = 1..7, discounted at WACC (mid-year), plus a Gordon-growth terminal value (`TV = FCF_7 × (1+3.0%) / (7.45% − 3.0%)`, discounted at t = 7) — solved for the constant `g` that reproduces the target EV:

```
def ev_from_g(g, fcf0, wacc=0.0745, tg=0.03, n=7):
    pv = 0.0; fcf_t = fcf0; fcf_list = []
    for t in range(1, n+1):
        fcf_t = fcf0 * (1+g)**t
        fcf_list.append(fcf_t)
        pv += fcf_t / (1+wacc)**(t-0.5)
    TV = fcf_list[-1] * (1+tg) / (wacc - tg)
    return pv + TV/(1+wacc)**n
# brentq(lambda g: ev_from_g(g, 274.7) - target_EV, ...)
```

Roots returned:
- **EV target €13,966.3m (current price €37.20): g = 16.47%**
- **EV target €7,444.9m (pre-deal price €15.73): g = 5.49%**
- Check: `ev_from_g(0.1647, 274.7)` = €13,966.3m ✓ (PV explicit €2,787.7m + PV terminal €11,178.6m; terminal = 80.0% of this reverse-solved EV, close to `04`'s own 78.1%)

Cross-check against `04`'s own (non-uniform, margin-expanding) forecast: `04`'s own FCF path implies a 6-year FY26→FY32 CAGR of `(713.9/258.5)^(1/6) − 1 = 18.45%` — a higher headline CAGR than the 16.47% smooth solve above, yet it produces a LOWER value (€33.31/share) than €37.20. This is because `04`'s growth is back-loaded (FY26 FCF conversion is deliberately depressed, ramping up over time), whereas the uniform 16.47% solve front-loads more cash into the earlier, less-discounted years — the two are not contradictory, they are different growth SHAPES with the same net effect measured differently. **Flagged, not glossed over.**

Secondary solve — implied steady-state Adjusted EBITDA margin, holding `04`'s own revenue growth path fixed (11.3%→9.0%→8.0%→7.0%→6.0%→5.0%→4.0%, terminal 3.0%) and its D&A%/SBC%/capex%/ΔNWC schedule fixed, solving for a single constant margin `m` applied to all 7 years:

```
=== SECONDARY SOLVE ===
Implied steady-state Adj. EBITDA margin @ current price: 7.48%
Implied steady-state Adj. EBITDA margin @ pre-deal price: 5.44%
Reference points: FY2025 actual = 6.4%; 04's own (capped) terminal margin = 7.2%; FY2026 guidance midpoint = 5.97%
```

Tertiary solve — fade model: N years at a high growth rate before dropping straight to terminal g (3.0%):

```
=== TERTIARY SOLVE ===
At 15% growth phase: EV at N=0 yrs = €6,419.0m; EV at N=7 yrs (all years at 15%) = €12,869.5m
Current-price target (€13,966.3m) EXCEEDS the full-horizon 15% case
  -> the current price requires MORE than 15% growth sustained through the ENTIRE 7-year window
At 20% growth phase: implied years @ current price = 6.00 yrs (of 7); @ pre-deal price = 1.00 yr (of 7)
At 15% growth phase: implied years @ pre-deal price = 2.00 yrs (of 7)
```

| What the Price Implies | Current price (€37.20) | Pre-deal price (€15.73) |
|---|---:|---:|
| Implied FCF CAGR over the 7-year horizon (primary) | **16.47%** | **5.49%** |
| Implied steady-state Adj. EBITDA margin (secondary, `04`'s revenue path held fixed) | 7.48% | 5.44% |
| Implied years of above-GDP growth (tertiary, fade model) | >7 yrs at 15%/yr (undershoots even at full horizon); ≈6.0 yrs at 20%/yr | 2.0 yrs at 15%/yr; ≈1.0 yr at 20%/yr |

## 3. Implied vs Achievable

| Implied Requirement | Company History | Earnings-Module Evidence | Achievable? |
|---|---|---|---|
| Implied FCF CAGR = 16.47%/yr for 7 yrs (current price) | Revenue growth is decelerating every year — +46.5% (FY22) → +15.9% (FY23) → +23.7% (FY24) → +14.4% (FY25) → +11.3% (FY26 Street consensus) [`earnings/01_historical-financials.md` §1, §6]. Adjusted EBITDA growth decelerated even more sharply: +173% (FY24 YoY) → +30% (FY25 YoY) [`earnings/01` §1] | FY2026 Street EBITDA estimates were cut ~30% over the trailing 12 months (€1,366m → €952m) [`earnings/04_guidance-consensus.md` §4]; the single largest earnings-sensitivity variable, rider-cost inflation with no disclosed pass-through, has a bear case of −€344.5m — 38% of FY2025 Adjusted EBITDA — in one regulatory outcome [`earnings/07_earnings-sensitivity.md` §2, §6]; group ROIC (0.8%–1.6% best year, ≈−6.1% through-cycle) sits 900–1,700bps below the company's own disclosed 10.7%–13.7% cost of capital — "No moat proven" [`business-model/09_moat.md` §3] | **Stretch / No** |
| Implied FCF CAGR = 5.49%/yr for 7 yrs (pre-deal price) | Sits well below even the already-decelerating trend (FY26 guide 11.3% revenue growth alone) | Consistent with a company that has tracked its own Adjusted EBITDA guidance closely for 3 straight years [`earnings/04` §6] | **Yes** |
| Implied steady-state Adj. EBITDA margin = 7.48% (current price) | FY2025 actual margin 6.4%, expanding but decelerating (+814bps→+800bps→+308bps→+79bps YoY, FY2021–FY2025) [`earnings/01` §6] | `04`'s OWN base case deliberately caps terminal margin at 7.2% — below even Uber's 10.7% EBIT margin and DoorDash's 5.3% — specifically because the moat module found no defensible advantage to justify going higher [`04_intrinsic-dcf.md` §2]. 7.48% sits just above that already-conservative cap | **Stretch** |
| Implied FCF CAGR = 5.44%-margin case (pre-deal) | Below FY2026 guidance midpoint (5.97%) | Achievable without assuming any moat-dependent margin breakout | **Yes** |

In 2–4 sentences: the market's implied expectations at the deal-contaminated €37.20 price (16.47% FCF CAGR for 7 straight years, or a steady-state margin above `04`'s own deliberately capped 7.2% ceiling) are **aggressive** — they require DHER's profit growth to reaccelerate against a trend that has been decelerating for two straight years, on a company that the moat module found earns below its own disclosed cost of capital and that carries a going-concern flag on a material subsidiary (Glovo Spain rider-classification risk, €440–770m contingent liability) [`business-model/01_disqualifier-scan.md` §2]. By contrast, the pre-announcement price (€15.73) implies only 5.49% FCF CAGR — comfortably inside the company's own recently-guided and closely-tracked trajectory, and closer to what the standalone evidence actually supports.

**Market-ceiling sanity check (one-directional).** Translating the 16.47% implied FCF CAGR into an implied revenue trajectory (holding the FCF/Revenue conversion ratio at `04`'s own terminal level of 3.13%) implies FY2032 revenue of roughly **$28.9bn** (from FY2025's ~$15.9bn, at the FY2025 average EUR/USD rate of 1.1306 used in `business-model/09_moat.md` §3). Against a **web-sourced** (Fortune Business Insights, accessed 2026-08-12, unverified, labelled per §4) global meal-delivery market of ~$350.6bn in 2026 growing at a stated 9.58% CAGR (implying ~$607bn by 2032), that implied revenue is only **~4.5%→4.8% of the addressable market** — a modest, plausible increment, not an implausible-share capture. **This check does NOT trip the market-ceiling kill signal** — it does not make the case for the implied growth, it simply confirms the aggressiveness identified above is a margin/competitive-durability problem (no proven moat, decelerating trend, regulatory tail risk), not a market-size problem. This is a low-tier, web-sourced, GMV-vs-revenue-approximated proxy and is treated as directional context only, not as evidence on its own.

## 4. Robustness

*All roots below from the same executed `brentq` solver as §2; full script output in `/tmp/dher_reverse_dcf.py`.*

| Discount Rate | Implied FCF CAGR to Justify Current Price (€37.20) |
|---|---:|
| WACC −1% (6.45%) | 11.77% |
| WACC (7.45%) | **16.47%** |
| WACC +1% (8.45%) | 20.49% |

**FCF-base stress (derived from `earnings/07_earnings-sensitivity.md`'s own rider-cost bear/bull stress applied to the FY2025 Adjusted EBITDA base of €903.0m — the single highest-ranked earnings-sensitivity variable):**

| FCF Base Scenario | Adj. EBITDA | FCF Base | Implied FCF CAGR (current price, WACC 7.45%) |
|---|---:|---:|---:|
| Low (rider-cost bear, −€344.5m) | €558.5m | €16.4m | **77.21%** |
| Base (FY2025 actual) | €903.0m | €274.7m | **16.47%** |
| High (rider-cost bull, +€140.6m) | €1,043.6m | €380.2m | **10.71%** |

**Terminal g ±0.5% (mandatory — terminal value is 78.1% of EV in `04`'s base case, above the 60% trigger; base FCF and WACC held at base):**

| Terminal g | Implied FCF CAGR (current price) |
|---|---:|
| 2.5% | 18.07% |
| 3.0% (base) | **16.47%** |
| 3.5% | 14.68% |

**Which input dominates.** The FCF-base swing (from the rider-cost bear/bull range) moves the implied CAGR by **66.5 percentage points** (10.71%→77.21%) — a ~23x range in the underlying FCF base itself, since it starts from a small, near-zero normalized figure. The WACC ±1% swing moves the implied CAGR by only **8.7 percentage points** (11.77%→20.49%), and terminal g ±0.5% moves it by **3.4 percentage points** (14.68%→18.07%). **The FCF base — driven overwhelmingly by the single rider-cost/regulatory variable — is by far the dominant sensitivity, consistent with every other DHER valuation output in this run (`04`'s own base-vs-cross-check grid moved by more on the base/WACC axis than on g alone).** This is not a discount-rate story; it is a base-year-earnings-quality and regulatory-tail-risk story.

## 5. What's-Priced-In Read

At €37.20 (deal-contaminated), the market is pricing in roughly **16.5% annual FCF growth for 7 years**, or a steady-state Adjusted EBITDA margin above `04`'s own deliberately-capped 7.2% ceiling — **aggressive**, because it requires profit growth to reaccelerate against a two-year decelerating trend, on a business the moat module found earns below its own 10.7%–13.7% disclosed cost of capital, carries a going-concern flag on a material subsidiary, and has a single regulatory variable (rider-cost reclassification) capable of erasing 38% of Adjusted EBITDA in one outcome. This is not primarily a standalone-fundamentals read, though — €37.20 also embeds an undisclosed deal-completion premium, and this reverse-DCF cannot separate the two. At the pre-announcement price of €15.73, the market was pricing in only **~5.5% annual FCF growth** — comfortably **conservative to fair** against the company's own guided and closely-tracked trajectory. The gap between the two solves (16.5% vs. 5.5%) is the clearest quantification available in this pool of how much of the post-announcement re-rate is deal-completion odds/premium rather than a standalone re-rate of DHER's own prospects — and `04`'s own base-case intrinsic value (€33.31/share, itself 10.5% below €37.20) corroborates that the standalone case does not support the current price without the deal.
