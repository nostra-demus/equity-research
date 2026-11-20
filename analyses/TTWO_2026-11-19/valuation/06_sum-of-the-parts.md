# Sum-of-the-Parts — TTWO

**Company:** Take-Two Interactive Software, Inc. (NasdaqGS:TTWO) · **Run date:** 2026-11-20
**Reporting standard:** US GAAP · **Reporting currency:** USD, millions unless stated · **Fiscal year ends 31 March** ("FY2026" = year ended 2026-03-31; latest balance sheet 2026-09-30 = Q2 of FY2027). Jurisdiction: US SEC domestic filer — Form 10-K and Form 10-Q are the actual local documents [`FY26 10-K, cover page`; `Q2 FY27 10-Q, cover page`].

**Headline verdict of this agent, stated before any table so it cannot be mistaken for a breakup value: a sum-of-the-parts cannot be built for Take-Two, because Take-Two has only one part.** The company reports **one operating and reportable segment**, its segment measure of profit **is** consolidated net income (loss), and its segment assets **are** consolidated total assets [`FY26 10-K, Note 21 (Segment Reporting and Geographic Information), p.102`]. Per MODULE_RULES "Segment / SOTP Rule" and this agent's own partial-data rule, **SOTP collapses to the consolidated read**. What follows is that collapse, plus one labelled forward multiple sanity check — **not** a breakup value, and **not** a weighted method for `07`.

**Source-check status carried forward: UNCHECKED, not verified clean.** This frozen generation carries **no `numeric_reading_check`** object at any source or sheet level (my own string count of `GENERATION_ROOT/manifest.json` for the token `numeric_reading_check` = **0**), and `GENERATION_ROOT/corpus.txt` carries no labelled extractor reading-warning annotation. There is therefore **no literal warning token, no source/extract reference and no canonical LF-line/column span to quarantine**, and no amount below is marked not-proven on that basis — but a missing legacy check means **unchecked, not clean**: no warning here is not proof of accuracy. Every filing figure below was read directly from the frozen extract of the document that reports it (`10K_2025_26_0001628280-26-037434`, `10Q_2Q_0001628280-26-072254`, `TTWO 2Q27 Earnings Release FINAL`); Capital IQ workbook tabs are used as the tier-5 vendor read they are, never as the authority for a filing's own number (CLAUDE.md §5). Every restating layer must carry this qualifier forward.

**Anchor adopted verbatim from `01_price-and-capital-structure.md` §7 (Reconciliation Gate 1 — Anchor consistency), not rebuilt:** price **USD 216.61** (last close, as-of **2026-11-19**, `pool-verified`, 1 trading day old, no staleness cap); shares for per-share work **188.0m** (the company's own disclosed fully diluted count, chosen in `01` over the 187.1m trailing figure because every trailing period is a loss and the trailing "diluted" count is basic by antidilution); market cap **40,552.3**; total debt **2,519.8** (borrowings only, filing debt note); **net debt 1,370.4 — strict §15 basis, canonical**; EV **41,922.7**; minority and preferred **nil**; equity-method investments **none disclosed**. Drift note carried from `01`: the price anchor is an at-or-just-before-launch close — Grand Theft Auto VI released **2026-11-19**, the anchor's own as-of date — so it contains no post-launch trading [`Q2 FY27 10-Q, Item 1A and Item 2`].

**Cross-module inputs used.** `business-model/03_segment-map.md` (present — single-segment finding, revenue cuts, the two unnamed goodwill reporting units); `business-model/08_competitive-map.md` (present — named peers and their economics); `00_valuation-data-triage.md` (present — inventory, caps, the negative trailing base). `earnings/01_historical-financials.md` is present but not load-bearing here, because there is no segment EBIT detail for it to supply.

---

## 0. Adjudication of the triage's "SOTP not possible" finding

The invocation asked me to reach my own sourced conclusion rather than inherit `00`'s. I did, and I reach the same conclusion by a different route — with one correction of emphasis.

| Question | My own sourced answer | Evidence |
|---|---|---|
| How many reportable segments does TTWO disclose? | **One.** "We have one operating and reportable segment. Our operations involve similar products and customers worldwide." | `FY26 10-K, Note 21, p.102` — read directly in the frozen extract at line 5297; the same sentence also appears in Item 1 at line 386 ("We have one operating and reportable segment. See Note 21") |
| Is that stable, or a one-year presentation? | **Stable and repeated in the latest interim filing.** The identical sentence appears in the Q2 FY27 10-Q segment note | `Q2 FY27 10-Q, Note 14 (Segment Reporting and Geographic Information)` — read directly, frozen extract line 1011 |
| Does the vendor export agree? | **Yes, across ten annual columns.** One business segment, "Sale of Software Titles", equal to total revenue, gross profit, operating profit, interest expense, net profit before tax and tax in **every** column FY2017→FY2026 (FY26: revenue 6,656.4 = total 6,656.4; operating profit before tax −104.2 = total −104.2) | `CIQ Financials_Annual → Segments`, retrieved 2026-11-19 — **tier-5 vendor export, not a filing** |
| Is there segment-level EBIT below the consolidated total? | **No.** The segment measure of profit *is* consolidated net income (loss): "Our CODM uses consolidated net income (loss) — supplemented by sales information by product category, major product title, and platform — for the purpose of evaluating performance and allocating resources" | `FY26 10-K, Note 21, p.102` |
| Is there an unallocated / corporate bucket to capitalize? | **No — and this is the load-bearing point for Gate 3 (below).** "All significant expense categories are presented on our Consolidated Statements of Operations… The measure of segment assets is reported on the Consolidated Balance Sheet as Total assets." The note's "other segment items" are depreciation and amortization, business reorganization, interest and other net, and the tax line — all already inside the consolidated statements | `FY26 10-K, Note 21, p.102` |
| So: data gap, or disclosure fact? | **Disclosure fact.** Nothing failed to extract: the manifest reports `{"sources": 30, "workbooks": 19, "tabs": 62, "extracts_written": 73, "failures": 0}`. The segment note exists, is readable, and says there is one segment. Recording this as "missing segment data" would be a bad-extraction error (CLAUDE.md §20); recording it as a reason to invent segments would be worse | `GENERATION_ROOT/manifest.json` (read directly) |

**Where I agree with `00`:** SOTP cannot run as a valuation method, and the Score-Cap row *"SOTP not possible for a **multi-segment** business → overall usefulness max 80"* does **not** bind, because that cap is written for a multi-segment business and TTWO is not one. **Where I correct the emphasis:** "SOTP not possible" is the wrong label for a single-segment company, because it reads like a data failure. The correct label, and the one this report carries, is the module's own: **"single-segment — SOTP collapses to the consolidated read."** `99` should record it that way.

**One disclosure that proves an internal economic split exists — and still does not license a breakup.** The FY26 10-K states: "A reporting unit is defined as an operating segment or one level below an operating segment. We have determined that we operate in **two reporting units**, which are components of our operating segment" [`FY26 10-K, Critical Accounting Policies and Estimates — Goodwill`]. One of those two units absorbed goodwill impairments of **3,545.2 (FY25)** and **2,342.1 (FY24)** and was down to **570.0** of goodwill at 2026-03-31; group net goodwill is **1,061.9** against gross 6,949.2 and accumulated impairments 5,887.3 [`FY26 10-K, Note 9 (Goodwill and Intangible Assets, Net), pp.83–84`]. So the company tells a reader that two different economic businesses sit inside its one reported segment — and then discloses **neither unit's name, nor its revenue, nor its profit, nor its assets**. A SOTP built on that would be two unnamed boxes with invented metrics and invented multiples. **Attaching either unit to a label (Rockstar Games / 2K / Zynga) would be inference, not from filings — so it is not done here**, and no multiple is applied to anything derived from it. This is the single most valuable *missing* disclosure for a SOTP on TTWO, and it is named rather than filled in.

---

## 1. Segment Inventory

Reporting currency **USD, millions**, US GAAP. No inverted columns in this table.

**Denominator definition, stated before the percentages so a corporate cost cannot hide behind them:** "% of Total EBIT" below is **reportable-segment EBIT**, which for TTWO is **arithmetically identical to total consolidated EBIT**, because the segment note's own profit measure is the consolidated result and there is **no unallocated / corporate bucket at all** [`FY26 10-K, Note 21, p.102`]. There is therefore no gap between "sums to 100% of reportable EBIT" and "100% of total EBIT net of corporate drag", and no segment share can exceed 100%. `business-model/03_segment-map.md` reaches the same conclusion ("There is no 'Other' or 'Corporate' bucket at all — with one segment there is nothing to bucket, so the >10% 'Other' test is not applicable rather than passed").

| Segment | Revenue | EBIT (or EBITDA) | Margin | % of Total EBIT | Source |
|---|---:|---:|---:|---:|---|
| **Sale of software titles** — the sole operating and reportable segment (Rockstar Games, 2K and Zynga labels; console, PC and mobile; full-game sales plus continuing in-game spending) | **6,656.4** (FY2026, year ended 2026-03-31) | **EBIT −104.2** (loss from operations) | **(1.5)%** — the filing's own printed operating margin | **100.0%** | `FY26 10-K, Note 21, p.102` (one segment); `FY26 10-K, MD&A — Consolidated Statements of Operations table, p.43` (revenue 6,656.4; loss from operations (104.2) / (1.5)%) — both read directly in the frozen extract |
| *Same segment, latest trailing twelve months (2026-09-30) — vendor read* | *6,409.7* | *EBIT **−112.5***; EBITDA *724.9* | *EBIT (1.8)%* | *100.0%* | `CIQ Comps → Financial Data`, subject row, As-Of 2026-11-19 — **tier-5 vendor export**; pinned by `ciq_facts.json → ltm_ebitda_m` |
| Unallocated / corporate bucket | **None exists** | **None exists** | — | **0.0%** | `FY26 10-K, Note 21, p.102`: all significant expense categories are on the consolidated statements of operations; segment assets = consolidated total assets |
| **Consolidated total** | **6,656.4** (FY26) / 6,409.7 (LTM) | **−104.2** (FY26) / −112.5 (LTM) | (1.5)% / (1.8)% | **100.0%** | Reconciles with **no residual**: one segment = the consolidated total, in all ten annual vendor columns FY2017→FY2026 and in the filing |

**Partial-data rule applied here, as this agent's mandate requires.** One segment carries **100%** of EBIT — far above the >85% single-segment threshold — and the EBIT it carries is a **loss**. So: **"Effectively single-segment — SOTP collapses to the consolidated read."** No pseudo-segments are manufactured. Reconciliation Gate 3 (SOTP ties to consolidated; no vanished bucket) is satisfied on the collapse path **by the metric, not by assertion** — see §4.

### 1A. What the company does disclose instead — and why none of it can carry a multiple

These are real, audited disaggregations of the **same single segment**. Each sums independently to 6,656.4 (100.0%) for FY2026. **Every one of them carries revenue only. Not one carries profit, EBITDA, capital employed or assets.** They are listed so a reader can see exactly what exists, and exactly why no multiple is applied to any of them.

| Disclosed cut (NOT a segment) | FY26 revenue | Share | Profit disclosed? | Could a multiple be applied? |
|---|---:|---:|---|---|
| By content — recurrent consumer spending (virtual currency, add-on content, in-game purchases, in-game advertising) | 5,196.6 | 78.1% | **No** | **No** — no profit metric, and no like-for-like forward comparable at this cut |
| By content — full game and other | 1,459.8 | 21.9% | **No** | **No** |
| By platform — Mobile | 3,333.0 | 50.1% | **No.** Only a direction: mobile "generally generates a lower gross margin percentage than our Console or PC revenue" because platform fees run through cost of revenue — **the size of the gap is not disclosed** | **No** |
| By platform — Console | 2,597.3 | 39.0% | **No** | **No** |
| By platform — PC and other | 726.1 | 10.9% | **No** | **No** |
| By channel — Digital online | 6,459.7 | 97.0% | **No** | **No** |
| By channel — Physical retail and other | 196.7 | 3.0% | **No** | **No** |
| By geography — United States | 3,940.4 | 59.2% | **No** (only fixed assets by location: US 274.5 / International 170.9) | **No** |
| By geography — International | 2,716.0 | 40.8% | **No** | **No** |

Sources: content, platform and channel — `FY26 10-K, MD&A, p.44`; geography and fixed assets by location — `FY26 10-K, Note 21, p.102` (read directly in the frozen extract: United States 3,940.4 / International 2,716.0 / total 6,656.4; fixed assets net US 274.5 / International 170.9 / total 445.4); mobile gross-margin direction — `Q2 FY27 10-Q, MD&A — Trends and Factors Affecting our Business, p.23`.

**The refusal is deliberate and it is the correct answer, not a shortcut.** A SOTP needs a segment metric *and* a matched comparable multiple. Here the metric does not exist at any cut: putting an EV/Sales multiple on "Mobile 3,333.0" against a mobile peer and on "Console 2,597.3" against a console peer would be a breakup built on two numbers the company has never earned a profit on separately, bridged with a group net-debt figure that belongs to neither. That is the pseudo-segment failure this agent is written to prevent. **It is not done, and no number in this report rests on it.**

---

## 2. Segment Multiples & Comparables

**There is one segment, so there is one multiple — and this table is therefore a dominant-segment sanity check, not a SOTP comparables table.** Period basis is stated on every row, as required. The forward basis **is** structurable (a consensus NTM EBITDA exists and forward peer multiples exist), so nothing here rests on trailing earnings — which matters, because TTWO's trailing earnings base is **negative**: LTM EBIT **−112.5** and LTM diluted EPS **−1.29**, which is exactly why the comps export prints TTWO's LTM TEV/EBIT and LTM P/E as "NM" [`CIQ Comps → Trading Multiples`, As-Of 2026-11-19 — vendor export]. A trailing-earnings breakup for TTWO is not merely discouraged by MODULE_RULES Calculation Standard 10; it is **arithmetically impossible**.

| Segment | Metric Used | Multiple Applied | Named Comparable | Comparable's Multiple | Source |
|---|---|---:|---|---:|---|
| **Sale of software titles** (sole segment) — **floor anchor** | **NTM EBITDA 2,349.09** (next twelve months, consensus; period basis **NTM**) | **9.96x** (NTM) | **Peer-set median, 10 named peers** — Roblox, Playtika, Nintendo, PLAYSTUDIOS, 37 Interactive, NEXON, Ubisoft, Konami, tinyBuild (+ Electronic Arts, blank) | **9.96x** NTM TEV/forward EBITDA (median; mean 12.44x, high 25.95x, low 2.20x) | `CIQ Comps → Trading Multiples` and `→ Financial Data`, As-Of **2026-11-19** — **tier-5 vendor export, unverified**; NTM EBITDA pinned in `CIQ Comps → Implied Valuation`, subject row |
| **Same segment — lower economics-matched anchor** | **NTM EBITDA 2,349.09** (basis **NTM**) | **11.04x** (NTM) | **NEXON Co., Ltd. (TSE:3659)** | **11.04x** NTM TEV/forward EBITDA | `CIQ Comps → Trading Multiples`, As-Of 2026-11-19 — vendor export |
| **Same segment — upper economics-matched anchor** | **NTM EBITDA 2,349.09** (basis **NTM**) | **15.14x** (NTM) | **Konami Group Corporation (TSE:9766)** | **15.14x** NTM TEV/forward EBITDA | `CIQ Comps → Trading Multiples`, As-Of 2026-11-19 — vendor export |
| *Memo — what the market itself is paying* | *NTM EBITDA 2,349.09 (basis **NTM**)* | ***17.85x*** | *TTWO at the 216.61 anchor, on `01`'s canonical EV 41,922.7* | *17.79x on the vendor's own TEV of 41,790.1 — the two differ only by the vendor's broad-cash / lease-inclusive basis* | *41,922.7 ÷ 2,349.09 = 17.846x (my arithmetic); vendor's 17.79x from `CIQ Comps → Trading Multiples`, subject row* |

### Why these comparables fit the segment's economics (one clause each, as required)

- **NEXON (11.04x) fits** because it is an owned-IP publisher whose money comes mainly from **continuing in-game spending** across PC, mobile and console with capital tied up in game development rather than plant — the same economics as Take-Two's segment, where recurrent consumer spending was **78.1% of FY26 revenue** and **81% of Q2 FY27 net bookings** [`FY26 10-K, MD&A, p.44`; `Q2 FY27 earnings release (2026-11-09), p.1`], and where capitalised software development costs and licences of **2,346.3** dwarf net fixed assets of **445.4** [`FY26 10-K, Note 7, p.83`; `FY26 10-K, Note 21, p.102`]. NEXON's LTM EBITDA margin is 29.1% [`CIQ Comps → Operating Statistics`, As-Of 2026-11-19 — vendor export].
- **Konami (15.14x) fits** on IP ownership and on the same full-game-plus-live-service split across console and mobile, with annualised sports franchises against Take-Two's NBA 2K and WWE 2K; **stated caveat** — Konami also runs amusement and gaming (arcade, pachinko) businesses Take-Two does not have, and earns a 39.6% LTM EBITDA margin against Take-Two's 11.3%, so it is the **upper** anchor rather than the central one [`CIQ Comps → Operating Statistics`, As-Of 2026-11-19 — vendor export].
- **The 10-peer median (9.96x) is used as the floor anchor**, not the central one, because the set is deliberately wide (2.20x to 25.95x) and contains four businesses whose economics do not match Take-Two's at all (below).

### Comparables deliberately excluded, with the economic reason — matching economics, not labels

- **Electronic Arts — the closest structural twin, and no multiple exists for it.** Every price, share-count, market-cap and multiple cell in the vendor export is blank for EA while all nine other peers are populated [`CIQ Comps → Financial Data` and `→ Trading Multiples`, As-Of 2026-11-19 — vendor export]. `business-model/08_competitive-map.md` records the cause as EA's take-private on 2026-08-04 (web-sourced and labelled unverified there, corroborated inside the pool only by the blank cells). **This is the single biggest weakness in the comparable set**: the one peer that is a licensed-sports-plus-owned-IP publisher across console, PC and mobile at Take-Two's scale (LTM revenue 7,846.0 vs 6,409.7) contributes **no** multiple. Named, not papered over.
- **Nintendo (NTM 25.24x) excluded** — a **hardware platform owner**. It *collects* platform fees; Take-Two *pays* them, which is the stated reason Take-Two's mobile revenue carries a lower gross margin [`Q2 FY27 10-Q, MD&A, p.23`]. First-party console economics are not third-party publisher economics; using Nintendo's multiple here would be matching on the surface label "video games".
- **Roblox (NTM 25.95x) excluded** — a user-generated-content platform with free access, LTM EBITDA margin **−13.0%** and LTM revenue growth **+32.1%**. A multiple that embeds 32% growth and negative margins is not a read on a publisher guiding to flat recurrent consumer spending [`CIQ Comps → Operating Statistics`, As-Of 2026-11-19 — vendor export; `Q2 FY27 investor deck (2026-11-09), p.8`].
- **Playtika (NTM 3.67x) excluded as an anchor** — mobile-only free-to-play, a controlled subsidiary of Playtika Holding UK II Limited, total debt/EBITDA 3.5x and **negative shareholders' equity** (total debt/capital 116.7%). Its 3.67x prices a capital structure and an ownership arrangement Take-Two does not have [`CIQ Comps → Financial Data` and `→ Operating Statistics`, As-Of 2026-11-19 — vendor export].
- **Ubisoft (NTM 2.20x) excluded as an anchor** — a third-party console publisher mid-restructuring, LTM EBITDA margin **−81.5%** and LTM revenue **−21.8%**. Its forward multiple is a recovery artefact off a collapsed base, not a going-concern publisher anchor [`CIQ Comps → Operating Statistics`, As-Of 2026-11-19 — vendor export].
- **37 Interactive (8.88x), PLAYSTUDIOS (NM), tinyBuild (7.37x)** — kept inside the median but not used as named anchors: the first is a China-domestic mobile publisher with revenue falling 10.2%, the latter two are sub-250m-revenue businesses, 1/26th and 1/166th of Take-Two's revenue respectively [`CIQ Comps → Financial Data`, As-Of 2026-11-19 — vendor export].

**Two basis warnings that travel with every multiple above.**
1. **All peer multiples are struck on the vendor's own TEV basis** (broad on cash, lease-inclusive on debt), which `01` reconciled exactly for TTWO: 41,922.7 − 524.2 short-term investments + 391.6 operating leases = 41,790.1. My bridge in §4 uses `01`'s **canonical strict net debt 1,370.4** per Reconciliation Gate 1. Size of that inconsistency, quantified rather than waved past: using the vendor net-debt basis (1,237.8) instead would raise every per-share figure below by **132.6 ÷ 188.0 = USD 0.71**. It is not material to the conclusion, and it is disclosed.
2. **Sector-level multiple history is not in this pool.** The peer workbook carries only current (2026-11-19) peer multiples; there is no peer-group or sector-index multiple history 3–5 years back. The Sector Cycle Reality Test is therefore **"Not assessable — no sector-level multiple history"** for the peer anchor used here. That is a named gap, not an assumption that 9.96x / 11.04x / 15.14x are stable through-cycle levels.

---

## 3. Segment Valuation

**This is the collapsed consolidated read — one segment, one multiple. It is a labelled forward sanity check, not a breakup value, and it must never be quoted as one.** Formula on every row: `segment EV = NTM EBITDA × NTM TEV/EBITDA multiple`.

| Segment | Metric Value | Multiple | Segment EV |
|---|---:|---:|---:|
| Sale of software titles — at the **peer-median floor** anchor (NTM) | 2,349.09 | 9.96x | **23,397.0** |
| Sale of software titles — at **NEXON** (NTM) | 2,349.09 | 11.04x | **25,934.0** |
| **Sale of software titles — base point: midpoint of the two economics-matched anchors (NEXON 11.04x / Konami 15.14x)** | **2,349.09** | **13.09x** | **30,749.6** |
| Sale of software titles — at **Konami** (NTM) | 2,349.09 | 15.14x | **35,565.2** |
| Unallocated / corporate bucket | **none exists** (see §1 and §4) | — | **0.0** |
| **Gross enterprise value (sum) — base point** | **2,349.09** | **13.09x** | **= 30,749.6** |
| *Gross enterprise value — dispersion from the multiple alone* | *2,349.09* | *9.96x – 15.14x* | *23,397.0 – 35,565.2* |

**The sum is trivially a sum: one segment plus a zero corporate bucket.** Gate 3 tie-out: the metric used (consolidated NTM EBITDA) and the segment metric are the **same number by the filing's own definition**, so segment EV = gross EV with no residual and nothing unallocated left over.

**Tie-out against the pool's own independent arithmetic.** `CIQ Comps → Implied Valuation` publishes its own peer-median NTM EBITDA implied EV of **23,397.01** — my 9.96x row reproduces it to the decimal (9.96 × 2,349.09 = 23,397.0), which confirms I am reading the same metric and the same multiple the vendor is [`CIQ Comps → Implied Valuation`, As-Of 2026-11-19 — vendor export].

**One forward-base warning that `03`, `04` and `07` must adjudicate, flagged here because it sits inside my own denominator.** Consensus **NTM EBITDA of 2,349.09** is more than double the company's **own guided FY2027 non-GAAP EBITDA of 1,024–1,082** (midpoint **1,053**) [`TTWO 2Q27 Earnings Release, 2026-11-09, Outlook for Fiscal Year Ending March 31, 2027`]. Most of that is calendar, not disagreement: NTM runs roughly Dec-2026→Nov-2027 and contains a **full** post-Grand-Theft-Auto-VI year, while FY2027 (Apr-2026→Mar-2027) contains only about four and a half months of it (release date 2026-11-19). But not all of it is calendar — the same consensus grid implies **FY2027 revenue of about 8,554** (41,790.1 ÷ 4.88505 = 8,554.0) against company-guided GAAP net revenue of **7,980–8,180** and net bookings of **8,000–8,200**, i.e. consensus sits **above the top of guidance on the current year** [`CIQ Estimates → Multiples`, FY2027 row; `TTWO 2Q27 Earnings Release, Outlook`]. **Consequence, stated plainly: the NTM base used above is a launch-peak base running ahead of the company's own current-year guidance, so the per-share figures in §4 are, if anything, generous.** Reconciling consensus to guidance is `03`/`04`'s job, not this agent's; it is flagged, not resolved, and the §4 output carries the qualifier.

---

## 4. Equity Bridge

At the **base point** multiple of 13.09x (the midpoint of the two economics-matched forward anchors). USD millions except per-share. Every component is `01`'s canonical figure, adopted verbatim.

| Step | Value |
|---|---:|
| Gross enterprise value (2,349.09 NTM EBITDA × 13.09x) | **30,749.6** |
| − Capitalized unallocated corporate costs | **0.0** — **none exist, and this is shown rather than asserted** (see the test below) |
| − Net debt (**strict §15 basis — canonical**: total debt 2,519.8 − cash & equivalents 1,149.4) | **−1,370.4** |
| − Minority / preferred | **0.0** (both nil — no non-controlling-interest line; preferred stock 5.0 shares authorised, **none issued or outstanding**) |
| + Equity-method investments | **0.0** (**none disclosed** — no equity-method line or note in either filing) |
| − Conglomerate / holdco discount | **0.0** (none applied — reason stated below) |
| **= Equity value** | **= 29,379.2** |
| ÷ Diluted shares | **÷ 188.0** |
| **= Collapsed consolidated read, per share (NOT a SOTP breakup value)** | **= USD 156.27** |
| vs current price | **USD 216.61** (as-of 2026-11-19, pool-verified) — the read sits **27.9% below** the price: (216.61 − 156.27) ÷ 216.61 |

Sources for the bridge lines: net debt, minority, preferred, equity-method and shares all from `01_price-and-capital-structure.md` §7 Anchor Summary, which built them from `Q2 FY27 10-Q, Condensed Consolidated Balance Sheets` and `Note 10 (Debt)` and adopted `balance-sheet-survival/01`'s filing-based figure as canonical. **No basis is switched mid-module**: strict net debt is used on every row, and the broad figure (846.2) and vendor figure (1,237.8) are not substituted anywhere.

### Dispersion from the multiple alone (shown separately, so the base point is not false precision)

| Anchor | Multiple (NTM) | Gross EV | − Net debt (strict) | Equity value | ÷ 188.0 | Per share | vs price 216.61 |
|---|---:|---:|---:|---:|---:|---:|---:|
| Peer-set median (floor) | 9.96x | 23,397.0 | −1,370.4 | 22,026.6 | 188.0 | **117.16** | −45.9% |
| NEXON | 11.04x | 25,934.0 | −1,370.4 | 24,563.6 | 188.0 | **130.66** | −39.7% |
| **Base point (NEXON/Konami midpoint)** | **13.09x** | **30,749.6** | **−1,370.4** | **29,379.2** | **188.0** | **156.27** | **−27.9%** |
| Peer-set mean | 12.44x | 29,222.7 | −1,370.4 | 27,852.3 | 188.0 | **148.15** | −31.6% |
| Konami | 15.14x | 35,565.2 | −1,370.4 | 34,194.8 | 188.0 | **181.89** | −16.0% |
| *Memo — the multiple the price itself pays* | *17.85x* | *41,922.7* | *−1,370.4* | *40,552.3* | *187.2 (market-cap count)* | *216.61* | *0.0% by construction* |

**Base case is the point (USD 156.27); the 117.16–181.89 band is the multiple-driven dispersion, not a second "case".** Scenario probabilities, weighted returns and the final fair-value levels belong to `07` and to the master synthesizer, not to this agent.

**Cross-check against the pool's own bridge:** `CIQ Comps → Implied Valuation` publishes a peer-median NTM-EBITDA implied price of **118.36** per share. Mine at the same 9.96x is **117.16**. The whole 1.20 gap is two labelled basis differences and no third thing: the vendor divides by **187.21** shares and bridges on **+ cash & short-term investments 1,673.6 − total debt 2,911.4** (i.e. broad cash and lease-inclusive debt, net 1,237.8), while I divide by **188.0** and bridge on **strict net debt 1,370.4** per Gate 1. Both are named; mine is the canonical one for this run.

### Gate 3 — the corporate bucket is netted, not dropped (and this holds on the collapse path)

My own partial-data rule is explicit that a corporate / unallocable cost bucket may not be dropped by assertion even when SOTP collapses. The test, done rather than claimed:

- **The company discloses no unallocated bucket to begin with:** "All significant expense categories are presented on our Consolidated Statements of Operations… The measure of segment assets is reported on the Consolidated Balance Sheet as Total assets" [`FY26 10-K, Note 21, p.102`]. The vendor export agrees in all ten annual columns — segment operating profit before tax equals total operating profit before tax, every year [`CIQ Financials_Annual → Segments` — vendor export].
- **The metric I applied the multiple to already nets every corporate cost.** NTM EBITDA of 2,349.09 is a **consolidated** consensus figure, so group overheads, corporate general and administrative expense and business-reorganization costs are **inside the denominator before the multiple is applied**. The route taken is therefore the first of the two my rule permits — *apply the multiple to a metric that already nets the corporate drag, and say so explicitly* — and this sentence is that explicit statement.
- **Nothing is capitalized and subtracted, because doing so would charge the same cost twice.** Subtracting a capitalized corporate-cost figure on top of a consolidated EBITDA base would double-count. The line in the bridge is 0.0 for that reason, stated rather than left blank.

### Conglomerate / holding-company discount: **none applied**, and why none is warranted

Four tests, each answered from evidence:

1. **Structure.** One operating and reportable segment, managed on a consolidated basis by the CEO as Chief Operating Decision Maker [`FY26 10-K, Note 21, p.102`]. There is no holding-company-over-listed-subsidiaries structure to discount — the Business-Type Method Map classifies TTWO as an **Operating** company, not a Holding company, so SOTP is not even the primary method here (`00_valuation-data-triage` §3, confirmed by my own read of the segment note).
2. **Unrelated diversification (CLAUDE.md §24, Filter 4/6).** None visible: "Our operations involve similar products and customers worldwide" [`FY26 10-K, Note 21, p.102`].
3. **Minority / cross-holding leakage.** Minority interest **nil**, preferred **nil**, equity-method investments **none disclosed** [`Q2 FY27 10-Q, Condensed Consolidated Balance Sheets`; `01` §4]. There is no look-through layer for a discount to compensate for.
4. **Misaligned controlling owner (CLAUDE.md §24, Filter 6).** **RF-OWN-004 did not fire** — recorded verbatim in `management-governance/99_management-governance-synthesis.md`'s cap table, per `00_valuation-data-triage` §4. So the value-trap cap does not bind, and a holdco-style discount cannot be justified on ownership grounds. **Qualifier carried forward, not dropped:** that module's overall verdict is nonetheless *"Misaligned or weak stewardship"* with **no hard disqualifier**. That is a governance read for `07`/`99` to weigh; it is **not** a conglomerate discount and is not applied as one here.

**Applying a discount with no structural reason would be a number with no basis.** None is applied. Zero is a decision, and the four tests above are the reason.

---

## 5. SOTP Read

**Take-Two has no parts to sum, so there is no breakup value — and that is the finding, not a gap.** The company reports **one operating and reportable segment** carrying **100%** of revenue and **100%** of the result, with its segment profit measure defined as consolidated net income (loss) and its segment assets defined as consolidated total assets [`FY26 10-K, Note 21, p.102`, read directly in the frozen extract; repeated at `Q2 FY27 10-Q, Note 14`; corroborated in all ten annual columns of `CIQ Financials_Annual → Segments`]. The one segment that exists **carries all of the value by definition and all of the losses too** — FY26 loss from operations **(104.2)** and LTM EBIT **−112.5**. So the "which segment carries the value" question has an arithmetically forced answer, and the far more useful answer is the one the filings refuse to give: the FY26 10-K admits Take-Two runs **two goodwill reporting units** inside that one segment, one of which absorbed **5,887.3** of cumulative goodwill impairment and is down to **570.0** of remaining goodwill — and then names neither, sizes neither, and gives neither a revenue or profit line [`FY26 10-K, Critical Accounting Policies — Goodwill`; `FY26 10-K, Note 9, pp.83–84`]. **A real segment is being masked here, but it is masked by the disclosure, not by a consolidated multiple** — which is the opposite of the condition SOTP exists to fix, and the reason the honest output is a collapse rather than a breakup.

**On the collapsed consolidated read, and labelled as a cross-check rather than a method:** valuing the single segment on a **forward** basis — consensus **NTM EBITDA 2,349.09** against the two forward comparables whose economics actually match an owned-IP publisher earning mostly from continuing in-game spending (**NEXON 11.04x**, **Konami 15.14x**, midpoint 13.09x) — gives a base point of **USD 156.27 per share** (dispersion **117.16–181.89** across the peer median to Konami), against the pool-verified price of **USD 216.61** as-of 2026-11-19. The price itself pays **17.85x** NTM EBITDA on `01`'s canonical EV of 41,922.7 — above every anchor in my matched set and above the peer median of 9.96x by **79%**. Two qualifiers must travel with that figure or it should not be quoted: the NTM base is a **launch-peak** base that already runs **above** the company's own FY2027 guidance (consensus-implied FY27 revenue ~8,554 vs guided 7,980–8,180), so the read is generous rather than harsh; and the peer anchors carry **no sector-level multiple history** in this pool, so the Sector Cycle Reality Test on them is **"Not assessable"**.

**What `07` should and should not do with this file.** **Do not weight it.** This collapsed read is not an independent method — it is a peer forward-EBITDA multiple applied to the consolidated company, which is precisely what `03_relative-valuation-peers` owns. Carrying it as a separate weighted method would count one read twice and manufacture false agreement, which CLAUDE.md §16's independence test forbids. **SOTP contributes zero weight to the base point**, and the correct one-line entry for `99`'s method table is: *"SOTP — not applicable; single-segment company (`FY26 10-K, Note 21`); collapsed to the consolidated read; no independent weight."* Use the §3/§4 numbers only as a reconciliation check on `03`, and note for the record that `00`'s "SOTP not possible" wording should be restated as **"single-segment — SOTP collapses to the consolidated read"**, because the first reads like a data failure and the second is what the filing actually says.

---

## Self-Check

| Check | Status |
|---|---|
| Segment inventory reconciles to consolidated revenue/EBIT; unallocated bucket named | **Pass.** One segment = consolidated total, FY26 and LTM, in filing and in all ten vendor columns; no residual. Unallocated bucket named and shown to be **nil by the filing's own definition**, not by assertion |
| Single-segment collapse applied rather than a forced breakup | **Pass.** 100% of EBIT in one segment (>85% threshold); no pseudo-segments built from platform / content / channel / geography cuts, and the refusal is reasoned in §1A |
| Every segment multiple cites a NAMED comparable; none fabricated | **Pass.** NEXON (TSE:3659) 11.04x, Konami (TSE:9766) 15.14x, 10-peer median 9.96x — all from `CIQ Comps → Trading Multiples`, As-Of 2026-11-19 |
| Forward metric × forward multiple; period basis stated per segment | **Pass.** NTM EBITDA 2,349.09 × NTM TEV/forward EBITDA, basis labelled **NTM** on every row. No trailing base used anywhere — trailing is structurally impossible (LTM EBIT −112.5, LTM diluted EPS −1.29) |
| Comparables matched to economics, not labels, with a one-clause reason | **Pass.** Reasons given for NEXON and Konami; Nintendo, Roblox, Playtika, Ubisoft and three sub-scale names excluded with the economic reason; EA named as the closest twin with no multiple available |
| Forward basis structurable? | **Yes** — consensus NTM EBITDA and forward peer multiples both exist, so the "not structurable on a forward basis — excluded" branch does not apply. The output is nonetheless **not** fed to `07` as a weighted method, because it duplicates `03` rather than adding an independent read |
| Web-sourced comparable multiples labelled unverified | **Pass — none used.** Every multiple is from the pool's Capital IQ comps export, labelled **tier-5 vendor export** and mechanically unverified (no `numeric_reading_check` in this generation). No web source was consulted for any multiple |
| Equity bridge uses `01`'s anchors; net-debt sign discipline; corporate drag not dropped | **Pass.** Strict canonical net debt **1,370.4 subtracted once**; company is **net debt on both bases**, so no net-cash add-back arises and no double-count is possible; corporate drag shown to be already netted inside the consolidated NTM EBITDA metric (Gate 3 satisfied on the collapse path); per-share on `01`'s **188.0** count |
| Conglomerate discount disclosed with a reason, or its absence justified | **Pass.** None applied; four structural tests shown in §4, including RF-OWN-004 = not fired, with the *"misaligned or weak stewardship"* qualifier carried forward rather than dropped |
| The read identifies which segment carries the value | **Pass** — forced by arithmetic (one segment), and the more useful finding (two unnamed, unsized reporting units) is named instead |
| Base case is a point; dispersion shown separately | **Pass.** Point **156.27**; dispersion **117.16–181.89** shown as a separate table and labelled multiple-driven |
| Banned phrases | **Pass.** No "cheap", "expensive", "undervalued", "overvalued", "attractive valuation", "trading at a discount", "significant upside", "limited downside", "re-rating opportunity", "strong fundamentals", "well positioned" or "best-in-class" appears unpaired with a cited number; every premium/discount is stated as a percentage against a named method |
| Out-of-scope work | **None performed.** No scenario probabilities, no probability-weighted target, no risk/reward, no rating, no position size — those belong to `07` and the master synthesizer |
