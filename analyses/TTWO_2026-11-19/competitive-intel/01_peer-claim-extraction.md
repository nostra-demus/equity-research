# Peer Claim Extraction — TTWO (Take-Two Interactive Software, Inc.)

**Verdict: Insufficient — no usable competitor call in the pool.** Zero peer claims were extracted, and zero are claimed. Every one of the eleven fixed benchmark dimensions is **Not assessable** for every peer, for one reason: this run's bound evidence contains no competitor earnings-call transcript and no permitted broker peer-call paraphrase. The downstream orbs (`02_dimension-matrix`, `03_readthrough-to-subject`, `04_narrative-triangulation`, `99_competitive-intel-synthesis`) inherit a true missing input, not a thin one.

**Evidence binding (MODULE_PIPELINE Step 1.5).** This run is FROZEN. `DATA_PATH` is the immutable snapshot only; `GENERATION_ROOT` is the exact generation `0af6384…3203d`. The extractor was not run, no live `data/TTWO/` path was read, no sibling peer pool (`data/<PEER>/`) was inspected or listed, and no `_pool_extracts/` tree was touched. Every file named below is cited logically as `data/TTWO/...`.

**Subject regime:** US / SEC domestic filer, US GAAP, USD, fiscal year ends 31 March. FY2026 = year ended 2026-03-31. Read-through target = **Q3 FY2027**, a standalone three-month US 10-Q covering ~1 Oct 2026 – 31 Dec 2026, expected 2027-02-09 [`data/TTWO/Take-TwoInteractiveSoftware,IncNasdaqGSTTWOEstimatesReport.xls → Consensus` / `→ Guidance` tab headers, retrieved 2026-11-19 — tier-5 vendor export, not a filing].

**Reading-warning status (required disclosure).** The exact generation manifest carries **no `numeric_reading_check` key at any level** (checked recursively — zero matching keys among the manifest's `data_path`, `out_dir`, `generated_by`, `vision_mode`, `offline_extraction_complete`, `sources`, `entities`, `totals`, `generation`, `cache_guard` keys), and `corpus.txt` (42,713 LF lines) contains **no labelled extractor warning annotation** — scanned for `numeric_reading_check`, `NUMERIC_READING`, `READING_WARNING`, `OCR_WARNING`, `EXTRACTOR_WARNING` and `# WARNING`: **0 hits**. A missing legacy check means **unchecked, not clean**; no warning is not proof of accuracy. There are therefore **no literal warning tokens, source/extract references, or LF-line/column spans to preserve**, and nothing to carry forward beyond the "generation unchecked" qualifier itself, which every restating layer must keep. **Affected material amounts in this report: none** — this agent extracts no peer figure and performs no calculation. Manifest totals: 30 sources, 19 workbooks, 62 tabs, 73 extracts written, **0 failures**; all 30 source rows `status: ok` [exact `GENERATION_ROOT/manifest.json`]. So there is **no FAILED extraction anywhere in this pool** — the gap here is an absence of documents, never an unreadable one.

**Upstream input read:** `analyses/TTWO_2026-11-19/competitive-intel/00_competitive-intel-triage.md` (present; verdict **Insufficient**). Also read for scope tags: `analyses/TTWO_2026-11-19/business-model/08_competitive-map.md` (peer set anchored, so the self-selected-peer-set cap does **not** bind). The peer set below is inherited, not invented.

---

## Peer Set

The peer set is Take-Two's own named competitor list, anchored upstream: "Electronic Arts, Embracer Group, Epic Games, Playrix, Playtika, Roblox, Savvy Games, Tencent, and Ubisoft", plus "Sony, Microsoft, and Nintendo", plus "Apple, Google, and Microsoft" [`data/TTWO/10K_2025_26_0001628280-26-037434.pdf`, Item 1 — Competition, and Item 1A; carried by `business-model/08_competitive-map.md §2`]. Nothing is added to it here.

**No peer in this set has a call in the bound evidence, so no peer carries a native call label, a normalised window, an interim basis, or a timing state.** Those four fields are properties of a call document; with no call document they are absent facts, not blanks to be guessed. Stated per peer:

| Peer | Ticker / venue | Native call label | Normalised window | Interim basis | Timing state vs subject window | Transcript in pool? |
|---|---|---|---|---|---|---|
| Roblox Corporation | NYSE:RBLX | Not assessable — no call in pool | Not assessable | Not assessable — peer FY-end/basis not in pool | Not assessable — no call to date-gate | **No** |
| Playtika Holding Corp. | NasdaqGS:PLTK | Not assessable — no call in pool | Not assessable | Not assessable | Not assessable | **No** |
| Nintendo Co., Ltd. | TSE:7974 | Not assessable — no call in pool | Not assessable | Not assessable | Not assessable | **No** |
| Ubisoft Entertainment SA | ENXTPA:UBI | Not assessable — no call in pool | Not assessable | Not assessable | Not assessable | **No** |
| Konami Group Corporation | TSE:9766 | Not assessable — no call in pool | Not assessable | Not assessable | Not assessable | **No** |
| NEXON Co., Ltd. | TSE:3659 | Not assessable — no call in pool | Not assessable | Not assessable | Not assessable | **No** |
| 37 Interactive Entertainment | SZSE:002555 | Not assessable — no call in pool | Not assessable | Not assessable | Not assessable | **No** |
| PLAYSTUDIOS, Inc. | NasdaqCM:MYPS | Not assessable — no call in pool | Not assessable | Not assessable | Not assessable | **No** |
| tinyBuild, Inc. | AIM:TBLD | Not assessable — no call in pool | Not assessable | Not assessable | Not assessable | **No** |
| Electronic Arts Inc. | **No longer listed** (taken private 2026-08-04) | **Permanent coverage gap** — will hold no further public call | n/a | n/a | n/a | **No, and never again** |
| Embracer Group, Epic Games, Playrix, Savvy Games | private / non-reporting (Epic, Playrix, Savvy private; Embracer non-reporting in this pool) | **Permanent coverage gap** — no call to collect | n/a | n/a | n/a | **No** |
| Tencent, Sony, Microsoft, Apple, Alphabet/Google | HKEX:700 / TSE:6758 / NasdaqGS:MSFT / NasdaqGS:AAPL / NasdaqGS:GOOGL | Listed and each holds calls, but **wrong unit of comparison (G3)** — games are a fraction of a far larger company | n/a | n/a | n/a | **No** |

[Peer venues and the nine vendor-panel rows: `data/TTWO/Company Comparable Analysis Take Two Interactive Software Inc.xls → Credit Health Panel` and `→ Financial Data`, As-Of 2026-11-19 — **tier-5 vendor export, not a filing**; peer names: `data/TTWO/10K_2025_26_0001628280-26-037434.pdf`, Item 1 — Competition. EA's delisting shows in this pool as blank ticker / price / share-count / market-cap / trading-multiple cells while all nine other peers are populated, with an S&P issuer rating of BB− against Take-Two's BBB [same vendor export, `→ Trading Multiples`, `→ Credit Health Panel`]; the **cause** (a ~$55bn buyout closing 2026-08-04) is sourced upstream to `EA Form 8-K Ex.99.1, filed 2026-08-04` plus dated unverified web, per `business-model/08_competitive-map.md §2 Competitor A` — it is not a pool fact and is not restated here as one.]

**Two honest limits on that table, so no downstream agent over-reads it.** First, no peer's reporting standard, native currency, or fiscal-year end is in this pool — the vendor export states "Template: Capital IQ Default Comps / Currency: US Dollar" with "Values converted at today's spot rate" and carries no FY-end column, so the per-peer **G1** calendar/currency map cannot be built from this evidence even once transcripts arrive. Second, language is not a factor in either direction: four of these peers are Japanese or Chinese and their calls would be read and translated with figures transcribed verbatim if present (CLAUDE.md §27) — their absence is a missing **document**, never a language gap.

---

## Per-Peer Claim Blocks

**There is no peer claim block, because there is no peer management statement in this run's evidence.** Rendering nine or thirteen identically empty eleven-row tables would add no information and would risk reading as a matrix that exists. One block is rendered, scoped to the whole peer set, with every fixed dimension marked Not assessable and the reason stated on the row.

### All peers — no call document ( — , — )

- Language: **n/a — no peer document to read** (no peer call is non-English in this pool; none is present in any language). Currency: **n/a — no peer figure extracted**. Timing vs subject window: **n/a — no call to date-gate**; separately, the subject's target window (Oct–Dec 2026) does not close until 2026-12-31, six weeks after the run date, so no peer on earth could have reported it today.

| Dimension | What management said (tight quote / paraphrase) | Scope (geo / segment / tier) | Number (currency, period) | Citation |
|---|---|---|---|---|
| Demand | **Not assessable** — no peer management statement in the bound evidence | Not assessable | Not assessable | No source exists to cite |
| Pricing / ASP | **Not assessable** — same reason | Not assessable | Not assessable | No source exists to cite |
| Volume / units | **Not assessable** — same reason | Not assessable | Not assessable | No source exists to cite |
| Input costs | **Not assessable** — same reason | Not assessable | Not assessable | No source exists to cite |
| Margin trajectory | **Not assessable** — same reason | Not assessable | Not assessable | No source exists to cite |
| Channel / inventory | **Not assessable** — same reason | Not assessable | Not assessable | No source exists to cite |
| Capacity / capex | **Not assessable** — same reason | Not assessable | Not assessable | No source exists to cite |
| Market-share claim | **Not assessable** — same reason; and no market-share or industry-size data of any kind is in this pool (carried from `business-model/08_competitive-map.md §5`), so no peer comparison here could be converted into a share measurement even with a transcript | Not assessable | Not assessable | No source exists to cite |
| Guidance direction | **Not assessable** — same reason | Not assessable | Not assessable | No source exists to cite |
| Capital return | **Not assessable** — same reason | Not assessable | Not assessable | No source exists to cite |
| Biggest risk named | **Not assessable** — same reason | Not assessable | Not assessable | No source exists to cite |

**Why every row is Not assessable — three independent checks of the bound evidence, all agreeing.**

1. **No external area exists.** The frozen snapshot `DATA_PATH` holds 30 files at its top level and **no `external/` subdirectory at all** — a directory listing returns "No such file or directory", and a recursive search for any path matching `*external*` under `DATA_PATH` returns nothing. There is no `data/TTWO/external/<provider>/` to read, so the module's primary peer-transcript route is empty.
2. **No external manifest rows.** Of the 30 source rows in the exact `GENERATION_ROOT/manifest.json`, **zero** carry `external: true` and **zero** carry a `provenance` sidecar block. So there is no alt-data panel, no expert call, no channel check, and — the one that matters here — **no broker "peer earnings insight / call summary" note**. That is the fact that decides this report's verdict: a broker-paraphrase-only pool would be **Partial** and would oblige a weight-capped, verdict-stripped read labelled `via unverified sell-side paraphrase`. This pool has **no paraphrase either**, so the **Insufficient** stop is the correct one and not a shortcut.
3. **The only two transcripts in the pool are the SUBJECT's own**, and they are not peer evidence. `data/TTWO/Take-Two Interactive Software, Inc., Q1 2027 Earnings Call, Aug 07, 2026.rtf` and `data/TTWO/Take-Two Interactive Software, Inc., Q2 2027 Earnings Call, Nov 09, 2026.rtf` [both `status: ok`] are Take-Two's own calls. They are usable for the SUBJECT side of a triangulation by `04`, and this agent **did not** read them as peer claims and must not be taken to have done so. Substituting the subject's own management words for a competitor's would fabricate the exact independent check this module exists to provide.

**A fourth check, run independently here.** Every peer name in the set was searched across all 73 extract files of the bound generation. Roblox, Playtika, Nintendo, Ubisoft, Konami, NEXON and Electronic Arts appear **only** in (a) Take-Two's own two 10-Ks, where they are named in the Competition disclosure, and (b) the Capital IQ comparable-analysis tabs, which carry **figures and business descriptions and not one word of peer management commentary**. No peer-call speaker list, no "Call Participants", no "Presentation / Question-and-Answer" structure exists for any company other than Take-Two anywhere in the generation. So the absence is confirmed by content search, not only by the manifest.

### The one non-subject document, inventoried and skipped

`data/TTWO/Alphabet Inc NasdaqGS GOOGL Key Developments.xls` (manifest `status: ok`) is for a company Take-Two **does** name as a competitor — "Apple, Google, and Microsoft … high-profile companies with significant online presences with new and expanded mobile gaming offerings" [`data/TTWO/10K_2025_26_0001628280-26-037434.pdf`, Item 1 — Competition]. It is recorded and skipped, on four counts:

- **Wrong document type.** It is a Key Developments **news-event export** — "DIMS: 520 rows x 7 cols", "Time Frame: Last 6 Months", criteria "Include Key Developments for: Current Subsidiaries" — a tier-5 vendor event listing. It is not a transcript and not a broker call summary, so there is nothing G5 can verdict-strip and keep.
- **Its `Earnings Call` rows are titles with no body.** Both Alphabet call rows carry, as their entire content, the event title repeated — e.g. "Alphabet Inc., Q3 2026 Earnings Call, Oct 28, 2026" (row at corpus/extract line 224) and "Alphabet Inc., Q2 2026 Earnings Call, Jul 22, 2026" (line 885). **Not one word of management prepared remarks or Q&A appears.** One precision the triage's phrasing does not carry, recorded here so a later layer is not surprised by it: the file's separate `Announcement of Earnings` rows **do** carry a vendor-written results body with figures (e.g. Alphabet "for the third quarter, the company reported sales was USD 127,577 million compared to USD 102,346 million a year ago", line 227). That is a **vendor news summary of a results release** — still zero management words, so it cannot supply any of the eleven commentary dimensions, and it is not the peer's own release either, so under the module source hierarchy it is not the figures anchor for a peer. It changes nothing about the verdict; it is flagged only so nobody mistakes it for a usable call.
- **Its criteria pull in unrelated issuers.** The only other earnings-type rows belong to Lyft, Inc. (NasdaqGS:LYFT) and One97 Communications Limited (NSEI:PAYTM) — neither is in Take-Two's peer set or its end-market.
- **Scope overlap would be Low even with a transcript (G3).** Alphabet is a platform gatekeeper and at the same time one of Take-Two's largest customers — Google is one of four customers each above 10.0% of FY26 net revenue, inside a top-five block of 80.6% [`data/TTWO/10K_2025_26_0001628280-26-037434.pdf`, Item 1 — Sales, and Note 2 (Concentration of credit risk)]. A group-level Alphabet read is the wrong comparable for a games publisher.

Upstream reached the same conclusion on this file independently, calling it "a misfiled export for a different issuer — neither was read as TTWO evidence" [`business-model/08_competitive-map.md`, header].

---

## Analyst Assertions Stripped (G5)

**None — the strip list is empty, and that is itself the finding, not a clean bill of health.** G5 strips analyst questions and framing out of a peer call so only management's own words survive as tier-6 evidence about that peer. With **zero** peer calls in the bound evidence there is no peer Q&A to strip: no analyst question was excluded because none was ever available to exclude.

Two things follow, and both must travel downstream:

- **Nothing was quietly admitted.** No analyst assertion, no sell-side framing, and no vendor news body has been carried into any row above as if a peer's management had said it. The empty strip list is auditable precisely because the claim tables are empty too.
- **Peer tone, emphasis and candor are Not assessable** — for the stronger reason than the usual broker-paraphrase cap: there is no peer commentary in this pool **in any form**, verbatim or paraphrased.

---

## Extraction Notes

- **FAILED extractions (a real gap): none.** All 30 manifest source rows are `status: ok`; manifest totals show 73 extracts written and **0 failures**. No document in this pool was unreadable.
- **Non-English documents read and translated: none needed.** No peer call is present in any language. Four peers in the vendor panel are Japanese or Chinese and their calls would have been read and translated with figures transcribed verbatim (§27) had they been in the pool. **Their absence is a missing document, never a language gap** — and must never be restated as opacity.
- **Peers with no transcript in the pool: all of them.** Nine listed peers in the vendor panel (Roblox, Playtika, Nintendo, Konami, NEXON, 37 Interactive, PLAYSTUDIOS, Ubisoft, tinyBuild), plus Electronic Arts, plus the private/non-reporting group (Embracer, Epic, Playrix, Savvy), plus the five wrong-unit platform giants.
- **The fixable gap, and it is a workflow problem not a data-availability one.** A competitor call names the COMPETITOR, so a loose inbox drop is content-routed to that competitor's own pool, where this module — which reads the SUBJECT's `external/` — cannot see it. To reach this module the Capital IQ "Competitor Transcripts" export must be force-routed under `EXTERNAL-INBOX/<Provider>/TTWO/…` or dropped directly into `data/TTWO/external/<provider>/`.
- **Highest-value single request (one item, not ten): the Roblox (NYSE:RBLX) and Playtika (NasdaqGS:PLTK) calls for the quarter ended 2026-09-30.** Two distinct peers, both on exactly the window Take-Two has just printed per the vendor panel (vendor LTM period ending 2026-09-30 for both), covering Take-Two's 78.1%-of-revenue in-game-spending line and its 50.1%-of-revenue mobile platform respectively [weights: `data/TTWO/10K_2025_26_0001628280-26-037434.pdf`, MD&A p.44 and Note 21 p.102]. Those two alone would lift this module from Insufficient to a usable same-window cross-check of Take-Two's 2026-11-09 call.
- **One gap no intake can fix.** Electronic Arts — the closest structural twin, a licensed-sports-plus-owned-IP publisher across console, PC and mobile — was taken private on 2026-08-04 and delisted; its vendor LTM stops at 2026-06-30 with financials updated on the buyout date. **It will hold no further public earnings call**, so Take-Two's premium-console half is permanently short its best peer vantage. That is a structural limit on every future run of this module, not a defect of this one.
- **No sibling-pool pointer is recorded.** This run is frozen, so no `data/<PEER>/` pool was inspected and none may be. In a frozen chain the sibling-pointer path is closed; this agent records **zero** pointers and claims none.
- **Second, independent reason the current-window read is dead.** Even a perfect peer-transcript pool could not produce a *current-window* read-through today: the subject's target window ends 2026-12-31, six weeks after the run date. A fixed pool would buy only a same-window cross-check of the Jul–Sep 2026 quarter Take-Two already reported on 2026-11-09.
- **Qualifier that travels.** The bound generation carries **no numeric-reading check** and `corpus.txt` carries no labelled extractor annotation, so all pool-derived amounts in this module are **unchecked, not verified clean**. No amount in this report depends on that check (this agent extracts none), but every restating layer carries the same "generation unchecked" qualifier forward, with its source check named.

**Downstream instruction.** `02_dimension-matrix` must produce **no matrix** — not a thinner one; `03_readthrough-to-subject` must produce **no read-through line**; `04_narrative-triangulation` must produce **no triangulation verdict** (it may still state Take-Two's own claims from the subject's two transcripts, clearly labelled as un-cross-examined, with no peer side); `99_competitive-intel-synthesis` publishes the coverage gap itself as the module's finding. No peer, quote or number may be supplied from memory, from the vendor comp export (which carries figures and never commentary), or from anywhere outside the bound evidence. No peer-derived inference may reach the master synthesizer's beat/miss or scenario view.
