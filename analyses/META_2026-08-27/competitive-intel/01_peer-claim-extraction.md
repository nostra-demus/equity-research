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
