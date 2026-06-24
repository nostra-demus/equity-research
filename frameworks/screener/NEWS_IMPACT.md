# News-Impact Estimation — sizing the move a news item justifies

A tiered method for sizing the price move a single news item *justifies on fundamentals* — measured against the real consensus and forward multiples where those feeds exist, self-anchored where they do not. It converts a headline into a change in fundamental value, classifies how durable that change is, turns it into a value, divides by the company's market cap, and compares the **implied** move to the **observed** one.

It sits inside the screener's `candidate-surfacing` module (the first place tickers — and therefore a company's market cap, earnings and multiple — exist). It is owned by `screener-news-impact-sizing` and consumed by `screener-candidate-synthesis`.

The root `CLAUDE.md` and `.claude/agents/screener/SWARM.md` apply in full; the stricter rule wins. This spec leans on: §4 (source hierarchy), §5 (citation format), §10 (probability/return math), §15 (accounting hygiene — FCF, net debt, basis points), §16 (valuation discipline — the multiple judgment is the analyst's, not the screen's), §21 (plain English, jargon glossed in place), §24 filter 4 (M&A is charged its opportunity cost), §27 (jurisdiction, currency, fiscal year).

**Plain-English note.** Terms are kept and glossed on first use (§21):
- **market cap** (market capitalisation — the value of all the company's shares: price × share count).
- **ΔValue** — the news-driven change in the company's fundamental value, in the company's own currency.
- **capitalise** — turn a recurring yearly profit into a single value today, here by multiplying it by the company's own earnings multiple.
- **forward multiple** — the price the market pays today per unit of *next year's* expected earnings (e.g. a 20× forward P/E, or an EV/EBITDA on next-year EBITDA).
- **NPV** (net present value) — today's worth of a stream of future cash, after discounting each year back at a required rate of return.
- **cost of equity** — the annual return shareholders require to hold the stock; estimated with CAPM, which raises that required return as the stock's beta (its sensitivity to the market) rises.
- **consensus** — the average of sell-side analysts' published forecasts; **dispersion** is how far apart those forecasts are (wide dispersion = a contested base).
- **re-rate** — the market decides to pay a higher or lower multiple for the *same* earnings.
- **EPS** (earnings per share — net profit ÷ fully-diluted share count, §15).

---

## 0. Operating mode — the data-availability gate

Before sizing anything, check for two feeds and pick the mode. This gate is the framework's pivot.

1. **Consensus forward estimates** — the current forward earnings/EBITDA base, ideally with revision history and dispersion.
2. **Forward valuation multiples** — the current and historical forward P/E or EV/EBITDA, with a peer/sector band.

Both are routinely already gathered upstream by `screener-market-implied` (M0.6.2) — read that report first; do not re-fetch (CLAUDE.md §2).

**Primary mode — both feeds available.** Measure the impact against external anchors, not a self-anchored guess:
- **ΔEstimate** is taken against the *actual consensus* forward base (E₀) — so the denominator is the market's real expectation. Dispersion flags how contested that base is.
- The **forward multiple** anchors the capitalisation: a permanent step-change is capitalised at the *forward* multiple (not an implied trailing one). The analyst may additionally assess a justified **ΔMultiple** against the historical/peer band — reintroducing the re-rating term the single-criterion method drops. Implied upside is then the full `(1 + ΔE)(1 + ΔM) − 1`, not the `ΔE`-only identity.

**Fallback mode — either feed unavailable** (no programmatic feed, no sell-side coverage, restricted-licence data — common for smaller Indian listings). Run the single-criterion method (§§1–8). It self-anchors the multiple from market cap ÷ current earnings, holds the multiple constant, and reduces the estimate to `ΔValue / Market Cap`. This is a deliberate degradation — it loses the consensus base and the re-rating term, and reads as a fundamentals **floor** (§7), not a full estimate. Record which mode ran and why (the missing feed is the `missing_reason`, per the manifest's `candidate_surfacing` sources policy).

The recurrence taxonomy (§2) governs the value conversion in **both** modes. The modes differ only in the anchor: real consensus base + an explicit re-rating term (primary) vs. a self-anchored, multiple-held-constant floor (fallback).

---

## 1. The criterion (fallback mode)

One number governs the screen:

```
Implied move ≈ ΔValue / Market Cap
```

The move a news item justifies equals the news-attributable change in fundamental value it implies, divided by current market cap. There is no sentiment score and no separate multiple term — the multiple is held constant, so the equity moves one-for-one with the change in fundamental value, in the company's own currency.

Formally, price = multiple (M) × estimate (E). Holding M constant, `ΔPrice / Price = ΔE / E` — so once the estimate change is expressed correctly, the percentage change in fundamental value *is* the implied percentage price move.

---

## 2. The core mechanic — convert flow to value

Market cap is a **stock** (a level). An earnings estimate is usually a **flow** (an amount per period). The two cannot be divided until the news-driven earnings change is converted into a value. That conversion is the whole framework, and it is governed by the **recurrence** of the event.

**Recurrence taxonomy:**

- **One-off event** — a single, non-repeating cash impact (a settlement, an asset-sale gain, a one-time charge). `ΔValue = after-tax cash amount.` No capitalisation. (Where it changes the cash or debt line, label the net-debt basis per §15 — strict / broad / gross-liquidity.)
- **Permanent step-change** — a durable shift in the earnings base (a structural margin change, a permanently won or lost stream of business). Capitalise the annual after-tax earnings delta at the company's *own* multiple — the forward multiple in primary mode, the self-anchored market-cap ÷ current-earnings multiple in fallback. Because the multiple is held constant, this collapses to the identity in §1: the percentage revision to earnings is the implied percentage move.
- **Finite-life event** — a fixed-term economic stream (an order or contract executed over a defined number of periods). **NPV** the incremental after-tax earnings over the life of the stream at the cost of equity. Do **not** capitalise at the multiple.

The recurrence call is the pivot: the same headline figure differs by an order of magnitude depending on whether it is treated as a finite stream or a permanent run-rate.

**Acquisitions are a special case — charge the opportunity cost (CLAUDE.md §24 filter 4).** When the sized event is an acquisition, do **not** book only the acquired earnings stream as positive ΔValue. The acquired stream is usually a permanent step-change, but the deal must be charged its opportunity cost: net the cash and new debt the buyer deployed against the ΔValue (and label the resulting net-debt basis per §15 — strict / broad / gross-liquidity), and flag in caveats any business divested under deal pressure, the capital tied up, and the focus/options foregone. Bare "synergies / strategic fit" language is not evidence. Where the consideration is undisclosed or the opportunity cost cannot be charged, mark the event `not_applicable` with that reason rather than booking one-sided upside.

---

## 3. Estimation recipe (same sequence in both modes)

1. **Quantify the event** from the primary source — the order value, volume × price change, cost change, or customer/share shift. Cite the local filing (§5/§27): a SEBI LODR quarterly result / exchange intimation or annual-report Note for an Indian issuer, an 8-K / 10-Q for a US issuer.
2. **Translate to revenue** — strip pass-through items (indirect taxes like GST the company collects but does not keep) so the figure is revenue actually recognised.
3. **Apply incremental after-tax margin** — the business's *actual* post-tax margin on this stream, not a generic one. Margin structure varies enormously by business type (§24-aware: a thin-margin order-driven builder ≠ a high-margin franchise).
4. **Get the annual after-tax earnings delta** (ΔE per year).
5. **Convert to value** — capitalise (permanent) or NPV (finite) or take the after-tax cash (one-off), per §2.
6. **Divide by market cap** (fallback) — or, in primary mode, express ΔE against the consensus base and add the justified ΔMultiple: `(1 + ΔE)(1 + ΔM) − 1`.

For an **acquisition** event, before step 6 net the consideration deployed and charge the opportunity cost per §2 (§24 filter 4): the ΔValue is the acquired stream's value *minus* the cash/new debt paid, not the gross acquired earnings.

State the FX date and rate for any cross-currency event (§15/§27): the period-end rate for a balance-sheet item, the period-average rate for an income-statement flow. If a filing already states the home-currency (₹) equivalent, use it verbatim — do not re-derive it.

---

## 4. Datasets required

Deliberately light — dropping the multiple-change term in fallback removes most heavy data needs:
- Current market cap (price × fully-diluted shares, with the share-count source stated, §15) — the agent fetches it from the exchange / a dated market-data quote (`01_ticker-mapping` names the ticker and exchange but does **not** carry a market cap).
- The current earnings base (net income / EPS, or EBITDA on EV terms) — the forward base in primary mode.
- Company financials sufficient to anchor incremental margin and the tax rate.
- The quantified news event (the signal + its source filing).
- A discount rate (cost of equity) — finite-life cases only.
- *Primary mode only:* the consensus base + dispersion and the forward/peer multiple band — read from `02_market-implied` (M0.6.2); do not re-fetch.

---

## 5. Calibration rules and common errors

**The duration trap — the single largest source of error.** Capitalising a finite-life stream at the full earnings multiple treats a few-period cash stream as a perpetuity, overstating value by a large factor. The error grows as the stream shortens and the multiple richens. A finite stream is worth the NPV of its periods; only a permanent change earns the multiple. Misclassifying recurrence is where the answer breaks. Run the trap check explicitly on every finite-life event.

**Revenue discipline.** Strip pass-through taxes before counting revenue; a gross, tax-inclusive headline overstates the earnings base.

**Margin discipline.** Use the operating business's real after-tax margin (§15: reported vs adjusted separated; margin moves in basis points). A thin-margin order book and a high-margin franchise produce very different value from the same headline.

**Discount-rate sensitivity.** For short-dated finite streams the discount rate barely moves the answer. Use a CAPM cost of equity (rises with beta) to keep it defensible, and recognise it only begins to bite for long-dated streams and perpetuities, where the terminal-growth assumption then dominates.

---

## 6. Scope and blind spots — by design

The framework captures the change in **estimates**, never the change in **multiple** (in fallback). It therefore systematically *under-reads* two situations:
- **Optionality / narrative re-rates** — news with no quantifiable near-term earnings impact (early-stage developments, regime or addressable-market signals). The estimate change is ~zero, so the framework scores it ~0 *by omission*; any observed move is a multiple/optionality event the metric cannot see.
- **Momentum re-rates in order-driven businesses** — where the market values a new order as a *signal* of sustained inflow and revenue visibility, not as the NPV of one contract's own (often thin) margin. The framework returns the contract's fundamental value; the balance of the move is a re-rate it excludes.

In both, the symptom is the same — **observed move much larger than implied** — and the diagnosis is the same: the value being priced lives in the multiple, which fallback mode deliberately excludes (primary mode's ΔMultiple term is where the analyst can put it back, against the peer/own-history band — never invented).

---

## 7. Reading the output — a fundamentals floor, not a verdict

The number is a floor, not a recommendation. It does **not** change the thesis routing or the edge score, and it issues no price target (CLAUDE.md §16; the screener's "no price targets" rule). The multiple judgment is handed back to the human and the research swarm — that is the division of labour: the screen computes the mechanical, defensible earnings impact; the human adjudicates the re-rate.

| Read | What it means | Screener gap-read |
| --- | --- | --- |
| **Observed ≈ implied** | The move is an earnings story; the news looks fairly priced. | `priced` — lower screener priority |
| **Observed ≫ implied** | The move is *not* explained by the event's own earnings. The gap is a re-rating to judge separately — sustained inflow, regime change, optionality. | `re_rate_to_judge` — feed the variant-perception / mispricing reasoning |
| **Observed ≪ implied** | The market may not yet have priced a quantifiable, material earnings change. | `underpriced_candidate` — flag for research |

When there is no directly-affected listed company with a quantifiable event and an observable price reaction (a diffuse macro / policy / commodity signal), the read is `not_applicable` with an honest reason — the framework sizes a *company's* news, not a sector mood.

---

## 8. The swing input

For any quantified event, the field that moves the output most is **not the headline size** — it is the **recurrence classification: one-time / finite build vs. ongoing run-rate.** The same figure differs by an order of magnitude across that boundary. That classification, drawn from the source filing, is where rigour must concentrate.

---

## 9. Worked example (illustrative — numbers invented to show the mechanic, not a real claim)

An Indian engineering company, market cap ₹40,000 crore (1 crore = 10 million), forward P/E ~22×, cost of equity ~12%. It announces a new order: ₹5,000 crore of revenue to be executed over 3 years `[illustrative: Q2 FY26 results (SEBI LODR), NSE intimation]`. Its segment after-tax margin on such work is ~8% `[illustrative: FY25 Annual Report (Ind AS), segment note]`.

- Annual revenue ≈ ₹5,000 cr ÷ 3 = ₹1,667 cr/yr. After-tax earnings delta **ΔE ≈ ₹133 cr/yr** (8%).
- **Recurrence call: finite-life** (a 3-year contract, not a permanent run-rate). NPV at 12% over 3 years ≈ ΔE × annuity-factor(3 yr, 12% ≈ 2.40) ≈ **₹320 cr**.
- **Implied move ≈ ₹320 cr ÷ ₹40,000 cr ≈ 0.8%.**
- **Duration-trap check:** wrongly capitalising ₹133 cr at the 22× forward multiple (treating the order as permanent) gives ₹2,926 cr → 7.3% — roughly **9× the correct figure**. The recurrence call, not the ₹5,000 cr headline, is what moves the answer.

If the stock actually moved ~6% on the news, observed ≫ implied → `re_rate_to_judge`: the market is pricing sustained order inflow or a re-rate, which the framework hands to the analyst.

---

## Wiring into the screener

- **Owner:** `screener-news-impact-sizing` — `.claude/agents/screener/candidate-surfacing/03_news-impact-sizing.md`, `layer: 3` (after `01_ticker-mapping` and `02_expression-ranking`; before `99_candidate-surfacing-synthesis`). Auto-discovered by the module glob — no engine wiring (CLAUDE.md §26).
- **Inputs:** `01_ticker-mapping.md` (ticker + exchange — it does **not** carry a market cap; the agent fetches the dated, fully-diluted market cap itself, §15) + `02_expression-ranking.md` + `thesis_record.json` (REQUIRED; carries the M0.3 beneficiary magnitude). Optional cross-module read (primary mode / to avoid re-fetching): `edge-definition/02_market-implied.md` (forward multiple, consensus, options-implied move).
- **Output:** the agent writes only its `03_news-impact-sizing.md` report (specialists write `.md`; the synthesis writes the canonical JSON). `screener-candidate-synthesis` folds a per-candidate `news_impact` block into `candidates.json` (`frameworks/screener/candidates.schema.json`) and adds a one-line implied-vs-observed read to each deck card.
- **Faithful constraint:** the output is informational. It never mutates `M0_6_6.routing_outcome` or the edge score, and never issues a price target. The re-rate judgment is the analyst's (§7, CLAUDE.md §16).
