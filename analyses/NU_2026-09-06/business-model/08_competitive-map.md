# Competitive Map — NU

**Upstream inputs read:** `02_business-identity.md` and `03_segment-map.md` (both present; also read `00_data-triage.md` and `05_customer-geography.md` for regime and geography). Nothing is missing.

**Regime, standard, currency (carried from triage `00`):** US SEC foreign private issuer — the annual filing is Form 20-F, not a 10-K. IFRS as issued by the IASB. Reporting currency US dollars. Fiscal year ends 31 December. Peers are Brazilian and Mexican issuers reporting in BRL / MXN under IFRS or local bank rules; every cross-currency peer figure below carries its source and basis.

**Not used as evidence:** `data/NU/NU_Holdings_Deep_Dive_15_Page_Memo_30_Aug_2026.pdf` is a prior engine output carrying its own verdict — a §4 tier-9 user note. It was not read for and did not inform any conclusion here.

---

## 1. Dominant Segment

Nu reports **one** operating and reportable segment — Banking, meaning the whole Group, 100% of revenue and 100% of profit `[FY25 Form 20-F, Note 34, p.F-97]`. Inside that single segment the only quantified split is geographic, and **Brazil is 91.4% of the Note-34 revenue base in FY2025 and 90.9% in H1 FY2026** `[FY25 Form 20-F, Note 34(b), p.F-97; Q2 FY26 Interim Report (14 Aug 2026), Note 34(b), p.43]`. On product, interest on credit cards and personal loans was 77.6% of that base in FY2025 and 80.3% in H1'26 `[FY25 Form 20-F, Note 6, pp.F-30–F-31; Q2 FY26 Interim Report, Note 6, p.16]`.

**So the peer set that matters is Brazilian consumer credit — credit cards and unsecured personal lending — with Mexico and Colombia as the growth markets, not the anchor.** Carrying the upstream qualifier intact: profit by country is **not disclosed at all**, so this dominance read rests on revenue, and roughly a fifth to a quarter of group income (treasury income) sits outside the geographic table entirely.

---

## 2. Named Competitors

**How the list was built.** Nu names its own competitors, by segment, in the Risk Factors of its annual filing:

> "Our main competitors in the Brazilian consumer credit space include Itaú Unibanco S.A., Banco Bradesco S.A., Banco Santander (Brasil) S.A., Caixa Econômica Federal and Banco do Brasil S.A. In the Brazilian investment segment… Banco BTG Pactual S.A., Banco Inter S.A., Banco C6 S.A. and XP Inc. In the Brazilian payments space… MercadoPago Instituição de Pagamento Ltda., PicPay Instituição de Pagamento S.A., PagSeguro Digital Ltd. and StoneCo Ltd., among others."
> `[FY25 Form 20-F, Item 3.D Risk Factors — "Substantial and increasingly intense competition within our industry may harm our business…", pp.107–108]`

The three profiled below are the ones that compete in the **dominant** space (Brazilian consumer credit), are of comparable scale or are the closest same-model rival, and carry public profitability so the `moat` agent has a real anchor. Nothing here is invented.

**A definition warning the `moat` agent must carry.** Every peer margin below is computed on the **Capital IQ bank template's "LTM Total Revenue"**, which for a bank is revenue *after* interest expense and loan-loss provisions. Upstream established this for Nu itself: CIQ shows FY2025 Total Revenue of US$6,991.2m where the 20-F's Note-34 base is US$12,083.8m `[03_segment-map.md §1a; Capital IQ Financials → Income Statement export (NU) — vendor export]`. All eleven companies in the comps workbook sit on that same template, so the margins are **matched-basis against each other** — but they are **not** comparable to the 20-F's own revenue line. On the filing's own base, Nu's FY2025 net margin was 23.8% (net income US$2,871.7m ÷ Note-34 revenue US$12,083.8m), not 42.7% `[FY25 Form 20-F, Item 5; Note 34(b), p.F-97]`.

---

### Competitor A — Itaú Unibanco Holding S.A.

- **Ticker / listing:** BOVESPA:ITUB4 (São Paulo); ADR NYSE:ITUB. Reports in Brazilian reais.
- **Where they compete:** Brazilian consumer credit — the dominant segment — plus cards, deposits, investments and wholesale banking. Brazil-wide, branch-based, all income tiers. Named by Nu in both the consumer-credit and (through subsidiaries) investment lists.
- **Scale:** LTM total revenue **US$27,593.8m** (CIQ bank basis), LTM income-statement filing date 5 Aug 2026 — **3.3× Nu's US$8,442.1m** on the identical basis `[Capital IQ Comps → Financial Data (Nu Holdings comp set), as-of 2026-08-29, USD — vendor export]`. Total credit portfolio R$1.5 trillion at 2Q26 `[Itaú Unibanco 2Q26 results press release, SEC Form 6-K, filed Aug 2026 — peer filing, read via web, not in this data pool]`.
- **Profitability / return on capital:** LTM **net income margin 32.58%** `[Capital IQ Comps → Operating Statistics, as-of 2026-08-29 — vendor export]`. Return on tangible book **24.3%**, my arithmetic on the vendor's own per-share figures (LTM diluted EPS US$0.81 ÷ LTM tangible book value per share US$3.34) `[Capital IQ Comps → Financial Data, as-of 2026-08-29 — vendor export; arithmetic mine]`. Cross-check from the company's own disclosure: **recurring managerial ROE 24.3% annualised in 2Q26**, 24.5% for 1H26, on recurring managerial profit of R$12.4bn in the quarter `[Itaú Unibanco 2Q26 results press release, SEC Form 6-K, filed Aug 2026 — read via web, dated, peer filing not in this pool]`. Two different measures (LTM return on tangible book vs quarterly recurring managerial ROE on average equity) landing on the same number is corroboration, not one figure counted twice. CET1 12.3% at 2Q26; 90-day NPL 1.9% for a sixth straight quarter `[same 6-K]`.
- **Source named in:** Nu's own annual filing `[FY25 Form 20-F, Item 3.D Risk Factors, pp.107–108]`; also in the CIQ competitor export, named there by third parties `[Capital IQ Competitors export (NU), as-of Aug-2026 — vendor export; rows sourced to PicS N.V. 2026 Form 20-F and Inter & Co 2026 Form 20-F]`.
- **One-line read:** The largest private incumbent and the benchmark the market actually measures Nu against — on the Q2'26 call a JPMorgan analyst put Nu's >US$1bn quarterly net income directly against Itaú's retail operation at "around $1.1 billion" `[Q2 FY26 earnings call transcript, 13 Aug 2026, Q&A]`.

### Competitor B — Banco Bradesco S.A.

- **Ticker / listing:** BOVESPA:BBDC4 (São Paulo); ADR NYSE:BBD. Reports in Brazilian reais.
- **Where they compete:** Brazilian mass-market and mid-market retail banking — current accounts, credit cards, payroll and personal loans — plus a large insurance arm. Brazil-wide and branch-heavy. This is the incumbent whose customer base overlaps Nu's target segment most directly.
- **Scale:** LTM total revenue **US$17,909.9m** (CIQ bank basis), filing date 5 Aug 2026 — **2.1× Nu** `[Capital IQ Comps → Financial Data, as-of 2026-08-29 — vendor export]`. Expanded loan book R$1.137 trillion, total assets R$2.5 trillion at 2Q26 `[Bradesco 2Q26 results presentation, Aug 2026, as summarised by Investing.com, 2026 — web source, dated, unverified]`.
- **Profitability / return on capital:** LTM **net income margin 26.07%** `[Capital IQ Comps → Operating Statistics, as-of 2026-08-29 — vendor export]`. Return on tangible book **15.2%** (US$0.44 EPS ÷ US$2.90 tangible book per share) `[Capital IQ Comps → Financial Data — vendor export; arithmetic mine]`. Company-reported cross-check: **ROAE 16.2% in 2Q26** on recurring net income of R$7.1bn, up 16.2% year on year `[Bradesco 2Q26 results presentation, Aug 2026, via Investing.com — web source, dated, unverified]`. The two reads differ by 1.0 percentage point, which is what you expect between an LTM tangible-book measure and a quarterly average-equity measure; neither is a Nu filing and both are stated at their own tier.
- **Source named in:** `[FY25 Form 20-F, Item 3.D Risk Factors, pp.107–108]`; also in the CIQ competitor export against Nu Pagamentos, named by Inter & Co and PicS in their own 20-Fs `[Capital IQ Competitors export (NU), as-of Aug-2026 — vendor export]`.
- **One-line read:** Roughly twice Nu's revenue and roughly half its return on tangible book — the clearest single illustration of the cost gap Nu says it is exploiting.

### Competitor C — Inter & Co, Inc.

- **Ticker / listing:** NasdaqGS:INTR (also B3 BDR). Brazilian digital bank, US-listed, reports in Brazilian reais.
- **Where they compete:** Brazil, digital-only retail banking — the same branchless model as Nu, across accounts, cards, credit and investments, plus a US business. Named by Nu in the *investment* list rather than the consumer-credit list, so the overlap with the dominant segment is real but partial `[FY25 Form 20-F, Item 3.D Risk Factors, pp.107–108]`.
- **Scale:** LTM total revenue **US$1,279.1m** (CIQ bank basis), filing date 5 Aug 2026 — about **one-seventh of Nu's US$8,442.1m** `[Capital IQ Comps → Financial Data, as-of 2026-08-29 — vendor export]`. Total assets passed R$100bn for the first time in 2Q26 `[Inter & Co 2Q26 results, SEC Form 6-K, Aug 2026 — peer filing, read via web, not in this pool]`. **Vendor conflict flagged:** the CIQ Competitors export lists Inter's LTM revenue as US$158.6m for the same 30 Jun 2026 date `[Capital IQ Competitors export (NU) — vendor export]`. That cannot be reconciled with a 22.9% net margin and R$421m of quarterly profit; the comps workbook figure of US$1,279.1m is the one that ties, and it is the one used. Do not use the US$158.6m.
- **Profitability / return on capital:** LTM **net income margin 22.92%** `[Capital IQ Comps → Operating Statistics, as-of 2026-08-29 — vendor export]`. Return on tangible book **16.7%** (US$0.66 EPS ÷ US$3.95 tangible book per share) `[Capital IQ Comps → Financial Data — vendor export; arithmetic mine]`. Company-reported cross-check: **ROE 16.3% in 2Q26**, record net income of R$421m (about US$81m), up 34% year on year, net revenue +32% `[Inter & Co 2Q26 results, SEC Form 6-K / press release, Aug 2026 — read via web, dated, peer filing not in this pool]`.
- **Source named in:** `[FY25 Form 20-F, Item 3.D Risk Factors, pp.107–108]` (as Banco Inter S.A.); and three separate rows of the CIQ competitor export, one of them sourced to Nu's own 2026 Form 20-F `[Capital IQ Competitors export (NU), as-of Aug-2026 — vendor export]`.
- **One-line read:** The same branchless model at one-seventh the size and roughly half the return on tangible book — evidence that the digital format alone is not what produces Nu's returns.

### Also named in the dominant segment, profiled in brief

Kept short because they are either state-controlled, unlisted, or compete mainly outside Brazilian consumer credit. All are named in Nu's own filing at the citation above. Margins and returns on the same matched CIQ basis, with return on tangible book my arithmetic on the vendor's EPS ÷ tangible book per share.

| Competitor | Listing | LTM revenue (US$m, CIQ bank basis) | LTM net income margin | Return on tangible book (derived) |
|---|---|---:|---:|---:|
| Banco Santander (Brasil) S.A. | BOVESPA:SANB11 | 9,271.3 | 28.66% | 14.7% (0.71 ÷ 4.83) |
| Banco do Brasil S.A. (state-controlled) | BOVESPA:BBAS3 | 14,406.0 | 21.83% | 9.6% (0.55 ÷ 5.71) |
| Banco BTG Pactual S.A. | BOVESPA:BPAC11 | 8,780.8 | 39.80% | 23.7% (0.72 ÷ 3.04) |
| Caixa Econômica Federal (state-owned, unlisted) | — | 14,819.3 (to 31 Mar 2026) | **Not public / not disclosed** | **Not public / not disclosed** |
| Banco C6 S.A. (unlisted) | — | 2,743.5 (to 31 Dec 2024) | **Not public / not disclosed** | **Not public / not disclosed** |
| PicPay Instituição de Pagamento S.A. (unlisted) | — | 1,214.2 (to 31 Dec 2022 — stale) | **Not public / not disclosed** | **Not public / not disclosed** |
| Mercado Pago Instituição de Pagamento Ltda (subsidiary of MELI) | — | 512.1 (to 31 Dec 2023 — stale) | **Not public / not disclosed** | **Not public / not disclosed** |

Sources: revenue, margin and per-share figures `[Capital IQ Comps → Financial Data and Operating Statistics (Nu Holdings comp set), as-of 2026-08-29, USD — vendor export]`; Caixa, C6, PicPay and Mercado Pago revenue and their LTM dates `[Capital IQ Competitors export (NU), as-of Aug-2026 — vendor export]`. Note the LTM dates: the C6, PicPay and Mercado Pago figures are one to four years old and must not be treated as current.

**For the `moat` agent, the comparison line, all on the identical CIQ bank basis as of 29 Aug 2026:**

| | Nu Holdings | Itaú | Bradesco | Inter & Co | Peer median (comp set of 10) |
|---|---:|---:|---:|---:|---:|
| LTM total revenue (US$m) | 8,442.1 | 27,593.8 | 17,909.9 | 1,279.1 | 8,532.3 |
| LTM net income margin | **42.73%** | 32.58% | 26.07% | 22.92% | 27.37% |
| Return on tangible book (derived) | **29.2%** | 24.3% | 15.2% | 16.7% | — |
| LTM revenue growth, 1 yr | **44.33%** | 6.63% | 6.23% | 25.42% | 8.07% |

`[Capital IQ Comps → Financial Data and Operating Statistics, as-of 2026-08-29, USD — vendor export; return on tangible book is my arithmetic on the vendor's EPS ÷ tangible book per share]`. Nu's own disclosed figure is **ROE 33% in Q2'26**, described by the CFO as a record `[Q2 FY26 earnings call transcript, 13 Aug 2026, CFO prepared remarks]` — higher than the 29.2% derived here because it is a quarterly annualised return on total equity, not an LTM return on tangible book. Use one basis or the other, not both.

---

## 3. Competitive Position

**Gaining share — but the rate of gain has slowed sharply, and that qualifier travels with the verdict.** Nu's share of Brazilian credit card purchase volume ran **8.7% (2021) → 11.6% (2022) → 13.9% (2023) → 14.2% (2024) → 14.7% (2025)**, per the card-industry association ABECS `[FY25 Form 20-F, Item 5 — "Rapid growth of our consumer credit business and associated credit loss provisioning", p.164]`. Read the increments, not the level: +2.9pp, +2.3pp, then **+0.3pp and +0.5pp**. The direction is up; the pace in the last two years is roughly a fifth of what it was in the first two. A separate ABECS read puts Nu at **16% of total card transaction volumes in Q4'25** `[FY25 Form 20-F, Item 4.B — Cards, p.46]`.

Two supporting reads, both pointing the same way. First, category share: digital banks' share of total outstanding loans to individuals in Brazil went from **below 1% in 2018 to above 8% at September 2025**, and above 14% excluding earmarked loans such as mortgages and rural credit `[FY25 Form 20-F, Item 4.B, p.22 — Nu's internal analysis of BCB data]`. Second, payments position: Nu's share of Pix transfer originations reached **close to 20%** `[FY25 Form 20-F, Item 4.B — Pix, pp.45–46, citing BACEN]`.

**The number that cuts the other way, named.** Management itself says Nu holds only **"7% market share of that profit pool"** in Brazil, against a gross profit pool it sizes at about US$100 billion `[Q2 FY26 earnings call transcript, 13 Aug 2026, Q&A]`, and the 20-F puts group market share at "approximately 5% of SAM" for FY2025 `[FY25 Form 20-F, Item 4.B, p.20 — internal estimates]`. Both are company estimates, not audited figures. So a 14.7% share of card purchase volume does not translate into a 14.7% share of the money the industry earns — Nu is a large share of the transaction flow and a small share of the profit. On the outer markets: Mexico card purchase-volume share **surpassed 5%** in 2025 `[FY25 Form 20-F, Item 4.B, p.46, per Banxico]` and Colombian customers went from ~800k (Dec 2023) to 1.2m (Dec 2024) to over 1.7m (Dec 2025) `[FY25 Form 20-F, Item 4.B, p.46]` — both gaining from a very low base.

**One disclosure caveat on the headline share figure.** The 20-F sentence reads "our share of the Brazilian card PV market (including credit, debit and prepaid) has risen steadily each year. In 2025, we represented 14.7% of the total credit card PV" — the parenthetical says all three card types, the sentence says credit cards only. They are different denominators (2025 credit card PV US$563bn; debit and prepaid US$251bn) `[FY25 Form 20-F, Item 4.B, p.46, per ABECS]`. I read 14.7% as the credit-card figure because that is what the sentence states, and because the separate Q4'25 all-card figure is given as 16%. The ambiguity is the filing's, not a gap in the data, and the conservative reading is used.

---

## 4. Competitive Shape

**Consolidated — a five-firm oligopoly in which Nu is the largest challenger and is still taking share, though at a decelerating rate.** The company's own filing gives the supporting fact: the **five largest incumbent banks in Brazil, Mexico and Colombia hold on average between 68% and 80% of all loans and deposits across all segments**, per those countries' central banks as of 31 December 2025 `[FY25 Form 20-F, Item 4.A — Our Attractive Opportunity, p.19]`. In Colombia the same filing is more precise: five banks hold 72% of credit card purchase volume and 73% of retail deposits `[FY25 Form 20-F, Item 4.B, p.29, per SFC]`; in Mexico the five largest hold close to 85% of the credit card industry's portfolio `[FY25 Form 20-F, Item 4.B, p.46]`.

**The one measure in Nu's own filing that argues the other way, addressed by name.** The 20-F cites a Herfindahl–Hirschman Index — the standard 0–10,000 concentration measure — of **889 for Brazil**, 993 for Mexico and 1,262 for Colombia, against the United States at 328, Germany 373 and France 488 `[FY25 Form 20-F, Item 4.B, p.21, per BCB, CNBV, SFC and the ECB, 2024–2025 data]`. Nu presents 889 as evidence of concentration because it is nearly three times the US figure. On the conventional antitrust reading, 889 sits **below** the 1,000–1,500 line usually treated as the start of moderate concentration — so on that yardstick Brazilian banking is not concentrated at all. The two facts are arithmetically compatible: five roughly evenly sized firms at about 13–14% each produce a top-five share near 70% and an HHI near 900. The honest description is therefore **a top-heavy market with several similarly sized large players rather than one dominant firm** — which is exactly the shape that lets a challenger take 6 points of card share in four years without any incumbent collapsing. The cost gap Nu claims is the mechanism: it states the main Brazilian incumbents each run between 1,685 and 3,955 branches and service points and between 49,661 and 85,206 employees `[FY25 Form 20-F, Item 4.B, p.21]`, against Nu's branchless model and an efficiency ratio of 19.5% in Q2'26 on the company's own non-IFRS definition `[Q2 FY26 investor deck, 13 Aug 2026, slide 6]` — a company-defined measure that, as upstream flagged, is **not** the conventional cost-to-income ratio and is not directly comparable to an incumbent's.

---

## 5. Caveat

Credible competitors were identified, so the selection limitation does not apply. Four limits on what this map can prove:

1. **No peer filing is in the data pool.** The pool is Nu-only. Every peer number here comes from either the Capital IQ comps workbook (a §4 tier-5 vendor export) or a dated web read of the peer's own recent results release. The Itaú, Bradesco and Inter return figures are labelled as such at each use. Resolution: add the 2Q26 results filings of ITUB, BBDC4 and INTR to the pool so peer returns can be cited at tier 1–2.
2. **Return on tangible book is derived, not disclosed.** For every listed peer I computed it as the vendor's LTM diluted EPS ÷ LTM tangible book value per share, which is matched-basis across the whole comp set including Nu. It is not an ROIC and not a filed ROE. Where the company's own ROE is available (Itaú 24.3%, Bradesco 16.2%, Inter 16.3%, Nu 33%) the two reads agree within about one point for the peers, but they are different measures over different periods and must not be mixed in one table.
3. **Nu's 42.7% net margin is on the vendor's post-provision revenue base, not the filing's.** On the 20-F's own Note-34 revenue the FY2025 net margin was 23.8%. The peer comparison is valid only because all eleven companies sit on the same CIQ bank template. Any claim that Nu "earns more than peers" must state that basis or it is not testable.
4. **Two competitor figures in the pool are stale or wrong.** The CIQ Competitors export carries LTM revenue dates as old as 31 December 2022 (PicPay) and 31 December 2023 (Mercado Pago), and it reports Inter & Co at US$158.6m against the comps workbook's US$1,279.1m for the same date. Do not use the Competitors export as a source of size for any private or subsidiary rival without a second read.

Sources used from outside the data pool, listed for audit: [Itaú Unibanco 2Q26 results press release (SEC Form 6-K)](https://www.sec.gov/Archives/edgar/data/0001132597/000113259726000215/eng_pressreleasex2t26.htm) · [Itaú Unibanco 2Q26 filing summary](https://www.stocktitan.net/sec-filings/ITUB/6-k-itau-unibanco-holding-s-a-current-report-foreign-issuer-40d198ec1ced.html) · [Bradesco Q2 2026 results slides summary](https://www.investing.com/news/company-news/bradesco-q2-2026-slides-loan-growth-accelerates-profit-extends-streak-93CH-4843653) · [Inter & Co 2Q26 results (6-K summary)](https://www.stocktitan.net/sec-filings/INTR/6-k-inter-co-inc-current-report-foreign-issuer-cbebe00f932e.html).
