---
id: commodity
label: Commodities
color: "#caa43a"
unit: commodity
order: 3
layout: constellation
command_ns: commodity
run_root_template: commodity/runs/{COMMODITY}
placeholder: COMMODITY
runs_root: commodity/runs
board_index: commodity/board/index.json
schemas_root: frameworks/commodity
subjects_source: frameworks/commodity/COMMODITY_PROFILES.md
routing:
  verdict_field: "Action"
  # Every commodity thesis ends on ONE action-discipline verdict — all are valid terminal
  # states (a run always finishes at the terminal `commodity-thesis` module), so they all
  # sit under `terminal`. There is no mid-pipeline branch to `continue` to.
  terminal:
    - Buy
    - Hold
    - Trim
    - Avoid
    - Research More
  continue: []
sources:
  # Commodity research leans on PUBLIC PRIMARY data (§4 hierarchy: official body > exchange >
  # data vendor > reputable dated web). Agents fetch these live (WebSearch/WebFetch) and cite
  # them per §5; an optional data/<COMMODITY>/ pool holds user-uploaded notes/screenshots.
  triage:
    reject_if_unapproved: false
    note: "Prefer official bodies + exchanges over commentary; date + label every web figure (§5)."
  analysis:
    reject_if_unapproved: false
    preferred:
      # Precious metals / gold
      - World Gold Council
      - LBMA (London Bullion Market Association)
      - COMEX / CME Group
      # Agriculture / sugar
      - USDA (WASDE, FAS, NASS)
      - ISO (International Sugar Organization)
      - UNICA (Brazil sugarcane)
      - Conab (Brazil)
      - India Ministry of Agriculture / IMD (India Meteorological Department)
      # Energy / broad commodity
      - US EIA
      - IEA
      - OPEC Secretariat
      # Exchanges / futures curves
      - ICE
      - LME
      - CME Group
      - MCX (India)
      # Positioning / flows
      - CFTC Commitments of Traders
      - ETF issuer flow disclosures (SPDR/iShares/abrdn)
      # Macro / rates / FX
      - FRED (St. Louis Fed)
      - US Treasury (TIPS / real yields)
      - Federal Reserve Board
      # Data vendors (dated, labelled)
      - Platts S&P Global
      - Argus Media
      - Bloomberg
      - Reuters
    allowed_market_data: "Reputable market-data sites are allowed for spot/curve quotes when a primary source is not machine-readable; date them and label them unverified (§5)."
---

# Commodity Research Swarm

The commodity swarm gives a COMMODITY (gold, sugar, …) the same disciplined cockpit a company
gets — but built around what actually moves a commodity: price trend, the supply/demand balance,
inventory, weather/seasonality, macro drivers, positioning/flows, and the futures curve.

**Unit of work:** one commodity (`COMMODITY` — e.g. `GOLD`, `SUGAR`). Each commodity is a subject,
like a ticker in the research swarm; all commodities run the same generic modules. What differs per
commodity (which lenses apply, which sources, which recurring reports) is declared in
`frameworks/commodity/COMMODITY_PROFILES.md`, which every agent reads — no per-commodity module code.

## Modules (discovered by the engine, topo-sorted by `depends_on`)

1. `market-structure` — commodity identity, instruments/tickers (incl. CANE → raw sugar, GLD/futures
   for gold), price trend & technicals, futures curve / term structure. (dossier points 1, 2, 3, 9)
2. `supply-demand` — supply, demand, inventory, and weather/seasonality. (points 4, 5, 6)
3. `macro-positioning` — macro drivers (rates, USD, real yields, policy, geopolitics, central-bank
   buying) and positioning/flows (CFTC COT, ETF flows). (points 7, 8)
4. `commodity-thesis` — terminal module (`depends_on` the three above): upcoming reports/events,
   thesis summary, risk summary, relative attractiveness vs other tracked commodities, and the
   `Action:` verdict (Buy / Hold / Trim / Avoid / Research More). Writes `decision_record.json`.
   (points 10, 11, 12, 13)

There is no master synthesizer: the terminal `commodity-thesis` module IS the deliverable, and its
`Action:` verdict is the run's routing outcome (per the `routing` contract above).

## Doctrine

Every agent still obeys the root `CLAUDE.md` (§3 no source = no claim, §4 hierarchy, §5 citation, §21
plain English, §24 avoid-big-risks) and this swarm's `MODULE_RULES.md`. A commodity thesis is a
`Commodity-conditional` thesis by classification (§14): it turns on external drivers, so conviction is
capped accordingly and the verdict is honest about what it depends on.
