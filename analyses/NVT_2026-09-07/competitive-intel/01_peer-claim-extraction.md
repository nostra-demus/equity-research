# Peer Claim Extraction — nVent Electric plc (NVT)

**Verdict: Insufficient — no usable competitor call in the pool.**

**Evidence binding.** This agent read only the bound frozen extraction generation `6db32848…d1e6`. No live `data/NVT/` path was opened and no sibling peer pool (`data/HUBB/`, `data/ETN/`, `data/LR/`) was inspected or cited. `data/NVT/…` below is a citation label, never a path that was read.

**I re-verified the triage's finding rather than inheriting it.** Reading the bound `manifest.json` directly: `totals` = **15 sources, 2 workbooks, 20 tabs, 33 extracts written, 0 failures**; **not one source row carries `external: true`**, and the generation contains **no `external/` directory** — `raw/NVT/` holds exactly 15 files, all of them nVent's own documents [bound `manifest.json`, generation `6db32848…d1e6`]. A grep of every extract in the generation for `Hubbell|Legrand|Rittal|Eaton|ABB Ltd|Hitachi Energy|Schneider|Vertiv` returns hits in exactly **one** file — the Capital IQ Competitors screen, a tier-5 vendor export of business descriptions and LTM revenue figures that contains no management statement of any kind. The only two earnings-call transcripts in the pool are **nVent's own** Q1 FY2026 (May-01-2026) and Q2 FY2026 (Jul-31-2026) calls.

So the stop condition in this agent's own rules is met exactly: there is **no verbatim peer transcript AND no permitted broker paraphrase** of a peer call (G5). This is not the broker-paraphrase-only case, which would be Partial and would require a weight-capped read — there is no paraphrase either. Zero peers can be extracted on the benchmark dimensions.

**This is a genuine intake gap, not a bad-extraction error.** Every one of the 15 sources extracted cleanly (0 failures) and none is in a foreign language, so nothing here was dropped for language or for jurisdiction (CLAUDE.md §20, §27). The Capital IQ "Competitor Transcripts" export for nVent's peer set was simply never dropped into nVent's own pool.

---

## Peer Set

The peer set is **inherited, not self-selected** — it comes from `business-model/08_competitive-map.md`, which draws its names from the pool's Capital IQ Competitors export [`data/NVT/nVent Electric plc NYSE NVT Competitors.rtf` — CIQ Competitors export, retrieved 2026-09-07, vendor export]. Carry the upstream caveat with it: **nVent names no competitor anywhere in its own filings or on either of its own calls** [FY24 10-K, Item 1 — Competition, p.2; `08_competitive-map.md`, preamble].

Each line gives the peer, its listing, its native call label / normalised window / interim basis where one exists, and its timing state.

| Peer | Ticker / venue | Std / ccy / FY-end | Native call label in pool | Normalised window | Interim basis | Timing state | Scope overlap with NVT |
|---|---|---|---|---|---|---|---|
| **Rittal GmbH & Co. KG** (Friedhelm Loh Group) | **None — private** | German private group; no public income statement | **None — no call exists** | n/a | n/a | **Coverage gap — permanent** (not "not-yet reported"; a private company will never file a call) | **Highest.** Industrial and IT enclosures, power distribution, climate control — product-for-product against Systems Protection's core; LTM revenue **$1,756.30m**, LTM date left blank by the vendor [CIQ Competitors export] |
| **Hubbell Incorporated** | NYSE:HUBB | US GAAP / USD / FY ends 31-Dec | **None in pool** | n/a | (would be standalone quarter) | **No transcript in pool** | High. Electrical and utility solutions, predominantly US; LTM revenue **$6,223.60m** at **Jun-30-2026**, ~1.29x nVent [CIQ Competitors export] |
| **Legrand SA** | ENXTPA:LR (Euronext Paris) | IFRS / EUR / FY ends 31-Dec | **None in pool** | n/a | (would be **cumulative half-year** — a G1 basis mismatch against nVent's standalone quarter even if present) | **No transcript in pool** | High on shape. LTM revenue **$11,665.05m** at **Jun-30-2026**, ~2.41x nVent [CIQ Competitors export] |
| **Eaton Corporation plc** | NYSE:ETN | US GAAP / USD / FY ends 31-Dec | **None in pool** | n/a | (would be standalone quarter) | **No transcript in pool** | High at segment level (Electrical Americas), low at group level — LTM revenue **$30,026.00m** at **Jun-30-2026**, 6.2x nVent, fails the ~5x whole-company scale test [CIQ Competitors export] |
| **ABB Ltd** | SWX:ABBN | IFRS / USD reporting / FY ends 31-Dec | **None in pool** | n/a | (would be standalone quarter) | **No transcript in pool** | Medium. LTM revenue **$35,752.00m** at **Jun-30-2026**, 7.4x nVent, fails the ~5x scale test [CIQ Competitors export] |
| **Hitachi Energy AG** | **None — private subsidiary of Hitachi Ltd** | No standalone margin disclosed | **None — no standalone call** | n/a | n/a | **Coverage gap — permanent** | Medium. Grid and transformer products; revenue **$2,686.41m**, LTM date not stated by the vendor [CIQ Competitors export] |

**Read the timing column carefully — two different states are in it.** Rittal and Hitachi Energy are **coverage gaps**: no call will ever exist, so they can never be tabulated as "not yet reported". The other four are simply absent from this pool; their calls exist in the world but not in this run's audit corpus, and under the Auditable-corpus rule a document outside `<DATA_PATH>` is not evidence for this run.

---

## Per-Peer Claim Blocks

**No claim block can be produced for any peer.** A claim block requires management statements from that peer's own call; not one such statement exists in the bound generation. Below, each peer is listed as no-transcript with the reason, then the fixed benchmark dimension list is shown once with its status across the whole peer set — so `02_dimension-matrix` knows precisely which cells are empty and why, rather than inferring it.

### Rittal GmbH & Co. KG — no call (private company)

- Language: n/a. Currency: n/a (no public income statement). Timing vs subject window: **coverage gap, permanent**.
- **Reason:** privately held German GmbH & Co. KG inside the Friedhelm Loh Group. It files no earnings call, publishes no standalone income statement, and discloses no margin or return-on-capital figure [`08_competitive-map.md`, Competitor A: "not public / not disclosed"]. This gap cannot be closed by any future intake.
- **Why it hurts most:** this is the closest product-for-product rival to Systems Protection, which is **72.5% of nVent's revenue and 70.0% of reportable segment income in H1 FY26** [Q2 FY26 10-Q, Note 13, p.20], and it is strongest in EMEA, nVent's **11.2%** ($305.0m of $2,713.3m) geography [Q2 FY26 10-Q, Note 2, p.8].

### Hubbell Incorporated — no transcript in pool

- Language: English (would be). Currency: USD. Timing vs subject window: **not applicable — no call in the audit corpus**.
- **Reason:** no Hubbell document of any kind is in the bound generation. Its most recent call would cover the ~3 months ended 30-Jun-2026, which reads into nVent's **already-filed** Q2 FY26, not the Q3 FY26 window.

### Legrand SA — no transcript in pool

- Language: English/French (would be; translation would not have been a gap under §27). Currency: EUR. Timing vs subject window: **not applicable — no call in the audit corpus**.
- **Reason:** no Legrand document is in the bound generation. Note the basis trap for a future run: Legrand reports on a **cumulative half-year** basis, so its H1 figures would need the §27 stub arithmetic before they could sit beside nVent's standalone quarter (G1).

### Eaton Corporation plc — no transcript in pool

- Language: English (would be). Currency: USD. Timing vs subject window: **not applicable — no call in the audit corpus**.
- **Reason:** no Eaton document is in the bound generation.

### ABB Ltd — no transcript in pool

- Language: English (would be). Currency: USD reporting. Timing vs subject window: **not applicable — no call in the audit corpus**.
- **Reason:** no ABB document is in the bound generation.

### Hitachi Energy AG — no call (private subsidiary)

- Language: n/a. Currency: n/a. Timing vs subject window: **coverage gap, permanent** at the entity level.
- **Reason:** a private subsidiary of Hitachi Ltd with no standalone call and no separately disclosed margin [CIQ Competitors export; `08_competitive-map.md`, §2e].

### The fixed benchmark dimensions — status across the entire peer set

Every dimension below is unextractable for **all six peers**, for the same single reason: no peer management statement exists in the bound generation. Nothing here is "not addressed by that peer" in the ordinary sense — that phrase means a peer held a call and did not raise the topic. Here no peer call exists to address anything.

| Dimension | What management said | Scope (geo / segment / tier) | Number (currency, period) | Citation |
|---|---|---|---|---|
| Demand (direction + magnitude) | **No peer call in pool — not extractable** | — | — | — |
| Pricing / ASP | **No peer call in pool — not extractable** | — | — | — |
| Volume / units | **No peer call in pool — not extractable** | — | — | — |
| Input costs | **No peer call in pool — not extractable** | — | — | — |
| Margin trajectory (gross / operating) | **No peer call in pool — not extractable** | — | — | — |
| Channel / dealer inventory | **No peer call in pool — not extractable** | — | — | — |
| Capacity / capex | **No peer call in pool — not extractable** | — | — | — |
| Market-share claim | **No peer call in pool — not extractable** | — | — | — |
| Guidance direction (+ numbers) | **No peer call in pool — not extractable** | — | — | — |
| Capital return | **No peer call in pool — not extractable** | — | — | — |
| Biggest risk named | **No peer call in pool — not extractable** | — | — | — |

**What is deliberately NOT in this table, and why.** `business-model/08_competitive-map.md` quotes real peer numbers — Hubbell Q2 2026 net sales $1,711.8m up 15.3%, Legrand H1 2026 sales €5,400.3m up 13.1% (+9.8% organic), Eaton Electrical Americas Q2 2026 operating margin 27.5% and rolling orders up 41%. Every one of those is labelled **there** as an unverified web copy of a peer results release, and **none of those documents is in `<DATA_PATH>`**. Under this module's Auditable-corpus rule they are not this run's evidence, they are not peer **calls** (they are releases, and management commentary is what this agent extracts), and they must not be lifted into the dimension matrix to manufacture a benchmark the pool cannot support. Naming them here is the audit trail for why they were excluded, not a back door for using them.

**On the source hierarchy step this agent normally performs.** Where a pool holds a peer's results release alongside its call, the release anchors the peer's reported figures and the call supplies commentary. That step is moot here: the pool holds **neither** for any peer. There is no release-versus-call conflict to adjudicate because there is no peer document at all.

---

## Analyst Assertions Stripped (G5)

There are no peer-call analyst questions to strip, because there are no peer calls. One item nevertheless needs recording, because it is the **only** competitor-referencing utterance anywhere in the bound generation and it is exactly the kind of statement G5 exists to keep out of a peer benchmark:

| Speaker | Firm | Call | The assertion | Why it is stripped |
|---|---|---|---|---|
| Nigel Edward Coe | Wolfe Research, LLC | **nVent's own** Q2 FY2026 call, 2026-07-31, Q&A | "I'm just kind of amazed that you're not seeing any capacity headwinds or supply chain bottlenecks unlike a lot of your competitors and peers in data centers" [Q2 FY26 transcript, Q&A] | **Twice inadmissible.** (a) It is an **analyst's** framing, not a management statement, so it is context and never tier-6 evidence (G5). (b) It is on the **subject's** call about unnamed third parties, so it is not a claim by any peer's management about that peer's own business. Treating it as evidence that peers face supply-chain bottlenecks would be inventing a peer claim from an analyst's aside. |

For completeness: nVent CEO Beth Wozniak's reply to that question spoke only about nVent's own Blaine 1 ramp and its own supply base — she did not adopt, confirm, or comment on the competitor framing [Q2 FY26 transcript, 2026-07-31, Q&A]. Nothing in the answer converts the analyst's assertion into a company statement, and nothing in it is a claim about a peer.

---

## Extraction Notes

1. **No extraction failed — this is an intake gap, not a data-quality failure.** All 15 sources report `status: ok`, 33 extracts written, 0 failures [bound `manifest.json`]. No document was unreadable, corrupt, encrypted, or an illegible scan. Under CLAUDE.md §11 only a genuinely unreadable document counts as absent; nothing here qualifies.
2. **No non-English document is involved.** All 15 sources are English. Nothing was marked missing, opaque, or downgraded for language (§27). There is no translated-figure risk in this run.
3. **Peers with no transcript in the pool: all six** — Rittal, Hubbell, Legrand, Eaton, ABB, Hitachi Energy. Of these, **two (Rittal, Hitachi Energy) are permanent coverage gaps**, being private and non-reporting; four are absent-from-this-pool.
4. **No broker paraphrase either.** The pool contains no sell-side "peer earnings insight" or call-summary note, so the weight-capped `via unverified sell-side paraphrase` path is unavailable. This is why the verdict is Insufficient rather than Partial.
5. **Coverage of the subject is 0%.** No reporting peer speaks to Systems Protection (72.5% of H1 FY26 revenue), Electrical Connections (27.5%), the Americas (85.0% of H1 FY26 net sales, $2,307.2m of $2,713.3m), EMEA (11.2%), Asia-Pacific (3.7%), or the data-centre vertical that actually drives the company [Q2 FY26 10-Q, Notes 2 and 13, pp.8, 20].
6. **The timing edge is unavailable independently of the empty pool.** Today is 2026-09-07; nVent's next filing covers 1-Jul to 30-Sep-2026, a window that has not even ended. No company anywhere can have reported it. The most recent peer call that could exist today covers April–June 2026 and reads into nVent's **already-filed** Q2 FY26 — context, never a current-window read. So even a perfect peer-transcript intake made today would not produce the module's highest-value output.
7. **The one operator action that changes this.** A competitor call names the competitor, so a loose inbox drop is content-routed to *that competitor's* pool, where this module cannot see it. To benchmark nVent, the Capital IQ "Competitor Transcripts" export for its peer set must be force-routed under `EXTERNAL-INBOX/<Provider>/NVT/…` or placed directly in `data/NVT/external/<provider>/` **before** the next generation is admitted. The genuine read-through opportunity opens when Hubbell, Eaton and Legrand report their September-quarter periods in late October / early November 2026, at or just before nVent's expected 30-Oct-2026 release — a narrow calendar spread, so the edge is thin even in the best case.
8. **Downstream instruction.** `02_dimension-matrix` has zero rows to align and cannot compute dispersion (that needs ≥2 peers; there are zero). `03_readthrough-to-subject` and `04_narrative-triangulation` must return "Not assessable" and must not substitute the out-of-corpus web-sourced peer figures from `08_competitive-map.md` for peer call claims. `99` reports the coverage gap as the module's finding. An honest gap beats a fabricated benchmark (CLAUDE.md §11).
