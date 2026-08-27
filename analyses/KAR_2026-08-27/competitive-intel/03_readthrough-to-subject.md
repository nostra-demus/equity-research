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
