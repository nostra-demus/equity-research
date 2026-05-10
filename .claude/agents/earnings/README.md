# Earnings Module

The earnings module answers a single question: **"what changes the numbers in the next 3–12 months?"**

It does not do valuation, position sizing, or business-model classification — those belong to other modules.

## Agents

| File | Layer | Purpose |
|---|---|---|
| `00_earnings-data-triage.md` | 0 (fail-fast) | Inventory data; issue Sufficient / Partial / Insufficient verdict |
| `01_historical-financials.md` | 1 | Build historical baseline (P&L, cash flow, balance sheet, seasonality) |
| `04_guidance-consensus.md` | 1 | Compare management guidance vs sell-side consensus and revisions |
| `02_revenue-drivers.md` | 2 | Identify what moves revenue (volume, price, mix, etc.) |
| `03_margin-drivers.md` | 2 | Identify what moves margins (inputs, pricing, mix, FX, etc.) |
| `06_earnings-quality.md` | 2 | EBITDA → CFO → FCF bridge; one-offs, accruals, channel risk |
| `05_beat-miss-setup.md` | 3 | What could cause the next 1–2 quarters to beat or miss |
| `07_earnings-sensitivity.md` | 3 | 3–7 variables with highest sensitivity; bull/bear EPS/EBITDA impact |
| `99_earnings-synthesis.md` | 4 | Final earnings module report; six scores; one verdict |

## Execution DAG

```
Layer 0:  00_earnings-data-triage  (fail-fast)
              │
              ▼
Layer 1:  01_historical-financials,  04_guidance-consensus     (parallel)
              │
              ▼
Layer 2:  02_revenue-drivers,  03_margin-drivers,  06_earnings-quality   (parallel)
              │
              ▼
Layer 3:  05_beat-miss-setup,  07_earnings-sensitivity         (parallel)
              │
              ▼
Layer 4:  99_earnings-synthesis
```

Layer assignment is keyed off the `layer:` field in each agent file's YAML frontmatter — the orchestrator self-discovers and never hardcodes names.

## Output paths

Each run writes to `analyses/{TICKER}_{DATE}/earnings/{NN}_{name}.md`. The synthesizer's final report is at `analyses/{TICKER}_{DATE}/earnings/99_earnings-synthesis.md`.

## How to invoke

```
/research:earnings TICKER
```

The slash command at `.claude/commands/research/earnings.md` is the entry point. It self-discovers agents from this folder by globbing `[0-9][0-9]_*.md`, reads each agent's frontmatter for `name`, `layer`, and `fail_fast`, groups by layer, dispatches Tasks in parallel within each layer, captures the inline returns, strips the trailing chat-confirmation block, writes to disk, and runs the fail-fast check after Layer 0.

## Cross-module business-model handoff

Before dispatching agents, the orchestrator resolves the most recent `business-model` analyses folder for the same ticker by globbing `analyses/{TICKER}_*/business-model/` and selecting the latest by directory name (which sorts correctly because of the `YYYY-MM-DD` format). If found, the path is passed to every agent's Task message as `BUSINESS_MODEL_PATH`. Agents `02_revenue-drivers`, `03_margin-drivers`, `07_earnings-sensitivity`, and `99_earnings-synthesis` use it for cross-module reads when available; all agents fall back to independent analysis when it equals the literal string `not available`. See `MODULE_RULES.md` for the full rule.

## Note on agent contents

The analytical body of each agent file is filled in by the user, not auto-generated. Each file ships as a scaffold containing only the YAML frontmatter, an HTML-comment placeholder marking where the user-written prompt body will go, and the four structural sections (`## RUNTIME INPUTS`, `## UPSTREAM INPUTS`, `## OUTPUT PATH`, `## REPORT STRUCTURE REQUIREMENTS`). Do not delete the placeholder comment when authoring the prompt body.
