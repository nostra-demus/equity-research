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
