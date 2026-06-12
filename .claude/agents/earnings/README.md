# Earnings Module

A module of a multi-module equity research system. This module answers:

> "What is the earnings setup for the next 3–12 months — accelerating, stable, decelerating, inflecting, or unclear?"

It does NOT produce valuations, price targets, scenarios, or ratings — those live in other modules and in the master synthesizer.

## Where things live

| What | Path |
|---|---|
| Module agent prompts | `.claude/agents/earnings/` |
| Module operating rules | `.claude/agents/earnings/MODULE_RULES.md` |
| Slash command | `.claude/commands/research/earnings.md` |
| Module outputs (per ticker) | `analyses/{TICKER}_{DATE}/earnings/` |
| Repo root cross-cutting rules | `/CLAUDE.md` |
| Master synthesizer | `.claude/agents/synthesizer.md` |

## How it's invoked

```
/research:earnings TICKER
```

The master command runs each module and then the master synthesizer:

```
/research:full TICKER
  → /research:business-model TICKER
  → /research:earnings TICKER               (this module)
  → /research:[other-module] TICKER
  → invokes .claude/agents/synthesizer.md
```

The master synthesizer reads `99_earnings-synthesis.md` alongside other module syntheses.

## Sub-agents

| # | Sub-agent | Depends on | Output |
|---|---|---|---|
| 00 | `earnings-data-triage` | — | Inventory + fail-fast |
| 01 | `historical-financials` | — | Baseline + seasonality |
| 02 | `revenue-drivers` | 01 | What moves revenue |
| 03 | `margin-drivers` | 01 | What moves margins |
| 04 | `guidance-consensus` | — | Bar assessment |
| 05 | `beat-miss-setup` | 01, 02, 03, 04 | Next-quarter setup |
| 06 | `earnings-quality` | 01 | Quality + FCF bridge |
| 07 | `earnings-sensitivity` | 01, 02, 03 | Sensitivity table |
| 08 | `earnings-red-flags` | 00–07 (reviews all) | Hidden risks, contradictions, traps |
| 99 | `earnings-synthesis` | ALL | Verdict + summary |

## Execution layers

- **Layer 0** (sequential, fail-fast): `earnings-data-triage`
- **Layer 1** (parallel): `historical-financials`, `guidance-consensus`
- **Layer 2** (parallel, depend on 01): `revenue-drivers`, `margin-drivers`, `earnings-quality`
- **Layer 3** (parallel): `beat-miss-setup`, `earnings-sensitivity`
- **Layer 4** (reviews all specialist outputs — depends on 05/06/07): `earnings-red-flags`
- **Layer 5**: `earnings-synthesis`

## Cross-module inputs

This module optionally reads business-model outputs if available:

- `03_segment-map.md` → used by `revenue-drivers`, `margin-drivers`
- `06_value-chain.md` → used by `margin-drivers`
- `10_external-dependency.md` → used by `earnings-sensitivity`, and by `revenue-drivers` + `margin-drivers` for the cycle-position read (Cycle-Position Rule in MODULE_RULES)

If business-model hasn't run, each affected agent proceeds independently.

## Stopping early

If `earnings-data-triage` returns "Insufficient data," the module aborts.
If data is "Partial," the module runs with caps applied per the partial-data rules in `MODULE_RULES.md`.

## What Good Output Looks Like

A good Earnings module run should produce:
- A clean historical baseline with TTM, seasonality, and reported vs adjusted metrics identified
- Revenue and margin drivers separated, with segment decomposition where data allows
- Consensus bar clearly assessed with revision momentum direction
- Next-quarter beat/miss setup stated with specific scenarios and magnitude thresholds
- Earnings quality tested against cash flow with the EBITDA → CFO → FCF bridge
- Sensitivities ranked by impact with realistic move sizes and confidence levels
- A final synthesis that tells the master synthesizer what matters, what is missing, and what can change the verdict
