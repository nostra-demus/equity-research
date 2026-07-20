# Multiples — Own History — NHY

Reporting currency: **Norwegian krone (NOK)**, all figures in NOK million except per-share items, matching `01_price-and-capital-structure.md`. Business type: integrated commodity (aluminium/energy) operating company [`analyses/NHY_2026-07-19/valuation/00_valuation-data-triage.md`]. Per the Business-Type Method Map, EV-based multiples (EV/EBITDA, EV/EBIT, EV/Sales) plus P/E and FCF yield are the primary read for a commodity/cyclical name; P/B and dividend yield are shown as supplementary context, not primary.

**Anchors used (verbatim from `01_price-and-capital-structure.md`):** price NOK 84.96 (2026-07-17, pool-verified last close); shares 1,965.28 million; market cap NOK 166,970 million; EV NOK 192,384 million (cash-quality-adjusted, canonical — headline/vendor EV NOK 187,555 million); net debt NOK 17,919 million (cash-quality-adjusted, canonical); minority interest NOK 7,495 million.

**Critical data-quality flag carried into this report (read before the tables).** `earnings/01_historical-financials.md` documented that Capital IQ's own EBITDA/EBIT fields in the `Norsk Hydro ASA OB NHY Financials.xls` Income Statement/Key Stats tabs do **not** reconcile to the company's own audited EBITDA/EBIT (e.g. FY2025: CIQ EBITDA 51,454 vs company-reported/audited EBITDA 25,696 — CIQ's figure is roughly double; FY2025 CIQ EBIT 41,218 vs audited EBIT 14,401 — nearly triple). That earnings-module finding traced the gap to a CIQ income-statement reclassification mismatch specific to Hydro's IFRS "nature of expense" format, not a real economic item. Revenue, diluted EPS, CFO, and capex reconcile cleanly between CIQ and the audited filings; EBITDA and EBIT sourced from the same `Financials.xls` workbook do not. This means: (a) `01_price-and-capital-structure.md`'s own "LTM EBITDA = NOK 47,604mm" (used there for its leverage snapshot, sourced to the same CIQ Key Stats field) is on the same unreconciled CIQ basis, not the audited basis — flagged here as a cross-module divergence, not silently overridden; (b) every EV/EBITDA and EV/EBIT multiple pulled directly from the CIQ Multiples/Key Stats tabs (both the "current" column and the historical time series) sits on this unreconciled vendor basis; (c) this report computes a second, audited-basis EV/EBITDA and EV/EBIT using `earnings/01`'s company-reported figures, and keeps the two bases clearly separated throughout — they are never averaged or substituted for one another.

## 1. Current Multiples

| Multiple | Basis (LTM / NTM / FY) | Metric Value | Current Multiple | Source |
|---|---|---:|---:|---|
| P / E (reported EPS) | LTM (through 31-Mar-2026) | EPS NOK 3.11 (diluted, reported) | **27.32x** | `earnings/01_historical-financials.md` §2 (TTM EPS 3.11, reconciled to CIQ); price/shares from `01` |
| P / E (reported EPS) | NTM (FY2026E consensus) | EPS NOK 8.80 | **9.65x** (CIQ's own NTM close: 9.14x, see note¹) | `earnings/04_guidance-consensus.md` (consensus as of 2026-07-15); CIQ Estimates Report Multiples tab, NTM column: 9.14x |
| P / E (reported EPS) | FY2026E | EPS NOK 8.80 | **9.65x** | CIQ Estimates Report Multiples tab, FY2026 column |
| EV / EBITDA — **CIQ vendor basis (unreconciled, see flag above)** | LTM | CIQ "EBITDA" NOK 47,604mm | **3.92x** (CIQ close, headline-EV basis; 4.04x on this report's canonical EV) | Capital IQ Multiples tab, `Financials.xls`, close value 2026-07-17 |
| EV / EBITDA — **audited / company-reported basis** | LTM | EBITDA NOK 21,976mm | **8.76x** | `earnings/01_historical-financials.md` §2 (TTM EBITDA, company-reported); EV from `01` |
| EV / EBITDA — CIQ vendor basis | NTM | CIQ NTM EBITDA (consensus) | **5.13x** | CIQ Estimates Report Multiples tab, NTM column |
| EV / EBITDA — CIQ vendor basis | FY2026E | CIQ FY2026E EBITDA NOK 36,330mm | **5.16x** | CIQ Estimates Report Multiples tab, FY2026 column |
| EV / EBIT — **CIQ vendor basis (unreconciled)** | LTM | CIQ "EBIT" NOK 37,290mm | **5.00x** (CIQ close, headline-EV basis; 5.16x on canonical EV) | Capital IQ Multiples tab, close value 2026-07-17 |
| EV / EBIT — **audited / company-reported basis** | LTM | EBIT NOK 10,781mm | **17.84x** | `earnings/01_historical-financials.md` §2; EV from `01` |
| EV / EBIT — CIQ vendor basis | FY2026E | CIQ FY2026E EBIT | **7.29x** | CIQ Estimates Report Multiples tab, FY2026 column |
| EV / Sales | LTM (Revenue reconciles cleanly) | Revenue NOK 201,266mm | **0.93x** (CIQ close, headline-EV basis; 0.96x on canonical EV) | Capital IQ Multiples tab, close 2026-07-17; revenue cross-checked in `earnings/01` |
| EV / Sales | FY2026E | Revenue NOK 213,366mm (consensus) | **0.88x** | CIQ Estimates Report Multiples tab, FY2026 column |
| P / Book | LTM | Book value/share NOK 52.17 | **1.63x** | `01_price-and-capital-structure.md` §6; price from `01` |
| P / Tangible Book | LTM | Tangible BV/share NOK 48.45 | **1.75x** | `01_price-and-capital-structure.md` §6 |
| P / FCF (module-standard, CFO − capex) | LTM (through 31-Mar-2026) | FCF NOK 5,810mm → NOK 2.96/sh | **28.74x** (FCF yield 3.48%) | `earnings/01_historical-financials.md` §2 |
| P / FCF, for comparison | FY2025 (full year) | FCF NOK 11,729mm → NOK 5.97/sh | **14.24x** (FCF yield 7.03%) | `earnings/01_historical-financials.md` §1 |
| Dividend yield | LTM (current) | — | **3.5%** | Capital IQ Public Company Capsule, `NorskHydroASAOBNHY_PublicCompany.pdf`, as of 2026-07-18 |

¹ The 9.65x figure uses `earnings/04`'s consensus EPS snapshot (as of 2026-07-15, NOK 8.80). CIQ's own Multiples-tab NTM P/E close on 2026-07-17 is 9.14x (implied NTM EPS ≈ NOK 9.29) — a ~5.6% gap most likely reflecting a slightly different consensus pull-date between the two CIQ exports in the pool, not a basis error. Both are shown; the historical-band percentile work in Section 2 uses the CIQ Multiples-tab series consistently (9.14x) so the current point and the band are drawn from the same source.

**Reported vs adjusted, stated once:** all P/E figures above use reported (non-APM) diluted EPS. The company's own "Adjusted EPS" APM (which excludes unrealized LME/power-derivative mark-to-market swings) was NOK 5.02 for FY2025 versus reported NOK 3.41 [`earnings/01_historical-financials.md` §4] — a materially different number. This report does not use the Adjusted-EPS APM for its P/E multiples because no adjusted-EPS time series exists in the CIQ Multiples tab to build a comparable historical band; flagged as a limitation, not a substitution.

## 2. Historical Multiple Bands

**This is not a 3–5 year band.** The only multi-period multiple time series in the data pool is Capital IQ's quarterly Multiples tab, which covers six data points from 2025-06-30 to 2026-07-17 — **about 13 months**, well under the 3-year threshold in the partial-data rule. No longer multiple history (5-year Capital IQ multiples export, annual multiples commentary in the annual report/investor deck) exists anywhere in the pool. Per the partial-data rule for a short own-history: the table below is shown for a **directional "where in its short range it sits" read only** — the mean/median are not treated as a fair-value reversion target (Section 4 is illustrative-only, not a `07` input).

Quarter-end close values, `Norsk Hydro ASA OB NHY Financials.xls`, Multiples tab (Jun-25, Sep-25, Dec-25, Mar-26, Jun-26, Jul-17-26):

| Multiple | Min | Mean | Median | Max | Current | Percentile of (13-month) Range |
|---|---:|---:|---:|---:|---:|---:|
| EV / Sales (LTM) | 0.64x | 0.86x | 0.87x | 1.06x | 0.93x | ~69th |
| EV / EBITDA (LTM, **CIQ vendor basis**) | 2.39x | 3.41x | 3.47x | 4.29x | 3.92x | ~81st |
| EV / EBIT (LTM, **CIQ vendor basis**) | 2.91x | 4.24x | 4.34x | 5.35x | 5.00x | ~86th |
| P / E (LTM, reported EPS) | 11.83x | 21.02x | 20.69x | 30.06x | 27.32x | ~85th |
| P / Book | 1.11x | 1.55x | 1.57x | 2.02x | 1.63x | ~57th |
| P / E (NTM, consensus EPS) | 8.20x | 10.73x | 10.40x | 14.71x | 9.14x | ~15th |
| EV / EBITDA (NTM, **CIQ vendor basis**) | 4.84x | 5.54x | 5.26x | 6.98x | 5.13x | ~13th |

No historical band could be built for EV/EBITDA or EV/EBIT on the **audited basis** (the 8.76x / 17.84x current figures in Section 1): the pool's company-reported quarterly EBITDA/EBIT series is incomplete (only Q1'25, Q4'25, and Q1'26 are individually disclosed — Q2'25 and Q3'25 are not in the pool, per `earnings/01_historical-financials.md` §3), so a quarterly audited-basis EV/EBITDA time series cannot be constructed. This is a genuine data gap, not an estimate. No historical band was built for P/FCF or dividend yield either — CIQ's own "Levered FCF" field shows the same reclassification-scale symptom as EBITDA/EBIT (its implied FY2025 levered FCF of ~NOK 25,800mm does not match either the module-standard FCF of NOK 11,729mm or the company's own FCF APM of NOK 13,034mm), so that series is not trusted for a P/FCF band, and no dividend-yield time series exists in the pool.

## 3. Re-Rating / De-Rating Read

The three most reliable multiples here are **P/E (LTM and NTM)**, because diluted EPS reconciles cleanly to the audited filings, and **EV/Sales**, because revenue also reconciles cleanly — EV/EBITDA and EV/EBIT on the CIQ vendor basis are directionally usable (the company/CIQ EBITDA ratio has stayed roughly stable at ~0.48–0.51x across FY2023–FY2025, so the *trend* is probably informative even though the *level* is not) but are not used for the headline read below.

The stock has re-rated up sharply on a trailing basis and re-rated down on a forward basis over the same 13 months, and the two moves have the same cause. LTM P/E sits at the 85th percentile of its own 13-month range, a +30% premium to its own mean (21.02x) and +32% to its own median (20.69x) [(27.32−21.02)/21.02 = +30.0%; (27.32−20.69)/20.69 = +32.1%]. But NTM P/E sits at only the 15th percentile of the same window, a −15% discount to its own mean and −12% to its own median [(9.14−10.73)/10.73 = −14.8%; (9.14−10.40)/10.40 = −12.1%]. EV/Sales (LTM), the cleanest EV-based read, sits mid-to-high in its range at the 69th percentile, +8.4% above its own mean and +6.6% above its own median — a real but far more modest re-rating than the P/E read suggests.

The trailing "re-rating" is mostly a denominator effect from a cyclical earnings trough, not a re-pricing of the business. LTM EPS (NOK 3.11) is depressed by a near-loss Q4 2025 (EPS NOK −1.20 on a large unrealized LME-derivative timing loss) [`earnings/01_historical-financials.md` §3, §6], which mechanically inflates the trailing P/E even as the price moved less. NTM P/E's low percentile confirms this: on the earnings level the Street actually expects over the next twelve months, the multiple sits near the bottom of its own recent range, not the top. EV/Sales — unaffected by this earnings-cycle distortion — shows the more modest, probably more honest, re-rating: up, but not dramatically, from where it traded a year ago. **The warranted multiple has not obviously structurally changed** (no evidence of a moat improvement or a permanent step-up in returns from the business-model/earnings modules reviewed for this report); what changed is where LTM earnings sit in the aluminium price cycle.

## 4. Implied Value from Reversion — Illustrative Only, Not a `07` Fair-Value Input

Own history here is ~13 months, well short of the ~3-year threshold. Per the partial-data rule, the figures below are a **directional illustration of what reversion to the recent 13-month range would imply**, not a mean/median point or tight range for the master valuation triangulation in `07_scenario-and-fair-value`. Do not treat any single number below as a base-case fair value.

| Multiple | Reversion Target (13-mo mean / median) | Implied EV or Equity | Implied Price/Share | vs Current Price (NOK 84.96) |
|---|---:|---:|---:|---:|
| P / E (LTM) | mean 21.02x / median 20.69x | — (direct per-share) | NOK 65.37 / NOK 64.33 | −23.1% / −24.3% |
| P / E (NTM) | mean 10.73x / median 10.40x | — (direct per-share) | NOK 94.44 / NOK 91.54 | +11.2% / +7.7% |
| EV / Sales (LTM) | mean 0.86x / median 0.87x | EV NOK 172,975mm / 175,942mm → equity NOK 147,561mm / 150,528mm | NOK 75.07 / NOK 76.58 | −11.6% / −9.9% |
| P / Book | mean 1.55x / median 1.57x | — (direct per-share) | NOK 81.10 / NOK 81.91 | −4.5% / −3.6% |
| EV / EBITDA (LTM, CIQ vendor basis — flagged) | mean 3.41x / median 3.47x | EV NOK 162,214mm / 165,358mm → equity NOK 136,800mm / 139,944mm | NOK 69.61 / NOK 71.21 | −18.1% / −16.2% |
| EV / EBIT (LTM, CIQ vendor basis — flagged) | mean 4.24x / median 4.34x | EV NOK 158,264mm / 161,720mm → equity NOK 132,850mm / 136,306mm | NOK 67.60 / NOK 69.35 | −20.4% / −18.4% |

Illustrative single point (named, not a fair-value input): the own-median P/E (LTM), the most reliable single reconciled multiple, implies NOK 64.33/share, −24.3% versus the current price. **This point should not be read in isolation** — the own-median NTM P/E, using the same reconciled EPS line but the forward earnings level, implies NOK 91.54/share, +7.7% versus current price. The dispersion across the six method/basis combinations above runs from NOK 64.33 to NOK 94.44/share (−24.3% to +11.2% versus current price), and the LTM-vs-NTM P/E split is the single biggest driver of that spread — it is a cycle-position effect (Section 3), not six independent views of fair value. Reversion assumes the warranted multiple has not structurally changed; business-model/earnings evidence reviewed here supports treating the LTM-basis discount signal with caution (depressed trailing earnings) and gives no positive evidence of a genuine quality/moat re-rating on the NTM-basis premium either.

## 5. Own-History Read

On a 13-month lookback — the only history in the pool, and short of the 3-year bar this analysis is built for — Norsk Hydro's stock has re-rated up hard on trailing earnings (LTM P/E at the 85th percentile of its own range, +30% to its own mean) but sits cheap on forward earnings (NTM P/E at the 15th percentile, −15% to its own mean); EV/Sales, the cleanest EV-based read, shows a real but modest premium (+8% to mean). The single biggest caveat is that this whole trailing-vs-forward split is a mechanical artifact of a depressed LTM earnings base (a near-loss Q4 2025 quarter) rather than a genuine business re-rating — reverting the LTM P/E to its own mean would imply a ~23% lower share price, while reverting the NTM P/E to its own mean implies an ~11% higher one, and neither should be trusted as a standalone fair-value read given how little history backs either number.

A second, structural caveat applies on top of the short-history one: the management-governance module flagged the Norwegian State's 34.49% controlling stake as a structurally misaligned owner (RF-OWN-004, CLAUDE.md §24 Filter 6) — the State's own stated rationale for the holding is retaining head-office and technology functions in Norway, an industrial-policy objective, not per-share value maximization, and the Board has declined to adopt takeover-bid-handling principles specifically because of the size of that stake [`management-governance/99_management-governance-synthesis.md`, RF-OWN-004]. Per the module rules, this caps valuation attractiveness at 60 and means a cheap-looking multiple here (the NTM P/E discount, or any future dip back toward the 13-month low) cannot be read as an automatic margin of safety: if the multiple is depressed for cycle or control-related reasons the State has no mandate to correct, reversion to even this short own-history mean is not the base case, only one illustrative possibility among several.

