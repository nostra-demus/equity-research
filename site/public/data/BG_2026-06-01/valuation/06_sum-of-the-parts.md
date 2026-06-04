# Sum-of-the-Parts — BG

**Company:** Bunge Global SA (NYSE: BG). **Reporting currency:** US$ millions unless a per-share basis is stated. **Segment data:** FY2025 10-K, Note 26 (year ended Dec-31-2025). **Capital structure:** Q1 FY2026 10-Q (Mar-31-2026), per `01_price-and-capital-structure.md`. **Today:** 2026-06-01.

**Anchors carried verbatim from `01` (do not re-derive):** indicative price **$123.35** (*web-sourced as of 2026-06-01, not from data pool — unverified*; band ~$123–126.50); per-share fair-value share count **195,733,665** (diluted WA, 10-Q Note 18); net debt **$13,714M**; NCI + redeemable NCI **$1,432M** ($1,381M + $51M); equity-method investments **$1,276M**; consolidated EV **$39,078M**.

**Two hard caveats frame everything below — read before the tables:**
1. **No peer multiples export in the pool** (per `00` triage and the run instruction). Only one named competitor is public with a usable traded multiple — Archer Daniels Midland (ADM); Cargill and Louis Dreyfus are private with no clean segment economics [`business-model/08_competitive-map.md` §2]. Every segment multiple here is therefore **comparable-justified but low-confidence**, anchored to ADM and to BG's own forward multiples, not to a peer export.
2. **FY2025 is a trough/transition year, and the segment metric and the net debt are mismatched in time.** Viterra (acquired mid-2025) is consolidated in the segment EBIT/EBITDA for only ~two quarters of FY2025, but **100% of Viterra's debt is in the Mar-31-2026 net debt** [`earnings/01_historical-financials.md` §6; `01` §5]. Multiplying a trough-year segment metric by a mid-cycle multiple and then subtracting a freshly-doubled net debt double-counts the cyclical low. The MODULE_RULES cyclicality gate (item 6) applies: the SOTP is run on **two bases** — trough FY2025 reported (SOTP-A) and normalized FY2026-consensus (SOTP-B) — and the gap between them is itself the finding.

---

## 1. Segment Inventory

Reporting currency **US$M**, FY2025. Profit metric = **Segment EBIT** (Bunge's stated CODM measure) [FY25 10-K, Note 26, lines 8449–8456]. EBITDA = Segment EBIT + segment total D&A (constructed; Bunge reports no segment "EBITDA" line). "% of reportable EBIT" excludes the −$796M Corporate & Other drag, so the four shares sum to ~100% of the $2,329M reportable Segment EBIT, **not** of the $1,533M total company EBIT.

| Segment | Revenue | Segment EBIT | EBIT margin | Segment EBITDA | % of reportable EBIT | Source |
|---|---:|---:|---:|---:|---:|---|
| Soybean Processing & Refining | 36,313 | 1,225 | 3.37% | 1,490 | 52.6% | FY25 10-K, Note 26, FY2025 table, lines 8360–8381 |
| Softseed Processing & Refining | 11,252 | 521 | 4.63% | 646 | 22.4% | FY25 10-K, Note 26, FY2025 table |
| Grain Merchandising & Milling | 18,128 | 465 | 2.57% | 641 | 20.0% | FY25 10-K, Note 26, FY2025 table |
| Other Oilseeds Processing & Refining | 4,633 | 118 | 2.55% | 228 | 5.1% | FY25 10-K, Note 26, FY2025 table |
| **Total reportable segments** | **70,326** | **2,329** | 3.31% | **3,005** | **100.0%** | FY25 10-K, Note 26, line 8375 |
| Corporate & Other (not a reportable segment) | 3 | (796) | n.m. | (769) | n/a | FY25 10-K, Note 26, line 8375; reconciliation p.37 |
| **Consolidated (Total Bunge)** | **70,329** | **1,533** | 2.18% | **2,236** | — | FY25 10-K, Note 26, line 8375; MD&A p.37, lines 2375–2383 |

**Reconciliation to consolidated (Gate 3 — SOTP must tie):**
- Revenue: 36,313 + 11,252 + 18,128 + 4,633 = **70,326** reportable; + Corporate $3M = **70,329** consolidated ✓ [matches FY25 10-K net sales].
- Segment EBIT: 1,225 + 521 + 465 + 118 = **2,329** reportable; − Corporate $796M = **1,533** total EBIT ✓ [matches MD&A reconciliation, p.37].
- D&A: segment total D&A 265 + 125 + 176 + 110 = **676** reportable; + Corporate $27M = **703** consolidated ✓ [matches CFS D&A $703M].
- **Unallocated bucket named, not hidden:** Corporate & Other carries $3M revenue, **−$796M EBIT** (a real, recurring negative more than half the size of total EBIT — pension settlement, Viterra integration costs, and the reclassified discontinued Sugar & Bioenergy results), and $2,625M assets [FY25 10-K, Note 26; MD&A lines 2355–2358; `business-model/03_segment-map.md` §1]. This bucket is **capitalized as a negative** in the equity bridge — it does not vanish.

**Not single-segment, but economically near-uniform.** The top segment (Soybean) is 52.6% of reportable EBIT — below the 85% single-segment threshold, and the #2/#3 segments are individually material (Softseed 22.4%, Grain 20.0%). So a four-segment SOTP is run. But the four segments are **economically near-identical**: all are thin-margin (EBIT margin 2.55%–4.63%) commodity oilseed/grain origination-processing-refining-merchandising businesses driven by the same crush-spread cycle; the company is "one low-margin agribusiness commodity-processing model expressed across four crop/value-chain slices, not four distinct economic engines" [`business-model/03_segment-map.md` §2]. **This is the structural reason SOTP adds little here — there is no high-multiple segment that a consolidated multiple could be masking (see §5).**

---

## 2. Segment Multiples & Comparables

Metric used = **EV/EBITDA** (the natural metric behind the one usable public comparable, ADM, and less distorted by the inflated FY2025 Corporate D&A than EV/EBIT). Multiples are a **band** (low/mid/high), not points, because no peer export exists and the comparable set is one public name. **Every multiple is low-confidence (no-peer-data cap).**

| Segment | Metric | Multiple band (low/mid/high) | Named comparable | Comparable's multiple | Source |
|---|---|---:|---|---:|---|
| Soybean Processing & Refining | EV/EBITDA | 6.5 / 8.0 / 9.5x | ADM (NYSE) — Ag Services & Oilseeds is the direct soybean-crush analogue | ADM consol 14.4x current / 10.33x 10-yr median | Web: gurufocus EV/EBITDA, ADM as of 2026-05-01 (indicative, unverified); BG own forward below |
| Softseed Processing & Refining | EV/EBITDA | 6.5 / 8.0 / 9.5x | ADM (NYSE) — oilseed crush/refining; same complex | as above | as above |
| Grain Merchandising & Milling | EV/EBITDA | 6.0 / 7.5 / 9.0x | Louis Dreyfus (private) — closest pure grain/oilseed merchandiser; ADM Ag Services | LDC FY25 EBITDA $1.83bn (no EV disclosed → multiple not derivable) | Web: ldc.com 2025 results, 2026-03-18 (indicative, unverified); `08_competitive-map.md` §2 |
| Other Oilseeds Processing & Refining | EV/EBITDA | 6.0 / 7.5 / 9.0x | ADM (NYSE) — refined/specialty oils analogue | as above | as above |

**Why these anchors, and why a discount to ADM's headline 14.4x:**
- **ADM is the only public ABCD peer with a traded multiple** and is named first as a key competitor in all four of Bunge's segments [FY25 10-K, Item 1, lines 307, 336, 382, 435]. Its current EV/EBITDA ~**14.4x** sits at a **10-year high** (10-yr median **10.33x**, min 6.02x) [Web: gurufocus, ADM, as of 2026-05-01 (indicative, unverified)]. Two reasons not to apply ADM's 14.4x to BG's segments: (a) ADM's blended multiple is inflated by its **Nutrition and Carbohydrate Solutions** segments (higher-multiple, non-commodity; FY25 segment OP ~$1.2bn Carbs + Nutrition) [Web: ADM FY25 results, retrieved 2026-06-01 (indicative, unverified)] which Bunge does not have — Bunge is **purer commodity processing**, which warrants a lower multiple; (b) 14.4x is a cyclical-high reading. The 10-yr median ~10.3x is the more cycle-normal ceiling for the complex.
- **BG's own forward multiples** (Capital IQ, data as of 2026-05-09) put a floor/anchor on the band: NTM **TEV/EBITDA 9.52x**, FY2026 **10.07x**, FY2027 **9.23x**; NTM **TEV/EBIT 12.55x**, FY2026 13.31x [`Multiples.xlsx`, Capital IQ, data as of 2026-05-09]. These embed the current (indicative) EV, so they are a market-implied reference, not an independent fair multiple — used only to bound the band.
- **Net band 6.0–9.5x EV/EBITDA**, centered ~7.5–8.0x: a discount to ADM's 10.3x median for Bunge's heavier pure-commodity mix (no Nutrition), higher leverage (ND/EBITDA ~4.5–6.1x vs the peer), and post-Viterra integration risk; the band low (6.0–6.5x) sits near ADM's historical trough and reflects the thin, volatile, capital-heavy economics of all four segments. Grain and Other Oilseeds are set ~0.5x below Soybean/Softseed: Grain is pure merchandising (lowest margin, freight-exposed, FY25 EBIT flattered by a $155M one-off corn-milling sale gain) and Other Oilseeds is thin and volatile (EBIT fell 45% in FY25, 35.5% of total capex on 6.6% of sales) [`business-model/03_segment-map.md` §1].

---

## 3. Segment Valuation

The metric is the swing factor, not the multiple. Two bases are shown per the cyclicality gate.

### SOTP-A — Trough basis: FY2025 reported segment EBITDA × EV/EBITDA (mid multiple)

| Segment | FY2025 EBITDA | Mid multiple | Segment EV |
|---|---:|---:|---:|
| Soybean Processing & Refining | 1,490 | 8.0x | 11,920 |
| Softseed Processing & Refining | 646 | 8.0x | 5,168 |
| Grain Merchandising & Milling | 641 | 7.5x | 4,808 |
| Other Oilseeds Processing & Refining | 228 | 7.5x | 1,710 |
| **Gross enterprise value (sum)** | **3,005** | — | **23,606** |

### SOTP-B — Normalized basis: FY2026-consensus segment EBITDA × EV/EBITDA (mid multiple)

Normalization: FY2026 **consensus consolidated EBITDA = $3,997M** (Capital IQ, 8 analysts, data as of 2026-05-09) [`earnings/04_guidance-consensus.md` §3]. Add back a normalized Corporate drag of ~$500M (FY25's −$769M EBITDA drag was inflated by Viterra integration and a pension settlement; management guides Corporate "in line" for FY26) → **normalized reportable EBITDA ≈ $4,497M**. Allocated to segments by FY2025 EBITDA weight (segments are economically identical and management guides no segment EBITDA; allocation labeled an **inference, not from filings**). Directional FY26 segment commentary (Soybean/Softseed higher, Grain and Tropical/specialty lower) keeps Soybean dominant [`earnings/04_guidance-consensus.md` §2].

| Segment | Normalized EBITDA (allocated) | Mid multiple | Segment EV |
|---|---:|---:|---:|
| Soybean Processing & Refining | 2,230 | 8.0x | 17,838 |
| Softseed Processing & Refining | 967 | 8.0x | 7,734 |
| Grain Merchandising & Milling | 959 | 7.5x | 7,194 |
| Other Oilseeds Processing & Refining | 341 | 7.5x | 2,559 |
| **Gross enterprise value (sum)** | **4,497** | — | **35,326** |

**Gross EV across the multiple band:**

| Basis | Gross EV — low mult | Gross EV — mid mult | Gross EV — high mult |
|---|---:|---:|---:|
| SOTP-A (trough FY25 EBITDA) | 19,098 | 23,606 | 28,113 |
| SOTP-B (normalized FY26 EBITDA) | 28,580 | 35,326 | 42,071 |

---

## 4. Equity Bridge

All bridge components from `01` verbatim (Gate 1 anchor consistency). The Corporate & Other drag is capitalized as a **negative EV** at the same EV/EBITDA multiple (7.5x); the bear case capitalizes the full reported drag, base/bull capitalize a normalized drag (stripping ~$250–370M of Viterra-integration/pension one-offs). Equity-method investments (+$1,276M) are **added back** because the affiliate earnings are largely excluded from segment EBITDA (income from affiliates is a separate Note 26 line, $26M consolidated) — consistent with `01`'s flag. NCI + redeemable NCI (−$1,432M) is subtracted.

### Bridge — SOTP-B (normalized, headline) — bear / base / bull

| Step | Bear | Base | Bull |
|---|---:|---:|---:|
| Gross enterprise value (sum of segments) | 28,580 (low mult) | 35,326 (mid mult) | 42,071 (high mult) |
| − Capitalized Corporate & Other drag | (4,125) [−550 × 7.5x] | (3,750) [−500 × 7.5x] | (3,000) [−400 × 7.5x] |
| = Net enterprise value | 24,455 | 31,576 | 39,071 |
| − Net debt | (13,714) | (13,714) | (13,714) |
| − Minority / redeemable NCI | (1,432) | (1,432) | (1,432) |
| + Equity-method investments | 1,276 | 1,276 | 1,276 |
| − Conglomerate / holdco discount | 0 | 0 | 0 |
| **= Equity value** | **10,585** | **17,706** | **25,201** |
| ÷ Diluted shares (195,733,665) | | | |
| **= SOTP value per share** | **$54** | **$90** | **$129** |
| vs current price ($123.35, indicative) | −56% | −27% | +4% |

### Bridge — SOTP-A (trough FY2025, cross-check) — bear / base / bull

| Step | Bear | Base | Bull |
|---|---:|---:|---:|
| Gross enterprise value | 19,098 (low) | 23,606 (mid) | 28,113 (high) |
| − Capitalized Corporate & Other drag | (5,768) [−769 × 7.5x] | (3,900) [−520 × 7.5x] | (3,000) [−400 × 7.5x] |
| = Net enterprise value | 13,330 | 19,706 | 25,113 |
| − Net debt | (13,714) | (13,714) | (13,714) |
| − Minority / redeemable NCI | (1,432) | (1,432) | (1,432) |
| + Equity-method investments | 1,276 | 1,276 | 1,276 |
| **= Equity value** | **(540)** | **5,836** | **11,243** |
| **= SOTP value per share** | **−$3** | **$30** | **$57** |
| vs current price ($123.35, indicative) | n.m. (negative) | −76% | −54% |

**Conglomerate / holding-company discount: NONE applied. Reason:** Bunge is an **operating** company, not a holding company [`01` business-type; MODULE_RULES business-type map]. A conglomerate discount is warranted when a market under-values a diversified group because a hidden high-quality segment is dragged down by a low-quality one — that is **not** the situation here. The four segments are economically uniform thin-margin commodity processors with no quality dispersion (§1, §5), so there is no cross-segment drag for a discount to correct, and no break-up optionality (the segments share origination, storage, freight and trading infrastructure — splitting them would destroy the integrated trading book, not release trapped value). Applying a discount would compound the trough-earnings problem already in the numbers. The single dilutive/drag item — the −$796M Corporate bucket — is handled explicitly as a capitalized negative in the bridge, which is the correct treatment, not a blanket discount.

**Bridge note — net debt dominates the equity outcome.** Gross EV of ~$28–42bn (normalized) is reduced to ~$11–25bn of equity almost entirely by the **$13.7bn net debt** (which alone consumes ~33–48% of gross EV) plus the capitalized Corporate drag. Net debt per share is **$70.06** [`01` §6] — i.e., the company carries roughly $70 of net debt for every share before any equity value accrues. This is why the SOTP equity value is so sensitive to both the multiple and the earnings basis: it is a thin equity slice on top of a large, freshly-elevated debt load.

---

## 5. SOTP Read

On a **normalized FY2026-consensus basis (SOTP-B) the break-up value is roughly $54 (bear) / $90 (base) / $129 (bull) per share**, putting the base ~27% below the indicative $123.35 price and only the bull case near the price; on a **trough FY2025 basis (SOTP-A) it is −$3 / $30 / $57**, far below price — and **the entire ~$60/share gap between the two answers is driven by the earnings denominator (trough vs normalized), not by any segment-multiple dispersion.** **Soybean Processing & Refining carries the value in every case** — ~50% of gross EV (~$17.8bn of ~$35bn at the normalized mid multiple), with Softseed (~22%) and Grain (~20%) the only other material slices; the dominant swing factor for the whole break-up is the soybean crush spread, exactly as for the consolidated entity. **The core SOTP insight is the opposite of the usual one: no segment is being masked by the consolidated multiple.** The four segments are economically near-identical thin-margin (2.5%–4.6% EBIT) commodity processors valued in a tight 6.0–9.5x EV/EBITDA band, so SOTP does not unlock hidden value — it **collapses toward the consolidated read**, and what actually governs Bunge's equity value is two consolidated-entity questions a single multiple already captures: (1) where mid-cycle crush/processing earnings normalize after the FY2025 trough, and (2) the $13.7bn of post-Viterra net debt ($70/share) that absorbs 60–70% of gross EV before equity holders are paid. SOTP's contribution here is to **confirm there is no break-up optionality and to quantify the leverage and trough-earnings drag** — not to find a mispriced segment.

**Low-confidence flag (no-peer-data cap):** every segment multiple is comparable-justified against a single public peer (ADM, at a 10-year-high blended multiple inflated by non-comparable Nutrition/Carbs) and BG's own price-embedded forward multiples — there is no peer export in the pool. Treat the per-share outputs as a wide value **range**, not a precise figure. The indicative, web-sourced price means no observed up/downside is asserted (per `01` no-price caps); the comparison to $123.35 is directional only.

**Out-of-scope note:** scenario probabilities, probability-weighting of the bear/base/bull, risk/reward, and any Buy/Sell call are **not** assigned here — they belong to `07_scenario-and-fair-value` and the master synthesizer, not to this module.
