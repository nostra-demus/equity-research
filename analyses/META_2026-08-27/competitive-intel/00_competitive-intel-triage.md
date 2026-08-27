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
