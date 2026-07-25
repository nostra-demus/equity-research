# Earnings Module Memo — TSLA

**Verdict: Mixed earnings setup** — revenue is growing again (Q2 2026 +25.5% year-on-year) but operating profit keeps shrinking (operating margin down to 1.41% in the quarter), so "record revenue" and "healthy earnings" are two different questions and the second answer is negative.

Memo date: 2026-07-25

---

## Scores at a Glance

All scores are out of 100. "Inverted" means higher is worse.

| Measure | Score | Notes |
|---|---|---|
| Earnings quality | 58/100 | Mixed/average [`06_earnings-quality.md`] |
| Consensus setup | 50/100 | Higher = more beatable (the bar the market has set) [`04_guidance-consensus.md`] |
| Earnings volatility | 68/100 | **Inverted — higher is worse.** High band [`07_earnings-sensitivity.md`, §7] |
| Next-quarter setup | Balanced | Read as balanced-to-cautious: 2 High-likelihood miss scenarios vs. 0 High-likelihood beat scenarios [`05_beat-miss-setup.md`] |

- **Red-flag agent's overall severity verdict (verbatim): "Material concerns."** 0 Critical flags, 12 High, 24 Medium [`08_earnings-red-flags.md`, §5].
- **Score caps applied: none.** Every standard cap was tested; the data pool is genuinely sufficient. Remaining gaps (no dollar-sized order backlog, no segment operating-cost split, no standalone audited FY2025 annual report) are informational, not the kind that force a numeric cap [Synthesis §4].
- **§24 Avoid-Big-Risks filters: none tripped as a hard verdict-lock.** Leverage is low — net debt (total debt minus cash) of $861M by 30-Jun-2026 against trailing EBITDA of $10,849M is roughly 0.08x, far below the 3.0x trigger; neither the debt-level nor the debt-growth trigger fires [Synthesis §5b].

---

## What This Module Found

- Tesla's earnings are splitting in two directions at once. Revenue re-accelerated to +25.5% year-on-year in Q2 2026 — a fourth straight beat — while operating profit (EBIT, earnings before interest and tax) keeps falling: EBIT margin went from 16.8% in FY2022 to 4.6% in FY2025 to 1.41% in Q2 2026 alone [`01_historical-financials.md`, §1-2].
- The single biggest driver of the margin decline is a locked-in stock-based-compensation ramp (SBC — pay given to staff in shares rather than cash, which still costs shareholders) tied to the 2025 CEO Performance Award. It alone caused about half of the quarter's margin drop and carries $105.8bn–$120.4bn of further unrecognized expense in tranches "not yet deemed probable" — meaning another margin step-up can hit with little warning [`03_margin-drivers.md`, §9; `06_earnings-quality.md`, §4].
- The biggest risk is that this stock-comp overhang collides with an unresolved question about the Q2 delivery recovery (480,126 units, +25% year-on-year): it may be a genuine new demand peak, or just a bounce-back off a trough dug by the federal EV tax-credit expiration (30-Sep-2025), which likely pulled demand forward into Q3 2025 and hollowed out the two quarters after [`02_revenue-drivers.md`, §6; `07_earnings-sensitivity.md`, §5].
- Day-to-day earnings are mostly clean and cash-backed — operating cash flow has beaten 85% of GAAP EBITDA every year for five years and deferred revenue keeps growing, so there is no sign of manufactured revenue or a collections problem [`06_earnings-quality.md`, §1, §9]. But reported net income was boosted twice in under three years by one-off, non-operating items: a $5,927M tax benefit in FY2023, and in Q2 2026 a $1,005M SpaceX stock-gain plus a $274M California tax benefit — so the GAAP headline flatters the underlying trend [`06_earnings-quality.md`; Synthesis §5 Quality Check].
- The market's bar is roughly fair but not settled: revenue estimates keep being raised while profit estimates keep being cut (normalized earnings-per-share cut 10.7% for FY2026 and 14.8% for next quarter in the last month), and even a month after the print the balance of revisions is still net-negative on every profit line — the Street itself is not done cutting [`04_guidance-consensus.md`, §4-5, §7].

## The Specialists, Briefly

- **earnings-data-triage** — Sufficient, no active data caps: the standalone audited FY2025 annual report is absent, but the company's own update letters and vendor export stand in without triggering a cap.
- **historical-financials** — Revenue inflecting up, margins decelerating: revenue was -2.9% in FY2025 then +25.5% in Q2 2026; net cash shrank from $8.7bn (FY2021) to $861M net debt by 30-Jun-2026.
- **revenue-drivers** — Improving, but recovering from a policy-driven air pocket: deliveries are ~71% of revenue; the rebound follows the EV tax-credit expiration, so it is "recovering from a trough, not yet a proven new peak."
- **margin-drivers** — The EBIT-margin decline is an operating-cost story, not a gross-margin story: the whole -269bps drop traces to R&D and SG&A growing about twice as fast as revenue, with the stock-comp ramp (-126bps) the single biggest piece.
- **guidance-consensus** — Bar is fair but split by line: Tesla gives no point guidance; revenue estimates raised every window, profit estimates cut hard, revisions still net-negative on every profit line.
- **beat-miss-setup** — Setup is balanced: the revenue bar sits against a policy-distorted high base; the stock-comp/operating-cost ramp is the single biggest risk that could flip it toward "favors miss."
- **earnings-quality** — 58/100, mixed: cash generation solid, but GAAP net income twice materially boosted by one-off items, and days-sales-outstanding (how long cash takes to collect) is rising while revenue falls.
- **earnings-sensitivity** — Volatility 68/100 (High, inverted): foreign-exchange is the largest single swing ($1.64bn per 10% move, unhedged); three of six tested variables are one-directional headwinds with no offsetting upside.

**Most important reconciliation the synthesis resolved:** whether the revenue rebound is genuine demand or a one-quarter bounce is "not resolved" by the data (`01`/`02`), while `05` rates the beat streak "moderate-to-high" confidence. The synthesis treats these as two different questions — demand durability vs. support for the beat pattern — and adopts the more conservative framing: the beat streak is real and driver-backed, but the demand base under it is not yet proven durable. On the vendor-vs-company operating-income gap for Q3/Q4 2025, it uses the company's own figures per the source hierarchy and flags the ~$238M/quarter difference as unexplained, not dropped.

## What Would Change This Read

**Would upgrade it:**
- Balance of profit-line revisions (EBITDA, EBIT, EPS) turns net-positive — signaling the estimate reset is complete.
- A quantified order-backlog figure that confirms delivery growth is demand-led, not battery-capacity-capped normalization.
- Two straight quarters of EBIT margin stabilizing or improving without one-off help.

**Would downgrade it:**
- A new CEO Performance Award milestone becomes "probable," triggering a fresh stock-comp step-up from the $105.8bn–$120.4bn unrecognized pool [High-severity flag #6].
- Q3 2026 deliveries undershoot the already-lowered consensus base, confirming the Q3 2025 peak was pulled-forward demand [High-severity flags #1, #3, #4].
- The Robotaxi/FSD securities-fraud litigation produces an adverse ruling or disclosure that dents the Services/FSD growth narrative [High-severity flags #5, #12].

**Data that would settle it:** the Q3 2026 print and call (21-Oct-2026); any interim filing on CEO Performance Award milestone-probability determinations; a quantified backlog disclosure; docket developments in the Autopilot/FSD/Robotaxi securities case [Synthesis §7].

## Bottom Line

- Verdict stands: **Mixed earnings setup** — record revenue and healthy earnings are two separate questions, and the earnings answer is currently negative.
- Biggest reason it could be better than it looks: revenue growth is real and broad-based — record deliveries, +62% year-on-year in smaller international markets, Services/FSD up 50% year-on-year — with no sign of manufactured revenue or a collections crisis [`02_revenue-drivers.md`, §4, §6].
- Biggest reason it could be worse: the $105.8bn–$120.4bn unrecognized stock-comp pool can step margins down again with no formal guidance to warn the market — the one-off-aided-beat-then-quality-miss pattern already happened once (Q1 2026 EPS beat +17.14% on a ~$230M one-off, then Q2 2026 EPS missed -38.9%) [`04_guidance-consensus.md`, §6; `05_beat-miss-setup.md`, §5].
- What evidence is missing: a dollar- or unit-sized order backlog. Management calls it "the largest since 2023" but never sizes it — it is the central, unverifiable pillar of the bull case for continued delivery growth [Medium-severity flag #15].
- One thing to watch next: whether a new CEO Performance Award milestone crosses the "probable" threshold, and whether Q3 2026 deliveries hold up against a distorted year-ago base.

## Plain-English Glossary

- **EBIT / operating margin** — profit from running the business, before interest and tax, as a share of revenue.
- **EBITDA** — earnings before interest, tax, and non-cash charges for wear-and-tear; a rough cash-profit proxy.
- **Stock-based compensation (SBC)** — pay given to staff in shares instead of cash; still a real cost because it dilutes existing shareholders.
- **Net debt** — total debt minus cash on hand; here a small $861M, i.e. debt barely exceeds cash.
- **Consensus / the bar** — the average of analysts' estimates the company is measured against each quarter.
- **Earnings per share (EPS)** — profit divided by the number of shares; "normalized" strips out one-off items, "GAAP" is the official reported figure.
- **Days-sales-outstanding (DSO)** — how many days it takes to collect cash after a sale; rising is worse.
