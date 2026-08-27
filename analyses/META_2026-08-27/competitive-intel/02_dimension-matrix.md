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
