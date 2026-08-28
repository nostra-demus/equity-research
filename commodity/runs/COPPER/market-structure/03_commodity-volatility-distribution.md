# Volatility Distribution & Scenario Span — COPPER

**Run date:** 2026-08-28 · **Run root:** `commodity/runs/COPPER/` · **Owner orb:** `commodity-volatility-distribution` · **Governing rule:** `.claude/agents/commodity/MODULE_RULES.md` §10 (independent distribution before action), §8/§8A (evidence contract and coverage gate) · **Profile:** `frameworks/commodity/COMMODITY_PROFILES.md` §`## COPPER` (lines 318–389).

**Headline verdict: the empirical return distribution for COPPER is `not_assessable` at every one of the ten forecast-grid horizons.** Not "thin", not "low confidence" — absent. There is no lawful point-in-time price history for COMEX copper reachable from this engine, so there is no return series from which a percentile, a realised volatility, a skew, a drawdown or an event-gap distribution could be computed. Under §10 that makes the distribution `not_assessable` and the downstream action `Research More`, unless an independently proven critical risk forces `Avoid`.

This is a valid, expected result in this run, and it is stated here so that the scenario-engine orb cannot quietly adopt a narrower, friendlier envelope in its place. **A missing distribution is not permission to invent one.**

---

## 0. Return instrument, roll treatment and window — declared before any number

Per the self-check, the instrument must be explicit even when the data is absent, so that a later run with real vintages reproduces exactly the same construction.

| Item | What this orb would have used | Status now |
|---|---|---|
| Intended return instrument | **COMEX Copper `HG` front-month futures, continuous back-adjusted (`@HG.1`)**, quoted **US¢/lb** — the profile's declared shared market history for `copper.comex-price-history`, and the same investable benchmark the `commodity-price-curve` orb is bound to | **Unavailable** |
| Profile benchmark (different instrument) | **LME Copper Grade A, USD/tonne** — the global physical benchmark named by the profile. A different contract, different warehouse regime, different currency unit | **Unavailable** (`copper.lme-cash-three-month-curve`, `copper.regional-arbitrage` both unavailable) |
| Roll treatment | Continuous back-adjusted futures; roll return kept visible and never merged into spot return (§4: "an ETF/ETC has fees and roll drag — CANE is not raw sugar") | Cannot be applied — no series |
| Vehicle returns (`CPER`) | Would be reported separately as vehicle total return, never spliced into the futures series | Unavailable; no lawful `CPER` history wired |
| Splice policy | **No splicing.** COMEX `HG` and LME Grade A are not one series. The profile explicitly requires the LME–COMEX arb to be *measured*, and unvintaged context below suggests that arb is at or near a historical extreme — which is exactly the condition under which splicing the two would manufacture false returns | Enforced by refusal |
| Sample window | Would be the longest lawful point-in-time history available, stated with its as-of and source identity | **None — window length is zero observations** |
| Trading-day convention | Would be stated (COMEX calendar; calendar-day grid horizons mapped onto exchange sessions) | Not applicable — no sessions to map |

### Why the history is absent — verified in this run, not inherited

Three independent checks, all run at decision time:

1. **Pulse quote transport is dead.** `bash scripts/refresh-swarm-pulse.sh commodity COPPER` fails with `Error: listen EPERM: operation not permitted /tmp/claude-501/tsx-501/41552.pipe` — the pinned `tsx` runner cannot open its IPC pipe under this sandbox. This reproduces the `PULSE-MISSING` finding recorded by the triage orb [`00_commodity-triage.md`, 2026-08-28]. Verified independently by me, 2026-08-28.
2. **Even a healthy pulse would not have solved this.** `frameworks/commodity/pulse_sources.json` states its own scope in its header note: it "supplies SYMBOLS, quote units, and COT market-name substrings ONLY", against a CNBC `restQuote` endpoint. That is a **current quote** transport. One quote is not a return history. So the pulse outage is not the binding constraint here — it is the smaller of two problems.
3. **No price-history route exists anywhere in the engine.** The connector registry `.claude/connectors/` holds 27 connectors; **none of them is a price-history connector for any commodity** (the metals/ags entries are CFTC COT positioning, inventory, production, holdings and macro connectors). The strings `price-history` / `price_history` appear in exactly two files in the whole repository — this agent's own prompt and `02_commodity-price-curve.md` — i.e. only in prompts asking for the series, never in anything that supplies it. `data/COPPER/` does not exist, and no `@HG` history file exists anywhere in the tree.

**Conclusion: `copper.comex-price-history` is structurally absent, not merely stale or temporarily unreachable.** Restoring the pulse would return a single price, and would still leave this orb with zero return observations.

---

## 1. Unconditional distribution

Every cell below is `n/a` for the same single reason: **N = 0 non-overlapping outcomes, because the underlying return series does not exist.** The §10 floor is 30 non-overlapping outcomes per horizon; the actual count is zero at all ten grid points.

| Horizon | N non-overlap | P5 | P10 | Median | P90 | P95 | Realised vol | Skew | Max drawdown |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1-day diagnostic | 0 | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |
| 1-week diagnostic | 0 | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |
| 30 days | 0 | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |
| 45 days | 0 | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |
| 60 days | 0 | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |
| 75 days | 0 | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |
| 92 days | 0 | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |
| 182 days | 0 | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |
| 273 days | 0 | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |
| 365 days | 0 | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |
| 456 days | 0 | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |
| 548 days | 0 | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |

**P25/P75 and time-to-recovery** are likewise `n/a` at every horizon and are omitted from the table only to keep it readable — they fail for the identical reason.

Two things I explicitly did **not** do, because both are forbidden and both would have produced a plausible-looking table:

- I did not reconstruct returns from remembered or approximate COMEX price levels. Prices recalled from training rather than read from a dated source are not a point-in-time series; percentiles computed off them would carry no as-of, no source identity and no vintage, and would be indistinguishable in the output from real ones. That is the `bad extraction` / `bad math` failure pair in root §20.
- I did not substitute overlapping daily windows to manufacture an N above 30. Overlapping windows share the same underlying days, so they are not independent outcomes; §10's threshold counts **non-overlapping** outcomes, and workflow step 7 bans the substitution by name.

---

## 2. Regime-conditioned distribution

The profile's copper-relevant regime states, and whether each could be labelled **point-in-time** (i.e. using only what was knowable at each historical date, never a later revision):

| Regime known at the time | Horizon | N | P10 | Median | P90 | Drawdown | Assessment |
|---|---|---:|---:|---:|---:|---:|---|
| LME cash–3M curve state (backwardation vs contango) | all 10 grid points | 0 | n/a | n/a | n/a | n/a | **not assessable** — `copper.lme-cash-three-month-curve` unavailable; no exact prompt-date history, so no regime label exists at any date, and no return series to condition |
| Visible-inventory state (LME/COMEX/SHFE on-warrant vs cancelled) | all 10 | 0 | n/a | n/a | n/a | n/a | **not assessable** — `copper.visible-inventory` unavailable; §9 also forbids inferring off-warrant/bonded material as zero, so even a partial stock series could not label the regime |
| Broad-USD direction | all 10 | 0 | n/a | n/a | n/a | n/a | **not assessable** — `macro.broad-usd-index` has a declared connector (`federal-reserve-broad-usd`) but **no eligible immutable vintage at decision time**; a declaration is not data (§8A) |
| China industrial-activity state | all 10 | 0 | n/a | n/a | n/a | n/a | **not assessable** — `macro.china-industrial-activity` unavailable, no connector claims it. This is copper's dominant demand lens, so it is the most damaging regime gap |
| US 10y real-yield state | all 10 | 0 | n/a | n/a | n/a | n/a | **not assessable** — `macro.us-10y-real-yield` unavailable; `treasury-real-yields-gold` exists but is bound to the Gold profile, not to this shared semantic ID. Reusing it here would be a silent substitution (§8A) |
| US trade-policy / tariff state | all 10 | 0 | n/a | n/a | n/a | n/a | **not assessable** — `copper.supply-restrictions-routing` unavailable. Policy dates are also the single hardest regime to label point-in-time, because the market's *expectation* of a ruling, not the ruling itself, is the state variable |
| Refined-balance state (surplus vs deficit) | all 10 | 0 | n/a | n/a | n/a | n/a | **not assessable** — `copper.refined-balance` unavailable; and ICSG balances are **revised**, so a full-sample balance label applied to an earlier date would be exactly the look-ahead §10/workflow-step-3 bans |

**Regime count achieved: 0 of the minimum 3 comparable regimes.** Two separate failures stack here and it matters that they are separate: (a) there is no return series to split, and (b) there are no vintaged regime labels to split it by. Fixing only one of the two would still leave this section `not assessable`.

The last row is worth stating plainly for the downstream orbs: copper's own balance history is a revised series. Even in a future run with a full ICSG feed, the balance regime must be labelled from the vintage that was published **at** each historical date, not from today's restated numbers — otherwise the conditional distribution learns the answer before the question.

---

## 3. Event-gap ledger

No ledger can be built. Every event class below has **N = 0 measured gaps**, because measuring a gap requires the close-to-open or close-to-close price series that section 0 established does not exist. The classes are listed anyway, from the profile's own recurring-report list, so the gap is specific rather than a blanket shrug — and so a later run knows exactly which distributions to build separately.

| Event class | N | Worst down | Worst up | P10/P90 | Source/date range |
|---|---:|---:|---:|---:|---|
| ICSG monthly balance + biannual forecast | 0 | n/a | n/a | n/a | none — `copper.refined-balance` unavailable; no price series to measure a response against |
| LME / COMEX / SHFE weekly warehouse stocks | 0 | n/a | n/a | n/a | none — `copper.visible-inventory` unavailable |
| China monthly activity + PMI | 0 | n/a | n/a | n/a | none — `macro.china-industrial-activity` unavailable |
| CFTC COT (COMEX copper positioning) | 0 | n/a | n/a | n/a | none — connector `cftc-cot-copper` declared, source publishing, but no eligible immutable vintage at decision time |
| Major-miner quarterly production | 0 | n/a | n/a | n/a | none — `copper.mine-prepolicy-supply` unavailable |
| Mine disruption / strike / grade / water-permit shocks (unscheduled) | 0 | n/a | n/a | n/a | none — `copper.supply-restrictions-routing` unavailable |
| **US trade-policy / tariff decisions (unscheduled)** | 0 | n/a | n/a | n/a | none vintaged — see the unvintaged note below, which is **not** a measurement |
| Exchange disruption / delivery-eligibility events | 0 | n/a | n/a | n/a | none |

These classes are listed as **eight separate rows on purpose.** Workflow step 4 forbids pooling unlike events into one false distribution, and copper is a commodity where that error would be severe: a weekly warehouse-stock print and a tariff ruling do not belong in the same response distribution, and pooling them would understate the tariff tail while overstating routine-release volatility.

### 3a. Unvintaged event context — labelled, and explicitly NOT a tail bound

Per §8A an unvintaged live-web fact may explain context but cannot raise sufficiency or conviction. Recorded here only so the scenario engine does not mistake "no measured tail" for "no tail":

- Secondary reporting describes a single-session COMEX copper collapse on **2025-07-30/31**, when a US tariff decision excluded refined copper cathode against wide expectations that it would be included. The reported magnitude **disagrees across sources: "19% — the biggest intraday fall on record" [Web: ING Think, 2025-07-31 — unverified, secondary], "plummeted 20% in a single day" [Web: SunSirs commodity news, 2025-08 — unverified, secondary], and "plunged 22%" [Web: secondary trade commentary, accessed 2026-08-28 — unverified, secondary].**
- More recent secondary reporting describes an active, still-undecided US Commerce ruling on refined copper, with the COMEX–LME differential at or near a historical high and a bank estimate that the premium implies roughly a 14.6% chance of a 15% tariff in January 2027 and a 37% chance of a 30% duty in January 2028 [Web: CNBC, 2026-08-14 and Bloomberg, 2026-08-05 — unverified, secondary; the probabilities are one bank's model output, not a market print].

**Three limits on how the above may be used, and they are binding:**

1. **It is not a tail bound and must not be entered into section 4.** A tail bound under §10 is a matching-regime 5th/95th percentile or a *measured* event gap from a lawful point-in-time series. A magnitude recalled by news aggregators that cannot agree with itself within three percentage points is neither. The dispersion is the tell: if I cannot establish whether the worst observed down-gap was 19% or 22%, I certainly cannot establish the 10th and 90th percentiles of the class.
2. **N = 1 anyway.** Even taken at face value, a single event is not a distribution. There is no basis to say whether that session was a 1-in-5-year or a 1-in-30-year draw.
3. **It carries no direction.** The 2025 gap was down because the ruling came in softer than positioning expected. A ruling that lands harder than positioning expects gaps the other way. This orb does not vote on which; it records only that the class is two-sided and large.

What this context legitimately establishes — and the reason it is worth writing down at all — is a **qualitative** statement: copper currently carries a live, unscheduled, binary policy-event class whose realised single-session magnitude is reported in the high teens to low twenties of percent. Any scenario set built for copper that spans only ordinary volatility would fail root §10's span check on its face. The engine cannot say by how much it would fail, because it cannot measure the bound.

---

## 4. Mandatory scenario-span envelope

| Horizon | Empirical bear bound | Empirical bull bound | Tail/event lower | Tail/event upper | Status |
|---|---:|---:|---:|---:|---|
| Tactical — 30 days | n/a | n/a | n/a | n/a | **not assessable** |
| Tactical — 45 days | n/a | n/a | n/a | n/a | **not assessable** |
| **Tactical — 60 days (§11 default)** | n/a | n/a | n/a | n/a | **not assessable** |
| Tactical — 75 days | n/a | n/a | n/a | n/a | **not assessable** |
| Tactical — 92 days | n/a | n/a | n/a | n/a | **not assessable** |
| Strategic — 182 days | n/a | n/a | n/a | n/a | **not assessable** |
| Strategic — 273 days | n/a | n/a | n/a | n/a | **not assessable** |
| **Strategic — 365 days (§11 default)** | n/a | n/a | n/a | n/a | **not assessable** |
| Strategic — 456 days | n/a | n/a | n/a | n/a | **not assessable** |
| Strategic — 548 days | n/a | n/a | n/a | n/a | **not assessable** |

Exact reason, identical for all ten rows: **no lawful point-in-time price history for the declared instrument; N = 0 non-overlapping outcomes against a §10 floor of 30; 0 comparable regimes against a floor of 3.**

- **Exact catalyst-horizon mapping: tactical 60 days and strategic 365 days** — the §11 defaults, used because no orb in this run has produced a cited catalyst-driven horizon (the catalyst-bearing series — ICSG release dates, COT, China activity, the Commerce ruling — are all unavailable or unvintaged). **Both defaults are exact grid points**, so no bracketing is invoked; bracketing between adjacent grid points is **not applicable**, not skipped. **Same-band check: pass** — 60 days sits inside the tactical 30–92 band and 365 days inside the strategic 182–548 band. **No cross-gap interpolation performed:** the 92-to-182-day gap was never crossed, and could not have been, since both endpoints are empty.
- The mapping is therefore well-formed and the arithmetic of the mapping is sound. It maps onto empty grid points. **A correct pointer into an empty table is still an empty answer** — this is stated so no downstream reader mistakes "mapping: pass" for "span: available".
- **No driver-attribution claim is made anywhere in this report,** so §4a's attribution line is not applicable. This orb explains no move, because it measures no move.

### 4a. Instruction to the scenario-engine orb

Under §10 the scenario engine constructs bear/base/bull independently and the terminal synthesis may make a disclosed conservative downgrade but may not substitute a narrower or more favourable distribution. With this envelope empty, that rule resolves as follows:

- **There is no empirical bound for a scenario set to clear.** A scenario set published for COPPER in this run cannot pass the span audit, because the audit's reference bounds do not exist. Per §10 a failed span audit makes the distribution `not_assessable` and the action `Research More`.
- **The absence of a bound is not a licence to pick one.** A scenario set that cites no bound and simply asserts, say, ±15% at 60 days would be a fabricated envelope wearing the authority of this orb. If the scenario engine produces numeric cases, it must state that they rest on judgment with zero empirical support from this orb, and it may not cite this file as their basis.
- **The killer-risk case cannot be sized here.** §10 requires the killer-risk case to cover the relevant tail/event gap. The relevant class is identified (US refined-copper tariff ruling, section 3a) but its gap is unmeasured. So the killer-risk case is `not assessable` in magnitude while being **identified** in kind — those are different statements and the synthesis must carry both.

---

## 5. Gaps and non-assessable slices

**Every slice this orb owns is non-assessable.** Listed with its exact blocking reason and its owning need ID, so each is separately repairable:

| Slice | Status | Blocking need ID(s) | Exact reason |
|---|---|---|---|
| Unconditional distribution (all 10 grid points + 1d/1w) | `not_assessable` | `copper-comex-price-history` | No lawful point-in-time close history; N = 0 vs a floor of 30 non-overlapping outcomes |
| Realised volatility, skew | `not_assessable` | `copper-comex-price-history` | Same — no return series |
| Drawdown and time-to-recovery | `not_assessable` | `copper-comex-price-history` | Same — a peak-to-trough path requires the path |
| Regime-conditioned distribution | `not_assessable` | `copper-lme-cash-three-month-curve`, `copper-visible-inventory`, `macro-broad-usd-index`, `macro-china-industrial-activity`, `macro-us-10y-real-yield`, `copper-refined-balance` | Two independent failures: no series to split, and no point-in-time regime labels to split it by. 0 of 3 required regimes |
| Event-gap ledger (8 classes) | `not_assessable` | all of the above plus `copper-supply-restrictions-routing`, `copper-mine-prepolicy-supply`, `copper-managed-money-positioning` | No price series against which to measure a response; no vintaged event calendar |
| Scenario-span envelope (bear / bull / tail bounds) | `not_assessable` | derived from the above | Bounds are defined as matching-regime percentiles, which do not exist |
| Current-price anchor | `PULSE-MISSING` | `copper-current-price` | `refresh-swarm-pulse.sh` fails EPERM on the tsx IPC pipe — reproduced by me at decision time, 2026-08-28 |

**A note on which repair actually unblocks this orb.** The triage orb named the pulse quote transport as the single highest-value next data request, and for the price-curve and cost-floor comparisons that is right. **For this orb it is not sufficient.** The pulse returns one current quote; this orb needs a multi-year point-in-time close series, and the connector registry contains no price-history connector at all. So the specific unblocking request from this orb is: **a lawful point-in-time daily close history for COMEX Copper `HG` front-month, continuous back-adjusted, with source identity and an accepted immutable vintage, of at least 3 years for the tactical grid and at least 10 years for the strategic grid and for a credible three-regime split.** Without it, this orb returns `not_assessable` in any future run no matter how many other rows are repaired.

**On the sidecar.** Two rows are emitted to `03_commodity-volatility-distribution.signals.json`, both `neutral` in direction, both non-conviction, both carrying explicit `unvintaged:` provenance tokens with empty `source_vintage_refs`: one `volatility-regime` `context` row recording that the distribution is not assessable, and one `tail-risk` `risk` row recording that an identified but unmeasured policy-event tail class exists. Per this orb's role, neither can create a directional vote — volatility evidence is `risk` or `context`, never a second bullish or bearish opinion. **No `statistical` row is emitted,** because no statistic was computed; and it is worth noting that the committed registry `frameworks/commodity/validated_signals.json` currently holds `"results": []`, so any statistical row from any orb in this engine would in any case be `contextual`, never validated.

**On what a reader should take from this report.** The honest finding is narrow and worth keeping narrow: this engine cannot presently say what range of outcomes copper produces, and therefore cannot police the width of anyone's scenario set. It can say that copper carries at least one live binary policy-event class whose single-session magnitude secondary sources put in the high teens to low twenties of percent — which is a reason for the downstream orbs to treat any narrow scenario set with suspicion, and is not a reason to hold any view about direction.
