# Reverse DCF — What's Priced In — CRM

*Salesforce, Inc. (NYSE: CRM). US/SEC filer, US GAAP, USD millions unless stated. Fiscal year ends January 31 — "FY26" = 12 months ended Jan-31-2026; "LTM" = 12 months ended Apr-30-2026 (through Q1 FY27). As-of date: 2026-06-08.*

**This agent solves backwards: it starts from today's price and finds the free-cash-flow growth the price already requires, then judges whether that bar is achievable.** It does not produce a forward fair value (that is `04_intrinsic-dcf`) and it makes no Buy/Sell call. It runs in parallel with `04`, so it builds its OWN discount rate with the same method rather than reading `04`'s; the synthesizer reconciles any gap.

**Business type = Operating company** (recurring-subscription enterprise software) [business-model/02_business-identity.md, §3]. Per the Business-Type Method Map (MODULE_RULES.md), the correct reverse model is an **FCFF / enterprise-value model discounted at WACC** — solve for the growth that sets the present value of future free cash flow equal to today's enterprise value. This is not a Financial or REIT issuer, so no DDM / equity-direct reversal is used.

**Headline finding up front.** At $185.66, the enterprise value of ~$182.8B requires Salesforce's free cash flow to grow only about **+0.9% a year, forever** (single-stage), or to *fall* about 4.5% next year and limp along at a ~−0.8% ten-year rate before settling at 3% (two-stage fade). Both are **below** the ~3% long-run economy growth rate, far below the company's ~28% four-year FCF history, and below even its own cut FY27 cash-flow guide of +4–5%. The market is pricing in almost no growth. That makes the implied bar **conservative**.

---

## 1. Inputs

| Input | Value | Source |
|---|---:|---|
| Current price | $185.66 (2026-06-08, last close) | from `01_price-and-capital-structure.md` (Capital IQ comps "Day Close Price Latest") |
| Enterprise value (EV) | $182,767M (~$182.8B) | from `01` (ties to Capital IQ comps TEV $182,766.5M; market cap $152,056M + total debt $42,548M − cash $11,837M) |
| Net debt | $30,711M | from `01` (Apr-30-2026 — total debt − cash & ST investments) |
| Shares (per-share basis) | 819M | from `01` (Apr-30-2026; ≈ fully diluted) |
| FCF base (LTM to Apr-30-2026) | $14,661M | earnings/01, §2 (CFO $15,221M − capex $560M; FCF = CFO − capex per CLAUDE.md §15) |
| Discount rate (WACC) used | **9.0%** | built in the box below (web-sourced risk-free rate + ERP, labeled) |
| Forecast horizon | 10 years explicit + terminal | this agent's assumption; stated and held fixed across all solves |
| Terminal growth (gT) | 3.0% | long-run US nominal growth proxy (below WACC; passes MODULE_RULES.md WACC sanity bound) |

**FCF base choice.** The reverse-DCF is run on the **LTM FCF of $14,661M** (latest available, through Q1 FY27). FY26 FCF was $14,402M [earnings/01, §1]. The two are within 1.8% of each other, so the base-year choice does not move the implied-growth read. FCF here is the §15 definition (cash from operations minus all capex), not a management non-GAAP figure. **One caveat carried forward:** this LTM FCF still mostly predates the full cash interest cost of the ~$25B of new senior notes issued in Q1 FY27; management has guided FY27 FCF growth down to +4–5% precisely because that new interest is a real recurring cash drain (a financing artifact, not a demand signal) [earnings/04, §2]. So the *near-term* FCF growth rate is genuinely depressed — this matters for the achievability judgment in §3 and is not hidden.

### Discount rate (WACC) — built independently, same method as a DCF

`WACC = (E/V)·cost of equity + (D/V)·after-tax cost of debt`

| Component | Value | Basis |
|---|---:|---|
| Risk-free rate (10Y UST) | 4.55% | **Web-sourced, indicative, unverified** — 10-year US Treasury, 2026-06-05 close (etftrends.com Treasury snapshot). Labeled web per MODULE_RULES.md source rule. |
| Equity risk premium (ERP) | 5.0% | Mature-market convention (US implied ERP ~4.5–5.5%); a round 5.0% used and labeled as an assumption. *Inference / convention, not from filings.* |
| Beta | 1.15 | **Web-sourced, indicative, unverified** — CNBC quote page, June 2026. |
| Cost of equity | 4.55% + 1.15 × 5.0% = **10.30%** | CAPM |
| Pre-tax cost of debt | 5.4% | Salesforce is **S&P A+** rated [Capital IQ Credit Health Panel, Summary, LTM Apr-30-2026]. Fresh A+ paper ≈ risk-free + ~0.8–0.9% spread; legacy notes carry 1.5–3.7% coupons but the ~$25B of 2026-issued notes reset to market [Capital IQ Capital Structure Details, FY2026]. Blended marginal ≈ 5.4%. *Inference from rating + rate curve — labeled.* |
| Tax rate | 21% | US statutory federal rate |
| After-tax cost of debt | 5.4% × (1 − 0.21) = **4.27%** | |
| Capital weights | E = 78.1% ($152,056M), D = 21.9% ($42,548M) | market cap and total debt from `01` (Apr-30-2026) |
| **WACC** | **0.781 × 10.30% + 0.219 × 4.27% = 8.98% ≈ 9.0%** | executed and verified in Python |

This 9.0% is a defensible cost of capital for a high-investment-grade (A+) large-cap software business in a 4.5% rate world. The synthesizer should compare it to `04`'s independently-built WACC; a difference is expected and reconciled there. The robustness table in §4 re-solves at 8% and 10% so the read does not hinge on the exact rate.

---

## 2. Implied Expectations

**What was held fixed, what was solved for.** The discount rate (9.0%), the FCF base ($14,661M), the terminal growth (3.0%), and the horizon were all **held fixed**. The solver then found the **FCF growth rate** that makes the present value of all future free cash flow equal exactly to today's EV of $182,767M. This is a nonlinear root-find; it was computed with an **executed solver** — `scipy.optimize.brentq` — and independently cross-checked with a hand-rolled **bisection** loop (the two agreed to ~1×10⁻¹² in every case). Commands and roots are shown below.

| What the price implies | Solved value | Model |
|---|---:|---|
| Implied **perpetual** FCF growth (single-stage Gordon) | **+0.91% per year, forever** | EV = FCF₀·(1+g)/(WACC−g), solve g |
| Implied **year-1** FCF growth (two-stage fade) | **−4.50%** (FCF falls next year) | growth fades linearly from g₁ → 3% over 10y, then perpetuity; solve g₁ |
| Implied **equivalent flat 10-year FCF CAGR** (fade-adjusted) | **−0.78%** | geometric average of the fade path above |
| Implied **flat 10-year FCF CAGR** (no fade, then 3% terminal) | **−1.22%** | constant g for 10y then perpetuity; solve g |
| Implied **years of above-GDP (10%/yr) growth** | **≈ 0 years** (cannot be bracketed — see note) | price is already covered with no sustained above-GDP window |

**Plain-English meaning.** "Reverse-DCF" means working the present-value math backwards: instead of guessing growth to get a value, we take the value the market is paying and ask what growth must be true for that price to make sense. The answer for CRM: almost none. To justify $182.8B of enterprise value at a 9% discount rate, free cash flow only has to creep up about 0.9% a year forever — slower than the economy. On the stricter two-stage model (where high growth fades to 3%), the price implies FCF actually **shrinks** about 4.5% next year and runs slightly negative on average for a decade before flattening.

**Why the "years of above-GDP growth" solve returns ≈ 0.** The solver tried to find how many years of 10%-a-year FCF growth the price requires before fading to 3%. It could not bracket a positive root: even with **zero** years of above-GDP growth — i.e., FCF going straight to the 3% terminal path immediately — the present value already **exceeds** the EV. Two concrete benchmarks (executed) make this vivid:

- **If FCF simply grew at the 3% terminal rate forever**, CRM is worth `$14,661M × 1.03 / (0.09 − 0.03) = $251,680M` of EV — that is **37.7% above** today's $182.8B. The market is paying well *below* what flat-real, grow-with-the-economy cash flow is worth.
- **If FCF never grew at all (constant forever)**, the value is `$14,661M / 0.09 = $162,900M` — only **10.9% below** the current EV. So the price sits between "zero growth forever" and "3% growth forever," much closer to the no-growth end.

The implied bar is therefore not "modest growth"; it is "barely-positive-to-slightly-negative" cash flow. That is the entire point-in read.

### Executed solver — commands and roots

Primary solve (`scipy.optimize.brentq`, two-stage fade), with an independent bisection cross-check, run in a Python venv:

```
$ /tmp/rdcf_venv/bin/python /tmp/reverse_dcf_crm.py
WACC (base): WACC=9.00%
   brentq    g1 (year-1 FCF growth) = -4.4961%
   bisection g1 (cross-check)       = -4.4961%   | diff = 4.97e-13
   -> equivalent flat FCF CAGR over 10y (fade-adjusted) = -0.7769%
   PV check: total PV = $182,767M (target EV $182,767M) | TV = 53.8% of EV
Implied flat FCF CAGR for 10y (then 3% terminal) @ WACC 9.0% = -1.2219%
```

Single-stage Gordon implied perpetual growth (`brentq`):

```
$ /tmp/rdcf_venv/bin/python /tmp/reverse_dcf_crm_b.py
[Secondary B] Single-stage Gordon implied PERPETUAL FCF growth @ WACC 9.0%:
              g_perp = 0.9057%   (the one growth rate, forever, that prices the whole EV)
[Benchmark] FCF0 grows at gT=3% forever:  PV = $251,680M  -> EXCEEDS EV by +37.7%
[Benchmark] Zero growth forever:          PV = $162,900M  -> below EV by -10.9%
```

Both root-finders (brentq and an independent bisection) returned the same g₁ to ~1×10⁻¹², and the PV at the solved root reproduces the $182,767M EV target to the dollar — the solve is verified, not hand-computed.

---

## 3. Implied vs Achievable

| Implied requirement | Company history | Earnings-module evidence | Achievable? |
|---|---|---|---|
| Implied perpetual FCF growth ≈ **+0.9%/yr** (single-stage) | FCF CAGR FY22→FY26 = **+28.5%** ($5,283M → $14,402M); 3-yr (FY23→FY26) = **+31.6%**; 2-yr = **+23.1%** [earnings/01, §1] | Guided FY27 FCF growth **+4–5%** (level $14,978–15,122M); FY30 framework ~**11% revenue CAGR** FY26→FY30, "Rule of 50" by FY30 [earnings/04, §2] | **Yes — easily.** Implied bar is below the economy's growth rate and a fraction of both history and guidance. |
| Implied **year-1 FCF −4.5%** (two-stage fade) | LTM FCF grew **+1.8%** over FY26 [earnings/01, §2]; every prior year grew double digits | Guidance is for FCF to *rise* +4–5% in FY27, not fall [earnings/04, §2] | **Yes (the price asks for a decline the company does not expect).** Even the debt-depressed near-term guide is positive. |
| Implied **10-yr FCF CAGR ≈ −0.8% to −1.2%** | No 10-yr history of FCF decline; FCF rose every single year FY22–FY26 [earnings/01, §6] | Revenue decelerating but still **+9.6%** (FY26) and guided ~+11% subscription cc; cRPO +13% cc, the forward demand gauge, steady for three readings [earnings/02, §7; earnings/04, §2] | **Yes — the implied path is far below any demand or margin trajectory in the evidence.** |

**Judgment: the market's implied expectations are conservative — arguably very conservative.** Salesforce grew free cash flow at roughly **28% a year over four years** and at ~+1.8% in the most recent (debt-burdened) LTM, yet the price requires only ~**+0.9% a year forever**, which is below the ~3% long-run economy rate and below the company's own cut FY27 cash-flow guide of **+4–5%** [earnings/01, §1; earnings/04, §2]. Even the slowest forward driver in the evidence — revenue, decelerated to ~9–10% with cRPO pinned at ~13% constant currency for three straight readings [earnings/02, §7] — sits far above the implied FCF path. **The honest counter-weight:** near-term FCF growth is real-world depressed right now — the ~$25B of new debt adds recurring cash interest that cut the FY27 FCF-growth guide to +4–5% and could keep reported FCF growth in the low single digits for a year or two until the buyback's per-share benefit and continued operating growth outrun the interest drag [earnings/04, §2, §4]. So the gap between "implied" and "achievable" is widest against the long-run record and narrowest against the next 12 months — but even at its narrowest, guidance (+4–5%) clears the implied bar (~+0.9% perpetual / −0.8% ten-year).

---

## 4. Robustness

The implied growth at one higher and one lower discount rate, **all re-solved with the executed solver** (brentq, cross-checked by bisection). Two model framings are shown because they bracket the read.

| Discount rate | Implied perpetual FCF growth (single-stage Gordon) | Implied year-1 FCF growth (two-stage fade → 3%) |
|---|---:|---:|
| WACC − 1% (8.0%) | **−0.02%** | **−8.40%** |
| **WACC (9.0%)** | **+0.91%** | **−4.50%** |
| WACC + 1% (10.0%) | **+1.83%** | **−1.00%** |

**Read of the robustness.** The conclusion does not depend on the exact discount rate. Across an 8–10% WACC band, the implied **perpetual** FCF growth never rises above ~**+1.8%**, and the implied **year-1** growth stays **negative** in every case. Even at a punitive 10% cost of capital, the market is still pricing in perpetual FCF growth of under 2% — below the 3% economy rate and far below the company's history and guidance. There is no plausible discount rate inside this band at which today's price implies a demanding growth bar.

Executed re-solve output (single-stage robustness, abbreviated):

```
[Robustness] Single-stage Gordon implied perpetual FCF growth:
   WACC -1%  (WACC 8%): g_perp = -0.0201%
   WACC      (WACC 9%): g_perp = 0.9057%
   WACC +1%  (WACC 10%): g_perp = 1.8314%
```

```
[Robustness] Two-stage fade implied year-1 g1:
   WACC -1% (8%):  g1 = -8.3960%   (bisection check diff 1.9e-12)
   WACC    (9%):   g1 = -4.4961%   (bisection check diff 5.0e-13)
   WACC +1% (10%): g1 = -0.9997%   (bisection check diff 3.2e-13)
```

---

## 5. What's-Priced-In Read

At **$185.66**, the market is pricing Salesforce's free cash flow to grow only about **+0.9% a year forever** (or to actually shrink ~4.5% next year and run flat-to-negative for a decade on a fade model) — a bar **below** the ~3% growth rate of the economy itself. That is **conservative**, because the company compounded free cash flow at roughly **28% a year over the last four years**, still guides FY27 cash flow up **+4–5%** even after loading on ~$25B of new debt, and frames ~**11% revenue growth** out to FY30 [earnings/01, §1; earnings/04, §2]. If FCF merely grew with the economy at 3% forever, the enterprise would be worth about **$251.7B (+37.7%)** versus today's ~$182.8B — so the price is paying *less than* grow-with-GDP cash flow is worth.

**This is upside, not downside, on the priced-in math alone:** the implied expectation sits well below what the evidence says the business can deliver, and the gap is the margin. **The one honest qualifier the synthesizer must carry:** the *near-term* FCF growth rate is genuinely compressed right now by the new debt interest (guided +4–5% for FY27, a financing artifact), so the "conservative pricing" is partly the market refusing to pay up until it sees reported FCF growth re-accelerate past the interest drag — and the binding swing factor for that re-acceleration is the top line (cRPO has printed "in line" with no upside for two straight quarters), not the buyback math, which is now spent [earnings/04, §6–§7; earnings/02, §7]. The priced-in bar is low; whether the stock closes the gap depends on demand re-accelerating, which the bookings data has not yet confirmed.

---

### Self-check

- Current price ($185.66) and EV ($182,767M) match `01` verbatim — yes; price is present, so the agent runs (partial-data stop not triggered).
- Discount rate stated explicitly with basis — yes (WACC 9.0%, full CAPM/WACC build with web-sourced rf, ERP, beta labeled).
- Solve states what was held fixed (WACC, FCF base, terminal g, horizon) and what was solved for (FCF growth) — yes.
- Implied expectations compared to actual historical FCF growth (~28.5% 4y) and earnings-module evidence (guidance +4–5%, FY30 ~11% revenue, cRPO +13% cc) — yes.
- Achievable/stretch/no judgment is evidence-backed (Yes — easily, on the long-run record; clears even the depressed near-term guide) — yes.
- Robustness across discount rates (8% / 9% / 10%) shown — yes.
- Implied-growth solve and both robustness re-solves produced by an executed `scipy.optimize.brentq` solver, cross-checked by an independent bisection, with commands and roots shown — yes (F11 satisfied).
- No banned phrases ("cheap"/"expensive"/"undervalued"/etc. used only with a number, or avoided) — checked.

*Data note: earnings/07_earnings-sensitivity.md was not present in this run; the achievability ranges were taken from earnings/04_guidance-consensus.md and earnings/02_revenue-drivers.md instead, which carry the forward growth/margin evidence this agent needs. Flagged for the synthesizer.*
