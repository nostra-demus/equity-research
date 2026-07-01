# Instruments & Exposure Map — GOLD

> **Test fixture — illustrative figures, not live research.**

## 1. Benchmark & Contract
- LBMA Gold Price / COMEX `GC` front-month, quoted USD per troy ounce.

## 2. Instrument Map
| Instrument | Type | Exchange | Tracks | Fee | Main divergence from spot | Source |
|---|---|---|---|---|---|---|
| GLD | physical bullion trust | NYSE Arca | spot gold | ~0.40%/yr | fee drag only (no roll) | issuer factsheet (illustrative) |
| IAU / SGOL | physical bullion trust | NYSE Arca | spot gold | ~0.17–0.25%/yr | fee drag | issuer factsheet (illustrative) |
| GC | future | COMEX | curve | — | roll (usually mild contango) | CME (illustrative) |
| GDX | miner equity ETF | NYSE Arca | gold-miner equities | ~0.51%/yr | equity + cost leverage, not the metal | issuer factsheet (illustrative) |

## 3. Portfolio Instrument → Underlying
| Held instrument | Mechanism | Fee | Divergence |
|---|---|---|---|
| GLD | holds allocated bullion | ~0.40%/yr | tracks spot less fee; no roll |

## 4. Cleanest Expression
- GLD (or IAU for lower fee) is the cleanest liquid expression of a spot-gold view; GC for a curve/roll view.
