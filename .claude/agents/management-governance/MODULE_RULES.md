# Management-Governance Module — Operating Rules

This file defines the operating rules specific to the **management-governance module** of the equity research system.

The repo root `CLAUDE.md` contains cross-cutting rules — git policy, global investing standards — that apply to all modules.

Every subagent in this module reads BOTH the repo root `CLAUDE.md` AND this `MODULE_RULES.md` first, then runs its own task.

---

## Scope

This module answers one question:

> "Are the people running this company competent stewards of shareholder capital, and are their incentives and governance aligned with minority shareholders?"

It is the deep-dive behind the single `business-model/11_capital-allocation-governance` quick-read, and it works through THREE lenses that together produce one governance read:

1. **Stewardship judgment** (agents 01–06): management quality and track record, the capital-allocation scorecard, incentive/compensation alignment, ownership and insider behavior, board quality and shareholder rights, and disclosure candor.
2. **The Governance Checklist** (all specialists, assembled by `99`): the canonical item-by-item audit defined in the Governance Checklist Registry below — every item answered Green / Amber / Red / Not Applicable with evidence, banded thresholds, and a per-item confidence, the way a forensic governance auditor would work through a company. No item is skipped; an unanswerable item is recorded as Not Available with the reason, and coverage is counted.
3. **Person- and network-level integrity** (agent 07, consumed by 05, 09, 12 and the synthesis), in two steps that must run in this order:
   - **Discovery first** — the Entity & Network Discovery Protocol below works out who and what is actually in scope: past as well as current directorships, the company's own self-disclosed lineage and former names, the owners of the brands it trades under, corroborated registered-address clusters, and the **founders of every linked entity**, walked recursively to hop 2. The filings list who the company chose to list; the loop finds the rest.
   - **Then the sweep** — a forensic dossier on EVERY named individual AND every surfaced entity, built from filings PLUS the public legal/regulatory databases in `frameworks/GOVERNANCE_DATABASES.md` (corporate registries, court and tribunal records, regulator enforcement lists, insolvency registers, disqualification registers, sanctions lists, dated adverse media), with hop-banded exposure floors for cross-linkage.

   People commit frauds; companies are the instrument — and usually more than one company. The engine checks the people, and the network they sit in.

This module DOES:
- judge management's track record — have they delivered on what they promised?
- score the historical capital-allocation record (M&A, buybacks, dividends, reinvestment, debt)
- assess whether incentives/compensation reward per-share value or empire-building
- map ownership, insider buying/selling, and control structure
- assess board independence, shareholder rights, and minority-shareholder protection
- judge disclosure candor — do they tell the truth in good times and bad?
- run the full Governance Checklist Registry (board, committees, ownership, auditor, related parties, remuneration, contingent liabilities, forensic accounting, regulatory/legal, minority treatment, group structure, human capital)
- run the entity-discovery loop (brand lineage, former names, trademark ownership, address clusters, past directorships, founder trails) and then build an integrity dossier on every person AND every surfaced entity, swept against public legal and regulatory databases
- audit audit itself — auditor calibre, rotation, fees, resignations, subsidiary auditors, internal/secretarial audit, restatements
- reconcile what the court/regulator databases show against what the filings disclose (an undisclosed material case is itself a finding)

This module does NOT:
- value the company or produce a fair value / price target — the **valuation module** owns that
- assign scenario probabilities, compute risk/reward, size positions, or issue a Buy/Sell rating — the **master synthesizer** owns that
- re-adjudicate the hard disqualifiers — those live in `business-model/01_disqualifier-scan` (audit qualification, going concern, promoter pledging >50%, related-party >25%, repeated auditor changes, material restatements, regulatory enforcement). This module references them and goes deeper on the spectrum.

**Relationship to `business-model/11_capital-allocation-governance` (read this twice).** That agent is a single quick-read inside the business-model module. THIS module is the dedicated deep-dive and **supersedes** it where they overlap. The synthesis tells the master synthesizer to treat this module's governance verdict and scores as the primary governance read.

**Boundary with the master synthesizer.** This module produces the stewardship read — scores, a verdict, and red flags at stated severity. The master synthesizer folds that into its verdict and risk register. Produce the read; stop there. No valuation, no probabilities, no rating, no sizing.

---

## Core Principles

1. **Judge actions, not words.** A mission statement is not evidence. Capital deployed, shares bought at what price, insiders buying or selling, promises kept or missed — those are evidence.
2. **Follow the incentives.** People do what they are paid to do. If comp pays on revenue or EPS growth, expect acquisitions and buybacks regardless of returns. State what the metrics actually reward.
3. **Per-share, always.** Growth that dilutes per-share value is value destruction dressed as ambition. Judge capital allocation on per-share outcomes, not absolute size.
4. **Alignment over charisma.** Skin in the game (meaningful ownership, bought not just granted) beats a good narrative.
5. **Candor in bad times is the tell.** Anyone is candid when results are good. Did they own the misses, or bury them in adjusted numbers and "headwinds"?
6. **Be blunt and conservative.** When evidence is thin, say "Not proven from available data" — do not give the benefit of the doubt.

---

## Source Hierarchy (most → least trusted)

1. Proxy statement / DEF 14A (compensation, ownership, board, related-party) and annual filings
2. Quarterly filings (10-Q, 6-K) and 8-K (management changes, departures)
3. Shareholder letters and the CEO's own prior-year statements (to check promises vs delivery)
4. Capital IQ / Bloomberg — ownership, insider transactions, compensation benchmarking
5. Earnings transcripts (tone, candor, ownership of misses)
6. User notes
7. Web sources — only for inputs not in the pool (executive background, board affiliations, insider-transaction filings, comp benchmarks). Label web-sourced numbers, with the date, as unverified.
8. Your own inference — must be labeled *"Inference, not from filings."*

When the shareholder letter is upbeat and the proxy shows misaligned pay, trust the proxy.

---

## Jurisdiction-Aware Source Mapping (Hard Rule)

This map implements CLAUDE.md §27 (Jurisdiction & Reporting-Regime Awareness) for the management-governance module.

US filing names (DEF 14A, 10-K, 10-Q, 8-K, Form 4) are EXAMPLES, not requirements. Detect the listing jurisdiction (triage `00`) and use the local equivalents. Do NOT mark a non-US company's governance data "missing" because a US form is absent when the local equivalent exists.

- **US / SEC:** DEF 14A, 10-K, 10-Q, 8-K, Form 4, Schedule 13D/13G, S-1/S-3/S-4/S-8, shareholder letter.
- **India / SEBI-LODR:** Annual Report, Corporate Governance Report, Board's Report, MD&A, Auditor Report, Secretarial Audit Report, Notes to Accounts, RPT disclosures, AGM notice, AGM voting / scrutinizer results, shareholding-pattern filings, promoter pledge/encumbrance disclosures, NSE/BSE announcements, SEBI orders, MCA filings, BRSR, investor presentations, earnings-call transcripts, credit-rating reports, postal-ballot notices, scheme documents, SEBI PIT/SAST disclosures, LODR compliance disclosures.
- **Other jurisdictions:** the local annual report, corporate-governance statement, remuneration report, voting results, exchange announcements, ownership disclosures, and regulator enforcement releases.

For Indian companies the proxy-equivalent is the AGM Notice + Corporate Governance Report; ownership is the shareholding-pattern filing; compensation is the Board's Report / CG Report.

## Language is not opacity (CLAUDE.md §27)

A related-party, compensation, covenant, ownership, or contingency note written in the company's home language is DISCLOSED, not opaque. Read and translate it, then judge the actual content; take every figure verbatim (§5/§15). Do NOT raise a red flag for "note only in Arabic / not in English", do NOT describe a foreign-language disclosure as "opaque" or "unverifiable", and do NOT cap the disclosure-quality / shareholder-friendliness / governance score for language — **a non-English filing is not a data gap.** Opacity means a fact is genuinely undisclosed or unobtainable, never a fact disclosed in another language. Flag only genuine translation ambiguity on a specific material term, and apply the conservative default (§4) to THAT residual uncertainty alone.

---

## Sector-Specific Governance Overlays (Hard Rule)

Triage `00` identifies the sector and tells later agents which overlay applies. The CFO/PAT and working-capital lenses do NOT apply to financials — use the overlay instead.

- **Banks / NBFCs / insurers:** GNPA/NNPA, provision coverage, restructured book, write-offs, related-party lending, ALM mismatch, capital adequacy (CET1 / CAR), RBI/IRDAI observations, lending concentration, promoter pledge, regulatory penalties. Do NOT use CFO/PAT or working-capital metrics.
- **IT services:** client concentration, unbilled revenue, contract assets, attrition, subcontractor cost, visa exposure, wage-hike deferrals, large-deal margin risk, employee pyramid, cybersecurity / data-breach risk, government-contract exposure.
- **Pharma:** USFDA observations / warning letters / import alerts, plant compliance, product concentration, related-party manufacturing/distribution, R&D capitalization, ANDA write-offs.
- **Infra / real estate:** related-party land transactions, loans/advances, project SPVs, guarantees, contingent liabilities, land-title disputes, revenue recognition, customer advances, pledge / promoter debt.
- **Holding companies / conglomerates:** holdco discount, capital allocation between subsidiaries, guarantees, cross-holdings, cash leakage, opaque subsidiary structures, intercompany loans.

---

## Governance Checklist Registry (Hard Rule)

This registry is the module's canonical, exhaustive item-by-item governance audit. Every item below is owned by exactly ONE specialist agent (the Owner column). Each owner MUST answer every item it owns — as a row in its Universal Findings Table carrying the item's ID in the "Question / Test" column (format: `A4-06 — Audit vs non-audit fees`) — so the synthesis (`99`) can assemble the complete checklist mechanically. An item the data cannot answer is recorded **Not Applicable (no data)** with the reason and the source that was checked — never silently skipped. The synthesis counts coverage (`answered / total`) and reports it; unanswered items are themselves a finding about disclosure.

**Flag semantics.** Checklist items use the module's standardized verdicts: **Green** (clears the green band), **Red** (trips the red band), **Amber** (between bands — the "neutral / worth watching" zone), **Not Applicable** (no data, or the item genuinely doesn't apply — state which), **Insufficient Data** (data exists but can't support a call). A Red on existence alone is banned — the red band states the materiality it must clear (Materiality Thresholds still apply). Where a band names a statute (SEBI LODR, Companies Act, ISS/Glass Lewis norms), detect the jurisdiction first (§27) and apply the local equivalent; the numeric bands below are the India/global defaults, and an agent that applies a different local threshold states which and why.

**Banded thresholds.** Green band = the level that earns Green. Red band = the level that trips Red. Between the two = Amber. Bands are calibrated from: SEBI LODR / Companies Act 2013 statutory floors, the Kotak Committee recommendations, ISS and Glass Lewis voting policies, the UK Corporate Governance Code, OECD/ICGN principles, proxy-advisor (IiAS/SES) norms, forensic-accounting research (Beneish), and the post-mortems of named governance failures (Satyam, IL&FS, Yes Bank, DHFL, Enron, Wirecard, Gensol). A statutory floor is never the green band — compliance with the legal minimum is Amber-grade hygiene, not excellence.

**Regime & structure nuance (Hard Rule — bands never fire against a structure the law mandates).** Before flagging an item Red, check whether the tested structure is REQUIRED by the company's own regulatory regime — a mandated structure is judged by conduct within it, never flagged for existing:
- **Banks (India):** RBI mandates promoter dilution on a glide path — a low or falling promoter stake in a bank is COMPLIANCE, not an A3-01 red flag; judge the trajectory against the RBI-approved plan instead. Bank boards also carry RBI-mandated composition/tenure rules that supersede the generic bands.
- **Government / PSU companies:** board appointments flow through the government — A1-level items are judged within that regime (independence of the non-official directors, vacancies left unfilled), while the ownership CONFLICT is handled once, by §24 Filter 6 / RF-OWN-004 as a conviction cap — do not double-punish every board item for the same fact.
- **Listed subsidiaries of MNC parents:** a parent royalty/brand fee is a standard structure — A5-02 judges the RATE, its trend vs margins, and the approval hygiene (majority-of-minority), not the existence of a royalty.
- **Recently listed companies:** items needing 3–5 years of listed history (voting records, pledge trends, KPI stability) are "Not Applicable (insufficient listed history)" — a real N/A, never a Red and never silently Green.
- **REITs / InvITs and manager-structured vehicles:** governance sits at the MANAGER — apply the board/committee/RPT items to the manager entity and say so.
The §24 rejector filters still apply on top (government control remains a structural conviction cap); this rule prevents the CHECKLIST from mechanically red-flagging what the regime itself dictates.

### Owner map

| Agent | Checklist sections owned |
|---|---|
| `01_management-and-track-record` | A13-04, A13-05 (team vintage, second-level depth) |
| `02_capital-allocation-scorecard` | A10-01, A10-05 (dividend policy, buyback-vs-dividend conduct) |
| `03_incentives-and-compensation` | A6 (remuneration, all), A12 (human capital, all) |
| `04_ownership-and-insider-behavior` | A3 (promoter & ownership, all), A15 (stock & market characteristics, all) |
| `05_board-and-shareholder-rights` | A1 (board, all except A1-05), A2 (committees, all), A10-02/03/04/06 (swap ratios, voting patterns, issue-pricing fairness, delisting conduct) |
| `06_candor-and-disclosure-quality` | A7-03, A7-04 (KPI stability, guidance hygiene) |
| `07_people-integrity-dossiers` | A1-05, A9-04, A13-01/02/03/06/07/08/09, A16 (person-level integrity, all), A17 (shadow network, lineage & cross-linkage, all) |
| `08_audit-and-assurance-quality` | A4 (auditor & audit quality, all), A7-02 (restatements) |
| `09_related-party-and-group-forensics` | A5 (related-party, all), A11 (group & subsidiary structure, all) |
| `10_contingent-liabilities-and-commitments` | A7a (contingent liabilities & commitments, all) |
| `11_accounting-forensics` | A8 (forensic flags, all), A14-01, A14-02 (leverage & loans-advances hygiene) |
| `12_regulatory-legal-and-compliance` | A9-01/02/03/05/06/07/08/09/10, A7-01 (timeliness), A14-03 (quality of lenders) |

### A1 — Board Structure & Composition *(owner: 05)*

| ID | Test | Green band | Red band |
|---|---|---|---|
| A1-01 | Board size & independence ratio | ≥50% independent AND board of 6–12 | Below the statutory floor (India: <⅓ independent; <½ where the chair is executive/promoter-linked), or board <5 or >15 |
| A1-02 | Chair–MD/CEO separation | Roles separate; chair non-executive | Same person holds both, or an executive promoter chairs with no counterweight |
| A1-03 | Non-executive, non-promoter chair | Independent non-promoter chair | Promoter-executive chair; or a rotating/undesignated chair that leaves no accountable board leader |
| A1-04 | TRUE independence of IDs (beyond the label) | No ID with an independence concern (tenure >10y incl. pre-2014 terms, ex-employee, promoter business/social/family ties, consulting fees, material shareholding, cross-directorships with promoter entities) | ≥2 IDs with concerns, or the audit-committee chair is not truly independent |
| A1-05 | Director & KMP reputation *(from 07's per-person dossiers)* | Every person graded Clean | Any controller / CEO / CFO / chair graded Material concerns or Disqualifying |
| A1-06 | Overboarding | Every director ≤4 listed boards (≤3 where also an executive; ISS/GL norms), committee load sane | Any director at/over the statutory cap (India: 7 listed directorships, 3 as ID) or >6 boards |
| A1-07 | Attendance | All directors ≥75% of board meetings; no chronic committee absentee | Any director <50%, or attendance not disclosed |
| A1-08 | Skills / competence matrix | Disclosed, ≥5 distinct relevant competencies, each mapped to named directors, no gap on finance/industry/risk | Not disclosed, or a core competency (accounting/finance, the company's industry) mapped to nobody |
| A1-09 | ID resignation pattern | No mid-term ID exits in 3 years, or orderly exits with stated benign reasons | Any ID exit citing concerns (or with reasons that don't hold up), or ≥2 unexplained mid-term exits in 24 months |
| A1-10 | Reappointment / removal patterns | Merit-based, disclosed performance evaluation behind each reappointment | A dissenting ID removed / not reappointed; reappointment pushed through against >20% votes-against |
| A1-11 | Board evaluation process | Annual evaluation with disclosed methodology AND disclosed outcomes/actions (UK norm: externally facilitated on a cycle) | No evaluation disclosed, or the same boilerplate paragraph recycled 3+ years with no visible consequence |
| A1-12 | Diversity & refreshment | Meets the local diversity floor (India: ≥1 woman director, and an INDEPENDENT woman director for the top-1000 — not a promoter relative counted as independent; UK: UKLR 6.6.6 targets) AND median ID tenure <9y with staggered additions | Statutory diversity breach, the woman-director seat filled by promoter kin, or median tenure >12y with no new independent voice in 5 years |
| A1-13 | Succession planning (CEO & board) | Succession policy disclosed with a real process (internal bench, NRC ownership) | None disclosed for a founder-CEO ≥60, or a recent unplanned exit handled chaotically |
| A1-14 | Meeting cadence & ID-inclusive quorum | ≥5 board meetings, longest gap ≤120 days, every meeting quorate (India: ⅓ or 3 directors, higher) INCLUDING ≥1 independent director [LODR Reg 17(2), 17(2A)] | <4 meetings, any gap >120 days, or any meeting held without an ID present |
| A1-15 | Permanent / age-exempt board seats | Every director's continuation shareholder-approved within 5 years; any NED ≥75 continuing only by special resolution with specific justification [LODR Reg 17(1A), 17(1D)] | A promoter patriarch in a non-retiring seat not put to a vote in >5 years, or a 75+ NED continuing without the special resolution |
| A1-16 | ID appointment/removal minority gate | Every ID appointment, reappointment, and removal by special resolution that ALSO carried a majority of public-shareholder votes [LODR Reg 25(2A)]; vacancies refilled ≤3 months [Reg 25(6)] | An ID resolution scraping through against a majority of public/institutional votes cast, or a vacancy left open beyond 3 months |
| A1-17 | IDs-only session & D&O cover | ≥1 independent-directors-only meeting a year (reviewing management performance and board information flow); D&O insurance in force for all IDs where mandated (India: top 1000) [LODR Reg 25(3)-(4), 25(10)] | No separate ID meeting held, or no D&O cover where mandatory |

### A2 — Board Committees *(owner: 05)*

| ID | Test | Green band | Red band |
|---|---|---|---|
| A2-01 | Audit committee quality | ≥⅔ independent (all-independent is best practice), independent chair with accounting/financial expertise who attends the AGM, ≥5 meetings/yr (statutory min 4, gap ≤120 days), quorum includes ≥2 IDs, private auditor sessions [LODR Reg 18; Sec 177] | Below statutory composition, <4 meetings, no financial expert, a promoter-executive on the committee, or any meeting without two IDs |
| A2-02 | NRC / Risk / Stakeholders committees | NRC ≥⅔ independent with an ID chair and no executive member [Reg 19(1)-(2)]; Risk committee (where mandated — India top 1000) ≥3 members, ≥1 ID, ≥2 meetings/yr with gap ≤210 days and cyber in its charter [Reg 21]; Stakeholders committee with a non-executive chair and quarter-end pending complaints ≈ 0 [Reg 20] | Any mandatory committee absent, non-compliant, or dormant; an executive on the NRC; investor complaints chronically pending |
| A2-03 | CSR committee & spend *(India)* | ≥2% obligation met with named programs; unspent amounts moved per Sec 135(5)-(7) timelines | Shortfall without the statutory transfer/explanation, or CSR routed to promoter-linked trusts/foundations |
| A2-04 | Substance vs paper | Meeting cadence above the floor, substantive agendas (strategy/risk deep-dives), evidence directors push back | Bare statutory minimum, >120-day gap breach, or agendas that never record dissent |
| A2-05 | Committee chair rotation & workload | Key-committee chairs spread across IDs; no single ID chairs more than 2 key committees; every director within the cross-company committee caps (India: ≤10 audit/stakeholder committee memberships, ≤5 chairs, across all listed companies) [Reg 26] | One ID chairs audit + NRC + risk simultaneously, a promoter-linked director chairs NRC, or any director over the committee caps |

### A3 — Promoter & Ownership Structure *(owner: 04)*

| ID | Test | Green band | Red band |
|---|---|---|---|
| A3-01 | Promoter/controller holding trend (12 quarters) | Stable or rising, >50% (or >35% with no control contest) | Steady decline, sharp drops, or <26% while still exercising full control |
| A3-02 | Share pledging / encumbrance (8–12 quarters) | 0% pledged (or <10% of promoter holding, disclosed benign purpose, falling) | ≥25% of promoter holding pledged (warning line); ≥50% of holding or ≥20% of total capital (the SAST detailed-declaration trigger); any QoQ increase; pledge proceeds funding promoter private ventures; a pledge INVOCATION is Critical [SAST Reg 28(3), Reg 31] |
| A3-03 | Cross-holdings & pyramiding | Promoters hold directly in personal capacity; no intermediate layers; voting power ≈ economic stake (wedge <5pp) | Multi-layer pyramids, circular holdings, promoter investment companies between family and listco, or a control-vs-cash-flow wedge >20pp |
| A3-04 | Differential voting rights | One share, one vote | DVR / super-voting concentrated with the promoter (with no ≤7-year sunset at a new listing), or non-voting shares held by the public |
| A3-05 | Cheap insider equity | No preferential allotments/warrants to promoters; promoters excluded from ESOP/SAR schemes | Preferential issues or warrants to promoters at a discount, promoter ESOP grants, warrants repeatedly lapsed and re-priced, or conversion-price resets in their favor |
| A3-06 | Free float level | ≥35–40% genuine float | <15%, minimum-public-shareholding breach [SCRR 19A], or "public" blocks parked with promoter-friendly entities [LODR Reg 31A misclassification] |
| A3-07 | Marquee investor entry/exit | High-quality long-only / institutional holders present and stable or accumulating | ≥2 marquee institutional exits within 12 months, or zero institutional ownership at scale |
| A3-08 | Promoter-group classification hygiene | Promoter group fully identified; reclassifications rare and well-grounded | Promoter reclassified as "public" to dodge norms; persons-acting-in-concert visibly undisclosed |
| A3-09 | Beneficial-ownership transparency | Ultimate beneficial owners identifiable through the SBO register / holding chain | Control masked through opaque trusts/offshore entities (genuine opacity — not language, §27) |
| A3-10 | Takeover-code disclosure hygiene | All stake-change disclosures on time (India: SAST Reg 29 — 5% initial, every ±2% after, within 2 working days); creeping acquisition within limits; no open-offer trigger crossed without an offer; promoter ≤75% | Late/missed SAST filings, a takeover-violation adjudication, or promoter holding above 75% |

### A15 — Stock & Market Characteristics *(owner: 04)*

| ID | Test | Green band | Red band |
|---|---|---|---|
| A15-01 | Exchange surveillance & volatility | Not under enhanced surveillance (India: ASM/GSM) in 24 months | Currently in a surveillance framework, or repeated circuit hits on no disclosed news |
| A15-02 | Volume & liquidity | Liquidity adequate for institutional entry/exit | Illiquid to the point that exit is the risk (a governance-abuse enabler) |
| A15-03 | Research coverage | ≥3 independent sell-side/independent analysts | Zero coverage, or only company-paid research |
| A15-04 | Pre-announcement price conduct | No pattern of unusual price/volume before announcements | Repeated run-ups ahead of news (also RF-MKT-002), or exchange clarifications repeatedly sought |

### A6 — Remuneration *(owner: 03)*

| ID | Test | Green band | Red band |
|---|---|---|---|
| A6-01 | Pay vs statutory cap & profit | Comfortably within the local caps (India: Sec 197 — aggregate 11% of Sec 198 net profit, single MD/WTD ≤5%, all executives ≤10%, NEDs ≤1%/3%; loss years within Schedule V) and stable as % of PAT | Cap breach / waiver / special resolution to exceed, or pay rising while profit falls for 2+ consecutive years |
| A6-02 | Promoter-executive pay vs peers & the SEBI gates | Within the peer band with disclosed benchmarking; promoter-executive pay inside the LODR Reg 17(6)(e) lines (₹5cr or 2.5% of net profit individually, 5% aggregate) or shareholder-approved; no single NED taking >50% of the NED pool | >2× peer median unexplained, top-decile pay with bottom-half TSR/ROCE, MD pay growth outrunning 3-year PAT CAGR, or the Reg 17(6)(e) lines crossed without approval |
| A6-03 | Pay-for-performance linkage | ≥30% of executive pay variable, tied to disclosed metrics and weights | All-fixed pay, or a discretionary bonus with no disclosed metrics |
| A6-04 | ESOP / RSU / SAR dilution & pricing | Annual burn <2%, total overhang <10% of shares outstanding, market-priced or fully fair-value expensed, broad-based | Burn >3%/yr, overhang >20%, deep-discount grants, or grants concentrated in a handful of executives |
| A6-05 | CEO-to-median ratio & severance | Ratio disclosed with methodology, within sector norms and justified; severance ≤2 years' pay, double-trigger only | Ratio >200× unjustified (or rising while median pay FALLS); golden parachutes >3× pay; single-trigger change-of-control |
| A6-06 | Clawback & malus provisions | Policy exists covering restatements and misconduct, with lookback (US: Rule 10D-1-compliant, no-fault, 3-year) | None — especially where a restatement or misconduct already occurred; or a restatement occurred and recovery was not pursued |
| A6-07 | Promoter family on the payroll | No family members beyond disclosed executives; any that exist have evident qualifications and arm's-length pay (India: office-of-profit approvals under Sec 188 in place) | Multiple family members in vague roles, pay rising faster than the median employee's, or kin appointed without the required approvals |
| A6-08 | NED / ID compensation structure | IDs paid sitting fees + fixed commission only (no options — India norm) | IDs holding stock options or outsized variable pay (an independence compromise) |
| A6-09 | Problematic pay practices & dissent response | None of: option repricing without a vote, tax gross-ups, single-trigger change-of-control vesting, multi-year guaranteed bonuses; any ≥20% vote against a pay resolution met with a disclosed response within 6 months | Any problematic practice present, or say-on-pay/remuneration support <70–80% with no board response |

### A12 — Employee / Human Capital *(owner: 03)*

| ID | Test | Green band | Red band |
|---|---|---|---|
| A12-01 | Attrition | At/below industry median and stable | >1.5× industry, spiking, or paired with KMP exits |
| A12-02 | Median-employee pay vs executive pay | Median pay competitive and rising at least with inflation | Median pay falling while executive pay rises (the divergence itself is the flag) |
| A12-03 | ESOP pool breadth | Broad-based retention tool | No pool at all, or a pool that exists but concentrates in top management |
| A12-04 | Workplace-conduct record | POSH/labor/safety record disclosed and clean or resolved | Recurring POSH / labor / safety violations, fatalities with penalties, or non-disclosure of complaint statistics |

### A10 — Minority-Shareholder Treatment *(owners: 02 for A10-01/05, 05 for A10-02/03/04)*

| ID | Test | Green band | Red band |
|---|---|---|---|
| A10-01 | Dividend policy & consistency *(02)* | Documented policy, paid per policy ≥4 years, payout sensible vs FCF | Erratic cuts with no policy, or payouts exceeding FCF funded by debt |
| A10-02 | Swap ratios in group mergers *(05)* | Independent valuation + fairness opinion + majority-of-minority approval; ratio defensible | A merger/scheme tilted toward the promoter entity (adverse independent view, high dissent, or valuation gymnastics) |
| A10-03 | Institutional voting patterns *(05)* | Every management resolution over the last 2–3 AGMs passed with >90% of total votes AND a majority of institutional/public votes in favor | Any resolution defeated, >20% against pay / RPT / director / auditor resolutions (the significant-dissent norm) with no board response within 6 months, or repeated proxy-advisor (IiAS/SES/ISS/GL) AGAINST recommendations |
| A10-04 | Rights / preferential pricing fairness *(05)* | Raises at/near market price with monitoring-agency oversight and stated use of proceeds | Deep-discount preferential allotments to promoters or select investors; warrants repeatedly allowed to lapse and re-priced |
| A10-05 | Buyback vs dividend conduct *(02)* | Distribution mechanism chosen on all-shareholder economics with a stated rationale | Buyback timed/priced to benefit a promoter tender, or promoter participates in the buyback while pledged |
| A10-06 | Delisting & exit-offer conduct *(05)* | No delisting attempt; or a completed/withdrawn attempt at a fair discovered price with independent-committee oversight and no coercion | A delisting attempt with gamed price discovery (results/guidance managed down beforehand, counteroffer below book), repeated failed attempts used to depress the float, or minority holders squeezed via schemes after a failed delisting |

### A13 — Management & Promoter Quality *(owners: 07 for A13-01/02/03/06/07/08/09; 01 for A13-04/05)*

| ID | Test | Green band | Red band |
|---|---|---|---|
| A13-01 | Professional CEO vs promoter-run | Either model with real professional depth and accountability | Promoter-run with no professional layer, family-only decision-making |
| A13-02 | View on the CEO (operating record) | Long operating history, crises navigated, no failed/abandoned ventures hidden | A trail of failed ventures presented as pivots; credibility gaps between narrative and record |
| A13-03 | Promoter vintage & involvement | Long vintage, active, focused on this business | Absentee promoter, or attention visibly split across unrelated ventures |
| A13-04 | Top-management team vintage *(01)* | Team median tenure ≥4y with orderly additions | Median tenure <2y from churn (not expansion), or serial exits at one role (e.g., 3 CFOs in 4 years) |
| A13-05 | Second-level team quality & bench *(01)* | Named, credentialed second level; succession bench visible | No identifiable second level; everything runs through the promoter |
| A13-06 | Family dynamics / succession disputes | No disputes; generational transitions settled or structurally simple | Active family/succession dispute, sibling factions, or contested wills over the holding |
| A13-07 | Promoter's other material businesses | None competing or transacting with the listco; time focused | Competing private ventures, or private entities transacting with the listco (route to A5/A11) |
| A13-08 | Sensitive government dealings | No discretionary government-dependence (contracts, licenses, allocations) | Concentrated dependence on discretionary state action, tender wins tied to political cycles |
| A13-09 | Political connect | No political office, party role, or donation web around the controller | Controller holds/held political office, or material donations/electoral-bond links coincide with business outcomes |

### A16 — Person-Level Integrity *(owner: 07 — run PER PERSON for every director, KMP, promoter-group individual, and company secretary)*

| ID | Test | Green band | Red band |
|---|---|---|---|
| A16-01 | Identity resolution | Person anchored to a unique identifier (India: DIN; else registry ID) + ≥2 corroborating identifiers before any adverse record is attributed | Adverse findings attributed on name-match alone (namesake risk — a protocol breach, not just a data issue) |
| A16-02 | Directorship map (current, past, struck-off) | All directorships disclosed in filings match the registry; no surprises | Undisclosed directorships, a web of struck-off/shell entities, or circular directorships among connected persons |
| A16-03 | Disqualification registers | No record (MCA Sec 164 list / UK disqualified directors / SEC officer-and-director bars — per jurisdiction) | Any active disqualification or bar |
| A16-04 | Criminal proceedings & arrests | No record found across the swept databases (sweep logged, dated); at most compoundable technical matters | Charges, arrests, or convictions for fraud/cheating/forgery/economic offences (India: IPC 420/406/467-471 or BNS equivalents, PCA, CBI/ED/SFIO chargesheets); ANY undisclosed criminal proceeding touching a controller/KMP; a fugitive/lookout/FEO-Act proceeding is an instant hard-disqualifier escalation |
| A16-05 | Civil / commercial litigation history | Nothing material beyond ordinary course | A pattern of cheating / breach-of-trust / oppression-mismanagement suits, or serial disputes with past business partners |
| A16-06 | Securities-regulator actions | No SEBI / SEC / FINRA / FCA (or local) order against the person | Any debarment, disgorgement, fraud finding, or settlement with sanctions attached |
| A16-07 | Wilful-defaulter / fraud-borrower lists | No RBI wilful-defaulter (₹25 lakh+ threshold, 2024 Master Direction) or fraud-classified borrower record — as borrower, director, OR guarantor | Any listing (person or their entities) |
| A16-08 | Insolvency history — the corporate-graveyard test | No personal insolvency; zero companies under their executive control entered insolvency/liquidation/restructuring (or one failure from a clear exogenous shock, creditors paid pari passu) | ≥2 companies they ran entered insolvency/CIRP/restructuring, a related party re-bought the failed assets at a discount (the IBC Sec 29A round-trip), an undischarged personal insolvency (itself a directorship bar), or an admitted personal-guarantor petition |
| A16-09 | Sanctions & watchlists | No OFAC/UN/EU/Interpol match (checked and logged) | Any true match |
| A16-10 | PEP status & political exposure | Not politically exposed, or exposure disclosed and ring-fenced | Active political position + business dealings with the government they influence |
| A16-11 | Credential verification | Claimed degrees/affiliations verify against the institution or independent records | FABRICATED credentials — affirmative contradictory evidence (a candor disqualifier in itself, the Scott Thompson/Yahoo precedent). A credential that merely CANNOT be independently verified (no public registry, an old degree) is Insufficient Data / coverage-limited — an evidence gap, never Red |
| A16-12 | Adverse media (dated, tiered) | No credible adverse coverage; allegations distinguished from convictions | Credible investigative reporting of fraud/misconduct, or a pattern of paid-media reputation laundering |
| A16-13 | Undisclosed related entities | Family/associate business web — mapped from the REGISTRY outward (shared addresses, co-directors, relatives' identifiers), not from the company's disclosure inward — matches the RPT disclosures | Family entities transacting with the listco absent from RPT disclosures (route to A5), or a registry-derived related party that appears in disclosures only after being found |
| A16-14 | Regulatory-role conflicts | No seats on regulators/exchanges that oversee the company | Person sits where they can influence their own regulation |
| A16-15 | Integrity buzz (forums / social — tier 10) | No unresolved buzz, or buzz investigated and cleared | *(Never Red alone.)* Unresolved material buzz → investigate per §24 Filter 1; if it stays unresolved, emit RF-MGT-005 and cap |
| A16-16 | Per-person overall grade | Clean | Disqualifying (see the Person-Level Integrity Protocol for grade definitions) |
| A16-17 | Resignation-timing pattern — the "smart rat" test | Board resignations across their career are routine (term end, age, workload), with consistent stated reasons | Resigned from another board ≤6 months before that company's default, fraud classification, restatement, or auditor exit — and the pattern repeats across ≥2 companies; or IDs resign en masse from this person's other boards |
| A16-18 | Association with past accounting failures | Never an officer, financial-statement signatory, or audit-committee member at a company that later restated, had an auditor flee, or was suspended/delisted — or demonstrably drove the clean-up (recorded dissent, whistle-raising) | ≥1 restatement / auditor-flight / suspension on their watch with no recorded dissent, where they signed the financials or sat on the approving audit committee |
| A16-19 | Professional-licence discipline | Licences (CA/CS/CFA/bar or local equivalents) active and clean | Struck off, suspended, or reprimanded by the professional body — gravest for a CFO or audit-committee member with an accounting-body sanction |
| A16-20 | Public claims vs filed numbers | Revenue/growth/order-book claims in interviews and conferences match filed numbers within rounding; no stock promotion | Numbers claimed in media that never appear in any filing ("run-rate" inflation), price-target promotion of their own stock, or lifestyle/asset displays flagrantly beyond disclosed income |

### A17 — Shadow Network, Lineage & Cross-Linkage *(owner: 07 — see the Entity & Network Discovery Protocol)*

The A16 items test the people the filings name. These test whether the filings named everyone — and everything. Bands are judged on the discovery loop that actually ran, not on how clean the result looked.

| ID | Test | Green band | Red band |
|---|---|---|---|
| A17-01 | Discovery completeness | Phase 1 AND Phase 2 both ran; every subject on the Discovery Register carries an enumerated discovery method; the loop terminated on a stated rule | Discovery stopped at the filings' own list of directors and subsidiaries; subjects present with no recorded discovery method; Phase 2 (founder loop) skipped or silently truncated while sources were reachable. *Phase 2 not running because the required registries and discovery sources were genuinely unreachable is a coverage gap, not this Red condition — record it as **Insufficient Data** with the People & network integrity and Confidence Score caps (Score Cap Rules), the same distinction A17-06 draws for an unidentifiable founder. This row's Red band is reserved for a loop that was skippable and was skipped, or that started and stopped without a stated termination rule — never for source unavailability the analyst could not control* |
| A17-02 | Corporate lineage & former names | Incorporation date and the registry's previous-names field reconcile with every public claim the company makes about its own history; any group lineage is disclosed in filings | A claimed founding year older than the entity with no disclosed predecessor, an undisclosed former name, or a self-disclosed "formerly / erstwhile / part of ___" lineage absent from the filings (RF-NET-001) |
| A17-03 | Predecessor / phoenix test | No predecessor, or the business was acquired from it through a formal process with the basis and consideration disclosed | Assets, brands, staff, address or customers continued out of a failed, struck-off or resolved entity with no disclosed legal basis; or a related party re-bought the assets (RF-NET-002) |
| A17-04 | Brand & trademark ownership | Every mark the company trades under is owned by the company or a consolidated subsidiary — OR licensed from an unrelated third party under a disclosed, arm's-length agreement with durable terms and a stated fee basis (the normal franchisee / licensed-brand structure) | **For a mark that is core to, or a material source of, the company's revenue** (an immaterial ancillary mark is noted, not flagged): marks owned by a **controller-linked** entity; a licence whose terms, fee basis or duration are **undisclosed**; a mark used with **no identifiable licence at all**; a licence in **dispute or terminable at short notice** on which material revenue depends; or the SAME marks in live use by an unrelated company — **but only after the D-4 corroboration test** (`frameworks/GOVERNANCE_DATABASES.md`): unrelated proprietors legitimately register the same word in different territories and goods-and-services classes, so compare jurisdiction, registration status and class scope first, and where those overlap require a second independent link (common director, common founder, address, transaction). A bare wordmark text match is a LEAD, not a finding. Once corroborated it is an unresolved ambiguity, never assumed benign (RF-NET-004). Route the economics of any licence to A5-02. *Not owning the IP is not itself the flag — a franchisee is not a governance failure. The flag is a controller on the other side of the licence, or terms nobody can see. This follows the Regime & structure nuance rule: judge conduct within a structure the business model dictates, never the structure's existence* |
| A17-05 | Registered-address cluster | No unexplained cluster, or clusters explained (shared office / group campus) and disclosed | A co-address entity with a **corroborated second link** (common director, founder, brand, or transaction) that ALSO engages a named disclosure obligation — it transacts materially with the listco, or is a related party under the governing regime — and is absent from the filings (RF-NET-005; classified `disclosable-and-omitted` per the A17-08 four-class test). *Co-address alone is a lead; a corroborated-but-non-disclosable co-address entity is a mapped relationship to record, never Red on the link by itself* |
| A17-06 | Founder & past-controller trail | Founders and past controllers of the company AND of every lineage entity identified by name and identifier, and swept | A founder or past controller who IS identified as carrying a Material-or-worse fact but is not carried into the exposure grading. *A founder that genuinely cannot be identified after recipe D-6 is exhausted is **Insufficient Data** — a named Scope-Boundary coverage gap with the confidence cap, never Red: the checklist does not turn a record that does not exist into an adverse finding, nor double-count the discovery-coverage penalty* |
| A17-07 | Cross-linkage to adverse networks | No person or entity on the register carries a live hop-1 link to an entity with a Material-or-worse fact | A live hop-1 link to a fraud / enforcement / insolvency network — stated with its **exposure basis** and never written as a personal finding (RF-NET-003) |
| A17-08 | Undisclosed-network reconciliation | Every discovered subject that falls under a **named** disclosure obligation — RPT note, subsidiary/associate list, promoter-group disclosure, directors' other-directorships, material-event rule — AND clears its materiality threshold, appears in the filings | A subject that falls under a **named** obligation AND transacts materially with the listco (both conditions, not either alone — an ordinary arm's-length counterparty that merely transacts is `not-disclosable`, never this finding), and is absent from the filings (the non-disclosure outweighs the underlying item — same logic as RF-PPL-005). **Each discovered subject is first classified `not-disclosable` / `disclosable-and-disclosed` / `disclosable-and-omitted` / `obligation-unclear`; only the omitted class is a finding.** The filing-supplied vs independently-discovered counts are reported as a COVERAGE statistic — how much of the network the filings alone would have shown — and never as a finding in themselves. Discovery working is not a defect of the company |
| A17-09 | Scope boundary declared | Every branch left unexpanded is named on the Scope-Boundary Register with its reason and what would close it | Expansion truncated silently; a subject in scope that simply stops appearing (RF-NET-006) |
| A17-10 | Aggregator-conflict resolution | Roster conflicts between mirrors resolved on the primary registry, or the extra name kept in scope and the conflict flagged | A name that appears on one mirror and not another, dropped without a record — the roster equivalent of resolving uncertainty in the target's favour |

### A4 — Auditor & Audit Quality *(owner: 08)*

| ID | Test | Green band | Red band |
|---|---|---|---|
| A4-01 | Auditor identity & rotation compliance | Terms compliant; rotation orderly and real | Rotation dodged via network-firm swaps, or tenure stretched past the local cap through loopholes |
| A4-02 | Audit firm calibre | Big-4 / peer-reviewed national firm with a listed-company practice sized to this company | A firm too small for the company's complexity, or a firm/partner with a disciplinary history |
| A4-03 | Subsidiary & component auditor calibre | Material subsidiaries audited by the parent auditor or comparable firms | Material subs audited by unknown firms, or components left unaudited (the Wirecard/Satyam pattern) |
| A4-04 | Auditor resignation & stated reasons | No mid-term resignation in 3–5 years; any change is statutory rotation with a clean handover | Mid-term resignation — especially citing information access, unpaid fees, or disagreements, resigning without completing the quarter's limited review [SEBI circular Oct 2019], or exiting within weeks of raising a qualification (the DHFL/Manpasand/Vakrangee pattern) — treat as Critical (RF-AUD-001) |
| A4-05 | Opinions: qualification / EoM / adverse / disclaimer | Clean opinions, standalone AND consolidated | Any qualification, adverse opinion, disclaimer, or going-concern emphasis *(hard-disqualifier deference applies)* |
| A4-06 | Audit vs non-audit fees | Non-audit fees (incl. network firms) <25% of audit fees; no prohibited services (India Companies Act Sec 144: bookkeeping/accounting, internal audit, actuarial, investment advisory/banking, management services — valuation is NOT a Sec 144 item; SOX §201 separately bars appraisal/valuation and fairness opinions) | Non-audit fees ≥ audit fees (Andersen earned more consulting than audit at Enron), any prohibited service rendered, or non-audit services undisclosed |
| A4-07 | Auditor remuneration level & trend | Fee within ±50% of the peer-median for the size band, moving with company scale | Fee <50% of peer-median (nobody audits a multinational for that money), or the fee FALLS while revenue grows >20% (low-balling) |
| A4-08 | Internal & secretarial audit | Reputable internal auditor; clean secretarial audit (India: unqualified MR-3 by a peer-reviewed, shareholder-appointed secretarial auditor — term caps per the Dec-2024 LODR amendment; compliance report filed ≤60 days of FY-end) | No internal-audit function, adverse/repeat secretarial remarks two years running, the MR-3 simply absent where mandated, or a late/missing compliance report |
| A4-09 | Internal financial controls (ICFR/IFC) | Unqualified IFC opinion; audit committee actively reviews | Material weakness, adverse IFC opinion, or IFC of material components not audited |
| A4-10 | Key Audit Matters recurrence | KAMs sector-standard and evolving | The same high-risk KAM (revenue recognition, receivables, investment valuation) recurring 3+ years with growing balances |
| A4-11 | CARO / companion-report flags *(India)* | Clean CARO annexure | Adverse CARO remarks: loans to related parties, fund diversion, unrecorded transactions, benami items |
| A4-12 | Audit-committee ↔ auditor engagement | Private sessions disclosed as held; auditor attends committee meetings | Affirmative evidence sessions were NOT held, or the CG report/minutes contradict the claim. Mere silence in the disclosures is Insufficient Data (with a disclosure-completeness note), never Red |
| A4-13 | Regulator discipline of firm/partner | No NFRA / PCAOB / ICAI (or local) orders against the firm or signing partner | Active orders or debarment against either |
| A4-14 | Component-auditor coverage | Principal auditor covers ≥80% of consolidated assets/revenue; material components audited by network-grade firms | <50% of the consolidation audited by the principal auditor, or the cash/revenue-rich components audited by unknown local firms (Wirecard's third-party acquiring; IL&FS's entity sprawl) |
| A4-15 | Gatekeeper exit cluster | No unplanned gatekeeper exits; departures have named successors and stated reasons | CFO + auditor (or CFO + company secretary / internal auditor) both leaving within any rolling 12 months, or a CFO exit within a quarter of results/a fundraise explained only by "personal reasons" |
| A7-02 | Restatement frequency *(owner: 08)* | None in 5 years | Any material restatement *(hard-disqualifier deference)*, or repeated "prior-period adjustments" — and where a clawback policy existed, recovery not pursued |

### A5 — Related-Party Transactions *(owner: 09)*

| ID | Test | Green band | Red band |
|---|---|---|---|
| A5-01 | RPTs as % of revenue / PAT / assets | Aggregate RPTs (ex-dividends) <1–5% of consolidated revenue, all at documented arm's length | Above the High/Critical materiality threshold (5–15%+), opaque, recurring, or promoter-linked; above the LODR Reg 23 material-RPT line without majority-of-minority approval (India, from Dec 2025: graded slabs — 10% of turnover up to ₹20,000cr turnover, tapering to a ₹5,000cr hard cap; earlier regime: lower of 10% of turnover or ₹1,000cr) *(>25% defers to the hard disqualifier)* |
| A5-02 | Royalty / brand / technology fees to promoter group | None, or ≤2% of consolidated turnover with the basis disclosed (the Kotak/proxy-advisor comfort line) | >5% of turnover without prior majority-of-minority approval [LODR Reg 23(1A)], rising while margins fall, or paid to an entity that provides nothing identifiable |
| A5-03 | Loans / ICDs / guarantees to group | Nil (Sec 185/186 discipline: zero loans to directors or their entities; anything else within limits, disclosed, at market rates) | Any material loans, deposits, or guarantees to promoter entities (RF-RPT-003) — worst when to loss-making or thinly-capitalized entities, below-market, or serially rolled over |
| A5-04 | Promoter-vendor / promoter-customer transactions | None | Material purchases/sales routed through promoter entities (a margin-skimming channel); round-tripping EVIDENCED — the same counterparty on both sides PLUS circularity evidence (matched amounts/timing, off-market pricing, or a funds-flow circle — the DHFL/Gensol pattern). A bare two-way match with no such evidence is a LEAD: Amber + investigate, never Red on the match alone |
| A5-05 | Arm's-length substantiation | Benchmarking methodology disclosed; audit-committee approval documented | A bare "arm's length" assertion with no methodology (an assertion is not evidence) |
| A5-06 | Minority dissent on RPT resolutions | <10% votes-against | >20% against, or a defeated resolution restructured to dodge the vote |
| A5-07 | RPT approval hygiene | 100% of RPTs pre-approved by the audit committee with only INDEPENDENT members voting [Reg 23(2)-(3)]; omnibus approvals ≤1 year, reviewed quarterly, unforeseen transactions ≤₹1cr each; material RPTs put to majority-of-minority vote | Post-facto ratifications, omnibus approval used as a blank cheque, non-IDs voting on RPTs, or transactions split to stay under approval thresholds |
| A5-08 | RPT counterparty transparency | Every counterparty named with the relationship stated | Material transactions with unnamed "entities where KMP exercise influence" |
| A5-09 | Related-party M&A | No acquisitions from controller-linked sellers; all M&A from unrelated third parties with fairness opinions | ANY acquisition (even proposed-then-withdrawn) of a promoter/family-owned entity — the Satyam-Maytas confession trigger; a board-approved-then-aborted attempt is a permanent red flag |
| A5-10 | Executive-counterparty conflicts | No executive, director, or promoter owns or runs a material vendor, customer, lender, or fund of the company | An executive/promoter controls a material counterparty (the Enron-Fastow / Gensol pattern: promoter-controlled customer + vendor + fund-destination) |

### A11 — Group & Subsidiary Structure *(owner: 09)*

| ID | Test | Green band | Red band |
|---|---|---|---|
| A11-01 | Holding-structure complexity (layer DEPTH and entity count vs the business) | ≤2 layers; entity count proportionate to operations (single-segment: typically <20); each entity has an evident business purpose | >3 layers, >100 group entities (IL&FS ran 348 — debt sat where ratings never reached), offshore chains without visible purpose, or entities that only move money |
| A11-02 | Trapped / round-tripped cash | Cash held at the parent or demonstrably fungible | Cash concentrated in opaque subsidiaries while the parent borrows |
| A11-03 | Inter-corporate loans & deposits | Nil / immaterial | Material ICDs to group entities, especially rolling or evergreen |
| A11-04 | Listed-vs-unlisted sibling leakage | No overlapping business with promoter private entities | Growth, margin, or opportunities migrating to the promoter's private companies |
| A11-05 | Subsidiary financial transparency | Material subs' financials visible and audited; structure stable | Material subs invisible in disclosures, frequent restructuring churn, or associates held just below consolidation thresholds |
| A11-06 | Unlisted material-subsidiary governance *(India)* | ≥1 ID of the listco on every unlisted material subsidiary's board [Reg 24(1)]; secretarial audit of material subs; special resolution before any dilution below 50% or sale of >20% of a material sub's assets [Reg 24(5)-(6)] | Cash or assets moved via subsidiaries with no ID oversight, or subsidiary stake/asset disposals executed without the special resolution |
| A11-07 | Off-balance-sheet entities with recourse | No unconsolidated entities with recourse to the company; guarantees to them <2% of net worth, all in the contingency note | Debt parked in SPEs sponsored by the company or its executives (the Enron Raptors/LJM pattern), or guarantees + commitments to unconsolidated entities >10% of net worth |

### A7a — Contingent Liabilities & Commitments *(owner: 10)*

| ID | Test | Green band | Red band |
|---|---|---|---|
| A7a-01 | Total CL as % of net worth | <5% | >25% of net worth (or >50% of PAT) |
| A7a-02 | CL trend over time | Stable or declining, explained | Doubling YoY, or a new large item appearing without narrative disclosure |
| A7a-03 | Direct tax disputes | Nil / immaterial (<5% of net worth) | >15% of net worth, or losses at multiple appellate levels while unprovided |
| A7a-04 | Indirect tax disputes (GST/excise/customs) | Nil / immaterial | Same thresholds as A7a-03; 100%-penalty demands treated at face |
| A7a-05 | Litigation / claims not acknowledged as debt | None material | Material claims with adverse interim rulings, still unprovided |
| A7a-06 | Corporate guarantees given | Nil (or to 100% subs only, within Sec 186 limits) | Material guarantees to promoter/related entities (cross-route to A5-03) |
| A7a-07 | Bank guarantees & LCs | Ordinary-course, small vs net worth | Outsized vs business needs (can conceal group support) |
| A7a-08 | Capital commitments | Consistent with the stated capex plan | Commitments wildly above disclosed capex plans, or to related-party EPC vendors |
| A7a-09 | Bills discounted with recourse | Nil | Material recourse financing (hidden leverage + receivables-quality signal) |
| A7a-10 | Statutory dues disputes (PF/ESI/cess) | Nil | Recurring statutory-dues defaults (an integrity signal, not just a cash one) |
| A7a-11 | Regulatory / penalty demands | Nil | Any material regulator penalty, or repeated small ones |
| A7a-12 | Subsidiary / JV / associate CLs | Consolidated exposure visible and small | Group-entity CLs material or not separately disclosed |
| A7a-13 | Movement: additions / reversals / crystallization | Additions rare, reversals explained | Repeated crystallization (provisions were understated), or items silently vanishing between years |
| A7a-14 | Provided vs only-disclosed split | Probable losses provided; the split stated | Large probable losses carried as "possible" through serial appeal losses, unprovided |
| A7a-15 | Unhedged forex / derivative exposure | Nil or hedged per a disclosed policy | Large unhedged exposure or exotic/structured derivatives |

### A8 — Accounting Quality / Forensic Flags *(owner: 11)*

| ID | Test | Green band | Red band |
|---|---|---|---|
| A8-01 | CFO / PAT (accrual quality) | ≥0.8 sustained | <0.6, especially persistent (RF-FIN-001) — profits the cash never confirms |
| A8-02 | Working-capital days creep | Stable or negative (float-funded) | Rising >20% without a disclosed business-model change |
| A8-03 | Receivables ageing >6 months | Minimal, stable, dispersed | Rising sharply, or concentrated with related parties (RF-FIN-002) |
| A8-04 | Expense capitalization | Conservative, disclosed policy, stable rate | Capitalized development/interest rising vs peers or vs own history (profit inflation) |
| A8-05 | Recurring exceptionals & other income | Exceptionals rare; other income <10% of PBT or clearly treasury | "One-offs" every year, or other income >⅓ of PBT driving the P&L |
| A8-06 | Goodwill build-up & impairment | Modest goodwill, genuinely tested | Goodwill > net worth, or serial impairments confessing overpayment (RF-FIN-004) |
| A8-07 | Policy / estimate / year-end changes | Stable policies and estimates | Profit-boosting changes (life extensions, revenue-timing), or a fiscal-year-end change that muddies comparability |
| A8-08 | Depreciation rate consistency | Charge tracks the asset base | Unexplained large drops in the charge on a stable base |
| A8-09 | Provisioning adequacy | Coverage stable vs history and peers | Provision releases funding reported earnings |
| A8-10 | Effective tax-rate anomaly | Near the statutory rate, or the gap fully explained | Persistently far below statutory with no credible explanation (fabricated profits pay no tax — the Satyam test) |
| A8-11 | Cash EPS vs accounting EPS | Ratio ≈ 1 | <0.7 — earnings built from non-cash add-backs |
| A8-12 | CFO / EBITDA conversion | ≥0.7 | <0.5 sustained |
| A8-13 | Consolidation opacity | Stable perimeter, changes explained | Frequent entity churn, deconsolidation of weak units, associates engineered below thresholds |
| A8-14 | Beneish M-score (8 components) | M < −2.22 and no single component in the manipulator zone | M > −1.78 (Beneish's manipulation cutoff), or ≥3 components in the manipulator zone (DSRI ≥1.465, GMI ≥1.193, AQI ≥1.254, SGI ≥1.607, DEPI ≥1.077, LVGI ≥1.111, TATA ≥0.031); −2.22 to −1.78 is Amber — re-check the driver components. `M = −4.84 + 0.920·DSRI + 0.528·GMI + 0.404·AQI + 0.892·SGI + 0.115·DEPI − 0.172·SGAI − 0.327·LVGI + 4.679·TATA` |
| A8-15 | Revenue-quality cross-checks | Revenue growth corroborated by cash taxes paid, collections, and volume/operational data; unbilled revenue + contract assets <10% of revenue; order book contractually binding | Revenue grows while cash taxes and collections stay flat (paper revenue); >25% of revenue unbilled or mark-to-model; revenue/order-book claims resting on non-binding MOUs (Enron's mark-to-market; Gensol's 30,000 EV "pre-orders") |
| A8-16 | Segment / geography disclosure shifts | Segments stable; changes improve visibility | Segments merged or redefined exactly when a key segment deteriorates |
| A8-17 | Dechow F-score & accrual battery | F-score <1.00; RSST accruals ≤3% of average assets; soft assets <50% of total assets; Δreceivables and Δinventory each <2% of average assets | F-score ≥1.85 ("substantial" misstatement risk; ≥2.45 high), RSST ≥10%, soft assets >65% and rising, or Δreceivables/Δinventory ≥5% of assets with no acquisition explaining it |
| A8-18 | Issuance in a flagged year | No fresh equity/debt raised in a year when the accrual battery is red; operations self-funded | Securities issued (equity, debt, convertible, QIP) in a year where F-score ≥1.85 or TATA ≥0.031 — books dressed for a raise |
| A8-19 | Cash authenticity | Interest earned ON the cash/deposit balances (scope-matched — strip loan/bond/tax-refund/customer-financing interest where the other-income note itemizes) ÷ average cash & deposits within ~150bp of the local risk-free rate; cash held in the company's own name at major banks; auditor obtained independent bank confirmations | Implied yield <50% of the risk-free rate on a material cash pile (Satyam's ₹5,040cr; Wirecard's €1.9bn), cash "held in trust" by third parties, or bank confirmations the auditor never independently obtained. If the interest line cannot be scope-matched, mark the yield test "not computable — mixed interest line" and rest on the confirmation prong. NOT valid for banks/NBFCs/insurers (interest income IS the business — sector overlay applies; test cash existence via regulator returns/confirmations instead) |
| A8-20 | Regulator-found divergence | No regulator inspection has ever restated the company's reported numbers | Any disclosed divergence above the local threshold (India banks: additional GNPAs >5% of reported, or provisioning gap >10% of pre-provision profit — the Yes Bank pattern), or a regulator/lender-directed forensic audit |
| A14-01 | Leverage level (governance lens) *(owner: 11)* | Net cash or net debt/EBITDA <0.5× (§24 Filter 3 treats net cash as a strategic asset) | >3×, or leverage rising to fund promoter objectives (buyouts, pledges, private ventures) |
| A14-02 | Loans & advances level *(owner: 11)* | <2% of total assets, ordinary-course | >5% of assets, rising, or advanced to parties that never repay (a leakage channel) |

### A9 — Regulatory, Legal & Integrity (company-level) *(owner: 12; A9-04 person-level → 07)*

| ID | Test | Green band | Red band |
|---|---|---|---|
| A9-01 | Securities-regulator actions vs the COMPANY | None in 5 years — swept and logged, not just "not disclosed" | Any enforcement, consent order, or settlement scheme |
| A9-02 | NCLT / CCI / ED / CBI / SFIO & forensic investigations | None | Any active investigation, or a forensic audit ordered by lenders/regulator |
| A9-03 | Whistleblower / vigil mechanism & outcomes | Mechanism + ombudsperson + complaint statistics disclosed | No mechanism, or fraud-alleging complaints left unresolved/undisclosed |
| A9-04 | Promoter / controller track record elsewhere *(owner: 07)* | The controller's OTHER ventures show clean operations — no defaults, regulator actions, or minority-squeeze history | A trail of defaults, enforcement, minority oppression, or failed listed vehicles in the controller's other companies (the fuller per-person read lives in A16) |
| A9-05 | Rating actions | Stable or moving ≤1 notch/year; same agencies engaged for years | Downgrade ≥3 notches inside 90 days (IL&FS went AAA→D in ~2 months), "issuer not cooperating", a withdrawal at company request with debt outstanding, or an agency exiting after failing to verify company documents (the Gensol forged-letters pattern) |
| A9-06 | Exchange fines & listing-compliance register (8 quarters, all exchanges) | Nil | Repeated fines — even small ones are a hygiene signal |
| A9-07 | Insider-trading / trading-window violations | None | PIT violations by KMP/promoter, or regulator orders on insider trading |
| A9-08 | Sanctions / export-control / AML exposure | No dealings with sanctioned entities/geographies, or fully licensed | Exposure without controls, or enforcement already underway |
| A9-09 | ESG / environmental / consumer penalties | None material | Repeated pollution-board closures, consumer-fraud orders, product bans |
| A9-10 | Litigation-register reconciliation | Every material case found in the court/tribunal sweep appears in the filings' legal/contingency disclosures | A material case visible in public court records but ABSENT from filings (a disclosure-integrity breach — Red regardless of case merits) |
| A9-11 | Response to whistleblowers & short-sellers | Any published allegation met with an independent forensic review (outside firm, unrestricted scope, findings published) | The company sues or attacks the messenger while never verifying the core allegation, or a scope-limited "review" clears management without testing it (Wirecard sued the FT; the KPMG special audit could not verify the cash) |
| A7-01 | Disclosure timeliness & completeness *(owner: 12)* | Results/filings on time for 12 straight quarters; material events within the local clock (India Reg 30: board outcomes ≤30 min, internal events ≤12h, others ≤24h; rumour verification ≤24h where mandated); no exchange nudges | Delayed results (RF-REG-002), listing fines for late filings, chronic late Reg 30 disclosures, or repeated exchange clarification requests |
| A14-03 | Quality of lenders / bankers *(owner: 12)* | Top-tier bank consortium consistent with the company's size | Reliance on obscure/high-cost lenders while claiming cash richness, or lender flight mid-cycle |

### A7 — Disclosure & Candor extras *(owner: 06)*

| ID | Test | Green band | Red band |
|---|---|---|---|
| A7-03 | KPI stability | The KPIs management reports have stayed consistent ≥5 years | A KPI redefined, rebased, or dropped right after it deteriorated (RF-MGT-003) |
| A7-04 | Guidance hygiene | Guidance given, met, or revised openly with reasons | Guidance quietly withdrawn, redefined mid-year, or "reiterated" while its inputs changed |

---

## Entity & Network Discovery Protocol (Hard Rule — agent 07, consumed by 09 and 12)

The Person-Level Integrity Protocol below answers *"is there anything against this name?"* This protocol answers the question that comes first and is easier to get wrong: **which names?** A sweep is only ever as good as the subject list it runs against, and the subject list the filings hand us is the one the company chose to give.

*The miss this exists for:* a botanical-extracts manufacturer whose three current directors, and the company itself, came back clean on every registry, court, regulator and defaulter list. Its own website said "formerly OLS, established 2007" against a 2020 incorporation date, and reused another live company's brand names. That predecessor had been through insolvency; the predecessor's founder — off every board for years — had been arrested under money-laundering law over a separate ₹1,500 crore prosecution. Three links, none of them reachable from a directorship search, all of them reachable from the company's own About page. **Discovery, not sweeping, was the binding constraint.**

### The Discovery Register (Hard Rule)

Before ANY sweep runs, `07` writes a Discovery Register: one row per subject — entity or person — carrying:

| Field | Rule |
|---|---|
| Subject | The name, with variants |
| Type | Entity / Person |
| Hop | 0 (the listco and its own register) · 1 · 2 · 3 |
| **Discovery method** | One of the enumerated values below — free text is not permitted |
| Provenance | `filing-supplied` (the company disclosed it) / `independently discovered` (we found it) |
| Tier | Person A/B/C or Entity E-A/E-B/E-C |
| Sweep status | Full / Refresh / Scoped / **Not run (Scope-Boundary row #n)** |

**Enumerated discovery methods:** `filing/user-supplied` · `current directorship` · `past directorship` · `brand lineage (self-disclosed)` · `name-change trail` · `registered-address cluster` · `founder of a linked entity` · `trademark/brand owner` · `co-director network` · `RPT counterparty` · `registry charge-holder`.

**The forcing rule:** *if you cannot write down how a subject was found, you have not found it.* No subject enters a sweep without a discovery-method cell; no subject leaves scope without a Scope-Boundary row (below). Writing the register is not documentation after the fact — it is the step that makes the loop actually run instead of being silently skipped.

### Phase 1 — the target and its people (every step required)

1. Current directorships for every person on the Person Register (§ Person-Level Integrity Protocol).
2. **Past / resigned** directorships for each — the current-board snapshot is not the roster (recipe D-8).
3. **Fetch the company's own About / History / Milestones pages** and read them for lineage language (recipe D-1). This is a required fetch. It is the single most common way a related entity is missed, because a predecessor appears in no directorship search.
4. The founding-year mismatch test (D-2) and the registry previous-names field (D-3).
5. `"{company}" ("formerly" OR "erstwhile" OR "part of")` even when the About page said nothing.
6. Trademark / brand proprietor search (D-4) and the registered-address cluster (D-5).
7. **Co-director network (recipe D-9):** for each person, the others who repeatedly appear alongside them across entities. A repeated co-appearance across unrelated businesses is a discovery lead, mapped and registered HERE, before the sweeps — not deferred to the related-entity-web step, or the co-directors it surfaces would miss the founder loop and the coverage accounting. (A single overlap is noise; the signal is repetition.)

### Phase 2 — for every CORROBORATED entity Phase 1 surfaced, i.e. Tier E-A and E-B (every step required)

**Uncorroborated address-cluster leads (Tier E-C) do NOT enter Phase 2.** Phase 1 includes the address-cluster recipe, and a co-working, CA-office or virtual-office address can return hundreds of unrelated companies; founder-sweeping all of them would exhaust the run before the entities that matter are reached. An E-C lead gets its scoped registry-plus-keyword pass first and enters Phase 2 only on ESCALATION — when that pass supplies the corroborating second link, or returns an adverse hit.

7. Identify the entity's **founder(s), distinct from its current board** (D-6).
8. Confirm whether each founder is still a director. **If not, that is a reason to look harder, not to drop them.**
9. Run the person core set AND the Adverse-Keyword Battery on **each founder's own name and identifier** — even when the entity itself came back clean. *A clean entity with a compromised founder is exactly the pattern this protocol exists to catch.*
10. If a founder search surfaces an adverse finding tied to a *different* company, that company enters scope at the next hop; repeat Phase 2 on it.

### Hop budget & termination (Hard Rule)

- **Hop 0** = the listco and its own Person Register. **Hop 1** = directly linked entities and people (current/past directorships, lineage entities, corroborated address-cluster entities, RPT counterparties). **Hop 2** = founders and controllers of hop-1 entities, and the entities THEY control.
- **Default cap: hop 2.** Extend to **hop 3 only along a branch where a hop-2 subject grades Material or worse** — depth follows evidence, not curiosity.
- **Terminate** when: no new subject surfaces, or the hop cap binds. A **Disqualifying-equivalent finding terminates only ITS OWN BRANCH**, not the loop — an early hit on an independent director's side branch says nothing about whether the controller/KMP network is clean, and by the transitive-exposure rule below an exposure finding does not fail the target's gate, so the decision is precisely NOT settled. The one global stop is a **direct** finding that has actually tripped the target company's Non-Negotiable Gate (a Disqualifying grade on this company's own controller/CEO/CFO/chair, or a Critical red flag against the company itself) — at that point further expansion cannot change the decision, and whatever is left unexpanded goes on the Scope-Boundary Register by name, per §24.
- **Breadth budget (the hop cap bounds DEPTH, not WORK).** A controller with dozens of current and historical directorships produces an arbitrarily wide hop-1 set, and branch-local termination no longer contains it. So bound the width too, deterministically: **at most 25 hop-1 entities and 15 hop-2 entities enter a full Phase-2 sweep**, selected in this fixed priority order — the scoped pass that supplies key (2) runs on **every** candidate before the selection, because an ordering key computed after the step it gates orders nothing — (1) lineage / predecessor entities, (2) **entities carrying ANY adverse hit from their scoped pass, at any tier**, (3) entities that transact with the listco or appear in the RPT note, (4) entities controlled by a Tier-A person (controller, CEO, CFO, chair, CS), (5) entities controlled by Tier-B people, (6) everything else, by recency of the linkage. *A scoped adverse hit outranks a benign controller-linked entity: the budget exists to protect the decision-relevant branches, and an unconfirmed possible sanctions or fraud hit on a Tier-B officer's entity is more decision-relevant than the twenty-fifth clean company a Tier-A person happens to direct.* Ties break by the subject's own registry status (struck-off / under insolvency first). Everything above the limit is **not dropped** — it goes on the Scope-Boundary Register by name with reason `breadth_budget`, and the **declared-overflow cap** in the Score Cap Rules applies (declaring the overflow avoids RF-NET-006, which is about SILENT truncation; it does not buy back the coverage you did not get). State the limit used and the count that overflowed; a run that silently sampled its own network is worse than one that admits where it stopped.
- **No silent truncation.** Every branch left unexpanded, for any reason including budget or breadth, gets a named Scope-Boundary row. A register that quietly stops reads as "we covered everything" when it did not — the same defect the engine bans everywhere else.

### Entity sweep tiering

| Tier | Who | Depth |
|---|---|---|
| **E-A** | Any entity that transacts with the listco · any entity a Tier-A person controls — **except the listco's own former names and predecessor entities, which are governed SOLELY by the lineage carve-out row below (they never also match this generic row)** | Full: registry master data + previous names + charges, insolvency, courts, regulator, statutory dues, keyword battery, adverse media, brand/trademark, address |
| **E-A (lineage carve-out)** | **The listco itself, its former names, and any predecessor ENTITY** | `07` runs the IDENTITY and lineage axes only — registry master data, previous names, charges, founders at incorporation, and whether an insolvency proceeding exists (the phoenix test needs that fact). The **courts / regulator / enforcement / adverse-media sweep on these names belongs to `12`**, which runs it once as the canonical company sweep. `07` does not duplicate it; where its grade depends on the outcome it marks the subject `pending-12-reconciliation` and `99` closes the loop |
| **E-B** | Other entities a register person directs | Registry + insolvency + securities/banking regulator + keyword battery |
| **E-C** | Address-cluster-only links with no second corroborator | Registry status + a scoped keyword pass — **escalate to E-A on any hit** |

Unlisted entities are swept per the **Unlisted / Private-Entity Sweep Protocol** in `frameworks/GOVERNANCE_DATABASES.md`. An unlisted entity filing nothing beyond its statutory minimum is the regime, not opacity (§27) — the finding must be specific.

### Address-cluster corroboration (Hard Rule)

**A shared registered address alone is a LEAD, not a relationship.** Co-working spaces, virtual offices, chartered-accountant offices and industrial estates cluster hundreds of unrelated companies; treating co-address as kinship manufactures a network that does not exist — the entity-level twin of the namesake error. Require a **second independent link** — common director, common founder, brand overlap, or an actual transaction — before recording a co-address entity as related. An uncorroborated co-address entity is recorded as a **lead with the ambiguity stated**: neither dropped, nor asserted as a relationship.

### Lineage & phoenix test (Hard Rule)

Where the company's own materials claim a history older than its incorporation, or reuse another entity's brands, **the predecessor is in scope at Tier E-A.** Test, in order:

1. Did the predecessor fail — insolvency, liquidation, strike-off, or a resolution process?
2. Did assets, brands, staff, address, products or customers continue into the current entity?
3. On what **disclosed legal basis and for what consideration**?

A clean acquisition through a formal process is a legitimate outcome and is recorded as such. The flag is continuity **without** a disclosed basis (RF-NET-002), or a related party re-buying the assets (the same round-trip A16-08 tests at the person level). **Two live entities trading on the same brand is a LEAD, not an automatic flag** — apply the D-4 corroboration test (`frameworks/GOVERNANCE_DATABASES.md`) first: compare jurisdiction, registration status, and class / goods-and-services scope, and require a second independent link (common director, common founder, address, transaction) before recording it as an unresolved ambiguity — possible business split, IP dispute, or informal succession. Unrelated proprietors legitimately register the same word in different territories or classes; that alone is never assumed benign, but it is also never flagged without the corroboration D-4 requires.

### Transitive-exposure grading (Hard Rule)

Cross-linkage changes what we know about a person; it does not invent a record against them. Both errors are banned, and CLAUDE.md §3 governs the wording — **a claim keeps its qualifier at every layer it travels.**

| Situation | Effect on the person's grade |
|---|---|
| **Hop-1** link (currently controls, directs, or transacts with) to an entity carrying a **Disqualifying-equivalent** fact — proven fraud, active debarment, sanctions match, fugitive status | Grade **floors at Material concerns** |
| **Hop-1** link to a **Material-equivalent** fact — an admitted insolvency or liquidation proceeding (India: CIRP admitted; elsewhere: the local equivalent — administration, Chapter 11, winding-up order, judicial management), live enforcement, or a credible fraud allegation | Grade **floors at Minor concerns** |
| **Hop-2** links | Inform the read and sit on the register; they do not float a grade on their own |
| **Exception (the one that matters):** a Disqualifying- or Material-equivalent fact attaching to the **founder or controller of a lineage / predecessor entity** | Treated as **hop-1-equivalent for the LISTCO**, because the listco's own lineage claim IS the direct link — the clause that reaches two hops out on the company's own say-so. It **fires RF-NET-003 in the band the fact itself falls in**, and that band's Score Cap row binds exactly as it would for a link to an entity: a Disqualifying-equivalent fact caps People & network integrity at 35 with Governance risk floored at 60; a Material-equivalent fact caps it at 50 with the floor at 55; either way, no rating above "Watchlist" until the linkage is explained by primary evidence. State the exposure as running through the **named founder and the lineage claim** — never as a record against the predecessor entity, which may itself be clean (§3) |

**Wording rule (Hard).** Every exposure-derived grade states, in the same sentence, that the basis is the linkage and not a record against the person — e.g. *"Minor concerns — no adverse record found against this person; the grade reflects their current directorship of {entity}, which is in {process}."* Two failures are banned in both directions:
- writing an exposure floor as though the person has the finding ("the CFO is linked to a fraud" when the fraud is the linked entity's and the person is not named in it);
- dropping a live linkage because "nothing was found against them personally."

**Gate interaction.** Exposure floors cap conviction and module confidence. They do **not**, by themselves, fail the Non-Negotiable Gate — the gate stays reserved for facts about *this* company's own controllers and KMP, consistent with the allegation-vs-proof rule below. An exposure floor that later resolves into a direct finding against the person is re-graded on that finding, not on the linkage.

### Scope-Boundary Register (Hard Rule)

Every in-scope subject not swept to its tier depth is listed **by name**, with:

| Subject | Why it is in scope | Why it was not swept | What would close it |
|---|---|---|---|

Permitted reasons are a fixed machine enum, used with the SAME spelling in this register, in `07`'s self-check, and in the Score Cap rows — `budget_exhausted` (the hop cap bound, or the overall query budget ran out), `breadth_budget` (the 25/15 breadth limit bound — this exact value keys the declared-overflow Score Cap row), `unreachable_database`, `branch_closed` (a Disqualifying-equivalent finding settled THAT branch — it justifies stopping that branch only, never the others), and `decision_settled` — available ONLY where a direct finding has actually failed the target company's Non-Negotiable Gate (a Disqualifying grade on this company's own controller/CEO/CFO/chair, or a Critical red flag against the company itself). 

*"A Disqualifying-equivalent finding was established elsewhere"* is **NOT** a reason to leave other branches unswept. An adverse fact on an independent director's branch, or on a linked entity, does not fail the target's gate under the transitive-exposure rule — so it settles nothing about the controller/KMP network, which is the part that decides the rating. Citing it to close unrelated branches is the failure mode this row exists to prevent, and every reason must be **stated**, never used silently. An unexpanded branch that is not on this register is a process failure against our own report (RF-NET-006).

### Provenance (Hard Rule)

Every subject is marked `filing-supplied`, `independently discovered`, or `user-supplied`. A subject first introduced by a user-uploaded note (channel checks, expert-call notes, management-meeting notes — CLAUDE.md §4 tier 9) is `user-supplied`: it was neither disclosed by the company nor discovered by the engine's own sweep, so forcing it into either of the other two categories would misstate both the coverage statistic below and, where the subject feeds A17-08, which party's disclosure obligation is actually being tested. **Independently discovered is NOT the same as undisclosed** — most of what discovery surfaces (a founder of a linked entity, a co-director, a charge-holder, an unrelated past directorship, an uncorroborated address lead) carries no disclosure obligation at all, and finding it is not a defect of the company.

So the delta is a **COVERAGE statistic** — how much of the network the filings alone would have shown — and it is reported as such. The disclosure-integrity FINDING is produced only by the A17-08 four-class test: each discovered subject is classified `not-disclosable` / `disclosable-and-disclosed` / `disclosable-and-omitted` / `obligation-unclear`, and only `disclosable-and-omitted` is a finding, with the obligation named. Report all three counts, labelled for what they are: `{n} independently discovered` (coverage), `{n} user-supplied` (neither party's disclosure gap), and `{n} disclosable-and-omitted` (the finding).

### Delta-refresh for the network

A rerun carries the Discovery Register forward — but **the self-observed discovery axes are ALWAYS re-run, unconditionally, and are never gated on already knowing they changed.** On every refresh, without exception:

- re-fetch the company's own About / History / Milestones pages (recipe D-1), and
- re-read the current registry identity fields (previous names, status, registered address, current directors).

Gating those on "a website change" would be circular: `07` is the only component that fetches the website, so a predecessor added to an About page after the last run could never satisfy the condition that would trigger the fetch, and would stay invisible indefinitely. Diff the re-fetched text against the prior run's Section 0A and state whether it moved.

Everything else follows the ordinary refresh rule: genuinely stable rows (a lineage question already closed on primary evidence, a founder already identified and swept) carry forward with their original as-of dates shown; a new name, a role change, a new filing, or any fresh hit triggers a full sweep for that subject. The same never-thin-coverage-silently rule as the person sweep applies.

---

## Person-Level Integrity Protocol (Hard Rule — agent 07, referenced by 05 and 99)

**Read this together with the Entity & Network Discovery Protocol above.** That protocol builds the subject list; this one sweeps it. The roster below is the FLOOR, not the ceiling: the discovery loop adds founders of linked entities, past controllers, and people surfaced by lineage or corroborated address clusters, and each of those is a full subject here.

The module builds a forensic dossier on EVERY named individual: each board director, each KMP (CEO, CFO, COO, Company Secretary, and any officer named in filings), and each promoter-group individual with ≥1% holding or an operating role. The roster comes from triage (`00`)'s Person Register; nobody on the register is skipped. This is the engine's implementation of §24 Filter 1: crooks are a reason to walk away, and the way you find a crook is to check the person, not the press release.

**Per-person dossier — required fields:**

1. **Identity block:** full name (+ variants), unique identifier (India: DIN; elsewhere: registry/officer ID), role, appointment date, age where disclosed.
2. **Directorship map:** every current and past directorship from the corporate registry — including struck-off, dormant, and shell entities — reconciled against what the filings disclose.
3. **Legal sweep:** criminal, civil, tribunal (NCLT/NCLAT or local), and consumer records, from the databases in `frameworks/GOVERNANCE_DATABASES.md`, each hit dated and cited.
4. **Regulatory sweep:** securities-regulator orders (debarment, disgorgement, settlement), banking-regulator lists (wilful defaulter, fraud-classified), disqualification registers, exchange actions.
5. **Sanctions/PEP screen:** OFAC/UN/EU lists, Interpol notices, political-exposure assessment.
6. **Credential check:** the claimed education/affiliations verified where possible.
7. **Adverse media:** dated, source-tiered, allegation-vs-conviction explicitly distinguished.
8. **Related-entity web:** family members' and associates' entities, cross-checked against RPT disclosures (feeds `09`).
9. **Grade:** Clean / Minor concerns / Material concerns / Disqualifying — with the single decisive fact.

**Grades.** *Clean* = swept, nothing material. *Minor* = stale, small, or peripheral items (an old dismissed case, a struck-off dormant shell with no creditors harmed). *Material* = unresolved criminal proceedings, regulator orders, wilful-defaulter listings, credible fraud allegations, undisclosed directorships/litigation — anything a rational minority holder would want to know before trusting this person with capital. *Disqualifying* = proven fraud on any stakeholder group, an active debarment/disqualification, or sanctions — for a controller/CEO/CFO/chair this fails the Non-Negotiable Gate and escalates per §24 Filter 1 / the disqualifier scan. **Exposure floors** from the Transitive-exposure grading rule (above) can RAISE a grade to Minor or Material on linkage alone — when they do, the dossier says so in the same sentence, and the grade is never written as though the person carries the linked entity's finding (§3).

**Namesake protocol (Hard Rule).** Common names collide. Before ANY adverse record is attributed to a person, anchor the match on the unique identifier (DIN or equivalent) or on ≥2 corroborating identifiers (company linkage, age, city, photo, co-parties). The IndiaMART precedent is instructive: a "Dinesh Agarwal" in political news was a different individual. An adverse record that cannot be anchored is recorded as "possible namesake — not attributed," never as a finding against the person. Attribution on a bare name-match is a protocol breach that the synthesis must treat as an upstream quality failure.

**Allegation ≠ conviction (Hard Rule).** Record the procedural posture verbatim: FIR/complaint filed → charges framed → trial → conviction/acquittal; petitioner vs respondent vs accused (the xlsx precedent again: a promoter appearing as PETITIONER in a writ petition is seeking relief, not being prosecuted — misreading party posture manufactures a false red flag). An allegation lowers confidence and raises follow-ups; only proven facts trip hard locks. Both directions matter: neither launder a conviction into "a legal matter," nor inflate a writ petition into "criminal proceedings against the CEO."

**"No result" ≠ "clean" (Hard Rule).** Every sweep logs: database, query used, date run, and result count — in the agent's Sweep Log. A person is "Clean (swept)" only when the sweep actually ran across the core databases for their jurisdiction; if a database was unreachable, the dossier says "coverage-limited: {database} unreachable {date}" and the People-integrity confidence is capped. Absence of a logged sweep means Insufficient Data, not Green.

**Tiering.** Registry/court/regulator records = tier 8 (regulator releases) or better per §4; reputable dated media = tier 10; forums/social (ValuePickr, Reddit, X) = below tier 10 — usable ONLY as §24 Filter 1 "buzz" to investigate, never as the sole basis for a Red flag. The buzz path: investigate → resolve (clear it or prove it) → if unresolved, RF-MGT-005 and the conviction cap.

---

## Legal & Regulatory Database Sweeps (Hard Rule — agents 07 and 12)

`frameworks/GOVERNANCE_DATABASES.md` is the canonical registry of public legal/regulatory databases, per jurisdiction, with query recipes, fallback chains, and caveats. Agents `07` (persons) and `12` (the company) run their sweeps from that registry; other agents cite it when a checklist item needs a database fact (e.g., 08 checking the audit firm's disciplinary record).

- **Detect the jurisdiction first** (§27, from triage 5A) and sweep that jurisdiction's core set; add the US/global set for cross-listed companies and globally active people.
- **Primary registry beats aggregator.** MCA beats Zauba/Tofler; EDGAR beats a news summary. Use aggregators to DISCOVER, then confirm on the primary source where possible; cite what you actually read (§5).
- **Date every lookup.** A sweep is a snapshot: `[Indian Kanoon search "{name}", 2026-08-13, 3 results]`.
- **Fallback chains.** If a primary database is unreachable (captcha, downtime), use the registry's listed fallback and record the substitution. If the whole chain fails, record coverage-limited — never silently skip.
- **Web tiering still applies.** Database records are cited as what they are (court record, regulator release) with dates; they do not become "filings."
- **The reconciliation duty.** What the databases show is compared against what the filings disclose (A9-10, A16-02, A16-13). A material fact visible in public records but absent from filings is a disclosure-integrity finding — often more decision-relevant than the underlying fact itself.

**Sweep budget, tiering & delta-refresh (Hard Rule — depth follows materiality; a rerun refreshes, it does not restart).**
- **Role-tiered depth.** Sweep depth is proportional to the person's power over the company's capital: **Tier A** (controller/promoter individuals, CEO, CFO, board chair, company secretary) = the FULL core set for their jurisdiction plus the global overlay. **Tier B** (other executive/non-independent directors, named KMP) = the core registry + courts + securities-regulator set. **Tier C** (independent directors, minor promoter-group holders with no operating role) = registry/directorship map + disqualification + securities-regulator screen + a scoped adverse-media pass; escalate any Tier-C person to a full sweep the moment a hit or a cross-link to a Tier-A person appears. The dossier states each person's tier and records the core integrity axes NOT run at Tier C (criminal/tribunal A16-04/05, wilful-defaulter A16-07, insolvency A16-08, sanctions A16-09) as "not assessed (Tier-C scope) — Insufficient Data," never graded Clean on those axes, and caps People-integrity confidence accordingly; a Tier-C scope is a stated, coverage-limited scope, not a swept-clean result.
- **Delta-refresh across runs.** If a prior run's `07_people-integrity-dossiers.md` exists for this ticker (any prior dated run folder), REUSE it: people unchanged in role get a REFRESH — re-run only the volatile axes (litigation, regulator actions, exchange actions, adverse media, pledge-linked structures, and the current directorship/registry map — re-queried every refresh) for the window since the prior sweep date, and carry forward the stable axes (identity anchor, credential verification, CLOSED historical directorships, past-failure associations) with their original as-of dates clearly shown. A NEW person, a role change (e.g., director → CFO), or any fresh hit triggers a full sweep for that person. The dossier's Coverage column says "full sweep {date}" or "refresh of {prior date}, volatile axes {date}". The same rule applies to `12`'s company-level sweep (refresh enforcement/fines/ratings since the prior run; carry the historical record forward, dated).
- **Exact-resume boundary overrides cross-run refresh.** When `NOSTRA_EXACT_MODULE_RESUME=1`, the cockpit has staged, published, fingerprinted, and read-locked only the current run root and the modules named in `NOSTRA_EXACT_MODULE_INPUTS`. Agents `07`, `12`, and `99` MUST NOT Glob, search, or read a prior-dated management-governance folder in that mode: `07` and `12` run a full current sweep, and `99` reports that the historical delta was not read for this exact scoped resume. Likewise, every specialist that self-resolves balance-sheet-survival (`10`, `11`, or `12`) may use it only when `balance-sheet-survival` is both allowlisted and present in the current run root; otherwise it proceeds from the data pool and states that the cross-module input was unavailable. This safety boundary overrides the ordinary delta-refresh rule above.
- **Entities are tiered and budgeted the same way.** The Entity & Network Discovery Protocol's E-A / E-B / E-C tiers and its hop budget (default hop 2, hop 3 only along a Material-or-worse branch) govern entity sweeps exactly as A/B/C governs person sweeps. A rerun carries the Discovery Register forward; the self-observed axes (the company's own About/History fetch and the current registry identity fields) are re-run UNCONDITIONALLY on every refresh, and the rest re-runs on a new name, a role change, a new filing, a fresh hit, or a new lineage claim — see **Delta-refresh for the network** in that Protocol, which is canonical.
- **Never trade rigor for the budget silently.** A sweep cut short by rate limits or outages is coverage-limited (caps apply) — the budget shapes WHERE depth goes, never whether gaps are admitted.

---

## Non-Negotiable Gate (Hard Rule — computed by 99)

The checklist carries a single PASS/FAIL gate, reported at the top of the synthesis. The gate **FAILS** if ANY of the following holds:

1. `business-model/01_disqualifier-scan` flagged a hard disqualifier (deference — reported verbatim).
2. Any **Critical** red flag fired in this module (per the Red-Flag Trigger Engine severity rules).
3. Any controller, CEO, CFO, or board chair is graded **Disqualifying** in the person dossiers (07).
4. A material undisclosed legal/regulatory matter was found (A9-10 / A16-04 Red on the undisclosed prong).

**Allegations do not fail the gate (consistency with the Person-Level Integrity Protocol).** An unresolved charge, arrest, FIR, or fraud ALLEGATION against a person is graded **Material concerns** and its red flag (RF-PPL-001) fires at **High** severity — it caps conviction (no rating above "Watchlist") but does NOT trip gate condition 2. Critical severity on the person axis is reserved for PROVEN facts: a conviction or adjudicated finding, an active debarment/disqualification/sanctions match, or fugitive/absconder status — the same facts that make a grade Disqualifying (condition 3). The gate locks on proof; allegations lower confidence and cap, per §13's "unless explicitly resolved by primary evidence" and the Protocol's allegation ≠ conviction rule. The one exception stays: an allegation-stage matter that the company CONCEALED (the undisclosed prong, condition 4) fails the gate on the concealment, not the allegation.

Gate FAIL forces: Governance risk ≥ 80, Governance Rating no better than "Weak," stewardship verdict no better than "Serious governance concerns" — consistent with the existing cap rules; the gate adds no new lock, it makes the existing locks legible as one line. Gate PASS is reported with the count of items answered. The gate is computed from evidence rows, never from vibes (§12).

---

## Hard Self-Check (canonical — every agent applies before returning)

- [ ] Every material claim appears in the Universal Findings Table.
- [ ] Every non-NA finding has evidence; every citation has source, period, and page/section/date where available.
- [ ] Every Amber or Red finding has a follow-up question.
- [ ] Every Red finding has a red-flag decision and a Red Flag ID where applicable.
- [ ] Every score is traceable to specific rows.
- [ ] No vague verdicts without raw values.
- [ ] No US-only filing assumptions for non-US companies (jurisdiction map applied).
- [ ] Missing data is marked "Insufficient Data," not guessed.
- [ ] The narrative summary introduces no uncited claim.

The synthesis (`99`) downgrades data quality and confidence if any upstream agent fails this.

---

## Evidence Citation Format

Every "Evidence" cell uses this format:

`[Source, Period, Page or Section]`

Examples:
- `FY24 DEF 14A, Compensation Discussion & Analysis`
- `FY24 DEF 14A, Beneficial Ownership table`
- `FY24 10-K, Note 19 (Related Party)`
- `FY23 Shareholder Letter (promise)` vs `FY24 10-K (outcome)`
- `Capital IQ Insider Transactions, data as of 2026-05-09`
- `Web: Form 4 filing, 2026-04-15 (unverified)`

Do NOT write "company filings" or "the proxy" alone — those are not citations.

---

## Calculation & Assessment Standards

1. Always state the reporting currency and the period.
2. **Capital-allocation scorecard:** for each use of capital over 3–5 years, state the amount and the per-share outcome:
   - M&A: price paid, what it added, and whether disclosed returns/synergies materialized.
   - Buybacks: dollars spent, average price paid, and whether that price was below a defensible value (buying low vs buying high).
   - Dividends: payout ratio, coverage, growth, and whether sustainable.
   - Organic reinvestment: incremental ROIC (`Δ NOPAT / Δ invested capital`) where computable.
   - Debt: raised/repaid and to what end.
3. **Incentive alignment:** state the actual performance metrics in the bonus/LTIP, their weights, and whether they are per-share/returns-based (ROIC, EPS, TSR) or size-based (revenue, absolute EBITDA, deal count). Note pay magnitude vs performance and vs peers where data allows.
4. **Ownership:** state insider/promoter ownership %, whether shares were bought or merely granted, recent net insider buying/selling (12 months), and any pledging.
5. **Control structure:** flag dual-class / super-voting, controlled-company status, and any shareholder bloc with board-nomination or veto rights.
6. **Candor:** compare specific prior-period promises/guidance to actual outcomes; note non-GAAP aggressiveness (cross-check `earnings/06_earnings-quality`) and whether misses were owned or obscured.
7. Show the basis for every judgment. A reader must be able to trace each score to evidence.

---

## Evidence, Verdict & Confidence Schema (Hard Rule)

Every material finding in this module must be an auditable row, not a loose label. For each finding, capture:

- **Standardized verdict:** Green / Amber / Red / Not Applicable / Insufficient Data.
- **Raw value + unit:** the actual number (e.g., "66.7% independent," "RPT = 3.1% of revenue," "$190M tax dispute") — never just "Good/High/Low."
- **Current vs prior + trend:** Improving / Stable / Deteriorating / Not enough history.
- **Peer verdict:** Better than peers / In line / Worse than peers (where a peer set exists).
- **Source + as-of date:** a real citation (filing, page/note, date) — never the word "Source" alone.
- **Confidence (1–5):** by source quality (tiers below).
- **Materiality:** Low / Medium / High / Critical (thresholds below).

A finding may NOT be marked Red on existence alone — it must clear a materiality threshold. Replace every vague label ("strong," "good," "high") with a measurable criterion. Separate fact (evidence) from interpretation (your read). Use "Insufficient Data" rather than guessing; flag stale or source-conflicting data and lower the confidence. **Cite the document's PRINTED page number or named section (fix F27)** — NOT a PDF byte/stream offset (a 4–5-digit "page" like p.6382 in a 300-page report is an extraction artifact, not a real citation a reader can find).

**Confidence tiers (1–5)** *(a governance-source heuristic, not the financial-data hierarchy; consistent with CLAUDE.md §4's allowance for module-specific tiers — filings still rank above transcripts above unverified, and the canonical vendor-data ordering lives in §4 and the financial modules; fix F14):* annual report / exchange filing = 5; auditor report / notes to accounts = 4; investor deck / transcript = 3; rating agency / proxy advisor / reputable news = 2; social / employee-review / unverified = 1.

---

## Universal Findings Table (Hard Rule)

Every specialist agent (01–06) MUST output a Universal Findings Table. Every material claim in its narrative must also appear as a row here — the narrative summarizes this table and introduces no uncited claim. Columns:

| Finding ID | Section | Question / Test | Standardized Verdict | Raw Value | Unit | Current Period | Prior Period | Trend | Peer Benchmark | Peer Verdict | Score | Max Score | Penalty | Confidence 1–5 | Materiality | Evidence | As-of Date | Analyst Interpretation | Red Flag Triggered? | Red Flag ID | Follow-up Required |
|---|---|---|---|---:|---|---|---|---|---|---|---:|---:|---:|---:|---|---|---|---|---|---|---|

- **Finding ID** = `{NN}-{nnn}` (agent number + sequence), e.g. `03-001`.
- **Standardized Verdict** ∈ {Green, Amber, Red, Not Applicable, Insufficient Data}.
- **Raw Value** numeric where possible; no vague labels ("Good/High/Low/Strong") without a measurable value.
- Every non-NA row has **Evidence** in the MODULE_RULES citation format and an **As-of Date**.
- Every **Amber/Red** row has a Follow-up; every **Red** row states whether a formal red flag is triggered and its **Red Flag ID** (registry below) if applicable.
- Missing data → "Insufficient Data" (never guessed).

## Source Log (Hard Rule)

Every agent ends with a Source Log. No evidence without a source-log entry; no source-log entry without a use. If sources conflict, show the conflict and lower confidence. If a source is stale, mark it stale.

| Source ID | Source Type | Filename / Filing | Period | Page / Section | Date | Confidence 1–5 | Used For |
|---|---|---|---|---|---|---:|---|

## Machine-Readable Outputs (Hard Rule)

Markdown alone is not enough. Each specialist emits, at the END of its report, a fenced ```json block: an array of finding objects (one per Universal Findings Table row) using this schema:

```
{ "finding_id":"", "ticker":"", "date":"", "agent":"", "section":"", "question":"",
  "standardized_verdict":"", "raw_value":null, "unit":"", "current_period":"", "prior_period":"",
  "trend":"", "peer_benchmark":"", "peer_verdict":"", "score":null, "max_score":null, "penalty":null,
  "confidence_1_to_5":null, "materiality":"", "evidence":"", "source_id":"", "source_type":"",
  "source_date":"", "as_of_date":"", "analyst_interpretation":"", "red_flag_triggered":false,
  "red_flag_id":"", "follow_up_required":"" }
```

The synthesis (`99`) consolidates these and emits, as fenced blocks, `governance_summary.json`, `governance_findings.csv`, `red_flags.csv`, and `source_log.csv`. The standalone command writes those blocks to disk as sidecar files (subagents return inline; the orchestrator owns file IO). If a block cannot be produced, mark that export "pending" — never omit it silently.

---

## Materiality Thresholds (Hard Rule)

Do not flag something Red just because it exists. Size it.

| Item | Low | Medium | High | Critical |
|---|---|---|---|---|
| Legal / regulatory exposure | <0.5% of net worth or PAT | 0.5–2% | 2–5% | >5%, or an ADJUDICATED criminal/fraud finding (an unresolved allegation is High, not Critical — the Person-Level Integrity Protocol's allegation ≠ conviction rule; only proven facts reach the Critical/gate path) |
| Related-party transactions | <1% of revenue/assets | 1–5% | 5–10% | >10%, opaque, recurring, or promoter-linked |
| CFO / PAT (or CFO / EBITDA) | ≥80% (Green) | 60–80% (Amber) | <60% (Red) | profits rising while cash conversion falls for multiple years |
| Receivables | aging stable, in line with industry (Green) | growing faster than revenue (Amber) | >6-month receivables rising sharply / concentrated with related parties (Red) | — |

For the forensic inputs above (CFO/PAT, receivables), use the figures from `earnings/06_earnings-quality` and `earnings/01_historical-financials` — do not recompute them; apply the governance lens (is this a candor or leakage signal?).

---

## Analyst Follow-Up & Peer Benchmark (Hard Rule)

- **Follow-ups:** every Red or Amber finding must carry at least one analyst follow-up question (one-off or recurring? material to earnings/cash/valuation? disclosure adequate? company-specific or sector-wide? affects minority holders? does management's explanation hold?).
- **Peer benchmark:** where `business-model/08_competitive-map` provides peers, benchmark the key governance metrics (board independence, insider/promoter holding, pledge, auditor / non-audit fees, RPT intensity, contingent liabilities, AGM votes-against) against 3–5 peers and assign a peer verdict. If no peer set is available, state "No peer set — relative governance not assessed."

---

## Scoring Rules

All scores are out of 100, whole numbers. Bands:

| Band | Meaning |
|---|---|
| 0–20 | Very weak / very high risk / unknown |
| 21–40 | Weak / high risk |
| 41–60 | Mixed / average |
| 61–80 | Strong / low risk |
| 81–100 | Very strong / very low risk / very clear |

### Management-Governance Module Scores

| Score | Direction | What it measures |
|---|---|---|
| Management quality /100 | higher = better | Track record and execution vs stated plans |
| Capital allocation /100 | higher = better | Historical per-share value creation from capital deployed |
| Incentive alignment /100 | higher = better | Whether pay rewards per-share value vs size/empire-building |
| Shareholder friendliness /100 | higher = better | Board independence, voting rights, minority-shareholder protection |
| Disclosure candor /100 | higher = better | Truth-telling in good and bad times |
| People & network integrity /100 | higher = better | The person-dossier read across every director/KMP/promoter, PLUS the completeness of the entity/lineage discovery loop and the network reconciliation against filings (07). *Formerly "People integrity" — same 0.11 weight in the composite; the network components were folded in rather than added as a separate score* |
| Audit & assurance quality /100 | higher = better | Auditor calibre, independence, opinions, internal/secretarial audit (08) |
| RPT & leakage risk /100 | **higher = WORSE** (inverted) | Related-party value leakage and group-structure risk (09) |
| Contingent-liability risk /100 | **higher = WORSE** (inverted) | Off-P&L obligations, crystallization, provisioning honesty (10) |
| Accounting-forensics risk /100 | **higher = WORSE** (inverted) | Manipulation-pattern evidence across the forensic flags (11) |
| Legal & regulatory risk /100 | **higher = WORSE** (inverted) | Enforcement, litigation, compliance hygiene, undisclosed matters (12) |
| Governance risk /100 | **higher = WORSE** (inverted) | Red flags: control abuse, related-party, pledging, restatements, entrenchment |
| Data quality /100 | higher = better | Completeness of governance-relevant data (proxy, ownership, comp) |
| Overall usefulness /100 | higher = better | How useful this module is for the master synthesizer |
| Checklist coverage % | higher = better | Registry items answered (Green/Amber/Red) ÷ total items — reported, and <50% caps Data quality at 60 |

**Inverted scores are flagged explicitly** in every table header that uses them.

Be strict. High scores require evidence of action, not narrative. Default to the middle band when uncertain.

### Composite Governance Score & Rating (Hard Rule)

First compute the conservative checklist-risk roll-up — the WORST of the four inverted checklist risks, because a red flag is never averaged away (§12):

`Checklist Risk = max(RPT & Leakage Risk, Contingent-Liability Risk, Accounting-Forensics Risk, Legal & Regulatory Risk)`

Then roll the specialist scores into a single **Governance Score /100** using this exact formula:

`Governance Score = 0.14×Capital Allocation + 0.11×Incentive Alignment + 0.11×Shareholder Friendliness + 0.10×Disclosure Candor + 0.11×Management Quality + 0.09×Audit & Assurance Quality + 0.11×People & Network Integrity + 0.11×(100 − Governance Risk) + 0.12×(100 − Checklist Risk)`

(The weights sum to 1.00; the two risk terms are inverted, so use `100 − risk`.) **Missing-component treatment:** the prior six-component formula (`0.20×CapAlloc + 0.18×Incentive + 0.18×ShFriendliness + 0.16×Candor + 0.16×MgmtQuality + 0.12×(100 − GovRisk)`) is used ONLY when ALL of the new specialist scores (07–12) are absent — a genuinely pre-expansion run. In a PARTIAL run (some of 07–12 completed), keep the nine-component formula and enter each missing component conservatively: a missing positive score (People & network integrity, Audit & assurance) enters at 50 (mid-band), and a missing inverted risk enters the Checklist Risk max at 40 (unknown is not safe — consistent with the sweep-not-run floor); cap the Confidence Score at 80 and name every substituted component. Never discard completed specialists' scores because a sibling is missing, and never fabricate a missing one as clean. Then compute:

`Confidence-Adjusted Governance Score = Governance Score × (Confidence Score / 100)`

Map the Governance Score to a **Governance Rating**: 85–100 Excellent · 70–84 Good · 55–69 Watchlist · 40–54 Weak · below 40 Avoid / High Governance Risk.

Report separately: **Confidence Score /100** (from the source-quality tiers), **Red-Flag Count**, and **Critical Red-Flag Count**. If a hard disqualifier is flagged (see Disqualifier Deference) OR a Critical red flag fires, the Governance Rating must be **no better than "Weak"** and the stewardship verdict **no better than "Serious governance concerns."**

---

## Red-Flag Trigger Engine (Hard Rule)

The following events are automatic red flags. When any is present, the synthesis lists it with: trigger, evidence (source + date), severity (High / Critical), and impact on the governance score. Count them (and the critical ones) in the verdict block.

- Auditor resignation before term end; modified audit opinion; recurring Key Audit Matters; ICFR weakness
- CFO, Company Secretary, or Compliance Officer resignation (especially sudden / unexplained)
- Independent-director resignation, especially citing concerns
- Promoter pledge increase; promoter stake sale (especially before bad news)
- Related-party transactions above the High/Critical materiality threshold; large loans / guarantees to related parties
- CFO/PAT (or CFO/EBITDA) below 60%, especially persistent (from `earnings/06`)
- Sharp, unexplained receivables increase or concentration with related parties
- Material contingent liability (>5% of net worth); goodwill impairment
- SEBI / ED / MCA / SEC / DOJ / exchange enforcement action; repeated regulatory penalties; delayed results
- High non-audit fees vs audit fees; sudden accounting-policy change; restatement
- High AGM votes-against (remuneration, RPT, director / auditor reappointment)
- Insider selling before weak results; unexplained price / volume move before an announcement
- Large acquisition with vague rationale; cash trapped in subsidiaries; management commentary contradicting the numbers

Severity uses the materiality thresholds. A Critical red flag (an adjudicated/proven fraud finding, going concern, enforcement, restatement, RPT leakage >10%) forces the rating to **no better than "Weak"** and the verdict to **no better than "Serious governance concerns."**

### Red-Flag ID Registry

Every Red finding cites a Red Flag ID. Severity uses the Materiality Thresholds.

| ID | Trigger |
|---|---|
| RF-AUD-001 | Auditor resignation before term end |
| RF-AUD-002 | Modified audit opinion |
| RF-AUD-003 | Emphasis of matter / adverse CARO / adverse secretarial-audit issue |
| RF-MGT-001 | Sudden CFO resignation |
| RF-MGT-002 | Sudden Company Secretary / Compliance Officer resignation |
| RF-MGT-003 | Management changes a KPI after underperformance |
| RF-MGT-004 | Turnaround claimed without ≥2–3 yrs of delivered operating inflection (§24 Filter 2) |
| RF-MGT-005 | Unresolved adverse integrity "buzz" routed from `business-model/01_disqualifier-scan`, not cleared and not proven (§24 Filter 1) |
| RF-OWN-001 | Promoter pledge above threshold |
| RF-OWN-002 | Promoter pledge increased QoQ |
| RF-OWN-003 | Promoter stake sale before weak result / adverse announcement |
| RF-OWN-004 | Structurally unaligned controlling owner — government control, listed subsidiary of a value-maximizing parent, or sprawling unrelated conglomerate (§24 Filter 6) |
| RF-RPT-001 | RPT above High/Critical threshold |
| RF-RPT-002 | Promoter-linked RPT above threshold |
| RF-RPT-003 | Loans / advances / guarantees to related parties |
| RF-FIN-001 | CFO/PAT below 60% |
| RF-FIN-002 | Receivables growing faster than revenue |
| RF-FIN-003 | Contingent liability above 5% of net worth |
| RF-FIN-004 | Goodwill impairment |
| RF-REG-001 | SEBI / SEC / MCA / ED / exchange enforcement |
| RF-REG-002 | Delayed results or delayed material disclosure |
| RF-SHR-001 | High votes against a key resolution |
| RF-SHR-002 | Controversial preferential allotment / warrants / dilution |
| RF-MKT-001 | Insider selling before weak result |
| RF-MKT-002 | Unusual price / volume before announcement |
| RF-CAP-001 | Large acquisition with vague rationale |
| RF-CAP-002 | Buybacks not reducing share count |
| RF-CAP-003 | Dividends not covered by FCF |
| RF-CAP-004 | Serial-acquirer / value-destructive M&A pattern, esp. debt-funded near/above own value (§24 Filter 4) |
| RF-DISC-001 | Management commentary contradicts the numbers |
| RF-DISC-002 | Recurring "one-off" adjustments |
| RF-PPL-001 | Criminal proceedings / arrest / fugitive-economic-offender action touching a controller or KMP (A16-04) |
| RF-PPL-002 | Securities-regulator order (debarment / disgorgement / fraud finding) against a person (A16-06) |
| RF-PPL-003 | Wilful-defaulter or fraud-classified-borrower listing — person or their entities (A16-07) |
| RF-PPL-004 | Active director disqualification / bar, or multiple DINs (A16-03, A16-01) |
| RF-PPL-005 | Undisclosed directorships, litigation, or related entities found in the registry sweep (A16-02, A16-13) |
| RF-PPL-006 | Sanctions / watchlist match, or an undisclosed PEP conflict (A16-09, A16-10) |
| RF-PPL-007 | Fabricated credentials — affirmative contradiction, not a mere verification gap (A16-11) |
| RF-PPL-008 | "Smart rat" resignation pattern or repeated association with accounting failures (A16-17, A16-18) |
| RF-NET-001 | Undisclosed predecessor / lineage entity — a self-disclosed "formerly / erstwhile / part of ___" claim, a former name, or a claimed history older than the entity, absent from the filings (A17-02) |
| RF-NET-002 | Phoenix pattern — assets, brands, staff, address or customers continued out of a failed, struck-off or resolved entity with no disclosed legal basis or consideration (A17-03) |
| RF-NET-003 | Live hop-1 cross-link from a register person or the listco to an entity carrying EITHER (a) a **Disqualifying-equivalent** fact — proven fraud, active debarment, sanctions match, or fugitive/absconder status — OR (b) a **Material-equivalent** fact — an admitted insolvency or liquidation proceeding (India: CIRP; elsewhere the local equivalent), live enforcement, or a credible fraud allegation (A17-07). The two fact sets are exactly those in the Transitive-exposure grading rule and the two banded Score Cap rows, so the flag, the grade and the cap always cover the same facts. **The trigger fires equally where the fact attaches to the FOUNDER or controller of a lineage / predecessor entity rather than to the entity itself** — the listco's own lineage claim is the direct link, so that person's record is a hop-1 exposure of the listco (Transitive-exposure grading rule, lineage exception). Record which band fired, with the exposure basis named — the named person and the lineage claim, never as a personal finding against the listco and never as a record against a predecessor that is itself clean (§3) |
| RF-NET-004 | A **core or otherwise material** brand or trademark the company trades under sits outside the listco on ADVERSE terms — owned by a controller-linked entity; licence terms, fee basis or duration undisclosed; used with no identifiable licence at all; the licence in dispute or terminable at short notice while material revenue depends on it; or the same marks in live use by an unrelated company AND the D-4 corroboration test (jurisdiction, status and class overlap, plus a second independent link) is satisfied (A17-04). *Does NOT fire on external ownership alone: a disclosed, arm's-length, durable third-party licence is the normal franchisee / licensed-brand structure and is graded Green. Does NOT fire on a bare wordmark match across different territories or classes with no second independent link — that is a D-4 lead, not a trigger* |
| RF-NET-005 | Undisclosed registered-address-cluster entity with a corroborated second link that ALSO engages a disclosure obligation — classified `disclosable-and-omitted` per the A17-08 four-class test (A17-05) |
| RF-NET-006 | Discovery truncated with no Scope-Boundary declaration — a process flag against our own report, not against the company (A17-01, A17-09) |
| RF-AUD-004 | Non-audit fees ≥ audit fees, or prohibited services rendered by the auditor (A4-06) |
| RF-AUD-005 | Material components audited by unknown firms or left unaudited (A4-03, A4-14) |
| RF-AUD-006 | Gatekeeper exit cluster — CFO + auditor/CS within 12 months (A4-15) |
| RF-AUD-007 | Regulator discipline of the audit firm / signing partner — NFRA / PCAOB / ICAI order or debarment (A4-13) |
| RF-CL-001 | Contingent liabilities above the High/Critical threshold or doubling YoY (A7a-01, A7a-02) |
| RF-CL-002 | Probable losses carried unprovided through serial appeal losses (A7a-14) |
| RF-CL-003 | Repeated crystallization of contingencies — provisions were understated (A7a-13) |
| RF-ACC-001 | Beneish M-score / Dechow F-score in the manipulator zone (A8-14, A8-17) |
| RF-ACC-002 | Cash-authenticity failure — implied yield or confirmation basis (A8-19) |
| RF-ACC-003 | Paper-revenue signal — growth uncorroborated by cash taxes / collections, or mark-to-model revenue (A8-15) |
| RF-ACC-004 | Securities issued in an accrual-flagged year (A8-18) |
| RF-ACC-005 | Regulator-found divergence or directed forensic audit (A8-20) |
| RF-CMP-001 | Undisclosed material litigation — found in court records, absent from filings (A9-10) |
| RF-CMP-002 | Attack-the-messenger response to whistleblowers / short-sellers (A9-11) |
| RF-CMP-003 | Insider-trading / trading-window violations by KMP or promoter (A9-07) |
| RF-CMP-004 | Abrupt multi-notch downgrade, non-cooperation tag, or rating withdrawal with debt outstanding (A9-05) |

Each Red finding records: Red Flag ID, trigger, severity, evidence, score impact, and a follow-up question. Checklist-specific triggers use the new IDs above; where a trigger already had a canonical ID (pledge = RF-OWN-001/002, RPT = RF-RPT-001/002/003, auditor resignation = RF-AUD-001, delayed disclosure = RF-REG-002, and so on), keep using the canonical ID so cross-module roll-ups converge.

---

## Stewardship Verdict Categories

The synthesis agent must pick exactly one:

- **Owner-operator / exemplary stewards** — meaningful insider ownership, a record of per-share value creation, returns-based incentives, clean governance, candid in bad times
- **Aligned & competent** — generally shareholder-aligned with a solid record and acceptable governance; minor flags
- **Standard / mixed** — neither a clear positive nor a clear negative; conventional comp and governance, an unremarkable record
- **Misaligned or weak stewardship** — size-based incentives, value-destructive capital allocation, thin alignment, or weak candor
- **Serious governance concerns** — control abuse, related-party leakage, entrenchment, or a pattern of misleading disclosure (note any hard disqualifier flagged by `business-model/01_disqualifier-scan`)
- **Insufficient data** — cannot assess stewardship (e.g., no proxy / no ownership / no comp data)

---

## Partial-Data Rules

When specific data is missing, the affected agents must cap their output as described:

| Missing Data | Affected Agents | Rule |
|---|---|---|
| No proxy / compensation disclosure | 03, 99 | Incentive alignment not assessable; cap and flag |
| No ownership / insider-transaction data | 04, 99 | Ownership and insider-behavior read limited; cap |
| No board disclosure | 05, 99 | Board independence/rights not assessable; cap |
| No multi-year history | 02 | Capital-allocation scorecard limited to the latest period; flag |
| No transcripts or prior letters | 01, 06 | Promise-vs-delivery and candor read limited to filings |
| Legal/regulatory databases unreachable (web sweep could not run) | 07, 12, 99 | Person dossiers and legal sweep are "coverage-limited" — graded on filings alone, confidence capped, NEVER presented as swept-and-clean |
| No related-party note / RPT disclosure | 09, 99 | RPT quantification not assessable; that absence is itself an Amber finding on disclosure |
| No contingent-liability note | 10, 99 | CL read limited to what the auditor's report reveals; cap |
| No auditor-fee / audit-detail disclosure | 08, 99 | Audit-quality read limited; A4-06/07 Not Available with reason |
| Under 2 years of financial history | 11, 99 | Beneish/Dechow year-over-year components not computable; run the single-year checks only and state it |

---

## Score Cap Rules

When data is missing or weak, these hard caps override an agent's own scoring. The synthesis agent applies all applicable caps.

| Missing / Weak Data | Score Cap |
|---|---|
| No proxy / compensation disclosure | Incentive alignment max 50; Overall usefulness max 70 |
| No ownership / insider-transaction data | Shareholder friendliness max 60 |
| No multi-year capital-allocation history | Capital allocation max 65 |
| No prior promises/guidance to check against | Disclosure candor max 65 |
| A hard disqualifier is flagged by `business-model/01_disqualifier-scan` | Governance risk floor 80 (i.e., score ≥80); Overall verdict cannot exceed "Serious governance concerns" |
| **Turnaround thesis without ≥2–3 yrs of delivered operating inflection** (§24 Filter 2) | Management quality max 60; note conviction cap; classify as governance-turnaround |
| **Serial-acquirer pattern** — multiple material deals, esp. debt-funded near/above own value (§24 Filter 4) | Capital allocation max 50; Governance risk floor 60; RF-CAP-004 |
| **Structurally unaligned controlling owner** — government control, listed subsidiary of a value-maximizing parent, or sprawling unrelated conglomerate (§24 Filter 6) | Shareholder friendliness max 55; Governance risk floor 55; RF-OWN-004; value-trap note to valuation |
| **Unresolved adverse integrity signal** routed from `business-model/01_disqualifier-scan` and not cleared (§24 Filter 1) | Management quality max 60; Disclosure candor max 60; RF-MGT-005; conviction cap — no rating above "Watchlist" until the signal is cleared by primary evidence or escalates to the hard disqualifier lock (no hard lock at this stage unless proven) |
| **Checklist coverage <50%** (registry items answered ÷ total) | Data quality max 60; Confidence Score max 60 — a checklist mostly made of "Not Available" is not a governance read |
| **No auditor-fee / audit-detail disclosure** (A4-06/07 Not Available) | Audit & assurance quality max 65; Confidence Score max 80 — economic independence unassessable caps the audit read numerically, not just in prose |
| **Legal-database sweep did not run** (07/12 coverage-limited) | People & network integrity max 65; Legal & regulatory risk floor 40 (unknown is not safe); Confidence Score max 70 |
| **No related-party note / RPT disclosure** (A5 not quantifiable) | RPT & leakage risk floor 40 (unknown is not safe); Confidence Score max 80 |
| **No contingent-liability note** (A7a not quantifiable) | Contingent-liability risk floor 40 (unknown is not safe); Confidence Score max 80 |
| **Any person graded "Disqualifying"** who is a controller, CEO, CFO, or board chair | Non-Negotiable Gate FAIL: Governance risk floor 80; rating no better than "Weak"; verdict no better than "Serious governance concerns"; escalate per §24 Filter 1 |
| **Person graded "Material concerns"** (controller or KMP), unresolved | People & network integrity max 50; Governance risk floor 55; conviction cap — no rating above "Watchlist" until resolved |
| **Undisclosed material litigation / related entity found in the sweep** (RF-CMP-001 / RF-PPL-005) | Disclosure candor max 50; Governance risk floor 60 — the non-disclosure outweighs the underlying item |
| **Entity/network discovery loop did not run** — no Discovery Register, or Phase 2 (founder loop) never ran (A17-01) | People & network integrity max 60; Confidence Score max 75 — a roster taken from the filings' own list is a profile, not a check |
| **Undisclosed predecessor / lineage entity, or phoenix continuity with no disclosed basis** (RF-NET-001 / RF-NET-002) | Disclosure candor max 50; Governance risk floor 60 — same logic as RF-PPL-005: the non-disclosure outweighs the underlying item |
| **Live hop-1 cross-link to an entity carrying a Disqualifying-equivalent fact** — proven fraud, active debarment, sanctions match, fugitive status (RF-NET-003) | People & network integrity max 35; Governance risk floor 60; conviction cap — no rating above "Watchlist" until the linkage is explained by primary evidence |
| **Live hop-1 cross-link to an entity carrying a Material-equivalent fact** — an admitted insolvency or liquidation proceeding (India: CIRP; elsewhere the local equivalent), live enforcement, credible fraud allegation (RF-NET-003) | People & network integrity max 50; Governance risk floor 55; conviction cap — no rating above "Watchlist". *The two RF-NET-003 rows mirror the two bands of the Transitive-exposure grading rule, so the flag and the cap can never disagree about severity* |
| **Discovery truncated with no Scope-Boundary declaration** (RF-NET-006) | Data quality max 60; Confidence Score max 70 — a check that silently stopped reads as complete when it is not |
| **Core / material brands owned by a CONTROLLER-LINKED entity** (RF-NET-004) | RPT & leakage risk floor 55 — a controller on the other side of the licence is a related-party channel whether or not a fee is currently charged; `09` prices it under A5-02 and states the rate, or states that no fee is disclosed |
| **Core / material brands owned outside the group with NO disclosed licence terms, or with no identifiable licence at all** (RF-NET-004) | RPT & leakage risk floor 50; Disclosure candor max 65 — terms nobody can see cannot be judged arm's-length |
| **Core / material brand licence in dispute, or terminable at short notice, while material revenue depends on it** (RF-NET-004) | RPT & leakage risk floor 45; note to valuation as a going-concern-adjacent dependency — this is a durability finding, not a leakage finding, and is banded lower here for that reason |
| **The same marks in live use by an unrelated company, D-4-corroborated** (jurisdiction/status/class overlap plus a second independent link) (RF-NET-004) | RPT & leakage risk floor 45; Disclosure candor max 65 until the arrangement is explained — an unresolved ambiguity, never assumed benign. *A bare wordmark match with no D-4 corroboration is recorded as a lead, not this cap* |
| **Undisclosed corroborated address-cluster entity that transacts with the listco** (RF-NET-005) | Disclosure candor max 50; Governance risk floor 60 — same treatment as RF-PPL-005: an entity we could only find by looking, that trades with the company and appears in no disclosure, is a non-disclosure finding once the A17-08 test classifies it `disclosable-and-omitted` |
| **Unresolved `pending-12-reconciliation` subject** — `07` deferred a predecessor legal check and `12` did not run (or did not report per-predecessor) | People & network integrity max 65; Confidence Score max 80 — the grade stays PROVISIONAL and is reported as such; a deferred check that nobody ran is a coverage gap, never a clean result |
| **Declared breadth overflow** — named E-A/E-B subjects left unswept because the 25/15 breadth budget bound (A17-09, reason `breadth_budget`) | People & network integrity max 70; Confidence Score max 80. *Declaring the overflow is what avoids RF-NET-006 (silent truncation); it does not buy back coverage that was never obtained. If the overflow includes a lineage/predecessor entity or a Tier-A-controlled entity, People & network integrity max 60 instead* |
| **Run stopped on overall query-budget exhaustion** — one or more named E-A/E-B subjects still unswept when the loop terminates `budget_exhausted` (Scope-Boundary Register reason `budget_exhausted`, distinct from the `breadth_budget` bound above) | People & network integrity max 65; Confidence Score max 75. *`budget_exhausted` names which subjects went unswept and avoids RF-NET-006 the same way `breadth_budget` does, but naming the shortfall is not recovering it — the cap applies exactly as it would for a breadth overflow. If the unswept subjects include a lineage/predecessor entity or a Tier-A-controlled entity, People & network integrity max 55 instead* |
| **Accounting-forensics battery red** (RF-ACC-001 with ≥3 manipulator-zone components, or RF-ACC-002) | Accounting-forensics risk floor 70; Governance risk floor 60; route to `earnings/06` cross-check in the synthesis |

If multiple caps affect the same score, use the most restrictive. Both RF-NET-003 rows record EXPOSURE, with its basis named (§3); neither by itself fails the Non-Negotiable Gate.

These rows implement the CLAUDE.md §24 "Avoid Big Risks" rejector filters as score penalties + conviction caps. They are not new hard disqualifiers (those stay in `business-model/01_disqualifier-scan` and §13). A filter trips on cited evidence; a tripped filter is never averaged away, and the synthesis (`99`) applies it in the Score Cap Application table.

---

## Cross-Module Inputs

The management-governance module reads outputs from previously-run modules. Under `/research:full` it runs after business-model and earnings.

**From business-model (`analyses/{TICKER}_{DATE}/business-model/`):**
- `11_capital-allocation-governance.md` — the quick-read this module deepens and supersedes
- `01_disqualifier-scan.md` — hard governance disqualifiers (audit, pledging, related-party, restatements, enforcement) — reference, do not re-adjudicate
- `12_red-flags-sweep.md` — any governance/quality flags already surfaced
- `02_business-identity.md` — who the company is and its control context

**From earnings (`analyses/{TICKER}_{DATE}/earnings/`):**
- `06_earnings-quality.md` — non-GAAP aggressiveness and accrual quality (a candor signal)
- `04_guidance-consensus.md` — the guidance/beat-miss track record (a candor and competence signal)
- `01_historical-financials.md` — the multi-year baseline agent 11 uses for the Beneish/Dechow year-over-year components

**From balance-sheet-survival (`analyses/{TICKER}_{DATE}/balance-sheet-survival/`)** — deliberately NOT in this module's `depends_on` (declaring it would serialize the two modules in the cockpit's admission graph for an optional read; under `/research:full` the alphabetical tie-break already runs balance-sheet-survival first). Agents 10 and 11 SELF-RESOLVE the path: Glob this run's `balance-sheet-survival/` folder (fall back to the latest prior run's), and degrade gracefully to their own read of the filings when it is absent or incomplete. **Exact-resume exception:** when `NOSTRA_EXACT_MODULE_RESUME=1`, use it ONLY when `balance-sheet-survival` is named in `NOSTRA_EXACT_MODULE_INPUTS` and exists in this run's folder; never read a prior run or an unlisted same-day folder. The cockpit has staged, published, locked, and fingerprinted the only optional inputs this paid run may consume:
- `05_off-balance-sheet-and-contingencies.md` — the solvency-lens read of leases, guarantees, and contingencies; agent 10 reads it, does NOT recompute its numbers, and adds the governance lens (disclosure honesty, movement, provisioning candor) plus the A7a items it doesn't cover
- `01_capital-structure-and-leverage.md` — the debt stack agent 11 reads for the leverage-hygiene items (A14-01/02)

If a cross-module file is missing, the affected agent proceeds independently and states:
*"{module} cross-module input not available — proceeding on this module's own read of the data pool."*

---

## Disqualifier Deference (Hard Rule)

The hard, binary disqualifiers are owned by `business-model/01_disqualifier-scan`. This module does NOT re-decide them. If that scan flagged any disqualifier, this module's synthesis must: (a) report it verbatim, (b) apply the Governance-risk floor from the Score Cap Rules, and (c) cap the stewardship verdict at "Serious governance concerns." This module's job is the richer spectrum BELOW the hard lock — competence, alignment, and candor — not a second opinion on the lock itself.

---

## Style Rules

- Plain English. Short sentences.
- Plain enough for a non-finance reader (CLAUDE.md §21): use the simplest word that keeps the meaning, and the first time a finance term appears (e.g. ROIC, the incentive metric, related-party deals) keep the term and its number but add a short plain meaning in a clause. Plain is not vague — never drop a number or a citation.
- Every important claim → evidence in the same paragraph or table row, in the citation format above.
- Actions and numbers beat adjectives. Quote the comp metric, the buyback price, the ownership %.
- Label all inference: *"Inference, not from filings."*

### Banned phrases

These may NOT appear unless paired with specific evidence in the same sentence:

- "strong management" / "experienced team" (state the track-record evidence)
- "aligned with shareholders" (state the ownership % or the incentive metric)
- "shareholder-friendly" (state the action — buyback price, dividend, rights)
- "disciplined capital allocation" (state the per-share outcome)
- "best-in-class governance" / "high-quality board"
- "proven track record" (prove it with a kept promise)
- "committed to creating value"

---

## Out-of-Scope Requests

If the invocation message asks for anything outside a subagent's specific scope — a fair value / price target, scenario probabilities, risk/reward, a Buy/Sell rating, position sizing — do NOT comply. Produce the standard report and add:
`Out-of-scope request received: [describe]. This belongs to the valuation module or the master synthesizer, not the management-governance module.`

---

## Inputs Every Subagent Receives

- `TICKER` — company ticker
- `DATA_PATH` — exact filesystem evidence root injected by `MODULE_PIPELINE`; cite files under it with the logical label `data/{TICKER}/...`
- `GENERATION_ROOT` — exact immutable extraction generation injected by `MODULE_PIPELINE`; all manifest, corpus, CIQ, relationship, and extract reads stay inside it
- `OUTPUT_PATH` — `analyses/{TICKER}_{DATE}/management-governance/{NN}_{name}.md`
- `DATE` — today's date
- `UPSTREAM_INPUTS` — paths to outputs from agents this one depends on (in-module and cross-module; may be empty)

Read these from the invocation message. Never hardcode.

---

## Output Path Convention

`analyses/{TICKER}_{DATE}/management-governance/{NN}_{agent-name}.md`

---

## Chat Confirmation Format

Every subagent ends its turn with:

```
Agent: {name}
Output: {path}
Verdict: {agent-specific verdict line}
Biggest finding: {one line}
```

Add lines only if applicable:
- `Out-of-scope: ...`
- `Insufficient data: ...`
- `Partial data: ...` (name which data is missing and which cap was applied)

---

## Independent Reads

Each subagent reads `DATA_PATH` independently and extracts what it needs from the same admitted evidence snapshot.
Subagents share one authoritative immutable `GENERATION_ROOT` manifest but reach their analytical conclusions independently.
The synthesizer reconciles disagreements at the end.

---

## What Good Looks Like

A good Management-Governance module output should let the master synthesizer answer five questions quickly:

1. Have these people delivered on what they promised?
2. Has capital been allocated to create per-share value, or to grow for its own sake?
3. Do incentives reward per-share value or empire-building?
4. Do insiders own meaningful stock, and are they buying or selling?
5. Are minority shareholders protected, and is management candid when results are bad?

---

## Subagent List & Execution Layers

Layer 0 (sequential, fail-fast):
- `00_governance-data-triage` — also builds the Person & Entity Register (every director, KMP, promoter individual, former officer, and disclosed entity) plus the company's lineage anchors, which SEED 07's discovery loop

Layer 1 (parallel — the foundations):
- `01_management-and-track-record`
- `07_people-integrity-dossiers` — the entity-discovery loop and Discovery Register (A17), then the per-person AND per-entity forensic dossiers (A16 + person-level A-items), swept against `frameworks/GOVERNANCE_DATABASES.md`

Layer 2 (parallel, depend on `01` and/or `07`):
- `02_capital-allocation-scorecard` *(+ A10-01, A10-05)*
- `03_incentives-and-compensation` *(+ A6, A12)*
- `04_ownership-and-insider-behavior` *(+ A3, A15)*
- `05_board-and-shareholder-rights` *(+ A1, A2, A10-02/03/04 — reads 07's per-person grades for A1-04/05)*
- `06_candor-and-disclosure-quality` *(+ A7-03, A7-04)*
- `08_audit-and-assurance-quality` *(A4, A7-02)*
- `09_related-party-and-group-forensics` *(A5, A11 — reads 07's discovered network and `entity_network.json`)*
- `10_contingent-liabilities-and-commitments` *(A7a)*
- `11_accounting-forensics` *(A8, A14-01/02)*
- `12_regulatory-legal-and-compliance` *(A9, A7-01, A14-03 — company-level database sweep, run against every former name and predecessor as well as the current one)*

Layer 3 (sequential, synthesizer):
- `99_management-governance-synthesis` (depends on all prior — assembles the full Governance Checklist, computes the Non-Negotiable Gate, applies all caps)

If an upstream output is missing, the dependent subagent notes it explicitly:
*"Upstream output missing: [name] — proceeding with available data."*
