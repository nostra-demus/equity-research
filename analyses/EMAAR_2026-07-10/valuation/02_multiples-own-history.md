# Multiples — Own History — EMAR (Emaar Properties PJSC, DFM: EMAAR)

**Reporting currency:** AED (UAE dirham), IFRS, FY ends 31 Dec; USD shown at the 3.6725 AED/USD peg where useful. **Anchors taken verbatim from `01_price-and-capital-structure.md` §7:** price **AED 12.20** (US$3.32, last close, pool-verified, as-of 2026-06-28); fully diluted shares **8,838.789849m**; market cap **≈ AED 107,818m**; **broad (canonical) net cash AED 24,969m** / strict (§15) net cash AED 2,115m; **broad EV ≈ AED 96,657m** / strict EV ≈ AED 119,511m; LTM EBITDA AED 25,200.7m. The multiple history below is CIQ **broad-basis** (its EV nets the AED 22.5bn of bank term deposits), so this agent uses the **broad** EV throughout for apples-to-apples comparability with the history and pins (Reconciliation Gate 1); the strict-basis sensitivity is noted where it moves a number.

**Business type (method map):** Emaar is a **hybrid** real-estate business — ~80% of FY2025 revenue is build-to-sell Dubai development (operating-company-like, so P/E and EV-based multiples are meaningful), ~15% leasing/retail (malls) and ~5% hospitality (recurring-income, REIT-like, better read on an asset/NAV basis). Per the Business-Type Method Map the full multiple set is used for the development-dominated whole, and **P/BV is flagged as the most cycle-robust anchor** (book value does not swing with the property cycle the way peak development earnings do). NAV/SOTP is left to `06`.

**Cross-module inputs used:** `earnings/01_historical-financials.md` (LTM metric base), `earnings/04_guidance-consensus.md` (forward estimates, consensus), `business-model/10_external-dependency.md` (cycle-peak read), `management-governance/04_ownership-and-insider-behavior.md` + `99` synthesis (**RF-OWN-004 fired — government controller; value-trap note handed to valuation**), and the deterministic facts sidecar `_pool_extracts/ciq_facts.json`.

Plain-English glossary (first use): **multiple** = price (or enterprise value) divided by a profit/sales/book number — how many years of that number you pay; **LTM** = last twelve months (trailing); **NTM/FY** = next-twelve-months / forecast-year (forward); **EV/EBITDA** = enterprise value ÷ operating cash profit; **P/E** = price ÷ earnings per share; **P/BV** = price ÷ book (accounting net worth) per share; **re-rate / de-rate** = the market pays more / less for the same AED of profit or book; **reversion** = the multiple moving back toward its own past average; **percentile of range** = where today sits between the lowest (0%) and highest (100%) reading of its own history.

---

## 1. Current Multiples

At the `01` anchor (price AED 12.20, broad EV AED 96,657m, as-of 2026-06-28). LTM metric base from `earnings/01` §1–2 [LTM to 31-Mar-2026]. All multiples **reported/standardized (not company-adjusted)**; period basis labelled.

| Multiple | Basis | Metric Value (AED m, or per-share) | Current Multiple | Source |
|---|---|---:|---:|---|
| P / E | LTM (cycle-**peak** EPS) | EPS AED 2.141 | **5.7x** | 12.20 ÷ 2.141; facts pin `pe_ltm_current_x` 5.9x @2026-03-31 close |
| P / E | NTM / FY2026 (forward) | EPS ~AED 1.95 | **6.9x / 6.3x** | CIQ Estimates→Multiples (`04_Multiples.xlsx`) |
| EV / EBITDA | LTM (broad EV) | EBITDA 25,201 | **3.8x** | 96,657 ÷ 25,201; pin `ev_ebitda_current_x` 4.0x @2026-03-31; Comps 3.6x @2026-06-28 |
| EV / EBITDA | NTM / FY2026 (forward) | — | **3.5x / 3.7x** | CIQ Estimates→Multiples |
| EV / EBIT | LTM (broad EV) | EBIT 23,521 | **4.1x** | 96,657 ÷ 23,521 |
| EV / Sales | LTM (broad EV) | Revenue 51,858 | **1.9x** | 96,657 ÷ 51,858 |
| P / Book | latest (Q1-26) | BVPS AED 10.16 | **1.20x** | 12.20 ÷ 10.16 [01 §6] |
| P / Tangible Book | latest (Q1-26) | TBVPS AED 10.11 | **1.21x** | 12.20 ÷ 10.11 [01 §6] |
| P / FCF (FCF yield) | LTM | see note | **~4.8x (~21%)** | normalized; reported & levered readings differ sharply — see note |
| Dividend yield | FY2025 / LTM | DPS AED 1.00 | **8.2%** | 1.00 ÷ 12.20 [earnings/04 §2] |

**Reconciliation to the facts pins (no override; gaps are date, not misread).** My anchor reads sit slightly below the pins because the pins are struck at the **2026-03-31** quarter close and my anchor is the fresher **2026-06-28** price — the stock fell over that window, compressing the multiple: EV/EBITDA 3.8x (anchor) vs pin **4.0x** (2026-03-31) vs Comps **3.6x** (2026-06-28); P/E 5.7x (anchor) vs pin **5.9x** (2026-03-31). The pin's `range_position` — "EV/EBITDA 4.0x … trailing range 5.1–8.4x (median 6.5x) over 16 closes → 0%ile → near-floor" — is confirmed exactly by my independent band build in §2. No material gap.

**FCF note (§15 — three definitions, do not conflate).** Reported CFO−capex FCF is AED 30,982m → 28.7% yield / 3.5x, but it is **inflated** by ~AED 8.3bn of growth-linked customer presale-advance inflow [earnings/01 §2]; **normalized operating FCF ~AED 22.6bn → ~21% yield / ~4.8x** is the recurring read used above. CIQ's own "Levered Free Cash Flow" AED 3,067m (after interest **and** after netting real-estate/securities investment) implies Market Cap/Levered FCF **~35x / ~2.8% yield** [pin `levered_fcf_m`] — the after-all-reinvestment figure. FCF multiples have **no usable own-history band** (mostly "NM" across the CIQ series as development investment swings the levered figure), so they are current-only.

---

## 2. Historical Multiple Bands (3–5 years)

**Source:** CIQ Financials_Quarterly → Multiples tab, "Close" rows — **16 quarter-end closes, Q1-2022 → Q4-2025** (a ~4-year window, satisfying the 3–5yr rule); the 2026 readings (2026-03-31 close 3.96x; annual export 2026-06-19 close 3.90x) are treated as **current**, matching the facts-sidecar convention. Basis = broad EV / standardized LTM metrics, same as §1.

| Multiple | Min | Mean | Median | Max | Current (anchor) | Percentile of Range |
|---|---:|---:|---:|---:|---:|---:|
| P / E (LTM) | 6.21 | 7.71 | 7.37 | 11.49 | **5.7** | **0% (below floor)** |
| EV / EBITDA (LTM) | 5.11 | 6.45 | 6.48 | 8.39 | **3.8** | **0% (below floor)** |
| EV / EBIT (LTM) | 5.68 | 7.33 | 7.35 | 9.84 | **4.1** | **0% (below floor)** |
| EV / Sales (LTM) | 2.15 | 2.89 | 2.88 | 3.78 | **1.9** | **0% (below floor)** |
| P / BV | 0.67 | 1.02 | 0.94 | 1.50 | **1.20** | **~64%** |

**Two things the table must not hide.** (1) On **all four flow multiples the current level is below the 4-year floor** — the 2026 readings undercut even the lowest quarter-end close of 2022–2025. (2) **P/BV is the exception** — it re-rated the other way, from a 0.67–0.80x discount-to-book in 2022 to ~1.20x now (upper-mid of its own range, ~64th percentile). (3) **The window is entirely an up-cycle.** 2022–2026 was one continuous Dubai property upswing; the last Dubai downturn (2015–2019) is outside this history, so these means are **up-cycle means**, not through-cycle norms [business-model/10 §2 — "Dubai property is boom-bust (2009; 2015–2019)"].

---

## 3. Re-Rating / De-Rating Read

**The flow multiples de-rated hard; the asset multiple re-rated up — and both are explained by the same fact.** On P/E, EV/EBITDA, EV/EBIT and EV/Sales the stock trades at a **~23–44% discount to its own 4-year mean and median** (P/E −26%/−23% vs mean/median; EV/EBITDA −41%/−41%; EV/EBIT −44%/−44%; EV/Sales −36%/−35% — each computed as (current − reference)/reference), sitting at the **0th percentile, below the floor** of the 16-quarter range. This de-rating is driven by the **denominator, not the price**: EBITDA roughly tripled (AED 9.3bn → 25.2bn) and EPS nearly tripled (AED 0.83 → 2.14) since 2022 while the share price only about doubled, so the earnings multiples compressed even as the stock rose [earnings/01 §1]. On **P/BV the opposite** — a **~18% premium to the own mean and ~28% to the own median** (~64th percentile), a re-rating that tracks a genuine improvement: the balance sheet inflected from net debt to ~AED 25bn net cash, S&P upgraded to BBB+ / Moody's to Baa1, and ROIC rose 4.7% → 13.7% [earnings/01 §1, §6; 01 §5]. The single most likely reason the flow multiples sit below their floor is that **the market is capitalizing peak Dubai-cycle earnings**: consensus long-term growth is **−14.8%** and the **forward P/E (NTM ~6.9x) is above the trailing (~5.7–5.9x)** — the market is explicitly pricing an earnings decline [ciq_facts `consensus_view`; earnings/04 §4]. A low multiple on peak earnings is a warning, not a mispricing.

---

## 4. Implied Value from Reversion

Mechanical reversion of each multiple to its own **mean and median** (§2), applied to the LTM metric. EV-based rows bridge to equity with the `01` **canonical broad net cash of +AED 24,969m** (`equity = target multiple × metric + net cash`), then ÷ 8,838.789849m shares; using strict net cash instead would lower each EV-based per-share value by **~AED 2.59** (one-line reason: history and pins are broad-basis, so broad keeps the reversion self-consistent — Reconciliation Gate 1).

| Multiple (reversion target) | Target (mean / median) | Implied EV or equity, AED m | Implied AED/share | vs Current AED 12.20 |
|---|---:|---:|---:|---:|
| P/E on **LTM peak** EPS 2.141 | 7.71 / 7.37 | equity direct | 16.51 / **15.78** | +35% / **+29%** |
| P/E on **normalized** EPS ~1.95 | 7.71 / 7.37 | equity direct | 15.03 / **14.37** | +23% / **+18%** |
| EV/EBITDA on LTM EBITDA 25,201 | 6.45 / 6.48 | 162,546 / 163,302 EV | 21.22 / **21.30** | +74% / **+75%** |
| EV/EBIT on LTM EBIT 23,521 | 7.33 / 7.35 | equity via bridge | 22.33 / **22.38** | +83% / **+83%** |
| EV/Sales on LTM revenue 51,858 | 2.89 / 2.88 | equity via bridge | 19.78 / **19.72** | +62% / **+62%** |
| P/BV on BVPS 10.16 | 1.02 / 0.94 | equity direct | 10.36 / **9.55** | −15% / **−22%** |

**ONE base-case point handed to `07`: ≈ AED 12.5 — essentially fair value on its own history (a "no re-rate" case, ~+2% vs price).** Derivation: normalized EPS ~AED 2.0 (LTM peak 2.14 / consensus FY2026 ~1.95 midpoint) held at the stock's **own current depressed multiple ~6.0x** — NOT its up-cycle median of 7.37x — because two pieces of evidence forbid underwriting the re-rate (below). **This is deliberately NOT the mechanical median-reversion number.** Per the RF-OWN-004 / §24-Filter-6 rule, reversion to the old mean is **not** presented as the base case; the median-reversion figures above (P/E ~AED 15.8; EV-based ~AED 20–22) are an **illustrative exhibit only**.

**Dispersion across the multiples (the exhibit, not the base):** **~AED 9.55 (P/BV median, cycle-robust downside) to ~AED 22.4 (EV/EBIT median, illustrative upside)** — a spread of well over 40%, so the methods disagree violently and confidence is capped (Reconciliation Gate 6). The disagreement **is** the finding: the EV/EBITDA, EV/EBIT and EV/Sales reversions (~AED 20–22) are the **least reliable** because they capitalize **peak** development EBITDA/EBIT/revenue at an up-cycle multiple **and** add the large broad net-cash balance — exactly the "peak metric × mid-cycle multiple" error the cyclicality gate rejects; P/E on normalized earnings (~AED 14.4) is more defensible as an upside ceiling; P/BV (~AED 9.6–10.4) is the cycle-robust downside anchor.

**Has the warranted multiple structurally changed? Partly — and in the direction that kills the reversion trade.** (a) The balance-sheet inflection (net-debt → ~AED 25bn net cash), the BBB+/Baa1 upgrades and ROIC 4.7% → 13.7% justify a **structurally higher** multiple than the 2022 trough — which is why P/BV re-rated up, and that part is warranted, so reverting P/BV all the way down to its 0.94x median is too harsh. (b) But the low **flow** multiples sit on **record cycle-peak earnings** that consensus expects to fall ~15% into a fast-rising Dubai supply pipeline [business-model/10 §2, §4; earnings/07 §6], so applying an up-cycle mean multiple to today's peak EPS/EBITDA overstates value. (c) **RF-OWN-004 fired** (§5) — a government controller is a structural cap on re-rating. Net: the earnings-multiple "discount to own history" is **not** underwritable as upside.

---

## 5. Own-History Read

On earnings-based multiples Emaar trades at — indeed just under — the bottom of its own 4-year range (EV/EBITDA ~3.8x vs a 5.1–8.4x band; P/E ~5.7x vs 6.2–11.5x; 0th percentile), which mechanically implies AED 15–22/share if it "reverted to the mean" — but **it should not be underwritten to, and here is the blunt reason it is a value trap, not a margin of safety:** those means are **peak-cycle means off a 2022–2026 window with no Dubai downturn in it**, the earnings base is at a **record cycle peak** consensus already marks down (−14.8% long-term growth, forward P/E above trailing), and **RF-OWN-004 fired** — the **Government of Dubai (Dubai Holding group, 29.73%)** controls the company, the board is government-staffed, and an IAS 24 election leaves the largest related-party channel unquantified; the governance module handed valuation an explicit note that "a state controller can keep a name cheap and keep it cheap" [management-governance/04 §Filter 6; 99 synthesis]. The one **cycle-robust** measure, **P/BV, says the opposite of a bargain** — at ~1.20x book vs a 0.94x own-median it implies ~22% **downside** on full reversion, with only the balance-sheet-inflection part of the re-rating warranted. **Base case: roughly fair value at ~AED 12.5 (no re-rate); the 0th-percentile flow-multiple "discount" is explained by peak earnings plus a misaligned government owner, so this module's reversion table is an illustrative exhibit only and must not enter `07` as a fair-value input on the strength of the low multiple alone** (value-trap flag mandatory; per §24 Filter 6 and the valuation Score-Cap, valuation attractiveness on the reversion read is capped).

---

*Reconciliation & self-check:* Anchors (price AED 12.20, broad EV AED 96,657m, shares 8,838.789849m, net cash AED 24,969m broad) match `01` §7 verbatim. Every multiple labelled LTM / NTM / FY and reported/standardized. Historical bands cite CIQ Financials_Quarterly Multiples (16 closes) and reconcile exactly to `ciq_facts.json` (`ev_ebitda_percentile` 0%; range 5.1–8.4x, median 6.5x). Premium/discount computed as (current − reference)/reference vs the own mean and median, per multiple. Base case is ONE named point (~AED 12.5, no-re-rate) + a separate cross-multiple dispersion (~AED 9.6–22.4); the structural-change and value-trap questions are answered explicitly. RF-OWN-004 handled per §24 Filter 6: reversion-to-mean is **not** the base case; value-trap flag raised. No naked "cheap/expensive" — every level carries its % gap.
