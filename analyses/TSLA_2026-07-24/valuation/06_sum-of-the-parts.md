# Sum-of-the-Parts — TSLA

**Reporting standard:** US GAAP. **Reporting currency:** US Dollar (USD), figures in millions except per-share items. **Jurisdiction:** US SEC domestic filer — standard US form names apply [`01_price-and-capital-structure.md` §Header; `FY26 Q2 10-Q, Jul-23-2026, cover page`].

Tesla reports exactly two ASC 280 reportable segments — Automotive, and Energy Generation and Storage [`business-model/03_segment-map.md` §1, citing `FY26 Q2 10-Q, Note 14`]. On a revenue basis Automotive is close to the single-segment 85% threshold (86.5% of FY2025 revenue), but on the only profit split Tesla discloses — **segment gross profit** (Tesla allocates revenue, cost of revenue, and gross profit to segments; it does **not** allocate SG&A, R&D, operating income, or net income to either segment [`business-model/03_segment-map.md` §1 Note 1, §3]) — Automotive is 77.7% of FY2025 gross profit, **below** the 85% collapse threshold, and Energy's gross-profit share has nearly tripled in three years (6.5% → 15.1% → 22.2%, FY2023–FY2025) [`business-model/03_segment-map.md` §2]. This is therefore run as a genuine two-segment SOTP, not collapsed.

**Hard limitation carried through this whole report:** Tesla's own shareholder letters put heavy narrative weight on Robotaxi, Optimus (humanoid robot), Cybercab, and in-house AI-inference chips, but none of these carries any segment or revenue-line disclosure at all — "whatever capital and operating expense they consume is invisible inside the Automotive segment's numbers" [`business-model/03_segment-map.md` §3]. There is no third reportable segment to value. This SOTP can therefore only price the two disclosed segments; any value the market assigns to Robotaxi/Optimus/FSD software/AI chips sits entirely outside it — see §5.

## 1. Segment Inventory

Currency: USD millions. Fiscal year ended Dec-31. **"% of Total EBIT" cannot be computed** — Tesla discloses no segment-level operating income or EBIT (see limitation above). The denominator used below is **% of total reportable-segment gross profit** (Automotive gross profit + Energy gross profit = 100% of disclosed segment gross profit; there is no unallocated/"Other" bucket at the gross-profit line — segment revenue and gross profit sum exactly to consolidated totals in both FY2025A and Q2 FY26 [`business-model/03_segment-map.md` §3]).

| Segment | Revenue (FY2025A) | Gross Profit (FY2025A) | Gross Margin | % of Total Gross Profit | Source |
|---|---:|---:|---:|---:|---|
| Automotive (incl. Services-and-other sub-line) | $82,056mm | $13,292mm | 16.2% | 77.7% | `CIQ Financials_Annual export, Segments tab, FY2025`; `FY26 Q2 10-Q, Note 14` |
| Energy Generation and Storage | $12,771mm | $3,802mm | 29.8% | 22.2% | Same |
| **Total (reportable segments)** | **$94,827mm** | **$17,094mm** | **18.0%** | **100%** | Ties exactly to consolidated FY2025 revenue and gross profit |
| *Memo: unallocated SG&A + R&D (not segment-attributed)* | *n/a* | *($12,739mm)* | — | — | FY2025 Gross Profit $17,094mm − Operating Income $4,355mm = $12,739mm [`earnings/01_historical-financials.md` §1] — this cost sits below the segment note entirely; see §4 for how it is treated |
| *Memo: Robotaxi / Optimus / FSD software / AI chips* | *not disclosed* | *not disclosed* | — | — | No segment or revenue line exists [`business-model/03_segment-map.md` §1, §3] — excluded from this SOTP, see §5 |

No segment collapse: Automotive at 77.7% of disclosed gross profit is below the 85% threshold, and the trend (Energy's gross-profit share nearly tripling since FY2023) argues against treating this as an automotive-only story.

## 2. Segment Multiples & Comparables

**Forward basis:** FY+1 = FY2026E (calendar fiscal year). Tesla gives no segment-level guidance or consensus, so the FY2026E consolidated consensus revenue of $105,415mm (44–46 analysts) [`earnings/04_guidance-consensus.md` §1, §3, citing `EstimatesReport.xls, Consensus tab`] is split between segments using each segment's FY2025A revenue share (Automotive 86.53%, Energy 13.47%) — **Inference, not from filings**, since no segment-level consensus exists. This gives Automotive FY2026E revenue ≈ $91,218mm and Energy FY2026E revenue ≈ $14,197mm. **Sensitivity check:** using the most recent quarter's actual segment mix instead (Q2 FY26: Automotive 88.9% / Energy 11.1% [`business-model/03_segment-map.md` §1]) gives Automotive ≈ $93,696mm / Energy ≈ $11,719mm — a modestly higher Automotive weight, reflecting Energy's lumpy quarter-to-quarter deployment timing. The base case below uses the FY2025A full-year share as the more representative annual split.

| Segment | Metric Used | Multiple Applied (low/base/high) | Named Comparable | Comparable's Multiple | Source |
|---|---|---:|---|---:|---|
| Automotive | FY2026E segment revenue ($91,218mm) | 0.9x / 1.2x / 1.8x | Ford Motor Co. (NYSE:F); General Motors Co. (NYSE:GM) — primary; Rivian (NasdaqGS:RIVN), Lucid (NasdaqGS:LCID) — high-end reference only | Ford NTM TEV/Revenue 1.1x; GM NTM TEV/Revenue 0.93x; Rivian 2.86x; Lucid 3.03x | `Company Comparable Analysis Tesla Inc .xls, Trading Multiples tab, as-of 2026-07-24` |
| Energy Generation and Storage | FY2026E segment revenue ($14,197mm) | 1.5x / 2.5x / 3.5x | Fluence Energy, Inc. (NasdaqGS:FLNC) | ~1.03x EV/Sales (trailing and forward, roughly flat) | `Web: stockanalysis.com/stocks/flnc/statistics, 2026-07-24 (indicative, unverified)`; cross-checked against `Web: multiples.vc/public-comps/fluence-energy-valuation-multiples, 2026-07-24 (indicative, unverified)`, which shows LTM EV/Revenue 0.6x and last-FY 0.8x — the two web sources disagree on Fluence's exact market cap ($1.9–3.66bn across sources found), so this multiple is treated as directional, not precise |

**Why each comparable fits (business economics, not label):**
- **Ford / GM (primary Automotive comps):** both are scaled, capital-intensive vehicle manufacturers that are profitable at the operating line but on thin margins — Ford's LTM EBIT margin is 0.8% and GM's is 5.5% [`Company Comparable Analysis Tesla Inc .xls, Financial Data tab`], bracketing Tesla's own LTM Automotive-driving consolidated EBIT margin of 4.1% ($4,278mm / $103,619mm). Tesla's structurally higher gross margin (16.2% vs Ford 7.1% / GM 10.2% LTM) argues for a multiple above Ford/GM's own ~1.0x NTM EV/Revenue, but the bottom-line (EBIT-margin) evidence — Tesla currently sits *below* GM's EBIT margin — argues against a large premium. Base case 1.2x reflects a modest premium over the ~1.0x legacy-OEM anchor.
- **Rivian / Lucid (high-end reference only):** true pure-play battery-electric manufacturers, the closest product match to Tesla's Automotive segment, but both are loss-making and a fraction of Tesla's scale (LTM revenue $5.5bn and $1.4bn vs Tesla Automotive's ~$82bn) — their 2.9–3.0x NTM multiples price speculative future volume, not realized profitability, so they are used only to bound the high case, not as the primary match.
- **Fluence Energy (Energy comp):** an asset-light designer, manufacturer, and deployer of grid-scale battery energy storage systems — the closest available economic match to Tesla's Megapack-led Energy segment (same activity: design, build, and deploy utility-scale storage hardware), not a generic "clean energy" or residential-solar name. Fluence's own profitability (2% LTM EBITDA margin, near breakeven) is materially weaker than Tesla Energy's disclosed 29.8% FY2025 GAAP gross margin (management's own long-term normalization view is "mid- to low-20% range" gross margin [`earnings/04_guidance-consensus.md` §2]), so a premium to Fluence's ~1.0x multiple is applied rather than using it unadjusted.

**Trailing sanity check only (not fed to `07` as a weighted method):** applying the same base multiples (1.2x / 2.5x) to FY2025A actual segment revenue instead of the FY2026E forward estimate gives a gross EV of $130,395mm and an equity value of ~$37.67/share — close to, and slightly below, the forward-basis base case, consistent with the segments' modest forward growth.

## 3. Segment Valuation

Currency: USD millions.

| Segment | Metric Value (FY2026E) | Multiple (low/base/high) | Segment EV (low/base/high) |
|---|---:|---:|---:|
| Automotive | $91,218 | 0.9x / 1.2x / 1.8x | $82,096 / $109,462 / $164,192 |
| Energy Generation and Storage | $14,197 | 1.5x / 2.5x / 3.5x | $21,295 / $35,492 / $49,689 |
| **Gross enterprise value (sum)** | **$105,415** | *(blended base 1.38x)* | **$103,392 / $144,954 / $213,882** |

For context: Tesla's own consolidated NTM TEV/Forward Total Revenue is **11.15x** and LTM is **11.9x** [`Company Comparable Analysis Tesla Inc .xls, Trading Multiples tab`] — roughly **8x** the ~1.38x blended multiple this SOTP applies using named automotive and energy-storage peers. That gap is the central finding of this report (see §5).

## 4. Equity Bridge

All figures use `01_price-and-capital-structure.md`'s canonical anchors (Reconciliation Gate 1): the **broad** net-debt basis (nets short-term investments as well as cash & equivalents), which `01` itself designates canonical for its EV bridge, backed by its cash-quality check that Tesla's $28.3bn of short-term investments is genuine, largely unrestricted, investment-grade paper (only 0.66% restricted) [`01_price-and-capital-structure.md` §4, §5]. The strict basis ($861mm of net debt) is shown alongside per CLAUDE.md §15 hygiene.

**Net-cash sign discipline:** Tesla is net cash on the broad basis (net debt is a *negative* $27,444mm), so it is added back **once**, as a single positive line — not shown as a separate "net debt" deduction and a separate "net cash" add-back.

**Unallocated corporate costs (Gate 3 — no vanished bucket):** Tesla's FY2025 SG&A + R&D (below the segment gross-profit line, not attributed to either segment) was $12,739mm [`earnings/01_historical-financials.md` §1: Gross Profit $17,094mm − EBIT $4,355mm]. This SOTP does **not** add a separate capitalized-cost deduction for it, because the metric used — **EV/Sales**, not EV/Gross-Profit or EV/EBITDA — is a fully-loaded multiple: each named comparable's own EV/Revenue multiple already reflects that company's complete P&L, SG&A and R&D included. The multiple premium chosen for each Tesla segment (e.g., 1.2x vs Ford/GM's ~1.0x) is explicitly sized off Tesla's own bottom-line EBIT-margin evidence (§2), not off gross margin alone — so the corporate-cost drag is netted through the multiple choice, not dropped by assertion. This satisfies Reconciliation Gate 3 via the "metric already nets the corporate drag" path.

**Equity-method / strategic investments:** Tesla's ~$3,007mm SpaceX equity stake (booked as a long-term investment, sales-restricted until Dec-2026, explicitly **not** netted into `01`'s EV bridge) [`01_price-and-capital-structure.md` §4] is added back here as a non-operating financial asset, since it is not part of either reportable segment's operating economics. Tesla's ~$674mm Bitcoin/digital-assets holding is a further non-operating asset but is <0.3% of gross EV in every scenario and is not added separately (immaterial, consistent with `01`'s own 0.66%-restricted-cash materiality treatment).

| Step | Value ($mm) |
|---|---:|
| Gross enterprise value (base case) | 144,954 |
| − Capitalized unallocated corporate costs | $0 — already netted in the EV/Sales metric (see note above) |
| + Net cash (broad basis; net debt shown as negative, added back once) | +27,444 |
| − Minority interest | (661) |
| + Preferred | 0 |
| + Equity-method / strategic investments (SpaceX stake) | +3,007 |
| − Conglomerate / holdco discount | 0 — none applied (see note below) |
| **= Equity value (base case)** | **174,744** |
| ÷ Diluted shares (per-share fair-value count, approx. fully diluted — `01`'s TSM-proxy, Inference) | 4,252.5mm |
| **= SOTP value per share (base case)** | **$41.09** |
| Range (low–high, from segment multiple dispersion) | $31.32 (low) – $57.30 (high) |
| vs current price ($319.69, 2026-07-23, pool-verified [`01_price-and-capital-structure.md` §1]) | **−87.1%** (base case sits at ~13% of current price) |

**Conglomerate / holding-company discount: none applied.** Automotive and Energy are not separately governed or separately financed businesses — they share Gigafactories, one balance sheet, one board, one R&D and battery-manufacturing base, and no separate reporting/listing structure [`business-model/03_segment-map.md` §1, §3]. There is no structural holding-company complexity (cross-shareholdings, minority-listed subsidiaries, capital-allocation friction between the parts) to discount for; the discipline problem here is the opposite of a holdco discount — see §5.

## 5. SOTP Read

Valuing Tesla's two *disclosed* reportable segments on named, economically-matched forward multiples produces a base-case value of about **$41 per share** (range $31–$57 across the segment-multiple dispersion) against a current price of **$319.69** — the segment-based sum-of-the-parts explains roughly **13% of Tesla's current share price**, not the near-100% a healthy SOTP read would typically reconcile to. Automotive carries most of the segment-level value in absolute dollar terms (about 76% of the base-case gross EV), but Energy earns the richer multiple (2.5x vs 1.2x base) because its gross margin (29.8% FY2025A) and profit-share trend (nearly tripling since FY2023) are structurally healthier than Automotive's — Energy is the smaller segment but the higher-quality one on the data disclosed.

The blunt finding: this SOTP is not "hiding value behind a low multiple" in the usual sense — it is the reverse. Tesla's own consolidated NTM EV/Revenue (11.15x) sits at roughly **8 times** the blended multiple (~1.4x) that named, real-world automotive and battery-storage peers command for businesses with Automotive's and Energy's actual disclosed economics. Nearly nine-tenths of Tesla's enterprise value is therefore **not explained by the Automotive or Energy segment as filed** — it rests on Robotaxi, Optimus, FSD software, and AI-inference-chip ambitions that carry **zero segment or revenue-line disclosure** [`business-model/03_segment-map.md` §3] and cannot be priced by this method at all. Whether that ~$1.1 trillion of un-modeled value is justified is a question for the DCF (`04`), reverse-DCF (`05`), and scenario/fair-value (`07`) modules to take up explicitly — this module can only flag that the gap exists and is almost entirely attributable to businesses Tesla does not yet report.
