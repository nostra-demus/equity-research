# Related-Party & Group Forensics — BURL

## 1. RPT Intensity & the Applicable Regime (A5-01)

BURL is a U.S. issuer. The applicable screen for each fiscal year is SEC Regulation S-K Item 404(a): a transaction exceeding $120,000 in which a related person has a direct or indirect material interest must be disclosed. This is a disclosure threshold, not a measure of every de-minimis consolidated intercompany transaction. The current proxy covers the period from the beginning of FY2025 through April 2, 2026; the frozen pool does not contain the corresponding FY2023 or FY2024 proxy disclosures. [FY2026 Proxy Statement, Certain Relationships and Related Person Transactions]

| FY | Aggregate RPTs ex-dividends | % of revenue | % of PAT | % of assets | Material-RPT line that year | Above the line? | Minority-approved? | Verdict | Source |
|---|---:|---:|---:|---:|---|---|---|---|---|
| FY2023 | Not assessable — no contemporaneous Item 404 disclosure in the frozen pool | N/A | N/A | N/A | Item 404(a): $120k | Not assessable | Not assessable | Insufficient Data | [FY2024 Form 10-K, Schedule I; frozen-pool inventory, 2026-09-29] |
| FY2024 | Not assessable — no contemporaneous Item 404 disclosure in the frozen pool | N/A | N/A | N/A | Item 404(a): $120k | Not assessable | Not assessable | Insufficient Data | [FY2024 Form 10-K, Schedule I; frozen-pool inventory, 2026-09-29] |
| FY2025 (ended 2026-01-31) | $0 of Item-404-reportable related-person transactions; the proxy does not quantify every non-reportable consolidated intercompany flow | 0.0% of $11,549.6m | 0.0% of $610.2m | 0.0% of $9,919.1m | Item 404(a): $120k | No reported transaction above the line | Not required on the disclosed $0 category | Amber — current reportable screen clear; full aggregate RPT total is not disclosed | [FY2026 Proxy Statement, Certain Relationships and Related Person Transactions; FY2025 Form 10-K, Consolidated Statements of Income and Balance Sheets; earnings/01, Annual Financial Table] |

The disclosed Item 404 category is $0 / $11,549.6m revenue = 0.0% and $0 / $10,700.7m operating-cost/expense base = 0.0%. It is below the 25% test, but that hard-lock conclusion belongs to `business-model/01_disqualifier-scan`; this report does not re-adjudicate it. The result does not prove that de-minimis or consolidated intercompany transactions were zero. [business-model/01_disqualifier-scan, Disqualifier 3; FY2026 Proxy Statement, Certain Relationships and Related Person Transactions]

## 2. The RPT Ledger (every named counterparty)

The proxy names no Item-404-reportable related-person counterparty. The only named group financing channel found in the filed parent-only schedules is the joint BCFWC/Burlington Merchandising obligation below; it is eliminated in consolidation and is not a payment to a promoter or a separate controller.

| Counterparty | Relationship | Type (sales/purchases/royalty/rent/loan/guarantee/other) | FY2023 | FY2024 | FY2025 (latest) | Trend | Arm's-length basis disclosed? | Source |
|---|---|---|---:|---:|---:|---|---|---|
| Burlington Coat Factory Warehouse Corporation (BCFWC) and Burlington Merchandising Corporation (BMC), jointly and severally | Wholly owned subsidiaries | Parent intercompany note receivable supporting the Parent's convertible notes | $453.2m joint amount | $453.2m joint amount | $297.1m joint amount | Down $156.1m (34.4%) from FY2024; do not add the joint amount twice | Terms and interest rate stated as consistent with the Parent's 2025/2027 convertible notes; no separate third-party pricing study disclosed | [FY2024 Form 10-K, Schedule I, Note 4; FY2025 Form 10-K, Schedule I, Note 4] |

There is no disclosed external promoter, executive, director, or >5% holder on the other side of this joint note. The history is therefore a disclosed intra-group funding flow, not evidence that value moved to a controller. Its size still warrants an Amber, rather than a Green, group-topology read. [FY2025 Form 10-K, Schedule I, Note 4; FY2026 Proxy Statement, Certain Relationships and Related Person Transactions]

## 3. Promoter-Linked Channels

### 3A. Royalty / brand / technology fees (A5-02)

| Payee | What is provided | Amount | % of turnover | Basis disclosed? | Trend vs margins | Prior minority approval? | Verdict | Source |
|---|---|---:|---:|---|---|---|---|---|
| No external/controller-linked payee identified | BURL's core marks are recorded by the network review as owned within the BURL group; no external brand-fee arrangement was disclosed | No fee disclosed | Not assessable; no disclosed fee | No separate fee or method disclosed because no external licence/payee was identified | Not assessable | Not applicable on the disclosed record | Green for ownership alignment; limited to the disclosed record | [FY2025 Form 10-K, Item 1—Trademarks; 07_people-integrity-dossiers, Sections 0A and 3B] |

BCFWC's group ownership of the Burlington marks is not an external licence or a controller-side royalty. No RF-NET-004 is propagated: `07` found no controller-linked external proprietor, undisclosed licence, disputed licence, or shared live mark that met its trigger. [07_people-integrity-dossiers, A17-04 and entity-network handoff]

### 3B. Loans / ICDs / guarantees to the group (A5-03)

| Instrument | Counterparty | Amount | Rate vs market | Rolled over? | Counterparty health (registry) | Verdict | Source |
|---|---|---:|---|---|---|---|---|
| Parent intercompany promissory note | BCFWC and BMC, wholly owned subsidiaries, jointly and severally | $297.1m at 2026-01-31; $453.2m at 2025-02-01 and 2024-02-03 | Same interest rate and repayment terms as the Parent's convertible notes; no independent market-rate study disclosed | Balance declined with the 2025-note maturity; no evidence in the filing of serial evergreen rolling | No external borrower-health screen applied: the borrowers are consolidated subsidiaries, not separate promoter vehicles | Amber — material but disclosed, terms linked to external Parent debt, and balance declined | [FY2025 Form 10-K, Schedule I, Note 4; FY2024 Form 10-K, Schedule I, Note 4] |
| Letters of credit | Lease, insurance, utility and merchandising counterparties; no group beneficiary identified | $50.4m total at 2026-01-31, including $49.8m for leases/insurance/utilities and $0.5m merchandising | Not a related-party loan/guarantee | N/A | N/A | Not a group guarantee; route total exposure once to 10/A7a-06 | [FY2025 Form 10-K, Note 14—Commitments and Contingencies] |

No loan, deposit, or guarantee to a promoter-controlled entity was identified, so RF-RPT-003 does not fire. The $297.1m item is nevertheless material to the legal-entity cash map and is counted only here; the unrelated letters of credit are cross-referenced to `10_contingent-liabilities-and-commitments` rather than counted as group support.

### 3C. Promoter-vendor / promoter-customer flows (A5-04)

| Entity | Customer / vendor / both | Value | % of revenue or COGS | Verdict | Source |
|---|---|---:|---:|---|---|
| No promoter-linked vendor or customer disclosed | None identified in Item 404 disclosure | Not disclosed | Not assessable | Green for current disclosed Item 404 population; vendor-value coverage is incomplete | [FY2026 Proxy Statement, Certain Relationships and Related Person Transactions] |
| CIQ relationship-graph counterparties | Suppliers/landlords/creditors to BURL group entities, not promoted to related-party status | No value disclosed | Not assessable | Not evidence of a promoter flow; graph covers recently disclosed relationships only | [relationships.json, CIQ Suppliers export, scope notes and rows 6–38 — Tier 5 vendor export] |

The relationship graph labels BCFWC, BMC, BCF Direct, Cohoes and the investment-holding entity as group-side anchors in some relationships. That prevents treating them as arm's-length counterparties, but it does not establish a controller-linked vendor/customer flow or provide prices. [relationships.json, CIQ Suppliers export, scope notes]

## 4. Round-Tripping Cross-Year Name Match (A5-04)

One list was built across the three fiscal years: the disclosed joint BCFWC/BMC financing counterparties and the zero Item-404 external-counterparty population. Neither BCFWC nor BMC appears as both an external customer and vendor in the filed RPT record; no customer/vendor pair can be price-matched because no external RPT values were disclosed.

| Name | Years as customer | Years as vendor | Both roles? | Sales ≈ purchases (circular)? | Verdict | Source |
|---|---|---|---|---|---|---|
| BCFWC | None in filed RPT record | None in filed RPT record | No | No sales/purchases legs disclosed | Green — group borrower only, not a two-way trade | [FY2024 Form 10-K, Schedule I, Note 4; FY2025 Form 10-K, Schedule I, Note 4] |
| BMC | None in filed RPT record | None in filed RPT record | No | No sales/purchases legs disclosed | Green — group borrower only, not a two-way trade | [FY2024 Form 10-K, Schedule I, Note 4; FY2025 Form 10-K, Schedule I, Note 4] |
| Item-404 external related-person population | None disclosed | None disclosed | No | Not applicable | Amber — current screen clear, but earlier-period itemisation absent | [FY2026 Proxy Statement, Certain Relationships and Related Person Transactions] |

No both-role lead exists in the disclosed RPT data, so there is no circularity evidence and no round-tripping red flag. This is not a clearance of ordinary suppliers, which are outside Item 404 unless a related-person link exists.

## 5. Approval & Disclosure Hygiene (A5-05, A5-06, A5-07, A5-08)

| ID | Test | Raw finding | Band | Verdict | Source |
|---|---|---|---|---|---|
| A5-05 | Arm's-length substantiation | The policy requires information from directors/officers and Audit Committee review/approval, but gives no pricing benchmark or comparable analysis. No external RPT was reported to which a benchmark could be applied. | Policy present, pricing method absent | Amber | [FY2026 Proxy Statement, Certain Relationships and Related Person Transactions] |
| A5-06 | Minority dissent on RPT resolutions | No material RPT resolution or related vote result was identified in the current proxy. | Not Applicable (no relevant resolution disclosed) | Not Applicable | [FY2026 Proxy Statement, Certain Relationships and Related Person Transactions; frozen-pool inventory, 2026-09-29] |
| A5-07 | Pre-approval, only-ID voting, omnibus discipline, slab-slicing | Audit Committee approval is stated. The available disclosure does not state an omnibus-approval term, independent-only voting mechanics, or transaction-by-transaction pre-approval. Same-counterparty transaction total tested: the sole joint BCFWC/BMC note is $453.2m in FY2023/FY2024 and $297.1m in FY2025; it is not split into transactions near an Item 404 threshold. | Control exists but implementation detail limited | Amber | [FY2024 Form 10-K, Schedule I, Note 4; FY2025 Form 10-K, Schedule I, Note 4; FY2026 Proxy Statement, Certain Relationships and Related Person Transactions] |
| A5-08 | Counterparty transparency | No unnamed material related-person category appears in the proxy. The $297.1m joint group note names both borrowers. Earlier Item-404 records are not in the frozen evidence. | Current period named; historical coverage incomplete | Amber | [FY2025 Form 10-K, Schedule I, Note 4; FY2026 Proxy Statement, Certain Relationships and Related Person Transactions] |

Slab-slicing result: no Item-404 transaction slices were disclosed. The only common-counterparty aggregate tested is the joint BCFWC/BMC note: $453.2m, $453.2m and $297.1m at the respective fiscal year-ends. Its one disclosed joint balance is not evidence of threshold slicing; it is not an Item 404 controller transaction. [FY2024 Form 10-K, Schedule I, Note 4; FY2025 Form 10-K, Schedule I, Note 4]

## 6. Related-Party M&A — Including Aborted (A5-09)

| Deal (incl. proposed / withdrawn) | Seller / target link to promoter | Year | Value | Fairness opinion? | Outcome | Verdict | Source |
|---|---|---:|---:|---|---|---|---|
| No controller-linked acquisition or proposed deal identified in the current proxy/10-K evidence | Not established | N/A | N/A | N/A | Current documents do not identify one | Insufficient Data — the frozen pool lacks a historical board-outcome/exchange-announcement series sufficient to prove the absence of aborted attempts | [FY2026 Proxy Statement, Certain Relationships and Related Person Transactions; FY2025 Form 10-K, Item 13 incorporation by reference; frozen-pool inventory, 2026-09-29] |

No RF-CAP-004 is triggered on the admitted evidence. That is not a conclusion that BURL has never considered a controller-linked deal; the needed historic board and exchange-announcement coverage is not in this pool.

## 7. Executive-Counterparty Conflicts (A5-10)

| Person | Entity they own / run | Role vs listco (vendor / customer / lender / fund) | Materiality | Verdict | Source |
|---|---|---|---|---|---|
| Current directors, executive officers and >5% holders | No material counterparty controlled by one was identified in the current Item 404 record or 07's scoped network | None identified | Not assessable beyond the disclosed/scoped record | Amber — no identified conflict, but 07's registry/court/sanctions coverage is limited | [FY2026 Proxy Statement, Certain Relationships and Related Person Transactions; 07_people-integrity-dossiers, Sections 1, 3 and 4] |

## 8. Group-Structure Map (A11-01)

| Metric | Value | Band | Verdict | Source |
|---|---:|---|---|---|
| Layers, listco → deepest entity | Not assessable | Exhibit 21 supplies a legal-entity list, not an ownership tree | Insufficient Data | [FY2025 Form 10-K, Exhibit 21.1] |
| Total group entities (subs + associates + JVs) | 25 named subsidiaries; no associate/JV count separately disclosed in Exhibit 21 | Slightly above the single-segment reference of <20, but far below the >100 Red band | Amber | [FY2025 Form 10-K, Exhibit 21.1] |
| Offshore entities without evident purpose | None named; entities are U.S. state, Delaware, or Puerto Rico entities | 0 disclosed offshore entities | Green on disclosed list | [FY2025 Form 10-K, Exhibit 21.1] |
| Entities that only move money | Not assessable | Holdings and financing entities are named but their ownership chain/purpose is not individually described | Insufficient Data | [FY2025 Form 10-K, Exhibit 21.1; Schedule I, Notes 1 and 4] |

Purpose read: the Parent is a holding company; BCFWC/BMC are the named operating/financing subsidiaries in the Parent's note; the exhibit also names retail, warehouse/realty, distribution, insurance, charity and procurement entities. The last five are entity-name inferences, not a filed ownership chart. The list is modest relative to the >100-entity Red band, but the absence of a hierarchy and separate subsidiary accounts prevents a full Green. [FY2025 Form 10-K, Exhibit 21.1; Schedule I, Notes 1 and 4]

## 9. Cash & Funding Topology (A11-02, A11-03)

**Matched-basis rule (CLAUDE.md §15).** All amounts below use the same January 31, 2026 period-end basis unless labelled as a fiscal-year flow. No maximum daily balance or approved-cap figure is divided by a period-end balance.

| Question | Raw value | Basis (both sides) | Matched ratio | Verdict | Source |
|---|---|---|---|---|---|
| Where does consolidated cash sit (parent vs subs)? | Parent cash $0.290m; consolidated cash $1,232.525m; implied subsidiary aggregate $1,232.235m | Parent-only and consolidated balance sheets, both 2026-01-31 period-end | Parent = 0.024% of consolidated cash; implied subs = 99.976% | Amber — cash legally sits in subsidiaries, but the filing shows $409.0m of FY2025 net contributions to Parent; entity-level cash is not disclosed | [FY2025 Form 10-K, Schedule I—Parent Balance Sheet and Cash Flows; Consolidated Balance Sheets] |
| Share held with a related finance company / treasury vehicle | No such vehicle disclosed | N/A | Not assessable | Not Applicable (no data) | [FY2025 Form 10-K, Exhibit 21.1; Schedule I] |
| Parent borrowing while subs hold the cash? | Parent long-term debt $294.691m against $0.290m parent cash; Parent received $408.971m net subsidiary contributions in FY2025 | Debt/cash are 2026-01-31 period-end; contributions are FY2025 annual flow and are not used as a ratio | 1,016x parent debt/cash at period-end; no mismatched flow/stock ratio is headlined | Amber — legal-parent liquidity depends on subsidiaries, but upstream contributions are disclosed and no opaque cash pocket is identified | [FY2025 Form 10-K, Schedule I—Parent Balance Sheet, Cash Flows and Note 1] |
| ICDs to group entities — amount, rate, tenor | $297.1m joint note receivable from BCFWC/BMC; terms match 2025/2027 convertible notes | 2026-01-31 period-end balance; terms per filed note | N/A | Amber — material intercompany exposure, down from $453.2m | [FY2025 Form 10-K, Schedule I, Note 4] |
| Evergreen / rolled-over ICDs? | $453.2m at 2024-02-03 and 2025-02-01; $297.1m at 2026-01-31 | Three year-end balances | Down 34.4% in FY2025 | Green on observed direction; term extension/rollover detail remains limited | [FY2024 Form 10-K, Schedule I, Note 4; FY2025 Form 10-K, Schedule I, Note 4] |

There is no related financial counterparty, equity interest, regulatory-supervision or approved-cap issue to record. The important limitation is different: the consolidated accounts show total cash, not legal-entity cash by subsidiary, so the location and fungibility of the $1.232bn subsidiary aggregate cannot be fully tested.

## 10. Listed-vs-Private Sibling Leakage (A11-04)

| Promoter private entity | Business overlap with listco | Migration signal (growth / margin / opportunity) | Verdict | Source |
|---|---|---|---|---|
| None identified in 07's scoped related-entity web | None identified | None identified | Green on the scoped network; not a complete registry clearance | [07_people-integrity-dossiers, Sections 2B, 3 and 4] |

`07` treats the 1972/1983/2006/2013 Burlington history as disclosed continuity, not an unexplained predecessor or private sibling. BCF Direct's inactive 2021 merger and the similarly named CIQ investment-holdings record are kept as reconciliation leads, not evidence that a private entity is taking the listed company's growth or margin. [07_people-integrity-dossiers, Sections 0A, 2B, 3B and 4]

## 11. Subsidiary Transparency & Governance (A11-05, A11-06)

| ID | Test | Raw finding | Band | Verdict | Source |
|---|---|---|---|---|---|
| A11-05 | Material subs' financials visible & audited; structure stable | Consolidated financial statements are audited and Exhibit 21 names 25 subsidiaries, but individual material-subsidiary financials and an ownership tree are not provided in the supplied filings. | Visibility above a bare list, below entity-level transparency | Amber | [FY2025 Form 10-K, Auditor Report; Exhibit 21.1] |
| A11-05 | Restructuring churn / associates held below consolidation thresholds | The list supports no quantified churn test; no associate/JV ownership schedule was identified. | Insufficient disclosure for a full test | Insufficient Data | [FY2025 Form 10-K, Exhibit 21.1; Schedule I] |
| A11-06 | Listco ID on every unlisted material sub's board [Reg 24(1)]; secretarial audit | U.S. issuer; India LODR Reg. 24 and secretarial-audit requirement do not apply. | Jurisdictional N/A | Not Applicable | [FY2025 Form 10-K, Cover; FY2026 Proxy Statement, Cover] |
| A11-06 | Special resolution before sub dilution <50% or >20% asset sale [Reg 24(5)-(6)] | U.S. issuer; this India-specific requirement does not apply. No equivalent transaction was identified in the supplied current documents. | Jurisdictional N/A | Not Applicable | [FY2025 Form 10-K, Cover; FY2026 Proxy Statement, Cover] |

## 12. Off-Balance-Sheet Entities with Recourse (A11-07)

| Entity | Sponsor | Consolidated? | Recourse to listco | Guarantees / commitments | % of net worth | Verdict | Source |
|---|---|---|---|---:|---:|---|---|
| No unconsolidated SPE/SPV identified in the supplied annual report | Not established | Not assessable | Not identified | $50.4m letters of credit support ordinary leases, insurance, utilities and merchandising contracts, not a named SPE | N/A — not a group/SPE exposure | Amber — no identified sponsored-SPE recourse, but the report has no explicit VIE/SPE population table | [FY2025 Form 10-K, Note 14—Commitments and Contingencies; Exhibit 21.1] |

## 13. Disclosure Reconciliation (07's web vs the RPT note)

| Registry-derived related entity (from 07) | Transacts with listco? | In the RPT note? | A17-08 class | Obligation named + materiality | If not — why it matters |
|---|---|---|---|---|---|
| Burlington Holdings, Inc. (former name) | N/A — same issuer | N/A | disclosable-and-disclosed | SEC former-name header; no transaction | Former legal name, not a counterparty. |
| BCFWC | Yes, intra-group financing | No Item 404 entry | disclosable-and-disclosed | Named subsidiary in Exhibit 21; $297.1m joint intragroup note, not a related-person transaction | Absence from Item 404 does not create an omission. |
| BMC | Yes, intra-group financing | No Item 404 entry | disclosable-and-disclosed | Named subsidiary in Exhibit 21; $297.1m joint intragroup note, not a related-person transaction | Absence from Item 404 does not create an omission. |
| BCF Direct Corp. | No current transaction established | No | not-disclosable | Inactive after 2021 merger; no material listco transaction found | Historic group continuity lead only. |
| Burlington Coat Factory Investment Holdings, Inc. | Not established | No | obligation-unclear | Singular entity in Exhibit 21; CIQ has an unresolved plural/singular naming conflict; no transaction amount | Registry master-data reconciliation is needed before any omission conclusion. |
| Cohoes Fashions, Inc. | Not established | No | not-disclosable | Group-side relationship-graph node; an ordinary third-party landlord relationship does not make Cohoes a related person | No named RPT obligation or material transaction is established. |

The reconciliation produces zero `disclosable-and-omitted` entities. RF-PPL-005, RF-NET-004 and RF-NET-005 therefore do not fire. The plural/singular investment-holdings conflict remains an `obligation-unclear` follow-up, not an allegation. [07_people-integrity-dossiers, Sections 2B, 3, 4 and entity_network.json; FY2025 Form 10-K, Exhibit 21.1; relationships.json, scope notes]

## 14. Read

No currently reportable value transfer to a promoter, executive, director, or >5% holder was disclosed: the FY2025 Item 404 category is $0, or 0.0% of reported revenue and PAT. The largest named group channel is the $297.1m BCFWC/BMC joint intercompany note, down from $453.2m, with terms matching the Parent's convertible notes; it is a material internal funding flow, not proven minority leakage. The structure has 25 named subsidiaries and almost all reported cash sits below the Parent, but disclosed $409.0m FY2025 upstream contributions argue against a demonstrated trapped-cash loop; no entity-level cash map or ownership tree is supplied. The single highest-value disclosure would be a legal-entity chart with cash, debt, guarantees, and intercompany balances by material subsidiary, plus prior-year Item 404 transaction schedules.

## Sweep Log

No external counterparty-registry lookup was run in this task. The only named financing counterparties are wholly owned BURL subsidiaries; their relationship and filed balances are established by the 10-K. Entity registry, predecessor, court and enforcement coverage is owned by `07`/`12`; this report makes no "checked, nothing found" claim beyond their stated scope.

| Database | Query | Date | Results | Attributed? (identifier used) | Coverage note |
|---|---|---|---:|---|---|
| Not run | BCFWC/BMC borrower-health registry lookup | 2026-09-29 | N/A | N/A | Consolidated wholly owned borrowers; no external counterparty health assertion made. |
| relationships.json — CIQ Suppliers export | BURL group anchors and recently disclosed relationships | frozen 2026-09-29 | 33 relationships | Source rows and group anchors | Tier 5 vendor export; recently disclosed suppliers only, not a complete supplier base or ownership registry. |

## Universal Findings Table

| Finding ID | Section | Question / Test | Standardized Verdict | Raw Value | Unit | Current Period | Prior Period | Trend | Peer Benchmark | Peer Verdict | Score | Max Score | Penalty | Confidence 1–5 | Materiality | Evidence | As-of Date | Analyst Interpretation | Red Flag Triggered? | Red Flag ID | Follow-up Required |
|---|---|---|---|---:|---|---|---|---|---|---|---:|---:|---:|---:|---|---|---|---|---|---|---|
| A5-01 | RPT | A5-01 — RPT intensity | Amber | 0 | USDm Item-404 reportable | FY2025 | FY2024 | Prior proxy unavailable | No peer set | N/A | 3 | 20 | 17 | 4 | High | [FY2026 Proxy, Certain Relationships; FY2025 10-K, income/balance sheets] | 2026-04-02 | $0 reported category is clear; all RPTs not quantified. | No |  | Obtain FY2023–FY2024 proxies/RPT schedules. |
| A5-02 | RPT | A5-02 — royalty / brand fees | Green | 0 | disclosed external fee | FY2025 | FY2024 | N/A | No peer set | N/A | 0 | 5 | 5 | 3 | Medium | [FY2025 10-K, Trademarks; 07, A17-04] | 2026-03-19 | Core marks are within group; no adverse licence read. | No |  | Confirm any intercompany IP fee in subsidiary accounts. |
| A5-03 | RPT | A5-03 — loans / ICDs / guarantees to group | Amber | 297.1 | USDm joint note | FY2025 | FY2024 | Down 34.4% | No peer set | N/A | 5 | 8 | 3 | 4 | High | [FY2025 10-K, Schedule I Note 4] | 2026-03-19 | Material disclosed group loan, not promoter exposure. | No |  | Obtain borrower-level cash flow and maturity schedule. |
| A5-04 | RPT | A5-04 — promoter vendor/customer and round-trip | Amber | 0 | disclosed controller flows | FY2025 | FY2024 | Prior data unavailable | No peer set | N/A | 1 | 7 | 6 | 3 | High | [FY2026 Proxy, Certain Relationships; relationships.json scope notes] | 2026-04-02 | No identified flow; ordinary supplier values are incomplete. | No |  | Match future supplier/customer data to insider entities. |
| A5-05 | RPT | A5-05 — arm's-length substantiation | Amber | 1 | policy | FY2025 | FY2024 | N/A | No peer set | N/A | 3 | 4 | 1 | 3 | Medium | [FY2026 Proxy, Certain Relationships] | 2026-04-02 | Audit Committee policy is disclosed; method is not. | No |  | Request benchmark/approval minutes if RPT arises. |
| A5-06 | RPT | A5-06 — minority dissent on RPT votes | Not Applicable | 0 | relevant resolutions | FY2025 | FY2024 | N/A | No peer set | N/A | 0 | 3 | 3 | 3 | Medium | [FY2026 Proxy, Certain Relationships] | 2026-04-02 | No RPT resolution identified. | No |  | Review vote result if a material RPT is proposed. |
| A5-07 | RPT | A5-07 — approval hygiene / slab slicing | Amber | 1 | disclosed approval control | FY2025 | FY2024 | Detail incomplete | No peer set | N/A | 2 | 4 | 2 | 3 | High | [FY2026 Proxy, Certain Relationships; FY2025 10-K, Schedule I Note 4] | 2026-04-02 | No slicing evidence; omnibus/ID-only terms undisclosed. | No |  | Obtain policy and Audit Committee charter detail. |
| A5-08 | RPT | A5-08 — counterparty transparency | Amber | 2 | named joint borrowers | FY2025 | FY2024 | Prior data unavailable | No peer set | N/A | 2 | 4 | 2 | 3 | High | [FY2025 10-K, Schedule I Note 4; FY2026 Proxy] | 2026-04-02 | Current items named; historic RPT disclosure missing. | No |  | Obtain earlier Item 404 schedules. |
| A5-09 | RPT | A5-09 — related-party M&A | Insufficient Data | 0 | identified deals | current supplied record | historical | Coverage limited | No peer set | N/A | 3 | 5 | 2 | 2 | High | [FY2025 10-K, Item 13; frozen-pool inventory] | 2026-09-29 | No current deal identified; aborted-deal history unproven. | No |  | Search full 8-K/board/postal-ballot history. |
| A5-10 | RPT | A5-10 — executive-counterparty conflicts | Amber | 0 | identified conflicts | FY2025 | FY2024 | Coverage limited | No peer set | N/A | 1 | 5 | 4 | 3 | High | [FY2026 Proxy; 07 Sections 1, 3, 4] | 2026-09-29 | None identified, not a complete registry clearance. | No |  | Refresh identifier-linked entity screen. |
| A11-01 | Group | A11-01 — structure depth and count | Amber | 25 | named subsidiaries | FY2025 | FY2024 | Depth unavailable | No peer set | N/A | 3 | 5 | 2 | 4 | Medium | [FY2025 10-K, Exhibit 21.1] | 2026-03-19 | Count modest but slightly above simple-business reference; no hierarchy. | No |  | Obtain legal entity ownership chart. |
| A11-02 | Group | A11-02 — trapped / round-tripped cash | Amber | 99.976 | % implied subsidiary cash | FY2025 | FY2024 | N/A | No peer set | N/A | 2 | 3 | 1 | 4 | High | [FY2025 10-K, Schedule I and Consolidated Balance Sheets] | 2026-03-19 | Cash sits below Parent, yet upstream contribution is disclosed. | No |  | Obtain cash/restriction schedule by entity. |
| A11-03 | Group | A11-03 — inter-corporate loans/deposits | Amber | 297.1 | USDm | FY2025 | FY2024 | Down 34.4% | No peer set | N/A | 2 | 3 | 1 | 4 | High | [FY2025 10-K, Schedule I Note 4] | 2026-03-19 | Material, transparent, and declining; no evergreen evidence. | No |  | Confirm tenor/repayment after 2026-01-31. |
| A11-04 | Group | A11-04 — private sibling leakage | Green | 0 | identified overlapping private entities | FY2025 | FY2024 | N/A | No peer set | N/A | 0 | 5 | 5 | 3 | High | [07 Sections 2B–4] | 2026-09-29 | No private competing sibling identified in scoped web. | No |  | Complete registry reconciliation of investment-holdings names. |
| A11-05 | Group | A11-05 — subsidiary transparency / churn | Amber | 25 | named subsidiaries | FY2025 | FY2024 | Individual accounts unavailable | No peer set | N/A | 1 | 2 | 1 | 4 | Medium | [FY2025 10-K, Auditor Report and Exhibit 21.1] | 2026-03-19 | Audit/consolidation visible; entity-level disclosure limited. | No |  | Obtain material-subsidiary accounts and ownership tree. |
| A11-06 | Group | A11-06 — unlisted material-sub governance | Not Applicable | 0 | India LODR tests | FY2025 | FY2024 | N/A | No peer set | N/A | 0 | 2 | 2 | 5 | Low | [FY2025 10-K, Cover] | 2026-03-19 | India-specific requirement does not apply to U.S. issuer. | No |  | Apply U.S.-relevant subsidiary controls if transaction occurs. |
| A11-07 | Group | A11-07 — off-balance-sheet entities with recourse | Amber | 0 | identified sponsored SPEs | FY2025 | FY2024 | N/A | No peer set | N/A | 4 | 8 | 4 | 3 | High | [FY2025 10-K, Note 14 and Exhibit 21.1] | 2026-03-19 | No identified SPE, but no explicit VIE population table. | No |  | Request VIE/SPE and guarantee schedule. |

## RPT & Leakage Risk Score (INVERTED — higher = WORSE)

| Component (risk contribution) | Score | Max Score | Evidence |
|---|---:|---:|---|
| RPT intensity vs thresholds (A5-01) | 3 | 20 | $0 Item-404 reported category, but prior-year and full non-reportable aggregate are unavailable. [FY2026 Proxy, Certain Relationships] |
| Promoter-linked channels — royalty, vendor-customer, loans/ICDs/guarantees (A5-02/03/04) | 6 | 20 | $297.1m disclosed intra-group note; no promoter counterparty or external brand fee identified. [FY2025 10-K, Schedule I Note 4; 07 A17-04] |
| Approval & disclosure hygiene (A5-05/06/07/08) | 7 | 15 | Policy and Audit Committee approval disclosed; pricing/omnibus/historic detail incomplete. [FY2026 Proxy, Certain Relationships] |
| Group-structure opacity — layers, entity count, offshore, trapped cash, sub transparency (A11-01/02/03/05/06) | 8 | 15 | 25 listed subsidiaries, no ownership/cash tree; upstream contributions and U.S.-only list mitigate. [FY2025 10-K, Exhibit 21.1; Schedule I] |
| Listed-vs-private sibling leakage & executive-counterparty conflicts (A11-04, A5-10, A5-09) | 4 | 15 | No identified private sibling or conflict; historic M&A and registry coverage incomplete. [07 Sections 2B–4; FY2026 Proxy] |
| Undisclosed counterparties & off-balance-sheet recourse (A11-07, reconciliation vs 07) | 7 | 15 | Zero omitted entities; investment-holdings name conflict and no explicit SPE/VIE table remain. [07 Section 4; FY2025 10-K, Exhibit 21.1] |
| **Total** | **35** | **100** | **Low-to-moderate evidenced risk; no material promoter leakage proven, with disclosure-coverage gaps retained.** |

## Source Log

| Source ID | Source Type | Filename / Filing | Period | Page / Section | Date | Confidence 1–5 | Used For |
|---|---|---|---|---|---|---:|---|
| S01 | Tier 1 proxy | BURL 2026 Proxy Statement | FY2025 through proxy date | Certain Relationships and Related Person Transactions | 2026-04-02 | 5 | Item 404 definition, policy, zero reportable category |
| S02 | Tier 1 annual filing | BURL FY2025 Form 10-K | FY2025 ended 2026-01-31 | Schedule I Notes 1/4; Consolidated Balance Sheets; Note 14; Exhibit 21.1 | 2026-03-19 | 5 | Group loan, Parent/sub cash, commitments, subsidiary list |
| S03 | Tier 1 annual filing | BURL FY2024 Form 10-K | FY2024 ended 2025-02-01 | Schedule I Note 4; Consolidated Balance Sheets | 2025-03-17 | 5 | Prior intercompany note and denominators |
| S04 | Internal module output, filing-based | earnings/01_historical-financials.md | FY2022–FY2025 | Annual Financial Table | 2026-09-29 | 4 | Revenue/PAT/asset denominator reconciliation |
| S05 | Internal module output | 07_people-integrity-dossiers.md | current research run | Sections 0A, 2B, 3, 3B, 4, entity_network.json | 2026-09-29 | 3 | Network, brand, lineage and disclosure reconciliation |
| S06 | Tier 5 vendor export | relationships.json from CIQ Suppliers export | recently disclosed relationships | scope notes; source rows 6–38 | frozen 2026-09-29 | 3 | Group-anchor check; no supplier-base extrapolation |
| S07 | Frozen evidence inventory | manifest.json | current frozen generation | document inventory | 2026-09-29 | 5 | Scope limitation: prior proxies/board-announcement series absent |

## Machine-Readable Findings

```json
[
  {"finding_id":"A5-01","ticker":"BURL","date":"2026-09-29","agent":"related-party-and-group-forensics","section":"RPT","question":"A5-01 — RPT intensity","standardized_verdict":"Amber","raw_value":0,"unit":"USDm Item-404 reportable","current_period":"FY2025","prior_period":"FY2024 unavailable","trend":"current screen clear","peer_benchmark":"No peer set","peer_verdict":"Not Applicable","score":3,"max_score":20,"penalty":17,"confidence_1_to_5":4,"materiality":"High","evidence":"[FY2026 Proxy, Certain Relationships; FY2025 10-K, income/balance sheets]","source_id":"S01","source_type":"Tier 1 proxy","source_date":"2026-04-02","as_of_date":"2026-09-29","analyst_interpretation":"$0 reported Item-404 category; full non-reportable aggregate not quantified.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":"Obtain FY2023–FY2024 proxies/RPT schedules."},
  {"finding_id":"A5-02","ticker":"BURL","date":"2026-09-29","agent":"related-party-and-group-forensics","section":"RPT","question":"A5-02 — royalty / brand fees","standardized_verdict":"Green","raw_value":0,"unit":"disclosed external fee","current_period":"FY2025","prior_period":"","trend":"N/A","peer_benchmark":"No peer set","peer_verdict":"Not Applicable","score":0,"max_score":5,"penalty":5,"confidence_1_to_5":3,"materiality":"Medium","evidence":"[FY2025 10-K, Trademarks; 07 A17-04]","source_id":"S02","source_type":"Tier 1 annual filing","source_date":"2026-03-19","as_of_date":"2026-09-29","analyst_interpretation":"Core marks are within the group; no adverse licence identified.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":"Confirm any intercompany IP fee."},
  {"finding_id":"A5-03","ticker":"BURL","date":"2026-09-29","agent":"related-party-and-group-forensics","section":"RPT","question":"A5-03 — loans / ICDs / guarantees to group","standardized_verdict":"Amber","raw_value":297.1,"unit":"USDm joint note","current_period":"FY2025","prior_period":"FY2024 453.2","trend":"down 34.4%","peer_benchmark":"No peer set","peer_verdict":"Not Applicable","score":5,"max_score":8,"penalty":3,"confidence_1_to_5":4,"materiality":"High","evidence":"[FY2025 10-K, Schedule I Note 4]","source_id":"S02","source_type":"Tier 1 annual filing","source_date":"2026-03-19","as_of_date":"2026-09-29","analyst_interpretation":"Material disclosed group note, not promoter exposure.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":"Obtain borrower cash-flow/maturity schedule."},
  {"finding_id":"A5-04","ticker":"BURL","date":"2026-09-29","agent":"related-party-and-group-forensics","section":"RPT","question":"A5-04 — promoter vendor/customer and round-trip","standardized_verdict":"Amber","raw_value":0,"unit":"identified controller flows","current_period":"FY2025","prior_period":"","trend":"current screen clear","peer_benchmark":"No peer set","peer_verdict":"Not Applicable","score":1,"max_score":7,"penalty":6,"confidence_1_to_5":3,"materiality":"High","evidence":"[FY2026 Proxy; relationships.json scope notes]","source_id":"S01","source_type":"Tier 1 proxy","source_date":"2026-04-02","as_of_date":"2026-09-29","analyst_interpretation":"No identified flow; supplier values incomplete.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":"Match future supplier/customer data to insiders."},
  {"finding_id":"A5-05","ticker":"BURL","date":"2026-09-29","agent":"related-party-and-group-forensics","section":"RPT","question":"A5-05 — arm's-length substantiation","standardized_verdict":"Amber","raw_value":1,"unit":"policy","current_period":"FY2025","prior_period":"","trend":"N/A","peer_benchmark":"No peer set","peer_verdict":"Not Applicable","score":3,"max_score":4,"penalty":1,"confidence_1_to_5":3,"materiality":"Medium","evidence":"[FY2026 Proxy, Certain Relationships]","source_id":"S01","source_type":"Tier 1 proxy","source_date":"2026-04-02","as_of_date":"2026-09-29","analyst_interpretation":"Approval policy disclosed, pricing method absent.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":"Request pricing benchmarks if RPT occurs."},
  {"finding_id":"A5-06","ticker":"BURL","date":"2026-09-29","agent":"related-party-and-group-forensics","section":"RPT","question":"A5-06 — minority dissent on RPT votes","standardized_verdict":"Not Applicable","raw_value":0,"unit":"relevant resolutions","current_period":"FY2025","prior_period":"","trend":"N/A","peer_benchmark":"No peer set","peer_verdict":"Not Applicable","score":0,"max_score":3,"penalty":3,"confidence_1_to_5":3,"materiality":"Medium","evidence":"[FY2026 Proxy, Certain Relationships]","source_id":"S01","source_type":"Tier 1 proxy","source_date":"2026-04-02","as_of_date":"2026-09-29","analyst_interpretation":"No RPT resolution identified.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":"Review vote result if proposed."},
  {"finding_id":"A5-07","ticker":"BURL","date":"2026-09-29","agent":"related-party-and-group-forensics","section":"RPT","question":"A5-07 — approval hygiene / slab slicing","standardized_verdict":"Amber","raw_value":1,"unit":"disclosed approval control","current_period":"FY2025","prior_period":"FY2024","trend":"detail incomplete","peer_benchmark":"No peer set","peer_verdict":"Not Applicable","score":2,"max_score":4,"penalty":2,"confidence_1_to_5":3,"materiality":"High","evidence":"[FY2026 Proxy; FY2025 10-K Schedule I Note 4]","source_id":"S01","source_type":"Tier 1 proxy","source_date":"2026-04-02","as_of_date":"2026-09-29","analyst_interpretation":"No slicing evidence; omnibus and ID-only detail absent.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":"Obtain policy details."},
  {"finding_id":"A5-08","ticker":"BURL","date":"2026-09-29","agent":"related-party-and-group-forensics","section":"RPT","question":"A5-08 — counterparty transparency","standardized_verdict":"Amber","raw_value":2,"unit":"named joint borrowers","current_period":"FY2025","prior_period":"","trend":"prior data unavailable","peer_benchmark":"No peer set","peer_verdict":"Not Applicable","score":2,"max_score":4,"penalty":2,"confidence_1_to_5":3,"materiality":"High","evidence":"[FY2025 10-K Schedule I Note 4; FY2026 Proxy]","source_id":"S02","source_type":"Tier 1 annual filing","source_date":"2026-03-19","as_of_date":"2026-09-29","analyst_interpretation":"Current items named; historic coverage absent.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":"Obtain earlier Item 404 schedules."},
  {"finding_id":"A5-09","ticker":"BURL","date":"2026-09-29","agent":"related-party-and-group-forensics","section":"RPT","question":"A5-09 — related-party M&A","standardized_verdict":"Insufficient Data","raw_value":0,"unit":"identified deals","current_period":"current supplied record","prior_period":"historical","trend":"coverage limited","peer_benchmark":"No peer set","peer_verdict":"Not Applicable","score":3,"max_score":5,"penalty":2,"confidence_1_to_5":2,"materiality":"High","evidence":"[FY2025 10-K Item 13; frozen-pool inventory]","source_id":"S07","source_type":"Frozen evidence inventory","source_date":"2026-09-29","as_of_date":"2026-09-29","analyst_interpretation":"No current deal identified; aborted-deal history unproven.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":"Search historic 8-K/board/postal-ballot history."},
  {"finding_id":"A5-10","ticker":"BURL","date":"2026-09-29","agent":"related-party-and-group-forensics","section":"RPT","question":"A5-10 — executive-counterparty conflicts","standardized_verdict":"Amber","raw_value":0,"unit":"identified conflicts","current_period":"FY2025","prior_period":"","trend":"coverage limited","peer_benchmark":"No peer set","peer_verdict":"Not Applicable","score":1,"max_score":5,"penalty":4,"confidence_1_to_5":3,"materiality":"High","evidence":"[FY2026 Proxy; 07 Sections 1, 3, 4]","source_id":"S05","source_type":"Internal network report","source_date":"2026-09-29","as_of_date":"2026-09-29","analyst_interpretation":"None identified, not a registry clearance.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":"Refresh identifier-linked entity screen."},
  {"finding_id":"A11-01","ticker":"BURL","date":"2026-09-29","agent":"related-party-and-group-forensics","section":"Group","question":"A11-01 — structure depth and count","standardized_verdict":"Amber","raw_value":25,"unit":"named subsidiaries","current_period":"FY2025","prior_period":"","trend":"depth unavailable","peer_benchmark":"No peer set","peer_verdict":"Not Applicable","score":3,"max_score":5,"penalty":2,"confidence_1_to_5":4,"materiality":"Medium","evidence":"[FY2025 10-K, Exhibit 21.1]","source_id":"S02","source_type":"Tier 1 annual filing","source_date":"2026-03-19","as_of_date":"2026-09-29","analyst_interpretation":"Count modest but no ownership tree.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":"Obtain legal-entity chart."},
  {"finding_id":"A11-02","ticker":"BURL","date":"2026-09-29","agent":"related-party-and-group-forensics","section":"Group","question":"A11-02 — trapped / round-tripped cash","standardized_verdict":"Amber","raw_value":99.976,"unit":"percent implied subsidiary cash","current_period":"FY2025","prior_period":"","trend":"N/A","peer_benchmark":"No peer set","peer_verdict":"Not Applicable","score":2,"max_score":3,"penalty":1,"confidence_1_to_5":4,"materiality":"High","evidence":"[FY2025 10-K, Schedule I and Consolidated Balance Sheets]","source_id":"S02","source_type":"Tier 1 annual filing","source_date":"2026-03-19","as_of_date":"2026-09-29","analyst_interpretation":"Cash below Parent, but upstream contribution disclosed.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":"Obtain cash/restriction schedule by entity."},
  {"finding_id":"A11-03","ticker":"BURL","date":"2026-09-29","agent":"related-party-and-group-forensics","section":"Group","question":"A11-03 — inter-corporate loans/deposits","standardized_verdict":"Amber","raw_value":297.1,"unit":"USDm","current_period":"FY2025","prior_period":"FY2024 453.2","trend":"down 34.4%","peer_benchmark":"No peer set","peer_verdict":"Not Applicable","score":2,"max_score":3,"penalty":1,"confidence_1_to_5":4,"materiality":"High","evidence":"[FY2025 10-K, Schedule I Note 4]","source_id":"S02","source_type":"Tier 1 annual filing","source_date":"2026-03-19","as_of_date":"2026-09-29","analyst_interpretation":"Material, transparent, declining, no evergreen proof.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":"Confirm tenor after period end."},
  {"finding_id":"A11-04","ticker":"BURL","date":"2026-09-29","agent":"related-party-and-group-forensics","section":"Group","question":"A11-04 — private sibling leakage","standardized_verdict":"Green","raw_value":0,"unit":"identified overlapping private entities","current_period":"FY2025","prior_period":"","trend":"N/A","peer_benchmark":"No peer set","peer_verdict":"Not Applicable","score":0,"max_score":5,"penalty":5,"confidence_1_to_5":3,"materiality":"High","evidence":"[07 Sections 2B–4]","source_id":"S05","source_type":"Internal network report","source_date":"2026-09-29","as_of_date":"2026-09-29","analyst_interpretation":"None identified in scoped web.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":"Resolve investment-holdings name conflict."},
  {"finding_id":"A11-05","ticker":"BURL","date":"2026-09-29","agent":"related-party-and-group-forensics","section":"Group","question":"A11-05 — subsidiary transparency / churn","standardized_verdict":"Amber","raw_value":25,"unit":"named subsidiaries","current_period":"FY2025","prior_period":"","trend":"individual accounts unavailable","peer_benchmark":"No peer set","peer_verdict":"Not Applicable","score":1,"max_score":2,"penalty":1,"confidence_1_to_5":4,"materiality":"Medium","evidence":"[FY2025 10-K, Auditor Report and Exhibit 21.1]","source_id":"S02","source_type":"Tier 1 annual filing","source_date":"2026-03-19","as_of_date":"2026-09-29","analyst_interpretation":"Audit/consolidation visible; entity detail limited.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":"Obtain material-sub accounts."},
  {"finding_id":"A11-06","ticker":"BURL","date":"2026-09-29","agent":"related-party-and-group-forensics","section":"Group","question":"A11-06 — unlisted material-subsidiary governance","standardized_verdict":"Not Applicable","raw_value":0,"unit":"India LODR tests","current_period":"FY2025","prior_period":"","trend":"N/A","peer_benchmark":"No peer set","peer_verdict":"Not Applicable","score":0,"max_score":2,"penalty":2,"confidence_1_to_5":5,"materiality":"Low","evidence":"[FY2025 10-K, Cover]","source_id":"S02","source_type":"Tier 1 annual filing","source_date":"2026-03-19","as_of_date":"2026-09-29","analyst_interpretation":"India-specific requirement does not apply.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":"Apply relevant U.S. controls if needed."},
  {"finding_id":"A11-07","ticker":"BURL","date":"2026-09-29","agent":"related-party-and-group-forensics","section":"Group","question":"A11-07 — off-balance-sheet entities with recourse","standardized_verdict":"Amber","raw_value":0,"unit":"identified sponsored SPEs","current_period":"FY2025","prior_period":"","trend":"N/A","peer_benchmark":"No peer set","peer_verdict":"Not Applicable","score":4,"max_score":8,"penalty":4,"confidence_1_to_5":3,"materiality":"High","evidence":"[FY2025 10-K, Note 14 and Exhibit 21.1]","source_id":"S02","source_type":"Tier 1 annual filing","source_date":"2026-03-19","as_of_date":"2026-09-29","analyst_interpretation":"No identified SPE; explicit VIE population table absent.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":"Request VIE/SPE and guarantee schedule."}
]
```

### rpt_counterparty_ledger.json

```json
[
  {
    "name":"Burlington Coat Factory Warehouse Corporation",
    "relationship":"wholly owned subsidiary and joint/several borrower with BMC",
    "roles":["intercompany borrower"],
    "years_seen":["FY2023","FY2024","FY2025"],
    "latest_fy_value":"USD 297.1m joint amount; not allocable between BCFWC and BMC",
    "pct_of_revenue":"not applicable — eliminated intra-group balance",
    "arms_length_basis_disclosed":"terms and interest rate consistent with Parent's 2025/2027 convertible notes",
    "in_rpt_note":false,
    "in_07_registry_web":true,
    "red_flag_ids":[]
  },
  {
    "name":"Burlington Merchandising Corporation",
    "relationship":"wholly owned subsidiary and joint/several borrower with BCFWC",
    "roles":["intercompany borrower"],
    "years_seen":["FY2023","FY2024","FY2025"],
    "latest_fy_value":"USD 297.1m joint amount; not allocable between BMC and BCFWC",
    "pct_of_revenue":"not applicable — eliminated intra-group balance",
    "arms_length_basis_disclosed":"terms and interest rate consistent with Parent's 2025/2027 convertible notes",
    "in_rpt_note":false,
    "in_07_registry_web":true,
    "red_flag_ids":[]
  }
]
```

## Hard Self-Check

- [x] All 17 owned checklist items (A5-01…A5-10; A11-01…A11-07) are in the Universal Findings Table.
- [x] Cross-year counterparty roles were matched; no vendor/customer both-role lead appears in the disclosed RPT population.
- [x] The BCFWC/BMC same-counterparty balance was tested as a joint annual total, not divided into threshold-sized slices.
- [x] U.S. Item 404(a) $120k regime is named; Indian LODR bands were not misapplied.
- [x] No bare arm's-length assertion was treated as a benchmark.
- [x] Related-party M&A/aborted-deal coverage is marked Insufficient Data, not cleared by absence.
- [x] The >25% hard lock is expressly deferred to `business-model/01_disqualifier-scan`.
- [x] Group guarantees are cross-referenced to 10/A7a-06 and not double counted.
- [x] Every `07` entity is classified under the four-class reconciliation; zero omitted-class flags were created.
- [x] Cash/debt comparisons name their period-end versus flow bases; no mismatched ratio is used as a monitoring threshold.
- [x] The risk score is explicitly inverted; missing coverage is not scored as zero risk.
- [x] No red-flag ID is applied because no listed trigger is evidenced; every Amber/Insufficient Data row has a follow-up.
