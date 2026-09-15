# Competitive-Intel Data Triage — AKAM

## 0. Subject's Next Filing (the read-through target)

*"AKAM files next: Q3 2026, standalone three-month basis, covering ~1 July–30 September 2026, expected ~3 November 2026."* AKAM is a US GAAP, calendar-year reporter; its next interim filing is a Form 10-Q, which presents a standalone quarter (with comparative year-to-date statements), not a cumulative-only result. [Capital IQ Estimates Report, Consensus worksheet header, 2026-09-14 — vendor export; Q2 2026 Form 10-Q, cover and Item 1]

## 1. Peer Transcript Inventory & Reporting Calendar

| Peer | Ticker / venue | Std / currency / FY-end | Language | Most-recent call (native label) | Normalised window | Interim basis | Timing vs subject window | Scope overlap | Source (path) |
|---|---|---|---|---|---|---|---|---|---|
| — | — | — | — | — | — | — | — | — | No competitor transcript or permitted broker-paraphrase is present under `data/AKAM/external/`. The frozen generation has 16 source files, all extracted successfully, but zero external-source rows. [Frozen generation manifest, generation `c4d3e6273c464a9c80ac6b2d5376f06f8686a7fd7d1593a78ba6741c81cf1d6c`, source inventory and totals] |

The competitive map anchors the intended peer set as Cloudflare (NYSE: NET), Fortinet (NasdaqGS: FTNT), and Fastly (NasdaqGS: FSLY). All three are public companies, but each is a no-transcript coverage gap in this frozen run; there is no calendar map or Timing-Rule state to assign without an injected peer call. No private competitor is named in the upstream competitive map. [Business-model Competitive Map — AKAM, §2; CIQ Company Comparable Analysis, Business Description sheet, 2026-09-14 — vendor export]

## 2. Coverage of the Subject's Exposure

Reporting, read-through-eligible peers cover **0% of AKAM's published revenue categories** in this run because there are no usable peer calls. The uncovered exposure is the whole company: Security, 55.0% of Q2 2026 revenue; Delivery and other cloud applications, 36.0%; and Cloud infrastructure services (CIS), 9.0%. The product overlap identified for Cloudflare, Fortinet, and Fastly does not turn into evidence about any of these categories without their calls. [Q2 2026 Form 10-Q, Note 11 (Revenue from Contracts with Customers), p.23; Business-model Competitive Map — AKAM, §2]

## 3. Usability Check

| Requirement | Available? (Y/N) | Detail |
|---|---|---|
| ≥1 usable competitor call (verbatim transcript OR permitted broker paraphrase, G5) | N | `data/AKAM/external/` is absent from the frozen snapshot and the manifest contains zero external-source rows. [Frozen generation manifest, generation `c4d3e6273c464a9c80ac6b2d5376f06f8686a7fd7d1593a78ba6741c81cf1d6c`, source inventory] |
| ≥2 distinct peer companies with verbatim transcripts (dispersion possible) | N | Zero distinct peer companies have a usable call. |
| ≥1 peer reported the comparable window (read-through possible) | N | No peer call is in the auditable corpus, so no peer can be date-gated against the July–September 2026 target window. |
| Peer set anchored by competitive-map | Y | Cloudflare, Fortinet, and Fastly are named in the available competitive map; the set is not self-selected. [Business-model Competitive Map — AKAM, §2] |
| Subject's next-filing basis known | Y | Q3 2026 is a standalone US quarterly period ending 30 September 2026; the vendor export schedules the release for 3 November 2026. [Capital IQ Estimates Report, Consensus worksheet header, 2026-09-14 — vendor export; Q2 2026 Form 10-Q, cover and Item 1] |
| Subject segment-map available (for scope-matching) | Y | The map provides Q2 2026 category weights of Security 55.0%, Delivery and other cloud applications 36.0%, and CIS 9.0%. [Q2 2026 Form 10-Q, Note 11, p.23] |

## 4. Caps That Will Bind

| Trigger | Applies? (Y/N) | Cap |
|---|---|---|
| No usable call at all — no verbatim transcript AND no permitted broker paraphrase (G5) | Y | Insufficient — read-through and triangulation Not assessable. |
| Only one peer transcript | N | Zero, rather than one, usable peer transcript; the stronger no-usable-call cap applies. |
| No peer reported the comparable window | Y | Current-window read-through Not assessable. |
| Dominant subject exposure uncovered by any peer | Y | All subject exposure is uncovered in the evidence corpus; every category's read-through is Not assessable and no net read-through weight can be assigned. |
| Peer set self-selected (no competitive-map) | N | The competitive map anchors the peer set. [Business-model Competitive Map — AKAM, §2] |
| Broker-paraphrase only (no verbatim) | N | No permitted broker paraphrase is present. |

## 5. Sufficiency Verdict

- **Verdict:** Insufficient
- **Reason:** No usable competitor transcript or permitted broker paraphrase is present in AKAM's immutable evidence snapshot, despite an upstream competitive map naming three public peers. [Frozen generation manifest, generation `c4d3e6273c464a9c80ac6b2d5376f06f8686a7fd7d1593a78ba6741c81cf1d6c`, source inventory; Business-model Competitive Map — AKAM, §2]
- **Coverage of subject:** 0% of AKAM's revenue categories is covered by a reporting peer; Security (55.0%), Delivery and other cloud applications (36.0%), and CIS (9.0%) are all uncovered. [Q2 2026 Form 10-Q, Note 11, p.23]
- **Active caps:**
  - Read-through and narrative triangulation are Not assessable.
  - Cross-sectional dispersion is Not assessable.
  - No current-window peer read-through or net read-through weight can be assigned.
- **Critical gaps:**
  - Inject verbatim Q3-2026 or otherwise comparable-window calls for Cloudflare, Fortinet, and Fastly into `data/AKAM/external/` before the next frozen evidence generation.
  - The next intake should include a peer result that can be date-gated to AKAM's standalone July–September 2026 period; no such peer evidence is in this run.
