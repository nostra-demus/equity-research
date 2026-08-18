# Management-Governance Module

A module of a multi-module equity research system. This module answers:

> "Are the people running this company competent stewards of shareholder capital, and are their incentives and governance aligned with minority shareholders?"

It is the deep-dive behind the single `business-model/11_capital-allocation-governance` quick-read, and it works through three lenses (MODULE_RULES `## Scope`): the **stewardship judgment** (track record, capital allocation, incentives, ownership, board, candor), the **Governance Checklist** (a canonical ~180-item banded audit — board, committees, ownership, auditor, related parties, remuneration, contingent liabilities, forensic accounting, regulatory/legal, minority treatment, shadow network & lineage — every item answered Green/Amber/Red/NA with evidence, assembled item-by-item in the synthesis with a Non-Negotiable Gate), and **person-and-network integrity** (first a discovery loop that works out who and what is actually in scope — brand lineage, former names, trademark ownership, registered-address clusters, past directorships, and the founders of every linked entity, walked recursively to hop 2 — then a forensic dossier on every person and every surfaced entity, swept against the public legal/regulatory databases and discovery recipes in `frameworks/GOVERNANCE_DATABASES.md`).

It does NOT value the company (that's **valuation**), forecast earnings (that's **earnings**), re-adjudicate hard disqualifiers (those live in `business-model/01_disqualifier-scan`), or assign probabilities / size positions / issue a rating (that's the **master synthesizer**). It produces the stewardship *read*; the synthesizer folds it into the verdict and risk register.

## Where things live

| What | Path |
|---|---|
| Module agent prompts | `.claude/agents/management-governance/` |
| Module operating rules | `.claude/agents/management-governance/MODULE_RULES.md` |
| Slash command | `.claude/commands/research/management-governance.md` |
| Module outputs (per ticker) | `analyses/{TICKER}_{DATE}/management-governance/` |
| Repo root cross-cutting rules | `/CLAUDE.md` |
| Master synthesizer | `.claude/agents/synthesizer.md` |

## How it's invoked

```
/research:management-governance TICKER
```

Under the master command it runs after business-model and earnings:

```
/research:full TICKER
  → /research:business-model TICKER
  → /research:earnings TICKER
  → /research:balance-sheet-survival TICKER
  → /research:management-governance TICKER   (this module — reads business-model + earnings)
  → /research:valuation TICKER
  → invokes .claude/agents/synthesizer.md
```

The master synthesizer reads `99_management-governance-synthesis.md` as a module chapter and treats its governance verdict as the primary read (superseding the `business-model/11` quick-read).

## Sub-agents

| # | Sub-agent | Depends on | Output |
|---|---|---|---|
| 00 | `governance-data-triage` | — | Inventory + Person & Entity Register + lineage anchors + fail-fast |
| 01 | `management-and-track-record` | — | Who runs it; promises vs delivery *(+ A13-04/05)* |
| 02 | `capital-allocation-scorecard` | 01 | M&A / buybacks / dividends / reinvestment record *(+ A10-01/05)* |
| 03 | `incentives-and-compensation` | 01 | What the pay actually rewards *(+ A6, A12)* |
| 04 | `ownership-and-insider-behavior` | 01 | Ownership, insider buying/selling, control *(+ A3, A15)* |
| 05 | `board-and-shareholder-rights` | 01, 07 | Board independence, voting rights, minority protection *(+ A1, A2, A10-02/03/04)* |
| 06 | `candor-and-disclosure-quality` | 01 | Truth-telling in good and bad times *(+ A7-03/04)* |
| 07 | `people-integrity-dossiers` | 00 | Entity-discovery loop + Discovery Register, then per-person AND per-entity forensic dossiers, grades, and hop-banded exposure floors *(A16, A17, A1-05, A9-04, A13)* |
| 08 | `audit-and-assurance-quality` | 00 | Auditor calibre, independence, opinions, restatements *(A4, A7-02)* |
| 09 | `related-party-and-group-forensics` | 01, 07 | RPT quantification + group-structure leakage, reconciled against 07's discovered network *(A5, A11)* |
| 10 | `contingent-liabilities-and-commitments` | 01 | Off-P&L exposure + provisioning honesty *(A7a)* |
| 11 | `accounting-forensics` | 01 | Computed Beneish/Dechow batteries + hygiene *(A8, A14-01/02)* |
| 12 | `regulatory-legal-and-compliance` | 00, 07 | Company-level legal/regulator sweep — current name AND every former name/predecessor — + compliance hygiene *(A9, A7-01, A14-03)* |
| 99 | `management-governance-synthesis` | ALL | Stewardship verdict + 14 scores + the assembled checklist + the Non-Negotiable Gate |

## Execution layers

- **Layer 0** (sequential, fail-fast): `governance-data-triage`
- **Layer 1** (parallel, the foundations): `management-and-track-record`, `people-integrity-dossiers`
- **Layer 2** (parallel): `capital-allocation-scorecard`, `incentives-and-compensation`, `ownership-and-insider-behavior`, `board-and-shareholder-rights`, `candor-and-disclosure-quality`, `audit-and-assurance-quality`, `related-party-and-group-forensics`, `contingent-liabilities-and-commitments`, `accounting-forensics`, `regulatory-legal-and-compliance`
- **Layer 3**: `management-governance-synthesis`

## Cross-module inputs

- business-model: `11_capital-allocation-governance` (the quick-read this deepens & supersedes), `01_disqualifier-scan` (hard disqualifiers — reference only), `12_red-flags-sweep`, `02_business-identity`
- earnings: `06_earnings-quality` (non-GAAP aggressiveness as a candor signal), `04_guidance-consensus` (guidance track record), `01_historical-financials` (the multi-year baseline for the forensic batteries)
- balance-sheet-survival: `05_off-balance-sheet-and-contingencies` (solvency-lens contingencies — 10 reads it, adds the governance lens), `01_capital-structure-and-leverage` (the debt stack for the leverage-hygiene items)

If an upstream module hasn't run, each affected agent proceeds independently and flags it.

## Stopping early

If `governance-data-triage` returns "Insufficient data," the module aborts. If data is "Partial," the module runs with caps applied per the partial-data rules in `MODULE_RULES.md` (most common: no proxy / no ownership data).

## Disqualifier deference

Hard, binary governance disqualifiers (audit qualification, going concern, promoter pledging >50%, related-party >25%, repeated auditor changes, material restatements, regulatory enforcement) are owned by `business-model/01_disqualifier-scan`. This module references them — applying a governance-risk floor and capping the verdict if one is flagged — but does not re-decide them. Its job is the richer spectrum below the hard lock.

## What Good Output Looks Like

A good run should produce:
- A management track record measured as promises-vs-delivery, not narrative
- A capital-allocation scorecard with per-share outcomes (buyback price vs value, M&A returns, reinvestment ROIC)
- The actual incentive metrics and whether they reward per-share value or size
- Insider ownership and recent net buying/selling, plus any control structure
- Board independence, voting rights, and minority-shareholder protection — down to the per-director row (attendance, tenure, boards, committee load, true independence)
- A candor read comparing prior promises to outcomes and flagging non-GAAP aggressiveness
- A graded integrity dossier on every director, KMP, and promoter individual — identity-anchored, sweep-logged, allegation-vs-conviction explicit
- The audit audited: auditor calibre, fees, rotation genuineness, component coverage, restatements
- Related-party channels quantified against the statutory slabs, and the group structure mapped for leakage
- Contingent liabilities sized, moved, and tested for provisioning honesty
- A computed Beneish M-score and Dechow F-score battery (inputs cited), cash-authenticity and revenue-quality cross-checks
- The company's regulator/court/exchange record swept and reconciled against its own disclosures
- The full Governance Checklist assembled item-by-item (Green/Amber/Red/NA + coverage) with a Non-Negotiable Gate: PASS/FAIL
- A final synthesis with a stewardship verdict (Owner-operator → Serious governance concerns) and what would change it
