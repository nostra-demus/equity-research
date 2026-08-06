# Management-Governance Module — UBER (Synthesis)

## Abstract

Uber's stewardship record is genuinely mixed: neither a clean pass nor a governance failure. Dara Khosrowshahi delivered a proven, numbers-backed turnaround — operating income rose from a $(1,832)mm loss in FY2022 to $5,565mm in FY2025 — and the board is genuinely independent, with 90% independent directors, no poison pill, no dual-class stock, and zero disclosed related-party transactions above the $120,000 threshold. Capital allocation is capped at 50 of 100, though, by a serial-acquirer pattern that culminated in the $14.8bn, debt-funded Delivery Hero deal, funded partly by pulling $4bn from a promised buyback program. Insiders hold just 0.18% of shares, almost entirely stock-compensation-derived rather than bought, and no compensation-plan disclosure could be verified to confirm what pay actually rewards. Verdict: standard, mixed stewardship.

## 1. Stewardship Verdict

- **Verdict: Standard / mixed** — conventional-to-strong governance mechanics (board, related-party discipline) offset by an unproven incentive design, thin insider skin-in-the-game, and a capital-allocation program capped by a serial-acquirer red flag. Neither a clear positive nor a clear negative on the whole record.
- **Hard disqualifier flagged (business-model/01)?** N — `business-model/01_disqualifier-scan.md` found no auditor qualification, no going-concern note, no promoter pledge (no promoter exists), no related-party transaction >25% of revenue, no auditor change, no material restatement (the Capital IQ "RC" tag on FY2023/FY2024 columns is a vendor reclassification code, not a company-disclosed restatement), and no active enforcement action. Verdict-lock deference: **not triggered.**
- Management quality /100: **65**
- Capital allocation /100: **50** *(capped — see §4)*
- Incentive alignment /100: **10** *(capped max 50 — see §4; unproven, not disproven)*
- Shareholder friendliness /100: **74** *(blended: 65% weight on `05` Board & Shareholder Rights Score of 84, 35% weight on `04` Ownership Alignment Score of 55 — see §3)*
- Disclosure candor /100: **56**
- Governance risk /100 *(higher = worse, inverted)*: **65**
- Data quality /100: **62** *(from `00`; Partial sufficiency verdict, upgraded modestly by `05`'s primary DEF 14A pull but capped by the compensation gap and thin transcript history)*
- Overall usefulness /100: **68** *(capped max 70 by the no-compensation-disclosure rule)*
- Insider ownership (one line): Officers and directors together hold **0.18%** of shares (3,586,107 shares, $256.8mm), almost entirely RSU-vest-derived, not cash-bought; net insider activity over the trailing 6 months is modest net selling (−33,973 shares) that is almost entirely mechanical sell-to-cover, not opportunistic dumping [`04_ownership-and-insider-behavior.md`].
- Biggest governance signal (one line): A genuinely independent, well-run board (90% independent, no poison pill, zero disclosed RPT) sits above a capital-allocation program that has pivoted hard toward debt-funded M&A — at least seven deals in ~18 months, culminating in the $14.8bn Delivery Hero acquisition financed by a ~€14bn bridge facility and funded in part by diverting $4bn from the company's own promised buyback framework.
- **Governance Score /100** — `0.20×50 + 0.18×10 + 0.18×74 + 0.16×56 + 0.16×65 + 0.12×(100−65)` = `10 + 1.80 + 13.32 + 8.96 + 10.40 + 4.20` = **48.68 ≈ 49**
- **Confidence-Adjusted Governance Score /100** (= 49 × 65/100) = **31.85 ≈ 32**
- **Governance Rating: Weak** *(40–54 band; not from a forced override — see the Critical-flag reconciliation note below)*
- **Confidence Score /100: 65** *(reflects a genuine mix: Tier-1 primary-filing evidence for the board/RPT/shareholder-rights read via `05`'s SEC EDGAR pull, versus vendor-tier or fully-missing evidence for compensation, and a single-quarter transcript for candor)*
- **Red-Flag Count: 2 distinct IDs (7 firing rows) / Critical Red-Flag Count: 0** *(for the purposes of the module's hard "no better than Weak / Serious governance concerns" override — see reconciliation note immediately below; RF-CAP-004 carries "Critical" **materiality** in its own findings rows and drives its own score caps, but is not one of the enumerated fraud / going-concern / enforcement / restatement / RPT-leakage->10% triggers that MODULE_RULES.md's Red-Flag Trigger Engine defines as forcing the universal rating/verdict lock)*

**Note on the Critical-flag interpretation.** MODULE_RULES.md states in two places that a "Critical red flag" forces the rating to no better than "Weak" and the verdict to no better than "Serious governance concerns." The Red-Flag Trigger Engine section enumerates what that specific, harder tier of "Critical" means: "fraud allegation, going concern, enforcement, restatement, RPT leakage >10%." RF-CAP-004 (the serial-acquirer / Delivery Hero pattern) is separately defined in the §24 Filter 4 score-cap row as its own conviction cap (Capital allocation max 50; Governance risk floor 60) — a penalty, not a hard lock. Applying the conservative default where the two provisions could be read either way, this synthesis treats RF-CAP-004 as triggering its own explicit caps (both applied below) without invoking the universal "Serious governance concerns" lock, consistent with CLAUDE.md §24's framing that the six rejector filters are "not new hard disqualifiers... they define... a score penalty and a conviction cap," not a second disqualifier-scan. The Governance Score (49) independently lands in the "Weak" band on its own arithmetic, so the rating outcome is the same either way — this note exists so the master synthesizer understands why "Serious governance concerns" was NOT selected as the verdict despite a Critical-materiality finding being present.

## 1A. Module Disconfirmation

- **Strongest bear point:** Capital allocation is the dominant, least-proven, highest-risk decision this management team has made — at least seven acquisitions in ~18 months culminating in a $14.8bn, debt-funded Delivery Hero deal (10.6% of Uber's own market cap), financed by a fresh ~€14bn bridge facility, requiring a forced $1.6bn divestiture to clear antitrust, and funded in part by pulling $4bn from a capital-return promise made to shareholders [`02_capital-allocation-scorecard.md`, RF-CAP-004]. Net debt jumped from $76mm to $9,340mm in a single LTM window, before the much larger bridge facility is even drawn [02-014].
- **Strongest bull point (steelman):** The organic business is a genuine per-share value creator run by a management team with a proven, delivered (not promised) turnaround — operating income rose from a $(1,832)mm loss (FY2022) to $5,565mm (FY2025) on capex that never exceeded $336mm/year, an incremental ROIC in the 25–35% range [`02`, §4] — sitting under a board that is independently strong by every checkable metric (90% independent, fully independent Audit/Comp/Nominating committees, no poison pill, no dual-class stock, zero disclosed related-party transactions above $120,000) [`05_board-and-shareholder-rights.md`]. On the two metrics management actually guides (Adjusted EBITDA, Adjusted EPS), guidance has been met or beaten in each of the last several quarters [`01_management-and-track-record.md`, §4].
- **Single killer risk:** The Delivery Hero deal does not close until H2 2027 and its $1.2bn run-rate synergy target is a management-communicated goal, not a delivered result [`02`, §2]. If integration disappoints or leverage overshoots the (web-sourced, unverified) <2x gross-leverage target while the ~$10bn multi-year AV investment program is running concurrently, this management team — which has already shown it will override its own capital-return promise under M&A pressure — has both the balance sheet capacity and the demonstrated willingness to keep doing it again.
- **Disconfirming evidence already visible:** Buybacks over FY2024–LTM Jun-2026 ran ~3.9x stock-based compensation in dollar terms and did reduce net share count (−2.2%), clearing the minimum "not merely offsetting dilution" bar [02-009, 02-011] — i.e., capital allocation is not uniformly poor, only the M&A component is capped. Say-on-Pay support has averaged ~91% over the past five years with no year below ~85% [`05`, 05-018], a real (if incomplete, proxy-advisor-recommendation-blind) signal that the shareholder base that CAN see the actual pay structure is not objecting to it.

## 2. Specialist Roll-Up

| Specialist | Verdict Line | Biggest Finding |
|---|---|---|
| governance-data-triage | Partial sufficiency — no DEF 14A/10-K/10-Q/8-K/shareholder letter in `data/UBER/`, but ownership, board, and 5-year capital-allocation history are usable via CIQ vendor exports | Compensation disclosure (metrics/weights) and related-party disclosure are the two critical gaps; single highest-value missing document flagged as the DEF 14A |
| management-and-track-record | Score 65/100 — a real, delivered turnaround with guidance kept/beaten, undercut by CFO churn (3 in ~8 years) at the worst possible moment | Three CFOs since 2018, the middle tenure ~2 years, right as the company finances its largest-ever acquisition |
| capital-allocation-scorecard | Score 50/100 (capped from a raw 58) — organic capital allocation is value-creative, but the M&A program is a §24 Filter 4 serial-acquirer pattern | At least 7 acquisitions in ~18 months culminating in the $14.8bn, debt-funded Delivery Hero deal (10.6% of Uber's own market cap); RF-CAP-004 triggered |
| incentives-and-compensation | Score 10/100 (capped max 50) — incentive alignment **cannot be assessed**; no DEF 14A/CD&A/Summary Compensation Table/LTIP metrics anywhere in the pool used by this agent | Unproven, not disproven — the only pool-anchored fact is company-wide SBC ~3.3% of LTM revenue, not an executive-specific alignment signal |
| ownership-and-insider-behavior | Score 55/100 — clean pledge/control picture, but negligible, grant-driven (not bought) insider ownership | 0.18% total officer/director ownership; 0 of 44 six-month "purchase" transactions confirmed as an open-market cash buy |
| board-and-shareholder-rights | Score 84/100 — genuinely independent board and clean related-party discipline, confirmed from a primary FY2026 DEF 14A pulled from SEC EDGAR, offset by a real procedural gap (no written-consent right, 25% threshold to call a special meeting) | 90% independent directors, zero disclosed RPT above $120,000 — but no shareholder right to act by written consent between annual meetings |
| candor-and-disclosure-quality | Score 56/100 (mixed band) — direct, quantified answers to hard questions in the one available transcript, alongside a persistently unitemized ~25% slice of Adjusted EBITDA's own addback | Deferred-tax valuation-allowance releases inflated GAAP net income by a combined $10.1bn over two consecutive years, never flagged as a distortion on any call in the pool; RF-DISC-002 triggered |

## 2A. Consolidated Governance Findings

| Finding ID | Agent | Section | Question / Test | Verdict | Raw Value | Unit | Trend | Peer Verdict | Score | Penalty | Confidence | Materiality | Evidence | Red Flag ID | Follow-Up |
|---|---|---|---|---|---:|---|---|---|---:|---:|---:|---|---|---|---|
| 01-001 | 01 | Key Executives | CEO tenure | Green | 8.9 | years | Stable | NA | 18 | 0 | 4 | Medium | Professionals.rtf | — | None |
| 01-002 | 01 | Management Stability | CFO turnover count / shortest tenure | Amber | 3 | CFOs since 2018 | Deteriorating | NA | 10 | −6 | 3 | High | biz-model/11; Professionals.rtf; TechCrunch (unverified) | — | Confirm reason via proxy/8-K |
| 01-003 | 01 | Key Executives | Board Chair tenure/independence | Green | 8 | years, Independent | Stable | NA | 4 | 0 | 4 | Low | Board Members.rtf | — | None |
| 01-004 | 01 | Management Stability | CTO turnover | Amber | 1 | CTO change Dec-2025 | Not enough history | NA | 3 | −2 | 3 | Low | Professionals.rtf | — | Confirm predecessor CTO |
| 01-005 | 01 | Key Executives | Founder/owner-operator status | NA | 0.18 | % insider ownership | Stable | NA | — | — | 3 | Medium | biz-model/11 | — | None |
| 01-006 | 01 | Promise vs Delivery | Adj. EBITDA vs guide, FQ1 2026 | Green | 2481 | $mm vs $2,370–2,470mm guided | Improving | NA | 6 | 0 | 3 | Medium | CIQ Estimates, Guidance tab | — | None |
| 01-007 | 01 | Promise vs Delivery | Adj. EBITDA vs guide, FQ2 2026 | Green | 2819 | $mm vs $2,700–2,800mm guided | Improving | NA | 6 | 0 | 3 | Medium | CIQ Estimates; earnings/04 | — | None |
| 01-008 | 01 | Promise vs Delivery | Adj. EPS vs guide, FQ1 2026 | Green | 0.72 | $ vs $0.65–0.72 guided | Improving | NA | 5 | 0 | 3 | Medium | CIQ Estimates, Guidance tab | — | None |
| 01-009 | 01 | Promise vs Delivery | Adj. EPS vs guide, FQ2 2026 | Green | 0.81 | $ vs $0.78–0.82 guided | Stable | NA | 5 | 0 | 3 | Medium | CIQ Estimates, Guidance tab | — | None |
| 01-010 | 01 | Promise vs Delivery | Revenue consensus miss pattern | Amber | −0.52 | % miss FQ2 2026 | Deteriorating | NA | 3 | −3 | 3 | Medium | earnings/04; CIQ Estimates | — | Watch FQ3 2026 |
| 01-011 | 01 | Stated Strategy | US Mobility acceleration promise vs Q2 result | Green | 22 | % YoY Gross Bookings growth | Improving | NA | 4 | 0 | 3 | Medium | Q2 FY26 transcript | — | Confirm continuation |
| 01-012 | 01 | Stated Strategy | Headcount-discipline claim verifiability | Insufficient Data | — | — | Not enough history | NA | 0 | 0 | 1 | Low | Q2 FY26 transcript, Q&A p.9 | — | Obtain headcount disclosure |
| 01-013 | 01 | Turnaround Test | Delivered operating inflection, FY23–FY25 | Green | 5565 | $mm Op. Income FY25 (from $1,110mm FY23) | Improving | NA | 10 | 0 | 4 | High | biz-model/01; Financials.xls | — | None |
| 01-014 | 01 | Management Stability | CFO departure characterization | Amber | — | — | Not enough history | NA | 3 | −2 | 2 | Medium | Web: TechCrunch/CFO Dive (unverified) | — | Confirm via 8-K/proxy |
| 01-015 | 01 | Integrity Test | Adverse integrity buzz routed? | NA | 0 | — | Not enough history | NA | — | — | 4 | — | biz-model/01 §3 | — | None |
| 01-016 | 01 | Stated Strategy | AV commercialization $10bn investment | Insufficient Data | 10000 | $mm multi-year commitment | Not enough history | NA | 0 | 0 | 3 | High | Q2 FY26 transcript | — | Track capital deployed |
| 01-017 | 01 | Promise vs Delivery | ~50% FCF buyback framework overridden | Amber | 4000 | $mm pulled for DH stake, Q2 2026 | Deteriorating | NA | 3 | −3 | 3 | High | biz-model/11 | — | Confirm buyback cadence resumes |
| 02-001 | 02 | Uses of Capital | Acquisitions as % of cumulative CFO, FY21–25 | Amber | 15.2 | % of CFO | Not enough history | NA | 6 | −4 | 4 | High | Financials.xls, CF tab | — | Track FY26–27 M&A cash line |
| 02-002 | 02 | Uses of Capital | Buybacks as % of cumulative CFO, FY21–25 | Green | 37.0 | % of CFO | Rising sharply | NA | 7 | 0 | 4 | Medium | Financials.xls, CF tab | — | None |
| 02-003 | 02 | Uses of Capital | Debt repaid vs issued, FY21–25 | Amber | 1304 | $mm net debt issued | Deteriorating into LTM | NA | 4 | −2 | 4 | Medium | Financials.xls, CF tab | — | None |
| 02-004 | 02 | M&A Scorecard | Delivery Hero deal size vs market cap | Red | 10.6 | % of market cap | New | NA | 3 | −8 | 4 | Critical | CIQ M&A db; Public Co Profile | RF-CAP-004 | Track leverage vs <2x target |
| 02-005 | 02 | M&A Scorecard | Serial-acquirer cadence | Red | 7 | acquisitions in ~18 months | Accelerating | NA | 2 | — | 4 | Critical | Public Co Profile; CIQ Landscape | RF-CAP-004 | Monitor deal count/debt |
| 02-006 | 02 | M&A Scorecard | Forced divestiture opportunity cost | Red | 1600 | $mm SSW divestiture | New | NA | — | — | 4 | High | CIQ Landscape, DH deal entry | RF-CAP-004 | Confirm divested entity/multiple |
| 02-007 | 02 | M&A Scorecard | $4bn buyback capital redirected to DH stake | Amber | 4000 | $mm | New | NA | 3 | −4 | 3 | High | Q2 FY26 transcript | — | Confirm buyback cadence |
| 02-008 | 02 | M&A Scorecard | Trendyol Go organic/acquired growth conflation | Amber | — | — | Deteriorating | NA | 3 | −2 | 3 | Medium | Q2 FY26 transcript | — | Isolate organic vs. inorganic growth |
| 02-009 | 02 | Buyback Scorecard | Net share-count change, Dec-2024 to Aug-2026 | Green | −2.2 | % | Improving then reversing | NA | 8 | 0 | 4 | Medium | Historical Cap. tab | — | None |
| 02-010 | 02 | Buyback Scorecard | Buyback price discipline vs trading range, FY2025 | Amber | 84.38 | $ est. avg vs $65.41–101.99 range | Not enough history | NA | 4 | −3 | 2 | High | Historical Cap. tab; Public Co Profile | — | Confirm via 10-Q/10-K |
| 02-011 | 02 | Buyback Scorecard | Buybacks vs SBC dollar ratio | Green | 3.9 | x | Stable | NA | 6 | 0 | 4 | Medium | Financials.xls, CF tab | — | None |
| 02-012 | 02 | Dividends | Dividend payout ratio | NA | 0 | % | Stable | NA | — | — | 4 | Low | Financials.xls, CF tab | — | None |
| 02-013 | 02 | Dividends | Incremental ROIC, FY22–25 | Green | 34.7 | % (approximation) | Improving | NA | 20 | 0 | 3 | High | Financials.xls, IS/BS | — | Confirm with disclosed segment ROIC |
| 02-014 | 02 | Uses of Capital/BS | Net debt trajectory, FY25 to LTM Jun26 | Red | 9340 | $mm net debt (strict) | Sharply deteriorating | NA | 3 | −5 | 4 | Critical | Financials.xls, BS tab | RF-CAP-004 | Track leverage vs <2x target |
| 02-015 | 02 | Capital Allocation Score | Rejector-filter cap applied (§24 Filter 4) | Red | 50 | /100, capped from raw 58 | — | NA | 50 | −8 | 4 | Critical | This agent §4; biz-model/11 | RF-CAP-004 | Re-score post-close |
| 03-001 | 03 | Comp Structure | DEF 14A / CD&A present in pool used by this agent? | Insufficient Data | 0 | count | Not enough history | NA | 0 | 20 | 5 | High | 00 triage filename inventory | — | Obtain DEF 14A |
| 03-002 | 03 | Comp Structure | CEO base/bonus/LTIP mix | Insufficient Data | — | USD | Not enough history | NA | 0 | 20 | 1 | Critical | No Summary Comp. Table in pool | — | Obtain SCT |
| 03-003 | 03 | Comp Structure | CFO base/bonus/LTIP mix | Insufficient Data | — | USD | Not enough history | NA | 0 | 20 | 1 | Critical | No SCT; CFO changed 2026-02-16 | — | Obtain new-hire disclosure |
| 03-004 | 03 | Performance Metrics | Annual bonus metrics/weights | Insufficient Data | — | % weight | Not enough history | Lyft 50/50 GB/AdjEBITDA (web, unverified) | 0 | 20 | 1 | Critical | No bonus-plan disclosure | — | Obtain CD&A bonus section |
| 03-005 | 03 | Performance Metrics | LTIP metrics/weights | Insufficient Data | — | % weight | Not enough history | DoorDash stock-hurdle LTIP (web, unverified) | 0 | 15 | 1 | Critical | No LTIP disclosure | — | Obtain CD&A LTI section |
| 03-006 | 03 | Comp Structure | Company-wide SBC expense (context only) | Green | 1826 | $mm, FY2025 | Stable | NA | — | — | 5 | Medium | Financials.xls, CF tab | — | None |
| 03-007 | 03 | Pay vs Performance | CEO total pay | Insufficient Data | — | USD | Not enough history | NA | 0 | 15 | 1 | Critical | No SCT in pool | — | Obtain SCT |
| 03-008 | 03 | Pay vs Performance | Say-on-pay support (%) | Insufficient Data | — | % | Not enough history | NA | 0 | 10 | 1 | High | No AGM voting disclosure in pool used by this agent | — | Obtain 8-K/AGM results *(see §3 — `05` subsequently sourced this figure at 91%)* |
| 03-009 | 03 | Pay vs Performance | Capital-return policy signal (company level) | Green | 50 | % FCF to buybacks (stated) | Stable | NA | — | — | 3 | Medium | Q2 FY26 transcript | — | Confirm mapping to exec metric |
| 04-001 | 04 | Ownership | CEO ownership % and $ value | NA | 0.060 | % (1,225,802 sh, $87.8mm) | Stable | NA | — | — | 3 | Medium | CIQ Landscape, Top 25 Holders | — | None |
| 04-002 | 04 | Ownership | Total officer+director ownership % | Amber | 0.176 | % ($256.8mm) | Stable | NA | 8 | −17 | 3 | High | CIQ Landscape | — | Confirm via primary beneficial-ownership table |
| 04-003 | 04 | Ownership | Largest institutional holder | Green | 7.417 | % (BlackRock) | Stable | NA | — | — | 3 | Low | CIQ Landscape | — | None |
| 04-004 | 04 | Ownership | PIF stake & board seat | Amber | 3.578 | % ($5,216.1mm); 1 board seat | Stable | NA | — | — | 3 | Medium | CIQ Landscape; Board Members.rtf | — | Monitor PIF stake |
| 04-005 | 04 | Ownership quality | Bought vs granted — accumulation mechanism | Red | 0 | of 44 six-month "purchases" = cash buys | Not enough history | NA | 3 | −12 | 3 | High | CIQ Landscape, Insider Purchases | — | Confirm via Form 4 |
| 04-006 | 04 | Insider Transactions | Net insider activity, trailing 6 months | Amber | −33973 | shares | Deteriorating | NA | 8 | −12 | 3 | Medium | CIQ Landscape | — | Obtain missing 7–12mo window |
| 04-007 | 04 | Insider Transactions | Net insider activity, trailing 3 months | Amber | −3609 | shares | Stable | NA | — | — | 3 | Low | CIQ Landscape | — | None |
| 04-008 | 04 | Market Conduct | CEO sale timing vs subsequent FQ1 2026 result | Green | 253700 | shares, $18.94mm @ $74.66 | Not enough history | NA | — | — | 3 | High | CIQ Landscape; 01 §4 | — | None |
| 04-009 | 04 | Pledging | Promoter/insider share pledge | Green | 0 | % pledged | Stable | NA | 20 | 0 | 4 | Low | biz-model/01 #2; CIQ Landscape | — | None |
| 04-010 | 04 | Control Structure | Dual-class/super-voting shares | Green | 99.7 | % float, single class | Stable | NA | 9 | −1 | 3 | Medium | Public Co Profile | — | Confirm via 10-K cover page |
| 04-011 | 04 | Control Structure | Controlled-company status | Green | 7.417 | % held by largest single holder | Stable | NA | — | — | 3 | Medium | CIQ Landscape | — | None |
| 04-012 | 04 | Control Structure | Unaligned-controlling-owner test (§24 Filter 6) | NA | 0 | — no controlling owner | Stable | NA | — | — | 4 | — | CIQ Landscape | — | None |
| 04-013 | 04 | Market Conduct | Vanguard entity buy/sell reattribution | Insufficient Data | −192499602 | shares | Not enough history | NA | — | — | 2 | Low | CIQ Landscape, Top Buyers/Sellers | — | None |
| 04-014 | 04 | Market Conduct | Toyota full exit of legacy strategic stake | Amber | −5125868 | shares (now 0) | Not enough history | NA | 7 | −3 | 3 | Low | CIQ Landscape; Public Co Profile | — | None |
| 04-015 | 04 | Market Conduct | Unusual price/volume before announcements | Insufficient Data | — | — | Not enough history | NA | 0 | 0 | 1 | Low | Public Co Profile (single snapshot) | — | Obtain daily price/volume history |
| 05-001 | 05 | Board Composition | Independent-director % | Green | 90 | % (9 of 10) | Stable | NA | 18 | 0 | 5 | High | FY26 DEF 14A, p.11 | — | None |
| 05-002 | 05 | Board Composition | Chair/CEO split | Green | 1 | Independent Chair since Aug-2018 | Stable | NA | 5 | 0 | 5 | Medium | FY26 DEF 14A, p.2 | — | None |
| 05-003 | 05 | Board Composition | Committee independence | Green | 100 | % all 3 committees | Stable | NA | 15 | 0 | 5 | High | FY26 DEF 14A, p.11 | — | None |
| 05-004 | 05 | Board Composition | Board/committee attendance | Green | 75 | % minimum attendance | Stable | NA | 5 | 0 | 5 | Low | FY26 DEF 14A, p.33 | — | None |
| 05-005 | 05 | Board Composition | PIF-affiliated director on Audit Cmte | Amber | 3.57 | % Alnowaiser (PIF) | Stable | NA | 6 | −4 | 4 | Medium | FY26 DEF 14A, p.80 | — | Monitor Audit Cmte PIF matters |
| 05-006 | 05 | Tenure & Refreshment | Average independent-director tenure | Green | 5.6 | years | Stable | NA | 8 | 0 | 5 | Low | FY26 DEF 14A, p.10 | — | None |
| 05-007 | 05 | Tenure & Refreshment | Overboarding policy exceptions | Amber | 2 | directors with exceptions | Stable | NA | 4 | −6 | 5 | Medium | FY26 DEF 14A, p.28 | — | Confirm annual re-review |
| 05-008 | 05 | Tenure & Refreshment | Board refreshment (last 3 years) | Green | 3 | of 10 seats | Improving | NA | 7 | 0 | 5 | Low | FY26 DEF 14A, p.2,10 | — | None |
| 05-009 | 05 | Related-Party | Material RPT >$120,000 disclosed | Green | 0 | transactions | Stable | NA | 18 | 0 | 5 | High | FY26 DEF 14A, p.34 | — | None |
| 05-010 | 05 | Related-Party | Section 16(a) filing compliance | Amber | 1 | delinquent/corrected Form 3 (Arora) | Not enough history | NA | 3 | −2 | 5 | Low | FY26 DEF 14A, p.33 | — | None |
| 05-011 | 05 | Takeover Defenses | Poison pill present | Green | 0 | absent | Stable | NA | 10 | 0 | 5 | Medium | FY26 DEF 14A, p.11 | — | None |
| 05-012 | 05 | Takeover Defenses | Classified/staggered board | Green | 0 | absent | Stable | NA | 10 | 0 | 5 | Medium | FY26 DEF 14A, p.11 | — | None |
| 05-013 | 05 | Takeover Defenses | Dual-class/unequal voting | Green | 0 | absent | Stable | NA | 10 | 0 | 5 | High | FY26 DEF 14A, p.11 | — | None |
| 05-014 | 05 | Takeover Defenses | Director-election voting standard | Green | 1 | majority-vote | Stable | NA | 5 | 0 | 5 | Medium | FY26 DEF 14A, p.11,20 | — | None |
| 05-015 | 05 | Shareholder Rights | Right to call a special meeting | Amber | 25 | % voting power required | Stable | NA | 6 | −4 | 5 | Medium | FY26 DEF 14A, p.11 | — | None |
| 05-016 | 05 | Shareholder Rights | Right to act by written consent | Red | 0 | absent | Not enough history | NA | 0 | −10 | 3 | Medium | FY26 DEF 14A, p.11 (omission-inferred) | — | Confirm vs Certificate of Incorporation |
| 05-017 | 05 | Shareholder Rights | Proxy access availability | Green | 3 | % / 3-yr, up to 2 dir or 20% of board | Stable | NA | 6 | 0 | 5 | Low | FY26 DEF 14A, p.11 | — | None |
| 05-018 | 05 | AGM Voting | Say-on-Pay support level | Green | 91 | % avg, 5 years (each ≥85%) | Stable | NA | 10 | 0 | 4 | Medium | FY26 DEF 14A, p.44 | — | None |
| 05-019 | 05 | AGM Voting | 2026 AGM director/auditor vote counts | Insufficient Data | — | — | Not enough history | NA | 0 | 0 | 1 | Low | Not located | — | Obtain 2026 AGM 8-K Item 5.07 |
| 05-020 | 05 | Dilution | Net share-count change, Dec-2024 to Aug-2026 | Amber | 3 | mm net shares | Mixed | NA | 6 | −4 | 4 | Medium | FY26 DEF 14A, p.80; biz-model/11 | — | Track buyback resumption |
| 06-001 | 06 | Owning the Misses | Revenue consensus miss addressed? | Amber | −0.52 | % miss, FQ2 2026 | Deteriorating | NA | 8 | −4 | 3 | Medium | earnings/04; Q2 FY26 transcript | — | Watch FQ3 2026 |
| 06-002 | 06 | Owning the Misses | Buyback framework override owned? | Green | 4000 | $mm | Improving | NA | 8 | 0 | 3 | High | Q2 FY26 transcript, p.11-12 | — | Confirm cadence resumes |
| 06-003 | 06 | Owning the Misses | UK take-rate reclassification owned? | Green | 400 | bps of ~500bps decline | Stable | NA | 8 | 0 | 3 | High | Q2 FY26 transcript, p.12 | — | None |
| 06-004 | 06 | Non-GAAP Aggressiveness | Adj. EBITDA vs GAAP-EBITDA gap itemization | Red | 38.3 | % gap FY25, ~25% unitemized | Stable | NA | 5 | −6 | 3 | High | earnings/06 §4,7 | RF-DISC-002 | Request itemized reconciliation |
| 06-005 | 06 | Non-GAAP Aggressiveness | Deferred-tax valuation-allowance release, 2 years | Red | 10104 | $mm combined FY24-25 | Recurring | NA | 4 | −6 | 4 | High | earnings/06 §5,8; biz-model/12 | RF-DISC-002 | Confirm via next 10-K |
| 06-006 | 06 | Non-GAAP Aggressiveness | Normalized Net Income vs GAAP direction | Green | −64.1 | % (Normalized below GAAP) | Stable | NA | 6 | 0 | 4 | Medium | earnings/06 §7 | — | None |
| 06-007 | 06 | Disclosure Transparency | Segment/KPI disclosure specificity | Green | 7.6 | % Mobility op. margin | Stable | NA | 6 | 0 | 3 | Medium | Q2 FY26 transcript, p.12 | — | None |
| 06-008 | 06 | Disclosure Transparency | Revenue guidance discontinuation | Amber | 2020 | year stopped | Deteriorating | NA | 6 | −3 | 3 | Medium | earnings/04 §2 | — | Monitor reinstatement |
| 06-009 | 06 | Disclosure Transparency | Compensation/RPT disclosure (this agent's read) | Insufficient Data | — | — | Not enough history | NA | 0 | 0 | 1 | Medium | 00 triage §3,5B | — | Obtain DEF 14A *(see §3 — `05` subsequently sourced it)* |
| 06-010 | 06 | Tone in Bad Times | Transcript for actual worst quarter available? | Insufficient Data | 0 | verbatim transcripts, FQ3/4 2025 | Not enough history | NA | 0 | 0 | 1 | High | 00 triage §2; earnings/04 §6 | — | Obtain FQ3/FQ4 2025 transcripts |
| 06-011 | 06 | Tone in Bad Times | Q&A directness on hard questions | Green | 3 | direct, quantified answers | Stable | NA | 8 | 0 | 3 | Medium | Q2 FY26 transcript | — | None |
| 06-012 | 06 | Tone in Bad Times | M&A rationale specificity (Delivery Hero) | Amber | 0 | quantified return metric stated | Not enough history | NA | 3 | −2 | 3 | Medium | Q2 FY26 transcript, p.4 | — | Request ROIC/IRR target |
| 06-013 | 06 | Disclosure Timeliness | Results/guidance issued same day | Green | 0 | days delay | Stable | NA | 8 | 0 | 3 | Low | Q2 FY26 transcript | — | None |
| 06-014 | 06 | Non-GAAP Aggressiveness | Cash-backed earnings (CFO/Adj. EBITDA) | Green | 115.7 | %, FY2025 | Improving | NA | 6 | 0 | 4 | Medium | earnings/06 §1,2 | — | None |
| 06-015 | 06 | Owning the Misses | Headcount-discipline claim, challenge completeness | Amber | 10-20 | % headcount cut, "couple of orgs" | Not enough history | NA | 4 | −2 | 2 | Low | Q2 FY26 transcript, p.9 | — | Obtain headcount time series |

## 3. Reconciliation

**Disagreement 1 — does a primary proxy statement exist in the accessible record?** `00_governance-data-triage.md`, `03_incentives-and-compensation.md`, `04_ownership-and-insider-behavior.md`, and `06_candor-and-disclosure-quality.md` all state flatly that no DEF 14A exists anywhere in `data/UBER/` and score/cap accordingly (incentive alignment capped at 10/100 of a possible 50; compensation and say-on-pay marked "Insufficient Data"). `05_board-and-shareholder-rights.md` disagrees in practice: it retrieved Uber's actual FY2026 DEF 14A directly from SEC EDGAR (filed 2026-03-23, cited with a direct URL) and used it as its primary Tier-1 source for board composition, related-party transactions, takeover defenses, and — notably — Say-on-Pay history (91% average support over five years). **Reconciled view:** this is not a genuine data non-existence but an inter-agent execution gap — the document exists and is retrievable, but `03` (whose specific job is compensation) did not pull it, so its "Insufficient Data" verdict on CEO/CFO pay mix, bonus/LTIP metrics and weights stands as reported (this synthesis does not re-run `03`'s work), while `06`'s and `04`'s "Insufficient Data" findings on RPT and say-on-pay are **superseded** by `05`'s primary-filing findings (zero material RPT disclosed above $120,000; 91% average Say-on-Pay support). The conservative, evidence-based resolution: treat `05`'s primary-sourced facts as authoritative wherever they overlap with another agent's "Insufficient Data" claim (per CLAUDE.md §4, a filing beats an absence-of-evidence claim), but do **not** assume the DEF 14A's CD&A (compensation metrics and weights) has actually been read and verified — `05` did not extract that section, so incentive-alignment remains genuinely unproven, not merely under-sourced. This is the single most actionable finding in this synthesis: the primary source almost certainly needed to close the compensation gap has already been located.

**Disagreement 2 — degree of capital-allocation credit.** `01_management-and-track-record.md` reads the buyback-framework override ($4bn redirected to the Delivery Hero stake) as "Mixed" — a promise whose delivery changed direction, but explained candidly (see `06`). `02_capital-allocation-scorecard.md` treats the same fact set more severely, since its mandate is the capital-allocation record itself, not the communication around it, and applies the RF-CAP-004 cap. No true contradiction — different agents judging different dimensions of the same fact — but the more conservative, capital-allocation-specific verdict (Capital allocation capped at 50/100) is carried forward as authoritative for the composite score, consistent with CLAUDE.md's conservative-default rule.

**No other material disagreements.** All specialists agree independently that: no promoter/pledge structure exists, no dual-class stock exists, no controlling owner exists (RF-OWN-004 not triggered), no unresolved adverse integrity signal exists (RF-MGT-005 not triggered), and the historical Khosrowshahi-era turnaround clears the §24 Filter 2 delivered-inflection bar (RF-MGT-004 not triggered).

## 4. Score Cap Application

| Cap Trigger | Applies? | Affected Score | Cap / Floor | Pre-Cap Score | Applied Result | Reason / Evidence |
|---|---|---|---|---:|---:|---|
| No proxy / compensation disclosure | Y | Incentive alignment; usefulness | Incentive max 50; usefulness max 70 | 10 (raw, `03`) | 10 / usefulness 68 | `03`'s own scored total (10) already sits inside the cap; no DEF 14A CD&A/SCT was actually read for compensation despite `05` locating the underlying filing (see §3) |
| No ownership / insider data | N | Shareholder friendliness | max 60 | — | — | CIQ vendor ownership/insider data present and used by `04` (00 triage: "No cap from this row") |
| No board disclosure | N | Board / shareholder-rights read | Not assessable / cap | — | — | `05` obtained the primary FY2026 DEF 14A from SEC EDGAR; board read is fully assessable, not capped |
| No multi-year capital-allocation history | N | Capital allocation | max 65 | — | — | 5 years (FY2021–FY2025) plus LTM Jun-2026 present and used by `02` |
| No prior promises / transcripts / letters | Partial | Management quality / disclosure candor | candor max 65 | 56 (raw, `06`) | 56 | Cap not binding — `06`'s raw score (56) is already below the 65 cap; single-quarter-transcript limitation is reflected in `06`'s own confidence discount (held at 3, not 5) rather than a further score cut |
| Hard disqualifier flagged (business-model/01) | N | Governance risk / verdict | risk floor 80; verdict no better than "Serious governance concerns" | — | — | `business-model/01_disqualifier-scan.md`: no disqualifier triggered |
| Critical red flag triggered in this module | Y (materiality-Critical; not a hard-lock "Critical" per the Red-Flag Trigger Engine's enumerated list) | Governance rating / verdict | rating no better than "Weak" until disproven | 49 (raw composite) | Weak (49, unforced) | See the reconciliation note in §1: RF-CAP-004 is Critical **materiality** but not one of the enumerated fraud/going-concern/enforcement/restatement/RPT>10% triggers; the Governance Score (49) independently lands in the Weak band, so no forced override was needed |
| Turnaround thesis without ≥2–3 yrs delivered inflection (§24 Filter 2) | N | Management quality | max 60; conviction cap | — | — | `01`: operating income and cash from operations both grew for 3 consecutive years (FY2023–FY2025); RF-MGT-004 not triggered |
| Serial-acquirer pattern (§24 Filter 4, RF-CAP-004) | Y | Capital allocation; Governance risk | CapAlloc max 50; GovRisk floor 60 | 58 (raw component sum, `02`) | CapAlloc 50; GovRisk 65 (above the 60 floor, reflecting additional Amber findings) | `02`: ≥7 acquisitions in ~18 months, Delivery Hero at 10.6% of Uber's own market cap, debt-funded, forced $1.6bn divestiture |
| Structurally unaligned controlling owner (§24 Filter 6, RF-OWN-004) | N | Shareholder friendliness; Governance risk | ShFriendliness max 55; GovRisk floor 55 | — | — | `04`/`05`: diffuse register, largest holder (BlackRock) 7.4%, no controlling owner; RF-OWN-004 not triggered |
| Unresolved adverse integrity signal routed from business-model/01 (§24 Filter 1, RF-MGT-005) | N | Management quality; Disclosure candor | each max 60; conviction cap — no rating above "Watchlist" | — | — | `01`/`06`: no signal routed by `business-model/01_disqualifier-scan`; RF-MGT-005 not triggered |

## 5. Stewardship Summary

Judged on delivery, not narrative: Dara Khosrowshahi's management team has kept its promises on the two metrics it actually guides — Adjusted EBITDA and Adjusted EPS have been met or beaten in each of the last several quarters — and the organic business has created real per-share value, turning a $(1,832)mm operating loss (FY2022) into $5,565mm of operating income (FY2025) on capex that never topped $336mm a year, an incremental return on capital in the 25–35% range. But capital allocation as a whole is capped at 50/100 because the M&A program — at least seven deals in eighteen months, capped by the $14.8bn debt-funded Delivery Hero acquisition — is the single largest, least-proven, highest-risk capital decision on the books, financed in part by pulling $4bn from a buyback promise made to shareholders. Incentives cannot be verified to point management at per-share value rather than size, because no compensation-metric disclosure was actually read by this module (even though the underlying DEF 14A has now been located by `05`), and insiders hold just 0.18% of the company — almost entirely stock-compensation-derived, not bought with personal cash — so there is little skin in the game backing the promises. Minority shareholders are well protected on paper (a 90%-independent board, no poison pill, no dual-class stock, zero disclosed related-party transactions above $120,000) but have one real procedural gap: no right to act by written consent, and a 25%-of-voting-power bar to call a special meeting that no single holder is close to clearing alone. The single most important reason to trust this team with more shareholder capital is the proven, numbers-backed turnaround and a genuinely independent board; the single most important reason not to hand them more without watching closely is that the same team has just shown it will override its own capital-return promise to chase a transformative, debt-funded acquisition it cannot yet prove will work.

## 5A. Red-Flag Register

| Red Flag ID | Trigger | Severity (High / Critical) | Evidence | Source + Date | Score Impact | Follow-up |
|---|---|---|---|---|---:|---|
| RF-CAP-004 | Serial-acquirer pattern: ≥7 acquisitions in ~18 months, culminating in the $14.8bn, debt-funded Delivery Hero deal (10.6% of Uber's own market cap), financed by a ~€14bn bridge facility, requiring a forced $1.6bn divestiture, and net debt jumping from $76mm to $9,340mm in one LTM window | Critical (materiality); conviction cap, not a hard verdict lock — see §1 note | Delivery Hero SE deal entry ($14.8bn equity value, agreed 2026-07-16); ≥7 deals incl. Trendyol Go, Careem reconsolidation, Getir, SS Ventures, Blacklane, SpotHero, Segments.ai, Crown Taxi | Capital IQ M&A database (CIQReportLandscape.rtf); Public Company Profile.rtf; Q2 FY2026 earnings-call transcript, 2026-08-05 | Capital allocation capped at 50/100 (from raw 58); Governance risk floored at 60, set at 65 | Track gross leverage vs. the (web-sourced, unverified) <2x target through deal close (H2 2027); re-score capital allocation once integration results are observable |
| RF-DISC-002 | Recurring "one-off" / aggressive non-GAAP add-backs: ~25% of Adjusted EBITDA's own addback never itemized (FY2025 gap +38.3% vs GAAP-based EBITDA); a deferred-tax valuation-allowance release inflated GAAP net income by a combined $10,104mm over two consecutive years (FY2024 $5,758mm + FY2025 $4,346mm), never flagged as a distortion on any call in the pool | High | Adj. EBITDA $8,730mm vs GAAP-based EBITDA $6,312mm (FY2025); deferred-tax releases per `earnings/06_earnings-quality.md` §4,5,7,8 | `earnings/06_earnings-quality.md`; `business-model/12_red-flags-sweep.md`, 2026-08-06 | Disclosure candor: −6 (06-004), −6 (06-005) against a raw total of 56/100 | Request an itemized non-GAAP reconciliation; confirm via the next annual filing whether a third consecutive deferred-tax release occurs |

Red-flag count: 2 distinct IDs (7 firing finding-rows: 02-004, 02-005, 02-006, 02-014, 02-015 for RF-CAP-004; 06-004, 06-005 for RF-DISC-002). Critical (hard-lock tier, per the Red-Flag Trigger Engine's enumerated fraud/going-concern/enforcement/restatement/RPT>10% list): 0.

## 5B. Peer Governance Benchmark

No peer set — relative governance not assessed. Every specialist in this module (`01` through `06`) independently reported "No peer set — relative governance not assessed" against every finding row. `business-model/08_competitive-map.md` exists and identifies Uber's competitive peer set for business-model purposes, but no Layer-2 specialist in this module used it to benchmark governance metrics (board independence %, insider/promoter holding %, pledge %, non-audit/audit fee ratio, RPT intensity, or AGM votes-against) against named peers. This is a genuine gap for a future run, not a finding that peers are unavailable in principle — Lyft and DoorDash proxy data were used in `03` for compensation-design texture only (web-sourced, unverified), not as a scored peer benchmark.

## 5C. Governance Change Since Last Run

No prior run — first governance snapshot. No prior dated run exists for UBER under `analyses/UBER_{prior-date}/management-governance/`; there is nothing to compare against. All findings above should be treated as the baseline for future delta tracking (board/KMP changes, promoter holding/pledge, RPT intensity, new legal/regulatory items, new AGM opposition, CFO/PAT).

## 5D. Analyst Follow-Up Questions

- **CFO turnover (01-002, 01-014):** Is the ~2-year tenure of the prior CFO (Mahendra-Rajah) genuinely unrelated to financial-reporting matters, as web-sourced (unverified) reports claim? Confirm via the next 8-K or proxy. Does the pattern (3 CFOs since 2018) affect execution risk specifically around Delivery Hero financing and AV capital deployment, where institutional memory matters most?
- **Serial-acquirer / Delivery Hero (02-004, 02-005, 02-006, 02-014, RF-CAP-004):** Is the ~$1.2bn run-rate synergy target (management-communicated, not itemized in the pool) credible given no closed integration exists yet? Is this company-specific execution risk or a sector-wide consolidation wave (Delivery Hero, DoorDash, and peers are all pursuing M&A)? Does the leverage trajectory stay under the (unverified) <2x gross-leverage target through close (H2 2027)? Does the buyback program actually resume on the "months, not quarters" timeline management stated?
- **Compensation disclosure gap (03-001 through 03-008):** Now that `05` has located the primary FY2026 DEF 14A on SEC EDGAR, does its Compensation Discussion & Analysis and Summary Compensation Table show per-share/returns-based metrics (ROIC, EPS, TSR) or size-based metrics (revenue, Gross Bookings, deal count) for the CEO and CFO bonus/LTIP plans? This is directly answerable from a document this module has already located but not yet read for this purpose.
- **PIF-affiliated Audit Committee seat (05-005):** Has the Audit Committee handled any PIF-adjacent commercial or investment matter since Alnowaiser's Nov-2023 appointment? Is there any commercial relationship between Uber and PIF portfolio companies that would create a disclosable conflict beyond the beneficial-ownership disclosure already made?
- **No written-consent right (05-016):** Does Uber's actual Certificate of Incorporation (not independently re-read in full by `05`) confirm the absence of a written-consent right? Is the 25%-of-voting-power special-meeting threshold a genuine constraint given no single holder exceeds ~9.3%?
- **Non-GAAP itemization and deferred-tax releases (06-004, 06-005, RF-DISC-002):** Is the unitemized ~25% of Adjusted EBITDA's addback material to a normalized-earnings view of the business? Will a third consecutive deferred-tax valuation-allowance release occur in FY2026, and if so, does management address it proactively on a future call rather than leaving it to be found by cross-referencing the balance sheet?
- **Insider ownership quality (04-005):** Would a primary Form 4 filing (once available) confirm that zero of the trailing-6-month "purchase" transactions were genuine open-market cash buys, or does the Feb-24-2026 CFO transaction ($1.6mm) turn out to be a discretionary purchase rather than an option exercise?

## 6. What Would Change The Stewardship Verdict?

| Current Verdict | What Would Strengthen It | What Would Weaken It | Data Needed |
|---|---|---|---|
| Standard / mixed | A read DEF 14A CD&A showing per-share/returns-based bonus and LTIP metrics; a confirmed open-market insider purchase (not RSU-vest-derived); Delivery Hero closing on schedule with leverage staying under the stated target and synergies materializing; buybacks resuming on the "months, not quarters" timeline; no further debt-funded bolt-on acquisitions | A CD&A showing size-based metrics (revenue, deal count, absolute EBITDA) rewarding empire-building; leverage overshooting the <2x target; a further large debt-funded deal on top of Delivery Hero before it even closes; a third consecutive deferred-tax release with no management commentary; any insider selling that precedes a subsequent miss (none found in this pool to date) | The FY2026 DEF 14A's Compensation Discussion & Analysis (already located by `05`, not yet read for compensation purposes); the FQ3/FQ4 2025 earnings-call transcripts (the actual weak quarters, not yet in the pool); the 2026 AGM 8-K Item 5.07 vote-count filing; post-close Delivery Hero integration data (expected H2 2027) |

## 7. Note To The Final Synthesizer

- **Stewardship verdict:** Standard / mixed. Strongest evidence for it: a proven, delivered turnaround (operating income $(1,832)mm FY2022 → $5,565mm FY2025) sitting under a genuinely independent board (90% independent, zero disclosed RPT above $120,000), offset by a capital-allocation program capped at 50/100 for a serial-acquirer pattern and an incentive-alignment read that is unproven (not disproven) for lack of a read compensation disclosure.
- **Capital-allocation record:** organic business is value-creative (incremental ROIC ~25–35%, capex-light); buybacks clear the minimum bar (net share count −2.2% since Dec-2024, ~3.9x stock-based comp in dollar terms) but were not price-disciplined on the observable trading range; the M&A program — ≥7 deals in ~18 months culminating in the $14.8bn, debt-funded Delivery Hero acquisition — is the dominant, least-proven, highest-risk capital decision and caps the overall score. RF-CAP-004 triggered.
- **Incentive/ownership alignment:** cannot be confirmed to point management at per-share value vs. size — no compensation-metric disclosure was actually read in this module (score 10/100, capped max 50). Insiders hold 0.18% of shares, almost entirely stock-comp-derived, not bought; net insider activity is modest selling that is almost entirely mechanical sell-to-cover, not opportunistic. No pledging, no dual-class stock, no controlling owner (RF-OWN-004 not triggered).
- **Biggest governance risk / red flag:** RF-CAP-004 (serial-acquirer / Delivery Hero pattern) — Critical materiality, caps Capital allocation at 50/100 and floors Governance risk at 60 (set at 65 here). Secondary: RF-DISC-002 (High) — a persistently unitemized ~25% of Adjusted EBITDA's addback and a $10.1bn combined two-year deferred-tax GAAP-inflation, neither proactively flagged by management.
- **Hard disqualifier:** None. `business-model/01_disqualifier-scan.md` verbatim: "No disqualifier fact found in the available data pool," with the caveat that related-party, restatement, and enforcement rows rest on absence-of-evidence in a vendor-export/transcript-only pool rather than a primary filing's clean attestation (partially resolved for related-party by `05`'s primary DEF 14A pull — zero material RPT above $120,000 disclosed).
- **§24 rejector filters that tripped:** Filter 4 (serial acquirer, RF-CAP-004) — capped Capital allocation at 50, floored Governance risk at 60. Filters 1 (integrity), 2 (turnaround), 3 (leverage — owned by balance-sheet-survival, not this module), and 6 (unaligned owner) did NOT trip: no adverse integrity signal, the historical turnaround already cleared the ≥2–3-year delivered-inflection bar, and no controlling owner exists.
- **Partial-data caps applied:** Incentive alignment capped max 50 (scored 10) and Overall usefulness capped max 70 (scored 68) — no compensation-metric disclosure was read. Disclosure candor's "no prior transcripts" cap (max 65) was not binding since the raw score (56) already sits below it.
- **Biggest missing data point — reframed:** NOT "obtain the DEF 14A" — `05_board-and-shareholder-rights.md` already retrieved Uber's FY2026 DEF 14A from SEC EDGAR and used it for board, related-party, and shareholder-rights findings. The actual highest-value next step is having the incentives-and-compensation specialist (`03`) read the Compensation Discussion & Analysis and Summary Compensation Table sections of that SAME document, which it did not use. This would very likely resolve the single largest remaining score cap in this module (Incentive alignment, currently 10/100 of a possible 50).
- **Explicit handoff:** this module supersedes the `business-model/11_capital-allocation-governance` quick-read; the master synthesizer should treat this module's governance verdict and scores as the primary governance read.

## 8. Simple Summary

- Management kept its word on the two numbers it actually promises (Adjusted EBITDA, Adjusted EPS) — beaten or met the last several quarters running.
- Capital allocation is a mixed bag: the core business turns cash into profit efficiently, but the acquisition binge — 7+ deals in 18 months, capped by a $14.8bn debt-funded purchase of Delivery Hero — is the riskiest, least-proven call management has made, and it broke its own buyback promise to help pay for it.
- What the pay actually rewards is unknown: no proxy's pay-plan section was read for this report, so we cannot say if bonuses reward per-share value or just growing bigger.
- Insiders barely own the stock — 0.18% combined, almost all from stock grants vesting, not personal cash purchases — and they've been net sellers (mechanically, not opportunistically) over the last six months.
- Minority shareholders are protected on paper: an independent board, no poison pill, no dual-class shares, and zero disclosed related-party deals above $120,000 — but they can't force a vote between annual meetings without a coalition holding 25% of the votes.
- Management is mostly candid when things go wrong on the one call available — it owned the buyback pause and an accounting optics issue with real numbers — but roughly a quarter of its own "adjusted profit" add-back is never explained, and a $10 billion two-year tax-related profit boost was never flagged to investors.
- No hard disqualifier (no fraud, no going-concern issue, no pledged shares, no rigged books) was found.
- This module is useful for the master synthesizer, with one flagged gap: the compensation-design question is still open even though the document to answer it has already been located.

## 9. Machine-Readable Outputs

```governance_summary.json
{
  "ticker": "UBER",
  "date": "2026-08-06",
  "module": "management-governance",
  "stewardship_verdict": "Standard / mixed",
  "hard_disqualifier_flagged": false,
  "scores": {
    "management_quality": 65,
    "capital_allocation": 50,
    "incentive_alignment": 10,
    "shareholder_friendliness": 74,
    "disclosure_candor": 56,
    "governance_risk_inverted": 65,
    "data_quality": 62,
    "overall_usefulness": 68
  },
  "governance_score": 48.68,
  "governance_score_rounded": 49,
  "confidence_score": 65,
  "confidence_adjusted_governance_score": 31.85,
  "confidence_adjusted_governance_score_rounded": 32,
  "governance_rating": "Weak",
  "red_flag_count_distinct_ids": 2,
  "red_flag_firing_rows": 7,
  "critical_red_flag_count_hard_lock_tier": 0,
  "critical_materiality_red_flags": ["RF-CAP-004"],
  "high_severity_red_flags": ["RF-DISC-002"],
  "section24_filters_tripped": ["Filter 4 (serial acquirer, RF-CAP-004)"],
  "section24_filters_not_tripped": ["Filter 1 (integrity)", "Filter 2 (turnaround)", "Filter 6 (unaligned owner)"],
  "partial_data_caps_applied": [
    "Incentive alignment max 50 (no compensation-metric disclosure read)",
    "Overall usefulness max 70"
  ],
  "supersedes": "business-model/11_capital-allocation-governance.md",
  "biggest_next_data_request": "Have the incentives-and-compensation specialist read the CD&A / Summary Compensation Table section of the FY2026 DEF 14A already retrieved by 05_board-and-shareholder-rights from SEC EDGAR"
}
```

```governance_findings.csv
finding_id,agent,section,question,verdict,raw_value,unit,trend,peer_verdict,score,penalty,confidence,materiality,evidence,red_flag_id,follow_up
01-001,01,Key Executives,CEO tenure,Green,8.9,years,Stable,NA,18,0,4,Medium,Professionals.rtf,,None
01-002,01,Management Stability,CFO turnover count / shortest tenure,Amber,3,CFOs since 2018,Deteriorating,NA,10,-6,3,High,"biz-model/11; Professionals.rtf; TechCrunch (unverified)",,Confirm reason via proxy/8-K
01-003,01,Key Executives,Board Chair tenure/independence,Green,8,"years, Independent",Stable,NA,4,0,4,Low,Board Members.rtf,,None
01-004,01,Management Stability,CTO turnover,Amber,1,CTO change Dec-2025,Not enough history,NA,3,-2,3,Low,Professionals.rtf,,Confirm predecessor CTO
01-005,01,Key Executives,Founder/owner-operator status,NA,0.18,% insider ownership,Stable,NA,,,3,Medium,biz-model/11,,None
01-006,01,Promise vs Delivery,"Adj. EBITDA vs guide, FQ1 2026",Green,2481,"$mm vs $2370-2470mm guided",Improving,NA,6,0,3,Medium,"CIQ Estimates, Guidance tab",,None
01-007,01,Promise vs Delivery,"Adj. EBITDA vs guide, FQ2 2026",Green,2819,"$mm vs $2700-2800mm guided",Improving,NA,6,0,3,Medium,"CIQ Estimates; earnings/04",,None
01-008,01,Promise vs Delivery,"Adj. EPS vs guide, FQ1 2026",Green,0.72,"$ vs $0.65-0.72 guided",Improving,NA,5,0,3,Medium,"CIQ Estimates, Guidance tab",,None
01-009,01,Promise vs Delivery,"Adj. EPS vs guide, FQ2 2026",Green,0.81,"$ vs $0.78-0.82 guided",Stable,NA,5,0,3,Medium,"CIQ Estimates, Guidance tab",,None
01-010,01,Promise vs Delivery,Revenue consensus miss pattern,Amber,-0.52,% miss FQ2 2026,Deteriorating,NA,3,-3,3,Medium,"earnings/04; CIQ Estimates",,Watch FQ3 2026
01-011,01,Stated Strategy,US Mobility acceleration promise vs Q2 result,Green,22,% YoY Gross Bookings growth,Improving,NA,4,0,3,Medium,Q2 FY26 transcript,,Confirm continuation
01-012,01,Stated Strategy,Headcount-discipline claim verifiability,Insufficient Data,,,Not enough history,NA,0,0,1,Low,"Q2 FY26 transcript, Q&A p.9",,Obtain headcount disclosure
01-013,01,Turnaround Test,"Delivered operating inflection, FY23-FY25",Green,5565,"$mm Op. Income FY25 (from $1110mm FY23)",Improving,NA,10,0,4,High,"biz-model/01; Financials.xls",,None
01-014,01,Management Stability,CFO departure characterization,Amber,,,Not enough history,NA,3,-2,2,Medium,"Web: TechCrunch/CFO Dive (unverified)",,Confirm via 8-K/proxy
01-015,01,Integrity Test,Adverse integrity buzz routed?,NA,0,,Not enough history,NA,,,4,,biz-model/01 §3,,None
01-016,01,Stated Strategy,AV commercialization $10bn investment,Insufficient Data,10000,$mm multi-year commitment,Not enough history,NA,0,0,3,High,Q2 FY26 transcript,,Track capital deployed
01-017,01,Promise vs Delivery,~50% FCF buyback framework overridden,Amber,4000,"$mm pulled for DH stake, Q2 2026",Deteriorating,NA,3,-3,3,High,biz-model/11,,Confirm buyback cadence resumes
02-001,02,Uses of Capital,"Acquisitions as % of cumulative CFO, FY21-25",Amber,15.2,% of CFO,Not enough history,NA,6,-4,4,High,"Financials.xls, CF tab",,Track FY26-27 M&A cash line
02-002,02,Uses of Capital,"Buybacks as % of cumulative CFO, FY21-25",Green,37.0,% of CFO,Rising sharply,NA,7,0,4,Medium,"Financials.xls, CF tab",,None
02-003,02,Uses of Capital,"Debt repaid vs issued, FY21-25",Amber,1304,$mm net debt issued,Deteriorating into LTM,NA,4,-2,4,Medium,"Financials.xls, CF tab",,None
02-004,02,M&A Scorecard,Delivery Hero deal size vs market cap,Red,10.6,% of market cap,New,NA,3,-8,4,Critical,"CIQ M&A db; Public Co Profile",RF-CAP-004,Track leverage vs <2x target
02-005,02,M&A Scorecard,Serial-acquirer cadence,Red,7,acquisitions in ~18 months,Accelerating,NA,2,,4,Critical,"Public Co Profile; CIQ Landscape",RF-CAP-004,Monitor deal count/debt
02-006,02,M&A Scorecard,Forced divestiture opportunity cost,Red,1600,$mm SSW divestiture,New,NA,,,4,High,"CIQ Landscape, DH deal entry",RF-CAP-004,Confirm divested entity/multiple
02-007,02,M&A Scorecard,$4bn buyback capital redirected to DH stake,Amber,4000,$mm,New,NA,3,-4,3,High,Q2 FY26 transcript,,Confirm buyback cadence
02-008,02,M&A Scorecard,Trendyol Go organic/acquired growth conflation,Amber,,,Deteriorating,NA,3,-2,3,Medium,Q2 FY26 transcript,,Isolate organic vs. inorganic growth
02-009,02,Buyback Scorecard,"Net share-count change, Dec-2024 to Aug-2026",Green,-2.2,%,Improving then reversing,NA,8,0,4,Medium,Historical Cap. tab,,None
02-010,02,Buyback Scorecard,"Buyback price discipline vs trading range, FY2025",Amber,84.38,$ est. avg vs $65.41-101.99 range,Not enough history,NA,4,-3,2,High,"Historical Cap. tab; Public Co Profile",,Confirm via 10-Q/10-K
02-011,02,Buyback Scorecard,Buybacks vs SBC dollar ratio,Green,3.9,x,Stable,NA,6,0,4,Medium,"Financials.xls, CF tab",,None
02-012,02,Dividends,Dividend payout ratio,NA,0,%,Stable,NA,,,4,Low,"Financials.xls, CF tab",,None
02-013,02,Dividends,"Incremental ROIC, FY22-25",Green,34.7,% (approximation),Improving,NA,20,0,3,High,"Financials.xls, IS/BS",,Confirm with disclosed segment ROIC
02-014,02,Uses of Capital/BS,"Net debt trajectory, FY25 to LTM Jun26",Red,9340,$mm net debt (strict),Sharply deteriorating,NA,3,-5,4,Critical,"Financials.xls, BS tab",RF-CAP-004,Track leverage vs <2x target
02-015,02,Capital Allocation Score,Rejector-filter cap applied (section 24 Filter 4),Red,50,/100 capped from raw 58,,NA,50,-8,4,Critical,"This agent §4; biz-model/11",RF-CAP-004,Re-score post-close
03-001,03,Comp Structure,DEF 14A / CD&A present in pool used by this agent?,Insufficient Data,0,count,Not enough history,NA,0,20,5,High,00 triage filename inventory,,Obtain DEF 14A
03-002,03,Comp Structure,CEO base/bonus/LTIP mix,Insufficient Data,,USD,Not enough history,NA,0,20,1,Critical,No Summary Comp. Table in pool,,Obtain SCT
03-003,03,Comp Structure,CFO base/bonus/LTIP mix,Insufficient Data,,USD,Not enough history,NA,0,20,1,Critical,"No SCT; CFO changed 2026-02-16",,Obtain new-hire disclosure
03-004,03,Performance Metrics,Annual bonus metrics/weights,Insufficient Data,,% weight,Not enough history,"Lyft 50/50 GB/AdjEBITDA (web, unverified)",0,20,1,Critical,No bonus-plan disclosure,,Obtain CD&A bonus section
03-005,03,Performance Metrics,LTIP metrics/weights,Insufficient Data,,% weight,Not enough history,"DoorDash stock-hurdle LTIP (web, unverified)",0,15,1,Critical,No LTIP disclosure,,Obtain CD&A LTI section
03-006,03,Comp Structure,Company-wide SBC expense (context only),Green,1826,"$mm, FY2025",Stable,NA,,,5,Medium,"Financials.xls, CF tab",,None
03-007,03,Pay vs Performance,CEO total pay,Insufficient Data,,USD,Not enough history,NA,0,15,1,Critical,No SCT in pool,,Obtain SCT
03-008,03,Pay vs Performance,Say-on-pay support (%),Insufficient Data,,%,Not enough history,NA,0,10,1,High,No AGM voting disclosure in pool used by this agent,,"Obtain 8-K/AGM results (see synthesis §3 - 05 sourced 91% avg)"
03-009,03,Pay vs Performance,Capital-return policy signal (company level),Green,50,% FCF to buybacks (stated),Stable,NA,,,3,Medium,Q2 FY26 transcript,,Confirm mapping to exec metric
04-001,04,Ownership,CEO ownership % and $ value,NA,0.060,"% (1225802 sh, $87.8mm)",Stable,NA,,,3,Medium,"CIQ Landscape, Top 25 Holders",,None
04-002,04,Ownership,Total officer+director ownership %,Amber,0.176,% ($256.8mm),Stable,NA,8,-17,3,High,CIQ Landscape,,Confirm via primary beneficial-ownership table
04-003,04,Ownership,Largest institutional holder,Green,7.417,% (BlackRock),Stable,NA,,,3,Low,CIQ Landscape,,None
04-004,04,Ownership,PIF stake & board seat,Amber,3.578,% ($5216.1mm); 1 board seat,Stable,NA,,,3,Medium,"CIQ Landscape; Board Members.rtf",,Monitor PIF stake
04-005,04,Ownership quality,Bought vs granted - accumulation mechanism,Red,0,of 44 six-month purchases = cash buys,Not enough history,NA,3,-12,3,High,"CIQ Landscape, Insider Purchases",,Confirm via Form 4
04-006,04,Insider Transactions,"Net insider activity, trailing 6 months",Amber,-33973,shares,Deteriorating,NA,8,-12,3,Medium,CIQ Landscape,,Obtain missing 7-12mo window
04-007,04,Insider Transactions,"Net insider activity, trailing 3 months",Amber,-3609,shares,Stable,NA,,,3,Low,CIQ Landscape,,None
04-008,04,Market Conduct,CEO sale timing vs subsequent FQ1 2026 result,Green,253700,"shares, $18.94mm @ $74.66",Not enough history,NA,,,3,High,"CIQ Landscape; 01 §4",,None
04-009,04,Pledging,Promoter/insider share pledge,Green,0,% pledged,Stable,NA,20,0,4,Low,"biz-model/01 #2; CIQ Landscape",,None
04-010,04,Control Structure,Dual-class/super-voting shares,Green,99.7,"% float, single class",Stable,NA,9,-1,3,Medium,Public Co Profile,,Confirm via 10-K cover page
04-011,04,Control Structure,Controlled-company status,Green,7.417,% held by largest single holder,Stable,NA,,,3,Medium,CIQ Landscape,,None
04-012,04,Control Structure,Unaligned-controlling-owner test (section 24 Filter 6),NA,0,no controlling owner,Stable,NA,,,4,,CIQ Landscape,,None
04-013,04,Market Conduct,Vanguard entity buy/sell reattribution,Insufficient Data,-192499602,shares,Not enough history,NA,,,2,Low,"CIQ Landscape, Top Buyers/Sellers",,None
04-014,04,Market Conduct,Toyota full exit of legacy strategic stake,Amber,-5125868,shares (now 0),Not enough history,NA,7,-3,3,Low,"CIQ Landscape; Public Co Profile",,None
04-015,04,Market Conduct,Unusual price/volume before announcements,Insufficient Data,,,Not enough history,NA,0,0,1,Low,Public Co Profile (single snapshot),,Obtain daily price/volume history
05-001,05,Board Composition,Independent-director %,Green,90,% (9 of 10),Stable,NA,18,0,5,High,"FY26 DEF 14A, p.11",,None
05-002,05,Board Composition,Chair/CEO split,Green,1,Independent Chair since Aug-2018,Stable,NA,5,0,5,Medium,"FY26 DEF 14A, p.2",,None
05-003,05,Board Composition,Committee independence,Green,100,% all 3 committees,Stable,NA,15,0,5,High,"FY26 DEF 14A, p.11",,None
05-004,05,Board Composition,Board/committee attendance,Green,75,% minimum attendance,Stable,NA,5,0,5,Low,"FY26 DEF 14A, p.33",,None
05-005,05,Board Composition,PIF-affiliated director on Audit Cmte,Amber,3.57,% Alnowaiser (PIF),Stable,NA,6,-4,4,Medium,"FY26 DEF 14A, p.80",,Monitor Audit Cmte PIF matters
05-006,05,Tenure & Refreshment,Average independent-director tenure,Green,5.6,years,Stable,NA,8,0,5,Low,"FY26 DEF 14A, p.10",,None
05-007,05,Tenure & Refreshment,Overboarding policy exceptions,Amber,2,directors with exceptions,Stable,NA,4,-6,5,Medium,"FY26 DEF 14A, p.28",,Confirm annual re-review
05-008,05,Tenure & Refreshment,Board refreshment (last 3 years),Green,3,of 10 seats,Improving,NA,7,0,5,Low,"FY26 DEF 14A, p.2,10",,None
05-009,05,Related-Party,Material RPT >$120000 disclosed,Green,0,transactions,Stable,NA,18,0,5,High,"FY26 DEF 14A, p.34",,None
05-010,05,Related-Party,Section 16(a) filing compliance,Amber,1,delinquent/corrected Form 3 (Arora),Not enough history,NA,3,-2,5,Low,"FY26 DEF 14A, p.33",,None
05-011,05,Takeover Defenses,Poison pill present,Green,0,absent,Stable,NA,10,0,5,Medium,"FY26 DEF 14A, p.11",,None
05-012,05,Takeover Defenses,Classified/staggered board,Green,0,absent,Stable,NA,10,0,5,Medium,"FY26 DEF 14A, p.11",,None
05-013,05,Takeover Defenses,Dual-class/unequal voting,Green,0,absent,Stable,NA,10,0,5,High,"FY26 DEF 14A, p.11",,None
05-014,05,Takeover Defenses,Director-election voting standard,Green,1,majority-vote,Stable,NA,5,0,5,Medium,"FY26 DEF 14A, p.11,20",,None
05-015,05,Shareholder Rights,Right to call a special meeting,Amber,25,% voting power required,Stable,NA,6,-4,5,Medium,"FY26 DEF 14A, p.11",,None
05-016,05,Shareholder Rights,Right to act by written consent,Red,0,absent,Not enough history,NA,0,-10,3,Medium,"FY26 DEF 14A, p.11 (omission-inferred)",,Confirm vs Certificate of Incorporation
05-017,05,Shareholder Rights,Proxy access availability,Green,3,% / 3-yr up to 2 dir or 20% of board,Stable,NA,6,0,5,Low,"FY26 DEF 14A, p.11",,None
05-018,05,AGM Voting,Say-on-Pay support level,Green,91,% avg 5 years (each >=85%),Stable,NA,10,0,4,Medium,"FY26 DEF 14A, p.44",,None
05-019,05,AGM Voting,2026 AGM director/auditor vote counts,Insufficient Data,,,Not enough history,NA,0,0,1,Low,Not located,,Obtain 2026 AGM 8-K Item 5.07
05-020,05,Dilution,"Net share-count change, Dec-2024 to Aug-2026",Amber,3,mm net shares,Mixed,NA,6,-4,4,Medium,"FY26 DEF 14A, p.80; biz-model/11",,Track buyback resumption
06-001,06,Owning the Misses,Revenue consensus miss addressed?,Amber,-0.52,% miss FQ2 2026,Deteriorating,NA,8,-4,3,Medium,"earnings/04; Q2 FY26 transcript",,Watch FQ3 2026
06-002,06,Owning the Misses,Buyback framework override owned?,Green,4000,$mm,Improving,NA,8,0,3,High,"Q2 FY26 transcript, p.11-12",,Confirm cadence resumes
06-003,06,Owning the Misses,UK take-rate reclassification owned?,Green,400,bps of ~500bps decline,Stable,NA,8,0,3,High,"Q2 FY26 transcript, p.12",,None
06-004,06,Non-GAAP Aggressiveness,Adj. EBITDA vs GAAP-EBITDA gap itemization,Red,38.3,"% gap FY25, ~25% unitemized",Stable,NA,5,-6,3,High,earnings/06 §4,7,RF-DISC-002,Request itemized reconciliation
06-005,06,Non-GAAP Aggressiveness,"Deferred-tax valuation-allowance release, 2 years",Red,10104,$mm combined FY24-25,Recurring,NA,4,-6,4,High,"earnings/06 §5,8; biz-model/12",RF-DISC-002,Confirm via next 10-K
06-006,06,Non-GAAP Aggressiveness,Normalized Net Income vs GAAP direction,Green,-64.1,% (Normalized below GAAP),Stable,NA,6,0,4,Medium,earnings/06 §7,,None
06-007,06,Disclosure Transparency,Segment/KPI disclosure specificity,Green,7.6,% Mobility op. margin,Stable,NA,6,0,3,Medium,"Q2 FY26 transcript, p.12",,None
06-008,06,Disclosure Transparency,Revenue guidance discontinuation,Amber,2020,year stopped,Deteriorating,NA,6,-3,3,Medium,earnings/04 §2,,Monitor reinstatement
06-009,06,Disclosure Transparency,Compensation/RPT disclosure (this agent's read),Insufficient Data,,,Not enough history,NA,0,0,1,Medium,00 triage §3,,"Obtain DEF 14A (see synthesis §3 - 05 sourced it)"
06-010,06,Tone in Bad Times,Transcript for actual worst quarter available?,Insufficient Data,0,verbatim transcripts FQ3/4 2025,Not enough history,NA,0,0,1,High,00 triage §2; earnings/04 §6,,Obtain FQ3/FQ4 2025 transcripts
06-011,06,Tone in Bad Times,Q&A directness on hard questions,Green,3,direct quantified answers,Stable,NA,8,0,3,Medium,Q2 FY26 transcript,,None
06-012,06,Tone in Bad Times,M&A rationale specificity (Delivery Hero),Amber,0,quantified return metric stated,Not enough history,NA,3,-2,3,Medium,"Q2 FY26 transcript, p.4",,Request ROIC/IRR target
06-013,06,Disclosure Timeliness,Results/guidance issued same day,Green,0,days delay,Stable,NA,8,0,3,Low,Q2 FY26 transcript,,None
06-014,06,Non-GAAP Aggressiveness,Cash-backed earnings (CFO/Adj. EBITDA),Green,115.7,"%, FY2025",Improving,NA,6,0,4,Medium,earnings/06 §1,2,,None
06-015,06,Owning the Misses,"Headcount-discipline claim, challenge completeness",Amber,10-20,"% headcount cut, couple of orgs",Not enough history,NA,4,-2,2,Low,"Q2 FY26 transcript, p.9",,Obtain headcount time series
```

```red_flags.csv
red_flag_id,trigger,severity,evidence,source_and_date,score_impact,follow_up
RF-CAP-004,"Serial-acquirer pattern: >=7 acquisitions in ~18 months, culminating in the $14.8bn debt-funded Delivery Hero deal (10.6% of Uber's own market cap), financed by a ~EUR14bn bridge facility, requiring a forced $1.6bn divestiture, net debt jumping from $76mm to $9340mm in one LTM window","Critical (materiality); conviction cap, not a hard verdict lock","Delivery Hero SE deal entry ($14.8bn equity value, agreed 2026-07-16); >=7 deals incl. Trendyol Go, Careem reconsolidation, Getir, SS Ventures, Blacklane, SpotHero, Segments.ai, Crown Taxi","Capital IQ M&A database (CIQReportLandscape.rtf); Public Company Profile.rtf; Q2 FY2026 earnings-call transcript, 2026-08-05","Capital allocation capped at 50/100 (from raw 58); Governance risk floored at 60, set at 65","Track gross leverage vs the (web-sourced, unverified) <2x target through deal close (H2 2027); re-score capital allocation once integration results are observable"
RF-DISC-002,"Recurring one-off / aggressive non-GAAP add-backs: ~25% of Adjusted EBITDA's own addback never itemized (FY2025 gap +38.3% vs GAAP-based EBITDA); a deferred-tax valuation-allowance release inflated GAAP net income by a combined $10104mm over two consecutive years (FY2024 $5758mm + FY2025 $4346mm), never flagged as a distortion on any call in the pool",High,"Adj. EBITDA $8730mm vs GAAP-based EBITDA $6312mm (FY2025); deferred-tax releases per earnings/06_earnings-quality.md §4,5,7,8","earnings/06_earnings-quality.md; business-model/12_red-flags-sweep.md, 2026-08-06","Disclosure candor: -6 (06-004), -6 (06-005) against a raw total of 56/100","Request an itemized non-GAAP reconciliation; confirm via the next annual filing whether a third consecutive deferred-tax release occurs"
```

```source_log.csv
source_id,agent,source_type,filename_or_filing,period,page_or_section,date,confidence,used_for
01-S1,01,Capital IQ executive profiles (vendor),Uber Technologies Inc NYSE UBER Professionals.rtf,Current + tenure history,Full document,2026-08-05,3,CEO/CFO/CTO/President bios tenure appointment dates
01-S2,01,Capital IQ board profiles (vendor),Uber Technologies Inc NYSE UBER Board Members.rtf,Current roster,Full document,2026-08-05,3,Chair tenure co-founder observer status
01-S3,01,Capital IQ estimates workbook,"UberTechnologies,IncNYSEUBEREstimatesReport (1).xls, Guidance tab",FQ1 2019-FQ3 2026,Guidance/Actual/% Difference rows,2026-08-05,3,Promise-vs-delivery Adj EBITDA/EPS guidance vs actuals
01-S4,01,Cross-module output,earnings/04_guidance-consensus.md,FQ3 2025-FQ2 2026,§6 Historical Beat/Miss Pattern,2026-08-06,4,Revenue consensus miss pattern
01-S5,01,Cross-module output,business-model/11_capital-allocation-governance.md,FY2021-LTM Jun-2026,Signal Table,2026-08-06,4,CFO turnover buyback-vs-FCF framework
01-S6,01,Cross-module output,business-model/01_disqualifier-scan.md,FY2022-FY2025,§1 Operating Income/Cash from Ops,2026-08-06,4,Turnaround-test evidence
01-S7,01,Earnings-call transcript (primary),"Uber Technologies, Inc., Q2 2026 Earnings Call, Aug-05-2026.pdf",Q2 FY2026,Prepared remarks Q&A pp.4 9 11-12,2026-08-05,3,Stated strategy US acceleration headcount AV investment buyback commentary
01-S8,01,Web (unverified),"TechCrunch, Uber appoints new CFO as its AV plans accelerate",-,-,2026-02-04,2,CFO transition date and stated departure reason
01-S9,01,Web (unverified),"CFO Dive, Uber taps insider for CFO amid robotaxi push",-,-,2026,2,Confirms Krishnamurthy is third CFO in three years
02-S1,02,Capital IQ financial workbook (vendor),"Uber Technologies Inc NYSE UBER Financials.xls, Cash Flow tab",FY2021-LTM Jun-2026,Full tab,2026-08-05,4,Uses of capital buyback/dividend/capex/debt lines
02-S2,02,Capital IQ financial workbook (vendor),"Uber Technologies Inc NYSE UBER Financials.xls, Balance Sheet tab",FY2021-Jun-2026,Full tab,2026-08-05,4,Net debt total debt shares outstanding invested-capital inputs
02-S3,02,Capital IQ financial workbook (vendor),"Uber Technologies Inc NYSE UBER Financials.xls, Historical Capitalization tab",Dec-2024-Mar-2026,Full tab,2026-08-05,4,Quarterly share price and shares outstanding
02-S4,02,Capital IQ financial workbook (vendor),"Uber Technologies Inc NYSE UBER Financials.xls, Income Statement tab",FY2021-LTM Jun-2026,Full tab,2026-08-05,4,EBIT for incremental ROIC calculation
02-S5,02,Capital IQ M&A database (vendor),UberTechnologiesIncNYSEUBER_CIQReportLandscape.rtf,2019-2026,Deal-tracker entries,2026-08-05,4,M&A deal terms dates advisors financing structure
02-S6,02,Company profile (vendor),Uber Technologies Inc NYSE UBER Public Company Profile.rtf,Current,Subsidiaries/Investments table stock quote box credit ratings,2026-08-05,4,Bolt-on deal list market cap 52-week range credit rating
02-S7,02,Earnings-call transcript (primary),"Uber Technologies, Inc., Q2 2026 Earnings Call, Aug-05-2026.pdf",Q2 FY2026,CFO remarks pp.11-14,2026-08-05,5,Buyback framework DH stake purchase synergy commitment language
02-S8,02,Cross-module output,business-model/11_capital-allocation-governance.md,FY2021-LTM Jun-2026,Signal Table §2-4,2026-08-06,4,Concurring serial-acquirer severity score
02-S9,02,Cross-module output,earnings/01_historical-financials.md,FY2021-LTM Jun-2026,§1 §4,2026-08-06,4,CFO/FCF figures normalized-EPS distortion context
02-S10,02,Web (dated unverified),"TechCrunch, Uber's $14.8B Delivery Hero deal",-,2026-07-16,2,Synergy target and gross-leverage target not in pool
03-S1,03,Capital IQ vendor export,"Uber Technologies Inc NYSE UBER Financials.xls, Cash Flow tab",FY2024-LTM Jun-2026,Stock-Based Compensation row,2026-08-06,5,Company-wide SBC figure
03-S2,03,Capital IQ vendor export,"Uber Technologies Inc NYSE UBER Financials.xls, Supplemental tab",FY2020-FY2025,Stock Based Comp Exp Before/After Tax,2026-08-06,5,Cross-check of SBC figure
03-S3,03,Earnings-call transcript,"Uber Technologies, Inc., Q2 2026 Earnings Call, Aug-05-2026.pdf",Q2 FY2026,CFO remarks p.12,2026-08-05,3,Capital-return/buyback-framework signal
03-S4,03,In-module cross-reference,01_management-and-track-record.md,FY2025-FY2026,§3 Stated Strategy,2026-08-06,3,Corroborates buyback quote no comp disclosure elsewhere
03-S5,03,In-module cross-reference,00_governance-data-triage.md,-,Proxy/compensation-gap confirmation,2026-08-06,5,Confirms filename-level absence of DEF14A etc
03-S6,03,Web (peer texture unverified),Lyft FY2025 DEF 14A third-party summary,FY2025,CEO annual bonus design,2026-08-06,2,Peer texture only not a Uber figure
03-S7,03,Web (peer texture unverified),DoorDash 2020 CEO Performance Award trackers,FY2020 grant FY2025 reporting,CEO LTIP design,2026-08-06,2,Peer texture only not a Uber figure
04-S1,04,Capital IQ beneficial-ownership/insider export (vendor),UberTechnologiesIncNYSEUBER_CIQReportLandscape.rtf,As of report date,Public Ownership Summary Top 25 Holders Insider Trading Activity,2026-08-05,3,Ownership % institutional holders insider transactions
04-S2,04,Capital IQ board profiles (vendor),Uber Technologies Inc NYSE UBER Board Members.rtf,Current roster,Alnowaiser bio,2026-08-05,3,PIF board-seat link Audit Committee membership
04-S3,04,Capital IQ public-company profile (vendor),Uber Technologies Inc NYSE UBER Public Company Profile.rtf,Current,Float % Shares Out Shares Sold Short,2026-08-05,3,Float % share count short interest Toyota legacy investor
04-S4,04,Cross-module output,business-model/01_disqualifier-scan.md,Aug-2026,Disqualifier #2,2026-08-06,4,Independent confirmation of no pledge structure
04-S5,04,Cross-module output,business-model/11_capital-allocation-governance.md,Aug-2026,Signal Table insider-ownership row,2026-08-06,4,Cross-check of 0.18% insider ownership figure
04-S6,04,In-module output,00_governance-data-triage.md,Aug-2026,§3 Governance Usability Check,2026-08-06,4,Data-sufficiency caveats
04-S7,04,In-module output,01_management-and-track-record.md,Aug-2026,§1 §4,2026-08-06,4,CEO non-founder status FQ1 2026 guidance-beat context
05-S1,05,SEC proxy statement (primary Tier 1),"Uber Technologies, Inc. FY2026 DEF 14A",FY2025 comp/Mar-2026 record date/May-2026 AGM notice,pp.2 10-11 20 28 33-34 44 80,2026-03-23,5,Board composition committee independence related-party takeover defenses voting Say-on-Pay beneficial ownership
05-S2,05,Capital IQ board profiles (vendor),Uber Technologies Inc NYSE UBER Board Members.rtf,Current roster,Full document,2026-08-05,3,Corroborates director bios Board Observer status committee tags
05-S3,05,Capital IQ full company report (vendor),UberTechnologiesIncNYSEUBER_CIQReportLandscape.rtf,Ownership as of ~Aug-05-2026,Public Ownership Summary Top 25 Holders,2026-08-05,3,Corroborates PIF stake and institutional-holder concentration
05-S4,05,Cross-module output,business-model/11_capital-allocation-governance.md,FY2021-LTM Jun-2026,Signal Table RPT row share-count row,2026-08-06,4,PIF/Alnowaiser board-seat flag share-count trajectory
05-S5,05,Cross-module output,business-model/01_disqualifier-scan.md,FY2022-FY2025,§1 rows 2 3,2026-08-06,4,Confirms no promoter/pledge structure no RPT disqualifier
05-S6,05,Governance data triage,00_governance-data-triage.md,Current,§3 §5 §5B,2026-08-06,4,Documents the original pool gap this report closes
05-S7,05,Web (unverified corroborating only),stocktitan.net summary of FY2026 DEF 14A,Mar-2026,-,2026-08-06,2,Cross-check of the primary-filing read only
06-S1,06,Earnings-call transcript (verbatim),"Uber Technologies, Inc., Q2 2026 Earnings Call, Aug-05-2026.pdf",Q2 FY2026,Full text pp.4-15,2026-08-05,3,Owning-the-miss read Q&A directness M&A rationale headcount challenge
06-S2,06,Cross-module output,earnings/06_earnings-quality.md,FY2021-LTM Jun-2026,§1 §4 §5 §7 §8 §9,2026-08-06,4,Non-GAAP aggressiveness GAAP-to-adjusted gap deferred-tax distortion
06-S3,06,Cross-module output,earnings/04_guidance-consensus.md,FQ3 2025-FQ2 2026,§2 §6,2026-08-06,4,Revenue guidance discontinuation date consensus-miss pattern
06-S4,06,Cross-module output,business-model/12_red-flags-sweep.md,FY2023-FY2025,Non-operating net-income composition row,2026-08-06,4,Corroborates deferred-tax/mark-to-market distortion
06-S5,06,In-module upstream,01_management-and-track-record.md,FY2019-FQ2 2026,§4 §4A,2026-08-06,4,Misses to assess communication around confirms no RF-MGT-005
06-S6,06,In-module triage,00_governance-data-triage.md,-,§1 §2 §5,2026-08-06,4,Confirms no proxy/10-K/shareholder letter single-quarter transcript limitation
```
