# market-structure Module Dossier — GOLD

> Deterministic, lossless concatenation of every artifact in this module — the module synthesis and every specialist output, in order. Generated mechanically (no LLM rewriting), so nothing is omitted or paraphrased. This is the module's "see everything" tier; the module's decision lives in `99_*-synthesis.md` and the short read in `market-structure_memo.md`.

- Generated: 2026-07-03T10:37:24Z
- Module folder: `market-structure`
- Contents: 1 module synthesis + 3 specialist outputs = 4 files

## Table of Contents

- [market-structure — module synthesis](#market-structure-module-synthesis) — `99_market-structure-synthesis.md`
- [market-structure / 00_commodity-triage.md](#market-structure-00-commodity-triage-md) — `00_commodity-triage.md`
- [market-structure / 01_commodity-instruments.md](#market-structure-01-commodity-instruments-md) — `01_commodity-instruments.md`
- [market-structure / 02_commodity-price-curve.md](#market-structure-02-commodity-price-curve-md) — `02_commodity-price-curve.md`


---

## market-structure — module synthesis

_Source: `99_market-structure-synthesis.md`_

# Market Structure — GOLD (module synthesis)

## Abstract

Gold (LBMA/COMEX GCQ26) is quoted at $4,192/troy oz as of 2026-07-03, down roughly 25% from its all-time high of $5,597 reached on January 29, 2026. The near-term trend is bearish: a death cross (50-day MA crossing below the 200-day MA) formed on July 1, 2026, price is below both moving averages, and the critical next support after $4,000 is $3,860 per the World Gold Council's own mid-year analysis. The COMEX curve is in mild contango, implying approximately 3.5% annualised roll drag for a futures-rolling long — a cost avoided entirely by physically-backed ETFs, which lose only their management fee (0.10–0.40%/yr). The cleanest portfolio expression is GLDM or SGOL (lowest fees) for a buy-and-hold position, or COMEX GC front-month for a tactical or levered trade.

---

## Price & Trend

**Current level:** $4,192/oz (COMEX GCQ26 front-month, Google Finance / COMEX, 2026-07-03 ~10:19 UTC). A second quote from triage ($4,176–4,187, Trading Economics / JM Bullion, 2026-07-03, labelled unverified) is slightly lower; the COMEX settlement figure from the price-curve specialist ($4,192.40) is preferred as it cites the exchange directly.

**Trend table (from 02_commodity-price-curve.md):**

| Horizon | Level | Change |
|---|---|---|
| All-time high | $5,597 (2026-01-29) | — |
| 6 months ago | $4,332 (2026-01-02) | -$140 / -3.2% |
| 3 months ago | $4,677 (2026-04-03) | -$485 / -10.4% |
| 1 month ago | $4,462 (2026-06-03) | -$270 / -6.1% |
| Intra-year low | ~$4,002 (2026-06-24) | — |
| Now | $4,192 (2026-07-03) | -$1,405 / -25.1% from ATH |
| 12 months ago | $3,325 (2025-07-03) | +$867 / +26.1% year-on-year |

**Trend verdict:** Confirmed short-to-medium-term downtrend from a vertical January spike, with price below both the 50-day (~$4,438) and 200-day (~$4,340) moving averages. The July 3 bounce off near-$4,002 is a partial recovery, not a trend reversal. Over twelve months, gold is still up 26%, so this is a correction within the broader multi-year bull, not a collapse — but the near-term momentum is negative. A death cross formed on July 1, 2026 [IndexBox / OneUpTrader, 2026-07-01, web unverified; 02_commodity-price-curve.md], which adds weight to the bearish near-term read.

**Key technical levels:**
- $4,340–$4,438: overhead resistance (200-day and 50-day MAs)
- $4,000: near-term psychological floor — briefly breached intraday on June 24 then recovered
- $3,860: WGC-flagged next meaningful support if $4,000 fails [WGC Gold Mid-Year Outlook 2026, gold.org; 02_commodity-price-curve.md]

---

## Futures Curve / Term Structure

**Curve shape: mild contango.** [Google Finance / COMEX, 2026-07-03; 02_commodity-price-curve.md]

| Contract | Expiry | Price (USD/oz) |
|---|---|---|
| GCQ26 | Aug 2026 (front) | $4,192.40 |
| GCZ26 | Dec 2026 | $4,253.90 |
| GCG27 | Feb 2027 | $4,288.10 |
| GCJ27 | Apr 2027 | $4,314.30 |
| GCM27 | Jun 2027 | ~$4,300 (thin; treat as approximate) |

**Annualised roll drag: approximately 3.5% per year.** The front-to-December spread of $61.50 over five months annualises to ($61.50 / $4,192.40) × (12/5) ≈ 3.5% [02_commodity-price-curve.md]. A trader rolling COMEX longs every two months pays this cost in carry against a static physical position.

**What the curve shape means:** Mild contango in gold is mechanical, not a fundamental signal. It reflects the cost of financing a gold position at current USD rates (Fed Funds ~5%) minus the gold lease rate. It does not signal demand tightness — backwardation would do that. It does not signal excess supply either. The macro and flow signals (real yields, DXY, CFTC positioning, central-bank buying) carry the supply/demand information; the curve is simply repricing the cost of carry.

**Roll implication for the portfolio:** Any COMEX-futures-based vehicle bleeds roughly 3.5% per year in roll drag. Physically-backed ETFs (GLD, IAU, SGOL, GLDM) are not exposed to this — they lose only the management fee (0.10–0.40%/yr), making them materially cheaper to hold as a long directional position over months to years.

---

## Instruments & Cleanest Exposure

**Full instrument map (from 01_commodity-instruments.md):**

| Instrument | Type | Fee | Roll drag | Cleanest for |
|---|---|---|---|---|
| GLDM | Physical ETF | 0.10%/yr | None | Buy-and-hold, fee-minimisation |
| SGOL | Physical ETF | 0.17%/yr | None | Buy-and-hold, non-US custody preference |
| IAU | Physical ETF | 0.25%/yr | None | Buy-and-hold, mid-tier cost/liquidity |
| GLD | Physical ETF | 0.40%/yr | None | Large-block institutional; largest AUM (~$132–141bn) [SSGA; 01_commodity-instruments.md] |
| COMEX GC front-month | Futures | Commission only | ~3.5%/yr contango | Tactical/levered/curve trades |
| MCX Gold / Gold Mini | Futures (India) | Commission only | FX additive | India-domiciled exposure in INR |
| GDX | Miner equity ETF | 0.51%/yr | None | NOT a gold price instrument — levered miner equity bet |

**Cleanest expression — adjudicated:**

For a directional long position held weeks to months with fee minimisation: **GLDM** (0.10%/yr) or **SGOL** (0.17%/yr). Both are physically backed, carry no roll drag, and track spot gold less a small annual fee.

For institutional-grade liquidity at large block size: **GLD** — the largest gold ETF by AUM globally (~$132–141 billion mid-2026) with the tightest spreads, despite the higher 0.40%/yr fee.

For a tactical or shorter-horizon trade with leverage: **COMEX GC front-month** — direct, deliverable, and carries embedded leverage (100 oz/contract; ~$11,000–13,000 initial margin per contract per CME 2026). The ~3.5%/yr contango drag is acceptable for short-duration tactical positions.

GDX is not a gold-price vehicle. Its returns depend on miner earnings, capital structure, production costs, and management execution. Do not substitute it for a gold view.

---

## Reconciliation & Gaps

**Price figure — minor discrepancy resolved:**
- Triage (00_commodity-triage.md) cited $4,176–4,187/oz (Trading Economics / JM Bullion, 2026-07-03, unverified web).
- Price-curve specialist (02_commodity-price-curve.md) cited $4,192.40 (Google Finance / COMEX, 2026-07-03 ~10:19 UTC) and $4,192 as spot.

Adjudication: prefer $4,192.40 from COMEX (exchange source, MODULE_RULES.md §2 Tier 2). The $4,176–4,187 range is a valid secondary confirmation that the price is approximately in the $4,176–4,192 band on the same date. No conflict; the gap is the bid/ask and intraday timing. All three files agree the price is in the mid-$4,100s to low-$4,200s range on 2026-07-03.

**GCM27 (Jun 2027) price — flagged as approximate:** The price-curve file itself noted "slightly below Apr 2027 — possible thin-market effect at the far end; treat as approximate." This is an honest caveat; the contango shape through GCJ27 ($4,314.30) is the reliable read. The Jun 2027 data point is informational only.

**Curve annualisation — confirmed:** The 3.5%/yr roll drag calculation in 02_commodity-price-curve.md ($61.50 / $4,192.40 × 12/5 = 3.52%) checks arithmetically.

**GLD AUM — cited as unverified web:** The $132–141bn AUM figure for GLD [SSGA; Motley Fool 2026-05-11; etfbeacon.com, unverified web, cited in 01_commodity-instruments.md] is the best available figure but is not from an audited fund filing. Material for comparison purposes only; not load-bearing to the cleanest-instrument verdict.

**Missing data (not gaps that affect this synthesis):**
- CFTC COT managed-money positioning data (through ~2026-06-23) was confirmed reachable at triage but not fetched in detail at this stage — the positioning/flow lens is downstream of this module and will be covered by the appropriate specialist.
- 10-year real yield (FRED DFII10) confirmed reachable but not fetched in detail — same.
- No local data pool (data/GOLD/ directory does not exist); all data from live public sources, appropriately labelled.

---

## Note to the Commodity Thesis

- **Death cross on July 1, 2026.** The 50-day MA (~$4,438) crossed below the 200-day MA (~$4,340) on July 1, 2026, and price is currently below both. The $4,340–$4,438 band is now overhead resistance. A sustained reclaim of $4,340 would be required to neutralise the near-term bearish technical setup. The thesis module must treat the current price ($4,192) as a bounce, not a reversal, until the technicals say otherwise.
- **Contango ~3.5%/yr — cost paid only by futures holders.** Physically-backed ETFs (GLDM, SGOL, IAU, GLD) do not bear this cost. Any portfolio position expressed in GLD, IAU, SGOL, or GLDM faces only 0.10–0.40%/yr fee drag, not the 3.5% contango drag. The curve shape does not add a fundamental bearish signal — it is mechanical carry at current rates.
- **WGC $3,860 is the next meaningful support.** If $4,000 fails cleanly on a closing basis, the WGC's mid-year analysis [WGC Gold Mid-Year Outlook 2026, gold.org] places the next material support at $3,860. The thesis module should treat this as the downside scenario anchor until supply/demand and macro lenses are run.
- **GDX is not a gold instrument for this thesis.** The instrument map makes clear that GDX carries operating leverage, equity-market correlation, and management/geopolitical risk. If the portfolio holds or considers GDX, it must be evaluated as a miner-equity bet, not as a gold-price bet.



---

## market-structure / 00_commodity-triage.md

_Source: `00_commodity-triage.md`_

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



---

## market-structure / 01_commodity-instruments.md

_Source: `01_commodity-instruments.md`_

# Instruments & Exposure Map — GOLD

## 1. Benchmark & Contract

- **Benchmark grade:** LBMA Gold Price (London Good Delivery bar, minimum 99.5% purity), quoted in USD per troy ounce. The LBMA AM and PM fixes are the global reference for physical trade. COMEX GC front-month futures are the US institutional benchmark and the primary price-discovery venue for the forward curve.
- **Quote unit / currency:** USD per troy ounce. The India lens tracks INR per 10 grams (MCX).
- **Front-month contract + tick:** COMEX GC — 100 troy oz per contract; minimum tick $0.10/oz = $10 per contract; physically deliverable at approved COMEX depositories. [CME Group contract specs, 2026-07-03, unverified web]
- **Curve character:** Gold is structurally in mild contango, driven by the cost of carry (USD interest rates minus the gold lease rate). The forward premium above spot approximates: `(Spot × (USD rate − gold lease rate) × time)`. With Fed Funds around 5%, a six-month deferred contract has historically run ~2–3% above spot before the lease-rate offset. Backwardation is uncommon and usually signals acute near-term physical tightness. [COMMODITY_PROFILES.md §GOLD; CME Group education, 2026-07-03, unverified web]

---

## 2. Instrument Map

| Instrument | Type | Exchange | Tracks | Fee | Main divergence from spot | Source |
|---|---|---|---|---|---|---|
| **GLD** (SPDR Gold Shares) | Physically-backed bullion trust (ETF) | NYSE Arca | Spot gold (each share ≈ 1/10 troy oz of physical gold held by HSBC as custodian) | 0.40%/yr management fee | Fee drag: NAV erodes at 0.40%/yr vs spot; ounces per share decline gradually as gold is sold to cover fees. NAV premium/discount typically ±0.05–0.15% on normal days; can widen modestly in a stress event. No roll drag (physical, not futures). | [SSGA / State Street GLD prospectus; Volity.io, 2026, unverified web] |
| **IAU** (iShares Gold Trust) | Physically-backed bullion trust (ETF) | NYSE Arca | Spot gold (each share ≈ 1/100 troy oz of physical gold; custodian: JPMorgan) | 0.25%/yr management fee | Fee drag at 0.25%/yr vs spot; ounces-per-share decline mirrors the fee. Slightly lower liquidity than GLD but spread still tight for most uses. No roll drag. | [iShares Gold Trust Form 10-K FY2025 (SEC); ETFdb.com, 2026, unverified web] |
| **SGOL** (abrdn Physical Gold Shares ETF) | Physically-backed bullion trust (ETF) | NYSE Arca | Spot gold (physical bars held in Swiss vaults; custodian: JPMorgan; semi-annual audits) | 0.17%/yr management fee | The lowest-fee physically-backed option among the three. Same no-roll-drag profile. Swiss custody is a feature for investors wanting non-US storage; no counterparty credit risk beyond the custodian. | [abrdn / ETFdb SGOL page, 2026, unverified web] |
| **GLDM** (SPDR Gold MiniShares) | Physically-backed bullion trust (ETF) | NYSE Arca | Spot gold (each share ≈ 1/100 troy oz of physical gold; sub-custodian: ICBC Standard Bank) | 0.10%/yr management fee | Lowest fee among broadly traded gold ETFs. Lower AUM and daily volume than GLD/IAU — adequate for most retail, less suitable for large institutional blocks. No roll drag. | [SSGA GLDM fact sheet; Yahoo Finance expense ratio as of 2026-06-30, unverified web] |
| **GC** (COMEX Gold Futures) | Futures contract (front-month) | COMEX / CME Group | COMEX gold spot + cost of carry; 100 oz/contract; physically deliverable | No management fee; exchange + broker commissions; initial margin ~$11,000–13,000/contract (CME, 2026) | Roll yield: longs must roll to the next contract before expiry, paying the contango spread each time (approx. cost of carry = USD rate minus lease rate × contract period). Basis risk vs LBMA spot is very small on active contracts but not zero. Leverage is embedded — a 1% gold move = ~$4,100 P&L per contract at $4,100/oz. | [CME Group contract specs, 2026-07-03, unverified web; COMMODITY_PROFILES.md §GOLD] |
| **GC deferred / calendar spreads** | Futures (deferred months) | COMEX / CME Group | COMEX forward curve (e.g. Dec, Feb, Apr further out) | No management fee; same commission + margin structure | Contango drag grows with time: an investor holding a 6-month deferred contract that rolls down to spot loses the carry premium unless spot rises to meet it. Illiquidity rises rapidly beyond the front 2–3 contracts. | [CME Group; COMMODITY_PROFILES.md §GOLD] |
| **MCX Gold Futures** | Futures contract | MCX (India) | INR/10g domestic price, linked to COMEX + USD/INR FX | No management fee; exchange + broker commissions; lot size 1 kg (main contract) / 100g (Gold Mini) | Tracks LBMA/COMEX price converted at prevailing USD/INR plus India import duty and local premia. FX risk is additive. INR weakening raises domestic gold in rupee terms independently of USD gold moves. | [MCX India product page; Sahi.com MCX gold guide, 2026, unverified web] |
| **GDX** (VanEck Gold Miners ETF) | Equity ETF (miners) | NYSE Arca | MarketVector Global Gold Miners Index (~80%+ of AUM in large-cap gold/silver miners globally) | 0.51%/yr expense ratio | NOT a gold instrument. It is an equity proxy with operating leverage: a 10% gold price move can produce a 20–40% move in miner earnings, magnified further by production costs, capital structure, and execution. Carries equity-market correlation, geopolitical mine-jurisdiction risk, and management risk. Use only as a levered equity overlay, never as a substitute for spot/futures. | [VanEck GDX fund page; ETFdb.com, 2026, unverified web] |

---

## 3. Portfolio Instrument → Underlying

The GOLD profile lists GLD and IAU / SGOL as the portfolio-relevant instruments. There is no futures-based or ETN-based gold vehicle held with a structural roll-drag issue the way CANE tracks sugar futures. All three physically-backed ETFs translate directly to spot gold less their respective fees.

| Held instrument | Mechanism (what it holds) | Fee | How it can diverge from the commodity |
|---|---|---|---|
| **GLD** (SPDR Gold Shares) | A grantor trust. Each share represents a fractional interest in physical gold bars vaulted at HSBC in London. The trust daily accrues expenses by reducing the ounces-per-share ratio — gold is sold in small quantities to cover the 0.40%/yr sponsor fee. No derivatives, no lending, no leverage. | 0.40%/yr | (1) **Fee drag**: cumulative 0.40%/yr vs a direct bullion holding. (2) **NAV premium/discount**: market price can trade marginally above or below the daily stated NAV; historically ±0.05–0.15% on normal days, can widen briefly in dislocated markets. (3) **Tax treatment (US)**: GLD shares are taxed as collectibles (28% long-term rate for US holders), not as standard long-term capital gains. (4) No counterparty credit risk on the gold itself, but sub-custodian concentration in HSBC Bank plc. |
| **IAU** (iShares Gold Trust) | Same grantor-trust structure. Physical gold bars held by JPMorgan Chase Bank (custodian). Shares represent 1/100 oz of gold (initially; shrinks as fees are paid from the trust). | 0.25%/yr | Same mechanics as GLD: fee drag at 0.25%/yr, NAV premium/discount risk (marginally tighter historically), US collectibles tax treatment, JPMorgan custodian concentration. 0.15 pp cheaper than GLD annually. |
| **SGOL** (abrdn Physical Gold Shares ETF) | Grantor trust. Physical gold in Swiss vaults (Zurich and London), with JPMorgan as custodian. Semi-annual independent audits. | 0.17%/yr | Same fee-drag and NAV mechanics as GLD/IAU; 0.17%/yr is the most cost-efficient among the three. Swiss vault location is a distinguishing feature but does not change the core tracking mechanism. US collectibles tax treatment applies to US holders. |

**Key point for all three:** Because these are physically-backed trusts, there is essentially no roll yield drag from futures positioning. The only structural cost below spot is the annual management fee. This is the critical difference from a futures-based vehicle (like UNG for natural gas, or a hypothetical gold futures ETF). GLD vs spot gold divergence over a year is almost entirely explainable by the 0.40% fee.

---

## 4. Cleanest Expression

**For a directional long view on gold (portfolio):** SGOL (lowest fee at 0.17%/yr, Swiss custody) or GLDM (lowest fee overall at 0.10%/yr, adequate liquidity) are the most cost-efficient physical vehicles for a buy-and-hold position. GLD is preferred when institutional-grade liquidity and tight bid-ask spreads at large size are required — it is the largest gold ETF globally by AUM (~$132–141 billion as of mid-2026) and the most traded. IAU sits in between on both cost and liquidity.

**For a shorter-horizon or curve-driven view:** COMEX GC front-month futures are the direct expression. They carry roll costs (contango drag equal to the cost of carry, approximately USD rates minus the gold lease rate × time), but they provide leverage, deliverability, and the ability to express spread or deferred-curve views. The front two contracts are liquid; the curve thins beyond 6 months.

**Verdict:** For a portfolio long position measured in weeks to months, **GLD** (if size/liquidity dominates) or **GLDM/SGOL** (if fee minimisation dominates) are the cleanest expressions. For a tactical/institutional trade, **COMEX GC front-month** is cleanest. GDX should not be used to express a gold-price view — it is a miner-equity bet.

**Biggest finding:** Gold's physically-backed ETFs (GLD, IAU, SGOL, GLDM) have near-zero roll drag — the structural performance drag is only the management fee (0.10–0.40%/yr). This is fundamentally different from energy or agricultural commodity ETFs where roll costs in a contango market can be 10–30%/yr. Gold's cost of carry (the COMEX contango) is real but is borne only by holders of futures, not by holders of the physical ETFs.

---

## 5. Sources

- COMMODITY_PROFILES.md §GOLD (internal, 2026-07-03)
- MODULE_RULES.md §2 (internal, 2026-07-03)
- CME Group COMEX GC contract specifications [cmegroup.com, accessed 2026-07-03, unverified web]
- SSGA / State Street GLD product page and prospectus [ssga.com; volity.io, 2026, unverified web]
- iShares Gold Trust Form 10-K FY2025 [SEC EDGAR, 2026, audited filing]
- abrdn Physical Gold Shares ETF (SGOL) [etfdb.com; aberdeeninvestments.com, 2026, unverified web]
- SPDR Gold MiniShares (GLDM) expense ratio 0.10% [Yahoo Finance as of 2026-06-30; SSGA, unverified web]
- VanEck GDX expense ratio 0.51% [VanEck GDX fund page; etfdb.com, 2026, unverified web]
- MCX gold futures lot size and contract specs [mcxindia.com; sahi.com, 2026, unverified web]
- GLD AUM ~$132–141 billion, fee 0.40% [SSGA; Motley Fool 2026-05-11; etfbeacon.com, unverified web]
- IAU expense ratio 0.25%, AUM; tracking error 0.28%/yr [ainvest.com; etfdb.com, 2026, unverified web]
- SGOL expense ratio 0.17% [etfdb.com SGOL page, 2026, unverified web]
- Gold contango and cost of carry [CME Group education; MetalsAlpha.com, 2026, unverified web]
- GLD ounces-per-share decline mechanism [bitget.com/wiki/does-gld-track-gold-price; The Gold Observer, unverified web]



---

## market-structure / 02_commodity-price-curve.md

_Source: `02_commodity-price-curve.md`_

# Price Trend & Term Structure — GOLD

## 1. Price Now & Trend

| Horizon | Level (USD/troy oz) | Change | Source |
|---|---|---|---|
| Spot / front (GCQ26, Aug 2026) | $4,192 | — | Google Finance / COMEX, 2026-07-03 ~10:19 UTC |
| 1 month ago (June 3, 2026) | $4,462 | -$270 / -6.1% | CNBC Select, 2026-06-03 (web, unverified) |
| 3 months ago (Apr 3, 2026) | $4,677 | -$485 / -10.4% | exchange-rates.org, 2026-04-03 (web, unverified) |
| 6 months ago (Jan 2, 2026) | $4,332 | -$140 / -3.2% | exchange-rates.org, 2026-01-02 (web, unverified) |
| 12 months ago (July 3, 2025) | $3,325 | +$867 / +26.1% | exchange-rates.org, 2025-07-03 (web, unverified) |
| 52-week range | $3,283 low – $5,597 high | Current at 25% of peak, 27% off 52-wk high | Barchart.com GCQ26, 2026-07-03 (web, unverified); TradingEconomics, 2026-07-03 |
| All-time high | $5,597 (Jan 29, 2026) | -$1,405 / -25.1% from ATH | TradingEconomics, 2026-07-03 (web, unverified) |

**Trend read.** Gold is in a confirmed downtrend from its all-time high of roughly $5,597/oz set on January 29, 2026. The metal has fallen about 25% from that peak to the current $4,179–4,192 range — a sharp reversal that cut through the December 2025 year-end level ($4,340) and took the price to an intra-year floor near $4,002 on June 24, 2026, before a partial bounce on weaker-than-expected US jobs data on July 3. Over the trailing twelve months, gold is still up a strong 26%, so the bear case is not a collapse of the multi-year bull trend but rather a steep correction after a vertical January spike. The 1-month (-6%), 3-month (-10%), and 6-month (-3%) reads all point in the same direction: the momentum that powered gold through Q4 2025 has reversed, and price is consolidating well below its moving averages. The near-term bounce notwithstanding, the technical picture tilts bearish unless price can reclaim the 200-day moving average.

---

## 2. Technical Levels (chart context, not fundamentals)

- **$4,000 — Psychological round-number support.** This level is the most-watched near-term floor on the chart. Price briefly broke below it (intraday low ~$4,002 on June 24, 2026) before recovering, which market participants are reading as a test of a potential demand zone. A clean break and close below $4,000 on volume would be a negative signal. [OneUpTrader GC Technical Analysis, 2026-07-01, web unverified; WGC Mid-Year Outlook 2026]

- **$3,860 — WGC-identified support / potential second leg down.** The World Gold Council's mid-year analysis flagged this level explicitly: "if gold were to trade below ~$3,860/oz it could experience an additional leg down." This is the next meaningful support in the event $4,000 fails. [WGC Gold Mid-Year Outlook 2026, gold.org]

- **$4,340 / $4,438 — 200-day and 50-day moving averages (now overhead resistance).** The 50-day MA (~$4,438) crossed below the 200-day MA (~$4,340) on July 1, 2026 — forming a "death cross," the most widely-watched bearish MA signal in the gold market. The last gold death cross was in October 2023, when gold traded near $1,900. With price now below both averages, the $4,340–$4,438 band is overhead resistance; a sustained reclaim of $4,340 (the 200-day) would be required to neutralise the bearish MA setup. [IndexBox / NewsCase reporting on July 1 death cross, 2026-07-01; OneUpTrader GC Technical Analysis, 2026-07-01, both web unverified]

---

## 3. Futures Curve / Term Structure

| Contract | Expiry | Price (USD/troy oz) | Source |
|---|---|---|---|
| GCQ26 — Aug 2026 (front month) | Aug 27, 2026 | $4,192.40 | Google Finance / COMEX, 2026-07-03 ~10:19 UTC |
| GCZ26 — Dec 2026 | Dec 2026 | $4,253.90 | Google Finance / COMEX, 2026-07-03 ~10:18 UTC |
| GCG27 — Feb 2027 | Feb 2027 | $4,288.10 | Google Finance / COMEX, 2026-07-03 ~10:18 UTC |
| GCJ27 — Apr 2027 | Apr 2027 | $4,314.30 | Google Finance / COMEX, 2026-07-03 ~10:18 UTC |
| GCM27 — Jun 2027 | Jun 2027 | ~$4,300 | Google Finance / COMEX, 2026-07-03 ~10:18 UTC (slightly below Apr 2027 — possible thin-market effect at the far end; treat as approximate) |

**Shape: contango.** Each deferred contract trades above the front month, as is normal for gold — the curve reflects the cost of carry (financing, storage, insurance) at current interest-rate levels. This is not a signal of demand tightness; it is the mechanical result of holding physical gold versus holding a futures contract. The curve is upward-sloping but not steep.

**Annualised roll yield: approximately -3.5% per annum (a cost to a rolled long).** From the front month (GCQ26, $4,192.40) to December 2026 (GCZ26, $4,253.90) is a $61.50 spread over approximately 5 months. Annualised: ($61.50 / $4,192.40) × (12 / 5) ≈ 3.5% per year. A holder who rolls a COMEX long every two months bleeds roughly this amount in roll drag relative to a static spot position — the price must rise by at least 3.5% per year just to break even versus holding physical gold or a physically-backed ETF (GLD, IAU).

**What it implies.** Gold's mild contango is the commodity market's equivalent of a flat, unremarkable signal on the curve. It does not suggest near-term tightness (backwardation would do that) and does not suggest excess supply pressure either — it simply reflects the current financing rate. For a rolled futures position or an ETF that holds futures (like GDX-adjacent structures), the ~3.5% annualised drag is meaningful over a multi-year hold, which is one reason physically-backed vehicles (GLD at 0.40%/yr, IAU at 0.17–0.25%/yr) are the preferred expression in the commodity profile for gold. The curve shape gives no fundamental signal about near-term demand tightness or looseness; the macro and flow lenses (real yields, DXY, central-bank buying, CFTC positioning) carry that information.
