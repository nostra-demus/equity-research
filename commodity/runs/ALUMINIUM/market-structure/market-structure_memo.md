# Market Structure Module Memo — ALUMINIUM

**Verdict:** Consolidating in the low-USD-3,000s after a geopolitical spike-and-unwind, with the curve in mild backwardation — a long futures holder is modestly paid to roll, but the pickup is thin and no longer flags acute near-term tightness. (This module describes price and curve structure; it does not issue a scored buy/sell rating.)

**One-line reason:** LME aluminium cash last settled USD 3,154.00/tonne (2026-07-17), almost exactly the mid-January 2026 level, after round-tripping down ~18% from a four-year high of USD 3,855/tonne (2026-06-02); the cash–3-month spread has normalised to +USD 7.50/tonne (~+0.95% a year) from the ~USD 59/tonne inversion at the May crisis peak [`02_commodity-price-curve.md`].

**Memo date:** 2026-07-18.

---

## Scores at a Glance

This market-structure synthesis carries **no `/100` scores** — it reports price, trend, curve shape, and instrument choice rather than a scored verdict. Nothing to carry verbatim on that front.

| Item | What the module carried |
|---|---|
| Numeric scores | None listed in the synthesis. |
| Score caps applied | None. |
| §24 Avoid-Big-Risks filters tripped | None tripped in this synthesis. |
| Data-sufficiency verdict | **Sufficient** — current LME cash price plus current warehouse-stock/warrant data confirmed from exchange-linked primary sources [`00_commodity-triage.md`, §5]. |

Sufficiency is "Sufficient" but with named open gaps (see "What Would Change This Read"): the LME curve beyond 3 months could not be retrieved, the Midwest-premium ratio is stale, and supply/demand plus positioning data belong to other lenses.

---

## What This Module Found

- LME aluminium cash last settled **USD 3,154.00/tonne (2026-07-17)**, with the 3-month contract at USD 3,146.50/tonne — back almost exactly to the mid-January 2026 level (USD 3,147.00/tonne) [`02_commodity-price-curve.md`].
- The price **spiked to a four-year high of USD 3,855/tonne on 2026-06-02** on Iranian attacks on Gulf smelters and a US-ordered blockade through the Strait of Hormuz, hitting an already-thin warehouse buffer — then **unwound ~18%** to a four-month low near USD 3,085/tonne in early July before stabilising [`02_commodity-price-curve.md`].
- Treat this as **two separate signals, not one trend**: the 12-month change is still up +21–22% versus July 2025, but the last one-to-three months are a sharp reversal, not a fresh leg higher.
- The single most important driver is the **physical tightness**: LME warehouse stocks are still down roughly one-third, from ~420,000 t in January 2026 to ~284,600 t by 2026-07-15 [`00_commodity-triage.md`]. That tight buffer underpins the backwardation.
- The single most important risk to the structure read is that the **tightness signal has mostly faded**: the curve inversion (cash priced above later months) has normalised from ~USD 59/tonne at the May peak to just +USD 7.50/tonne, so the curve is no longer flagging acute near-term scarcity [`02_commodity-price-curve.md`].
- The **cleanest way to express a pure price view is LME Aluminium futures** (exchange fees and roll cost only, no fund fee, no issuer credit risk), with COMEX ALI a close US-listed alternative (99.86% settlement correlation to LME) [`01_commodity-instruments.md`].

---

## The Specialists, Briefly

- **Triage (`00`)** → Benchmark is LME Aluminium (USD/tonne); data reachability confirmed a current cash price and current warehouse-stock data; sufficiency = "Sufficient" [`00_commodity-triage.md`].
- **Instruments (`01`)** → LME futures are the cleanest direct expression; COMEX ALI is a close US-listed alternative; the ETN (JJU) and producer equities are fallback-only, not 1:1 proxies; the US Midwest premium is a separate, separately-tradable layer (AUP) [`01_commodity-instruments.md`].
- **Price & Curve (`02`)** → Cash USD 3,154.00/tonne (2026-07-17); mild backwardation of +USD 7.50/tonne (~+0.95% a year); price consolidating after a spike-and-unwind [`02_commodity-price-curve.md`].

**Most important reconciliation the synthesis noted:** the triage and instruments files cite an older cash print (USD 3,138.00/tonne, 2026-07-13) while the price-curve file has the more recent USD 3,154.00/tonne (2026-07-17). The synthesis resolved this by carrying the **most current exchange print (2026-07-17)** — the two are consistent with a market that dipped to a four-month low in early July and then stabilised, not a data conflict.

---

## What Would Change This Read

The synthesis did not publish a formal upgrade/downgrade trigger table; the observable items it named that would change or complete the structure read are:

- **Full LME curve beyond 3 months.** The 15-month and 27-month LME prices could not be retrieved (LME.com blocked the request). Backwardation is confirmed only for cash-versus-3-month; whether it persists further out is unconfirmed. Retrieving those points would confirm or break the tightness read.
- **A fresh Midwest-premium print.** The instruments file's "premium ≈ 63% of the LME base price" pairs a December 2025 Platts premium with a July 2026 LME price — a seven-month gap. A current Midwest premium is needed before that relationship is cited as live.
- **Supply/demand and positioning data.** IAI production, China smelter-cap data, and LME COTR / SHFE positioning were named as reachable but not pulled in this pass — they belong to other lenses and should be confirmed there before relying on a full picture.
- A **re-widening of the cash–3-month spread** back toward the May ~USD 59/tonne level would re-signal acute physical tightness; further normalisation toward flat or into contango would remove the roll tailwind.

---

## Bottom Line

- **Structure read:** price consolidating in the low-USD-3,000s (cash USD 3,154.00/tonne, 2026-07-17); mild backwardation of +USD 7.50/tonne (~+0.95% a year) [`02_commodity-price-curve.md`].
- **Could look better than it seems:** LME stocks are still down ~one-third from January 2026 (~420,000 t → ~284,600 t), a genuinely tight physical buffer [`00_commodity-triage.md`].
- **Could look worse than it seems:** the tightness signal has largely faded — the curve inversion collapsed from ~USD 59/tonne (May peak) to +USD 7.50/tonne, so the roll pickup is thin and the recent move is an ~18% unwind off a geopolitical spike, not a fresh uptrend.
- **What is missing:** the LME curve beyond 3 months, a current Midwest premium, and supply/demand plus positioning data.
- **Watch next:** the cash–3-month spread — whether it re-widens (tightening) or drifts to flat/contango (loosening) — and warehouse-stock direction.

---

## Plain-English Glossary

- **Cash vs 3-month price:** the price for metal today versus the price for delivery in three months.
- **Backwardation:** when today's price is higher than the later price — often a sign that metal is tight right now. Its opposite is **contango** (later price higher than today's).
- **Roll / roll pickup / roll drag:** a futures holder who wants to stay long must repeatedly sell the expiring contract and buy a later one. In backwardation the holder is paid a little to do this (a "pickup," here ~+0.95% a year); in contango it costs them (a "drag").
- **Curve / term structure:** the set of prices for the same metal at different future delivery dates.
- **ETN (exchange-traded note):** a note that tracks a price but is really an unsecured loan to the issuer (here Barclays Bank PLC) — so it carries **issuer credit risk**, the chance the issuer fails to pay.
- **Correlation (99.86%):** how closely two prices move together; near 100% means they move almost identically.
