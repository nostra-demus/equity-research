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
