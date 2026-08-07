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

**External data (`data/<COMMODITY>/external/<provider>/` — `frameworks/EXTERNAL_DATA.md`).** The user's
paid or collected commodity research — satellite crop analytics, paid ag/energy analytics reports,
broker commodity research, trade-house or field channel checks — enters through the same external-data
lane the research swarm uses, with a `.source.json` provenance sidecar per document. Map it INTO this
hierarchy: a measured/licensed dataset (satellite acreage, paid analytics panel) sits at the
recognised-data-vendor tier (5 above), always labelled estimate-based with the vendor's stated error
margin; broker commodity research is verdict-stripped colour below it; a field channel check or expert
call is a user-collected note, dated, N stated. External data never substitutes an official balance or
exchange print it disagrees with — surface the conflict, conservative reading wins (§4). It CAN be the
edge: a quantified divergence from the official balance, cited with provider + as-of + margin, is
exactly what the thesis synthesis should weigh.

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

## 4a. Driver attribution — show the arithmetic, name the residual (§15)

Commodity theses are driver stories, so this is where the engine is most likely to assert a cause it never
computed. Root §15 requires any driver-attribution claim to print its own arithmetic, carry the sensitivity's
own basis, and state the unexplained residual. In this swarm, write it as ONE line, in this form, every time:

```
Attribution: <driver> <move> × <sensitivity, WITH ITS BASIS> [Source, date]
  = <modelled move in the price's own units> of the <observed move> observed
  → <N>% explained, <100−N>% residual (unattributed).
```

Worked, from the failure this rule exists for:

```
Attribution: 10y REAL yield +50bp × ~1.75% per 25bp — NOMINAL-yield basis [WGC, …]
  = −3.5% ≈ −$196 of the −$1,405 (−25.1%) observed
  → BASIS MISMATCH: this coefficient is not measured on real yields, so it cannot be applied here.
    Even taken at face value it explains ~14%; ~86% is residual. "Tracks almost exactly" is false.
```

Three rules follow, and they bind every commodity agent:

- **The adjective must match the number.** "Accounts for the bulk of", "explains most of", "tracks almost
  exactly" require the printed arithmetic to clear ~50%. Below that, say what it actually explains.
- **A sensitivity carries its basis like a currency figure carries its FX rate.** Nominal vs real yield,
  breakeven, trade-weighted vs bilateral dollar, spot vs forward — name it, and refuse the claim outright
  when the basis does not match the move being explained. Do not silently substitute.
- **A large residual is the finding, not a caveat.** A price mostly unexplained by the named driver means
  the thesis does not yet know what moved it — that caps conviction (§11/§12) and belongs in the risk
  summary, not in a closing hedge sentence.

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
