# Market Structure Module Memo — COPPER

**Verdict (module read, from the synthesis):** Copper trades at ~$13,202/t (LME cash, ~613¢/lb COMEX) as of 2026-07-02 — up 30–38% year-on-year but 9% below the January 29, 2026 record of $14,527.50/t and 6% off the early-June high. The near-term picture is a soft consolidation inside a wide $12,000–$14,500/t range with no proven new leg up, and the futures curve is now in **contango** (later-dated contracts priced higher than the front). For a rolled long position, that contango costs roughly **−5% per year** in "roll drag" (the loss from selling the cheaper expiring contract and buying the pricier next one); on top of CPER's ~0.97% annual fee that is a total drag of about **6% per year vs spot** in a flat market. Cleanest instrument: **COMEX HG front-month futures** if direct futures access exists; CPER is the practical fallback with a structural cost.

Memo date: 2026-07-02.

---

## Scores at a Glance

This is a market-structure module (price, curve, instruments). The synthesis carries **no numeric /100 scores, no §24 filter trips, and no score caps** — it delivers factual reads and a plumbing note for the thesis module, not a scored verdict. What the synthesis does carry:

| Item | Reading (from synthesis) |
|---|---|
| Spot level (LME cash, 2026-07-02) | ~$13,202/t (~613¢/lb COMEX) |
| Year-on-year price move | +30–38% |
| Position in 52-week range | ~66% (near mid-band) |
| Curve shape (LME cash-to-3M) | Contango, ~−$36 to −$94/t |
| Curve shape (COMEX HG term structure) | Contango, front-to-Dec '26 premium ~$0.15/lb |
| Roll drag (rolled long, annualised) | Approximately −5% |
| CPER total holding drag vs spot | Approximately −6% per year (roll drag + 0.97% fee) |
| CPER long-run gap vs spot since inception | ~21 percentage points cumulatively |
| Data sufficiency note | Deferred COMEX settles, LME spread, LME daily warehouse stocks, SHFE price, and CFTC COT detail are only partially sourced (see "What's Missing") |

Score caps: none applied (module has no scored verdict). §24 Avoid-Big-Risks filters: none tripped.

---

## What This Module Found

The 12-month direction is sharply higher (up 30–38% from a July 2025 range of $9,535–$10,120/t), but the story inside 2026 is peaks-and-reversals: the January 29, 2026 record ($14,527.50/t) fell back to a $12,499/t monthly average by April as US tariff uncertainty weighed, a second surge to $14,097/t on May 29 faded through the June 30 US tariff-decision date, and price is now clustering at $13,300–$13,400/t. [02_commodity-price-curve.md] The 50-day moving average (~$13,967/t) now sits **above** the current price, which is the technical signature of near-term softening; the 200-day (~$12,800/t) is still below current, so the cushion is there but narrower. [Barchart COMEX HGU26 technical data, 2026-07, unverified web]

The single most important change vs earlier in the year is the curve shape. The LME cash-to-3M spread was in deep backwardation (later prices lower than cash — a sign of prompt tightness) as recently as 2026-06-23 (+$345/t) as metal was pulled toward the US ahead of tariff deadlines; it has since flipped to contango at roughly −$36 to −$94/t on 2026-07-02. [MetalRadar citing LME, 2026-07-02, unverified web; SMM/metal.com citing LME, 2026-06-23, unverified web] Contango is consistent with heavy inventories: COMEX warehouses are at a record ~652,000 t, and combined LME+COMEX+SHFE visible stocks exceed 1 million tonnes — the highest since 2004. [02_commodity-price-curve.md] Ample near-term supply has removed the prompt squeeze, and the market is pricing normal cost of carry.

The single most important risk to a bull thesis on the metal: contango imposes a real recurring cost on any rolled long. Front-to-Sep is a ~$0.05/lb premium (≈−4.9% annualised drag) and front-to-Dec is a ~$0.15/lb premium (≈−5.9% annualised drag), so a rolled COMEX long loses roughly 5% per year to the roll alone. Through CPER, add the 0.97% fee for a total drag near 6% per year vs spot — the price needs to appreciate ~6% just to break even in a flat market. [02_commodity-price-curve.md]

---

## The Specialists, Briefly

- **00 Commodity Triage** — Set the module baseline: spot ~$13,170/t as of 2026-07-01; cited the ICSG projection of a **2026 refined copper surplus of ~96,000 mt** (swung from a prior 150,000 mt deficit); flagged CFTC managed-money net long ~66,547 contracts as of 2026-06-23. [00]
- **01 Commodity Instruments** — Mapped the instrument set (LME cash/3M, COMEX HG + E-mini QC / Micro MHC, CPER, COPX, FCX, SHFE CU) with costs and divergences from LME spot; noted a fleeting +$345/t LME backwardation on 2026-06-23. [01]
- **02 Commodity Price & Curve** — The primary source for today's curve reading: LME cash ~$13,202/t; COMEX HG contango (Jul '26 ~613¢, Sep '26 ~618¢, Dec '26 ~628¢, Mar '27 ~643¢); LME cash-to-3M at −$36 to −$94/t contango; roll drag ~−5% annualised. [02]

**Most important reconciliation the synthesis flagged:** the instruments file (01) referenced both the June 23 backwardation spike and a July 16 backwardation figure; the price-curve specialist (02) reads today's shape as contango. The synthesis resolved this in favour of the price-curve specialist — LME briefly went backwardated around June 23, then flipped back to contango by July 2; the July 16 figure is treated as unverified and forward-looking and does **not** change today's read. Current shape: contango.

---

## What Would Change This Read

The synthesis does not carry a formal upgrade/downgrade table (no verdict to move). It does name the specific events that would flip the curve read — the load-bearing input into the thesis — and the ones that would confirm or break the trend:

- **Contango → backwardation flip.** If new US tariffs on refined copper trigger another wave of frontloading, the prompt LME market could tighten and the cash-to-3M spread could narrow toward backwardation, reducing roll drag and improving rolled-long economics. The **Goldman Sachs scenario cited in 02** — phased 15%/30% US tariffs in Jan 2027 / Jan 2028 — is the primary trigger to watch.
- **Break of the range floor.** A decisive move below **$12,147/t** (the April 2, 2026 LME cycle low — the "tariff washout" support) would break the current $12,000–$14,500/t band to the downside. [Zamak.us LME monthly data, 2026-04, unverified web]
- **Clean break of the near-term pivot.** A sustained move through **$13,371/t** (LME 3M close, June 24, 2026) with the 50-day (~$13,967/t) rolling back under price would be the technical signature of a fresh leg up. [TradingKey citing LME close, 2026-06-24, unverified web]
- **Fundamentals swing.** A change in the ICSG 2026 balance away from the current ~96,000 mt surplus (back toward deficit) would be a headline pressure change; this is the supply/demand module's territory, flagged here as context.

---

## Bottom Line

- **Verdict of the module:** Trend is up over 12 months (+30–38% YoY) but softening in the near term (below the 50-day MA, ~9% below the January record, 6% off the June high); curve is in contango with ~−5% annualised roll drag.
- **Reason it could be better than it looks:** A tariff-driven prompt squeeze could re-flip the curve to backwardation (as happened as recently as June 23), collapsing roll drag and improving rolled-long economics.
- **Reason it could be worse than it looks:** The ICSG points to a **~96,000 mt refined surplus for 2026** (a swing from a prior projected deficit), combined stocks are at 2004 highs (over 1 million tonnes across LME+COMEX+SHFE), and a rolled long needs ~6% price gain per year via CPER just to break even in a flat tape.
- **What evidence is missing:** exact CME settlements for Sep, Dec '26 and Mar '27 (currently web-aggregated Google Finance quotes); LME cash-to-3M spread confirmation against official LME settlement; daily LME warehouse lot counts; SHFE price and the LME–SHFE arb; full CFTC COT positioning detail.
- **One thing to watch next:** the LME cash-to-3M spread — is it still contango, and by how much? That single number changes whether a rolled long copper position costs you ~5%/year or pays you.

---

## Plain-English Glossary

- **LME cash / 3M forward** — LME cash is the "spot" price for immediate metal at the London Metal Exchange; the 3M forward is the agreed price for delivery three months out. The difference between them tells you whether prompt metal is tight or plentiful.
- **Contango** — the futures curve where later-dated contracts trade **higher** than the front / spot. It's the normal shape when there's no prompt shortage; it's costly for someone who is long via futures because each roll (see below) sells the cheap expiring contract and buys the pricier next one.
- **Backwardation** — the opposite of contango: later-dated contracts trade **lower** than spot. It signals prompt tightness; a rolled long benefits because each roll sells the pricier expiring contract and buys the cheaper next one.
- **Roll / roll drag** — a futures holder who wants continuous exposure sells the expiring contract and buys the next one; "roll drag" is the built-in loss of doing that in contango, expressed here as an annual percentage.
- **Front month / deferred contract** — the front month is the nearest-expiry futures contract (most liquid); deferred are later expiries (Dec '26, Mar '27, etc.).
- **COMEX HG / LME Copper Grade A** — COMEX HG is the New York copper futures contract (quoted in US¢/lb); LME Copper Grade A is the London benchmark (quoted in $/t). Prices track each other but can diverge on tariff and shipping arbitrage.
- **LME–COMEX arb / basis** — the price gap between the two exchanges. Normally $50–200/t; can widen sharply on tariff shocks.
- **CPER** — a US-listed exchange-traded fund that holds COMEX copper futures for investors who don't have direct futures access. Carries a 0.97% annual fee, uses a "smart-roll" method to reduce (not eliminate) roll drag, and issues a K-1 tax form.
- **COPX / FCX** — COPX is an ETF of ~46 copper-mining stocks; FCX is Freeport-McMoRan, a single mining stock. Both are **equity** plays — they add operating leverage and stock-market risk on top of the copper price, so a 10% copper move can be 20–30%+ in COPX.
- **SHFE** — Shanghai Futures Exchange copper contract, denominated in Chinese yuan; not directly accessible to non-PRC investors.
- **Open interest / average daily volume** — open interest is the total number of futures contracts outstanding (a depth-of-market gauge); average daily volume is how many change hands per day (a liquidity gauge).
- **50-day / 200-day moving average** — the average closing price over the last 50 (or 200) trading days; used here purely as a rough trend reference — 50-day above current is the standard signature of near-term softening, price above 200-day is the standard signature of a medium-term uptrend.
- **ICSG surplus / deficit** — the International Copper Study Group's estimate of refined-copper supply minus demand for the year. Surplus means more supply than use (a price headwind); deficit means the opposite.
- **CFTC COT / managed-money net long** — the US futures regulator's weekly report of who holds futures positions. "Managed-money net long" is how much more speculative funds are long than short — a crowded-positioning gauge.
