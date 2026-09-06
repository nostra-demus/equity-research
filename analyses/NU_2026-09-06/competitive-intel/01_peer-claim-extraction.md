# Peer Claim Extraction — NU (Nu Holdings Ltd.)

**Verdict: Insufficient — no usable competitor call in the pool.**

**Evidence binding.** This run is bound to the frozen extraction generation `f9081efa…09f2be`. Every read below resolved through that exact generation's `manifest.json` and its extract tree, and files are cited logically as `data/NU/...`. No sibling live pool (`data/ITUB/`, `data/BBDC/`, `data/INTR/`, or any other) was inspected or cited — in a frozen chain that is prohibited, and such a file is not in this run's audit corpus in any case.

**The triage's inventory was re-verified before it was accepted, not merely inherited.** `00_competitive-intel-triage.md` reports zero competitor transcripts; three independent checks against the bound generation agree:

1. The manifest carries **115 sources with 0 failures** (`totals.failures: 0`) and **0 rows flagged `external: true`**. There is no `external/` area in this pool, so the `frameworks/EXTERNAL_DATA.md` intake path that delivers competitor calls was never used for this subject.
2. All **20** transcript rows resolve to Nu Holdings' own calls — Q4 2021 through Q2 2026 (19 quarterly calls) plus one Shareholder/Analyst call. Not one names another issuer.
3. A whole-corpus regular-expression search for peer-call markers across the generation's 25,397,747-character `corpus.txt` — the pattern set covering `Itaú|Bradesco|Inter & Co|Santander|Banco do Brasil|BTG|PagSeguro|StoneCo` followed by *Earnings Call / Conference Call / Results Call* — returned **0 matches**, and a parallel search for broker call-summary markers (`earnings call insight`, `call summary`, `key takeaways from … call`) returned **0 matches**.

So neither route to a claim block exists: no verbatim peer transcript, and no permitted broker paraphrase of a peer call (G5). Under the dependency rule this is the one condition that stops extraction — and only extraction. The module continues; `02`, `03` and `04` inherit an empty peer set and must report the gap rather than fill it.

**This is an intake gap, not an extraction gap and not a language gap (§27).** Extraction was clean at 0 failures, and no source was lost to language. A Portuguese-language Itaú or Bradesco call would be read and translated at full tier-6 weight and would not be a gap. What is missing is that no competitor call, in any language, was ever routed into NU's pool.

---

## Peer Set

The peer set is anchored to NU's own filing by `business-model/08_competitive-map.md`, which built it from *"Our main competitors in the Brazilian consumer credit space include Itaú Unibanco S.A., Banco Bradesco S.A., Banco Santander (Brasil) S.A., Caixa Econômica Federal and Banco do Brasil S.A. … Banco BTG Pactual S.A., Banco Inter S.A., Banco C6 S.A. and XP Inc. … MercadoPago…, PicPay…, PagSeguro Digital Ltd. and StoneCo Ltd."* `[FY25 Form 20-F (filed 8 Apr 2026), Item 3.D Risk Factors, pp.107–108]`. It is not self-selected, so that cap does not bind here.

Every line below is a **no-transcript** line. There is no native call label, no normalised window, no interim basis and no timing state to record, because no call exists in this pool for any of them. Following the module's Timing Rule, a peer with no transcript is a **coverage gap** and is deliberately NOT tabulated as "not-yet reported / context only" — that state is reserved for a company whose call is simply not out yet.

| Peer | Ticker / venue | Std / currency / FY-end | Native call label | Normalised window | Interim basis | Timing state | Status in this pool |
|---|---|---|---|---|---|---|---|
| Itaú Unibanco Holding S.A. | BOVESPA:ITUB4; ADR NYSE:ITUB | IFRS + BCB rules / BRL / 31 Dec | — | — | — | n/a — coverage gap | **No transcript** |
| Banco Bradesco S.A. | BOVESPA:BBDC4; ADR NYSE:BBD | IFRS + BCB rules / BRL / 31 Dec | — | — | — | n/a — coverage gap | **No transcript** |
| Banco Santander (Brasil) S.A. | BOVESPA:SANB11 | IFRS + BCB rules / BRL / 31 Dec | — | — | — | n/a — coverage gap | **No transcript** |
| Banco do Brasil S.A. (state-controlled) | BOVESPA:BBAS3 | IFRS + BCB rules / BRL / 31 Dec | — | — | — | n/a — coverage gap | **No transcript** |
| Banco BTG Pactual S.A. | BOVESPA:BPAC11 | IFRS + BCB rules / BRL / 31 Dec | — | — | — | n/a — coverage gap | **No transcript** |
| Inter & Co, Inc. | NasdaqGS:INTR (B3 BDR) | IFRS / BRL / 31 Dec | — | — | — | n/a — coverage gap | **No transcript** |
| PagSeguro Digital Ltd. | NYSE:PAGS | IFRS / BRL / 31 Dec | — | — | — | n/a — coverage gap | **No transcript** |
| StoneCo Ltd. | NasdaqGS:STNE | IFRS / BRL / 31 Dec | — | — | — | n/a — coverage gap | **No transcript** |
| XP Inc. | NasdaqGS:XP | IFRS / BRL / 31 Dec | — | — | — | n/a — coverage gap | **No transcript** |
| Caixa Econômica Federal | unlisted, state-owned | — | — | — | — | n/a — permanent coverage gap | **No transcript; will never file a call** |
| Banco C6 S.A. | unlisted | — | — | — | — | n/a — permanent coverage gap | **No transcript; will never file a call** |
| PicPay Instituição de Pagamento S.A. | unlisted | — | — | — | — | n/a — permanent coverage gap | **No transcript; will never file a call** |
| Mercado Pago Instituição de Pagamento Ltda | subsidiary of MercadoLibre | — | — | — | — | n/a — permanent coverage gap | **No transcript; no standalone call** |

Peer identities, venues and reporting bases carried from `00_competitive-intel-triage.md` §1a, which sourced them from `[Capital IQ Quick Comparable Analysis → Financial Data (Nu Holdings comp set), as-of 29 Aug 2026, USD — vendor export]` and `[Capital IQ Competitors export (NU), as-of Aug-2026 — vendor export]`. Both are **vendor comps rows, not calls**: they carry prices, revenue, EPS and tangible book, and carry no management commentary of any kind. Nothing in either can populate a benchmark dimension.

**Two candidate end-market peers were not added.** Grupo Cibest S.A. (BVC:CIBEST, Colombia) and Grupo Financiero Banorte (BMV:GFNORTE O, Mexico) appear only as vendor comps rows and are not named in NU's own filing. Adding them would be a self-selected addition, and neither has a transcript here in any case, so the question is moot on this run.

---

## Per-Peer Claim Blocks

**None. There is no claim block for any peer, because there is no peer management statement anywhere in the bound pool.**

The eleven fixed benchmark dimensions — demand, pricing / ASP, volume / units, input costs, gross / operating margin trajectory, channel / dealer inventory, capacity / capex, market-share claims, guidance direction, capital return, and the single biggest risk management named — are **not addressed by any peer**, for every peer in the set above. That is a statement about the evidence, not about the competitors: each of the nine listed companies with a public listing does hold real earnings calls that discuss these dimensions; none of those calls was routed into NU's pool.

Under the module's hard rule — *"Never invent a peer transcript, a peer quote, or a peer number — if it is not in a document in the pool, it does not exist for this module"* — no dimension is filled by inference, by a vendor number, or by anything the subject's own management said about a competitor. An empty table is the correct output.

**What was searched and rejected as a substitute, so a downstream agent does not reach for it:**

| Candidate in pool | What it actually is | Why it cannot produce a claim block |
|---|---|---|
| `Capital IQ Quick Comparable Analysis → Financial Data` (comp set incl. ITUB4, BBDC4, BBAS3, BPAC11, INTR, PAGS), as-of 29 Aug 2026 | Tier-5 vendor comps export | Numbers only — no management commentary, no speaker, no call. It can never answer "what did management say", which is this agent's entire question. |
| `Capital IQ Competitors export (NU)`, as-of Aug-2026 | Tier-5 vendor export | Same; additionally stale and internally inconsistent (it reports Inter & Co at US$158.6m against the comps workbook's US$1,279.1m for the same date), per `08_competitive-map.md`. |
| `Capital IQ Suppliers / Customers` relationship rows naming Itaú, Santander Brasil, BTG | Tier-5 deterministic relationship graph | Ownership and counterparty rows, e.g. Itaú Unibanco Holding S.A. disclosed against Nu Pagamentos S.A. Not a call, not a claim, and carries no period commentary. |
| `data/NU/NU_Holdings_Deep_Dive_15_Page_Memo_30_Aug_2026.pdf` | A prior engine output — §4 tier-9 user note, verdict-stripped per §24 | It mentions Itaú in an NPL comparison and a card-TPV-share comparison, but it contains **no Itaú management statement**. It is not a broker "peer earnings insight / call summary", so it cannot supply the G5 broker-paraphrase route to a capped Partial read. No number in this report comes from it. |
| The subject's own Q2 FY26 call | Tier-6 about **NU**, not about a peer | See the strip section below. |

---

## Analyst Assertions Stripped (G5)

A transcript is management's answers plus analysts' questions; only the former is evidence, and only about the company whose call it is. Three items in this pool sit close enough to a peer claim that they are recorded here explicitly, so no downstream agent converts one into a peer benchmark row. All three are excluded.

| Excluded item | Nominal peer touched | What it actually is | Why it is stripped |
|---|---|---|---|
| *"I was checking here at Itau Unibanco, one of the leading banks in Brazil. And when I look to the retail operation, it is around $1.1 billion, right? So you are very close to that."* — Yuri Rocha Fernandes, JPMorgan Chase & Co, Research Division `[NU Q2 FY26 earnings call transcript, 13 Aug 2026, Q&A]` | Itaú Unibanco | An **analyst's** framing of an Itaú figure, spoken on the **subject's** call | G5: an analyst's question, assertion or framing is context, never evidence. It is not Itaú management speaking about Itaú, and it is not on Itaú's call. It cannot enter the matrix as an Itaú claim. |
| The full two-part question on the government renegotiation portfolio and unsecured-lending pace — Pedro Leduc, Itaú Corretora de Valores S.A., Research Division `[NU Q2 FY26 earnings call transcript, 13 Aug 2026, Q&A]` | Itaú (as employer only) | An **analyst** employed by Itaú BBA asking about **NU** | The speaker's employer is not the subject of the claim. Nothing here is a statement by Itaú's management about Itaú's business. Recorded because the "Itaú" label on the speaker line is the exact trap this section exists to prevent. |
| *"A lot of the incumbent banks, if you look at the ARPAC, they are at 40 to 45."* — David Velez-Osomo, Founder, Chairman & CEO, Nu Holdings `[NU Q2 FY26 earnings call transcript, 13 Aug 2026, Q&A]` | Unnamed "incumbent banks" | The **subject's** management characterising competitors | Not a peer claim: it is NU's own narrative about peers, with no peer named and no peer source. It belongs to `04_narrative-triangulation` as a **subject** claim to be cross-examined — and on this run there is no peer call against which to test it. It must not be entered as a peer's own market-share or pricing statement. |

No other analyst assertion in the pool touches a peer, because no peer call is present for analysts to have spoken on.

---

## Extraction Notes

- **Transcripts that could not be read (a real gap): none.** The bound generation reports `totals.failures: 0` across 115 sources. Nothing in this pool was lost to a failed, corrupt or illegible extraction.
- **Non-English calls read and translated: none, and none needed.** No peer call of any language is present. Language is explicitly not the deficiency here (§27) — a Portuguese Itaú, Bradesco, Santander Brasil, Banco do Brasil or BTG call would be read, translated, and weighted at full tier 6, and would not be recorded as a gap.
- **Peers with no transcript in the pool: all thirteen.** Nine of them (ITUB4, BBDC4, SANB11, BBAS3, BPAC11, INTR, PAGS, STNE, XP) do hold public earnings calls, so their absence is a **fixable intake gap**. Four of them (Caixa Econômica Federal, Banco C6, PicPay, Mercado Pago) are state-owned, unlisted or subsidiary entities that will never hold a call, so their absence is a **permanent coverage gap** that no future intake fixes.
- **The fix, stated precisely, because the routing step is where this normally fails.** A competitor call names the competitor, so a loose inbox drop is content-detected and filed into that competitor's own pool, where this module cannot see it. To be usable here, the Capital IQ "Competitor Transcripts" export for NU's peer group must be force-routed under `EXTERNAL-INBOX/CapitalIQ/NU/…` or dropped directly into `data/NU/external/<provider>/`, and admitted in a later generation. Until then, a sibling-pool copy is an operator-side pointer only and cannot lift this run's weight.
- **Timing, for whoever loads the calls next.** On the vendor's own LTM income-statement filing dates, 8 of the 10 comp-set peers filed on or before NU's 13 Aug 2026 release — Santander Brasil 29 Jul; Itaú, Bradesco and Inter 5 Aug; PagSeguro and BTG 11 Aug; Banco do Brasil 12 Aug `[Capital IQ Quick Comparable Analysis → Financial Data, as-of 29 Aug 2026 — vendor export]`. *Inference — not from a filing:* a similar spread in Q3 would put most of these peers ahead of NU's expected 12 Nov 2026 date. That calendar spread is the read-through edge this module exists to capture, and it is the one being forfeited.
- **A second, independent reason there is no current-window read even if the calls arrive late.** NU's next filing covers the three months ended 30 Sep 2026 (published alongside a nine-month cumulative column), expected 12 Nov 2026 `[Capital IQ Events Calendar export, timeframe 2026 — "Nov-12-2026 12:30 PM · Earnings Release Date" — vendor export]`. As of the run date, 6 Sep 2026, that window has not ended, so no company anywhere has reported it. Even a fully stocked peer set would be "not yet reported" for this window today.
- **Downstream effect.** `02_dimension-matrix` has no rows to align and no dispersion to compute; `03_readthrough-to-subject` and `04_narrative-triangulation` are Not assessable. No peer-derived evidence may reach `business-model/09_moat`, `business-model/07_business-quality`, or the master synthesizer's beat/miss view from this module — G2 is never reached, because there is no peer statement to infer from.
