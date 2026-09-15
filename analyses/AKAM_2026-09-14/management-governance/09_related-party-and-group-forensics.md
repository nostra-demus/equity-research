# Related-Party & Group Forensics — AKAM

**As of:** 2026-09-14  
**Basis:** U.S. GAAP; USD millions unless stated. `data/AKAM/` below is a logical label for the frozen evidence generation. The FY25 proxy that the 10-K incorporates for Item 13 is absent from that generation. A completed upstream public-EDGAR read of the 2026 DEF 14A is used only with that limitation stated.

## 1. RPT Intensity & the Applicable Regime (A5-01)

Applicable materiality rule per period: Akamai is a Delaware/Nasdaq issuer. For FY2023–FY2025, the relevant related-person disclosure rule is SEC Item 404(a): transactions above the $120,000 disclosure floor in which a covered related person had a direct or indirect material interest. This is a disclosure test, not an aggregate-RPT materiality test. The India LODR Reg. 23 slabs do not apply.

| FY | Aggregate RPTs ex-dividends | % of revenue | % of PAT | % of assets | Material-RPT line that year | Above the line? | Minority-approved? | Verdict | Source |
|---|---:|---:|---:|---:|---|---|---|---|---|
| 2023 | Not assessable — no Item 404/RPT disclosure in the frozen pool | N/A | N/A | N/A | SEC Item 404(a), $120k disclosure floor | Not assessable | Not assessable | Insufficient Data | [FY25 Form 10-K, Item 13, p.95 — incorporates absent 2026 proxy] |
| 2024 | Not assessable — no Item 404/RPT disclosure in the frozen pool | N/A | N/A | N/A | SEC Item 404(a), $120k disclosure floor | Not assessable | Not assessable | Insufficient Data | [FY25 Form 10-K, Item 13, p.95 — incorporates absent 2026 proxy] |
| 2025 | 0 Item 404(a)-reportable transactions; this is **not** a full aggregate-RPT ledger | N/A — do not divide the zero disclosure count by revenue | N/A | N/A | SEC Item 404(a), $120k disclosure floor | No Item 404(a) transaction reported | U.S. minority-vote approval not evidenced in supplied sources | Amber | [2026 DEF 14A, p.39 — public EDGAR read recorded in 07 People & Network Integrity Dossiers §4; proxy not in frozen pool] |

FY25 revenue was $4,208.175m, GAAP net income (PAT) $452.031m and total assets $11,479.643m, but no aggregate RPT amount exists to use as a numerator. A $0 Item 404 disclosure count cannot be relabelled as “0% RPTs.” [FY25 Form 10-K, pp.53–54; 2026 DEF 14A, p.39 — cross-module public EDGAR read]

The reported amount does not exceed 25% of revenue or expenses because no reported amount exists. The >25% hard-lock test therefore **defers to** `business-model/01_disqualifier-scan`, which records the ratio as not assessable and does not trigger the lock. [business-model/01_disqualifier-scan, §§1 and 4]

## 2. The RPT Ledger (every named counterparty)

The named-counterparty universe built from the available RPT sources is empty: the upstream public-proxy read reports no FY25 Item 404(a) transaction, while FY23–FY24 proxy/RPT disclosures are absent. This is not evidence that Akamai had no intercompany or below-threshold transactions.

| Counterparty | Relationship | Type (sales/purchases/royalty/rent/loan/guarantee/other) | FY-2 | FY-1 | FY (latest) | Trend | Arm's-length basis disclosed? | Source |
|---|---|---|---:|---:|---:|---|---|---|
| No named related-party counterparty disclosed in supplied RPT materials | N/A | N/A | N/A | N/A | 0 Item 404(a) rows, not a dollar ledger | Not assessable | Not assessable | [2026 DEF 14A, p.39 — cross-module public EDGAR read; FY25 Form 10-K, Item 13, p.95] |

## 3. Promoter-Linked Channels

### 3A. Royalty / brand / technology fees (A5-02)

| Payee | What is provided | Amount | % of turnover | Basis disclosed? | Trend vs margins | Prior minority approval? | Verdict | Source |
|---|---|---:|---:|---|---|---|---|---|
| No promoter/group payee identified | Brand/technology fee cannot be tested without the Item 404 policy and RPT note | N/A | N/A | Not assessable | Not assessable | Not assessable | Insufficient Data | [FY25 Form 10-K, Item 13, p.95; 07 People & Network Integrity Dossiers, §§4–5] |

The network read has not verified the owner of Akamai or product trademarks, including the former LayerX product branding. External ownership, a controller link, a licence, and any fee are all unproven; RF-NET-004 does not fire on that unresolved ownership question alone. [07 People & Network Integrity Dossiers, §§0A, 5; A17-04]

### 3B. Loans / ICDs / guarantees to the group (A5-03)

| Instrument | Counterparty | Amount | Rate vs market | Rolled over? | Counterparty health (registry) | Verdict | Source |
|---|---|---:|---|---|---|---|---|
| Loans, intercompany deposits (ICDs) or guarantees to a promoter/related entity | No RPT note or legal-entity cash ledger supplied | N/A | N/A | Not assessable | Not assessable | Insufficient Data | [FY25 Form 10-K, Item 13, p.95; 07 People & Network Integrity Dossiers, §5] |

The company’s standard third-party indemnities are not identified as related-party guarantees. Their fair value was immaterial in FY25 and H1 FY26, but this does not quantify any group guarantee; any future group guarantee belongs also in `10_contingent-liabilities-and-commitments` (A7a-06), counted once. [FY25 Form 10-K, Item 7 Off-Balance Sheet Arrangements, p.45; Q2 FY26 Form 10-Q, Item 2 Off-Balance Sheet Arrangements, p.42]

### 3C. Promoter-vendor / promoter-customer flows (A5-04)

| Entity | Customer / vendor / both | Value | % of revenue or COGS | Verdict | Source |
|---|---|---:|---:|---|---|
| Unnamed affiliate of a large social-media customer | Customer-side affiliate; **not** identified as an Akamai promoter, director or KMP entity | FY25 sublease income $8.187m; corresponding operating plus variable lease cost $8.033m | Income 0.195% of FY25 revenue; cost 0.191% | Not an RPT on available evidence; named-person link and legal name are absent | [FY25 Form 10-K, Note 12, pp.79–80; FY25 Form 10-K, p.54] |
| Promoter-linked vendor/customer | None identified in the available records | N/A | N/A | Insufficient Data — missing RPT ledger prevents a complete test | [FY25 Form 10-K, Item 13, p.95; 2026 DEF 14A, p.39 — cross-module public EDGAR read] |

The data-centre sublease has an identifiable commercial purpose and was close to flat in FY25: $8.187m income less $6.959m operating cost and $1.074m variable cost equals $0.154m net income. That arithmetic does not establish an arm’s-length related-party transaction; it instead shows why the unnamed customer affiliate should not be falsely placed in the RPT ledger. [FY25 Form 10-K, Note 12, pp.79–80]

## 4. Round-Tripping Cross-Year Name Match (A5-04)

One list was built across every available period: FY23–FY24 contain no supplied Item 404/RPT disclosure; FY25’s upstream proxy read contains zero Item 404(a) counterparties; the Capital IQ Suppliers/Customers graph contains zero named rows and explicitly is not a complete group or supplier-base view. Therefore no named customer-vendor match can be tested.

| Name | Years as customer | Years as vendor | Both roles? | Sales ≈ purchases (circular)? | Verdict | Source |
|---|---|---|---|---|---|---|
| No named RPT counterparties | N/A | N/A | Not assessable | Not assessable | Amber — investigation cannot be completed from an empty name list | [2026 DEF 14A, p.39 — cross-module public EDGAR read; Capital IQ Suppliers/Customers graph, frozen 2026-09-14 — tier-5, zero rows and scope-limited] |

No circularity conclusion is drawn. A two-way commercial match would be Amber until mirrored amounts/timing, off-market pricing, or a funds-flow circle supported a Red conclusion.

## 5. Approval & Disclosure Hygiene (A5-05, A5-06, A5-07, A5-08)

| ID | Test | Raw finding | Band | Verdict | Source |
|---|---|---|---|---|---|
| A5-05 | Arm's-length substantiation | No FY25 proxy policy, methodology or audit-committee record is in the frozen pool | Methodology not assessable; a bare assertion would not suffice | Insufficient Data | [FY25 Form 10-K, Item 13, p.95; 07 People & Network Integrity Dossiers, §5] |
| A5-06 | Minority dissent on RPT resolutions | AGM/proxy voting results absent | Votes-against not assessable | Insufficient Data | [00_governance-data-triage, §3; FY25 Form 10-K, Item 13, p.95] |
| A5-07 | Pre-approval, only-ID voting, omnibus discipline, slab-slicing | Audit-committee approval policy, related-person policy and transaction ledger absent | Pre-approval and slicing test not assessable | Insufficient Data | [FY25 Form 10-K, Item 13, p.95] |
| A5-08 | Counterparty transparency | Upstream SEC proxy read reports zero FY25 Item 404(a) transactions, but the proxy is not frozen and historic RPT ledgers are absent | Favourable current disclosure, incomplete verification | Amber | [2026 DEF 14A, p.39 — cross-module public EDGAR read; FY25 Form 10-K, Item 13, p.95] |

Slab-slicing result: not assessable. Same-counterparty totals cannot be summed when no counterparty/amount ledger is supplied. This is a U.S. issuer, so the relevant comparison would be Item 404(a)’s $120k disclosure threshold, not an Indian LODR approval slab.

## 6. Related-Party M&A — Including Aborted (A5-09)

| Deal (incl. proposed / withdrawn) | Seller / target link to promoter | Year | Value | Fairness opinion? | Outcome | Verdict | Source |
|---|---|---:|---:|---|---|---|---|
| StackPath customer-contract asset acquisition | No controller/KMP link identified | 2023 | $51.211m | Not disclosed in reviewed materials | Completed | Insufficient Data on RPT status | [FY25 Form 10-K, Note 8, p.71] |
| Lumen customer-contract asset acquisition | No controller/KMP link identified | 2023 | $79.682m | Not disclosed in reviewed materials | Completed | Insufficient Data on RPT status | [FY25 Form 10-K, Note 8, p.71] |
| Edgio customer-contract asset acquisition | No controller/KMP link identified | 2024 | $158.341m | Not disclosed in reviewed materials | Completed | Insufficient Data on RPT status | [FY25 Form 10-K, Note 8, p.71] |
| Noname Gate Ltd. / “Noname Security” | No controller/KMP link identified; legal-name reconciliation remains open | 2024 | $451.529m cash | Not disclosed in reviewed materials | Completed | Amber — legal-name reconciliation, not a proven related-party deal | [FY25 Form 10-K, Note 8, pp.71–73; 07 People & Network Integrity Dossiers, §§2B, 5] |
| Fermyon Technologies, Inc. | No controller/KMP link identified | 2025 | $56.6m cash | Not disclosed in reviewed materials | Completed | Insufficient Data on RPT status | [FY25 Form 10-K, Note 8, pp.71–72] |
| LayerX Security Ltd. | No controller/KMP link identified | 2026 | about $205.0m cash | Not disclosed in reviewed materials | Completed after Q2 balance-sheet date | Insufficient Data on RPT status | [Q2 FY26 Form 10-Q, Note 6] |
| Aborted or withdrawn controller-linked transaction | Board outcomes, AGM/postal-ballot records and historic exchange notices not supplied | FY23–FY26 | N/A | N/A | Not assessable | Insufficient Data | [00_governance-data-triage, §§1–3] |

No source identifies a controller-linked seller, but the missing historic proxy, board and voting records prevent a clean three-year related-party-M&A conclusion. No Satyam-Maytas-type attempted transaction is evidenced; this is not a claim that none occurred.

## 7. Executive-Counterparty Conflicts (A5-10)

| Person | Entity they own / run | Role vs listco (vendor / customer / lender / fund) | Materiality | Verdict | Source |
|---|---|---|---|---|---|
| F. Thomson Leighton | Massachusetts Institute of Technology — professor on leave | No Akamai vendor, customer, lender, fund or licence transaction identified | Not assessable | Amber — outside affiliation, no transaction found in available sources | [2026 DEF 14A, p.23 — cross-module public EDGAR read; 07 People & Network Integrity Dossiers, §§2B–4] |
| Edward J. McGowan | WinVest Acquisition Corp. — director | No Akamai transaction identified | Not assessable | Amber — outside board, no source proves a conflict | [2026 DEF 14A, pp.24–25 — cross-module public EDGAR read; 07 People & Network Integrity Dossiers, §§2B–4] |
| Officers/directors/KMP generally | Full outside-interest map absent; public FY25 Item 404 read was zero | N/A | Not assessable | Insufficient Data | [2026 DEF 14A, p.39 — cross-module public EDGAR read; 07 People & Network Integrity Dossiers, §5] |

## 8. Group-Structure Map (A11-01)

| Metric | Value | Band | Verdict | Source |
|---|---:|---|---|---|
| Layers, listco → deepest entity | Not disclosed in Exhibit 21.1; it lists entities, not parent-child ownership | ≤2 Green; >3 Red | Insufficient Data | [FY25 Form 10-K, Exhibit 21.1] |
| Total group entities (subs + associates + JVs) | 46 subsidiaries listed in Exhibit 21.1; no current associate/JV roll-forward supplied | Single-segment norm usually <20; >100 Red | Amber — above simple-company norm but below Red threshold and consistent with global operations | [FY25 Form 10-K, Exhibit 21.1; Note 1] |
| Offshore entities without evident purpose | 1 expressly Cayman-incorporated vehicle: AJ Technologies Ltd.; purpose not stated in the exhibit | 0 Green | Amber — purpose unproven, not a leakage finding | [FY25 Form 10-K, Exhibit 21.1] |
| Entities that only move money | Not assessable; no legal-entity purpose or cash ledger | 0 Green | Insufficient Data | [FY25 Form 10-K, Exhibit 21.1; Q2 FY26 Form 10-Q, pp.3–4] |

Narrative: the filing describes one operating segment and wholly owned subsidiaries with intercompany balances eliminated. The 46 listed entities appear to support global operations and acquired businesses, including Fermyon, Guardicore, Linode and Noname, but the filing supplies no parent-by-parent ownership chart or purpose for every entity. [FY25 Form 10-K, Note 1; Exhibit 21.1]

**Count reconciliation:** 07’s network map reports 57 Exhibit 21.1 entities, but the frozen primary exhibit has 46 lines marked “Incorporated in.” This report uses the primary-source count of 46 and treats the upstream 57 as a counting error, not as evidence of 11 omitted entities. [FY25 Form 10-K, Exhibit 21.1; 07 People & Network Integrity Dossiers, §3]

## 9. Cash & Funding Topology (A11-02, A11-03)

**Matched-basis rule (CLAUDE.md §15).** The filing provides only consolidated balances. It does not provide parent-versus-subsidiary cash or debt, so no unmatched cash-location ratio is created.

| Question | Raw value | Basis (both sides) | Matched ratio | Verdict | Source |
|---|---|---|---|---|---|
| Where does consolidated cash sit (parent vs subs)? | $4,616.305m cash, cash equivalents and marketable securities combined at 2026-06-30 | Consolidated period-end asset; no parent/sub cash balance supplied | Not assessable | Insufficient Data | [Q2 FY26 Form 10-Q, pp.3–4] |
| Share held with a related finance company / treasury vehicle | No such counterparty/balance identified | N/A | N/A | Insufficient Data | [FY25 Form 10-K, Exhibit 21.1; Q2 FY26 Form 10-Q, pp.3–4] |
| Parent borrowing while subs hold the cash? | Convertible-note carrying balance $7,562.828m; cash-only strict net debt $6,082.571m at 2026-06-30 | Both consolidated period-end balances; location split missing | No parent/sub ratio possible | Insufficient Data | [Q2 FY26 Form 10-Q, pp.3–4; earnings/01_historical-financials, §2] |
| ICDs to group entities — amount, rate, tenor | No disclosure supplied | N/A | N/A | Insufficient Data | [FY25 Form 10-K, Item 13, p.95; Q2 FY26 Form 10-Q, pp.3–4] |
| Evergreen / rolled-over ICDs? | No disclosure supplied | N/A | N/A | Insufficient Data | [FY25 Form 10-K, Item 13, p.95] |

The consolidated cash figure is $1,480.257m cash and equivalents + $1,875.130m current marketable securities + $1,260.918m non-current marketable securities = $4,616.305m. It cannot establish liquidity trapped in a subsidiary. The same applies to the consolidated convertible-note balance; it cannot establish which legal entity borrowed. [Q2 FY26 Form 10-Q, pp.3–4]

## 10. Listed-vs-Private Sibling Leakage (A11-04)

| Promoter private entity | Business overlap with listco | Migration signal (growth / margin / opportunity) | Verdict | Source |
|---|---|---|---|---|
| None identified from the coverage-limited entity web | MIT is Leighton’s disclosed employer affiliation, not a private operating sibling; no other controller-private business was proven | No flow or migration evidence | Amber — full outside-interest/entity map absent | [07 People & Network Integrity Dossiers, §§2B–5] |

## 11. Subsidiary Transparency & Governance (A11-05, A11-06)

| ID | Test | Raw finding | Band | Verdict | Source |
|---|---|---|---|---|---|
| A11-05 | Material subs' financials visible & audited; structure stable | 46 subsidiary names and jurisdictions are listed; financial statements are consolidated, with no legal-entity financials or ownership chart | Entity transparency incomplete | Amber | [FY25 Form 10-K, Note 1; Exhibit 21.1] |
| A11-05 | Restructuring churn / associates held below consolidation thresholds | Fermyon was acquired in 2025 and LayerX in July 2026; no multi-year legal-entity roll-forward or active associate/JV schedule supplied | Normal acquisition changes visible; broader churn not assessable | Insufficient Data | [FY25 Form 10-K, Note 8; Q2 FY26 Form 10-Q, Note 6] |
| A11-06 | Listco ID on every unlisted material sub's board; secretarial audit | India-specific rule is not applicable to this U.S. issuer; no equivalent subsidiary-board review performed | N/A | Not Applicable | [FY25 Form 10-K, cover — Delaware/Nasdaq issuer] |
| A11-06 | Special resolution before sub dilution <50% or >20% asset sale | India-specific rule is not applicable to this U.S. issuer; no transaction indicating this issue was supplied | N/A | Not Applicable | [FY25 Form 10-K, cover — Delaware/Nasdaq issuer] |

## 12. Off-Balance-Sheet Entities with Recourse (A11-07)

| Entity | Sponsor | Consolidated? | Recourse to listco | Guarantees / commitments | % of net worth | Verdict | Source |
|---|---|---|---|---:|---:|---|---|
| No company- or executive-sponsored SPE/SPV identified | N/A | N/A | The company reports no additional material off-balance-sheet arrangements at 2026-06-30 | FY25/H1 FY26 indemnity guarantees had immaterial fair value; not identified as group recourse | N/A | Green, limited to disclosed arrangements | [Q2 FY26 Form 10-Q, Item 2, p.42; FY25 Form 10-K, Item 7, p.45] |

The ordinary-course indemnities can have an unlimited stated maximum, so “immaterial fair value” is not a zero-exposure estimate. They are neither disclosed as a group-entity guarantee nor a parked-debt structure. [FY25 Form 10-K, Note 13, pp.81–82]

## 13. Disclosure Reconciliation (07's web vs the RPT note)

| Registry-derived related entity (from 07) | Transacts with listco? | In the RPT note? | A17-08 class | Obligation named + materiality | If not — why it matters |
|---|---|---|---|---|---|
| Akamai Technologies, Inc. | Issuer itself | N/A | not-disclosable | Self is not an RPT counterparty | N/A |
| 46 Exhibit 21.1 subsidiaries | Intercompany activity eliminated in consolidation; individual flows not supplied | Listed in Exhibit 21.1, not in an RPT note | disclosable-and-disclosed | Subsidiary-list obligation met by Exhibit 21.1; no individual materiality data | Ownership layers and entity financials remain unavailable |
| Fermyon Technologies, Inc. | Yes — acquired business | Yes, as acquisition and subsidiary | disclosable-and-disclosed | FY25 Note 8 and Exhibit 21.1 disclose it; $56.6m acquisition amount | No omission identified |
| Noname Gate Ltd. | Yes — acquired business | Yes, as acquisition and subsidiary | disclosable-and-disclosed | FY25 Note 8 and Exhibit 21.1 disclose it; $451.529m consideration | Legal-name reconciliation with “Noname Security” remains open |
| Noname Security Ltd. | Unclear | Name appears as the business label, not reconciled legal entity | obligation-unclear | No legal-name/transaction bridge establishes an omitted RPT or subsidiary obligation | Obtain acquisition closing schedule and legal-entity ledger; do not treat ambiguity as omission |
| LayerX Security Ltd. | Yes — acquired in July 2026 | Yes, Q2 FY26 subsequent-period acquisition disclosure | disclosable-and-disclosed | Q2 FY26 Note 6 names target and about $205m cash consideration | Not a FY25 Exhibit 21.1 omission because acquired after FY25 |
| WinVest Acquisition Corp. | No Akamai transaction proven | N/A | not-disclosable | McGowan’s outside directorship alone is not a related-party transaction | Monitor only if an Akamai deal appears |
| Massachusetts Institute of Technology | No Akamai transaction or licence proven | N/A | not-disclosable | Leighton employment affiliation alone does not create RPT disclosure | Obtain licence/IP register if material |

No `disclosable-and-omitted` entity has been established. RF-PPL-005, RF-NET-004 and RF-NET-005 therefore do not fire. The conclusion is limited: the frozen RPT note/proxy is absent, the vendor graph has zero scope-limited rows, and 07’s entity discovery stopped before a registry-complete mapping. [07 People & Network Integrity Dossiers, §§0, 4–5; Capital IQ Suppliers/Customers graph, frozen 2026-09-14 — tier-5]

## 14. Read

No dollar flow from Akamai to a promoter/controller group is proven. The only current direct evidence is an upstream public-proxy read of zero FY25 Item 404(a) transactions; it is not an aggregate RPT number, so the transaction intensity and % of PAT cannot be measured. The group has 46 listed subsidiaries and no disclosed cash-by-entity chart; that structure can obscure leakage if it exists, while the 46 count alone does not prove it does. The highest-value missing disclosure is the frozen 2026 DEF 14A Item 404 policy/transaction table plus the legal-entity ownership and intercompany cash/loan ledger.

# SWEEP LOG

| Database | Query | Date | Results | Attributed? (identifier used) | Coverage note |
|---|---|---|---:|---|---|
| SEC EDGAR — inherited upstream read | AKAM 2026 DEF 14A, Item 404 | 2026-09-14 | 0 FY25 Item 404(a) transactions reported | Yes — Akamai Technologies, Inc.; source/section recorded by 07 | No new web query was run here; DEF 14A is absent from frozen inventory and is used only as an upstream reconciliation read. |
| Capital IQ Suppliers/Customers relationship graph | AKAM deterministic frozen sidecar | 2026-09-14 | 0 nodes / 0 edges / 0 counterparties | Yes — AKAM graph | Covers only recently disclosed commercial relationships, not the supplier base, RPT ledger or full group. |
| Frozen filing inventory | FY25 Form 10-K, Q1/Q2 FY26 10-Q, listed exhibits | 2026-09-14 | Item 13 proxy absent; Exhibit 21.1 has 46 listed subsidiaries | Yes — CIK 0001086222 / AKAM | No AGM, voting-result, board-outcome or historic exchange-announcement source was supplied, so no aborted-RPT-M&A or voting sweep can be claimed. |

## Universal Findings Table

| Finding ID | Section | Question / Test | Standardized Verdict | Raw Value | Unit | Current Period | Prior Period | Trend | Peer Benchmark | Peer Verdict | Score | Max Score | Penalty | Confidence 1–5 | Materiality | Evidence | As-of Date | Analyst Interpretation | Red Flag Triggered? | Red Flag ID | Follow-up Required |
|---|---|---|---|---:|---|---|---|---|---|---|---:|---:|---:|---:|---|---|---|---|---|---|---|
| 09-001 | 1 | A5-01 — RPT intensity vs revenue/PAT/assets | Amber | 0 | FY25 Item 404(a) rows; aggregate $ N/A | FY25 | FY23–24 N/A | N/A | <1–5% aggregate RPT/revenue | Not assessable | 10 | 20 | 0 | 3 | High | [2026 DEF 14A, p.39 — cross-module public EDGAR read; FY25 10-K, Item 13, p.95] | 2026-09-14 | Public filing read is favorable, but it does not supply aggregate RPT dollars. | N | — | Freeze the proxy/RPT note and calculate three-year ratios. |
| 09-002 | 3A | A5-02 — Royalty / brand / technology fees to promoter group | Insufficient Data | N/A | USDm | FY25 | FY23–24 N/A | N/A | ≤2% turnover with disclosed basis | Not assessable | 2 | 7 | 0 | 2 | High | [FY25 10-K, Item 13, p.95; 07 dossier, §§0A, 5] | 2026-09-14 | Neither ownership of core marks nor licence economics is verified. | N | — | Obtain trademark owner and licence/royalty schedule. |
| 09-003 | 3B | A5-03 — Loans / ICDs / guarantees to group | Insufficient Data | N/A | USDm | FY25–Q2 FY26 | FY23–24 N/A | N/A | Nil/immaterial | Not assessable | 2 | 7 | 0 | 2 | High | [FY25 10-K, Item 13, p.95; Q2 FY26 10-Q, pp.3–4] | 2026-09-14 | Available sources cannot identify related borrowers, terms or guarantee beneficiaries. | N | — | Obtain intercompany-loan/guarantee ledger. |
| 09-004 | 3C–4 | A5-04 — Promoter vendor/customer flows and round-tripping | Amber | 0 | named RPT counterparty matches | FY23–FY25 | N/A | N/A | None / no circularity evidence | Not assessable | 3 | 6 | 0 | 3 | High | [2026 DEF 14A, p.39 — cross-module public EDGAR read; CIQ graph, frozen 2026-09-14] | 2026-09-14 | Empty named set prevents both a match and a clean conclusion; customer-affiliate sublease is not a promoter link. | N | — | Supply transaction ledger by legal counterparty. |
| 09-005 | 5 | A5-05 — Arm's-length substantiation | Insufficient Data | 0 | disclosed methodologies | FY25 | N/A | N/A | Benchmarking + AC approval | Not assessable | 3 | 4 | 0 | 2 | Medium | [FY25 10-K, Item 13, p.95] | 2026-09-14 | No policy/methodology is present in the frozen evidence. | N | — | Freeze Item 404 policy and audit-committee approval record. |
| 09-006 | 5 | A5-06 — Minority dissent on RPT resolutions | Insufficient Data | N/A | votes | FY25 | FY23–24 N/A | N/A | <10% against | Not assessable | 1 | 3 | 0 | 1 | Medium | [00_governance-data-triage, §3] | 2026-09-14 | AGM and voting-result files are absent. | N | — | Obtain 2024–26 annual-meeting voting results. |
| 09-007 | 5 | A5-07 — RPT pre-approval, ID voting, omnibus discipline, slab-slicing | Insufficient Data | N/A | approvals | FY25 | FY23–24 N/A | N/A | Fully pre-approved | Not assessable | 4 | 5 | 0 | 1 | High | [FY25 10-K, Item 13, p.95] | 2026-09-14 | No policy/ledger permits a $120k threshold or slicing test. | N | — | Obtain policy and transaction-level audit-committee log. |
| 09-008 | 5 | A5-08 — RPT counterparty transparency | Amber | 0 | FY25 Item 404(a) rows | FY25 | FY23–24 N/A | N/A | All RPT names/relationships | Partial | 2 | 3 | 0 | 3 | High | [2026 DEF 14A, p.39 — cross-module public EDGAR read; FY25 10-K, Item 13, p.95] | 2026-09-14 | No named material RPT is reported, but the supporting proxy is not frozen. | N | — | Add proxy and three-year counterparty ledger. |
| 09-009 | 6 | A5-09 — Related-party M&A including aborted deals | Insufficient Data | 6 | disclosed 2023–26 acquisitions; controller link N/A | FY23–Q2 FY26 | N/A | N/A | No controller-linked seller | Not assessable | 0 | 5 | 0 | 3 | High | [FY25 10-K, Note 8, pp.71–73; Q2 FY26 10-Q, Note 6] | 2026-09-14 | No link is identified, but missing board/exchange records prevent an aborted-deal sweep. | N | — | Add board outcomes, proxy and exchange-announcement history. |
| 09-010 | 7 | A5-10 — Executive-counterparty conflicts | Amber | 2 | disclosed outside affiliations | FY25–FY26 | N/A | N/A | No material counterparty controlled by insider | Partial | 2 | 5 | 0 | 3 | High | [2026 DEF 14A, pp.23–25, 39 — cross-module public EDGAR read; 07 dossier, §§2B–4] | 2026-09-14 | MIT and WinVest are monitor links; no Akamai transaction is proven. | N | — | Obtain complete officer/director interest register and transaction cross-match. |
| 09-011 | 8 | A11-01 — Holding-structure depth and entity count | Amber | 46 | Exhibit 21.1 subsidiaries | FY25 | N/A | N/A | ≤2 layers; <20 simple group; >100 Red | Partial | 7 | 8 | 0 | 4 | Medium | [FY25 10-K, Exhibit 21.1; Note 1] | 2026-09-14 | 46 global subsidiaries is not itself a red flag; depth and entity purposes are missing. | N | — | Obtain legal-entity ownership/purpose chart. |
| 09-012 | 9 | A11-02 — Trapped/round-tripped cash | Insufficient Data | 4,616.305 | USDm consolidated cash + securities | Q2 FY26 | N/A | N/A | Parent-held/fungible cash | Not assessable | 1 | 3 | 0 | 3 | High | [Q2 FY26 10-Q, pp.3–4] | 2026-09-14 | Consolidated cash cannot reveal subsidiary trapping. | N | — | Parent/sub cash and debt schedule. |
| 09-013 | 9 | A11-03 — Intercompany loans and deposits | Insufficient Data | N/A | USDm | FY25–Q2 FY26 | N/A | N/A | Nil/immaterial | Not assessable | 1 | 2 | 0 | 2 | High | [FY25 10-K, Item 13, p.95] | 2026-09-14 | No terms or balances are supplied. | N | — | Intercompany funding ledger. |
| 09-014 | 10 | A11-04 — Listed-vs-private sibling leakage | Amber | 0 | proven private overlapping businesses | FY25–FY26 | N/A | N/A | No opportunity migration | Partial | 2 | 5 | 0 | 3 | High | [07 dossier, §§2B–5] | 2026-09-14 | No promoter-private sibling is identified, but outside-interest mapping is incomplete. | N | — | Complete controller/entity and trademark/IP map. |
| 09-015 | 11 | A11-05 — Subsidiary financial transparency and structure stability | Amber | 46 | listed subsidiary names; entity financials N/A | FY25 | N/A | N/A | Material-sub financials visible | Partial | 1 | 2 | 0 | 4 | Medium | [FY25 10-K, Note 1; Exhibit 21.1] | 2026-09-14 | Names/jurisdictions are disclosed, not individual financials or parentage. | N | — | Legal-entity financials and structure roll-forward. |
| 09-016 | 11 | A11-06 — Unlisted material-subsidiary governance | N/A | N/A | U.S. issuer | FY25 | N/A | N/A | India Reg.24 controls | N/A | 0 | 0 | 0 | 5 | Low | [FY25 10-K, cover] | 2026-09-14 | India-specific test does not apply. | N | — | None. |
| 09-017 | 12 | A11-07 — Off-balance-sheet entities with recourse | Green | 0 | disclosed company/executive-sponsored SPEs | Q2 FY26 | FY25 | Stable | No SPE recourse; disclosed guarantees <2% net worth | Partial | 1 | 12 | 0 | 4 | Medium | [Q2 FY26 10-Q, Item 2, p.42; FY25 10-K, p.45] | 2026-09-14 | No material additional off-balance-sheet arrangement is reported; standard indemnity fair value is immaterial. | N | — | Recheck if a new SPV, guarantee or entity debt appears. |
| 09-018 | 3C | Commercial data-centre sublease, not an RPT | Green | 0.154 | USDm FY25 net income | FY25 | FY24 0 | New in 2025 | N/A | N/A | 0 | 0 | 0 | 5 | Low | [FY25 10-K, Note 12, pp.79–80] | 2026-09-14 | $8.187m income less $8.033m direct cost does not establish a promoter link. | N | — | Name counterparty only if a related-person link emerges. |
| 09-019 | 8/13 | Group-count and disclosure reconciliation | Amber | 46 vs 57 | subsidiary count | FY25 | N/A | N/A | Primary exhibit count | Upstream conflict | 3 | 3 | 0 | 5 | Medium | [FY25 10-K, Exhibit 21.1; 07 dossier, §3] | 2026-09-14 | Primary count of 46 supersedes upstream count of 57; no omission is inferred. | N | — | Correct upstream count and obtain ownership chart. |

## RPT & Leakage Risk Score (INVERTED — higher = WORSE)

| Component (risk contribution) | Score | Max Score | Evidence |
|---|---:|---:|---|
| RPT intensity vs thresholds (A5-01) | 10 | 20 | FY25 Item 404 read shows 0 rows, but no aggregate RPT ledger or three-year disclosure is frozen. |
| Promoter-linked channels — royalty, vendor-customer, loans/ICDs/guarantees (A5-02/03/04) | 7 | 20 | No promoter-linked flow identified; royalty, group lending and full vendor/customer evidence are incomplete. |
| Approval & disclosure hygiene (A5-05/06/07/08) | 10 | 15 | RPT policy, approval log and voting data absent; the FY25 public-proxy read is favourable but not frozen. |
| Group-structure opacity — layers, entity count, offshore, trapped cash, sub transparency (A11-01/02/03/05/06) | 10 | 15 | 46 listed subsidiaries, unknown depth/purpose/cash allocation; one Cayman entity has no stated purpose in Exhibit 21.1. |
| Listed-vs-private sibling leakage & executive-counterparty conflicts (A11-04, A5-10, A5-09) | 4 | 15 | No linked counterparty/seller identified; MIT and WinVest links are monitored, and M&A sweep is incomplete. |
| Undisclosed counterparties & off-balance-sheet recourse (A11-07, reconciliation vs 07) | 4 | 15 | No omitted entity or SPE recourse established; frozen proxy/transaction table and full entity mapping are absent. |
| **Total** | **45** | **100** | **Mixed/unknown risk; the missing RPT disclosure imposes the module’s ≥40 risk floor rather than a low-risk conclusion.** |

## Source Log

| Source ID | Source Type | Filename / Filing | Period | Page / Section | Date | Confidence 1–5 | Used For |
|---|---|---|---|---|---|---:|---|
| S1 | Tier 1 audited filing | FY25 Form 10-K | FY ended 2025-12-31 | Item 13 p.95; Note 1; Note 8 pp.71–73; Note 12 pp.79–80; Exhibit 21.1 | 2026-02-20 | 5 | Proxy incorporation/gap, acquisition ledger, sublease economics, subsidiary list. |
| S2 | Tier 2 quarterly filing | Q2 FY26 Form 10-Q | Quarter ended 2026-06-30 | pp.3–4; Note 6; Item 2 p.42 | 2026-08-06 | 5 | Consolidated cash/debt, LayerX acquisition and disclosed off-balance-sheet arrangements. |
| S3 | Tier 1 public regulator filing, upstream-only | 2026 DEF 14A | FY25 transactions | p.39 | 2026-03-31 | 4 | Zero FY25 Item 404(a) transaction read and outside-role reconciliation; not in frozen pool. |
| S4 | Tier 5 vendor export | Capital IQ Suppliers/Customers relationship graph | Recent disclosure view | Graph JSON | 2026-09-14 | 3 | Zero-row, scope-limited commercial relationship read. |
| S5 | Internal cross-module output | 07 People & Network Integrity Dossiers | Current run | §§0, 2B–5 | 2026-09-14 | 3 | Entity web, limited registry coverage, proxy provenance and reconciliation classifications. |
| S6 | Internal cross-module output | earnings/01_historical-financials | FY25–Q2 FY26 | §§1–2 | 2026-09-14 | 5 | Revenue/PAT/assets and strict-net-debt denominators/builds. |
| S7 | Internal cross-module output | business-model/01_disqualifier-scan | Current run | §§1, 4 | 2026-09-14 | 4 | Hard-lock deference and RPT denominator gap. |
| S8 | Internal cross-module output | 00_governance-data-triage | Current run | §§1–3, 5 | 2026-09-14 | 5 | Frozen source inventory and missing governance records. |

## Machine-Readable Findings

```json
[
  {"finding_id":"09-001","ticker":"AKAM","date":"2026-09-14","agent":"related-party-and-group-forensics","section":"1","question":"A5-01 — RPT intensity vs revenue/PAT/assets","standardized_verdict":"Amber","raw_value":0,"unit":"FY25 Item 404(a) rows; aggregate RPT USDm not available","current_period":"FY25","prior_period":"FY23-FY24 unavailable","trend":"N/A","peer_benchmark":"<1-5% aggregate RPT/revenue","peer_verdict":"Not assessable","score":10,"max_score":20,"penalty":0,"confidence_1_to_5":3,"materiality":"High","evidence":"2026 DEF 14A p.39 (public EDGAR read in 07; not frozen); FY25 10-K Item 13 p.95","source_id":"S1,S3","source_type":"filing / cross-module regulator filing","source_date":"2026-03-31","as_of_date":"2026-09-14","analyst_interpretation":"Zero Item 404 rows cannot be presented as zero aggregate RPTs.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":"Freeze proxy and calculate multi-year RPT ratios."},
  {"finding_id":"09-002","ticker":"AKAM","date":"2026-09-14","agent":"related-party-and-group-forensics","section":"3A","question":"A5-02 — Royalty / brand / technology fees to promoter group","standardized_verdict":"Insufficient Data","raw_value":null,"unit":"USDm","current_period":"FY25","prior_period":"FY23-FY24 unavailable","trend":"N/A","peer_benchmark":"<=2% turnover with disclosed basis","peer_verdict":"Not assessable","score":2,"max_score":7,"penalty":0,"confidence_1_to_5":2,"materiality":"High","evidence":"FY25 10-K Item 13 p.95; 07 dossier sections 0A and 5","source_id":"S1,S5","source_type":"filing / internal cross-module output","source_date":"2026-02-20","as_of_date":"2026-09-14","analyst_interpretation":"Brand ownership and licence fees are unverified; no RF-NET-004 trigger follows from an unresolved question.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":"Obtain trademark and royalty schedule."},
  {"finding_id":"09-003","ticker":"AKAM","date":"2026-09-14","agent":"related-party-and-group-forensics","section":"3B","question":"A5-03 — Loans / ICDs / guarantees to group","standardized_verdict":"Insufficient Data","raw_value":null,"unit":"USDm","current_period":"FY25-Q2 FY26","prior_period":"FY23-FY24 unavailable","trend":"N/A","peer_benchmark":"Nil/immaterial","peer_verdict":"Not assessable","score":2,"max_score":7,"penalty":0,"confidence_1_to_5":2,"materiality":"High","evidence":"FY25 10-K Item 13 p.95; Q2 FY26 10-Q pp.3-4","source_id":"S1,S2","source_type":"filing","source_date":"2026-08-06","as_of_date":"2026-09-14","analyst_interpretation":"No related borrower, rate, tenor or guarantee beneficiary is disclosed.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":"Obtain intercompany funding ledger."},
  {"finding_id":"09-004","ticker":"AKAM","date":"2026-09-14","agent":"related-party-and-group-forensics","section":"3C-4","question":"A5-04 — Promoter vendor/customer flows and round-tripping","standardized_verdict":"Amber","raw_value":0,"unit":"named RPT counterparty matches","current_period":"FY23-FY25","prior_period":"N/A","trend":"N/A","peer_benchmark":"No circularity evidence","peer_verdict":"Not assessable","score":3,"max_score":6,"penalty":0,"confidence_1_to_5":3,"materiality":"High","evidence":"2026 DEF 14A p.39 (cross-module read); CIQ relationship graph frozen 2026-09-14","source_id":"S3,S4","source_type":"regulator filing / vendor export","source_date":"2026-09-14","as_of_date":"2026-09-14","analyst_interpretation":"Empty named data cannot support a clean or circularity conclusion.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":"Supply counterparty ledger."},
  {"finding_id":"09-005","ticker":"AKAM","date":"2026-09-14","agent":"related-party-and-group-forensics","section":"5","question":"A5-05 — Arm's-length substantiation","standardized_verdict":"Insufficient Data","raw_value":0,"unit":"disclosed methodologies","current_period":"FY25","prior_period":"N/A","trend":"N/A","peer_benchmark":"Benchmarking plus audit-committee approval","peer_verdict":"Not assessable","score":3,"max_score":4,"penalty":0,"confidence_1_to_5":2,"materiality":"Medium","evidence":"FY25 10-K Item 13 p.95","source_id":"S1","source_type":"filing","source_date":"2026-02-20","as_of_date":"2026-09-14","analyst_interpretation":"A methodology is not in the frozen record.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":"Obtain Item 404 policy."},
  {"finding_id":"09-006","ticker":"AKAM","date":"2026-09-14","agent":"related-party-and-group-forensics","section":"5","question":"A5-06 — Minority dissent on RPT resolutions","standardized_verdict":"Insufficient Data","raw_value":null,"unit":"votes","current_period":"FY25","prior_period":"FY23-FY24 unavailable","trend":"N/A","peer_benchmark":"<10% against","peer_verdict":"Not assessable","score":1,"max_score":3,"penalty":0,"confidence_1_to_5":1,"materiality":"Medium","evidence":"00 governance-data-triage section 3","source_id":"S8","source_type":"internal cross-module output","source_date":"2026-09-14","as_of_date":"2026-09-14","analyst_interpretation":"No voting records were supplied.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":"Obtain AGM votes."},
  {"finding_id":"09-007","ticker":"AKAM","date":"2026-09-14","agent":"related-party-and-group-forensics","section":"5","question":"A5-07 — RPT pre-approval, ID voting, omnibus discipline, slab-slicing","standardized_verdict":"Insufficient Data","raw_value":null,"unit":"approvals","current_period":"FY25","prior_period":"FY23-FY24 unavailable","trend":"N/A","peer_benchmark":"Fully pre-approved","peer_verdict":"Not assessable","score":4,"max_score":5,"penalty":0,"confidence_1_to_5":1,"materiality":"High","evidence":"FY25 10-K Item 13 p.95","source_id":"S1","source_type":"filing","source_date":"2026-02-20","as_of_date":"2026-09-14","analyst_interpretation":"No policy or transaction-level data permits a slicing test.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":"Obtain approval log and ledger."},
  {"finding_id":"09-008","ticker":"AKAM","date":"2026-09-14","agent":"related-party-and-group-forensics","section":"5","question":"A5-08 — RPT counterparty transparency","standardized_verdict":"Amber","raw_value":0,"unit":"FY25 Item 404(a) rows","current_period":"FY25","prior_period":"FY23-FY24 unavailable","trend":"N/A","peer_benchmark":"All RPT names and relationships","peer_verdict":"Partial","score":2,"max_score":3,"penalty":0,"confidence_1_to_5":3,"materiality":"High","evidence":"2026 DEF 14A p.39 (cross-module read); FY25 10-K Item 13 p.95","source_id":"S1,S3","source_type":"filing / cross-module regulator filing","source_date":"2026-03-31","as_of_date":"2026-09-14","analyst_interpretation":"Current disclosure is favourable but is not frozen and historic ledgers are missing.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":"Add proxy and historic RPT disclosures."},
  {"finding_id":"09-009","ticker":"AKAM","date":"2026-09-14","agent":"related-party-and-group-forensics","section":"6","question":"A5-09 — Related-party M&A including aborted deals","standardized_verdict":"Insufficient Data","raw_value":6,"unit":"disclosed acquisitions","current_period":"FY23-Q2 FY26","prior_period":"N/A","trend":"N/A","peer_benchmark":"No controller-linked seller","peer_verdict":"Not assessable","score":0,"max_score":5,"penalty":0,"confidence_1_to_5":3,"materiality":"High","evidence":"FY25 10-K Note 8 pp.71-73; Q2 FY26 10-Q Note 6","source_id":"S1,S2","source_type":"filing","source_date":"2026-08-06","as_of_date":"2026-09-14","analyst_interpretation":"No controller link is identified, but the aborted-deal sweep cannot be completed.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":"Obtain board and exchange history."},
  {"finding_id":"09-010","ticker":"AKAM","date":"2026-09-14","agent":"related-party-and-group-forensics","section":"7","question":"A5-10 — Executive-counterparty conflicts","standardized_verdict":"Amber","raw_value":2,"unit":"outside affiliations monitored","current_period":"FY25-FY26","prior_period":"N/A","trend":"N/A","peer_benchmark":"No material insider-controlled counterparty","peer_verdict":"Partial","score":2,"max_score":5,"penalty":0,"confidence_1_to_5":3,"materiality":"High","evidence":"2026 DEF 14A pp.23-25,39 (cross-module read); 07 dossier sections 2B-4","source_id":"S3,S5","source_type":"regulator filing / internal cross-module output","source_date":"2026-03-31","as_of_date":"2026-09-14","analyst_interpretation":"MIT and WinVest have no Akamai transaction proven.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":"Cross-match a complete interests register to procurement/customer data."},
  {"finding_id":"09-011","ticker":"AKAM","date":"2026-09-14","agent":"related-party-and-group-forensics","section":"8","question":"A11-01 — Holding-structure depth and entity count","standardized_verdict":"Amber","raw_value":46,"unit":"Exhibit 21.1 subsidiaries","current_period":"FY25","prior_period":"N/A","trend":"N/A","peer_benchmark":"<=2 layers; <20 simple group; >100 Red","peer_verdict":"Partial","score":7,"max_score":8,"penalty":0,"confidence_1_to_5":4,"materiality":"Medium","evidence":"FY25 10-K Exhibit 21.1; Note 1","source_id":"S1","source_type":"audited filing","source_date":"2026-02-20","as_of_date":"2026-09-14","analyst_interpretation":"Group size is known but depth and purpose are not.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":"Obtain ownership chart."},
  {"finding_id":"09-012","ticker":"AKAM","date":"2026-09-14","agent":"related-party-and-group-forensics","section":"9","question":"A11-02 — Trapped/round-tripped cash","standardized_verdict":"Insufficient Data","raw_value":4616.305,"unit":"USDm consolidated cash and securities","current_period":"Q2 FY26","prior_period":"N/A","trend":"N/A","peer_benchmark":"Parent-held/fungible cash","peer_verdict":"Not assessable","score":1,"max_score":3,"penalty":0,"confidence_1_to_5":3,"materiality":"High","evidence":"Q2 FY26 10-Q pp.3-4","source_id":"S2","source_type":"quarterly filing","source_date":"2026-08-06","as_of_date":"2026-09-14","analyst_interpretation":"Consolidated cash cannot show legal-entity location.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":"Obtain parent/sub cash schedule."},
  {"finding_id":"09-013","ticker":"AKAM","date":"2026-09-14","agent":"related-party-and-group-forensics","section":"9","question":"A11-03 — Intercompany loans and deposits","standardized_verdict":"Insufficient Data","raw_value":null,"unit":"USDm","current_period":"FY25-Q2 FY26","prior_period":"N/A","trend":"N/A","peer_benchmark":"Nil/immaterial","peer_verdict":"Not assessable","score":1,"max_score":2,"penalty":0,"confidence_1_to_5":2,"materiality":"High","evidence":"FY25 10-K Item 13 p.95","source_id":"S1","source_type":"filing","source_date":"2026-02-20","as_of_date":"2026-09-14","analyst_interpretation":"No intercompany balance or tenor is supplied.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":"Obtain intercompany funding ledger."},
  {"finding_id":"09-014","ticker":"AKAM","date":"2026-09-14","agent":"related-party-and-group-forensics","section":"10","question":"A11-04 — Listed-vs-private sibling leakage","standardized_verdict":"Amber","raw_value":0,"unit":"proven overlapping private businesses","current_period":"FY25-FY26","prior_period":"N/A","trend":"N/A","peer_benchmark":"No opportunity migration","peer_verdict":"Partial","score":2,"max_score":5,"penalty":0,"confidence_1_to_5":3,"materiality":"High","evidence":"07 dossier sections 2B-5","source_id":"S5","source_type":"internal cross-module output","source_date":"2026-09-14","as_of_date":"2026-09-14","analyst_interpretation":"No sibling leakage is identified, but the entity map is incomplete.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":"Complete entity/brand mapping."},
  {"finding_id":"09-015","ticker":"AKAM","date":"2026-09-14","agent":"related-party-and-group-forensics","section":"11","question":"A11-05 — Subsidiary financial transparency and structure stability","standardized_verdict":"Amber","raw_value":46,"unit":"listed subsidiaries; individual financials unavailable","current_period":"FY25","prior_period":"N/A","trend":"N/A","peer_benchmark":"Material-sub financials visible","peer_verdict":"Partial","score":1,"max_score":2,"penalty":0,"confidence_1_to_5":4,"materiality":"Medium","evidence":"FY25 10-K Note 1; Exhibit 21.1","source_id":"S1","source_type":"audited filing","source_date":"2026-02-20","as_of_date":"2026-09-14","analyst_interpretation":"Names and jurisdictions are transparent; financials/parentage are not.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":"Obtain entity financials and roll-forward."},
  {"finding_id":"09-016","ticker":"AKAM","date":"2026-09-14","agent":"related-party-and-group-forensics","section":"11","question":"A11-06 — Unlisted material-subsidiary governance","standardized_verdict":"Not Applicable","raw_value":null,"unit":"N/A","current_period":"FY25","prior_period":"N/A","trend":"N/A","peer_benchmark":"India Reg.24 controls","peer_verdict":"N/A","score":0,"max_score":0,"penalty":0,"confidence_1_to_5":5,"materiality":"Low","evidence":"FY25 10-K cover: Delaware/Nasdaq issuer","source_id":"S1","source_type":"audited filing","source_date":"2026-02-20","as_of_date":"2026-09-14","analyst_interpretation":"India-specific test does not apply.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":""},
  {"finding_id":"09-017","ticker":"AKAM","date":"2026-09-14","agent":"related-party-and-group-forensics","section":"12","question":"A11-07 — Off-balance-sheet entities with recourse","standardized_verdict":"Green","raw_value":0,"unit":"disclosed company/executive-sponsored SPEs","current_period":"Q2 FY26","prior_period":"FY25","trend":"Stable","peer_benchmark":"No SPE recourse","peer_verdict":"Partial","score":1,"max_score":12,"penalty":0,"confidence_1_to_5":4,"materiality":"Medium","evidence":"Q2 FY26 10-Q Item 2 p.42; FY25 10-K p.45","source_id":"S1,S2","source_type":"filing","source_date":"2026-08-06","as_of_date":"2026-09-14","analyst_interpretation":"No material additional arrangement is disclosed; ordinary indemnities are not group recourse.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":"Recheck new SPVs/guarantees."},
  {"finding_id":"09-018","ticker":"AKAM","date":"2026-09-14","agent":"related-party-and-group-forensics","section":"3C","question":"Commercial data-centre sublease, not an RPT","standardized_verdict":"Green","raw_value":0.154,"unit":"USDm FY25 net income","current_period":"FY25","prior_period":"FY24","trend":"New in 2025","peer_benchmark":"N/A","peer_verdict":"N/A","score":0,"max_score":0,"penalty":0,"confidence_1_to_5":5,"materiality":"Low","evidence":"FY25 10-K Note 12 pp.79-80","source_id":"S1","source_type":"audited filing","source_date":"2026-02-20","as_of_date":"2026-09-14","analyst_interpretation":"Income less direct costs is $0.154m; no insider link is identified.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":"Name counterparty only if an insider link emerges."},
  {"finding_id":"09-019","ticker":"AKAM","date":"2026-09-14","agent":"related-party-and-group-forensics","section":"8/13","question":"Group-count and disclosure reconciliation","standardized_verdict":"Amber","raw_value":"46 vs 57","unit":"subsidiary count","current_period":"FY25","prior_period":"N/A","trend":"N/A","peer_benchmark":"Primary exhibit count","peer_verdict":"Upstream conflict","score":3,"max_score":3,"penalty":0,"confidence_1_to_5":5,"materiality":"Medium","evidence":"FY25 10-K Exhibit 21.1; 07 dossier section 3","source_id":"S1,S5","source_type":"audited filing / internal cross-module output","source_date":"2026-09-14","as_of_date":"2026-09-14","analyst_interpretation":"Primary count of 46 governs; no omitted entities are inferred.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":"Correct upstream count and obtain ownership chart."}
]
```

### rpt_counterparty_ledger.json

```json
[]
```

No named related-party counterparty is available from the supplied RPT sources. The unnamed social-media-customer affiliate is deliberately excluded because it is not established as an Akamai related party.

## Hard Self-Check

- All 17 owned A5/A11 checklist items are present in the Universal Findings Table.
- The cross-year customer/vendor set was built; it is empty because the available RPT sources provide no named counterparties.
- No approval-slab or circularity test is represented as completed where its transaction ledger is absent.
- The applicable U.S. Item 404(a) regime is stated; Indian LODR rules were not applied.
- The 46-versus-57 subsidiary-count disagreement is named and resolved to the primary Exhibit 21.1 source.
- Missing RPT evidence is reflected in a 45/100 inverted risk score, above the 40-point unknown-data floor, not as low risk.
