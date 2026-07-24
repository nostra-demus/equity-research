# Business Model Module Memo — TSLA

**Verdict: Cyclical business — worth deeper work only with a strong timing edge.** Tesla makes money mainly by selling electric cars, but the profit it earns on the money invested in the business now runs far below what that money costs, and the market's price story leans on a self-driving/robot bet that earns no disclosed revenue yet.

Memo date: 2026-07-24.

---

## Scores at a Glance

Every score below is carried verbatim from the module synthesis, each out of 100. "Inverted" means a higher number is worse.

| Score | /100 | Source |
|---|---|---|
| Business clarity | 60 | `02_business-identity.md`; `03_segment-map.md` |
| Business quality | 33 | `07_business-quality.md` |
| Moat | 50 (Technology/IP, the strongest single candidate) — but overall verdict is **"No moat proven"** | `09_moat.md` |
| External dependency risk **(inverted — higher is worse)** | 58 | `10_external-dependency.md` |
| Capital allocation & governance | 62 — classified "Governance red flags" | `11_capital-allocation-governance.md` |
| Data quality | 72 | inferred from `00_data-triage.md` |
| Overall usefulness | 40 | synthesis §1 |

**Score caps applied:** Business quality is capped at 65 by Filter 5 (fast-changing industry). This cap does not bind, because the raw score of 33 is already below it. No other cap applies.

**§24 Avoid-Big-Risks filters:**
- **Filter 5 (fast-changing industry) — TRIPPED.** Industry rate-of-change scored 30 (at or below the 40 threshold). The thesis is flagged as a sector / technology-cycle bet, not a durable compounder. Tag RF-BQ-005 propagated.
- **Filter 4 (serial acquirers) — not tripped.** Acquisition-pattern severity 20/100, below the 70 trigger (cash acquisitions were $0 in five of the last six years).
- **Filter 1 (crooks / integrity) — no verdict-lock.** No proven fraud. But an unresolved federal securities-fraud class action (naming the CEO personally over Autopilot/FSD/Robotaxi claims) and Delaware derivative suits are carried forward as a conviction-capping note, routed to management-governance.
- **Capital-structure-transaction cap — not applied.** No qualifying debt raise or single-year dilution event triggered it.

No automatic disqualifier triggered: all eight tests read N.

---

## What This Module Found

Tesla designs, builds, and sells electric cars straight to buyers, plus a smaller grid-battery business and an unproven, not-yet-earning bet on self-driving software and humanoid robots [`02_business-identity.md` §3]. Car sales dominate: 86.5% of FY2025 revenue and 77.7% of gross profit [CIQ Financials_Annual export, Segments tab, FY2025].

The single strongest positive is the balance sheet: $27.4 billion of net cash (Jun-2026) — cash left over after subtracting all debt — which funds real vertical integration, meaning Tesla building more of its own supply chain in-house, including lithium refining, cathode material, and battery cells [`11_capital-allocation-governance.md` §1; `06_value-chain.md` §1].

The single most important risk is that return on capital (ROIC) — the profit earned on each dollar invested — runs just 2.75%–3.7% over the last twelve months, roughly 770–885 basis points (7.7–8.85 percentage points) below an estimated 11.5% cost of capital, which is what that money costs to raise. So the business is destroying economic value, not creating it. Worse, that gap has widened every year since FY2022 (18.6% → 8.9% → 6.0% → 2.9% → 2.75%), and operating margin — the share of each sales dollar left after running costs — has fallen three straight years (16.8% FY2022 → 4.1% LTM) [`09_moat.md` §3–5; `07_business-quality.md` §1]. No moat, meaning no durable edge that keeps competitors from eroding profit, is proven.

There is a real steelman on the other side: car-sales revenue grew 23–27% year-on-year in Q1–Q2 FY2026 after an 11% drop in Q4 FY2025, the Energy segment's share of gross profit nearly tripled in three years (6.5% FY2023 → 22.2% FY2025), and about 55% of North America buyers subscribe to paid self-driving [`03_segment-map.md` §2; `06_value-chain.md` §1]. The most recent two quarters do not, on their own, confirm a simple straight-line decline — but the multi-year trend still confirms erosion [`08_competitive-map.md` §3].

---

## The Specialists, Briefly

- **data-triage** — Sufficient, with gaps: the original standalone FY2025 10-K (audited financials, risk factors) is absent from the pool; a Part III-only 10-K/A and vendor exports stand in [`00_data-triage.md` §3].
- **disqualifier-scan** — No disqualifier triggered; CEO share-pledge ratio reads 28.9% on the correct denominator, though a narrower reading reaches 50.2% (flagged, not a trigger) [`01_disqualifier-scan.md`].
- **business-identity** — Vertically integrated EV maker plus energy storage and an unmonetized AI/robotics bet; regulatory-credit revenue down 67% year-on-year [`02_business-identity.md`].
- **segment-map** — Automotive dominant (86.5% revenue); Energy's gross-profit share nearly tripled in three years [`03_segment-map.md` §2].
- **unit-economics** — Value created at the gross-margin level only; a 20% price move (~$8,467/vehicle) would exceed the entire gross profit per vehicle (~$6,639) [`04_unit-economics.md` §4].
- **customer-geography** — No customer concentration, but US crossed 50% of FY2025 revenue with none of it contractually secured [`05_customer-geography.md` §3–4].
- **value-chain** — Mixed economic control; China-sourced battery cells sit inside Energy's fastest-growing profit pool under an escalating tariff regime [`06_value-chain.md` §5].
- **business-quality** — Aggregate 33/100 (Weak); operating margin fell three straight years; Filter 5 tripped (rate-of-change 30) [`07_business-quality.md`].
- **competitive-map** — Losing global electric-vehicle volume share to BYD; Tesla's own filings never name a competitor, so BYD is sourced only to unverified web press [`08_competitive-map.md` §3, §5].
- **moat** — No moat proven; ROIC below estimated cost of capital on every basis, gap widening since FY2022 [`09_moat.md` §4–5].
- **external-dependency** — 58/100 (inverted); regulatory-credit rollback (-67% year-on-year, near-100% margin) is the single biggest lever [`10_external-dependency.md` §5].
- **capital-allocation-governance** — 62/100, "Governance red flags"; a $132.3bn maximum-value, 423.7M-share CEO pay award atop a 56% cumulative share-count rise since 2017 with zero buybacks [`11_capital-allocation-governance.md`].
- **red-flags-sweep** — Governance and litigation overhang widening; unresolved federal securities-fraud class action naming the CEO personally [`12_red-flags-sweep.md` §2–3].

The synthesis found **no material disagreements** between specialists. The one apparent gap — automotive segment revenue of $25,097M (Note 14) versus $20,516M used elsewhere — is a reporting-line difference already reconciled ($20,516M + $4,581M services = $25,097M), not a conflict [synthesis §3].

---

## What Would Change This Read

Toward higher quality:
- Automotive gross margin stabilizing — not just rebounding for one or two quarters — as the regulatory-credit runoff completes.
- A disclosed, earning revenue line for FSD / Robotaxi / Optimus that lifts consolidated return on capital sustainably above the ~11.5% cost-of-capital estimate.

Toward lower quality:
- An adverse court ruling in the securities-fraud class action.
- Further certified CEO pay-award tranches without matching per-share value creation.
- A completed SpaceX-related merger that formalizes the related-party concentration already flagged.

[synthesis §4]

---

## Bottom Line

- **Verdict:** cyclical / technology-cycle bet — worth deeper work only with a strong timing edge, not as a standing compounder thesis.
- **Why it could be better than it looks:** car-sales revenue grew 23–27% in Q1–Q2 FY2026, Energy's gross-profit share nearly tripled to 22.2% in three years, and $27.4bn net cash funds real vertical integration [synthesis §1 bull point].
- **Why it could be worse:** return on capital (2.75%–3.7% LTM) sits ~770–885 basis points below an estimated ~11.5% cost of capital and the gap has widened four straight years, while the price story leans on a self-driving narrative with zero disclosed revenue and an active securities-fraud suit naming the CEO [`09_moat.md` §3–5; `12_red-flags-sweep.md` §2–3].
- **What evidence is missing:** the original standalone FY2025 10-K (audited financials, full auditor opinion, risk-factor and competition narrative) is not in the pool — only a Part III-only 10-K/A and vendor exports stand in [`00_data-triage.md` §3].
- **The one thing to watch next:** the court ruling on whether the federal securities-fraud class action proceeds to discovery — it lands directly on the unmonetized technology story the valuation appears to depend on [`12_red-flags-sweep.md` §2–3].

---

## Plain-English Glossary

- **Net cash** — cash left after subtracting all debt; $27.4bn here means Tesla holds far more cash than debt.
- **Return on capital (ROIC)** — the profit earned on each dollar invested in the business.
- **Cost of capital** — what the money invested costs to raise; a business creates value only when ROIC beats it.
- **Basis points** — hundredths of a percentage point; 770–885 basis points is 7.7–8.85 percentage points.
- **Operating margin** — the share of each sales dollar left after running costs.
- **Gross margin / gross profit** — the profit on a product after only the direct cost to make it, before overheads like R&D and admin.
- **Moat** — a durable edge that keeps competitors from eroding a company's profit.
- **Vertical integration** — building more of your own supply chain in-house instead of buying from others.
