# Commodity Swarm — Module Rules

Operating rules for every agent in the commodity swarm. These sit ON TOP of the root `CLAUDE.md`
(which always wins where it is stricter, §23) and the swarm manifest `SWARM.md`. They do not repeat
the constitution; they adapt it to commodities.

---

## 1. What we are analysing

The unit of work is a **commodity** (gold, sugar, …), not a company. There are no filings. The job is
to read the drivers that actually move the price — supply/demand and its buffer, weather/seasonality,
macro (rates/USD/real yields/policy), positioning/flows, and the futures curve — and land on an honest
action verdict for the exposure the portfolio holds (or could hold).

The per-commodity specifics — which lenses apply, the instruments, the priority sources, the recurring
reports — live in `frameworks/commodity/COMMODITY_PROFILES.md`. Read the `## <COMMODITY>` section first
and apply ONLY the lenses it marks relevant. Do not force a real-yield analysis onto sugar or a monsoon
analysis onto gold.

## 2. Source hierarchy for commodities (refines §4)

Most trusted to least, for commodity facts:

1. Official statistical bodies and balances — USDA (WASDE/FAS/NASS), World Gold Council, LBMA, ISO,
   UNICA, Conab, IMD, EIA, IEA, OPEC.
2. Exchanges and settlement data — ICE, CME/COMEX, LME, MCX (prices, curves, warehouse stocks).
3. Regulatory positioning data — CFTC Commitments of Traders; ETF/ETC issuer holdings disclosures.
4. Macro/rates/FX primary data — FRED, US Treasury (TIPS/real yields), the Fed and other central banks.
5. Recognised data vendors, dated and labelled — Platts/S&P Global, Argus, Bloomberg, Reuters.
6. Reputable dated web sources, labelled unverified.
7. Inference, labelled as such.

When sources conflict, take the more conservative reading and prefer the official balance over a
vendor estimate (§4). Cite the source the number actually came from (§5) — never attach a vendor number
to an official body's name.

## 3. Citation (§5, adapted)

Every material figure is cited `[Source, period/contract, date]`, e.g. `[USDA WASDE, 2026-06, 2026-06-12]`,
`[WGC Gold Demand Trends Q1-2026]`, `[CFTC COT, 2026-06-24]`, `[FRED DFII10, 2026-06-30]`, `[ICE #11 front,
settle 2026-06-30]`. A web quote with no primary equivalent is dated and labelled unverified. Bare
"market data" or "analysts say" is banned.

## 4. Units, currency, and time (§15/§27, adapted)

- State the quote unit and currency every time (USD/oz for gold; US¢/lb for ICE #11 raw sugar; ₹/quintal
  for Indian domestic sugar). Never mix units without conversion.
- Give the as-of date for every price and every stock/flow reading. A commodity price is only as good
  as its timestamp.
- Distinguish **spot / front-month / deferred** and **the physical commodity vs the instrument** (an
  ETF/ETC has fees and roll drag — CANE is not raw sugar, GLD is not spot gold).

## 5. Action discipline (the verdict)

The terminal `commodity-thesis` module emits ONE `Action:` verdict — `Buy`, `Hold`, `Trim`, `Avoid`, or
`Research More` — matching the `SWARM.md` routing contract exactly. Rules:

- Do not force a Buy (§18/§24). Survival over return: prefer `Avoid`/`Trim` to owning a bad setup.
- `Research More` is the honest default when a module came back Insufficient or a key series (balance,
  positioning) could not be reached — never paper over a gap with false confidence (§1/§11).
- A commodity thesis is `Commodity-conditional` (§14): it depends on external drivers, so conviction is
  capped — say what it depends on and what would flip it.

## 6. Banned phrases (adds to §21)

Unless paired with a specific cited number in the same sentence, do not write: "prices should rise",
"supportive backdrop", "tight fundamentals", "well supported", "poised to rally", "structural bull
market", "safe haven" (as an assertion), "supply crunch". Replace each with the cited figure that
would justify it, or drop it.

## 7. Weather and forecasts

Weather is a RISK to the balance, not a certainty. State the current observed condition (with the met
agency + date) and the range of outcomes — never present a seasonal forecast as a settled fact. ENSO
(El Niño/La Niña) signals are probabilistic; label them so.
