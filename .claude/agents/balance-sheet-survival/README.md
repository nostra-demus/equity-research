# Balance-Sheet-Survival Module

A module of a multi-module equity research system. This module answers:

> "Can this company service and refinance its obligations — and what happens to it in a downside?"

It maps the debt stack and leverage, the maturity wall and refinancing exposure, the liquidity runway, coverage and covenant headroom, and off-balance-sheet/contingent liabilities — then runs a **downside EBITDA stress test** and states a survival verdict.

It does NOT value the company (that's the **valuation module**), forecast earnings (that's **earnings**), or assign probabilities / size positions / issue a rating (that's the **master synthesizer**). It produces the survival *read*; the synthesizer folds it into the risk register and verdict.

## Where things live

| What | Path |
|---|---|
| Module agent prompts | `.claude/agents/balance-sheet-survival/` |
| Module operating rules | `.claude/agents/balance-sheet-survival/MODULE_RULES.md` |
| Slash command | `.claude/commands/research/balance-sheet-survival.md` |
| Module outputs (per ticker) | `analyses/{TICKER}_{DATE}/balance-sheet-survival/` |
| Repo root cross-cutting rules | `/CLAUDE.md` |
| Master synthesizer | `.claude/agents/synthesizer.md` |

## How it's invoked

```
/research:balance-sheet-survival TICKER
```

Under the master command it runs after business-model and earnings:

```
/research:full TICKER
  → /research:business-model TICKER
  → /research:earnings TICKER
  → /research:balance-sheet-survival TICKER   (this module — reads both above)
  → /research:valuation TICKER
  → invokes .claude/agents/synthesizer.md
```

The master synthesizer reads `99_balance-sheet-survival-synthesis.md` and, per its own instructions, defers its "Balance Sheet and Survival Test" section to this module when the module is present.

## Sub-agents

| # | Sub-agent | Depends on | Output |
|---|---|---|---|
| 00 | `solvency-data-triage` | — | Inventory + fail-fast |
| 01 | `capital-structure-and-leverage` | — | Debt stack + gross/net leverage |
| 02 | `maturity-wall-and-refinancing` | 01 | Maturity schedule + refi exposure |
| 03 | `liquidity-runway` | 01, 02 | Committed liquidity vs near-term obligations |
| 04 | `coverage-and-covenants` | 01 | Coverage ratios + covenant headroom |
| 05 | `off-balance-sheet-and-contingencies` | 01 | Leases, pensions, guarantees, litigation |
| 06 | `downside-stress-test` | 01–05 | EBITDA −30/−40/−60% survival test |
| 99 | `balance-sheet-survival-synthesis` | ALL | Verdict + survival score |

## Execution layers

- **Layer 0** (sequential, fail-fast): `solvency-data-triage`
- **Layer 1** (sequential, the foundation): `capital-structure-and-leverage`
- **Layer 2** (parallel, depend on 01): `maturity-wall-and-refinancing`, `coverage-and-covenants`, `off-balance-sheet-and-contingencies`
- **Layer 3** (depends on 02 — needs the maturity wall): `liquidity-runway`
- **Layer 4** (the survival test): `downside-stress-test`
- **Layer 5**: `balance-sheet-survival-synthesis`

## Cross-module inputs

- business-model: `10_external-dependency` (cyclicality → stress depth), `11_capital-allocation-governance` (debt trajectory, pledging), `03_segment-map` (asset-sale capacity)
- earnings: `01_historical-financials` (EBITDA/CFO/FCF/net debt), `06_earnings-quality` (is the EBITDA cash-backed?), `03_margin-drivers` (downside margin)

If an upstream module hasn't run, each affected agent proceeds independently and flags it.

## Stopping early

If `solvency-data-triage` returns "Insufficient data," the module aborts. If data is "Partial," the module runs with caps applied per the partial-data rules in `MODULE_RULES.md` (most common: no maturity schedule or no covenant disclosure).

## What Good Output Looks Like

A good run should produce:
- A clean debt stack with gross AND net leverage, and the leverage trend
- A maturity wall by year with the refinancing exposure (fixed/floating, coupon vs market)
- A liquidity runway in months against near-term obligations, using committed facilities only
- Coverage ratios and the actual headroom to the tightest covenant
- Off-balance-sheet and contingent exposures with recorded vs maximum amounts
- A downside stress test showing the EBITDA decline at which covenants break or liquidity runs out
- A final synthesis with a survival verdict (Fortress → Distress risk) and what would change it
