# Commodity Triage — GOLD

## 1. Identity

| Item | Value | Source |
|---|---|---|
| Benchmark / grade | LBMA Gold Price (London, USD/troy oz); COMEX front-month (GC) for the US curve | COMMODITY_PROFILES.md § GOLD |
| Quote unit + currency | USD per troy ounce (spot and futures); also track INR/10g for the India lens | COMMODITY_PROFILES.md § GOLD |
| Primary exchange(s) | COMEX (CME Group), LBMA (OTC), MCX (India) | COMMODITY_PROFILES.md § GOLD |
| Applicable lenses (from profile) | Market structure (spot vs curve, ETF holdings); Supply/demand (mine supply, recycling, jewellery, investment, official-sector/central-bank buying); Seasonality (mild — India festival/wedding demand Q3–Q4, Chinese New Year, Q1 restocking); Macro drivers — dominant (10y real yields/TIPS, US dollar/DXY, policy rates, central-bank buying, geopolitical/safe-haven risk); Positioning/flows (COMEX managed-money net length via CFTC COT, gold-ETF holdings/GLD/IAU tonnes); Valuation/fair value (real-yield and USD-implied range, not a point DCF) | COMMODITY_PROFILES.md § GOLD |

## 2. Instruments (from profile)

| Instrument / ticker | Type (futures/ETF/spot/equity proxy) | Exposure | Notes |
|---|---|---|---|
| GLD (SPDR Gold Shares) | Physically-backed bullion trust / ETF | Spot gold less management fee | Expense ratio ~0.40%/yr; the liquid US proxy; minimal roll drag |
| IAU / SGOL | Physically-backed bullion trust / ETF | Spot gold less management fee | Lower fees than GLD (~0.17–0.25%/yr); same physical exposure |
| GC (COMEX gold futures) | Futures | COMEX front-month and curve | Carries roll; the institutional expression; key for curve structure |
| GDX (VanEck Gold Miners ETF) | Equity proxy (miners) | Levered, equity-risk proxy — NOT the metal | Operating leverage to gold price; distinct risk profile; not a substitute for spot/futures |

## 3. Data Reachability

| Lens | Primary source checked | Found? | As-of date |
|---|---|---|---|
| Benchmark spot price (LBMA/COMEX) | Trading Economics / JM Bullion (quoting LBMA/COMEX live feeds); LBMA.org.uk listed reachable | Yes — ~$4,176 USD/oz (Trading Economics) / ~$4,187 USD/oz (JM Bullion) | 2026-07-03 (unverified live web quote; labelled as such) |
| Positioning/flows — CFTC COT managed-money net length | CFTC.gov CommitmentsofTraders + MacroMicro COT series (en.macromicro.me/series/8308) | Yes — CFTC COT data current through ~2026-06-23 referenced and accessible | ~2026-06-23 (latest Tuesday close per normal 3-day lag) |
| ETF holdings (GLD/IAU tonnes) | World Gold Council — gold.org/goldhub/data/gold-prices and Gold Demand Trends Q1-2026 | Yes — WGC Gold Demand Trends Q1-2026 confirmed published and accessible | Q1 2026 (quarterly report) |
| Macro drivers — 10y real yield (TIPS) | FRED DFII10 series (primary/official; Federal Reserve Bank of St. Louis) | Reachable (standard FRED series; not fetched in detail at triage stage) | Current (FRED updates daily) |
| Supply/demand balance | World Gold Council Gold Demand Trends (quarterly official balance) | Yes — Q1-2026 report confirmed accessible via gold.org | Q1 2026 |

## 4. Local pool (data/GOLD/)

None — directory does not exist. Running on live public sources only.

## 5. Sufficiency Verdict

- **Verdict:** Sufficient
- **Reason:** The GOLD section exists in COMMODITY_PROFILES.md with full lens, instrument, and source specification, and a current benchmark price (~$4,176–4,187 USD/troy oz, 2026-07-03) plus at least two primary/official supply-demand and positioning sources (WGC Gold Demand Trends Q1-2026; CFTC COT through ~2026-06-23) are confirmed reachable.
- **Missing (if Partial/Insufficient):** N/A — all required primary sources confirmed reachable at triage.
