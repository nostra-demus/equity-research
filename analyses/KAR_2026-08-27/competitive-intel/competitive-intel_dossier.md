# competitive-intel Module Dossier — KAR

> Deterministic, lossless concatenation of every artifact in this module — the module synthesis and every specialist output, in order. Generated mechanically (no LLM rewriting), so nothing is omitted or paraphrased. This is the module's "see everything" tier; the module's decision lives in `99_*-synthesis.md` and the short read in `competitive-intel_memo.md`.

- Generated: 2026-08-27T14:46:11Z
- Module folder: `competitive-intel`
- Contents: 1 module synthesis + 5 specialist outputs = 6 files

## Table of Contents

- [competitive-intel — module synthesis](#competitive-intel-module-synthesis) — `99_competitive-intel-synthesis.md`
- [competitive-intel / 00_competitive-intel-triage.md](#competitive-intel-00-competitive-intel-triage-md) — `00_competitive-intel-triage.md`
- [competitive-intel / 01_peer-claim-extraction.md](#competitive-intel-01-peer-claim-extraction-md) — `01_peer-claim-extraction.md`
- [competitive-intel / 02_dimension-matrix.md](#competitive-intel-02-dimension-matrix-md) — `02_dimension-matrix.md`
- [competitive-intel / 03_readthrough-to-subject.md](#competitive-intel-03-readthrough-to-subject-md) — `03_readthrough-to-subject.md`
- [competitive-intel / 04_narrative-triangulation.md](#competitive-intel-04-narrative-triangulation-md) — `04_narrative-triangulation.md`


---

## competitive-intel — module synthesis

_Source: `99_competitive-intel-synthesis.md`_

# Competitive-Intel Module — KAR (Synthesis)

## Abstract

The peer pool holds no real benchmark this run: zero of Karoon's thirteen named peers — including the two closest Brazil-offshore comparators, Prio S.A. and Petroreconcavo S.A. — have any transcript or broker paraphrase anywhere in this run's corpus, confirmed independently by all four downstream specialists. With no eligible peer, the net read-through for Karoon's H1 CY2026 print is Not assessable, carrying no weight and no direction-confidence band, and Karoon's own narrative was never actually cross-checked against a peer — it neither survived nor failed the test, it was simply untested. The peers that exist can speak to 0% of Karoon's revenue: neither the Brazil segment (77.9% of revenue, 91.2% of gross profit) nor the USA segment (22.1% of revenue) has any reporting-peer vantage. This module contributes no evidence to the master synthesis this run; the single highest-value fix is a Prio S.A. or Petroreconcavo S.A. transcript covering H1/Q2 CY2026.

## 1. Verdict Block

- **Net read-through direction:** Not assessable (no eligible peer — zero peer transcripts, verbatim or broker-paraphrase, exist anywhere in `data/KAR/` for any of the thirteen named peers)
- **Read-through weight:** Not assessable (moves with direction per the zero-eligible-peer rule — no H/M/L weight is invented)
- **Read-through direction confidence:** Not assessable (moves with direction and weight — no §10 band is invented; `03` produced no read to carry a band on)
- **Narrative triangulation verdict:** Not testable *(from `04`)* — Karoon's claims on demand, pricing, market-share, margin, input costs, and guidance direction each have no peer vantage to test against; every dimension in `04`'s comparison table is marked Untestable, not "agree" or "contradict"
- **Peer-coverage of subject:** 0/100 *(built per §1B)*
- **Benchmark data-sufficiency:** 0/100 *(built per §1B — floored, the true Insufficient case)*
- **Dispersion:** Not assessable *(from `02`)* — fewer than two peers hold any usable claim (in fact zero)
- **Single most important peer signal (one line):** There is no peer signal to report — the single most important fact this module carries is the negative evidence itself: none of Karoon's thirteen named peers, including its two closest direct comparators, has any earnings call in this run's data pool.
- **Biggest contradiction or corroboration of the subject's narrative (one line):** Neither exists — with zero peer transcripts, Karoon's narrative was never tested, so it is inaccurate to call it either corroborated or contradicted; it is untested.

## 1B. Score Builds (reproducible — CLAUDE.md §12)

**Peer-coverage of subject /100** = `round(covered_exposure_pct)` = **round(0) = 0**.

`business-model/03_segment-map.md` is available, so this is a computed 0%, not a "Not assessable" for lack of a segment map. No segment or geography is covered by any read-through-eligible, scope-overlapping peer on a matched window, because zero peers have any transcript at all:
- Brazil (Baúna Project): 77.9% of FY2025 revenue, 91.2% of FY2025 gross profit — **uncovered** (0 eligible peers; Prio S.A. and Petroreconcavo S.A., the two scope-matched candidates, have no transcript in the pool)
- USA (Who Dat / Dome Patrol / Abilene): 22.1% of FY2025 revenue — **uncovered** (0 eligible peers; Gran Tierra, GeoPark, Kosmos and others named but no Brazil/US-Gulf overlap and, regardless, no transcript exists for any of them)
- Sum of covered weights: 0.0 percentage points out of 100.0. The uncovered majority is the entire company — this is total, not partial, coverage absence.

**Benchmark data-sufficiency /100** = **0** (floored). Per the score-build rule: "Floor the WHOLE score to 0 ONLY when the pool holds no usable call at all — no verbatim transcript AND no permitted broker paraphrase (the triage-Insufficient case)." `00_competitive-intel-triage.md` returned the Insufficient verdict on exactly this ground: no transcript and no broker paraphrase exists for any of the thirteen peers. This is distinct from the "broker-paraphrase-only" case (which would score Partial, never floored) — here there is no broker paraphrase either, so the true floor applies. The four components would otherwise be:

| Component | Points | Value this run | Why |
|---|---:|---:|---|
| Reporting-peer breadth | 0–40 | 0 | N = 0 distinct read-through-eligible peer companies |
| Exposure coverage | 0–30 | 0 | `round(0 × 0.30) = 0` |
| Source quality | 0–20 | 0 | No eligible peer at all — base 0 (no verbatim, no broker-paraphrase) |
| Peer-set provenance | 0–10 | 10 | Peer set is anchored via `business-model/08_competitive-map.md` (Karoon's own FY2025 Remuneration Report Industry Peer Group + CIQ Competitors export) |
| **Unfloored sum** | | **10** | |
| **Floored total (published)** | | **0** | Floor rule applies: no usable call at all anywhere in the pool |

The module reports the coverage gap this run, not a benchmark.

## 1A. Module Disconfirmation (CLAUDE.md §8)

- **Strongest bear read-through:** None exists. No peer signal of any kind undermines Karoon's H1 CY2026 print, because no peer signal of any kind was extracted.
- **Strongest bull read-through:** None exists, for the same reason.
- **Single killer contradiction from `04`:** None — `04` states plainly that "none found, and none can be tested," because there is no peer statement in the corpus to set against any Karoon claim.
- **Disconfirming evidence already visible in the peer calls:** None — there are no peer calls to hold disconfirming evidence.
- **What data would change this conclusion:** Not a subject line-item boundary this run — `03` produced zero read-through rows, so there is no line-item · boundary · comparable · basis falsifier to carry up (§8's usual mechanism does not apply when the upstream module made no read). The only thing that changes this module's output is a change in the INPUT DATA: a Capital IQ "Competitor Transcripts" export for Prio S.A. or Petroreconcavo S.A. covering H1/Q2 CY2026 (matching Karoon's H1 CY2026 window, six months to 30-Jun-2026, released 2026-08-27), dropped into `data/KAR/external/<provider>/`, would give this module its first usable read-through into the dominant Brazil segment (77.9% of FY2025 revenue, 91.2% of gross profit).
- **What would force a downgrade / rejection:** Nothing this module found should cap or withdraw a read-through, because none was contributed. The module's own absence should itself be read by the master synthesizer as an open evidence gap on the dominant segment (Brazil, 77.9% of revenue) rather than as a clean bill of health — a zero-peer result is not corroboration of Karoon's narrative, it is an untested claim.

## 2. Specialist Roll-Up

| Specialist | Verdict Line | Biggest Finding |
|---|---|---|
| competitive-intel-triage (`00`) | Insufficient — no peer transcript, verbatim or broker paraphrase, exists anywhere in `data/KAR/` for any of thirteen named peers | Coverage of subject's exposure by any reporting peer is 0%, for both the Brazil segment (77.9% of revenue, 91.2% of gross profit) and the USA segment (22.1% of revenue); `data/KAR/external/` does not exist as a directory at all |
| peer-claim-extraction (`01`) | Insufficient — no usable competitor call in the pool; no per-peer claim block produced for any of thirteen peers | Zero peer statements exist to extract on any of the eleven fixed benchmark dimensions; fabricating one would violate the hard "never invent a peer transcript" rule |
| peer-dimension-matrix (`02`) | Empty matrix — every dimension and every dispersion cell marked Not assessable | Zero eligible peers means no consensus can be computed and no outlier can be named on any dimension; this is not a "no material outlier" finding, it is an absence of any peer cell to compare |
| peer-readthrough-to-subject (`03`) | Not assessable — no already-reported peer with overlapping scope; in fact no peer transcript of any kind exists | Net read-through weight is capped to zero (not merely Low) because both Karoon segments — dominant and secondary — have zero reporting-peer vantage; no confirm/falsify boundary exists to carry to §8 |
| peer-narrative-triangulation (`04`) | Not testable — Karoon's own claims have no overlapping peer vantage on any of six benchmarked dimensions | 0% of Karoon's revenue and gross profit, across both segments, has any reporting-peer vantage in this run; no contradiction and no corroboration can be named because no peer statement exists to test against |

## 3. Reconciliation

No material disagreements. All five specialists (`00`–`04`) reached the identical, independently-verified conclusion — zero peer transcripts of any kind exist for any of Karoon's thirteen named peers — via the same exhaustive search of `data/KAR/` (top level and the required `external/**` path). There is no dispersion-vs-read-through tension to reconcile, no window-mismatch dispute, and no scope disagreement: every specialist's table is empty for the same single, consistent reason, and every specialist states that reason explicitly rather than manufacturing a "mixed" or "no material outlier" finding where none can be supported. This is a coherent, mutually-confirming Insufficient result, not a partial or degraded run masquerading as complete.

## 4. Score Cap Application

| Cap Trigger | Applied? (Y/N) | Affected | Final Cap |
|---|---|---|---|
| No peer transcripts | Y | read-through | Not assessable |
| Only one peer | N/A | weight | Low (not applicable — zero peers, not one) |
| No peer reported the window | Y (moot — zero peers, not merely an unaligned window) | current read-through | Not assessable |
| Exposure uncovered (by coverage band) | Y | net weight | Low (ceiling; see below) |
| Peer set self-selected | N | net weight | Medium (not applicable — peer set is anchored via `business-model/08_competitive-map.md`, Karoon's own FY2025 Remuneration Report peer group; not self-selected) |
| Broker-paraphrase only | N | tone | Not assessable (not applicable — no broker paraphrase exists either, so this is the stronger zero-usable-call case, not the paraphrase-only case) |

**Exposure-coverage weight ceiling.** `covered_exposure_pct` = 0 (from §1B), which is below the 30% threshold — the dominant exposure is entirely uncovered. Per the deterministic rule, this bands to a ceiling of **Low**. In practice this ceiling is superseded by the stronger zero-eligible-peer rule: because `03` found zero read-through-eligible peers of any kind, the net weight is not merely capped at Low — it is **Not assessable**, moving together with the Not-assessable direction and confidence (per the explicit "three move together" rule in the report structure). The exposure-coverage ceiling is recorded here for completeness and would govern in a future run where at least one eligible peer exists but coverage remains thin.

## 5. Note To The Final Synthesizer

- **The net read-through carries no weight and no direction-confidence band this run** — both are Not assessable, not a low or toss-up number, because zero peer transcripts of any kind exist for any of Karoon's thirteen named peers. There is no leading indicator from an already-reported competitor to fold into the beat/miss or scenario view this cycle. Do not read the absence as "no bad news from peers" — it is an absence of peers, not an absence of risk.
- **No falsifier or downgrade/rejection trigger is carried up from this module** — `03` produced zero read-through rows, so there is no line-item · boundary · comparable · basis check to hand to the master's §8 kill-criteria this run. The only actionable item is a data-acquisition step, not a testable subject-print boundary: a Prio S.A. or Petroreconcavo S.A. transcript covering H1/Q2 CY2026, dropped into `data/KAR/external/<provider>/`.
- **Karoon's narrative was neither corroborated nor contradicted by peers — it was untested.** `04`'s verdict is Not testable, not "clean." The master's governance/candor read should treat this as an open question on the dominant Brazil segment, not as a point in Karoon management's favor.
- **The coverage gap is total, not partial:** 0% of Karoon's revenue has any reporting-peer vantage — neither the Brazil segment (77.9% of revenue, 91.2% of gross profit) nor the USA segment (22.1% of revenue). This is not a case of "one segment covered, one dark" — the entire company is unbenchmarked this run.
- **A hard cap bound the weight to Not assessable** (stronger than any Low-weight cap), because no peer transcript exists at all — not because of a self-selected peer set (it is anchored via `competitive-map`) and not because of a broker-paraphrase-only limitation (no paraphrase exists either). The single highest-value next data request is a Prio S.A. or Petroreconcavo S.A. transcript covering Karoon's H1 CY2026 window.

## 6. Simple Summary

- No — there are no real peer calls to benchmark against. Zero of Karoon's thirteen named peers, including its two closest direct comparators (Prio S.A., Petroreconcavo S.A.), have any transcript or broker paraphrase anywhere in this run's data pool.
- The already-reported peers imply nothing for Karoon's next print, because there are no already-reported peers with any call in the pool — the net read-through is Not assessable, at zero weight, not a weak or low-confidence one.
- Karoon's own story was never checked against a peer, so it cannot be said to "hold up" or to fail — it is simply untested this run.
- The benchmark is blind to the entire company: 0% of Karoon's revenue has any peer vantage, covering neither the dominant Brazil segment (77.9% of revenue) nor the USA segment (22.1%).
- This module is not useful for the master synthesizer's beat/miss setup this run beyond flagging the gap itself — it contributes no peer-derived signal, positive or negative, to the earnings module's or the master's view.
- The one thing that would change this: a Prio S.A. or Petroreconcavo S.A. earnings call covering H1 or Q2 CY2026, added to `data/KAR/external/<provider>/` before the next run.
- No non-English peer call was miscoded as a gap or opacity here (§27) — the underlying issue is a genuine absence of any peer document, not a language barrier.
- Every one of the five specialist outputs (`00`–`04`) reached this same conclusion independently, so this is a high-confidence, well-verified "no data" result, not an ambiguous or partial one.



---

## competitive-intel / 00_competitive-intel-triage.md

_Source: `00_competitive-intel-triage.md`_

# Competitive-Intel Data Triage — KAR

## 0. Subject's Next Filing (the read-through target)

*"Karoon Energy Ltd (ASX: KAR) files next: H1 CY2026 (the six months to 30-Jun-2026), on a **standalone half-year** basis (first half of the fiscal year — nothing to cumulate it with, unlike a Chinese/Japanese cumulative-interim regime), released **today, 2026-08-27**."* [`2Q26 Activities Report (Jul-22-2026)`, p.7, cross-checked in `earnings/04_guidance-consensus.md` §0/§1A]. The filing will be a full reviewed income statement, balance sheet, and cash-flow statement (Appendix 4D + Half-Year Audit Review), consistent with the H1 2025 precedent in this pool. Karoon reports in US dollars under IFRS (AASB), fiscal year end 31 December, and files no US SEC or India SEBI equivalent — the ASX Appendix 4D / 4E / quarterly Activities Report set is the correct local-equivalent document type (§27) [`earnings/00_earnings-data-triage.md` §0; `earnings/04_guidance-consensus.md` line 3].

## 1. Peer Transcript Inventory & Reporting Calendar

**No peer transcript exists anywhere in this run's audit corpus.** `data/KAR/external/` — the only path this module is permitted to read for competitor calls (MODULE_RULES, "Where the peer transcripts come from") — does not exist as a directory at all; `ls data/KAR/external/` returns "No such file or directory". The pre-extracted pool manifest (`analyses/KAR_2026-08-27/_pool_extracts/manifest.json`) lists 85 sources, all resolving to top-level `data/KAR/` files: Karoon's own filings, Karoon's own earnings-call transcripts (2021–2025), Capital IQ workbooks about Karoon, and a set of unrelated personal documents (AI-agent sales-team spreadsheets, a podcast digest, a market-commentary PDF). None names, or is authored by, a competitor. A targeted search of the entire `data/KAR/` tree for every peer named in `business-model/08_competitive-map.md` — Prio S.A., GeoPark Limited, Gran Tierra Energy Inc, Jadestone Energy, Kosmos Energy, Pharos Energy, Tullow Oil, Capricorn Energy, Echelon Resources, Petroreconcavo S.A., Beach Energy, Santos, Woodside — returns only two incidental mentions inside Karoon's own ownership/profile RTFs (not calls, not commentary). No broker "peer earnings insight / call summary" paraphrase (G5) exists in the pool either — a search for that document type returns nothing.

There is also no sibling-pool pointer to flag: `data/<PEER>/` pools exist in this repo only for a different, unrelated set of tickers (AMZN, TSLA, META, etc.); none of Karoon's named peers (Prio, GeoPark, Gran Tierra, Petroreconcavo, Beach Energy, Santos, Woodside, Tullow, Kosmos, Pharos, Capricorn, Jadestone, Echelon) has its own pool anywhere in `data/`, and `data/EXTERNAL-INBOX/` holds no KAR-tagged drop. This is therefore not a "copy it over" case — there is nothing in the wider repository to copy.

| Peer | Ticker / venue | Std / currency / FY-end | Language | Most-recent call (native label) | Normalised window | Interim basis | Timing vs subject window | Scope overlap | Source (path) |
|---|---|---|---|---|---|---|---|---|---|
| — no rows — | — | — | — | — | — | — | — | — | No transcript, verbatim or paraphrase, exists for any named peer anywhere in `data/KAR/` (top level or `external/**`) as of 2026-08-27. |

**Peers named but with no transcript in this run's corpus (coverage gaps, not Timing-Rule states — MODULE_RULES: "a no-transcript peer is NOT a Timing state"):**
- **Prio S.A.** (BOVESPA:PRIO3) — Karoon's own FY2025 Annual Report Remuneration Report peer group + CIQ Competitors export [`business-model/08_competitive-map.md` §2]. The most direct Brazil-offshore rival; publicly listed and known to hold its own earnings calls, but none is present in this pool.
- **Petroreconcavo S.A.** (BOVESPA:RECV3) — closest scale-matched Brazil-only peer, but CIQ-relevancy-selected, not company-named [`business-model/08_competitive-map.md` §2]. No transcript present.
- **Gran Tierra Energy Inc.** (NYSEAMER:GTE) — company-named peer, but does not operate in Brazil (Colombia/Canada/Ecuador) [`business-model/08_competitive-map.md` §2]. No transcript present.
- **GeoPark Limited, Jadestone Energy, Kosmos Energy, Pharos Energy, Tullow Oil, Capricorn Energy, Echelon Resources** — named in Karoon's Remuneration Report "global peers" list [`business-model/08_competitive-map.md` §2]; several (Kosmos, Tullow, Pharos) do not operate in Brazil and are legacy/weak scope matches even in principle. No transcripts present for any of them.
- **Beach Energy, Santos, Woodside** (and smaller ASX names) — Karoon's "Australian market peers" [`business-model/08_competitive-map.md` §2]; do not compete in the Brazil segment. No transcripts present.

## 2. Coverage of the Subject's Exposure

Zero. With no peer transcript of any kind in the audit corpus, the reporting-peer set covers **0% of Karoon's revenue, gross profit, or segment exposure** — for both segments. Using `business-model/03_segment-map.md` weights: Brazil (the Baúna Project) supplies 77.9% of FY2025 revenue and 91.2% of FY2025 gross profit, and its segment profit before tax (US$241.9m) exceeds Karoon's entire consolidated profit before tax (US$143.2m) [`business-model/03_segment-map.md` §2, citing FY2025 Annual Report, Note 2(b), p.86]; the USA segment (Who Dat / Dome Patrol / Abilene) supplies the remaining 22.1% of revenue. Neither the dominant Brazil segment nor the smaller USA segment has any reporting-peer vantage in this run: the credible Brazil rivals (Prio, Petroreconcavo) and the credible-by-naming-only US Gulf-of-America-adjacent names have no call in the pool. **The uncovered majority is the entire company** — there is no partial read-through to report; this is not a case of one segment covered and another dark, it is total coverage absence.

## 3. Usability Check

| Requirement | Available? (Y/N) | Detail |
|---|---|---|
| ≥1 usable competitor call (verbatim transcript OR permitted broker paraphrase, G5) | N | No transcript and no broker paraphrase exists anywhere in `data/KAR/` (top level or `external/**`) |
| ≥2 distinct peer companies with verbatim transcripts (dispersion possible) | N | Zero peer transcripts of any kind |
| ≥1 peer reported the comparable window (read-through possible) | N | No peer call exists to check a window against |
| Peer set anchored by competitive-map | Y | `business-model/08_competitive-map.md` names peers from Karoon's own FY2025 Remuneration Report Industry Peer Group + CIQ Competitors export sourced to a Karoon Form Doc (Petroreconcavo is the one CIQ-relevancy-selected addition, already flagged as such upstream) |
| Subject's next-filing basis known | Y | H1 CY2026, standalone half-year, six months to 30-Jun-2026, released 2026-08-27 [`earnings/04_guidance-consensus.md` §1A] |
| Subject segment-map available (for scope-matching) | Y | `business-model/03_segment-map.md` — Brazil 77.9% revenue / 91.2% gross profit; USA 22.1% revenue |

## 4. Caps That Will Bind

| Trigger | Applies? (Y/N) | Cap |
|---|---|---|
| No usable call at all — no verbatim transcript AND no permitted broker paraphrase (G5) | **Y** | Insufficient — read-through/triangulation Not assessable |
| Only one peer transcript | N/A | Zero peer transcripts, not one |
| No peer reported the comparable window | **Y** (moot — no peer call of any kind exists) | Current-window read-through Not assessable |
| Dominant subject exposure uncovered by any peer | **Y** | Both segments (Brazil 77.9% of revenue, USA 22.1%) are entirely uncovered; net weight capped to zero |
| Peer set self-selected (no competitive-map) | N | Peer set is company-anchored via `competitive-map`; no self-selection cap needed on the naming side (Petroreconcavo's CIQ-selected status is already flagged upstream, and moot here regardless since no transcript exists for it) |
| Broker-paraphrase only (no verbatim) | N | Not applicable — no broker paraphrase exists either |

## 5. Sufficiency Verdict

- **Verdict:** Insufficient
- **Reason:** No peer transcript — verbatim or broker paraphrase — exists anywhere in `data/KAR/` (top level or the required `external/**` path), for any of the thirteen named peers in `business-model/08_competitive-map.md`; the module has no evidence to benchmark against.
- **Coverage of subject:** 0% — neither the dominant Brazil segment (77.9% of FY2025 revenue, 91.2% of gross profit) nor the USA segment (22.1% of revenue) has any reporting-peer vantage in this run's corpus.
- **Active caps:**
  - No usable call at all → read-through and narrative triangulation are Not assessable for this run (per MODULE_RULES: "No peer transcripts in the pool at all — module does not run [the benchmark]; a valid, decision-useful result").
  - Dominant and secondary segment exposure both uncovered → net read-through weight capped to zero, not merely Low.
  - Downstream `01_peer-claim-extraction` through `04_narrative-triangulation` will each report "Not assessable" for lack of input; `99_competitive-intel-synthesis` should state plainly that this module contributes no evidence to the master synthesis for this run.
- **Critical gaps:**
  - No Capital IQ "Competitor Transcripts" export for Karoon's peer set (Prio, Petroreconcavo, Gran Tierra, GeoPark, or any other named peer) has been dropped into `data/KAR/external/<provider>/`. This is the single highest-value data request: a Prio S.A. or Petroreconcavo S.A. earnings call covering H1/Q2 CY2026 (matching Karoon's H1 CY2026 window) would give this module its first usable read-through into the dominant Brazil segment.
  - `data/KAR/external/` does not exist as a directory at all — the operator has not yet run the CIQ "Competitor Transcripts" workflow for this ticker (MODULE_RULES, "Where the peer transcripts come from").



---

## competitive-intel / 01_peer-claim-extraction.md

_Source: `01_peer-claim-extraction.md`_

# Peer Claim Extraction — KAR

## Peer Set

No claim-extraction table is produced this run. Per the layer-0 triage (`analyses/KAR_2026-08-27/competitive-intel/00_competitive-intel-triage.md`), **zero peer transcripts — verbatim or broker-paraphrase — exist anywhere in this run's audit corpus.** `data/KAR/external/` (the only path this module is permitted to read for competitor calls, per MODULE_RULES "Where the peer transcripts come from") does not exist as a directory at all. The pre-extracted pool manifest (`analyses/KAR_2026-08-27/_pool_extracts/manifest.json`) lists 85 sources, all resolving to top-level `data/KAR/` files: Karoon's own filings, Karoon's own earnings-call transcripts, Capital IQ workbooks about Karoon, and unrelated personal documents. None names, or is authored by, a competitor.

The thirteen named peers carried forward from `business-model/08_competitive-map.md` are listed below for completeness (peer set anchoring, not claim extraction — the triage's Timing Rule note applies: a no-transcript peer is a coverage gap, never a Timing state):

| Peer | Ticker / venue | Native call label | Normalised window | Interim basis | Timing state |
|---|---|---|---|---|---|
| Prio S.A. | BOVESPA:PRIO3 | — no transcript in pool — | — | — | Coverage gap (not a Timing state) |
| Petroreconcavo S.A. | BOVESPA:RECV3 | — no transcript in pool — | — | — | Coverage gap |
| Gran Tierra Energy Inc. | NYSEAMER:GTE | — no transcript in pool — | — | — | Coverage gap |
| GeoPark Limited | NYSE:GPRK | — no transcript in pool — | — | — | Coverage gap |
| Jadestone Energy | LSE:JSE | — no transcript in pool — | — | — | Coverage gap |
| Kosmos Energy | NYSE:KOS | — no transcript in pool — | — | — | Coverage gap |
| Pharos Energy | LSE:PHAR | — no transcript in pool — | — | — | Coverage gap |
| Tullow Oil | LSE:TLW | — no transcript in pool — | — | — | Coverage gap |
| Capricorn Energy | LSE:CNE | — no transcript in pool — | — | — | Coverage gap |
| Echelon Resources | — | — no transcript in pool — | — | — | Coverage gap |
| Beach Energy | ASX:BPT | — no transcript in pool — | — | — | Coverage gap |
| Santos | ASX:STO | — no transcript in pool — | — | — | Coverage gap |
| Woodside | ASX:WDS | — no transcript in pool — | — | — | Coverage gap |

No broker "peer earnings insight / call summary" paraphrase (G5) was found in the pool for any of the above — the triage's search for that document type returned nothing. This is therefore not the "broker-paraphrase-only, weight-capped" case; it is the reserved no-usable-call-at-all case.

## Per-Peer Claim Blocks

Not produced. There is no peer transcript (verbatim or paraphrase) in `data/KAR/` — top level or `external/**` — from which to extract a single management statement on any of the eleven fixed benchmark dimensions (demand, pricing/ASP, volume/units, input costs, margin trajectory, channel/dealer inventory, capacity/capex, market-share claims, guidance direction, capital return, biggest risk named). Fabricating a block for any peer would violate the hard rule in MODULE_RULES: "Never invent a peer transcript, a peer quote, or a peer number — if it is not in a document in the pool, it does not exist for this module." No block is written for any of the thirteen peers above.

## Analyst Assertions Stripped (G5)

Not applicable. G5 strips analyst questions/assertions FROM a transcript that exists. With zero peer transcripts in the corpus, there is no analyst material to strip and no list to produce.

## Extraction Notes

- **No transcript could be attempted for any peer** — this is a coverage gap (no document exists), not a FAILED extraction of a document that exists but could not be read. No peer call is non-English-and-untranslated either; there is simply nothing in the pool to read for any of the thirteen named peers.
- **Every named peer has no transcript in the pool.** Confirmed by the triage's exhaustive search of `data/KAR/` (top level and the required `external/**` path) for all thirteen peers named in `business-model/08_competitive-map.md`: Prio S.A., Petroreconcavo S.A., Gran Tierra Energy Inc., GeoPark Limited, Jadestone Energy, Kosmos Energy, Pharos Energy, Tullow Oil, Capricorn Energy, Echelon Resources, Beach Energy, Santos, Woodside.
- **No sibling-pool pointer exists to route.** `data/<PEER>/` pools in this repository exist only for an unrelated set of tickers (AMZN, TSLA, META, etc.); none of Karoon's named peers has its own pool anywhere in `data/`, and `data/EXTERNAL-INBOX/` holds no KAR-tagged drop. There is nothing to copy into `data/KAR/external/`.
- **Single highest-value data request (carried from the `00` triage):** a Capital IQ "Competitor Transcripts" export for Prio S.A. or Petroreconcavo S.A. covering H1/Q2 CY2026 — matching Karoon's H1 CY2026 next-filing window (six months to 30-Jun-2026, released 2026-08-27) — dropped into `data/KAR/external/<provider>/`, would give this module its first usable read-through into the dominant Brazil segment (77.9% of FY2025 revenue, 91.2% of gross profit per `business-model/03_segment-map.md`).

**Verdict: Insufficient — no usable competitor call in the pool.** Downstream orbs (`02_dimension-matrix`, `03_readthrough-to-subject`, `04_narrative-triangulation`) should each report "Not assessable" for lack of input, consistent with `00`'s stated caps; `99_competitive-intel-synthesis` should state plainly that this module contributes no evidence to the master synthesis for this run.



---

## competitive-intel / 02_dimension-matrix.md

_Source: `02_dimension-matrix.md`_

# Peer Dimension Matrix — KAR (Karoon Energy Ltd)

## 1. The Matrix (peer × dimension)

No matrix is produced this run. Per `01_peer-claim-extraction.md`, this is the **zero-eligible-peer case**: no peer transcript — verbatim or broker-paraphrase — exists anywhere in the audit corpus for any of the thirteen peers named in `business-model/08_competitive-map.md` (Prio S.A., Petroreconcavo S.A., Gran Tierra Energy Inc., GeoPark Limited, Jadestone Energy, Kosmos Energy, Pharos Energy, Tullow Oil, Capricorn Energy, Echelon Resources, Beach Energy, Santos, Woodside). `data/KAR/external/` — the only path this module is permitted to read for competitor calls — does not exist as a directory. Per this module's own DEPENDENCIES rule: *"Zero eligible peers (`01` returned Insufficient — no usable call): emit an empty matrix, mark every dimension and dispersion Not assessable, and report the coverage gap. Do NOT invent a peer, a column, or a cell."*

The table below is the empty matrix — columns cannot be populated because there is no peer to be a column.

| Dimension | (no peer columns — zero eligible peers) |
|---|---|
| Demand | Not assessable — no peer transcript in pool |
| Pricing / ASP | Not assessable — no peer transcript in pool |
| Volume / units | Not assessable — no peer transcript in pool |
| Input costs | Not assessable — no peer transcript in pool |
| Margin trajectory | Not assessable — no peer transcript in pool |
| Channel / inventory | Not assessable — no peer transcript in pool |
| Capacity / capex | Not assessable — no peer transcript in pool |
| Market-share claim | Not assessable — no peer transcript in pool |
| Guidance direction | Not assessable — no peer transcript in pool |
| Capital return | Not assessable — no peer transcript in pool |
| Biggest risk named | Not assessable — no peer transcript in pool |

## 2. Consensus & Dispersion (per dimension)

Every dimension is **Not assessable — fewer than two peers in any window/scope cohort (in fact, zero peers with any usable claim)**. No consensus can be computed and no outlier can be named, because there is no peer statement of any kind to compare, group into a cohort, or attribute a quote/number to.

- **Demand:** Not assessable — zero peer claims.
- **Pricing / promo:** Not assessable — zero peer claims.
- **Volume / units:** Not assessable — zero peer claims.
- **Input costs:** Not assessable — zero peer claims.
- **Margin:** Not assessable — zero peer claims.
- **Channel / inventory:** Not assessable — zero peer claims.
- **Capacity / capex:** Not assessable — zero peer claims.
- **Market-share claim:** Not assessable — zero peer claims.
- **Guidance:** Not assessable — zero peer claims.
- **Capital return:** Not assessable — zero peer claims.
- **Biggest risk named:** Not assessable — zero peer claims. No peer-named risk exists in this run's corpus to carry forward to `03`'s read-through or the master synthesis's §8 disconfirmation register; this is a coverage gap in the competitive-intel module, not a finding that peers see no risk.

No cell in §1 or §2 is a manufactured "no material outlier" or "mixed" call — both of those are valid outcomes only where at least one peer claim exists to be materially aligned or split. Here there is nothing to align or split.

## 3. Alignment & Scope Notes

- **Window mismatches (G1):** None to report — there are no peer cells at all, so no window-alignment question arises.
- **Scope mismatches (G3):** None to report for the same reason.
- **Coverage-of-exposure (from `00`):** **0%.** With no peer transcript of any kind in the audit corpus, the reporting-peer set covers 0% of Karoon's revenue, gross profit, or segment exposure, for both segments. Karoon's Brazil segment (the Baúna Project) supplies 77.9% of FY2025 revenue and 91.2% of FY2025 gross profit, and its segment profit before tax (US$241.9m) exceeds Karoon's entire consolidated profit before tax (US$143.2m) [`business-model/03_segment-map.md` §2, citing FY2025 Annual Report, Note 2(b), p.86]; the USA segment (Who Dat / Dome Patrol / Abilene) supplies the remaining 22.1% of revenue. Neither segment has any reporting-peer vantage in this run — this is total coverage absence, not a partial gap.
- **Single highest-value data request (carried from `00`/`01`):** a Capital IQ "Competitor Transcripts" export for Prio S.A. or Petroreconcavo S.A. covering H1/Q2 CY2026 — matching Karoon's H1 CY2026 next-filing window (six months to 30-Jun-2026, released 2026-08-27) — dropped into `data/KAR/external/<provider>/`, would give this module its first usable read-through into the dominant Brazil segment.
- **Downstream implication:** `03_readthrough-to-subject.md` and `04_narrative-triangulation.md` should each report "Not assessable" for lack of input, consistent with `00`'s stated caps; `99_competitive-intel-synthesis.md` should state plainly that this module contributes no evidence to the master synthesis for this run.

## Self-Check

- [x] Every extracted peer claim from `01` appears in the matrix or is explicitly "not addressed" — there are zero extracted claims, and every dimension row states so explicitly.
- [x] No window mismatches exist to flag (no cells populated).
- [x] No scope tags to carry (no cells populated).
- [x] Consensus/dispersion: all dimensions marked Not assessable per the zero-peer rule; no cohort was pooled, no outlier manufactured, no false consensus forced.
- [x] No quote or number is presented anywhere in this report as peer evidence — all figures cited (segment revenue/profit shares) trace to `business-model/03_segment-map.md`, which itself cites the FY2025 Annual Report, not to any peer source.
- [x] No banned phrases used ("peers are cautious" or similar) — no peer characterization is made anywhere in this report.



---

## competitive-intel / 03_readthrough-to-subject.md

_Source: `03_readthrough-to-subject.md`_

# Peer Read-Through — KAR (Karoon Energy Ltd)

## 0. Peer Set & Reporting Calendar

Karoon Energy Ltd (ASX: KAR) files next: **H1 CY2026** (the six months to 30-Jun-2026), on a **standalone half-year** basis (first half of the fiscal year — nothing to cumulate it with), released **2026-08-27** (today) [`2Q26 Activities Report (Jul-22-2026)`, p.7; cross-checked in `analyses/KAR_2026-08-27/earnings/04_guidance-consensus.md` §0/§1A; `analyses/KAR_2026-08-27/competitive-intel/00_competitive-intel-triage.md` §0]. Karoon reports in US dollars under IFRS (AASB), fiscal year end 31 December, and files no US SEC or India SEBI equivalent — the ASX Appendix 4D/4E and quarterly Activities Report set is the local-equivalent document type (§27).

**No peer transcript — verbatim or broker-paraphrase — exists anywhere in this run's audit corpus.** `data/KAR/external/` (the only path this module is permitted to read for competitor calls, per MODULE_RULES "Where the peer transcripts come from") does not exist as a directory at all; confirmed directly in this run (`ls data/KAR/external/` → "No such file or directory"). The pre-extracted pool manifest (`analyses/KAR_2026-08-27/_pool_extracts/manifest.json`) and a direct listing of `data/KAR/` (85 files/folders) resolve entirely to Karoon's own filings, Karoon's own earnings-call transcripts, Capital IQ workbooks about Karoon, and a set of unrelated personal documents (AI-agent sales-team spreadsheets, a podcast digest, a market-commentary PDF, a personal audio file). None names, or is authored by, any of the thirteen peers carried forward from `business-model/08_competitive-map.md`. This finding is confirmed independently across all three upstream layers (`00_competitive-intel-triage.md`, `01_peer-claim-extraction.md`, `02_dimension-matrix.md`), each of which reached the same zero-peer-transcript conclusion by an exhaustive search of `data/KAR/`.

There is also no sibling-pool pointer to route: `data/<PEER>/` pools in this repository exist only for an unrelated set of tickers (AMZN, TSLA, META, and similar); none of Karoon's named peers (Prio S.A., Petroreconcavo S.A., Gran Tierra Energy, GeoPark, Jadestone Energy, Kosmos Energy, Pharos Energy, Tullow Oil, Capricorn Energy, Echelon Resources, Beach Energy, Santos, Woodside) has its own pool anywhere in `data/`, and `data/EXTERNAL-INBOX/` holds no KAR-tagged drop. This is not a "copy it over" case — there is nothing in the wider repository to copy into `data/KAR/external/`.

| Peer | Ticker / venue | Std / currency | Most-recent call (native label) | Normalised window | Interim basis | Timing vs subject window | Scope overlap with subject | Source |
|---|---|---|---|---|---|---|---|---|
| Prio S.A. | BOVESPA:PRIO3 | IFRS / BRL | — no transcript in pool — | — | — | Coverage gap (not a Timing state) | High (in principle — closest direct Brazil-offshore rival) | No transcript, verbatim or paraphrase, exists anywhere in `data/KAR/` (top-level or `external/**`) as of 2026-08-27 |
| Petroreconcavo S.A. | BOVESPA:RECV3 | IFRS / BRL | — no transcript in pool — | — | — | Coverage gap | High (in principle — scale-matched Brazil-only peer) | No transcript in pool |
| Gran Tierra Energy Inc. | NYSEAMER:GTE | US GAAP / USD | — no transcript in pool — | — | — | Coverage gap | Low (Colombia/Canada/Ecuador — no Brazil operations) | No transcript in pool |
| GeoPark Limited | NYSE:GPRK | — | — no transcript in pool — | — | — | Coverage gap | Low–Med (Latin America upstream, not Brazil-specific) | No transcript in pool |
| Jadestone Energy | LSE:JSE | — | — no transcript in pool — | — | — | Coverage gap | Low (Asia-Pacific offshore, not Brazil/US Gulf) | No transcript in pool |
| Kosmos Energy | NYSE:KOS | — | — no transcript in pool — | — | — | Coverage gap | Low (West Africa / US Gulf, no Brazil) | No transcript in pool |
| Pharos Energy | LSE:PHAR | — | — no transcript in pool — | — | — | Coverage gap | Low (Egypt / Vietnam) | No transcript in pool |
| Tullow Oil | LSE:TLW | — | — no transcript in pool — | — | — | Coverage gap | Low (West Africa) | No transcript in pool |
| Capricorn Energy | LSE:CNE | — | — no transcript in pool — | — | — | Coverage gap | Low (Egypt / Mauritania-Senegal) | No transcript in pool |
| Echelon Resources | — | — | — no transcript in pool — | — | — | Coverage gap | Not assessable | No transcript in pool |
| Beach Energy | ASX:BPT | — | — no transcript in pool — | — | — | Coverage gap | Low (Australian domestic gas, not Brazil/US Gulf) | No transcript in pool |
| Santos | ASX:STO | — | — no transcript in pool — | — | — | Coverage gap | Low (Australian/Asia-Pacific LNG-weighted) | No transcript in pool |
| Woodside | ASX:WDS | — | — no transcript in pool — | — | — | Coverage gap | Low (Australian/global LNG-weighted) | No transcript in pool |

**Read-through-eligible peers: zero.** No peer in the named set has ANY call in this run's corpus, so none can be classified reported-full, reported-sub-window, or even not-yet-reported-context-only. Per MODULE_RULES (Timing Rule): *"A no-transcript peer is NOT a Timing state... a coverage gap, handled by the Coverage-of-Exposure rule."* Every row above is therefore a coverage gap, not a Timing-Rule state — there is no "context-only" sub-table to produce in Section 2 either, because context-only requires a peer whose call merely has not been published yet, and here no call exists to be pending.

**Coverage of the subject's exposure (required):** Zero. With no peer transcript of any kind in the audit corpus, the reporting-peer set covers **0%** of Karoon's revenue, gross profit, or segment exposure, for both segments. Using `business-model/03_segment-map.md` weights: the **Brazil segment** (the Baúna Project) supplies 77.9% of FY2025 revenue and 91.2% of FY2025 gross profit, and its segment profit before tax (US$241.9m) exceeds Karoon's entire consolidated profit before tax (US$143.2m) [`business-model/03_segment-map.md` §2, citing FY2025 Annual Report, Note 2(b), p.86]; the **USA segment** (Who Dat / Dome Patrol / Abilene) supplies the remaining 22.1% of revenue. Neither segment — dominant or secondary — has any reporting-peer vantage in this run. The uncovered majority is **the entire company**: this is not the partial case where one segment is covered and another is dark; it is total coverage absence. Karoon's own private/undisclosed competitors in the Baúna area, and the fact that Prio and Petroreconcavo (the two credible direct comparators) simply have no call in this corpus, are the coverage gaps this creates.

## 1. Peer Management Signals (already-reported peers only)

**No table is produced.** There is no already-reported peer with a transcript in the pool from which to pull a single management statement on any of the eleven fixed benchmark dimensions (demand, pricing/ASP, volume/units, input costs, margin trajectory, channel/dealer inventory, capacity/capex, market-share claims, guidance direction, capital return, biggest risk named). Per `01_peer-claim-extraction.md`: *"Fabricating a block for any peer would violate the hard rule in MODULE_RULES: 'Never invent a peer transcript, a peer quote, or a peer number — if it is not in a document in the pool, it does not exist for this module.'"* No dimension row is written for any of the thirteen peers.

**Biggest risk named — carried forward per MODULE_RULES requirement:** Not assessable. No peer-named risk exists in this run's corpus to carry forward to this module's read-through or to the master synthesis's §8 disconfirmation register. This is a coverage gap in the competitive-intel module — it must not be read as "peers see no risk" or as any form of reassurance about Karoon's own risk register; the correct reading is that this module simply has no independent peer-sourced risk signal to contribute this run, and Karoon's own risk disclosures (`earnings/08_earnings-red-flags.md`, `business-model/12_red-flags-sweep.md`) remain the only risk evidence in this run regardless.

No analyst-question stripping (G5) was performed because no transcript exists to strip. No scope-mismatch note is produced because no signal was extracted to mismatch.

## 2. Read-Through to KAR

*Every row below is inference from peer read-through — NOT a filing fact about KAR (§6 Level 1, Guardrail G2).*

**No rows are produced.** There is no peer evidence, from any already-reported competitor, to feed a read-through row. Writing a plausible-sounding directional call for Karoon's H1 CY2026 Brazil or US Gulf production, pricing, or margin — even hedged as "inference" — would still require peer evidence that does not exist in this corpus; MODULE_RULES bars exactly this ("Never invent a peer transcript, a peer quote, or a peer number"). The correct output here is the absence itself, not a manufactured low-confidence row.

**Context only — not a current read-through:** Not applicable. This sub-table is reserved for peers whose comparable-window call has not yet been published (still pending). Here, no peer has ANY call in the pool at all — pending or otherwise — so there is no structural/historical context to report either. The "context-only" case and the "zero-transcript" case are different failure modes, and MODULE_RULES is explicit that a no-transcript peer is a coverage gap, not a context-only Timing state; conflating the two would misrepresent what this run actually found.

## 3. Cross-Sectional Dispersion

**Not assessable — fewer than two already-reported peers.** In fact there are zero already-reported peers with any usable claim, let alone two. No peer consensus can be computed and no outlier can be named on any of the eleven benchmark dimensions, because there is no peer statement of any kind in the corpus to compare, group into a cohort, or attribute a quote/number to. This matches the empty result independently reached in `02_dimension-matrix.md` §2 for every dimension.

## 4. Net Read-Through Verdict

**Verdict: Not assessable — no already-reported peer with overlapping scope; in fact no peer transcript of any kind exists in this run's corpus.**

No sourced subject bar is being tested here because there is no peer evidence to test it with — this is not a case of "a bar exists but peer evidence is ambiguous," it is a case of zero peer input. Neither a beat/miss framing NOR an operational-direction framing can be produced from this module this run: both require at least one already-reported, scope-overlapping peer statement, and none exists. `earnings/04_guidance-consensus.md` and `earnings/05_beat-miss-setup.md` may still carry a sourced consensus bar and beat/miss setup built from Karoon's OWN guidance and analyst consensus — that is the `earnings` module's job and is unaffected by this module's finding — but this module contributes **no** peer-derived operational-direction or beat/miss signal to it this run.

The single most important fact this module can report is negative evidence: **zero of Karoon's thirteen named peers — including the two closest direct Brazil-offshore comparators, Prio S.A. and Petroreconcavo S.A. — have any earnings call in this run's data pool**, so the module has no independent cross-check on Karoon's own narrative about Brazil offshore production economics, Santos-basin pricing, or US Gulf of America demand for the H1 CY2026 window. The one thing that would flip this to an actual assessable read-through is a single peer transcript covering H1 or Q2 CY2026 landing in `data/KAR/external/<provider>/` before the next run.

*This is inference feeding the beat/miss setup and the candor cross-check — it does not set a rating (G2).* (Stated for completeness per report structure; in this run the module has no inference to contribute at all.)

## 5. What Would Change This

There is no confirm/falsify boundary to restate from Section 2, because Section 2 contains no rows. The only thing that changes this module's output is a change in the INPUT DATA, not a future print of Karoon's own results:

- **A Capital IQ "Competitor Transcripts" export for Prio S.A. or Petroreconcavo S.A.** covering H1 or Q2 CY2026 — matching Karoon's H1 CY2026 next-filing window (six months to 30-Jun-2026, released 2026-08-27) — dropped into `data/KAR/external/<provider>/` (per MODULE_RULES routing: a force-routed `EXTERNAL-INBOX/<Provider>/KAR/…` drop, or directly into `data/KAR/external/<provider>/`, never a loose drop that a content-router would send to `data/PRIO/` or `data/RECV/` instead). This is the single highest-value data request carried forward from `00`/`01`/`02`.
- Absent that, this module will continue to report Not assessable for every future KAR run until a qualifying peer transcript is added to the pool.

## 6. Data Gaps & Caps

- **Peers with no transcript / not yet reported / scope-mismatched:** all thirteen named peers (Prio S.A., Petroreconcavo S.A., Gran Tierra Energy, GeoPark Limited, Jadestone Energy, Kosmos Energy, Pharos Energy, Tullow Oil, Capricorn Energy, Echelon Resources, Beach Energy, Santos, Woodside) have NO transcript, verbatim or broker-paraphrase, anywhere in `data/KAR/` (top level or `external/**`) as of 2026-08-27. `data/KAR/external/` does not exist as a directory. This is a coverage gap for every peer, not a Timing-Rule "not-yet-reported" state.
- **Windows that could not be aligned (G1) and why:** No window-alignment question arises — there are no peer cells populated at all, so there is nothing to normalise or misalign.
- **Which MODULE_RULES score caps bind:**
  - *"No peer transcripts in the pool at all"* → Triage `00` returned **Insufficient**; this module (`03`) correspondingly produces no read-through this run — a valid, decision-useful result, not a failure to execute.
  - *"No peer with a comparable-window call already published"* → Current-window read-through = **Not assessable** (binds; in fact stronger than the trigger's minimum condition, since zero peers have ANY call, comparable-window or otherwise).
  - *"A dominant segment / geography of the subject has NO reporting-peer vantage"* → Binds for BOTH of Karoon's segments (Brazil, 77.9% of FY2025 revenue / 91.2% of gross profit; USA, 22.1% of revenue). Net read-through weight is capped to **zero**, not merely Low — this is total, not partial, coverage absence.
  - *"Only ONE peer transcript available"* → Not applicable; there are zero transcripts, not one.
  - *"Peer set is self-selected"* → Not applicable; the peer set is anchored via `business-model/08_competitive-map.md` (Karoon's own FY2025 Remuneration Report Industry Peer Group + CIQ Competitors export). Petroreconcavo's CIQ-relevancy-selected status was already flagged upstream and is moot here regardless, since no transcript exists for it either.
  - *"Peer commentary available ONLY via broker paraphrase"* → Not applicable; no broker paraphrase exists in the pool for any peer.
- **Net weight:** **None / zero** (not Low) — this module contributes no evidence, of any weight, to the master synthesis for this run.

## Self-Check

- [x] G1 — no cross-window comparison was made; there is nothing to normalise.
- [x] G2 — no peer read-through is stated as a fact about Karoon; Section 2 explicitly contains no inference rows; no rating is set.
- [x] G3 — no scope-overlap claims were lined up, because none were extracted.
- [x] G4 — no absolute-level or growth-rate cross-peer comparison was made.
- [x] G5 — no analyst-vs-management distinction needed; no transcript exists to strip.
- [x] Timing — every named peer is classified as a coverage gap, never as "not-yet-reported / context-only" (reserved for a pending-but-existing call).
- [x] Falsifier basis — not applicable; no sub-window read exists.
- [x] Direction ceiling — not applicable; no direction-confidence band is asserted anywhere in this report.
- [x] Coverage of exposure — Section 0 states 0% coverage for both Karoon segments and names the uncovered majority as the entire company.
- [x] Two axes — not applicable; no Section 2 rows exist to carry either axis.
- [x] Every fact stated (segment weights, filing dates, peer names) traces to a cited source already in the pool (`business-model/03_segment-map.md`, `business-model/08_competitive-map.md`, `earnings/04_guidance-consensus.md`, `analyses/KAR_2026-08-27/competitive-intel/00_competitive-intel-triage.md`); no peer quote or number is invented anywhere in this report.
- [x] No direction-confidence band is stated (none asserted, so no basis-labelling question arises).
- [x] No confirm/falsify condition is asserted that a reader could mis-score; Section 5 states plainly that none exists.
- [x] No non-English peer call was found, so no translation question arises.
- [x] No banned phrase ("peers confirm", "in line with peers", "peers are cautious") appears anywhere in this report.



---

## competitive-intel / 04_narrative-triangulation.md

_Source: `04_narrative-triangulation.md`_

# Narrative Triangulation — KAR (Karoon Energy Ltd) vs Peers

## 0. Why This Report Is Empty of Comparisons (read first)

This module's own upstream layers establish, independently and consistently, that **zero peer transcripts — verbatim or broker-paraphrase — exist anywhere in this run's audit corpus** for any of the thirteen peers named in `business-model/08_competitive-map.md` (Prio S.A., Petroreconcavo S.A., Gran Tierra Energy Inc., GeoPark Limited, Jadestone Energy, Kosmos Energy, Pharos Energy, Tullow Oil, Capricorn Energy, Echelon Resources, Beach Energy, Santos, Woodside):

- `00_competitive-intel-triage.md` — `data/KAR/external/` (the only path this module is permitted to read for competitor calls, per MODULE_RULES) does not exist as a directory at all. Coverage of the subject's exposure by any reporting peer: **0%**, for both the Brazil segment (77.9% of FY2025 revenue, 91.2% of gross profit) and the USA segment (22.1% of revenue).
- `01_peer-claim-extraction.md` — no per-peer claim block was produced for any of the thirteen peers; this is the reserved "no usable call at all" case, not a partial-coverage case.
- `02_dimension-matrix.md` — an empty matrix, every dimension and every dispersion cell marked "Not assessable — no peer transcript in pool."

Per MODULE_RULES ("No peer transcripts in the pool at all — module does not run [the benchmark]; a valid, decision-useful result") and this module's own DEPENDENCIES rule, the correct output when `01`/`02` are empty is **not** to fabricate a peer comparison, a peer quote, or a peer number. There is nothing to triangulate KAR's narrative against. This report states that plainly, records the subject's own testable claims for completeness (all marked Untestable), and stops there.

## 1. Subject Claim vs Peer Picture (per dimension)

Every row below is drawn from KAR's own management narrative (`earnings/02_revenue-drivers.md`, `earnings/03_margin-drivers.md`, `earnings/04_guidance-consensus.md`, and the FY2025 results call). The "Peer picture" column is empty in every row for the same single reason: no peer transcript exists in this run's corpus (§0). No cell below should be read as "peers agree" or "peers are silent" — both would imply a peer statement that does not exist.

| Dimension | KAR says | Peer picture (from `02`, same scope/window) | Agree / Contradict / Untestable | Note |
|---|---|---|---|---|
| Demand | 2025 softness attributed to "increased supply from OPEC+, subdued global economic growth…strategic stockpiling in China," giving way in 2026 to a geopolitical risk-premium spike from Middle East conflict / Strait of Hormuz disruption risk — a supply-and-risk-premium story, not a demand-growth story [Shareholder/Analyst Call, 21-May-2026, p.5; `earnings/02_revenue-drivers.md` §3] | — no peer transcript exists (§0) | **Untestable** | No peer vantage of any kind; scope would in any case need matching against a Brazil-offshore or US Gulf peer's own demand read, which does not exist in this pool |
| Pricing / ASP | Baúna realized price −14% YoY FY2025 ($77.60→$66.57/bbl), then +33% QoQ/+47% YoY to $94.56/bbl in 2Q26; Who Dat liquids −16% YoY FY2025, then +55% QoQ/+58% YoY to $101.93/bbl in 2Q26 [`Q4 2025 Activities Report`, p.3; `2Q26 Activities Report`, p.3] | — no peer transcript exists | **Untestable** | Karoon is a Brent/Mars-benchmarked price-taker with no hedges (`earnings/02` §2); a same-window Brazil peer (Prio, Petroreconcavo) realized-price print would be the natural cross-check and is absent |
| Market-share claim | Karoon explicitly states market share is "**not applicable**" for it — it sells 100% of production as a spot/contract commodity to marketers/JV operators, with two customers accounting for >98% of revenue [`earnings/02_revenue-drivers.md` §3, citing business-model `03_segment-map.md` §3] | — no peer transcript exists | **Untestable** | The subject itself disclaims a share narrative on this dimension (upstream oil is priced off a global commodity benchmark, not sold on relative share), so even a peer transcript would not test a genuine KAR share claim — see §3 below |
| Margin trajectory | FY2025 revenue decline of $147.9m (−19.0% YoY) attributed entirely to price (−$100.4m) and sales-timing volume (−$47.5m) per the CFO's own two-part bridge, which reconciles exactly with no unexplained residual [FY2025 Earnings Call, 26-Feb-2026, p.5; `earnings/02_revenue-drivers.md` §6] | — no peer transcript exists | **Untestable** | No Brazil-offshore or US Gulf peer margin bridge exists in this pool to check the price/volume attribution against |
| Input costs | Unit production costs (NWI) guided at US$12–15/boe for CY2026; unit DD&A guided at US$15–17/boe [`2Q26 Activities Report`, "2026 Full Year Guidance" table; `earnings/04_guidance-consensus.md` §2] | — no peer transcript exists | **Untestable** | A peer's own unit-cost commentary for the same Brazil offshore or US Gulf basin would be the natural comparator; none exists |
| Guidance direction | Karoon issues **no formal revenue/EBITDA/NPAT guidance** (price-taker); it guides production, unit costs, and capex only. CY2026 total production guidance was cut ≈11% at the midpoint (8.65→7.7 MMboe) between Jan and Jul 2026, driven by the Who Dat E-riser leak and the Baúna SPS-92 well shut-in [`earnings/04_guidance-consensus.md` §2; `earnings/02_revenue-drivers.md` §4] | — no peer transcript exists | **Untestable** | A same-window peer guidance revision (up or down, and for what stated reason) is the natural cross-check on whether KAR's cut reflects an asset-specific outage or a basin-wide issue; absent |

## 2. Contradictions (named and sized — §3)

*A peer contradiction is a disconfirmation FLAG (§8), not a proven falsehood — it raises a question the subject's own disclosure must answer (G2).*

**None found, and none can be tested.** No contradiction can be named because there is no peer statement, quote, or number in this run's corpus to set against any KAR claim (§0). Reporting "no contradictions found" here would misstate the actual state of the evidence — it is not that peers were checked and agreed; peers were never available to check. This table is intentionally empty.

| # | Subject claim | Contradicting peer evidence | Gap / why incompatible | Severity (High/Med/Low) |
|---|---|---|---|---|
| — | — | — | Not assessable — zero peer transcripts in the corpus (§0) | — |

**On the market-share cross-check specifically:** MODULE_RULES and this module's own self-check require running the "everyone claims share gains" test whenever the subject and at least one peer both make a share claim. That test cannot be run here on TWO independent grounds, not one: (1) no peer transcript exists to make any share claim at all, and (2) KAR itself makes no share-gain claim to test — it explicitly states market share is "not applicable" to a price-taking upstream commodity producer selling >98% of revenue to two counterparties (§1 above). There is no simultaneous-gains scenario to evaluate, jointly-possible or otherwise, and none is manufactured here.

## 3. Corroborations

**None found, and none can be tested.** A peer transcript is Level-1 evidence about the PEER (G2); with zero peer transcripts in the corpus, there is no peer statement available to corroborate — or fail to corroborate — any KAR claim in §1. No line is written here asserting "peers corroborate," because doing so would require a peer quote and number that do not exist in this pool.

## 4. Routing (via the module synthesis → the master synthesizer)

- **Governance / candor read:** No independent-vantage input is available this run. This module cannot supply a peer-based cross-check on whether KAR's management narrative about demand, pricing, its own no-hedge/no-share-claim framing, or its production-guidance cuts is candid — that would require at least one peer transcript, and none exists. `management-governance/06` should treat this as a coverage gap, not as a clean or a flagged read.
- **§8 disconfirmation:** No disconfirming-evidence item is contributed by this module this run. The master synthesizer's bear case and kill criteria carry no peer-triangulation input from `competitive-intel` for KAR as of 2026-08-27.
- **Single highest-value data request (carried forward from `00`/`01`/`02`):** a Capital IQ "Competitor Transcripts" export for Prio S.A. or Petroreconcavo S.A. covering H1/Q2 CY2026 — matching Karoon's H1 CY2026 next-filing window (six months to 30-Jun-2026, released 2026-08-27) — dropped into `data/KAR/external/<provider>/`, would give this module its first usable narrative cross-check on the dominant Brazil segment (77.9% of FY2025 revenue, 91.2% of gross profit).

## 5. Verdict

**Not testable** — KAR's own claims have no overlapping peer vantage anywhere in this run's corpus. Zero peer transcripts (verbatim or broker-paraphrase) exist for any of the thirteen named peers, so neither a contradiction nor a corroboration can be named on any of the six benchmarked dimensions (demand, pricing, market-share, margin, input costs, guidance direction). The single most important fact this report can state is a coverage fact, not a narrative one: **0% of KAR's revenue and gross profit — across both the Brazil segment (77.9%/91.2%) and the USA segment (22.1%) — has any reporting-peer vantage in this run**, and the highest-value fix is a Prio S.A. or Petroreconcavo S.A. transcript covering the same H1 CY2026 window.
