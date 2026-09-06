# Competitive-Intel Data Triage — NU (Nu Holdings Ltd.)

**Evidence binding (MODULE_PIPELINE Step 1.5).** This run is bound to a frozen, supervisor-verified evidence capability. The complete quartet was present, so no extractor was run and no live pool was read: `NOSTRA_FROZEN_EVIDENCE_ROOT`, `NOSTRA_FROZEN_POOL_DATA_PATH`, `NOSTRA_FROZEN_POOL_OUT_DIR`, `NOSTRA_FROZEN_POOL_GENERATION` (generation `f9081efa…09f2be`). Every read below resolved through that exact generation's `manifest.json` and its extract tree. Files are cited logically as `data/NU/...`. No sibling live pool (`data/ITUB/`, `data/BBDC/`, `data/INTR/`) was inspected — in a frozen chain that is prohibited, and such a file would not be in this run's audit corpus in any case.

**Manifest health:** 115 sources, **0 failures** (`status`: 113 `ok`, 2 `in-place`; `totals.failures: 0`). No source counts as absent for extraction reasons. There is therefore **no extraction gap** — the gap found below is an intake gap.

**Cross-module inputs read:** `business-model/08_competitive-map.md` (present — peer set is anchored, not self-selected), `business-model/03_segment-map.md` (present — exposure weights), `earnings/05_beat-miss-setup.md` and `earnings/00_earnings-data-triage.md` (present — next-filing period and basis). Nothing required was missing.

---

## 0. Subject's Next Filing (the read-through target)

*"NU files next: **Q3 2026 — the three-month period ended 30 Sep 2026, published alongside a nine-month cumulative column (both bases side by side)**, covering ~the three months Jul–Sep 2026, expected **12 Nov 2026**."*
`[Capital IQ Events Calendar export, timeframe 2026 — "Nov-12-2026 12:30 PM · Earnings Release Date" — vendor export]`; period and dual-column basis carried verbatim from `earnings/05_beat-miss-setup.md` §1, which independently verified it against `[Capital IQ Estimates → Consensus, header "FQ3 2026 Earnings Release Date: Nov-12-2026"]` and `[Q2'26 interim condensed consolidated financial statements (filed 14 Aug 2026), statements of income, three-month period ended 30/06/2026]`.

**State the basis explicitly (§27).** NU is a **US-listed foreign private issuer** reporting under **IFRS as issued by the IASB**, in **US dollars**, fiscal year ending **31 December** `[FY25 Form 20-F (filed 8 Apr 2026), cover page]`. There is no 10-Q; the interim disclosure is an unaudited interim condensed consolidated financial statement furnished to the SEC, and the absence of a US form name is not a data gap. The interim report presents **both** a standalone three-month column and a cumulative column — the Q2'26 report covered "three and six months ended 30 Jun 2026" `[Q2 FY26 Interim Report (14 Aug 2026), Note 34, p.43]`, so Q3'26 will present three and nine months ended 30 Sep 2026.

Critically for this module, the **vendor consensus is already on the standalone-quarter basis** and does not need restating: `earnings/04` and `05` proved it by matching the vendor's FQ2'26 "Actual" cells (revenue 5,513.208m, diluted EPS 0.2162) to the filing's **three-month** column and to *diluted* rather than basic EPS. So the standalone bar is **revenue US$5,936.74m / diluted EPS US$0.22164**, and the nine-month bar is **~US$16,417.9m / ~US$0.6152** `[Capital IQ Estimates → Consensus, Fiscal Quarters block, data as of 26 Aug 2026 — vendor export; arithmetic per earnings/04 §1A]`. A read-through, had one been possible, would have aimed at the standalone Jul–Sep 2026 quarter.

**One timing fact that governs everything below:** the subject's target window **has not yet ended** as of the run date (6 Sep 2026). No company anywhere has reported the July–September 2026 quarter yet. Even a perfectly stocked peer set would today be **not-yet** for the current window; the peer timing edge on this quarter only becomes available in the first half of November.

---

## 1. Peer Transcript Inventory & Reporting Calendar

**There are ZERO competitor earnings-call transcripts in the bound pool.** The finding is exhaustive, not a sampling result:

- The pool has **no `external/` subfolder at all**. Every one of the 115 manifest rows was checked: **0 rows carry `external: true`**, and none carries a `provenance` sidecar. The `frameworks/EXTERNAL_DATA.md` intake path that delivers competitor calls was never used for this subject.
- Every one of the 20 transcripts in `data/NU/Transcript Digest/` is a **Nu Holdings** call (Q4 2021 through Q2 2026, plus one Shareholder/Analyst call). Identifying each from its own cover content, not the filename: all are Nu Holdings Ltd. Not one names another issuer.
- A whole-corpus search for peer-call markers (`Itaú|Bradesco|Inter & Co|… earnings call`) across the generation's 25.6MB `corpus.txt` returned **0 matches**.
- No file anywhere under the frozen `raw/` tree carries a non-Nu company name.

**Peer transcript rows: none.** The table is empty by fact, not by omission:

| Peer | Ticker / venue | Std / currency / FY-end | Language | Most-recent call (native label) | Normalised window | Interim basis | Timing vs subject window | Scope overlap | Source (path) |
|---|---|---|---|---|---|---|---|---|---|
| *(none — no competitor transcript exists in this pool)* | — | — | — | — | — | — | — | — | — |

### 1a. The named peer set, and why each has no row

The peer set is **anchored, not self-selected**: `business-model/08_competitive-map.md` built it from NU's own filing — *"Our main competitors in the Brazilian consumer credit space include Itaú Unibanco S.A., Banco Bradesco S.A., Banco Santander (Brasil) S.A., Caixa Econômica Federal and Banco do Brasil S.A. … Banco BTG Pactual S.A., Banco Inter S.A., Banco C6 S.A. and XP Inc. … MercadoPago…, PicPay…, PagSeguro Digital Ltd. and StoneCo Ltd."* `[FY25 Form 20-F, Item 3.D Risk Factors, pp.107–108]`. The self-selection cap therefore does **not** bind.

Two different kinds of gap sit underneath, and the module rules require they not be conflated:

**(i) Competitors that DO hold public earnings calls — the call simply was never placed in NU's pool (an intake gap, fixable).**

| Competitor | Ticker / venue | Standard / currency / FY-end | Language of its call | Latest income statement on file (vendor) | Status here |
|---|---|---|---|---|---|
| Itaú Unibanco Holding S.A. | BOVESPA:ITUB4; ADR NYSE:ITUB | IFRS + BCB rules / BRL / 31 Dec | Portuguese + English call | LTM to 5 Aug 2026 | No transcript in pool |
| Banco Bradesco S.A. | BOVESPA:BBDC4; ADR NYSE:BBD | IFRS + BCB rules / BRL / 31 Dec | Portuguese + English call | LTM to 5 Aug 2026 | No transcript in pool |
| Inter & Co, Inc. | NasdaqGS:INTR (B3 BDR) | IFRS / BRL / 31 Dec | English call | LTM to 5 Aug 2026 | No transcript in pool |
| Banco Santander (Brasil) S.A. | BOVESPA:SANB11 | IFRS + BCB rules / BRL / 31 Dec | Portuguese + English call | LTM to 29 Jul 2026 | No transcript in pool |
| Banco do Brasil S.A. (state-controlled) | BOVESPA:BBAS3 | IFRS + BCB rules / BRL / 31 Dec | Portuguese call | LTM to 12 Aug 2026 | No transcript in pool |
| Banco BTG Pactual S.A. | BOVESPA:BPAC11 | IFRS + BCB rules / BRL / 31 Dec | Portuguese + English call | LTM to 11 Aug 2026 | No transcript in pool |
| PagSeguro Digital Ltd. | NYSE:PAGS | IFRS / BRL / 31 Dec | English call | LTM to 11 Aug 2026 | No transcript in pool |
| StoneCo Ltd. / XP Inc. | NasdaqGS:STNE / NasdaqGS:XP | IFRS / BRL / 31 Dec | English call | not in comp set | No transcript in pool |

LTM income-statement filing dates from `[Capital IQ Quick Comparable Analysis → Financial Data (Nu Holdings comp set), as-of 29 Aug 2026, USD — vendor export]` — **a vendor comps export, not a call.** It carries prices, revenue, EPS and tangible book; it carries **no management commentary of any kind**, so it cannot serve any of this module's four jobs. Language is recorded for completeness: a Portuguese-language call would be read and translated and is **not** a gap (§27) — the gap here is that no call, in any language, is in the pool.

**(ii) Competitors that will never file a call — genuine coverage gaps, not a Timing state (per the module's "a no-transcript peer is NOT a Timing state" rule).**

- **Caixa Econômica Federal** — state-owned, unlisted. LTM revenue US$14,819.3m (to 31 Mar 2026); profitability **not public**.
- **Banco C6 S.A.** — unlisted. LTM revenue US$2,743.5m (to 31 Dec 2024 — stale).
- **PicPay Instituição de Pagamento S.A.** — unlisted. LTM revenue US$1,214.2m (to 31 Dec 2022 — four years stale).
- **Mercado Pago Instituição de Pagamento Ltda** — a subsidiary of MercadoLibre; no standalone call. LTM revenue US$512.1m (to 31 Dec 2023 — stale).

`[Capital IQ Competitors export (NU), as-of Aug-2026 — vendor export]`, carried with `08_competitive-map.md`'s warning intact: that export is stale and internally inconsistent (it reports Inter & Co at US$158.6m against the comps workbook's US$1,279.1m for the same date) and must not be used as a size source without a second read.

**(iii) One candidate end-market peer present only as a vendor comps row (would be flagged self-selected if used).** Grupo Cibest S.A. (BVC:CIBEST, Colombia — Bancolombia's holding company; LTM to 15 Aug 2026) and Grupo Financiero Banorte (BMV:GFNORTE O, Mexico; LTM to 21 Apr 2026 — stale) appear in the comps workbook and map to NU's Colombia and Mexico exposure. Neither is named in NU's own filing and neither has a transcript here, so neither is added to the peer set on this run.

### 1b. Two near-misses that must NOT be counted as peer evidence (G5)

Both exist in the pool and both fail the test — recorded so a downstream agent does not mistake either for a peer call:

1. **An Itaú BBA analyst asks questions on NU's own Q2'26 call**, and another analyst benchmarks NU's >US$1bn quarterly net income against "Itaú Unibanco… around $1.1 billion" `[Q2 FY26 earnings call transcript, 13 Aug 2026, Q&A]`. Under **G5** an analyst's question, assertion or framing is **context only, never evidence** — and this is an analyst speaking on the *subject's* call, not Itaú's management speaking about Itaú. It is not a peer claim and cannot enter the matrix.
2. **`data/NU/NU_Holdings_Deep_Dive_15_Page_Memo_30_Aug_2026.pdf`** mentions Itaú three times (an NPL comparison, a TPV-share comparison). It is a **prior engine output carrying its own verdict** — a §4 tier-9 user note, verdict-stripped per §24 — and it is **not** a broker "peer earnings insight / call summary" of an Itaú call. It contains no Itaú management statement. It cannot supply the G5 broker-paraphrase route to Partial, and no number in this report comes from it.

---

## 2. Coverage of the Subject's Exposure

**The reporting (read-through-eligible) peer set is empty, so it covers 0% of NU's revenue, 0% of its segments, and 0% of its geographies. The uncovered majority is the entire company.**

Sized against `business-model/03_segment-map.md`, so the scale of what is unrepresented is explicit:

| NU exposure | Weight | Reporting-peer vantage in this pool |
|---|---:|---|
| **Banking — the whole Group** (NU's one operating and reportable segment under IFRS 8) | **100%** of revenue, **100%** of profit `[FY25 Form 20-F, Note 34, p.F-97]` | **None** |
| **Brazil** (Note-34 revenue base) | **90.9%** in H1 FY2026 (91.4% FY2025) `[Q2 FY26 Interim Report, Note 34(b), p.43; FY25 Form 20-F, Note 34(b), p.F-97]` | **None** — no Itaú, Bradesco, Santander Brasil, Banco do Brasil, BTG or Inter call in the pool |
| **Mexico** | **7.2%** in H1 FY2026 `[Q2 FY26 Interim Report, Note 34(b), p.43]` | **None** |
| **Other countries** (Colombia + United States) | **1.8%** in H1 FY2026 `[same]` | **None** |
| **Product: interest on loans + credit cards** | **80.3%** of the Note-34 base in H1'26 `[Q2 FY26 Interim Report, Note 6, p.16]` | **None** |

*The dominant exposure — Brazilian consumer credit, 90.9% of the disclosed revenue base and the segment where NU names five of its own competitors — has no reporting-peer vantage in this pool. Its read-through is **Not assessable**, and so is every other exposure, because the reporting peer set is empty.* This is the coverage-of-exposure rule at its limit: not "a confident read on the minority of the business", but **no read on any of it**.

Two structural caveats travel with these weights, carried verbatim from upstream rather than dropped: **profit by country is not disclosed at all**, so the dominance read rests on revenue; and roughly **a fifth to a quarter of group income (treasury income — 20.5% in H1'26) sits outside the geographic table entirely** `[03_segment-map.md §1c; Q2 FY26 Interim Report, Note 6(a) and Note 34(b), pp.16, 43]`. Even a fully stocked peer set could not have spoken to that treasury slice.

---

## 3. Usability Check

| Requirement | Available? (Y/N) | Detail |
|---|---|---|
| ≥1 usable competitor call (verbatim transcript OR permitted broker paraphrase, G5) | **N** | Zero. No `external/` folder; 0 of 115 manifest rows are `external: true`; all 20 transcripts are Nu Holdings' own; whole-corpus search for peer-call markers returned 0 hits. No broker peer-call summary either — the one in-pool memo is a prior engine output (tier 9), not a call paraphrase. |
| ≥2 distinct peer companies with verbatim transcripts (dispersion possible) | **N** | Zero distinct peer companies. Dispersion cannot be computed. |
| ≥1 peer reported the comparable window (read-through possible) | **N** | Two independent reasons: (a) no peer call is in the pool at all; (b) the target window (Jul–Sep 2026) has not yet ended as of 6 Sep 2026, so no company has reported it. |
| Peer set anchored by competitive-map | **Y** | `business-model/08_competitive-map.md` is present and built the peer set from NU's own `[FY25 Form 20-F, Item 3.D Risk Factors, pp.107–108]`. **The self-selected cap does not bind.** |
| Subject's next-filing basis known | **Y** | Q3 2026, three months ended 30 Sep 2026 with a nine-month cumulative column alongside; expected 12 Nov 2026; consensus already verified as standalone-quarter diluted EPS. |
| Subject segment-map available (for scope-matching) | **Y** | `business-model/03_segment-map.md` — one segment (100%), Brazil 90.9% of the H1'26 Note-34 revenue base. |
| Extraction health (only a FAILED extraction is a real gap, §27) | **Y — clean** | `totals.failures: 0`. The gap is intake, not extraction, and not language. |

---

## 4. Caps That Will Bind

| Trigger | Applies? (Y/N) | Cap |
|---|---|---|
| No usable call at all — no verbatim transcript AND no permitted broker paraphrase (G5) | **Y** | **Insufficient — read-through and triangulation Not assessable.** (A broker-paraphrase-only pool would be Partial, not this row — none exists here, so this row genuinely applies.) |
| Only one peer transcript | N (moot) | Read-through weight Low; dispersion Not assessable — subsumed by the row above (there are zero, not one). |
| No peer reported the comparable window | **Y** | Current-window read-through **Not assessable**. Binds twice over: no peer call in the pool, and the Jul–Sep 2026 window has not yet ended. |
| Dominant subject exposure uncovered by any peer | **Y** | The ~90.9% Brazil exposure — and in fact 100% of the group — has no reporting-peer vantage. That read-through is **Not assessable**; net read-through weight is **nil**, not merely capped. |
| Peer set self-selected (no competitive-map) | **N** | Does not bind — `08_competitive-map.md` is present and anchored to NU's own 20-F risk factors. |
| Broker-paraphrase only (no verbatim) | **N** | Does not bind — there is no broker paraphrase either. Tone/emphasis for every peer is Not assessable for the stronger reason that no peer source exists. |
| Analyst framing carried as peer evidence (G5) | **Guard, pre-armed** | The Itaú references inside NU's own Q2'26 call are **analyst questions** and are context only. Downstream agents must not convert them into peer claims. |

**Effect on the module.** Per MODULE_RULES ("no peer transcripts in the pool at all → Insufficient"), layers 01–04 have no input to work on: `01_peer-claim-extraction` has no peer to extract, `02_dimension-matrix` has no rows, `03_readthrough-to-subject` and `04_narrative-triangulation` are **Not assessable**. This is a **valid, decision-useful result — "no competitor calls were provided" — and the module does NOT abort.** `99` should publish the coverage gap as the chapter's finding and must not let any peer inference reach the master synthesizer, because none exists (G2 is not even reached).

---

## 5. Sufficiency Verdict

- **Verdict:** **Insufficient**
- **Reason:** The bound pool contains **zero competitor earnings-call transcripts and zero permitted broker peer-call paraphrases** — all 20 transcripts and all 115 manifest sources are Nu Holdings' own, with no `external/` intake folder — so there is no peer source from which a benchmark, a dispersion read, or a read-through could be built.
- **Coverage of subject:** **0%.** The reporting peer set is empty, so it speaks to none of NU's revenue — including the ~90.9% of the H1'26 Note-34 revenue base that sits in Brazil, the market in which NU's own 20-F names five direct competitors.
- **Active caps:**
  - No usable competitor call → read-through, narrative triangulation, and cross-sectional dispersion all **Not assessable**; the module's four jobs cannot be performed.
  - No peer reported the comparable window → current-window (Q3'26) read-through **Not assessable**; this binds independently of the intake gap, because the Jul–Sep 2026 quarter has not ended as of the run date.
  - Dominant exposure uncovered → net read-through weight is **nil**; no peer-derived evidence may enter `business-model/09_moat`, `07_business-quality`, or the master synthesizer's beat/miss view from this module.
  - Not binding, and worth stating so the cap list is honest: the **self-selected-peer cap does not apply** (the peer set is anchored to NU's own filing), and the **broker-paraphrase cap does not apply** (no paraphrase exists to strip).
- **Critical gaps:**
  1. **The single fixable gap — peer calls were never routed into NU's pool.** Q2'26 calls exist publicly for Itaú (ITUB4), Bradesco (BBDC4), Inter & Co (INTR), Santander Brasil (SANB11), Banco do Brasil (BBAS3), BTG Pactual (BPAC11) and PagSeguro (PAGS); the pool holds only vendor *comps rows* for them, which carry numbers and no management commentary. **Fix:** export the Capital IQ "Competitor Transcripts" set for NU's peer group and drop it under `EXTERNAL-INBOX/CapitalIQ/NU/…` or directly into `data/NU/external/<provider>/` — a loose drop routes by content into the competitor's own pool, where this module cannot see it. In a frozen chain a sibling-pool copy is a pointer only and cannot lift this run's weight.
  2. **The timing edge being forfeited is quantifiable.** On the vendor's own LTM income-statement filing dates, **8 of the 10 comp-set peers filed on or before NU's 13 Aug 2026 release** (Santander Brasil 29 Jul; Itaú, Bradesco and Inter 5 Aug; PagSeguro and BTG 11 Aug; Banco do Brasil 12 Aug) `[Capital IQ Quick Comparable Analysis → Financial Data, as-of 29 Aug 2026 — vendor export]`. *Inference — not from a filing:* a similar spread in Q3 would put most of these peers ahead of NU's **12 Nov 2026** date, which is exactly the calendar spread this module exists to exploit. Loading those calls before 12 Nov 2026 is the highest-value single data request from this module.
  3. **A permanent, non-fixable slice of the gap.** Caixa Econômica Federal, Banco C6, PicPay and Mercado Pago are state-owned, unlisted or subsidiary entities that will never hold a call. No future intake covers them; that part of the Brazilian competitive picture stays **Not assessable** by this module in every run.
  4. **Even a complete peer set would not span the whole company.** Roughly a fifth of group income (20.5% in H1'26 — treasury income) sits outside the geographic revenue table entirely, and **profit by country is not disclosed at all** `[Q2 FY26 Interim Report, Note 6(a) and Note 34(b), pp.16, 43]`. A future benchmark must carry that qualifier rather than present peer coverage of customer-facing revenue as coverage of NU's earnings power.
  5. **Not a gap, stated so it is not miscounted (§27):** extraction was clean (0 failures), and no source was lost to language. A Portuguese-language Itaú or Bradesco call would be read and translated at full tier-6 weight. The deficiency here is intake, nothing else.
