# Peer Dimension Matrix — NU (Nu Holdings Ltd.)

**Verdict: Empty matrix — zero eligible peers. Every dimension and all dispersion are *Not assessable*.**

**Why, in one paragraph.** `01_peer-claim-extraction.md` returned **Insufficient**: there is no usable competitor call anywhere in the bound evidence. This agent does not re-source peer claims, so with zero claims upstream there is nothing to align, nothing to scope-tag, and nothing to compare. Per MODULE_RULES this is the **zero-eligible-peer** case, not the one-peer case: the matrix below is emitted empty, every dimension is marked *Not assessable*, and the coverage gap is reported. No peer, no column, and no cell is invented.

**Dependency check (`01` present, not degraded).** `01` is on disk and was read; the transcripts were not re-read, because `01`'s own inventory is exhaustive rather than a sample and was itself triple-checked against the bound generation `f9081efa…09f2be`: the manifest carries **115 sources, 0 failures, 0 rows flagged `external: true`**; all **20** transcript rows are Nu Holdings' own calls (Q4 2021 – Q2 2026 plus one Shareholder/Analyst call); and a whole-corpus search of the 25,397,747-character `corpus.txt` for peer-call markers (`Itaú|Bradesco|Inter & Co|Santander|Banco do Brasil|BTG|PagSeguro|StoneCo` + *Earnings Call / Conference Call / Results Call*) and for broker call-summary markers returned **0 matches** each `[01_peer-claim-extraction.md, evidence-binding section; 00_competitive-intel-triage.md §1]`. Nothing about that finding is refutable by re-reading the same files.

**Eligible-peer count: 0.** Named peers in the anchored set: **13**. Peers with a call in this pool: **0**. Peers with a permitted broker paraphrase of a call (G5): **0**. The peer set itself is anchored to NU's own filing — *"Our main competitors in the Brazilian consumer credit space include Itaú Unibanco S.A., Banco Bradesco S.A., Banco Santander (Brasil) S.A., Caixa Econômica Federal and Banco do Brasil S.A. … Banco BTG Pactual S.A., Banco Inter S.A., Banco C6 S.A. and XP Inc. … MercadoPago…, PicPay…, PagSeguro Digital Ltd. and StoneCo Ltd."* `[FY25 Form 20-F (filed 8 Apr 2026), Item 3.D Risk Factors, pp.107–108, via 08_competitive-map.md]` — so the self-selected-peer cap does not bind. What is missing is the calls, not the peer list.

---

## 1. The Matrix (peer × dimension)

There are **no peer columns**, because no peer produced a claim. The row labels are retained so the shape of the missing evidence is explicit and so a later run, once competitor calls are loaded, can fill the same grid.

| Dimension | *(no eligible peer — column would name a peer with a call; none exists)* |
|---|---|
| Demand | — Not assessable (no peer claim in `01`) |
| Pricing / ASP | — Not assessable (no peer claim in `01`) |
| Volume / units | — Not assessable (no peer claim in `01`) |
| Input costs | — Not assessable (no peer claim in `01`) |
| Margin trajectory | — Not assessable (no peer claim in `01`) |
| Channel / inventory | — Not assessable (no peer claim in `01`) |
| Capacity / capex | — Not assessable (no peer claim in `01`) |
| Market-share claim | — Not assessable (no peer claim in `01`) |
| Guidance direction | — Not assessable (no peer claim in `01`) |
| Capital return | — Not assessable (no peer claim in `01`) |
| **Biggest risk named** | — Not assessable (no peer claim in `01`) |

**The peers that would have been columns, and why each is blank.** Carried from `01` §Peer Set. Nine hold real public earnings calls that do discuss these dimensions; four never will.

| Peer | Ticker / venue | Std / currency / FY-end | Why no column |
|---|---|---|---|
| Itaú Unibanco Holding S.A. | BOVESPA:ITUB4; ADR NYSE:ITUB | IFRS + BCB rules / BRL / 31 Dec | No transcript in pool — fixable intake gap |
| Banco Bradesco S.A. | BOVESPA:BBDC4; ADR NYSE:BBD | IFRS + BCB rules / BRL / 31 Dec | No transcript in pool — fixable intake gap |
| Banco Santander (Brasil) S.A. | BOVESPA:SANB11 | IFRS + BCB rules / BRL / 31 Dec | No transcript in pool — fixable intake gap |
| Banco do Brasil S.A. (state-controlled) | BOVESPA:BBAS3 | IFRS + BCB rules / BRL / 31 Dec | No transcript in pool — fixable intake gap |
| Banco BTG Pactual S.A. | BOVESPA:BPAC11 | IFRS + BCB rules / BRL / 31 Dec | No transcript in pool — fixable intake gap |
| Inter & Co, Inc. | NasdaqGS:INTR (B3 BDR) | IFRS / BRL / 31 Dec | No transcript in pool — fixable intake gap |
| PagSeguro Digital Ltd. | NYSE:PAGS | IFRS / BRL / 31 Dec | No transcript in pool — fixable intake gap |
| StoneCo Ltd. | NasdaqGS:STNE | IFRS / BRL / 31 Dec | No transcript in pool — fixable intake gap |
| XP Inc. | NasdaqGS:XP | IFRS / BRL / 31 Dec | No transcript in pool — fixable intake gap |
| Caixa Econômica Federal | unlisted, state-owned | — | Permanent coverage gap — will never hold a call |
| Banco C6 S.A. | unlisted | — | Permanent coverage gap — will never hold a call |
| PicPay Instituição de Pagamento S.A. | unlisted | — | Permanent coverage gap — will never hold a call |
| Mercado Pago Instituição de Pagamento Ltda | subsidiary of MercadoLibre | — | Permanent coverage gap — no standalone call |

Peer identities, venues and reporting bases carried from `01` §Peer Set / `00` §1a, sourced there from `[Capital IQ Quick Comparable Analysis → Financial Data (Nu Holdings comp set), as-of 29 Aug 2026, USD — vendor export]` and `[Capital IQ Competitors export (NU), as-of Aug-2026 — vendor export]`. Both are **vendor comps rows, not calls** — prices, revenue, EPS and tangible book, with **no management commentary of any kind**. Neither can populate a single cell above, because every cell asks "what did this peer's management say", and a comps row cannot answer it.

**No cell carries a window flag or a scope flag,** because there is no cell. G1 window alignment and G3 scope-matching had nothing to operate on this run.

---

## 2. Consensus & Dispersion (per dimension)

There are **no window/scope cohorts** to compute within, because there are zero peer claims. Every dimension takes the same outcome, and it is the `<2 peers` outcome, not "Mixed" and not "No material outlier" — those two are findings about evidence that exists, and none does here.

- **Demand:** *Not assessable — fewer than two peers in this window/scope cohort* (in fact zero peers, in any cohort).
- **Pricing / promo (ASP):** *Not assessable — zero peers.*
- **Volume / units:** *Not assessable — zero peers.*
- **Input costs:** *Not assessable — zero peers.* (For a bank peer set this dimension would read as cost of funding / cost of deposits and cost of risk.)
- **Margin trajectory:** *Not assessable — zero peers.* (Would read as net interest margin and NIM change in basis points — the currency-independent ratio G4 prefers over any BRL/USD level.)
- **Channel / inventory:** *Not assessable — zero peers.*
- **Capacity / capex:** *Not assessable — zero peers.*
- **Market-share claim:** *Not assessable — zero peers.*
- **Guidance:** *Not assessable — zero peers.*
- **Capital return:** *Not assessable — zero peers.*
- **Biggest risk named:** *Not assessable — zero peers.* **Nothing is carried forward to `03` or to the §8 disconfirmation register from this row**, because no peer management statement of any risk exists in this pool. This is a stated absence, not a silent drop: the disconfirming peer signal that would ordinarily flow into the module's killer-risk and rejection tests is simply unavailable on this run, and `99` should record the absence rather than treat "no peer risk flagged" as reassurance.

**Dispersion verdict: Not assessable.** MODULE_RULES caps dispersion (job 3) at *Not assessable* with fewer than two peer transcripts; there are zero. No consensus line and no outlier line can be written on any dimension without inventing a peer, which is prohibited.

**Three items in the pool sit close to a peer claim and are excluded — recorded so `03` and `04` do not reach for them.** Carried verbatim in substance from `01` §Analyst Assertions Stripped (G5):

| Excluded item | Nominal peer touched | Why it cannot enter the matrix |
|---|---|---|
| *"I was checking here at Itau Unibanco, one of the leading banks in Brazil. And when I look to the retail operation, it is around $1.1 billion, right? So you are very close to that."* — Yuri Rocha Fernandes, JPMorgan Chase & Co, Research Division `[NU Q2 FY26 earnings call transcript, 13 Aug 2026, Q&A]` | Itaú Unibanco | G5 — an **analyst's** framing, spoken on the **subject's** call. Not Itaú management, not on Itaú's call. Context only, never evidence. |
| The two-part question on the government renegotiation portfolio and unsecured-lending pace — Pedro Leduc, Itaú Corretora de Valores S.A., Research Division `[NU Q2 FY26 earnings call transcript, 13 Aug 2026, Q&A]` | Itaú (employer only) | An analyst employed by Itaú BBA asking about **NU**. The speaker's employer is not the subject of the claim. The "Itaú" label on the speaker line is exactly the trap this row exists to block. |
| *"A lot of the incumbent banks, if you look at the ARPAC, they are at 40 to 45."* — David Velez-Osomo, Founder, Chairman & CEO, Nu Holdings `[NU Q2 FY26 earnings call transcript, 13 Aug 2026, Q&A]` | unnamed "incumbent banks" | The **subject's** management characterising competitors, with no peer named and no peer source. It is a **subject** claim for `04` to cross-examine — and on this run there is no peer call to test it against. It must not be entered as a peer's own market-share or pricing statement. |

---

## 3. Alignment & Scope Notes

- **Window mismatches (G1): none to flag, and that is not a clean bill.** No peer claim exists, so no window alignment was performed and none could be. For a future run, the target is NU's next filing: **Q3 2026 — the three months ended 30 Sep 2026, published alongside a nine-month cumulative column (both bases side by side), expected 12 Nov 2026** `[Capital IQ Events Calendar export, timeframe 2026 — "Nov-12-2026 12:30 PM · Earnings Release Date" — vendor export, via 00 §0]`. NU is a US-listed foreign private issuer reporting under **IFRS as issued by the IASB, in US dollars, FY ending 31 December** `[FY25 Form 20-F (filed 8 Apr 2026), cover page]` — there is no 10-Q, and the absence of a US form name is not a data gap (§27). The Brazilian peers report in **BRL** on a 31 December year-end, so a future matrix must compare **rates of change and margins in basis points**, not absolute BRL-vs-USD levels (G4).
- **A second, independent reason there is no current-window read.** The target window has **not yet ended** as of the run date, 6 Sep 2026. No company anywhere has reported July–September 2026. Even a fully stocked peer set would today be "not yet reported" for this window; the timing edge on this quarter only becomes available in early November. So the empty matrix is over-determined: the intake gap alone would make it empty, and the calendar alone would make the *current-window* read empty regardless.
- **Scope mismatches (G3): none to flag, for the same reason.** No peer claim exists to scope-tag against NU's exposure. Two qualifiers must travel to any future matrix rather than be discovered late: NU discloses **one operating and reportable segment (Banking)** covering 100% of revenue and profit `[FY25 Form 20-F, Note 34, p.F-97, via 03_segment-map.md]`, so segment-level scope-matching against a peer's divisional disclosure will be asymmetric; and **profit by country is not disclosed at all**, so any geographic scope match rests on revenue only.
- **Coverage-of-exposure (from `00` §2): the reporting peer set covers 0% of NU — 0% of revenue, 0% of segments, 0% of geographies. The uncovered majority is the entire company.**

| NU exposure | Weight | Reporting-peer vantage in this pool |
|---|---:|---|
| Banking — the whole Group (one IFRS 8 segment) | 100% of revenue, 100% of profit `[FY25 Form 20-F, Note 34, p.F-97]` | **None** |
| Brazil (Note-34 revenue base) | **90.9%** in H1 FY2026 (91.4% FY2025) `[Q2 FY26 Interim Report, Note 34(b), p.43; FY25 Form 20-F, Note 34(b), p.F-97]` | **None** — no Itaú, Bradesco, Santander Brasil, Banco do Brasil, BTG or Inter call in the pool |
| Mexico | 7.2% in H1 FY2026 `[Q2 FY26 Interim Report, Note 34(b), p.43]` | **None** |
| Other countries (Colombia + United States) | 1.8% in H1 FY2026 `[same]` | **None** |
| Product: interest on loans + credit cards | 80.3% of the Note-34 base in H1'26 `[Q2 FY26 Interim Report, Note 6, p.16]` | **None** |

- **Even a complete peer set would not span the whole company** — carried forward rather than dropped: roughly **20.5% of group income in H1'26 is treasury income, which sits outside the geographic revenue table entirely** `[Q2 FY26 Interim Report, Note 6(a) and Note 34(b), pp.16, 43, via 03_segment-map.md §1c]`. A future benchmark must not present peer coverage of customer-facing revenue as coverage of NU's earnings power.
- **Nature of the gap, stated precisely so it is not miscounted.** This is an **intake** gap: extraction was clean (`totals.failures: 0` across 115 sources) and nothing was lost to language (§27) — a Portuguese-language Itaú, Bradesco, Santander Brasil, Banco do Brasil or BTG call would be read, translated, and weighted at full tier 6, and would not be a gap. The single fix is routing: the Capital IQ "Competitor Transcripts" export for NU's peer group must be force-routed under `EXTERNAL-INBOX/CapitalIQ/NU/…` or dropped directly into `data/NU/external/<provider>/`, then admitted in a later generation. A loose drop is content-detected into the competitor's own pool, where this module cannot see it; in a frozen chain a sibling-pool copy is an operator-side pointer only and cannot lift this run's weight.
- **What that gap costs, quantified.** On the vendor's own LTM income-statement filing dates, **8 of the 10 comp-set peers filed on or before NU's 13 Aug 2026 release** — Santander Brasil 29 Jul; Itaú, Bradesco and Inter 5 Aug; PagSeguro and BTG 11 Aug; Banco do Brasil 12 Aug `[Capital IQ Quick Comparable Analysis → Financial Data, as-of 29 Aug 2026 — vendor export]`. *Inference — not from a filing:* a similar spread in Q3 would put most of these peers ahead of NU's 12 Nov 2026 date. That calendar spread is precisely the edge this module exists to capture, and it is the one being forfeited.

---

## Self-Check

- [x] Every extracted peer claim from `01` appears in the matrix or is explicitly "not addressed" — `01` extracted **zero** claims; all eleven dimensions are explicitly marked not addressed, for all thirteen named peers.
- [x] Window mismatches flagged (G1) — none exist to flag; no figures are presented as a comparable series, because none are presented at all.
- [x] Scope tags carried (G3); comparisons prefer ratios (G4) — no comparison was made; the ratio-preference and the BRL/USD trap are recorded for the next run.
- [x] Consensus/dispersion computed within matched cohorts — **zero cohorts exist**; every dimension is *Not assessable* under the `<2 peers` rule, and no consensus, no "Mixed", no outlier, and no "No material outlier" is asserted anywhere. Nothing is pooled, because there is nothing to pool.
- [x] Every quote/number traces through `01` to its cited pool source — the only quotes reproduced are the three **excluded** G5 items, each cited to `[NU Q2 FY26 earnings call transcript, 13 Aug 2026, Q&A]` and each labelled as excluded; every exposure weight is cited to the subject's own filing via `00`/`03_segment-map.md`; every peer filing date is labelled a vendor export, never a filing. Nothing invented.
- [x] No banned phrases — no "peers are cautious", no "in line with peers", no "the read-through is clear", and no bare peer generalisation appears; there is no peer statement in this pool to generalise from.
