# Competitive-Intelligence Module — Operating Rules

These are the operating rules for the `competitive-intel` module's agents. Every agent in this module reads the repo-root `CLAUDE.md` (cross-cutting doctrine) FIRST, then this file, and applies both. Where this file is stricter than `CLAUDE.md`, the stricter rule wins (§23). This file adds module-specific detail; it does not relax any standard set in the doctrine.

---

## Scope

This module reads the earnings-call transcripts of a company's COMPETITORS and benchmarks them, apples-to-apples, against the subject company. It exists because a competitor's own words about the same end-market are the one independent check on the subject's self-serving narrative, and because a competitor who reports *earlier* than the subject is a leading indicator of the subject's not-yet-reported quarter.

It does FOUR jobs, in rising order of value:

1. **Read-through (the timing edge).** A peer that has already reported the comparable period is evidence about the subject's next print. This is the module's highest-value output.
2. **Narrative triangulation (the cross-examination).** The subject's management claims about the shared market are stress-tested against what every peer said about that same market.
3. **Cross-sectional dispersion (the outlier signal).** On each benchmark dimension, who is uniquely upbeat or uniquely worried — named, with quotes.
4. **Market decomposition.** The shared end-market's real behaviour (demand, pricing, input costs, channel inventory) reconstructed from several independent vantage points.

This module does NOT:

- name new competitors — it INHERITS the peer set from `business-model/08_competitive-map.md` (may add end-market peers, flagged as self-selected);
- analyse the subject company's OWN earnings — that is the `earnings` module. This module reads the subject only to triangulate its narrative against peers;
- produce valuations, ratings, target prices, scenarios, or trade ideas;
- re-score the subject's moat or competitive intensity — it FEEDS evidence to `business-model/09_moat` and `07_business-quality`, it does not replace them.

If the invocation asks for anything outside a subagent's scope, produce the standard report and add: `Out-of-scope request received: [describe]. Route to the appropriate specialist.`

---

## The Five Guardrails (Hard Rules)

A competitor-transcript benchmark walks straight into five doctrine failures. In this module the guardrails ARE the analysis — a benchmark that violates any of them is wrong even when the arithmetic is clean. Every agent enforces all five; the synthesis (`99`) runs one explicit pass over them before publishing.

### G1 — Normalise the period before you compare (CLAUDE.md §27, §17)

Peers report on different fiscal calendars and on different interim BASES. A US peer files a **standalone quarter** (10-Q); a Chinese/Japanese/Korean peer often files a **cumulative half-year or nine-month** report; an Indian peer files a **standalone quarter under SEBI-LODR**; a European peer often files a **half-year**. Comparing "Q2 vs Q2" by fiscal LABEL is the §27 bad-extraction error at scale.

- **Anchor every peer statement to a common CALENDAR window** (e.g. "the ~3 months ended ~June 2026"), stated explicitly, alongside the peer's native fiscal label.
- **State each peer's interim basis** (standalone / cumulative / both-side-by-side). Where a peer's figure is cumulative and you need the standalone period, back out the already-reported stub and show the arithmetic (§27's cumulative-vs-standalone rule).
- **Never compare across mismatched windows silently.** Where two peers' most recent calls cover different windows, say so on the row; do not force them into one column.
- A peer whose comparable-window call has NOT been published yet contributes only historical / structural context — never the current-quarter read-through (see the Timing Rule below).

### G2 — A peer read-through is INFERENCE about the subject, and stays inference (CLAUDE.md §3, §6)

A peer's transcript is a **tier-6** source (§4) about **that peer's own company**. Using it to say something about the SUBJECT is an **inference** — §6 **Level 1** — about a different company. The qualifier can never fall off on the way up the stack (§3).

- "Whirlpool said US appliance demand fell 8% in the June quarter" is a tier-6 fact about Whirlpool.
- "Therefore the subject's US appliance revenue will fall" is a Level-1 INFERENCE about the subject, and must be labelled as one on the line it appears (`Inference from peer read-through — not a filing fact about {SUBJECT}`).
- A read-through NEVER hardens into a fact about the subject, NEVER sets a rating on its own, and NEVER lifts conviction past what the §6 ladder allows for Level-1 evidence. It INFORMS the beat/miss setup and the candor read; it does not decide them.

### G3 — Compare only overlapping SCOPE (CLAUDE.md §9)

"Demand is strong" in North-America premium is not the same claim as "demand is strong" in India mass-market. A base rate — and a peer comparison is a base rate — must match the claim's unit: same metric, same level, same period.

- Every extracted peer claim carries **scope tags**: geography, segment/business line, and product tier.
- The benchmark compares only claims whose scope OVERLAPS the subject's exposure (or the other peer's), and flags every scope mismatch rather than lining up non-comparable claims as if they were comparable.
- A peer whose business mix barely overlaps the subject's is a weak read-through even on a matched dimension — say so.

### G4 — Currency discipline; prefer ratios (CLAUDE.md §15)

Peers report in USD, INR, EUR, KRW, CNY, and more. Growth rates, margins, and margin *changes* are currency-independent; absolute levels are not.

- **Prefer rate-of-change and margin comparisons** across peers (YoY growth, margin in %, margin change in basis points). These are the honest apples-to-apples comparison and sidestep the FX trap.
- Any cross-peer comparison of an ABSOLUTE level (revenue, ASP in currency) carries its FX date and rate (§15) and states the standard/period basis. Never compare two peers' absolute levels without it.
- Growth = (current − prior) / prior; margin changes in basis points; matched-basis ratios only (§15).

### G5 — Verdict-strip the analysts (CLAUDE.md §24, frameworks/EXTERNAL_DATA.md)

A transcript is management's ANSWERS (tier-6 evidence) plus analysts' QUESTIONS (context only).

- Only **management statements** on a peer call are tier-6 evidence about that peer.
- An **analyst's question, assertion, or framing** is context — never evidence. Do not carry an analyst's opinion as if the peer's management said it.
- A broker "peer earnings insight / call summary" note is a **verdict-stripped paraphrase** (a transcript-proxy, §24): strip its Rating / Target Price / "vs our estimate", keep only its summary of what the peer's management said, label it `via unverified sell-side paraphrase`, and never treat it as a verbatim peer transcript.

---

## Source Hierarchy (module refinement — consistent with CLAUDE.md §4)

Route by ROLE — the results disclosure and the call are strong at opposite things, so "most trusted" differs for a figure vs for commentary:

**For a peer's reported FIGURES (the numbers):**
1. **Peer earnings press release / results filing** — the peer's own NUMBERS anchor. In ANY conflict with the call, the filed/released figure wins (§4/§5).
2. **Peer verbatim earnings-call transcript** — quotes the same numbers; use it for a figure ONLY where the release does not give it.

**For a peer's management COMMENTARY, drivers, and tone (the colour):**
1. **Peer verbatim earnings-call transcript** (CIQ / company) — tier 6 about that peer, full trust for what its management said (prepared remarks + Q&A). The primary source for driver colour and tone.
2. **Broker "peer earnings insight / call summary"** — a verdict-stripped transcript-proxy (G5). Commentary role only; never the verbatim call, never for the peer's tone/candor.

(A peer investor deck / results presentation sits at tier 7.) **The subject's own transcript and filings** are read ONLY to triangulate the subject's narrative against peers (G2 still applies in reverse: the subject's claim is a claim, the peers are the cross-check).

Rules:

- **A peer's reported NUMBER is cited from its results filing / press release, not from the transcript, in any conflict (§4/§5).** The transcript is cited for what management SAID, never re-cited as the source of a figure the release already carries.
- A peer transcript is tier 6 about the PEER and Level-1 inference about the SUBJECT (G2). Never cite it as a source ABOUT the subject.
- A peer transcript NEVER substitutes for a filing the subject's own sufficiency rules require. It is enrichment for the benchmark, not a unit that fills a missing-subject-filing slot (§11).
- When sources conflict, use the more conservative reading (§4). Do not give the subject's narrative the benefit of the doubt because a peer's words are ambiguous.

---

## Where the peer transcripts come from (the data path)

Peer transcripts arrive the same way every other document does: the user downloads them from Capital IQ (the "Competitor Transcripts" tab returns the peer set's calls) into the Google-Drive pool, and the external-data router (`frameworks/EXTERNAL_DATA.md`, `.claude/tools/ingest_external.py`) files them. This module reads them from two places, in this order:

1. **The subject pool's external area — injected `<DATA_PATH>/external/<provider>/`.** This is the only filesystem path this module reads; cite it logically as `data/{SUBJECT}/external/<provider>/`. Its exact `<GENERATION_ROOT>/manifest.json` row carries `external: true` and (when a sidecar exists) `provenance`. See `frameworks/EXTERNAL_DATA.md` for the `peer_transcript` source-type mapping (tier 6, about the named peer).

   **How to drop a competitor call so it lands here (required).** A competitor call names the COMPETITOR, so a *loose* inbox drop is content-detected and routed to the competitor's OWN pool (`data/<PEER>/`), where this module — which reads the SUBJECT's `external/` — will not see it. To benchmark {SUBJECT}, the call must be placed in {SUBJECT}'s pool: either **force-route it** by dropping under `EXTERNAL-INBOX/<Provider>/{SUBJECT}/…` (the forced `<Provider>/<TICKER>/` layout routes by folder, not by content), or **drop it directly** into `data/{SUBJECT}/external/<provider>/`. A loose drop that lands in the competitor's pool is a sibling-pool pointer, not this run's evidence (Auditable-corpus rule below). This is the one workflow step the operator must know; the CIQ "Competitor Transcripts" export for {SUBJECT}'s peer set should be dropped under {SUBJECT}.
2. **A peer's OWN pool — logical `data/<PEER>/` — is NOT in this run's audit corpus.** `extract_pool.py` (MODULE_PIPELINE Step 1.5) and `verify-evidence` admit only the subject snapshot exposed as `<DATA_PATH>`, so a peer call that lives only in a sibling pool never enters this run's exact `<GENERATION_ROOT>/manifest.json` or verification corpus. In a frozen chain never inspect the sibling live pool; its existence is only an operator-side POINTER for a later intake. To USE it in a future run, copy or route it into the subject's logical `data/{SUBJECT}/external/<provider>/` before that later generation is admitted. A claim absent from this run's `<DATA_PATH>` is unverifiable: do not cite it or let it lift the read-through weight.

**Auditable-corpus rule (hard).** Every peer quote or number a specialist cites MUST trace to a document under the injected `<DATA_PATH>` (top level or `external/**`) and the exact `<GENERATION_ROOT>/manifest.json`; cite that document logically as `data/{SUBJECT}/...`. A peer call outside `<DATA_PATH>` is not evidence for this run and must not be read as a fallback.

Identify each peer from the transcript's OWN content (the company name on the cover / first lines / speaker list) and cross-check it against the named competitors in `business-model/08_competitive-map.md`. A transcript for a company NOT in the peer set is either a new end-market peer (add it, flagged self-selected) or off-topic (note and skip). **Never invent a peer transcript, a peer quote, or a peer number — if it is not in a document in the pool, it does not exist for this module.**

Language is not a data gap (§27): a peer call in Mandarin, Korean, Japanese, German, or any language is read and translated (figures verbatim), tiered by what it IS, never marked "missing" or "opaque".

---

## Timing Rule (Hard Rule)

The read-through's whole edge is the calendar spread in reporting dates. Date-gate every peer against the SUBJECT's next-filing window (G1), and classify each into one of THREE states — the binary "reported / not reported" is not enough, because a peer can report a period that only PARTLY overlaps the subject's window:

- **Reported — full window.** The peer's published call covers the same calendar window as the subject's next filing, on a comparable basis (e.g. both cumulative H1, or both a standalone quarter for the same three months). Full read-through weight (subject to scope, G3).
- **Reported — partial / sub-window.** The peer's published call covers only PART of the subject's window — the classic case is a peer filing a **standalone quarter** when the subject files a **cumulative half-year** (§27): the peer's Q2 call reads into the *second quarter of* the subject's half only, not the whole half. Mark it eligible for a read-through **into the covered sub-period only**, flag on every affected line that the rest of the subject's window is not covered by this peer, and — where the peer's earlier stub call for the same window IS in the pool — reconstruct the full window with the §27 cumulative-stub arithmetic and show it. Never silently treat a sub-window call as a full-window read.
- **Not yet reported — context only.** The peer's comparable-window call is not out as of the run date: it contributes historical / structural context, clearly separated from the current-window read-through, never a current read.

A read-through built on a peer that has not actually reported the covered window is fabricated timing. State each peer's state plainly in the calendar table.

**A no-transcript peer is NOT a Timing state.** A private company (or any competitor that will never file a call) is a **coverage gap**, handled by the Coverage-of-Exposure rule — never tabulate it as "not-yet reported / context-only", which is reserved for a company whose call is simply not out yet.

**Falsifier-basis rule (the sub-window trap).** When a **sub-window** read targets a period the subject will NOT isolate in its next filing — the classic case being a peer's standalone quarter read against a subject that files only a cumulative half — the subject's reported line **blends the covered sub-period with the uncovered stub** (e.g. the subject's cumulative-H1 line contains both the Q2 the peer covered and the Q1 no peer covered). Say so on the falsifier: the read can be only **partially** checked against the subject's print, because the subject never reports the isolated sub-period the read speaks to. Never present a sub-quarter read-through as if the subject's cumulative print cleanly confirms or refutes it.

---

## Coverage of the Subject's Exposure (Hard Rule)

A read-through is only as good as the share of the subject it actually SPANS. The reporting peer set almost never covers the whole subject — a peer set of Western appliance makers says nothing about a subject whose revenue is mostly domestic-China, however clean each peer read is.

- Every run states, up front, **what fraction of the subject's revenue / segments / geographies the reporting (read-through-eligible) peer set actually covers**, using the subject's own `segment-map` weights. Name the uncovered majority explicitly.
- Where a large share of the subject's exposure has NO reporting-peer vantage (a dominant segment or geography with only a private / non-reporting / absent competitor), the read-through for that exposure is **Not assessable** — say so, and cap the *net* read-through weight accordingly. A confident read on the minority of the business is not a confident read on the business.
- This is the generalisation of the "private China rival ⇒ the China core is unrepresented" gap: make the coverage-of-exposure statement a required output, not a lucky catch.

---

## Confidence and Weight are Two Different Axes (Hard Rule)

A read-through row carries TWO numbers that must never be merged, because they answer different questions. Reporting only one — or blending them into a single High/Med/Low — is the defect this rule exists to prevent.

1. **Direction confidence** — a CLAUDE.md §10 numeric band (with its basis: empirical / named base-rate / judgment). This answers *"how likely is the DIRECTION of this read-through correct?"* A peer read across companies is almost always **judgment** (a handful of observations, a different company). **Hard ceiling:** because a peer read-through is Level-1 inference *about a different company* (§6, G2), its Direction confidence is capped at **"Likely (60–75%)"** — never "Very likely" or above, however many peers corroborate it. Corroboration and window match raise the read-through's *weight*, not the ceiling on its *direction* probability.
2. **Read-through weight** — High / Med / Low. This answers *"how much should this read-through move the subject view?"* and is set by three factors: **scope overlap** (G3), **window match** (full / partial-sub-window, Timing Rule), and the **number of corroborating peers** (dispersion). A single peer, a partial window, or a Medium/Low scope overlap each pull the weight down.

The MODULE_RULES score caps below act on **weight**, never on the §10 probability — a "Low-weight" read-through can still have a directionally-confident band; the two coexist without contradiction. The `99` synthesis and the master synthesizer (which absorbs this module into its beat/miss & scenario view, §22) size a read-through by its **weight** and read its **direction** from the §10 band. Never collapse the two into one figure, and never let a Low weight silently rewrite a §10 band (or vice-versa).

---

## Score Caps (applied by the `99` synthesis; never averaged away — §11, §12)

All scores are out of 100 (§12). Any score where higher = worse is INVERTED and must be flagged inverted in the header of every table that uses it.

Caps act on the read-through **weight** (High/Med/Low), never on the §10 direction band (see the two-axes rule above).

| Trigger | Cap |
|---|---|
| No peer transcripts in the pool at all | Triage `00` returns **Insufficient** — module does not run (a valid, decision-useful result: "no competitor calls provided"). |
| Only ONE peer transcript available | Read-through weight capped **Low**; dispersion (job 3) marked *Not assessable* (needs ≥2 peers). |
| No peer with a comparable-window call already published (full or sub-window) | Current-window read-through = *Not assessable*; only structural context is produced. |
| A dominant segment / geography of the subject has NO reporting-peer vantage (coverage-of-exposure rule) | The read-through for that exposure = *Not assessable*; the NET read-through weight is capped to reflect the uncovered majority. |
| Peer set is self-selected (no `competitive-map` upstream) | Flag it; cap net read-through weight at **Medium** — the peer set was not independently established. |
| A read-through dimension rests on a peer whose scope barely overlaps the subject (G3), or only a partial / sub-window call (Timing Rule) | That dimension's weight capped **Low**; say why (scope and/or window). |
| Peer commentary available ONLY via broker paraphrase (no verbatim, G5) | That peer's tone/emphasis *Not assessable*; its read-through flagged `via unverified sell-side paraphrase`. |

Data sufficiency caps conviction and never silently lifts it. A completed benchmark does not raise the subject's rating on its own (G2).

---

## Style Rules (CLAUDE.md §21)

- Plain English, short sentences. The first time a finance term appears, keep the term and its number and add a short plain meaning in a clause. Plain is not vague — never drop a number or a citation.
- Every material claim → evidence in the same row/paragraph, cited `[<Peer> Q_ FY__ transcript, prepared remarks / Q&A]` or the peer's local-equivalent document and period (§5, §27). The number must literally appear in the cited source (§5).
- Numbers beat adjectives. Label all inference: `Inference — not from a filing.`

### Banned phrases (unless paired with a specific cited quote AND number in the same sentence)

The over-reading traps this module is prone to:

- "peers confirm" / "confirmed by peers"
- "the read-through is clear" / "obvious read-through"
- "in line with peers" / "consistent with peers"
- "peers are cautious" / "peers are upbeat" (as a bare claim, with no named peer and quote)
- "industry-wide" / "sector-wide" (as a bare generalisation from a partial peer set)
- plus every phrase banned in `CLAUDE.md` §21 and the general modules.

A dispersion or read-through claim with no named peer, no quote, and no number is not a finding — it is a vibe. Delete it or evidence it.

---

## Jurisdiction Awareness (CLAUDE.md §27)

Peers live in many markets. Detect each peer's listing jurisdiction, reporting standard, currency, and fiscal-year end, and read its LOCAL-equivalent call and results document — do not expect a US 10-Q. An Indian, Chinese, Korean, or European peer is the normal case. Non-English peer calls are read and translated; figures transcribed verbatim (§27, §5).

---

## Cross-Module Inputs

- `business-model/08_competitive-map.md` — the named peer set (REQUIRED for a full benchmark; if absent, self-select the peer set from filings/pool and flag it, and bind the self-selected cap above).
- `business-model/03_segment-map.md` — the subject's segments, to scope-match peer claims (G3).
- `earnings/*` (when this module runs after earnings, or for the subject's own transcript) — the subject's own management claims, for triangulation (job 2). If unavailable, read the subject's transcript directly from its pool and say so.

If a cross-module input is missing, the affected agent states it explicitly and proceeds with degraded confidence.

---

## Inputs Every Subagent Receives

- `TICKER` — the SUBJECT company's ticker
- `DATA_PATH` — exact filesystem evidence root injected by `MODULE_PIPELINE`; cite files under it with the logical label `data/{TICKER}/...`
- `GENERATION_ROOT` — exact immutable extraction generation injected by `MODULE_PIPELINE`; all manifest, corpus, CIQ, relationship, and extract reads stay inside it
- `OUTPUT_PATH` — `analyses/{TICKER}_{DATE}/competitive-intel/{NN}_{name}.md`
- `DATE` — today's date
- `UPSTREAM_INPUTS` — paths to this module's and cross-module outputs this agent depends on (may be empty)

Read these from the invocation message. Never hardcode a ticker, date, or path.

---

## Chat Confirmation Format

Every subagent ends its turn with:

```
Agent: {name}
Output: {path}
Verdict: {agent-specific verdict line}
Biggest finding: {one line}
```

Add lines only if applicable: `Out-of-scope: ...`, `Insufficient data: ...`, `Partial data: ...` (name which data is missing and which cap was applied).

---

## Subagent List & Execution Layers

Layer 0 (sequential; `fail_fast: false` — "no peer calls" is a valid result, so the module always produces its chapter):
- `00_competitive-intel-triage` — inventories peer transcripts, resolves the peer set + per-peer calendar-window / basis / currency / timing map, states coverage-of-exposure, issues Sufficient / Partial / Insufficient (never aborts the run).

Layer 1 (parallel):
- `01_peer-claim-extraction` — per peer, the standardised claim set on the fixed benchmark dimensions, each with scope tags, normalised + native period, currency, speaker, and citation.

Layer 2:
- `02_dimension-matrix` — the peer × dimension matrix aligned on common window + overlapping scope; per-dimension consensus and named-outlier dispersion.

Layer 3 (parallel, read `02`):
- `03_readthrough-to-subject` — the current-quarter read-through from already-reported peers, every line labelled inference (G2).
- `04_narrative-triangulation` — the subject's own claims cross-examined against the peer matrix; contradictions named and routed to candor + disconfirmation.

Layer 4 (sequential, synthesizer):
- `99_competitive-intel-synthesis` — reads all of the above, runs the five-guardrail pass, applies caps, writes the module chapter.

If an upstream output is missing, the dependent subagent notes it explicitly and proceeds with what is available.
