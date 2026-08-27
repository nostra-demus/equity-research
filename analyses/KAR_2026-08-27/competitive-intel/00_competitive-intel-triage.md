# Competitive-Intel Data Triage — KAR

## 0. Subject's Next Filing (the read-through target)

*"Karoon Energy Ltd (ASX: KAR) files next: H1 CY2026 (the six months to 30-Jun-2026), on a **standalone half-year** basis (first half of the fiscal year — nothing to cumulate it with, unlike a Chinese/Japanese cumulative-interim regime), released **today, 2026-08-27**."* [`2Q26 Activities Report (Jul-22-2026)`, p.7, cross-checked in `earnings/04_guidance-consensus.md` §0/§1A]. The filing will be a full reviewed income statement, balance sheet, and cash-flow statement (Appendix 4D + Half-Year Audit Review), consistent with the H1 2025 precedent in this pool. Karoon reports in US dollars under IFRS (AASB), fiscal year end 31 December, and files no US SEC or India SEBI equivalent — the ASX Appendix 4D / 4E / quarterly Activities Report set is the correct local-equivalent document type (§27) [`earnings/00_earnings-data-triage.md` §0; `earnings/04_guidance-consensus.md` line 3].

## 1. Peer Transcript Inventory & Reporting Calendar

**No peer transcript exists anywhere in this run's audit corpus.** `data/KAR/external/` — the only path this module is permitted to read for competitor calls (MODULE_RULES, "Where the peer transcripts come from") — does not exist as a directory at all; `ls data/KAR/external/` returns "No such file or directory". The pre-extracted pool manifest (`analyses/KAR_2026-08-27/_pool_extracts/manifest.json`) lists 85 sources, all resolving to top-level `data/KAR/` files: Karoon's own filings, Karoon's own earnings-call transcripts (2021–2025), Capital IQ workbooks about Karoon, and a set of unrelated personal documents (AI-agent sales-team spreadsheets, a podcast digest, a market-commentary PDF). None names, or is authored by, a competitor. A targeted search of the entire `data/KAR/` tree for every peer named in `business-model/08_competitive-map.md` — Prio S.A., GeoPark Limited, Gran Tierra Energy Inc, Jadestone Energy, Kosmos Energy, Pharos Energy, Tullow Oil, Capricorn Energy, Echelon Resources, Petroreconcavo S.A., Beach Energy, Santos, Woodside — returns only two incidental mentions inside Karoon's own ownership/profile RTFs (not calls, not commentary). No broker "peer earnings insight / call summary" paraphrase (G5) exists in the pool either — a search for that document type returns nothing.

There is also no sibling-pool pointer to flag: `data/<PEER>/` pools exist in this repo only for a different, unrelated set of tickers (AMZN, TSLA, META, etc.); none of Karoon's named peers (Prio, GeoPark, Gran Tierra, Petroreconcavo, Beach Energy, Santos, Woodside, Tullow, Kosmos, Pharos, Capricorn, Jadestone, Echelon) has its own pool anywhere in `data/`, and `data/EXTERNAL-INBOX/` holds no KAR-tagged drop. This is therefore not a "copy it over" case — there is nothing in the wider repository to copy.

| Peer | Ticker / venue | Std / currency / FY-end | Language | Most-recent call (native label) | Normalised window | Interim basis | Timing vs subject window | Scope overlap | Source (path) |
|---|---|---|---|---|---|---|---|---|---|
| — no rows — | — | — | — | — | — | — | — | — | No transcript, verbatim or paraphrase, exists for any named peer anywhere in `data/KAR/` (top level or `external/**`) as of 2026-08-27. |

**Peers named but with no transcript in this run's corpus (coverage gaps, not Timing-Rule states — MODULE_RULES: "a no-transcript peer is NOT a Timing state"):**
- **Prio S.A.** (BOVESPA:PRIO3) — Karoon's own FY2025 Annual Report Remuneration Report peer group + CIQ Competitors export [`business-model/08_competitive-map.md` §2]. The most direct Brazil-offshore rival; publicly listed and known to hold its own earnings calls, but none is present in this pool.
- **Petroreconcavo S.A.** (BOVESPA:RECV3) — closest scale-matched Brazil-only peer, but CIQ-relevancy-selected, not company-named [`business-model/08_competitive-map.md` §2]. No transcript present.
- **Gran Tierra Energy Inc.** (NYSEAMER:GTE) — company-named peer, but does not operate in Brazil (Colombia/Canada/Ecuador) [`business-model/08_competitive-map.md` §2]. No transcript present.
- **GeoPark Limited, Jadestone Energy, Kosmos Energy, Pharos Energy, Tullow Oil, Capricorn Energy, Echelon Resources** — named in Karoon's Remuneration Report "global peers" list [`business-model/08_competitive-map.md` §2]; several (Kosmos, Tullow, Pharos) do not operate in Brazil and are legacy/weak scope matches even in principle. No transcripts present for any of them.
- **Beach Energy, Santos, Woodside** (and smaller ASX names) — Karoon's "Australian market peers" [`business-model/08_competitive-map.md` §2]; do not compete in the Brazil segment. No transcripts present.

## 2. Coverage of the Subject's Exposure

Zero. With no peer transcript of any kind in the audit corpus, the reporting-peer set covers **0% of Karoon's revenue, gross profit, or segment exposure** — for both segments. Using `business-model/03_segment-map.md` weights: Brazil (the Baúna Project) supplies 77.9% of FY2025 revenue and 91.2% of FY2025 gross profit, and its segment profit before tax (US$241.9m) exceeds Karoon's entire consolidated profit before tax (US$143.2m) [`business-model/03_segment-map.md` §2, citing FY2025 Annual Report, Note 2(b), p.86]; the USA segment (Who Dat / Dome Patrol / Abilene) supplies the remaining 22.1% of revenue. Neither the dominant Brazil segment nor the smaller USA segment has any reporting-peer vantage in this run: the credible Brazil rivals (Prio, Petroreconcavo) and the credible-by-naming-only US Gulf-of-America-adjacent names have no call in the pool. **The uncovered majority is the entire company** — there is no partial read-through to report; this is not a case of one segment covered and another dark, it is total coverage absence.

## 3. Usability Check

| Requirement | Available? (Y/N) | Detail |
|---|---|---|
| ≥1 usable competitor call (verbatim transcript OR permitted broker paraphrase, G5) | N | No transcript and no broker paraphrase exists anywhere in `data/KAR/` (top level or `external/**`) |
| ≥2 distinct peer companies with verbatim transcripts (dispersion possible) | N | Zero peer transcripts of any kind |
| ≥1 peer reported the comparable window (read-through possible) | N | No peer call exists to check a window against |
| Peer set anchored by competitive-map | Y | `business-model/08_competitive-map.md` names peers from Karoon's own FY2025 Remuneration Report Industry Peer Group + CIQ Competitors export sourced to a Karoon Form Doc (Petroreconcavo is the one CIQ-relevancy-selected addition, already flagged as such upstream) |
| Subject's next-filing basis known | Y | H1 CY2026, standalone half-year, six months to 30-Jun-2026, released 2026-08-27 [`earnings/04_guidance-consensus.md` §1A] |
| Subject segment-map available (for scope-matching) | Y | `business-model/03_segment-map.md` — Brazil 77.9% revenue / 91.2% gross profit; USA 22.1% revenue |

## 4. Caps That Will Bind

| Trigger | Applies? (Y/N) | Cap |
|---|---|---|
| No usable call at all — no verbatim transcript AND no permitted broker paraphrase (G5) | **Y** | Insufficient — read-through/triangulation Not assessable |
| Only one peer transcript | N/A | Zero peer transcripts, not one |
| No peer reported the comparable window | **Y** (moot — no peer call of any kind exists) | Current-window read-through Not assessable |
| Dominant subject exposure uncovered by any peer | **Y** | Both segments (Brazil 77.9% of revenue, USA 22.1%) are entirely uncovered; net weight capped to zero |
| Peer set self-selected (no competitive-map) | N | Peer set is company-anchored via `competitive-map`; no self-selection cap needed on the naming side (Petroreconcavo's CIQ-selected status is already flagged upstream, and moot here regardless since no transcript exists for it) |
| Broker-paraphrase only (no verbatim) | N | Not applicable — no broker paraphrase exists either |

## 5. Sufficiency Verdict

- **Verdict:** Insufficient
- **Reason:** No peer transcript — verbatim or broker paraphrase — exists anywhere in `data/KAR/` (top level or the required `external/**` path), for any of the thirteen named peers in `business-model/08_competitive-map.md`; the module has no evidence to benchmark against.
- **Coverage of subject:** 0% — neither the dominant Brazil segment (77.9% of FY2025 revenue, 91.2% of gross profit) nor the USA segment (22.1% of revenue) has any reporting-peer vantage in this run's corpus.
- **Active caps:**
  - No usable call at all → read-through and narrative triangulation are Not assessable for this run (per MODULE_RULES: "No peer transcripts in the pool at all — module does not run [the benchmark]; a valid, decision-useful result").
  - Dominant and secondary segment exposure both uncovered → net read-through weight capped to zero, not merely Low.
  - Downstream `01_peer-claim-extraction` through `04_narrative-triangulation` will each report "Not assessable" for lack of input; `99_competitive-intel-synthesis` should state plainly that this module contributes no evidence to the master synthesis for this run.
- **Critical gaps:**
  - No Capital IQ "Competitor Transcripts" export for Karoon's peer set (Prio, Petroreconcavo, Gran Tierra, GeoPark, or any other named peer) has been dropped into `data/KAR/external/<provider>/`. This is the single highest-value data request: a Prio S.A. or Petroreconcavo S.A. earnings call covering H1/Q2 CY2026 (matching Karoon's H1 CY2026 window) would give this module its first usable read-through into the dominant Brazil segment.
  - `data/KAR/external/` does not exist as a directory at all — the operator has not yet run the CIQ "Competitor Transcripts" workflow for this ticker (MODULE_RULES, "Where the peer transcripts come from").
