# Relative Valuation — Peers — BG

**Company:** Bunge Global SA (NYSE: BG). **Reporting currency:** US$ (millions unless a per-share or multiple basis is stated). **Date:** 2026-06-01. **Business type:** commodity/cyclical operating company (agri-commodity oilseed processor/merchandiser) — per `01_price-and-capital-structure` and `00_valuation-data-triage`. Per the Business-Type Method Map, **EV-based multiples (EV/EBITDA, EV/EBIT, EV/Sales) and P/E are the valid relative metrics**, applied on **normalized/forward** rather than single-point trailing earnings because the business is cyclical and GAAP earnings carry large mark-to-market timing swings.

> **Two caps bind this report, stated up front.**
> 1. **No peer/comps export in the data pool.** Triage confirmed the pool's `Multiples.xlsx` contains **only Bunge's own** forward multiples — no ADM, Cargill, Louis Dreyfus, Wilmar rows, and no Capital IQ peer comps file [Capital IQ Multiples export "Bunge Global SA (NYSE:BG) > Capital IQ Estimates > Multiples", data as of 2026-05-09]. **Per `MODULE_RULES.md` no-peer-data rule, Overall usefulness is capped at 70.** Every peer multiple below is **web-sourced, dated, and labeled unverified**, and is treated as comparable-justified, low-confidence — not pool-grade.
> 2. **No pool-sourced current price.** The BG price ($123.35) is the indicative, web-sourced anchor from `01` (MarketBeat close 2026-05-29). Premium/discount percentages below inherit that caveat. The no-price caps (margin of safety "Not assessable"; valuation confidence ≤55) are owned by `01`/`07`/`99` and propagate.
>
> The peer set is **named directly in the audited 10-K** (Level 5), so the *names* are not self-selected; only the *multiples* attached to them are web-sourced.

---

## 1. Peer Set

The peer names come from `business-model/08_competitive-map.md`, which extracted them from the audited 10-K's segment-level "Key Competitors" disclosure — **not self-selected**. Bunge's dominant segment (Soybean Processing & Refining, 51.6% of FY25 net sales, 52.6% of segment EBIT) is benchmarked here; the relevant rivals are the "ABCD" oilseed/grain complex.

| Peer | Ticker | Why Comparable | Source of Inclusion |
|---|---|---|---|
| Archer Daniels Midland | NYSE: ADM | Most directly comparable **public** oilseed processor-trader; competes head-to-head in all four BG segments (soybean crush, refined oils, protein meal, grain merchandising); FY25 revenue ~$80.3bn ≈ 1.1x BG's $70.3bn — closest peer in scale and mix | competitive-map §2 (named in FY25 10-K, Item 1, p.3, lines 307–309 — Level 5) |
| Wilmar International | SGX: F34 | **Public** secondary rival named in the 10-K; Asia-Pacific palm/oilseed-weighted processor-trader; FY25 sales ~US$70.4bn ≈ 1.0x BG. Different geographic/feedstock mix (palm-heavy), so a partial comparable used as a second public reference point | competitive-map §2 / §4 (named in FY25 10-K, line 308 — Level 5) |
| Cargill Incorporated | Private (US) | Largest named rival, FY25 revenue ~$154bn; overlaps soybean crush + grain. **No public multiples** — private, family/employee-owned, discloses no segment economics | competitive-map §2 (named in FY25 10-K, line 307 — Level 5) |
| Louis Dreyfus Company | Private (Netherlands) | Closest **pure-play** oilseed/grain-trader by business mix; FY25 net sales $53.2bn, EBITDA $1.83bn. **No public equity multiples** — private; files only limited financials | competitive-map §2 (named in FY25 10-K, line 307 — Level 5) |

**Comparability set used for the multiple table:** **ADM (primary) and Wilmar (secondary)** — the only two named rivals with public, traded equity multiples. **Cargill and Louis Dreyfus are flagged as private peers with no public multiples and are NOT guessed** (per the self-check rule). The effective public comp set is therefore narrow (n=2), which is itself a limitation: a two-stock "median" is really a two-point read, and ADM (US soybean/corn) is a far cleaner mix-match than Wilmar (Asia palm). Weight ADM most.

---

## 2. Peer Multiples & Operating Stats

**Bases stated (do not mix):** BG's own multiples are shown two ways — (a) **on the `01` anchor** (price $123.35, EV $39,078M, FY26E consensus metrics) for like-for-like internal consistency, and (b) the **Capital IQ Multiples export** figures (data as of 2026-05-09, on the export's own price $124.94 and CapIQ TEV) as a pool-sourced cross-check. Peer figures are **web-sourced (unverified)** and are predominantly **trailing/LTM** as reported by the source, except forward P/E which is labeled NTM/forward. For a cyclical, **forward P/E and forward EV/EBITDA are the comparable metrics**; trailing P/E is distorted by where each name sits in the crush cycle (ADM's trailing P/E of ~35x reflects a trough-earnings denominator, not richness — see §4).

| Company | P/E (fwd) | P/E (ttm) | EV/EBITDA | EV/EBIT | EV/Sales | FCF Yield | Rev Growth | EBITDA Margin | ROIC | Net Debt/EBITDA | Data As-of |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| **BG — on `01` anchor** | **13.1x** | 25.1x (GAAP)¹ | **9.8x** | **12.9x** | **0.43x** | neg. (n.m.)² | n.m.³ | 3.18%⁴ | 6.7% hd / 8% adj⁵ | 4.5x adj / 5.8x GAAP⁶ | BG: anchor + FY26E consensus |
| BG — CapIQ Multiples (memo) | 12.3x (NTM) / 13.25x (FY26) | — | 9.52x (NTM) / 10.07x (FY26) | 12.55x (NTM) / 13.31x (FY26) | 0.44x | — | — | — | — | — | CapIQ Multiples export, 2026-05-09 |
| ADM | 15.0x | 35.7x | 13.9x–19.1x⁷ | n.m.⁸ | 0.60x | 12.5% | +1.3% (5Y fc) | 3.15% | 3.78% | ~3.0x⁹ | Web, 2026-05-29/06-01 (unverified) |
| Wilmar (F34) | 11.7x | 12.4x | 9.7x | n.m. | 0.58x | 7.4% | ~+4%¹⁰ | 5.30% | 4.13% | n.m.¹¹ | Web, 2026-05-29 (unverified) |
| Cargill (private) | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | No public multiples |
| Louis Dreyfus (private) | n/a | n/a | n/a | n/a | n/a | n/a | n/a | ~3.4% (EBITDA)¹² | n/a | n/a | No public equity multiples |
| **Public-peer median (ADM, Wilmar)** | **13.4x** | 24.1x | **~12.4x**¹³ | n.m. | **0.59x** | 9.9% | — | 4.2% | 3.96% | — | — |
| **Public-peer mean (ADM, Wilmar)** | 13.4x | 24.1x | ~13.3x | n.m. | 0.59x | 9.9% | — | 4.2% | 3.96% | — | — |

**Footnotes / sourcing:**
1. BG trailing GAAP P/E = $123.35 / $4.91 FY25 GAAP diluted EPS = 25.1x [earnings/01 §1]. On TTM GAAP EPS $3.78 it is 32.6x; on **adjusted** FY25 EPS $7.57 it is 16.3x; on TTM adjusted EPS (≈$8.40) it is ~14.7x. GAAP trailing is distorted by mark-to-market timing — treat forward as the comparable basis [earnings/01 §4].
2. BG TTM FCF = **−$1,161M** (CFO $588M − capex $1,749M) → trailing FCF yield is **negative/not meaningful**; the negative is Viterra-driven (CFO collapse + elevated capex), so it is a transition-period figure, not a steady-state one [earnings/01 §2].
3. Revenue growth is **not meaningful** as a quality signal: FY25 +32.4% and TTM +56.9% are almost entirely the mid-2025 Viterra consolidation, not organic [earnings/01 §1, §6]. Consensus models FY26 revenue ~$91.5bn (≈+13% on FY25, again partly the first full Viterra year) [earnings/04 §4].
4. BG EBITDA margin = FY25 GAAP-built EBITDA $2,236M / net sales $70,329M = 3.18% [earnings/01 §1]. On FY26E consensus ($3,997M EBITDA / $91,485M revenue) the **forward** EBITDA margin is ~4.4% [earnings/04 §3].
5. BG ROIC: company headline **6.7%**, adjusted **8%** (strips Viterra construction-in-progress not yet earning); computed ~5.1% on average invested capital. Headline sits **below** BG's own 7.2% cost of equity [business-model/09_moat §3; Q1 FY26 call, lines 190–192].
6. BG Net debt/EBITDA: 4.5x on TTM adjusted EBITDA, 5.8x on TTM GAAP-built EBITDA, 6.1x on FY25 GAAP-built [`01` §5]. Basis-dependent; choose explicitly.
7. ADM EV/EBITDA shows wide source dispersion — 13.9x (LTM, stockanalysis), 14.2x–14.4x (GuruFocus, May 2026), up to 19.1x (stockanalysis "EV/EBITDA" headline). The spread is because the EBITDA denominator is a **trough** number; the 19.1x headline is on the most depressed LTM EBITDA. Mid of the cleaner LTM reads ≈ **14x** [Web: stockanalysis.com/stocks/adm, gurufocus.com, 2026-05-29/06-01 (unverified)].
8. ADM/Wilmar EV/EBIT not cleanly published by the free sources; left n.m. rather than guessed.
9. ADM net debt ≈ total debt $10.66bn − cash $0.624bn ≈ **$10.0bn**; on LTM EBITDA ~$3.4bn ≈ ~3.0x. (stockanalysis labels this "−$10.03bn"; the negative sign is a site convention — ADM is **net-debt**, not net-cash. Read as ~$10bn net debt.) [Web: stockanalysis.com/stocks/adm/statistics, 2026-06-01 (unverified)].
10. Wilmar FY25 sales US$70.4bn vs US$67.4bn prior ≈ **+4.4%**; net income US$1.41bn vs US$1.17bn [Web: simplywall.st Wilmar news, 2026 (unverified)].
11. Wilmar net debt is large in absolute terms (debt ~S$39bn vs cash ~S$12bn) but EBITDA-relative leverage not cleanly published free; left n.m. (Again, the source's "−S$25.76bn net debt" sign convention indicates net **debt**, not net cash.)
12. Louis Dreyfus: FY25 EBITDA $1.83bn / net sales $53.2bn ≈ **3.4% EBITDA margin** — an EBITDA-margin datapoint only, no equity multiple [Web: ldc.com press release 2026-03-18 (unverified); competitive-map §2].
13. **Public-peer median EV/EBITDA uses ADM at the cleaner ~14x LTM read** (not the 19.1x headline) and Wilmar 9.7x → median/mean ≈ 11.9x–12.4x. If ADM's 19.1x headline is used instead, the peer median rises to ~14.4x. **The EV/EBITDA peer median is therefore unstable (~12x–14x) and low-confidence** — flagged, not averaged silently.

**Banks/REIT note:** not applicable — BG is an operating/commodity business, so P/tangible-book (banks) and P/FFO·P/NAV (REITs) are correctly excluded per the Business-Type Method Map. P/B is shown only as a memo because asset-heavy processors are sometimes screened on it; it is not a primary metric for a spread business.

---

## 3. Premium / Discount to Peer Median

Premium/(discount) = (BG multiple − peer median) / peer median. BG figures on the `01` anchor (forward basis where the multiple is forward). Peer median = ADM + Wilmar (n=2). **All percentages inherit the no-pool-price and web-sourced-peer caveats.**

| Multiple | BG (anchor) | Public-Peer Median | Premium / (Discount) | Note |
|---|---:|---:|---:|---|
| P/E (forward) | 13.1x | 13.4x | **−2%** (in line) | The cleanest cyclical comparator; BG ≈ peers |
| P/E (trailing, GAAP) | 25.1x | 24.1x | +4% | Both distorted by trough/MTM earnings — not decision-relevant |
| EV/EBITDA (fwd/LTM) | 9.8x | ~12.4x (range 11.9–14.4) | **−21%** (discount) | BG forward 9.8x vs a noisy peer ~12.4x; discount real but denominator-sensitive |
| EV/Sales | 0.43x | 0.59x | **−27%** (discount) | BG thinner-margin mix → lower EV/Sales is partly warranted |
| FCF Yield | neg. (n.m.) | 9.9% | n.m. | BG's negative TTM FCF (Viterra transition) cannot be compared cleanly |
| P/B (memo) | 1.50x | ~1.20x¹ | +25% | BG above peer book multiple — note ADM 1.69x, Wilmar 0.70x straddle widely |

¹ P/B peer median = ADM 1.69x and Wilmar 0.70x → median/mean ≈ 1.20x; the two straddle BG's 1.50x widely, so this comparison is low-information.

**Read of the table:** on the **forward P/E** — the single most comparable metric for a cyclical processor — BG trades essentially **in line** with its public peers (13.1x vs 13.4x, −2%). On **EV/EBITDA and EV/Sales**, BG screens at a **~20–27% discount**, but both gaps are partly explained by BG's thinner margins and the unstable peer EBITDA denominator. There is no clean, large, unexplained discount across all metrics.

---

## 4. Is the Gap Warranted?

**Conclusion: the EV/EBITDA and EV/Sales discounts are largely warranted; on forward P/E the stock is fairly valued versus peers — there is no proven, large relative-upside gap.**

Evidence: (1) **Margins** — BG's FY25 EBITDA margin (3.18% GAAP-built; ~4.4% forward) sits between ADM (3.15%) and Wilmar (5.30%); BG is **not** a higher-margin operator that deserves a premium, so a lower EV/Sales than the higher-margin Wilmar is appropriate [earnings/01 §1; business-model/07 §1]. (2) **Moat/returns** — business-model rates BG a **narrow moat** whose scale is *shared* with ADM/Cargill/Louis Dreyfus, and BG's headline ROIC of 6.7% sits **below** its 7.2% cost of equity; ADM's ROIC (3.78%) and Wilmar's (4.13%) are also sub-par, so the **whole group earns below-cost-of-capital returns** and none deserves a quality premium — this is a structurally low-quality, low-return industry [business-model/09_moat §3, §5]. (3) **Leverage** — BG's net debt/EBITDA of ~4.5x (adj) to ~5.8x (GAAP) is **higher than ADM's ~3.0x**, a direct reason BG should trade at *some* EV/EBITDA discount: more of the enterprise value is debt-funded and the post-Viterra balance sheet is mid-integration with negative TTM FCF [`01` §5; earnings/01 §2]. (4) **Cyclicality** — all four names are crush-spread cyclicals; BG's GAAP EPS swung ~5x across FY25 quarters, so the forward (not trailing) P/E in-line read is the honest one [business-model/07 §1]. The one factor that argues *against* too deep a discount: the July 2025 Viterra deal removed an independent ABCD competitor and BG's adjusted earnings/EBITDA estimates have been revised up (FY26E EBITDA +9% over three months, EPS +16%) — a margin-led upgrade the Street has already moved to meet [earnings/04 §4]. Net: BG's EV/EBITDA discount to ADM is **mostly explained by higher leverage and the noisy peer denominator**, not by a market mistake; the forward P/E says the equity is priced roughly with the group.

**Value-trap flag:** a low EV/Sales (0.43x) on a 3% EBITDA-margin spread business is normal, not a signal — do not read the EV/Sales discount as upside.

---

## 5. Implied Value from Peer Multiples

Method: apply the **warranted** peer multiple (public-peer median, adjusted for BG's higher leverage and equivalent-to-slightly-thinner margins) to BG's corresponding metric, then bridge EV→equity using the `01` anchor (net debt $13,714M; NCI+redeemable NCI $1,432M; per-share on **195,733,665** diluted shares). FY26E metrics from consensus [earnings/04]: EBITDA $3,997M, EBIT $3,025M, revenue $91,485M, adj. EPS $9.43. **Quality adjustment applied: −10% to −15% haircut to the peer EV/EBITDA median** for BG's higher leverage (~4.5–5.8x vs ADM ~3.0x) and mid-integration FCF, and the EV/Sales and P/E lenses are weighted down because EV/Sales is margin-driven (low-information here) and the peer median is only two stocks.

| Multiple | Applied Peer Multiple (quality-adjusted) | BG Metric | Implied EV (US$M) | Implied Equity (US$M) | Implied Price/Share | vs Current ($123.35) |
|---|---:|---:|---:|---:|---:|---:|
| EV/EBITDA (primary) | 10.5x–12.0x (peer ~12.4x median, −10% to −15% haircut; floored near BG's own 9.8–10x) | $3,997M FY26E | 41,969–47,964 | 28,255–34,250¹ | **$144–$175** | +17% to +42% |
| EV/EBITDA (conservative) | 9.8x (no re-rating — BG's own current forward multiple held) | $3,997M FY26E | 39,171 | 25,457 | **$130** | +5% |
| P/E (forward) | 13.4x (peer median, no premium — quality justifies none) | $9.43 FY26E adj EPS | — | — | **$126** | +2% |
| EV/Sales (low-weight check) | 0.55x (peer ~0.59x, −7% for thinner margin) | $91,485M FY26E | 50,317 | 36,603 | **$187**² | +52% |

¹ Equity bridge: Implied equity = Implied EV − net debt $13,714M − NCI/redeemable NCI $1,432M (= −$15,146M total). Implied price = implied equity ÷ 195,733,665 shares. Example (mid EV/EBITDA, 11.25x): EV = 11.25 × 3,997 = $44,966M; equity = 44,966 − 15,146 = $29,820M; ÷195.73M = $152/sh.
² **EV/Sales implied value ($187) is an outlier and is down-weighted, not blended in** — it assumes BG's thin-margin sales deserve the same EV/Sales as higher-margin Wilmar, which §4 shows is not warranted. Shown for completeness only; it would inflate the range and is excluded from the headline.

**Implied value RANGE from peer multiples (excluding the EV/Sales outlier, leaning on the leverage-adjusted EV/EBITDA and forward-P/E lenses):**

> **≈ $126 – $155 per share**, center ~$135–140.
> - Low end (~$126–130): forward P/E at the peer median and EV/EBITDA at BG's *own* current forward multiple — i.e., **no re-rating** — which §4 says is the defensible base because the discount is mostly warranted.
> - High end (~$155): EV/EBITDA partially closing toward the (noisy) peer median after the leverage haircut.
> Versus the indicative $123.35, this implies roughly **+2% to +26%**, center ~+10–13% — but the **observed up/downside is caveated** because the price is web-sourced (not pool-grade), per `01`/`07`.

**Why the range is wide and low-confidence:** the peer EV/EBITDA "median" swings from ~12x to ~14x depending on which ADM source is used (trough-EBITDA denominator), the public comp set is only two stocks, and all peer multiples are web-sourced/unverified. The forward-P/E lens (in-line, ~$126) is the most reliable single read; the EV/EBITDA lens adds the upside case but on a shaky denominator.

---

## 6. Relative Read

On the cleanest cyclical metric — **forward P/E — Bunge trades in line with its public peers (13.1x vs a ~13.4x ADM/Wilmar median, −2%)**, so on an earnings basis the equity is not meaningfully cheap or rich versus the group. On **EV/EBITDA and EV/Sales, BG screens at a ~20–27% discount**, but that gap is **mostly warranted** — BG carries higher leverage (~4.5–5.8x net debt/EBITDA vs ADM ~3.0x), equivalent-to-thinner margins (3–4% EBITDA), a narrow moat shared with the same rivals, and sub-cost-of-capital returns that the entire ABCD group earns. Applying leverage-adjusted peer multiples implies a fair-value range of **≈ $126–$155/share (center ~$135–140)**, roughly +2% to +26% above the indicative ~$123 price; the read is **low-confidence** because there is no peer comps export in the pool (Overall usefulness capped at 70), the public comp set is only two web-sourced names, and the peer EV/EBITDA denominator is trough-distorted.

---

### Self-Check
- [x] Peer set named with a reason per peer; source stated (competitive-map / FY25 10-K Level 5 — **not** self-selected).
- [x] Private peers (Cargill, Louis Dreyfus) flagged as having no public multiples — **not guessed**.
- [x] Every multiple has a source and as-of date; all peer figures labeled web-sourced/unverified; BG's CapIQ figures dated 2026-05-09.
- [x] Peer median computed (n=2), with explicit flag that EV/EBITDA median is unstable (~12–14x) and which ADM source was used.
- [x] Premium/discount expressed as a % on each multiple.
- [x] Warranted-gap judgement cites margins, moat, leverage, ROIC, cyclicality — does not assume parity.
- [x] Implied value is a RANGE with the quality adjustment (−10% to −15% EV/EBITDA leverage haircut; EV/Sales outlier excluded) shown.
- [x] No-peer cap (usefulness ≤70) and no-pool-price caveat applied and propagated.
- [x] Banned phrases avoided (no bare "cheap/expensive/undervalued"; discounts and premiums are quantified with the warranted-vs-observed test).
