# competitive-intel Module Dossier — META

> Deterministic, lossless concatenation of every artifact in this module — the module synthesis and every specialist output, in order. Generated mechanically (no LLM rewriting), so nothing is omitted or paraphrased. This is the module's "see everything" tier; the module's decision lives in `99_*-synthesis.md` and the short read in `competitive-intel_memo.md`.

- Generated: 2026-08-27T13:56:42Z
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

# Competitive-Intel Module — META (Synthesis)

## Abstract

The competitive-intel pool for META holds no usable peer benchmark: zero verbatim transcripts and zero permitted broker paraphrases exist for Alphabet, Snap, or ByteDance in this run's corpus, leaving no peer call to weigh against META's Q3 2026 print. The net read-through is Not assessable, carrying zero weight into the master's beat/miss view. META's own Q2 2026 narrative on ad-impression growth, price-per-ad gains, and raised capex guidance was never cross-examined against a peer, so it neither survived nor failed the check — it remains untested. The reporting peer set covers 0% of META's exposure, leaving the dominant Family of Apps segment (99.3% of Q2 2026 revenue) unbenchmarked. The verdict is Insufficient: fixable for Alphabet and Snap, though ByteDance is privately held and will never file a call.

## 1. Verdict Block

- **Net read-through direction:** Not assessable — no eligible peer call exists in this run's audit corpus (`00_competitive-intel-triage.md`, Verdict: Insufficient; `01_peer-claim-extraction.md`, Verdict: Insufficient). There is no sourced subject bar to check because there is no peer signal to check it against — this is a data-absence result, not a degraded-bar case, so it is carried as Not assessable rather than "Not assessable (bar-dependent)."
- **Read-through weight:** Not assessable — zero read-through exists to weight (moves with the direction axis per the module rule: when direction is Not assessable for lack of an eligible peer, weight and confidence are Not assessable too, not an invented Low).
- **Read-through direction confidence (§10 band + basis):** Not assessable — no §10 band can be assigned; there is no directional read to attach a probability to.
- **Narrative triangulation verdict** *(from `04`)*: Not testable. `04_narrative-triangulation.md` documents META's own Q2 2026 claims (ad impressions +14% YoY, price-per-ad +12% YoY, GAAP operating margin 31% after a $2.4bn legal charge and $1.2bn severance, Q3 2026 revenue guidance $61–64bn, FY26 capex narrowed to $130–145bn) but marks every comparison row "Untestable" because zero peer claims exist to set against them.
- **Peer-coverage of subject /100:** 0 — built per §1B below. Zero read-through-eligible peer speaks to any part of META's revenue, including the dominant Family of Apps segment (99.3% of Q2 2026 revenue, $60,370m / $60,801m) [Q2 2026 Form 10-Q, Note 12].
- **Benchmark data-sufficiency /100:** 10 — built per §1B below.
- **Dispersion:** Not assessable *(from `02_peer-dimension-matrix.md`, which is empty — no peer populates any matrix cell, so no dispersion or outlier read can be produced)*.
- **Single most important peer signal (one line):** None exists. The single most important FACT this run is the absence itself: `data/META/external/` does not exist, and no sibling `data/GOOGL`, `data/ALPHABET`, or `data/SNAP` pool exists either — the named peers' calls are not anywhere in the ingested data.
- **Biggest contradiction or corroboration of the subject's narrative (one line):** Neither. Zero peer claims exist on any of the six fixed benchmark dimensions (demand, pricing, market-share, margin trajectory, input costs, guidance direction), so no contradiction or corroboration can be named or sized (`04_narrative-triangulation.md`, §2–§3).

## 1B. Score Builds (reproducible — CLAUDE.md §12)

**Peer-coverage of subject /100** = `round(covered_exposure_pct)`.

`business-model/03_segment-map.md` IS available this run, so the segment weights exist: Family of Apps (FoA) = 99.3% of Q2 2026 revenue ($60,370m / $60,801m); Reality Labs (RL) = 0.7% [Q2 2026 Form 10-Q, Note 12]. `covered_exposure_pct` is computed by summing the revenue weight of every segment spoken to by at least one read-through-eligible, scope-overlapping peer on a matched window. Zero such peers exist (`00_competitive-intel-triage.md`, §1–§2), so:

| Segment | Weight of subject revenue | Spoken to by ≥1 eligible peer? | Contribution to covered_exposure_pct |
|---|---:|---|---:|
| Family of Apps (FoA) | 99.3% | No — no reporting peer in corpus | 0 |
| Reality Labs (RL) | 0.7% | No — no reporting peer in corpus | 0 |
| **Total covered_exposure_pct** | | | **0%** |

**Peer-coverage of subject /100 = round(0) = 0.**

**Benchmark data-sufficiency /100** = sum of four components:

| Component | Points | Value | Rule applied |
|---|---:|---:|---|
| Reporting-peer breadth | 0–40 | 0 | N (distinct read-through-eligible peer companies) = 0 → 0 |
| Exposure coverage | 0–30 | 0 | round(0 × 0.30) = 0 |
| Source quality | 0–20 | 0 | No eligible peer is verbatim, and none is broker-paraphrase either (base 0, no −10 penalty needed since base is already 0) |
| Peer-set provenance | 0–10 | 10 | Peer set IS anchored by `business-model/08_competitive-map.md` (Alphabet/Google, ByteDance/TikTok, Snap) — not self-selected |
| **Total** | 0–100 | **10** | 0 + 0 + 0 + 10 |

Note on the floor-to-zero rule: the total is NOT floored to 0 despite the triage's "Insufficient" verdict, because the module's own rule floors the WHOLE score to 0 only "when the pool holds no usable call at all" — that condition is true here for the numerator (no usable peer call), but the peer-set-provenance component is not conditioned on a usable call; it measures whether the peer SET itself came from an independent source (`competitive-map`), which it did. The 10 correctly reports "the peer set was identified correctly; nothing about it could be benchmarked."

## 1A. Module Disconfirmation (CLAUDE.md §8)

- **Strongest bear read-through:** None available. No peer signal exists to undermine META's next print.
- **Strongest bull read-through:** None available. No peer signal exists to support META's next print.
- **Single killer contradiction** from `04`: None — "no table populated" (`04_narrative-triangulation.md`, §2); zero peer claims exist to contradict META's Q2 2026 narrative.
- **Disconfirming evidence already visible** in the peer calls: None — there are no peer calls in this run's corpus.
- **What data would change this conclusion:** No specific META line-item actual can flip this module's Not-assessable read, because the read is blocked by a total absence of peer evidence, not by an unresolved subject data point. What WOULD change the conclusion is peer-side data: a CIQ "Competitor Transcripts" export for Alphabet/Google's or Snap's most recently reported quarter, routed into `data/META/external/<provider>/` (or force-routed under `EXTERNAL-INBOX/<Provider>/META/…`), covering a window comparable to META's Q3 2026 print (the ~3 months ending ~30 Sept 2026). Once present, the load-bearing falsifiers would be the same ones `earnings/*` already tracks for META's own print: Q3 2026 total revenue against the guided $61–64bn range [Q2 2026 press release, Outlook], ad-impression growth against the Q2 2026 +14% YoY base, and price-per-ad growth against the Q2 2026 +12% YoY base [Q2 2026 Earnings Call transcript, Jul 29, 2026, prepared remarks — Susan Li] — a peer read on the same digital-ad demand/pricing dimensions, on the comparable window, is what would let this module test those boundaries instead of leaving them untested.
- **What would force a downgrade / rejection:** Nothing from this module — there is no read-through contribution to downgrade. The module's OWN standing (Insufficient) should be revisited if a future run finds a peer transcript now missing; until then, this module contributes zero evidence in either direction and should not be read as a mild negative or a mild positive — it is an absence, not a signal.

## 2. Specialist Roll-Up

| Specialist | Verdict Line | Biggest Finding |
|---|---|---|
| competitive-intel-triage (`00`) | Insufficient — zero competitor transcripts and zero broker paraphrases in the pool; 0% coverage of META's exposure | `data/META/external/` does not exist; no sibling `data/GOOGL`, `data/ALPHABET`, or `data/SNAP` pool exists anywhere in the ingested `data/` tree |
| peer-claim-extraction (`01`) | Insufficient — no usable competitor call in the pool | No per-peer claim blocks could be produced for Alphabet, ByteDance, or Snap; producing them would mean inventing figures with no source |
| peer-dimension-matrix (`02`) | Empty — every cell Not assessable (report file has no populated content) | No peer populates any dimension, so no consensus or dispersion read exists |
| peer-readthrough-to-subject (`03`) | Not produced — depends on `02`, which is empty (report file has no populated content) | No current-quarter read-through could be built; zero eligible peers to date-gate against META's Q3 2026 window |
| peer-narrative-triangulation (`04`) | Not testable — META's own Q2 2026 claims documented but every peer-comparison row marked "Untestable" | META's demand (+14% impressions), pricing (+12% price/ad), and margin claims sit entirely on management's own word this run, with no independent peer check |

## 3. Reconciliation

No material disagreements. All four upstream specialists converge on the same underlying fact — zero peer transcripts, zero broker paraphrases, 0% coverage of META's exposure — and derive consistent verdicts from it (`00` Insufficient, `01` Insufficient, `02` empty, `04` Not testable). `03` was never produced because it depends on the empty `02`; this is the correct behaviour under the module's `fail_fast: false` rule (a missing/empty upstream is noted and the dependent proceeds with what is available, which in this case is nothing).

## 4. Score Cap Application

| Cap Trigger | Applied? (Y/N) | Affected | Final Cap |
|---|---|---|---|
| No peer transcripts | Y | read-through | Not assessable |
| Only one peer | N | weight | n/a (zero peers, not one) |
| No peer reported the window | Y (moot given zero peers) | current read-through | Not assessable |
| Exposure uncovered (by coverage band) | Y — covered_exposure_pct = 0%, below the 30% threshold | net weight | Low (this band's ceiling; superseded in practice by the no-transcripts cap above, which drives the net weight to Not assessable rather than merely Low) |
| Peer set self-selected | N — peer set IS anchored by `business-model/08_competitive-map.md` | net weight | n/a |
| Broker-paraphrase only | N — no broker paraphrase exists either (the gap is total, not a source-quality issue) | tone | n/a |

The binding cap is "no peer transcripts": with zero eligible peers, the net read-through direction, weight, and direction-confidence band all collapse to Not assessable together, per the module's stated rule that these three move as one when there is no eligible peer to carry a read.

## 5. Note To The Final Synthesizer

- **No read-through to carry.** This module supplies neither a beat/miss lean nor an operational-direction lean for META's Q3 2026 print — weight is Not assessable and the direction-confidence band is Not assessable, together, because there is no eligible peer signal (not because there is an unresolved bar). Do not substitute silence for a neutral/toss-up read; treat this as a genuine absence of evidence, distinct from a Toss-up (45–60%) directional call.
- **No falsifiers to hand off from this module.** §1A names what WOULD produce a testable falsifier (a peer transcript for Alphabet or Snap covering a window comparable to META's Q3 2026 print, tested against META's own guided revenue range and Q2 2026 impression/price-per-ad growth rates) — but none exists yet, so there is no line-item boundary this module can hand the master's §8 kill-criteria this run.
- **Narrative not corroborated, not contradicted — untested.** META's Q2 2026 claims on ad-demand growth, ad pricing, margin trajectory (legal charge and severance called out as the drivers of the operating-income decline), input-cost inflation, and forward guidance were never cross-examined against a peer this run (`04`, §1). The master's governance/candor read for this run must rely on sources other than peer triangulation — e.g., internal consistency within META's own filings, or prior-guidance-versus-actual accuracy from `earnings/*`.
- **Coverage gap: the whole company.** 0% of META's revenue — including the dominant Family of Apps segment (99.3% of Q2 2026 revenue) — has any reporting-peer vantage in this run. This is not a partial-coverage caveat; it means nothing in this module should be read as saying anything, positive or negative, about any part of META's business.
- **Cap applied: no-usable-call cap, binding.** The exposure-coverage band (covered_exposure_pct = 0%, which alone would cap net weight at Low) is superseded by the more severe no-transcripts cap, which removes weight entirely rather than merely capping it. The peer-set-provenance check passed (peer set correctly anchored to `business-model/08_competitive-map.md`, not self-selected) — the gap is a data-absence problem, not a peer-set-quality problem, and per CLAUDE.md §27 it is not treated as a language or opacity issue since no non-English document was even found.

## 6. Simple Summary

- No, there are no real peer calls to benchmark META against this run — zero transcripts, zero broker paraphrases, for Alphabet, Snap, or ByteDance.
- The already-reported peers imply nothing for META's Q3 2026 print, because there are no already-reported peers in this run's corpus; the read-through weight is Not assessable, not Low.
- META's own story (ad growth, ad pricing, margin, guidance) cannot be said to hold up or fall apart against peers — it was never tested against them this run.
- The benchmark is blind to 100% of META's business: Family of Apps (99.3% of revenue) and Reality Labs (0.7%) both have zero reporting-peer vantage.
- This module is honest but not currently useful as an input to the master synthesizer's beat/miss or scenario view for this run — it correctly reports "no signal" rather than manufacturing one, which is itself the useful output (CLAUDE.md North Star, §1).
- The gap is partially fixable: routing a CIQ "Competitor Transcripts" export for Alphabet/Google and/or Snap into `data/META/external/<provider>/` would let a future run actually benchmark META; ByteDance is privately held and this leg can never be closed by any future data pull.
- Data sufficiency (10/100) and peer-coverage (0/100) are both correctly near the floor — they are not inverted, and neither should be misread as "weak but present" benchmark; the pool is functionally empty of peer evidence.



---

## competitive-intel / 00_competitive-intel-triage.md

_Source: `00_competitive-intel-triage.md`_

# Competitive-Intel Data Triage — META

## 0. Subject's Next Filing (the read-through target)

*"META files next: Q3 2026 (standalone three-month quarter, US GAAP, US 10-Q), covering ~3 months ending ~30 Sept 2026, expected ~28 Oct 2026 (CIQ-derived estimated release date)."* [Meta Platforms Inc NasdaqGS:META Events Calendar.xls, Events Calendar tab, "Oct-28-2026 4:00 PM — Estimated Earnings Release Date (CIQ Derived)"] META's own guidance already frames the covered window: "we expect third quarter 2026 total revenue to be in the range of $61-64 billion." [Q2 2026 Form 10-Q / Q2 2026 press release, Outlook; corroborated by MetaPlatforms EstimatesReport.xls, Guidance tab, latest guidance issued 2026-07-29 for Q3 2026]

META is a US filer reporting a **standalone** calendar quarter (10-Q), not a cumulative interim period — the §27 cumulative-vs-standalone trap does not apply here, but it DOES apply on the peer side if any peer files on a cumulative basis (none currently in the pool — see below).

## 1. Peer Transcript Inventory & Reporting Calendar

**No peer transcript exists in this run's audit corpus.** `data/META/external/` does not exist as a directory (confirmed via directory listing), so there is no location this module is permitted to read for competitor calls [Auditable-corpus rule, MODULE_RULES.md — this module reads only `data/{SUBJECT}/` top level and `external/**`]. A search of the full sibling `data/` tree (`ALUMINIUM, AMZN, BG, COCOA, COFFEE, CORN, DHER, EMAAR, EXTERNAL-INBOX, HAIER, HCG, INDIAMART, KAR, META, MGM, MIDEA, NEWS-ARCHIVE, NHY, NIVABUPA, NOVO, NVT, ORCL, SMPL, SOYBEAN, SUGAR, TMCV, TSLA, UBER, V, WATCHLIST, WHEAT`) found no `GOOGL`, `SNAP`, `ALPHABET`, or `BYTEDANCE`/`TIKTOK` pool at all — so there is not even a sibling-pool POINTER to flag; the named peers' calls simply are not anywhere in the ingested data (`data/EXTERNAL-INBOX/_routed/` contains only one unrelated cloud-infrastructure alt-data PDF, no peer transcript). The pre-extraction manifest (`analyses/META_2026-08-27/_pool_extracts/manifest.json`) confirms the pool holds no CIQ "Competitor Transcripts" export — every source file is META's own filings, transcripts, press releases, decks, and CIQ company-level exports.

| Peer | Ticker / venue | Std / currency / FY-end | Language | Most-recent call (native label) | Normalised window | Interim basis | Timing vs subject window | Scope overlap | Source (path) |
|---|---|---|---|---|---|---|---|---|---|
| — | — | — | — | — | — | — | — | — | No transcript present anywhere in the pool or its `external/` area |

Named competitors from `business-model/08_competitive-map.md` and their transcript status — all are coverage gaps (no row above):

- **Alphabet / Google (GOOGL)** — no transcript in `data/META/external/`, no sibling `data/GOOGL` (or `ALPHABET`) pool exists at all. Closest overlap is YouTube/video and ad-budget competition, not a full social-network match. [business-model/08_competitive-map.md, Competitor A]
- **ByteDance / TikTok** — private; ByteDance does not publish audited financials or hold public earnings calls. [business-model/08_competitive-map.md, Competitor B] Structurally non-reporting, not merely absent from this pool.
- **Snap (SNAP)** — no transcript in `data/META/external/`, no sibling `data/SNAP` pool exists. Much smaller scale ($5.931bn FY25 revenue vs. META's FoA $198.76bn) but a directly named, product-overlapping rival. [business-model/08_competitive-map.md, Competitor C]

## 2. Coverage of the Subject's Exposure

Using `business-model/03_segment-map.md`: Family of Apps (FoA) is 99.3% of Q2 2026 revenue ($60,370m / $60,801m) and 124.6% of consolidated operating income; Reality Labs (RL) is the remaining 0.7% of revenue and a loss-making segment. [Q2 2026 Form 10-Q, Note 12] Because **no peer transcript of any kind is present**, the reporting (read-through-eligible) peer set covers **0% of META's exposure** — not FoA, not RL, not any geography or product tier. The dominant segment (FoA, 99.3% of revenue) has zero reporting-peer vantage in this run's audit corpus, even though named competitors (Alphabet, Snap) DO file public results elsewhere — those results simply are not in this pool. The uncovered majority is effectively the entire company: this is not a partial-coverage gap, it is a total data-absence gap.

## 3. Usability Check

| Requirement | Available? (Y/N) | Detail |
|---|---|---|
| ≥1 usable competitor call (verbatim transcript OR permitted broker paraphrase, G5) | N | No transcript and no broker "peer earnings insight" paraphrase exists anywhere in `data/META/` or `data/META/external/`. |
| ≥2 distinct peer companies with verbatim transcripts (dispersion possible) | N | Zero peer transcripts present. |
| ≥1 peer reported the comparable window (read-through possible) | N | No peer call present to date-gate against META's Q3 2026 window. |
| Peer set anchored by competitive-map | Y | `business-model/08_competitive-map.md` names Alphabet/Google, ByteDance/TikTok (private), and Snap — but naming the peer set does not supply their transcripts. |
| Subject's next-filing basis known | Y | Q3 2026, standalone 3-month quarter, US 10-Q, expected ~28 Oct 2026. [Events Calendar tab; Q2 2026 press release Outlook] |
| Subject segment-map available (for scope-matching) | Y | `business-model/03_segment-map.md` — FoA 99.3% / RL 0.7% of revenue. |

## 4. Caps That Will Bind

| Trigger | Applies? (Y/N) | Cap |
|---|---|---|
| No usable call at all — no verbatim transcript AND no permitted broker paraphrase (G5) | Y | **Insufficient — read-through/triangulation Not assessable.** |
| Only one peer transcript | N | Not applicable (zero, not one). |
| No peer reported the comparable window | Y (moot given zero peers) | Current-window read-through Not assessable. |
| Dominant subject exposure uncovered by any peer | Y | FoA (99.3% of revenue) read-through Not assessable; net weight = zero, not merely capped. |
| Peer set self-selected (no competitive-map) | N | Peer set IS anchored by `08_competitive-map.md` — this cap does not apply; it does not help, since no transcripts exist regardless. |
| Broker-paraphrase only (no verbatim) | N | Not applicable — there is no broker paraphrase either; the gap is total. |

## 5. Sufficiency Verdict

- **Verdict:** Insufficient
- **Reason:** The pool contains zero competitor earnings-call transcripts and zero permitted broker paraphrases of a peer call — `data/META/external/` does not exist, and no sibling `data/<PEER>/` pool (GOOGL, SNAP, ByteDance) exists either, so there is no usable call and no even-unauditable pointer to one.
- **Coverage of subject:** 0% — no reporting peer speaks to any part of META's exposure; the dominant Family of Apps segment (99.3% of Q2 2026 revenue) [Q2 2026 Form 10-Q, Note 12] has no reporting-peer vantage in this run.
- **Active caps:** No-usable-call cap (read-through and triangulation Not assessable); dominant-exposure-uncovered cap (net read-through weight = zero, since the gap is total rather than partial).
- **Critical gaps:** (1) No CIQ "Competitor Transcripts" export for Alphabet/Google or Snap has been placed in `data/META/external/<provider>/` — the operator would need to force-route such an export under `EXTERNAL-INBOX/<Provider>/META/…` or drop it directly into `data/META/external/<provider>/` for this module to produce a benchmark. (2) ByteDance is privately held and structurally will never file a public transcript — even a complete data pull cannot close that leg of the peer set; only the Alphabet and Snap legs are fixable by adding data.



---

## competitive-intel / 01_peer-claim-extraction.md

_Source: `01_peer-claim-extraction.md`_

# Peer Claim Extraction — META

## Peer Set

Per `analyses/META_2026-08-27/competitive-intel/00_competitive-intel-triage.md`, the peer set is anchored by `business-model/08_competitive-map.md` (Alphabet/Google (GOOGL), ByteDance/TikTok, Snap (SNAP)), but **none of the three has a usable call in this run's audit corpus**:

| Peer | Ticker / venue | Native call label | Normalised window | Interim basis | Timing state | Transcript status |
|---|---|---|---|---|---|---|
| Alphabet / Google | GOOGL | — | — | — | — | No transcript in `data/META/external/`; no sibling `data/GOOGL` (or `ALPHABET`) pool exists at all. |
| ByteDance / TikTok | private | — | — | — | — | Structurally non-reporting — private company, does not publish audited financials or hold public earnings calls; not a data gap fixable by adding a pool. |
| Snap | SNAP | — | — | — | — | No transcript in `data/META/external/`; no sibling `data/SNAP` pool exists. |

`data/META/external/` does not exist as a directory. There is no CIQ "Competitor Transcripts" export in the pool manifest, and no broker "peer earnings insight" paraphrase (the G5 permitted fallback) exists anywhere in `data/META/` either. Per the triage, this is a total data-absence gap, not a partial one: 0% of META's exposure — including the dominant Family of Apps segment (99.3% of Q2 2026 revenue) [Q2 2026 Form 10-Q, Note 12] — has any reporting-peer vantage in this run's auditable corpus.

## Per-Peer Claim Blocks

Not produced. No peer in the peer set has a verbatim transcript or a permitted broker paraphrase anywhere under `data/META/` (top level or `external/**`). Per the module's own stop condition, extraction proceeds only where there is a verbatim transcript OR a permitted broker paraphrase; neither exists for any of the three named peers. Producing per-peer benchmark-dimension tables here would mean inventing figures with no source they could literally appear in, which the Evidence Citation Standard (CLAUDE.md §5) and this module's self-check both forbid.

## Analyst Assertions Stripped (G5)

Not applicable — no transcript was read, so no analyst content exists to strip.

## Extraction Notes

- **Alphabet/Google (GOOGL):** no transcript in the pool, no sibling pool, no broker paraphrase. Named as a competitor in `business-model/08_competitive-map.md` (video/ad-budget overlap with YouTube) but the naming does not supply a transcript. Gap is fixable by adding data (operator would need to route a CIQ transcript export or a permitted broker paraphrase into `data/META/external/`).
- **ByteDance/TikTok:** no transcript and none will ever exist — ByteDance is privately held and does not file public results or hold public earnings calls. This leg of the peer set cannot be closed even by a complete future data pull.
- **Snap (SNAP):** no transcript in the pool, no sibling pool, no broker paraphrase. Named as a directly product-overlapping rival in `business-model/08_competitive-map.md` despite much smaller scale ($5.931bn FY25 revenue vs. META's FoA $198.76bn), but again, naming does not supply the underlying call. Gap is fixable by adding data.
- No document under `data/META/` (top level or `external/**`) contains any peer management statement on any of the fixed benchmark dimensions. No FAILED-extraction case exists (there is nothing to extract from) — this is a total source-absence gap, not a read failure, and not a language issue (§27 does not apply — no non-English document was found either).

Verdict: Insufficient — no usable competitor call in the pool.



---

## competitive-intel / 02_dimension-matrix.md

_Source: `02_dimension-matrix.md`_

# Peer Dimension Matrix — META

## 1. The Matrix (peer × dimension)

**Empty matrix.** Per `00_competitive-intel-triage.md` (Verdict: Insufficient) and `01_peer-claim-extraction.md` (Verdict: Insufficient), zero eligible peers exist in this run's audit corpus. `data/META/external/` does not exist as a directory; no sibling `data/GOOGL`, `data/ALPHABET`, or `data/SNAP` pool exists; and ByteDance/TikTok is privately held and structurally does not file public results or hold public earnings calls. No CIQ "Competitor Transcripts" export and no permitted broker paraphrase (the G5 fallback) exist anywhere in the pool. Per the dependency rule for this case (zero eligible peers), no column, no peer, and no cell is invented below.

| Dimension | Alphabet / Google (GOOGL) | ByteDance / TikTok (private) | Snap (SNAP) |
|---|---|---|---|
| Demand | Not assessable — no transcript in pool | Not assessable — structurally non-reporting | Not assessable — no transcript in pool |
| Pricing / ASP | Not assessable | Not assessable | Not assessable |
| Volume / units | Not assessable | Not assessable | Not assessable |
| Input costs | Not assessable | Not assessable | Not assessable |
| Margin trajectory | Not assessable | Not assessable | Not assessable |
| Channel / inventory | Not assessable | Not assessable | Not assessable |
| Capacity / capex | Not assessable | Not assessable | Not assessable |
| Market-share claim | Not assessable | Not assessable | Not assessable |
| Guidance direction | Not assessable | Not assessable | Not assessable |
| Capital return | Not assessable | Not assessable | Not assessable |
| Biggest risk named | Not assessable | Not assessable | Not assessable |

No cell in this table carries a management quote or a number: `01` extracted zero per-peer claim blocks (no verbatim transcript and no permitted broker paraphrase exists for any of the three named peers), so there is nothing in the cited pool for any cell to trace to. Populating a cell with anything other than "Not assessable" here would mean inventing a figure with no source it could literally appear in, which CLAUDE.md §5 and this module's self-check both forbid.

## 2. Consensus & Dispersion (per dimension)

Not assessable for every dimension. Consensus and dispersion require at least two peers reporting within a matched calendar window/scope cohort (MODULE_RULES.md cap); this run has zero eligible peers, so no cohort exists to compute consensus, dispersion, "Mixed — no consensus", or a named outlier from. Stating a consensus or naming an outlier here would be manufacturing a signal from indistinguishable — in this case entirely absent — evidence, which the module's self-check forbids.

- **Demand:** Not assessable — zero peers reported.
- **Pricing / promo:** Not assessable — zero peers reported.
- **Input costs:** Not assessable — zero peers reported.
- **Margin:** Not assessable — zero peers reported.
- **Guidance:** Not assessable — zero peers reported.
- **Biggest risk named:** Not assessable — zero peers reported. No peer-named risk exists to carry forward to `03`'s read-through or the master synthesis's §8 disconfirmation register; that register will need to draw on other modules (e.g. business-model, earnings) for the shared-market risk view, since this module supplies none.

## 3. Alignment & Scope Notes

- **Window mismatches (G1):** None to report — there are no cells populated with figures, so there is nothing to align or flag as window-mismatched.
- **Scope mismatches (G3):** None to report for the same reason.
- **Coverage-of-exposure (from `00`):** 0%. No reporting peer speaks to any part of META's exposure. The dominant Family of Apps segment (99.3% of Q2 2026 revenue, $60,370m / $60,801m) [Q2 2026 Form 10-Q, Note 12] has zero reporting-peer vantage in this run's audit corpus, even though named competitors (Alphabet, Snap) do file public results elsewhere — those results are simply not present in this pool. Reality Labs (0.7% of revenue) is likewise uncovered. This is a total data-absence gap, not a partial one.
- **Path to closing the gap:** Two of the three peer legs are fixable by adding data — the operator would need to route a CIQ "Competitor Transcripts" export or a permitted broker paraphrase for Alphabet/Google and/or Snap into `data/META/external/<provider>/` (or via `EXTERNAL-INBOX/<Provider>/META/…`). The ByteDance/TikTok leg cannot be closed by any future data pull, since it is privately held and does not file public results or hold public earnings calls.

## Self-Check

- [x] Every extracted peer claim from `01` appears in the matrix or is explicitly "not addressed" — `01` extracted zero claims, and every matrix cell is marked "Not assessable" accordingly; nothing was dropped.
- [x] Window mismatches flagged on the cell (G1) — not applicable; no cell carries a figure.
- [x] Scope tags carried (G3); comparisons prefer ratios (G4) — not applicable; no comparison exists.
- [x] Consensus/dispersion computed within matched cohorts, never pooled across mismatched windows/scopes — not applicable; zero peers means zero cohorts. No consensus, "Mixed", or outlier was manufactured.
- [x] Every quote/number traces through `01` to its cited pool source — no quote or number appears anywhere in this report; none was invented.
- [x] No banned phrases (MODULE_RULES) — no bare "peers are cautious" or similar claim appears without a named peer + quote + number; this report instead states the absence of any usable peer source throughout.



---

## competitive-intel / 03_readthrough-to-subject.md

_Source: `03_readthrough-to-subject.md`_

# Peer Read-Through — META

## 0. Peer Set & Reporting Calendar

*"META files next: Q3 2026, standalone three-month quarter, US GAAP, US 10-Q basis, covering ~3 months ending ~30 Sept 2026, expected ~28 Oct 2026 (CIQ-derived estimated release date)."* [Meta Platforms Inc NasdaqGS:META Events Calendar.xls, Events Calendar tab, "Oct-28-2026 4:00 PM — Estimated Earnings Release Date (CIQ Derived)"] META's own guidance already frames the covered window: "we expect third quarter 2026 total revenue to be in the range of $61-64 billion." [Q2 2026 Form 10-Q / Q2 2026 press release, Outlook; corroborated by MetaPlatforms EstimatesReport.xls, Guidance tab, latest guidance issued 2026-07-29 for Q3 2026]

| Peer | Ticker / venue | Std / currency | Most-recent call (native label) | Normalised window | Interim basis | Timing vs subject window | Scope overlap with subject | Source |
|---|---|---|---|---|---|---|---|---|
| Alphabet / Google | GOOGL | — | — | — | — | No usable call | Not assessable | No transcript in `data/META/external/`; no sibling `data/GOOGL` pool exists [`00_competitive-intel-triage.md` §1] |
| ByteDance / TikTok | private | — | — | — | — | Structurally non-reporting | Not assessable | Privately held; does not publish audited financials or hold public earnings calls [`00_competitive-intel-triage.md` §1] |
| Snap | SNAP | — | — | — | — | No usable call | Not assessable | No transcript in `data/META/external/`; no sibling `data/SNAP` pool exists [`00_competitive-intel-triage.md` §1] |

**No peer is read-through-eligible.** No peer is context-only either, in the ordinary sense of "reported outside the window" — the pool contains **zero** usable competitor calls of any kind (no verbatim transcript, no permitted broker paraphrase per G5) for any of the three named peers. This is not a timing gap (some peer simply hasn't reported yet); it is a total absence of source material in this run's auditable corpus (`data/META/` top level and `external/**` — the only locations this module is permitted to read per the Auditable-corpus rule). `data/META/external/` does not exist as a directory. No sibling `data/GOOGL`, `data/ALPHABET`, or `data/SNAP` pool exists to even flag as an un-routed pointer. Per Workflow step 2, a peer call found only in a sibling pool would be a pointer requiring routing before use — but here there is no sibling pool to point to in the first place.

**Coverage of the subject's exposure:** Using `business-model/03_segment-map.md`, Family of Apps (FoA) is 99.3% of Q2 2026 revenue ($60,370m / $60,801m) and 124.6% of consolidated operating income; Reality Labs (RL) is the remaining 0.7% of revenue and loss-making. [Q2 2026 Form 10-Q, Note 12] Because no peer transcript of any kind is present, the reporting (read-through-eligible) peer set covers **0%** of META's exposure — not FoA, not RL, not any geography or product tier. The dominant segment (FoA, 99.3% of revenue) has zero reporting-peer vantage in this run's audit corpus, even though the named competitors (Alphabet, Snap) do file public results and hold public calls elsewhere — those materials are simply not present in this pool. ByteDance/TikTok is a structural, permanent coverage gap (private, never files); Alphabet and Snap are data gaps fixable by the operator routing a CIQ "Competitor Transcripts" export or a permitted broker paraphrase into `data/META/external/<provider>/`. This is a total data-absence gap across the entire company, not a partial one.

## 1. Peer Management Signals (already-reported peers only)

Not produced. No peer in the peer set has a verbatim transcript or a permitted broker paraphrase anywhere under `data/META/` (top level or `external/**`). Per this module's stop condition (RUNTIME INPUTS / DEPENDENCIES), extraction proceeds only where a verbatim transcript OR a permitted broker paraphrase exists; neither exists for Alphabet/Google, ByteDance/TikTok, or Snap. Populating this table with any dimension, quote, or number would mean inventing evidence with no source it could literally appear in, which CLAUDE.md §5 and this module's self-check both forbid.

No "Biggest risk named" row can be carried forward either — `01_peer-claim-extraction.md` and `02_dimension-matrix.md` both extracted zero per-peer claim blocks, so there is no peer-named risk on the shared market to feed the §8 disconfirmation register below. The master synthesis's disconfirmation register will need to draw on other modules (business-model, earnings) for the shared-market risk view; this module supplies none.

No scope-mismatch signals exist to set aside — there are no signals at all.

## 2. Read-Through to META

Every row below is inference from peer read-through — NOT a filing fact about META (§6 Level 1, Guardrail G2). **There are no rows.** No already-reported peer with overlapping scope exists in this run's audit corpus, so no directional inference can be derived without inventing evidence. Producing a table row here — even one hedged as "Not assessable" per dimension — would imply a peer-evidence basis that does not exist; the honest empty result is no table.

| Peer evidence | Transmission mechanism | Implication for META (named metric, direction) | Direction confidence (§10 band + basis) | Weight (H/M/L + why) | Confirms if / Falsifies if (line-item · boundary · comparable · basis) |
|---|---|---|---|---|---|
| — | — | — | — | — | No peer evidence exists in the pool to derive a read-through from |

**Context only — not a current read-through:** Not applicable. No peer is even context-only (a peer that has not yet reported but supplies structural signal); the gap here is total source absence, not timing. See §0 for the distinction between Alphabet/Snap (data gaps, fixable) and ByteDance (structural, permanent).

## 3. Cross-Sectional Dispersion

Not assessable — fewer than two already-reported peers (zero already-reported peers). Consensus and dispersion require at least two peers reporting within a matched calendar window/scope cohort; this run has zero eligible peers, so no cohort exists to compute a consensus, a "Mixed" read, or a named outlier from. Stating either here would manufacture a signal from entirely absent evidence.

## 4. Net Read-Through Verdict

**Verdict: Not assessable — no already-reported peer with overlapping scope.**

No sourced subject bar is being tested here because there is nothing to test it against: zero peer evidence exists in the pool for any of the three named competitors (Alphabet/Google, ByteDance/TikTok, Snap). META does carry a sourced Q3 2026 bar of its own — management guided "third quarter 2026 total revenue to be in the range of $61-64 billion" [Q2 2026 Form 10-Q / Q2 2026 press release, Outlook] — but a bar existing on the subject side does not manufacture peer evidence to read into it. Net read-through weight is **zero**, not merely capped, because the coverage gap is total (0% of META's exposure, including the 99.3%-of-revenue Family of Apps segment) rather than partial.

The single most important fact this section can report is the gap itself: this run's audit corpus (`data/META/` and `data/META/external/`) contains no competitor earnings-call transcript and no permitted broker paraphrase for any of the three peers named in `business-model/08_competitive-map.md`, so there is no peer signal — bullish or bearish — that could flip a verdict, because no verdict is being offered. This is inference feeding the beat/miss setup and the candor cross-check — it does not set a rating (G2). In this case it feeds nothing, honestly, rather than feeding a fabricated signal.

## 5. What Would Change This

No testable confirm/falsify boundary is stated in Section 2 because no material read-through exists to restate one for. There is nothing here to check against META's Q3 2026 print — this section is empty by construction, not abbreviated.

The one condition that WOULD create a testable read-through: the operator routing a genuine CIQ "Competitor Transcripts" export or a permitted broker paraphrase for Alphabet/Google's and/or Snap's most-recently reported quarter into `data/META/external/<provider>/` (or via `EXTERNAL-INBOX/<Provider>/META/…`), ahead of a re-run of this module. Until that happens, no falsifier can be written that a reader could score against the print with no further judgement, because there is no peer claim underlying it.

## 6. Data Gaps & Caps

- **Alphabet / Google (GOOGL):** no transcript in `data/META/external/`; no sibling `data/GOOGL` or `data/ALPHABET` pool exists at all. Named as a competitor in `business-model/08_competitive-map.md` (video/ad-budget overlap via YouTube) but naming does not supply a transcript. **Fixable by adding data** — route a CIQ transcript export or permitted broker paraphrase into the pool.
- **ByteDance / TikTok:** no transcript and none will ever exist — privately held, does not file public results or hold public earnings calls. **Not fixable by any future data pull.**
- **Snap (SNAP):** no transcript in `data/META/external/`; no sibling `data/SNAP` pool exists. Named as a directly product-overlapping rival in `business-model/08_competitive-map.md` despite much smaller scale ($5.931bn FY25 revenue vs. META's FoA $198.76bn revenue). **Fixable by adding data.**
- **Windows that could not be aligned (G1):** none to report — there are no peer windows to align, since no peer call exists.
- **MODULE_RULES score caps that bind:**
  - No-usable-call cap: read-through and triangulation are Not assessable (no verbatim transcript AND no permitted broker paraphrase for any peer — G5 stop condition).
  - Dominant-exposure-uncovered cap: net read-through weight = zero (not merely capped Low/Medium), because the gap spans the entire company (Family of Apps, 99.3% of Q2 2026 revenue, plus Reality Labs, 0.7%) rather than a minority segment.
  - Self-selected-peer-set cap: does NOT apply — the peer set IS anchored by `business-model/08_competitive-map.md` — but this does not help, since anchoring the peer set does not supply the underlying transcripts.
  - Broker-paraphrase-only cap: does NOT apply — there is no broker paraphrase either; the gap is total, not partial.
- **Path to closing the gap:** two of the three peer legs (Alphabet, Snap) are fixable by the operator routing a CIQ "Competitor Transcripts" export or a permitted broker paraphrase into `data/META/external/<provider>/`. The ByteDance/TikTok leg cannot be closed by any future data pull, since it is privately held and structurally does not file public results.



---

## competitive-intel / 04_narrative-triangulation.md

_Source: `04_narrative-triangulation.md`_

# Narrative Triangulation — META vs Peers

## 0. Why This Report Is Structurally Empty

Per `00_competitive-intel-triage.md` (Verdict: Insufficient), `01_peer-claim-extraction.md` (Verdict: Insufficient — no usable competitor call in the pool), and `02_dimension-matrix.md` (empty matrix, every cell "Not assessable"): **zero eligible peer transcripts exist in this run's audit corpus.** `data/META/external/` does not exist as a directory; no sibling `data/GOOGL`, `data/ALPHABET`, or `data/SNAP` pool exists; ByteDance/TikTok is privately held and structurally does not file public results or hold public earnings calls. No CIQ "Competitor Transcripts" export and no permitted broker paraphrase (the G5 fallback) exist anywhere in the pool. [`00_competitive-intel-triage.md`, §5; `01_peer-claim-extraction.md`, Verdict; `02_dimension-matrix.md`, §1]

This module's job (per MODULE_RULES.md) is to cross-examine META's own narrative against what its named competitors (Alphabet/Google, ByteDance/TikTok, Snap) said about the same shared market. With zero peer claims available, that cross-examination cannot be performed for any dimension. Per this module's own dependency rule for a zero-eligible-peer case, no contradiction, no corroboration, and no consensus/dispersion read is invented. What follows documents META's own claims (readable from its Q2 2026 earnings call, which IS in `data/META/`) so the record is complete, and marks every comparison column "Untestable" rather than silently omitting the exercise.

## 1. Subject Claim vs Peer Picture (per dimension)

| Dimension | META says | Peer picture (from `02`, same scope/window) | Agree / Contradict / Untestable | Note |
|---|---|---|---|---|
| Demand | Q2 2026 total ad impressions served across Meta's services increased 14% YoY; "impression growth was healthy across all regions, driven by growth in engagement and users as well as ad load optimizations." Family of Apps ad revenue $59.4bn, up 27% YoY (26% constant-currency). [Q2 2026 Earnings Call transcript, Jul 29, 2026, prepared remarks — Susan Li] | Not assessable — zero peer transcripts in corpus (`02`, §1). | Untestable | No peer (Alphabet/YouTube ad demand, Snap ad demand) has any vantage in this pool to test the digital-ad-demand claim against. |
| Pricing / ASP | Global average price per ad increased 12% YoY, "driven by ad performance gains, improvements in macro conditions relative to Q2 of last year and currency tailwinds," partially offset by "strong impression growth, particularly from lower monetizing surfaces and regions." [Q2 2026 Earnings Call transcript, Jul 29, 2026, prepared remarks — Susan Li] | Not assessable — zero peer transcripts in corpus. | Untestable | No peer read on ad-pricing (CPM/CPC) trends in the same window exists to test whether META's +12% price-per-ad is consistent with, or an outlier against, the same digital-ad market peers described. |
| Market-share claim | No explicit market-share or "taking share from X" claim was made in the Q2 2026 call — a full-transcript search for "TikTok," "Google," "YouTube," "Snap," and "share of voice/wallet/spend/budget," "take share," "gain(ing) share," and "lose share" returned zero matches. [Q2 2026 Earnings Call transcript, Jul 29, 2026 — full-text search] | Not assessable — zero peer transcripts in corpus. | Untestable | Because META itself made no market-share claim this quarter, there is no share-gain assertion to run the "everyone claims share gains" test (step 4/G-guard) against, even setting the missing peer data aside. |
| Margin trajectory | Q2 2026 GAAP operating income $18.8bn, down 8% YoY, 31% operating margin; management attributes the decline to a $2.4bn legal-proceedings charge and $1.2bn severance expense, stating "excluding the Q2 legal charges and severance expenses, our second quarter operating income would have increased 9% year-over-year." Total expenses $42bn, up 55% YoY. [Q2 2026 Earnings Call transcript, Jul 29, 2026, prepared remarks — Susan Li] | Not assessable — zero peer transcripts in corpus. | Untestable | No peer margin read (e.g., Alphabet's own ad/cloud margin trajectory, which shares AI-capex and ad-market dynamics) exists to check whether META's margin compression is company-specific (legal charge, severance) or market-wide (AI infrastructure cost inflation industry-wide). |
| Input costs | Total-expense growth "primarily driven by increases in employee compensation, infrastructure costs, legal-related costs and third-party AI token costs"; infrastructure-cost growth "driven by higher depreciation, data center operating costs and third-party cloud spend." [Q2 2026 Earnings Call transcript, Jul 29, 2026, prepared remarks — Susan Li] | Not assessable — zero peer transcripts in corpus. | Untestable | No peer disclosure on AI-infrastructure/compute cost inflation (a cost input shared across every large AI-capex spender, including Alphabet) exists to test whether META's cost inflation is company-specific or industry-wide. |
| Guidance direction | Q3 2026 total revenue guided to $61bn–$64bn (FX ~1% headwind assumed); FY26 total expenses raised to $165bn–$169bn (to absorb the $2.4bn legal charge); FY26 capex (incl. finance-lease principal payments) narrowed to $130bn–$145bn from $125bn–$145bn; FY26 tax rate guided to 15%–17% (up from 13%–16%). [Q2 2026 Earnings Call transcript, Jul 29, 2026, prepared remarks — Susan Li] | Not assessable — zero peer transcripts in corpus. | Untestable | No peer guidance for the same forward window exists to check whether META's guided revenue growth or its raised capex range is consistent with, or an outlier against, the sector's own forward capex/opex plans. |

Per `02`'s scope/window rule (G1/G3): because there is no peer column populated at all, no "matched scope + window" comparison is possible for any row — every row above is marked Untestable rather than force-compared, per the coverage-gap finding already established at `00` (0% of META's exposure has any reporting-peer vantage in this run).

## 2. Contradictions (named and sized — §3)

*A peer contradiction is a disconfirmation FLAG (§8), not a proven falsehood — it raises a question the subject's own disclosure must answer (G2).*

**No table populated.** Zero peer claims exist in this run's corpus (`01`, `02`), so there is no peer figure on any dimension to set against META's own claims and no basis to name, size, or prove a contradiction. Populating this table with an assumed or inferred peer position would be inventing a source with no document it could literally appear in (CLAUDE.md §5) — forbidden regardless of how plausible a contradiction might seem (e.g., speculating that Alphabet's YouTube ad-pricing trend might diverge from META's +12% price-per-ad). No contradiction is recorded.

## 3. Corroborations

**None recorded.** Corroboration requires a peer statement on the same dimension, scope, and window (§4 guardrails) — none exists in this corpus. No peer "raises confidence" in any of META's Q2 2026 claims in §1, because no peer claim exists to compare against them.

## 4. Routing (via the module synthesis → the master synthesizer)

- **Governance / candor read:** No independent-vantage input is available this run. This module cannot supply the master synthesizer's governance/candor read (`management-governance/06`) with any peer cross-check on META's narrative — the candor read for this run must rely on sources other than peer triangulation (e.g., internal consistency checks within META's own filings, prior-guidance-versus-actual accuracy from `earnings/*`).
- **§8 disconfirmation:** No disconfirming-evidence item is generated by this module this run. The absence itself is worth carrying to the master synthesizer as a **coverage gap**, not a finding: the master's disconfirmation register should note that META's competitive narrative (demand, pricing, margin trajectory, input-cost inflation, and forward guidance, all summarized in §1 above) has NOT been independently cross-examined against Alphabet/Google or Snap this run, and that gap is fixable — the operator would need to route a CIQ "Competitor Transcripts" export or a permitted broker paraphrase for Alphabet/Google and/or Snap into `data/META/external/<provider>/` (the ByteDance/TikTok leg cannot be closed by any future data pull, since it is privately held). [`00_competitive-intel-triage.md`, §5]

## 5. Verdict

**Not testable** (META's claims have no overlapping peer vantage this run). The single most important gap: META's Q3 2026 guidance ($61bn–$64bn revenue, FY26 capex narrowed to $130bn–$145bn) and its stated demand/pricing drivers (ad impressions +14% YoY, price per ad +12% YoY, both partly attributed to "improvements in macro conditions") sit entirely on management's own word this run — with Alphabet/Google (the closest scope overlap, via YouTube and ad-budget competition) and Snap both absent from the corpus, there is no independent read on whether the same digital-advertising market is behaving the way META describes it.
