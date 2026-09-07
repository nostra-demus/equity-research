# Sum-of-the-Parts — NVT

**Evidence binding: frozen.** Every pool read resolved through the bound generation `6db32848…1aecd1e6` (`manifest.json`, per-tab extracts, `ciq_facts.json`). Live `data/NVT/` and `_pool_extracts/` were not read; `data/NVT/…` is a citation label only.

**Regime, standard, currency (CLAUDE.md §27).** US SEC domestic filer (Forms 10-K / 10-Q), **US GAAP**, reporting currency **USD in millions** (per-share in dollars), fiscal year ends **31 December** [`Q2 FY26 10-Q, cover page`; `00_valuation-data-triage`, §1A]. The issuer is Irish-incorporated but files US forms and lists on the NYSE, so US form names are the correct local names here. No FX conversion is used anywhere in this report except where a euro-reporting comparable is explicitly excluded for that reason.

**Anchors adopted verbatim from `01_price-and-capital-structure` (Reconciliation Gate 1).** Price **USD 171.16** (pool-verified, close **2026-08-12**, ~17–19 trading days stale, confidence cap 60) with the corroborated indicative refresh **USD 156.03** (close 2026-09-04, web-sourced, unverified) carried alongside; **net debt USD 1,236.4m — strict §15 basis** (total debt 1,492.4 − cash 256.0), broad basis identical (no short-term investments); **minority 0.0, preferred 0.0, equity-method investments 0.0**; per-share fair-value share count **164.2m fully diluted**. No figure below departs from those.

**This SOTP is pre-Maverick-Power, deliberately.** The Maverick Power acquisition ($1.75bn cash plus up to $550m earn-out, ~$700m estimated 2026 revenue, close expected Q4 2026) was announced 2026-08-24, has not closed, and is not on the 30-Jun-2026 balance sheet [`nVent-to-Acquire-Maverick-Power-2026.pdf`, press release 2026-08-24]. `01`'s bridge is pre-deal, so this one is too. A labelled sensitivity is in §4.

---

## 1. Segment Inventory

nVent has **two reportable segments** and no unallocated-revenue bucket — every dollar of sales is assigned to a segment [`Q2 FY26 10-Q, Note 13, p.19–20`]. It is **not** single-segment: Electrical Connections is 27.5% of revenue and 30.0% of reportable segment income in H1 FY26, well inside the >85% single-segment test [`business-model/03_segment-map.md`, §2]. The SOTP therefore runs in full.

**What the profit measure is.** "Reportable segment income" is nVent's own segment profit measure: operating income including some corporate-overhead allocations but **excluding** intangible amortization, acquisition and integration costs, restructuring, mark-to-market and other unusual items, and — new in 2026 — IEEPA tariff reimbursements [`Q2 FY26 10-Q, Note 13, p.19–21`]. It is an EBIT-type measure struck **before** the corporate cost pool. It is not an operating margin and is not used as one.

**The "% of total EBIT" denominator is stated so no share can silently exceed 100%.** Two denominators are shown: (a) **reportable segment income**, which sums to 100% across the two segments by construction and excludes the corporate pool; and (b) **adjusted EBIT after the corporate pool** (segment income − Enterprise-and-other), which is the profit an owner of the whole company actually gets before intangible amortization. Both are given, and the corporate bucket is shown as its own line with a negative share — it is never dropped.

### 1A. Reported history (the base the forward build starts from)

| Segment | Revenue | Segment income (EBIT-type) | Margin | % of reportable segment income | % of adjusted EBIT (after corporate) | Source |
|---|---:|---:|---:|---:|---:|---|
| **H1 FY26 (six months to 30-Jun-2026, unaudited filing)** | | | | | | |
| Systems Protection | 1,966.9 | 451.3 | 22.9% | 70.0% | 79.0% | `Q2 FY26 10-Q, Note 13, p.20`; margin `MD&A, p.29` |
| Electrical Connections | 746.4 | 193.6 | 25.9% | 30.0% | 33.9% | `Q2 FY26 10-Q, Note 13, p.20`; margin `MD&A, p.30` |
| *Enterprise and other* (cost pool, **not a segment**) | — | (73.7) | n/a | (11.4)% | (12.9)% | `Q2 FY26 10-Q, Note 13, p.21` |
| **= Reportable segment income** | **2,713.3** | **644.9** | 23.8% | **100.0%** | — | `Q2 FY26 10-Q, Note 13, p.20` |
| **= Adjusted EBIT after corporate** | | **571.2** | 21.1% | — | **100.0%** | 644.9 − 73.7, derived |
| *Memo:* unallocated intangible amortization | — | (82.2) | — | (12.7)% | (14.4)% | `Q2 FY26 10-Q, Note 13, p.21` |
| **FY2025 (Capital IQ vendor export — tier 5, NOT a filing)** | | | | | | |
| Systems Protection | 2,592.9 | 537.0 | 20.7% | 59.0% | 68.3% | `Capital IQ Financials export → Segments`, 12m Dec-31-2025 column |
| Electrical Connections | 1,300.2 | 372.6 | 28.7% | 41.0% | 47.4% | same |
| *Enterprise and other* | — | (123.8) | n/a | (13.6)% | (15.7)% | same |
| **= Reportable segment income** | **3,893.1** | **909.6** | 23.4% | **100.0%** | — | same |
| **= Adjusted EBIT after corporate** | | **785.8** | 20.2% | — | **100.0%** | 909.6 − 123.8, derived |
| *Memo:* unallocated intangible amortization | — | (147.1) | — | (16.2)% | (18.7)% | same |
| **FY2024 (audited — the only audited annual segment note in the pool)** | | | | | | |
| Systems Protection (then *Enclosures*) | 1,823.3 | 403.1 | 22.1% | 53.2% | 61.8% | `FY24 10-K, Note 15, p.70`; margin `Item 7 MD&A, p.25` |
| Electrical Connections (then *EF&S*) | 1,182.8 | 354.5 | 30.0% | 46.8% | 54.4% | `FY24 10-K, Note 15, p.70`; margin `Item 7 MD&A, p.27` |
| *Enterprise and other* | — | (105.6) | n/a | (13.9)% | (16.2)% | `FY24 10-K, Note 15, p.70` |
| **= Reportable segment income** | **3,006.1** | **757.6** | 25.2% | **100.0%** | — | `FY24 10-K, Note 15, p.70` |

**Reconciliation to consolidated (Reconciliation Gate 3 — the segment figures must tie, and the corporate bucket may not vanish).** H1 FY26: segment revenue 1,966.9 + 746.4 = **2,713.3**, which is exactly consolidated net sales for the six months [`Q2 FY26 10-Q, condensed consolidated statements of operations`]. Segment income 451.3 + 193.6 = 644.9, less Enterprise and other (73.7), less intangible amortization (82.2), plus IEEPA tariff reimbursements 25.8, and after the remaining reconciling items, ties to income before tax of 458.9 [`Q2 FY26 10-Q, Note 13, p.21`]. **The corporate pool is carried explicitly through every step below and is capitalized and subtracted in §4 — it is not assumed away.**

**Evidence-quality note that travels with the FY2025 row.** The FY2025 10-K is **absent from the data pool**, so every FY2025 segment figure here is a **tier-5 Capital IQ vendor read**, never cited to a filing [`business-model/03_segment-map.md`, §1]. The vendor's basis was verified: for FY2024 it reports 403.1 / 354.5, identical to the audited 10-K segment note, so the FY2025 column is on the same measure [`business-model/03_segment-map.md`, §1 reconciliation].

### 1B. The forward basis actually used (MODULE_RULES Calculation Standard 10 — forward basis, hard rule)

**Every segment below is valued on FY2026E, not on the last audited year.** FY2024 is the last audited segment note and FY2025 is the last full year; both are trailing and both would badly misvalue a segment growing at 49.6% (Systems Protection). No segment-level consensus exists — the company gives **no segment-level revenue or margin guidance** [`earnings/04_guidance-consensus.md`, §2] — so the forward segment metric is **built from H1 FY26 filed actuals plus an H2 FY26 estimate anchored on management's own group guidance**, and then reconciled back to that guidance. The build and its tie-out are shown in full so a reader can reproduce it.

**Period basis, stated per segment:** Systems Protection **FY2026E**; Electrical Connections **FY2026E**; corporate pool **FY2026E**. FY2026E is the furthest-forward basis with an evidenced segment-level estimate; it is the company's *current* guided fiscal year, of which H1 is reported and H2 estimated. A true NTM window (Q4-26 through Q3-27) would sit **above** FY2026E on a business guided to +37–39% reported sales growth, so using FY2026E is the conservative choice, and that is why it is used rather than annualising the H1 run-rate.

**Step 1 — the group envelope comes from management, not from this agent.** FY2026 guided reported sales growth +37% to +39% on FY2025 revenue of 3,893.1 gives **$5,333.6–5,411.4m, midpoint $5,372.5m**; guided adjusted EPS **$5.00–5.10** [`Q2 FY26 transcript, 2026-07-31, prepared remarks`; corroborated by `Capital IQ Estimates export → Guidance`, FY 2026, guidance date 2026-07-31]. H1 FY26 actual revenue was **2,713.3** [`Q2 FY26 10-Q`], so **implied H2 FY26 revenue = 5,372.5 − 2,713.3 = 2,659.2**.

**Step 2 — split H2 between the segments.** H1 FY25 comparatives are recoverable from the filed growth decomposition: Systems Protection H1 FY25 revenue **1,140.2** (H1 FY26 1,966.9 at +72.5%; independently confirmed by the vertical note, infrastructure 510.5 of 1,140.2 = 44.8%) and Electrical Connections H1 FY25 **632.0** (746.4 at +18.1% = organic 13.1 + acquisition 3.7 + currency 1.3) [`Q2 FY26 10-Q, MD&A, p.29–30` and `Note 2, p.9`]. Against the FY2025 vendor totals that leaves **H2 FY25: Systems Protection 1,452.7, Electrical Connections 668.2**. Holding Electrical Connections at **+12.0%** in H2 (below its +18.1% H1 rate, because the acquisition contribution lapses and its organic rate is mid-teens) gives EC H2 FY26E **748.4**, and Systems Protection takes the residual **1,910.8 (+31.5%)**. Group H2 growth is then +25.4%, which is *lower* than the Q3 guide of +32–35% precisely because management's own FY guide implies a Q4 step-down to about +17% — the shape `earnings/04` isolated and flagged as the single unresolved question in the setup [`earnings/04_guidance-consensus.md`, §3]. *Inference, not from filings — the segment split of guided H2 revenue is this agent's arithmetic on filed H1 actuals and guided group totals.*

**Step 3 — segment margins.** Systems Protection held at its **H1 FY26 margin of 22.9%** for H2 (H2 FY25 was 20.3%, so this embeds +2.6 points year on year and is consistent with management's guided "mid-20s incrementals in the second half") [`Q2 FY26 10-Q, MD&A, p.29`; `Q2 FY26 transcript, Q&A (CFO Corona)`]. Electrical Connections held at **26.0%** for H2 against 28.8% in H2 FY25 — i.e. the year-on-year margin erosion the filing attributes to tariff and raw-material inflation, growth investment and unfavourable mix is assumed to continue at roughly its H1 pace, not to reverse [`Q2 FY26 10-Q, MD&A, p.30`].

| Segment (FY2026E, forward basis) | Revenue | Segment income (EBIT-type) | Margin | % of reportable segment income | % of adjusted EBIT (after corporate) | Basis / source |
|---|---:|---:|---:|---:|---:|---|
| **Systems Protection** | **3,877.7** (+49.6% vs FY25) | **888.9** | 22.9% | **69.6%** | **78.9%** | H1 actual 1,966.9 / 451.3 [`Q2 FY26 10-Q, Note 13, p.20`] + H2E 1,910.8 at 22.9% |
| **Electrical Connections** | **1,494.8** (+15.0% vs FY25) | **388.2** | 26.0% | **30.4%** | **34.4%** | H1 actual 746.4 / 193.6 [`Q2 FY26 10-Q, Note 13, p.20`] + H2E 748.4 at 26.0% |
| *Enterprise and other* (corporate cost pool) | — | **(150.0)** | n/a | **(11.7)%** | **(13.3)%** | H1 actual (73.7) [`Q2 FY26 10-Q, Note 13, p.21`] annualised; FY25 was (123.8) [vendor] |
| **= Reportable segment income (FY2026E)** | **5,372.5** | **1,277.1** | 23.8% | **100.0%** | — | sums to the guidance midpoint revenue exactly |
| **= Adjusted EBIT after corporate (FY2026E)** | | **1,127.1** | 21.0% | — | **100.0%** | 1,277.1 − 150.0 |
| *Memo:* unallocated intangible amortization (FY2026E) | — | **(165.0)** | — | — | — | H1 actual (82.2) annualised [`Q2 FY26 10-Q, Note 13, p.21`]; FY25 (147.1) [vendor] |

**The forward build ties to management's own guidance — this is the check that makes it usable.** Take FY2026E adjusted EBIT of **1,127.1**, subtract guided interest expense of **~65.0** [`Capital IQ Estimates export → Guidance`, Interest Expense FY 2026, guidance date 2026-05-01], and tax at the company's own **22.4% H1 FY26 effective rate** [`Q2 FY26 10-Q, MD&A effective-tax-rate table`]: `(1,127.1 − 65.0) × (1 − 0.224) = 824.2`. Divided by 164.1m diluted weighted-average shares [`Q2 FY26 10-Q, Note 4`] that is **adjusted EPS of $5.02**, inside management's guided **$5.00–5.10** and just below the midpoint. The segment build is therefore not free-floating: it reproduces the company's own guided earnings from the bottom up. Using the Street's FY2026 revenue of 5,435.3 instead of the guidance midpoint would add ~$62.8m of sales and, at roughly 25% incremental margin, ~$15.7m of segment income — about +0.5% on gross enterprise value, or ~$2 per share. The conservative (guidance-midpoint) build is the one used.

---

## 2. Segment Multiples & Comparables

**The multiple basis, stated once and used for both segments: forward EV ÷ FY2026E adjusted operating profit.** Each comparable's multiple is computed as its **current enterprise value divided by its own FY2026 guided or consensus adjusted operating profit** — a forward multiple applied to a forward metric, on the same basis, as the hard rule requires. Adjusted operating profit is the right line to compare because, like nVent's segment income, each comparable's adjusted operating profit is struck **before** acquired-intangible amortization — so the amortization treatment matches on both sides of the multiple and is not silently double-charged.

**One basis difference must be named.** A comparable's adjusted operating profit is **after** its own corporate costs, while nVent's segment income is **before** the Enterprise-and-other pool. Applying a peer multiple to a before-corporate metric therefore overstates value unless the corporate pool is separately capitalized and deducted — which is exactly what §4 does, at the same blended multiple. Algebraically that is identical to applying the peer multiple to an after-corporate metric, so the two sides stay consistent and Reconciliation Gate 3 holds.

**No peer multiples exist in the data pool.** `ciq_facts.json` reports `peer_ev_ebitda` as **missing** ("CIQ 'comps' export not found for NVT — pull it"), and the pool's Capital IQ Competitors export carries LTM revenue only, with no valuation columns [`nVent-Electric-plc-NYSE-NVT-Competitors.txt`, header block]. Every comparable multiple below is therefore **web-sourced and unverified**, dated, and flagged as such. This triggers the MODULE_RULES "no peer data" partial-data rule for `06`: segment multiples are justified from web comparables and the whole SOTP is marked **low-confidence** on that ground.

| Segment | Metric used (period basis) | Multiple applied | Named comparable | Comparable's multiple | Source |
|---|---|---:|---|---:|---|
| **Systems Protection** | FY2026E segment income **888.9** (**FY2026E — forward**, guidance-anchored, H1 filed + H2 estimated) | **26.0x** (range 22.0–30.0x) | **Vertiv Holdings Co (NYSE:VRT)** — primary | **32.6x** forward EV ÷ FY2026E adjusted operating profit | EV $108.23bn [`Web: stockanalysis.com VRT statistics, retrieved 2026-09-07, price/data as of 2026-09-04 close — indicative, unverified`] ÷ FY2026 guided adjusted operating profit $3,325m [`Vertiv Q2 2026 results release, 2026-07-29 — company release, unverified web copy`] |
| | | | *Secondary bracket:* **Eaton Corporation plc (NYSE:ETN)** | forward P/E **27.3x**; trailing EV/EBITDA **27.1x** | `Web: stockanalysis.com ETN statistics, retrieved 2026-09-07 (as of 2026-09-04 close) — indicative, unverified`. Used as a directional bracket only — Eaton's guided "segment margin" is a pre-corporate measure, so its EV/EBIT is not on the same basis and is not used to set the multiple |
| **Electrical Connections** | FY2026E segment income **388.2** (**FY2026E — forward**, guidance-anchored, H1 filed + H2 estimated) | **17.0x** (range 14.5–19.5x) | **Hubbell Incorporated (NYSE:HUBB)** — primary | **18.6x** forward EV ÷ FY2026E adjusted operating profit | EV $29.50bn [`Web: stockanalysis.com HUBB statistics, retrieved 2026-09-07 (as of 2026-09-04 close) — indicative, unverified`] ÷ FY2026E adjusted operating profit ≈ $1,590m, derived from guided sales growth +16–18% on FY2025 net sales $5,844.6m and guided adjusted operating margin 23.1–23.4% [`Hubbell Q2 2026 results release, 2026-07-28 — company release, unverified web copy`; FY2025 sales per `business-model/08_competitive-map.md`, Competitor B] |
| | | | *Floor context:* **Atkore Inc. (NYSE:ATKR)** | **10.7x** EV ÷ FY2026E adjusted EBITDA (EV $3.73bn ÷ $350m midpoint) | `Web: stockanalysis.com ATKR statistics, retrieved 2026-09-07`; guidance $340–360m [`Atkore Q2 FY2026 results release — company release, unverified web copy`]. **Not used to set the multiple**: Atkore has agreed to be acquired by Prysmian, so its price is a takeout mark, and its PVC-conduit/steel economics are commodity-price-driven in a way Electrical Connections' branded connector and fastening lines are not |
| *Enterprise and other* (corporate) | FY2026E cost **(150.0)** (**FY2026E — forward**) | **23.26x** (the blended segment multiple) | n/a — capitalized at the same rate the segments are valued at, so the deduction is internally consistent | — | derived in §4 |

**Why each comparable matches the segment's economics, not its label.**

- **Systems Protection ← Vertiv.** Both sell engineered power distribution and thermal management (air and liquid cooling) into the same data-centre build cycle, on an order-driven, project-lumpy revenue model, at similar profitability and similar capital intensity: Systems Protection's FY2026E margin is **22.9%** against Vertiv's guided FY2026 adjusted operating margin of **23.8%**, and Systems Protection's capex is **2.0% of sales** (40.1 on 1,966.9 in H1 FY26) [`Q2 FY26 10-Q, Note 13, p.20 and p.22`; `Vertiv Q2 2026 results release, 2026-07-29`]. Infrastructure — mostly data centres and power utilities — is **65.5%** of the segment's H1 FY26 sales, up from 44.8% a year earlier [`Q2 FY26 10-Q, Note 2, p.9`]. That is the closest listed economic match available; the closest *product* match, **Rittal**, is private and has no disclosed income statement at all, so it cannot supply a multiple [`business-model/08_competitive-map.md`, Competitor A].
- **The 26.0x is a discount to Vertiv, and the reason is a mix fact, not a margin haircut.** About a third of Systems Protection is *not* data centres — industrial is 534.0 and commercial/residential 143.6 of H1 FY26 sales — and those verticals were "each flattish" while infrastructure more than doubled [`Q2 FY26 10-Q, Note 2, p.9`; `Q2 FY26 transcript, prepared remarks`]. A ~20% discount to a pure-play prices that mix. Note what is deliberately **not** done: no profitability haircut is applied on top, because this is an earnings-based multiple and the segment's own earnings are already in the denominator (CLAUDE.md §16, no double-charging a quality gap).
- **Electrical Connections ← Hubbell.** Both are US-centric suppliers of electrical connectors, grounding, fastening and cable-management components sold through electrical distributors into commercial, residential and industrial construction, on short-cycle, seasonal demand and low capital intensity (EC capex 1.7% of sales, 12.8 on 746.4) [`Q2 FY26 10-Q, Note 13, p.22`; `MD&A, p.30`; `business-model/08_competitive-map.md`, Competitor B]. Americas is 81% of nVent group revenue and 85% of EC's H1 FY26 sales (634.6 of 746.4), matching Hubbell's US weighting [`Q2 FY26 10-Q, Note 2, p.8`; `ciq_facts.json`, `geographic`].
- **The 17.0x is a modest discount to Hubbell's 18.6x, and the reason is trajectory, not level.** EC's FY2026E margin of 26.0% is *above* Hubbell's guided group adjusted operating margin of ~23.25%, so no profitability discount is warranted. What the denominator does **not** carry is direction: EC's segment margin has fallen for four reported half-years — 31.1% (FY23) → 30.0% (FY24) → 28.7% (FY25, vendor) → 25.9% (H1 FY26), i.e. **−2.6 points year on year** — against Hubbell expanding 40–70bp in FY2026 [`FY24 10-K, MD&A, p.27`; `Capital IQ Financials export → Segments`; `Q2 FY26 10-Q, MD&A, p.30`; `Hubbell Q2 2026 results release, 2026-07-28`]. A ~9% multiple discount sizes that durability gap. That is a permitted reason under §16 (something the denominator does not carry), not a mechanical `own margin ÷ peer margin` haircut.

**Sector Cycle Reality Test — honest absence.** No sector-level multiple history (a sector index / ETF proxy, or the peer group's own aggregate multiple 3–5 years ago) could be sourced for these comparables in this run. Per the Scenario Construction §3 "honest absence" clause this is recorded as **"Not assessable — no sector-level multiple history"** rather than assumed stable. It matters here: Vertiv's own EV/EBITDA has moved from 30.1x (Jan-2026) to 37.0x (late Aug-2026) inside eight months [`Web: valueinvesting.io / stockanalysis.com VRT pages, retrieved 2026-09-07 — indicative, unverified`], which is a live warning that the anchor multiple for Systems Protection sits inside a fast-moving data-centre re-rating and is not a stable reference point.

---

## 3. Segment Valuation

Formula, applied identically to both segments: `segment EV = FY2026E segment income × forward multiple`.

| Segment | Metric value (FY2026E) | Multiple | Segment EV | % of gross EV |
|---|---:|---:|---:|---:|
| Systems Protection | 888.9 | 26.0x | **23,111.4** | 77.8% |
| Electrical Connections | 388.2 | 17.0x | **6,599.4** | 22.2% |
| **Gross enterprise value (sum)** | **1,277.1** | **23.26x** (blended, derived: 29,710.8 ÷ 1,277.1) | **29,710.8** | 100.0% |

**Dispersion, shown separately from the point (Core Principle 5 — no false precision, and no fake mid-band either).**

| Case | Systems Protection multiple | Electrical Connections multiple | Gross EV | Blended multiple |
|---|---:|---:|---:|---:|
| Low | 22.0x | 14.5x | 25,184.7 | 19.72x |
| **Base (the point)** | **26.0x** | **17.0x** | **29,710.8** | **23.26x** |
| High | 30.0x | 19.5x | 34,236.9 | 26.81x |

The low case puts Systems Protection at a **32% discount** to Vertiv's 32.6x and Electrical Connections at a **22% discount** to Hubbell's 18.6x; the high case puts Systems Protection **8% below** Vertiv and Electrical Connections **5% above** Hubbell. Neither end assumes a multiple outside the range the named comparables actually trade at today.

---

## 4. Equity Bridge

All per-share figures divide by **164.2m fully diluted shares** (`01`, §2 — the per-share fair-value count), never the 161.858m market-cap count.

| Step | Base | Low | High |
|---|---:|---:|---:|
| Gross enterprise value (§3) | 29,710.8 | 25,184.7 | 34,236.9 |
| − Capitalized unallocated corporate costs (FY2026E $150.0m × the blended segment multiple) | (3,489.6) | (2,958.0) | (4,021.5) |
| − Net debt (**strict §15 basis**, `01` canonical: total debt 1,492.4 − cash 256.0) | (1,236.4) | (1,236.4) | (1,236.4) |
| − Minority / preferred | 0.0 | 0.0 | 0.0 |
| + Equity-method investments | 0.0 | 0.0 | 0.0 |
| − Conglomerate / holdco discount | 0.0 | 0.0 | 0.0 |
| **= Equity value** | **24,984.8** | **20,990.3** | **28,979.0** |
| ÷ Diluted shares (m) | 164.2 | 164.2 | 164.2 |
| **= SOTP value per share** | **USD 152.16** | **USD 127.83** | **USD 176.49** |
| vs current price — **pool-verified anchor USD 171.16 (close 2026-08-12; ~17–19 trading days stale)** | **−11.1%** | −25.3% | +3.1% |
| vs current price — **indicative refresh USD 156.03 (close 2026-09-04, web-sourced, unverified)** | **−2.5%** | −18.1% | +13.1% |

**Net-cash sign discipline.** nVent is **not** net cash: net debt is a **positive $1,236.4m on the strict §15 basis**, so it appears once, as a single deduction. There is no add-back line anywhere in this bridge and no second netting of the same balance. `01`'s cash-quality test was applied and inherited: all $256.0m is genuine cash and equivalents with no financial-subsidiary portfolio and no short-term investments, so the strict and broad bases coincide — but **$79.6m (31.1%) sits in countries where repatriation is limited by local regulation or tax cost** [`Q2 FY26 10-Q, MD&A, Liquidity and Capital Resources`]. On the conservative variant that nets only the $176.4m of freely usable cash, net debt is 1,316.0 and the base SOTP falls to **USD 151.68** (−$0.48/share). That is a rounding-scale difference and does not change the read.

**The corporate bucket is capitalized, not dropped (Reconciliation Gate 3).** Enterprise-and-other is a recurring cost of **$150.0m in FY2026E** (H1 actual $73.7m annualised; FY2025 $123.8m; FY2024 $105.6m), equal to **11.7% of reportable segment income** [`Q2 FY26 10-Q, Note 13, p.21`; `FY24 10-K, Note 15, p.70`; vendor for FY2025]. It is capitalized at the same blended multiple the segments are valued at, which makes the deduction exactly equivalent to applying the peer multiples to an after-corporate profit — the basis the comparables themselves are struck on. It is never assumed away.

**No conglomerate or holding-company discount is applied, and here is why.** nVent is not a holding company under the Business-Type Method Map — it is an **Operating** business with two related electrical-products segments that share channel (electrical distributors), geography (Americas 81% of revenue), manufacturing footprint and management, run under one set of centrally managed functions [`Q2 FY26 10-Q, Note 13, p.19`; `ciq_facts.json`, `geographic`]. There is no listed subsidiary, no cross-holding structure, no unrelated diversification, and no controlling shareholder whose interests diverge from minorities (CLAUDE.md §24, Filter 6 — no RF-OWN-004 trigger is carried into this module). A breakup discount would be an assertion, not a measurement, so none is taken. What *is* flagged instead is the opposite risk: the two segments are converging on the same end market, so the diversification a discount would normally price is shrinking, not growing.

**Adjustments deliberately not made, each with its reason.**

- **Intangible amortization ($165.0m FY2026E) is not deducted, because both sides of the multiple exclude it.** nVent's segment income excludes it and so do Vertiv's and Hubbell's adjusted operating profit, so charging it here would price it once on nVent and not at all on the comparables. It is nonetheless a real cost of an acquisition programme that spent roughly $1,120m (FY2023), $678m (FY2024) and $976m (FY2025) [`earnings/01_historical-financials.md`, §5]. **Labelled sensitivity, not applied:** deducting FY2026E amortization at the blended 23.26x would remove $3,838m of enterprise value, or **$23.37 per share**, taking the base SOTP to **$128.79**. Anyone who believes acquired intangibles are a recurring economic cost rather than an accounting artefact should read the base at that level.
- **Operating leases ($140.5m) are not added to debt** — `01`'s canonical debt is the filing debt-note basis, and the comparables' enterprise values as sourced are on their own vendors' conventions. Adding them would cut the base SOTP by $0.86/share.
- **Maverick Power is excluded.** The acquisition ($1.75bn cash plus up to $550m earn-out, ~$700m estimated 2026 revenue, expected to close Q4 2026, funded with cash and new debt) had not closed at the run date and is not in `01`'s bridge [`nVent-to-Acquire-Maverick-Power-2026.pdf`, 2026-08-24]. **Labelled sensitivity, *inference — not from filings*:** the precedent is that the Electrical Products Group's enclosure, switchgear and bus-system assets went "predominantly within our Systems Protection reporting segment" [`Q2 FY26 10-Q, MD&A, p.24`], so Maverick most likely lands in Systems Protection. The deal discloses revenue (~$700m) but **no segment income or margin**, so no defensible segment metric can be built for it — under the "suppress rather than guess" rule it is **excluded from the SOTP entirely** rather than valued on an invented margin. Directionally: at the base 26.0x, the $1.75bn headline price would be value-neutral only if Maverick contributes about $67m of segment income (a 9.6% margin on $700m of revenue) and value-additive above that — but that is an arithmetic identity, not a forecast, and the pool contains nothing to test it against.

---

## 5. SOTP Read

**The breakup value is USD 152.16 per share (dispersion USD 127.83–176.49 across the multiple range), which is 11.1% below the stale pool anchor of $171.16 and 2.5% below the fresher indicative quote of $156.03 — so on defensible peer multiples the parts are worth roughly what the whole is quoted at, not more.** This SOTP does not uncover hidden value; the honest finding is that at the fresher price the market and the sum of the parts are within a few percent of each other, and at the stale August price the market was ahead of the parts by about a ninth.

**Systems Protection carries the value, and it is not close: $23,111m of the $29,711m gross enterprise value, or 77.8%, and about $124 of the $152 per-share base** — from a segment that was 53.2% of segment income as recently as the FY2024 audited note. Electrical Connections, which earns the **higher** margin (26.0% FY2026E against 22.9%), contributes only 22.2% of the value, because it is growing at 15% against 49.6% and its margin has fallen for four reported half-years running.

**No segment is being masked by the consolidated multiple — the opposite is happening, and that is the finding.** At the anchor price of $171.16 the consolidated company trades at **25.7x** FY2026E adjusted EBIT (EV 28,940.0 ÷ 1,127.1); at the indicative $156.03 it trades at **23.5x** (EV 26,491.1 ÷ 1,127.1). Solve backwards for what Systems Protection must be worth to justify each, holding Electrical Connections at Hubbell's-discount 17.0x and capitalizing corporate at the blended rate: the anchor price requires **30.0x** for Systems Protection — within 8% of pure-play Vertiv's 32.6x — while the fresher price requires **26.8x**, an 18% discount to Vertiv. In plain terms, the consolidated multiple is not hiding a data-centre business inside a dull industrial; it is already paying close to a data-centre pure-play multiple for 70% of the profit, and the entire question for this stock is whether Systems Protection deserves to be priced within touching distance of Vertiv while a third of its sales sit in flat industrial and commercial end markets and its order book is, in management's own word, "lumpy" [`Q2 FY26 transcript, prepared remarks`].

**Confidence, stated plainly.** This SOTP is **low-confidence** and should be weighted as a cross-check, not as a base-case anchor: (a) no peer multiples exist in the data pool, so every comparable multiple is web-sourced and unverified (MODULE_RULES partial-data "no peer data" rule for `06`); (b) no segment-level consensus or guidance exists, so the FY2026E segment split of guided H2 revenue is this agent's inference, disclosed and reconciled to guided EPS within $0.03 but still an inference; (c) the FY2025 segment comparatives are a tier-5 vendor read because the FY2025 10-K is absent from the pool; (d) the Systems Protection multiple sits inside a data-centre re-rating whose stability could not be tested (Sector Cycle Reality Test — Not assessable); and (e) the price anchor is ~17–19 trading days stale with an 8.84% drift, which is why both price-relative reads are published side by side above. Under the Scenario Construction policy, nVent is an Operating company with a usable forward metric, so `07` should keep `06` inside the minority cross-check weight, not elevate it.

**Out-of-scope guardrail.** No scenario probabilities, probability-weighted target, risk/reward, position size or rating is produced here — those belong to `07_scenario-and-fair-value` and the master synthesizer.
