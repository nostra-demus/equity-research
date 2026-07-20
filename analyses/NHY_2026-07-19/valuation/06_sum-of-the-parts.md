# Sum-of-the-Parts — NHY

Reporting standard: IFRS. Reporting currency: Norwegian krone (NOK). Fiscal year end: 31 December. Norsk Hydro is a genuinely multi-segment integrated aluminium producer — no segment exceeds the 85% single-segment threshold on either revenue or profit [`analyses/NHY_2026-07-19/business-model/03_segment-map.md`, §2] — so the full breakup is run rather than collapsed.

**Data-vendor flag (read before the numbers below).** Capital IQ's own "Key Stats" tab reports NHY's LTM EBITDA (through Mar-31-2026) at NOK 47,604m and FY2025 EBIT at NOK 41,218m — both roughly 1.6x–2.9x higher than the company's own filed figures (FY2025 group Adjusted EBITDA NOK 28,889m per the Alternative Performance Measures note; FY2025 reported EBIT NOK 14,401m per the income statement) [Norsk Hydro ASA OB NHY Financials.xls, Key Stats tab vs FY2025 Integrated Annual Report, Alternative Performance Measures p.232-233 and income statement]. This is a vendor/filing mismatch, not a real earnings difference — the CIQ revenue line (LTM NOK 201,266m) does independently reconcile to the sum of the company's own segment revenue [Q1 2026 report, Note 2, p.26], so only the EBITDA/EBIT vendor lines are affected. Per CLAUDE.md §4/§5 (filings beat vendor exports; cite the source the number actually came from), this SOTP builds every segment metric from Hydro's own segment note and quarterly disclosures, not from the CIQ Key Stats aggregate.

## 1. Segment Inventory

FY2025 (year ended 31 Dec 2025), NOK million, as reported in Note 1.4 "Operating and geographic segment information" and the Alternative Performance Measures note. Revenue is **external revenue** (the line that sums to consolidated revenue). Profit is **Adjusted EBITDA by segment** — management's own segment performance measure, used here (rather than reported EBIT) because reported EBIT is negative for two segments in FY2025 (Metal Markets, Extrusions) on one-off impairment/restructuring charges, which would make a multiple meaningless. "% of Total Adjusted EBITDA" denominator is **group Adjusted EBITDA, NOK 28,889m**, which already includes the "Other and Eliminations" bucket below — nothing is dropped, and the six rows sum to ~100%.

| Segment | Revenue (external) | Adj. EBITDA | Margin (Adj. EBITDA / total segment revenue, incl. internal) | % of Total Adj. EBITDA | Source |
|---|---:|---:|---:|---:|---|
| Hydro Bauxite & Alumina | 34,470 | 9,339 | 18.5% | 32.3% | FY2025 Integrated Annual Report, Note 1.4 p.149-151 / APM p.232-233 |
| Hydro Energy | 4,986 | 4,152 | 33.1% | 14.4% | Same |
| Hydro Aluminium Metal | 14,762 | 11,409 | 19.9% | 39.5% | Same |
| Hydro Metal Markets | 75,675 | 360 | 0.4% | 1.2% | Same |
| Hydro Extrusions | 78,062 | 3,479 | 4.4% | 12.0% | Same |
| Other and Eliminations (captive insurance + unallocated corporate) | 16 | 151 | n/a (revenue line is a large net elimination, not economically meaningful) | 0.5% | Same |
| **Total** | **207,971** | **28,889** | 13.9% (group) | **~100%** (28,889 of 28,889; rounds to 99.9% in filing-cited component sum) | — |

Reported (unadjusted) EBIT for context, same source: Bauxite & Alumina NOK 6,130m (12.1% margin), Energy NOK 3,617m, Aluminium Metal NOK 7,036m, Metal Markets **NOK -612m**, Extrusions **NOK -1,734m**, Other NOK -36m, group total NOK 14,401m. The two negative-EBIT segments are exactly why Adjusted EBITDA, not reported EBIT, is the SOTP metric.

**"Other and Eliminations" is not dropped.** It is small (0.5% of group Adjusted EBITDA) but it houses NOK 17,254m of assets (8.3% of the group's NOK 208,295m total assets) — mostly the captive insurance subsidiary, Industriforsikring — per `03_segment-map.md`, §3. It is carried through and separately valued in §3 below (Reconciliation Gate 3: no vanished bucket).

## 2. Segment Multiples & Comparables

Segment metric used throughout: **LTM Adjusted EBITDA** (12 months to 31-Mar-2026), computed as `FY2025 − Q1 2025 + Q1 2026` from the company's own disclosed segment Adjusted EBITDA [FY2025 Integrated Annual Report, APM p.232-233; Q1 2026 report, p.279/371/450/551/623 (segment "Adjusted EBITDA" lines) and Q1 2025 comparatives in the same tables]. This matches the **LTM basis** of the Capital IQ peer trading multiples (as-of 2026-07-18), so metric and multiple use the same window. See §3 for the LTM figures.

Peer multiples are LTM TEV/EBITDA from Hydro's own Capital IQ comparable-company set (drawn from Hydro's own named remuneration/TSR peer group where possible) [Company Comparable Analysis Norsk Hydro ASA.xls, Trading Multiples tab, as-of 2026-07-18]. No comparable exists in-pool for Hydro Energy (a captive hydropower generator) or a true metals-trading/distribution business, so those two rows use a named web-sourced peer, labeled unverified.

| Segment | Metric Used | Multiple Applied | Named Comparable | Comparable's Multiple | Source |
|---|---|---:|---|---:|---|
| Hydro Bauxite & Alumina | LTM Adj. EBITDA | 4.6x | Aluminum Corporation of China Ltd "Chalco" (SEHK:2600) — integrated bauxite mining, alumina refining, primary aluminium and captive power, the closest full-chain structural match among Hydro's own named peers | 4.6x LTM EV/EBITDA | CIQ Trading Multiples tab, as-of 2026-07-18 |
| Hydro Energy | LTM Adj. EBITDA | 7.5x | VERBUND AG (WBAG:VER, Austria) — ~90%+ hydropower generator, the closest available pure-play hydro peer (not in Hydro's own named comp set; no power pure-play exists there) | ~7.5x EV/EBITDA (7.5x–7.6x across two aggregator reads) | Web: stockanalysis.com, VERBUND AG (VIE:VER) Statistics & Valuation Metrics, accessed 2026-07-19 (unverified, undated as-of within the page) |
| Hydro Aluminium Metal | LTM Adj. EBITDA | 8.1x | United Company RUSAL (SEHK:486) — overwhelmingly upstream bauxite-alumina-primary-metal, minimal downstream, the closest match to a smelting/casting-only segment | 8.1x LTM EV/EBITDA | CIQ Trading Multiples tab, as-of 2026-07-18 |
| Hydro Metal Markets | LTM Adj. EBITDA | 3.3x | ProfilGruppen AB (OM:PROF B) — the lowest-multiple named aluminium peer in Hydro's own comp set; used as an imperfect proxy for a low-margin, high-volume metal-sales/trading/recycling business because no true metals-distribution pure-play exists in the pool or in Hydro's own named peer group | 3.3x LTM EV/EBITDA | CIQ Trading Multiples tab, as-of 2026-07-18 |
| Hydro Extrusions | LTM Adj. EBITDA | 6.0x | Constellium SE (NYSE:CSTM) — European/North American aluminium extruder, closest scale, geography and end-market match (both exposed to the 2024-2026 European/NA construction and auto downturn) | 6.0x LTM EV/EBITDA | CIQ Trading Multiples tab, as-of 2026-07-18 |
| Other and Eliminations | LTM Adj. EBITDA | 3.9x | Norsk Hydro's own consolidated LTM EV/EBITDA — used as a conservative default because no comparable exists for a captive-insurance-plus-corporate-eliminations bucket | 3.9x LTM EV/EBITDA (NHY consolidated) | CIQ Trading Multiples tab, as-of 2026-07-18 |

**Cross-check comparables used only for the dispersion band in §3** (not the base case): Hindalco Industries (BSE:500440), 7.9x LTM EV/EBITDA, named in Hydro's own TSR peer group — close to RUSAL's 8.1x, so Aluminium Metal's range is tight (7.9x–8.1x). Grupa Kety S.A. (WSE:KTY), 13.1x, and ProfilGruppen, 3.3x — both named in Hydro's own TSR peer group — bracket Extrusions' 6.0x base case widely (extrusion peer multiples span 3.3x–13.1x, the widest spread in the set). Fortum Oyj (HEL:FORTUM), ~11.5x EV/EBITDA [Web: alphaspread.com, accessed 2026-07-19, unverified] is a diversified Nordic generator (hydro + nuclear + other) — a weaker pure-play match than Verbund, shown only as a directional cross-check for Energy, not used in the range.

## 3. Segment Valuation

LTM Adjusted EBITDA by segment (12 months to 31-Mar-2026) = FY2025 − Q1 2025 + Q1 2026, all figures from the company's own segment Adjusted EBITDA disclosures cited in §2:

| Segment | LTM Adj. EBITDA (NOK mm) | Multiple | Segment EV (NOK mm) |
|---|---:|---:|---:|
| Hydro Bauxite & Alumina | 4,951 (9,339 − 5,135 + 747) | 4.6x | 22,775 |
| Hydro Energy | 3,759 (4,152 − 1,180 + 787) | 7.5x | 28,193 |
| Hydro Aluminium Metal | 13,897 (11,409 − 2,546 + 5,034) | 8.1x | 112,566 |
| Hydro Metal Markets | 915 (360 − (−14) + 541) | 3.3x | 3,020 |
| Hydro Extrusions | 3,604 (3,479 − 1,174 + 1,299) | 6.0x | 21,624 |
| Other and Eliminations | 916 (151 − (−505) + 260) | 3.9x | 3,572 |
| **Gross enterprise value (sum)** | **28,042** (ties to Hydro's own disclosed group LTM Adjusted EBITDA of NOK 28,041m: FY2025 28,889 − Q1 2025 9,516 + Q1 2026 8,668) | — | **191,750** |

**Dispersion band (named-comparable range, not a fabricated stretch).** Only two segments have a genuine multi-comparable spread in the named peer set: Bauxite & Alumina (Chalco 4.6x vs RUSAL 8.1x) and Extrusions (ProfilGruppen 3.3x vs Grupa Kety 13.1x). Flexing those two segments to their peer-set extremes while holding the rest at base:
- **Low gross EV** ≈ NOK 179,238m (Extrusions at ProfilGruppen 3.3x, Aluminium Metal at the lower cross-check Hindalco 7.9x)
- **Base gross EV** ≈ NOK 191,750m (table above)
- **High gross EV** ≈ NOK 234,665m (Bauxite & Alumina at RUSAL 8.1x, Extrusions at Grupa Kety 13.1x)

Metal Markets, Energy and Other are held fixed across the band — each has only one usable named comparable, so there is no evidence-based way to flex them without fabricating a second peer (banned under this module's rules).

## 4. Equity Bridge

Net debt and minority interest are taken **verbatim** from `01_price-and-capital-structure.md` (Reconciliation Gate 1) — the cash-quality-adjusted, canonical figures, not the CIQ headline.

| Step | Value (NOK mm) |
|---|---:|
| Gross enterprise value (base case, §3) | 191,750 |
| − Capitalized unallocated corporate costs | 0 — the "Other and Eliminations" bucket is already valued and included inside the NOK 191,750m gross EV above (NOK 3,572m of it); it is not a separate drag to subtract again (that would double-count) |
| − Net debt (cash-quality adjusted, canonical per `01`) | (17,919) |
| − Minority / preferred | (7,495) minority; NOK 0 preferred (none outstanding) |
| + Equity-method investments | 0 — Qatalum's equity-accounted profit share (NOK 336m Q1 2026 / NOK 1,067m FY2025) is already embedded inside Hydro Aluminium Metal's reported Adjusted EBITDA used in §3, consistent with `01`'s own treatment of leaving equity-method investments inside segment economics rather than carving them out separately |
| − Conglomerate / holdco discount | 0 — Hydro is a single operating company with five internally-run divisions, not a legal holding company with separately listed subsidiaries; there is no structural minority-squeeze or trapped-cash-at-the-sub issue to discount for, and the base-case SOTP gross EV (NOK 191,750m) already sits within 0.3% of `01`'s own consolidated, cash-quality-adjusted EV (NOK 192,384m) — adding a discount on top would double-count against a gap that is not there |
| **= Equity value (base case)** | **166,335** |
| ÷ Diluted shares (per `01`) | 1,965.28 million |
| **= SOTP value per share (base case)** | **NOK 84.63** |
| vs current price (NOK 84.96, 2026-07-17, per `01`) | **-0.4%** (SOTP base case sits essentially at the current price) |

Applying the same bridge (− NOK 17,919m net debt, − NOK 7,495m minority) to the low and high gross-EV cases from §3:
- **Low SOTP/share** ≈ NOK 78.27 (low gross EV NOK 179,238m → equity NOK 153,824m ÷ 1,965.28m shares)
- **High SOTP/share** ≈ NOK 106.47 (high gross EV NOK 234,665m → equity NOK 209,251m ÷ 1,965.28m shares)

This is a base-case point (NOK 84.63/share) with the named-comparable dispersion shown separately (NOK 78.27–106.47), not a false-precision single number.

## 5. SOTP Read

The base-case breakup value, NOK 84.63/share, sits within 0.4% of the current price (NOK 84.96, 2026-07-17) — the market is already pricing Norsk Hydro almost exactly at the sum of its five segments valued on named aluminium-sector peer multiples, so there is no proven variant perception here of a segment being hidden by the consolidated multiple. Hydro Aluminium Metal (primary smelting) carries the value: at 8.1x its NOK 13,897m LTM Adjusted EBITDA it is worth NOK 112,566m — 58.7% of the NOK 191,750m gross enterprise value — despite generating only 7.1% of group external revenue, the classic upstream-margin pattern already flagged in `03_segment-map.md`. Hydro Metal Markets (36.4% of revenue) and Hydro Extrusions (37.5% of revenue, currently loss-making on reported EBIT) together produce 73.9% of revenue but only NOK 24,644m — 12.9% — of gross EV; a buyer paying for "the biggest two lines on the income statement" without adjusting for segment mix would be paying for volume, not profit. The widest source of disagreement in this SOTP is Extrusions' peer multiple (3.3x–13.1x across three named, equally-credible European extrusion peers), which alone swings the per-share value by roughly NOK 9 in either direction — a genuine cross-method uncertainty, not a rounding error, and one that will matter more if Extrusions' current restructuring (five European plants proposed for closure) either succeeds or fails to restore positive reported EBIT.

