# Relative Valuation — Peers — HCG

*HealthCare Global Enterprises Limited (NSE: HCG, BSE: 539787) — pan-India, single-segment comprehensive cancer-care (oncology hospital) operator. Reporting currency INR (₹), all figures ₹ million (₹ Mn) unless a per-share or multiple is stated; fiscal year ends 31 March (FY26 = year ended 31 Mar 2026). Business type: **Operating company** (Health Care Facilities) per `00_valuation-data-triage` — so the EV-based multiple set (TEV/Revenue, TEV/EBITDA, TEV/EBIT, P/E, P/Tangible Book) is the correct frame per the Business-Type Method Map; this is not a bank, REIT, or holding company.*

**Anchor (from `01_price-and-capital-structure`, used verbatim):** Price **₹646.15** (NSE last close, ~late-May 2026 pool snapshot); market cap **₹96,461.1M**; EV **₹109,187.9M**; net debt **₹11,944.4M** (incl. leases); shares (market cap) **149.30M**, shares (per-share fair value) **151.79M** fully diluted. Net debt = total debt ₹17,353.6M − cash ₹5,409.2M; minority interest ₹782.4M.

> **Cross-module inputs used (all present):** `business-model/08_competitive-map.md` (named peer set), `business-model/07_business-quality.md` and `business-model/09_moat.md` (warranted-multiple argument), `earnings/01_historical-financials.md` (HCG metrics), `valuation/01_price-and-capital-structure.md` (anchor). The peer set is **vendor/web-assembled, not company-named** — HCG's filings name no corporate competitor in a competition section (see §1 caveat).

> **One critical price/FX note that propagates through this report.** The Capital IQ comparable export that supplies every peer multiple is denominated in **US Dollars** and embeds HCG's own price at **$6.82 ≈ ₹637.25** (the CIQ-snapshot price, basis Mar-31-2026), *not* the ₹646.15 anchor. The implied INR/USD rate from HCG's own line is **≈₹94.7/USD** (rev: 25,454 ÷ 268.7 = 94.73; EBITDA: 4,658 ÷ 49.2 = 94.67). At that rate the export's HCG market cap ($1,018.3M → ₹96,464M) and TEV ($1,152.6M → ₹109,186M) reproduce the INR anchor to within ~0.1%, so the export and the anchor describe the same company. HCG's *own* multiples in the table below are therefore on the ₹637.25 basis; on the ₹646.15 anchor (~1.4% higher) HCG's EV multiples would be ~1.4% richer and its discounts to peers ~1.4% shallower. This does not change any verdict (the gaps are far larger than 1.4%) but it is flagged so no downstream agent double-counts the price difference.

---

## 1. Peer Set

The set is the **Capital IQ relevancy-ranked comparable export** in the data pool (`Company Comparable Analysis HealthCare Global Enterprises Limited.xls`, Trading Multiples / Operating Statistics / Financial Data sheets, as-of 2026-06-01), cross-checked against the named rivals in `08_competitive-map.md`. **It is self-selected / vendor-selected, not company-named:** HCG's filings name only Tata Memorial (an R&D peer), so no issuer-disclosed competitor list exists [08_competitive-map §2, §5]. The export is a set of **listed Indian (plus two non-Indian) multi-specialty hospital operators that carry an oncology line** — it is the best available public comp set, but with an important limitation: **none is a pure-play oncology chain like HCG.** HCG's two truest like-for-like oncology rivals (Apollo's oncology vertical; private American Oncology Institute) cannot be compared on multiples (see "private/unlistable peers" below).

| Peer | Ticker | Why Comparable | Source of Inclusion |
|---|---|---|---|
| Max Healthcare | BSE:543220 / NSE:MAXHEALTH | Listed multi-specialty chain with a named oncology line; the largest, highest-margin operator in the set; North-India weighted vs HCG's South/West tilt. The set's margin/scale benchmark. | CIQ comparable export + `08_competitive-map §2` (named) |
| Fortis Healthcare | NSE:FORTIS | Listed multi-specialty chain, oncology among specialties; ~3.6x HCG revenue. | CIQ comparable export + `08_competitive-map §2` (named bloc) |
| Narayana Hrudayalaya | NSE:NH | Listed multi-specialty; runs an oncology line; broadly comparable scale (~3.1x HCG rev). | CIQ comparable export + `08_competitive-map §2` (named bloc) |
| Aster DM Healthcare | NSE:ASTERDM | Listed multi-specialty, India + GCC; oncology line; ~1.8x HCG rev. | CIQ comparable export + `08_competitive-map §2` (named bloc) |
| Global Health (Medanta) | NSE:MEDANTA | Listed multi-specialty, "cardiac and cancer care"; ~1.7x HCG rev. | CIQ comparable export + `08_competitive-map §2` (named bloc) |
| Krishna Institute (KIMS) | NSE:KIMS | Listed multi-specialty, oncology among specialties; ~1.5x HCG rev. | CIQ comparable export + `08_competitive-map §2` (named bloc) |
| Rainbow Children's Medicare | NSE:RAINBOW | Listed single-specialty (paediatrics) hospital chain — a useful *single-specialty* comp (similar focused model, different specialty); ~0.7x HCG rev. | CIQ comparable export (relevancy-ranked) |
| Yatharth Hospital & Trauma | NSE:YATHARTH | Listed multi-specialty / trauma hospital chain; smaller (~0.5x HCG rev). | CIQ comparable export (relevancy-ranked) |
| Sanbo Hospital Management | SZSE:301293 | Chinese listed hospital operator; included by CIQ relevancy; **flagged** — different country, regulatory regime, and an outlier on several multiples. | CIQ comparable export (relevancy-ranked) |
| Medical Facilities Corp | TSX:DR | Canadian surgical-facility operator; included by CIQ relevancy; **flagged** — different country/model and the set's low-multiple outlier (TEV/EBITDA 3.4x). | CIQ comparable export (relevancy-ranked) |

**Private / unlistable peers (no public multiples — flagged, not guessed):**
- **American Oncology Institute (AOI / CTSI)** — HCG's *closest like-for-like rival* (standalone single-specialty cancer chain, ~18 hospitals, Tier-2 weighted), but **private** (CTSI/Asia Healthcare Holdings; CTSI acquired by Varian/Siemens). No public multiple exists; cannot be placed in the table [08_competitive-map §2].
- **Apollo Cancer Centres (within Apollo Hospitals, NSE:APOLLOHOSP)** — the deepest-pocketed oncology rival (14 dedicated centres + proton therapy), but Apollo does **not** break out a stand-alone oncology revenue/EBITDA line, and Apollo is **not carried in HCG's CIQ relevancy-ranked export**. A group-level Apollo multiple would mix oncology with a large non-oncology business, so it is excluded rather than forced in [08_competitive-map §2; 09_moat §3].

**Honest read on comparability:** the multiples below benchmark HCG against *listed multi-specialty hospitals*, not against *pure-play oncology economics* — the two oncology-specific rivals are off-screen. The two non-Indian names (Sanbo, Medical Facilities Corp) are kept because CIQ ranked them in, but they are flagged as outliers and the verdict leans on the eight Indian names. Where it matters, the read is sanity-checked against the **median excluding the two non-India outliers** (footnoted in §2).

---

## 2. Peer Multiples & Operating Stats

All figures from the **Capital IQ comparable export, as-of 2026-06-01** (Trading Multiples + Operating Statistics + Financial Data sheets), denominated in USD, converted at "today's spot rate" by CIQ. Multiple definitions (CIQ default): **TEV/Rev, TEV/EBITDA, TEV/EBIT = LTM-Latest**; **P/E = Price / Diluted EPS before extra, LTM-Latest**; **P/TangBV = LTM**; growth and margins = **LTM**; **Total Debt/EBITDA = LTM**. HCG's line is on the export's ₹637.25 / $6.82 price (see anchor note). **FCF yield is NOT carried in the export for any company** — it is shown for HCG only (computed from filings) and marked "n/a (peer)" for the rest rather than fabricated. **ROIC is NOT carried for peers** in the export (confirmed in `09_moat §3`); HCG's own Return on Capital is shown from the CIQ Financials export and peers are marked "n/d".

| Company | P/E (LTM) | EV/EBITDA (LTM) | EV/EBIT (LTM) | EV/Sales (LTM) | FCF Yield | Rev Growth (LTM) | EBITDA Margin | ROIC | Net Debt/EBITDA¹ | Data As-of |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| **HCG** | **NM²** | **23.4** | **49.0** | **4.3** | **0.6%³** | **+14.5%** | **18.3%** | **4.6%⁴** | **2.6x** | CIQ export 2026-06-01 |
| Krishna Institute (KIMS) | 125.0 | 43.1 | 66.4 | 8.9 | n/a (peer) | +28.6% | 20.5% | n/d | 5.2x | CIQ export 2026-06-01 |
| Global Health (Medanta) | 56.6 | 34.3 | 45.2 | 7.1 | n/a (peer) | +19.4% | 20.8% | n/d | 1.3x | CIQ export 2026-06-01 |
| Narayana Hrudayalaya | 47.7 | 26.0 | 36.1 | 5.3 | n/a (peer) | +44.0% | 20.5% | n/d | 3.5x | CIQ export 2026-06-01 |
| Sanbo (SZSE, flagged)⁵ | 200.0 | 54.0 | 107.7 | 7.0 | n/a (peer) | +19.6% | 11.5% | n/d | 3.1x | CIQ export 2026-06-01 |
| Yatharth Hospital | 43.6 | 24.1 | 33.3 | 6.2 | n/a (peer) | +39.2% | 25.8% | n/d | 0.8x | CIQ export 2026-06-01 |
| Rainbow Children's | 50.0 | 26.4 | 36.5 | 8.4 | n/a (peer) | +12.3% | 32.0% | n/d | 1.6x | CIQ export 2026-06-01 |
| Aster DM Healthcare | 95.9 | 44.5 | 64.0 | 8.3 | n/a (peer) | +12.2% | 19.4% | n/d | 2.5x | CIQ export 2026-06-01 |
| Max Healthcare | 63.6 | 42.0 | 52.4 | 11.2 | n/a (peer) | +19.1% | 26.8% | n/d | 1.6x | CIQ export 2026-06-01 |
| Medical Facilities (TSX, flagged)⁵ | 17.1 | 3.4 | 4.3 | 0.8 | n/a (peer) | +16.1% | 20.9% | n/d | 0.9x | CIQ export 2026-06-01 |
| Fortis Healthcare | 67.3 | 34.9 | 44.4 | 8.0 | n/a (peer) | +17.3% | 22.8% | n/d | 1.7x | CIQ export 2026-06-01 |
| **Peer median (10 peers)** | **60.1** | **34.6** | **44.8** | **7.6** | **n/a** | **+19.3%** | **20.9%** | **n/d** | **1.7x** | recomputed; ties to CIQ |
| **Peer mean (10 peers)** | **76.7** | **33.3** | **49.0** | **7.1** | **n/a** | **+22.8%** | **22.1%** | **n/d** | **2.2x** | recomputed; ties to CIQ |
| *Median ex-Sanbo & MedFac (8 India peers)⁶* | *63.6* | *34.9* | *44.8* | *8.0* | *n/a* | *+19.3%* | *21.6%* | *n/d* | *1.7x* | recomputed |

¹ Net Debt/EBITDA: the export carries **Total Debt/EBITDA** (HCG 3.7x); the "Net Debt/EBITDA" column uses the anchor's HCG figure (2.6x, incl. leases) and the export's Total Debt/EBITDA for peers adjusted to a net basis is **not separately given**, so peer values here are the export's **net-debt-consistent** read where derivable (Medanta net cash-like 1.3x etc.); treat peer Net Debt/EBITDA as ≈ Total Debt/EBITDA minus cash — directionally reliable, not to two decimals. HCG **2.6x** (incl. leases, anchor) is filing-grade. Peer leverage source: CIQ Operating Statistics + Financial Data (LTM Net Debt / LTM EBITDA), 2026-06-01.
² HCG **P/E (LTM) = NM** (Not Meaningful): FY26 diluted EPS ≈ ₹1.0 on reported PAT ₹138M depressed by a ₹319M goodwill impairment + ₹127M labour-code charge; the export prints "NM" and HCG's *forward* P/E is shown in §3 [earnings/01 §4].
³ HCG FCF yield = FY26 FCF ₹586M (CFO ₹3,471M − capex ₹2,885M) ÷ market cap ₹96,461M = **0.61%**; EV/FCF ≈ 186x [earnings/01 §1]. Peer FCF yield not in export.
⁴ HCG Return on Capital (CIQ definition, EBIT-based) = 4.6% FY26 (4.5% FY25, 5.0% FY24) [CIQ Financials export, Ratios; 09_moat §3]. Peer ROIC not in export.
⁵ **Sanbo (China) and Medical Facilities Corp (Canada)** are CIQ relevancy inclusions but different-country/model outliers — Sanbo on the high side (TEV/EBITDA 54x, P/E 200x), MedFac on the low side (TEV/EBITDA 3.4x). The verdict leans on the eight Indian names.
⁶ Ex-outlier median changes little for EBITDA/EBIT/Sales (the two outliers roughly offset on the median), confirming the peer-median anchors are not driven by the two flagged names.

**Forward (NTM, Capital IQ estimates) multiples — same export:** Peer NTM TEV/EBITDA median **22.3x**, NTM P/E median **45.1x**, NTM TEV/Rev median **6.1x**. HCG NTM TEV/EBITDA **19.0x**, NTM TEV/Rev **3.8x**, NTM P/E **74.1x** [CIQ Trading Multiples sheet + `multiples.xls`, 2026-06-01]. HCG's PEG **0.96** reflects a high CIQ NTM LT EPS-growth rate of **77%** — but that growth is off the depressed FY26 net-income base (PAT ₹138M), so the forward P/E and PEG are mechanically flattered by a low denominator and should be read with care.

---

## 3. Premium / Discount to Peer Median

Premium/(discount) = (HCG multiple ÷ peer median − 1). A **negative** number = HCG trades **below** the peer median (apparent discount); a **positive** number = HCG trades **above** (premium). HCG multiples are on the export's ₹637.25 basis (≈1.4% below the ₹646.15 anchor — the anchor would make every discount ~1.4 pts shallower).

| Multiple | HCG | Peer Median | Premium / (Discount) |
|---|---:|---:|---:|
| EV/Sales (LTM) | 4.3 | 7.6 | **(43%)** |
| EV/EBITDA (LTM) | 23.4 | 34.6 | **(32%)** |
| EV/EBITDA (NTM) | 19.0 | 22.3 | **(15%)** |
| EV/EBIT (LTM) | 49.0 | 44.8 | **+9%** |
| EV/Sales (NTM) | 3.8 | 6.1 | **(39%)** |
| P/Tangible Book (LTM) | 10.3 | 11.2 | **(8%)** |
| P/E (NTM) | 74.1 | 45.1 | **+64%** |
| P/E (LTM) | NM | 60.1 | n/m (HCG EPS depressed) |

**The pattern is the whole story.** HCG looks **cheap on the top of the income statement** (EV/Sales −43%, EV/EBITDA −32%) but **expensive, or at best at parity, the moment you move down to profit** (EV/EBIT +9%, NTM P/E +64%). The discount **collapses** as you descend the income statement because HCG converts revenue and EBITDA into operating profit and net income far worse than its peers — heavy depreciation (₹2,442M FY26), high interest (₹1,766M FY26), and a thin/volatile bottom line. The EV/EBITDA "discount" is not a free lunch; it is the market correctly paying less for a rupee of HCG EBITDA than for a rupee of peer EBITDA.

---

## 4. Is the Gap Warranted?

**The EV/EBITDA discount is warranted — it is deserved, not a buying signal.** HCG sits at the **bottom of this peer set on every profitability and balance-sheet quality metric**: LTM EBIT margin **8.7% vs the 16.9% peer median**, LTM net margin **0.5% vs ~12%**, the **highest leverage** in the set (Total Debt/Capital **55.2% vs 28.5%** median; Net Debt/EBITDA 2.6x incl. leases), the **weakest Capital IQ Credit Health** ranks (Overall/Operational/Solvency all 4 of 4, the weakest band), and a six-year Return on Capital of **4.5–5.0%** that has not crossed its ~12–13% cost of capital in any year [09_moat §3–4; 07_business-quality §1–2; CIQ Operating Statistics + Credit Health Panel, 2026-06-01]. The moat module's verdict is **"narrow moat — economically unproven,"** with the strongest source (clinical/technology depth, strength 48) sitting on third-party equipment any well-capitalised rival can buy, and *no* claimed advantage yet converting into peer-level margins [09_moat §5]. A lower-margin, higher-leverage, lower-return operator with an unproven moat **should** trade at a discount to higher-quality peers (Max: 26.8% EBITDA margin, lowest leverage; Rainbow: 32% EBITDA margin). **Conclusion: the EV/EBITDA / EV/Sales discount is warranted.** The one place HCG is *not* discounted — EV/EBIT (+9%) and NTM P/E (+64%) — is where the warranted discount has already been "used up" by HCG's weak profit conversion, so on those metrics HCG carries a **premium that is unjustified** for a bottom-of-peer operator (the NTM P/E premium is partly an artifact of a depressed earnings base, but even adjusting for that, HCG does not warrant a profit-multiple premium). Net: cheap-looking on EBITDA for good reason; not cheap on the metrics that capture HCG's actual weaknesses.

---

## 5. Implied Value from Peer Multiples

Two steps, both shown. **Step A** applies the *full* peer median (the naive screen) to show how unstable that is. **Step B** applies a **warranted** multiple — peer median adjusted **down** for HCG's bottom-of-peer quality — which is the defensible read per MODULE_RULES §"Warranted vs observed." Bridge: Equity = EV − net debt (₹11,944.4M) − minority (₹782.4M); ÷ **151.79M** fully diluted shares (anchor). HCG metrics: LTM EBITDA ₹4,658M (Reported), LTM EBIT ₹2,466M, NTM EBITDA ₹5,737M (CIQ est. $60.56M × ₹94.7). EV/Sales is excluded from the implied-value build — for a bottom-margin operator a sales multiple overstates value (it ignores the very margin gap that defines HCG), and the EV/EBIT line already anchors the profit-based read.

**Step A — full peer median (shown to expose the spread, not used as the answer):**

| Multiple | Peer Median | Implied EV (₹M) | Implied Price/Share | vs ₹646.15 |
|---|---:|---:|---:|---:|
| EV/EBITDA (LTM) | 34.6x | 161,167 | ₹978 | +51% |
| EV/EBIT (LTM) | 44.8x | 110,477 | ₹644 | −0% |
| NTM EV/EBITDA | 22.3x | 128,104 | ₹760 | +18% |

The Step-A spread is **₹644–₹978 (>50% wide)** — exactly the cross-multiple disagreement MODULE_RULES flags. EV/EBITDA at the full median says +51%; EV/EBIT at the full median says ~0%. **The EV/EBIT line is the more honest anchor** because EBIT nets out the depreciation that HCG's capex-heavy model loads onto the EBITDA-to-EBIT bridge. Taking the EV/EBITDA median at face value would be the classic value-trap error.

**Step B — warranted multiple (peer median less a quality discount; the defensible read):**

Quality adjustment applied: a **~25–37% discount to the peer EV/EBITDA median** (34.6x → warranted **22–26x**), justified by HCG's bottom-of-set margins, highest leverage, weakest credit health, and sub-cost-of-capital returns (§4). On EV/EBIT, HCG already trades *above* the median, so **no premium is warranted** — the warranted EV/EBIT band runs from the peer **25th percentile (~35x)** up to the **median (44.8x)**, i.e., a bottom-quartile operator gets a bottom-quartile-to-median profit multiple, not a premium. On NTM EV/EBITDA, the warranted band is **18–21x** (median 22.3x less ~5–20%; a shallower discount than LTM because forward EBITDA growth is real and the NTM gap is already only −15%).

| Multiple | Applied (Warranted) | Implied EV (₹M) | Implied Price/Share | vs ₹646.15 |
|---|---:|---:|---:|---:|
| EV/EBITDA (LTM) — low | 22.0x | 102,476 | ₹591 | −8% |
| EV/EBITDA (LTM) — high | 26.0x | 121,108 | ₹714 | +11% |
| EV/EBIT (LTM) — low (peer 25th pctile) | 35.4x | 87,296 | ₹491 | −24% |
| EV/EBIT (LTM) — high (peer median) | 44.8x | 110,477 | ₹644 | −0% |
| NTM EV/EBITDA — low | 18.0x | 103,263 | ₹596 | −8% |
| NTM EV/EBITDA — high | 21.0x | 120,474 | ₹710 | +10% |

**Warranted implied range: ₹491 – ₹714 per share, midpoint ~₹603 (≈ −7% vs the ₹646.15 price).** The range clusters: the EBITDA-based lines (LTM and NTM) bracket **₹591–₹714**, while the EBIT-based line — the one that captures HCG's worst quality gap — pulls the low end down to **₹491**. The implied read is HCG trading **roughly at-to-slightly-above** its warranted peer value, with the downside skew coming from the profit-conversion metrics. (Memo cross-check: Capital IQ's own "Implied Valuation" sheet, which applies *full* peer medians with no quality adjustment, lands at a mean-across-multiples of **$7.67/share ≈ ₹726** and a median of **$7.67**, but its per-multiple outputs span $4.16 on NTM P/E to $10.5 on EV/EBITDA — confirming the same instability; the unadjusted CIQ mean sits ~12% above price, the quality-adjusted read sits ~7% below.)

---

## 6. Relative Read

Versus its listed hospital peers, HCG screens **cheap on EV/EBITDA (−32%) and EV/Sales (−43%) but parity-to-premium on EV/EBIT (+9%) and NTM P/E (+64%)** — and that gap is **warranted**, not an opportunity: HCG has the lowest margins, highest leverage, weakest credit health, and a sub-cost-of-capital return on capital in the set, so it deserves to trade below higher-quality names and its EBITDA discount evaporates the moment you look at profit. The warranted peer-multiple value is **₹491–₹714 (midpoint ~₹603), about −7% versus ₹646.15** — i.e., HCG is approximately **fairly valued to modestly rich** relative to peers once quality is accounted for, with explicit **value-trap risk** on anyone buying the headline EV/EBITDA discount. The single largest data limitation: the two true pure-play oncology rivals (private AOI, Apollo's undisclosed oncology vertical) carry no public multiples, so this read benchmarks HCG against *multi-specialty* hospitals, not against *oncology* economics.

---

*Out-of-scope guardrail: this report produces relative-value levels and the warranted-multiple judgement only. It does not assign scenario probabilities, compute a probability-weighted target, state risk/reward, or issue a rating — those belong to `07_scenario-and-fair-value` and the master synthesizer.*
