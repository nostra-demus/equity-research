# Relative Valuation — Peers — HAIER

**Anchor (from `01_price-and-capital-structure.md`, verbatim):** Current price CNY 21.75 (A-shares, SHSE:600690, last close 2026-08-12, `pool-verified`). Market cap CNY 190,093.3m. EV (broad cash basis, canonical) CNY 175,100.7m. Net debt (broad, canonical) CNY −24,598.7m (net cash). Diluted weighted-average shares (per-share fair-value basis) 9,311.825848m. Minority interest CNY 9,606.03m. All figures in RMB (CNY) unless a peer figure is shown in USD (Capital IQ comp export currency) or the peer is priced in its own local currency and flagged.

Every multiple in this report is on an **LTM (trailing twelve months)** basis unless explicitly marked NTM/forward — this matches the basis of the peer comp export.

## 1. Peer Set

| Peer | Ticker | Why Comparable | Source of Inclusion |
|---|---|---|---|
| Midea Group Co., Ltd. | SZSE:000333 | Larger, more diversified Chinese appliance conglomerate (adds robotics/building tech); direct product overlap with Haier's dominant refrigerator/kitchen-appliance segment plus air conditioning and laundry; ~1.55x Haier's revenue | `business-model/08_competitive-map.md` §2, Competitor A — third-party-named (Whirlpool 2026 Form 10-K), corroborated by inclusion in Haier's own Capital IQ comparable-company set |
| Gree Electric Appliances, Inc. of Zhuhai | SZSE:000651 | China's #1/#2 domestic air-conditioner brand; product line also includes refrigerators, washing machines, and kitchen appliances (partial segment fit — AC is Gree's core, not Haier's dominant segment); ~0.58x Haier's revenue | `business-model/08_competitive-map.md` §2, Competitor B — third-party-named (AB Electrolux 10-K), corroborated by inclusion in Haier's own Capital IQ comparable-company set |
| Whirlpool Corporation | NYSE:WHR | Most scale-comparable non-Chinese peer (~0.35x Haier's revenue, at the outer edge of but within the ~5x comparable-scale threshold); direct North America rivalry via Haier's GE Appliances brand | `business-model/08_competitive-map.md` §2, Competitor C — third-party-named (AB Electrolux 10-K) |

**Source of the set:** all three peers come from `business-model/08_competitive-map.md`, which itself sourced them from the Capital IQ third-party competitor-relationship export (Haier's own Chinese-language annual report discusses competitive rank only in relative terms — "行业第二" — without naming rivals in the text reviewed, so this is a third-party-named, not company-named, set — flagged as such in the upstream module). This report does not need to self-select a peer set; competitive-map's set is used as-is.

**Peers considered and excluded from the primary table:**
- **BSH Hausgeräte (Bosch/Siemens)** — a comparably large global rival named in the same Capital IQ export, but privately held as a subsidiary of Robert Bosch GmbH. No public multiples exist. Excluded, not guessed.
- **AB Electrolux (publ) (OM:ELUX B)** — a credible, comparably scaled competitor (LTM revenue $13.5bn) that competitive-map considered but did not profile as a named peer. No multiples were sourced for it in this report (to keep the primary set to competitive-map's three named names); its FY2025 operating margin (2.8%, Web-sourced as of 2026-01-30, unverified, per `08_competitive-map.md` §5) is used only as directional context in §4 below, not in the comp table or the peer median.

**Data-pool coverage gap:** the Capital IQ "Company Comparable Analysis" workbook in the pool carries full trading multiples and operating statistics for Midea and Gree (both also appear in CapIQ's own default China-appliance comp set) but does **not** cover Whirlpool (a US-listed name outside CapIQ's default China-peer template). Whirlpool's multiples in §2 below are therefore **Web-sourced as of 2026-08-12, unverified** (stockanalysis.com), per the partial-data rule. This is a genuine, flagged gap on one of three named peers, not a self-selection issue.

## 2. Peer Multiples & Operating Stats

All CapIQ-sourced figures: `Company Comparable Analysis Haier Smart Home Co Ltd .xls`, tabs "Trading Multiples," "Operating Statistics," and "Financial Data," As-Of Date 2026-08-12 (Excel serial 46246), currency USD, "Values converted at today's spot rate." All Whirlpool figures: Web-sourced as of 2026-08-12 (stockanalysis.com), unverified, converted from the site's reported P/E, EV/EBITDA, EV/EBIT, P/S and revenue figures (EV/Sales and Net Debt/EBITDA computed by this agent from the site's EV, revenue, and EBITDA figures — shown below).

| Company | P/E (LTM) | EV/EBITDA (LTM) | EV/EBIT (LTM) | EV/Sales (LTM) | FCF Yield | Rev Growth (LTM YoY) | EBITDA Margin (LTM) | ROIC | Net Debt/EBITDA | Data As-of |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| **Haier (600690)** | 10.8x | 6.3x | 8.5x | 0.6x | 8.52% | +1.25% | 8.7% | 7.56% (LTM Mar-2026) | −0.95x (net cash) | 2026-08-12 |
| Midea (000333) | 14.5x | 11.2x | 13.6x | 1.3x | 6.63% | +7.19% | 11.5% | Not disclosed | −0.72x (net cash) | 2026-08-12 |
| Gree (000651) | 7.7x | 4.2x | 5.0x | 0.9x | 18.57% | −11.53% | 20.2% | Not disclosed | −2.32x (net cash) | 2026-08-12 |
| Whirlpool (WHR) | 14.95x | 9.71x | 15.26x | 0.62x | −11.78% | −3.88% | 6.63% | Not confirmed | +6.89x (levered) | 2026-08-12, Web-sourced, unverified |
| **Peer median (n=3)** | **14.5x** | **9.71x** | **13.6x** | **0.9x** | **6.63%** | **−3.88%** | **11.5%** | **n/a — no peer disclosed** | **−0.72x** | — |

**Sources for computed peer cells:** Haier FCF yield = LTM FCF (CNY16,192.6m, `earnings/01_historical-financials.md` §2) ÷ market cap (CNY190,093.3m, `01`) = 8.52%. Haier Rev growth and EBITDA margin: CapIQ Operating Statistics tab, Haier row (0.0125, 0.087). Haier ROIC: `business-model/09_moat.md` §3, Capital IQ "Return on Capital %," LTM ended Mar-2026 (7.56%). Haier Net Debt/EBITDA: `01_price-and-capital-structure.md` §5, broad basis, canonical (−0.95x). Whirlpool EV/Sales = EV $9.61bn ÷ FY2025 revenue $15,524m = 0.619x [stockanalysis.com, WHR statistics + financials pages, 2026-08-12]. Whirlpool Net Debt/EBITDA: EBITDA implied from EV/EBITDA (9.61bn ÷ 9.71 ≈ $989.7m); Net debt = EV − Market cap = $9.61bn − $2.79bn ≈ $6.82bn; ND/EBITDA ≈ 6.89x [same source]. Whirlpool Rev growth = TTM (ended Jun-2026) −3.88% YoY [stockanalysis.com, WHR financials page, 2026-08-12]. Whirlpool EBITDA margin = implied EBITDA $989.7m ÷ TTM revenue $14,921m = 6.63%.

**Context cross-check (not the primary comp set):** CapIQ's own broader "default comps" template for Haier includes 10 China-listed appliance/durables names (Midea, Gree, plus Hisense Home Appliances, Hangzhou Robam, Zhejiang Supor, Hefei Snowky, Zhejiang Yayi, Ecovacs Robotics, Joyoung, Guangdong Xinbao) — several of these (Ecovacs = robotic vacuums, Joyoung/Snowky/Xinbao = small kitchen appliances, Yayi = specialty metals) are not confirmed business-fit peers per competitive-map's segment-overlap test, so this broader set is shown only as a corroborating sanity check, not the primary table. Its median (LTM basis, same As-Of Date): EV/Sales 1.0x, EV/EBITDA 9.6x, EV/EBIT 12.4x, P/E 14.5x, EBITDA margin 10.6%. This broad-set EV/EBITDA median (9.6x) sits within 1% of the named 3-peer median (9.71x) — the small named-peer sample is corroborated by the larger, less-curated CapIQ set, which increases confidence in the peer benchmark despite n=3 in the primary table.

## 3. Premium / Discount to Peer Median

| Multiple | Haier | Peer Median | Premium / (Discount) |
|---|---:|---:|---:|
| P/E (LTM) | 10.8x | 14.5x | **(25.5%)** discount |
| EV/EBITDA (LTM) | 6.3x | 9.71x | **(35.1%)** discount |
| EV/EBIT (LTM) | 8.5x | 13.6x | **(37.5%)** discount |
| EV/Sales (LTM) | 0.6x | 0.9x | **(33.3%)** discount |
| FCF Yield (inverted reading — higher yield = cheaper) | 8.52% | 6.63% | Haier's yield is 28.5% above peer median → **discount** (not a premium; a higher yield is a lower price for the same cash) |

Formula (price multiples): `(Haier multiple − peer median) / peer median`. Formula (FCF yield, inverted per module rule): same arithmetic, but a positive result on a yield metric reads as a **discount**, since Haier is paying less per unit of cash flow than the peer median implies. All five multiples read the same direction: Haier trades at a **discount to the peer median on every measured basis**, by roughly 25–38% on the four price multiples and consistently on the yield check.

**Is the gap typical or unusual? Not assessable.** No peer-multiple time series exists in the data pool — the Capital IQ comp export is a single snapshot dated 2026-08-12, and `valuation/02_multiples-own-history.md` (which would carry Haier's own 3-year multiple band for this comparison) has not been produced in this run. This report cannot say whether the current 25–38% discount is wider, narrower, or in line with Haier's typical relationship to Midea/Gree/Whirlpool over the past ~3 years — that is a real gap, not an assumption. Downstream (`07`), this should be treated as a point-in-time reading only.

## 4. Is the Gap Warranted?

The discount is **largely warranted** on the evidence, though the quality-adjusted math in §5 leaves only a small residual gap once that evidence is priced in. Haier's LTM EBIT margin (6.9%) sits below both Midea (9.8%) and Gree (17.4%) on the identical Capital IQ basis, and its EBITDA margin (8.7%) is 24% below the peer median (11.5%) — the moat module independently found the same ordering and called the moat "narrow" and "eroding": Return on capital cleared an estimated cost of capital (7.56% LTM ROIC vs an inferred ≈3.9–4.8% WACC) but has fallen for two straight readings from a 9.12% FY2024 peak, and gross margin fell 460bp (30.9%→26.3%) over five years, a trend the company itself ties to commodity cost pressure it could not fully pass through [`business-model/09_moat.md` §5; `business-model/07_business-quality.md` §4]. Business quality scored 42/100 (weak, upper end), driven by the lowest-scoring rows — commodity dependence 18/100 (raw materials 84% of segment COGS) and competitive intensity 24/100 ("one of the most crowded consumer-durables categories globally") [`business-model/07_business-quality.md` §1–2]. Against that, Haier's balance sheet is the strongest of the three disclosed (net cash −0.95x EBITDA, versus Whirlpool's +6.89x levered position — Whirlpool's own elevated P/E (14.95x) likely reflects earnings depressed by that leverage and a negative FCF yield (−11.78%), not a genuine premium, which weakens Whirlpool's reliability as a peer anchor). One peer-set anomaly to flag: Gree, with by far the best margins in the set (17.4% EBIT), trades at the **lowest** P/E (7.7x) and EV/EBITDA (4.2x) of the three — a pattern inconsistent with pure quality-based pricing and suggestive of a broader China-appliance-sector multiple compression that is not specific to Haier's own fundamentals. **Conclusion: discount is warranted** — the margin, moat-trajectory, and cyclicality evidence supports Haier trading below the peer median, and the quality-adjusted implied value in §5 shows the raw 25–38% discount is mostly, not fully, explained by the fundamental quality gap.

## 5. Implied Value from Peer Multiples

**Basis matching:** all multiples below are LTM (trailing), applied to Haier's own LTM metric (LTM ended Mar-31-2026, from `earnings/01_historical-financials.md` §2) — trailing-to-trailing throughout, consistent with §16 Calculation Standard 4.

**Equity bridge used for every EV-based row** (from `01_price-and-capital-structure.md`, broad/canonical basis): `Implied Equity = Implied EV − Net Debt(broad, −24,598.67) − Minority Interest (9,606.03) = Implied EV + 14,992.64` (CNY m). Divided by 9,311.825848m diluted weighted-average shares (per-share fair-value count per `01`).

**Quality adjustment (base case):** Haier's LTM EBITDA margin (8.7%) sits at 0.7565x the peer median (11.5%) — a 24% relative shortfall directly evidenced by the moat/business-quality findings in §4 (bottom-of-peer-set margins, eroding trend, high commodity/competitive exposure). This ratio is applied as a haircut to the peer median EV/EBITDA multiple: `9.71x × (8.7% / 11.5%) = 7.35x`. This is this agent's own method — *Inference, not from filings* — chosen because EV/EBITDA (unlike EV/Sales or P/E) does not already normalize for margin differences, so a persistent, evidenced margin shortfall is applied directly as a multiple discount.

| Multiple | Applied Multiple | Basis | Implied EV or Equity (CNY m) | Implied Price/Share (CNY) | vs Current Price (21.75) |
|---|---:|---|---:|---:|---:|
| **EV/EBITDA — quality-adjusted (BASE CASE)** | 7.35x | LTM EBITDA 25,950.2 | EV 190,626 → Equity 205,618 | **CNY 22.08** | **+1.5%** |
| EV/EBITDA — peer median, unadjusted | 9.71x | LTM EBITDA 25,950.2 | EV 251,976 → Equity 266,969 | CNY 28.67 | +31.8% |
| EV/EBIT — peer median, unadjusted | 13.6x | LTM EBIT 20,385.9 | EV 277,248 → Equity 292,241 | CNY 31.38 | +44.3% |
| EV/Sales — peer median, unadjusted | 0.9x | LTM Revenue 296,915.3 | EV 267,224 → Equity 282,216 | CNY 30.31 | +39.3% |
| P/E — peer median, unadjusted | 14.5x | LTM diluted EPS 2.01 | — (direct per-share) | CNY 29.15 | +34.0% |
| FCF yield — peer median as cap rate | 6.63% | LTM FCF/share 1.739 | — (direct per-share) | CNY 26.23 | +20.6% |

**Reading the table:** applying the full, unadjusted peer median to Haier's own metrics (rows 2–6) implies CNY 26.2–31.4/share, +20.6% to +44.3% above the current CNY 21.75 — this is the mechanical consequence of the discount documented in §3 and should NOT be read as the base case, since §4 found most of that discount fundamentally warranted. The quality-adjusted EV/EBITDA point (row 1) is the base case this report carries forward: **CNY 22.08/share, +1.5% versus the current price** — essentially a "gap mostly closed by the fundamentals" result, with the unadjusted-multiple rows shown as the separate dispersion range (CNY 26.2–31.4) to make clear how much of the raw discount is quality-driven versus how much residual gap (if any) remains for other methods (`04` DCF, `07` triangulation) to arbitrate.

## 6. Relative Read

Haier trades at a 25–38% discount to its three named peers' median on every price multiple (P/E, EV/EBITDA, EV/EBIT, EV/Sales) and on an inverted FCF-yield check, as of the 2026-08-12 comp snapshot. Most of that gap is warranted: Haier's EBITDA margin runs 24% below the peer median, its moat is independently rated "narrow" and "eroding" (ROIC down for two straight years from a subsidy-assisted 2024 peak), and it carries the heaviest commodity and competitive-intensity exposure in the set — offset only partly by the strongest balance sheet of the three (net cash, versus Whirlpool's ~6.9x levered position). Once that margin gap is priced into the peer EV/EBITDA multiple (7.35x vs the peer median 9.71x), the implied base-case value is CNY 22.08/share, only 1.5% above the current CNY 21.75 — the raw discount is mostly explained by fundamentals, not a clean mispricing; the wider CNY 26.2–31.4/share range shown by the unadjusted multiples is the ceiling if Haier's margin and moat trajectory were to fully stabilize toward the peer median, which the evidence here does not yet support.
