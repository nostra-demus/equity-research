# Reverse DCF — What's Priced In — NU

**Method gate, applied before anything else (MODULE_RULES Business-Type Method Map — Hard Rule).** `00_valuation-data-triage` §3 classifies Nu Holdings as a **Financial (bank)**, so an FCFF (free-cash-flow-to-the-firm) construction and an enterprise-value bridge are invalid for this issuer, and `01` §4 labels its EV bridge informational only. A "reverse-DCF solving for free-cash-flow growth" is therefore not the right question here and is **not** built: LTM cash from operations is **−US$10,304.8m** because a growing bank's loan book and deposits run through operating cash flow [`ciq_facts.json` `ltm_ocf_m`, status `present`]. This report **inverts the equity-direct residual-income model `04_intrinsic-dcf` built** — same cost of equity, same opening book, same consensus earnings strip, same terminal growth, same horizon, same mid-year discounting — and asks what the *price* requires on that identical basis.

**Price-state check (MODULE_RULES Partial-Data rule).** `01` §7 tags the price-state **`pool-verified`** (US$14.30, 2026-08-28 close, corroborated across three Capital IQ exports). This agent may therefore run. `01` also records the anchor as stale by 5 exact trading sessions with a corroborated fresher indicative quote of **US$15.37** (2026-09-04, web-sourced, unverified, +7.48%), and instructs downstream agents to show price-relative reads at **both** prices. Every solve below is run at both and labelled.

**Nothing here is hand-computed.** Every number in §2, §2A and §4 came out of an executed Python solver (bisection root-find), and the commands, the script and the raw roots are printed in §2B (fix F11).

---

## 1. Inputs

Every input is taken **verbatim from `04_intrinsic-dcf`** (MODULE_RULES Calculation Standard 9 — the reverse-DCF must invert the SAME model). Nothing was re-derived here. `04` §8 states this explicitly: *"This model is `05_reverse-dcf`'s canonical input: cost of equity 13.00%, opening book USD 2.716, the consensus EPS strip above, terminal ROE 18.0%, terminal `g` 3.0%, mid-year discounting — `05` inverts these, it does not re-derive them."*

| Input | Value | Source |
|---|---:|---|
| Current price (anchor) | **US$14.30** (2026-08-28 close) | from `01` §1/§7 — price-state `pool-verified` |
| Fresher indicative price | **US$15.37** (2026-09-04 close) | from `01` §1 — *web-sourced, not from data pool, unverified*, +7.48% |
| Enterprise value | **Not used — invalid for a Financial.** `01` §4 gives US$61,243.3m and labels it informational only; it omits US$60.9bn of deposits and payables to network | from `01` §4/§7 |
| Market capitalisation solved against | **US$69,078.8m** at US$14.30 (US$74,247.7m at US$15.37) | from `01` §3 |
| Fully diluted shares (per-share divisor) | 4,878,395 thousand | from `01` §2 |
| **Base for the solve — opening book value per share `B0`** | **US$2.7160** (equity attributable to parent US$13,249.670m ÷ 4,878.395m, Jun-30-2026) | from `04` §1, built on Q2 2026 Interim Report (Aug-14-2026), statement of financial position |
| **Base for the solve — normalized earnings strip** | H2 2026 **US$0.4546**, FY2027 **US$1.11006**, FY2028 **US$1.45953** diluted EPS; dividends 0.00 / 0.1725 / 0.23 | from `04` §2 — `Capital IQ Estimates→Consensus`, EPS (GAAP) mean, as-of 2026-08-29 (16/16, 16/16, 12/12 estimates); H2'26 = FY2026E 0.8482 − H1'26 actual 0.3936 [Q2 2026 Interim Report, six months to 30-Jun-2026] |
| **Discount rate used — cost of equity `k_e`** | **13.00%** (CAPM build 12.01% = 4.79% risk-free + 0.94 × 4.23% mature-market equity-risk premium + 3.24% Brazil country-risk premium, then a stated +0.99pp analyst override) | from `04` §3. **There is no WACC in this model** — for a Financial the Method Map requires the equity to be valued directly at the cost of equity, so the `after-tax k_d ≤ WACC < k_e` bound is structurally absent, not waived |
| Terminal growth `g` | **3.0%** (USD nominal) | from `04` §2 |
| Forecast horizon | **12.5 years** — H2 2026 stub + FY2027–FY2028 consensus + a 10-year fade FY2029–FY2038, then a Gordon terminal | from `04` §2/§4 |
| Discounting convention | **Mid-year (t − 0.5)**; stub at 0.25 yrs with a half-year capital charge; terminal discounted at the full 12.5 yrs; value accreted from 2026-06-30 to the price date at `k_e` | from `04` §4 |
| Terminal return on equity (the thing `04` assumed and this agent solves for) | 04's base assumption **18.0%** | from `04` §2 |

**Tie-out, printed before any solve is trusted.** Re-running `04`'s model with these inputs reproduces its published output to the fourth decimal: value/share **11.7130** (04 publishes 11.71), present value of explicit residual income **7.0032** (04: 7.0033), present value of the terminal **1.7615** (04: 1.7615), terminal book value per share **16.2324** (04: 16.2326). The two models are the same model. Raw output in §2B.

---

## 2. Implied Expectations

**What was held fixed, and what was solved for — stated exactly.** Held fixed: the cost of equity at 13.00%, the opening book of US$2.716, the full consensus earnings and dividend strip through FY2028, terminal growth of 3.0%, the 12.5-year horizon, the mid-year convention, and the shape of the fade (a straight line from the FY2028 return of 35.53% on opening book to the terminal return, with the payout ratio rising in step and pinned to `1 − g/ROE` at the end so the terminal is self-funding). **Solved for: the terminal return on equity — the steady-state profit the company earns on each dollar of shareholders' money once growth has normalised — that makes the model's value equal today's price.** That is the residual-income model's exact analogue of "implied growth" in a cash-flow DCF: in this model form, value above book comes only from earning more than the cost of equity, so the price is a statement about how much excess return, for how long.

| What the price implies | Solved value at **US$14.30** (pool-verified) | Solved value at **US$15.37** (indicative) |
|---|---:|---:|
| **Implied terminal (steady-state) return on equity** — the primary solve | **22.08%** | **23.64%** |
| Implied excess return over the 13.0% cost of equity, in perpetuity | **+9.08pp** | **+10.64pp** |
| Implied earnings CAGR, FY2028 → FY2038 (derived from that solve) | **9.39%** | **10.28%** |
| Implied earnings CAGR, FY2026 → FY2038 (12 years, off the consensus FY2026E of 0.8482) | **12.75%** | **13.51%** |
| Implied FY2038 diluted EPS | **US$3.5813** (net income US$17,471m) | **US$3.8827** (US$18,941m) |
| Implied exit price-to-book at the FY2038 horizon `1 + (ROE − k_e)/(k_e − g)` | **1.91×** | **2.06×** |
| Terminal value as a share of total value at the solved point | **23.5%** | **26.0%** |
| **Secondary solve — implied years of above-normal returns (fade removed):** how many years the company must hold its FY2028 return of **35.53%** flat, with **zero** excess return in every year after, to justify the price | **7.68 years** (to FY2036) | **8.20 years** (to FY2037) |
| *Memo: the same secondary solve run against `04`'s own base value of US$11.71* | *6.23 years* | — |

**Reading the two solves together.** They are two ways of saying the same thing. Either NU settles into a **permanent 22.1% return on equity** — roughly 900 basis points above what it costs to raise that equity, forever — or it keeps earning its current, explicitly peak, ~35% return for **another 7.7 years** and then earns exactly its cost of equity and nothing more. The price does not distinguish between them; both are the same present value.

**A third thing the price implies, and the most concrete one.** Run `04`'s model unchanged — 13.0% cost of equity, 18.0% terminal return, 3.0% terminal growth — but swap the consensus mean earnings strip for the **top of the analysts' range** (FY2026 0.91 / FY2027 1.30 / FY2028 1.77 [`Capital IQ Estimates→Consensus`, EPS (GAAP) High row, as-of 2026-08-29]). The value is **US$14.65**, just above the price. **In plain terms: at US$14.30 the market is paying for the best earnings forecast on the Street, with no downgrade to `04`'s long-run terminal assumptions.**

### 2A. Implied Discount Rate — the dual solve

The §2 solve holds the discount rate fixed and asks what return the price needs. This is the mirror: hold `04`'s **own base-case earnings path** fixed (terminal return 18.0%, terminal `g` 3.0%, same horizon, same convention) and solve for the discount rate that makes the present value equal the price.

| Solve | Held fixed | Solved value |
|---|---|---:|
| Implied cost of equity at `04`'s base-case cash flows — **at US$14.30** | `04`'s EPS path, terminal ROE 18.0%, `g` 3.0%, 12.5-yr horizon, mid-year | **11.58%** |
| Implied cost of equity — **at US$15.37** | same | **11.12%** |
| `04`'s model cost of equity (for comparison) | — | **13.00%** (CAPM build 12.01%) |
| **Ratio (implied ÷ model), at US$14.30** | — | **0.891×** |
| **Ratio (implied ÷ model), at US$15.37** | — | **0.856×** |

**Reported into `04` §3A, and it agrees.** `04` §3A already carries the market-implied rate of **11.58%** in its Cost-of-Capital Reality Test table and records that the model rate sits **1.42pp above** it. This agent re-solved it independently on the same model and reproduces **11.5825%** — the two agree to two decimal places. `04`'s escalation logic is therefore confirmed, not overturned: the trigger requires the model rate to sit **below ~two-thirds of** the market-implied rate, and here it sits **above** it, so **no escalation branch fires and no `RF-VAL-003` tag is due.**

**Which way it cuts — both readings stated, as the rule requires.** The ratio is **below 1.0**, not above 1.5, so the "market is pricing an unprecedented collapse" failure mode is not in play. The disagreement runs the other way, and it still has two readings:

- **Reading A — the cash flows are wrong (too low).** The market expects more profit than `04` modelled. That is the §2 solve restated: the market needs a terminal return of 22.1% where `04` assumed 18.0%. Tested against the evidence in §3 below, this requires NU to hold, permanently, a return close to what the single best-run large Brazilian incumbent earns today.
- **Reading B — the rate is wrong (too high).** The market accepts a lower required return than 13.0%. This is the weaker of the two, and the reason is specific: **11.58% is 2.40–2.96pp below the cost of equity Nu Holdings' own management uses**, once translated onto this model's USD basis. The FY2025 20-F discloses a Brazilian cost of equity of **16.51%** in its goodwill-impairment test [FY2025 Form 20-F, Consolidated Financial Statements, Note 3(b)], which `04` §3A translates to **13.98%–14.54% in USD** at Brazil's disclosed 4.26% IPCA inflation. So the market's implied required return is below both the model's rate *and* management's own. Reading B would have to argue the company itself over-discounts Brazilian risk.

**Default reading and why.** MODULE_RULES makes Reading B the default only where the model rate **failed a low-side floor** or sits **far below** the company's own disclosed rate. Neither holds: `04` §3 prints all three low-side floors as cleared (equity-risk premium over the risk-free rate 8.21pp against a ~4pp floor; beta 0.94 against a ~0.8 floor, sourced, matched-basis, corroborated by three US-listed Latin American financial peers at 0.86–1.28; a stated 3.24% Brazil country-risk premium), and the model rate sits **0.98–1.54pp below** the currency-matched company comparator, well inside the ~3pp threshold. **Reading A is therefore taken: this is a statement about expected profit, not about the discount rate.** One honest qualifier travels with that: if anything, the *company's own* disclosed rate suggests 13.0% is a touch **low**, which would make the implied expectations in §2 harder still, not easier — the robustness table in §4 shows what that does.

### 2B. Executed solver — commands, script and raw roots (fix F11)

```
$ python3 solve.py
TIE-OUT 04 base: ke=13.0% tROE=18.0% -> V=11.7130 (04 says 11.71); PV(RI)=7.0032 (7.0033); PV(TV)=1.7615 (1.7615); B_T=16.2324 (16.2326); fade-start ROE=35.5277%
SOLVE1 pool 14.30: implied terminal ROE = 22.0798%  check V=14.3000  TVshare=23.5%  B_T=16.706 implied exit P/B=1.91x
SOLVE1 indic 15.37: implied terminal ROE = 23.6420%  check V=15.3700  TVshare=26.0%  B_T=16.916 implied exit P/B=2.06x

$ python3 solve2.py
SOLVE2 04 base (tROE 18.0%): FY2038 EPS=2.8367; FY2028->FY2038 EPS CAGR=6.87%; FY2026->FY2038 CAGR=10.58%
SOLVE2 price 14.30 (tROE 22.08%): FY2038 EPS=3.5813; FY2028->FY2038 EPS CAGR=9.39%; FY2026->FY2038 CAGR=12.75%
SOLVE2 price 15.37 (tROE 23.64%): FY2038 EPS=3.8827; FY2028->FY2038 EPS CAGR=10.28%; FY2026->FY2038 CAGR=13.51%
SOLVE3 pool 14.30: implied years of excess return at the FY2028 peak ROE of 35.53% = 7.68 yrs (check V=14.3000)
SOLVE3 indic 15.37: implied years of excess return at the FY2028 peak ROE of 35.53% = 8.20 yrs (check V=15.3700)
SOLVE3 04 base value 11.71: implied years of excess return at the FY2028 peak ROE of 35.53% = 6.23 yrs (check V=11.7100)
SOLVE2A pool 14.30: implied cost of equity = 11.5825%  (04 model ke = 13.00%; ratio 0.891x)  check V=14.3000
SOLVE2A indic 15.37: implied cost of equity = 11.1247%  (04 model ke = 13.00%; ratio 0.856x)  check V=15.3700
ROB-A ke=12.0%: implied terminal ROE @14.30 = 19.16% ; @15.37 = 20.54% ; base-case value @tROE18% = 13.45
ROB-A ke=13.0%: implied terminal ROE @14.30 = 22.08% ; @15.37 = 23.64% ; base-case value @tROE18% = 11.71
ROB-A ke=14.0%: implied terminal ROE @14.30 = 25.20% ; @15.37 = 26.94% ; base-case value @tROE18% = 10.31
ROB-B LOW  (Street low 0.75/0.77/1.170): base-case value @tROE18% = 9.24 ; implied terminal ROE to reach 14.30 = 27.47%
ROB-B BASE (Street mean 0.848/1.110/1.460): base-case value @tROE18% = 11.71 ; implied terminal ROE to reach 14.30 = 22.08%
ROB-B HIGH (Street high 0.91/1.30/1.77): base-case value @tROE18% = 14.65 ; implied terminal ROE to reach 14.30 = 17.52%
ROB-C terminal g=2.5%: implied terminal ROE @14.30 = 22.56% ; base value @tROE18% = 11.53
ROB-C terminal g=3.0%: implied terminal ROE @14.30 = 22.08% ; base value @tROE18% = 11.71
ROB-C terminal g=3.5%: implied terminal ROE @14.30 = 21.59% ; base value @tROE18% = 11.91
```

The model function, in full — it is `04`'s script with the solved variable freed and a bisection root-find wrapped around it, so a reader can re-run it and reproduce every root above:

```python
B0 = 13249.670/4878.395                                   # 04 s1: opening book/share, Jun-30-2026
CONS_BASE = [(0.5,0.8482-0.3936,0.0),(1.0,1.11006,0.1725),(1.0,1.45953,0.23)]   # 04 s2 consensus strip
F, ACC_0828, ACC_0904 = 10, 0.164, 0.164+7/365            # 04 s4 fade length and accretion to each price date

def model(ke, tR, g=0.030, cons=CONS_BASE, fade=F, p0=0.25, acc=ACC_0828):
    B, t, pv = B0, 0.0, 0.0
    for d, e, dv in cons:                                  # consensus phase, mid-year, half-year capital charge on the stub
        pv += (e - ke*d*B)/(1+ke)**(t+d/2); B += e - dv; t += d
    r0 = cons[2][1]/(B0 + sum(e-dv for _,e,dv in cons[:2]))   # FY2028 return on opening book = 35.5277%
    pT = 1 - g/tR                                          # terminal payout pinned so growth is self-funded
    for i in range(1, fade+1):                             # linear fade of return and payout, FY2029-FY2038
        w = i/fade; roe = r0 + (tR-r0)*w; pay = p0 + (pT-p0)*w
        pv += (roe-ke)*B/(1+ke)**(t+0.5); B += roe*B*(1-pay); t += 1
    tv = (tR-ke)*B/(ke-g); pvtv = tv/(1+ke)**t             # Gordon terminal on residual income, full-year discount
    return (B0 + pv + pvtv)*(1+ke)**acc                    # accreted from 2026-06-30 to the price date

def brentq(f, a, b, xtol=1e-10):                           # bisection (scipy unavailable in this sandbox)
    fa, fb = f(a), f(b); assert fa*fb < 0, "no sign change"
    for _ in range(300):
        m = (a+b)/2; fm = f(m)
        if fa*fm <= 0: b, fb = m, fm
        else: a, fa = m, fm
        if b-a < xtol: break
    return (a+b)/2

root = brentq(lambda tR: model(0.130, tR, acc=ACC_0828) - 14.30, 0.131, 0.60)   # -> 0.220798
```

---

## 3. Implied vs Achievable

**Base-rate discipline first (CLAUDE.md §9), because the obvious comparison here is the wrong one.** The claim being tested is a **terminal, steady-state return on equity** and a **decade-long mature earnings CAGR**. NU's headline history — net income to parent of **−165.0 → −364.6 → 1,030.6 → 1,972.1 → 2,868.9** US$m across FY2021–FY2025, i.e. **+91.4% in FY2024 and +45.5% in FY2025**, and **+56.8%** in the twelve months to Jun-30-2026 [`earnings/01_historical-financials.md` §1 and §2] — is **not** the matched base rate for either claim. Those are the growth rates of a company emerging from start-up losses on a small base; the unit, the level and the period all differ from a mature-decade claim. `business-model/09_moat.md` §3 says so directly: FY2021–FY2022 were *"a scaling business emerging from start-up losses, **not** a credit cycle"*. Using that history to bless the implied number would be exactly the metric/level/period mismatch §9 exists to stop. The matched base rates are set out row by row below.

| Implied requirement | Company history (matched unit / level / period) | Earnings- and business-module evidence | Achievable? |
|---|---|---|---|
| **Terminal return on equity of 22.08%, in perpetuity** (23.64% at US$15.37) | NU's own returns: LTM **31.63%** on average equity, but the CFO called the Q2'26 33% figure *"a record"*; FY2023 18.24%, FY2024 28.07%, FY2025 30.28%; loss-inclusive five-year average **12.40%** [CIQ `Ratios` export, FY2021–LTM Jun-30-2026 — vendor export, via `business-model/09_moat.md` §3]. Peer-matched, same metric, same period: Itaú Unibanco **24.3%** return on tangible book; six-bank Brazil/LatAm median **15.95%**; Banco do Brasil **9.6%** [`Capital IQ Comps → Financial Data`, as-of 2026-08-29 — vendor export] | The implied 22.08% is **6.13pp above the six-bank peer median** and **2.2pp below the single best incumbent**. `business-model/09_moat.md` returns **Narrow moat**, trajectory **stable**, with the cost advantage measured (an ~85% lower cost to serve; 14,314 customers per employee against an incumbent average of 1,234 [FY2025 20-F, Item 4.B]) but explicitly discounted for durability. Three named pressures push the other way: the book is **92% unsecured** with 90+ day non-performing loans at **6.9%**, up 35bp in the quarter; the enacted CSLL tax step-ups (payment institutions 9%→12%→15% from 2028; credit companies 17.5%→20%) raise the tax rate mechanically; and the price of the largest revenue line is capped by Law 14,690/2023 [`business-model/09_moat.md` §5; `earnings/07_earnings-sensitivity.md` §2a] | **Stretch** — requires NU to earn, permanently, roughly what the best-run large incumbent earns today |
| **Earnings CAGR of 9.39% from FY2028 to FY2038** | Matched-period base rate: the only long-range earnings path in the pool is a **single broker's** strip (1/1 estimate per year) — FY2029 1.73 rising to FY2035 3.13, a **10.39%** CAGR FY2029→FY2035 and **11.51%** from FY2028 [`Capital IQ Estimates→Consensus`, EPS (GAAP), as-of 2026-08-29]. Street consensus long-term growth is **33.98%** (3/3 estimates, range 42.00%/29.95%) — a 3–5 year rate, not a mature-decade rate, and not comparable | The implied **CAGR** is slightly *below* the broker strip's, but that is the wrong test on its own — value depends on **levels**, and the implied earnings **level** runs above that strip in **every** overlapping year: FY2029 **+5.5%**, FY2030 +11.0%, FY2031 +15.4%, FY2032 +17.7%, FY2033 **+18.2%**, FY2034 +16.0%, FY2035 +12.2%. `04` §4 had already shown its *own* base path sitting above the strip in six of seven years; the price requires more still | **Stretch** — the level, not the growth rate, is the binding constraint |
| **7.68 more years of the FY2028 peak return (35.53%), with zero excess return thereafter** | The profitable record is **three and a half years old** and contains **no Brazilian consumer downturn at anything like the current book size** [`business-model/09_moat.md` §3]. Every profitable year ran with Brazilian unemployment falling to 5.1% | `business-model/07_business-quality.md` scores cyclicality **30/100** and industry rate-of-change **38/100**, tripping the fast-changing-industry filter (CLAUDE.md §24, Filter 5, tag RF-BQ-005); `09_moat.md` instructs that *"the durability period assumed in any DCF should be short"*. `earnings/07_earnings-sensitivity.md` scores earnings volatility **66/100 (inverted: higher = worse)** — three variables can each move net income by more than 13% in a year: credit cost (±US$530–583m), BRL/USD (+US$394m / −US$578m) and the tax rate (+US$257m / −US$549m at the bound) — while **40.4% of the last twelve months' reported profit is a non-cash deferred-tax credit** [`earnings/06_earnings-quality.md`, via `07` §7] | **No** — a 7.7-year peak-return runway is directly contradicted by the module that scored the industry's rate of change |

**The judgement, in four sentences.** At US$14.30 the market's expectations are **aggressive**, and the sharpest way to see it is that the price is roughly what `04`'s model produces on the **top of the analysts' earnings range** (US$14.65) with no improvement to the long-run terminal — so the mean forecast is not what is being paid for. The implied steady-state return of **22.08%** sits 6.13pp above the median of the six listed Brazilian and Latin American banks and just 2.2pp below Itaú, meaning the market is underwriting NU to settle permanently at best-incumbent profitability on a loan book that is 92% unsecured and has never met a downturn. The one honest counterweight, stated rather than buried: NU's **realised** profit growth has beaten this kind of expectation repeatedly and recently — net income up **56.8%** in the twelve months to Jun-30-2026 and **+66.5% year-on-year in Q2'26** [`earnings/01_historical-financials.md` §2/§3] — so a reader who believes the fade should start later than FY2029 gets a materially different answer, and the sensitivity that matters most is the one in §4 on the earnings base. But the implied number is a **terminal** return, and no amount of near-term beat rate settles what NU earns in 2038.

**Market-ceiling sanity check — substituted, not forced (one-directional: it can only raise the bar).** NU is a Financial taken through an equity-direct model, so a revenue-share-of-TAM test is not meaningful and is **not** run. The appropriate scale substitute is the **profit pool**. Management's own estimate is that Nu holds about **"7% market share of that profit pool"** in Brazil against a roughly **US$100bn** gross pool [Q2 FY26 earnings call transcript, 13 Aug 2026, Q&A — CLAUDE.md §4 tier-6, an internal management estimate, not an audited or third-party figure], and the FY2025 20-F separately puts group share at *"approximately 5% of SAM"* [FY2025 20-F, Item 4.B, p.20 — internal estimate]. The implied FY2038 profit of **US$17,471m is 4.84× the LTM net income of US$3,607.1m**; growing the pool at the model's own 3.0% USD nominal terminal rate over 12.5 years (a factor of 1.447×) gives an implied share of `7.0% × 4.84 ÷ 1.447 =` **about 23% of the Brazilian profit pool**, against 7% today (25% at US$15.37; 19% on `04`'s own base case). **This raises the bar but is not a kill signal:** a ~23% share is roughly the level the single largest incumbent plausibly occupies today, so it is a share a peer has held rather than one no peer has ever held. Two caveats that cut in opposite directions and are stated rather than netted: NU also earns in Mexico and Colombia, so part of the implied profit sits **outside** the Brazilian pool and the true required Brazilian share is lower than 23%; and the 3.0% USD pool-growth assumption is the model's own terminal rate, not a sourced market forecast — market size is a low-tier input (CLAUDE.md §4) and this check is presented as an order-of-magnitude test, not a measurement. **The check does not lift the implied expectations toward "achievable"; nothing in it may be read as upside.**

---

## 4. Robustness

**A. Sensitivity to the discount rate** (holding the earnings base, terminal `g` and horizon fixed):

| Cost of equity | Implied terminal ROE to justify **US$14.30** | Implied terminal ROE to justify **US$15.37** | `04` base-case value at its own 18.0% terminal ROE |
|---|---:|---:|---:|
| `k_e` − 1pp = **12.0%** | **19.16%** | 20.54% | US$13.45 |
| **`k_e` = 13.0% (base)** | **22.08%** | 23.64% | US$11.71 |
| `k_e` + 1pp = **14.0%** | **25.20%** | 26.94% | US$10.31 |

*Span across ±1pp on the rate: 6.04pp of implied terminal ROE.* The 12.0% row is close to `04`'s un-overridden CAPM build of 12.01%, and its base-case value of US$13.45 matches `04` §7's own labelled point exactly.

**B. Sensitivity to the earnings base — the larger swing factor.** The band is not invented here: it is the **high and low of the same analyst estimates `04` used for its mean** [`Capital IQ Estimates→Consensus`, EPS (GAAP) High and Low rows, as-of 2026-08-29].

| Earnings base (FY2026 / FY2027 / FY2028 diluted EPS) | `04` model value at its own 18.0% terminal ROE | Implied terminal ROE to justify **US$14.30** |
|---|---:|---:|
| **Low** — Street low 0.75 / 0.77 / 1.170 | US$9.24 | **27.47%** |
| **Base** — Street mean 0.8482 / 1.11006 / 1.45953 | US$11.71 | **22.08%** |
| **High** — Street high 0.91 / 1.30 / 1.77 | US$14.65 | **17.52%** |

*Span across the analysts' own range: **9.95pp** of implied terminal ROE.*

**Which input dominates, named.** **The earnings base, not the discount rate.** The full analyst range moves the implied terminal return by **9.95pp** (17.52% → 27.47%) against **6.04pp** for a ±1pp move in the cost of equity — roughly 1.6× the swing. The finding inside that is the one worth carrying: on the **low** end of the Street's own range the price needs a **27.47%** perpetual return, above Itaú's 24.3% and within striking distance of NU's own record peak; on the **high** end it needs only **17.52%**, marginally *below* `04`'s 18.0% assumption. The whole disagreement about NU's valuation sits in FY2027–FY2028 earnings, which the Street itself cannot agree on — its FY2027 range is 0.77 to 1.30, a **69% spread** around a mean of 1.11 with a standard deviation of 0.12215 across 16 estimates.

**C. Terminal growth ±0.5pp — shown, though not required.** Terminal value is **23.5%** of total value at the solved point (26.0% at US$15.37), far below the ~60% line that would make this mandatory, so the model is **not terminal-dominated**. Run anyway, it confirms that: `g` = 2.5% → implied terminal ROE 22.56%; `g` = 3.0% → 22.08%; `g` = 3.5% → 21.59%. A full percentage point on terminal growth moves the implied return by less than 1pp, which is why `04` called terminal growth *"nearly irrelevant"* in this model form and why the two tables above are where the argument actually lives.

---

## 5. What's-Priced-In Read

At **US$14.30** (2026-08-28, pool-verified), the market is pricing Nu Holdings to earn a **permanent 22.1% return on shareholders' equity** — about **9.1 percentage points more than the 13.0% it costs to raise that equity, forever** — or, equivalently, to hold its current record ~35% return for another **7.7 years** and then earn nothing above its cost of capital ever again. At the fresher indicative **US$15.37** (2026-09-04, web-sourced, unverified) the requirement rises to **23.6%**, essentially the **24.3%** that Itaú Unibanco — the best-returning large Brazilian incumbent — earns today.

That is **aggressive**, on three pieces of evidence. First, the implied return sits **6.13pp above the median of the six listed Brazilian and Latin American banks (15.95%)** and demands best-incumbent economics in perpetuity from a lender whose book is **92% unsecured**, whose 90+ day non-performing ratio is **6.9% and rising**, and whose entire profitable record — three and a half years — contains no Brazilian consumer downturn. Second, the price is roughly what `04`'s own model produces on the **top of the analysts' earnings range (US$14.65)**, so the mean forecast is not what is being paid for; the implied earnings **level** runs 5.5%–18.2% above the only long-range broker path in the pool in every year it can be compared. Third, the required **7.7-year runway of peak returns** is contradicted by the engine's own modules, which score the industry's rate of change at **38/100** and instruct that any assumed durability period be short.

Set against `04`'s base value of **US$11.71**, today's price embeds **US$2.59 per share (18.1%) of expectation the model does not carry** — and US$3.66 (23.8%) at the fresher quote. The market's implied cost of equity of **11.58%** is meanwhile **2.40–2.96pp below the cost of equity NU's own management uses to value a Brazilian business in its impairment test** (16.51% BRL, 13.98–14.54% translated to USD). Both readings point the same way: this is priced for the fade to start later and end higher than either `04` or management's own valuation inputs assume. If NU delivers the top of the Street's FY2027–FY2028 range, the price is fair on `04`'s unchanged terminal; if it delivers the mean, the price already contains the whole of a best-incumbent steady state, and there is no cushion left in it.

---

## Self-check against the module rules

- Price and share count match `01` §7 verbatim; price-state is **`pool-verified`**, so the agent may run. Both the pool anchor and the fresher indicative quote are carried through every solve, labelled (`01`'s re-anchor rule).
- The cost of equity (13.00%), the base (opening book US$2.716 + the consensus EPS strip), terminal growth (3.0%), horizon (12.5 yrs) and convention (mid-year) are taken from `04_intrinsic-dcf` **verbatim**; nothing was re-derived. The tie-out in §1 reproduces `04`'s published value to four decimals.
- The equity-direct residual-income form is used because the Business-Type Method Map bars an FCFF/EV reverse-DCF for a Financial.
- Every root in §2, §2A and §4 came from an executed bisection solver; commands, script and raw output are printed in §2B.
- The §2A dual solve was run, compared to `04`'s rate as a ratio (0.891× / 0.856×), reported into `04` §3A where it already appears at 11.58%, and both readings are stated with the evidence for choosing Reading A.
- Robustness spans the discount rate **and** the earnings base (and terminal `g`, though the 23.5% terminal share does not require it), with the earnings base named as dominant.
- Base rates are matched to the claim's unit; the mismatched consolidated start-up-phase growth history is named and explicitly rejected as the wrong yardstick.
- No scenario probabilities, no probability-weighted target, no rating, no position size — those belong to `07` and the master synthesizer.
