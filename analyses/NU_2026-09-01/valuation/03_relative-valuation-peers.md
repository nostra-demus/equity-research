# Relative Valuation — Peers — NU

NU reports under IFRS Accounting Standards in USD. The decision line is the Class A ordinary share, `NU · NYSE · USD`, at US$14.30 on 29 August 2026. NU is a deposit-taking financial institution, so this report values equity with P/TBV and P/E rather than EV-based multiples; enterprise value, EBITDA and FCF yield are not useful primary bank measures. [data/NU/Nu Holdings Ltd — H1 FY2026 reviewed interim financial statements, Note 31; ciq_facts.json, `current_price` = US$14.30, source ref: CIQ Comps→Financial Data “Day Close Price Latest” (subject row), as of 2026-08-29]

## 1. Peer Set

| Peer | Ticker | Why Comparable | Source of Inclusion |
|---|---|---|---|
| Itaú Unibanco Holding S.A. | BOVESPA:ITUB4 | Large Brazilian retail bank with consumer credit, deposits, cards, payments, investments and insurance; it competes for the same retail customer. | [data/NU/FY2025 Form 20-F, Item 3.D; Competitive Map — NU, §2] |
| Banco Bradesco S.A. | BOVESPA:BBDC4 | Large Brazilian full-service retail bank with consumer credit, cards, deposits and payments. | [data/NU/FY2025 Form 20-F, Item 3.D; Competitive Map — NU, §2] |
| Banco Santander (Brasil) S.A. | BOVESPA:SANB11 | Brazilian retail bank active in consumer credit, cards, deposits and payments. | [data/NU/FY2025 Form 20-F, Item 3.D; Competitive Map — NU, §2] |

This is the competitive-map set, not a self-selected screen. NU names all three as competitors. It does not exhaust competition: the filing also names Banco Inter, BTG, C6, XP, Mercado Pago, PicPay, PagSeguro and StoneCo in product-specific markets. C6 has no public-multiple row in the frozen export, so it is not valued here. [data/NU/FY2025 Form 20-F, Item 3.D; Competitive Map — NU, §5]

## 2. Peer Multiples & Operating Stats

P/TBV is price divided by tangible book value, or shareholder capital excluding goodwill and intangibles. ROTE here is a **proxy**: NTM EPS divided by the latest tangible book value per share. The export has no forward tangible-book forecasts, so this is not a company-reported forward ROTE. “Growth” is LTM revenue growth on Capital IQ’s financial-institution revenue definition; it is comparable within this table but not interchangeable with NU’s audited IFRS total-revenue line.

| Company | LTM P/E | P/TBV (latest) | NTM P/E | NTM ROTE proxy | LTM Rev Growth | NTM LT EPS Growth | Net Debt/EBITDA | Data As-of |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| **NU** | 19.5x | 5.7x | 14.76x | 39.4% | 44.3% | 34.0% | N/A — not meaningful for a bank | 2026-08-29 [CIQ] |
| Itaú Unibanco | 9.3x | 2.3x | 8.16x | 27.5% | 6.6% | 9.8% | N/A | 2026-08-29 [CIQ] |
| Banco Bradesco | 7.4x | 1.1x | 6.08x | 18.6% | 6.2% | 16.2% | N/A | 2026-08-29 [CIQ] |
| Santander Brasil | 8.1x | 1.2x | 7.61x | 15.7% | 8.5% | N/A | N/A | 2026-08-29 [CIQ] |
| **Peer median** | **8.1x** | **1.2x** | **7.61x** | **18.6%** | **6.6%** | **13.0%** *(two available peers)* | N/A | 2026-08-29 |

All row values are from [data/NU/Company Comparable Analysis Nu Holdings Ltd.xls, Financial Data; Trading Multiples; Operating Statistics, as of 2026-08-29 — Capital IQ vendor export]. The direct read agrees with the deterministic sidecar for NU’s LTM P/E: `pe_ltm_current_x` is present at 19.5x, sourced to CIQ Financials→Multiples “P/LTM EPS” Close (latest). [ciq_facts.json, `pe_ltm_current_x` = 19.5, source ref as stated]

The sidecar also records 4,830.7m CIQ shares outstanding at 29 August 2026. That is the issued-share field, not the fair-value denominator: this report uses the anchor’s 4,908.841m H1 diluted weighted-average shares for implied values. The 78.141m-share difference is disclosed rather than silently mixed. [ciq_facts.json, `shares_outstanding_m` = 4,830.7, source ref: CIQ Comps→Financial Data “Shares Outstanding Latest”; data/NU/Nu Holdings Ltd — H1 FY2026 reviewed interim financial statements, Note 9; Price & Capital Structure — NU, §§2 and 7]

No dividend yield is quoted: NU has never declared or paid a cash dividend and does not expect to pay one in the foreseeable future. FCF yield is not used because lender cash flow is driven by deposits, lending and securities movements rather than distributable operating free cash flow. [data/NU/FY2025 Form 20-F, Item 8.A “Dividend and Dividend Policy”; Historical Financials — NU, §1]

## 3. Premium / Discount to Peer Median

| Multiple | Company | Peer Median | Premium / (Discount) |
|---|---:|---:|---:|
| LTM P/E | 19.5x | 8.1x | **+140.7% premium** |
| P/TBV | 5.7x | 1.2x | **+375.0% premium** |
| NTM P/E | 14.76x | 7.61x | **+94.0% premium** |

For price multiples, premium / discount is `(company multiple − peer median) / peer median`; each positive result above is therefore a premium. The P/TBV table uses the same Capital IQ basic-dilution series for NU and peers. On the anchor’s fully diluted basis, NU’s current P/TBV is 5.66x (`US$68,497.4m market cap ÷ US$12,093.2m tangible equity`), a 1%-rounding/basis reconciliation to the vendor’s 5.7x. [data/NU/Company Comparable Analysis Nu Holdings Ltd.xls, Trading Multiples, as of 2026-08-29; Price & Capital Structure — NU, §§3 and 6]

**Is the gap typical or unusual? Not assessable.** The frozen pool contains a current peer snapshot but no roughly three-year P/TBV or P/E series for this exact set. This is a peer-relative history gap, not NU’s own-multiple history; it is not filled by the 17-month NU-only series in `02`.

## 4. Is the Gap Warranted?

NU has grounds for some premium: its NTM ROTE proxy is 39.4% versus the peer median 18.6%, its LTM revenue growth is 44.3% versus 6.6%, and it had 139m customers with 83.5% activity in Q2 2026. [data/NU/Company Comparable Analysis Nu Holdings Ltd.xls, Financial Data and Operating Statistics, as of 2026-08-29; data/NU/Q2 2026 earnings presentation, slide 6]

The full observed premium is not supported by the quality evidence. NU’s business-quality score is 52/100; regulation scores 35/100, its moat is narrow with trajectory not assessable, and the 12.4% Q2 risk-adjusted NIM is a current result rather than a through-cycle margin. Brazil supplied 91% of FY2025 geographical revenue, leaving the return case concentrated in one credit and regulatory environment. [Business Quality — NU, §§1–4; Moat — NU, §§3–5; data/NU/FY2025 Form 20-F, Note 34, pp.F-97–F-98]

**Conclusion: premium is unjustified (relative downside).** A higher return and growth rate warrant a premium to mature incumbents, but the 375% P/TBV and 94% NTM P/E premiums require more durability than the current moat, credit-cycle and regulatory evidence establishes.

## 5. Implied Value from Peer Multiples

The anchor’s tangible equity is `US$13,249.7m parent equity − US$409.4m goodwill − US$747.1m intangibles = US$12,093.2m`. Implied per-share values divide equity value by 4,908.841m diluted shares. NTM EPS is US$0.97 from the comparable export; it is a forward metric and is used only with a forward P/E. [data/NU/Nu Holdings Ltd — H1 FY2026 reviewed interim financial statements, Statement of Financial Position p.8 and Note 9; Price & Capital Structure — NU, §6; data/NU/Company Comparable Analysis Nu Holdings Ltd.xls, Financial Data, as of 2026-08-29]

| Multiple | Applied Peer Multiple | Implied Equity | Implied Price/Share | vs Current Price |
|---|---:|---:|---:|---:|
| Raw peer-median P/TBV — reference only | 1.20x | US$14.51bn | US$2.96 | (79.3%) |
| Return-normalised P/TBV | 3.00x | US$36.24bn | US$7.38 | (48.4%) |
| **Growth-adjusted NTM P/E — base case** | **10.0x** | **US$47.62bn** | **US$9.70** | **(32.2%)** |

The raw 1.20x P/TBV result is not a warranted base case because P/TBV does not include returns in its denominator. The return-normalised 3.00x P/TBV is `peer median NTM P/E 7.61x × NU NTM ROTE proxy 39.37%`; it preserves the peer P/E while allowing NU’s higher earnings on tangible equity to raise P/TBV. `3.00x × US$12,093.2m ÷ 4,908.841m = US$7.38` per share. [data/NU/Company Comparable Analysis Nu Holdings Ltd.xls, Trading Multiples and Financial Data, as of 2026-08-29; analyst calculations from the cited inputs]

**Base-case implied value: US$9.70 per share** from 10.0x NTM P/E on US$0.97 NTM EPS. The warranted peer-multiple dispersion is **US$7.38–US$9.70**; the wider raw-to-adjusted field is US$2.96–US$9.70 and should not be read as an equally weighted range. The US$9.70 base is 32.2% below the US$14.30 current price. It is a relative-valuation output, not a final fair value.

### Quality-adjustment ledger

| Multiple adjusted | Peer median | Adjusted to | Gap already in the denominator? | What the extra adjustment pays for | How it was sized |
|---|---:|---:|---|---|---|
| P/TBV | 1.20x | 3.00x | **No** — tangible book is return-blind | NU’s higher NTM ROTE proxy, not a margin difference | `7.61x peer NTM P/E × 39.37% NU NTM ROTE proxy = 3.00x`; this is the P/TBV that keeps the peer P/E on NU’s own return level. |
| NTM P/E | 7.61x | 10.0x | **Yes** — current profitability is already in EPS | Forward growth, which P/E’s earnings denominator does not include; not lower margin | Judgmental +31.4% premium. NU’s 34.0% NTM long-term EPS growth exceeds the 13.0% median of the two peers with data, but the multiple is only 0.29x PEG versus their 0.59x median PEG, a 50% discount for mixed 52/100 quality, narrow-moat uncertainty and credit/regulatory risk. |

The NTM P/E adjustment is not derived from NU’s margin relative to peers. The peer long-term-growth reference has only two available observations because Santander’s field is missing; its use is judgment informed by that small sample, not a measured frequency. [data/NU/Company Comparable Analysis Nu Holdings Ltd.xls, Operating Statistics, as of 2026-08-29; Business Quality — NU, §2; Moat — NU, §5]

### Financial cross-check

All three rows use the same NTM EPS period. A forward TBVPS forecast is unavailable for NU and peers, so the only reconcilable check is NTM EPS against current tangible book value per share; this is an NTM ROTE proxy and lowers confidence in the absolute P/TBV result.

| Case / implied value | Current TBVPS *(forward TBV unavailable)* | P/TBV | NTM EPS | Implied NTM P/E | NTM ROTE proxy | Identity check |
|---|---:|---:|---:|---:|---:|---|
| Current observed | US$2.46 | 5.7x direct vendor read | US$0.97 | 14.76x | 39.4% | `14.76 × 39.4% = 5.81x`, within 0.11x of the 5.7x vendor P/TBV because of rounded EPS/TBV and share-basis fields. |
| Return-normalised | US$2.46 | 3.00x | US$0.97 | 7.61x | 39.4% | `7.61 × 39.4% = 3.00x`. |
| Growth-adjusted base: US$9.70 | US$2.46 | 3.94x | US$0.97 | 10.0x | 39.4% | `10.0 × 39.4% = 3.94x`. |

For the peers, the same direct-export identity gives Santander 1.20x (`7.61x × 15.7%`), Bradesco 1.13x versus 1.1x reported (`6.08x × 18.6%`) and Itaú 2.25x versus 2.3x reported (`8.16x × 27.5%`), all within workbook rounding. The mature-peer maximum is not treated as a ceiling: NU’s 3.00x and 3.94x warranted P/TBV cross-checks are above Itaú’s 2.3x because NU’s forward return proxy is higher. The constraint is durability evidence, not the observed peer maximum. [data/NU/Company Comparable Analysis Nu Holdings Ltd.xls, Financial Data and Trading Multiples, as of 2026-08-29]

## 6. Sector Cycle Reality Test

**Not assessable — no sector-level multiple history.** The frozen Capital IQ peer export is a single 29 August 2026 snapshot and contains no 3–5-year aggregate P/TBV or P/E series for the peer group. The separate `02` report found that B3’s IFNC is a price index rather than a matching sector-multiple series, so it also did not emit a sector-cycle red-flag tag. No cycle-elevated/depressed correction is invented. [Multiples — Own History — NU, §5; data/NU/Company Comparable Analysis Nu Holdings Ltd.xls, as of 2026-08-29]

## 7. Relative Read

At US$14.30, NU carries a 375.0% P/TBV premium and a 94.0% NTM P/E premium to its three named Brazilian-bank peers. The US$9.70 growth-adjusted peer-P/E base point and US$7.38–US$9.70 warranted-multiple range are 32.2%–48.4% below the current price; the premium is unjustified on the available durability and risk evidence. The sector-cycle test is not assessable, so this is not a cycle-adjusted peer anchor.
