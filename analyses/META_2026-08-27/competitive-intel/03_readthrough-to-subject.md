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
