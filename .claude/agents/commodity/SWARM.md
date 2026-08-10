---
id: commodity
label: Commodities
color: "#8b5cf6" # violet — must stay distinct from research amber (#c0851d) and screener teal (#1499ab); the whole cockpit accent family derives from this (ui tokens.css)
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
signal_evidence:
  emitted_suffix: .signals.json
  aggregate: signal_evidence.json
  schema: frameworks/commodity/signal_evidence.schema.json
  compiler: scripts/commodity_signal_evidence.py
  validator: scripts/commodity_signal_validation.py
  validation_registry: frameworks/commodity/validated_signals.json
# The swarm's news-wire capability (CLAUDE.md §26: self-declared, interpreted generically — the engine
# hardcodes nothing). Declaring this gives the commodities cockpit the SAME shared wire surface the
# screener uses (ui/web components/wire/*), scoped to commodity news: the rail groups + filters by this
# swarm's canonical subjects (the `## <NAME>` headings of subjects_source, stamped onto feed items as
# FeedItem.commodity by ui/server/src/news/commodities.ts), themes slice to commodity flow, and the
# per-subject pulse strip (price / CFTC COT / next reports / last verdict) reads the sources declared in
# `pulse:` (seeds pinned by scripts/verify-pulse.ts). Remove this block and the cockpit falls back to the
# plain constellation — nothing else changes.
wire:
  event_scope: commodity # the news scope bucket this wire carries (news/scope.ts vocabulary)
  group_by: subject # rail chips = the swarm's canonical subjects (GOLD, SUGAR, …) + Other
  subject_field: commodity # the FeedItem field carrying the canonical subject id
  pulse: frameworks/commodity/pulse_sources.json # enables GET /api/swarm/pulse?swarm=commodity
  default_view: latest # the rail lands on Latest (themes open one click away)
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
   for gold), price trend & technicals, futures curve / term structure — with carry placed in its own
   history, a real (deflated) price value line, and the roll-adjusted return a long actually earns.
   (dossier points 1, 2, 3, 9)
2. `supply-demand` — supply, demand, inventory, weather/seasonality, and the supply-security / policy
   register (OPEC+, export bans, sanctions, chokepoints, resource nationalism, reserves, carbon/biofuel —
   the §24 policy killer risk). (points 4, 5, 6)
3. `macro-positioning` — macro drivers (rates, USD, real yields, policy and geopolitics) and
   positioning/flows (CFTC COT both sides — speculators as a percentile + producer hedgers —
   and ETF flows). (points 7, 8)
4. `commodity-thesis` — terminal module (`depends_on` the three above): the cost-curve / fair-value
   band + margin of safety (§16/§18), upcoming reports/events, thesis summary, risk summary, relative
   attractiveness vs other tracked commodities, and the `Action:` verdict (Buy / Hold / Trim / Avoid /
   Research More). Writes `decision_record.json`. (points 10, 11, 12, 13)

There is no master synthesizer: the terminal `commodity-thesis` module IS the deliverable, and its
`Action:` verdict is the run's routing outcome (per the `routing` contract above).

## Doctrine

Every agent still obeys the root `CLAUDE.md` (§3 no source = no claim, §4 hierarchy, §5 citation, §21
plain English, §24 avoid-big-risks) and this swarm's `MODULE_RULES.md`. A commodity thesis is a
`Commodity-conditional` thesis by classification (§14): it turns on external drivers, so conviction is
capped accordingly and the verdict is honest about what it depends on.

## Learning loop

`/commodity:review <COMMODITY_OR_DUE> [WINDOW]` (`.claude/commands/commodity/review.md`) is this
swarm's twin of `/research:review-decisions` (`CLAUDE.md` §19: "a forecast that cannot be checked
later is not a forecast" — the `Action:` verdict is exactly that kind of forecast). It reads a
committed `decision_record.json`, checks the `Action:` call against what actually happened at the
30d/90d/180d/365d marks (computed from `decision_date` — the commodity schema carries no stored
`review_schedule`), and writes an append-only review to `commodity/runs/<COMMODITY>/reviews/`,
schema `frameworks/commodity/decision_review.schema.json`. It never edits `decision_record.json`.
There is no calibration/dashboard layer yet (the research swarm's `/research:calibrate` twin) —
that is the natural next step once enough reviews exist to aggregate.
