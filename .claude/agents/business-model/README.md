# Business-Model Module

A module of a multi-module equity research system. This module answers:

> "What does this company actually do, how does it make money, and is the business model good enough to deserve deeper work?"

It does NOT value the company, generate scenarios, or produce ratings — those live in other modules and in the master synthesizer.

## Where things live

| What | Path |
|---|---|
| Module agent prompts | `.claude/agents/business-model/` |
| Module operating rules | `.claude/agents/business-model/MODULE_RULES.md` |
| Module orchestrator | `.claude/agents/business-model/run.sh` |
| Module outputs (per ticker) | `analyses/{TICKER}_{DATE}/business-model/` |
| Repo root cross-cutting rules | `/CLAUDE.md` |
| Master synthesizer | `.claude/agents/synthesizer.md` |

## How it's invoked

This module has its own slash command:

```
/research:business-model TICKER
```

The repo's master command runs each module command and then the master synthesizer:

```
/research:full TICKER
  → /research:business-model TICKER          (this module)
  → /research:[other-module] TICKER          (other modules as added)
  → invokes .claude/agents/synthesizer.md    (final thesis)
```

The master synthesizer reads each module's synthesis output (including this module's `99_business-model-synthesis.md`) and produces the final buy-side thesis.

## Sub-agents

| # | Sub-agent | Depends on | Output |
|---|---|---|---|
| 00 | `data-triage` | — | Inventory + fail-fast verdict |
| 01 | `disqualifier-scan` | — | 8 hard disqualifiers, Y/N each |
| 02 | `business-identity` | — | What it does + revenue formula |
| 03 | `segment-map` | — | Segment table + dominant segment |
| 04 | `unit-economics` | 03 | Natural unit + 5-row table |
| 05 | `customer-geography` | — | Customer + geography concentration |
| 06 | `value-chain` | 02 | Value-chain position |
| 07 | `business-quality` | 03, 05 | 10-factor quality table |
| 08 | `competitive-map` | 02, 03 | 2–3 named competitors |
| 09 | `moat` | 08 (07, 10 optional) | Moat sources + competitive economics |
| 10 | `external-dependency` | — | External variables + classification |
| 11 | `capital-allocation-governance` | — | 13-signal governance table |
| 12 | `red-flags-sweep` | most prior | Catch-all flags |
| 99 | `business-model-synthesis` | ALL | Abstract + verdict + summary |

## Execution layers

- **Layer 0** (sequential, fail-fast): `data-triage`
- **Layer 1** (parallel): `disqualifier-scan`, `business-identity`, `segment-map`, `customer-geography`, `external-dependency`, `capital-allocation-governance`
- **Layer 2** (parallel): `unit-economics`, `value-chain`, `competitive-map`, `business-quality`
- **Layer 3**: `moat`
- **Layer 4**: `red-flags-sweep`
- **Layer 5**: `business-model-synthesis`

## Independent reads

Each sub-agent reads `data/{TICKER}/` independently and extracts what it needs. No shared manifest. Inconsistencies between sub-agents on the same number are reconciled by `99_business-model-synthesis.md`.

## Stopping early

If `data-triage` returns "Insufficient data," `run.sh` aborts the module run.
If `disqualifier-scan` triggers any of the 8 hard disqualifiers, `99_business-model-synthesis.md` locks the module verdict at "Low-quality business — avoid deeper work" regardless of other scores.
