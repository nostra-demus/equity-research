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
