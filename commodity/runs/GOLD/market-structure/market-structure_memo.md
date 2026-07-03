# Market Structure Module Memo — GOLD

**Date:** 2026-07-03

**Read (one line):** Near-term bearish — gold is $4,192/oz, down 25% from its January 2026 all-time high of $5,597, with a death cross (the shorter-term average crossing below the longer-term one — a classic bearish technical signal) confirmed on July 1, 2026, and price sitting below both the 50-day and 200-day moving averages.

**Cleanest expression:** GLDM (0.10%/yr fee) or SGOL (0.17%/yr fee) for buy-and-hold; GLD for large institutional blocks; COMEX GC front-month only for tactical/levered trades (it bleeds roughly 3.5%/yr in roll drag — the cost of rolling a futures position forward in a mildly upward-sloping curve).

---

## Snapshot at a Glance

The synthesis does not assign numeric /100 scores — this module produces a read on price, trend, curve, and instrument choice rather than a scored verdict. The load-bearing readings it carries are:

| Reading | What the synthesis carried |
|---|---|
| Current price | $4,192/oz (COMEX GCQ26 front-month, 2026-07-03) |
| Distance from all-time high | -$1,405 / -25.1% from $5,597 (2026-01-29) |
| Year-on-year | +$867 / +26.1% vs 2025-07-03 ($3,325) |
| Near-term trend | Confirmed downtrend; death cross July 1, 2026; price below 50-day (~$4,438) and 200-day (~$4,340) MAs |
| Curve shape | Mild contango (front $4,192.40 → Dec $4,253.90 → Apr 2027 $4,314.30) |
| Roll drag on futures | ~3.5%/yr — mechanical, not a demand signal |
| Next meaningful support if $4,000 fails | $3,860 (WGC mid-year outlook) |
| Cleanest long-hold instrument | GLDM (0.10%/yr fee) or SGOL (0.17%/yr fee) |

Caps applied by the synthesis: none. §24 Avoid-Big-Risks filters tripped: none tripped at the market-structure level (this module does not carry the survival, integrity, or alignment filters — those sit in downstream lenses).

---

## What This Module Found

Gold has corrected sharply from a January 2026 vertical spike but is still up ~26% year-on-year, so this is a pullback inside a multi-year bull market, not a collapse. The near-term picture is bearish: a death cross formed on July 1, 2026, price is below both moving averages ($4,340 and $4,438), and the July 3 bounce off ~$4,002 is a partial recovery, not a reversal. Overhead resistance now sits in the $4,340–$4,438 band; if $4,000 breaks cleanly, the World Gold Council's next meaningful support is $3,860 [WGC Gold Mid-Year Outlook 2026, gold.org]. The COMEX curve is in mild contango, which the synthesis reads as mechanical cost-of-carry (financing rate minus gold lease rate) — not a fundamental demand signal. The single most important instrument-choice takeaway: physically-backed ETFs (GLDM/SGOL/IAU/GLD) avoid the ~3.5%/yr contango drag that futures rollers pay, so for any hold longer than a few weeks they are materially cheaper than COMEX GC.

---

## The Specialists, Briefly

- **00_commodity-triage** — GOLD data reachability is sufficient; benchmark, curve, positioning, ETF holdings, and macro sources all confirmed reachable; no local pool (`data/GOLD/` does not exist), so the module runs on live public sources labelled accordingly.
- **01_commodity-instruments** — mapped the full instrument set (GLDM 0.10%, SGOL 0.17%, IAU 0.25%, GLD 0.40%, COMEX GC, MCX Gold, GDX) and flagged GDX as a miner-equity bet, not a gold-price bet.
- **02_commodity-price-curve** — priced the front-month at $4,192.40 (COMEX, 2026-07-03), built the trend table, computed 3.5%/yr roll drag, and flagged the death cross and the $3,860 next-support level.

Disagreements the synthesis flagged and resolved: (1) the price figure — triage cited $4,176–$4,187 (Trading Economics / JM Bullion, unverified web); the price-curve specialist cited $4,192.40 (COMEX). The synthesis preferred the COMEX exchange figure per the source hierarchy and treated the triage range as valid secondary confirmation (bid/ask and intraday timing, no real conflict). (2) The GCM27 (Jun 2027) print was flagged as thin-market approximate; the reliable curve read runs through GCJ27. (3) GLD's ~$132–141bn AUM is unverified web (SSGA/press) — used only for comparison, not load-bearing.

---

## What Would Change This Read

The synthesis did not present a formal upgrade/downgrade trigger table, but it named the specific observable events that would move the module's read:

- **Bearish → less bearish:** A sustained reclaim of $4,340 on a closing basis would neutralise the near-term bearish technical setup (it would put price back above the 200-day MA and start to unwind the death cross).
- **Bearish → more bearish:** A clean close below $4,000 would open $3,860 as the next material support per WGC's mid-year analysis.
- **Curve read changes:** A shift from mild contango into backwardation would be a real demand-tightness signal (the current mild contango is not).
- **Instrument-choice read changes:** Only if a physically-backed ETF's fee, tracking, or custody profile materially changed — not sensitive to price.

---

## Bottom Line

- Gold is $4,192/oz, down 25% from January's $5,597 peak but still up 26% year-on-year — a correction inside a bigger bull, not a collapse.
- The near-term momentum is negative: death cross July 1, price below both moving averages, July 3 is a bounce not a reversal.
- The curve's 3.5%/yr contango is mechanical carry, not a bearish demand signal — but it is a real cost that futures holders pay and ETF holders do not.
- Cleanest long-hold expression is GLDM (0.10%/yr) or SGOL (0.17%/yr); use COMEX GC only for tactical or levered trades; do not substitute GDX for a gold view.
- The one thing to watch next: whether $4,000 holds on a closing basis. Below it, $3,860 is the WGC-flagged next stop.

---

## Plain-English Glossary

- **Death cross** — the 50-day moving average crossing below the 200-day moving average; a common bearish technical signal.
- **Contango** — a futures curve that slopes upward (later contracts cost more than the front month); rolling a long position through it costs money.
- **Roll drag** — the cost a futures holder pays when they sell an expiring contract and buy a more expensive later one to keep exposure.
- **Backwardation** — the opposite of contango (later contracts cheaper than the front); usually signals near-term demand tightness.
- **Physically-backed ETF** — a fund whose shares are backed by actual gold held in a vault; it tracks spot price minus a small annual fee and does not pay roll drag.
- **Basis points (bp)** — 1/100th of a percentage point; used here only via annual fees stated in %.
