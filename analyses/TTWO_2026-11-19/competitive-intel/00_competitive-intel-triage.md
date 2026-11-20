# Competitive-Intel Data Triage — TTWO

**Evidence binding (MODULE_PIPELINE Step 1.5).** This run is FROZEN. The complete quartet was present (`NOSTRA_FROZEN_EVIDENCE_ROOT`, `NOSTRA_FROZEN_POOL_DATA_PATH`, `NOSTRA_FROZEN_POOL_OUT_DIR`, `NOSTRA_FROZEN_POOL_GENERATION`), so `DATA_PATH` is the frozen snapshot only and `GENERATION_ROOT` is `<OUT_DIR>/.extract-generations/0af6384…3203d`. The extractor was NOT run, no live `data/TTWO/` path was read, no sibling peer pool (`data/<PEER>/`) was inspected, and no `_pool_extracts/` tree was touched. Every file below is cited logically as `data/TTWO/...`.

**Subject regime:** US / SEC domestic filer, US GAAP, USD, fiscal year ends March 31. FY2026 = year ended 2026-03-31; FY2027 is in progress. All dollar figures in millions unless stated.

**Reading-warning status (required disclosure).** The exact generation manifest contains **no `numeric_reading_check` key at any level**, and `corpus.txt` contains **no labelled extractor warning annotations** (scanned for `numeric_reading_check`, `NUMERIC_READING`, `READING_WARNING`, `OCR_WARNING`, `EXTRACTOR_WARNING`, `# WARNING` — zero hits). A missing legacy check means **unchecked**, not clean: there are no literal warning tokens, source/extract references, or LF-line/column spans to preserve and carry forward, and no warning is evidence of accuracy. Affected material amounts in THIS report: **none specific** — this triage extracts no peer figure and derives no calculation; the subject figures it restates are carried with their own upstream citations. Every restating layer should carry the same "generation unchecked" qualifier. Manifest totals: 30 sources, 19 workbooks, 62 tabs, 73 extracts written, **0 failures**, all 30 source rows `status: ok` [`data/TTWO/` exact `GENERATION_ROOT/manifest.json`]. So there is no FAILED extraction anywhere in this pool — the gap found below is an absence of documents, not an unreadable one.

**Cross-module inputs read:** `analyses/TTWO_2026-11-19/business-model/08_competitive-map.md` (peer set — present, so the peer set is **anchored**, not self-selected), `business-model/03_segment-map.md` (exposure weights — present), `analyses/TTWO_2026-11-19/earnings/00_earnings-data-triage.md` (next-filing basis — present). Nothing required was missing.

---

## 0. Subject's Next Filing (the read-through target)

*"Take-Two files next: **Q3 FY2027**, a **standalone three-month** basis (a US 10-Q, which reports the single quarter and shows a nine-month cumulative column beside it — not a cumulative-only print), covering **~1 October 2026 to 31 December 2026**, expected **2027-02-09**."*

- **Period and expected date.** "Current Fiscal Year End: Mar-31-2027 | FQ3 2027 Earnings Release Date: Feb-09-2027" [`data/TTWO/Take-TwoInteractiveSoftware,IncNasdaqGSTTWOEstimatesReport.xls → Consensus` and `→ Guidance` tab headers, retrieved 2026-11-19 — **tier-5 vendor export, not a filing**]. The pool's own Events Calendar tab covers November 2026 only and does not carry the February date [`data/TTWO/Take Two Interactive Software Inc NasdaqGS TTWO Events Calendar.xls → Events Calendar`, "Timeframe: November 2026"].
- **Basis stated explicitly (CLAUDE.md §27).** Standalone three-month quarter — "For the quarterly period ended September 30, 2026" on the cover of the last filing, and the vendor's quarterly series is labelled "Period Type: Quarterly … 3 months" [`data/TTWO/10Q_2Q_0001628280-26-072254.pdf`, cover page; `data/TTWO/Take Two Interactive Software Inc NasdaqGS TTWO Financials_Quarterly.xls → Income Statement`; cross-module `earnings/00_earnings-data-triage.md §Interim reporting basis`]. Because Take-Two files a standalone quarter, a vendor "next quarter" consensus maps **directly** onto what the company will print — **no cumulative-stub restatement is needed here**, unlike a half-year filer. That is stated so no downstream agent assumes the §27 restatement trap applies when it does not.
- **What has just been reported (not the target).** Q2 FY27 — the three months ended 2026-09-30 — was released and called on **2026-11-09** [`data/TTWO/Take Two Interactive Software Inc NasdaqGS TTWO Events Calendar.xls → Events Calendar`; `data/TTWO/TTWO 2Q27 Earnings Release FINAL.pdf`].
- **Timing fact that governs this whole module.** As of the run date (2026-11-19), the read-through target window **has not closed** — it ends 2026-12-31, six weeks in the future. No company on earth, peer or otherwise, can have reported it yet. So even a perfect peer-transcript pool could not produce a *current-window* read-through today; it could only produce a same-window cross-check of the **Jul–Sep 2026** quarter Take-Two already printed. This is stated up front because it is a second, independent reason the current-window read-through is Not assessable, and it would still bind after the document gap below is fixed.

---

## 1. Peer Transcript Inventory & Reporting Calendar

**There is no competitor earnings-call transcript in this run's bound evidence. The inventory is empty.**

| Peer | Ticker / venue | Std / currency / FY-end | Language | Most-recent call (native label) | Normalised window | Interim basis | Timing vs subject window | Scope overlap | Source (path) |
|---|---|---|---|---|---|---|---|---|---|
| — none — | — | — | — | — | — | — | — | — | — |

**How that was established (three independent checks, all agreeing):**

1. **No external area exists.** The frozen snapshot `DATA_PATH` contains 30 files and **no `external/` subdirectory at all** — there is no `data/TTWO/external/<provider>/` to read.
2. **No external manifest rows.** Of the 30 source rows in the exact `GENERATION_ROOT/manifest.json`, **zero** carry `external: true` and zero carry a `provenance` sidecar block. So there is no alt-data panel, no expert call, no channel check, and — the one that matters here — **no broker "peer earnings insight / call summary" note** that G5 would admit as a verdict-stripped transcript-proxy.
3. **The only two transcripts in the pool are the SUBJECT's own.** `Take-Two Interactive Software, Inc., Q1 2027 Earnings Call, Aug 07, 2026.rtf` and `Take-Two Interactive Software, Inc., Q2 2027 Earnings Call, Nov 09, 2026.rtf` [both `data/TTWO/`, manifest `status: ok`]. Both are Take-Two's own calls, usable for the subject side of a triangulation, and neither is peer evidence.

**The one non-subject document in the pool, and why it is not a usable competitor call.** `data/TTWO/Alphabet Inc NasdaqGS GOOGL Key Developments.xls` (manifest entity: "Alphabet Inc", `status: ok`) is for a company Take-Two **does** name as a competitor — "Apple, Google, and Microsoft … high-profile companies with significant online presences with new and expanded mobile gaming offerings" [`data/TTWO/10K_2025_26_0001628280-26-037434.pdf`, Item 1 — Competition]. But it is the **wrong document type**, on four counts, and is therefore recorded here and skipped rather than tabulated above:

- It is a **Key Developments news-event export** — 520 rows x 7 cols, "Time Frame: Last 6 Months", "Include Key Developments for: Current Subsidiaries" — a tier-5 vendor event listing, not a transcript and not a broker call summary.
- Its earnings rows are **calendar headlines with no body**: six `Earnings Call` rows whose entire content is the event title (e.g. "Alphabet Inc., Q3 2026 Earnings Call, Oct 28, 2026"; "Alphabet Inc., Q2 2026 Earnings Call, Jul 22, 2026"), plus `Earnings Release Date` and `Announcement of Earnings` rows of the same form. **Not one word of peer management commentary, prepared remarks, or Q&A appears in it.** There is nothing for `01_peer-claim-extraction` to extract.
- Its "Current Subsidiaries / Other Parties" criteria pull in **wholly unrelated issuers** — the only other earnings-type rows belong to Lyft, Inc. (NasdaqGS:LYFT) and One97 Communications Limited (NSEI:PAYTM), neither of which is in Take-Two's peer set or its end-market.
- **Scope overlap would be Low even if a transcript existed.** Alphabet is a platform gatekeeper and simultaneously one of Take-Two's largest customers — Google is one of four customers each above 10.0% of FY26 net revenue, inside a top-five block of 80.6% [`data/TTWO/10K_2025_26_0001628280-26-037434.pdf`, Item 1 — Sales, and Note 2 (Concentration of credit risk)]. Games are a fraction of a vastly larger company, so a group-level Alphabet read is the wrong comparable (G3).

Upstream reached the same conclusion on this file independently, calling it "a misfiled export for a different issuer — neither was read as TTWO evidence" [`business-model/08_competitive-map.md`, header].

### Coverage gaps — the named competitors that carry NO row above

Peer set **anchored** by `business-model/08_competitive-map.md`, which took its names from Take-Two's own filing: "Electronic Arts, Embracer Group, Epic Games, Playrix, Playtika, Roblox, Savvy Games, Tencent, and Ubisoft", plus "Sony, Microsoft, and Nintendo", plus "Apple, Google, and Microsoft" [`data/TTWO/10K_2025_26_0001628280-26-037434.pdf`, Item 1 — Competition; Item 1A]. Nothing below is invented and nothing is added to the peer set.

**(a) Listed peers whose comparable-window call would be obtainable in a future intake — but is absent here.** The pool's vendor comp export gives the only peer-calendar evidence that exists in this run. These are **vendor LTM window ends and "Financials Updated" stamps, NOT call dates** — read them as a proxy for how recently each peer reported, nothing more [all rows: `data/TTWO/Company Comparable Analysis Take Two Interactive Software Inc.xls → Credit Health Panel`, As-Of 2026-11-19 — tier-5 vendor export].

| Named / comp-set competitor | Venue (from ticker) | Country/region (in pool) | Vendor LTM period ending | Vendor "Financials Updated" | Transcript in pool? |
|---|---|---|---|---|---|
| Roblox Corporation | NYSE:RBLX | United States | 2026-09-30 | 2026-10-30 | **No** |
| Playtika Holding Corp. | NasdaqGS:PLTK | Israel | 2026-09-30 | 2026-11-06 | **No** |
| Nintendo Co., Ltd. | TSE:7974 | Japan | 2026-09-30 | 2026-11-10 | **No** |
| Konami Group Corporation | TSE:9766 | Japan | 2026-09-30 | 2026-11-12 | **No** |
| NEXON Co., Ltd. | TSE:3659 | Japan | 2026-09-30 | 2026-11-10 | **No** |
| 37 Interactive Entertainment | SZSE:002555 | China | 2026-09-30 | 2026-10-30 | **No** |
| PLAYSTUDIOS, Inc. | NasdaqCM:MYPS | United States | 2026-09-30 | 2026-11-16 | **No** |
| Ubisoft Entertainment SA | ENXTPA:UBI | France | 2026-03-31 | 2026-11-08 | **No** |
| tinyBuild, Inc. | AIM:TBLD | United States | 2026-06-30 | 2026-09-24 | **No** |

Three honest limits on that table, so no downstream agent over-reads it. First, each peer's **reporting standard, native reporting currency, and fiscal-year end are not in this pool** — the comp export states "Template: Capital IQ Default Comps / Currency: US Dollar" and "Values converted at today's spot rate", so every peer figure has already been converted out of its own currency and no FY-end column exists. A per-peer standard/currency/FY-end map (required by G1) therefore **cannot be built from this pool** and is listed as a critical gap below. Second, a "Financials Updated" date is when the vendor refreshed its model, not when the peer held a call. Third, language is irrelevant here in both directions: four of these peers are Japanese or Chinese and their calls would be read and translated if present (CLAUDE.md §27) — their absence is a missing **document**, never a language gap.

**(b) Competitors that can never supply a call — permanent coverage gaps, not "not-yet-reported".**

- **Electronic Arts Inc. — the closest structural twin, now permanently unobservable.** Upstream establishes EA was taken private on **2026-08-04** in a ~$55bn buyout (~$20bn of it debt) and delisted, corroborated inside this pool by blank ticker / price / share-count / market-cap / trading-multiple cells for EA while all nine other peers are populated, and by a BB− issuer rating against Take-Two's BBB [`data/TTWO/Company Comparable Analysis … xls → Financial Data`, `→ Trading Multiples`, `→ Credit Health Panel`, As-Of 2026-11-19 — vendor export; cause per `business-model/08_competitive-map.md §2 Competitor A`, which sources it to `EA Form 8-K Ex.99.1, filed 2026-08-04` and dated unverified web]. EA's vendor LTM already stops at 2026-06-30 with financials updated 2026-08-04 — the buyout date. **The single best comparable to Take-Two will hold no further public earnings call**, so this gap is structural and no future intake fixes it.
- **Private or non-reporting rivals, named by Take-Two:** Epic Games, Playrix, Savvy Games, Embracer Group. Epic and Playrix are private; Savvy Games is state-backed and private [`business-model/08_competitive-map.md §5 gap 4`]. No call will exist to collect.
- **Listed, but the wrong unit of comparison:** Tencent, Sony, Microsoft, Apple, Google. Each is listed and each holds calls, but interactive entertainment is a fraction of a much larger company, so a group-level call is the wrong comparable (G3) — and three of the four are simultaneously Take-Two's own >10% customers and its hardware/store licensors, which the filing itself flags: "We cannot publish our titles without the approval of hardware licensors that are also our competitors" [`data/TTWO/10K_2025_26_0001628280-26-037434.pdf`, Item 1A]. Tencent is also Take-Two's China distribution partner for NBA 2K Online, named as competitor **and** alliance in the same filing [`data/TTWO/10K_2025_26_0001628280-26-037434.pdf`, Item 1; `data/TTWO/Take Two Interactive Software Inc NasdaqGS TTWO Strategic Alliances.xls → Strategic Alliances`, retrieved 2026-11-19 — vendor export, "Recently disclosed strategic alliances only (within the last two years)"].

**(c) No sibling-pool pointer is recorded.** This run is frozen, so no `data/<PEER>/` pool was inspected and none may be. Under the standalone-mode rule a sibling-pool find could have been logged as an operator pointer; in a frozen chain that path is closed, so this triage records **zero** pointers and claims none.

---

## 2. Coverage of the Subject's Exposure

**The reporting, read-through-eligible peer set is empty, so coverage of Take-Two's exposure is 0%. The uncovered majority is the entire company.**

Take-Two is a **single-segment** business by its own audited disclosure — one operating and reportable segment, "sale of software titles", **100% of $6,656.4 of FY26 net revenue and 100% of the result** (an operating loss of $(104.2) and a net loss of $(298.2)) [`data/TTWO/10K_2025_26_0001628280-26-037434.pdf`, Note 21 (Segment Reporting and Geographic Information), p.102, and MD&A, p.43; cross-module `business-model/03_segment-map.md §1A, §2`]. There is no minority slice a peer set could cover while leaving a majority uncovered — with zero peer transcripts, **every** exposure cut is 100% uncovered:

| Exposure cut of the one segment (FY26) | Weight | Reporting-peer vantage in this pool |
|---|---:|---|
| Whole reportable segment — "sale of software titles" | 100% ($6,656.4) | **None — Not assessable** |
| By platform — Mobile | 50.1% ($3,333.0) | **None.** Playtika (the direct Zynga rival, $2,828.4 LTM revenue) and PLAYSTUDIOS are in the peer set but have no call in the pool — Not assessable |
| By platform — Console | 39.0% ($2,597.3) | **None.** EA (now private), Nintendo, Ubisoft, Konami — no call in the pool — Not assessable |
| By platform — PC and other | 10.9% ($726.1) | **None** — Not assessable |
| By content — Recurrent consumer spending | 78.1% ($5,196.6), and 82.5% of the six months to 2026-09-30 | **None.** Roblox is the closest in-game-spending comparable ($5,897.6 LTM, same 2026-09-30 window) and has no call in the pool — Not assessable |
| By content — Full game and other | 21.9% ($1,459.8) | **None** — Not assessable |
| By geography — United States | 59.2% ($3,940.4) | **None** — Not assessable |
| By geography — International | 40.8% ($2,716.0) | **None** — Not assessable |

[All weights: `data/TTWO/10K_2025_26_0001628280-26-037434.pdf`, MD&A, p.44 and Note 21, p.102; six-month RCS share from `data/TTWO/10Q_2Q_0001628280-26-072254.pdf`, MD&A, p.24 and Note 4; peer LTM revenue from `data/TTWO/Company Comparable Analysis … xls → Financial Data`, As-Of 2026-11-19 — vendor export. Each cut sums independently to $6,656.4 (100.0%).]

Stated in the module's required form: *"Reporting peers cover **0%** of Take-Two's revenue, segments and geographies. The uncovered majority is the **entire single segment** — all $6,656.4 of FY26 net revenue, including the 50.1% mobile platform, the 78.1% recurrent-consumer-spending content line, and both the 59.2% US and 40.8% international geographies. The read-through, the dispersion read, and the market-decomposition read are all **Not assessable** for this run."*

**Two things worth carrying forward, because they survive a future intake.** First, the mobile half of the business (50.1% of FY26 revenue, and the platform management itself says carries the *lower* gross margin because Apple and Google platform fees run through cost of revenue [`data/TTWO/10Q_2Q_0001628280-26-072254.pdf`, MD&A, p.23]) has a genuinely good listed comparable in Playtika — so this gap is fixable by collecting that one call. Second, the console/premium half's closest comparable, EA, went private on 2026-08-04 and **cannot be fixed by collecting anything** — the best peer vantage on Take-Two's premium-franchise business has permanently left the public record. Any future competitive benchmark of this company is structurally short its nearest twin.

---

## 3. Usability Check

| Requirement | Available? (Y/N) | Detail |
|---|---|---|
| ≥1 usable competitor call (verbatim transcript OR permitted broker paraphrase, G5) | **N** | Zero. No `external/` directory in the frozen snapshot; zero `external: true` rows among the 30 manifest sources; no broker peer-call summary of any kind. The one non-subject file, `data/TTWO/Alphabet Inc NasdaqGS GOOGL Key Developments.xls`, is a news-event export whose earnings rows are calendar headlines only — no management commentary, so nothing G5 can verdict-strip and keep |
| ≥2 distinct peer companies with verbatim transcripts (dispersion possible) | **N** | Zero distinct peer companies. The only two transcripts in the pool are Take-Two's own Q1 FY27 (2026-08-07) and Q2 FY27 (2026-11-09) calls |
| ≥1 peer reported the comparable window (read-through possible) | **N** | Two independent reasons: no peer transcript exists at all; and the target window (Oct–Dec 2026) does not close until 2026-12-31, so no peer could have reported it as of the run date |
| Peer set anchored by competitive-map | **Y** | `business-model/08_competitive-map.md` present, with every name sourced to `data/TTWO/10K_2025_26_0001628280-26-037434.pdf`, Item 1 — Competition. **The self-selected cap does NOT bind** — no peer was invented or added here |
| Subject's next-filing basis known | **Y** | Q3 FY2027, standalone three-month quarter (US 10-Q), ~Oct 1–Dec 31 2026, expected 2027-02-09. Vendor standalone-quarter consensus maps directly; no §27 cumulative-stub restatement needed |
| Subject segment-map available (for scope-matching) | **Y** | `business-model/03_segment-map.md` present — single segment, 100% of revenue, plus four revenue cuts with weights. Enough to scope-match peer claims if any ever arrive |
| Peer standard / currency / FY-end map (G1 input) | **N** | Not in this pool. The comp export converts every peer to USD at spot and carries no FY-end column, so the per-peer G1 calendar map cannot be built from this evidence |
| Numeric-reading check on the bound generation | **N (unchecked)** | No `numeric_reading_check` key in the manifest and no labelled extractor annotations in `corpus.txt`. Unchecked, not verified clean; no warning tokens to carry forward; no amount in this report depends on one |

---

## 4. Caps That Will Bind

| Trigger | Applies? (Y/N) | Cap |
|---|---|---|
| No usable call at all — no verbatim transcript AND no permitted broker paraphrase (G5) | **Y** | **Insufficient** — read-through and triangulation **Not assessable**. (A broker-paraphrase-only pool would be Partial, not this row — but this pool has no paraphrase either, so the row genuinely applies.) The module does **not** abort: `01`–`04` run and return "Not assessable", and `99` publishes the coverage gap as the finding |
| Only one peer transcript | N (moot) | Not reached — there are zero, which is the stricter row above |
| No peer reported the comparable window | **Y** | Current-window read-through **Not assessable**. Binds twice over: no peer call in the pool, and the Oct–Dec 2026 window has not closed as of 2026-11-19 |
| Dominant subject exposure uncovered by any peer | **Y** | The uncovered exposure is **100%** of the single segment ($6,656.4 FY26 revenue), so every exposure's read-through is **Not assessable** and the net read-through weight is **nil**, not merely capped |
| Peer set self-selected (no competitive-map) | **N** | Does not bind. The peer set is anchored by `business-model/08_competitive-map.md`, sourced to the FY26 10-K's own competition disclosure |
| Broker-paraphrase only (no verbatim) | **N** | Does not bind — there is no paraphrase either. Peer tone and emphasis are **Not assessable** for the stronger reason that no peer commentary of any kind is in the pool |
| Peer standard / currency / FY-end not in pool (G1 input missing) | **Y** | Even if a peer call were added later from a sibling source, the G1 period/currency normalisation cannot be completed from this pool's own evidence — any future peer row must carry its own filing for standard, currency and FY-end, or be weight-capped **Low** on window grounds |
| Bound generation lacks a numeric-reading check | **Y (disclosure)** | Pool-derived amounts are **unchecked**, not verified clean. No material amount in this triage depends on the check; every restating layer carries the same qualifier forward |

---

## 5. Sufficiency Verdict

- **Verdict: Insufficient**
- **Reason:** The frozen pool contains **zero** competitor earnings-call transcripts and **zero** permitted broker peer-call paraphrases — no `external/` directory exists and none of the 30 manifest sources is external — so there is no usable competitor call of any kind to benchmark Take-Two against.
- **Coverage of subject:** **0%.** Reporting peers cover none of Take-Two's revenue, segments or geographies; the uncovered exposure is the whole single segment, all $6,656.4 of FY26 net revenue — including the 50.1% mobile platform, the 78.1% recurrent-consumer-spending line, and both the 59.2% US and 40.8% international geographies.
- **Active caps:**
  - No usable competitor call → read-through, narrative triangulation, cross-sectional dispersion and market decomposition are all **Not assessable**; the module still runs and reports the gap rather than aborting.
  - No peer reported the comparable window → current-window read-through **Not assessable**, for two independent reasons (no peer call in the pool; the Oct–Dec 2026 target window does not close until 2026-12-31).
  - 100% of the subject's exposure is uncovered → net read-through weight is **nil**; no dimension may be scored.
  - Peer tone, emphasis and candor **Not assessable** — no peer commentary in any form.
  - Per-peer reporting standard, native currency and fiscal-year end absent → the G1 normalisation map cannot be built from this pool.
  - Bound generation carries no numeric-reading check → all pool-derived amounts are **unchecked**; qualifier travels with every restatement.
  - Self-selected-peer-set cap **does not** bind (peer set anchored by `competitive-map`); the one-peer cap and the broker-paraphrase cap are moot at zero peers.
- **Critical gaps:**
  1. **No competitor earnings-call transcript was placed in Take-Two's pool.** This is the single fixable gap, and it is a workflow problem, not a data-availability one: the Capital IQ "Competitor Transcripts" export must be dropped under `EXTERNAL-INBOX/<Provider>/TTWO/…` or directly into `data/TTWO/external/<provider>/`. A loose drop routes by content to the competitor's own pool, where this module cannot see it.
  2. **Highest-value single request:** the **Roblox (NYSE:RBLX) and Playtika (NasdaqGS:PLTK)** calls for the quarter ended 2026-09-30 — two distinct peers, both on exactly Take-Two's just-reported window per the vendor panel, covering the 78.1% in-game-spending line and the 50.1% mobile platform respectively. Those two alone would lift this module from Insufficient to Sufficient for a same-window cross-check of Take-Two's 2026-11-09 call.
  3. **Electronic Arts is permanently unobtainable.** The closest structural twin was taken private on 2026-08-04 and delisted; its vendor LTM stops at 2026-06-30. No future intake can supply its call, so Take-Two's premium-console/licensed-sports half will always lack its best peer vantage.
  4. **No peer standard / currency / FY-end data in the pool**, so G1 period and currency normalisation cannot be completed from this evidence even once transcripts arrive — each peer's own filing is needed.
  5. **No market-share or industry-size data of any kind** (carried from `business-model/08_competitive-map.md §5`), so no peer comparison here could ever be converted into a share measurement.
  6. **The one non-subject file in the pool is the wrong type and the wrong unit** — `data/TTWO/Alphabet Inc NasdaqGS GOOGL Key Developments.xls` is a news-event export for a gatekeeper that is also a >10% customer; it contributes no peer management commentary and is not read as competitor-call evidence.

**Downstream instruction.** `01_peer-claim-extraction` has no peer document to read and must return "Not assessable" with zero claim rows; `02_dimension-matrix`, `03_readthrough-to-subject` and `04_narrative-triangulation` inherit that and must produce no matrix, no read-through line and no triangulation verdict — not a thinner version of one. No peer, quote or number may be supplied from memory, from the vendor comp export (which carries figures, never commentary), or from outside the bound evidence. `99_competitive-intel-synthesis` publishes the coverage gap itself as the module's finding, applies the caps above, and must not let any peer-derived inference reach the master synthesizer's beat/miss or scenario view.
