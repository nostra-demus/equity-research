# Reverse DCF — What's Priced In — NVT

**Evidence binding: frozen.** Every read resolved through the bound generation `6db32848…1aecd1e6`. Live `data/NVT/` and `_pool_extracts/` were not read; `data/NVT/…` is a citation label only.

**Regime.** US SEC domestic filer (Irish-incorporated, NYSE-listed). **US GAAP. Reporting currency USD, in millions; per-share in dollars. Fiscal year ends 31 December.** [`00_valuation-data-triage` §1A]

**Price-state gate — passed.** `01_price-and-capital-structure` §7 tags the price-state **`pool-verified`** ($171.16, close 2026-08-12, as-of date confirmed by the export itself). The no-price partial-data rule does **not** bind, so this agent runs. The **staleness** cap does bind (26 calendar days / ~17–19 trading days), so every implied-expectations read below is run and reported at **BOTH** prices — the pool-verified anchor of **$171.16** and the corroborated indicative refresh of **$156.03** (close 2026-09-04, web-sourced, two independent sources at the identical figure, **unverified — not the anchor**) — with the fresher read led on in §5.

**This agent inverts `04_intrinsic-dcf`, it does not rebuild it.** The discount rate, the normalized cash-flow base, the terminal growth rate, the horizon, the discounting convention and the terminal-return treatment are all taken from `04` **verbatim**. Nothing is re-derived. That is the point: a reverse-DCF is only meaningful as the exact inverse of the forward model (MODULE_RULES → Calculation Standard 9), and using a different rate or a different (un-normalized, peak-inflated) base would let the two agents reach opposite verdicts on the same stock.

*(Plain meaning of what follows: a normal discounted-cash-flow model starts with a forecast and produces a value. This one runs the machine backwards — it starts with the traded price and asks what forecast you would have to believe to justify paying it.)*

---

## 1. Inputs

| Input | Value | Source |
|---|---:|---|
| Current price — **pool-verified anchor** | **USD 171.16** (close 2026-08-12) | `01_price-and-capital-structure` §7 Anchor Block |
| Current price — **indicative refresh** (labelled, not the anchor) | **USD 156.03** (close 2026-09-04, web-sourced, unverified) | `01` §1 and §7 |
| Enterprise value at the anchor | **USD 28,940.0m** | `01` §4 (market cap 27,703.6 + total debt 1,492.4 + 0 minority + 0 preferred − cash 256.0) |
| Enterprise value at the indicative refresh | **USD 26,491.1m** | `01` §4 |
| Net debt (strict §15; broad basis identical — no short-term investments) | **USD 1,236.4m** | `01` §7, adopted from `balance-sheet-survival/01` |
| Fully diluted shares | **164.2m** | `01` §2 (161.858m + 2.3m treasury-stock-method increment; no convertibles) |
| **FCFF base (unlevered, the model's base)** | **USD 718.3m** — LTM to 30-Jun-2026 | `04_intrinsic-dcf` §1. Build: CFO continuing ops 772.8 − capex 112.9 = §15 FCF 659.9, + after-tax interest 58.4 |
| **Discount rate (WACC) used** | **10.2152%** (reported 10.22%) | `04` §3, taken verbatim. Components: rf 4.79% + β 1.36 × ERP 4.23% = k_e 10.54%; after-tax k_d 4.13%; weights 94.89% / 5.11%. Gate check `4.13% ≤ 10.22% < 10.54%` passes; all three low-side floors pass; the company's own disclosed group WACC is **10.0%** [`FY24 10-K, MD&A — Critical Accounting Estimates, p.32`] |
| **Terminal growth `g`** | **3.0%** | `04` §2 and §5 |
| **Terminal return on capital** | **= WACC (no perpetual excess return)** — `09_moat.md` returns "No moat proven" | `04` §5 |
| **Forecast horizon** | **10 periods** — H2-2026 stub + FY2027 → FY2035, then terminal | `04` §2 |
| **Discounting convention** | **Mid-year**, valuation date 30-Jun-2026: stub at t = 0.25, FY2027 at t = 1.0 … FY2035 at t = 9.0, terminal at t = 9.5 | `04` §4 |

**Replication check — the inversion engine reproduces `04` before it is used to solve anything.** Fed `04`'s own printed FCFF path, the engine below returns EV **13,764.3** against `04` §6's **13,764.3**, and reproduces `04` §7's grid at **$76.30 / $76.48 / $76.11 / $67.03 / $67.13** per share against `04`'s **$76.30 / $76.48 / $76.11 / $67.07 / $67.17**. The two 9.22%-WACC cells tie to $88.32 vs `04`'s $88.39 — a 0.08% gap from `04` recomputing terminal NOPAT off its full revenue-and-margin model rather than scaling it. Everything below therefore runs on the same machine that produced `04`'s answer, not a lookalike.

```
$ python3 rdcf3.py
== REPLICATION of 04 §6 and §7 grid (must tie) ==
   WACC 10.22% g 3.0% -> $ 76.30/sh   04 prints $ 76.30  OK
   WACC 10.22% g 3.5% -> $ 76.48/sh   04 prints $ 76.48  OK
   WACC 10.22% g 2.5% -> $ 76.11/sh   04 prints $ 76.11  OK
   WACC  9.22% g 3.0% -> $ 88.32/sh   04 prints $ 88.39  (0.08% — see note)
   WACC 11.22% g 3.0% -> $ 67.03/sh   04 prints $ 67.07  OK
```

**One fact that must travel with every number below (carried from `01` §7 and `04`).** The anchor price, the whole consensus set (to 2026-08-07) and the 30-Jun-2026 balance sheet all **pre-date the Maverick Power acquisition announced 2026-08-24** ($1.75bn cash plus up to $550m earn-out, target 2026 revenue about $700m, close expected Q4 2026, cash-and-new-debt funded) [`nVent news release, 2026-08-24`]. The indicative $156.03 quote **post-dates** it. Both the cash flows and the debt in this inversion are pre-deal, consistently on both sides.

---

## 2. Implied Expectations

**Held fixed:** the discount rate (10.2152%), the normalized FCFF base ($718.3m), the terminal growth rate (3.0%), the terminal return on capital (= WACC), the ten-period horizon, the mid-year discounting convention, net debt and the share count — every one of them `04`'s or `01`'s figure, unchanged.
**Solved for:** the constant annual FCFF growth rate over the ten periods that makes the present value of the cash flows equal today's enterprise value.

```
$ python3 rdcf3.py
== §2 PRIMARY SOLVE ==
   $171.16 pool anchor   EV= 28940.0  implied FCFF CAGR=21.801%  FY2035 FCFF= 4238.0  TV%EV=60.6%
   $156.03 indicative    EV= 26491.1  implied FCFF CAGR=20.389%  FY2035 FCFF= 3815.7  TV%EV=59.6%
   04 FV $76.30          EV= 13764.3  implied FCFF CAGR= 9.983%  FY2035 FCFF= 1691.4  TV%EV=50.9%

== §2 SECONDARY - implied years of above-GDP growth (terminal applied at year N) ==
   at 12.5% p.a. -> $171.16: N =  19.9 yrs
   at 12.5% p.a. -> $156.03: N =  18.0 yrs
   at 17.2% p.a. -> $171.16: N =  12.2 yrs
   at 17.2% p.a. -> $156.03: N =  11.2 yrs

== §2 SECONDARY - implied terminal EBITDA margin (linear on 04 grid B, WACC 10.22%) ==
    slope = 2.170 $/sh per pp of terminal EBITDA margin
    $171.16: required terminal EBITDA margin =   63.7%
    $156.03: required terminal EBITDA margin =   56.7%
```

| What the Price Implies | Solved value at **$171.16** (pool anchor) | Solved value at **$156.03** (indicative) |
|---|---:|---:|
| **Implied FCFF CAGR over the 10-period horizon** (primary solve) | **+21.80% a year** | **+20.39% a year** |
| Implied FY2035 free cash flow to the firm | **USD 4,238.0m** (5.9x the $718.3m base) | **USD 3,815.7m** (5.3x the base) |
| Implied years of above-GDP growth at **12.5%** a year (the consensus revenue CAGR FY2026→FY2030), then straight to the 3.0% terminal | **19.9 years** | **18.0 years** |
| Implied years of above-GDP growth at **17.2%** a year (the FY2027 consensus revenue growth rate), then straight to the 3.0% terminal | **12.2 years** | **11.2 years** |
| Implied steady-state EBITDA margin, holding `04`'s revenue path fixed *(linear extrapolation off `04` §7 grid B — well outside the grid, so read it as a direction, not a point)* | **≈ 63.7%** (implied EBIT margin ≈ 61.3%) | **≈ 56.7%** (implied EBIT margin ≈ 54.3%) |
| *Memo:* the same solve at `04`'s own fair value of $76.30 | +9.98% a year | — |
| *Memo:* the FCFF CAGR `04`'s own consensus-based forecast actually delivers ($718.3m → $1,515.3m over 9 years) | **+8.6% a year** | — |

**The plain reading of the primary solve.** At $171.16 the market is paying for nVent's free cash flow to compound at **21.8% a year for nine and a half years** — from $718m to $4.2bn — and then to grow forever at 3% earning exactly its cost of capital. `04`'s own model, which takes consensus revenue and margin unchanged all the way to FY2030, delivers **8.6%**. The price therefore requires roughly **two and a half times** the cash-flow growth that the consensus-fed forward model produces.

**The margin solve is the sharper of the two, and it is worth stating plainly.** Holding `04`'s consensus revenue path fixed, no achievable margin can bridge the gap: the price needs a steady-state EBITDA margin near **64%** against `04`'s mid-cycle 20.0%, the model's own forecast peak of 22.8%, and a peer-normal operating margin of 20.7% at Hubbell and Legrand [`business-model/09_moat.md` §2]. That is not a stretch assumption, it is an impossible one — which means **the price cannot be explained by margin at all; it can only be explained by volume**, i.e. by the business becoming far larger than consensus models. That is what §3's market-ceiling test then interrogates.

**The fade solve says the same thing in the language of duration.** For the price to work at a 12.5% growth rate — the rate consensus itself models for FY2026→FY2030 — that rate has to persist for **twenty years**, not four. Even at FY2027's +17.2% it has to persist for **twelve years**. Against a business `business-model/09_moat.md` scores as **"No moat proven"**, with a through-cycle return on capital of **8.10% against its own disclosed 10.0% cost of capital**, and an industry rate-of-change score of **40/100** (CLAUDE.md §24 Filter 5, tag `RF-BQ-005`), a twelve-to-twenty-year advantage period has no evidenced support anywhere in this run.

---

## 2A. Implied Discount Rate — the dual solve

**Held fixed:** `04`'s literal base-case cash-flow path — the ten printed FCFF figures and the terminal cash flow of $1,139.9m (= terminal NOPAT 1,613.9 × the 29.4% reinvestment charge) — plus terminal `g` of 3.0%, the ten-period horizon and the mid-year convention.
**Solved for:** the discount rate that makes the present value of those cash flows equal today's enterprise value.

```
$ python3 rdcf3.py
== §2A DUAL SOLVE: implied discount rate, 04's literal cash flows held fixed (TV cash flow 1139.9) ==
   $171.16: implied discount rate =  6.210%   ratio to model WACC 10.215% = 0.608x
   $156.03: implied discount rate =  6.529%   ratio to model WACC 10.215% = 0.639x
```

| Solve | Held fixed | Solved value |
|---|---|---:|
| Implied discount rate at `04`'s base-case cash flows — at **$171.16** | `04`'s FCFF path, terminal cash flow 1,139.9, `g` 3.0%, 10 periods, mid-year | **6.210%** |
| Implied discount rate at `04`'s base-case cash flows — at **$156.03** | same | **6.529%** |
| `04`'s model WACC, for comparison | — | **10.215%** |
| **Ratio (implied ÷ model)** | — | **0.608x** at $171.16 · **0.639x** at $156.03 |

**Reported into `04` §3A.** `04`'s Cost-of-Capital Reality Test table left the "Market-implied rate" row as *"Not yet available — `05` runs after this agent"*. **That row's value is 6.21% at the pool anchor and 6.53% at the indicative refresh.** This agent does not edit `04`; the figure is published here for `07` and the master synthesizer to carry. **`04`'s escalation trigger does not fire on it:** the trigger is a model WACC *below ~two-thirds of* the market-implied rate — two-thirds of 6.21% is 4.14%, and `04`'s 10.22% sits far **above** it. No `RF-VAL-003` tag arises from this reconciliation.

**Which way it cuts — both readings stated, one chosen on evidence.** The ratio is **0.61x**, not above 1.5x, so this is the mirror of the usual failure: the market is not pricing a collapse, it is pricing an expansion. Both readings still have to be put on the table.

- **Reading A — the cash flows are wrong (the market expects far more cash than `04` models).** Test: `04`'s path already carries consensus revenue and margin unchanged through FY2030 — a business going from $3,893m (FY2025) to $8,697m (FY2030), a near-doubling in five years — and *still* lands at $76.30. So the market is assuming something well beyond consensus, not merely a different reading of it. nVent's own record supports a *period* of much faster growth: FCF compounded at 33.6% FY2022→FY2025 and LTM revenue is +46.2% year on year [`earnings/01_historical-financials.md` §1–§2]. What the record does not support is that rate for nine straight years off an already-peak base — see §3.
- **Reading B — the rate is wrong (`04` discounts too dearly).** Test: `04`'s WACC **passed all three low-side floors** (equity-risk-premium spread 5.75pp ≥ 4pp; sourced beta 1.36 ≥ 0.8; country-risk omission deliberate and reasoned) **and it passes the high-side ceiling** (k_e 10.54% below rf + 1.4 × ERP = 10.71%). Critically, it sits **+0.22pp ABOVE the company's own disclosed weighted-average cost of capital of 10.0%** — the rate nVent applies to *every* reporting unit in its own goodwill test [`FY24 10-K, MD&A, p.32`] — not below it. **Reading B is therefore NOT the default here**, because the condition that would make it the default (a model WACC that failed a floor, or that sits far below the company's own disclosed rate) is not met. To justify $171.16 on `04`'s cash flows the discount rate would have to fall to **6.21%** — **3.79pp below the company's own audited-file number**, and only 1.42pp above the 4.79% US 10-year Treasury, which fails `04`'s own equity-risk-premium floor by a wide margin.

**Verdict on the dual solve: Reading A.** The evidence points at the cash flows, not the rate. The market is not applying a 6.2% cost of capital to nVent; it is applying something near a normal cost of capital to a far larger stream of future cash than either consensus or `04` contains. That is the expectation §3 tests.

---

## 3. Implied vs Achievable

### 3.1 The base rate must match the claim's metric, level and period (CLAUDE.md §9)

The claim being tested is **forward free-cash-flow growth**, at **group level**, over **nine and a half years**. nVent's segment mix has shifted violently — Systems Protection went from **60.7% of revenue and 53.2% of segment income (FY2024, audited)** to **72.5% and 70.0% (H1 FY26)** [`business-model/03_segment-map.md` §1] — so the consolidated blend is arithmetically the wrong yardstick: it is weighted down by the slower part. The base rate is therefore **decomposed by segment and re-aggregated at current weights**, and said so.

```
$ python3 base_rates.py
SEGMENT INCOME growth  FY24->FY25 : SP +33.2%  EC +5.1%
SEGMENT INCOME growth  H1FY26 YoY : SP +86.7%  EC +7.5%
RE-AGGREGATED at CURRENT profit weights (SP 70.0% / EC 30.0%):
  FY24->FY25 segment-income base rate = 24.8%
  H1 FY26 YoY segment-income base rate = 62.9%
  [consolidated blend for contrast] FY24->FY25 total segment income = +20.1%
```

| Segment | Weight used (H1 FY26 segment income) | Segment-income growth FY2024→FY2025 | Segment-income growth H1 FY26 YoY | Source |
|---|---:|---:|---:|---|
| Systems Protection | 70.0% | **+33.2%** (403.1 → 537.0) | **+86.7%** (241.7 → 451.3) | `FY24 10-K, Note 15, p.70`; `Capital IQ Segments tab, Dec-31-2025` (tier-5 vendor); `Q2 FY26 10-Q, Note 13, p.20` and `MD&A p.29` |
| Electrical Connections | 30.0% | **+5.1%** (354.5 → 372.6) | **+7.5%** (180.1 → 193.6) | same |
| **Re-aggregated at current weights** | 100.0% | **+24.8%** | **+62.9%** | derived |
| *Consolidated blend, for contrast (the wrong yardstick)* | — | *+20.1%* | — | derived |

Two things follow, and they pull in opposite directions — both are stated rather than averaged away.

1. **On the correct §9 basis, the implied 21.8% is INSIDE the recent realised record, not outside it.** Mix-weighted segment-profit growth was +24.8% (FY24→FY25) and +62.9% (H1 FY26). Group FCF compounded at **33.6%** FY2022→FY2025 and **24.8%** FY2023→FY2025. Group EBIT compounded at **25.9%** on the filing basis (19.5% on the Capital IQ basis, which reclassifies a $58.5m pension item) [`earnings/01_historical-financials.md` §1]. Had this agent tested a forward *cash-flow* claim against the consolidated *revenue* CAGR of 19.3%, it would have called 21.8% "aggressive versus history" — and that would have been the wrong metric at the wrong level, exactly the error §9 exists to stop.
2. **The period is where it breaks, and the period is not a technicality.** Every one of those base rates is a **one- to three-year** realised rate measured **into a cycle peak** — LTM revenue is +46.2% year on year and both `earnings/01` §2 and `01` §5 flag the latest twelve months as a peak. The price does not require 21.8% for one year or three. It requires **21.8% every year for nine and a half years, compounding off that peak**, taking FCFF from $718m to $4.2bn. No period in nVent's own record, on any metric, at any level, is that long.

### 3.2 The judgement table

| Implied Requirement | Company History (metric-, level- and period-matched) | Earnings-Module Evidence | Achievable? |
|---|---|---|---|
| **FCFF CAGR of +21.8% for 9.5 years** ($718m → $4,238m) | Mix-weighted segment-profit growth +24.8% (FY24→FY25) and +62.9% (H1 FY26); group FCF CAGR 33.6% (FY22→FY25), 24.8% (FY23→FY25). **The RATE has been beaten. The DURATION has never been tested** — the record is three years long and ends at a peak | `earnings/07` §2 row 1: organic **orders decelerated from ~40% to "low double digits"** and backlog fell **$2.6bn → $2.5bn**; the ±20% data-centre move is a ±$0.473 EPS swing on a $5.05 base. `earnings/04` consensus itself fades revenue growth to +8–10% by FY2029–30 | **No** — on duration, not on rate |
| **12–20 years of above-GDP growth** (12.2 yrs at 17.2%, 19.9 yrs at 12.5%) | No disclosed market share; the only advantage-period evidence is `09_moat.md`: **"No moat proven"**, through-cycle ROIC **8.10% vs a 10.0% disclosed cost of capital**, moat sources capped at 45/100, all occupied by every named rival | `business-model/07_business-quality.md` §1: industry rate-of-change **40/100**, tripping §24 Filter 5 — liquid cooling is "10% to 15% of cooling in data centers", 800-volt DC architecture unsettled, chip roadmaps rewritten to 2030 [`Q2 FY26 transcript, Q&A`]. Backlog visibility is ~six quarters, given on a call, never in a filing | **No** |
| **Steady-state EBITDA margin ≈ 63.7%** (EBIT ≈ 61.3%) | Own record: EBITDA margin 17.2% (FY2022) → 22.4% (FY2024) → 21.2% (FY2025) → 22.2% (LTM). Own best-ever is 22.4% | Peer-normal operating margin **20.7%** at both Hubbell and Legrand [`09_moat.md` §2]. `04` §7 grid B: even the forecast peak of 22.5% gives only $81.72/sh | **No** — not a stretch, an impossibility |
| **FCFF/revenue conversion held at the LTM 14.86%** while revenue multiplies 5.9x | LTM cash conversion (CFO ÷ EBITDA) is **64.3%**, down from 77.0% five years ago and from a FY2024 peak of 95.2% [`09_moat.md` §5 panel] | `earnings/06` §2–§3: cash conversion cycle **+76.4 days** and lengthening; NWC rose $219.7m in H1 FY26. Growth *absorbs* cash here — `04` §2 charges NWC at 13.0% of revenue for exactly this reason | **Stretch at best** — and it makes the revenue requirement in §3.3 larger, not smaller |

**The four-sentence judgement.** The market's implied expectations at $171.16 are **aggressive**, and the binding constraint is duration rather than rate: nVent has grown mix-weighted segment profit at 24.8–62.9% and group free cash flow at 24.8–33.6%, so a 21.8% *rate* is well inside what it has actually done — but it has done it for three years, off a low base, into a peak, and the price needs nine and a half consecutive years of it starting from that peak. The evidence that the run continues is already weakening in the company's own disclosures: organic orders decelerated from about +40% to "low double digits" and backlog fell sequentially from $2.6bn to $2.5bn [`Q1` and `Q2 FY26 transcripts, prepared remarks`], while consensus itself fades revenue growth to +8–10% by FY2029–30 [`Capital IQ Estimates → Consensus`]. The margin route is closed outright — the price needs a ~64% steady-state EBITDA margin against an own best-ever of 22.4% and a peer-normal operating margin of 20.7% — so the entire expectation rests on volume. And the durability evidence for a twelve-to-twenty-year run of that volume does not exist: `09_moat.md` returns "No moat proven" with a through-cycle return on capital of 8.10% against the company's own disclosed 10.0% cost of capital, in an industry scored 40/100 on rate of change.

### 3.3 Market-ceiling sanity check (one-directional — it can only raise the bar)

nVent is an **Operating** business [`00_valuation-data-triage` §3], so the revenue-size test applies. The primary solve produced an implied *cash-flow* CAGR, so it is converted to the implied **revenue** trajectory first, holding the free-cash-flow conversion fixed at `04`'s own figures.

```
$ python3 rdcf2.py  (market-ceiling block)
    $171.16: FY2035 FCFF  4238.1 @ conv LTM 14.86% (718.3/4834.0)  -> revenue $ 28521.2m ; CAGR from LTM 4834.0 over 9.0y = 21.80%
    $171.16: FY2035 FCFF  4238.1 @ conv 13.28% (1515.3/11413.7)    -> revenue $ 31922.3m ; CAGR = 23.34%
    $156.03: FY2035 FCFF  3815.7 @ conv LTM 14.86%                 -> revenue $ 25678.9m ; CAGR = 20.39%
    $156.03: FY2035 FCFF  3815.7 @ conv 13.28%                     -> revenue $ 28741.1m ; CAGR = 21.91%
```

| Conversion held fixed | Implied FY2035 revenue at **$171.16** | at **$156.03** | Implied revenue CAGR from LTM $4,834m |
|---|---:|---:|---:|
| FCFF/revenue **14.86%** (the LTM base: 718.3 ÷ 4,834.0) — the friendlier assumption | **USD 28,521m** | USD 25,679m | 21.8% / 20.4% |
| FCFF/revenue **13.28%** (`04`'s own FY2035 model conversion: 1,515.3 ÷ 11,413.7) | USD 31,922m | USD 28,741m | 23.3% / 21.9% |

**No credible addressable-market figure exists, and it is not invented.** `business-model/08_competitive-map.md` §2 states it outright: *"No HHI, no top-four share and no market-size figure exists in the pool or was sourced… anyone needing it must buy a market study."* The strict market-share test is therefore **Not assessable**, and no TAM is fabricated to fill the hole (CLAUDE.md §4 — market size is a low-tier input; say so rather than invent one). What is run instead is the **defensible scale proxy the rule permits — category revenue of the named competitors**, which is sourced.

| Scale reference | Revenue | Implied NVT FY2035 of $28,521m as a multiple | Source |
|---|---:|---:|---|
| ABB | $35,752m | 0.80x | `CIQ Competitors export (NVT), retrieved 2026-09-07` — tier-5 vendor, via `08_competitive-map.md` §2 |
| Eaton (group) | $30,000m | **0.95x** | same |
| Legrand | $11,700m | 2.44x | same |
| Hubbell (LTM) | $6,200m | 4.60x | same |
| **nVent (LTM Jun-2026)** | **$4,834m** | **5.90x its own current size** | `Capital IQ Financials export → Income Statement`, LTM 12m Jun-30-2026 |

**What the proxy says, and it only makes the bar higher.** To justify $171.16, nVent must reach roughly the **entire current group revenue of Eaton** — 0.95x — and about **0.8x ABB's**, from a base that is today one-sixth of Eaton's and one-seventh of ABB's, inside nine years. It must do so while those firms compete for the same demand and are not standing still: Eaton's Electrical Americas backlog was **$15.3bn** at end-2025 against nVent's **entire group** backlog of **$2.5bn**, and Eaton's twelve-month rolling orders in that unit were **up 41%** [`Eaton FY2025 release, 2026-02` and `Eaton Q2 2026 release, 2026-07-30` — company releases, unverified web copies, via `08_competitive-map.md` §2]. No named peer has ever moved from nVent's current scale to Eaton's inside a decade. **This check therefore flags the implied expectation as aggressive on market-ceiling grounds independently of nVent's own history** — which is the one direction it is allowed to move the answer. It cannot and does not justify any upside.

---

## 4. Robustness

```
$ python3 rdcf3.py
== §4a ROBUSTNESS - discount rate ==
   WACC  9.22% -> $171.16: 19.216%   $156.03: 17.844%
   WACC 10.22% -> $171.16: 21.801%   $156.03: 20.389%
   WACC 11.22% -> $171.16: 24.216%   $156.03: 22.766%
== §4b ROBUSTNESS - FCFF base (all three from 04 §1/§4) ==
   low 678.5    -> $171.16: 22.714%   $156.03: 21.299%
   base 718.3   -> $171.16: 21.801%   $156.03: 20.389%
   high 819.8   -> $171.16: 19.691%   $156.03: 18.283%
== §4c ROBUSTNESS - terminal g +/-0.5% ==
   g_T 2.5% -> $171.16: 21.848%   $156.03: 20.435%
   g_T 3.0% -> $171.16: 21.801%   $156.03: 20.389%
   g_T 3.5% -> $171.16: 21.754%   $156.03: 20.342%
```

**(a) Discount rate.**

| Discount Rate | Implied FCFF CAGR at **$171.16** | at **$156.03** |
|---|---:|---:|
| WACC −1% (9.22%) | 19.22% | 17.84% |
| **WACC (10.2152%)** | **21.80%** | **20.39%** |
| WACC +1% (11.22%) | 24.22% | 22.77% |

**(b) FCFF base — the three figures `04` itself derived; none is invented here.**

| FCFF base | Where it comes from | Implied FCFF CAGR at **$171.16** | at **$156.03** |
|---|---|---:|---:|
| Low — **678.5** | `04` §4: filed H1 FY26 actual + `04`'s conservative H2 model (the working-capital conservatism) | 22.71% | 21.30% |
| **Base — 718.3** | `04` §1: normalized LTM FCFF to 30-Jun-2026 | **21.80%** | **20.39%** |
| High — **819.8** | `04` §4: implied by the company's own 90–95% free-cash-flow conversion guidance | 19.69% | 18.28% |

**(c) Terminal growth ±0.5% — required, because the terminal is 60.6% of EV at the implied solve.** At the price-implied growth rate the terminal value is **60.6%** of enterprise value at $171.16 (59.6% at $156.03), above the ~60% trigger, so `g` is varied even though `04`'s own base sat at 45.6%.

| Terminal `g` | Implied FCFF CAGR at **$171.16** | at **$156.03** |
|---|---:|---:|
| 2.5% | 21.85% | 20.44% |
| **3.0% (base)** | **21.80%** | **20.39%** |
| 3.5% | 21.75% | 20.34% |

**Which input dominates: the discount rate, and by a wide margin — and this is the reverse of the usual pattern, so it is named rather than assumed.** Across the bands tested the swing in implied growth is **5.00pp** for WACC ±1%, **3.02pp** across the full FCFF-base band ($678.5m to $819.8m, a −5.5%/+14.1% span), and **0.10pp** for terminal `g` ±0.5%. The reason is structural, not a quirk: `04` pins terminal return on capital to the cost of capital, so the terminal value is `NOPAT ÷ WACC` and the whole valuation scales with `1/WACC` — while for the same reason growth creates no value in the terminal, which is why `g` barely moves anything (the identical flatness `04` §7 found down its own rows). **Two things survive every cell of every table above.** First, the implied growth never falls below **17.8%** anywhere — even at the friendliest combination (lowest discount rate, highest cash-flow base, at the fresher price) it is 18.3%, still more than double `04`'s modelled 8.6%. Second, `g` is not where the argument lives: anyone who wants to defend this price by nudging terminal growth is moving a lever worth a tenth of a percentage point.

---

## 5. What's-Priced-In Read

**Leading with the fresher price, as `01` §7 requires.** At **$156.03** (close 2026-09-04, indicative and web-sourced — the pool-verified anchor of $171.16 is 26 calendar days / ~17–19 trading days stale), the market is pricing nVent's free cash flow to compound at **20.4% a year for nine and a half years** — from $718m to $3.8bn — and revenue to reach roughly **$25.7–28.7bn**, five to six times today's $4.8bn. At the stale pool anchor of **$171.16** the requirement is **21.8% a year** and revenue of **$28.5–31.9bn**. That is **aggressive**, and the reason is duration rather than rate: mix-weighted segment profit grew 24.8% (FY24→FY25) and 62.9% (H1 FY26) and group free cash flow compounded at 33.6% over FY2022–FY2025, so nVent has cleared this *rate* — but only for three years, off a small base, into a cycle peak, and the price needs nine and a half consecutive years of it starting from that peak, while its own organic orders have already decelerated from ~+40% to "low double digits" and backlog has slipped from $2.6bn to $2.5bn.

**The margin door is shut and the market-size door is narrow, which leaves nothing to absorb a disappointment.** To justify the price on profitability instead of volume would need a steady-state EBITDA margin near **64%** against an own best-ever of 22.4% and a peer-normal operating margin of 20.7% — impossible, not merely demanding. To justify it on volume, nVent must reach about **0.95x Eaton's entire current group revenue** within nine years, against a rival whose Electrical Americas backlog alone is six times nVent's whole order book and whose orders in that unit are growing 41%. And the durability evidence for a twelve-to-twenty-year advantage period is absent: `09_moat.md` returns **"No moat proven"** with a through-cycle return on capital of 8.10% against the company's own disclosed 10.0% cost of capital, in an industry scored 40/100 on rate of change.

**The expectations embedded in this price sit above what the evidence in this run supports the company delivering, and that is downside, not upside.** The gap is not marginal: the price needs **20.4–21.8%** cash-flow growth where `04`'s consensus-fed model produces **8.6%**, and the dual solve says the same thing from the other side — reconciling today's price to `04`'s own cash flows takes a **6.21% discount rate**, 3.79pp below the weighted-average cost of capital nVent discloses in its own goodwill test and only 1.42pp above the US 10-year Treasury. This module produces no fair-value level and no rating; `07_scenario-and-fair-value` owns the levels and the master synthesizer owns the bet.

---

### What travels forward to `07` and `99`

- **Market-implied discount rate for `04` §3A's open row: 6.210% at $171.16, 6.529% at $156.03** (ratio 0.608x / 0.639x to the 10.215% model WACC). **`04`'s escalation trigger does not fire** — the model WACC is far above two-thirds of the market-implied rate, so **no `RF-VAL-003` tag arises.** This agent did not edit `04`; carry the figure from here.
- **Implied FCFF CAGR: 21.80% at the pool anchor, 20.39% at the indicative refresh.** Robust range across every sensitivity cell: **17.84% – 24.22%**. The dominant input is the **discount rate** (5.00pp swing), not the cash-flow base (3.02pp) and emphatically not terminal `g` (0.10pp).
- **Terminal value is 60.6% of EV at the price-implied solve** (vs 45.6% in `04`'s forward model) — above the ~60% line, so the `g` sensitivity was run and is shown.
- **Verdict: aggressive.** Achievability is "No" on duration, "No" on the moat/advantage period, "No" on margin, and flagged on market-ceiling grounds by the peer-scale proxy.
- **Limitations, stated:** (1) the strict addressable-market test is **Not assessable** — no market-size figure exists in the pool and none was invented; a peer-revenue scale proxy was used instead and can only raise the bar, never lower it; (2) the implied-margin figure is a **linear extrapolation far outside `04` §7 grid B** and is a direction, not a point; (3) everything here is **pre-Maverick-Power** on both the cash-flow and the debt side, consistent with `04` and `01`; (4) `01`'s **price-staleness cap of 60** on valuation confidence travels with every read above; (5) the FY2025 10-K is absent from the pool, so FY2025 figures are vendor- or deck-sourced and cited as such; (6) the risk-free rate, ERP and beta inside `04`'s WACC are web-sourced, dated and unverified.
