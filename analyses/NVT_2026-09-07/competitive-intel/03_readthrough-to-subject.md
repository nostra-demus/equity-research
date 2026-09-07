# Peer Read-Through — nVent Electric plc (NVT)

**Verdict: Insufficient data — no usable competitor call in the pool.**

**Evidence binding.** This agent read only the bound frozen extraction generation `6db32848…d1e6`. No live `data/NVT/` path was opened, and no sibling peer pool (`data/HUBB/`, `data/ETN/`, `data/LR/`, `data/ABBN/`) was inspected or cited. Every `data/NVT/…` reference below is a citation label, never a path that was read.

**I re-verified the stop condition myself rather than inheriting it from `00`–`02`.** Reading the bound `manifest.json` directly: `totals` = **15 sources, 2 workbooks, 20 tabs, 33 extracts written, 0 failures**; every source row is `status: ok`; **no row carries `external: true`**, and the generation contains **no `external/` directory** — `raw/NVT/` holds exactly 15 files, every one of them nVent's own document [bound `manifest.json`, generation `6db32848…d1e6`]. My own grep of every per-tab extract for `Hubbell|Legrand|Rittal|Eaton|ABB Ltd|Hitachi Energy|Schneider Electric|Vertiv` returns hits in exactly **one** source document — the Capital IQ Competitors screen (18 lines) — plus its mirror inside `corpus.txt`. That file is a tier-5 vendor export of business descriptions and LTM revenue lines and contains **no management statement of any kind** from any peer [`data/NVT/nVent Electric plc NYSE NVT Competitors.rtf` — CIQ Competitors export, retrieved 2026-09-07, vendor export]. A second grep for transcript structure markers (`Call Participants`, `Question and Answer Session`) returns exactly one file besides the corpus: **nVent's own** Q2 FY2026 call.

So this agent's own stop condition is met exactly: there is **no verbatim peer transcript AND no permitted broker paraphrase** of a peer call (G5). This is not the broker-paraphrase-only case, which triage would class **Partial** and which would require a weight-capped read — there is no paraphrase either. The report structure below is completed in full, with each section carrying its honest *Not assessable*, because the shape of the gap is itself the decision-useful output (CLAUDE.md §11).

**This is a genuine intake gap, not a bad-extraction error.** All 15 sources extracted cleanly (0 failures) and none is in a foreign language, so nothing was dropped for language, jurisdiction, or an unreadable scan (CLAUDE.md §20, §27).

---

## 0. Peer Set & Reporting Calendar

**nVent files next: Q3 FY2026 — the standalone three months ended 30-Sep-2026, presented in the 10-Q alongside a cumulative nine-month column, covering the calendar window ~1-Jul-2026 to 30-Sep-2026.**

- **Basis — standalone, and that matters (CLAUDE.md §27).** nVent is a **US SEC domestic filer despite Irish incorporation**: US GAAP, USD in millions, fiscal year ending 31 December, Form 10-K / 10-Q [FY24 10-K, cover page; Q2 FY26 10-Q, cover page]. A US quarterly period contains **no already-reported stub**, so no cumulative-to-standalone restatement is needed and the vendor's estimate is already the shape the company will print [`earnings/04_guidance-consensus.md`, §1A].
- **Expected release 30-Oct-2026 — a vendor date, not a company-confirmed one.** "FQ3 2026 Earnings Release Date: Oct-30-2026" [`CIQ Estimates→Consensus`, header — tier-5 vendor export].

| Peer | Ticker / venue | Std / currency | Most-recent call (native label) | Normalised window | Interim basis | Timing vs subject window | Scope overlap with subject | Source |
|---|---|---|---|---|---|---|---|---|
| — **none** — | — | — | — | — | — | — | — | **No document in `data/NVT/external/**` is a peer earnings-call transcript; the directory does not exist in the bound snapshot** [bound `manifest.json`] |

**Zero rows is the finding.** No peer call, verbatim or paraphrased, is present. Nothing was omitted for language, jurisdiction, or extraction failure.

### Read-through-eligible peers: none. Context-only peers: none.

Neither list can be populated, and the two states must not be conflated with a third that also applies here. The six competitors named upstream fall into two distinct categories, and only one of them could ever be cured:

| Competitor (from `08_competitive-map.md`) | Listing / venue | Standard / currency / FY-end | State — and why it is not a Timing state |
|---|---|---|---|
| **Rittal GmbH & Co. KG** (Friedhelm Loh Group, Germany) | **None — private** | German private group; no public income statement | **Permanent coverage gap.** A private company will never file a call, so per the Timing Rule this is a coverage gap and **never** "not-yet reported". Closest product-for-product rival to Systems Protection's enclosure-and-cooling core; LTM revenue **$1,756.30m**, LTM date left blank by the vendor [CIQ Competitors export] |
| **Hitachi Energy AG** | **None — private subsidiary of Hitachi Ltd** | No standalone margin disclosed | **Permanent coverage gap** at the entity level; revenue **$2,686.41m**, LTM date not stated [CIQ Competitors export] |
| **Hubbell Incorporated** | NYSE:HUBB | US GAAP / USD / FY ends 31-Dec | **No transcript in this run's audit corpus.** Would be the strongest available peer — LTM revenue **$6,223.60m** at **Jun-30-2026**, ~1.29x nVent, predominantly US against nVent's 85.0% Americas [CIQ Competitors export] |
| **Legrand SA** | ENXTPA:LR (Euronext Paris) | IFRS / EUR / FY ends 31-Dec | **No transcript in this run's audit corpus.** Closest business *shape*; reports on a **cumulative half-year** basis, so even if present its figures would need §27 stub arithmetic before sitting beside a standalone quarter (G1). LTM revenue **$11,665.05m** at Jun-30-2026 [CIQ Competitors export] |
| **Eaton Corporation plc** | NYSE:ETN | US GAAP / USD / FY ends 31-Dec | **No transcript in this run's audit corpus.** Matched at segment level (Electrical Americas) but **$30,026.00m** LTM at Jun-30-2026 = 6.2x nVent, failing the ~5x whole-company scale test [CIQ Competitors export] |
| **ABB Ltd** | SWX:ABBN | IFRS / USD reporting / FY ends 31-Dec | **No transcript in this run's audit corpus.** **$35,752.00m** LTM at Jun-30-2026 = 7.4x nVent — fails the ~5x scale test [CIQ Competitors export] |

The peer set is **inherited from `business-model/08_competitive-map.md`, not self-selected**, so that cap does not bind. Carry its caveat forward: **nVent names no competitor anywhere in its own filings** — the FY24 10-K Competition section is generic [FY24 10-K, Item 1 — Competition, p.2; `08_competitive-map.md`, preamble] — so the peer set rests entirely on a tier-5 vendor export whose own stated scope is *"Recently disclosed competitors only (within the last two years)"*.

**A second, independent reason there is no read-through — the calendar.** Today is **2026-09-07**. The target window does not even *end* until 30-Sep-2026. No company anywhere, peer or subject, can have reported July–September 2026 yet. The most recent peer call that could exist today covers April–June 2026, which reads into nVent's **already-filed** Q2 FY26 (filed 31-Jul-2026) — context, never a current-window read. **So even a complete peer-transcript intake performed today would not produce this agent's highest-value output.** The empty pool and the open window are two separate blockers, and curing one does not cure the other.

### Coverage of the subject's exposure (required)

**Reporting, read-through-eligible peers span 0% of nVent.** Stated against the subject's own filed weights, so the blind spot is sized rather than implied:

| Subject exposure | Weight | Reporting-peer vantage in this pool |
|---|---:|---|
| **Systems Protection** (enclosures, liquid/air cooling, switchgear, power distribution) | **72.5%** of net sales ($1,966.9m of $2,713.3m) and 70.0% of reportable segment income, H1 FY26 [Q2 FY26 10-Q, Note 13, p.20] | **None.** Its closest product-for-product rival, Rittal, is **private and will never file a call** |
| **Electrical Connections** (cable management, connections, fastening) | **27.5%** of net sales ($746.4m), 30.0% of segment income, H1 FY26 [Q2 FY26 10-Q, Note 13, p.20] | **None** |
| **Americas** | **85.0%** of net sales ($2,307.2m of $2,713.3m), H1 FY26 [Q2 FY26 10-Q, Note 2, p.8] | **None** |
| **EMEA** | **11.2%** ($305.0m) [Q2 FY26 10-Q, Note 2, p.8] | **None** — and Rittal is strongest here, so this is the most permanently unrepresentable exposure |
| **Asia-Pacific** | **3.7%** ($101.1m) [Q2 FY26 10-Q, Note 2, p.8] | **None** |
| **Data centres** (a *vertical* that cuts across both segments, not a reportable line) | ~**37%** of FY2026 group revenue — *derived from a transcript figure and a guidance range; inference, not a disclosed number* [`business-model/03_segment-map.md`, §2] | **None.** Legrand (26% of 2025 sales in data centres) and Eaton Electrical Americas are the natural cross-checks; neither has a call here |

**The uncovered majority is the whole company.** The read-through for **100%** of nVent's revenue is **Not assessable** on this pool, and the net read-through weight is **none**. Two of the six named rivals — Rittal and Hitachi Energy — are private, so even a perfect future transcript intake would still leave the enclosure-and-cooling core, **72.5% of revenue**, without its single closest comparable. This is a structural limit on the module for this subject, not just a missing file.

---

## 1. Peer Management Signals (already-reported peers only)

**No dimension has a single sourced peer signal, so under this agent's own instruction ("include only dimensions with at least one sourced peer signal") the table is empty.** It is printed in full below so the downstream synthesis can see that every fixed benchmark dimension was tested and returned nothing, rather than inferring which were checked.

| Dimension | Peer | What management said | Scope (geo / segment / tier) | Number (currency, period) | Citation |
|---|---|---|---|---|---|
| Demand | — | **No peer call in the bound generation — not extractable** | — | — | — |
| Pricing / ASP | — | **No peer call in the bound generation — not extractable** | — | — | — |
| Volume / units | — | **No peer call in the bound generation — not extractable** | — | — | — |
| Input costs | — | **No peer call in the bound generation — not extractable** | — | — | — |
| Margin trajectory | — | **No peer call in the bound generation — not extractable** | — | — | — |
| Channel / inventory | — | **No peer call in the bound generation — not extractable** | — | — | — |
| Capacity / capex | — | **No peer call in the bound generation — not extractable** | — | — | — |
| Market-share claim | — | **No peer call in the bound generation — not extractable** | — | — | — |
| Guidance direction | — | **No peer call in the bound generation — not extractable** | — | — | — |
| Capital return | — | **No peer call in the bound generation — not extractable** | — | — | — |
| **Biggest risk named** | — | **No peer call in the bound generation — not extractable** | — | — | — |

**On the "Biggest risk named" row specifically.** This row is carried, not dropped, because a peer's management-named risk is a load-bearing *disconfirming* signal that must reach the §8 disconfirmation register. The honest statement to carry forward is that **no peer-named risk exists in this corpus at all**, so §8 receives an explicit blank from this module — not a silence, and not a false all-clear. The subject's own risk disclosures belong to the `earnings` and `business-model` modules and must not be re-labelled as a peer risk to fill this row.

**Scope-mismatch note (G3).** No signal was set aside for scope mismatch, because no signal exists to test. For a future run, the scope tags that would decide admission are: Systems Protection vs Electrical Connections; Americas vs EMEA vs Asia-Pacific; and the data-centre vertical, which cuts across both segments.

**On the source-hierarchy step this agent normally performs in the fallback path.** Where a pool holds a peer's results release alongside its call, the release anchors the peer's reported figures (§4/§5) and the call supplies commentary. That step is moot: the pool holds **neither** for any peer, so there is no release-versus-call conflict to adjudicate.

**What is deliberately NOT in this table, and why.** `business-model/08_competitive-map.md` quotes real peer numbers — Hubbell Q2 2026 net sales $1,711.8m up 15.3%, Legrand H1 2026 sales €5,400.3m up 13.1% (+9.8% organic), Eaton Electrical Americas Q2 2026 operating margin 27.5% and rolling orders up 41%. Every one is labelled **there** as an unverified web copy of a peer *results release*, and **none of those documents is inside the bound `<DATA_PATH>`**. Under this module's Auditable-corpus rule they are not this run's evidence; they are releases, not calls, so they carry no management commentary (G5); and they cover April–June 2026, which reads into nVent's already-filed quarter, not the Q3 target. Naming them here is the audit trail for their exclusion, never a back door for building a read-through the pool cannot support.

**Analyst assertion stripped (G5).** One competitor-referencing utterance exists anywhere in the bound generation, and it is exactly what G5 exists to keep out:

| Speaker | Firm | Call | The assertion | Why it is stripped |
|---|---|---|---|---|
| Nigel Edward Coe | Wolfe Research, LLC | **nVent's own** Q2 FY2026 call, 2026-07-31, Q&A | "I'm just kind of amazed that you're not seeing any capacity headwinds or supply chain bottlenecks unlike a lot of your competitors and peers in data centers" [Q2 FY26 transcript, Q&A] | **Twice inadmissible.** (a) An **analyst's** framing, not a management statement — context, never tier-6 evidence. (b) It is on the **subject's** call about unnamed third parties, so it is not a claim by any peer's management about that peer's own business. Reading it as evidence that peers face capacity limits would invent a peer claim from an analyst's aside. CEO Beth Wozniak's reply spoke only to nVent's own Blaine 1 ramp and its own supply base; she did not adopt or confirm the framing [Q2 FY26 transcript, 2026-07-31, Q&A] |

---

## 2. Read-Through to nVent

*Every row below is inference from peer read-through — NOT a filing fact about nVent (§6 Level 1, Guardrail G2).*

| Peer evidence | Transmission mechanism | Implication for nVent (named metric, direction) | Direction confidence (§10 band + basis) | Weight (H/M/L + why) | Confirms if / Falsifies if (line-item · boundary · comparable · basis) |
|---|---|---|---|---|---|
| — **no rows** — | — | — | — | — | — |

**Zero rows, and the zero is deliberate.** A read-through row requires peer evidence in column one. There is none in the bound generation, so no row can be written without inventing the peer evidence that would anchor it. Every dimension's read-through to nVent is ***Not assessable***.

**Context only — not a current read-through:** also empty. That sub-table is reserved for peers whose comparable-window call is simply not out yet. No peer here occupies that state either — four peers have **no call in this run's audit corpus** (a corpus gap, not a timing state), and two are **private and permanently non-reporting** (a coverage gap, explicitly not a timing state under the Timing Rule).

**Why no falsifier basis note is needed.** The sub-window trap — where a peer's standalone quarter reads into only part of a cumulative subject window and the subject's print therefore blends the covered sub-period with an uncovered stub — cannot arise here, for two reasons. There is no sub-window read to flag; and nVent's next filing is a **standalone** three-month period with no already-reported stub inside it, so the blending problem would not apply even if a peer read existed [`earnings/04_guidance-consensus.md`, §1A]. Recorded so the absence of the flag is read as "not applicable", not as "overlooked".

---

## 3. Cross-Sectional Dispersion

*Not assessable — fewer than two already-reported peers.*

To be precise about which branch this is, because the two carry different meanings: this is **zero** already-reported peers, not one. The one-peer case would still yield a single-peer signal set with dispersion marked *Not assessable*; here there is no signal set at all. No dimension can return a consensus line, a named outlier, or even a "no material outlier" finding — each of those is a statement *about* evidence, and there is none.

**A matrix with no dispersion because peers said similar things is a finding. A matrix with no dispersion because nobody spoke is a coverage gap.** This is the second. Reporting it as quiet agreement across the peer set would be a fabricated benchmark.

Two blanks are worth naming as the most costly, because each leaves a live question in the subject's own numbers untested:

- **Input costs.** nVent guides group tariff cost at roughly **$100 million for FY2026, raised from ~$80 million**, expected to be offset by price, supply-chain productivity and mitigating actions [Q2 FY26 transcript, prepared remarks]. No peer vantage exists to test whether that is an nVent-specific sourcing problem or a cost the whole electrical-equipment cohort is carrying.
- **Margin.** Electrical Connections' segment margin fell **2.6 points to 25.9% of sales in H1 FY26, from 28.5% in H1 FY25** [Q2 FY26 10-Q, MD&A, p.30]. No peer commentary exists to say whether that is company-specific or market-wide.

---

## 4. Net Read-Through Verdict

**A sourced subject bar DOES exist** — so the missing element here is the peer evidence, not the bar, and the degraded no-bar branch does not apply. Both a vendor consensus and management guidance are in the pool for the exact period:

- **Consensus (standalone Q3 FY2026):** revenue **$1,427.27m**, adjusted (normalized) EPS **$1.3899**, GAAP EPS **$1.24636**, EBITDA **$329.29m** [`CIQ Estimates→Consensus`, FQ3 2026 column — tier-5 vendor export].
- **Management guidance (Q3 FY2026):** reported and organic sales growth **+32% to +35%**, implying revenue **$1,391.28m – $1,422.90m**; adjusted EPS **$1.35 – $1.38** [`Q2 FY26 transcript, prepared remarks`; `CIQ Estimates→Guidance`, FQ3 2026, guidance date 2026-07-31].

**Verdict: Not assessable — no already-reported peer with overlapping scope.**

The bar is known; the peer evidence that would let this module lean for or against it does not exist in the bound generation. There is no single most important peer signal to report, because there is no peer signal — and nothing can flip a read that was never established. The blocker is doubled: the pool holds no competitor call at all, and separately the target window (1-Jul to 30-Sep-2026) has not ended as of the 2026-09-07 run date, so no peer call covering it exists anywhere in the world yet. **This module therefore contributes no beat/miss lean and no operational-direction lean to the master synthesis — the correct hand-off is the coverage gap itself, at zero weight.** Any beat/miss signal attributed to peer read-through for this run would be manufactured (§11).

*This is inference feeding the beat/miss setup and the candor cross-check — it does not set a rating (G2).*

---

## 5. What Would Change This

**There are zero read-through rows in Section 2, so there is no confirm/falsify boundary to restate.** A falsifier is a test of a claim; no claim was made, so publishing a threshold here would give the reader something to score against a read-through that does not exist. Two things are recorded instead — what would make a read-through *possible*, and the boundary a future run should build once it is.

**What changes the verdict (intake and calendar, both required):**

1. **The peer calls must enter nVent's own pool.** A competitor call names the competitor, so a loose inbox drop is content-routed to *that competitor's* pool, where this module cannot see it. The Capital IQ "Competitor Transcripts" export for nVent's peer set must be force-routed under `EXTERNAL-INBOX/<Provider>/NVT/…` or placed directly in `data/NVT/external/<provider>/` **before** the next generation is admitted.
2. **The window must have been reported.** The genuine opportunity opens when Hubbell, Eaton and Legrand report their September-quarter periods in late October / early November 2026, at or just before nVent's expected 30-Oct-2026 release. **The calendar spread is narrow, so the timing edge is thin even in the best case** — if the peers report at the same time as or after nVent, there is no lead at all, and their calls become triangulation for an already-filed quarter rather than a read-through.

**The like-for-like comparable a future run must use, recorded now so it is not mis-set later (§17).** nVent's Q3 FY2026 print is a **standalone three months** against **Q3 2025 actuals of $1,054.0m revenue and $0.91 adjusted EPS** [`CIQ Estimates→Consensus`, FQ3 2025 actual column — vendor data; no Q3 FY25 10-Q exists in this pool]. Note what the bar implies before any peer read is layered on: consensus revenue of $1,427.27m is **+35.4%** on that comparable, and consensus adjusted EPS of $1.3899 is **+52.7%** [`earnings/04_guidance-consensus.md`, §1A]. A future peer-derived boundary must be cut against those year-ago standalone figures — not against the nine-month cumulative column, and not against the FY2026 full-year guide — or it will not be capable of failing.

**Two limits a future intake would still face**, so this gap is not read as merely a filing away from being cured: Rittal and Hitachi Energy are private and permanently uncoverable, leaving Systems Protection (72.5% of revenue) without its closest comparable in any future run; and Eaton and ABB fail the ~5x whole-company scale test, so Eaton would be usable only at the Electrical Americas segment level, tagged as such.

---

## 6. Data Gaps & Caps

**Peers with no transcript, and the state each is actually in:**

- **No call in this run's audit corpus (curable by intake):** Hubbell, Legrand, Eaton, ABB. Their calls exist in the world but not in the bound `<DATA_PATH>`; a document outside it is not evidence for this run and was not read.
- **Permanent coverage gaps (never curable):** Rittal (private German GmbH & Co. KG inside the Friedhelm Loh Group) and Hitachi Energy AG (private subsidiary of Hitachi Ltd). Neither will ever file a call or a standalone margin. Under the Timing Rule these are **coverage gaps, not "not-yet reported"** states.
- **Scope-mismatched peers:** none set aside on scope, because no peer signal existed to test. For the record, Eaton (6.2x nVent's revenue) and ABB (7.4x) would fail the whole-company scale test on arrival.

**Windows that could not be aligned (G1):** none, and that is not good news. No window mismatch is reportable because **no peer statement exists to anchor to a window**, and alignment needs at least one. For a future run: Hubbell, Eaton and ABB file **standalone quarters** and are directly alignable to nVent's Q3; **Legrand files a cumulative half-year** and would need §27 stub arithmetic before entering the same cohort. A Legrand H1 cell and a Hubbell September-quarter cell are different cohorts, and two half-year cells must never be allowed to outvote a directly comparable quarter.

**Caps that bind:**

| Trigger | Applies? | Cap |
|---|---|---|
| No usable call at all — no verbatim transcript AND no permitted broker paraphrase (G5) | **Y** | **Insufficient.** Read-through *Not assessable*; net read-through weight **none**. Peer tone, emphasis and candor *Not assessable* |
| No peer with a comparable-window call published (full or sub-window) | **Y** | Current-window read-through *Not assessable*. **Binds twice over** — no peer call in the pool, and the 1-Jul–30-Sep-2026 window is still open at the run date |
| A dominant segment / geography has no reporting-peer vantage (coverage-of-exposure) | **Y** | Systems Protection (**72.5%** of H1 FY26 net sales) and the Americas (**85.0%**) have no reporting-peer vantage; Rittal, the closest rival, is private. Net weight capped to reflect an uncovered **100%** |
| Only one peer transcript | N (moot) | Not reached — there are **zero**, not one. Dispersion *Not assessable* for the stronger reason |
| Peer set self-selected (no `competitive-map`) | **N** | Does not bind — `business-model/08_competitive-map.md` is present and anchors the peer set. The Medium cap on net weight from self-selection is not the binding constraint here; the empty pool is |
| Broker-paraphrase-only (no verbatim, G5) | N (moot) | Not reached — no paraphrase exists either. This is why the verdict is **Insufficient** rather than **Partial** |

**Additional evidence-quality flags carried forward:**

1. **nVent names no competitor in any of its own filings or on either of its own calls**, so the entire peer set rests on a tier-5 vendor export whose stated scope is "recently disclosed competitors only (within the last two years)" and which still carries divested Thermal Management rivals under "current subsidiaries" — a staleness flag on the export itself [`data/NVT/nVent Electric plc NYSE NVT Competitors.rtf` — CIQ Competitors export].
2. **The peer figures quoted in `08_competitive-map.md` are unverified web copies of peer *results releases* that are not in `<DATA_PATH>`.** They are not peer calls, they cover an already-filed nVent quarter, and under the Auditable-corpus rule they must not be used downstream to construct a read-through this pool cannot support.
3. **No extraction failed and no document is non-English** — 15 of 15 sources `status: ok`, 33 extracts, 0 failures. Nothing here was marked missing, opaque, or downgraded for language or jurisdiction (§20, §27), and there is no translated-figure risk in this run.
