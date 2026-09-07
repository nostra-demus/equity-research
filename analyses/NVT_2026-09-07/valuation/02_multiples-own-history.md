# Multiples — Own History — NVT

**Evidence binding: frozen.** All reads resolved through the bound generation `6db32848…1aecd1e6` (`manifest.json`, `ciq_facts.json`, per-tab extracts). Live `data/NVT/` and `_pool_extracts/` were not read; `data/NVT/` is a citation label only. Web sources are used for ONE input only — the sector-level multiple history required by the Sector Cycle Reality Test (§5) — and are labelled and dated there.

**Reporting basis.** US GAAP, **USD in millions** except per-share. Fiscal year ends 31 December. Business type from `00_valuation-data-triage` §3: **Operating company** — so under the Business-Type Method Map, EV-based multiples (EV/EBITDA, EV/EBIT, EV/Sales), P/E and FCF yield are the valid set. **P/tangible book is not available and is not shown**: tangible book value is **negative $482.7m** (equity 3,986.9 − goodwill 2,676.3 − intangibles 1,793.3), which is why Capital IQ prints "NM" in every column of that row [`01_price-and-capital-structure.md` §6; `Capital IQ Financials export → Multiples`].

**Anchors used verbatim from `01_price-and-capital-structure.md` §7 (MODULE_RULES → Reconciliation Gate 1).** Price **USD 171.16** (close **2026-08-12**, pool-verified, **stale by ~17–19 trading days**); indicative refresh **USD 156.03** (close 2026-09-04, web-sourced, unverified, **−8.84%**); shares for market cap **161.858m**; shares for per-share fair value **164.2m fully diluted**; market cap **USD 27,703.6m**; **canonical EV USD 28,940.0m**; lease-inclusive **TEV USD 29,080.5m** (used ONLY when reading a Capital IQ multiple that was itself computed on TEV); net debt **USD 1,236.4m strict §15 basis** (lease-inclusive vendor variant 1,376.9). No departure from any of these figures is made anywhere below.

---

## 1. Current Multiples

Metric base is the **LTM period 12 months ended 30-Jun-2026** [`Capital IQ Financials export → Income Statement` and `→ Cash Flow`, LTM column]. All figures are **reported (GAAP-derived) vendor figures, not company-adjusted**, except the one row explicitly marked normalized. Forward figures are **consensus mean estimates**, labelled NTM or FY.

| Multiple | Basis (LTM / NTM / FY) | Metric Value | Current Multiple | Source |
|---|---|---:|---:|---|
| **P / E** | LTM, reported diluted EPS excl. extraordinary items | EPS **$3.602** | **47.5x** | 171.16 ÷ 3.601945. `Capital IQ Financials export → Key Stats` (Diluted EPS Excl. Extra, LTM Jun-30-2026). Vendor's own P/LTM EPS Close 47.5188x — ties |
| P / E | **NTM**, consensus | implied NTM EPS **$5.77** | **29.7x** | `Capital IQ Estimates export → Multiples`, NTM Price/Earnings 29.6612x (on the same 171.16 price); implied EPS = 171.16 ÷ 29.6612 |
| P / E | **FY2026E** consensus | EPS **$5.113** | **33.5x** | `Capital IQ Estimates export → Multiples`, FY 2026 P/E 33.4754x; EPS from `→ Key Stats` FY2026E |
| P / E | **FY2027E** consensus | EPS **$6.433** | **26.6x** | `Capital IQ Estimates export → Multiples`, FY 2027 P/E 26.6057x |
| **EV / EBITDA** | LTM, reported | EBITDA **1,074.6** | **26.9x** | 28,940.0 ÷ 1,074.6. EBITDA from `ciq_facts.json` `ltm_ebitda_m` = 1,074.6 [`CIQ Financials → Income Statement 'EBITDA', LTM Jun-30-2026`]. **Vendor's own TEV/LTM EBITDA Close = 26.24x** (`ciq_facts.json` `ev_ebitda_current_x` 26.2) — see the reconciliation note below |
| EV / EBITDA | **NTM**, consensus | implied NTM EBITDA **~1,359.8** | **21.4x** | `Capital IQ Estimates export → Multiples`, NTM TEV/EBITDA 21.3865x (TEV basis); ties exactly to `Financials → Multiples`, TEV/NTM EBITDA Close 2026-08-12 |
| **EV / EBIT** | LTM, reported | EBIT **842.7** | **34.3x** | 28,940.0 ÷ 842.7. Vendor TEV/LTM EBIT Close 34.5087x on TEV 29,080.5 — ties exactly (29,080.5 ÷ 842.7 = 34.51) |
| EV / EBIT | **NTM**, consensus | — | **23.0x** | `Capital IQ Estimates export → Multiples`, NTM TEV/EBIT 23.0219x |
| **EV / Sales** | LTM, reported | Revenue **4,834.0** | **5.99x** | 28,940.0 ÷ 4,834.0. Vendor TEV/LTM Revenue Close 6.0158x on TEV — ties exactly |
| EV / Sales | **NTM**, consensus | — | **4.88x** | `Capital IQ Estimates export → Multiples`, NTM TEV/REV 4.8825x |
| **P / Book** | LTM (balance sheet 30-Jun-2026) | BVPS **$24.28** (equity 3,986.9 ÷ 164.2m) | **7.05x** | `01` §6. Vendor P/BV 6.9487x is the same number on the 161.858m basic count — a share-count basis difference, not a data disagreement |
| P / Tangible Book | — | **negative ($2.94)/share** | **not meaningful** | `01` §6. No tangible-book floor method exists for this company |
| **P / FCF** (and FCF yield) | LTM, §15 basis: FCF = CFO − total capex | FCF **577.7** = 690.6 − 112.9 | **48.0x → FCF yield 2.09%** | `Capital IQ Financials export → Cash Flow`, LTM Jun-30-2026 (Cash from Ops. 690.6; Capital Expenditure −112.9). Market cap 27,703.6 ÷ 577.7. *Do not confuse with the vendor's "Levered Free Cash Flow" 468.2, which is after interest* |
| **Dividend yield** | **Trailing**, gross | $0.82/share paid in the 12 months to 30-Jun-2026 | **0.48%** | `01` §6A. Forward-declared run-rate $0.84 → 0.49%. **The most recent dividend's record date (2026-07-24) has already passed** — this is not income available to a buyer today (CLAUDE.md §16) |

**Reconciliation note the reader needs (CLAUDE.md §5).** My EV/LTM EBITDA of **26.9x** and Capital IQ's own **26.24x** are not the same arithmetic. Two differences, both stated rather than smoothed: (a) I use the canonical EV of 28,940.0, the vendor uses TEV 29,080.5 (which adds the $140.5m of operating leases); (b) more importantly, **the vendor's multiples engine is not using the EBITDA its own Income Statement tab displays** — 29,080.5 ÷ 26.243574 back-solves to an EBITDA of **1,108.1**, against the 1,074.6 printed on the Income Statement and carried in `ciq_facts.json`. The EBIT and revenue multiples tie to six decimals on the same TEV, so the gap is confined to the EBITDA line. Per the run instruction, `ciq_facts.json`'s **26.2** is accepted as the authoritative READ of that workbook and is used unchanged for every band comparison in §2 (matched basis: the whole historical series is computed on the vendor's own convention). My 26.9x is the same company on the filing-consistent EV and the vendor's stated EBITDA. **The 0.7x gap moves nothing in the read below** — both sit in the same part of the range.

**At the indicative refresh price of $156.03 (2026-09-04, web-sourced, unverified — not the anchor):** P/LTM EPS 43.3x, EV/LTM EBITDA 24.5x (26,491.1 ÷ 1,074.6), EV/LTM EBIT 31.4x, EV/LTM Sales 5.48x, P/B 6.43x, trailing dividend yield 0.53%. Every band position in §2 is roughly one-tenth of the range lower at that price; the direction of the read does not change.

---

## 2. Historical Multiple Bands (3–5 years)

### PARTIAL DATA — the 3–5 year band does not exist for this company in this pool

The Capital IQ Multiples tab carries **seven quarterly columns only: 2025-03-31 through 2026-06-30, plus the current column dated 2026-08-12** [`Capital IQ Financials export → Multiples`, tab header "For Quarter Ending"]. That is **six completed quarters ≈ 1.5 years of history** — not the three-to-five years the own-history method is built on. `ciq_facts.json` `range_position` says the same thing in the vendor sidecar's own words: *"LOW-CONFIDENCE (6 closes <8q ≈2y) — floor read unreliable"*. `00_valuation-data-triage` §5 flagged it in advance.

**Consequence, applied (system partial-data rule).** A "mean" computed off six quarters is not a through-cycle anchor, it is a three-point average of one upswing. **No mean/median reversion target is offered as a point or a tight range, and nothing in §4 is a fair-value input for `07`.** What follows is a *directional* read of where the current multiple sits inside a short, one-directional window — and the observed min/max, which `07` may legitimately use as the evidenced outer bounds for its bull and bear multiples (Scenario Construction §2), since those are actual traded levels rather than a derived central tendency.

**Definitions used in every band table below**, so a reader can reproduce each number:
- **Min** = the lowest quarterly *Low* across the six history quarters (an actual intraperiod traded level).
- **Max** = the highest quarterly *High* across the six.
- **Mean** = the simple mean of the six quarterly *Average* values.
- **Median** = the median of the six quarterly *Close* values (this is the basis `ciq_facts.json` uses, so the two reconcile).
- **Current** = the *Close* in the 2026-08-12 column — the same date as the price anchor.
- **Percentile of range** = `(current − min) ÷ (max − min)`, on the Low-to-High basis.
- All rows are Capital IQ's own **TEV** basis (lease-inclusive), so the series is internally consistent; do not mix these with the canonical EV of 28,940.0 without the note in §1.

### 2A. Trailing (LTM) multiples — history window 2025-03-31 → 2026-06-30

| Multiple | Min | Mean | Median | Max | Current | Percentile of Range |
|---|---:|---:|---:|---:|---:|---:|
| P / LTM EPS | 18.35x | 50.25x | 53.96x | 69.36x | **47.52x** | **57%** |
| P / LTM **Normalized** EPS | 27.89x | 50.88x | 54.87x | 77.29x | **58.52x** | **62%** |
| TEV / LTM EBITDA | 13.67x | 21.65x | 23.19x | 32.74x | **26.24x** | **66%** |
| TEV / LTM EBIT | 18.12x | 29.45x | 32.01x | 44.71x | **34.51x** | **62%** |
| TEV / LTM Revenue | 3.19x | 4.88x | 5.17x | 7.24x | **6.02x** | **70%** |
| P / Book Value | 2.30x | 4.40x | 4.52x | 7.85x | **6.95x** | **84%** |

Source for every cell: `Capital IQ Financials export → Multiples`, quarterly High / Low / Average / Close rows, columns 2025-03-31 through 2026-08-12.

**Cross-check against the sidecar.** `ciq_facts.json` `ev_ebitda_percentile` = **0.833**. That is a different, equally valid definition — the *rank* of the current close among the six historical closes (26.24x is above five of six → 5/6 = 83.3%) — not a position within the min-to-max range. Both are reported so neither is mistaken for the other: **rank percentile 83%, range percentile 66%.** The close-only range `ciq_facts.json` quotes (15.4–30.3x, median 23.2x) reproduces exactly from the Close row; my wider 13.67–32.74x band adds the intraperiod highs and lows, which are real traded levels and a fairer statement of what the stock has actually changed hands at.

### 2B. Forward (NTM) multiples — same window, and the more reliable of the two

| Multiple | Min | Mean | Median | Max | Current | Percentile of Range |
|---|---:|---:|---:|---:|---:|---:|
| P / NTM EPS | 14.87x | 25.82x | 26.66x | 38.16x | **29.66x** | **64%** |
| TEV / NTM EBITDA | 12.40x | 18.43x | 18.64x | 27.23x | **21.39x** | **61%** |
| TEV / NTM EBIT | 13.46x | 20.11x | 20.59x | 29.13x | **23.02x** | **61%** |
| TEV / NTM Revenue | 2.82x | 4.19x | 4.26x | 6.06x | **4.88x** | **68%** |

Source: same tab, TEV/NTM and P/NTM rows. The current column ties exactly to the separate `Capital IQ Estimates export → Multiples` NTM row (21.3865x EBITDA, 29.6612x P/E), which is an independent confirmation that the two workbooks are on the same price and the same estimate set.

**Why the forward band deserves more weight than the trailing band here.** The trailing denominators moved violently over this very window for reasons unrelated to how the market prices the company: LTM revenue went from $3,006.1m (FY2024) to $3,893.1m (FY2025) to **$4,834.0m** (LTM Jun-2026), and LTM net income swung from $331.8m to $710.2m to $598.3m as a **$1,584.5m divestiture inflow** and discontinued operations ran through the accounts [`Capital IQ Financials export → Income Statement` and `→ Cash Flow`, Net Cash From Discontinued Ops. and Other Investing Activities, FY2025]. That is why P/LTM EPS ranges from **18.35x to 69.36x** in six quarters — a 3.8-fold swing in a multiple is a statement about the denominator, not about sentiment. The NTM series is not clean either, but it is measured against a forward estimate that was being revised in the same direction the price was moving, so it is the less distorted of the two.

---

## 3. Re-Rating / De-Rating Read

**The stock has re-rated up, and it did so on top of a rising denominator — both halves of the multiple moved the same way.** Take the three most reliable rows. On **TEV/LTM EBITDA**, the current 26.24x sits **+21.2% above its own six-quarter mean of 21.65x** and **+13.2% above its own median close of 23.19x** [(26.2436 − 21.6495) ÷ 21.6495; (26.2436 − 23.1885) ÷ 23.1885]. On **TEV/NTM EBITDA** it is **+16.0% above the mean (18.43x)** and **+14.8% above the median (18.64x)**. On **P/NTM EPS**, 29.66x is **+14.9% above the mean (25.82x)** and **+11.3% above the median (26.66x)**. The one row pointing the other way is **P/LTM EPS at 47.52x, which is −5.4% below its own mean and −11.9% below its own median** — and that row is the least trustworthy of the set, because its denominator contains the discontinued-operations distortion described in §2B. I name it here rather than leave it out (CLAUDE.md §3): the contradicting metric exists, it is a trailing-earnings artefact, and it does not overturn the premium read that four independent forward and trailing rows agree on.

**The scale of the move, stated plainly.** The TEV/LTM EBITDA close went **15.39x (Q1 2025) → 30.25x (Q2 2026) → 26.24x (12-Aug-2026)** — the multiple itself is up roughly **70%** from the start of the window, while LTM EBITDA over broadly the same span rose from $675.6m (FY2024) to $1,074.6m, up **59%** [`Capital IQ Financials export → Income Statement`]. Price × multiple compounding in the same direction is why market cap roughly tripled.

**The most likely reason, with evidence, is mix shift into one end market — not a general cycle turn in nVent's old business.** Infrastructure went from 12% of sales at the 2018 spin to 45% in 2025 to **58.1% of H1 FY26 net sales** [`Q2 FY26 10-Q, Note 2, p.9`; `Q2 FY26 transcript, prepared remarks`], and roughly **94% of Q2 FY26 organic growth came from that single vertical** [`business-model/10_external-dependency.md` §4]. Data-centre sales are guided above $2bn, more than 37% of company sales. The industrial vertical — 32% of 2025 sales — grew only low single digits organically in Q2 FY26 [`June 2026 William Blair deck, slide 4`; `Q2 FY26 transcript`]. So the market is paying an AI-infrastructure multiple for a company whose non-data-centre two-thirds is growing at low single digits. Leverage is not the explanation: net debt/EBITDA is **1.15x strict** today [`01` §5], down from 3.00x at FY2024 [`management-governance/99` §rejector filters], so the re-rating is not a de-gearing story.

---

## 4. Implied Value from Reversion

> **ILLUSTRATIVE ONLY — NOT A FAIR-VALUE INPUT FOR `07`.** The own-history window is **~1.5 years (six quarterly closes)**, well under the ~3-year minimum. A "mean" or "median" struck off six points inside one continuous upswing is not a through-cycle warranted multiple; presenting a point target off it would be false precision of exactly the kind the partial-data rule exists to stop. **No base-case point is named and none should be inferred.** The table below exists so a reader can see the arithmetic and the dispersion, and so `07` can see how far the levels move on a reversion assumption it should *not* adopt.

**Convention (stated once, used in every row).** These are Capital IQ TEV-basis multiples, so `implied TEV = multiple × metric`, then `implied equity = TEV − lease-inclusive net debt 1,376.9` (the matched basis for a TEV multiple — NOT the strict $1,236.4m, and this is the explicit one-line reason required by Reconciliation Gate 1), then `÷ 164.2m fully diluted shares`. Equity-basis multiples (P/E, P/B) are applied straight to the per-share metric.

**Trailing basis (least reliable — see §2B):**

| Multiple | Reversion Target (mean / median) | Implied EV or Equity | Implied Price/Share | vs Current Price ($171.16 / $156.03) |
|---|---:|---:|---:|---:|
| TEV / LTM EBITDA (metric 1,074.6) | mean 21.65x | TEV 23,264 → equity 21,887 | **$133.30** | −22.1% / −14.6% |
| TEV / LTM EBITDA | median 23.19x | TEV 24,918 → equity 23,542 | **$143.37** | −16.2% / −8.1% |
| TEV / LTM EBIT (metric 842.7) | mean 29.45x | TEV 24,818 → equity 23,441 | **$142.76** | −16.6% / −8.5% |
| TEV / LTM EBIT | median 32.01x | TEV 26,977 → equity 25,600 | **$155.91** | −8.9% / −0.1% |
| TEV / LTM Revenue (metric 4,834.0) | median 5.17x | TEV 24,986 → equity 23,609 | **$143.79** | −16.0% / −7.8% |
| P / LTM Normalized EPS (metric $2.925) | median 54.87x | equity, per share | **$160.47** | −6.2% / +2.8% |
| P / LTM EPS (metric $3.602) | median 53.96x | equity, per share | **$194.36** | +13.5% / +24.6% |
| P / Book (metric $24.28) | median 4.52x | equity, per share | **$109.82** | −35.8% / −29.6% |

**Forward (NTM) basis — the same exercise on the less-distorted denominator:**

| Multiple | Reversion Target (mean / median) | Implied EV or Equity | Implied Price/Share | vs Current Price ($171.16 / $156.03) |
|---|---:|---:|---:|---:|
| TEV / NTM EBITDA (metric ~1,359.8) | mean 18.43x | TEV 25,059 → equity 23,682 | **$144.23** | −15.7% / −7.6% |
| TEV / NTM EBITDA | median 18.64x | TEV 25,341 → equity 23,964 | **$145.94** | −14.7% / −6.5% |
| P / NTM EPS (metric $5.771) | mean 25.82x | equity, per share | **$148.97** | −13.0% / −4.5% |
| P / NTM EPS | median 26.66x | equity, per share | **$153.81** | −10.1% / −1.4% |

**Base-case point: NOT PRODUCED.** Per the partial-data rule the own-median-implied value on the most reliable multiple (TEV/NTM EBITDA, $145.94) is shown above but is **explicitly withheld as a base-case fair-value input**; it is a directional marker only.

**Dispersion, shown separately as the exhibit.** Across the median-reversion rows the illustrative implied values run **$109.82 (P/Book) to $194.36 (P/LTM EPS)** — a high-to-low field of **77%** of the low value. Dropping the two rows this business type makes meaningless or distorted (P/Book, because $4,469.6m of the $3,986.9m equity base is goodwill and intangibles; and P/LTM EPS, for the discontinued-operations reason in §2B), the remaining five cluster **$143.37 to $160.47** — a 12% field. That tightness is not corroboration: all five are drawn from the same six quarters of the same stock, so they are one read expressed five ways, not five independent reads (CLAUDE.md §16 independence check).

**The reversion assumption, tested rather than assumed.** Reverting to the own mean or median assumes the multiple this company *warrants* has not structurally changed since early 2025. **The evidence says it has changed, and the direction of the change is genuinely ambiguous — which is precisely why no point is published here:**
- *Arguing the warranted multiple is genuinely higher now:* the revenue mix moved from 12% infrastructure at spin to 58.1% of H1 FY26 [`Q2 FY26 10-Q, Note 2, p.9`]; return on capital rose from ~6.3% (FY2023–FY2024) to **9.5% LTM** and EBITDA margin from 19.7% to 22.2% [`Capital IQ Financials export → Ratios`, tier-5 vendor]; net leverage fell from 3.00x to 1.15x [`01` §5]; and the Thermal Management divestiture removed a slower business.
- *Arguing it has not, or should be lower:* `business-model/07_business-quality.md` scores the aggregate at **41/100**, with **cyclicality at 30/100 — its lowest row** — and states that today's 9.5% return is roughly **1.5x** the ~6.4% pre-boom level, "driven by volume running ahead of installed capacity during a build-out"; `09_moat.md` explicitly labels the LTM figure a **cycle peak** and refuses to use it raw. `business-model/07` §4 records the §24 Filter 5 trip: *"this is a sector / technology-cycle bet, not a durable compounder"*, with the CEO's own words that liquid cooling is "maybe it's now 10% to 15% of cooling in data centers" and the 800-volt rack architecture still unsettled [`Q2 FY26 transcript, Q&A`]. **A peak multiple applied to a peak denominator is the double-count this method is most exposed to**, and both halves of every EV/EBITDA figure above sit at a high.

**Two further reasons every number in this section is pre-dated, not wrong but incomplete.** (1) The anchor price (2026-08-12) and the entire consensus set (to 2026-08-07) **pre-date the Maverick Power acquisition announced 2026-08-24** — $1.75bn cash plus up to $550m earnout, ~$700m of target 2026 revenue, close expected Q4 2026, cash-and-new-debt funded [`nVent news release, 2026-08-24`]. Every multiple above is a **pre-deal** multiple. (2) The price is **~17–19 trading days stale** and the indicative refresh is 8.84% lower, which is why the "vs current price" column is shown at both prices throughout (`01` §1, MODULE_RULES → Price freshness).

---

## 5. Sector Cycle Reality Test

**The sector re-rated hard over the same window, in the SAME direction as nVent's own premium — the own-history band is flagged cycle-elevated.** No sector-level multiple history exists anywhere in the data pool (`00_valuation-data-triage` §5 flagged this in advance; `ciq_facts.json` `peer_ev_ebitda` is `missing`), so the reference was web-sourced and is labelled unverified: **the S&P 500 Industrials sector's forward P/E rose from roughly 16.0x in late 2022 to roughly 25.5x currently — about +59%** — with the sector "repriced as a structural play on AI, onshoring, and domestic capacity investment" [`Web: Yardeni Research QuickTakes, "INDUSTRIALS: Earnings & P/E Multiples Boosted By Booming AI, Onshoring & Defense Spending", retrieved 2026-09-07 — indicative, unverified`]. A corroborating price-level read: the US Heavy Electrical Equipment industry "gained 223% over the past year" as of 2026-04-10 [`Web: Simply Wall St, US Heavy Electrical Equipment industry page, retrieved 2026-09-07 — indicative, unverified`]. **+59% is more than double the ~25% materiality threshold, and it runs the same way as nVent's +13% to +21% premium to its own mean/median — so the trigger fires.**

**Honest statement of the window mismatch.** The sector series runs late-2022 → 2026; nVent's own band runs only 2025-03 → 2026-08. The two windows are not identical, and the sector figure is web-sourced rather than a matched Capital IQ series. What can be said with confidence is the thing that matters: **nVent's entire 1.5-year multiple history sits INSIDE one continuous sector-wide re-rating run, so its "own mean" is a snapshot of the sector's boom level, not a through-cycle normal.** That is the exact failure mode CLAUDE.md §16 describes — anchoring on the bubble's own level and calling it reversion. Per MODULE_RULES → Score Cap Rules, **this method's confidence contribution is capped at 60**, and `99` must check whether `03_relative-valuation-peers` fires the same flag (the compounding rule caps the combined base-case valuation confidence at 55 if it does).

RF-VAL-001: own-history band cycle-elevated — S&P 500 Industrials forward P/E ~16.0x (late 2022) → ~25.5x (current), roughly +59%, same direction as NVT's premium to its own mean [Web: Yardeni Research QuickTakes, retrieved 2026-09-07, indicative/unverified]

---

## 6. Own-History Read

**nVent trades at a 13–21% premium to its own six-quarter mean and median on EV/EBITDA (26.24x LTM against a 21.65x mean and 23.19x median; 21.39x NTM against 18.43x / 18.64x), sitting at roughly the 61st–66th percentile of its own observed range and above five of its own six quarterly closes — but that "own history" is 1.5 years long, so it is a marker, not an anchor.** Reverting to that mean or median would imply an illustrative $133–$146 per share on EV/EBITDA and $149–$154 on P/NTM EPS, against $171.16 (2026-08-12 anchor) or $156.03 (indicative 2026-09-04) — and **none of those numbers is offered to `07` as a fair-value input**, because a mean computed off six quarters inside one uninterrupted upswing cannot tell you what this company deserves through a cycle.

**The single biggest caveat is a double-count risk running in the bearish direction, and a structural-change risk running in the bullish one — they do not cancel, they compound the uncertainty.** Every EV/EBITDA figure above puts a near-peak multiple on a near-peak denominator: LTM EBITDA of $1,074.6m is 59% above FY2024, return on capital at 9.5% is ~1.5x the ~6.4% pre-boom level, and `business-model/07_business-quality.md` scores cyclicality **30/100** while `09_moat.md` labels the LTM figure a cycle peak and refuses to capitalise it. Against that, the business genuinely is not the same company it was in early 2025 — infrastructure went from 45% of FY2025 sales to 58.1% of H1 FY26, leverage halved, and $1.75bn of Maverick Power lands in Q4 2026 — so the *old* mean is not obviously the right target either. Reverting to the old mean is not warranted, and neither is assuming the new level is the new normal.

**§5's flag travels with that conclusion: the own-history band is cycle-elevated and must not be presented as a clean floor.** nVent's whole multiple history sits inside a sector-wide re-rating (S&P 500 Industrials forward P/E ~16.0x → ~25.5x), so the band's bottom end — 13.67x TEV/LTM EBITDA — is a level from inside the boom, not a downside anchor tested against a downturn. On the §24 Filter 6 ownership test there is no offsetting structural discount to worry about: `management-governance/04_ownership-and-insider-behavior.md` tested all three unaligned structures and **RF-OWN-004 is not triggered**, so no value-trap-from-owner caveat applies here and no shareholder-friendliness cap flows to this method.

---

**Partial data (declared):** own multiple history is ~1.5 years (six quarterly closes) against the 3–5 years the method requires → no mean/median reversion target published as a fair-value input; §4 is illustrative-only. Sector-level multiple history absent from the pool → web-sourced, labelled unverified, and **RF-VAL-001 fired** → this method's confidence contribution capped at 60. Price anchor stale (~17–19 trading days) and pre-dates the Maverick Power announcement → every price-relative figure shown at both $171.16 and the indicative $156.03.

**Out-of-scope items not produced here (correctly owned elsewhere):** peer comparison → `03_relative-valuation-peers`; cash-flow value → `04_intrinsic-dcf`; the bull/base/bear levels and the final fair value → `07_scenario-and-fair-value`; probabilities, risk/reward and the rating → the master synthesizer.
