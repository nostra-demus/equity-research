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
