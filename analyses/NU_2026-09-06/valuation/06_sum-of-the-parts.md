# Sum-of-the-Parts — NU

**Verdict up front: SOTP does not exist for this company.** Nu Holdings reports **one** operating and reportable segment — Banking, meaning the whole Group, 100% of revenue and 100% of pre-tax profit — and the company states this itself: *"The CODM considers the whole Group as a single operating and reportable segment."* `[FY25 Form 20-F (filed 8 Apr 2026), Note 34 (Segment information), p.F-97; restated verbatim in Q2 FY26 Interim Report (14 Aug 2026), Note 34, p.43]` Per the MODULE_RULES Segment / SOTP Rule and this agent's partial-data rule, **SOTP collapses to the consolidated read**. I am not manufacturing a breakup.

**Reporting basis.** IFRS Accounting Standards as issued by the IASB (interim under IAS 34); presentation currency **US dollars (USD)**, filings presented in thousands; fiscal year ends **31 December**; US SEC foreign private issuer, so the annual filing is Form 20-F, not a 10-K `[FY25 Form 20-F, cover page and Note 2]`. All figures below are USD unless stated.

**Business type governs the method.** The `00` triage classifies NU as a **Financial (bank)**. Under the Business-Type Method Map, **EV-based multiples, an FCFF DCF, and the EV bridge as a value are invalid here** — value equity directly. So the "gross enterprise value" line the report structure normally carries is replaced below by an equity-level value, and the substitution is stated rather than assumed. `01`'s own enterprise-value figure of USD 61,243.3m is labelled informational-only for exactly this reason (it omits USD 60.9bn of deposits and payables to network).

**Upstream inputs read.** `00_valuation-data-triage.md`, `01_price-and-capital-structure.md`, `business-model/03_segment-map.md`, `business-model/08_competitive-map.md`. Anchors are taken from `01` verbatim: price **USD 14.30** (2026-08-28 close, pool-verified); fresher indicative **USD 15.37** (2026-09-04, web-sourced, unverified, +7.48%); shares for per-share fair value **4,878,395 thousand** fully diluted; net debt **NET CASH USD 7,744.6m, strict basis**. No anchor is substituted.

**Not used as evidence.** `data/NU/NU_Holdings_Deep_Dive_15_Page_Memo_30_Aug_2026.pdf` is a prior engine output carrying its own target and case weights (§4 tier-9 user note). It was not read for and did not inform any number here.

---

## 1. Segment Inventory

**Reporting currency: USD.** Figures are USD millions on the Capital IQ bank-template basis (which for a bank reports "Total Revenue" *after* interest expense and loan-loss provisions), cross-checked to the filing.

**Denominator definition (so no share can exceed 100% unexplained).** The "% of Total EBIT" column below uses **reportable-segment pre-tax profit** as the denominator. For NU that denominator is *identical to* consolidated pre-tax profit, because the single segment is the whole group. There is therefore **no corporate / unallocable bucket to net off** — the two are the same number, and I show the tie-out.

| Segment | Revenue (FY2025) | Pre-tax profit (FY2025) | Margin | % of Total pre-tax profit | Source |
|---|---:|---:|---:|---:|---|
| Banking (the whole Group) | 6,991.2 | 3,868.4 | 55.3% | **100.0%** | `Capital IQ Financials → Segments export (NU), Business Segments, FY2025 column, filing date 2026-02-25 — vendor export` |
| Corporate / unallocated | **none exists** | **none exists** | — | 0.0% | Same export — the segment table has no reconciling line; segment totals equal group totals exactly |
| **Total (= consolidated)** | **6,991.2** | **3,868.4** | 55.3% | **100.0%** | `Capital IQ Financials → Income Statement export (NU), FY2025: Total Revenue 6,991.185; EBT Incl. Unusual Items 3,868.419 — vendor export` |

**Reconciliation Gate 3 — the bucket that could vanish, and why it cannot here.** Segment revenue 6,991.185 equals consolidated Total Revenue 6,991.185, and segment Net Profit Before Tax 3,868.419 equals consolidated EBT 3,868.419, to the third decimal `[Capital IQ Financials → Segments and Income Statement exports (NU), FY2025 columns — vendor export]`. The same holds for tax (996.747) and net profit after tax (2,868.892). **Zero residual.** Corporate cost is not dropped by assertion — it is already inside the single segment's own profit line, and the forward metric used in §3 (consensus earnings per share) is a consolidated, after-tax, after-all-corporate-cost, attributable-to-shareholders number. There is nothing left to capitalize and subtract.

**A definitional note carried from upstream, not flattened.** The vendor's FY2025 revenue of USD 6,991.2m and the 20-F's own Note-34 revenue base of USD 12,083.8m are **both correct on their own basis** and are not interchangeable: the vendor figure is after interest expense (4,578.7) and expected credit losses (4,204.9); the Note-34 base is a gross customer-facing revenue definition `[business-model/03_segment-map.md §1a; FY25 Form 20-F, Note 34(b), p.F-97]`. The segment share is 100% on either basis, so the choice does not move this report's conclusion.

**Latest period, same conclusion.** LTM to 30 Jun 2026: Total Revenue 8,442.1, EBT 4,384.6, net income 3,607.1, diluted EPS 0.734069 `[Capital IQ Financials → Income Statement export (NU), LTM Jun-30-2026 column — vendor export]`. The single-segment disclosure is repeated word-for-word in the Q2 FY26 interim `[Q2 FY26 Interim Report (14 Aug 2026), Note 34, p.43]`.

### 1b. Disclosed splits — a labelled cross-check, NOT a reportable-segment SOTP

The filing discloses geography and product/income type as **disaggregation**, not as segments. **Profit is not disclosed for either.** `[FY25 Form 20-F, Note 34(b) and Note 6, pp.F-97, F-30–F-31]`

| Disclosed split | FY2025 revenue share (Note-34 base) | H1 FY2026 share | Profit disclosed? | Forward estimate available? |
|---|---:|---:|---|---|
| Brazil | 91.4% (11,038.3) | 90.9% (7,576.9) | **No** | **No** |
| Mexico | 6.7% (808.1) | 7.2% (603.6) | **No** | **No** |
| Other countries (incl. Colombia, US) | 2.0% (237.3) | 1.8% (152.8) | **No** | **No** |
| Interest — personal loans | 39.6% (4,784.3) | 40.0% (3,337.3) | **No** | **No** |
| Interest — credit card | 38.0% (4,597.8) | 40.3% (3,361.6) | **No** | **No** |
| Credit & prepaid card income (interchange) | 14.2% (1,720.3) | 12.3% (1,021.2) | **No** | **No** |
| Late fees / other receivables / other fees / insurance | 8.1% (981.5) | 7.3% (613.2) | **No** | **No** |

`[FY25 Form 20-F, Note 34(b) and Note 6(a)/6(b), pp.F-97, F-30–F-31; Q2 FY26 Interim Report (14 Aug 2026), Note 34(b) and Note 6, pp.43, 16]`

**Two reasons this split cannot become a SOTP, stated plainly.**
1. **No profit by country or product, at all** — so any "segment EBIT" would be invented from a revenue share. `business-model/03_segment-map.md §3` is explicit that downstream agents must treat segment-level profitability as *Not disclosed* and must not construct it from revenue shares. I do not.
2. **The revenue base itself is incomplete.** Note 34's base excludes treasury income — USD 3,691.0m, or **23.4% of the group's USD 15,774.7m of total interest and fee income in FY2025** (20.5% in H1'26) `[FY25 Form 20-F, Note 6(a) and Note 34(b), pp.F-30, F-97]`. So roughly a fifth to a quarter of what the group earns sits nowhere in the geographic table.

**Where the regulatory capital sits — a third lens, with its basis mismatch named.** At 30 Jun 2026 the three regulated operating entities held Brazil USD 5,597.6m (90.2%), Mexico USD 427.6m (6.9%) and Colombia USD 179.7m (2.9%) of USD 6,204.9m total `[Q2 FY26 Interim Report (14 Aug 2026), Note 33(a)(b)(c), pp.42–43]`. **This is not a value allocation and must not be used as one:** regulatory capital is a prudential measure at named subsidiaries, while group equity attributable to shareholders is USD 13,249.7m `[Q2 FY26 Interim Report, statement of financial position]` — the three regulated entities' regulatory capital is only **46.8%** of group equity (`6,204.9 / 13,249.7`). Different measurement, different scope, so the two may not be treated as one share (§15 matched-basis rule). It corroborates direction only: Brazil carries ~90% of the business on every disclosed lens available (revenue 91.4%, regulatory capital 90.2%, deposits 80.2% of USD 45.3bn `[Q2 FY26 earnings call transcript, 13 Aug 2026, prepared remarks]`).

---

## 2. Segment Multiples & Comparables

**Because there is one segment, there is one multiple — and it is the consolidated multiple.** This section is the dominant-segment sanity check the partial-data rule permits. It is **not** an independent valuation method (see §5).

**Period basis: NTM (next twelve months) for every line.** No trailing multiple is used as a value input.

| Segment | Metric used | Multiple applied | Named comparable | Comparable's multiple | Source |
|---|---|---:|---|---:|---|
| Banking (= whole Group) | **NTM consensus EPS USD 0.97** (GAAP, IFRS basis; FY2026E 0.8482 on 16 estimates and FY2027E 1.11006 on 16 estimates bracket it) | **10.68× NTM P/E** (base point — the midpoint of the two closest-economics anchors below) | **Banco BTG Pactual S.A. (BOVESPA:BPAC11)** — closest match on the economics that set a bank's multiple: forward return on tangible book **36.2%** vs NU's **38.8%**, the nearest in the whole set | **9.39× NTM P/E** | `Capital IQ Estimates export → Consensus tab (NYSE:NU), as-of 2026-08-29`; `Capital IQ Comps → Trading Multiples and Financial Data (Nu Holdings comp set), As-Of Date 2026-08-29, USD — vendor export`; return arithmetic mine |
| — upper anchor | same | 11.97× | **Credicorp Ltd. (NYSE:BAP)** — the highest-rated financial in the set, a LatAm multi-country banking group with a 24.6% forward return on tangible book; it marks what this peer group will pay for a high-return LatAm financial | 11.97× | `Capital IQ Comps → Trading Multiples, 2026-08-29 — vendor export` |
| — same-business-model anchor | same | 6.51× | **Inter & Co, Inc. (NasdaqGS:INTR)** — the only branchless, digital-only Brazilian retail bank in the set: identical distribution model, same country, same regulator | 6.51× | `Capital IQ Comps → Trading Multiples, 2026-08-29 — vendor export` |
| — peer-median reference (**mismatched — see below**) | same | 7.73× | Peer median of the 10-name LatAm financial set (Itaú 8.16×, Santander Brasil 7.61×, Grupo Cibest 7.84×, Banorte 8.17×, Bradesco 6.08×, Banco do Brasil 5.14×, BTG 9.39×, Credicorp 11.97×, Inter 6.51×, PagSeguro 5.03×) | 7.73× | `Capital IQ Comps → Trading Multiples, Summary Statistics, 2026-08-29 — vendor export` |

**Why BTG Pactual fits, in one clause.** A bank's multiple is set by the return it earns on its tangible equity and by how fast it can grow that equity; BTG is the only name in the set within 3 percentage points of NU on that return (36.2% vs 38.8%), which is the economic property that matters, not the surface label of "investment bank vs consumer lender."

**Why the peer median does NOT fit, with the numbers.** All eleven companies are measured on the identical two vendor fields (NTM EPS ÷ LTM tangible book value per share), so this is matched-basis:

| | Nu Holdings | BTG Pactual | Credicorp | Itaú | Inter & Co | Peer median (10) |
|---|---:|---:|---:|---:|---:|---:|
| Forward return on tangible book (NTM EPS ÷ LTM TBVPS) | **38.8%** | 36.2% | 24.6% | 27.5% | 21.0% | **23.1%** |
| EPS change, LTM → NTM | **+32.9%** | +52.8% | +11.3% | +13.6% | +25.8% | **+22.8%** |
| NTM forward P/E | 14.76× | 9.39× | 11.97× | 8.16× | 6.51× | **7.73×** |
| P/tangible book, LTM | 5.7× | 3.4× | 3.0× | 2.3× | 1.4× | **1.8×** |

Source for every cell: `Capital IQ Comps → Trading Multiples and Financial Data (Nu Holdings comp set), As-Of Date 2026-08-29, USD — vendor export`; the return and EPS-change ratios are my arithmetic on those two vendor fields. NU earns **1.68× the peer-median forward return on tangible book** (38.8% / 23.1%) and its market price sits at **3.17× the peer-median tangible-book multiple** (5.7× / 1.8×). Applying a 7.73× median built mostly from branch-based incumbents earning 13–19% returns to a business earning 38.8% is the "comparable matched to the surface label, not the economics" defect the rules forbid — so the median is shown as a reference point and **not** used as the base multiple. Adjudicating whether NU's premium over that median is warranted is `03`'s job, not mine.

**Honest limitation.** **No named comparable in this pool matches NU on both return and growth.** BTG matches the return but is a different business; Inter matches the business model at roughly half the return (21.0%) and one-seventh the revenue (USD 1,279.1m vs 8,442.1m). The base multiple is therefore an anchored judgement across two named comps, not a measured comparable — *Inference from named comparables, not from filings.*

---

## 3. Segment Valuation

Formula for every row: `NTM EPS × NTM forward P/E = value per share`; `value per share × fully diluted shares (4,878,395 thousand, from 01) = equity value`.

Implied NTM attributable net income, for the bridge: `USD 0.97 × 4,878.395m = USD 4,731.9m` (derived from consensus EPS and `01`'s share count — *inference, not a consensus line item*).

| Segment | Metric value (NTM) | Multiple | Value per share | Equity value (USD m) |
|---|---:|---:|---:|---:|
| Banking (= whole Group) — **base point** | EPS USD 0.97 | **10.68×** | **USD 10.36** | **50,536.7** |
| — at Credicorp's 11.97× (upper named anchor) | EPS USD 0.97 | 11.97× | USD 11.61 | 56,638.3 |
| — at BTG Pactual's 9.39× (return-matched anchor) | EPS USD 0.97 | 9.39× | USD 9.11 | 44,432.2 |
| — at Inter & Co's 6.51× (model-matched anchor) | EPS USD 0.97 | 6.51× | USD 6.31 | 30,795.6 |
| — at the peer median 7.73× (**mismatched reference, not a value**) | EPS USD 0.97 | 7.73× | USD 7.50 | 36,578.3 |
| *Memo — the market's own mark today* | EPS USD 0.97 | *14.76×* | *USD 14.32 ≈ price* | *69,860.4* |
| **"Gross enterprise value (sum)" line — NOT APPLICABLE** | — | — | — | **Replaced by the equity value above.** NU is a Financial (bank): the Method Map bars EV-based multiples and the EV bridge as a value. `01`'s EV of USD 61,243.3m is informational only and omits USD 60.9bn of deposits and payables to network |

Arithmetic shown: `0.97 × 10.68 = 10.360`; `10.360 × 4,878.395 = 50,540` (50,536.7 on unrounded 10.3596). `0.97 × 11.97 = 11.6109`; `0.97 × 9.39 = 9.1083`; `0.97 × 6.51 = 6.3147`; `0.97 × 7.73 = 7.4981`; `0.97 × 14.76 = 14.317`.

**Base point USD 10.36; dispersion across the named comparables USD 6.31–11.61.** The dispersion is the multiple field, shown separately from the point, not folded into a fake mid-band.

---

## 4. Equity Bridge

Because the single segment IS the consolidated group and the metric is already an equity-level, per-share, after-tax number, most bridge lines are structurally zero. **Every one is shown with its reason rather than dropped.**

| Step | Value (USD m) | Why |
|---|---:|---|
| Gross enterprise value | **Not applicable** | Financial (bank) — Method Map bars EV as a value. The single-segment equity value below replaces it |
| Single-segment equity value (NTM EPS × 10.68× × 4,878.395m shares) | **50,536.7** | §3 |
| − Capitalized unallocated corporate costs | **0.0** | **Not dropped by assertion — there is nothing to capitalize.** The segment table has no reconciling line and segment pre-tax profit equals consolidated EBT exactly (3,868.419 = 3,868.419, FY2025). The NTM EPS metric is consolidated, after all corporate cost, after tax, and attributable to shareholders — the corporate drag is **already netted inside the metric** (Reconciliation Gate 3 satisfied on the collapse path) |
| − Net debt | **0.0 — deliberately not deducted** | `01`'s canonical figure is **NET CASH of USD 7,744.6m, strict basis** (total debt 5,807.0 − cash & equivalents 13,551.6). It is **neither deducted nor added back**, and that is the correct treatment, not an omission: a price-to-earnings value is already an equity value, and the earnings it capitalises are struck *after* the interest cost of that debt and *including* the income on that cash. Adding the net cash back would count the same balance twice (the net-cash sign-discipline rule). `01`'s own cash-quality test reinforces it — this is a bank's working liquidity sitting inside regulated subsidiaries whose ability to upstream it is legally limited, not spare corporate cash `[FY2025 20-F, Item 3.D risk factors; Q2 FY26 Interim Report, Note 11]` |
| − Minority / preferred | **0.0** | Non-controlling interests are **USD 2.1m**, 0.03% of book equity, and preferred equity is nil `[Q2 FY26 Interim Report, statement of financial position]`. Consensus EPS is an attributable-to-shareholders measure, so NCI is already excluded from the numerator; deducting again would double-count |
| + Equity-method investments | **0.0** | Investments in associates are **USD 93.0m**, 0.13% of market cap `[Q2 FY26 Interim Report, statement of financial position]`. Under IFRS the share of associates' profit is already inside consolidated net income and therefore inside the EPS metric — adding the carrying value on top would double-count |
| − Conglomerate / holding-company discount | **0.0 — none applied** | Reason: there is no conglomerate to discount. One reportable segment, one business, no unrelated diversification, and NU is the **top** holding company, not a listed subsidiary of a value-maximising parent. The management-governance module tested §24 Filter 6 explicitly and **RF-OWN-004 was NOT emitted**, with the instruction that **no value-trap note flows to valuation** `[analyses/NU_2026-09-06/management-governance/04_ownership-and-insider-behavior.md, finding 04-021; 99_management-governance-synthesis.md §C]`. Two real qualifiers are recorded rather than converted into an unsourced discount: (a) the Cayman holdco has no material assets other than its subsidiaries and depends on their distributions, which are subject to local capital rules `[FY2025 20-F, Item 3.D]`; (b) the 20:1 dual-class structure gives the founder 74.3% of votes on ~18.6% of the economics `[FY2025 20-F, Item 7.A, pp.203–204]`. Both are priced by the governance module under governance risk and shareholder friendliness; putting a number on them here would price the same fact twice |
| **= Equity value** | **50,536.7** | No plug; every line above is zero with a stated reason |
| ÷ Diluted shares | **4,878,395 thousand** | `01` Anchor Summary — fully diluted (outstanding 4,830,689k + 44,667k options/RSUs on the treasury-stock method + 3,039k acquisition shares; no convertibles) `[Q2 FY26 Interim Report, Notes 31 and 9]` |
| **= SOTP (collapsed) value per share** | **USD 10.36** | Dispersion across named comparables **USD 6.31 – 11.61** |
| vs current price — pool-verified | **USD 14.30** (2026-08-28 close) | Collapsed value is **27.6% below** the anchor price: `(10.36 − 14.30) / 14.30` |
| vs current price — fresher indicative | **USD 15.37** (2026-09-04 close, web-sourced, unverified, +7.48% above the anchor) | Collapsed value is **32.6% below** the fresher price: `(10.36 − 15.37) / 15.37` |

**No conglomerate or holding-company discount is applied, and the reason is stated above: there is no conglomerate.** A discount for the trapped-cash and dual-class facts is deliberately not taken here to avoid double-pricing findings the governance module already owns.

**Note on what these percentages are and are not.** They are the gap between a *sanity-check* multiple read and the price. They are **not** a margin of safety and **not** a downside-to-bear — those two are separate, defined metrics that belong to `07`, computed off `07`'s own base and bear levels. Do not lift the −27.6% into either slot.

---

## 5. SOTP Read

**There is no sum of the parts here — there is one part.** Banking is 100% of revenue and 100% of pre-tax profit, the company says so in its own segment note, and the segment figures tie to the consolidated income statement to the third decimal with zero unallocated bucket. The Brazil / Mexico / Other split (91.4% / 6.7% / 2.0% of FY2025 Note-34 revenue) and the product split (loans and card interest 77.6%, interchange 14.2%) are disclosure lenses with **no profit disclosed for any line and no forward estimate for any line**, so a geographic or product breakup is **not structurable on a forward basis — excluded**, and no trailing-earnings version of it appears here even as a cross-check, because there is no trailing segment profit to build one from.

**Brazil carries the value, on every disclosed lens — and that is a concentration finding, not a SOTP finding.** Revenue 91.4%, regulatory capital 90.2%, deposits 80.2%. Mexico is the fastest-changing piece (6.7% → 7.2% of revenue, and it became a full multiple bank on 6 Aug 2026 `[Q2 FY26 Interim Report, Note 35, p.44]`), but at ~7% of revenue with no disclosed profit it cannot be a hidden value pocket of any size, and management's claim that Mexican revenue per active customer is USD 12.3 against USD 5.6 in Brazil is an unsupported transcript statement that must not be converted into a profit share `[Q2 FY26 earnings call transcript, 13 Aug 2026, prepared remarks; qualifier carried from business-model/03_segment-map.md §3]`.

**The core SOTP question — is a high-value business masked by a low-value one? — answers "no", and the disclosed splits point the *other* way.** If anything were being masked it would be the interchange/payments piece, and the only listed payments comparable in the set, PagSeguro Digital (NYSE:PAGS), trades at the **lowest** forward P/E of all eleven names (5.03× vs the lending comps' 6.08–11.97×) `[Capital IQ Comps → Trading Multiples, 2026-08-29 — vendor export]`. Splitting the lender from the payments arm would lower the blended multiple, not raise it. The consolidated multiple is hiding nothing.

**The one thing `07` must take from this module.** This collapsed value is **not an independent method and must not be weighted as one.** It is arithmetically the same construction as `03`'s peer relative valuation — the same NTM EPS, the same 2026-08-29 Capital IQ comp set — so counting it alongside `03` would be one read counted twice, exactly the "the methods agree only if the methods are independent" trap (CLAUDE.md §16). SOTP contributes **zero weight** to the fair-value triangulation for NU. What it does contribute is the finding itself: **at USD 14.30 the market is paying 14.76× NTM earnings for a single Brazilian consumer-credit book, against 5.03–11.97× for every named LatAm financial comparable — a 91% premium to the peer median 7.73× and a 23% premium to the highest-rated name in the set — and there is no second business inside the company for that premium to be hiding in.** Whether the premium is warranted by the 38.8% forward return on tangible book and 32.9% forward earnings growth is `03`'s and `07`'s call, not mine.

---

### Self-check

- Segment inventory reconciles to consolidated revenue and pre-tax profit exactly (6,991.185 and 3,868.419, zero residual); the unallocated bucket is named as non-existent and proven, not assumed.
- Single-segment collapse applied correctly per the Segment / SOTP Rule; no spurious breakup constructed.
- Every multiple cites a named comparable (BTG Pactual, Credicorp, Inter & Co, plus the full 10-name median); none fabricated.
- Every value is on a **forward (NTM)** metric × a **forward (NTM)** comparable multiple, with the period basis stated; no trailing base is used as a value input.
- Comparables matched to economics (forward return on tangible book, forward earnings growth) with the reason stated, and the mismatched peer median explicitly excluded from the base multiple.
- Geographic and product splits marked **"not structurable on a forward basis — excluded"**; no trailing breakup fed forward.
- Vendor comp multiples are labelled as a Capital IQ export with the 2026-08-29 as-of date; the base multiple is labelled inference.
- Equity bridge uses `01`'s fully diluted count of 4,878,395 thousand; net cash is **neither deducted nor added back**, with the reason (no double-count); the corporate drag is shown to be already netted in the metric, not dropped.
- Conglomerate discount: none applied, with the reason and the RF-OWN-004 negative test cited.
- The read names Brazil as carrying the value and states plainly that nothing is masked.
- Output is a base-case point (USD 10.36) with the multiple dispersion (USD 6.31–11.61) shown separately.
