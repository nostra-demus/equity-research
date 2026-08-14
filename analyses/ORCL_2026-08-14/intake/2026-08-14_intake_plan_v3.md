# ORCL Document Intake — 2026-08-14

## Verdict
**scoped_rerun** · Two documents landed since the run finished. The material one is Oracle's actual DEF 14A proxy (2025 Annual Meeting, filed 2025-09-26) — it discloses that founder/Executive Chair Lawrence Ellison pledged 346,000,000 shares (~30% of his 40.6%-of-class stake) as loan collateral, directly overturning the current run's "Green 20/20, no pledging disclosed" governance finding, and it upgrades several other findings from an unverified web summary or "not applicable"/"insufficient data" to a primary Tier-4 filing. Scope reruns to the two business-model orbs and three management-governance orbs that finding touches, plus their downstream cascade. The second document, a Dec-2025 earnings call transcript, is a historical backfill already superseded by later transcripts already in the pool — no rerun recommended.

## New documents since the last run (analyses/ORCL_2026-08-14)

| Document | Provider · type · §4 tier · as-of | Materiality /100 | Bears on (orb) | Re-run? |
|---|---|---|---|---|
| `Oracle_Corporation_-_Form_DEF_14A(Sep-26-2025).doc` | — · proxy statement · Tier 4 · 2025-09-19 | 90 | management-governance/ownership-and-insider-behavior; business-model/disqualifier-scan; business-model/capital-allocation-governance; management-governance/board-and-shareholder-rights; management-governance/incentives-and-compensation | `/research:rerun business-model disqualifier-scan ORCL`; `/research:rerun business-model capital-allocation-governance ORCL`; `/research:rerun management-governance ownership-and-insider-behavior ORCL`; `/research:rerun management-governance board-and-shareholder-rights ORCL`; `/research:rerun management-governance incentives-and-compensation ORCL` |
| `Oracle Corporation, Q2 2026 Earnings Call, Dec 10, 2025.rtf` | — · earnings transcript · Tier 6 · 2025-12-10 | 15 | earnings/historical-financials (weak); earnings/guidance-consensus (weak) | note only |

## Scoped rerun plan

Ordered `/research:rerun` commands (upstream module first):

1. `/research:rerun business-model disqualifier-scan ORCL` — Item 2 (>50% promoter/insider pledge check) currently states "no pledge disclosure of any kind found... effectively 0%"; the proxy supplies an actual ~29.9% figure. Verdict likely stays cleared (well under the 50% threshold), but the evidence basis is factually wrong today. Cascades to: business-model, earnings, balance-sheet-survival, management-governance, valuation, catalyst.
2. `/research:rerun business-model capital-allocation-governance ORCL` — the promoter-pledging line currently reads "Not applicable... this is an India/SEBI-specific concept," which is wrong — Oracle does have a disclosed, applicable insider-pledging fact. Same cascade as above.
3. `/research:rerun management-governance ownership-and-insider-behavior ORCL` — finding 04-005 currently scores Pledge/Encumbrance Green 20/20 on "no pledging disclosed"; directly contradicted by the proxy's dated 346,000,000-share pledge disclosure. Cascades to: management-governance, valuation, catalyst.
4. `/research:rerun management-governance board-and-shareholder-rights ORCL` — this agent already cites an *unverified web search summary* of this exact filing for board composition and say-on-pay; the primary Tier-4 document is now available to replace it, plus new detail on Governance Committee oversight of Ellison's pledging. Same cascade.
5. `/research:rerun management-governance incentives-and-compensation ORCL` — this agent is explicitly capped ("no proxy in pool... Incentive alignment max 50"); the filing supplies a CD&A, Summary Compensation Table, CEO pay ratio, and clawback policy for FY2025 (it predates the Sept-2025 co-CEO transition, so it does not fully resolve the agent's FY26 co-CEO gap — lower confidence). Same cascade.

## Watch (note-only)

- `Oracle Corporation, Q2 2026 Earnings Call, Dec 10, 2025.rtf` — materiality 15 < gate 60. Every figure and claim in this transcript (RPO $523.3B, cloud/OCI growth, the Ampere-gain-inflated EPS beat, Q3 FY26 guidance, the "30-40% OCI margin" claim) is already reflected in the finished run via the FY26 10-K and the chronologically later Q3/Q4 FY26 transcripts already in the pool. A historical backfill, not new evidence.
