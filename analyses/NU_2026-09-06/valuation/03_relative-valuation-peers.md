# Relative Valuation — Peers — NU

**Scope note.** This agent answers one question: how large is NU's premium or discount to its comparable set, is that gap warranted, and what value do peer multiples imply. It does not judge NU against its own trading history (that is `02_multiples-own-history`), does not build a cash-flow model (`04`), and does not set the final fair value (`07`).

**Business type governs the method set.** `00_valuation-data-triage` classifies NU as a **Financial (bank)**. Under the MODULE_RULES Business-Type Method Map, **EV-based multiples (EV/EBITDA, EV/EBIT, EV/Sales) and the enterprise-value bridge as a value are invalid for this issuer**, and `01_price-and-capital-structure` labels its EV of USD 61,243.3m "informational only, invalid as a value" because it omits USD 60.9bn of deposits and payables to network. The valid peer multiples here are **P/E (trailing and forward), P/tangible book (P/TBV), and return on tangible equity (ROTE)**. The EV columns in the report template are therefore omitted rather than filled with numbers that mean nothing for a bank.

**Anchors used verbatim from `01`.** Decision line **NYSE:NU · USD (Class A ordinary shares)**. Price **USD 14.30** (2026-08-28 close, pool-verified, stale by 5 exact trading sessions), with a fresher indicative quote of **USD 15.37** (2026-09-04 close, web-sourced, unverified, +7.48%). Shares for market cap 4,830,688,659; shares for per-share fair value 4,878,395 thousand fully diluted. Tangible book value per share **USD 2.50** (outstanding) / **USD 2.48** (fully diluted). Market cap USD 69,078.8m. Dividend yield **0.00% — no dividend has ever been paid**. No figure below departs from those anchors.

**Reporting basis.** IFRS as issued by the IASB, USD presentation currency, fiscal year ends 31 December `[FY2025 Form 20-F, cover page and Note 2]`. Every peer figure is Capital IQ's own USD translation at its stated spot rate `[Company Comparable Analysis Nu Holdings Ltd .xls → tab Trading Multiples, "Values converted at today's spot rate", As-Of Date 2026-08-29]`.

**Not used as evidence.** `data/NU/NU_Holdings_Deep_Dive_15_Page_Memo_30_Aug_2026.pdf` is a prior engine output carrying its own target price, exit multiples and scenario weights. Per the `00` triage caveat it is a §4 tier-9 user note; it was not read for, and did not inform, any number here.

---

## 1. Peer Set

**Where the set came from.** `business-model/08_competitive-map.md` is available and was read. It builds its peer list from NU's own annual filing, which names its competitors directly:

> "Our main competitors in the Brazilian consumer credit space include Itaú Unibanco S.A., Banco Bradesco S.A., Banco Santander (Brasil) S.A., Caixa Econômica Federal and Banco do Brasil S.A. In the Brazilian investment segment… Banco BTG Pactual S.A., Banco Inter S.A., Banco C6 S.A. and XP Inc. In the Brazilian payments space… MercadoPago Instituição de Pagamento Ltda., PicPay Instituição de Pagamento S.A., PagSeguro Digital Ltd. and StoneCo Ltd."
> `[FY2025 Form 20-F, Item 3.D Risk Factors, pp.107–108]`

The multiples set below is the ten-name comparable set inside the pool's own Capital IQ workbook `[Company Comparable Analysis Nu Holdings Ltd .xls → tab Trading Multiples, As-Of Date 2026-08-29]`. **The set is therefore NOT self-selected** — but it is also not identical to NU's own named list, and the two differences are stated rather than hidden.

| Peer | Ticker | Why Comparable | Source of Inclusion |
|---|---|---|---|
| Itaú Unibanco Holding S.A. | BOVESPA:ITUB4 | Brazilian consumer credit — NU's dominant business (91.4% of FY2025 Note-34 revenue is Brazil). Largest private incumbent, LTM revenue USD 27,593.8m = 3.3× NU | Named by NU `[FY2025 20-F, Item 3.D, pp.107–108]`; in CIQ comp set |
| Banco Bradesco S.A. | BOVESPA:BBDC4 | Brazilian mass-market retail — the incumbent whose customer base overlaps NU's target segment most directly. LTM revenue USD 17,909.9m = 2.1× NU | Named by NU `[FY2025 20-F, Item 3.D]`; in CIQ comp set |
| Banco do Brasil S.A. | BOVESPA:BBAS3 | Brazilian consumer credit at scale; state-controlled, so its multiple carries an owner discount NU does not | Named by NU `[FY2025 20-F, Item 3.D]`; in CIQ comp set |
| Banco Santander (Brasil) S.A. | BOVESPA:SANB11 | Brazilian consumer credit; LTM revenue USD 9,271.3m — the closest peer to NU on scale (USD 8,442.1m) | Named by NU `[FY2025 20-F, Item 3.D]`; in CIQ comp set |
| Banco BTG Pactual S.A. | BOVESPA:BPAC11 | Brazilian investment/wholesale-tilted bank; named by NU in the investment segment, not consumer credit — partial overlap only | Named by NU `[FY2025 20-F, Item 3.D]`; in CIQ comp set |
| Inter & Co, Inc. | NasdaqGS:INTR | The same branchless digital-bank model in Brazil at roughly one-seventh NU's revenue — the closest same-model rival | Named by NU as Banco Inter S.A. `[FY2025 20-F, Item 3.D]`; in CIQ comp set |
| PagSeguro Digital Ltd. | NYSE:PAGS | Brazilian payments plus a lending arm; the only comp-set member CIQ prices on a non-bank template (it is the sole source of the set's EV multiples) | Named by NU `[FY2025 20-F, Item 3.D]`; in CIQ comp set |
| Grupo Financiero Banorte, S.A.B. de C.V. | BMV:GFNORTE O | Mexican incumbent — NU's second market (7% of FY2025 Note-34 revenue; Mexican banking licence granted, began operating as a bank 6 Aug 2026) | Named by NU `[Capital IQ Competitors export, row sourced to "Nu Holdings Ltd. (NYSE:NU) 2026 Form 20-F"]`; in CIQ comp set |
| Grupo Cibest S.A. | BVC:CIBEST | Colombian incumbent (Bancolombia's holding company) — NU's third market, 1.7m customers at Dec-2025. Same end-market, but **NU does not name it** | Capital IQ relevancy score only — not in NU's filing and not in the CIQ Competitors export |
| Credicorp Ltd. | NYSE:BAP | Andean financial group. **Weakest inclusion in the set: Peru, where NU has no operations, and NU does not name it anywhere** | Capital IQ relevancy score only — not in NU's filing and not in the CIQ Competitors export |

**Two composition gaps, stated because they move the medians.**

1. **Two publicly-listed companies NU names itself are missing from the comp set: XP Inc. (NasdaqGS:XP) and StoneCo Ltd. (NasdaqGS:STNE)**, both sourced in the CIQ Competitors export to NU's own 2026 Form 20-F `[Capital IQ Competitors export, rows "XP Inc." and "StoneCo Ltd.", Company = Nu Holdings Ltd. (NYSE:NU), Entity = Self]`. Their multiples are not in this pool and were not imported, so the medians below exclude them. This is a named limitation, not an assumption that they would not move the answer.
2. **Two companies in the comp set are Capital IQ's additions, not NU's** — Grupo Cibest and Credicorp. Section 5 shows the sensitivity of the implied value to removing them.

**Private / unlisted competitors that cannot be compared — flagged, not guessed.** NU names four rivals with no public equity and therefore no multiple: **Caixa Econômica Federal** (state-owned, unlisted; LTM revenue USD 14,819.3m to 31 Mar 2026), **Banco C6 S.A.** (unlisted; USD 2,743.5m to 31 Dec 2024 — stale), **PicPay Instituição de Pagamento S.A.** (unlisted; USD 1,214.2m to 31 Dec 2022 — four years stale), and **Mercado Pago Instituição de Pagamento Ltda** (a MercadoLibre subsidiary; USD 512.1m to 31 Dec 2023 — stale) `[Capital IQ Competitors export, as-of Aug-2026]`. Caixa is the second-largest lender to Brazilian consumers by the filing's own account and its absence from any multiple median is a real hole in the peer picture. No multiple is estimated for any of them.

**No peer filing is in the data pool.** The pool is NU-only. Every peer figure below is a §4 tier-5 vendor export or a dated web read, labelled at each use. Resolution: add the 2Q26 results filings of ITUB4, BBDC4, BBAS3 and INTR so peer returns can be cited at tier 1–2.

---

## 2. Peer Multiples & Operating Stats

All figures from `[Company Comparable Analysis Nu Holdings Ltd .xls → tabs Trading Multiples, Operating Statistics and Financial Data, Capital IQ, USD, As-Of Date 2026-08-29]` — a §4 tier-5 vendor export, **data as of 2026-08-29 for every row**. LTM = last twelve months as filed (peer LTM income-statement filing dates run 21 Apr 2026 to 15 Aug 2026; NU's is 13 Aug 2026). NTM = next twelve months on Capital IQ consensus.

**Forward ROTE and P/TBV are my arithmetic on the vendor's own per-share cells**, computed identically for every company so the set is matched-basis: `forward ROTE = NTM EPS ÷ LTM tangible book value per share`; `P/TBV = day close price ÷ LTM tangible book value per share`. Both use the **same** current tangible book, so the identity `P/TBV = forward P/E × forward ROTE` holds exactly for every row — it is checked in §5.

| Company | LTM P/E | NTM P/E | P/TBV | Forward ROTE (derived) | LTM rev growth | LTM net income growth | NTM LT EPS growth | LTM net income margin | 5-yr beta | Data as-of |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| **Nu Holdings Ltd. (NYSE:NU)** | **19.5** | **14.76** | **5.7** | **38.8%** | **44.33%** | **56.83%** | **33.98%** | **42.73%** | **0.94** | 2026-08-29 |
| Banco Santander (Brasil) | 8.1 | 7.61 | 1.2 | 15.7% | 8.47% | 17.97% | n/a | 28.66% | 0.18 | 2026-08-29 |
| Grupo Fin. Banorte | 8.8 | 8.17 | 2.4 | 29.5% | 7.67% | 2.95% | 7.02% | 41.78% | 0.13 | 2026-08-29 |
| Banco BTG Pactual | 14.3 | 9.39 | 3.4 | 36.2% | 22.28% | 35.70% | 17.60% | 39.80% | 0.32 | 2026-08-29 |
| Banco Bradesco | 7.4 | 6.08 | 1.1 | 18.6% | 6.23% | 17.55% | 16.21% | 26.07% | 0.23 | 2026-08-29 |
| Banco do Brasil | 7.0 | 5.14 | 0.7 | 13.1% | −19.89% | −31.50% | 16.40% | 21.83% | 0.23 | 2026-08-29 |
| Itaú Unibanco | 9.3 | 8.16 | 2.3 | 27.5% | 6.63% | 9.30% | 9.76% | 32.58% | 0.16 | 2026-08-29 |
| Grupo Cibest | 10.6 | 7.84 | 2.3 | 29.1% | 16.67% | −33.08% | 12.06% | 17.57% | 0.44 | 2026-08-29 |
| PagSeguro Digital | 6.1 | 5.03 | 1.1 | 21.6% | 2.56% | −1.87% | 9.08% | 10.86% | 1.28 | 2026-08-29 |
| Inter & Co | 8.1 | 6.51 | 1.4 | 21.0% | 25.42% | 36.35% | 32.30% | 22.92% | 0.96 | 2026-08-29 |
| Credicorp | 13.6 | 11.97 | 3.0 | 24.6% | 13.70% | 17.93% | 13.17% | 33.10% | 0.86 | 2026-08-29 |
| **Peer median (n=10)** | **8.5** | **7.73** | **1.8** | **23.1%** | **8.07%** | **13.43%** | **13.17%** (n=9) | **27.37%** | **0.28** | 2026-08-29 |
| **Peer mean (n=10)** | **9.3** | **7.59** | **1.9** | **23.7%** | **8.97%** | **7.13%** | **14.84%** (n=9) | **27.52%** | **0.48** | 2026-08-29 |

**The medians are computed, not eyeballed.** Sorting the ten NTM P/E values (5.03, 5.14, 6.08, 6.51, 7.61, 7.84, 8.16, 8.17, 9.39, 11.97) gives a median of `(7.61 + 7.84) / 2 = 7.725`, which reproduces Capital IQ's own printed median of 7.73. The same check reproduces the vendor's LTM P/E median (8.5), P/TBV median (1.8), growth median (13.17%) and margin median (27.37%). My derived forward-ROTE median of 23.11% reconciles with the vendor's own medians through the identity: `7.73 × 23.11% = 1.787 ≈ 1.8`, the printed P/TBV median. Nothing in this table is a vendor number under a filing's name.

**Metrics deliberately not shown, with the reason:**
- **EV/EBITDA, EV/EBIT, EV/Sales** — invalid for a bank (Method Map). Capital IQ prints them for exactly one comp-set member, PagSeguro (0.7× / 1.4× / 1.7×), and then reports that single company's figure as the "median" of the whole set. **Any median built from one observation is not a median**, and §5 rejects the implied values Capital IQ derives from it.
- **FCF yield** — not meaningful here. NU's LTM cash from operations is **−USD 10,304.8m** because a growing bank's loan book and deposits run through operating cash flow `[ciq_facts.json, ltm_ocf_m, status present]`. That is not distress and it is not a free-cash-flow base.
- **Net debt / EBITDA** — the Capital IQ bank template has no EBITDA row at all `[ciq_facts.json, ltm_ebitda_m = unknown]`. `01` records equity/assets 16.0%, tangible common equity/assets 14.6%, Tier 1 13.4% and gross loans/deposits 88.8% as the leverage reads that actually describe this business; peer equivalents are not in the pool.
- **Dividend yield** — NU's is **0.00%**, no distribution has ever been declared `[01 §6A; FY2025 20-F, Item 3.D]`. Peer dividend data is not in this pool and was not imported.

**Two basis warnings that must travel with these numbers.**

1. **"Revenue" and "net income margin" are on Capital IQ's bank template, which is revenue *after* interest expense and loan-loss provisions.** All eleven companies sit on that same template, so the margins are matched-basis **against each other** — but they are not the filing's own revenue. On NU's own Note-34 base the FY2025 net margin was **23.8%** (net income USD 2,871.7m ÷ Note-34 revenue USD 12,083.8m), not 42.7% `[FY2025 20-F, Item 5; Note 34(b), p.F-97; carried from 08_competitive-map §2]`. The 42.73% figure may be compared to the 27.37% peer median and to nothing else.
2. **The betas are not measured on a common basis.** NU's 0.94 is a US-listed line against a US index; the Brazilian and Mexican peers' 0.13–0.44 are local lines against local indices `[08_competitive-map / 09_moat §3, which flags the same mismatch]`. NU is **not** three times riskier than Itaú on this evidence. The beta column is shown because the template asks for it and is not used to size anything below.

---

## 3. Premium / Discount to Peer Median

Formula, stated once: `premium/(discount) = (company multiple − peer median) / peer median`. Positive = premium (NU costs more per unit of the same thing). The denominator is the peer median, never NU's own multiple. **No yield metric appears in this table** — NU's dividend yield is zero and free-cash-flow yield is not meaningful for a bank — so the yield sign-inversion rule does not bite here. It is stated anyway so no downstream agent applies the price-multiple sign rule to a yield: for a yield, a figure *above* the peer median means **cheaper**, i.e. a discount.

| Multiple | NU | Peer Median | Premium / (Discount) |
|---|---:|---:|---:|
| **NTM forward P/E** (primary) | 14.76× | 7.73× | **+90.9%** |
| LTM P/E (diluted, before extraordinaries) | 19.5× | 8.5× | **+129.4%** |
| P/tangible book (current price ÷ LTM TBVPS) | 5.7× | 1.8× | **+216.7%** |
| *Driver: forward ROTE (NTM EPS ÷ LTM TBVPS)* | *38.8%* | *23.1%* | *+67.9%* |
| *Driver: NTM long-term EPS growth* | *33.98%* | *13.17%* | *+158.0%* |
| *Driver: LTM revenue growth* | *44.33%* | *8.07%* | *+449.3%* |
| *Driver: LTM net income margin (vendor bank basis)* | *42.73%* | *27.37%* | *+56.1%* |

At the fresher indicative quote of **USD 15.37** the same three price multiples become 15.85× NTM P/E (**+105.0%**), 21.0× LTM P/E (**+146.6%**) and 6.15× P/TBV (**+241.5%**). Every premium widens; the direction of the finding does not change.

**Arithmetic that matters for §5.** The P/TBV premium is not a third independent fact — it is the product of the other two: `1.909 (forward P/E premium factor) × 1.679 (forward ROTE premium factor) = 3.205`, i.e. +220%, which is the +216.7% P/TBV premium within rounding. So **NU's entire tangible-book premium decomposes cleanly into "the market pays more per dollar of forward earnings" times "NU earns more per dollar of tangible book."** Any adjustment applied to both multiples separately double-counts one of those two factors.

### Is the gap typical or unusual?

**Not assessable on the precise measure.** The pool contains **no peer multiple history** — the comps workbook is a single-date snapshot (As-Of 2026-08-29) with no historical peer medians, and no peer filing is in the pool `[00_valuation-data-triage §5, item 1]`. A three-year series of "NU's premium to the peer median" therefore cannot be computed from this evidence, and I have not invented one.

**What can be said, at a lower evidence tier and labelled as such.** Both legs of the gap moved in the *same* direction over the last six quarters, which means the premium narrowed:

- **NU's own leg fell hard.** NU's quarter-close P/TangBV ran **7.17 → 8.53 → 8.94 → 8.48 → 6.79 → 5.66 → 5.71** from Q1'25 to the 2026-08-28 close, and its P/NTM EPS ran **19.66 → 24.04 → 23.95 → 21.18 → 17.05 → 15.05 → 14.76** `[Nu Holdings Ltd NYSE NU Financials Multiples.xls → tab Multiples, quarterly Close row, 2025-03-31 to 2026-08-28]`. NU's tangible-book multiple is down **36%** from its Sep-2025 close and its forward P/E down **38%**.
- **The peer leg rose.** Itaú's price-to-book went from roughly 1.80 (Sep-2025) to about 1.98–2.00 (Jan-2026), and Bradesco's from a 2024 average of 0.75 to about 1.13 (Jan-2026) `[Web: macrotrends.net / gurufocus.com P/B history pages for ITUB and BBD, read 2026-09-06 — web-sourced, unverified, and on a **price-to-book** basis, not price-to-tangible-book]`.

Both legs point one way, so the honest statement is: **the premium is narrower than it was a year ago, and the narrowing came from both sides at once.** This is a directional read from two named peers on a mismatched basis (P/B against NU's P/TBV), not a measured peer-median gap series. It does not establish what NU's "typical" premium is, because there is no multi-year peer series and NU's own multiple series is only six quarters long — the company listed in December 2021 and the export goes no further back `[00_valuation-data-triage §6A]`. **The relative-gap-over-time check therefore stands as Not assessable on the required measure, with the directional read above offered at its own tier.**

---

## 4. Is the Gap Warranted?

**Partly — a large premium is warranted, and it is smaller than the one on offer at the forward-P/E level once the growth differential is given a finite life.**

NU earns more and grows faster than every listed name in the set, and by wide margins that are measured, not asserted: forward return on tangible equity **38.8% against a 23.1% peer median**, long-term EPS growth **33.98% against 13.17%**, LTM revenue growth **44.33% against 8.07%**, all on the identical Capital IQ basis as of 2026-08-29. `business-model/09_moat.md` grades the cost advantage **78/100** and measures it — about 85% lower cost to serve, 14,314 customers per employee against incumbents' 1,234, a Net Promoter Score of 64 against an incumbent average of 43 that delivers 71% of new Brazilian customers with no acquisition spend at a cost to acquire of USD 7.4 `[FY2025 20-F, Item 4.B; Item 5, p.157]`. A business with those numbers should not trade at 7.73× forward earnings and 1.8× tangible book. Charging NU the peer median unadjusted is the error Capital IQ's own workbook makes, and §5 rejects it.

**But three pieces of evidence cap how large the warranted premium is, and each is a limit on *durability*, not on the current level of returns.** First, the moat verdict is **Narrow, not Strong**, and durability is *explicitly discounted*: `07_business-quality` scores industry rate-of-change **38/100**, tripping the fast-changing-industry filter (CLAUDE.md §24, Filter 5), because Pix, open finance, the card price cap, the capital regime and the virtual-asset regime were each rewritten inside six years `[09_moat §5; 07_business-quality §4]`. Second, **the whole profitable record is three and a half years long and sits entirely inside one benign credit environment** — Brazilian unemployment fell from 6.2% to 5.1% across it, the book is 92% unsecured, and 90+ day non-performing loans were 6.9% at Q2'26 and rising 35bp in the quarter; `07_business-quality` states plainly that "30%+ ROE [is] a peak-of-favourable-conditions number, not a normalised one" `[FY2025 20-F, Item 5 macroeconomic indicators; Q2'26 deck, pp.13, 17; 07_business-quality §3]`. Third, **the growth is capital-constrained**: Tier 1 fell **16.2% → 14.4% → 13.4%** across FY2024, FY2025 and 30 Jun 2026 because 37% FX-neutral portfolio growth outruns even a ~31% return on equity `[FY2025 20-F capital-management note; Q2'26 Interim Report, Note 33(a), p.42]`, and the Brazilian card purchase-volume share gain has decelerated from +2.9pp and +2.3pp to **+0.3pp and +0.5pp** in the last two years `[FY2025 20-F, Item 5, p.164, per ABECS]`.

Two further asymmetries against NU, both cited: **regulatory dependence scores 20/100** — the price of 38% of revenue is capped by Law 14,690/2023, interchange is capped at 0.7%/0.5% by BCB Res. 246, and one rule change cut a product's originations "by about 50% to 60%" `[07_business-quality §1; Q4 2025 earnings call, 25 Feb 2026]` — and **91% of revenue is a single country**, against peers that are either diversified (Credicorp, Banorte, Cibest) or state-backed (Banco do Brasil, whose 0.7× tangible book is partly an owner discount NU does not carry).

**Conclusion: the premium is warranted in kind but not proven in size.** A premium to the peer median is clearly deserved on returns and growth. What the evidence does *not* establish is how many years the growth differential survives — and that is the entire question, because §5 shows the answer moves the implied value by USD 5 a share across a three-to-five-year window the evidence bounds but cannot resolve. At USD 14.30 the market is paying for roughly **3.8 years** of the current differential; at USD 15.37, roughly **4.3 years**. Both sit inside the window. So the honest verdict is: **premium is warranted, but the current price sits at the upper half of what the peer evidence supports, and the case for it rests on a growth runway that three and a half years of data cannot yet prove.**

---

## 5. Implied Value from Peer Multiples

**Basis discipline.** Every application below is like-for-like: a **forward (NTM)** peer multiple applied to NU's **forward (NTM)** metric, a **trailing (LTM)** peer multiple to NU's **trailing (LTM)** metric, a **current** P/TBV to **current** tangible book. NU's NTM EPS is **USD 0.97** and LTM diluted EPS **USD 0.734** `[Company Comparable Analysis → Financial Data; Nu Holdings Ltd NYSE NU Financials Key Stats.xls → tab Key Stats]`; tangible book value per share is **USD 2.50** on the outstanding count `[01 §6]`. Per-share implied values divide by the fully diluted count of 4,878,395 thousand where an equity value is built; where a multiple is applied directly to a per-share metric the result is already per-share, and the dilution effect is 0.99% (USD ~0.15 at these levels) — stated, not buried.

### How the warranted multiple was built

**Primary multiple: NTM forward P/E.** It is the Method Map's primary multiple for a Financial, all ten peers carry it, and it is on the same forward basis as NU's own.

**Sizing method — the growth differential, given a finite life.** Two banks with the same discount rate and the same terminal multiple at year N differ in today's forward P/E by exactly the compounded ratio of their earnings growth over those N years:

`warranted P/E(NU) = peer median P/E × [(1 + g_NU) / (1 + g_peer)]^N`
`= 7.73 × [(1.3398) / (1.1317)]^N = 7.73 × 1.18388^N`

with `g_NU = 33.98%` and `g_peer = 13.17%`, both the Capital IQ NTM long-term EPS growth rates as of 2026-08-29. This charges the premium to **growth**, which is not in the P/E denominator — and deliberately **not** to NU's higher return on tangible equity, which already is (see the double-count ledger below).

| N (years the differential survives) | Warranted NTM P/E | Implied price/share | vs USD 14.30 | vs USD 15.37 |
|---:|---:|---:|---:|---:|
| 3 | 12.83× | **USD 12.44** | −13.0% | −19.1% |
| **4 (base)** | **15.18×** | **USD 14.73** | **+3.0%** | **−4.2%** |
| 5 | 17.97× | **USD 17.44** | +22.0% | +13.5% |

**Why the base is N = 4 and why the window is 3 to 5.** The lower bound is three years because that is the length of NU's entire profitable record (FY2023 to H1'26) and the period over which the moat module says the advantage is actually evidenced; the upper bound is five because the consensus strip carries the growth that far and beyond `[Capital IQ Estimates → Consensus and Multiples tabs, FY2026E–FY2033E]`. The evidence **bounds** the window and does not resolve a point inside it — the durability discount (Filter 5), the three-and-a-half-year record, the decelerating card-share gain and the falling Tier 1 ratio all argue for the short end; the measured 78/100 cost advantage, the Mexican banking licence (operating since 6 Aug 2026) and Colombia growing from 0.8m to 1.7m customers in two years argue for the long end. Taking the midpoint of a window I cannot narrow is the honest choice, and **the inability to narrow it is itself the reason this method's confidence is capped** rather than a detail to bury.

**What the current price implies, solved directly.** At USD 14.30 the forward P/E is 14.76×; `ln(14.76 / 7.73) ÷ ln(1.18388) = 3.83 years`. At USD 15.37 the forward P/E is 15.85× and the answer is **4.25 years**. This is the single most useful, testable number in this module: **the market is paying for roughly four years of NU's current growth differential over its peers, and no more.**

### Implied values across the valid multiples

| Multiple | Applied peer multiple | NU metric (same basis) | Implied price/share | vs USD 14.30 | vs USD 15.37 |
|---|---:|---|---:|---:|---:|
| **NTM forward P/E — warranted, N=4 (BASE)** | **15.18×** | NTM EPS USD 0.97 | **USD 14.73** | **+3.0%** | **−4.2%** |
| NTM forward P/E — warranted, N=3 | 12.83× | NTM EPS USD 0.97 | USD 12.44 | −13.0% | −19.1% |
| NTM forward P/E — warranted, N=5 | 17.97× | NTM EPS USD 0.97 | USD 17.44 | +22.0% | +13.5% |
| P/tangible book — warranted (restated from the base, see ledger) | 5.89× | TBVPS USD 2.50 | USD 14.73 | +3.0% | −4.2% |
| *Sensitivity: base on the 8 NU-named peers only* | *12.47×* | *NTM EPS USD 0.97* | *USD 12.10* | *−15.4%* | *−21.3%* |
| *Sensitivity: base ex-Credicorp (9 peers)* | *14.45×* | *NTM EPS USD 0.97* | *USD 14.02* | *−2.0%* | *−8.8%* |
| **Rejected — NTM P/E at peer parity** | 7.73× | NTM EPS USD 0.97 | USD 7.50 | −47.6% | −51.2% |
| **Rejected — LTM P/E at peer parity** | 8.5× | LTM diluted EPS USD 0.734 | USD 6.24 | −56.4% | −59.4% |
| **Rejected — P/TBV at peer parity** | 1.807× | TBVPS USD 2.50 | USD 4.52 | −68.4% | −70.6% |
| **Rejected — Capital IQ's own EV-based reads** | 0.7× LTM EV/Rev; 0.6× NTM EV/Rev | LTM rev 8,442.1m; NTM rev 25,401.3m | USD 3.10 / USD 5.07 | — | — |

**Base-case point: USD 14.73 per share** — the warranted peer forward P/E of 15.18× applied to NU's NTM EPS of USD 0.97.
**Dispersion across the peer-multiple constructions: USD 12.10 – USD 17.44.** The spread is 44% of the low, so **MODULE_RULES Reconciliation Gate 6 is live for this method taken alone** and its confidence is capped accordingly.

**Why the four "rejected" rows are rejected, by name.** The peer-parity rows apply the peer median unadjusted, which asserts that NU's 38.8% forward return on tangible book and 34% growth are worth nothing. The P/TBV parity row (USD 4.52) is the worst of them and it is **Capital IQ's own published output** `[Company Comparable Analysis → tab Implied Valuation, "= Implied Price per Share", Median column]`: applying a return-blind multiple to a company whose entire advantage is its return on that book charges NU for having a *small* book relative to its earnings — the exact mirror of a margin double-count. It implies a forward P/E of `4.52 ÷ 0.97 = 4.66×`, which is below every company in the comp set. The two EV-based rows are invalid by business type twice over: EV multiples do not apply to a bank, and Capital IQ's "median" for them is a single observation (PagSeguro), not a median at all.

### Quality-adjustment ledger (DOUBLE-COUNT TEST gate)

| Multiple adjusted | Peer median | Adjusted to | Gap already in the denominator? | What the extra adjustment pays for | How it was sized |
|---|---:|---:|---|---|---|
| **NTM forward P/E** | 7.73× | **15.18×** | **YES** — the denominator is NU's own forward EPS, which already carries its higher return on tangible equity (38.8% vs a 23.1% peer median) and its higher net income margin (42.7% vs 27.4%). Those gaps are paid for once, by the metric | **Growth only** — four years of the evidenced forward EPS growth differential (NU 33.98% vs peer median 13.17% NTM long-term EPS growth) before convergence to the peer multiple. **Not** the return gap, **not** the margin gap | `7.73 × [(1.3398)/(1.1317)]^4 = 7.73 × 1.9641 = 15.18×`. The window N = 3–5 is bounded by the three-and-a-half-year profitable record at the low end and the consensus strip at the high end |
| **P/tangible book** | 1.807× | **5.89×** | **NO** — tangible book is return-blind. A book-based multiple carries no information about what NU earns on that book, so a premium sized off the return gap is legitimate here and only here | NU's forward return on tangible equity of 38.8% against the 23.1% peer median, **plus** the same growth differential | **By the identity, not independently:** `warranted P/TBV = warranted forward P/E × forward ROTE = 15.18 × 0.388 = 5.89×`. **This is the P/E result restated in book terms, not a second read** — see the independence note below |

**The test, applied out loud.** The failure mode this gate exists to catch is applying a peer multiple to the company's own weaker metric and then haircutting the multiple as well for the same weakness. NU is the mirror case: its metric is *stronger* than peers', so the risk here is the opposite — **charging the return gap twice on the upside**. If I had taken the peer forward P/E, marked it up for growth AND marked it up again for the 68% ROTE advantage, I would have double-counted, because the ROTE advantage is precisely what makes NU's EPS large relative to its book and is therefore already inside the P/E denominator. It is not. The forward-P/E premium is sized by growth alone; the return advantage enters exactly once, on the P/TBV line, where the denominator is blind to it. No adjustment anywhere in this module is derived as `own margin ÷ peer margin` or as `own ROTE ÷ peer ROTE` applied to an earnings multiple.

**Independence note (CLAUDE.md §16).** The P/TBV implied value of USD 14.73 is **the same number as the P/E implied value, by construction**, because `P/TBV ≡ P/E × ROTE` on a common tangible-book base. It is a consistency check on the arithmetic, **not** a second corroborating method, and `07` must not weight it as one. There is exactly one peer-anchored value in this module, and it is USD 14.73.

### Financial cross-check (required for a bank)

Same forward period throughout: NTM EPS USD 0.97 and current tangible book value per share USD 2.50, so `forward ROTE = 0.97 / 2.50 = 38.80%` in every row. Identity: `P/TBV = forward P/E × forward ROTE`.

| Case / implied value | TBVPS (current, USD) | P/TBV | Forward EPS (NTM, USD) | Implied forward P/E | Forward ROTE | Identity check |
|---|---:|---:|---:|---:|---:|---|
| **Base — warranted N=4: USD 14.73** | 2.50 | **5.89×** | 0.97 | **15.18×** | 38.80% | 15.18 × 0.3880 = 5.89 ✓ |
| Low — warranted N=3: USD 12.44 | 2.50 | 4.98× | 0.97 | 12.83× | 38.80% | 12.83 × 0.3880 = 4.98 ✓ |
| High — warranted N=5: USD 17.44 | 2.50 | 6.98× | 0.97 | 17.97× | 38.80% | 17.97 × 0.3880 = 6.97 ✓ |
| NU-named-8 sensitivity: USD 12.10 | 2.50 | 4.84× | 0.97 | 12.47× | 38.80% | 12.47 × 0.3880 = 4.84 ✓ |
| Memo — current price USD 14.30 | 2.50 | 5.72× | 0.97 | 14.76× | 38.80% | 14.76 × 0.3880 = 5.73 ✓ |
| Memo — indicative price USD 15.37 | 2.50 | 6.15× | 0.97 | 15.85× | 38.80% | 15.85 × 0.3880 = 6.15 ✓ |
| Memo — peer median | 4.73 (median) | 1.79× | — | 7.73× | 23.11% | 7.73 × 0.2311 = 1.79 ✓ |
| Rejected — CIQ P/TBV parity: USD 4.52 | 2.50 | 1.81× | 0.97 | **4.66×** | 38.80% | 4.66 × 0.3880 = 1.81 ✓ — arithmetically consistent and economically absurd |

The identity reconciles in every row within rounding.

**The peer-set maximum is not a ceiling, and the base deliberately exceeds it.** The highest P/TBV in the comp set is 3.4× (BTG Pactual) and the highest forward P/E is 11.97× (Credicorp). The base case sits above both, on evidence rather than by construction: NU's forward return on tangible equity of 38.8% is **above the highest peer** (BTG Pactual, 36.2%) and its long-term EPS growth of 33.98% is **above the highest peer** (Inter & Co, 32.30%). A company that leads the set on both of the two variables that set a bank's multiple cannot be capped at the set's maximum without a separately evidenced economic ceiling, and none exists in this pool. What DOES limit the base is the durability window in the ledger — the number of years the differential survives — not the peer high.

### The cross-check that disagrees, stated rather than averaged away

A second peer-anchored route, built on the cost of capital the peer group itself prices at, lands materially lower and is reported here because MODULE_RULES requires cross-method disagreement to be reconciled or the confidence capped, never split silently.

The peer median trades at 1.787× tangible book on a 23.11% forward return on tangible equity, with peer USD revenue growth of ~8%. Inverting the perpetuity relation `P/TBV = (ROTE − g) / (k − g)` gives an implied cost of equity of `k = 0.08 + (0.2311 − 0.08)/1.787 = 16.5%`. That figure is **independently corroborated from NU's own filings**: `09_moat §3` records the company's disclosed Brazilian cost of equity as **16.51%**. Applying the same relation to NU with a terminal return on tangible equity of 25% (above the 23.1% peer median, reflecting the measured cost advantage, below the current 30–39% that upstream calls a peak-of-favourable-conditions number) and terminal growth of 10% gives a warranted terminal P/TBV of `(0.25 − 0.10)/(0.165 − 0.10) = 2.31×`. Rolled forward on the consensus tangible-book path (FY2028E book value per share of 5.23 less USD 0.24 per share of goodwill and intangibles ≈ 4.99 tangible) and discounted back at 16.5%, that route produces roughly **USD 7 – 9 per share**.

**The two peer-anchored routes disagree by roughly 2×, and the reason is identifiable.** The growth-differential route implicitly holds NU's return on tangible equity near its current level for four years — because it grows EPS at 34% off an unchanged book base. Consensus itself does not model that: the Capital IQ strip implies return on book essentially flat at **26.9% (FY2026E), 26.9% (FY2027E), 27.9% (FY2028E)**, not 35%+ `[Capital IQ Estimates → Multiples tab, P/E and P/BV by fiscal year, and Consensus tab EPS]`. So the base case above is the **generous** of the two peer-anchored reads. I am not averaging them, and I am not moving the base point: the base is the peer-multiple method this module owns, the excess-return route is a model that properly belongs to `04_intrinsic-dcf`, and the gap between them is handed to `07` as the single largest uncertainty in the relative read. **`07` should treat USD 7–9 as an evidenced downside marker from a peer-anchored discount rate, not as noise.**

---

## 6. Sector Cycle Reality Test

The peer median in §2 is a snapshot dated 2026-08-29, not a stable "normal" level, and **the sector it is drawn from has re-rated upward materially over the reference window**. The pool contains no sector-level or peer-level multiple history `[00_valuation-data-triage §5]`, so the check was run on a web-sourced proxy: the price-to-book history of the two largest peers in the set, Itaú Unibanco and Banco Bradesco. Itaú's price-to-book ran roughly **0.90–1.05 across 2021–2022 and 1.08–1.40 across 2023, against about 1.98–2.00 in early 2026** — up roughly **60% versus its 2023 level** and roughly **90–100% versus 2021–22**. Bradesco's ran **0.77 (2023 average) and 0.75 (2024 average) against about 1.13 in early 2026** — up roughly **47%** versus 2023, though still below its 2021 level of about 1.42 `[Web: macrotrends.net "Banco Bradesco SA Price to Book Ratio" and gurufocus.com / ycharts.com "ITUB PB Ratio" history pages, both read 2026-09-06 — web-sourced, unverified]`. Over the **three-year** window both proxies are more than 25% above their own level, in the **same upward direction** as this stock's premium finding, which is the MODULE_RULES trigger. Over the **five-year** window the two disagree (Itaú up, Bradesco down), and that disagreement is stated rather than resolved in the flag's favour. Three limitations travel with this: the proxy is two named peers rather than a sector index or the full peer-group aggregate; it is on a **price-to-book** basis while §2 uses **price-to-tangible-book**; and it is web-sourced, so it sits at §4 tier 10 against the tier-5 comps workbook. **The peer-median anchor is therefore flagged cycle-elevated and this method's confidence contribution is capped at 60 per the Score Cap Rules.** Being at a 91% premium to a peer median that has itself re-rated ~50–60% in three years is a different statement from being at a 91% premium to a settled level.

RF-VAL-001: peer-median anchor cycle-elevated — Brazilian bank proxy (ITUB price/book ~1.08–1.40 in 2023 → ~1.98 in early 2026, +60%; BBDC ~0.77 in 2023 → ~1.13 in early 2026, +47%), web-sourced macrotrends/gurufocus/ycharts P/B history read 2026-09-06, unverified

**Note for `99` on the compounding rule.** `02_multiples-own-history` is expected to report **"Not assessable"** on this same check, because its own reference window is only six quarters (2025-03-31 to 2026-08-28) and no sector history sits in the pool `[00_valuation-data-triage §5, item 1]`. If `02` instead flags its band, the direction will be **opposite** to this one — NU's own P/TangBV close fell from 8.94 to 5.71 over that window while the peer proxies rose — so `02` will likely read "below its own recent band" while `03` reads "premium to a peer group that has itself re-rated." **Those are not two agreeing methods and the compounding cap should not be applied mechanically on the assumption that they are.** They are one company de-rating inside a sector that re-rated, and `99` should say so. Worth stating plainly: `02`'s entire six-quarter window sits *inside* the sector's up-move documented above, so a "cheap versus its own history" read from `02` would be anchored on a window that never contained a normal level — that is a coincidence for `99` to explain, not corroboration for either side.

---

## 7. Relative Read

**NU trades at a 90.9% premium to the peer median on forward earnings (14.76× against 7.73×) and a 216.7% premium on tangible book (5.7× against 1.8×), and a large premium is warranted — it out-earns and out-grows every listed name in the set, at a 38.8% forward return on tangible equity against a 23.1% median and 34% long-term EPS growth against 13%.** The peer-multiple method puts the base-case value at **USD 14.73 per share** (the warranted forward P/E of 15.18× × NTM EPS of USD 0.97), with dispersion of **USD 12.10 – USD 17.44** across the peer-set and durability constructions — essentially level with the pool anchor of USD 14.30 (+3.0%) and 4.2% below the fresher indicative quote of USD 15.37. **The entire result turns on one unresolved number: how many years NU's growth differential survives. The market is paying for about 3.8 years at USD 14.30 and 4.3 years at USD 15.37, and three and a half years of profitable history cannot settle whether that is right.**

Two warnings for `07`, neither of which should be smoothed away. First, **the peer-median anchor is flagged cycle-elevated (§6)**: the Brazilian bank proxy re-rated roughly 47–60% over three years, so being priced at a premium to this median is not the same as being fairly valued against a settled level — and `02`'s own-history band, if it reads NU as below its recent range, is measured inside that same sector up-move and is a coincidence to explain, not independent corroboration. Second, **a second peer-anchored route — the excess-return relation run at the ~16.5% cost of equity the peer group itself prices at, which independently matches NU's own disclosed 16.51% Brazilian cost of equity — supports roughly USD 7 – 9 per share**, about half the base. That gap is not averaged out here; it is handed forward as the largest single uncertainty in the relative read, and it is why this method's confidence contribution is capped.
