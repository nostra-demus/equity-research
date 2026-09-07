# Scenario & Fair Value — NVT

**Evidence binding: frozen.** Every pool read resolved through the bound generation `6db32848…1aecd1e6`; `data/NVT/…` is a citation label only. Live `data/NVT/` and `_pool_extracts/` were not read. This agent consumes `00`–`06` and does not re-run any method.

**Regime and anchors, taken verbatim from `01_price-and-capital-structure` §7 (MODULE_RULES → Reconciliation Gate 1).** US SEC filer, **US GAAP**, **USD in millions** (per-share in dollars), fiscal year ends 31 December. Price-state **`pool-verified`**: **USD 171.16**, close **2026-08-12**, **stale by 26 calendar days ≈ 17–19 trading days**; corroborated indicative refresh **USD 156.03**, close **2026-09-04**, web-sourced and unverified, a **−8.84%** drift. Net debt **USD 1,236.4m — strict §15 basis** (broad identical; no short-term investments). Fully diluted shares for per-share fair value **164.2m**. Canonical EV **USD 28,940.0m** at the anchor.

**Three facts govern every number below and are stated once so they travel.**
1. **The price anchor is stale.** Every price-relative read is published at **both** prices, each labelled with its price and as-of date, leading with the fresher one (MODULE_RULES → Price freshness). The fair-value **levels** are price-independent and do not move when the anchor is re-anchored.
2. **Everything is pre-Maverick-Power.** The $1.75bn cash acquisition (plus up to $550m earn-out, ~$700m of target 2026 revenue, close expected Q4 2026, funded from cash on hand and new debt) was announced **2026-08-24** [`nVent news release, 2026-08-24`] — after the price anchor (2026-08-12), after the whole consensus set (to 2026-08-07) and after the 30-Jun-2026 balance sheet. Cash flows and debt are pre-deal on both sides, consistently.
3. **Both multiples methods flagged their reference point cycle-elevated.** `02` and `03` each emitted `RF-VAL-001`, in the **same direction**. Their agreement is not corroboration — see §2.

---

## 1. Method Summary

| Method | Fair / Implied Value (per share) | Confidence | Weight | Why This Weight |
|---|---:|---|---:|---|
| Own-history multiples (`02`) | **No base point published** — `02` §4 is marked *"ILLUSTRATIVE ONLY — NOT A FAIR-VALUE INPUT FOR `07`"*; the illustrative median-reversion markers run $109.82–$194.36, and the most reliable single marker (TEV/NTM EBITDA median) is $145.94 | **Low** — window is ~1.5 years (six quarterly closes) against the 3–5 years the method needs; `ciq_facts.json` itself calls the read *"LOW-CONFIDENCE (6 closes <8q ≈2y)"*; `RF-VAL-001` fired (cycle-elevated), method confidence capped 60 | **0%** | **Zero-weighted because its own producer declared it non-value-producing.** A mean struck off six quarters inside one continuous upswing is not a through-cycle warranted multiple. It stays in the football field (§2) for transparency and supplies the **evidenced multiple bounds** for §3 (actual traded levels, which `02` §2 explicitly permits `07` to use) — but it does not enter the base point |
| Relative / peers (`03`) | **$141.37** = warranted forward P/E **24.5x** × NTM EPS **$5.77** | **Mixed** — no peer multiples exist in the pool (`ciq_facts.json` `peer_ev_ebitda: missing`), so every peer multiple is web-sourced 2026-09-07 and unverified (overall usefulness max 70); `RF-VAL-001` fired (peer anchor cycle-elevated) | **67%** | **Multiples-first (Scenario Construction §1).** nVent is an Operating company with a usable forward metric — NTM EPS $5.77, reconciled across two independent providers to the cent [`Capital IQ Estimates → Multiples`, NTM P/E 29.6612x ÷ $171.16; `Web: stockanalysis.com`, 27.04x ÷ $156.03] — so the multiples methods carry the majority. With `02` zero-weighted, `03` carries that majority alone. That concentration is itself a limitation and is why confidence is capped at 55 |
| Intrinsic DCF (`04`) | **$76.30** (grid dispersion $62.70–$95.26; structural-runoff terminal $69.92) | **Good on construction, capped by inputs** — terminal value only 45.6% of EV (no terminal-dominance cap); WACC 10.22% reality-tested and sits **+0.22pp above** the company's own disclosed 10.0% group rate [`FY24 10-K, MD&A — Critical Accounting Estimates, p.32`]; no `RF-VAL-003` escalation; but rf/ERP/beta are web-sourced and FY2031–35 is the agent's own fade | **22%** | Cross-check per Scenario Construction §1, which caps `04`+`06` **combined** at ≈ ⅓. It gets the larger half of that budget because it is the **only method built on filing-grade cash flows and the company's own disclosed cost of capital**, and because its terminal fades ROIC to WACC — which is what allows the No-moat structural reset to be demoted to a §24 floor rather than becoming the headline bear (see §3) |
| Reverse-DCF (`05`) | *(implied, not a value)* — price implies **+21.80%** FCFF CAGR for 9.5 years at $171.16, **+20.39%** at $156.03; implied discount rate **6.21% / 6.53%** against a 10.22% model WACC and a 10.0% company-disclosed rate | **Good** — inverts `04`'s own machine and replicates `04` §6/§7 to the cent | **n/a** | Cross-check, never a weighted input. It informs whether the base case is achievable — and its verdict is **"aggressive, not achievable on duration"** |
| Sum-of-the-parts (`06`) | **$152.16** (range $127.83–$176.49) | **Low — self-declared** | **11%** | Value-producing (it cleared the forward-basis hard rule: FY2026E segment metrics × forward comparable multiples), so it is not zero-weighted — but its own author instructs *"`07` should keep `06` inside the minority cross-check weight, not elevate it."* Five stated limits: web-sourced comparables, an inferred H2 segment split, tier-5 FY2025 comparatives, an untestable data-centre re-rating, and the stale anchor |

**Weights sum to 100% across the value-producing, business-type-valid set (03, 04, 06).** nVent is an **Operating** company, so the Business-Type Method Map's operating methods apply and none is invalid by type. `02` is excluded on its producer's own illustrative-only declaration. `05` is a cross-check by construction. The **combined cross-check weight (04 + 06) is exactly 33%**, at the ≈ ≤ ⅓ cap; no stated reason elevates either above it (nVent is not a holding company, and SOTP is not primary here).

---

## 2. Triangulation & Reconciliation

### 2A. The method football field — the honest cross-method spread, not narrowed

| Method | Value / Range | Confidence | Weight | Why this weight |
|---|---:|---|---:|---|
| `02` own-history multiples | **no point**; illustrative markers $109.82 – $194.36; five-row cluster $143.37 – $160.47; best single marker $145.94 | Low (1.5-yr window; `RF-VAL-001`) | 0% | Producer-declared illustrative-only |
| `03` peers | **$141.37**; dispersion $127.29 – $144.17 (7-peer median), widening to $116.15 – $144.17 on the core three | Mixed (all peer multiples web-sourced; `RF-VAL-001`) | 67% | Multiples-first majority, carried alone |
| `04` intrinsic DCF | **$76.30**; grids $62.70 – $95.26; 15x exit-multiple ceiling $120.88 | Good construction, web-sourced rate inputs | 22% | Cross-check cap; the only filing-grade cash-flow read |
| `06` SOTP | **$152.16**; range $127.83 – $176.49 | Low (self-declared) | 11% | Minority cross-check, per its own instruction |
| *Memo:* `03`'s Maverick transaction comp | *$77.41 (11.5x forward EBITDA on FY2026E), offered as a gap-size read, not a fair value* | — | 0% | The one genuinely independent input set |
| **Full high-to-low field, valid value-producing methods** | **$76.30 – $152.16** | — | — | **Spread = 99.4% of the low value (49.9% of the high)** |

> **HEADLINE FINDING: the methods disagree by 99.4%, and that disagreement is the finding.** MODULE_RULES Reconciliation Gate 6 and the Score-Cap table both bind: **valuation confidence is capped at 55**, and the cap is **not waived because the prose below explains the gap**. A DCF at $76.30 and a SOTP at $152.16 are not two estimates of one number; they are two different claims about what nVent is.

### 2B. Sector cycle distortion — one distorted read counted twice, named

**Both `02` and `03` fired `RF-VAL-001` in the same direction (cycle-elevated).** `02` §5: nVent's entire 1.5-year multiple history sits inside a sector-wide re-rating — S&P 500 Industrials forward P/E roughly **16.0x (late 2022) → 25.5x**, about **+59%** [`Web: Yardeni Research QuickTakes, retrieved 2026-09-07 — indicative, unverified`]. `03` §6: the peer-median anchor is elevated on the same driver — industrials forward P/E ~24.25–24.5x against a ~17.0x 25-year average (**+43%**), with Eaton's EV/EBITDA up **+59%** since 2021 (17.06x → 27.14x) and Hubbell's **+16%** [`Web: stock-analysis-on.net / valueinvesting.io / siblisresearch.com / macromicro.me, retrieved 2026-09-07 — unverified`].

**Stated plainly: `02`'s own-history band and `03`'s peer median are not two independent corroborating reads. They are the same sector cycle counted twice.** The compounding rule (Scenario Construction §3) therefore applies and the **combined base-case valuation confidence is capped at 55** — and the multiples-first majority weight is **not** applied on autopilot: it is applied because the hard rule requires it for an Operating company with estimates, while confidence in the resulting point is cut to the cap and said so here. Two further, independent reasons that concentration is uncomfortable: **`03`'s peer multiples are not in the data pool at all** (every one is web-sourced on a single date from a single provider), and **`06`'s comparables come from the same provider on the same date**, so `03` and `06`'s apparent agreement at $141–$152 is a third instance of the same non-independence, not confirmation.

### 2C. What IS independent — and it lands 45% lower

Two reads in this run rest on genuinely different input sets from the public-multiple cluster, and they converge to within **1.5%** of each other:

- **`04`'s intrinsic DCF: $76.30**, built on filed cash flows (LTM CFO from continuing operations $772.8m − capex $112.9m + after-tax interest $58.4m = FCFF base $718.3m) and discounted at 10.22%, which is **+0.22pp above the 10.0% weighted-average cost of capital nVent itself discloses and applies to every reporting unit** in its own goodwill test [`FY24 10-K, MD&A, p.32`].
- **`03`'s Maverick transaction comparable: $77.41**, the arm's-length private-market clearing price this company's own management just agreed — *"approximately 11.5 times anticipated 2026 adjusted EBITDA"* — for the same data-centre power growth exposure, at essentially the same EBITDA margin (~21.7% vs nVent's 21.71%) [`nVent news release, 2026-08-24`].

### 2D. Base-case fair value — the single point, and the reconciliation judgement behind it

> **Base-case fair value: USD 128.24 per share.** `0.67 × 141.37 + 0.22 × 76.30 + 0.11 × 152.16 = 128.24` — the mechanically-weighted blend of §1's weights, produced by the executed snippet in §3, **not** re-anchored afterwards. It implies **22.23x** NTM EPS of $5.77 (`128.24 ÷ 5.77`), or **16.4x** EV/NTM EBITDA (`(128.24 × 164.2 + 1,236.4) ÷ 1,359.8`).

**The lens I trust most for this company is `04`, and the lens that carries the weight is `03` — those are not the same statement, and the gap between them is the reconciliation.** The hard multiples-first rule (Scenario Construction §1) makes `03` the majority for an Operating company with a usable forward metric, so the published base is anchored there and pulled down by the cross-checks; I do **not** get to swap lenses because I prefer the DCF. What I do instead is refuse to let the arithmetic imply that the truth sits in the middle: **$128.24 is where the policy's weights land, not a claim that nVent is worth roughly halfway between its cash flows and its comps.** The three multiples reads ($145.94 illustrative, $141.37, $152.16) share one web-sourced peer set inside one cycle-elevated sector, while the two independent reads ($76.30, $77.41) sit 45% lower — so the risk in the base point is asymmetric and runs downward. `05` says the same thing from the price side: to pay $156.03 you must believe free cash flow compounds at **20.4% for nine and a half consecutive years** off a base that both `earnings/01` and `01` flag as a cycle peak, against the **8.6%** `04`'s own consensus-fed forecast delivers, while organic orders have already decelerated from ~+40% to "low double digits" and backlog has slipped $2.6bn → $2.5bn [`Q1`/`Q2 FY26 transcripts, prepared remarks`]. No lens swap and no conservative override was applied to the published point; the honest response to the 99.4% dispersion is the confidence cap of 55, stated here rather than absorbed.

---

## 3. Bull / Base / Bear Fair-Value Levels

**Every case is one derived LEVEL (a point) built as `forward metric × multiple`, on one common forward period — NTM, roughly Q4-2026 through Q3-2027.** NTM revenue is `0.25 × FY2026E guided 5,372.5 + 0.75 × FY2027E consensus 6,368.6 = $6,119.6m`. Earnings per share is built as `(revenue × adjusted return on sales − $65.0m guided interest) × (1 − 22.4% effective tax) ÷ 164.1m diluted shares` [`Q2 FY26 10-Q, income-tax note` and `Note 4`; `Capital IQ Estimates → Guidance`, interest expense FY2026]. **The base build reproduces consensus:** `6,119.6 × 21.1% = 1,291.2`; `(1,291.2 − 65.0) × 0.776 ÷ 164.1 = $5.80`, against the consensus NTM EPS of **$5.77** — a 0.5% gap, so the machine is calibrated before it is used. **Horizon: 12 months to 2026-09-07 + 1 year**, for all three cases; the structural reset below carries a different, longer horizon and says so.

| Case | Fair Value / Share (point) | Forward Metric (NTM adj. diluted EPS) | Multiple | Horizon | What Must Be True (operating drivers) |
|---|---:|---:|---:|---|---|
| **bull** | **USD 198.88** | **$6.63** — NTM revenue $6,519.6m (data-centre revenue **+20%**, i.e. +$400m on the guided >$2.0bn base) × adjusted ROS **22.5%** (30% incremental conversion — management's own former target) | **30.0x** NTM P/E | 12 months | Data-centre order intake re-accelerates: backlog back above **$2.6bn** and organic orders back out of "low double digits" at the **30-Oct-2026** Q3 print; Blaine 1 and Blaine 2 capacity absorbed at 30% incrementals; tariff and copper cost recovered at or above the measured 58% offset. Implied GAAP EBITDA margin **23.5%**, just above `04`'s forecast peak of 22.8% and the LTM 22.2% |
| **base** | **USD 128.24** | **$5.77** — consensus NTM EPS; NTM revenue $6,119.6m × adjusted ROS **21.1%** (the guided FY2026 level) | **22.23x** NTM P/E *(derived from §2D's weighted point, not assumed)* | 12 months | Consensus delivers: FY2026 revenue at the +37–39% guided midpoint and adjusted EPS $5.00–5.10, FY2027 at the 17-estimate consensus of $6,368.6m; cost inflation recovered at the measured **58%** H1 FY26 offset; the multiple settles at roughly the current peer median (22.06x) as the growth premium `03` sizes at +2.44 turns is competed away. Implied GAAP EBITDA margin **22.2%**, at the LTM level |
| **bear_cyclical** *(the headline bear)* | **USD 77.23** | **$4.29** — NTM revenue $5,719.6m (data-centre revenue **−20%**, −$400m) × adjusted ROS **17.0%** | **18.0x** NTM P/E | 12 months | Backlog keeps falling through the 30-Oct-2026 and Feb-2027 prints; the ~$2.5bn backlog (≈47% of guided FY2026 revenue) runs off faster than it is replaced while three committed Minnesota plants enlarge the fixed base; operating deleverage reverses the absorption gain. Implied GAAP EBITDA margin **18.1%** |
| **bear_structural** *(NOT the headline — the §24 avoid-ruin floor)* | **USD 69.92** | impaired terminal: `04` §5 runoff — terminal EBITDA margin **17.5%** (the FY2022 trough level, non-recovering) at **0.0% nominal** terminal growth (≈ **−2.3% real**, i.e. permanent real shrinkage) | *not a multiple* — impaired-DCF enterprise value $12,716.8m | **24–36 months** | Liquid-cooling architecture or the 800-volt DC rack standard settles against nVent's product set; the growth vertical becomes a share loss rather than a cycle. Permanent impairment, not a recoverable trough |

### 3A. The arithmetic, executed

```
$ python3 fv.py
== B. WEIGHTED BASE POINT (multiples-first: 03 majority; 04+06 combined <= 1/3) ==
  weights sum = 1.00 ; cross-check (04+06) = 0.33
    03 peers    141.37 x 0.67 =  94.718
    04 DCF       76.30 x 0.22 =  16.786
    06 SOTP     152.16 x 0.11 =  16.738
  WEIGHTED BASE FAIR VALUE = $128.24/sh
== C. FORWARD METRIC BUILD (common period = NTM, ~Q4-26 to Q3-27) ==
  NTM revenue = 0.25*5372.5 + 0.75*6368.6 = 6119.6
  BASE  rev 6119.6 x ROS 21.1% -> adj op 1291.2 -> EPS $5.80  (consensus NTM EPS $5.77 -> gap +0.5%)
  BULL  rev 6519.6 x ROS 22.5% -> adj op 1466.9 -> EPS $6.63  (+14.9% vs base metric)
  BEAR  rev 5719.6 x ROS 17.0% -> adj op  972.3 -> EPS $4.29  (-25.6% vs base metric)
== D. CASE LEVELS = forward metric x multiple ==
  BASE multiple implied by the weighted point = 128.24 / 5.77 = 22.23x
  BULL  6.63 x 30.0x = $198.88
  BASE  5.77 x 22.23x = $128.24
  BEAR  4.29 x 18.0x = $77.23
  ordering check: bull mult 30.0 >= base 22.23 >= bear 18.0 ? True
  metric ordering: 6.63 >= 5.77 >= 4.29 ? True
== E. IMPLIED EV/NTM EBITDA SANITY (NTM EBITDA 1359.8 per 02 s1) ==
  bull $ 198.88 -> EV 33892.6 -> 24.92x   base $ 128.24 -> EV 22293.7 -> 16.39x   bear $ 77.23 -> EV 13917.7 -> 10.24x
  (current 21.39x; own-history NTM band 12.40-27.23x, mean 18.43x)
== F. STRUCTURAL-RESET / AVOID-RUIN FLOOR (EV-based; 04 s5 runoff terminal) ==
  impaired EV 12716.8 - canonical STRICT net debt 1236.4 = equity 11480.4
  / 164.2m fully diluted = $69.92/sh   (net debt subtracted BEFORE dividing)
  worse-of test: cyclical trough $77.23 vs structural reset $69.92 -> worse = $69.92
== I. SYMMETRY / FAKE-ASYMMETRY CHECK vs 02's own-history P/NTM EPS band ==
  02 band: min 14.87 / mean 25.82 / median 26.66 / current 29.66 / max 38.16
  bull travel toward max = (30.0-22.23)/(38.16-22.23) = 48.8% of the way
  bear travel toward min = (22.23-18.0)/(22.23-14.87) = 57.4% of the way
```

```
$ python3 margin_basis.py     # s15 matched-basis check on the case margins
BULL: rev 6519.6 | adj op 1466.9 = adj ROS 22.50% | GAAP EBITDA 1531.9 = 23.50%
BASE: rev 6119.6 | adj op 1291.2 = adj ROS 21.10% | GAAP EBITDA 1356.2 = 22.16%
BEAR: rev 5719.6 | adj op  972.3 = adj ROS 17.00% | GAAP EBITDA 1037.3 = 18.14%
Benchmarks (matched GAAP EBITDA-margin basis, earnings/01 s1):
  FY2022 (own prior trough) 17.2% | FY2023 21.6% | FY2024 22.4% | FY2025 21.2% | LTM Jun-26 22.2%
  04 s5 mid-cycle terminal 20.0% ; 04 s5 runoff/structural terminal 17.5%
```

### 3B. Where the multiples come from — anchored to `02`'s evidenced band, not invented

`02` withheld its mean/median as a fair-value input but explicitly permits `07` to use its **observed min/max as evidenced outer bounds**, "since those are actual traded levels rather than a derived central tendency." On **P / NTM EPS** the six-quarter band is **min 14.87x · mean 25.82x · median 26.66x · current 29.66x · max 38.16x**.

- **Bull 30.0x** — roughly where the stock actually traded on the anchor date (29.66x), below the observed high of 38.16x. The bull is "the August multiple holds while earnings beat," not a new high. Implied EV/NTM EBITDA of **24.9x** sits inside the observed 12.40–27.23x NTM band.
- **Base 22.23x** — derived from §2D's weighted point, not assumed. It is **below** the own-history mean, median and current level, and essentially **at the current peer median of 22.06x**. It is inside the observed range (above the 14.87x min), so the base does not require a multiple this company has never traded at.
- **Bear 18.0x** — compressed toward, but not to, the observed min of 14.87x; roughly the low-growth end of the current peer set (Atkore 15.19x, ABB 20.61x, Hubbell 21.23x). Implied EV/NTM EBITDA of **10.2x** is below the observed 12.40x floor, which is deliberate: `02` §6 warns that band's bottom "is a level from inside the boom, not a downside anchor tested against a downturn."

**Fake-asymmetry check, run and passed.** The band is right-skewed (base to max = 15.93 turns; base to min = 7.36 turns). The bull travels **48.8%** of the way to the observed maximum; the bear travels **57.4%** of the way to the observed minimum. The bear moves the larger fraction of its own side, so the set is not a peak-metric-and-peak-multiple bull against a mild-haircut bear.

### 3C. The bear is a true through-cycle trough, and here is the prior-downturn evidence

**nVent has under one full standalone cycle.** It was spun out in 2018, and the pool contains **no organic revenue decline at all** in the post-divestiture record — `earnings/07` §2 states it outright: *"there is no organic-revenue decline in the post-divestiture record to measure a down-volume response against."* FY2022's apparent −6.8% revenue fall is an artefact of Thermal Management moving to discontinued operations and is marked NM [`earnings/01_historical-financials.md` §1, basis break 1].

**So the trough is anchored on the company's own worst reported margin year, named and cited: FY2022 — GAAP EBITDA margin 17.2%, GAAP EBIT margin 13.5%, revenue $2,295.1m** [`earnings/01_historical-financials.md` §1]. The bear above lands at an implied **GAAP EBITDA margin of 18.14%** — **0.94pp above** that documented trough and **1.4pp below** `04`'s benchmarked mid-cycle terminal of 20.0%. That is a real trough placement, not a mild dip off the peak, and it is not deeper than the history supports.

**The upstream sensitivity band was deliberately widened, and the reason is on the record.** `earnings/07` builds its ±20% data-centre move on a ±25% incremental conversion rate — but its own §6 says that rate **understates a down-volume decremental**, because it was measured on *rising* volume against a fixed base being deliberately enlarged (three Minnesota liquid-cooling plants; FY2026 capex guided ~$130m, up ~40%; D&A ~$230m), and because **109% of the Q2 FY26 operating-margin gain was fixed-overhead absorption** — SG&A fell 452.8bps while gross margin fell 67.9bps. `earnings/07`'s compound bear on its two largest variables is **−$1.02 of FY2026 EPS (−20.2%)**; this bear runs **−25.6%** on the NTM metric, reaching the FY2022 margin level rather than stopping at the sensitivity band's edge. Said explicitly, as required.

### 3D. Which case the structural reset becomes — the graduated rule, applied

**The trigger fired on two limbs.** `business-model/09_moat.md` §5 returns **"No moat proven — a moat in structure, not in economics"** (through-cycle ROIC **8.10%** against the company's own disclosed **10.0%** cost of capital), and `business-model/07_business-quality.md` §1 scores **industry rate-of-change 40/100**, at the ≤ ~40 disruption threshold, emitting `RF-BQ-005`.

**But the moat trajectory is `STABLE`, not eroding** — `09_moat.md` §5 states it in terms: *"the panel is split 4–3, so neither 'widening' nor 'eroding' is confirmed"*, and *"'erosion' must not be carried downstream as confirmed."* Under the graduated rule the structural reset is the headline Bear **only on a confirmed eroding trajectory**. It is not confirmed here. So:

- **The headline bear is `bear_cyclical` at $77.23** (12-month horizon).
- **`bear_structural` at $69.92 is carried to §24 / Kill Criteria as the labelled avoid-ruin floor** — the multi-year (24–36 month) permanent-impairment path, not the 12-month bear.

**The demotion is licensed, and the licence is checked rather than assumed.** A bare No-moat reset may only be demoted if a weighted method already prices the lost excess return. It does: **`04` is in the blend at 22% weight and its base terminal pins ROIC to WACC** — `04` §5, *"terminal ROIC is set equal to the WACC… a fade to the cost of capital with no moat premium"*, which costs about $14.4/share against the conventional shortcut terminal. So the No-moat economics are inside the published base point, not floating unpriced. The **worse-of** test is run and recorded regardless: the cyclical trough ($77.23) is **above** the structural reset ($69.92), so nothing is being hidden by the billing — both levels are published, both carry their own bridge, and both reach the master synthesizer under their own labels.

**Bridge discipline on `bear_structural` (the two cases do not share a convention, and that is stated).** `bear_cyclical` is an equity-multiple case: `NTM EPS × P/E` is already an equity value, so no net debt is subtracted. `bear_structural` is **enterprise-value based** (`04` §5's impaired-DCF EV of $12,716.8m), so it is bridged with `01`'s **canonical strict §15 net debt of $1,236.4m, subtracted BEFORE dividing**: `(12,716.8 − 1,236.4) ÷ 164.2m = $69.92`. Net debt is deducted once, on the one case that needs it.

### 3E. Span check and conjunction check (CLAUDE.md §10)

**Span check — what single piece of news could move this 10%+, and which case contains it?** The **Q3 FY2026 results on 30-Oct-2026**, and specifically two lines read together: organic order growth against the "low double digits" print, and group backlog against the $2.5bn at 30-Jun-2026. `09_moat.md` §5 names the exact thresholds: backlog above **$2.6bn** with gross margin recovering above 37.9% flips the read to widening; backlog below **$2.4bn** with gross margin under 37.0% flips it to eroding. The vertical grew **+115.6%** year on year in Q2 FY26 while orders decelerated from ~40% — this is a binary the stock can move far more than 10% on. **The bull case contains the re-acceleration** (+27.5% from $156.03, +16.2% from $171.16); **`bear_cyclical` contains the failure** (−50.5% / −54.9%). A second, dated event — the **Maverick Power close in Q4 2026** — is inside no case at all and is flagged in §3F. The set spans.

**Conjunction check — is either case a stack of independent conditions?** No, and this is deliberate. The bull needs three things (volume +20%, 30% incremental conversion, multiple to 30.0x) but they are **not independent**: `earnings/07` §5 states variables 1 and 2 are *"multiplicative by construction"*, and the multiple follows the beat. The bear needs the mirror three, and `earnings/07` §6 shows the margin collapse follows **mechanically** from the volume miss because 109% of the margin gain is fixed-overhead absorption. **One condition — whether the data-centre order book re-accelerates or keeps decelerating — drives all three rows in each case, symmetrically.** Neither side is built from a conjunction the other is spared.

### 3F. Maverick Power sits outside every level above — stated, not folded in

All four levels are pre-deal on both the earnings and the debt side, consistently. Two directional facts, neither quantified into a level because the pool cannot support it: (1) the deal was struck at **~11.5x anticipated 2026 adjusted EBITDA** against nVent's own **~21.4x NTM EV/EBITDA** at the anchor, so it is multiple-accretive on the company's own disclosure; (2) it adds roughly $1.75bn of debt — `balance-sheet-survival/01`'s labelled pro-forma net debt of **~$2,986.4m / ~2.43x** (*Inference, not from filings*) would take net debt per share from **$7.53** to roughly **$18.2** and move nVent from the least-levered end of its peer set to about its median. `earnings/07` rank 7 records the EPS effect as **"not quantifiable"** — Maverick's margin, its intangible amortisation and its cash-versus-debt funding split are all undisclosed. Inventing a number here would be exactly the failure the suppress-rather-than-guess rule exists to stop.

**No probabilities are assigned to any case.** That is the master synthesizer's work (MODULE_RULES → Scope; CLAUDE.md §10, §22).

---

## 4. Margin of Safety & Downside (two separate metrics)

**Mandatory inline staleness flag (`01` §7).** The pool-verified anchor's as-of date is **2026-08-12**, 26 calendar days / ~17–19 trading days before this run, and the corroborated 2026-09-04 quote is **8.84% lower** — enough to move every row below by roughly nine points. **Both prices are shown; the fresher read leads.** The fair-value levels themselves are price-independent, so anyone can re-anchor in one step: returns are `(level − price) ÷ price`.

**Read at the FRESHER price — USD 156.03, close 2026-09-04 (web-sourced, corroborated by two independent sources, unverified — *not* the anchor):**

| Metric | Value |
|---|---:|
| Current price | **USD 156.03** *(indicative, 2026-09-04)* |
| Base-case fair value (point) | **USD 128.24** |
| Bear-case fair value (`bear_cyclical`, the headline bear) | **USD 77.23** |
| Bull-case fair value | USD 198.88 |
| Implied upside to base case = (base FV − price) / price | **−17.8%** |
| **Margin of safety** = (base FV − price) / base FV — the cushion | **−21.7%** *(negative: there is no cushion — price sits above base fair value)* |
| **Downside to bear** = (price − bear FV) / price — ***inverted: higher = worse*** | **+50.5%** |
| *Memo:* upside to bull = (bull FV − price) / price | +27.5% |
| *Memo:* downside to the §24 avoid-ruin floor ($69.92, 24–36 months) — *inverted* | +55.2% |

**Read at the POOL-VERIFIED ANCHOR — USD 171.16, close 2026-08-12 (STALE ~17–19 trading days):**

| Metric | Value |
|---|---:|
| Current price | **USD 171.16** *(pool-verified, 2026-08-12 — stale)* |
| Base-case fair value (point) | **USD 128.24** |
| Bear-case fair value (`bear_cyclical`) | **USD 77.23** |
| Bull-case fair value | USD 198.88 |
| Implied upside to base case = (base FV − price) / price | **−25.1%** |
| **Margin of safety** = (base FV − price) / base FV — the cushion | **−33.5%** *(negative — no cushion)* |
| **Downside to bear** = (price − bear FV) / price — ***inverted: higher = worse*** | **+54.9%** |
| *Memo:* upside to bull = (bull FV − price) / price | +6.5% |
| *Memo:* downside to the §24 avoid-ruin floor ($69.92) — *inverted* | +59.2% |

**These are two different numbers and neither is a proxy for the other.** Margin of safety is the discount of price to the **base** fair value — here it is **negative at both prices**, meaning the price is above base fair value and there is no cushion at all, not a small one. Downside-to-bear is the loss if the bear case plays out; it is an **inverted** metric and at **+50.5% / +54.9%** it is the larger number by a wide margin. The price-state is `pool-verified`, so both metrics are assessable; the **staleness** cap (valuation confidence max 60) binds, and the wider **99.4% cross-method dispersion** cap (max 55) and the **same-direction `RF-VAL-001` compounding** cap (max 55) bind harder. **Most restrictive applies: valuation confidence 55.**

---

## 5. Warranted-Multiple Check

**The base case implies 22.23x forward earnings — a multiple nVent has traded at inside its own observed window and one the current peer median (22.06x) sits on, so the base does not require a re-rating this business has never earned.** What it does require is that the growth premium `03` sizes at +2.44 P/E turns is competed away rather than sustained, which is what the evidence supports: through-cycle return on capital of **8.10% against the company's own disclosed 10.0% cost of capital** [`business-model/09_moat.md` §3], a business-quality aggregate of **41/100** with cyclicality **30/100** and rate-of-change **40/100** [`business-model/07_business-quality.md` §1], **58.1%** of H1 FY26 sales in one vertical and **85.0%** in one region, and a $2.5bn group backlog against Eaton's $15.3bn in one segment alone. **Upside from here does not require a heroic multiple — the bull's 30.0x is roughly the anchor-date level — it requires the data-centre volume to hold, which is a different and larger bet than a re-rating.**

**Value-trap flag — one trigger fires and one does not.** The **ownership** trigger does **not**: `management-governance/04_ownership-and-insider-behavior.md` tested all three unaligned-owner structures and **RF-OWN-004 is not triggered**, so no owner-driven value-trap caveat applies and no shareholder-friendliness cap flows through (carried from `02` §6). The **sector-cycle** trigger **does**: §2B's Reality Test found the warranted multiple itself sits inside a cycle-elevated sector — the peer median that "justifies" 22.23x is itself ~43% above its own 25-year average, and Eaton's EV/EBITDA is up 59% since 2021. **A base case that deserves its multiple only because the whole sector currently does is not a durable warranted multiple**, and if the sector de-rates, the peer median and the base point fall together. That is a real value-trap risk in the specific sense that matters here: the downside case does not need nVent to disappoint on its own terms, only for the sector's multiple to normalise.

---

## 6. Fair-Value Read

**Base-case fair value is USD 128.24 a share (22.23x NTM earnings of $5.77), with a bull level of USD 198.88 (30.0x × $6.63) and a headline bear — `bear_cyclical` — of USD 77.23 (18.0x × $4.29); a separate 24–36 month structural-reset floor of USD 69.92 is carried to §24 as the avoid-ruin level, not as the 12-month bear.** Against the fresher indicative price of $156.03 (close 2026-09-04) the **margin of safety is −21.7%** — the price is above base fair value, so there is no cushion — while the **downside to bear is +50.5%** (inverted: higher is worse); at the stale pool anchor of $171.16 (close 2026-08-12) those become **−33.5%** and **+54.9%**.

**The method that drives the answer is `03_relative-valuation-peers`, and that is a weaker foundation than the weight suggests — which is the honest headline.** The multiples-first rule hands `03` a 67% weight because nVent is an Operating company with a usable forward metric; but `02` withheld its own base point as illustrative-only, `03`'s peer multiples are not in the data pool at all, and `02` and `03` both flagged their reference point cycle-elevated in the same direction, so their agreement is one distorted read counted twice rather than two corroborating ones. Meanwhile the two genuinely independent reads — `04`'s DCF at the company's own disclosed 10.0% cost of capital ($76.30) and the 11.5x private-market price management itself just paid for Maverick ($77.41) — converge to within 1.5% of each other, **45% below the base point**. The full cross-method field runs **$76.30 to $152.16, a 99.4% spread**, which caps valuation confidence at 55 whatever the prose says.

**The single biggest swing factor between bull and bear is one thing, not three: whether data-centre order intake re-accelerates or keeps decelerating, first testable at the Q3 FY2026 print on 30-Oct-2026.** It moves volume, the incremental conversion rate and the multiple together in the same direction — `earnings/07` shows variables 1 and 2 are multiplicative and that 109% of the latest margin gain is fixed-overhead absorption on volume that is already showing a book-to-bill near 0.93x against backlog down $2.6bn → $2.5bn. **Everything above is pre-Maverick-Power**, a $1.75bn deal that closes outside all four levels and is directionally multiple-accretive on nVent's own 11.5x disclosure while roughly tripling net debt per share.

---

**Partial data (declared):** no peer multiples in the pool → `03`'s and `06`'s comparables are web-sourced and unverified (overall usefulness max 70); own multiple history is ~1.5 years → `02` produced no fair-value input and is zero-weighted, so the multiples-first majority rests on `03` alone; price anchor stale ~17–19 trading days with an 8.84% drift → every price-relative read shown at both prices with an inline staleness flag; full high-to-low method field 99.4% → **valuation confidence capped at 55**; `RF-VAL-001` fired in `02` **and** `03` in the same direction → compounding rule, combined base-case confidence capped at **55**. Most restrictive applies: **55**.

**Out-of-scope items not produced here (correctly owned elsewhere):** scenario probabilities, the probability-weighted target price, expected return, risk/reward, the Buy/Sell rating and position sizing all belong to the **master synthesizer** (MODULE_RULES → Scope and Boundary; CLAUDE.md §10, §18, §22). This report produces fair-value **levels** and the margin of safety, and stops there.
