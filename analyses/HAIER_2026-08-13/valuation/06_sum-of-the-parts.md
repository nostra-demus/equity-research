# Sum-of-the-Parts — HAIER (Haier Smart Home Co., Ltd., SHSE:600690)

**Reporting standard and currency:** China ASBE (CAS) segment note, cross-checked against the IFRS-basis H-share filing; all figures in RMB (CNY) millions, fiscal year ended Dec-31-2025 unless labelled FY2026E. Source: `business-model/03_segment-map.md`, citing `FY2025 Annual Report (SSE, CAS), Note 11(1) (分部信息), pp.222–224` and `FY2025 Annual Report (HKEX, IFRS), Note 4, pp.227–228`.

Cross-module inputs used: `business-model/03_segment-map.md` (segment revenue/profit/economics), `business-model/08_competitive-map.md` (named peer set), `valuation/01_price-and-capital-structure.md` (price, net debt, share count — used verbatim, Reconciliation Gate 1), `earnings/01_historical-financials.md` (FY2025 audited consolidated EBIT/EBITDA), `earnings/04_guidance-consensus.md` (consolidated FY2026 consensus). No `ciq_facts.json` sidecar exists for this ticker — all figures below are this agent's own sourced reads, cross-checked against the Capital IQ workbooks named inline.

Haier is **not** a single-segment business — the largest segment (Household Food Storage & Cooking Solutions) is 41.7% of FY2025 external revenue and 43.4% of segment profit, well under the 85% collapse threshold — so a full SOTP is run, not a collapse.

## 1. Segment Inventory

FY2025 (audited, CAS basis). "% of Total EBIT" denominator = RMB20,768mn, the **reportable-segment profit-before-tax total** disclosed in Note 11(1) (the six rows below plus a RMB50mn positive inter-segment-elimination residual sum to exactly this total — the residual is a reconciling item, not a business segment, and is not a corporate-cost drag). This reportable-segment total is 0.47% below CapIQ's derived consolidated "EBIT" line for FY2025 (RMB20,866.8mn, `earnings/01_historical-financials.md`) — an immaterial, named, definitional gap (segment profit-before-tax per the CAS note vs. a vendor-derived consolidated EBIT construct), not a vanished bucket (Reconciliation Gate 3).

| Segment | Revenue | EBIT-equivalent (segment profit before tax) | Margin | % of Total EBIT | Source |
|---|---:|---:|---:|---:|---|
| Household Food Storage & Cooking Solutions — Refrigerators/Freezers | 84,487 | 6,115 | 7.2% | 29.4% | `03_segment-map.md`, FY2025 AR (CAS) Note 11(1) |
| Household Food Storage & Cooking Solutions — Kitchen Appliances | 41,488 | 2,893 | 7.0% | 13.9% | Same |
| *Subtotal: Household Food Storage & Cooking Solutions* | *125,975* | *9,008* | *7.2%* | *43.4%* | Same |
| Air Solutions | 54,021 | 2,341 | 4.3% | 11.3% | Same |
| Home Laundry Care Solutions | 65,386 | 6,597 | 10.1% | 31.8% | Same |
| Household Water Solutions | 17,736 | 2,418 | 13.6% | 11.6% | Same |
| Other Business (channel distribution, component-parts mfg, small appliances, logistics) | 39,229 | 354 | 0.9% (external-revenue basis; company states 0.3% on a total-incl.-intersegment basis, `03_segment-map.md` §1) | 1.7% | Same |
| Reconciling item (inter-segment elimination) | — | 50 | — | 0.2% | Same |
| **Total (reportable segments)** | **302,347** | **20,768** | **6.9%** | **100%** | Same |

Revenue reconciles exactly to consolidated FY2025 revenue (RMB302,347mn, `earnings/01_historical-financials.md`). No unallocated negative corporate-cost bucket is disclosed at the segment level — the only reconciling item is the small positive RMB50mn elimination already included above (Gate 3 satisfied: nothing is dropped by assertion).

## 2. Segment Multiples & Comparables

**Forward basis.** No segment-level consensus estimate exists anywhere in the pool (`earnings/04_guidance-consensus.md` §2, §3: "not derivable — no segment-level consensus estimate exists"). Per the Suppress-rather-than-guess rule, this agent builds an **evidenced FY2026E estimate**: the consolidated FY2026 consensus EBIT (Capital IQ Estimates, `HaierSmartHomeCo,LtdSHSE600690EstimatesReport.xls`, Consensus tab, CNY22,722.0mn, 19–20 analysts) implies **+8.9% growth** over FY2025 audited consolidated EBIT (CNY20,866.8mn, `earnings/01_historical-financials.md`). This growth rate is applied **uniformly** across all six segment rows to the FY2025 audited base — labelled *"Inference, not from filings"* for the segment split (the growth rate itself is pool-sourced consensus; its uniform application across segments is this agent's own assumption). **Limitation, stated explicitly:** uniform application likely overstates growth for the real-estate-linked segments (Refrigeration, Kitchen, Laundry, Water — all flagged in `03_segment-map.md` as pressured by the China property downturn) and may understate Air Solutions, where the company's own qualitative guide is "high single-digit revenue growth and further improvement in operating margin" for the CCR sub-portion only (`earnings/04_guidance-consensus.md` §2) — a segment-specific number this agent cannot isolate from the CCR-only guide. Period basis for every segment: **FY2026E (FY+1)**.

Peer multiples are **NTM TEV/Forward EBITDA (Capital IQ)**, sourced from `Company Comparable Analysis Haier Smart Home Co Ltd .xls`, Trading Multiples tab, data as of 2026-08-12 (except Water Solutions, web-sourced — see below). Because the segment metric available is **EBIT** (segment profit before tax, not EBITDA — segment-level D&A is not disclosed), each peer's NTM EV/EBITDA is converted to an **implied NTM EV/EBIT** using that same peer's own LTM EV/EBIT ÷ LTM EV/EBITDA ratio (assumed stable from LTM to NTM) — shown as a formula in each row so the conversion is fully reproducible.

| Segment | Metric Used (period) | Named Comparable | Comparable's NTM EV/EBITDA | Conversion to NTM EV/EBIT | Multiple Applied | Why the comparable fits |
|---|---|---|---:|---|---:|---|
| Refrigerators/Freezers | FY2026E segment EBIT | Hisense Home Appliances Group (SZSE:000921) | 2.61x | ×(LTM EV/EBIT 3.2 ÷ LTM EV/EBITDA 2.4 = 1.333) | **3.48x** | Owns the Ronshen/Kelon refrigerator brands — China's oldest major refrigerator maker — a direct refrigeration-economics match, not a surface-label diversified peer |
| Kitchen Appliances | FY2026E segment EBIT | Hangzhou Robam Appliances (SZSE:002508) | 6.77x | ×(9.1÷7.9=1.152) | **7.80x** | Pure-play kitchen/cooking-appliance specialist (range hoods, gas hobs) — the closest economics match in the pool to Haier's kitchen-appliance line |
| Air Solutions | FY2026E segment EBIT | Gree Electric Appliances (SZSE:000651) | 4.08x | ×(5.0÷4.2=1.190) | **4.86x** | China's #1/#2 air-conditioner specialist by the company's own competitive read (`08_competitive-map.md`); direct category match for the HVAC-dominated Air Solutions segment |
| Home Laundry Care Solutions | FY2026E segment EBIT | Midea Group (SZSE:000333) | 10.47x | ×(13.6÷11.2=1.214) | **12.71x** | Best-available liquid domestic comp with material laundry-appliance exposure (Little Swan brand); **imperfect** — Midea is a diversified conglomerate (robotics, building tech, industrial) and no domestically-listed pure-play laundry specialist exists in the pool, so part of Midea's premium multiple may reflect businesses Haier's Laundry segment does not have. Flagged and sensitized in §3/§5 |
| Household Water Solutions | FY2026E segment EBIT | A.O. Smith Corp. (NYSE:AOS) | 10.57x (derived — see note) | ×(TTM EBITDA/EBIT 1.133) | **11.98x** | Global #1 water-heater / water-treatment maker with a large China water-heater JV — direct category match for Household Water Solutions |
| Other Business | FY2026E segment EBIT | Guangdong Xinbao Electrical Appliances (SZSE:002705) | 3.94x | ×(7.1÷4.3=1.651) | **6.51x** | OEM/ODM contract manufacturer of small appliances and component parts — matches the "equipment/component-parts manufacturing, small appliances" portion of this catch-all bucket; the distribution/logistics-services portion of Other Business has **no matching comparable** in the pool and is priced on this same multiple by default, a known imprecision flagged here, not silently absorbed |

**A.O. Smith derivation (web-sourced, unverified, labelled):** TTM EV/EBITDA 11.49x and enterprise value $9.00bn as of 2026-08-12 [stockanalysis.com, web]; no forward EV/EBITDA was published for this name, so a **derived NTM EV/EBITDA of 10.57x** is estimated as TTM EV/EBITDA × (forward P/E 16.05 ÷ trailing P/E 17.44 = 0.9203) [stockanalysis.com, 2026-08-12, web]; TTM EBITDA ($783.3mn, back-solved from EV/EBITDA) ÷ TTM EBIT ($691.3mn) = 1.133x conversion ratio to the EV/EBIT basis [stockanalysis.com, TTM period ended 2026-06-30, web]. Three stacked estimation steps — flagged as the single lowest-confidence multiple in this SOTP.

**Haier's own consolidated multiple, for context (not a segment row):** NTM TEV/Forward EBITDA 5.6x [same CapIQ workbook]; LTM TEV/EBIT 8.5x ÷ LTM TEV/EBITDA 6.3x = 1.349x conversion → **derived consolidated NTM EV/EBIT ≈ 7.56x**. Applied to consolidated FY2026E EBIT (CNY22,722.0mn) this implies EV ≈ CNY171,678mn — within 2% of Haier's own market-derived EV (CNY175,100.7mn, `01`), a sanity check that this multiple-conversion method is internally consistent.

## 3. Segment Valuation

FY2026E segment EBIT = FY2025 actual segment profit × 1.089 (§2). Segment EV = FY2026E EBIT × the derived NTM EV/EBIT multiple from §2.

| Segment | FY2026E EBIT (CNY mn) | Multiple (NTM EV/EBIT, derived) | Segment EV (CNY mn) |
|---|---:|---:|---:|
| Refrigerators/Freezers | 6,658.7 | 3.48x | 23,172.2 |
| Kitchen Appliances | 3,150.2 | 7.80x | 24,566.5 |
| Air Solutions | 2,549.1 | 4.86x | 12,381.5 |
| Home Laundry Care Solutions | 7,183.5 | 12.71x | 91,328.3 |
| Household Water Solutions | 2,633.0 | 11.98x | 31,534.0 |
| Other Business | 385.5 | 6.51x | 2,507.7 |
| **Gross enterprise value (sum)** | **22,560.0** | — | **185,490.2** |

(Reconciling item's FY2026E value, ~54.5mn, is not separately valued — it is a small positive elimination, not an operating business; omitting it from the sum is immaterial, <0.03% of gross EV.)

## 4. Equity Bridge

Anchors reused verbatim from `01_price-and-capital-structure.md` (Reconciliation Gate 1): net debt on the **broad** basis (canonical per `01`), minority interest, and the per-share-fair-value diluted share count.

| Step | Value (CNY mn) |
|---|---:|
| Gross enterprise value | 185,490.2 |
| − Capitalized unallocated corporate costs | 0.0 (none disclosed — see §1; the only reconciling item is a small positive elimination, already folded into the RMB20,768mn base) |
| − Net debt (broad basis, canonical from `01`) | (24,598.67) *(company is net CASH — shown as a negative number, i.e. added back once, per net-cash sign discipline; not double-counted)* |
| − Minority / preferred | (9,606.03) |
| + Equity-method investments (JV/associate stakes, per `01` §4) | 21,697.25 |
| − Conglomerate / holdco discount | 0.0 (see note below) |
| **= Equity value** | **222,180.1** |
| ÷ Diluted shares (9,311.825848mn, per `01` §2, per-share fair-value count) | |
| **= SOTP value per share** | **CNY 23.86** |
| vs current price (CNY 21.75, `01` §1, pool-verified, 2026-08-12) | **+9.7%** |

**Conglomerate/holdco discount: none applied.** Haier Smart Home is a single operating legal entity reporting product-line segments, not a legal holding company with separately-traded subsidiaries — there is no structural holdco layer to discount. The reason to treat the base-case SOTP result with caution is instead the **comparable-quality caveat on the Laundry segment** (§2, §5), not a conglomerate-structure discount; that caveat is carried as a sensitivity range below rather than a blanket discount.

**Sensitivity — Laundry comparable swap (dispersion, not a second scenario):** because no domestically-listed pure-play laundry specialist exists, replacing Midea's derived 12.71x with the **lowest** derived multiple in the domestic-appliance comp set used elsewhere in this SOTP (Hisense Home Appliances, 3.48x — i.e., assuming Laundry earns no premium at all over the cheapest domestic appliance peer) drops Home Laundry Care's segment EV from CNY91,328.3mn to CNY24,998.7mn, and:

| | Gross EV | Equity value | Per share | vs price (CNY 21.75) |
|---|---:|---:|---:|---:|
| Base (Midea 12.71x for Laundry) | 185,490.2 | 222,180.1 | **CNY 23.86** | +9.7% |
| Low sensitivity (Hisense 3.48x for Laundry) | 119,160.5 | 155,850.4 | **CNY 16.74** | −23.0% |

This CNY 16.74–23.86 range (a ~43% spread driven by one comparable choice on the single highest-weighted segment) is the dispersion this SOTP can defensibly show — not a false-precision single point.

## 5. SOTP Read

The base-case breakup value (CNY 23.86/share) sits 9.7% above the current price (CNY 21.75), but nearly the entire premium over Haier's own consolidated market value (CNY 175,100.7mn EV) comes from one segment: Home Laundry Care Solutions, valued at CNY 91,328mn — 49% of the whole SOTP's gross EV — despite carrying only 31.8% of segment profit, because it is priced on Midea's 12.71x derived forward EV/EBIT rather than Haier's own ~7.56x consolidated multiple. Strip that one assumption out (using the cheapest domestic-appliance peer instead) and the breakup value falls to CNY 16.74/share, 23% *below* the current price — so the entire "is Haier's best segment being masked by the consolidated multiple" thesis rests on whether Laundry deserves a Midea-like premium, and no clean pure-play laundry comparable exists in this pool to settle that question. The four smaller segments (Refrigerators, Kitchen, Air Solutions, Other Business) collectively add only ~CNY 62.6bn and are far less sensitive to comp choice. Treat this SOTP as a genuine but comp-fragile finding, not a confirmed undervaluation: it flags Laundry as the segment most likely to be under-multipled by the market, but the size of that mispricing cannot be pinned down without a better peer.

