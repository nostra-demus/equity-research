# Valuation Module

A module of a multi-module equity research system. This module answers:

> "What is this company worth, what is priced in at today's price, and how much margin of safety exists?"

It produces triangulated **bull / base / bear fair-value levels** (points, with cross-method dispersion shown separately) from multiples vs own history, peer comps, DCF, reverse-DCF, and sum-of-the-parts, an explicit read of **what the current price implies**, and the **downside** to a bear-case value.

It does NOT assign scenario probabilities, compute probability-weighted returns or risk/reward, size positions, or issue a Buy/Sell rating — those live in the **master synthesizer**. This module produces the fair-value *levels*; the synthesizer turns them into a *bet*.

## Where things live

| What | Path |
|---|---|
| Module agent prompts | `.claude/agents/valuation/` |
| Module operating rules | `.claude/agents/valuation/MODULE_RULES.md` |
| Slash command | `.claude/commands/research/valuation.md` |
| Module outputs (per ticker) | `analyses/{TICKER}_{DATE}/valuation/` |
| Repo root cross-cutting rules | `/CLAUDE.md` |
| Master synthesizer | `.claude/agents/synthesizer.md` |

## How it's invoked

```
/research:valuation TICKER
```

Under the master command it runs LAST, after the modules it depends on:

```
/research:full TICKER
  → /research:business-model TICKER
  → /research:earnings TICKER
  → /research:valuation TICKER              (this module — reads both above)
  → invokes .claude/agents/synthesizer.md
```

The master synthesizer reads `99_valuation-synthesis.md` and, per its own instructions, defers its "Valuation and Peer Mispricing" section to this module when the module is present.

## Sub-agents

| # | Sub-agent | Depends on | Output |
|---|---|---|---|
| 00 | `valuation-data-triage` | — | Inventory + fail-fast |
| 01 | `price-and-capital-structure` | — | Price, shares, EV bridge (the anchor) |
| 02 | `multiples-own-history` | 01 | Cheap/expensive vs own multiple history |
| 03 | `relative-valuation-peers` | 01 | Peer comp table + relative fair value |
| 04 | `intrinsic-dcf` | 01 | DCF fair value + sensitivity grid |
| 05 | `reverse-dcf` | 01, 04 | What's priced in at today's price (inverts 04's model) |
| 06 | `sum-of-the-parts` | 01 | Segment-by-segment breakup value |
| 07 | `scenario-and-fair-value` | 02–06 | Triangulated bull/base/bear fair-value levels |
| 99 | `valuation-synthesis` | ALL | Verdict + bull/base/bear fair-value levels (+ dispersion) + scores |

## Execution layers

- **Layer 0** (sequential, fail-fast): `valuation-data-triage`
- **Layer 1** (sequential, the anchor): `price-and-capital-structure`
- **Layer 2** (parallel, depend on 01): `multiples-own-history`, `relative-valuation-peers`, `intrinsic-dcf`, `sum-of-the-parts`
- **Layer 3** (depends on 04 — inverts the same model): `reverse-dcf`
- **Layer 4** (triangulation): `scenario-and-fair-value`
- **Layer 5**: `valuation-synthesis`

## Cross-module inputs

This module reads BOTH upstream modules if available:

- business-model: `03_segment-map` (SOTP), `08_competitive-map` (peers), `07_business-quality` + `09_moat` (warranted multiple), `10_external-dependency` (cyclicality haircut)
- earnings: `01_historical-financials` (levels base), `04_guidance-consensus` (forward estimates), `03_margin-drivers`, `07_earnings-sensitivity` (bull/base/bear ranges), `06_earnings-quality` (GAAP vs adjusted base)

If an upstream module hasn't run, each affected agent proceeds independently and flags it.

## Stopping early

If `valuation-data-triage` returns "Insufficient data," the module aborts.
If data is "Partial," the module runs with caps applied per the partial-data rules in `MODULE_RULES.md`. The most common partial case is **no current price** — the module still produces the bull/base/bear fair-value levels and an implied price, and flags that observed up/downside cannot be computed.

## What Good Output Looks Like

A good Valuation module run should produce:
- A clean price → market-cap → enterprise-value bridge with the current price sourced and dated (or the gap flagged)
- The stock judged against its own multiple history AND against named peers
- An intrinsic DCF with every assumption sourced and terminal value disclosed as a % of EV
- A reverse-DCF stating exactly what growth/margin the current price implies, judged against earnings evidence
- A sum-of-the-parts breakup value for multi-segment businesses, with each segment multiple tied to a named comparable
- Triangulated bull/base/bear fair-value levels (points, with cross-method dispersion shown separately), the margin of safety (discount to base fair value), and the downside-to-bear stated
- A final synthesis that tells the master synthesizer what it's worth, what's priced in, where the downside is, and which method to trust
