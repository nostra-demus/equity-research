# Reverse DCF — What's Priced In — EMAR (Emaar Properties PJSC, DFM: EMAAR)

**What this does.** It inverts the *same* model `04_intrinsic-dcf` built — a reverse-DCF is only meaningful as the exact inverse of the forward DCF. I take `04`'s canonical discount rate (WACC 10.5%), normalized free-cash-flow base (~AED 19,700m), terminal growth (1.5%), horizon (10 years, FY2026–2035), mid-year discounting, and terminal return-on-capital (ROIC 9.5%) **verbatim**, and instead of computing a fair value I solve for the growth and margin today's price *requires*. Reporting currency **AED millions**; USD shown at the 3.6725 peg. *Plain-English note:* "reverse-DCF" = start from the price and work backwards to the expectations baked into it; "what's priced in" = the growth and margin the market must believe to justify paying today's price; "FCFF" = free cash flow to the firm (the cash the operations throw off before financing).

**Model tie-out (proof this is the SAME model).** Rebuilding `04`'s explicit forecast from its own inputs reproduces `04` to the dirham — explicit present value **AED 96,600m**, present value of terminal **AED 54,161m**, enterprise value **AED 150,761m**, terminal value 36% of EV — matching `04` §4–§6. Every solve below runs on that verified engine. Computed with an executed root-finder (Python; scipy was unavailable in the sandbox, so a bisection solver was used — commands and roots are in the working log, not hand-arithmetic).

---

## 1. Inputs

| Input | Value | Source |
|---|---:|---|
| Current price | AED 12.20 (US$3.32), **pool-verified**, as-of 2026-06-28 | from 01 §1 (CIQ Comps) |
| Market capitalization (equity) | AED 107,818m | from 01 §3 |
| 01 broad EV (market-convention) | AED 96,657m | from 01 §4 |
| **Operating FCFF-EV the price implies** (reverse-DCF target) | **AED 89,128m** (book-NCI); AED 95,342m (economic-NCI) | derived — inverse of 04 §6 bridge |
| FCF base — normalized FCFF (NOPAT-based) | **~AED 19,700m** (operating-FCF variant 20,140; mid-cycle floor 14,724) | from 04 §1 |
| Discount rate (WACC) used | **10.5%** (04's; computed 9.60%, +0.9pp override, within ±1.5pp) | from 04 §3 |
| Forecast horizon | **10 years** (FY2026–2035), mid-year convention (discount at t−0.5) | from 04 §2, §4 |
| Terminal growth / terminal ROIC | 1.5% / 9.5% (ROIC ≈ WACC → no perpetual excess return) | from 04 §5 |

**The correct target is the operating EV, not 01's headline EV.** `04`'s DCF produces an *operating* enterprise value from free cash flow, then bridges to equity: **+ net cash AED 24,969m + associates/JVs AED 7,529m − minority AED 13,808m**. Inverting that bridge from the market's equity value gives the operating EV the price implies: 107,818 − 24,969 − 7,529 + 13,808 = **AED 89,128m** (book-NCI). This is 01's broad EV (96,657) minus the associates (7,529) that `04` values *separately* — the right apples-to-apples figure to match against free cash flow that excludes associate income. (`04`'s looser "market EV ≈ PV of explicit cash flows" line compared 96,657 to 96,600; removing associates sharpens the target.)

---

## 2. Implied Expectations

**Held fixed** (all verbatim from `04`): WACC 10.5%, terminal g 1.5%, terminal ROIC 9.5%, 10-year horizon, mid-year discounting, and the normalized FCFF base / `04`'s revenue path. **Solved for**: (a) the constant FCFF CAGR off the normalized base, and (b) the uniform EBIT-margin shift applied to `04`'s revenue path — each set so the present value equals the AED 89,128m operating EV the price implies.

| What the Price Implies | Solved Value |
|---|---:|
| Implied FCFF CAGR over the 10-yr horizon (constant growth off the ~AED 19,700m normalized base) | **−13.4%/yr** (economic-NCI basis −12.2%) |
| Implied years of above-GDP growth (fade model) | **0** — the price requires *runoff*, not growth |
| Implied steady-state (terminal) EBIT margin — `04`'s revenue path held, margin flexed | **~21%** (economic-NCI ~22.5%) |

**How undemanding this is.** Holding free cash flow *flat* at the normalized AED 19,700m base (0% growth) already discounts to an operating EV of **AED 210,606m — 2.4× what the market pays**. To reach AED 89,128m the base must *shrink* ~13%/yr for a decade. Equivalently, the market pays **64% of `04`'s intrinsic equity value** (AED 12.20 vs `04`'s ~AED 19.2 book-NCI) and **59% of its operating EV**. And `04`'s own base case — a cyclical normalization off the record-2025 peak — itself already implies FCFF fading **−5.0%/yr**; the price implies **−13.4%/yr**, i.e. the market is ~8pp/yr *more* pessimistic than `04`'s already-normalized base.

**The margin solve is the decision-relevant one** (a negative CAGR off a peak-normalized base is easy to misread; margin is `04`'s dominant value driver). Holding `04`'s cyclical revenue path and flexing only the margin, the price implies a **through-cycle EBIT (operating-profit) margin of ~21%** — *below* Emaar's own FY2021 trough (23.5%), *below* the one audited peer Aldar (27.2%), and far below `04`'s normalized mid-cycle (35%) and the FY2025 peak (45.5%).

---

## 3. Implied vs Achievable

| Implied Requirement | Company History | Earnings-Module Evidence | Achievable? |
|---|---|---|---|
| Implied FCFF CAGR = **−13.4%/yr** for 10 yrs (a permanent runoff) | Revenue CAGR **+15.4%/yr** FY2021–25 (accelerating: +7.3% / +32.7% / +39.6%) [earnings/01] | Consensus long-term growth **−14.8%** (peak-normalization); AED 163.4bn backlog = 3.3× revenue, ~94% sold [earnings/07; ciq_facts] | Bar is *too easy* — a perpetual 13%/yr decline is more pessimistic than even the backlog-locked near term → **conservative (undemanding)** |
| Implied terminal EBIT margin ≈ **21%** | FY2021 trough **23.5%**; FY2022 32.3%; FY2025 peak **45.5%** [04 §2, CIQ IS] | Gross margin 55%, guided "low 50s" → EBIT mid-30s mid-cycle; `04`'s modeled down-cycle low is 31% [earnings/03; 04 §2] | ~21% sits *below the worst recent trough and below the peer* → **stretch-to-unachievable as a permanent floor** → priced-in is **conservative** |

**Judgment.** The market's implied expectations are **conservative to the point of pricing structural impairment**: a permanent through-cycle margin (~21%) below Emaar's own worst recent trough (23.5%) and below its lower-margin audited peer (Aldar 27.2%), plus free cash flow shrinking ~13%/yr for a decade. The near term is contractually visible — an AED 163.4bn sold backlog (3.3× revenue, ~94% sold) converts to booked revenue over roughly 3–4 years [earnings/07 §1] — so the priced-in collapse is not supported by what is already under contract. The genuine bear anchors are real but do not reach 21%: the cheap-legacy-land spread is narrowing (gross margin 63%→55%, guided lower), the new 15% tax is a one-way ratchet, and through-cycle ROIC (~7.5–9.5%) sits at/below the ~10.5–11.4% cost of capital [business-model/09 §3] — which is exactly why `04` strikes no terminal excess return. Those facts justify a *fade* to `04`'s 35% mid-cycle plus a modest premium over Aldar; they do not justify a margin permanently below the FY2021 trough.

**Market-ceiling sanity check (one-directional — it can only raise the bar).** Emaar is an operating developer, so this is a revenue-size test, and the reverse-DCF solved a cash-flow/margin figure, so I convert to the implied revenue trajectory (margin held). But the implied growth is *negative*, so a ceiling cannot bind — the priced-in path requires the business to *shrink*, not to win any incremental market share. Translating −13.4%/yr to revenue takes it from AED 49,557m to ~**AED 12bn by 2035** — about a quarter of today's level and *below* the recognition profile of the AED 163.4bn already-sold backlog. Dubai's forward supply (≈167,000 units completing into 2026–27) and the consensus −14.8% path do frame a real down-cycle [earnings/07 §4; market size is a low-tier input — cited, not load-bearing], but even a sharp cyclical trough is not a permanent three-quarters revenue loss. The binding question here is the *opposite* of a ceiling — is the implied decline too steep? — and the evidence says yes.

---

## 4. Robustness

Implied FCFF CAGR to justify the price (operating EV AED 89,128m, book-NCI basis):

| Discount Rate | Implied FCFF CAGR |
|---|---:|
| WACC −1% (9.5%) | −14.5%/yr |
| **WACC (10.5%)** | **−13.4%/yr** |
| WACC +1% (11.5%) | −12.2%/yr |

**The FCF base is the larger swing factor — shown, not just the rate.** Using `04`'s own §1 figures for the band (no new inputs invented):

| FCF base (04 §1) | Implied FCFF CAGR |
|---|---:|
| Low — mid-cycle NOPAT 14,724 | −8.6%/yr |
| **Base — normalized FCFF 19,700** | **−13.4%/yr** |
| High — operating-FCF variant 20,140 | −13.7%/yr |

The FCF base swings the implied CAGR by **5.1pp** (−8.6% to −13.7%) versus **2.3pp** for a full ±1% on WACC — **the FCF base is the dominant input**, consistent with the other modules' finding. Read in margin terms, the same stress gives an implied terminal EBIT margin of **19.2% / 21.1% / 22.9%** at WACC 9.5% / 10.5% / 11.5% — below the FY2021 trough (23.5%) across the entire rate range.

*Terminal g ±0.5% (informational — terminal value is only **23% of EV** at the market solve, well under the 60% trigger, so this is not required):* implied CAGR moves just −13.1% / −13.4% / −13.6% across g = 1.0% / 1.5% / 2.0%. Terminal growth barely matters — exactly as `04` found, because terminal ROIC ≈ WACC means growth adds ~no value.

---

## 5. What's-Priced-In Read

At **AED 12.20**, the market prices Emaar's free cash flow to *shrink ~13%/yr for a decade* and its through-cycle operating margin to settle near **21% — below its own FY2021 trough (23.5%) and below audited peer Aldar (27.2%)** — paying just **64% of `04`'s intrinsic equity value**. That is a **conservative (undemanding)** set of expectations: the fundamental evidence — an AED 163.4bn sold backlog underpinning near-term revenue, a brand-plus-Downtown-Dubai-location moat that genuinely out-earns Aldar, and a margin that has not sat below ~23.5% even in the last trough — says the business can clear that bar, so on fundamentals the ~AED 6–7/share gap to `04`'s ~AED 18–19 intrinsic is upside, not fair pricing. **The caveat that decides whether the gap ever closes is structural, not fundamental:** the persistent discount matches the government-controlled-owner value trap the moat and DCF modules flag (Investment Corporation of Dubai ~22.3% controller and city master-planner, RF-OWN-004) — a misaligned owner can keep a below-intrinsic price below intrinsic indefinitely. The reverse-DCF's read is that the *expectations* baked into the price are too pessimistic; whether that converts into realized return, given the owner discount, is left to `07`/`99` to adjudicate — not decided here.
