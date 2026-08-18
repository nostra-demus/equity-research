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

Most trusted to least, for THIS module's sources:

1. **Peer verbatim earnings-call transcript** (CIQ / company) — tier 6 about that peer, full trust for what its management said. Prepared remarks + Q&A.
2. **Peer earnings press release / results filing** — the peer's own NUMBERS anchor (thin on driver colour). Cite it for the peer's own figures.
3. **Peer investor deck / results presentation** — tier 7.
4. **Broker "peer earnings insight / call summary"** — a verdict-stripped transcript-proxy (G5). Commentary role only; never the verbatim call, never for the peer's tone/candor.
5. **The subject's own transcript and filings** — read ONLY to triangulate the subject's narrative against peers (G2 still applies in reverse: the subject's claim is a claim, the peers are the cross-check).

Rules:

- A peer transcript is tier 6 about the PEER and Level-1 inference about the SUBJECT (G2). Never cite it as a source ABOUT the subject.
- A peer transcript NEVER substitutes for a filing the subject's own sufficiency rules require. It is enrichment for the benchmark, not a unit that fills a missing-subject-filing slot (§11).
- When sources conflict, use the more conservative reading (§4). Do not give the subject's narrative the benefit of the doubt because a peer's words are ambiguous.

---

## Where the peer transcripts come from (the data path)

Peer transcripts arrive the same way every other document does: the user downloads them from Capital IQ (the "Competitor Transcripts" tab returns the peer set's calls) into the Google-Drive pool, and the external-data router (`frameworks/EXTERNAL_DATA.md`, `.claude/tools/ingest_external.py`) files them. This module reads them from two places, in this order:

1. **The subject pool's external area — `data/{SUBJECT}/external/<provider>/`.** The primary path. A peer transcript dropped for this subject's benchmark lands here (loose in the inbox forced to the subject, or directly in the subject's `external/` folder). Its manifest row carries `external: true` and (when a sidecar exists) `provenance`. See `frameworks/EXTERNAL_DATA.md` for the `peer_transcript` source-type mapping (tier 6, about the named peer).
2. **A peer's OWN pool — `data/<PEER>/`** — the secondary path, used only when that peer already has its own pool in this engine (e.g. it was analysed before). There the transcript keeps its native tier-6 provenance about its own company.

Identify each peer from the transcript's OWN content (the company name on the cover / first lines / speaker list) and cross-check it against the named competitors in `business-model/08_competitive-map.md`. A transcript for a company NOT in the peer set is either a new end-market peer (add it, flagged self-selected) or off-topic (note and skip). **Never invent a peer transcript, a peer quote, or a peer number — if it is not in a document in the pool, it does not exist for this module.**

Language is not a data gap (§27): a peer call in Mandarin, Korean, Japanese, German, or any language is read and translated (figures verbatim), tiered by what it IS, never marked "missing" or "opaque".

---

## Timing Rule (Hard Rule)

The read-through's whole edge is the calendar spread in reporting dates. Enforce it:

- A peer contributes to the **current-quarter read-through** ONLY if its call covering the comparable calendar window (G1) has ALREADY been published as of the run date. Date-gate every peer.
- A peer whose comparable-window call is not yet out contributes only historical / structural context, clearly separated from the current-quarter read-through.
- State plainly which peers are "already reported (read-through-eligible)" and which are "not yet reported (context only)". A read-through built on a peer that has not actually reported the comparable window is fabricated timing.

---

## Score Caps (applied by the `99` synthesis; never averaged away — §11, §12)

All scores are out of 100 (§12). Any score where higher = worse is INVERTED and must be flagged inverted in the header of every table that uses it.

| Trigger | Cap |
|---|---|
| No peer transcripts in the pool at all | Triage `00` returns **Insufficient** — module does not run (a valid, decision-useful result: "no competitor calls provided"). |
| Only ONE peer transcript available | Read-through confidence capped **Low**; dispersion (job 3) marked *Not assessable* (needs ≥2 peers). |
| No peer with a comparable-window call already published | Current-quarter read-through = *Not assessable*; only structural context is produced. |
| Peer set is self-selected (no `competitive-map` upstream) | Flag it; cap read-through confidence at **Medium** — the peer set was not independently established. |
| A read-through dimension rests on a peer whose scope barely overlaps the subject (G3) | That dimension's confidence capped **Low**; say why. |
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
- `DATA_PATH` — `data/{TICKER}/`
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

Layer 0 (sequential, fail-fast):
- `00_competitive-intel-triage` — inventories peer transcripts, resolves the peer set + per-peer calendar-window / basis / currency map, issues Sufficient / Partial / Insufficient.

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
