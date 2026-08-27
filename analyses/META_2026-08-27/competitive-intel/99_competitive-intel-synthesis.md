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
