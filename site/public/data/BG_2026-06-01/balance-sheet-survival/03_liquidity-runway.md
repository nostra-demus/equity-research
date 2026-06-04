# Liquidity Runway — BG

**Company:** Bunge Global SA (NYSE: BG). **Reporting currency:** US$ millions unless noted. **Fiscal year:** ends Dec 31. Latest annual = FY2025 10-K (year ended Dec 31, 2025); latest interim = Q1 2026 10-Q (quarter ended Mar 31, 2026). Liquidity = cash + liquid short-term investments + **committed, undrawn** facilities (MODULE_RULES standard). Uncommitted lines are excluded from the headline and listed separately. FCF = CFO − total capex (CLAUDE.md standard).

**Two flags carried in from upstream that frame this whole read:**
1. **Viterra closed July 2, 2025**, doubling the balance-sheet base; FY2025 CFO collapsed to $844M and FCF turned negative (−$879M), and the latest TTM (to Q1 2026) FCF is −$1,161M [earnings/01, Section 2; 01_capital-structure, line 5]. So the "FCF" leg of the runway is currently negative on a trailing basis — the runway leans almost entirely on in-hand committed liquidity, not on cash generation. This is the central finding.
2. **Upstream `02_maturity-wall-and-refinancing.md` was not available at the time of this run** ("Upstream output missing: 02_maturity-wall-and-refinancing — proceeding with available data"). The next-12-month debt-maturity figure below is therefore taken directly from the FY2025 10-K Contractual Obligations table (the same primary source Agent 02 will use), not reused from Agent 02. When 02 is produced, the synthesizer should confirm the 2026 maturity figure ties to this table.

---

## 1. Liquidity Sources (committed only)

Two dates are shown because liquidity moved materially over the quarter: the March 2026 bond-for-revolver swap (two new fixed tranches issued, proceeds used to repay the $600M revolver draw) left the entire committed revolver undrawn at Q1 2026 [01_capital-structure, line 34; Q1 10-Q, Note 13]. The Q1 2026 column is the live picture.

| Source | Amount (YE2025) | Amount (Q1 2026) | Usable? | Notes | Source |
|---|---:|---:|---|---|---|
| Cash & equivalents | 1,135 | 839 | Y (with caveat) | Predominantly unrestricted, but HoldCo-available cash is **below** the consolidated figure — Bunge is a holding company dependent on upstreamed subsidiary dividends/loans, some op-co cash funds daily futures margin and local working capital [01, Sections 3, 6A; FY25 10-K, Note 17, lines 2956–2960] | FY25 10-K balance sheet line 4768; Q1 10-Q line 187 |
| Restricted cash (excluded from usable) | ~31 | ~8 | N | Small; carved out of the cash figure above per the standard | Q1 10-Q cash reconciliation, lines 290–291, 387 |
| Liquid short-term investments | — | — | — | Not disclosed as a distinct balance-sheet line | FY25 10-K balance sheet |
| Committed revolving credit facilities — total capacity | 9,665 | 9,665 | — | Four facilities: $1.1B 364-day (2026), $3.5B (2028), $4.2B (2030), $865M (2030); all unsecured | FY25 10-K Note 17, lines 2881–2886; Q1 10-Q lines 2264–2273 |
| — less drawn | (600) | (0) | — | $600M drawn at YE2025 (since repaid via March bond issuance) | FY25 10-K Note 17, line 7244; Q1 10-Q line 2273 |
| **Revolver — unused and available committed** | **9,065** | **9,665** | **Y** | Company-stated "unused and available committed borrowing capacity." These are committed bank facilities, not borrowing-base lines — availability IS the headline (no borrowing base, no reserves disclosed). Counted as usable. | FY25 10-K Note 17, lines 2873–2874, 7339; Q1 10-Q line 2264 |
| **Total usable committed liquidity** | **~10,200** | **~10,504** | | Cash + unused committed revolver. See CP carve-out below before treating as fully free. | Computed |

**Commercial paper backstop carve-out (do not double-count):** The CP program ($3.0B capacity; **$300M outstanding at YE2025, $50M at Q1 2026**) requires Bunge to keep same-day unused committed capacity under its long-term facilities **≥ the CP outstanding** [FY25 10-K Note 17, lines 2896–2898; Q1 10-Q lines 2283]. So a slice of the unused revolver equal to CP outstanding is effectively reserved to backstop the CP and cannot be drawn for other uses while CP is outstanding. At Q1 2026 this reserves only $50M of the $9,665M — non-binding. The CP itself is a **funding source already counted inside drawn debt**, not incremental liquidity, so it is not added here.

**Uncommitted / not-counted-as-usable lines (listed separately per the rule):**
- **Commercial paper program** — $3.0B program, $50M outstanding (Q1 2026). CP is an unsecured funding *program*, not a committed facility to Bunge; it can be pulled by the market exactly when needed and is backstopped by (not additive to) the revolver. **Excluded** from usable liquidity. [FY25 10-K Note 17, lines 7274–7275; Q1 10-Q lines 2278–2280]
- **Trade-receivables securitization (BSBV)** — $1.5B program + $1.0B accordion; $1,174M (YE2025) / $1,287M (Q1 2026) of receivables sold and derecognized [FY25 10-K Note 4, lines 3000–3011; Q1 10-Q line 688]. This is a recurring funding structure tied to eligible receivables, not an undrawn committed cash facility, and it already flatters reported CFO/DSO [earnings/06, Section 8]. **Excluded** from usable liquidity; flagged as a funding dependency for Agent 05.
- **Local op-co bilateral bank lines** — the ~$2,983M of "other short-term debt" sits at operating companies on local facilities [01, line 20]; undrawn capacity on these is not disclosed and is typically uncommitted. **Excluded.**

**No minimum-liquidity covenant exists.** Bunge's financial covenants are a minimum current ratio, a maximum debt-to-capitalization ratio, and limits on secured indebtedness [FY25 10-K Note 17, lines 2997–2999] — there is no minimum-cash or minimum-liquidity maintenance requirement to subtract from usable liquidity (contrast the MODULE_RULES hard rule, which applies only where such a covenant exists).

---

## 2. Near-Term Uses (next 12 months)

The most reliable forward 12-month figures come from the FY2025 10-K Contractual Obligations table (the "2026" column), supplemented by FY2026 management guidance for capex and the proposed FY2026 dividend. Currency US$ millions.

| Use | Amount | Source |
|---|---:|---|
| Debt maturities — short-term debt | 3,883 | FY25 10-K Contractual Obligations table, 2026 column, line 3168 |
| Debt maturities — current portion of long-term debt | 1,378 | FY25 10-K Contractual Obligations table, 2026 column (LTD incl. current portion), line 3169 |
| **Subtotal — debt maturing within 12 months (from 10-K maturity table)** | **5,261** | Sum; ties to ST debt $3,883M + 2026 LTD $1,378M. (Agent 02 to confirm) |
| Cash interest — variable-rate obligations (2026) | 106 | FY25 10-K Contractual Obligations table, 2026 column, line 3170 |
| Cash interest — fixed-rate debt (2026) | 299 | FY25 10-K Contractual Obligations table, 2026 column, line 3171 |
| **Subtotal — scheduled interest (next 12 months)** | **405** | Sum. Forward-looking scheduled figure from the 10-K; cleaner than the $628M FY2025 accrued interest *expense* (which includes part-year Viterra debt). Cash interest paid is not separately disclosed [earnings/06, note e] — this scheduled figure is the best proxy. |
| Maintenance (sustaining) capex | ~380 | Q1 2026 sustaining capex $95M annualized [earnings/06, Section 1, note f; Q1 2026 call, lines 175–179]. Total FY2026 capex guided $1.5–1.7bn, but only the non-discretionary/maintenance portion is a true near-term obligation; growth capex is discretionary and can be cut. |
| Committed dividends (proposed FY2026) | ~564 | $2.88/share proposed for FY2026 (up from $2.80), four equal quarterly installments [Q1 10-Q, lines 1556–1558]. ~195.7M diluted shares × $2.88 ≈ $564M. Q1 2026 dividends paid were $136M [Q1 10-Q, line 282]. Treated as committed (long-standing quarterly payer; board has proposed the FY2026 rate). |
| Committed buybacks | 0 | New $3.0B program approved March 9, 2026; $3.2B total authorization remaining at Q1 2026 — but **$0 actually repurchased in Q1 2026** and the program is discretionary/indefinite-term [Q1 10-Q, lines 1543–1546, 2409–2410]. Not a committed near-term cash obligation; excluded. |
| **Total near-term uses (maintenance-capex basis)** | **~6,610** | Sum of the bolded subtotals + maintenance capex + dividends |
| *Memo: total near-term uses on full guided capex* | *~7,790* | *If full $1.6bn FY2026 capex midpoint is treated as a use instead of $380M maintenance: $5,261 + $405 + $1,600 + $564* |

**The dominant use is the $5,261M of debt maturing within 12 months** — 80% of near-term uses. This is overwhelmingly short-term working-capital debt ($3,883M) that funds the seasonal inventory/RMI cycle and is routinely rolled, not term debt amortizing to zero. The maturity-quality split (rollable working-capital lines vs hard-dated bond maturities) is Agent 02's job; this runway treats the full $5,261M as a use, which is the conservative reading.

---

## 3. Runway

| Metric | Value (Q1 2026 basis) |
|---|---:|
| Total usable committed liquidity | ~10,504 (cash $839M + unused committed revolver $9,665M) |
| Annual FCF (trailing, CFO − capex) | **−1,161** (TTM to Q1 2026); −879 (FY2025) [earnings/01, Section 2] |
| Annual FCF (FY2023, pre-Viterra reference) | +2,186 [earnings/01, Section 1] |
| Total near-term uses (Section 2, maintenance-capex basis) | ~6,610 |
| Net near-term obligations (uses − trailing FCF) | ~6,610 − (−1,161) = **~7,771** (trailing FCF is negative, so it *adds* to the cash need) |
| **Liquidity runway (months)** | **~16 months** |

**Formula and read:**
- Runway = total usable committed liquidity ÷ (net near-term cash need ÷ 12). Net near-term cash need ≈ $7,771M over 12 months → ~$648M/month. Runway = $10,504M ÷ $648M ≈ **16.2 months**.
- **But this understates the true position for one structural reason:** the $5,261M of debt maturities is dominated by short-term working-capital debt that finances liquid, hedged RMI inventory (~$11.4bn) which is itself convertible to cash as the seasonal cycle unwinds [01, Section 5; earnings/06, Section 3]. Treating it as a pure cash *outflow* (as the conservative formula above does) is the survival-lens reading; in normal operations it self-liquidates. **The cleaner runway question for this business is: can committed liquidity cover the genuinely non-rollable cash uses?**
- **Non-rollable-uses view:** strip the routinely-rolled $5,261M short-term/current debt and look only at hard cash uses that cannot be deferred — scheduled interest ~$405M + maintenance capex ~$380M + dividends ~$564M = **~$1,349M/year**, against which trailing FCF is −$1,161M (so the operating shortfall plus these fixed charges ≈ $2,510M/year of net cash use if CFO stays at its weak trailing level). Usable committed liquidity of $10,504M covers that for **~50 months (~4 years)**. The honest runway therefore sits in a wide band — **~16 months on the conservative all-maturities-are-cash-uses basis, ~50 months on the non-rollable-uses basis** — and the truth depends on whether the short-term debt keeps rolling, which in turn depends on continued investment-grade access (S&P A-, Moody's Baa1, Fitch BBB+, all stable post-Viterra [01, Section 6A]).
- **Why not a finite "running out of cash" number:** the company is not burning into a finite cash pile on the non-rollable uses — it has $9.7bn of committed bank capacity that is largely untouched. The binding constraint is not cash exhaustion; it is **refinancing access** for the rolling short-term book (Agent 02) and **covenant headroom** (Agent 04), not a 16-month cliff.

### Seasonality / Peak Liquidity Need (Hard Check)

**Working capital IS seasonal — at the cash-flow level — and the peak build is partly disclosed.** Q1 is reliably an operating-cash-outflow quarter as inventory builds for the crop cycle: CFO was **−$285M in Q1 2025 and −$541M in Q1 2026** [earnings/01, Sections 5, 6; Q1 10-Q line 265]. Net debt rose ~$798M from YE2025 to Q1 2026 as the seasonal build was funded with incremental debt, and gross debt rose from $14,051M to $14,553M [01, Section 4]. This is exactly why the revolver and CP exist — to fund the intra-year working-capital swing.

Re-running the runway at the **peak (Q1) cash-usage point** is what the Q1 2026 column above already does: the Q1 2026 figures (cash drawn down to $839M, gross debt up to $14,553M, revolver re-drawn intra-quarter then termed out) are the seasonal-peak snapshot, and even at that point unused committed capacity was $9,665M. So the peak quarter is captured. **What is NOT cleanly disclosed is the full-cycle peak working-capital build in dollar terms for the post-Viterra business** — only the Q1 CFO outflow is visible, and the first clean four-quarter post-Viterra working-capital cycle (FY2026) is not yet complete [earnings/01, Section 5]. **Statement: the single-quarter peak is captured in the Q1 2026 figures, but the full post-Viterra peak working-capital need is not yet disclosed — the runway could be modestly overstated if the intra-FY2026 build exceeds the Q1 swing already seen.**

---

## 4. Sources & Uses Bridge

Internal sources do **not** currently cover the next 12 months on their own: trailing FCF is negative (−$1,161M TTM), so cash generation is not funding obligations — it is consuming cash, driven by the post-Viterra inventory build and elevated growth capex rather than an inability of the base business to self-fund (on a maintenance-capex basis, "maintenance FCF" would be roughly positive — an inference, not from filings [earnings/06, note f]). The next 12 months are therefore covered by **committed liquidity and continued debt rollover, not by FCF**: of the ~$10.5bn usable committed liquidity, only ~$839M is in-hand cash; the remaining ~$9.7bn is undrawn committed revolver capacity that must be *drawn* (it is committed, so access is contractual, not market-dependent — the key strength here), and the ~$5.3bn of maturing short-term debt must be *refinanced/rolled* (market-dependent). So the runway is overwhelmingly "must-materialize/must-access" rather than in-hand: ~8% in-hand cash, ~92% committed-but-undrawn facility capacity, with the separate and larger reliance being on the short-term debt book continuing to roll. External access (the rolling CP and short-term lines, plus the term-out option Bunge used in March 2026) is required to run the business normally; outright survival, however, does not depend on the *unsecured-bond* market reopening within 12 months, because committed bank lines are contractually available.

---

## 5. Liquidity Read

On the conservative survival basis (every maturity treated as a cash use, against negative trailing FCF), the runway is **~16 months**; on the more realistic non-rollable-uses basis it is **~50 months**, because ~$9.7bn of committed, undrawn bank capacity sits behind only ~$1.3bn/year of genuinely non-deferrable fixed charges. The runway depends on two things, in order: (1) the **~$5.3bn short-term/current debt book continuing to roll**, which rests on Bunge keeping investment-grade access (no rating-downgrade acceleration trigger exists, but a downgrade raises cost on ~$7.8bn of floating debt [01, Section 6A]); and (2) **FCF turning back positive in a clean post-Viterra FY2026** — trailing FCF is −$1,161M, so today the runway is carried by committed liquidity, not cash generation. The single biggest liquidity risk is **a stress in which the seasonal RMI/inventory cannot be monetized at carrying value while short-term debt comes due** — i.e., the maturing working-capital debt stops rolling at the same moment the inventory it funds becomes hard to sell at mark; that is the scenario Agent 06 must stress, and it is the same RMI-monetization assumption that underpins management's 1.6x adjusted-leverage figure [01, Section 5].
