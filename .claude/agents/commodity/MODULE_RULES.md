# Commodity Swarm — Module Rules

Operating rules for every agent in the commodity swarm. These sit ON TOP of the root `CLAUDE.md`
(which always wins where it is stricter, §23) and the swarm manifest `SWARM.md`. They do not repeat
the constitution; they adapt it to commodities.

---

## 1. What we are analysing

The unit of work is a **commodity** (gold, sugar, …), not a company. There are no filings. The job is
to read the drivers that actually move the price — supply/demand and its buffer, weather/seasonality,
macro (rates/USD/real yields/policy), positioning/flows, and the futures curve — and land on an honest
action verdict for the exposure the portfolio holds (or could hold).

The per-commodity specifics — which lenses apply, the instruments, the priority sources, the recurring
reports — live in `frameworks/commodity/COMMODITY_PROFILES.md`. Read the `## <COMMODITY>` section first
and apply ONLY the lenses it marks relevant. Do not force a real-yield analysis onto sugar or a monsoon
analysis onto gold.

## 2. Source hierarchy for commodities (refines §4)

Most trusted to least, for commodity facts:

1. Official statistical bodies and balances — USDA (WASDE/FAS/NASS), World Gold Council, LBMA, ISO,
   UNICA, Conab, IMD, EIA, IEA, OPEC.
2. Exchanges and settlement data — ICE, CME/COMEX, LME, MCX (prices, curves, warehouse stocks).
3. Regulatory positioning data — CFTC Commitments of Traders; ETF/ETC issuer holdings disclosures.
4. Macro/rates/FX primary data — FRED, US Treasury (TIPS/real yields), the Fed and other central banks.
5. Recognised data vendors, dated and labelled — Platts/S&P Global, Argus, Bloomberg, Reuters.
6. Reputable dated web sources, labelled unverified.
7. Inference, labelled as such.

When sources conflict, take the more conservative reading and prefer the official balance over a
vendor estimate (§4). Cite the source the number actually came from (§5) — never attach a vendor number
to an official body's name.

**External data (`data/<COMMODITY>/external/<provider>/` — `frameworks/EXTERNAL_DATA.md`).** The user's
paid or collected commodity research — satellite crop analytics, paid ag/energy analytics reports,
broker commodity research, trade-house or field channel checks — enters through the same external-data
lane the research swarm uses, with a `.source.json` provenance sidecar per document. Map it INTO this
hierarchy: a measured/licensed dataset (satellite acreage, paid analytics panel) sits at the
recognised-data-vendor tier (5 above), always labelled estimate-based with the vendor's stated error
margin; broker commodity research is verdict-stripped colour below it; a field channel check or expert
call is a user-collected note, dated, N stated. External data never substitutes an official balance or
exchange print it disagrees with — surface the conflict, conservative reading wins (§4). It CAN be the
edge: a quantified divergence from the official balance, cited with provider + as-of + margin, is
exactly what the thesis synthesis should weigh.

## 3. Citation (§5, adapted)

Every material figure is cited `[Source, period/contract, date]`, e.g. `[USDA WASDE, 2026-06, 2026-06-12]`,
`[WGC Gold Demand Trends Q1-2026]`, `[CFTC COT, 2026-06-24]`, `[FRED DFII10, 2026-06-30]`, `[ICE #11 front,
settle 2026-06-30]`. A web quote with no primary equivalent is dated and labelled unverified. Bare
"market data" or "analysts say" is banned.

## 4. Units, currency, and time (§15/§27, adapted)

- State the quote unit and currency every time (USD/oz for gold; US¢/lb for ICE #11 raw sugar; ₹/quintal
  for Indian domestic sugar). Never mix units without conversion.
- Give the as-of date for every price and every stock/flow reading. A commodity price is only as good
  as its timestamp.
- Distinguish **spot / front-month / deferred** and **the physical commodity vs the instrument** (an
  ETF/ETC has fees and roll drag — CANE is not raw sugar, GLD is not spot gold).

## 4a. Driver attribution — show the arithmetic, name the residual (§15)

Commodity theses are driver stories, so this is where the engine is most likely to assert a cause it never
computed. Root §15 requires any driver-attribution claim to print its own arithmetic, carry the sensitivity's
own basis, and state the unexplained residual. In this swarm, write it as ONE line, in this form, every time:

```
Attribution: <driver> <move> × <sensitivity, WITH ITS BASIS> [Source, date]
  = <modelled move in the price's own units> of the <observed move> observed
  → <N>% explained, <100−N>% residual (unattributed).
```

Worked, from the failure this rule exists for:

```
Attribution: 10y REAL yield +50bp × ~1.75% per 25bp — NOMINAL-yield basis [WGC, …]
  = −3.5% ≈ −$196 of the −$1,405 (−25.1%) observed
  → BASIS MISMATCH: this coefficient is not measured on real yields, so it cannot be applied here.
    Even taken at face value it explains ~14%; ~86% is residual. "Tracks almost exactly" is false.
```

Three rules follow, and they bind every commodity agent:

- **The adjective must match the number.** "Accounts for the bulk of", "explains most of", "tracks almost
  exactly" require the printed arithmetic to clear ~50%. Below that, say what it actually explains.
- **A sensitivity carries its basis like a currency figure carries its FX rate.** Nominal vs real yield,
  breakeven, trade-weighted vs bilateral dollar, spot vs forward — name it, and refuse the claim outright
  when the basis does not match the move being explained. Do not silently substitute.
- **A large residual is the finding, not a caveat.** A price mostly unexplained by the named driver means
  the thesis does not yet know what moved it — that caps conviction (§11/§12) and belongs in the risk
  summary, not in a closing hedge sentence.

## 5. Action discipline (the verdict)

The terminal `commodity-thesis` module emits ONE `Action:` verdict — `Buy`, `Hold`, `Trim`, `Avoid`, or
`Research More` — matching the `SWARM.md` routing contract exactly. Rules:

- Do not force a Buy (§18/§24). Survival over return: prefer `Avoid`/`Trim` to owning a bad setup.
- `Research More` is the honest default when a module came back Insufficient or a key series (balance,
  positioning) could not be reached — never paper over a gap with false confidence (§1/§11).
- A commodity thesis is `Commodity-conditional` (§14): it depends on external drivers, so conviction is
  capped — say what it depends on and what would flip it.

## 6. Banned phrases (adds to §21)

Unless paired with a specific cited number in the same sentence, do not write: "prices should rise",
"supportive backdrop", "tight fundamentals", "well supported", "poised to rally", "structural bull
market", "safe haven" (as an assertion), "supply crunch". Replace each with the cited figure that
would justify it, or drop it.

## 7. Weather and forecasts

Weather is a RISK to the balance, not a certainty. State the current observed condition (with the met
agency + date) and the range of outcomes — never present a seasonal forecast as a settled fact. ENSO
(El Niño/La Niña) signals are probabilistic; label them so.

## 8. Signal evidence contract — one fact, one causal owner

An orb whose frontmatter declares `emits_signal_evidence: true` writes TWO sibling outputs: its normal
markdown report at `OUTPUT_PATH`, and strict JSON at `SIGNAL_OUTPUT_PATH` (same basename,
`.signals.json`). The sidecar is not optional. It is the machine evidence behind the prose. Use only one
of the orb's declared `signal_families` as each row's `economic_cluster`; the deterministic compiler
rejects a family claimed by any other owner. This prevents the same fact from voting twice. In Gold,
official-sector activity is demand/inventory, ETF holdings/flows are positioning, real yields and the
broad USD are macro, and relative ratios belong to the cross-asset-regime orb when that orb exists.

Write this exact envelope:

```json
{
  "schema_version": 1,
  "commodity": "GOLD",
  "owner_orb": "commodity-macro-drivers",
  "generated_at": "2026-08-10T00:00:00Z",
  "signals": [],
  "correlation_edges": []
}
```

Each `signals[]` row is a `SignalEvidence` record with:

- `signal_id`: stable lowercase slug, not a date-specific label;
- `economic_cluster`: one family declared by this orb;
- `role`: `driver`, `confirmation`, `risk`, `catalyst`, or `context`;
- `horizon`: `tactical`, `strategic`, or `both`;
- `direction`: `bullish`, `bearish`, or `neutral`; and `strength` from 0 to 1;
- `as_of` and nullable `expiry`, both full ISO-8601 timestamps;
- `source_vintage_ids`: the immutable IDs of the observations used. A live/manual fact without an
  accepted connector vintage uses an explicit `unvintaged:<source>:<as-of>` token. It remains visible
  but cannot lift conviction;
- `source_vintage_refs`: one `{dataset_id, series_id, subject, vintage_id}` locator for every accepted
  `sha256:` vintage ID, so the evidence can be resolved rather than merely named. Use `[]` for explicit
  unvintaged/missing/manual-unverified tokens; those rows remain non-conviction context. The compiler
  resolves each locator through the connector-v2 history and rejects it for conviction if its retrieval
  occurred after this evidence bundle's `generated_at` decision time;
- `signal_kind`: `observational` or `statistical`; a statistical row also names its stable
  `validation_ref` (normally equal to `signal_id`). Never self-label it validated — only
  `scripts/commodity_signal_validation.py` can put it in the committed validation registry;
- optional `numerator_series_id` and `denominator_series_id` for a ratio, plus `contradicts[]` naming
  incompatible signal IDs. Emit opposing facts as separate rows and link them; never average them away.

`correlation_edges[]` is optional and may only contain a measured relationship between two emitted
signal IDs: `signal_a`, `signal_b`, `correlation`, `window_start`, `window_end`,
`observation_count`, `frequency: weekly`, `method: pearson`, and the immutable
`source_vintage_ids` and matching `source_vintage_refs` for the histories used. The compiler merges it only at absolute correlation >= 0.70 with at least three
years and 150 weekly observations. A claimed coefficient without that span stays non-merging context.

The compiler writes `<RUN_ROOT>/signal_evidence.json`, aggregates each independent cluster by median
strength, and counts clusters rather than raw rows. A cluster containing both bullish and bearish
directions is explicitly `contradiction: true` and is never conviction-eligible. A statistical signal
is contextual unless the registry proves point-in-time walk-forward validation across at least three
regimes and 30 non-overlapping outcomes, the expected sign in four of five folds, improvement over a
cost-adjusted naive baseline, a positive out-of-sample block-bootstrap confidence interval, stable
lookbacks, and 10% false-discovery control.

### 8A. Profile evidence coverage is a decision gate

The current commodity's `Required semantic series` table in
`frameworks/commodity/COMMODITY_PROFILES.md` is binding. Inventory every row before analysis and again
at terminal synthesis. A connector declaration, reachable URL, successful historical run, or file with
no accepted provenance vintage is not evidence. A connector-backed row is usable only when its accepted
current projection and sidecar agree, its connector-v2 status is `current` or `no_new_release`, and its
retrieval was available at the decision time. A lawful shared market source named by the profile may
satisfy a row without a duplicate connector, but it must carry its own as-of date and source identity.

For each required row record: need ID, stable series ID, owner orb, status, as-of, retrieval/vintage ID,
and the exact reason when unusable. `manual`, `no_pool`, `stalled`, `schema_failed`, `suspect`,
`credentials_missing`, `broken`, or `quarantined` is a visible gap, never implicit coverage. An
unvintaged live-web fact may explain context but cannot raise sufficiency or conviction. The causal owner
must mark a missing required row as failed/not assessable and emit the data need rather than substitute a
weaker source silently.

After all orbs finish, run `scripts/commodity_profile_coverage.py` at the decision-time cutoff. Its
`required_series_coverage.json` is binding and is hash-linked from the decision record. Any required
semantic series that remains unusable makes BOTH horizons `not_assessable`. The deterministic forecast
contract rejects any stronger call and mechanically produces `Research More`, unless independently proven
critical risk forces `Avoid`. Coverage schema v3 hashes both the exact human/structured profile bytes and
`required_series_sources.json`, which freezes the selected pulse, shared-market and derived vintages.
The archive helper freezes both artifacts under the decision archive; historical replay must use that
frozen resolver/quality roster and source snapshot, never today's possibly renamed profile, live pulse or
expanded shared-market directory, while still resolving connector rows from immutable vintage history.
Never fall back to a stale dossier or to a methodology report. WILTW, its
supporting files, and report-derived assertions are method-transfer material only and are forbidden as
runtime evidence or Gold provenance.

## 9. Physical supply bridge and opacity cap

Never equate gross production with supply available to the global buyer. The supply-demand synthesis
must reconcile one physical bridge, in consistent units, with a visible residual:

```
origin gross production + releases/recycling + net imports
− origin domestic absorption − origin stock build
= origin pre-policy exportable supply

On world consolidation, the sum of all origins' net imports is zero:
world production + releases/recycling − world absorption − world stock build
− restricted/sanctioned volume − physically stranded volume
+ verified rerouting that reaches an unrestricted buyer
= globally accessible supply
```

The supply orb owns production and domestic absorption; supply-security owns restrictions, sanctions,
chokepoints and rerouting. The synthesis adjudicates the bridge and rejects double-counting. Exchange
delivery ineligibility is not automatically lost production, and a rerouted unit is not fully accessible
unless destination, discount, transport delay and settlement/insurance limits support that conclusion.
Imports and exports may reconcile an individual origin, but they are transfers and cancel from the
consolidated world bridge. A produced unit cannot re-enter world supply merely because it was traded.

Supply opacity is measured, never described from vibes. The synthesis passes primary-source production
coverage, estimate dispersion and release-cycle lateness to `scripts/commodity_analytical_contracts.py`.
High opacity — primary coverage below 70%, estimate dispersion above 15%, over two release cycles late,
or any unmeasured audit input — caps the supply-demand score at 45. Medium opacity caps it at 65. The
cap can only reduce the raw score. This is a **directional-conviction score**: higher means stronger
evidence for the separately stated surplus/deficit direction. It never means more bullish, tighter supply,
or better availability; a well-proven surplus and a well-proven deficit can both score highly.

## 10. Independent distribution before action

The volatility-distribution orb owns the empirical return envelope, drawdowns, skew and event gaps. The
scenario-engine orb then constructs bear/base/bull independently of the terminal thesis and before any
action exists. The terminal synthesis consumes that pack; it may make a disclosed conservative downgrade,
but it may not replace it with a narrower or more favourable distribution.

A scenario set fails when it does not cover the applicable matching-regime 10th/90th percentile bounds,
does not include the killer-risk tail/event gap, or hides several independent conditions inside one case
without a joint-probability basis. Missing lawful history, fewer than 30 non-overlapping outcomes, or a
failed span audit makes the distribution `not_assessable` and the action `Research More`, unless a proven
critical risk independently forces `Avoid`.

## 11. Dual-horizon forecast and mechanical action

Every fresh commodity decision carries two independent forecasts:

- **Tactical:** default 60 calendar days; any cited catalyst-driven horizon from 30 through 92 days.
- **Strategic:** default 365 calendar days; any cited catalyst-driven horizon from 182 through 548 days.

Each horizon is either `assessable` or `not_assessable` with one exact reason. An assessable horizon carries
its own scenarios, probabilities, target date, price/roll/collateral/fees/FX return components, expected
implementable return, loss probability, worst downside, risk/reward, duration-matched cash hurdle,
confidence, catalysts and falsifiers. Never blend horizons, probabilities or expected returns.

Classify each horizon mechanically:

- `positive`: expected implementable return is above the duration-matched cash hurdle, risk/reward is at
  least 0.5, and loss probability is below 50%;
- `negative`: expected implementable return is below cash OR loss probability is at least 60%;
- `mixed`: every assessable state between those boundaries.

Then apply this matrix, with tactical down the rows and strategic across the columns:

| Tactical / Strategic | Positive | Mixed | Negative |
|---|---:|---:|---:|
| Positive | Buy | Hold | Trim |
| Mixed | Hold | Hold | Avoid |
| Negative | Trim | Trim | Avoid |

Any `not_assessable` horizon forces `Research More`, unless a proven critical risk with a cited source
forces `Avoid`. Map the derived action to target exposure: Buy 1.0 risk unit, Hold 0.5, Trim 0.25, Avoid 0,
Research More `null`. `forecast_confidence` is the lower horizon confidence; calibration, red flags and
pre-mortems may lower confidence, action or exposure but can never raise them. The deterministic authority
is `scripts/commodity_forecast_contract.py`; prose that disagrees with it fails validation.
