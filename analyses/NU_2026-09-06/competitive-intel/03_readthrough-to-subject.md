# Peer Read-Through — NU (Nu Holdings Ltd.)

**Verdict: Not assessable — no usable competitor call in the pool, and no peer anywhere has reported the target window.**

**Evidence binding.** This run is bound to the frozen extraction generation `f9081efa…09f2be`. Every read resolved through that exact generation's `manifest.json` and its extract tree; files are cited logically as `data/NU/...`. No sibling live pool (`data/ITUB/`, `data/BBDC/`, `data/INTR/`, or any other) was inspected or cited — in a frozen chain that is prohibited, and such a file would not be in this run's audit corpus in any case.

**Upstream inputs, all present and read:** `00_competitive-intel-triage.md` (verdict **Insufficient**; peer set, calendar, coverage-of-exposure), `01_peer-claim-extraction.md` (verdict **Insufficient — no usable competitor call**; zero claim blocks), `02_dimension-matrix.md` (**empty matrix, zero eligible peers**), plus cross-module `business-model/08_competitive-map.md`, `business-model/03_segment-map.md`, `earnings/04_guidance-consensus.md` and `earnings/05_beat-miss-setup.md`. Nothing required was missing. This agent builds on those outputs and did **not** re-source peer claims of its own.

**The upstream finding was verified, not merely inherited**, because it governs this entire report: the bound generation's manifest carries **115 sources, `totals.failures: 0`, and 0 rows flagged `external: true`** — there is no `external/` area in this pool at all, so the `frameworks/EXTERNAL_DATA.md` intake path that delivers competitor calls was never used for this subject. All 20 transcript rows are Nu Holdings' own calls (Q4 2021 – Q2 2026 plus one Shareholder/Analyst call). A whole-corpus search of the 25,397,747-character `corpus.txt` for peer-call markers and for broker call-summary markers returned **0 matches** each `[01_peer-claim-extraction.md, evidence-binding section; 00_competitive-intel-triage.md §1]`.

**Two independent reasons there is no read-through**, and each alone is sufficient:

1. **Intake.** Zero competitor earnings-call transcripts and zero permitted broker peer-call paraphrases (G5) exist in the bound pool. There is no peer management statement to infer from, so **G2 is never even reached** — there is no inference to label, because there is no peer evidence.
2. **Calendar.** NU's target window — the three months July–September 2026 — **has not yet ended** as of the run date, 6 September 2026. No company anywhere has reported it. Even a fully stocked peer set would today be classed *not yet reported* for this window. The peer timing edge on this quarter only becomes available in the first half of November 2026.

Per this module's dependency rule, the stop condition ("no usable competitor call — neither a verbatim transcript nor a permitted broker proxy") is met. This report therefore records the gap, its size, and what would fix it. It does **not** fill any dimension by inference, by a vendor number, or by anything NU's own management said about competitors — that is prohibited, and doing it would be the exact defect this module exists to prevent.

---

## 0. Peer Set & Reporting Calendar

**NU files next: Q3 2026 — the three-month period ended 30 September 2026, published alongside a nine-month cumulative column (both bases side by side), covering ~the three months July–September 2026, expected 12 November 2026.**

`[Capital IQ Estimates → Consensus, header — "FQ3 2026 Earnings Release Date: Nov-12-2026" — vendor export; corroborated by Capital IQ Events Calendar export, timeframe 2026 — vendor export; basis proven against Q2'26 interim condensed consolidated financial statements (filed 14 Aug 2026), statements of income, "three and six-month periods ended June 30, 2026 and 2025", via earnings/04 §1A]`.

**Basis, standard, currency (§27).** NU is a **US-listed foreign private issuer** reporting under **IFRS as issued by the IASB**, in **US dollars**, with a fiscal year ending **31 December** `[FY25 Form 20-F (filed 8 Apr 2026), cover page]`. There is no 10-Q; the interim disclosure is an unaudited interim condensed consolidated financial statement furnished to the SEC, and the absence of a US form name is not a data gap. The vendor consensus was independently proven to sit on the **standalone-quarter, diluted-EPS** basis (the vendor's FQ2'26 "Actual" cells — revenue 5,513.208m, EPS 0.2162 — match the filing's three-month column and *diluted* rather than basic EPS of 0.2183) `[earnings/04_guidance-consensus.md §1A]`. A read-through, had one been possible, would have aimed at the standalone July–September 2026 quarter.

**Peer calendar table — empty by fact, not by omission.**

| Peer | Ticker / venue | Std / currency | Most-recent call (native label) | Normalised window | Interim basis | Timing vs subject window | Scope overlap with subject | Source |
|---|---|---|---|---|---|---|---|---|
| *(none — no competitor call, verbatim or paraphrased, exists in this pool)* | — | — | — | — | — | — | — | — |

**Read-through-eligible peers: none.** No peer reported the full window; no peer reported a sub-window of it; and — following the Timing Rule strictly — **no peer is listed as "not yet reported / context only" either**, because that state is reserved for a company whose call is simply not out yet. Here, no call of any vintage is in the pool for any competitor, which makes every one of them a **coverage gap**, not a Timing state.

**The named peer set, and why every row is blank.** The peer set is **anchored to NU's own filing**, not self-selected: `business-model/08_competitive-map.md` built it from *"Our main competitors in the Brazilian consumer credit space include Itaú Unibanco S.A., Banco Bradesco S.A., Banco Santander (Brasil) S.A., Caixa Econômica Federal and Banco do Brasil S.A. … Banco BTG Pactual S.A., Banco Inter S.A., Banco C6 S.A. and XP Inc. … MercadoPago…, PicPay…, PagSeguro Digital Ltd. and StoneCo Ltd."* `[FY25 Form 20-F (filed 8 Apr 2026), Item 3.D Risk Factors, pp.107–108]`. **The self-selected-peer cap therefore does not bind** — what is missing is the calls, not the peer list.

| Peer | Ticker / venue | Std / currency / FY-end | Why no row | Nature of gap |
|---|---|---|---|---|
| Itaú Unibanco Holding S.A. | BOVESPA:ITUB4; ADR NYSE:ITUB | IFRS + BCB rules / BRL / 31 Dec | No transcript in pool | Fixable intake gap |
| Banco Bradesco S.A. | BOVESPA:BBDC4; ADR NYSE:BBD | IFRS + BCB rules / BRL / 31 Dec | No transcript in pool | Fixable intake gap |
| Banco Santander (Brasil) S.A. | BOVESPA:SANB11 | IFRS + BCB rules / BRL / 31 Dec | No transcript in pool | Fixable intake gap |
| Banco do Brasil S.A. (state-controlled) | BOVESPA:BBAS3 | IFRS + BCB rules / BRL / 31 Dec | No transcript in pool | Fixable intake gap |
| Banco BTG Pactual S.A. | BOVESPA:BPAC11 | IFRS + BCB rules / BRL / 31 Dec | No transcript in pool | Fixable intake gap |
| Inter & Co, Inc. | NasdaqGS:INTR (B3 BDR) | IFRS / BRL / 31 Dec | No transcript in pool | Fixable intake gap |
| PagSeguro Digital Ltd. | NYSE:PAGS | IFRS / BRL / 31 Dec | No transcript in pool | Fixable intake gap |
| StoneCo Ltd. | NasdaqGS:STNE | IFRS / BRL / 31 Dec | No transcript in pool | Fixable intake gap |
| XP Inc. | NasdaqGS:XP | IFRS / BRL / 31 Dec | No transcript in pool | Fixable intake gap |
| Caixa Econômica Federal | unlisted, state-owned | — | Will never hold a call | **Permanent** coverage gap |
| Banco C6 S.A. | unlisted | — | Will never hold a call | **Permanent** coverage gap |
| PicPay Instituição de Pagamento S.A. | unlisted | — | Will never hold a call | **Permanent** coverage gap |
| Mercado Pago Instituição de Pagamento Ltda | subsidiary of MercadoLibre | — | No standalone call | **Permanent** coverage gap |

Peer identities, venues and reporting bases carried from `01` §Peer Set / `00` §1a, sourced there from `[Capital IQ Quick Comparable Analysis → Financial Data (Nu Holdings comp set), as-of 29 Aug 2026, USD — vendor export]` and `[Capital IQ Competitors export (NU), as-of Aug-2026 — vendor export]`. Both are **vendor comps rows, not calls**: they carry prices, revenue, EPS and tangible book, and carry **no management commentary of any kind**. Language is recorded for completeness and is explicitly **not** the deficiency (§27) — a Portuguese-language Itaú, Bradesco, Santander Brasil, Banco do Brasil or BTG call would be read, translated, and weighted at full tier 6.

### Coverage of the subject's exposure (required)

**The read-through-eligible peer set is empty, so it spans 0% of NU's revenue, 0% of its segments, and 0% of its geographies. The uncovered majority is the entire company.** Sized against `business-model/03_segment-map.md`:

| NU exposure | Weight | Reporting-peer vantage in this pool |
|---|---:|---|
| **Banking — the whole Group** (NU's one operating and reportable segment under IFRS 8) | **100%** of revenue, **100%** of profit `[FY25 Form 20-F, Note 34, p.F-97]` | **None** |
| **Brazil** (Note-34 revenue base) | **90.9%** in H1 FY2026 (91.4% FY2025) `[Q2 FY26 Interim Report, Note 34(b), p.43; FY25 Form 20-F, Note 34(b), p.F-97]` | **None** — no Itaú, Bradesco, Santander Brasil, Banco do Brasil, BTG or Inter call in the pool |
| **Mexico** | **7.2%** in H1 FY2026 `[Q2 FY26 Interim Report, Note 34(b), p.43]` | **None** |
| **Other countries** (Colombia + United States) | **1.8%** in H1 FY2026 `[same]` | **None** |
| **Product: interest on loans + credit cards** | **80.3%** of the Note-34 base in H1'26 `[Q2 FY26 Interim Report, Note 6, p.16]` | **None** |

The dominant exposure — **Brazilian consumer credit, 90.9% of the disclosed revenue base**, the market in which NU's own 20-F names five direct competitors — has **no reporting-peer vantage**, and so does every other exposure. Under the coverage-of-exposure rule the read-through for that exposure is **Not assessable**, and the net read-through weight is **nil**, not merely capped. This is that rule at its limit: not "a confident read on the minority of the business", but no read on any of it.

Four competitors named in NU's own filing — **Caixa Econômica Federal** (state-owned, unlisted; LTM revenue US$14,819.3m to 31 Mar 2026, profitability not public), **Banco C6** (unlisted; LTM revenue US$2,743.5m to 31 Dec 2024 — stale), **PicPay** (unlisted; LTM revenue US$1,214.2m to 31 Dec 2022 — four years stale) and **Mercado Pago** (a MercadoLibre subsidiary; LTM revenue US$512.1m to 31 Dec 2023 — stale) `[Capital IQ Competitors export (NU), as-of Aug-2026 — vendor export]` — will never hold a call. That slice of the Brazilian competitive picture is a **permanent** coverage gap no future intake fixes.

**Two qualifiers travel with these weights rather than being dropped:** profit by country is **not disclosed at all**, so the dominance read rests on revenue; and roughly **20.5% of group income in H1'26 (treasury income) sits outside the geographic revenue table entirely** `[Q2 FY26 Interim Report, Note 6(a) and Note 34(b), pp.16, 43, via 03_segment-map.md §1c]`. Even a fully stocked peer set could not have spoken to that treasury slice, and a future benchmark must not present peer coverage of customer-facing revenue as coverage of NU's earnings power.

---

## 1. Peer Management Signals (already-reported peers only)

**None. There is no peer management signal on any dimension, because no peer management statement exists anywhere in the bound pool.**

`02_dimension-matrix.md` returned an empty matrix with zero eligible peers, and this agent does not re-source peer claims. The eleven fixed benchmark dimensions are therefore all unaddressed. The row labels are retained so the shape of the missing evidence is explicit and a later run can fill the same grid.

| Dimension | Peer | What management said | Scope (geo / segment / tier) | Number (currency, period) | Citation |
|---|---|---|---|---|---|
| Demand | — | *Not assessable — no peer claim in `01`/`02`* | — | — | — |
| Pricing / ASP (for a bank peer set: card and lending pricing / rates charged) | — | *Not assessable — zero peers* | — | — | — |
| Volume / units (customers, active accounts, loan originations) | — | *Not assessable — zero peers* | — | — | — |
| Input costs (cost of funding / cost of deposits, and cost of risk) | — | *Not assessable — zero peers* | — | — | — |
| Margin trajectory (net interest margin, change in basis points) | — | *Not assessable — zero peers* | — | — | — |
| Channel / inventory | — | *Not assessable — zero peers* | — | — | — |
| Capacity / capex | — | *Not assessable — zero peers* | — | — | — |
| Market-share claim | — | *Not assessable — zero peers* | — | — | — |
| Guidance direction | — | *Not assessable — zero peers* | — | — | — |
| Capital return | — | *Not assessable — zero peers* | — | — | — |
| **Biggest risk named** | — | *Not assessable — zero peers* | — | — | — |

**On the "Biggest risk named" row specifically.** This row is load-bearing: a peer's biggest management-named risk on the shared market is a *disconfirming* signal that must reach the net verdict and the module's §8 disconfirmation and rejection tests. On this run **nothing is carried forward from it, and that is a stated absence, not a silent drop**. The disconfirming peer signal that would ordinarily flow into the killer-risk register is simply unavailable. `99` and the master synthesizer must record the absence and must **not** read "no peer risk flagged" as reassurance — no peer was asked.

**Scope-mismatch note.** No signal was set aside for scope mismatch, because no signal exists to scope-tag (G3 had nothing to operate on). That is not a clean bill; it is an empty one.

### Three in-pool items that sit close to a peer signal and are excluded (G5)

Recorded so no downstream agent converts one into a peer benchmark row. Carried in substance from `01` §Analyst Assertions Stripped and `02` §2.

| Excluded item | Nominal peer touched | Why it is not peer evidence |
|---|---|---|
| *"I was checking here at Itau Unibanco, one of the leading banks in Brazil. And when I look to the retail operation, it is around $1.1 billion, right? So you are very close to that."* — Yuri Rocha Fernandes, JPMorgan Chase & Co, Research Division `[NU Q2 FY26 earnings call transcript, 13 Aug 2026, Q&A]` | Itaú Unibanco | **G5** — an *analyst's* framing of an Itaú figure, spoken on the *subject's* call. Not Itaú management, not on Itaú's call. Context only, never evidence. |
| The two-part question on the government renegotiation portfolio and unsecured-lending pace — Pedro Leduc, Itaú Corretora de Valores S.A., Research Division `[NU Q2 FY26 earnings call transcript, 13 Aug 2026, Q&A]` | Itaú (employer only) | An analyst *employed by* Itaú BBA asking about **NU**. The speaker's employer is not the subject of the claim. The "Itaú" label on the speaker line is exactly the trap this row blocks. |
| *"A lot of the incumbent banks, if you look at the ARPAC, they are at 40 to 45."* — David Velez-Osomo, Founder, Chairman & CEO, Nu Holdings `[NU Q2 FY26 earnings call transcript, 13 Aug 2026, Q&A]` | unnamed "incumbent banks" | The **subject's** management characterising competitors, with no peer named and no peer source. It is a *subject* claim for `04_narrative-triangulation` to cross-examine — and on this run there is no peer call to test it against. It must never be entered as a peer's own market-share or pricing statement. |

Also rejected as substitutes, so nothing downstream reaches for them: the **Capital IQ Quick Comparable Analysis → Financial Data** comp set (tier-5 vendor export — numbers only, no commentary, no speaker, no call), the **Capital IQ Competitors export** (same, plus stale and internally inconsistent — it reports Inter & Co at US$158.6m against the comps workbook's US$1,279.1m for the same date), the **Capital IQ Suppliers / Customers relationship rows** naming Itaú, Santander Brasil and BTG (a tier-5 counterparty graph, not a call), and `data/NU/NU_Holdings_Deep_Dive_15_Page_Memo_30_Aug_2026.pdf` (a prior engine output — §4 tier-9 user note, verdict-stripped per §24 — which mentions Itaú in an NPL and a card-TPV-share comparison but contains **no Itaú management statement**, so it cannot supply the G5 broker-paraphrase route to a capped Partial read). **No number in this report comes from any of them.**

---

## 2. Read-Through to NU

*Every row below would be inference from peer read-through — NOT a filing fact about NU (§6 Level 1, Guardrail G2).*

**There are no rows. The current-window read-through to NU is *Not assessable*.**

| Peer evidence | Transmission mechanism | Implication for NU (named metric, direction) | Direction confidence (§10 band + basis) | Weight (H/M/L + why) | Confirms if / Falsifies if (line-item · boundary · comparable · basis) |
|---|---|---|---|---|---|
| *(none — no peer management statement exists in the bound pool)* | — | *Not assessable* | *Not assessable — no peer evidence to assign a band to* | **Nil** — reporting peer set spans 0% of NU's revenue, segments and geographies | *Not assessable — no read-through exists to falsify* |

**Why no row can honestly be written, stated in full so the emptiness is auditable:**

- **No peer evidence.** Section 1 is empty. A read-through row begins with a peer management statement; there is none, so the chain "peer evidence → mechanism → implication" has no first link. Inventing one is prohibited by this module's hard rule (*"if it is not in a document in the pool, it does not exist for this module"*), and would be a §20 fabrication rather than a Level-1 inference.
- **No reported window.** Even with a full peer set, the target window (July–September 2026) had not ended on the run date, 6 September 2026. Every peer would be *not yet reported*, which the Timing Rule makes context-only, never a current read. A read-through built on a peer that has not reported the covered window is fabricated timing.
- **No coverage.** The reporting peer set spans 0% of NU. Under the coverage-of-exposure rule the read for the ~90.9% Brazil exposure is *Not assessable* on its own, before either point above is reached.
- **No sub-window read, so no falsifier-basis caveat is owed.** There is no partial / sub-window peer here, so the sub-window trap does not arise on this run. It is flagged for the next run: NU publishes a standalone three-month column *and* a nine-month cumulative column side by side, so a future peer read aimed at the standalone quarter can be checked cleanly against the three-month column — a real advantage over a subject that reports only a cumulative period, and one the next run should exploit rather than rediscover.
- **Both axes are unassignable, and they stay separate.** With no peer statement there is no direction to band and no weight to set. Note for the record that the direction ceiling still binds on any future row: a peer read is Level-1 inference about a *different* company, so its Direction confidence can never exceed **"Likely (60–75%)"**, however many peers corroborate it — corroboration raises **weight**, never the direction ceiling (G2 / §6).

**Context only — not a current read-through:** *none available.* No peer contributed structural or historical context either, because no peer call of any vintage — current window or older — is in this pool. This is stated rather than left blank: the module has no peer-derived structural colour to hand forward.

---

## 3. Cross-Sectional Dispersion

**Not assessable — fewer than two already-reported peers.** In fact **zero** peers reported, in any window and any scope cohort.

Per dimension, the outcome is identical and it is the `<2 peers` outcome — **not** "Mixed" and **not** "No material outlier", both of which are findings about evidence that exists:

- **Demand:** *Not assessable — zero peers.*
- **Pricing / ASP:** *Not assessable — zero peers.*
- **Volume / units:** *Not assessable — zero peers.*
- **Input costs (cost of funding, cost of risk):** *Not assessable — zero peers.*
- **Margin trajectory (NIM, in basis points):** *Not assessable — zero peers.*
- **Channel / inventory:** *Not assessable — zero peers.*
- **Capacity / capex:** *Not assessable — zero peers.*
- **Market-share claim:** *Not assessable — zero peers.*
- **Guidance direction:** *Not assessable — zero peers.*
- **Capital return:** *Not assessable — zero peers.*
- **Biggest risk named:** *Not assessable — zero peers.*

No consensus line and no named-outlier line can be written on any dimension without inventing a peer. None is written.

---

## 4. Net Read-Through Verdict

**A sourced subject bar DOES exist** — so the missing half of the beat/miss question is the peer side, not the bar side. The bar, restated onto the basis NU will actually file (§27): **standalone Q3'26 revenue US$5,936.74m and diluted EPS US$0.22164** (4/8 and 9/9 estimates), which the same filing's nine-month column would carry to **~US$16,417.9m revenue and ~US$0.6152 diluted EPS** after adding the already-reported H1'26 stub of US$10,481.175m and US$0.3936 `[Capital IQ Estimates → Consensus, Fiscal Quarters block, data as of 26 Aug 2026 — vendor export; H1 stub from Q2'26 interim condensed consolidated financial statements, statements of income, six-month period ended 30/06/2026; arithmetic per earnings/04 §1A]`. Management issues **no revenue or EPS guidance** — only an ~20% FY26 efficiency-ratio point, a 15–20% IFRS effective-tax-rate range for the remainder of 2026, a "<100 basis points" cap on the US expansion cost drag, and a qualitative "same region as where we are today" on the 12.42% risk-adjusted net interest margin `[Q1 2026 earnings-call transcript, 14 May 2026, prepared remarks; Q2 2026 earnings-call transcript, 13 Aug 2026, prepared remarks and Q&A, via earnings/04 §2]`.

**Verdict: Not assessable — no already-reported peer with overlapping scope.**

That is the correct verdict even though a bar exists, and it is over-determined: there is no peer call in the pool at all; no peer has reported the July–September 2026 window (it had not ended on the run date); and the reporting peer set spans 0% of NU's revenue, segments and geographies. Peer conditions can establish a subject's operational direction, but only from peer evidence — with none, this module cannot even state whether NU's end-markets, pricing or cost of risk are strengthening or weakening, let alone whether NU clears the US$5,936.74m / US$0.22164 bar.

The single most important peer signal for NU's next print is therefore **the one that is missing**: what Itaú, Bradesco, Santander Brasil, Banco do Brasil, BTG and Inter say about Brazilian consumer-credit demand, card and lending pricing, cost of funding, and above all **cost of risk / delinquency** in the September 2026 quarter — the ~90.9% of NU's revenue base for which this pool provides no independent vantage. What could flip this verdict is purely mechanical and dated: route those peer calls into `data/NU/external/<provider>/` and re-run after they publish in early November 2026, ahead of NU's 12 November 2026 release.

**No peer-derived evidence may reach `business-model/09_moat`, `business-model/07_business-quality`, or the master synthesizer's beat/miss view from this agent, because none exists.** In particular, the absence of any peer-flagged risk must not be carried upward as an absence of risk. This is inference feeding the beat/miss setup and the candor cross-check — it does not set a rating (G2).

---

## 5. What Would Change This

**No read-through was issued, so there is no confirm/falsify boundary to restate.** Stating a testable boundary here would require a peer signal that does not exist, and a boundary invented without one would be a rubber stamp — a threshold nothing could fail — which §17 prohibits outright.

**The falsifier-basis caveat does not arise on this run** (no sub-window read exists), and is recorded for the next: NU files a standalone three-month column *and* a nine-month cumulative column side by side, so a peer read aimed at the standalone July–September 2026 quarter can be checked directly against the three-month column without blending in an uncovered stub. A read aimed instead at the nine-month column would blend the peer-covered Q3 with the uncovered H1 and could only be **partially** checked — that read must never be presented as cleanly confirmed or refuted by the cumulative print.

**What would change this verdict — two conditions, both required, both dated:**

| Condition | Detail | Date |
|---|---|---|
| **1. Intake — route the peer calls into NU's pool** | Export the Capital IQ "Competitor Transcripts" set for NU's peer group (ITUB4, BBDC4, SANB11, BBAS3, BPAC11, INTR, PAGS) and **force-route** it under `EXTERNAL-INBOX/CapitalIQ/NU/…` or drop it directly into `data/NU/external/<provider>/`, then admit it in a later generation. A loose drop is content-detected into the *competitor's* own pool, where this module cannot see it; in a frozen chain a sibling-pool copy is an operator-side pointer only and cannot lift this run's weight. | Before 12 Nov 2026 |
| **2. Calendar — wait for the peers to actually report Q3 2026** | The target window ends 30 Sep 2026. On the vendor's own LTM income-statement filing dates, **8 of the 10 comp-set peers filed on or before NU's 13 Aug 2026 release** — Santander Brasil 29 Jul; Itaú, Bradesco and Inter 5 Aug; PagSeguro and BTG 11 Aug; Banco do Brasil 12 Aug `[Capital IQ Quick Comparable Analysis → Financial Data, as-of 29 Aug 2026 — vendor export]`. *Inference — not from a filing:* a similar spread in Q3 would put most of these peers ahead of NU's expected 12 Nov 2026 date. | Late Oct – early Nov 2026 |

That calendar spread — peers reporting the same quarter roughly one to two weeks before NU — is precisely the edge this module exists to capture, and it is the one being forfeited on this run. It is the module's single highest-value data request.

---

## 6. Data Gaps & Caps

**Peers with no transcript, and the nature of each gap:**
- **Nine fixable intake gaps** — Itaú Unibanco (ITUB4), Bradesco (BBDC4), Santander Brasil (SANB11), Banco do Brasil (BBAS3), BTG Pactual (BPAC11), Inter & Co (INTR), PagSeguro (PAGS), StoneCo (STNE), XP Inc. (XP). All nine hold real public earnings calls that do discuss every dimension in Section 1; none was routed into NU's pool.
- **Four permanent coverage gaps** — Caixa Econômica Federal, Banco C6, PicPay, Mercado Pago. State-owned, unlisted or subsidiary entities that will never hold a call. No future intake fixes these; that part of the Brazilian competitive picture stays *Not assessable* in every run.
- **Not tabulated as "not yet reported"** — correctly, per the Timing Rule: a no-transcript peer is a coverage gap, not a Timing state.
- **Two candidate end-market peers not added** — Grupo Cibest S.A. (BVC:CIBEST, Colombia) and Grupo Financiero Banorte (BMV:GFNORTE O, Mexico) appear only as vendor comps rows, are not named in NU's own filing, and have no transcript here. Adding them would be a self-selected addition and is moot on this run.

**Windows that could not be aligned (G1):** none were aligned and none could be, because no peer claim exists. That is an empty bill, not a clean one. For the next run the target is fixed: **Q3 2026, three months ended 30 Sep 2026, published alongside a nine-month cumulative column, expected 12 Nov 2026**, under **IFRS as issued by the IASB, in US dollars, FY-end 31 December** `[FY25 Form 20-F (filed 8 Apr 2026), cover page]`. The Brazilian peers report in **BRL** on a 31 December year-end, so a future matrix must compare **rates of change and margins in basis points**, never absolute BRL-versus-USD levels (G4).

**Scope-matching qualifiers for the next run (G3), stated now so they are not discovered late:** NU discloses **one operating and reportable segment (Banking)** covering 100% of revenue and profit `[FY25 Form 20-F, Note 34, p.F-97]`, so segment-level matching against a peer's divisional disclosure will be asymmetric; and **profit by country is not disclosed at all**, so any geographic scope match rests on revenue only.

**Which MODULE_RULES caps bind:**

| Trigger | Binds? | Cap applied |
|---|---|---|
| No usable competitor call at all — no verbatim transcript **and** no permitted broker paraphrase (G5) | **Yes** | Read-through **Not assessable**; the module's read-through job cannot be performed. (A broker-paraphrase-only pool would be Partial; none exists here.) |
| No peer reported the comparable window (full or sub-window) | **Yes — twice over** | Current-window read-through **Not assessable**. Binds independently of the intake gap: the Jul–Sep 2026 window had not ended on the run date. |
| A dominant segment / geography of the subject has no reporting-peer vantage (coverage-of-exposure rule) | **Yes** | The ~90.9% Brazil exposure — and in fact 100% of the group — has no reporting-peer vantage. **Net read-through weight is nil, not merely capped.** |
| Only ONE peer transcript available | Moot | Subsumed — there are zero, not one. Dispersion is *Not assessable* for the stronger reason. |
| Peer set self-selected (no `competitive-map` upstream) | **No** | Does not bind — `08_competitive-map.md` is present and anchored to NU's own 20-F risk factors. The Medium net-weight cap is not the operative constraint here. |
| Peer commentary only via broker paraphrase (no verbatim, G5) | **No** | Does not bind — there is no paraphrase to strip. Tone and candor for every peer are *Not assessable* for the stronger reason that no peer source exists. |
| Analyst framing carried as peer evidence (G5) | **Guard held** | The three near-miss items are named and excluded in Section 1. None entered any table as peer evidence. |

**Not gaps, stated so they are not miscounted (§27):**
- **Extraction was clean.** `totals.failures: 0` across 115 sources. Nothing in this pool was lost to a failed, corrupt or illegible extraction, so nothing counts as absent for extraction reasons.
- **Nothing was lost to language.** A Portuguese-language Itaú, Bradesco, Santander Brasil, Banco do Brasil or BTG call would be read, translated, and weighted at full tier 6, and would **not** be a gap. The deficiency here is intake, and nothing else.
- **Even a complete peer set would not span the whole company.** Roughly **20.5% of group income in H1'26 is treasury income, sitting outside the geographic revenue table entirely** `[Q2 FY26 Interim Report, Note 6(a) and Note 34(b), pp.16, 43]`, and profit by country is not disclosed at all. A future benchmark must carry that qualifier rather than present peer coverage of customer-facing revenue as coverage of NU's earnings power.

---

## Self-Check (the five guardrails)

- [x] **G1** — no peer call exists to normalise; the subject's target window, native label, interim basis (standalone three-month **and** nine-month cumulative, side by side), standard (IFRS as issued by the IASB), currency (USD) and FY-end (31 Dec) are all stated for the next run. No comparison was made across mismatched windows, because no comparison was made.
- [x] **G2** — Section 2 is empty, so no peer read-through is stated as a fact about NU, no rating is set, and no confidence exceeds Level-1 strength. The direction ceiling ("Likely (60–75%)") is recorded as binding on any future row.
- [x] **G3** — no signal fed the read-through; no scope mismatch was silently lined up. NU's single-segment and no-profit-by-country asymmetries are flagged for the next run.
- [x] **G4** — no cross-peer comparison was made; the BRL-versus-USD trap and the ratio preference (growth rates, margins in basis points) are recorded for the next run.
- [x] **G5** — only management statements would qualify as peer evidence; the three near-miss items (two analyst assertions, one subject-management characterisation of unnamed "incumbent banks") are named and excluded. No broker paraphrase exists, so none was labelled.
- [x] **Timing** — no peer is classified reported-full, reported-sub-window, or not-yet; all thirteen are coverage gaps (nine fixable intake, four permanent), correctly kept out of the "not yet reported" state.
- [x] **Falsifier basis** — no sub-window read exists on this run; the blending caveat is recorded for the next run, along with the fact that NU's standalone three-month column allows a clean check.
- [x] **Direction ceiling** — no read-through carries a direction band; the "Likely (60–75%)" ceiling is stated as binding on any future row, with corroboration raising weight only.
- [x] **Coverage of exposure** — Section 0 states 0% coverage and names the uncovered majority (100% of the group; Brazil 90.9% of the H1'26 Note-34 revenue base). Net read-through weight is nil.
- [x] **Two axes** — both axes are marked *Not assessable* separately and were not merged; the caps recorded act on weight, never on a §10 band.
- [x] **Every claim traces to its cited pool source** — the only quotes reproduced are the three **excluded** G5 items, each cited to `[NU Q2 FY26 earnings call transcript, 13 Aug 2026, Q&A]` and each labelled excluded; every exposure weight is cited to NU's own filing; every consensus figure is labelled a **vendor export**, never a filing; every peer filing date is labelled a vendor export. Nothing invented.
- [x] **Probability basis** — no probability is asserted, so none needed a basis. The §10 ceiling and the "a cross-company peer read is judgment" rule are recorded for the next run.
- [x] **Testable confirm/falsify** — none issued, because issuing one without a peer signal would produce a threshold nothing could fail (§17).
- [x] **Non-English calls** — none present, and none needed. Language is explicitly not the deficiency (§27).
- [x] **No banned phrases** — no "peers confirm", no "in line with peers", no "the read-through is clear", no bare "peers are cautious"; there is no peer statement in this pool to generalise from.
