# Downside Stress Test — BG

**Company:** Bunge Global SA (NYSE: BG). **Reporting currency: US$ millions.** Latest annual = FY2025 10-K (year ended Dec 31, 2025); latest interim = Q1 2026 10-Q (Mar 31, 2026). All inputs are consumed from `01`–`05` and the cross-module `business-model/10` and `earnings/01,03,06`; they are not re-derived.

**EBITDA basis used for the stress (read this first).** Bunge reports **no GAAP EBITDA line**; the base is the GAAP-built figure `01`/`earnings/01` use: **Total EBIT + D&A = $2,236M (FY2025)** [`01` §7; `earnings/01` §1]. Per the module stress rule, the test uses **cash-backed EBITDA, not headline adjusted EBITDA, where the two differ materially** — and here they differ a lot. The management adjusted-EBITDA proxy is ~$2,737M and management's headline leverage is **1.6x**, but that 1.6x stacks two adjustments: it nets ~70% of ~$11.4bn of readily-marketable inventory (RMI) against debt **and** uses adjusted EBITDA [`01` §5]. `earnings/06` shows the EBITDA converts to cash at only **25–38%** (CFO/EBITDA collapsed from ~85% to 37.7% FY2025 / 25.0% TTM; FCF −$879M FY2025, −$1,161M TTM; earnings quality 52/100) [`earnings/06` §1, §9]. **For a survival lens the conservative GAAP-built $2,236M is the right anchor, and the 1.6x story is itself one of the things this test must break.** The TTM figure ($2,354M) is shown as a cross-check.

**The single most important structural fact for this stress (flag once).** Bunge has **no net-debt/EBITDA covenant and no interest-coverage covenant** [`04` §2]. Its only maintenance covenants are **balance-sheet**: a minimum current ratio, a maximum debt-to-capitalization ratio, and a secured-debt limit — and **their numeric thresholds are NOT disclosed** [`04` §1–2; FY25 10-K, MD&A, lines 2997–2999]. Two consequences run through everything below: (1) **an EBITDA decline does not directly breach any covenant** — it can only do so second-order, by eroding equity (lifting debt-to-cap) or forcing a working-capital drawdown (cutting the current ratio); and (2) the covenant break points below are run against **labeled market-typical assumptions** (current ratio ≥1.00–1.10x; debt-to-cap ≤60%) and are **indicative only**, with true headroom marked "Not assessable" [`04` §3, partial-data rule].

---

## 1. Base Case (today)

| Input | Value | Source |
|---|---:|---|
| Base EBITDA (cash-backed, GAAP-built) | **$2,236M** (FY2025); TTM cross-check $2,354M | `01` §7; `earnings/01` §1–2 — *converts to cash at 25–38%; weight cash lines* `earnings/06` §1 |
| Net debt | **$13,714M** (Q1 2026); $12,916M (YE2025) | `01` §7 |
| Net debt / EBITDA (GAAP-built) | **6.13x** (13,714 / 2,236); 5.78x on YE2025 net debt | `01` §5,§7 — conservative anchor. Mgmt RMI-adjusted = 1.6x (not used) |
| EBITDA / interest | **3.56x** (2,236 / 628 accrued); 3.98x on $562M cash interest | `04` §1 |
| Tightest covenant + threshold | **Min current ratio**, actual **1.60x** (Q1 2026); threshold **undisclosed** (assumed 1.00–1.10x, labeled) | `04` §1–3 — only covenant that is disclosed-and-falling (2.15x → 1.60x post-Viterra) |
| — second covenant | Max debt-to-capitalization, actual **44.6%**; threshold undisclosed (assumed ≤60%, labeled) | `04` §2 |
| Next-12m obligations (full) | **~$6,610M** (debt maturities $5,261M + interest $405M + maint capex $380M + dividends $564M) | `03` §2 |
| — of which hard, non-deferrable | **~$1,349M/yr** (interest $405M + maint capex $380M + dividends $564M); plus hard-dated term maturity inside 12m ~$803M (after the $575M April-2026 repayment) | `03` §3; `02` §1,§4 |
| — of which rolling working-capital debt | **~$3,883M** (self-liquidating local op-co lines $2,983M + CP $300M + revolver $600M) — rolls, not a bond tower | `02` §1; `03` §2 |
| Committed liquidity | **~$10,504M** (cash $839M + unused committed revolver $9,665M); usable $10,454M after $50M CP backstop reserve | `03` §1 |
| Floating-rate debt (gross) | **~$7.8bn (~56% of gross debt)**; 100bp = ~$78M interest; +200bp = ~$156M/yr | `01` §1,§7; `02` §3 |
| Hedge coverage (if any) | **None disclosed on the floating block** — the ~56% floating share is the gross variable-rate exposure; the only rate hedges noted are fair-value hedges inside the −$128M hedge-accounting adjustment | `01` §1; `02` §3 |
| Working-capital seasonality / peak build | Q1 is reliably a cash-outflow quarter; **net debt rose ~$798M and gross debt $14,051M→$14,553M over Q1 2026** (CFO −$541M) — the disclosed seasonal-peak swing | `03` §3 (Seasonality); `01` §4 |

Reporting currency: **US$ millions.** EBITDA basis: **GAAP-built (Total EBIT + D&A), cash-quality-haircut applied** per `earnings/06`.

---

## 2. Stress Scenarios

All ratios recomputed from the base inputs above. **EBITDA** = $2,236M × (1 − haircut). **Net debt** held at $13,714M (Q1 2026). **Interest** = $628M accrued, except the rate-shock column, which adds +$156M (= +200bp on ~$7.8bn floating, no hedge offset disclosed). **Covenant headroom is on the current ratio vs an assumed 1.00x floor and is indicative only** (true threshold undisclosed). The **−42% column is the history-calibrated cyclical scenario** (see note below the table).

| Metric | Base | −30% EBITDA | −40% EBITDA | −60% EBITDA | −42% (history-calibrated) | −40% + WC shock | −40% + rates +200bp |
|---|---:|---:|---:|---:|---:|---:|---:|
| EBITDA | 2,236 | 1,565 | 1,342 | 894 | 1,297 | 1,342 | 1,342 |
| Net debt / EBITDA | 6.13x | 8.76x | 10.22x | 15.33x | 10.57x | 10.22x (debt +798 → 10.81x) | 10.22x |
| EBITDA / interest | 3.56x | 2.49x | 2.14x | 1.42x | 2.07x | 2.14x | **1.71x** (int → $784M) |
| Tightest covenant headroom (current ratio vs assumed 1.00x; indicative) | +37.5% (1.60x) | +37.5%* | +37.5%* | +35–37%* | +37.5%* | falls toward breach only if RMI is written down (see §3) | +37.5%* |
| Covenant breach? (Y/N) | N | **N** | **N** | **N** (no EBITDA/coverage covenant exists to breach) | **N** | **N** unless RMI write-down + ST-debt build (§3) | **N** |
| 12-month liquidity gap (uses − committed sources, market-closure basis) | −$8,622M (surplus) | −$8,287M | −$8,175M | −$7,951M | −$8,150M | −$7,377M (adds $798M WC build) | −$8,175M |
| Survives without external action? (Y/N) | Y | **Y** | **Y** | **Y** (survives, but rating/coverage deteriorate sharply — see §4) | **Y** | **Y** | **Y** |

\* The current-ratio headroom barely moves with an EBITDA haircut **by construction**: the covenant is a balance-sheet ratio, not an earnings ratio. An EBITDA fall touches it only second-order (via retained-loss erosion of equity, which feeds debt-to-cap, or via a working-capital drawdown). A single-period operating loss large enough to dent the current ratio materially is not the same event as an EBITDA haircut — see §3. Headroom is **"Not assessable"** against the real (undisclosed) threshold; the figures are indicative.

**12-month liquidity-gap method (market-closure basis, per the hard rule).** Assumes **no new unsecured issuance for 12 months**; the **committed, undrawn revolver ($9,665M) is drawable** (it is contractually committed, with **no rating-downgrade acceleration trigger** [`01` §6A]); the ~$3,883M of rolling working-capital lines either roll or migrate onto the revolver. Uses = hard non-deferrable charges ($1,349M) + hard-dated term maturity inside 12m ($803M) + a working-capital build, less a conservative operating-cash contribution (modeled at 0.5× the stressed EBITDA, reflecting `earnings/06`'s weak cash conversion). At every haircut the committed liquidity ($10,454M usable) exceeds the 12-month need by a wide margin — the gap is a **surplus of ~$8bn even at −60%**.

**History-calibrated scenario (required for a deep cyclical).** `business-model/10` scores external dependency **72/100 (inverted; higher = worse)** — "mostly externally driven": commodity/crush spread, biofuel policy, and weather are all High, the soybean segment EBIT swung ±~60% across FY23–25, and Q1 2026 guidance moved >100% in two months on one EPA policy decision [`10` §3–5; `earnings/03` §8]. The company's **own recent EBITDA history is the calibration**: GAAP-built EBITDA fell from **$3,784M (FY2023) to $2,236M (FY2025) = −41%** [`earnings/01` §1]. So a **~−42% haircut from a cycle peak is squarely inside Bunge's own observed range**, and the −60% case is a deeper-than-recent-history tail. The −42% column above is run on that basis; it lands between the −40% and −60% columns and breaks nothing.

---

## 3. Break Points

The break points are solved on the conservative GAAP-built EBITDA base. **Critical framing:** because no covenant keys off EBITDA or coverage, there is **no EBITDA decline that directly trips a maintenance covenant.** The table therefore separates (a) the rating/lender-reaction thresholds (analytical, not contractual), (b) the indirect, balance-sheet covenant path, and (c) liquidity exhaustion.

| Break Point | EBITDA Decline That Triggers It |
|---|---:|
| **Tightest covenant (current ratio) breaches** | **No direct EBITDA trigger.** It breaks only via a balance-sheet event: at constant current liabilities, current assets must fall **~$10.2bn (a ~38% drawdown of the current book**, e.g. an implausible **~89% write-down of the entire $11.4bn RMI book**) to reach an assumed 1.00x floor, **or** current liabilities must rise ~$10.2bn (a massive short-term-debt build) [`04` §3]. This is the **same event** as RMI failing to monetize at carrying value — the event that also breaks management's 1.6x leverage story [`01` §5; `03` §5]. Not a single-period earnings event. |
| **Debt-to-capitalization covenant breaches** (assumed ≤60%) | **No direct EBITDA trigger.** Requires **~$11.6bn of incremental debt** at constant equity, **or** a ~$7.7bn equity wipe (cumulative losses) [`04` §3]. An EBITDA haircut hits this only through retained-loss erosion of the $17.4bn equity base — many years of deep losses, not one down year. |
| **EBITDA / interest falls to ~1.5x** (the level where rating agencies / any future coverage-based lender react — analytical, not a covenant) | **~−58%** (EBITDA to ~$942M). At −60% coverage is 1.42x. *This is the first analytically meaningful break, and it is a rating/cost-of-capital break, not a covenant breach.* |
| **EBITDA / interest falls below 1.0x** (earnings no longer cover cash interest) | **~−72%** (EBITDA to ~$628M = the interest bill). Deeper than the −60% tail and far beyond the company's observed cycle. |
| **Committed liquidity exhausted within 12 months** (market-closure basis) | **No EBITDA decline in the 0–60% range exhausts 12-month liquidity.** Committed liquidity ($10.5bn) exceeds the 12-month cash need at every haircut. Under a *compounded* multi-year stress — markets shut **and** the ~$2,983M of uncommitted bilateral/local lines refuse to roll (migrated onto the revolver as a one-time draw) **and** −40% EBITDA persists with weak cash conversion — committed liquidity runs **~3.3 years** before exhaustion. |
| **Net leverage exceeds 6x** (a level at which IG refi access tightens for a name this size) | **Already above 6x today on the conservative base** (6.13x on GAAP-built EBITDA / Q1 2026 net debt). It sits *below* 6x (1.6x–4.7x) only on the management adjusted/RMI basis. A −12% haircut takes GAAP-built leverage to ~7x. **This is the live pressure point, not a downside-only one** — it is why the leverage debate (`01` §5) matters more than the stress haircuts. |

---

## 4. Survival Read

On the conservative, cash-backed GAAP-built EBITDA base, **Bunge survives a 30–40% EBITDA decline on its own — a normal recession, not a tail — without an equity raise, distressed asset sale, or covenant waiver**, and it survives the −60% case too, because the thing a deep earnings decline would normally break here simply does not exist: there is **no EBITDA or interest-coverage covenant to trip** [`04` §2], and the ~$10.5bn of committed, undrawn revolver capacity (no rating-acceleration trigger) covers the 12-month cash need by ~$8bn even at −60% [`03` §1; `01` §6A]. The first thing that actually deteriorates in a downside is **not** a covenant or a liquidity cliff but **interest-coverage and rating optics**: EBITDA/interest falls from 3.56x to ~2.1x at −40% and ~1.4x at −60%, and net leverage on the conservative base rises from 6.1x to 10–15x — levels that would pressure the A-/Baa1/BBB+ ratings, widen spreads on the ~56% floating book, and raise the refi step-up, but that do not by themselves force external action.

**Where it genuinely breaks** is a balance-sheet event, not an earnings event: a deep **RMI/inventory write-down combined with a short-term-debt build that drives the current ratio toward ~1.0x** — which would require something like a ~38% drawdown of the current book or an ~89% RMI write-down to breach an assumed floor [`04` §3]. That is implausible as a single event, **but it is the correct tail to watch**, because it is the *same* event as the RMI failing to monetize at carrying value — which simultaneously detonates management's 1.6x adjusted-leverage headline and the liquidity runway that leans on the working-capital book continuing to roll [`01` §5; `03` §5]. The required external action in that tail is a covenant waiver and a forced inventory liquidation, not a coverage cure.

**Market-closure test (no new unsecured refinancing for 12 months):** **liquidity holds.** The committed bank revolver is contractually drawable and dwarfs the hard 2026–2027 term maturities; the bond market staying shut does not break the 12 months. What breaks first under closure is the **roll of the ~$2,983M of uncommitted bilateral/local op-co lines** — a lender can decline to renew these — but they can be migrated onto the committed revolver, which still leaves ~$5.2bn of committed headroom even after absorbing them at −40% EBITDA. The honest caveat carried from `04`: every covenant break point above is indicative because the numeric thresholds are undisclosed, and the conservative survival anchor rests on GAAP-built EBITDA that converts to cash at only 25–38% — so the coverage cushion is thinner in cash terms than the 3.56x headline, which is why the cash-interest line, not the headline, is the one to watch as EBITDA falls.

---

### Self-check
- [x] Three haircuts run (−30/−40/−60%); a **history-calibrated −42%** scenario added for the deep cyclical (calibrated to BG's own FY2023→FY2025 −41% EBITDA fall; `10` external-dependency 72/100).
- [x] Each scenario recomputes net leverage, EBITDA/interest, covenant headroom (breach Y/N), and the 12-month liquidity gap; WC-shock and rates +200bp columns included (rate shock uses the disclosed +$156M/200bp, no hedge offset disclosed).
- [x] Base EBITDA is cash-backed GAAP-built ($2,236M), explicitly **not** the management adjusted ($2,737M) or RMI-adjusted 1.6x figure; cash-conversion caveat from `earnings/06` applied throughout.
- [x] Break points solved explicitly: covenant breach (no direct EBITDA trigger; balance-sheet path quantified), coverage 1.5x at ~−58% / 1.0x at ~−72%, liquidity exhaustion (none in 12m; ~3.3yr under compounded closure), 6x leverage already crossed on the conservative base.
- [x] Each scenario states survival without external action; market-closure test answered (liquidity holds; uncommitted op-co lines break first, absorbable by the committed revolver).
- [x] No probability assigned to the downside (master synthesizer's job). No banned phrases — every liquidity, leverage, and coverage figure is a stated number.
- [x] Partial-data cap noted: undisclosed covenant thresholds → covenant break points are **indicative**, headroom "Not assessable" (`04`); EBITDA base IS available, so the stress test runs (downside resilience is assessable).
