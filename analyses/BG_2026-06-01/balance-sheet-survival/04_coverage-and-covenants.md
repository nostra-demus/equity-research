# Coverage & Covenants — BG

**Company:** Bunge Global SA (NYSE: BG). **Reporting currency:** US$ millions unless noted. **Fiscal year:** ends December 31. Latest annual = FY2025 10-K (year ended Dec 31, 2025); latest interim = Q1 2026 10-Q (quarter ended Mar 31, 2026). **FY0 = FY2025; latest quarter Q0 = Q1 2026.**

Debt and EBITDA bases are taken verbatim from `01_capital-structure-and-leverage.md` §7. EBIT, interest, capex, and cash interest paid are taken from the filings (FY25 10-K / Q1 2026 10-Q) and cross-checked against `earnings/01_historical-financials.md`. Cash-quality caveats on EBITDA are inherited from `earnings/06_earnings-quality.md`.

**Two facts dominate this report — flag once, apply throughout:**

1. **Bunge's maintenance covenants are balance-sheet covenants, not earnings/leverage covenants.** The credit facilities and certain senior notes require a **minimum current ratio, a maximum debt-to-capitalization ratio, and limitations on secured indebtedness** [FY25 10-K, MD&A, lines 2997–2999; Q1 2026 10-Q, lines 2377–2378]. There is **no net-debt/EBITDA covenant and no interest-coverage covenant disclosed in the data pool.** This is the single most important covenant fact: the coverage ratios computed in §1 are analytical health checks, **not** tests Bunge can trip. What Bunge can trip is the current ratio and the debt-to-cap ratio — both balance-sheet, not P&L.

2. **The numeric covenant thresholds are NOT disclosed.** The filings name the three covenants and state compliance ("We were in compliance with these covenants as of December 31, 2025" / "…as of March 31, 2026"), but they do **not** give the actual threshold levels (e.g., "current ratio ≥ X" or "debt-to-cap ≤ Y%"). The original Viterra credit agreement is partially exhibited but the financial-covenant schedule with numeric levels is not in the extracted pool. **Per the partial-data rule, true covenant headroom cannot be computed; thresholds below use labeled market-typical assumptions and headroom is marked "Not assessable" for scoring.**

---

## 1. Coverage Ratios

Coverage uses **gross interest expense** (interest income is shown but not netted, per module standard). Two interest bases are shown because the filing discloses both: accrued income-statement interest expense and cash interest actually paid.

**EBITDA basis:** Bunge reports **no GAAP EBITDA line**; GAAP-built EBITDA = Bunge "Total EBIT" + D&A = $2,236M (FY2025) [`01` §7; `earnings/01` §1, note a]. This is constructed, not a company metric. An adjusted-EBITDA proxy ($2,737M FY2025) is also shown and is **management-defined and not reconciled in the filings** — carry the caveat.

Interest inputs (FY2025): accrued interest expense **$628M**; interest income $202M; **cash interest paid, net of capitalized, $562M** [FY25 10-K, lines 4695, 2369, 7458–7459]. Capex **$1,723M** [FY25 10-K, line 4849].

| Ratio | Value | Source / formula |
|---|---:|---|
| **EBITDA / interest** (GAAP-built, accrued interest) | **3.56x** | 2,236 / 628 [`01` §7; FY25 10-K line 4695] |
| — same, on cash interest paid ($562M) | 3.98x | 2,236 / 562 [FY25 10-K line 7458] |
| — same, on adjusted-EBITDA proxy ($2,737M) | 4.36x | 2,737 / 628 (proxy is mgmt-defined; caveat) |
| **EBIT / interest** (Total EBIT, accrued interest) | **2.44x** | 1,533 / 628 [FY25 10-K lines 2373, 4695] |
| — on adjusted Total EBIT ($2,034M) | 3.24x | 2,034 / 628 (mgmt-defined; caveat) |
| **(EBITDA − capex) / interest** | **0.82x** | (2,236 − 1,723) / 628 = 513 / 628 |
| — on maintenance capex (~$480M inferred, not filings) | 2.80x | (2,236 − 480) / 628 — see note below |
| **Fixed-charge coverage** | **0.21x** | (EBITDA − capex) / (gross interest + scheduled LT-debt amortization + lease payments) = (2,236 − 1,723) / (628 + 1,378 + 568) = 513 / 2,574 |
| — pre-capex variant (EBITDA basis) | 0.87x | 2,236 / 2,574 |
| — excluding 2026 LT-debt amortization (interest + leases only) | 0.43x | 513 / (628 + 568) = 513 / 1,196 |

**Cross-check (TTM to Q1 2026):** TTM GAAP-built EBITDA ≈ $2,354M [`earnings/01` §2]. TTM accrued interest ≈ $663M (FY25 $628M − Q1'25 ~$120M + Q1'26 ~$155M; *interest split estimated from segment/quarterly data, not a clean filing line — directional*). TTM EBITDA/interest ≈ **~3.55x**, in line with the FY2025 figure.

**Notes on the coverage ratios:**

- **The headline read is EBITDA/interest ~3.5–4.0x and EBIT/interest ~2.4x.** Earnings carry cash interest with a ~3.5–4x cushion on EBITDA. On the harsher EBIT basis (which already absorbs the Viterra D&A step-up) the cushion is ~2.4x. Neither is a covenant test — Bunge has no disclosed coverage covenant — but a fall below ~1.5–2.0x EBIT/interest would be the level where rating agencies and any future coverage-based lender would react.
- **(EBITDA − capex)/interest is below 1.0x (0.82x) — this is the genuinely weak ratio.** It says that after the FY2025 capex program, the business did not generate enough cash above capex to cover even its interest bill, let alone amortization. This is consistent with FY2025 FCF of −$879M and CFO of $844M [`earnings/01` §1]. **Caveat that cuts the other way:** FY2025 capex ($1,723M) is heavily growth/integration capex, not maintenance. Q1 2026 is the only period with a disclosed split — sustaining $95M vs growth/productivity ~$240M [`earnings/06` §1, note f; Q1 2026 call, lines 175–179]. If the ~28% sustaining mix held for the year, maintenance capex ≈ $480M and (EBITDA − maintenance capex)/interest ≈ **2.80x** — a very different picture. **This maintenance-capex split is an inference, not from filings, offered only to size the distortion.** The true recurring coverage is somewhere between 0.82x (all capex) and ~2.8x (maintenance only), and cannot be pinned down without an annual capex split.
- **Fixed-charge coverage is mechanically very low (0.21x)** because the denominator includes **$1,378M of 2026 long-term-debt amortization** [FY25 10-K, line 7446] plus $568M of 2026 lease payments [FY25 10-K, line 3168]. This overstates the recurring fixed charge: a large share of the maturing debt is expected to be **refinanced, not amortized from earnings** (Bunge is investment-grade with $9.07bn of committed undrawn capacity per `01`/`03`), so the "amortization" leg is really a refinancing event, not a cash charge earnings must cover. The interest-plus-leases-only variant (0.43x) and the pre-capex variant (0.87x) bracket the issue. Read fixed-charge coverage here as a flag that the maturity wall + capex + interest together exceed one year's post-capex cash — which is true and is the refinancing-dependence point owned by Agents 02/03 — not as an imminent earnings-coverage failure.

**EBITDA cash-quality caveat (required — from `earnings/06`):** Bunge's EBITDA is materially above its cash-backed EBITDA. CFO/EBITDA collapsed from ~85% (FY2023–24) to **37.7% (FY2025) and 25.0% TTM**, and FCF turned negative (−$879M FY2025) [`earnings/06` §1]. Earnings quality scored **52/100** because GAAP earnings are dominated by non-cash mark-to-market timing and the only usable profit figure is management-defined [`earnings/06` §9]. **Therefore every coverage ratio above is on an EBITDA that is currently far less cash-backed than the ratio implies.** A coverage ratio of 3.5x on EBITDA that converts to cash at 25–38% is weaker than the same ratio on fully cash-converting EBITDA. Weight the cash-interest and (EBITDA − capex) lines over the headline EBITDA/interest line. The mitigant: the FY2025 cash shortfall is substantially a Viterra-consolidation inventory build and growth capex, not accrual decay, and should partly reverse in a clean FY2026 [`earnings/06` §2] — but until that prints, the coverage ratios are flattered by the gap between accrual EBITDA and cash.

---

## 2. Covenant Inventory

The three disclosed maintenance covenants and their actual current values where the value is itself disclosed. **Thresholds are NOT disclosed in the data pool** — the levels shown are labeled market-typical assumptions per the partial-data rule, used only to frame headroom; they are not Bunge's actual covenant levels.

**Inverted note:** none of these rows is an inverted score; "headroom" is signed so **positive = room remaining** under the (assumed) limit.

| Covenant | Threshold | Current Actual | Headroom | Source |
|---|---|---:|---:|---|
| **Minimum current ratio** | Disclosed as existing; **level not disclosed**. Assumed market-typical **≥ 1.00–1.10x** for an IG agribusiness (LABELED ASSUMPTION, not Bunge's actual covenant) | **1.60x** (Mar-31-2026); 1.61x (YE2025); 2.04–2.15x (prior year) | vs assumed 1.00x: **+37.5%**; vs assumed 1.10x: +31.3% — *indicative only* | Covenant existence: FY25 10-K lines 2997–2999; Q1 10-Q lines 2377–2378. Actual ratio: FY25 10-K line 2792; Q1 10-Q line 2173 |
| **Maximum debt-to-capitalization** | Disclosed as existing; **level not disclosed**. Assumed market-typical **≤ 60–65%** for IG (LABELED ASSUMPTION) | **44.6%** (Q1 2026: gross debt 14,553 / (14,553 + total equity 17,426)); 44.7% (YE2025) | vs assumed 60%: **+25.7%**; vs assumed 65%: +31.4% — *indicative only* | Covenant existence: same as above. Debt: `01` §7. Equity: Q1 10-Q line 226; FY25 10-K line 3036 |
| **Limitations on secured indebtedness** | Disclosed as existing; **level not disclosed** (typically a % of consolidated net tangible assets) | Secured debt **$987M** (Q1 2026); $1,024M (YE2025) — small vs ~$14.5bn total | Not computable — basis (net tangible assets) and cap level both undisclosed | Covenant existence: same. Secured amount: `01` §1 (FY25 10-K Note 17 fn(3); Q1 10-Q fn(2)) |
| **Springing covenant trigger** (e.g., revolver-utilization-based) | **None disclosed** | n/a | n/a | Not disclosed in the data pool |
| **Equity cure rights** | **None disclosed** | n/a | n/a | Not disclosed in the data pool |
| **Rating-trigger / change-of-control acceleration** | **No rating-downgrade maturity-acceleration trigger** ("Our debt agreements do not have any credit rating downgrade triggers that would accelerate maturity of our debt"); a downgrade **does** raise borrowing cost on syndicated facilities; pricing grid varies 0.20%–0.55% by rating | n/a (no acceleration) | n/a | FY25 10-K lines 2991–2996; pricing grid line 7316 |
| **Net-debt/EBITDA (leverage) covenant** | **None disclosed** | n/a (analytical leverage 5.78x GAAP-built / 1.6x mgmt-adjusted per `01`) | n/a | No leverage covenant found in 10-K or 10-Q |
| **Interest-coverage covenant** | **None disclosed** | n/a (analytical EBITDA/interest 3.56x per §1) | n/a | No coverage covenant found in 10-K or 10-Q |

**Reading the inventory:**
- Bunge's covenants are **balance-sheet, not cash-flow.** This is favorable for a thin-margin, MTM-volatile earner like Bunge: its earnings can swing hard (Q1 2026 GAAP EPS $0.35 vs adjusted $1.83) without going near a covenant, because no covenant keys off earnings, EBITDA, or interest coverage. The covenant risk lives on the balance sheet (working-capital composition and the debt/equity mix), which is far more stable.
- **The current ratio is the only covenant whose actual value the filing both discloses and which has fallen meaningfully:** 2.15x (YE2024) → 1.61x (YE2025) → 1.60x (Q1 2026). The drop is the Viterra consolidation loading the current liabilities (short-term debt rose $875M → $3,883M as working-capital lines funded the larger inventory book) [FY25 10-K, lines 2785, 2790]. At 1.60x it still sits well above any plausible IG minimum (typically 1.0–1.1x), but it is the metric to watch because it is both disclosed and declining.
- **No springing covenant, no equity cure, no rating-acceleration trigger** are disclosed — so the standard leveraged-loan accelerants are absent (or at least not in the pool). The only rating-linked feature is a cost step (0.20%–0.55% margin grid), not an acceleration.

### Covenant EBITDA Definition & Quality

**Not applicable in the usual sense — and that is the key point.** Bunge has **no EBITDA-based covenant**, so there is **no covenant-EBITDA definition, no addback schedule, and no "addback illusion" risk** to assess. The covenants are computed off the balance sheet (current ratio, debt-to-capitalization), whose inputs are audited balance-sheet line items, not an adjustable EBITDA.

| Item | Value / Description | Source |
|---|---|---|
| Covenant EBITDA definition summary | **N/A — no EBITDA covenant exists.** Covenants are current ratio + debt-to-cap + secured-debt limit | FY25 10-K lines 2997–2999 |
| Addbacks permitted (types) | N/A — no EBITDA covenant | — |
| Addback caps / limits | N/A | — |
| Is covenant EBITDA materially above reported EBITDA? | N/A — covenants do not use EBITDA. (Separately, management's *leverage* headline of 1.6x uses adjusted EBITDA + a ~70%-of-RMI debt offset — but that is a management ratio, **not a covenant**; see `01` §5.) | `01` §5 |

**Headroom-quality verdict:** the headroom that exists (current ratio, debt-to-cap) is **high-quality in construction** — it is built from audited balance-sheet items, not from management addbacks — but its **distance to breach is unknown** because the numeric thresholds are not disclosed. So the quality risk here is not "addback illusion"; it is "threshold-unknown." Both the current-ratio and debt-to-cap actuals look far from any market-typical limit, but without the real covenant levels this is indicative, not measured.

---

## 3. Headroom & Breach Proximity

Because the actual thresholds are undisclosed, breach proximity is computed against **labeled market-typical assumptions** and is **indicative only**. The tightest *disclosed-and-moving* covenant is the current ratio.

| Metric | Value |
|---|---:|
| **Tightest covenant** (of those with a disclosed actual) | **Minimum current ratio** — actual 1.60x (Q1 2026), and the only covenant metric that has fallen materially (2.15x → 1.60x over 18 months) |
| Headroom on current ratio (vs assumed 1.00x floor) | **+37.5%** (indicative); +31.3% vs an assumed 1.10x floor — *Not assessable against the true threshold* |
| Headroom on debt-to-capitalization (vs assumed 60% cap) | **+25.7%** (indicative; actual 44.6% vs assumed 60%) — *Not assessable against the true threshold* |
| **Current-ratio decline that would breach** (to assumed 1.00x) | Current ratio would have to fall from 1.60x to 1.00x — a **~37% drop in the ratio**, e.g., current assets falling ~$10.2bn (from $27.1bn to ~$16.9bn at constant current liabilities) **or** current liabilities rising ~$10.2bn at constant assets [Q1 10-Q lines 193, 211]. A move of that size implies a near-total drawdown of the inventory/receivables book or a massive short-term-debt build — not a plausible single-period event |
| **Debt-to-cap increase that would breach** (to assumed 60%) | Gross debt would have to rise from $14,553M to ~$26.1bn at constant equity ($17,426M), i.e., **+$11.6bn of incremental debt** (60% = D/(D+17,426) → D ≈ 26,139). Alternatively, equity would have to fall ~$7.7bn at constant debt (to ~$9.7bn). Either is a very large move |
| **EBITDA decline that would breach a covenant** | **No direct mechanism — there is no EBITDA or coverage covenant.** An EBITDA collapse hits a covenant only *indirectly*: a large operating loss would erode equity (lifting debt-to-cap) and could force working-capital drawdowns (cutting the current ratio). It is a second-order, not first-order, breach path |

**Breach-proximity read:** On the *disclosed actuals*, both binding covenants sit a long way from any market-typical limit — the current ratio (1.60x) would need to fall ~37% and debt-to-cap (44.6%) would need ~$11.6bn more debt to reach assumed thresholds. **But these distances are measured against assumed levels, not Bunge's real covenant levels, so they are indicative only and the headroom is "Not assessable" for scoring.** The genuinely informative finding is structural: because Bunge's covenants are balance-sheet covenants, **an earnings shock does not directly trip a covenant** — which de-links Bunge's large GAAP earnings volatility from covenant-breach risk. The covenant pressure point, if one emerges, is the **current ratio**, which has already fallen from 2.15x to 1.60x on the Viterra working-capital load and would tighten further in a scenario combining an inventory write-down (cutting current assets) with a short-term-debt build (raising current liabilities) — the exact combination Agent 06 should test, since RMI monetization stress and current-ratio stress are the same event.

---

## 4. Coverage / Covenant Read

Earnings carry interest with a **~3.5–4.0x EBITDA/interest and ~2.4x EBIT/interest** cushion (FY2025, gross interest $628M accrued / $562M cash; GAAP-built EBITDA $2,236M) — adequate on its face, but on an EBITDA that converted to cash at only 38% in FY2025 (25% TTM) and against capex that pushed (EBITDA − all-capex)/interest below 1.0x (0.82x), so the cash-backed coverage is materially thinner than the headline and is the reason to weight the cash-interest and post-capex lines, not the 3.5x figure [§1; `earnings/06` §1].

The tightest covenant is the **minimum current ratio at 1.60x** (down from 2.15x pre-Viterra) — but its true headroom is **Not assessable** because Bunge discloses the covenant's existence and its own compliance, **not the numeric threshold**; against a market-typical 1.0–1.1x floor the indicative headroom is ~+31–38%, and debt-to-cap (44.6% actual) carries ~+26% indicative headroom against an assumed 60% cap [§2–3; FY25 10-K lines 2997–2999, 2792; Q1 10-Q line 2173].

The structurally important finding is that **Bunge has no net-debt/EBITDA covenant and no interest-coverage covenant** — its maintenance covenants are entirely balance-sheet (current ratio, debt-to-cap, secured-debt limit), so its large GAAP earnings swings do **not** directly threaten a covenant; what would trip it is a balance-sheet event — a deep inventory/RMI write-down or a heavy short-term-debt build cutting the current ratio toward ~1.0x, or ~$11.6bn of incremental debt lifting debt-to-cap to ~60% — and the RMI-monetization stress that Agent 06 must run is the same event as the current-ratio stress.

---

## Self-Check

- [x] All four coverage ratios computed (EBITDA/interest 3.56x; EBIT/interest 2.44x; (EBITDA−capex)/interest 0.82x; fixed-charge 0.21x), with cash-interest and maintenance-capex variants and a TTM cross-check.
- [x] EBITDA basis stated (GAAP-built = Total EBIT + D&A; no company GAAP EBITDA line) and interest stated gross (accrued $628M and cash $562M; interest income not netted).
- [x] EBITDA cash-quality caveat applied — CFO/EBITDA 38% FY25 / 25% TTM; earnings quality 52/100; coverage weighted toward cash and post-capex lines [`earnings/06`].
- [x] Each covenant shows threshold (disclosed vs assumed), actual, and signed headroom — with the explicit flag that thresholds are undisclosed.
- [x] Tightest covenant (current ratio 1.60x) and the moves that would trip each covenant identified, plus the structural point that no EBITDA/coverage covenant exists.
- [x] Partial-data rule applied: no numeric covenant thresholds → headroom marked **"Not assessable" for scoring**; market-typical thresholds used as labeled assumptions only. Cash interest paid IS disclosed ($562M), so the interest-proxy cap was not needed.
- [x] No banned phrases — no naked "comfortable coverage" / "ample headroom"; every coverage and headroom figure is stated as a number.

**Out-of-scope:** No scoring weights, probabilities, fair value, or rating are rendered here — those belong to the synthesizer (`99`) and the master synthesizer.
