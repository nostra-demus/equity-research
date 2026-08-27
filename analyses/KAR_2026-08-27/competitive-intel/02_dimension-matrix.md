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
