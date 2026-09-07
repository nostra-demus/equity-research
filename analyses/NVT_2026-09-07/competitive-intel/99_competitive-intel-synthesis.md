# Competitive-Intel Module — nVent Electric plc (NVT) (Synthesis)

## Abstract

The pool holds no competitor earnings call at all — no verbatim transcript and no permitted broker paraphrase — so there is no peer benchmark here, only a coverage gap. With no eligible peer, the read-through into nVent's next print (the standalone three months ending 30-Sep-2026) is Not assessable, and so are its weight and its direction confidence. nVent's own narrative — data-centre sales "more than $2 billion in 2026, more than double last year's" and a guidance raise to 32%–34% organic growth — was never cross-examined, so it is untested, not corroborated. Reporting peers speak to 0% of nVent's revenue. The verdict is a documented blind spot, not a benchmark.

---

## 1. Verdict Block

- **Net read-through direction:** **Not assessable — no eligible peer.** No competitor call, verbatim or paraphrased, exists in the bound generation `6db32848…d1e6`; all 15 sources extracted cleanly (0 failures) and all 15 are nVent's own documents [bound `manifest.json`; `03_readthrough-to-subject.md`, §4]. Note the branch this is **not**: a sourced subject bar DOES exist — vendor consensus of revenue **$1,427.27m** and adjusted EPS **$1.3899** for standalone FQ3 2026 [`CIQ Estimates→Consensus`, FQ3 2026 column — tier-5 vendor export], plus management guidance of **+32% to +35%** sales growth and adjusted EPS **$1.35–$1.38** [Q2 FY26 transcript, 31-Jul-2026, prepared remarks]. So this is not the degraded "bar-dependent" case; the missing side is the peer evidence. There is likewise **no operational direction** to report separately, because a direction of any kind needs at least one peer signal and there are zero.
- **Read-through weight:** **Not assessable.** Not "Low" — the three axes move together when no read exists, and `03` produced no read to carry [`03_readthrough-to-subject.md`, §2: zero rows].
- **Read-through direction confidence (§10 band + basis):** **Not assessable.** No band is issued, because no direction was established. Inventing a "Toss-up 45–60%" here would give the master a probability about a claim nobody made.
- **Narrative triangulation verdict:** **Not testable** — nVent's claims have no overlapping peer vantage in this run's corpus. Zero contradictions AND zero corroborations, both for the same reason [`04_narrative-triangulation.md`, §5].
- **Peer-coverage of subject /100** *(higher = reporting peers span more of the subject)*: **0** *(built in §1B)*
- **Benchmark data-sufficiency /100** *(higher = more sufficiency)*: **0** *(built in §1B — the triage-Insufficient floor applies)*
- **Dispersion:** **Not assessable** — zero distinct peers, below even the one-peer case [`02_dimension-matrix.md`, §2].
- **Single most important peer signal (one line):** There is none — the only competitor-referencing utterance in the whole corpus is an **analyst's** framing on nVent's own call ("amazed that you're not seeing any capacity headwinds or supply chain bottlenecks unlike a lot of your competitors and peers in data centers", Nigel Coe, Wolfe Research) and it is stripped twice over under G5: not a management statement, and not a peer's management speaking about its own business [Q2 FY26 transcript, 31-Jul-2026, Q&A].
- **Biggest contradiction or corroboration of the subject's narrative (one line):** The finding is a **missing corroboration, not a present contradiction** — the claim carrying the thesis, data-centre sales "more than $2 billion in 2026, more than double last year's sales" (a transcript-only figure with no filed equivalent), has no independent vantage anywhere in this run [Q2 FY26 transcript, prepared remarks; `04_narrative-triangulation.md`, §5].

---

## 1B. Score Builds (reproducible — CLAUDE.md §12)

**Inputs both builds rest on.** `business-model/03_segment-map.md` IS available, so segment weights exist and `covered_exposure_pct` is computable — it is not the "segment weights unavailable" branch. The number of **read-through-eligible** (already-reported, Timing Rule) and **scope-overlapping** (G3) peers on a matched window (G1) is **zero**.

**Peer-coverage of subject /100 = round(covered_exposure_pct) = round(0) = 0.**

Auditable segment/geography list, against nVent's own filed weights:

| Subject exposure | Weight | Read-through-eligible, scope-overlapping peer? | Contribution to covered_exposure_pct |
|---|---:|---|---:|
| Systems Protection (enclosures, liquid/air cooling, switchgear, power distribution) | **72.5%** of H1 FY26 net sales ($1,966.9m of $2,713.3m), 70.0% of segment income [Q2 FY26 10-Q, Note 13, p.20] | **None.** Closest product-for-product rival Rittal is private and will never file a call | 0.0 |
| Electrical Connections (cable management, connections, fastening) | **27.5%** ($746.4m), 30.0% of segment income [Q2 FY26 10-Q, Note 13, p.20] | **None** | 0.0 |
| *(Geographic cut of the same 100%)* Americas | **85.0%** ($2,307.2m of $2,713.3m) [Q2 FY26 10-Q, Note 2, p.8] | **None** | 0.0 |
| *(same cut)* EMEA | **11.2%** ($305.0m) [Q2 FY26 10-Q, Note 2, p.8] | **None** — and this is where Rittal is strongest, so the most permanently unrepresentable exposure | 0.0 |
| *(same cut)* Asia-Pacific | **3.7%** ($101.1m) [Q2 FY26 10-Q, Note 2, p.8] | **None** | 0.0 |
| *(Vertical, cuts across both segments — not a reportable line)* Data centres | ~**37%** of FY2026 group revenue — *derived from a transcript figure over a guidance range; inference, not a disclosed number* [`business-model/03_segment-map.md`, §2] | **None.** The natural cross-checks (Legrand, 26% of its 2025 sales in data centres; Eaton Electrical Americas) have no call here | 0.0 |
| **Sum** | **100% of revenue (segment basis)** | — | **covered_exposure_pct = 0.0%** |

**The uncovered majority is the whole company.** The read-through for **100%** of nVent's revenue is Not assessable. A private, non-reporting or scope-mismatched competitor adds nothing to coverage, so Rittal (private) and Hitachi Energy AG (private subsidiary of Hitachi Ltd) contribute zero by rule, permanently.

**Benchmark data-sufficiency /100 — the four components, then the floor:**

| Component | Points | Build |
|---|---:|---|
| Reporting-peer breadth | **0** | N = count of read-through-eligible **distinct peer companies** = **0** (not 0.5 — there is no partial/sub-window peer either). N = 0 → 0 |
| Exposure coverage | **0** | round(covered_exposure_pct × 0.30) = round(0 × 0.30) = 0 |
| Source quality | **0** | Base 0 — no eligible peer is a verbatim transcript (there is no eligible peer at all). No broker-paraphrase deduction is reachable because no paraphrase exists. Floored at 0 |
| Peer-set provenance | **10** | Peer set is inherited from `business-model/08_competitive-map.md`, not self-selected → 10 |
| **Component sum** | **10** | — |
| **Floor applied** | **→ 0** | The pool holds **no usable call at all** — no verbatim transcript AND no permitted broker paraphrase. That is exactly the triage-**Insufficient** case [`00_competitive-intel-triage.md`, §5], so the WHOLE score floors to 0. This is not the broker-paraphrase-only pool, which would be triage-Partial and would keep its breadth, exposure and provenance points |
| **Benchmark data-sufficiency /100** | **0** | The module reports the coverage gap, not a benchmark |

Neither score is inverted: higher = better coverage / more sufficiency. Both read 0, and both zeros mean the same thing — nobody spoke.

---

## 1A. Module Disconfirmation (CLAUDE.md §8)

- **Strongest bear read-through:** **None exists.** No peer signal undermines nVent's next print, because no peer signal exists. This is an explicit blank the master must carry as a blank — *not* an absence of bear evidence.
- **Strongest bull read-through:** **None exists**, for the same reason. The module moves confidence in neither direction.
- **Single killer contradiction from `04`:** **None — and "none material" would be the wrong words.** The contradiction table is empty because there was no peer evidence to contradict anything, not because nVent's narrative was tested and survived [`04_narrative-triangulation.md`, §2]. Those two outcomes look identical in an empty table and are opposite findings.
- **Disconfirming evidence already visible in the peer calls:** **None — there are no peer calls.** `02` logged the same explicit blank on the "Biggest risk named" row rather than a silence [`02_dimension-matrix.md`, §2], so the §8 register receives a documented zero from this module, never a false all-clear.
- **What data would change this conclusion.** `03` produced **zero read-through rows**, so there is **no confirm/falsify boundary to carry up** — a falsifier tests a claim, and this module made none. Publishing a threshold here would give the master something to score against a read-through that does not exist. Two things are carried instead:
  1. **Intake:** the Capital IQ "Competitor Transcripts" export for nVent's peer set must be force-routed under `EXTERNAL-INBOX/<Provider>/NVT/…` or placed directly in `data/NVT/external/<provider>/` **before** the next generation is admitted. A loose drop names the competitor and is content-routed to *that competitor's* pool, where this module cannot see it.
  2. **Calendar:** a peer must actually have reported the window. Today is 2026-09-07; nVent's target window (1-Jul to 30-Sep-2026) has not ended, so no peer call covering it exists anywhere yet.
  **The comparable a future read must be cut against, recorded now so it is not mis-set later (§17), and explicitly NOT a falsifier of any read made in this run:** line-item **standalone Q3 FY2026 revenue and adjusted EPS** · comparable **Q3 FY2025 actuals of $1,054.0m revenue and $0.91 adjusted EPS** [`CIQ Estimates→Consensus`, FQ3 2025 actual column — vendor data; no Q3 FY25 10-Q is in this pool] · basis **standalone three months, US GAAP, USD, no already-reported stub** [Q2 FY26 10-Q, cover page; `earnings/04_guidance-consensus.md`, §1A]. The bar implies **+35.4%** revenue and **+52.7%** adjusted EPS on that comparable — a future peer-derived boundary cut against the nine-month cumulative column or the full-year guide instead would not be capable of failing.
- **What would force a downgrade / rejection:** Nothing this module produces can cap or withdraw a contribution it never made — its contribution to the master view is **zero weight**. The live risk runs the other way: if any downstream layer treats this module's empty contradiction table as reassurance, that inference should be rejected outright. The specific wording `04` asked to be carried: *the thesis's central claims — data-centre sales doubling above $2bn, a guidance raise from 21%–23% to 32%–34% organic, a ~$100m FY26 tariff bill offset "through pricing", and a 140bps Electrical Connections margin decline called transitory — rest entirely on management's own account of a market in which no independent participant was heard. Nothing here disconfirms them; nothing here supports them either* [`04_narrative-triangulation.md`, §4].

---

## 2. Specialist Roll-Up

| Specialist | Verdict Line | Biggest Finding |
|---|---|---|
| `00_competitive-intel-triage` | **Insufficient** — no competitor earnings-call transcript and no broker paraphrase of one in the bound snapshot | Coverage of subject = **0%**; 15 of 15 sources are nVent's own, 33 extracts, **0 failures** — a genuine intake gap, not a bad-extraction or language error (§20, §27) |
| `01_peer-claim-extraction` | **Insufficient** — no usable competitor call in the pool | Re-verified the stop condition independently: a grep for `Hubbell\|Legrand\|Rittal\|Eaton\|ABB Ltd\|Hitachi Energy` hits exactly **one** file — the CIQ Competitors screen, a tier-5 vendor export with **no management statement of any kind**. All eleven benchmark dimensions unextractable for all six peers |
| `02_dimension-matrix` | **Empty matrix — zero eligible peers**; every dimension and the dispersion read *Not assessable* | Named the two costliest blanks: nVent's ~**$100m** FY26 tariff guide (raised from $80m) and Electrical Connections' segment margin down **2.6 points to 25.9%** in H1 FY26 from 28.5% — neither testable as company-specific or market-wide [Q2 FY26 transcript, prepared remarks; Q2 FY26 10-Q, MD&A, p.30] |
| `03_readthrough-to-subject` | **Insufficient data** — no usable competitor call; net read-through *Not assessable*, weight **none** | The blocker is **doubled and independent**: the pool holds no peer call, AND the 1-Jul–30-Sep-2026 window has not ended at the run date, so no peer call covering it exists anywhere. Curing the intake does not cure the calendar |
| `04_narrative-triangulation` | **Not testable** — the subject's claims have no overlapping peer vantage | The single most important finding is a **corroboration that is missing, not a contradiction that is present**: data-centre sales "more than $2 billion in 2026, more than double last year's" is transcript-only, has no filed equivalent, drove the guidance raise, and has no independent vantage in this run |

---

## 3. Reconciliation

**No material disagreements.** All five specialists reached the same stop condition, and three of them (`01`, `02`, `03`, and `04` as well) re-verified it against the bound `manifest.json` independently rather than inheriting it — the same totals (15 sources, 33 extracts, 0 failures, no `external: true` row, no `external/` directory) are reported four times over. One point is worth recording as an agreement rather than a conflict: every specialist independently refused the same temptation — the peer figures quoted in `business-model/08_competitive-map.md` (Hubbell Q2 2026 net sales $1,711.8m up 15.3%; Legrand H1 2026 sales €5,400.3m up 13.1%; Eaton Electrical Americas Q2 2026 operating margin 27.5%) are unverified web copies of peer **results releases**, not calls, and none is inside the bound `<DATA_PATH>`. Under the Auditable-corpus rule they are not this run's evidence, and they are not carried here either.

---

## 4. Score Cap Application

| Cap Trigger | Applied? (Y/N) | Affected | Final Cap |
|---|---|---|---|
| No peer transcripts | **Y** | read-through | **Not assessable** — and direction confidence and weight with it |
| Only one peer | **N (moot)** | weight | Not reached — there are **zero** peers, not one; dispersion is Not assessable for the stronger reason |
| No peer reported the window | **Y** | current read-through | **Not assessable** — binds twice over: no peer call in the pool, and the 1-Jul–30-Sep-2026 window is still open at the 2026-09-07 run date |
| Exposure uncovered (by coverage band) | **Y** | net weight | `covered_exposure_pct` = **0.0%**, which is < 30 → ceiling **Low** |
| Peer set self-selected | **N** | net weight | Does not bind — `business-model/08_competitive-map.md` is present and anchors the peer set |
| Broker-paraphrase only | **N (moot)** | tone | Not reached — no paraphrase exists either. Peer tone, emphasis and candor are Not assessable for the stronger reason that no peer commentary of any kind is in the pool |

**Exposure-coverage weight ceiling:** `covered_exposure_pct` = **0.0%** (§1B, built on available segment weights — this is a measured zero, not the "segment weights unavailable" branch), which falls in the **< 30** band → the ceiling is **Low**.

**What is actually carried to the master.** The net weight carried is the LOWER of that ceiling and any other applied cap. Here the "no peer transcripts" row makes the read-through itself **Not assessable**, which sits below the Low ceiling: **the module contributes no read-through and therefore zero weight**. Caps act on weight only; no §10 direction band was touched, because none was issued.

---

## 5. Note To The Final Synthesizer

- **There is no read-through to absorb, on either axis.** Direction: **Not assessable**. Weight: **Not assessable** (ceiling from exposure coverage would have been **Low** in any case). Direction confidence: **Not assessable** — no §10 band is issued, because no direction was established. There is no single most important peer signal to hand over. Do **not** synthesise a lean from this module for the beat/miss or scenario view; any beat/miss signal attributed to peer read-through for this run would be manufactured (§11).
- **The subject bar is not the missing piece — the peers are.** Consensus for standalone FQ3 2026 is revenue **$1,427.27m** and adjusted EPS **$1.3899** [`CIQ Estimates→Consensus`, FQ3 2026 column — tier-5 vendor export], with management guiding **+32% to +35%** sales growth and **$1.35–$1.38** adjusted EPS [Q2 FY26 transcript, prepared remarks]. Those belong to the `earnings` module and are unaffected by this module's blank; nothing here supports or undercuts them.
- **No falsifiers are handed to your §8 kill criteria, and the reason matters.** `03` wrote zero read-through rows, so there is no confirm/falsify boundary to inherit — a threshold published against a read that was never made is not a test. What is handed over instead is the comparable a future read must use: **standalone Q3 FY2026 revenue / adjusted EPS · against Q3 FY2025 actuals of $1,054.0m and $0.91 · standalone three-month US GAAP basis, no stub** — implying **+35.4%** revenue and **+52.7%** EPS at the consensus bar. Cut against the nine-month cumulative column or the full-year guide, that boundary could not fail (§17).
- **The narrative is un-cross-examined, and that is the candor input.** Verdict from `04` is **Not testable**, with zero contradictions and zero corroborations. Record in the governance/candor read that nVent's claims about its own market were **not** tested against any competitor, and do **not** treat the empty contradiction table as a candor positive. One structural fact belongs there on its own merit, un-editorialised: **nVent names no competitor in any of its own filings; the FY24 10-K Competition section is entirely generic** [FY24 10-K, Item 1 — Competition, p.2]. That is a disclosure characteristic of the subject, not a peer finding and not evidence about management's truthfulness.
- **The claims most exposed by the absent cross-check, ranked** (from `04`, for the bear case): (1) Electrical Connections margin **down 140bps to 27.3%** in Q2 and **down 2.6 points to 25.9%** for H1 — execution or market cost, untested; (2) FY26 tariff cost **~$100m, raised from $80m**, with roughly **21%** of Q2 pre-mitigation inflation unrecovered at the gross line — nVent-specific sourcing or a shared industry bill, no vantage; (3) organic orders decelerating from **~40%** to **low double digits** with backlog down **$2.6bn → $2.5bn**, explained by management as deliberate backlog conversion and lumpy data-centre orders — **plausible and unverified**, exactly as `earnings` left it, and this module adds nothing in either direction; (4) data-centre sales **">$2 billion, more than double"** — transcript-only, no filed equivalent; (5) the guidance raise itself, organic **21%–23% → 32%–34%** in one quarter.
- **The coverage gap, sized: reporting peers speak to 0% of nVent.** Not Systems Protection (**72.5%** of H1 FY26 revenue), not Electrical Connections (**27.5%**), not the Americas (**85.0%** of net sales), not EMEA (**11.2%**), not Asia-Pacific (**3.7%**), and not the data-centre vertical (~**37%** of FY26 revenue, derived). Read no part of this module as a whole-company read, because it is not even a partial one (G2/coverage rule).
- **Caps that bound the weight, and why.** "No peer transcripts" took the read-through to Not assessable; the exposure-coverage band (0% < 30) set a **Low** ceiling that never became binding; the self-selected-peer-set cap did **not** bind, because `08_competitive-map.md` anchors the peer set. No cap touched a §10 band, because none was issued.
- **Two limits so this is not read as merely one file away from being cured.** (a) **Rittal** (private German GmbH & Co. KG, Friedhelm Loh Group) and **Hitachi Energy AG** (private subsidiary of Hitachi Ltd) will never file a call, so a perfect future intake still leaves Systems Protection — 72.5% of revenue — without its single closest comparable. (b) The genuine timing edge opens only when Hubbell, Eaton and Legrand report their September-quarter periods in late October / early November 2026, at or just before nVent's expected 30-Oct-2026 release (a **vendor** date, not company-confirmed) — a narrow calendar spread, so the edge is thin even at best. Note also that Legrand files a **cumulative half-year**, so its figures would need §27 stub arithmetic before sitting beside nVent's standalone quarter (G1), and Eaton (6.2x nVent's revenue) and ABB (7.4x) fail the ~5x whole-company scale test, leaving Eaton usable only at the Electrical Americas segment level.
- **No language or extraction issue is involved (§27).** All 15 sources are English and extracted cleanly (0 failures). Nothing was logged as a gap, opacity, or a source downgrade for language, and no upstream orb did so either — there is no §27 correction to make in this roll-up.

---

## 6. Simple Summary

- **Are there real peer calls to benchmark against?** No. Zero. Not one competitor earnings call, and not one broker summary of one, is in the evidence pool for this run — every one of the 15 documents is nVent's own.
- **What do the already-reported peers imply for the next print, and how strongly?** Nothing, at zero weight. There are no already-reported peers here, and separately no company on earth has yet reported the July–September 2026 quarter that nVent will report next. Two independent blockers; fixing one would not fix the other.
- **Does the subject's story hold up against the peers?** Unknown — it was never put to them. The contradiction table is empty because nobody was asked, not because nVent passed a test. Treating that emptiness as a pass would invert the finding.
- **What part of the subject is the benchmark blind to?** All of it — 100% of revenue. And two of the six named rivals (Rittal, Hitachi Energy) are private, so even a perfect future intake would leave the enclosures-and-cooling business, 72.5% of revenue, without its closest comparable.
- **The three questions a peer would have answered cheaply, all left open:** is the Electrical Connections margin fall (down 2.6 points to 25.9% for the half) nVent's own problem or the market's; is the ~$100m tariff bill an nVent sourcing issue or a cost the whole electrical-equipment group is carrying; and is the order slowdown from ~40% to low double digits nVent's or the market's.
- **The one thing that would fix the intake:** the Capital IQ "Competitor Transcripts" export for nVent's peer set has to be dropped into **nVent's own** pool before the next run is admitted — a loose drop names the competitor and lands in that competitor's pool, where this module cannot see it.
- **Is this module useful for the master synthesizer and the earnings beat/miss setup?** Only as a documented blind spot, and that is a real result. It supplies no lean, no weight, and no probability band; its instruction to the master is to leave the beat/miss view exactly where the `earnings` module left it and to record in the bear case that nVent's biggest claims currently rest on management's word alone.
