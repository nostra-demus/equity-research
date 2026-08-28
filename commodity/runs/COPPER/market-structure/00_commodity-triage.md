# Commodity Triage — COPPER

**Run date:** 2026-08-28 · **Run root:** `commodity/runs/COPPER/` · **Profile section read:** `frameworks/commodity/COMMODITY_PROFILES.md` §`## COPPER` (lines 318–389) and its structured twin `frameworks/commodity/profiles/COPPER.json` (22 declared requirements).

COPPER **is** a recognised commodity in this engine: the profile section exists and is complete (benchmark, units, exchanges, lenses, instruments, priority sources, recurring reports, and a 22-row binding `Required semantic series` table). Identity is not the problem in this run. Data provenance is.

---

## 1. Identity

| Item | Value | Source |
|---|---|---|
| Benchmark / grade | LME Copper Grade A (USD/tonne) — the global benchmark. COMEX HG (US¢/lb) and SHFE (RMB/tonne, China) are the other two legs; the profile requires tracking the LME–COMEX and LME–SHFE arbs rather than treating any one as "the" price | `COMMODITY_PROFILES.md` §COPPER |
| Quote unit + currency | USD per tonne (LME) primary; also give US¢/lb (COMEX). SHFE quotes RMB/tonne | `COMMODITY_PROFILES.md` §COPPER |
| Primary exchange(s) | LME; COMEX (CME); SHFE | `COMMODITY_PROFILES.md` §COPPER |
| Business type / classification | Base / industrial metal — a mine-supply vs industrial-demand balance; "Dr Copper" macro barometer plus a structural electrification bid. Classify `Commodity-conditional` (macro-cyclical + structural demand) | `COMMODITY_PROFILES.md` §COPPER |
| Applicable lenses (from profile) | (1) **Market structure** — LME cash–3M spread (backwardation = tightness), LME/COMEX/SHFE warehouse stocks, TC/RCs as a concentrate-tightness tell. (2) **Supply/demand** — mine supply (Chile/Peru/DRC), disruptions (strikes, ore grades, water/permits), scrap, demand from construction/grid/EV, China (ICSG balances), stocks-to-consumption. (3) **Weather/seasonality — NOT applicable**; mild China seasonality only, keep short. (4) **Macro drivers (dominant)** — China property + stimulus + grid spend, global PMIs, the US dollar, real rates, the energy-transition bid, mine-supply disruptions. (5) **Positioning/flows** — COMEX managed-money net length (CFTC COT), LME COTR, `CPER` ETF flows. (6) **Valuation / fair value** — 90th-percentile mine cash-cost floor plus the new-mine incentive price, as a range | `COMMODITY_PROFILES.md` §COPPER |
| Family-specific physical rules in force | Align grade, warehouse eligibility, currency, unit and timestamp before comparing LME/COMEX/SHFE. Never add exchange stocks without separating on-warrant, cancelled-warrant and bonded/off-exchange material. TC/RC evidence belongs to `commodity-supply` and is not a second vote for the same mine disruption. China activity is a demand *input*, not proof of copper demand absent a primary end-use or refined-balance series | `COMMODITY_PROFILES.md` §COPPER |

---

## 2. Instruments (from profile)

| Instrument / ticker | Type | Exposure | Notes |
|---|---|---|---|
| LME Copper Grade A | Exchange futures/forwards (USD/tonne) | Direct — the global physical benchmark | Prompt-date structure, not a simple front month; cash–3M spread is the tightness read. Carries roll |
| COMEX Copper `HG` | Exchange futures (US¢/lb, CME) | Direct | The pulse transport symbol is `@HG.1` (front month). Carries roll. US-warehouse-linked, so it can decouple from LME on tariff/arb dynamics |
| SHFE Copper | Exchange futures (RMB/tonne) | Direct, China-domestic | Separate currency, VAT and bonded-stock regime; not directly additive to LME/COMEX |
| `CPER` (US Copper Index Fund) | ETF | Indirect — tracks COMEX copper futures + roll | Fees and roll drag: `CPER` is not spot copper (MODULE_RULES §4) |
| `COPX` | Miner-equity ETF | **Levered proxy, not the metal** | Profile is explicit: miners are a levered confirmation, carrying equity, cost and jurisdiction risk of their own |
| `FCX` and diversified-miner peers | Single-stock equity | Equity-risk proxy | Own operating leverage; not a clean copper expression |

---

## 3. Data Reachability

Statuses below are the **machine-verified** output of `scripts/commodity_profile_coverage.py`, run at a decision-time cutoff of `2026-08-28T23:59:59Z` against a scratch run-root (so as not to write into this run — the binding coverage compile happens after all orbs finish, per MODULE_RULES §8A). Result: **`complete=false`, `usable=0/22`**, digest `sha256:3e651827eb45731d3000ab9e9e88e4308483a28a2649ef934a7325c92b11b77d`.

Read that number carefully: **zero of twenty-two required semantic series carry an accepted, current, immutable vintage.** Per MODULE_RULES §8A a connector declaration, a reachable URL or a successful historical run is *not* evidence.

| Need ID / shared route | Stable series ID | Owner orb | Status | As-of | Vintage / source identity | Gap reason |
|---|---|---|---|---|---|---|
| `copper-managed-money-positioning` | `copper.managed-money-positioning` | commodity-positioning-flows | **missing** | — | none | Connector `cftc-cot-copper` exists and claims this series (`dataset_id cftc.disaggregated-cot-futures-only`, host `publicreporting.cftc.gov`), but **no eligible immutable vintage was knowable at decision time**. Declaration ≠ data |
| `copper-lme-investment-fund-positioning` | `copper.lme-investment-fund-positioning` | commodity-positioning-flows | **unavailable** | — | none | No connector claims this series. Only `lme-cotr-aluminium` exists; there is no copper LME COTR connector. Profile permits "manual or unavailable" — it is unavailable |
| `copper-etf-flows` | `copper.etf-flows` | commodity-positioning-flows | **unavailable** | — | none | No connector claims this series; no lawful `CPER` issuer-holdings feed wired |
| `macro-broad-usd-index` | `macro.broad-usd-index` | commodity-macro-drivers | **missing** | — | none | Connector `federal-reserve-broad-usd` exists and claims the shared series, but no eligible immutable vintage was knowable at decision time |
| `macro-china-industrial-activity` | `macro.china-industrial-activity` | commodity-macro-drivers | **unavailable** | — | none | No connector claims this series. This is the single most damaging gap for copper — China is the dominant demand lens |
| `macro-global-activity-demand-proxy` | `macro.global-activity-demand-proxy` | commodity-macro-drivers | **unavailable** | — | none | No connector claims this series |
| `macro-us-10y-real-yield` | `macro.us-10y-real-yield` | commodity-macro-drivers | **unavailable** | — | none | No connector claims this series. `treasury-real-yields-gold` exists but is bound to the Gold profile, not to this shared semantic ID |
| `copper-current-price` (shared route: swarm pulse `@HG.1`) | `copper.current-price` | commodity-price-curve | **missing — `PULSE-MISSING`** | — | none | `bash scripts/refresh-swarm-pulse.sh commodity COPPER` fails in this environment: `Error: listen EPERM: operation not permitted /tmp/claude-501/tsx-501/40718.pipe` — the pinned `tsx` runner cannot open its IPC pipe under the sandbox. Coverage gate reports "pulse quote snapshot is absent". **No pulse vintage has been fabricated.** See the unvintaged anchor below |
| `copper-comex-price-history` (shared route `@HG.1`) | `copper.comex-price-history` | commodity-price-curve | **unavailable** | — | none | Declared shared market history is absent or ambiguous — no continuous back-adjusted `@HG.1` history resolved |
| `copper-gold-price-history` (shared route `@GC.1`) | `copper.gold-price-history` | commodity-cross-asset-regime | **unavailable** | — | none | Declared shared market history is absent or ambiguous. Blocks the copper/gold ratio |
| `copper-miner-equity-history` (shared route `COPX`) | `copper.miner-equity-history` | commodity-cross-asset-regime | **unavailable** | — | none | Declared shared market history is absent or ambiguous |
| `copper-lme-cash-three-month-curve` | `copper.lme-cash-three-month-curve` | commodity-price-curve | **unavailable** | — | none | No connector claims this series; no licensed LME feed with exact prompt dates. Kills the primary market-structure (backwardation) read |
| `copper-visible-inventory` | `copper.visible-inventory` | commodity-demand-inventory | **unavailable** | — | none | No connector claims this series. No LME/COMEX/SHFE warrant-status stock history is wired |
| `copper-inventory-accessibility-opacity` | `copper.inventory-accessibility-opacity` | commodity-demand-inventory | **unavailable** | — | none | No connector claims this series. Off-warrant / bonded / off-exchange material is unmeasured — §9 forbids inferring hidden stocks as zero, so this forces an opacity cap downstream |
| `copper-regional-arbitrage` | `copper.regional-arbitrage` | commodity-price-curve | **unavailable** | — | none | No connector claims this series; the LME–COMEX–SHFE arb net of FX/tax/freight cannot be computed |
| `copper-concentrate-tcrc` | `copper.concentrate-tcrc` | commodity-supply | **unavailable** | — | none | No connector claims this series; no primary/licensed TC/RC assessment |
| `copper-mine-prepolicy-supply` | `copper.mine-prepolicy-supply` | commodity-supply | **unavailable** | — | none | No connector claims this series. `usgs-gold-mine-supply` exists but is Gold-bound; there is no ICSG/USGS copper mine-supply connector |
| `copper-supply-restrictions-routing` | `copper.supply-restrictions-routing` | commodity-supply-security | **unavailable** | — | none | No connector claims this series |
| `copper-refined-balance` | `copper.refined-balance` | commodity-demand-inventory | **unavailable** | — | none | No connector claims this series. No ICSG monthly balance is wired — the core supply/demand row is empty |
| `copper-scrap-supply` | `copper.scrap-supply` | commodity-supply | **unavailable** | — | none | No connector claims this series |
| `copper-energy-transition-demand` | `copper.energy-transition-demand` | commodity-demand-inventory | **unavailable** | — | none | No connector claims this series |
| `copper-cost-incentive-range` | `copper.cost-incentive-range` | commodity-cost-curve-fair-value | **unavailable** | — | none | No connector claims this series; the cost-floor / incentive-price anchor has no data |

### 3a. Source-liveness check (distinguishes `no_pool` from source disappearance)

Because every required row lacked an accepted vintage, one light reachability pass was run to establish *why*. The finding is that the priority primary sources are **alive and publishing** — the failure is a wiring/provenance failure in this environment, not the disappearance of the underlying sources.

| Priority source (profile) | Reachable / publishing? | Evidence (dated) |
|---|---|---|
| CFTC COT (COMEX Copper) | Yes — publishing on schedule | Latest weekly report dated 2026-08-18, released 2026-08-21 [Web: IndexBox COT summary, 2026-08-21 — unverified] |
| LME | Yes — official prices and warehouse/stock report pages live | [Web: lme.com "LME Copper" and "Warehouse and stock reports", accessed 2026-08-28 — unverified] |
| COMEX / CME | Yes — copper product page and daily settlements live | [Web: cmegroup.com copper overview, accessed 2026-08-28 — unverified] |
| SHFE | Yes — warrant/inventory data published and mirrored by aggregators | [Web: aggregator SHFE copper warehouse series, accessed 2026-08-28 — unverified] |
| ICSG | Yes — forecast releases published | ICSG Oct-2025 forecast (2025 surplus ~178kt, 2026 deficit ~150kt) subsequently **reversed** to a ~96kt 2026 *surplus* on 1.6% usage growth and higher secondary output [Web: mining/trade press summaries of ICSG releases, accessed 2026-08-28 — unverified, secondary] |
| Cochilco | Not tested this pass — no required row is uniquely owned by it | — |
| Wood Mackenzie / CRU | Licensed; not accessible in this environment | Profile requires them "dated, labelled"; no licence wired |

**Every fact in this sub-table is unvintaged live-web context.** Under MODULE_RULES §8A it may explain the situation but **cannot raise sufficiency or conviction**, and it does not turn any row above from `unavailable`/`missing` into usable.

### 3b. Unvintaged price anchor (context only — NOT the `copper-current-price` row)

Since the pulse transport is dead in this environment, the only price reference available is unvintaged web context. Recorded so downstream orbs know the order of magnitude, explicitly **not** as coverage:

- **COMEX Copper front month: ~US$6.59/lb, as of 2026-08-27** (reported down ~0.18% on the day) [Web: TradingEconomics copper page, as-of 2026-08-27, accessed 2026-08-28 — **unvintaged, unverified, single secondary source**]. Note the profile's own unit convention: the COMEX contract is conventionally quoted in US¢/lb, i.e. ~659 US¢/lb.
- **Tonne equivalent — my own arithmetic, labelled inference, not an LME print:** 6.59 USD/lb × 2,204.62 lb/tonne ≈ **US$14,530/tonne**. This is a *conversion of a COMEX futures quote*, not an LME Copper Grade A cash or 3-month settlement. The two are different contracts, and the LME–COMEX arb is precisely one of the things this profile requires us to measure rather than assume away. **Do not cite this figure as an LME price.**
- **Inventories — recorded with a health warning:** the only reading surfaced was a social-media post claiming combined LME+SHFE+COMEX stocks of ~940kt with COMEX at a record ~666kt and LME+SHFE at ~274kt, on pre-tariff US stockpiling [Web: X/Twitter post, mid-Aug 2026 — **unverified social-media source, low tier, not usable**]. It is logged only as a signpost that the geographic split may be extreme; it is **not** evidence, it violates nothing only because no orb may lean on it, and `copper-visible-inventory` remains `unavailable`.

If that ~US$6.59/lb level is even roughly right, copper is trading far above its historical range, which raises rather than lowers the cost of running this analysis on unvintaged data: a large move is exactly the condition under which a stale or wrong anchor does the most damage.

---

## 4. Local pool (`data/COPPER/`)

- **The directory does not exist.** `data/` contains ALUMINIUM, COCOA, COFFEE, CORN, SOYBEAN, SUGAR, WHEAT and equity subjects — but no `COPPER`.
- **Accepted external vintages (`data/COPPER/external/<provider>/` with `.source.json` sidecars passing MODULE_RULES §8A): none.**
- **Supplementary user notes (tier 9, dated, lower-tier per §4): none.**
- Per the run brief this absence is expected and is **not**, by itself, an Insufficient trigger. A private document pool is supplementary; the binding gate is the profile's required-series table, which is failing for its own separate reason (no accepted connector/shared-route vintages).
- No WILTW or report-derived material was used. Those are method-transfer material only and are forbidden as runtime evidence (§8A).

---

## 5. Sufficiency Verdict

- **Verdict:** Partial
- **Reason:** COPPER has a complete profile section — benchmark, units, exchanges, lenses, instruments and a 22-row required-series table — and its priority primary sources (CFTC, LME, COMEX, SHFE, ICSG) are demonstrably alive and publishing, so discovery can proceed; but **0 of 22 required semantic series carry an accepted current vintage** and the pulse quote transport is dead (`PULSE-MISSING`), so no rated terminal forecast is permitted.
- **Consequence the downstream orbs must honour:** under MODULE_RULES §8A, required rows that remain unusable make **both horizons `not_assessable`**, and §11's deterministic forecast contract then mechanically produces **`Research More`** — unless an independently proven critical risk forces `Avoid`. Orbs may run and may report unvintaged context clearly labelled as such; they may not convert any of it into conviction, a rated call, or a filled coverage row. No orb may substitute a weaker source silently for a missing required row (§8A): mark it failed/not-assessable and emit the data need.

**Missing (every gap, with its owner):**

- **`commodity-price-curve`** — `copper-current-price` (`PULSE-MISSING`, EPERM on the tsx IPC pipe); `copper-comex-price-history`; `copper-lme-cash-three-month-curve` (kills the cash–3M backwardation read, the profile's headline market-structure lens); `copper-regional-arbitrage` (kills the LME–COMEX–SHFE arb the profile explicitly requires).
- **`commodity-demand-inventory`** — `copper-refined-balance` (no ICSG balance: the core supply/demand row is empty); `copper-visible-inventory` (no warrant-status exchange stocks); `copper-inventory-accessibility-opacity` (off-warrant/bonded material unmeasured — §9 forbids treating hidden stocks as zero, so an opacity cap applies downstream); `copper-energy-transition-demand`.
- **`commodity-supply`** — `copper-mine-prepolicy-supply` (no ICSG/USGS copper connector); `copper-concentrate-tcrc`; `copper-scrap-supply`.
- **`commodity-supply-security`** — `copper-supply-restrictions-routing`.
- **`commodity-positioning-flows`** — `copper-managed-money-positioning` (connector `cftc-cot-copper` is declared and its source is publishing as of 2026-08-18, but no immutable vintage was knowable at decision time); `copper-lme-investment-fund-positioning`; `copper-etf-flows`.
- **`commodity-macro-drivers`** — `macro-china-industrial-activity` (the dominant demand lens for copper, entirely absent); `macro-global-activity-demand-proxy`; `macro-broad-usd-index` (connector declared, no eligible vintage); `macro-us-10y-real-yield`.
- **`commodity-cross-asset-regime`** — `copper-gold-price-history`; `copper-miner-equity-history`.
- **`commodity-cost-curve-fair-value`** — `copper-cost-incentive-range` (no cost floor, no incentive price, so no structural valuation anchor).

**Single highest-value next data request (§22):** restore the swarm pulse quote transport for `@HG.1` outside the sandbox (or supply an accepted vintage for `copper.current-price`). Without a vintaged current price there is no anchor for the curve, the arb, the cost-floor comparison, or any return calculation, and every other repair is worth less until it exists.
