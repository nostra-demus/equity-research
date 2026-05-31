# Management-Governance Module

A module of a multi-module equity research system. This module answers:

> "Are the people running this company competent stewards of shareholder capital, and are their incentives and governance aligned with minority shareholders?"

It is the deep-dive behind the single `business-model/11_capital-allocation-governance` quick-read: management track record, the capital-allocation scorecard, incentive/compensation alignment, ownership and insider behavior, board quality and shareholder rights, and disclosure candor.

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
| 00 | `governance-data-triage` | — | Inventory + fail-fast |
| 01 | `management-and-track-record` | — | Who runs it; promises vs delivery |
| 02 | `capital-allocation-scorecard` | 01 | M&A / buybacks / dividends / reinvestment record |
| 03 | `incentives-and-compensation` | 01 | What the pay actually rewards |
| 04 | `ownership-and-insider-behavior` | 01 | Ownership, insider buying/selling, control |
| 05 | `board-and-shareholder-rights` | 01 | Board independence, voting rights, minority protection |
| 06 | `candor-and-disclosure-quality` | 01 | Truth-telling in good and bad times |
| 99 | `management-governance-synthesis` | ALL | Stewardship verdict + scores |

## Execution layers

- **Layer 0** (sequential, fail-fast): `governance-data-triage`
- **Layer 1** (sequential, the foundation): `management-and-track-record`
- **Layer 2** (parallel, depend on 01): `capital-allocation-scorecard`, `incentives-and-compensation`, `ownership-and-insider-behavior`, `board-and-shareholder-rights`, `candor-and-disclosure-quality`
- **Layer 3**: `management-governance-synthesis`

## Cross-module inputs

- business-model: `11_capital-allocation-governance` (the quick-read this deepens & supersedes), `01_disqualifier-scan` (hard disqualifiers — reference only), `12_red-flags-sweep`, `02_business-identity`
- earnings: `06_earnings-quality` (non-GAAP aggressiveness as a candor signal), `04_guidance-consensus` (guidance track record)

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
- Board independence, voting rights, and minority-shareholder protection
- A candor read comparing prior promises to outcomes and flagging non-GAAP aggressiveness
- A final synthesis with a stewardship verdict (Owner-operator → Serious governance concerns) and what would change it
