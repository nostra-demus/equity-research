# Competitive-Intel Data Triage — BURL

## 0. Subject's Next Filing (the read-through target)

*"BURL files next: Q3 Fiscal 2026, standalone basis, covering the 13 weeks ending October 31, 2026, expected about November 25, 2026."* The 13-week Q3 period is company guidance; the date is Capital IQ's derived estimate and is therefore not a company-confirmed reporting date. [BURL Q2 FY2026 earnings release, Outlook, 2026-08-27; Capital IQ Events Calendar, 2026, estimated release date 2026-11-25 — vendor export]

## 1. Peer Transcript Inventory & Reporting Calendar

No competitor transcript is injected under `data/BURL/external/**`: the bound frozen manifest has 30 source rows and zero external rows. BURL's own Q1 and Q2 calls in the snapshot are subject-company calls, not peer evidence. There is therefore no peer transcript row to calendar-normalise. [Frozen pool manifest, generation `fc90a997f0c1c57b475af85d46d5fac22d04f645a3d926655acba4ef4b26f766`, Sources]

| Peer | Ticker / venue | Std / currency / FY-end | Language | Most-recent call (native label) | Normalised window | Interim basis | Timing vs subject window | Scope overlap | Source (path) |
|---|---|---|---|---|---|---|---|---|---|
| No qualifying peer transcript | — | — | — | — | — | — | — | — | No `data/BURL/external/**` source in the bound manifest |

Named no-transcript coverage gaps (not Timing-Rule states): Ross Stores, Inc. (NasdaqGS: ROST) and The TJX Companies, Inc. (NYSE: TJX). They are the competitive map's two named public U.S. off-price peers, but neither has an injected transcript in this snapshot. No private competitor is named in the accepted peer map. [data/BURL/Company-Comparable-Analysis-Burlington-Stores-Inc.xls, Business Description, as of 2026-09-28 — vendor export; FY2025 Form 10-K, Item 1 — Competition]

## 2. Coverage of the Subject's Exposure

Reporting, read-through-eligible peers cover **0%** of BURL's revenue in this run: BURL has one U.S. off-price retail segment representing 100.0% of FY2025 revenue, and no transcript from either named overlapping peer is in the auditable snapshot. The uncovered majority is consequently the entire U.S. off-price retail business, including BURL's apparel, footwear, accessories and home exposure. Current-window peer read-through for BURL is **Not assessable**. [FY2025 Form 10-K, Note 1 — Segment Information; data/BURL/Company-Comparable-Analysis-Burlington-Stores-Inc.xls, Business Description, as of 2026-09-28 — vendor export; Frozen pool manifest, generation `fc90a997f0c1c57b475af85d46d5fac22d04f645a3d926655acba4ef4b26f766`, Sources]

## 3. Usability Check

| Requirement | Available? (Y/N) | Detail |
|---|---|---|
| ≥1 usable competitor call (verbatim transcript OR permitted broker paraphrase, G5) | N | No external-source row, verbatim peer transcript, or broker peer-call paraphrase is present in the bound BURL snapshot. |
| ≥2 distinct peer companies with verbatim transcripts (dispersion possible) | N | Neither Ross nor TJX has an injected transcript. |
| ≥1 peer reported the comparable window (read-through possible) | N | No usable peer call covers BURL's 13 weeks ending 2026-10-31; this is an evidence gap, not a claim that either peer has not reported. |
| Peer set anchored by competitive-map | Y | Ross and TJX are named in `business-model/08_competitive-map.md`, anchored to the BURL comparable-company export. |
| Subject's next-filing basis known | Y | US Form 10-Q: standalone Q3 Fiscal 2026, 13 weeks ending 2026-10-31. [BURL Q2 FY2026 earnings release, Outlook, 2026-08-27] |
| Subject segment-map available (for scope-matching) | Y | One U.S. off-price retail segment, 100.0% of FY2025 revenue. [FY2025 Form 10-K, Note 1 — Segment Information] |

## 4. Caps That Will Bind

| Trigger | Applies? (Y/N) | Cap |
|---|---|---|
| No usable call at all — no verbatim transcript AND no permitted broker paraphrase (G5) | Y | Insufficient — read-through/triangulation Not assessable. (A broker-paraphrase-only pool is Partial, NOT this row — consistent with the sufficiency rule.) |
| Only one peer transcript | N | No single peer transcript exists; the stricter no-usable-call cap applies. |
| No peer reported the comparable window | Y | Current-window read-through Not assessable. No peer evidence exists to calendar-match to BURL's 13 weeks ending 2026-10-31. |
| Dominant subject exposure uncovered by any peer | Y | BURL's sole 100% U.S. off-price segment has no reporting-peer vantage; its read-through is Not assessable and net weight cannot be set. |
| Peer set self-selected (no competitive-map) | N | The upstream competitive map names Ross and TJX. |
| Broker-paraphrase only (no verbatim) | N | No permitted broker paraphrase is present. |

## 5. Sufficiency Verdict

- **Verdict:** Insufficient
- **Reason:** The frozen BURL snapshot contains no usable competitor transcript or permitted broker paraphrase, so no peer can be normalised to BURL's next reporting window.
- **Coverage of subject:** 0% of BURL's 100% U.S. off-price retail segment is covered by reporting, read-through-eligible peers.
- **Active caps:**
  - Read-through and narrative triangulation are Not assessable.
  - Cross-sectional dispersion is Not assessable.
  - No current-window peer inference may be made about BURL.
- **Critical gaps:**
  - No injected call or permitted broker paraphrase for either named peer, Ross or TJX.
  - No auditable peer reporting calendar, window match, scope tag or management commentary for the Q3 Fiscal 2026 target period.
  - The entire BURL operating exposure lacks a reporting-peer vantage in this frozen generation.
