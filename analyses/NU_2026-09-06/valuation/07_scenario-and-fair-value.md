# Scenario & Fair Value — NU

**Scope note.** This agent reconciles `02`–`06` into one base-case fair-value POINT and the bull / base / bear fair-value LEVELS around it. It assigns no probabilities, computes no probability-weighted return, no risk/reward, no rating and no position size — those belong to the master synthesizer. It re-runs no method; every method value below is lifted from its producer.

**Anchors used verbatim from `01_price-and-capital-structure` §7.** Decision line **NYSE:NU · New York Stock Exchange · USD** (Class A ordinary shares, not an ADR). Price anchor **USD 14.30** (2026-08-28 close, price-state **`pool-verified`**), with a fresher corroborated indicative quote of **USD 15.37** (2026-09-04 close, web-sourced, unverified, +7.48%). Shares for per-share fair value **4,878,395 thousand** fully diluted. Tangible book value per share **USD 2.50** (LTM, Jun-30-2026). Dividend yield **0.00%** — no distribution has ever been declared. Net cash USD 7,744.6m (strict basis) is **not** netted into any fair value below: it is a bank's working liquidity inside regulated subsidiaries, and every method here is already an equity-level value.

**Business type governs which methods may be weighted.** `00_valuation-data-triage` classifies NU as a **Financial (bank)**. Under the MODULE_RULES Business-Type Method Map the valid set is **P/E, P/tangible book, and a residual-income (excess-return-on-equity) model discounted at the cost of equity**. EV/EBITDA, EV/EBIT, EV/Sales, an FCFF DCF and the EV bridge as a value are invalid for this issuer and appear nowhere below.

**Reporting basis.** IFRS Accounting Standards as issued by the IASB; presentation currency **USD**; fiscal year ends 31 December [FY2025 Form 20-F, cover page and Note 2]. Nu Holdings is a US-listed foreign private issuer filing Form 20-F — the absence of a 10-K / 10-Q is not a data gap (CLAUDE.md §27).

**All arithmetic below was produced by an executed Python snippet** (command, script and raw output printed in §7). Nothing here is mental arithmetic.

---

## 1. Method Summary

| Method | Fair / Implied Value (per share) | Confidence | Weight | Why This Weight |
|---|---:|---|---:|---|
| Own-history multiples (`02`) | **Excluded — not a fair-value input.** Reversion field USD 17.84 – 22.01 is labelled illustrative-only by its own producer | Low | **0%** | `02` §4 states in its own header that its observed history is **20 months, not 3–5 years**, that the figures are "illustrative only and NOT a fair-value input for `07`", and that it hands forward only the **band** to bound the bull/bear multiples. Zero-weighted for exactly that reason. Two further reasons reinforce it and are not averaged away: (a) restating today's price on the earnings module's cash-backed net income of USD 2,148.5m puts the current P/E at **32.7x — ABOVE the band's own 27.65x mean, not 30% below it** [`02` §3, citing `earnings/06_earnings-quality.md`]; (b) `03` §6 shows `02`'s entire 20-month window sits **inside** a Brazilian bank sector up-move, so a "below its own history" read from `02` is a window that never contained a normal level |
| Relative / peers (`03`) | **USD 14.73** — warranted NTM P/E 15.18x × NTM EPS USD 0.97 | Medium, **capped at 60** (RF-VAL-001) | **67%** | The only method on this list with an independent, forward, matched-basis evidence set: ten named LatAm financial comparables, all on the identical Capital IQ NTM basis as of 2026-08-29, applied to a forward metric with a growth premium sized explicitly and a printed double-count ledger. Under Method-Weighting Policy §1 (multiples-first for an operating-style issuer with usable forward estimates) `02` and `03` together carry the majority weight; with `02` zero-weighted, **`03` carries it alone**. Capped, not trusted flat: its peer-median anchor is flagged **cycle-elevated (RF-VAL-001)**, and it hands forward a ~2× internal disagreement (§2) |
| Intrinsic — residual income (`04`) | **USD 11.71** (as of 2026-08-28) | Medium | **33%** | The cross-check cap (≈ ≤ ⅓ combined for `04`+`06`) binds here, and `06` takes none of it. `04` is the only method that values NU on its own economics rather than on someone else's multiple, it is **not terminal-dominated** (terminal value is 15.3% of value), and its earnings path runs **above** the Street's own long-range strip in six of seven comparable years — so its low answer is not a pessimistic-forecast artefact. Held to a cross-check weight because ~47% of its value comes from a self-built ten-year fade benchmarked against a **one-broker** strip (1/1 estimates), which `04` §8 names as the first place to push back |
| Reverse-DCF (`05`) | *(implied, not a value)* — price implies a **permanent 22.08% return on equity**, or 7.68 more years of the FY2028 peak 35.53% return then nothing | Medium–High | **n/a** | Cross-check only, never weighted. It informs whether the base case is achievable, and its answer is the sharpest single line in the module: at USD 14.30 the model reproduces the price only on the **top of the Street's earnings range** (USD 14.65), so the mean forecast is not what is being paid for |
| Sum-of-the-parts (`06`) | USD 10.36 (collapsed single-segment) | n/a | **0%** | **Zero-weight instructed by its own producer.** NU reports **one** segment — Banking, 100% of revenue and 100% of pre-tax profit, tying to consolidated to the third decimal — and `06` §5 states its collapsed value "is **not** an independent method and must not be weighted as one… arithmetically the same construction as `03`" (same NTM EPS USD 0.97, same 2026-08-29 Capital IQ comp set). Weighting it beside `03` would be one read counted twice (CLAUDE.md §16). It stays in the football field for transparency |

**Weights sum to 100% across the two methods that are value-producing AND valid for a Financial.** For a bank the Method Map makes the DDM / residual-income value the intrinsic lens (not an EV-based DCF, not an EV SOTP) and P/E and P/tangible book the multiples lens — that is exactly the `03` + `04` pair above. `02` and `06` are excluded by their own producers' instructions, not by my judgement. Reverse-DCF is a cross-check, not a weighted input.

**Multiples-first, applied and stated.** NU is an operating-style issuer with a usable forward metric (NTM EPS USD 0.97, 16/16 analyst estimates behind FY2026E and FY2027E) and a peer multiple set, so the multiples method carries the majority (67%) and the intrinsic model is capped at the cross-check third (33%). The reconciliation of the resulting drag is done out loud in §2 — not averaged in silently.

---

## 2. Triangulation & Reconciliation

### The method football field — the honest cross-method spread

Shown at its true high-to-low, not narrowed and not pre-blended into a mid-band wearing a scenario label.

| Method | Value / its own range | Confidence | Weight | Why this weight |
|---|---:|---|---:|---|
| Relative / peers (`03`) | **USD 14.73** *(own dispersion USD 12.10 – 17.44 across the durability window N=3–5 and peer-set constructions; plus a separate peer-anchored cost-of-equity route at **USD 7 – 9**)* | Medium, capped 60 | 67% | Only independent forward, matched-basis peer evidence; cycle-elevated anchor caps it |
| Intrinsic residual income (`04`) | **USD 11.71** *(sensitivity grid USD 6.31 – 17.76; labelled structural runoff USD 5.76)* | Medium | 33% | Values the equity on its own economics; capped as a cross-check for the self-built fade |
| Sum-of-the-parts (`06`) | USD 10.36 *(named-comparable field USD 6.31 – 11.61)* | n/a | **0%** | Same construction as `03` — one read counted twice |
| Own-history multiples (`02`) | USD 17.84 – 22.01 | Low | **0%** | Producer-labelled illustrative-only; 20-month window; cash-backed-earnings restatement inverts the read |
| Reverse-DCF (`05`) | *implied expectations, not a value* | Medium–High | n/a | Cross-check |

**The >40% test, run on the correct set.** Across the **valid, value-producing, weighted** methods the field is **USD 11.71 → USD 14.73 = 25.8% of the low**. MODULE_RULES Reconciliation Gate 6 (>40%) therefore **does not fire on the method points**. Two things must be said beside that rather than hidden behind it: including the zero-weighted `06` sanity check the field is **42.2%**, and *within* `03` alone the peer-multiple route (USD 14.73) and the peer-implied cost-of-equity route (USD 7–9) disagree by roughly **2×** — `03` capped its own confidence for that and refused to average it, and I do not average it either. It is carried into the bear case in §3, where it belongs.

**Sector cycle distortion — and why the compounding rule does NOT fire, which is itself the finding.**
- `03` §6 flags its peer-median anchor **cycle-elevated** and emits **`RF-VAL-001`**: the Brazilian bank proxy re-rated roughly **+47% to +60% over three years** (Itaú price/book ~1.08–1.40 in 2023 → ~1.98 in early 2026; Bradesco ~0.77 → ~1.13) [Web: macrotrends / gurufocus / ycharts P/B history, read 2026-09-06 — unverified]. Its contribution is capped at 60.
- `02` §5 ran the same test, found the sector moved in the **opposite** direction to its own de-rating finding and below the ~25% materiality line, and emitted **no tag**.
- **The two flags are therefore NOT same-direction, so the combined 55 cap does not fire mechanically — but the honest reading is worse than a mechanical cap, not better.** What the two tests together show is **one company de-rating inside a sector that re-rated**. That is precisely why `02` can never corroborate `03` here: `02`'s entire 20-month "own history" sits *inside* the sector's up-move, so "cheap versus its own history" is anchored on a window that never contained a settled level. Independence check applied (CLAUDE.md §16): the base point rests on **one** cycle-flagged multiples read (`03`) plus one independent intrinsic model (`04`), not on two agreeing multiples reads. **Recommended cap for `99`: valuation confidence no higher than 60** — the tighter of `03`'s RF-VAL-001 cap (60) and `01`'s price-staleness cap (70).

### The base-case fair value — a single POINT

`Base = 0.67 × USD 14.73 (03) + 0.33 × USD 11.71 (04) = USD 13.7334` → **base-case fair value USD 13.73 per share**, which is **14.15x NTM EPS of USD 0.97** and **5.49x tangible book of USD 2.50**. This is the mechanically-weighted blend, published without a silent re-anchor: no lens swap, no discretionary shading. The two evidenced downside markers that argue for a lower number — `03`'s USD 7–9 cost-of-equity route and `04`'s USD 5.76 structural runoff — are carried as the **bear case and the avoid-ruin floor** in §3, not smuggled into the base point.

**Reconciling the disagreement, in five sentences.** The lens I trust most for NU is `03`'s peer route, because it is the only method resting on an independent, forward, matched-basis evidence set — ten named LatAm financials on the identical 2026-08-29 vendor basis, with the premium sized to the growth differential alone and the return differential deliberately left out of the earnings multiple so it is not charged twice. **The gap to `04`'s USD 11.71 is a real warning, not a high-discount-rate artefact, and that is why I let it pull the base down by its full capped third**: `04`'s 13.00% cost of equity sits **below** the company's own disclosed Brazilian cost of equity of 16.51% once translated to USD (13.98–14.54%), and **above** the 11.58% the market itself implies — so if the rate is wrong at all it is wrong on the low side, which would make `04`'s value lower still, not higher [`04` §3A, citing FY2025 Form 20-F, Note 3(b)]. The single most important reconciling fact is `05`'s: at USD 14.30 the model reproduces the price only on the **top of the Street's FY2026–FY2028 earnings range** (USD 14.65) with no improvement to the terminal, so the price already contains the best forecast on the Street and the mean forecast is not what is being paid for. Against that, the operating engine is genuinely still running — constant-currency revenue +34.02%, forward return on tangible equity 38.8% against a 23.1% peer median, loan-loss coverage **building** from 15.37% to 16.86% of gross credit assets in six months rather than being released — which is why the base sits near the price rather than near the USD 7–9 marker [`02` §4; `03` §2]. **The one number that most threatens this base point is `02`'s: restated on the earnings module's cash-backed net income of USD 2,148.5m, today's price is 32.7x earnings, above `02`'s own band mean — 40.4% of trailing profit is a non-cash deferred-tax credit, and a market that refuses to pay a growth multiple for a tax item is not mispricing the stock.**

---

## 3. Bull / Base / Bear Fair-Value Levels

Each case is a **single derived fair-value LEVEL — a point, not a range** — built as **(forward metric × multiple)** off one coherent assumption set. The bull-to-bear spread is the range; the cross-method dispersion is the §2 football field. **Horizon: 12 months to 2027-09-06** for Bull, Base and `bear_cyclical`. The separate `bear_structural` case in §3A runs on a **24–36 month** horizon and is not the same point in time — do not blend the two silently.

**Forward-metric basis, stated once.** All three cases use an **NTM (next-twelve-month) diluted EPS** built on the same blend Capital IQ's own NTM figure implies: `NTM = 0.5402 × FY2026E + 0.4598 × FY2027E` (which reproduces the vendor's NTM EPS of 0.9686 exactly from FY2026E 0.8482 and FY2027E 1.11006). Bull applies that blend to the **Street high** (0.91 / 1.30), bear to the **Street low** (0.75 / 0.77) — the high and low of the *same* analyst estimates whose mean sets the base [`Capital IQ Estimates → Consensus`, EPS (GAAP) High / Mean / Low rows, as-of 2026-08-29; ranges reproduced in `05` §4].

| Case | Fair Value / Share (point) | Forward Metric (NTM diluted EPS) | Multiple (NTM P/E) | Horizon | What Must Be True (operating drivers) |
|---|---:|---:|---:|---|---|
| **Bull** | **USD 19.59** | USD 1.09 (Street high) | **17.97x** | 12m, to 2027-09-06 | Credit cost improves ~100bp to 9.5% (**+USD 530.2m / +USD 0.108 EPS**); the BRL repeats its +12.14% average-rate move (**+USD 394.1m / +USD 0.080**); the effective tax rate holds near the 11.8% H1'26 filed level rather than reverting to the 30.2% consensus embeds (**+USD 257.4m / +USD 0.052**); efficiency ratio holds at the 17.6% Q1'26 print (**+USD 258.6m**). Multiple expands to 17.97x — `03`'s warranted level if the growth differential survives **5** years rather than 4, i.e. the Mexican bank licence (operating since 2026-08-06) and Colombia scaling deliver [`earnings/07` §2; `03` §5] |
| **Base** | **USD 13.73** | USD 0.97 (Street mean) | **14.15x** | 12m, to 2027-09-06 | Consensus delivers: FY2026E EPS 0.8482 (16/16 estimates) and FY2027E 1.11006 (16/16); forward return on tangible equity holds near 38.8%; the growth differential over peers survives roughly **4** years, which is close to the ~3.8–4.3 years the market is already paying for. No re-rating and no de-rating — the multiple sits at 14.15x against today's 14.76x |
| **Bear (cyclical)** | **USD 7.98** | USD 0.76 (Street low) | **10.50x** | 12m, to 2027-09-06 | See the through-cycle build below |
| *Bear (structural reset) — §3A, different horizon* | *USD 5.76* | *n/a — equity-direct residual income* | *implied 1.50x book at the horizon collapses to a negative terminal* | *24–36m* | *Avoid-ruin floor, not the 12-month bear* |

### Financial scenario gate — one forward period, both axes printed, identity reconciled

Same basis in every row: NTM diluted EPS over the **current** tangible book value per share of USD 2.50 (Jun-30-2026, `01` §6), which is the identical construction `03` §5 published, so the numbers tie to their source. Identity: `P/TBV = forward P/E × forward ROTE`.

| Case | Forward TBVPS (USD) | Applied / implied P/TBV | Forward EPS (NTM, USD) | Implied forward P/E | Forward ROTE | Identity check |
|---|---:|---:|---:|---:|---:|---|
| **Bull — USD 19.59** | 2.50 | **7.835x** | 1.09 | **17.97x** | **43.60%** | 17.97 × 0.4360 = 7.835 ✓ |
| **Base — USD 13.73** | 2.50 | **5.492x** | 0.97 | **14.15x** | **38.80%** | 14.15 × 0.3880 = 5.492 ✓ |
| **Bear (cyclical) — USD 7.98** | 2.50 | **3.192x** | 0.76 | **10.50x** | **30.40%** | 10.50 × 0.3040 = 3.192 ✓ |
| *Memo — price USD 15.37 (indicative)* | 2.50 | 6.148x | 0.97 | 15.85x | 38.80% | 15.85 × 0.3880 = 6.150 ✓ |
| *Memo — price USD 14.30 (pool anchor)* | 2.50 | 5.720x | 0.97 | 14.76x | 38.80% | 14.76 × 0.3880 = 5.726 ✓ |
| *Memo — peer median* | 4.73 | 1.79x | — | 7.73x | 23.11% | 7.73 × 0.2311 = 1.79 ✓ |

**Limitation stated, not buried.** Holding TBVPS at the current USD 2.50 across all three cases keeps the identity exact and matched-basis (it is what `03` did, and departing from `01`'s anchor would break the anchor-consistency rule). It does understate the bull's book accumulation and overstate the bear's — the *direction* of that error is known and it is small over a 12-month horizon against a base that grows book by roughly USD 0.45 a year on consensus.

**The peer-set maximum is not imposed as a ceiling.** The bull's 17.97x forward P/E sits **above** the highest multiple in the comp set (Credicorp 11.97x) and its 7.835x P/TBV above the highest (BTG Pactual 3.4x). That is deliberate and evidenced, not construction: NU's forward return on tangible equity of 38.8% is above the highest peer (BTG 36.2%) and its long-term EPS growth of 33.98% above the highest peer (Inter & Co 32.30%), so a company that leads the set on both variables that set a bank's multiple cannot be capped at the set's maximum without a separately evidenced economic ceiling, and none exists in this pool [`03` §5]. What limits the bull is the **durability window**, which is why 17.97x is `03`'s own N=5 upper bound and not a number invented above it.

**Multiple symmetry check, printed.** Bear **10.50x** ≤ Base **14.15x** ≤ Bull **17.97x**, and within each case the metric moves the same direction as the multiple (bull: EPS 1.09 up **and** multiple up; bear: EPS 0.76 down **and** multiple down). Anchoring to `02`'s handed-forward 20-month P/NTM-EPS band (min **12.90x**, mean 20.07x, median 21.70x, max 26.90x, current 14.76x): the base and bull both sit **inside** the band, the bull comfortably below its mean. The **bear at 10.50x sits deliberately below the band's 12.90x floor**, and the reason is cited rather than invented — see immediately below.

### The bear case reaches a cited through-cycle trough, not a mild dip off the peak

NU is flagged high-cyclicality: `business-model/07_business-quality.md` scores cyclicality **30/100** on a book that is **92% unsecured**, and `business-model/09_moat.md` §3 states plainly that **no Brazilian consumer downturn exists inside NU's profitable record at anything like the current book size** — the whole profitable record is three and a half years long and ran with Brazilian unemployment falling from 6.2% to 5.1% [`03` §4; `04` §2]. The company is a young entity with less than one standalone cycle, so the trough anchors are **named external and predecessor anchors**, exactly as the rule requires:

| Trough anchor | Level | Source |
|---|---:|---|
| Weakest listed comparable in the same LatAm bank set — the industry prior-downturn proxy | **Banco do Brasil 9.6%** return on tangible book | `Capital IQ Comps → Financial Data`, as-of 2026-08-29, via `04` §2 |
| Six-bank Brazil/LatAm peer-normal median | **15.95%** return on tangible book | same |
| NU's own loss-inclusive five-year average ROE (a *young-company* trough, explicitly **not** a credit-cycle trough) | **12.40%** (FY2021 −6.78%, FY2022 −7.81%, FY2023 18.24%, FY2024 28.07%, FY2025 30.28%) | CIQ `Ratios` export, via `04` §2 |
| Peer-anchored cost-of-equity route — the second evidenced downside marker | **USD 7 – 9 per share** | `03` §5, inverting `P/TBV = (ROTE − g)/(k − g)` at the ~16.5% cost of equity the peer group itself prices at, independently corroborated by NU's own disclosed Brazilian cost of equity of **16.51%** [FY2025 Form 20-F, Note 3(b)] |

**Why the bear multiple goes below `02`'s observed floor, and why that is evidence-based rather than invented.** `02` §2 says so itself: *"the true full-cycle low is almost certainly **below** the 4.48x P/B / 12.90x forward-P/E floor shown here"*, because the 20-month window contains no downturn. **10.50x is not a number I made up** — it is the region of `06`'s own named-comparable base multiple (10.68x, the midpoint of BTG Pactual's 9.39x and Credicorp's 11.97x, the two closest-economics LatAm bank comps), and it still leaves NU at a **36% premium to the 7.73x peer median** rather than at parity. In plain terms the bear says: in a Brazilian consumer downturn NU keeps a real premium to its peers, but a much smaller one than the 91% on offer today.

**Why the bear metric is the Street low, and that it is a genuine downturn rather than a shading.** NTM EPS of USD 0.76 is **−22% below** the consensus mean, built from the analysts' own FY2027 low of 0.77 against a mean of 1.11 (a 69% range across 16 estimates). It maps onto `earnings/07`'s own compounding adverse case: credit cost +110bp to Q1'26's own 11.6% level (**−USD 583.3m / −USD 0.1188 EPS**), the BRL at the company's own disclosed 17.8% shock (**−USD 577.9m / −USD 0.1177**), and the effective tax rate reverting to the 30.2% consensus embeds (**−USD 549.4m / −USD 0.1119** at the zero-mitigation bound; −USD 302.2m at the measured 45% realised offset). `earnings/07` §5(a) states these three **compound rather than offset** — a depreciating real is met by a higher Selic, which raises both funding cost and household debt service — so a reader adding them is not double-counting. The upstream sensitivity range was built on the last ~6 quarters, all upcycle, so the bear is widened past that window to the cited industry trough anchors above rather than stopping at a mild dip. **The two independent routes to the bear agree: USD 7.98 from (Street-low metric × comp-anchored compressed multiple) and USD 7–9 from the peer-implied cost-of-equity relation.**

### 3A. `bear_structural` — the avoid-ruin floor (a separate case, 24–36 month horizon)

**Which trigger fired, and on what row.** The *eroding-moat* leg did **not** fire: `business-model/09_moat.md` §5 returns **Narrow moat, trajectory stable**, and states expressly that its verdict "is **not** an erosion signal for the permanent-impairment trigger". The **disruption leg fired**: `business-model/07_business-quality.md` §1 scores **industry rate-of-change / disruption risk at 38 — at or below the ~40 threshold — and tags RF-BQ-005 (fast-changing industry, CLAUDE.md §24 Filter 5)**, because Pix, open finance, the card price cap, the capital regime and the virtual-asset regime were each rewritten inside six years [`03` §4; `04` §5].

**Billing, per the graduated rule.** The trigger fired as a **disruption flag on an otherwise intact moat (Narrow, stable)**, not on a confirmed eroding trajectory. The headline Bear therefore stays at the **cyclical through-cycle trough of USD 7.98** for the 12-month horizon, and the structural reset is carried here and to §24 / Kill Criteria as the labelled **avoid-ruin floor** — the multi-year permanent-impairment scenario, not the 12-month bear. (The demotion condition is satisfied twice over: `04_intrinsic-dcf` **is** in the weighted blend at 33%, so a method carrying the excess-return fade is priced in.)

**Method — business-type-appropriate, and the bridge shown.** NU is a **Financial**, so the reset is an **impaired residual-income / excess-return model**, not an EBITDA × multiple forced onto a bank. Impaired driver, named: return on equity fades from 35.5% (FY2028) to **12.0% by FY2033 — below the 13.0% cost of equity**, i.e. the franchise ends up destroying value on new capital, with terminal growth cut to **1.5% nominal USD** (a negative real rate). The economic reason is cited, not asserted: a Brazilian consumer downturn on a book that is 92% unsecured with 90+ day non-performing loans already at 6.9% and rising 35bp in the quarter, while the enacted CSLL step-ups lift the tax rate (payment institutions 9%→12%→15% from 2028; credit companies 17.5%→20%) and Law 14,690/2023 caps the price of the largest revenue line [`04` §5; `05` §3].

```
$ python3 nu07.py   (extract — full script and output in §7)
structural reset: book 2.7160 + PV(RI) 3.2160 + PV(TV) -0.2859 = 5.6461 @2026-06-30 ; accreted x1.0203 = 5.7607
  equity-based (residual income) -> already net of debt: NO net-debt subtraction.
  equity value = 5.76 x 4878.395m = USD 28,103m
```

**Bridge discipline, stated because getting it wrong is the recurring defect.** This reset produces an **equity value** (a residual-income model values the shareholders' claim directly), so it is **already net of debt** and is divided by the fully diluted share count with **no net-debt subtraction**. Subtracting `01`'s net cash of USD 7,744.6m — or adding it back — would double-count the same balance and misstate the floor. That is also why `06` deducted zero net debt on its own equity-multiple build. **`bear_structural` = USD 5.76 per share**, 62.5% below the fresher quote and 59.7% below the pool anchor.

**No probabilities are assigned to any case above — that is the master synthesizer's job.**

---

## 4. Margin of Safety & Downside (two separate metrics)

`01` tags the price-state **`pool-verified`**, so both metrics unlock. `01` also records the anchor as stale by 5 exact trading sessions (6.4 on the ×5/7 conversion) with a corroborated fresher quote **+7.48%** above it, and instructs that both reads be shown, **leading with the fresher one**.

### Lead read — at USD 15.37 (2026-09-04 close; web-sourced, unverified, indicative)

| Metric | Value |
|---|---:|
| Current price | **USD 15.37** *(indicative, web-sourced 2026-09-04 — carried alongside the pool anchor, not in place of it)* |
| Base-case fair value (point) | **USD 13.73** |
| Bear-case fair value (cyclical, 12m) | **USD 7.98** |
| Bull-case fair value (12m) | USD 19.59 |
| Implied upside to base case = (base FV − price) / price | **−10.7%** |
| **Margin of safety** = (base FV − price) / base FV — the cushion | **−11.9%** *(negative: no cushion — price is above base fair value)* |
| **Downside to bear** = (price − bear FV) / price — *inverted: higher = worse* | **48.1%** |
| *Memo: downside to the `bear_structural` avoid-ruin floor of USD 5.76 (24–36m)* | *62.5%* |
| *Memo: upside to bull* | *+27.5%* |

### Anchor read — at USD 14.30 (2026-08-28 close; pool-verified, stale by 5–6 trading days)

| Metric | Value |
|---|---:|
| Current price | **USD 14.30** *(pool-verified; staleness cap → `99` valuation confidence max 70)* |
| Base-case fair value (point) | **USD 13.73** |
| Bear-case fair value (cyclical, 12m) | **USD 7.98** |
| Implied upside to base case = (base FV − price) / price | **−4.0%** |
| **Margin of safety** = (base FV − price) / base FV — the cushion | **−4.2%** *(negative: no cushion)* |
| **Downside to bear** = (price − bear FV) / price — *inverted: higher = worse* | **44.2%** |
| *Memo: downside to the `bear_structural` avoid-ruin floor of USD 5.76 (24–36m)* | *59.7%* |
| *Memo: upside to bull* | *+37.0%* |

**These are two different numbers and neither is a proxy for the other.** Margin of safety is the discount of price to the **base** fair value — here it is **negative at both prices**, meaning there is no cushion: the shares trade above the triangulated base. Downside-to-bear is the loss if the bear case plays out — **44–48%**, an inverted metric where higher is worse. **Mandatory staleness flag:** the anchor's as-of date is 2026-08-28 and the fresher corroborated quote is 7.48% higher, which alone moves the margin of safety from −4.2% to −11.9% — the drift is material and the fresher read leads.

**The fair-value levels are price-independent**, so anyone can re-anchor in one step: `return = (level − price) / price`, with levels **Bull USD 19.59 / Base USD 13.73 / Bear-cyclical USD 7.98 / Bear-structural USD 5.76**.

---

## 5. Warranted-Multiple Check

**The base case implies 14.15x forward earnings and 5.49x tangible book, and NU does warrant a large premium — but the multiple it is asked to hold is one that only works if the growth differential lasts about four more years, and three and a half years of profitable history cannot settle that.** The premium is warranted **in kind** on measured evidence: forward return on tangible equity of 38.8% against a 23.1% peer median, long-term EPS growth of 33.98% against 13.17%, a cost advantage graded 78/100 with an ~85% lower cost to serve and 14,314 customers per employee against an incumbent average of 1,234 [`03` §4, citing FY2025 20-F, Item 4.B]. It is **not proven in size**: `03` measures that the market is already paying for ~3.8 years of that differential at USD 14.30 and ~4.3 years at USD 15.37, and `05` measures the same fact from the other side — the price requires a **permanent 22.08% return on equity**, 6.13pp above the six-bank peer median and only 2.2pp below Itaú, the best-run large incumbent, from a lender whose book is 92% unsecured and which has never met a downturn.

**Value-trap risk — three tests, two negative and one live.** (i) **Unaligned owner (RF-OWN-004, §24 Filter 6): NOT flagged.** The management-governance module tested it and returned negative — state-owned shares 0.03%, one reported segment, NU is the top holding company rather than a listed subsidiary of a value-maximising parent, with the explicit instruction that no value-trap note flows to valuation [`management-governance/04_ownership-and-insider-behavior.md` finding 04-021; `99` §C, via `02` §6 and `06` §4]. No ownership discount is taken. (ii) **The Sector Cycle Reality Test IS live and it cuts against the base multiple**: `03`'s warranted multiple is built off a peer median flagged **cycle-elevated (RF-VAL-001)** — a Brazilian bank sector that has re-rated 47–60% in three years — so a base case that "deserves" its multiple partly because the whole sector currently does is **not a durable warranted multiple**, and that is why `03`'s contribution is capped at 60 rather than taken at face. (iii) **The cleanest single test says the current multiple may already be too high, not too low**: restating price on the earnings module's cash-backed net income of USD 2,148.5m gives a P/E of **32.7x**, above `02`'s own 27.65x band mean, because 40.4% of trailing profit is a self-reversing non-cash deferred-tax credit whose fuel exists only while the loan book grows fast — and sequential FX-neutral portfolio growth has more than halved (+11% → +7% → +5%) [`02` §3/§4, citing `earnings/06_earnings-quality.md`].

---

## 6. Fair-Value Read

**Base-case fair value is USD 13.73 per share — 14.15x forward earnings and 5.49x tangible book — with bull USD 19.59, cyclical bear USD 7.98 (12-month), and a separate structural-reset avoid-ruin floor of USD 5.76 on a 24–36 month horizon.** Against the fresher indicative quote of USD 15.37 (2026-09-04) the **margin of safety is −11.9% — there is no cushion, the shares trade above the triangulated base — while downside-to-bear is 48.1% (inverted: higher is worse)**; at the stale pool-verified anchor of USD 14.30 the same two numbers are **−4.2% and 44.2%**. The answer is driven by `03`'s peer route at 67% (the only independent, forward, matched-basis evidence set for a bank, capped at 60 confidence because its peer-median anchor is flagged cycle-elevated) pulled down by `04`'s residual-income model at its capped 33% — a drag I let through rather than averaging away, because `04`'s 13.0% cost of equity is already **below** management's own disclosed 16.51% Brazilian rate translated to USD, so if that rate is wrong it is wrong on the low side.

**The single biggest swing factor between bull and bear is how long NU's growth differential over its peers survives — and the sharpest way to see it is that the whole disagreement sits in FY2027–FY2028 earnings, which the Street itself cannot agree on (its FY2027 range is USD 0.77 to 1.30, a 69% spread around a 1.11 mean across 16 estimates).** `05` frames the same swing as a bar: at USD 14.30 the market is already paying roughly what the model produces on the **top** of that range (USD 14.65), so the mean forecast is not what is being paid for. Two evidenced downside markers, from independent routes, both land near USD 8 — `03`'s peer-implied 16.5% cost-of-equity relation at USD 7–9, and the Street-low metric on a comp-anchored 10.50x multiple at USD 7.98 — and they are carried as the bear rather than smoothed into the base.

---

## 7. Executed arithmetic — command, script and raw output

Every number in §1–§6 came out of this snippet; nothing was computed by hand.

```
$ python3 nu07.py
weights sum = 1.00
weighted base point = 0.67x14.73 + 0.33x11.71 = 13.7334  -> USD 13.73
method-point field 11.71 - 14.73 = 25.8% of low  (Gate 6 fires >40%)
incl. 06 sanity-check 10.36 - 14.73 = 42.2%
NTM blend implied by CIQ: 0.5402 x FY2026E + 0.4598 x FY2027E = 0.9686
bull NTM EPS = 1.0893 -> 1.09 ; bear NTM EPS = 0.7592 -> 0.76

multiples  bear 10.50x <= base 14.15x <= bull 17.97x   symmetric=True
Bull           EPS 1.09 x 17.97x = USD  19.59 | ROTE 43.60% | P/TBV 7.835x | identity P/E x ROTE = 7.835 OK
Base           EPS 0.97 x 14.15x = USD  13.73 | ROTE 38.80% | P/TBV 5.492x | identity P/E x ROTE = 5.492 OK
Bear_cyclical  EPS 0.76 x 10.50x = USD   7.98 | ROTE 30.40% | P/TBV 3.192x | identity P/E x ROTE = 3.192 OK

structural reset: book 2.716 + PV(RI) 3.216 + PV(TV) -0.2859 = 5.6461 @2026-06-30 ; accreted x1.0203 = 5.7607
  equity-based (residual income) -> already net of debt: NO net-debt subtraction. equity value = 5.76 x 4878.395m = USD 28,103m

@ USD 15.37 (2026-09-04, web-sourced indicative - LEAD)
  implied upside to base = (13.73-15.37)/15.37 = -10.7%
  MARGIN OF SAFETY       = (13.73-15.37)/13.73 = -11.9%
  DOWNSIDE TO BEAR (inv) = (15.37-7.98)/15.37 = +48.1%
  downside to reset floor= (15.37-5.76)/15.37 = +62.5%
  upside to bull         = (19.59-15.37)/15.37 = +27.5%

@ USD 14.30 (2026-08-28, pool-verified anchor)
  implied upside to base = (13.73-14.3)/14.3 = -4.0%
  MARGIN OF SAFETY       = (13.73-14.3)/13.73 = -4.2%
  DOWNSIDE TO BEAR (inv) = (14.3-7.98)/14.3 = +44.2%
  downside to reset floor= (14.3-5.76)/14.3 = +59.7%
  upside to bull         = (19.59-14.3)/14.3 = +37.0%
```

The script, in full, so a reader can re-run it:

```python
P_POOL, P_FRESH = 14.30, 15.37          # 01 s7
SH_FD = 4878.395                         # 01 s7, millions, fully diluted
TBVPS = 2.50                             # 01 s6, LTM tangible book/share - same base 03 used
V03, V04, V06 = 14.73, 11.71, 10.36      # 03 s5 base ; 04 s6 ; 06 s4 (zero-weight)
W03, W04 = 0.67, 0.33                    # 03 majority (multiples-first) ; 04 capped cross-check <= 1/3
base = round(W03*V03 + W04*V04, 2)

FY26, FY27, NTM = 0.8482, 1.11006, 0.9686          # 02 s1 / 04 s2 consensus mean
w27 = (NTM-FY26)/(FY27-FY26); w26 = 1-w27          # reproduces CIQ's own NTM blend
E_bull = round(w26*0.91 + w27*1.30, 2)             # 05 s4 ROB-B Street HIGH
E_bear = round(w26*0.75 + w27*0.77, 2)             # 05 s4 ROB-B Street LOW
E_base = 0.97                                       # 03/06 NTM EPS
M_base, M_bull, M_bear = base/E_base, 17.97, 10.50  # 03 s5 N=5 ; 06 s2 named-comp region
# identity check for every case: P/TBV == (E*M)/TBVPS == M * (E/TBVPS)

B0, PV_RI, PV_TV, ACC = 2.7160, 3.2160, -0.2859, 1.0203   # 04 s5 runoff / s6 accretion
RESET = round((B0 + PV_RI + PV_TV) * ACC, 2)              # equity value - no net-debt bridge

# margin of safety = (base - P)/base   ;   downside to bear = (P - bear)/P
```

---

## Self-check against the module rules

- Every method value and confidence is lifted from `02`–`06`; nothing re-derived.
- Weights (67% / 33%) sum to 100% across the two value-producing, business-type-valid methods; `02` and `06` are zero-weighted on their own producers' explicit instructions and shown in the football field for transparency. The published base point **is** the mechanical blend — no silent re-anchor, no undisclosed lens swap.
- Reverse-DCF used as a cross-check only, never weighted.
- The >40% test run on the full high-to-low set of **valid, value-producing** methods (11.71 → 14.73 = 25.8%): Gate 6 does not fire on the method points; the 42.2% field including the zero-weighted `06`, and `03`'s ~2× internal disagreement, are both stated rather than hidden, and the confidence cap of 60 is recommended regardless.
- Bull / base / bear are each a single derived LEVEL, dated (12-month; `bear_structural` 24–36 month, stated in prose), tied to `earnings/07` operating drivers. No probabilities, no probability-weighted target, no risk/reward, no rating, no position size.
- Every case prints BOTH a forward metric and a multiple; bear 10.50x ≤ base 14.15x ≤ bull 17.97x, with metric and multiple moving the same direction in each case; base and bull anchored inside `02`'s handed-forward 20-month band, and the bear's excursion below its 12.90x floor cited to `02`'s own statement that the true full-cycle low sits below it.
- Financial gate: one forward period, TBVPS / P/TBV / forward EPS / implied forward P/E / forward ROTE printed in every row, identity reconciled; the peer-set maximum is deliberately exceeded on evidence, not capped by construction.
- `02`'s and `03`'s Sector Cycle Reality Test sections both read: `03` fired `RF-VAL-001` (cycle-elevated, cap 60); `02` fired nothing; the flags are **not** same-direction, so the mechanical compounding cap does not fire — and the reason (`02`'s whole window sits inside the sector's up-move, so it cannot corroborate `03`) is stated as the finding.
- Margin of safety `(base − price)/base` and downside-to-bear `(price − bear)/price` computed as two separate metrics, at BOTH prices, leading with the fresher, with the staleness flag inline.
- Structural-reset trigger fired on the disruption leg (`07_business-quality` rate-of-change 38 ≤ 40) with an **intact** moat (`09_moat`: Narrow, stable) → headline Bear stays the cyclical trough; the reset is carried as the labelled avoid-ruin floor, computed by executed snippet on the business-type-appropriate method (impaired residual income, **not** an EBITDA multiple forced on a bank), **already equity — no net-debt subtraction**.
- No banned phrases; every adjective paired with a cited number.
