# Commodity Orbs — State-of-the-Art Architecture Review

A one-time design review of the commodity swarm's orb set, judged against how the best commodity
investors decompose a thesis, and the build plan it produced. This is a **design doc**, not doctrine —
`SWARM.md`, `MODULE_RULES.md`, and the root `CLAUDE.md` still govern. It records *why* the orbs are
shaped the way they are after this review, so a future maintainer does not re-litigate it.

Method: ten independent expert lenses (physical merchant desk, global-macro, systematic/CTA, fundamental
cost-curve, vol/options, ag & softs, energy, metals, geopolitics, risk/portfolio) each judged the live orb
inventory, marking every must-check primitive covered / partial / absent; a synthesis deduped them; an
adversarial pass challenged each candidate under `CLAUDE.md` §2 (reuse before build) and §24 (avoid bloat);
a final stage ranked the survivors. Every recommendation is justified by *what a world-class investor would
be blind to without it*, and every one is reachable from free public primary data at anchor / proxy grade.

---

## 1. Verdict

The pre-review 10-orb set was a **competent screen-reader, not yet a world-class commodity brain** — it read
the futures curve, official balances, macro direction, and headline positioning cleanly (ahead of a naive
momentum screen), but sat roughly **55–60% of the way to world-class**. The four-module spine is the *right*
decomposition; the gaps were **orb-level and deepen-level, not module-level**. An equity-style valuation
*module* would be ~80% irrelevant machinery on a no-cash-flow asset — so **no new module is added**.

## 2. The four things that held it back

1. **No fair-value anchor (§16 / §18).** The engine emitted Buy/Hold/Trim/Avoid with no floor, no ceiling,
   no margin of safety — a pure flow call. For a no-cash-flow asset the **cost curve is the DCF-equivalent**.
   The single biggest gap; four lenses converged on it.
2. **No roll-adjusted return, and a prose-only risk summary.** A correct spot call held through contango was
   booked as a win when the carry was bleeding it dry — a genuine commodity-specific blind spot with no
   equity analog.
   - *Correction discovered during build:* `decision_record.schema.json` **deliberately** omitted a §10
     scenario/forecast ledger ("§10 scenario math does not apply to the single-verdict commodity dossier"),
     so this review recorded "§10 is a standing compliance hole" as a mis-framing and scoped the fix to the
     **roll-adjusted return** + a **§16 fair-value band**.
   - ***That correction was itself wrong, and is now reversed (2026-08-07).*** The schema cannot exempt a
     module from a root standard — §23 lets a module ADD detail, never relax one. And the exemption did not
     even hold on its own terms: §10 attaches its requirements wherever a bear-case price exists, and the
     dossier states one (the cost-curve orb's bear anchor, and `key_levels.support`). The cost of the
     exemption showed up in the first real dossier: GOLD spoke of "today's probability-weighted reality"
     while carrying no probabilities, no expected return, and no forecast §19's ledger could ever grade.
     The deliberate schema change this bullet said would be needed has now been made on its own, as it
     asked: `scenario_horizon_days` / `scenarios[]` / `expected_return_pct` / `downside_risk_pct` /
     `risk_reward`, additive and date-gated (`COMMODITY_SCENARIO_GATE_DATE`), re-derived by
     `check_commodity_scenario_math` rather than trusted. Roll-adjustment is now carried INSIDE the
     scenario returns, which is where it binds the call instead of sitting beside it.
3. **Siloed macro read (§14).** `macro-drivers` reads one commodity at a time, so the engine cannot answer
   the first question a global-macro PM asks — *is this commodity alpha or regime beta?* — and can issue a
   confident Buy the whole complex is rejecting.
4. **No owner for the policy tail (§24).** Policy & geopolitics is the dominant driver for most of the
   12-commodity universe and the top source of overnight repricings, yet it sat as scattered one-liners no
   orb owned with an expiry and a flip trigger.

Underneath all four: the engine read every signal as a static **level**, never as a placement in its own
distribution (z-score / percentile) — exactly the extremity a systematic desk trades on.

## 3. The plan — add 3 orbs, deepen 8, 0 new modules (10 → 13 orbs)

**New orbs**
| Orb | Module | Closes | Priority |
|---|---|---|---|
| `commodity-cost-curve` (cost-curve / fair-value) | commodity-thesis | §16 / §18 fair-value anchor | P0 |
| `commodity-supply-security` (policy register) | supply-demand | §24 policy tail | P0 |
| cross-asset / macro-regime | macro-positioning | §14 "regime in disguise" | P1 |

**Deepen existing**
| Orb | Add | Priority |
|---|---|---|
| `commodity-price-curve` | carry percentile · cash-and-carry/convenience-yield verdict · real-price value line · roll-adjusted return | P0 |
| `commodity-positioning-flows` | producer/merchant hedger leg · managed-money percentile/z-score · futures+options combined · (P2) vol-regime line | P0 |
| `commodity-thesis-synthesis` | fair-value band + margin of safety into `key_levels` · roll-adjusted view · policy killer risk (no §10 ledger) | P0 |
| `commodity-supply` | OPEC+ spare capacity · shale rig→DUC→frac · producer AISC rows · TC/RCs (profile-gated) | P1 |
| `commodity-demand-inventory` | ag export-pace nowcast · metals cancelled-warrant read | P1 |
| `commodity-weather-seasonality` | realized crop-condition nowcast (G/E % · GDD · precip anomaly · NDVI/SMAP) | P1 |
| `commodity-catalysts` | dated policy-decision calendar · per-event implied move | P2 |

## 4. Do NOT add (the discipline)

- **Full 5-in-1 physical-market orb** — the price-leading core is three narrow deepens (cancelled warrants →
  demand, TC/RCs → supply, cash-3M basis → curve); the rest is the most paywalled data on the board
  (Platts/Argus/Fastmarkets, spot freight, lease/GOFO) and would break the public-primary-first contract.
- **Standalone vol/options-surface orb** — its headline output is an options *expression*, but the swarm has
  no sizing/execution layer to receive it (orphaned output); four ICE softs have no free vol index. Capture
  only the reachable vol-regime paragraph in positioning (P2).
- **Standalone systematic factor scoreboard** — duplicates price-curve / positioning / macro-drivers; its
  unique cross-commodity *rank* needs cross-run plumbing, not a data pull. Absorb the extremity (z-score)
  read into the deepens.
- **Scenario-sizing as a 7-in-1 terminal orb** — the survival core (roll-adjusted return + fair-value band)
  belongs *in* the synthesizer (§22); a Kelly / vol-target / stop layer should mirror the equity engine's
  `research:size`, which is a ledger-level *command*, not a per-run orb. Build that later if wanted.
- **Dealer gamma / GEX · correlation to the user's actual book** — gamma needs the dealer sign of option OI
  (not free); a book-correlation needs a portfolio object that does not exist in a single-commodity swarm.
- **Producer-ranked cost-curve percentile · Wood Mac / CRU / Kpler feeds** — vendor-gated. The reachable
  substitute is an anchor-grade *band* (WGC Goldhub AISC, Dallas Fed breakeven, USDA ERS) + public parity
  math, labelled as a band, never a precise percentile.
- **An equity-style valuation module** — ~80% irrelevant to a no-cash-flow asset. One tightly-scoped
  cost-curve orb is the correct object.

## 5. Build order (highest-leverage first)

Steps 1–5 are the must-do core that closes every doctrine hole; 6–10 make the engine complete.

1. `commodity-cost-curve` fair-value orb [P0] — the biggest gap; defines the floor.
2. positioning COT deepen [P0] — cheapest high-value win (same free CFTC file).
3. price-curve deepen [P0] — roll-adjusted return; feeds the fair-value reverse read.
4. thesis-synthesis deepen [P0] — fair-value band + roll-adjusted view + policy killer risk (no §10 ledger).
5. `commodity-supply-security` policy register [P0] — the §24 survival tail.
6. supply deepen [P1] · 7. macro-regime orb [P1] · 8. ag deepens (demand nowcast + crop condition) [P1] ·
   9. catalysts policy-calendar + implied move [P2] · 10. vol-regime paragraph in positioning [P2].

## 6. Status — what has landed

**Steps 1–5 (the P0 core) are implemented in this change:**
- NEW `.claude/agents/commodity/commodity-thesis/02_commodity-cost-curve-fair-value.md` (`commodity-cost-curve`).
- NEW `.claude/agents/commodity/supply-demand/04_commodity-supply-security.md` (`commodity-supply-security`).
- DEEPENED `.claude/agents/commodity/market-structure/02_commodity-price-curve.md`,
  `.claude/agents/commodity/macro-positioning/02_commodity-positioning-flows.md`,
  `.claude/agents/commodity/commodity-thesis/99_commodity-thesis-synthesis.md`, and its consumer
  `.claude/agents/commodity/supply-demand/99_supply-demand-synthesis.md` (wires the policy killer risk forward).
- `SWARM.md` module descriptions updated to match.

Steps 6–10 (P1/P2) are **not yet built** — this doc is the standing spec for them. The decision_record JSON
shape is unchanged (§10 note above), so the schema and its fixtures are untouched.

## 7. Reachability caveat

Every new component is free-public at anchor / proxy grade. The physical, vol, and cost-curve legs **degrade
gracefully and stay labelled** where free data thins — especially the four ICE softs (sugar/coffee/cocoa/
cotton have no free vol index). A vendor-ranked cost curve is out of reach and out of scope; the fair-value
orb ships an anchor-grade band, never a false-precise percentile (§11 cap enforced in the orb).

## 8. 2026-08-10 predictive-programme supersession

The earlier status above is historical, not the current runtime contract. The predictive upgrade subsequently
added the cross-asset-regime, volatility-distribution and independent-scenario orbs; deepened the physical
supply bridge, ownership map and fair-value separation; and replaced the transitional single-horizon fields
with independent tactical and strategic forecasts. Fresh decisions now classify each horizon against a
duration-matched cash hurdle, derive action/exposure from MODULE_RULES §11's matrix, and are archived under a
content-derived immutable decision ID after the pre-mortem. The WILTW report informed analytical method only
and is forbidden as a runtime input; none of its point-in-time assertions belong in `data/GOLD`.
