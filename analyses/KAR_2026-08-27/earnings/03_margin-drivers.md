# Margin Drivers — KAR

Karoon Energy Ltd (ASX: KAR) reports in US dollars under IFRS/AASB, half-yearly not quarterly (full audited/reviewed income statement, balance sheet, cash flow every six months; the "quarterly" ASX Activities Reports carry production, sales revenue, and realised price only, not a full P&L or cost breakdown) [`00_earnings-data-triage.md` §0]. The most recent full-P&L period in this pool is FY2025 (year ended 31-Dec-2025, filed 25-Feb-2026); the H1/FY2026 half-year result was due 26-Aug-2026 (per CIQ) but is **not present in this pool as of the run date (2026-08-27)** — every FY2026 figure below is drawn from the two quarterly Activities Reports (1Q26, 2Q26) that disclose production, revenue, and realised price only, not cost of sales. This is flagged wherever a FY2026 figure is used.

## 1. Segment Decomposition Status

Karoon discloses one *business* segment (hydrocarbon E&P) but three *reportable operating* segments by geography — **Brazil, USA, Corporate/other** — with a full segment income statement down to profit-for-the-year, including cost-of-sales sub-line detail (operating costs, royalties, D&A by asset type, transportation and marketing, flotel costs) [FY2025 Annual Report, Note 2(b), pp.85-87]. This is materially better disclosure than the revenue-only segment notes typical among smaller E&P peers, and this report decomposes margin drivers at that level in Section 6. Brazil (Baúna) is 77.9% of FY2025 revenue and 91.2% of FY2025 gross profit, clearing the >85%-of-one-segment threshold on gross profit though not on revenue — Karoon is read here as a Brazil-led, two-asset E&P company with a persistent Corporate/other financing drag, not a genuinely single-segment business [`business-model/03_segment-map.md` §2]. Business-model module output is available and used throughout (`03_segment-map.md`, `06_value-chain.md`, `10_external-dependency.md`, `02_business-identity.md`).

## 2. Cost Stack

**Sector overlay applied: Oil & gas (E&P) — margin analysis uses netback / unit opex, unit DD&A, royalties/government take, and hedging-book grammar from `frameworks/SECTOR_OVERLAYS.md`, not a generic COGS/freight/labour/SG&A table.** Karoon has no "COGS" or "freight" line in the conventional manufacturing/retail sense; its cost of sales is disclosed as operating costs, royalties and government take, transportation and marketing, D&A by asset type, and (in 2025) one-off flotel/FPSO-transition costs [FY2025 Annual Report, Note 2(b), Note 4(a), pp.85-87, p.181].

| Cost Line (E&P grammar) | FY2025 (US$m) | FY2024 (US$m) | % of Revenue FY25 | Direction | Evidence | Margin Risk |
|---|---:|---:|---:|---|---|---|
| Unit production cost (NWI, group) | US$13.20/boe | US$13.60/boe | n/a (per-boe) | Improving (-2.9%) | FY2025 Annual Report, p.48-49; 2025 Earnings Call, Feb-26-2026, p.4 | Low — largely fixed short-term; CY26 guidance US$12-15/boe, a wide band |
| Baúna unit production cost (NWI) | US$14.80/bbl | US$15.96/bbl | n/a | Improving (-7.3%), driven by FPSO buyout removing lease costs | FY2025 Annual Report, p.49; `business-model/04_unit-economics.md` §2 | Low-Mid |
| Who Dat unit production cost (NWI) | US$9.15/boe | US$8.50/boe | n/a | **Deteriorating** (+7.6%), driven by lower production diluting largely-fixed costs | FY2025 Annual Report, p.49 | Mid |
| Royalties and other government take | 44.1 | 50.9 | 7.0% | Improving in dollars, but mechanical (ad valorem — falls automatically with price/volume, not a company lever) | FY2025 Annual Report, Note 2(b), p.86-87 | High — a new Brazilian export tax (12%/7.92% after tax, extended to ~7-Sep-2026) stacks on top of this and is not yet in the FY2025 base [2Q26 Activities Report, p.5] |
| Operating costs (cash opex) | 123.6 | 95.3 | 19.7% | **Deteriorating** (+29.7%) — reflects post-acquisition FPSO operating costs (crew, maintenance) that were previously bundled inside the charter lease, plus the SPS-92/E-manifold intervention programme | FY2025 Annual Report, Note 2(b), p.85-86 | High — largest single cost-of-sales line by dollar growth |
| Flotel costs | 21.1 | 0 | 3.4% | New in 2025 — one-off maintenance/revitalisation campaign | FY2025 Annual Report, Note 2(b), p.86 | Mid — a second flotel-supported campaign is planned for the 2026 programme, so this is not fully non-recurring [FY2025 Annual Report, p.13 area] |
| Transportation and marketing | 21.6 | 23.3 | 3.4% | Improving (-7.3%) | FY2025 Annual Report, Note 2(b), p.86-87 | Low |
| D&A — production assets | 151.6 | 163.5 | 24.1% | Improving (-7.3%) | FY2025 Annual Report, Note 2(b), p.86-87 | Low-Mid |
| D&A — FPSO (owned, new) | 13.9 | 0 | 2.2% | New — replaces part of the FPSO lease D&A now the vessel is owned | FY2025 Annual Report, Note 2(b), p.86 | Mid — CY26 guided unit DD&A US$15-17/boe, up from US$15.19/boe actual FY25 (was US$14.90/boe FY24) |
| D&A — FPSO right-of-use (lease) asset | 14.2 | 45.2 | 2.3% | Improving (-68.6%) — mechanical result of the 1-May-2025 FPSO buyout (lease liability fell from US$177.7m to US$1.1m) | FY2025 Annual Report, Note 2(b), p.86-87; `01_historical-financials.md` §1 note | Low — structural, one-off shift, will not repeat |
| Net interest and other finance costs (Corporate/other) | 70.2 | 46.1 | 11.2% | **Deteriorating** (+52.3%) — reduced interest income on lower cash balances (used to fund the FPSO buyout and the Petrobras contingent-consideration payment) plus a full year of the 10.50% fixed-rate Notes coupon | FY2025 Annual Report, Note 2(b), p.86-87; Directors' Report, p.49 | Mid — net cash/debt position moved further negative in 1H26 (net debt US$269.7m at 30-Jun-2026 vs US$132.7m at 31-Dec-2025) [2Q26 Activities Report, p.4] |
| Withholding tax expense | 17.8 | 6.2 | 2.8% | Deteriorating (+187%) — linked to cross-border/intra-group cash movements, including the Houston head-office relocation | FY2025 Annual Report, Note 2(b), p.86-87 | Low-Mid |
| Hedging book | None active | None active | n/a | Neutral by construction, but a real gap in downside protection | FY2025 Annual Report, Note 20(b); 2Q26 Activities Report, p.4 ("no hedges in place but retains discretion") | High — fully unhedged into a Brent-linked revenue line; RBL facility (undrawn) carries a minimum-hedging covenant only when drawn |
| Finding & development (F&D) cost | Not a single disclosed US$/boe figure | — | — | Not disclosed | `business-model/04_unit-economics.md` §1 flags this as a gap | Not assessable |

## 3. Margin Walk (E&P adaptation)

The standard Gross → EBITDA → EBIT walk is shown below, but for an E&P producer the more decision-useful equivalents are the **unit netback** (realised price less royalties, transport, and unit production cost) and the **underlying EBITDAX margin** (which strips D&A, exploration expense, and cost of unsuccessful wells) — both are shown alongside because the statutory EBITDA and NPAT lines are distorted by large one-off items in FY2025 (see the contradiction flagged below).

| Margin Level | FY2025 | FY2024 | Change bps | Main Reason | Evidence |
|---|---:|---:|---:|---|---|
| Gross margin (statutory) | 38.4% | 48.8% | **-1,043bps** | Realised price fell 14% (Baúna) / 17% (Who Dat) on flat-to-lower volumes; cost of sales fell only 2.5%, far less than revenue | FY2025 Annual Report, p.78, Note 2(b) |
| Underlying EBITDAX margin | 61.9% | 63.4% | **-155bps** | Cleaner read: excludes D&A, exploration expense, unsuccessful-well costs and the FY2025 one-offs. Compression is real but much smaller than the gross-margin read because unit production costs are largely fixed and moved favourably | FY2025 Annual Report, Financial Summary p.48 |
| EBITDA margin (statutory, company-defined) | 60.6% | 58.0% | **+257bps** — **flagged, not trusted at face value** | This "expansion" is a one-off artefact: FY2025 EBITDA of US$380.7m includes a US$35.3m gain on disposal of the FPSO right-of-use asset and a US$21.2m gain on contingent-consideration fair-value change. Strip both (US$380.7m − US$35.3m − US$21.2m = US$324.2m) and the adjusted EBITDA margin is 51.6%, a **-641bps** move — directionally consistent with the gross-margin and Underlying-EBITDAX declines | `01_historical-financials.md` §6, citing FY2025 Annual Report Financial Summary p.48 |
| EBIT margin (CIQ-standardised) | 31.4% | 41.0% | **-960bps** | Same revenue/cost dynamic as gross margin, plus the D&A step-up from the FPSO purchase | `01_historical-financials.md` §1 |
| Underlying NPAT margin | 17.1% | 27.6% | **-1,046bps** | Underlying NPAT strips the same one-offs from the net-income line; this is the cleanest full-P&L read and tracks the gross-margin decline closely | FY2025 Annual Report, Financial Summary p.48 (Underlying NPAT US$107.5m / US$214.0m); computed on revenue US$628.6m / US$776.5m |
| Statutory NPAT margin | 20.0% | 16.4% | +357bps — **flagged, same one-off distortion** | Statutory NPAT of US$125.5m (FY25) actually rose 2%-lower-than-prior versus revenue that fell 19%, purely because the same FPSO-disposal and contingent-consideration gains sit above the tax line; this is the single-metric-disagrees case CLAUDE.md §3 requires naming explicitly, and it should not be read as margin improvement | FY2025 Annual Report, p.78 |

**Pass-through: no lag, because there is no negotiation to lag.** Karoon sells every barrel at a same-day benchmark-linked price (Brent-linked for Baúna, US Gulf Coast/Henry Hub-linked for Who Dat) — there is no bilateral contract with an escalator clause to lag, so "price" moves into revenue instantly [`business-model/06_value-chain.md` §2]. The only genuine lag in this business sits on the cost side: royalties (ad valorem, so they track price/volume mechanically and reduce automatically when price falls) provide a small, non-discretionary buffer, but management's own disclosed cost recovery against the FY2025 revenue shock was only ~9.5% (US$14m of favourable, named cost items against a US$147.9m revenue fall), most of it either mechanical (royalties) or non-repeatable (the FPSO lease-cost saving) [`business-model/06_value-chain.md` §2].

## 4. Margin Walk — Which Margin Level Matters Most?

For Karoon, **underlying EBITDAX margin (and the underlying unit netback that sits behind it) is the most decision-useful margin**, not statutory gross margin or statutory EBITDA/NPAT margin. The reasons: (1) statutory EBITDA and statutory NPAT are both currently distorted by one-off, non-repeating gains (FPSO disposal, contingent-consideration fair-value change) large enough to flip their direction versus the underlying business (Section 3); (2) gross margin, while directionally honest, mixes a large non-cash D&A swing (the FPSO ownership transition) with the cash cost-of-sales story, making it noisier than necessary for a business whose real driver is realised price against a largely fixed cash cost per barrel; (3) the company itself reports and is judged by underlying EBITDAX and underlying NPAT as "best present[ing] the key business drivers and performance" [FY2025 Annual Report, p.49]. Underlying EBITDAX margin fell only 155bps in FY2025 versus a 1,043bps gross-margin decline — this is the correct, decision-useful read: real compression happened, but it is far smaller than gross margin alone suggests once one-offs and the FPSO D&A mechanics are stripped out.

## 5. Margin Driver Table (consolidated)

| Driver | Impact on Margins | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Realised Brent-linked oil price (Baúna) | Direct, same-day pass-through into revenue; no cost offset | **Headwind currently reversing to tailwind** — FY2025 average US$66.57/bbl (down from US$77.36/bbl); but 2Q26 spiked to US$94.56/bbl (+33% q/q) on Middle East/Strait of Hormuz geopolitical disruption — management's own CY26 guidance assumes a lower US$60-70/bbl for 2H26, i.e. management itself does not treat the 2Q26 spike as run-rate | **High** — a ±10% Brent move is roughly a ±US$50-60m annualised revenue swing at current volumes, with almost no offsetting cost move | `business-model/02_business-identity.md` §4; 2Q26 Activities Report, p.4, p.2 |
| Who Dat realised liquids/gas price (US Gulf Coast / Henry Hub-linked) | Same mechanism, smaller segment | Volatile — 2Q26 liquids price +55% q/q, gas price -47% q/q | Mid | 2Q26 Activities Report, p.2 |
| Unit production cost (group NWI) | Largely fixed short-term; a decline here flows almost straight to margin | Tailwind — US$13.20/boe FY25 vs US$13.60/boe FY24, CY26 guided US$12-15/boe | Mid | FY2025 Annual Report, p.48-49; 2Q26 Activities Report, p.6 |
| FPSO ownership transition (bought 1-May-2025) | Removed the charter lease cost, replaced part of it with new operating costs and owned-asset D&A | Net tailwind on cash costs (US$40m disclosed lease-cost saving), but a one-off, non-repeating driver, and unit DD&A guided to rise (US$15-17/boe CY26 vs US$15.19/boe FY25 actual) | High (one-off, will not repeat) | `business-model/06_value-chain.md` §2; 2Q26 Activities Report, p.6 |
| Royalties and government take | Ad valorem, moves mechanically with price/volume | Small structural tailwind when price falls (not a company lever); worsens when price rises | Mid | FY2025 Annual Report, Note 2(b) |
| New Brazilian export tax (12%/7.92% after tax, extended to ~7-Sep-2026) | New cost stacked on top of royalties, applies automatically to Baúna cargoes | Headwind — 2 of Karoon's cargoes were subject to it in 2Q26 (0 in 1Q26); no company-side lever besides an industry legal challenge | Mid-High if extended further; low-Mid at current cargo-exposure levels | 2Q26 Activities Report, p.5 |
| Flotel / FPSO transition one-off costs | New cost lines in FY2025 (US$21.1m flotel + US$4.4m transition) | Headwind, but a second flotel campaign is already planned for 2026 — not a clean one-off | Mid | FY2025 Annual Report, Note 2(b), p.13 area |
| Volume — natural decline, well workovers/shut-ins (SPS-92, Who Dat E-manifold) | Dilutes largely-fixed unit costs when volume falls | Headwind in 1H26: Baúna production fell 46% q/q, Who Dat fell 40% q/q (NWI) in 2Q26 on a planned 28-day FPSO shutdown plus the SPS-92 and E-manifold shut-ins; both wells were being restored through 3Q26 | High in the short window it hits; both disclosed as temporary | 2Q26 Activities Report, p.2, p.4 |
| Segment mix (Brazil vs USA vs Corporate) | Brazil is the high-margin segment (45.0% gross margin); USA swung to a loss (15.2% gross margin, -1.8m PBT); Corporate/other is a persistent, growing net-margin drag | Headwind from the USA and Corporate deterioration, partially offset by Brazil's dominant weight | High | Section 6 below |
| Net interest and other finance costs | Rose 52% (US$46.1m to US$70.2m) on reduced interest income and a full year of the 10.50% Notes coupon | Headwind, and net debt widened further in 1H26 (US$132.7m to US$269.7m) | Mid | FY2025 Annual Report, Note 2(b); 2Q26 Activities Report, p.4 |
| Withholding tax | Rose from US$6.2m to US$17.8m on cross-border cash movements including the Houston relocation | Headwind (small) | Low | FY2025 Annual Report, Note 2(b) |
| Hedging (absence of) | No active hedges since the last collar expired out-of-the-money at end-2025 | Neutral to margin today, but removes any cushion against the next adverse price move | Unknown magnitude, real exposure | FY2025 Annual Report, Note 20(b); 2Q26 Activities Report, p.4 |

## 6. Margin Drivers By Segment

### Segment: Brazil / Baúna Project (77.9% of FY2025 revenue, 91.2% of FY2025 gross profit)

| Driver | Impact | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Realised Baúna crude price | Direct revenue driver, no cost offset | Headwind FY25 (US$66.57/bbl vs US$77.36/bbl, -14%); reversed sharply in 2Q26 (US$94.56/bbl) on a geopolitical spike management itself does not guide to for 2H26 | High | FY2025 Annual Report, p.49; 2Q26 Activities Report, p.2, p.4 |
| FPSO buyout (owned since 1-May-2025) | Removed lease cost, cut unit production cost from US$15.96/bbl to US$14.80/bbl | Tailwind, one-off, non-repeating | High | FY2025 Annual Report, p.49 |
| Flotel campaign / FPSO revitalisation | New US$21.1m cost in FY25; a second campaign is planned for 2026 | Headwind, partially recurring | Mid | FY2025 Annual Report, Note 2(b) |
| Royalties (ad valorem, Brazil) | Fell US$6.8m (mechanical, tracks price/volume) | Small tailwind when price falls | Low-Mid | FY2025 Annual Report, Note 2(b) |
| New Brazilian export tax | Applies only to Baúna cargoes | Headwind, currently small (2 cargoes in 2Q26) but the tax has already been extended once | Mid if extended further | 2Q26 Activities Report, p.5 |
| Single-FPSO/single-well concentration (SPS-92 shut-in, operatorship transition) | A maintenance or reliability event at the one vessel hits the whole segment; production fell 46% q/q in 2Q26 | Headwind, temporary but repeatable risk | High in the quarter it hits | 2Q26 Activities Report, p.1, p.4 |

### Segment: USA / Who Dat, Dome Patrol, Abilene (22.1% of FY2025 revenue)

| Driver | Impact | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Realised Who Dat liquids/gas prices | Same benchmark-linked mechanism, more volatile (liquids +55% q/q, gas -47% q/q in 2Q26) | Volatile headwind/tailwind | Mid | 2Q26 Activities Report, p.2 |
| Costs of unsuccessful exploration wells (Who Dat West) | US$14.8m one-off charge that swung the segment to a PBT loss | Headwind, one-off (well already declared unsuccessful, no repeat expected on this specific well) | High for FY2025 alone | FY2025 Annual Report, Note 2(b), Note 4(c)(i) |
| Non-operated status (LLOG/Harbour Energy operates) | Karoon has no vote over capital or operating decisions | Structural headwind to margin control, not a single-period driver | Structural | `business-model/06_value-chain.md` §1 |
| E-manifold riser leak shut-in (2026) | ~15,000 boepd (gross) of production affected from Feb-2026, still shut in as of 2Q26; repair work targeted 3Q26 | Headwind, volume-driven unit-cost dilution while it persists | Mid-High while unresolved | 2Q26 Activities Report, p.4 |
| Who Dat unit production cost (NWI) | Rose from US$8.50/boe to US$9.15/boe on lower production diluting largely-fixed costs | Headwind | Low-Mid (small segment) | FY2025 Annual Report, p.49 |
| Revenue reported net of royalties (NRI basis) | Structurally compresses realised segment economics versus a gross presentation | Structural, not a period driver | Structural | `business-model/03_segment-map.md` §1 |

### Segment: Corporate/other (no revenue; -US$96.9m FY25 PBT, -68% of consolidated PBT)

Not a margin driver in the gross-profit sense (no revenue), but material to the net-margin walk: this bucket absorbed a 52% rise in net interest and other finance costs (US$46.1m to US$70.2m) and a 187% rise in withholding tax (US$6.2m to US$17.8m) in FY2025 [FY2025 Annual Report, Note 2(b)]. Both are headwinds to consolidated net margin that sit entirely outside the two operating segments and would be missed by a reader who looked only at Brazil/USA segment P&Ls.

## 7. Margin Bridge — FY2025 vs FY2024 (Consolidated)

**Dollar bridge (exact — this reconciles fully because cost of sales and revenue sum directly to gross profit, with zero residual):**

| Component | US$m Impact | Evidence |
|---|---:|---|
| Revenue — price | -100.4 | 2025 Earnings Call, Feb-26-2026 (management's own price/volume revenue bridge) |
| Revenue — volume | -47.5 | 2025 Earnings Call, Feb-26-2026 |
| **Revenue subtotal** | **-147.9** | Reconciles to US$776.5m → US$628.6m |
| Cost of sales — operating costs | -28.3 | FY2025 Annual Report, Note 2(b) (123.6 vs 95.3, cost increase) |
| Cost of sales — flotel costs (new) | -21.1 | FY2025 Annual Report, Note 2(b) |
| Cost of sales — FPSO transition costs (new) | -4.4 | FY2025 Annual Report, Note 2(b) |
| Cost of sales — D&A, owned FPSO (new) | -13.9 | FY2025 Annual Report, Note 2(b) |
| Cost of sales — royalties/government take | +6.8 | FY2025 Annual Report, Note 2(b) (44.1 vs 50.9, cost decrease) |
| Cost of sales — D&A, production assets | +11.9 | FY2025 Annual Report, Note 2(b) (151.6 vs 163.5) |
| Cost of sales — D&A, FPSO right-of-use (lease) | +31.0 | FY2025 Annual Report, Note 2(b) (14.2 vs 45.2 — FPSO buyout) |
| Cost of sales — change in inventories (timing) | +26.3 | FY2025 Annual Report, Note 2(b) (+10.1 credit vs -16.2 charge) |
| Cost of sales — transportation & marketing | +1.7 | FY2025 Annual Report, Note 2(b) |
| Cost of sales — carbon credit costs | +0.1 | FY2025 Annual Report, Note 2(b) |
| **Cost of sales subtotal (net cost decrease = tailwind)** | **+10.1** | Reconciles to US$397.4m → US$387.3m |
| **Total gross profit change** | **-137.8** | US$379.1m → US$241.3m — matches -147.9 + 10.1 = -137.8 exactly |

## 7a. Bridge Attribution and Residual

The dollar bridge above is not a modelled/sensitivity-derived bridge — every line is a reported segment-note figure, and revenue minus cost of sales equals gross profit by construction, so the dollar-level reconciliation is exact with **zero residual**. The one place a sensitivity/modelled figure is used is the translation of these dollars into the **basis-point margin change** the Section 7 template asks for, and that translation is shown explicitly below because a linear bps conversion does not reconcile exactly when the revenue denominator itself moves 19%:

```
Price:          -US$100.4m ÷ US$776.5m (FY24 revenue base) = -12.93% of revenue = -1,293bps
Volume:          -US$47.5m ÷ US$776.5m (FY24 revenue base) =  -6.12% of revenue =   -612bps
Royalties:         +US$6.8m ÷ US$776.5m (FY24 revenue base) =  +0.88% of revenue =    +88bps
Operating costs:  -US$28.3m ÷ US$776.5m (FY24 revenue base) =  -3.64% of revenue =   -364bps
Flotel + transition (one-off): -US$25.5m ÷ US$776.5m         =  -3.28% of revenue =   -329bps
D&A, production assets:  +US$11.9m ÷ US$776.5m               =  +1.53% of revenue =   +153bps
FPSO D&A net (owned +13.9m headwind, ROU lease -31.0m tailwind) = +US$17.1m net ÷ US$776.5m = +2.20% = +220bps
Inventory timing: +US$26.3m ÷ US$776.5m                       =  +3.39% of revenue =   +339bps
Transport/carbon: +US$1.8m ÷ US$776.5m                        =  +0.23% of revenue =    +23bps
  → Modelled sum: -1,905 (revenue) + 130 (cost, matching the +US$10.1m dollar tailwind) = -1,775bps
  → Basis: every component above uses FY2024 (US$776.5m) as a FIXED denominator — this basis matches
    the dollar figures it was built from, but NOT the actual FY25 vs FY24 margin-percentage denominators
    (US$628.6m vs US$776.5m), which is why it does not equal the observed change.
```

**Reconciliation:** the modelled bps sum is **-1,775bps**; the observed gross-margin change (Section 3) is **-1,043bps**. Gap = **+732bps**. This gap is **not an unexplained driver** — the dollar bridge above already reconciles exactly to zero residual (Section 7) — it is a mechanical artefact of translating dollar changes into percentage-margin bps against a fixed prior-year revenue base while revenue itself fell 19%. As revenue shrinks, the same dollar cost movements represent a smaller share of the current, smaller revenue base than they do of the fixed prior-year base used above, so a linear bps bridge overstates the compression versus the true percentage-point change. This is stated explicitly rather than rounded away: **the dollar-level bridge is the trustworthy version of this table; the bps translation is directionally correct (both point to price as the dominant driver, cost items as a modest net offset) but should not be read as decomposing the exact -1,043bps to the basis point.**

## 8. The Single Biggest Margin Driver

**The realised Baúna crude price (Brent-linked).** Of the US$147.9m FY2025 revenue decline, US$100.4m (68%) was management's own disclosed price effect versus US$47.5m (32%) volume — and on the cost side, unit production costs are largely fixed short-term, so a given price move flows almost directly to cash margin ("costs largely fixed, that revenue reduction flowed directly to underlying EBITDAX" [2025 Earnings Call, Feb-26-2026]). This single driver clears well over half the observed revenue-side change and, because cost of sales moved only 2.5% against it, dominates the gross-margin outcome too — the arithmetic in Section 7 supports calling it the single biggest driver, not merely "a" driver. **Its current direction is reversing, but not on a run-rate basis:** 2Q26 saw Baúna crude spike to US$94.56/bbl (+33% q/q) on Middle East/Strait of Hormuz-driven geopolitical disruption — a level above every full-year average in the FY2021-2025 history (group-blended range US$59.00/bbl to US$84.74/bbl [`business-model/04_unit-economics.md` §4]) — yet management's own CY2026 guidance assumes a materially lower US$60-70/bbl for 2H26 [2Q26 Activities Report, p.4]. Per the Cycle-Position Rule: **the 2Q26 realised-price level is not run-rate and should not be extrapolated** — it is a one-time geopolitical spike that management itself is not budgeting to persist, and the company has no active hedge to lock in the current elevated level should it reverse before 2H26 volumes are sold.

## 9. Investment Spend — Both Signs

Karoon's aggregate capex is **not clearly running well above its own history** — CY2026 guided total capex of US$178-202m (plus US$28m of the final Petrobras contingent-consideration instalment) sits close to FY2024's US$218.6m and below FY2025's US$288.5m (which included the one-off US$115m FPSO purchase) [`01_historical-financials.md` §1; 2Q26 Activities Report, p.6]. Within a single quarter, though, 2Q26 capex jumped to US$126.6m from US$39.5m in 1Q26 (+221% q/q) on the SPS-92 intervention, the Baúna flotel campaign, and the Who Dat A1 sidetrack [2Q26 Activities Report, p.4] — all sustaining/workover spend aimed at restoring or extending existing production, not new-field growth capex. Two capacity-adding decisions are pending and would change this picture: the Who Dat East Final Investment Decision (FID, expected 3Q26) and the Neon development milestone (expected 4Q26) [2Q26 Activities Report, p.5].

| Reading | What it would show | Evidence here |
|---|---|---|
| Spend as a future COST | Rising unit DD&A (guided US$15-17/boe CY26 vs US$15.19/boe FY25 actual, vs US$14.90/boe FY24) as the owned FPSO and any FID-sanctioned Who Dat East / Neon capex is depreciated; net interest costs already rose 52% as cash was drawn down to fund the FPSO buyout | FY2025 Annual Report, p.49-50; 2Q26 Activities Report, p.6 |
| Spend as a DEMAND/RESERVES signal | An E&P producer has no sales backlog in the SaaS/cloud sense — the closest analogue is proved-reserve conversion: Baúna 2P reserves grew via 2C-to-2P conversion in 2025, group 2P reserve life extended from 6.5 to 7.1 years, and the FPSO buyout itself was underwritten to a mid-teens-plus post-tax IRR and a disclosed 4-year payback | `business-model/04_unit-economics.md` §2; FY2025 Annual Report, p.36 |

**Current read:** the cost-side reading dominates for what is already committed (the FPSO D&A step-up is locked in and guided higher), while the reserves/demand-signal reading is a smaller, forward-looking consideration that depends on FID outcomes not yet made. **The single observable that would flip this** is the Who Dat East FID decision expected in 3Q26 — a positive FID would add disclosed growth capex against a barrel base Karoon does not yet control operating decisions for (non-operated, LLOG/Harbour Energy), while a deferral would keep the current, largely-maintenance capex profile intact.
